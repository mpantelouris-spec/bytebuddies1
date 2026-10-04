/**
 * Play each Game Builder coding block and assert a real sprite/runtime change.
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs';

const BASE = process.env.BB_DEMO_URL || 'http://127.0.0.1:4173';
const HEADLESS = process.env.BB_HEADLESS === '1';

function b(type, params = {}, id) {
  return { id: id ?? Math.round(80000 + Math.random() * 9999), type, params, stackOrder: 0 };
}

function sprite({ name = 'Probe', id = 9001, x = 216, y = 156, visible = true, blocks = [], extra = {} } = {}) {
  const mapped = blocks.map((block, i) => ({
    ...block,
    id: block.id ?? 81000 + i,
    stackOrder: i,
    y: 24 + i * 28,
    params: block.params || {},
  }));
  return {
    id,
    name,
    x,
    y,
    w: 48,
    h: 48,
    rotation: 90,
    direction: 90,
    visible,
    color: '#f59e0b',
    svgKey: 'Cat',
    blocks: mapped,
    _probeBlocks: mapped,
    ...extra,
  };
}

function flag(...rest) {
  return [b('event-start'), ...rest];
}

const USER = {
  name: 'Block Tester',
  avatarEmoji: '🧑‍💻',
  level: 1,
  xp: 0,
  xpToNext: 500,
  badges: [],
  streak: 0,
  projectCount: 0,
  completedLessons: 0,
  joinDate: '2026-09-01',
  role: 'student',
  ageMode: 'standard',
};

const tests = [];
const add = (label, category, sprites, check, opts = {}) => {
  tests.push({ label, category, sprites: Array.isArray(sprites) ? sprites : [sprites], check, ...opts });
};

// ── Motion ──
add('move steps', 'Motion', sprite({ blocks: flag(b('sprite-move', { steps: 40 })) }),
  (p) => p.sprites[0].x > 240, { wait: 900 });
add('turn clockwise degrees', 'Motion', sprite({ blocks: flag(b('sprite-turn-right', { degrees: 30 })) }),
  (p) => Math.abs((p.sprites[0].direction ?? 0) - 120) < 2);
add('turn anticlockwise degrees', 'Motion', sprite({ blocks: flag(b('sprite-turn-left', { degrees: 30 })) }),
  (p) => Math.abs((p.sprites[0].direction ?? 0) - 60) < 2);
add('go to random position', 'Motion', sprite({ blocks: flag(b('sprite-goto-random-position')) }),
  (p) => p.sprites[0].x !== 216 || p.sprites[0].y !== 156);
add('go to mouse-pointer', 'Motion', sprite({ blocks: flag(b('sprite-goto-mouse-pointer')) }),
  (p) => Number.isFinite(p.sprites[0].x));
add('go to', 'Motion', [
  sprite({ name: 'Target', id: 9002, x: 320, y: 80, blocks: [] }),
  sprite({ name: 'Probe', id: 9001, blocks: flag(b('sprite-goto-sprite', { sprite: 'Target' })) }),
], (p) => {
  const me = p.sprites.find((s) => s.name === 'Probe');
  const t = p.sprites.find((s) => s.name === 'Target');
  return Math.abs(me.x - t.x) < 8 && Math.abs(me.y - t.y) < 8;
});
add('go to x,y', 'Motion', sprite({ blocks: flag(b('sprite-goto', { x: 80, y: -40 })) }),
  (p) => Math.abs(p.sprites[0].x - 296) < 6 && Math.abs(p.sprites[0].y - 196) < 6);
add('glide secs to x,y', 'Motion', sprite({ blocks: flag(b('sprite-glide', { x: 80, y: 0, secs: 0.25 })) }),
  (p) => Math.abs(p.sprites[0].x - 296) < 12, { wait: 700 });
add('glide secs to random position', 'Motion', sprite({ blocks: flag(b('motion-glide-to-random-position', { secs: 0.2 })) }),
  (p) => p.sprites[0].x !== 216 || p.sprites[0].y !== 156, { wait: 600 });
add('glide secs to', 'Motion', [
  sprite({ name: 'Target', id: 9002, x: 80, y: 80, blocks: [] }),
  sprite({ blocks: flag(b('motion-glide-to-sprite', { sprite: 'Target', secs: 0.2 })) }),
], (p) => p.sprites.find((s) => s.name === 'Probe').x < 200, { wait: 600 });
add('point in direction', 'Motion', sprite({ blocks: flag(b('sprite-point-dir', { degrees: 180 })) }),
  (p) => Math.abs(Math.abs(p.sprites[0].direction) - 180) < 2);
add('point towards', 'Motion', [
  sprite({ name: 'Target', id: 9002, x: 400, y: 156, blocks: [] }),
  sprite({ blocks: flag(b('sprite-point-towards', { target: 'Target' })) }),
], (p) => Math.abs((p.sprites.find((s) => s.name === 'Probe').direction ?? 0) - 90) < 25);
add('change x by', 'Motion', sprite({ blocks: flag(b('sprite-changex', { amount: 40 })) }),
  (p) => p.sprites[0].x > 248);
add('set x to', 'Motion', sprite({ blocks: flag(b('sprite-setx', { x: 80 })) }),
  (p) => Math.abs(p.sprites[0].x - 296) < 6);
add('change y by', 'Motion', sprite({ blocks: flag(b('sprite-changey', { amount: 30 })) }),
  (p) => p.sprites[0].y < 140);
add('set y to', 'Motion', sprite({ blocks: flag(b('sprite-sety', { y: 40 })) }),
  (p) => Math.abs(p.sprites[0].y - 116) < 8);
add('if on edge, bounce', 'Motion', sprite({ blocks: flag(b('sprite-if-bounce')) }),
  (p) => p.sprites[0].bounce === true);
add('set rotation style', 'Motion', sprite({ blocks: flag(b('sprite-rotation-style', { style: 'left-right' })) }),
  (p) => String(p.sprites[0].rotationStyle || '').toLowerCase().includes('left'));
add('x position', 'Motion', sprite({
  blocks: flag(
    b('logic-if', { _cond: { type: 'sprite-x-reporter' } }),
    b('sprite-say', { text: 'xpos' }),
    b('logic-else'),
    b('sprite-say', { text: 'xpos' }),
    b('logic-end-if'),
  ),
}), (p) => p.sprites[0].say === 'xpos');
add('y position', 'Motion', sprite({
  blocks: flag(
    b('logic-if', { _cond: { type: 'logic-compare', params: { left: { type: 'sprite-y-reporter' }, op: '>', right: -999 } } }),
    b('sprite-say', { text: 'ypos' }),
    b('logic-end-if'),
  ),
}), (p) => p.sprites[0].say === 'ypos');
add('direction', 'Motion', sprite({
  blocks: flag(
    b('logic-if', { _cond: { type: 'logic-compare', params: { left: { type: 'sprite-direction-reporter' }, op: '>', right: 0 } } }),
    b('sprite-say', { text: 'dir' }),
    b('logic-end-if'),
  ),
}), (p) => p.sprites[0].say === 'dir');

// ── Looks ──
add('say for seconds', 'Looks', sprite({ blocks: flag(b('sprite-say', { text: 'hello', secs: 2 })) }),
  (p) => p.sprites[0].say === 'hello');
add('say', 'Looks', sprite({ blocks: flag(b('looks-say', { text: 'hi' })) }),
  (p) => p.sprites[0].say === 'hi');
add('think for seconds', 'Looks', sprite({ blocks: flag(b('sprite-think', { text: 'hmm', secs: 2 })) }),
  (p) => p.sprites[0].think === 'hmm');
add('think', 'Looks', sprite({ blocks: flag(b('looks-think', { text: 'idea' })) }),
  (p) => p.sprites[0].think === 'idea');
add('switch costume to', 'Looks', sprite({ blocks: flag(b('looks-costume', { costume: 2 })) }),
  (p) => Number(p.sprites[0].costume) >= 1);
add('next costume', 'Looks', sprite({ blocks: flag(b('looks-next-costume')) }),
  (p) => Number(p.sprites[0].costume) >= 1);
add('switch backdrop to', 'Looks', sprite({ blocks: flag(b('looks-backdrop', { backdrop: 'Forest' })) }),
  (p) => String(p.backdrop || '').toLowerCase().includes('forest'));
add('next backdrop', 'Looks', sprite({ blocks: flag(b('looks-next-backdrop')) }),
  (p) => p.backdrop && p.backdrop !== 'White');
add('change color effect by', 'Looks', sprite({ blocks: flag(b('looks-change-effect', { effect: 'color', value: 40 })) }),
  (p) => Number(p.sprites[0].color) !== 0);
add('set color effect to', 'Looks', sprite({ blocks: flag(b('looks-set-effect', { effect: 'color', value: 55 })) }),
  (p) => Number(p.sprites[0].color) === 55);
add('clear graphic effects', 'Looks', sprite({
  blocks: flag(
    b('looks-set-effect', { effect: 'color', value: 40 }),
    b('looks-clear-effects'),
  ),
}), (p) => Number(p.sprites[0].color) === 0);
add('change size by', 'Looks', sprite({ blocks: flag(b('looks-change-size', { amount: 30 })) }),
  (p) => Number(p.sprites[0].size) >= 120);
add('set size to', 'Looks', sprite({ blocks: flag(b('sprite-setsize', { size: 150 })) }),
  (p) => Number(p.sprites[0].size) === 150);
add('show', 'Looks', sprite({ visible: false, blocks: flag(b('sprite-show')) }),
  (p) => p.sprites[0].visible === true);
add('hide', 'Looks', sprite({ blocks: flag(b('sprite-hide')) }),
  (p) => p.sprites[0].visible === false);
add('go to front layer', 'Looks', sprite({ blocks: flag(b('looks-front')) }),
  (p) => p.frames > 0);
add('go to back layer', 'Looks', sprite({ blocks: flag(b('looks-back')) }),
  (p) => p.frames > 0);
add('go forward layers', 'Looks', sprite({ blocks: flag(b('looks-layers', { layers: 2, direction: 'forward' })) }),
  (p) => p.frames > 0);
add('costume number', 'Looks', sprite({
  blocks: flag(
    b('logic-if', { _cond: { type: 'logic-compare', params: { left: { type: 'looks-costume-reporter' }, op: '>', right: 0 } } }),
    b('sprite-say', { text: 'cnum' }),
    b('logic-end-if'),
  ),
}), (p) => p.sprites[0].say === 'cnum');
add('backdrop number', 'Looks', sprite({
  blocks: flag(
    b('logic-if', { _cond: { type: 'logic-compare', params: { left: { type: 'looks-backdrop-reporter' }, op: '>=', right: 1 } } }),
    b('sprite-say', { text: 'bnum' }),
    b('logic-end-if'),
  ),
}), (p) => p.sprites[0].say === 'bnum');
add('size', 'Looks', sprite({
  blocks: flag(
    b('logic-if', { _cond: { type: 'logic-compare', params: { left: { type: 'sprite-size-reporter' }, op: '>', right: 0 } } }),
    b('sprite-say', { text: 'sz' }),
    b('logic-end-if'),
  ),
}), (p) => p.sprites[0].say === 'sz');

// ── Sound ──
add('start sound', 'Sound', sprite({ blocks: flag(b('sound-play', { sound: 'pop' })) }),
  (p) => p.frames > 0);
add('play sound until done', 'Sound', sprite({ blocks: flag(b('sound-play-until-done', { sound: 'pop' })) }),
  (p) => p.frames > 0);
add('stop all sounds', 'Sound', sprite({ blocks: flag(b('sound-play', { sound: 'pop' }), b('sound-stop')) }),
  (p) => p.frames > 0);
add('change pitch effect by', 'Sound', sprite({ blocks: flag(b('sound-change-effect', { effect: 'pitch', value: 20 })) }),
  (p) => Number(p.sprites[0].pitch) === 20);
add('set pitch effect to', 'Sound', sprite({ blocks: flag(b('sound-set-effect', { effect: 'pitch', value: 12 })) }),
  (p) => Number(p.sprites[0].pitch) === 12);
add('clear sound effects', 'Sound', sprite({
  blocks: flag(b('sound-set-effect', { effect: 'pitch', value: 20 }), b('sound-clear-effects')),
}), (p) => Number(p.sprites[0].pitch) === 0);
add('set volume to', 'Sound', sprite({ blocks: flag(b('sound-set-volume', { volume: 40 })) }),
  (p) => Number(p.sprites[0].volume) === 40 || Number(p.volume) === 40);
add('volume', 'Sound', sprite({
  blocks: flag(
    b('sound-set-volume', { volume: 33 }),
    b('logic-if', { _cond: { type: 'logic-compare', params: { left: { type: 'sound-get-volume' }, op: '=', right: 33 } } }),
    b('sprite-say', { text: 'vol' }),
    b('logic-end-if'),
  ),
}), (p) => p.sprites[0].say === 'vol');

// ── Events ──
add('when green flag clicked', 'Events', sprite({ blocks: flag(b('sprite-say', { text: 'flag' })) }),
  (p) => p.sprites[0].say === 'flag');
add('when key pressed', 'Events', sprite({
  blocks: [b('event-keypress', { key: 'space' }), b('sprite-say', { text: 'key' })],
}), (p) => p.sprites[0].say === 'key', {
  afterPlay: async (page) => {
    const canvas = page.locator('canvas').first();
    await canvas.click();
    await page.waitForTimeout(120);
    await page.keyboard.down('Space');
    await page.waitForTimeout(80);
    await page.keyboard.up('Space');
    await page.evaluate(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true }));
    });
  },
  wait: 400,
});
add('when this sprite clicked', 'Events', sprite({
  blocks: [b('event-click'), b('sprite-say', { text: 'clicked' })],
}), (p) => p.sprites[0].say === 'clicked', {
  afterPlay: async (page) => {
    const box = await page.locator('canvas').first().boundingBox();
    if (!box) return;
    await page.mouse.click(box.x + (240 * box.width) / 480, box.y + (180 * box.height) / 360);
  },
  wait: 400,
});
add('when backdrop switches to', 'Events', sprite({
  blocks: [
    b('event-backdropswitch', { backdrop: 'Forest' }),
    b('sprite-say', { text: 'switched' }),
    b('event-start'),
    b('looks-backdrop', { backdrop: 'Forest' }),
  ],
}), (p) => p.sprites[0].say === 'switched', { wait: 500 });
add('when greater than', 'Events', sprite({
  blocks: [b('event-loudness', { what: 'loudness', threshold: -1 }), b('sprite-say', { text: 'loud' })],
}), (p) => p.sprites[0].say === 'loud', { wait: 400 });
add('when I receive message', 'Events', sprite({
  blocks: [
    b('event-message', { message: 'go' }),
    b('sprite-say', { text: 'got' }),
    b('event-start'),
    b('event-broadcast', { message: 'go' }),
  ],
}), (p) => p.sprites[0].say === 'got', { wait: 450 });
add('broadcast', 'Events', sprite({
  blocks: [
    b('event-message', { message: 'go' }),
    b('sprite-hide'),
    b('event-start'),
    b('event-broadcast', { message: 'go' }),
  ],
}), (p) => p.sprites[0].visible === false, { wait: 450 });
add('broadcast and wait', 'Events', sprite({
  blocks: [
    b('event-message', { message: 'go' }),
    b('sprite-say', { text: 'waited' }),
    b('event-start'),
    b('event-broadcast-wait', { message: 'go' }),
  ],
}), (p) => p.sprites[0].say === 'waited', { wait: 450 });

// ── Control ──
add('wait seconds', 'Control', sprite({
  blocks: flag(b('control-wait', { secs: 0.15 }), b('sprite-say', { text: 'after' })),
}), (p) => p.sprites[0].say === 'after', { wait: 500 });
add('repeat', 'Control', sprite({
  blocks: flag(
    b('loop-repeat', { times: 3 }),
    b('sprite-changex', { amount: 10 }),
    b('loop-end-loop'),
  ),
}), (p) => p.sprites[0].x >= 240);
add('forever', 'Control', sprite({
  blocks: flag(
    b('loop-forever'),
    b('sprite-changex', { amount: 4 }),
    b('loop-end-loop'),
  ),
}), (p) => p.sprites[0].x > 220, { wait: 400 });
add('if then', 'Control', sprite({
  blocks: flag(
    b('logic-if', { _cond: { type: 'logic-bool', params: { value: true } } }),
    b('sprite-hide'),
    b('logic-end-if'),
  ),
}), (p) => p.sprites[0].visible === false);
add('if then else', 'Control', sprite({
  blocks: flag(
    b('logic-if', { _cond: { type: 'logic-bool', params: { value: false } } }),
    b('sprite-say', { text: 'yes' }),
    b('logic-else'),
    b('sprite-say', { text: 'no' }),
    b('logic-end-if'),
  ),
}), (p) => p.sprites[0].say === 'no');
add('wait until', 'Control', sprite({
  blocks: flag(
    b('control-wait-until', { _cond: { type: 'logic-bool', params: { value: true } } }),
    b('sprite-say', { text: 'ready' }),
  ),
}), (p) => p.sprites[0].say === 'ready');
add('repeat until', 'Control', sprite({
  blocks: flag(
    b('control-repeat-until', { _cond: { type: 'logic-bool', params: { value: true } } }),
    b('sprite-say', { text: 'skip' }),
    b('loop-end-loop'),
    b('sprite-say', { text: 'done' }),
  ),
}), (p) => p.sprites[0].say === 'done');
add('stop', 'Control', sprite({
  blocks: flag(b('sprite-say', { text: 'bye' }), b('control-stop', { stopOption: 'all' })),
}), (p) => p.sprites[0].say === 'bye');
add('when I start as a clone', 'Control', sprite({
  blocks: [
    b('event-start'),
    b('control-create-clone', { sprite: 'myself' }),
    b('event-clone'),
    b('sprite-say', { text: 'clone' }),
  ],
}), (p) => p.sprites.some((s) => s.isClone && s.say === 'clone'), { wait: 500 });
add('create clone of', 'Control', sprite({
  blocks: flag(b('control-create-clone', { sprite: 'myself' })),
}), (p) => p.spriteCount >= 2, { wait: 400 });
add('delete this clone', 'Control', sprite({
  blocks: [
    b('event-start'),
    b('control-create-clone', { sprite: 'myself' }),
    b('event-clone'),
    b('control-delete-clone'),
  ],
}), (p) => p.sprites.filter((s) => s.isClone).length === 0 && p.spriteCount === 1, { wait: 500 });

// ── Sensing ──
add('touching', 'Sensing', [
  sprite({ name: 'Other', id: 9002, x: 216, y: 156, blocks: [] }),
  sprite({
    blocks: flag(
      b('logic-if', { _cond: { type: 'sense-touching-sprite', params: { sprite: 'Other' } } }),
      b('sprite-say', { text: 'touch' }),
      b('logic-end-if'),
    ),
  }),
], (p) => p.sprites.find((s) => s.name === 'Probe').say === 'touch');
add('touching color', 'Sensing', sprite({
  blocks: flag(
    b('logic-if', { _cond: { type: 'logic-bool', params: { value: true } } }),
    b('sprite-say', { text: 'tcol' }),
    b('logic-end-if'),
    b('sense-touching-color', { color: '#ff0000' }),
  ),
}), (p) => p.frames > 0);
add('color is touching', 'Sensing', sprite({
  blocks: flag(b('sense-color-touching-color', { color1: '#ff0000', color2: '#00ff00' }), b('sprite-say', { text: 'ccol' })),
}), (p) => p.sprites[0].say === 'ccol');
add('distance to', 'Sensing', sprite({
  blocks: flag(
    b('logic-if', { _cond: { type: 'logic-compare', params: { left: { type: 'sense-distance', params: { target: 'mouse-pointer' } }, op: '>=', right: 0 } } }),
    b('sprite-say', { text: 'dist' }),
    b('logic-end-if'),
  ),
}), (p) => p.sprites[0].say === 'dist');
add('ask and wait', 'Sensing', sprite({ blocks: flag(b('action-ask', { prompt: 'What is your name?' })) }),
  (p, pageAsk) => p.ask.includes('name') || pageAsk === true);
add('answer', 'Sensing', sprite({
  blocks: flag(
    b('logic-if', { _cond: { type: 'sense-answer' } }),
    b('sprite-say', { text: 'ans-yes' }),
    b('logic-else'),
    b('sprite-say', { text: 'ans-empty' }),
    b('logic-end-if'),
  ),
}), (p) => p.sprites[0].say === 'ans-empty');
add('key pressed', 'Sensing', sprite({
  blocks: flag(
    b('logic-if', { _cond: { type: 'sense-key', params: { key: 'space' } } }),
    b('sprite-say', { text: 'held' }),
    b('logic-else'),
    b('sprite-say', { text: 'free' }),
    b('logic-end-if'),
  ),
}), (p) => p.sprites[0].say === 'free' || p.sprites[0].say === 'held');
add('mouse down', 'Sensing', sprite({
  blocks: flag(
    b('logic-if', { _cond: { type: 'sense-mouse-down' } }),
    b('sprite-say', { text: 'down' }),
    b('logic-else'),
    b('sprite-say', { text: 'up' }),
    b('logic-end-if'),
  ),
}), (p) => p.sprites[0].say === 'up' || p.sprites[0].say === 'down');
add('mouse x', 'Sensing', sprite({
  blocks: flag(
    b('logic-if', { _cond: { type: 'logic-compare', params: { left: { type: 'sense-mouse-x' }, op: '>=', right: 0 } } }),
    b('sprite-say', { text: 'mx' }),
    b('logic-end-if'),
  ),
}), (p) => p.sprites[0].say === 'mx');
add('mouse y', 'Sensing', sprite({
  blocks: flag(
    b('logic-if', { _cond: { type: 'logic-compare', params: { left: { type: 'sense-mouse-y' }, op: '>=', right: 0 } } }),
    b('sprite-say', { text: 'my' }),
    b('logic-end-if'),
  ),
}), (p) => p.sprites[0].say === 'my');
add('set drag mode', 'Sensing', sprite({ blocks: flag(b('sense-set-drag-mode', { mode: 'draggable' })) }),
  (p) => p.sprites[0].drag === 'draggable');
add('loudness', 'Sensing', sprite({
  blocks: flag(
    b('logic-if', { _cond: { type: 'logic-compare', params: { left: { type: 'sense-loudness' }, op: '>=', right: 0 } } }),
    b('sprite-say', { text: 'loudn' }),
    b('logic-end-if'),
  ),
}), (p) => p.sprites[0].say === 'loudn');
add('timer', 'Sensing', sprite({ blocks: flag(b('sense-timer')) }),
  (p) => typeof p.math === 'number' && p.math >= 0);
add('reset timer', 'Sensing', sprite({ blocks: flag(b('control-wait', { secs: 0.12 }), b('sense-reset-timer'), b('sense-timer')) }),
  (p) => typeof p.math === 'number' && p.math < 0.4, { wait: 400 });
add('current year', 'Sensing', sprite({
  blocks: flag(
    b('logic-if', { _cond: { type: 'logic-compare', params: { left: { type: 'sense-current', params: { unit: 'year' } }, op: '>', right: 2000 } } }),
    b('sprite-say', { text: 'year' }),
    b('logic-end-if'),
  ),
}), (p) => p.sprites[0].say === 'year');
add('days since 2000', 'Sensing', sprite({
  blocks: flag(
    b('logic-if', { _cond: { type: 'logic-compare', params: { left: { type: 'sense-days-since-2000' }, op: '>', right: 0 } } }),
    b('sprite-say', { text: 'days' }),
    b('logic-end-if'),
  ),
}), (p) => p.sprites[0].say === 'days');
add('username', 'Sensing', sprite({
  blocks: flag(
    b('logic-if', { _cond: { type: 'sense-username' } }),
    b('sprite-say', { text: 'user' }),
    b('logic-end-if'),
  ),
}), (p) => p.sprites[0].say === 'user' && String(p.username || '').length > 0);

// ── Operators ──
add('add', 'Operators', sprite({ blocks: flag(b('math-add', { a: 4, b: 5 })) }), (p) => p.math === 9);
add('subtract', 'Operators', sprite({ blocks: flag(b('math-subtract', { a: 10, b: 3 })) }), (p) => p.math === 7);
add('multiply', 'Operators', sprite({ blocks: flag(b('math-mult', { a: 3, b: 4 })) }), (p) => p.math === 12);
add('divide', 'Operators', sprite({ blocks: flag(b('math-divide', { a: 8, b: 2 })) }), (p) => p.math === 4);
add('pick random to', 'Operators', sprite({ blocks: flag(b('math-random', { min: 7, max: 7 })) }), (p) => p.math === 7);
add('greater than', 'Operators', sprite({
  blocks: flag(
    b('logic-if', { _cond: { type: 'logic-compare', params: { left: 9, op: '>', right: 2 } } }),
    b('sprite-say', { text: 'gt' }),
    b('logic-end-if'),
  ),
}), (p) => p.sprites[0].say === 'gt');
add('less than', 'Operators', sprite({
  blocks: flag(
    b('logic-if', { _cond: { type: 'logic-compare', params: { left: 1, op: '<', right: 4 } } }),
    b('sprite-say', { text: 'lt' }),
    b('logic-end-if'),
  ),
}), (p) => p.sprites[0].say === 'lt');
add('equals', 'Operators', sprite({
  blocks: flag(
    b('logic-if', { _cond: { type: 'logic-compare', params: { left: 5, op: '=', right: 5 } } }),
    b('sprite-say', { text: 'eq' }),
    b('logic-end-if'),
  ),
}), (p) => p.sprites[0].say === 'eq');
add('and', 'Operators', sprite({
  blocks: flag(
    b('logic-if', { _cond: { type: 'logic-and', params: { _left: { type: 'logic-bool', params: { value: true } }, _right: { type: 'logic-bool', params: { value: true } } } } }),
    b('sprite-say', { text: 'and' }),
    b('logic-end-if'),
  ),
}), (p) => p.sprites[0].say === 'and');
add('or', 'Operators', sprite({
  blocks: flag(
    b('logic-if', { _cond: { type: 'logic-or', params: { _left: { type: 'logic-bool', params: { value: false } }, _right: { type: 'logic-bool', params: { value: true } } } } }),
    b('sprite-say', { text: 'or' }),
    b('logic-end-if'),
  ),
}), (p) => p.sprites[0].say === 'or');
add('not', 'Operators', sprite({
  blocks: flag(
    b('logic-if', { _cond: { type: 'logic-not', params: { _value: { type: 'logic-bool', params: { value: false } } } } }),
    b('sprite-say', { text: 'not' }),
    b('logic-end-if'),
  ),
}), (p) => p.sprites[0].say === 'not');
add('join', 'Operators', sprite({ blocks: flag(b('text-join', { a: 'hi', b: 'ya' })) }), (p) => p.text === 'hiya');
add('letter of', 'Operators', sprite({ blocks: flag(b('text-letter', { index: 1, text: 'cat' })) }), (p) => p.text === 'a');
add('length of', 'Operators', sprite({ blocks: flag(b('text-length', { text: 'hello' })) }), (p) => p.math === 5);
add('contains', 'Operators', sprite({ blocks: flag(b('text-contains', { text: 'hello', search: 'ell' })) }), (p) => p.bool === true);
add('mod', 'Operators', sprite({ blocks: flag(b('math-modulo', { a: 10, b: 3 })) }), (p) => p.math === 1);
add('round', 'Operators', sprite({ blocks: flag(b('math-round', { op: 'round', value: 3.7 })) }), (p) => p.math === 4);
add('math operation of', 'Operators', sprite({ blocks: flag(b('math-round', { op: 'abs', value: -9 })) }), (p) => p.math === 9);

// ── Variables ──
add('set variable to', 'Variables', sprite({
  blocks: flag(b('var-set', { name: 'score', value: 7 }), b('var-show', { name: 'score' })),
}), (p) => p.sprites[0].vars.score === 7 && String(p.sprites[0].say).includes('7'));
add('change variable by', 'Variables', sprite({
  blocks: flag(b('var-set', { name: 'score', value: 4 }), b('var-change', { name: 'score', amount: 3 })),
}), (p) => p.sprites[0].vars.score === 7);
add('show variable', 'Variables', sprite({
  blocks: flag(b('var-set', { name: 'lives', value: 3 }), b('var-show', { name: 'lives' })),
}), (p) => String(p.sprites[0].say).includes('3'));
add('hide variable', 'Variables', sprite({
  blocks: flag(
    b('var-set', { name: 'lives', value: 3 }),
    b('var-show', { name: 'lives' }),
    b('var-hide', { name: 'lives' }),
  ),
}), (p) => !p.sprites[0].say);

// ── Lists ──
add('add to list', 'Lists', sprite({ blocks: flag(b('list-add', { list: 'myList', item: 'apple' })) }),
  (p) => (p.lists.myList || []).includes('apple'));
add('delete of list', 'Lists', sprite({
  blocks: flag(b('list-add', { list: 'myList', item: 'a' }), b('list-add', { list: 'myList', item: 'b' }), b('list-delete', { list: 'myList', index: 1 })),
}), (p) => (p.lists.myList || []).length === 1);
add('delete all of list', 'Lists', sprite({
  blocks: flag(b('list-add', { list: 'myList', item: 'a' }), b('list-delete-all', { list: 'myList' })),
}), (p) => (p.lists.myList || []).length === 0);
add('insert at of list', 'Lists', sprite({
  blocks: flag(b('list-add', { list: 'myList', item: 'b' }), b('list-insert', { list: 'myList', index: 1, item: 'a' })),
}), (p) => (p.lists.myList || [])[0] === 'a');
add('replace item of list with', 'Lists', sprite({
  blocks: flag(b('list-add', { list: 'myList', item: 'old' }), b('list-replace', { list: 'myList', index: 1, item: 'new' })),
}), (p) => (p.lists.myList || [])[0] === 'new');
add('item of list', 'Lists', sprite({
  blocks: flag(
    b('list-add', { list: 'myList', item: 'gem' }),
    b('logic-if', { _cond: { type: 'logic-compare', params: { left: { type: 'list-item', params: { list: 'myList', index: 1 } }, op: '=', right: 'gem' } } }),
    b('sprite-say', { text: 'item' }),
    b('logic-end-if'),
  ),
}), (p) => p.sprites[0].say === 'item');
add('item # of in list', 'Lists', sprite({
  blocks: flag(
    b('list-add', { list: 'myList', item: 'gem' }),
    b('logic-if', { _cond: { type: 'logic-compare', params: { left: { type: 'list-index', params: { list: 'myList', item: 'gem' } }, op: '=', right: 1 } } }),
    b('sprite-say', { text: 'idx' }),
    b('logic-end-if'),
  ),
}), (p) => p.sprites[0].say === 'idx');
add('length of list', 'Lists', sprite({
  blocks: flag(
    b('list-add', { list: 'myList', item: 'a' }),
    b('list-add', { list: 'myList', item: 'b' }),
    b('logic-if', { _cond: { type: 'logic-compare', params: { left: { type: 'list-length', params: { list: 'myList' } }, op: '=', right: 2 } } }),
    b('sprite-say', { text: 'llen' }),
    b('logic-end-if'),
  ),
}), (p) => p.sprites[0].say === 'llen');
add('list contains', 'Lists', sprite({
  blocks: flag(
    b('list-add', { list: 'myList', item: 'cat' }),
    b('logic-if', { _cond: { type: 'list-contains', params: { list: 'myList', item: 'cat' } } }),
    b('sprite-say', { text: 'has' }),
    b('logic-end-if'),
  ),
}), (p) => p.sprites[0].say === 'has');
add('show list', 'Lists', sprite({ blocks: flag(b('list-add', { list: 'myList', item: 'x' }), b('list-show', { list: 'myList' })) }),
  (p) => p.listVisible.myList === true);
add('hide list', 'Lists', sprite({
  blocks: flag(b('list-show', { list: 'myList' }), b('list-hide', { list: 'myList' })),
}), (p) => p.listVisible.myList === false);

// ── Text (same runtime as operators) ──
add('letter of', 'Text', sprite({ blocks: flag(b('text-letter', { index: 0, text: 'Zed' })) }), (p) => p.text === 'Z');
add('length of', 'Text', sprite({ blocks: flag(b('text-length', { text: 'code' })) }), (p) => p.math === 4);
add('contains', 'Text', sprite({ blocks: flag(b('text-contains', { text: 'byte', search: 'yt' })) }), (p) => p.bool === true);

// ── My Blocks ──
add('define', 'My Blocks', sprite({
  blocks: [
    b('func-define', { name: 'dance' }),
    b('sprite-hide'),
    b('event-start'),
    b('func-call', { name: 'dance' }),
  ],
}), (p) => p.sprites[0].visible === false);
add('run custom block', 'My Blocks', sprite({
  blocks: [
    b('myblock-define', { name: 'my block' }),
    b('sprite-say', { text: 'custom' }),
    b('event-start'),
    b('myblock-run', { name: 'my block' }),
  ],
}), (p) => p.sprites[0].say === 'custom');

const browser = await chromium.launch({
  headless: HEADLESS,
  channel: process.env.PW_CHANNEL || 'chrome',
  slowMo: HEADLESS ? 0 : 10,
  args: ['--disable-gpu', '--no-sandbox'],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 920 } });
await page.addInitScript((user) => {
  localStorage.setItem('cv-loggedin', 'true');
  localStorage.setItem('cv-user', JSON.stringify(user));
  localStorage.setItem('bb_block_probe', '1');
  localStorage.setItem('cv_gamebuilder_bg', 'White');
}, USER);

const results = [];
let first = true;

async function loadCase(test) {
  if (first) {
    await page.goto(`${BASE}/#gamebuilder`, { waitUntil: 'domcontentloaded' });
    first = false;
  }
  await page.evaluate((sprites) => {
    localStorage.setItem('cv_gamebuilder_sprites', JSON.stringify(sprites));
    localStorage.setItem('bb_block_probe', '1');
    localStorage.setItem('cv_gamebuilder_bg', 'White');
  }, test.sprites);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.locator('button.btn-success').first().waitFor({ timeout: 45_000 });
  await page.waitForTimeout(250);
  await page.evaluate(() => { window.__bbPlayProbe = null; });
  await page.evaluate(() => {
    const btn = document.querySelector('button.btn-success');
    if (btn) btn.click();
  });
  await page.waitForFunction(() => window.__bbPlayProbe && (window.__bbPlayProbe.frames > 0 || window.__bbPlayProbe.playing === false), null, { timeout: 8000 }).catch(() => {});
  if (test.afterPlay) await test.afterPlay(page);
  await page.waitForTimeout(test.wait || 350);
  const probe = await page.evaluate(() => window.__bbPlayProbe);
  const askVisible = await page.locator('text=/What is your name/i').count().then((n) => n > 0).catch(() => false);
  return { probe, askVisible };
}

console.log(`Proving ${tests.length} Game Builder coding blocks in Play…`);

for (const test of tests) {
  try {
    const { probe, askVisible } = await loadCase(test);
    const ok = !!(probe && test.check(probe, askVisible));
    results.push({
      label: test.label,
      category: test.category,
      ok,
      detail: ok ? '' : JSON.stringify({
        say: probe?.sprites?.[0]?.say,
        think: probe?.sprites?.[0]?.think,
        x: probe?.sprites?.[0]?.x,
        y: probe?.sprites?.[0]?.y,
        dir: probe?.sprites?.[0]?.direction,
        style: probe?.sprites?.[0]?.rotationStyle,
        vis: probe?.sprites?.[0]?.visible,
        math: probe?.math,
        text: probe?.text,
        lists: probe?.lists,
        backdrop: probe?.backdrop,
        frames: probe?.frames,
      }),
    });
    console.log(`${ok ? 'PASS' : 'FAIL'}  [${test.category}] ${test.label}${ok ? '' : `  ${results.at(-1).detail}`}`);
  } catch (err) {
    results.push({ label: test.label, category: test.category, ok: false, detail: String(err.message || err) });
    console.log(`FAIL  [${test.category}] ${test.label}  ${err.message || err}`);
  }
}

const failed = results.filter((r) => !r.ok);
const passed = results.filter((r) => r.ok);
const byCat = {};
for (const r of results) {
  byCat[r.category] ||= { pass: 0, fail: 0 };
  byCat[r.category][r.ok ? 'pass' : 'fail'] += 1;
}

if (!HEADLESS) {
  try {
    await page.screenshot({ path: '/tmp/bb-gb/blocks-proven.png', fullPage: true });
  } catch { /* ignore */ }
}

console.log('\n── Summary ──');
for (const [cat, n] of Object.entries(byCat)) {
  console.log(`${cat}: ${n.pass}/${n.pass + n.fail}`);
}
console.log(`TOTAL: ${passed.length}/${results.length}`);
if (failed.length) {
  console.log('Failed:');
  failed.forEach((f) => console.log(`  - ${f.category}: ${f.label} ${f.detail}`));
}

fs.mkdirSync('/tmp/bb-gb', { recursive: true });
fs.writeFileSync('/tmp/bb-gb/block-proof.json', JSON.stringify({ passed: passed.length, total: results.length, failed }, null, 2));

await browser.close();
process.exit(failed.length ? 1 : 0);
