/**
 * robot-arena-config.js — Exclusive 3D environments per robot archetype.
 * Each chassis maps to a dedicated environment family with 10 themed arena geometries.
 */

import { PRO_RACING_TRACKS, isCarChassis } from './car-racing-tracks.js';
import { applySecurityBotArenaMeta } from './securitybot-arenas.js';

/** Ten AAA biome kart circuits — rover/scout modes 1–10 */
const BIOME_RACING_ARENAS = PRO_RACING_TRACKS.map((t) => t.arenaType);

/** Environment family definitions — physics, camera, and 10 arena variants */
export const ENVIRONMENTS = {
  underwater: {
    id: 'underwater',
    name: 'Abyssal Ocean Trench',
    emoji: '🌊',
    physics: 'buoyancy',
    camera: 'underwater_follow',
    genre: 'exploration',
    cat: 'underwater',
    arenaTypes: [
      'coral_reef', 'deep_trench', 'kelp_forest', 'robot_reef', 'atlantis',
      'mariana', 'shipwreck', 'bioluminescent', 'pirate_wreck', 'seafloor_scan',
    ],
  },
  emergency: {
    id: 'emergency',
    name: 'Burning City District',
    emoji: '🔥',
    physics: 'ground',
    camera: 'chase_close',
    genre: 'rescue',
    cat: 'emergency',
    arenaTypes: [
      'firebot_blaze', 'hospital_walk', 'snow_rescue', 'firebot_blaze', 'hospital_walk',
      'snow_rescue', 'lava_canyon', 'cyber_city', 'snow_rescue', 'firebot_blaze',
    ],
  },
  sky_aerial: {
    id: 'sky_aerial',
    name: 'High-Altitude Sky Arena',
    emoji: '☁️',
    physics: 'flight_3dof',
    camera: 'aerial_chase',
    genre: 'aerial',
    cat: 'sky',
    arenaTypes: [
      'drone_canyon', 'canyon_flight', 'storm_cloud', 'cloud_race', 'space_orbit',
      'flight_rings', 'jet_stunt', 'rooftop_delivery', 'typhoon', 'warp_gate',
    ],
  },
  flappy: {
    id: 'flappy',
    name: 'Flappy Sky Canopy',
    emoji: '🐦',
    physics: 'catapult_2d',
    camera: 'side_scroll',
    genre: 'action',
    cat: 'flappy',
    arenaTypes: Array(10).fill('flappy_bird'),
  },
  rainbow_road: {
    id: 'rainbow_road',
    name: 'Cosmic Neon Highway',
    emoji: '🌈',
    physics: 'racing_spline',
    camera: 'race_chase',
    genre: 'racing',
    cat: 'racing',
    arenaTypes: BIOME_RACING_ARENAS,
  },
  hybrid_race_sky: {
    id: 'hybrid_race_sky',
    name: 'Sky & Neon Circuit',
    emoji: '🏎️',
    physics: 'hybrid',
    camera: 'race_chase',
    genre: 'aerial',
    cat: 'sky',
    arenaTypes: [
      'rainbow_road', 'drone_canyon', 'sunny_circuit', 'cloud_race',
      'dragon_skyway', 'flight_rings', 'volcano_drift', 'storm_cloud',
      'street_grand_prix', 'warp_gate',
    ],
  },
  football: {
    id: 'football',
    name: '3D Turf Pitch',
    emoji: '⚽',
    physics: 'ground',
    camera: 'stadium_wide',
    genre: 'football',
    cat: 'football',
    arenaTypes: Array(10).fill('robot_football'),
  },
  boxing_mech: {
    id: 'boxing_mech',
    name: 'Elevated 3D Ring & Colosseum',
    emoji: '🥊',
    physics: 'combat',
    camera: 'fight_orbit',
    genre: 'combat',
    cat: 'combat',
    arenaTypes: Array(10).fill('robot_fight'),
  },
  martian: {
    id: 'martian',
    name: 'Red Planet Base',
    emoji: '🚀',
    physics: 'low_gravity',
    camera: 'rover_wide',
    genre: 'exploration',
    cat: 'space',
    arenaTypes: [
      'alien_planet', 'desert_rally', 'space_corridor', 'lava_canyon',
      'alien_planet', 'rough', 'space_orbit', 'desert_rally',
      'crystal_caverns', 'warp_gate',
    ],
  },
  cyber_ninja: {
    id: 'cyber_ninja',
    name: 'Moonlit Rooftop & Lasers',
    emoji: '🥷',
    physics: 'stealth_ground',
    camera: 'stealth_follow',
    genre: 'stealth',
    cat: 'stealth',
    arenaTypes: [
      'museum_heist', 'shadow_escape', 'cyber_city', 'night_patrol',
      'shadow_escape', 'museum_heist', 'cyber_city', 'night_patrol',
      'escape_wall', 'jump_world',
    ],
  },
  industrial: {
    id: 'industrial',
    name: 'Automated Assembly Yard',
    emoji: '🏭',
    physics: 'ground',
    camera: 'factory_overview',
    genre: 'simulation',
    cat: 'factory',
    arenaTypes: [
      'auto_factory', 'factory_floor', 'warehouse', 'underground_mine', 'power_garden',
      'pipeline_crawl', 'urban_obstacle', 'factory_floor', 'auto_factory', 'colosseum',
    ],
  },
  spider_climber: {
    id: 'spider_climber',
    name: 'Vertical Web & Ruins',
    emoji: '🕷️',
    physics: 'walker_climb',
    camera: 'climber_follow',
    genre: 'adventure',
    cat: 'walker',
    arenaTypes: [
      'spider_rescue', 'spider_pipeline', 'pipeline_crawl', 'temple_climb',
      'collapsed_building', 'crystal_caverns', 'jump_world', 'deep_cave',
      'colosseum', 'temple_climb',
    ],
  },
  sandbox: {
    id: 'sandbox',
    name: 'Custom Test Lab',
    emoji: '✨',
    physics: 'ground',
    camera: 'free_orbit',
    genre: 'sandbox',
    cat: 'sandbox',
    arenaTypes: [
      'auto_factory', 'checkpoint', 'targets', 'delivery', 'line_follow',
      'dodge_easy', 'power_garden', 'urban_obstacle', 'crystal_caverns', 'warehouse',
    ],
  },
};

/** Map each chassis to its primary environment family */
export const CHASSIS_ENVIRONMENT = {
  submarine: 'underwater',
  deepseabot: 'underwater',
  firebot: 'emergency',
  rescuedrone: 'emergency',
  medbot: 'emergency',
  drone: 'sky_aerial',
  helicopter: 'sky_aerial',
  jetplane: 'sky_aerial',
  steathjet: 'sky_aerial',
  aerobat: 'sky_aerial',
  hoverbot: 'sky_aerial',
  racedrone: 'hybrid_race_sky',
  hoverracer: 'hybrid_race_sky',
  birdbot: 'flappy',
  rover: 'rainbow_road',
  scout: 'rainbow_road',
  footballbot: 'football',
  striker: 'boxing_mech',
  berserker: 'boxing_mech',
  battlebot: 'boxing_mech',
  tank: 'boxing_mech',
  mech: 'boxing_mech',
  blaster: 'boxing_mech',
  spacerover: 'martian',
  crawler: 'martian',
  stealth: 'cyber_ninja',
  ninja: 'cyber_ninja',
  robotarm: 'industrial',
  factorybot: 'industrial',
  legobot: 'industrial',
  miningbot: 'industrial',
  farmbot: 'industrial',
  securitybot: 'industrial',
  droid: 'industrial',
  spider: 'spider_climber',
  custom: 'sandbox',
};

/** Kart cup / legacy ribbon tracks — only rover & scout should load these as race courses */
export const KART_RACE_ARENA_TYPES = new Set([
  ...PRO_RACING_TRACKS.map((t) => t.arenaType),
  'street_grand_prix',
  'circuit_sprint',
  'rainbow_road',
  'rainbow_road_master',
  'racing_circuit',
  'sunny_circuit',
  'dragon_skyway',
  'volcano_drift',
  'time_trial_gauntlet',
]);

const RACING_ARENA_TO_COURSE = Object.fromEntries(
  PRO_RACING_TRACKS.map((t) => [t.arenaType, t.courseId]),
);
RACING_ARENA_TO_COURSE.street_grand_prix = 'street_grand_prix';
RACING_ARENA_TO_COURSE.circuit_sprint = 'street_grand_prix';
RACING_ARENA_TO_COURSE.rainbow_road = 'street_grand_prix';
RACING_ARENA_TO_COURSE.sunny_circuit = 'sunny_circuit';
RACING_ARENA_TO_COURSE.dragon_skyway = 'dragon_skyway';
RACING_ARENA_TO_COURSE.volcano_drift = 'volcano_drift';

/** Get environment config for a chassis */
export function getChassisEnvironment(chassisId) {
  const envId = CHASSIS_ENVIRONMENT[chassisId] || CHASSIS_ENVIRONMENT.custom;
  return ENVIRONMENTS[envId] || ENVIRONMENTS.sandbox;
}

/** Get arena type for a specific mode index (1–10) */
export function getModeArenaType(chassisId, modeIndex = 1) {
  const env = getChassisEnvironment(chassisId);
  const idx = Math.max(0, (modeIndex ?? 1) - 1);
  return env.arenaTypes[idx % env.arenaTypes.length];
}

/** Non-car chassis: pick themed arenas, never kart cup ribbons */
export function getNonCarModeArenaType(chassisId, modeIndex = 1) {
  const env = getChassisEnvironment(chassisId);
  const themed = env.arenaTypes.filter((t) => !KART_RACE_ARENA_TYPES.has(t));
  const pool = themed.length ? themed : env.arenaTypes;
  const idx = Math.max(0, (modeIndex ?? 1) - 1);
  return pool[idx % pool.length];
}

/** Apply environment arena + metadata to a chassis mode */
export function applyChassisArenaEnvironment(mode) {
  if (!mode?.chassisId) return mode;

  if (mode.chassisId === 'securitybot') {
    mode = applySecurityBotArenaMeta(mode);
  }

  // Wheeled racers — arena/track comes from applyCarRacingArena (10 biome circuits)
  if (isCarChassis(mode.chassisId)) return mode;

  // Fight/football linked modes keep their arena from linked course resolution
  if (mode.linkedFightCourse || mode.linkedFootballCourse) return mode;

  const env = getChassisEnvironment(mode.chassisId);

  // Flappy birdbot — never remap to kart tracks
  if (env.id === 'flappy' || mode.arenaType === 'flappy_bird') {
    const { linkedRaceCourse: _drop, ...flappyMode } = mode;
    return {
      ...flappyMode,
      arenaType: 'flappy_bird',
      environmentId: env.id,
      environmentName: env.name,
      environmentEmoji: env.emoji,
      physics: mode.physics || env.physics,
      camera: mode.camera || env.camera,
      genre: 'action',
      cat: 'flappy',
    };
  }

  let arenaType = mode.arenaType;
  if (!arenaType || KART_RACE_ARENA_TYPES.has(arenaType)) {
    arenaType = getNonCarModeArenaType(mode.chassisId, mode.modeIndex);
  }

  const { linkedRaceCourse: _staleRace, ...modeSansRace } = mode;
  // Per-mode arena names (e.g. Security Bot → Neo City Central) must win over the
  // chassis-wide family label (Automated Assembly Yard).
  const hasModeArena = Boolean(mode.environmentName && mode.environmentName !== env.name);
  const result = {
    ...modeSansRace,
    arenaType,
    environmentId: hasModeArena && mode.environmentId ? mode.environmentId : env.id,
    environmentName: mode.environmentName || env.name,
    environmentEmoji: mode.environmentEmoji || env.emoji,
    physics: mode.physics || env.physics,
    camera: mode.camera || env.camera,
    genre: mode.genre && mode.genre !== 'racing' ? mode.genre : env.genre,
    cat: mode.cat && mode.cat !== 'racing' ? mode.cat : env.cat,
  };

  return result;
}

/** ARENA_CONFIG alias for UI / canvas — keyed by chassis id */
export const ARENA_CONFIG = Object.fromEntries(
  Object.keys(CHASSIS_ENVIRONMENT).map((chassisId) => {
    const env = getChassisEnvironment(chassisId);
    return [chassisId, {
      archetype: chassisId,
      environmentId: env.id,
      name: env.name,
      emoji: env.emoji,
      physics: env.physics,
      camera: env.camera,
      defaultArenaType: env.arenaTypes[0],
      arenaTypes: env.arenaTypes,
    }];
  }),
);

export const DEFAULT_ARENA = ARENA_CONFIG.rover;
