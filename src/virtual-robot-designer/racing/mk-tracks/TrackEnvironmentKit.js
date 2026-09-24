/**
 * TrackEnvironmentKit.js — light reflections for glTF props.
 * Cup tracks use a canvas env map only (no extra suns, no HDRI hitch).
 */
import * as THREE from 'three';
import { getBiomeAAASpec } from './BiomeAAAVisualSpec.js';
import { getTrackSkyPreset } from './TrackSkyKit.js';

function installTrackLights(scene, spec) {
  // Live Lab already installed amb/hemi/sun/fill. Extra keys read as a floating lamp.
  if (scene.userData._trackLights || scene.userData.skipTrackLights) return;
  const hemi = new THREE.HemisphereLight(spec.fillLight ?? 0xffffff, spec.ground ?? 0x333333, 0.4);
  scene.add(hemi);
  const key = new THREE.DirectionalLight(spec.keyLight ?? 0xffffff, spec.suppressSimDaylight ? 0.55 : 0.85);
  key.position.set(40, 60, 30);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -80;
  key.shadow.camera.right = 80;
  key.shadow.camera.top = 80;
  key.shadow.camera.bottom = -80;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 180;
  key.shadow.bias = -0.00035;
  scene.add(key);
  const fill = new THREE.DirectionalLight(spec.rimLight ?? 0xffffff, 0.22);
  fill.position.set(-30, 25, -20);
  scene.add(fill);
  scene.userData._trackLights = { hemi, key, fill };
}

function installCanvasEnv(scene, arenaType) {
  const preset = getTrackSkyPreset(arenaType);
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 128);
  grad.addColorStop(0, preset.top);
  grad.addColorStop(0.55, preset.mid);
  grad.addColorStop(1, preset.horizon);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
  scene.environment = tex;
  const underground = getBiomeAAASpec(arenaType)?.underground;
  scene.environmentIntensity = underground ? 0.28 : 0.52;
}

export function installTrackEnvironment(scene, arenaType, renderer) {
  const spec = getBiomeAAASpec(arenaType);
  scene.userData.suppressSimDaylight = spec.suppressSimDaylight ?? false;
  scene.userData.biomeAAASpec = spec;

  try {
    if (renderer) installCanvasEnv(scene, arenaType);
  } catch (err) {
    console.warn('[TrackEnvironment] env failed', arenaType, err);
  }

  installTrackLights(scene, spec);

  const preset = getTrackSkyPreset(arenaType);
  if (!scene.fog) {
    scene.fog = new THREE.Fog(preset.fog ?? 0x87ceeb, 70, 340);
  }
}

export function disposeTrackEnvironment() {
  // Canvas env textures are disposed with the scene.
}
