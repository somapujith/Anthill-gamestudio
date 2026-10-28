import { useEffect, useState } from 'react';
import './glass-break-effect.css';

const STRIKE_DELAY = 380;
const FRACTURE_LIFETIME = 2500;
const REDUCED_LIFETIME = 800;
const EMPTY = { state: 'idle', paths: [], origin: null, reduced: false, activation: 0, generation: 0 };

// The seeded 13-ray, two-branch fracture from V2 studio-v7.js (5af276f).
// React owns each SVG path instead of inserting the original generated markup.
function drawCracks(rect, width, height) {
  const cx = Math.min(820, Math.max(100, (rect.left + rect.width * .65) / width * 1000));
  const cy = Math.min(850, Math.max(180, (rect.top + rect.height * .88) / height * 1000));
  let seed = 83;
  const random = () => {
    seed = seed * 16807 % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const paths = [];
  for (let i = 0; i < 13; i++) {
    const angle = i / 13 * Math.PI * 2 + (random() - .5) * .28;
    let d = `M${cx.toFixed(1)} ${cy.toFixed(1)}`;
    const points = [];
    for (let j = 1; j <= 7; j++) {
      const distance = j * (100 + random() * 35);
      const turn = angle + (random() - .5) * .18;
      const x = cx + Math.cos(turn) * distance;
      const y = cy + Math.sin(turn) * distance;
      points.push([x, y]);
      d += `L${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    paths.push({ d, fine: false });
    for (const j of [1, 3]) {
      const [x, y] = points[j];
      const branch = angle + (random() > .5 ? .55 : -.55);
      const length = 65 + random() * 110;
      paths.push({
        d: `M${x.toFixed(1)} ${y.toFixed(1)}l${(Math.cos(branch) * length * .4).toFixed(1)} ${(Math.sin(branch) * length * .4).toFixed(1)}l${(Math.cos(branch + .4) * length * .6).toFixed(1)} ${(Math.sin(branch + .4) * length * .6).toFixed(1)}`,
        fine: true,
      });
    }
  }
  return { paths, origin: { x: cx, y: cy } };
}

function isVisible(rect) {
  return rect.width > 0 && rect.height > 0 && rect.left < innerWidth && rect.top < innerHeight
    && rect.left + rect.width > 0 && rect.top + rect.height > 0;
}

export default function GlassBreakEffect() {
  const [fracture, setFracture] = useState(EMPTY);

  useEffect(() => {
    setFracture(EMPTY);
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let strikeTimer = 0;
    let healTimer = 0;
    let trigger = null;
    let disposed = false;
    let generation = 0;

    const clearTimers = () => {
      clearTimeout(strikeTimer);
      clearTimeout(healTimer);
      strikeTimer = 0;
      healTimer = 0;
    };
    const reset = () => {
      clearTimers();
      trigger = null;
      if (!disposed) setFracture(EMPTY);
    };
    const currentRect = () => trigger && ({
      ...trigger.rect,
      left: trigger.rect.left + trigger.scrollX - window.scrollX,
      top: trigger.rect.top + trigger.scrollY - window.scrollY,
    });
    const impact = forceReduced => {
      strikeTimer = 0;
      if (disposed || document.hidden || !trigger) { reset(); return; }
      const rect = currentRect();
      if (!isVisible(rect)) { reset(); return; }
      clearTimers();
      const reduced = forceReduced || preference.matches || trigger.reduced;
      const drawing = drawCracks(rect, Math.max(1, innerWidth), Math.max(1, innerHeight));
      setFracture({ state: 'broken', ...drawing, reduced, activation: trigger.activation, generation: trigger.generation });
      healTimer = setTimeout(reset, reduced ? REDUCED_LIFETIME : FRACTURE_LIFETIME);
    };
    const onAction = event => {
      const detail = event.detail;
      if (detail?.character !== 'rana' || detail.action !== 'power') return;
      reset();
      if (document.hidden || !detail.rect) return;
      const rect = Object.fromEntries(['left', 'top', 'width', 'height'].map(key => [key, Number(detail.rect[key])]));
      if (!Object.values(rect).every(Number.isFinite) || !isVisible(rect)) return;
      trigger = {
        rect,
        scrollX: window.scrollX,
        scrollY: window.scrollY,
        reduced: Boolean(detail.reducedMotion),
        activation: Number.isFinite(detail.activation) ? detail.activation : 0,
        generation: ++generation,
      };
      const reduced = preference.matches || trigger.reduced;
      if (reduced) impact(true);
      else {
        setFracture({ ...EMPTY, state: 'pending', activation: trigger.activation });
        strikeTimer = setTimeout(() => impact(false), STRIKE_DELAY);
      }
    };
    const onVisibility = () => { if (document.hidden) reset(); };
    const onScroll = () => { if (trigger && !isVisible(currentRect())) reset(); };
    const onPreference = () => {
      clearTimers();
      if (trigger && preference.matches) impact(true);
      else reset();
    };

    document.addEventListener('anthill:character-action', onAction);
    document.addEventListener('visibilitychange', onVisibility);
    preference.addEventListener('change', onPreference);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', reset);
    return () => {
      disposed = true;
      clearTimers();
      trigger = null;
      document.removeEventListener('anthill:character-action', onAction);
      document.removeEventListener('visibilitychange', onVisibility);
      preference.removeEventListener('change', onPreference);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', reset);
    };
  }, []);

  return <div className="glass-break-effect" data-state={fracture.state} data-motion={fracture.reduced ? 'reduced' : 'full'} data-activation={fracture.activation} aria-hidden="true">
    {fracture.state === 'broken' && <svg key={`${fracture.activation}-${fracture.generation}`} className="glass-break-fracture" viewBox="0 0 1000 1000" preserveAspectRatio="none" focusable="false">
      <g className="glass-break-rays">{fracture.paths.map((path, index) => <path key={index} d={path.d} className={path.fine ? 'glass-break-fine' : undefined} />)}</g>
      <circle className="glass-break-impact" cx={fracture.origin.x} cy={fracture.origin.y} r="17" />
    </svg>}
  </div>;
}
