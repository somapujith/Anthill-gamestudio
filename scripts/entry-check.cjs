async page => {
 const assert=(v,m)=>{if(!v)throw Error(m)};
 const origin=new URL(page.url()).origin;
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const results=[];
 await page.emulateMedia({reducedMotion:'no-preference'});
 for(const width of [390,1440]){
  await page.setViewportSize({width,height:900});
  await page.goto(origin,{waitUntil:'domcontentloaded'});
  await page.locator('.studio-intro').waitFor();
  const started=Date.now();
  await page.waitForTimeout(700);
  const initial=await page.evaluate(()=>{const mark=document.querySelector('.intro-anthill img').getBoundingClientRect();return {center:mark.x+mark.width/2,inert:document.querySelector('.site-shell').inert,source:document.querySelector('.intro-anthill img').getAttribute('src')};});
  assert(Math.abs(initial.center-width/2)<4,'Intro mark not centered');
  assert(initial.inert&&initial.source.endsWith('.svg'),'Intro is not using protected sharp branding');
  await page.waitForTimeout(Math.max(0,2100-(Date.now()-started)));
  assert(await page.locator('.intro-game-studios').evaluate(e=>Number(getComputedStyle(e).opacity)>.99),'Intro wordmark did not reveal');
  await page.waitForTimeout(Math.max(0,4450-(Date.now()-started)));
  const handoff=await page.locator('.intro-anthill').evaluate(e=>({scale:new DOMMatrix(getComputedStyle(e).transform).a,top:e.getBoundingClientRect().top}));
  await page.screenshot({path:`output/playwright/visual-pass/intro-handoff-${width}.png`});
  await page.waitForFunction(()=>!document.querySelector('.studio-intro'),null,{timeout:2000});
  const duration=Date.now()-started;
  assert(duration>=4700&&duration<5500,`Intro duration drifted: ${duration}`);
  await page.locator('.pixel-logo[data-ready="true"]').waitFor();
  assert(await page.evaluate(()=>!document.querySelector('.site-shell').inert&&document.body.style.overflow!=='hidden'),'Intro left app locked');
  results.push({width,duration,handoff,vectorSource:initial.source});
 }
 for(const method of ['skip','escape','reduce']){
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto(origin,{waitUntil:'domcontentloaded'});
  await page.locator('.studio-intro').waitFor();
  if(method==='skip')await page.getByRole('button',{name:/Skip intro/}).click();
  if(method==='escape')await page.keyboard.press('Escape');
  if(method==='reduce')await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForFunction(()=>!document.querySelector('.studio-intro'));
  assert(await page.evaluate(()=>!document.querySelector('.site-shell').inert&&document.body.style.overflow!=='hidden'),`${method} left app locked`);
 }
 assert(errors.length===0,errors.join('\n'));
 return {results,skip:'passed',escape:'passed',liveReducedMotion:'passed',errors};
}
