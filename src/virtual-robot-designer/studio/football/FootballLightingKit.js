/**
 * Fake FIFA "feature lighting" — rim on players, pitch pool, tiered bloom.
 */
import * as THREE from 'three';

function tagFootballLight(light) {
  light.userData.footballArenaLight = true;
  return light;
}

export function applyFootballFeatureLighting(scene, tier = 'medium') {
  const rim = tagFootballLight(new THREE.DirectionalLight(0xfff0c8, tier === 'low' ? 0.72 : 0.58));
  rim.position.set(-11, 9, -7);
  scene.add(rim);
  scene.userData.footballRimLight = rim;

  const charRim = tagFootballLight(new THREE.DirectionalLight(0xa8d4ff, tier === 'low' ? 0.48 : 0.38));
  charRim.position.set(8, 5, 12);
  scene.add(charRim);

  const fill = tagFootballLight(new THREE.DirectionalLight(0x8ec8ff, tier === 'low' ? 0.42 : 0.28));
  fill.position.set(14, 6, 10);
  scene.add(fill);

  const pitchFill = tagFootballLight(new THREE.DirectionalLight(0xe8fff0, tier === 'low' ? 0.88 : 0.52));
  pitchFill.position.set(0, 14, 0);
  scene.add(pitchFill);

  const bloom = tier === 'low' ? 0.22 : tier === 'high' ? 0.48 : 0.42;
  scene.userData.footballVisual = { bloom, threshold: 0.82, radius: 0.36 };
  scene.userData.expMood = tier === 'low' ? 1.18 : 1.22;
}

export function boostPitchKeyLight(scene, tier = 'medium') {
  const key = scene.userData.footballKeyLight;
  if (!key) return;
  key.intensity = tier === 'low' ? 1.85 : tier === 'high' ? 1.72 : 1.65;
  key.color.setHex(0xfff8e8);
  if (tier === 'low') key.castShadow = false;
}
