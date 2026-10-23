(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const body = document.body;
  const soundButton = $('.sound-toggle');
  const masalaButton = $('.impact-button');
  const masalaLabel = $('small', masalaButton);
  const toast = $('.toast');
  const tracks = [
    { file: 'masala-brass.mp3', label: 'Brass + dappu' },
    { file: 'masala-electric.mp3', label: 'Electric rowdy' }
  ];
  let toastTimer, context, master, compressor, soundEnabled = false;
  let audioTicket = 0, nextTrack = 0, currentMusic = null, impactTimer;
  const cache = new Map(), decoded = new Set(), effects = new Set();
  body.dataset.audioState = 'idle'; body.dataset.sound = 'off';
  function say(text) {
    clearTimeout(toastTimer); toast.textContent = text; toast.classList.add('visible');
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 2600);
  }
  function ensureContext() {
    if (context) return context;
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) throw new Error('Audio is unavailable in this browser.');
    context = new Audio({ latencyHint: 'interactive' });
    master = context.createGain(); master.gain.value = 0;
    compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -10; compressor.knee.value = 8;
    compressor.ratio.value = 6; compressor.attack.value = .003; compressor.release.value = .18;
    master.connect(compressor); compressor.connect(context.destination);
    context.addEventListener('statechange', () => { body.dataset.audioContext = context.state; });
    body.dataset.audioContext = context.state;
    return context;
  }
  function applySound(enabled) {
    soundEnabled = enabled;
    soundButton.setAttribute('aria-pressed', String(enabled));
    soundButton.setAttribute('aria-label', enabled ? 'Mute sound' : 'Enable sound');
    soundButton.title = enabled ? 'Sound on — click to mute' : 'Sound off';
    $('span', soundButton).textContent = enabled ? 'SOUND ON' : 'SOUND OFF';
    body.dataset.sound = enabled ? 'on' : 'off';
    if (master && context) {
      master.gain.cancelScheduledValues(context.currentTime);
      master.gain.setTargetAtTime(enabled ? .78 : 0, context.currentTime, .018);
    }
  }
  async function loadAsset(file) {
    if (cache.has(file)) return cache.get(file);
    const job = (async () => {
      const response = await fetch(`/assets/audio/${file}`);
      if (!response.ok) throw new Error('The sound file could not be loaded.');
      const buffer = await context.decodeAudioData(await response.arrayBuffer());
      decoded.add(file); body.dataset.soundAssetsReady = [...decoded].join(',');
      return buffer;
    })();
    cache.set(file, job);
    try { return await job; } catch (error) { cache.delete(file); throw error; }
  }
  function stopMusic() {
    const previous = currentMusic; currentMusic = null;
    if (previous && context) {
      previous.gain.gain.cancelScheduledValues(context.currentTime);
      previous.gain.gain.setTargetAtTime(0, context.currentTime, .018);
      try { previous.source.stop(context.currentTime + .09); } catch (_) {}
    }
    masalaButton.classList.remove('is-sounding'); masalaLabel.textContent = 'PRESS ME ↗';
  }
  function stopEffects() {
    for (const source of effects) { try { source.stop(); } catch (_) {} }
    effects.clear();
  }
  async function playNextTrack(origin) {
    const ticket = ++audioTicket;
    const index = nextTrack++ % tracks.length, track = tracks[index];
    stopMusic(); masalaButton.setAttribute('aria-busy', 'true'); masalaLabel.textContent = 'TUNING…';
    body.dataset.audioState = 'loading'; body.dataset.audioOrigin = origin;
    try {
      const ctx = ensureContext(); applySound(true);
      const resume = ctx.resume();
      const audio = loadAsset(track.file);
      // Warm the alternate hook and impact after the first explicit interaction.
      loadAsset(tracks[(index + 1) % tracks.length].file).catch(() => {});
      loadAsset('gada-impact.mp3').catch(() => {});
      await resume; const buffer = await audio;
      if (ticket !== audioTicket || !soundEnabled) return false;
      if (ctx.state !== 'running') throw new Error('Tap the sound control to enable audio.');
      const source = ctx.createBufferSource(), gain = ctx.createGain();
      source.buffer = buffer; gain.gain.value = .68; source.connect(gain); gain.connect(master);
      const music = { source, gain, ticket, origin, label: track.label };
      currentMusic = music;
      source.onended = () => {
        if (currentMusic !== music) return;
        currentMusic = null; body.dataset.audioState = soundEnabled ? 'ready' : 'muted';
        masalaButton.classList.remove('is-sounding'); masalaLabel.textContent = 'PLAY NEXT ↗';
      };
      source.start();
      body.dataset.audioState = 'playing'; body.dataset.activeJingle = track.label;
      body.dataset.audioDuration = buffer.duration.toFixed(3);
      body.dataset.audioPlayCount = String(Number(body.dataset.audioPlayCount || 0) + 1);
      masalaButton.classList.add('is-sounding'); masalaLabel.textContent = `PLAYING 0${index + 1}/02`;
      return true;
    } catch (error) {
      if (ticket === audioTicket) {
        body.dataset.audioState = 'error'; masalaLabel.textContent = 'TRY SOUND ↗';
        say(error.message || 'Tap sound to try again.');
      }
      return false;
    } finally {
      if (ticket === audioTicket) masalaButton.setAttribute('aria-busy', 'false');
    }
  }
  async function playGroundHit() {
    if (!soundEnabled || !context || context.state !== 'running') return;
    const ticket = audioTicket;
    try {
      const buffer = await loadAsset('gada-impact.mp3');
      if (ticket !== audioTicket || !soundEnabled || context.state !== 'running') return;
      const source = context.createBufferSource(), gain = context.createGain();
      source.buffer = buffer; gain.gain.value = .95; source.connect(gain); gain.connect(master);
      effects.add(source); source.onended = () => effects.delete(source); source.start();
      body.dataset.impactPlayCount = String(Number(body.dataset.impactPlayCount || 0) + 1);
      if (currentMusic) {
        const g = currentMusic.gain.gain, now = context.currentTime;
        g.cancelScheduledValues(now); g.setValueAtTime(g.value, now);
        g.linearRampToValueAtTime(.3, now + .025); g.linearRampToValueAtTime(.68, now + .7);
      }
    } catch (_) { /* The visual landing remains available if audio is interrupted. */ }
  }
  soundButton.addEventListener('click', async () => {
    if (soundEnabled) {
      ++audioTicket; applySound(false); stopMusic(); stopEffects();
      masalaButton.setAttribute('aria-busy', 'false'); body.dataset.audioState = 'muted';
    } else {
      try {
        const ctx = ensureContext(); applySound(true); await ctx.resume();
        body.dataset.audioState = 'ready';
        for (const file of [tracks[0].file, tracks[1].file, 'gada-impact.mp3']) loadAsset(file).catch(() => {});
      } catch (error) { applySound(false); say(error.message); }
    }
  });
  function showMasalaImpact() {
    if (reduced.matches) return;
    clearTimeout(impactTimer);
    $('.impact-layer').classList.remove('on'); $('.opening').classList.remove('masala-kick');
    requestAnimationFrame(() => { $('.impact-layer').classList.add('on'); $('.opening').classList.add('masala-kick'); });
    impactTimer = setTimeout(() => { $('.impact-layer').classList.remove('on'); $('.opening').classList.remove('masala-kick'); }, 2000);
  }
  masalaButton.title = 'Two original cinematic hooks. Press again for the next one.';
  masalaButton.addEventListener('click', async () => {
    const started = await playNextTrack('masala');
    if (started) { showMasalaImpact(); say('DHA, DHIM, THA.'); }
  });

  document.addEventListener('anthill:smash-prepare', async () => {
    ++audioTicket; stopMusic();
    try {
      const ctx = ensureContext(); applySound(true); await ctx.resume();
      loadAsset('gada-impact.mp3').catch(() => {});
      body.dataset.audioState = currentMusic ? 'playing' : 'ready';
    } catch (error) { say(error.message || 'Tap sound to enable the impact.'); }
  });
  document.addEventListener('anthill:smash-hit', playGroundHit);

  document.addEventListener('anthill:story-enter', () => {
    ++audioTicket; stopMusic(); stopEffects();
    masalaButton.setAttribute('aria-busy', 'false');
    body.dataset.audioState = soundEnabled ? 'ready' : 'idle';
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      ++audioTicket; stopMusic(); stopEffects(); masalaButton.setAttribute('aria-busy', 'false');
      body.dataset.audioState = soundEnabled ? 'ready' : 'idle';
    }
  });
})();
