async page => {
  const assert=(value,message)=>{if(!value)throw new Error(message)};
  const origin=new URL(page.url()).origin;
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.emulateMedia({reducedMotion:'reduce'});
  const sizes=[[320,844],[360,844],[390,844],[600,900],[601,900],[768,1024],[900,900],[901,900],[1024,768],[1440,1000],[1920,1080],[844,390]];
  const results=[];
  for(const [width,height] of sizes){
    await page.setViewportSize({width,height});
    await page.goto(origin,{waitUntil:'networkidle'});
    await page.locator('.pixel-logo[data-ready="true"]').waitFor();
    await page.locator('.ic-stage[data-ready="ready"]').nth(3).waitFor();
    const layout=await page.evaluate(()=>{
      const box=s=>{const r=document.querySelector(s).getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height}};
      return {width:innerWidth,height:innerHeight,pageHeight:document.documentElement.scrollHeight,overflow:document.documentElement.scrollWidth>innerWidth+1,hero:box('.hero'),logo:box('.hero-scene-sculpture'),header:box('.site-header'),peopleHeight:box('#people').height,names:[...document.querySelectorAll('.pc-person-copy h3')].map(e=>({text:e.innerText,clipped:e.scrollWidth>e.clientWidth+1})),removed:/click\s*\/\s*tap to interact|click a character/i.test(document.body.innerText)};
    });
    assert(!layout.overflow,`Overflow ${width}x${height}`);
    assert(!layout.removed,'Removed interaction prompts returned');
    assert(layout.names.length===4&&layout.names.every(n=>!n.clipped),`Character names clip at ${width}`);
    if([360,390].includes(width)&&height===844)assert(layout.logo.bottom<=height+1,`Full mobile logo below fold: ${JSON.stringify(layout)}`);
    if(width===1440)assert(layout.peopleHeight<1800,`People section remains too tall: ${layout.peopleHeight}`);
    await page.locator('#people').evaluate(e=>e.scrollIntoView({block:'start',behavior:'instant'}));
    assert(await page.locator('.site-header').evaluate(e=>Math.abs(e.getBoundingClientRect().top)<2),'Sticky header leaves viewport');
    if([360,390,768,1440,1920].includes(width)){
      await page.screenshot({path:`output/playwright/visual-pass/people-${width}.png`});
      await page.locator('.hero').evaluate(e=>window.scrollTo({top:0,behavior:'instant'}));
      await page.screenshot({path:`output/playwright/visual-pass/hero-${width}.png`});
    }
    results.push(layout);
  }
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(origin,{waitUntil:'networkidle'});
  const peopleNav=page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:/People/});
  await peopleNav.click();
  const peopleTop=await page.locator('#people').evaluate(e=>e.getBoundingClientRect().top);
  assert(peopleTop>=75&&peopleTop<=150,`People anchor under sticky header or too far below: ${peopleTop}`);
  await page.getByText('About Rana',{exact:true}).click();
  assert(await page.locator('.pc-person-details').first().getAttribute('open')!==null,'Biography did not expand');
  assert(await page.getByRole('link',{name:/Read more about Rana/}).isVisible(),'Sourced profile hidden after expand');
  await page.getByText('About Rana',{exact:true}).press('Enter');
  assert(await page.locator('.pc-person-details').first().getAttribute('open')===null,'Biography did not collapse with Enter');
  const visuals=[];
  for(let i=0;i<3;i++){
    await page.locator('.sc-stage-navigation button').nth(i).click();
    await page.waitForTimeout(450);
    assert(await page.locator('.sc-stage-navigation button').nth(i).getAttribute('aria-pressed')==='true','Process tab selection failed');
    const visual=await page.locator('.sc-visual').innerHTML();
    assert(visual.includes('<svg'),'Process illustration missing');visuals.push(visual);
    await page.locator('.sc-workbench').screenshot({path:`output/playwright/visual-pass/process-${i}.png`});
  }
  assert(new Set(visuals).size===3,'Process stages lack distinct illustrations');
  const tabs=page.getByRole('tab');
  for(let i=0;i<3;i++){
    await tabs.nth(i).click();
    assert(await tabs.nth(i).getAttribute('aria-selected')==='true','Contact selected state failed');
    assert(await page.getByRole('tabpanel').isVisible(),'Contact panel missing');
    await page.getByRole('tabpanel').screenshot({path:`output/playwright/visual-pass/contact-${i}.png`});
  }
  await tabs.nth(0).focus();await page.keyboard.press('End');assert(await tabs.nth(2).getAttribute('aria-selected')==='true','Contact End key failed');
  await page.keyboard.press('Home');assert(await tabs.nth(0).getAttribute('aria-selected')==='true','Contact Home key failed');
  await page.setViewportSize({width:390,height:844});
  await page.goto(origin,{waitUntil:'networkidle'});
  await page.getByRole('button',{name:'Open navigation'}).click();
  const nav=page.getByRole('navigation',{name:'Mobile navigation'});
  await nav.getByRole('link',{name:/People/}).click();
  assert(!await page.locator('#mobile-navigation').count(),'Mobile People anchor did not close menu');
  assert(await page.evaluate(()=>document.body.style.overflow!=='hidden'),'Mobile navigation left scroll locked');
  await page.getByRole('button',{name:'Open navigation'}).click();await page.keyboard.press('Escape');
  assert(await page.getByRole('button',{name:'Open navigation'}).evaluate(e=>e===document.activeElement),'Menu close lost focus');
  assert(errors.length===0,errors.join('\n'));
  return {results,biographies:'keyboard expand/collapse',process:'3 distinct SVG states',contact:'3 states and keyboard',navigation:'sticky and mobile People anchors',errors};
}
