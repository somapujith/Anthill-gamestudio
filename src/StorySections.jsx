import { useEffect, useRef } from 'react';
import { ArrowDownRight, ArrowUpRight, MoveUpRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './story-sections.css';

gsap.registerPlugin(ScrollTrigger);

const stages = [
  { number: '01', title: 'Find the world.', description: 'Identify compelling Indian stories and explore the rights, audiences and game possibilities behind them.', detail: 'IP DISCOVERY + PROJECT DESIGN' },
  { number: '02', title: 'Make it playable.', description: 'Bring Indian creative talent and Finnish game expertise together. Build a demo or vertical slice that proves the play.', detail: 'CO-CREATION + VERTICAL SLICE' },
  { number: '03', title: 'Take it further.', description: 'Use that playable proof to pursue project funding, publishing partners and a route to global audiences.', detail: 'FINANCING + PUBLISHING' },
];

const revenues = [
  { number: '01', label: 'Create.', name: 'Development services', description: 'Game development, animation and VFX capacity for external projects. Creative work that builds capability and generates service revenue.', note: 'CAPABILITY INTO CASH FLOW' },
  { number: '02', label: 'Connect.', name: 'Coordination fees', description: 'Project structuring, financing coordination and production management. Bringing the right people and resources around each game.', note: 'PARTNERSHIP INTO PROGRESS' },
  { number: '03', label: 'Compound.', name: 'Portfolio equity', description: 'A proposed holding-company stake in individual titles, with potential long-term value from royalties, licensing and IP sales.', note: 'OWNERSHIP INTO LONG-TERM VALUE' },
];

function PixelMark({ className = '' }) {
  return <svg className={className} viewBox="0 0 100 100" aria-hidden="true"><path d="M40 0h20v20h20v20h20v60H65V70H35v30H0V40h20V20h20z" fill="currentColor" /></svg>;
}

export default function StorySections() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const removeListeners = [];
      const ctx = gsap.context(() => {
        gsap.utils.toArray('[data-story-reveal]').forEach((element) => {
          gsap.fromTo(element, { y: 44, opacity: 0 }, {
            y: 0, opacity: 1, duration: 0.95, ease: 'power3.out',
            scrollTrigger: { trigger: element, start: 'top 91%', once: true },
          });
        });
        gsap.utils.toArray('[data-story-heading]').forEach((heading) => {
          gsap.fromTo(heading.querySelectorAll('.story-heading-line'), { y: 30, rotation: 1.3 }, {
            y: 0, rotation: 0, duration: 1.35, stagger: 0.1, ease: 'expo.out', immediateRender: false,
            scrollTrigger: { trigger: heading, start: 'top 89%', once: true },
          });
        });
        const verticalBridge = window.matchMedia('(max-width: 700px)').matches;
        gsap.fromTo('.bridge-signal-track', verticalBridge ? { scaleY: 0 } : { scaleX: 0 }, {
          scaleX: 1, scaleY: 1, duration: 1.6, ease: 'power2.inOut',
          scrollTrigger: { trigger: '.bridge-connection', start: 'top 82%', once: true },
        });
        gsap.to('.story-floating-mark', {
          y: -65, rotation: 9, ease: 'none',
          scrollTrigger: { trigger: '#story', start: 'top bottom', end: 'bottom top', scrub: 1.4 },
        });
        gsap.fromTo('.story-play-line em', { '--story-highlight': '0%' }, {
          '--story-highlight': '100%', ease: 'none',
          scrollTrigger: { trigger: '#story-title', start: 'top 80%', end: 'bottom 36%', scrub: 0.8 },
        });
        gsap.to('.story-bottom-line span', {
          y: -8, stagger: 0.06, ease: 'none',
          scrollTrigger: { trigger: '.story-bottom-line', start: 'top 95%', end: 'top 50%', scrub: 1 },
        });
        if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
          gsap.utils.toArray('.model-revenue-row').forEach((row) => {
            const title = row.querySelector('h3');
            const moveX = gsap.quickTo(title, 'x', { duration: 0.55, ease: 'power3.out' });
            const moveY = gsap.quickTo(title, 'y', { duration: 0.55, ease: 'power3.out' });
            const move = (event) => {
              const bounds = row.getBoundingClientRect();
              const progress = (event.clientX - bounds.left) / bounds.width;
              moveX(5 + progress * 9);
              moveY(((event.clientY - bounds.top) / bounds.height - 0.5) * 6);
              row.style.setProperty('--model-pointer', `${progress * 100}%`);
            };
            const leave = () => { moveX(0); moveY(0); };
            row.addEventListener('pointermove', move);
            row.addEventListener('pointerleave', leave);
            removeListeners.push(() => {
              row.removeEventListener('pointermove', move);
              row.removeEventListener('pointerleave', leave);
              row.style.removeProperty('--model-pointer');
            });
          });
        }
      }, sectionRef);
      return () => { removeListeners.forEach((remove) => remove()); ctx.revert(); };
    });
    return () => media.revert();
  }, []);

  return (
    <div ref={sectionRef} className="story-sections">
      <section className="story-manifesto" id="story" aria-labelledby="story-title">
        <div className="story-section-top"><span className="story-eyebrow">02 / THE BIG IDEA</span><span className="story-eyebrow story-side-note">LOCAL ROOTS. LIMITLESS WORLDS.</span></div>
        <div className="story-manifesto-grid">
          <div className="story-manifesto-heading">
            <h2 id="story-title" data-story-heading><span className="story-heading-line">India has</span><span className="story-heading-line">stories.</span><span className="story-play-line story-heading-line">Let’s <em>play</em><ArrowDownRight className="story-heading-arrow" strokeWidth={1.2} /></span><span className="story-heading-line">them.</span></h2>
          </div>
          <div className="story-manifesto-aside">
            <div className="story-icon-orbit" aria-hidden="true"><PixelMark className="story-floating-mark" /><span>ROOTED IN INDIA · BUILT TO TRAVEL · </span></div>
            <div className="story-manifesto-copy" data-story-reveal>
              <p className="story-lead">From the streets we know.<br />To worlds we’ve never played.</p>
              <p>India’s cinema, culture and mythology are full of worlds worth stepping into. We see the possibility of turning that storytelling energy into games with global ambition.</p>
              <p>The proposal brings Indian IP, audiences and production talent together with Finnish and wider Nordic game expertise, European funding opportunities and international networks.</p>
              <a className="story-text-link" href="#approach">A NEW WAY TO BUILD WORLDS <ArrowDownRight size={19} /></a>
            </div>
          </div>
        </div>
        <div className="story-bottom-line"><span>INDIAN STORIES.</span><span>INTERNATIONAL CO-CREATION.</span><span>GLOBAL PLAY.</span></div>
      </section>

      <section className="bridge-section" id="approach" aria-labelledby="bridge-title">
        <div className="story-section-top"><span className="story-eyebrow">03 / THE CO-CREATION PROPOSAL</span><span className="story-eyebrow story-side-note">TWO ECOSYSTEMS. ONE AMBITION.</span></div>
        <div className="bridge-heading-wrap"><h2 id="bridge-title" data-story-heading><span className="story-heading-line">Different worlds.</span><em className="story-heading-line">Better together.</em></h2><p data-story-reveal>A bridge between storytelling power<br />and the craft of making great games.</p></div>
        <div className="bridge-connection" aria-label="Connecting India with Finland and the Nordics">
          <div className="bridge-location bridge-location-india" data-story-reveal><span className="bridge-coordinate">20.5937° N / 78.9629° E</span><div className="bridge-location-name">India<span className="bridge-location-dot" /></div><p>Stories. Audiences.<br />Creative & production talent.</p></div>
          <div className="bridge-signal" aria-hidden="true"><span className="bridge-signal-track"><i className="bridge-signal-particle" /><i className="bridge-signal-particle bridge-signal-particle-return" /></span><span className="bridge-signal-center"><svg viewBox="0 0 40 40"><path d="M5 13h29m-7-7 7 7-7 7M35 27H6m7 7-7-7 7-7" /></svg></span><span className="bridge-signal-caption">CO-CREATE / CROSS-POLLINATE</span></div>
          <div className="bridge-location bridge-location-nordic" data-story-reveal><span className="bridge-coordinate">60.1699° N / 24.9384° E</span><div className="bridge-location-name">Nordics<span className="bridge-location-dot" /></div><p>Finnish game craft. European funding.<br />Publishing & global networks.</p></div>
        </div>
        <div className="bridge-stage-grid">
          {stages.map((stage) => <article className="bridge-stage" key={stage.number} data-story-reveal><div className="bridge-stage-top"><span>{stage.number}</span><ArrowUpRight size={23} strokeWidth={1.3} /></div><h3>{stage.title}</h3><p>{stage.description}</p><span className="bridge-stage-detail">{stage.detail}</span></article>)}
        </div>
        <div className="bridge-project-note" data-story-reveal><img className="bridge-project-logo" src="/assets/official-symbol.webp" alt="Anthill" /><div><span className="story-eyebrow">ONE TITLE. ITS OWN STRUCTURE.</span><p>Each proposed game sits in a dedicated project company (SPV), keeping its funding, ownership and project economics distinct. The parent company is designed to hold equity across a portfolio of titles.</p></div><span className="bridge-note-corner" aria-hidden="true">↳</span></div>
      </section>

      <section className="model-section" id="model" aria-labelledby="model-title">
        <div className="story-section-top"><span className="story-eyebrow">04 / THE BUSINESS BEHIND THE PLAY</span><span className="story-eyebrow story-side-note">BUILT FOR MORE THAN ONE GAME.</span></div>
        <div className="model-heading"><h2 id="model-title" data-story-heading><span className="story-heading-line">Create today.</span><em className="story-heading-line">Own a little tomorrow.</em></h2><p data-story-reveal>Three complementary revenue layers.<br />One proposed platform for building lasting value.</p></div>
        <div className="model-revenue-list">
          {revenues.map((revenue) => <article key={revenue.number} className="model-revenue-row" data-story-reveal><span className="model-number">({revenue.number})</span><div className="model-revenue-title"><h3>{revenue.label}</h3><span>{revenue.name}</span></div><div className="model-revenue-description"><p>{revenue.description}</p><span>{revenue.note}</span></div><MoveUpRight className="model-row-arrow" size={34} strokeWidth={1.2} aria-hidden="true" /></article>)}
        </div>
        <p className="model-proposal-footnote"><span aria-hidden="true">*</span> A concept built from the Infuse partnership proposal. Project rights, partnerships, financing and commercial terms are subject to development and agreement.</p>
      </section>
    </div>
  );
}
