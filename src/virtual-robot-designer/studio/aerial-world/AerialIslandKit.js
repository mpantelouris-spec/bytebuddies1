/**
 * AerialIslandKit — floating mesa + citadel islands with rich detail.
 */
import * as THREE from 'three';
import {
  rockSandstoneMat, rockWarmMat, rockDarkMat, rockMossMat,
  grassMat, grassLightMat, waterMat, vineMat,
} from './AerialMaterials.js';
import { buildFloatingIslandDetailed, buildTinyCastle } from '../../racing/mk-tracks/SkyGardenHeroKit.js';
import { buildCastleTower, buildTemplePyramid, buildJungleTree } from '../../racing/mk-tracks/TrackPropBuilders.js';
import { buildTempleGate } from '../../racing/mk-tracks/RuinsHeroKit.js';
import { buildCloudSea } from '../../racing/mk-tracks/MK8TrackQualityKit.js';
import { arenaMover } from '../ArenaBuilderCore.js';

/** Grass disc on top of floating islands. */
function buildGrassCap(radius, y) {
  const g = new THREE.Group();
  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius * 1.05, 0.6, 16),
    grassMat(),
  );
  disc.position.y = y;
  g.add(disc);
  for (let i = 0; i < 8; i++) {
    const tuft = new THREE.Mesh(
      new THREE.ConeGeometry(0.25 + Math.random() * 0.2, 0.8 + Math.random() * 0.5, 5),
      grassLightMat(),
    );
    const a = (i / 8) * Math.PI * 2 + Math.random() * 0.4;
    tuft.position.set(Math.cos(a) * (radius * 0.6 + Math.random()), y + 0.4, Math.sin(a) * (radius * 0.6 + Math.random()));
    g.add(tuft);
  }
  return g;
}

/** Mini waterfall streaming down from island. */
function buildWaterfall(h, x, z) {
  const g = new THREE.Group();
  const stream = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.15, h, 8, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0x60a5fa, emissive: 0x3b82f6, emissiveIntensity: 0.25,
      transparent: true, opacity: 0.55, roughness: 0.15, metalness: 0.05, side: THREE.DoubleSide,
    }),
  );
  stream.position.set(x, -h * 0.5, z);
  g.add(stream);
  const splash = new THREE.Mesh(
    new THREE.SphereGeometry(0.7, 8, 6),
    new THREE.MeshBasicMaterial({ color: 0x93c5fd, transparent: true, opacity: 0.35, depthWrite: false }),
  );
  splash.position.set(x, -h, z);
  g.add(splash);
  return g;
}

/** Small bush / shrub for island decoration. */
function buildBush(scale = 1) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: 0x4a8c3f, roughness: 0.92, metalness: 0, flatShading: true });
  [0.8, 1.0, 0.7].forEach((s, i) => {
    const leaf = new THREE.Mesh(new THREE.DodecahedronGeometry(s * scale, 0), mat);
    leaf.position.set((i - 1) * 0.4 * scale, 0.4 * scale, (i % 2) * 0.3 * scale);
    g.add(leaf);
  });
  return g;
}

/** Hanging vine tendril beneath islands. */
function buildVines(radius, y, count = 5) {
  const g = new THREE.Group();
  const mat = vineMat();
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + Math.random();
    const len = 3 + Math.random() * 5;
    const vine = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.04, len, 4),
      mat,
    );
    vine.position.set(Math.cos(a) * radius * 0.8, y - len * 0.5, Math.sin(a) * radius * 0.8);
    g.add(vine);
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.15, 4, 3), mat);
    leaf.position.set(vine.position.x, y - len, vine.position.z);
    g.add(leaf);
  }
  return g;
}

/** Tall floating pillar with grass cap, castle, vegetation, and waterfall. */
export function buildFloatingCitadelIsland(scale = 1) {
  const g = new THREE.Group();
  g.name = 'aerial-citadel-island';

  const pillarH = 38 * scale;
  const pillar = new THREE.Mesh(
    new THREE.CylinderGeometry(3.5 * scale, 5.5 * scale, pillarH, 12, 4, false),
    rockSandstoneMat(),
  );
  pillar.position.y = pillarH * 0.5;
  g.add(pillar);

  // Staggered rock chunks for irregular silhouette
  for (let i = 0; i < 8; i++) {
    const chunk = new THREE.Mesh(
      new THREE.DodecahedronGeometry(1.2 + Math.random() * 1.8, 0),
      (i % 3 === 0) ? rockMossMat() : ((i % 2) ? rockWarmMat() : rockSandstoneMat()),
    );
    const a = (i / 8) * Math.PI * 2;
    chunk.position.set(Math.cos(a) * (4.2 + Math.random()) * scale, 6 + i * 4.2, Math.sin(a) * (4.2 + Math.random()) * scale);
    chunk.scale.set(1.1 + Math.random() * 0.4, 1.5 + Math.random() * 0.8, 1.1 + Math.random() * 0.4);
    chunk.rotation.set(Math.random() * 0.3, Math.random() * Math.PI, Math.random() * 0.3);
    g.add(chunk);
  }

  // Grass cap
  const cap = buildGrassCap(6 * scale, pillarH);
  g.add(cap);

  const island = buildFloatingIslandDetailed(6 * scale);
  island.position.y = pillarH - 2;
  g.add(island);

  // Waterfall
  const wf = buildWaterfall(pillarH * 0.6 * scale, 3.5 * scale, 0);
  wf.position.y = pillarH;
  g.add(wf);

  // Vines hanging below
  g.add(buildVines(5 * scale, pillarH * 0.35, 6));

  const castle = buildCastleTower(1.6 * scale);
  castle.position.set(-4 * scale, pillarH + 2, 2 * scale);
  g.add(castle);

  const palace = buildTempleGate();
  palace.scale.setScalar(0.55 * scale);
  palace.position.set(5 * scale, pillarH + 1, -3 * scale);
  palace.rotation.y = 0.4;
  g.add(palace);

  const pyramid = buildTemplePyramid(1.1 * scale);
  pyramid.position.set(-8 * scale, pillarH - 1, -6 * scale);
  g.add(pyramid);

  // Trees + bushes on top
  for (let t = 0; t < 5; t++) {
    const tree = buildJungleTree(0.7 * scale);
    const a = (t / 5) * Math.PI * 2;
    tree.position.set(Math.cos(a) * 5 * scale, pillarH, Math.sin(a) * 5 * scale);
    g.add(tree);
  }
  for (let b = 0; b < 4; b++) {
    const bush = buildBush(0.7 * scale);
    const a = (b / 4) * Math.PI * 2 + 0.4;
    bush.position.set(Math.cos(a) * 3.5 * scale, pillarH + 0.2, Math.sin(a) * 3.5 * scale);
    g.add(bush);
  }

  g.userData.bobPhase = Math.random() * Math.PI * 2;
  return g;
}

/** Smaller rock spire with optional castle, moss, and vines. */
export function buildFloatingRockSpire(scale = 1, withCastle = false) {
  const g = new THREE.Group();
  g.name = 'aerial-rock-spire';
  const h = 22 * scale;

  // Multi-segment pillar for variety
  const spire = new THREE.Mesh(
    new THREE.CylinderGeometry(2 * scale, 4 * scale, h, 10, 3, false),
    rockSandstoneMat(),
  );
  spire.position.y = h * 0.5;
  g.add(spire);

  // Moss patches
  for (let m = 0; m < 3; m++) {
    const patch = new THREE.Mesh(
      new THREE.DodecahedronGeometry(1.2 * scale, 0),
      rockMossMat(),
    );
    const a = (m / 3) * Math.PI * 2;
    patch.position.set(Math.cos(a) * 2.5 * scale, h * 0.4 + m * 3, Math.sin(a) * 2.5 * scale);
    g.add(patch);
  }

  const capG = buildGrassCap(3.5 * scale, h - 0.5);
  g.add(capG);

  const cap = buildFloatingIslandDetailed(3.5 * scale);
  cap.position.y = h - 1;
  g.add(cap);

  // Vines
  g.add(buildVines(3 * scale, h * 0.25, 3));

  if (withCastle) {
    const c = buildTinyCastle();
    c.scale.setScalar(1.4 * scale);
    c.position.y = h + 2;
    g.add(c);
  } else {
    // Bush cluster
    const bush = buildBush(0.6 * scale);
    bush.position.y = h + 0.2;
    g.add(bush);
  }
  g.userData.bobPhase = Math.random() * Math.PI * 2;
  return g;
}

/** Dense cloud sea + warm golden haze. */
export function installAerialCloudSea(scene, bounds, baseY = -48) {
  const g = buildCloudSea(bounds, 28);
  g.traverse((o) => {
    if (o.isMesh && o.material) {
      o.material.opacity = Math.min(o.material.opacity ?? 0.5, 0.42);
      o.material.fog = true;
    }
  });
  g.name = 'aerial-cloud-sea';
  g.position.y = baseY + 22;
  scene.add(g);

  // Warm golden haze layer
  const haze = new THREE.Mesh(
    new THREE.PlaneGeometry(bounds.spanX + 200, bounds.spanZ + 200),
    new THREE.MeshBasicMaterial({
      color: 0xffe8c8, transparent: true, opacity: 0.08, depthWrite: false, fog: true,
    }),
  );
  haze.rotation.x = -Math.PI / 2;
  haze.position.set(bounds.cx, baseY + 35, bounds.cz);
  haze.name = 'aerial-sun-haze';
  scene.add(haze);

  // Scattered cloud puffs near route
  const nearClouds = new THREE.Group();
  nearClouds.name = 'aerial-near-clouds';
  for (let i = 0; i < 12; i++) {
    const puff = new THREE.Mesh(
      new THREE.SphereGeometry(4 + Math.random() * 6, 10, 8),
      new THREE.MeshBasicMaterial({
        color: 0xffffff, transparent: true, opacity: 0.12 + Math.random() * 0.08,
        depthWrite: false, fog: true,
      }),
    );
    puff.position.set(
      bounds.cx + (Math.random() - 0.5) * bounds.spanX * 0.8,
      baseY + 30 + Math.random() * 20,
      bounds.cz + (Math.random() - 0.5) * bounds.spanZ * 0.8,
    );
    puff.scale.set(1 + Math.random() * 0.5, 0.4 + Math.random() * 0.3, 1 + Math.random() * 0.5);
    nearClouds.add(puff);
  }
  scene.add(nearClouds);
}

/** Place hero floating islands along aerial route. */
export function scatterAerialIslands(scene, curve, recipe, bounds) {
  const g = new THREE.Group();
  g.name = 'AerialFloatingIslands';
  scene.add(g);

  const placements = recipe.islandScatter || [
    { t: 0.08, side: -1, off: 42, yOff: -14, hero: true },
    { t: 0.22, side: 1, off: 48, yOff: -20, hero: true },
    { t: 0.38, side: -1, off: 38, yOff: -10, spire: true, castle: true },
    { t: 0.52, side: 1, off: 44, yOff: -16, hero: true },
    { t: 0.68, side: -1, off: 36, yOff: -12, spire: true },
    { t: 0.82, side: 1, off: 50, yOff: -18, hero: true },
    { t: 0.15, side: 1, off: 28, yOff: -25, spire: true },
    { t: 0.45, side: -1, off: 55, yOff: -22, spire: true, castle: true },
    { t: 0.75, side: -1, off: 30, yOff: -28, spire: true },
    { t: 0.05, side: -1, off: 18, yOff: -8, spire: true },
    { t: 0.35, side: 1, off: 22, yOff: -6, spire: true, castle: true },
    { t: 0.60, side: -1, off: 20, yOff: -30, spire: true },
    { t: 0.90, side: 1, off: 35, yOff: -15, spire: true },
  ];

  placements.forEach((pl, i) => {
    const p = curve.getPoint(pl.t);
    const tan = curve.getTangent(pl.t).normalize();
    const yaw = Math.atan2(tan.x, tan.z);
    const side = pl.side ?? (i % 2 === 0 ? -1 : 1);
    const off = pl.off ?? 35;
    const lx = p.x + Math.cos(yaw) * side * off;
    const lz = p.z - Math.sin(yaw) * side * off;
    const islandScale = pl.hero
      ? 0.85 + (i % 3) * 0.08
      : 0.7 + (i % 2) * 0.15;
    const topHeight = (pl.hero ? 38 : 22) * islandScale;
    // Placement yOff describes the island cap relative to the flight path.
    // The old code treated it as the pillar base, lifting giant columns into
    // the cockpit view and making the world look like primitive obstacles.
    const ly = p.y + (pl.yOff ?? -12) - topHeight;

    const island = pl.hero
      ? buildFloatingCitadelIsland(islandScale)
      : buildFloatingRockSpire(islandScale, pl.castle);

    island.position.set(lx, ly, lz);
    island.rotation.y = yaw + (side > 0 ? -0.35 : 0.35);
    island.userData.hero = pl.hero;
    island.userData.baseY = ly;
    g.add(island);

    arenaMover(scene, (time) => {
      const ph = island.userData.bobPhase ?? 0;
      island.position.y = ly + Math.sin(time * 0.35 + ph) * 0.6;
    });
  });

  installAerialCloudSea(scene, bounds, recipe.vista?.y ?? -48);
  return g;
}
