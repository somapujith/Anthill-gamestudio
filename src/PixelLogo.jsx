import { useEffect, useRef, useState } from 'react';
import './PixelLogo.css';

export default function PixelLogo({ paused = false }) {
  const container = useRef(null);
  const [active, setActive] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let visible = true;
    const update = () => setActive(visible && !document.hidden);
    const observer = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      update();
    });
    observer.observe(container.current);
    document.addEventListener('visibilitychange', update);
    update();
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  return <div ref={container} className="pixel-logo is-ready" data-ready="true" data-motion={paused || !active ? 'paused' : 'running'} aria-hidden="true">
    <div className="pixel-logo-perspective">
      <picture className="pixel-logo-render">
        {!failed && <source type="image/avif" srcSet="/assets/hero-crystal-480.avif 480w, /assets/hero-crystal-960.avif 960w, /assets/hero-crystal-1280.avif 1280w" sizes="(max-width: 600px) 80vw, (max-width: 900px) 42vw, 48vw" />}
        <img src={failed ? '/assets/studio-symbol.svg' : '/assets/hero-crystal-960.webp'} srcSet={failed ? undefined : '/assets/hero-crystal-480.webp 480w, /assets/hero-crystal-960.webp 960w, /assets/hero-crystal-1280.webp 1280w'} sizes="(max-width: 600px) 80vw, (max-width: 900px) 42vw, 48vw" width="1313" height="1198" alt="" fetchPriority="high" decoding="async" draggable="false" onError={() => { if (!failed) setFailed(true); }} />
      </picture>
    </div>
    <span className="pixel-logo-anchor" />
  </div>;
}
