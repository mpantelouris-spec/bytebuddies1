/**
 * MKTrackRegistry.js — 12 Mario Kart–inspired circuits (Tutorial → Master).
 * Rainbow Road Master reuses the flagship pro circuit; other tracks use unique splines.
 */
import { MARIO_CIRCUIT_RAINBOW } from '../MarioKartTrackBuilder.js';
import { CLASSIC_RAINBOW_TRACK } from './MKTrackVisualSpec.js';
import { buildProfessionalCircuitWaypoints } from '../ProfessionalRainbowTrack.js';
import { BIOME_TRACKS, BIOME_ARENA_TYPES, COSMIC_SKYWAY_BONUS_TRACKS } from './BiomeTrackRegistry.js';
import { mergeTrackStandard, buildTrackSegmentsFromSections } from './CodeRacerTrackStandards.js';

/** Simple flat oval */
function ovalSpline(rx = 42, rz = 28, y = 0, segments = 16) {
  const pts = [];
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    pts.push({ x: Math.cos(a) * rx, y, z: Math.sin(a) * rz });
  }
  return pts;
}

/** Pastoral meadow loop — clean oval (stable placement, no crossover ambiguity). */
function meadowOvalSpline(rx = 40, rz = 28, y = 0) {
  return ovalSpline(rx, rz, y, 24);
}

/** Professional stadium circuit — start straight, S-curve, 4 wide turns, sharp 45° finale */
const MARIO_CIRCUIT_SPLINE = [
  { x: 0, y: 0, z: 64 }, { x: 0, y: 0, z: 58 }, { x: 0, y: 0, z: 52 },
  { x: -5, y: 0, z: 46 }, { x: -12, y: 0, z: 42 }, { x: -18, y: 0, z: 36 },
  { x: -16, y: 0, z: 30 }, { x: -8, y: 0, z: 26 }, { x: 2, y: 0, z: 24 },
  { x: 14, y: 0, z: 22 }, { x: 28, y: 0, z: 26 }, { x: 40, y: 0, z: 36 },
  { x: 48, y: 0, z: 50 }, { x: 44, y: 0, z: 64 }, { x: 32, y: 0, z: 74 },
  { x: 16, y: 0, z: 78 }, { x: 0, y: 0, z: 72 }, { x: -16, y: 0, z: 62 },
  { x: -28, y: 0, z: 48 }, { x: -34, y: 0, z: 30 }, { x: -30, y: 0, z: 12 },
  { x: -20, y: 0, z: -2 }, { x: -6, y: 0, z: -14 }, { x: 12, y: 0, z: -20 },
  { x: 32, y: 0, z: -16 }, { x: 46, y: 0, z: -2 }, { x: 44, y: 0, z: 16 },
  { x: 32, y: 0, z: 32 }, { x: 16, y: 0, z: 46 }, { x: 4, y: 0, z: 56 },
  { x: 0, y: 0, z: 64 },
];

const PEACH_CASTLE_SPLINE = ovalSpline(48, 32, 0, 20);

const CANYON_SPLINE = [
  { x: 0, y: 2, z: 44 }, { x: 0, y: 6, z: 28 }, { x: 12, y: 10, z: 14 },
  { x: 28, y: 14, z: 4 }, { x: 44, y: 12, z: -6 }, { x: 48, y: 8, z: -22 },
  { x: 36, y: 4, z: -36 }, { x: 16, y: 2, z: -42 }, { x: -8, y: 4, z: -36 },
  { x: -28, y: 8, z: -22 }, { x: -36, y: 12, z: -4 }, { x: -28, y: 10, z: 16 },
  { x: -12, y: 6, z: 30 }, { x: 0, y: 3, z: 38 }, { x: 0, y: 2, z: 44 },
];

const BOWSER_CASTLE_SPLINE = [
  { x: 0, y: 0, z: 40 }, { x: 8, y: 0, z: 32 }, { x: 18, y: 0, z: 28 },
  { x: 28, y: 0, z: 18 }, { x: 22, y: 0, z: 6 }, { x: 10, y: 0, z: -2 },
  { x: -6, y: 0, z: -8 }, { x: -20, y: 0, z: -4 }, { x: -28, y: 0, z: 8 },
  { x: -24, y: 0, z: 22 }, { x: -12, y: 0, z: 32 }, { x: 0, y: 0, z: 40 },
];

const DESERT_SPLINE = [
  { x: 0, z: 36 }, { x: 18, z: 28 }, { x: 32, z: 12 }, { x: 28, z: -8 },
  { x: 12, z: -24 }, { x: -10, z: -28 }, { x: -28, z: -14 }, { x: -32, z: 8 },
  { x: -18, z: 26 }, { x: 0, z: 36 },
].map((p) => ({ ...p, y: 0 }));

const BONE_DESERT_SPLINE = [
  { x: 0, z: 30 }, { x: 14, z: 22 }, { x: 22, z: 6 }, { x: 16, z: -10 },
  { x: 0, z: -18 }, { x: -16, z: -10 }, { x: -22, z: 6 }, { x: -14, z: 22 },
  { x: 0, z: 30 },
].map((p) => ({ ...p, y: 0 }));

const SLIDE_SPLINE = [
  { x: 0, y: 8, z: 40 }, { x: 0, y: 6, z: 28 }, { x: 6, y: 4, z: 16 },
  { x: 14, y: 2, z: 6 }, { x: 22, y: 1, z: -4 }, { x: 16, y: 0, z: -16 },
  { x: 4, y: 0, z: -24 }, { x: -10, y: 1, z: -20 }, { x: -18, y: 3, z: -6 },
  { x: -12, y: 5, z: 10 }, { x: 0, y: 7, z: 24 }, { x: 0, y: 8, z: 40 },
];

const VOLCANO_SPLINE = [
  { x: 0, z: 34 }, { x: 16, z: 26 }, { x: 26, z: 10 }, { x: 20, z: -8 },
  { x: 4, z: -22 }, { x: -14, z: -18 }, { x: -26, z: -4 }, { x: -20, z: 14 },
  { x: -6, z: 28 }, { x: 0, z: 34 },
].map((p) => ({ ...p, y: 0 }));

const CHEESE_SPLINE = (() => {
  const pts = [];
  for (let i = 0; i <= 40; i++) {
    const t = (i / 40) * Math.PI * 2;
    pts.push({
      x: Math.cos(t) * 38 + Math.sin(t * 3) * 6,
      y: Math.sin(t * 2) * 4,
      z: Math.sin(t) * 34 + Math.cos(t * 2) * 5,
    });
  }
  return pts;
})();

export const MK_TRACKS = [
  {
    id: 'luigi_circuit',
    courseId: 'luigi_circuit',
    arenaType: 'luigi_circuit',
    label: 'Sunset Circuit',
    emoji: '🏁',
    color: '#22c55e',
    difficulty: 1,
    tier: 'Tutorial',
    theme: 'grassland',
    mesh: 'mario_kart',
    roadStyle: 'luigi_red',
    use3D: false,
    walls: false,
    kerbs: true,
    wallStyle: 'white_rail',
    customStartLine: true,
    hideWorldCheckpoints: true,
    spline: ovalSpline(44, 28, 0),
    laps: 2,
    trackWidth: 8,
    targetTime: 120,
    raceCameraPreset: { camBack: 8, camUp: 3.2, lookAhead: 6, lookHeight: 0.6 },
    raceCameraFov: 58,
    checkpointTs: [0.25, 0.5, 0.75],
    story: 'Italian villa estate — vibrant red asphalt winding past stone mansions, fountains, and cypress trees.',
  },
  {
    id: 'moo_moo_meadows',
    courseId: 'moo_moo_meadows',
    arenaType: 'moo_moo_meadows',
    label: 'Meadow Loop',
    emoji: '🐄',
    color: '#84cc16',
    difficulty: 1,
    tier: 'Tutorial',
    theme: 'farm',
    mesh: 'mario_kart',
    roadStyle: 'farm_gravel',
    use3D: false,
    walls: false,
    kerbs: false,
    fallOff: false,
    customStartLine: true,
    hideWorldCheckpoints: true,
    spline: meadowOvalSpline(40, 28, 0),
    laps: 1,
    trackWidth: 6,
    targetTime: 180,
    raceCameraPreset: { camBack: 8, camUp: 3.0, lookAhead: 6, lookHeight: 0.6 },
    checkpointTs: [0.2, 0.45, 0.7, 0.9],
    story: 'Pastoral meadow oval through green fields — gentle turns and grazing cows.',
  },
  {
    id: 'mario_circuit',
    courseId: 'mario_circuit',
    arenaType: 'mario_circuit',
    label: 'ByteBuddies Grand Prix',
    emoji: '🍄',
    color: '#ef4444',
    difficulty: 2,
    tier: 'Easy',
    theme: 'mario',
    mesh: 'mario_kart',
    roadStyle: 'stadium_blue',
    use3D: false,
    walls: false,
    kerbs: true,
    fallOff: false,
    customStartLine: true,
    hideWorldCheckpoints: true,
    spline: MARIO_CIRCUIT_SPLINE,
    laps: 2,
    trackWidth: 7,
    targetTime: 200,
    raceCameraFov: 60,
    raceCameraPreset: { camBack: 11, camUp: 4.2, lookAhead: 10, lookHeight: 1.0 },
    checkpointTs: [0.15, 0.35, 0.55, 0.75, 0.9],
    story: 'Mario Circuit — Professional Racing Stadium. Night floodlit circuit with glossy blue asphalt, grandstands, pit lane, and classic MK banners.',
  },
  {
    id: 'peach_castle',
    courseId: 'peach_castle',
    arenaType: 'peach_castle',
    label: 'Prism Palace Run',
    emoji: '👑',
    color: '#f472b6',
    difficulty: 2,
    tier: 'Easy',
    theme: 'peach',
    mesh: 'mario_kart',
    roadStyle: 'peach_pink',
    use3D: false,
    walls: false,
    spline: PEACH_CASTLE_SPLINE,
    laps: 2,
    trackWidth: 7,
    targetTime: 240,
    checkpointTs: [0.2, 0.5, 0.8],
    story: 'Elegant royal circuit around Peach\'s castle — smooth driving rewarded.',
  },
  {
    id: 'dry_dry_desert',
    courseId: 'dry_dry_desert',
    arenaType: 'dry_dry_desert',
    label: 'Dusty Dune Dash',
    emoji: '🏜️',
    color: '#eab308',
    difficulty: 3,
    tier: 'Medium',
    theme: 'desert',
    mesh: 'mario_kart',
    roadStyle: 'desert_sand',
    use3D: false,
    walls: true,
    spline: DESERT_SPLINE,
    laps: 2,
    trackWidth: 5,
    targetTime: 280,
    checkpointTs: [0.18, 0.4, 0.62, 0.85],
    story: 'Sandy dunes and canyon narrows — wind pushes your rover sideways.',
  },
  {
    id: 'mushroom_canyon',
    courseId: 'mushroom_canyon',
    arenaType: 'mushroom_canyon',
    label: 'Glowcap Canyon',
    emoji: '🍄',
    color: '#a855f7',
    difficulty: 3,
    tier: 'Medium',
    theme: 'canyon',
    mesh: 'mario_kart',
    roadStyle: 'canyon_gray',
    use3D: true,
    walls: true,
    spline: CANYON_SPLINE,
    laps: 2,
    trackWidth: 5.5,
    targetTime: 320,
    checkpointTs: [0.14, 0.32, 0.5, 0.68, 0.86],
    story: 'Technical canyon with elevation — brake for downhills, power up climbs.',
  },
  {
    id: 'bowser_castle',
    courseId: 'bowser_castle',
    arenaType: 'bowser_castle',
    label: 'Ember Fortress',
    emoji: '🏰',
    color: '#dc2626',
    difficulty: 4,
    tier: 'Hard',
    theme: 'castle',
    mesh: 'mario_kart',
    roadStyle: 'bowser_black',
    use3D: false,
    walls: true,
    spline: BOWSER_CASTLE_SPLINE,
    laps: 2,
    trackWidth: 5,
    targetTime: 360,
    checkpointTs: [0.2, 0.45, 0.7, 0.9],
    story: 'Dark fortress with lava moats and fire hazards — dodge or take damage.',
  },
  {
    id: 'bone_dry_desert',
    courseId: 'bone_dry_desert',
    arenaType: 'bone_dry_desert',
    label: 'Moonrock Mesa',
    emoji: '💀',
    color: '#d4d4d8',
    difficulty: 4,
    tier: 'Hard',
    theme: 'bone_desert',
    mesh: 'mario_kart',
    roadStyle: 'bone_sand',
    use3D: false,
    walls: true,
    spline: BONE_DESERT_SPLINE,
    laps: 2,
    trackWidth: 4.5,
    targetTime: 380,
    checkpointTs: [0.2, 0.5, 0.8],
    story: 'Bleached wasteland — quicksand slows you, sandstorms cut visibility.',
  },
  {
    id: 'piranha_plant_slide',
    courseId: 'piranha_plant_slide',
    arenaType: 'piranha_plant_slide',
    label: 'Vineway Slide',
    emoji: '🌿',
    color: '#16a34a',
    difficulty: 5,
    tier: 'Expert',
    theme: 'water_slide',
    mesh: 'mario_kart',
    roadStyle: 'water_slide',
    use3D: true,
    walls: true,
    spline: SLIDE_SPLINE,
    laps: 2,
    trackWidth: 4,
    targetTime: 200,
    checkpointTs: [0.2, 0.45, 0.7, 0.9],
    story: 'Slick water slide at extreme speed — brake hard and dodge Piranha Plants.',
  },
  {
    id: 'grumble_volcano',
    courseId: 'grumble_volcano',
    arenaType: 'grumble_volcano',
    label: 'Cinder Peak',
    emoji: '🌋',
    color: '#ff5500',
    difficulty: 5,
    tier: 'Expert',
    theme: 'volcano',
    mesh: 'mario_kart',
    roadStyle: 'volcano_glow',
    use3D: false,
    walls: true,
    spline: VOLCANO_SPLINE,
    laps: 2,
    trackWidth: 4.5,
    targetTime: 400,
    checkpointTs: [0.15, 0.35, 0.55, 0.75, 0.9],
    story: 'Active volcano — geysers, crumbling bridges, and shifting lava flows.',
  },
  {
    id: 'cheese_land',
    courseId: 'cheese_land',
    arenaType: 'cheese_land',
    label: 'Golden Cracker Coast',
    emoji: '🧀',
    color: '#fbbf24',
    difficulty: 6,
    tier: 'Master',
    theme: 'surreal',
    mesh: 'mario_kart',
    roadStyle: 'cheese_gold',
    use3D: true,
    walls: true,
    spline: CHEESE_SPLINE,
    laps: 2,
    trackWidth: 4,
    targetTime: 420,
    checkpointTs: [0.2, 0.45, 0.7, 0.9],
    story: 'Surreal cheese landscape — wavy track, bouncing surfaces, disorienting turns.',
  },
  {
    id: 'rainbow_road_master',
    courseId: 'rainbow_road_master',
    arenaType: 'rainbow_road_master',
    label: 'Prism Skyway',
    emoji: '🌈',
    color: '#cc44ff',
    difficulty: 6,
    tier: 'Master',
    theme: 'cosmic',
    mesh: 'pro_rainbow',
    use3D: true,
    spline: MARIO_CIRCUIT_RAINBOW,
    laps: 1,
    trackWidth: 7.5,
    targetTime: 540,
    checkpointTs: [0.1, 0.22, 0.34, 0.46, 0.58, 0.7, 0.82, 0.94],
    story: 'Ultimate Rainbow Road — 10km mega-lap combining every challenge in cosmic space.',
    isRainbow: true,
  },
];

/** Legacy + MK + biome arena types */
export const MK_ARENA_TYPES = new Set([
  ...MK_TRACKS.map((t) => t.arenaType),
  ...BIOME_ARENA_TYPES,
]);

export const MK_TRACK_BY_ARENA = Object.fromEntries([
  ...MK_TRACKS.map((t) => [t.arenaType, t]),
  ...BIOME_TRACKS.map((t) => [t.arenaType, t]),
  ...COSMIC_SKYWAY_BONUS_TRACKS.map((t) => [t.arenaType, t]),
]);
export const MK_TRACK_BY_COURSE = Object.fromEntries([
  ...MK_TRACKS.map((t) => [t.courseId, t]),
  ...BIOME_TRACKS.map((t) => [t.courseId, t]),
  ...COSMIC_SKYWAY_BONUS_TRACKS.map((t) => [t.courseId, t]),
]);

export function getMKTrack(arenaOrCourseId) {
  return MK_TRACK_BY_ARENA[arenaOrCourseId] || MK_TRACK_BY_COURSE[arenaOrCourseId] || null;
}

/** Build full zone config object for buildRacingCourse */
export function buildMKZoneConfig(track) {
  if (!track) return null;
  track = mergeTrackStandard(track);
  const isRainbow = track.isRainbow || track.arenaType === 'rainbow_road_master';
  const use3D = track.use3D ?? false;
  const cpCount = track.checkpointTs.length;
  const std = track.trackStandard;
  const pickups = (std?.itemBlocks || track.checkpointTs.filter((_, i) => i % 2 === 0).slice(0, 4))
    .map((t, i) => ({ t, type: i % 2 ? 'speed' : 'star' }));
  const isBiome = BIOME_ARENA_TYPES.has(track.arenaType);
  const trackSegments = std?.sections
    ? buildTrackSegmentsFromSections(std.sections)
    : (track.trackSegments || []);
  const raceControlMode = isBiome ? 'coded' : (track.raceControlMode ?? 'rail');

  return {
    id: track.id,
    name: track.label,
    subtitle: `${track.tier} · MK Circuit`,
    emoji: track.emoji,
    arenaType: track.arenaType,
    worldType: track.theme,
    difficulty: track.difficulty,
    story: track.story,
    racing: {
      trackType: 'circuit',
      laps: track.laps,
      trackWidth: track.trackWidth,
      targetTime: track.targetTime,
      checkpointCount: cpCount,
      checkpointTs: track.checkpointTs,
      boostTs: std?.boostTs || track.checkpointTs.map((t) => Math.max(0.03, t - 0.05)),
      pickups,
      finishT: 0,
      startLineT: 0,
      spawnT: isRainbow ? null : 0.02,
      spawnTOffset: isRainbow ? null : -0.015,
      fallOffEnabled: track.fallOff === false ? false : (isRainbow || use3D || track.difficulty >= 4),
      respawnEnabled: true,
      driftEnabled: track.difficulty >= 3,
      track3D: use3D,
      useLateralFall: isRainbow || use3D,
      raceCountdown: isRainbow ? 0.6 : (isBiome ? 0 : 1.5),
      splinePoints: track.spline,
      trackSegments,
      raceControlMode,
      difficulty: track.difficulty,
      displayName: std?.displayName ?? track.label,
      ...(isRainbow ? {
        startGrid: { x: 0, lineZ: 72, y: 48, angle: Math.PI },
        spawnPosition: { x: 0, z: 75, y: 48, angle: Math.PI, trackT: 0.991 },
      } : {}),
    },
    bloom: {
      strength: isRainbow ? 0.28 : isBiome ? 0.4 : track.difficulty >= 4 ? 0.22 : 0.14,
      radius: isRainbow ? 0.42 : isBiome ? 0.45 : 0.35,
      threshold: isRainbow ? 0.78 : isBiome ? 0.7 : 0.88,
    },
    hud: {
      theme: track.arenaType,
      accentColor: track.color,
      textColor: '#ffffff',
    },
    objectives: [
      {
        id: 'laps',
        icon: '🏁',
        label: `Complete ${track.laps} lap${track.laps > 1 ? 's' : ''}`,
        target: track.laps,
        get: (s) => (s.raceWon ? track.laps : Math.max(0, (s.raceLap || 1) - 1)),
      },
      {
        id: 'checkpoints',
        icon: '🎯',
        label: `Pass ${cpCount} checkpoint gates`,
        target: cpCount,
        get: (s) => Math.min(s.raceTotalCheckpoints ?? 0, cpCount),
      },
      {
        id: 'coins',
        icon: '🪙',
        label: 'Collect coins & stars',
        target: 20,
        get: (s) => s.collectedValue || s.collected || 0,
      },
    ],
    color: track.color,
    emoji: track.emoji,
    mkTrack: track,
  };
}

/** All wheeled/car chassis modes 1–10 = the ten AAA biome circuits (no legacy MK tracks). */
export const ROVER_MODE_TRACKS = BIOME_TRACKS;

/** Rover / Scout school modes 1–10 — aligned to Car Robot Racing Tracks mockup. */
export const CAR_MODE_ARENA_IDS = [
  'sunset_cove_01',
  'neon_metro_01',
  'dry_dry_desert',
  'fairy_glen_01',
  'frost_peak_01',
  'star_station_01',
  'lava_foundry_01',
  'jungle_ruins_01',
  '__rainbow__',
  'thunder_ridge_01',
];

export const CAR_MODE_TRACK_LABELS = {
  sunset_cove_01: 'Sunny Shores',
  neon_metro_01: 'City Circuit',
  dry_dry_desert: 'Desert Dunes',
  fairy_glen_01: 'Forest Trail',
  frost_peak_01: 'Ice Valley',
  star_station_01: 'Cosmic Skyway',
  lava_foundry_01: 'Volcano Run',
  jungle_ruins_01: 'Jungle Ruins',
  thunder_ridge_01: 'Final Challenge',
};

export function getMKTrackForCarMode(chassisId, modeIndex = 1) {
  const m = Math.max(1, Math.min(10, Number(modeIndex) || 1));
  const slot = CAR_MODE_ARENA_IDS[m - 1];
  if (slot === '__rainbow__') {
    return { ...CLASSIC_RAINBOW_TRACK, label: 'Prism Skyway', emoji: '🌈' };
  }
  const biome = BIOME_TRACKS.find((t) => t.arenaType === slot || t.id === slot);
  const legacy = getMKTrack(slot);
  const track = biome || legacy;
  if (!track) return BIOME_TRACKS[0];
  const label = CAR_MODE_TRACK_LABELS[slot] || track.label;
  return { ...track, label };
}

export function getCarModeArenaId(modeIndex = 1) {
  const m = Math.max(1, Math.min(10, Number(modeIndex) || 1));
  const slot = CAR_MODE_ARENA_IDS[m - 1];
  if (slot === '__rainbow__') return 'rainbow_road';
  return slot;
}

export { buildProfessionalCircuitWaypoints, CLASSIC_RAINBOW_TRACK, BIOME_TRACKS };
