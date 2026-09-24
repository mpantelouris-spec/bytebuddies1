/**
 * Headless layout audit — flag scenery inside the drivable corridor.
 * Run: node scripts/verify-mk-track-layout.mjs
 */
import * as THREE from 'three';
import { buildRacingCourse } from '../src/virtual-robot-designer/racing/RacingCourse.js';
import { getMKTrack } from '../src/virtual-robot-designer/racing/mk-tracks/MKTrackRegistry.js';
import { buildMKZoneConfig } from '../src/virtual-robot-designer/racing/mk-tracks/MKTrackRegistry.js';

if (typeof document === 'undefined') {
  globalThis.document = {
    createElement: () => ({
      width: 512,
      height: 512,
      getContext: () => {
        const ctx = {
          fillStyle: '', strokeStyle: '', lineWidth: 1, font: '', textAlign: 'left',
          shadowColor: '', shadowBlur: 0, globalAlpha: 1,
          createLinearGradient: () => ({ addColorStop() {} }),
          fillRect() {}, strokeRect() {}, fillText() {}, stroke() {},
          beginPath() {}, moveTo() {}, lineTo() {}, bezierCurveTo() {},
          arc() {}, fill() {}, setLineDash() {}, ellipse() {},
        };
        return ctx;
      },
    }),
  };
}

const TRACKS = ['luigi_circuit', 'moo_moo_meadows', 'mario_circuit'];

function distXZ(a, b) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

function auditTrack(arenaType) {
  const mk = getMKTrack(arenaType);
  const zone = buildMKZoneConfig(mk);
  const scene = new THREE.Scene();
  scene.userData.qualityTier = 'medium';
  scene.userData.qualityPreset = { worldLod: 1 };
  buildRacingCourse(scene, zone);

  const curve = scene.userData.raceCurve;
  const hw = (mk.trackWidth ?? 6) / 2;
  const corridor = hw + 1.5;

  const trackPts = [];
  for (let i = 0; i <= 120; i++) {
    trackPts.push(curve.getPointAt(i / 120));
  }

  const offenders = [];
  scene.traverse((obj) => {
    if (!obj.isMesh && !obj.isGroup) return;
    if (obj.name === 'kart-track' || obj.parent?.name === 'kart-track') return;
    const pos = new THREE.Vector3();
    obj.getWorldPosition(pos);
    if (pos.y > 25) return; // sky / lights
    let minD = Infinity;
    for (const p of trackPts) {
      minD = Math.min(minD, distXZ(pos, p));
    }
    if (minD < corridor && pos.y < 6) {
      offenders.push({
        name: obj.name || obj.type,
        parent: obj.parent?.name || '',
        x: pos.x.toFixed(1),
        z: pos.z.toFixed(1),
        y: pos.y.toFixed(1),
        dist: minD.toFixed(1),
      });
    }
  });

  const unique = new Map();
  offenders.forEach((o) => {
    const key = `${o.parent}::${o.name}@${o.x},${o.z}`;
    if (!unique.has(key)) unique.set(key, o);
  });

  console.log(`\n=== ${arenaType} (halfWidth=${hw}) ===`);
  console.log(`spawn: ${JSON.stringify(scene.userData.raceSpawn)}`);
  console.log(`offenders in corridor (<${corridor}m): ${unique.size}`);
  [...unique.values()].slice(0, 15).forEach((o) => console.log(' ', o));
  if (unique.size > 15) console.log(`  ... +${unique.size - 15} more`);
  return unique.size;
}

let total = 0;
for (const t of TRACKS) total += auditTrack(t);
process.exit(total > 30 ? 1 : 0);
