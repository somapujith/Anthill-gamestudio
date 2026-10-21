import { useEffect, useId, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowDown, ArrowUpRight, Plus } from 'lucide-react';
import './people-contact.css';

gsap.registerPlugin(ScrollTrigger);

const people = [
  { name: 'Rana Daggubati', firstName: 'Rana', lastName: 'Daggubati', discipline: 'CINEMA × STORYTELLING', role: 'Actor, producer & entrepreneur', image: '/assets/rana-daggubati.webp', description: 'An actor, producer and entrepreneur working across Indian cinema. A perspective shaped by unforgettable characters, visual storytelling and the possibilities of entertainment.', source: 'https://www.anthillventures.com/mentors/rana-daggubati' },
  { name: 'Prasad Vanga', firstName: 'Prasad', lastName: 'Vanga', discipline: 'VISION × VENTURE BUILDING', role: 'Founder & CEO, Anthill Ventures', image: '/assets/prasad-vanga.webp', description: 'The founder of Anthill Ventures, bringing global strategy and venture-building experience. A builder’s perspective on connecting ambitious ideas, creative people and lasting businesses.', source: 'https://www.anthillventures.com/team/prasad-vanga' },
];

const invitations = [
  { label: 'I have a story', title: 'Your universe. Its next dimension.', description: 'A character, a film, a story that deserves a bigger world. Let’s talk about what it could become through interactive storytelling.', action: 'Bring us your story', subject: 'A story for Anthill Game Studios', note: 'FOR STORYTELLERS & IP OWNERS' },
  { label: 'I create worlds', title: 'Bring your craft. Break new ground.', description: 'Artists, developers, writers and creative teams: share your perspective, your craft and the worlds you want to build. Great ideas get bigger when the right people connect.', action: 'Introduce your craft', subject: 'A creative collaboration with Anthill Game Studios', note: 'FOR ARTISTS, DEVELOPERS & STUDIOS' },
  { label: 'Let’s collaborate', title: 'Different strengths. Shared ambition.', description: 'From entertainment to publishing and creative technology, we’re interested in people who see new possibilities. Tell us what you have in mind.', action: 'Start a conversation', subject: 'Let’s collaborate with Anthill Game Studios', note: 'FOR CREATIVE & INDUSTRY PARTNERS' },
];

export default function PeopleContact() {
  const root = useRef(null);
  const detail = useRef(null);
  const tabRefs = useRef([]);
  const [selected, setSelected] = useState(0);
  const uniqueId = useId().replace(/:/g, '');
  const invitation = invitations[selected];

  useEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const context = gsap.context(() => {
        gsap.utils.toArray('.pc-reveal').forEach(element => {
          gsap.from(element, { y: 36, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: element, start: 'top 94%', once: true } });
        });
        gsap.utils.toArray('.pc-portrait img').forEach(element => {
          gsap.fromTo(element, { yPercent: -2, scale: 1.04 }, { yPercent: 2, scale: 1.04, ease: 'none', scrollTrigger: { trigger: element.parentNode, start: 'top bottom', end: 'bottom top', scrub: 1.2 } });
        });
        gsap.from('.pc-connection-track', { scaleX: 0, transformOrigin: 'left', duration: 1.6, ease: 'power3.inOut', scrollTrigger: { trigger: '.pc-people-grid', start: 'top 85%', once: true } });
      }, root);
      return () => context.revert();
    });
    return () => media.revert();
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const tween = gsap.fromTo(detail.current, { opacity: 0.35, y: 12 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out', clearProps: 'transform,opacity' });
    return () => tween.kill();
  }, [selected]);

  function handleTabKey(event, index) {
    let next = index;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index + 1) % invitations.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index + invitations.length - 1) % invitations.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = invitations.length - 1;
    else return;
    event.preventDefault();
    setSelected(next);
    tabRefs.current[next]?.focus();
  }

  return <div ref={root} className="pc-root">
    <section id="people" className="pc-people" aria-labelledby="pc-people-title">
      <div className="pc-section-meta pc-reveal"><span>05 / PEOPLE & PERSPECTIVE</span><span>CREATIVE INSTINCT. BUILDER ENERGY.</span></div>
      <div className="pc-people-intro pc-reveal">
        <h2 id="pc-people-title">Story instinct.<br /><em>Builder mindset.</em></h2>
        <p>Indian cinema. Creative entrepreneurship. A shared belief that our stories can open up extraordinary new worlds.</p>
      </div>
      <div className="pc-people-grid">
        <div className="pc-connection" aria-hidden="true"><span className="pc-connection-track" /><span>STORY INSTINCT</span><Plus size={18} /><span>BUILDER MINDSET</span></div>
        {people.map((person, index) => <article key={person.name} className={`pc-person pc-person-${index + 1}`}>
          <div className="pc-portrait pc-reveal">
            <img src={person.image} alt={person.name} loading="lazy" width="1100" height="1375" />
            <div className="pc-portrait-shade" aria-hidden="true" />
            <span className="pc-portrait-index" aria-hidden="true">0{index + 1} <span>/ THE HUMAN ELEMENT</span></span>
            <span className="pc-photo-corner" aria-hidden="true" />
            <span className="pc-portrait-coordinate" aria-hidden="true">ANTHILL / PEOPLE</span>
          </div>
          <div className="pc-person-copy pc-reveal">
            <p className="pc-person-discipline">{person.discipline}</p>
            <h3>{person.firstName}<br />{person.lastName}<span>.</span></h3>
            <p className="pc-person-role">{person.role}</p>
            <p className="pc-person-description">{person.description}</p>
            <a className="pc-person-contact" href={person.source} target="_blank" rel="noopener noreferrer" aria-label={`Read more about ${person.name} on Anthill Ventures (opens in a new tab)`}>More about {person.firstName}<ArrowUpRight size={18} aria-hidden="true" /></a>
          </div>
        </article>)}
      </div>
      <p className="pc-people-note"><span aria-hidden="true">↳</span> Many perspectives. One creative ambition.</p>
    </section>

    <section id="contact" className="pc-contact" aria-labelledby="pc-contact-title">
      <img className="pc-contact-mark" src="/assets/official-symbol.webp" alt="" aria-hidden="true" loading="lazy" />
      <div className="pc-section-meta pc-reveal"><span>06 / OPEN A NEW CONNECTION</span><ArrowDown size={18} aria-hidden="true" /></div>
      <div className="pc-invitation-intro pc-reveal"><h2 id="pc-contact-title">Next world.<br /><em>Your move.</em></h2><p>Every great world starts with a conversation. Let’s start ours.</p></div>
      <div className="pc-invitation-layout pc-reveal">
        <div className="pc-invitation-tabs" role="tablist" aria-label="Choose your collaboration interest" aria-orientation="vertical">
          {invitations.map((item, index) => <button key={item.label} ref={element => { tabRefs.current[index] = element; }} type="button" role="tab" id={`${uniqueId}-tab-${index}`} aria-selected={selected === index} aria-controls={`${uniqueId}-panel-${index}`} tabIndex={selected === index ? 0 : -1} onClick={() => setSelected(index)} onKeyDown={event => handleTabKey(event, index)} className={`pc-invitation-tab ${selected === index ? 'pc-active' : ''}`}><span className="pc-choice-number">0{index + 1}</span><span>{item.label}</span><ArrowUpRight size={27} aria-hidden="true" /></button>)}
        </div>
        <div className="pc-invitation-panels">
          {invitations.map((item, index) => <div key={item.label} role="tabpanel" id={`${uniqueId}-panel-${index}`} aria-labelledby={`${uniqueId}-tab-${index}`} hidden={selected !== index} tabIndex={0} className="pc-invitation-panel">
            {selected === index && <div ref={detail}>
              <p className="pc-invitation-note">{invitation.note}</p><h3>{invitation.title}</h3><p className="pc-invitation-description">{invitation.description}</p>
              <a className="pc-contact-link" href={`mailto:Info@anthillventures.com?subject=${encodeURIComponent(invitation.subject)}`}>{invitation.action}<ArrowUpRight size={21} aria-hidden="true" /></a>
              <span className="pc-email-note">Info@anthillventures.com</span>
            </div>}
          </div>)}
        </div>
      </div>
      <div className="pc-contact-bottom"><span>ROOTED IN INDIA. BUILT FOR THE WORLD.</span><span>STORIES WORTH PLAYING.</span></div>
    </section>
  </div>;
}

