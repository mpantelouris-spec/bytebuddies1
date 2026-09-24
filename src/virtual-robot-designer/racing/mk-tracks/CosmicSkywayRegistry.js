/**
 * CosmicSkywayRegistry.js — Bonus space highways sharing CosmicSkywayKit visuals.
 * Original star_station_01 plus ten distinct circuit layouts.
 */
import {
  STAR_STATION_SPLINE,
  COSMIC_NEBULA_RING_SPLINE,
  COSMIC_WORMHOLE_RUN_SPLINE,
  COSMIC_ASTEROID_BELT_SPLINE,
  COSMIC_TWIN_LOOP_SPLINE,
  COSMIC_SUPERNOVA_SPLINE,
  COSMIC_COMET_ARC_SPLINE,
  COSMIC_ORBIT_CROSS_SPLINE,
  COSMIC_PULSAR_SPIRAL_SPLINE,
  COSMIC_VOID_OVAL_SPLINE,
  COSMIC_EVENT_HORIZON_SPLINE,
} from './CodeRacerSplines.js';

const CAM = { camBack: 6.4, camUp: 2.9, lookAhead: 8, lookHeight: 0.7, tiltDeg: 9, fov: 50 };

function cosmicTrack(id, label, emoji, color, spline, story, opts = {}) {
  return {
    id,
    courseId: id,
    arenaType: id,
    label,
    emoji,
    color,
    difficulty: 4,
    tier: 'Hard',
    trackShape: opts.trackShape || 'circuit',
    theme: 'star_station',
    mesh: 'mario_kart',
    roadStyle: 'cosmic_metal',
    use3D: true,
    walls: false,
    kerbs: true,
    banking: false,
    hideWorldCheckpoints: true,
    customStartLine: true,
    spline,
    laps: opts.laps ?? 2,
    trackWidth: opts.trackWidth ?? 8.0,
    targetTime: opts.targetTime ?? 175 + (opts.timeBias ?? 0),
    raceCameraPreset: CAM,
    raceCameraFov: 58,
    checkpointTs: opts.checkpointTs ?? [0.2, 0.4, 0.6, 0.8],
    story,
    biome: 'star_station',
    isCosmicBiome: true,
    guardrails: false,
    underground: true,
    startLabel: opts.startLabel ?? label.split(' ').slice(0, 2).join(' ').toUpperCase(),
    cardGradient: opts.cardGradient,
  };
}

/** All arena ids that use cosmic metal road + CosmicSkywayKit scenery. */
export const COSMIC_SKYWAY_ARENA_IDS = new Set([
  'star_station_01',
  'cosmic_nebula_ring_02',
  'cosmic_wormhole_run_03',
  'cosmic_asteroid_belt_04',
  'cosmic_twin_loop_05',
  'cosmic_supernova_06',
  'cosmic_comet_arc_07',
  'cosmic_orbit_cross_08',
  'cosmic_pulsar_spiral_09',
  'cosmic_void_oval_10',
  'cosmic_event_horizon_11',
]);

export function isCosmicSkywayArena(arenaType) {
  return COSMIC_SKYWAY_ARENA_IDS.has(arenaType);
}

/** Ten new bonus circuits (star_station_01 stays in BiomeTrackRegistry). */
export const COSMIC_SKYWAY_BONUS_TRACKS = [
  cosmicTrack('cosmic_nebula_ring_02', 'Nebula Ring', '🌌', '#B366FF', COSMIC_NEBULA_RING_SPLINE,
    '🌌 Nebula Ring — Stadium loop through a violet gas cloud with the wormhole on the straight.',
    { trackShape: 'stadium', targetTime: 168, startLabel: 'NEBULA RING', cardGradient: 'linear-gradient(135deg,#1a0a2e,#6b21a8,#22d3ee)' }),
  cosmicTrack('cosmic_wormhole_run_03', 'Wormhole Run', '🌀', '#9D4EDD', COSMIC_WORMHOLE_RUN_SPLINE,
    '🌀 Wormhole Run — Tight figure-8 dive straight into the swirling gate.',
    { trackShape: 'figure-8', targetTime: 172, startLabel: 'WORMHOLE', cardGradient: 'linear-gradient(135deg,#0f172a,#7c3aed,#f97316)' }),
  cosmicTrack('cosmic_asteroid_belt_04', 'Asteroid Belt', '☄️', '#C084FC', COSMIC_ASTEROID_BELT_SPLINE,
    '☄️ Asteroid Belt — Wide orbital oval weaving through floating rocks.',
    { trackShape: 'oval', targetTime: 165, cardGradient: 'linear-gradient(135deg,#1e1b4b,#a855f7,#64748b)' }),
  cosmicTrack('cosmic_twin_loop_05', 'Twin Loop', '♾️', '#A78BFA', COSMIC_TWIN_LOOP_SPLINE,
    '♾️ Twin Loop — Double-height figure-8 with neon rings on both lobes.',
    { trackShape: 'figure-8', targetTime: 178, cardGradient: 'linear-gradient(135deg,#312e81,#8b5cf6,#06b6d4)' }),
  cosmicTrack('cosmic_supernova_06', 'Supernova Stadium', '💥', '#F472B6', COSMIC_SUPERNOVA_SPLINE,
    '💥 Supernova Stadium — Long straights past a blazing galaxy burst.',
    { trackShape: 'stadium', targetTime: 170, startLabel: 'SUPERNOVA', cardGradient: 'linear-gradient(135deg,#431407,#ea580c,#f472b6)' }),
  cosmicTrack('cosmic_comet_arc_07', 'Comet Arc', '☄️', '#38BDF8', COSMIC_COMET_ARC_SPLINE,
    '☄️ Comet Arc — Sweeping C-shaped skyway with a blue planet in the turn.',
    { trackShape: 'arc', targetTime: 162, cardGradient: 'linear-gradient(135deg,#0c4a6e,#2563eb,#c084fc)' }),
  cosmicTrack('cosmic_orbit_cross_08', 'Orbit Cross', '🛰️', '#818CF8', COSMIC_ORBIT_CROSS_SPLINE,
    '🛰️ Orbit Cross — High crossover where the deck passes over itself.',
    { trackShape: 'figure-8', targetTime: 180, cardGradient: 'linear-gradient(135deg,#1e1b4b,#4f46e5,#22d3ee)' }),
  cosmicTrack('cosmic_pulsar_spiral_09', 'Pulsar Spiral', '✨', '#E879F9', COSMIC_PULSAR_SPIRAL_SPLINE,
    '✨ Pulsar Spiral — Corkscrew elevation changes around a pulsing star.',
    { trackShape: 'spiral', targetTime: 176, cardGradient: 'linear-gradient(135deg,#4a044e,#d946ef,#fbbf24)' }),
  cosmicTrack('cosmic_void_oval_10', 'Void Oval', '🕳️', '#7DD3FC', COSMIC_VOID_OVAL_SPLINE,
    '🕳️ Void Oval — Smooth space oval with distant neon highways.',
    { trackShape: 'oval', targetTime: 160, cardGradient: 'linear-gradient(135deg,#020617,#0369a1,#a78bfa)' }),
  cosmicTrack('cosmic_event_horizon_11', 'Event Horizon', '⚫', '#6366F1', COSMIC_EVENT_HORIZON_SPLINE,
    '⚫ Event Horizon — Hardest layout: tight lemniscate skimming the wormhole rim.',
    { trackShape: 'figure-8', targetTime: 190, laps: 3, checkpointTs: [0.15, 0.35, 0.55, 0.75, 0.9],
      startLabel: 'EVENT HORIZON', cardGradient: 'linear-gradient(135deg,#000000,#312e81,#7c3aed)' }),
];

/** UI list including the original Cosmic Skyway. */
export const COSMIC_SKYWAY_UI_TRACKS = [
  {
    arenaType: 'star_station_01',
    label: 'Cosmic Skyway',
    emoji: '🛸',
    color: '#AA44FF',
    story: 'Twisting neon highway · wormhole, asteroids, blue planet',
    cardGradient: 'linear-gradient(135deg,#1e1b4b,#7a2cff,#06b6d4)',
  },
  ...COSMIC_SKYWAY_BONUS_TRACKS.map((t) => ({
    arenaType: t.arenaType,
    label: t.label,
    emoji: t.emoji,
    color: t.color,
    story: t.story.replace(/^[^\s]+\s/, '').split(' — ').pop() || t.story,
    cardGradient: t.cardGradient,
  })),
];

const CP = (ts) => ts;
const BOOST = (ts) => ts;

function stdFor(track) {
  return {
    codename: track.arenaType,
    displayName: track.label,
    difficulty: 4,
    stars: '★★★★☆',
    laps: track.laps,
    story: track.story.replace(/^[^\s]+\s[^—]+—\s*/, ''),
    checkpointTs: CP(track.checkpointTs),
    checkpointColors: [0xaa44ff, 0x00ffff, 0xaa44ff, 0xffffff],
    boostTs: BOOST([0.15, 0.45, 0.7]),
    startLabel: track.startLabel || 'COSMIC',
    accentColor: parseInt(track.color.replace('#', ''), 16) || 0xaa44ff,
    heroT: 0.3,
    sections: ['Launch', 'Nebula straight', 'Wormhole view', 'Finish loop'],
  };
}

export const COSMIC_TRACK_STANDARDS = Object.fromEntries(
  COSMIC_SKYWAY_BONUS_TRACKS.map((t) => [t.arenaType, stdFor(t)]),
);

/** Per-track vista layout (same art kit, different hero framing). */
export function getCosmicSkywayVariant(arenaType) {
  const all = ['star_station_01', ...COSMIC_SKYWAY_BONUS_TRACKS.map((t) => t.arenaType)];
  const idx = Math.max(0, all.indexOf(arenaType));
  const a = (idx / all.length) * Math.PI * 2;
  const b = idx * 0.61;
  return {
    wormhole: { x: 10 + Math.sin(a) * 30, y: 42 + (idx % 4) * 3, z: -150 + Math.sin(a * 2) * 20 },
    burst: { x: 115 + Math.sin(b) * 40, y: 62 - (idx % 3) * 4, z: -250 + Math.sin(b * 1.7) * 30 },
    planet: { x: 150 + Math.sin(a) * 30, y: -95 + (idx % 2) * 12, z: -170 + Math.sin(a * 1.5) * 25 },
    loopA: { x: 95, y: 28, z: -70, ry: Math.PI / 2.4 + idx * 0.08 },
    loopB: { x: -100, y: 24, z: 40, ry: -Math.PI / 3 - idx * 0.06 },
    asteroidSeed: 90 + idx * 17,
  };
}
