/**
 * Headless sanity check — Rainbow Road scene complexity after perf pass.
 * Run: node scripts/verify-rainbow-road-perf.mjs
 */
import * as THREE from 'three';
import { QUALITY_PRESETS } from '../src/virtual-robot-designer/services/art-direction.js';
import { buildRacingCourse } from '../src/virtual-robot-designer/racing/RacingCourse.js';
import { ZONE_RAINBOW_ROAD } from '../src/virtual-robot-designer/racing/zone-configs/ZoneConfig_RainbowRoad.js';

// Minimal DOM stubs for canvas texture builders in Node.
if (typeof document === 'undefined') {
  globalThis.document = {
    createElement: () => ({
      width: 0,
      height: 0,
      getContext: () => ({
        createLinearGradient: () => ({ addColorStop() {} }),
        fillStyle: '',
        fillRect() {},
        globalAlpha: 1,
        fillStyle: '',
        beginPath() {},
        ellipse() {},
        fill() {},
      }),
    }),
  };
}
function countSceneStats(scene) {
  let meshes = 0;
  let instanced = 0;
  let instances = 0;
  let triangles = 0;
  let drawCalls = 0;
  scene.traverse((o) => {
    if (o.isMesh) {
      meshes++;
      drawCalls++;
      const g = o.geometry;
      const tris = g.index ? g.index.count / 3 : (g.attributes.position?.count || 0) / 3;
      if (o.isInstancedMesh) {
        instanced++;
        instances += o.count;
        triangles += tris * o.count;
      } else {
        triangles += tris;
      }
    }
  });
  return { meshes, instanced, instances, triangles: Math.round(triangles), drawCalls };
}

for (const tier of ['medium', 'high']) {
  const scene = new THREE.Scene();
  scene.userData.qualityTier = tier;
  scene.userData.qualityPreset = QUALITY_PRESETS[tier];
  buildRacingCourse(scene, ZONE_RAINBOW_ROAD);
  const stats = countSceneStats(scene);
  console.log(`[${tier}]`, stats);
  if (tier === 'medium' && stats.triangles > 80000) {
    console.error(`FAIL: medium tier triangle count too high (${stats.triangles})`);
    process.exit(1);
  }
  if (tier === 'medium' && stats.drawCalls > 120) {
    console.error(`FAIL: medium tier draw calls too high (${stats.drawCalls})`);
    process.exit(1);
  }
}

console.log('OK — Rainbow Road perf budgets met for medium tier');
