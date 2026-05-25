import * as THREE from 'three';

const cache = new Map();

function key(parts) {
  return parts.join('|');
}

/** Reuse PBR materials across attachment meshes (performance) */
export function getCachedStandardMaterial({
  color = 0xeceff1,
  metalness = 0.2,
  roughness = 0.4,
  emissive = 0x000000,
  emissiveIntensity = 0,
} = {}) {
  const k = key(['std', color, metalness, roughness, emissive, emissiveIntensity]);
  if (!cache.has(k)) {
    cache.set(k, new THREE.MeshStandardMaterial({
      color,
      metalness,
      roughness,
      emissive,
      emissiveIntensity,
    }));
  }
  return cache.get(k).clone();
}

export function disposeMaterialCache() {
  cache.forEach((m) => m.dispose());
  cache.clear();
}
