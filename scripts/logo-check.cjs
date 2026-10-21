async (page) => {
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.reload();
 const results=[];
 for(const width of [1440,390,320]) {
  await page.setViewportSize({width,height:900});
  const panel=page.locator('.bridge-project-note');
  await panel.scrollIntoViewIfNeeded();
  await panel.screenshot({path:`output/playwright/anthill-panel-${width}.png`});
  results.push(await panel.evaluate(e=>({width:innerWidth,client:e.clientWidth,scroll:e.scrollWidth,logo:e.querySelector('img')?.getAttribute('src'),loaded:e.querySelector('img')?.naturalWidth>0,pixelSvg:e.querySelector('svg')!==null})));
 }
 await page.setViewportSize({width:1440,height:1000});
 await page.emulateMedia({reducedMotion:'no-preference'});
 return results;
}
