import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import {
  BufferGeometry,
  BufferAttribute,
  Points,
  ShaderMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  Vector3,
  AdditiveBlending,
  Color,
} from 'three';
import { rasterizeGlyph, glyphToWorld } from '../lib/glyphPoints';

const COUNT = 22000;

// Rasterisation size for the glyph. Big enough that the sampled silhouette has
// no visible stair-stepping, small enough that the pixel scan stays instant.
const GLYPH_PX = 240;
// Weight 700, not 800: Syne widens hard at its heaviest weight (a 240px "P"
// measures 282x154 at 800 versus 159x156 at 700), and the squashed letterform
// stops reading as a P once it is scattered into particles. 700 is also the
// weight the site's own headings use.
const GLYPH_FONT = `700 ${GLYPH_PX}px Syne, sans-serif`;

// Tuning knobs — the letter is denser than the sphere shell it replaced, so
// point size comes down to keep it from reading as a solid blob.
const POINT_SIZE = 20;
const GLYPH_HEIGHT = 2.6;
const GLYPH_DEPTH = 0.42;

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uProgress;
  uniform float uSize;
  uniform vec3  uMouse;
  uniform float uMouseStrength;

  attribute float aScale;
  attribute float aRandom;
  attribute vec3  aAxis;

  varying float vAlpha;
  varying float vMix;

  // Cheap trig-based turbulence. Real simplex noise costs more than this
  // silhouette needs — the shape reads as organic either way.
  vec3 turbulence(vec3 p, float t) {
    float f = 1.35;
    return vec3(
      sin(p.y * f + t * 0.55) + sin(p.z * f * 0.7 - t * 0.4),
      sin(p.z * f + t * 0.45) + sin(p.x * f * 0.8 + t * 0.35),
      sin(p.x * f + t * 0.5)  + sin(p.y * f * 0.6 - t * 0.3)
    );
  }

  mat2 rot(float a) {
    float c = cos(a);
    float s = sin(a);
    return mat2(c, -s, s, c);
  }

  void main() {
    vec3 pos = position;

    // Bounded sway, not a full spin: past ~30° a flat letterform collapses to
    // a line, and past 90° it reads mirrored. This keeps the P legible at all
    // times while still moving in three dimensions.
    pos.xz = rot(sin(uTime * 0.32) * 0.44) * pos.xz;
    pos.yz = rot(sin(uTime * 0.23 + 1.7) * 0.13) * pos.yz;
    pos.y += sin(uTime * 0.5) * 0.07;

    // Kept well below the sphere's old 0.14 — enough to breathe, not enough to
    // smear the counter of the bowl.
    pos += turbulence(pos * 0.6, uTime) * 0.055 * (0.4 + aRandom);

    // Cursor repulsion, falling off with distance
    vec3 toMouse = pos - uMouse;
    float d = length(toMouse);
    float push = smoothstep(1.2, 0.0, d) * uMouseStrength;
    pos += normalize(toMouse + 0.0001) * push * 0.75;

    // Intro: particles converge from a scattered cloud
    pos = mix(pos + aAxis * 6.0, pos, uProgress);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = uSize * aScale * (1.0 / -mvPosition.z);

    vAlpha = uProgress * (0.25 + aRandom * 0.75) * smoothstep(0.0, 0.4, uProgress);
    vMix = clamp(push * 2.2 + aRandom * 0.35, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;

  varying float vAlpha;
  varying float vMix;

  void main() {
    // Soft round sprite without a texture fetch
    float d = length(gl_PointCoord - vec2(0.5));
    float alpha = smoothstep(0.5, 0.05, d) * vAlpha;
    if (alpha < 0.01) discard;

    gl_FragColor = vec4(mix(uColorA, uColorB, vMix), alpha);
  }
`;

export default function HeroScene({ onReady }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    let disposed = false;
    let teardown = null;

    const start = () => {
      const canvas = canvasRef.current;
      const wrap = wrapRef.current;
      if (!canvas || !wrap) return null;

      const raster = rasterizeGlyph('P', GLYPH_FONT, 320);
      if (!raster) return null;

      let renderer;
      try {
        renderer = new WebGLRenderer({
          canvas,
          alpha: true,
          antialias: false,
          powerPreference: 'high-performance',
        });
      } catch {
        // No WebGL context (old GPU, blocklist, headless). The hero is designed
        // to read fine without it, so fail quiet.
        return null;
      }

      const size = () => ({ w: wrap.clientWidth, h: wrap.clientHeight });
      let { w, h } = size();

      renderer.setSize(w, h, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));

      const scene = new Scene();
      const camera = new PerspectiveCamera(45, w / h, 0.1, 100);
      camera.position.set(0, 0, 6.2);

      /* ── Point cloud shaped like the letter ── */
      const positions = glyphToWorld(raster, COUNT, {
        height: GLYPH_HEIGHT,
        depth: GLYPH_DEPTH,
      });
      const axes = new Float32Array(COUNT * 3);
      const scales = new Float32Array(COUNT);
      const randoms = new Float32Array(COUNT);

      for (let i = 0; i < COUNT; i++) {
        // Random unit vector — the intro pulls the letter in from every
        // direction instead of exploding off a sphere normal.
        const theta = 2 * Math.PI * Math.random();
        const phi = Math.acos(2 * Math.random() - 1);
        axes.set(
          [
            Math.sin(phi) * Math.cos(theta),
            Math.sin(phi) * Math.sin(theta),
            Math.cos(phi),
          ],
          i * 3
        );
        scales[i] = 0.5 + Math.random() * 1.6;
        randoms[i] = Math.random();
      }

      const geometry = new BufferGeometry();
      geometry.setAttribute('position', new BufferAttribute(positions, 3));
      geometry.setAttribute('aAxis', new BufferAttribute(axes, 3));
      geometry.setAttribute('aScale', new BufferAttribute(scales, 1));
      geometry.setAttribute('aRandom', new BufferAttribute(randoms, 1));

      const material = new ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        uniforms: {
          uTime: { value: 0 },
          uProgress: { value: 0 },
          uSize: { value: POINT_SIZE * renderer.getPixelRatio() },
          uMouse: { value: new Vector3(99, 99, 99) },
          uMouseStrength: { value: 0 },
          uColorA: { value: new Color('#F5F5F0') },
          uColorB: { value: new Color('#53A3E2') },
        },
      });

      const points = new Points(geometry, material);
      scene.add(points);

      /* ── Cursor tracking, projected onto the object's plane ──
         Measured off the CANVAS, not the wrapper: the canvas carries a
         translateX(26%) in CSS, so a wrapper-relative rect put the repulsion a
         quarter of the viewport away from where the letter actually appears. */
      const mouseTarget = new Vector3(99, 99, 99);
      const onPointerMove = (e) => {
        const r = canvas.getBoundingClientRect();
        if (!r.width || !r.height) return;

        const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
        const ny = -((e.clientY - r.top) / r.height) * 2 + 1;

        // The wrapper is pointer-events:none, so no pointerleave ever fires on
        // it — fall off by distance instead of listening for an event that
        // cannot arrive.
        const inside = Math.abs(nx) <= 1.15 && Math.abs(ny) <= 1.15;

        if (inside) {
          const vec = new Vector3(nx, ny, 0.5).unproject(camera);
          const dir = vec.sub(camera.position).normalize();
          const dist = -camera.position.z / dir.z;
          mouseTarget.copy(camera.position).add(dir.multiplyScalar(dist));
        }

        gsap.to(material.uniforms.uMouseStrength, {
          value: inside ? 1 : 0,
          duration: inside ? 0.4 : 0.8,
          overwrite: true,
        });
      };

      window.addEventListener('pointermove', onPointerMove, { passive: true });

      /* ── Render loop on GSAP's ticker, so it stays frame-synced with Lenis ── */
      let running = true;
      const tick = (time) => {
        if (!running) return;
        material.uniforms.uTime.value = time;
        material.uniforms.uMouse.value.lerp(mouseTarget, 0.12);
        renderer.render(scene, camera);
      };
      gsap.ticker.add(tick);

      // Don't burn GPU on a hero nobody is looking at
      const io = new IntersectionObserver(
        ([entry]) => {
          running = entry.isIntersecting;
        },
        { threshold: 0 }
      );
      io.observe(wrap);

      const onVisibility = () => {
        running = !document.hidden && running;
      };
      document.addEventListener('visibilitychange', onVisibility);

      /* ── Resize ── */
      const ro = new ResizeObserver(() => {
        const next = size();
        if (!next.w || !next.h) return;
        w = next.w;
        h = next.h;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
        material.uniforms.uSize.value = POINT_SIZE * renderer.getPixelRatio();
      });
      ro.observe(wrap);

      /* ── Intro ── */
      gsap.to(material.uniforms.uProgress, {
        value: 1,
        duration: 2.6,
        ease: 'expo.out',
        delay: 0.2,
        onStart: () => onReady?.(),
      });

      return () => {
        running = false;
        gsap.ticker.remove(tick);
        gsap.killTweensOf(material.uniforms.uProgress);
        gsap.killTweensOf(material.uniforms.uMouseStrength);
        window.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('visibilitychange', onVisibility);
        io.disconnect();
        ro.disconnect();
        geometry.dispose();
        material.dispose();
        renderer.dispose();
      };
    };

    // Syne has to be resolved before rasterising, or the glyph falls back to
    // the system sans and the silhouette is the wrong letterform. In practice
    // the Preloader already awaited document.fonts.ready, so this settles
    // immediately — it only matters on a hard reload into a warm cache.
    document.fonts
      .load(GLYPH_FONT)
      .catch(() => {})
      .then(() => {
        if (disposed) return;
        teardown = start();
      });

    return () => {
      disposed = true;
      teardown?.();
    };
  }, [onReady]);

  return (
    <div ref={wrapRef} className="hero-scene" aria-hidden="true">
      <canvas ref={canvasRef} className="hero-scene__canvas" />
    </div>
  );
}
