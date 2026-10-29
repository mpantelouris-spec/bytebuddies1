/**
 * Snake Bot — code a robot snake to eat apples without crashing.
 * Teaches algorithms: look ahead, choose a turn, repeat forever.
 */
import { roundRect, shade } from '../engine.js';
import { createArcadeExpansion } from '../expanded-levels.js';

const COLS = 20, ROWS = 15, CELL = 32, W = COLS * CELL, H = ROWS * CELL;
// Directions: 0 right, 1 down, 2 left, 3 up
const DX = [1, 0, -1, 0], DY = [0, 1, 0, -1];

const box = (x0, y0, x1, y1) => {
  const out = [];
  for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) out.push([x, y]);
  return out;
};

const LEVELS = [
  { title: 'Snack time', goal: 'An apple sits straight ahead. Move forward until you eat it!', hint: 'Repeat → Move forward. How many squares away is it?', par: 2,
    apples: [[12, 7]], need: 1, walls: [], palette: ['move', 'turn_left', 'turn_right', 'repeat'], starter: [['repeat', 0, { times: 3 }], ['move', 1]] },
  { title: 'Round the corner', goal: 'This apple is round a corner. Plan your moves!', hint: 'Move forward, turn, then move again.', par: 5,
    apples: [[11, 3]], need: 1, walls: [], palette: ['move', 'turn_left', 'turn_right', 'repeat'] },
  { title: 'Three in a row', goal: 'Eat all 3 apples. A new one appears after each snack.', hint: 'Count the squares: move, turn, move, turn, move.', par: 7,
    apples: [[10, 7], [10, 3], [16, 3]], need: 3, walls: [], palette: ['move', 'turn_left', 'turn_right', 'repeat', 'repeat_until'] },
  { title: 'Snake brain', goal: 'Let the snake decide! If food is left, turn left; if right, turn right. Eat 5 apples.', hint: 'Forever → If food left → Turn left. If food right → Turn right. Move forward.', par: 6,
    apples: [[14, 3], [4, 4], [6, 12], [16, 12], [10, 2]], need: 5, walls: [], palette: ['move', 'turn_left', 'turn_right', 'forever', 'if', 'else'],
    starter: [['forever'], ['if', 1, { cond: 'food_left' }], ['turn_left', 2], ['move', 1]] },
  { title: 'Watch the wall', goal: 'Apples near the edges. Never hit a wall! Eat 5.', hint: 'Check "wall ahead" first and turn away from it.', par: 9,
    apples: [[18, 1], [1, 13], [18, 13], [1, 1], [10, 7]], need: 5, walls: [], palette: ['move', 'turn_left', 'turn_right', 'forever', 'if', 'else'] },
  { title: 'Rocks!', goal: 'Rocks block the way. Steer round them and eat 5 apples.', hint: 'Wall ahead counts rocks too. Check left and right before you turn.', par: 10,
    apples: [[15, 7], [4, 3], [15, 12], [4, 12], [10, 2]], need: 5, walls: [...box(9, 5, 9, 9), ...box(12, 2, 13, 2), ...box(6, 11, 7, 11)], palette: ['move', 'turn_left', 'turn_right', 'forever', 'if', 'else'] },
  { title: 'Growing up', goal: 'Every apple makes you longer — don\'t bite your own tail! Eat 8.', hint: '"Wall ahead" also spots your own body.', par: 10,
    apples: [[15, 7], [15, 2], [3, 2], [3, 12], [17, 12], [10, 10], [6, 6], [14, 4]], need: 8, walls: [], palette: ['move', 'turn_left', 'turn_right', 'forever', 'if', 'else', 'repeat_until'] },
  { title: 'Rock garden', goal: 'Rocks everywhere! Weave between them and eat 6 apples.', hint: 'If wall ahead: turn towards the side that is clear. Then chase the food.', par: 12,
    apples: [[17, 2], [2, 12], [17, 12], [10, 1], [10, 13], [3, 3]], need: 6,
    walls: [[9, 3], [13, 5], [4, 6], [15, 9], [8, 10], [11, 12], [5, 13], [17, 6], [2, 9], [12, 1]],
    palette: ['move', 'turn_left', 'turn_right', 'forever', 'if', 'else', 'repeat_until'] },
  { title: 'Speedy snake', goal: 'Eat 10 apples. The snake is getting long!', hint: 'Good snake brains check walls on the left AND right before turning.', par: 12,
    apples: [[15, 7], [15, 2], [3, 2], [3, 12], [17, 12], [10, 10], [6, 6], [14, 4], [1, 7], [18, 7]], need: 10, walls: [...box(9, 6, 10, 8)],
    palette: ['move', 'turn_left', 'turn_right', 'forever', 'if', 'else', 'repeat_until'] },
  { title: 'Snake champion', goal: 'Rocks, maze walls and 12 apples. Build the cleverest snake brain!', hint: 'Order matters: avoid crashes first, then chase food.', par: 14,
    apples: [[16, 3], [3, 3], [3, 11], [16, 11], [10, 1], [10, 13], [6, 7], [13, 7], [1, 1], [18, 13], [18, 1], [1, 13]], need: 12,
    walls: [...box(7, 3, 7, 5), ...box(12, 9, 12, 11), ...box(9, 7, 10, 7), ...box(4, 9, 5, 9), ...box(14, 5, 15, 5)],
    palette: ['move', 'turn_left', 'turn_right', 'forever', 'if', 'else', 'repeat', 'repeat_until'] },
];
LEVELS.push(...createArcadeExpansion({ id: 'snakebot', title: 'Snake Bot', emoji: '🐍', color: '#22c55e', levels: LEVELS }));

export const snake = {
  id: 'snakebot',
  title: 'Snake Bot',
  emoji: '🐍',
  color: '#22c55e',
  blurb: 'Code a robot snake to eat every apple — without crashing into walls or its own tail.',
  size: [W, H],
  conditions: [
    { id: 'food_ahead', label: 'food is straight ahead' },
    { id: 'food_left', label: 'food is to the left' },
    { id: 'food_right', label: 'food is to the right' },
    { id: 'wall_ahead', label: 'wall ahead' },
    { id: 'wall_left', label: 'wall on the left' },
    { id: 'wall_right', label: 'wall on the right' },
  ],
  blocks: {
    move: { label: 'Move forward', icon: '⬆️', color: '#22c55e', cat: 'Move' },
    turn_left: { label: 'Turn left', icon: '↩️', color: '#0ea5e9', cat: 'Move' },
    turn_right: { label: 'Turn right', icon: '↪️', color: '#0ea5e9', cat: 'Move' },
  },
  levels: LEVELS,

  init(levelIdx) {
    const L = LEVELS[levelIdx];
    const walls = new Set(L.walls.map(([x, y]) => `${x},${y}`));
    return {
      level: levelIdx,
      t: 0,
      body: [[6, 7], [5, 7], [4, 7]],
      dir: 0,
      grow: 0,
      apples: L.apples.slice(),
      eaten: 0,
      need: L.need,
      walls,
      moves: 0,
      cmd: null,
      anim: 1,
      prevBody: null,
      result: null,
      pop: [],
    };
  },

  start(w, action) {
    const c = { ...action, t: 0, dur: 0.16 };
    if (action.type === 'turn_left') { w.dir = (w.dir + 3) % 4; c.dur = 0.06; }
    else if (action.type === 'turn_right') { w.dir = (w.dir + 1) % 4; c.dur = 0.06; }
    else if (action.type === 'move') {
      const [hx, hy] = w.body[0];
      const nx = hx + DX[w.dir], ny = hy + DY[w.dir];
      w.prevBody = w.body.map((p) => p.slice());
      if (blocked(w, nx, ny, true)) {
        w.result = { lose: true, msg: nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS ? 'Bonk! The snake hit the wall. Check "wall ahead" before moving.' : w.walls.has(`${nx},${ny}`) ? 'Bonk! The snake hit a rock.' : 'Ouch! The snake bit its own tail.' };
      } else {
        w.body.unshift([nx, ny]);
        const ap = w.apples[0];
        if (ap && ap[0] === nx && ap[1] === ny) {
          w.eaten++;
          w.grow += 2;
          w.apples.shift();
          w.pop.push({ x: nx, y: ny, life: 0.5 });
          if (w.eaten >= w.need) w.result = { win: true, msg: `Yum! ${w.eaten} apple${w.eaten === 1 ? '' : 's'} eaten — clever snake!` };
        }
        if (w.grow > 0) w.grow--; else w.body.pop();
        w.moves++;
        w.anim = 0;
        if (w.moves > 1500 && !w.result) w.result = { lose: true, msg: 'The snake went round and round but stopped finding apples. Chase the food!' };
      }
    } else c.dur = 0;
    w.cmd = c;
  },

  tick(w, dt) {
    w.t += dt;
    w.anim = Math.min(1, w.anim + dt / 0.16);
    w.pop.forEach((p) => { p.life -= dt; });
    w.pop = w.pop.filter((p) => p.life > 0);
    const c = w.cmd;
    if (c && !c.done) { c.t += dt; if (c.t >= c.dur) c.done = true; }
  },

  sense(w, cond) {
    const [hx, hy] = w.body[0];
    const look = (d) => blocked(w, hx + DX[d], hy + DY[d], false);
    const ap = w.apples[0];
    let f = 0, l = 0;
    if (ap) {
      const vx = ap[0] - hx, vy = ap[1] - hy;
      f = vx * DX[w.dir] + vy * DY[w.dir];
      // left of heading (screen y points down)
      l = vx * DY[w.dir] - vy * DX[w.dir];
    }
    switch (cond) {
      case 'food_ahead': return !!ap && l === 0 && f > 0;
      case 'food_left': return !!ap && l > 0;
      case 'food_right': return !!ap && l < 0;
      case 'wall_ahead': return look(w.dir);
      case 'wall_left': return look((w.dir + 3) % 4);
      case 'wall_right': return look((w.dir + 1) % 4);
      default: return false;
    }
  },

  hud(w) {
    return [
      { icon: '🍎', val: `${w.eaten}/${w.need}`, lbl: 'Apples', color: '#f87171' },
      { icon: '🐍', val: `${w.body.length}`, lbl: 'Length', color: '#4ade80' },
      { icon: '👣', val: `${w.moves}`, lbl: 'Moves', color: '#93c5fd' },
    ];
  },
  progress(w) {
    return { current: w.eaten, target: w.need, label: 'apples eaten', pct: Math.round((w.eaten / w.need) * 100) };
  },
  status(w) { return w.result; },
  end(w) { return w.result || { lose: true, msg: `The program stopped after ${w.eaten} of ${w.need} apples. Try a Forever loop!` }; },

  draw(ctx, w, look) {
    for (let x = 0; x < COLS; x++) for (let y = 0; y < ROWS; y++) {
      ctx.fillStyle = (x + y) % 2 ? '#a3d977' : '#aee084';
      ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
    }
    w.walls.forEach((k) => {
      const [x, y] = k.split(',').map(Number);
      ctx.fillStyle = '#78716c'; roundRect(ctx, x * CELL + 2, y * CELL + 3, CELL - 4, CELL - 5, 8); ctx.fill();
      ctx.fillStyle = '#a8a29e'; roundRect(ctx, x * CELL + 6, y * CELL + 6, CELL - 14, CELL - 16, 6); ctx.fill();
    });
    const ap = w.apples[0];
    if (ap) {
      const cx = ap[0] * CELL + CELL / 2, cy = ap[1] * CELL + CELL / 2 + 2;
      const bob = Math.sin(w.t * 5) * 1.5;
      ctx.fillStyle = '#dc2626'; ctx.beginPath(); ctx.arc(cx, cy + bob, 11, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.arc(cx - 4, cy - 4 + bob, 3.5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#78350f'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, cy - 9 + bob); ctx.lineTo(cx + 2, cy - 15 + bob); ctx.stroke();
      ctx.fillStyle = '#16a34a'; ctx.beginPath(); ctx.ellipse(cx + 6, cy - 13 + bob, 5, 2.6, -0.5, 0, Math.PI * 2); ctx.fill();
    }
    // body (interpolate for smooth sliding)
    const k = w.anim;
    const prev = w.prevBody || w.body;
    const pos = (i) => {
      const cur = w.body[i], old = prev[Math.min(i, prev.length - 1)] || cur;
      const from = i === 0 ? prev[0] || cur : old;
      return [(from[0] + (cur[0] - from[0]) * k) * CELL + CELL / 2, (from[1] + (cur[1] - from[1]) * k) * CELL + CELL / 2];
    };
    for (let i = w.body.length - 1; i >= 0; i--) {
      const [x, y] = pos(i);
      const t = i / Math.max(1, w.body.length - 1);
      ctx.fillStyle = i % 2 ? shade(look.primary, -0.12 - t * 0.1) : shade(look.primary, -t * 0.1);
      ctx.beginPath(); ctx.arc(x, y, CELL * (0.46 - t * 0.12), 0, Math.PI * 2); ctx.fill();
      if (i > 0) { ctx.fillStyle = look.accent; ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2); ctx.fill(); }
    }
    const [hx, hy] = pos(0);
    ctx.save(); ctx.translate(hx, hy); ctx.rotate([0, Math.PI / 2, Math.PI, -Math.PI / 2][w.dir]);
    ctx.fillStyle = '#0f172a'; roundRect(ctx, 1, -10, 11, 20, 5); ctx.fill();
    ctx.fillStyle = look.led || '#5eead4';
    ctx.beginPath(); ctx.arc(7, -5, 2.6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(7, 5, 2.6, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#475569'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-2, -10); ctx.lineTo(-6, -17); ctx.stroke();
    ctx.fillStyle = '#facc15'; ctx.beginPath(); ctx.arc(-6, -17, 3, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    w.pop.forEach((p) => {
      ctx.fillStyle = `rgba(250,204,21,${p.life * 2})`;
      ctx.font = '800 18px system-ui, sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('+1 🍎', p.x * CELL + CELL / 2, p.y * CELL - (0.5 - p.life) * 40);
    });
    ctx.fillStyle = 'rgba(15,23,42,0.8)'; roundRect(ctx, 8, 8, 150, 30, 10); ctx.fill();
    ctx.font = '800 15px system-ui, sans-serif'; ctx.fillStyle = '#fff'; ctx.textAlign = 'left';
    ctx.fillText(`🍎 ${w.eaten} / ${w.need}   🐍 ${w.body.length}`, 18, 29);
  },
};

function blocked(w, x, y, moving) {
  if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return true;
  if (w.walls.has(`${x},${y}`)) return true;
  // The tail moves out of the way this turn unless we are growing.
  const body = moving && w.grow === 0 ? w.body.slice(0, -1) : w.body;
  return body.some(([bx, by]) => bx === x && by === y);
}
