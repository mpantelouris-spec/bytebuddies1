/**
 * MissionFamilyVisualSpec — applies the canonical Arena Visual Bible v2.
 */
import * as THREE from 'three';
import { getMissionCameraPreset } from '../ArenaBroadcastKit.js';
import {
  MISSION_FAMILY_VISUALS,
  getMissionFamilyVisual,
  getMissionVisual,
} from './MissionVisualBibleV2.js';

export const MISSION_FAMILY_SPECS = MISSION_FAMILY_VISUALS;

export function getMissionFamilySpec(environmentId) {
  return getMissionFamilyVisual(environmentId);
}

function applyFamilyEnvironment(scene, spec) {
  if (typeof document === 'undefined') return;
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, 64);
  gradient.addColorStop(0, spec.palette.secondary);
  gradient.addColorStop(0.55, spec.palette.primary);
  gradient.addColorStop(1, `#${new THREE.Color(spec.ground).getHexString()}`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 64);
  const texture = new THREE.CanvasTexture(canvas);
  if (THREE.SRGBColorSpace) texture.colorSpace = THREE.SRGBColorSpace;
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = texture;
  scene.environmentIntensity = 0.28;
  scene.userData.skipSoftEnvironment = true;
}

export function applyMissionFamilySpec(scene, environmentId, challenge = null) {
  const spec = getMissionVisual(challenge, environmentId);
  const fogCol = typeof spec.palette.fog === 'number'
    ? spec.palette.fog
    : parseInt(spec.palette.fog.replace('#', ''), 16);

  // Linear fog is easier for children to read and obeys each family's
  // explicit near/far visibility contract.
  scene.fog = new THREE.Fog(fogCol, spec.fogNear ?? 35, spec.fogFar ?? 95);
  applyFamilyEnvironment(scene, spec);

  // sim-visual-polish may have applied the same canonical family rig first.
  // Never stack a second rig; doubled lights wash out pale floors and clouds.
  if (!scene.userData.broadcastLookApplied && !scene.getObjectByName('MissionBibleLighting')) {
    // Base arena and simulator lights already exist at this point. Preserve
    // local goal lights, but demote the inherited rig so the Bible palette is
    // the clear lighting authority.
    scene.traverse((object) => {
      if (object.isLight) object.intensity *= 0.18;
    });

    const lightRoot = new THREE.Group();
    lightRoot.name = 'MissionBibleLighting';
    lightRoot.add(new THREE.HemisphereLight(0xf1f7ff, spec.ground, 1.15));
    lightRoot.add(new THREE.AmbientLight(spec.ambient, 0.5));

    const key = new THREE.DirectionalLight(spec.keyLight, 2.8);
    key.position.set(-10, 16, 8);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -28;
    key.shadow.camera.right = 28;
    key.shadow.camera.top = 28;
    key.shadow.camera.bottom = -28;
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 90;
    key.shadow.bias = -0.0002;
    key.shadow.normalBias = 0.02;
    lightRoot.add(key);

    const fill = new THREE.DirectionalLight(spec.fillLight, 1.1);
    fill.position.set(8, 7, -6);
    lightRoot.add(fill);

    const rim = new THREE.PointLight(spec.rimLight, 0.5, 42);
    rim.position.set(0, 7, -16);
    lightRoot.add(rim);
    scene.add(lightRoot);
  }
  scene.userData.missionLightingOwned = true;
  scene.userData.broadcastLookApplied = true;

  if (spec.underground) scene.userData.suppressSimDaylight = true;

  const post = spec.post || {};
  const sat = Number(post.gradeCss?.match(/saturate\(([\d.]+)\)/)?.[1] ?? 1.12);
  const contrast = Number(post.gradeCss?.match(/contrast\(([\d.]+)\)/)?.[1] ?? 1.04);
  const brightness = Number(post.gradeCss?.match(/brightness\(([\d.]+)\)/)?.[1] ?? 1);
  scene.userData.raceVisual = {
    bloom: Math.min(post.bloom ?? 0.32, 0.38),
    threshold: post.threshold ?? 0.9,
    radius: post.radius ?? 0.24,
    accent: spec.accent ?? spec.keyLight,
    gradeCss: post.gradeCss,
    grade: { s: sat, c: contrast, g: [brightness, brightness, brightness] },
  };
  scene.userData.missionCameraPreset = getMissionCameraPreset(challenge?.camera || spec.camera);
  scene.userData.arenaFamilySpec = spec;
  scene.userData.arenaMood = spec.mood;
  scene.userData.missionVisualBible = spec;
  return spec;
}
