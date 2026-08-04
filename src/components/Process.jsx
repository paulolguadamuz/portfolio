import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useLang } from '../i18n/LanguageContext';
import { FULL_MOTION } from '../lib/motion';

const STEPS = [1, 2, 3, 4];

export default function Process() {
  const { t } = useLang();
  const sectionRef = useRef(null);
  const railRef = useRef(null);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add(FULL_MOTION, () => {
      // Progress rail draws down as the section is read
      gsap.fromTo(
        railRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 65%',
            end: 'bottom 75%',
            scrub: 0.6,
          },
        }
      );

      gsap.utils.toArray('.process-step').forEach((step) => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: step, start: 'top 80%' },
        });

        tl.from(step.querySelector('.process-step__num'), {
          opacity: 0,
          scale: 0.6,
          duration: 0.6,
          ease: 'back.out(2)',
        })
          .to(
            step.querySelector('.process-step__num'),
            {
              duration: 0.9,
              scrambleText: {
                text: step.dataset.num,
                chars: '0123456789',
                speed: 0.6,
              },
              ease: 'none',
            },
            '<'
          )
          .from(
            [step.querySelector('.process-step__title'), step.querySelector('.process-step__desc')],
            { opacity: 0, y: 26, duration: 0.8, stagger: 0.08, ease: 'expo.out' },
            '-=0.5'
          )
          .from(
            step.querySelector('.process-step__line'),
            { scaleX: 0, duration: 0.7, ease: 'expo.out' },
            '-=0.55'
          );
      });
    }, sectionRef);

    return () => mm.revert();
  }, []);

  return (
    <section id="process" ref={sectionRef} className="process">
      <div className="process__inner">
        <header className="process__head">
          <span className="section-label font-body">{t('process.label')}</span>
          <h2 className="process__heading font-display">{t('process.heading')}</h2>
        </header>

        <div className="process__body">
          <span ref={railRef} className="process__rail" aria-hidden="true" />

          <ol className="process__list">
            {STEPS.map((n) => (
              <li key={n} className="process-step" data-num={String(n).padStart(2, '0')}>
                <span className="process-step__num font-body">
                  {String(n).padStart(2, '0')}
                </span>
                <div className="process-step__content">
                  <h3 className="process-step__title font-display">
                    {t(`process.steps.${n}.title`)}
                  </h3>
                  <span className="process-step__line" aria-hidden="true" />
                  <p className="process-step__desc font-body">
                    {t(`process.steps.${n}.desc`)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
