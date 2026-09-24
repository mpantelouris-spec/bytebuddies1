/**
 * TrackInstancedProps.js — One InstancedMesh per prop batch (school-laptop friendly).
 */
import * as THREE from 'three';
import { placeAtTrack } from '../GameWorldBuilder.js';
import { pbrMat } from './BiomeAAAKit.js';
import { getBiomeAAASpec } from './BiomeAAAVisualSpec.js';
import { snapPropToRoad } from './TrackGroundSnap.js';

/** Stylized prop proxies — single mesh each for instancing. */
const PROP_DEFS = {
  palm: { geo: () => new THREE.CylinderGeometry(0.45, 0.6, 6, 6), h: 6, y: 3 },
  hut: { geo: () => new THREE.BoxGeometry(3.5, 2.8, 2.8), h: 2.8, y: 1.4 },
  torch: { geo: () => new THREE.CylinderGeometry(0.14, 0.18, 2.6, 6), h: 2.6, y: 1.3 },
  tent: { geo: () => new THREE.ConeGeometry(4.2, 5.5, 6), h: 5.5, y: 2.75 },
  pillar: { geo: () => new THREE.BoxGeometry(1.2, 8, 1.2), h: 8, y: 4 },
  tower: { geo: () => new THREE.BoxGeometry(2.8, 10, 2.8), h: 10, y: 5 },
  jungle: { geo: () => new THREE.CylinderGeometry(0.5, 0.7, 7, 7), h: 7, y: 3.5 },
  pine: { geo: () => new THREE.ConeGeometry(2.2, 7, 6), h: 7, y: 3.5 },
  gear: { geo: () => new THREE.TorusGeometry(1.8, 0.45, 8, 12), h: 2, y: 1 },
  dome: { geo: () => new THREE.SphereGeometry(3.5, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2), h: 3.5, y: 0 },
  daisy: { geo: () => new THREE.SphereGeometry(2.2, 8, 8), h: 2.2, y: 1.1 },
  toadstool: { geo: () => new THREE.ConeGeometry(1.6, 2.4, 8), h: 2.4, y: 1.2 },
};

const TRACK_PROP_COLORS = {
  sunset_cove_01: { palm: 0x2e8b2e, hut: 0xf4d03f, torch: 0x5a4030 },
  candy_carnival_01: { tent: 0xff1493 },
  neon_metro_01: { pillar: 0x334466 },
  cloud_citadel_01: { tower: 0x9a9aaa },
  jungle_ruins_01: { jungle: 0x228b22 },
  frost_peak_01: { pine: 0x5dade2 },
  lava_foundry_01: { gear: 0xff4500 },
  star_station_01: { dome: 0x6644aa },
  fairy_glen_01: { daisy: 0xff69b4, toadstool: 0xff4444 },
  thunder_ridge_01: { pine: 0x4a5568 },
};

function roadY(curve, t) {
  return curve.getPointAt(t).y || 0;
}

function scatterInstancedBatch(world, curve, hw, propKey, count, step, offset, sidePattern, colors, scene) {
  const def = PROP_DEFS[propKey];
  if (!def || count <= 0) return null;

  const color = colors[propKey] ?? 0x888888;
  const emissive = color;
  const mat = pbrMat(color, { emissive, emi: 0.15, roughness: 0.65 });
  const geo = def.geo();
  const placements = [];
  let idx = 0;

  for (let t = 0.04; t < 0.96 && placements.length < count; t += step) {
    const side = sidePattern(idx);
    const off = side * (hw + offset);
    const { pos, frame } = placeAtTrack(curve, t, off, 0);
    let y = roadY(curve, t);
    if (scene) y = snapPropToRoad(scene, pos.x, pos.z, y);
    placements.push({ x: pos.x, y: y + def.y, z: pos.z, rot: frame.rot ?? 0 });
    idx++;
  }

  if (!placements.length) return null;

  const im = new THREE.InstancedMesh(geo, mat, placements.length);
  im.name = `instanced-${propKey}`;
  im.castShadow = false;
  im.receiveShadow = true;

  const m = new THREE.Matrix4();
  const p = new THREE.Vector3();
  const q = new THREE.Quaternion();
  const s = new THREE.Vector3(1, 1, 1);

  placements.forEach((pl, i) => {
    p.set(pl.x, pl.y, pl.z);
    q.setFromEuler(new THREE.Euler(0, pl.rot, 0));
    m.compose(p, q, s);
    im.setMatrixAt(i, m);
  });
  im.instanceMatrix.needsUpdate = true;
  world.add(im);
  return im;
}

/** Scatter instanced props along both sides of the track. */
export function scatterInstancedTrackProps(world, curve, hw, arenaType, perf, scene) {
  const cfg = TRACK_PROP_COLORS[arenaType];
  if (!cfg) return;

  const spec = getBiomeAAASpec(arenaType);
  const groundColor = spec?.ground ?? 0x556b2f;
  const span = 180;
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(span, 32),
    pbrMat(groundColor, { roughness: 0.92 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.15;
  ground.name = 'track-ground-disc';
  ground.receiveShadow = true;
  world.add(ground);

  const propMult = perf?.propMult ?? 1;
  const maxPerSide = Math.max(4, Math.min(12, Math.round(12 * propMult)));
  const stepScale = propMult < 0.4 ? 1.5 : propMult < 0.7 ? 1.2 : 1;
  const baseStep = 0.1 * stepScale;
  const offset = 12 + hw;

  const propKeys = Object.keys(cfg);
  let batchIdx = 0;

  propKeys.forEach((propKey) => {
    const perBatch = Math.max(2, Math.ceil(maxPerSide / propKeys.length));
    scatterInstancedBatch(
      world, curve, hw, propKey, perBatch * 2, baseStep, offset + batchIdx * 2,
      (i) => (i % 2 ? 1 : -1),
      cfg,
      scene,
    );
    batchIdx++;
  });
}
