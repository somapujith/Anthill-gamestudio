(() => {
  'use strict';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement, scene = $('#action-scene');
  let scrollFrame = 0, lastScroll = scrollY;
  function paintScroll() {
    scrollFrame = 0;
    if (reduced.matches) return;
    const travel = scrollY / Math.max(1, innerHeight);
    const velocity = Math.min(1, Math.abs(scrollY - lastScroll) / 85);
    lastScroll = scrollY;
    const bloom = (Math.sin(travel * 4.6 - .7) + 1) / 2;
    root.style.setProperty('--red-y', `${Math.sin(travel * 1.5) * 145}px`);
    root.style.setProperty('--red-turn', `${-9 + Math.sin(travel * 2) * 17}deg`);
    root.style.setProperty('--red-scale', (.35 + bloom * .6 + velocity * .1).toFixed(3));
    root.style.setProperty('--red-opacity', (.07 + bloom * .6).toFixed(3));
  }
  function scheduleScroll() { if (!scrollFrame) scrollFrame = requestAnimationFrame(paintScroll); }
  addEventListener('scroll', scheduleScroll, { passive: true });
  addEventListener('resize', scheduleScroll, { passive: true });
  paintScroll();

  // Story direction is deliberately independent of the audio system.
  const figures = $$('.game-scenes .action-figure'), tabs = $$('.action-steps button');
  const playStory = $('#sequence-play'), pauseStory = $('#sequence-pause');
  const caption = $('#action-caption-text'), panel = $('#action-caption');
  const captions = ['Emotion: make the player care.', 'Craft: cinema scale and player agency.', 'Reach: Indian stories and Nordic game craft for players everywhere.'];
  let phase = -1, elapsed = 0, startAt = 0, storyRAF = 0, storyRunning = false;
  let storyPaused = false, storyVisible = false, storyAutoPaused = false, storyPlayed = false;
  const storyTotal = 18000;
  function setPhase(index) {
    if (index === phase) return;
    phase = index; scene.dataset.phase = String(index);
    figures.forEach((figure, i) => {
      figure.classList.toggle('is-current', i === index);
      figure.setAttribute('aria-hidden', String(i !== index));
    });
    tabs.forEach((button, i) => {
      button.setAttribute('aria-selected', String(i === index)); button.tabIndex = i === index ? 0 : -1;
      button.classList.toggle('is-past', i < index);
    });
    caption.textContent = captions[index]; panel.setAttribute('aria-labelledby', `action-tab-${index}`);
  }
  function storyControls() {
    pauseStory.textContent = storyRunning ? 'PAUSE' : storyPaused ? 'RESUME' : 'PLAY';
    pauseStory.setAttribute('aria-label', storyRunning ? 'Pause ethos animation' : storyPaused ? 'Resume ethos animation' : 'Play ethos animation');
    pauseStory.setAttribute('aria-pressed', String(storyPaused));
  }
  function stopStoryClock() { cancelAnimationFrame(storyRAF); storyRAF = 0; }
  function completeStory() {
    stopStoryClock(); storyRunning = false; storyPaused = false;
    scene.classList.remove('is-running', 'is-paused'); scene.classList.add('is-complete');
    scene.dataset.state = 'complete'; setPhase(2); storyControls();
  }
  function tickStory(now) {
    if (!storyRunning) return;
    elapsed = Math.min(storyTotal, now - startAt);
    setPhase(elapsed < 6000 ? 0 : elapsed < 12000 ? 1 : 2);
    scene.dataset.elapsed = String(Math.round(elapsed));
    if (elapsed >= storyTotal) { completeStory(); return; }
    storyRAF = requestAnimationFrame(tickStory);
  }
  function beginStory() {
    stopStoryClock(); elapsed = 0; phase = -1; setPhase(0); storyPlayed = true; storyAutoPaused = false;
    scene.classList.remove('is-complete', 'is-paused', 'is-running');
    if (reduced.matches) {
      storyRunning = false; storyPaused = false; scene.dataset.state = 'frame'; storyControls(); return;
    }
    storyRunning = true; storyPaused = false; scene.dataset.state = 'playing';
    storyRAF = requestAnimationFrame(now => { scene.classList.add('is-running'); startAt = now; storyControls(); tickStory(now); });
  }
  function pauseSequence(auto = false) {
    if (!storyRunning) return;
    elapsed = Math.min(storyTotal, performance.now() - startAt); stopStoryClock();
    storyRunning = false; storyPaused = true; storyAutoPaused = auto;
    scene.classList.add('is-paused'); scene.dataset.state = 'paused'; storyControls();
  }
  function resumeStory() {
    if (!storyPaused || reduced.matches) { beginStory(); return; }
    storyRunning = true; storyPaused = false; storyAutoPaused = false; startAt = performance.now() - elapsed;
    scene.classList.remove('is-paused'); scene.dataset.state = 'playing'; storyControls();
    storyRAF = requestAnimationFrame(tickStory);
  }
  function chooseStory(index) {
    stopStoryClock(); storyRunning = false; storyPaused = false; storyPlayed = true; storyAutoPaused = false;
    scene.classList.remove('is-running', 'is-paused', 'is-complete'); scene.dataset.state = 'frame'; setPhase(index); storyControls();
  }
  tabs.forEach((button, index) => {
    button.addEventListener('click', () => chooseStory(index));
    button.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % 3;
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + 2) % 3;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = 2;
      else return;
      event.preventDefault(); chooseStory(next); tabs[next].focus();
    });
  });
  playStory.addEventListener('click', beginStory);
  pauseStory.addEventListener('click', () => { if (storyRunning) pauseSequence(); else if (storyPaused) resumeStory(); else beginStory(); });
  new IntersectionObserver(entries => {
    const entry = entries[0]; storyVisible = entry.isIntersecting && entry.intersectionRatio >= .4;
    if (storyVisible) {
      document.dispatchEvent(new Event('anthill:story-enter'));
      figures.forEach(figure => figure.querySelectorAll('img').forEach(img => img.decode().catch(() => {})));
      if (!storyPlayed && !reduced.matches) beginStory();
      else if (storyAutoPaused && storyPaused && !document.hidden) resumeStory();
    } else if (storyRunning) pauseSequence(true);
  }, { threshold: [0, .4] }).observe($('#mindset'));

  // Every team member has a stationary idle cycle and an individual explicit action.
  const stage = $('.party-grid'), pauseParty = $('#team-pause'), note = $('#team-action-note');
  function pattern(frames) { return { frames, total: frames.reduce((sum, [, time]) => sum + time, 0) }; }
  function frameAt(sequence, time) {
    let remaining = time;
    for (const [cell, duration] of sequence.frames) { if (remaining < duration) return cell; remaining -= duration; }
    return sequence.frames.at(-1)[0];
  }
  const people = {
    rana: { button: $('#rana-smash'), sprite: $('.rana-sprite'), idle: pattern([[0,950],[1,420],[2,460],[3,850],[2,420],[1,420]]), action: pattern([[4,190],[5,190],[6,360],[7,440]]), still: 6, message: 'Rana winds up the gada.' },
    prasad: { button: $('#prasad-phone'), sprite: $('.prasad-sprite'), idle: pattern([[0,2800],[1,450],[2,1800],[3,1200],[2,1000],[6,450],[7,450],[0,2400],[1,450],[4,1500],[5,1400],[4,900],[6,450],[7,450]]), action: pattern([[1,450],[2,1000],[3,800],[2,700],[4,850],[5,1100],[4,700],[6,400],[7,450],[0,300]]), still: 2, message: 'Prasad takes out his phone.' },
    juha: { button: $('#juha-wave'), sprite: $('.juha-sprite'), idle: pattern([[0,400],[1,400],[2,1300],[3,400],[1,400],[2,900]]), action: pattern([[4,300],[5,350],[6,350],[5,350],[6,350],[7,350]]), still: 6, message: 'Juha says hi.' },
    jani: { button: $('#jani-glasses'), sprite: $('.jani-sprite'), idle: pattern([[0,1100],[1,500],[0,900],[2,1000],[3,700],[0,1000]]), action: pattern([[4,300],[5,700],[6,500],[7,450]]), still: 5, message: 'Jani adjusts his glasses.' }
  };
  let partyVisible = false, partyPaused = false, partyRAF = 0, partyClock = 0, partyPrevious = 0;
  const screen = $('.screen-smash'), fracture = $('.screen-fracture');
  let strikeTimer = 0, crackReset = 0;
  function drawSprite(person, cell) {
    if (person.sprite.dataset.frame === String(cell)) return;
    person.sprite.style.setProperty('--sprite-x', `${(cell % 4) * 100 / 3}%`);
    person.sprite.style.setProperty('--sprite-y', cell < 4 ? '0%' : '100%');
    person.sprite.dataset.frame = String(cell);
  }
  function idleLabel(key, cell) {
    if (key === 'prasad') return cell === 4 || cell === 5 ? 'taking-call' : cell === 2 || cell === 3 ? 'checking-phone' : cell === 1 || cell === 7 ? 'phone-pocket' : 'standing';
    if (key === 'rana') return 'swinging-gada';
    if (key === 'juha') return cell === 2 ? 'focused-at-computer' : 'typing';
    return 'reading-documents';
  }
  function renderParty(now) {
    Object.entries(people).forEach(([key, person]) => {
      if (person.started !== undefined) {
        const age = now - person.started, duration = reduced.matches ? 1100 : person.action.total;
        if (age >= duration) {
          delete person.started; person.button.setAttribute('aria-busy', 'false');
          drawSprite(person, 0); person.button.dataset.action = idleLabel(key, 0);
        } else drawSprite(person, reduced.matches ? person.still : frameAt(person.action, age));
      } else if (!partyPaused && !reduced.matches) {
        const cell = frameAt(person.idle, partyClock % person.idle.total);
        drawSprite(person, cell);
        const label = idleLabel(key, cell);
        if (person.button.dataset.action !== label) person.button.dataset.action = label;
      }
    });
  }
  function tickParty(now) {
    partyRAF = 0;
    const active = Object.values(people).some(person => person.started !== undefined);
    if (!partyVisible || document.hidden || ((partyPaused || reduced.matches) && !active)) { partyPrevious = 0; return; }
    if (partyPrevious && !partyPaused && !reduced.matches) partyClock += Math.min(80, now - partyPrevious);
    partyPrevious = now; renderParty(now); partyRAF = requestAnimationFrame(tickParty);
  }
  function runParty() { if (!partyRAF && partyVisible && !document.hidden) { partyPrevious = 0; partyRAF = requestAnimationFrame(tickParty); } }
  function updatePartyControl() {
    pauseParty.textContent = partyPaused ? '▶ RESUME IDLE' : 'Ⅱ PAUSE IDLE';
    pauseParty.setAttribute('aria-label', partyPaused ? 'Resume team idle animations' : 'Pause team idle animations');
    pauseParty.setAttribute('aria-pressed', String(partyPaused)); stage.dataset.motion = reduced.matches ? 'reduced' : partyPaused ? 'paused' : 'playing';
  }
  pauseParty.addEventListener('click', () => { partyPaused = !partyPaused; updatePartyControl(); runParty(); });
  new IntersectionObserver(entries => {
    partyVisible = entries[0].isIntersecting; stage.dataset.visible = String(partyVisible);
    if (partyVisible) runParty(); else { cancelAnimationFrame(partyRAF); partyRAF = 0; partyPrevious = 0; }
  }, { threshold: .15 }).observe(stage);
  function drawCracks() {
    const r = people.rana.button.getBoundingClientRect();
    const cx = Math.min(820, Math.max(100, (r.left + r.width * .65) / innerWidth * 1000));
    const cy = Math.min(850, Math.max(180, (r.bottom - r.height * .12) / innerHeight * 1000));
    let seed = 83;
    const random = () => { seed = seed * 16807 % 2147483647; return (seed - 1) / 2147483646; };
    const paths = [];
    for (let i = 0; i < 13; i++) {
      const angle = i / 13 * Math.PI * 2 + (random() - .5) * .28;
      let d = `M${cx.toFixed(1)} ${cy.toFixed(1)}`;
      const points = [];
      for (let j = 1; j <= 7; j++) {
        const distance = j * (100 + random() * 35), turn = angle + (random() - .5) * .18;
        const x = cx + Math.cos(turn) * distance, y = cy + Math.sin(turn) * distance;
        points.push([x,y]); d += `L${x.toFixed(1)} ${y.toFixed(1)}`;
      }
      paths.push(`<path d="${d}"/>`);
      for (const j of [1,3]) {
        const [x,y] = points[j], branch = angle + (random() > .5 ? .55 : -.55), length = 65 + random() * 110;
        paths.push(`<path class="fracture-fine" d="M${x.toFixed(1)} ${y.toFixed(1)}l${(Math.cos(branch)*length*.4).toFixed(1)} ${(Math.sin(branch)*length*.4).toFixed(1)}l${(Math.cos(branch+.4)*length*.6).toFixed(1)} ${(Math.sin(branch+.4)*length*.6).toFixed(1)}"/>`);
      }
    }
    fracture.innerHTML = paths.join('');
  }
  Object.entries(people).forEach(([key, person]) => {
    person.button.closest('.party-member').addEventListener('click', event => {
      if (!event.target.closest('button,a')) person.button.click();
    });
    person.button.addEventListener('click', () => {
      if (key === 'rana' && person.started !== undefined) return;
      person.started = performance.now(); person.button.setAttribute('aria-busy', 'true');
      person.button.dataset.action = key === 'rana' ? 'smashing' : key === 'prasad' ? 'taking-out-phone' : key === 'juha' ? 'waving' : 'adjusting-glasses';
      person.button.dataset.activations = String(Number(person.button.dataset.activations || 0) + 1);
      note.textContent = person.message; renderParty(person.started); runParty();
      if (key !== 'rana') return;
      clearTimeout(strikeTimer); clearTimeout(crackReset);
      document.dispatchEvent(new Event('anthill:smash-prepare'));
      strikeTimer = setTimeout(() => {
        if (!partyVisible || document.hidden) return;
        drawCracks(); screen.classList.remove('is-cracked'); document.body.classList.remove('screen-hit');
        requestAnimationFrame(() => {
          screen.classList.add('is-cracked'); document.body.classList.add('screen-hit');
          document.body.dataset.screenSmashCount = String(Number(document.body.dataset.screenSmashCount || 0) + 1);
          note.textContent = 'Rana lands the blow.';
          document.dispatchEvent(new Event('anthill:smash-hit'));
        });
      }, reduced.matches ? 0 : 380);
      crackReset = setTimeout(() => { screen.classList.remove('is-cracked'); document.body.classList.remove('screen-hit'); }, 3000);
    });
    drawSprite(person, key === 'juha' ? 2 : 0); person.button.dataset.action = idleLabel(key, 0);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { if (storyRunning) pauseSequence(true); }
    else { if (storyVisible && storyAutoPaused && storyPaused) resumeStory(); runParty(); }
  });
  reduced.addEventListener('change', () => {
    if (reduced.matches) { if (storyRunning) chooseStory(phase); Object.values(people).forEach(person => drawSprite(person, 0)); }
    updatePartyControl(); runParty();
  });
  setPhase(0); storyControls(); updatePartyControl();
})();
