/**
 * MissionWorldRecipes — per environmentId scatter manifest (denser than cup tracks).
 * Registers merged recipes into TrackWorldRecipes at load time.
 */
import { TRACK_WORLD_RECIPES } from '../../racing/mk-tracks/TrackWorldRecipes.js';

/** One recipe per robot-arena family (11 environments). */
export const MISSION_WORLD_RECIPES = {
  martian: {
    gltfTrack: 'lava_foundry_01',
    scatter: ['gear', 'factory_pipe', 'gear', 'factory_pipe'],
    scatterStep: 0.09,
    scatterOffset: 11,
    vista: 'lava',
    gltfModels: ['rock', 'palm_tree'],
  },
  industrial: {
    gltfTrack: 'lava_foundry_01',
    scatter: ['factory_pipe', 'gear', 'factory_pipe', 'gear'],
    scatterStep: 0.09,
    scatterOffset: 11,
    buildings: [
      { type: 'factory_wall', t: 0.12, side: -1, off: 20 },
      { type: 'factory_wall', t: 0.48, side: 1, off: 22 },
      { type: 'crane', t: 0.76, side: -1, off: 24 },
    ],
    vista: null,
    gltfModels: ['rock'],
  },
  underwater: {
    // Reef landmarks are supplied by MissionVisualDressing. Do not inherit
    // jungle temples or palms into an underwater scene.
    gltfTrack: 'sunset_cove_01',
    scatter: [],
    scatterStep: 0.09,
    scatterOffset: 11,
    buildings: [],
    animals: [],
    wildlife: null,
    vista: null,
    gltfModels: [],
  },
  emergency: {
    gltfTrack: 'neon_metro_01',
    scatter: ['pillar', 'neon_sign', 'pillar', 'neon_sign'],
    scatterStep: 0.1,
    scatterOffset: 12,
    gltfModels: ['skyscraper'],
  },
  sky_aerial: {
    gltfTrack: 'cloud_citadel_01',
    scatter: ['tower', 'tower', 'tower'],
    scatterStep: 0.1,
    scatterOffset: 13,
    vista: 'cloud_sea',
    gltfModels: ['palm_tree'],
  },
  hybrid_race_sky: {
    gltfTrack: 'star_station_01',
    scatter: ['dome', 'satellite', 'dome', 'satellite'],
    scatterStep: 0.1,
    scatterOffset: 12,
    vista: 'earth',
    gltfModels: ['skyscraper'],
  },
  cyber_ninja: {
    gltfTrack: 'neon_metro_01',
    scatter: ['pillar', 'neon_sign', 'pillar', 'neon_sign', 'neon_sign'],
    scatterStep: 0.09,
    scatterOffset: 11,
    buildings: [
      { type: 'skyscraper', t: 0.15, side: -1, off: 24, h: 34 },
      { type: 'skyscraper', t: 0.5, side: 1, off: 26, h: 30 },
      { type: 'holo_billboard', t: 0.78, side: -1, off: 16 },
    ],
    gltfModels: ['skyscraper', 'palm_tree'],
  },
  spider_climber: {
    gltfTrack: 'jungle_ruins_01',
    scatter: ['vine_pillar', 'factory_pipe', 'vine_pillar', 'factory_pipe'],
    scatterStep: 0.09,
    scatterOffset: 10,
    buildings: [
      { type: 'factory_wall', t: 0.25, side: 1, off: 20 },
      { type: 'factory_wall', t: 0.6, side: -1, off: 22 },
    ],
    gltfModels: ['rock'],
  },
  boxing_mech: {
    gltfTrack: 'candy_carnival_01',
    scatter: ['tent', 'lollipop', 'candy_cane', 'tent'],
    scatterStep: 0.1,
    scatterOffset: 13,
    gltfModels: ['palm_tree'],
  },
  flappy: {
    gltfTrack: 'fairy_glen_01',
    scatter: ['daisy', 'toadstool', 'lollipop_tree', 'daisy', 'toadstool'],
    scatterStep: 0.1,
    scatterOffset: 12,
    gltfModels: ['palm_tree'],
  },
  sandbox: {
    gltfTrack: 'candy_carnival_01',
    scatter: ['tent', 'lollipop', 'candy_cane', 'tent', 'lollipop'],
    scatterStep: 0.1,
    scatterOffset: 12,
    gltfModels: ['palm_tree'],
  },
};

let _registered = false;

/** Merge mission scatter density into TrackWorldRecipes for populateTrackScenery. */
export function registerMissionWorldRecipes() {
  if (_registered) return;
  _registered = true;
  for (const [envId, cfg] of Object.entries(MISSION_WORLD_RECIPES)) {
    const base = TRACK_WORLD_RECIPES[cfg.gltfTrack];
    if (!base) continue;
    const key = `mission_${envId}`;
    TRACK_WORLD_RECIPES[key] = {
      ...base,
      scatter: cfg.scatter || base.scatter,
      scatterStep: cfg.scatterStep ?? 0.09,
      scatterOffset: cfg.scatterOffset ?? base.scatterOffset ?? 11,
      buildings: cfg.buildings || base.buildings,
      animals: cfg.animals || base.animals,
      wildlife: cfg.wildlife !== undefined ? cfg.wildlife : base.wildlife,
      vista: cfg.vista ?? base.vista,
    };
  }
}

export function getMissionTrackKey(environmentId) {
  registerMissionWorldRecipes();
  const cfg = MISSION_WORLD_RECIPES[environmentId];
  if (!cfg) return 'mission_industrial';
  return `mission_${environmentId}`;
}

export function getMissionWorldRecipe(environmentId) {
  registerMissionWorldRecipes();
  return TRACK_WORLD_RECIPES[getMissionTrackKey(environmentId)] ?? null;
}
