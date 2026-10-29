/**
 * Jump Bot — an original, retro side-scrolling platform adventure.
 * Ten short levels teach sequence, loops, sensors, conditionals and planning.
 */

import { createArcadeExpansion } from '../expanded-levels.js';

const LEVELS = [
  { title: 'Button Meadow', goal: 'Walk to the finish flag and scoop up the coins.', hint: 'Repeat 8 times → Walk forward. A loop saves lots of blocks!', par: 2, goalX: 8, platforms: [[0, 8, 0]], coins: [2, 4, 6], palette: ['walk_forward', 'jump', 'repeat'], starter: [['repeat', 0, { times: 8 }], ['walk_forward', 1]] },
  { title: 'Gapstone Gulch', goal: 'Jump over the wide gap to reach the other side.', hint: 'The gap starts ahead. Set Jump to 3 steps to clear it in one leap.', par: 3, goalX: 10, platforms: [[0, 3, 0], [6, 10, 0]], coins: [2, 7, 9], palette: ['walk_forward', 'jump', 'repeat', 'if', 'else'] },
  { title: 'Pipeworks Park', goal: 'Climb over the pipes and dodge the buzzy beetle.', hint: 'Use “If gap ahead” or “If enemy ahead” to decide when to jump.', par: 5, goalX: 12, platforms: [[0, 3, 0], [4, 7, 0], [8, 12, 0]], hazards: [5, 10], enemies: [8], coins: [2, 6, 9, 11], palette: ['walk_forward', 'jump', 'repeat', 'if', 'else', 'wait'] },
  { title: 'Cloudstep Canyon', goal: 'Leap up the cloud steps to the sunny ledge.', hint: 'A jump can reach a platform up to two steps higher. Check “high step ahead”.', par: 6, goalX: 12, platforms: [[0, 3, 0], [4, 6, 1], [7, 9, 2], [10, 12, 1]], coins: [3, 5, 8, 11], palette: ['walk_forward', 'jump', 'repeat', 'if', 'else'] },
  { title: 'Beetle Bounce', goal: 'Hop over the beetles and collect their star coins.', hint: 'Jumping onto a beetle safely bounces it away. Walking into one is a bonk!', par: 6, goalX: 13, platforms: [[0, 13, 0]], enemies: [4, 9], coins: [2, 5, 7, 11], palette: ['walk_forward', 'jump', 'repeat', 'if', 'else', 'wait'] },
  { title: 'Key-and-Door Castle', goal: 'Find the golden key, then reach the castle gate.', hint: 'The gate only opens after the key. Check “has key” before the last stretch.', par: 7, goalX: 14, platforms: [[0, 14, 0]], keys: [6], doors: [11], coins: [2, 5, 8, 12], palette: ['walk_forward', 'jump', 'repeat', 'if', 'else', 'repeat_until'] },
  { title: 'Firefly Forest', goal: 'Cross the forest gaps and gather the glowing fireflies.', hint: 'Check “gap ahead” before every move. Jump over the two broken bridges.', par: 8, goalX: 15, platforms: [[0, 4, 0], [7, 9, 0], [12, 15, 0]], coins: [2, 4, 8, 13], palette: ['walk_forward', 'jump', 'repeat', 'if', 'else', 'wait'] },
  { title: 'Rainbow Rooftops', goal: 'Leap between rooftops and avoid the speedy beetles.', hint: 'Plan your jumps: the roof heights change, and some landings have enemies.', par: 9, goalX: 16, platforms: [[0, 3, 0], [5, 7, 1], [9, 11, 0], [13, 16, 2]], enemies: [6, 14], coins: [2, 5, 10, 13, 15], palette: ['walk_forward', 'jump', 'repeat', 'if', 'else'] },
  { title: 'Lava Lighthouse', goal: 'Cross the stepping stones above the warm lava and reach safety.', hint: 'A missing tile means lava below. Use “gap ahead” and jump the full distance.', par: 10, goalX: 17, platforms: [[0, 2, 0], [5, 7, 1], [10, 12, 1], [15, 17, 2]], hazards: [6, 11], coins: [1, 5, 10, 15], palette: ['walk_forward', 'jump', 'repeat', 'if', 'else', 'repeat_until'] },
  { title: 'Star Tower Finale', goal: 'Use everything you learned to reach the star at the tower top!', hint: 'Build a plan with Repeat and If blocks. Watch for gaps, beetles, keys and high steps.', par: 12, goalX: 19, platforms: [[0, 3, 0], [6, 8, 1], [10, 12, 0], [14, 16, 2], [18, 19, 3]], enemies: [7, 11, 15], hazards: [2, 12], keys: [9], doors: [16], coins: [1, 6, 9, 14, 18], palette: ['walk_forward', 'jump', 'repeat', 'if', 'else', 'repeat_until'] },
];
LEVELS.push(...createArcadeExpansion({ id: 'jumpbot', title: 'Jump Bot', emoji: '🦘', color: '#8b5cf6', levels: LEVELS }));

const tileAt = (level, x) => level.platforms.find(([from, to]) => x >= from && x <= to) || null;
const pointBetween = (x, a, b) => x >= Math.min(a, b) && x <= Math.max(a, b);

export const jump = {
  id: 'jumpbot', title: 'Jump Bot', emoji: '🦘', color: '#8b5cf6',
  blurb: 'Code a little robot through ten bright, retro platform adventures. Use loops, jumps and sensors to reach the star!',
  conditions: [
    { id: 'gap_ahead', label: 'gap ahead' },
    { id: 'coin_ahead', label: 'coin ahead' },
    { id: 'enemy_ahead', label: 'beetle ahead' },
    { id: 'high_step_ahead', label: 'high step ahead' },
    { id: 'key_ahead', label: 'key ahead' },
    { id: 'has_key', label: 'I have the key' },
    { id: 'at_goal', label: 'at the finish flag' },
  ],
  blocks: {
    walk_forward: { label: 'Walk forward', icon: '➡️', color: '#3b82f6', cat: 'Move', params: [{ key: 'steps', label: 'steps', type: 'num', min: 1, max: 6, default: 1 }] },
    jump: { label: 'Jump forward', icon: '⬆️', color: '#8b5cf6', cat: 'Move', params: [{ key: 'steps', label: 'steps', type: 'num', min: 1, max: 6, default: 2 }] },
  },
  levels: LEVELS,
  get size() { return [960, 440]; },

  init(levelIdx) {
    const level = LEVELS[levelIdx];
    return { level: levelIdx, x: 0, y: tileAt(level, 0)?.[2] || 0, t: 0, coins: [...(level.coins || [])], keys: [...(level.keys || [])], enemies: [...(level.enemies || [])], falls: 0, cmd: null, move: null, result: null };
  },

  start(w, action) {
    if (!['walk_forward', 'jump'].includes(action.type)) { w.cmd = { ...action, t: 0, dur: 0 }; return; }
    const L = LEVELS[w.level];
    const distance = Math.max(1, Math.min(6, Math.round(Number(action.params?.steps) || (action.type === 'jump' ? 2 : 1))));
    const target = w.x + distance;
    const platform = tileAt(L, target);
    const fromTile = tileAt(L, w.x);
    const isJump = action.type === 'jump';
    const reachable = platform && fromTile && (isJump ? platform[2] <= fromTile[2] + 2 : platform[2] <= fromTile[2]);
    const blockedDoor = (L.doors || []).includes(target) && w.keys.length > 0;
    const duration = isJump ? 0.62 : 0.34;
    w.move = { from: w.x, to: target, y0: w.y, y1: platform?.[2] ?? -2, jump: isJump, falls: !reachable, blockedDoor, duration };
    w.cmd = { ...action, t: 0, dur: duration };
  },

  tick(w, dt) {
    if (w.result) return;
    w.t += dt;
    const c = w.cmd;
    if (c && !c.done) {
      c.t += dt;
      const m = w.move;
      const p = Math.min(1, c.t / Math.max(0.01, c.dur));
      if (m) {
        w.x = m.from + (m.to - m.from) * p;
        const arc = m.jump ? Math.sin(p * Math.PI) * 1.35 : 0;
        w.y = m.y0 + (m.y1 - m.y0) * p + arc;
      }
      if (p >= 1) {
        c.done = true;
        if (!m) return;
        if (m.falls) { w.falls++; w.result = { lose: true, msg: 'Whoops! Jump Bot needs a platform to land on. Check the gap and try a longer jump.' }; return; }
        if (m.blockedDoor) { w.result = { lose: true, msg: 'The gate is locked. Find the golden key first!' }; return; }
        w.x = m.to; w.y = m.y1; w.move = null;
        const L = LEVELS[w.level];
        w.coins = w.coins.filter((x) => !pointBetween(x, m.from, m.to));
        w.keys = w.keys.filter((x) => !pointBetween(x, m.from, m.to));
        const enemy = w.enemies.find((x) => pointBetween(x, m.from, m.to));
        if (enemy != null) {
          if (m.jump) {
            if (enemy === m.to) w.enemies = w.enemies.filter((x) => x !== enemy);
          } else { w.result = { lose: true, msg: 'Bonk! A buzzy beetle got in the way. Try jumping over it.' }; return; }
        }
        if ((L.hazards || []).some((x) => x === m.to)) { w.result = { lose: true, msg: 'Careful! That tile is too hot. Jump over the hazard.' }; return; }
        if ((L.doors || []).includes(m.to) && w.keys.length > 0) { w.result = { lose: true, msg: 'The gate is locked. Find the golden key first!' }; return; }
        if (w.x >= L.goalX) w.result = { win: true, msg: `You made it to the star in ${w.t.toFixed(1)} seconds!` };
      }
    }
    if (w.t > 90) w.result = { lose: true, msg: 'Time to try a new plan. Loops can help you move faster!' };
  },

  sense(w, cond) {
    const L = LEVELS[w.level];
    const x = Math.round(w.x);
    switch (cond) {
      case 'gap_ahead': return !tileAt(L, x + 1);
      case 'coin_ahead': return w.coins.some((n) => n >= x && n <= x + 4);
      case 'enemy_ahead': return w.enemies.some((n) => n >= x && n <= x + 3);
      case 'high_step_ahead': { const cur = tileAt(L, x), next = tileAt(L, x + 1); return !!cur && !!next && next[2] > cur[2]; }
      case 'key_ahead': return w.keys.some((n) => n >= x && n <= x + 4);
      case 'has_key': return w.keys.length < (L.keys || []).length;
      case 'at_goal': return x >= L.goalX;
      default: return false;
    }
  },
  status(w) { return w.result; },
  end(w) { return w.result || { lose: true, msg: 'The program ended before Jump Bot reached the star. Add a loop or more steps.' }; },
  hud(w) {
    const L = LEVELS[w.level];
    return [
      { icon: '⭐', val: `${L.goalX - Math.min(L.goalX, Math.floor(w.x))}/${L.goalX}`, lbl: 'Tiles left', color: '#facc15' },
      { icon: '🪙', val: `${(L.coins || []).length - w.coins.length}/${(L.coins || []).length}`, lbl: 'Coins', color: '#fbbf24' },
      { icon: '⏱', val: `${Math.floor(w.t)}s`, lbl: 'Time', color: '#93c5fd' },
    ];
  },
  progress(w) { const L = LEVELS[w.level]; return { current: Math.min(L.goalX, Math.floor(w.x)), target: L.goalX, label: 'tiles to the star', pct: Math.round((Math.min(L.goalX, w.x) / L.goalX) * 100) }; },
};
