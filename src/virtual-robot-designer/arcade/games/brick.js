/**
 * Brick Bot — Breakout! Code the paddle robot to keep the ball bouncing and
 * smash every brick. Teaches sensors and fast If/Else loops.
 */
import { createArcadeExpansion } from '../expanded-levels.js';

export const BW = 640, BH = 480;
const PADDLE_Y = 440, PADDLE_H = 16, BALL_R = 8;
const D2R = Math.PI / 180;

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7'];

/** Brick layout helper: rows of strings. '#'=brick, 'M'=metal (2 hits), 'S'=steel (unbreakable), '*'=brick that drops a star. */
function layout(rows, { top = 60, w = 56, h = 22, gap = 4 } = {}) {
  const out = [];
  rows.forEach((row, r) => {
    const cols = row.length;
    const x0 = (BW - (cols * w + (cols - 1) * gap)) / 2;
    [...row].forEach((ch, c) => {
      if (ch === ' ' || ch === '.') return;
      out.push({
        x: x0 + c * (w + gap), y: top + r * (h + gap), w, h,
        hp: ch === 'M' ? 2 : ch === 'S' ? Infinity : 1,
        kind: ch === 'M' ? 'metal' : ch === 'S' ? 'steel' : 'brick',
        star: ch === '*',
        color: COLORS[r % COLORS.length],
      });
    });
  });
  return out;
}
const column = (cx, n, top = 60) => Array.from({ length: n }, (_, i) => ({ x: cx - 28, y: top + i * 26, w: 56, h: 22, hp: 1, kind: 'brick', star: false, color: COLORS[i % COLORS.length] }));

const FOLLOW = 'Forever → If ball is left → Move left. Else → If ball is right → Move right.';

const LEVELS = [
  { title: 'First serve', goal: 'Serve the ball straight up and smash the tower of bricks!', hint: 'One "Serve ball" block is all you need.', par: 1,
    bricks: () => column(BW / 2, 4), paddle: 100, speed: 240, serve: 0, palette: ['serve', 'move_left', 'move_right'], starter: [] },
  { title: 'Line it up', goal: 'The tower is to the right. Move under it, then serve.', hint: 'Move right a few steps, then Serve ball.', par: 2,
    bricks: () => column(BW / 2 + 120, 4), paddle: 100, speed: 240, serve: 0, palette: ['serve', 'move_left', 'move_right'] },
  { title: 'Follow that ball', goal: 'The ball bounces at an angle now. Use the sensors to follow it!', hint: FOLLOW, par: 7,
    bricks: () => layout(['##########']), paddle: 100, speed: 240, serve: 30, palette: ['serve', 'move_left', 'move_right', 'forever', 'if', 'else'],
    starter: [['serve'], ['forever'], ['if', 1, { cond: 'ball_left' }], ['move_left', 2]] },
  { title: 'Rainbow wall', goal: 'Three rows of bricks and a smaller paddle.', hint: FOLLOW, par: 7,
    bricks: () => layout(['##########', '##########', '##########']), paddle: 90, speed: 260, serve: 30, palette: ['serve', 'move_left', 'move_right', 'forever', 'if', 'else'] },
  { title: 'Metal bricks', goal: 'Grey metal bricks need TWO hits.', hint: 'Same follow code — just keep the ball alive!', par: 7,
    bricks: () => layout(['MMMMMMMMMM', '##########', '#M#M##M#M#']), paddle: 90, speed: 270, serve: -30, palette: ['serve', 'move_left', 'move_right', 'forever', 'if', 'else'] },
  { title: 'Sliding bricks', goal: 'The top row slides from side to side!', hint: 'Your follow code still works. Can you make it faster?', par: 7,
    bricks: () => layout(['######', '##########', '##########'], { top: 60 }), slide: [0], paddle: 86, speed: 280, serve: 30, palette: ['serve', 'move_left', 'move_right', 'forever', 'if', 'else'] },
  { title: 'Catch the stars', goal: 'Gold bricks drop stars. Catch 3 stars AND clear the bricks!', hint: 'If a star is falling → (If the ball is close → follow the ball, Else → follow the star). Else → follow the ball.', par: 16, starsNeed: 3,
    bricks: () => layout(['#*######*#', '####*#####', '###*##*###']), paddle: 96, speed: 260, serve: 30,
    palette: ['serve', 'move_left', 'move_right', 'forever', 'if', 'else'] },
  { title: 'Speed ball', goal: 'The ball is FAST now. Big moves help!', hint: 'Try "Move left 2 steps" so the paddle keeps up.', par: 7,
    bricks: () => layout(['##########', '##########', '##########']), paddle: 86, speed: 360, serve: -35, palette: ['serve', 'move_left', 'move_right', 'forever', 'if', 'else'] },
  { title: 'Steel bumpers', goal: 'Steel blocks can\'t break — they bounce the ball in surprising ways.', hint: 'Keep following the ball. Watch it ping off the steel!', par: 7,
    bricks: () => layout(['##########', 'S###SS###S', '##M####M##', '##########']), paddle: 86, speed: 300, serve: 30, palette: ['serve', 'move_left', 'move_right', 'forever', 'if', 'else', 'repeat_until'] },
  { title: 'Boss wall', goal: 'Metal, steel, sliding rows and stars. Clear the boss wall and catch 2 stars!', hint: 'Star falling? Follow it — unless the ball is close, then save the ball first!', par: 16, starsNeed: 2,
    bricks: () => layout(['MMMMMMMMMM', '#*##SS##*#', '##########', '#M##*###M#']), slide: [0], paddle: 86, speed: 300, serve: -30,
    palette: ['serve', 'move_left', 'move_right', 'forever', 'if', 'else', 'repeat_until', 'wait'] },
];
LEVELS.push(...createArcadeExpansion({ id: 'brickbot', title: 'Brick Bot', emoji: '🧱', color: '#f97316', levels: LEVELS }));

function resetBall(w) {
  w.ball = { x: w.paddle.x, y: PADDLE_Y - BALL_R - 1, vx: 0, vy: 0, live: false };
}

function launch(w) {
  if (w.ball.live) return;
  const L = LEVELS[w.level];
  const ang = (w.serves % 2 === 0 ? L.serve : -L.serve) * D2R;
  w.serves++;
  w.ball.vx = Math.sin(ang) * w.speed;
  w.ball.vy = -Math.cos(ang) * w.speed;
  w.ball.live = true;
}

function hitRect(b, r) {
  const cx = Math.max(r.x, Math.min(b.x, r.x + r.w));
  const cy = Math.max(r.y, Math.min(b.y, r.y + r.h));
  return (b.x - cx) ** 2 + (b.y - cy) ** 2 <= BALL_R * BALL_R;
}

export const brick = {
  id: 'brickbot',
  title: 'Brick Bot',
  emoji: '🧱',
  color: '#f97316',
  blurb: 'Breakout! Keep the ball bouncing with your paddle robot and smash every brick.',
  size: [BW, BH],
  conditions: [
    { id: 'ball_left', label: 'ball is left' },
    { id: 'ball_right', label: 'ball is right' },
    { id: 'ball_falling', label: 'ball is falling' },
    { id: 'ball_close', label: 'ball is falling close' },
    { id: 'star_falling', label: 'a star is falling' },
    { id: 'star_left', label: 'star is left' },
    { id: 'star_right', label: 'star is right' },
  ],
  blocks: {
    serve: { label: 'Serve ball', icon: '🏐', color: '#ef4444', cat: 'Move' },
    move_left: { label: 'Move left', icon: '⬅️', color: '#3b82f6', cat: 'Move', params: [{ key: 'steps', label: 'steps', type: 'num', min: 1, max: 20, default: 1 }] },
    move_right: { label: 'Move right', icon: '➡️', color: '#3b82f6', cat: 'Move', params: [{ key: 'steps', label: 'steps', type: 'num', min: 1, max: 20, default: 1 }] },
  },
  levels: LEVELS,

  init(levelIdx) {
    const L = LEVELS[levelIdx];
    const w = {
      level: levelIdx,
      t: 0,
      bricks: L.bricks().map((b, i) => ({ ...b, id: i, x0: b.x, row: Math.round((b.y - 60) / 26) })),
      paddle: { x: BW / 2, w: L.paddle, target: BW / 2 },
      speed: L.speed,
      serves: 0,
      lives: 3,
      stars: [],
      caught: 0,
      starsNeed: L.starsNeed || 0,
      slideRows: L.slide || [],
      respawnT: 0,
      bounces: 0,
      pops: [],
      cmd: null,
      result: null,
    };
    resetBall(w);
    w.breakable = w.bricks.filter((b) => b.kind !== 'steel').length;
    return w;
  },

  start(w, action) {
    const c = { ...action, t: 0, dur: 0 };
    if (action.type === 'serve') { launch(w); c.dur = 0.05; }
    else if (action.type === 'move_left' || action.type === 'move_right') {
      const steps = Math.max(1, Number(action.params?.steps) || 1);
      c.dur = 0.05 * steps;
      c.from = w.paddle.x;
      c.to = Math.max(w.paddle.w / 2, Math.min(BW - w.paddle.w / 2, w.paddle.x + (action.type === 'move_left' ? -1 : 1) * 20 * steps));
    }
    w.cmd = c;
  },

  tick(w, dt) {
    if (w.result) return;
    w.t += dt;
    const c = w.cmd;
    if (c && !c.done) {
      c.t += dt;
      if (c.from != null) w.paddle.x = c.from + (c.to - c.from) * Math.min(1, c.t / c.dur);
      if (c.t >= c.dur) c.done = true;
    }
    w.pops.forEach((q) => { q.life -= dt; });
    w.pops = w.pops.filter((q) => q.life > 0);

    // Sliding rows
    w.bricks.forEach((b) => {
      if (w.slideRows.includes(b.row)) b.x = b.x0 + Math.sin(w.t * 0.9) * 90;
    });

    const ball = w.ball;
    if (!ball.live) {
      ball.x = w.paddle.x;
      ball.y = PADDLE_Y - BALL_R - 1;
      if (w.respawnT > 0) { w.respawnT -= dt; if (w.respawnT <= 0) launch(w); }
    } else {
      const steps = 4;
      for (let s = 0; s < steps; s++) {
        const h = dt / steps;
        ball.x += ball.vx * h; ball.y += ball.vy * h;
        if (ball.x < BALL_R) { ball.x = BALL_R; ball.vx = Math.abs(ball.vx); }
        if (ball.x > BW - BALL_R) { ball.x = BW - BALL_R; ball.vx = -Math.abs(ball.vx); }
        if (ball.y < BALL_R) { ball.y = BALL_R; ball.vy = Math.abs(ball.vy); }
        // Bricks
        for (const b of w.bricks) {
          if (b.hp <= 0 || !hitRect(ball, b)) continue;
          const overX = Math.min(ball.x + BALL_R - b.x, b.x + b.w - (ball.x - BALL_R));
          const overY = Math.min(ball.y + BALL_R - b.y, b.y + b.h - (ball.y - BALL_R));
          if (overX < overY) { ball.vx = ball.x < b.x + b.w / 2 ? -Math.abs(ball.vx) : Math.abs(ball.vx); }
          else { ball.vy = ball.y < b.y + b.h / 2 ? -Math.abs(ball.vy) : Math.abs(ball.vy); }
          if (b.kind !== 'steel') {
            b.hp--;
            if (b.hp <= 0) {
              w.pops.push({ x: b.x + b.w / 2, y: b.y + b.h / 2, life: 0.5, color: b.color });
              if (b.star) w.stars.push({ x: b.x + b.w / 2, y: b.y + b.h / 2 });
            }
          }
          break;
        }
        // Paddle
        const p = w.paddle;
        if (ball.vy > 0 && ball.y + BALL_R >= PADDLE_Y && ball.y - BALL_R <= PADDLE_Y + PADDLE_H
          && ball.x >= p.x - p.w / 2 - BALL_R && ball.x <= p.x + p.w / 2 + BALL_R) {
          const off = Math.max(-1, Math.min(1, (ball.x - p.x) / (p.w / 2)));
          let deg = off * 60;
          // Like real Breakout: never bounce straight up, or the ball gets stuck in one column.
          // Levels 1–2 are towers right above the paddle, so they keep the straight bounce.
          if (w.level >= 2 && Math.abs(deg) < 18) {
            w.flip = !w.flip;
            deg = (deg === 0 ? (w.flip ? 1 : -1) : Math.sign(deg)) * (18 + (w.bounces % 4) * 6);
          }
          const ang = deg * D2R;
          ball.vx = Math.sin(ang) * w.speed;
          ball.vy = -Math.cos(ang) * w.speed;
          ball.y = PADDLE_Y - BALL_R;
          w.bounces++;
        }
        // Never let the ball get stuck going sideways forever
        const minVy = w.speed * 0.34;
        if (Math.abs(ball.vy) < minVy) { ball.vy = Math.sign(ball.vy || -1) * minVy; ball.vx = Math.sign(ball.vx) * Math.sqrt(w.speed ** 2 - minVy ** 2); }
      }
      if (ball.y > BH + 20) {
        w.lives--;
        if (w.lives <= 0) { w.result = { lose: true, msg: 'Out of balls! Use "ball is left / right" to follow the ball with your paddle.' }; return; }
        w.pops.push({ x: w.paddle.x, y: PADDLE_Y - 30, life: 1, text: `${w.lives} ⚪ left` });
        resetBall(w);
        w.respawnT = 1.2;
      }
    }
    // Falling stars
    w.stars.forEach((s) => { s.y += 70 * dt; });
    w.stars = w.stars.filter((s) => {
      if (s.y >= PADDLE_Y - 6 && s.y <= PADDLE_Y + PADDLE_H && Math.abs(s.x - w.paddle.x) <= w.paddle.w / 2 + 14) {
        w.caught++;
        w.pops.push({ x: s.x, y: s.y - 20, life: 0.8, text: '+1 ⭐' });
        return false;
      }
      return s.y < BH + 20;
    });

    const left = w.bricks.filter((b) => b.hp > 0 && b.kind !== 'steel').length;
    const starsLeftToFall = w.bricks.some((b) => b.star && b.hp > 0) || w.stars.length > 0;
    if (left === 0 && w.caught >= w.starsNeed) w.result = { win: true, msg: `Every brick smashed${w.starsNeed ? ` and ${w.caught} stars caught` : ''}!` };
    else if (left === 0 && !starsLeftToFall) w.result = { lose: true, msg: `All bricks gone, but you only caught ${w.caught} of ${w.starsNeed} stars. Follow the stars when the ball is going up!` };
    else if (w.t > 300) w.result = { lose: true, msg: `Time up — ${left} brick${left === 1 ? '' : 's'} left.` };
  },

  sense(w, cond) {
    const b = w.ball, p = w.paddle;
    const star = w.stars.reduce((best, s) => (!best || s.y > best.y ? s : best), null);
    switch (cond) {
      case 'ball_left': return b.x < p.x - 6;
      case 'ball_right': return b.x > p.x + 6;
      case 'ball_falling': return b.live && b.vy > 0;
      case 'ball_close': return b.live && b.vy > 0 && b.y > BH * 0.55;
      case 'star_falling': return !!star;
      case 'star_left': return !!star && star.x < p.x - 6;
      case 'star_right': return !!star && star.x > p.x + 6;
      default: return false;
    }
  },

  status(w) { return w.result; },
  end(w) {
    if (w.result) return w.result;
    // Program finished: let the ball play on (it may still clear the bricks) — the time limit decides.
    return null;
  },

  hud(w) {
    const left = w.bricks.filter((b) => b.hp > 0 && b.kind !== 'steel').length;
    const out = [
      { icon: '🧱', val: `${left}`, lbl: 'Bricks left', color: '#fb923c' },
      { icon: '⚪', val: `${w.lives}`, lbl: 'Balls', color: '#e2e8f0' },
    ];
    if (w.starsNeed) out.push({ icon: '⭐', val: `${w.caught}/${w.starsNeed}`, lbl: 'Stars', color: '#fde047' });
    else out.push({ icon: '⏱', val: `${Math.floor(w.t)}s`, lbl: 'Time', color: '#93c5fd' });
    return out;
  },
  progress(w) {
    const left = w.bricks.filter((b) => b.hp > 0 && b.kind !== 'steel').length;
    const done = w.breakable - left;
    return { current: done, target: w.breakable, label: 'bricks smashed', pct: Math.round((done / Math.max(1, w.breakable)) * 100) };
  },
};

export const BRICK_CONSTS = { PADDLE_Y, PADDLE_H, BALL_R };
