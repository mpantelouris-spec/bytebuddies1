/**
 * ArenaBuilderCore — shared visuals + chassis route helpers for family arena builders.
 */
import * as THREE from 'three';
import { addWorldMover, addCollectible, buildCoin, animateCollectible } from '../racing/GameWorldBuilder.js';
import { isCapstoneMode } from './CapstoneArenaBuilder.js';
import { dressRouteCorridor } from './ArenaSceneryKit.js';
import { isCarChassis } from '../data/car-racing-tracks.js';
import { isPrimaryStudioChassis, getPrimaryStudioArena } from '../data/primary-robot-studio.js';
import { getArenaBlueprint } from '../data/primary-arena-layouts.js';
import { getMissionVisual } from './mission-world/MissionVisualBibleV2.js';

function makeRoadTexture(accentHex, glowHex) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#1a1f2e';
  ctx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 8) {
    for (let x = 0; x < 256; x += 8) {
      ctx.fillStyle = `hsl(220,12%,${14 + Math.random() * 6}%)`;
      ctx.fillRect(x, y, 8, 8);
    }
  }
  ctx.strokeStyle = `#${glowHex.toString(16).padStart(6, '0')}`;
  ctx.lineWidth = 3;
  ctx.setLineDash([18, 14]);
  ctx.beginPath();
  ctx.moveTo(128, 0);
  ctx.lineTo(128, 256);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = `#${accentHex.toString(16).padStart(6, '0')}`;
  ctx.lineWidth = 5;
  ctx.strokeRect(4, 4, 248, 248);
  const tex = new THREE.CanvasTexture(c);
  if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 4);
  return tex;
}

export function arenaMover(scene, fn) {
  (scene.userData.movers = scene.userData.movers || []).push({ update: fn });
}

export function setFinishZone(scene, x, z, radius = 3.5, y3d = 0) {
  scene.userData.finishZone = { x, z, radius, y3d };
}

export function makeSkyGradient(scene, stops) {
  const c = document.createElement('canvas');
  c.width = 2;
  c.height = 512;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  stops.forEach(([pos, hex]) => g.addColorStop(pos, hex));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 2, 512);
  const tex = new THREE.CanvasTexture(c);
  if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
  tex.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = tex;
}

export function initFamilyScene(scene, lightMood) {
  scene.userData.movers = [];
  scene.userData.customSky = true;
  scene.userData.customDecor = true;
  if (lightMood) scene.userData.lightMood = lightMood;
}

export function goalMarker(scene, x, z, col, label, y = 1.6) {
  setFinishZone(scene, x, z, 3.2, 0);
  const nintendo = !!scene.userData.nintendoClean;
  if (nintendo) {
    if (scene.userData.capstoneRoute) {
      const archCol = col || 0xfbbf24;
      [-2.4, 2.4].forEach((ox) => {
        const pillar = new THREE.Mesh(
          new THREE.CylinderGeometry(0.35, 0.42, 5.5, 12),
          new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.88 }),
        );
        pillar.position.set(x + ox, 2.75, z);
        scene.add(pillar);
      });
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(5.6, 0.55, 0.55),
        new THREE.MeshStandardMaterial({ color: archCol, emissive: archCol, emissiveIntensity: 0.25 }),
      );
      bar.position.set(x, 5.6, z);
      scene.add(bar);
      const trophy = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.75, 0),
        new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xfbbf24, emissiveIntensity: 0.45 }),
      );
      trophy.position.set(x, 4.2, z);
      scene.add(trophy);
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(1.8, 2, 0.22, 20),
        new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.92, emissive: 0x22c55e, emissiveIntensity: 0.22 }),
      );
      base.position.set(x, 0.11, z);
      base.receiveShadow = true;
      scene.add(base);
      return;
    }
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.12, 0.14, 4.2, 10),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9, metalness: 0 }),
    );
    pole.position.set(x, 2.1, z);
    scene.add(pole);
    const flag = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 1.1, 0.08),
      new THREE.MeshStandardMaterial({ color: col || 0xef4444, roughness: 0.85, metalness: 0 }),
    );
    flag.position.set(x + 0.85, 3.6, z);
    scene.add(flag);
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(1.4, 1.5, 0.2, 20),
      new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.92, emissive: 0x22c55e, emissiveIntensity: 0.15 }),
    );
    base.position.set(x, 0.1, z);
    base.receiveShadow = true;
    scene.add(base);
    return;
  }
  const beamMat = new THREE.MeshBasicMaterial({
    color: col, transparent: true, opacity: 0.18, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 2, 12, 16, 1, true), beamMat);
  beam.position.set(x, 6, z);
  scene.add(beam);
  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 16, 16),
    new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.65 }),
  );
  orb.position.set(x, y, z);
  scene.add(orb);
  const pl = new THREE.PointLight(col, 1.2, 12);
  pl.position.set(x, y + 0.5, z);
  scene.add(pl);
  if (label) {
    const cnv = document.createElement('canvas');
    cnv.width = 360;
    cnv.height = 72;
    const ctx = cnv.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0.78)';
    ctx.roundRect(4, 4, 352, 64, 10);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 22px system-ui,sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, 180, 44);
    const lbl = new THREE.Mesh(
      new THREE.PlaneGeometry(3.8, 0.76),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cnv), transparent: true, depthWrite: false }),
    );
    lbl.position.set(x, y + 2.2, z);
    scene.add(lbl);
  }
  arenaMover(scene, (t) => {
    orb.scale.setScalar(0.9 + Math.sin(t * 3) * 0.1);
    pl.intensity = 0.9 + Math.sin(t * 2.5) * 0.3;
    beamMat.opacity = 0.12 + Math.sin(t * 1.6) * 0.06;
  });
}

export function finishChassisOrGoal(scene, challenge, theme, defaultZ, defaultLabel) {
  if (challenge?.isChassisMode) {
    buildChassisRoute(scene, challenge, theme);
  } else {
    goalMarker(scene, 0, defaultZ, theme.goal || 0xfbbf24, defaultLabel);
  }
}

export function buildChassisRoute(scene, challenge, theme) {
  if (!challenge?.isChassisMode) return;
  if (scene.userData.aerialWorldBuilt && scene.userData._chassisCurve) return;
  if (challenge.physics === 'flight_3dof' && scene.userData._chassisCurve) return;
  const capstone = isCapstoneMode(challenge);
  const dist = capstone ? Math.max(48, challenge.totalDist || 50) : Math.max(28, challenge.totalDist || 32);
  const finishZ = 4 - dist;
  const cpCount = capstone
    ? (challenge.checkpoints || 9)
    : (challenge.checkpoints || Math.max(3, Math.floor(dist / 10)));

  const primaryLayout = isPrimaryStudioChassis(challenge.chassisId)
    ? getArenaBlueprint(getPrimaryStudioArena(challenge.chassisId, challenge.modeIndex)) : null;
  const points = primaryLayout
    ? primaryLayout.route.map(([x,z]) => new THREE.Vector3(x * 10, .08, 4 - z * dist))
    : capstone
    ? [
      new THREE.Vector3(0, 0.08, 4),
      new THREE.Vector3(-5, 0.08, -6),
      new THREE.Vector3(4, 0.08, -14),
      new THREE.Vector3(-4, 0.08, -22),
      new THREE.Vector3(5, 0.08, -30),
      new THREE.Vector3(-3, 0.08, -38),
      new THREE.Vector3(4, 0.08, finishZ + 14),
      new THREE.Vector3(-2, 0.08, finishZ + 6),
      new THREE.Vector3(0, 0.08, finishZ),
    ]
    : [
      new THREE.Vector3(0, 0.08, 4),
      new THREE.Vector3(-4, 0.08, -4),
      new THREE.Vector3(3.5, 0.08, -12),
      new THREE.Vector3(-3, 0.08, -20),
      new THREE.Vector3(2, 0.08, finishZ + 8),
      new THREE.Vector3(0, 0.08, finishZ),
    ];
  const curve = new THREE.CatmullRomCurve3(points);
  scene.userData._chassisCurve = curve;

  const kidClarity = !!scene.userData.kidClarity;
  const nintendoClean = isPrimaryStudioChassis(challenge?.chassisId);
  if (nintendoClean) scene.userData.nintendoClean = true;
  buildRouteAlongCurve(scene, curve, theme, {
    capstone,
    checkpointCount: nintendoClean ? 3 : (kidClarity ? Math.min(cpCount, 3) : cpCount),
    addCoins: false,
    tileCount: nintendoClean ? 0 : (kidClarity ? (capstone ? 14 : 10) : (capstone ? 36 : 24)),
    nintendoClean,
  });

  const startMat = new THREE.MeshStandardMaterial({
    color: 0x22c55e, roughness: 0.92, emissive: 0x22c55e, emissiveIntensity: nintendoClean ? 0.12 : 0.45,
  });
  if (nintendoClean) {
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.3, 0.18, 24), startMat);
    pad.position.set(0, 0.09, 4);
    pad.receiveShadow = true;
    scene.add(pad);
  } else {
    [-3.5, 3.5].forEach((sx) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 3.5, 10), startMat);
      post.position.set(sx, 1.75, 4);
      scene.add(post);
    });
  }

  goalMarker(scene, 0, finishZ, theme.goal || 0xfbbf24, nintendoClean ? null : (capstone ? 'CAPSTONE FINISH' : (theme.goalLabel || 'MISSION GOAL')));
  scene.userData.arenaBounds = { camMinZ: finishZ - 14, camMaxZ: 14, camMaxX: 24, floorLen: dist + 20 };
  if (capstone) scene.userData.capstoneRoute = true;
  updateMissionMinimap(scene, curve);

  const chassisId = challenge?.chassisId || '';
  const hasBespokeLook = !!getMissionVisual(challenge, challenge?.environmentId)?.look;
  if (!kidClarity && !hasBespokeLook && !isCarChassis(chassisId) && chassisId !== 'footballbot') {
    const family = challenge?.environmentId || 'industrial';
    const sceneryFamily = family === 'hybrid_race_sky' ? 'sky_aerial' : family;
    dressRouteCorridor(scene, curve, sceneryFamily);
    scene.userData.routeCorridorDressed = true;
  }
}

/** Shared neon road tiles + checkpoint gates along any mission curve. */
export function buildRouteAlongCurve(scene, curve, theme, options = {}) {
  const {
    capstone = false,
    checkpointCount = 0,
    addCoins = false,
    tileCount = 28,
    nintendoClean = false,
  } = options;
  const pathCol = theme.path || 0x22c55e;
  const glowCol = theme.glow || 0x06b6d4;

  const legacyGroup = new THREE.Group();
  legacyGroup.name = 'MissionLegacyRoute';
  scene.add(legacyGroup);

  if (nintendoClean) {
    const samples = [];
    for (let i = 0; i <= 28; i++) {
      const p = curve.getPoint(i / 28);
      samples.push(new THREE.Vector3(p.x, 0.07, p.z));
    }
    const ribbonCurve = new THREE.CatmullRomCurve3(samples);
    legacyGroup.add(new THREE.Mesh(
      new THREE.TubeGeometry(ribbonCurve, 40, 1.25, 8, false),
      new THREE.MeshStandardMaterial({
        color: 0xfff7d6,
        roughness: 0.96,
        metalness: 0,
        emissive: glowCol,
        emissiveIntensity: 0.1,
      }),
    ));
    const edgeMat = new THREE.MeshStandardMaterial({
      color: pathCol,
      roughness: 0.9,
      emissive: pathCol,
      emissiveIntensity: 0.18,
    });
    legacyGroup.add(new THREE.Mesh(
      new THREE.TubeGeometry(ribbonCurve, 40, 0.22, 6, false),
      edgeMat,
    ));
    const steps = capstone ? 16 : 12;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const p = curve.getPoint(t);
      const tan = curve.getTangent(t).normalize();
      const yaw = Math.atan2(tan.x, tan.z);
      const pad = new THREE.Mesh(
        new THREE.CylinderGeometry(2.55, 2.7, 0.12, 14),
        new THREE.MeshStandardMaterial({
          color: i % 2 === 0 ? 0xfff7d6 : 0xffe8b8,
          roughness: 0.94,
          emissive: glowCol,
          emissiveIntensity: 0.07,
        }),
      );
      pad.position.set(p.x, 0.1, p.z);
      pad.rotation.y = yaw;
      pad.receiveShadow = true;
      legacyGroup.add(pad);
    }
  } else {
    const roadTex = makeRoadTexture(pathCol, glowCol);
    const pathMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      map: roadTex,
      emissive: glowCol,
      emissiveIntensity: capstone ? 0.35 : 0.28,
      roughness: 0.45,
      metalness: 0.25,
    });
    const curbMat = new THREE.MeshStandardMaterial({
      color: pathCol, emissive: glowCol, emissiveIntensity: 0.42, roughness: 0.35, metalness: 0.4,
    });
    const tiles = Math.max(1, tileCount);
    for (let i = 0; i <= tiles; i++) {
      const t = i / tiles;
      const p = curve.getPoint(t);
      const tan = curve.getTangent(t).normalize();
      const yaw = Math.atan2(tan.x, tan.z);
      const tile = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.14, 2.4), pathMat);
      tile.position.copy(p);
      tile.rotation.y = yaw;
      tile.receiveShadow = true;
      legacyGroup.add(tile);
      [-2.95, 2.95].forEach((ox) => {
        const curb = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.22, 2.5), curbMat);
        const lx = p.x + Math.cos(yaw) * ox;
        const lz = p.z - Math.sin(yaw) * ox;
        curb.position.set(lx, 0.11, lz);
        curb.rotation.y = yaw;
        legacyGroup.add(curb);
      });
    }
  }

  if (checkpointCount > 0) {
    scene.userData.chassisCheckpoints = [];
    scene.userData.chassisCheckpointTotal = checkpointCount;
    const cpCols = nintendoClean
      ? [0xfbbf24, 0x38bdf8, 0xf472b6]
      : [0x22c55e, 0x3b82f6, 0xf59e0b, 0xec4899, 0xa855f7];
    for (let ci = 0; ci < checkpointCount; ci++) {
      const t = (ci + 1) / (checkpointCount + 1);
      const p = curve.getPoint(t);
      const col = cpCols[ci % cpCols.length];
      if (nintendoClean) {
        const gate = new THREE.Group();
        gate.name = 'cp';
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(1.75, 0.16, 8, 24),
          new THREE.MeshStandardMaterial({
            color: col, roughness: 0.65, emissive: col, emissiveIntensity: 0.35,
            transparent: true, opacity: 0.95,
          }),
        );
        ring.rotation.x = Math.PI / 2;
        ring.position.y = 1.35;
        gate.add(ring);
        const star = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.5, 0),
          new THREE.MeshStandardMaterial({ color: col, roughness: 0.7, emissive: col, emissiveIntensity: 0.4 }),
        );
        star.position.y = 1.35;
        star.rotation.y = Math.PI / 4;
        gate.add(star);
        gate.position.set(p.x, 0, p.z);
        scene.add(gate);
      } else {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(2.1, 0.12, 8, 24),
          new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 1.4, transparent: true, opacity: 0.92 }),
        );
        ring.rotation.x = Math.PI / 2;
        ring.position.set(p.x, 0.85, p.z);
        ring.name = 'cp';
        scene.add(ring);
        [-2.1, 2.1].forEach((ox) => {
          const post = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.1, 1.5, 8),
            new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.85 }),
          );
          post.position.set(p.x + ox, 0.75, p.z);
          scene.add(post);
        });
      }
      scene.userData.chassisCheckpoints.push({ x: p.x, z: p.z, index: ci, passed: false });
      if (addCoins) {
        const coin = buildCoin(1.0);
        scene.add(coin);
        addCollectible(scene, coin, p.x, 1.1, p.z, 15, 1.0, 'coin');
        animateCollectible(coin, ci * 0.8);
      }
    }
  }
}

export function updateMissionMinimap(scene, curve) {
  if (!curve) return;
  const minimapPts = [];
  for (let mi = 0; mi <= 32; mi++) {
    const mp = curve.getPoint(mi / 32);
    minimapPts.push({ x: mp.x, z: mp.z });
  }
  scene.userData.missionMinimap = {
    points: minimapPts,
    bounds: scene.userData.arenaBounds,
    checkpoints: (scene.userData.chassisCheckpoints || []).map((c) => ({ x: c.x, z: c.z })),
  };
}

/** Build route curve from campaign mission arenaSetup (goal, waypoints, collectibles). */
export function buildMissionRouteFromSetup(scene, setup = {}, challenge = null) {
  if (!setup || scene.userData._chassisCurve) return false;
  const pts = [new THREE.Vector3(0, 0.08, 4)];
  const seen = new Set();
  const addPt = (x, z) => {
    if (x == null || z == null) return;
    const key = `${x.toFixed(1)},${z.toFixed(1)}`;
    if (seen.has(key)) return;
    seen.add(key);
    pts.push(new THREE.Vector3(x, 0.08, z));
  };
  (setup.waypoints || []).forEach((wp) => addPt(wp.x, wp.z));
  const ordered = [...(setup.collectibles || [])]
    .filter((c) => c.order != null)
    .sort((a, b) => a.order - b.order);
  ordered.forEach((c) => addPt(c.x, c.z));
  (setup.collectibles || []).filter((c) => c.order == null).forEach((c) => addPt(c.x, c.z));
  (setup.zones || []).forEach((z) => addPt(z.x, z.z));
  (setup.obstacles || []).slice(0, 8).forEach((o) => addPt(o.x, o.z));
  if (setup.goal) addPt(setup.goal.x, setup.goal.z);
  if (pts.length < 2) return false;
  const curve = new THREE.CatmullRomCurve3(pts);
  scene.userData._chassisCurve = curve;
  scene.userData._missionRoute = true;

  const minZ = Math.min(...pts.map((p) => p.z));
  const maxZ = Math.max(...pts.map((p) => p.z));
  const maxAbsX = Math.max(...pts.map((p) => Math.abs(p.x)));
  scene.userData.arenaBounds = scene.userData.arenaBounds || {
    camMinZ: minZ - 14,
    camMaxZ: maxZ + 14,
    camMaxX: Math.max(24, maxAbsX + 10),
    floorLen: Math.max(40, maxZ - minZ + 20),
  };

  const theme = scene.userData.arenaTheme || { path: 0x22c55e, glow: 0x06b6d4, goal: 0xfbbf24 };
  const wpCount = (setup.waypoints || []).length;
  const cpCount = wpCount > 0 ? wpCount : Math.max(3, Math.min(8, pts.length - 1));
  const tileCount = Math.max(20, Math.min(48, pts.length * 4));

  buildRouteAlongCurve(scene, curve, theme, {
    checkpointCount: cpCount,
    addCoins: false,
    tileCount,
  });
  updateMissionMinimap(scene, curve);

  const family = challenge?.environmentId || scene.userData.environmentId || 'industrial';
  const sceneryFamily = family === 'hybrid_race_sky' ? 'sky_aerial' : family;
  if (!scene.userData.routeCorridorDressed) {
    dressRouteCorridor(scene, curve, sceneryFamily);
    scene.userData.routeCorridorDressed = true;
  }

  return true;
}

export function emberParticles(scene, count = 280) {
  const pos = new Float32Array(count * 3);
  const vel = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 50;
    pos[i * 3 + 1] = Math.random() * 14;
    pos[i * 3 + 2] = -Math.random() * 40;
    vel[i * 3] = (Math.random() - 0.5) * 0.4;
    vel[i * 3 + 1] = 0.4 + Math.random() * 0.8;
    vel[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xff6600, size: 0.14, transparent: true, opacity: 0.65,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  });
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);
  arenaMover(scene, (t, dt) => {
    const a = geo.attributes.position.array;
    for (let i = 0; i < count; i++) {
      a[i * 3] += vel[i * 3] * dt;
      a[i * 3 + 1] += vel[i * 3 + 1] * dt;
      a[i * 3 + 2] += vel[i * 3 + 2] * dt;
      if (a[i * 3 + 1] > 14) { a[i * 3 + 1] = 0; a[i * 3] = (Math.random() - 0.5) * 50; }
    }
    geo.attributes.position.needsUpdate = true;
    mat.opacity = 0.5 + Math.sin(t * 2) * 0.15;
  });
}

export function snowParticles(scene, count = 320) {
  const pos = new Float32Array(count * 3);
  const vel = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 55;
    pos[i * 3 + 1] = Math.random() * 16;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 45 - 10;
    vel[i * 3] = 0.3 + Math.random() * 0.6;
    vel[i * 3 + 1] = -0.8 - Math.random() * 1.2;
    vel[i * 3 + 2] = (Math.random() - 0.5) * 0.4;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xffffff, size: 0.1, transparent: true, opacity: 0.85, depthWrite: false, sizeAttenuation: true,
  });
  scene.add(new THREE.Points(geo, mat));
  arenaMover(scene, (t, dt) => {
    const a = geo.attributes.position.array;
    for (let i = 0; i < count; i++) {
      a[i * 3] += vel[i * 3] * dt + Math.sin(t + i) * dt * 0.15;
      a[i * 3 + 1] += vel[i * 3 + 1] * dt;
      a[i * 3 + 2] += vel[i * 3 + 2] * dt;
      if (a[i * 3 + 1] < 0) { a[i * 3 + 1] = 14; a[i * 3] = (Math.random() - 0.5) * 55; }
    }
    geo.attributes.position.needsUpdate = true;
  });
}

export function bubbleParticles(scene, count = 200, color = 0x7dd3fc) {
  const pos = new Float32Array(count * 3);
  const vel = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 40;
    pos[i * 3 + 1] = Math.random() * 10;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 40 - 10;
    vel[i * 3] = (Math.random() - 0.5) * 0.2;
    vel[i * 3 + 1] = 0.25 + Math.random() * 0.35;
    vel[i * 3 + 2] = (Math.random() - 0.5) * 0.15;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color, size: 0.12, transparent: true, opacity: 0.7,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  });
  scene.add(new THREE.Points(geo, mat));
  arenaMover(scene, (t, dt) => {
    const a = geo.attributes.position.array;
    for (let i = 0; i < count; i++) {
      a[i * 3] += vel[i * 3] * dt;
      a[i * 3 + 1] += vel[i * 3 + 1] * dt;
      a[i * 3 + 2] += vel[i * 3 + 2] * dt;
      if (a[i * 3 + 1] > 12) { a[i * 3 + 1] = 0; }
    }
    geo.attributes.position.needsUpdate = true;
  });
}

export function dustParticles(scene, count = 240, color = 0xd97706) {
  const pos = new Float32Array(count * 3);
  const vel = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 50;
    pos[i * 3 + 1] = Math.random() * 6;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 50 - 10;
    vel[i * 3] = (Math.random() - 0.5) * 0.5;
    vel[i * 3 + 1] = Math.random() * 0.15;
    vel[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color, size: 0.08, transparent: true, opacity: 0.45, depthWrite: false, sizeAttenuation: true,
  });
  scene.add(new THREE.Points(geo, mat));
  arenaMover(scene, (t, dt) => {
    const a = geo.attributes.position.array;
    for (let i = 0; i < count; i++) {
      a[i * 3] += vel[i * 3] * dt;
      a[i * 3 + 1] += vel[i * 3 + 1] * dt;
      a[i * 3 + 2] += vel[i * 3 + 2] * dt;
      if (a[i * 3 + 1] > 6) a[i * 3 + 1] = 0;
    }
    geo.attributes.position.needsUpdate = true;
  });
}

export function emergencyLights(scene, positions) {
  positions.forEach(([x, y, z], i) => {
    const red = new THREE.PointLight(0xff2222, 0, 14);
    const blue = new THREE.PointLight(0x2266ff, 0, 14);
    red.position.set(x, y, z);
    blue.position.set(x + 0.3, y, z + 0.3);
    scene.add(red, blue);
    const ph = i * 1.7;
    arenaMover(scene, (t) => {
      const pulse = Math.sin(t * 6 + ph);
      red.intensity = pulse > 0 ? 1.8 : 0.15;
      blue.intensity = pulse < 0 ? 1.8 : 0.15;
    });
  });
}

export function regolithMat() {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#c1440e';
  ctx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 300; i++) {
    ctx.fillStyle = `rgba(${120 + Math.random() * 60},${40 + Math.random() * 30},${10 + Math.random() * 20},0.35)`;
    ctx.fillRect(Math.random() * 128, Math.random() * 128, 2, 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 8);
  return new THREE.MeshStandardMaterial({ map: tex, color: 0xc1440e, roughness: 0.95, metalness: 0.05 });
}

export function concreteFactoryMat() {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#374151';
  ctx.fillRect(0, 0, 128, 128);
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 3;
  for (let y = 16; y < 128; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(128, y);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  return new THREE.MeshStandardMaterial({ map: tex, color: 0x374151, roughness: 0.88, metalness: 0.1 });
}
