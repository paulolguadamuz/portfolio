import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { prefersReducedMotion } from '../lib/motion';

// Never strand a visitor behind the curtain, however bad the connection.
const CEILING_MS = 6000;
// ...and never flash it either, however good the connection.
const FLOOR_MS = 900;

/**
 * Intro curtain gated on work that has actually finished.
 *
 * The counter is driven by resolved promises, not a timer: fonts, the WebGL
 * hero chunk, and every non-deferred image. Warming HeroScene here is the
 * point — Hero mounts it the instant the curtain lifts and the chunk is
 * already in the module cache, so nothing pops in afterwards.
 *
 * Skipped entirely under reduced motion, where it would just be a delay.
 */
export default function Preloader({ onDone }) {
  const rootRef = useRef(null);
  const counterRef = useRef(null);
  const barRef = useRef(null);
  const labelRef = useRef(null);
  const [hidden, setHidden] = useState(() => prefersReducedMotion());

  useEffect(() => {
    if (prefersReducedMotion()) {
      onDone?.();
      return;
    }

    // Lenis is not running yet, but a stray scroll during the intro would
    // desync every ScrollTrigger start position.
    document.body.style.overflow = 'hidden';

    const settle = (p) => Promise.resolve(p).catch(() => {});
    const work = [
      document.fonts.ready,
      import('./HeroScene'),
      ...Array.from(document.images)
        .filter((img) => img.loading !== 'lazy')
        .map((img) => img.decode()),
    ].map(settle);

    const proxy = { v: 0 };
    const render = () => {
      const n = Math.round(proxy.v);
      if (counterRef.current) {
        counterRef.current.textContent = String(n).padStart(3, '0');
      }
      if (barRef.current) gsap.set(barRef.current, { scaleX: n / 100 });
    };

    let done = 0;
    work.forEach((p) =>
      p.then(() => {
        done += 1;
        gsap.to(proxy, {
          v: (done / work.length) * 100,
          duration: 0.5,
          ease: 'power2.out',
          overwrite: true,
          onUpdate: render,
        });
      })
    );

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });

      // Outro: label lifts, then the curtain splits upward off-screen
      tl.to([labelRef.current, counterRef.current], {
        yPercent: -120,
        opacity: 0,
        duration: 0.6,
        stagger: 0.06,
        ease: 'power3.in',
      })
        .to(barRef.current, { opacity: 0, duration: 0.3 }, '<')
        .to(
          rootRef.current,
          {
            yPercent: -100,
            duration: 1,
            ease: 'expo.inOut',
            // Hand off as the curtain STARTS leaving, not when it lands: the
            // hero must already be mid-reveal by the time the screen is
            // uncovered, or the visitor gets a beat of empty black first.
            // expo.inOut barely moves for its first ~300ms, so the React
            // re-render and WebGL init this triggers are hidden inside it.
            onStart: () => onDone?.(),
            onComplete: () => {
              document.body.style.overflow = '';
              setHidden(true);
            },
          },
          '-=0.15'
        );

      Promise.race([
        Promise.all([...work, new Promise((r) => setTimeout(r, FLOOR_MS))]),
        new Promise((r) => setTimeout(r, CEILING_MS)),
      ]).then(() => {
        // Progress tweens are still in flight and target the same proxy
        gsap.killTweensOf(proxy);
        // Close the counter over whatever distance is actually left: a fast
        // connection is already at 100 and should not sit through a fixed tween.
        gsap.to(proxy, {
          v: 100,
          duration: 0.4 * (1 - proxy.v / 100),
          ease: 'power2.out',
          onUpdate: render,
          onComplete: () => tl.play(),
        });
      });
    }, rootRef);

    return () => {
      document.body.style.overflow = '';
      gsap.killTweensOf(proxy);
      ctx.revert();
    };
  }, [onDone]);

  if (hidden) return null;

  return (
    <div
      ref={rootRef}
      className="preloader"
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="preloader__inner">
        <span ref={labelRef} className="preloader__label font-signature">
          Paulo Jimenez
        </span>
        <span ref={counterRef} className="preloader__counter font-display">
          000
        </span>
      </div>
      <span ref={barRef} className="preloader__bar" aria-hidden="true" />
    </div>
  );
}
