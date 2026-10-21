async (page) => {
 const errors=[]; const warnings=[];
 const errorHandler = e => errors.push(e.message);
 const consoleHandler = m => {if(m.type()==='warning'||m.type()==='error') warnings.push(m.text());};
 page.on('pageerror',errorHandler); page.on('console',consoleHandler);
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.setViewportSize({width:1440,height:1000});
 await page.goto('http://localhost:5174/');
 await page.waitForFunction(()=>getComputedStyle(document.querySelector('.hero-actions')).opacity==='1');
 await page.screenshot({path:'output/playwright/desktop-motion-hero.png'});
 const motion=await page.evaluate(()=>({pixels:document.querySelectorAll('.fx-pixel').length,ambient:getComputedStyle(document.querySelector('.fx-pixel')).animationName,ticker:getComputedStyle(document.querySelector('.ticker-track')).animationName,gameControls:document.querySelectorAll('[aria-label*="game mode"],.gm-shell,canvas').length}));
 const dialogs=[];
 for(const name of ['Pixel legends','Mumbai nights','Mythic futures']){
  const card=page.getByRole('button',{name:`Explore the ${name} creative direction`});
  await card.click();
  await page.getByRole('dialog').waitFor({state:'visible'});
  dialogs.push(await page.getByRole('dialog').getAttribute('aria-labelledby'));
  await page.keyboard.press('Escape');
  await page.getByRole('dialog').waitFor({state:'detached'});
 }
 const faq=page.getByRole('button',{name:'How does the co-creation model work?'});
 await faq.click();
 const faqOpen=await faq.getAttribute('aria-expanded');
 await faq.click();
 const faqClosed=await faq.getAttribute('aria-expanded');
 await page.setViewportSize({width:390,height:844});
 await page.evaluate(()=>window.scrollTo(0,0));
 await page.getByRole('button',{name:'Open navigation'}).click();
 const menuOpen=await page.getByRole('navigation',{name:'Mobile navigation'}).isVisible();
 await page.getByRole('navigation',{name:'Mobile navigation'}).getByRole('link',{name:'Our story'}).click();
 const menuClosed=await page.getByRole('navigation',{name:'Mobile navigation'}).count()===0;
 await page.getByRole('button',{name:'Explore the Pixel legends creative direction'}).click();
 await page.screenshot({path:'output/playwright/mobile-concept-detail.png'});
 const dialogBounds=await page.getByRole('dialog').evaluate(e=>({client:e.clientWidth,scroll:e.scrollWidth}));
 await page.getByRole('button',{name:'Close world details'}).click();
 await page.locator('#people').scrollIntoViewIfNeeded();
 await page.screenshot({path:'output/playwright/mobile-people-corrected.png'});
 const badAnchors=await page.evaluate(()=>[...document.querySelectorAll('a[href^="#"]')].filter(a=>a.hash&&a.hash!=='#'&&!document.getElementById(a.hash.slice(1))).map(a=>a.hash));
 await page.setViewportSize({width:1440,height:1000});
 await page.evaluate(()=>window.scrollTo(0,0));
 page.off('pageerror',errorHandler);page.off('console',consoleHandler);
 return {motion,dialogs:dialogs.length,faqOpen,faqClosed,menuOpen,menuClosed,dialogBounds,badAnchors,errors,warnings};
}
