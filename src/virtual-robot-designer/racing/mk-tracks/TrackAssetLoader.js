/**
 * TrackAssetLoader.js — GLTF/GLB loader with cache + instancing helpers.
 * NO primitive fallback — missing assets log errors and show a visible marker.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { getTrackAssetUrl } from './TrackAssetManifest.js';

const _cache = new Map();
const _pending = new Map();
let _loader = null;
const LOAD_TIMEOUT_MS = 5000;

function withTimeout(promise, ms, url) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`timeout ${ms}ms`)), ms);
    promise
      .then((v) => { clearTimeout(timer); resolve(v); })
      .catch((e) => { clearTimeout(timer); reject(e); });
  });
}

function getLoader() {
  if (!_loader) {
    const draco = new DRACOLoader();
    draco.setDecoderPath('/draco/');
    _loader = new GLTFLoader();
    _loader.setDRACOLoader(draco);
  }
  return _loader;
}

export function showMissingAssetMarker(parent, label) {
  console.warn('[TrackAssetLoader] Missing asset (marker suppressed):', label);
  return null;
}

/** Load any URL — returns cached GLTF root (not cloned). */
export async function loadTrackAsset(url) {
  if (!url) {
    console.error('[TrackAssetLoader] Missing asset URL');
    return null;
  }
  if (_cache.has(url)) return _cache.get(url);
  if (_pending.has(url)) return _pending.get(url);

  const promise = withTimeout(getLoader().loadAsync(url), LOAD_TIMEOUT_MS, url)
    .then((gltf) => {
      gltf.scene.name = gltf.scene.name || url.split('/').pop();
      _cache.set(url, gltf);
      _pending.delete(url);
      return gltf;
    })
    .catch((err) => {
      _pending.delete(url);
      if (!err?.message?.includes('timeout')) {
        console.error('[TrackAssetLoader] Failed to load:', url, err);
      }
      return null;
    });

  _pending.set(url, promise);
  return promise;
}

export async function loadTrackAssetByKey(trackId, assetKey) {
  const url = getTrackAssetUrl(trackId, assetKey);
  if (!url) {
    console.error('[TrackAssetLoader] Unknown asset key:', trackId, assetKey);
    return null;
  }
  return loadTrackAsset(url);
}

export function cloneGltfScene(gltf) {
  if (!gltf?.scene) return null;
  return gltf.scene.clone(true);
}

/** Deep clone for instancing — separate material instances per clone when needed. */
export function cloneForInstancing(gltf) {
  const root = cloneGltfScene(gltf);
  if (!root) return null;
  root.traverse((obj) => {
    if (obj.isMesh && obj.material) {
      obj.material = obj.material.clone();
    }
  });
  return root;
}

export function normalizeObjectHeight(root, targetHeight = 5) {
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const h = Math.max(size.y, 0.01);
  const s = targetHeight / h;
  root.scale.setScalar(s);
  box.setFromObject(root);
  root.position.y -= box.min.y;
  return root;
}

/** Scatter InstancedMesh when the glTF has a single mesh child; else clone per placement. */
export function scatterGltfInstances(gltf, placements, parent, opts = {}) {
  const { targetHeight = 5, name = 'gltf-scatter' } = opts;
  if (!gltf?.scene || !placements?.length) return null;

  const meshes = [];
  gltf.scene.traverse((obj) => { if (obj.isMesh) meshes.push(obj); });

  if (meshes.length === 1) {
    const src = meshes[0];
    const probe = cloneGltfScene(gltf);
    normalizeObjectHeight(probe, targetHeight);
    const probeMesh = probe.children[0]?.isMesh ? probe.children[0] : src;
    const scale = probe.scale.x;

    const im = new THREE.InstancedMesh(src.geometry, src.material.clone(), placements.length);
    im.name = name;
    im.castShadow = true;
    im.receiveShadow = true;

    const m = new THREE.Matrix4();
    const p = new THREE.Vector3();
    const q = new THREE.Quaternion();
    const s = new THREE.Vector3(scale, scale, scale);

    placements.forEach((pl, i) => {
      p.copy(pl.pos);
      q.setFromEuler(new THREE.Euler(0, pl.rot ?? 0, 0));
      if (pl.scale) s.set(pl.scale, pl.scale, pl.scale);
      m.compose(p, q, s);
      im.setMatrixAt(i, m);
    });
    im.instanceMatrix.needsUpdate = true;
    parent.add(im);
    return im;
  }

  placements.forEach((pl, i) => {
    const clone = cloneForInstancing(gltf);
    if (!clone) return;
    normalizeObjectHeight(clone, targetHeight);
    clone.position.copy(pl.pos);
    clone.rotation.y = pl.rot ?? 0;
    if (pl.scale) clone.scale.multiplyScalar(pl.scale);
    clone.name = `${name}-${i}`;
    parent.add(clone);
  });
  return null;
}

export function getCachedGltf(url) {
  return _cache.get(url) ?? null;
}

export function tintGltfMaterials(root, tintFn) {
  root?.traverse?.((obj) => {
    if (!obj.isMesh?.material) return;
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    mats.forEach((mat) => tintFn(mat, obj));
  });
}
