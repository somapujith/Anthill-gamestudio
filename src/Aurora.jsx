import { useEffect, useRef, useState } from 'react';
import './Aurora.css';

export default function Aurora({ paused = false, opacity = .95, speed = .55, className = '', style }) {
  const containerRef = useRef(null);
  const [active, setActive] = useState(true);

  useEffect(() => {
    let visible = true;
    const update = () => setActive(visible && !document.hidden);
    const observer = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      update();
    });
    observer.observe(containerRef.current);
    document.addEventListener('visibilitychange', update);
    update();
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  return <div ref={containerRef} className={`aurora-container${className ? ` ${className}` : ''}`} data-ready="true" data-motion={paused || !active || speed <= 0 ? 'paused' : 'running'} style={{ '--aurora-opacity': Math.min(1, Math.max(0, opacity)), '--aurora-duration': `${28 / Math.max(.1, speed)}s`, ...style }} aria-hidden="true">
    <img className="aurora-texture" src="/assets/hero-nebula.webp" width="1280" height="900" alt="" decoding="async" draggable="false" />
  </div>;
}
