/**
 * BuildScreen.jsx — six rounds of spin, reveal, steal.
 *
 * The only state this screen reads that matters mechanically is `openTools` and
 * `spin`. Everything else — the reel animation, the "pick one" prompt, the reroll
 * counter — is presentation on top of a build hook that has already decided every
 * outcome by the time it reaches this component.
 */

import { useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Screen } from '../components/Motion';
import { Button, Chip, GradeInfo } from '../components/Primitives';
import Icon from '../components/Icon';
import Reel from '../components/Reel';
import FighterAvatar from '../components/FighterAvatar';
import { TOOLS, TOOL_META, ROUNDS } from '../../data/constants';

const DECOY_DIVISIONS = ['Flyweight', 'Bantamweight', 'Lightweight', 'Welterweight', 'Heavyweight', 'Strawweight'];
const DECOY_NAMES = ['— — —', '? ? ?', '• • •', '— — —', '? ? ?'];

export default function BuildScreen({ g }) {
  const { round, locked, openTools, rerolls, spin, hardMode, spinBoth, reroll, stealTool, restart } = g;

  const fighter = spin?.fighter ?? null;
  const settled = !!spin && !spin.spinning;

  const slotOrder = useMemo(() => TOOLS, []);

  return (
    <Screen className="buildscreen">
      <header className="buildscreen__head">
        <div>
          <span className="label">Round {Math.min(round + 1, ROUNDS)} of {ROUNDS}</span>
          <h1 className="display">{settled ? 'Choose one to steal' : 'Spin for a fighter'}</h1>
        </div>
        <div className="buildscreen__headright">
          <Chip tone="default" icon="refresh">{rerolls} reroll{rerolls === 1 ? '' : 's'}</Chip>
          <button className="linkbtn" onClick={restart}>
            <Icon name="x" size={13} /> Restart
          </button>
        </div>
      </header>

      {/* ── Slot rail — the build as it stands ─────────────────────────── */}
      <ol className="slotrail">
        {slotOrder.map((tool, i) => {
          const l = locked[tool];
          const meta = TOOL_META[tool];
          return (
            <motion.li
              key={tool}
              className={`slot ${l ? 'is-filled' : 'is-open'}`}
              style={{ '--tool': meta.color }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.35 }}
            >
              <span className="slot__icon"><Icon name={meta.icon} size={15} /></span>
              <span className="slot__tool">{tool}</span>
              {l ? (
                <motion.div
                  className="slot__filled"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                >
                  <GradeInfo grade={l.grade} size="sm" />
                  <span className="slot__source dim">{l.fighter}</span>
                </motion.div>
              ) : (
                <span className="slot__empty dim">Open</span>
              )}
            </motion.li>
          );
        })}
      </ol>

      {/* ── The spin ────────────────────────────────────────────────────── */}
      <section className="card spinbox">
        <div className="spinbox__reels">
          <Reel
            label="Division"
            spinning={!!spin?.spinning}
            value={fighter ? spin.division : null}
            decoys={DECOY_DIVISIONS}
          />
          <Reel
            label="Fighter"
            spinning={!!spin?.spinning}
            value={fighter?.name ?? null}
            decoys={DECOY_NAMES}
            tone="fighter"
          />
        </div>

        {!spin && (
          <div className="spinbox__cta">
            <Button variant="primary" size="lg" icon="refresh" onClick={spinBoth}>
              Spin
            </Button>
          </div>
        )}

        {spin?.spinning && (
          <p className="spinbox__spinning label">Spinning…</p>
        )}

        <AnimatePresence>
          {settled && fighter && (
            <motion.div
              className="spinbox__reveal"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="spinbox__fighterhead">
                <FighterAvatar name={fighter.name} size={56} />
                <h2 className="display">{fighter.name}</h2>
                <Chip tone="muted">{fighter.era === 'legend' ? 'All-Time' : fighter.era === 'both' ? 'Current / All-Time' : 'Current'}</Chip>
                <span className="dim">{spin.division}</span>
              </div>

              <p className="spinbox__prompt">
                {hardMode ? 'Grades are hidden. Pick a tool to steal blind.' : 'Pick one attribute to steal into your build.'}
              </p>

              <div className="stealgrid">
                {TOOLS.map(tool => {
                  const isLocked = !!locked[tool];
                  const meta = TOOL_META[tool];
                  return (
                    <button
                      key={tool}
                      className={`stealtile ${isLocked ? 'is-locked' : ''}`}
                      style={{ '--tool': meta.color }}
                      disabled={isLocked}
                      onClick={() => stealTool(tool)}
                    >
                      <Icon name={meta.icon} size={16} />
                      <span className="stealtile__tool">{tool}</span>
                      <GradeInfo grade={fighter.grades[tool]} dim={hardMode && !isLocked} />
                      {isLocked && <Icon name="check" size={14} className="stealtile__check" />}
                    </button>
                  );
                })}
              </div>

              <div className="spinbox__actions">
                <Button
                  variant="ghost" size="sm" icon="refresh"
                  disabled={rerolls <= 0}
                  onClick={reroll}
                >
                  Re-spin ({rerolls} left)
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </Screen>
  );
}
