import { useEffect, useRef, useState } from 'react';
import './PixelLogo.css';

const SYMBOL = '/assets/studio-symbol.webp';

export default function PixelLogo({ paused = false }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const pausedRef = useRef(paused);
  const wakeRef = useRef(null);
  const [ready, setReady] = useState(false);
  pausedRef.current = paused;

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let disposed = false;
    let renderer;
    let geometry;
    let materials = [];
    let sculpture;
    let scene;
    let camera;
    let raf = 0;
    let last = 0;
    let elapsed = 0;
    let visible = true;
    let contextLost = false;
    let reduced = preference.matches;
    let hasRendered = false;

    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      last = 0;
    };
    const canRender = () => !disposed && renderer && sculpture && visible && !document.hidden && !contextLost;
    const draw = time => {
      raf = 0;
      if (!canRender()) { last = 0; return; }
      const animated = !pausedRef.current && !reduced;
      if (animated && last) elapsed += Math.min((time - last) / 1000, .05);
      last = animated ? time : 0;
      sculpture.rotation.set(-.12, -.32 + elapsed * Math.PI * 2 / 32, -.065);
      sculpture.position.y = reduced ? 0 : Math.sin(elapsed * .8) * .09;
      try {
        renderer.render(scene, camera);
        if (!hasRendered) {
          hasRendered = true;
          setReady(true);
        }
      } catch {
        contextLost = true;
        hasRendered = false;
        setReady(false);
        return;
      }
      if (animated) raf = requestAnimationFrame(draw);
    };
    const wake = () => {
      if (!raf && canRender()) raf = requestAnimationFrame(draw);
    };
    wakeRef.current = () => { stop(); wake(); };
    const resize = () => {
      if (!renderer || !camera || disposed) return;
      const { width, height } = container.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.position.z = Math.max(5.6, 5.3 / camera.aspect) / (2 * Math.tan(camera.fov * Math.PI / 360));
      camera.updateProjectionMatrix();
      wake();
    };
    const onPreference = () => {
      reduced = preference.matches;
      if (reduced) elapsed = 0;
      stop();
      wake();
    };
    const onVisibility = () => { stop(); wake(); };
    const onContextLost = event => {
      event.preventDefault();
      contextLost = true;
      hasRendered = false;
      stop();
      setReady(false);
    };
    const onContextRestored = () => {
      contextLost = false;
      resize();
      wake();
    };
    const observer = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      stop();
      wake();
    });
    observer.observe(container);
    const sizeObserver = new ResizeObserver(resize);
    sizeObserver.observe(container);
    preference.addEventListener('change', onPreference);
    document.addEventListener('visibilitychange', onVisibility);
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);

    const initialize = async () => {
      try {
        const { WebGLRenderer, SRGBColorSpace, ACESFilmicToneMapping, Scene, PerspectiveCamera, HemisphereLight, DirectionalLight, MeshStandardMaterial, BoxGeometry, InstancedMesh, Object3D, Color } = await import('three');
        if (disposed) return;
        const image = new Image();
        image.src = SYMBOL;
        await image.decode();
        if (disposed) return;
        const mask = document.createElement('canvas');
        mask.width = image.naturalWidth;
        mask.height = image.naturalHeight;
        const context = mask.getContext('2d', { willReadFrequently: true });
        if (!context) return;
        context.drawImage(image, 0, 0);
        const { data } = context.getImageData(0, 0, mask.width, mask.height);
        const occupied = new Uint8Array(mask.width * mask.height);
        for (let index = 0; index < occupied.length; index++) occupied[index] = data[index * 4 + 3] >= 128 ? 1 : 0;
        const rectangles = [];
        for (let y = 0; y < mask.height; y++) {
          for (let x = 0; x < mask.width; x++) {
            if (!occupied[y * mask.width + x]) continue;
            let width = 1;
            while (width < 4 && x + width < mask.width && occupied[y * mask.width + x + width]) width++;
            let height = 1;
            while (height < 4 && y + height < mask.height) {
              let complete = true;
              for (let column = 0; column < width; column++) {
                if (!occupied[(y + height) * mask.width + x + column]) { complete = false; break; }
              }
              if (!complete) break;
              height++;
            }
            for (let row = 0; row < height; row++) {
              occupied.fill(0, (y + row) * mask.width + x, (y + row) * mask.width + x + width);
            }
            rectangles.push([x, y, width, height]);
          }
        }
        if (!rectangles.length) return;
        const webgl = canvas.getContext('webgl2', { alpha: true, antialias: true, powerPreference: 'low-power' });
        if (!webgl) return;
        renderer = new WebGLRenderer({ canvas, context: webgl, alpha: true, antialias: true, powerPreference: 'low-power' });
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = SRGBColorSpace;
        renderer.toneMapping = ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.15;
        scene = new Scene();
        camera = new PerspectiveCamera(35, 1, .1, 50);
        camera.lookAt(0, 0, 0);
        scene.add(new HemisphereLight(0xfff6e4, 0x262819, 2.1));
        const key = new DirectionalLight(0xfff6e8, 3);
        key.position.set(-3, 5, 7);
        scene.add(key);
        const red = new DirectionalLight(0xf34431, 5);
        red.position.set(5, 1, -2);
        scene.add(red);
        const lime = new DirectionalLight(0xd6ed79, 4);
        lime.position.set(-4, 2, -4);
        scene.add(lime);
        const side = new MeshStandardMaterial({ color: 0x777466, roughness: .38, metalness: .45 });
        const face = new MeshStandardMaterial({ color: 0xf0eee6, roughness: .42, metalness: .18 });
        materials = [side, face];
        // Merge occupied pixels into abutting facets without changing the supplied silhouette.
        geometry = new BoxGeometry(1 / 32, 1 / 32, 25 / 32);
        sculpture = new InstancedMesh(geometry, [side, side, side, side, face, face], rectangles.length);
        const transform = new Object3D();
        const color = new Color();
        rectangles.forEach(([x, y, width, height], index) => {
          transform.position.set((x + width / 2 - mask.width / 2) / 32, (mask.height / 2 - y - height / 2) / 32, 0);
          transform.scale.set(width, height, 1);
          transform.updateMatrix();
          sculpture.setMatrixAt(index, transform.matrix);
          // Quiet four-pixel facets catch the light without breaking up the mark.
          color.setScalar(1 - ((Math.floor(x / 4) + Math.floor(y / 4)) % 3) * .018);
          sculpture.setColorAt(index, color);
        });
        sculpture.instanceMatrix.needsUpdate = true;
        sculpture.instanceColor.needsUpdate = true;
        sculpture.computeBoundingSphere();
        scene.add(sculpture);
        resize();
        wake();
      } catch {
        // The supplied mark remains visible if WebGL or the optional 3D chunk is unavailable.
        if (!disposed) setReady(false);
      }
    };
    initialize();

    return () => {
      disposed = true;
      stop();
      wakeRef.current = null;
      observer.disconnect();
      sizeObserver.disconnect();
      preference.removeEventListener('change', onPreference);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      sculpture?.dispose();
      geometry?.dispose();
      materials.forEach(material => material.dispose());
      renderer?.dispose();
    };
  }, []);

  useEffect(() => { wakeRef.current?.(); }, [paused]);

  return <div ref={containerRef} className={`pixel-logo${ready ? ' is-ready' : ''}`} data-ready={ready} aria-hidden="true">
    <img className="pixel-logo-fallback" src={SYMBOL} width="128" height="124" alt="" />
    <canvas ref={canvasRef} className="pixel-logo-canvas" />
  </div>;
}
