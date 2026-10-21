async (page) => {
  const assert=(condition,message)=>{if(!condition)throw new Error(message);};
  const origin=new URL(page.url()).origin;
  const results=[];
  await page.emulateMedia({reducedMotion:'no-preference'});
  for(const width of [390,768,1440]){
    await page.setViewportSize({width,height:900});
    await page.goto(origin,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>!!document.querySelector('.hero'),null,{polling:'raf'});
    const frames=await page.evaluate(()=>new Promise(resolve=>{
      const samples=[],started=performance.now();
      const tick=()=>{
        samples.push([...document.querySelectorAll('.hero-title-line>span')].map(e=>{
          const style=getComputedStyle(e),matrix=new DOMMatrix(style.transform);
          return {opacity:Number(style.opacity),y:matrix.f,rotation:Math.abs(matrix.b)+Math.abs(matrix.c),inlineTransform:e.style.transform};
        }));
        if(performance.now()-started<1600)requestAnimationFrame(tick);else resolve(samples);
      };
      requestAnimationFrame(tick);
    }));
    assert(frames.every(frame=>frame.length===3),'Hero headline lost a line');
    assert(frames.every(frame=>frame.every(line=>line.y>=-.1&&line.y<=28.1&&line.rotation<.001)),`Hero text rotates or jumps through its mask at ${width}`);
    for(let line=0;line<3;line++){
      assert(frames.slice(1).every((frame,index)=>frame[line].opacity>=frames[index][line].opacity-.01),`Hero text flashes during reveal at ${width}`);
      assert(frames.at(-1)[line].opacity===1&&frames.at(-1)[line].inlineTransform==='',`Hero text never settles at ${width}`);
    }
    const text=await page.locator('.hero-title').innerText();
    assert(text.includes('STORIES')&&text.includes('WORTH')&&text.includes('PLAYING.'),'Hero headline is incomplete');
    await page.screenshot({path:`output/playwright/hero-text-${width}-fixed.png`});
    results.push({width,frames:frames.length,final:frames.at(-1)});
  }
  return results;
}
