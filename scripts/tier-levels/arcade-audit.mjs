// Plays every arcade level (originals and the current 40 added ones) with the reference brains.
import { ARCADE_GAMES } from '../../src/virtual-robot-designer/arcade/games/index.js';
import { play } from './arcade-sim.mjs';
import { BRAINS } from './arcade-brains.mjs';
for (const [id, game] of Object.entries(ARCADE_GAMES)) {
  const res = game.levels.map((L) => play(game, L, BRAINS[id]));
  const orig = res.slice(0, 10).map((r) => (r.win ? 'W' : '.')).join('');
  const added = res.slice(10).map((r) => (r.win ? 'W' : '.')).join('');
  console.log(id.padEnd(10), 'originals', orig, '| added', added, `(${res.slice(10).filter((r) => r.win).length}/40)`);
  if (process.argv[2] === id) res.forEach((r, i) => { if (!r.win) console.log('   ', i + 1, game.levels[i].title, '-', r.msg, r.time); });
}
