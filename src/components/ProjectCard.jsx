import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function ProjectCard({ project, index, onImageClick }) {
  const cardRef = useRef(null);
  const imageRef = useRef(null);
  const galleryRef = useRef(null);
  const titleRef = useRef(null);
  const descRef = useRef(null);
  const tagsRef = useRef(null);

  const isEven = index % 2 === 0;

  useEffect(() => {
    const ctx = gsap.context(() => {
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
        { opacity: 0, y: 50, rotateX: -30, filter: 'blur(10px)' },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          filter: 'blur(0px)',
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
        { opacity: 0, y: 30, filter: 'blur(8px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
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
          { opacity: 0, y: 20, scale: 0.9, filter: 'blur(4px)' },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
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
    }, cardRef);

    return () => ctx.revert();
  }, [isEven]);

  return (
    <div
      ref={cardRef}
      className="max-w-7xl mx-auto px-6 lg:px-8 w-full"
    >
      <div
        className={`grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center ${
          isEven ? '' : 'lg:[direction:rtl]'
        }`}
      >
        {/* Images column */}
        <div className="flex flex-col gap-4 lg:[direction:ltr]">
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
              className="w-full h-auto aspect-video object-cover cursor-pointer hover:scale-105 transition-transform duration-700"
              loading="lazy"
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
                    alt={`${project.title} - vista ${i + 1}`}
                    className="w-full h-auto aspect-video object-cover cursor-pointer hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                    onClick={() => onImageClick(img)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Text column */}
        <div className="flex flex-col gap-5 lg:[direction:ltr]">
          {/* Project number */}
          <span
            className="font-display font-bold text-7xl lg:text-8xl opacity-10 leading-none"
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
            {project.description}
          </p>

          {/* Tags */}
          <div ref={tagsRef} className="flex flex-wrap gap-3 mt-4">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-2 font-body text-xs uppercase tracking-widest px-3 py-1.5 rounded border backdrop-blur-md"
                style={{
                  borderColor: `${project.palette.accent}30`,
                  color: project.palette.surface,
                  backgroundColor: `${project.palette.accent}0A`,
                }}
              >
                <span 
                  className="w-1.5 h-1.5 rounded-full" 
                  style={{ 
                    backgroundColor: project.palette.accent,
                    boxShadow: `0 0 8px ${project.palette.accent}`
                  }} 
                />
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
