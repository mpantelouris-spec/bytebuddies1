/**
 * TrackStoryKit.js — Spec storytelling landmarks (surf shack, mining cart, metro break room).
 */
import * as THREE from 'three';
import { placeAtTrack } from '../GameWorldBuilder.js';
import { pbrMat } from './BiomeAAAKit.js';
import { getTrackStandard } from './CodeRacerTrackStandards.js';

function makeCanvasText(text, { fg = '#ffffff', bg = '#1a1a1a', fontSize = 36, w = 512, h = 96 } = {}) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = fg;
  ctx.font = `bold ${fontSize}px system-ui,sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, w / 2, h / 2);
  return new THREE.CanvasTexture(c);
}

/** Abandoned surf shack — "BEACH RACE" faded sign + surfboards. */
export function buildSurfShack() {
  const g = new THREE.Group();
  g.name = 'story-surf-shack';
  const wood = pbrMat(0x8b6914, { roughness: 0.88 });
  const shack = new THREE.Mesh(new THREE.BoxGeometry(5, 3.2, 4), wood);
  shack.position.y = 1.6;
  g.add(shack);
  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(5.8, 0.35, 4.6),
    pbrMat(0x6a4a20, { roughness: 0.9 }),
  );
  roof.position.y = 3.35;
  g.add(roof);
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(3.5, 0.9),
    new THREE.MeshBasicMaterial({
      map: makeCanvasText('BEACH RACE', { fg: '#ffcc88', bg: '#4a3020', fontSize: 32 }),
      transparent: true,
    }),
  );
  sign.position.set(0, 2.4, 2.05);
  g.add(sign);
  [-0.8, 0.6].forEach((x) => {
    const board = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.8, 0.6), pbrMat(0x00aacc, { roughness: 0.4 }));
    board.position.set(x, 0.9, 2.2);
    board.rotation.z = 0.25;
    g.add(board);
  });
  return g;
}

/** Rusted mining cart + cyan graffiti — "CRYSTAL MINERS CLUB". */
export function buildMiningCartProp() {
  const g = new THREE.Group();
  g.name = 'story-mining-cart';
  const rust = pbrMat(0x6a5040, { metalness: 0.5, roughness: 0.75 });
  const cart = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.2, 1.8), rust);
  cart.position.y = 0.8;
  cart.rotation.z = 0.08;
  g.add(cart);
  const wheelMat = pbrMat(0x333333, { metalness: 0.7 });
  [-1, 1].forEach((side) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.2, 10), wheelMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(side * 1.1, 0.35, 0.6);
    g.add(wheel);
  });
  const graffiti = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 1.1),
    new THREE.MeshBasicMaterial({
      map: makeCanvasText('CRYSTAL MINERS CLUB', { fg: '#00ffff', bg: '#0a1020', fontSize: 26, w: 640, h: 96 }),
      transparent: true,
    }),
  );
  graffiti.position.set(0, 1.6, 1.05);
  g.add(graffiti);
  const pick = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.4, 0.15), pbrMat(0x888899, { metalness: 0.8 }));
  pick.position.set(1.6, 0.7, 0.8);
  pick.rotation.z = -0.4;
  g.add(pick);
  return g;
}

/** Transit worker break room window — "METRO RACING LEAGUE" + departure board. */
export function buildTransitBreakRoom() {
  const g = new THREE.Group();
  g.name = 'story-transit-break-room';
  const wall = new THREE.Mesh(new THREE.BoxGeometry(6, 4, 0.4), pbrMat(0x555555, { roughness: 0.85 }));
  wall.position.y = 2;
  g.add(wall);
  const windowFrame = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 2.5),
    pbrMat(0x88ccff, { emissive: 0x446688, emi: 0.25, transparent: true, opacity: 0.35 }),
  );
  windowFrame.position.set(0, 2.2, 0.22);
  g.add(windowFrame);
  const poster = new THREE.Mesh(
    new THREE.PlaneGeometry(2.2, 1.2),
    new THREE.MeshBasicMaterial({
      map: makeCanvasText('METRO RACING LEAGUE', { fg: '#ff4444', bg: '#111111', fontSize: 22, w: 480, h: 80 }),
      transparent: true,
    }),
  );
  poster.position.set(-0.8, 2.8, 0.25);
  g.add(poster);
  const board = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 0.9),
    new THREE.MeshBasicMaterial({
      map: makeCanvasText('NEXT TRAIN: RACE CAR', { fg: '#ffff00', bg: '#111111', fontSize: 24, w: 560, h: 72 }),
      transparent: true,
    }),
  );
  board.position.set(0.6, 1.6, 0.25);
  g.add(board);
  const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.25, 8), pbrMat(0xffffff));
  mug.position.set(1.2, 1.35, 0.5);
  g.add(mug);
  return g;
}

/** Place per-track storytelling props from CodeRacerTrackStandards.signs + codenames. */
export function installTrackStoryProps(world, curve, hw, arenaType, finishT = 0) {
  const std = getTrackStandard(arenaType);
  if (!std) return;

  const roadY = (t) => curve.getPointAt(t).y || 0;

  if (arenaType === 'desert_dunes_01') {
    const shack = buildSurfShack();
    const t = (finishT + 0.48) % 1;
    const { pos, frame } = placeAtTrack(curve, t, -(hw + 14), 0);
    shack.position.copy(pos);
    shack.position.y += roadY(t);
    shack.rotation.y = (frame.rot ?? 0) + Math.PI / 2;
    world.add(shack);
  }

  if (arenaType === 'crystal_palace_01') {
    const cart = buildMiningCartProp();
    const t = (finishT + 0.35) % 1;
    const { pos, frame } = placeAtTrack(curve, t, hw + 10, 0);
    cart.position.copy(pos);
    cart.position.y += roadY(t);
    cart.rotation.y = frame.rot ?? 0;
    world.add(cart);
  }

  if (arenaType === 'cyber_boulevard_01') {
    const room = buildTransitBreakRoom();
    const t = (finishT + 0.6) % 1;
    const { pos, frame } = placeAtTrack(curve, t, -(hw + 8), 0);
    room.position.copy(pos);
    room.position.y += roadY(t);
    room.rotation.y = (frame.rot ?? 0) + Math.PI;
    world.add(room);
  }
}
