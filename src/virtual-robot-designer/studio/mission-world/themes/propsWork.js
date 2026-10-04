/** Job-site props: farm, mine, construction, space exploration. All face +z, base at y = 0. */
import * as THREE from 'three';
import { M, E, G, put, box, cyl, sph, cone, tor, ico, pick, labelTexture } from './propKit.js';

const wheel = (g, r, w, x, y, z, color = 0x2a2a30) => put(g, new THREE.CylinderGeometry(r, r, w, 14), M(color, { roughness: 0.8 }), x, y, z, 0, 0, Math.PI / 2);

export const WORK = {
  // ─── Farm ─────────────────────────────────────────────────────────
  barn(rand, o = {}) {
    const g = G();
    const red = M(o.color ?? 0xc8322a);
    box(g, 6, 4, 5, red, 0, 2);
    const roof = put(g, new THREE.CylinderGeometry(3.4, 3.4, 5.4, 3), M(o.roof ?? 0x5a4a44, { flatShading: true }), 0, 4.9, 0, -Math.PI / 2, 0, 0);
    roof.scale.set(1, 1, 0.52);
    const white = M(0xffffff);
    box(g, 2.4, 2.8, 0.1, M(0x8a2a22), 0, 1.4, 2.52);
    box(g, 2.6, 0.18, 0.14, white, 0, 2.85, 2.56);
    put(g, new THREE.BoxGeometry(3.4, 0.16, 0.14), white, 0, 1.4, 2.56, 0, 0, 0.86);
    put(g, new THREE.BoxGeometry(3.4, 0.16, 0.14), white, 0, 1.4, 2.56, 0, 0, -0.86);
    box(g, 1, 1, 0.1, white, 0, 4.4, 2.52);
    return g;
  },
  silo(rand, o = {}) {
    const g = G();
    cyl(g, 1.3, 1.3, 7, M(o.color ?? 0xd8dde4, { metalness: 0.4, roughness: 0.4 }), 0, 3.5, 0, 16);
    sph(g, 1.3, M(o.roof ?? 0xc8322a), 0, 7, 0, 16);
    for (let i = 1; i < 6; i++) cyl(g, 1.34, 1.34, 0.08, M(0xa8b0ba), 0, i * 1.2, 0, 16);
    return g;
  },
  tractor(rand, o = {}) {
    const g = G();
    const body = M(o.color ?? pick(rand, [0x2fa84f, 0xe84a3a, 0x3a7ae8]));
    box(g, 1.4, 1, 2.6, body, 0, 1.2, 0.2);
    box(g, 1.3, 1.2, 1.2, M(0xdff4ff, { transparent: true, opacity: 0.55 }), 0, 2.2, -0.4);
    box(g, 1.5, 0.12, 1.4, body, 0, 2.85, -0.4);
    cyl(g, 0.1, 0.1, 1, M(0x3a3a3a), 0.4, 2.2, 1.1, 8);
    wheel(g, 0.9, 0.5, 0.95, 0.9, -0.7);
    wheel(g, 0.9, 0.5, -0.95, 0.9, -0.7);
    wheel(g, 0.5, 0.36, 0.8, 0.5, 1.1);
    wheel(g, 0.5, 0.36, -0.8, 0.5, 1.1);
    return g;
  },
  hayBale(rand) {
    const g = G();
    put(g, new THREE.CylinderGeometry(0.8, 0.8, 1.3, 16), M(0xe8c060, { roughness: 0.95 }), 0, 0.8, 0, 0, 0, Math.PI / 2);
    put(g, new THREE.TorusGeometry(0.8, 0.04, 6, 24), M(0xc89a3a), 0.3, 0.8, 0, 0, Math.PI / 2, 0);
    put(g, new THREE.TorusGeometry(0.8, 0.04, 6, 24), M(0xc89a3a), -0.3, 0.8, 0, 0, Math.PI / 2, 0);
    return g;
  },
  cow(rand) {
    const g = G();
    const white = M(0xffffff);
    const black = M(0x2a2a2a);
    box(g, 0.9, 0.8, 1.6, white, 0, 1.1, 0);
    box(g, 0.5, 0.42, 0.6, black, 0.2, 1.35, 0.2);
    box(g, 0.5, 0.42, 0.5, black, -0.21, 1.1, -0.4);
    box(g, 0.6, 0.6, 0.6, white, 0, 1.4, 1);
    box(g, 0.5, 0.3, 0.2, M(0xffb8c8), 0, 1.2, 1.32);
    cone(g, 0.06, 0.25, M(0xfff0d0), 0.22, 1.8, 1, 6);
    cone(g, 0.06, 0.25, M(0xfff0d0), -0.22, 1.8, 1, 6);
    [[0.3, 0.55], [-0.3, 0.55], [0.3, -0.55], [-0.3, -0.55]].forEach(([x, z]) => box(g, 0.2, 0.7, 0.2, white, x, 0.35, z));
    return g;
  },
  sheep(rand) {
    const g = G();
    const wool = M(0xf8f4ec, { flatShading: true });
    ico(g, 0.6, wool, 0, 0.95, 0, 1);
    ico(g, 0.42, wool, 0, 1.05, -0.45, 1);
    box(g, 0.34, 0.4, 0.4, M(0x2a2a2a), 0, 1.05, 0.62);
    [[0.25, 0.3], [-0.25, 0.3], [0.25, -0.3], [-0.25, -0.3]].forEach(([x, z]) => box(g, 0.12, 0.5, 0.12, M(0x2a2a2a), x, 0.25, z));
    return g;
  },
  pig(rand) {
    const g = G();
    const pink = M(0xffa8b8);
    box(g, 0.8, 0.7, 1.2, pink, 0, 0.7, 0);
    box(g, 0.6, 0.55, 0.4, pink, 0, 0.8, 0.75);
    box(g, 0.34, 0.26, 0.1, M(0xff8aa0), 0, 0.72, 0.98);
    [[0.25, 0.4], [-0.25, 0.4], [0.25, -0.4], [-0.25, -0.4]].forEach(([x, z]) => box(g, 0.16, 0.36, 0.16, pink, x, 0.18, z));
    return g;
  },
  chicken(rand) {
    const g = G();
    const white = M(0xffffff);
    sph(g, 0.3, white, 0, 0.45, 0, 10);
    sph(g, 0.18, white, 0, 0.8, 0.18, 10);
    cone(g, 0.06, 0.14, M(0xffb020), 0, 0.8, 0.38, 6).rotation.x = Math.PI / 2;
    box(g, 0.06, 0.14, 0.14, M(0xe8322a), 0, 1, 0.18);
    cyl(g, 0.03, 0.03, 0.2, M(0xffb020), 0.1, 0.1, 0, 5);
    cyl(g, 0.03, 0.03, 0.2, M(0xffb020), -0.1, 0.1, 0, 5);
    return g;
  },
  pumpkin(rand, o = {}) {
    const g = G();
    const m = sph(g, 0.6, M(o.color ?? 0xff8a1a), 0, 0.5, 0, 16);
    m.scale.set(1, 0.75, 1);
    cyl(g, 0.06, 0.08, 0.3, M(0x4a7a2a), 0, 1, 0, 6);
    return g;
  },
  cropRow(rand, o = {}) {
    const g = G();
    box(g, 0.9, 0.24, 5, M(0x7a4a2a, { roughness: 1 }), 0, 0.12);
    const leaf = M(o.color ?? 0x3fbf4a, { flatShading: true });
    const fruit = o.fruit != null ? M(o.fruit) : null;
    for (let i = 0; i < 7; i++) {
      const z = -2.1 + i * 0.7;
      cone(g, 0.2, 0.55, leaf, 0.1, 0.5, z, 5);
      cone(g, 0.18, 0.45, leaf, -0.12, 0.46, z + 0.15, 5);
      if (fruit) sph(g, o.fruitSize ?? 0.2, fruit, 0, 0.3, z, 8);
    }
    return g;
  },
  cornStalks(rand) {
    const g = G();
    const stalk = M(0x6ab83a);
    for (let i = 0; i < 5; i++) {
      const x = (i - 2) * 0.35;
      cyl(g, 0.05, 0.07, 2.4, stalk, x, 1.2, (i % 2) * 0.2, 5);
      const cob = put(g, new THREE.CapsuleGeometry(0.1, 0.34, 3, 6), M(0xffd23f), x + 0.1, 1.5, (i % 2) * 0.2 + 0.08);
      cob.rotation.z = -0.3;
      cone(g, 0.18, 0.6, M(0x8ad04a, { flatShading: true }), x, 2.5, (i % 2) * 0.2, 4);
    }
    return g;
  },
  scarecrow(rand) {
    const g = G();
    const wood = M(0x8a5a32);
    cyl(g, 0.08, 0.08, 2.6, wood, 0, 1.3, 0, 6);
    put(g, new THREE.CylinderGeometry(0.06, 0.06, 1.8, 6), wood, 0, 1.9, 0, 0, 0, Math.PI / 2);
    box(g, 0.7, 0.8, 0.35, M(0x3a7ae8), 0, 1.7);
    box(g, 1.7, 0.3, 0.3, M(0xe84a3a), 0, 1.95);
    sph(g, 0.3, M(0xf0d8a0), 0, 2.5, 0, 10);
    cyl(g, 0.18, 0.5, 0.35, M(0xc8a040), 0, 2.85, 0, 10);
    return g;
  },
  beehive(rand) {
    const g = G();
    const y = M(0xffc83a);
    [0.5, 0.42, 0.32].forEach((r, i) => cyl(g, r, r + 0.04, 0.36, y, 0, 0.2 + i * 0.34, 0, 12));
    box(g, 0.2, 0.14, 0.05, M(0x3a2a1a), 0, 0.2, 0.52);
    box(g, 0.1, 0.8, 0.1, M(0x8a5a32), 0, -0.1);
    return g;
  },
  waterTrough(rand) {
    const g = G();
    box(g, 2, 0.6, 0.8, M(0x9aa4b0, { metalness: 0.5 }), 0, 0.3);
    box(g, 1.8, 0.05, 0.6, M(0x3fb8e8, { roughness: 0.1 }), 0, 0.56);
    return g;
  },

  // ─── Mine ─────────────────────────────────────────────────────────
  minecart(rand, o = {}) {
    const g = G();
    const iron = M(0x6a6e78, { metalness: 0.6, roughness: 0.45 });
    box(g, 1.2, 0.8, 1.6, iron, 0, 0.8);
    box(g, 1.26, 0.1, 1.66, M(0x8a5a32), 0, 1.2);
    const ore = o.ore ?? pick(rand, [0xffd23f, 0x5ce1ff, 0xff5d8f, 0x9a7aff]);
    for (let i = 0; i < 5; i++) ico(g, 0.25, E(ore, 0.35), (i % 3 - 1) * 0.35, 1.3, (i - 2) * 0.28, 0);
    wheel(g, 0.28, 0.14, 0.62, 0.3, 0.5, 0x3a3a40);
    wheel(g, 0.28, 0.14, -0.62, 0.3, 0.5, 0x3a3a40);
    wheel(g, 0.28, 0.14, 0.62, 0.3, -0.5, 0x3a3a40);
    wheel(g, 0.28, 0.14, -0.62, 0.3, -0.5, 0x3a3a40);
    return g;
  },
  rails(rand) {
    const g = G();
    const steel = M(0x9aa0aa, { metalness: 0.7, roughness: 0.3 });
    box(g, 0.1, 0.1, 6, steel, 0.55, 0.2);
    box(g, 0.1, 0.1, 6, steel, -0.55, 0.2);
    for (let i = 0; i < 8; i++) box(g, 1.6, 0.14, 0.3, M(0x6a4a2a), 0, 0.07, -2.6 + i * 0.75);
    return g;
  },
  mineEntrance(rand, o = {}) {
    const g = G();
    const wood = M(0x8a5a32, { roughness: 0.9 });
    ico(g, 5, M(o.rock ?? 0x7a6a5a, { flatShading: true }), 0, 2.2, -2, 1).scale.set(1.4, 1, 0.8);
    box(g, 4.2, 4.2, 0.4, M(0x120c08), 0, 2.1, 1.3);
    box(g, 0.5, 4.6, 0.5, wood, -2.2, 2.3, 1.5);
    box(g, 0.5, 4.6, 0.5, wood, 2.2, 2.3, 1.5);
    box(g, 5.2, 0.6, 0.6, wood, 0, 4.7, 1.5);
    const sign = put(g, new THREE.PlaneGeometry(3, 0.9), new THREE.MeshBasicMaterial({ map: labelTexture(o.text ?? 'MINE', '#ffc83a', '#3a2a1a', 512, 150) }), 0, 5.5, 1.82);
    sign.castShadow = false;
    sph(g, 0.22, E(0xffc83a, 1.4), -1.6, 4.1, 1.9, 8);
    sph(g, 0.22, E(0xffc83a, 1.4), 1.6, 4.1, 1.9, 8);
    return g;
  },
  supportBeam(rand) {
    const g = G();
    const wood = M(0x8a5a32, { roughness: 0.9 });
    box(g, 0.4, 4, 0.4, wood, -1.8, 2);
    box(g, 0.4, 4, 0.4, wood, 1.8, 2);
    box(g, 4.2, 0.45, 0.45, wood, 0, 4.1);
    cyl(g, 0.02, 0.02, 0.6, M(0x3a3a3a), 0, 3.6, 0, 4);
    sph(g, 0.2, E(0xffc83a, 1.5), 0, 3.3, 0, 8);
    return g;
  },
  goldPile(rand, o = {}) {
    const g = G();
    const gold = M(o.color ?? 0xffc83a, { metalness: 0.8, roughness: 0.25, emissive: o.color ?? 0xffa800, emissiveIntensity: 0.2 });
    for (let i = 0; i < 9; i++) ico(g, 0.3 + rand() * 0.2, gold, (rand() - 0.5) * 1.2, 0.25 + (i > 5 ? 0.35 : 0), (rand() - 0.5) * 1.2, 0);
    return g;
  },
  oreRock(rand, o = {}) {
    const g = G();
    ico(g, 1.1, M(o.rock ?? 0x6a5a50, { flatShading: true }), 0, 0.8, 0, 0);
    const gem = E(o.color ?? pick(rand, [0x5ce1ff, 0xff5dd0, 0xffd23f, 0x7fff6a]), 0.7);
    for (let i = 0; i < 5; i++) {
      const a = i * 1.3;
      const c = cone(g, 0.18, 0.6, gem, Math.cos(a) * 0.8, 1 + Math.sin(i) * 0.3, Math.sin(a) * 0.8, 5);
      c.rotation.set(Math.sin(a) * 0.8, 0, -Math.cos(a) * 0.8);
    }
    return g;
  },
  drill(rand) {
    const g = G();
    box(g, 1.8, 1, 2.4, M(0xffc400), 0, 0.9);
    wheel(g, 0.5, 0.4, 0.95, 0.5, 0.7);
    wheel(g, 0.5, 0.4, -0.95, 0.5, 0.7);
    wheel(g, 0.5, 0.4, 0.95, 0.5, -0.7);
    wheel(g, 0.5, 0.4, -0.95, 0.5, -0.7);
    const bit = G();
    const b = put(bit, new THREE.ConeGeometry(0.6, 1.8, 10), M(0xa8b0ba, { metalness: 0.8, roughness: 0.25, flatShading: true }), 0, 0, 0, Math.PI / 2, 0, 0);
    b.castShadow = true;
    bit.position.set(0, 1, 2.1);
    g.add(bit);
    g.userData.tick = (now) => { bit.rotation.z = now * 6; };
    return g;
  },
  lavaPool(rand, o = {}) {
    const g = G();
    const r = o.r ?? 3;
    const m = put(g, new THREE.CircleGeometry(r, 28), E(0xff5a1a, 1.4, { roughness: 0.3 }), 0, 0.04, 0, -Math.PI / 2);
    m.castShadow = false;
    put(g, new THREE.TorusGeometry(r, 0.35, 6, 28), M(0x3a2a2a, { flatShading: true }), 0, 0.1, 0, Math.PI / 2);
    for (let i = 0; i < 4; i++) sph(g, 0.3, E(0xffc83a, 1.6), (rand() - 0.5) * r, 0.12, (rand() - 0.5) * r, 8);
    g.userData.tick = (now) => { m.material.emissiveIntensity = 1.2 + Math.sin(now * 2) * 0.3; };
    return g;
  },
  mineLamp(rand) {
    const g = G();
    cyl(g, 0.06, 0.08, 2.6, M(0x6a4a2a), 0, 1.3, 0, 6);
    box(g, 0.7, 0.08, 0.08, M(0x6a4a2a), 0.3, 2.55);
    box(g, 0.3, 0.4, 0.3, M(0x3a3a3a, { metalness: 0.6 }), 0.6, 2.3);
    sph(g, 0.14, E(0xffc83a, 2), 0.6, 2.25, 0, 8);
    return g;
  },

  // ─── Construction ────────────────────────────────────────────────
  crane(rand, o = {}) {
    const g = G();
    const yellow = M(o.color ?? 0xffc400);
    const mast = o.h ?? 16;
    for (let i = 0; i < mast; i += 2) {
      box(g, 1, 0.12, 1, yellow, 0, i + 1);
      [[-0.45, -0.45], [0.45, -0.45], [-0.45, 0.45], [0.45, 0.45]].forEach(([x, z]) => box(g, 0.12, 2, 0.12, yellow, x, i + 1, z));
    }
    const jib = G();
    box(jib, 14, 0.6, 0.6, yellow, 3, 0);
    box(jib, 2, 1.4, 1.2, M(0x3a3f4b), -3.5, -0.9);
    box(jib, 1.4, 1.2, 1.4, M(0xdff4ff, { transparent: true, opacity: 0.6 }), 0, -1);
    cyl(jib, 0.03, 0.03, 5, M(0x3a3a3a), 8, -2.6, 0, 4);
    box(jib, 0.8, 0.6, 0.8, M(0xe84a3a), 8, -5.3);
    jib.position.y = mast + 0.6;
    g.add(jib);
    const ph = rand() * 6;
    g.userData.tick = (now) => { jib.rotation.y = Math.sin(now * 0.15 + ph) * 1.2; };
    return g;
  },
  excavator(rand, o = {}) {
    const g = G();
    const y = M(o.color ?? 0xffc400);
    box(g, 2.4, 0.6, 3, M(0x3a3a40), 0, 0.3);
    box(g, 2.2, 1.2, 2.2, y, 0, 1.3);
    box(g, 1, 1, 1, M(0xdff4ff, { transparent: true, opacity: 0.6 }), 0.5, 2.3, 0.4);
    const arm = G();
    const a1 = box(arm, 0.4, 0.4, 2.6, y, 0, 0, 1.3);
    a1.rotation.x = -0.5;
    const a2 = box(arm, 0.35, 0.35, 2, y, 0, 0.8, 3);
    a2.rotation.x = 0.8;
    box(arm, 0.9, 0.7, 0.7, M(0x5a5a60), 0, -0.1, 3.7);
    arm.position.set(-0.5, 1.8, 0.8);
    g.add(arm);
    const ph = rand() * 6;
    g.userData.tick = (now) => { arm.rotation.x = Math.sin(now * 0.8 + ph) * 0.25; };
    return g;
  },
  dumpTruck(rand, o = {}) {
    const g = G();
    const c = M(o.color ?? pick(rand, [0xff8a1a, 0xffc400, 0xe84a3a]));
    box(g, 1.8, 1.4, 1.4, c, 0, 1.4, 1.6);
    box(g, 1.6, 0.6, 0.1, M(0xdff4ff, { transparent: true, opacity: 0.6 }), 0, 1.8, 2.32);
    box(g, 2, 1.2, 3, M(0x8a8f99, { metalness: 0.4 }), 0, 1.6, -0.9);
    ico(g, 0.9, M(0xa8845a, { flatShading: true }), 0, 2.3, -0.9, 0);
    [[1, 1.6], [-1, 1.6], [1, -0.4], [-1, -0.4], [1, -1.6], [-1, -1.6]].forEach(([x, z]) => wheel(g, 0.5, 0.4, x, 0.5, z));
    return g;
  },
  barrier(rand) {
    const g = G();
    box(g, 2.4, 0.5, 0.15, M(0xffffff, { map: stripes() }), 0, 1);
    box(g, 0.12, 1.2, 0.12, M(0x3a3a3a), -1, 0.6);
    box(g, 0.12, 1.2, 0.12, M(0x3a3a3a), 1, 0.6);
    return g;
  },
  girders(rand, o = {}) {
    const g = G();
    const steel = M(o.color ?? 0xe84a3a, { metalness: 0.4, roughness: 0.5 });
    const lv = o.levels ?? 3;
    for (let l = 0; l < lv; l++) {
      const y = l * 3;
      [[-2, -2], [2, -2], [-2, 2], [2, 2]].forEach(([x, z]) => box(g, 0.3, 3, 0.3, steel, x, y + 1.5, z));
      box(g, 4.3, 0.3, 0.3, steel, 0, y + 3, -2);
      box(g, 4.3, 0.3, 0.3, steel, 0, y + 3, 2);
      box(g, 0.3, 0.3, 4.3, steel, -2, y + 3, 0);
      box(g, 0.3, 0.3, 4.3, steel, 2, y + 3, 0);
    }
    return g;
  },
  container(rand, o = {}) {
    const g = G();
    const c = o.color ?? pick(rand, [0x3a7ae8, 0xe84a3a, 0x2fa84f, 0xff8a1a, 0xffc400]);
    box(g, 2.4, 2.6, 6, M(c, { roughness: 0.5 }), 0, 1.3);
    for (let i = 0; i < 10; i++) box(g, 2.46, 2.4, 0.08, M(c, { roughness: 0.7 }), 0, 1.3, -2.7 + i * 0.6);
    return g;
  },
  pipeStack(rand) {
    const g = G();
    const m = M(0xb8bcc4, { roughness: 0.7, side: THREE.DoubleSide });
    [[0, 0.6], [1.2, 0.6], [-1.2, 0.6], [0.6, 1.6], [-0.6, 1.6]].forEach(([x, y]) => put(g, new THREE.CylinderGeometry(0.6, 0.6, 3, 14, 1, true), m, x, y, 0, Math.PI / 2, 0, 0));
    return g;
  },
  cementMixer(rand) {
    const g = G();
    box(g, 1.8, 1.4, 1.4, M(0xe84a3a), 0, 1.4, 1.8);
    box(g, 2, 0.4, 4, M(0x3a3a40), 0, 0.9, -0.2);
    const drum = G();
    const d = put(drum, new THREE.CylinderGeometry(0.7, 1.1, 2.8, 12), M(0xf0f0f0, { flatShading: true }), 0, 0, 0, Math.PI / 2 - 0.3, 0, 0);
    d.castShadow = true;
    for (let i = 0; i < 3; i++) put(drum, new THREE.TorusGeometry(0.95 - i * 0.1, 0.06, 6, 20), M(0xe84a3a), 0, 0.3 * (i - 1), -0.9 + i * 0.9, 0.3, 0, 0);
    drum.position.set(0, 2.1, -0.6);
    g.add(drum);
    [[1, 1.8], [-1, 1.8], [1, -1], [-1, -1], [1, -1.9], [-1, -1.9]].forEach(([x, z]) => wheel(g, 0.45, 0.36, x, 0.45, z));
    g.userData.tick = (now) => { drum.rotation.z = now * 1.2; };
    return g;
  },
  logPile(rand) {
    const g = G();
    const bark = M(0x7a4f2a, { roughness: 0.95 });
    [[0, 0.4], [0.8, 0.4], [-0.8, 0.4], [0.4, 1.1], [-0.4, 1.1], [0, 1.8]].forEach(([x, y]) => {
      put(g, new THREE.CylinderGeometry(0.4, 0.4, 3.2, 10), bark, x, y, 0, Math.PI / 2, 0, 0);
      put(g, new THREE.CircleGeometry(0.38, 10), M(0xe8c890), x, y, 1.61);
    });
    return g;
  },
  roadSign(rand, o = {}) {
    const g = G();
    cyl(g, 0.05, 0.05, 2, M(0x9aa0aa), 0, 1, 0, 6);
    const s = put(g, new THREE.CircleGeometry(0.45, 3), M(0xffc400, { side: THREE.DoubleSide }), 0, 2.1, 0.06);
    s.rotation.z = Math.PI / 2;
    const t = put(g, new THREE.PlaneGeometry(0.6, 0.3), new THREE.MeshBasicMaterial({ map: labelTexture(o.text ?? '!', '#ffc400', '#1a1a1a', 128, 64, 'bold 48px system-ui') }), 0, 2.05, 0.08);
    t.castShadow = false;
    return g;
  },

  // ─── Space exploration ───────────────────────────────────────────
  alienPlant(rand, o = {}) {
    const g = G();
    const c = o.color ?? pick(rand, [0x7fff6a, 0xff5dd0, 0x5ce1ff, 0xb46bff]);
    const stem = M(0x3a6a5a);
    for (let i = 0; i < 3; i++) {
      const h = 1.2 + rand() * 1.4;
      const x = (i - 1) * 0.5;
      cyl(g, 0.06, 0.1, h, stem, x, h / 2, 0, 6);
      sph(g, 0.3 + rand() * 0.2, E(c, 0.8), x, h + 0.2, 0, 10);
    }
    return g;
  },
  iceSpike(rand, o = {}) {
    const g = G();
    const ice = M(o.color ?? 0xc8f0ff, { transparent: true, opacity: 0.85, roughness: 0.1, metalness: 0.1, emissive: 0x6ac8ff, emissiveIntensity: 0.15, flatShading: true });
    for (let i = 0; i < 4; i++) {
      const c = cone(g, 0.4 + rand() * 0.3, 2 + rand() * 2.4, ice, (rand() - 0.5) * 1.2, 0, (rand() - 0.5) * 1.2, 5);
      c.position.y = c.geometry.parameters.height / 2;
      c.rotation.z = (rand() - 0.5) * 0.4;
    }
    return g;
  },
  launchPad(rand) {
    const g = G();
    cyl(g, 4, 4.2, 0.4, M(0x8a8f99), 0, 0.2, 0, 24);
    put(g, new THREE.TorusGeometry(3.5, 0.12, 6, 32), E(0xffc400, 0.8), 0, 0.42, 0, Math.PI / 2);
    box(g, 0.3, 6, 0.3, M(0xe84a3a), 3.2, 3, -1);
    box(g, 0.3, 6, 0.3, M(0xe84a3a), 3.2, 3, 1);
    box(g, 0.3, 0.3, 2.4, M(0xe84a3a), 3.2, 5.5, 0);
    box(g, 0.3, 0.3, 2.4, M(0xe84a3a), 3.2, 3.5, 0);
    return g;
  },
  buggy(rand, o = {}) {
    const g = G();
    box(g, 1.6, 0.4, 2.4, M(o.color ?? 0xf0f0f0), 0, 0.8);
    box(g, 1.2, 0.6, 1, M(0xdff4ff, { transparent: true, opacity: 0.5 }), 0, 1.3, 0.2);
    cyl(g, 0.03, 0.03, 1.2, M(0x9aa0aa), 0.6, 1.6, -0.8, 4);
    sph(g, 0.1, E(0xff5d5d, 1.4), 0.6, 2.2, -0.8, 6);
    [[0.9, 0.8], [-0.9, 0.8], [0.9, -0.8], [-0.9, -0.8]].forEach(([x, z]) => wheel(g, 0.42, 0.3, x, 0.42, z, 0x5a5a60));
    return g;
  },
  dish(rand) {
    const g = G();
    cyl(g, 0.2, 0.3, 2.4, M(0xd8dde4), 0, 1.2, 0, 8);
    const head = G();
    const d = put(head, new THREE.SphereGeometry(1.6, 18, 8, 0, Math.PI * 2, 0, Math.PI / 3), M(0xf4f6f8, { side: THREE.DoubleSide, metalness: 0.3 }), 0, 0, 0, -Math.PI / 2 - 0.4, 0, 0);
    d.castShadow = true;
    cyl(head, 0.04, 0.04, 1.3, M(0x9aa0aa), 0, 0.3, 0.7, 4).rotation.x = 1.1;
    sph(head, 0.12, E(0x5ce1ff, 1.4), 0, 0.6, 1.2, 8);
    head.position.y = 2.6;
    g.add(head);
    const ph = rand() * 6;
    g.userData.tick = (now) => { head.rotation.y = Math.sin(now * 0.3 + ph) * 0.8; };
    return g;
  },
  habitat(rand, o = {}) {
    const g = G();
    const white = M(0xf2f4f8, { roughness: 0.4 });
    cyl(g, 2.4, 2.4, 2.4, white, 0, 1.2, 0, 18);
    sph(g, 2.4, white, 0, 2.4, 0, 18).scale.set(1, 0.55, 1);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      sph(g, 0.26, E(o.glow ?? 0x5ce1ff, 1), Math.sin(a) * 2.4, 1.6, Math.cos(a) * 2.4, 8);
    }
    box(g, 1.2, 1.6, 2.2, white, 0, 0.8, 3);
    box(g, 0.8, 1.2, 0.05, M(0x5ce1ff, { emissive: 0x5ce1ff, emissiveIntensity: 0.3 }), 0, 0.7, 4.12);
    return g;
  },
};

let stripeTex = null;
function stripes() {
  if (stripeTex) return stripeTex;
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 32;
  const x = c.getContext('2d');
  x.fillStyle = '#ffffff';
  x.fillRect(0, 0, 128, 32);
  x.fillStyle = '#e84a3a';
  for (let i = -1; i < 6; i++) {
    x.beginPath();
    x.moveTo(i * 24, 32);
    x.lineTo(i * 24 + 12, 32);
    x.lineTo(i * 24 + 28, 0);
    x.lineTo(i * 24 + 16, 0);
    x.fill();
  }
  stripeTex = new THREE.CanvasTexture(c);
  stripeTex.colorSpace = THREE.SRGBColorSpace;
  return stripeTex;
}
