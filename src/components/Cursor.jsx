import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { FULL_MOTION_FINE } from '../lib/motion';

/**
 * Custom cursor: a small dot that tracks 1:1 and a ring that trails behind.
 *
 * State comes from `data-cursor` on whatever is hovered, so components opt in
 * declaratively (`data-cursor="view"`) instead of this file knowing every
 * selector on the site. Only mounts for fine pointers with motion allowed —
 * the real cursor is never hidden on touch or under reduced motion.
 */
export default function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add(FULL_MOTION_FINE, () => {
      const dot = dotRef.current;
      const ring = ringRef.current;
      const label = labelRef.current;

      document.documentElement.classList.add('has-custom-cursor');
      gsap.set([dot, ring], { xPercent: -50, yPercent: -50, opacity: 0 });

      const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3.out' });
      const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3.out' });
      const ringX = gsap.quickTo(ring, 'x', { duration: 0.45, ease: 'power3.out' });
      const ringY = gsap.quickTo(ring, 'y', { duration: 0.45, ease: 'power3.out' });

      let visible = false;

      const onMove = (e) => {
        if (!visible) {
          visible = true;
          gsap.to([dot, ring], { opacity: 1, duration: 0.3 });
        }
        dotX(e.clientX);
        dotY(e.clientY);
        ringX(e.clientX);
        ringY(e.clientY);

        const target = e.target.closest('[data-cursor]');
        const state = target?.dataset.cursor;

        if (state === 'view') {
          gsap.to(ring, { scale: 2.6, borderWidth: 1, duration: 0.35, ease: 'power3.out' });
          gsap.to(dot, { scale: 0, duration: 0.25 });
          if (label.textContent !== (target.dataset.cursorLabel || 'View')) {
            label.textContent = target.dataset.cursorLabel || 'View';
          }
          gsap.to(label, { opacity: 1, duration: 0.25 });
        } else if (state === 'close') {
          gsap.to(ring, { scale: 1.8, duration: 0.35, ease: 'power3.out' });
          gsap.to(dot, { scale: 0.4, duration: 0.25 });
          gsap.to(label, { opacity: 0, duration: 0.2 });
        } else if (state === 'link' || state === 'arrow-left' || state === 'arrow-right') {
          gsap.to(ring, { scale: 1.7, duration: 0.35, ease: 'power3.out' });
          gsap.to(dot, { scale: 0.4, duration: 0.25 });
          gsap.to(label, { opacity: 0, duration: 0.2 });
        } else {
          gsap.to(ring, { scale: 1, borderWidth: 1, duration: 0.35, ease: 'power3.out' });
          gsap.to(dot, { scale: 1, duration: 0.25 });
          gsap.to(label, { opacity: 0, duration: 0.2 });
        }
      };

      const onLeave = () => {
        visible = false;
        gsap.to([dot, ring], { opacity: 0, duration: 0.25 });
      };

      window.addEventListener('pointermove', onMove, { passive: true });
      document.addEventListener('pointerleave', onLeave);

      return () => {
        window.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerleave', onLeave);
        document.documentElement.classList.remove('has-custom-cursor');
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <div aria-hidden="true">
      <span ref={dotRef} className="cursor-dot" />
      <span ref={ringRef} className="cursor-ring">
        <span ref={labelRef} className="cursor-ring__label font-body" />
      </span>
    </div>
  );
}
