import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FiGithub, FiX } from 'react-icons/fi';
import { projects } from '../data/projects';
import ProjectCard from './ProjectCard';
import { useLang } from '../i18n/LanguageContext';

export default function Projects() {
  const { t } = useLang();
  const wrapperRef = useRef(null);
  const ctaRef = useRef(null);
  const [activeImage, setActiveImage] = useState(null);

  // Close modal on escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveImage(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
        {projects.map((project, index) => (
          <div key={project.id} className="project-section py-16">
            <ProjectCard project={project} index={index} onImageClick={setActiveImage} />
          </div>
        ))}
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
