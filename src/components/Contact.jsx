import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function Contact() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const subtextRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          toggleActions: 'play none none reverse',
        },
        defaults: { ease: 'power3.out' },
      });

      tl.fromTo(
        headingRef.current,
        { opacity: 0, y: 50, rotateX: -20, filter: 'blur(10px)' },
        { opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)', duration: 1.2 }
      )
        .fromTo(
          subtextRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1 },
          '-=0.8'
        )
        .fromTo(
          formRef.current,
          { opacity: 0, y: 40, scale: 0.98, filter: 'blur(10px)' },
          { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 1.2 },
          '-=0.8'
        );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative py-32 overflow-hidden"
    >
      {/* Decorative blurred orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-light/[0.02] blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
        <h2
          ref={headingRef}
          className="font-display font-bold text-4xl sm:text-5xl md:text-6xl text-light tracking-tight"
        >
          Hablemos
        </h2>

        <p
          ref={subtextRef}
          className="font-body text-lg text-light/50 mt-6 max-w-xl mx-auto leading-relaxed"
        >
          ¿Tiene algún proyecto en mente? Me encantaría escuchar su idea y
          explorar cómo puedo ayudarle a hacerla realidad.
        </p>

        {/* Contact Form */}
        <form
          ref={formRef}
          className="glass rounded-2xl p-8 sm:p-10 text-left flex flex-col gap-6"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="contact-name"
                className="font-body text-sm text-light/60 uppercase tracking-wider"
              >
                Nombre
              </label>
              <input
                id="contact-name"
                type="text"
                placeholder="Tu nombre"
                className="form-input bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-light font-body placeholder:text-light/25"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="contact-email"
                className="font-body text-sm text-light/60 uppercase tracking-wider"
              >
                Email
              </label>
              <input
                id="contact-email"
                type="email"
                placeholder="tu@email.com"
                className="form-input bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-light font-body placeholder:text-light/25"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="contact-message"
              className="font-body text-sm text-light/60 uppercase tracking-wider"
            >
              Mensaje
            </label>
            <textarea
              id="contact-message"
              rows={5}
              placeholder="Cuéntame sobre tu proyecto..."
              className="form-input bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-light font-body placeholder:text-light/25 resize-none"
            />
          </div>

          <button
            type="submit"
            className="self-start font-body text-sm uppercase tracking-widest px-8 py-3 bg-light text-dark rounded-full hover:bg-light/90 hover:scale-105 transition-all duration-300 font-medium"
          >
            Enviar mensaje
          </button>
        </form>
      </div>
    </section>
  );
}
