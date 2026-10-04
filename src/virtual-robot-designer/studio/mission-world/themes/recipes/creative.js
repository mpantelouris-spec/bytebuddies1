/** Set 8 — creative & fantasy robots (LEGO Bot, Ninja, Blaster, Stealth). */
import { clouds, mountains, hills, trees, birds, room } from './common.js';

const RAINBOW = [0xff5d5d, 0xffd23f, 0x3fa7ff, 0x3fcf7a, 0xb46bff];
const rainbowV = RAINBOW.map((color) => ({ color }));
const GLOW = [0x3fe8ff, 0xff5dd0, 0x9a7aff, 0x7fff9a];
const glowV = GLOW.map((color) => ({ color }));

export const CREATIVE_RECIPES = {
  color_magic_lab: {
    light: 'indoor',
    sky: { top: 0xfff0fb, mid: 0xfff0fb, horizon: 0xfff0fb, fog: 0xffecf8 },
    accent: 0xff5dd0,
    room: room({ floor: 'checker', floorColor: 0xffffff, floorAlt: 0xffd8f4, wall: 0xf8e6ff, trim: 0xff5dd0, outside: 0xc8e8ff, tile: 3 }),
    path: { kind: 'rainbow', kerb: 0xffffff },
    layers: [
      { p: 'paintPots', at: 'near', n: 3, r: [0.6, 2.2], s: [1, 1.3] },
      { p: 'easel', at: 'area', n: 10, r: [-10, 8], s: [1, 1.3], face: 'center', v: [{ text: '★' }, { text: 'RGB' }, { text: '♥' }] },
      { p: 'crayon', at: 'area', n: 24, r: [-12, 10], s: [1.6, 2.6], v: rainbowV },
      { p: 'rainbow', at: 'hero', where: 'end', d: 12, s: 0.5 },
      { p: 'glowPad', at: 'area', n: 24, r: [-12, 10], s: [1, 1.6], v: rainbowV },
      { p: 'painting', at: 'area', n: 10, r: [8, 16], s: [1.2, 1.6], face: 'center', v: [{ text: 'RED' }, { text: 'BLUE' }, { text: 'GREEN' }] },
      { p: 'balloons', at: 'area', n: 8, r: [-6, 8], s: 1 },
    ],
    fx: [{ k: 'sparkles', n: 220 }, { k: 'confetti', n: 120 }],
  },

  shadow_puzzle: {
    light: 'night',
    sky: { top: 0x120a3a, mid: 0x221a5a, horizon: 0x3a2a7a, fog: 0x1e1650, stars: 800 },
    accent: 0x22d3ee,
    ground: { kind: 'cobble', color: 0x3a3060, alt: 0x2e2650 },
    path: { kind: 'glow', color: 0x2a2450, edge: 0x22d3ee, kerb: 0x22d3ee, glow: 0x22d3ee },
    layers: [
      { p: 'pillar', at: 'near', n: 5, from: 8, r: [2.4, 3.4], s: [1, 1.2], o: { color: 0x6a5aa0 } },
      { p: 'mirror', at: 'near', n: 9, r: [1, 2], s: 1.1 },
      { p: 'lamp', at: 'near', n: 7, r: [0.6, 1], s: 1, o: { color: 0x7fe8ff } },
      { p: 'puzzleDoor', at: 'hero', where: 'end', d: 7, s: 1.6, o: { color: 0x22d3ee } },
      { p: 'crystal', at: 'area', n: 30, r: [-10, 30], s: [1, 2.2], v: glowV },
      { p: 'rockArch', at: 'area', n: 4, r: [4, 20], s: 1, clear: 6, o: { color: 0x4a3a7a } },
      { p: 'mountain', at: 'ring', n: 12, r: [60, 110], s: [1, 1.5], o: { color: 0x2a2250, snow: false } },
    ],
    fx: [{ k: 'fireflies', n: 220, colors: [0x7fe8ff, 0xb49aff] }],
  },

  crystal_garden: {
    sky: { top: 0xb46bff, mid: 0xf0b8ff, horizon: 0xffeefc, sun: { yaw: -0.4 } },
    accent: 0xff5dd0,
    ground: { kind: 'grass', color: 0xc8a8f0, alt: 0xd8b8ff },
    path: { kind: 'glow', color: 0xf0e0ff, edge: 0xff5dd0, kerb: 0xff5dd0, glow: 0xff8ad8 },
    layers: [
      { p: 'crystalFlower', at: 'near', n: 2.2, r: [0.4, 2.6], s: [0.8, 1.2], v: [{ color: 0xff5dd0 }, { color: 0x7fe8ff }, { color: 0xb49aff }] },
      { p: 'crystal', at: 'area', n: 60, r: [-12, 36], s: [1, 2.8], v: [{ color: 0xff8ad8 }, { color: 0xb49aff }, { color: 0x7fe8ff }] },
      { p: 'crystalFlower', at: 'area', n: 40, r: [-12, 20], s: [1, 1.6], v: [{ color: 0xff5dd0 }, { color: 0x7fe8ff }] },
      { p: 'treeBlossom', at: 'area', n: 16, r: [6, 36], s: [1, 1.5], o: { color: 0xffa8e8 } },
      { p: 'crystal', at: 'hero', where: 'end', d: 9, s: 4, o: { color: 0xff5dd0 } },
      hills([0xd8b8ff, 0xc8a0f0, 0xffc8f0]),
      mountains(0xb08ae0, 10, { snow: false }),
      clouds(14, { color: 0xfff0ff }),
    ],
    fx: [{ k: 'sparkles', n: 320 }, { k: 'petals', n: 120, colors: [0xff8ad8, 0xffffff] }],
  },

  music_tile_path: {
    sky: { top: 0x3f7fff, mid: 0xa8c8ff, horizon: 0xfff0ff, sun: { yaw: 0.6 } },
    accent: 0xb46bff,
    ground: { kind: 'grass', color: 0x8fd86a },
    path: { kind: 'tiles', color: 0xffffff, edge: 0x1a1a1a, kerb: 0xb46bff },
    layers: [
      { p: 'pianoKeys', at: 'near', n: 8, r: [1.4, 2.4], s: 1 },
      { p: 'musicNote', at: 'near', n: 2.6, r: [0.6, 3], y: [1.5, 4], s: [0.9, 1.3], v: rainbowV },
      { p: 'musicNote', at: 'area', n: 40, r: [-10, 30], y: [2, 12], s: [1.2, 2.4], v: rainbowV },
      { p: 'bells', at: 'area', n: 8, r: [-6, 14], s: 1.4 },
      { p: 'stage', at: 'hero', where: 'end', d: 9, s: 1.4, o: { text: 'MUSIC LAND', color: 0x3a2a6a, trim: 0xb46bff } },
      trees('treeRound', 30, [6, 40], [1, 1.5], [{ color: 0x9ae68f }, { color: 0xffb3d9 }]),
      hills([0x9ae07a, 0x7fd66a]),
      clouds(14),
      birds(3),
    ],
    fx: [{ k: 'sparkles', n: 200 }],
  },

  shape_builder: {
    sky: { top: 0x2f9bff, mid: 0x9fdcff, horizon: 0xfffbe6, sun: { yaw: -0.2 } },
    accent: 0xffc400,
    ground: { kind: 'checker', color: 0x7fd66a, alt: 0x6fc85a, tile: 6 },
    path: { kind: 'tiles', color: 0xffd23f, edge: 0xff8a3d, kerb: 0xff8a3d },
    layers: [
      { p: 'shapes', at: 'near', n: 4, r: [0.8, 2.8], s: [0.9, 1.3] },
      { p: 'shapes', at: 'area', n: 40, r: [-12, 30], s: [1.4, 2.6] },
      { p: 'toyBlocks', at: 'area', n: 30, r: [-10, 20], s: [1.2, 2] },
      { p: 'tower', at: 'area', n: 10, r: [8, 30], s: [0.5, 0.8], v: rainbowV.map((v) => ({ ...v, roof: 0xffffff })) },
      { p: 'giantStar', at: 'hero', where: 'end', d: 9, y: 4, s: 2, o: { color: 0xffd23f } },
      hills([0x8fe07a, 0x6fcf5a]),
      clouds(12),
    ],
    fx: [{ k: 'confetti', n: 180 }],
  },

  lantern_trail: {
    light: 'night',
    lights: { sun: 0xffc890 },
    sky: { top: 0x140a2a, mid: 0x3a1a3a, horizon: 0x7a2a2a, fog: 0x3a1a2a, stars: 700 },
    accent: 0xff8a3d,
    ground: { kind: 'grass', color: 0x2a3a2a },
    path: { kind: 'cobble', color: 0x6a5a4a, edge: 0xffc83a, kerb: 0xff8a3d },
    layers: [
      { p: 'paperLantern', at: 'near', n: 3, r: [0.8, 2], y: [2.4, 3.6], s: 1, v: [{ color: 0xff5d3d }, { color: 0xffa83d }, { color: 0xffd23f }] },
      { p: 'lamp', at: 'near', n: 6, r: [0.6, 1], s: 1, o: { color: 0xffb870 } },
      { p: 'lantern', at: 'sky', n: 70, r: [-10, 40], y: [8, 30], s: [0.9, 1.4], v: [{ color: 0xff8a3d }, { color: 0xffd23f }, { color: 0xff5d5d }] },
      trees('treeBlossom', 24, [4, 36], [1, 1.5]),
      { p: 'pond', at: 'area', n: 2, r: [6, 20], s: 1.2, clear: 8, o: { color: 0x2a3a6a, lilies: true } },
      { p: 'arch', at: 'hero', where: 'end', d: 6, o: { text: 'LANTERN GATE', colors: [0xff5d3d, 0xffa83d, 0xffd23f, 0xff5d3d, 0xffa83d] } },
      { p: 'mountain', at: 'ring', n: 10, r: [70, 120], s: [1, 1.5], o: { color: 0x2a1a30, snow: false } },
    ],
    fx: [{ k: 'fireflies', n: 260 }],
  },

  puzzle_door_hall: {
    sky: { top: 0x8a6aff, mid: 0xc4b5fd, horizon: 0xf0e8ff, sun: { yaw: 0.3 } },
    accent: 0x22c55e,
    ground: { kind: 'cobble', color: 0xc8b898, alt: 0xb8a888 },
    path: { kind: 'tiles', color: 0xe8dcc0, edge: 0x22c55e, kerb: 0x22c55e },
    layers: [
      { p: 'pillar', at: 'near', n: 5, from: 8, r: [1.8, 2.6], s: [1, 1.3], o: { color: 0xe8dcc0 } },
      { p: 'puzzleDoor', at: 'area', n: 10, r: [-6, 16], s: [1, 1.2], face: 'center', clear: 4, v: [{ color: 0x22c55e }, { color: 0x3fa7ff }, { color: 0xff5d8f }] },
      { p: 'puzzleDoor', at: 'hero', where: 'end', d: 6, s: 2, o: { color: 0xffd23f } },
      { p: 'rock', at: 'area', n: 30, r: [-10, 30], s: [1, 2.4], o: { color: 0xb8a888 } },
      { p: 'pillar', at: 'area', n: 20, r: [-6, 24], s: [1, 1.6], o: { color: 0xd8c8a8 } },
      trees('treeRound', 20, [10, 40], [1, 1.5], [{ color: 0x6ab85a }]),
      { p: 'mesa', at: 'ring', n: 10, r: [80, 130], s: [1, 1.5], o: { color: 0xb49a7a } },
      clouds(12),
    ],
    fx: [{ k: 'sparkles', n: 160 }],
  },

  glow_bridge: {
    light: 'night',
    sky: { top: 0x020618, mid: 0x0a1440, horizon: 0x1a2a6a, fog: 0x0a1440, stars: 1000 },
    accent: 0x3fe8ff,
    ground: { kind: 'water', color: 0x0a2a5a, alt: 0x103a70 },
    path: { kind: 'glow', color: 0x1a2a5a, edge: 0x3fe8ff, kerb: 0x3fe8ff, glow: 0x3fe8ff },
    layers: [
      { p: 'glowPad', at: 'near', n: 2.4, r: [0.3, 1.6], s: [0.8, 1.2], v: glowV },
      { p: 'lamp', at: 'near', n: 5, r: [0.4, 0.8], s: 1, o: { color: 0x7fe8ff } },
      { p: 'crystal', at: 'area', n: 30, r: [4, 36], s: [1, 2.4], v: glowV },
      { p: 'jellyfish', at: 'area', n: 12, r: [0, 30], y: [4, 12], s: [1, 1.6], single: true, v: [{ color: 0xff8ad8 }, { color: 0x7fe8ff }] },
      { p: 'giantStar', at: 'hero', where: 'end', d: 9, y: 5, s: 2, o: { color: 0x7fe8ff } },
      { p: 'planet', at: 'hero', where: 'side', side: -200, t: 0.5, y: 80, s: 2.4, o: { color: 0x9a7aff, ring: true } },
    ],
    fx: [{ k: 'fireflies', n: 300, colors: [0x7fe8ff, 0xff8ad8, 0xb49aff] }, { k: 'stars', n: 120, height: 30 }],
  },

  festival_parade: {
    sky: { top: 0x2f8fff, mid: 0x9fd8ff, horizon: 0xfff0e6, sun: { yaw: 0.7 } },
    light: 'warm', accent: 0xff5dd0,
    ground: { kind: 'tiles', color: 0xf0e0c8, alt: 0xe0d0b8, tile: 4 },
    path: { kind: 'rainbow', kerb: 0xffffff },
    layers: [
      { p: 'paradeFloat', at: 'near', n: 9, r: [2, 3.4], s: 1, v: rainbowV },
      { p: 'bunting', at: 'near', n: 5, r: [2.4, 3], s: 1, o: { colors: RAINBOW } },
      { p: 'balloons', at: 'near', n: 5, r: [1, 2.4], s: 1 },
      { p: 'stall', at: 'area', n: 16, r: [-8, 14], s: 1, v: rainbowV },
      { p: 'house', at: 'area', n: 14, r: [8, 24], s: [1, 1.3], face: 'center', clear: 3 },
      { p: 'carousel', at: 'hero', where: 'side', side: 16, t: 0.5, s: 1 },
      { p: 'arch', at: 'hero', where: 'end', d: 6, o: { text: 'PARADE!', colors: RAINBOW } },
      { p: 'hotAirBalloon', at: 'sky', n: 4, r: [10, 40], y: [20, 30], s: 1 },
      trees('treeRound', 16, [16, 40], [1, 1.4]),
      clouds(12),
    ],
    fx: [{ k: 'confetti', n: 320 }],
  },

  creator_finale: {
    light: 'sunset',
    sky: { top: 0x3a2a8a, mid: 0xff8ab8, horizon: 0xffd8a0, sun: { yaw: 0.1, height: 30 }, stars: 300 },
    accent: 0xfbbf24,
    ground: { kind: 'grass', color: 0x8ac86a },
    path: { kind: 'checker', color: 0xffffff, edge: 0x1a1a1a, kerb: 0xfbbf24 },
    layers: [
      { p: 'trophy', at: 'hero', where: 'end', d: 7, s: 2.6 },
      { p: 'ferrisWheel', at: 'hero', where: 'side', side: 24, t: 0.5, s: 1.1 },
      { p: 'carousel', at: 'hero', where: 'side', side: -18, t: 0.3, s: 1 },
      { p: 'stall', at: 'near', n: 6, r: [1.6, 2.6], s: 1, v: rainbowV },
      { p: 'paperLantern', at: 'near', n: 4, r: [0.8, 2], y: [2.4, 3.6], s: 1, v: rainbowV },
      { p: 'crystal', at: 'area', n: 20, r: [4, 30], s: [1, 2], v: glowV },
      { p: 'balloons', at: 'area', n: 14, r: [-6, 14], s: 1 },
      { p: 'fireworks', at: 'sky', n: 6, r: [10, 50], y: [26, 38], s: 1.2 },
      trees('treeBlossom', 20, [10, 40], [1, 1.5]),
      hills([0x9ad87a, 0x8ac86a]),
      mountains(0x8a6ab0, 9, { snow: false }),
    ],
    fx: [{ k: 'confetti', n: 240 }, { k: 'sparkles', n: 160 }],
  },
};
