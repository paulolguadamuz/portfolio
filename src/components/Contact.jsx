import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLang } from '../i18n/LanguageContext';

export default function Contact() {
  const { t } = useLang();
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const subtextRef = useRef(null);
  const formRef = useRef(null);

  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.id.replace('contact-', '')]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus({ state: 'error', message: t('contact.error_fields') });
      return;
    }

    setStatus({ state: 'loading', message: t('contact.sending') });

    try {
      const response = await fetch('http://localhost:3000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus({ state: 'success', message: t('contact.success') });
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus({ state: 'error', message: t('contact.error_send') });
      }
    } catch (error) {
      setStatus({ state: 'error', message: t('contact.error_connection') });
    }
  };

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

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

          {/* Left side: Typography & Info */}
          <div className="flex flex-col gap-8 text-left">
            <h2
              ref={headingRef}
              className="font-display font-extrabold text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] tracking-tight leading-[1.1] text-light"
            >
              {t('contact.heading_1')} <br className="hidden lg:block" />
              <span className="text-light/50">
                {t('contact.heading_2')}
              </span>
            </h2>

            <p
              ref={subtextRef}
              className="font-body text-lg sm:text-xl text-light/50 max-w-lg leading-relaxed"
            >
              {t('contact.subtext')}
            </p>
          </div>

          {/* Right side: Contact Form */}
          <form
            ref={formRef}
            className="glass rounded-2xl p-8 sm:p-10 text-left flex flex-col gap-6"
            onSubmit={handleSubmit}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="contact-name"
                  className="font-body text-sm text-light/60 uppercase tracking-wider"
                >
                  {t('contact.label_name')}
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t('contact.placeholder_name')}
                  className="form-input bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-light font-body placeholder:text-light/25"
                  disabled={status.state === 'loading'}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="contact-email"
                  className="font-body text-sm text-light/60 uppercase tracking-wider"
                >
                  {t('contact.label_email')}
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t('contact.placeholder_email')}
                  className="form-input bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-light font-body placeholder:text-light/25"
                  disabled={status.state === 'loading'}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="contact-message"
                className="font-body text-sm text-light/60 uppercase tracking-wider"
              >
                {t('contact.label_message')}
              </label>
              <textarea
                id="contact-message"
                rows={5}
                value={formData.message}
                onChange={handleChange}
                placeholder={t('contact.placeholder_message')}
                className="form-input bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-light font-body placeholder:text-light/25 resize-none"
                disabled={status.state === 'loading'}
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
              <button
                type="submit"
                disabled={status.state === 'loading'}
                className="font-body text-sm uppercase tracking-widest px-8 py-3 bg-light text-dark rounded-full hover:bg-light/90 hover:scale-105 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 w-full sm:w-auto"
              >
                {status.state === 'loading' ? t('contact.sending') : t('contact.submit')}
              </button>
              {status.message && (
                <p className={`font-body text-sm ${status.state === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                  {status.message}
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
