/**
 * App.jsx — the whole game in three phases.
 *
 * There is no persistent shell here on purpose. A build is one linear session —
 * pick a pool, spin six times, see the result, build again — not a place the
 * player returns to over days, so there's no nav rail, no save file, no clock.
 * Each phase is its own full screen.
 */

import useBuilder from './ui/useBuilder';
import StartScreen from './ui/screens/StartScreen';
import BuildScreen from './ui/screens/BuildScreen';
import ResultScreen from './ui/screens/ResultScreen';

export default function App() {
  const g = useBuilder();

  if (g.phase === 'build') return <BuildScreen g={g} />;
  if (g.phase === 'reveal') return <ResultScreen g={g} />;

  return (
    <StartScreen
      poolId={g.poolId}
      hardMode={g.hardMode}
      onSelectPool={g.selectPool}
      onToggleHard={g.toggleHardMode}
      onBegin={g.beginBuild}
    />
  );
}
