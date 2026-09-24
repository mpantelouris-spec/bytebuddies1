/** Count meshes per premium vista (headless build). */
import * as THREE from 'three';
import { FLYER_VISUAL_BIBLES, resolvePremiumAerialVista, getFlyingArenaContract } from '../src/virtual-robot-designer/studio/aerial-world/FlyingArenaSpec.js';
import { buildAerialWorld } from '../src/virtual-robot-designer/studio/aerial-world/AerialWorldKit.js';
import { PREMIUM_ENVIRONMENT_IDS } from '../src/virtual-robot-designer/studio/aerial-world/PremiumFlyingEnvironmentKit.js';

const context = new Proxy({}, { get: (_, key) => {
  if (key === 'measureText') return (text) => ({ width: String(text).length * 12 });
  if (key === 'createLinearGradient' || key === 'createRadialGradient') return () => ({ addColorStop() {} });
  return () => {};
}});
globalThis.document = { createElement: () => ({ width: 256, height: 256, getContext: () => context }) };
Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { getItem: () => null, setItem() {} } });
globalThis.window = { innerWidth: 1024, innerHeight: 768, devicePixelRatio: 1, matchMedia: () => ({ matches: false }), location: { search: '' } };

const counts = {};
for (const chassisId of Object.keys(FLYER_VISUAL_BIBLES)) {
  for (let mode = 1; mode <= 10; mode++) {
    const vista = resolvePremiumAerialVista(chassisId, mode);
    const scene = new THREE.Scene();
    const contract = getFlyingArenaContract({ chassisId, modeIndex: mode, arenaType: 'drone_canyon' });
    buildAerialWorld(scene, { chassisId, modeIndex: mode, arenaType: contract.arenaType, isChassisMode: true, physics: 'flight_3dof' });
    let meshes = 0;
    scene.traverse((o) => { if (o.isMesh || o.isInstancedMesh || o.isPoints) meshes++; });
    counts[vista] = Math.max(counts[vista] ?? 0, meshes);
    scene.traverse((o) => { o.geometry?.dispose(); const m = o.material; [].concat(m).filter(Boolean).forEach((x) => x.dispose?.()); });
  }
}

let fail = 0;
for (const id of PREMIUM_ENVIRONMENT_IDS) {
  const n = counts[id] ?? 0;
  const min = id === 'cybernetic_assembly_line' ? 80 : 45;
  if (n < min) {
    console.error(`FAIL ${id}: ${n} meshes (min ${min})`);
    fail++;
  } else {
    console.log(`OK ${id}: ${n} meshes`);
  }
}
delete globalThis.document;
process.exit(fail ? 1 : 0);
