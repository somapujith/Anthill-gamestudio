import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { ArrowUpRight, ArrowDown, ArrowRight, Menu, X, Plus, Minus } from 'lucide-react';
import StorySections from './StorySections.jsx';
import MotionEffects from './MotionEffects.jsx';

gsap.registerPlugin(ScrollTrigger);

const worlds = [
  { title: ['Mass heroes.', 'Pixel legends.'], name: 'Pixel legends', image: 'mass-heroes', genre: 'ARCADE / ACTION', color: '#ff328b', detail: 'Big swagger. Bigger worlds. The theatrical confidence of ’80s Bollywood becomes chunky 3D worlds, close-up brawls and a familiar hero you can finally control.', setting: 'BOLLYWOOD, REIMAGINED', number: '01' },
  { title: ['Our streets.', 'New rules.'], name: 'Mumbai nights', image: 'mumbai', genre: 'URBAN / ADVENTURE', color: '#d3ff43', detail: 'Mumbai becomes a living comic. Sharp silhouettes, split-second chases and colour that hits with every turn. Your city. A whole new way to move through it.', setting: 'THE CITY IS YOUR PLAYGROUND', number: '02' },
  { title: ['The old stories', 'have a future.'], name: 'Mythic futures', image: 'myth', genre: 'MYTH / EXPLORATION', color: '#ffe83d', detail: 'A world after collapse, shaped by Hindu mythology. Survival and duty pull the player through desert kingdoms and the remains of a lost civilisation.', setting: 'ANCIENT ROOTS. UNWRITTEN FUTURES.', number: '03' },
];

function PixelMark({ className = '', ...props }) {
  return <svg className={className} viewBox="0 0 56 56" fill="currentColor" aria-hidden="true" {...props}><path d="M24 0h8v8h8v8h8v8h8v32H40V40h-8V24h-8v16h-8v16H0V24h8v-8h8V8h8z" /></svg>;
}

function WordReveal({ children, className = '', as: Tag = 'h2', ...props }) {
  return <Tag className={className} data-word-reveal {...props}>{children.split(' ').map((word, i) => <span className="word-clip" key={i}><span className="reveal-word">{word}&nbsp;</span></span>)}</Tag>;
}

function WorldDetail({ index, onClose }) {
  const dialog = useRef(null);
  const world = worlds[index];
  useEffect(() => {
    const oldFocus = document.activeElement;
    dialog.current.showModal();
    document.body.style.overflow = 'hidden';
    const ctx = gsap.context(() => {
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) gsap.fromTo(dialog.current, { opacity: 0, y: 26, scale: .98 }, { opacity: 1, y: 0, scale: 1, duration: .45, ease: 'power3.out' });
    }, dialog);
    return () => { ctx.revert(); document.body.style.overflow = ''; oldFocus?.focus(); };
  }, []);
  return <dialog className="world-dialog" data-lenis-prevent ref={dialog} onCancel={onClose} onClick={e => { if (e.target === dialog.current) onClose(); }} aria-labelledby="world-detail-title">
    <div className="world-dialog-inner" style={{ '--world-color': world.color }}>
      <div className="world-dialog-art"><img src={`/assets/${world.image}.webp`} alt={`${world.name} concept artwork`} /><span className="mono">WORLD {world.number} / CONCEPT ART</span></div>
      <div className="world-dialog-copy"><button className="icon-button dialog-close" onClick={onClose} aria-label="Close world details"><X /></button><span className="eyebrow">{world.genre}</span><h2 id="world-detail-title">{world.title[0]}<br />{world.title[1]}</h2><p>{world.detail}</p><p className="world-disclaimer mono">An illustrative creative direction from the Anthill identity. A glimpse of the stories, atmosphere and visual ambition behind the studio.</p><a className="button button-lime" href="#approach" onClick={onClose}>Discover the approach <ArrowRight size={19} /></a></div>
    </div>
  </dialog>;
}

function FAQ() {
  const [open, setOpen] = useState(0);
  const items = [
    ['What is the idea behind Anthill?', 'Stories worth playing. The Anthill identity imagines Indian stories becoming compelling games through Indian–Finnish collaboration, for players in India and beyond. This concept site brings that creative direction together with the Infuse co-creation proposal.'],
    ['How does the co-creation model work?', 'The Infuse proposal connects Indian IP holders, production infrastructure and investors with Nordic/European game developers, funding and publishing relationships. Teams develop a playable demo or vertical slice, then pursue further funding or a publishing deal.'],
    ['What do the creative directions represent?', 'The three directions illustrate the range of Indian stories and atmospheres Anthill could bring to play: the swagger of cinema, the energy of urban life, and the depth of mythology. They express a creative vision rather than announced releases.'],
    ['Who is the invitation for?', 'IP owners with a world to share, developers who want to build it, and investors or publishing partners who see the opportunity. The Infuse team contacts below are provided in the proposal deck.'],
  ];
  return <section className="faq-section wrap" aria-labelledby="faq-heading"><div><span className="eyebrow">A FEW THINGS TO KNOW</span><h2 id="faq-heading">Before you<br /><em>press play.</em></h2></div><div className="faq-list">{items.map(([question, answer], i) => <div className={`faq-item ${open === i ? 'is-open' : ''}`} key={question}><h3><button aria-expanded={open === i} aria-controls={`faq-${i}`} onClick={() => setOpen(open === i ? -1 : i)}>{question}{open === i ? <Minus size={18} /> : <Plus size={18} />}</button></h3><div id={`faq-${i}`} className="faq-answer" hidden={open !== i}><p>{answer}</p></div></div>)}</div></section>;
}

export default function App() {
  const root = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let lenis;
    let tick;
    if (!reduced) {
      lenis = new Lenis({ duration: 1.05, smoothWheel: true, anchors: true });
      lenis.on('scroll', ScrollTrigger.update);
      tick = time => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }
    const ctx = gsap.context(() => {
      if (reduced) return;
      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
      intro.from('.site-header', { y: -25, opacity: 0, duration: .7 })
        .from('.hero-title .hero-line', { yPercent: 115, rotate: 4, duration: 1.15, stagger: .12 }, '-=.25')
        .from('.hero-art', { scale: 1.1, opacity: 0, duration: 1.5 }, '<')
        .from('.hero-meta, .hero-copy, .hero-actions, .hero-bottom', { y: 20, opacity: 0, stagger: .1, duration: .65 }, '-=.85');
      gsap.to('.hero-art-image', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
      gsap.utils.toArray('[data-word-reveal]').forEach(el => gsap.from(el.querySelectorAll('.reveal-word'), { yPercent: 110, duration: .85, stagger: .045, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true } }));
      gsap.utils.toArray('[data-reveal]').forEach(el => gsap.from(el, { y: 32, opacity: 0, duration: .8, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } }));
      gsap.utils.toArray('[data-count]').forEach(el => {
        const counter = { value: 0 };
        const target = Number(el.dataset.count);
        gsap.to(counter, { value: target, duration: 2, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%', once: true }, onUpdate: () => { el.textContent = target % 1 ? counter.value.toFixed(1) : Math.round(counter.value).toLocaleString('en-IN'); } });
      });
    }, root);
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) setActiveSection(entry.target.id); }), { rootMargin: '-20% 0px -55% 0px' });
    document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));
    return () => { ctx.revert(); observer.disconnect(); if (tick) gsap.ticker.remove(tick); lenis?.destroy(); };
  }, []);

  useEffect(() => {
    if (detail !== null || menuOpen) document.documentElement.classList.add('overlay-open');
    else document.documentElement.classList.remove('overlay-open');
    return () => document.documentElement.classList.remove('overlay-open');
  }, [detail, menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.activeElement;
    const nav = document.getElementById('mobile-navigation');
    nav?.querySelector('a')?.focus();
    const ctx = gsap.context(() => {
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) gsap.from(nav.querySelectorAll('a'), { y: 20, opacity: 0, stagger: .07, duration: .4, ease: 'power2.out' });
    }, nav);
    const onKey = e => {
      if (e.key === 'Escape') setMenuOpen(false);
      if (e.key === 'Tab') {
        const items = [document.querySelector('.menu-toggle'), ...nav.querySelectorAll('a')];
        const first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    const resize = () => { if (window.innerWidth > 800) setMenuOpen(false); };
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', resize);
    return () => { ctx.revert(); document.removeEventListener('keydown', onKey); window.removeEventListener('resize', resize); previous?.focus(); };
  }, [menuOpen]);

  const navItems = [['story', 'Our story'], ['worlds', 'Creative vision'], ['approach', 'The approach']];

  return <div ref={root} className="site-shell">
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header">
      <a href="#" className="brand" aria-label="Anthill Game Studios home"><img className="official-lockup" src="/assets/official-logo.webp" alt="Anthill Ventures" /><span className="brand-studio">GAME<br />STUDIOS</span></a>
      <nav className="desktop-nav" aria-label="Main navigation">{navItems.map(([id, label]) => <a className={activeSection === id ? 'active' : ''} href={`#${id}`} key={id}>{label}</a>)}</nav>
      <div className="header-actions"><a href="#contact" className="header-contact">Let’s talk <ArrowUpRight size={17} /></a><button className="menu-toggle icon-button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button></div>
    </header>

    {menuOpen && <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation">{[...navItems, ['contact', 'Let’s talk']].map(([id, label], i) => <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}><span className="mono">0{i + 1}</span>{label}<ArrowUpRight /></a>)}<span className="eyebrow">INDIAN STORIES. GLOBAL PLAY.</span></nav>}

    <main id="main" inert={menuOpen || undefined}>
      <section className="hero" aria-labelledby="hero-heading">
        <div className="hero-art" aria-hidden="true"><img className="hero-art-image" src="/assets/portal.webp" alt="" fetchPriority="high" /><div className="hero-art-shade" /><div className="portal-coordinate mono">19° N &nbsp;↔&nbsp; 60° N<br />A NEW WORLD IS OPENING</div></div>
        <div className="hero-content"><div className="hero-meta eyebrow"><span className="live-dot" /> INDIAN ROOTS. &nbsp; GLOBAL AMBITION.</div><h1 className="hero-title" id="hero-heading"><span className="hero-line-clip"><span className="hero-line">Stories worth</span></span><span className="hero-line-clip"><span className="hero-line">playing<span className="pink-period">.</span></span></span></h1><p className="hero-copy">Extraordinary worlds, born from Indian stories.<br className="desktop-break" /> Created together with Finnish game makers.<br className="desktop-break" /> Made for the player in all of us.</p><div className="hero-actions"><a className="button button-lime" href="#worlds">Explore the vision <ArrowDown size={18} /></a><a className="play-link" aria-label="Understand the co-creation model" href="#approach"><span className="play-link-icon"><ArrowRight size={20} /></span>THE CO-CREATION MODEL <ArrowUpRight size={15} /></a></div></div>
        <div className="hero-bottom"><div className="hero-countries"><span className="country-flag flag-india" /><span>INDIA</span><span className="country-cross">×</span><span className="country-flag flag-finland" /><span>FINLAND</span></div><span className="hero-bottom-note mono">MANY MAKERS. ONE ANTHILL.</span><a href="#worlds" className="scroll-cue mono">SCROLL TO EXPLORE <ArrowDown size={15} /></a></div>
        <div className="hero-side-label mono">EST. IN IMAGINATION / BUILT FOR PLAY</div>
      </section>

      <div className="ticker" aria-hidden="true"><div className="ticker-track">{Array.from({ length: 4 }, (_, i) => <span key={i}>INDIAN STORIES <PixelMark /> FINNISH CRAFT <PixelMark /> GLOBAL PLAY <PixelMark /></span>)}</div></div>

      <section className="worlds-section wrap" id="worlds" aria-labelledby="worlds-heading"><div className="section-topline"><span className="eyebrow"><span className="tiny-cross">+</span> A VISION WITHOUT LIMITS</span><span className="mono muted">THREE CREATIVE DIRECTIONS</span></div><div className="worlds-heading-row"><WordReveal id="worlds-heading" className="section-title">Familiar stories. Unfamiliar worlds.</WordReveal><div className="worlds-intro"><p>The energy of cinema. The depth of mythology.<br />A whole new way to be part of the story.</p><span className="eyebrow muted">EXPLORE THE POSSIBILITIES <ArrowDown size={13} /></span></div></div><div className="world-grid">{worlds.map((world, i) => <button key={world.image} className="world-card" style={{ '--world-color': world.color }} onClick={() => setDetail(i)} aria-label={`Explore the ${world.name} creative direction`} data-reveal><img src={`/assets/${world.image}.webp`} alt={i === 0 ? 'A swaggering pixel hero in neon-lit Bollywood style' : i === 1 ? 'A motorcycle rider racing through a cinematic Mumbai street' : 'An archer overlooking the ruins of a mythic kingdom'} loading="lazy" /><div className="world-card-shade" /><div className="world-card-top mono"><span>{world.number} / CREATIVE DIRECTION</span><span className="world-card-plus"><Plus size={19} /></span></div><div className="world-card-bottom"><span className="world-genre mono">{world.genre}</span><h3>{world.title[0]}<br />{world.title[1]}</h3><span className="world-explore mono">VIEW THE VISION <ArrowUpRight size={16} /></span></div></button>)}</div><div className="worlds-footnote mono"><span><span className="live-dot" /> YOUR NEXT FAVOURITE WORLD MIGHT ALREADY EXIST.</span><span>CONCEPT ART. UNLIMITED POSSIBILITY.</span></div></section>

      <section className="opportunity-section wrap" aria-labelledby="opportunity-heading"><div className="opportunity-heading"><span className="eyebrow">THE OPPORTUNITY SIGNALS</span><h2 id="opportunity-heading">The stories are local.<br /><em>The appetite isn’t.</em></h2><p>Indian entertainment already travels.<br />The next step is to make it playable.</p></div><div className="opportunity-stat" data-reveal><div className="stat-value"><span data-count="2000">2,000</span><span>%</span></div><p>Growth in streams of Indian music<br />outside India, 2019–2023.</p><span className="mono">SPOTIFY · AS CITED IN THE PROPOSAL</span></div><div className="opportunity-stat" data-reveal><div className="stat-value"><span data-count="8.3">8.3</span><span>%</span></div><p>Forecast annual growth for India’s<br />entertainment & media market through 2028.</p><span className="mono">FORECAST CITED IN THE INFUSE DRAFT</span></div></section>

      <StorySections />

      <section className="people-section wrap" id="people" aria-labelledby="people-heading"><div className="section-topline"><span className="eyebrow">THE PEOPLE BEHIND THE BRIDGE</span><PixelMark className="little-mark" /></div><div className="people-heading-row"><WordReveal id="people-heading" className="section-title">Different backgrounds. Shared imagination.</WordReveal><p>Game-making meets cross-border production.<br />The people behind the Infuse proposal bring experience from both sides of the bridge.</p></div><div className="people-grid"><article className="person" data-reveal><div className="person-photo"><img src="/assets/juha.webp" alt="Juha Huhtakallio" loading="lazy" /><span className="mono">01 / GAME-MAKING</span></div><div className="person-info"><span className="eyebrow">GAMES · PUBLISHING · DEVELOPMENT</span><h3>Juha Huhtakallio</h3><p>A development and publishing network built across 100+ released games, as presented in the Infuse proposal.</p><a href="mailto:juha.huhtakallio@infuse.games" className="text-link">Start a conversation <ArrowUpRight size={17} /></a></div></article><article className="person" data-reveal><div className="person-photo"><img src="/assets/jani.webp" alt="Jani Joenniemi" loading="lazy" /><span className="mono">02 / WORLD-CONNECTING</span></div><div className="person-info"><span className="eyebrow">PRODUCTION · FINANCING · CONNECTIONS</span><h3>Jani Joenniemi</h3><p>Europe–Asia productions, soft-money financing, film and audiovisual expertise, and government relationships.</p><a href="mailto:jani.joenniemi@infuse.games" className="text-link">Start a conversation <ArrowUpRight size={17} /></a></div></article></div></section>

      <FAQ />

      <section className="contact-section" id="contact" aria-labelledby="contact-heading"><div className="contact-energy" aria-hidden="true" /><div className="wrap contact-content"><div className="section-topline"><span className="eyebrow">AN OPEN INVITATION</span><span className="mono">IP OWNERS / MAKERS / BELIEVERS</span></div><h2 id="contact-heading" data-word-reveal><span className="word-clip"><span className="reveal-word">The next world</span></span><br /><span className="word-clip"><span className="reveal-word">starts <em>with you.</em></span></span></h2><div className="contact-bottom"><p>Have a story that deserves to be played?<br />Let’s bring the right people together.</p><a className="contact-cta" href="mailto:jani.joenniemi@infuse.games?subject=Let%E2%80%99s%20build%20a%20world">Let’s make it playable <ArrowUpRight /></a></div></div></section>
    </main>

    <footer className="site-footer wrap" inert={menuOpen || undefined}><div className="footer-main"><a className="brand footer-brand" href="#" aria-label="Back to top"><img className="official-lockup" src="/assets/official-logo.webp" alt="Anthill Ventures" /><span className="brand-studio">GAME<br />STUDIOS</span></a><p>Many makers. One Anthill.<br /><span className="muted">Stories worth playing.</span></p><a href="#main" className="back-to-top mono">BACK TO THE TOP <ArrowUpRight size={16} /></a></div><div className="footer-fine mono"><span>© {new Date().getFullYear()} ANTHILL GAME STUDIOS · CONCEPT EXPERIENCE</span><span>ANTHILL IDENTITY × INFUSE CO-CREATION PROPOSAL</span><span>BUILT WITH IMAGINATION <span className="pink-text">✳</span></span></div><p className="concept-note">An exploratory website based on the supplied Anthill identity and Infuse proposal. Game worlds are illustrative; no partnership, game rights or release is announced here.</p></footer>

    {detail !== null && <WorldDetail index={detail} onClose={() => setDetail(null)} />}
    <MotionEffects />
  </div>;
}
