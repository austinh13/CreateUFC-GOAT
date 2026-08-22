/**
 * fightSim.js — a compact resolver for the two or three "spotlight" fights the
 * result screen plays back.
 *
 * This is deliberately not a full round-by-round engine. The build screen is the
 * whole point of this game; the payoff only needs to sell one or two moments of a
 * simulated career, not replay it fight by fight. Everything here runs on a single
 * composite score per fighter (0-100) plus the raw tool grades, which is all a
 * six-slot build has to offer.
 */

import { clamp } from './rng';

/** Logistic win chance from two composite ratings — same shape as a chess Elo curve. */
export const winChance = (a, b) => 1 / (1 + Math.pow(10, (b - a) / 14));

/**
 * Resolve one fight. `a` is always the player's build; `b` is the opponent.
 * Both are `{ composite, grades }`. Returns the outcome from the PLAYER's side.
 */
export const resolveFight = (rng, a, b, { rounds = 3 } = {}) => {
  const chance = winChance(a.composite, b.composite);
  const won = rng.next() < chance;

  const winner = won ? a : b;
  const loser  = won ? b : a;
  const margin = Math.abs(chance - 0.5) * 2;   // 0 = coinflip, 1 = mismatch

  // Finish odds scale with the margin and with the winner's finishing tools against
  // the loser's defensive ones. A striker with a bad chin opponent finishes more; a
  // grappler against a weak Submissions score finishes more.
  const koLean  = ((winner.grades.Power + winner.grades.Striking) / 2 - loser.grades.Chin) / 40;
  const subLean = (winner.grades.Submissions - loser.grades.Submissions) / 45;
  const finishChance = clamp(0.18 + margin * 0.35 + Math.max(koLean, 0) * 0.4 + Math.max(subLean, 0) * 0.3, 0.08, 0.85);

  const isFinish = rng.next() < finishChance;
  const method = !isFinish ? 'Decision' : koLean >= subLean ? 'KO/TKO' : 'Submission';
  const round  = isFinish ? rng.int(1, rounds) : rounds;

  // Deliberately not returning `opponent` here: the caller already has `b` and
  // knows it by a string name, not this synthetic profile object. Spreading this
  // result into a spotlight record once shadowed that name with the profile object
  // itself — same key, opposite type — and crashed React trying to render it.
  return { won, method, round, chance };
};

/** A synthetic opponent scaled to a narrative moment, given the player's own level. */
export const makeOpponent = (rng, name, targetComposite, style = {}) => {
  const grades = {
    Striking: 60, Power: 60, Wrestling: 60, Submissions: 60, Cardio: 60, Chin: 60,
    ...style,
  };
  // Nudge the flat baseline toward the target composite so `winChance` reflects it.
  const base = Object.values(grades).reduce((s, v) => s + v, 0) / 6;
  const shift = targetComposite - base;
  for (const k of Object.keys(grades)) grades[k] = clamp(Math.round(grades[k] + shift), 30, 99);
  return { name, composite: targetComposite, grades };
};
