/**
 * BiomeTrackRegistry.js — 10 Mario Kart–quality CodeRacer 3D worlds (2026 lineup).
 */
import {
  SUNSET_COVE_SPLINE,
  CANDY_CARNIVAL_SPLINE,
  NEON_METRO_SPLINE,
  CLOUD_CITADEL_SPLINE,
  JUNGLE_RUINS_SPLINE,
  FROST_PEAK_SPLINE,
  LAVA_FOUNDRY_SPLINE,
  STAR_STATION_SPLINE,
  FAIRY_GLEN_SPLINE,
  THUNDER_RIDGE_SPLINE,
} from './CodeRacerSplines.js';
import { BIOME_CAMERA_STANDARD } from './BiomeAAAVisualSpec.js';
import { COSMIC_SKYWAY_BONUS_TRACKS, COSMIC_SKYWAY_ARENA_IDS, isCosmicSkywayArena } from './CosmicSkywayRegistry.js';

export { isCosmicSkywayArena, COSMIC_SKYWAY_BONUS_TRACKS, COSMIC_SKYWAY_ARENA_IDS };

const CAM = BIOME_CAMERA_STANDARD;

function track(id, label, emoji, color, difficulty, tier, theme, roadStyle, spline, opts = {}) {
  return {
    id,
    courseId: id,
    arenaType: id,
    label,
    emoji,
    color,
    difficulty,
    tier,
    trackShape: opts.trackShape || 'circuit',
    theme,
    mesh: 'mario_kart',
    roadStyle,
    use3D: true,
    walls: false,
    kerbs: true,
    banking: false,
    hideWorldCheckpoints: true,
    customStartLine: true,
    spline,
    laps: opts.laps ?? 2,
    trackWidth: opts.trackWidth ?? 8.0,
    targetTime: opts.targetTime ?? 140,
    raceCameraPreset: CAM,
    raceCameraFov: 58,
    checkpointTs: opts.checkpointTs ?? [0.25, 0.5, 0.75],
    story: opts.story ?? '',
    biome: opts.biome ?? theme,
    isCosmicBiome: opts.isCosmicBiome ?? false,
    guardrails: opts.guardrails ?? false,
    underground: opts.underground ?? false,
  };
}

export const BIOME_TRACKS = [
  track('sunset_cove_01', 'Sunset Cove Speedway', '🏖️', '#FF8C42', 1, 'Beginner', 'sunset_cove', 'sunset_coral', SUNSET_COVE_SPLINE, {
    laps: 2, targetTime: 120, checkpointTs: [0.25, 0.5, 0.75],
    trackShape: 'coastal',
    story: '🏖️ Sunset Cove — breezy coastal loop along the pier and palm-lined bay.',
    biome: 'sunset_cove',
  }),
  track('candy_carnival_01', 'Candy Carnival Circuit', '🎡', '#FF69B4', 1, 'Beginner', 'candy_carnival', 'candy_pink', CANDY_CARNIVAL_SPLINE, {
    laps: 2, targetTime: 125, checkpointTs: [0.22, 0.48, 0.72, 0.88],
    trackShape: 'figure-8',
    story: '🎡 Candy Carnival — Figure-8 midway circuit through the ferris wheel and candy tents.',
    biome: 'candy_carnival',
  }),
  track('neon_metro_01', 'Neon Metro Rush', '🚇', '#FF00FF', 2, 'Easy', 'neon_metro', 'cyber_navy', NEON_METRO_SPLINE, {
    laps: 3, targetTime: 170, checkpointTs: [0.18, 0.38, 0.58, 0.78],
    story: '🚇 Neon Metro — Rainy tunnels, holographic departure arch, passing trains.',
    biome: 'neon_metro', underground: true,
  }),
  track('cloud_citadel_01', 'Cloud Citadel Loop', '🏰', '#87CEEB', 2, 'Easy', 'cloud_citadel', 'sky_jade', CLOUD_CITADEL_SPLINE, {
    laps: 2, targetTime: 130, checkpointTs: [0.2, 0.45, 0.7, 0.9],
    story: '☁️ Cloud Citadel — Floating castle, gold guardrails, rope bridge, cloud sea.',
    biome: 'cloud_citadel', guardrails: true, trackShape: 'floating-islands',
  }),
  track('jungle_ruins_01', 'Jungle Ruins Rally', '🗿', '#228B22', 3, 'Intermediate', 'jungle_ruins', 'ruins_moss', JUNGLE_RUINS_SPLINE, {
    laps: 2, targetTime: 150, checkpointTs: [0.2, 0.45, 0.7, 0.9],
    story: '🗿 Jungle Ruins — Temple pyramid, stone jaguar, glowing rune arch.',
    biome: 'jungle_ruins',
  }),
  track('frost_peak_01', 'Frost Peak Descent', '🏔️', '#5DADE2', 3, 'Intermediate', 'frost_peak', 'frost_ice', FROST_PEAK_SPLINE, {
    laps: 2, targetTime: 175, checkpointTs: [0.15, 0.35, 0.55, 0.75, 0.9],
    story: '❄️ Frost Peak — Alpine descent, ice bridge, ski lift, aurora sky.',
    biome: 'frost_peak', guardrails: true,
  }),
  track('lava_foundry_01', 'Lava Foundry Forge', '🔥', '#FF4500', 3, 'Intermediate', 'lava_foundry', 'volcano_charcoal', LAVA_FOUNDRY_SPLINE, {
    laps: 2, targetTime: 160, checkpointTs: [0.2, 0.45, 0.7, 0.9], trackWidth: 7.0,
    story: '🔥 Lava Foundry — Molten rivers, gear arch, steam vents, crane hooks.',
    biome: 'lava_foundry', underground: true,
  }),
  track('star_station_01', 'Cosmic Skyway', '🛸', '#AA44FF', 4, 'Hard', 'star_station', 'cosmic_metal', STAR_STATION_SPLINE, {
    laps: 2, targetTime: 185, checkpointTs: [0.2, 0.4, 0.6, 0.8],
    trackShape: 'figure-8',
    story: '🛸 Cosmic Skyway — Twisting neon highway that flies over itself, past a purple wormhole, asteroid belt and a blue planet below.',
    biome: 'star_station', isCosmicBiome: true, underground: true,
  }),
  track('fairy_glen_01', 'Fairy Glen Gardens', '🧚', '#7CFC00', 4, 'Hard', 'fairy_glen', 'garden_green', FAIRY_GLEN_SPLINE, {
    laps: 2, targetTime: 190, checkpointTs: [0.18, 0.4, 0.62, 0.85],
    story: '🧚 Fairy Glen — Giant daisies, toadstool arch, fairy cottage, fireflies. Garden loop.',
    biome: 'fairy_glen',
  }),
  track('thunder_ridge_01', 'Thunder Ridge Challenge', '⛈️', '#4A5568', 4, 'Hard', 'thunder_ridge', 'metro_black', THUNDER_RIDGE_SPLINE, {
    laps: 3, targetTime: 200, checkpointTs: [0.15, 0.32, 0.5, 0.68, 0.85],
    story: '⛈️ Thunder Ridge — Windmill hairpin, storm clouds, lightning flashes.',
    biome: 'thunder_ridge', guardrails: true,
  }),
];

export function getBiomeTrack(arenaType) {
  return BIOME_TRACKS.find((t) => t.arenaType === arenaType || t.id === arenaType)
    || COSMIC_SKYWAY_BONUS_TRACKS.find((t) => t.arenaType === arenaType || t.id === arenaType)
    || null;
}

export function getBiomeTrackByMode(modeIndex) {
  const idx = (modeIndex - 1) % BIOME_TRACKS.length;
  return BIOME_TRACKS[idx];
}

export const BIOME_ARENA_TYPES = new Set([
  ...BIOME_TRACKS.map((t) => t.arenaType),
  ...COSMIC_SKYWAY_ARENA_IDS,
]);
