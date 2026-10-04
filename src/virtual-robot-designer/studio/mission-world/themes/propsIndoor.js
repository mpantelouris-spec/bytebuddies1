/** Indoor mission props: classroom, museum, gym, stage, workshop, clinic, factory. Face +z, base y = 0. */
import * as THREE from 'three';
import { M, E, G, put, box, cyl, sph, cone, tor, ico, pick, labelTexture } from './propKit.js';
import { FLOWER } from './propsOutdoor.js';

const BRIGHT = [0xff5d5d, 0xffd23f, 0x3fa7ff, 0x3fcf7a, 0xb46bff, 0xff8a3d];

export const INDOOR = {
  desk(rand, o = {}) {
    const g = G();
    const top = M(o.color ?? 0xd9a86c);
    box(g, 2.4, 0.12, 1.4, top, 0, 1.5);
    [[-1.1, -0.6], [1.1, -0.6], [-1.1, 0.6], [1.1, 0.6]].forEach(([x, z]) => box(g, 0.1, 1.5, 0.1, M(0x5a6270, { metalness: 0.4 }), x, 0.75, z));
    box(g, 0.7, 0.14, 0.5, M(pick(rand, BRIGHT)), -0.5, 1.63, 0);
    box(g, 0.5, 0.36, 0.1, M(0x333a45), 0.6, 1.74, -0.2);
    const chair = G();
    box(chair, 0.9, 0.1, 0.9, M(o.chair ?? pick(rand, BRIGHT)), 0, 0.9, 0);
    box(chair, 0.9, 0.9, 0.1, M(o.chair ?? pick(rand, BRIGHT)), 0, 1.4, 0.45);
    [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]].forEach(([x, z]) => box(chair, 0.07, 0.9, 0.07, M(0x5a6270), x, 0.45, z));
    chair.position.z = 1.3;
    g.add(chair);
    return g;
  },
  bookshelf(rand, o = {}) {
    const g = G();
    const wood = M(o.color ?? 0xa86b3c);
    box(g, 3, 4, 0.2, wood, 0, 2, -0.5);
    [-1.45, 1.45].forEach((x) => box(g, 0.1, 4, 1, wood, x, 2, 0));
    for (let s = 0; s < 4; s++) {
      box(g, 3, 0.1, 1, wood, 0, 0.1 + s * 1.2, 0);
      let x = -1.3;
      while (x < 1.2) {
        const w = 0.14 + rand() * 0.12;
        const h = 0.6 + rand() * 0.35;
        box(g, w, h, 0.7, M(pick(rand, BRIGHT)), x + w / 2, 0.15 + s * 1.2 + h / 2, 0.05);
        x += w + 0.02;
      }
    }
    return g;
  },
  chalkboard(rand, o = {}) {
    const g = G();
    box(g, 6.4, 3.6, 0.2, M(0xa86b3c), 0, 3.4);
    const b = put(g, new THREE.PlaneGeometry(6, 3.2), M(0xffffff, { map: labelTexture(o.text ?? 'A B C  1 2 3', '#2f5d46', '#f4f4ee', 512, 280, 'bold 70px "Comic Sans MS", system-ui') }), 0, 3.4, 0.11);
    b.castShadow = false;
    [-2.9, 2.9].forEach((x) => box(g, 0.14, 1.6, 0.14, M(0x6b4a2a), x, 0.8, 0));
    return g;
  },
  globe(rand) {
    const g = G();
    cyl(g, 0.4, 0.5, 0.2, M(0x8a5a32), 0, 0.1);
    cyl(g, 0.05, 0.05, 0.9, M(0xc9a24a, { metalness: 0.6 }), 0, 0.6, 0, 6);
    sph(g, 0.6, M(0x3fa7ff, { roughness: 0.3 }), 0, 1.4, 0, 18);
    ico(g, 0.35, M(0x3fcf7a, { flatShading: true }), 0.3, 1.55, 0.3, 0);
    tor(g, 0.68, 0.03, M(0xc9a24a, { metalness: 0.6 }), 0, 1.4, 0, Math.PI, 0, Math.PI / 2);
    return g;
  },
  pencil(rand, o = {}) {
    const g = G();
    const c = o.color ?? pick(rand, [0xffc21e, 0xff5d5d, 0x3fa7ff, 0x3fcf7a]);
    cyl(g, 0.35, 0.35, 5, M(c, { flatShading: true }), 0, 3.1, 0, 6);
    cone(g, 0.35, 0.9, M(0xf2c894), 0, 0.45, 0, 6).rotation.x = Math.PI;
    cyl(g, 0.36, 0.36, 0.4, M(0xc0c6cf, { metalness: 0.6 }), 0, 5.8, 0, 12);
    cyl(g, 0.34, 0.34, 0.5, M(0xff9fb5), 0, 6.25, 0, 12);
    return g;
  },
  books(rand) {
    const g = G();
    for (let i = 0; i < 4; i++) {
      const b = box(g, 1.3 - i * 0.1, 0.3, 0.9, M(pick(rand, BRIGHT)), 0, 0.15 + i * 0.3, 0);
      b.rotation.y = (rand() - 0.5) * 0.5;
    }
    return g;
  },
  toyBlocks(rand) {
    const g = G();
    const letters = ['A', 'B', 'C', '1', '2', '3'];
    for (let i = 0; i < 6; i++) {
      const c = BRIGHT[i % BRIGHT.length];
      const face = labelTexture(letters[i], `#${new THREE.Color(c).getHexString()}`, '#ffffff', 128, 128, 'bold 90px system-ui');
      const b = box(g, 0.8, 0.8, 0.8, M(0xffffff, { map: face }), (i % 3) * 0.85 - 0.85, 0.4 + Math.floor(i / 3) * 0.8, 0);
      b.rotation.y = (rand() - 0.5) * 0.4;
    }
    return g;
  },
  rug(rand, o = {}) {
    const g = G();
    const r = put(g, new THREE.CircleGeometry(o.r ?? 3, 40), M(o.color ?? 0xff9fc9), 0, 0.02, 0, -Math.PI / 2);
    r.castShadow = false;
    const r2 = put(g, new THREE.RingGeometry((o.r ?? 3) * 0.6, (o.r ?? 3) * 0.75, 40), M(o.ring ?? 0xffe36b), 0, 0.03, 0, -Math.PI / 2);
    r2.castShadow = false;
    return g;
  },
  easel(rand, o = {}) {
    const g = G();
    const wood = M(0xa86b3c);
    put(g, new THREE.BoxGeometry(0.1, 3, 0.1), wood, -0.6, 1.5, 0, 0, 0, 0.15);
    put(g, new THREE.BoxGeometry(0.1, 3, 0.1), wood, 0.6, 1.5, 0, 0, 0, -0.15);
    put(g, new THREE.BoxGeometry(0.1, 3, 0.1), wood, 0, 1.4, -0.6, -0.3, 0, 0);
    const art = put(g, new THREE.PlaneGeometry(1.6, 1.3), M(0xffffff, { map: labelTexture(o.text ?? '★', '#fffbe8', '#ff5d8f', 256, 200, 'bold 150px system-ui') }), 0, 2, 0.1, -0.1, 0, 0);
    art.castShadow = false;
    return g;
  },
  paintPots(rand) {
    const g = G();
    BRIGHT.slice(0, 5).forEach((c, i) => {
      const x = (i - 2) * 0.75;
      cyl(g, 0.3, 0.28, 0.5, M(0xe8ecf2, { metalness: 0.4 }), x, 0.25, 0, 14);
      cyl(g, 0.28, 0.28, 0.04, E(c, 0.25), x, 0.5, 0, 14);
    });
    return g;
  },

  // ─── Museum ───
  pillar(rand, o = {}) {
    const g = G();
    const m = M(o.color ?? 0xf1ece0);
    box(g, 1.6, 0.5, 1.6, m, 0, 0.25);
    cyl(g, 0.55, 0.62, 7, m, 0, 4, 0, 16);
    box(g, 1.6, 0.5, 1.6, m, 0, 7.75);
    return g;
  },
  dinoSkeleton(rand) {
    const g = G();
    const bone = M(0xf3ead3, { roughness: 0.7 });
    box(g, 6, 0.4, 3, M(0x6b5a4a), 0, 0.2);
    for (let i = 0; i < 12; i++) {
      const x = -4 + i * 0.75;
      const y = 3.2 + Math.sin((i / 11) * Math.PI) * 1.4 - (i > 8 ? (i - 8) * 0.5 : 0);
      sph(g, 0.22, bone, x, y, 0, 8);
      if (i > 2 && i < 9) tor(g, 0.7, 0.07, bone, x, y - 0.6, 0, Math.PI, Math.PI / 2, 0).rotation.set(0, Math.PI / 2, Math.PI);
    }
    const head = G();
    head.position.set(4.6, 4.6, 0);
    box(head, 1.5, 0.8, 0.8, bone, 0.4, 0, 0);
    box(head, 1.2, 0.3, 0.7, bone, 0.5, -0.5, 0);
    sph(head, 0.12, M(0x222222), 0.6, 0.2, 0.42, 6);
    g.add(head);
    cyl(g, 0.12, 0.12, 4.4, bone, 3.9, 3.3, 0, 6).rotation.z = 0.6;
    [[-1.6, 1], [1.4, 1]].forEach(([x]) => [-0.6, 0.6].forEach((z) => cyl(g, 0.15, 0.12, 3, bone, x, 1.9, z, 6)));
    return g;
  },
  displayCase(rand) {
    const g = G();
    box(g, 1.4, 1.2, 1.4, M(0x3b3f4a), 0, 0.6);
    const glass = box(g, 1.3, 1.1, 1.3, M(0xcfeeff, { transparent: true, opacity: 0.3, roughness: 0.05 }), 0, 1.75);
    glass.castShadow = false;
    ico(g, 0.3, E(pick(rand, [0xffd23f, 0x3fa7ff, 0xff5d8f]), 0.6), 0, 1.6, 0, 0);
    return g;
  },
  ropeBarrier(rand) {
    const g = G();
    const brass = M(0xd4a73a, { metalness: 0.7, roughness: 0.3 });
    [-1.4, 1.4].forEach((x) => { cyl(g, 0.08, 0.1, 1.1, brass, x, 0.55, 0, 8); sph(g, 0.12, brass, x, 1.15, 0, 8); });
    const r = tor(g, 1.4, 0.05, M(0xc0263a), 0, 1.05, 0, Math.PI, 0, 0);
    r.rotation.z = Math.PI;
    return g;
  },
  painting(rand, o = {}) {
    const g = G();
    box(g, 3.2, 2.4, 0.15, M(0xd4a73a, { metalness: 0.6 }), 0, 4);
    const c = pick(rand, BRIGHT);
    const p = put(g, new THREE.PlaneGeometry(2.8, 2), M(0xffffff, { map: labelTexture(o.text ?? pick(rand, ['☀', '★', '♥', '✿']), '#fff6e0', `#${new THREE.Color(c).getHexString()}`, 256, 190, 'bold 140px system-ui') }), 0, 4, 0.09);
    p.castShadow = false;
    return g;
  },

  // ─── Gym, stage, sport ───
  balanceBeam(rand, o = {}) {
    const g = G();
    box(g, 0.5, 0.25, 7, M(o.color ?? 0xf2d7a8), 0, 1.2);
    [-3, 3].forEach((z) => { box(g, 0.2, 1.1, 0.2, M(0x5a6270), 0, 0.55, z); box(g, 1.2, 0.1, 0.6, M(0x5a6270), 0, 0.05, z); });
    return g;
  },
  gymMat(rand, o = {}) {
    const g = G();
    box(g, 3, 0.3, 2, M(o.color ?? pick(rand, [0x3fa7ff, 0xff5d5d, 0x3fcf7a])), 0, 0.15);
    return g;
  },
  hurdle(rand) {
    const g = G();
    [-1, 1].forEach((x) => box(g, 0.08, 0.9, 0.08, M(0xffffff), x, 0.45, 0));
    box(g, 2.1, 0.2, 0.06, M(0xff5d5d), 0, 0.85, 0);
    return g;
  },
  trophy(rand, o = {}) {
    const g = G();
    const gold = M(0xffc83a, { metalness: 0.8, roughness: 0.25, emissive: 0x7a4a00, emissiveIntensity: 0.25 });
    box(g, 1.4, 0.6, 1.4, M(0x3b3f4a), 0, 0.3);
    cyl(g, 0.15, 0.3, 1, gold, 0, 1.1, 0, 12);
    const cup = put(g, new THREE.CylinderGeometry(0.9, 0.35, 1.3, 18, 1, true), gold, 0, 2.2, 0);
    cup.material.side = THREE.DoubleSide;
    [-1, 1].forEach((s) => tor(g, 0.35, 0.08, gold, s * 0.9, 2.3, 0, Math.PI * 2, 0, 0));
    sph(g, 0.25, E(0xfff3a8, 0.8), 0, 3.1, 0, 10);
    return g;
  },
  podium(rand) {
    const g = G();
    [[0, 1.6, 0xffc83a, '1'], [-2.2, 1.1, 0xcfd6e0, '2'], [2.2, 0.8, 0xd9894a, '3']].forEach(([x, h, c, n]) => {
      box(g, 2.2, h, 2, M(c, { metalness: 0.4 }), x, h / 2);
      const s = put(g, new THREE.PlaneGeometry(1, 1), M(0xffffff, { map: labelTexture(n, 'rgba(0,0,0,0)', '#ffffff', 128, 128, 'bold 110px system-ui'), transparent: true }), x, h / 2, 1.01);
      s.castShadow = false;
    });
    return g;
  },
  goal(rand) {
    const g = G();
    const w = M(0xffffff);
    [-3, 3].forEach((x) => cyl(g, 0.1, 0.1, 2.4, w, x, 1.2, 0, 8));
    cyl(g, 0.1, 0.1, 6.2, w, 0, 2.4, 0, 8).rotation.z = Math.PI / 2;
    const net = put(g, new THREE.PlaneGeometry(6, 2.4, 12, 6), M(0xffffff, { wireframe: true, transparent: true, opacity: 0.6 }), 0, 1.2, -1.2, -0.4, 0, 0);
    net.castShadow = false;
    return g;
  },
  stage(rand, o = {}) {
    const g = G();
    const c = o.color ?? 0x8b3fd9;
    box(g, 12, 1.2, 7, M(0x2b2140), 0, 0.6);
    box(g, 12.4, 0.2, 7.4, E(o.trim ?? 0xff5dd0, 0.8), 0, 1.25);
    box(g, 12, 8, 0.4, M(c), 0, 5.2, -3.4);
    for (let i = 0; i < 6; i++) {
      const x = -5.4 + i * 2.16;
      const curtain = box(g, 2.2, 7.6, 0.3, M(0xd8264a, { roughness: 0.8 }), i < 3 ? -5.5 + i * 0.6 : 5.5 - (5 - i) * 0.6, 5, -3.0);
      curtain.scale.x = 0.6;
      void x;
    }
    box(g, 13, 0.8, 1, M(0x222222), 0, 9.4, -3);
    for (let i = 0; i < 7; i++) sph(g, 0.28, E(BRIGHT[i % BRIGHT.length], 1.3), -5.4 + i * 1.8, 9, -2.4, 10);
    const sign = put(g, new THREE.PlaneGeometry(6, 1.3), M(0xffffff, { map: labelTexture(o.text ?? 'SHOWTIME', '#1c1030', '#ffe14d', 640, 140, 'bold 92px system-ui'), emissive: 0xffffff, emissiveIntensity: 0.25 }), 0, 7.6, -3.15);
    sign.castShadow = false;
    return g;
  },
  spotlight(rand, o = {}) {
    const g = G();
    cyl(g, 0.12, 0.2, 5, M(0x333844, { metalness: 0.5 }), 0, 2.5, 0, 8);
    const head = G();
    head.position.set(0, 5.1, 0);
    cyl(head, 0.35, 0.5, 0.9, M(0x222631, { metalness: 0.5 }), 0, 0, 0, 12).rotation.x = Math.PI / 2 - 0.6;
    const beam = put(head, new THREE.ConeGeometry(2.2, 9, 20, 1, true), M(o.color ?? 0xfff3b0, { transparent: true, opacity: 0.16, emissive: o.color ?? 0xfff3b0, emissiveIntensity: 1, depthWrite: false, side: THREE.DoubleSide }), 0, -3.6, 3.1);
    beam.rotation.x = -0.6;
    beam.castShadow = false;
    g.add(head);
    const ph = rand() * 6;
    g.userData.tick = (now) => { head.rotation.y = Math.sin(now * 0.7 + ph) * 0.6; };
    return g;
  },
  mirror(rand) {
    const g = G();
    box(g, 2.4, 4, 0.2, M(0xffc83a, { metalness: 0.7, roughness: 0.3 }), 0, 2.2);
    const glass = put(g, new THREE.PlaneGeometry(2, 3.6), M(0xdff4ff, { metalness: 1, roughness: 0.05, envMapIntensity: 1.2 }), 0, 2.2, 0.11);
    glass.castShadow = false;
    return g;
  },
  fan(rand) {
    const g = G();
    cyl(g, 0.5, 0.7, 0.2, M(0x3b4252), 0, 0.1);
    cyl(g, 0.08, 0.08, 2.2, M(0x9aa3ad, { metalness: 0.6 }), 0, 1.2, 0, 8);
    const cage = tor(g, 1.1, 0.05, M(0xdfe5ee, { metalness: 0.5 }), 0, 2.6, 0.15);
    void cage;
    const blades = G();
    blades.position.set(0, 2.6, 0.2);
    for (let i = 0; i < 3; i++) {
      const b = box(blades, 0.4, 1, 0.04, M(0x3fa7ff), 0, 0.5, 0);
      const arm = G();
      arm.rotation.z = (i / 3) * Math.PI * 2;
      arm.add(b);
      blades.add(arm);
    }
    g.add(blades);
    g.userData.tick = (now) => { blades.rotation.z = now * 9; };
    return g;
  },
  teddy(rand, o = {}) {
    const g = G();
    const fur = M(o.color ?? 0xc98a52, { roughness: 0.9 });
    const b = sph(g, 0.6, fur, 0, 0.6, 0, 14);
    b.scale.y = 1.1;
    sph(g, 0.45, fur, 0, 1.5, 0, 14);
    [-0.32, 0.32].forEach((x) => { sph(g, 0.16, fur, x, 1.9, 0, 10); sph(g, 0.2, fur, x * 1.6, 0.8, 0.2, 10); sph(g, 0.22, fur, x, 0.15, 0.3, 10); });
    sph(g, 0.18, M(0xf2d7b3), 0, 1.4, 0.36, 10);
    sph(g, 0.06, M(0x222222), 0, 1.47, 0.52, 6);
    [-0.15, 0.15].forEach((x) => sph(g, 0.05, M(0x222222), x, 1.62, 0.38, 6));
    box(g, 0.5, 0.12, 0.1, M(o.bow ?? 0xff5d8f), 0, 1.1, 0.45);
    return g;
  },
  steppingStone(rand) {
    const g = G();
    const s = cyl(g, 0.9, 1, 0.35, M(0x9aa0a8, { flatShading: true }), 0, 0.17, 0, 8);
    s.scale.z = 0.8;
    return g;
  },

  // ─── Workshop, lab, factory ───
  workbench(rand, o = {}) {
    const g = G();
    box(g, 3.4, 0.2, 1.6, M(o.color ?? 0xc98a4a), 0, 1.5);
    [[-1.5, -0.7], [1.5, -0.7], [-1.5, 0.7], [1.5, 0.7]].forEach(([x, z]) => box(g, 0.14, 1.5, 0.14, M(0x5a6270, { metalness: 0.4 }), x, 0.75, z));
    box(g, 3.2, 0.1, 1.4, M(0x8a5a32), 0, 0.4);
    for (let i = 0; i < 4; i++) box(g, 0.4, 0.4, 0.4, M(pick(rand, BRIGHT)), -1.2 + i * 0.8, 1.8, (rand() - 0.5) * 0.8);
    const lamp = G();
    cyl(lamp, 0.03, 0.03, 1.2, M(0x333844), 0, 0.6, 0, 6);
    cone(lamp, 0.3, 0.4, M(0xffd23f), 0, 1.25, 0.1, 12).rotation.x = 0.6;
    lamp.position.set(1.3, 1.6, -0.5);
    g.add(lamp);
    return g;
  },
  conveyor(rand, o = {}) {
    const g = G();
    const beltTex = new THREE.CanvasTexture((() => {
      const c = document.createElement('canvas');
      c.width = 64;
      c.height = 64;
      const x = c.getContext('2d');
      x.fillStyle = '#2a2e38';
      x.fillRect(0, 0, 64, 64);
      x.fillStyle = '#ffcc00';
      x.fillRect(0, 0, 64, 8);
      return c;
    })());
    beltTex.wrapS = beltTex.wrapT = THREE.RepeatWrapping;
    beltTex.repeat.set(1, 6);
    box(g, 1.8, 0.2, 8, M(0xffffff, { map: beltTex }), 0, 1.1);
    [-0.95, 0.95].forEach((x) => box(g, 0.12, 0.35, 8.2, M(o.color ?? 0x3fa7ff, { metalness: 0.4 }), x, 1.15));
    for (let z = -3.5; z <= 3.5; z += 1.75) [-0.8, 0.8].forEach((x) => box(g, 0.12, 1, 0.12, M(0x5a6270), x, 0.5, z));
    for (let i = 0; i < 4; i++) box(g, 0.6, 0.6, 0.6, M(pick(rand, BRIGHT)), 0, 1.5, -3 + i * 2);
    g.userData.tick = (now) => { beltTex.offset.y = -now * 0.4; };
    return g;
  },
  gear(rand, o = {}) {
    const g = G();
    const m = M(o.color ?? pick(rand, [0xffc83a, 0xc0c6cf, 0x3fa7ff]), { metalness: 0.7, roughness: 0.3 });
    const wheel = G();
    cyl(wheel, 1.4, 1.4, 0.4, m, 0, 0, 0, 24).rotation.x = Math.PI / 2;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      box(wheel, 0.5, 0.5, 0.4, m, Math.cos(a) * 1.55, Math.sin(a) * 1.55, 0).rotation.z = a;
    }
    cyl(wheel, 0.4, 0.4, 0.5, M(0x333844), 0, 0, 0, 12).rotation.x = Math.PI / 2;
    wheel.position.y = 2.2;
    g.add(wheel);
    cyl(g, 0.15, 0.2, 2.2, M(0x5a6270), 0, 1.1, -0.3, 8);
    const dir = rand() < 0.5 ? 1 : -1;
    g.userData.tick = (now) => { wheel.rotation.z = now * 0.8 * dir; };
    return g;
  },
  shelves(rand, o = {}) {
    const g = G();
    const frame = M(o.color ?? 0x3f7fd9, { metalness: 0.4 });
    [[-1.4, -0.5], [1.4, -0.5], [-1.4, 0.5], [1.4, 0.5]].forEach(([x, z]) => box(g, 0.1, 4, 0.1, frame, x, 2, z));
    for (let s = 0; s < 4; s++) {
      box(g, 2.9, 0.08, 1.1, M(0xd8dde6), 0, 0.2 + s * 1.2, 0);
      for (let i = 0; i < 3; i++) box(g, 0.7, 0.6, 0.7, M(o.boxes ?? pick(rand, [0xc98a4a, ...BRIGHT])), -0.9 + i * 0.9, 0.55 + s * 1.2, 0);
    }
    return g;
  },
  colorTrays(rand) {
    const g = G();
    [0xff5d5d, 0x3fa7ff, 0x3fcf7a, 0xffd23f].forEach((c, i) => {
      box(g, 1.2, 0.3, 1.2, M(c), (i - 1.5) * 1.4, 0.15);
      box(g, 0.5, 0.5, 0.5, M(c, { roughness: 0.3 }), (i - 1.5) * 1.4, 0.55, 0).rotation.y = 0.4;
    });
    return g;
  },
  pipes(rand, o = {}) {
    const g = G();
    const m = M(o.color ?? 0x9aa3ad, { metalness: 0.7, roughness: 0.3 });
    cyl(g, 0.35, 0.35, 6, m, -1, 3, 0, 12);
    cyl(g, 0.35, 0.35, 6, m, 1, 3, 0, 12);
    cyl(g, 0.3, 0.3, 2.4, m, 0, 5.4, 0, 12).rotation.z = Math.PI / 2;
    [1, 3, 5].forEach((y) => [-1, 1].forEach((x) => cyl(g, 0.42, 0.42, 0.15, M(0xffc83a, { metalness: 0.6 }), x, y, 0, 12)));
    return g;
  },
  robotArmProp(rand, o = {}) {
    const g = G();
    const c = M(o.color ?? 0xff8a3d, { metalness: 0.3 });
    cyl(g, 0.8, 1, 0.5, M(0x333844), 0, 0.25);
    cyl(g, 0.4, 0.4, 2, c, 0, 1.5, 0, 12);
    box(g, 0.5, 2.4, 0.5, c, 0.6, 3.1, 0).rotation.z = -0.6;
    box(g, 0.4, 1.8, 0.4, c, 1.9, 3.8, 0).rotation.z = 0.9;
    sph(g, 0.4, M(0x333844), 0, 2.5, 0, 10);
    return g;
  },
  cupcake(rand, o = {}) {
    const g = G();
    cyl(g, 0.5, 0.38, 0.6, M(o.cup ?? pick(rand, [0xff9fc9, 0x9fd8ff, 0xfff09f])), 0, 0.3, 0, 14);
    const icing = M(o.icing ?? pick(rand, [0xffffff, 0xffc2dc, 0xc9a6ff]));
    sph(g, 0.52, icing, 0, 0.72, 0, 14).scale.y = 0.6;
    cone(g, 0.3, 0.5, icing, 0, 1.1, 0, 14);
    sph(g, 0.12, M(0xff3b5c, { roughness: 0.2 }), 0, 1.42, 0, 10);
    return g;
  },
  cake(rand) {
    const g = G();
    [[3, 1.6, 0xffc2dc], [2.2, 1.4, 0xfff4e0], [1.4, 1.2, 0xc9a6ff]].reduce((y, [r, h, c]) => {
      cyl(g, r, r, h, M(c), 0, y + h / 2, 0, 32);
      for (let i = 0; i < 16; i++) sph(g, 0.16, M(pick(rand, FLOWER)), Math.cos((i / 16) * Math.PI * 2) * r, y + h, Math.sin((i / 16) * Math.PI * 2) * r, 8);
      return y + h;
    }, 0);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      cyl(g, 0.07, 0.07, 0.8, M(pick(rand, FLOWER)), Math.cos(a) * 0.8, 4.6, Math.sin(a) * 0.8, 6);
      sph(g, 0.1, E(0xffb020, 1.5), Math.cos(a) * 0.8, 5.1, Math.sin(a) * 0.8, 6);
    }
    return g;
  },
  bells(rand) {
    const g = G();
    box(g, 6, 0.2, 0.2, M(0xa86b3c), 0, 3);
    [-3, 3].forEach((x) => box(g, 0.2, 3, 0.2, M(0xa86b3c), x, 1.5));
    for (let i = 0; i < 5; i++) {
      const b = put(g, new THREE.SphereGeometry(0.45 - i * 0.03, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.6), M(BRIGHT[i], { metalness: 0.6, roughness: 0.3, side: THREE.DoubleSide }), -2.2 + i * 1.1, 2.6, 0);
      b.userData.bell = i;
    }
    g.userData.tick = (now) => g.children.forEach((c) => { if (c.userData.bell != null) c.rotation.z = Math.sin(now * 3 + c.userData.bell) * 0.25; });
    return g;
  },
  marbles(rand) {
    const g = G();
    for (let i = 0; i < 8; i++) sph(g, 0.3, M(pick(rand, BRIGHT), { roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.85 }), (rand() - 0.5) * 2, 0.3, (rand() - 0.5) * 2, 14);
    return g;
  },
  toyCar(rand, o = {}) {
    const g = G();
    const c = M(o.color ?? pick(rand, BRIGHT), { roughness: 0.3 });
    box(g, 1.2, 0.5, 2.2, c, 0, 0.55);
    box(g, 1, 0.45, 1.1, c, 0, 1, -0.1);
    box(g, 0.9, 0.35, 1.0, M(0xbfe8ff, { roughness: 0.1 }), 0, 1.02, -0.1).scale.set(1.02, 0.9, 1.02);
    [[-0.6, 0.7], [0.6, 0.7], [-0.6, -0.7], [0.6, -0.7]].forEach(([x, z]) => cyl(g, 0.28, 0.28, 0.2, M(0x222222), x, 0.3, z, 12).rotation.z = Math.PI / 2);
    return g;
  },
  seedTray(rand) {
    const g = G();
    box(g, 3, 0.3, 2, M(0x8a5a32), 0, 0.15);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
      box(g, 0.6, 0.1, 0.5, M(0x5a3b22), -1.05 + c * 0.7, 0.32, -0.6 + r * 0.6);
      if ((r + c) % 2 === 0) cone(g, 0.12, 0.35, M(0x46c05a), -1.05 + c * 0.7, 0.55, -0.6 + r * 0.6, 6);
    }
    return g;
  },
  plantPot(rand, o = {}) {
    const g = G();
    cyl(g, 0.5, 0.36, 0.8, M(o.color ?? 0xd9754a), 0, 0.4, 0, 12);
    const leaf = M(0x3fae4f, { flatShading: true });
    ico(g, 0.6, leaf, 0, 1.2, 0, 1);
    ico(g, 0.4, leaf, 0.3, 1.6, 0.1, 1);
    return g;
  },

  // ─── Clinic & safety ───
  clinicBed(rand, o = {}) {
    const g = G();
    box(g, 1.6, 0.4, 3, M(0xffffff), 0, 1);
    box(g, 1.6, 0.25, 0.8, M(o.pillow ?? 0x9fdcff), 0, 1.3, -1);
    box(g, 1.62, 0.2, 1.8, M(o.blanket ?? 0x7fd4a8), 0, 1.25, 0.5);
    box(g, 1.6, 1.4, 0.1, M(0xdfe5ee, { metalness: 0.3 }), 0, 1.2, -1.5);
    [[-0.7, -1.3], [0.7, -1.3], [-0.7, 1.3], [0.7, 1.3]].forEach(([x, z]) => box(g, 0.08, 0.8, 0.08, M(0x9aa3ad, { metalness: 0.5 }), x, 0.4, z));
    const t = INDOOR.teddy(rand, { color: 0xd9a36a });
    t.scale.setScalar(0.5);
    t.position.set(0, 1.35, -0.6);
    g.add(t);
    return g;
  },
  firstAid(rand) {
    const g = G();
    box(g, 1, 0.7, 0.4, M(0xffffff), 0, 0.35);
    box(g, 0.5, 0.14, 0.02, M(0xe53935), 0, 0.38, 0.21);
    box(g, 0.14, 0.5, 0.02, M(0xe53935), 0, 0.38, 0.21);
    return g;
  },
  sink(rand) {
    const g = G();
    box(g, 2, 1.6, 1, M(0xffffff), 0, 0.8);
    box(g, 1.5, 0.2, 0.7, M(0x9fdcff, { roughness: 0.1 }), 0, 1.55, 0.05);
    cyl(g, 0.06, 0.06, 0.6, M(0xc0c6cf, { metalness: 0.8 }), 0, 1.9, -0.35, 8);
    box(g, 2, 1.6, 0.1, M(0xcfeeff), 0, 2.6, -0.5);
    sph(g, 0.14, M(0x7fd4a8), -0.7, 1.75, -0.3, 8);
    return g;
  },
  medShelf(rand) {
    const g = G();
    box(g, 3, 3.4, 0.9, M(0xf4f6fa), 0, 1.7);
    const cols = [0xff5d5d, 0x3fa7ff, 0x3fcf7a, 0xffd23f];
    for (let s = 0; s < 3; s++) for (let i = 0; i < 5; i++) {
      cyl(g, 0.17, 0.17, 0.5, M(cols[s % 4], { roughness: 0.3 }), -1.1 + i * 0.55, 0.65 + s * 1.05, 0.3, 10);
      cyl(g, 0.12, 0.12, 0.12, M(0xffffff), -1.1 + i * 0.55, 0.96 + s * 1.05, 0.3, 10);
    }
    return g;
  },
  alarmButton(rand, o = {}) {
    const g = G();
    cyl(g, 0.5, 0.6, 1.1, M(0x3b4252), 0, 0.55, 0, 16);
    cyl(g, 0.4, 0.4, 0.25, E(o.color ?? 0xff3b3b, 0.8), 0, 1.2, 0, 16);
    return g;
  },
  exitSign(rand, o = {}) {
    const g = G();
    cyl(g, 0.06, 0.06, 2.4, M(0x9aa3ad), 0, 1.2, 0, 6);
    const s = put(g, new THREE.PlaneGeometry(1.4, 0.6), M(0xffffff, { map: labelTexture(o.text ?? 'EXIT ➜', '#16a34a', '#ffffff', 256, 110, 'bold 64px system-ui'), emissive: 0x22c55e, emissiveIntensity: 0.4 }), 0, 2.3, 0.05);
    s.castShadow = false;
    return g;
  },
  ambulance(rand) {
    const g = G();
    box(g, 2.2, 1.9, 3.2, M(0xffffff), 0, 1.25, -0.4);
    box(g, 2.2, 1.3, 1.4, M(0xffffff), 0, 0.95, 1.8);
    box(g, 2, 0.6, 0.1, M(0xbfe8ff, { roughness: 0.1 }), 0, 1.35, 2.52);
    box(g, 2.24, 0.3, 4.6, M(0xe53935), 0, 1.0, 0.3);
    box(g, 0.8, 0.25, 0.4, E(0x3fa7ff, 1.4), 0, 2.3, 0.2);
    [[-1, 1.6], [1, 1.6], [-1, -1.3], [1, -1.3]].forEach(([x, z]) => cyl(g, 0.4, 0.4, 0.3, M(0x222222), x, 0.4, z, 14).rotation.z = Math.PI / 2);
    return g;
  },
  fireTruck(rand) {
    const g = G();
    box(g, 2.3, 1.6, 5.6, M(0xe53935, { roughness: 0.35 }), 0, 1.3, 0);
    box(g, 2.2, 1.2, 1.6, M(0xe53935, { roughness: 0.35 }), 0, 2.5, 1.9);
    box(g, 2, 0.6, 0.1, M(0xbfe8ff), 0, 2.6, 2.72);
    box(g, 0.5, 0.2, 5, M(0xdfe5ee, { metalness: 0.6 }), 0, 2.3, -0.6);
    box(g, 0.8, 0.25, 0.4, E(0x3fa7ff, 1.4), 0, 3.2, 1.8);
    [[-1.1, 2], [1.1, 2], [-1.1, -1.8], [1.1, -1.8]].forEach(([x, z]) => cyl(g, 0.5, 0.5, 0.35, M(0x222222), x, 0.5, z, 14).rotation.z = Math.PI / 2);
    return g;
  },
  building(rand, o = {}) {
    const g = G();
    const w = o.w ?? 10;
    const h = o.h ?? 7;
    const c = o.color ?? 0xf4f6fa;
    const t = labelTexture(o.text ?? 'CLINIC', o.signBg ?? '#e53935', '#ffffff', 512, 128, 'bold 80px system-ui');
    box(g, w, h, 6, M(c, { map: null }), 0, h / 2);
    for (let r = 0; r < Math.floor(h / 2.6); r++) for (let k = 0; k < Math.floor(w / 2.2); k++) box(g, 1.2, 1.1, 0.1, M(0x9fdcff, { roughness: 0.1, emissive: 0x3a88c0, emissiveIntensity: 0.15 }), -w / 2 + 1.4 + k * 2.2, 1.9 + r * 2.4, 3.02);
    box(g, 2, 2.4, 0.2, M(o.door ?? 0x3fa7ff), 0, 1.2, 3.05);
    const s = put(g, new THREE.PlaneGeometry(Math.min(6, w * 0.6), 1.4), M(0xffffff, { map: t }), 0, h + 0.9, 2.8);
    s.castShadow = false;
    box(g, w + 0.4, 0.4, 6.4, M(o.trim ?? 0xe53935), 0, h + 0.2);
    return g;
  },
};
