(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  const story = $('#action-scene');
  let scrollFrame = 0, lastScroll = scrollY;
  function paintScroll() {
    scrollFrame = 0;
    const s = scrollY / Math.max(1, innerHeight);
    const speed = Math.min(1, Math.abs(scrollY - lastScroll) / 85);
    lastScroll = scrollY;
    if (reduced.matches) return;
    const bloom = (Math.sin(s * 4.6 - .7) + 1) / 2;
    root.style.setProperty('--red-y', `${Math.sin(s * 1.5) * 145}px`);
    root.style.setProperty('--red-turn', `${-9 + Math.sin(s * 2) * 17}deg`);
    root.style.setProperty('--red-scale', (.36 + bloom * .65 + speed * .1).toFixed(3));
    root.style.setProperty('--red-opacity', (.08 + bloom * .68).toFixed(3));
    const distance = story.getBoundingClientRect().top / innerHeight;
    story.style.setProperty('--story-drift', `${Math.max(-12, Math.min(12, distance * 13))}px`);
    story.style.setProperty('--scroll-bloom', (1 + Math.max(0, 1 - Math.abs(distance)) * .04).toFixed(3));
  }
  const scheduleScroll = () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(paintScroll); };
  addEventListener('scroll', scheduleScroll, { passive: true });
  addEventListener('resize', scheduleScroll, { passive: true });
  paintScroll();

  const stage = $('.arcade-team'), pauseButton = $('#team-pause');
  const rana = $('.rana-roamer'), prasad = $('.prasad-roamer');
  const ranaAvatar = $('#rana-smash'), prasadAvatar = $('.prasad-avatar');
  const ranaSprite = $('.rana-sprite'), prasadSprite = $('.prasad-sprite');
  const screen = $('.screen-smash'), fracture = $('.screen-fracture');
  const note = $('#team-action-note');
  let visible = false, paused = false, frame = 0, clock = 0, previous = 0, stageWidth = 0;
  let attackStart = null, hitTimer = 0, resetTimer = 0, attackTimer = 0, ranaHeld = false;
  function measure() { stageWidth = stage.getBoundingClientRect().width; }
  function sprite(element, cell) {
    if (element.dataset.frame === String(cell)) return;
    element.style.setProperty('--sprite-x', `${(cell % 4) * 100 / 3}%`);
    element.style.setProperty('--sprite-y', cell < 4 ? '0%' : '100%');
    element.dataset.frame = String(cell);
  }
  function patrol(time, period, range) {
    const p = (time % period) / period;
    return { x: (p < .5 ? p * 2 : 2 - p * 2) * range, facing: p < .5 ? 1 : -1 };
  }
  function render(now) {
    if (attackStart !== null) {
      const age = now - attackStart;
      sprite(ranaSprite, reduced.matches ? 6 : 4 + Math.min(3, Math.floor(age / 190)));
      ranaAvatar.style.setProperty('--facing', '1');
    } else if (ranaHeld) {
      sprite(ranaSprite, 0);
    } else if (!paused && !reduced.matches) {
      const walk = patrol(clock, 15400, stageWidth * .15);
      rana.style.setProperty('--walk-x', `${walk.x.toFixed(1)}px`);
      ranaAvatar.style.setProperty('--facing', String(walk.facing));
      sprite(ranaSprite, Math.floor(clock / 155) % 4);
    }
    if (!paused && !reduced.matches) {
      const phoneAge = (clock + 3100) % 12800;
      const checking = phoneAge >= 9300;
      if (checking && !prasadAvatar.classList.contains('is-phone')) {
        stage.dataset.phoneChecks = String(Number(stage.dataset.phoneChecks || 0) + 1);
      }
      prasadAvatar.classList.toggle('is-phone', checking);
      const action = checking ? 'checking-phone' : 'strolling';
      if (stage.dataset.prasadAction !== action) stage.dataset.prasadAction = action;
      if (checking) {
        const age = phoneAge - 9300;
        sprite(prasadSprite, age < 380 ? 4 : age < 740 ? 5 : age < 3000 ? 6 : 7);
      } else {
        const walk = patrol(clock + 2900, 19100, stageWidth * .11);
        prasad.style.setProperty('--walk-x', `${walk.x.toFixed(1)}px`);
        prasadAvatar.style.setProperty('--facing', String(walk.facing));
        sprite(prasadSprite, Math.floor(clock / 185) % 4);
      }
    }
  }
  function tick(now) {
    frame = 0;
    if (!visible || document.hidden || ((paused || reduced.matches) && attackStart === null)) { previous = 0; return; }
    if (previous && !paused && !reduced.matches) clock += Math.min(80, now - previous);
    previous = now; render(now); frame = requestAnimationFrame(tick);
  }
  function run() { if (!frame && visible && !document.hidden) { previous = 0; frame = requestAnimationFrame(tick); } }
  function updatePause() {
    pauseButton.textContent = paused ? '▶ RESUME CHARACTERS' : 'Ⅱ PAUSE CHARACTERS';
    pauseButton.setAttribute('aria-label', paused ? 'Resume team character animations' : 'Pause team character animations');
    pauseButton.setAttribute('aria-pressed', String(paused));
    stage.dataset.motion = reduced.matches ? 'reduced' : paused ? 'paused' : 'playing';
  }
  pauseButton.addEventListener('click', () => { paused = !paused; updatePause(); run(); });
  ranaAvatar.addEventListener('pointerenter', () => { ranaHeld = true; });
  ranaAvatar.addEventListener('pointerleave', () => { ranaHeld = false; });
  ranaAvatar.addEventListener('focus', () => { ranaHeld = true; });
  ranaAvatar.addEventListener('blur', () => { ranaHeld = false; });
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    stage.dataset.visible = String(visible);
    if (visible) { measure(); run(); } else { cancelAnimationFrame(frame); frame = 0; previous = 0; }
  }, { threshold: .15 }).observe(stage);
  addEventListener('resize', measure, { passive: true });
  document.addEventListener('visibilitychange', run);
  reduced.addEventListener('change', () => {
    updatePause();
    if (reduced.matches) { sprite(ranaSprite, 0); sprite(prasadSprite, 6); prasadAvatar.classList.add('is-phone'); }
    run();
  });
  function drawCracks() {
    const r = ranaAvatar.getBoundingClientRect();
    const cx = Math.min(820, Math.max(100, (r.left + r.width * .65) / innerWidth * 1000));
    const cy = Math.min(850, Math.max(180, (r.bottom - r.height * .12) / innerHeight * 1000));
    let seed = 83;
    const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const paths = [];
    for (let i = 0; i < 13; i++) {
      const angle = i / 13 * Math.PI * 2 + (random() - .5) * .28;
      let d = `M${cx.toFixed(1)} ${cy.toFixed(1)}`;
      const points = [];
      for (let j = 1; j <= 7; j++) {
        const distance = j * (100 + random() * 35);
        const turn = angle + (random() - .5) * .18;
        const x = cx + Math.cos(turn) * distance, y = cy + Math.sin(turn) * distance;
        points.push([x, y]); d += `L${x.toFixed(1)} ${y.toFixed(1)}`;
      }
      paths.push(`<path d="${d}"/>`);
      for (const j of [1, 3]) {
        const [x, y] = points[j], branch = angle + (random() > .5 ? .55 : -.55);
        const length = 65 + random() * 110;
        paths.push(`<path class="fracture-fine" d="M${x.toFixed(1)} ${y.toFixed(1)}l${(Math.cos(branch) * length * .4).toFixed(1)} ${(Math.sin(branch) * length * .4).toFixed(1)}l${(Math.cos(branch + .4) * length * .6).toFixed(1)} ${(Math.sin(branch + .4) * length * .6).toFixed(1)}"/>`);
      }
    }
    fracture.innerHTML = paths.join('');
  }
  ranaAvatar.addEventListener('click', () => {
    if (attackStart !== null) return;
    clearTimeout(hitTimer); clearTimeout(resetTimer); clearTimeout(attackTimer);
    attackStart = performance.now(); stage.dataset.ranaAction = 'winding-up';
    ranaAvatar.setAttribute('aria-busy', 'true'); note.textContent = 'THE GADA HAS OTHER PLANS.';
    document.dispatchEvent(new Event('anthill:smash-prepare'));
    render(attackStart); run();
    hitTimer = setTimeout(() => {
      drawCracks(); screen.classList.remove('is-cracked'); document.body.classList.remove('screen-hit');
      requestAnimationFrame(() => {
        screen.classList.add('is-cracked'); document.body.classList.add('screen-hit');
        stage.dataset.ranaAction = 'smashing';
        document.body.dataset.screenSmashCount = String(Number(document.body.dataset.screenSmashCount || 0) + 1);
        note.textContent = 'OKAY. THAT WAS LOUD.';
        document.dispatchEvent(new Event('anthill:smash-hit'));
      });
    }, reduced.matches ? 0 : 380);
    attackTimer = setTimeout(() => {
      attackStart = null; ranaAvatar.setAttribute('aria-busy', 'false'); stage.dataset.ranaAction = 'strolling';
      sprite(ranaSprite, 0); run();
    }, reduced.matches ? 700 : 1250);
    resetTimer = setTimeout(() => {
      screen.classList.remove('is-cracked'); document.body.classList.remove('screen-hit');
      note.textContent = 'READY FOR ANOTHER ROUND.';
    }, 3000);
  });
  sprite(ranaSprite, 0); sprite(prasadSprite, reduced.matches ? 6 : 0);
  measure(); updatePause();
})();
