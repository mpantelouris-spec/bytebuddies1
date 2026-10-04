/** Small task objects that stand on mission checkpoints (things to pick, fix, deliver or put out). Face +z, base at y = 0. */
import * as THREE from 'three';
import { M, E, G, put, box, cyl, sph, cone, tor, pick } from './propKit.js';

const soil = (g, r = 0.7, color = 0x6a4a30) => cyl(g, r, r * 1.1, 0.16, M(color, { roughness: 0.95 }), 0, 0.08, 0, 14);

export const TASKS = {
  carrot(rand, o = {}) {
    const g = G();
    soil(g, 0.55);
    const root = put(g, new THREE.ConeGeometry(0.2, 0.9, 10), M(0xff7a1a), 0, 0.5, 0, Math.PI, 0, 0);
    root.position.y = 0.55;
    for (let i = 0; i < 4; i++) {
      put(g, new THREE.ConeGeometry(0.07, 0.6, 6), M(0x3fae3a), Math.cos(i * 1.6) * 0.07, 1.25, Math.sin(i * 1.6) * 0.07, Math.cos(i * 1.6) * 0.3, 0, Math.sin(i * 1.6) * 0.3);
    }
    return g;
  },
  eggNest(rand, o = {}) {
    const g = G();
    tor(g, 0.5, 0.2, M(0xb8894a, { roughness: 1 }), 0, 0.2, 0, Math.PI * 2, Math.PI / 2);
    cyl(g, 0.45, 0.35, 0.12, M(0x9a7040, { roughness: 1 }), 0, 0.08);
    [[0, 0], [0.22, 0.1], [-0.2, 0.12], [0.02, -0.22]].forEach(([x, z]) => {
      const e = sph(g, 0.17, M(o.color ?? pick(rand, [0xfff8ec, 0xf2dcc0, 0xdcefff])), x, 0.3, z);
      e.scale.y = 1.3;
    });
    return g;
  },
  appleBasket(rand, o = {}) {
    const g = G();
    cyl(g, 0.6, 0.45, 0.55, M(0xb8894a, { roughness: 0.95 }), 0, 0.28, 0, 16);
    tor(g, 0.6, 0.05, M(0x8a6030), 0, 0.55, 0, Math.PI * 2, Math.PI / 2);
    tor(g, 0.45, 0.04, M(0x8a6030), 0, 0.55, 0, Math.PI, 0, 0);
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      sph(g, 0.17, M(o.color ?? (i % 3 ? 0xe8322a : 0x8ad83a)), Math.cos(a) * 0.3, 0.62, Math.sin(a) * 0.3);
    }
    sph(g, 0.17, M(0xe8322a), 0, 0.74, 0);
    return g;
  },
  fire(rand, o = {}) {
    const g = G();
    for (let i = 0; i < 4; i++) put(g, new THREE.CylinderGeometry(0.1, 0.1, 1.1, 8), M(0x6a4428), 0, 0.12, 0, Math.PI / 2, i * 0.8, 0);
    const flames = G();
    [[0xff4a1a, 0.5, 1.3], [0xff9a1a, 0.36, 1], [0xffe45a, 0.2, 0.7]].forEach(([c, r, h]) => cone(flames, r, h, E(c, 1.4, { transparent: true, opacity: 0.92 }), 0, h / 2 + 0.15, 0, 8));
    g.add(flames);
    g.userData.flames = flames;
    const ph = rand() * 6;
    g.userData.tick = (now) => {
      const k = g.userData.out ?? 1;
      flames.scale.set(k * (1 + Math.sin(now * 9 + ph) * 0.08), k * (1 + Math.sin(now * 7 + ph) * 0.18), k * (1 + Math.cos(now * 8 + ph) * 0.08));
      flames.rotation.y = now * 1.5;
    };
    return g;
  },
  bone(rand, o = {}) {
    const g = G();
    const mound = sph(g, 0.8, M(0xb89868, { roughness: 1 }), 0, 0, 0);
    mound.scale.y = 0.35;
    const white = M(0xf4ecd8, { roughness: 0.8 });
    put(g, new THREE.CylinderGeometry(0.09, 0.09, 1, 8), white, 0, 0.32, 0, 0, 0.4, Math.PI / 2);
    [-0.5, 0.5].forEach((x) => {
      sph(g, 0.13, white, x * Math.cos(0.4), 0.32, -x * Math.sin(0.4) + 0.08);
      sph(g, 0.13, white, x * Math.cos(0.4), 0.32, -x * Math.sin(0.4) - 0.08);
    });
    return g;
  },
  parcel(rand, o = {}) {
    const g = G();
    const c = o.color ?? pick(rand, [0xc8935a, 0xd8a870, 0xb8834a]);
    box(g, 0.9, 0.7, 0.9, M(c, { roughness: 0.9 }), 0, 0.35);
    box(g, 0.92, 0.72, 0.14, M(o.tape ?? 0xe8d4a0), 0, 0.35);
    box(g, 0.5, 0.5, 0.5, M(c, { roughness: 0.9 }), 0.1, 0.95, 0.05, 0.4);
    box(g, 0.14, 0.52, 0.52, M(o.tape ?? 0xe8d4a0), 0.1, 0.95, 0.05, 0.4);
    return g;
  },
  mailbox(rand, o = {}) {
    const g = G();
    cyl(g, 0.06, 0.06, 1.1, M(0x5a4a3a), 0, 0.55, 0, 8);
    box(g, 0.45, 0.4, 0.7, M(o.color ?? 0xe8322a, { metalness: 0.3 }), 0, 1.25);
    put(g, new THREE.CylinderGeometry(0.225, 0.225, 0.7, 12, 1, false, 0, Math.PI), M(o.color ?? 0xe8322a, { metalness: 0.3 }), 0, 1.45, 0, Math.PI / 2, 0, Math.PI / 2);
    box(g, 0.05, 0.3, 0.08, M(0xffd23f), 0.25, 1.5, 0.2);
    box(g, 0.32, 0.22, 0.02, M(0xffffff), 0, 1.3, 0.36);
    return g;
  },
  litter(rand, o = {}) {
    const g = G();
    const glass = M(o.color ?? pick(rand, [0x3fae6a, 0x5ab8e8, 0xf0f0f0]), { transparent: true, opacity: 0.8, roughness: 0.2 });
    put(g, new THREE.CylinderGeometry(0.14, 0.14, 0.6, 10), glass, 0, 0.14, 0, 0, 0.5, Math.PI / 2);
    put(g, new THREE.CylinderGeometry(0.06, 0.1, 0.2, 10), glass, 0.38, 0.14, -0.2, 0, 0.5, Math.PI / 2);
    box(g, 0.35, 0.05, 0.3, M(0xd8d0c0), -0.4, 0.03, 0.3, 0.6);
    const can = cyl(g, 0.09, 0.09, 0.26, M(0xe84a3a, { metalness: 0.6 }), 0.2, 0.13, 0.35, 10);
    can.rotation.z = 0.2;
    return g;
  },
  vial(rand, o = {}) {
    const g = G();
    cyl(g, 0.35, 0.4, 0.2, M(0x9aa4b0, { metalness: 0.5 }), 0, 0.1, 0, 12);
    const c = o.color ?? pick(rand, [0x5ce1ff, 0x7fff6a, 0xff5dd0, 0xffd23f]);
    cyl(g, 0.13, 0.13, 0.8, M(0xe8f6ff, { transparent: true, opacity: 0.45, roughness: 0.1 }), 0, 0.6, 0, 12);
    cyl(g, 0.11, 0.11, 0.5, E(c, 0.8), 0, 0.46, 0, 12);
    cyl(g, 0.15, 0.15, 0.1, M(0x3a3a44), 0, 1.02, 0, 12);
    return g;
  },
  key(rand, o = {}) {
    const g = G();
    const gold = M(o.color ?? 0xffc83a, { metalness: 0.7, roughness: 0.25 });
    cyl(g, 0.3, 0.36, 0.14, M(0x6a3aa8), 0, 0.07, 0, 16);
    const k = G();
    tor(k, 0.2, 0.06, gold, 0, 0.3, 0);
    put(k, new THREE.BoxGeometry(0.08, 0.55, 0.08), gold, 0, -0.1, 0);
    put(k, new THREE.BoxGeometry(0.18, 0.06, 0.06), gold, 0.08, -0.3, 0);
    put(k, new THREE.BoxGeometry(0.14, 0.06, 0.06), gold, 0.06, -0.16, 0);
    k.position.y = 0.95;
    g.add(k);
    const ph = rand() * 6;
    g.userData.tick = (now) => { k.rotation.y = now * 1.6 + ph; k.position.y = 0.95 + Math.sin(now * 2 + ph) * 0.08; };
    return g;
  },
  suitcase(rand, o = {}) {
    const g = G();
    const c = o.color ?? pick(rand, [0x3a7ae8, 0xe84a8a, 0x2fa84f, 0xffa82a]);
    box(g, 0.9, 0.65, 0.35, M(c, { roughness: 0.5 }), 0, 0.4);
    tor(g, 0.14, 0.04, M(0x2a2a30), 0, 0.76, 0, Math.PI, 0, 0);
    [-0.34, 0.34].forEach((x) => cyl(g, 0.06, 0.06, 0.08, M(0x2a2a30), x, 0.04, 0, 8));
    box(g, 0.92, 0.06, 0.37, M(0xffffff, { roughness: 0.4 }), 0, 0.45);
    return g;
  },
  gnome(rand, o = {}) {
    const g = G();
    cyl(g, 0.25, 0.32, 0.55, M(o.color ?? pick(rand, [0x3a7ae8, 0x2fa84f])), 0, 0.28);
    sph(g, 0.2, M(0xf5c8a0), 0, 0.72, 0);
    cone(g, 0.22, 0.2, M(0xffffff), 0, 0.62, 0.08);
    cone(g, 0.22, 0.55, M(0xe8322a), 0, 1.1, 0);
    [-0.07, 0.07].forEach((x) => box(g, 0.07, 0.015, 0.02, M(0x2a2a30), x, 0.76, 0.19));
    return g;
  },
  bricks(rand, o = {}) {
    const g = G();
    box(g, 1.2, 0.14, 1, M(0x8a6a44), 0, 0.07);
    const red = M(o.color ?? 0xc8522a, { roughness: 0.9 });
    for (let y = 0; y < 3; y++) for (let i = 0; i < 3; i++) box(g, 0.34, 0.18, 0.8, red, (i - 1) * 0.36, 0.23 + y * 0.19, 0);
    return g;
  },
  acorn(rand, o = {}) {
    const g = G();
    const leaf = sph(g, 0.6, M(0xd87a2a, { roughness: 0.9 }), 0, 0, 0);
    leaf.scale.y = 0.12;
    [[0, 0], [0.25, 0.15], [-0.22, 0.1]].forEach(([x, z]) => {
      const nut = sph(g, 0.16, M(0xb8743a), x, 0.2, z);
      nut.scale.y = 1.25;
      const cap = sph(g, 0.17, M(0x6a4a2a, { roughness: 1 }), x, 0.34, z);
      cap.scale.y = 0.55;
    });
    return g;
  },
  lifebuoy(rand, o = {}) {
    const g = G();
    cyl(g, 0.06, 0.06, 1.6, M(0xffffff), 0, 0.8, 0, 8);
    tor(g, 0.38, 0.12, M(0xff5a3a), 0, 1.2, 0.12);
    tor(g, 0.38, 0.125, M(0xffffff), 0, 1.2, 0.12, Math.PI / 2);
    tor(g, 0.38, 0.125, M(0xffffff), 0, 1.2, 0.12, Math.PI / 2, 0, Math.PI);
    return g;
  },
  hotPipe(rand, o = {}) {
    const g = G();
    put(g, new THREE.CylinderGeometry(0.3, 0.3, 1.8, 14), M(0x8a9aa8, { metalness: 0.6, roughness: 0.35 }), 0, 0.4, 0, 0, 0, Math.PI / 2);
    [-0.7, 0.7].forEach((x) => box(g, 0.2, 0.4, 0.5, M(0x5a6470), x, 0.2));
    const glow = put(g, new THREE.CylinderGeometry(0.32, 0.32, 0.6, 14), E(0xff5a1a, 1.2), 0, 0.4, 0, 0, 0, Math.PI / 2);
    g.userData.flames = glow;
    g.userData.tick = (now) => { const k = g.userData.out ?? 1; glow.scale.set(k, 1, k); glow.visible = k > 0.05; };
    return g;
  },
  sprout(rand, o = {}) {
    const g = G();
    cyl(g, 0.4, 0.3, 0.45, M(o.pot ?? 0xc8643a), 0, 0.22, 0, 12);
    cyl(g, 0.38, 0.38, 0.04, M(0x5a3a22), 0, 0.44, 0, 12);
    const plant = G();
    cyl(plant, 0.04, 0.05, 0.6, M(0x3fae3a), 0, 0.3, 0, 6);
    [-1, 1].forEach((s) => { const l = sph(plant, 0.18, M(0x4fc84a), s * 0.18, 0.5, 0); l.scale.set(1, 0.35, 0.6); });
    sph(plant, 0.16, M(o.color ?? pick(rand, [0xff5d8a, 0xffd23f, 0xb46bff])), 0, 0.68, 0);
    plant.position.y = 0.45;
    g.add(plant);
    g.userData.grow = plant;
    return g;
  },
  scanPost(rand, o = {}) {
    const g = G();
    cyl(g, 0.08, 0.1, 1.1, M(0x5a6470, { metalness: 0.4 }), 0, 0.55, 0, 8);
    box(g, 0.5, 0.36, 0.14, M(0x2a3040), 0, 1.25);
    box(g, 0.4, 0.26, 0.02, E(o.color ?? 0x5ce1ff, 0.9), 0, 1.25, 0.08);
    return g;
  },

  // ─── Sport ───
  dumbbell(rand, o = {}) {
    const g = G();
    box(g, 1.3, 0.12, 0.7, M(0x3a3f4a), 0, 0.06);
    const c = o.color ?? pick(rand, [0xff5d5d, 0x3fa7ff, 0xffd23f, 0x3fcf7a]);
    [-0.16, 0.16].forEach((z) => {
      put(g, new THREE.CylinderGeometry(0.05, 0.05, 0.9, 8), M(0xc8ccd4, { metalness: 0.7, roughness: 0.3 }), 0, 0.28, z, 0, 0, Math.PI / 2);
      [-0.36, 0.36].forEach((x) => put(g, new THREE.CylinderGeometry(0.18, 0.18, 0.16, 14), M(c, { roughness: 0.5 }), x, 0.28, z, 0, 0, Math.PI / 2));
    });
    return g;
  },
  punchBag(rand, o = {}) {
    const g = G();
    const frame = M(0x5a6270, { metalness: 0.5 });
    cyl(g, 0.5, 0.6, 0.12, frame, -0.9, 0.06, 0, 12);
    cyl(g, 0.06, 0.06, 2.9, frame, -0.9, 1.45, 0, 8);
    box(g, 1.1, 0.08, 0.1, frame, -0.4, 2.86);
    const bag = G();
    bag.position.set(0, 2.8, 0);
    cyl(bag, 0.02, 0.02, 0.4, M(0x2a2a30), 0, -0.2, 0, 6);
    const c = o.color ?? pick(rand, [0xe8322a, 0x3a7ae8, 0x2a2a30]);
    cyl(bag, 0.34, 0.34, 1.3, M(c, { roughness: 0.6 }), 0, -1.05, 0, 16);
    sph(bag, 0.34, M(c, { roughness: 0.6 }), 0, -1.7, 0, 14);
    cyl(bag, 0.35, 0.35, 0.12, M(0xffffff), 0, -0.7, 0, 16);
    g.add(bag);
    const ph = rand() * 6;
    g.userData.tick = (now) => {
      const d = g.userData.doneK ?? 0;
      const kick = d > 0 && d < 1 ? Math.sin(d * Math.PI * 4) * (1 - d) * 0.5 : 0;
      bag.rotation.x = kick + Math.sin(now * 1.3 + ph) * 0.03;
    };
    return g;
  },
  baton(rand, o = {}) {
    const g = G();
    cyl(g, 0.34, 0.4, 0.5, M(0xffffff), 0, 0.25, 0, 14);
    cyl(g, 0.36, 0.36, 0.06, M(0xe8322a), 0, 0.5, 0, 14);
    const b = G();
    cyl(b, 0.08, 0.08, 0.8, M(o.color ?? pick(rand, [0xffd23f, 0x3fa7ff, 0xff5d5d]), { metalness: 0.4, roughness: 0.3 }), 0, 0, 0, 10);
    b.position.y = 0.9;
    b.rotation.z = 0.25;
    g.add(b);
    return g;
  },
  ball(rand, o = {}) {
    const g = G();
    tor(g, 0.28, 0.06, M(0xffffff), 0, 0.06, 0, Math.PI * 2, Math.PI / 2);
    const kind = o.kind ?? 'football';
    const col = kind === 'basket' ? 0xf07a1a : kind === 'beach' ? 0xffffff : 0xf8f8f8;
    const b = sph(g, 0.36, M(col, { roughness: 0.55 }), 0, 0.46, 0, 18);
    const seam = M(kind === 'basket' ? 0x2a1a10 : kind === 'beach' ? 0xff5d5d : 0x1e1e24);
    tor(b, 0.362, 0.018, seam, 0, 0, 0, Math.PI * 2, Math.PI / 2);
    tor(b, 0.362, 0.018, seam, 0, 0, 0, Math.PI * 2, 0, Math.PI / 2);
    if (kind === 'football') [[0, 0.36, 0], [0.3, 0.1, 0.18], [-0.3, 0.1, 0.18], [0, 0.1, -0.34]].forEach(([x, y, z]) => sph(b, 0.1, seam, x * 0.95, y * 0.95, z * 0.95, 8));
    return g;
  },
  hoop(rand, o = {}) {
    const g = G();
    cyl(g, 0.5, 0.6, 0.2, M(0x3a3f4a), 0, 0.1, 0, 12);
    cyl(g, 0.08, 0.08, 3.2, M(0xc8ccd4, { metalness: 0.6 }), 0, 1.6, 0, 8);
    box(g, 1.6, 1.1, 0.08, M(0xffffff), 0, 3.3, 0.3);
    box(g, 0.6, 0.45, 0.09, M(0xe8322a), 0, 3.15, 0.31);
    tor(g, 0.3, 0.035, M(0xff6a1a, { metalness: 0.4 }), 0, 2.9, 0.65, Math.PI * 2, Math.PI / 2);
    const net = put(g, new THREE.CylinderGeometry(0.3, 0.2, 0.45, 12, 1, true), M(0xffffff, { wireframe: true, transparent: true, opacity: 0.7 }), 0, 2.66, 0.65);
    net.castShadow = false;
    return g;
  },
  skippingRope(rand, o = {}) {
    const g = G();
    const mat = sph(g, 0.7, M(o.mat ?? 0x3fa7ff, { roughness: 0.8 }), 0, 0, 0);
    mat.scale.y = 0.08;
    tor(g, 0.4, 0.035, M(o.color ?? pick(rand, [0xff5dd0, 0xffd23f, 0x3fcf7a])), 0, 0.08, 0, Math.PI * 2, Math.PI / 2);
    [-0.42, 0.42].forEach((x) => put(g, new THREE.CylinderGeometry(0.06, 0.06, 0.34, 8), M(0xffffff), x, 0.12, 0.2, 0, 0, Math.PI / 2 + x));
    return g;
  },
  waterBottle(rand, o = {}) {
    const g = G();
    cyl(g, 0.45, 0.5, 0.35, M(0x5a6270, { metalness: 0.3 }), 0, 0.17, 0, 14);
    const c = o.color ?? pick(rand, [0x3fa7ff, 0x3fcf7a, 0xff8a3d]);
    cyl(g, 0.16, 0.16, 0.6, M(c, { transparent: true, opacity: 0.75, roughness: 0.15 }), 0, 0.65, 0, 14);
    cyl(g, 0.1, 0.16, 0.14, M(c, { transparent: true, opacity: 0.75, roughness: 0.15 }), 0, 1.02, 0, 14);
    cyl(g, 0.07, 0.07, 0.14, M(0xffffff), 0, 1.15, 0, 10);
    return g;
  },
  medal(rand, o = {}) {
    const g = G();
    cyl(g, 0.4, 0.5, 0.5, M(0x3b3f4a), 0, 0.25, 0, 14);
    const m = G();
    const c = o.color ?? pick(rand, [0xffc83a, 0xcfd6e0, 0xd9894a]);
    put(m, new THREE.CylinderGeometry(0.3, 0.3, 0.07, 20), M(c, { metalness: 0.85, roughness: 0.2, emissive: c, emissiveIntensity: 0.15 }), 0, 0, 0, Math.PI / 2, 0, 0);
    [-1, 1].forEach((s) => box(m, 0.12, 0.5, 0.03, M(s < 0 ? 0xe8322a : 0x3a7ae8), s * 0.1, 0.4, -0.02, 0));
    m.position.y = 1.05;
    g.add(m);
    const ph = rand() * 6;
    g.userData.tick = (now) => { m.rotation.y = now * 1.4 + ph; m.position.y = 1.05 + Math.sin(now * 2 + ph) * 0.06; };
    return g;
  },
};
