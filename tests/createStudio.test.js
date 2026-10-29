/** Create Studio: race track items, rivals and share codes; robot stats. */
import {
  blankTrack, encodeTrack, decodeTrack, trackLoop, loopFractions, itemPosition, trackToRaceCourse, TRACK_IDEAS,
} from '../src/virtual-robot-designer/create/raceTracks.js';
import { robotStats } from '../src/virtual-robot-designer/create/freeBuild.js';

describe('Track Maker items and rivals', () => {
  const track = {
    ...blankTrack(), name: 'Bumper Bay', pieces: TRACK_IDEAS[0].pieces.slice(),
    items: [{ type: 'bumper', t: 0.25, lane: 0 }, { type: 'boost', t: 0.5, lane: -1 }, { type: 'ramp', t: 0.75, lane: 1 }],
    rivals: 1, rivalPace: 'fast',
  };

  test('a share code brings back the same track', () => {
    const back = decodeTrack(encodeTrack(track));
    expect(back.name).toBe('Bumper Bay');
    expect(back.pieces).toEqual(track.pieces);
    expect(back.items).toEqual(track.items);
    expect(back.rivals).toBe(1);
    expect(back.rivalPace).toBe('fast');
    expect(back.id).not.toBe(track.id);
  });

  test('a broken share code is turned down', () => {
    expect(decodeTrack('BBT-not-a-code')).toBeNull();
    expect(decodeTrack('')).toBeNull();
  });

  test('the race gets the items and rival settings', () => {
    const course = trackToRaceCourse(track).expandedCarTrack;
    expect(course.raceItems).toEqual(track.items);
    expect(course.rivalCount).toBe(1);
    expect(course.rivalPace).toBe('fast');
  });

  test('items sit on the road, in their lane', () => {
    const { loop } = trackLoop(track);
    const fr = loopFractions(loop);
    expect(fr[0]).toBe(0);
    expect(fr[fr.length - 1]).toBeLessThan(1);
    const mid = itemPosition(loop, fr, 0.5, 0, 2);
    const left = itemPosition(loop, fr, 0.5, -1, 2);
    expect(Math.hypot(mid.x - left.x, mid.z - left.z)).toBeCloseTo(2, 5);
  });

  test('new tracks start with no items and three rivals', () => {
    expect(blankTrack()).toMatchObject({ items: [], rivals: 3, rivalPace: 'normal' });
  });
});

describe('Robot stats', () => {
  const piece = (type, s = [1, 1, 1]) => ({ id: type + Math.random(), type, p: [0, 0, 0], r: [0, 0, 0], s });

  test('more wheels give more grip', () => {
    const two = robotStats({ pieces: [piece('torso'), piece('wheel'), piece('wheel')] });
    const six = robotStats({ pieces: [piece('torso'), ...Array(6).fill(0).map(() => piece('wheel'))] });
    expect(six.grip).toBeGreaterThan(two.grip);
  });

  test('a big heavy robot is slower than a small one', () => {
    const small = robotStats({ pieces: [piece('carbody'), ...Array(4).fill(0).map(() => piece('wheel'))] });
    const big = robotStats({ pieces: [piece('truck', [2, 2, 2]), piece('torso', [2, 2, 2]), piece('block', [2, 2, 2]), ...Array(4).fill(0).map(() => piece('wheel'))] });
    expect(big.weight).toBeGreaterThan(small.weight);
    expect(big.speed).toBeLessThan(small.speed);
  });

  test('tools are counted and every stat stays between 1 and 5', () => {
    const s = robotStats({ pieces: [piece('torso'), piece('track'), piece('arm'), piece('claw'), piece('magnet')] });
    expect(s.tools).toBe(3);
    ['speed', 'grip', 'weight'].forEach((k) => { expect(s[k]).toBeGreaterThanOrEqual(1); expect(s[k]).toBeLessThanOrEqual(5); });
    expect(typeof s.tip).toBe('string');
  });

  test('a robot with nothing to move on gets told so', () => {
    expect(robotStats({ pieces: [piece('torso')] }).tip).toMatch(/wheels, tracks or legs/);
  });
});

test('a car body counts its own wheels', () => {
  const car = robotStats({ pieces: [{ id: 'c', type: 'carbody', p: [0, 0, 0], r: [0, 0, 0], s: [1, 1, 1] }] });
  expect(car.tip).not.toMatch(/nothing to move on/);
  expect(car.grip).toBeGreaterThanOrEqual(4);
});

describe('Robot types', () => {
  const { freeBuildPlayAs, PIECE_GROUPS, PIECE_DEFAULTS, makePieceObject } = require('../src/virtual-robot-designer/create/freeBuild.js');
  const one = (type) => freeBuildPlayAs({ pieces: [{ id: 'b', type, p: [0, 0, 0], r: [0, 0, 0], s: [1, 1, 1] }] });

  test.each([
    ['sub', 'submarine'], ['boat', 'submarine'], ['digger', 'miningbot'], ['firetruck', 'firebot'],
    ['armbase', 'robotarm'], ['mechbody', 'mech'], ['spiderbody', 'spider'], ['robodog', 'spider'],
    ['dragon', 'drone'], ['birdbody', 'drone'], ['hovercar', 'hoverbot'], ['heli', 'helicopter'],
    ['plane', 'jetplane'], ['tankbody', 'tank'], ['carbody', 'rover'],
  ])('a %s body plays as %s', (body, chassisId) => {
    expect(one(body).chassisId).toBe(chassisId);
  });

  test('every body has a size, a colour and a 3D model', () => {
    // jsdom can't draw on a canvas; the materials only need something to call
    const fake = () => new Proxy({}, { get: (_, k) => (/Gradient|Pattern/.test(String(k)) ? () => ({ addColorStop() {} }) : k === 'measureText' ? () => ({ width: 10 }) : () => {}) });
    HTMLCanvasElement.prototype.getContext = fake;
    PIECE_GROUPS[0].pieces.forEach(({ type }) => {
      expect(PIECE_DEFAULTS[type]).toBeTruthy();
      const o = makePieceObject({ id: type, type, p: [0, 0, 0], r: [0, 0, 0], s: PIECE_DEFAULTS[type].s });
      let meshes = 0; o.traverse((n) => { if (n.isMesh) meshes += 1; });
      expect(meshes).toBeGreaterThan(3);
    });
  });

  test('the first body placed decides the type', () => {
    const p = (type) => ({ id: type, type, p: [0, 0, 0], r: [0, 0, 0], s: [1, 1, 1] });
    expect(freeBuildPlayAs({ pieces: [p('sub'), p('propeller')] }).chassisId).toBe('submarine');
    expect(freeBuildPlayAs({ pieces: [p('torso'), p('leg'), p('leg')] }).chassisId).toBe('droid');
  });
});

describe('Swapping a body\'s parts', () => {
  const { freeBuildPlayAs, robotStats, BODY_SLOTS, slotValue } = require('../src/virtual-robot-designer/create/freeBuild.js');
  const body = (type, o) => ({ id: type, type, p: [0, 0, 0], r: [0, 0, 0], s: [1, 1, 1], ...(o ? { o } : {}) });

  test('a body comes with its first option for each part', () => {
    expect(slotValue(body('digger'), 'tool')).toBe('scoop');
    expect(slotValue(body('digger', { tool: 'drill' }), 'tool')).toBe('drill');
    expect(slotValue(body('torso'), 'tool')).toBeUndefined();
  });

  test('every option list starts with what the body comes with and has labels', () => {
    Object.values(BODY_SLOTS).forEach((slots) => Object.values(slots).forEach((list) => {
      expect(list.length).toBeGreaterThan(1);
      list.forEach(([id, label]) => { expect(id).toBeTruthy(); expect(label).toBeTruthy(); });
    }));
  });

  test('swapping how it moves changes the robot type', () => {
    expect(freeBuildPlayAs({ pieces: [body('carbody', { drive: 'hover' })] }).chassisId).toBe('hoverbot');
    expect(freeBuildPlayAs({ pieces: [body('carbody', { drive: 'tracks' })] }).chassisId).toBe('tank');
    expect(freeBuildPlayAs({ pieces: [body('carbody')] }).chassisId).toBe('rover');
    expect(freeBuildPlayAs({ pieces: [body('tankbody', { drive: 'wheels' })] }).chassisId).toBe('rover');
    expect(freeBuildPlayAs({ pieces: [body('birdbody', { wings: 'propeller' })] }).moves).toMatch(/propeller/);
  });

  test('taking parts off shows in the stats', () => {
    expect(robotStats({ pieces: [body('carbody', { drive: 'none' })] }).tip).toMatch(/nothing to move on/);
    expect(robotStats({ pieces: [body('digger', { tool: 'none' })] }).tools).toBe(0);
    expect(robotStats({ pieces: [body('digger')] }).tools).toBe(1);
  });
});

describe('Block Crafter worlds', () => {
  const { generateWorld, countTrees } = require('../src/virtual-robot-designer/studio/craft/CraftWorld.js');
  test('all 50 Block Crafter arenas are different worlds', () => {
    const seen = new Set();
    for (let m = 1; m <= 50; m++) {
      const t = {}; for (const v of generateWorld(m).world.cells.values()) t[v] = (t[v] || 0) + 1;
      const key = JSON.stringify(Object.entries(t).sort());
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
  });
  test('"chop every tree" levels count the trees that are really there', () => {
    [21, 41].forEach((m) => { const g = generateWorld(m); expect(g.goal.kind).toBe('trees'); expect(g.goal.count).toBe(countTrees(g.world)); expect(g.goal.count).toBeGreaterThan(3); });
  });
  test('building levels give enough blocks for their houses', () => {
    [13, 23, 33, 43].forEach((m) => { const inv = generateWorld(m).inventory; expect((inv.planks || 0) + (inv.cobblestone || 0)).toBeGreaterThanOrEqual(45); });
  });
});
