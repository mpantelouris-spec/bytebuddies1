/** Custom robot set — school robotics mats, tape lines and toy towns. */
import { clouds, hills, trees, skyline, lampsNear, room } from './common.js';

const RAINBOW = [0xff5d5d, 0xffd23f, 0x3fa7ff, 0x3fcf7a, 0xb46bff];
const rainbowV = RAINBOW.map((color) => ({ color }));
const schoolRoom = (o) => room({ floor: 'wood', floorColor: 0xe0b27a, wall: 0xfff0c8, trim: 0x3fa7ff, outside: 0x8fd6ff, ...o });

export const CUSTOM_RECIPES = {
  lab_mat: {
    light: 'indoor',
    sky: { top: 0xeaf6ff, mid: 0xeaf6ff, horizon: 0xeaf6ff, fog: 0xe6f2ff },
    accent: 0x22c55e,
    room: schoolRoom({ floor: 'grid', floorColor: 0xf4f8fb, floorAlt: 0xc8d8e8, wall: 0xdcecff, tile: 4 }),
    path: { kind: 'tiles', color: 0x3fa7ff, edge: 0xffffff, kerb: 0x22c55e },
    layers: [
      { p: 'giantStar', at: 'near', n: 8, r: [0.8, 1.6], y: 0.4, s: 0.5, o: { color: 0xffd23f } },
      { p: 'desk', at: 'area', n: 12, r: [-12, 8], s: 1, face: 'center', clear: 2 },
      { p: 'robotArmProp', at: 'area', n: 4, r: [-6, 8], s: 1.2, face: 'center' },
      { p: 'bookshelf', at: 'area', n: 8, r: [8, 16], s: 1.3, face: 'center' },
      { p: 'chalkboard', at: 'hero', where: 'end', d: 9, s: 1.6, o: { text: 'ROBOTICS CLUB' } },
      { p: 'globe', at: 'near', n: 10, r: [1.2, 2.4], s: 1.1 },
      { p: 'plantPot', at: 'area', n: 8, r: [4, 14], s: [1, 1.5] },
    ],
    fx: [{ k: 'dust', n: 140 }],
  },

  tape_path: {
    light: 'indoor',
    sky: { top: 0xfff6dc, mid: 0xfff6dc, horizon: 0xfff6dc, fog: 0xfff2d4 },
    accent: 0xf59e0b,
    room: schoolRoom({ floor: 'tiles', floorColor: 0xeae4d8, floorAlt: 0xd8d0c0, tile: 3, trim: 0xf59e0b }),
    path: { kind: 'stripes', color: 0xffc83a, edge: 0x1a1a1a, kerb: 0x3b82f6 },
    layers: [
      { p: 'cone', at: 'near', n: 4, r: [0.4, 1.2], s: 0.8 },
      { p: 'toyBlocks', at: 'near', n: 6, r: [1, 2.6], s: [0.9, 1.2] },
      { p: 'desk', at: 'area', n: 10, r: [-10, 8], s: 1, face: 'center', clear: 2 },
      { p: 'pencil', at: 'area', n: 10, r: [2, 14], s: [1.4, 2], v: rainbowV },
      { p: 'books', at: 'area', n: 14, r: [-10, 10], s: [1, 1.4] },
      { p: 'chalkboard', at: 'hero', where: 'end', d: 9, s: 1.6, o: { text: 'FOLLOW THE TAPE' } },
      { p: 'bookshelf', at: 'area', n: 6, r: [8, 16], s: 1.3, face: 'center' },
    ],
    fx: [{ k: 'dust', n: 140 }],
  },

  colour_zones: {
    light: 'indoor',
    sky: { top: 0xfff0f8, mid: 0xfff0f8, horizon: 0xfff0f8, fog: 0xffecf4 },
    accent: 0xec4899,
    room: schoolRoom({ floor: 'checker', floorColor: 0xffffff, floorAlt: 0xffd8ec, wall: 0xffe8f4, trim: 0xec4899, tile: 3 }),
    path: { kind: 'rainbow', kerb: 0xffffff },
    layers: [
      { p: 'rug', at: 'near', n: 6, r: [1.6, 3], s: 1, v: [{ color: 0xef4444 }, { color: 0x3b82f6 }, { color: 0x22c55e }] },
      { p: 'glowPad', at: 'near', n: 3, r: [0.4, 1.4], s: 1, v: [{ color: 0xef4444 }, { color: 0x3b82f6 }, { color: 0x22c55e }] },
      { p: 'toyBlocks', at: 'area', n: 24, r: [-12, 10], s: [1, 1.6] },
      { p: 'paintPots', at: 'area', n: 10, r: [-8, 10], s: [1, 1.4] },
      { p: 'easel', at: 'area', n: 6, r: [4, 12], s: 1.2, face: 'center', o: { text: 'COLOURS' } },
      { p: 'balloons', at: 'area', n: 10, r: [-6, 10], s: 1 },
      { p: 'rainbow', at: 'hero', where: 'end', d: 12, s: 0.45 },
    ],
    fx: [{ k: 'confetti', n: 160 }],
  },

  loop_square: {
    sky: { top: 0x3f9bff, mid: 0x9fd8ff, horizon: 0xeefcff, sun: { yaw: 0.4 } },
    accent: 0x3b82f6,
    ground: { kind: 'tiles', color: 0xd8e8f8, alt: 0xc8d8ec, tile: 4 },
    path: { kind: 'stripes', color: 0x3b82f6, edge: 0xffffff, kerb: 0x22c55e },
    layers: [
      { p: 'cone', at: 'near', n: 3.4, r: [0.4, 1], s: 0.9 },
      { p: 'flag', at: 'near', n: 9, r: [1.4, 2], s: 1, v: [{ color: 0x3b82f6 }, { color: 0x22c55e }] },
      { p: 'bench', at: 'area', n: 10, r: [-6, 12], s: 1 },
      { p: 'house', at: 'area', n: 10, r: [8, 24], s: [1, 1.3], face: 'center', clear: 3 },
      { p: 'building', at: 'hero', where: 'end', d: 10, s: 1, o: { text: 'SCHOOL', signBg: '#3b82f6', trim: 0x3b82f6, color: 0xfff6e0, door: 0x22c55e } },
      trees('treeRound', 26, [6, 40], [1, 1.5]),
      hills(),
      clouds(12),
    ],
    fx: [],
  },

  sensor_stop: {
    light: 'indoor',
    sky: { top: 0xfff0f2, mid: 0xfff0f2, horizon: 0xfff0f2, fog: 0xffecef },
    accent: 0xfb7185,
    room: schoolRoom({ floor: 'grid', floorColor: 0xf6f4f4, floorAlt: 0xe0d4d8, wall: 0xffe4e8, trim: 0xfb7185, tile: 4 }),
    path: { kind: 'stripes', color: 0x4a4f5a, edge: 0xffffff, kerb: 0xfb7185 },
    layers: [
      { p: 'gymMat', at: 'hero', where: 'end', d: 3, s: 2, rotY: Math.PI / 2, o: { color: 0xfb7185 } },
      { p: 'cone', at: 'near', n: 4, r: [0.4, 1], s: 0.9 },
      { p: 'trafficLight', at: 'near', n: 10, r: [0.6, 1], s: 1 },
      { p: 'gymMat', at: 'area', n: 12, r: [-10, 8], s: [1.2, 1.6], v: [{ color: 0xfb7185 }, { color: 0x94a3b8 }] },
      { p: 'desk', at: 'area', n: 8, r: [-8, 8], s: 1, face: 'center', clear: 2 },
      { p: 'chalkboard', at: 'hero', where: 'side', side: 10, t: 0.5, s: 1.4, o: { text: 'STOP IN TIME!' } },
      { p: 'bookshelf', at: 'area', n: 6, r: [8, 16], s: 1.3, face: 'center' },
    ],
    fx: [{ k: 'dust', n: 120 }],
  },

  wait_lights: {
    sky: { top: 0x3f9bff, mid: 0x9fd8ff, horizon: 0xeef8ff, sun: { yaw: 0.9 } },
    accent: 0x22c55e,
    ground: { kind: 'tiles', color: 0xd8dde6, alt: 0xc8ced8, tile: 5 },
    path: { kind: 'stripes', color: 0x3a3f4b, edge: 0xffffff, kerb: 0x22c55e },
    layers: [
      { p: 'trafficLight', at: 'near', n: 5, r: [0.5, 0.9], s: 1.2 },
      lampsNear(7),
      { p: 'toyCar', at: 'area', n: 16, r: [-10, 10], s: [1, 1.3], v: rainbowV },
      { p: 'shop', at: 'area', n: 12, r: [4, 16], s: [1, 1.2], face: 'center', clear: 3 },
      { p: 'bench', at: 'near', n: 9, r: [1.6, 2.4], s: 1 },
      skyline(16, false, [30, 60]),
      trees('treeRound', 14, [-8, 20], [0.8, 1.1]),
      { p: 'arch', at: 'hero', where: 'end', d: 6, o: { text: 'GREEN = GO', colors: [0xef4444, 0xffd23f, 0x22c55e, 0x22c55e, 0x22c55e] } },
      clouds(10),
    ],
    fx: [],
  },

  if_fork: {
    sky: { top: 0x5a7aff, mid: 0xb8c8ff, horizon: 0xf0f4ff, sun: { yaw: -0.3 } },
    accent: 0x6366f1,
    ground: { kind: 'grass', color: 0x7fd66a },
    path: { kind: 'cobble', color: 0xe8e0d0, edge: 0xffffff, kerb: 0x6366f1 },
    layers: [
      { p: 'signpost', at: 'near', n: 7, r: [0.6, 1.2], s: 1.1, v: [
        { text: 'IF ◀ LEFT', bg: '#6366f1', fg: '#ffffff' },
        { text: 'RIGHT ▶', bg: '#22c55e', fg: '#ffffff' },
      ] },
      { p: 'fence', at: 'near', n: 3, r: [2.4, 3], s: 1 },
      trees('treeRound', 36, [4, 40], [1, 1.6]),
      { p: 'bush', at: 'area', n: 30, r: [-12, 14], s: [0.8, 1.4], o: { flowers: true } },
      { p: 'house', at: 'area', n: 6, r: [10, 24], s: [1, 1.3], face: 'center', clear: 3 },
      { p: 'windmill', at: 'hero', where: 'end', d: 12, s: 1.1 },
      hills(),
      clouds(14),
    ],
    fx: [{ k: 'petals', n: 120 }],
  },

  moving_gate: {
    sky: { top: 0x3f9bff, mid: 0xfff0a0, horizon: 0xfffbe6, sun: { yaw: 0.5 } },
    light: 'warm', accent: 0xeab308,
    ground: { kind: 'grass', color: 0x8fd86a },
    path: { kind: 'dirt', color: 0xc8a070, edge: 0xffe39a, kerb: 0xeab308 },
    layers: [
      { p: 'fence', at: 'near', n: 2.4, r: [0.8, 1.4], s: 1, o: { color: 0xffffff } },
      { p: 'puzzleDoor', at: 'hero', where: 'end', d: 5, s: 1.6, o: { color: 0xeab308 } },
      { p: 'house', at: 'area', n: 4, r: [8, 20], s: 1.4, face: 'center', clear: 4, o: { color: 0xc8402a, roof: 0x8a2a1a } },
      { p: 'windmill', at: 'hero', where: 'side', side: 18, t: 0.4, s: 1.2 },
      { p: 'crate', at: 'area', n: 12, r: [-10, 10], s: 1, o: { color: 0xe8c890 } },
      { p: 'barrel', at: 'area', n: 8, r: [-8, 10], s: 1 },
      { p: 'sunflower', at: 'area', n: 30, r: [-10, 16], s: [1, 1.4] },
      trees('treeRound', 20, [10, 40], [1, 1.5]),
      hills([0x9ae07a, 0x8fd86a]),
      clouds(12),
    ],
    fx: [{ k: 'leaves', n: 120 }],
  },

  pattern_mat: {
    light: 'indoor',
    sky: { top: 0xf0fdf4, mid: 0xf0fdf4, horizon: 0xf0fdf4, fog: 0xecfcf0 },
    accent: 0xa855f7,
    room: schoolRoom({ floor: 'checker', floorColor: 0xa8f0c0, floorAlt: 0xe0c8ff, wall: 0xe8fff0, trim: 0xa855f7, tile: 2 }),
    path: { kind: 'tiles', color: 0xffffff, edge: 0xa855f7, kerb: 0xa855f7 },
    layers: [
      { p: 'shapes', at: 'near', n: 3.4, r: [0.8, 2.6], s: [0.8, 1.1] },
      { p: 'toyBlocks', at: 'area', n: 24, r: [-12, 10], s: [1, 1.6] },
      { p: 'easel', at: 'hero', where: 'end', d: 7, s: 1.8, o: { text: '▲ ● ■ ▲' } },
      { p: 'rug', at: 'area', n: 4, r: [-8, 4], s: 1.2, clear: 3, v: [{ color: 0xa855f7 }, { color: 0x22c55e }] },
      { p: 'desk', at: 'area', n: 8, r: [-8, 8], s: 1, face: 'center', clear: 2 },
      { p: 'bookshelf', at: 'area', n: 6, r: [8, 16], s: 1.3, face: 'center' },
    ],
    fx: [{ k: 'sparkles', n: 140 }],
  },

  custom_cup: {
    sky: { top: 0x2f8fff, mid: 0xffb8d8, horizon: 0xfff4e0, sun: { yaw: 0.4 } },
    light: 'warm', accent: 0xec4899,
    ground: { kind: 'grass', color: 0x6fcf5a },
    path: { kind: 'checker', color: 0xffffff, edge: 0x1a1a1a, kerb: 0xec4899 },
    layers: [
      { p: 'trophy', at: 'hero', where: 'end', d: 7, s: 2.6 },
      { p: 'podium', at: 'hero', where: 'end', d: 12, s: 1.3 },
      { p: 'flag', at: 'near', n: 5, r: [1.4, 2.2], s: 1, v: [{ checker: true, color: 0xffffff }, { color: 0xec4899 }] },
      { p: 'grandstand', at: 'area', n: 5, r: [4, 12], s: 1, face: 'center', clear: 6 },
      { p: 'building', at: 'hero', where: 'side', side: 16, t: 0.5, s: 1, o: { text: 'SCHOOL CUP', signBg: '#ec4899', trim: 0xec4899, color: 0xfff6e0, door: 0xfbbf24 } },
      { p: 'balloons', at: 'area', n: 14, r: [-6, 14], s: 1 },
      { p: 'bunting', at: 'near', n: 7, r: [2.6, 3.2], s: 1, o: { colors: RAINBOW } },
      trees('treeRound', 20, [14, 40], [1, 1.5]),
      hills(),
      clouds(10),
      { p: 'fireworks', at: 'sky', n: 4, r: [10, 40], y: [26, 34], s: 1 },
    ],
    fx: [{ k: 'confetti', n: 260 }],
  },
};
