async (page) => {
  const assert=(condition,message)=>{if(!condition)throw new Error(message);};
  const origin=new URL(page.url()).origin;
  const errors=[];
  const onError=e=>errors.push(e.message);
  page.on('pageerror',onError);
  const results=[];
  await page.emulateMedia({reducedMotion:'no-preference'});
  for(const width of [320,390,768,1440]){
    await page.setViewportSize({width,height:900});
    await page.goto(origin,{waitUntil:'domcontentloaded'});
    await page.locator('.studio-intro').waitFor();
    const started=Date.now();
    await page.waitForTimeout(800);
    const initial=await page.evaluate(()=>{
      const logo=document.querySelector('.intro-anthill img').getBoundingClientRect();
      return {center:logo.left+logo.width/2,viewport:innerWidth,studioVisibility:getComputedStyle(document.querySelector('.intro-game-studios')).visibility,siteMounted:!!document.querySelector('.site-shell'),logo:document.querySelector('.intro-anthill img').getAttribute('src')};
    });
    assert(Math.abs(initial.center-width/2)<3,`Intro logo is not centered at ${width}: ${initial.center}`);
    assert(initial.studioVisibility==='hidden'&&!initial.siteMounted,'Website or companion text revealed too early');
    assert(initial.logo==='/assets/official-logo.webp','Intro does not use the supplied official logo');
    await page.screenshot({path:`output/playwright/intro-${width}-centered.png`});
    await page.waitForTimeout(Math.max(0,2100-(Date.now()-started)));
    const revealed=await page.evaluate(()=>{
      const logo=document.querySelector('.intro-anthill img').getBoundingClientRect();
      const companion=document.querySelector('.intro-game-studios').getBoundingClientRect();
      const shiny=document.querySelector('.shiny-text');
      return {logoCenter:logo.left+logo.width/2,logoLeft:logo.left,studioRight:companion.right,studioOpacity:Number(getComputedStyle(document.querySelector('.intro-game-studios')).opacity),gradient:getComputedStyle(shiny).backgroundImage,fill:getComputedStyle(shiny).webkitTextFillColor};
    });
    assert(revealed.logoCenter<initial.center-15,'Logo did not move aside');
    assert(revealed.logoLeft>=-1&&revealed.studioRight<=width+1,`Intro lockup clips at ${width}: ${JSON.stringify(revealed)}`);
    assert(revealed.studioOpacity>.99&&revealed.fill==='rgba(0, 0, 0, 0)','Shiny studio text did not reveal');
    await page.screenshot({path:`output/playwright/intro-${width}-shining.png`});
    await page.waitForTimeout(120);
    const gradient=await page.locator('.shiny-text').evaluate(e=>getComputedStyle(e).backgroundImage);
    assert(gradient!==revealed.gradient,'ShinyText gradient is not animating');
    await page.waitForFunction(()=>!document.querySelector('.studio-intro'),null,{polling:'raf',timeout:2500});
    const duration=Date.now()-started;
    assert(duration<4000,`Shortened intro exceeds four seconds: ${duration}ms`);
    await page.locator('.hero-art-frame').waitFor();
    assert(await page.evaluate(()=>document.body.style.overflow!=='hidden'),'Intro left scrolling locked');
    results.push({width,initial,revealed:{...revealed,gradient:undefined},duration});
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.reload();
  await page.locator('.hero').waitFor();
  assert(await page.locator('.studio-intro').count()===0,'Reduced motion still shows the intro');
  assert(await page.locator('.hero-reveal-curtain').evaluate(e=>getComputedStyle(e).display==='none'),'Reduced motion still covers the hero');
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.reload({waitUntil:'domcontentloaded'});
  await page.getByRole('button',{name:/Skip intro/}).click();
  await page.locator('.hero').waitFor();
  assert(await page.locator('.studio-intro').count()===0,'Skip intro failed');
  await page.reload({waitUntil:'domcontentloaded'});
  await page.locator('.studio-intro').waitFor();
  await page.keyboard.press('Escape');
  await page.locator('.hero').waitFor();
  assert(await page.locator('.studio-intro').count()===0,'Escape did not skip the intro');
  page.off('pageerror',onError);
  assert(!errors.length,`Browser errors: ${errors.join('; ')}`);
  return {results,reducedMotion:true,skip:true,escape:true,errors};
}
