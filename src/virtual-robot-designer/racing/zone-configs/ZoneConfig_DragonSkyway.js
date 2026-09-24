/**
 * ZoneConfig_DragonSkyway.js — Floating fantasy kingdom race world.
 */
import * as THREE from 'three';

export const DRAGON_SKYWAY_SPLINE = [
  { x: 0, y: 2, z: 20 },
  { x: 0, y: 3, z: 8 },
  { x: 10, y: 4, z: 0 },
  { x: 18, y: 5, z: -8 },
  { x: 14, y: 3, z: -18 },
  { x: 0, y: 2, z: -22 },
  { x: -14, y: 4, z: -18 },
  { x: -18, y: 6, z: -6 },
  { x: -10, y: 5, z: 6 },
  { x: 0, y: 3, z: 14 },
  { x: 0, y: 2, z: 20 },
];

export const ZONE_DRAGON_SKYWAY = {
  id: 'dragon_skyway',
  name: 'Dragon Skyway',
  subtitle: 'Fantasy Kingdom · Intermediate',
  emoji: '🐉',
  robotType: 'wheeled',
  difficulty: 3,
  arenaType: 'dragon_skyway',
  worldType: 'fantasy_kingdom',

  story: 'Race through a floating fantasy kingdom! Soar past dragon nests, crystal trees, sky castles, and rainbow waterfalls in the clouds.',

  racing: {
    trackType: 'circuit',
    laps: 2,
    trackWidth: 6.0,
    targetTime: 75,
    checkpointCount: 6,
    checkpointTs: [0.14, 0.28, 0.42, 0.58, 0.74, 0.88],
    boostTs: [0.06, 0.22, 0.38, 0.54, 0.70, 0.84],
    pickups: [
      { t: 0.10, type: 'star' },
      { t: 0.25, type: 'speed' },
      { t: 0.45, type: 'star' },
      { t: 0.62, type: 'shield' },
      { t: 0.78, type: 'star' },
      { t: 0.92, type: 'magnet' },
    ],
    finishT: 0,
    splinePoints: DRAGON_SKYWAY_SPLINE,
    fallOffEnabled: true,
    respawnEnabled: true,
    driftEnabled: true,
    track3D: true,
    robotTypes: ['wheeled', 'tank', 'rover'],
  },

  bloom: { strength: 0.22, radius: 0.4, threshold: 0.88 },
  hud: { theme: 'dragon_skyway', accentColor: '#ff8866', textColor: '#ffffff' },

  objectives: [
    { id: 'finish',      icon: '🏁', label: 'Complete 2 laps',          target: 1,  get: (s) => s.raceWon ? 1 : 0 },
    { id: 'checkpoints', icon: '🎯', label: 'Pass 6 checkpoint gates',   target: 6,  get: (s) => Math.min(s.raceTotalCheckpoints ?? 0, 6) },
    { id: 'boosts',      icon: '⚡', label: 'Hit 5 boost pads',          target: 5,  get: (s) => Math.min(s.raceBoostPadsHit ?? 0, 5) },
    { id: 'stars',       icon: '⭐', label: 'Collect 3 stars',           target: 3,  get: (s) => Math.min(s.raceStarsCollected ?? 0, 3) },
  ],

  failTips: {
    fall: 'You fell off the skyway into the clouds below! Stay on the floating track.',
    checkpoint: 'Pass every gate in order — dragons are watching!',
  },
};

export function createDragonSkywayCurve() {
  return new THREE.CatmullRomCurve3(
    DRAGON_SKYWAY_SPLINE.map((p) => new THREE.Vector3(p.x, p.y ?? 0, p.z)),
    true,
    'catmullrom',
    0.5,
  );
}
