import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useLang } from '../i18n/LanguageContext';

export default function Hero() {
  const { t } = useLang();
  const sectionRef = useRef(null);
  const nameRef = useRef(null);
  const subtitleRef = useRef(null);
  const bioRef = useRef(null);
  const photoRef = useRef(null);

  useEffect(() => {
    let glitchInterval;
    const nameEl = nameRef.current;

    const triggerGlitch = () => {
      if (!nameEl) return;
      const glitchTl = gsap.timeline({
        onStart: () => nameEl.classList.add('glitching'),
        onComplete: () => {
          nameEl.classList.remove('glitching');
          gsap.set(nameEl, { x: 0, skewX: 0 });
        }
      });

      glitchTl.to(nameEl, { x: -3, skewX: 10, duration: 0.05 })
        .to(nameEl, { x: 3, skewX: -8, duration: 0.05 })
        .to(nameEl, { x: 0, skewX: 0, duration: 0.05 });
    };

    const ctx = gsap.context(() => {
      // Split name into words, then letters per word (prevents mid-word line breaks)
      const text = nameEl.textContent;
      const words = text.split(' ');

      // High-end Spotlight Reveal animation setup for letters
      nameEl.innerHTML = words
        .map(
          (word) =>
            `<span style="display:inline-block; white-space:nowrap;">${word
              .split('')
              .map(
                (char) =>
                  `<span class="letter-span" style="display:inline-block; will-change: transform, opacity, filter;">${char}</span>`
              )
              .join('')}</span>`
        )
        .join(' ');

      const letters = nameEl.querySelectorAll('.letter-span');

      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      tl.from(letters, {
        opacity: 0.1,
        scale: 0.8,
        filter: 'blur(4px)',
        stagger: { each: 0.06, from: 'center' },
        duration: 0.6,
        ease: 'power2.out',
      })
        .from(
          subtitleRef.current,
          {
            opacity: 0,
            y: 20,
            filter: 'blur(8px)',
            duration: 1.2,
            ease: 'expo.out',
          },
          '-=0.8'
        )
        .from(
          bioRef.current,
          {
            opacity: 0,
            y: 20,
            filter: 'blur(8px)',
            duration: 1.2,
            ease: 'expo.out',
          },
          '-=1.0'
        )
        .from(
          photoRef.current,
          {
            opacity: 0,
            scale: 1.1,
            filter: 'blur(30px)',
            duration: 2,
            ease: 'expo.out',
          },
          '-=1.5'
        );

      // Trigger first glitch slightly after entry animation finishes
      tl.add(() => {
        triggerGlitch();
      }, '+=0.2');
    }, sectionRef);

    // Set up periodic glitch trigger (every 4.5 seconds)
    glitchInterval = setInterval(triggerGlitch, 4500);

    // Trigger glitch on hover
    if (nameEl) {
      nameEl.addEventListener('mouseenter', triggerGlitch);
    }

    return () => {
      ctx.revert();
      clearInterval(glitchInterval);
      if (nameEl) {
        nameEl.removeEventListener('mouseenter', triggerGlitch);
      }
    };
  }, []);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="min-h-screen flex items-center relative overflow-hidden pt-20"
    >
      {/* Background Photo - BIG, behind text, cut in half, blended */}
      <div
        ref={photoRef}
        className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
      >
        <div className="absolute inset-y-0 right-0 w-full lg:w-[65%] ml-auto h-full">
          <img
            src="/me.png"
            alt="Paulo Jimenez Guadamuz"
            className="w-full h-full object-cover object-center scale-110 origin-center"
            style={{
              // Corta la imagen a la mitad verticalmente (fade out on the left) y blend 
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 50%, black 100%), linear-gradient(to bottom, black 60%, transparent 100%)',
              maskImage: 'linear-gradient(to right, transparent 0%, black 40%, black 100%)',
              filter: 'saturate(0.5) contrast(1.1) brightness(0.9)',
              mixBlendMode: 'luminosity',
              opacity: 0.8
            }}
          />
          {/* Blend overlays */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to right, var(--bg-from) 0%, transparent 60%), linear-gradient(to top, var(--bg-from) 0%, transparent 30%)',
            }}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full relative z-10">
        <div className="flex flex-col gap-6 max-w-4xl">
          <h1
            ref={nameRef}
            className="font-signature font-normal text-6xl sm:text-7xl md:text-8xl lg:text-[8rem] tracking-wide leading-[1.1] text-light drop-shadow-2xl glitch-text"
            data-text="Paulo Jimenez"
          >
            Paulo Jimenez
          </h1>

          <p
            ref={subtitleRef}
            className="font-display font-semibold text-xl sm:text-2xl lg:text-3xl text-light/90 tracking-wide drop-shadow-lg"
          >
            {t('hero.subtitle')}
          </p>

          <p
            ref={bioRef}
            className="font-body text-base sm:text-lg lg:text-xl text-light/80 max-w-2xl leading-relaxed drop-shadow-md"
          >
            {t('hero.bio')}
          </p>

          <div className="flex gap-4 mt-6">
            <a
              href="#projects"
              className="font-body text-sm uppercase tracking-widest px-8 py-4 border border-light/30 rounded-full text-light hover:bg-light hover:text-dark transition-all duration-300 backdrop-blur-md bg-black/20"
            >
              {t('hero.cta_projects')}
            </a>
            <a
              href="#contact"
              className="font-body text-sm uppercase tracking-widest px-8 py-4 bg-light text-dark rounded-full hover:bg-light/90 transition-all duration-300 shadow-xl"
            >
              {t('hero.cta_contact')}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
