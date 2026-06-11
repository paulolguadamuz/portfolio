import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLang } from '../i18n/LanguageContext';

/* ── Sanitization & Validation helpers ── */

// Strip HTML/script tags to prevent XSS injection
const sanitize = (str) =>
  str.replace(/<[^>]*>/g, '').replace(/[<>]/g, '').trim();

// Basic email regex — RFC-light
const isValidEmail = (email) =>
  /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email);

// Max character limits
const LIMITS = { name: 100, email: 254, message: 500 };

export default function Contact() {
  const { t } = useLang();
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const subtextRef = useRef(null);
  const formRef = useRef(null);

  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  /* ── Field-level change with length cap ── */
  const handleChange = (e) => {
    const field = e.target.id.replace('contact-', '');
    const raw = e.target.value;

    // Enforce max length
    if (raw.length > LIMITS[field]) return;

    setFormData((prev) => ({ ...prev, [field]: raw }));

    // Clear field error on edit
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  /* ── Validate all fields ── */
  const validate = () => {
    const errs = {};

    const cleanName = sanitize(formData.name);
    const cleanEmail = sanitize(formData.email);
    const cleanMessage = sanitize(formData.message);

    if (!cleanName || cleanName.length < 2) {
      errs.name = t('contact.error_name');
    }

    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      errs.email = t('contact.error_email');
    }

    if (!cleanMessage || cleanMessage.length < 10) {
      errs.message = t('contact.error_message');
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ── Submit with sanitized payload ── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setStatus({ state: 'loading', message: t('contact.sending') });

    // Sanitize before sending
    const payload = {
      name: sanitize(formData.name),
      email: sanitize(formData.email),
      message: sanitize(formData.message),
    };

    try {
      // In Vercel production, /api/contact is native. Locally, we point to the Express server.
      const apiUrl = import.meta.env.PROD ? '' : 'http://localhost:3000';
      
      const response = await fetch(`${apiUrl}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setStatus({ state: 'success', message: t('contact.success') });
        setFormData({ name: '', email: '', message: '' });
        setErrors({});
      } else {
        const data = await response.json().catch(() => ({}));
        setStatus({
          state: 'error',
          message: data.error || t('contact.error_send'),
        });
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

  /* ── Inline error helper ── */
  const fieldError = (field) =>
    errors[field] ? (
      <span className="font-body text-xs text-red-400 mt-1">{errors[field]}</span>
    ) : null;

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
            autoComplete="off"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="contact-name"
                  className="font-body text-sm text-light/60 uppercase tracking-wider"
                >
                  {t('contact.label_name')} <span className="text-red-400">*</span>
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t('contact.placeholder_name')}
                  className={`form-input bg-white/5 border rounded-xl px-4 py-3 text-light font-body placeholder:text-light/25 transition-colors ${errors.name ? 'border-red-400/60' : 'border-white/10'
                    }`}
                  disabled={status.state === 'loading'}
                  autoComplete="off"
                  maxLength={LIMITS.name}
                />
                {fieldError('name')}
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="contact-email"
                  className="font-body text-sm text-light/60 uppercase tracking-wider"
                >
                  {t('contact.label_email')} <span className="text-red-400">*</span>
                </label>
                <input
                  id="contact-email"
                  type="text"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t('contact.placeholder_email')}
                  className={`form-input bg-white/5 border rounded-xl px-4 py-3 text-light font-body placeholder:text-light/25 transition-colors ${errors.email ? 'border-red-400/60' : 'border-white/10'
                    }`}
                  disabled={status.state === 'loading'}
                  autoComplete="off"
                  maxLength={LIMITS.email}
                />
                {fieldError('email')}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="contact-message"
                className="font-body text-sm text-light/60 uppercase tracking-wider"
              >
                {t('contact.label_message')} <span className="text-red-400">*</span>
              </label>
              <textarea
                id="contact-message"
                rows={5}
                value={formData.message}
                onChange={handleChange}
                placeholder={t('contact.placeholder_message')}
                className={`form-input bg-white/5 border rounded-xl px-4 py-3 text-light font-body placeholder:text-light/25 resize-none transition-colors ${errors.message ? 'border-red-400/60' : 'border-white/10'
                  }`}
                disabled={status.state === 'loading'}
                autoComplete="off"
                maxLength={LIMITS.message}
              />
              <div className="flex justify-between items-center">
                {fieldError('message')}
                <span className="font-body text-xs text-light/20 ml-auto">
                  {formData.message.length}/{LIMITS.message}
                </span>
              </div>
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

