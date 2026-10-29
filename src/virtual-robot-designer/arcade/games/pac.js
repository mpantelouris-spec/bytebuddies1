/**
 * Pac-Bot — a maze-chase game. Eat every energy dot, dodge the Glitch Bugs,
 * grab a power battery to gobble them. Teaches wall-following and If/Else.
 */
import { createArcadeExpansion } from '../expanded-levels.js';

export const COLS = 19, ROWS = 15, CELL = 32;
const W = COLS * CELL, H = ROWS * CELL;
const DX = [1, 0, -1, 0], DY = [0, 1, 0, -1];
const key = (x, y) => `${x},${y}`;

function mulberry(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ─── Maze makers (return a Set of open cells) ─── */
function pathCells(points) {
  const open = new Set();
  for (let i = 0; i < points.length - 1; i++) {
    let [x, y] = points[i];
    const [x1, y1] = points[i + 1];
    open.add(key(x, y));
    while (x !== x1 || y !== y1) { x += Math.sign(x1 - x); y += Math.sign(y1 - y); open.add(key(x, y)); }
  }
  return open;
}
/** A "perfect" maze (no loops) on the odd cells inside a box. `braid` knocks extra holes to make loops. */
function perfectMaze(seed, x0 = 1, y0 = 1, x1 = COLS - 2, y1 = ROWS - 2, braid = 0) {
  const rnd = mulberry(seed);
  const open = new Set();
  const cw = Math.floor((x1 - x0) / 2) + 1, ch = Math.floor((y1 - y0) / 2) + 1;
  const seen = new Set();
  const stack = [[0, 0]];
  seen.add('0,0');
  open.add(key(x0, y0));
  while (stack.length) {
    const [cx, cy] = stack[stack.length - 1];
    const nbrs = [[1, 0], [-1, 0], [0, 1], [0, -1]]
      .map(([dx, dy]) => [cx + dx, cy + dy, dx, dy])
      .filter(([nx, ny]) => nx >= 0 && ny >= 0 && nx < cw && ny < ch && !seen.has(key(nx, ny)));
    if (!nbrs.length) { stack.pop(); continue; }
    const [nx, ny, dx, dy] = nbrs[Math.floor(rnd() * nbrs.length)];
    seen.add(key(nx, ny));
    open.add(key(x0 + cx * 2 + dx, y0 + cy * 2 + dy));
    open.add(key(x0 + nx * 2, y0 + ny * 2));
    stack.push([nx, ny]);
  }
  for (let i = 0; i < braid; i++) {
    const x = x0 + 1 + Math.floor(rnd() * (x1 - x0 - 1));
    const y = y0 + 1 + Math.floor(rnd() * (y1 - y0 - 1));
    if ((x - x0) % 2 !== (y - y0) % 2) open.add(key(x, y)); // a wall between two corridor cells
  }
  return open;
}
/** Knock through every dead end so the maze is all loops (like a real Pac-Man maze). */
function noDeadEnds(open, seed = 1) {
  const rnd = mulberry(seed);
  const isO = (x, y) => open.has(key(x, y));
  for (let pass = 0; pass < 3; pass++) {
    [...open].forEach((k) => {
      const [x, y] = k.split(',').map(Number);
      const exits = [0, 1, 2, 3].filter((d) => isO(x + DX[d], y + DY[d]));
      if (exits.length !== 1) return;
      const opts = [0, 1, 2, 3].filter((d) => {
        const wx = x + DX[d], wy = y + DY[d], bx = x + DX[d] * 2, by = y + DY[d] * 2;
        return !isO(wx, wy) && wx > 0 && wy > 0 && wx < COLS - 1 && wy < ROWS - 1 && isO(bx, by);
      });
      if (opts.length) {
        const d = opts[Math.floor(rnd() * opts.length)];
        open.add(key(x + DX[d], y + DY[d]));
      }
    });
  }
  return open;
}
function ring(x0, y0, x1, y1) {
  return pathCells([[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]]);
}

const FOLLOW_HINT = 'Left-hand rule: If wall on the left → (If wall ahead → turn right, Else → move). Else → turn left, then move.';

const LEVELS = [
  { title: 'Dot dash', goal: 'Gobble the straight line of energy dots!', hint: 'Repeat → Move forward. Count the dots.', par: 2,
    make: () => ({ open: pathCells([[2, 7], [16, 7]]), start: [2, 7, 0] }), bugs: [], palette: ['move', 'turn_left', 'turn_right', 'repeat'],
    starter: [['repeat', 0, { times: 5 }], ['move', 1]] },
  { title: 'Round the bend', goal: 'The corridor turns a corner. Eat every dot.', hint: 'Move along, turn right, move down.', par: 5,
    make: () => ({ open: pathCells([[3, 4], [10, 4], [10, 11]]), start: [3, 4, 0] }), bugs: [], palette: ['move', 'turn_left', 'turn_right', 'repeat'] },
  { title: 'Loop the loop', goal: 'A square track. Let the robot decide when to turn!', hint: 'Forever → If wall ahead → Turn right. Then Move.', par: 4,
    make: () => ({ open: ring(4, 3, 14, 11), start: [4, 3, 0] }), bugs: [], palette: ['move', 'turn_left', 'turn_right', 'forever', 'if', 'else'],
    starter: [['forever'], ['if', 1, { cond: 'wall_ahead' }], ['turn_right', 2]] },
  { title: 'Twisty tunnel', goal: 'One long tunnel that turns left AND right.', hint: 'If wall ahead → (If wall on the left → turn right, Else → turn left). Then Move.', par: 7,
    make: () => ({ open: pathCells([[2, 2], [8, 2], [8, 6], [4, 6], [4, 10], [12, 10], [12, 4], [16, 4], [16, 12]]), start: [2, 2, 0] }),
    bugs: [], palette: ['move', 'turn_left', 'turn_right', 'forever', 'if', 'else'] },
  { title: 'The maze', goal: 'A real maze with dead ends. Keep one hand on the wall and you will find every dot!', hint: FOLLOW_HINT, par: 8,
    make: () => ({ open: perfectMaze(4, 3, 1, 15, 13), start: [3, 1, 0] }), bugs: [], palette: ['move', 'turn_left', 'turn_right', 'turn_around', 'forever', 'if', 'else'] },
  { title: 'Glitch Bug!', goal: 'A slow Glitch Bug wanders the maze. If it is ahead, turn around!', hint: 'Bug ahead → Turn around. Else: dot ahead → Move, dot left → Turn left, dot right → Turn right, otherwise turn left/right at walls.', par: 17,
    make: () => ({ open: noDeadEnds(perfectMaze(9, 3, 1, 15, 13), 9), start: [3, 1, 0] }), bugs: [{ at: [15, 13], step: 0.5, chase: 0 }],
    palette: ['move', 'turn_left', 'turn_right', 'turn_around', 'forever', 'if', 'else'] },
  { title: 'Bug patrol', goal: 'Two bugs now — and a power battery in the corner.', hint: 'Bug check first, then chase the dots. You have 3 lives!', par: 17,
    make: () => ({ open: noDeadEnds(perfectMaze(21, 3, 1, 15, 13), 21), start: [3, 1, 0], power: [[15, 13]] }), bugs: [{ at: [15, 13], step: 0.55, chase: 0 }, { at: [15, 1], step: 0.6, chase: 0 }],
    palette: ['move', 'turn_left', 'turn_right', 'turn_around', 'forever', 'if', 'else'] },
  { title: 'Power up!', goal: 'Big batteries give you power: bugs turn blue and you can gobble them!', hint: 'If bug ahead → (If powered → Move, Else → Turn around). Then chase dots.', par: 19,
    make: () => ({ open: noDeadEnds(perfectMaze(33, 3, 1, 15, 13), 33), start: [3, 1, 0], power: [[15, 13], [3, 13], [15, 1]] }), bugs: [{ at: [9, 7], step: 0.52, chase: 0.15 }, { at: [15, 7], step: 0.56, chase: 0.15 }],
    palette: ['move', 'turn_left', 'turn_right', 'turn_around', 'forever', 'if', 'else'] },
  { title: 'Smart bugs', goal: 'These bugs try to chase you. Eat every dot!', hint: 'Check for bugs every single step, and use power batteries.', par: 19, needPct: 1,
    make: () => ({ open: noDeadEnds(perfectMaze(57, 1, 1, COLS - 2, ROWS - 2, 6), 57), start: [1, 1, 0], power: [[17, 13], [1, 13]] }), bugs: [{ at: [17, 13], step: 0.5, chase: 0.3 }, { at: [9, 7], step: 0.54, chase: 0.3 }],
    palette: ['move', 'turn_left', 'turn_right', 'turn_around', 'forever', 'if', 'else', 'repeat_until'] },
  { title: 'Pac-Bot champion', goal: 'Three bugs, loops and power batteries. Clear the whole maze!', hint: 'Bugs first, power second, then chase the dots.', par: 19, needPct: 1,
    make: () => ({ open: noDeadEnds(perfectMaze(77, 1, 1, COLS - 2, ROWS - 2, 10), 77), start: [1, 1, 0], power: [[17, 13], [1, 13], [17, 1]] }),
    bugs: [{ at: [17, 13], step: 0.5, chase: 0.3 }, { at: [9, 7], step: 0.54, chase: 0.25 }, { at: [17, 1], step: 0.58, chase: 0.2 }],
    palette: ['move', 'turn_left', 'turn_right', 'turn_around', 'forever', 'if', 'else', 'repeat', 'repeat_until'] },
];
LEVELS.push(...createArcadeExpansion({ id: 'pacbot', title: 'Pac-Bot', emoji: '🟡', color: '#facc15', levels: LEVELS }, { pathCells, perfectMaze, noDeadEnds, ring }));

const POWER_TIME = 7;
const BUG_COLORS = ['#ef4444', '#a855f7', '#f97316'];

function isOpen(w, x, y) { return x >= 0 && y >= 0 && x < COLS && y < ROWS && w.open.has(key(x, y)); }

function scan(w, dir, test, max = 30) {
  let x = w.p.x, y = w.p.y;
  for (let i = 0; i < max; i++) {
    x += DX[dir]; y += DY[dir];
    if (!isOpen(w, x, y)) return false;
    if (test(x, y)) return true;
  }
  return false;
}

function hitBugs(w, playerMoved = false) {
  for (const b of w.bugs) {
    if (b.out > 0) continue;
    const same = b.x === w.p.x && b.y === w.p.y;
    const swap = playerMoved && b.x === w.p.px && b.y === w.p.py && b.px === w.p.x && b.py === w.p.y;
    if (!same && !swap) continue;
    if (w.powerT > 0) {
      b.out = 3; b.x = b.home[0]; b.y = b.home[1]; b.px = b.x; b.py = b.y;
      w.gobbled++;
      w.pops.push({ x: w.p.x, y: w.p.y, life: 0.8, text: '+1 bug!' });
    } else if (w.safeT <= 0) {
      w.lives--;
      if (w.lives <= 0) {
        w.result = { lose: true, msg: 'The Glitch Bugs caught Pac-Bot 3 times! Check "bug ahead" and turn around.' };
        return;
      }
      // Lose a life: bugs go home, Pac-Bot flashes for a moment.
      w.safeT = 2.5;
      w.pops.push({ x: w.p.x, y: w.p.y, life: 1, text: `ouch! ${w.lives} ❤️ left` });
      w.bugs.forEach((bb) => { bb.x = bb.home[0]; bb.y = bb.home[1]; bb.px = bb.x; bb.py = bb.y; bb.acc = 0; bb.out = 1; });
      return;
    }
  }
}

export const pac = {
  id: 'pacbot',
  title: 'Pac-Bot',
  emoji: '🟡',
  color: '#eab308',
  blurb: 'Gobble every energy dot in the maze and dodge the Glitch Bugs!',
  size: [W, H],
  conditions: [
    { id: 'wall_ahead', label: 'wall ahead' },
    { id: 'wall_left', label: 'wall on the left' },
    { id: 'wall_right', label: 'wall on the right' },
    { id: 'dot_ahead', label: 'dot ahead' },
    { id: 'dot_left', label: 'dot to the left' },
    { id: 'dot_right', label: 'dot to the right' },
    { id: 'bug_ahead', label: 'bug ahead' },
    { id: 'bug_behind', label: 'bug behind' },
    { id: 'powered', label: 'powered up' },
    { id: 'all_eaten', label: 'all dots eaten' },
  ],
  blocks: {
    move: { label: 'Move forward', icon: '⬆️', color: '#3b82f6', cat: 'Move' },
    turn_left: { label: 'Turn left', icon: '↩️', color: '#0ea5e9', cat: 'Move' },
    turn_right: { label: 'Turn right', icon: '↪️', color: '#0ea5e9', cat: 'Move' },
    turn_around: { label: 'Turn around', icon: '🔄', color: '#0ea5e9', cat: 'Move' },
  },
  levels: LEVELS,

  init(levelIdx) {
    const L = LEVELS[levelIdx];
    const m = L.make();
    const [sx, sy, sd] = m.start;
    const power = new Set((m.power || []).map(([x, y]) => key(x, y)));
    const dots = new Set([...m.open].filter((k) => k !== key(sx, sy) && !power.has(k)));
    const total = dots.size + power.size;
    return {
      level: levelIdx,
      t: 0,
      open: m.open,
      dots,
      power,
      total,
      need: Math.ceil(total * (L.needPct || 1)),
      eaten: 0,
      gobbled: 0,
      p: { x: sx, y: sy, dir: sd, px: sx, py: sy },
      anim: 1,
      bugs: L.bugs.map((b, i) => ({ x: b.at[0], y: b.at[1], px: b.at[0], py: b.at[1], dir: 2, home: b.at, step: b.step, chase: b.chase, acc: 0, out: 0, color: BUG_COLORS[i % 3], anim: 1 })),
      rnd: mulberry(1000 + levelIdx),
      powerT: 0,
      lives: 3,
      safeT: 0,
      bumps: 0,
      moves: 0,
      pops: [],
      cmd: null,
      result: null,
    };
  },

  start(w, action) {
    const c = { ...action, t: 0, dur: 0.06 };
    const p = w.p;
    if (action.type === 'turn_left') p.dir = (p.dir + 3) % 4;
    else if (action.type === 'turn_right') p.dir = (p.dir + 1) % 4;
    else if (action.type === 'turn_around') { p.dir = (p.dir + 2) % 4; c.dur = 0.09; }
    else if (action.type === 'move') {
      c.dur = 0.17;
      const nx = p.x + DX[p.dir], ny = p.y + DY[p.dir];
      p.px = p.x; p.py = p.y;
      if (!isOpen(w, nx, ny)) {
        w.bumps++;
        w.pops.push({ x: p.x, y: p.y, life: 0.4, text: 'bonk!' });
        if (w.bumps > 400 && !w.result) w.result = { lose: true, msg: 'Pac-Bot keeps bumping into walls. Check "wall ahead" before moving.' };
      } else {
        p.x = nx; p.y = ny; w.anim = 0; w.moves++;
        const k = key(nx, ny);
        if (w.dots.delete(k)) w.eaten++;
        if (w.power.delete(k)) { w.eaten++; w.powerT = POWER_TIME; w.pops.push({ x: nx, y: ny, life: 0.9, text: 'POWER!' }); }
        hitBugs(w, true);
        if (!w.result && w.eaten >= w.need) w.result = { win: true, msg: `All ${w.eaten} dots gobbled${w.gobbled ? ` and ${w.gobbled} bug${w.gobbled === 1 ? '' : 's'} caught` : ''}!` };
      }
    } else c.dur = 0;
    w.cmd = c;
  },

  tick(w, dt) {
    if (w.result) return;
    w.t += dt;
    w.anim = Math.min(1, w.anim + dt / 0.17);
    w.powerT = Math.max(0, w.powerT - dt);
    w.safeT = Math.max(0, w.safeT - dt);
    w.pops.forEach((q) => { q.life -= dt; });
    w.pops = w.pops.filter((q) => q.life > 0);
    for (const b of w.bugs) {
      b.anim = Math.min(1, b.anim + dt / b.step);
      if (b.out > 0) { b.out -= dt; continue; }
      b.acc += dt * (w.powerT > 0 ? 0.6 : 1);
      if (b.acc < b.step) continue;
      b.acc -= b.step;
      const opts = [0, 1, 2, 3].filter((d) => isOpen(w, b.x + DX[d], b.y + DY[d]));
      let choices = opts.filter((d) => d !== (b.dir + 2) % 4);
      if (!choices.length) choices = opts;
      if (!choices.length) continue;
      let d;
      const dist = (dd) => Math.abs(b.x + DX[dd] - w.p.x) + Math.abs(b.y + DY[dd] - w.p.y);
      if (w.powerT > 0) d = choices.reduce((a, c) => (dist(c) > dist(a) ? c : a));
      else if (w.rnd() < b.chase) d = choices.reduce((a, c) => (dist(c) < dist(a) ? c : a));
      else d = choices[Math.floor(w.rnd() * choices.length)];
      b.px = b.x; b.py = b.y;
      b.x += DX[d]; b.y += DY[d]; b.dir = d; b.anim = 0;
      hitBugs(w);
      if (w.result) return;
    }
    const c = w.cmd;
    if (c && !c.done) { c.t += dt; if (c.t >= c.dur) c.done = true; }
    if (w.t > 180 && !w.result) w.result = { lose: true, msg: `Time up — ${w.eaten} of ${w.need} dots eaten. Try the left-hand rule!` };
  },

  sense(w, cond) {
    const p = w.p;
    const wallAt = (d) => !isOpen(w, p.x + DX[d], p.y + DY[d]);
    const food = (x, y) => w.dots.has(key(x, y)) || w.power.has(key(x, y));
    const bugAt = (x, y) => w.bugs.some((b) => b.out <= 0 && b.x === x && b.y === y);
    switch (cond) {
      case 'wall_ahead': return wallAt(p.dir);
      case 'wall_left': return wallAt((p.dir + 3) % 4);
      case 'wall_right': return wallAt((p.dir + 1) % 4);
      case 'dot_ahead': return scan(w, p.dir, food);
      case 'dot_left': return scan(w, (p.dir + 3) % 4, food);
      case 'dot_right': return scan(w, (p.dir + 1) % 4, food);
      case 'bug_ahead': return scan(w, p.dir, bugAt, 5);
      case 'bug_behind': return scan(w, (p.dir + 2) % 4, bugAt, 3);
      case 'powered': return w.powerT > 0;
      case 'all_eaten': return w.eaten >= w.need;
      default: return false;
    }
  },

  status(w) { return w.result; },
  end(w) { return w.result || { lose: true, msg: `The program stopped after ${w.eaten} of ${w.need} dots. Try a Forever loop!` }; },

  hud(w) {
    return [
      { icon: '🟡', val: `${w.eaten}/${w.need}`, lbl: 'Dots', color: '#fde047' },
      { icon: '⚡', val: w.powerT > 0 ? `${Math.ceil(w.powerT)}s` : '—', lbl: 'Power', color: w.powerT > 0 ? '#60a5fa' : '#cbd5e1' },
      { icon: '❤️', val: `${w.lives}`, lbl: 'Lives', color: '#f87171' },
    ];
  },
  progress(w) { return { current: w.eaten, target: w.need, label: 'dots gobbled', pct: Math.round((w.eaten / w.need) * 100) }; },
};
export { pathCells, perfectMaze, noDeadEnds, ring };
