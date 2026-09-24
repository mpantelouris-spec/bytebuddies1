/**
 * CodeRacerTrackStandards.js — 10 Mario Kart–quality track bible (2026 lineup).
 */
export const GLOBAL_TRACK_STANDARD = {
  trackWidthM: 8,
  curbWidthM: 1,
  kartLengthM: 1.8,
  lapLengthM: { min: 400, max: 700 },
  checkpointHeightM: 2.5,
  camera: { camBack: 6.4, camUp: 2.9, lookAhead: 8, lookHeight: 0.7, tiltDeg: 9, fov: 50 },
};

const CP = (ts) => ts;
const BOOST = (ts) => ts;

export const TRACK_STANDARDS = {
  sunset_cove_01: {
    codename: 'sunset_cove_01',
    displayName: 'Sunset Cove Speedway',
    difficulty: 1, stars: '★☆☆☆☆', laps: 2,
    story: 'Coastal bay loop — pier launch, ocean curves, palm-lined return.',
    checkpointTs: CP([0.25, 0.5, 0.75]),
    checkpointColors: [0xff8c42, 0xff69b4, 0x87ceeb],
    boostTs: BOOST([0.12, 0.52, 0.78]),
    startLabel: 'SUNSET COVE', accentColor: 0xff8c42,
    heroT: 0.45,
    sections: ['Pier launch', 'Coastal curve', 'Ocean bend', 'Bay return'],
  },
  candy_carnival_01: {
    codename: 'candy_carnival_01',
    displayName: 'Candy Carnival Circuit',
    difficulty: 1, stars: '★☆☆☆☆', laps: 2,
    story: 'Ferris wheel midway — classic figure-8 loop crossing at the center.',
    checkpointTs: CP([0.22, 0.48, 0.72, 0.88]),
    checkpointColors: [0xff69b4, 0xffd700, 0xff69b4, 0xffd700],
    boostTs: BOOST([0.15, 0.42, 0.68, 0.85]),
    startLabel: 'CARNIVAL', accentColor: 0xff69b4,
    heroT: 0.35,
    sections: ['Top loop approach', 'Top loop right', 'Crossover center', 'Bottom loop finish'],
  },
  neon_metro_01: {
    codename: 'neon_metro_01',
    displayName: 'Neon Metro Rush',
    difficulty: 2, stars: '★★☆☆☆', laps: 3,
    story: 'Rainy metro tunnels, holographic departure arch.',
    checkpointTs: CP([0.18, 0.38, 0.58, 0.78]),
    checkpointColors: [0xff00ff, 0x00ffff, 0xff00ff, 0x00ffff],
    boostTs: BOOST([0.12, 0.42, 0.68, 0.85]),
    startLabel: 'METRO RUSH', accentColor: 0xff00ff,
    heroT: 0.38,
    sections: ['Tunnel run', 'Station corner', 'Departure arch', 'Street grate'],
  },
  cloud_citadel_01: {
    codename: 'cloud_citadel_01',
    displayName: 'Cloud Citadel Loop',
    difficulty: 2, stars: '★★☆☆☆', laps: 2,
    story: 'Floating castle, gold guardrails, castle gate arch.',
    checkpointTs: CP([0.2, 0.45, 0.7, 0.9]),
    checkpointColors: [0x87ceeb, 0xffd700, 0x87ceeb, 0xffd700],
    boostTs: BOOST([0.1, 0.48, 0.75]),
    startLabel: 'CLOUD CITADEL', accentColor: 0x87ceeb,
    heroT: 0.15,
    sections: ['Castle gate', 'Rope bridge', 'Cloud loop', 'Citadel finish'],
  },
  jungle_ruins_01: {
    codename: 'jungle_ruins_01',
    displayName: 'Jungle Ruins Rally',
    difficulty: 3, stars: '★★★☆☆', laps: 2,
    story: 'Temple pyramid, stone jaguar, glowing rune arch.',
    checkpointTs: CP([0.2, 0.45, 0.7, 0.9]),
    checkpointColors: [0x228b22, 0x7cfc00, 0x228b22, 0xffd700],
    boostTs: BOOST([0.18, 0.55, 0.8]),
    startLabel: 'JUNGLE RUINS', accentColor: 0x228b22,
    heroT: 0.35,
    sections: ['Temple gate', 'Pyramid hairpin', 'Rune arch', 'Jungle exit'],
  },
  frost_peak_01: {
    codename: 'frost_peak_01',
    displayName: 'Frost Peak Descent',
    difficulty: 3, stars: '★★★☆☆', laps: 2,
    story: 'Alpine descent, ice bridge over chasm, aurora sky.',
    checkpointTs: CP([0.15, 0.35, 0.55, 0.75, 0.9]),
    checkpointColors: [0x5dade2, 0xe8f4ff, 0x5dade2, 0xffffff, 0x5dade2],
    boostTs: BOOST([0.2, 0.48, 0.72]),
    startLabel: 'FROST PEAK', accentColor: 0x5dade2,
    heroT: 0.55,
    sections: ['Alpine start', 'Pine slalom', 'Ice bridge', 'Snow jump'],
  },
  lava_foundry_01: {
    codename: 'lava_foundry_01',
    displayName: 'Lava Foundry Forge',
    difficulty: 3, stars: '★★★☆☆', laps: 2,
    story: 'Molten rivers, interlocking gear arch, steam vents.',
    checkpointTs: CP([0.2, 0.45, 0.7, 0.9]),
    checkpointColors: [0xff4500, 0xffd700, 0xff4500, 0xff6b1a],
    boostTs: BOOST([0.15, 0.5, 0.78]),
    startLabel: 'FOUNDRY', accentColor: 0xff4500,
    heroT: 0.4,
    sections: ['Forge floor', 'Lava channel', 'Gear arch', 'Crane straight'],
  },
  star_station_01: {
    codename: 'star_station_01',
    displayName: 'Cosmic Skyway',
    difficulty: 4, stars: '★★★★☆', laps: 2,
    story: 'Twisting neon skyway that flies over itself, past a wormhole, asteroids and a blue planet.',
    checkpointTs: CP([0.2, 0.4, 0.6, 0.8]),
    checkpointColors: [0xaa44ff, 0x00ffff, 0xaa44ff, 0xffffff],
    boostTs: BOOST([0.15, 0.45, 0.7]),
    startLabel: 'STAR STATION', accentColor: 0xaa44ff,
    heroT: 0.3,
    sections: ['Dock ring', 'Glass deck', 'Airlock arch', 'Solar loop'],
  },
  fairy_glen_01: {
    codename: 'fairy_glen_01',
    displayName: 'Fairy Glen Gardens',
    difficulty: 4, stars: '★★★★☆', laps: 2,
    story: 'Enchanted garden spiral, toadstool arch, firefly swarm.',
    checkpointTs: CP([0.18, 0.4, 0.62, 0.85]),
    checkpointColors: [0x7cfc00, 0xffd700, 0xff69b4, 0x7cfc00],
    boostTs: BOOST([0.12, 0.48, 0.74]),
    startLabel: 'FAIRY GLEN', accentColor: 0x7cfc00,
    heroT: 0.5,
    sections: ['Garden gate', 'Flower tunnel', 'Toadstool arch', 'Fairy finish'],
  },
  thunder_ridge_01: {
    codename: 'thunder_ridge_01',
    displayName: 'Thunder Ridge Challenge',
    difficulty: 4, stars: '★★★★☆', laps: 3,
    story: 'Mountain ridge hairpins, windmill hero, storm lightning.',
    checkpointTs: CP([0.15, 0.32, 0.5, 0.68, 0.85]),
    checkpointColors: [0x4a5568, 0xffd700, 0x4a5568, 0x87ceeb, 0xffd700],
    boostTs: BOOST([0.12, 0.38, 0.62, 0.8]),
    startLabel: 'THUNDER RIDGE', accentColor: 0x4a5568,
    heroT: 0.65,
    sections: ['Ridge climb', 'Hairpin', 'Windmill turn', 'Storm tunnel'],
  },
};

/** Minimap + Track palette segments from named section list (equal spans along spline). */
export function buildTrackSegmentsFromSections(sections = []) {
  if (!sections.length) return [];
  const n = sections.length;
  return sections.map((sectionName, i) => ({
    startT: i / n,
    endT: (i + 1) / n,
    sectionName,
  }));
}

export const CUP_TRACK_IDS = new Set(Object.keys(TRACK_STANDARDS));

export function isCupTrack(arenaType) {
  return CUP_TRACK_IDS.has(arenaType);
}

export function getTrackStandard(arenaType) {
  return TRACK_STANDARDS[arenaType] || null;
}

export function mergeTrackStandard(track) {
  const std = getTrackStandard(track.arenaType || track.id);
  if (!std) return { ...track };
  return {
    ...track,
    trackStandard: std,
    laps: std.laps ?? track.laps,
    checkpointTs: std.checkpointTs ?? track.checkpointTs,
    story: std.story ?? track.story,
  };
}

const normT = (t) => ((t % 1) + 1) % 1;

/** Kart spawns at finishT + spawnT — keep this window clear ahead of the grid. */
export function isStartLaunchCorridor(t, finishT = 0, spawnT = 0.02, aheadT = 0.17) {
  const tt = normT(t);
  const a = normT(finishT + spawnT - 0.008);
  const b = normT(finishT + spawnT + aheadT);
  if (b >= a) return tt >= a && tt <= b;
  return tt >= a || tt <= b;
}

export function filterLaunchCorridorTs(ts, finishT = 0, spawnT = 0.02, aheadT = 0.17) {
  return (ts || []).filter((t) => !isStartLaunchCorridor(t, finishT, spawnT, aheadT));
}

/**
 * Off-road shoulder props are welcome at the start — only reject props that encroach on the drivable lane.
 * @param lateralDist anchor distance from track center (e.g. hw + off)
 * @param spanHalf how far the mesh extends toward centerline from the anchor
 */
export function blocksLaunchDriveLane(
  t, finishT, hw, lateralDist, spanHalf = 0, spawnT = 0.02, aheadT = 0.17,
) {
  if (!isStartLaunchCorridor(t, finishT, spawnT, aheadT)) return false;
  return lateralDist - spanHalf < hw + 1.2;
}
