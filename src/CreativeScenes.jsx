import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDownRight } from 'lucide-react';
import './creative-scenes.css';
import './worlds-polish.css';

gsap.registerPlugin(ScrollTrigger);

const directions = [
  {
    number: '01',
    name: 'Larger than life',
    title: <>Mass heroes.<br /><em data-text="Pixel legends.">Pixel legends.</em></>,
    description: 'The swagger of Indian content, reimagined as a bold new world. Big personalities, unmistakable attitude and a visual language that crosses borders.',
    notes: ['Indian content & character', 'Bollywood-inspired'],
    image: 'mass-heroes.webp',
    alt: 'A larger-than-life Indian action hero in a red jacket and gold sunglasses, rendered in sculptural pixels.',
    className: 'cv-mass',
    caption: 'Character study / Sculptural pixels',
    width: 695,
  },
  {
    number: '02',
    name: 'A city with a pulse',
    title: <>Our streets.<br /><em data-text="New rules.">New rules.</em></>,
    description: 'Mumbai becomes a living comic. The colour, friction and everyday ambition of the city open up an original perspective on a world in motion.',
    notes: ['Place & perspective', 'Mumbai-inspired'],
    image: 'mumbai.webp',
    alt: 'A vibrant comic-book vision of Mumbai, with a motorcycle rider against a dense, colourful city.',
    className: 'cv-mumbai',
    caption: 'City study / Mumbai in motion',
    width: 755,
  },
  {
    number: '03',
    name: 'Ancient meets possible',
    title: <>Ancient stories.<br /><em data-text="New futures.">New futures.</em></>,
    description: 'A post-collapse world shaped by Hindu mythology. Ancient imagination meets speculative futures, creating a canvas for stories that feel both familiar and entirely new.',
    notes: ['Myth & imagination', 'Future-facing worlds'],
    image: 'myth.webp',
    alt: 'A cinematic, post-collapse landscape drawing on Hindu mythology, with monumental architecture and atmospheric light.',
    className: 'cv-myth',
    caption: 'Environment study / Mythic futures',
    width: 809,
  },
];

export default function CreativeScenes() {
  const sectionRef = useRef(null);

  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        const frames = gsap.utils.toArray('.cv-chapter');
        frames.forEach((frame) => {
          const picture = frame.querySelector('.cv-picture img');
          const line = frame.querySelector('.cv-progress-fill');
          gsap.fromTo(picture, { yPercent: -3, scale: 1.05 }, {
            yPercent: 3,
            scale: 1.05,
            ease: 'none',
            scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: 1.2 },
          });
          gsap.fromTo(line, { scaleX: 0 }, {
            scaleX: 1,
            ease: 'none',
            scrollTrigger: { trigger: frame, start: 'top 85%', end: 'bottom 35%', scrub: 0.6 },
          });
          gsap.from(frame.querySelectorAll('.cv-content > *'), {
            y: 24,
            duration: 1,
            stagger: 0.09,
            ease: 'power3.out',
            scrollTrigger: { trigger: frame, start: 'top 85%', once: true },
          });
        });
      }, sectionRef);
      return () => context.revert();
    });
    return () => media.revert();
  }, []);

  return (
    <section className="cv-worlds" id="worlds" aria-labelledby="cv-heading" ref={sectionRef}>
      <div className="cv-intro" data-entrance>
        <p className="cv-eyebrow"><span className="cv-status-dot" /> 02 / Inside our imagination</p>
        <div className="cv-intro-grid">
          <h2 id="cv-heading">Familiar soul.<br /><em>Uncharted worlds.</em></h2>
          <div className="cv-intro-copy">
            <p>The swagger. The spectacle. The stories that become part of us. A glimpse of how Indian content can open up entirely new worlds of play.</p>
            <span className="cv-concept-note">World explorations / Concept art</span>
          </div>
        </div>
        <nav className="cv-scene-nav" aria-label="Explore our creative worlds">
          {directions.map((direction) => <a href={`#world-${direction.number}`} key={direction.number}><span>{direction.number}</span>{direction.name}<ArrowDownRight aria-hidden="true" size={16} /></a>)}
        </nav>
      </div>

      <div className="cv-chapters">
        {directions.map((direction) => (
          <article className={`cv-chapter ${direction.className}`} id={`world-${direction.number}`} key={direction.number} aria-labelledby={`cv-title-${direction.number}`}>
            <div className="cv-chapter-rail">
              <span className="cv-number">{direction.number}</span>
              <span>{direction.name}</span>
              <ArrowDownRight aria-hidden="true" size={19} strokeWidth={1.4} />
            </div>
            <div className="cv-content">
              <span className="cv-chapter-label">Anthill imagination / {direction.number}</span>
              <span className="cv-ghost-number" aria-hidden="true">{direction.number}</span>
              <h3 id={`cv-title-${direction.number}`}>{direction.title}</h3>
              <p>{direction.description}</p>
              <div className="cv-field-notes" aria-label="Creative direction">
                {direction.notes.map((note) => <span key={note}>{note}</span>)}
              </div>
            </div>
            <figure className="cv-picture">
              <img src={`/assets/${direction.image}`} alt={direction.alt} loading="lazy" width={direction.width} height="860" />
              <figcaption><span>{direction.caption}</span><span>CONCEPT / {direction.number}</span></figcaption>
            </figure>
            <div className="cv-progress" aria-hidden="true"><span className="cv-progress-fill" /></div>
          </article>
        ))}
      </div>
      <div className="cv-outro" data-entrance>
        <span className="cv-eyebrow">Origin: India / Reach: everywhere</span>
        <p>Our imagination<br /><em>has no borders.</em></p>
        <img src="/assets/studio-symbol.webp" alt="" width="70" height="73" loading="lazy" />
      </div>
    </section>
  );
}
