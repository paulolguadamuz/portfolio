import { useEffect, useRef, useState, useCallback, lazy, Suspense } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FiGithub, FiX } from 'react-icons/fi';
import { projects } from '../data/projects';
import ProjectCard from './ProjectCard';
import { useLang } from '../i18n/LanguageContext';
import { FULL_MOTION, scrollToSection } from '../lib/motion';

// Case studies are only reachable behind a click — keep them out of the
// initial bundle, then warm them during idle time so the open animation
// (which measures the mounted content two frames later) never waits on a fetch.
const importMeaCulpa = () => import('./MeaCulpaShowcase');
const importNovaSite = () => import('./NovaSiteShowcase');
const MeaCulpaShowcase = lazy(importMeaCulpa);
const NovaSiteShowcase = lazy(importNovaSite);

// IDs of projects that have a case study showcase
const SHOWCASE_IDS = [1, 4];

const gradient = (palette) =>
  `linear-gradient(135deg, ${palette.from}, ${palette.to})`;

export default function Projects() {
  const { t } = useLang();
  const wrapperRef = useRef(null);
  const ctaRef = useRef(null);
  const [activeImage, setActiveImage] = useState(null);

  // Showcase expand/collapse state — keyed by project id
  const [showcaseOpen, setShowcaseOpen] = useState(null); // null = none open, or project id
  const [isAnimating, setIsAnimating] = useState(false);
  const showcaseContainerRefs = useRef({});
  const showcaseContentRefs = useRef({});

  // One fixed, GPU-composited layer per palette change. Fading these with
  // opacity replaces the old approach of rewriting a full-viewport gradient on
  // <body> on every scroll frame, which forced a whole-page repaint.
  const bgLayerRefs = useRef([]);

  // Ref-based lock so ScrollTrigger closures can check showcase state
  const showcaseLockRef = useRef(false);

  const lightboxRef = useRef(null);
  const lightboxCloseRef = useRef(null);
  const lastFocusedRef = useRef(null);

  /* ── Lightbox: modal semantics, focus trap and focus restore ── */
  useEffect(() => {
    if (!activeImage) return;

    lastFocusedRef.current = document.activeElement;
    lightboxCloseRef.current?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveImage(null);
        return;
      }
      if (e.key !== 'Tab') return;

      const focusables = lightboxRef.current?.querySelectorAll(
        'button, [href], img[tabindex]'
      );
      if (!focusables?.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      lastFocusedRef.current?.focus?.();
    };
  }, [activeImage]);

  /* ── Warm the case-study chunks once the page is idle ── */
  useEffect(() => {
    const warm = () => {
      importMeaCulpa();
      importNovaSite();
    };
    const id = window.requestIdleCallback?.(warm, { timeout: 3000 });
    const fallback = id === undefined ? setTimeout(warm, 2000) : null;
    return () => {
      if (id !== undefined) window.cancelIdleCallback?.(id);
      if (fallback) clearTimeout(fallback);
    };
  }, []);

  /* ── Escape closes an open showcase ── */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !activeImage && showcaseOpen !== null && !isAnimating) {
        handleCloseShowcase();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showcaseOpen, isAnimating, activeImage]);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add(FULL_MOTION, () => {
      const projectSections = gsap.utils.toArray('.project-section');

      // Each layer sits above the previous one, so a layer only ever fades IN —
      // never out — and the stack never dips back toward the base colour.
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

      projectSections.forEach((section, i) => {
        // Bring in this project's palette
        if (i === 0) {
          fadeIn(0, { trigger: section, start: 'top 85%', end: 'top 15%' });
        }
        // Bring in the next palette (or the closing dark layer) as this one leaves
        fadeIn(i + 1, { trigger: section, start: 'bottom 90%', end: 'bottom 10%' });
      });

      // CTA button animate in
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

  // Helper: instantly collapse a showcase container (no animation)
  const instantClose = useCallback((projectId) => {
    const container = showcaseContainerRefs.current[projectId];
    if (!container) return;
    gsap.killTweensOf(container);
    gsap.killTweensOf(container.querySelectorAll('*'));
    gsap.set(container, { height: 0, opacity: 0 });
  }, []);

  // Pin the background to one project's palette while its case study is open
  const lockBackgroundTo = useCallback((projectIndex) => {
    showcaseLockRef.current = true;
    bgLayerRefs.current.forEach((layer, i) => {
      if (layer) gsap.set(layer, { opacity: i <= projectIndex ? 1 : 0 });
    });
  }, []);

  // Open the showcase with orchestrated animation
  const handleOpenShowcase = useCallback(
    (projectId) => {
      if (isAnimating) return;
      if (showcaseOpen === projectId) return;

      // If a different showcase is open, close it instantly first
      if (showcaseOpen !== null) {
        instantClose(showcaseOpen);
        setShowcaseOpen(null);
        showcaseLockRef.current = false;
      }

      setIsAnimating(true);
      setShowcaseOpen(projectId);

      const projectIndex = projects.findIndex((p) => p.id === projectId);
      if (projectIndex > -1) lockBackgroundTo(projectIndex);

      // Wait for React to mount the content
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

          const tl = gsap.timeline({
            onComplete: () => {
              setIsAnimating(false);
              // Layout changed — recompute every trigger's start/end
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

          // Scroll through Lenis so we don't fight the smooth-scroll engine
          setTimeout(() => scrollToSection(container, { offset: -80 }), 300);
        });
      });
    },
    [isAnimating, showcaseOpen, instantClose, lockBackgroundTo]
  );

  // Close the showcase with reverse animation
  const handleCloseShowcase = useCallback(() => {
    if (isAnimating || showcaseOpen === null) return;

    const currentId = showcaseOpen;
    const container = showcaseContainerRefs.current[currentId];
    if (!container) return;

    setIsAnimating(true);

    // Unlock background so the scroll-driven layers take over again
    showcaseLockRef.current = false;

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
    if (separator) {
      tl.to(separator, { scaleX: 0, duration: 0.3, ease: 'expo.in' }, 0.3);
    }

    tl.to(container, { height: 0, opacity: 0, duration: 0.7, ease: 'expo.inOut' }, 0.45);
  }, [isAnimating, showcaseOpen]);

  return (
    <section id="projects" ref={wrapperRef} className="relative py-24">
      {/* Palette layers — fixed, composited, behind everything */}
      <div className="bg-stack" aria-hidden="true">
        {projects.map((project, i) => (
          <div
            key={project.id}
            ref={(el) => {
              bgLayerRefs.current[i] = el;
            }}
            className="bg-stack__layer"
            style={{ background: gradient(project.palette) }}
          />
        ))}
        {/* Closing layer: fades the page back to base as the last project leaves */}
        <div
          ref={(el) => {
            bgLayerRefs.current[projects.length] = el;
          }}
          className="bg-stack__layer"
          style={{ background: '#0A0A0B' }}
        />
      </div>

      {/* Section heading */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-20">
        <h2 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl text-light tracking-tight">
          {t('projects.title')}
        </h2>
        <div className="mt-4 w-24 h-1 bg-light/20 rounded-full" />
      </div>

      {/* Project cards */}
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

              {/* Expandable showcase — rendered right after its project card */}
              {hasShowcase && (
                <div
                  ref={(el) => {
                    showcaseContainerRefs.current[project.id] = el;
                  }}
                  className="showcase-container"
                  style={{ height: 0, opacity: 0, overflow: 'hidden' }}
                >
                  {/* Top separator line */}
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
                        ) : project.id === 1 ? (
                          <NovaSiteShowcase
                            ref={(el) => {
                              showcaseContentRefs.current[project.id] = el;
                            }}
                            onClose={handleCloseShowcase}
                          />
                        ) : null}
                      </Suspense>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* GitHub CTA — centered before contact */}
      <div ref={ctaRef} className="flex justify-center mt-32 mb-8">
        <a
          href="https://github.com/paulolguadamuz"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 font-body text-sm uppercase tracking-widest px-8 py-4 border border-light/20 rounded-full text-light hover:bg-light hover:text-dark transition-all duration-300"
        >
          <FiGithub className="w-5 h-5 group-hover:scale-110 transition-transform" />
          {t('projects.cta_github')}
        </a>
      </div>

      {/* Lightbox Modal */}
      <div
        ref={lightboxRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('projects.view')}
        className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl transition-opacity duration-500 ${
          activeImage ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setActiveImage(null)}
      >
        <button
          ref={lightboxCloseRef}
          className="absolute top-8 right-8 text-white/70 hover:text-white hover:scale-110 transition-all z-10"
          onClick={() => setActiveImage(null)}
          aria-label={t('projects.close')}
          tabIndex={activeImage ? 0 : -1}
        >
          <FiX className="w-10 h-10" />
        </button>

        {activeImage && (
          <img
            src={activeImage}
            alt={t('projects.view')}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </div>
    </section>
  );
}
