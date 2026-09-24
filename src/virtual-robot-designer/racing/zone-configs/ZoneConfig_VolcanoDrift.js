/**
 * ZoneConfig_VolcanoDrift.js — Intermediate volcano circuit.
 */
import * as THREE from 'three';

export const VOLCANO_DRIFT_SPLINE = [
  { x: 0, z: 18 }, { x: 10, z: 14 }, { x: 16, z: 4 }, { x: 12, z: -6 },
  { x: 18, z: -14 }, { x: 6, z: -18 }, { x: -6, z: -14 }, { x: -16, z: -6 },
  { x: -14, z: 6 }, { x: -8, z: 14 }, { x: 0, z: 18 },
];

export const ZONE_VOLCANO_DRIFT = {
  id: 'volcano_drift',
  name: 'Volcano Drift',
  subtitle: 'Molten Circuit · Intermediate',
  emoji: '🌋',
  robotType: 'wheeled',
  difficulty: 3,
  arenaType: 'volcano_drift',
  worldType: 'volcano_drift',

  story: 'Race around an erupting volcano! Dodge lava pools, drift past obsidian spires, and blast through fire geysers. Two laps, six checkpoint gates, don\'t get caught in the magma!',

  racing: {
    trackType: 'circuit',
    laps: 2,
    trackWidth: 6.5,
    targetTime: 60,
    checkpointCount: 6,
    checkpointTs: [0.12, 0.28, 0.45, 0.6, 0.75, 0.9],
    boostTs: [0.05, 0.2, 0.38, 0.55, 0.7, 0.85],
    pickups: [
      { t: 0.08, type: 'star' },
      { t: 0.22, type: 'speed' },
      { t: 0.36, type: 'star' },
      { t: 0.5, type: 'shield' },
      { t: 0.65, type: 'star' },
      { t: 0.8, type: 'magnet' },
      { t: 0.93, type: 'star' },
    ],
    finishT: 0,
    splinePoints: VOLCANO_DRIFT_SPLINE,
    fallOffEnabled: false,
    respawnEnabled: true,
    driftEnabled: true,
    track3D: false,
    trackSegments: [
      { startT: 0, endT: 1, width: 6.5, hasBarriers: true, barrierType: 'guardrail', surface: 'asphalt', sectionName: 'Crater Circuit' },
    ],
    robotTypes: ['wheeled', 'tank', 'rover'],
  },

  medals: {
    bronze: { label: 'Finish the race', check: (s) => !!s.raceWon },
    silver: { label: 'Collect 8 stars', target: 8, check: (s) => (s.raceStarsCollected || 0) >= 8 },
    gold: { label: 'Finish in under 60s', target: 60, check: (s) => !!s.raceWon && (s.raceTotalTime || Infinity) < 60 },
  },

  objectives: [
    { id: 'finish',      icon: '🏁', label: 'Complete 2 laps',          target: 1,  get: (s) => s.raceWon ? 1 : 0 },
    { id: 'checkpoints', icon: '🎯', label: 'Pass 6 checkpoint gates',   target: 6,  get: (s) => Math.min(s.raceTotalCheckpoints ?? 0, 6) },
    { id: 'boosts',      icon: '⚡', label: 'Hit 5 boost pads',          target: 5,  get: (s) => Math.min(s.raceBoostPadsHit ?? 0, 5) },
    { id: 'stars',       icon: '⭐', label: 'Collect 5 stars',           target: 5,  get: (s) => Math.min(s.raceStarsCollected ?? 0, 5) },
  ],

  sky: { topColor: 0x1a0a08, bottomColor: 0xff6622 },
  terrain: { color: 0x4a2818 },
  bloom: { strength: 0.22, radius: 0.4, threshold: 0.85 },
  hud: { theme: 'volcano_drift', accentColor: '#ff5500', textColor: '#ffffff' },

  failTips: {
    fall: 'Stay on the crater road — the magma flats are too hot to drive through!',
    checkpoint: 'Pass every glowing gate in order each lap.',
  },
};

export function createVolcanoDriftCurve() {
  return new THREE.CatmullRomCurve3(
    VOLCANO_DRIFT_SPLINE.map((p) => new THREE.Vector3(p.x, 0, p.z)),
    true,
    'catmullrom',
    0.5,
  );
}
