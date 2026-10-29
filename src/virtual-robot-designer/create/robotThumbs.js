/**
 * Small 3D pictures of robots for pickers and cards. One shared offscreen renderer,
 * a queue (so a grid of 40 robots doesn't freeze the page) and a cache by look.
 */
import * as THREE from 'three';
import { buildRobotModel, normalizeRobotBuildConfig } from '../services/studio-robot-builder.js';

let renderer = null, scene = null, camera = null;
let queue = Promise.resolve();
const cache = new Map();

function setup() {
  if (renderer) return renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true, powerPreference: 'low-power' });
  } catch { renderer = null; }
  if (!renderer) return null;
  renderer.setSize(220, 220, false);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  camera = new THREE.PerspectiveCamera(30, 1, 0.05, 80);
  scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8899bb, 1.25));
  const key = new THREE.DirectionalLight(0xffffff, 1.9);
  key.position.set(2.4, 5.2, 3.6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xc4b5fd, 0.7);
  rim.position.set(-3, 2, -3);
  scene.add(rim);
  return renderer;
}

/** Frame a model three-quarters on, like a toy box photo. */
export function frameRobot(model, cam, spread = 2.35) {
  model.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(model);
  const c = box.getCenter(new THREE.Vector3());
  const s = box.getSize(new THREE.Vector3());
  const d = Math.max(s.x, s.y, s.z, 0.6) * spread;
  cam.position.set(c.x + d * 0.6, c.y + d * 0.3, c.z + d * 0.78);
  cam.lookAt(c);
}

export function robotThumbKey(cfg) {
  return JSON.stringify([cfg.chassisId, cfg.primaryColor, cfg.accentColor, cfg.ledColor, cfg.wheelColor, cfg.addons, cfg.materialMetalness, cfg.materialRoughness, cfg.design, cfg.parts, cfg.build]);
}

/** Resolves to a PNG data URL (or null if WebGL is unavailable). */
export function renderRobotThumb(cfg) {
  const key = robotThumbKey(cfg);
  if (cache.has(key)) return Promise.resolve(cache.get(key));
  queue = queue.then(async () => {
    if (cache.has(key)) return cache.get(key);
    const r = setup();
    if (!r) return null;
    let model = null;
    try {
      model = buildRobotModel(normalizeRobotBuildConfig({ sensors: [], tools: [], ...cfg }));
      scene.add(model);
      if (model.userData.animate) for (let i = 1; i <= 20; i++) model.userData.animate(i * 0.05, 0.05);
      frameRobot(model, camera);
      r.render(scene, camera);
      const url = r.domElement.toDataURL('image/png');
      cache.set(key, url);
      return url;
    } catch {
      return null;
    } finally {
      if (model) scene.remove(model);
    }
  }).catch(() => null);
  return queue;
}
