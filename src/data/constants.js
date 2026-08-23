/**
 * constants.js — divisions and the six tools every build is assembled from.
 *
 * The game has exactly one attribute model: six "tools" — Striking, Power,
 * Wrestling, Submissions, Cardio, Chin — graded on a twelve-step letter scale.
 * There are no sub-stats. A build is six (tool, grade, source fighter) triples,
 * one stolen per round, and nothing else.
 */

// ─── Divisions ─────────────────────────────────────────────────────────────────
// Real UFC weight classes. Women's Featherweight is omitted deliberately — the
// division has never had enough active fighters to fill a fair spin pool, and an
// empty or single-fighter wheel isn't a real choice.
export const DIVISIONS = {
  men: [
    "Men's Flyweight", "Men's Bantamweight", "Men's Featherweight", "Men's Lightweight",
    "Men's Welterweight", "Men's Middleweight", "Men's Light Heavyweight", "Men's Heavyweight",
  ],
  women: [
    "Women's Strawweight", "Women's Flyweight", "Women's Bantamweight",
  ],
};

export const ALL_DIVISIONS = [...DIVISIONS.men, ...DIVISIONS.women];

export const POOLS = {
  classic: { id: 'classic', label: 'Classic', sub: 'Every division', divisions: ALL_DIVISIONS },
  men:     { id: 'men',     label: "Men's Only",   sub: "Men's divisions", divisions: DIVISIONS.men },
  women:   { id: 'women',   label: "Women's Only", sub: "Women's divisions", divisions: DIVISIONS.women },
};

// ─── Tools ─────────────────────────────────────────────────────────────────────
// Order matters for nothing mechanical, but it's the order a fresh build shows its
// open slots in, so it's chosen to read like a scouting report: offense first,
// grappling, the engine, the jaw last.
export const TOOLS = ['Striking', 'Power', 'Wrestling', 'Submissions', 'Cardio', 'Chin'];

export const TOOL_META = {
  Striking:    { icon: 'flame',   color: 'var(--cat-striking)',   blurb: 'Volume, technique, and craft on the feet.' },
  Power:       { icon: 'sparkle', color: 'var(--cat-physical)',   blurb: 'One-shot fight-ending force.' },
  Wrestling:   { icon: 'swords',  color: 'var(--cat-grappling)',  blurb: 'Takedowns, control, and the ground game.' },
  Submissions: { icon: 'shield',  color: 'var(--cat-submission)', blurb: 'Finishing ability from any position.' },
  Cardio:      { icon: 'pulse',   color: 'var(--cat-fightIQ)',    blurb: 'Output that holds up across five rounds.' },
  Chin:        { icon: 'skull',   color: 'var(--cat-striking)',   blurb: 'What it takes to put this fighter away.' },
};

// ─── Grade scale ────────────────────────────────────────────────────────────────
// Twelve steps, S at the top. Converted to a 0-100 score for every calculation;
// the letters are what the player sees, the numbers are what the sim runs on.
export const GRADES = ['S', 'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D'];

export const GRADE_SCORE = {
  S: 99, 'A+': 95, A: 93, 'A-': 90, 'B+': 86, B: 80, 'B-': 76,
  'C+': 69, C: 63, 'C-': 57, 'D+': 50, D: 42,
};

export const GRADE_TIERS = [
  { grade: 'S',  label: 'Once in a generation', gold: true },
  { grade: 'A+', label: 'All-time elite' },
  { grade: 'A',  label: 'Great' },
  { grade: 'A-', label: 'Very good' },
  { grade: 'B+', label: 'Solid' },
  { grade: 'B',  label: 'Average pro' },
  { grade: 'B-', label: 'Below average' },
  { grade: 'C+', label: 'Exploitable' },
  { grade: 'C',  label: 'Weak' },
  { grade: 'C-', label: 'A real liability' },
  { grade: 'D+', label: 'Serious hole' },
  { grade: 'D',  label: 'Glaring weakness' },
];

export const GRADE_LABEL = Object.fromEntries(GRADE_TIERS.map(t => [t.grade, t.label]));

export const scoreForGrade = (grade) => GRADE_SCORE[grade] ?? 60;

// A weak tool costs more than a strong one gains — a build lives or dies on its
// floor, not its ceiling, which is the whole tension of choosing what to steal.
export const TOOL_WEIGHT = {
  Striking: 1.1, Chin: 1.1, Power: 1.1, Wrestling: 1.1, Submissions: 1, Cardio: 1,
};

export const ROUNDS = TOOLS.length;
export const REROLL_TOKENS = 2;
// Hard Mode already strips the grade preview (steal blind); cutting the
// re-spin budget too means a bad blind steal can't just be shrugged off the
// way it can in normal mode.
export const HARD_REROLL_TOKENS = 1;

export const FIGHT_VENUES = [
  'UFC Apex, Las Vegas', 'T-Mobile Arena, Las Vegas', 'Madison Square Garden, New York',
  'Etihad Arena, Abu Dhabi', 'O2 Arena, London', 'Rogers Arena, Vancouver',
  'Crypto.com Arena, Los Angeles', 'Kaseya Center, Miami', 'Accor Arena, Paris',
];
