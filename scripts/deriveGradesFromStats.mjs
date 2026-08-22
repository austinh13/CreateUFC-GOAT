/**
 * deriveGradesFromStats.mjs — one-off, offline experiment: what would each roster
 * fighter's grades look like if they came from real UFCStats.com career-average
 * numbers instead of the hand-authored calls in src/data/fighters.js?
 *
 * NOT wired into the game. Run it, read the report, decide whether any of this is
 * worth adopting. Nothing here writes back to fighters.js.
 *
 * Data source: scripts/data/ufc_fighters_raw.csv — a public scrape of UFCStats.com
 * career-average pages (SLpM, Str Acc, SApM, Str Def, TD Avg, TD Acc, TD Def,
 * Sub Avg, W/L/D), pulled from github.com/KgKevin0/UFC-Stats.
 *
 * What's real and what's a guess:
 *   Striking, Wrestling, Submissions — built directly from stats UFCStats actually
 *   tracks for exactly that skill (volume + accuracy + defense for striking,
 *   takedown volume + accuracy + defense for wrestling, submission attempts/15min
 *   for submissions). These are the closest thing to "real-stat-derived grades."
 *
 *   Cardio — no such stat exists. Approximated from sustained output (SLpM) and
 *   durability (Str Def) as a stand-in for "keeps working across five rounds."
 *   Flagged as a proxy in the report, not presented as equivalent to the other three.
 *
 *   Power, Chin — UFCStats does not track punching power or chin durability in any
 *   form (no knockdown counts, no win-method breakdown in this dataset). There is no
 *   honest way to compute these from what's here, so the script leaves them
 *   untouched and reports the existing hand-authored grade instead of fabricating one.
 *
 * Usage:
 *   node scripts/deriveGradesFromStats.mjs                 → prints a table to stdout
 *   node scripts/deriveGradesFromStats.mjs --json out.json → also writes full detail
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { FIGHTER_POOL } from '../src/data/fighters.js';
import { GRADE_SCORE } from '../src/data/constants.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_PATH = path.join(__dirname, 'data/ufc_fighters_raw.csv');

// ─── CSV parsing ─────────────────────────────────────────────────────────────
// Hand-rolled because the only tricky field (Height, e.g. `5' 11"`) is
// double-quoted with an escaped `""` — not worth pulling in a dependency for.
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') { inQuotes = false; }
      else field += c;
    } else if (c === '"') { inQuotes = true; }
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c === '\r') { /* skip */ }
    else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  const header = rows[0];
  return rows.slice(1).filter(r => r.length === header.length).map(r =>
    Object.fromEntries(header.map((h, i) => [h, r[i]])));
}

// ─── Name matching ───────────────────────────────────────────────────────────
const normalize = (s) => s
  .normalize('NFD').replace(/[̀-ͯ]/g, '')  // strip accents
  .replace(/[’'.\-]/g, ' ')                          // punctuation -> space
  .replace(/\s+/g, ' ')
  .trim()
  .toLowerCase();

function buildCsvIndex(csvRows) {
  const byName = new Map();       // "first last" -> row
  const bySquashed = new Map();   // spaces stripped, for split-name mismatches
  for (const r of csvRows) {
    const full = normalize(`${r['First Name']} ${r['Last Name']}`);
    if (!byName.has(full)) byName.set(full, r);
    const squashed = full.replace(/\s+/g, '');
    if (!bySquashed.has(squashed)) bySquashed.set(squashed, r);
  }
  return { byName, bySquashed };
}

/**
 * Exact match first, then two fallbacks for the handful of cases where
 * UFCStats and this roster disagree on how a name splits:
 *   - space-insensitive ("Su Mudaerji" vs CSV's single-token "Sumudaerji")
 *   - prefix ("Michelle Waterson" vs CSV's married name "Waterson-Gomez")
 */
function findRow(name, { byName, bySquashed }) {
  const full = normalize(name);
  if (byName.has(full)) return byName.get(full);

  const squashed = full.replace(/\s+/g, '');
  if (bySquashed.has(squashed)) return bySquashed.get(squashed);

  for (const [key, row] of byName) {
    if (key.startsWith(full + ' ') || full.startsWith(key + ' ')) return row;
  }
  return null;
}

// ─── Stat -> 0-100 score ───────────────────────────────────────────────────────
// Min-max against this roster's own p5-p97 range (computed below, once, from the
// matched rows), not arbitrary fixed caps. The roster is already a curated "worth
// stealing from" pool spanning champions down to journeymen (see fighters.js's own
// header comment), so scaling against its real spread — rather than a guessed
// "elite" ceiling — is what actually produces a letter-grade spread instead of
// flattening everyone into the bottom of the scale, which a fixed high ceiling did
// on the first pass (e.g. Demetrious Johnson's 0.5 SubAvg, genuinely elite for a
// flyweight, scored a D against a guessed 1.8 ceiling).
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const percentile = (sorted, p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))];

function buildRanges(rows) {
  const ranges = {};
  for (const key of ['SLpM', 'Str Acc (%)', 'Str Def (%)', 'TD Avg', 'TD Acc (%)', 'TD Def (%)', 'Sub Avg']) {
    const vals = rows.map(r => parseFloat(r[key])).filter(x => !isNaN(x)).sort((a, b) => a - b);
    ranges[key] = { lo: percentile(vals, 0.05), hi: percentile(vals, 0.97) };
  }
  return ranges;
}

// Score band matches GRADE_SCORE's own span (D=42 .. S=99), not a bare 0-100.
// A percentile rank of 0.5 should land on "average pro" (B, 79) the way the grade
// scale itself defines average — not on 50, which is D+/C- territory on that
// scale. Mapping onto 0-100 instead of GRADE_SCORE's real span was the first
// miscalibration: it grade-deflated the whole roster because the median fighter
// landed near the bottom of the letter scale instead of the middle.
const [GRADE_LO, GRADE_HI] = [Math.min(...Object.values(GRADE_SCORE)), Math.max(...Object.values(GRADE_SCORE))];
const scale = (value, key, ranges) => {
  const { lo, hi } = ranges[key];
  return GRADE_LO + clamp01((value - lo) / (hi - lo)) * (GRADE_HI - GRADE_LO);
};

function strikingScore(r, ranges) {
  const slpm = parseFloat(r['SLpM']) || 0;
  const acc = parseFloat(r['Str Acc (%)']) || 0;
  const def = parseFloat(r['Str Def (%)']) || 0;
  return 0.5 * scale(slpm, 'SLpM', ranges) + 0.3 * scale(acc, 'Str Acc (%)', ranges) + 0.2 * scale(def, 'Str Def (%)', ranges);
}

function wrestlingScore(r, ranges) {
  const tdAvg = parseFloat(r['TD Avg']) || 0;
  const tdAcc = parseFloat(r['TD Acc (%)']) || 0;
  const tdDef = parseFloat(r['TD Def (%)']) || 0;
  return 0.5 * scale(tdAvg, 'TD Avg', ranges) + 0.3 * scale(tdAcc, 'TD Acc (%)', ranges) + 0.2 * scale(tdDef, 'TD Def (%)', ranges);
}

function submissionsScore(r, ranges) {
  const subAvg = parseFloat(r['Sub Avg']) || 0;
  return scale(subAvg, 'Sub Avg', ranges);
}

// Proxy, not a real tracked stat — see file header.
function cardioProxyScore(r, ranges) {
  const slpm = parseFloat(r['SLpM']) || 0;
  const def = parseFloat(r['Str Def (%)']) || 0;
  return 0.6 * scale(slpm, 'SLpM', ranges) + 0.4 * scale(def, 'Str Def (%)', ranges);
}

const gradeForScore = (score) => {
  let best = null, bestDiff = Infinity;
  for (const [grade, gscore] of Object.entries(GRADE_SCORE)) {
    const diff = Math.abs(gscore - score);
    if (diff < bestDiff) { best = grade; bestDiff = diff; }
  }
  return best;
};

// ─── Run ─────────────────────────────────────────────────────────────────────
const csvText = readFileSync(CSV_PATH, 'utf8');
const csvRows = parseCsv(csvText);
const csvIndex = buildCsvIndex(csvRows);

// First pass: match every roster fighter to a CSV row (dedupe Jon Jones, who's
// listed in both Light Heavyweight and Heavyweight).
const matched = [];
const unmatched = [];
const seen = new Set();

for (const [division, fighters] of Object.entries(FIGHTER_POOL)) {
  for (const f of fighters) {
    const key = normalize(f.name);
    if (seen.has(key)) continue;
    seen.add(key);

    const row = findRow(f.name, csvIndex);
    if (!row) { unmatched.push(f.name); continue; }
    matched.push({ name: f.name, division, current: f.grades, row });
  }
}

// Ranges are built from the matched roster itself, so scoring reflects this pool's
// actual spread rather than a guessed absolute scale — see the note above `scale`.
const ranges = buildRanges(matched.map(m => m.row));

const results = matched.map(({ name, division, current, row }) => ({
  name,
  division,
  current,
  computed: {
    Striking: gradeForScore(strikingScore(row, ranges)),
    Wrestling: gradeForScore(wrestlingScore(row, ranges)),
    Submissions: gradeForScore(submissionsScore(row, ranges)),
    Cardio: gradeForScore(cardioProxyScore(row, ranges)),
    Power: null,   // not derivable from this dataset — see file header
    Chin: null,
  },
  rawStats: {
    SLpM: row['SLpM'], StrAcc: row['Str Acc (%)'], StrDef: row['Str Def (%)'],
    TDAvg: row['TD Avg'], TDAcc: row['TD Acc (%)'], TDDef: row['TD Def (%)'],
    SubAvg: row['Sub Avg'], record: `${row['W']}-${row['L']}-${row['D']}`,
  },
}));

// ─── Report ──────────────────────────────────────────────────────────────────
const col = (s, w) => String(s).padEnd(w);
console.log(
  col('FIGHTER', 24) + col('TOOL', 26) + col('CURRENT', 10) + col('COMPUTED', 10) + 'DELTA'
);
console.log('─'.repeat(80));

const gradeRank = Object.keys(GRADE_SCORE); // S..D, best to worst
const rankOf = (g) => gradeRank.indexOf(g);

for (const r of results) {
  for (const tool of ['Striking', 'Wrestling', 'Submissions', 'Cardio']) {
    const cur = r.current[tool];
    const comp = r.computed[tool];
    const delta = rankOf(cur) - rankOf(comp); // positive = computed is better
    const arrow = delta > 0 ? `+${delta} better` : delta < 0 ? `${delta} worse` : 'match';
    console.log(col(r.name, 24) + col(tool, 26) + col(cur, 10) + col(comp, 10) + arrow);
  }
}

console.log('─'.repeat(80));
console.log(`${results.length} fighters matched, ${unmatched.length} unmatched.`);
if (unmatched.length) {
  console.log('Unmatched (kept as-is, not in the UFCStats export or name mismatch):');
  console.log(unmatched.map(n => `  - ${n}`).join('\n'));
}
console.log('\nPower and Chin have no equivalent in this dataset — left blank above on');
console.log('purpose. Real per-fight KO/knockdown/finish data would be needed for those.');

const jsonFlagIdx = process.argv.indexOf('--json');
if (jsonFlagIdx !== -1) {
  const outPath = process.argv[jsonFlagIdx + 1] ?? 'scripts/data/derived_grades.json';
  writeFileSync(outPath, JSON.stringify({ results, unmatched }, null, 2));
  console.log(`\nFull detail written to ${outPath}`);
}
