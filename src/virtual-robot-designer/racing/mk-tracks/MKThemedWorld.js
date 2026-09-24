/**
 * MKThemedWorld.js — Distinct 3D scenery per MK circuit (12 unique looks).
 */
import * as THREE from 'three';
import { placeAtTrack, scatterCollectiblesAlongTrack, updateCollectibleAnimations } from '../GameWorldBuilder.js';
import { buildCodeRacerCollectibles, tickCodeRacerCollectibles } from '../CodeRacerWorldKit.js';
import {
  buildSpaceSkybox, buildStarParticles, buildNebulaSprites,
  buildRingedPlanet, buildMoon, buildAsteroidField,
} from '../RainbowRoadEnvironment.js';
import { buildColorfulGemStars } from '../RainbowRoadVisuals.js';
import { getMKVisual } from './MKTrackVisualSpec.js';
import { getBiomeAAASpec } from './BiomeAAAVisualSpec.js';
import { buildLuigiCircuitWorld } from './LuigiCircuitWorld.js';
import { buildMooMooMeadowsWorld } from './MooMooMeadowsWorld.js';
import { buildMarioCircuitWorld } from './MarioCircuitWorld.js';
import { buildBiomeWorld, isBiomeArena } from './BiomeWorldBuilder.js';
import { purgeGenericBiomeFiller } from './BiomeAAAWorlds.js';

function applyVisualSky(scene, visual) {
  if (!visual?.sky) return;
  const { top, fog, ground } = visual.sky;
  scene.background = new THREE.Color(top);
  scene.fog = new THREE.Fog(fog, visual.fogNear ?? 40, visual.fogFar ?? 180);
  const groundMesh = new THREE.Mesh(
    new THREE.CircleGeometry(140, 56),
    new THREE.MeshStandardMaterial({ color: ground, roughness: 0.95 }),
  );
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.position.y = -0.05;
  groundMesh.name = 'mk-ground';
  scene.add(groundMesh);
}

function scatterAlong(world, curve, count, builder, halfWidth, offset = 5) {
  for (let i = 0; i < count; i++) {
    const t = 0.04 + (i / count) * 0.92;
    const side = (i % 2 ? 1 : -1) * (halfWidth + offset + (i % 3) * 2.5);
    const { pos } = placeAtTrack(curve, t, side, 0);
    const prop = builder(i, t);
    prop.position.copy(pos);
    world.add(prop);
  }
}

function addAt(world, x, y, z, mesh) {
  mesh.position.set(x, y, z);
  world.add(mesh);
  return mesh;
}

/** Track 1 — Italian villa estate (reference art) */
function buildLuigiWorld(scene, curve, root, opts) {
  return buildLuigiCircuitWorld(scene, curve, root, opts);
}

/** Track 2 — Pastoral figure-8 farm */
function buildFarmWorld(scene, curve, root, opts) {
  return buildMooMooMeadowsWorld(scene, curve, root, opts);
}

/** Track 4 — Night stadium circuit */
function buildStadiumWorld(scene, curve, root, opts) {
  return buildMarioCircuitWorld(scene, curve, root, opts);
}

/** Track 5 — Peach castle grounds */
function buildPeachWorld(scene, curve, root, opts) {
  const world = new THREE.Group();
  world.name = 'mk-peach';
  applyVisualSky(scene, getMKVisual('peach_castle'));

  const castle = new THREE.Group();
  addAt(castle, 0, 0, 0, new THREE.Mesh(
    new THREE.CylinderGeometry(6, 7, 10, 8),
    new THREE.MeshStandardMaterial({ color: 0xffb6d9, emissive: 0xff88aa, emissiveIntensity: 0.1 }),
  )).position.y = 5;
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    addAt(castle, Math.cos(a) * 7, 0, Math.sin(a) * 7, new THREE.Mesh(
      new THREE.ConeGeometry(2, 6, 6),
      new THREE.MeshStandardMaterial({ color: 0xffb6d9 }),
    )).position.y = 3;
  }
  world.add(castle);

  const fountain = new THREE.Mesh(
    new THREE.CylinderGeometry(2, 2.5, 1.2, 16),
    new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x88ccff, emissiveIntensity: 0.25 }),
  );
  fountain.position.set(0, 0.6, 25);
  world.add(fountain);

  scatterAlong(world, curve, 8, () => {
    const rose = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xff69b4 }),
    );
    rose.position.y = 0.5;
    return rose;
  }, opts.halfWidth || 3.5, 4);

  root.add(world);
  return world;
}

/** Track 5 — Golden desert */
function buildDesertWorld(scene, curve, root, opts) {
  const world = new THREE.Group();
  world.name = 'mk-desert';
  applyVisualSky(scene, getMKVisual('dry_dry_desert'));

  scatterAlong(world, curve, 6, () => {
    const dune = new THREE.Mesh(
      new THREE.SphereGeometry(4, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0xf4a460 }),
    );
    dune.scale.set(1.8, 0.35, 1.2);
    dune.position.y = 0.8;
    return dune;
  }, opts.halfWidth || 2.75, 12);

  scatterAlong(world, curve, 5, () => {
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(1.5, 0),
      new THREE.MeshStandardMaterial({ color: 0x8b7355 }),
    );
    rock.position.y = 0.8;
    return rock;
  }, opts.halfWidth || 2.75, 8);

  addAt(world, 35, 0, -20, new THREE.Mesh(
    new THREE.BoxGeometry(2, 18, 8),
    new THREE.MeshStandardMaterial({ color: 0xa0522d }),
  )).position.y = 9;

  root.add(world);
  return world;
}

/** Track 6 — Canyon gorge */
function buildCanyonWorld(scene, curve, root, opts) {
  const world = new THREE.Group();
  world.name = 'mk-canyon';
  applyVisualSky(scene, getMKVisual('mushroom_canyon'));

  scatterAlong(world, curve, 10, (i) => {
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(3, 16 + (i % 4) * 4, 2),
      new THREE.MeshStandardMaterial({ color: 0x696969 }),
    );
    wall.position.y = 8;
    return wall;
  }, opts.halfWidth || 2.75, 6);

  addAt(world, 20, 12, -15, new THREE.Mesh(
    new THREE.PlaneGeometry(4, 8),
    new THREE.MeshBasicMaterial({ color: 0x88ccff, transparent: true, opacity: 0.6, side: THREE.DoubleSide }),
  ));

  scatterAlong(world, curve, 6, () => {
    const pine = new THREE.Mesh(
      new THREE.ConeGeometry(1.5, 4, 6),
      new THREE.MeshStandardMaterial({ color: 0x228b22 }),
    );
    pine.position.y = 2;
    return pine;
  }, opts.halfWidth || 2.75, 9);

  root.add(world);
  return world;
}

/** Track 7 — Bowser fortress */
function buildCastleWorld(scene, curve, root, opts) {
  const world = new THREE.Group();
  world.name = 'mk-bowser';
  applyVisualSky(scene, getMKVisual('bowser_castle'));

  const fortress = new THREE.Group();
  addAt(fortress, 0, 0, -35, new THREE.Mesh(
    new THREE.BoxGeometry(20, 14, 12),
    new THREE.MeshStandardMaterial({ color: 0x2f4f4f }),
  )).position.y = 7;
  addAt(fortress, -8, 14, -35, new THREE.Mesh(
    new THREE.ConeGeometry(3, 5, 4),
    new THREE.MeshStandardMaterial({ color: 0x3d3d3d }),
  ));
  addAt(fortress, 8, 14, -35, new THREE.Mesh(
    new THREE.ConeGeometry(3, 5, 4),
    new THREE.MeshStandardMaterial({ color: 0x3d3d3d }),
  ));
  world.add(fortress);

  scatterAlong(world, curve, 5, () => {
    const lava = new THREE.Mesh(
      new THREE.CircleGeometry(3, 16),
      new THREE.MeshBasicMaterial({ color: 0xff4500, transparent: true, opacity: 0.85 }),
    );
    lava.rotation.x = -Math.PI / 2;
    lava.position.y = 0.05;
    return lava;
  }, opts.halfWidth || 2.5, 7);

  scatterAlong(world, curve, 3, () => {
    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(0.8, 2.5, 6),
      new THREE.MeshBasicMaterial({ color: 0xffd700 }),
    );
    flame.position.y = 1.2;
    return flame;
  }, opts.halfWidth || 2.5, 5);

  root.add(world);
  return world;
}

/** Track 8 — Bleached wasteland */
function buildBoneDesertWorld(scene, curve, root, opts) {
  const world = new THREE.Group();
  world.name = 'mk-bone';
  applyVisualSky(scene, getMKVisual('bone_dry_desert'));

  scatterAlong(world, curve, 5, () => {
    const bone = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 0.4, 0.6),
      new THREE.MeshStandardMaterial({ color: 0xfffaf0 }),
    );
    bone.position.y = 0.5;
    bone.rotation.z = Math.random() * 0.5;
    return bone;
  }, opts.halfWidth || 2.25, 6);

  scatterAlong(world, curve, 4, () => {
    const skull = new THREE.Mesh(
      new THREE.SphereGeometry(0.8, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xc0c0c0 }),
    );
    skull.position.y = 0.8;
    return skull;
  }, opts.halfWidth || 2.25, 8);

  scatterAlong(world, curve, 3, () => {
    const tomb = new THREE.Mesh(
      new THREE.BoxGeometry(1, 2, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x808080 }),
    );
    tomb.position.y = 1;
    return tomb;
  }, opts.halfWidth || 2.25, 10);

  root.add(world);
  return world;
}

/** Track 9 — Water slide cavern */
function buildWaterSlideWorld(scene, curve, root, opts) {
  const world = new THREE.Group();
  world.name = 'mk-slide';
  applyVisualSky(scene, getMKVisual('piranha_plant_slide'));

  scatterAlong(world, curve, 8, (i) => {
    const plant = new THREE.Group();
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.35, 2, 6),
      new THREE.MeshStandardMaterial({ color: 0x228833 }),
    );
    stem.position.y = 1;
    plant.add(stem);
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.7, 10, 8),
      new THREE.MeshStandardMaterial({ color: 0xff1493, emissive: 0xff0066, emissiveIntensity: 0.4 }),
    );
    head.position.y = 2.2;
    plant.add(head);
    const eye = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0xff0000 }),
    );
    eye.position.set(0.25, 2.35, 0.5);
    plant.add(eye);
    return plant;
  }, opts.halfWidth || 2, 4);

  scatterAlong(world, curve, 6, () => {
    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0x00ff44 }),
    );
    glow.position.y = 1.5;
    return glow;
  }, opts.halfWidth || 2, 6);

  root.add(world);
  return world;
}

/** Track 10 — Active volcano */
function buildVolcanoWorld(scene, curve, root, opts) {
  const world = new THREE.Group();
  world.name = 'mk-volcano';
  applyVisualSky(scene, getMKVisual('grumble_volcano'));

  scatterAlong(world, curve, 5, () => {
    const lava = new THREE.Mesh(
      new THREE.PlaneGeometry(5, 3),
      new THREE.MeshBasicMaterial({ color: 0xff6347, transparent: true, opacity: 0.9 }),
    );
    lava.rotation.x = -Math.PI / 2;
    lava.position.y = 0.04;
    return lava;
  }, opts.halfWidth || 2.25, 6);

  scatterAlong(world, curve, 4, () => {
    const geyser = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.5, 5, 8),
      new THREE.MeshBasicMaterial({ color: 0xd3d3d3, transparent: true, opacity: 0.5 }),
    );
    geyser.position.y = 2.5;
    return geyser;
  }, opts.halfWidth || 2.25, 8);

  addAt(world, 0, 8, -40, new THREE.Mesh(
    new THREE.ConeGeometry(12, 20, 8),
    new THREE.MeshStandardMaterial({ color: 0x654321 }),
  )).position.y = 10;

  root.add(world);
  return world;
}

/** Track 11 — Surreal cheese land */
function buildCheeseWorld(scene, curve, root, opts) {
  const world = new THREE.Group();
  world.name = 'mk-cheese';
  applyVisualSky(scene, getMKVisual('cheese_land'));

  scatterAlong(world, curve, 12, (i) => {
    const cheese = new THREE.Mesh(
      new THREE.BoxGeometry(1.2 + (i % 3) * 0.4, 0.6, 1.2),
      new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0x664400, emissiveIntensity: 0.15 }),
    );
    cheese.position.y = 0.3;
    cheese.rotation.y = i * 0.9;
    return cheese;
  }, opts.halfWidth || 2, 5);

  scatterAlong(world, curve, 5, (i) => {
    const lolli = new THREE.Group();
    const stick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 2, 6),
      new THREE.MeshStandardMaterial({ color: 0xffffff }),
    );
    stick.position.y = 1;
    lolli.add(stick);
    const candy = new THREE.Mesh(
      new THREE.SphereGeometry(0.7, 10, 10),
      new THREE.MeshStandardMaterial({ color: i % 2 ? 0xff1493 : 0x00ff00 }),
    );
    candy.position.y = 2.2;
    lolli.add(candy);
    return lolli;
  }, opts.halfWidth || 2, 7);

  root.add(world);
  return world;
}

/** Track 12 — Cosmic rainbow (classic pro environment) */
function buildCosmicWorld(scene) {
  buildSpaceSkybox(scene, 95, { segments: { width: 16, height: 12 }, worldLod: 1.0 });
  buildStarParticles(scene, 280);
  buildColorfulGemStars(scene, 22);
  buildNebulaSprites(scene);
  buildRingedPlanet(scene, { x: -85, y: -18, z: 35, radius: 62, ringRadius: 0 });
  buildMoon(scene, { x: 48, y: 18, z: -55, radius: 8 });
  buildAsteroidField(scene, 28);
  const planet2 = new THREE.Mesh(
    new THREE.SphereGeometry(18, 24, 24),
    new THREE.MeshStandardMaterial({ color: 0x0077be, emissive: 0x003366, emissiveIntensity: 0.2 }),
  );
  planet2.position.set(60, -30, 20);
  scene.add(planet2);
  return null;
}

const WORLD_BUILDERS = {
  luigi_circuit: buildLuigiWorld,
  moo_moo_meadows: buildFarmWorld,
  mario_circuit: buildStadiumWorld,
  peach_castle: buildPeachWorld,
  dry_dry_desert: buildDesertWorld,
  mushroom_canyon: buildCanyonWorld,
  bowser_castle: buildCastleWorld,
  bone_dry_desert: buildBoneDesertWorld,
  piranha_plant_slide: buildWaterSlideWorld,
  grumble_volcano: buildVolcanoWorld,
  cheese_land: buildCheeseWorld,
};

export function buildMKThemedWorld(scene, curve, root, mkTrack, opts = {}) {
  const arenaType = mkTrack?.arenaType || mkTrack?.theme;
  const visual = getMKVisual(arenaType);

  if (isBiomeArena(arenaType)) {
    purgeGenericBiomeFiller(scene);
    const biomeWorld = buildBiomeWorld(scene, curve, root, mkTrack, opts);
    return {
      visual,
      update(time) {
        biomeWorld?.update?.(time);
      },
    };
  }

  if (visual?.cosmic || mkTrack?.isRainbow) {
    buildCosmicWorld(scene);
    return null;
  }

  const builder = WORLD_BUILDERS[arenaType];
  const world = builder
    ? builder(scene, curve, root, opts)
    : null;

  const skipAmbientCoins = new Set(['luigi_circuit', 'moo_moo_meadows', 'mario_circuit']);
  if (!skipAmbientCoins.has(arenaType)) {
    scatterCollectiblesAlongTrack(scene, curve, [0.12, 0.28, 0.44, 0.6, 0.76, 0.9], 'coin', 12);
  }
  return {
    visual,
    update(time) {
      updateCollectibleAnimations(scene, time);
      world?.userData?.animTick?.(time);
    },
  };
}

export function applyMKSceneAtmosphere(scene, arenaType) {
  const visual = getMKVisual(arenaType);
  if (isBiomeArena(arenaType)) {
    const aaa = getBiomeAAASpec(arenaType);
    if (aaa?.underground) {
      scene.userData.lightMood = [0.3, 0.35, 0];
      scene.userData.expMood = 1.05;
      scene.userData.suppressSimDaylight = true;
    } else {
      scene.userData.lightMood = visual?.lightMood || [1.05, 1.0, 0.85];
      scene.userData.expMood = 1.0;
    }
    scene.userData.biomeAAA = true;
    return visual;
  }
  if (!visual || visual.cosmic) return visual;
  if (visual.lightMood) scene.userData.lightMood = visual.lightMood;
  if (visual.expMood) scene.userData.expMood = visual.expMood;
  if (visual.bloom) {
    scene.userData.raceVisual = {
      ...(scene.userData.raceVisual || {}),
      bloom: visual.bloom.strength,
      threshold: visual.bloom.threshold,
      radius: visual.bloom.radius,
    };
  }
  return visual;
}
