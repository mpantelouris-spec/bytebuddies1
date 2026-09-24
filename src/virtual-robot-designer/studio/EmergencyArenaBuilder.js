/**
 * EmergencyArenaBuilder.js — Visual bible Part 1D (firebot / medbot / rescuedrone family)
 * Bright chunky rescue environments: blaze district, hospital corridors, snow rescue.
 */
import * as THREE from 'three';
import { addWorldMover, addCollectible, buildCoin, animateCollectible } from '../racing/GameWorldBuilder.js';

function _mover(scene, fn) {
  (scene.userData.movers = scene.userData.movers || []).push({ update: fn });
}

function _finishZone(scene, x, z, radius = 3.5, y3d = 0) {
  scene.userData.finishZone = { x, z, radius, y3d };
}

function _makeSkyGradient(scene, stops) {
  const c = document.createElement('canvas');
  c.width = 2;
  c.height = 512;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  stops.forEach(([pos, hex]) => g.addColorStop(pos, hex));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 2, 512);
  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = tex;
}

function _wetAsphaltMat() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#2a2a32';
  ctx.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const r = 8 + Math.random() * 24;
    const grd = ctx.createRadialGradient(x, y, 0, x, y, r);
    grd.addColorStop(0, 'rgba(60,70,90,0.35)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  for (let i = 0; i < 6; i++) {
    const px = 30 + Math.random() * 196;
    const py = 30 + Math.random() * 196;
    const pr = 12 + Math.random() * 28;
    const grd = ctx.createRadialGradient(px, py, 0, px, py, pr);
    grd.addColorStop(0, 'rgba(100,120,160,0.25)');
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  return new THREE.MeshStandardMaterial({ map: tex, color: 0x3a3a44, roughness: 0.35, metalness: 0.55 });
}

function _linoleumMat() {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#e8eef5';
  ctx.fillRect(0, 0, 128, 128);
  ctx.strokeStyle = 'rgba(180,200,220,0.4)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 128; i += 16) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 128);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(128, i);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 8);
  return new THREE.MeshStandardMaterial({ map: tex, color: 0xf0f4f8, roughness: 0.65, metalness: 0.05 });
}

function _snowMat() {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#e8f4ff';
  ctx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 200; i++) {
    ctx.fillStyle = `rgba(200,220,255,${0.15 + Math.random() * 0.25})`;
    ctx.fillRect(Math.random() * 128, Math.random() * 128, 2, 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(10, 10);
  return new THREE.MeshStandardMaterial({ map: tex, color: 0xdce8f8, roughness: 0.92, metalness: 0.02 });
}

function _addEmergencyLights(scene, positions) {
  positions.forEach(([x, y, z], i) => {
    const red = new THREE.PointLight(0xff2222, 0, 14);
    const blue = new THREE.PointLight(0x2266ff, 0, 14);
    red.position.set(x, y, z);
    blue.position.set(x + 0.3, y, z + 0.3);
    scene.add(red, blue);
    const ph = i * 1.7;
    _mover(scene, (t) => {
      const pulse = Math.sin(t * 6 + ph);
      red.intensity = pulse > 0 ? 1.8 : 0.15;
      blue.intensity = pulse < 0 ? 1.8 : 0.15;
    });
  });
}

function _goalMarker(scene, x, z, col, label, y = 1.6) {
  _finishZone(scene, x, z, 3.2, 0);
  const beamMat = new THREE.MeshBasicMaterial({
    color: col, transparent: true, opacity: 0.18, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 2, 12, 16, 1, true), beamMat);
  beam.position.set(x, 6, z);
  scene.add(beam);
  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(0.55, 16, 16),
    new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 1.4 }),
  );
  orb.position.set(x, y, z);
  scene.add(orb);
  const pl = new THREE.PointLight(col, 3, 16);
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
  _mover(scene, (t) => {
    orb.scale.setScalar(0.9 + Math.sin(t * 3) * 0.1);
    pl.intensity = 2.2 + Math.sin(t * 2.5) * 0.7;
    beamMat.opacity = 0.12 + Math.sin(t * 1.6) * 0.06;
  });
}

function _buildChassisRoute(scene, challenge, theme) {
  if (!challenge?.isChassisMode) return;
  const dist = Math.max(28, challenge.totalDist || 32);
  const finishZ = 4 - dist;
  const cpCount = challenge.checkpoints || Math.max(3, Math.floor(dist / 10));
  const pathCol = theme.path || 0x22c55e;
  const glowCol = theme.glow || 0x06b6d4;
  const pathMat = new THREE.MeshStandardMaterial({
    color: pathCol, emissive: glowCol, emissiveIntensity: 0.45, roughness: 0.75,
  });

  const points = [
    new THREE.Vector3(0, 0.08, 4),
    new THREE.Vector3(-4, 0.08, -4),
    new THREE.Vector3(3.5, 0.08, -12),
    new THREE.Vector3(-3, 0.08, -20),
    new THREE.Vector3(2, 0.08, finishZ + 8),
    new THREE.Vector3(0, 0.08, finishZ),
  ];
  const curve = new THREE.CatmullRomCurve3(points);
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    const p = curve.getPoint(t);
    const tan = curve.getTangent(t).normalize();
    const yaw = Math.atan2(tan.x, tan.z);
    const tile = new THREE.Mesh(new THREE.BoxGeometry(5, 0.1, 2), pathMat);
    tile.position.copy(p);
    tile.rotation.y = yaw;
    tile.receiveShadow = true;
    scene.add(tile);
  }

  const cpCols = [0x22c55e, 0x3b82f6, 0xf59e0b, 0xec4899, 0xa855f7];
  for (let ci = 0; ci < cpCount; ci++) {
    const t = (ci + 1) / (cpCount + 1);
    const p = curve.getPoint(t);
    const col = cpCols[ci % cpCols.length];
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
    const coin = buildCoin(1.0);
    scene.add(coin);
    addCollectible(scene, coin, p.x, 1.1, p.z, 15, 1.0, 'coin');
    animateCollectible(coin, ci * 0.8);
  }

  const startMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 1.2 });
  [-3.5, 3.5].forEach((sx) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 3.5, 10), startMat);
    post.position.set(sx, 1.75, 4);
    scene.add(post);
  });

  _goalMarker(scene, 0, finishZ, theme.goal || 0xfbbf24, theme.goalLabel || 'MISSION GOAL');
  scene.userData.arenaBounds = { camMinZ: finishZ - 12, camMaxZ: 14, camMaxX: 22, floorLen: dist + 16 };
}

function _emberParticles(scene, count = 280) {
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
  _mover(scene, (t, dt) => {
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

function _snowParticles(scene, count = 320) {
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
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);
  _mover(scene, (t, dt) => {
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

/** Burning city district — wet asphalt, fire trucks, hydrants, blaze zones */
export function buildFirebotBlazeArena(scene, challenge) {
  scene.userData.movers = [];
  scene.userData.customSky = true;
  scene.userData.customDecor = true;
  scene.userData.lightMood = [0.55, 0.5, 0.85, 0xff6620];

  _makeSkyGradient(scene, [
    [0, '#1a0804'],
    [0.35, '#4a2010'],
    [0.65, '#8a4828'],
    [1, '#2a1008'],
  ]);
  scene.fog = new THREE.Fog(0x3a1808, 22, 78);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), _wetAsphaltMat());
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const buildMat = new THREE.MeshStandardMaterial({ color: 0x3a2820, roughness: 0.88 });
  const winGlow = new THREE.MeshStandardMaterial({ color: 0xff8800, emissive: 0xff4400, emissiveIntensity: 0.9 });
  [[-18, -8], [18, -6], [0, -22], [-14, 12], [16, 14]].forEach(([bx, bz]) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(9, 6, 1.2), buildMat);
    wall.position.set(bx, 3, bz);
    wall.castShadow = true;
    scene.add(wall);
    for (let w = 0; w < 3; w++) {
      const win = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.4), winGlow);
      win.position.set(bx - 2 + w * 2, 2 + w * 0.5, bz + 0.65);
      scene.add(win);
    }
  });

  const truckMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5, metalness: 0.3 });
  const truck = new THREE.Group();
  const cab = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.8, 2.4), truckMat);
  cab.position.set(0, 1.2, 0);
  truck.add(cab);
  const body = new THREE.Mesh(new THREE.BoxGeometry(3.5, 2, 4), truckMat);
  body.position.set(0, 1.4, -2.5);
  truck.add(body);
  const ladder = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.15, 5), new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.6 }));
  ladder.position.set(1.2, 3.2, -1);
  ladder.rotation.z = 0.35;
  truck.add(ladder);
  truck.position.set(-12, 0, 6);
  truck.rotation.y = 0.4;
  scene.add(truck);

  [[8, 8], [-6, -14]].forEach(([hx, hz]) => {
    const hydrant = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.4, 1.1, 8),
      new THREE.MeshStandardMaterial({ color: 0xdc2626, emissive: 0xaa0000, emissiveIntensity: 0.35 }),
    );
    hydrant.position.set(hx, 0.55, hz);
    scene.add(hydrant);
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.5 }),
    );
    cap.position.set(hx, 1.15, hz);
    scene.add(cap);
  });

  const tapeMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xf59e0b, emissiveIntensity: 0.5 });
  for (let i = 0; i < 8; i++) {
    const tape = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 3), tapeMat);
    tape.position.set(-8 + (i % 2) * 16, 0.5, -2 - i * 3);
    tape.rotation.y = (i % 2) * 0.3;
    scene.add(tape);
  }

  const flameCols = [0xff4400, 0xff8800, 0xffcc00];
  [[-14, -6], [2, -16], [14, 4], [-6, 10], [10, -20]].forEach(([fx, fz], i) => {
    for (let f = 0; f < 4; f++) {
      const fMat = new THREE.MeshStandardMaterial({
        color: flameCols[f % 3], emissive: flameCols[f % 3], emissiveIntensity: 1.2,
        transparent: true, opacity: 0.88,
      });
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.55, 1.8 + f * 0.4, 6), fMat);
      flame.position.set(fx + f * 0.7 - 1, 0.9 + f * 0.35, fz);
      scene.add(flame);
      const ph = f * 1.1 + i * 0.8;
      _mover(scene, (t) => {
        flame.scale.y = 0.75 + Math.sin(t * 5 + ph) * 0.35;
        flame.rotation.y += 0.04;
        fMat.emissiveIntensity = 0.7 + Math.sin(t * 4 + ph) * 0.5;
      });
    }
    const pl = new THREE.PointLight(0xff4400, 1.2, 12);
    pl.position.set(fx, 2, fz);
    scene.add(pl);
    _mover(scene, (t) => { pl.intensity = 0.8 + Math.sin(t * 3 + i) * 0.6; });
  });

  [[-20, 6], [6, 18], [-4, -24], [20, -4]].forEach(([bx, bz]) => {
    const beacon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.25, 1.4, 6),
      new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xffaa00, emissiveIntensity: 1.1 }),
    );
    beacon.position.set(bx, 0.7, bz);
    scene.add(beacon);
    const pl = new THREE.PointLight(0xffaa00, 1.5, 8);
    pl.position.set(bx, 1.5, bz);
    scene.add(pl);
    (scene.userData.collectibles = scene.userData.collectibles || []).push({
      mesh: beacon, pos: { x: bx, y: 0.7, z: bz }, radius: 1.1, value: 20, collected: false,
    });
  });

  _emberParticles(scene, 300);
  _addEmergencyLights(scene, [[0, 4, 2], [-10, 3, -8], [12, 3, -12]]);

  scene.add(new THREE.AmbientLight(0x301008, 0.45));
  const sun = new THREE.DirectionalLight(0xff6620, 0.85);
  sun.position.set(8, 16, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.setScalar(1024);
  scene.add(sun);
  const fireGlow = new THREE.PointLight(0xff4400, 1.4, 55);
  fireGlow.position.set(0, 6, -10);
  scene.add(fireGlow);

  if (challenge?.isChassisMode) {
    _buildChassisRoute(scene, challenge, {
      path: 0xdc2626, glow: 0xff4400, goal: 0x22c55e, goalLabel: 'RESCUE ZONE',
    });
  } else {
    _goalMarker(scene, 0, -28, 0x22c55e, 'RESCUE ZONE');
  }
}

/** Hospital corridors — linoleum, gurneys, IV stands, red cross signage */
export function buildHospitalWalkArena(scene, challenge) {
  scene.userData.movers = [];
  scene.userData.customSky = true;
  scene.userData.customDecor = true;
  scene.userData.lightMood = [1.0, 0.95, 0.7];

  _makeSkyGradient(scene, [
    [0, '#e8ecf4'],
    [0.5, '#f4f6fa'],
    [1, '#dce4f0'],
  ]);
  scene.fog = new THREE.Fog(0xd8e4f4, 35, 90);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), _linoleumMat());
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const wallMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.9 });
  const stripeMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 0.35 });
  [-14, 14].forEach((wx) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 4, 80), wallMat);
    wall.position.set(wx, 2, -18);
    scene.add(wall);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.08, 3.5, 80), stripeMat);
    stripe.position.set(wx + (wx < 0 ? 0.25 : -0.25), 2, -18);
    scene.add(stripe);
  });

  for (let z = 2; z > -42; z -= 8) {
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(28, 0.15, 1.2),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, emissive: 0xffffff, emissiveIntensity: 0.15 }),
    );
    panel.position.set(0, 3.8, z);
    scene.add(panel);
    const tube = new THREE.PointLight(0xffffff, 0.6, 10);
    tube.position.set(0, 3.5, z);
    scene.add(tube);
  }

  const crossMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, emissive: 0xdc2626, emissiveIntensity: 0.7 });
  [[-10, 0], [8, -12], [-6, -24]].forEach(([cx, cz]) => {
    const sign = new THREE.Group();
    const h = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.35, 0.12), crossMat);
    const v = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.4, 0.12), crossMat);
    sign.add(h, v);
    sign.position.set(cx, 2.2, cz);
    scene.add(sign);
  });

  [[-8, -6], [6, -18], [-4, -30]].forEach(([gx, gz]) => {
    const gurney = new THREE.Group();
    const bed = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.35, 1.1),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.4, roughness: 0.5 }),
    );
    bed.position.y = 0.55;
    gurney.add(bed);
    const pillow = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.2, 0.5),
      new THREE.MeshStandardMaterial({ color: 0xffffff }),
    );
    pillow.position.set(-0.7, 0.75, 0);
    gurney.add(pillow);
    gurney.position.set(gx, 0, gz);
    scene.add(gurney);
  });

  [[5, -10], [-7, -22]].forEach(([ix, iz]) => {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 2.2, 6),
      new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.7 }),
    );
    pole.position.set(ix, 1.1, iz);
    scene.add(pole);
    const bag = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.5, 0.15),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.75 }),
    );
    bag.position.set(ix, 1.8, iz);
    scene.add(bag);
  });

  const monitorMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, emissive: 0x22c55e, emissiveIntensity: 0.6 });
  const monitor = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.1), monitorMat);
  monitor.position.set(12, 2, -8);
  scene.add(monitor);
  _mover(scene, (t) => {
    monitorMat.emissiveIntensity = 0.4 + Math.sin(t * 4) * 0.35;
  });

  scene.add(new THREE.AmbientLight(0xd8e4f0, 0.9));
  const sun = new THREE.DirectionalLight(0xffffff, 0.75);
  sun.position.set(0, 14, 8);
  sun.castShadow = true;
  scene.add(sun);

  if (challenge?.isChassisMode) {
    _buildChassisRoute(scene, challenge, {
      path: 0x06b6d4, glow: 0x22c55e, goal: 0xdc2626, goalLabel: 'PATIENT WARD',
    });
  } else {
    _goalMarker(scene, 0, -32, 0xdc2626, 'PATIENT WARD');
  }
}

/** Alpine snow rescue — whiteout, pine trees, orange beacons */
export function buildSnowRescueArena(scene, challenge) {
  scene.userData.movers = [];
  scene.userData.customSky = true;
  scene.userData.customDecor = true;
  scene.userData.lightMood = [0.9, 0.85, 0.95];

  _makeSkyGradient(scene, [
    [0, '#b8d4f0'],
    [0.45, '#dce8f8'],
    [0.75, '#eef4fc'],
    [1, '#f4f8ff'],
  ]);
  scene.fog = new THREE.Fog(0xdce8f8, 18, 65);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), _snowMat());
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const pineMat = new THREE.MeshStandardMaterial({ color: 0x1a4a2a, roughness: 0.9 });
  for (let i = 0; i < 16; i++) {
    const x = (Math.random() - 0.5) * 48;
    const z = -Math.random() * 38;
    if (Math.abs(x) < 5) continue;
    const h = 2.5 + Math.random() * 3;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, h * 0.4, 6), pineMat);
    trunk.position.set(x, h * 0.2, z);
    scene.add(trunk);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(1.2 + Math.random() * 0.8, h * 0.7, 7), pineMat);
    cone.position.set(x, h * 0.55, z);
    scene.add(cone);
    const snowCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.9, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95 }),
    );
    snowCap.position.set(x, h * 0.75, z);
    scene.add(snowCap);
  }

  const barrierMat = new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xea580c, emissiveIntensity: 0.45 });
  for (let i = 0; i < 6; i++) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.9, 0.25), barrierMat);
    bar.position.set(-10 + (i % 2) * 20, 0.45, -4 - i * 5);
    bar.rotation.y = (i % 2) * 0.2;
    scene.add(bar);
  }

  [[-12, -8], [4, -16], [-6, -26], [10, -32], [-8, -36]].forEach(([bx, bz], i) => {
    const beacon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.25, 1.6, 6),
      new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xff6600, emissiveIntensity: 1.0 }),
    );
    beacon.position.set(bx, 0.8, bz);
    scene.add(beacon);
    const pl = new THREE.PointLight(0xff8800, 1.2, 10);
    pl.position.set(bx, 1.5, bz);
    scene.add(pl);
    _mover(scene, (t) => { pl.intensity = 0.7 + Math.sin(t * 2.5 + i) * 0.5; });
    (scene.userData.collectibles = scene.userData.collectibles || []).push({
      mesh: beacon, pos: { x: bx, y: 0.8, z: bz }, radius: 1.0, value: 18, collected: false,
    });
  });

  _snowParticles(scene, 350);
  scene.add(new THREE.AmbientLight(0xb8cce8, 0.85));
  const sun = new THREE.DirectionalLight(0xffffff, 0.9);
  sun.position.set(10, 20, 6);
  sun.castShadow = true;
  scene.add(sun);

  if (challenge?.isChassisMode) {
    _buildChassisRoute(scene, challenge, {
      path: 0x93c5fd, glow: 0x38bdf8, goal: 0xffffff, goalLabel: 'RESCUE STATION',
    });
  } else {
    _goalMarker(scene, 0, -34, 0xffffff, 'RESCUE STATION');
  }
}
