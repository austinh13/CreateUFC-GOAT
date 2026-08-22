/**
 * Primitives.jsx — the small, reused pieces: a number that counts up, a rating
 * ring, a letter-grade badge, buttons, and chips.
 *
 * These carry most of the app's micro-motion, which is why they live together: it
 * keeps the timing consistent.
 */

import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Icon from './Icon';
import { scoreForGrade, GRADE_LABEL } from '../../data/constants';

// ─── CountUp ───────────────────────────────────────────────────────────────────
/**
 * Animates from the previous value to the next one whenever `value` changes.
 * Uses rAF rather than a CSS transition because the *digits* have to interpolate,
 * not the element's position.
 */
export function CountUp({ value, decimals = 0, duration = 700, prefix = '', suffix = '', className = '' }) {
  const still = useReducedMotion();
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  const raf = useRef(0);

  useEffect(() => {
    if (still || from.current === value) { setShown(value); from.current = value; return; }
    const start = performance.now();
    const a = from.current;
    const b = value;

    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(a + (b - a) * eased);
      if (p < 1) raf.current = requestAnimationFrame(tick);
      else from.current = b;
    };
    raf.current = requestAnimationFrame(tick);

    // rAF does not fire while the tab is hidden. Without this the counter would sit
    // frozen partway — or never start — and because the effect only re-runs when
    // `value` changes, it would still be showing the stale number when the user comes
    // back. The timer guarantees the display converges on the truth either way.
    const settle = setTimeout(() => {
      cancelAnimationFrame(raf.current);
      from.current = b;
      setShown(b);
    }, duration + 120);

    return () => { cancelAnimationFrame(raf.current); clearTimeout(settle); };
  }, [value, duration, still]);

  return (
    <span className={`tnum ${className}`}>
      {prefix}{Number(shown).toFixed(decimals)}{suffix}
    </span>
  );
}

// ─── Ring ──────────────────────────────────────────────────────────────────────
/** A rating dial. SVG so the sweep can be drawn rather than clipped. */
export function OvrRing({ value, max = 99, potential = null, size = 116, stroke = 7, label = 'OVR' }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / max));
  const potPct = potential ? Math.max(0, Math.min(1, potential / max)) : null;

  return (
    <div className="ovrring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
        {potPct != null && (
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke="var(--gold)" strokeOpacity="0.32" strokeWidth={stroke}
            strokeDasharray={`${c * potPct} ${c}`} strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        )}
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="url(#ovrGrad)" strokeWidth={stroke} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          initial={{ strokeDasharray: `0 ${c}` }}
          animate={{ strokeDasharray: `${c * pct} ${c}` }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        />
        <defs>
          <linearGradient id="ovrGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--red)" />
            <stop offset="100%" stopColor="var(--gold)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="ovrring__center">
        <CountUp className="ovrring__num display" value={value} decimals={0} />
        <span className="label">{label}</span>
      </div>
    </div>
  );
}

// ─── Grade badge ───────────────────────────────────────────────────────────────
/**
 * A letter grade (S, A+, B-, …). Colour comes from the first character, so every
 * A-tier reads as "good" and every D-tier reads as "bad" without the player having
 * to learn twelve distinct colours — only five.
 *
 * `dim` renders a `?` instead of the letter — Hard Mode's whole mechanic (PRD-less
 * here, but the same idea): you steal blind and find out what you actually got.
 */
export function GradeBadge({ grade, size = 'md', dim = false }) {
  const tier = grade[0].toLowerCase();
  return (
    <span className={`gradebadge gradebadge--${size} gradebadge--${tier} ${dim ? 'is-dim' : ''}`}>
      {dim ? '?' : grade}
    </span>
  );
}

// ─── Grade badge, with the score behind it ─────────────────────────────────────
/**
 * Same badge as `GradeBadge`, but hoverable/focusable to reveal the number and
 * tier label the letter stands for — e.g. "A+" is 96/99, "All-time elite". The
 * letter is the only thing the player picks by; this is just a way to see what
 * it means without leaving the screen. Skipped entirely in `dim` (Hard Mode)
 * states, where the grade itself is still hidden.
 */
export function GradeInfo({ grade, size = 'md', dim = false }) {
  if (dim) return <GradeBadge grade={grade} size={size} dim />;
  return (
    <span className="gradeinfo" tabIndex={0}>
      <GradeBadge grade={grade} size={size} />
      <span className="gradeinfo__tip" role="tooltip">
        <strong>{scoreForGrade(grade)}</strong>/99 · {GRADE_LABEL[grade] ?? 'Unrated'}
      </span>
    </span>
  );
}

// ─── Buttons ───────────────────────────────────────────────────────────────────
export function Button({ children, variant = 'default', size = 'md', icon, iconRight, full, ...rest }) {
  return (
    <motion.button
      className={`btn btn--${variant} btn--${size} ${full ? 'btn--full' : ''}`}
      whileHover={rest.disabled ? undefined : { y: -1 }}
      whileTap={rest.disabled ? undefined : { scale: 0.985 }}
      transition={{ duration: 0.14 }}
      {...rest}
    >
      {icon && <Icon name={icon} size={size === 'sm' ? 14 : 16} />}
      <span>{children}</span>
      {iconRight && <Icon name={iconRight} size={size === 'sm' ? 14 : 16} />}
    </motion.button>
  );
}

// ─── Chips / pills ─────────────────────────────────────────────────────────────
export function Chip({ children, tone = 'default', icon }) {
  return (
    <span className={`chip chip--${tone}`}>
      {icon && <Icon name={icon} size={12} />}
      {children}
    </span>
  );
}
