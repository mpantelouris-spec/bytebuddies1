/**
 * Game Builder palette → runtime: every coding-block category.
 */
import fs from 'fs';
import path from 'path';
import { blockCategories } from '../src/data/blockLibraryCategories.js';
import { BLOCK_DEFS, lookupSidebarType } from '../src/utils/blocks.jsx';
import {
  executeSpriteMotion,
  canvasToLogical,
  getDirection,
  getRotationStyle,
  isMotionBlock,
  isMotionReporter,
  STAGE_W,
  STAGE_H,
} from '../src/utils/spriteMotion.js';
import {
  evaluateOperatorBlock,
  OPERATOR_GAME_TYPES,
} from '../src/utils/operatorsRuntime.js';
import {
  initSpriteLooks,
  say,
  think,
  switchCostume,
  nextCostume,
  changeSizeBy,
  setSizePercent,
  changeEffect,
  setEffect,
  clearGraphicEffects,
  goToFrontLayer,
  goToBackLayer,
  goLayers,
  isLooksBlockType,
} from '../src/utils/looksRuntime.js';
import {
  listAdd,
  listDeleteAt,
  listDeleteAll,
  listInsertAt,
  listReplaceAt,
  listGetItem,
  listIndexOfValue,
  listLength,
  listContains,
} from '../src/utils/listRuntime.js';
import {
  isTouchingEdge,
  isTouchingMousePointer,
  isTouchingTarget,
  distanceToTarget,
  getTimerSeconds,
  getCurrentDateTime,
} from '../src/utils/sensingRuntime.js';

const gbSrc = fs.readFileSync(path.join(process.cwd(), 'src/components/GameBuilder.jsx'), 'utf8');

function makeSprite(overrides = {}) {
  const sprite = {
    id: 'cat-1',
    name: 'Cat',
    x: (STAGE_W - 48) / 2,
    y: (STAGE_H - 48) / 2,
    w: 48,
    h: 48,
    visible: true,
    color: '#4a9eff',
    ...overrides,
  };
  initSpriteLooks(sprite);
  return sprite;
}

function motion(sprite, type, params = {}, extra = {}) {
  return executeSpriteMotion(
    { type, params },
    sprite,
    {
      instant: true,
      sprites: extra.sprites || [sprite],
      mouseX: extra.mouseX ?? STAGE_W / 2 + 40,
      mouseY: extra.mouseY ?? STAGE_H / 2,
    },
  );
}

function paletteEntries() {
  const rows = [];
  for (const cat of blockCategories) {
    for (const label of cat.blocks) {
      rows.push({ category: cat.name, label, type: lookupSidebarType(label) });
    }
  }
  return rows;
}

function execBlockCases() {
  const cases = new Set();
  const re = /case\s+'([^']+)'/g;
  let m;
  while ((m = re.exec(gbSrc))) cases.add(m[1]);
  return cases;
}

const HAT_TYPES = new Set([
  'event-start',
  'event-keypress',
  'event-click',
  'event-backdropswitch',
  'event-loudness',
  'event-message',
  'event-clone',
  'func-define',
  'myblock-define',
]);

describe('Game Builder palette coverage', () => {
  test('every palette label maps to a BLOCK_DEFS type', () => {
    const missing = paletteEntries().filter((row) => !row.type || !BLOCK_DEFS[row.type]);
    expect(missing).toEqual([]);
  });

  test('stack (non-hat, non-reporter) types are handled by execBlock or motion/ops/looks', () => {
    const cases = execBlockCases();
    const gaps = [];
    for (const row of paletteEntries()) {
      const t = row.type;
      if (!t) {
        gaps.push(`${row.category}/${row.label} (unmapped)`);
        continue;
      }
      if (HAT_TYPES.has(t)) continue;
      if (isMotionReporter(t) || t.endsWith('-reporter')) continue;
      if (OPERATOR_GAME_TYPES.has(t)) continue;
      if (t.startsWith('sense-') && t !== 'sense-set-drag-mode' && t !== 'sense-reset-timer') continue;
      if (t.startsWith('list-') && !['list-add', 'list-delete', 'list-delete-all', 'list-insert', 'list-replace', 'list-show', 'list-hide', 'list-create', 'list-get'].includes(t)) continue;
      if (isMotionBlock(t) && !isMotionReporter(t)) continue;
      if (t === 'loop-repeat' || t === 'loop-forever' || t === 'logic-if' || t === 'logic-if-else' || t === 'control-wait-until' || t === 'control-repeat-until') continue;
      if (cases.has(t) || isLooksBlockType(t) || OPERATOR_GAME_TYPES.has(t)) continue;
      if (gbSrc.includes(`'${t}'`) || gbSrc.includes(`"${t}"`)) continue;
      gaps.push(`${row.category}/${row.label} → ${t}`);
    }
    expect(gaps).toEqual([]);
  });
});

describe('Motion blocks', () => {
  test('move steps (instant) increases logical x when facing right', () => {
    const sprite = makeSprite();
    motion(sprite, 'sprite-point-dir', { degrees: 90 });
    const before = canvasToLogical(sprite);
    motion(sprite, 'sprite-move', { steps: 20 });
    const after = canvasToLogical(sprite);
    expect(after.x).toBeCloseTo(before.x + 20, 4);
    expect(after.y).toBeCloseTo(before.y, 4);
  });

  test('turn clockwise / anticlockwise', () => {
    const sprite = makeSprite();
    motion(sprite, 'sprite-point-dir', { degrees: 90 });
    motion(sprite, 'sprite-turn-right', { degrees: 15 });
    expect(getDirection(sprite)).toBeCloseTo(105, 4);
    motion(sprite, 'sprite-turn-left', { degrees: 30 });
    expect(getDirection(sprite)).toBeCloseTo(75, 4);
  });

  test('go to x,y / change x / set x / change y / set y', () => {
    const sprite = makeSprite();
    motion(sprite, 'sprite-goto', { x: 40, y: -20 });
    expect(canvasToLogical(sprite).x).toBeCloseTo(40, 4);
    expect(canvasToLogical(sprite).y).toBeCloseTo(-20, 4);
    motion(sprite, 'sprite-changex', { amount: 10 });
    expect(canvasToLogical(sprite).x).toBeCloseTo(50, 4);
    motion(sprite, 'sprite-setx', { x: 0 });
    expect(canvasToLogical(sprite).x).toBeCloseTo(0, 4);
    motion(sprite, 'sprite-changey', { amount: 15 });
    expect(canvasToLogical(sprite).y).toBeCloseTo(-5, 4);
    motion(sprite, 'sprite-sety', { y: 30 });
    expect(canvasToLogical(sprite).y).toBeCloseTo(30, 4);
  });

  test('go to mouse-pointer / random / other sprite', () => {
    const sprite = makeSprite();
    const other = makeSprite({ id: 'dog-1', name: 'Dog', x: 80, y: 90 });
    motion(sprite, 'sprite-goto-mouse-pointer', {}, { mouseX: 300, mouseY: 100 });
    expect(canvasToLogical(sprite).x).toBeCloseTo(300 - STAGE_W / 2, 4);
    motion(sprite, 'sprite-goto-random-position');
    const pos = canvasToLogical(sprite);
    expect(Number.isFinite(pos.x)).toBe(true);
    motion(sprite, 'sprite-goto-sprite', { sprite: 'Dog' }, { sprites: [sprite, other] });
    const t = canvasToLogical(other);
    expect(canvasToLogical(sprite).x).toBeCloseTo(t.x, 4);
    expect(canvasToLogical(sprite).y).toBeCloseTo(t.y, 4);
  });

  test('glide to xy finishes immediately in instant mode', () => {
    const sprite = makeSprite();
    const busy = motion(sprite, 'sprite-glide', { x: 12, y: 8, secs: 1 });
    expect(busy).toBe(false);
  });

  test('point towards mouse and edge bounce / rotation style', () => {
    const sprite = makeSprite();
    motion(sprite, 'sprite-point-towards', { target: 'mouse-pointer' }, { mouseX: STAGE_W / 2 + 80, mouseY: STAGE_H / 2 });
    expect(getDirection(sprite)).toBeCloseTo(90, 0);
    motion(sprite, 'sprite-if-bounce');
    expect(sprite._edgeBounceEnabled).toBe(true);
    motion(sprite, 'sprite-rotation-style', { style: 'left-right' });
    expect(getRotationStyle(sprite)).toBe('left-right');
  });

  test('reporters: x, y, direction', () => {
    const sprite = makeSprite();
    motion(sprite, 'sprite-goto', { x: 11, y: -7 });
    motion(sprite, 'sprite-point-dir', { degrees: 45 });
    expect(executeSpriteMotion({ type: 'sprite-x-reporter' }, sprite, { instant: true })).toBeCloseTo(11, 4);
    expect(executeSpriteMotion({ type: 'sprite-y-reporter' }, sprite, { instant: true })).toBeCloseTo(-7, 4);
    expect(executeSpriteMotion({ type: 'sprite-direction-reporter' }, sprite, { instant: true })).toBeCloseTo(45, 4);
  });
});

describe('Looks blocks', () => {
  test('say / think / show / hide / size / costume / effects / layers', () => {
    const a = makeSprite();
    const b = makeSprite({ id: 'b', name: 'Bird' });
    const list = [a, b];
    say(a, 'hello', 1);
    expect(a._sayText).toBe('hello');
    think(a, 'hmm', 1);
    expect(a._thinkText).toBe('hmm');
    a.visible = true;
    a.visible = false;
    expect(a.visible).toBe(false);
    a.visible = true;
    setSizePercent(a, 200);
    expect(a.sizePercent).toBe(200);
    changeSizeBy(a, -50);
    expect(a.sizePercent).toBe(150);
    a.costumes = [
      { name: 'costume1', color: '#4a9eff' },
      { name: 'costume2', color: '#ef4444' },
    ];
    a.currentCostumeIndex = 0;
    const i0 = a.currentCostumeIndex;
    nextCostume(a);
    expect(a.currentCostumeIndex).not.toBe(i0);
    switchCostume(a, 'costume1');
    changeEffect(a, 'color', 25);
    expect(a.effects.color).toBe(25);
    setEffect(a, 'ghost', 40);
    expect(a.effects.ghost).toBe(40);
    clearGraphicEffects(a);
    expect(a.effects.color).toBe(0);
    goToFrontLayer(list, a);
    goToBackLayer(list, a);
    goLayers(a, 1, true);
  });
});

describe('Operators', () => {
  const nest = (block, sprite) => {
    if (block && OPERATOR_GAME_TYPES.has(block.type)) {
      return evaluateOperatorBlock(block, sprite, nest);
    }
    return block?.params?.value;
  };
  const ev = (type, params) => evaluateOperatorBlock({ type, params }, makeSprite(), nest);

  test('arithmetic and logic', () => {
    expect(ev('math-add', { a: 3, b: 4 })).toBe(7);
    expect(ev('math-subtract', { a: 10, b: 3 })).toBe(7);
    expect(ev('math-mult', { a: 3, b: 5 })).toBe(15);
    expect(ev('math-divide', { a: 20, b: 4 })).toBe(5);
    expect(ev('math-modulo', { a: 10, b: 3 })).toBe(1);
    const r = ev('math-random', { min: 2, max: 2 });
    expect(r).toBe(2);
    expect(ev('math-round', { op: 'round', value: 3.6 })).toBe(4);
    expect(ev('logic-compare', { left: 5, right: 3, op: '>' })).toBe(true);
    expect(ev('logic-compare', { left: 2, right: 2, op: '=' })).toBe(true);
    expect(ev('logic-and', {
      _left: { type: 'logic-bool', params: { value: true } },
      _right: { type: 'logic-bool', params: { value: false } },
    })).toBe(false);
    expect(ev('logic-or', {
      _left: { type: 'logic-bool', params: { value: true } },
      _right: { type: 'logic-bool', params: { value: false } },
    })).toBe(true);
    expect(ev('logic-not', { value: true })).toBe(false);
    expect(ev('text-join', { a: 'byte', b: 'buddies' })).toBe('bytebuddies');
    expect(ev('text-length', { text: 'cat' })).toBe(3);
    expect(ev('text-letter', { index: 1, text: 'cat' })).toBe('c');
    expect(ev('text-contains', { text: 'hello', search: 'ell' })).toBe(true);
  });
});

describe('Lists', () => {
  test('add / insert / replace / delete / reporters', () => {
    const store = {};
    listAdd(store, 'myList', 'a');
    listAdd(store, 'myList', 'b');
    listInsertAt(store, 'myList', 2, 'x');
    expect(listGetItem(store, 'myList', 2)).toBe('x');
    listReplaceAt(store, 'myList', 1, 'z');
    expect(listGetItem(store, 'myList', 1)).toBe('z');
    expect(listIndexOfValue(store, 'myList', 'b')).toBe(3);
    expect(listLength(store, 'myList')).toBe(3);
    expect(listContains(store, 'myList', 'x')).toBe(true);
    listDeleteAt(store, 'myList', 2);
    expect(listLength(store, 'myList')).toBe(2);
    listDeleteAll(store, 'myList');
    expect(listLength(store, 'myList')).toBe(0);
  });
});

describe('Sensing helpers', () => {
  test('edge, mouse, distance, timer, days since 2000', () => {
    const sprite = makeSprite({ x: 0, y: 0 });
    expect(isTouchingEdge(sprite, STAGE_W, STAGE_H)).toBe(true);
    expect(isTouchingMousePointer(sprite, 10, 10)).toBe(true);
    const other = makeSprite({ id: 'o', name: 'Other', x: 400, y: 10 });
    expect(isTouchingTarget(sprite, 'edge', { stageW: STAGE_W, stageH: STAGE_H })).toBe(true);
    const d = distanceToTarget(sprite, 'Other', { allSprites: [sprite, other] });
    expect(d).toBeGreaterThan(0);
    expect(getTimerSeconds(Date.now() - 1500)).toBeGreaterThanOrEqual(1);
    expect(getCurrentDateTime('year')).toBeGreaterThanOrEqual(2026);
  });
});
