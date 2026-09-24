/**
 * ZoneConfig_RainbowRoad.js — Cosmic Rainbow Highway (Expert flagship).
 */
export const ZONE_RAINBOW_ROAD = {
  id: 'rainbow_road',
  name: 'Rainbow Road',
  subtitle: 'Cosmic Highway · Expert',
  emoji: '🌈',
  robotType: 'wheeled',
  difficulty: 5,
  arenaType: 'rainbow_road',
  worldType: 'cosmic_highway',

  story: 'Race through a magical floating cosmic highway between planets, nebulae, and crystal canyons. Seven spectacular zones. Three laps. Don\'t fall into the void!',

  racing: {
    trackType: 'circuit',
    laps: 3,
    trackWidth: 7.5,
    targetTime: 90,
    checkpointCount: 8,
    checkpointTs: [0.10, 0.22, 0.34, 0.46, 0.58, 0.70, 0.82, 0.94],
    boostTs: [0.04, 0.16, 0.28, 0.40, 0.52, 0.64, 0.76, 0.88],
    pickups: [
      { t: 0.07, type: 'star' },
      { t: 0.19, type: 'speed' },
      { t: 0.31, type: 'star' },
      { t: 0.43, type: 'shield' },
      { t: 0.55, type: 'star' },
      { t: 0.67, type: 'magnet' },
      { t: 0.79, type: 'star' },
      { t: 0.91, type: 'star' },
    ],
    finishT: 0,
    startLineT: 0,
    startGrid: { x: 0, lineZ: 72, y: 48, angle: Math.PI },
    spawnPosition: { x: 0, z: 75, y: 48, angle: Math.PI, trackT: 0.991 },
    raceCountdown: 0.6,
    flatStraightTrack: { launch: true },
    useLateralFall: true,
    fallOffEnabled: true,
    respawnEnabled: true,
    driftEnabled: true,
    track3D: true,
    trackSegments: [
      { startT: 0, endT: 0.18, sectionName: 'Star Launch' },
      { startT: 0.18, endT: 0.42, sectionName: 'Nebula Sweep' },
      { startT: 0.42, endT: 0.68, sectionName: 'Crystal Bend' },
      { startT: 0.68, endT: 1.0, sectionName: 'Galaxy Return' },
    ],
    robotTypes: ['wheeled', 'tank', 'rover'],
  },

  bloom: { strength: 0.28, radius: 0.42, threshold: 0.78 },
  hud: { theme: 'rainbow_road', accentColor: '#ff44aa', textColor: '#ffffff' },

  medals: {
    bronze: { label: 'Finish the race', check: (s) => !!s.raceWon },
    silver: { label: 'Collect 10 stars', target: 10, check: (s) => (s.raceStarsCollected || 0) >= 10 },
    gold: { label: 'Finish in under 90s', target: 90, check: (s) => !!s.raceWon && (s.raceTotalTime || Infinity) < 90 },
  },

  objectives: [
    { id: 'finish', icon: '🏁', label: 'Complete all 3 laps', target: 1, get: (s) => s.raceWon ? 1 : 0 },
    { id: 'checkpoints', icon: '🎯', label: 'Pass 8 checkpoint gates', target: 8, get: (s) => Math.min(s.raceTotalCheckpoints ?? 0, 8) },
    { id: 'boosts', icon: '⚡', label: 'Hit 6 boost pads', target: 6, get: (s) => Math.min(s.raceBoostPadsHit ?? 0, 6) },
    { id: 'stars', icon: '⭐', label: 'Collect 5 stars', target: 5, get: (s) => Math.min(s.raceStarsCollected ?? 0, 5) },
  ],

  failTips: {
    fall: 'You fell into the cosmic void! Slow down before corners.',
    checkpoint: 'Pass every glowing gate in order each lap.',
  },
};
