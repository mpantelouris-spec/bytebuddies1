/**
 * TrackWorldRecipes.js — Per-track scenery recipes (buildings, trees, animals, vistas).
 * Mixed props along the sides — full enough to read as a world, not a copy-paste fence.
 */
export const TRACK_WORLD_RECIPES = {
  sunset_cove_01: {
    scatter: ['palm', 'hut', 'torch', 'umbrella', 'palm', 'torch', 'hut', 'umbrella'],
    scatterStep: 0.1,
    scatterOffset: 12,
    buildings: [
      { type: 'beach_hut', t: 0.12, side: -1, off: 20 },
      { type: 'beach_hut', t: 0.52, side: 1, off: 22 },
      { type: 'lighthouse', t: 0.78, side: -1, off: 28 },
    ],
    animals: [
      { type: 'seagull', t: 0.22, side: 1, off: 24, y: 10 },
      { type: 'seagull', t: 0.48, side: -1, off: 26, y: 12 },
      { type: 'dolphin', t: 0.65, side: 1, off: 30, y: 0 },
    ],
    wildlife: { type: 'bird', count: 5 },
    vista: 'ocean',
  },
  candy_carnival_01: {
    scatter: ['tent', 'lollipop', 'candy_cane', 'tent', 'lollipop'],
    scatterStep: 0.11,
    scatterOffset: 14,
    buildings: [
      { type: 'ticket_booth', t: 0.22, side: -1, off: 22 },
      { type: 'ferris_wheel', t: 0.55, side: -1, off: 34 },
      { type: 'candy_shop', t: 0.38, side: 1, off: 22 },
      { type: 'ticket_booth', t: 0.62, side: 1, off: 20 },
    ],
    animals: [
      { type: 'carousel_horse', t: 0.42, side: 1, off: 18 },
      { type: 'carousel_horse', t: 0.7, side: -1, off: 20 },
    ],
    vista: null,
  },
  neon_metro_01: {
    scatter: ['pillar', 'neon_sign', 'pillar', 'neon_sign'],
    scatterStep: 0.11,
    scatterOffset: 12,
    buildings: [
      { type: 'skyscraper', t: 0.12, side: -1, off: 22, h: 32 },
      { type: 'skyscraper', t: 0.42, side: 1, off: 24, h: 28 },
      { type: 'skyscraper', t: 0.72, side: -1, off: 20, h: 36 },
      { type: 'metro_train', t: 0.38, side: -1, off: 28 },
      { type: 'holo_billboard', t: 0.06, side: 1, off: 16 },
    ],
    animals: [],
    vista: null,
  },
  cloud_citadel_01: {
    scatter: ['tower'],
    scatterStep: 0.14,
    scatterOffset: 14,
    buildings: [
      { type: 'castle_tower', t: 0.2, side: 1, off: 22 },
      { type: 'castle_tower', t: 0.55, side: -1, off: 24 },
      { type: 'castle_tower', t: 0.82, side: 1, off: 20 },
    ],
    animals: [],
    vista: 'cloud_sea',
  },
  jungle_ruins_01: {
    scatter: ['jungle', 'vine_pillar', 'jungle'],
    scatterStep: 0.11,
    scatterOffset: 13,
    buildings: [
      { type: 'temple_pyramid', t: 0.22, side: 1, off: 30 },
      { type: 'temple_gate', t: 0.52, side: -1, off: 22 },
    ],
    animals: [
      { type: 'statue_jaguar', t: 0.15, side: -1, off: 14 },
      { type: 'statue_parrot', t: 0.4, side: 1, off: 14 },
      { type: 'statue_turtle', t: 0.68, side: -1, off: 16 },
    ],
    wildlife: { type: 'bird', count: 5 },
    vista: null,
  },
  frost_peak_01: {
    scatter: ['pine', 'icicle', 'pine'],
    scatterStep: 0.12,
    scatterOffset: 14,
    buildings: [
      { type: 'ski_lodge', t: 0.16, side: -1, off: 24 },
      { type: 'ski_lodge', t: 0.62, side: 1, off: 26 },
    ],
    animals: [],
    vista: null,
  },
  lava_foundry_01: {
    scatter: ['gear', 'factory_pipe', 'gear'],
    scatterStep: 0.12,
    scatterOffset: 13,
    buildings: [
      { type: 'factory_wall', t: 0.2, side: 1, off: 26 },
      { type: 'factory_wall', t: 0.52, side: -1, off: 28 },
      { type: 'crane', t: 0.75, side: 1, off: 26 },
    ],
    animals: [],
    vista: 'lava',
  },
  star_station_01: {
    scatter: ['dome', 'satellite', 'dome'],
    scatterStep: 0.13,
    scatterOffset: 13,
    buildings: [
      { type: 'habitat_dome', t: 0.2, side: -1, off: 22 },
      { type: 'habitat_dome', t: 0.52, side: 1, off: 24 },
      { type: 'glass_deck', t: 0.36, side: 0, off: 0 },
    ],
    animals: [],
    vista: 'cosmic',
  },
  fairy_glen_01: {
    scatter: ['daisy', 'toadstool', 'lollipop_tree', 'daisy'],
    scatterStep: 0.11,
    scatterOffset: 12,
    buildings: [
      { type: 'fairy_cottage', t: 0.25, side: -1, off: 22 },
      { type: 'fairy_cottage', t: 0.68, side: 1, off: 24 },
    ],
    animals: [
      { type: 'butterfly', t: 0.4, side: 1, off: 18, y: 4 },
      { type: 'butterfly', t: 0.58, side: -1, off: 20, y: 5 },
    ],
    wildlife: { type: 'butterfly', count: 6 },
    vista: null,
  },
  thunder_ridge_01: {
    scatter: ['pine', 'barn', 'pine'],
    scatterStep: 0.12,
    scatterOffset: 14,
    buildings: [
      { type: 'windmill', t: 0.18, side: -1, off: 26 },
      { type: 'barn', t: 0.45, side: 1, off: 24 },
      { type: 'barn', t: 0.74, side: -1, off: 22 },
    ],
    animals: [],
    vista: null,
  },
};

export function getTrackWorldRecipe(arenaType) {
  return TRACK_WORLD_RECIPES[arenaType] ?? null;
}
