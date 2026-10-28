async page => {
  const assert=(v,m)=>{if(!v)throw new Error(m)};
  const origin=new URL(page.url()).origin;
  const people=[['rana','Rana Daggubati','power'],['prasad','Prasad Vanga','call'],['juha','Juha Huhtakallio','wave'],['jani','Jani Joenniemi','adjust'],['shobu','Shobu Yarlagadda','walk']];
  const errors=[];
  const onError=e=>errors.push(e.message);
  page.on('pageerror',onError);
  await page.emulateMedia({reducedMotion:'reduce'});
  const results=[];
  for(const width of [360,390,768,1440]){
    await page.setViewportSize({width,height:900});
    await page.goto(origin,{waitUntil:'networkidle'});
    await page.locator('.ic-stage[data-ready="ready"]').nth(4).waitFor();
    assert(await page.locator('.ic-stage').count()===5,'Expected all five people as characters');
    const dimensions=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,stages:[...document.querySelectorAll('.ic-stage')].map(e=>{const r=e.getBoundingClientRect();return {width:r.width,height:r.height,x:r.x,right:r.right};})}));
    assert(dimensions.scrollWidth<=width+1,`Page overflow at ${width}`);
    assert(dimensions.stages.every(s=>s.width>200&&s.height>180&&s.x>=0&&s.right<=width+1),`Character layout failed at ${width}`);
    for(const [key,name,primaryAction] of people){
      const button=page.getByRole('button',{name:`Interact with ${name}`,exact:true});
      const stage=page.locator(`.ic-stage[data-character="${key}"]`);
      await button.click();
      assert(await stage.getAttribute('data-action')===primaryAction,`${name} reduced-motion gesture did not respond`);
      assert(await stage.locator('.ic-reaction').isVisible(),`${name} feedback is hidden`);
      await page.screenshot({path:`output/playwright/character-${key}-${width}.png`});
      const firstActivation=Number(await stage.getAttribute('data-activations'));
      await button.press('Enter');
      if(key==='rana'){
        assert(await stage.getAttribute('data-action')==='power','Rana changed to approval during a strike');
        assert(Number(await stage.getAttribute('data-activations'))===firstActivation,'Active Rana strike accepted another activation');
        await page.waitForFunction(()=>document.querySelector('.ic-stage[data-character="rana"]').dataset.action==='idle');
        await button.press('Enter');
        assert(await stage.getAttribute('data-action')==='power','Enter did not start another Rana strike');
        await page.waitForFunction(()=>document.querySelector('.ic-stage[data-character="rana"]').dataset.action==='idle');
      }else{
        assert(await stage.getAttribute('data-action')===(key==='shobu'?'walk':'approve'),`${name} repeat gesture failed`);
        assert(Number(await stage.getAttribute('data-activations'))===firstActivation+1,`${name} Enter did not activate`);
      }
      await button.press('Space');
      assert(await stage.getAttribute('data-action')===primaryAction,`${name} Space activation failed`);
    }
    assert(await page.locator('.pc-person-contact').count()===3,'Profile links lost');
    await page.getByRole('tab',{name:/I create worlds/}).click();
    assert((await page.getByRole('tabpanel').innerText()).includes('Bring your craft.'),'Contact tabs regressed');
    const clear = await page.evaluate(() => { const grid=document.querySelector('.pc-people-grid').getBoundingClientRect(); const note=document.querySelector('.pc-people-note').getBoundingClientRect(); return note.top >= grid.bottom; });
    assert(clear, 'People grid overlaps the section footer');
    results.push(dimensions);
  }
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(origin,{waitUntil:'networkidle'});
  const skip=page.getByRole('button',{name:/Skip intro/});
  if(await skip.isVisible())await skip.click();
  const rana=page.getByRole('button',{name:'Interact with Rana Daggubati',exact:true});
  await rana.scrollIntoViewIfNeeded();
  await page.locator('.ic-stage[data-ready="ready"]').nth(4).waitFor();
  await page.waitForTimeout(1200);
  const frames=async(duration)=>page.evaluate(duration=>new Promise(resolve=>{
    const values=[];const start=performance.now();
    const tick=()=>{values.push([...document.querySelectorAll('.ic-sprite')].map(e=>e.dataset.frame));if(performance.now()-start<duration)setTimeout(tick,80);else resolve(values)};tick();
  }),duration);
  const idle=await frames(1800);
  assert(new Set(idle.map(f=>f[0])).size>1,'Rana idle is static');
  await page.getByRole('button',{name:'Pause character idle animations'}).click();
  const held=await frames(800);
  assert(new Set(held.map(f=>f[0])).size===1,'Pause does not stop idle');
  await rana.click();
  const gesture=await frames(900);
  assert(new Set(gesture.map(f=>f[0])).size>1,'Click gesture does not animate while idle is paused');
  await page.waitForTimeout(1500);
  assert(await page.locator('.ic-stage').first().getAttribute('data-action')==='idle','Action failed to settle');
  const strikes=Number(await page.locator('.ic-stage[data-character="rana"]').getAttribute('data-activations'));
  for(let i=0;i<5;i++)await rana.click();
  assert(await page.locator('.ic-stage[data-character="rana"]').getAttribute('data-action')==='power','Rana repeat did not strike');
  assert(Number(await page.locator('.ic-stage[data-character="rana"]').getAttribute('data-activations'))===strikes+1,'Rapid clicks started overlapping Rana strikes');
  await page.waitForTimeout(3000);
  for (const [name,index] of [['Juha Huhtakallio',2],['Jani Joenniemi',3]]) {
    const button=page.getByRole('button',{name:`Interact with ${name}`,exact:true});
    await button.click();
    const gesture=await frames(1100);
    assert(new Set(gesture.map(frame=>frame[index])).size>1,`${name} gesture does not animate`);
    await button.press('Enter');
    assert(await page.locator('.ic-stage').nth(index).getAttribute('data-action')==='approve',`${name} approval failed`);
    await page.locator('.pc-person').nth(index).screenshot({path:`output/playwright/character-${name.split(' ')[0].toLowerCase()}-approval.png`});
  }
  const shobu=page.getByRole('button',{name:'Interact with Shobu Yarlagadda',exact:true});
  await shobu.click();
  const walking=await page.locator('.ic-stage[data-character="shobu"]').evaluate(stage=>new Promise(resolve=>{
    const samples=[],started=performance.now();
    const tick=()=>{const sprite=stage.querySelector('.ic-sprite');samples.push({frame:sprite.dataset.frame,x:sprite.getBoundingClientRect().x});if(performance.now()-started<1300)setTimeout(tick,60);else resolve(samples)};tick();
  }));
  assert(new Set(walking.map(s=>s.frame)).size>=3,'Shobu walking gait lacks frame changes');
  assert(Math.max(...walking.map(s=>s.x))-Math.min(...walking.map(s=>s.x))>4,'Shobu walking has no visible stage travel');
  await shobu.press('Enter');
  assert(await page.locator('.ic-stage[data-character="shobu"]').getAttribute('data-action')==='walk','Shobu repeat changed away from walking');
  await page.locator('.pc-person-shobu').screenshot({path:'output/playwright/character-shobu-walking.png'});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('.ic-stage[data-motion="reduced"]').nth(4).waitFor();
  const reduced=await frames(700);
  assert(new Set(reduced.map(f=>f.join(','))).size===1,'Live reduced motion did not stop characters');
  assert(!await page.locator('.pc-character-pause').isVisible(),'Idle pause should be hidden in reduced motion');
  page.off('pageerror',onError);
  assert(errors.length===0,errors.join('\n'));
  return {viewports:results,idle:'animated',pause:'static',click:'animated',keyboard:'Enter and Space',rapidClicks:'Rana strike guarded; other gestures restart',reducedMotion:'static with explicit reactions',walking:'frame gait and stage travel',profileLinks:'3 preserved',contactTabs:'passed',errors};
}
