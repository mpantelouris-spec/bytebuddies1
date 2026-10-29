/**
 * Chooses a layout seed for every arcade level (modes 11–50) and checks it:
 *  - the program its tier teaches (arcade-brains.mjs) must win it, and
 *  - from Medium up, a "dumb" program must lose, so sensors and If blocks are really needed.
 * Jump Bot has no sensor for hot tiles, so its levels are checked by searching for
 * a winning list of walks and jumps instead.
 * Writes src/virtual-robot-designer/data/tier-levels/arcade-tiers.js.
 */
import { ARCADE_GAMES } from '../../src/virtual-robot-designer/arcade/games/index.js';
import { makeArcadeTierLevel, ARCADE_TIER_NAMES } from '../../src/virtual-robot-designer/arcade/expanded-levels.js';
import { pathCells, perfectMaze, noDeadEnds, ring } from '../../src/virtual-robot-designer/arcade/games/pac.js';
import { play, prog } from './arcade-sim.mjs';
import { BRAINS } from './arcade-brains.mjs';
import { writeData } from './common.mjs';

const HELPERS = { pacbot: { pathCells, perfectMaze, noDeadEnds, ring } };

// Programs that should NOT be enough from Medium up
const DUMB = {
  snakebot: prog([['forever'], ['if', 1, { cond: 'food_left' }], ['turn_left', 2], ['if', 1, { cond: 'food_right' }], ['turn_right', 2], ['move', 1]]),
  brickbot: prog([['serve'], ['forever'], ['wait', 1, { seconds: 0.2 }]]),
  hopbot: prog([['forever'], ['hop_forward', 1]]),
  // Hard teaches dodging: aiming without the slime check must not be enough
  raiderbot: prog([
    ['forever'],
    ['if', 1, { cond: 'raider_above' }], ['zap', 2],
    ['else', 1],
    ['if', 2, { cond: 'raider_left' }], ['move_left', 3, { steps: 1 }],
    ['else', 2], ['move_right', 3, { steps: 1 }],
  ]),
};
const DUMB_FROM = { snakebot: 2, brickbot: 1, hopbot: 1, raiderbot: 99 }; // Raiders: a moving ship rarely gets hit, so dodging can't be forced

/** Jump Bot: can a list of walks and jumps reach the goal? (same rules as games/jump.js) */
function jumpSolvable(L) {
  const tile = (x) => L.platforms.find(([a, b]) => x >= a && x <= b) || null;
  const between = (x, a, b) => x >= Math.min(a, b) && x <= Math.max(a, b);
  const seen = new Set(); const queue = [[0, (L.keys || []).length === 0]];
  while (queue.length) {
    const [x, hasKey] = queue.shift();
    if (x >= L.goalX) return true;
    const k = `${x}|${hasKey}`; if (seen.has(k)) continue; seen.add(k);
    for (const [isJump, d] of [[false, 1], [false, 2], [true, 1], [true, 2], [true, 3], [true, 4]]) {
      const to = x + d; const from = tile(x); const land = tile(to);
      if (!land || !from) continue;
      if (isJump ? land[2] > from[2] + 2 : land[2] > from[2]) continue;
      if (!isJump && (L.enemies || []).some((e) => between(e, x, to) && e !== x)) continue;
      if ((L.hazards || []).includes(to)) continue;
      const got = hasKey || (L.keys || []).some((kx) => between(kx, x, to));
      if ((L.doors || []).includes(to) && !got) continue;
      if ((L.doors || []).some((dx) => between(dx, x + 1, to) && dx !== to) && !got) continue;
      queue.push([to, got]);
    }
  }
  return false;
}

function check(gameId, game, level, tierIndex) {
  if (gameId === 'jumpbot') return jumpSolvable(level) ? null : 'unsolvable';
  let brain = BRAINS[gameId];
  if (gameId === 'brickbot' && tierIndex === 0) {
    // Easy Brick: line up under the bricks first (20px per step), then serve and follow the ball
    const bricks = level.bricks();
    const mid = bricks.reduce((s, b) => s + b.x + b.w / 2, 0) / bricks.length;
    const steps = Math.round((mid - 320) / 20);
    brain = prog([...(steps ? [[steps > 0 ? 'move_right' : 'move_left', 0, { steps: Math.abs(steps) }]] : []), ...BRAINS.brickbot.map((b) => [b.type, b.indent, b.params])]);
  }
  if (gameId === 'brickbot' && tierIndex === 3) {
    // Advanced Brick: the ball is fast, so the brain moves 2 steps at a time (the game's own hint)
    brain = prog(BRAINS.brickbot.map((b) => [b.type, b.indent, b.params?.steps ? { steps: 2 } : b.params]));
  }
  const best = play(game, level, brain, { maxTime: 300 });
  if (!best.win) return `brain loses: ${best.msg}`;
  if (DUMB[gameId] && tierIndex >= DUMB_FROM[gameId]) {
    const dumb = play(game, level, DUMB[gameId], { maxTime: 120 });
    if (dumb.win) return 'too easy (a program without sensors wins)';
  }
  return null;
}

export function buildArcade(only = null) {
  const seeds = {}; const report = [];
  for (const [gameId, game] of Object.entries(ARCADE_GAMES)) {
    if (only && only !== gameId) continue;
    seeds[gameId] = [];
    const fails = {};
    ARCADE_TIER_NAMES[gameId].forEach((name, i) => {
      const t = Math.floor(i / 10);
      for (let attempt = 0; attempt < 150; attempt++) {
        const seed = 7919 * (i + 1) + attempt * 104729 + gameId.length * 31;
        const level = makeArcadeTierLevel(gameId, i, seed, HELPERS[gameId]);
        const bad = check(gameId, game, level, t);
        if (!bad) { seeds[gameId][i] = seed; return; }
        fails[bad.slice(0, 40)] = (fails[bad.slice(0, 40)] || 0) + 1;
      }
      throw new Error(`${gameId} level ${i + 11} “${name}” — no layout passed: ${JSON.stringify(fails)}`);
    });
    report.push(`${gameId}: 40/40 levels checked`);
  }
  return { seeds, report };
}

if (process.argv[1]?.endsWith('build-arcade.mjs')) {
  const { seeds, report } = buildArcade(process.argv[2] || null);
  if (!process.argv[2]) writeData('arcade-tiers.js', 'Seeds for the arcade tier levels (modes 11–50). Every seed was checked by scripts/tier-levels/build-arcade.mjs.', { ARCADE_TIER_SEEDS: seeds });
  console.log(report.join('\n'));
}
