/** Spider Bot worlds: webs, vines, ruins and caves — places a climber belongs. */
import { biome } from './biomes.js';
import { trees, flowersNear, room } from './common.js';

const arch = (text, colors, d = 6) => ({ p: 'arch', at: 'hero', where: 'end', d, o: { text, colors } });
const websNear = (step = 7, o = {}) => ({ p: 'spiderWeb', at: 'near', n: step, r: [1.2, 2.4], s: [0.8, 1.1], face: 'road', o });
const websArea = (n = 8, o = {}) => ({ p: 'spiderWeb', at: 'area', n, r: [2, 18], s: [1, 1.6], clear: 3, o });
const heroWeb = (o = {}) => ({ p: 'spiderWeb', at: 'hero', where: 'end', d: 9, s: 2, o: { r: 3, ...o } });
const factory = (trim, o = {}) => room({
  floor: 'tiles', floorColor: 0xc8ced8, floorAlt: 0xb0b8c4, wall: 0xe0e4ea,
  trim, outside: 0x8fd6ff, tile: 4, h: 22, ...o,
});

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

  // ─── Arena 2: Treehouse Kingdom — crawl web bridges to the Crown House ─
  treehouse_kingdom: biome('forest', {
    accent: 0xffb347,
    hideGantry: true,
    path: { kind: 'dirt', color: 0x8a5a2a, edge: 0xe8c890, noKerbs: true },
    layers: [
      websNear(7),
      { p: 'cabin', at: 'near', n: 10, r: [2.2, 3.4], s: [0.55, 0.8] },
      { p: 'eggNest', at: 'near', n: 8, r: [0.8, 1.8], s: 0.85 },
      trees('treeRound', 18, [4, 22], [1.1, 1.6]),
      { p: 'cabin', at: 'hero', where: 'end', d: 11, s: 1.4 },
      heroWeb(),
      arch('CROWN HOUSE', [0xffb347, 0x22c55e]),
    ],
  }),

  // ─── Arena 3: Toy Room — shelves, teddies, crawl to the big bookshelf ─
  toy_room: {
    light: 'indoor',
    hideGantry: true,
    accent: 0xe8262c,
    room: factory(0xe8262c, { floorColor: 0xffe8a0, floorAlt: 0xffd070, wall: 0xfff4d0, ceiling: 0xffe8b8 }),
    path: { kind: 'stripes', color: 0x6b4bd8, edge: 0xffd23f, noKerbs: true },
    layers: [
      { p: 'teddy', at: 'near', n: 5, r: [0.8, 2], s: [0.9, 1.2] },
      { p: 'toyBlocks', at: 'near', n: 6, r: [0.6, 2.2], s: 0.9 },
      { p: 'shelves', at: 'near', n: 8, r: [2.2, 3.2], s: 1, o: { color: 0xc8905a, boxes: true } },
      { p: 'toyCar', at: 'area', n: 10, r: [-6, 10], s: [1, 1.3] },
      { p: 'bookshelf', at: 'hero', where: 'end', d: 8, s: 1.8 },
      websNear(12),
    ],
    fx: [{ k: 'sparkles', n: 80 }],
  },

  // ─── Arena 4: Sweet Factory — candy belt, cupcakes, Gobstopper Tower ─
  sweet_factory: {
    light: 'indoor',
    hideGantry: true,
    accent: 0xff6fb5,
    room: factory(0xff6fb5, { floorColor: 0xffe0f0, floorAlt: 0xffc8e0, wall: 0xfff0f8 }),
    path: { kind: 'stripes', color: 0x6b3e26, edge: 0xffd23f, noKerbs: true },
    layers: [
      { p: 'cupcake', at: 'near', n: 5, r: [0.8, 2], s: [0.9, 1.2] },
      { p: 'cake', at: 'near', n: 8, r: [1.6, 2.8], s: [0.8, 1.1] },
      { p: 'conveyor', at: 'area', n: 6, r: [-6, 8], s: 1.1, face: 'center', clear: 2 },
      { p: 'colorTrays', at: 'near', n: 7, r: [1.4, 2.4], s: 1 },
      { p: 'cake', at: 'hero', where: 'end', d: 8, s: 2.2 },
      websNear(11),
    ],
    fx: [{ k: 'sparkles', n: 140, colors: [0xff6fb5, 0xffd23f] }],
  },

  // ─── Arena 5: Giant Kitchen — leaking taps, cookie jar finish ─
  giant_kitchen: {
    light: 'indoor',
    hideGantry: true,
    accent: 0xe84a3a,
    room: factory(0xe84a3a, { floorColor: 0xf6f8fb, floorAlt: 0xe4e8ee, wall: 0xffffff }),
    path: { kind: 'stripes', color: 0xb8c2cc, edge: 0x4ac7d9, noKerbs: true },
    layers: [
      { p: 'sink', at: 'near', n: 7, r: [1.6, 2.6], s: 0.9 },
      { p: 'alarmButton', at: 'near', n: 6, r: [0.7, 1.4], s: 0.9 },
      { p: 'pipes', at: 'area', n: 8, r: [-6, 12], s: 1.1, o: { color: 0x4ac7d9 } },
      { p: 'cake', at: 'hero', where: 'end', d: 8, s: 2.4 },
      websNear(12),
    ],
    fx: [{ k: 'bubbles', n: 120 }],
  },

  // ─── Arena 6: Ancient Temple — stone path, buttons, Sun Idol ─
  ancient_temple: biome('jungle', {
    accent: 0xe3b341,
    hideGantry: true,
    path: { kind: 'cobble', color: 0xc8b08a, edge: 0xf5e6b8, noKerbs: true },
    layers: [
      { p: 'pillar', at: 'near', n: 5, r: [0.8, 1.6], s: [0.9, 1.2], o: { color: 0xd8c8a0 } },
      { p: 'rock', at: 'near', n: 6, r: [1.4, 3], s: [0.6, 1], o: { color: 0xb8a882 } },
      websNear(10),
      { p: 'alarmButton', at: 'near', n: 8, r: [0.6, 1.2], s: 0.9 },
      { p: 'rockArch', at: 'hero', where: 'end', d: 10, s: 0.9, o: { color: 0xc8b08a } },
      arch('SUN IDOL', [0xe3b341, 0x2fb58a]),
    ],
  }),

  // ─── Arena 7: Robot Factory — carry parts to the repair pads ─
  robot_factory_climb: {
    light: 'indoor',
    hideGantry: true,
    accent: 0x1fb5a8,
    room: factory(0x1fb5a8, { floor: 'grid', floorColor: 0xdfe8f4, floorAlt: 0x9ab0cc, wall: 0xe8f2ff }),
    path: { kind: 'glow', color: 0x5a6478, edge: 0x1fb5a8, glow: 0x1fb5a8, noKerbs: true },
    layers: [
      { p: 'workbench', at: 'near', n: 7, r: [1.8, 2.6], s: 1 },
      { p: 'gear', at: 'near', n: 5, r: [0.6, 1.6], s: [0.6, 0.9] },
      { p: 'robotArmProp', at: 'area', n: 6, r: [-6, 12], s: 1.2, face: 'center' },
      { p: 'shelves', at: 'area', n: 8, r: [8, 16], s: 1.3, face: 'center', o: { color: 0xdfe8f4, boxes: true } },
      { p: 'robotArmProp', at: 'hero', where: 'end', d: 7, s: 2 },
      websNear(11),
    ],
    fx: [{ k: 'sparkles', n: 100, colors: [0x5ce1ff] }],
  },

  // ─── Arena 8: Sky Islands — crawl web bridges, light lanterns ─
  sky_islands_web: biome('meadow', {
    accent: 0x8fd8ff,
    hideGantry: true,
    sky: { top: 0x4aa8ff, mid: 0x9fd6ff, horizon: 0xf4fbff, sun: { yaw: 0.3 } },
    ground: { kind: 'grass', color: 0x7ad957, alt: 0x6ac84a },
    path: { kind: 'dirt', color: 0xc8d8a0, edge: 0xffffff, noKerbs: true },
    layers: [
      { p: 'floatingIsland', at: 'area', n: 8, r: [6, 22], s: [0.8, 1.3], clear: 4 },
      { p: 'lantern', at: 'near', n: 7, r: [0.8, 1.6], s: 1 },
      websNear(6, { glow: 0.6, color: 0xffffff }),
      { p: 'cloud', at: 'sky', n: 16, r: [0, 120], y: [18, 48], s: [1.2, 2.2] },
      { p: 'flag', at: 'hero', where: 'end', d: 8, side: 2, s: 1.4, o: { color: 0x8fd8ff } },
      heroWeb({ glow: 0.8 }),
      arch('WIND ENGINE', [0x8fd8ff, 0xffffff]),
    ],
  }),

  // ─── Arena 9: Crystal Caverns — collect crystals, Heart Crystal finish ─
  crystal_caverns: biome('cave', {
    accent: 0x3fa7ff,
    hideGantry: true,
    layers: [
      { p: 'crystal', at: 'near', n: 4, r: [1, 2.6], s: [0.8, 1.3] },
      websNear(8, { glow: 0.7, color: 0xc8f4ff }),
      { p: 'crystal', at: 'area', n: 14, r: [3, 16], s: [0.7, 1.4], clear: 3 },
      { p: 'crystal', at: 'hero', where: 'end', d: 8, s: 2.6, o: { color: 0x7ad9ff } },
      arch('HEART CRYSTAL', [0x3fa7ff, 0xa855f7]),
    ],
  }),

  // ─── Arena 10: Clockwork Castle — collect gears, crawl to the Great Clock ─
  clockwork_castle: {
    light: 'warm',
    hideGantry: true,
    accent: 0xc8963e,
    room: factory(0xc8963e, { floorColor: 0x8a7a68, floorAlt: 0x7a6a58, wall: 0x6a5a4a, outside: 0x3a2a1a, ceiling: 0x4a3a2a }),
    path: { kind: 'stripes', color: 0x3a3430, edge: 0xffc400, noKerbs: true },
    layers: [
      { p: 'gear', at: 'near', n: 3.4, r: [1.2, 2.8], s: [0.8, 1.4] },
      { p: 'pipes', at: 'near', n: 8, r: [2.6, 3.4], s: 1, o: { color: 0xb87333 } },
      { p: 'gear', at: 'area', n: 18, r: [-10, 16], s: [1.2, 2.4], face: 'center' },
      { p: 'gear', at: 'hero', where: 'end', d: 8, s: 3.4 },
      websNear(10),
      arch('GREAT CLOCK', [0xc8963e, 0xf4ecd8]),
    ],
    fx: [{ k: 'embers', n: 80 }, { k: 'dust', n: 120 }],
  },

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
