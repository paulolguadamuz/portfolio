import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FiGithub, FiX } from 'react-icons/fi';
import { projects } from '../data/projects';
import ProjectCard from './ProjectCard';
import MeaCulpaShowcase from './MeaCulpaShowcase';
import NovaSiteShowcase from './NovaSiteShowcase';
import { useLang } from '../i18n/LanguageContext';

// IDs of projects that have a case study showcase
const SHOWCASE_IDS = [1, 4];

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

  // Ref-based lock so ScrollTrigger closures can check showcase state
  const showcaseLockRef = useRef(false);

  // Close modal on escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveImage(null);
        if (showcaseOpen !== null && !isAnimating) handleCloseShowcase();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showcaseOpen, isAnimating]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const projectSections = gsap.utils.toArray('.project-section');

      projectSections.forEach((section, i) => {
        const project = projects[i];
        const nextProject = projects[i + 1];

        // Animate --bg-from and --bg-to on the body as each project scrolls into view
        if (i === 0) {
          ScrollTrigger.create({
            trigger: section,
            start: 'top 80%',
            end: 'top 20%',
            scrub: 1,
            onUpdate: (self) => {
              if (showcaseLockRef.current) return;
              const progress = self.progress;
              document.body.style.setProperty(
                '--bg-from',
                gsap.utils.interpolate('#0A0A0B', project.palette.from, progress)
              );
              document.body.style.setProperty(
                '--bg-to',
                gsap.utils.interpolate('#0A0A0B', project.palette.to, progress)
              );
            },
          });
        }

        if (nextProject) {
          ScrollTrigger.create({
            trigger: section,
            start: 'bottom 80%',
            end: 'bottom 20%',
            scrub: 1,
            onUpdate: (self) => {
              if (showcaseLockRef.current) return;
              const progress = self.progress;
              document.body.style.setProperty(
                '--bg-from',
                gsap.utils.interpolate(
                  project.palette.from,
                  nextProject.palette.from,
                  progress
                )
              );
              document.body.style.setProperty(
                '--bg-to',
                gsap.utils.interpolate(
                  project.palette.to,
                  nextProject.palette.to,
                  progress
                )
              );
            },
          });
        } else {
          ScrollTrigger.create({
            trigger: section,
            start: 'bottom 80%',
            end: 'bottom 20%',
            scrub: 1,
            onUpdate: (self) => {
              if (showcaseLockRef.current) return;
              const progress = self.progress;
              document.body.style.setProperty(
                '--bg-from',
                gsap.utils.interpolate(project.palette.from, '#0A0A0B', progress)
              );
              document.body.style.setProperty(
                '--bg-to',
                gsap.utils.interpolate(project.palette.to, '#0A0A0B', progress)
              );
            },
          });
        }
      });

      // CTA button animate in
      if (ctaRef.current) {
        gsap.fromTo(
          ctaRef.current,
          { opacity: 0, y: 40, scale: 0.95, filter: 'blur(8px)' },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
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

    return () => ctx.revert();
  }, []);

  // Helper: instantly collapse a showcase container (no animation)
  const instantClose = useCallback((projectId) => {
    const container = showcaseContainerRefs.current[projectId];
    if (!container) return;
    gsap.killTweensOf(container);
    gsap.killTweensOf(container.querySelectorAll('*'));
    gsap.set(container, { height: 0, opacity: 0 });
  }, []);

  // Open the showcase with orchestrated animation
  const handleOpenShowcase = useCallback((projectId) => {
    if (isAnimating) return;

    // If the same showcase is already open, do nothing
    if (showcaseOpen === projectId) return;

    // If a different showcase is open, close it instantly first
    if (showcaseOpen !== null) {
      const prevId = showcaseOpen;
      instantClose(prevId);
      setShowcaseOpen(null);
      showcaseLockRef.current = false;
    }

    setIsAnimating(true);
    setShowcaseOpen(projectId);

    // Lock background color to this project's palette
    const project = projects.find(p => p.id === projectId);
    if (project) {
      showcaseLockRef.current = true;
      document.body.style.setProperty('--bg-from', project.palette.from);
      document.body.style.setProperty('--bg-to', project.palette.to);
    }

    // Wait for React to mount the content
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const container = showcaseContainerRefs.current[projectId];
        if (!container) return;

        // Measure natural height
        const inner = container.querySelector('.showcase-inner');
        inner.style.position = 'relative';
        const naturalHeight = inner.scrollHeight;

        // Animate the container open
        const tl = gsap.timeline({
          onComplete: () => {
            setIsAnimating(false);
            // Refresh ScrollTrigger after layout change
            ScrollTrigger.refresh();
          },
        });

        // Container height + opacity
        tl.fromTo(container,
          { height: 0, opacity: 0 },
          {
            height: naturalHeight,
            opacity: 1,
            duration: 0.9,
            ease: 'expo.inOut',
          }
        );

        // Separator line draws in
        const separator = container.querySelector('.showcase-separator');
        if (separator) {
          tl.fromTo(separator,
            { scaleX: 0 },
            { scaleX: 1, duration: 0.6, ease: 'expo.out' },
            0.3
          );
        }

        // Trigger the content's staggered reveal
        const contentRef = showcaseContentRefs.current[projectId];
        if (contentRef?.animateIn) {
          const contentTl = contentRef.animateIn();
          tl.add(contentTl, 0.4);
        }

        // Smooth scroll to the showcase
        setTimeout(() => {
          container.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
      });
    });
  }, [isAnimating, showcaseOpen, instantClose]);

  // Close the showcase with reverse animation
  const handleCloseShowcase = useCallback(() => {
    if (isAnimating || showcaseOpen === null) return;
    setIsAnimating(true);

    const currentId = showcaseOpen;
    const container = showcaseContainerRefs.current[currentId];
    if (!container) return;

    // Unlock background colors so ScrollTrigger can resume
    showcaseLockRef.current = false;

    const tl = gsap.timeline({
      onComplete: () => {
        setShowcaseOpen(null);
        setIsAnimating(false);
        ScrollTrigger.refresh();
      },
    });

    // First animate content out
    const contentRef = showcaseContentRefs.current[currentId];
    if (contentRef?.animateOut) {
      const contentTl = contentRef.animateOut();
      tl.add(contentTl, 0);
    }

    // Separator retracts
    const separator = container.querySelector('.showcase-separator');
    if (separator) {
      tl.to(separator, { scaleX: 0, duration: 0.3, ease: 'expo.in' }, 0.3);
    }

    // Then collapse the container
    tl.to(container, {
      height: 0,
      opacity: 0,
      duration: 0.7,
      ease: 'expo.inOut',
    }, 0.45);
  }, [isAnimating, showcaseOpen]);

  return (
    <section id="projects" ref={wrapperRef} className="relative py-24">
      {/* Section heading */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-20">
        <h2 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl text-light tracking-tight">
          {t('projects.title')}
        </h2>
        <div className="mt-4 w-24 h-1 bg-light/20 rounded-full" />
      </div>

      {/* Project cards — increased gap for slower color transitions */}
      <div className="flex flex-col gap-56 lg:gap-72">
        {projects.map((project, index) => {
          const hasShowcase = SHOWCASE_IDS.includes(project.id);
          return (
            <div key={project.id}>
              <div className="project-section py-16">
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
                  ref={(el) => { showcaseContainerRefs.current[project.id] = el; }}
                  className="showcase-container"
                  style={{ height: 0, opacity: 0, overflow: 'hidden' }}
                >
                  {/* Top separator line */}
                  <div className="max-w-6xl mx-auto px-6 lg:px-8">
                    <div
                      className="showcase-separator h-px w-full origin-left"
                      style={{ background: `linear-gradient(to right, transparent, ${project.palette.accent}40, transparent)` }}
                    />
                  </div>

                  <div className="showcase-inner">
                    {showcaseOpen === project.id && (
                      project.id === 4 ? (
                        <MeaCulpaShowcase
                          ref={(el) => { showcaseContentRefs.current[project.id] = el; }}
                          onClose={handleCloseShowcase}
                        />
                      ) : project.id === 1 ? (
                        <NovaSiteShowcase
                          ref={(el) => { showcaseContentRefs.current[project.id] = el; }}
                          onClose={handleCloseShowcase}
                        />
                      ) : null
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
        className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl transition-all duration-500 ${
          activeImage ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setActiveImage(null)}
      >
        <button 
          className="absolute top-8 right-8 text-white/50 hover:text-white hover:scale-110 transition-all z-10"
          onClick={() => setActiveImage(null)}
          aria-label={t('projects.close')}
        >
          <FiX className="w-10 h-10" />
        </button>

        {activeImage && (
          <img
            src={activeImage}
            alt={t('projects.view')}
            className={`max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              activeImage ? 'scale-100' : 'scale-95'
            }`}
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </div>
    </section>
  );
}
