/** Sporty task worlds for Sport Striker, Power Bot and Mega Mech — training, games and a trophy finale, no fighting. */
import { biome } from './biomes.js';
import { trees, flowersNear, conesNear, room } from './common.js';

const RAINBOW = [0xff5d5d, 0xffd23f, 0x3fa7ff, 0x3fcf7a, 0xb46bff];
const bunting = (n = 8, r = [4, 14]) => ({ p: 'bunting', at: 'area', n, r, s: 1.2, o: { colors: RAINBOW } });
const stands = (n = 4, r = [14, 22], color) => ({ p: 'grandstand', at: 'area', n, r, s: 1, face: 'center', clear: 5, ...(color ? { o: { color } } : {}) });

export const SPORT_RECIPES = {
  warmup_gym: {
    light: 'indoor',
    sky: { top: 0xeaf4ff, mid: 0xeaf4ff, horizon: 0xeaf4ff, fog: 0xe8f2ff },
    accent: 0x3fa7ff,
    room: room({ floor: 'wood', floorColor: 0xe8b878, wall: 0xdcecff, trim: 0x3fa7ff, outside: 0x9fd8ff, h: 22 }),
    path: { kind: 'mat', color: 0x3fa7ff, edge: 0xffffff, kerb: 0xffd23f },
    layers: [
      { p: 'gymMat', at: 'area', n: 14, r: [-14, 10], s: [1.2, 1.6], v: [{ color: 0x3fa7ff }, { color: 0xff5d8f }, { color: 0x3fcf7a }] },
      { p: 'balanceBeam', at: 'area', n: 5, r: [-12, 8], s: 1, clear: 2 },
      { p: 'mirror', at: 'area', n: 6, r: [10, 16], s: 1.2, face: 'center' },
      { p: 'shelves', at: 'area', n: 5, r: [10, 16], s: 1.2, face: 'center', o: { boxes: true } },
      { p: 'podium', at: 'hero', where: 'end', d: 10, s: 1.1 },
      bunting(6),
    ],
    fx: [{ k: 'dust', n: 140 }],
  },

  punch_bag_hall: {
    light: 'indoor',
    sky: { top: 0xfff0e0, mid: 0xfff0e0, horizon: 0xfff0e0, fog: 0xffe8d4 },
    accent: 0xef4444,
    room: room({ floor: 'wood', floorColor: 0xc8905a, wall: 0xffe0cc, trim: 0xef4444, outside: 0x9fd8ff, h: 22 }),
    path: { kind: 'mat', color: 0xef4444, edge: 0xffffff, kerb: 0x3a7ae8 },
    layers: [
      { p: 'gymMat', at: 'area', n: 12, r: [-14, 10], s: [1.2, 1.6], v: [{ color: 0xef4444 }, { color: 0x3a7ae8 }] },
      { p: 'punchBag', at: 'area', n: 8, r: [8, 15], s: 1.2, clear: 2 },
      { p: 'mirror', at: 'area', n: 5, r: [11, 16], s: 1.2, face: 'center' },
      { p: 'trophy', at: 'hero', where: 'end', d: 9, s: 1.5 },
      bunting(6),
    ],
    fx: [{ k: 'dust', n: 140 }],
  },

  obstacle_park: biome('meadow', {
    accent: 0xf97316,
    ground: { kind: 'grass', color: 0x6fcf5a, alt: 0x62c050 },
    path: { kind: 'dirt', color: 0xd8a870, edge: 0xf0d8a8, kerb: 0xf97316 },
    layers: [
      { p: 'hurdle', at: 'near', n: 6, r: [2.4, 3.4], s: 1 },
      { p: 'tyres', at: 'near', n: 7, r: [2.6, 4], s: 1.1 },
      conesNear(5),
      { p: 'balanceBeam', at: 'area', n: 6, r: [8, 20], s: 1, clear: 2 },
      { p: 'slide', at: 'area', n: 3, r: [14, 26], s: 1.1, face: 'center' },
      { p: 'flag', at: 'hero', where: 'end', d: 8, s: 1.6, o: { checker: true } },
      trees('treeRound', 14, [18, 45]),
      bunting(6, [6, 16]),
    ],
  }),

  relay_race: biome('meadow', {
    accent: 0xffd23f,
    ground: { kind: 'grass', color: 0x4fb84a, alt: 0x46a842 },
    path: { kind: 'stripes', color: 0xc8503a, edge: 0xffffff, kerb: 0xffffff },
    layers: [
      stands(5, [14, 24]),
      { p: 'flag', at: 'near', n: 9, r: [2.6, 3.4], s: 1, v: RAINBOW.map((color) => ({ color })) },
      { p: 'hurdle', at: 'area', n: 8, r: [8, 14], s: 1 },
      { p: 'podium', at: 'hero', where: 'end', d: 10, s: 1.2 },
      bunting(8, [6, 16]),
    ],
    fx: [{ k: 'confetti', n: 120 }],
  }),

  hoop_court: {
    light: 'indoor',
    sky: { top: 0xfff4e0, mid: 0xfff4e0, horizon: 0xfff4e0, fog: 0xffeed6 },
    accent: 0xf97316,
    room: room({ floor: 'wood', floorColor: 0xd89a5a, wall: 0xe8eefc, trim: 0xf97316, outside: 0x9fd8ff, h: 24 }),
    path: { kind: 'stripes', color: 0xc87a3a, edge: 0xffffff, kerb: 0xf97316 },
    layers: [
      { p: 'hoop', at: 'area', n: 6, r: [10, 16], s: 1.3, face: 'center', clear: 2 },
      stands(3, [14, 20], 0xf97316),
      { p: 'ball', at: 'area', n: 14, r: [4, 12], s: 1, o: { kind: 'basket' } },
      { p: 'trophy', at: 'hero', where: 'end', d: 9, s: 1.5 },
      bunting(6),
    ],
    fx: [{ k: 'dust', n: 120 }],
  },

  football_park: biome('meadow', {
    accent: 0x22c55e,
    ground: { kind: 'grass', color: 0x4fc04a, alt: 0x44b040 },
    path: { kind: 'grass', color: 0x5fd05a, edge: 0xffffff, kerb: 0xffffff },
    layers: [
      { p: 'goal', at: 'area', n: 4, r: [12, 20], s: 1, face: 'center', clear: 4 },
      conesNear(4),
      { p: 'ball', at: 'area', n: 12, r: [5, 14], s: 1 },
      stands(3, [18, 26]),
      { p: 'flag', at: 'hero', where: 'end', d: 8, s: 1.4, o: { color: 0x22c55e } },
      trees('treeRound', 12, [24, 50]),
    ],
  }),

  skipping_playground: biome('meadow', {
    accent: 0xff5dd0,
    ground: { kind: 'grass', color: 0x7fd66a, alt: 0x72c85e },
    path: { kind: 'rainbow', color: 0xff8ad8, edge: 0xffffff, kerb: 0xff5dd0 },
    layers: [
      { p: 'slide', at: 'area', n: 4, r: [10, 20], s: 1.1, face: 'center' },
      { p: 'swings', at: 'area', n: 4, r: [10, 22], s: 1.1, face: 'center' },
      { p: 'carousel', at: 'hero', where: 'side', side: 14, t: 0.5, s: 1 },
      { p: 'balloons', at: 'near', n: 8, r: [1.6, 2.6], s: 1 },
      flowersNear(3),
      { p: 'bench', at: 'near', n: 12, r: [2, 3], s: 1 },
      trees('treeBlossom', 12, [16, 40]),
    ],
    fx: [{ k: 'petals', n: 120 }],
  }),

  beach_games: biome('beach', {
    accent: 0xff5d5d,
    layers: [
      { p: 'umbrella', at: 'near', n: 5, r: [2, 3.4], s: 1, v: RAINBOW.map((color) => ({ color })) },
      { p: 'sandcastle', at: 'near', n: 9, r: [2, 3.2], s: 0.9 },
      { p: 'goal', at: 'area', n: 2, r: [12, 18], s: 1, face: 'center', clear: 4 },
      { p: 'lifeguard', at: 'hero', where: 'end', d: 9, s: 1.2 },
      { p: 'flag', at: 'near', n: 11, r: [3, 4], s: 1, v: RAINBOW.map((color) => ({ color })) },
    ],
  }),

  winter_games: biome('snow', {
    accent: 0x3fa7ff,
    path: { kind: 'snow', color: 0xe8f0ff, edge: 0xffffff, kerb: 0x3fa7ff },
    layers: [
      { p: 'flag', at: 'near', n: 5, r: [2.2, 3], s: 1, v: [{ color: 0xef4444 }, { color: 0x3fa7ff }] },
      stands(3, [16, 24], 0x3fa7ff),
      { p: 'podium', at: 'hero', where: 'end', d: 10, s: 1.2 },
      { p: 'cabin', at: 'hero', where: 'side', side: 16, t: 0.5, s: 1.2 },
      trees('treePine', 18, [14, 45]),
      bunting(6, [6, 16]),
    ],
  }),

  champions_finale: biome('meadow', {
    light: 'sunset',
    accent: 0xffc83a,
    ground: { kind: 'grass', color: 0x4fb84a, alt: 0x46a842 },
    path: { kind: 'carpet', color: 0xc8322a, edge: 0xffc83a, kerb: 0xffc83a },
    layers: [
      stands(6, [14, 24]),
      { p: 'flag', at: 'near', n: 6, r: [2.4, 3.2], s: 1, v: RAINBOW.map((color) => ({ color })) },
      { p: 'podium', at: 'hero', where: 'end', d: 12, s: 1.4 },
      { p: 'trophy', at: 'hero', where: 'end', d: 8, s: 2 },
      { p: 'balloons', at: 'near', n: 9, r: [1.6, 2.6], s: 1 },
      bunting(10, [6, 18]),
    ],
    fx: [{ k: 'confetti', n: 260 }, { k: 'sparkles', n: 120 }],
  }),
};
