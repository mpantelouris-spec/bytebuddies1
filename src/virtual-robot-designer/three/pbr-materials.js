/**
 * Premium PBR material presets — Pixar-style robotics (bright, tactile, kid-safe).
 */
import * as THREE from 'three';

const cache = new Map();

function cacheKey(type, color, extra = '') {
  return `${type}|${color}|${extra}`;
}

export const PBR_PRESETS = {
  brushedMetal: { metalness: 0.92, roughness: 0.22, envMapIntensity: 1.35 },
  mattePlastic: { metalness: 0.18, roughness: 0.48, envMapIntensity: 1.1 },
  glossyPlastic: { metalness: 0.35, roughness: 0.28, envMapIntensity: 1.25 },
  rubber: { metalness: 0.05, roughness: 0.88, envMapIntensity: 0.65 },
  glass: { metalness: 0.02, roughness: 0.08, envMapIntensity: 1.5, transparent: true, opacity: 0.72 },
  ledGlow: { metalness: 0.15, roughness: 0.4, envMapIntensity: 0.9, emissiveIntensity: 1.2 },
  darkSteel: { metalness: 0.82, roughness: 0.38, envMapIntensity: 1.15 },
  polishedFloor: { metalness: 0.55, roughness: 0.18, envMapIntensity: 1.2 },
  ceramic: { metalness: 0.12, roughness: 0.35, envMapIntensity: 1.05 },
};

export function createPBRMaterial(type, color = '#e2e8f0', options = {}) {
  const preset = PBR_PRESETS[type] || PBR_PRESETS.mattePlastic;
  const k = cacheKey(type, color, JSON.stringify(options));
  if (!cache.has(k)) {
    const c = new THREE.Color(color);
    const mat = new THREE.MeshStandardMaterial({
      color: c,
      metalness: options.metalness ?? preset.metalness,
      roughness: options.roughness ?? preset.roughness,
      envMapIntensity: options.envMapIntensity ?? preset.envMapIntensity,
      emissive: options.emissive ? new THREE.Color(options.emissive) : new THREE.Color(0x000000),
      emissiveIntensity: options.emissiveIntensity ?? preset.emissiveIntensity ?? 0,
      transparent: options.transparent ?? preset.transparent ?? false,
      opacity: options.opacity ?? preset.opacity ?? 1,
    });
    cache.set(k, mat);
  }
  return cache.get(k).clone();
}

/** Boost env reflections on an entire robot / scene subtree */
export function enhanceSceneMaterials(root, { envBoost = 1.15 } = {}) {
  if (!root) return;
  root.traverse((child) => {
    if (!child.isMesh) return;
    const mats = Array.isArray(child.material) ? child.material : [child.material];
    mats.forEach((m) => {
      if (!m || !m.isMeshStandardMaterial) return;
      m.envMapIntensity = Math.max(m.envMapIntensity ?? 0, envBoost);
      if (m.emissive && m.emissiveIntensity > 0.05) {
        m.emissiveIntensity = Math.min(m.emissiveIntensity * 1.08, 2.2);
      }
      child.castShadow = true;
      child.receiveShadow = true;
    });
  });
}

export function disposePBRMaterialCache() {
  cache.forEach((m) => m.dispose());
  cache.clear();
}
