/**
 * MarioCircuitWorld.js — Mario Circuit Professional Racing Stadium
 * Stylized MK night stadium: glossy blue asphalt, grandstands, pit lane, floodlights.
 */
import * as THREE from 'three';
import { placeAtTrack, sampleTrackFrame } from '../GameWorldBuilder.js';
import { getMKVisual } from './MKTrackVisualSpec.js';
import { sampleTrackBounds, cornerPosition, faceCenter, trackInfieldRadius } from './mk-track-layout.js';

const RED_SEAT = 0xdc143c;
const BLUE_SEAT = 0x0033cc;
const LIGHT_BLUE_SEAT = 0x0066ff;
const SPONSORS = [
  { text: 'MARIOKART', bg: '#e53935' },
  { text: 'SUPER MARIO', bg: '#1e88e5' },
  { text: 'MK TV', bg: '#fdd835', fg: '#111' },
  { text: 'YOSHI', bg: '#43a047' },
  { text: 'MUSHROOM', bg: '#ff5722' },
  { text: 'LUIGI', bg: '#1565c0' },
];

function trackHeading(curve, t) {
  const frame = sampleTrackFrame(curve, t);
  return frame.rot ?? Math.atan2(frame.tan.x, frame.tan.z);
}

function toonMat(color, emissive = 0x000000, emi = 0) {
  return new THREE.MeshStandardMaterial({
    color,
    emissive,
    emissiveIntensity: emi,
    roughness: 0.55,
    metalness: 0.08,
    flatShading: true,
  });
}

function makeBannerTexture(text, bg, fg = '#ffffff') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 512, 128);
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillRect(0, 0, 512, 36);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.strokeRect(8, 8, 496, 112);
  ctx.fillStyle = fg;
  ctx.font = 'bold 52px system-ui,sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(text, 256, 82);
  return new THREE.CanvasTexture(canvas);
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
    new THREE.PlaneGeometry(halfWidth * 2.4, 3.5),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.2, metalness: 0.35 }),
  );
  line.rotation.x = -Math.PI / 2;
  line.rotation.z = rot;
  line.position.copy(pos);
  line.position.y = 0.18;
  return line;
}

function buildFloodlightTower() {
  const g = new THREE.Group();
  const steel = toonMat(0xb0b8c8, 0x334455, 0.15);
  [[-1.4, -1.4], [1.4, -1.4], [-1.4, 1.4], [1.4, 1.4]].forEach(([x, z]) => {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.32, 28, 6), steel);
    leg.position.set(x, 14, z);
    g.add(leg);
  });
  const cross = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.3, 3.8), steel);
  cross.position.y = 26;
  g.add(cross);
  [-1.3, 0, 1.3].forEach((x) => {
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(1.1, 0.4, 2),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffcc,
        emissiveIntensity: 2.2,
        flatShading: true,
      }),
    );
    panel.position.set(x, 27.2, 0);
    g.add(panel);
    const flare = new THREE.Mesh(
      new THREE.SphereGeometry(0.7, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffaa, transparent: true, opacity: 0.55 }),
    );
    flare.position.set(x, 28, 0);
    g.add(flare);
  });
  const spot = new THREE.SpotLight(0xfff8e0, 6, 140, Math.PI / 5, 0.35, 1.2);
  spot.position.set(0, 27, 0);
  spot.target.position.set(0, 0, 8);
  g.add(spot);
  g.add(spot.target);
  const fill = new THREE.PointLight(0xfff0cc, 3.5, 90, 1.4);
  fill.position.y = 26;
  g.add(fill);
  return g;
}

function buildClubhouseCastle() {
  const g = new THREE.Group();
  const wall = toonMat(0xffffff);
  const roof = toonMat(0xdc143c);
  const main = new THREE.Mesh(new THREE.BoxGeometry(26, 13, 16), wall);
  main.position.y = 6.5;
  g.add(main);
  [-11, 11].forEach((x) => {
    const wing = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 12), wall);
    wing.position.set(x, 5, 0);
    g.add(wing);
    const r = new THREE.Mesh(new THREE.ConeGeometry(6.5, 5.5, 4), roof);
    r.position.set(x, 13, 0);
    r.rotation.y = Math.PI / 4;
    g.add(r);
  });
  const centerRoof = new THREE.Mesh(new THREE.ConeGeometry(9.5, 6.5, 4), roof);
  centerRoof.position.set(0, 16, 0);
  centerRoof.rotation.y = Math.PI / 4;
  g.add(centerRoof);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 8, 6), toonMat(0x888888));
  pole.position.set(0, 20, 0);
  g.add(pole);
  const flag = new THREE.Mesh(
    new THREE.PlaneGeometry(3.5, 2.2),
    new THREE.MeshStandardMaterial({ color: 0xdc143c, side: THREE.DoubleSide, emissive: 0x880000, emissiveIntensity: 0.3 }),
  );
  flag.position.set(1.8, 22.5, 0);
  g.add(flag);
  for (let i = -4; i <= 4; i++) {
    const win = new THREE.Mesh(
      new THREE.PlaneGeometry(1.8, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x88ccff, emissive: 0x4488dd, emissiveIntensity: 0.6 }),
    );
    win.position.set(i * 2.6, 6.5, 8.05);
    g.add(win);
  }
  return g;
}

function buildSpectator(color = 0xff1744) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.35, 4, 6), toonMat(color));
  body.position.y = 0.45;
  g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), toonMat(0xffccaa));
  head.position.y = 0.85;
  g.add(head);
  return g;
}

function buildGrandstands(bounds, root) {
  const group = new THREE.Group();
  group.name = 'stadium-grandstands';
  const seatColors = [RED_SEAT, BLUE_SEAT, LIGHT_BLUE_SEAT, RED_SEAT];
  const corners = ['nw', 'ne', 'sw', 'se'];
  const margin = 32;

  corners.forEach((corner, section) => {
    const { x, z } = cornerPosition(bounds, corner, margin);
    const rot = faceCenter(bounds, x, z);
    for (let tier = 0; tier < 4; tier++) {
      const depth = 2.4 - tier * 0.2;
      const width = 18 - tier * 2.5;
      const block = new THREE.Mesh(
        new THREE.BoxGeometry(width, 0.85, depth),
        toonMat(seatColors[(tier + section) % seatColors.length]),
      );
      const pull = tier * 1.8;
      block.position.set(
        x - Math.sin(rot) * pull,
        0.42 + tier * 0.85,
        z - Math.cos(rot) * pull,
      );
      block.rotation.y = rot;
      block.renderOrder = -1;
      group.add(block);
    }
  });
  root.add(group);
  return group;
}

function buildPitLane(curve, root, halfWidth) {
  const group = new THREE.Group();
  group.name = 'pit-lane';
  const pitTs = [0.04, 0.06, 0.08, 0.1, 0.12];
  const garageColors = [0x43a047, 0x1e88e5, 0x43a047, 0x1e88e5, 0x43a047];

  pitTs.forEach((t, i) => {
    const { pos } = placeAtTrack(curve, t, -(halfWidth + 9), 0);
    const rot = trackHeading(curve, t);
    const garage = new THREE.Group();
    const wall = new THREE.Mesh(new THREE.BoxGeometry(5.5, 3.2, 4), toonMat(garageColors[i]));
    wall.position.y = 1.6;
    garage.add(wall);
    const door = new THREE.Mesh(
      new THREE.PlaneGeometry(3.8, 2.6),
      new THREE.MeshStandardMaterial({
        color: 0x111111,
        emissive: 0x2244aa,
        emissiveIntensity: 0.5,
      }),
    );
    door.position.set(0, 1.3, 2.05);
    garage.add(door);
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(4, 0.8),
      new THREE.MeshBasicMaterial({
        map: makeBannerTexture(`PIT ${i + 1}`, '#ffffff', '#111'),
        fog: false,
      }),
    );
    sign.position.set(0, 3.5, 2.1);
    garage.add(sign);
    garage.position.copy(pos);
    garage.rotation.y = rot;
    group.add(garage);
  });

  const pitRoad = new THREE.Mesh(
    new THREE.PlaneGeometry(6, 28),
    new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.85 }),
  );
  const start = placeAtTrack(curve, 0.07, -(halfWidth + 6), 0).pos;
  pitRoad.rotation.x = -Math.PI / 2;
  pitRoad.rotation.z = trackHeading(curve, 0.07);
  pitRoad.position.set(start.x, 0.08, start.z);
  group.add(pitRoad);
  root.add(group);
}

function buildSponsorBoards(bounds, root) {
  const spots = [
    { corner: 'n', rot: 0 },
    { corner: 'e', rot: -Math.PI / 2 },
    { corner: 's', rot: Math.PI },
    { corner: 'w', rot: Math.PI / 2 },
  ];
  spots.forEach(({ corner, rot }, i) => {
    const spec = SPONSORS[i % SPONSORS.length];
    const { x, z } = cornerPosition(bounds, corner, 14);
    const tex = makeBannerTexture(spec.text, spec.bg, spec.fg || '#fff');
    const board = new THREE.Mesh(
      new THREE.PlaneGeometry(6.5, 1.6),
      new THREE.MeshBasicMaterial({ map: tex, fog: false }),
    );
    board.position.set(x, 2.4, z);
    board.rotation.y = rot;
    root.add(board);
  });
}

function buildPicketFences(curve, root, halfWidth) {
  const plank = toonMat(0xffffff);
  [0.12, 0.22, 0.32, 0.42, 0.52, 0.62, 0.72].forEach((t) => {
    for (const side of [-1, 1]) {
      const { pos } = placeAtTrack(curve, t, side * (halfWidth + 4.2), 0);
      const rot = trackHeading(curve, t);
      for (let p = -2; p <= 2; p++) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.8, 0.14), plank);
        post.position.set(
          pos.x + p * 0.85 * Math.cos(rot + Math.PI / 2),
          0.4,
          pos.z + p * 0.85 * Math.sin(rot + Math.PI / 2),
        );
        root.add(post);
      }
      const rail = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.12, 0.12), plank);
      rail.position.set(pos.x, 0.68, pos.z);
      rail.rotation.y = rot;
      root.add(rail);
    }
  });
}

function buildGrassInfield(root, bounds, curve) {
  const innerR = trackInfieldRadius(curve, bounds, 6);
  const outerR = innerR + 24;
  const grass = new THREE.Mesh(
    new THREE.RingGeometry(innerR, outerR, 48),
    new THREE.MeshStandardMaterial({ color: 0x1b5e20, roughness: 0.95, side: THREE.DoubleSide }),
  );
  grass.rotation.x = -Math.PI / 2;
  grass.position.set(bounds.cx, -0.14, bounds.cz);
  grass.renderOrder = -2;
  root.add(grass);
}

function buildNightSkyBackdrop(root) {
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(280, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.55),
    new THREE.MeshBasicMaterial({ color: 0x0a1030, side: THREE.BackSide, fog: false }),
  );
  sky.position.y = 20;
  root.add(sky);
  const stars = new THREE.Group();
  for (let i = 0; i < 120; i++) {
    const star = new THREE.Mesh(
      new THREE.SphereGeometry(0.35 + Math.random() * 0.5, 4, 4),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 + Math.random() * 0.5 }),
    );
    star.position.set(
      (Math.random() - 0.5) * 420,
      40 + Math.random() * 90,
      (Math.random() - 0.5) * 420,
    );
    stars.add(star);
  }
  root.add(stars);
}

function buildTireMarks(curve, root, halfWidth) {
  const group = new THREE.Group();
  group.name = 'tire-marks';
  const markMat = new THREE.MeshBasicMaterial({
    color: 0x111111,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  });
  [0.18, 0.32, 0.48, 0.62, 0.78].forEach((t, i) => {
    const { pos } = placeAtTrack(curve, t, (i % 2 ? 0.8 : -0.8), 0);
    const rot = trackHeading(curve, t);
    const mark = new THREE.Mesh(new THREE.PlaneGeometry(halfWidth * 0.9, 0.35), markMat);
    mark.rotation.x = -Math.PI / 2;
    mark.rotation.z = rot + 0.1;
    mark.position.copy(pos);
    mark.position.y = 0.17;
    group.add(mark);
  });
  root.add(group);
}

function buildAtmosphere(curve, root, halfWidth) {
  const mistGroup = new THREE.Group();
  mistGroup.name = 'track-atmosphere';
  const mistMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
  });
  [0.05, 0.5, 0.92].forEach((t, i) => {
    const { pos } = placeAtTrack(curve, t, (i % 2 ? 0.5 : -0.5), 0);
    const puff = new THREE.Mesh(new THREE.PlaneGeometry(halfWidth * 1.8, 1.4), mistMat);
    puff.rotation.x = -Math.PI / 2;
    puff.rotation.z = trackHeading(curve, t);
    puff.position.copy(pos);
    puff.position.y = 0.2;
    puff.userData.phase = i * 1.3;
    mistGroup.add(puff);
  });
  root.add(mistGroup);

  const dustVerts = [];
  for (let i = 0; i < 100; i++) {
    const t = Math.random();
    const { pos } = placeAtTrack(curve, t, (Math.random() - 0.5) * halfWidth * 2.5, 0);
    dustVerts.push(pos.x + (Math.random() - 0.5) * 4, 0.5 + Math.random() * 12, pos.z + (Math.random() - 0.5) * 4);
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute('position', new THREE.Float32BufferAttribute(dustVerts, 3));
  const dust = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({ color: 0xffffee, size: 0.12, transparent: true, opacity: 0.45, depthWrite: false }),
  );
  dust.name = 'stadium-dust';
  root.add(dust);

  const confettiGroup = new THREE.Group();
  confettiGroup.name = 'confetti';
  const confettiColors = [0xff1744, 0xffeb3b, 0x00e5ff, 0xffffff, 0x4caf50];
  const finish = placeAtTrack(curve, 0, 0, 0).pos;
  for (let i = 0; i < 24; i++) {
    const piece = new THREE.Mesh(
      new THREE.PlaneGeometry(0.18, 0.12),
      new THREE.MeshBasicMaterial({
        color: confettiColors[i % confettiColors.length],
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      }),
    );
    piece.position.set(
      finish.x + (Math.random() - 0.5) * 12,
      2 + Math.random() * 8,
      finish.z + (Math.random() - 0.5) * 8,
    );
    piece.userData.vy = -0.3 - Math.random() * 0.5;
    piece.userData.vr = Math.random() * 4;
    piece.userData.phase = Math.random() * Math.PI * 2;
    confettiGroup.add(piece);
  }
  root.add(confettiGroup);

  return { mistGroup, dust, confettiGroup };
}

function buildInfieldAnimals(curve, root, halfWidth) {
  const spots = [[0.2, -1], [0.28, 1], [0.4, -1], [0.52, 1], [0.64, -1]];
  spots.forEach(([t, side], i) => {
    const { pos } = placeAtTrack(curve, t, side * (halfWidth + 5), 0);
    const animal = i % 2 === 0 ? buildSpectator(0xffffff) : buildSpectator(0x333333);
    animal.scale.setScalar(1.8);
    animal.position.copy(pos);
    animal.rotation.y = trackHeading(curve, t);
    root.add(animal);
  });
}

export function buildMarioCircuitWorld(scene, curve, root, opts = {}) {
  const world = new THREE.Group();
  world.name = 'mario-circuit-stadium';
  const hw = opts.halfWidth || 3.5;
  const bounds = sampleTrackBounds(curve);
  const visual = getMKVisual('mario_circuit');
  const { top, fog } = visual.sky;

  scene.background = new THREE.Color(top);
  scene.fog = new THREE.Fog(fog, 40, 220);

  buildNightSkyBackdrop(world);
  buildGrassInfield(world, bounds, curve);
  buildGrandstands(bounds, world);
  buildSponsorBoards(bounds, world);

  const towerCorners = ['nw', 'ne', 'sw', 'se'];
  const towers = towerCorners.map((corner) => {
    const { x, z } = cornerPosition(bounds, corner, 18);
    const tower = buildFloodlightTower();
    tower.position.set(x, 0, z);
    tower.rotation.y = faceCenter(bounds, x, z);
    world.add(tower);
    return tower;
  });

  const castle = buildClubhouseCastle();
  const castleSpot = cornerPosition(bounds, 's', 22);
  castle.position.set(castleSpot.x, 0, castleSpot.z);
  castle.rotation.y = faceCenter(bounds, castleSpot.x, castleSpot.z);
  world.add(castle);

  const hemi = new THREE.HemisphereLight(0x6688cc, 0x0a1030, 1.1);
  scene.add(hemi);
  const moon = new THREE.DirectionalLight(0xfff4e0, 2.4);
  moon.position.set(bounds.cx + 20, 55, bounds.cz + 30);
  scene.add(moon);
  const rim = new THREE.DirectionalLight(0x4466ff, 0.75);
  rim.position.set(bounds.cx - 40, 20, bounds.cz - 20);
  scene.add(rim);

  world.add(checkeredStartLine(curve, hw, opts.finishT ?? 0));

  world.userData.animTick = (time) => {
    towers.forEach((tower, i) => {
      tower.children.forEach((c) => {
        if (c.isSpotLight || c.isPointLight) {
          c.intensity = (c.isSpotLight ? 6 : 3.5) + Math.sin(time * 3 + i) * 0.8;
        }
      });
    });
  };

  root.add(world);
  return world;
}
