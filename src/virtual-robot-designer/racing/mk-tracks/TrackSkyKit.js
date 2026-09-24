/**
 * TrackSkyKit.js — 3D gradient sky domes (NO PNG backdrops).
 * MeshBasic + scene.background so track switches never fall through to a black clear color.
 */
import * as THREE from 'three';
import { isCosmicSkywayArena, getCosmicTheme } from './CosmicSkywayRegistry.js';

const SKY_PRESETS = {
  sunset_cove_01: { top: '#287fc4', mid: '#69c5ea', horizon: '#ffd39a', fog: 0xb7ddec },
  candy_carnival_01: { top: '#7ec8ff', mid: '#ffe0f0', horizon: '#ffc0e0', fog: 0xffe8f4 },
  neon_metro_01: { top: '#1a0840', mid: '#2a1058', horizon: '#3a2080', fog: 0x1a1040 },
  cloud_citadel_01: { top: '#4fc3f7', mid: '#b0d8f8', horizon: '#e8f4ff', fog: 0xc8e8ff },
  jungle_ruins_01: { top: '#5dade2', mid: '#8fbc8f', horizon: '#c8e8a0', fog: 0xa8d090 },
  frost_peak_01: { top: '#e8f4ff', mid: '#b8ddf0', horizon: '#d0e8f8', fog: 0xd8eef8 },
  lava_foundry_01: { top: '#4a1808', mid: '#882200', horizon: '#ff6a20', fog: 0x662200 },
  star_station_01: { top: '#03020a', mid: '#140c34', horizon: '#2e1a5e', fog: 0x120a2c },
  fairy_glen_01: { top: '#7ec8ff', mid: '#fff4b0', horizon: '#c8f080', fog: 0xd0ecc0 },
  thunder_ridge_01: { top: '#6a90c8', mid: '#9ab4d0', horizon: '#d0dce8', fog: 0xb0c4d8 },
};

const SKY_NAMES = [
  'track-sky-dome', 'biome-sky-dome', 'aaa-sky-dome',
  'storm-cloud-dome', 'track-starfield', 'track-nebula', 'track-aurora',
  'track-volumetric-clouds',
];

function hex(c) {
  return new THREE.Color(c);
}

function removeNamed(scene, name) {
  const o = scene.getObjectByName(name);
  if (!o) return;
  o.parent?.remove(o);
  o.geometry?.dispose?.();
  if (o.material) {
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    mats.forEach((m) => m.dispose?.());
  }
}

export function getTrackSkyPreset(arenaType) {
  if (isCosmicSkywayArena(arenaType)) return getCosmicTheme(arenaType).sky;
  return SKY_PRESETS[arenaType] || SKY_PRESETS.sunset_cove_01;
}

export function installTrackSky(scene, bounds, arenaType) {
  SKY_NAMES.forEach((name) => removeNamed(scene, name));

  const preset = getTrackSkyPreset(arenaType);
  const bg = hex(preset.horizon);
  scene.background = bg;
  const cosmicSky = isCosmicSkywayArena(arenaType);
  const fogNear = cosmicSky ? 95 : 70;
  const fogFar = cosmicSky ? 420 : 340;
  scene.fog = new THREE.Fog(preset.fog ?? bg.getHex(), fogNear, fogFar);

  const r = 900;
  const geo = new THREE.SphereGeometry(r, 32, 20);
  const top = hex(preset.top);
  const mid = hex(preset.mid);
  const hor = hex(preset.horizon);
  const colors = [];
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const t = Math.max(0, Math.min(1, (y / r + 1) * 0.5));
    const c = t < 0.45
      ? hor.clone().lerp(mid, t / 0.45)
      : mid.clone().lerp(top, (t - 0.45) / 0.55);
    colors.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const dome = new THREE.Mesh(
    geo,
    new THREE.MeshBasicMaterial({
      vertexColors: true,
      side: THREE.BackSide,
      fog: false,
      depthWrite: false,
    }),
  );
  dome.name = 'track-sky-dome';
  dome.renderOrder = -30;
  dome.frustumCulled = false;
  const cx = bounds?.cx ?? 0;
  const cz = bounds?.cz ?? 0;
  dome.position.set(cx, 0, cz);
  scene.add(dome);
  scene.userData.trackSkyDome = dome;
  scene.userData.customSky = true;

  // Cosmic Skyway kit provides its own nebula dome + stars — skip extra point cloud.
  if (arenaType === 'frost_peak_01') addAurora(scene, bounds);
  if (arenaType === 'thunder_ridge_01') addStormClouds(scene, bounds);
  if (arenaType === 'sunset_cove_01') addVolumetricClouds(scene, bounds);
  if (arenaType === 'candy_carnival_01') addCarnivalSkyDressing(scene, bounds);

  return dome;
}

function addVolumetricClouds(scene, bounds) {
  const g = new THREE.Group();
  g.name = 'track-volumetric-clouds';
  const cloudMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
    fog: false,
  });
  const spots = [
    { x: bounds.cx - 40, y: 28, z: bounds.cz - 30, s: 12 },
    { x: bounds.cx + 35, y: 32, z: bounds.cz - 45, s: 16 },
    { x: bounds.cx + 10, y: 26, z: bounds.cz + 40, s: 14 },
    { x: bounds.cx - 55, y: 30, z: bounds.cz + 20, s: 11 },
    { x: bounds.cx + 50, y: 34, z: bounds.cz + 5, s: 13 },
    { x: bounds.cx - 20, y: 27, z: bounds.cz - 55, s: 10 },
  ];
  spots.forEach((sp, ci) => {
    const cloud = new THREE.Group();
    cloud.userData.driftPhase = ci * 1.3;
    cloud.userData.baseY = sp.y;
    for (let i = 0; i < 5; i++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(sp.s * (0.25 + Math.random() * 0.2), 10, 8), cloudMat.clone());
      puff.position.set((Math.random() - 0.5) * sp.s, (Math.random() - 0.5) * sp.s * 0.3, (Math.random() - 0.5) * sp.s * 0.5);
      cloud.add(puff);
    }
    cloud.position.set(sp.x, sp.y, sp.z);
    g.add(cloud);
  });
  scene.add(g);
}

function addCarnivalSkyDressing(scene, bounds) {
  const g = new THREE.Group();
  g.name = 'track-carnival-sky';
  const puffColors = [0xff69b4, 0xffd700, 0x7ee8ff, 0xffffff];
  const spots = [
    { x: bounds.cx - 35, y: 30, z: bounds.cz - 40, s: 14 },
    { x: bounds.cx + 40, y: 34, z: bounds.cz - 25, s: 16 },
    { x: bounds.cx + 8, y: 28, z: bounds.cz + 45, s: 13 },
    { x: bounds.cx - 48, y: 32, z: bounds.cz + 15, s: 12 },
  ];
  spots.forEach((sp, ci) => {
    const cloud = new THREE.Group();
    cloud.userData.driftPhase = ci * 1.1;
    cloud.userData.baseY = sp.y;
    for (let i = 0; i < 5; i++) {
      const col = puffColors[i % puffColors.length];
      const puff = new THREE.Mesh(
        new THREE.SphereGeometry(sp.s * (0.22 + Math.random() * 0.18), 10, 8),
        new THREE.MeshBasicMaterial({
          color: col,
          transparent: true,
          opacity: 0.38,
          depthWrite: false,
          fog: false,
        }),
      );
      puff.position.set((Math.random() - 0.5) * sp.s, (Math.random() - 0.5) * sp.s * 0.3, (Math.random() - 0.5) * sp.s * 0.5);
      cloud.add(puff);
    }
    cloud.position.set(sp.x, sp.y, sp.z);
    g.add(cloud);
  });
  scene.add(g);
}

function addStarfield(scene, bounds, r) {
  const count = 400;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI * 0.5;
    const rad = r * 0.92;
    pos[i * 3] = bounds.cx + Math.cos(theta) * Math.sin(phi) * rad;
    pos[i * 3 + 1] = Math.cos(phi) * rad;
    pos[i * 3 + 2] = bounds.cz + Math.sin(theta) * Math.sin(phi) * rad;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const stars = new THREE.Points(geo, new THREE.PointsMaterial({
    color: 0xffffff, size: 0.8, transparent: true, opacity: 0.9, fog: false, depthWrite: false,
  }));
  stars.name = 'track-starfield';
  scene.add(stars);
}

function addNebula(scene, bounds) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(60, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.4),
    new THREE.MeshBasicMaterial({ color: 0xaa44ff, transparent: true, opacity: 0.12, side: THREE.BackSide, fog: false }),
  );
  mesh.position.set(bounds.cx + 30, 25, bounds.cz - 40);
  mesh.name = 'track-nebula';
  scene.add(mesh);
}

function addAurora(scene, bounds) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(bounds.spanX + 60, 20),
    new THREE.MeshBasicMaterial({ color: 0x44ffaa, transparent: true, opacity: 0.15, side: THREE.DoubleSide, fog: false }),
  );
  mesh.position.set(bounds.cx, 35, bounds.cz - bounds.spanZ * 0.4);
  mesh.rotation.x = -0.3;
  mesh.name = 'track-aurora';
  scene.add(mesh);
}

function addStormClouds(scene, bounds) {
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(220, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.32),
    new THREE.MeshBasicMaterial({
      color: 0x8aa0b8, transparent: true, opacity: 0.28, side: THREE.BackSide, fog: false, depthWrite: false,
    }),
  );
  mesh.position.set(bounds.cx, 40, bounds.cz);
  mesh.name = 'storm-cloud-dome';
  scene.add(mesh);
}

export function animateTrackSky(scene, time) {
  const aurora = scene.getObjectByName('track-aurora');
  if (aurora) aurora.material.opacity = 0.1 + Math.sin(time * 0.5) * 0.08;
  const storm = scene.getObjectByName('storm-cloud-dome');
  if (storm) storm.material.opacity = 0.2 + Math.sin(time * 0.3) * 0.08;
  const clouds = scene.getObjectByName('track-volumetric-clouds');
  if (clouds) {
    clouds.children.forEach((cloud) => {
      const ph = cloud.userData.driftPhase ?? 0;
      const baseY = cloud.userData.baseY ?? cloud.position.y;
      cloud.position.x += Math.sin(time * 0.08 + ph) * 0.02;
      cloud.position.y = baseY + Math.sin(time * 0.15 + ph) * 0.4;
    });
  }
  const carnivalSky = scene.getObjectByName('track-carnival-sky');
  if (carnivalSky) {
    carnivalSky.children.forEach((cloud) => {
      const ph = cloud.userData.driftPhase ?? 0;
      const baseY = cloud.userData.baseY ?? cloud.position.y;
      cloud.position.x += Math.sin(time * 0.1 + ph) * 0.025;
      cloud.position.y = baseY + Math.sin(time * 0.18 + ph) * 0.5;
      cloud.rotation.y = Math.sin(time * 0.05 + ph) * 0.04;
    });
  }
}
