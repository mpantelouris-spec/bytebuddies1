/**
 * Giant Garden props (Spider Bot, Arena 1) — the player is insect-sized, so
 * grass is a forest, daisies are towers and a dewdrop is a pond.
 * Smooth, rounded, toy-like shapes with vertex-colour gradients; grass sways
 * in the wind on the GPU so thousands of blades stay cheap when instanced.
 * Props face +z and sit on y = 0.
 */
import * as THREE from 'three';
import { M, E, G, put, pick } from './propKit.js';

// One shared wind clock for every swaying material
const WIND = { value: 0 };
let windRunning = false;
function startWind() {
  if (windRunning || typeof requestAnimationFrame === 'undefined') return;
  windRunning = true;
  const t0 = performance.now();
  const loop = (t) => { WIND.value = (t - t0) / 1000; requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
}

/** Standard material whose vertices bend with the wind, more at the top. */
const swayCache = new Map();
function swayMat(key, opts, strength = 0.35) {
  if (swayCache.has(key)) return swayCache.get(key);
  startWind();
  const m = new THREE.MeshStandardMaterial({ roughness: 0.62, metalness: 0, side: THREE.DoubleSide, vertexColors: true, ...opts });
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uWind = WIND;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform float uWind;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        float bend = max(position.y, 0.0);
        #ifdef USE_INSTANCING
          vec3 seed = instanceMatrix[3].xyz;
        #else
          vec3 seed = vec3(0.0);
        #endif
        float ph = seed.x * 0.37 + seed.z * 0.23;
        transformed.x += sin(uWind * 1.6 + ph) * ${strength.toFixed(2)} * bend * bend * 0.08;
        transformed.z += cos(uWind * 1.2 + ph * 1.3) * ${strength.toFixed(2)} * bend * bend * 0.05;`);
  };
  m.customProgramCacheKey = () => `sway-${key}`;
  swayCache.set(key, m);
  return m;
}

/** Paint a vertical colour gradient into a geometry's vertex colours. */
function gradient(geo, bottom, top, y0, y1) {
  const pos = geo.attributes.position;
  const cols = new Float32Array(pos.count * 3);
  const a = new THREE.Color(bottom);
  const b = new THREE.Color(top);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const k = THREE.MathUtils.clamp((pos.getY(i) - y0) / (y1 - y0 || 1), 0, 1);
    c.copy(a).lerp(b, k * k * (3 - 2 * k));
    cols.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  return geo;
}

/** A single tapered, curved grass blade as a ribbon of quads. */
function bladeGeometry(height, width, lean, twist = 0) {
  const segs = 7;
  const pos = [];
  const idx = [];
  for (let i = 0; i <= segs; i++) {
    const t = i / segs;
    const y = t * height;
    const x = lean * t * t * height;          // curls over towards the tip
    const w = width * (1 - t * 0.92);         // tapers to a point
    const a = twist * t;
    pos.push(x - Math.cos(a) * w / 2, y, -Math.sin(a) * w / 2, x + Math.cos(a) * w / 2, y, Math.sin(a) * w / 2);
    if (i < segs) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

/** Curved stem as a tube following a gentle S-curve. */
function stem(height, radius, lean = 0.12) {
  const pts = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(height * lean * 0.3, height * 0.35, 0),
    new THREE.Vector3(-height * lean * 0.2, height * 0.7, height * lean * 0.2),
    new THREE.Vector3(0, height, height * lean * 0.35),
  ];
  const curve = new THREE.CatmullRomCurve3(pts);
  const geo = new THREE.TubeGeometry(curve, 24, radius, 10, false);
  return { geo, top: pts[3], curve };
}

/** Broad leaf: a shaped, cupped blade with a midrib crease. */
function leafGeometry(length, width) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(width * 0.6, length * 0.2, width * 0.55, length * 0.75, 0, length);
  shape.bezierCurveTo(-width * 0.55, length * 0.75, -width * 0.6, length * 0.2, 0, 0);
  const geo = new THREE.ShapeGeometry(shape, 12);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    // Cup the leaf and let it droop towards the tip
    pos.setZ(i, (x * x) / (width * 1.2) - (y / length) ** 2 * length * 0.35);
  }
  geo.computeVertexNormals();
  return geo;
}

const PETAL_WHITE = [0xffffff, 0xfff6fb, 0xfffaf0];
const GRASS = [[0x2f7d2a, 0x9be07a], [0x3a8f30, 0xb8ec84], [0x2a6f2a, 0x8fd46a]];

export const GIANT_GARDEN = {
  /** A clump of 5–7 towering grass blades. */
  giantGrass(rand, o = {}) {
    const g = G();
    const n = 5 + Math.floor(rand() * 3);
    const [lo, hi] = pick(rand, GRASS);
    for (let i = 0; i < n; i++) {
      const h = (o.h ?? 7) * (0.6 + rand() * 0.6);
      const geo = gradient(bladeGeometry(h, 0.55 + rand() * 0.35, (rand() - 0.3) * 0.12, (rand() - 0.5) * 1.2), lo, hi, 0, h);
      const blade = new THREE.Mesh(geo, swayMat(`grass-${lo}`, {}, 0.5));
      blade.position.set((rand() - 0.5) * 1.6, 0, (rand() - 0.5) * 1.6);
      blade.rotation.y = rand() * Math.PI * 2;
      blade.castShadow = true;
      g.add(blade);
    }
    return g;
  },

  /** Towering daisy: curved stem, cupped leaves, layered white petals, golden dome. */
  giantDaisy(rand, o = {}) {
    const g = G();
    const h = o.h ?? 11;
    const { geo, top } = stem(h, 0.22);
    put(g, gradient(geo, 0x2f7a2a, 0x7cc85a, 0, h), M(0xffffff, { vertexColors: true, roughness: 0.55 }));
    [0.25, 0.45].forEach((f, i) => {
      const leaf = put(g, gradient(leafGeometry(3.2, 1.4), 0x3a8f30, 0x8fd46a, 0, 3.2), swayMat('leaf', {}, 0.2));
      leaf.position.set(0, h * f, 0);
      leaf.rotation.set(-1.0, i * 2.4 + rand(), 0);
    });
    const head = G();
    head.position.copy(top);
    head.rotation.x = -0.35 - rand() * 0.2;
    const petalMat = M(pick(rand, PETAL_WHITE), { roughness: 0.45 });
    const tipMat = M(o.tip ?? 0xffd1e6, { roughness: 0.45 });
    for (let ring = 0; ring < 2; ring++) {
      const count = 16;
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + ring * 0.2;
        const p = put(head, new THREE.SphereGeometry(0.5, 12, 8), ring ? tipMat : petalMat, Math.cos(a) * 1.25, Math.sin(a) * 1.25, -ring * 0.08);
        p.scale.set(1.5, 0.42, 0.12);
        p.rotation.z = a;
      }
    }
    const dome = put(head, new THREE.SphereGeometry(0.85, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), M(0xffc21a, { roughness: 0.8 }), 0, 0, 0.05);
    dome.rotation.x = Math.PI / 2;
    dome.scale.z = 0.55;
    g.add(head);
    return g;
  },

  /** Sunflower giant: two rings of golden petals and a seed-spiral face. */
  giantSunflower(rand, o = {}) {
    const g = G();
    const h = o.h ?? 16;
    const { geo, top } = stem(h, 0.35, 0.08);
    put(g, gradient(geo, 0x2f6f2a, 0x6fbf4a, 0, h), M(0xffffff, { vertexColors: true, roughness: 0.6 }));
    [0.3, 0.5, 0.68].forEach((f, i) => {
      const leaf = put(g, gradient(leafGeometry(4.2, 2.2), 0x2f7a2a, 0x7cc85a, 0, 4.2), swayMat('sunleaf', {}, 0.2));
      leaf.position.set(0, h * f, 0);
      leaf.rotation.set(-1.1, i * 2.1, 0);
    });
    const head = G();
    head.position.copy(top);
    head.rotation.x = -0.25;
    const petals = [M(0xffc21a, { roughness: 0.5 }), M(0xffa81a, { roughness: 0.5 })];
    for (let ring = 0; ring < 2; ring++) {
      for (let i = 0; i < 22; i++) {
        const a = (i / 22) * Math.PI * 2 + ring * 0.14;
        const p = put(head, new THREE.SphereGeometry(0.6, 12, 8), petals[ring], Math.cos(a) * 2.3, Math.sin(a) * 2.3, -ring * 0.1);
        p.scale.set(1.9, 0.5, 0.14);
        p.rotation.z = a;
      }
    }
    const face = new THREE.CanvasTexture((() => {
      const c = document.createElement('canvas'); c.width = c.height = 256;
      const x = c.getContext('2d');
      x.fillStyle = '#4a2a10'; x.fillRect(0, 0, 256, 256);
      for (let i = 0; i < 520; i++) {
        const r = Math.sqrt(i) * 5.4; const a = i * 2.39996;
        x.fillStyle = i % 3 ? '#6b3e1a' : '#8a5a2a';
        x.beginPath(); x.arc(128 + Math.cos(a) * r, 128 + Math.sin(a) * r, 3.4, 0, 7); x.fill();
      }
      return c;
    })());
    face.colorSpace = THREE.SRGBColorSpace;
    const disc = put(head, new THREE.CylinderGeometry(1.7, 1.7, 0.5, 32), [M(0x4a2a10), new THREE.MeshStandardMaterial({ map: face, roughness: 0.9 }), M(0x4a2a10)], 0, 0, 0.1);
    disc.rotation.x = Math.PI / 2;
    g.add(head);
    return g;
  },

  /** Tulip cup of five rounded petals. */
  giantTulip(rand, o = {}) {
    const g = G();
    const h = o.h ?? 8;
    const { geo, top } = stem(h, 0.18, 0.06);
    put(g, gradient(geo, 0x2f7a2a, 0x7cc85a, 0, h), M(0xffffff, { vertexColors: true }));
    const leaf = put(g, gradient(leafGeometry(4, 1.2), 0x3a8f30, 0x8fd46a, 0, 4), swayMat('tulipleaf', {}, 0.2));
    leaf.rotation.set(-0.4, rand() * 6, 0);
    const color = o.color ?? pick(rand, [0xff5d8f, 0xff7a3d, 0xc86bff, 0xff4d6a]);
    const cup = G();
    cup.position.copy(top);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const p = put(cup, new THREE.SphereGeometry(0.7, 14, 10, 0, Math.PI), M(color, { roughness: 0.4, side: THREE.DoubleSide }), Math.cos(a) * 0.35, 0.6, Math.sin(a) * 0.35);
      p.scale.set(0.8, 1.4, 0.6);
      p.rotation.y = -a + Math.PI / 2;
    }
    g.add(cup);
    return g;
  },

  /** Three heart-shaped clover leaves on thin stalks. */
  giantClover(rand, o = {}) {
    const g = G();
    const h = o.h ?? 3;
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + rand();
      const leaf = put(g, gradient(leafGeometry(1.6, 1.8), 0x3a9a30, 0x9be07a, 0, 1.6), swayMat('clover', {}, 0.25));
      leaf.position.set(0, h, 0);
      leaf.rotation.set(-1.35, a, 0);
    }
    put(g, new THREE.CylinderGeometry(0.06, 0.08, h, 6), M(0x3f8f30), 0, h / 2, 0);
    return g;
  },

  /** Smooth river pebble, gently lumpy. */
  pebble(rand, o = {}) {
    const g = G();
    const geo = new THREE.IcosahedronGeometry(1, 3);
    const pos = geo.attributes.position;
    const s = rand() * 10;
    for (let i = 0; i < pos.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(pos, i);
      const n = 1 + Math.sin(v.x * 3 + s) * 0.06 + Math.cos(v.z * 2.5 + s) * 0.05;
      v.multiplyScalar(n);
      pos.setXYZ(i, v.x, v.y * 0.6, v.z);
    }
    geo.computeVertexNormals();
    const tone = pick(rand, [0xcfc6b8, 0xb8b0a4, 0xd8cfc0, 0xa9a39a]);
    const p = put(g, geo, M(o.color ?? tone, { roughness: 0.75 }), 0, 0.45, 0);
    p.scale.setScalar(o.s ?? 1.6);
    return g;
  },

  /** A dewdrop pond: glossy, clear water with a bright rim highlight. */
  dewdrop(rand, o = {}) {
    const g = G();
    const r = o.r ?? 3.5;
    const water = put(g, new THREE.SphereGeometry(r, 36, 18, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0x9fe6ff, roughness: 0.04, metalness: 0.1, transparent: true, opacity: 0.72, envMapIntensity: 1.6 }), 0, 0, 0);
    water.scale.y = 0.28;
    water.receiveShadow = false;
    // Sky glint and a soft shadow ring on the ground
    const glint = put(g, new THREE.SphereGeometry(r * 0.22, 16, 10), E(0xffffff, 0.8, { transparent: true, opacity: 0.85 }), -r * 0.35, r * 0.24, -r * 0.25);
    glint.scale.set(1.4, 0.35, 0.8);
    const ring = put(g, new THREE.RingGeometry(r * 0.96, r * 1.12, 40), M(0x5fa8c8, { transparent: true, opacity: 0.35 }), 0, 0.02, 0);
    ring.rotation.x = -Math.PI / 2;
    return g;
  },

  /** Arching tree root the spider can crawl under. */
  rootArch(rand, o = {}) {
    const g = G();
    const span = o.span ?? 9;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-span / 2, -0.5, 0),
      new THREE.Vector3(-span / 3, span * 0.35, 0.6),
      new THREE.Vector3(span / 6, span * 0.42, -0.4),
      new THREE.Vector3(span / 2, -0.5, 0.3),
    ]);
    const bark = M(0x7a5232, { roughness: 0.95 });
    put(g, new THREE.TubeGeometry(curve, 32, 0.9, 12, false), bark, 0, 0, 0);
    // Moss tufts on top
    for (let i = 0; i < 6; i++) {
      const p = curve.getPoint(0.2 + i * 0.12);
      const m = put(g, new THREE.SphereGeometry(0.6, 10, 8), M(0x6fbf4a, { roughness: 0.9 }), p.x, p.y + 0.6, p.z);
      m.scale.y = 0.45;
    }
    return g;
  },

  /** Bumbling bee that hovers and loops. */
  bee(rand) {
    const g = G();
    const body = G();
    const stripes = [0xffc21a, 0x2a2018, 0xffc21a, 0x2a2018, 0xffc21a];
    stripes.forEach((c, i) => {
      const s = put(body, new THREE.SphereGeometry(0.42 - Math.abs(i - 2) * 0.06, 14, 10), M(c, { roughness: 0.6 }), 0, 0, (i - 2) * 0.22);
      s.scale.set(1, 1, 0.8);
    });
    const eyeM = M(0x1a1a1a, { roughness: 0.2 });
    [-0.18, 0.18].forEach((x) => put(body, new THREE.SphereGeometry(0.1, 8, 6), eyeM, x, 0.12, 0.62));
    const wingM = new THREE.MeshStandardMaterial({ color: 0xe8f6ff, transparent: true, opacity: 0.55, roughness: 0.1, side: THREE.DoubleSide });
    const wings = [-1, 1].map((s) => {
      const w = put(body, new THREE.SphereGeometry(0.5, 12, 8), wingM, s * 0.35, 0.4, 0);
      w.scale.set(0.9, 0.08, 0.5);
      return { w, s };
    });
    g.add(body);
    const ph = rand() * 10;
    const r = 3 + rand() * 4;
    g.userData.tick = (now, obj) => {
      const t = now * 0.6 + ph;
      obj.position.x = obj.userData.baseX + Math.cos(t) * r;
      obj.position.z = obj.userData.baseZ + Math.sin(t * 1.3) * r * 0.6;
      obj.position.y = obj.userData.baseY + 5 + Math.sin(t * 2.2) * 0.8;
      obj.rotation.y = Math.atan2(-Math.sin(t) * r, Math.cos(t * 1.3) * r * 0.6 * 1.3);
      wings.forEach(({ w, s }) => { w.rotation.z = s * Math.sin(now * 38) * 0.6; });
    };
    return g;
  },

  /** Butterfly fluttering on a lazy figure-eight. */
  butterfly(rand, o = {}) {
    const g = G();
    const color = o.color ?? pick(rand, [0xff7ad9, 0x5fb8ff, 0xffb020, 0xa878ff]);
    const wingM = M(color, { side: THREE.DoubleSide, roughness: 0.5 });
    const spotM = M(0xffffff, { side: THREE.DoubleSide });
    const wings = [-1, 1].map((s) => {
      const w = G();
      const up = put(w, new THREE.CircleGeometry(0.9, 20), wingM, s * 0.8, 0.25, 0);
      up.scale.set(1, 0.85, 1);
      put(w, new THREE.CircleGeometry(0.55, 16), wingM, s * 0.55, -0.55, 0);
      put(w, new THREE.CircleGeometry(0.18, 10), spotM, s * 0.95, 0.35, 0.01);
      w.rotation.x = -Math.PI / 2;
      g.add(w);
      return { w, s };
    });
    put(g, new THREE.CapsuleGeometry(0.1, 0.9, 4, 8), M(0x2a2018), 0, 0, 0).rotation.x = Math.PI / 2;
    const ph = rand() * 10;
    g.userData.tick = (now, obj) => {
      const t = now * 0.35 + ph;
      obj.position.x = obj.userData.baseX + Math.sin(t) * 6;
      obj.position.z = obj.userData.baseZ + Math.sin(t * 2) * 3;
      obj.position.y = obj.userData.baseY + 7 + Math.sin(now * 3 + ph) * 0.6;
      obj.rotation.y = Math.atan2(Math.cos(t) * 6, Math.cos(t * 2) * 6);
      wings.forEach(({ w, s }) => { w.rotation.z = s * (0.2 + Math.abs(Math.sin(now * 9 + ph)) * 1.1); });
    };
    return g;
  },

  /** Ladybird ambling across the ground in slow circles. */
  ladybird(rand) {
    const g = G();
    const shell = put(g, new THREE.SphereGeometry(0.9, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2), M(0xe8262c, { roughness: 0.25 }), 0, 0.15, 0);
    shell.scale.set(1, 0.8, 1.2);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const spot = put(g, new THREE.SphereGeometry(0.2, 10, 8), M(0x1a1a1a), Math.cos(a) * 0.5, 0.72, Math.sin(a) * 0.6);
      spot.scale.y = 0.4;
    }
    put(g, new THREE.SphereGeometry(0.4, 14, 10), M(0x1a1a1a), 0, 0.3, 1.05);
    [-0.15, 0.15].forEach((x) => put(g, new THREE.SphereGeometry(0.08, 8, 6), M(0xffffff), x, 0.45, 1.35));
    const ph = rand() * 10;
    g.userData.tick = (now, obj) => {
      const t = now * 0.12 + ph;
      obj.position.x = obj.userData.baseX + Math.cos(t) * 2.5;
      obj.position.z = obj.userData.baseZ + Math.sin(t) * 2.5;
      obj.rotation.y = -t;
    };
    return g;
  },

  /** The Queen Spider's web: huge, glittering with dew, strung between two sunflowers. */
  queenWeb(rand, o = {}) {
    const g = G();
    const r = o.r ?? 9;
    const cy = r + 6;
    const silk = E(0xf4f8ff, 0.55, { roughness: 0.2, transparent: true, opacity: 0.95 });
    const spokes = 16;
    for (let i = 0; i < spokes; i++) {
      put(g, new THREE.CylinderGeometry(0.04, 0.04, r * 2, 4), silk, 0, cy, 0, 0, 0, (i / spokes) * Math.PI);
    }
    for (let k = 1; k <= 7; k++) {
      put(g, new THREE.TorusGeometry((k / 7) * r, 0.035, 4, 64), silk, 0, cy, 0).castShadow = false;
    }
    // Dew beads that twinkle
    const dew = E(0xbfeaff, 1.2, { transparent: true, opacity: 0.9 });
    for (let i = 0; i < 40; i++) {
      const a = rand() * Math.PI * 2;
      const d = (0.25 + rand() * 0.75) * r;
      put(g, new THREE.SphereGeometry(0.12 + rand() * 0.08, 10, 8), dew, Math.cos(a) * d, cy + Math.sin(a) * d, 0.06);
    }
    // Anchor sunflowers either side
    [-1, 1].forEach((s) => {
      const f = GIANT_GARDEN.giantSunflower(rand, { h: cy + r + 2 });
      f.position.x = s * (r + 1.2);
      g.add(f);
    });
    const ph = rand() * 10;
    g.userData.tick = (now) => { dew.emissiveIntensity = 0.8 + Math.sin(now * 2 + ph) * 0.5; };
    return g;
  },
};
