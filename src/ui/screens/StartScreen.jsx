/**
 * StartScreen.jsx — the front door.
 *
 * One job: make the premise land in three seconds. This is not a training sim —
 * it's a scavenger hunt across the UFC roster. Six spins, six stolen attributes,
 * one Frankenstein fighter, one simulated career. The hero has to sell "assemble",
 * not "grind".
 */

import { motion } from 'framer-motion';
import Backdrop from '../components/Backdrop';
import { Button } from '../components/Primitives';
import Icon from '../components/Icon';
import { POOLS, TOOLS, TOOL_META } from '../../data/constants';

const LINE = {
  hidden:  { opacity: 0, y: 26, filter: 'blur(6px)' },
  visible: (i) => ({
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { delay: 0.1 + i * 0.09, duration: 0.75, ease: [0.16, 1, 0.3, 1] },
  }),
};

const POOL_ORDER = ['classic', 'men', 'women'];

export default function StartScreen({ poolId, hardMode, onSelectPool, onToggleHard, onBegin }) {
  return (
    <div className="start">
      <Backdrop variant="hero" />

      <motion.div className="start__inner" initial="hidden" animate="visible">
        <motion.p custom={0} variants={LINE} className="start__eyebrow label">
          <span className="start__dot" /> Ultimate Fighter Builder
        </motion.p>

        <motion.h1 custom={1} variants={LINE} className="start__title display">
          Build Your<br />
          <span className="start__goat">UFC</span> Fighter
        </motion.h1>

        <motion.p custom={2} variants={LINE} className="start__lede">
          You don't train this fighter — you <strong>steal</strong> for them. Six rounds,
          six open slots. Spin a division, spin a real fighter, take one of their
          attributes for your build. Once all six are locked, we simulate the career
          you assembled. Will you go Champion, or Gatekeeper?
        </motion.p>

        <motion.div custom={3} variants={LINE} className="start__toolsrow">
          {TOOLS.map((t, i) => (
            <motion.span
              key={t}
              className="start__toolchip"
              style={{ color: TOOL_META[t].color }}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + i * 0.06, type: 'spring', stiffness: 380, damping: 22 }}
            >
              <Icon name={TOOL_META[t].icon} size={14} /> {t}
            </motion.span>
          ))}
        </motion.div>

        <motion.div custom={4} variants={LINE} className="card start__setup">
          <div className="start__setuprow">
            <span className="label">Fighter pool</span>
            <div className="chipgrid chipgrid--three">
              {POOL_ORDER.map(id => (
                <button
                  key={id}
                  className={`optchip ${poolId === id ? 'is-on' : ''}`}
                  onClick={() => onSelectPool(id)}
                  aria-pressed={poolId === id}
                >
                  <span>{POOLS[id].label}</span>
                  <span className="optchip__meta">{POOLS[id].sub}</span>
                </button>
              ))}
            </div>
          </div>

          <button className={`hardmode ${hardMode ? 'is-on' : ''}`} onClick={onToggleHard} aria-pressed={hardMode}>
            <span className="hardmode__box"><Icon name="check" size={12} /></span>
            <span>
              <strong>Hard Mode</strong>
              <span className="dim"> — grades are hidden while you pick. Steal blind.</span>
            </span>
          </button>

          <Button variant="primary" size="lg" icon="play" full onClick={onBegin}>
            Begin Build
          </Button>
        </motion.div>

        <motion.div custom={5} variants={LINE} className="start__features">
          {[
            { icon: 'refresh', t: 'Spin division & fighter', d: 'Every round pulls a real fighter from a random weight class in your pool.' },
            { icon: 'target',  t: 'Steal one tool',          d: 'See all six of their grades. Take exactly one into an open slot on your build.' },
            { icon: 'trophy',  t: 'Simulate the career',     d: 'Six locked tools become a record, a tier, and the fight that defined the run.' },
          ].map((f, i) => (
            <motion.div
              key={f.t}
              className="start__feature"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85 + i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <Icon name={f.icon} size={20} />
              <h3>{f.t}</h3>
              <p className="muted">{f.d}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.p custom={6} variants={LINE} className="start__disclaimer dim">
          Fan-made. Not affiliated with or endorsed by the UFC. Grades and simulated
          outcomes are fictional and for entertainment only.
        </motion.p>
      </motion.div>
    </div>
  );
}
