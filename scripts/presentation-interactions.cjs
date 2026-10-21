async (page) => {
 const errors=[],warnings=[],external=[];
 const onError=e=>errors.push(e.message);
 const onConsole=m=>{if(['warning','error'].includes(m.type()))warnings.push(m.text());};
 const onRequest=r=>{if(!r.url().startsWith('http://localhost:4174')&&!r.url().startsWith('data:'))external.push(r.url());};
 page.on('pageerror',onError);page.on('console',onConsole);page.on('request',onRequest);
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.setViewportSize({width:1440,height:1000});
 await page.goto('http://localhost:4174/');
 await page.waitForFunction(()=>document.querySelector('.hero-links')&&getComputedStyle(document.querySelector('.hero-links')).opacity==='1');
 await page.evaluate(()=>document.fonts.ready);
 await page.getByRole('link',{name:'Explore our worlds',exact:true}).hover();
 await page.screenshot({path:'output/playwright/studio-hero-final.png'});
 const stages=[];
 for(const index of [1,2,0]){
  const button=page.locator('.sc-stage-navigation button').nth(index);await button.click();
  stages.push({name:await button.textContent(),selected:await button.getAttribute('aria-pressed'),copy:await page.locator('.sc-stage-details h3').textContent()});
 }
 const invitations=[];
 for(const name of ['I create worlds','Let’s collaborate','I have a story']){
  const tab=page.getByRole('tab',{name:new RegExp(name)});await tab.click();invitations.push({name,selected:await tab.getAttribute('aria-selected'),email:await page.locator('.pc-invitation-panel:not([hidden]) a').getAttribute('href')});
 }
 await page.getByRole('tab',{name:/I have a story/}).focus();await page.keyboard.press('ArrowDown');
 const keyboardTab=await page.getByRole('tab',{selected:true}).textContent();
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.scrollTo(0,0));
 await page.getByRole('button',{name:'Open navigation'}).click();
 await page.screenshot({path:'output/playwright/studio-menu-mobile.png'});
 await page.getByRole('navigation',{name:'Mobile navigation'}).getByRole('link',{name:/Our craft/}).click();
 const menuClosed=await page.getByRole('navigation',{name:'Mobile navigation'}).count()===0;
 await page.getByRole('button',{name:'Open navigation'}).click();await page.keyboard.press('Escape');
 const escapeClosed=await page.getByRole('navigation',{name:'Mobile navigation'}).count()===0;
 await page.getByRole('tab',{name:/Let’s collaborate/}).click();
 await page.screenshot({path:'output/playwright/studio-contact-mobile.png'});
 await page.emulateMedia({reducedMotion:'reduce'});await page.reload();await page.locator('#contact').waitFor();
 const reduced=await page.evaluate(()=>({hero:getComputedStyle(document.querySelector('.hero-cinema-image')).animationName,spark:getComputedStyle(document.querySelector('.hero-spark')).animationName}));
 const widths=[];
 for(const width of [320,360,390,768,1024,1366,1440,1920]){
  await page.setViewportSize({width,height:900});widths.push(await page.evaluate(()=>({width:innerWidth,client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,clipped:[...document.querySelectorAll('h1,h2,h3,h4,p,figcaption,button')].filter(e=>e.getClientRects().length&&e.clientWidth>0&&e.scrollWidth>e.clientWidth+3).map(e=>e.textContent.slice(0,50))})));
 }
 await page.setViewportSize({width:1440,height:1000});
 for(const id of ['story','worlds','approach','model','people','contact']) await page.locator('#'+id).scrollIntoViewIfNeeded();
 await page.waitForFunction(()=>[...document.images].every(i=>i.complete));
 const content=await page.evaluate(()=>({brokenImages:[...document.images].filter(i=>!i.naturalWidth).map(i=>i.src),corruptedText:document.body.innerText.includes(String.fromCharCode(0xfffd)),hasGames:!!document.querySelector('canvas,.gm-shell,[aria-label*="game mode"]'),proposalWording:document.body.innerText.match(/\b(proposal|infuse|SPV|equity|investor|financing)\b/gi),displayFont:document.fonts.check('700 16px Oxanium'),bodyFont:document.fonts.check('500 16px "Space Grotesk"'),contactFont:getComputedStyle(document.querySelector('.pc-contact-link')).fontFamily,portraits:[...document.querySelectorAll('.pc-portrait img')].map(i=>i.getAttribute('src'))}));
 const brokenAnchors=await page.evaluate(()=>[...document.querySelectorAll('a[href^="#"]')].filter(a=>a.hash&&!document.getElementById(a.hash.slice(1))).map(a=>a.hash));
 await page.screenshot({path:'output/playwright/studio-full-final.png',fullPage:true});
 await page.evaluate(()=>window.scrollTo(0,0));await page.emulateMedia({reducedMotion:'no-preference'});await page.reload();
 page.off('pageerror',onError);page.off('console',onConsole);page.off('request',onRequest);
 return {stages,invitations,keyboardTab,menuClosed,escapeClosed,brokenAnchors,content,reduced,widths,external,errors,warnings};
}
