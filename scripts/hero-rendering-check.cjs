async page => {
  const assert = (value, message) => { if (!value) throw new Error(message); };
  const origin = new URL(page.url()).origin;
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  const response = await page.request.get(origin);
  const html = await response.text();
  assert(html.includes('id="hero-heading"') && html.includes('id="story"'), 'Production HTML is missing pre-rendered content');
  assert(!html.includes('<div id="root"></div>'), 'Production still depends on an empty client-rendered root');

  const noScript = await page.context().browser().newContext({javaScriptEnabled:false, viewport:{width:390,height:844}});
  const staticPage = await noScript.newPage();
  await staticPage.goto(origin, {waitUntil:'networkidle'});
  assert(await staticPage.getByRole('heading', {name:'Stories worth playing.'}).isVisible(), 'No-JS hero is missing');
  assert(!await staticPage.locator('.studio-intro').count(), 'Intro blocks the pre-rendered page');
  assert(await staticPage.locator('.site-shell').getAttribute('inert') === null, 'Static content is inert');
  await staticPage.getByRole('link', {name:'Meet Anthill',exact:true}).click();
  assert(staticPage.url().endsWith('#story'), 'Native no-JS navigation failed');
  await staticPage.screenshot({path:'output/playwright/hero-no-javascript.png'});
  await noScript.close();

  await page.emulateMedia({reducedMotion:'reduce'});
  const layouts = [];
  for (const width of [360,390,768,1440]) {
    await page.setViewportSize({width,height:900});
    await page.goto(origin, {waitUntil:'networkidle'});
    await page.evaluate(() => {history.scrollRestoration='manual'; window.scrollTo(0,0);});
    await page.locator('.pixel-logo[data-ready="true"]').waitFor();
    await page.locator('.pixel-logo-render img').evaluate(image => image.decode());
    await page.locator('.aurora-texture').evaluate(image => image.decode());
    const layout = await page.evaluate(() => {
      const box = selector => document.querySelector(selector).getBoundingClientRect().toJSON();
      return {scrollWidth:document.documentElement.scrollWidth,viewport:innerWidth,scene:box('.hero-scene'),title:box('.hero-title'),canvasCount:document.querySelectorAll('.hero-scene canvas').length};
    });
    assert(layout.scrollWidth<=width+1, `Horizontal overflow at ${width}`);
    assert(layout.scene.left>=-1 && layout.scene.right<=width+1, `Artwork outside viewport at ${width}`);
    assert(layout.canvasCount===0, 'Hero reintroduced a drawing context');
    if(width<=600) assert(layout.scene.top>=layout.title.bottom, 'Mobile artwork overlaps headline');
    await page.screenshot({path:`output/playwright/hero-lightweight-${width}.png`});
    layouts.push({width,...layout});
  }
  const scripts = await page.evaluate(() => performance.getEntriesByType('resource').filter(entry=>entry.initiatorType==='script').map(entry=>({name:entry.name.split('/').at(-1),bytes:entry.encodedBodySize})));
  assert(!scripts.some(entry=>/three|BufferGeometry/i.test(entry.name)), 'Heavy Three runtime is still requested');
  assert(!await page.evaluate(() => performance.getEntriesByType('resource').some(entry=>/-atlas/.test(entry.name))), 'Offscreen character atlases load during the hero');
  assert(errors.length===0,errors.join('\n'));
  return {prerender:'passed',noJavaScriptNavigation:'passed',layouts,scripts,errors};
}
