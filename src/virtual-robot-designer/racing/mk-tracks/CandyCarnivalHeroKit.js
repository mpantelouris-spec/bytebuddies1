/**
 * CandyCarnivalHeroKit.js — Composed start + mid-track landmarks for candy_carnival_01.
 * Real ferris wheel + tents + ticket arch — not Kenney statue_ring placeholders.
 */
import * as THREE from 'three';
import { placeAtTrack } from '../GameWorldBuilder.js';
import { pbrMat } from './BiomeAAAKit.js';
import { snapPropToRoad } from './TrackGroundSnap.js';
import { getTrackStandard } from './CodeRacerTrackStandards.js';
import { buildLollipopPole } from './TrackPropBuilders.js';

function roadY(curve, t) {
  return curve.getPointAt(t).y || 0;
}

function place(world, curve, hw, scene, { t, side = 1, off = 10, y = 0 }, obj) {
  const lateral = side === 0 ? (off || 0) : side * (hw + off);
  const { pos, frame } = placeAtTrack(curve, t, lateral, 0);
  obj.position.copy(pos);
  let baseY = roadY(curve, t);
  if (scene) baseY = snapPropToRoad(scene, pos.x, pos.z, baseY);
  obj.position.y = baseY + y;
  obj.rotation.y = frame.rot ?? 0;
  obj.userData.groundSnap = true;
  world.add(obj);
  return obj;
}

export function buildCarnivalFerris(scale = 1) {
  const g = new THREE.Group();
  g.name = 'prop-ferris-wheel';
  g.userData.animated = true;
  const steel = pbrMat(0xd0d4dc, { metalness: 0.55, roughness: 0.35 });
  const pink = pbrMat(0xff69b4, { emissive: 0xff1493, emi: 0.45, roughness: 0.4 });
  const hubY = 11 * scale;

  const wheel = new THREE.Group();
  wheel.name = 'ferris-wheel-spin';
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.7 * scale, 0.7 * scale, 0.55 * scale, 12), steel);
  hub.rotation.x = Math.PI / 2;
  hub.position.y = hubY;
  wheel.add(hub);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(9.2 * scale, 0.22 * scale, 8, 36), pink);
  ring.rotation.y = Math.PI / 2;
  ring.position.y = hubY;
  wheel.add(ring);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.07 * scale, 0.07 * scale, 9.2 * scale, 5), steel);
    spoke.position.set(0, hubY, 0);
    spoke.rotation.z = a;
    wheel.add(spoke);
    const cab = new THREE.Mesh(
      new THREE.BoxGeometry(1.15 * scale, 1.35 * scale, 0.95 * scale),
      pbrMat(i % 2 ? 0xffd700 : 0x7ee8ff, { roughness: 0.45, emi: 0.2 }),
    );
    cab.position.set(Math.cos(a) * 9.2 * scale, hubY + Math.sin(a) * 9.2 * scale, 0);
    wheel.add(cab);
  }
  g.add(wheel);

  const legL = new THREE.Mesh(new THREE.BoxGeometry(0.45 * scale, 11.2 * scale, 0.45 * scale), steel);
  legL.position.set(-3.2 * scale, 5.5 * scale, 0);
  legL.rotation.z = 0.22;
  g.add(legL);
  const legR = legL.clone();
  legR.position.x = 3.2 * scale;
  legR.rotation.z = -0.22;
  g.add(legR);
  const base = new THREE.Mesh(new THREE.BoxGeometry(7.5 * scale, 0.4 * scale, 2.2 * scale), pbrMat(0x6d4c41, { roughness: 0.85 }));
  base.position.y = 0.2 * scale;
  g.add(base);
  return g;
}

export function buildCarnivalTent(scale = 1) {
  const g = new THREE.Group();
  g.name = 'prop-circus-tent';
  const body = new THREE.Mesh(
    new THREE.ConeGeometry(3.6 * scale, 5.2 * scale, 10),
    pbrMat(0xff2244, { emissive: 0x661122, emi: 0.14 }),
  );
  body.position.y = 2.6 * scale;
  g.add(body);
  for (let i = 0; i < 8; i++) {
    const stripe = new THREE.Mesh(
      new THREE.ConeGeometry(3.65 * scale, 5.25 * scale, 2, 1, true, (i / 8) * Math.PI * 2, Math.PI / 16),
      pbrMat(0xffffff, { emissive: 0xffe8e8, emi: 0.08 }),
    );
    stripe.position.y = 2.62 * scale;
    g.add(stripe);
  }
  const skirt = new THREE.Mesh(
    new THREE.CylinderGeometry(3.5 * scale, 3.8 * scale, 1.4 * scale, 12, 1, true),
    pbrMat(0xff2244, { roughness: 0.7 }),
  );
  skirt.position.y = 0.7 * scale;
  g.add(skirt);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08 * scale, 0.1 * scale, 5.6 * scale, 6), pbrMat(0xffd700));
  pole.position.y = 2.8 * scale;
  g.add(pole);
  return g;
}

export function buildTicketArch(hw = 4) {
  const g = new THREE.Group();
  g.name = 'candy-ticket-arch';
  const span = hw + 2.8;
  const neon = pbrMat(0xff69b4, { emissive: 0xff1493, emi: 0.7, roughness: 0.35 });
  [-span, span].forEach((x) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.7, 6.4, 0.7), pbrMat(0x2a1040, { roughness: 0.5, metalness: 0.3 }));
    post.position.set(x, 3.2, 0);
    g.add(post);
  });
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(span * 2 + 1.6, 1.2, 0.8), neon);
  lintel.position.y = 6.6;
  g.add(lintel);
  const bulbColors = [0xffd700, 0x7ee8ff, 0xff69b4, 0xffd700, 0x7ee8ff];
  for (let i = 0; i < 5; i++) {
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), pbrMat(bulbColors[i], { emi: 0.9 }));
    bulb.position.set(-span + 1.1 + i * ((span * 2 - 2.2) / 4), 7.35, 0.2);
    g.add(bulb);
  }
  return g;
}

export function buildCandyCaneProp(scale = 1) {
  const g = new THREE.Group();
  g.name = 'prop-candy-cane';
  const red = pbrMat(0xe74c3c, { roughness: 0.45 });
  const white = pbrMat(0xffffff, { roughness: 0.4 });
  for (let i = 0; i < 8; i++) {
    const seg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28 * scale, 0.28 * scale, 0.7 * scale, 8),
      i % 2 ? red : white,
    );
    seg.position.y = 0.4 * scale + i * 0.62 * scale;
    g.add(seg);
  }
  const hook = new THREE.Mesh(new THREE.TorusGeometry(0.85 * scale, 0.28 * scale, 8, 12, Math.PI), red);
  hook.position.set(0.85 * scale, 5.4 * scale, 0);
  hook.rotation.z = Math.PI / 2;
  g.add(hook);
  return g;
}

export function placeCandySideCheckpoints(world, curve, hw) {
  const std = getTrackStandard('candy_carnival_01');
  const cpTs = std?.checkpointTs ?? [0.25, 0.5, 0.75];
  cpTs.forEach((t, i) => {
    [-1, 1].forEach((side) => {
      const off = side * (hw + 3.8);
      const { pos, frame } = placeAtTrack(curve, t, off, 0);
      const pole = buildLollipopPole(1.1);
      pole.position.copy(pos);
      pole.position.y += roadY(curve, t);
      pole.rotation.y = frame.rot ?? 0;
      pole.name = `candy-checkpoint-${i}-${side}`;
      world.add(pole);
    });
  });
}

export function installCandyCarnivalHeroKit(world, curve, hw, scene, finishT = 0) {
  const t0 = ((finishT % 1) + 1) % 1;
  const t = (off) => ((t0 + off) % 1 + 1) % 1;

  // Start line: tents + candy canes off-road — ferris stays mid-track only.
  place(world, curve, hw, scene, { t: t(0.02), side: 1, off: 18 }, buildCarnivalTent(1.4));
  place(world, curve, hw, scene, { t: t(0.02), side: 1, off: 24 }, buildCarnivalTent(1.2));
  place(world, curve, hw, scene, { t: t(0), side: -1, off: 16 }, buildCandyCaneProp(1.6));
  place(world, curve, hw, scene, { t: t(0), side: 1, off: 14 }, buildCandyCaneProp(1.4));

  place(world, curve, hw, scene, { t: t(0.35), side: -1, off: 22 }, buildCarnivalTent(1.4));
  place(world, curve, hw, scene, { t: t(0.62), side: 1, off: 24 }, buildCarnivalTent(1.3));

  // Mid-track vista ferris — far off the crossover / launch straight.
  place(world, curve, hw, scene, { t: t(0.52), side: -1, off: 32 }, buildCarnivalFerris(1.1));

  const ticketVista = buildTicketArch(hw);
  ticketVista.scale.setScalar(0.85);
  place(world, curve, hw, scene, { t: t(0.22), side: 1, off: 26 }, ticketVista);

  placeCandySideCheckpoints(world, curve, hw);

  console.log('[CandyCarnivalHeroKit] installed', { finishT: t0 });
  return 8;
}
