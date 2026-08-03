/**
 * Shared motion primitives.
 *
 * Every scroll-triggered animation in the app is registered through
 * `gsap.matchMedia()` with the FULL_MOTION query, so when the user asks the OS
 * for reduced motion the animations simply never run and elements stay in their
 * natural (visible) CSS state. GSAP re-evaluates the query live, so toggling the
 * OS setting takes effect without a reload.
 */
export const FULL_MOTION = '(prefers-reduced-motion: no-preference)';
export const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia(REDUCED_MOTION).matches;

// Single Lenis instance, owned by App. Held here so any component can scroll
// without threading a ref through the tree — and so there is exactly one place
// that knows what to do when Lenis is absent (reduced motion).
let lenis = null;

export const setLenis = (instance) => {
  lenis = instance;
};

/**
 * Scroll to a section. Uses Lenis when it is running, native instant scroll
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
