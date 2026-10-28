import { useState } from 'react';
import { Pause, Play } from 'lucide-react';
import GradientASCII from './GradientASCII.jsx';
import PixelLogo from './PixelLogo.jsx';
import './hero-scene.css';

const auroraColors = ['#f34431', '#a27780', '#d6ed79', '#f0eee6'];

export default function HeroScene() {
  const [paused, setPaused] = useState(false);

  return <figure className={`hero-artwork hero-scene${paused ? ' is-paused' : ''}`} aria-label="The Anthill pixel symbol in three dimensions">
    <div className="hero-scene-atmosphere" aria-hidden="true">
      <GradientASCII colors={auroraColors} shape="pinch" characters=" .:+xX#" cellSize={13} density={0.65} glyphOpacity={0.45} gradientOpacity={0.62} glow={0.12} softness={0.8} scale={1.1} flow={1.1} speed={0.4} grain={0.035} flicker={0.08} mouseInteraction={false} clickEffect="none" intro={false} dpr={1} paused={paused} />
    </div>
    <div className="hero-scene-sculpture" aria-hidden="true"><PixelLogo paused={paused} /></div>
    <div className="hero-scene-ground" aria-hidden="true" />
    <figcaption className="hero-scene-caption"><span>AN ENTIRELY<br /><em>NEW DIMENSION.</em></span></figcaption>
    <button className="hero-scene-pause" type="button" aria-label={paused ? 'Play hero animation' : 'Pause hero animation'} aria-pressed={paused} onClick={() => setPaused(value => !value)} title={paused ? 'Play animation' : 'Pause animation'}>{paused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}</button>
  </figure>;
}
