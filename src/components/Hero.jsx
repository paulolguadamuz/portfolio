import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Hero() {
  const sectionRef = useRef(null);
  const nameRef = useRef(null);
  const subtitleRef = useRef(null);
  const bioRef = useRef(null);
  const photoRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Split name into words, then letters per word (prevents mid-word line breaks)
      const nameEl = nameRef.current;
      const text = nameEl.textContent;
      const words = text.split(' ');

      // High-end 3D flip animation setup for letters
      nameEl.innerHTML = words
        .map(
          (word) =>
            `<span style="display:inline-block; white-space:nowrap; perspective: 800px;">${word
              .split('')
              .map(
                (char) =>
                  `<span class="letter-span" style="display:inline-block; opacity:0; transform: translateY(60px) rotateX(-90deg); transform-origin: 50% 50% -20px;">${char}</span>`
              )
              .join('')}</span>`
        )
        .join(' ');

      const letters = nameEl.querySelectorAll('.letter-span');

      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      tl.to(letters, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 1.2,
        stagger: 0.03,
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
    }, sectionRef);

    return () => ctx.revert();
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
            className="font-display font-extrabold text-5xl sm:text-6xl md:text-7xl lg:text-[6rem] tracking-wide leading-[1.1] text-light drop-shadow-2xl"
          >
            PAULO JIMENEZ
          </h1>

          <p
            ref={subtitleRef}
            className="font-display font-semibold text-xl sm:text-2xl lg:text-3xl text-light/90 tracking-wide drop-shadow-lg"
          >
            Ingeniero TI , Desarrollador Web, UI/UX Designer.
          </p>

          <p
            ref={bioRef}
            className="font-body text-base sm:text-lg lg:text-xl text-light/70 max-w-2xl leading-relaxed drop-shadow-md backdrop-blur-[2px] bg-black/10 p-5 rounded-2xl border border-white/5"
          >
            Soy un ingeniero en tecnologías de información con experiencia en
            desarrollo web, diseño de interfaces, ciberseguridad y soluciones tecnológicas.
            Me especializo en crear soluciones eficientes y escalables para
            empresas y organizaciones.


          </p>

          <div className="flex gap-4 mt-6">
            <a
              href="#projects"
              className="font-body text-sm uppercase tracking-widest px-8 py-4 border border-light/30 rounded-full text-light hover:bg-light hover:text-dark transition-all duration-300 backdrop-blur-md bg-black/20"
            >
              Ver proyectos
            </a>
            <a
              href="#contact"
              className="font-body text-sm uppercase tracking-widest px-8 py-4 bg-light text-dark rounded-full hover:bg-light/90 transition-all duration-300 shadow-xl"
            >
              Contacto
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
