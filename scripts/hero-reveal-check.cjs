async (page) => {
  const assert=(condition,message)=>{if(!condition)throw new Error(message);};
  const origin=new URL(page.url()).origin;
  const sample=duration=>page.evaluate(duration=>new Promise(resolve=>{
    const frames=[],started=performance.now();
    const tick=()=>{
      const frame=document.querySelector('.hero-art-frame');
      const curtain=document.querySelector('.hero-reveal-curtain');
      const image=document.querySelector('.hero-cinema-image');
      frames.push({time:performance.now()-started,scale:new DOMMatrix(getComputedStyle(curtain).transform).a,clip:getComputedStyle(frame).clipPath,imageReady:image.complete&&image.naturalWidth>0,opacity:Number(getComputedStyle(image).opacity)});
      if(performance.now()-started<duration)requestAnimationFrame(tick);else resolve(frames);
    };
    requestAnimationFrame(tick);
  }),duration);
  const verify=(frames,label)=>{
    const increases=frames.slice(1).map((frame,index)=>frame.scale-frames[index].scale);
    const intermediate=frames.filter(frame=>frame.scale>.02&&frame.scale<.98);
    assert(Math.max(...increases)<.005,`${label}: reveal closes again or flashes`);
    assert(new Set(frames.map(frame=>frame.clip)).size===1&&frames[0].clip.startsWith('polygon('),`${label}: artwork mask changes during reveal`);
    assert(intermediate.length>10,`${label}: reveal snaps without intermediate frames`);
    assert(frames.every(frame=>frame.imageReady||frame.scale>.999),`${label}: reveal starts before image is loaded`);
    assert(frames.every(frame=>frame.opacity===1),`${label}: image opacity flashes`);
    assert(frames.at(-1).scale<.005,`${label}: curtain did not finish opening`);
    return {label,frames:frames.length,intermediateFrames:intermediate.length,unloadedFramesCovered:frames.filter(frame=>!frame.imageReady).length,finalScale:frames.at(-1).scale};
  };
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.setViewportSize({width:1440,height:900});
  const delayImage=async route=>{await page.waitForTimeout(5500);await route.continue();};
  await page.route('**/assets/mumbai.webp',delayImage);
  await page.goto(origin,{waitUntil:'domcontentloaded'});
  await page.locator('.hero-art-frame').waitFor();
  const results=[verify(await sample(4300),'delayed image')];
  assert(results[0].unloadedFramesCovered>0,'Slow-image path was not exercised');
  await page.unroute('**/assets/mumbai.webp',delayImage);
  for(const width of [390,768,1440]){
    await page.setViewportSize({width,height:900});
    await page.goto(origin,{waitUntil:'domcontentloaded'});
    await page.getByRole('button',{name:/Skip intro/}).click();
    await page.locator('.hero-art-frame').waitFor();
    results.push(verify(await sample(2300),`${width}px`));
  }
  await page.goto(origin,{waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/Skip intro/}).click();
  await page.locator('.hero-art-frame').waitFor();
  await page.waitForTimeout(800);
  await page.screenshot({path:'output/playwright/hero-wipe-in-progress.png'});
  await page.waitForTimeout(1600);
  await page.screenshot({path:'output/playwright/hero-wipe-finished.png'});
  return results;
}
