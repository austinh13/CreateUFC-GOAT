/**
 * rng.js — seeded deterministic random number generation.
 *
 * Every spin, steal, and simulated fight draws from a PRNG whose entire state is
 * one 32-bit integer. That's what makes a build shareable: a build's seed plus the
 * six choices made along the way reproduce the exact same wheel spins for anyone
 * who plays it back, which a share link or a "beat this build" challenge needs.
 */

// ─── mulberry32 ────────────────────────────────────────────────────────────────
// Chosen because its whole state is one uint32, so it round-trips through JSON
// with no special handling. Quality is far beyond what a sports sim needs.
const nextState = (s) => (s + 0x6D2B79F5) >>> 0;

const valueFrom = (s) => {
  let t = s;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/**
 * Create a stateful RNG. Read `rng.state` afterwards to persist where it left off.
 * @param {number} seed - initial 32-bit state
 */
export const createRng = (seed = 1) => {
  let s = seed >>> 0;

  const next = () => {
    s = nextState(s);
    return valueFrom(s);
  };

  return {
    next,
    /** Integer in [min, max] inclusive. */
    int: (min, max) => Math.floor(next() * (max - min + 1)) + min,
    /** Float in [min, max). */
    float: (min, max) => next() * (max - min) + min,
    /** Float in [min, max) rounded to 2dp — matches the precision stats are stored at. */
    float2: (min, max) => parseFloat((next() * (max - min) + min).toFixed(2)),
    /** True with probability p (0..1). */
    chance: (p) => next() < p,
    /** Random element of an array (undefined for an empty array). */
    pick: (arr) => (arr.length ? arr[Math.floor(next() * arr.length)] : undefined),
    /** Fisher-Yates on a copy — never mutates the input. */
    shuffle: (arr) => {
      const out = [...arr];
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
      }
      return out;
    },
    /** Right-skewed roll in [0,1): most draws land low. Higher exponent = more skew. */
    skewed: (exponent = 1.8) => Math.pow(next(), exponent),
    /** Current state — persist this to resume the exact sequence. */
    get state() { return s; },
  };
};

export const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

// ─── String hashing ────────────────────────────────────────────────────────────
/** djb2-xor — turns an arbitrary string into a stable seed component. */
export const hashString = (str) => {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = (h * 33) ^ str.charCodeAt(i);
  return Math.abs(h >>> 0);
};

/** Deterministic sub-RNG derived from a parent seed plus a label. */
export const rngFor = (seed, label) => createRng((seed ^ hashString(label)) >>> 0);
