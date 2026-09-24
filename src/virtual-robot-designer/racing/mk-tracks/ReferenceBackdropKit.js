/**
 * ReferenceBackdropKit.js — Illustrated backdrop aligned to race chase camera.
 */
import * as THREE from 'three';
import { buildMarioKartTrack } from '../MarioKartTrackBuilder.js';
import { BIOME_CAMERA_STANDARD } from './BiomeAAAVisualSpec.js';

const _texCache = new Map();

export function loadReferenceTexture(imagePath) {
  if (_texCache.has(imagePath)) return _texCache.get(imagePath);
  const tex = new THREE.TextureLoader().load(
    imagePath,
    (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      console.log('[Backdrop] Loaded:', imagePath);
    },
    undefined,
    (err) => {
      console.error('[Backdrop] MISSING:', imagePath, err?.message || err);
    },
  );
  tex.colorSpace = THREE.SRGBColorSpace;
  _texCache.set(imagePath, tex);
  return tex;
}

/**
 * Chase-camera matte — sizes plane to fill FOV from spawn camera (matches reference art framing).
 * The PNG is the illustrated world; 3D road/kart sit in the lower third only.
 */
export function buildReferenceChaseBackdrop(scene, curve, bounds, imagePath, finishT = 0, options = {}) {
  const preset = { ...BIOME_CAMERA_STANDARD, ...(options.cameraPreset || {}) };
  const fov = options.fov ?? preset.fov ?? 60;
  const aspect = options.aspect ?? 16 / 9;
  const planeExtra = options.planeExtra ?? 28;
  const planeY = options.planeY ?? 13;
  const overscan = options.scale ?? 1.38;

  const spawn = curve.getPointAt(finishT);
  const tangent = curve.getTangentAt(finishT).normalize();
  const angle = Math.atan2(tangent.x, tangent.z);
  const fwdX = Math.sin(angle);
  const fwdZ = Math.cos(angle);

  const camPos = new THREE.Vector3(
    spawn.x - fwdX * preset.camBack,
    spawn.y + preset.camUp,
    spawn.z - fwdZ * preset.camBack,
  );
  const planeCenter = new THREE.Vector3(
    spawn.x + fwdX * (preset.lookAhead + planeExtra),
    spawn.y + planeY,
    spawn.z + fwdZ * (preset.lookAhead + planeExtra),
  );

  const dist = camPos.distanceTo(planeCenter);
  const vFovRad = (fov * Math.PI) / 180;
  const height = 2 * dist * Math.tan(vFovRad / 2) * overscan;
  const width = height * aspect;

  const tex = loadReferenceTexture(imagePath);
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    side: THREE.DoubleSide,
    depthWrite: false,
    depthTest: true,
    fog: false,
    toneMapped: false,
  });

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), mat);
  mesh.position.copy(planeCenter);
  mesh.lookAt(camPos);
  if (options.planePitchDeg) mesh.rotateX((options.planePitchDeg * Math.PI) / 180);

  mesh.name = 'reference-chase-backdrop';
  mesh.renderOrder = -30;
  scene.add(mesh);
  scene.background = new THREE.Color(options.bgColor ?? 0x0a0a0c);
  return mesh;
}

/** Optional upper wrap — use only when chase matte is not enough. */
export function buildReferenceSkyDome(scene, bounds, imagePath) {
  const tex = loadReferenceTexture(imagePath);
  const r = Math.max(bounds.spanX, bounds.spanZ) * 0.9 + 35;
  const geo = new THREE.SphereGeometry(r, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.45);
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    toneMapped: false,
    opacity: 0.35,
    transparent: true,
  });
  const dome = new THREE.Mesh(geo, mat);
  dome.name = 'reference-sky-dome';
  dome.position.set(bounds.cx, -6, bounds.cz);
  dome.renderOrder = -25;
  scene.add(dome);
  return dome;
}

export function buildReferenceBillboard(imagePath, width, height, position, rotationY = 0) {
  const tex = loadReferenceTexture(imagePath);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({
      map: tex,
      side: THREE.DoubleSide,
      depthWrite: false,
      fog: false,
      toneMapped: false,
    }),
  );
  mesh.position.copy(position);
  mesh.rotation.y = rotationY;
  mesh.name = 'reference-billboard';
  mesh.renderOrder = -15;
  return mesh;
}

export function buildPlayLayerRoad(curve, root, roadStyle, halfWidth, opts = {}) {
  return buildMarioKartTrack(curve, root, {
    halfWidth,
    roadStyle,
    use3D: opts.use3D ?? true,
    kerbs: true,
    walls: false,
    banking: opts.use3D ?? true,
    pbrRoad: true,
    segments: opts.segments ?? 360,
  });
}

export function purgeAllGenericFiller(scene) {
  const removeNames = [
    'aaa-sky-dome', 'aaa-terrain', 'aaa-clouds', 'flat-ground-pad', 'cave-floor',
    'reference-sky-dome', 'reference-chase-backdrop', 'crystal-sky-hemisphere',
    'living-world', 'world-density', 'biome-track-floor', 'cloud-layer-below',
    'mk8-moss-curbs', 'mk8-giant-lily', 'mk8-cloud-sea', 'industrial-start-gantry',
  ];
  removeNames.forEach((name) => {
    const o = scene.getObjectByName(name);
    if (o) scene.remove(o);
  });
  scene.children
    .filter((c) => (
      c.name === 'living-world'
      || c.name === 'world-density'
      || c.name?.startsWith('aaa-')
      || c.name?.startsWith('mk8-')
    ))
    .forEach((c) => scene.remove(c));
  scene.traverse((obj) => {
    if (
      obj.name === 'checkpoint-ground-ring'
      || obj.name === 'track-feature-ring'
      || obj.name === 'aaa-terrain'
    ) {
      if (obj.parent) obj.parent.remove(obj);
    }
  });
}
