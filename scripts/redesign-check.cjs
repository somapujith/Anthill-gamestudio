async (page) => {
  const errors = [], failedRequests = [], results = { widths: [], stages: [], invitations: [] };
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  page.on('pageerror', error => errors.push(error.message));
  page.on('requestfailed', request => failedRequests.push(request.url()));
  const origin = new URL(page.url()).origin;
  const settle = async () => {
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(180);
  };
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(origin);
  await settle();
  for (const width of [320, 360, 390, 600, 768, 900, 901, 1024, 1366, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await settle();
    const measure = await page.evaluate(() => ({
      width: innerWidth, scroll: document.documentElement.scrollWidth,
      clipped: [...document.querySelectorAll('h1,h2,h3,p,button,figcaption')].filter(e => e.getClientRects().length && e.clientWidth > 0 && e.scrollWidth > e.clientWidth + 3).map(e => e.textContent.slice(0, 70)),
      titleFont: getComputedStyle(document.querySelector('h1')).fontFamily,
      bodyFont: getComputedStyle(document.querySelector('.hero-description p')).fontFamily,
    }));
    assert(measure.scroll === width, `Page overflow at ${width}: ${measure.scroll}`);
    assert(!measure.clipped.length, `Clipped text at ${width}: ${measure.clipped.join(', ')}`);
    results.widths.push(measure);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await settle();
  for (const id of ['top', 'story', 'worlds', 'approach', 'model', 'people', 'contact']) {
    await page.evaluate(id => window.scrollTo(0, document.getElementById(id).getBoundingClientRect().top + scrollY), id);
    await settle();
    await page.screenshot({ path: `output/playwright/ags-${id}-desktop.png` });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await settle();
  await page.evaluate(() => window.scrollTo(0, 0));
  await settle();
  const mobileOrder = await page.evaluate(() => ({ title: document.querySelector('h1').getBoundingClientRect().top, art: document.querySelector('.hero-artwork').getBoundingClientRect().top }));
  assert(mobileOrder.title < mobileOrder.art, 'Mobile artwork precedes the headline');
  await page.screenshot({ path: 'output/playwright/ags-top-mobile.png' });
  await page.getByRole('button', { name: 'Open navigation' }).click();
  assert(await page.locator('main').getAttribute('inert') !== null, 'Mobile background not inert');
  await page.screenshot({ path: 'output/playwright/ags-menu-mobile.png' });
  await page.keyboard.press('Escape');
  assert(await page.getByRole('button', { name: 'Open navigation' }).evaluate(e => e === document.activeElement), 'Menu focus not restored');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: /Our craft/ }).click();
  assert(await page.locator('#mobile-navigation').count() === 0, 'Mobile navigation did not close');
  for (const index of [1, 2, 0]) {
    const button = page.locator('.sc-stage-navigation button').nth(index);
    await button.click();
    const selected = await button.getAttribute('aria-pressed');
    assert(selected === 'true', `Craft stage ${index} not selected`);
    results.stages.push(await page.locator('.sc-stage-details h3').textContent());
  }
  for (const name of ['I create worlds', 'Let’s collaborate', 'I have a story']) {
    const tab = page.getByRole('tab', { name: new RegExp(name) });
    await tab.click();
    const link = await page.locator('.pc-invitation-panel:not([hidden]) a').getAttribute('href');
    assert(await tab.getAttribute('aria-selected') === 'true', `Contact tab ${name} not selected`);
    assert(link.startsWith('mailto:') && link.includes('?subject='), `Invalid contact action for ${name}`);
    results.invitations.push({ name, link });
  }
  await page.getByRole('tab', { name: /I have a story/ }).focus();
  await page.keyboard.press('ArrowDown');
  assert((await page.getByRole('tab', { selected: true }).textContent()).includes('I create worlds'), 'Contact keyboard selection failed');
  await page.screenshot({ path: 'output/playwright/ags-contact-mobile.png' });
  results.assets = await page.evaluate(() => ({
    brokenImages: [...document.images].filter(i => i.complete && !i.naturalWidth).map(i => i.src),
    brokenAnchors: [...document.querySelectorAll('a[href^="#"]')].filter(a => a.hash && !document.getElementById(a.hash.slice(1))).map(a => a.hash),
    antonLoaded: document.fonts.check('400 24px Anton'), dmSansLoaded: document.fonts.check('500 16px "DM Sans"'),
    reducedMotion: getComputedStyle(document.querySelector('.hero-cinema-image')).animationName,
  }));
  assert(!results.assets.brokenImages.length && !results.assets.brokenAnchors.length, 'Broken assets or anchors');
  assert(results.assets.antonLoaded && results.assets.dmSansLoaded, 'New fonts did not load');
  assert(results.assets.reducedMotion === 'none', 'Reduced motion not respected');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(origin);
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.hero-links')).opacity === '1');
  await settle();
  await page.screenshot({ path: 'output/playwright/ags-animated-hero.png' });
  const track = await page.locator('.cinema-scroll-track').boundingBox();
  const travel = track.height - 1000;
  const samples = [];
  for (const fraction of [0, .5, .95]) {
    await page.evaluate(y => window.scrollTo(0, y), track.y + travel * fraction);
    await page.waitForTimeout(1100);
    const state = await page.evaluate(() => ({
      first: Number(getComputedStyle(document.querySelector('.cinema-first')).opacity),
      second: Number(getComputedStyle(document.querySelector('.cinema-second')).opacity),
      stickyTop: document.querySelector('.cinema-sticky').getBoundingClientRect().top,
    }));
    samples.push(state);
    await page.screenshot({ path: `output/playwright/ags-cinema-${fraction}.png` });
  }
  assert(samples[0].first > .95 && samples[0].second < .05, 'Opening cinematic statement not visible');
  assert(samples[1].first > .1 || samples[1].second > .1, 'Cinematic transition leaves both statements invisible');
  assert(samples[2].first < .05 && samples[2].second > .95, 'Cinema did not transition with scroll');
  assert(Math.abs(samples[1].stickyTop) < 3 && Math.abs(samples[2].stickyTop) < 3, 'Cinema scene did not remain pinned');
  results.cinema = samples;
  assert(!errors.length, `Browser errors: ${errors.join(', ')}`);
  assert(!failedRequests.length, `Failed requests: ${failedRequests.join(', ')}`);
  results.errors = errors;
  results.failedRequests = failedRequests;
  await page.evaluate(() => window.scrollTo(0, 0));
  return results;
}
