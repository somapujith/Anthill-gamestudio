(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  document.documentElement.classList.add('js');
  $('#year').textContent = new Date().getFullYear();
  let toastTimer;
  function announce(message) {
    clearTimeout(toastTimer); $('.toast').textContent = message; $('.toast').classList.add('visible');
    toastTimer = setTimeout(() => $('.toast').classList.remove('visible'), 2600);
  }
  const acts = $$('.act');
  const chapterLinks = $$('.chapter-nav a');
  function markAct(id) {
    const act = document.getElementById(id);
    if (act) act.classList.add('is-active');
    chapterLinks.forEach(link => {
      const active = link.hash === '#' + id;
      link.classList.toggle('current', active);
      if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
  }
  const observer = new IntersectionObserver(() => {
    let best = null, largest = 0;
    acts.forEach(act => {
      const r = act.getBoundingClientRect();
      const visible = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0));
      if (visible > largest) { largest = visible; best = act; }
    });
    if (best) markAct(best.id);
  }, { threshold: [0, .25, .5, .75, 1] });
  acts.forEach(act => observer.observe(act));
  let pending = false;
  function progress() {
    const limit = document.documentElement.scrollHeight - innerHeight;
    $('.progress').style.transform = `scaleX(${limit > 0 ? Math.min(1, Math.max(0, scrollY / limit)) : 0})`;
    pending = false;
  }
  addEventListener('scroll', () => { if (!pending) { pending = true; requestAnimationFrame(progress); } }, { passive: true });
  addEventListener('resize', progress, { passive: true });
  progress();
  if (location.hash && acts.some(act => act.id === location.hash.slice(1))) markAct(location.hash.slice(1));

  const opening = $('.opening');
  const hero = $('.hero-art');
  opening.addEventListener('pointermove', e => {
    if (!fine.matches || reduced.matches) return;
    const r = opening.getBoundingClientRect();
    hero.style.setProperty('--hero-x', `${((e.clientX - r.left) / r.width - .5) * 13}px`);
    hero.style.setProperty('--hero-y', `${((e.clientY - r.top) / r.height - .5) * 9}px`);
  });
  opening.addEventListener('pointerleave', () => {
    hero.style.setProperty('--hero-x', '0px'); hero.style.setProperty('--hero-y', '0px');
  });
  const worlds = [
    { number: 'IMAGINATION', title: 'BUILD<br>WONDER.', image: 'mass-heroes.webp', alt: 'An expressive pixel hero in a red jacket and gold sunglasses.', description: 'We believe games can make wonder something you feel, choose and take part in. A place to let imagination run wild.', note: 'Dream without limits.' },
    { number: 'AMBITION', title: 'BELIEVE THE<br>IMPOSSIBLE.', image: 'mumbai.webp', alt: 'A rider in a vivid comic-book vision of Indian streets.', description: 'To us, impossible is a starting point. Games let people try what reality won’t—and discover what imagination can become.', note: 'Make the unthinkable playable.' },
    { number: 'PURPOSE', title: 'PLAY WITH<br>PURPOSE.', image: 'myth.webp', alt: 'An Indian mythic hero facing a vast imagined landscape.', description: 'A great game stays with you after you put the controller down. We’re building for that feeling: a story, a connection, a reason to come back.', note: 'Leave something with the player.' }
  ];
  const dialog = $('.world-dialog');
  let worldIndex = 0, savedOverflow = '';
  function renderWorld(index) {
    worldIndex = index; const world = worlds[index];
    $('#dialog-number').textContent = world.number;
    $('#world-dialog-title').innerHTML = world.title;
    $('#dialog-description').textContent = world.description;
    $('#dialog-note').textContent = world.note;
    $('#dialog-image').src = `/assets/${world.image}`; $('#dialog-image').alt = world.alt;
  }
  $$('.world-poster').forEach(button => button.addEventListener('click', () => {
    renderWorld(Number(button.dataset.world)); savedOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; dialog.showModal(); $('.dialog-close').focus();
  }));
  $('.dialog-close').addEventListener('click', () => dialog.close());
  $('.dialog-next').addEventListener('click', () => renderWorld((worldIndex + 1) % worlds.length));
  dialog.addEventListener('close', () => { document.body.style.overflow = savedOverflow; });
  dialog.addEventListener('click', e => {
    const r = dialog.getBoundingClientRect();
    if (e.target === dialog && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) dialog.close();
  });

  function replay(element) {
    if (reduced.matches) return;
    element.classList.remove('switch-in'); requestAnimationFrame(() => element.classList.add('switch-in'));
  }
  function keyboardTabs(buttons, select) {
    buttons.forEach((button, index) => {
      button.addEventListener('click', () => select(index));
      button.addEventListener('keydown', e => {
        let next;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (index + 1) % buttons.length;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (index + buttons.length - 1) % buttons.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = buttons.length - 1;
        else return;
        e.preventDefault(); select(next); buttons[next].focus();
      });
    });
  }
  function updateSelection(buttons, index) {
    buttons.forEach((button, i) => { button.setAttribute('aria-selected', String(i === index)); button.tabIndex = i === index ? 0 : -1; });
  }
  const contact = [
    { copy: 'Something on your mind?<br>We’d love to hear it.', action: 'LET’S TALK', subject: 'A story for Anthill Game Studios' },
    { copy: 'You make something special.<br>Let’s see what we could build.', action: 'INTRODUCE YOUR CRAFT', subject: 'A creative collaboration with Anthill Game Studios' },
    { copy: 'A shared ambition?<br>There’s a conversation to be had.', action: 'START SOMETHING', subject: 'Let’s collaborate with Anthill Game Studios' }
  ];
  function selectContact(index) {
    const item = contact[index]; updateSelection($$('.contact-tabs button'), index);
    $('#contact-panel').setAttribute('aria-labelledby', `contact-tab-${index}`);
    $('#contact-description').innerHTML = item.copy;
    $('#contact-action span').textContent = item.action;
    $('#contact-action').href = `mailto:Info@anthillventures.com?subject=${encodeURIComponent(item.subject)}`;
    replay($('#contact-panel'));
  }
  keyboardTabs($$('.contact-tabs button'), selectContact);

  const canvas = $('#scribble-canvas'), ctx = canvas.getContext('2d'), tools = $('.scribble-tools');
  let scribbling = false, drawing = false, pen = '#66eaff', last = null, canvasAnchor = 0, oldOverflow = '';
  function fitCanvas() {
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = innerWidth * ratio; canvas.height = innerHeight * ratio;
    canvas.style.width = `${innerWidth}px`; canvas.style.height = `${innerHeight}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0); ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  }
  function finishScribble() {
    if (!scribbling) return;
    drawing = false; scribbling = false; last = null; tools.hidden = true;
    document.body.classList.remove('drawing'); document.body.style.overflow = oldOverflow;
    canvas.style.position = 'absolute'; canvas.style.top = `${canvasAnchor}px`; canvas.style.bottom = 'auto';
    $('.scribble-toggle').setAttribute('aria-pressed', 'false'); $('.scribble-toggle').focus({ preventScroll: true });
  }
  $('.scribble-toggle').addEventListener('click', () => {
    if (scribbling) { finishScribble(); return; }
    fitCanvas(); scribbling = true; canvasAnchor = scrollY;
    oldOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    canvas.style.position = 'fixed'; canvas.style.top = '0px'; canvas.style.bottom = 'auto';
    tools.hidden = false; document.body.classList.add('drawing');
    $('.scribble-toggle').setAttribute('aria-pressed', 'true'); $('.done-ink').focus({ preventScroll: true });
  });
  canvas.addEventListener('pointerdown', e => {
    if (!scribbling) return;
    e.preventDefault(); drawing = true; canvas.setPointerCapture(e.pointerId);
    const r = canvas.getBoundingClientRect(); last = { x: e.clientX - r.left, y: e.clientY - r.top };
    ctx.fillStyle = pen; ctx.beginPath(); ctx.arc(last.x, last.y, 1.5, 0, Math.PI * 2); ctx.fill();
  });
  canvas.addEventListener('pointermove', e => {
    if (!drawing || !last) return;
    const r = canvas.getBoundingClientRect(), point = { x: e.clientX - r.left, y: e.clientY - r.top };
    ctx.strokeStyle = pen; ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(point.x, point.y); ctx.stroke(); last = point;
  });
  const stop = () => { drawing = false; last = null; };
  canvas.addEventListener('pointerup', stop); canvas.addEventListener('pointercancel', stop);
  $('.done-ink').addEventListener('click', finishScribble);
  $('.clear-ink').addEventListener('click', () => ctx.clearRect(0, 0, innerWidth, innerHeight));
  $$('.ink-colour').forEach(button => button.addEventListener('click', () => {
    pen = button.dataset.colour;
    $$('.ink-colour').forEach(b => { b.classList.toggle('active', b === button); b.setAttribute('aria-pressed', String(b === button)); });
  }));
  document.addEventListener('keydown', e => {
    if (!scribbling) return;
    if (e.key === 'Escape') finishScribble();
    if (e.key === 'Tab') {
      const buttons = $$('button', tools), first = buttons[0], end = buttons.at(-1);
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); end.focus(); }
      else if (!e.shiftKey && document.activeElement === end) { e.preventDefault(); first.focus(); }
    }
  });
  addEventListener('resize', () => { if (scribbling) fitCanvas(); });
})();
