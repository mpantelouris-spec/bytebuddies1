/** Block Crafter — voxel plains, mines, and sky islands (kid-safe block-world fantasy). */
import { birds, clouds, hills, mountains, trees } from './common.js';

const GRASS = { kind: 'checker', color: 0x5ea832, alt: 0x4d9428, tile: 4 };
const GRASS_PATH = { kind: 'tiles', color: 0x8b6914, edge: 0x6b5210, kerb: 0xc4a035 };
const COBBLE = { kind: 'cobble', color: 0x8a8a8a, alt: 0x6a6a6a };
const STONE = { kind: 'cobble', color: 0x7a7a7a, alt: 0x5a5a5a };

export const BLOCKWORLD_RECIPES = {
  grassland_spawn: {
    sky: { top: 0x4aa8ff, mid: 0x87ceeb, horizon: 0xc8e8ff, sun: { yaw: 0.3 } },
    accent: 0x5ea832,
    ground: GRASS,
    path: { kind: 'tiles', color: 0x8b6914, edge: 0x6b5210, kerb: 0x5ea832 },
    layers: [
      { p: 'toyBlocks', at: 'near', n: 4, r: [0.6, 2.4], s: [1, 1.4] },
      { p: 'toyBlocks', at: 'area', n: 36, r: [-14, 28], s: [1.2, 2.2] },
      { p: 'tower', at: 'area', n: 8, r: [6, 26], s: [0.55, 0.85], v: [{ color: 0x5ea832, roof: 0x8b6914 }, { color: 0x8b6914, roof: 0x5ea832 }] },
      { p: 'workbench', at: 'hero', where: 'end', d: 8, s: 1.3, o: { color: 0x8b6914 } },
      trees('treeRound', 22, [8, 38], [1, 1.35], [{ color: 0x5ea832 }, { color: 0x4d9428 }]),
      hills([0x6fbf3a, 0x5ea832]),
      clouds(14),
    ],
    fx: [{ k: 'sparkles', n: 120 }],
  },

  forest_path: {
    sky: { top: 0x3a8a4a, mid: 0x7ec850, horizon: 0xc8f0a8, sun: { yaw: -0.2 } },
    accent: 0x22c55e,
    ground: { kind: 'grass', color: 0x4d9428, alt: 0x3d7a20 },
    path: GRASS_PATH,
    layers: [
      { p: 'treeRound', at: 'near', n: 6, r: [0.4, 2.8], s: [1.1, 1.5], o: { color: 0x3d7a20 } },
      { p: 'treeRound', at: 'area', n: 48, r: [-14, 32], s: [1, 1.6], o: { color: 0x4d9428 } },
      { p: 'toyBlocks', at: 'area', n: 20, r: [-8, 18], s: [1, 1.8] },
      { p: 'fire', at: 'hero', where: 'mid', d: 12, s: 1.1 },
      { p: 'workbench', at: 'hero', where: 'end', d: 8, s: 1.2, o: { color: 0x8b6914 } },
      hills([0x5ea832, 0x3d7a20]),
      clouds(10),
    ],
    fx: [{ k: 'fireflies', n: 80, colors: [0x7fff9a, 0xffffff] }],
  },

  village_cobble: {
    sky: { top: 0x6eb5ff, mid: 0x9fd4ff, horizon: 0xfff4d6, sun: { yaw: 0.5 } },
    accent: 0xc4a035,
    ground: COBBLE,
    path: { kind: 'cobble', color: 0x9a9a9a, edge: 0x6a6a6a, kerb: 0xc4a035 },
    layers: [
      { p: 'tower', at: 'near', n: 3, r: [1, 2.5], s: [0.7, 1], v: [{ color: 0x8b6914, roof: 0x8a3030 }, { color: 0x9a9a9a, roof: 0x6a4020 }] },
      { p: 'tower', at: 'area', n: 12, r: [-10, 24], s: [0.6, 0.95], v: [{ color: 0x8b6914, roof: 0x5ea832 }, { color: 0x9a9a9a, roof: 0x8a3030 }] },
      { p: 'lantern', at: 'area', n: 10, r: [-6, 16], s: 1.1 },
      { p: 'lantern', at: 'hero', where: 'mid', d: 10, s: 1.2 },
      { p: 'workbench', at: 'hero', where: 'end', d: 7, s: 1.4, o: { color: 0x8b6914 } },
      hills([0x8a8a8a, 0x6a6a6a]),
      clouds(8),
    ],
  },

  surface_mine: {
    light: 'overcast',
    sky: { top: 0x64748b, mid: 0x94a3b8, horizon: 0xc8d0dc, fog: 0xb8c4d0 },
    accent: 0xfbbf24,
    ground: { kind: 'checker', color: 0x8b6914, alt: 0x6b5210, tile: 5 },
    path: { kind: 'tiles', color: 0x78716c, edge: 0x57534e, kerb: 0xfbbf24 },
    layers: [
      { p: 'crate', at: 'near', n: 2, r: [1, 2], s: 1.1 },
      { p: 'toyBlocks', at: 'area', n: 28, r: [-12, 22], s: [1.2, 2], v: [{ color: 0xfbbf24 }, { color: 0x78716c }, { color: 0x57534e }] },
      { p: 'crystal', at: 'area', n: 16, r: [-8, 20], s: [1, 2], v: [{ color: 0x22d3ee }, { color: 0xfbbf24 }] },
      { p: 'tower', at: 'hero', where: 'end', d: 8, s: 1.2, v: [{ color: 0x57534e, roof: 0xfbbf24 }] },
      mountains(0x78716c, 8, { snow: false }),
    ],
    fx: [{ k: 'sparkles', n: 90, colors: [0xfbbf24, 0xffffff] }],
  },

  desert_ruins: {
    sky: { top: 0xfbbf24, mid: 0xfde68a, horizon: 0xfff7ed, sun: { yaw: 0.8, intensity: 1.1 } },
    accent: 0xd97706,
    ground: { kind: 'sand', color: 0xe8c860, alt: 0xd4a840 },
    path: { kind: 'tiles', color: 0xc4a035, edge: 0x8a3030, kerb: 0xd97706 },
    layers: [
      { p: 'pillar', at: 'area', n: 14, r: [-10, 26], s: [1, 1.4], o: { color: 0xc4a035 } },
      { p: 'puzzleDoor', at: 'hero', where: 'mid', d: 11, s: 1.5, o: { color: 0x8a3030 } },
      { p: 'crystal', at: 'hero', where: 'end', d: 8, s: 3, o: { color: 0x22d3ee } },
      { p: 'rockArch', at: 'area', n: 5, r: [8, 24], s: 1.1, o: { color: 0xd4a840 } },
      mountains(0xd4a840, 6, { snow: false }),
      clouds(6, { color: 0xfff7ed }),
    ],
  },

  snowy_peaks: {
    sky: { top: 0x93c5fd, mid: 0xe0f2fe, horizon: 0xffffff, sun: { yaw: 0.2 } },
    accent: 0x38bdf8,
    ground: { kind: 'snow', color: 0xf0f9ff, alt: 0xe2e8f0 },
    path: { kind: 'tiles', color: 0xc8d0dc, edge: 0x94a3b8, kerb: 0x38bdf8 },
    layers: [
      { p: 'treePine', at: 'area', n: 28, r: [-12, 30], s: [1, 1.5], o: { color: 0x1e3a2a } },
      { p: 'toyBlocks', at: 'area', n: 18, r: [-8, 18], s: [1, 1.6], v: [{ color: 0xe2e8f0 }, { color: 0x94a3b8 }] },
      { p: 'tower', at: 'hero', where: 'mid', d: 12, s: 0.9, v: [{ color: 0xe2e8f0, roof: 0x94a3b8 }] },
      { p: 'crystal', at: 'hero', where: 'end', d: 8, s: 2.5, o: { color: 0x7dd3fc } },
      mountains(0xdce6ff, 10, { snow: true }),
      clouds(12, { color: 0xffffff }),
    ],
    fx: [{ k: 'sparkles', n: 160, colors: [0xffffff, 0xbae6fd] }],
  },

  crimson_cavern: {
    light: 'night',
    sky: { top: 0x2a0a0a, mid: 0x4a1515, horizon: 0x6a2020, fog: 0x3a1010, stars: 400 },
    accent: 0xef4444,
    ground: STONE,
    path: { kind: 'glow', color: 0x3a1010, edge: 0xef4444, kerb: 0xf97316, glow: 0xef4444 },
    layers: [
      { p: 'lavaPool', at: 'area', n: 6, r: [-8, 20], s: [1.2, 1.8] },
      { p: 'crystal', at: 'area', n: 24, r: [-10, 28], s: [1, 2.2], v: [{ color: 0xef4444 }, { color: 0xf97316 }] },
      { p: 'tower', at: 'area', n: 10, r: [4, 22], s: [0.6, 0.9], v: [{ color: 0x57534e, roof: 0xef4444 }] },
      { p: 'puzzleDoor', at: 'hero', where: 'end', d: 7, s: 1.6, o: { color: 0xef4444 } },
      { p: 'mountain', at: 'ring', n: 10, r: [50, 90], s: [1, 1.4], o: { color: 0x2a0a0a, snow: false } },
    ],
    fx: [{ k: 'embers', n: 120, colors: [0xef4444, 0xfbbf24] }],
  },

  deep_stone_hall: {
    light: 'indoor',
    sky: { top: 0x1a1520, mid: 0x2a2530, horizon: 0x3a3540, fog: 0x252030 },
    accent: 0xa78bfa,
    ground: STONE,
    path: { kind: 'glow', color: 0x2a2530, edge: 0xa78bfa, kerb: 0x7c3aed, glow: 0xa78bfa },
    layers: [
      { p: 'pillar', at: 'near', n: 6, r: [0.8, 2.2], s: [1, 1.2], o: { color: 0x57534e } },
      { p: 'crystal', at: 'area', n: 40, r: [-12, 32], s: [1, 2.6], v: [{ color: 0xa78bfa }, { color: 0x22d3ee }, { color: 0xfbbf24 }] },
      { p: 'crate', at: 'area', n: 4, r: [6, 18], s: 1 },
      { p: 'crystal', at: 'hero', where: 'end', d: 9, s: 4, o: { color: 0x22d3ee } },
      { p: 'lantern', at: 'area', n: 14, r: [-6, 14], s: 0.9 },
    ],
    fx: [{ k: 'sparkles', n: 200, colors: [0xa78bfa, 0x22d3ee] }],
  },

  sky_islands: {
    sky: { top: 0x2563eb, mid: 0x60a5fa, horizon: 0xbae6fd, sun: { yaw: 0.4 } },
    accent: 0x38bdf8,
    ground: { kind: 'open_sky' },
    path: { kind: 'glow', color: 0x1e3a8a, edge: 0x38bdf8, kerb: 0x7dd3fc, glow: 0x38bdf8 },
    layers: [
      { p: 'floatingIsland', at: 'area', n: 12, r: [-14, 28], s: [1.2, 2], o: { grass: 0x5ea832, dirt: 0x8b6914 } },
      { p: 'toyBlocks', at: 'area', n: 24, r: [-10, 24], y: [4, 16], s: [1, 1.8] },
      { p: 'cloud', at: 'near', n: 4, r: [0.5, 2], y: [2, 6], s: 1.2 },
      { p: 'giantStar', at: 'hero', where: 'end', d: 10, y: 6, s: 2, o: { color: 0xfbbf24 } },
      clouds(20, { color: 0xffffff }),
      birds(4),
    ],
    fx: [{ k: 'sparkles', n: 180 }],
  },

  master_builder_cup: {
    sky: { top: 0x4aa8ff, mid: 0xfbbf24, horizon: 0xffe23a, sun: { yaw: 0.1 } },
    accent: 0xfbbf24,
    ground: GRASS,
    path: { kind: 'rainbow', kerb: 0xffffff },
    layers: [
      { p: 'toyBlocks', at: 'near', n: 6, r: [0.5, 2.5], s: [1.2, 1.8] },
      { p: 'tower', at: 'area', n: 16, r: [-14, 30], s: [0.65, 1.1], v: [{ color: 0xef4444, roof: 0xfbbf24 }, { color: 0x3b82f6, roof: 0x22c55e }, { color: 0xa855f7, roof: 0xf472b6 }] },
      { p: 'workbench', at: 'hero', where: 'mid', d: 10, s: 1.5, o: { color: 0x8b6914 } },
      { p: 'giantStar', at: 'hero', where: 'end', d: 9, y: 5, s: 2.4, o: { color: 0xfbbf24 } },
      { p: 'rainbow', at: 'hero', where: 'end', d: 14, s: 0.55 },
      hills([0x6fbf3a, 0xfbbf24]),
      clouds(16),
    ],
    fx: [{ k: 'confetti', n: 220 }, { k: 'sparkles', n: 240 }],
  },
};
