/**
 * Stadium director — mode-specific skies, stands, and pitch dressing.
 */
import * as THREE from 'three';
import {
  buildPbrPitch,
  buildFootballStadium,
  buildDaySky,
  buildDuskSky,
  buildNightSky,
  buildTrainingCones,
  buildPenaltyBackdrop,
  buildStreetBackdrop,
  buildTrainingBackdrop,
  buildArcadeBackdrop,
  buildKeeperBackdrop,
} from '../FootballStadiumKit.js';
import { applyFootballFeatureLighting, boostPitchKeyLight } from './FootballLightingKit.js';

function tagFootballLight(light) {
  light.userData.footballArenaLight = true;
  return light;
}

export function buildFootballStadiumScene(scene, layoutKind = 'fifa', tier = 'medium') {
  if (layoutKind === 'arcade') buildNightSky(scene);
  else if (layoutKind === 'street') buildDuskSky(scene);
  else buildDaySky(scene);

  // Give each football activity its own venue. Only proper matches use the
  // full broadcast bowl; practice and skill modes get focused, readable spaces.
  if (layoutKind === 'fifa' || layoutKind === '1v1') {
    buildFootballStadium(scene, tier, {
      broadcastCamera: false,
      fullBowl: true,
      matchLabel: layoutKind === 'fifa' ? 'BYTEBUDDIES CUP  GREEN 3v3' : 'STRIKER CHAMPIONSHIP  1v1',
      awayLabel: layoutKind === 'fifa' ? 'BYTEBUDDIES CUP  BLUE 3v3' : 'CHALLENGER UNITED',
    });
  } else if (layoutKind === 'penalty' || layoutKind === 'freekick') {
    buildPenaltyBackdrop(scene, layoutKind);
  } else if (layoutKind === 'street') {
    buildStreetBackdrop(scene);
  } else if (layoutKind === 'training') {
    buildTrainingBackdrop(scene);
  } else if (layoutKind === 'arcade') {
    buildArcadeBackdrop(scene);
  } else if (layoutKind === 'keeper') {
    buildKeeperBackdrop(scene);
  } else {
    buildFootballStadium(scene, tier, { broadcastCamera: false, fullBowl: true });
  }
  scene.userData.footballVisual = { bloom: 0, threshold: 1, radius: 0 };
  scene.userData.expMood = tier === 'low' ? 1.08 : 1.14;
  if (layoutKind === 'training' || layoutKind === 'street' || layoutKind === 'arcade') {
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
