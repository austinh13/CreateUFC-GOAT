/**
 * useBuilder.js — the one place React state meets the build engine.
 *
 * A hard rule this hook exists to enforce: **the result of a spin is decided the
 * instant the button is pressed**, synchronously, from the seeded RNG. The spinning
 * animation the player sees afterward is cosmetic playback of an already-known
 * outcome, timed with `setTimeout`.
 *
 * That ordering matters for a reason beyond style. A version of this that decided
 * the outcome only when a CSS animation reported "done" (a `transitionend` listener,
 * or a `requestAnimationFrame` loop watching wheel position) would hang forever the
 * moment the tab isn't actively compositing — backgrounded, minimized, a phone
 * screen that locked mid-spin — because neither of those fire while a page is
 * hidden. `setTimeout` still fires (throttled, not stopped) under the same
 * conditions, which is why every timer in this file is one.
 */

import { useCallback, useMemo, useRef, useState } from 'react';
import { createRng } from '../engine/rng';
import { TOOLS, POOLS, REROLL_TOKENS, HARD_REROLL_TOKENS } from '../data/constants';
import { poolFor } from '../data/fighters';
import { simulateCareer } from '../engine/buildEngine';

const SPIN_MS = 1100;   // cosmetic only — see the file header

export default function useBuilder() {
  const [phase, setPhase]   = useState('start');   // start | build | reveal
  const [poolId, setPoolId] = useState('classic');
  const [hardMode, setHard] = useState(false);
  const [seed, setSeed]     = useState(() => Date.now() >>> 0);
  const rngRef = useRef(null);

  const [round, setRound]     = useState(0);         // tools locked so far, 0-6
  const [locked, setLocked]   = useState({});         // { [tool]: {grade, fighter, division, era} }
  const [rerolls, setRerolls] = useState(REROLL_TOKENS);
  const [spin, setSpin]       = useState(null);       // { division, fighter, spinning }
  const [result, setResult]   = useState(null);       // simulateCareer() output
  const spinTimer = useRef(0);

  const pool = POOLS[poolId] ?? POOLS.classic;
  const fighterPool = useMemo(() => poolFor(poolId, pool.divisions), [poolId, pool.divisions]);
  const openTools = useMemo(() => TOOLS.filter(t => !locked[t]), [locked]);

  // ── Lifecycle ───────────────────────────────────────────────────────────────
  const selectPool = useCallback((id) => setPoolId(id), []);
  const toggleHardMode = useCallback(() => setHard(h => !h), []);

  const beginBuild = useCallback(() => {
    const s = Date.now() >>> 0;
    setSeed(s);
    rngRef.current = createRng(s);
    setRound(0);
    setLocked({});
    setRerolls(hardMode ? HARD_REROLL_TOKENS : REROLL_TOKENS);
    setSpin(null);
    setResult(null);
    setPhase('build');
  }, [hardMode]);

  const restart = useCallback(() => setPhase('start'), []);
  const rebuildSameMode = useCallback(() => beginBuild(), [beginBuild]);

  // ── Spinning ────────────────────────────────────────────────────────────────
  /**
   * Spin division + fighter together. The pick happens now, synchronously; `spinning`
   * just tells the wheel components to run their reveal animation before the numbers
   * are shown to the player.
   */
  const spinBoth = useCallback(() => {
    if (!rngRef.current || spin?.spinning) return;
    const rng = rngRef.current;

    const divisions = Object.keys(fighterPool);
    const division = rng.pick(divisions);
    const roster = fighterPool[division];
    const fighter = rng.pick(roster);

    clearTimeout(spinTimer.current);
    setSpin({ division, fighter, spinning: true });
    spinTimer.current = setTimeout(() => {
      setSpin(s => (s ? { ...s, spinning: false } : s));
    }, SPIN_MS);
  }, [fighterPool, spin?.spinning]);

  /** Re-roll the current spin before locking it in. Costs one token. */
  const reroll = useCallback(() => {
    if (!spin || spin.spinning || rerolls <= 0) return;
    setRerolls(r => r - 1);
    spinBoth();
  }, [spin, rerolls, spinBoth]);

  /** Lock one of the spun fighter's grades into an open slot. Advances the round. */
  const stealTool = useCallback((tool) => {
    if (!spin || spin.spinning || locked[tool]) return;
    const { fighter, division } = spin;

    const next = {
      ...locked,
      [tool]: { grade: fighter.grades[tool], fighter: fighter.name, division, era: fighter.era },
    };
    setLocked(next);
    setSpin(null);

    const filled = Object.keys(next).length;
    setRound(filled);

    if (filled >= TOOLS.length) {
      const rng = rngRef.current;
      const career = simulateCareer(next, division, rng);
      setResult(career);
      setPhase('reveal');
    }
  }, [spin, locked]);

  return {
    phase, poolId, hardMode, pool, fighterPool, seed,
    round, locked, openTools, rerolls, spin, result,
    selectPool, toggleHardMode, beginBuild, restart, rebuildSameMode,
    spinBoth, reroll, stealTool,
  };
}
