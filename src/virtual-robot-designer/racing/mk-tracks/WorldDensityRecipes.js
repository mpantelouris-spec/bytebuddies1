/**
 * WorldDensityRecipes.js — Per-biome layered density, wildlife, and cinematic beats.
 * Every circuit is a living world compressed into a racing loop.
 */

const FG = 'foreground';
const MID = 'midground';
const SKY = 'skyline';

function layer(pool, count, lateral, step = 0.035) {
  return { layer: FG, pool, count, lateral, step, method: 'along-track' };
}

function mid(pool, count, lateral, step = 0.07) {
  return { layer: MID, pool, count, lateral, step, method: 'along-track' };
}

export const WORLD_DENSITY_RECIPES = {
  desert_dunes_01: {
    story: 'Friendly beach race at golden hour — surf shack, coral arch, and dolphins leaping in the cove.',
    wildlife: ['dolphin', 'bird', 'bird'],
    skyline: [
      { type: 'mountain', color: 0x556677, positions: ['n', 'nw'] },
      { type: 'ocean', positions: ['s'] },
    ],
    layers: [
      layer(['grass_clump', 'wildflower', 'pebbles', 'road_rock', 'tire_mark'], 28, [4, 9], 0.032),
      layer(['wooden_fence', 'race_banner', 'lantern', 'bush'], 16, [5, 11], 0.045),
      mid(['varied_palm', 'beach_umbrella', 'cliff', 'market_stall', 'village_cottage'], 20, [12, 28], 0.065),
      mid(['observation_tower', 'waterfall', 'mossy_boulder'], 8, [22, 38], 0.12),
    ],
    beats: [
      { t: 0.12, type: 'vista', label: 'Sea arch reveal' },
      { t: 0.28, type: 'reveal', label: 'Lighthouse cliffs' },
      { t: 0.42, type: 'transition', label: 'Suspension bridge' },
      { t: 0.58, type: 'reveal', label: 'Shipwreck cove' },
      { t: 0.72, type: 'transition', label: 'Sea cave tunnel' },
      { t: 0.88, type: 'vista', label: 'Golden sunset ocean' },
    ],
  },

  crystal_palace_01: {
    story: 'Crystal miners club cave — glowing geodes, rainbow light beams, and friendly sparkle dust.',
    wildlife: ['sparkle'],
    skyline: [{ type: 'cave_ceiling', positions: ['center'] }],
    layers: [
      layer(['glowing_mushroom', 'pebbles', 'road_rock', 'crystal_cluster'], 26, [4, 8], 0.034),
      layer(['lantern', 'race_banner', 'oil_stain'], 14, [5, 10], 0.048),
      mid(['crystal_cluster', 'mossy_boulder', 'waterfall', 'observation_tower'], 22, [14, 30], 0.06),
      mid(['glowing_mushroom', 'dead_tree'], 10, [20, 35], 0.11),
    ],
    beats: [
      { t: 0.15, type: 'reveal', label: 'Crystal cathedral' },
      { t: 0.35, type: 'vista', label: 'Giant geode chamber' },
      { t: 0.5, type: 'transition', label: 'Crystal bridge crossing' },
      { t: 0.68, type: 'reveal', label: 'Mining rig ruins' },
      { t: 0.85, type: 'vista', label: 'Rainbow crystal beams' },
    ],
  },

  sky_island_01: {
    story: 'A floating civilisation above an endless cloud ocean — temples and waterfalls pour into the abyss below.',
    wildlife: ['bird', 'bird', 'butterfly'],
    skyline: [
      { type: 'cloud_ocean', positions: ['s', 'sw', 'se'] },
      { type: 'mountain', color: 0x88aacc, positions: ['n'] },
    ],
    layers: [
      layer(['wildflower', 'grass_clump', 'giant_flower', 'pebbles'], 24, [4, 9], 0.033),
      layer(['race_banner', 'lantern', 'wooden_fence'], 14, [5, 11], 0.046),
      mid(['giant_flower', 'waterfall', 'village_cottage', 'observation_tower'], 18, [14, 32], 0.068),
      mid(['varied_palm', 'windmill'], 8, [24, 40], 0.13),
    ],
    beats: [
      { t: 0.2, type: 'vista', label: 'Floating waterfall' },
      { t: 0.38, type: 'reveal', label: 'Sky temple' },
      { t: 0.5, type: 'transition', label: 'Rainbow bridge leap' },
      { t: 0.65, type: 'reveal', label: 'Cloud ocean vista' },
      { t: 0.82, type: 'vista', label: 'Sky observatory' },
    ],
  },

  volcano_canyon_01: {
    story: 'A volcano moments from catastrophic eruption — ancient lava temples crumble as magma reshapes the land.',
    wildlife: ['ember'],
    skyline: [{ type: 'volcano', positions: ['n', 'ne'] }],
    layers: [
      layer(['road_rock', 'pebbles', 'tire_mark', 'oil_stain'], 22, [4, 8], 0.035),
      layer(['race_banner', 'wooden_fence'], 12, [5, 10], 0.05),
      mid(['basalt_cliff', 'mossy_boulder', 'dead_tree', 'observation_tower'], 20, [14, 30], 0.065),
      mid(['waterfall', 'steam_vent'], 8, [22, 36], 0.12),
    ],
    beats: [
      { t: 0.18, type: 'reveal', label: 'Erupting crater skyline' },
      { t: 0.32, type: 'vista', label: 'Lava waterfall' },
      { t: 0.48, type: 'hazard', label: 'Obsidian arch' },
      { t: 0.65, type: 'transition', label: 'Magma geyser field' },
      { t: 0.8, type: 'reveal', label: 'Volcanic temple ruins' },
    ],
  },

  cyber_boulevard_01: {
    story: 'A futuristic megacity powered by fusion reactors — holograms and neon rain define the midnight streets.',
    wildlife: ['drone'],
    skyline: [{ type: 'city', positions: ['n', 'e', 'w'] }],
    layers: [
      layer(['oil_stain', 'tire_mark', 'pebbles', 'neon_pylon'], 24, [4, 8], 0.034),
      layer(['race_banner', 'road_sign', 'lantern'], 16, [5, 10], 0.044),
      mid(['skyscraper', 'neon_billboard', 'neon_pylon', 'market_stall'], 22, [14, 28], 0.06),
      mid(['graffiti_wall', 'steam_vent', 'metro_arch'], 10, [20, 34], 0.11),
    ],
    beats: [
      { t: 0.15, type: 'reveal', label: 'Holographic dragon' },
      { t: 0.3, type: 'transition', label: 'Neon tunnel dive' },
      { t: 0.5, type: 'vista', label: 'Maglev overhead' },
      { t: 0.68, type: 'reveal', label: 'Digital waterfall' },
      { t: 0.85, type: 'vista', label: 'Skyline panorama' },
    ],
  },

  ice_cavern_01: {
    story: 'A frozen kingdom where dragons once lived — glaciers and northern lights guard ancient ice castles.',
    wildlife: ['bird', 'snow'],
    skyline: [
      { type: 'mountain', color: 0xaabbcc, positions: ['n', 'nw', 'ne'] },
      { type: 'aurora', positions: ['center'] },
    ],
    layers: [
      layer(['pebbles', 'road_rock', 'grass_clump'], 20, [4, 7], 0.036),
      layer(['wooden_fence', 'race_banner', 'lantern'], 14, [5, 10], 0.048),
      mid(['snow_pine', 'varied_pine', 'dead_tree', 'mossy_boulder'], 24, [12, 28], 0.062),
      mid(['observation_tower', 'windmill', 'village_cottage'], 8, [22, 38], 0.13),
    ],
    beats: [
      { t: 0.2, type: 'vista', label: 'Ice castle panorama' },
      { t: 0.38, type: 'reveal', label: 'Frozen waterfall' },
      { t: 0.55, type: 'transition', label: 'Snow bridge crossing' },
      { t: 0.72, type: 'vista', label: 'Northern lights' },
      { t: 0.88, type: 'reveal', label: 'Glacier pass' },
    ],
  },

  underwater_temple_01: {
    story: 'An ancient civilisation reclaimed by jungle — temples crumble beneath vines as treasure hunters once passed through.',
    wildlife: ['butterfly', 'bird', 'bird'],
    skyline: [
      { type: 'forest', color: 0x2a5a1a, positions: ['n', 's', 'e', 'w'] },
      { type: 'mountain', color: 0x4a6a3a, positions: ['nw'] },
    ],
    layers: [
      layer(['wildflower', 'bush', 'grass_clump', 'glowing_mushroom'], 26, [4, 9], 0.033),
      layer(['wooden_fence', 'race_banner', 'lantern'], 14, [5, 11], 0.046),
      mid(['temple_pillar', 'mossy_boulder', 'dead_tree', 'waterfall'], 22, [14, 30], 0.064),
      mid(['market_stall', 'observation_tower', 'village_cottage'], 8, [24, 38], 0.12),
    ],
    beats: [
      { t: 0.15, type: 'reveal', label: 'Stepped pyramid' },
      { t: 0.32, type: 'transition', label: 'Temple gate passage' },
      { t: 0.5, type: 'hazard', label: 'Rope bridge sway' },
      { t: 0.68, type: 'reveal', label: 'Stone face cliff' },
      { t: 0.85, type: 'vista', label: 'Jungle waterfall mist' },
    ],
  },

  moonlight_cavern_01: {
    story: 'A giant observatory studying nearby planets — asteroid highways spiral through nebulae and ring systems.',
    wildlife: ['comet'],
    skyline: [{ type: 'nebula', positions: ['center'] }],
    layers: [
      layer(['pebbles', 'glowing_mushroom', 'neon_pylon'], 18, [4, 8], 0.038),
      layer(['race_banner', 'lantern'], 12, [5, 10], 0.05),
      mid(['crystal_cluster', 'observation_tower', 'neon_pylon'], 16, [14, 30], 0.07),
      mid(['mossy_boulder', 'dead_tree'], 8, [22, 36], 0.13),
    ],
    beats: [
      { t: 0.18, type: 'vista', label: 'Ringed gas giant' },
      { t: 0.35, type: 'reveal', label: 'Alien ruins' },
      { t: 0.52, type: 'transition', label: 'Crystal space bridge' },
      { t: 0.7, type: 'reveal', label: 'Cosmic observatory' },
      { t: 0.88, type: 'vista', label: 'Nebula aurora' },
    ],
  },

  forest_maze_01: {
    story: 'A countryside preparing for harvest festival — windmills spin, lavender fields bloom, castle ruins watch over the valley.',
    wildlife: ['butterfly', 'bird'],
    skyline: [
      { type: 'forest', color: 0x3a7a2a, positions: ['n', 's'] },
      { type: 'mountain', color: 0x6a8a5a, positions: ['w'] },
    ],
    layers: [
      layer(['wildflower', 'grass_clump', 'pebbles', 'bush'], 28, [4, 8], 0.032),
      layer(['wooden_fence', 'race_banner', 'lantern', 'tire_mark'], 16, [5, 10], 0.044),
      mid(['windmill', 'red_barn', 'cow', 'village_cottage', 'market_stall'], 22, [12, 26], 0.063),
      mid(['observation_tower', 'dead_tree'], 8, [22, 36], 0.12),
    ],
    beats: [
      { t: 0.2, type: 'vista', label: 'Lavender field sweep' },
      { t: 0.38, type: 'transition', label: 'Covered bridge' },
      { t: 0.55, type: 'reveal', label: 'Castle ruins overlook' },
      { t: 0.72, type: 'vista', label: 'Sunflower meadow' },
      { t: 0.88, type: 'reveal', label: 'Harvest festival banners' },
    ],
  },

  cyber_boulevard_01: {
    story: 'An illegal midnight racing circuit through abandoned subway tunnels — graffiti, steam, and flickering lights tell stories of those who came before.',
    wildlife: ['spark'],
    skyline: [{ type: 'tunnel_ceiling', positions: ['center'] }],
    layers: [
      layer(['oil_stain', 'tire_mark', 'pebbles', 'road_rock'], 22, [3, 7], 0.036),
      layer(['race_banner', 'road_sign', 'lantern'], 14, [4, 9], 0.048),
      mid(['metro_arch', 'graffiti_wall', 'steam_vent', 'neon_pylon'], 20, [10, 22], 0.065),
      mid(['market_stall', 'observation_tower'], 6, [18, 30], 0.14),
    ],
    beats: [
      { t: 0.15, type: 'transition', label: 'Derelict station platform' },
      { t: 0.32, type: 'hazard', label: 'Flooded tunnel' },
      { t: 0.5, type: 'reveal', label: 'Graffiti train car' },
      { t: 0.68, type: 'transition', label: 'Ventilation fan corridor' },
      { t: 0.85, type: 'vista', label: 'Steam-filled junction' },
    ],
  },
};

export function getWorldRecipe(arenaType) {
  return WORLD_DENSITY_RECIPES[arenaType] || WORLD_DENSITY_RECIPES.desert_dunes_01;
}
