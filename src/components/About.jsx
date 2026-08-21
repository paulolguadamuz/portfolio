import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { useLang } from '../i18n/LanguageContext';
import { FULL_MOTION } from '../lib/motion';

export default function About() {
  const { t } = useLang();
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const bioRef = useRef(null);
  const photoRef = useRef(null);
  const photoImgRef = useRef(null);
  const metaRef = useRef(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    let cancelled = false;

    mm.add(FULL_MOTION, () => {
      const splits = [];

      document.fonts.ready.then(() => {
        if (cancelled) return;

        const heading = SplitText.create(headingRef.current, {
          type: 'lines',
          mask: 'lines',
        });
        const bio = SplitText.create(bioRef.current, { type: 'lines', mask: 'lines' });
        splits.push(heading, bio);

        gsap.from(heading.lines, {
          yPercent: 115,
          duration: 1.1,
          stagger: 0.09,
          ease: 'expo.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 70%' },
        });

        gsap.from(bio.lines, {
          yPercent: 100,
          opacity: 0,
          duration: 0.9,
          stagger: 0.05,
          ease: 'expo.out',
          scrollTrigger: { trigger: bioRef.current, start: 'top 88%' },
        });
      });

      // Photo: unmasks from the bottom while the image itself drifts up —
      // clip-path + transform only, no filters.
      gsap.fromTo(
        photoRef.current,
        { clipPath: 'inset(100% 0% 0% 0%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1.4,
          ease: 'expo.inOut',
          scrollTrigger: { trigger: photoRef.current, start: 'top 82%' },
        }
      );

      gsap.fromTo(
        photoImgRef.current,
        { scale: 1.25, yPercent: 6 },
        {
          scale: 1,
          yPercent: 0,
          duration: 1.6,
          ease: 'expo.out',
          scrollTrigger: { trigger: photoRef.current, start: 'top 82%' },
        }
      );

      // Gentle parallax as the section passes through
      gsap.to(photoImgRef.current, {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        },
      });

      gsap.from(gsap.utils.toArray('.about-meta__row', metaRef.current), {
        opacity: 0,
        y: 22,
        duration: 0.8,
        stagger: 0.08,
        ease: 'expo.out',
        scrollTrigger: { trigger: metaRef.current, start: 'top 88%' },
      });

      return () => splits.forEach((s) => s.revert());
    }, sectionRef);

    return () => {
      cancelled = true;
      mm.revert();
    };
  }, []);

  return (
    <section id="about" ref={sectionRef} className="about">
      <div className="about__inner">
        <div className="about__col about__col--text">
          <h2 ref={headingRef} className="about__heading font-display">
            {t('about.heading_1')} <br />
            <em>{t('about.heading_2')}</em>
          </h2>

          <p ref={bioRef} className="about__bio font-body">
            {t('hero.bio')}
          </p>

          <dl ref={metaRef} className="about-meta font-body">
            <div className="about-meta__row">
              <dt>{t('about.meta_role')}</dt>
              <dd>{t('about.meta_role_value')}</dd>
            </div>
            <div className="about-meta__row">
              <dt>{t('about.meta_location')}</dt>
              <dd>{t('about.meta_location_value')}</dd>
            </div>
            <div className="about-meta__row">
              <dt>{t('about.meta_stack')}</dt>
              <dd>{t('about.meta_stack_value')}</dd>
            </div>
            <div className="about-meta__row">
              <dt>{t('about.meta_email')}</dt>
              <dd>
                <a href="mailto:paujigua@gmail.com" data-cursor="link">
                  paujigua@gmail.com
                </a>
              </dd>
            </div>
          </dl>
        </div>

        <div className="about__col about__col--media">
          <div ref={photoRef} className="about__photo">
            <img
              ref={photoImgRef}
              src="/me.webp"
              alt={t('about.photo_alt')}
              width="941"
              height="1672"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
