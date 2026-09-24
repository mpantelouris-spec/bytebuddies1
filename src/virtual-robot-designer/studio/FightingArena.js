/**
 * FightingArena.js — Professional boxing ring fighting scene.
 * Preserves combat PBR materials, visible ropes, and correct fighter grounding.
 * 
 * MASTER SYSTEM: Integrates realistic 3D combat animation engine with
 * enhanced VFX (motion trails, spark bursts, shockwaves, block shields).
 */
import * as THREE from 'three';
import { createCombatEngine } from './fighting-combat-engine.js';
import { buildCombatFighterMesh } from '../services/studio-robot-builder.js';
import { getRingSkinIndex, buildCombatRingBackdrop, applyRingSkinStyle } from './CombatRingSkins.js';
// Optional enhanced VFX (safe import with fallback)
import { createEnhancedCombatVFX } from './combat-vfx-enhanced.js';
import { createCombatCamera } from './realistic-combat-animation.js';
import { applyMissionKidClarity, CHASSIS_VISUAL_DNA } from './mission-world/MissionKidClarity.js';
import {
  applyKidMissionTeachingProps,
  classifyKidMissionFeature,
} from './mission-world/MissionKidTeachingProps.js';
import { buildCombatMissionVisualKit } from './CombatMissionVisualKit.js';

const COMBAT_ARCHETYPES = new Set(['striker', 'tank', 'blaster', 'ninja', 'berserker', 'dummy']);

export const RING_HALF = 3;
export const RING_PLATFORM_Y = 0.5;
export const RING_SURFACE_Y = RING_PLATFORM_Y + 0.05;
export const PLAYER_X = -1.5;
export const ENEMY_X = 1.5;
export const FIGHTER_SCALE = 1.0;

/** Place fighter feet on the ring canvas top */
export function alignFighterToRingSurface(model, surfaceY = RING_SURFACE_Y) {
  model.updateMatrixWorld(true);
  const bbox = new THREE.Box3().setFromObject(model);
  if (!bbox.isEmpty()) {
    model.position.y += surfaceY - bbox.min.y;
  }
  model.userData._groundY = model.position.y;
  model.traverse((o) => { if (o.isMesh) o.frustumCulled = false; });
}

function tagCombatLight(light) {
  light.userData.combatArenaLight = true;
  return light;
}

function buildGround() {
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 40),
    new THREE.MeshStandardMaterial({ color: 0x0a0a0a, metalness: 0.15, roughness: 0.95 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  ground.name = 'FightGround';
  return ground;
}

function buildRingCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#121212';
  ctx.fillRect(0, 0, 512, 512);
  ctx.strokeStyle = '#1c1c1c';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 512; i += 32) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 512); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(512, i); ctx.stroke();
  }
  ctx.strokeStyle = '#2a1515';
  ctx.lineWidth = 4;
  ctx.strokeRect(24, 24, 464, 464);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  const mat = new THREE.MeshStandardMaterial({ map: tex, metalness: 0.08, roughness: 0.9 });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(5.85, 5.85), mat);
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = RING_SURFACE_Y + 0.005;
  plane.receiveShadow = true;
  plane.name = 'RingCanvas';
  return plane;
}

function buildRingPlatform() {
  const platform = new THREE.Mesh(
    new THREE.BoxGeometry(6, 0.1, 6),
    new THREE.MeshStandardMaterial({ color: 0x0d0d0d, metalness: 0.25, roughness: 0.85 }),
  );
  platform.position.y = RING_PLATFORM_Y;
  platform.castShadow = true;
  platform.receiveShadow = true;
  platform.name = 'RingPlatform';
  return platform;
}

function buildRingApron() {
  const apron = new THREE.Mesh(
    new THREE.TorusGeometry(3.25, 0.32, 16, 100),
    new THREE.MeshStandardMaterial({ color: 0xcc0000, metalness: 0.15, roughness: 0.82 }),
  );
  apron.rotation.x = Math.PI / 2;
  apron.position.y = RING_PLATFORM_Y;
  apron.castShadow = true;
  apron.receiveShadow = true;
  apron.name = 'RingApron';
  return apron;
}

function buildCornerPads() {
  const g = new THREE.Group();
  g.name = 'CornerPads';
  const padMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, metalness: 0.2, roughness: 0.75 });
  const redTrim = new THREE.MeshStandardMaterial({ color: 0xcc0000, metalness: 0.1, roughness: 0.8 });
  [[-2.75, -2.75], [2.75, -2.75], [-2.75, 2.75], [2.75, 2.75]].forEach(([x, z]) => {
    const pad = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.1, 0.55), padMat);
    pad.position.set(x, RING_SURFACE_Y + 0.05, z);
    pad.castShadow = true;
    g.add(pad);
    const trim = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.04, 0.58), redTrim);
    trim.position.set(x, RING_SURFACE_Y + 0.11, z);
    g.add(trim);
  });
  return g;
}

function buildRingPosts() {
  const g = new THREE.Group();
  g.name = 'RingPosts';

  const postGeo = new THREE.CylinderGeometry(0.14, 0.16, 2.05, 16);
  const postMat = new THREE.MeshStandardMaterial({ color: 0x080808, metalness: 0.92, roughness: 0.18 });
  const capMat = new THREE.MeshStandardMaterial({ color: 0xcc0000, metalness: 0.3, roughness: 0.6 });

  const postPositions = [
    [-RING_HALF, 1.02, -RING_HALF],
    [RING_HALF, 1.02, -RING_HALF],
    [-RING_HALF, 1.02, RING_HALF],
    [RING_HALF, 1.02, RING_HALF],
  ];

  postPositions.forEach((pos) => {
    const post = new THREE.Mesh(postGeo, postMat);
    post.position.set(pos[0], pos[1], pos[2]);
    post.castShadow = true;
    g.add(post);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), capMat);
    cap.position.set(pos[0], 2.05, pos[2]);
    g.add(cap);
  });

  return g;
}

function addRopeSegment(g, x1, y, z1, x2, z2, mat) {
  const dx = x2 - x1;
  const dz = z2 - z1;
  const len = Math.sqrt(dx * dx + dz * dz);
  const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, len, 10), mat);
  rope.position.set((x1 + x2) / 2, y, (z1 + z2) / 2);
  if (Math.abs(dz) < 0.01) {
    rope.rotation.z = Math.PI / 2;
  } else {
    rope.rotation.y = Math.atan2(dx, dz);
    rope.rotation.x = Math.PI / 2;
  }
  rope.castShadow = true;
  g.add(rope);
}

function buildRingRopes() {
  const g = new THREE.Group();
  g.name = 'RingRopes';

  const ropeMat = new THREE.MeshStandardMaterial({
    color: 0xd4a574,
    metalness: 0.12,
    roughness: 0.55,
  });
  const turnbuckleMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.85, roughness: 0.25 });

  const ropeHeights = [0.55, 0.9, 1.25, 1.6];
  const h = RING_HALF;

  const sides = [
    [-h, -h, h, -h],
    [-h, h, h, h],
    [-h, -h, -h, h],
    [h, -h, h, h],
  ];

  ropeHeights.forEach((y) => {
    sides.forEach(([x1, z1, x2, z2]) => {
      addRopeSegment(g, x1, y, z1, x2, z2, ropeMat);
    });
    // Turnbuckles at corners
    [[-h, -h], [h, -h], [-h, h], [h, h]].forEach(([x, z]) => {
      const tb = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.12, 8), turnbuckleMat);
      tb.position.set(x, y, z);
      g.add(tb);
    });
  });

  return g;
}

function buildRingMarkings() {
  const g = new THREE.Group();
  g.name = 'RingMarkings';

  const circle = new THREE.Mesh(
    new THREE.RingGeometry(0.85, 1.0, 48),
    new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.75, side: THREE.DoubleSide }),
  );
  circle.rotation.x = -Math.PI / 2;
  circle.position.y = RING_SURFACE_Y + 0.012;
  g.add(circle);

  const midLine = new THREE.Mesh(
    new THREE.PlaneGeometry(0.05, 5.6),
    new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.45, side: THREE.DoubleSide }),
  );
  midLine.rotation.x = -Math.PI / 2;
  midLine.position.y = RING_SURFACE_Y + 0.012;
  g.add(midLine);

  [-1.5, 1.5].forEach((x) => {
    const cornerDot = new THREE.Mesh(
      new THREE.CircleGeometry(0.18, 24),
      new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.35, side: THREE.DoubleSide }),
    );
    cornerDot.rotation.x = -Math.PI / 2;
    cornerDot.position.set(x, RING_SURFACE_Y + 0.012, 0);
    g.add(cornerDot);
  });

  return g;
}

function buildAcademyEnvironment() {
  const g = new THREE.Group();
  g.name = 'CombatAcademy';

  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(28, 11, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x141c28, metalness: 0.12, roughness: 0.88 }),
  );
  backWall.position.set(0, 5.5, 15);
  backWall.receiveShadow = true;
  g.add(backWall);

  const sideWallMat = new THREE.MeshStandardMaterial({ color: 0x0f1520, metalness: 0.08, roughness: 0.92 });
  [-15, 15].forEach((x) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 9, 30), sideWallMat);
    wall.position.set(x, 4.5, 0);
    wall.receiveShadow = true;
    g.add(wall);
  });

  const ceiling = new THREE.Mesh(
    new THREE.BoxGeometry(32, 0.35, 32),
    new THREE.MeshStandardMaterial({ color: 0x0a0a0a, metalness: 0.08, roughness: 0.85 }),
  );
  ceiling.position.y = 10.5;
  g.add(ceiling);

  const makeScreen = (label, sub, x, y, z, rotY = 0) => {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#0a0f18';
    ctx.fillRect(0, 0, 512, 256);
    ctx.strokeStyle = '#00bfff';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, 492, 236);
    ctx.font = 'bold 48px Arial,sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(label, 256, 100);
    ctx.font = 'bold 28px Arial,sans-serif';
    ctx.fillStyle = '#00bfff';
    ctx.fillText(sub, 256, 160);
    const tex = new THREE.CanvasTexture(c);
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(4.5, 2.2),
      new THREE.MeshStandardMaterial({ map: tex, emissive: 0x111822, emissiveIntensity: 0.8 }),
    );
    screen.position.set(x, y, z);
    screen.rotation.y = rotY;
    return screen;
  };

  g.add(makeScreen('BYTEBUDDIES', 'COMBAT ACADEMY', 0, 7.8, 14.5));
  g.add(makeScreen('ROUND 1', 'FIGHT!', -12, 5.5, 0, Math.PI / 2));
  g.add(makeScreen('LIVE', 'SPARRING', 12, 5.5, 0, -Math.PI / 2));

  // Overhead truss lights
  const trussMat = new THREE.MeshStandardMaterial({ color: 0x222222, metalness: 0.7, roughness: 0.35 });
  [-4, 0, 4].forEach((x) => {
    const truss = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 10), trussMat);
    truss.position.set(x, 9.8, 0);
    g.add(truss);
  });

  return g;
}

function buildCrowd(seed = 1) {
  const g = new THREE.Group();
  g.name = 'Crowd';
  const crowdMat = new THREE.MeshBasicMaterial({ color: 0x1a0d2e, transparent: true, opacity: 0.82 });
  const figures = [];
  let randomState = seed >>> 0;
  const random = () => {
    randomState = (Math.imul(randomState, 1664525) + 1013904223) >>> 0;
    return randomState / 4294967296;
  };

  [[-12, -12], [12, -12], [-12, 12], [12, 12]].forEach(([bx, bz], si) => {
    for (let i = 0; i < 16; i++) {
      const h = 1.0 + random() * 0.75;
      const fig = new THREE.Mesh(new THREE.BoxGeometry(0.42, h, 0.26), crowdMat.clone());
      const t = (i / 15) - 0.5;
      fig.position.set(
        bx + (si < 2 ? t * 9 : 0),
        h / 2,
        bz + (si >= 2 ? t * 9 : 0),
      );
      fig.userData.baseY = fig.position.y;
      fig.userData.phase = random() * Math.PI * 2;
      g.add(fig);
      figures.push(fig);
    }
  });

  g.userData.crowdFigures = figures;
  g.userData.cheer = 0;
  return g;
}

function buildArenaLighting(scene) {
  const lights = [];

  const createSpotlight = (x, y, z) => {
    const light = tagCombatLight(new THREE.SpotLight(0xfff5dc, 2.0, 35, Math.PI / 3.5, 0.35, 1.5));
    light.position.set(x, y, z);
    light.target.position.set(0, 1.0, 0);
    light.castShadow = true;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    light.shadow.bias = -0.0002;
    scene.add(light);
    scene.add(light.target);
    lights.push(light);
    return light;
  };

  createSpotlight(5, 9, -5);
  createSpotlight(-5, 9, -5);
  createSpotlight(5, 9, 5);
  createSpotlight(-5, 9, 5);

  const keyLight = tagCombatLight(new THREE.DirectionalLight(0xf5deb3, 1.4));
  keyLight.position.set(6, 9, 4);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 2048;
  keyLight.shadow.mapSize.height = 2048;
  keyLight.shadow.camera.far = 50;
  keyLight.shadow.camera.left = -18;
  keyLight.shadow.camera.right = 18;
  keyLight.shadow.camera.top = 18;
  keyLight.shadow.camera.bottom = -18;
  keyLight.shadow.camera.updateProjectionMatrix();
  scene.add(keyLight);
  lights.push(keyLight);

  const fillLight = tagCombatLight(new THREE.DirectionalLight(0x8ec8e8, 0.55));
  fillLight.position.set(-6, 6, -5);
  scene.add(fillLight);
  lights.push(fillLight);

  // True backlight — positioned behind the ring (opposite the camera at
  // z≈-4.4) so it rims the fighters' silhouette edges instead of just
  // adding more front fill from the camera's own side.
  const rimLight = tagCombatLight(new THREE.DirectionalLight(0xffffff, 0.8));
  rimLight.position.set(0, 3, -8);
  scene.add(rimLight);
  lights.push(rimLight);

  const ambient = tagCombatLight(new THREE.AmbientLight(0xffffff, 0.45));
  scene.add(ambient);
  lights.push(ambient);

  const ringGlow = tagCombatLight(new THREE.PointLight(0x00bfff, 1.2, 18, 2));
  ringGlow.position.set(0, 2.5, 0);
  scene.add(ringGlow);
  lights.push(ringGlow);

  return lights;
}

function buildKidCombatLighting(scene) {
  const hemi = tagCombatLight(new THREE.HemisphereLight(0xfffbeb, 0x93c5fd, 1.25));
  scene.add(hemi);
  const key = tagCombatLight(new THREE.DirectionalLight(0xfff4d6, 1.35));
  key.position.set(-5, 9, -6);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  scene.add(key);
  return [hemi, key];
}

function makeEnemyMesh(type) {
  const archetype = type === 'dummy' ? 'dummy' : (COMBAT_ARCHETYPES.has(type) ? type : 'striker');
  const fighter = buildCombatFighterMesh(archetype);

  const g = new THREE.Group();
  g.name = archetype === 'dummy' ? 'TrainingDummy' : 'EnemyFighter';
  g.add(fighter);
  g.scale.setScalar(FIGHTER_SCALE);
  g.userData.isCombatFighter = true;
  g.userData.combatPBR = true;

  g.userData.animate = (t, dt) => fighter.userData.animate?.(t, dt);
  g.userData.setAnimState = (state, dur) => fighter.userData.setAnimState?.(state, dur);
  g.userData.setHealthPct = (pct) => fighter.userData.setHealthPct?.(pct);
  g.userData.setSkeletonDriven = (on) => fighter.userData.setSkeletonDriven?.(on);
  g.userData.setTimeScale = (scale) => fighter.userData.setTimeScale?.(scale);
  g.userData.rig = fighter.userData.rig;
  g.userData.fighterCore = fighter;

  return g;
}

function buildTankCombatYard(scene) {
  const g = new THREE.Group();
  g.name = 'TankCombatYard';

  const sand = new THREE.Mesh(
    new THREE.PlaneGeometry(50, 50),
    new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.95 }),
  );
  sand.rotation.x = -Math.PI / 2;
  sand.receiveShadow = true;
  g.add(sand);

  [-12, 12].forEach((x) => {
    const bunker = new THREE.Mesh(
      new THREE.BoxGeometry(5, 3.5, 8),
      new THREE.MeshStandardMaterial({ color: 0x57534e, roughness: 0.85 }),
    );
    bunker.position.set(x, 1.75, 8);
    bunker.castShadow = true;
    g.add(bunker);
  });

  const core = new THREE.Mesh(
    new THREE.CylinderGeometry(1.8, 2.2, 3, 10),
    new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x3b82f6, emissiveIntensity: 0.35 }),
  );
  core.position.set(0, 1.5, -4);
  core.name = 'FortressCore';
  g.add(core);

  scene.add(g);
  scene.background = new THREE.Color(0xfed7aa);
  scene.fog = new THREE.Fog(0xfde68a, 28, 65);
  return g;
}

function buildMechScrapYard(scene) {
  const g = new THREE.Group();
  g.name = 'MechScrapYard';
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(48, 48),
    new THREE.MeshStandardMaterial({ color: 0x57534e, roughness: 0.88, metalness: 0.12 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  g.add(floor);
  [-1, 1].forEach((side) => {
    const caution = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.05, 34),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0x78350f, emissiveIntensity: 0.12 }),
    );
    caution.position.set(side * 7, 0.04, 0);
    g.add(caution);
  });
  const container = new THREE.Mesh(
    new THREE.BoxGeometry(10, 4.5, 4.5),
    new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.62, metalness: 0.38 }),
  );
  container.position.set(12, 2.25, 7);
  container.castShadow = true;
  g.add(container);
  const press = new THREE.Mesh(
    new THREE.BoxGeometry(5, 7, 4),
    new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.48, metalness: 0.6 }),
  );
  press.position.set(-12, 3.5, 8);
  press.castShadow = true;
  g.add(press);
  scene.add(g);
  scene.background = new THREE.Color(0x78716c);
  scene.fog = new THREE.Fog(0xa8a29e, 34, 82);
  return g;
}

function addCombatIdentity(ringGroup, chassisId) {
  if (chassisId === 'battlebot') {
    const grateMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.72, roughness: 0.3 });
    for (let i = -2; i <= 2; i++) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.035, 0.08), grateMat);
      bar.position.set(0, RING_SURFACE_Y + 0.03, i);
      ringGroup.add(bar);
    }
  } else if (chassisId === 'blaster') {
    const runeMat = new THREE.MeshBasicMaterial({
      color: 0xa78bfa, transparent: true, opacity: 0.82, side: THREE.DoubleSide,
    });
    [1.2, 2.1].forEach((radius) => {
      const rune = new THREE.Mesh(new THREE.RingGeometry(radius, radius + 0.08, 32), runeMat);
      rune.rotation.x = -Math.PI / 2;
      rune.position.y = RING_SURFACE_Y + 0.035;
      ringGroup.add(rune);
    });
    const crystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.65),
      new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x22d3ee, emissiveIntensity: 0.7 }),
    );
    crystal.position.set(0, 2.2, 2.5);
    ringGroup.add(crystal);
  } else if (chassisId === 'berserker') {
    const totem = new THREE.Mesh(
      new THREE.ConeGeometry(0.65, 3.6, 6),
      new THREE.MeshStandardMaterial({ color: 0x292524, emissive: 0xf97316, emissiveIntensity: 0.3 }),
    );
    totem.position.set(0, 1.8, 3.8);
    ringGroup.add(totem);
  }
}

function buildCombatArenaForChassis(scene, challenge, playerArchetype) {
  const chassisId = challenge?.chassisId || playerArchetype;
  const dna = CHASSIS_VISUAL_DNA[chassisId];

  if (chassisId === 'tank') {
    return { yard: buildTankCombatYard(scene), surfaceY: 0.05, isRing: false };
  }
  if (chassisId === 'mech') {
    return { yard: buildMechScrapYard(scene), surfaceY: 0.05, isRing: false };
  }

  const ringGroup = new THREE.Group();
  ringGroup.name = 'BoxingRing';
  ringGroup.add(buildGround());
  ringGroup.add(buildRingPlatform());
  ringGroup.add(buildRingCanvas());
  ringGroup.add(buildRingApron());
  ringGroup.add(buildCornerPads());
  ringGroup.add(buildRingPosts());
  ringGroup.add(buildRingRopes());
  ringGroup.add(buildRingMarkings());
  const skinIdx = getRingSkinIndex(challenge);
  applyRingSkinStyle(ringGroup, skinIdx);
  addCombatIdentity(ringGroup, chassisId);

  if (dna?.sky) {
    scene.background = new THREE.Color(dna.sky);
    scene.fog = new THREE.Fog(dna.fog ?? dna.sky, 32, 70);
  }

  if (chassisId === 'berserker') {
    const crack = new THREE.Mesh(
      new THREE.RingGeometry(2, 3.2, 24),
      new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.6, side: THREE.DoubleSide }),
    );
    crack.rotation.x = -Math.PI / 2;
    crack.position.y = RING_SURFACE_Y + 0.02;
    ringGroup.add(crack);
  }

  scene.add(ringGroup);
  return { yard: ringGroup, surfaceY: RING_SURFACE_Y, isRing: true };
}

export function buildFightingArena(scene, challenge = {}, playerArchetype = 'striker') {
  const clarity = applyMissionKidClarity(scene, challenge);
  scene.userData.combatMode = true;
  scene.userData.finishZone = null;
  scene.userData.hideSpawnMarkers = true;
  scene.userData.skipSceneStylize = true;
  scene.userData.skipSoftEnvironment = true;
  scene.userData.combatVisual = { ...clarity.post };
  scene.userData.expMood = 1.04;
  scene.userData.mkArena = true;

  if (!CHASSIS_VISUAL_DNA[challenge?.chassisId || playerArchetype]?.sky) {
    scene.background = new THREE.Color(0xc7d2fe);
    scene.fog = new THREE.Fog(0xc7d2fe, 32, 70);
  }

  scene.traverse((obj) => {
    if (obj.userData?.combatArenaLight) return;
    if (obj.isAmbientLight) obj.intensity = 0.04;
    if (obj.isHemisphereLight) obj.intensity = 0.03;
    if (obj.isDirectionalLight) obj.intensity *= 0.12;
  });

  const { surfaceY } = buildCombatArenaForChassis(scene, challenge, playerArchetype);
  if (scene.fog) {
    scene.fog.near = clarity.fogNear;
    scene.fog.far = clarity.fogFar;
  }

  const combatFeature = classifyKidMissionFeature(challenge);
  if (combatFeature !== 'opponent_only' && combatFeature !== 'capstone_course') {
    const centered = ['sumo_zone', 'shield', 'mines', 'cooling_pads'].includes(combatFeature);
    applyKidMissionTeachingProps(scene, challenge, null, {
      mode: 'combat',
      kind: combatFeature,
      offsetZ: centered ? 0 : 2.25,
    });
  }
  buildCombatMissionVisualKit(scene, challenge, challenge?.chassisId || playerArchetype);

  const crowdGroup = new THREE.Group();
  crowdGroup.name = 'Crowd';
  crowdGroup.userData.crowdFigures = [];
  crowdGroup.userData.cheer = 0;
  scene.add(crowdGroup);

  buildKidCombatLighting(scene);

  // Combat camera - side view framing both fighters
  scene.userData.combatCamPreset = {
    position: new THREE.Vector3(0, 2.8, -7.2),
    lookAt: new THREE.Vector3(0, 1, 0),
    fov: clarity.cameraRig.fov,
  };
  scene.userData.arenaBounds = {
    ...(scene.userData.arenaBounds || {}),
    flappyNoIntro: true,
    combatCam: true,
  };

  scene.userData.groundY = surfaceY;
  scene.userData.combatRingY = surfaceY;

  let enemyKey = challenge.enemyType || 'dummy';
  if (enemyKey === 'mixed' || enemyKey === 'adaptive') {
    enemyKey = challenge.strategyScenarios?.[0]?.enemy || challenge.rounds?.[0] || 'striker';
  }
  if (enemyKey === 'boss') enemyKey = 'berserker';
  if (enemyKey === 'wave') enemyKey = 'striker';
  if (challenge.fightMode === 'training') enemyKey = 'dummy';

  let enemyMesh = makeEnemyMesh(enemyKey);
  enemyMesh.position.set(ENEMY_X, 0, 0);
  enemyMesh.rotation.y = -Math.PI / 2;
  alignFighterToRingSurface(enemyMesh, surfaceY);
  enemyMesh.userData.groundY = enemyMesh.position.y; // combat engine keeps feet here
  scene.add(enemyMesh);
  scene.userData.enemyMesh = enemyMesh;

  function swapEnemyMesh(newKey) {
    if (!newKey || newKey === 'dummy') return;
    scene.remove(enemyMesh);
    enemyMesh = makeEnemyMesh(newKey);
    enemyMesh.position.set(ENEMY_X, 0, 0);
    enemyMesh.rotation.y = -Math.PI / 2;
    alignFighterToRingSurface(enemyMesh, surfaceY);
    enemyMesh.userData.groundY = enemyMesh.position.y;
    scene.add(enemyMesh);
    scene.userData.enemyMesh = enemyMesh;
    combat.setEnemyMesh(enemyMesh);
  }

  const combat = createCombatEngine({
    challenge,
    playerArchetype,
    enemyMesh,
    enemyKey,
    onCombatEvent: (evt) => {
      if (evt.type === 'enemy_swap' && evt.enemyKey) swapEnemyMesh(evt.enemyKey);
      if (evt.type === 'attack_windup') {
        scene.userData.onCombatAttack?.({
          x: evt.x ?? 0,
          z: evt.z ?? 0,
          heavy: !!evt.heavy,
          actionId: evt.actionId ?? '',
        });
      }
      if (evt.type === 'hit_enemy' || evt.type === 'hit_player') {
        crowdGroup.userData.cheer = Math.min(2, (crowdGroup.userData.cheer || 0) + (evt.heavy ? 1.2 : 0.5));
        scene.userData.onCombatImpact?.({
          x: evt.x ?? 0,
          y: 0,
          z: evt.z ?? 0,
          intensity: evt.intensity ?? 1,
          heavy: !!evt.heavy,
          damage: evt.damage ?? 0,
          critical: !!evt.critical,
          blocked: !!evt.blocked,
        });
        if (evt.type === 'hit_player') {
          scene.userData.onCombatDamageTaken?.({ x: evt.x ?? 0, y: 0, z: evt.z ?? 0 });
        }
      }
    },
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // ENHANCED VFX SYSTEM - Motion trails, sparks, shockwaves, block shields
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Enhanced VFX disabled for performance - re-enable when optimized
  let enhancedVFX = null;
  // try {
  //   if (typeof createEnhancedCombatVFX === 'function') {
  //     enhancedVFX = createEnhancedCombatVFX(scene);
  //     scene.userData.enhancedVFX = enhancedVFX;
  //   }
  // } catch (e) {
  //   console.warn('Enhanced VFX initialization failed:', e);
  // }
  
  // Combat camera controller disabled for performance
  let combatCameraController = null;
  scene.userData.setCombatCamera = (camera) => {
    // Disabled for performance
  };

  scene.userData.combat = combat;
  scene.userData.getCombatState = () => combat.getState();
  scene.userData.spawnX = PLAYER_X;
  scene.userData.spawnZ = 0;
  scene.userData.spawnY = surfaceY;
  scene.userData.combatRingY = surfaceY;

  scene.userData.obstacles = [];
  scene.userData.collectibles = [];
  scene.userData.movers = [{
    update(t, dt) {
      combat.tick(dt);
      if (enemyMesh.userData.animate) enemyMesh.userData.animate(t + 1.7, dt);

      // Enhanced VFX disabled for performance - uncomment when optimized
      // if (enhancedVFX && typeof enhancedVFX.tick === 'function') {
      //   try { enhancedVFX.tick(dt); } catch(e) { /* silent */ }
      // }
      
      // Combat camera effects disabled for performance
      // if (combatCameraController && typeof combatCameraController.tick === 'function') {
      //   try { combatCameraController.tick(dt); } catch(e) { /* silent */ }
      // }

      const cheer = crowdGroup.userData.cheer || 0;
      if (cheer > 0) crowdGroup.userData.cheer = Math.max(0, cheer - dt * 0.8);
      (crowdGroup.userData.crowdFigures || []).forEach((fig, i) => {
        const wave = Math.sin(t * 3 + fig.userData.phase) * 0.04;
        const jump = cheer > 0.1 ? Math.abs(Math.sin(t * 12 + i * 0.3)) * cheer * 0.25 : 0;
        fig.position.y = fig.userData.baseY + wave + jump;
        fig.material.opacity = 0.75 + cheer * 0.15;
      });
    },
  }];
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ENHANCED VFX EVENT HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Override combat impact handler to use enhanced VFX (if available)
  scene.userData.onCombatImpact = ({
    x = 0, y = 0, z = 0, intensity = 1, heavy = false, damage = 0, critical = false, blocked = false,
  } = {}) => {
    if (!enhancedVFX) return;
    try {
      const pos = new THREE.Vector3(x, y + 1.0, z);
      const normal = new THREE.Vector3(1, 0.2, 0).normalize();
      
      if (blocked) {
        enhancedVFX.onBlockedHit?.(pos, normal);
      } else {
        enhancedVFX.onCleanHit?.(pos, normal, heavy, critical);
      }
      
      // Camera impact effects
      if (combatCameraController) {
        combatCameraController.onImpact?.(heavy);
      }
    } catch (e) { /* silent */ }
  };
  
  // Attack windup triggers motion trail (if available)
  scene.userData.onCombatAttack = ({ x = 0, z = 0, heavy = false, actionId = '' } = {}) => {
    if (!enhancedVFX) return;
    try {
      const isKick = actionId?.includes('kick') || actionId?.includes('roundhouse') || actionId?.includes('sweep');
      const pos = new THREE.Vector3(x, isKick ? 0.8 : 1.2, z);
      enhancedVFX.startSwingTrail?.(pos, isKick ? 'kick' : 'punch');
    } catch (e) { /* silent */ }
  };
  
  // Update trail position (called during active frames)
  scene.userData.updateSwingTrail = (position) => {
    if (!enhancedVFX) return;
    try { enhancedVFX.updateSwingTrail?.(position); } catch (e) { /* silent */ }
  };

  return combat;
}
