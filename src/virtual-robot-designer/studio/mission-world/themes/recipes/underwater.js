/** Set 4 — underwater robots (Submarine, Deep Sea Bot). Seabed scenes under a water-gradient sky. */

const CORAL = [0xff6b8a, 0xff9a3c, 0xffd23f, 0xb46bff, 0x3fe0c8, 0xff5dd0];
const sea = (top, mid, horizon, o = {}) => ({ top, mid, horizon, fog: horizon, near: 18, far: 150, ...o });
const coral = (n = 60, r = [-12, 20]) => [
  { p: 'coralBranch', at: 'area', n, r, s: [0.9, 1.8], v: CORAL.map((color) => ({ color })) },
  { p: 'coralBrain', at: 'area', n: Math.round(n * 0.6), r, s: [0.8, 1.6], v: CORAL.map((color) => ({ color })) },
  { p: 'coralFan', at: 'area', n: Math.round(n * 0.5), r, s: [1, 1.8], v: CORAL.map((color) => ({ color })) },
];
const reefNear = (step = 2.6) => [
  { p: 'coralBranch', at: 'near', n: step, r: [0.6, 2.6], s: [0.6, 1.1], v: CORAL.map((color) => ({ color })) },
  { p: 'anemone', at: 'near', n: step * 1.6, r: [0.3, 2], s: [0.6, 1], v: CORAL.map((color) => ({ color })) },
];
const fish = (n = 14, y = [3, 9]) => ({ p: 'fishSchool', at: 'area', n, r: [-14, 24], y, s: [0.9, 1.4] });
const rocks = (n = 26, color = 0x6a7a8a) => ({ p: 'rock', at: 'area', n, r: [-10, 40], s: [1, 3], o: { color } });
const bubbles = (n = 320) => ({ k: 'bubbles', n });

export const UNDERWATER_RECIPES = {
  coral_reef_survey: {
    light: 'underwater',
    sky: sea(0x1ab0e8, 0x3fd0f0, 0x2ab8d8),
    accent: 0xff6b8a,
    ground: { kind: 'sand', color: 0xf0dca0, alt: 0xe0c888 },
    path: { kind: 'cobble', color: 0xfff0c8, edge: 0xffffff, kerb: 0xff6b8a },
    layers: [
      ...reefNear(),
      ...coral(80),
      { p: 'seaweed', at: 'area', n: 50, r: [-12, 24], s: [0.8, 1.6] },
      { p: 'starfish', at: 'near', n: 3, r: [0.3, 2.4], s: [0.8, 1.2] },
      { p: 'shell', at: 'area', n: 24, r: [-12, 12], s: [0.8, 1.3] },
      fish(16),
      { p: 'turtle', at: 'area', n: 3, r: [0, 20], y: [4, 8], s: 1.2, single: true },
      { p: 'rockArch', at: 'hero', where: 'end', d: 8, s: 1.2, o: { color: 0xff8a9a } },
      rocks(20, 0x8a9aa8),
    ],
    fx: [bubbles(), { k: 'rays', n: 8 }, { k: 'plankton', n: 200 }],
  },

  kelp_forest_maze: {
    light: 'underwater',
    lights: { sun: 0x9affc8 },
    sky: sea(0x0f8a8a, 0x2ab8a0, 0x1a9a8a),
    accent: 0x3fe08a,
    ground: { kind: 'sand', color: 0xc8c090, alt: 0xb0a878 },
    path: { kind: 'cobble', color: 0xe0d8b0, edge: 0xffffff, kerb: 0x3fe08a },
    layers: [
      { p: 'kelp', at: 'near', n: 2.2, r: [0.8, 3], s: [1, 1.6] },
      { p: 'kelp', at: 'area', n: 120, r: [-14, 30], s: [1.2, 2.2] },
      { p: 'seaweed', at: 'area', n: 40, r: [-14, 20], s: [0.8, 1.4], o: { color: 0x3fa84f } },
      fish(14, [3, 10]),
      { p: 'shell', at: 'near', n: 4, r: [0.3, 2], s: [0.8, 1.2] },
      { p: 'rockArch', at: 'hero', where: 'end', d: 8, s: 1.2, o: { color: 0x5a7a6a } },
      rocks(30, 0x5a6a60),
    ],
    fx: [bubbles(260), { k: 'rays', n: 10, color: 0xc8ffd8 }, { k: 'plankton', n: 260 }],
  },

  turtle_rescue: {
    light: 'underwater',
    sky: sea(0x1a9ae8, 0x4fcaf0, 0x3ab0e0),
    accent: 0x22c55e,
    ground: { kind: 'sand', color: 0xf4e2a8, alt: 0xe8d090 },
    path: { kind: 'cobble', color: 0xfff4d0, edge: 0xffffff, kerb: 0x22c55e },
    layers: [
      { p: 'turtle', at: 'near', n: 7, r: [1.6, 3], y: [1.5, 4], s: [1, 1.3] },
      { p: 'turtle', at: 'area', n: 5, r: [0, 20], y: [4, 9], s: [1.2, 1.6], single: true },
      { p: 'turtle', at: 'hero', where: 'end', d: 7, y: 1.5, s: 2.2 },
      ...reefNear(3.2),
      ...coral(50),
      { p: 'seaweed', at: 'area', n: 40, r: [-12, 24], s: [0.8, 1.6] },
      fish(12),
      rocks(18, 0x9aa8b0),
    ],
    fx: [bubbles(), { k: 'rays', n: 8 }],
  },

  shipwreck_mapping: {
    light: 'deep',
    sky: sea(0x0a3a6a, 0x165a8a, 0x10507a, { near: 14, far: 130 }),
    accent: 0xffc83a,
    ground: { kind: 'sand', color: 0xa89a78, alt: 0x8a7e62 },
    path: { kind: 'glow', color: 0x7a7060, edge: 0xffc83a, kerb: 0xffc83a, glow: 0xffc83a },
    layers: [
      { p: 'shipwreck', at: 'hero', where: 'end', d: 10, s: 1.6 },
      { p: 'shipwreck', at: 'hero', where: 'side', side: 18, t: 0.4, s: 1.1, rotY: 1.2 },
      { p: 'treasureChest', at: 'near', n: 11, r: [1, 2.4], s: 1 },
      { p: 'barrel', at: 'near', n: 5, r: [0.6, 3], s: [0.8, 1.1], o: { color: 0x7a5a3a } },
      { p: 'crate', at: 'area', n: 16, r: [-10, 14], s: [0.8, 1.3], o: { color: 0x8a6a4a } },
      { p: 'seaweed', at: 'area', n: 40, r: [-12, 20], s: [0.8, 1.6], o: { color: 0x3a8a5a } },
      { p: 'jellyfish', at: 'area', n: 10, r: [-8, 20], y: [4, 10], s: [0.9, 1.3], single: true },
      fish(8, [3, 9]),
      rocks(24, 0x4a5a6a),
    ],
    fx: [bubbles(240), { k: 'plankton', n: 300 }, { k: 'rays', n: 5, opacity: 0.12 }],
  },

  glowing_cave: {
    light: 'deep',
    lights: { sunIntensity: 0.35, hemiIntensity: 0.5 },
    sky: sea(0x060a2a, 0x0a1a4a, 0x0a1440, { near: 14, far: 120 }),
    accent: 0x3fe8ff,
    ground: { kind: 'sand', color: 0x3a3a5a, alt: 0x2a2a48 },
    path: { kind: 'glow', color: 0x2a2a4a, edge: 0x3fe8ff, kerb: 0x3fe8ff, glow: 0x3fe8ff },
    layers: [
      { p: 'crystal', at: 'near', n: 2.4, r: [0.8, 3], s: [0.6, 1.2], v: [{ color: 0x3fe8ff }, { color: 0xff5dd0 }, { color: 0x9a7aff }] },
      { p: 'crystal', at: 'area', n: 50, r: [-12, 30], s: [1, 2.6], v: [{ color: 0x3fe8ff }, { color: 0xff5dd0 }, { color: 0x9a7aff }] },
      { p: 'jellyfish', at: 'area', n: 16, r: [-10, 20], y: [3, 10], s: [0.9, 1.4], single: true, v: [{ color: 0xff8ad8 }, { color: 0x7fe8ff }] },
      { p: 'anemone', at: 'area', n: 40, r: [-12, 20], s: [0.8, 1.4], v: [{ color: 0x3fe8ff }, { color: 0xff5dd0 }] },
      { p: 'rockArch', at: 'hero', where: 'end', d: 8, s: 1.3, o: { color: 0x3a3a5a } },
      { p: 'mountain', at: 'ring', n: 14, r: [30, 60], s: [0.8, 1.3], o: { color: 0x2a2a44, snow: false } },
      rocks(30, 0x33334a),
    ],
    fx: [{ k: 'fireflies', n: 260, colors: [0x3fe8ff, 0xff8ad8] }, bubbles(160)],
  },

  current_tunnel: {
    light: 'underwater',
    sky: sea(0x1a8ad8, 0x3ab8e8, 0x2aa0d8),
    accent: 0x22d3ee,
    ground: { kind: 'ripples', color: 0xe8d8a0, alt: 0xd8c488 },
    path: { kind: 'stripes', color: 0x5ad8f0, edge: 0xffffff, kerb: 0x22d3ee },
    layers: [
      { p: 'rockArch', at: 'near', n: 6, r: [2.4, 4], s: [1, 1.3], face: 'along', o: { color: 0x7a8a9a } },
      { p: 'seaweed', at: 'near', n: 2, r: [0.4, 2.4], s: [0.8, 1.2] },
      fish(22, [2, 8]),
      ...coral(40),
      rocks(30, 0x7a8a9a),
      { p: 'kelp', at: 'area', n: 30, r: [4, 30], s: [1, 1.8] },
    ],
    fx: [bubbles(420), { k: 'plankton', n: 300, vx: 4 }, { k: 'rays', n: 8 }],
  },

  sonar_treasure: {
    light: 'underwater',
    sky: sea(0x0f6ab8, 0x2a9ad8, 0x1a88c8),
    accent: 0xffd23f,
    ground: { kind: 'grid', color: 0xe8d8a0, alt: 0xc8b880, tile: 4 },
    path: { kind: 'glow', color: 0xd8c890, edge: 0xffd23f, kerb: 0xffd23f, glow: 0xffd23f },
    layers: [
      { p: 'treasureChest', at: 'near', n: 8, r: [1, 2.4], s: 1.1 },
      { p: 'treasureChest', at: 'hero', where: 'end', d: 7, s: 2.2 },
      { p: 'glowPad', at: 'near', n: 5, r: [0.6, 2], s: 1, o: { color: 0x22d3ee } },
      { p: 'shell', at: 'area', n: 30, r: [-12, 16], s: [0.8, 1.4] },
      { p: 'starfish', at: 'area', n: 24, r: [-12, 16], s: [0.8, 1.4] },
      ...coral(40),
      fish(10),
      rocks(20),
    ],
    fx: [bubbles(), { k: 'sparkles', n: 160, colors: [0xffd23f] }, { k: 'rays', n: 7 }],
  },

  ocean_cleanup: {
    light: 'underwater',
    sky: sea(0x1a90d0, 0x3ab8e0, 0x2aa8d0),
    accent: 0x22c55e,
    ground: { kind: 'sand', color: 0xf0dca0, alt: 0xe0c888 },
    path: { kind: 'cobble', color: 0xfff0c8, edge: 0xffffff, kerb: 0x22c55e },
    layers: [
      { p: 'bins', at: 'near', n: 9, r: [1, 2], s: 1.1 },
      { p: 'barrel', at: 'near', n: 5, r: [0.6, 3], s: [0.6, 0.9], v: [{ color: 0x3fa7ff }, { color: 0x22c55e }, { color: 0xffd23f }] },
      { p: 'crate', at: 'area', n: 12, r: [-10, 14], s: [0.8, 1.2], o: { color: 0x3fa7ff } },
      ...reefNear(3),
      ...coral(50),
      { p: 'turtle', at: 'area', n: 3, r: [0, 16], y: [4, 8], s: 1.2, single: true },
      fish(14),
      { p: 'building', at: 'hero', where: 'end', d: 10, s: 1.2, o: { text: 'RECYCLE BASE', signBg: '#22c55e', trim: 0x22c55e, color: 0xe8f8ff, door: 0x22c55e } },
      rocks(18),
    ],
    fx: [bubbles(), { k: 'rays', n: 8 }, { k: 'plankton', n: 200 }],
  },

  thermal_vent_lab: {
    light: 'deep',
    lights: { sun: 0xffb87a },
    sky: sea(0x0a2a4a, 0x1a3a5a, 0x2a3a50, { near: 16, far: 130 }),
    accent: 0xff7a1a,
    ground: { kind: 'cobble', color: 0x4a4a55, alt: 0x3a3a44 },
    path: { kind: 'glow', color: 0x3a3a44, edge: 0xff7a1a, kerb: 0xff7a1a, glow: 0xff7a1a },
    layers: [
      { p: 'vent', at: 'near', n: 6, r: [2, 3.4], s: [1, 1.4] },
      { p: 'vent', at: 'area', n: 14, r: [-10, 20], s: [1.2, 2] },
      { p: 'dome', at: 'hero', where: 'end', d: 10, s: 1.3 },
      { p: 'pipes', at: 'area', n: 8, r: [-6, 12], s: 1.2, o: { color: 0xa0a8b8 } },
      { p: 'anemone', at: 'area', n: 30, r: [-12, 20], s: [0.8, 1.3], v: [{ color: 0xff7a1a }, { color: 0xffd23f }] },
      { p: 'crystal', at: 'area', n: 16, r: [-6, 20], s: [0.8, 1.4], o: { color: 0xff9a3c } },
      rocks(34, 0x3a3a48),
      { p: 'mountain', at: 'ring', n: 12, r: [30, 60], s: [0.8, 1.2], o: { color: 0x2a2a38, snow: false } },
    ],
    fx: [bubbles(360), { k: 'embers', n: 160 }],
  },

  ocean_explorer: {
    light: 'underwater',
    sky: sea(0x1aa0e8, 0x4fd0f4, 0x30b8e0),
    accent: 0xfbbf24,
    ground: { kind: 'sand', color: 0xf4e0a0, alt: 0xe4cc88 },
    path: { kind: 'rainbow', kerb: 0xfbbf24 },
    layers: [
      { p: 'trophy', at: 'hero', where: 'end', d: 7, s: 2.4 },
      { p: 'rockArch', at: 'hero', where: 'end', d: 9, s: 1.5, o: { color: 0xffb070 } },
      { p: 'shipwreck', at: 'hero', where: 'side', side: 20, t: 0.5, s: 1.2 },
      ...reefNear(2.4),
      ...coral(90),
      { p: 'treasureChest', at: 'near', n: 12, r: [1.4, 2.6], s: 1 },
      { p: 'turtle', at: 'area', n: 4, r: [0, 20], y: [4, 9], s: 1.3, single: true },
      { p: 'jellyfish', at: 'area', n: 8, r: [0, 20], y: [5, 11], s: 1.2, single: true },
      fish(20),
      { p: 'kelp', at: 'area', n: 30, r: [6, 30], s: [1, 1.8] },
      rocks(20, 0x8a9aa8),
    ],
    fx: [bubbles(360), { k: 'rays', n: 10 }, { k: 'sparkles', n: 140 }],
  },
};
