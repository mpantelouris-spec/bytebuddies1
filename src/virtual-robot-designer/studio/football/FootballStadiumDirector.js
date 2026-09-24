/**
 * Stadium director — mode-specific skies, stands, and pitch dressing.
 */
import * as THREE from 'three';
import {
  buildPbrPitch,
  buildFootballStadium,
  buildPenaltyBackdrop,
  buildDuskSky,
  buildNightSky,
  buildStreetBackdrop,
  buildTrainingBackdrop,
  buildArcadeBackdrop,
  buildKeeperBackdrop,
  buildTrainingCones,
} from '../FootballStadiumKit.js';
import { applyFootballFeatureLighting, boostPitchKeyLight } from './FootballLightingKit.js';

function tagFootballLight(light) {
  light.userData.footballArenaLight = true;
  return light;
}

export function buildFootballStadiumScene(scene, layoutKind = 'fifa', tier = 'medium') {
  switch (layoutKind) {
    case 'fifa':
      buildNightSky(scene);
      buildFootballStadium(scene, tier, { broadcastCamera: true });
      scene.userData.footballVisual = { bloom: 0, threshold: 1, radius: 0 };
      scene.userData.expMood = tier === 'low' ? 1.02 : 1.06;
      break;
    case 'street':
      buildDuskSky(scene);
      buildStreetBackdrop(scene);
      break;
    case 'training':
      buildDuskSky(scene);
      buildTrainingBackdrop(scene);
      break;
    case 'keeper':
      buildNightSky(scene);
      buildKeeperBackdrop(scene);
      break;
    case 'arcade':
      buildNightSky(scene);
      buildArcadeBackdrop(scene);
      break;
    case 'penalty':
    case 'freekick':
      buildDuskSky(scene);
      buildPenaltyBackdrop(scene, layoutKind);
      break;
    default:
      buildDuskSky(scene);
      buildPenaltyBackdrop(scene, 'match');
      break;
  }
  if (layoutKind !== 'fifa') {
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
