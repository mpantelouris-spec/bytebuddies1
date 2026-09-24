/**
 * ZoneConfig_SunnyCircuit.js — WB-1 Beginner track (RC8).
 */
import * as THREE from 'three';

export const SUNNY_CIRCUIT_SPLINE = [
  { x: 0, z: 16 }, { x: 0, z: 6 }, { x: 8, z: 0 }, { x: 8, z: -10 },
  { x: 0, z: -16 }, { x: -8, z: -10 }, { x: -8, z: 0 }, { x: 0, z: 16 },
];

export const ZONE_SUNNY_CIRCUIT = {
  id: 'sunny_circuit',
  name: 'Candy Kingdom Grand Prix',
  subtitle: 'Playful Adventure · Beginner',
  emoji: '🍭',
  robotType: 'wheeled',
  difficulty: 1,
  arenaType: 'sunny_circuit',
  worldType: 'candy_kingdom',

  story: 'Welcome to Candy Kingdom! Race through cookie villages, chocolate rivers, donut tunnels, and marshmallow hills. Collect coins and stars along the way!',

  racing: {
    trackType: 'circuit',
    laps: 1,
    trackWidth: 7.0,
    targetTime: 45,
    checkpointCount: 4,
    checkpointTs: [0.2, 0.45, 0.7, 0.9],
    boostTs: [0.08, 0.35, 0.62, 0.85],
    pickups: [
      { t: 0.12, type: 'star' },
      { t: 0.28, type: 'speed' },
      { t: 0.52, type: 'star' },
      { t: 0.68, type: 'shield' },
      { t: 0.88, type: 'star' },
    ],
    finishT: 0,
    splinePoints: SUNNY_CIRCUIT_SPLINE,
    fallOffEnabled: false,
    respawnEnabled: true,
    driftEnabled: false,
    trackSegments: [
      { startT: 0, endT: 1, width: 7, hasBarriers: true, barrierType: 'guardrail', surface: 'asphalt', sectionName: 'Sunny Oval' },
    ],
    robotTypes: ['wheeled', 'tank', 'rover'],
  },

  sky: { topColor: 0x87ceeb, bottomColor: 0xe0f4ff },
  terrain: { color: 0x4aad42 },
  bloom: { strength: 0.12, radius: 0.3, threshold: 0.95 },
  hud: { theme: 'sunny_circuit', accentColor: '#fbbf24', textColor: '#1a2e1a' },

  objectives: [
    { id: 'finish',      icon: '🏁', label: 'Finish the race',          target: 1, get: (s) => s.raceWon ? 1 : 0 },
    { id: 'checkpoints', icon: '🎯', label: 'Pass all 4 gates',         target: 4, get: (s) => Math.min(s.raceTotalCheckpoints ?? 0, 4) },
    { id: 'boosts',      icon: '⚡', label: 'Hit 4 boost pads',         target: 4, get: (s) => Math.min(s.raceBoostPadsHit ?? 0, 4) },
    { id: 'stars',       icon: '⭐', label: 'Collect 3 stars',          target: 3, get: (s) => Math.min(s.raceStarsCollected ?? 0, 3) },
  ],
};

export function createSunnyCircuitCurve() {
  return new THREE.CatmullRomCurve3(
    SUNNY_CIRCUIT_SPLINE.map((p) => new THREE.Vector3(p.x, 0, p.z)),
    true,
    'catmullrom',
    0.5,
  );
}
