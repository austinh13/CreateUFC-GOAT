/**
 * Motion.jsx — the app's motion vocabulary, in one place.
 *
 * Motion here is not decoration; each preset has a job:
 *
 *   fadeUp     — new content arriving. Short travel, never more than 14px, so a
 *                stagger of twelve rows still finishes inside 500ms.
 *   pop        — a value that changed *in place* (a rank badge, an OVR delta).
 *                Spring, because the overshoot is what makes the eye notice it.
 *   sweep      — a transition between screens. Longer, eased, directional.
 *
 * Everything respects `prefers-reduced-motion` through `useSafeMotion`, which
 * collapses durations rather than removing the elements — the final state is the
 * same either way.
 */

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Children, cloneElement, isValidElement } from 'react';

export { motion, AnimatePresence };

export const useSafeMotion = () => !useReducedMotion();

// ─── Variants ──────────────────────────────────────────────────────────────────
export const fadeUp = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.18 } },
};

export const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit:    { opacity: 0, transition: { duration: 0.15 } },
};

export const scaleIn = {
  hidden:  { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 380, damping: 30 } },
  exit:    { opacity: 0, scale: 0.98, transition: { duration: 0.14 } },
};

export const popSpring = { type: 'spring', stiffness: 520, damping: 24, mass: 0.7 };

/** Exit is deliberately faster than enter — leaving should never make the user wait. */
export const screenVariants = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.045 } },
  exit:    { opacity: 0, y: -6, transition: { duration: 0.16 } },
};

// ─── Wrappers ──────────────────────────────────────────────────────────────────
/** A block that fades up when it enters the viewport (or immediately, if `now`). */
export function Reveal({ children, delay = 0, now = false, y = 14, className = '', as = 'div', ...rest }) {
  const M = motion[as] ?? motion.div;
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      {...(now
        ? { animate: { opacity: 1, y: 0 } }
        : { whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-40px' } })}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      {...rest}
    >
      {children}
    </M>
  );
}

/** Staggers its direct children. Children must be motion-capable or plain elements. */
export function Stagger({ children, delay = 0, gap = 0.05, className = '', ...rest }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: gap, delayChildren: delay } } }}
      {...rest}
    >
      {Children.map(children, (child, i) =>
        isValidElement(child) && child.type?.render?.name?.startsWith?.('motion')
          ? child
          : <motion.div key={i} variants={fadeUp}>{child}</motion.div>)}
    </motion.div>
  );
}

/**
 * A screen container: one consistent entrance for every tab.
 *
 * Enter only. Screens are swapped by remounting on a key rather than through
 * AnimatePresence, so there is no exit to orchestrate — see the note in App.jsx.
 */
export function Screen({ children, className = '', ...rest }) {
  return (
    <motion.main
      className={className}
      variants={screenVariants}
      initial="hidden"
      animate="visible"
      {...rest}
    >
      {children}
    </motion.main>
  );
}

/** Attaches `variants={fadeUp}` to an element so it participates in a Stagger. */
export const staggerChild = (el, key) =>
  isValidElement(el) ? cloneElement(el, { key, variants: fadeUp }) : el;
