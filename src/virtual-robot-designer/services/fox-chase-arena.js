/**
 * fox-chase-arena.js — Clean winding driving course for Fox Battery Chase
 * Wheeled robots TURN around obstacles — no jumping. Clear lanes, minimal clutter.
 */
import * as THREE from 'three';
import { createPlasticMaterial, WORLD_COLORS } from './art-direction.js';

/** 9 zone waypoints — S-curve driving route */
export const FOX_CHASE_WAYPOINTS = [
  { x: 0,   z: 4,   name: 'FOREST ENTRANCE', col: '#22c55e', num: 1 },
  { x: 0,   z: -2,  name: 'PAW PRINT TRAIL', col: '#06b6d4', num: 2 },
  { x: -3,  z: -9,  name: 'RIVER CROSSING',  col: '#3b82f6', num: 3 },
  { x: 2,   z: -15, name: 'ROOT GATE',       col: '#d97706', num: 4 },
  { x: -4,  z: -21, name: 'WINDY CANYON',    col: '#a8a29e', num: 5 },
  { x: 3,   z: -27, name: 'FOX CHASE',       col: '#f97316', num: 6 },
  { x: -2,  z: -33, name: 'HIDDEN CAVE',     col: '#0d9488', num: 7 },
  { x: 1,   z: -39, name: 'ESCAPE BRIDGE',   col: '#dc2626', num: 8 },
  { x: 0,   z: -46, name: 'POWER SHRINE',    col: '#fbbf24', num: 9 },
];

const F_NAMES = FOX_CHASE_WAYPOINTS.map((w) => w.name);
const F_COLS = FOX_CHASE_WAYPOINTS.map((w) => w.col);

const PATH_WIDTH = 5.5;
const LANE_HALF = 2.2;

export function buildPathPoints(waypoints, spacing = 1.8) {
  const pts = [];
  for (let i = 0; i < waypoints.length - 1; i++) {
    const a = waypoints[i];
    const b = waypoints[i + 1];
    const dx = b.x - a.x;
    const dz = b.z - a.z;
    const len = Math.hypot(dx, dz);
    const steps = Math.max(1, Math.ceil(len / spacing));
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      pts.push([a.x + dx * t, a.z + dz * t]);
    }
  }
  return pts;
}

/** Cyan ground arrow — "TURN this way" hint for young coders */
function addTurnHint(g, x, z, rotY, side = 'left') {
  const mat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8, transparent: true, opacity: 0.92, depthWrite: false, side: THREE.DoubleSide,
  });
  const tri = new THREE.Shape();
  tri.moveTo(0, 0.45);
  tri.lineTo(-0.35, -0.2);
  tri.lineTo(0.35, -0.2);
  tri.closePath();
  const mesh = new THREE.Mesh(new THREE.ShapeGeometry(tri), mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.rotation.z = rotY;
  mesh.position.set(x, 0.14, z);
  g.add(mesh);
  const labelMat = new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.85 });
  const bar = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.22), labelMat);
  bar.rotation.x = -Math.PI / 2;
  bar.position.set(x, 0.13, z + (side === 'left' ? 0.9 : -0.9));
  g.add(bar);
}

/** Clean boardwalk + center line — no bush spam */
export function buildFoxChasePath(g, scene, { tileMat, glowMat, railMat }) {
  const pathPts = buildPathPoints(FOX_CHASE_WAYPOINTS);
  scene.userData.coursePath = pathPts;

  for (let i = 0; i < pathPts.length - 1; i++) {
    const [x0, z0] = pathPts[i];
    const [x1, z1] = pathPts[i + 1];
    const dx = x1 - x0;
    const dz = z1 - z0;
    const len = Math.hypot(dx, dz) || 0.01;
    const ang = Math.atan2(dx, dz);
    const tile = new THREE.Mesh(
      new THREE.BoxGeometry(PATH_WIDTH, 0.1, Math.min(len + 0.15, 2.1)),
      tileMat
    );
    tile.position.set((x0 + x1) / 2, 0.05, (z0 + z1) / 2);
    tile.rotation.y = ang;
    tile.receiveShadow = true;
    g.add(tile);

    if (glowMat && i % 2 === 0) {
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.04, Math.min(len + 0.1, 1.9)),
        glowMat
      );
      stripe.position.set((x0 + x1) / 2, 0.11, (z0 + z1) / 2);
      stripe.rotation.y = ang;
      g.add(stripe);
    }
  }

  // Sparse rail posts at path edges (every ~8m) — defines corridor without clutter
  if (railMat) {
    pathPts.forEach(([px, pz], i) => {
      if (i % 5 !== 0) return;
      [-LANE_HALF - 0.3, LANE_HALF + 0.3].forEach((ox) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.55, 6), railMat);
        post.position.set(px + ox, 0.28, pz);
        g.add(post);
      });
    });
  }

  return pathPts;
}

/**
 * Driving obstacles — block ONE lane only so the robot TURNs around them.
 * No full-width blocks. No vines / jump puzzles.
 */
export function buildFoxChaseObstacles(g, scene, mats) {
  if (!scene.userData.obstacles) scene.userData.obstacles = [];

  const { woodDarkMat, rockMat } = mats;

  // Zone 2 — log on RIGHT lane → drive LEFT around it
  const logBlk = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 2.4, 8), woodDarkMat);
  logBlk.rotation.z = Math.PI / 2;
  logBlk.position.set(1.6, 0.32, -4.2);
  logBlk.castShadow = true;
  g.add(logBlk);
  scene.userData.obstacles.push({ mesh: logBlk, radius: 0.72, type: 'log' });
  addTurnHint(g, -1.2, -4.2, Math.PI / 2, 'left');

  // Zone 3 — rock on left side before river bend
  const rock1 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.55, 1), rockMat);
  rock1.position.set(-4.8, 0.45, -8.5);
  g.add(rock1);
  scene.userData.obstacles.push({ mesh: rock1, radius: 0.65, type: 'rock' });
  addTurnHint(g, -2.5, -8.5, -Math.PI / 2, 'right');

  // Zone 4 — stump on right side of gate area
  const stump = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.55, 0.9, 8), woodDarkMat);
  stump.position.set(3.2, 0.45, -14.8);
  g.add(stump);
  scene.userData.obstacles.push({ mesh: stump, radius: 0.6, type: 'stump' });
  addTurnHint(g, 0.8, -14.8, Math.PI / 2, 'left');

  // Zone 5 — boulder on left edge of canyon path
  const boulder = new THREE.Mesh(new THREE.DodecahedronGeometry(0.7, 1), rockMat);
  boulder.position.set(-5.8, 0.55, -20.5);
  g.add(boulder);
  scene.userData.obstacles.push({ mesh: boulder, radius: 0.75, type: 'boulder' });
  addTurnHint(g, -3.2, -20.5, -Math.PI / 2, 'right');
}

/** Minimal backdrop trees — far from the driving lane */
export function buildFoxMinimalBackdrop(g, trunkMat, canopyMat) {
  const spots = [
    [-14, 2], [14, 0], [-15, -12], [15, -14], [-13, -26], [14, -28], [-12, -40], [13, -42],
  ];
  spots.forEach(([tx, tz]) => {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.42, 3.8, 7), trunkMat);
    trunk.position.set(tx, 1.9, tz);
    g.add(trunk);
    const canopy = new THREE.Mesh(new THREE.SphereGeometry(1.4, 8, 7), canopyMat);
    canopy.position.set(tx, 4.2, tz);
    g.add(canopy);
  });
}

/** Coins placed ON the path centerline only — not scattered everywhere */
export function buildFoxPathCoins(scene, g, pathPts, placeCoinFn) {
  if (!placeCoinFn || !pathPts?.length) return;
  const step = Math.max(4, Math.floor(pathPts.length / 18));
  const pts = [];
  for (let i = step; i < pathPts.length - step; i += step) {
    pts.push([pathPts[i][0], 0.35, pathPts[i][1]]);
  }
  placeCoinFn(scene, g, pts);
}

export function buildFoxPawPrints(g, pathPts, pawMat) {
  const pawStep = Math.max(5, Math.floor(pathPts.length / 10));
  for (let i = pawStep; i < pathPts.length - pawStep; i += pawStep) {
    const [px, pz] = pathPts[i];
    const main = new THREE.Mesh(new THREE.CircleGeometry(0.22, 8), pawMat);
    main.rotation.x = -Math.PI / 2;
    main.position.set(px, 0.02, pz);
    g.add(main);
  }
}

export function buildFoxForestZones(dist, isGameMission, finishZ) {
  const fz9 = FOX_CHASE_WAYPOINTS.map((wp) => ({
    x: wp.x, z: wp.z, col: wp.col, name: wp.name, num: wp.num,
  }));
  const forestZones = fz9.map((z, i) => ({
    ...z, zMin: z.z - 5, zMax: (fz9[i - 1]?.z ?? z.z + 6),
  }));
  if (isGameMission) {
    forestZones.push({
      x: 0, z: finishZ - 1, col: '#f472b6', name: 'CREATE YOUR GAME', num: 10,
      zMin: finishZ - 8, zMax: finishZ + 4,
    });
  }
  return { fz9, forestZones };
}

export function calcPathProgress(rs, coursePath) {
  if (!coursePath?.length) return 0;
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < coursePath.length; i++) {
    const dx = rs.x - coursePath[i][0];
    const dz = rs.z - coursePath[i][1];
    const d = dx * dx + dz * dz;
    if (d < bestD) { bestD = d; best = i; }
  }
  return Math.min(100, (best / Math.max(1, coursePath.length - 1)) * 100);
}

export function calcFoxZoneIndex(rs, forestZones) {
  let zIdx = 0;
  for (let zi = 0; zi < forestZones.length; zi++) {
    const zd = forestZones[zi];
    const dx = rs.x - (zd.x || 0);
    const dz = rs.z - zd.z;
    const dist2d = Math.sqrt(dx * dx + dz * dz);
    if (dist2d < 10 || rs.z <= zd.z + 3) zIdx = Math.max(zIdx, zi);
  }
  return zIdx;
}

export { F_NAMES, F_COLS };
