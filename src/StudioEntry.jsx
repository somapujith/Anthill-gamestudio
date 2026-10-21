import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import App from './App.jsx';
import ShinyText from './ShinyText.jsx';
import './studio-intro.css';

function StudioIntro({ onComplete }) {
  const root = useRef(null);
  const [shine, setShine] = useState(false);

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
    const context = gsap.context(() => {
      gsap.set(anthill, { x: centerOffset() });
      gsap.timeline({ onComplete: finish })
        .from(anthill, { opacity: 0, y: 12, duration: .5, ease: 'power2.out' }, 0)
        .to(anthill, { x: 0, duration: .7, ease: 'power3.inOut' }, 1)
        .fromTo(companion, { autoAlpha: 0, x: 22, clipPath: 'inset(0 100% 0 0)' }, { autoAlpha: 1, x: 0, clipPath: 'inset(0 0% 0 0)', duration: .8, ease: 'power3.out' }, 1.2)
        .call(() => setShine(true), [], 1.45)
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
    <img className="intro-preload" src="/assets/mumbai.webp" alt="" aria-hidden="true" fetchPriority="high" />
    <div className="intro-ambient" aria-hidden="true" />
    <div className="intro-lockup">
      <div className="intro-anthill"><img src="/assets/official-logo.webp" width="613" height="212" alt="Anthill Ventures" /></div>
      <div className="intro-game-studios"><ShinyText text="GAME STUDIOS" color="#a5ac99" shineColor="#ffffff" speed={1.3} shineWidth={40} softness={.8} glow={.25} direction="right" disabled={!shine} /></div>
    </div>
    <p className="intro-tagline">STORIES WORTH PLAYING.</p>
    <button className="intro-skip" type="button" onClick={onComplete}>Skip intro <span aria-hidden="true">↗</span></button>
  </div>;
}

export default function StudioEntry() {
  const [ready, setReady] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  return ready ? <App /> : <StudioIntro onComplete={() => setReady(true)} />;
}
