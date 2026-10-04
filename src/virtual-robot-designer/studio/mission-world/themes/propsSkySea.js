/** Sky, underwater and fantasy props. Face +z, base y = 0 (floating props are centred on y = 0). */
import * as THREE from 'three';
import { M, E, G, put, box, cyl, sph, cone, tor, ico, pick, labelTexture } from './propKit.js';
import { FLOWER } from './propsOutdoor.js';

const BRIGHT = [0xff5d5d, 0xffd23f, 0x3fa7ff, 0x3fcf7a, 0xb46bff, 0xff8a3d];
const CORAL = [0xff6f91, 0xff9a5c, 0xffd166, 0xb983ff, 0x5ce1e6, 0xff4f9a];

function bob(g, amp = 0.5, speed = 1, spin = 0) {
  const ph = Math.random() * 6;
  g.userData.tick = (now, obj) => {
    obj.position.y = obj.userData.baseY + Math.sin(now * speed + ph) * amp;
    if (spin) obj.rotation.y = obj.userData.baseRotY + now * spin;
  };
  return g;
}

export const SKYSEA = {
  cloud(rand, o = {}) {
    const g = G();
    const m = M(o.color ?? 0xffffff, { roughness: 1, emissive: o.color ?? 0xffffff, emissiveIntensity: o.glow ?? 0.35 });
    const n = 5 + Math.floor(rand() * 3);
    for (let i = 0; i < n; i++) {
      const r = 1.4 + rand() * 1.6;
      sph(g, r, m, (i - n / 2) * r * 0.9, rand() * r * 0.5, (rand() - 0.5) * r, 12).castShadow = false;
    }
    return g;
  },
  floatingIsland(rand, o = {}) {
    const g = G();
    const top = put(g, new THREE.CylinderGeometry(4, 4.2, 1, 9), M(o.grass ?? 0x5fcf5a, { flatShading: true }), 0, 0, 0);
    top.rotation.y = rand();
    const rock = put(g, new THREE.ConeGeometry(4.1, 6, 9), M(o.rock ?? 0x9a7a5a, { flatShading: true }), 0, -3.5, 0, Math.PI, 0, 0);
    rock.rotation.y = rand();
    const t = G();
    cyl(t, 0.18, 0.26, 1.6, M(0x8a5a32), 0, 0.8);
    ico(t, 1.2, M(o.tree ?? 0x3fae4f, { flatShading: true }), 0, 2.2, 0, 1);
    t.position.set(1.5, 0.5, -0.8);
    g.add(t);
    for (let i = 0; i < 4; i++) sph(g, 0.16, M(pick(rand, FLOWER)), Math.cos(i * 1.6) * 2.6, 0.6, Math.sin(i * 1.6) * 2.6, 8);
    return bob(g, 0.6, 0.5);
  },
  kite(rand, o = {}) {
    const g = G();
    const c = o.color ?? pick(rand, BRIGHT);
    const k = put(g, new THREE.ConeGeometry(1.2, 2.6, 4, 1), M(c, { side: THREE.DoubleSide, flatShading: true }), 0, 0, 0);
    k.scale.z = 0.08;
    for (let i = 0; i < 5; i++) box(g, 0.3, 0.2, 0.04, M(pick(rand, BRIGHT)), Math.sin(i) * 0.3, -1.6 - i * 0.5, 0);
    const ph = rand() * 6;
    g.userData.tick = (now, obj) => {
      obj.position.y = obj.userData.baseY + Math.sin(now + ph) * 0.7;
      obj.rotation.z = Math.sin(now * 1.3 + ph) * 0.3;
    };
    return g;
  },
  birds(rand) {
    const g = G();
    const m = M(0x2b2f3a, { side: THREE.DoubleSide });
    const flock = [];
    for (let i = 0; i < 6; i++) {
      const b = G();
      [-1, 1].forEach((s) => {
        const w = put(b, new THREE.PlaneGeometry(0.9, 0.3), m, s * 0.45, 0, 0);
        w.userData.side = s;
      });
      b.position.set((rand() - 0.5) * 6, (rand() - 0.5) * 2, (rand() - 0.5) * 6);
      g.add(b);
      flock.push(b);
    }
    const r = 14 + rand() * 10;
    const ph = rand() * 6;
    g.userData.tick = (now, obj) => {
      const a = now * 0.25 + ph;
      obj.position.x = obj.userData.baseX + Math.cos(a) * r;
      obj.position.z = obj.userData.baseZ + Math.sin(a) * r;
      obj.rotation.y = -a;
      flock.forEach((b, i) => b.children.forEach((w) => { w.rotation.x = Math.sin(now * 8 + i) * 0.6 * w.userData.side; }));
    };
    return g;
  },
  lantern(rand, o = {}) {
    const g = G();
    const c = o.color ?? pick(rand, [0xff5d3a, 0xffb020, 0xff3b6b]);
    const body = sph(g, 0.6, E(c, 0.9, { roughness: 0.8 }), 0, 0, 0, 14);
    body.scale.y = 1.25;
    cyl(g, 0.35, 0.35, 0.12, M(0x3b2a1a), 0, 0.78, 0, 10);
    cyl(g, 0.35, 0.35, 0.12, M(0x3b2a1a), 0, -0.78, 0, 10);
    return bob(g, 0.35, 0.9);
  },
  rainbow(rand, o = {}) {
    const g = G();
    const cols = [0xff4d4d, 0xff9a3c, 0xffe14d, 0x4fd66f, 0x3fb7ff, 0x5b6bff, 0xb35cff];
    const r = o.r ?? 18;
    cols.forEach((c, i) => {
      const b = put(g, new THREE.TorusGeometry(r - i * 0.9, 0.48, 8, 48, Math.PI), M(c, { emissive: c, emissiveIntensity: 0.45, transparent: true, opacity: 0.9 }), 0, 0, 0);
      b.castShadow = false;
    });
    return g;
  },
  blimp(rand) {
    const g = G();
    const body = sph(g, 2, M(0xffd23f, { roughness: 0.35 }), 0, 0, 0, 18);
    body.scale.set(1, 1, 2.8);
    box(g, 1.2, 0.8, 2, M(0xffffff), 0, -2.1, 0);
    [0, Math.PI / 2].forEach((r) => { const f = box(g, 0.1, 2.4, 1.2, M(0xff5d5d), 0, 0, -5.2); f.rotation.z = r; });
    const s = put(g, new THREE.PlaneGeometry(3, 1), M(0xffffff, { map: labelTexture('BYTEBUDDIES', '#ff5d5d', '#ffffff', 512, 160, 'bold 70px system-ui'), side: THREE.DoubleSide }), 2.05, 0, 0, 0, Math.PI / 2, 0);
    s.castShadow = false;
    return bob(g, 0.8, 0.4);
  },
  fireworks(rand, o = {}) {
    const g = G();
    const n = 26;
    const pos = new Float32Array(n * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const c = o.color ?? pick(rand, [0xff5dd0, 0xffd23f, 0x5ce1ff, 0x7dff8a]);
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: c, size: 0.9, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    pts.frustumCulled = false;
    g.add(pts);
    const dirs = [];
    for (let i = 0; i < n; i++) dirs.push(new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize());
    const ph = rand() * 3;
    g.userData.tick = (now) => {
      const t = ((now + ph) % 3) / 3;
      const r = t * 9;
      for (let i = 0; i < n; i++) {
        pos[i * 3] = dirs[i].x * r;
        pos[i * 3 + 1] = dirs[i].y * r - t * t * 3;
        pos[i * 3 + 2] = dirs[i].z * r;
      }
      geo.attributes.position.needsUpdate = true;
      pts.material.opacity = 1 - t;
    };
    return g;
  },
  windsock(rand) {
    const g = G();
    cyl(g, 0.06, 0.08, 4, M(0xdfe5ee, { metalness: 0.5 }), 0, 2, 0, 6);
    const sock = G();
    sock.position.set(0, 3.8, 0);
    for (let i = 0; i < 4; i++) {
      const s = cyl(sock, 0.4 - i * 0.06, 0.34 - i * 0.06, 0.6, M(i % 2 ? 0xffffff : 0xff5d3a), 0, 0, 0.3 + i * 0.6, 12);
      s.rotation.x = Math.PI / 2;
    }
    g.add(sock);
    const ph = rand() * 6;
    g.userData.tick = (now) => { sock.rotation.y = Math.sin(now * 0.8 + ph) * 0.8; sock.rotation.x = Math.sin(now * 2 + ph) * 0.1; };
    return g;
  },
  cabin(rand) {
    const g = G();
    box(g, 4, 2.6, 3.4, M(0x9a6a3a), 0, 1.3);
    for (let i = 0; i < 6; i++) box(g, 4.05, 0.08, 3.45, M(0x7a4f2a), 0, 0.2 + i * 0.42);
    const roof = put(g, new THREE.ConeGeometry(3.3, 2, 4), M(0xf4fbff, { flatShading: true }), 0, 3.6, 0, 0, Math.PI / 4, 0);
    roof.scale.z = 0.95;
    box(g, 1.2, 1, 0.1, E(0xffd98a, 0.7), -0.9, 1.5, 1.72);
    box(g, 0.9, 1.7, 0.1, M(0x5a3413), 0.9, 0.85, 1.72);
    box(g, 0.6, 1.4, 0.6, M(0x8a8f99), 1.2, 4, -0.6);
    return g;
  },
  cameraSign(rand) {
    const g = G();
    cyl(g, 0.07, 0.07, 3, M(0xdfe5ee), 0, 1.5, 0, 6);
    box(g, 1.6, 1.1, 0.5, M(0x2b2f3a), 0, 3.4);
    cyl(g, 0.35, 0.35, 0.5, M(0x5ce1ff, { roughness: 0.1, emissive: 0x2a8fc9, emissiveIntensity: 0.4 }), 0, 3.4, 0.4, 16).rotation.x = Math.PI / 2;
    box(g, 0.4, 0.2, 0.3, M(0xff5d5d), 0.5, 4.05, 0);
    return g;
  },
  spaceStation(rand) {
    const g = G();
    const ring = tor(g, 9, 0.8, M(0xdfe5ee, { metalness: 0.5, roughness: 0.3 }), 0, 0, 0, Math.PI * 2, Math.PI / 2);
    void ring;
    sph(g, 2.6, M(0xf4f6fa, { metalness: 0.4 }), 0, 0, 0, 20);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const s = cyl(g, 0.25, 0.25, 9, M(0xbfc6d1, { metalness: 0.6 }), Math.cos(a) * 4.5, 0, Math.sin(a) * 4.5, 8);
      s.rotation.set(Math.PI / 2, 0, -a + Math.PI / 2);
    }
    [-1, 1].forEach((s) => box(g, 6, 0.1, 2.4, M(0x1d3f8f, { metalness: 0.5, emissive: 0x0b2a6f, emissiveIntensity: 0.4 }), s * 6, 0, 0));
    for (let i = 0; i < 12; i++) sph(g, 0.2, E(i % 2 ? 0x5ce1ff : 0xffd23f, 1.3), Math.cos((i / 12) * Math.PI * 2) * 9, 0.9, Math.sin((i / 12) * Math.PI * 2) * 9, 6);
    g.userData.tick = (now) => { g.rotation.y = now * 0.08; };
    return g;
  },
  planet(rand, o = {}) {
    const g = G();
    const p = sph(g, o.r ?? 10, M(o.color ?? 0xff9a5c, { emissive: o.color ?? 0xff9a5c, emissiveIntensity: 0.35, fog: false }), 0, 0, 0, 28);
    p.castShadow = false;
    if (o.ring !== false) {
      const r = put(g, new THREE.RingGeometry((o.r ?? 10) * 1.3, (o.r ?? 10) * 1.9, 48), M(o.ringColor ?? 0xffe0a8, { side: THREE.DoubleSide, transparent: true, opacity: 0.7, fog: false, emissive: 0xffe0a8, emissiveIntensity: 0.3 }), 0, 0, 0, -1.2, 0, 0.3);
      r.castShadow = false;
    }
    return g;
  },

  // ─── Underwater ───
  coralBranch(rand, o = {}) {
    const g = G();
    const c = o.color ?? pick(rand, CORAL);
    const m = M(c, { flatShading: true, emissive: c, emissiveIntensity: 0.12 });
    const grow = (x, y, z, len, r, ax, az, depth) => {
      const seg = put(g, new THREE.CylinderGeometry(r * 0.7, r, len, 6), m, x, y + len / 2, z, ax, 0, az);
      seg.geometry.translate(0, 0, 0);
      const tip = new THREE.Vector3(0, len, 0).applyEuler(new THREE.Euler(ax, 0, az)).add(new THREE.Vector3(x, y, z));
      seg.position.set((x + tip.x) / 2, (y + tip.y) / 2, (z + tip.z) / 2);
      sph(g, r * 0.8, m, tip.x, tip.y, tip.z, 6);
      if (depth > 0) for (let k = 0; k < 2; k++) grow(tip.x, tip.y, tip.z, len * 0.72, r * 0.7, ax + (rand() - 0.5) * 1.1, az + (k ? 0.5 : -0.5), depth - 1);
    };
    grow(0, 0, 0, 1.2, 0.22, 0, 0, 3);
    return g;
  },
  coralBrain(rand, o = {}) {
    const g = G();
    const c = o.color ?? pick(rand, CORAL);
    const s = put(g, new THREE.IcosahedronGeometry(1, 2), M(c, { flatShading: true, emissive: c, emissiveIntensity: 0.1 }), 0, 0.5, 0);
    s.scale.set(1.2, 0.7, 1.1);
    return g;
  },
  coralFan(rand, o = {}) {
    const g = G();
    const c = o.color ?? pick(rand, CORAL);
    const f = put(g, new THREE.CircleGeometry(1.6, 14, 0, Math.PI), M(c, { side: THREE.DoubleSide, emissive: c, emissiveIntensity: 0.15, transparent: true, opacity: 0.9 }), 0, 0.2, 0);
    f.castShadow = false;
    cyl(g, 0.08, 0.1, 0.4, M(c), 0, 0.2, 0, 6);
    return g;
  },
  kelp(rand, o = {}) {
    const g = G();
    const m = M(o.color ?? pick(rand, [0x3f9a4a, 0x5bb04a, 0x2f8a5a]), { side: THREE.DoubleSide, flatShading: true });
    const stalks = [];
    for (let s = 0; s < 3; s++) {
      const st = G();
      st.position.set((s - 1) * 0.5, 0, (rand() - 0.5) * 0.5);
      const h = 5 + rand() * 4;
      for (let i = 0; i < 8; i++) {
        const leaf = put(st, new THREE.PlaneGeometry(0.5, h / 8 + 0.3), m, Math.sin(i) * 0.15, (i + 0.5) * (h / 8), 0, 0, i * 0.8, 0);
        leaf.castShadow = false;
      }
      g.add(st);
      stalks.push(st);
    }
    const ph = rand() * 6;
    g.userData.tick = (now) => stalks.forEach((st, i) => { st.rotation.z = Math.sin(now * 0.9 + ph + i) * 0.12; st.rotation.x = Math.cos(now * 0.7 + ph + i) * 0.08; });
    return g;
  },
  seaweed(rand, o = {}) {
    const g = G();
    const m = M(o.color ?? 0x46b24a, { flatShading: true });
    for (let i = 0; i < 4; i++) {
      const c = cone(g, 0.12, 1.4 + rand(), m, (rand() - 0.5) * 0.6, 0.7, (rand() - 0.5) * 0.6, 5);
      c.rotation.z = (rand() - 0.5) * 0.4;
    }
    return g;
  },
  anemone(rand, o = {}) {
    const g = G();
    const c = o.color ?? pick(rand, [0xff6fae, 0xb983ff, 0xffa84f]);
    cyl(g, 0.4, 0.5, 0.5, M(0xffe0c8), 0, 0.25, 0, 10);
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const t = cyl(g, 0.05, 0.08, 0.8, E(c, 0.35), Math.cos(a) * 0.3, 0.8, Math.sin(a) * 0.3, 5);
      t.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5);
    }
    return g;
  },
  shell(rand, o = {}) {
    const g = G();
    const s = put(g, new THREE.SphereGeometry(0.4, 12, 8, 0, Math.PI), M(o.color ?? pick(rand, [0xffd6c2, 0xfff0e0, 0xffb3c6]), { side: THREE.DoubleSide }), 0, 0, 0, -Math.PI / 2, 0, 0);
    s.scale.set(1, 1, 0.6);
    return g;
  },
  starfish(rand, o = {}) {
    const g = G();
    const m = M(o.color ?? pick(rand, [0xff7a45, 0xff4f7a, 0xffc233]), { flatShading: true });
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const arm = cone(g, 0.16, 0.7, m, Math.cos(a) * 0.3, 0.08, Math.sin(a) * 0.3, 5);
      arm.rotation.set(0, -a, Math.PI / 2);
    }
    sph(g, 0.18, m, 0, 0.08, 0, 8);
    return g;
  },
  fishSchool(rand, o = {}) {
    const g = G();
    const fish = [];
    const cols = o.colors ?? [0xffa62b, 0x3fb7ff, 0xffe14d, 0xff5d8f];
    for (let i = 0; i < 10; i++) {
      const f = G();
      const c = cols[i % cols.length];
      const body = sph(f, 0.35, M(c, { roughness: 0.3 }), 0, 0, 0, 10);
      body.scale.set(0.55, 0.9, 1.3);
      const tail = cone(f, 0.28, 0.5, M(c), 0, 0, -0.6, 4);
      tail.rotation.x = -Math.PI / 2;
      tail.scale.x = 0.3;
      sph(f, 0.06, M(0x111111), 0.15, 0.1, 0.35, 6);
      f.position.set((rand() - 0.5) * 3, (rand() - 0.5) * 1.6, (rand() - 0.5) * 3);
      g.add(f);
      fish.push(f);
    }
    const r = 6 + rand() * 6;
    const ph = rand() * 6;
    const dir = rand() < 0.5 ? 1 : -1;
    g.userData.tick = (now, obj) => {
      const a = (now * 0.3 + ph) * dir;
      obj.position.x = obj.userData.baseX + Math.cos(a) * r;
      obj.position.z = obj.userData.baseZ + Math.sin(a) * r;
      obj.position.y = obj.userData.baseY + Math.sin(now * 0.8 + ph) * 0.6;
      obj.rotation.y = dir > 0 ? -a : -a + Math.PI;
      fish.forEach((f, i) => { f.rotation.y = Math.sin(now * 6 + i) * 0.2; });
    };
    return g;
  },
  jellyfish(rand, o = {}) {
    const g = G();
    const c = o.color ?? pick(rand, [0xff9fe0, 0xb9a6ff, 0x9fe7ff]);
    const bell = put(g, new THREE.SphereGeometry(0.8, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), M(c, { transparent: true, opacity: 0.7, emissive: c, emissiveIntensity: 0.6, side: THREE.DoubleSide }), 0, 0, 0);
    bell.castShadow = false;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const t = cyl(g, 0.03, 0.02, 1.8, E(c, 0.5, { transparent: true, opacity: 0.7 }), Math.cos(a) * 0.5, -0.9, Math.sin(a) * 0.5, 4);
      t.castShadow = false;
    }
    const ph = rand() * 6;
    g.userData.tick = (now, obj) => {
      obj.position.y = obj.userData.baseY + Math.sin(now * 0.8 + ph) * 1.2;
      const s = 1 + Math.sin(now * 2.4 + ph) * 0.12;
      bell.scale.set(s, 1 / s, s);
    };
    return g;
  },
  turtle(rand) {
    const g = G();
    const shell = sph(g, 1, M(0x3f8a4a, { flatShading: true }), 0, 0, 0, 12);
    shell.scale.set(1, 0.45, 1.2);
    const belly = sph(g, 0.95, M(0xe8d9a8), 0, -0.12, 0, 12);
    belly.scale.set(1, 0.2, 1.15);
    sph(g, 0.4, M(0x7fc27a), 0, 0.05, 1.35, 10);
    const flippers = [];
    [[-1, 0.6], [1, 0.6], [-1, -0.7], [1, -0.7]].forEach(([s, z]) => {
      const f = box(g, 0.9, 0.08, 0.4, M(0x7fc27a), s * 1, -0.05, z);
      f.userData.s = s;
      flippers.push(f);
    });
    const r = 9 + rand() * 5;
    const ph = rand() * 6;
    g.userData.tick = (now, obj) => {
      const a = now * 0.15 + ph;
      obj.position.x = obj.userData.baseX + Math.cos(a) * r;
      obj.position.z = obj.userData.baseZ + Math.sin(a) * r;
      obj.rotation.y = -a;
      flippers.forEach((f) => { f.rotation.z = Math.sin(now * 3) * 0.4 * f.userData.s; });
    };
    return g;
  },
  shipwreck(rand) {
    const g = G();
    const wood = M(0x7a5234, { flatShading: true, roughness: 0.9 });
    const hull = box(g, 5, 3, 14, wood, 0, 1.2, 0);
    hull.rotation.z = 0.25;
    const bow = cone(g, 2.6, 4, wood, 0.5, 1.6, 8.5, 4);
    bow.rotation.set(Math.PI / 2, 0, 0.25);
    box(g, 4.4, 0.3, 12, M(0x9a6a3a), 0.4, 2.9, 0).rotation.z = 0.25;
    const mast = cyl(g, 0.25, 0.3, 11, wood, 0.8, 7, -1, 8);
    mast.rotation.z = 0.45;
    const sail = put(g, new THREE.PlaneGeometry(4, 4.4, 4, 4), M(0xe8dcc0, { side: THREE.DoubleSide, transparent: true, opacity: 0.85 }), 2.8, 8, -1, 0, Math.PI / 2, 0.45);
    sail.castShadow = false;
    for (let i = 0; i < 4; i++) cyl(g, 0.25, 0.25, 0.3, M(0x2b2f3a), 2.6, 2 + (i % 2) * 0.4, -4 + i * 2.6, 8).rotation.z = Math.PI / 2;
    return g;
  },
  treasureChest(rand) {
    const g = G();
    const wood = M(0x8a5a32);
    const gold = M(0xffc83a, { metalness: 0.8, roughness: 0.25, emissive: 0x7a4a00, emissiveIntensity: 0.4 });
    box(g, 1.6, 0.9, 1, wood, 0, 0.45);
    const lid = put(g, new THREE.CylinderGeometry(0.5, 0.5, 1.6, 12, 1, false, 0, Math.PI), wood, 0, 0.95, -0.25, 0, 0, Math.PI / 2);
    lid.rotation.set(-0.9, 0, Math.PI / 2);
    [-0.6, 0.6].forEach((x) => box(g, 0.12, 0.95, 1.04, gold, x, 0.47));
    for (let i = 0; i < 8; i++) cyl(g, 0.14, 0.14, 0.05, gold, (rand() - 0.5) * 1.1, 0.95 + rand() * 0.15, (rand() - 0.5) * 0.6, 10);
    return g;
  },
  vent(rand) {
    const g = G();
    const rock = M(0x4a3a36, { flatShading: true, roughness: 0.95 });
    cyl(g, 0.5, 1.4, 3.4, rock, 0, 1.7, 0, 7);
    cyl(g, 0.55, 0.5, 0.3, E(0xff7a2a, 1.2), 0, 3.45, 0, 7);
    const n = 30;
    const pos = new Float32Array(n * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xcfd6e0, size: 0.7, transparent: true, opacity: 0.5, depthWrite: false }));
    pts.frustumCulled = false;
    g.add(pts);
    const seeds = Array.from({ length: n }, () => Math.random());
    g.userData.tick = (now) => {
      for (let i = 0; i < n; i++) {
        const t = (now * 0.35 + seeds[i]) % 1;
        pos[i * 3] = Math.sin(seeds[i] * 40 + now) * t * 1.2;
        pos[i * 3 + 1] = 3.5 + t * 7;
        pos[i * 3 + 2] = Math.cos(seeds[i] * 40 + now) * t * 1.2;
      }
      geo.attributes.position.needsUpdate = true;
    };
    return g;
  },
  rockArch(rand, o = {}) {
    const g = G();
    const m = M(o.color ?? 0x8a7f78, { flatShading: true, roughness: 0.9 });
    const a = put(g, new THREE.TorusGeometry(6, 1.6, 7, 14, Math.PI), m, 0, 0, 0);
    a.scale.z = 0.9;
    for (let i = 0; i < 8; i++) {
      const t = (i / 7) * Math.PI;
      const c = SKYSEA.coralBrain(rand, {});
      c.scale.setScalar(0.5);
      c.position.set(Math.cos(t) * 6, Math.sin(t) * 6 + 1.2, 0.5);
      g.add(c);
    }
    return g;
  },

  // ─── Fantasy & creative ───
  spiderWeb(rand, o = {}) {
    const g = G();
    const post = M(o.post ?? 0x8a6a4a, { flatShading: true });
    const silk = E(o.color ?? 0xf4f7ff, o.glow ?? 0.3, { roughness: 0.2 });
    const r = o.r ?? 2.4;
    const cy = r + 0.8;
    cyl(g, 0.16, 0.2, cy + r + 0.4, post, -r - 0.2, (cy + r + 0.4) / 2, 0, 8);
    cyl(g, 0.16, 0.2, cy + r + 0.4, post, r + 0.2, (cy + r + 0.4) / 2, 0, 8);
    for (let i = 0; i < 8; i++) {
      put(g, new THREE.BoxGeometry(0.05, r * 2, 0.05), silk, 0, cy, 0, 0, 0, (i / 8) * Math.PI);
    }
    for (let k = 1; k <= 4; k++) {
      put(g, new THREE.TorusGeometry((k / 4) * r, 0.035, 4, 32), silk, 0, cy, 0).castShadow = false;
    }
    // Dewdrops catch the light
    const dew = E(o.dew ?? 0xbfeaff, 0.8, { transparent: true, opacity: 0.85 });
    for (let i = 0; i < 6; i++) {
      const a = rand() * Math.PI * 2;
      const d = (0.3 + rand() * 0.7) * r;
      sph(g, 0.09, dew, Math.cos(a) * d, cy + Math.sin(a) * d, 0.05, 8);
    }
    return g;
  },
  crystal(rand, o = {}) {
    const g = G();
    const c = o.color ?? pick(rand, [0xff7ad9, 0x7ad9ff, 0xb98aff, 0x7dffb8]);
    const m = M(c, { emissive: c, emissiveIntensity: 0.55, roughness: 0.15, transparent: true, opacity: 0.9, flatShading: true });
    for (let i = 0; i < 5; i++) {
      const h = 1 + rand() * 2.2;
      const s = put(g, new THREE.OctahedronGeometry(0.4, 0), m, (rand() - 0.5) * 0.9, h * 0.45, (rand() - 0.5) * 0.9, (rand() - 0.5) * 0.6, rand() * 3, (rand() - 0.5) * 0.6);
      s.scale.set(0.8, h, 0.8);
    }
    return g;
  },
  crystalFlower(rand, o = {}) {
    const g = G();
    cyl(g, 0.08, 0.1, 2.4, M(0x46c05a), 0, 1.2, 0, 6);
    const c = o.color ?? pick(rand, [0xff7ad9, 0x7ad9ff, 0xb98aff]);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const p = put(g, new THREE.OctahedronGeometry(0.45, 0), E(c, 0.7, { transparent: true, opacity: 0.9, flatShading: true }), Math.cos(a) * 0.5, 2.5, Math.sin(a) * 0.5, 0, -a, 0.9);
      p.scale.set(0.5, 1.3, 0.5);
    }
    sph(g, 0.25, E(0xfff3a8, 1.2), 0, 2.5, 0, 10);
    return g;
  },
  musicNote(rand, o = {}) {
    const g = G();
    const c = o.color ?? pick(rand, BRIGHT);
    const m = E(c, 0.5);
    const head = sph(g, 0.45, m, 0, 0, 0, 12);
    head.scale.set(1.2, 0.85, 0.6);
    cyl(g, 0.07, 0.07, 2, m, 0.45, 1, 0, 6);
    box(g, 0.7, 0.2, 0.1, m, 0.75, 1.9, 0).rotation.z = -0.4;
    return bob(g, 0.6, 1.3, 0.8);
  },
  pianoKeys(rand) {
    const g = G();
    for (let i = 0; i < 8; i++) {
      box(g, 0.9, 0.3, 3, M(0xffffff, { roughness: 0.3 }), -3.6 + i * 1.02, 0.15, 0);
      if (i % 7 !== 2 && i % 7 !== 6 && i < 7) box(g, 0.55, 0.5, 1.8, M(0x1c1f26, { roughness: 0.3 }), -3.1 + i * 1.02, 0.35, -0.6);
    }
    return g;
  },
  shapes(rand) {
    const g = G();
    box(g, 1.2, 1.2, 1.2, M(0xff5d5d), -1.6, 0.6);
    sph(g, 0.7, M(0x3fa7ff), 0, 0.7, 0, 16);
    cone(g, 0.8, 1.6, M(0xffd23f), 1.6, 0.8, 0, 16);
    const star = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 0.35 : 0.8;
      const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
      if (i === 0) star.moveTo(Math.cos(a) * r, Math.sin(a) * r); else star.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    const s = put(g, new THREE.ExtrudeGeometry(star, { depth: 0.3, bevelEnabled: false }), M(0x3fcf7a), 0, 2, 0);
    s.userData.star = true;
    return g;
  },
  crayon(rand, o = {}) {
    const g = G();
    const c = o.color ?? pick(rand, BRIGHT);
    cyl(g, 0.4, 0.4, 4, M(c, { roughness: 0.5 }), 0, 2, 0, 12);
    cone(g, 0.4, 0.9, M(c), 0, 4.45, 0, 12);
    cyl(g, 0.42, 0.42, 1.8, M(0xffffff), 0, 1.6, 0, 12);
    cyl(g, 0.43, 0.43, 0.2, M(c), 0, 1.6, 0, 12);
    return g;
  },
  paperLantern(rand, o = {}) {
    const g = G();
    cyl(g, 0.06, 0.08, 3, M(0x3b2a1a), 0, 1.5, 0, 6);
    const c = o.color ?? pick(rand, [0xff3b3b, 0xffb020, 0xff5dd0]);
    const l = sph(g, 0.55, E(c, 1, { roughness: 0.8 }), 0, 3.4, 0, 14);
    l.scale.y = 1.3;
    cyl(g, 0.3, 0.3, 0.1, M(0x2b2020), 0, 4.1, 0, 10);
    return g;
  },
  puzzleDoor(rand, o = {}) {
    const g = G();
    const stone = M(o.color ?? 0x9a8fb8, { flatShading: true });
    box(g, 1.4, 7, 1.4, stone, -3.2, 3.5);
    box(g, 1.4, 7, 1.4, stone, 3.2, 3.5);
    box(g, 8, 1.4, 1.6, stone, 0, 7.4);
    const door = box(g, 5, 6.2, 0.4, M(0x6b4ab8, { metalness: 0.2 }), 0, 3.1, 0);
    void door;
    [[-1.2, 4.6, 0xff5d5d], [1.2, 4.6, 0x3fa7ff], [-1.2, 2.2, 0xffd23f], [1.2, 2.2, 0x3fcf7a]].forEach(([x, y, c]) => box(g, 1.6, 1.6, 0.2, E(c, 0.6), x, y, 0.25));
    return g;
  },
  glowPad(rand, o = {}) {
    const g = G();
    const c = o.color ?? pick(rand, [0x5ce1ff, 0xff7ad9, 0xffe14d, 0x7dff8a]);
    const p = cyl(g, 1, 1, 0.15, E(c, 0.8, { transparent: true, opacity: 0.9 }), 0, 0.08, 0, 20);
    p.castShadow = false;
    return g;
  },
  paradeFloat(rand, o = {}) {
    const g = G();
    const c = o.color ?? pick(rand, BRIGHT);
    box(g, 4, 1, 7, M(c), 0, 0.9);
    [[-1.8, 2.8], [1.8, 2.8], [-1.8, -2.8], [1.8, -2.8]].forEach(([x, z]) => cyl(g, 0.45, 0.45, 0.3, M(0x222222), x, 0.45, z, 12).rotation.z = Math.PI / 2);
    const topper = sph(g, 1.8, M(pick(rand, BRIGHT)), 0, 3.2, 0, 18);
    topper.scale.y = 1.1;
    [-0.6, 0.6].forEach((x) => { sph(g, 0.35, M(0xffffff), x, 3.8, 1.5, 10); sph(g, 0.16, M(0x111111), x, 3.8, 1.8, 8); });
    for (let i = 0; i < 10; i++) sph(g, 0.3, M(pick(rand, FLOWER)), -1.9 + (i % 5) * 0.95, 1.5, i < 5 ? 3.5 : -3.5, 8);
    return g;
  },
  giantStar(rand, o = {}) {
    const g = G();
    const star = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 1.2 : 2.8;
      const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
      if (i === 0) star.moveTo(Math.cos(a) * r, Math.sin(a) * r); else star.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    const s = put(g, new THREE.ExtrudeGeometry(star, { depth: 0.8, bevelEnabled: true, bevelSize: 0.2, bevelThickness: 0.2 }), E(o.color ?? 0xffd23f, 0.6, { metalness: 0.4 }), 0, 0, -0.4);
    void s;
    return bob(g, 0.5, 0.8, 0.5);
  },
  arch(rand, o = {}) {
    const g = G();
    const c = o.color ?? 0xffd23f;
    const cols = o.colors ?? [0xff5d5d, 0xffd23f, 0x3fcf7a, 0x3fa7ff, 0xb46bff];
    cols.forEach((col, i) => tor(g, 5 - i * 0.45, 0.24, M(col, { emissive: col, emissiveIntensity: 0.25 }), 0, 0, 0, Math.PI));
    void c;
    if (o.text) {
      const s = put(g, new THREE.PlaneGeometry(6, 1.2), M(0xffffff, { map: labelTexture(o.text, o.bg ?? '#ffffff', o.fg ?? '#7c3aed', 640, 128, 'bold 76px system-ui') }), 0, 5.6, 0.1);
      s.castShadow = false;
    }
    return g;
  },
};
