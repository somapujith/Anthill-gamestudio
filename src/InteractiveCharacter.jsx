import { useEffect, useRef, useState } from 'react';
import { Glasses, Hand, Phone, ThumbsUp, Zap } from 'lucide-react';
import './interactive-character.css';

const CHARACTERS = {
  rana: {
    atlas: '/assets/rana-atlas-v6.webp',
    idle: [[0, 950], [1, 420], [2, 460], [3, 850], [2, 420], [1, 420]],
    action: [[4, 190], [5, 190], [6, 360], [7, 440]],
    approval: [[0, 180], [3, 850], [0, 350]],
    still: 6,
    actionName: 'power',
    message: 'Power move!',
    approvalMessage: 'Game on!',
  },
  prasad: {
    atlas: '/assets/prasad-atlas-v6.webp',
    idle: [[0, 2800], [1, 450], [2, 1800], [3, 1200], [2, 1000], [6, 450], [7, 450], [0, 2400], [1, 450], [4, 1500], [5, 1400], [4, 900], [6, 450], [7, 450]],
    action: [[1, 450], [2, 1000], [3, 800], [2, 700], [4, 850], [5, 1100], [4, 700], [6, 400], [7, 450], [0, 300]],
    approval: [[7, 180], [0, 1000]],
    still: 2,
    actionName: 'call',
    message: "Let's connect!",
    approvalMessage: "Let's build!",
  },
  juha: {
    atlas: '/assets/juha-atlas-v6.webp',
    idle: [[0, 400], [1, 400], [2, 1300], [3, 400], [1, 400], [2, 900]],
    action: [[4, 300], [5, 350], [6, 350], [5, 350], [6, 350], [7, 350]],
    approval: [[6, 1180]],
    approvalStill: 6,
    still: 6,
    actionName: 'wave',
    message: 'Hi there!',
    approvalMessage: 'Game on!',
  },
  jani: {
    atlas: '/assets/jani-atlas-v6.webp',
    idle: [[0, 1100], [1, 500], [0, 900], [2, 1000], [3, 700], [0, 1000]],
    action: [[4, 300], [5, 700], [6, 500], [7, 450]],
    approval: [[6, 1180]],
    approvalStill: 6,
    still: 5,
    actionName: 'adjust',
    message: 'In focus!',
    approvalMessage: "Let's build!",
  },
};
const ACTION_ICONS = { rana: Zap, prasad: Phone, juha: Hand, jani: Glasses };

const durationOf = sequence => sequence.reduce((total, [, duration]) => total + duration, 0);
function sampleFrame(sequence, elapsed) {
  let remaining = elapsed;
  for (const [frame, duration] of sequence) {
    if (remaining < duration) return { frame, remaining: duration - remaining };
    remaining -= duration;
  }
  return { frame: sequence.at(-1)[0], remaining: 16 };
}

export default function InteractiveCharacter({ character, name, fallbackImage, paused = false }) {
  const root = useRef(null);
  const engine = useRef(null);
  const config = CHARACTERS[character] || CHARACTERS.rana;
  const [frame, setFrame] = useState(0);
  const [action, setAction] = useState('idle');
  const [ready, setReady] = useState('loading');
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [status, setStatus] = useState('');
  const [activation, setActivation] = useState(0);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);

  useEffect(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let reducedNow = preference.matches;
    let pausedNow = paused;
    let visible = false;
    let atlasReady = false;
    let disposed = false;
    let timer = 0;
    let previous = 0;
    let idleElapsed = 0;
    let actionElapsed = 0;
    let phase = 'idle';
    let currentFrame = 0;
    let activations = 0;
    let sequence = config.action;
    let imageSettled = false;
    setReady('loading');
    setAction('idle');
    setFrame(0);
    setReduced(reducedNow);

    const showFrame = next => {
      if (currentFrame !== next) { currentFrame = next; setFrame(next); }
    };
    const advance = () => {
      const now = performance.now();
      if (previous) {
        if (phase !== 'idle') actionElapsed += now - previous;
        else if (!pausedNow && !reducedNow && atlasReady) idleElapsed += now - previous;
      }
      previous = now;
    };
    const stop = () => {
      clearTimeout(timer);
      timer = 0;
      previous = 0;
    };
    const suspend = () => { if (previous) advance(); stop(); };
    const tick = () => {
      clearTimeout(timer);
      timer = 0;
      if (disposed || !visible || document.hidden) { previous = 0; return; }
      advance();
      if (phase !== 'idle') {
        const duration = reducedNow ? 1100 : durationOf(sequence);
        if (actionElapsed >= duration) {
          phase = 'idle';
          actionElapsed = 0;
          setAction('idle');
          showFrame(0);
        } else {
          const sample = reducedNow
            ? { frame: phase === 'approve' ? (config.approvalStill ?? 0) : config.still, remaining: duration - actionElapsed }
            : sampleFrame(sequence, actionElapsed);
          showFrame(sample.frame);
          timer = setTimeout(tick, Math.max(16, Math.ceil(sample.remaining)));
          return;
        }
      }
      if (pausedNow || reducedNow || !atlasReady) { showFrame(0); previous = 0; return; }
      const sample = sampleFrame(config.idle, idleElapsed % durationOf(config.idle));
      showFrame(sample.frame);
      timer = setTimeout(tick, Math.max(16, Math.ceil(sample.remaining)));
    };
    const wake = () => { stop(); tick(); };
    const activate = () => {
      if (disposed) return;
      suspend();
      activations++;
      const approve = activations % 2 === 0;
      phase = approve ? 'approve' : config.actionName;
      sequence = approve ? config.approval : config.action;
      actionElapsed = 0;
      setActivation(activations);
      setAction(phase);
      setStatus(`${name}: ${approve ? config.approvalMessage : config.message}`);
      showFrame(reducedNow ? (approve ? (config.approvalStill ?? 0) : config.still) : sequence[0][0]);
      tick();
    };
    engine.current = {
      activate,
      setPaused(next) { suspend(); pausedNow = next; tick(); },
    };
    const onPreference = () => {
      suspend();
      reducedNow = preference.matches;
      setReduced(reducedNow);
      if (phase !== 'idle') actionElapsed = 0;
      tick();
    };
    const onVisibility = () => {
      suspend();
      setPageVisible(!document.hidden);
      if (!document.hidden) tick();
    };
    const observer = new IntersectionObserver(entries => {
      suspend();
      visible = entries.some(entry => entry.isIntersecting);
      setInView(visible);
      if (visible) tick();
    }, { threshold: .1 });
    observer.observe(root.current);
    preference.addEventListener('change', onPreference);
    document.addEventListener('visibilitychange', onVisibility);

    const image = new Image();
    const loaded = () => {
      if (disposed || imageSettled) return;
      imageSettled = true;
      atlasReady = true;
      setReady('ready');
      wake();
    };
    const failed = () => {
      if (disposed || imageSettled) return;
      imageSettled = true;
      atlasReady = false;
      setReady('error');
      wake();
    };
    image.onload = () => image.decode().then(loaded, failed);
    image.onerror = failed;
    image.src = config.atlas;

    return () => {
      disposed = true;
      stop();
      engine.current = null;
      observer.disconnect();
      preference.removeEventListener('change', onPreference);
      document.removeEventListener('visibilitychange', onVisibility);
      image.onload = null;
      image.onerror = null;
    };
  }, [config, name]);

  useEffect(() => { engine.current?.setPaused(paused); }, [paused]);

  const approve = action === 'approve';
  const ReactionIcon = approve ? ThumbsUp : ACTION_ICONS[character] || Zap;
  const message = approve ? config.approvalMessage : config.message;

  return <div ref={root} className={`ic-stage${action !== 'idle' ? ' is-active' : ''}`} data-character={character} data-action={action} data-ready={ready} data-activations={activation} data-motion={reduced ? 'reduced' : paused || !inView || !pageVisible ? 'paused' : 'playing'}>
    <span className="ic-aura" aria-hidden="true" />
    <span className="ic-floor" aria-hidden="true" />
    <button className="ic-button" type="button" aria-label={`Interact with ${name}`} aria-busy={action !== 'idle'} onClick={() => engine.current?.activate()}>
      <span className="ic-sprite" aria-hidden="true" data-frame={frame} style={{ backgroundImage: `url('${config.atlas}')`, backgroundPosition: `${(frame % 4) * 100 / 3}% ${frame < 4 ? 0 : 100}%` }} />
      {ready === 'error' && <img className="ic-fallback" src={fallbackImage} alt="" loading="lazy" width="1100" height="1375" />}
      <span key={`impact-${activation}`} className="ic-impact" aria-hidden="true" />
      <span key={`particles-${activation}`} className="ic-particles" aria-hidden="true" />
      <span key={`reaction-${activation}`} className="ic-reaction" aria-hidden="true"><ReactionIcon size={20} strokeWidth={2} /><span>{message}</span></span>
      {ready === 'loading' && <span className="ic-hint" aria-hidden="true">Loading character...</span>}
    </button>
    <span className="ic-status" role="status" aria-live="polite" aria-atomic="true">{status}</span>
  </div>;
}
