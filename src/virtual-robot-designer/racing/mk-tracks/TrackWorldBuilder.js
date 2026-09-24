/**
 * TrackWorldBuilder.js — Builds rich themed worlds from TrackWorldRecipes.
 */
import * as THREE from 'three';
import { placeAtTrack } from '../GameWorldBuilder.js';
import { getBiomeAAASpec } from './BiomeAAAVisualSpec.js';
import { placeStartLineHeroes, alignVistaToStart } from './TrackStartHeroKit.js';
import { installSunsetCoveHeroKit } from './SunsetCoveHeroKit.js';
import { installCandyCarnivalHeroKit } from './CandyCarnivalHeroKit.js';
import { getTrackWorldRecipe } from './TrackWorldRecipes.js';
import { snapPropToRoad } from './TrackGroundSnap.js';
import { trackHasBundledAssets } from './TrackAssetManifest.js';
import { isCupTrack, blocksLaunchDriveLane } from './CodeRacerTrackStandards.js';
import { pbrMat } from './BiomeAAAKit.js';
import {
  buildPalmTree, buildBeachHut, buildTikiTorch, buildBeachUmbrella,
  buildFerrisWheel, buildCircusTent, buildMetroPillar, buildCastleTower,
  buildJungleTree, buildTemplePyramid, buildSnowPine, buildGear,
  buildHabitatDome, buildGiantDaisy, buildToadstool, buildWindmill,
  buildOceanPlane, buildCloudSea, buildEarthSphere, buildLavaRiver,
  buildLollipopPole, buildCandyCane, buildTicketBooth, buildCandyShop,
  buildCarouselHorse, buildNeonSign, buildMetroTrain, buildVinePillar,
  buildIcicleCluster, buildSkiLodge, buildFactoryPipe, buildFactoryWall, buildCraneHook,
  buildSatellite, buildGlassDeck, buildFairyCottage, buildLollipopTree,
  buildRedBarn, buildSeagull, buildButterfly,
} from './TrackPropBuilders.js';
import { buildAnimalStatue } from './RuinsHeroKit.js';
import { buildTempleGate } from './RuinsHeroKit.js';
import { buildLighthouse, buildDolphinLeap, scatterWildlife } from './BiomeLandmarkKit.js';
import { buildSkyscraper, buildHoloBillboard } from './CyberCityHeroKit.js';

const SCATTER_BUILDERS = {
  palm: () => buildPalmTree(1.25),
  hut: () => buildBeachHut(1.2),
  torch: () => buildTikiTorch(1.2),
  umbrella: () => buildBeachUmbrella(1.2),
  tent: () => buildCircusTent(1.2),
  lollipop: () => buildLollipopPole(1.25),
  candy_cane: () => buildCandyCane(1.2),
  pillar: () => buildMetroPillar(1.25),
  neon_sign: () => buildNeonSign(1.25),
  tower: () => buildCastleTower(1.0),
  jungle: () => buildJungleTree(1.2),
  vine_pillar: () => buildVinePillar(1.2),
  pine: () => buildSnowPine(1.25),
  icicle: () => buildIcicleCluster(1.2),
  gear: () => buildGear(1.0),
  factory_pipe: () => buildFactoryPipe(0.95),
  dome: () => buildHabitatDome(1.1),
  satellite: () => buildSatellite(1.2),
  daisy: () => buildGiantDaisy(1.2),
  toadstool: () => buildToadstool(1.25),
  lollipop_tree: () => buildLollipopTree(1.2),
  barn: () => buildRedBarn(1.2),
};

/** Unscaled kits so CUP_START_HEROES scale 1.8–3.0 lands at 8–14 m trees. */
const START_SCATTER_BUILDERS = {
  palm: () => buildPalmTree(1),
  hut: () => buildBeachHut(1),
  torch: () => buildTikiTorch(1),
  umbrella: () => buildBeachUmbrella(1),
  tent: () => buildCircusTent(1),
  lollipop: () => buildLollipopPole(1),
  candy_cane: () => buildCandyCane(1),
  pillar: () => buildMetroPillar(1),
  neon_sign: () => buildNeonSign(1),
  tower: () => buildCastleTower(1),
  jungle: () => buildJungleTree(1),
  vine_pillar: () => buildVinePillar(1),
  pine: () => buildSnowPine(1),
  icicle: () => buildIcicleCluster(1),
  gear: () => buildGear(1),
  factory_pipe: () => buildFactoryPipe(1),
  dome: () => buildHabitatDome(1),
  satellite: () => buildSatellite(1),
  daisy: () => buildGiantDaisy(1),
  toadstool: () => buildToadstool(1),
  lollipop_tree: () => buildLollipopTree(1),
  barn: () => buildRedBarn(1),
};

const BUILDING_BUILDERS = {
  beach_hut: () => buildBeachHut(0.95),
  lighthouse: () => buildLighthouse(),
  ticket_booth: () => buildTicketBooth(0.95),
  candy_shop: () => buildCandyShop(0.95),
  ferris_wheel: () => buildFerrisWheel(1),
  skyscraper: (opts) => buildSkyscraper(opts?.h ?? 28, opts?.accent ?? 0xff00ff),
  metro_train: () => buildMetroTrain(0.9),
  holo_billboard: () => buildHoloBillboard('NEON METRO'),
  castle_tower: () => buildCastleTower(0.85),
  temple_pyramid: () => buildTemplePyramid(1.15),
  temple_gate: () => buildTempleGate(),
  ski_lodge: () => buildSkiLodge(0.95),
  factory_wall: () => buildFactoryWall(0.9),
  crane: () => buildCraneHook(0.9),
  habitat_dome: () => buildHabitatDome(0.85),
  glass_deck: () => buildGlassDeck(0.95),
  fairy_cottage: () => buildFairyCottage(0.9),
  windmill: () => buildWindmill(0.9),
  barn: () => buildRedBarn(0.95),
};

const ANIMAL_BUILDERS = {
  seagull: () => buildSeagull(1),
  dolphin: () => buildDolphinLeap(0, 0),
  carousel_horse: () => buildCarouselHorse(0.9),
  statue_jaguar: () => buildAnimalStatue('jaguar'),
  statue_parrot: () => buildAnimalStatue('parrot'),
  statue_turtle: () => buildAnimalStatue('turtle'),
  butterfly: () => buildButterfly(1),
};

const VISTA_BUILDERS = {
  ocean: () => buildOceanPlane(220),
  cloud_sea: () => buildCloudSea(200),
  lava: () => buildLavaRiver(16, 32),
  earth: () => buildEarthSphere(45),
};

function roadY(curve, t) {
  return curve.getPointAt(t).y || 0;
}

function stripPointLights(obj) {
  if (!obj) return;
  const toRemove = [];
  obj.traverse((c) => { if (c.isPointLight) toRemove.push(c); });
  toRemove.forEach((l) => l.parent?.remove(l));
}

function placeOnTrack(world, curve, hw, scene, perf, { t, side = 1, off = 14, y = 0 }, obj) {
  const lateral = side * (hw + off);
  const { pos, frame } = placeAtTrack(curve, t, lateral, 0);
  obj.position.copy(pos);
  let baseY = roadY(curve, t);
  if (scene) baseY = snapPropToRoad(scene, pos.x, pos.z, baseY);
  obj.position.y = baseY + y;
  obj.rotation.y = frame.rot ?? 0;
  obj.userData.groundSnap = true;
  if (!perf?.torchLights) stripPointLights(obj);
  world.add(obj);
}

function extractPropMesh(prop) {
  if (prop.isMesh) return { geometry: prop.geometry, material: prop.material };
  let mesh = null;
  prop.traverse((c) => {
    if (c.isMesh && !mesh) mesh = c;
  });
  return mesh ? { geometry: mesh.geometry, material: mesh.material } : null;
}

function placeInstancedKey(world, key, placements) {
  const builder = SCATTER_BUILDERS[key];
  if (!builder || !placements.length) return;
  const template = builder();
  const extracted = extractPropMesh(template);
  if (!extracted) {
    placements.forEach((p) => {
      const prop = builder();
      prop.position.copy(p.pos);
      prop.rotation.y = p.rot;
      world.add(prop);
    });
    return;
  }
  const im = new THREE.InstancedMesh(extracted.geometry, extracted.material, placements.length);
  im.name = `prop-instanced-${key}`;
  im.userData.scatterKey = key;
  const m4 = new THREE.Matrix4();
  const pos = new THREE.Vector3();
  const quat = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  const euler = new THREE.Euler();
  template.updateMatrixWorld(true);
  const rootScale = template.scale;
  placements.forEach((p, i) => {
    pos.copy(p.pos);
    euler.set(0, p.rot, 0);
    quat.setFromEuler(euler);
    scale.set(rootScale.x, rootScale.y, rootScale.z);
    m4.compose(pos, quat, scale);
    im.setMatrixAt(i, m4);
  });
  im.instanceMatrix.needsUpdate = true;
  world.add(im);
}

/** Scenery budgets — full enough to feel like a world, mixed so it is not a copy-paste fence. */
function biomeSceneryPerf(perf, recipe, arenaType = '') {
  const buildingCount = recipe?.buildings?.length ?? 3;
  const animalCount = recipe?.animals?.length ?? 0;
  const tier = perf?.tier ?? 'medium';
  const cup = isCupTrack(arenaType);
  const scatterMin = cup ? 10 : (tier === 'high' ? 18 : tier === 'low' ? 10 : 14);
  return {
    ...perf,
    propMult: cup ? Math.max(perf?.propMult ?? 0.7, 0.85) : Math.max(perf?.propMult ?? 0.5, tier === 'low' ? 0.85 : 1),
    maxScatterPerSide: cup ? 10 : Math.max(perf?.maxScatterPerSide ?? scatterMin, scatterMin),
    maxBuildings: Math.min(Math.max(buildingCount, 3), cup ? 6 : (tier === 'low' ? 6 : 8)),
    maxAnimals: Math.min(Math.max(animalCount, 2), cup ? 5 : (tier === 'low' ? 4 : 6)),
    useInstancing: false,
  };
}

function scatterPropsAlongTrack(world, curve, hw, recipe, perf, scene, arenaType = '', finishT = 0) {
  const keys = recipe.scatter ?? [];
  if (!keys.length) return;
  const cup = isCupTrack(arenaType);
  const boosted = biomeSceneryPerf(perf, recipe, arenaType);
  const perSide = cup ? 10 : Math.max(10, boosted.maxScatterPerSide ?? Math.round(14 * (boosted.propMult ?? 1)));
  const maxTotal = cup ? 20 : perSide * 2;
  const step = cup
    ? (recipe.scatterStep ?? 0.1)
    : Math.min(recipe.scatterStep ?? 0.08, 0.9 / Math.max(16, maxTotal));
  const offset = recipe.scatterOffset ?? 12;
  const placementsByKey = {};
  let idx = 0;
  let leftCount = 0;
  let rightCount = 0;

  for (let t = 0.05; t < 0.95 && idx < maxTotal; t += step) {
    // Figure-8 crossover — keep midway clear so loops don't collide with scenery.
    if (arenaType === 'candy_carnival_01' && t > 0.43 && t < 0.57) {
      idx++;
      continue;
    }
    const key = keys[idx % keys.length];
    const side = idx % 2 ? 1 : -1;
    if (side > 0 && leftCount >= perSide) { idx++; continue; }
    if (side < 0 && rightCount >= perSide) { idx++; continue; }
    const lateral = side * (hw + offset + (idx % 3));
    const { pos, frame } = placeAtTrack(curve, t, lateral, 0);
    let y = roadY(curve, t);
    if (scene) y = snapPropToRoad(scene, pos.x, pos.z, y);
    if (!placementsByKey[key]) placementsByKey[key] = [];
    placementsByKey[key].push({
      pos: new THREE.Vector3(pos.x, y, pos.z),
      rot: frame.rot ?? 0,
    });
    if (side > 0) leftCount++;
    else rightCount++;
    idx++;
  }

  const useInstancing = false; // Full prop groups only — instancing used first mesh (brown cylinders)
  Object.entries(placementsByKey).forEach(([key, placements]) => {
    placements.forEach((p, i) => {
      const builder = SCATTER_BUILDERS[key];
      if (!builder) return;
      const prop = builder();
      const scaleMult = 1.25;
      prop.scale.multiplyScalar(scaleMult);
      prop.position.copy(p.pos);
      prop.rotation.y = p.rot;
      prop.name = `prop-${key}-${i}`;
      if (!boosted?.torchLights) stripPointLights(prop);
      world.add(prop);
    });
  });
}

function placeBuildings(world, curve, hw, recipe, scene, perf, finishT = 0) {
  const buildings = recipe.buildings ?? [];
  const cap = Math.min(buildings.length, perf?.maxBuildings ?? buildings.length);
  buildings.slice(0, cap).forEach((b) => {
    const off = b.off ?? 18;
    const lateral = b.side === 0 ? Math.abs(off) : hw + off;
    const span = b.type === 'ferris_wheel' ? 10 : b.type === 'temple_gate' ? 6 : 3;
    if (blocksLaunchDriveLane(b.t, finishT, hw, lateral, span)) return;
    const builder = BUILDING_BUILDERS[b.type];
    if (!builder) return;
    const obj = builder(b);
    obj.scale.multiplyScalar(1.15);
    placeOnTrack(world, curve, hw, scene, perf, {
      t: b.t,
      side: b.side ?? 1,
      off: b.off ?? 18,
      y: b.y ?? 0,
    }, obj);
  });
}

function placeAnimals(world, curve, hw, recipe, scene, perf, finishT = 0) {
  const animals = recipe.animals ?? [];
  const cap = Math.min(animals.length, perf?.maxAnimals ?? animals.length);
  animals.slice(0, cap).forEach((a) => {
    const off = a.off ?? 16;
    const lateral = a.side === 0 ? Math.abs(off) : hw + off;
    if (blocksLaunchDriveLane(a.t, finishT, hw, lateral, 2)) return;
    const builder = ANIMAL_BUILDERS[a.type];
    if (!builder) return;
    const obj = builder();
    placeOnTrack(world, curve, hw, scene, perf, {
      t: a.t,
      side: a.side ?? 1,
      off: a.off ?? 16,
      y: a.y ?? 0,
    }, obj);
  });
}

function addVista(world, bounds, recipe, arenaType) {
  if (!recipe?.vista) return;
  const builder = VISTA_BUILDERS[recipe.vista];
  if (!builder) return;

  if (recipe.vista === 'ocean') {
    const ocean = buildOceanPlane(520, { y: -0.38, shallowColor: 0x3ee8d8, depthColor: 0x0088bb });
    ocean.position.set(bounds.cx, 0, bounds.cz - 82);
    world.add(ocean);
    world.userData.vistaOcean = true;
    return;
  }

  if (recipe.vista === 'cloud_sea') {
    const clouds = builder();
    clouds.position.set(bounds.cx, 0, bounds.cz - 45);
    world.add(clouds);
    return;
  }

  const vista = builder();
  if (recipe.vista === 'earth') {
    vista.position.set(bounds.cx, -8, bounds.cz - 55);
  } else if (recipe.vista === 'lava') {
    vista.position.set(bounds.cx - 40, -1.8, bounds.cz);
  } else {
    vista.position.set(bounds.cx, 0, bounds.cz);
  }
  world.add(vista);
}

function addGroundDisc(world, arenaType, recipe, bounds) {
  const spec = getBiomeAAASpec(arenaType);
  const groundColor = spec?.ground ?? 0x556b2f;

  if (recipe?.vista === 'ocean') {
    // Irregular dune berms — not a tan disc under the kart.
    const berms = [
      [0, 10, 18, 12],
      [16, 4, 11, 8],
      [-14, 8, 12, 9],
      [8, -6, 10, 7],
    ];
    berms.forEach(([sx, sz, rx, rz], i) => {
      const berm = new THREE.Mesh(
        new THREE.SphereGeometry(1, 12, 8),
        pbrMat(i % 2 ? 0xf0d4a0 : 0xe8c992, { roughness: 0.95 }),
      );
      berm.scale.set(rx, 0.55, rz);
      berm.position.set(bounds.cx + sx, -0.28, bounds.cz + sz);
      berm.name = 'track-beach-berm';
      berm.receiveShadow = true;
      world.add(berm);
    });

    const wetEdge = new THREE.Mesh(
      new THREE.PlaneGeometry(160, 36, 1, 1),
      pbrMat(0x48d4c8, { roughness: 0.55, metalness: 0.2, emi: 0.08 }),
    );
    wetEdge.rotation.x = -Math.PI / 2;
    wetEdge.position.set(bounds.cx, -0.04, bounds.cz - 10);
    wetEdge.name = 'track-beach-wet';
    world.add(wetEdge);
    addThemedAtmosphere(world, arenaType, bounds);
    return;
  }

  if (recipe?.vista === 'cloud_sea') {
    const island = new THREE.Mesh(
      new THREE.CircleGeometry(50, 40),
      pbrMat(groundColor, { roughness: 0.86 }),
    );
    island.rotation.x = -Math.PI / 2;
    island.position.set(bounds.cx, -0.1, bounds.cz);
    island.name = 'track-ground-disc';
    island.receiveShadow = true;
    world.add(island);
    addThemedAtmosphere(world, arenaType, bounds);
    return;
  }

  if (recipe?.vista === 'lava') {
    const pad = new THREE.Mesh(
      new THREE.CircleGeometry(48, 40),
      pbrMat(0x3a2a22, { roughness: 0.92, emi: 0.04 }),
    );
    pad.rotation.x = -Math.PI / 2;
    pad.position.set(bounds.cx, -0.1, bounds.cz + 8);
    pad.name = 'track-ground-disc';
    world.add(pad);
    const glow = new THREE.Mesh(
      new THREE.RingGeometry(50, 78, 40),
      pbrMat(0xff4500, { roughness: 0.7, emi: 0.1 }),
    );
    glow.rotation.x = -Math.PI / 2;
    glow.position.set(bounds.cx, -0.08, bounds.cz - 18);
    glow.name = 'track-lava-glow-ring';
    world.add(glow);
    addLavaCracks(world, bounds);
    addThemedAtmosphere(world, arenaType, bounds);
    return;
  }

  if (recipe?.vista === 'earth') {
    const deck = new THREE.Mesh(
      new THREE.CircleGeometry(52, 36),
      pbrMat(0x12101c, { roughness: 0.85, metalness: 0.15 }),
    );
    deck.rotation.x = -Math.PI / 2;
    deck.position.set(bounds.cx, -0.1, bounds.cz);
    deck.name = 'track-ground-disc';
    world.add(deck);
    addCyanGrid(world, bounds);
    addThemedAtmosphere(world, arenaType, bounds);
    return;
  }

  const radiusByTrack = {
    candy_carnival_01: 26,
    neon_metro_01: 42,
    jungle_ruins_01: 48,
    frost_peak_01: 46,
    fairy_glen_01: 44,
    thunder_ridge_01: 48,
  };
  const minRadius = radiusByTrack[arenaType] ?? 48;
  const boundsRadius = Math.max(bounds?.spanX ?? 0, bounds?.spanZ ?? 0) * 0.58 + 10;
  const radius = Math.max(minRadius, boundsRadius);
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 44),
    pbrMat(groundColor, { roughness: 0.9 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(bounds.cx, -0.1, bounds.cz);
  ground.name = 'track-ground-disc';
  ground.receiveShadow = true;
  world.add(ground);

  if (arenaType === 'candy_carnival_01') addCandyStars(world, bounds);
  addThemedAtmosphere(world, arenaType, bounds);
}

function addCandyStars(world, bounds) {
  const g = new THREE.Group();
  g.name = 'candy-star-decals';
  for (let i = 0; i < 18; i++) {
    const star = new THREE.Mesh(
      new THREE.CircleGeometry(0.55, 5),
      pbrMat(0xffd700, { emi: 0.55, roughness: 0.4 }),
    );
    star.rotation.x = -Math.PI / 2;
    star.position.set(
      bounds.cx + (Math.random() - 0.5) * 36,
      -0.04,
      bounds.cz + (Math.random() - 0.5) * 36,
    );
    g.add(star);
  }
  world.add(g);
}

function addLavaCracks(world, bounds) {
  const g = new THREE.Group();
  g.name = 'lava-glow-cracks';
  for (let i = 0; i < 10; i++) {
    const crack = new THREE.Mesh(
      new THREE.PlaneGeometry(6 + Math.random() * 8, 0.35),
      pbrMat(0xff4500, { emi: 0.7, roughness: 0.6 }),
    );
    crack.rotation.x = -Math.PI / 2;
    crack.rotation.z = Math.random() * Math.PI;
    crack.position.set(
      bounds.cx + (Math.random() - 0.5) * 40,
      -0.02,
      bounds.cz + (Math.random() - 0.5) * 40,
    );
    g.add(crack);
  }
  world.add(g);
}

function addCyanGrid(world, bounds) {
  const g = new THREE.Group();
  g.name = 'station-cyan-grid';
  const mat = pbrMat(0x00ffff, { emi: 0.35, roughness: 0.3, transparent: true, opacity: 0.35 });
  for (let i = -4; i <= 4; i++) {
    const h = new THREE.Mesh(new THREE.PlaneGeometry(70, 0.08), mat);
    h.rotation.x = -Math.PI / 2;
    h.position.set(bounds.cx, -0.02, bounds.cz + i * 8);
    g.add(h);
    const v = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 70), mat);
    v.rotation.x = -Math.PI / 2;
    v.position.set(bounds.cx + i * 8, -0.02, bounds.cz);
    g.add(v);
  }
  world.add(g);
}

function glowMat(color, opacity = 1) {
  return new THREE.MeshBasicMaterial({
    color, transparent: opacity < 1, opacity, side: THREE.DoubleSide, depthWrite: opacity >= 1, fog: false,
  });
}

/** Wormhole, asteroid belt, planet below and galaxy burst for the cosmic skyway. */
function addCosmicSkywayVista(world, bounds) {
  const g = new THREE.Group();
  g.name = 'cosmic-skyway-vista';
  const { cx, cz } = bounds;

  const wormhole = new THREE.Group();
  wormhole.name = 'cosmic-wormhole';
  [0x7a2cff, 0x9d4dff, 0xc07bff, 0xe6c8ff].forEach((color, i) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(16 - i * 3.4, 1.1 - i * 0.15, 12, 64), glowMat(color, 0.85 - i * 0.1));
    ring.position.z = -i * 2.5;
    wormhole.add(ring);
  });
  const core = new THREE.Mesh(new THREE.CircleGeometry(5, 32), glowMat(0xffffff, 0.9));
  core.position.z = -10;
  wormhole.add(core);
  const frame = new THREE.Mesh(new THREE.TorusGeometry(18.5, 1.6, 10, 48), pbrMat(0x2a2f3a, { emi: 0.05, roughness: 0.4, metalness: 0.9 }));
  wormhole.add(frame);
  wormhole.position.set(cx - 30, 30, cz - 85);
  wormhole.lookAt(cx, 12, cz);
  g.add(wormhole);

  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(70, 48, 32),
    new THREE.MeshStandardMaterial({ color: 0x2a6fd6, emissive: 0x0b2a66, emissiveIntensity: 0.6, roughness: 0.8 }),
  );
  planet.name = 'cosmic-planet';
  planet.position.set(cx + 70, -95, cz + 60);
  g.add(planet);
  const atmo = new THREE.Mesh(new THREE.SphereGeometry(74, 48, 32), glowMat(0x66ccff, 0.18));
  atmo.position.copy(planet.position);
  g.add(atmo);

  const burst = new THREE.Group();
  burst.name = 'cosmic-galaxy-burst';
  burst.add(new THREE.Mesh(new THREE.CircleGeometry(6, 32), glowMat(0xfff2c0, 0.95)));
  [[0xffa040, 14, 0.45], [0xff5aa8, 24, 0.25], [0x8a4dff, 36, 0.15]].forEach(([color, r, o]) => {
    burst.add(new THREE.Mesh(new THREE.CircleGeometry(r, 32), glowMat(color, o)));
  });
  for (let i = 0; i < 12; i++) {
    const ray = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 60), glowMat(0xffd08a, 0.35));
    ray.rotation.z = (i / 12) * Math.PI;
    burst.add(ray);
  }
  burst.position.set(cx + 60, 45, cz - 110);
  burst.lookAt(cx, 12, cz);
  g.add(burst);

  const rockMat = pbrMat(0x5a5048, { roughness: 0.95, metalness: 0.1 });
  const rockGeo = new THREE.DodecahedronGeometry(1, 1);
  const count = 60;
  const rocks = new THREE.InstancedMesh(rockGeo, rockMat, count);
  rocks.name = 'prop-instanced-asteroids';
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 75 + Math.random() * 40;
    const s = 1.5 + Math.random() * 4;
    e.set(Math.random() * 3, Math.random() * 3, Math.random() * 3);
    q.setFromEuler(e);
    m.compose(
      new THREE.Vector3(cx + Math.cos(a) * r, 4 + Math.random() * 30, cz + Math.sin(a) * r),
      q,
      new THREE.Vector3(s, s * (0.7 + Math.random() * 0.5), s),
    );
    rocks.setMatrixAt(i, m);
  }
  g.add(rocks);

  const nebula = new THREE.Mesh(new THREE.PlaneGeometry(160, 60), glowMat(0x6a2cc8, 0.12));
  nebula.position.set(cx - 70, 40, cz - 90);
  nebula.lookAt(cx, 20, cz);
  g.add(nebula);

  world.add(g);
}

function addThemedAtmosphere(world, arenaType, bounds) {
  if (arenaType === 'frost_peak_01') {
    const aurora = new THREE.Group();
    aurora.name = 'frost-aurora';
    aurora.userData.animated = true;
    [0x44ff88, 0xaa66ff, 0x66ffcc].forEach((color, i) => {
      const plane = new THREE.Mesh(
        new THREE.PlaneGeometry(80, 18),
        new THREE.MeshBasicMaterial({
          color, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false, fog: false,
        }),
      );
      plane.position.set(bounds.cx + (i - 1) * 18, 40, bounds.cz - 30);
      plane.rotation.y = 0.4 + i * 0.2;
      plane.userData.aurora = true;
      aurora.add(plane);
    });
    world.add(aurora);
  }

  if (arenaType === 'star_station_01') {
    const count = 200;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.55;
      const r = 70;
      positions[i * 3] = bounds.cx + Math.cos(theta) * Math.sin(phi) * r;
      positions[i * 3 + 1] = 8 + Math.cos(phi) * r * 0.55;
      positions[i * 3 + 2] = bounds.cz + Math.sin(theta) * Math.sin(phi) * r;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const stars = new THREE.Points(
      geo,
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.45, transparent: true, opacity: 0.9, depthWrite: false }),
    );
    stars.name = 'star-station-starfield';
    world.add(stars);
    addCosmicSkywayVista(world, bounds);
  }

  if (arenaType === 'thunder_ridge_01') {
    const clouds = new THREE.Group();
    clouds.name = 'storm-cloud-bank';
    clouds.userData.animated = true;
    for (let i = 0; i < 3; i++) {
      const cloud = new THREE.Mesh(
        new THREE.PlaneGeometry(70, 16),
        new THREE.MeshBasicMaterial({
          color: 0x1a2030, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false,
        }),
      );
      cloud.position.set(bounds.cx + (i - 1) * 22, 35, bounds.cz - 20 + i * 8);
      cloud.rotation.x = 0.15;
      clouds.add(cloud);
    }
    const flash = new THREE.PointLight(0xffffff, 0, 80, 1.4);
    flash.name = 'thunder-flash-light';
    flash.position.set(bounds.cx, 28, bounds.cz);
    clouds.add(flash);
    world.add(clouds);
    world.userData.thunderStorm = true;
  }
}

/** Count placed scenery (primitives + glTF instances). */
export function countTrackWorldProps(world) {
  if (!world) return 0;
  let n = 0;
  world.traverse((c) => {
    if (c.isInstancedMesh && (c.name?.startsWith('gltf-instanced-') || c.name?.startsWith('prop-instanced-'))) {
      n += c.count;
      return;
    }
    if (
      c.name?.startsWith('prop-')
      || c.name?.startsWith('gltf-')
      || c.name?.startsWith('prop-instanced-')
      || c.name?.startsWith('prop-start-')
      || c.name?.startsWith('gltf-start-')
    ) {
      n += 1;
    }
  });
  return n;
}

/** Build ground + vista only (scenery placed after road mesh exists). */
export function buildTrackWorld(world, curve, hw, bounds, arenaType, perf, scene, finishT = 0) {
  const recipe = getTrackWorldRecipe(arenaType);
  if (!recipe) return;

  const useBackdrop = scene?.userData?.useReferenceBackdrop;
  if (!useBackdrop) {
    addGroundDisc(world, arenaType, recipe, bounds);
    addVista(world, bounds, recipe, arenaType);
  }
  if (finishT != null && recipe.vista && !useBackdrop) {
    alignVistaToStart(world, curve, finishT, hw, recipe);
  }

  world.userData.trackRecipe = arenaType;
  world.userData.sceneryPending = true;
}

/** Place trees, buildings, animals — call after raceRoadMesh exists. glTF is additive only. */
export function populateTrackScenery(world, curve, hw, bounds, arenaType, perf, scene, finishT = 0) {
  const recipe = getTrackWorldRecipe(arenaType);
  if (!recipe) return 0;

  const boosted = biomeSceneryPerf(perf, recipe, arenaType);
  const hasBundled = trackHasBundledAssets(arenaType);

  if (!scene?.userData?.useReferenceBackdrop && recipe.vista) {
    alignVistaToStart(world, curve, finishT, hw, recipe);
  }

  if (scene?.userData?.useReferenceBackdrop) {
    world.userData.awaitGltfScenery = false;
    world.userData.sceneryPending = false;
    world.userData.sceneryPopulated = true;
    if (scene) scene.userData.sceneryPopulated = true;
    return countTrackWorldProps(world);
  }

  if (arenaType === 'sunset_cove_01') {
    installSunsetCoveHeroKit(world, curve, hw, scene, finishT);
  } else if (arenaType === 'candy_carnival_01') {
    installCandyCarnivalHeroKit(world, curve, hw, scene, finishT);
  } else {
    placeStartLineHeroes(world, curve, hw, arenaType, finishT, scene, boosted, {
      scatterBuilders: START_SCATTER_BUILDERS,
      buildingBuilders: BUILDING_BUILDERS,
      animalBuilders: ANIMAL_BUILDERS,
      placeOnTrack,
    });
  }
  placeBuildings(world, curve, hw, recipe, scene, boosted, finishT);
  placeAnimals(world, curve, hw, recipe, scene, boosted, finishT);
  scatterPropsAlongTrack(world, curve, hw, recipe, boosted, scene, arenaType, finishT);
  if (recipe.wildlife) {
    const count = Math.max(2, Math.round((recipe.wildlife.count ?? 4) * (boosted?.propMult ?? 1)));
    scatterWildlife(world, bounds, recipe.wildlife.type, count);
  }

  world.userData.awaitGltfScenery = !!hasBundled && !isCupTrack(arenaType);
  world.userData.sceneryPending = false;
  world.userData.sceneryPopulated = true;
  if (scene) scene.userData.sceneryPopulated = true;

  const propCount = countTrackWorldProps(world);
  const target = 20;
  console.log('[TrackWorld]', arenaType, {
    mode: 'scenery-populated',
    props: propCount,
    scatter: recipe.scatter?.length,
    buildings: recipe.buildings?.length,
    animals: recipe.animals?.length,
    vista: recipe.vista,
    tier: perf?.tier,
    target,
    ok: propCount >= target,
  });
  return propCount;
}

export function animateTrackWorld(world, time) {
  world.traverse((obj) => {
    if (obj.name === 'prop-ferris-wheel') {
      const spin = obj.getObjectByName('ferris-wheel-spin');
      if (spin) spin.rotation.z = time * 0.35;
      else obj.rotation.y = time * 0.1;
    }
    if (obj.name === 'prop-gear') obj.rotation.z = time * 0.5;
    if (obj.name?.includes('windmill')) {
      const blades = obj.getObjectByName('windmill-blades');
      if (blades) blades.rotation.z = time * 0.6;
      else obj.rotation.y = time * 0.04;
    }
    if (obj.name === 'prop-seagull' && obj.userData.animated) {
      const ph = obj.userData.bobPhase ?? 0;
      obj.position.y += Math.sin(time * 2 + ph) * 0.02;
      const wl = obj.getObjectByName('wing-l');
      const wr = obj.getObjectByName('wing-r');
      if (wl) wl.rotation.z = Math.sin(time * 8 + ph) * 0.4;
      if (wr) wr.rotation.z = -Math.sin(time * 8 + ph) * 0.4;
    }
    if (obj.name === 'prop-butterfly' && obj.userData.drift) {
      obj.position.y += Math.sin(time * 3 + obj.id) * 0.015;
      obj.rotation.y = time * 0.5;
    }
    if (obj.name === 'lava-river' && obj.children[0]?.material) {
      obj.children[0].material.emissiveIntensity = 0.7 + Math.sin(time * 2.5) * 0.25;
    }
    if (obj.name === 'ocean-plane' && obj.children[0]?.material) {
      obj.children[0].material.emissiveIntensity = 0.12 + Math.sin(time) * 0.06;
    }
    if (obj.userData?.animated && obj.name === 'prop-tiki-torch') {
      const flame = obj.children[1];
      if (flame?.material) flame.material.emissiveIntensity = 0.9 + Math.sin(time * 4) * 0.4;
    }
    if (obj.name === 'frost-aurora') {
      obj.children.forEach((plane, i) => {
        if (plane.material) plane.material.opacity = 0.14 + Math.sin(time * 0.4 + i) * 0.08;
        plane.rotation.y += 0.0008;
      });
    }
    if (obj.name === 'storm-cloud-bank') {
      obj.children.forEach((c) => {
        if (c.isMesh) c.position.x += Math.sin(time * 0.15 + c.id) * 0.02;
      });
      const flash = obj.getObjectByName('thunder-flash-light');
      if (flash) {
        const cycle = time % 8;
        flash.intensity = cycle < 0.12 ? 18 : 0;
      }
    }
    if (obj.userData?.drift) {
      obj.position.x += Math.sin(time * obj.userData.drift + obj.id) * 0.02;
      obj.position.z += Math.cos(time * obj.userData.drift * 0.7) * 0.02;
    }
  });
}
