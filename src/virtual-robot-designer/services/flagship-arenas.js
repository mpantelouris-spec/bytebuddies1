/**
 * flagship-arenas.js — Visual environments for 8 flagship Robot Studio courses
 */
import * as THREE from 'three';

function addFloor(g, w, len, color, centerZ = 0) {
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(w, len),
    new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.08 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = centerZ;
  floor.receiveShadow = true;
  g.add(floor);
  return floor;
}

function addFinishGate(g, z, color = 0xfbbf24) {
  const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1.4 });
  [-4, 4].forEach((x) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 4.2, 10), mat);
    post.position.set(x, 2.1, z);
    g.add(post);
  });
  const beam = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.25, 0.25), mat);
  beam.position.set(0, 4.2, z);
  g.add(beam);
}

function buildLinePath(dist, wobble = 0.4, freq = 0.06, steps = 80) {
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const z = 5 - t * dist;
    const x = Math.sin(z * freq + Math.PI * 0.3) * wobble + Math.cos(z * freq * 0.6) * wobble * 0.35;
    points.push(new THREE.Vector3(x, 0, z));
  }
  return points;
}

function drawGlowLine(g, points, color, width = 0.16) {
  const lineMat = new THREE.MeshStandardMaterial({
    color, emissive: color, emissiveIntensity: 1.8, roughness: 0.5,
  });
  const glowMat = new THREE.MeshStandardMaterial({
    color, emissive: color, emissiveIntensity: 0.5, transparent: true, opacity: 0.35,
  });
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const len = Math.sqrt(dx * dx + dz * dz) || 0.01;
    const angle = Math.atan2(dx, dz);
    const core = new THREE.Mesh(new THREE.BoxGeometry(width, 0.04, len + 0.06), lineMat);
    core.position.set((a.x + b.x) / 2, 0.022, (a.z + b.z) / 2);
    core.rotation.y = angle;
    g.add(core);
    if (i % 3 === 0) {
      const glow = new THREE.Mesh(new THREE.BoxGeometry(width * 3, 0.02, len * 3 + 0.1), glowMat);
      glow.position.set((a.x + b.x) / 2, 0.01, (a.z + b.z) / 2);
      glow.rotation.y = angle;
      g.add(glow);
    }
  }
}

/** COURSE 1 — Underground transit tunnel with neon cyan track */
export function buildTransitTunnelArena(scene, ch = {}) {
  const g = new THREE.Group();
  g.name = 'arena';
  const level = ch?.flagshipLevel || ch?.trackLevel || 1;
  const dist = Math.max(28, ch?.totalDist || 36);
  const finishZ = 5 - dist;
  const centerZ = (5 + finishZ) / 2;
  const floorLen = dist + 20;
  const wobble = ch?.wobble ?? (level >= 4 ? 2.2 : level >= 3 ? 1.8 : level >= 2 ? 1.2 : 0.3);
  const freq = level >= 3 ? 0.16 : level >= 2 ? 0.11 : 0.05;

  scene.background = new THREE.Color(0x0a0a1a);
  scene.fog = new THREE.Fog(0x0a0a1a, 35, Math.max(80, floorLen));

  addFloor(g, 34, floorLen, 0x0f172a, centerZ);

  // Metal wall panels
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x1a1a2a, roughness: 0.4, metalness: 0.7 });
  const panelMat = new THREE.MeshStandardMaterial({ color: 0x0066ff, emissive: 0x0099ff, emissiveIntensity: 0.5 });
  [-14, 14].forEach((wx) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.6, 5.5, floorLen), wallMat);
    wall.position.set(wx, 2.75, centerZ);
    g.add(wall);
    for (let z = finishZ + 4; z <= 6; z += 6) {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.2, 2.5), panelMat);
      panel.position.set(wx + (wx < 0 ? 0.35 : -0.35), 2.5, z);
      g.add(panel);
    }
  });

  // Ceiling cable trays
  const trayMat = new THREE.MeshStandardMaterial({ color: 0x888899, metalness: 0.8, roughness: 0.3 });
  for (let z = finishZ + 2; z <= 4; z += 8) {
    const tray = new THREE.Mesh(new THREE.BoxGeometry(20, 0.15, 0.8), trayMat);
    tray.position.set(0, 5.2, z);
    g.add(tray);
  }

  // Overhead strip lights (emissive only — no point lights)
  const stripMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.9 });
  for (let z = finishZ + 3; z <= 5; z += 10) {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(18, 0.08, 0.4), stripMat);
    strip.position.set(0, 5, z);
    g.add(strip);
  }

  const cyan = 0x00ffff;
  const points = buildLinePath(dist, wobble, freq, Math.max(80, Math.floor(dist * 3)));
  drawGlowLine(g, points, cyan);

  // Multi-color forks (level 4+)
  if (ch?.forks || level >= 4) {
    const forkColors = [0x0066ff, 0xef4444];
    [[-3.5, finishZ * 0.35], [3.5, finishZ * 0.65]].forEach(([ox, oz], fi) => {
      for (let s = 0; s < 10; s++) {
        const seg = new THREE.Mesh(
          new THREE.BoxGeometry(0.14, 0.04, 0.9),
          new THREE.MeshStandardMaterial({ color: forkColors[fi], emissive: forkColors[fi], emissiveIntensity: 1.4 })
        );
        seg.position.set(ox + Math.sin(s * 0.4) * 1.2, 0.022, oz - s * 0.85);
        g.add(seg);
      }
    });
  }

  // Distance markers every 5m
  const markerMat = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, emissive: 0x888888, emissiveIntensity: 0.3 });
  for (let m = 5; m <= dist; m += 5) {
    const mz = 5 - m;
    const sign = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.2, 0.08), markerMat);
    sign.position.set(-12, 1.5, mz);
    g.add(sign);
  }

  addFinishGate(g, finishZ, 0x00d9ff);
  scene.userData.arenaBounds = { camMinZ: finishZ - 10, camMaxZ: 12, camMaxX: 20, floorLen };
  scene.add(g);
}

/** COURSE 2 — Bright automated warehouse with conveyors and color bins */
export function buildWarehouseSortArena(scene, ch = {}) {
  const g = new THREE.Group();
  g.name = 'arena';
  const level = ch?.flagshipLevel || 1;
  const dist = Math.max(24, ch?.totalDist || 30);
  const centerZ = (4 - dist) / 2;

  scene.background = new THREE.Color(0xe8e8ec);
  scene.fog = new THREE.Fog(0xe0e0e0, 30, 65);

  addFloor(g, 36, dist + 18, 0xe0e0e0, centerZ);

  // LED ceiling strips
  const ledMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.2 });
  for (let z = 4; z > 4 - dist; z -= 12) {
    const led = new THREE.Mesh(new THREE.BoxGeometry(28, 0.1, 0.5), ledMat);
    led.position.set(0, 6.5, z);
    g.add(led);
  }

  // Color-coded bins
  const binColors = [0xef4444, 0x3b82f6, 0x22c55e, 0xfbbf24];
  const binCount = Math.min(4, 2 + level);
  binColors.slice(0, binCount).forEach((col, i) => {
    const bx = -10 + i * 7;
    const bin = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 2.8, 2.5),
      new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.35, roughness: 0.5 })
    );
    bin.position.set(bx, 1.4, 4 - dist + 3);
    g.add(bin);
    const rim = new THREE.Mesh(
      new THREE.BoxGeometry(2.7, 0.12, 2.7),
      new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 1.0 })
    );
    rim.position.set(bx, 2.85, 4 - dist + 3);
    g.add(rim);
  });

  // Conveyor belts
  const beltMat = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.6, roughness: 0.4 });
  const stripeMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, emissive: 0x3b82f6, emissiveIntensity: 0.5 });
  [[-5, 0], [5, -dist * 0.4]].forEach(([bx, bz]) => {
    const belt = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.2, dist * 0.6), beltMat);
    belt.position.set(bx, 0.1, bz - dist * 0.2);
    g.add(belt);
    for (let z = bz; z > bz - dist * 0.55; z -= 2) {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(2, 0.04, 0.5), stripeMat);
      stripe.position.set(bx, 0.22, z);
      stripe.name = 'beltstripe';
      g.add(stripe);
    }
  });

  // Items on belts
  const itemColors = [0xef4444, 0x3b82f6, 0x22c55e, 0xfbbf24, 0xec4899];
  const itemCount = Math.min(10, 2 + level * 2);
  for (let i = 0; i < itemCount; i++) {
    const col = itemColors[i % itemColors.length];
    const shape = i % 3 === 0 ? new THREE.BoxGeometry(0.5, 0.5, 0.5)
      : i % 3 === 1 ? new THREE.CylinderGeometry(0.25, 0.25, 0.5, 10)
        : new THREE.SphereGeometry(0.28, 8, 8);
    const item = new THREE.Mesh(shape, new THREE.MeshStandardMaterial({ color: col, roughness: 0.4 }));
    item.position.set(-5 + (i % 2) * 10, 0.45, -2 - i * 2.5);
    item.castShadow = true;
    g.add(item);
  }

  // Safety rails
  const railMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xfbbf24, emissiveIntensity: 0.4 });
  [-8, 8].forEach((rx) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.8, dist + 10), railMat);
    rail.position.set(rx, 0.4, centerZ);
    g.add(rail);
  });

  scene.userData.arenaBounds = { camMinZ: 4 - dist - 8, camMaxZ: 10, camMaxX: 18, floorLen: dist + 18 };
  scene.add(g);
}

/** COURSE 3 — Dense tropical jungle expedition */
export function buildJungleExpeditionArena(scene, ch = {}) {
  const g = new THREE.Group();
  g.name = 'arena';
  const level = ch?.flagshipLevel || 1;
  const dist = Math.max(20, ch?.totalDist || 28);
  const obsCount = Math.min(16, ch?.obstacles || 6 + level * 2);
  const centerZ = (4 - dist) / 2;

  scene.background = new THREE.Color(0x003300);
  scene.fog = new THREE.Fog(0x006600, 12, 42);

  addFloor(g, 38, dist + 16, 0x3d2b1a, centerZ);

  // Tan path winding through jungle
  const pathMat = new THREE.MeshStandardMaterial({ color: 0xccaa66, roughness: 0.95 });
  const pathPts = buildLinePath(dist, level >= 3 ? 2.5 : 1.5, 0.08, 40);
  for (let i = 0; i < pathPts.length - 1; i++) {
    const a = pathPts[i];
    const b = pathPts[i + 1];
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const len = Math.sqrt(dx * dx + dz * dz) || 0.01;
    const seg = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.03, len + 0.1), pathMat);
    seg.position.set((a.x + b.x) / 2, 0.015, (a.z + b.z) / 2);
    seg.rotation.y = Math.atan2(dx, dz);
    g.add(seg);
  }

  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x663300, roughness: 0.95 });
  const leafColors = [0x006600, 0x00ff00, 0x228b22, 0x32cd32];
  const rng = (seed) => {
    const x = Math.sin(seed * 127.1) * 43758.5453;
    return x - Math.floor(x);
  };

  for (let i = 0; i < obsCount; i++) {
    const t = (i + 1) / (obsCount + 1);
    const pIdx = Math.floor(t * (pathPts.length - 1));
    const px = pathPts[pIdx].x;
    const pz = pathPts[pIdx].z;
    const side = i % 2 === 0 ? 1 : -1;
    const tx = px + side * (3.5 + rng(i) * 3);
    const tz = pz + (rng(i + 7) - 0.5) * 4;
    const tH = 3.5 + rng(i + 3) * 3;
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, tH, 7), trunkMat);
    trunk.position.set(tx, tH / 2, tz);
    trunk.castShadow = true;
    g.add(trunk);
    const leaf = new THREE.Mesh(
      new THREE.SphereGeometry(1.3 + rng(i) * 0.5, 7, 5),
      new THREE.MeshStandardMaterial({ color: leafColors[i % leafColors.length], roughness: 0.9 })
    );
    leaf.position.set(tx, tH + 0.5, tz);
    g.add(leaf);
  }

  // Bioluminescent accent plants
  const bioMat = new THREE.MeshStandardMaterial({ color: 0x99ff00, emissive: 0x66ff00, emissiveIntensity: 0.8 });
  for (let i = 0; i < 5; i++) {
    const plant = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.8, 6), bioMat);
    plant.position.set((rng(i + 20) - 0.5) * 20, 0.4, 4 - i * (dist / 5));
    g.add(plant);
  }

  // Research station goal
  const stationMat = new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00cc00, emissiveIntensity: 0.7 });
  const station = new THREE.Mesh(new THREE.BoxGeometry(3, 2.5, 3), stationMat);
  station.position.set(0, 1.25, 4 - dist);
  g.add(station);

  scene.userData.arenaBounds = { camMinZ: 4 - dist - 8, camMaxZ: 10, camMaxX: 20, floorLen: dist + 16 };
  scene.add(g);
}

/** COURSE 5 — Post-disaster urban rescue zone */
export function buildDisasterZoneArena(scene, ch = {}) {
  const g = new THREE.Group();
  g.name = 'arena';
  const level = ch?.flagshipLevel || 1;
  const dist = Math.max(22, ch?.totalDist || 30);
  const centerZ = (4 - dist) / 2;

  scene.background = new THREE.Color(0x333333);
  scene.fog = new THREE.FogExp2(0x4a4a4a, 0.025);

  addFloor(g, 40, dist + 20, 0x4a4a4a, centerZ);

  // Collapsed building rubble
  const rubbleMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.95 });
  const debrisPositions = [[-8, -5], [7, -12], [-6, -20], [9, -28], [-4, -35]];
  debrisPositions.slice(0, 2 + level).forEach(([dx, dz], i) => {
    const rubble = new THREE.Mesh(new THREE.BoxGeometry(2 + i, 1.2, 2.5), rubbleMat);
    rubble.position.set(dx, 0.6, dz);
    rubble.rotation.y = i * 0.4;
    g.add(rubble);
  });

  // Hazard zones (red emissive floor patches)
  const hazardMat = new THREE.MeshStandardMaterial({
    color: 0xff0000, emissive: 0xcc3300, emissiveIntensity: 0.6, transparent: true, opacity: 0.5,
  });
  [[-5, -10], [6, -22], [-3, -30]].slice(0, level >= 4 ? 3 : level >= 2 ? 2 : 1).forEach(([hx, hz]) => {
    const hazard = new THREE.Mesh(new THREE.CircleGeometry(2.5, 16), hazardMat);
    hazard.rotation.x = -Math.PI / 2;
    hazard.position.set(hx, 0.02, hz);
    g.add(hazard);
  });

  // Safe evacuation zone (green)
  const safeMat = new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00cc00, emissiveIntensity: 0.5, transparent: true, opacity: 0.45 });
  const safe = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), safeMat);
  safe.rotation.x = -Math.PI / 2;
  safe.position.set(0, 0.02, 4 - dist);
  g.add(safe);

  // Survivor markers (blue glow pillars)
  const survMat = new THREE.MeshStandardMaterial({ color: 0x0099ff, emissive: 0x0066cc, emissiveIntensity: 1.2 });
  const survivorCount = Math.min(4, level);
  for (let i = 0; i < survivorCount; i++) {
    const sz = 4 - (i + 1) * (dist / (survivorCount + 1));
    const marker = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 2, 8), survMat);
    marker.position.set((i % 2 === 0 ? -6 : 6), 1, sz);
    g.add(marker);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.5, 0.08, 8, 24),
      new THREE.MeshStandardMaterial({ color: 0x0099ff, emissive: 0x0099ff, emissiveIntensity: 1.0, transparent: true, opacity: 0.7 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.set((i % 2 === 0 ? -6 : 6), 0.05, sz);
    g.add(ring);
  }

  // Supply caches (green boxes)
  const supplyMat = new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00aa00, emissiveIntensity: 0.6 });
  if (level >= 3) {
    const supply = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.2), supplyMat);
    supply.position.set(-4, 0.6, -8);
    g.add(supply);
  }

  // Emergency lights (emissive, no point lights)
  const emLightMat = new THREE.MeshStandardMaterial({ color: 0xff6633, emissive: 0xff3300, emissiveIntensity: 1.5 });
  [[-12, -6], [12, -18], [-12, -30]].forEach(([lx, lz]) => {
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), emLightMat);
    beacon.position.set(lx, 3.5, lz);
    g.add(beacon);
  });

  scene.userData.arenaBounds = { camMinZ: 4 - dist - 10, camMaxZ: 10, camMaxX: 22, floorLen: dist + 20 };
  scene.add(g);
}

/** COURSE 6 — Professional soccer arena */
export function buildSoccerArena(scene, ch = {}) {
  const g = new THREE.Group();
  g.name = 'arena';
  const level = ch?.flagshipLevel || 1;
  const fieldLen = Math.max(36, ch?.totalDist || 44);
  const centerZ = (6 - fieldLen) / 2;

  scene.background = new THREE.Color(0x1a3a1a);
  scene.fog = new THREE.Fog(0x1a3a1a, 40, 80);

  // Grass field
  addFloor(g, 28, fieldLen + 8, 0x00aa00, centerZ);

  // Field markings
  const lineMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.3 });
  const centerLine = new THREE.Mesh(new THREE.PlaneGeometry(0.12, fieldLen), lineMat);
  centerLine.rotation.x = -Math.PI / 2;
  centerLine.position.set(0, 0.015, centerZ);
  g.add(centerLine);

  // Goals
  const goalMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.5 });
  [[6 - fieldLen, -1], [6, 1]].forEach(([gz, side]) => {
    [-3.5, 3.5].forEach((gx) => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.2, 8), goalMat);
      post.position.set(gx, 1.1, gz);
      g.add(post);
    });
    const crossbar = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.12, 0.12), goalMat);
    crossbar.position.set(0, 2.2, gz);
    g.add(crossbar);
    const goalGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(7, 2),
      new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00ff00, emissiveIntensity: 0.4, transparent: true, opacity: 0.3 })
    );
    goalGlow.position.set(0, 1.1, gz + side * 0.5);
    g.add(goalGlow);
  });

  // Ball (orange)
  const ball = new THREE.Mesh(
    new THREE.SphereGeometry(0.35, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0xff6600, emissive: 0xff4400, emissiveIntensity: 0.4, roughness: 0.5 })
  );
  ball.position.set(0, 0.35, level >= 3 ? -fieldLen * 0.3 : -4);
  ball.name = 'soccerball';
  g.add(ball);

  // Opponent robot placeholder (level 3+)
  if (level >= 3) {
    const oppMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5, metalness: 0.3 });
    const opp = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 1.6), oppMat);
    opp.position.set(4, 0.4, -fieldLen * 0.45);
    g.add(opp);
  }

  // Stadium stands (background)
  const standMat = new THREE.MeshStandardMaterial({ color: 0x555566, roughness: 0.8 });
  [-16, 16].forEach((sx) => {
    const stand = new THREE.Mesh(new THREE.BoxGeometry(3, 4, fieldLen + 6), standMat);
    stand.position.set(sx, 2, centerZ);
    g.add(stand);
  });

  scene.userData.arenaBounds = { camMinZ: 6 - fieldLen - 6, camMaxZ: 10, camMaxX: 16, floorLen: fieldLen + 8 };
  scene.add(g);
}

/** COURSE 7 — Ancient temple stone labyrinth */
export function buildTempleMazeArena(scene, ch = {}) {
  const g = new THREE.Group();
  g.name = 'arena';
  const level = ch?.flagshipLevel || 1;
  const gridSize = level >= 4 ? 12 : level >= 3 ? 10 : level >= 2 ? 8 : 6;
  const cellSize = 2.8;
  const wallH = 2.5;
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.95 });
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x666666, roughness: 0.9 });
  const arenaW = gridSize * cellSize + 4;
  const centerZ = -arenaW / 2 + 4;

  scene.background = new THREE.Color(0x1a1410);
  scene.fog = new THREE.FogExp2(0x2a2018, 0.03);

  addFloor(g, arenaW, arenaW, 0x555555, centerZ);

  // Simple maze walls (grid pattern with gaps)
  const seed = level >= 4 ? Date.now() % 1000 : 42;
  const wallRng = (x, y) => {
    const v = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
    return v - Math.floor(v);
  };

  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      if (x === 0 && y === 0) continue;
      if (x === gridSize - 1 && y === gridSize - 1) continue;
      if (wallRng(x, y) > 0.38) {
        const wx = (x - gridSize / 2) * cellSize;
        const wz = 4 - y * cellSize;
        const wall = new THREE.Mesh(new THREE.BoxGeometry(cellSize * 0.9, wallH, cellSize * 0.9), wallMat);
        wall.position.set(wx, wallH / 2, wz);
        wall.castShadow = true;
        g.add(wall);
      }
    }
  }

  // Torches on walls (emissive)
  const torchMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, emissive: 0xffcc66, emissiveIntensity: 1.5 });
  for (let i = 0; i < 6; i++) {
    const torch = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.4, 6), torchMat);
    torch.position.set((i % 2 === 0 ? -1 : 1) * (gridSize * cellSize * 0.4), 2.2, 4 - i * (gridSize * cellSize / 6));
    g.add(torch);
  }

  // Center chamber glow (goal)
  const goalZ = 4 - (gridSize - 1) * cellSize;
  const chamberMat = new THREE.MeshStandardMaterial({ color: 0x9900ff, emissive: 0x9900ff, emissiveIntensity: 0.8, transparent: true, opacity: 0.6 });
  const chamber = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 0.1, 24), chamberMat);
  chamber.position.set((gridSize / 2 - 1) * cellSize - gridSize * cellSize / 2, 0.05, goalZ);
  g.add(chamber);
  const pillar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.7, 3, 8),
    new THREE.MeshStandardMaterial({ color: 0x888888, emissive: 0x9900ff, emissiveIntensity: 0.4 })
  );
  pillar.position.set((gridSize / 2 - 1) * cellSize - gridSize * cellSize / 2, 1.5, goalZ);
  g.add(pillar);

  scene.userData.arenaBounds = { camMinZ: goalZ - 8, camMaxZ: 10, camMaxX: arenaW / 2, floorLen: arenaW };
  scene.add(g);
}

/** COURSE 8 — Hospital supply corridor */
export function buildHospitalCorridorArena(scene, ch = {}) {
  const g = new THREE.Group();
  g.name = 'arena';
  const level = ch?.flagshipLevel || 1;
  const dist = Math.max(20, ch?.totalDist || 32);
  const centerZ = (4 - dist) / 2;
  const corridorW = level >= 3 ? 8 : 12;

  scene.background = new THREE.Color(0xf0f0f0);
  scene.fog = new THREE.Fog(0xffffff, 25, 55);

  addFloor(g, corridorW + 8, dist + 16, 0xffffff, centerZ);

  // Corridor walls
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xf0f0f0, roughness: 0.6 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0x0066cc, emissive: 0x0099ff, emissiveIntensity: 0.3 });
  [-corridorW / 2 - 0.3, corridorW / 2 + 0.3].forEach((wx) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.25, 3.5, dist + 14), wallMat);
    wall.position.set(wx, 1.75, centerZ);
    g.add(wall);
    for (let z = 4; z > 4 - dist; z -= 8) {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.4, 3), accentMat);
      stripe.position.set(wx + (wx < 0 ? 0.15 : -0.15), 1.5, z);
      g.add(stripe);
    }
  });

  // Fluorescent ceiling panels
  const fluMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 1.0 });
  for (let z = 4; z > 4 - dist; z -= 5) {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(corridorW, 0.08, 1.8), fluMat);
    panel.position.set(0, 3.4, z);
    g.add(panel);
  }

  // Medical equipment obstacles
  const equipMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.5, roughness: 0.4 });
  const warnMat = new THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xffcc00, emissiveIntensity: 0.5 });
  const equipCount = Math.min(8, 2 + level * 2);
  for (let i = 0; i < equipCount; i++) {
    const ez = 4 - (i + 1) * (dist / (equipCount + 1));
    const ex = (i % 2 === 0 ? -1 : 1) * (corridorW / 2 - 1.2);
    const equip = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.5, 0.8), equipMat);
    equip.position.set(ex, 0.75, ez);
    g.add(equip);
    const warn = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), warnMat);
    warn.position.set(ex, 1.6, ez);
    g.add(warn);
  }

  // Delivery bays (green zones)
  const deliveryCount = Math.min(5, level);
  const bayMat = new THREE.MeshStandardMaterial({ color: 0x00cc00, emissive: 0x00aa00, emissiveIntensity: 0.5, transparent: true, opacity: 0.45 });
  for (let i = 0; i < deliveryCount; i++) {
    const bz = 4 - (i + 1) * (dist / (deliveryCount + 1));
    const bay = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 2.5), bayMat);
    bay.rotation.x = -Math.PI / 2;
    bay.position.set((i % 2 === 0 ? 2 : -2), 0.02, bz);
    g.add(bay);
  }

  // Precision floor markers
  const markMat = new THREE.MeshStandardMaterial({ color: 0x0066cc, emissive: 0x0099ff, emissiveIntensity: 0.4 });
  for (let m = 5; m <= dist; m += 5) {
    const mark = new THREE.Mesh(new THREE.RingGeometry(0.3, 0.5, 16), markMat);
    mark.rotation.x = -Math.PI / 2;
    mark.position.set(0, 0.015, 4 - m);
    g.add(mark);
  }

  scene.userData.arenaBounds = { camMinZ: 4 - dist - 6, camMaxZ: 8, camMaxX: corridorW / 2 + 2, floorLen: dist + 16 };
  scene.add(g);
}

/** Route flagship arena types to builders; neon_race uses existing builder */
export function buildFlagshipArena(scene, arenaType, challenge) {
  switch (arenaType) {
    case 'transit_tunnel': buildTransitTunnelArena(scene, challenge); break;
    case 'warehouse_sort': buildWarehouseSortArena(scene, challenge); break;
    case 'jungle_expedition': buildJungleExpeditionArena(scene, challenge); break;
    case 'disaster_zone': buildDisasterZoneArena(scene, challenge); break;
    case 'soccer_arena': buildSoccerArena(scene, challenge); break;
    case 'temple_maze': buildTempleMazeArena(scene, challenge); break;
    case 'hospital_corridor': buildHospitalCorridorArena(scene, challenge); break;
    default: return false;
  }
  return true;
}
