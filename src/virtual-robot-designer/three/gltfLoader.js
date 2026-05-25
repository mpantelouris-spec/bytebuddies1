import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const cache = new Map();

/** Load GLTF/GLB — returns null on miss (caller uses procedural fallback) */
export async function loadRobotGltf(url) {
  if (!url) return null;
  if (cache.has(url)) {
    const cached = cache.get(url);
    return cached.scene.clone(true);
  }
  try {
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(url);
    cache.set(url, gltf);
    return gltf.scene.clone(true);
  } catch {
    return null;
  }
}

/** Optional detail mesh when no GLTF asset — extra panel lines for premium look */
export function addProceduralDetail(group, color = '#00D9FF') {
  const panel = new THREE.Mesh(
    new THREE.BoxGeometry(0.02, 0.15, 0.4),
    new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.35, metalness: 0.9, roughness: 0.15 }),
  );
  panel.position.set(0, 0.2, 0.35);
  group.add(panel);
  return panel;
}

export const GLTF_CHASSIS_PATHS = {
  rover: '/assets/robots/rover.glb',
  tank: '/assets/robots/tank.glb',
  drone: '/assets/robots/drone.glb',
};
