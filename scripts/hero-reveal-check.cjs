async (page) => {
  const assert = (value, message) => { if (!value) throw new Error(message); };
  const origin = new URL(page.url()).origin;
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const visualDifference = (a, b) => page.evaluate(async ([first, second]) => {
    const pixels = async source => {
      const image = new Image();
      image.src = 'data:image/png;base64,' + source;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = image.width; canvas.height = image.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0);
      return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    };
    const [x, y] = await Promise.all([pixels(first), pixels(second)]);
    if (x.length !== y.length) return 1;
    let changed = 0;
    for (let i = 0; i < x.length; i += 4) {
      if (Math.max(Math.abs(x[i] - y[i]), Math.abs(x[i + 1] - y[i + 1]), Math.abs(x[i + 2] - y[i + 2])) > 4) changed++;
    }
    return changed / (x.length / 4);
  }, [a.toString('base64'), b.toString('base64')]);
  const ready = async () => {
    const skip = page.getByRole('button', { name: /Skip intro/ });
    if (await skip.isVisible()) await skip.click();
    await page.locator('.pixel-logo[data-ready="true"]').waitFor();
    await page.locator('.aurora-container[data-ready="true"]').waitFor();
    await page.waitForTimeout(1700);
  };
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const results = [];
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(origin, { waitUntil: 'networkidle' });
    await ready();
    assert(await page.locator('.hero-cinema-image').count() === 0, 'Old hero image remains');
    const layout = await page.evaluate(() => {
      const box = selector => { const r = document.querySelector(selector).getBoundingClientRect(); return { x: r.x, y: r.y, right: r.right, bottom: r.bottom, width: r.width, height: r.height }; };
      return { viewport: innerWidth, scrollWidth: document.documentElement.scrollWidth, scene: box('.hero-scene'), title: box('.hero-title'), logo: box('.pixel-logo') };
    });
    assert(layout.scrollWidth <= width + 1, `Horizontal overflow at ${width}`);
    assert(layout.scene.x >= -1 && layout.scene.right <= width + 1, `Scene overflows at ${width}`);
    assert(layout.logo.width > 200 && layout.logo.height > 200, `Logo too small at ${width}`);
    if (width <= 600) assert(layout.scene.y >= layout.title.bottom, 'Mobile logo overlaps headline');
    await page.screenshot({ path: `output/playwright/hero-scene-${width}.png` });
    if (width <= 600) await page.locator('.hero-scene').screenshot({ path: `output/playwright/hero-logo-${width}.png` });
    results.push({ width, layout });
  }
  const logo = page.locator('.pixel-logo');
  const before = await logo.screenshot();
  await page.waitForTimeout(600);
  assert(await visualDifference(before, await logo.screenshot()) > .01, 'Logo does not visibly animate');
  const pause = page.getByRole('button', { name: 'Pause hero animation' });
  await pause.click();
  await page.mouse.move(0, 0);
  await page.waitForTimeout(1000);
  const paused = await logo.screenshot();
  await page.waitForTimeout(500);
  assert(await visualDifference(paused, await logo.screenshot()) < .001, 'Pause does not hold hero still');
  await page.getByRole('button', { name: 'Play hero animation' }).click();
  await page.mouse.move(0, 0);
  await page.waitForTimeout(300);
  assert(await visualDifference(paused, await logo.screenshot()) > .01, 'Play does not resume hero');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(250);
  const reduced = await logo.screenshot();
  await page.waitForTimeout(500);
  assert(await visualDifference(reduced, await logo.screenshot()) < .001, 'Live reduced motion does not stop hero');
  assert(!await page.locator('.hero-scene-pause').isVisible(), 'Unnecessary animation control in reduced motion');
  await page.screenshot({ path: 'output/playwright/hero-scene-reduced.png' });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(origin, { waitUntil: 'networkidle' });
  await ready();
  await page.getByRole('button', { name: 'Open navigation' }).click();
  assert(await page.locator('#mobile-navigation').isVisible(), 'Mobile navigation did not open');
  await page.keyboard.press('Escape');
  assert(!await page.locator('#mobile-navigation').count(), 'Escape did not close navigation');
  await page.getByRole('link', { name: 'Meet Anthill', exact: true }).click();
  await page.waitForTimeout(1200);
  assert(await page.locator('#story').evaluate(el => Math.abs(el.getBoundingClientRect().top) < 150), 'Hero CTA failed');
  assert(errors.length === 0, errors.join('\n'));
  return { results, rotation: 'visible', pause: 'static', resume: 'moving', liveReducedMotion: 'static', mobileNavigation: 'passed', heroCTA: 'passed', errors };
}
