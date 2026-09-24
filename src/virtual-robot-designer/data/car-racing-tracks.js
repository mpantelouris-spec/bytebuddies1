/**
 * car-racing-tracks.js — AAA biome kart tracks for wheeled/car chassis.
 * Modes 1–10 map exclusively to the ten ByteBuddies biome circuits.
 */
import {
  getMKTrackForCarMode,
  ROVER_MODE_TRACKS,
  BIOME_TRACKS,
  CAR_MODE_ARENA_IDS,
  CAR_MODE_TRACK_LABELS,
  getCarModeArenaId,
} from '../racing/mk-tracks/MKTrackRegistry.js';

/** Wheeled racers on biome kart tracks */
export const CAR_CHASSIS_IDS = new Set([
  'rover',
  'scout',
]);

/** Ten AAA biome circuits only — legacy Mario Kart tracks removed from car modes */
export const PRO_RACING_TRACKS = BIOME_TRACKS.map((t) => ({
  courseId: t.courseId,
  arenaType: t.arenaType,
  label: t.label,
  emoji: t.emoji,
  color: t.color,
  tier: t.tier,
  difficulty: t.difficulty,
}));

/** Legacy aliases still used by challenge browser */
export const LEGACY_RACING_TRACKS = [
  { courseId: 'street_grand_prix', arenaType: 'rainbow_road', label: 'Rainbow Road', emoji: '🌈', color: '#cc44ff' },
  { courseId: 'sunny_circuit', arenaType: 'sunny_circuit', label: 'Candy Kingdom', emoji: '🍭', color: '#fbbf24' },
  { courseId: 'dragon_skyway', arenaType: 'dragon_skyway', label: 'Dragon Skyway', emoji: '🐉', color: '#ff8866' },
  { courseId: 'volcano_drift', arenaType: 'volcano_drift', label: 'Volcano Drift', emoji: '🌋', color: '#ff4400' },
];

export function isCarChassis(chassisId) {
  return CAR_CHASSIS_IDS.has(chassisId);
}

const EXTRA_CAR_RACING_ARENAS = new Set([
  'rainbow_road',
  'rainbow_road_master',
  'dry_dry_desert',
  'bone_dry_desert',
]);

/** True when Live Lab should build MK / biome kart world (not KidClarity sandbox). */
export function isCarRacingArenaType(arenaType) {
  if (!arenaType) return false;
  return BIOME_TRACKS.some((t) => t.arenaType === arenaType || t.id === arenaType)
    || EXTRA_CAR_RACING_ARENAS.has(arenaType);
}

/** Pick MK track for a chassis mode (modeIndex 1–10) */
export function getCarRacingTrack(chassisId, modeIndex = 1) {
  if (isCarChassis(chassisId)) {
    return getMKTrackForCarMode(chassisId, modeIndex);
  }
  const idx = (modeIndex - 1) % PRO_RACING_TRACKS.length;
  return PRO_RACING_TRACKS[idx];
}

/** Attach racing arena metadata to a chassis mode object */
export function applyCarRacingArena(mode) {
  if (!mode?.chassisId || !isCarChassis(mode.chassisId)) return mode;
  const track = getCarRacingTrack(mode.chassisId, mode.modeIndex ?? 1);
  if (track.isClassicRainbow) {
    return {
      ...mode,
      arenaType: 'rainbow_road',
      linkedRaceCourse: 'street_grand_prix',
      genre: 'racing',
      cat: 'racing',
      name: 'Rainbow Road',
      shortName: 'Rainbow Road',
      desc: track.story || 'Classic cosmic glass ribbon — Neon Rainbow Road through space.',
      tagline: 'Rainbow Road — cosmic neon highway through space.',
      raceTrackLabel: 'Rainbow Road',
      color: track.color,
      icon: track.emoji,
      environmentId: 'rainbow_road',
      environmentName: 'Rainbow Road',
      environmentEmoji: '🌈',
      campusMode: {
        ...(mode.campusMode || {}),
        camera: 'race_chase',
        section: 'rainbow_road',
        props: [],
        objectives: [
          'Complete 3 laps',
          'Pass all checkpoint gates',
          'Stay on the rainbow ribbon',
        ],
      },
    };
  }
  return {
    ...mode,
    arenaType: track.arenaType,
    linkedRaceCourse: track.courseId,
    genre: 'racing',
    cat: 'racing',
    name: track.label,
    shortName: track.label,
    environmentName: track.label,
    desc: track.story || mode.desc,
    tagline: track.story || mode.tagline,
    raceTrackLabel: track.label,
    color: track.color,
    icon: track.emoji,
    studioGradient: `linear-gradient(135deg,${track.color || '#6366f1'},#0f172a)`,
    mkTier: track.tier,
    mkDifficulty: track.difficulty,
    physics: 'racing_spline',
    camera: 'race_chase',
    environmentId: track.arenaType,
    environmentName: track.label,
    environmentEmoji: track.emoji,
    gameObjectives: [
      `Complete ${track.laps ?? 2} lap(s)`,
      'Pass all checkpoints',
      `Finish under ${track.targetTime ?? 180}s`,
    ],
    winCondition: `Complete ${track.laps ?? 2} lap(s) around ${track.label}`,
    campusMode: {
      ...(mode.campusMode || {}),
      camera: 'race_chase',
      section: 'racing_circuit',
      props: [],
      name: track.label,
      shortName: track.label,
      objectives: [
        `Complete ${track.laps ?? 2} lap(s)`,
        'Pass all checkpoints',
        'Stay on the racing line',
      ],
    },
  };
}

export { ROVER_MODE_TRACKS, BIOME_TRACKS, CAR_MODE_TRACK_LABELS, getCarModeArenaId };

/** Mockup-aligned tiles — ByteBuddies Car Robot Racing Tracks (modes 1–10). */
const CAR_TILE_GRADIENTS = [
  'linear-gradient(135deg,#38bdf8,#fde68a)',
  'linear-gradient(135deg,#64748b,#38bdf8)',
  'linear-gradient(135deg,#fbbf24,#ea580c)',
  'linear-gradient(135deg,#22c55e,#15803d)',
  'linear-gradient(135deg,#bae6fd,#e0f2fe)',
  'linear-gradient(135deg,#1e293b,#6366f1)',
  'linear-gradient(135deg,#450a0a,#f97316)',
  'linear-gradient(135deg,#166534,#854d0e)',
  'linear-gradient(135deg,#ec4899,#8b5cf6,#06b6d4)',
  'linear-gradient(135deg,#312e81,#fbbf24)',
];

export const CAR_KID_TRACK_TILES = CAR_MODE_ARENA_IDS.map((slot, i) => {
  const mode = i + 1;
  const isRainbow = slot === '__rainbow__';
  const biome = isRainbow ? null : BIOME_TRACKS.find((t) => t.id === slot || t.arenaType === slot);
  const label = isRainbow ? 'Rainbow Road' : (CAR_MODE_TRACK_LABELS[slot] || biome?.label || `Track ${mode}`);
  return {
    mode,
    arenaId: isRainbow ? 'rainbow_road' : slot,
    label,
    emoji: isRainbow ? '🌈' : (biome?.emoji || '🏁'),
    color: biome?.color || (isRainbow ? '#cc44ff' : '#6366f1'),
    gradient: CAR_TILE_GRADIENTS[i] || CAR_TILE_GRADIENTS[0],
    story: biome?.story || (isRainbow ? '🌈 Cosmic glass ribbon in space.' : ''),
  };
});
export { MK_TRACKS } from '../racing/mk-tracks/MKTrackRegistry.js';
export { CLASSIC_RAINBOW_TRACK } from '../racing/mk-tracks/MKTrackVisualSpec.js';
