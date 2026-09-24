/**
 * LuigiCircuitWorld.js — Italian villa racing estate matching reference art.
 * Red asphalt oval, stone mansion, fountains, Corinthian ruins, cypress, Italian flags.
 */
import * as THREE from 'three';
import { placeAtTrack, sampleTrackFrame } from '../GameWorldBuilder.js';
import { getMKVisual } from './MKTrackVisualSpec.js';
import { sampleTrackBounds, cornerPosition, faceCenter } from './mk-track-layout.js';

const STONE = 0xd4c4a8;
const STONE_DARK = 0xb8a888;
const TERRACOTTA = 0xc45a2a;
const GRASS = 0x3d9e3a;
const CYPRESS = 0x1a5c28;

function trackHeading(curve, t) {
  const frame = sampleTrackFrame(curve, t);
  return frame.rot ?? Math.atan2(frame.tan.x, frame.tan.z);
}

function toonMat(color, extras = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.65,
    metalness: 0.05,
    flatShading: true,
    ...extras,
  });
}

function italianFlag() {
  const g = new THREE.Group();
  const colors = [0x009246, 0xffffff, 0xce2b37];
  colors.forEach((col, i) => {
    const stripe = new THREE.Mesh(
      new THREE.PlaneGeometry(0.42, 0.7),
      new THREE.MeshBasicMaterial({ color: col, side: THREE.DoubleSide }),
    );
    stripe.position.set((i - 1) * 0.42, 3.2, 0);
    g.add(stripe);
  });
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.06, 4.2, 6),
    new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.85, roughness: 0.25 }),
  );
  pole.position.y = 2.1;
  g.add(pole);
  return g;
}

function ornateFountain() {
  const g = new THREE.Group();
  const stone = toonMat(0xf5f0e8, { roughness: 0.4 });
  const water = new THREE.MeshStandardMaterial({
    color: 0x4fc3f7,
    transparent: true,
    opacity: 0.7,
    emissive: 0x2288cc,
    emissiveIntensity: 0.25,
    roughness: 0.1,
  });

  const basin = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.6, 0.7, 24), stone);
  basin.position.y = 0.35;
  g.add(basin);
  const pool = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 0.15, 24), water);
  pool.position.y = 0.62;
  g.add(pool);

  const mid = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2.0, 0.55, 16), stone);
  mid.position.y = 1.35;
  g.add(mid);
  const midPool = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 0.12, 16), water);
  midPool.position.y = 1.6;
  g.add(midPool);

  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.95, 0.4, 12), stone);
  top.position.y = 2.15;
  g.add(top);

  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 1.8, 8), stone);
  stem.position.y = 1.4;
  g.add(stem);

  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const jet = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.09, 1.4 + (i % 2) * 0.5, 6),
      new THREE.MeshBasicMaterial({ color: 0xaaddff, transparent: true, opacity: 0.65 }),
    );
    jet.position.set(Math.cos(a) * 0.45, 2.6, Math.sin(a) * 0.45);
    jet.userData.phase = i * 0.7;
    g.add(jet);
  }
  return g;
}

function corinthianRuin() {
  const g = new THREE.Group();
  const stone = toonMat(STONE);
  const dark = toonMat(STONE_DARK);
  const xs = [-2.4, -0.8, 0.8, 2.4];
  xs.forEach((x) => {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.45, 5.5, 12), stone);
    col.position.set(x, 2.75, 0);
    g.add(col);
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.4, 0.95), dark);
    base.position.set(x, 0.2, 0);
    g.add(base);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.35, 1.0), dark);
    cap.position.set(x, 5.6, 0);
    g.add(cap);
    [-0.25, 0.25].forEach((ox) => {
      const scroll = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), stone);
      scroll.position.set(x + ox, 5.9, 0.25);
      g.add(scroll);
    });
  });
  const entablature = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.55, 1.4), dark);
  entablature.position.set(0, 6.15, 0);
  g.add(entablature);
  const pediment = new THREE.Mesh(new THREE.ConeGeometry(3.4, 1.4, 3), stone);
  pediment.position.set(0, 7.0, 0);
  pediment.rotation.y = Math.PI;
  pediment.scale.set(1, 1, 0.35);
  g.add(pediment);
  return g;
}

function italianVilla() {
  const g = new THREE.Group();
  const wall = toonMat(STONE);
  const roof = toonMat(TERRACOTTA, { roughness: 0.7 });
  const trim = toonMat(0xe8dcc8);

  const main = new THREE.Mesh(new THREE.BoxGeometry(28, 12, 16), wall);
  main.position.y = 6;
  g.add(main);

  const wingL = new THREE.Mesh(new THREE.BoxGeometry(10, 9, 12), wall);
  wingL.position.set(-16, 4.5, 2);
  g.add(wingL);
  const wingR = new THREE.Mesh(new THREE.BoxGeometry(10, 9, 12), wall);
  wingR.position.set(16, 4.5, 2);
  g.add(wingR);

  const tower = new THREE.Mesh(new THREE.BoxGeometry(8, 18, 8), wall);
  tower.position.set(0, 9, -4);
  g.add(tower);
  const towerRoof = new THREE.Mesh(new THREE.ConeGeometry(6.5, 4.5, 4), roof);
  towerRoof.position.set(0, 20, -4);
  towerRoof.rotation.y = Math.PI / 4;
  g.add(towerRoof);

  [[0, 14, 0], [-16, 10.5, 2], [16, 10.5, 2]].forEach(([x, y, z]) => {
    const r = new THREE.Mesh(new THREE.BoxGeometry(x === 0 ? 30 : 12, 1.2, x === 0 ? 18 : 14), roof);
    r.position.set(x, y, z);
    g.add(r);
  });

  for (let floor = 0; floor < 3; floor++) {
    for (let i = -5; i <= 5; i++) {
      if (Math.abs(i) < 1.5 && floor === 0) continue;
      const win = new THREE.Mesh(
        new THREE.PlaneGeometry(1.4, 2.0),
        new THREE.MeshStandardMaterial({
          color: 0x88aacc,
          emissive: 0x334466,
          emissiveIntensity: 0.2,
        }),
      );
      win.position.set(i * 2.2, 3 + floor * 3.5, 8.05);
      g.add(win);
      const frame = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.2, 0.08), trim);
      frame.position.set(i * 2.2, 3 + floor * 3.5, 8.02);
      g.add(frame);
    }
  }

  const door = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 4.5, 0.3),
    toonMat(0x5c3a1e),
  );
  door.position.set(0, 2.25, 8.1);
  g.add(door);

  const balcony = new THREE.Mesh(new THREE.BoxGeometry(8, 0.3, 2.5), trim);
  balcony.position.set(0, 7.5, 9);
  g.add(balcony);

  return g;
}

function cypressTree() {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.28, 2.2, 6),
    toonMat(0x5c3a1e),
  );
  trunk.position.y = 1.1;
  g.add(trunk);
  const foliage = new THREE.Mesh(
    new THREE.ConeGeometry(1.4, 9, 8),
    toonMat(CYPRESS),
  );
  foliage.position.y = 6.5;
  g.add(foliage);
  const tip = new THREE.Mesh(
    new THREE.ConeGeometry(0.7, 3, 6),
    toonMat(0x247a35),
  );
  tip.position.y = 11.5;
  g.add(tip);
  return g;
}

function trimmedBush() {
  return new THREE.Mesh(
    new THREE.SphereGeometry(1.1, 8, 8),
    toonMat(0x2e8b3a),
  );
}

function checkeredStartLine(curve, halfWidth, finishT = 0) {
  const { pos, frame } = placeAtTrack(curve, finishT, 0, 0);
  const rot = frame.rot ?? Math.atan2(frame.tan.x, frame.tan.z);
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const cell = 16;
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      ctx.fillStyle = (x + y) % 2 ? '#111111' : '#ffffff';
      ctx.fillRect(x * cell, y * cell, cell, cell);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(halfWidth * 0.55, 1);
  const line = new THREE.Mesh(
    new THREE.PlaneGeometry(halfWidth * 2.35, 3.0),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.45, metalness: 0.15 }),
  );
  line.rotation.x = -Math.PI / 2;
  line.rotation.z = rot;
  line.position.copy(pos);
  line.position.y = 0.15;
  return line;
}

function buildWhiteGuardrails(curve, root, halfWidth, segments = 220) {
  const group = new THREE.Group();
  group.name = 'luigi-w-beam-rails';
  const railMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.7,
    roughness: 0.28,
  });
  const postMat = toonMat(0x8b6914);
  const postGeo = new THREE.BoxGeometry(0.18, 1.0, 0.18);
  const beamGeo = new THREE.BoxGeometry(1.15, 0.22, 0.08);

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    for (const side of [-1, 1]) {
      const { pos } = placeAtTrack(curve, t, side * (halfWidth + 0.45), 0);
      const rot = trackHeading(curve, t);
      const post = new THREE.Mesh(postGeo, postMat);
      post.position.set(pos.x, 0.5, pos.z);
      post.rotation.y = rot;
      group.add(post);

      if (i < segments) {
        const beam = new THREE.Mesh(beamGeo, railMat);
        beam.position.set(pos.x, 0.72, pos.z);
        beam.rotation.y = rot;
        group.add(beam);
        const beam2 = beam.clone();
        beam2.position.y = 0.48;
        group.add(beam2);
      }
    }
  }
  root.add(group);
  return group;
}

function buildRollingHills(root, bounds) {
  const grassMat = toonMat(GRASS, { roughness: 0.95 });
  grassMat.depthWrite = true;
  const margin = bounds.radius + 35;
  [
    ['nw', 0.85], ['ne', 0.75], ['sw', 0.8], ['se', 0.7],
  ].forEach(([corner, scale]) => {
    const { x, z } = cornerPosition(bounds, corner, margin);
    const hill = new THREE.Mesh(
      new THREE.SphereGeometry(1, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      grassMat,
    );
    hill.position.set(x, -8, z);
    hill.scale.set(38 * scale, 10 * scale, 32 * scale);
    hill.renderOrder = -2;
    root.add(hill);
  });
}

function buildSkyClouds(root, bounds) {
  const cloudMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  });
  ['nw', 'ne', 'w', 'n'].forEach((corner, i) => {
    const spot = cornerPosition(bounds, corner, bounds.radius + 30 + i * 8);
    const cloud = new THREE.Group();
    for (let j = 0; j < 4; j++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(4 + j * 1.2, 8, 8), cloudMat);
      puff.position.set(j * 5 - 6, (j % 2) * 1.5, (j % 3) * 2);
      puff.scale.set(1.4, 0.55, 0.9);
      cloud.add(puff);
    }
    cloud.position.set(spot.x, 52 + i * 4, spot.z);
    cloud.userData.drift = 0.15 + i * 0.03;
    root.add(cloud);
  });
  return root;
}

export function buildLuigiGuardrails(curve, root, halfWidth, segments = 220) {
  return buildWhiteGuardrails(curve, root, halfWidth, segments);
}

export function buildLuigiCircuitWorld(scene, curve, root, opts = {}) {
  const world = new THREE.Group();
  world.name = 'luigi-italian-estate';
  const hw = opts.halfWidth || 4;
  const bounds = sampleTrackBounds(curve);
  const visual = getMKVisual('luigi_circuit');
  const { top, fog, ground } = visual.sky;

  scene.background = new THREE.Color(top);
  scene.fog = new THREE.Fog(fog, visual.fogNear ?? 60, visual.fogFar ?? 280);

  const grass = new THREE.Mesh(
    new THREE.PlaneGeometry(bounds.spanX + 120, bounds.spanZ + 120),
    new THREE.MeshStandardMaterial({ color: ground, roughness: 0.95 }),
  );
  grass.rotation.x = -Math.PI / 2;
  grass.position.set(bounds.cx, -0.08, bounds.cz);
  grass.renderOrder = -3;
  scene.add(grass);

  const hemi = new THREE.HemisphereLight(0xb8e4ff, 0x4a8a3a, 0.9);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff4e0, 1.65);
  sun.position.set(bounds.cx + 40, 70, bounds.cz + 25);
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0x88aacc, 0.35);
  fill.position.set(bounds.cx - 30, 25, bounds.cz - 40);
  scene.add(fill);

  buildRollingHills(world, bounds);
  buildSkyClouds(world, bounds);

  const villa = italianVilla();
  const villaSpot = cornerPosition(bounds, 'nw', 28);
  villa.position.set(villaSpot.x, 0, villaSpot.z);
  villa.rotation.y = faceCenter(bounds, villaSpot.x, villaSpot.z);
  villa.scale.setScalar(1.1);
  world.add(villa);

  const ruin = corinthianRuin();
  const ruinSpot = cornerPosition(bounds, 'sw', 20);
  ruin.position.set(ruinSpot.x, 0, ruinSpot.z);
  ruin.rotation.y = faceCenter(bounds, ruinSpot.x, ruinSpot.z);
  world.add(ruin);

  [[0.22, 1], [0.72, -1]].forEach(([t, side]) => {
    const { pos } = placeAtTrack(curve, t, side * (hw + 12), 0);
    const f = ornateFountain();
    f.position.copy(pos);
    f.scale.setScalar(1.05);
    world.add(f);
  });

  [0, 0.5].forEach((t) => {
    const { pos } = placeAtTrack(curve, t, hw + 10, 0);
    const flag = italianFlag();
    flag.position.copy(pos);
    flag.rotation.y = trackHeading(curve, t);
    world.add(flag);
  });

  for (let i = 0; i < 24; i++) {
    const tree = cypressTree();
    const angle = (i / 24) * Math.PI * 2;
    const r = bounds.radius + 38 + (i % 4) * 6;
    tree.position.set(
      bounds.cx + Math.cos(angle) * r,
      0,
      bounds.cz + Math.sin(angle) * r,
    );
    tree.scale.setScalar(0.85 + (i % 3) * 0.12);
    world.add(tree);
  }

  for (let i = 0; i < 10; i++) {
    const bush = trimmedBush();
    const t = 0.1 + (i / 10) * 0.8;
    const side = i % 2 ? 1 : -1;
    const { pos } = placeAtTrack(curve, t, side * (hw + 8), 0);
    bush.position.copy(pos);
    bush.position.y = 0.9;
    bush.scale.setScalar(0.65 + (i % 3) * 0.15);
    world.add(bush);
  }

  const finishT = opts.finishT ?? 0;
  world.add(checkeredStartLine(curve, hw, finishT));

  world.userData.animTick = (time) => {
    world.traverse((obj) => {
      if (obj.userData.phase != null && obj.material?.opacity != null) {
        obj.scale.y = 1 + Math.sin(time * 4 + obj.userData.phase) * 0.15;
        obj.material.opacity = 0.5 + Math.sin(time * 5 + obj.userData.phase) * 0.2;
      }
      if (obj.userData.drift != null) {
        obj.position.x += Math.sin(time * 0.1 + obj.userData.drift) * 0.01;
      }
    });
  };

  root.add(world);
  return world;
}
