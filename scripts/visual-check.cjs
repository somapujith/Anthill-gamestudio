async (page) => {
 await page.reload();
 await page.evaluate(() => document.fonts.ready);
 await page.screenshot({path:'output/playwright/mobile-hero-updated.png'});
 console.log('VIEWPORT AUDIT', await page.evaluate(() => ({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,small:[...document.querySelectorAll('body *')].filter(e=>e.getClientRects().length && e.childNodes.length&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&parseFloat(getComputedStyle(e).fontSize)<11).map(e=>({tag:e.tagName,text:e.textContent.slice(0,80),size:getComputedStyle(e).fontSize}))})));
 await page.getByRole('button',{name:'Enter game mode',exact:true}).click();
 await page.getByRole('dialog').waitFor();
 await page.screenshot({path:'output/playwright/mobile-game-ready.png'});
}
