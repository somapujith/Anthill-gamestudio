async (page) => {
  const assert=(condition,message)=>{if(!condition)throw new Error(message);};
  const origin=new URL(page.url()).origin;
  const results=[];
  await page.emulateMedia({reducedMotion:'no-preference'});
  for(const width of [320,768,1440]){
    await page.setViewportSize({width,height:900});
    await page.goto(origin);
    await page.waitForFunction(()=>{const links=document.querySelector('.hero-links');return links&&getComputedStyle(links).opacity==='1';});
    const stages=[],invitations=[];
    for(let index=0;index<3;index++){
      const button=page.locator('.sc-stage-navigation button').nth(index);
      await button.click();
      await page.waitForTimeout(650);
      assert(await button.getAttribute('aria-pressed')==='true','Craft selection failed');
      const state=await page.locator('.sc-stage-details').evaluate(e=>({
        title:e.querySelector('h3').textContent,
        opacity:Number(getComputedStyle(e).opacity),
        clipped:[...e.querySelectorAll('h3,p,.sc-tags')].some(n=>n.scrollWidth>n.clientWidth+3),
      }));
      assert(state.opacity>.99&&!state.clipped,`Craft content hidden or clipped at ${width}: ${state.title}`);
      stages.push(state.title);
    }
    for(let index=0;index<3;index++){
      const tab=page.getByRole('tab').nth(index);
      await tab.click();
      await page.waitForTimeout(500);
      const panel=page.locator('.pc-invitation-panel:not([hidden])');
      const state=await panel.evaluate(e=>({
        title:e.querySelector('h3').textContent,
        opacity:Number(getComputedStyle(e.firstElementChild).opacity),
        clipped:[...e.querySelectorAll('h3,p,a')].some(n=>n.clientWidth>0&&n.scrollWidth>n.clientWidth+3),
        mailto:e.querySelector('a').getAttribute('href'),
      }));
      assert(await tab.getAttribute('aria-selected')==='true'&&state.opacity>.99&&!state.clipped,`Contact content hidden or clipped at ${width}`);
      assert(state.mailto.startsWith('mailto:')&&state.mailto.includes('subject='),'Contact email action failed');
      invitations.push(state.title);
    }
    const tab=page.getByRole('tab').first();
    await tab.focus();await page.keyboard.press('End');
    assert(await page.getByRole('tab').last().getAttribute('aria-selected')==='true','End key failed');
    await page.keyboard.press('Home');
    assert(await tab.getAttribute('aria-selected')==='true','Home key failed');
    results.push({width,stages,invitations});
  }
  await page.setViewportSize({width:390,height:844});
  await page.goto(origin);
  await page.waitForFunction(()=>{const links=document.querySelector('.hero-links');return links&&getComputedStyle(links).opacity==='1';});
  await page.getByRole('button',{name:'Open navigation'}).click();
  await page.getByRole('navigation',{name:'Mobile navigation'}).getByRole('link',{name:/Our craft/}).click();
  await page.waitForFunction(()=>{const top=document.getElementById('approach').getBoundingClientRect().top;return top>=-10&&top<200;});
  assert(await page.locator('#mobile-navigation').count()===0,'Menu remains open after anchor navigation');
  const anchorTop=await page.locator('#approach').evaluate(e=>Math.round(e.getBoundingClientRect().top));
  await page.evaluate(()=>window.scrollTo(0,0));
  await page.waitForTimeout(200);
  await page.getByRole('button',{name:'Open navigation'}).click();
  await page.setViewportSize({width:1024,height:768});
  assert(await page.locator('#mobile-navigation').count()===0,'Menu did not close on desktop resize');
  assert(await page.evaluate(()=>document.body.style.overflow!=='hidden'),'Body scroll lock remains after resizing');
  return {results,normalMotionMobileAnchorTop:anchorTop,resizeCleanup:true};
}
