import { useCallback, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { LanguageProvider } from './i18n/LanguageContext';
import { prefersReducedMotion, setLenis } from './lib/motion';
import Preloader from './components/Preloader';
import Cursor from './components/Cursor';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Projects from './components/Projects';
import About from './components/About';
import Process from './components/Process';
import Skills from './components/Skills';
import Contact from './components/Contact';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';

function App() {
  const [introDone, setIntroDone] = useState(() => prefersReducedMotion());
  const handleIntroDone = useCallback(() => setIntroDone(true), []);

  useEffect(() => {
    // Smooth scroll hijacks native scrolling, so it is opt-out under reduced
    // motion. scrollToSection() falls back to a native jump.
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    });

    setLenis(lenis);
    lenis.on('scroll', ScrollTrigger.update);

    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  // The layout grows by several sections as chunks and fonts land
  useEffect(() => {
    if (!introDone) return;
    const id = setTimeout(() => ScrollTrigger.refresh(), 600);
    return () => clearTimeout(id);
  }, [introDone]);

  return (
    <LanguageProvider>
      <Preloader onDone={handleIntroDone} />
      <Cursor />

      <a href="#main" className="skip-link">
        Skip to content
      </a>

      <Navbar />

      <main id="main">
        <Hero introDone={introDone} />
        <Projects />
        <About />
        <Process />
        <Skills />
        <Contact />
      </main>

      <Footer />
      <FloatingWhatsApp />
    </LanguageProvider>
  );
}

export default App;
