async page => {
  const assert=(v,m)=>{if(!v)throw new Error(m)};
  const origin=new URL(page.url()).origin;
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(origin,{waitUntil:'networkidle'});
  const skip=page.getByRole('button',{name:/Skip intro/});
  if(await skip.isVisible())await skip.click();
  const rana=page.getByRole('button',{name:'Interact with Rana Daggubati',exact:true});
  await rana.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  await rana.click();await rana.click();
  await page.waitForTimeout(200);
  await page.locator('.pc-person-1 .pc-portrait').screenshot({path:'output/playwright/character-rana-thumbs-up.png'});
  const prasad=page.getByRole('button',{name:'Interact with Prasad Vanga',exact:true});
  await prasad.click();await prasad.click();
  await page.waitForTimeout(200);
  await page.locator('.pc-person-2 .pc-portrait').screenshot({path:'output/playwright/character-prasad-thumbs-up.png'});
  await page.waitForTimeout(1500);
  await page.locator('.hero').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  const before=await page.locator('.ic-sprite').evaluateAll(es=>es.map(e=>e.dataset.frame));
  await page.waitForTimeout(1500);
  const after=await page.locator('.ic-sprite').evaluateAll(es=>es.map(e=>e.dataset.frame));
  assert(JSON.stringify(before)===JSON.stringify(after),'Offscreen characters keep running');
  assert(await page.locator('.ic-stage').evaluateAll(es=>es.every(e=>e.dataset.motion==='paused')),'Offscreen motion state not paused');
  const failed=await page.context().newPage();
  failed.on('pageerror',error=>errors.push(error.message));
  await failed.emulateMedia({reducedMotion:'reduce'});
  await failed.route('**/*-atlas-v6.webp',route=>route.abort());
  await failed.goto(origin,{waitUntil:'networkidle'});
  await failed.locator('.ic-stage[data-ready="error"]').nth(3).waitFor();
  for(const name of ['Rana Daggubati','Prasad Vanga','Juha Huhtakallio','Jani Joenniemi']){
    const button=failed.getByRole('button',{name:`Interact with ${name}`,exact:true});
    await button.scrollIntoViewIfNeeded();
    const photo=button.locator('.ic-fallback');
    await photo.waitFor();
    await photo.evaluate(e=>e.decode());
    assert(await photo.evaluate(e=>e.naturalWidth>0&&getComputedStyle(e).opacity==='1'),'Missing atlas does not retain portrait');
    await button.click();await button.click();
    assert(await button.locator('.ic-reaction').isVisible(),'Fallback reaction not usable');
  }
  await failed.screenshot({path:'output/playwright/character-atlas-fallback.png'});
  await failed.close();
  assert(errors.length===0,errors.join('\n'));
  return {offscreen:'frames frozen',missingAtlas:'portraits and click feedback preserved',approval:'thumbs-up reactions captured',errors};
}
