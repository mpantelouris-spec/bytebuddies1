/**
 * AerialWebGPUKit — premium renderer selection (WebGPU try → WebGL fallback).
 *
 * three@0.160 does not export three/webgpu. WebGPU path activates after upgrading
 * to three r163+ and wiring async init in LiveLabPage. Until then: WebGL + GTAO/ACES.
 */
import * as THREE from 'three';
import { createSimWebGLRenderer } from '../../services/art-direction.js';

let _webgpuProbe = false;

/** Returns false on current three@0.160 — upgrade three for WebGPURenderer. */
export async function probeWebGPUSupport() {
  if (typeof navigator === 'undefined' || !navigator.gpu) return false;
  // Avoid static/dynamic import of 'three/webgpu' — breaks vite build on three@0.160.
  return false;
}

/**
 * Async premium renderer — WebGL today; WebGPU when three is upgraded.
 * @param {THREE.Scene} scene
 */
export async function createPremiumRenderer(scene, options = {}) {
  const renderer = createPremiumRendererWebGL(options);
  if (scene) scene.userData.renderBackend = 'webgl';
  return renderer;
}

/** Sync WebGL premium renderer with ACES exposure for aerial arenas. */
export function createPremiumRendererWebGL(options = {}) {
  const renderer = createSimWebGLRenderer(options);
  if (!renderer) return null;
  if (THREE.ACESFilmicToneMapping) {
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = options.exposure ?? 1.1;
  }
  // WebGLRenderer is not Object3D — userData is not guaranteed; attach explicitly.
  if (!renderer.userData) renderer.userData = {};
  renderer.userData.premiumBackend = 'webgl';
  return renderer;
}
