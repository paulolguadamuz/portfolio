import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FiExternalLink, FiLock, FiBookOpen, FiChevronUp } from 'react-icons/fi';
import { useLang } from '../i18n/LanguageContext';
import { FULL_MOTION } from '../lib/motion';

export default function ProjectCard({ project, index, onImageClick, onShowcase, showcaseOpen }) {
  const { t } = useLang();
  const cardRef = useRef(null);
  const imageRef = useRef(null);
  const galleryRef = useRef(null);
  const titleRef = useRef(null);
  const descRef = useRef(null);
  const tagsRef = useRef(null);
  const actionRef = useRef(null);

  const isEven = index % 2 === 0;

  // Get translated description if available
  const description = t(`projects.descriptions.${project.id}`) || project.description;

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add(FULL_MOTION, () => {
      // Main image premium parallax reveal
      gsap.fromTo(
        imageRef.current,
        { clipPath: isEven ? 'inset(0% 100% 0% 0%)' : 'inset(0% 0% 0% 100%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1.5,
          ease: 'expo.inOut',
          scrollTrigger: {
            trigger: cardRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      const mainImg = imageRef.current.querySelector('img');
      gsap.fromTo(
        mainImg,
        { scale: 1.3 },
        {
          scale: 1,
          duration: 1.5,
          ease: 'expo.inOut',
          scrollTrigger: {
            trigger: cardRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Gallery thumbnails stagger
      if (galleryRef.current) {
        const thumbs = galleryRef.current.children;
        if (thumbs.length) {
          gsap.fromTo(
            thumbs,
            { clipPath: 'inset(100% 0% 0% 0%)', y: 20 },
            {
              clipPath: 'inset(0% 0% 0% 0%)',
              y: 0,
              duration: 1.2,
              stagger: 0.1,
              ease: 'expo.out',
              scrollTrigger: {
                trigger: cardRef.current,
                start: 'top 65%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        }
      }

      // Title reveal
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 50, rotateX: -30 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 1.2,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: cardRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Description reveal
      gsap.fromTo(
        descRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          delay: 0.1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: cardRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Tags stagger reveal
      const tagEls = tagsRef.current?.children;
      if (tagEls?.length) {
        gsap.fromTo(
          tagEls,
          { opacity: 0, y: 20, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.05,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: cardRef.current,
              start: 'top 65%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Action button reveal
      if (actionRef.current) {
        gsap.fromTo(
          actionRef.current,
          { opacity: 0, y: 24, scale: 0.92 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            delay: 0.15,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: cardRef.current,
              start: 'top 60%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, cardRef);

    return () => mm.revert();
  }, [isEven]);

  // Translate tag if a translation exists, otherwise keep the original
  const translateTag = (tag) => {
    const translated = t(`projects.tags.${tag}`);
    // If translation returns the key path, it means no translation exists — keep original
    return translated === `projects.tags.${tag}` ? tag : translated;
  };

  return (
    <div
      ref={cardRef}
      className="max-w-7xl mx-auto px-6 lg:px-8 w-full"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Images column — swaps sides on desktop via order, not direction:rtl */}
        <div className={`flex flex-col gap-4 ${isEven ? '' : 'lg:order-2'}`}>
          {/* Main image */}
          <div
            ref={imageRef}
            className="project-image-frame rounded-2xl overflow-hidden shadow-2xl"
            style={{
              boxShadow: `0 25px 60px -12px ${project.palette.accent}25`,
            }}
          >
            <img
              src={project.image}
              alt={project.title}
              width="1600"
              height="900"
              className="w-full h-auto aspect-video object-cover cursor-pointer hover:scale-105 transition-transform duration-700"
              loading={index === 0 ? 'eager' : 'lazy'}
              fetchpriority={index === 0 ? 'high' : undefined}
              decoding="async"
              onClick={() => onImageClick(project.image)}
            />
          </div>

          {/* Gallery thumbnails */}
          {project.gallery && project.gallery.length > 0 && (
            <div ref={galleryRef} className={`grid gap-3 ${project.gallery.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {project.gallery.map((img, i) => (
                <div
                  key={i}
                  className="project-image-frame rounded-lg overflow-hidden border border-white/10"
                  style={{
                    boxShadow: `0 8px 24px -4px ${project.palette.accent}15`,
                  }}
                >
                  <img
                    src={img}
                    alt={`${project.title} - ${t('projects.view')} ${i + 1}`}
                    width="1600"
                    height="900"
                    className="w-full h-auto aspect-video object-cover cursor-pointer hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                    decoding="async"
                    onClick={() => onImageClick(img)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Text column */}
        <div className={`flex flex-col gap-5 ${isEven ? '' : 'lg:order-1'}`}>
          {/* Project number */}
          <span
            aria-hidden="true"
            className="font-display font-bold text-7xl lg:text-8xl opacity-30 leading-none"
            style={{ color: project.palette.accent }}
          >
            {String(project.id).padStart(2, '0')}
          </span>

          <h3
            ref={titleRef}
            className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight"
            style={{ color: project.palette.surface }}
          >
            {project.title}
          </h3>

          <p
            ref={descRef}
            className="font-body text-base sm:text-lg leading-relaxed max-w-lg"
            style={{ color: `${project.palette.surface}CC` }}
          >
            {description}
          </p>

          {/* Tags */}
          <div ref={tagsRef} className="flex flex-wrap gap-x-5 gap-y-2 mt-4">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-2 font-body text-xs uppercase tracking-widest font-medium"
                style={{
                  color: project.palette.surface,
                }}
              >
                <span 
                  className="w-1.5 h-1.5 rounded-full" 
                  style={{ 
                    backgroundColor: project.palette.accent,
                    boxShadow: `0 0 8px ${project.palette.accent}`
                  }} 
                />
                {translateTag(tag)}
              </span>
            ))}
          </div>

          {/* Project action — visit site, private badge, case study */}
          <div ref={actionRef} className="flex flex-wrap items-center gap-3 mt-6">
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="project-visit-btn"
                style={{
                  '--accent': project.palette.accent,
                  '--surface': project.palette.surface,
                }}
              >
                <span className="project-visit-btn__glow" />
                <span className="project-visit-btn__content">
                  <FiExternalLink className="w-4 h-4" />
                  {t('projects.visit_site')}
                </span>
              </a>
            )}

            {project.isPrivate && (
              <span
                className="project-private-badge"
                style={{
                  '--accent': project.palette.accent,
                  '--surface': project.palette.surface,
                }}
              >
                <FiLock className="w-3.5 h-3.5" />
                {t('projects.private_saas')}
              </span>
            )}

            {onShowcase && (
              <button
                onClick={onShowcase}
                className="project-showcase-btn"
                style={{
                  '--accent': project.palette.accent,
                  '--surface': project.palette.surface,
                }}
                disabled={showcaseOpen}
              >
                <span className="project-visit-btn__glow" />
                <span className="project-visit-btn__content">
                  {showcaseOpen ? (
                    <>
                      <FiChevronUp className="w-4 h-4" />
                      {t('projects.case_study_active')}
                    </>
                  ) : (
                    <>
                      <FiBookOpen className="w-4 h-4" />
                      {t('projects.case_study')}
                    </>
                  )}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
