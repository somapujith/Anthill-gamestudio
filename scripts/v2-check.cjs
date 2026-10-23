async (page) => {
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  const origin = new URL(page.url()).origin;
  page.setDefaultTimeout(10000);
  const errors = [], failed = [], audio = [], results = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`); });
  page.on('request', request => { if (/\/audio\//.test(request.url())) audio.push(request.url()); });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const [width, height] of [[320,740], [390,844], [768,1024], [844,390], [1440,900], [1920,1080]]) {
    await page.setViewportSize({ width, height });
    await page.goto(origin, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    for (const id of ['opening', 'worlds', 'mindset', 'hello']) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      await page.waitForTimeout(150);
    }
    const assets = await page.evaluate(async () => {
      await Promise.all([...document.images].map(image => image.decode().catch(() => {})));
      return {
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        broken: [...document.images].filter(image => !image.naturalWidth).map(image => image.getAttribute('src')),
        fonts: [...document.fonts].filter(font => font.status === 'error').map(font => font.family),
        title: document.querySelector('h1').textContent,
        sections: document.querySelectorAll('main > section').length,
      };
    });
    assert(!assets.overflow, `Horizontal overflow at ${width}x${height}`);
    assert(!assets.broken.length, `Broken images: ${assets.broken}`);
    assert(!assets.fonts.length && assets.sections === 4 && assets.title.includes('BEYOND'), 'Missing V2 content or fonts');
    await page.locator('.world-poster').first().click();
    assert(await page.locator('.world-dialog').evaluate(dialog => dialog.open), 'World dialog failed to open');
    await page.getByRole('button', { name: 'NEXT PERSPECTIVE' }).click();
    assert((await page.locator('#world-dialog-title').textContent()).includes('IMPOSSIBLE'), 'World dialog did not advance');
    await page.keyboard.press('Escape');
    assert(!await page.locator('.world-dialog').evaluate(dialog => dialog.open), 'Escape did not close world dialog');
    assert(await page.evaluate(() => document.body.style.overflow !== 'hidden'), 'Dialog left scrolling locked');
    await page.getByRole('tab', { name: 'A NEW ERA', exact: true }).click();
    await page.keyboard.press('ArrowRight');
    assert(await page.getByRole('tab', { name: 'INDIA TO THE WORLD', exact: true }).getAttribute('aria-selected') === 'true', 'Ethos keyboard tabs failed');
    for (const [name, subject] of [['A STORY', 'A story'], ['A CRAFT', 'A creative collaboration'], ['A PARTNERSHIP', 'Let’s collaborate']]) {
      await page.getByRole('tab', { name: new RegExp(name) }).click();
      const href = decodeURIComponent(await page.locator('#contact-action').getAttribute('href'));
      assert(href.includes(subject) && href.startsWith('mailto:'), `Wrong contact link: ${name}`);
    }
    if (width === 390 || width === 1440) {
      await page.getByRole('button', { name: 'Pause team idle animations', exact: true }).click();
      assert(await page.locator('.party-grid').getAttribute('data-motion') === 'paused', 'Team pause failed');
      for (const id of ['prasad-phone', 'juha-wave', 'jani-glasses', 'rana-smash']) {
        await page.locator(`#${id}`).click();
        assert(await page.locator(`#${id}`).getAttribute('data-activations') === '1', `${id} action failed`);
      }
      await page.waitForFunction(() => Number(document.body.dataset.screenSmashCount) > 0);
      await page.waitForFunction(() => Number(document.body.dataset.impactPlayCount) > 0);
      await page.waitForTimeout(3100);
      await page.screenshot({ path: `output/playwright/v2-${width}-team.png` });
      await page.locator('#opening').scrollIntoViewIfNeeded();
      await page.getByRole('button', { name: 'Pause ambient animations', exact: true }).first().click();
      const paused = await page.locator('body').getAttribute('data-aurora-frame');
      await page.waitForTimeout(200);
      assert(await page.locator('body').getAttribute('data-aurora-state') === 'paused', 'Ambient pause failed');
      assert(await page.locator('body').getAttribute('data-aurora-frame') === paused, 'Ambient animation continued while paused');
      await page.getByRole('button', { name: 'Resume ambient animations', exact: true }).first().click();
      if (await page.getByRole('button', { name: 'Open scribble mode' }).isVisible()) {
        await page.getByRole('button', { name: 'Open scribble mode' }).click();
        await page.mouse.move(width * .3, height * .4);
        await page.mouse.down();
        await page.mouse.move(width * .6, height * .5, { steps: 10 });
        await page.mouse.up();
        const drawn = await page.locator('#scribble-canvas').evaluate(canvas => canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data.some((value, index) => index % 4 === 3 && value));
        assert(drawn, 'Scribble did not draw');
        await page.getByRole('button', { name: 'Clear', exact: true }).click();
        await page.keyboard.press('Escape');
        assert(await page.getByRole('button', { name: 'Open scribble mode' }).getAttribute('aria-pressed') === 'false', 'Scribble did not close');
        assert(await page.evaluate(() => document.body.style.overflow !== 'hidden'), 'Scribble left scrolling locked');
      }
      await page.screenshot({ path: `output/playwright/v2-${width}-opening.png` });
    }
    results.push({ width, height, passed: true });
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(origin, { waitUntil: 'networkidle' });
  assert(await page.locator('body').getAttribute('data-aurora-state') === 'paused', 'Reduced motion did not pause aurora');
  assert(await page.locator('.metal-mark').getAttribute('data-state') === 'paused', 'Reduced motion did not pause logo');
  await page.getByRole('tab', { name: 'A NEW ERA', exact: true }).click();
  assert(await page.locator('#action-scene').getAttribute('data-phase') === '1', 'Reduced-motion ethos selection failed');
  const fallback = await page.context().newPage();
  await fallback.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return type === 'webgl' ? null : original.call(this, type, ...args);
    };
  });
  await fallback.goto(origin, { waitUntil: 'networkidle' });
  assert(await fallback.locator('body').getAttribute('data-aurora-renderer') === 'canvas', 'WebGL fallback failed');
  await fallback.close();
  assert(!errors.length, `Browser exceptions: ${errors.join('; ')}`);
  assert(!failed.length, `Failed responses: ${failed.join('; ')}`);
  assert(audio.length === 2 && audio.every(url => url.endsWith('/gada-impact.mp3')), `Unexpected audio requests: ${audio}`);
  return { results, reducedMotion: true, canvasFallback: true, errors, failed, audioRequests: audio.length };
}
