import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import './story-polish.css';

gsap.registerPlugin(ScrollTrigger);

export default function CinemaSequence() {
  const root = useRef(null);

  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference) and (min-width: 901px) and (min-height: 700px)', () => {
      const context = gsap.context(() => {
        const track = root.current.querySelector('.cinema-scroll-track');
        gsap.to('.cinema-backdrop img', { scale: 1.08, yPercent: -2, ease: 'none', scrollTrigger: { trigger: track, start: 'top top', end: 'bottom bottom', scrub: 1 } });
        const timeline = gsap.timeline({ scrollTrigger: { trigger: track, start: 'top top', end: 'bottom bottom', scrub: .7 } });
        timeline.to('.cinema-first', { opacity: 0, y: -32, duration: .24 }, .2)
          .fromTo('.cinema-second', { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: .3 }, .34)
          .to('.cinema-progress span', { scaleY: 1, ease: 'none', duration: 1 }, 0);
      }, root);
      return () => context.revert();
    });
    media.add('(prefers-reduced-motion: no-preference) and (max-width: 900px), (prefers-reduced-motion: no-preference) and (max-height: 699px)', () => {
      const context = gsap.context(() => {
        gsap.utils.toArray('.cinema-statement').forEach(statement => gsap.from(statement, { y: 28, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: statement, start: 'top 92%', once: true } }));
      }, root);
      return () => context.revert();
    });
    return () => media.revert();
  }, []);

  return <section className="cinema-sequence" ref={root} aria-label="The power of Indian storytelling">
    <div className="cinema-scroll-track"><div className="cinema-sticky">
      <div className="cinema-backdrop" aria-hidden="true"><img src="/assets/frames.webp" alt="" loading="lazy" width="565" height="860" /></div>
      <div className="cinema-meta"><span>THE MOST POWERFUL NARRATIVE ENGINE ON EARTH.</span><span>INDIAN CONTENT / REIMAGINED</span></div>
      <div className="cinema-statements">
        <div className="cinema-statement cinema-first"><span className="eyebrow">IT STARTS WITH A FEELING.</span><h2>CHARACTERS<br />THAT BECOME<br /><em>CULTURE.</em></h2><p>Indian content moves hundreds of millions.<br />We hold the insight and the network to that source.</p></div>
        <div className="cinema-statement cinema-second"><span className="eyebrow">THE NEXT CHAPTER IS PLAYABLE.</span><h2>STEP INSIDE<br />THE STORY.<br /><em>LIVE THE WORLD.</em></h2><p>We bring the emotion off the screen.<br />And put you at the heart of the story.</p></div>
      </div>
      <div className="cinema-progress" aria-hidden="true"><span /></div>
      <div className="cinema-bottom"><span>FROM AUDIENCE TO PLAYER.</span><ArrowDownRight size={30} /><span>STUDIO PORTAL / IDENTITY ARTWORK</span></div>
    </div></div>
    <div className="craft-connection"><div data-entrance><span className="eyebrow">TWO CREATIVE FORCES. ONE EXTRAORDINARY AMBITION.</span><p>INDIA <span>×</span> THE NORDICS</p><span className="craft-location">BASED IN HELSINKI &amp; HYDERABAD</span><figure className="craft-pixel-route" aria-label="A creative connection between Hyderabad and Helsinki"><svg viewBox="0 0 520 72" aria-hidden="true"><path className="craft-route-line" d="M16 54H122V38H252V22H390V10H504" /><path className="craft-route-highlight" d="M16 54H122V38H252V22H390V10H504" /><rect x="10" y="48" width="12" height="12" /><rect x="498" y="4" width="12" height="12" /></svg><figcaption><span>HYDERABAD</span><span>SHARED AMBITION</span><span>HELSINKI</span></figcaption></figure></div><div className="craft-connection-copy" data-entrance><p>Original worlds. Unmistakable emotion. Indian storytelling meets Nordic game craft at its highest level.</p><a href="#approach">Meet the mindset <ArrowUpRight size={20} /></a></div></div>
  </section>;
}
