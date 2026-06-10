import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  SiReact,
  SiJavascript,
  SiTypescript,
  SiTailwindcss,
  SiPython,
  SiPostgresql,
} from 'react-icons/si';
import { useLang } from '../i18n/LanguageContext';

const SKILLS = [
  {
    id: 'react',
    icon: SiReact,
    color: '#61DAFB',
  },
  {
    id: 'javascript',
    icon: SiJavascript,
    color: '#F7DF1E',
  },
  {
    id: 'typescript',
    icon: SiTypescript,
    color: '#3178C6',
  },
  {
    id: 'tailwind',
    icon: SiTailwindcss,
    color: '#06B6D4',
  },
  {
    id: 'sql',
    icon: SiPostgresql,
    color: '#4169E1',
  },
  {
    id: 'python',
    icon: SiPython,
    color: '#3776AB',
  },
];

export default function Skills() {
  const { t } = useLang();
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const lineRef = useRef(null);
  const nodesRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading reveal
      gsap.fromTo(
        headingRef.current,
        { opacity: 0, y: 50, rotateX: -20, filter: 'blur(10px)' },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          filter: 'blur(0px)',
          duration: 1.2,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Vertical line grows downward
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          duration: 1.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: lineRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Each node reveals in sequence
      nodesRef.current.forEach((node, i) => {
        if (!node) return;

        const dot = node.querySelector('.timeline-dot');
        const chars = node.querySelectorAll('.tech-char');
        const desc = node.querySelector('.timeline-desc');
        const line = node.querySelector('.timeline-accent-line');

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: node,
            start: 'top 82%',
            toggleActions: 'play none none reverse',
          },
        });

        // Dot scales in
        tl.fromTo(
          dot,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2)' }
        );

        // Matrix Rain for name characters
        tl.fromTo(
          chars,
          { y: -100, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: { each: 0.05, from: 'random' },
            duration: 0.2,
            ease: 'power2.out',
          },
          '-=0.3'
        );

        // Ink Bleed animation for description
        tl.fromTo(
          desc,
          { filter: 'blur(20px)', opacity: 0, scale: 0.9 },
          {
            filter: 'blur(0px)',
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: 'power2.out',
          },
          '-=0.3'
        );

        // Accent line grows
        tl.fromTo(
          line,
          { scaleX: 0 },
          { scaleX: 1, duration: 0.4, ease: 'power2.out' },
          '-=0.2'
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="skills"
      ref={sectionRef}
      className="relative py-24 lg:py-32 overflow-hidden"
    >
      {/* Section heading */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-20">
        <h2
          ref={headingRef}
          className="font-display font-bold text-4xl sm:text-5xl md:text-6xl text-light tracking-tight"
        >
          {t('skills.title')}
        </h2>
        <div className="mt-4 w-24 h-1 bg-light/20 rounded-full" />
      </div>

      {/* Timeline */}
      <div className="max-w-4xl mx-auto px-6 lg:px-8 relative">
        {/* Vertical line — centered */}
        <div
          ref={lineRef}
          className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-px origin-top"
          style={{
            background:
              'linear-gradient(to bottom, transparent, rgba(245,245,240,0.15) 10%, rgba(245,245,240,0.15) 90%, transparent)',
          }}
        />

        {/* Nodes */}
        <div className="flex flex-col gap-16 sm:gap-20">
          {SKILLS.map((skill, i) => {
            const Icon = skill.icon;
            const isLeft = i % 2 === 0;
            const techName = t(`skills.items.${skill.id}.name`);
            const techDesc = t(`skills.items.${skill.id}.desc`);

            return (
              <div
                key={skill.id}
                ref={(el) => (nodesRef.current[i] = el)}
                className="relative flex items-start sm:items-center"
              >
                {/* Dot on the line */}
                <div
                  className="timeline-dot absolute left-6 sm:left-1/2 -translate-x-1/2 z-10 flex items-center justify-center"
                >
                  <div
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center"
                    style={{
                      background: `radial-gradient(circle, ${skill.color}18 0%, transparent 70%)`,
                      border: `1px solid ${skill.color}30`,
                      boxShadow: `0 0 20px ${skill.color}15`,
                    }}
                  >
                    <Icon
                      className="w-5 h-5 sm:w-6 sm:h-6"
                      style={{ color: skill.color }}
                    />
                  </div>
                </div>

                {/* Content card — alternates sides on desktop, always right on mobile */}
                <div
                  className={`timeline-content ml-16 sm:ml-0 sm:w-[calc(50%-2rem)] ${isLeft
                    ? 'sm:mr-auto sm:pr-8 sm:text-right'
                    : 'sm:ml-auto sm:pl-8 sm:text-left'
                    }`}
                >
                  <div
                    className={`flex items-center gap-3 mb-2 ${isLeft ? 'sm:flex-row-reverse' : ''
                      }`}
                  >
                    <h3
                      className="font-bold text-xl sm:text-2xl tracking-tight text-light select-none"
                      style={{ fontFamily: 'monospace' }}
                    >
                      {techName.split('').map((char, charIdx) => (
                        <span
                          key={charIdx}
                          className="tech-char inline-block"
                          style={{ display: 'inline-block' }}
                        >
                          {char === ' ' ? '\u00A0' : char}
                        </span>
                      ))}
                    </h3>
                  </div>

                  <p
                    className="timeline-desc text-sm sm:text-base text-light/50 leading-relaxed select-none"
                    style={{ fontFamily: 'monospace' }}
                  >
                    {techDesc}
                  </p>

                  {/* Subtle accent line */}
                  <div
                    className={`timeline-accent-line mt-3 h-px w-12 rounded-full origin-left ${isLeft ? 'sm:ml-auto sm:origin-right' : ''
                      }`}
                    style={{
                      background: `linear-gradient(to right, ${skill.color}50, transparent)`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
