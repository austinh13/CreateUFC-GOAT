/**
 * buildEngine.js — turns six stolen tools into a composite rating, a tier, and a
 * simulated career.
 *
 * The whole game funnels through here exactly once, at the moment the sixth slot
 * locks. Everything before this point (spinning, stealing) is choice; everything
 * from here on on is consequence — the build doesn't get to negotiate with the dice
 * a second time.
 */

import { TOOLS, TOOL_WEIGHT, scoreForGrade } from '../data/constants';
import { clamp } from './rng';
import { resolveFight, makeOpponent } from './fightSim';

// ─── Composite rating ────────────────────────────────────────────────────────────
/**
 * Weighted average of the six locked scores, adjusted by two things a flat average
 * can't see: how many tools are genuinely elite, and how bad the worst one is.
 *
 * The floor penalty is the load-bearing part. A build with five S-grades and one
 * D-grade Chin should not score like a balanced build of six A's — real careers end
 * on their weakest tool, not their average one, and R14-style "the weak spot shows
 * up eventually" is the entire narrative payoff of the reveal screen.
 */
// Tuned against the actual fighter pool, not guessed — see the note below. Changing
// the roster's grade spread meaningfully will shift the distribution these produce,
// so a roster change should be re-validated the same way (scripts/_tune2.mjs during
// development; not shipped, but the method is worth repeating).
const ELITE_BONUS   = 0.5;   // per tool scored 92+ (A and above)
const GOOD_BONUS    = 0.2;   // per tool scored 88-91 (A-)
const PENALTY_PIVOT = 90;    // a floor at or above this costs nothing
const PENALTY_RATE  = 0.5;   // cost per point the floor sits below the pivot
// A single weak tool used to be able to out-weigh five elite ones: at the old
// uncapped 0.85 rate, five A's plus one C+ Chin scored a 72 — worse than a
// build of six B+'s. That's the floor penalty doing its job (a real hole should
// cost you) but overshooting it (a build that's mostly S's and A's should still
// *feel* like an S/A build). Capping it means the worst single tool can still
// drop you a full tier, just not erase the other five.
const PENALTY_CAP   = 18;

export const scoreBuild = (locked, rng) => {
  const entries = TOOLS.map(t => locked[t]);
  const scores  = entries.map(e => scoreForGrade(e.grade));
  const weights = TOOLS.map(t => TOOL_WEIGHT[t]);

  const weightedAvg = scores.reduce((s, v, i) => s + v * weights[i], 0)
    / weights.reduce((s, w) => s + w, 0);

  const floor = Math.min(...scores);
  const eliteCount = scores.filter(s => s >= 92).length;
  const goodCount  = scores.filter(s => s >= 88 && s < 92).length;

  /**
   * A continuous cost, not a stepped one. An earlier version used four discrete
   * bands (0 / 2 / 5 / 9 / 14) that undershot the actual weak-tool cost so badly a
   * fully RANDOM build — no player skill at all — scored a median of 88 out of 100,
   * with "Journeyman" and "Cut From the Roster" landing in zero of 20,000 simulated
   * builds and "The GOAT Run" landing in none of 20,000 either. Verified by
   * rerunning the same 20k-build sweep against this version: median drops to a
   * genuine middle-of-the-ladder 75, the bottom two tiers occupy their fair share,
   * and a skilled player (always steals the best still-open grade on offer) lands
   * "Undisputed Champion" or better in roughly a third of runs — good play should
   * pay off often, just not automatically.
   *
   * Re-tuned once more after players reported that a near-elite build (five
   * A-grades, one weaker tool) was landing in the 70s instead of feeling like
   * an A-grade run — the uncapped 0.85 rate let one soft tool erase all five
   * good ones. Lowering the rate to 0.5 and capping the total at 18 keeps the
   * penalty real (a bad Chin still costs a full tier) without letting it
   * outweigh the other five tools entirely.
   */
  const floorPenalty = Math.min(PENALTY_CAP, Math.max(0, PENALTY_PIVOT - floor) * PENALTY_RATE);

  // Career luck: judges, injuries, a bad camp. Same seed always rolls the same
  // number, so a shared build reproduces identically for whoever plays it back.
  const luck = rng.int(0, 100);

  const raw = weightedAvg + eliteCount * ELITE_BONUS + goodCount * GOOD_BONUS
    - floorPenalty + (luck - 50) / 10;
  const composite = clamp(Math.round(raw), 5, 100);

  return { composite, ovr: toOvr(composite), floor, eliteCount, goodCount, floorPenalty, luck, scores };
};

/**
 * `composite` is the number every internal system (tier ladder, win chance,
 * the perfect-run gate) actually runs on — its 5-100 range is deliberately
 * compressed so the floor penalty has room to bite. But shown raw, that same
 * number reads as a school grade: a 79 labeled "Title Challenger" looks like a
 * C+, even though a Title Challenger run is genuinely good. This stretches the
 * *displayed* rating into the range a sports-game OVR is expected to live in
 * (high-80s/90s for anything competitive, floor in the 40s only for a build
 * that actually cratered) without touching the math anything else depends on.
 * Fit as a straight line through two anchors: the Challenger tier floor (79)
 * should read as a clearly-good ~86, and the Journeyman floor (58) should read
 * as an unremarkable ~70.
 */
const toOvr = (composite) => clamp(Math.round(26 + composite * 0.76), 5, 99);

// ─── Tiers ─────────────────────────────────────────────────────────────────────
/**
 * Ordered high to low, plain threshold lookup — composite alone decides the tier,
 * `goat` included. No separate gate on top of the ladder.
 */
/**
 * Thresholds are fitted to the actual composite distribution the fighter pool
 * produces (see the note on `scoreBuild`), not evenly spaced guesses. A random,
 * unskilled build medians at 75 — square in the middle of this ladder, at
 * Contender — and a skilled one (always steal the best still-open grade) medians
 * at 85, deep in Champion territory. That's the intended shape: careless play
 * lands you in the middle of the pack, and paying attention to what you steal is
 * what buys the top of the ladder.
 */
export const TIER_LADDER = [
  { id: 'goat',       min: 95, title: 'The GOAT Run',       wl: [29, 32, 0, 0], belts: 3, defenses: [10, 16],
    story: 'Every tool held. Nobody found the seam, and the judges never got a say.' },
  { id: 'undisputed', min: 90,  title: 'Undisputed Champion', wl: [22, 27, 1, 2], belts: 2, defenses: [5, 9],
    story: 'You didn’t just win the belt — you defended it until people stopped doubting the build.' },
  { id: 'champion',   min: 84,  title: 'UFC Champion',        wl: [18, 22, 3, 4], belts: 1, defenses: [1, 3],
    story: 'Gold, eventually. It took the full six tools working together to get there.' },
  { id: 'challenger', min: 79,  title: 'Title Challenger',    wl: [14, 18, 5, 7], belts: 0, defenses: [0, 0],
    story: 'Good enough to get the shot. Not quite enough to leave with the belt.' },
  { id: 'contender',  min: 73,  title: 'Ranked Contender',    wl: [11, 15, 6, 9], belts: 0, defenses: [0, 0],
    story: 'A real career — ranked, respected, and never quite in title position.' },
  { id: 'gatekeeper', min: 66,  title: 'Division Gatekeeper', wl: [8, 12, 9, 13], belts: 0, defenses: [0, 0],
    story: 'The fight everyone wants before a title run. You told a lot of prospects the truth about themselves.' },
  { id: 'journeyman', min: 62,  title: 'Journeyman',          wl: [5, 9, 10, 15], belts: 0, defenses: [0, 0],
    story: 'You stayed employed on toughness alone. The judges saw more of your build’s gaps than its strengths.' },
  { id: 'bust',       min: 50,   title: 'Cut From the Roster', wl: [2, 5, 6, 10], belts: 0, defenses: [0, 0],
    story: 'The tools never came together. A short, rough run and a release.' },
];

export const resolveTier = ({ composite }) =>
  TIER_LADDER.find(t => composite >= t.min) ?? TIER_LADDER[TIER_LADDER.length - 1];

// ─── Record generation ─────────────────────────────────────────────────────────
const spread = (rng, [lo, hi]) => lo + Math.round(rng.next() * (hi - lo));

const methodSplit = (rng, wins, locked) => {
  const koLean  = scoreForGrade(locked.Power.grade) + scoreForGrade(locked.Striking.grade)
    - scoreForGrade(locked.Chin.grade) * 0.3;
  const subLean = scoreForGrade(locked.Submissions.grade);
  const total = Math.max(1, koLean + subLean + 90);   // 90 = baseline decision weight
  const ko  = Math.round(wins * (koLean / total));
  const sub = Math.round(wins * (subLean / total));
  return { ko: Math.min(wins, ko), sub: Math.min(wins - ko, sub), dec: Math.max(0, wins - ko - sub) };
};

// ─── Narrative ─────────────────────────────────────────────────────────────────
/** The two most and least useful steals, used to write a build-specific summary. */
const bestAndWorst = (locked) => {
  const ranked = TOOLS.map(t => ({ tool: t, ...locked[t], score: scoreForGrade(locked[t].grade) }))
    .sort((a, b) => b.score - a.score);
  return { best: ranked[0], worst: ranked[ranked.length - 1] };
};

const buildLine = (tier, best, worst, floorPenalty) => {
  if (tier.id === 'goat' || tier.id === 'undisputed') {
    return `${best.tool} stolen from ${best.fighter} carried the whole build — nobody in the division had an answer for it.`;
  }
  if (floorPenalty >= 9) {
    return `${worst.tool} — a ${worst.grade} lifted from ${worst.fighter} — was the hole in the build, and every serious opponent eventually found it.`;
  }
  if (floorPenalty > 0) {
    return `${worst.tool} (${worst.grade}, from ${worst.fighter}) was the softest part of the build. It didn’t sink the run, but it capped it.`;
  }
  return `No real weakness in this one. ${best.tool} from ${best.fighter} was the signature, but there was no easy way in anywhere.`;
};

// ─── Spotlight fights ──────────────────────────────────────────────────────────
/**
 * One or two simulated moments from the career. The label always describes what
 * `resolveFight` actually rolled — a "peak moment" fight is stacked in the build's
 * favour but is still a real coin toss with real variance, so it can and does come
 * back a loss. An earlier version hard-labeled it "Signature win" regardless of the
 * roll, which produced a card reading LOSS under a WIN headline the moment the dice
 * disagreed with the label.
 */
const buildSpotlights = (rng, composite, locked, losses, division) => {
  const grades = Object.fromEntries(TOOLS.map(t => [t, scoreForGrade(locked[t].grade)]));
  const player = { composite, grades };
  const spotlights = [];

  const rivalName = ['The #1 Contender', 'The Reigning Champion', 'The Division Gatekeeper'][rng.int(0, 2)];
  const peak = resolveFight(rng, player, makeOpponent(rng, rivalName, composite - rng.int(4, 14)), { rounds: 5 });
  spotlights.push({
    label: peak.won ? 'Peak moment' : 'The upset that stung',
    opponent: rivalName, division, ...peak,
  });

  // A second spotlight only when it adds information: a loss on record that the
  // peak-moment fight didn't already show. Two losses back to back would just be
  // noise, and a peak-moment win doesn't need a second fight to make its point.
  if (losses > 0 && peak.won) {
    const toughOut = 'The Spoiler';
    const oppComposite = clamp(composite - 2 + rng.int(0, 12), 40, 99);
    const gutCheck = resolveFight(rng, player, makeOpponent(rng, toughOut, oppComposite), { rounds: 3 });
    if (!gutCheck.won) {
      spotlights.push({ label: 'The loss that defines the run', opponent: toughOut, division, ...gutCheck });
    }
  }

  return spotlights;
};

// ─── Entry point ────────────────────────────────────────────────────────────────
/**
 * `locked` is `{ [tool]: { grade, fighter, division, era } }` with all six tools
 * filled. Returns everything the result screen renders, computed once and never
 * recomputed — replaying the reveal must not re-roll the outcome.
 */
export const simulateCareer = (locked, division, rng) => {
  const rating = scoreBuild(locked, rng);
  const tier = resolveTier(rating);

  const wins   = spread(rng, [tier.wl[0], tier.wl[1]]);
  const losses = spread(rng, [tier.wl[2], tier.wl[3]]);
  const methods = methodSplit(rng, wins, locked);
  const defenses = tier.belts > 0 ? spread(rng, tier.defenses) : 0;

  const { best, worst } = bestAndWorst(locked);
  const line = buildLine(tier, best, worst, rating.floorPenalty);
  const spotlights = buildSpotlights(rng, rating.composite, locked, losses, division);

  return {
    ...rating,
    tier,
    record: { wins, losses, ko: methods.ko, sub: methods.sub, dec: methods.dec },
    belts: tier.belts,
    defenses,
    line,
    story: tier.story,
    spotlights,
    best, worst,
  };
};
