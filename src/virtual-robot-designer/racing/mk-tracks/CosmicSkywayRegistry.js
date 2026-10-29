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
    '🌌 Nebula Ring — Pink and teal nebula stadium loop under a giant ringed planet.',
    { trackShape: 'stadium', targetTime: 168, startLabel: 'NEBULA RING', cardGradient: 'linear-gradient(135deg,#1a0a2e,#6b21a8,#22d3ee)' }),
  cosmicTrack('cosmic_wormhole_run_03', 'Wormhole Run', '🌀', '#9D4EDD', COSMIC_WORMHOLE_RUN_SPLINE,
    '🌀 Wormhole Run — Blue figure-8 through 14 neon ring gates between twin wormholes.',
    { trackShape: 'figure-8', targetTime: 172, startLabel: 'WORMHOLE', cardGradient: 'linear-gradient(135deg,#0f172a,#7c3aed,#f97316)' }),
  cosmicTrack('cosmic_asteroid_belt_04', 'Asteroid Belt', '☄️', '#C084FC', COSMIC_ASTEROID_BELT_SPLINE,
    '☄️ Asteroid Belt — Golden oval past a blazing sun, rocks floating beside the road.',
    { trackShape: 'oval', targetTime: 165, cardGradient: 'linear-gradient(135deg,#1e1b4b,#a855f7,#64748b)' }),
  cosmicTrack('cosmic_twin_loop_05', 'Twin Loop', '♾️', '#A78BFA', COSMIC_TWIN_LOOP_SPLINE,
    '♾️ Twin Loop — Green figure-8 overpass beneath twin planets and a jade wormhole.',
    { trackShape: 'figure-8', targetTime: 178, cardGradient: 'linear-gradient(135deg,#312e81,#8b5cf6,#06b6d4)' }),
  cosmicTrack('cosmic_supernova_06', 'Supernova Stadium', '💥', '#F472B6', COSMIC_SUPERNOVA_SPLINE,
    '💥 Supernova Stadium — Red-hot straights racing towards an exploding giant star.',
    { trackShape: 'stadium', targetTime: 170, startLabel: 'SUPERNOVA', cardGradient: 'linear-gradient(135deg,#431407,#ea580c,#f472b6)' }),
  cosmicTrack('cosmic_comet_arc_07', 'Comet Arc', '☄️', '#38BDF8', COSMIC_COMET_ARC_SPLINE,
    '☄️ Comet Arc — Icy egg-shaped loop chasing two comets past a frozen planet.',
    { trackShape: 'arc', targetTime: 162, cardGradient: 'linear-gradient(135deg,#0c4a6e,#2563eb,#c084fc)' }),
  cosmicTrack('cosmic_orbit_cross_08', 'Orbit Cross', '🛰️', '#818CF8', COSMIC_ORBIT_CROSS_SPLINE,
    '🛰️ Orbit Cross — Long figure-8 crossover beside a spinning space station.',
    { trackShape: 'figure-8', targetTime: 180, cardGradient: 'linear-gradient(135deg,#1e1b4b,#4f46e5,#22d3ee)' }),
  cosmicTrack('cosmic_pulsar_spiral_09', 'Pulsar Spiral', '✨', '#E879F9', COSMIC_PULSAR_SPIRAL_SPLINE,
    '✨ Pulsar Spiral — Magenta flower loop that climbs and dips under a spinning pulsar.',
    { trackShape: 'spiral', targetTime: 176, cardGradient: 'linear-gradient(135deg,#4a044e,#d946ef,#fbbf24)' }),
  cosmicTrack('cosmic_void_oval_10', 'Void Oval', '🕳️', '#7DD3FC', COSMIC_VOID_OVAL_SPLINE,
    '🕳️ Void Oval — Pitch-dark oval orbiting a black hole with a golden glowing disk.',
    { trackShape: 'oval', targetTime: 160, cardGradient: 'linear-gradient(135deg,#020617,#0369a1,#a78bfa)' }),
  cosmicTrack('cosmic_event_horizon_11', 'Event Horizon', '⚫', '#6366F1', COSMIC_EVENT_HORIZON_SPLINE,
    '⚫ Event Horizon — Hardest track: tight crimson figure-8 beside a giant black hole.',
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

/**
 * Per-track look: neon palette, sky, road tint, the three hero slots in the start view
 * (a = big focal left, b = far right, c = low right) and a trackside feature.
 */
const COSMIC_THEMES = {
  star_station_01: {
    left: 0x33e6ff, right: 0xff9a2e, lane: 0xff9a2e, frame: 0x1f232c, road: [30, 32, 42],
    sky: { top: '#03020a', mid: '#140c34', horizon: '#2e1a5e', fog: 0x120a2c },
    nebulaBg: ['#04030c', '#0b0822', '#05040f'],
    nebula: [[110, 50, 210], [60, 40, 190], [230, 110, 70]],
    heroes: {
      a: { type: 'wormhole', glow: [[230, 200, 255], [150, 70, 255], [80, 20, 180]], arms: [[200, 140, 255], [120, 80, 255]], rim: 0x9d6bff },
      b: { type: 'burst', core: [255, 230, 160], mid: [255, 140, 60], outer: [230, 70, 140] },
      c: { type: 'planet', sea: ['#1a4f9e', '#2a78d0', '#16448c'], land: [60, 120, 70], atmo: 0x66ccff, emissive: 0x0c2a66 },
    },
    feature: null,
    asteroid: 0x6e6258,
  },
  cosmic_nebula_ring_02: {
    left: 0xff4fd8, right: 0x2ef2d0, lane: 0xffffff, frame: 0x2a1f30, road: [34, 26, 40],
    sky: { top: '#0a0212', mid: '#2a0a3a', horizon: '#5a1a5e', fog: 0x2a0a30 },
    nebulaBg: ['#0a0212', '#1c0628', '#0a0210'],
    nebula: [[230, 60, 190], [60, 200, 190], [150, 50, 230]],
    heroes: {
      a: { type: 'ringedPlanet', y: 52, bands: ['#f7b2d9', '#d86bb0', '#fbe2f0', '#b04c90', '#f2a0c8'], ring: [[255, 200, 240], [120, 240, 220]], atmo: 0xff9ae0 },
      b: { type: 'burst', core: [220, 255, 250], mid: [80, 240, 210], outer: [230, 60, 200] },
      c: { type: 'planet', sea: ['#1a6e6a', '#2ab8a8', '#127068'], land: [40, 90, 120], atmo: 0x6affe8, emissive: 0x0a3a38 },
    },
    feature: { type: 'beacons', count: 16 },
    asteroid: 0x6a5870,
  },
  cosmic_wormhole_run_03: {
    left: 0x6a8bff, right: 0xc86bff, lane: 0xe0d0ff, frame: 0x1a1c30, road: [24, 26, 44],
    sky: { top: '#02030e', mid: '#0c1238', horizon: '#241a6e', fog: 0x0c1030 },
    nebulaBg: ['#02030e', '#080c26', '#030410'],
    nebula: [[60, 90, 240], [140, 60, 240], [40, 150, 240]],
    heroes: {
      a: { type: 'wormhole', scale: 1.6, glow: [[210, 225, 255], [90, 120, 255], [40, 30, 180]], arms: [[140, 170, 255], [190, 110, 255]], rim: 0x6a8bff },
      b: { type: 'wormhole', scale: 0.7, glow: [[255, 220, 255], [220, 90, 255], [120, 20, 160]], arms: [[240, 160, 255], [170, 90, 255]], rim: 0xc86bff },
      c: { type: 'planet', sea: ['#2a2a7e', '#4a4ac0', '#1e1e66'], land: [90, 70, 150], atmo: 0x9a9aff, emissive: 0x141448 },
    },
    feature: { type: 'ringGates', count: 14 },
    asteroid: 0x5a5a70,
  },
  cosmic_asteroid_belt_04: {
    left: 0xffc23a, right: 0xff6a2a, lane: 0xffe0a0, frame: 0x2e261c, road: [40, 34, 28],
    sky: { top: '#060302', mid: '#20120a', horizon: '#4a2a14', fog: 0x201008 },
    nebulaBg: ['#060302', '#140a06', '#070403'],
    nebula: [[230, 140, 60], [180, 90, 40], [120, 70, 160]],
    heroes: {
      a: { type: 'sun', core: 0xffd27a, glow: [[255, 240, 200], [255, 180, 80], [230, 90, 30]] },
      b: { type: 'burst', core: [255, 240, 200], mid: [255, 170, 70], outer: [200, 80, 40] },
      c: { type: 'planet', sea: ['#8a5a2a', '#b8783a', '#6e4420'], land: [90, 60, 40], atmo: 0xffb070, emissive: 0x3a1a08 },
    },
    feature: { type: 'trackRocks', count: 40 },
    asteroid: 0x8a6a4a,
    asteroidCount: 90,
  },
  cosmic_twin_loop_05: {
    left: 0x6aff6a, right: 0xb36bff, lane: 0xffffff, frame: 0x1e2a22, road: [26, 34, 32],
    sky: { top: '#020806', mid: '#0a2a22', horizon: '#1a4a3e', fog: 0x0a2420 },
    nebulaBg: ['#020806', '#061a14', '#020806'],
    nebula: [[60, 220, 120], [150, 70, 230], [40, 160, 200]],
    heroes: {
      a: { type: 'twinPlanets' },
      b: { type: 'burst', core: [230, 255, 230], mid: [120, 240, 140], outer: [150, 70, 230] },
      c: { type: 'wormhole', scale: 0.9, y: 28, glow: [[220, 255, 230], [80, 230, 130], [30, 120, 90]], arms: [[150, 255, 170], [180, 110, 255]], rim: 0x6aff6a },
    },
    feature: { type: 'ringGates', count: 6 },
    asteroid: 0x5a6a5e,
  },
  cosmic_supernova_06: {
    left: 0xff3a3a, right: 0xffd23a, lane: 0xffd23a, frame: 0x2e1a1a, road: [40, 24, 24],
    sky: { top: '#0a0202', mid: '#3a0a06', horizon: '#7a2210', fog: 0x300806 },
    nebulaBg: ['#0a0202', '#200604', '#0a0202'],
    nebula: [[240, 70, 40], [240, 160, 40], [180, 30, 90]],
    heroes: {
      a: { type: 'sun', core: 0xff5a2a, scale: 1.5, glow: [[255, 230, 180], [255, 110, 40], [200, 20, 40]] },
      b: { type: 'burst', scale: 1.6, core: [255, 255, 220], mid: [255, 150, 40], outer: [220, 30, 60] },
      c: { type: 'planet', sea: ['#5a1a10', '#8a2a1a', '#3a0e08'], land: [30, 20, 20], atmo: 0xff6a3a, emissive: 0x3a0a04 },
    },
    feature: { type: 'beacons', count: 18 },
    asteroid: 0x6a4a44,
  },
  cosmic_comet_arc_07: {
    left: 0x9ae8ff, right: 0xffffff, lane: 0x9ae8ff, frame: 0x1c2630, road: [28, 36, 46],
    sky: { top: '#02060c', mid: '#0a2238', horizon: '#2a5a7e', fog: 0x0a2034 },
    nebulaBg: ['#02060c', '#061626', '#02060c'],
    nebula: [[80, 170, 240], [180, 220, 255], [90, 90, 220]],
    heroes: {
      a: { type: 'comet', scale: 3, y: 55, color: [170, 230, 255] },
      b: { type: 'comet', scale: 2, y: 95, color: [210, 190, 255] },
      c: { type: 'planet', sea: ['#d8ecf8', '#a8cce6', '#e8f4fc'], land: [150, 180, 210], atmo: 0xcfefff, emissive: 0x284a66 },
    },
    feature: { type: 'trackRocks', count: 26, color: 0xb8d8ec },
    asteroid: 0x9ab4c8,
  },
  cosmic_orbit_cross_08: {
    left: 0x3aa8ff, right: 0xffc23a, lane: 0xffffff, frame: 0x2a2e38, road: [30, 32, 40],
    sky: { top: '#020410', mid: '#0a1430', horizon: '#1a2e5e', fog: 0x0a1228 },
    nebulaBg: ['#020410', '#060c22', '#020410'],
    nebula: [[60, 120, 230], [220, 170, 60], [90, 60, 200]],
    heroes: {
      a: { type: 'station', accent: 0x3aa8ff },
      b: { type: 'burst', core: [255, 250, 220], mid: [255, 200, 80], outer: [60, 120, 230] },
      c: { type: 'planet', sea: ['#1a4f9e', '#2a78d0', '#16448c'], land: [200, 170, 100], atmo: 0x8ac8ff, emissive: 0x0c2a66 },
    },
    feature: { type: 'beacons', count: 20 },
    asteroid: 0x6e6a60,
  },
  cosmic_pulsar_spiral_09: {
    left: 0xff3ad8, right: 0xfff23a, lane: 0xffffff, frame: 0x2a1a2e, road: [36, 26, 40],
    sky: { top: '#08020a', mid: '#2a0a2e', horizon: '#4a1a50', fog: 0x240828 },
    nebulaBg: ['#08020a', '#1a061c', '#08020a'],
    nebula: [[230, 60, 210], [240, 220, 60], [120, 40, 220]],
    heroes: {
      a: { type: 'pulsar', scale: 1.8, y: 78, color: [255, 180, 250] },
      b: { type: 'burst', core: [255, 255, 220], mid: [250, 220, 60], outer: [230, 50, 200] },
      c: { type: 'ringedPlanet', y: -30, bands: ['#f2e25a', '#c8a82a', '#fff4a8', '#a8861e', '#e8d060'], ring: [[255, 240, 160], [255, 120, 230]], atmo: 0xfff08a },
    },
    feature: { type: 'ringGates', count: 10 },
    asteroid: 0x6a5a6e,
  },
  cosmic_void_oval_10: {
    left: 0xffa23a, right: 0xfff0d0, lane: 0xffa23a, frame: 0x1a1a1e, road: [20, 20, 24],
    sky: { top: '#000000', mid: '#06040a', horizon: '#140c18', fog: 0x06040a },
    nebulaBg: ['#000000', '#040308', '#000000'],
    nebula: [[120, 70, 40], [60, 40, 90], [40, 30, 60]],
    heroes: {
      a: { type: 'blackhole', disk: [[255, 240, 200], [255, 160, 60], [180, 60, 20]], ring: 0xffc27a },
      b: { type: 'burst', scale: 0.6, core: [255, 240, 220], mid: [220, 140, 80], outer: [90, 50, 120] },
      c: null,
    },
    feature: { type: 'trackRocks', count: 22, color: 0x3a3438 },
    asteroid: 0x3e383a,
    asteroidCount: 30,
  },
  cosmic_event_horizon_11: {
    left: 0xff2a5a, right: 0xa06bff, lane: 0xff2a5a, frame: 0x241a24, road: [30, 20, 30],
    sky: { top: '#050008', mid: '#1e0414', horizon: '#3e0a2a', fog: 0x1a0412 },
    nebulaBg: ['#050008', '#120210', '#050008'],
    nebula: [[220, 30, 90], [140, 60, 240], [240, 90, 60]],
    heroes: {
      a: { type: 'blackhole', scale: 1.7, disk: [[255, 220, 240], [255, 60, 120], [120, 30, 200]], ring: 0xff6aa0 },
      b: { type: 'pulsar', scale: 1.2, y: 80, color: [220, 170, 255] },
      c: { type: 'planet', sea: ['#3a0a2a', '#6a1a4a', '#2a0620'], land: [90, 30, 70], atmo: 0xff5aa0, emissive: 0x2a0418 },
    },
    feature: { type: 'ringGates', count: 12 },
    asteroid: 0x4e3a44,
  },
};

export function getCosmicTheme(arenaType) {
  return COSMIC_THEMES[arenaType] || COSMIC_THEMES.star_station_01;
}

let _activeCosmicArena = 'star_station_01';
/** Road albedo builders read this; set before the road mesh is built. */
export function setActiveCosmicArena(arenaType) {
  if (isCosmicSkywayArena(arenaType)) _activeCosmicArena = arenaType;
}
export function getActiveCosmicTheme() {
  return getCosmicTheme(_activeCosmicArena);
}

export function cosmicHex(c) {
  return `#${c.toString(16).padStart(6, '0')}`;
}

/** Per-track vista layout (same art kit, different hero framing). */
export function getCosmicSkywayVariant(arenaType) {
  const all = ['star_station_01', ...COSMIC_SKYWAY_BONUS_TRACKS.map((t) => t.arenaType)];
  const idx = Math.max(0, all.indexOf(arenaType));
  const a = (idx / all.length) * Math.PI * 2;
  const b = idx * 0.61;
  return {
    wormhole: { x: 10 + Math.abs(Math.sin(a)) * 24, y: 42 + (idx % 4) * 3, z: -150 + Math.sin(a * 2) * 20 },
    burst: { x: 115 + Math.sin(b) * 40, y: 62 - (idx % 3) * 4, z: -250 + Math.sin(b * 1.7) * 30 },
    planet: { x: 150 + Math.sin(a) * 30, y: -95 + (idx % 2) * 12, z: -170 + Math.sin(a * 1.5) * 25 },
    loopA: { x: 95, y: 28, z: -70, ry: Math.PI / 2.4 + idx * 0.08 },
    loopB: { x: -100, y: 24, z: 40, ry: -Math.PI / 3 - idx * 0.06 },
    asteroidSeed: 90 + idx * 17,
  };
}
