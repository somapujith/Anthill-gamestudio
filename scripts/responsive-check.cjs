async (page) => {
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('http://localhost:5174/');
 await page.evaluate(() => document.fonts.ready);
 const results=[];
 for (const width of [320,360,390,768,1024,1440]) {
  await page.setViewportSize({width,height:900});
  results.push(await page.evaluate(() => ({
   width:innerWidth, client:document.documentElement.clientWidth, scroll:document.documentElement.scrollWidth,
   tooSmall:[...document.querySelectorAll('main *,header *,footer *')].filter(e=>e.getClientRects().length&&getComputedStyle(e).display!=='none'&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&parseFloat(getComputedStyle(e).fontSize)<11).map(e=>({text:e.textContent.slice(0,45),size:getComputedStyle(e).fontSize})),
   clipped:[...document.querySelectorAll('h1,h2,h3,p,.eyebrow,.person-info,.bridge-coordinate,.story-eyebrow')].filter(e=>e.getClientRects().length&&e.scrollWidth>e.clientWidth+3&&e.clientWidth>0).map(e=>({text:e.textContent.slice(0,65),scroll:e.scrollWidth,client:e.clientWidth})),
   brokenImages:[...document.images].filter(e=>e.complete&&!e.naturalWidth).map(e=>e.src)
  })));
 }
 await page.setViewportSize({width:1440,height:1000});
 await page.screenshot({path:'output/playwright/desktop-final-full.png',fullPage:true});
 for (const id of ['worlds','story','approach','model','people','contact']) {
  await page.locator('#'+id).scrollIntoViewIfNeeded();
  await page.screenshot({path:`output/playwright/desktop-${id}.png`});
 }
 await page.setViewportSize({width:390,height:844});
 await page.evaluate(()=>window.scrollTo(0,0));
 await page.screenshot({path:'output/playwright/mobile-final-hero.png'});
 for (const id of ['worlds','story','approach','model','people','contact']) {
  await page.locator('#'+id).scrollIntoViewIfNeeded();
  await page.screenshot({path:`output/playwright/mobile-${id}.png`});
 }
 return results;
}
