import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import './motion-effects.css';

const PIXELS = Array.from({ length: 12 }, (_, i) => ({
  left: `${47 + ((i * 17) % 49)}%`,
  top: `${12 + ((i * 23) % 69)}%`,
  size: `${i % 3 === 0 ? 5 : 3}px`,
  delay: `${-(i * 1.37)}s`,
  duration: `${7 + (i % 4) * 2}s`,
}));

/** Decorative motion only: the document and every interaction work without it. */
export default function MotionEffects() {
  const progress = useRef(null);
  const [hero, setHero] = useState(null);

  useEffect(() => {
    setHero(document.querySelector('.hero'));
    let frame;
    const updateProgress = () => {
      frame = undefined;
      const range = document.documentElement.scrollHeight - window.innerHeight;
      if (progress.current) progress.current.style.transform = `scaleX(${range > 0 ? Math.min(1, Math.max(0, window.scrollY / range)) : 0})`;
    };
    const requestUpdate = () => { if (!frame) frame = requestAnimationFrame(updateProgress); };
    updateProgress();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    const resize = new ResizeObserver(requestUpdate);
    resize.observe(document.body);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      resize.disconnect();
    };
  }, []);

  useEffect(() => {
    const media = gsap.matchMedia();
    media.add({ motion: '(prefers-reduced-motion: no-preference)', desktop: '(hover: hover) and (pointer: fine) and (min-width: 801px)' }, context => {
      if (!context.conditions.motion) return;
      const root = document.documentElement;
      const heroNode = document.querySelector('.hero');
      const removers = [];
      const listen = (node, name, fn, options) => {
        node?.addEventListener(name, fn, options);
        if (node) removers.push(() => node.removeEventListener(name, fn, options));
      };
      root.classList.add('fx-motion-on');
      if (!context.conditions.desktop) return () => root.classList.remove('fx-motion-on');

      if (heroNode) {
        const setX = gsap.quickTo(heroNode, '--pointer-x', { duration: 1, ease: 'power2.out' });
        const setY = gsap.quickTo(heroNode, '--pointer-y', { duration: 1, ease: 'power2.out' });
        gsap.set(heroNode, { '--pointer-x': 70, '--pointer-y': 45 });
        listen(heroNode, 'pointermove', event => {
          const bounds = heroNode.getBoundingClientRect();
          setX((event.clientX - bounds.left) / bounds.width * 100);
          setY((event.clientY - bounds.top) / bounds.height * 100);
        }, { passive: true });
        listen(heroNode, 'pointerleave', () => { setX(70); setY(45); });
      }

      const magnets = [...document.querySelectorAll('.site-shell .button, .site-header .header-contact')].filter(node => !node.closest('dialog, .game-overlay'));
      magnets.forEach(node => {
        node.classList.add('fx-magnet');
        const x = gsap.quickTo(node, 'x', { duration: .35, ease: 'power3.out' });
        const y = gsap.quickTo(node, 'y', { duration: .35, ease: 'power3.out' });
        listen(node, 'pointermove', event => {
          if (root.classList.contains('overlay-open')) return;
          const box = node.getBoundingClientRect();
          x((event.clientX - box.left - box.width / 2) * .1);
          y((event.clientY - box.top - box.height / 2) * .14);
        }, { passive: true });
        listen(node, 'pointerleave', () => { x(0); y(0); });
      });
      const cards = [...document.querySelectorAll('.world-card')];
      cards.forEach(card => {
        card.classList.add('fx-tilt-card');
        gsap.set(card, { transformPerspective: 1200 });
        const rotationX = gsap.quickTo(card, 'rotationX', { duration: .5, ease: 'power3.out' });
        const rotationY = gsap.quickTo(card, 'rotationY', { duration: .5, ease: 'power3.out' });
        listen(card, 'pointermove', event => {
          if (root.classList.contains('overlay-open')) return;
          const box = card.getBoundingClientRect();
          const x = (event.clientX - box.left) / box.width;
          const y = (event.clientY - box.top) / box.height;
          rotationX((.5 - y) * 4);
          rotationY((x - .5) * 5);
          card.style.setProperty('--fx-card-x', `${x * 100}%`);
          card.style.setProperty('--fx-card-y', `${y * 100}%`);
        }, { passive: true });
        listen(card, 'pointerleave', () => { rotationX(0); rotationY(0); });
      });
      return () => {
        removers.forEach(remove => remove());
        root.classList.remove('fx-motion-on');
        magnets.forEach(node => node.classList.remove('fx-magnet'));
        cards.forEach(card => {
          card.classList.remove('fx-tilt-card');
          card.style.removeProperty('--fx-card-x');
          card.style.removeProperty('--fx-card-y');
        });
      };
    });
    return () => media.revert();
  }, []);

  return <>
    <div className="fx-scroll-progress" ref={progress} aria-hidden="true" />
    {hero && createPortal(<div className="fx-hero-atmosphere" aria-hidden="true">
      <div className="fx-hero-light" />
      <div className="fx-orbit fx-orbit-one" /><div className="fx-orbit fx-orbit-two" />
      {PIXELS.map((pixel, i) => <span className="fx-pixel" key={i} style={{ left: pixel.left, top: pixel.top, '--fx-size': pixel.size, '--fx-delay': pixel.delay, '--fx-duration': pixel.duration }} />)}
    </div>, hero)}
  </>;
}
