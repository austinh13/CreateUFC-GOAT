/**
 * simulate.mjs — runs the real build loop N times against the live fighter pool
 * and reports the tier/composite distribution, so a roster or scoring change can
 * be sanity-checked without playing hundreds of rounds by hand.
 *
 * Uses Vite's SSR module loader so the extensionless imports in src/ resolve
 * exactly like they do in the real app, instead of hand-rolling module resolution.
 *
 * Usage:
 *   npm run simulate                    # 500 runs, greedy strategy
 *   npm run simulate -- 1000            # 1000 runs, greedy strategy
 *   npm run simulate -- 500 careless    # 500 runs, careless strategy
 *
 * Strategies:
 *   greedy   — every spin, steals whichever open tool the spun fighter grades
 *              highest at (mirrors the game's own definition of "skilled play").
 *   careless — every spin, steals into the first still-open tool slot, no
 *              optimization (mirrors "random/unskilled play").
 */
import { createServer } from 'vite';

const [, , countArg, strategyArg] = process.argv;
const N = Number.parseInt(countArg, 10) || 500;
const strategy = strategyArg === 'careless' ? 'careless' : 'greedy';

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });

const { createRng } = await server.ssrLoadModule('/src/engine/rng.js');
const { simulateCareer } = await server.ssrLoadModule('/src/engine/buildEngine.js');
const { poolFor } = await server.ssrLoadModule('/src/data/fighters.js');
const { TOOLS, POOLS, scoreForGrade } = await server.ssrLoadModule('/src/data/constants.js');

function runOnce(seed) {
  const rng = createRng(seed);
  const pool = POOLS.classic;
  const fighterPool = poolFor(pool.id, pool.divisions);
  const divisions = Object.keys(fighterPool);

  let openTools = [...TOOLS];
  const locked = {};
  let firstDivision = null;

  for (let round = 0; round < TOOLS.length; round++) {
    const division = rng.pick(divisions);
    if (!firstDivision) firstDivision = division;
    const roster = fighterPool[division];
    const fighter = rng.pick(roster);

    const tool = strategy === 'greedy'
      ? openTools.reduce((best, t) =>
          scoreForGrade(fighter.grades[t]) > scoreForGrade(fighter.grades[best]) ? t : best
        , openTools[0])
      : openTools[0];

    locked[tool] = { grade: fighter.grades[tool], fighter: fighter.name, division, era: fighter.era };
    openTools = openTools.filter(t => t !== tool);
  }

  return simulateCareer(locked, firstDivision, rng);
}

const results = [];
for (let i = 0; i < N; i++) {
  // Fresh seed per invocation (clock + a per-run offset), same pattern the real
  // game uses in useBuilder.js — so each `npm run simulate` is a new sample
  // instead of replaying the same fixed sequence.
  const seed = ((Date.now() >>> 0) + i * 2654435761) >>> 0;
  results.push(runOnce(seed));
}

const composites = results.map(r => r.composite).sort((a, b) => a - b);
const ovrs = results.map(r => r.ovr);
const median = arr => arr[Math.floor(arr.length / 2)];
const mean = arr => arr.reduce((s, v) => s + v, 0) / arr.length;

const tierCounts = {};
for (const r of results) tierCounts[r.tier.id] = (tierCounts[r.tier.id] || 0) + 1;

const label = strategy === 'greedy'
  ? 'GREEDY (always steal the best open grade offered)'
  : 'CARELESS (steal first open slot, no optimization)';

console.log(`\n=== ${label} (n=${N}) ===`);
console.log(`Composite: median=${median(composites)} mean=${mean(composites).toFixed(1)} min=${composites[0]} max=${composites[composites.length - 1]}`);
console.log(`OVR: mean=${mean(ovrs).toFixed(1)}`);
console.log('Tier distribution (highest to lowest):');
const order = ['goat', 'undisputed', 'champion', 'challenger', 'contender', 'gatekeeper', 'journeyman', 'bust'];
for (const id of order) {
  const c = tierCounts[id] || 0;
  const pct = (c / N * 100).toFixed(1);
  const bar = '#'.repeat(Math.round(c / N * 50));
  console.log(`  ${id.padEnd(11)} ${String(c).padStart(3)} (${pct.padStart(5)}%) ${bar}`);
}

const titleOrBetter = (tierCounts.goat || 0) + (tierCounts.undisputed || 0) + (tierCounts.champion || 0);
console.log(`Champion-or-better rate: ${(titleOrBetter / N * 100).toFixed(1)}%`);
const bottomTwo = (tierCounts.journeyman || 0) + (tierCounts.bust || 0);
console.log(`Journeyman-or-worse rate: ${(bottomTwo / N * 100).toFixed(1)}%`);

await server.close();
