import { useEffect, useRef, useState } from 'react';
import './PixelLogo.css';

const SYMBOL = '/assets/studio-symbol.webp';

function traceMask(data, width, height) {
  const occupied = (x, y) => x >= 0 && x < width && y >= 0 && y < height && data[(y * width + x) * 4 + 3] >= 128;
  const edges = new Map();
  const edge = (x, y, endX, endY) => {
    const key = `${x},${y}`;
    if (!edges.has(key)) edges.set(key, []);
    edges.get(key).push([endX, endY]);
  };
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!occupied(x, y)) continue;
      if (!occupied(x, y - 1)) edge(x, y, x + 1, y);
      if (!occupied(x + 1, y)) edge(x + 1, y, x + 1, y + 1);
      if (!occupied(x, y + 1)) edge(x + 1, y + 1, x, y + 1);
      if (!occupied(x - 1, y)) edge(x, y + 1, x, y);
    }
  }
  const contours = [];
  while (edges.size) {
    const start = edges.keys().next().value;
    let key = start;
    const contour = [];
    do {
      const next = edges.get(key);
      if (!next) return [];
      contour.push(key.split(',').map(Number));
      const point = next.pop();
      if (!next.length) edges.delete(key);
      key = point.join(',');
    } while (key !== start);
    contours.push(contour.filter((point, index) => {
      const previous = contour[(index + contour.length - 1) % contour.length];
      const next = contour[(index + 1) % contour.length];
      return (point[0] - previous[0]) * (next[1] - point[1]) !== (point[1] - previous[1]) * (next[0] - point[0]);
    }));
  }
  return contours;
}

// The hand-pixelled source has 1-3px nubs and ledges that are off by a pixel or two. Snapping nearby
// vertex coordinates onto one value collapses them, so each step reads as one clean, straight edge.
function regularize(contour, tolerance) {
  const snap = values => {
    const sorted = [...new Set(values)].sort((a, b) => a - b);
    const map = new Map();
    let group = [];
    const flush = () => {
      if (!group.length) return;
      const target = Math.round(group.reduce((sum, value) => sum + value, 0) / group.length);
      group.forEach(value => map.set(value, target));
      group = [];
    };
    sorted.forEach(value => {
      if (group.length && value - group[group.length - 1] > tolerance) flush();
      group.push(value);
    });
    flush();
    return map;
  };
  const xs = snap(contour.map(point => point[0]));
  const ys = snap(contour.map(point => point[1]));
  const snapped = contour.map(([x, y]) => [xs.get(x), ys.get(y)])
    .filter((point, index, all) => { const next = all[(index + 1) % all.length]; return point[0] !== next[0] || point[1] !== next[1]; });
  return snapped.filter((point, index) => {
    const previous = snapped[(index + snapped.length - 1) % snapped.length];
    const next = snapped[(index + 1) % snapped.length];
    return (point[0] - previous[0]) * (next[1] - point[1]) !== (point[1] - previous[1]) * (next[0] - point[0]);
  });
}

export default function PixelLogo({ paused = false }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const anchorRef = useRef(null);
  const pausedRef = useRef(paused);
  const wakeRef = useRef(null);
  const [ready, setReady] = useState(false);
  pausedRef.current = paused;

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    let disposed = false;
    let renderer, geometry, sculpture, scene, camera, reflection, grainTexture;
    let Box3, Vector3;
    let materials = [];
    let raf = 0;
    let last = 0;
    let elapsed = 0;
    let visible = true;
    let contextLost = false;
    let reduced = preference.matches;
    let hasRendered = false;
    let anchorDirty = true;

    const stop = () => { cancelAnimationFrame(raf); raf = 0; last = 0; };
    const canRender = () => !disposed && renderer && sculpture && visible && !document.hidden && !contextLost;
    const setAnchor = (left, top, width, height) => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      Object.assign(anchor.style, { left: `${left}px`, top: `${top}px`, width: `${width}px`, height: `${height}px` });
    };
    const updateAnchor = () => {
      sculpture.updateMatrixWorld(true);
      camera.updateMatrixWorld(true);
      const bounds = new Box3().setFromObject(sculpture);
      const width = container.clientWidth, height = container.clientHeight;
      let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
      for (const x of [bounds.min.x, bounds.max.x]) {
        for (const y of [bounds.min.y, bounds.max.y]) {
          for (const z of [bounds.min.z, bounds.max.z]) {
            const point = new Vector3(x, y, z).project(camera);
            const screenX = (point.x + 1) * width / 2, screenY = (1 - point.y) * height / 2;
            left = Math.min(left, screenX); right = Math.max(right, screenX);
            top = Math.min(top, screenY); bottom = Math.max(bottom, screenY);
          }
        }
      }
      setAnchor(left, top, right - left, bottom - top);
      anchorDirty = false;
    };
    const draw = time => {
      raf = 0;
      if (!canRender()) { last = 0; return; }
      const animated = !pausedRef.current && !reduced;
      if (animated && last) elapsed += Math.min((time - last) / 1000, .05);
      last = animated ? time : 0;
      const phase = elapsed * Math.PI * 2 / 32;
      sculpture.rotation.set(-.11, -.28 + phase - .72 * Math.sin(phase), -.055);
      sculpture.position.y = reduced ? 0 : Math.sin(elapsed * .8) * .065;
      try {
        renderer.render(scene, camera);
        if (anchorDirty || !hasRendered) updateAnchor();
        if (!hasRendered) { hasRendered = true; setReady(true); }
      } catch {
        contextLost = true; hasRendered = false; setReady(false); return;
      }
      if (animated) raf = requestAnimationFrame(draw);
    };
    const wake = () => { if (!raf && canRender()) raf = requestAnimationFrame(draw); };
    wakeRef.current = () => { stop(); wake(); };
    const resize = () => {
      if (disposed) return;
      const { width, height } = container.getBoundingClientRect();
      if (!width || !height) return;
      const fallbackWidth = Math.min(width * .7, height * .7 * 128 / 124);
      setAnchor((width - fallbackWidth) / 2, (height - fallbackWidth * 124 / 128) / 2, fallbackWidth, fallbackWidth * 124 / 128);
      if (!renderer || !camera) return;
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.position.z = Math.max(5.4, 5.1 / camera.aspect) / (2 * Math.tan(camera.fov * Math.PI / 360));
      camera.updateProjectionMatrix();
      anchorDirty = true;
      wake();
    };
    const onPreference = () => {
      reduced = preference.matches;
      if (reduced) elapsed = 0;
      anchorDirty = true;
      stop(); wake();
    };
    const onVisibility = () => { stop(); wake(); };
    const onContextLost = event => {
      event.preventDefault(); contextLost = true; hasRendered = false;
      stop(); setReady(false);
    };
    const onContextRestored = () => { contextLost = false; resize(); wake(); };
    const observer = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      stop(); wake();
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
        const THREE = await import('three');
        if (disposed) return;
        const image = new Image(); image.src = SYMBOL;
        await image.decode();
        if (disposed) return;
        const mask = document.createElement('canvas');
        mask.width = image.naturalWidth; mask.height = image.naturalHeight;
        const context = mask.getContext('2d', { willReadFrequently: true });
        if (!context) return;
        context.drawImage(image, 0, 0);
        const { data } = context.getImageData(0, 0, mask.width, mask.height);
        const contours = traceMask(data, mask.width, mask.height);
        // The supplied symbol is one connected, open-bottom silhouette, with no holes.
        if (contours.length !== 1) return;
        const webgl = canvas.getContext('webgl2', { alpha: true, antialias: true, powerPreference: 'low-power' });
        if (!webgl) return;
        renderer = new THREE.WebGLRenderer({ canvas, context: webgl, alpha: true, antialias: true, powerPreference: 'low-power' });
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.08;
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(35, 1, .1, 50);
        ({ Box3, Vector3 } = THREE);

        const lightCards = document.createElement('canvas');
        lightCards.width = 256; lightCards.height = 128;
        const paint = lightCards.getContext('2d');
        if (paint) {
          const backdrop = paint.createLinearGradient(0, 0, 0, 128);
          backdrop.addColorStop(0, '#6a3fc4'); backdrop.addColorStop(.5, '#100a1e'); backdrop.addColorStop(1, '#2a1a4a');
          paint.fillStyle = backdrop; paint.fillRect(0, 0, 256, 128);
          paint.filter = 'blur(5px)';
          paint.fillStyle = '#ff5fdc'; paint.fillRect(22, 9, 26, 104); paint.fillRect(170, 12, 14, 91);
          paint.fillStyle = '#9a4dff'; paint.fillRect(109, 28, 12, 72);
          paint.fillStyle = '#39ff8a'; paint.fillRect(217, 20, 17, 89);
          const texture = new THREE.CanvasTexture(lightCards);
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.mapping = THREE.EquirectangularReflectionMapping;
          const generator = new THREE.PMREMGenerator(renderer);
          reflection = generator.fromEquirectangular(texture);
          scene.environment = reflection.texture;
          texture.dispose(); generator.dispose();
        }
        scene.add(new THREE.HemisphereLight(0xe7d6ff, 0x2a1250, 1.8));
        const key = new THREE.DirectionalLight(0xf3e8ff, 2.4); key.position.set(-3, 5, 7); scene.add(key);
        const pink = new THREE.DirectionalLight(0xff2bd0, 4); pink.position.set(5, 1, -2); scene.add(pink);
        const green = new THREE.DirectionalLight(0x39ff8a, 3.4); green.position.set(-4, 2, -4); scene.add(green);
        const violet = new THREE.DirectionalLight(0x8a2bff, 3); violet.position.set(0, -4, 5); scene.add(violet);
        // Film-grain texture: speckled luminance for colour, bump and roughness so the metal reads as sandy and glowing.
        const grain = document.createElement('canvas');
        grain.width = grain.height = 256;
        const grainContext = grain.getContext('2d');
        if (grainContext) {
          const noise = grainContext.createImageData(256, 256);
          for (let i = 0; i < noise.data.length; i += 4) {
            const value = 55 + Math.random() * 200;
            noise.data[i] = noise.data[i + 1] = noise.data[i + 2] = value; noise.data[i + 3] = 255;
          }
          grainContext.putImageData(noise, 0, 0);
          grainTexture = new THREE.CanvasTexture(grain);
          grainTexture.wrapS = grainTexture.wrapT = THREE.RepeatWrapping;
          grainTexture.repeat.set(7, 7);
        }
        const face = new THREE.MeshPhysicalMaterial({ color: 0xf2e8ff, map: grainTexture, bumpMap: grainTexture, bumpScale: 3.2, roughnessMap: grainTexture, roughness: .62, metalness: .35, clearcoat: .5, clearcoatRoughness: .4, envMapIntensity: 1.1, emissive: 0xff2bd0, emissiveMap: grainTexture, emissiveIntensity: .22 });
        const side = new THREE.MeshPhysicalMaterial({ color: 0x9a6bff, map: grainTexture, bumpMap: grainTexture, bumpScale: 3.2, roughnessMap: grainTexture, roughness: .6, metalness: .7, clearcoat: .4, clearcoatRoughness: .4, envMapIntensity: 1.3, emissive: 0xb23cff, emissiveMap: grainTexture, emissiveIntensity: .3 });
        materials = [face, side];
        const shape = new THREE.Shape(regularize(contours[0], 3.5).map(([x, y]) => new THREE.Vector2((x - mask.width / 2) / 32, (mask.height / 2 - y) / 32)));
        const depth = .68;
        // Negative offset keeps the bevel inside the traced source outline.
        geometry = new THREE.ExtrudeGeometry(shape, { depth, steps: 1, bevelEnabled: true, bevelThickness: .035, bevelSize: .014, bevelOffset: -.014, bevelSegments: 2, curveSegments: 1 });
        geometry.translate(0, 0, -depth / 2);
        sculpture = new THREE.Mesh(geometry, materials);
        scene.add(sculpture);
        resize(); wake();
      } catch {
        if (!disposed) setReady(false);
      }
    };
    initialize(); resize();

    return () => {
      disposed = true; stop(); wakeRef.current = null;
      observer.disconnect(); sizeObserver.disconnect();
      preference.removeEventListener('change', onPreference);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      geometry?.dispose(); materials.forEach(material => material.dispose());
      grainTexture?.dispose(); reflection?.dispose(); renderer?.dispose();
    };
  }, []);

  useEffect(() => { wakeRef.current?.(); }, [paused]);

  return <div ref={containerRef} className={`pixel-logo${ready ? ' is-ready' : ''}`} data-ready={ready} aria-hidden="true">
    <img className="pixel-logo-fallback" src={SYMBOL} width="128" height="124" alt="" />
    <canvas ref={canvasRef} className="pixel-logo-canvas" />
    <span ref={anchorRef} className="pixel-logo-anchor" />
  </div>;
}
