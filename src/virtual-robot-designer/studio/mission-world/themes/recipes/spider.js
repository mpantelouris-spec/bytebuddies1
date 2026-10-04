/** Spider Bot worlds: webs, vines, ruins and caves — places a climber belongs. */
import { biome } from './biomes.js';
import { trees, flowersNear } from './common.js';

const arch = (text, colors, d = 6) => ({ p: 'arch', at: 'hero', where: 'end', d, o: { text, colors } });
const websNear = (step = 7, o = {}) => ({ p: 'spiderWeb', at: 'near', n: step, r: [1.2, 2.4], s: [0.8, 1.1], face: 'road', o });
const websArea = (n = 8, o = {}) => ({ p: 'spiderWeb', at: 'area', n, r: [2, 18], s: [1, 1.6], clear: 3, o });
const heroWeb = (o = {}) => ({ p: 'spiderWeb', at: 'hero', where: 'end', d: 9, s: 2, o: { r: 3, ...o } });

export const SPIDER_RECIPES = {
  // ─── Arena 1: The Giant Garden — Byte is insect-sized ───────────────
  giant_garden: biome('meadow', {
    accent: 0xffd23f,
    cpColor: 0xff8fc7,          // petal-pink checkpoint hoops
    hideGantry: true,
    camera: { camBack: 7.2, camUp: 1.5, lookAhead: 11, lookHeight: 4.2, fov: 60 }, // bug's-eye, looking up at the flowers
    sky: { top: 0x2f8cff, mid: 0x8fd0ff, horizon: 0xd8f2ff, fog: 0xcdeeff, near: 60, far: 280, sun: { yaw: 0.4 } },
    ground: { kind: 'grass', color: 0x4fb83c, alt: 0x45a834 },
    path: { kind: 'dirt', color: 0xc99a5e, edge: 0xe8c890, noKerbs: true },
    layers: [
      // Grass walls line the path so it reads as a trail through a forest
      { p: 'giantGrass', at: 'near', n: 2.2, r: [0.3, 2.4], s: [0.8, 1.3] },
      { p: 'giantClover', at: 'near', n: 5, r: [0.6, 2.6], s: [0.9, 1.3] },
      { p: 'pebble', at: 'near', n: 7, r: [0.4, 2], s: [0.6, 1.1] },
      { p: 'ladybird', at: 'near', n: 14, r: [1.5, 3], s: 1.2 },
      { p: 'giantDaisy', at: 'area', n: 14, r: [2, 16], s: [0.9, 1.3], clear: 3 },
      { p: 'giantTulip', at: 'area', n: 10, r: [2, 18], s: [0.9, 1.3], clear: 3 },
      { p: 'giantSunflower', at: 'area', n: 5, r: [8, 24], s: [0.9, 1.2], clear: 4, single: true },
      { p: 'dewdrop', at: 'area', n: 4, r: [3, 16], s: 1, clear: 5 },
      { p: 'mushroom', at: 'area', n: 10, r: [2, 18], s: [2.5, 4] },
      { p: 'giantGrass', at: 'area', n: 90, r: [1, 30], s: [1, 1.8] },
      { p: 'rootArch', at: 'hero', where: 'mid', side: 14, t: 0.35, s: 1.2 },
      { p: 'bee', at: 'area', n: 5, r: [0, 14], s: 1 },
      { p: 'butterfly', at: 'area', n: 6, r: [0, 16], s: 1 },
      { p: 'queenWeb', at: 'hero', where: 'end', d: 12, s: 1 },
    ],
    back: [
      { p: 'giantGrass', at: 'ring', n: 70, r: [28, 60], s: [2.4, 4] },
      { p: 'giantSunflower', at: 'ring', n: 10, r: [40, 70], s: [1.6, 2.2], single: true },
      { p: 'cloud', at: 'sky', n: 12, r: [0, 150], y: [30, 60], s: [1.3, 2.4] },
    ],
    fx: [{ k: 'petals', n: 160 }],
  }),

  web_garden: biome('meadow', {
    accent: 0x22c55e,
    path: { kind: 'dirt', color: 0xa8845a, edge: 0xe8d8a8 },
    layers: [
      websNear(8),
      flowersNear(2.8),
      { p: 'mushroom', at: 'near', n: 5, r: [1, 2.6], s: [0.6, 1] },
      heroWeb(),
      arch('WEB GARDEN', [0x22c55e, 0xffd23f]),
    ],
  }),
  vine_wall: biome('jungle', {
    accent: 0x16a34a,
    layers: [
      { p: 'pillar', at: 'near', n: 6, r: [1.2, 2.2], s: [0.8, 1.1], o: { color: 0x7a8a6a } },
      { p: 'bush', at: 'near', n: 3, r: [0.4, 1.6], s: [0.8, 1.2], o: { color: 0x2f9a45, flowers: true } },
      websArea(6),
      heroWeb({ post: 0x6a5a3a }),
    ],
  }),
  temple_steps: biome('jungle', {
    accent: 0xf59e0b,
    path: { kind: 'cobble', color: 0xc8b08a, edge: 0xf5e6b8 },
    layers: [
      { p: 'pillar', at: 'near', n: 5, r: [0.8, 1.6], s: [0.9, 1.2], o: { color: 0xd8c8a0 } },
      { p: 'rock', at: 'near', n: 6, r: [1.4, 3], s: [0.6, 1], o: { color: 0xb8a882 } },
      websNear(12),
      { p: 'rockArch', at: 'hero', where: 'end', d: 10, s: 0.8, o: { color: 0xc8b08a } },
    ],
  }),
  crystal_web_cave: biome('cave', {
    accent: 0x22d3ee,
    layers: [
      { p: 'crystal', at: 'near', n: 4, r: [1, 2.6], s: [0.8, 1.3] },
      websNear(8, { glow: 0.7, color: 0xc8f4ff }),
      { p: 'crystal', at: 'hero', where: 'end', d: 8, s: 2.4, o: { color: 0x7ad9ff } },
    ],
  }),
  bamboo_canopy: biome('forest', {
    accent: 0x65a30d,
    layers: [
      trees('treePine', 26, [2, 20], [1, 1.5]),
      websArea(10),
      { p: 'mushroom', at: 'near', n: 4, r: [0.8, 2.2], s: [0.7, 1.1] },
      heroWeb(),
    ],
  }),
  ruins_bridge: biome('canyon', {
    accent: 0xf97316,
    layers: [
      { p: 'pillar', at: 'near', n: 7, r: [0.6, 1.4], s: [0.7, 1], o: { color: 0xe0cfa8 } },
      { p: 'rock', at: 'near', n: 4, r: [1.2, 3], s: [0.6, 1.2], o: { color: 0xc4784a } },
      websArea(5),
      arch('RUINS BRIDGE', [0xf97316, 0xffd23f], 7),
    ],
  }),
  dewdrop_meadow: biome('meadow', {
    accent: 0x38bdf8,
    layers: [
      flowersNear(2.2),
      websNear(6, { glow: 0.45, dew: 0x7fdcff }),
      { p: 'sunflower', at: 'near', n: 9, r: [1.6, 3], s: [0.9, 1.2] },
      heroWeb({ dew: 0x7fdcff }),
    ],
  }),
  pipe_crawl: biome('construction', {
    accent: 0xfacc15,
    layers: [
      { p: 'pipeStack', at: 'near', n: 9, r: [1.2, 2.4], s: [0.8, 1] },
      { p: 'girders', at: 'area', n: 5, r: [4, 16], s: 1, clear: 4 },
      websNear(10),
      arch('PIPE CRAWL', [0xfacc15, 0x3b82f6]),
    ],
  }),
  glow_web_night: biome('nightForest', {
    accent: 0xa78bfa,
    layers: [
      websNear(6, { glow: 1.1, color: 0xd8ccff, dew: 0x9ff5ff }),
      { p: 'mushroom', at: 'near', n: 4, r: [0.8, 2.2], s: [0.7, 1.1] },
      heroWeb({ glow: 1.2, color: 0xd8ccff }),
    ],
  }),
  spider_summit: biome('snow', {
    accent: 0x3b82f6,
    layers: [
      { p: 'rock', at: 'near', n: 4, r: [1, 2.8], s: [0.7, 1.2], o: { color: 0xa8b8c8 } },
      websNear(9, { color: 0xffffff, dew: 0xbfeaff }),
      { p: 'flag', at: 'hero', where: 'end', d: 7, side: 3, s: 1.4, o: { color: 0x3b82f6 } },
      heroWeb(),
    ],
  }),
};
