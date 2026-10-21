async (page) => {
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await page.locator('#contact').waitFor();await page.evaluate(()=>document.fonts.ready);
 const results=[];
 for(const width of [320,360,390,768,1024,1440,1920]){
  await page.setViewportSize({width,height:900});results.push(await page.evaluate(()=>({width:innerWidth,client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,clipped:[...document.querySelectorAll('h1,h2,h3,h4,p,figcaption,button,[role="tab"]')].filter(e=>e.getClientRects().length&&e.clientWidth>0&&e.scrollWidth>e.clientWidth+3).map(e=>({class:e.className,text:e.textContent.slice(0,55),client:e.clientWidth,scroll:e.scrollWidth})),small:[...document.querySelectorAll('main *,header *,footer *')].filter(e=>e.getClientRects().length&&getComputedStyle(e).display!=='none'&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&parseFloat(getComputedStyle(e).fontSize)<11).map(e=>({text:e.textContent.slice(0,50),size:getComputedStyle(e).fontSize}))})));
 }
 await page.setViewportSize({width:1440,height:1000});await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:'output/playwright/v3-hero-desktop.png'});
 for(const id of ['story','worlds','approach','model','people','contact']){await page.locator('#'+id).scrollIntoViewIfNeeded();await page.screenshot({path:`output/playwright/v3-${id}-desktop.png`});}
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:'output/playwright/v3-hero-mobile.png'});
 for(const id of ['story','worlds','approach','model','people','contact']){await page.locator('#'+id).scrollIntoViewIfNeeded();await page.screenshot({path:`output/playwright/v3-${id}-mobile.png`});}
 return results;
}
