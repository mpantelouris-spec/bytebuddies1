/**
 * SunsetCoveHeroKit.js — Composed start + mid-track landmarks for sunset_cove_01.
 * Kids should read “beach!” in two seconds: palms, hut, torches, ocean gateway.
 */
import * as THREE from 'three';
import { placeAtTrack } from '../GameWorldBuilder.js';
import { pbrMat } from './BiomeAAAKit.js';
import { snapPropToRoad } from './TrackGroundSnap.js';

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

/** Fat tropical palm — bent trunk, fan fronds, coconuts. */
export function buildCovePalm(scale = 1) {
  const g = new THREE.Group();
  g.name = 'prop-start-palm';
  const bark = pbrMat(0x8b5a2b, { roughness: 0.92 });
  const green = pbrMat(0x1e8a3a, { roughness: 0.55, emissive: 0x0d4a18, emi: 0.18 });
  let y = 0;
  let x = 0;
  for (let i = 0; i < 5; i++) {
    const h = 1.7 * scale;
    const r0 = (0.42 - i * 0.05) * scale;
    const r1 = (0.36 - i * 0.05) * scale;
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, h, 8), bark);
    x += (i === 2 ? 0.28 : i === 3 ? 0.18 : 0) * scale;
    y += h * 0.92;
    seg.position.set(x, y - h / 2, 0);
    seg.rotation.z = i > 1 ? -0.12 : 0;
    g.add(seg);
  }
  const crownY = y + 0.2 * scale;
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const frond = new THREE.Mesh(
      new THREE.ConeGeometry(1.15 * scale, 4.4 * scale, 5),
      green,
    );
    frond.position.set(Math.cos(a) * 0.35 * scale, crownY, Math.sin(a) * 0.35 * scale);
    frond.rotation.z = Math.cos(a) * 0.95;
    frond.rotation.x = Math.sin(a) * 0.95;
    g.add(frond);
  }
  for (let i = 0; i < 3; i++) {
    const nut = new THREE.Mesh(new THREE.SphereGeometry(0.28 * scale, 8, 8), pbrMat(0x5c3a1e, { roughness: 0.9 }));
    const a = (i / 3) * Math.PI * 2;
    nut.position.set(Math.cos(a) * 0.4 * scale, crownY - 0.15 * scale, Math.sin(a) * 0.4 * scale);
    g.add(nut);
  }
  return g;
}

/** Yellow hut + red/white striped awning. */
export function buildCoveHut(scale = 1) {
  const g = new THREE.Group();
  g.name = 'prop-start-hut';
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(4.4 * scale, 2.6 * scale, 3.4 * scale),
    pbrMat(0xf4d03f, { roughness: 0.7 }),
  );
  body.position.y = 1.3 * scale;
  g.add(body);
  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(3.4 * scale, 1.9 * scale, 4),
    pbrMat(0xe74c3c, { roughness: 0.65 }),
  );
  roof.position.y = 3.3 * scale;
  roof.rotation.y = Math.PI / 4;
  g.add(roof);
  for (let i = 0; i < 6; i++) {
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(0.55 * scale, 0.08 * scale, 2.2 * scale),
      pbrMat(i % 2 ? 0xffffff : 0xe74c3c, { roughness: 0.5 }),
    );
    stripe.position.set(-1.8 * scale + i * 0.7 * scale, 2.55 * scale, 1.85 * scale);
    g.add(stripe);
  }
  const door = new THREE.Mesh(
    new THREE.BoxGeometry(1.1 * scale, 1.6 * scale, 0.12 * scale),
    pbrMat(0x6d4c41, { roughness: 0.8 }),
  );
  door.position.set(0, 0.85 * scale, 1.75 * scale);
  g.add(door);
  return g;
}

export function buildCoveTorch(scale = 1) {
  const g = new THREE.Group();
  g.name = 'prop-tiki-torch';
  g.userData.animated = true;
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14 * scale, 0.2 * scale, 3.2 * scale, 8),
    pbrMat(0x5a4030, { roughness: 0.9 }),
  );
  pole.position.y = 1.6 * scale;
  g.add(pole);
  const bowl = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32 * scale, 0.22 * scale, 0.35 * scale, 8),
    pbrMat(0x3d2b1f, { roughness: 0.8 }),
  );
  bowl.position.y = 3.25 * scale;
  g.add(bowl);
  const flame = new THREE.Mesh(
    new THREE.ConeGeometry(0.28 * scale, 0.9 * scale, 7),
    pbrMat(0xff6600, { emissive: 0xff4500, emi: 1.3, roughness: 0.25 }),
  );
  flame.position.y = 3.85 * scale;
  g.add(flame);
  const glow = new THREE.PointLight(0xff6622, 1.6, 14, 1.6);
  glow.position.y = 3.9 * scale;
  g.add(glow);
  return g;
}

export function buildCoveUmbrella(scale = 1) {
  const g = new THREE.Group();
  g.name = 'prop-start-umbrella';
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08 * scale, 0.1 * scale, 3.6 * scale, 8),
    pbrMat(0xeeeeee, { metalness: 0.4, roughness: 0.4 }),
  );
  pole.position.y = 1.8 * scale;
  g.add(pole);
  for (let i = 0; i < 8; i++) {
    const wedge = new THREE.Mesh(
      new THREE.ConeGeometry(2.4 * scale, 1.05 * scale, 3, 1, true, (i / 8) * Math.PI * 2, Math.PI / 4),
      pbrMat(i % 2 ? 0xffffff : 0xe74c3c, { roughness: 0.55 }),
    );
    wedge.position.y = 3.55 * scale;
    wedge.rotation.x = Math.PI;
    g.add(wedge);
  }
  return g;
}

/** Drive-through hibiscus flower arch — sits a few metres ahead of the camera. */
export function buildHibiscusArch(hw = 4) {
  const g = new THREE.Group();
  g.name = 'sunset-hibiscus-arch';
  const petal = pbrMat(0xff4d8d, { roughness: 0.45, emissive: 0xff2d6a, emi: 0.22 });
  const span = hw + 3.2;
  [-span, span].forEach((x) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 7.2, 8), pbrMat(0x2e7d32, { roughness: 0.8 }));
    post.position.set(x, 3.6, 0);
    g.add(post);
  });
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(span * 2 + 1.4, 0.7, 0.7), petal);
  lintel.position.y = 7.3;
  g.add(lintel);
  for (let i = 0; i < 7; i++) {
    const flower = new THREE.Mesh(new THREE.SphereGeometry(0.7, 10, 8), petal);
    flower.scale.set(1.4, 0.45, 1);
    flower.position.set(-span + 1.2 + i * ((span * 2 - 2.4) / 6), 7.85, 0.15);
    g.add(flower);
  }
  const center = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), pbrMat(0xffd54f, { emi: 0.55 }));
  center.position.set(0, 7.9, 0.35);
  g.add(center);
  return g;
}

export function buildCovePier(scale = 1) {
  const g = new THREE.Group();
  g.name = 'sunset-pier';
  const wood = pbrMat(0xa67c52, { roughness: 0.88 });
  const deck = new THREE.Mesh(new THREE.BoxGeometry(4.5 * scale, 0.22 * scale, 14 * scale), wood);
  deck.position.y = 0.4 * scale;
  g.add(deck);
  [-1.8, 1.8].forEach((x) => {
    for (let i = 0; i < 5; i++) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * scale, 0.14 * scale, 1.6 * scale, 6), wood);
      post.position.set(x * scale, 0.8 * scale, (-5 + i * 2.5) * scale);
      g.add(post);
    }
  });
  return g;
}

export function buildCoveIsland() {
  const g = new THREE.Group();
  g.name = 'sunset-distant-island';
  const rock = new THREE.Mesh(
    new THREE.SphereGeometry(9, 10, 8),
    pbrMat(0x3d5c40, { roughness: 0.95 }),
  );
  rock.scale.set(1.6, 0.55, 1.1);
  rock.position.y = 1.2;
  g.add(rock);
  const peak = new THREE.Mesh(new THREE.ConeGeometry(3.2, 6, 7), pbrMat(0x2e4a32, { roughness: 0.9 }));
  peak.position.y = 5.2;
  g.add(peak);
  return g;
}

/** 4–6 start-line heroes + 2 mid-track landmarks. */
export function installSunsetCoveHeroKit(world, curve, hw, scene, finishT = 0) {
  const t0 = ((finishT % 1) + 1) % 1;
  const t = (off) => ((t0 + off) % 1 + 1) % 1;

  place(world, curve, hw, scene, { t: t(0), side: -1, off: 12 }, buildCovePalm(1.45));
  place(world, curve, hw, scene, { t: t(0), side: 1, off: 13 }, buildCovePalm(1.35));
  place(world, curve, hw, scene, { t: t(0.025), side: -1, off: 18 }, buildCovePalm(1.2));
  place(world, curve, hw, scene, { t: t(0.035), side: 1, off: 19 }, buildCovePalm(1.15));
  place(world, curve, hw, scene, { t: t(0.015), side: -1, off: 9 }, buildCoveTorch(1.15));
  place(world, curve, hw, scene, { t: t(0.015), side: 1, off: 9 }, buildCoveTorch(1.15));
  place(world, curve, hw, scene, { t: t(0.04), side: -1, off: 16 }, buildCoveHut(1.2));
  place(world, curve, hw, scene, { t: t(0.055), side: 1, off: 15 }, buildCoveUmbrella(1.1));

  place(world, curve, hw, scene, { t: t(0.45), side: -1, off: 24 }, buildCoveHut(1.6));
  place(world, curve, hw, scene, { t: t(0.45), side: 1, off: 22 }, buildCovePalm(2.2));
  place(world, curve, hw, scene, { t: t(0.72), side: -1, off: 20 }, buildCovePalm(2.0));
  place(world, curve, hw, scene, { t: t(0.72), side: 1, off: 18 }, buildCoveTorch(1.6));

  const island = buildCoveIsland();
  const { pos, frame } = placeAtTrack(curve, t0, 0, 0);
  island.position.copy(pos)
    .add(frame.tan.clone().multiplyScalar(76))
    .add(frame.n.clone().multiplyScalar(-30));
  island.position.y = 0.4;
  island.scale.setScalar(0.58);
  world.add(island);

  console.log('[SunsetCoveHeroKit] installed', { finishT: t0 });
  return 18;
}
