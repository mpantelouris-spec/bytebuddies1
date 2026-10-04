/**
 * Stadium director — mode-specific skies, stands, and pitch dressing.
 */
import * as THREE from 'three';
import {
  buildPbrPitch,
  buildFootballStadium,
  buildDaySky,
  buildTrainingCones,
} from '../FootballStadiumKit.js';
import { applyFootballFeatureLighting, boostPitchKeyLight } from './FootballLightingKit.js';

function tagFootballLight(light) {
  light.userData.footballArenaLight = true;
  return light;
}

export function buildFootballStadiumScene(scene, layoutKind = 'fifa', tier = 'medium') {
  buildDaySky(scene);
  buildFootballStadium(scene, tier, { broadcastCamera: false, fullBowl: true });
  scene.userData.footballVisual = { bloom: 0, threshold: 1, radius: 0 };
  scene.userData.expMood = tier === 'low' ? 1.08 : 1.14;
  if (layoutKind === 'training') {
    applyFootballFeatureLighting(scene, tier);
  }
}

export function buildFootballPitchGroup(layoutKind = 'fifa') {
  const pitch = buildPbrPitch();
  if (layoutKind === 'training') {
    pitch.add(buildTrainingCones());
  }
  return pitch;
}

export function finalizeFootballArenaLighting(scene, tier = 'medium') {
  boostPitchKeyLight(scene, tier);
  const hemi = tagFootballLight(new THREE.HemisphereLight(0xb8d4ff, 0x1a3d28, tier === 'low' ? 0.95 : 0.72));
  scene.add(hemi);
}
