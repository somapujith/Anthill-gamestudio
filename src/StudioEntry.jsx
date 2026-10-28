import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import App from './App.jsx';
import './studio-intro.css';

function StudioIntro({ onComplete }) {
  const root = useRef(null);

  useLayoutEffect(() => {
    const element = root.current;
    const anthill = element.querySelector('.intro-anthill');
    const companion = element.querySelector('.intro-game-studios');
    const lockup = element.querySelector('.intro-lockup');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const oldOverflow = document.body.style.overflow;
    const started = performance.now();
    let alive = true;
    let completed = false;
    document.body.style.overflow = 'hidden';
    window.scrollTo(0, 0);

    const finish = () => {
      if (!alive || completed) return;
      completed = true;
      onComplete();
    };
    const centerOffset = () => (companion.offsetWidth + parseFloat(getComputedStyle(lockup).columnGap)) / 2;
    let context;
    const handoff = () => {
      const anchor = document.querySelector('.pixel-logo-anchor');
      if (!anchor || !alive) return;
      const target = anchor.getBoundingClientRect();
      const source = anthill.getBoundingClientRect();
      if (!target.width || !target.height || !source.width || !source.height) return;
      const x = Number(gsap.getProperty(anthill, 'x')) + target.left + target.width / 2 - source.left - source.width / 2;
      const y = Number(gsap.getProperty(anthill, 'y')) + target.top + target.height / 2 - source.top - source.height / 2;
      context.add(() => gsap.to(anthill, { x, y, scale: Math.min(target.width / source.width, target.height / source.height), duration: .75, ease: 'power3.inOut' }));
    };
    context = gsap.context(() => {
      gsap.set(anthill, { x: centerOffset(), transformOrigin: 'center center' });
      gsap.timeline({ onComplete: finish })
        .from(anthill, { opacity: 0, y: 12, duration: .5, ease: 'power2.out' }, 0)
        .to(anthill, { x: 0, duration: .7, ease: 'power3.inOut' }, 1)
        .fromTo(companion, { autoAlpha: 0, x: 22, clipPath: 'inset(0 100% 0 0)' }, { autoAlpha: 1, x: 0, clipPath: 'inset(0 0% 0 0)', duration: .8, ease: 'power3.out' }, 1.2)
        .to(companion, { autoAlpha: 0, duration: .3, ease: 'power2.in' }, 4.05)
        .to('.intro-tagline', { opacity: 0, duration: .3 }, 4.05)
        .call(handoff, [], 4.1)
        .to(element, { opacity: 0, duration: .5, ease: 'power2.inOut' }, 4.5);
    }, root);

    document.fonts.ready.then(() => {
      if (alive && performance.now() - started < 800) context.add(() => gsap.set(anthill, { x: centerOffset() }));
    });
    const deadline = window.setTimeout(finish, 5000);
    const onPreference = () => { if (reduced.matches) finish(); };
    const onVisibility = () => { if (!document.hidden && performance.now() - started >= 5000) finish(); };
    const onKey = event => {
      if (event.key === 'Escape') finish();
      if (event.key === 'Tab') { event.preventDefault(); element.querySelector('button').focus(); }
    };
    reduced.addEventListener('change', onPreference);
    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('keydown', onKey);
    return () => {
      alive = false;
      window.clearTimeout(deadline);
      context.revert();
      document.body.style.overflow = oldOverflow;
      reduced.removeEventListener('change', onPreference);
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('keydown', onKey);
    };
  }, [onComplete]);

  return <div ref={root} className="studio-intro" aria-label="Anthill Game Studios introduction">
    <div className="intro-ambient" aria-hidden="true" />
    <div className="intro-lockup">
      <div className="intro-anthill"><img src="/assets/studio-symbol.svg" width="128" height="124" alt="" /></div>
      <div className="intro-game-studios"><img src="/assets/studio-wordmark.svg" width="340" height="125" alt="Anthill Game Studios" /></div>
    </div>
    <p className="intro-tagline">STORIES WORTH PLAYING.</p>
    <button className="intro-skip" type="button" onClick={onComplete}>Skip intro <span aria-hidden="true">↗</span></button>
  </div>;
}

export default function StudioEntry() {
  // The server and the first hydration render expose the same usable page.
  // Start the optional intro only after the browser can read motion preferences.
  const [ready, setReady] = useState(null);
  const finish = useCallback(() => setReady(true), []);
  useLayoutEffect(() => {
    setReady(matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);
  return <><App introActive={ready === false} />{ready === false && <StudioIntro onComplete={finish} />}</>;
}
