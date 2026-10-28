import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function CinemaSequence() {
  const root = useRef(null);

  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference) and (min-width: 901px) and (min-height: 700px)', () => {
      const context = gsap.context(() => {
        const track = root.current.querySelector('.cinema-scroll-track');
        gsap.to('.cinema-backdrop img', { scale: 1.18, yPercent: -5, ease: 'none', scrollTrigger: { trigger: track, start: 'top top', end: 'bottom bottom', scrub: 1 } });
        const timeline = gsap.timeline({ scrollTrigger: { trigger: track, start: 'top top', end: 'bottom bottom', scrub: .7 } });
        timeline.to('.cinema-first', { opacity: 0, y: -65, duration: .38 }, .24)
          .fromTo('.cinema-second', { opacity: 0, y: 65 }, { opacity: 1, y: 0, duration: .4 }, .3)
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
      <div className="cinema-backdrop" aria-hidden="true"><img src="/assets/mass-heroes.webp" alt="" loading="lazy" /></div>
      <div className="cinema-meta"><span>THE MOST POWERFUL NARRATIVE ENGINE ON EARTH.</span><span>INDIAN CONTENT / REIMAGINED</span></div>
      <div className="cinema-statements">
        <div className="cinema-statement cinema-first"><span className="eyebrow">IT STARTS WITH A FEELING.</span><h2>CHARACTERS<br />THAT BECOME<br /><em>CULTURE.</em></h2><p>Indian content moves hundreds of millions.<br />We hold the insight and the network to that source.</p></div>
        <div className="cinema-statement cinema-second"><span className="eyebrow">THE NEXT CHAPTER IS PLAYABLE.</span><h2>STEP INSIDE<br />THE STORY.<br /><em>LIVE THE WORLD.</em></h2><p>We bring the emotion off the screen.<br />And put you at the heart of the story.</p></div>
      </div>
      <div className="cinema-progress" aria-hidden="true"><span /></div>
      <div className="cinema-bottom"><span>FROM AUDIENCE TO PLAYER.</span><ArrowDownRight size={30} /><span>ILLUSTRATIVE WORLD / CONCEPT ART</span></div>
    </div></div>
    <div className="craft-connection"><div data-entrance><span className="eyebrow">TWO CREATIVE FORCES. ONE EXTRAORDINARY AMBITION.</span><p>INDIA <span>×</span> THE NORDICS</p><span className="craft-location">BASED IN HELSINKI &amp; HYDERABAD</span></div><div className="craft-connection-copy" data-entrance><p>Original worlds. Unmistakable emotion. Indian storytelling meets Nordic game craft at its highest level.</p><a href="#approach">Meet the mindset <ArrowUpRight size={20} /></a></div></div>
  </section>;
}
