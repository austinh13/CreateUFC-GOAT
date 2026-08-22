/**
 * Reel.jsx — the slot-style spinner for "Spin Division" and "Spin Fighter".
 *
 * The outcome is decided the instant the parent calls `spinBoth()` — see the note
 * in `useBuilder.js`. This component only ever plays back a result it's handed; it
 * never decides anything and never gates game logic on its own animation finishing.
 * A pure CSS keyframe drives the blur-cycle look while `spinning` is true, which
 * costs nothing to run and needs no JS animation loop to babysit it.
 */

import { motion } from 'framer-motion';

export default function Reel({ label, spinning, value, decoys = [], tone = 'default' }) {
  return (
    <div className={`reel reel--${tone}`}>
      <span className="label reel__label">{label}</span>
      <div className="reel__window">
        {spinning ? (
          <div className="reel__cycle">
            {decoys.map((d, i) => (
              <span key={i} className="reel__decoy">{d}</span>
            ))}
          </div>
        ) : value ? (
          <motion.div
            className="reel__value"
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 26 }}
          >
            {value}
          </motion.div>
        ) : (
          <span className="reel__placeholder dim">—</span>
        )}
      </div>
    </div>
  );
}
