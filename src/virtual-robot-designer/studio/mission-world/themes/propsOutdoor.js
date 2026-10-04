/** Outdoor mission props: nature, town, park, beach, farm, space. All face +z, base at y = 0. */
import * as THREE from 'three';
import { M, E, G, put, box, cyl, sph, cone, tor, ico, pick, facadeTexture, labelTexture } from './propKit.js';

const FLOWER = [0xff5d8f, 0xffd23f, 0xff8a3d, 0xb46bff, 0xffffff, 0x4fc3ff];

export const OUTDOOR = {
  treeRound(rand, o = {}) {
    const g = G();
    cyl(g, 0.22, 0.32, 2.2, M(o.trunk ?? 0x8a5a32), 0, 1.1);
    const leaf = M(o.color ?? 0x4cc05a, { flatShading: true });
    ico(g, 1.7, leaf, 0, 3.3, 0, 1);
    ico(g, 1.2, leaf, 0.9, 2.8, 0.3, 1);
    ico(g, 1.1, leaf, -0.8, 3.0, -0.4, 1);
    if (o.fruit) for (let i = 0; i < 6; i++) sph(g, 0.16, M(o.fruit), Math.cos(i) * 1.4, 2.8 + (i % 3) * 0.5, Math.sin(i) * 1.4, 8);
    return g;
  },
  treePine(rand, o = {}) {
    const g = G();
    cyl(g, 0.18, 0.26, 1.2, M(0x7a4f2a), 0, 0.6, 0, 7);
    const greens = o.colors ?? [0x2f8f4a, 0x38a555, 0x46b962];
    for (let i = 0; i < 3; i++) {
      cone(g, 1.5 - i * 0.36, 1.9, M(greens[i % greens.length], { flatShading: true }), 0, 1.6 + i * 1.05, 0, 8);
      if (o.snow) cone(g, 0.8 - i * 0.2, 0.7, M(0xf4fbff, { flatShading: true }), 0, 2.2 + i * 1.05, 0, 8);
    }
    return g;
  },
  treePalm(rand, o = {}) {
    const g = G();
    const trunk = M(0xa0703f);
    let x = 0;
    for (let i = 0; i < 6; i++) {
      x += 0.08 * i;
      put(g, new THREE.CylinderGeometry(0.2 - i * 0.015, 0.26 - i * 0.015, 1.1, 7), trunk, x, 0.55 + i * 1.02, 0, 0, 0, -0.08 * i);
    }
    const leaf = M(o.color ?? 0x2fb14e, { side: THREE.DoubleSide, flatShading: true });
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      const m = put(g, new THREE.ConeGeometry(0.45, 3, 4, 1, true), leaf, x + Math.cos(a) * 1.2, 6.2, Math.sin(a) * 1.2);
      m.scale.set(1, 1, 0.25);
      m.lookAt(x + Math.cos(a) * 3, 5.3, Math.sin(a) * 3);
      m.rotateX(Math.PI / 2);
    }
    sph(g, 0.26, M(0x6b4a2a), x, 6.05, 0, 8);
    return g;
  },
  treeBlossom(rand, o = {}) {
    const g = G();
    cyl(g, 0.2, 0.3, 2.4, M(0x6b4636), 0, 1.2);
    const pink = M(o.color ?? 0xffb7d5, { flatShading: true });
    [[0, 3.4, 0, 1.6], [1, 3, 0.4, 1.1], [-0.9, 3.1, -0.3, 1.2], [0.2, 4.2, -0.2, 1]].forEach(([x, y, z, r]) => ico(g, r, pink, x, y, z, 1));
    return g;
  },
  treeAutumn(rand, o = {}) {
    return OUTDOOR.treeRound(rand, { color: o.color ?? pick(rand, [0xff8a2a, 0xe8542f, 0xffc233]) });
  },
  bush(rand, o = {}) {
    const g = G();
    const m = M(o.color ?? 0x3fae4f, { flatShading: true });
    ico(g, 0.8, m, 0, 0.6, 0, 1);
    ico(g, 0.6, m, 0.7, 0.45, 0.1, 1);
    ico(g, 0.55, m, -0.6, 0.42, -0.1, 1);
    if (o.flowers) for (let i = 0; i < 5; i++) sph(g, 0.1, M(pick(rand, FLOWER)), Math.cos(i * 1.3) * 0.7, 0.9, Math.sin(i * 1.3) * 0.5, 6);
    return g;
  },
  hedge(rand, o = {}) {
    const g = G();
    box(g, 3, 1.2, 0.9, M(o.color ?? 0x2f9a45, { flatShading: true }));
    return g;
  },
  flowers(rand, o = {}) {
    const g = G();
    const stem = M(0x3a9a3a);
    const cols = o.colors ?? FLOWER;
    for (let i = 0; i < 7; i++) {
      const x = (rand() - 0.5) * 1.4;
      const z = (rand() - 0.5) * 1.4;
      cyl(g, 0.025, 0.025, 0.5, stem, x, 0.25, z, 4);
      sph(g, 0.13, M(cols[i % cols.length], { emissive: cols[i % cols.length], emissiveIntensity: 0.12 }), x, 0.55, z, 8);
    }
    return g;
  },
  sunflower(rand) {
    const g = G();
    cyl(g, 0.06, 0.08, 2.2, M(0x3f9a32), 0, 1.1, 0, 6);
    const head = G();
    head.position.set(0, 2.3, 0.05);
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const p = put(head, new THREE.SphereGeometry(0.18, 8, 6), M(0xffc81e), Math.cos(a) * 0.36, Math.sin(a) * 0.36, 0);
      p.scale.set(1, 0.5, 0.3);
      p.rotation.z = a;
    }
    const c = put(head, new THREE.CylinderGeometry(0.26, 0.26, 0.1, 14), M(0x5a3413), 0, 0, 0.03, Math.PI / 2);
    c.rotation.x = Math.PI / 2;
    g.add(head);
    return g;
  },
  mushroom(rand, o = {}) {
    const g = G();
    cyl(g, 0.18, 0.24, 0.8, M(0xfff3de), 0, 0.4);
    const cap = sph(g, 0.6, M(o.color ?? 0xff4d4d), 0, 0.8, 0, 14);
    cap.scale.y = 0.6;
    for (let i = 0; i < 5; i++) sph(g, 0.09, M(0xffffff), Math.cos(i * 1.25) * 0.4, 1.05, Math.sin(i * 1.25) * 0.4, 6);
    return g;
  },
  rock(rand, o = {}) {
    const g = G();
    const m = M(o.color ?? 0x8b8f99, { flatShading: true, roughness: 0.9 });
    const a = put(g, new THREE.DodecahedronGeometry(1, 0), m, 0, 0.55, 0);
    a.scale.set(1.3, 0.8, 1);
    const b = put(g, new THREE.DodecahedronGeometry(0.55, 0), m, 1, 0.3, 0.3);
    b.rotation.set(0.4, 0.8, 0);
    return g;
  },
  cactus(rand, o = {}) {
    const g = G();
    const m = M(o.color ?? 0x3f9a4a, { flatShading: true });
    cyl(g, 0.32, 0.36, 3, m, 0, 1.5, 0, 8);
    sph(g, 0.32, m, 0, 3, 0, 8);
    [[-1, 1.4], [1, 1.9]].forEach(([s, y]) => {
      cyl(g, 0.18, 0.18, 0.6, m, s * 0.45, y, 0, 8).rotation.z = Math.PI / 2;
      cyl(g, 0.18, 0.2, 1, m, s * 0.75, y + 0.45, 0, 8);
      sph(g, 0.18, m, s * 0.75, y + 0.95, 0, 8);
    });
    sph(g, 0.14, M(0xff6fae), 0, 3.3, 0, 8);
    return g;
  },
  grass(rand, o = {}) {
    const g = G();
    const m = M(o.color ?? 0x5cc05a, { flatShading: true });
    for (let i = 0; i < 5; i++) {
      const c = put(g, new THREE.ConeGeometry(0.08, 0.6 + (i % 3) * 0.2, 4), m, Math.cos(i * 1.3) * 0.2, 0.35, Math.sin(i * 1.3) * 0.2);
      c.rotation.set(Math.sin(i) * 0.3, 0, Math.cos(i) * 0.3);
    }
    return g;
  },
  hill(rand, o = {}) {
    const g = G();
    const h = sph(g, 1, M(o.color ?? 0x6fcf6a, { flatShading: true, roughness: 0.95 }), 0, 0, 0, 16);
    h.scale.set(o.w ?? 30, o.h ?? 12, (o.w ?? 30) * 0.7);
    return g;
  },
  mountain(rand, o = {}) {
    const g = G();
    const r = 18 + rand() * 12;
    const h = 28 + rand() * 20;
    const rot = rand() * Math.PI;
    const body = put(g, new THREE.ConeGeometry(r, h, 6), M(o.color ?? 0x7b8aa6, { flatShading: true, roughness: 0.85 }), 0, h / 2, 0, 0, rot, 0);
    body.castShadow = false;
    if (o.snow !== false) put(g, new THREE.ConeGeometry(r * 0.3, h * 0.28, 6), M(o.snow ?? 0xf6fbff, { flatShading: true }), 0, h - h * 0.14 + 0.05, 0, 0, rot, 0);
    return g;
  },
  mesa(rand, o = {}) {
    const g = G();
    const m = M(o.color ?? 0xd08a52, { flatShading: true });
    cyl(g, 10, 13, 16, m, 0, 8, 0, 7);
    cyl(g, 10.4, 10, 1.4, M(o.top ?? 0xe7a669, { flatShading: true }), 0, 16.4, 0, 7);
    return g;
  },
  pond(rand, o = {}) {
    const g = G();
    const w = put(g, new THREE.CircleGeometry(o.r ?? 5, 32), M(o.color ?? 0x4fb6e8, { roughness: 0.08, metalness: 0.2 }), 0, 0.03, 0, -Math.PI / 2);
    w.castShadow = false;
    const edge = put(g, new THREE.RingGeometry(o.r ?? 5, (o.r ?? 5) + 0.6, 32), M(0xd9c8a0), 0, 0.02, 0, -Math.PI / 2);
    edge.castShadow = false;
    if (o.lilies) for (let i = 0; i < 5; i++) put(g, new THREE.CircleGeometry(0.4, 10), M(0x46b24a), Math.cos(i * 1.7) * 2.6, 0.05, Math.sin(i * 1.7) * 2.6, -Math.PI / 2);
    return g;
  },

  // ─── Town & park ───
  house(rand, o = {}) {
    const g = G();
    const wall = o.color ?? pick(rand, [0xffe1b3, 0xffc9d9, 0xc9f0ff, 0xd9f5c4, 0xfff3a8]);
    const roof = o.roof ?? pick(rand, [0xe8543f, 0x3f7fd9, 0x55b86a, 0xf29d2e]);
    box(g, 4.4, 3.4, 4, M(wall, { map: facadeTexture(wall, 0x7cc6ff) }), 0, 1.7);
    const r = put(g, new THREE.ConeGeometry(3.5, 2.4, 4), M(roof, { flatShading: true }), 0, 4.6, 0, 0, Math.PI / 4, 0);
    r.scale.z = 0.95;
    box(g, 1, 1.8, 0.1, M(0x8a5a32), 0, 0.9, 2.02);
    box(g, 0.5, 1.2, 0.5, M(0xb04a3a), 1.2, 5.2, -0.6);
    return g;
  },
  shop(rand, o = {}) {
    const g = G();
    const wall = o.color ?? pick(rand, [0xfff2d6, 0xffd6e5, 0xd6f0ff]);
    const stripe = o.stripe ?? pick(rand, [0xff5d5d, 0x3fa7ff, 0x3fcf7a, 0xffb020]);
    box(g, 5, 4, 3.6, M(wall, { map: facadeTexture(wall, 0x9fdcff) }), 0, 2);
    for (let i = 0; i < 6; i++) box(g, 5 / 6, 0.12, 1.3, M(i % 2 ? 0xffffff : stripe), -2.5 + 5 / 12 + (i * 5) / 6, 2.9, 2.35).rotation.x = 0.35;
    box(g, 5.2, 0.4, 3.8, M(stripe), 0, 4.2);
    return g;
  },
  tower(rand, o = {}) {
    const g = G();
    const h = o.h ?? 10 + rand() * 14;
    const wall = o.color ?? pick(rand, [0xa8c8ff, 0xffc2a8, 0xc6b4ff, 0xa8f0d2, 0xfff0a8]);
    const t = facadeTexture(wall, o.glass ?? 0x4a6fa5, o.lit);
    const b = box(g, 5, h, 5, M(0xffffff, { map: t.clone() }), 0, h / 2);
    b.material.map.repeat.set(1, Math.round(h / 4));
    b.material.map.needsUpdate = true;
    box(g, 5.4, 0.5, 5.4, M(o.roof ?? 0xffffff), 0, h + 0.25);
    return g;
  },
  lamp(rand, o = {}) {
    const g = G();
    cyl(g, 0.08, 0.12, 3.6, M(o.pole ?? 0x3b4252, { metalness: 0.5 }), 0, 1.8, 0, 8);
    sph(g, 0.3, E(o.color ?? 0xfff1b0, 1.4), 0, 3.75, 0, 12);
    return g;
  },
  bench(rand, o = {}) {
    const g = G();
    const wood = M(o.color ?? 0xb0703a);
    box(g, 1.8, 0.1, 0.5, wood, 0, 0.5, 0);
    box(g, 1.8, 0.4, 0.08, wood, 0, 0.8, -0.24);
    [-0.8, 0.8].forEach((x) => box(g, 0.08, 0.5, 0.45, M(0x444a55), x, 0.25, 0));
    return g;
  },
  fence(rand, o = {}) {
    const g = G();
    const m = M(o.color ?? 0xffffff);
    for (let i = 0; i < 5; i++) box(g, 0.14, 1, 0.1, m, -1.2 + i * 0.6, 0.5, 0);
    [0.35, 0.75].forEach((y) => box(g, 2.8, 0.1, 0.06, m, 0, y, 0));
    return g;
  },
  trafficLight(rand) {
    const g = G();
    cyl(g, 0.1, 0.12, 3, M(0x3b4252), 0, 1.5, 0, 8);
    box(g, 0.5, 1.3, 0.4, M(0x222831), 0, 3.4, 0);
    [[0xff3b3b, 3.8], [0xffc400, 3.4], [0x2ee06a, 3.0]].forEach(([c, y]) => sph(g, 0.14, E(c, 1.2), 0, y, 0.2, 10));
    return g;
  },
  cone(rand) {
    const g = G();
    box(g, 0.6, 0.06, 0.6, M(0xff6a00), 0, 0.03);
    cone(g, 0.24, 0.8, M(0xff7a1a), 0, 0.46, 0, 12);
    cyl(g, 0.15, 0.19, 0.12, M(0xffffff), 0, 0.5, 0, 12);
    return g;
  },
  hydrant(rand, o = {}) {
    const g = G();
    const m = M(o.color ?? 0xe53935, { metalness: 0.3 });
    cyl(g, 0.22, 0.26, 0.8, m, 0, 0.4);
    sph(g, 0.22, m, 0, 0.82, 0, 10);
    cyl(g, 0.08, 0.08, 0.6, m, 0, 0.55, 0, 8).rotation.z = Math.PI / 2;
    return g;
  },
  bins(rand) {
    const g = G();
    [[0x3b82f6, -0.8], [0x22c55e, 0], [0xfacc15, 0.8]].forEach(([c, x]) => {
      box(g, 0.7, 1, 0.7, M(c), x, 0.5);
      box(g, 0.76, 0.1, 0.76, M(c, { roughness: 0.3 }), x, 1.05);
      box(g, 0.3, 0.06, 0.02, M(0xffffff), x, 0.7, 0.36);
    });
    return g;
  },
  signpost(rand, o = {}) {
    const g = G();
    cyl(g, 0.07, 0.07, 2.2, M(0x8a5a32), 0, 1.1, 0, 6);
    const s = put(g, new THREE.PlaneGeometry(1.8, 0.56), M(0xffffff, { map: labelTexture(o.text ?? 'THIS WAY', o.bg ?? '#ffd23f', o.fg ?? '#1e293b') }), 0, 2, 0.05);
    s.castShadow = false;
    return g;
  },
  bunting(rand, o = {}) {
    const g = G();
    const cols = o.colors ?? [0xff5d5d, 0xffd23f, 0x3fa7ff, 0x3fcf7a, 0xb46bff];
    [-3, 3].forEach((x) => cyl(g, 0.07, 0.07, 3.6, M(0xffffff), x, 1.8, 0, 6));
    for (let i = 0; i < 9; i++) {
      const x = -2.7 + i * 0.68;
      const y = 3.4 - Math.sin((i / 8) * Math.PI) * 0.5;
      const f = put(g, new THREE.ConeGeometry(0.2, 0.45, 3), M(cols[i % cols.length], { side: THREE.DoubleSide }), x, y, 0, Math.PI, 0, 0);
      f.scale.z = 0.15;
    }
    return g;
  },
  stall(rand, o = {}) {
    const g = G();
    const c = o.color ?? pick(rand, [0xff5d8f, 0x3fa7ff, 0xffb020, 0x3fcf7a]);
    box(g, 2.6, 1, 1.4, M(0xfff2d6), 0, 0.5);
    [-1.2, 1.2].forEach((x) => cyl(g, 0.06, 0.06, 2.4, M(0xffffff), x, 1.2, 0.6, 6));
    for (let i = 0; i < 5; i++) box(g, 0.56, 0.1, 1.8, M(i % 2 ? 0xffffff : c), -1.12 + i * 0.56, 2.45, 0.2).rotation.x = -0.2;
    for (let i = 0; i < 4; i++) sph(g, 0.16, M(pick(rand, FLOWER)), -0.9 + i * 0.6, 1.15, 0.3, 8);
    return g;
  },
  balloons(rand) {
    const g = G();
    for (let i = 0; i < 5; i++) {
      const p = new THREE.Vector3((rand() - 0.5) * 1.4, 3.2 + rand() * 1.2, (rand() - 0.5) * 1.4);
      const b = sph(g, 0.45, M(pick(rand, FLOWER), { roughness: 0.25 }), p.x, p.y, p.z, 12);
      b.scale.y = 1.2;
      const s = put(g, new THREE.CylinderGeometry(0.01, 0.01, p.y, 3), M(0xffffff), p.x / 2, p.y / 2, p.z / 2);
      s.lookAt(p.x, p.y, p.z);
      s.rotateX(Math.PI / 2);
    }
    return g;
  },
  slide(rand, o = {}) {
    const g = G();
    const c = o.color ?? 0xff5d5d;
    [-0.6, 0.6].forEach((x) => { box(g, 0.1, 3, 0.1, M(0x3fa7ff), x, 1.5, -1.6); box(g, 0.1, 3, 0.1, M(0x3fa7ff), x, 1.5, -0.6); });
    box(g, 1.4, 0.15, 1.2, M(0xffd23f), 0, 3, -1.1);
    box(g, 1.1, 0.12, 4, M(c), 0, 1.6, 1.3).rotation.x = 0.62;
    for (let i = 0; i < 5; i++) box(g, 1.1, 0.08, 0.2, M(0xffffff), 0, 0.5 + i * 0.55, -2.1);
    return g;
  },
  swings(rand) {
    const g = G();
    const frame = M(0x3fa7ff);
    [-1.6, 1.6].forEach((x) => {
      put(g, new THREE.CylinderGeometry(0.08, 0.08, 3.2, 6), frame, x, 1.5, 0.5, 0.35, 0, 0);
      put(g, new THREE.CylinderGeometry(0.08, 0.08, 3.2, 6), frame, x, 1.5, -0.5, -0.35, 0, 0);
    });
    cyl(g, 0.08, 0.08, 3.4, frame, 0, 3, 0, 6).rotation.z = Math.PI / 2;
    [-0.7, 0.7].forEach((x) => {
      [-0.25, 0.25].forEach((dx) => cyl(g, 0.02, 0.02, 2.2, M(0xcccccc), x + dx, 1.9, 0, 4));
      box(g, 0.7, 0.08, 0.35, M(0xff5d5d), x, 0.8, 0);
    });
    return g;
  },
  solarPanel(rand) {
    const g = G();
    cyl(g, 0.08, 0.08, 1, M(0x9aa3ad, { metalness: 0.6 }), 0, 0.5, 0, 6);
    const p = box(g, 2.4, 0.08, 1.4, M(0x1d3f8f, { metalness: 0.5, roughness: 0.2, emissive: 0x0b2a6f, emissiveIntensity: 0.3 }), 0, 1.1, 0);
    p.rotation.x = -0.5;
    return g;
  },
  crate(rand, o = {}) {
    const g = G();
    box(g, 1, 1, 1, M(o.color ?? 0xc98a4a), 0, 0.5);
    box(g, 1.04, 0.14, 1.04, M(0x8a5a32), 0, 0.2);
    box(g, 1.04, 0.14, 1.04, M(0x8a5a32), 0, 0.8);
    return g;
  },
  barrel(rand, o = {}) {
    const g = G();
    cyl(g, 0.42, 0.42, 1.1, M(o.color ?? 0x3f7fd9, { metalness: 0.3 }), 0, 0.55, 0, 14);
    [0.25, 0.85].forEach((y) => cyl(g, 0.44, 0.44, 0.06, M(0xdddddd, { metalness: 0.6 }), 0, y, 0, 14));
    return g;
  },
  umbrella(rand, o = {}) {
    const g = G();
    cyl(g, 0.05, 0.05, 2.6, M(0xffffff), 0, 1.3, 0, 6);
    const c = o.color ?? pick(rand, [0xff5d5d, 0x3fa7ff, 0xffd23f, 0x3fcf7a]);
    for (let i = 0; i < 8; i++) {
      const s = put(g, new THREE.ConeGeometry(1.4, 0.6, 8, 1, true, (i / 8) * Math.PI * 2, Math.PI / 4), M(i % 2 ? 0xffffff : c, { side: THREE.DoubleSide }), 0, 2.6, 0);
      s.castShadow = true;
    }
    return g;
  },
  sandcastle(rand) {
    const g = G();
    const s = M(0xf2d58a, { flatShading: true });
    box(g, 1.6, 0.6, 1.6, s, 0, 0.3);
    [[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]].forEach(([x, z]) => { cyl(g, 0.26, 0.3, 1, s, x, 0.5, z, 8); cone(g, 0.28, 0.4, s, x, 1.2, z, 8); });
    cyl(g, 0.34, 0.38, 1.4, s, 0, 0.7, 0, 8);
    box(g, 0.02, 0.3, 0.3, M(0xff5d5d), 0, 1.75, 0.15);
    return g;
  },
  lifeguard(rand) {
    const g = G();
    const w = M(0xffffff);
    [[-0.8, -0.8], [0.8, -0.8], [-0.8, 0.8], [0.8, 0.8]].forEach(([x, z]) => box(g, 0.14, 2.6, 0.14, w, x, 1.3, z));
    box(g, 2, 1.4, 2, M(0xff5d5d), 0, 3.2);
    box(g, 2.4, 0.2, 2.4, w, 0, 4);
    cone(g, 1.8, 0.8, M(0xffd23f), 0, 4.5, 0, 4).rotation.y = Math.PI / 4;
    return g;
  },
  windTurbine(rand) {
    const g = G();
    cyl(g, 0.25, 0.45, 14, M(0xf4f6fa), 0, 7, 0, 10);
    box(g, 0.7, 0.7, 1.6, M(0xf4f6fa), 0, 14.2, 0);
    const hub = G();
    hub.position.set(0, 14.2, 0.9);
    for (let i = 0; i < 3; i++) {
      const b = put(hub, new THREE.BoxGeometry(0.4, 6, 0.1), M(0xffffff), 0, 3, 0);
      b.geometry.translate(0, 0, 0);
      const arm = G();
      arm.rotation.z = (i / 3) * Math.PI * 2;
      arm.add(b);
      hub.add(arm);
    }
    sph(hub, 0.4, M(0xff5d5d), 0, 0, 0.1, 10);
    g.add(hub);
    g.userData.tick = (now) => { hub.rotation.z = now * 1.2; };
    return g;
  },
  windmill(rand, o = {}) {
    const g = G();
    cyl(g, 1.4, 2, 7, M(o.color ?? 0xfff0dd), 0, 3.5, 0, 8);
    cone(g, 2, 2.2, M(o.roof ?? 0xd9534f, { flatShading: true }), 0, 8.1, 0, 8);
    box(g, 0.9, 1.6, 0.1, M(0x8a5a32), 0, 0.8, 1.9);
    const hub = G();
    hub.position.set(0, 6.6, 1.8);
    for (let i = 0; i < 4; i++) {
      const arm = G();
      arm.rotation.z = (i * Math.PI) / 2;
      box(arm, 0.3, 4.4, 0.08, M(0x8a5a32), 0, 2.4, 0);
      box(arm, 1, 3.4, 0.05, M(0xffffff), 0.6, 2.8, 0.05);
      hub.add(arm);
    }
    g.add(hub);
    g.userData.tick = (now) => { hub.rotation.z = now * 0.8; };
    return g;
  },
  ferrisWheel(rand) {
    const g = G();
    const frame = M(0xffffff, { metalness: 0.3 });
    [-1, 1].forEach((s) => {
      put(g, new THREE.CylinderGeometry(0.2, 0.25, 11, 8), frame, s * 3, 5, 0.8 * s, 0, 0, s * 0.28);
    });
    const wheel = G();
    wheel.position.set(0, 10, 0);
    tor(wheel, 8, 0.18, E(0xff5d8f, 0.5));
    tor(wheel, 5, 0.12, E(0x3fa7ff, 0.5));
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const spoke = put(wheel, new THREE.CylinderGeometry(0.06, 0.06, 8, 5), frame, Math.cos(a) * 4, Math.sin(a) * 4, 0, 0, 0, a + Math.PI / 2);
      spoke.castShadow = false;
      const cab = box(wheel, 1, 1, 1, M(FLOWER[i % FLOWER.length]), Math.cos(a) * 8, Math.sin(a) * 8 - 0.6, 0);
      cab.userData.cab = a;
    }
    g.add(wheel);
    g.userData.tick = (now) => {
      wheel.rotation.z = now * 0.25;
      wheel.children.forEach((c) => { if (c.userData.cab != null) c.rotation.z = -wheel.rotation.z; });
    };
    return g;
  },
  carousel(rand) {
    const g = G();
    cyl(g, 4, 4.2, 0.5, M(0xffffff), 0, 0.25, 0, 24);
    cyl(g, 0.3, 0.3, 4.4, M(0xffd23f, { metalness: 0.5 }), 0, 2.4);
    const top = cone(g, 4.6, 1.8, M(0xff5d8f), 0, 5.4, 0, 16);
    for (let i = 0; i < 16; i++) box(g, 0.2, 0.4, 0.2, E(pick(rand, FLOWER), 1), Math.cos((i / 16) * Math.PI * 2) * 4.4, 4.5, Math.sin((i / 16) * Math.PI * 2) * 4.4);
    const ride = G();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      cyl(ride, 0.05, 0.05, 3.4, M(0xffd23f, { metalness: 0.5 }), Math.cos(a) * 3, 2.3, Math.sin(a) * 3, 6);
      const h = box(ride, 0.5, 0.7, 1.3, M(FLOWER[i % FLOWER.length]), Math.cos(a) * 3, 1.6, Math.sin(a) * 3);
      h.rotation.y = -a;
    }
    g.add(ride);
    g.userData.tick = (now) => { ride.rotation.y = now * 0.6; top.rotation.y = now * 0.6; };
    return g;
  },
  hotAirBalloon(rand, o = {}) {
    const g = G();
    const c1 = o.color ?? pick(rand, [0xff5d5d, 0x3fa7ff, 0xffd23f, 0xb46bff, 0x3fcf7a]);
    const env = G();
    for (let i = 0; i < 8; i++) {
      const s = put(env, new THREE.SphereGeometry(3, 16, 14, (i / 8) * Math.PI * 2, Math.PI / 4), M(i % 2 ? 0xffffff : c1, { side: THREE.DoubleSide }), 0, 0, 0);
      s.scale.y = 1.2;
    }
    env.position.y = 6;
    g.add(env);
    cone(g, 1.2, 1.6, M(c1), 0, 2.9, 0, 12).rotation.x = Math.PI;
    box(g, 1.2, 1, 1.2, M(0x9a6a3a), 0, 0.5, 0);
    const y0 = rand() * 6;
    g.userData.tick = (now, obj) => { obj.position.y = obj.userData.baseY + Math.sin(now * 0.6 + y0) * 0.8; };
    return g;
  },
  grandstand(rand, o = {}) {
    const g = G();
    const c = o.color ?? 0x3f7fd9;
    for (let r = 0; r < 4; r++) {
      box(g, 12, 0.8, 1.4, M(0xd8dde6), 0, 0.4 + r * 0.8, -r * 1.4);
      for (let i = 0; i < 14; i++) {
        if ((i + r) % 5 === 0) continue;
        const col = pick(rand, [0xff5d5d, 0xffd23f, 0x3fa7ff, 0x3fcf7a, 0xffffff, 0xff8a3d]);
        box(g, 0.5, 0.7, 0.4, M(col), -5.6 + i * 0.85, 1.15 + r * 0.8, -r * 1.4);
        sph(g, 0.2, M(0xf2c29b), -5.6 + i * 0.85, 1.7 + r * 0.8, -r * 1.4, 8);
      }
    }
    box(g, 12.4, 0.3, 6.5, M(c), 0, 5.2, -2.4).rotation.x = 0.12;
    [-6, 6].forEach((x) => box(g, 0.3, 5.2, 0.3, M(0xffffff), x, 2.6, 0.4));
    return g;
  },
  flag(rand, o = {}) {
    const g = G();
    cyl(g, 0.05, 0.05, 3.2, M(0xdddddd, { metalness: 0.6 }), 0, 1.6, 0, 6);
    const f = put(g, new THREE.PlaneGeometry(1.2, 0.8), M(o.color ?? pick(rand, [0xff5d5d, 0x3fa7ff, 0xffd23f, 0x3fcf7a]), { side: THREE.DoubleSide, map: o.checker ? checkerTex() : null }), 0.6, 2.8, 0, 0, Math.PI / 2, 0);
    f.castShadow = false;
    return g;
  },
  tyres(rand) {
    const g = G();
    for (let i = 0; i < 3; i++) tor(g, 0.4, 0.18, M(i % 2 ? 0xffffff : 0xff3b3b), 0, 0.2 + i * 0.36, 0, Math.PI * 2, Math.PI / 2);
    return g;
  },

  // ─── Space ───
  crater(rand, o = {}) {
    const g = G();
    const r = put(g, new THREE.TorusGeometry(2, 0.6, 6, 20), M(o.color ?? 0xa3aab8, { flatShading: true }), 0, 0.05, 0, Math.PI / 2, 0, 0);
    r.scale.z = 0.5;
    put(g, new THREE.CircleGeometry(2, 20), M(0x7d8494), 0, 0.02, 0, -Math.PI / 2);
    return g;
  },
  moonRock(rand, o = {}) {
    return OUTDOOR.rock(rand, { color: o.color ?? 0xb3b8c4 });
  },
  dome(rand, o = {}) {
    const g = G();
    cyl(g, 4.2, 4.4, 0.6, M(0xdfe5ee), 0, 0.3, 0, 24);
    const d = put(g, new THREE.SphereGeometry(4, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2), M(o.color ?? 0x9fe3ff, { transparent: true, opacity: 0.55, roughness: 0.05, metalness: 0.2, emissive: 0x2a8fc9, emissiveIntensity: 0.25 }), 0, 0.6, 0);
    d.castShadow = false;
    for (let i = 0; i < 3; i++) ico(g, 0.8, M(0x46c05a, { flatShading: true }), -1.5 + i * 1.5, 1.4, 0, 0);
    box(g, 2, 2, 1.4, M(0xdfe5ee), 0, 1, 4.2);
    return g;
  },
  rocket(rand) {
    const g = G();
    cyl(g, 1, 1.1, 7, M(0xf4f6fa, { metalness: 0.2 }), 0, 4.5, 0, 16);
    cone(g, 1, 2.4, M(0xff4d4d), 0, 9.2, 0, 16);
    sph(g, 0.45, E(0x7fd4ff, 0.6), 0, 6.4, 0.85, 12);
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      box(g, 0.2, 2, 1.4, M(0xff4d4d), Math.cos(a) * 1.1, 1.8, Math.sin(a) * 1.1, -a);
    }
    cyl(g, 0.7, 0.9, 1, M(0x555b66, { metalness: 0.6 }), 0, 0.5, 0, 12);
    return g;
  },
  satellite(rand) {
    const g = G();
    cyl(g, 0.1, 0.14, 3, M(0xbfc6d1, { metalness: 0.6 }), 0, 1.5, 0, 8);
    const dish = put(g, new THREE.SphereGeometry(1.6, 18, 10, 0, Math.PI * 2, 0, Math.PI / 3), M(0xf4f6fa, { side: THREE.DoubleSide, metalness: 0.3 }), 0, 3.4, 0, -0.9, 0, 0);
    dish.castShadow = true;
    sph(g, 0.16, E(0xff4d4d, 1.2), 0, 3.4, 1.3, 8);
    return g;
  },
  planetFlag(rand, o = {}) {
    return OUTDOOR.flag(rand, { color: o.color ?? 0x3fa7ff });
  },
};

let _checker = null;
function checkerTex() {
  if (_checker) return _checker;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const x = c.getContext('2d');
  for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) { x.fillStyle = (r + k) % 2 ? '#111' : '#fff'; x.fillRect(k * 16, r * 16, 16, 16); }
  _checker = new THREE.CanvasTexture(c);
  _checker.colorSpace = THREE.SRGBColorSpace;
  return _checker;
}

export { FLOWER };
