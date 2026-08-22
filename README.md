# CreateUFC-GOAT

**Ultimate Fighter Builder.** You don't train a fighter here — you steal for one.

Six rounds. Six open slots: Striking, Power, Wrestling, Submissions, Cardio, Chin.
Each round you spin a division, spin a real UFC fighter from it, see all six of
their attribute grades, and take exactly one into an open slot on your build. Once
all six are locked, we simulate the career of the Frankenstein fighter you just
assembled — a record, a tier, and the fight that defined the run.

Same genre as the "82-0" build-a-dream-team challenges, aimed at MMA: you don't
control anything about the outcome except which attribute to steal when the wheel
stops.

React + Vite, client-only, no backend, no save file — a build is one linear session,
start to reveal.

> Fan-made. Not affiliated with or endorsed by the UFC. Fighter names are real; every
> grade, the scoring, and every simulated outcome are this project's own fiction, in
> the same spirit as any sports game's player ratings.

---

## Running it

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:5180.

```bash
npm run build
```

---

## The loop

1. **Pick a pool.** Classic (every division), Men's Only, or Women's Only. Toggle
   Hard Mode to hide grades while you're choosing — you steal blind and find out
   what you got after.
2. **Spin.** Division, then fighter, together. Real names, eleven real UFC weight
   classes (women's featherweight is excluded — it's never had enough fighters to
   fill a fair wheel).
3. **Steal one.** See all six of the spun fighter's grades. Lock exactly one into
   whichever of your six slots is still open. Two re-spins are available if a fighter
   doesn't have anything worth taking.
4. **Repeat until all six slots are full.**
5. **See the result.** A composite rating, a tier from Cut From the Roster up through
   Contender, Champion, Undisputed Champion, and the rare GOAT Run, a full W-L record
   with a method breakdown, a receipt of exactly what was stolen from whom, and one or
   two simulated career-defining fights.
6. **Build again**, or change pools and go again from scratch.

---

## Architecture

```
src/
├── data/
│   ├── constants.js   Divisions, the six tools, the twelve-step grade scale, weights
│   └── fighters.js    The pool — ~95 real fighters across 11 divisions, each with
│                       six grades this project assigned
├── engine/
│   ├── rng.js          Seeded PRNG — every spin and every simulated fight is
│   │                    reproducible from a seed
│   ├── fightSim.js      A compact win-chance + finish resolver for the two or three
│   │                    "spotlight" fights the result screen plays back
│   └── buildEngine.js   scoreBuild → resolveTier → simulateCareer. Everything the
│                        result screen shows is decided once, here, the instant the
│                        sixth tool locks
├── ui/
│   ├── useBuilder.js    React state ↔ engine. Also where the "never gate game logic
│   │                    on an animation finishing" rule lives — see below
│   ├── components/      Icon, Motion, Backdrop, Primitives (CountUp, OvrRing,
│   │                    GradeBadge, Button, Chip), Reel (the spinner)
│   └── screens/         StartScreen, BuildScreen, ResultScreen
└── styles/              tokens → base → components → screens
```

### The one rule that matters

**A spin's outcome is decided synchronously, the instant the button is pressed** —
`useBuilder.spinBoth` picks the division and fighter from the seeded RNG immediately.
The visual "spinning" animation afterward is cosmetic playback of an already-known
result, timed with `setTimeout`, never with `requestAnimationFrame` or a
`transitionend` listener.

That distinction is not academic. `requestAnimationFrame` and CSS `transitionend`
callbacks simply stop firing while a tab isn't actively compositing — backgrounded,
minimized, a phone screen that locked mid-spin. A version of this game that decided
the spin's result only when the wheel animation reported "done" would hang on
"Spinning…" forever the moment that happens. (This is not hypothetical: the game that
inspired this one does exactly that, and can be driven into that exact stuck state.)
`setTimeout` keeps firing — throttled, not stopped — under the same conditions, which
is why every timer that drives game state in this codebase is one.

### Two invariants worth knowing before touching the engine

- **A grade never changes meaning.** `GRADE_SCORE` in `constants.js` is the only
  place a letter grade becomes a number, and every calculation reads through it —
  nothing hardcodes what an "A-" is worth a second time.
- **The result screen never rolls anything.** `simulateCareer` runs exactly once,
  from `useBuilder.stealTool`, the moment the sixth slot fills. `ResultScreen.jsx` is
  a pure render of whatever came back — reload-safe by construction, since there's
  nothing left to re-roll.

---

## Balance, and how it was found

The scoring formula was tuned against measurement, not intuition, because the first
version was badly wrong in a way that only showed up under volume: a **fully random**
build — no skill, no strategy, just picking blind — scored a median composite of 88
out of 100. Two of the eight tiers ("Journeyman" and "Cut From the Roster") occurred
in **zero** of 20,000 simulated random builds, and the rare top tier ("The GOAT Run")
occurred in zero as well. The floor-penalty term meant to punish a build's weakest
tool was too weak to matter against the bonus for having several strong ones.

Refit and reverified the same way:

| Strategy | Median composite | Landing tier |
|---|---|---|
| Random (no skill) | 75 | Ranked Contender — the middle of the ladder |
| Greedy (always steal the best still-open grade) | 85 | UFC Champion |

All eight tiers now occur under random play, including the two that couldn't before.
"The GOAT Run" hits roughly 2% of skilled runs — rare enough to feel earned, not so
rare it reads as a dead entry in the tier list.

A second, unrelated bug came out of the same testing pass: a spotlight fight labeled
"Signature win" could actually resolve as a loss, because the win/loss was genuinely
rolled, not guaranteed by the label. The label now reflects whatever `resolveFight`
actually returned instead of asserting an outcome ahead of the roll.
