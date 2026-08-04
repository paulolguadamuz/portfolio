import { useEffect, useRef, lazy, Suspense } from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { useLang } from '../i18n/LanguageContext';
import {
  FULL_MOTION,
  FULL_MOTION_FINE,
  scrollToSection,
  makeMagnetic,
  prefersReducedMotion,
} from '../lib/motion';

// three.js is ~150KB, so it stays out of the entry bundle. Preloader downloads
// this same chunk behind the curtain, so by the time introDone flips it is
// already in the module cache and Suspense never actually suspends.
const HeroScene = lazy(() => import('./HeroScene'));

export default function Hero({ introDone }) {
  const { t } = useLang();
  const sectionRef = useRef(null);
  const nameRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const cueRef = useRef(null);
  const metaRef = useRef(null);

  const introTlRef = useRef(null);
  const introDoneRef = useRef(introDone);

  // Nothing left to defer — waiting for idle here was the pop-in the preloader
  // is supposed to prevent.
  const mountScene = introDone && !prefersReducedMotion();

  /**
   * Built on mount, while the preloader still covers the screen — not when the
   * curtain lifts. Registering it late meant SplitText and the from() tweens
   * only ran after the headline had already been revealed at full opacity, so
   * it snapped to hidden and replayed. That double reveal was the flicker.
   */
  useEffect(() => {
    const mm = gsap.matchMedia();
    let cancelled = false;

    mm.add(FULL_MOTION, () => {
      const splits = [];
      let glitchInterval;
      let observer;
      let heroVisible = true;
      const nameEl = nameRef.current;

      const triggerGlitch = () => {
        if (!nameEl || !heroVisible || !introDoneRef.current) return;
        nameEl.classList.add('glitching');
        gsap
          .timeline({ onComplete: () => nameEl.classList.remove('glitching') })
          .to(nameEl, { x: -3, skewX: 10, duration: 0.05 })
          .to(nameEl, { x: 3, skewX: -8, duration: 0.05 })
          .to(nameEl, { x: 0, skewX: 0, duration: 0.05 });
      };

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
        splits.push(nameSplit, subtitleSplit);

        // immediateRender puts every element into its hidden start state right
        // now, behind the curtain, even though the timeline is paused.
        const tl = gsap.timeline({
          paused: true,
          defaults: { ease: 'power4.out', immediateRender: true },
        });

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
            [ctaRef.current, metaRef.current, cueRef.current],
            { opacity: 0, y: 20, duration: 0.9, stagger: 0.1, ease: 'expo.out' },
            '-=0.6'
          )
          .add(triggerGlitch, '+=0.2');

        introTlRef.current = tl;
        // Fonts can still land after the curtain lifted, if the preloader hit
        // its ceiling waiting for them.
        if (introDoneRef.current) tl.play();
      });

      // Only glitch while the hero is on screen
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

    // Magnetic CTAs
    mm.add(FULL_MOTION_FINE, () => {
      const cleanups = gsap.utils
        .toArray('.magnetic', sectionRef.current)
        .map((el) => makeMagnetic(el));
      return () => cleanups.forEach((fn) => fn());
    }, sectionRef);

    return () => {
      cancelled = true;
      introTlRef.current = null;
      mm.revert();
    };
  }, []);

  useEffect(() => {
    introDoneRef.current = introDone;
    if (introDone) introTlRef.current?.play();
  }, [introDone]);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="min-h-screen flex items-center relative overflow-hidden pt-20"
    >
      {mountScene && (
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>
      )}

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

          <div ref={ctaRef} className="flex flex-wrap gap-4 mt-6">
            <a
              href="#projects"
              data-cursor="link"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('#projects', { duration: 1.8 });
              }}
              className="magnetic font-body text-sm uppercase tracking-widest px-8 py-4 border border-light/30 rounded-full text-light hover:bg-light hover:text-dark transition-colors duration-300 backdrop-blur-md bg-black/20"
            >
              {t('hero.cta_projects')}
            </a>
            <a
              href="#contact"
              data-cursor="link"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('#contact', { duration: 1.8 });
              }}
              className="magnetic font-body text-sm uppercase tracking-widest px-8 py-4 bg-light text-dark rounded-full hover:bg-light/90 transition-colors duration-300 shadow-xl"
            >
              {t('hero.cta_contact')}
            </a>
          </div>

          {/* Small factual meta strip — all values already exist in the repo */}
          <div
            ref={metaRef}
            className="hero-meta font-body mt-10 flex flex-wrap items-center gap-x-10 gap-y-3"
          >
            <span className="hero-meta__item">
              <em>{t('hero.meta_based')}</em>
              Costa Rica
            </span>
            <span className="hero-meta__item">
              <em>{t('hero.meta_projects')}</em>
              <span className="scramble-target" data-scramble="04">
                04
              </span>
            </span>
            <span className="hero-meta__item">
              <em>{t('hero.meta_focus')}</em>
              {t('hero.meta_focus_value')}
            </span>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <a
        ref={cueRef}
        href="#projects"
        onClick={(e) => {
          e.preventDefault();
          scrollToSection('#projects');
        }}
        aria-label={t('hero.scroll_cue')}
        data-cursor="link"
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
