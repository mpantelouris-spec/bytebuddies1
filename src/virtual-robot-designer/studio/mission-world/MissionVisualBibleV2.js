/**
 * MissionVisualBibleV2 — canonical non-racing arena art direction.
 *
 * Keep objectives in game-mode-specifications.js. This file owns only the
 * render contract: palette, camera, lighting, scatter, hero, goal, and mood.
 */

import { MISSION_ART_DIRECTION_V3 } from './MissionArtDirectionV3.js';

export const MISSION_VISUAL_BIBLE_VERSION = '2026-09-06-v3';

const ART_BY_CHASSIS_MODE = new Map(Object.entries(MISSION_ART_DIRECTION_V3)
  .map(([id, art]) => [`${art.chassisId}:${art.modeNumber}`, { id, art }]));

export function getMissionArtDirection(challenge) {
  if (!challenge) return null;
  const direct = MISSION_ART_DIRECTION_V3[challenge.id];
  if (direct) return direct;
  // Campaign missions can share a chassis without representing a catalog mode.
  if (!challenge.isChassisMode && !challenge.modeSpec) return null;
  const chassis = challenge.chassisId || challenge.modeSpec?.chassisId;
  const number = challenge.modeIndex || challenge.modeSpec?.modeNumber;
  return ART_BY_CHASSIS_MODE.get(`${chassis}:${number}`)?.art || null;
}

const BASE_POST = {
  bloom: 0.34,
  threshold: 0.9,
  radius: 0.24,
  gradeCss: 'saturate(1.18) contrast(1.06) brightness(1.02)',
};

export const MISSION_FAMILY_VISUALS = {
  martian: {
    palette: { primary: '#C1440E', secondary: '#F4A460', accent: '#8B4513', fog: 0xc77a55 },
    keyLight: 0xffc27a, fillLight: 0xe56a32, rimLight: 0xff8a3d, ambient: 0x5a2a22,
    ground: 0xb74a25, fogDensity: 0.013, fogNear: 42, fogFar: 80,
    mood: 'Bright red-planet explorer adventure',
    camera: 'rover_wide',
    gltfTrack: 'lava_foundry_01',
    scatter: ['rock', 'flag', 'beacon', 'dish', 'panel'],
    scatterSpacing: 9,
    hero: ['comm_dish', 'solar_array', 'survey_beacon'],
    post: { ...BASE_POST, bloom: 0.3, gradeCss: 'saturate(1.24) contrast(1.08) brightness(1.03)' },
  },
  industrial: {
    palette: { primary: '#FBBF24', secondary: '#64748B', accent: '#3B82F6', fog: 0x34445a },
    keyLight: 0xfff2cf, fillLight: 0x6aa7ff, rimLight: 0xffc928, ambient: 0x38445a,
    ground: 0x374151, fogDensity: 0.017, fogNear: 36, fogFar: 92,
    mood: 'Busy toy-like factory with clear safety color',
    camera: 'factory_overview',
    gltfTrack: 'lava_foundry_01',
    scatter: ['shelf', 'conveyor', 'crate', 'stack', 'light'],
    scatterSpacing: 10,
    hero: ['conveyor', 'stack_light', 'work_cell'],
    post: { ...BASE_POST, bloom: 0.32, gradeCss: 'saturate(1.2) contrast(1.08) brightness(1.02)' },
  },
  underwater: {
    palette: { primary: '#0D9488', secondary: '#22D3EE', accent: '#F472B6', fog: 0x0b5574 },
    keyLight: 0x8fe9ff, fillLight: 0x0d9488, rimLight: 0x22d3ee, ambient: 0x0a3852,
    ground: 0xd2b77c, fogDensity: 0.025, fogNear: 12, fogFar: 25,
    mood: 'Colorful reef expedition with luminous sea life',
    camera: 'underwater_follow',
    gltfTrack: null,
    scatter: ['coral', 'kelp', 'bubble', 'coral', 'wreck'],
    scatterSpacing: 8,
    hero: ['coral_tower', 'bubble_column', 'wreck_ribs'],
    post: { ...BASE_POST, bloom: 0.3, gradeCss: 'saturate(1.22) contrast(1.04) brightness(0.98) hue-rotate(5deg)' },
  },
  emergency: {
    palette: { primary: '#DC2626', secondary: '#EA580C', accent: '#06B6D4', fog: 0x66514b },
    keyLight: 0xffa45f, fillLight: 0x3bbcff, rimLight: 0xff3b3b, ambient: 0x42343a,
    ground: 0x50545b, fogDensity: 0.018, fogNear: 30, fogFar: 76,
    mood: 'Readable emergency response with warm hero lighting',
    camera: 'chase_close',
    gltfTrack: 'neon_metro_01',
    scatter: ['cone', 'barrier', 'hydrant', 'gurney', 'tape'],
    scatterSpacing: 10,
    hero: ['rescue_vehicle', 'hydrant', 'hazard_barrier'],
    post: { ...BASE_POST, bloom: 0.32, gradeCss: 'saturate(1.25) contrast(1.1) brightness(1.01)' },
  },
  sky_aerial: {
    palette: { primary: '#38BDF8', secondary: '#FFFFFF', accent: '#FBBF24', fog: 0xb8dcef },
    keyLight: 0xffe0a3, fillLight: 0x83cfff, rimLight: 0xffbd45, ambient: 0xb8dcf2,
    ground: 0x4a8a3a, fogDensity: 0.009, fogNear: 85, fogFar: 285,
    mood: 'Golden-hour cloud chase with floating landmarks',
    camera: 'aerial_chase',
    gltfTrack: 'cloud_citadel_01',
    scatter: ['ring', 'pylon', 'cloud', 'ring', 'pad'],
    scatterSpacing: 12,
    hero: ['helipad', 'ring_gate', 'cloud_platform'],
    post: { ...BASE_POST, bloom: 0.22, threshold: 0.94, radius: 0.14 },
  },
  hybrid_race_sky: {
    palette: { primary: '#EC4899', secondary: '#06B6D4', accent: '#A855F7', fog: 0x24134f },
    keyLight: 0xff73d0, fillLight: 0x33e6ff, rimLight: 0xb77aff, ambient: 0x17113a,
    ground: 0x171827, fogDensity: 0.014, fogNear: 55, fogFar: 180,
    mood: 'Fast neon sky circuit with clean motion cues',
    camera: 'aerial_chase',
    gltfTrack: 'star_station_01',
    scatter: ['ring', 'boost', 'ring', 'neon', 'ring'],
    scatterSpacing: 10,
    hero: ['warp_tunnel', 'boost_pad', 'speed_ring'],
    post: { ...BASE_POST, bloom: 0.36, threshold: 0.9, radius: 0.2 },
  },
  cyber_ninja: {
    palette: { primary: '#EC4899', secondary: '#06B6D4', accent: '#EF4444', fog: 0x091024 },
    keyLight: 0x6a8fff, fillLight: 0xec4899, rimLight: 0x06d9ef, ambient: 0x10152b,
    ground: 0x171d2e, fogDensity: 0.019, fogNear: 24, fogFar: 75,
    mood: 'Moonlit neon stealth playground',
    camera: 'stealth_follow',
    gltfTrack: 'neon_metro_01',
    scatter: ['sign', 'laser', 'vent', 'sign', 'tower'],
    scatterSpacing: 9,
    hero: ['laser_grid', 'hack_terminal', 'security_camera'],
    underground: true,
    post: { ...BASE_POST, bloom: 0.36, threshold: 0.9, radius: 0.22, gradeCss: 'saturate(1.24) contrast(1.1) brightness(0.96)' },
  },
  spider_climber: {
    palette: { primary: '#10B981', secondary: '#E2E8F0', accent: '#365314', fog: 0x29352d },
    keyLight: 0xfff1c2, fillLight: 0x38d795, rimLight: 0xddeeff, ambient: 0x26352f,
    ground: 0x57534e, fogDensity: 0.021, fogNear: 22, fogFar: 70,
    mood: 'Vertical pipe-and-web climbing adventure',
    camera: 'climber_follow',
    gltfTrack: 'jungle_ruins_01',
    scatter: ['pipe', 'web', 'girder', 'pipe', 'fungus'],
    scatterSpacing: 9,
    hero: ['web_wall', 'pipe_stack', 'glow_fungus'],
    post: { ...BASE_POST, bloom: 0.26 },
  },
  boxing_mech: {
    palette: { primary: '#EF4444', secondary: '#FBBF24', accent: '#E5E7EB', fog: 0x33141d },
    keyLight: 0xffffff, fillLight: 0xef4444, rimLight: 0xfbbf24, ambient: 0x261521,
    ground: 0xe5e7eb, fogDensity: 0.013, fogNear: 35, fogFar: 100,
    mood: 'Bright championship arena with readable fighters',
    camera: 'fight_broadcast',
    gltfTrack: 'candy_carnival_01',
    scatter: ['rope', 'post', 'banner', 'crowd', 'light'],
    scatterSpacing: 10,
    hero: ['jumbotron', 'corner_spotlights', 'championship_banner'],
    post: { ...BASE_POST, bloom: 0.3 },
  },
  flappy: {
    palette: { primary: '#EF4444', secondary: '#22C55E', accent: '#87CEEB', fog: 0x87ceeb },
    keyLight: 0xffffff, fillLight: 0x9ddcff, rimLight: 0xffd34d, ambient: 0xd5efff,
    ground: 0x7cb342, fogDensity: 0.006, fogNear: 55, fogFar: 180,
    mood: 'Bright side-scrolling cartoon sky',
    camera: 'side_scroll',
    gltfTrack: 'fairy_glen_01',
    scatter: ['pipe', 'cloud', 'nest', 'pipe', 'balloon'],
    scatterSpacing: 11,
    hero: ['pipe_pair', 'nest', 'balloon_cluster'],
    post: { ...BASE_POST, bloom: 0.22, gradeCss: 'saturate(1.3) contrast(1.04) brightness(1.06)' },
  },
  sandbox: {
    palette: { primary: '#3B82F6', secondary: '#22C55E', accent: '#FBBF24', fog: 0xe8f0f8 },
    keyLight: 0xffffff, fillLight: 0xcbd5e1, rimLight: 0x3b82f6, ambient: 0xf1f5f9,
    ground: 0xe2e8f0, fogDensity: 0.006, fogNear: 60, fogFar: 180,
    mood: 'Clean school robotics test lab',
    camera: 'lab_overview',
    gltfTrack: 'candy_carnival_01',
    scatter: ['tile', 'flag', 'wall', 'tile', 'target'],
    scatterSpacing: 10,
    hero: ['test_gantry', 'color_tiles', 'calibration_target'],
    post: { ...BASE_POST, bloom: 0.2, gradeCss: 'saturate(1.12) contrast(1.03) brightness(1.05)' },
  },
};

export const MISSION_VISUAL_OVERRIDES = {
  miningbot_crystal_ore_extraction: {
    look: 'crystal_quarry',
    hero: ['amethyst_wall', 'timber_braces', 'ore_cart_rails'],
    goalLabel: 'CRYSTAL EXTRACTION',
    accent: 0xa855f7,
    mood: 'Treasure-hunter sparkle in a safe working mine',
    post: { bloom: 0.24, threshold: 0.93, radius: 0.18 },
  },
  securitybot_night_sentry_watch: {
    look: 'security_warehouse',
    hero: ['guard_booth', 'searchlight', 'warehouse_aisles'],
    goalLabel: 'SECTOR CLEAR',
    accent: 0x3b82f6,
    mood: 'Confident night patrol through a busy warehouse',
    post: { bloom: 0.2, threshold: 0.94, radius: 0.16 },
  },
  stealth_silent_footsteps: {
    look: 'cyber_silent_footsteps',
    hero: ['sleeping_guards', 'noise_tiles', 'neon_alley'],
    goalLabel: 'SERVER ROOM',
    accent: 0x06d9ef,
    mood: 'Careful neon-city infiltration with readable quiet paths',
    post: { bloom: 0.26, threshold: 0.92, radius: 0.18 },
  },
  submarine_coral_reef_survey: {
    look: 'coral_reef_survey',
    hero: ['coral_towers', 'fish_school', 'bubble_columns'],
    goalLabel: 'REEF SURVEY',
    accent: 0x22d3ee,
    mood: 'Friendly tropical reef expedition',
    post: { bloom: 0.22, threshold: 0.93, radius: 0.16 },
  },
};

export function getMissionFamilyVisual(environmentId) {
  return MISSION_FAMILY_VISUALS[environmentId] || MISSION_FAMILY_VISUALS.industrial;
}

export function getMissionVisual(challenge, environmentId) {
  const art = getMissionArtDirection(challenge);
  const family = getMissionFamilyVisual(art?.environmentId || environmentId);
  const override = MISSION_VISUAL_OVERRIDES[challenge?.id] || {};
  return {
    ...family,
    ...(art || {}),
    ...override,
    version: MISSION_VISUAL_BIBLE_VERSION,
    palette: { ...family.palette, ...(art?.palette || {}), ...(override.palette || {}) },
    post: { ...family.post, ...(override.post || {}) },
  };
}
