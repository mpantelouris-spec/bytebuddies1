/**
 * SunsetCoveWorldKit.js — glTF-based Sunset Cove world (PHASE 1 acceptance target).
 * Uses Kenney CC0 models bundled in public/assets/tracks/sunset_cove_01/.
 */
import * as THREE from 'three';
import { placeAtTrack } from '../GameWorldBuilder.js';
import { getTrackStandard } from './CodeRacerTrackStandards.js';
import { getTrackManifest } from './TrackAssetManifest.js';
import {
  loadTrackAsset,
  loadTrackAssetByKey,
  cloneForInstancing,
  cloneGltfScene,
  normalizeObjectHeight,
  scatterGltfInstances,
  showMissingAssetMarker,
  tintGltfMaterials,
} from './TrackAssetLoader.js';
import { scaledCount } from './TrackPerformanceKit.js';

const TRACK_ID = 'sunset_cove_01';

function roadY(curve, t) {
  return curve.getPointAt(t).y || 0;
}

function makeWaveWater(bounds) {
  const span = Math.max(bounds.spanX, bounds.spanZ) + 300;
  const geo = new THREE.PlaneGeometry(span, span, 64, 64);
  const mat = new THREE.MeshStandardMaterial({
    color: 0x1a9ec8,
    metalness: 0.85,
    roughness: 0.12,
    transparent: true,
    opacity: 0.92,
    envMapIntensity: 1.2,
  });
  const water = new THREE.Mesh(geo, mat);
  water.rotation.x = -Math.PI / 2;
  water.position.set(bounds.cx, -0.35, bounds.cz);
  water.name = 'sunset-ocean';
  water.receiveShadow = true;
  water.userData.animated = true;
  water.userData.basePositions = geo.attributes.position.array.slice();
  return water;
}

export function buildSunsetOceanPlane(bounds) {
  const g = new THREE.Group();
  g.name = 'sunset-ocean-group';
  g.add(makeWaveWater(bounds));
  return g;
}

async function loadAsset(key) {
  const gltf = await loadTrackAssetByKey(TRACK_ID, key);
  if (!gltf) {
    console.error(`[SunsetCove] Missing asset: ${getTrackManifest(TRACK_ID)?.base}/${getTrackManifest(TRACK_ID)?.assets?.[key]}`);
    return null;
  }
  return gltf;
}

function scatterAlongTrack(curve, hw, count, offset, step, sidePattern) {
  const placements = [];
  let idx = 0;
  for (let t = 0.04; t < 0.96; t += step) {
    const side = sidePattern ? sidePattern(idx) : (idx % 2 ? 1 : -1);
    const off = side * (hw + offset);
    const { pos, frame } = placeAtTrack(curve, t, off, 0);
    pos.y += roadY(curve, t);
    placements.push({ pos, rot: frame.rot ?? 0 });
    idx++;
    if (placements.length >= count) break;
  }
  return placements;
}

async function placePalms(world, curve, hw, perf) {
  const gltf = await loadAsset('palm_tree');
  if (!gltf) {
    showMissingAssetMarker(world, 'palm_tree.glb');
    return;
  }
  const n = scaledCount(22, perf?.propMult ?? 1);
  const left = scatterAlongTrack(curve, hw, n, 14, 0.04, (i) => -1);
  const right = scatterAlongTrack(curve, hw, n, 14, 0.04, (i) => 1);
  scatterGltfInstances(gltf, [...left, ...right], world, { targetHeight: 7.5, name: 'gltf-palm' });
}

async function placeHuts(world, curve, hw) {
  const gltf = await loadAsset('beach_hut');
  if (!gltf) return;
  const placements = [];
  const offsets = [14, 16, 18];
  let idx = 0;
  for (const t of [0.12, 0.28, 0.55, 0.72, 0.88, 0.42]) {
    const side = idx % 2 ? 1 : -1;
    const off = side * (hw + offsets[idx % offsets.length]);
    const { pos, frame } = placeAtTrack(curve, t, off, 0);
    pos.y += roadY(curve, t);
    placements.push({ pos, rot: frame.rot ?? 0 });
    idx++;
  }
  scatterGltfInstances(gltf, placements, world, { targetHeight: 4.5, name: 'gltf-hut' });
}

async function placeTorches(world, curve, hw, perf) {
  const gltf = await loadAsset('tiki_torch');
  if (!gltf) return;
  const max = scaledCount(20, perf?.propMult ?? 1);
  const withLights = perf?.torchLights ?? true;
  const placements = [];
  let idx = 0;
  for (let t = 0.04; t < 0.96; t += 0.048) {
    const side = idx % 2 ? 1 : -1;
    const off = side * (hw + 9);
    const { pos, frame } = placeAtTrack(curve, t, off, 0);
    pos.y += roadY(curve, t);
    placements.push({ pos, rot: frame.rot ?? 0 });
    idx++;
    if (placements.length >= max) break;
  }
  placements.forEach((pl, i) => {
    const torch = cloneForInstancing(gltf);
    if (!torch) return;
    normalizeObjectHeight(torch, 2.8);
    torch.position.copy(pl.pos);
    torch.rotation.y = pl.rot;
    torch.name = `gltf-torch-${i}`;
    tintGltfMaterials(torch, (mat) => {
      if (mat.color?.getHex() > 0x888888) {
        mat.emissive = new THREE.Color(0xff6600);
        mat.emissiveIntensity = 1.2;
      }
    });
    if (withLights) {
      const light = new THREE.PointLight(0xff6600, 1.8, 14);
      light.position.set(0, 2.4, 0);
      torch.add(light);
    }
    world.add(torch);
  });
}

async function placeUmbrellas(world, curve, hw) {
  const gltf = await loadAsset('beach_umbrella');
  if (!gltf) return;
  const placements = [];
  const ts = [0.08, 0.15, 0.22, 0.32, 0.42, 0.52, 0.62, 0.72, 0.82, 0.9, 0.28, 0.48, 0.68, 0.38, 0.58, 0.78];
  ts.forEach((t, i) => {
    const side = i % 2 ? 1 : -1;
    const off = side * (hw + 11 + (i % 3) * 2);
    const { pos, frame } = placeAtTrack(curve, t, off, 0);
    pos.y += roadY(curve, t);
    placements.push({ pos, rot: frame.rot ?? 0 });
  });
  scatterGltfInstances(gltf, placements, world, { targetHeight: 3.2, name: 'gltf-umbrella' });
}

async function placeCoastalRocks(world, curve, hw, bounds) {
  const gltf = await loadAsset('island_rock');
  if (!gltf) return;
  const placements = [];
  let idx = 0;
  for (let t = 0.04; t < 0.96; t += 0.055) {
    const side = idx % 2 ? 1 : -1;
    const off = side * (hw + 20 + (idx % 3) * 3);
    const { pos, frame } = placeAtTrack(curve, t, off, -0.2);
    pos.y += roadY(curve, t) - 0.3;
    placements.push({ pos, rot: frame.rot ?? 0, scale: 0.75 + (idx % 4) * 0.2 });
    idx++;
    if (placements.length >= 18) break;
  }
  scatterGltfInstances(gltf, placements, world, { targetHeight: 2.5, name: 'gltf-rock' });
}

async function placeDistantIslands(world, bounds) {
  const gltf = await loadAsset('distant_island');
  if (!gltf) return;
  const spots = [
    { x: bounds.cx - bounds.spanX * 0.55, z: bounds.cz - bounds.spanZ * 0.4, scale: 6 },
    { x: bounds.cx + bounds.spanX * 0.5, z: bounds.cz - bounds.spanZ * 0.55, scale: 8 },
    { x: bounds.cx + bounds.spanX * 0.15, z: bounds.cz + bounds.spanZ * 0.65, scale: 5 },
  ];
  spots.forEach((sp, i) => {
    const island = cloneForInstancing(gltf);
    if (!island) return;
    normalizeObjectHeight(island, 4 * sp.scale);
    island.position.set(sp.x, -1.2, sp.z);
    island.name = `gltf-distant-island-${i}`;
    world.add(island);
  });
}

async function placeHeroHibiscusArch(world, curve, hw) {
  const std = getTrackStandard(TRACK_ID);
  const heroT = std?.heroT ?? 0.45;
  const bridgeGltf = await loadAsset('hibiscus_arch');
  const flowerGltf = await loadAsset('hibiscus_flower');
  if (!bridgeGltf) return;

  const arch = cloneForInstancing(bridgeGltf);
  const archW = hw * 2.4;
  normalizeObjectHeight(arch, 7.5);
  const box = new THREE.Box3().setFromObject(arch);
  const width = box.getSize(new THREE.Vector3()).x;
  if (width > 0.01) arch.scale.x *= archW / width;

  const { pos, frame } = placeAtTrack(curve, heroT, hw + 26, 0);
  arch.position.copy(pos);
  arch.position.y += roadY(curve, heroT);
  arch.rotation.y = (frame.rot ?? 0) + Math.PI / 2;
  arch.name = 'hero-hibiscus-arch-gltf';

  if (flowerGltf) {
    for (let i = 0; i < 16; i++) {
      const flower = cloneForInstancing(flowerGltf);
      normalizeObjectHeight(flower, 1.8);
      const a = (i / 16) * Math.PI;
      flower.position.set(Math.cos(a) * archW * 0.44, 5.5 + Math.sin(a) * 1.8, Math.sin(a) * 0.5);
      tintGltfMaterials(flower, (mat) => {
        mat.emissive = new THREE.Color(0xff1493);
        mat.emissiveIntensity = 1.1;
        if (mat.color) mat.color.lerp(new THREE.Color(0xff69b4), 0.6);
      });
      arch.add(flower);
    }
  }

  const glow = new THREE.PointLight(0xff69b4, 3.5, 32);
  glow.position.set(0, 6.5, 0);
  arch.add(glow);
  world.add(arch);
}

async function placeGltfCheckpoints(world, curve, hw) {
  // Side buoys only — no arches spanning the road.
  const std = getTrackStandard(TRACK_ID);
  const cpTs = std?.checkpointTs ?? [0.25, 0.5, 0.75];
  const buoyGltf = await loadAsset('tiki_torch');
  if (!buoyGltf) return;

  cpTs.forEach((t, i) => {
    [-1, 1].forEach((side) => {
      const off = side * (hw + 3.8);
      const { pos, frame } = placeAtTrack(curve, t, off, 0);
      const buoy = cloneForInstancing(buoyGltf);
      if (!buoy) return;
      normalizeObjectHeight(buoy, 2.2);
      buoy.position.copy(pos);
      buoy.position.y += roadY(curve, t);
      buoy.rotation.y = frame.rot ?? 0;
      buoy.name = `gltf-checkpoint-buoy-${i}-${side}`;
      tintGltfMaterials(buoy, (mat) => {
        const c = std.checkpointColors?.[i] ?? 0xff8c42;
        mat.emissive = new THREE.Color(c);
        mat.emissiveIntensity = 0.7;
      });
      world.add(buoy);
    });
  });
}

async function placeSeagulls(world, bounds) {
  const gltf = await loadAsset('seagull');
  if (!gltf) return;
  const spots = [
    { x: bounds.cx - 20, y: 12, z: bounds.cz - 15 },
    { x: bounds.cx + 25, y: 16, z: bounds.cz + 10 },
    { x: bounds.cx - 8, y: 14, z: bounds.cz + 28 },
  ];
  spots.forEach((sp, i) => {
    const bird = cloneGltfScene(gltf);
    if (!bird) return;
    normalizeObjectHeight(bird, 0.8);
    bird.position.set(sp.x, sp.y, sp.z);
    bird.name = `gltf-seagull-${i}`;
    bird.userData.animated = true;
    bird.userData.bobPhase = i * 1.7;
    bird.userData.orbitR = 4 + i * 2;
    bird.userData.orbitCenter = sp;
    world.add(bird);
  });
}

/**
 * Async glTF world build for sunset_cove_01.
 */
export async function buildSunsetCoveGltfWorld(world, curve, hw, bounds, finishT, perf = null) {
  world.userData.trackPerfBudget = perf;
  world.add(buildSunsetOceanPlane(bounds));

  await Promise.all([
    placePalms(world, curve, hw, perf),
    placeHuts(world, curve, hw),
    placeTorches(world, curve, hw, perf),
    placeUmbrellas(world, curve, hw),
    placeCoastalRocks(world, curve, hw, bounds),
    placeDistantIslands(world, bounds),
    placeHeroHibiscusArch(world, curve, hw),
    placeGltfCheckpoints(world, curve, hw),
    placeSeagulls(world, bounds),
  ]);

  console.log('[SunsetCove] glTF world loaded', { tier: perf?.tier });
}

export function animateSunsetCoveWorld(world, time) {
  const perf = world.userData.trackPerfBudget;
  const waterAnim = perf?.waterAnim ?? true;
  world.traverse((obj) => {
    if (obj.name === 'sunset-ocean' && waterAnim && obj.userData.basePositions) {
      const pos = obj.geometry.attributes.position;
      const base = obj.userData.basePositions;
      for (let i = 0; i < pos.count; i++) {
        const x = base[i * 3];
        const z = base[i * 3 + 2];
        pos.array[i * 3 + 1] = base[i * 3 + 1]
          + Math.sin(x * 0.12 + time * 1.2) * 0.18
          + Math.cos(z * 0.1 + time * 0.9) * 0.14;
      }
      pos.needsUpdate = true;
      obj.geometry.computeVertexNormals();
    }
    if (obj.name?.startsWith('gltf-torch-')) {
      const light = obj.children.find((c) => c.isPointLight);
      if (light) light.intensity = 1.1 + Math.sin(time * 4 + obj.position.x) * 0.5;
    }
    if (obj.name?.startsWith('gltf-seagull-') && obj.userData.orbitCenter) {
      const c = obj.userData.orbitCenter;
      const r = obj.userData.orbitR;
      const ph = obj.userData.bobPhase ?? 0;
      obj.position.x = c.x + Math.cos(time * 0.15 + ph) * r;
      obj.position.z = c.z + Math.sin(time * 0.15 + ph) * r;
      obj.position.y = c.y + Math.sin(time * 2 + ph) * 0.6;
      obj.rotation.y = time * 0.15 + ph;
    }
    if (obj.name?.startsWith('gltf-checkpoint-') && obj.userData.pulse) {
      obj.traverse((child) => {
        if (child.isMesh && child.material?.emissiveIntensity !== undefined) {
          child.material.emissiveIntensity = 0.45 + Math.sin(time * 2.5) * 0.35;
        }
      });
    }
  });
}
