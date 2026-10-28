import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, ArrowUpRight, Crosshair, MoveUpRight } from 'lucide-react';
import './partnership-story.css';
import './story-polish.css';

gsap.registerPlugin(ScrollTrigger);

const stages = [
  { number: '01', word: 'STORY', title: 'Start with something worth feeling.', text: 'The characters we remember. The myths we grow up with. The places that make us who we are. Great game worlds begin with a story that matters.', output: 'Character. Culture. A point of view.', coordinates: 'ORIGIN / STORYBOARD', visualNotes: ['Setup', 'Discovery', 'Payoff'], tags: ['NARRATIVE', 'CHARACTER', 'CULTURE'] },
  { number: '02', word: 'WORLD', title: 'Give the imagination somewhere to live.', text: 'Shape the visual language, atmosphere and identity of a world. Every environment, silhouette and sound should make you feel you have stepped into somewhere of its own.', output: 'Art direction. Atmosphere. Identity.', coordinates: 'WORLD / SPATIAL BLOCKOUT', visualNotes: ['Shape', 'Scale', 'Paths'], tags: ['ART DIRECTION', 'ENVIRONMENT', 'ATMOSPHERE'] },
  { number: '03', word: 'PLAY', title: 'Make the story something you do.', text: 'Turn that world into choices, movement and discovery. Explore, test and refine how it feels to play, so the experience carries the same ambition as the idea.', output: 'Interaction. Discovery. Connection.', coordinates: 'PLAY / INTERACTION LOOP', visualNotes: ['Input', 'Choice', 'Feedback'], tags: ['GAMEPLAY', 'ITERATION', 'DISCOVERY'] },
];

function ProcessDrawing({ stage }) {
  if (stage === 0) return <svg className="sc-process-drawing sc-storyboard" viewBox="0 0 560 320" aria-hidden="true">
    <g className="sc-drawing-frames"><rect x="20" y="56" width="156" height="174" /><rect x="202" y="56" width="156" height="174" /><rect x="384" y="56" width="156" height="174" /></g>
    <g className="sc-drawing-muted" fill="none"><path d="M20 194l42-53 25 23 35-45 54 75M202 207h156M384 207h156" /><path d="M35 73h20m-20 0v20m286-20h20v20m181-20h-20v20" /></g>
    <g className="sc-drawing-cream"><circle cx="126" cy="98" r="15" /><circle cx="78" cy="157" r="9" /><path d="M66 197v-25h24v25m-12-25v38" fill="none" stroke="currentColor" strokeWidth="5" /><circle cx="245" cy="169" r="9" /><path d="M233 207v-23h24v23" fill="none" stroke="currentColor" strokeWidth="5" /></g>
    <path className="sc-drawing-accent" d="M280 207v-86h14V99h26v22h14v86m-37 0v-49h20v49" fill="none" strokeWidth="4" />
    <path className="sc-drawing-lime" d="M421 207v-88h15V97h30v22h15v88m-40 0v-50h20v50" fill="none" strokeWidth="4" />
    <path className="sc-drawing-cream" d="M459 184h39m-12-12 12 12-12 12" fill="none" strokeWidth="4" />
    <g className="sc-drawing-muted" fill="none" strokeDasharray="4 7"><path d="M98 252h182m0 0h182" /></g>
    <g className="sc-drawing-accent"><rect x="93" y="247" width="10" height="10" /><rect x="275" y="247" width="10" height="10" /><rect x="457" y="247" width="10" height="10" /></g>
  </svg>;
  if (stage === 1) return <svg className="sc-process-drawing sc-blockout" viewBox="0 0 560 320" aria-hidden="true">
    <g className="sc-drawing-muted" fill="none"><path d="M280 40 516 158 280 278 44 158Z" /><path d="m103 128 236 120m-177-149 236 119m-177-149 236 119M103 188 339 69M162 218 398 99M221 248 457 128" /></g>
    <g stroke="currentColor" strokeWidth="2" className="sc-drawing-lime"><path fill="#444d31" d="m214 111 66-34 66 34-66 34Z" /><path fill="#2d3522" d="m214 111 66 34v88l-66-34Z" /><path fill="#1c2316" d="m280 145 66-34v88l-66 34Z" /></g>
    <g stroke="#8c947e" strokeWidth="2"><path fill="#3a4031" d="m352 174 44-22 44 22-44 22Z" /><path fill="#282e22" d="m352 174 44 22v44l-44-22Z" /><path fill="#1b2117" d="m396 196 44-22v44l-44 22Z" /></g>
    <g stroke="#8c947e" strokeWidth="2"><path fill="#3a4031" d="m112 147 44-22 44 22-44 22Z" /><path fill="#282e22" d="m112 147 44 22v44l-44-22Z" /><path fill="#1b2117" d="m156 169 44-22v44l-44 22Z" /></g>
    <path className="sc-drawing-accent" fill="none" strokeWidth="5" d="m171 225 51 26 58-29m66-34 34-17 47 24" />
    <g className="sc-drawing-cream"><circle cx="168" cy="194" r="6" /><path d="M168 200v24m-7-17h14" fill="none" strokeWidth="4" /></g>
    <g className="sc-drawing-muted" fill="none" strokeDasharray="4 5"><path d="M280 77V28M346 111l43-22" /></g>
  </svg>;
  return <svg className="sc-process-drawing sc-interaction" viewBox="0 0 560 320" aria-hidden="true">
    <rect className="sc-drawing-frames" x="30" y="93" width="126" height="126" rx="5" />
    <path className="sc-drawing-cream" d="M79 119h28v23h23v28h-23v23H79v-23H56v-28h23Z" fill="none" strokeWidth="3" />
    <path className="sc-drawing-lime" d="m280 72 84 84-84 84-84-84Z" fill="#d6ed790b" strokeWidth="3" />
    <path className="sc-drawing-lime" d="M255 180v-47h50m-12-12 12 12-12 12m-38 12h35v35m-12-12 12 12 12-12" fill="none" strokeWidth="3" />
    <rect className="sc-drawing-frames" x="404" y="93" width="126" height="126" rx="5" />
    <path className="sc-drawing-accent" d="M438 195v-62h14v-18h28v18h14v62m-36 0v-36h16v36" fill="none" strokeWidth="4" />
    <path className="sc-drawing-cream" d="M162 156h27m-9-9 9 9-9 9m190-9h27m-9-9 9 9-9 9" fill="none" strokeWidth="3" />
    <path className="sc-drawing-muted" d="M467 232v43H93v-43m-9 9 9-9 9 9" fill="none" strokeWidth="2" strokeDasharray="5 6" />
    <rect className="sc-drawing-accent" x="274" y="269" width="12" height="12" />
  </svg>;
}

const disciplines = [
  { number: '01', title: 'INDIAN SOUL.', accent: 'GLOBAL AMBITION.', text: 'The deeper essence of Indian content is our starting point. Its emotion, characters and cultural power deserve original worlds audiences everywhere can make their own.', label: 'OUR SOURCE' },
  { number: '02', title: 'NORDIC CRAFT.', accent: 'EVERY DETAIL.', text: 'Nordic game-making expertise brings our ambition to life. From worldbuilding to the feeling of play, the craft must be as powerful as the story.', label: 'OUR DISCIPLINE' },
  { number: '03', title: 'SET THE', accent: 'STANDARD.', text: 'Our ambition is to build the definitive games of Indian storytelling. Worlds made to a standard the world will measure itself against.', label: 'OUR CONVICTION' },
];

export default function PartnershipStory() {
  const root = useRef(null);
  const [stage, setStage] = useState(0);
  const current = stages[stage];

  useEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const ctx = gsap.context(() => {
        gsap.to('.sc-signal-travel', { xPercent: 680, duration: 4.5, repeat: -1, repeatDelay: 1, ease: 'power1.inOut' });
        gsap.utils.toArray('.sc-principle').forEach((el) => {
          gsap.from(el, { y: 28, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
        });
      }, root);
      return () => ctx.revert();
    });
    return () => media.revert();
  }, []);

  useEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const ctx = gsap.context(() => {
        gsap.fromTo('.sc-process-drawing', { y: 12, opacity: .5 }, { y: 0, opacity: 1, duration: .36, ease: 'power2.out' });
        gsap.fromTo('.sc-stage-details', { y: 9, opacity: .5 }, { y: 0, opacity: 1, duration: .36, ease: 'power2.out' });
      }, root);
      return () => ctx.revert();
    });
    return () => media.revert();
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
          <figure className="sc-visual">
            <div className="sc-blueprint-grid" aria-hidden="true" />
            <span className="sc-coordinate sc-coordinate--top">{current.coordinates}</span>
            <ProcessDrawing stage={stage} />
            <figcaption className="sc-drawing-caption">{current.visualNotes.map((note, index) => <span key={note}><i aria-hidden="true">0{index + 1}</i>{note}</span>)}</figcaption>
            <div className="sc-visual-footer"><span>ILLUSTRATIVE PROCESS / {current.number}</span><Crosshair size={20} aria-hidden="true" /></div>
          </figure>
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
