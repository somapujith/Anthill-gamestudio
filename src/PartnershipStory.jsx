import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, ArrowUpRight, Crosshair, MoveUpRight } from 'lucide-react';
import './partnership-story.css';

gsap.registerPlugin(ScrollTrigger);

const stages = [
  { number: '01', word: 'STORY', title: 'Start with something worth feeling.', text: 'The characters we remember. The myths we grow up with. The places that make us who we are. Great game worlds begin with a story that matters.', output: 'Character. Culture. A point of view.', coordinates: 'ORIGIN / IMAGINATION', image: '/assets/terrain.webp', tags: ['NARRATIVE', 'CHARACTER', 'CULTURE'] },
  { number: '02', word: 'WORLD', title: 'Give the imagination somewhere to live.', text: 'Shape the visual language, atmosphere and identity of a world. Every environment, silhouette and sound should make you feel you have stepped into somewhere of its own.', output: 'Art direction. Atmosphere. Identity.', coordinates: 'WORLD / IN FORMATION', image: '/assets/energy.webp', tags: ['ART DIRECTION', 'ENVIRONMENT', 'ATMOSPHERE'] },
  { number: '03', word: 'PLAY', title: 'Make the story something you do.', text: 'Turn that world into choices, movement and discovery. Explore, test and refine how it feels to play, so the experience carries the same ambition as the idea.', output: 'Interaction. Discovery. Connection.', coordinates: 'EXPERIENCE / IN MOTION', image: '/assets/terrain.webp', tags: ['GAMEPLAY', 'ITERATION', 'DISCOVERY'] },
];

const disciplines = [
  { number: '01', title: 'INDIAN SOUL.', accent: 'GLOBAL AMBITION.', text: 'The deeper essence of Indian cinema is our starting point. Its emotion, characters and cultural power deserve original worlds audiences everywhere can make their own.', label: 'OUR SOURCE' },
  { number: '02', title: 'FINNISH CRAFT.', accent: 'EVERY DETAIL.', text: 'Finnish game-making expertise brings our ambition to life. From worldbuilding to the feeling of play, the craft must be as powerful as the story.', label: 'OUR DISCIPLINE' },
  { number: '03', title: 'SET THE', accent: 'STANDARD.', text: 'Our ambition is to build the definitive games of Indian storytelling. Worlds made to a standard the world will measure itself against.', label: 'OUR CONVICTION' },
];

export default function PartnershipStory() {
  const root = useRef(null);
  const [stage, setStage] = useState(0);
  const current = stages[stage];

  useEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.to('.sc-signal-travel', { xPercent: 680, duration: 4.5, repeat: -1, repeatDelay: 1, ease: 'power1.inOut' });
        gsap.to('.sc-blueprint-grid', { backgroundPosition: '48px 48px', duration: 9, repeat: -1, ease: 'none' });
        gsap.utils.toArray('.sc-principle').forEach((el) => {
          gsap.from(el, { y: 28, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.sc-stage-word', { y: 18, opacity: .45 }, { y: 0, opacity: 1, duration: .6, ease: 'power3.out' });
      gsap.fromTo('.sc-stage-details', { y: 9, opacity: .5 }, { y: 0, opacity: 1, duration: .45, ease: 'power2.out' });
    }, root);
    return () => ctx.revert();
  }, [stage]);

  return <div ref={root} className="sc-studio">
    <section id="approach" className="sc-approach" aria-labelledby="sc-approach-title">
      <div className="sc-section-top" data-entrance><span><i /> INSIDE THE STUDIO</span><span>03 / THE PROCESS</span></div>
      <div className="sc-heading-row" data-entrance>
        <h2 id="sc-approach-title">FROM A SPARK.<br /><em>TO A WORLD.</em></h2>
        <p>A film makes you feel a world. A game lets you live it. We carry the emotion of Indian storytelling into every character, environment and moment of play.</p>
      </div>
      <div className={`sc-workbench sc-workbench--${stage}`} data-entrance>
        <div className="sc-workbench-label"><span><Crosshair size={17} aria-hidden="true" /> CREATIVE BLUEPRINT</span><span>ANTHILL / {current.number}</span></div>
        <div className="sc-stage-navigation" aria-label="Explore our creative process">
          {stages.map((item, index) => <button type="button" key={item.word} className={stage === index ? 'is-active' : ''} aria-pressed={stage === index} onClick={() => setStage(index)}><span>{item.number}</span><strong>{item.word}</strong><ArrowUpRight aria-hidden="true" size={22} /></button>)}
        </div>
        <div className="sc-stage-content">
          <div className="sc-visual" aria-hidden="true">
            <img className="sc-stage-art" src={current.image} alt="" loading="lazy" />
            <div className="sc-blueprint-grid" />
            <span className="sc-coordinate sc-coordinate--top">{current.coordinates}</span>
            <div className="sc-viewfinder"><i /><i /><i /><i /><span className="sc-stage-word">{current.word}</span></div>
            <div className="sc-visual-footer"><span>IDEA → EXPERIENCE</span><Crosshair size={23} /></div>
          </div>
          <div className="sc-stage-details" aria-live="polite" aria-atomic="true">
            <span className="sc-eyebrow">{current.number} / THE {current.word}</span>
            <h3>{current.title}</h3>
            <p>{current.text}</p>
            <div className="sc-tags">{current.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
            <div className="sc-stage-output"><ArrowRight size={20} aria-hidden="true" /><span>{current.output}</span></div>
          </div>
        </div>
        <div className="sc-transmission" aria-hidden="true"><i className="sc-signal-travel" /></div>
        <div className="sc-workbench-footer"><span>STORY INFORMS THE WORLD. THE WORLD SHAPES THE PLAY.</span><span>ALWAYS CONNECTED <i /></span></div>
      </div>
    </section>
    <section id="model" className="sc-craft" aria-labelledby="sc-craft-title">
      <div className="sc-section-top" data-entrance><span><i /> THE ANTHILL MINDSET</span><span>04 / OUR DNA</span></div>
      <div className="sc-craft-heading" data-entrance><span className="sc-eyebrow">THE ANTHILL CONVICTION.</span><h2 id="sc-craft-title">OUR STORIES.<br /><span>A NEW STANDARD.</span></h2><p>The definitive games of Indian storytelling. Built with the ambition to set a global standard.</p></div>
      <div className="sc-principles">
        {disciplines.map(item => <article className="sc-principle" key={item.number}><div className="sc-principle-index"><span>{item.number}</span><MoveUpRight size={30} strokeWidth={1.3} aria-hidden="true" /></div><h3 className="sc-principle-title">{item.title}<br /><em>{item.accent}</em></h3><div className="sc-principle-copy"><span className="sc-eyebrow">{item.label}</span><p>{item.text}</p></div></article>)}
      </div>
      <div className="sc-craft-signoff" data-entrance><span>INDIAN ROOTS.</span><span>BOUNDLESS IMAGINATION.</span><ArrowUpRight size={26} aria-hidden="true" /></div>
    </section>
  </div>;
}
