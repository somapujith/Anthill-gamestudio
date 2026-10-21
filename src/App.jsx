import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { ArrowUpRight, ArrowDown, ArrowRight, X, Menu } from 'lucide-react';
import CreativeScenes from './CreativeScenes.jsx';
import StudioCraft from './PartnershipStory.jsx';
import PeopleContact from './PeopleContact.jsx';
import MotionEffects from './MotionEffects.jsx';
import CinemaSequence from './CinemaSequence.jsx';

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
  const artwork = useRef(null);

  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const picture = artwork.current.querySelector('.hero-cinema-image');
      const curtain = artwork.current.querySelector('.hero-reveal-curtain');
      let active = true;
      const context = gsap.context(() => {
        gsap.set(curtain, { scaleX: 1, visibility: 'visible', transformOrigin: 'right center' });
        gsap.set(picture, { scale: 1.12, filter: 'blur(4px)' });
      }, artwork);

      const reveal = () => {
        if (!active) return;
        context.add(() => {
          gsap.timeline()
            .to(curtain, { scaleX: 0, duration: 1.65, ease: 'power2.inOut' }, .1)
            .to(picture, { scale: 1.02, filter: 'blur(0px)', duration: 2.2, ease: 'power2.out' }, 0)
            .set(curtain, { visibility: 'hidden' }, 1.8)
            .to(picture, { scale: 1.08, yPercent: -1, duration: 14, repeat: -1, yoyo: true, ease: 'sine.inOut' }, 2.2);
        });
      };
      picture.decode().then(reveal, reveal);
      return () => { active = false; context.revert(); };
    });
    return () => media.revert();
  }, []);

  return <figure className="hero-artwork hero-cinema" ref={artwork}><div className="hero-art-frame"><img className="hero-cinema-image" src="/assets/mumbai.webp" alt="A cinematic comic-book Mumbai, with a motorcycle rider racing through its neon-lit streets." fetchPriority="high" /><div className="hero-cinema-shade" /><div className="hero-reveal-curtain" aria-hidden="true" /></div><div className="hero-cinema-register"><span>INDIAN IMAGINATION.</span><span>AN ENTIRELY NEW DIMENSION.</span></div><figcaption className="hero-cinema-caption"><span>WORLD EXPLORATION / 001</span><span>CONCEPT ART</span></figcaption><span className="hero-art-cross" aria-hidden="true">+</span></figure>;
}

function Conviction() {
  return <section className="conviction section-pad" id="story" aria-labelledby="conviction-title">
    <div className="chapter-label"><span className="chapter-number">01 /</span><span>THE BIG PICTURE</span><span className="chapter-aside">A NEW STAGE FOR INDIAN STORYTELLING.</span></div>
    <div className="conviction-main"><div className="conviction-title-wrap"><span className="studio-overline">THIS IS ANTHILL GAME STUDIOS.</span><h2 id="conviction-title" data-intro-heading><span>ROOTED IN</span><span><em>INDIAN CINEMA.</em></span><span>MADE FOR THE WORLD.</span></h2><img className="conviction-mark" src="/assets/official-symbol.webp" alt="" aria-hidden="true" /></div><div className="conviction-copy" data-entrance><span className="editorial-kicker">FROM THE BIG SCREEN. BEYOND IT.</span><p className="conviction-lead">The stories India loves.<br />The worlds everyone will play.</p><p>As Indian cinema takes centre stage in global entertainment, we’re bringing its deeper essence to games. The emotion. The scale. The characters that stay with you long after the credits.</p><p>Original playable worlds drawn from the stories India already loves. Powered by Finnish game craft at its highest level.</p><a href="#approach" className="text-action">Discover the craft <ArrowUpRight size={20} /></a></div></div>
    <div className="studio-manifesto-strip" data-entrance><span>INDIAN STORYTELLING.</span><i aria-hidden="true" /><span>FINNISH GAME CRAFT.</span><i aria-hidden="true" /><span>WORLDWIDE AMBITION.</span></div>
  </section>;
}

export default function App() {
  const root = useRef(null);
  const menuButton = useRef(null);
  const smoothScroll = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState('');

  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const lenis = new Lenis({ duration: 1.05, anchors: true, smoothWheel: true });
      smoothScroll.current = lenis;
      if (root.current.querySelector('#mobile-navigation')) lenis.stop();
      lenis.on('scroll', ScrollTrigger.update);
      const tick = time => lenis.raf(time * 1000);
      gsap.ticker.add(tick);
      const ctx = gsap.context(() => {
        gsap.timeline({ defaults: { ease: 'power3.out' } })
          .from('.site-header', { y: -12, opacity: 0, duration: .45 }, 0)
          .fromTo('.hero-title-line>span', { y: 28, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .9, stagger: .1, force3D: false, clearProps: 'transform,opacity,visibility' }, .08)
          .from('.hero-eyebrow, .hero-description, .hero-links, .hero-bottom, .hero-cinema-register, .hero-cinema-caption', { y: 18, opacity: 0, duration: .7, stagger: .05 }, .24);
        gsap.to('.hero-artwork', { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
        gsap.utils.toArray('[data-entrance]').forEach(el => gsap.from(el, { y: 32, opacity: 0, duration: .9, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'clamp(top 94%)', once: true } }));
        gsap.from('[data-intro-heading]>span', { x: -35, opacity: 0, stagger: .12, duration: .9, scrollTrigger: { trigger: '.conviction-main', start: 'top 88%', once: true } });
        gsap.to('.conviction-mark', { y: -45, rotation: -7, ease: 'none', scrollTrigger: { trigger: '.conviction-main', start: 'top bottom', end: 'bottom top', scrub: 1 } });
      }, root);
      document.fonts.ready.then(() => ScrollTrigger.refresh());
      return () => { ctx.revert(); gsap.ticker.remove(tick); lenis.destroy(); if (smoothScroll.current === lenis) smoothScroll.current = null; };
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
    smoothScroll.current?.stop();
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
    return () => { ctx.revert(); document.body.style.overflow = oldOverflow; smoothScroll.current?.start(); document.removeEventListener('keydown', onKey); window.removeEventListener('resize', onResize); menuButton.current?.focus(); };
  }, [menuOpen]);

  return <div className="site-shell" ref={root} id="top">
    <a href="#main" className="skip-link">Skip to content</a>
    <header className="site-header"><Brand /><nav className="desktop-nav" aria-label="Main navigation">{navigation.map(item => <a href={`#${item.id}`} key={item.id} className={active === item.id ? 'is-current' : ''}><span>{item.number}</span>{item.label}</a>)}</nav><a href="#contact" className="header-invitation">Create with us <ArrowUpRight size={18} /></a><button ref={menuButton} className="mobile-menu-button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button></header>
    {menuOpen && <nav className="mobile-navigation" id="mobile-navigation" aria-label="Mobile navigation" data-lenis-prevent>{[...navigation, { id: 'contact', label: 'Create with us', number: '06' }].map(item => <a href={`#${item.id}`} key={item.id} onClick={() => setMenuOpen(false)}><span>{item.number}</span>{item.label}<ArrowUpRight /></a>)}<p>INDIAN ROOTS.<br />BOUNDLESS IMAGINATION.</p></nav>}
    <main id="main" inert={menuOpen || undefined}>
      <section className="hero" aria-labelledby="hero-heading"><div className="hero-ambient" aria-hidden="true" /><div className="hero-content"><div className="hero-eyebrow"><span className="signal-dot" /> INDIAN SOUL. GLOBAL PLAY.</div><h1 className="hero-title" id="hero-heading" aria-label="Stories worth playing."><span className="hero-title-line"><span>STORIES</span></span><span className="hero-title-line hero-title-accent"><span>WORTH<span className="hero-spark" aria-hidden="true">✳</span></span></span><span className="hero-title-line"><span>PLAYING.</span></span></h1><div className="hero-description"><p>The magic of Indian cinema.<br />The limitless possibility of play.</p></div><div className="hero-links"><a href="#worlds" className="hero-primary">Enter our worlds <ArrowUpRight size={20} /></a><a href="#story" className="hero-secondary">Meet Anthill <ArrowRight size={17} /></a></div></div><HeroArtwork /><div className="hero-bottom"><div className="hero-origin"><span>INDIAN STORYTELLING</span><span className="origin-connection"><i /><i /><i /></span><span>FINNISH GAME CRAFT</span></div><a href="#story" className="hero-scroll">THE STORY STARTS HERE <ArrowDown size={16} /></a></div></section>
      <Conviction /><CinemaSequence /><CreativeScenes /><StudioCraft /><PeopleContact />
    </main>
    <footer className="site-footer section-pad" inert={menuOpen || undefined}><div className="footer-top" data-entrance><Brand footer /><p>Bringing the magic of<br /><em>Indian cinema to gaming.</em></p><a href="#top" className="footer-top-link">Back to the beginning <ArrowUpRight size={20} /></a></div><div className="footer-bottom" data-entrance><span>© {new Date().getFullYear()} ANTHILL GAME STUDIOS</span><span>STORIES WORTH PLAYING.</span><a href="mailto:info@anthillventures.com">Let’s keep the conversation going <ArrowUpRight size={16} /></a></div><p className="source-note" data-entrance>BORN FROM INDIAN STORIES. BUILT FOR PLAYERS EVERYWHERE.</p></footer>
    <MotionEffects />
  </div>;
}
