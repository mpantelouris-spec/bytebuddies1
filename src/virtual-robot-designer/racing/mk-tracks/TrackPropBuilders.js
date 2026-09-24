/**
 * TrackPropBuilders.js — Composed multi-mesh props (NOT single primitives).
 */
import * as THREE from 'three';
import { pbrMat } from './BiomeAAAKit.js';

export function buildPalmTree(scale = 1) {
  const g = new THREE.Group();
  g.name = 'prop-palm';
  const bark = pbrMat(0x8b5a2b, { roughness: 0.92 });
  const green = pbrMat(0x1e8a3a, { roughness: 0.55, emissive: 0x0d4a18, emi: 0.16 });
  let y = 0;
  for (let i = 0; i < 4; i++) {
    const h = 1.45 * scale;
    const seg = new THREE.Mesh(
      new THREE.CylinderGeometry((0.38 - i * 0.05) * scale, (0.46 - i * 0.05) * scale, h, 8),
      bark,
    );
    y += h;
    seg.position.y = y - h / 2;
    seg.rotation.z = i > 1 ? -0.08 : 0;
    g.add(seg);
  }
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const frond = new THREE.Mesh(new THREE.ConeGeometry(0.95 * scale, 3.6 * scale, 5), green);
    frond.position.set(Math.cos(a) * 0.3 * scale, y + 0.15 * scale, Math.sin(a) * 0.3 * scale);
    frond.rotation.z = Math.cos(a) * 0.9;
    frond.rotation.x = Math.sin(a) * 0.9;
    g.add(frond);
  }
  return g;
}

export function buildBeachHut(scale = 1) {
  const g = new THREE.Group();
  g.name = 'prop-beach-hut';
  const base = new THREE.Mesh(new THREE.BoxGeometry(4 * scale, 2.5 * scale, 3 * scale), pbrMat(0xf4d03f));
  base.position.y = 1.25 * scale;
  g.add(base);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(3 * scale, 1.8 * scale, 4), pbrMat(0xe74c3c));
  roof.position.y = 3.2 * scale;
  roof.rotation.y = Math.PI / 4;
  g.add(roof);
  return g;
}

export function buildTikiTorch(scale = 1) {
  const g = new THREE.Group();
  g.name = 'prop-tiki-torch';
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * scale, 0.15 * scale, 2.5 * scale, 6), pbrMat(0x5a4030));
  pole.position.y = 1.25 * scale;
  g.add(pole);
  const flame = new THREE.Mesh(
    new THREE.SphereGeometry(0.35 * scale, 8, 8),
    pbrMat(0xff6600, { emissive: 0xff4500, emi: 1.2, roughness: 0.2 }),
  );
  flame.position.y = 2.8 * scale;
  flame.userData.animated = true;
  g.add(flame);
  return g;
}

export function buildFerrisWheel(scale = 1) {
  const g = new THREE.Group();
  g.name = 'prop-ferris-wheel';
  g.userData.animated = true;
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.8 * scale, 0.8 * scale, 0.4 * scale, 12), pbrMat(0xcccccc, { metalness: 0.6 }));
  hub.rotation.x = Math.PI / 2;
  hub.position.y = 12 * scale;
  g.add(hub);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(10 * scale, 0.25 * scale, 8, 32), pbrMat(0xff69b4, { emissive: 0xff1493, emi: 0.4 }));
  ring.rotation.y = Math.PI / 2;
  ring.position.y = 12 * scale;
  g.add(ring);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const cab = new THREE.Mesh(new THREE.BoxGeometry(1.2 * scale, 1.5 * scale, 1 * scale), pbrMat(0xffd700));
    cab.position.set(Math.cos(a) * 10 * scale, 12 * scale + Math.sin(a) * 10 * scale, 0);
    g.add(cab);
  }
  const legL = new THREE.Mesh(new THREE.BoxGeometry(0.4 * scale, 12 * scale, 0.4 * scale), pbrMat(0x888888, { metalness: 0.5 }));
  legL.position.set(-3 * scale, 6 * scale, 0);
  legL.rotation.z = 0.15;
  g.add(legL);
  const legR = legL.clone();
  legR.position.x = 3 * scale;
  legR.rotation.z = -0.15;
  g.add(legR);
  return g;
}

export function buildCircusTent(scale = 1) {
  const g = new THREE.Group();
  g.name = 'prop-circus-tent';
  const body = new THREE.Mesh(
    new THREE.ConeGeometry(3.2 * scale, 4.2 * scale, 10),
    pbrMat(0xff2244, { emissive: 0x661122, emi: 0.12 }),
  );
  body.position.y = 2.1 * scale;
  g.add(body);
  for (let i = 0; i < 6; i++) {
    const stripe = new THREE.Mesh(
      new THREE.ConeGeometry(3.25 * scale, 4.25 * scale, 2, 1, true, (i / 6) * Math.PI * 2, Math.PI / 12),
      pbrMat(0xffffff, { emissive: 0xffe8e8, emi: 0.08 }),
    );
    stripe.position.y = 2.12 * scale;
    g.add(stripe);
  }
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08 * scale, 0.1 * scale, 4.6 * scale, 6), pbrMat(0xffd700));
  pole.position.y = 2.3 * scale;
  g.add(pole);
  return g;
}

export function buildMetroPillar(scale = 1) {
  const g = new THREE.Group();
  g.name = 'prop-metro-pillar';
  const col = new THREE.Mesh(new THREE.BoxGeometry(1.2 * scale, 8 * scale, 1.2 * scale), pbrMat(0x6a6a78, { roughness: 0.75 }));
  col.position.y = 4 * scale;
  g.add(col);
  const light = new THREE.Mesh(new THREE.BoxGeometry(2 * scale, 0.3 * scale, 0.4 * scale), pbrMat(0x00ffff, { emissive: 0x00ffff, emi: 1.5 }));
  light.position.y = 7.5 * scale;
  g.add(light);
  return g;
}

export function buildCastleTower(scale = 1) {
  const g = new THREE.Group();
  g.name = 'prop-castle-tower';
  const body = new THREE.Mesh(new THREE.CylinderGeometry(2.5 * scale, 3 * scale, 14 * scale, 8), pbrMat(0xc8c8d0, { roughness: 0.7 }));
  body.position.y = 7 * scale;
  g.add(body);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(3.2 * scale, 4 * scale, 8), pbrMat(0x4169e1, { emissive: 0x2244aa, emi: 0.15 }));
  roof.position.y = 16 * scale;
  g.add(roof);
  for (let i = 0; i < 4; i++) {
    const turret = new THREE.Mesh(new THREE.CylinderGeometry(0.6 * scale, 0.7 * scale, 3 * scale, 6), pbrMat(0xc8c8d0));
    const a = (i / 4) * Math.PI * 2;
    turret.position.set(Math.cos(a) * 2.2 * scale, 14 * scale, Math.sin(a) * 2.2 * scale);
    g.add(turret);
  }
  return g;
}

export function buildJungleTree(scale = 1) {
  const g = new THREE.Group();
  g.name = 'prop-jungle-tree';
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5 * scale, 0.7 * scale, 8 * scale, 8), pbrMat(0x5a4030));
  trunk.position.y = 4 * scale;
  g.add(trunk);
  for (let layer = 0; layer < 3; layer++) {
    const canopy = new THREE.Mesh(
      new THREE.SphereGeometry(3.5 * scale - layer * 0.5, 8, 8),
      pbrMat(0x228b22, { emissive: 0x1a6b1a, emi: 0.1 }),
    );
    canopy.position.y = 7 * scale + layer * 1.5 * scale;
    canopy.scale.set(1, 0.7, 1);
    g.add(canopy);
  }
  return g;
}

export function buildTemplePyramid(scale = 1) {
  const g = new THREE.Group();
  g.name = 'prop-pyramid';
  const steps = 5;
  for (let i = 0; i < steps; i++) {
    const s = (steps - i) * 2 * scale;
    const step = new THREE.Mesh(new THREE.BoxGeometry(s, 1.2 * scale, s), pbrMat(0x9a8a70, { roughness: 0.85 }));
    step.position.y = i * 1.2 * scale + 0.6 * scale;
    g.add(step);
  }
  return g;
}

export function buildSnowPine(scale = 1) {
  const g = new THREE.Group();
  g.name = 'prop-snow-pine';
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3 * scale, 0.45 * scale, 3 * scale, 6), pbrMat(0x4a3020));
  trunk.position.y = 1.5 * scale;
  g.add(trunk);
  for (let i = 0; i < 4; i++) {
    const tier = new THREE.Mesh(new THREE.ConeGeometry(2.5 * scale - i * 0.4, 2.5 * scale, 8), pbrMat(0x1a5a3a, { emissive: 0x0a3a2a, emi: 0.05 }));
    tier.position.y = 3 + i * 2 * scale;
    g.add(tier);
    const snow = new THREE.Mesh(new THREE.ConeGeometry(2.6 * scale - i * 0.4, 0.4 * scale, 8), pbrMat(0xffffff, { roughness: 0.9 }));
    snow.position.y = 3.8 + i * 2 * scale;
    g.add(snow);
  }
  return g;
}

export function buildLavaRiver(width = 18, length = 40) {
  const g = new THREE.Group();
  g.name = 'lava-river';
  g.userData.animated = true;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(length, width),
    pbrMat(0xff4500, { emissive: 0xcc3300, emi: 0.32, roughness: 0.72 }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = -0.5;
  g.add(mesh);
  return g;
}

export function buildGear(scale = 1) {
  const g = new THREE.Group();
  g.name = 'prop-gear';
  g.userData.animated = true;
  const teeth = 12;
  const gearBody = new THREE.Mesh(new THREE.CylinderGeometry(2 * scale, 2 * scale, 0.6 * scale, teeth), pbrMat(0x555555, { metalness: 0.7, roughness: 0.35 }));
  gearBody.rotation.x = Math.PI / 2;
  g.add(gearBody);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.6 * scale, 0.6 * scale, 0.8 * scale, 8), pbrMat(0x888888, { metalness: 0.8 }));
  hub.rotation.x = Math.PI / 2;
  g.add(hub);
  return g;
}

export function buildHabitatDome(scale = 1) {
  const g = new THREE.Group();
  g.name = 'prop-habitat-dome';
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(6 * scale, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    pbrMat(0x88ccff, { transmission: 0.6, transparent: true, opacity: 0.7, roughness: 0.1 }),
  );
  dome.position.y = 0;
  g.add(dome);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(6 * scale, 6 * scale, 1 * scale, 16), pbrMat(0xcccccc, { metalness: 0.5 }));
  base.position.y = 0;
  g.add(base);
  return g;
}

export function buildGiantDaisy(scale = 1) {
  const g = new THREE.Group();
  g.name = 'prop-daisy';
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.15 * scale, 0.2 * scale, 3 * scale, 6), pbrMat(0x2e8b2e));
  stem.position.y = 1.5 * scale;
  g.add(stem);
  const center = new THREE.Mesh(new THREE.SphereGeometry(0.8 * scale, 8, 8), pbrMat(0xffd700, { emissive: 0xffd700, emi: 0.5 }));
  center.position.y = 3.2 * scale;
  g.add(center);
  for (let i = 0; i < 8; i++) {
    const petal = new THREE.Mesh(new THREE.SphereGeometry(0.6 * scale, 6, 6), pbrMat(0xffffff, { emissive: 0xffeedd, emi: 0.2 }));
    const a = (i / 8) * Math.PI * 2;
    petal.position.set(Math.cos(a) * 1.2 * scale, 3.2 * scale, Math.sin(a) * 1.2 * scale);
    petal.scale.set(1.5, 0.4, 1);
    petal.rotation.y = a;
    g.add(petal);
  }
  return g;
}

export function buildToadstool(scale = 1) {
  const g = new THREE.Group();
  g.name = 'prop-toadstool';
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.4 * scale, 0.5 * scale, 2 * scale, 8), pbrMat(0xf5f5dc));
  stem.position.y = 1 * scale;
  g.add(stem);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(1.8 * scale, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), pbrMat(0xff0000, { emissive: 0xff3333, emi: 0.2 }));
  cap.position.y = 2 * scale;
  cap.scale.y = 0.6;
  g.add(cap);
  for (let i = 0; i < 6; i++) {
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.2 * scale, 6, 6), pbrMat(0xffffff));
    const a = (i / 6) * Math.PI * 2;
    dot.position.set(Math.cos(a) * 1 * scale, 2.3 * scale, Math.sin(a) * 1 * scale);
    g.add(dot);
  }
  return g;
}

export function buildWindmill(scale = 1) {
  const g = new THREE.Group();
  g.name = 'prop-windmill';
  g.userData.animated = true;
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.5 * scale, 2 * scale, 10 * scale, 8), pbrMat(0xd4c4a8, { roughness: 0.8 }));
  tower.position.y = 5 * scale;
  g.add(tower);
  const blades = new THREE.Group();
  blades.name = 'windmill-blades';
  blades.position.y = 10 * scale;
  for (let i = 0; i < 4; i++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.3 * scale, 6 * scale, 0.8 * scale), pbrMat(0xffffff));
    blade.position.y = 3 * scale;
    blade.rotation.z = (i / 4) * Math.PI * 2;
    blades.add(blade);
  }
  g.add(blades);
  return g;
}

export function buildOceanPlane(span = 200, opts = {}) {
  const g = new THREE.Group();
  g.name = 'ocean-plane';
  g.userData.animated = true;
  const shallow = opts.shallowColor ?? 0x2dd4cf;
  const deep = opts.depthColor ?? 0x0077aa;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(span, span * 0.9, 56, 40),
    pbrMat(shallow, { emissive: deep, emi: 0.28, metalness: 0.42, roughness: 0.12 }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = opts.y ?? -0.38;
  g.add(mesh);
  const horizon = new THREE.Mesh(
    new THREE.PlaneGeometry(span * 1.05, span * 0.45, 1, 1),
    pbrMat(deep, { emissive: 0x003355, emi: 0.12, metalness: 0.25, roughness: 0.35 }),
  );
  horizon.rotation.x = -Math.PI / 2;
  horizon.position.set(0, -0.55, -span * 0.38);
  g.add(horizon);
  return g;
}

export function buildCloudSea(span = 180) {
  const g = new THREE.Group();
  g.name = 'cloud-sea';
  g.userData.animated = true;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(span, span, 24, 24),
    pbrMat(0xffffff, { emissive: 0xffffff, emi: 0.25, transparent: true, opacity: 0.85 }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = -8;
  g.add(mesh);
  return g;
}

export function buildEarthSphere(radius = 40) {
  const g = new THREE.Group();
  g.name = 'earth-sphere';
  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 32, 24),
    pbrMat(0x2266aa, { emissive: 0x114488, emi: 0.2 }),
  );
  earth.position.set(0, -radius - 20, 0);
  g.add(earth);
  return g;
}

export function buildBeachUmbrella(scale = 1) {
  const g = new THREE.Group();
  g.name = 'prop-beach-umbrella';
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08 * scale, 0.1 * scale, 3 * scale, 6), pbrMat(0xcccccc));
  pole.position.y = 1.5 * scale;
  g.add(pole);
  const canopy = new THREE.Mesh(new THREE.ConeGeometry(2.2 * scale, 1.2 * scale, 8), pbrMat(0xff69b4, { emissive: 0xff1493, emi: 0.2 }));
  canopy.position.y = 3 * scale;
  g.add(canopy);
  return g;
}

export function buildLollipopPole(scale = 1) {
  const g = new THREE.Group();
  g.name = 'prop-lollipop';
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * scale, 0.12 * scale, 4 * scale, 6), pbrMat(0xffffff));
  stick.position.y = 2 * scale;
  g.add(stick);
  const candy = new THREE.Mesh(new THREE.SphereGeometry(1.2 * scale, 10, 10), pbrMat(0xff1493, { emissive: 0xff69b4, emi: 0.5 }));
  candy.position.y = 4.5 * scale;
  g.add(candy);
  return g;
}

export function buildCandyCane(scale = 1) {
  const g = new THREE.Group();
  g.name = 'prop-candy-cane';
  const cane = new THREE.Mesh(new THREE.TorusGeometry(1 * scale, 0.2 * scale, 6, 12, Math.PI), pbrMat(0xff0000, { emissive: 0xff3333, emi: 0.3 }));
  cane.position.y = 2 * scale;
  cane.rotation.z = Math.PI / 2;
  g.add(cane);
  const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.15 * scale, 0.15 * scale, 2.5 * scale, 6), pbrMat(0xffffff));
  stick.position.set(0, 0.8 * scale, 1 * scale);
  g.add(stick);
  return g;
}

export function buildTicketBooth(scale = 1) {
  const g = new THREE.Group();
  g.name = 'prop-ticket-booth';
  const booth = new THREE.Mesh(new THREE.BoxGeometry(3 * scale, 3 * scale, 2.5 * scale), pbrMat(0xffd700));
  booth.position.y = 1.5 * scale;
  g.add(booth);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(2.2 * scale, 1.5 * scale, 4), pbrMat(0xff69b4, { emissive: 0xff1493, emi: 0.25 }));
  roof.position.y = 3.5 * scale;
  roof.rotation.y = Math.PI / 4;
  g.add(roof);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(2 * scale, 0.8 * scale), pbrMat(0xffffff, { emissive: 0xffffff, emi: 0.4 }));
  sign.position.set(0, 2.2 * scale, 1.3 * scale);
  g.add(sign);
  return g;
}

export function buildCandyShop(scale = 1) {
  const g = new THREE.Group();
  g.name = 'prop-candy-shop';
  const base = new THREE.Mesh(new THREE.BoxGeometry(5 * scale, 4 * scale, 4 * scale), pbrMat(0xff69b4));
  base.position.y = 2 * scale;
  g.add(base);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(5.2 * scale, 0.4 * scale, 4.2 * scale), pbrMat(0xffffff));
  stripe.position.y = 3 * scale;
  g.add(stripe);
  return g;
}

export function buildCarouselHorse(scale = 1) {
  const g = new THREE.Group();
  g.name = 'prop-carousel-horse';
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.2 * scale, 1 * scale, 2 * scale), pbrMat(0xffffff));
  body.position.y = 2 * scale;
  g.add(body);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.8 * scale, 0.8 * scale, 1 * scale), pbrMat(0xffd700));
  head.position.set(0, 2.5 * scale, 1.2 * scale);
  g.add(head);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1 * scale, 0.1 * scale, 4 * scale, 6), pbrMat(0xcccccc, { metalness: 0.6 }));
  pole.position.y = 2 * scale;
  g.add(pole);
  return g;
}

export function buildNeonSign(scale = 1) {
  const g = new THREE.Group();
  g.name = 'prop-neon-sign';
  const board = new THREE.Mesh(new THREE.BoxGeometry(4 * scale, 2 * scale, 0.2 * scale), pbrMat(0x111133));
  board.position.y = 5 * scale;
  g.add(board);
  const neon = new THREE.Mesh(new THREE.PlaneGeometry(3.5 * scale, 1.5 * scale), pbrMat(0x00ffff, { emissive: 0x00ffff, emi: 1.2 }));
  neon.position.set(0, 5 * scale, 0.15 * scale);
  g.add(neon);
  return g;
}

export function buildMetroTrain(scale = 1) {
  const g = new THREE.Group();
  g.name = 'prop-metro-train';
  const body = new THREE.Mesh(new THREE.BoxGeometry(14 * scale, 3.5 * scale, 3 * scale), pbrMat(0x334466, { metalness: 0.5 }));
  body.position.y = 2 * scale;
  g.add(body);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(14 * scale, 0.4 * scale, 3.1 * scale), pbrMat(0x00ffff, { emissive: 0x00ffff, emi: 0.6 }));
  stripe.position.y = 2.8 * scale;
  g.add(stripe);
  for (let i = 0; i < 6; i++) {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(1.2 * scale, 1 * scale), pbrMat(0x88ccff, { emissive: 0x4488ff, emi: 0.3 }));
    win.position.set(-5 + i * 2, 2.5 * scale, 1.55 * scale);
    g.add(win);
  }
  return g;
}

export function buildVinePillar(scale = 1) {
  const g = new THREE.Group();
  g.name = 'prop-vine-pillar';
  const col = new THREE.Mesh(new THREE.CylinderGeometry(0.8 * scale, 1 * scale, 6 * scale, 8), pbrMat(0x9a8a70, { roughness: 0.9 }));
  col.position.y = 3 * scale;
  g.add(col);
  for (let i = 0; i < 4; i++) {
    const vine = new THREE.Mesh(new THREE.TorusGeometry(1.2 * scale, 0.15 * scale, 4, 8), pbrMat(0x228b22, { emissive: 0x1a6b1a, emi: 0.15 }));
    vine.position.y = 2 + i * 1.2 * scale;
    vine.rotation.x = Math.PI / 2;
    vine.rotation.z = i * 0.8;
    g.add(vine);
  }
  return g;
}

export function buildIcicleCluster(scale = 1) {
  const g = new THREE.Group();
  g.name = 'prop-icicle';
  for (let i = 0; i < 5; i++) {
    const ic = new THREE.Mesh(new THREE.ConeGeometry(0.25 * scale, 1.5 * scale + i * 0.3, 4), pbrMat(0xb8ddf0, { emissive: 0x88ccee, emi: 0.2 }));
    ic.position.set((i - 2) * 0.5 * scale, 1 * scale, 0);
    g.add(ic);
  }
  return g;
}

export function buildSkiLodge(scale = 1) {
  const g = new THREE.Group();
  g.name = 'prop-ski-lodge';
  const base = new THREE.Mesh(new THREE.BoxGeometry(6 * scale, 3.5 * scale, 5 * scale), pbrMat(0x8b6914, { roughness: 0.85 }));
  base.position.y = 1.75 * scale;
  g.add(base);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(5 * scale, 2.5 * scale, 4), pbrMat(0xffffff, { roughness: 0.9 }));
  roof.position.y = 4.5 * scale;
  roof.rotation.y = Math.PI / 4;
  g.add(roof);
  return g;
}

export function buildFactoryPipe(scale = 1) {
  const g = new THREE.Group();
  g.name = 'prop-factory-pipe';
  const steel = pbrMat(0x6a6a72, { metalness: 0.72, roughness: 0.38 });
  const rust = pbrMat(0x5a4038, { metalness: 0.45, roughness: 0.55 });
  const heights = [5.2, 6.4, 4.6];
  heights.forEach((h, i) => {
    const x = (i - 1) * 1.15 * scale;
    const pipe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38 * scale, 0.42 * scale, h * scale, 8),
      i === 1 ? rust : steel,
    );
    pipe.position.set(x, (h * scale) / 2, 0);
    g.add(pipe);
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.48 * scale, 0.48 * scale, 0.22 * scale, 8),
      steel,
    );
    cap.position.set(x, h * scale, 0);
    g.add(cap);
  });
  const elbow = new THREE.Mesh(
    new THREE.TorusGeometry(0.7 * scale, 0.22 * scale, 6, 10, Math.PI / 2),
    steel,
  );
  elbow.position.set(1.15 * scale + 0.7 * scale, 4.6 * scale, 0);
  elbow.rotation.z = Math.PI / 2;
  g.add(elbow);
  return g;
}

export function buildFactoryWall(scale = 1) {
  const g = new THREE.Group();
  g.name = 'prop-factory-wall';
  const wall = new THREE.Mesh(new THREE.BoxGeometry(12 * scale, 8 * scale, 1.5 * scale), pbrMat(0x3a3a42, { metalness: 0.45, roughness: 0.55 }));
  wall.position.y = 4 * scale;
  g.add(wall);
  for (let i = 0; i < 3; i++) {
    const window = new THREE.Mesh(
      new THREE.BoxGeometry(1.6 * scale, 1.4 * scale, 0.2 * scale),
      pbrMat(0xff6622, { emissive: 0xff4500, emi: 0.28, roughness: 0.4 }),
    );
    window.position.set((-3 + i * 3) * scale, 4.2 * scale, 0.85 * scale);
    g.add(window);
  }
  for (let i = 0; i < 4; i++) {
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.4 * scale, 0.4 * scale, 3 * scale, 6), pbrMat(0x666666, { metalness: 0.6 }));
    pipe.position.set(-4 + i * 2.5 * scale, 9 * scale, 0);
    g.add(pipe);
  }
  return g;
}

export function buildCraneHook(scale = 1) {
  const g = new THREE.Group();
  g.name = 'prop-crane';
  const mast = new THREE.Mesh(new THREE.BoxGeometry(0.8 * scale, 12 * scale, 0.8 * scale), pbrMat(0xffcc00, { metalness: 0.5 }));
  mast.position.y = 6 * scale;
  g.add(mast);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(10 * scale, 0.6 * scale, 0.6 * scale), pbrMat(0xffcc00, { metalness: 0.5 }));
  arm.position.set(4 * scale, 11 * scale, 0);
  g.add(arm);
  const hook = new THREE.Mesh(new THREE.TorusGeometry(0.5 * scale, 0.1 * scale, 4, 8), pbrMat(0x888888, { metalness: 0.7 }));
  hook.position.set(8 * scale, 9 * scale, 0);
  g.add(hook);
  return g;
}

export function buildSatellite(scale = 1) {
  const g = new THREE.Group();
  g.name = 'prop-satellite';
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.5 * scale, 1 * scale, 1 * scale), pbrMat(0xcccccc, { metalness: 0.6 }));
  body.position.y = 8 * scale;
  g.add(body);
  const panelL = new THREE.Mesh(new THREE.BoxGeometry(4 * scale, 0.1 * scale, 1.5 * scale), pbrMat(0x4488ff, { emissive: 0x2266cc, emi: 0.3 }));
  panelL.position.set(-3 * scale, 8 * scale, 0);
  g.add(panelL);
  const panelR = panelL.clone();
  panelR.position.x = 3 * scale;
  g.add(panelR);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.15 * scale, 0.2 * scale, 8 * scale, 6), pbrMat(0x888888));
  pole.position.y = 4 * scale;
  g.add(pole);
  return g;
}

export function buildGlassDeck(scale = 1) {
  const g = new THREE.Group();
  g.name = 'prop-glass-deck';
  const deck = new THREE.Mesh(
    new THREE.BoxGeometry(10 * scale, 0.15 * scale, 6 * scale),
    pbrMat(0x88ccff, { transmission: 0.5, transparent: true, opacity: 0.6, roughness: 0.1 }),
  );
  deck.position.y = 0.1 * scale;
  g.add(deck);
  const rail = new THREE.Mesh(new THREE.TorusGeometry(5 * scale, 0.08 * scale, 4, 16, Math.PI), pbrMat(0xcccccc, { metalness: 0.7 }));
  rail.rotation.x = Math.PI / 2;
  rail.position.y = 1.2 * scale;
  g.add(rail);
  return g;
}

export function buildFairyCottage(scale = 1) {
  const g = new THREE.Group();
  g.name = 'prop-fairy-cottage';
  const base = new THREE.Mesh(new THREE.BoxGeometry(3.5 * scale, 2.5 * scale, 3 * scale), pbrMat(0xf5deb3));
  base.position.y = 1.25 * scale;
  g.add(base);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(3 * scale, 2 * scale, 6), pbrMat(0x7cfc00, { emissive: 0x44aa44, emi: 0.2 }));
  roof.position.y = 3.2 * scale;
  g.add(roof);
  const door = new THREE.Mesh(new THREE.BoxGeometry(0.8 * scale, 1.4 * scale, 0.1 * scale), pbrMat(0x8b4513));
  door.position.set(0, 0.9 * scale, 1.55 * scale);
  g.add(door);
  return g;
}

export function buildLollipopTree(scale = 1) {
  const g = new THREE.Group();
  g.name = 'prop-lollipop-tree';
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3 * scale, 0.4 * scale, 3 * scale, 6), pbrMat(0x8b6914));
  trunk.position.y = 1.5 * scale;
  g.add(trunk);
  for (let i = 0; i < 3; i++) {
    const lol = new THREE.Mesh(new THREE.SphereGeometry(0.8 * scale, 8, 8), pbrMat(i % 2 ? 0xff69b4 : 0x7cfc00, { emissive: 0xff88cc, emi: 0.3 }));
    const a = (i / 3) * Math.PI * 2;
    lol.position.set(Math.cos(a) * 1.2 * scale, 3.5 * scale, Math.sin(a) * 1.2 * scale);
    g.add(lol);
  }
  return g;
}

export function buildRedBarn(scale = 1) {
  const g = new THREE.Group();
  g.name = 'prop-barn';
  const base = new THREE.Mesh(new THREE.BoxGeometry(6 * scale, 4 * scale, 5 * scale), pbrMat(0xcc3333));
  base.position.y = 2 * scale;
  g.add(base);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(5 * scale, 2.5 * scale, 4), pbrMat(0x8b4513));
  roof.position.y = 5 * scale;
  roof.rotation.y = Math.PI / 4;
  g.add(roof);
  return g;
}

export function buildSeagull(scale = 1) {
  const g = new THREE.Group();
  g.name = 'prop-seagull';
  g.userData.animated = true;
  g.userData.bobPhase = Math.random() * 3;
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.4 * scale, 8, 6), pbrMat(0xffffff));
  g.add(body);
  const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.8 * scale, 0.1 * scale, 0.3 * scale), pbrMat(0xeeeeee));
  wingL.position.set(-0.5 * scale, 0, 0);
  wingL.name = 'wing-l';
  g.add(wingL);
  const wingR = wingL.clone();
  wingR.position.x = 0.5 * scale;
  wingR.name = 'wing-r';
  g.add(wingR);
  return g;
}

export function buildButterfly(scale = 1) {
  const g = new THREE.Group();
  g.name = 'prop-butterfly';
  g.userData.animated = true;
  g.userData.drift = 0.6;
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.08 * scale, 0.08 * scale, 0.5 * scale, 4), pbrMat(0x333333));
  body.position.y = 0.25 * scale;
  g.add(body);
  const wingL = new THREE.Mesh(new THREE.SphereGeometry(0.35 * scale, 6, 6), pbrMat(0xff88cc, { emissive: 0xff66aa, emi: 0.4 }));
  wingL.position.set(-0.3 * scale, 0.3 * scale, 0);
  wingL.scale.set(1.2, 0.3, 1);
  g.add(wingL);
  const wingR = wingL.clone();
  wingR.position.x = 0.3 * scale;
  g.add(wingR);
  return g;
}
