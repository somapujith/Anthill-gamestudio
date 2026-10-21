async (page) => {
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const errors = [];
  const onError = error => errors.push(error.message);
  page.on('pageerror', onError);
  const sizes = [{width:390,height:844},{width:768,height:1024},{width:844,height:390},{width:1024,height:600},{width:1366,height:768},{width:1920,height:1080}];
  const selectors = '[data-entrance],.pc-reveal,.sc-principle,.cv-content>h3,.cv-content>p';
  const results = [];
  await page.emulateMedia({reducedMotion:'no-preference'});
  for (const size of sizes) {
    await page.setViewportSize(size);
    await page.goto(new URL(page.url()).origin);
    await page.waitForFunction(() => { const links = document.querySelector('.hero-links'); return links && getComputedStyle(links).opacity === '1'; });
    await page.evaluate(() => document.fonts.ready);
    const initial = await page.locator(selectors).evaluateAll(elements => ({count:elements.length,hidden:elements.filter(e => Number(getComputedStyle(e).opacity) < .1).length}));
    assert(initial.hidden > 10, `Missing scroll entrances at ${size.width}x${size.height}`);
    if (size.width === 390) {
      await page.getByRole('button',{name:'Open navigation'}).click();
      const start = await page.evaluate(() => scrollY);
      await page.mouse.move(20,30);
      await page.mouse.wheel(0,800);
      await page.waitForTimeout(650);
      const end = await page.evaluate(() => scrollY);
      assert(Math.abs(end-start)<2, `Open mobile menu lets background scroll: ${start} -> ${end}`);
      const links = page.locator('#mobile-navigation a');
      await links.last().focus(); await page.keyboard.press('Tab');
      assert(await page.getByRole('button',{name:'Close navigation'}).evaluate(e => e===document.activeElement), 'Menu Tab trap failed');
      await page.keyboard.press('Shift+Tab');
      assert(await links.last().evaluate(e => e===document.activeElement), 'Menu reverse Tab trap failed');
      await page.keyboard.press('Escape');
    }
    const distance = await page.evaluate(() => document.documentElement.scrollHeight-innerHeight);
    for (let y=0; y<=distance+size.height; y+=size.height*.65) {
      await page.evaluate(y=>window.scrollTo(0,y),y);
      await page.waitForTimeout(60);
    }
    await page.waitForTimeout(1600);
    const completed = await page.locator(selectors).evaluateAll(elements=>elements.filter(e=>Number(getComputedStyle(e).opacity)<.99).map(e=>({class:e.className,opacity:getComputedStyle(e).opacity,top:Math.round(e.getBoundingClientRect().top),text:e.textContent.slice(0,60)})));
    assert(!completed.length, `Unfinished entrances at ${size.width}x${size.height}: ${JSON.stringify(completed)}`);
    const layout = await page.evaluate(()=>({
      overflow:document.documentElement.scrollWidth>innerWidth,
      clipped:[...document.querySelectorAll('header *,main *,footer *')].filter(e=>e.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})&&!e.closest('[aria-hidden="true"]')&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())).flatMap(e=>{
        const r=e.getBoundingClientRect();
        const textOverflow=[...e.childNodes].filter(n=>n.nodeType===3&&n.textContent.trim()).some(n=>{
          const range=document.createRange();range.selectNodeContents(n);
          return [...range.getClientRects()].some(text=>text.left<r.left-3||text.right>r.right+3);
        });
        return (r.left < -2 || r.right > innerWidth+2 || textOverflow)?[e.textContent.slice(0,65)]:[];
      }),
      cinemaPosition:getComputedStyle(document.querySelector('.cinema-sticky')).position,
      progress:new DOMMatrix(getComputedStyle(document.querySelector('.motion-reading-line')).transform).a,
    }));
    assert(!layout.overflow&&!layout.clipped.length, `Animated layout fails at ${size.width}x${size.height}: ${JSON.stringify(layout)}`);
    assert(layout.progress>.99,'Reading progress did not reach the end');
    assert(layout.cinemaPosition===(size.width>900&&size.height>=700?'sticky':'relative'),'Incorrect cinema mode for viewport');
    for (const selector of ['.hero','#story','.cinema-sticky','.craft-connection','.cv-intro','#world-01','#world-02','#world-03','#approach','#model','#people','#contact','.site-footer']) {
      await page.locator(selector).evaluate(e=>window.scrollTo(0,e.getBoundingClientRect().top+scrollY));
      await page.waitForTimeout(120);
      await page.screenshot({path:`output/playwright/audit-${size.width}x${size.height}-${selector.replace(/[^a-z0-9-]/gi,'')}.png`});
    }
    results.push({size,animatedElements:initial.count,initiallyHidden:initial.hidden,layout});
  }
  page.off('pageerror',onError);
  assert(!errors.length,`Browser errors: ${errors.join('; ')}`);
  return {results,errors};
}
