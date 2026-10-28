async page => {
  const assert=(v,m)=>{if(!v)throw new Error(m)};
  const browser=page.context().browser();
  const origin=new URL(page.url()).origin;
  const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
  const fallback=await context.newPage();
  const errors=[];
  fallback.on('pageerror',e=>errors.push(e.message));
  fallback.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  await fallback.addInitScript(()=>{
    const original=HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext=function(type,...args){return type.startsWith('webgl')?null:original.call(this,type,...args)};
  });
  await fallback.goto(origin,{waitUntil:'networkidle'});
  await fallback.waitForTimeout(500);
  const logo=fallback.locator('.pixel-logo-fallback');
  assert(await logo.evaluate(e=>e.complete&&e.naturalWidth>0&&getComputedStyle(e).opacity==='1'),'Logo fallback missing');
  assert(await fallback.locator('.gradient-ascii-container').evaluate(e=>getComputedStyle(e,'::before').backgroundImage!=='none'),'Aurora fallback missing');
  await fallback.screenshot({path:'output/playwright/hero-fallback.png'});
  assert(errors.length===0,errors.join('\n'));
  await context.close();
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width:1440,height:900});
  await page.goto(origin,{waitUntil:'networkidle'});
  await page.locator('.pixel-logo[data-ready="true"]').waitFor();
  await page.locator('.gradient-ascii-container[data-ready="true"]').waitFor();
  await page.evaluate(()=>{
    window.heroExtensions=[...document.querySelectorAll('.hero-scene canvas')].map(c=>c.getContext('webgl2').getExtension('WEBGL_lose_context'));
    window.heroExtensions.forEach(e=>e.loseContext());
  });
  await page.locator('.pixel-logo[data-ready="false"]').waitFor();
  await page.locator('.gradient-ascii-container[data-ready="false"]').waitFor();
  await page.waitForTimeout(600);
  assert(await page.locator('.pixel-logo-fallback').evaluate(e=>getComputedStyle(e).opacity==='1'),'Context loss fallback missing');
  await page.evaluate(()=>window.heroExtensions.forEach(e=>e.restoreContext()));
  await page.locator('.pixel-logo[data-ready="true"]').waitFor();
  await page.locator('.gradient-ascii-container[data-ready="true"]').waitFor();
  return {webGLUnavailable:'logo and aurora fallback visible',contextLoss:'fallback visible',contextRestoration:'both renderers recovered',errors};
}
