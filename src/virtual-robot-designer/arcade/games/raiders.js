/**
 * Space Raiders — the classic space shoot-'em-up, kid style. The raider fleet
 * marches side to side and creeps down; your robot ship zaps them from below,
 * dodges slime drops and hides behind shields.
 */
import { createArcadeExpansion } from '../expanded-levels.js';

export const RW = 640, RH = 480;
export const SHIP_Y = 440;
const STEP_PX = 6;
const ALIEN_W = 34, ALIEN_H = 24, BOMB_SPEED = 150, ZAP_SPEED = 560, INVADE_Y = 392;

function mulberry(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fleet layout: rows of strings, 'A'/'B'/'C' = raider types (C takes 2 zaps). */
function fleet(rows, { top = 70, gapX = 52, gapY = 40 } = {}) {
  const out = [];
  rows.forEach((row, r) => {
    const x0 = RW / 2 - ((row.length - 1) * gapX) / 2;
    [...row].forEach((ch, c) => {
      if (ch === '.' || ch === ' ') return;
      out.push({ x: x0 + c * gapX, y: top + r * gapY, kind: ch, hp: ch === 'C' ? 2 : 1, row: r });
    });
  });
  return out;
}
// Classic arch-shaped bunker, built from small chunks that get chipped away.
const BUNKER = [
  '..########..',
  '.##########.',
  '############',
  '############',
  '############',
  '############',
  '###......###',
  '##........##',
];
export const BUNKER_CELL = 6;
const shieldsAt = (xs) => xs.flatMap((sx) => {
  const cells = [];
  BUNKER.forEach((row, j) => [...row].forEach((ch, i) => {
    if (ch === '#') cells.push({ x: sx - 36 + i * BUNKER_CELL, y: 342 + j * BUNKER_CELL, w: BUNKER_CELL, h: BUNKER_CELL, hp: 1 });
  }));
  return cells;
});

const BRAIN = 'Forever → If raider above → Zap. Else → If raider is left → Move left, Else → Move right.';
const DODGE = 'Check "slime above" FIRST and move out of the way. Then zap or chase the raiders.';

const LEVELS = [
  { title: 'Target practice', goal: 'Three sleepy raiders are stacked right above you. Zap them!', hint: 'Repeat 3 → Zap.', par: 2,
    raiders: () => fleet(['A', 'A', 'A']), march: 0, drop: 0, bombs: 0, palette: ['zap', 'move_left', 'move_right', 'repeat'],
    starter: [['zap']] },
  { title: 'Line them up', goal: 'Five raiders in a row. Move under each one and zap!', hint: BRAIN, par: 7,
    raiders: () => fleet(['AAAAA']), march: 0, drop: 0, bombs: 0, palette: ['zap', 'move_left', 'move_right', 'forever', 'if', 'else'],
    starter: [['forever'], ['if', 1, { cond: 'raider_above' }], ['zap', 2]] },
  { title: 'The march', goal: 'The raiders march side to side. Track them and zap!', hint: BRAIN, par: 7,
    raiders: () => fleet(['AAAAAA']), march: 40, drop: 12, bombs: 0, palette: ['zap', 'move_left', 'move_right', 'forever', 'if', 'else'] },
  { title: 'Two waves', goal: 'Two rows of raiders. Clear them before they land!', hint: BRAIN, par: 7,
    raiders: () => fleet(['BBBBBB', 'AAAAAA']), march: 45, drop: 14, bombs: 0, palette: ['zap', 'move_left', 'move_right', 'forever', 'if', 'else'] },
  { title: 'Slime drops!', goal: 'Raiders drop green slime. Dodge it — you have 3 lives.', hint: DODGE, par: 10,
    raiders: () => fleet(['BBBBB', 'AAAAA']), march: 45, drop: 14, bombs: 0.5, palette: ['zap', 'move_left', 'move_right', 'forever', 'if', 'else'] },
  { title: 'Shield wall', goal: 'Shields protect you from slime — but they block your zaps too!', hint: 'If shield above → move to a gap before zapping.', par: 14,
    raiders: () => fleet(['BBBBBB', 'AAAAAA']), shields: [140, 320, 500], march: 45, drop: 14, bombs: 0.6, palette: ['zap', 'move_left', 'move_right', 'forever', 'if', 'else'] },
  { title: 'Armoured raiders', goal: 'The pink squids wear white helmets — they need TWO zaps.', hint: 'Keep zapping while the raider is above you.', par: 14,
    raiders: () => fleet(['CCCCCC', 'BBBBBB', 'AAAAAA']), shields: [160, 480], march: 50, drop: 14, bombs: 0.55, palette: ['zap', 'move_left', 'move_right', 'forever', 'if', 'else'] },
  { title: 'Fast fleet', goal: 'This fleet marches FAST. Move 2 steps at a time!', hint: 'Bigger moves help you keep up.', par: 14,
    raiders: () => fleet(['BBBBBBB', 'AAAAAAA']), march: 70, drop: 14, bombs: 0.55, palette: ['zap', 'move_left', 'move_right', 'forever', 'if', 'else', 'repeat_until'] },
  { title: 'Mothership', goal: 'A big mothership flies across the top. Zap the fleet AND the mothership (3 zaps)!', hint: 'If mothership above → Zap! It is worth chasing.', par: 16, mothership: true,
    raiders: () => fleet(['CCCCC', 'AAAAA'], { top: 110 }), shields: [140, 320, 500], march: 50, drop: 14, bombs: 0.7,
    palette: ['zap', 'move_left', 'move_right', 'forever', 'if', 'else', 'repeat_until'] },
  { title: 'Final invasion', goal: 'The whole fleet plus the mothership. Save the planet!', hint: 'Dodge first, mothership second, raiders third.', par: 16, mothership: true,
    raiders: () => fleet(['CCCCCCC', 'BBBBBBB', 'AAAAAAA'], { top: 110 }), shields: [120, 320, 520], march: 55, drop: 14, bombs: 0.7,
    palette: ['zap', 'move_left', 'move_right', 'forever', 'if', 'else', 'repeat', 'repeat_until', 'wait'] },
];
LEVELS.push(...createArcadeExpansion({ id: 'raiderbot', title: 'Space Raiders', emoji: '👾', color: '#a855f7', levels: LEVELS }));

const alive = (w) => w.raiders.filter((a) => a.hp > 0);
const hit = (ax, ay, aw, ah, x, y) => x > ax - aw / 2 && x < ax + aw / 2 && y > ay - ah / 2 && y < ay + ah / 2;

export const raiders = {
  id: 'raiderbot',
  title: 'Space Raiders',
  emoji: '👾',
  color: '#22c55e',
  blurb: 'Zap the marching raider fleet before it lands — dodge the slime and use your shields!',
  size: [RW, RH],
  conditions: [
    { id: 'raider_above', label: 'raider above' },
    { id: 'raider_left', label: 'nearest raider is left' },
    { id: 'raider_right', label: 'nearest raider is right' },
    { id: 'slime_above', label: 'slime above' },
    { id: 'slime_left', label: 'slime on my left' },
    { id: 'shield_above', label: 'shield above' },
    { id: 'mothership_above', label: 'mothership above' },
    { id: 'zap_ready', label: 'zap is ready' },
  ],
  blocks: {
    zap: { label: 'Zap!', icon: '⚡', color: '#ef4444', cat: 'Move' },
    move_left: { label: 'Move left', icon: '⬅️', color: '#3b82f6', cat: 'Move', params: [{ key: 'steps', label: 'steps', type: 'num', min: 1, max: 20, default: 1 }] },
    move_right: { label: 'Move right', icon: '➡️', color: '#3b82f6', cat: 'Move', params: [{ key: 'steps', label: 'steps', type: 'num', min: 1, max: 20, default: 1 }] },
  },
  levels: LEVELS,

  init(levelIdx) {
    const L = LEVELS[levelIdx];
    const list = L.raiders().map((a, i) => ({ ...a, id: i, home: a.x }));
    return {
      level: levelIdx,
      t: 0,
      ship: { x: RW / 2 },
      raiders: list,
      total: list.length + (L.mothership ? 1 : 0),
      dir: 1,
      frame: 0,
      stepAcc: 0,
      march: L.march,
      drop: L.drop,
      bombRate: L.bombs,
      zaps: [],
      cool: 0,
      bombs: [],
      shields: shieldsAt(L.shields || []),
      mother: L.mothership ? { x: -60, hp: 3, alive: true, dir: 1, wait: 2 } : null,
      lives: 3,
      safeT: 0,
      zapped: 0,
      pops: [],
      rnd: mulberry(500 + levelIdx),
      cmd: null,
      result: null,
    };
  },

  start(w, action) {
    const c = { ...action, t: 0, dur: 0 };
    if (action.type === 'zap') {
      // Zap waits for the short cooldown, so "Repeat 3 → Zap" fires three zaps.
      c.dur = 0.06;
      c.pending = true;
    } else if (action.type === 'move_left' || action.type === 'move_right') {
      const steps = Math.max(1, Number(action.params?.steps) || 1);
      c.dur = 0.05 * steps;
      c.from = w.ship.x;
      c.to = Math.max(24, Math.min(RW - 24, w.ship.x + (action.type === 'move_left' ? -20 : 20) * steps));
    }
    w.cmd = c;
  },

  tick(w, dt) {
    if (w.result) return;
    w.t += dt;
    w.cool = Math.max(0, w.cool - dt);
    w.safeT = Math.max(0, w.safeT - dt);
    const c = w.cmd;
    if (c && c.pending) {
      if (w.cool <= 0) { w.zaps.push({ x: w.ship.x, y: SHIP_Y - 18 }); w.cool = 0.32; c.pending = false; c.t = 0; }
    } else if (c && !c.done) {
      c.t += dt;
      if (c.from != null) w.ship.x = c.from + (c.to - c.from) * Math.min(1, c.t / c.dur);
      if (c.t >= c.dur) c.done = true;
    }
    w.pops.forEach((q) => { q.life -= dt; });
    w.pops = w.pops.filter((q) => q.life > 0);

    // Fleet march — in little steps like the arcade game, faster as it shrinks
    const live = alive(w);
    if (w.march > 0 && live.length) {
      const speed = w.march * (1 + (1 - live.length / Math.max(1, w.raiders.length)) * 1.4);
      w.stepAcc += dt;
      const interval = STEP_PX / speed;
      while (w.stepAcc >= interval) {
        w.stepAcc -= interval;
        w.frame ^= 1;
        const minX = Math.min(...live.map((a) => a.x)), maxX = Math.max(...live.map((a) => a.x));
        if ((w.dir > 0 && maxX + ALIEN_W / 2 + STEP_PX > RW - 10) || (w.dir < 0 && minX - ALIEN_W / 2 - STEP_PX < 10)) {
          w.dir *= -1;
          live.forEach((a) => { a.y += w.drop; });
        } else live.forEach((a) => { a.x += w.dir * STEP_PX; });
      }
    } else if (live.length) {
      w.stepAcc += dt;
      if (w.stepAcc > 0.6) { w.stepAcc = 0; w.frame ^= 1; }
    }
    // Mothership flies across the top, again and again
    const m = w.mother;
    if (m?.alive) {
      if (m.wait > 0) m.wait -= dt;
      else {
        m.x += m.dir * 110 * dt;
        if (m.x > RW + 60 || m.x < -60) { m.dir *= -1; m.wait = 1.5; }
      }
    }
    // Slime drops from the lowest raider in a random column
    if (w.bombRate > 0 && live.length && w.rnd() < w.bombRate * dt) {
      const shooter = live[Math.floor(w.rnd() * live.length)];
      const lowest = live.filter((a) => Math.abs(a.x - shooter.x) < 10).reduce((p, a) => (a.y > p.y ? a : p), shooter);
      w.bombs.push({ x: lowest.x, y: lowest.y + 14 });
    }
    // Zaps
    w.zaps.forEach((z) => { z.y -= ZAP_SPEED * dt; });
    w.zaps = w.zaps.filter((z) => {
      const sh = w.shields.find((q) => q.hp > 0 && z.x > q.x && z.x < q.x + q.w && z.y > q.y && z.y < q.y + q.h);
      if (sh) { sh.hp--; return false; }
      const target = alive(w).find((a) => hit(a.x, a.y, ALIEN_W, ALIEN_H, z.x, z.y));
      if (target) {
        target.hp--;
        if (target.hp <= 0) { w.zapped++; w.pops.push({ x: target.x, y: target.y, life: 0.5, kind: target.kind }); }
        return false;
      }
      if (m?.alive && m.wait <= 0 && hit(m.x, 46, 70, 26, z.x, z.y)) {
        m.hp--;
        if (m.hp <= 0) { m.alive = false; w.zapped++; w.pops.push({ x: m.x, y: 46, life: 0.8, kind: 'M' }); }
        return false;
      }
      return z.y > 0;
    });
    // Bombs
    w.bombs.forEach((b) => { b.y += BOMB_SPEED * dt; });
    w.bombs = w.bombs.filter((b) => {
      const sh = w.shields.find((s) => s.hp > 0 && b.x > s.x && b.x < s.x + s.w && b.y > s.y && b.y < s.y + s.h);
      if (sh) { sh.hp--; return false; }
      if (b.y > SHIP_Y - 10 && b.y < SHIP_Y + 10 && Math.abs(b.x - w.ship.x) < 18) {
        if (w.safeT <= 0) {
          w.lives--;
          w.safeT = 2;
          w.pops.push({ x: w.ship.x, y: SHIP_Y, life: 0.8, kind: 'hit' });
          if (w.lives <= 0) w.result = { lose: true, msg: 'Slimed three times! Check "slime above" first and move out of the way.' };
        }
        return false;
      }
      return b.y < RH + 10;
    });
    if (w.result) return;
    const left = alive(w).length + (m?.alive ? 1 : 0);
    if (left === 0) w.result = { win: true, msg: `Fleet cleared — all ${w.total} zapped! The planet is safe.` };
    else if (alive(w).some((a) => a.y + ALIEN_H / 2 >= INVADE_Y)) w.result = { lose: true, msg: 'The raiders landed! Zap them faster — follow the nearest raider.' };
    else if (w.t > 240) w.result = { lose: true, msg: `Time up — ${left} raider${left === 1 ? '' : 's'} left.` };
  },

  sense(w, cond) {
    const sx = w.ship.x;
    const live = alive(w);
    const nearest = live.reduce((p, a) => (!p || Math.abs(a.x - sx) < Math.abs(p.x - sx) ? a : p), null);
    switch (cond) {
      case 'raider_above': return live.some((a) => Math.abs(a.x - sx) < ALIEN_W / 2 - 2);
      case 'raider_left': return !!nearest && nearest.x < sx - 4;
      case 'raider_right': return !!nearest && nearest.x > sx + 4;
      case 'slime_above': return w.bombs.some((b) => Math.abs(b.x - sx) < 46 && b.y > 230);
      case 'slime_left': return w.bombs.some((b) => b.x < sx && sx - b.x < 70 && b.y > 230);
      case 'shield_above': return w.shields.some((s) => s.hp > 0 && sx > s.x - 2 && sx < s.x + s.w + 2);
      case 'mothership_above': return !!w.mother?.alive && w.mother.wait <= 0 && Math.abs(w.mother.x - sx) < 70;
      case 'zap_ready': return w.cool <= 0;
      default: return false;
    }
  },

  status(w) { return w.result; },
  end() { return null; },

  hud(w) {
    const left = alive(w).length + (w.mother?.alive ? 1 : 0);
    return [
      { icon: '👾', val: `${left}`, lbl: 'Raiders left', color: '#c4b5fd' },
      { icon: '❤️', val: `${w.lives}`, lbl: 'Lives', color: '#f87171' },
      { icon: '⚡', val: w.cool > 0 ? '…' : 'READY', lbl: 'Zap', color: '#fde047' },
    ];
  },
  progress(w) { return { current: w.zapped, target: w.total, label: 'raiders zapped', pct: Math.round((w.zapped / w.total) * 100) }; },
};

export const RAIDER_CONSTS = { ALIEN_W, ALIEN_H, SHIP_Y };
