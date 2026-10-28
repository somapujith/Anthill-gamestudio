import { useState } from 'react';
import { Pause, Play } from 'lucide-react';
import Aurora from './Aurora.jsx';
import PixelLogo from './PixelLogo.jsx';
import './hero-scene.css';

export default function HeroScene({ introActive = false }) {
  const [paused, setPaused] = useState(false);
  const motionPaused = paused || introActive;

  return <figure className={`hero-artwork hero-scene${motionPaused ? ' is-paused' : ''}`} aria-label="The Anthill pixel symbol in prismatic glass, floating in a violet aurora">
    <div className="hero-scene-atmosphere" aria-hidden="true">
      <Aurora speed={0.55} opacity={0.95} paused={motionPaused} />
    </div>
    <div className="hero-scene-sculpture" aria-hidden="true"><PixelLogo paused={motionPaused} /></div>
    <div className="hero-scene-ground" aria-hidden="true" />
    <figcaption className="hero-scene-caption"><span>AN ENTIRELY<br /><em>NEW DIMENSION.</em></span></figcaption>
    <button className="hero-scene-pause" type="button" aria-label={paused ? 'Play hero animation' : 'Pause hero animation'} aria-pressed={paused} onClick={() => setPaused(value => !value)} title={paused ? 'Play animation' : 'Pause animation'}>{paused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}</button>
  </figure>;
}
