import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import gsap from 'gsap';
import { FiUser, FiBook, FiShoppingCart, FiPlay, FiTool, FiUsers, FiExternalLink, FiX } from 'react-icons/fi';
import { useLang } from '../i18n/LanguageContext';

const ACCENT = '#D4A636';
const SURFACE = '#F5E6C8';

const MeaCulpaShowcase = forwardRef(function MeaCulpaShowcase({ onClose }, ref) {
  const { t } = useLang();
  const contentRef = useRef(null);
  const timelineRef = useRef(null);

  const features = [
    { icon: FiUser, key: 'characters' },
    { icon: FiBook, key: 'spells' },
    { icon: FiShoppingCart, key: 'commerce' },
    { icon: FiPlay, key: 'sessions' },
  ];

  const contributions = [
    { icon: FiUser, key: 'profiles' },
    { icon: FiBook, key: 'spells_module' },
    { icon: FiTool, key: 'bugfix' },
    { icon: FiUsers, key: 'support' },
  ];

  const stack = [
    { label: 'Frontend', key: 'frontend' },
    { label: 'Backend & DB', key: 'backend' },
    { label: t('meaculpa.stack.integrations_label'), key: 'integrations' },
  ];

  // Expose animateIn / animateOut methods to parent
  useImperativeHandle(ref, () => ({
    animateIn() {
      const content = contentRef.current;
      if (!content) return;

      const heading = content.querySelector('.mc-heading');
      const featureCards = content.querySelectorAll('.mc-feature');
      const contribHeading = content.querySelector('.mc-contrib-heading');
      const contribItems = content.querySelectorAll('.mc-contrib');
      const stackSection = content.querySelector('.mc-stack');
      const ctaRow = content.querySelector('.mc-cta-row');
      const closeBtn = content.querySelector('.mc-close-btn');

      // Kill any existing timeline
      if (timelineRef.current) timelineRef.current.kill();

      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      timelineRef.current = tl;

      // Close button fades in
      tl.fromTo(closeBtn,
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 1, duration: 0.6 },
        0
      );

      // Heading block reveals
      tl.fromTo(heading,
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1 },
        0.1
      );

      // Feature cards stagger from below
      tl.fromTo(featureCards,
        { opacity: 0, y: 40, scale: 0.94 },
        { opacity: 1, y: 0, scale: 1, duration: 0.9, stagger: 0.08 },
        0.35
      );

      // Contribution heading
      tl.fromTo(contribHeading,
        { opacity: 0, y: 35 },
        { opacity: 1, y: 0, duration: 0.9 },
        0.7
      );

      // Contribution items slide in from alternating sides
      tl.fromTo(contribItems,
        { opacity: 0, x: (i) => i % 2 === 0 ? -30 : 30 },
        { opacity: 1, x: 0, duration: 0.85, stagger: 0.07 },
        0.85
      );

      // Stack section
      tl.fromTo(stackSection,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.9 },
        1.1
      );

      // CTA row
      tl.fromTo(ctaRow,
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8 },
        1.3
      );

      return tl;
    },

    animateOut() {
      const content = contentRef.current;
      if (!content) return;

      if (timelineRef.current) timelineRef.current.kill();

      const allAnimated = content.querySelectorAll(
        '.mc-heading, .mc-feature, .mc-contrib-heading, .mc-contrib, .mc-stack, .mc-cta-row, .mc-close-btn'
      );

      const tl = gsap.timeline({ defaults: { ease: 'expo.in' } });
      timelineRef.current = tl;

      tl.to(allAnimated, {
        opacity: 0,
        y: -20,
        duration: 0.4,
        stagger: 0.02,
      });

      return tl;
    },
  }));

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timelineRef.current) timelineRef.current.kill();
    };
  }, []);

  return (
    <div ref={contentRef} className="relative py-20 lg:py-28">
      {/* Close button — floating top-right */}
      <button
        onClick={onClose}
        className="mc-close-btn absolute top-6 right-6 lg:right-10 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
        style={{
          border: `1px solid ${ACCENT}30`,
          background: `${ACCENT}08`,
          color: SURFACE,
        }}
        aria-label={t('projects.close')}
      >
        <FiX className="w-5 h-5" />
      </button>

      {/* Ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${ACCENT}08 0%, transparent 70%)`,
          filter: 'blur(80px)',
        }}
      />

      <div className="max-w-6xl mx-auto px-6 lg:px-8 relative">
        {/* Section heading */}
        <div className="mc-heading mb-16 lg:mb-20">
          <p
            className="font-body text-xs uppercase tracking-[0.25em] mb-4"
            style={{ color: ACCENT }}
          >
            {t('meaculpa.label')}
          </p>
          <h2
            className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight mb-5"
            style={{ color: SURFACE }}
          >
            {t('meaculpa.heading')}
          </h2>
          <p
            className="font-body text-base sm:text-lg leading-relaxed max-w-2xl"
            style={{ color: `${SURFACE}99` }}
          >
            {t('meaculpa.intro')}
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-20 lg:mb-24">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div key={feat.key} className="mc-feature meaculpa-feature-card">
                <div className="meaculpa-feature-icon">
                  <Icon className="w-5 h-5" style={{ color: ACCENT }} />
                </div>
                <h4
                  className="font-display font-semibold text-base sm:text-lg mb-2"
                  style={{ color: SURFACE }}
                >
                  {t(`meaculpa.features.${feat.key}.title`)}
                </h4>
                <p
                  className="font-body text-sm leading-relaxed"
                  style={{ color: `${SURFACE}88` }}
                >
                  {t(`meaculpa.features.${feat.key}.desc`)}
                </p>
              </div>
            );
          })}
        </div>

        {/* My Contributions */}
        <div className="mc-contrib-heading mb-10">
          <p
            className="font-body text-xs uppercase tracking-[0.25em] mb-3"
            style={{ color: ACCENT }}
          >
            {t('meaculpa.contrib_label')}
          </p>
          <h3
            className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl tracking-tight"
            style={{ color: SURFACE }}
          >
            {t('meaculpa.contrib_heading')}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-20 lg:mb-24">
          {contributions.map((contrib) => {
            const Icon = contrib.icon;
            return (
              <div key={contrib.key} className="mc-contrib meaculpa-contrib-item">
                <div
                  className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                  style={{
                    background: `${ACCENT}12`,
                    border: `1px solid ${ACCENT}25`,
                  }}
                >
                  <Icon className="w-4 h-4" style={{ color: ACCENT }} />
                </div>
                <div>
                  <h5
                    className="font-display font-semibold text-sm sm:text-base mb-1"
                    style={{ color: SURFACE }}
                  >
                    {t(`meaculpa.contributions.${contrib.key}.title`)}
                  </h5>
                  <p
                    className="font-body text-xs sm:text-sm leading-relaxed"
                    style={{ color: `${SURFACE}77` }}
                  >
                    {t(`meaculpa.contributions.${contrib.key}.desc`)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tech Stack */}
        <div className="mc-stack meaculpa-stack-section mb-14">
          <h4
            className="font-display font-bold text-lg sm:text-xl mb-6"
            style={{ color: SURFACE }}
          >
            {t('meaculpa.stack.title')}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {stack.map((s) => (
              <div key={s.key}>
                <p
                  className="font-body text-[0.65rem] uppercase tracking-[0.2em] mb-2"
                  style={{ color: ACCENT }}
                >
                  {s.label}
                </p>
                <p
                  className="font-body text-sm leading-relaxed"
                  style={{ color: `${SURFACE}AA` }}
                >
                  {t(`meaculpa.stack.${s.key}`)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div className="mc-cta-row flex flex-wrap items-center justify-center gap-4">
          <a
            href="https://www.meaculpadnd.com"
            target="_blank"
            rel="noopener noreferrer"
            className="project-visit-btn"
            style={{ '--accent': ACCENT, '--surface': SURFACE }}
          >
            <span className="project-visit-btn__glow" />
            <span className="project-visit-btn__content">
              <FiExternalLink className="w-4 h-4" />
              {t('meaculpa.cta')}
            </span>
          </a>
          <button
            onClick={onClose}
            className="project-visit-btn"
            style={{ '--accent': `${SURFACE}50`, '--surface': SURFACE }}
          >
            <span className="project-visit-btn__content">
              <FiX className="w-4 h-4" />
              {t('meaculpa.close')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
});

export default MeaCulpaShowcase;
