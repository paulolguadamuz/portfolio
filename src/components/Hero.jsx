import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { useLang } from '../i18n/LanguageContext';
import { FULL_MOTION, scrollToSection } from '../lib/motion';

gsap.registerPlugin(SplitText);

export default function Hero() {
  const { t } = useLang();
  const sectionRef = useRef(null);
  const nameRef = useRef(null);
  const subtitleRef = useRef(null);
  const bioRef = useRef(null);
  const ctaRef = useRef(null);
  const cueRef = useRef(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    let cancelled = false;

    mm.add(FULL_MOTION, () => {
      const nameEl = nameRef.current;
      const splits = [];
      let glitchInterval;
      let observer;
      let heroVisible = true;

      const triggerGlitch = () => {
        if (!nameEl || !heroVisible) return;
        nameEl.classList.add('glitching');
        gsap
          .timeline({ onComplete: () => nameEl.classList.remove('glitching') })
          .to(nameEl, { x: -3, skewX: 10, duration: 0.05 })
          .to(nameEl, { x: 3, skewX: -8, duration: 0.05 })
          .to(nameEl, { x: 0, skewX: 0, duration: 0.05 });
      };

      // Line splitting depends on the final font metrics, so wait for the web
      // fonts before measuring — otherwise lines break against the fallback.
      document.fonts.ready.then(() => {
        if (cancelled) return;

        const nameSplit = SplitText.create(nameEl, {
          type: 'chars,words',
          charsClass: 'letter-span',
        });
        const subtitleSplit = SplitText.create(subtitleRef.current, {
          type: 'lines',
          mask: 'lines',
        });
        const bioSplit = SplitText.create(bioRef.current, {
          type: 'lines',
          mask: 'lines',
        });
        splits.push(nameSplit, subtitleSplit, bioSplit);

        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

        tl.from(nameSplit.chars, {
          opacity: 0,
          scale: 0.8,
          yPercent: 12,
          stagger: { each: 0.045, from: 'center' },
          duration: 0.7,
          ease: 'power2.out',
        })
          .from(
            subtitleSplit.lines,
            { yPercent: 110, duration: 1, stagger: 0.12, ease: 'expo.out' },
            '-=0.7'
          )
          .from(
            bioSplit.lines,
            { yPercent: 110, duration: 1, stagger: 0.08, ease: 'expo.out' },
            '-=0.85'
          )
          .from(
            [ctaRef.current, cueRef.current],
            { opacity: 0, y: 20, duration: 0.9, stagger: 0.1, ease: 'expo.out' },
            '-=0.7'
          )
          .add(triggerGlitch, '+=0.2');
      });

      // Only glitch while the hero is actually on screen — it used to run
      // every 4.5s for the whole session, off-screen included.
      observer = new IntersectionObserver(
        ([entry]) => {
          heroVisible = entry.isIntersecting;
        },
        { threshold: 0 }
      );
      observer.observe(sectionRef.current);

      glitchInterval = setInterval(triggerGlitch, 4500);
      nameEl.addEventListener('mouseenter', triggerGlitch);

      return () => {
        clearInterval(glitchInterval);
        observer?.disconnect();
        nameEl.removeEventListener('mouseenter', triggerGlitch);
        splits.forEach((s) => s.revert());
        nameEl.classList.remove('glitching');
      };
    }, sectionRef);

    return () => {
      cancelled = true;
      mm.revert();
    };
  }, []);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="min-h-screen flex items-center relative overflow-hidden pt-20"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full relative z-10">
        <div className="flex flex-col gap-6 max-w-4xl">
          <h1
            ref={nameRef}
            className="font-signature font-normal text-6xl sm:text-7xl md:text-8xl lg:text-[8rem] tracking-wide leading-[1.1] text-light drop-shadow-2xl glitch-text"
            data-text="Paulo Jimenez"
          >
            Paulo Jimenez
          </h1>

          <p
            ref={subtitleRef}
            className="font-display font-semibold text-xl sm:text-2xl lg:text-3xl text-light/90 tracking-wide drop-shadow-lg"
          >
            {t('hero.subtitle')}
          </p>

          <p
            ref={bioRef}
            className="font-body text-base sm:text-lg lg:text-xl text-light/80 max-w-2xl leading-relaxed drop-shadow-md"
          >
            {t('hero.bio')}
          </p>

          <div ref={ctaRef} className="flex gap-4 mt-6">
            <a
              href="#projects"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('#projects', { duration: 1.8 });
              }}
              className="font-body text-sm uppercase tracking-widest px-8 py-4 border border-light/30 rounded-full text-light hover:bg-light hover:text-dark transition-all duration-300 backdrop-blur-md bg-black/20"
            >
              {t('hero.cta_projects')}
            </a>
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('#contact', { duration: 1.8 });
              }}
              className="font-body text-sm uppercase tracking-widest px-8 py-4 bg-light text-dark rounded-full hover:bg-light/90 transition-all duration-300 shadow-xl"
            >
              {t('hero.cta_contact')}
            </a>
          </div>
        </div>
      </div>

      {/* Scroll cue — the page is ~8000px tall and nothing hinted at that */}
      <a
        ref={cueRef}
        href="#skills"
        onClick={(e) => {
          e.preventDefault();
          scrollToSection('#skills');
        }}
        aria-label={t('hero.scroll_cue')}
        className="scroll-cue absolute bottom-8 left-1/2 -translate-x-1/2 z-10 hidden sm:flex flex-col items-center gap-3 text-light/40 hover:text-light/80 transition-colors"
      >
        <span className="font-body text-[0.65rem] uppercase tracking-[0.3em]">
          {t('hero.scroll_cue')}
        </span>
        <span className="scroll-cue__rail" aria-hidden="true">
          <span className="scroll-cue__dot" />
        </span>
      </a>
    </section>
  );
}
