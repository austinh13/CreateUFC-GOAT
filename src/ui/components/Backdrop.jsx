/**
 * Backdrop.jsx — the ambient motion graphic behind the whole app.
 *
 * A canvas rather than CSS because the effect is three overlapping systems that
 * have to stay in sync: drifting light pools, a rising ember field, and a slowly
 * rotating octagon wireframe. Doing that in CSS would mean a dozen animated
 * elements compositing on the main thread; one canvas is a single layer.
 *
 * Rules it follows:
 *  - Caps DPR at 2. A 4K display does not need 4× the fill rate for a blurred glow.
 *  - Stops entirely when the tab is hidden, so a career left open overnight is free.
 *  - Under `prefers-reduced-motion` it paints ONE frame and stops. The look survives;
 *    the movement does not.
 */

import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

const POOLS = [
  { x: 0.18, y: 0.12, r: 0.62, c: [229, 20, 46],  a: 0.20, sx: 0.00007, sy: 0.00005 },
  { x: 0.86, y: 0.30, r: 0.52, c: [77, 159, 255], a: 0.11, sx: -0.00005, sy: 0.00008 },
  { x: 0.55, y: 0.92, r: 0.70, c: [245, 185, 58], a: 0.08, sx: 0.00004, sy: -0.00006 },
];

export default function Backdrop({ variant = 'ambient' }) {
  const ref = useRef(null);
  const still = useReducedMotion();

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const hero = variant === 'hero';
    let w = 0, h = 0, dpr = 1, raf = 0, t = 0, running = true;
    let embers = [];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width  = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = hero ? Math.min(90, Math.round((w * h) / 16000)) : Math.min(46, Math.round((w * h) / 34000));
      embers = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.5 + Math.random() * 1.6,
        v: 0.06 + Math.random() * 0.34,
        d: Math.random() * Math.PI * 2,
        o: 0.14 + Math.random() * 0.5,
      }));
    };

    const octagon = (cx, cy, rad, rot) => {
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = rot + (i / 8) * Math.PI * 2 - Math.PI / 8;
        const x = cx + Math.cos(a) * rad;
        const y = cy + Math.sin(a) * rad;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    };

    const frame = () => {
      ctx.clearRect(0, 0, w, h);

      // 1. Light pools — big, soft, and slow enough that you never catch them moving.
      for (const p of POOLS) {
        const cx = (p.x + Math.sin(t * p.sx) * 0.06) * w;
        const cy = (p.y + Math.cos(t * p.sy) * 0.05) * h;
        const rad = p.r * Math.max(w, h) * (hero ? 0.72 : 0.55);
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
        const [r, gr, b] = p.c;
        g.addColorStop(0, `rgba(${r},${gr},${b},${p.a * (hero ? 1.35 : 1)})`);
        g.addColorStop(1, `rgba(${r},${gr},${b},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      // 2. Octagon wireframes — the only literal reference to the sport in the chrome.
      ctx.lineWidth = 1;
      const baseR = Math.min(w, h) * (hero ? 0.42 : 0.34);
      for (let i = 0; i < (hero ? 3 : 2); i++) {
        ctx.strokeStyle = `rgba(255,255,255,${hero ? 0.05 - i * 0.012 : 0.028 - i * 0.008})`;
        octagon(w * (hero ? 0.5 : 0.78), h * (hero ? 0.46 : 0.3), baseR * (1 + i * 0.34), t * 0.00006 * (i % 2 ? -1 : 1));
      }

      // 3. Embers.
      for (const e of embers) {
        e.y -= e.v;
        e.x += Math.sin((e.y + e.d * 100) * 0.004) * 0.22;
        if (e.y < -6) { e.y = h + 6; e.x = Math.random() * w; }
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,${140 + e.r * 40},${90 + e.r * 30},${e.o * (hero ? 0.9 : 0.5)})`;
        ctx.fill();
      }
    };

    const loop = () => {
      if (!running) return;
      t += 16;
      frame();
      raf = requestAnimationFrame(loop);
    };

    const onVisibility = () => {
      running = !document.hidden && !still;
      if (running) loop(); else cancelAnimationFrame(raf);
    };

    resize();
    frame();
    if (!still) loop();

    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [variant, still]);

  return (
    <div className={`backdrop backdrop--${variant}`} aria-hidden="true">
      <canvas ref={ref} className="backdrop__canvas" />
      <div className="backdrop__grain" />
      <div className="backdrop__vignette" />
    </div>
  );
}
