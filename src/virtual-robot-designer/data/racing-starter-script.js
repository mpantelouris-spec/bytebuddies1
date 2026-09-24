/** Default scratch blocks for Mario Kart–style race courses (Rainbow Road, etc.) */

import { TRACK_STANDARDS } from '../racing/mk-tracks/CodeRacerTrackStandards.js';

export const RACE_ARENA_TYPES = new Set([
  'sunset_cove_01', 'candy_carnival_01', 'neon_metro_01', 'cloud_citadel_01', 'jungle_ruins_01',
  'frost_peak_01', 'lava_foundry_01', 'star_station_01', 'fairy_glen_01', 'thunder_ridge_01',
  'rainbow_road', 'rainbow_road_master', 'street_grand_prix', 'circuit_sprint', 'sunny_circuit',
  'dragon_skyway', 'volcano_drift', 'time_trial_gauntlet',
  'luigi_circuit', 'moo_moo_meadows', 'mario_circuit', 'peach_castle',
  'dry_dry_desert', 'mushroom_canyon', 'bowser_castle', 'bone_dry_desert',
  'piranha_plant_slide', 'grumble_volcano', 'cheese_land',
  'desert_dunes_01', 'crystal_palace_01', 'sky_island_01', 'volcano_canyon_01',
  'cyber_boulevard_01', 'ice_cavern_01', 'underwater_temple_01', 'moonlight_cavern_01',
  'forest_maze_01', 'magic_forest_01',
]);

export const RACE_COURSE_IDS = new Set([
  'sunset_cove_01', 'candy_carnival_01', 'neon_metro_01', 'cloud_citadel_01', 'jungle_ruins_01',
  'frost_peak_01', 'lava_foundry_01', 'star_station_01', 'fairy_glen_01', 'thunder_ridge_01',
  'street_grand_prix', 'sunny_circuit', 'dragon_skyway', 'rainbow_road', 'volcano_drift',
  'luigi_circuit', 'moo_moo_meadows', 'mario_circuit', 'peach_castle',
  'dry_dry_desert', 'mushroom_canyon', 'bowser_castle', 'bone_dry_desert',
  'piranha_plant_slide', 'grumble_volcano', 'cheese_land', 'rainbow_road_master',
  'desert_dunes_01', 'crystal_palace_01', 'sky_island_01', 'volcano_canyon_01',
  'cyber_boulevard_01', 'ice_cavern_01', 'underwater_temple_01', 'moonlight_cavern_01',
  'forest_maze_01', 'magic_forest_01',
]);

export function isRaceCourse(courseKey, arenaType) {
  if (arenaType === 'sandbox' || arenaType === 'flight_rings' || arenaType === 'flappy_bird' || arenaType === 'robot_football' || arenaType === 'robot_fight') {
    return false;
  }
  if (RACE_ARENA_TYPES.has(arenaType) || RACE_COURSE_IDS.has(courseKey)) return true;
  return false;
}

/**
 * Starter program for Rainbow Road.
 * Blocks control how far / how long to drive; movement follows the track spline.
 */
export const RACE_STARTER_SCRIPT = [
  { id: 'when_start', label: 'When race starts', icon: '🏁' },
  { id: 'set_speed', label: 'Set speed', icon: '⚡', paramValues: { speed: 65 } },
  { id: 'boost', label: 'Boost off the line', icon: '🚀', paramValues: { seconds: 1.2 } },
  { id: 'move_forward_continuous', label: 'Keep driving', icon: '▶' },
  { id: 'move_forward', label: 'Launch straight', icon: '⬆️', paramValues: { steps: 5 } },
  { id: 'curve_right', label: 'Ease right', icon: '〰', paramValues: { degrees: 26, steps: 6 } },
  { id: 'curve_right', label: 'Sweep right', icon: '〰', paramValues: { degrees: 26, steps: 8 } },
  { id: 'move_forward', label: 'Canyon straight', icon: '⬆️', paramValues: { steps: 7 } },
  { id: 'boost', label: 'Boost on straight', icon: '🚀', paramValues: { seconds: 1.2 } },
  { id: 'curve_left', label: 'Galaxy hairpin', icon: '〰', paramValues: { degrees: 109, steps: 12 } },
  { id: 'curve_left', label: 'Star climb', icon: '〰', paramValues: { degrees: 46, steps: 13 } },
  { id: 'curve_left', label: 'Left arc', icon: '〰', paramValues: { degrees: 34, steps: 12 } },
  { id: 'curve_left', label: 'Crystal bend', icon: '〰', paramValues: { degrees: 48, steps: 13 } },
  { id: 'curve_left', label: 'Approach home', icon: '〰', paramValues: { degrees: 52, steps: 12 } },
  { id: 'curve_left', label: 'Final turn home', icon: '〰', paramValues: { degrees: 135, steps: 12 } },
];

/** Luigi Circuit — gentle oval with villa curves */
export const LUIGI_CIRCUIT_SCRIPT = [
  { id: 'when_start', label: 'When race starts', icon: '🏁' },
  { id: 'set_speed', label: 'Set speed', icon: '⚡', paramValues: { speed: 60 } },
  { id: 'boost', label: 'Boost off the line', icon: '🚀', paramValues: { seconds: 1.0 } },
  { id: 'move_forward_continuous', label: 'Keep driving', icon: '▶' },
  { id: 'move_forward', label: 'Start straight', icon: '⬆️', paramValues: { steps: 6 } },
  { id: 'curve_left', label: 'Villa curve left', icon: '〰', paramValues: { degrees: 42, steps: 8 } },
  { id: 'curve_left', label: 'Fountain bend', icon: '〰', paramValues: { degrees: 38, steps: 7 } },
  { id: 'move_forward', label: 'Mansion straight', icon: '⬆️', paramValues: { steps: 5 } },
  { id: 'curve_right', label: 'Cypress sweep', icon: '〰', paramValues: { degrees: 44, steps: 8 } },
  { id: 'curve_right', label: 'Italian hairpin', icon: '〰', paramValues: { degrees: 52, steps: 9 } },
  { id: 'move_forward', label: 'Home straight', icon: '⬆️', paramValues: { steps: 6 } },
  { id: 'curve_left', label: 'Final villa turn', icon: '〰', paramValues: { degrees: 36, steps: 7 } },
];

/** Moo Moo Meadows — pastoral figure-8 */
export const MOO_MOO_MEADOWS_SCRIPT = [
  { id: 'when_start', label: 'When race starts', icon: '🏁' },
  { id: 'set_speed', label: 'Set speed', icon: '⚡', paramValues: { speed: 55 } },
  { id: 'boost', label: 'Boost off the line', icon: '🚀', paramValues: { seconds: 0.8 } },
  { id: 'move_forward_continuous', label: 'Keep driving', icon: '▶' },
  { id: 'move_forward', label: 'Meadow straight', icon: '⬆️', paramValues: { steps: 5 } },
  { id: 'curve_right', label: 'Barn bend', icon: '〰', paramValues: { degrees: 55, steps: 9 } },
  { id: 'curve_left', label: 'Cow field loop', icon: '〰', paramValues: { degrees: 48, steps: 8 } },
  { id: 'move_forward', label: 'Pasture straight', icon: '⬆️', paramValues: { steps: 4 } },
  { id: 'curve_right', label: 'Figure-8 cross', icon: '〰', paramValues: { degrees: 62, steps: 10 } },
  { id: 'curve_left', label: 'Farm hairpin', icon: '〰', paramValues: { degrees: 70, steps: 11 } },
  { id: 'move_forward', label: 'Barnyard dash', icon: '⬆️', paramValues: { steps: 5 } },
  { id: 'curve_right', label: 'Finish meadow', icon: '〰', paramValues: { degrees: 40, steps: 7 } },
];

/** Mario Circuit — stadium S-curves and chicanes */
export const MARIO_CIRCUIT_SCRIPT = [
  { id: 'when_start', label: 'When race starts', icon: '🏁' },
  { id: 'set_speed', label: 'Set speed', icon: '⚡', paramValues: { speed: 70 } },
  { id: 'boost', label: 'Boost off the line', icon: '🚀', paramValues: { seconds: 1.4 } },
  { id: 'move_forward_continuous', label: 'Keep driving', icon: '▶' },
  { id: 'move_forward', label: 'Start straight', icon: '⬆️', paramValues: { steps: 6 } },
  { id: 'curve_left', label: 'S-curve left', icon: '〰', paramValues: { degrees: 35, steps: 7 } },
  { id: 'curve_right', label: 'S-curve right', icon: '〰', paramValues: { degrees: 32, steps: 7 } },
  { id: 'move_forward', label: 'Stadium straight', icon: '⬆️', paramValues: { steps: 5 } },
  { id: 'boost', label: 'Boost on straight', icon: '🚀', paramValues: { seconds: 1.0 } },
  { id: 'curve_left', label: 'Grandstand turn', icon: '〰', paramValues: { degrees: 55, steps: 9 } },
  { id: 'curve_right', label: 'Pit lane chicane', icon: '〰', paramValues: { degrees: 48, steps: 8 } },
  { id: 'curve_left', label: 'Clubhouse bend', icon: '〰', paramValues: { degrees: 42, steps: 8 } },
  { id: 'move_forward', label: 'Final straight', icon: '⬆️', paramValues: { steps: 6 } },
  { id: 'curve_left', label: 'Checkered turn', icon: '〰', paramValues: { degrees: 45, steps: 9 } },
];

/** Enchanted Garden — flower entrance, mushroom grove, rope bridge */
export const GARDEN_01_SCRIPT = [
  { id: 'when_start', label: 'When race starts', icon: '🏁' },
  { id: 'set_speed', label: 'Set speed', icon: '⚡', paramValues: { speed: 60 } },
  { id: 'boost', label: 'Boost off the line', icon: '🚀', paramValues: { seconds: 1.0 } },
  { id: 'move_forward_continuous', label: 'Keep driving', icon: '▶' },
  { id: 'move_forward', label: 'Flower straight', icon: '⬆️', paramValues: { steps: 6 } },
  { id: 'curve_right', label: 'Mushroom grove', icon: '〰', paramValues: { degrees: 32, steps: 7 } },
  { id: 'curve_left', label: 'Grove weave', icon: '〰', paramValues: { degrees: 28, steps: 6 } },
  { id: 'move_forward', label: 'Bridge approach', icon: '⬆️', paramValues: { steps: 5 } },
  { id: 'curve_right', label: 'Rope bridge', icon: '〰', paramValues: { degrees: 42, steps: 8 } },
  { id: 'move_forward', label: 'Waterfall loop', icon: '⬆️', paramValues: { steps: 6 } },
  { id: 'boost', label: 'Boost straight', icon: '🚀', paramValues: { seconds: 1.1 } },
  { id: 'curve_left', label: 'Garden finish', icon: '〰', paramValues: { degrees: 48, steps: 9 } },
];

/** Neon Arcade City */
export const ARCADE_CITY_01_SCRIPT = [
  { id: 'when_start', label: 'When race starts', icon: '🏁' },
  { id: 'set_speed', label: 'Set speed', icon: '⚡', paramValues: { speed: 68 } },
  { id: 'boost', label: 'Neon launch', icon: '🚀', paramValues: { seconds: 1.2 } },
  { id: 'move_forward_continuous', label: 'Keep driving', icon: '▶' },
  { id: 'move_forward', label: 'Main street', icon: '⬆️', paramValues: { steps: 6 } },
  { id: 'curve_right', label: 'Neon tunnel', icon: '〰', paramValues: { degrees: 38, steps: 8 } },
  { id: 'move_forward', label: 'Sky highway', icon: '⬆️', paramValues: { steps: 5 } },
  { id: 'curve_left', label: 'Steam alley', icon: '〰', paramValues: { degrees: 55, steps: 9 } },
  { id: 'boost', label: 'Plaza boost', icon: '🚀', paramValues: { seconds: 1.0 } },
  { id: 'curve_right', label: 'Roundabout', icon: '〰', paramValues: { degrees: 44, steps: 8 } },
  { id: 'move_forward', label: 'Finish straight', icon: '⬆️', paramValues: { steps: 6 } },
];

/** Crystal Cavern */
export const CAVERN_01_SCRIPT = [
  { id: 'when_start', label: 'When race starts', icon: '🏁' },
  { id: 'set_speed', label: 'Set speed', icon: '⚡', paramValues: { speed: 62 } },
  { id: 'boost', label: 'Cathedral boost', icon: '🚀', paramValues: { seconds: 1.0 } },
  { id: 'move_forward_continuous', label: 'Keep driving', icon: '▶' },
  { id: 'move_forward', label: 'Crystal hall', icon: '⬆️', paramValues: { steps: 5 } },
  { id: 'curve_left', label: 'Crystal maze', icon: '〰', paramValues: { degrees: 48, steps: 9 } },
  { id: 'curve_right', label: 'S-curve gems', icon: '〰', paramValues: { degrees: 36, steps: 7 } },
  { id: 'move_forward', label: 'Glass bridge', icon: '⬆️', paramValues: { steps: 6 } },
  { id: 'curve_left', label: 'Spiral climb', icon: '〰', paramValues: { degrees: 52, steps: 10 } },
  { id: 'boost', label: 'Amphitheater dash', icon: '🚀', paramValues: { seconds: 1.1 } },
  { id: 'curve_right', label: 'Grand finish', icon: '〰', paramValues: { degrees: 40, steps: 8 } },
];

/** Sunset Beach */
export const BEACH_01_SCRIPT = [
  { id: 'when_start', label: 'When race starts', icon: '🏁' },
  { id: 'set_speed', label: 'Set speed', icon: '⚡', paramValues: { speed: 58 } },
  { id: 'boost', label: 'Pier launch', icon: '🚀', paramValues: { seconds: 1.0 } },
  { id: 'move_forward_continuous', label: 'Keep driving', icon: '▶' },
  { id: 'move_forward', label: 'Pier straight', icon: '⬆️', paramValues: { steps: 5 } },
  { id: 'curve_right', label: 'Shoreline curve', icon: '〰', paramValues: { degrees: 34, steps: 7 } },
  { id: 'move_forward', label: 'Beach straight', icon: '⬆️', paramValues: { steps: 6 } },
  { id: 'curve_left', label: 'Coral hairpin', icon: '〰', paramValues: { degrees: 72, steps: 10 } },
  { id: 'move_forward', label: 'Tide pool', icon: '⬆️', paramValues: { steps: 4 } },
  { id: 'boost', label: 'Dune jump', icon: '🚀', paramValues: { seconds: 1.0 } },
  { id: 'curve_right', label: 'Finish sweep', icon: '〰', paramValues: { degrees: 38, steps: 8 } },
];

function start(speed, boostLabel) {
  return [
    { id: 'when_start', label: 'When race starts', icon: '🏁' },
    { id: 'set_speed', label: 'Go fast!', icon: '⚡', paramValues: { speed: Math.max(88, speed) } },
    { id: 'boost', label: boostLabel, icon: '🚀', paramValues: { seconds: 0.45 } },
  ];
}
function fwd(label, steps) {
  return { id: 'move_forward', label, icon: '⬆️', paramValues: { steps } };
}
function left(label, degrees, steps) {
  return { id: 'curve_left', label, icon: '〰', paramValues: { degrees, steps } };
}
function right(label, degrees, steps) {
  return { id: 'curve_right', label, icon: '〰', paramValues: { degrees, steps } };
}

/**
 * Cup scripts — one named block per minimap section.
 * On cup tracks those blocks advance along the race spline (not compass heading).
 * Never includes move_forward_continuous.
 */
export const CUP_TRACK_SCRIPTS = {
  sunset_cove_01: [
    ...start(55, 'Pier launch'),
    fwd('Coastal curve', 8),
    right('Ocean bend', 55, 10),
    left('Bay return', 58, 11),
  ],
  candy_carnival_01: [
    ...start(55, 'Midway launch'),
    fwd('Top loop approach', 8),
    right('Top loop right', 52, 10),
    left('Crossover center', 58, 11),
    left('Bottom loop left', 52, 10),
    fwd('Candy finish', 8),
  ],
  neon_metro_01: [
    ...start(58, 'Tunnel launch'),
    fwd('Tunnel run', 8),
    left('Station corner', 55, 10),
    fwd('Departure arch', 8),
    left('Street grate', 55, 10),
  ],
  cloud_citadel_01: [
    ...start(56, 'Castle launch'),
    fwd('Castle gate', 8),
    right('Rope bridge', 55, 10),
    right('Cloud loop', 55, 10),
    right('Citadel finish', 55, 10),
  ],
  jungle_ruins_01: [
    ...start(52, 'Temple launch'),
    fwd('Temple gate', 8),
    right('Pyramid hairpin', 60, 11),
    left('Rune arch', 55, 10),
    right('Jungle exit', 55, 10),
  ],
  frost_peak_01: [
    ...start(50, 'Alpine launch'),
    fwd('Alpine start', 8),
    left('Pine slalom', 55, 10),
    left('Ice bridge', 55, 10),
    left('Snow jump', 55, 10),
  ],
  lava_foundry_01: [
    ...start(50, 'Forge launch'),
    fwd('Forge floor', 8),
    right('Lava channel', 55, 10),
    left('Gear arch', 55, 10),
    right('Crane straight', 55, 10),
  ],
  star_station_01: [
    ...start(58, 'Dock launch'),
    fwd('Dock ring', 8),
    right('Glass deck', 55, 10),
    right('Airlock arch', 55, 10),
    right('Solar loop', 55, 10),
  ],
  fairy_glen_01: [
    ...start(50, 'Garden launch'),
    fwd('Garden gate', 8),
    left('Flower tunnel', 55, 10),
    left('Toadstool arch', 55, 10),
    left('Fairy finish', 55, 10),
  ],
  thunder_ridge_01: [
    ...start(52, 'Ridge launch'),
    fwd('Ridge climb', 8),
    left('Hairpin', 70, 12),
    right('Windmill turn', 60, 11),
    left('Storm tunnel', 60, 11),
  ],
};

/**
 * Open starter — kids build the lap themselves with Move / Curve blocks.
 * Named section helpers stay in the Track palette via CUP_TRACK_SCRIPTS.
 */
export const CUP_OPEN_STARTER = [
  { id: 'when_start', label: 'When race starts', icon: '🏁' },
  { id: 'set_speed', label: 'Set speed', icon: '⚡', paramValues: { speed: 60 } },
  { id: 'move_forward_continuous', label: 'Keep driving', icon: '▶' },
];

const PREMIUM_TRACK_SCRIPTS = Object.fromEntries(
  Object.entries(TRACK_STANDARDS).map(([id]) => [id, CUP_TRACK_SCRIPTS[id] || CUP_TRACK_SCRIPTS.sunset_cove_01]),
);

/** Per-track named-section guides keyed by arenaType (palette helpers, not auto-run). */
export const TRACK_STARTER_SCRIPTS = {
  rainbow_road: RACE_STARTER_SCRIPT,
  street_grand_prix: RACE_STARTER_SCRIPT,
  circuit_sprint: RACE_STARTER_SCRIPT,
  rainbow_road_master: RACE_STARTER_SCRIPT,
  luigi_circuit: LUIGI_CIRCUIT_SCRIPT,
  moo_moo_meadows: MOO_MOO_MEADOWS_SCRIPT,
  mario_circuit: MARIO_CIRCUIT_SCRIPT,
  ...PREMIUM_TRACK_SCRIPTS,
};

/** Named lap guide for the Track palette — optional helpers, not a solved program. */
export function getRaceTrackGuideScript(arenaType, courseKey = '') {
  if (CUP_TRACK_SCRIPTS[arenaType]) return CUP_TRACK_SCRIPTS[arenaType];
  if (CUP_TRACK_SCRIPTS[courseKey]) return CUP_TRACK_SCRIPTS[courseKey];
  if (TRACK_STARTER_SCRIPTS[arenaType]) return TRACK_STARTER_SCRIPTS[arenaType];
  const byCourse = {
    street_grand_prix: RACE_STARTER_SCRIPT,
    luigi_circuit: LUIGI_CIRCUIT_SCRIPT,
    moo_moo_meadows: MOO_MOO_MEADOWS_SCRIPT,
    mario_circuit: MARIO_CIRCUIT_SCRIPT,
  };
  if (byCourse[courseKey]) return byCourse[courseKey];
  return RACE_STARTER_SCRIPT;
}

/** Pick the workspace starter — cup tracks begin empty so students write the path. */
export function getRaceStarterScript(arenaType, courseKey = '') {
  if (CUP_TRACK_SCRIPTS[arenaType] || CUP_TRACK_SCRIPTS[courseKey]) return CUP_OPEN_STARTER;
  return getRaceTrackGuideScript(arenaType, courseKey);
}
