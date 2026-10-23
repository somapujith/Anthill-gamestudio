(() => {
  'use strict';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const acts=[...document.querySelectorAll('.act')],visible=new Set();
  const controls=[...document.querySelectorAll('[data-strip-toggle]')];
  const people=document.querySelector('.people-strip'),replay=document.querySelector('#hands-replay');
  let paused=false,gripTicket=0,gripTimer=0;
  function updateMotion(){
    const still=paused||reduced.matches;
    document.body.classList.toggle('heading-static',still);
    document.body.dataset.headingMotion=still?'paused':'playing';
    acts.forEach(act=>act.style.setProperty('--heading-play',!still&&!document.hidden&&visible.has(act)?'running':'paused'));
    controls.forEach(button=>{button.setAttribute('aria-label',paused?'Resume ambient animations':'Pause ambient animations');button.setAttribute('aria-pressed',String(paused));button.textContent=paused?'▶':'Ⅱ';});
    if(still){clearTimeout(gripTimer);people.classList.remove('is-gripping');people.classList.add('has-greeted');people.dataset.gripState='holding';}
  }
  async function greet(){
    const ticket=++gripTicket;
    try{await replay.querySelector('img').decode();}catch(_){}
    if(ticket!==gripTicket||!visible.has(document.querySelector('#hello'))||document.hidden)return;
    clearTimeout(gripTimer);people.classList.remove('is-gripping');people.classList.add('has-greeted');
    people.dataset.greetingCount=String(Number(people.dataset.greetingCount||0)+1);
    if(paused||reduced.matches){people.dataset.gripState='holding';return;}
    void people.offsetWidth;people.classList.add('is-gripping');people.dataset.gripState='arriving';
    gripTimer=setTimeout(()=>{if(ticket!==gripTicket)return;people.classList.remove('is-gripping');people.dataset.gripState='holding';},1750);
  }
  controls.forEach(button=>button.addEventListener('click',()=>{paused=!paused;updateMotion();}));
  replay.addEventListener('click',greet);
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      const active=entry.isIntersecting&&entry.intersectionRatio>=.2,was=visible.has(entry.target);
      if(active)visible.add(entry.target);else visible.delete(entry.target);
      entry.target.dataset.headingVisible=String(active);
      if(entry.target.id==='hello'){
        if(active&&!was)greet();
        else if(!active){++gripTicket;clearTimeout(gripTimer);people.classList.remove('is-gripping');people.dataset.gripState='holding';}
      }
    });updateMotion();
  },{threshold:[0,.2]});
  acts.forEach(act=>observer.observe(act));
  document.addEventListener('visibilitychange',()=>{if(document.hidden){++gripTicket;clearTimeout(gripTimer);people.classList.remove('is-gripping');}updateMotion();});
  reduced.addEventListener('change',updateMotion);
  updateMotion();
})();
