import { useEffect, useRef, useState, useCallback, lazy, Suspense } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FiGithub, FiX } from 'react-icons/fi';
import { projects } from '../data/projects';
import ProjectCard from './ProjectCard';
import { useLang } from '../i18n/LanguageContext';
import { FULL_MOTION, scrollToSection, prefersReducedMotion } from '../lib/motion';

// Case studies are behind a click — keep them out of the initial bundle, then
// warm them during idle so the open animation never waits on a fetch.
const importMeaCulpa = () => import('./MeaCulpaShowcase');
const importNovaSite = () => import('./NovaSiteShowcase');
const MeaCulpaShowcase = lazy(importMeaCulpa);
const NovaSiteShowcase = lazy(importNovaSite);

const SHOWCASE_IDS = [1, 4];
const gradient = (p) => `linear-gradient(135deg, ${p.from}, ${p.to})`;

export default function Projects() {
  const { t } = useLang();
  const wrapperRef = useRef(null);
  const headingRef = useRef(null);
  const ctaRef = useRef(null);

  const [activeImage, setActiveImage] = useState(null);
  const [showcaseOpen, setShowcaseOpen] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const showcaseContainerRefs = useRef({});
  const showcaseContentRefs = useRef({});
  const showcaseLockRef = useRef(false);

  // One fixed, GPU-composited layer per palette change. Fading opacity replaces
  // rewriting a full-viewport gradient on <body> every scroll frame.
  const bgLayerRefs = useRef([]);

  const lightboxRef = useRef(null);
  const lightboxCloseRef = useRef(null);
  const lastFocusedRef = useRef(null);

  /* ── Warm the case-study chunks once the page is idle ── */
  useEffect(() => {
    const warm = () => {
      importMeaCulpa();
      importNovaSite();
    };
    const id = window.requestIdleCallback?.(warm, { timeout: 3000 });
    const fb = id === undefined ? setTimeout(warm, 2000) : null;
    return () => {
      if (id !== undefined) window.cancelIdleCallback?.(id);
      if (fb) clearTimeout(fb);
    };
  }, []);

  /* ── Scroll-driven palette ── */
  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add(FULL_MOTION, () => {
      const sections = gsap.utils.toArray('.project-section');

      // Layers stack in DOM order, so each one only ever fades IN — the stack
      // never dips back toward the base colour mid-transition.
      const fadeIn = (layerIndex, vars) =>
        ScrollTrigger.create({
          ...vars,
          scrub: 1,
          onUpdate: (self) => {
            if (showcaseLockRef.current) return;
            const layer = bgLayerRefs.current[layerIndex];
            if (layer) gsap.set(layer, { opacity: self.progress });
          },
        });

      sections.forEach((section, i) => {
        if (i === 0) fadeIn(0, { trigger: section, start: 'top 85%', end: 'top 15%' });
        fadeIn(i + 1, { trigger: section, start: 'bottom 90%', end: 'bottom 10%' });
      });

      gsap.from(headingRef.current, {
        opacity: 0,
        y: 40,
        duration: 1,
        ease: 'expo.out',
        scrollTrigger: { trigger: headingRef.current, start: 'top 85%' },
      });

      if (ctaRef.current) {
        gsap.fromTo(
          ctaRef.current,
          { opacity: 0, y: 40, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1.2,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: ctaRef.current,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, wrapperRef);

    return () => mm.revert();
  }, []);

  /* ── Showcase open / close ── */
  const instantClose = useCallback((projectId) => {
    const container = showcaseContainerRefs.current[projectId];
    if (!container) return;
    gsap.killTweensOf(container);
    gsap.killTweensOf(container.querySelectorAll('*'));
    gsap.set(container, { height: 0, opacity: 0 });
  }, []);

  const lockBackgroundTo = useCallback((projectIndex) => {
    showcaseLockRef.current = true;
    bgLayerRefs.current.forEach((layer, i) => {
      if (layer) gsap.set(layer, { opacity: i <= projectIndex ? 1 : 0 });
    });
  }, []);

  const handleCloseShowcase = useCallback(() => {
    if (isAnimating || showcaseOpen === null) return;

    const currentId = showcaseOpen;
    const container = showcaseContainerRefs.current[currentId];
    if (!container) return;

    setIsAnimating(true);
    showcaseLockRef.current = false;

    if (prefersReducedMotion()) {
      gsap.set(container, { height: 0, opacity: 0 });
      setShowcaseOpen(null);
      setIsAnimating(false);
      ScrollTrigger.refresh();
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setShowcaseOpen(null);
        setIsAnimating(false);
        ScrollTrigger.refresh();
      },
    });

    const contentRef = showcaseContentRefs.current[currentId];
    if (contentRef?.animateOut) {
      const contentTl = contentRef.animateOut();
      if (contentTl) tl.add(contentTl, 0);
    }

    const separator = container.querySelector('.showcase-separator');
    if (separator) tl.to(separator, { scaleX: 0, duration: 0.3, ease: 'expo.in' }, 0.3);

    tl.to(container, { height: 0, opacity: 0, duration: 0.7, ease: 'expo.inOut' }, 0.45);
  }, [isAnimating, showcaseOpen]);

  const handleOpenShowcase = useCallback(
    (projectId) => {
      if (isAnimating || showcaseOpen === projectId) return;

      if (showcaseOpen !== null) {
        instantClose(showcaseOpen);
        setShowcaseOpen(null);
        showcaseLockRef.current = false;
      }

      setIsAnimating(true);
      setShowcaseOpen(projectId);

      const projectIndex = projects.findIndex((p) => p.id === projectId);
      if (projectIndex > -1) lockBackgroundTo(projectIndex);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const container = showcaseContainerRefs.current[projectId];
          if (!container) {
            setIsAnimating(false);
            return;
          }

          const inner = container.querySelector('.showcase-inner');
          inner.style.position = 'relative';
          const naturalHeight = inner.scrollHeight;

          if (prefersReducedMotion()) {
            gsap.set(container, { height: 'auto', opacity: 1 });
            setIsAnimating(false);
            ScrollTrigger.refresh();
            scrollToSection(container, { offset: -100 });
            return;
          }

          const tl = gsap.timeline({
            onComplete: () => {
              setIsAnimating(false);
              gsap.set(container, { height: 'auto' });
              ScrollTrigger.refresh();
            },
          });

          tl.fromTo(
            container,
            { height: 0, opacity: 0 },
            { height: naturalHeight, opacity: 1, duration: 0.9, ease: 'expo.inOut' }
          );

          const separator = container.querySelector('.showcase-separator');
          if (separator) {
            tl.fromTo(
              separator,
              { scaleX: 0 },
              { scaleX: 1, duration: 0.6, ease: 'expo.out' },
              0.3
            );
          }

          const contentRef = showcaseContentRefs.current[projectId];
          if (contentRef?.animateIn) {
            const contentTl = contentRef.animateIn();
            if (contentTl) tl.add(contentTl, 0.4);
          }

          // Scroll through Lenis so we never fight the smooth-scroll engine
          setTimeout(() => scrollToSection(container, { offset: -100 }), 300);
        });
      });
    },
    [isAnimating, showcaseOpen, instantClose, lockBackgroundTo]
  );

  /* ── Escape closes the open case study ── */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape' || activeImage) return;
      if (showcaseOpen !== null && !isAnimating) handleCloseShowcase();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showcaseOpen, isAnimating, activeImage, handleCloseShowcase]);

  /* ── Lightbox: modal semantics, focus trap, focus restore ── */
  useEffect(() => {
    if (!activeImage) return;
    lastFocusedRef.current = document.activeElement;
    lightboxCloseRef.current?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') return setActiveImage(null);
      if (e.key !== 'Tab') return;
      const f = lightboxRef.current?.querySelectorAll('button, [href]');
      if (!f?.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      lastFocusedRef.current?.focus?.();
    };
  }, [activeImage]);

  return (
    <section id="projects" ref={wrapperRef} className="relative py-24">
      {/* Palette layers — fixed, composited, behind everything */}
      <div className="bg-stack" aria-hidden="true">
        {projects.map((p, i) => (
          <div
            key={p.id}
            ref={(el) => {
              bgLayerRefs.current[i] = el;
            }}
            className="bg-stack__layer"
            style={{ background: gradient(p.palette) }}
          />
        ))}
        <div
          ref={(el) => {
            bgLayerRefs.current[projects.length] = el;
          }}
          className="bg-stack__layer"
          style={{ background: '#0A0A0B' }}
        />
      </div>

      {/* Section heading */}
      <div ref={headingRef} className="max-w-7xl mx-auto px-6 lg:px-8 mb-20">
        <span className="section-label font-body">{t('projects.label')}</span>
        <h2 className="mt-5 font-display font-bold text-4xl sm:text-5xl md:text-6xl text-light tracking-tight">
          {t('projects.title')}
        </h2>
        <div className="mt-4 w-24 h-1 bg-light/20 rounded-full" />
      </div>

      {/* Alternating project cards */}
      <div className="flex flex-col gap-32 lg:gap-40">
        {projects.map((project, index) => {
          const hasShowcase = SHOWCASE_IDS.includes(project.id);
          return (
            <div key={project.id}>
              <div className="project-section py-12">
                <ProjectCard
                  project={project}
                  index={index}
                  onImageClick={setActiveImage}
                  onShowcase={hasShowcase ? () => handleOpenShowcase(project.id) : undefined}
                  showcaseOpen={showcaseOpen === project.id}
                />
              </div>

              {hasShowcase && (
                <div
                  id={`showcase-${project.id}`}
                  ref={(el) => {
                    showcaseContainerRefs.current[project.id] = el;
                  }}
                  className="showcase-container"
                  style={{ height: 0, opacity: 0, overflow: 'hidden' }}
                >
                  <div className="max-w-6xl mx-auto px-6 lg:px-8">
                    <div
                      className="showcase-separator h-px w-full origin-left"
                      style={{
                        background: `linear-gradient(to right, transparent, ${project.palette.accent}40, transparent)`,
                      }}
                    />
                  </div>

                  <div className="showcase-inner">
                    {showcaseOpen === project.id && (
                      <Suspense fallback={null}>
                        {project.id === 4 ? (
                          <MeaCulpaShowcase
                            ref={(el) => {
                              showcaseContentRefs.current[project.id] = el;
                            }}
                            onClose={handleCloseShowcase}
                          />
                        ) : (
                          <NovaSiteShowcase
                            ref={(el) => {
                              showcaseContentRefs.current[project.id] = el;
                            }}
                            onClose={handleCloseShowcase}
                          />
                        )}
                      </Suspense>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* GitHub CTA */}
      <div ref={ctaRef} className="flex justify-center mt-32 mb-8">
        <a
          href="https://github.com/paulolguadamuz"
          target="_blank"
          rel="noopener noreferrer"
          data-cursor="link"
          className="magnetic group flex items-center gap-3 font-body text-sm uppercase tracking-widest px-8 py-4 border border-light/20 rounded-full text-light hover:bg-light hover:text-dark transition-colors duration-300"
        >
          <FiGithub className="w-5 h-5" />
          {t('projects.cta_github')}
        </a>
      </div>

      {/* Lightbox */}
      <div
        ref={lightboxRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('projects.view')}
        className={`lightbox ${activeImage ? 'is-open' : ''}`}
        onClick={() => setActiveImage(null)}
      >
        <button
          type="button"
          ref={lightboxCloseRef}
          className="lightbox__close"
          onClick={() => setActiveImage(null)}
          aria-label={t('projects.close')}
          tabIndex={activeImage ? 0 : -1}
        >
          <FiX className="w-8 h-8" />
        </button>
        {activeImage && (
          <img src={activeImage} alt={t('projects.view')} onClick={(e) => e.stopPropagation()} />
        )}
      </div>
    </section>
  );
}
