import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { ArrowUpRight, ArrowDown, ArrowRight, X, Menu } from 'lucide-react';
import CreativeScenes from './CreativeScenes.jsx';
import StudioCraft from './PartnershipStory.jsx';
import PeopleContact from './PeopleContact.jsx';
import MotionEffects from './MotionEffects.jsx';

gsap.registerPlugin(ScrollTrigger);
const navigation = [
  { id: 'story', label: 'Studio', number: '01' },
  { id: 'worlds', label: 'Worlds', number: '02' },
  { id: 'approach', label: 'Our craft', number: '03' },
];

function Brand({ footer = false }) {
  return <a className={`brand-lockup ${footer ? 'brand-lockup-footer' : ''}`} href="#top" aria-label="Anthill Game Studios — back to top"><img src="/assets/official-logo.webp" alt="Anthill Ventures" width="153" height="53" /><span className="brand-division">GAME<br />STUDIOS</span></a>;
}

function HeroArtwork() {
  return <figure className="hero-artwork hero-cinema"><img className="hero-cinema-image" src="/assets/mumbai.webp" alt="An illustrated Mumbai motorcycle rider: an example of Indian stories imagined as new worlds." fetchPriority="high" /><div className="hero-cinema-shade" /><div className="hero-cinema-register" aria-hidden="true"><span>ANTHILL / WORLD EXPLORATION</span><span>01 / CONCEPT ART</span></div><figcaption className="hero-cinema-caption"><span className="hero-cinema-caption-rule" /><span>Stories we know.<br /><em>Worlds we can become part of.</em></span><img src="/assets/official-symbol.webp" alt="" aria-hidden="true" /></figcaption></figure>;
}

function Conviction() {
  return <section className="conviction section-pad" id="story" aria-labelledby="conviction-title">
    <div className="chapter-label"><span className="chapter-number">01 /</span><span>INSIDE ANTHILL</span><span className="chapter-aside">BUILT ON CULTURE. WIRED FOR PLAY.</span></div>
    <div className="conviction-main"><div className="conviction-title-wrap"><span className="studio-overline">STORY IS OUR SOURCE CODE.</span><h2 id="conviction-title" data-intro-heading><span>INDIAN</span><span><em>ROOTS.</em></span><span>UNLIMITED WORLDS.</span></h2><img className="conviction-mark" src="/assets/official-symbol.webp" alt="" aria-hidden="true" /></div><div className="conviction-copy" data-entrance><span className="editorial-kicker">CULTURE / CHARACTER / CRAFT</span><p className="conviction-lead">Some worlds stay with you.<br />We want you to step inside them.</p><p>We are Anthill Game Studios. A meeting point for Indian imagination, cinematic attitude and the craft of making games.</p><p>From the pulse of our streets to the scale of our mythology, we see stories worth turning into worlds. Worlds with a point of view. Worlds that invite you in.</p><a href="#approach" className="text-action">Get inside our process <ArrowUpRight size={20} /></a></div></div>
    <div className="studio-manifesto-strip"><span>STORY FIRST.</span><i aria-hidden="true" /><span>WORLD OBSESSED.</span><i aria-hidden="true" /><span>PLAYER MINDED.</span><img src="/assets/official-symbol.webp" alt="" aria-hidden="true" /></div>
  </section>;
}

export default function App() {
  const root = useRef(null);
  const menuButton = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState('');

  useEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const lenis = new Lenis({ duration: 1.05, anchors: true, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      const tick = time => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      const ctx = gsap.context(() => {
        gsap.timeline({ defaults: { ease: 'power3.out' } }).from('.site-header', { y: -18, opacity: 0, duration: .6 }).from('.hero-title-line>span', { yPercent: 110, rotation: 3, duration: 1.2, stagger: .12 }, '-=.2').from('.hero-artwork', { scale: .94, opacity: 0, duration: 1.6 }, '<').from('.hero-eyebrow, .hero-description, .hero-links, .hero-bottom', { y: 18, opacity: 0, duration: .7, stagger: .08 }, '-=.75');
        gsap.to('.hero-artwork', { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
        gsap.utils.toArray('[data-entrance]').forEach(el => gsap.from(el, { y: 32, opacity: 0, duration: .9, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 94%', once: true } }));
        gsap.from('[data-intro-heading]>span', { x: -35, opacity: 0, stagger: .12, duration: .9, scrollTrigger: { trigger: '.conviction-main', start: 'top 88%', once: true } });
        gsap.to('.conviction-mark', { y: -45, rotation: -7, ease: 'none', scrollTrigger: { trigger: '.conviction-main', start: 'top bottom', end: 'bottom top', scrub: 1 } });
      }, root);
      document.fonts.ready.then(() => ScrollTrigger.refresh());
      return () => { ctx.revert(); gsap.ticker.remove(tick); lenis.destroy(); };
    });
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); }), { rootMargin: '-15% 0px -55% 0px' });
    document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));
    return () => { observer.disconnect(); media.revert(); };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const nav = document.getElementById('mobile-navigation');
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    nav.querySelector('a').focus();
    const ctx = gsap.context(() => { if (!matchMedia('(prefers-reduced-motion: reduce)').matches) gsap.from(nav.querySelectorAll('a'), { y: 26, opacity: 0, duration: .5, stagger: .08 }); }, nav);
    const onKey = e => {
      if (e.key === 'Escape') setMenuOpen(false);
      if (e.key === 'Tab') {
        const elements = [menuButton.current, ...nav.querySelectorAll('a')];
        const first = elements[0], last = elements.at(-1);
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    const onResize = () => { if (innerWidth > 900) setMenuOpen(false); };
    document.addEventListener('keydown', onKey); window.addEventListener('resize', onResize);
    return () => { ctx.revert(); document.body.style.overflow = oldOverflow; document.removeEventListener('keydown', onKey); window.removeEventListener('resize', onResize); menuButton.current?.focus(); };
  }, [menuOpen]);

  return <div className="site-shell" ref={root} id="top">
    <a href="#main" className="skip-link">Skip to content</a>
    <header className="site-header"><Brand /><nav className="desktop-nav" aria-label="Main navigation">{navigation.map(item => <a href={`#${item.id}`} key={item.id} className={active === item.id ? 'is-current' : ''}><span>{item.number}</span>{item.label}</a>)}</nav><a href="#contact" className="header-invitation">Create with us <ArrowUpRight size={18} /></a><button ref={menuButton} className="mobile-menu-button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button></header>
    {menuOpen && <nav className="mobile-navigation" id="mobile-navigation" aria-label="Mobile navigation" data-lenis-prevent>{[...navigation, { id: 'contact', label: 'Create with us', number: '06' }].map(item => <a href={`#${item.id}`} key={item.id} onClick={() => setMenuOpen(false)}><span>{item.number}</span>{item.label}<ArrowUpRight /></a>)}<p>INDIAN ROOTS.<br />BOUNDLESS IMAGINATION.</p></nav>}
    <main id="main" inert={menuOpen || undefined}>
      <section className="hero" aria-labelledby="hero-heading"><div className="hero-ambient" aria-hidden="true" /><HeroArtwork /><div className="hero-content"><div className="hero-eyebrow"><span className="signal-dot" /> ANTHILL GAME STUDIOS // INDIAN ROOTS. GLOBAL PLAY.</div><h1 className="hero-title" id="hero-heading" aria-label="Stories worth playing."><span className="hero-title-line"><span data-text="STORIES">STORIES</span></span><span className="hero-title-line hero-title-outline"><span data-text="WORTH">WORTH</span></span><span className="hero-title-line"><span data-text="PLAYING.">PLAYING.<i className="hero-spark" aria-hidden="true">+</i></span></span></h1><div className="hero-description"><span className="hero-copy-rule" /><p>We turn the energy of Indian cinema, culture and mythology into bold new worlds to play.</p></div><div className="hero-links"><a href="#worlds" className="hero-primary">Explore our worlds <ArrowDown size={19} /></a><a href="#approach" className="hero-secondary"><span><ArrowRight size={20} /></span>Inside the studio</a></div></div><div className="hero-side-note"><span>STORIES WE KNOW.</span><span>WORLDS WE HAVEN’T PLAYED.</span></div><div className="hero-bottom"><div className="hero-origin"><span>HYDERABAD</span><span className="origin-connection"><i /><i /><i /></span><span>GLOBAL PLAY</span></div><span className="hero-bottom-motto">MANY MAKERS. ONE ANTHILL.</span><a href="#story" className="hero-scroll">SCROLL INTO OUR WORLD <ArrowDown size={16} /></a></div></section>
      <Conviction /><CreativeScenes /><StudioCraft /><PeopleContact />
    </main>
    <footer className="site-footer section-pad" inert={menuOpen || undefined}><div className="footer-top"><Brand footer /><p>Indian imagination.<br /><em>Play without limits.</em></p><a href="#top" className="footer-top-link">Back to the beginning <ArrowUpRight size={20} /></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} ANTHILL GAME STUDIOS</span><span>STORIES WORTH PLAYING.</span><a href="mailto:info@anthillventures.com">Let’s keep the conversation going <ArrowUpRight size={16} /></a></div><p className="source-note">ANTHILL GAME STUDIOS / HYDERABAD, INDIA. IMAGINATION IS ONLY THE BEGINNING.</p></footer>
    <MotionEffects />
  </div>;
}
