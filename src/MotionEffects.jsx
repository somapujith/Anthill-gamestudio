import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './motion-effects.css';

export default function MotionEffects() {
  const progress = useRef(null);
  useEffect(() => {
    let frame;
    const update = () => {
      frame = undefined;
      const range = document.documentElement.scrollHeight - innerHeight;
      if (progress.current) progress.current.style.transform = `scaleX(${range > 0 ? Math.max(0, Math.min(1, scrollY / range)) : 0})`;
    };
    const requestUpdate = () => { if (!frame) frame = requestAnimationFrame(update); };
    const resize = new ResizeObserver(requestUpdate);
    resize.observe(document.body);
    addEventListener('scroll', requestUpdate, { passive: true });
    addEventListener('resize', requestUpdate);
    update();
    return () => { cancelAnimationFrame(frame); resize.disconnect(); removeEventListener('scroll', requestUpdate); removeEventListener('resize', requestUpdate); };
  }, []);
  useEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine) and (min-width: 901px)', () => {
      const removers = [];
      const listen = (el, name, fn) => { el.addEventListener(name, fn, { passive: true }); removers.push(() => el.removeEventListener(name, fn)); };
      const ctx = gsap.context(() => {
        document.querySelectorAll('.hero-primary,.header-invitation,.text-action').forEach(el => {
          const x = gsap.quickTo(el, 'x', { duration: .4, ease: 'power3.out' });
          const y = gsap.quickTo(el, 'y', { duration: .4, ease: 'power3.out' });
          listen(el, 'pointermove', e => { const r = el.getBoundingClientRect(); x((e.clientX - r.left - r.width / 2) * .08); y((e.clientY - r.top - r.height / 2) * .1); });
          listen(el, 'pointerleave', () => { x(0); y(0); });
        });

      });
      return () => { removers.forEach(remove => remove()); ctx.revert(); };
    });
    return () => media.revert();
  }, []);
  return <div ref={progress} className="motion-reading-line" aria-hidden="true" />;
}
