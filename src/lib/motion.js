import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Flip } from 'gsap/Flip';
import { Observer } from 'gsap/Observer';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';

// All of these ship inside the installed `gsap` package — nothing extra to add.
gsap.registerPlugin(ScrollTrigger, SplitText, Flip, Observer, ScrambleTextPlugin);

/**
 * Shared motion primitives.
 *
 * Every animation registers through `gsap.matchMedia()` with FULL_MOTION, so
 * under reduced motion they simply never run and elements stay in their natural
 * (visible) CSS state. GSAP re-evaluates the query live, so toggling the OS
 * setting takes effect without a reload.
 */
export const FULL_MOTION = '(prefers-reduced-motion: no-preference)';
export const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

// Pointer-precision gate: cursor and magnetic effects are meaningless on touch.
export const FINE_POINTER = '(hover: hover) and (pointer: fine)';
export const FULL_MOTION_FINE = `${FULL_MOTION} and ${FINE_POINTER}`;

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia(REDUCED_MOTION).matches;

export const hasFinePointer = () =>
  typeof window !== 'undefined' && window.matchMedia(FINE_POINTER).matches;

// Single Lenis instance, owned by App. Held here so any component can scroll
// without threading a ref through the tree — and so there is exactly one place
// that knows what to do when Lenis is absent (reduced motion).
let lenis = null;

export const setLenis = (instance) => {
  lenis = instance;
};

export const getLenis = () => lenis;

/**
 * Scroll to a section. Uses Lenis when running, native instant scroll
 * otherwise, so navigation keeps working under reduced motion.
 */
export function scrollToSection(target, { offset = -80, duration } = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;

  if (lenis) {
    lenis.scrollTo(el, duration ? { offset, duration } : { offset });
    return;
  }

  window.scrollTo({
    top: el.getBoundingClientRect().top + window.scrollY + offset,
    behavior: 'auto',
  });
}

/* ── Scroll velocity ──
   One shared signal, sampled once per frame, that drives the kinetic marquee
   and the image skew. Components subscribe instead of each attaching their own
   scroll listener. */
let velocity = 0;
const velocitySubscribers = new Set();

ScrollTrigger.create({
  onUpdate: (self) => {
    // getVelocity() is px/s; normalise to something usable as a multiplier.
    velocity = self.getVelocity() / 1000;
  },
});

// Decay towards 0 so the effect settles when scrolling stops.
gsap.ticker.add(() => {
  velocity = gsap.utils.interpolate(velocity, 0, 0.08);
  if (velocitySubscribers.size) {
    velocitySubscribers.forEach((fn) => fn(velocity));
  }
});

export const onVelocity = (fn) => {
  velocitySubscribers.add(fn);
  return () => velocitySubscribers.delete(fn);
};

export const getVelocity = () => velocity;

/**
 * Magnetic pull for a button/link: the element drifts toward the cursor and
 * springs back on leave. No-op without a fine pointer.
 */
export function makeMagnetic(el, { strength = 0.35, radius = 90 } = {}) {
  if (!el || !hasFinePointer() || prefersReducedMotion()) return () => {};

  const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
  const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });

  const move = (e) => {
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    xTo(gsap.utils.clamp(-radius, radius, dx * strength));
    yTo(gsap.utils.clamp(-radius, radius, dy * strength));
  };

  const reset = () => {
    xTo(0);
    yTo(0);
  };

  el.addEventListener('pointermove', move);
  el.addEventListener('pointerleave', reset);

  return () => {
    el.removeEventListener('pointermove', move);
    el.removeEventListener('pointerleave', reset);
    gsap.set(el, { x: 0, y: 0 });
  };
}
