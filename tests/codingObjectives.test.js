/** Every Robot Studio arena has its own coding objective, and harder arenas ask for more. */
import { applyPrimaryStudioMeta, STARTER_CHASSIS_IDS } from '../src/virtual-robot-designer/data/primary-robot-studio.js';
import { getCodingObjective } from '../src/virtual-robot-designer/studio/codingObjective.js';
import { ARCADE_GAMES } from '../src/virtual-robot-designer/arcade/games/index.js';
import { arcadeLevelFacts } from '../src/virtual-robot-designer/arcade/arcadeObjective.js';

const DIFF = ['Tutorial', 'Easy', 'Easy', 'Medium', 'Medium', 'Medium', 'Hard', 'Hard', 'Hard', 'Expert'];
const text = (o) => `${o.ican}|${o.checks.map((c) => c.label).join('|')}`;
const sameLevelText = (o) => `${o.ican}|${o.checks.filter((c) => c.id !== 'run').map((c) => c.label).join('|')}`;

function objectivesFor(chassisId) {
  const game = ARCADE_GAMES[chassisId];
  if (game) {
    return game.levels.map((L, i) => getCodingObjective({
      id: `${chassisId}-${i}`, modeIndex: i + 1, name: L.title, environmentName: L.title, desc: L.goal, tryThis: L.hint,
      skillLearned: L.skill || 'Loops', difficulty: L.difficulty || DIFF[i] || 'Bonus', par: L.par,
      arcade: { palette: L.palette, conditions: game.conditions, ...arcadeLevelFacts(game, i) },
    }, { kind: 'arcade' }));
  }
  return Array.from({ length: 50 }, (_, k) => getCodingObjective(applyPrimaryStudioMeta({ chassisId, modeIndex: k + 1, id: `${chassisId}_${k + 1}` })));
}

describe.each(STARTER_CHASSIS_IDS)('%s', (chassisId) => {
  const list = objectivesFor(chassisId);

  test('every arena has its own objective', () => {
    expect(new Set(list.map(text)).size).toBe(list.length);
    // ...and they differ in what they ask, not just the arena name, for nearly all arenas
    expect(new Set(list.map(sameLevelText)).size).toBeGreaterThanOrEqual(Math.floor(list.length * 0.8));
  });

  test('harder arenas ask for more', () => {
    const byRank = [0, 1, 2, 3, 4].map((r) => list.filter((o) => o.rank === r).map((o) => o.checks.length));
    const avg = byRank.map((xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null));
    const seen = avg.filter((a) => a != null);
    seen.slice(1).forEach((a, i) => expect(a).toBeGreaterThanOrEqual(seen[i]));
    list.filter((o) => o.rank === 4).forEach((o) => expect(o.checks.length).toBeGreaterThanOrEqual(4));
    list.forEach((o) => expect(o.ican).toBeTruthy());
  });
});
