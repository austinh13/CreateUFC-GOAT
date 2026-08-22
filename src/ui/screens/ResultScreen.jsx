/**
 * ResultScreen.jsx — the payoff.
 *
 * Everything shown here was decided the moment the sixth tool locked
 * (`buildEngine.simulateCareer`, called once from `useBuilder.stealTool`). This
 * screen never rolls anything itself — it reveals, in order, a result that already
 * exists: the tier, the record, the receipt of what was stolen from whom, and one
 * or two fights that would have actually happened along the way.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Screen, Stagger } from '../components/Motion';
import { Button, Chip, GradeInfo, OvrRing, CountUp } from '../components/Primitives';
import Icon from '../components/Icon';
import Backdrop from '../components/Backdrop';
import FighterAvatar from '../components/FighterAvatar';
import { TOOLS, TOOL_META } from '../../data/constants';

const TIER_TONE = {
  goat: 'gold', undisputed: 'gold', champion: 'gold',
  challenger: 'blue', contender: 'blue',
  gatekeeper: 'default', journeyman: 'red', bust: 'red',
};

export default function ResultScreen({ g }) {
  const { result, locked, rebuildSameMode, restart } = g;
  const [copied, setCopied] = useState(false);
  if (!result) return null;

  const { tier, ovr, record, belts, defenses, line, story, spotlights } = result;
  const tone = TIER_TONE[tier.id] ?? 'default';
  const finishes = record.ko + record.sub;

  const copyResult = () => {
    const receipt = TOOLS.map(t => `${t}: ${locked[t].grade} (${locked[t].fighter})`).join('\n');
    const text = `I built a ${tier.title} in the UFC Fighter Builder.\n`
      + `Record: ${record.wins}-${record.losses}${belts ? ` · ${belts} title reign(s)` : ''}\n\n${receipt}`;
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  return (
    <>
      <Backdrop variant={tone === 'gold' ? 'hero' : 'ambient'} />
      <Screen className="resultscreen">
      <Stagger className="result__inner">
        <motion.p className="label result__eyebrow">Career simulated</motion.p>

        <motion.h1 className={`result__tier display is-${tone}`}>
          {tier.title}
        </motion.h1>

        <motion.p className="result__story">{story}</motion.p>

        <motion.div className="result__top">
          <OvrRing value={ovr} max={100} size={140} label="RATING" />

          <div className="result__record">
            <div className="result__recordmain">
              <span className="display result__wl">
                <CountUp value={record.wins} /> - <CountUp value={record.losses} />
              </span>
              {belts > 0 && (
                <Chip tone="gold" icon="trophy">
                  {belts} title reign{belts > 1 ? 's' : ''}{defenses ? ` · ${defenses} defenses` : ''}
                </Chip>
              )}
            </div>
            <div className="result__methods">
              <Method label="KO/TKO" value={record.ko} />
              <Method label="Submission" value={record.sub} />
              <Method label="Decision" value={record.dec} />
              <Method label="Finish rate" value={record.wins ? Math.round((finishes / record.wins) * 100) : 0} suffix="%" />
            </div>
          </div>
        </motion.div>

        <motion.p className="result__line">{line}</motion.p>

        {/* ── The receipt ─────────────────────────────────────────────── */}
        <motion.section className="card result__receipt">
          <h2 className="section-title">What you stole</h2>
          <ul className="receiptlist">
            {TOOLS.map(tool => {
              const l = locked[tool];
              const meta = TOOL_META[tool];
              return (
                <li key={tool} className="receiptrow">
                  <div className="receiptrow__main">
                    <span className="receiptrow__icon" style={{ color: meta.color }}>
                      <Icon name={meta.icon} size={15} />
                    </span>
                    <span className="receiptrow__tool">{tool}</span>
                    <GradeInfo grade={l.grade} />
                    <FighterAvatar name={l.fighter} size={26} />
                  </div>
                  <span className="receiptrow__from dim">
                    <span className="receiptrow__fighter">{l.fighter}</span>
                    <span className="receiptrow__division">· {l.division.replace(/^(Men's|Women's)\s/, '')}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </motion.section>

        {/* ── Spotlight fights ────────────────────────────────────────── */}
        {spotlights.length > 0 && (
          <motion.section className="result__spotlights">
            <h2 className="section-title">Career highlights</h2>
            <div className="spotgrid">
              {spotlights.map((s, i) => (
                <motion.article
                  key={i}
                  className={`card spotcard ${s.won ? 'is-win' : 'is-loss'}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.1, duration: 0.4 }}
                >
                  <span className="label">{s.label}</span>
                  <h3 className="spotcard__opp display">{s.opponent}</h3>
                  <p className="dim">{s.division}</p>
                  <div className="spotcard__result">
                    <Chip tone={s.won ? 'green' : 'red'} icon={s.won ? 'check' : 'x'}>
                      {s.won ? 'Win' : 'Loss'}
                    </Chip>
                    <span className="spotcard__method">
                      {s.method === 'Decision' ? 'Decision' : `${s.method} · Round ${s.round}`}
                    </span>
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.section>
        )}

        <motion.div className="result__actions">
          <Button variant="primary" size="lg" icon="refresh" onClick={rebuildSameMode}>
            Build Again
          </Button>
          <Button variant="ghost" size="lg" icon="chevron" onClick={restart}>
            Change Pool
          </Button>
          <Button variant="quiet" size="lg" icon={copied ? 'check' : 'save'} onClick={copyResult}>
            {copied ? 'Copied!' : 'Copy Result'}
          </Button>
        </motion.div>
      </Stagger>
      </Screen>
    </>
  );
}

function Method({ label, value, suffix = '' }) {
  return (
    <div className="methodstat">
      <span className="methodstat__value display tnum"><CountUp value={value} suffix={suffix} /></span>
      <span className="label">{label}</span>
    </div>
  );
}

