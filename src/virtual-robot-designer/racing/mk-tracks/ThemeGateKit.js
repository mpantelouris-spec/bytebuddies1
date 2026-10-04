/**
 * ThemeGateKit.js — a hero gate over the start straight for each kart world,
 * so the opening shot frames the road the way a kart game does: a steel
 * overpass in the city, a red rock arch in the canyon, a snowy wooden bridge,
 * a volcanic stone arch, a giant tree arch, a glowing ring gate in space,
 * a floating stone arch in the sky, a glass tunnel under the sea and a castle
 * gatehouse. Built at world scale, centred on x = 0 and spanning ±SPAN/2.
 */
import * as THREE from 'three';

const SPAN = 15;         // legs stand just inside the fence line
const HALF = SPAN / 2;

function mat(color, o = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.75, metalness: 0.05, ...o });
}
function glow(color, intensity = 1.2) {
  return new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: intensity, roughness: 0.4 });
}
function box(g, w, h, d, m, x, y, z = 0) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  g.add(mesh);
  return mesh;
}
function cyl(g, rt, rb, h, m, x, y, z = 0, seg = 12) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  g.add(mesh);
  return mesh;
}
function banner(g, color, x, y, z, emblem = 0xffd23f) {
  const b = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 2.2), mat(color, { side: THREE.DoubleSide }));
  b.position.set(x, y, z);
  g.add(b);
  const e = new THREE.Mesh(new THREE.CircleGeometry(0.28, 12), mat(emblem, { side: THREE.DoubleSide }));
  e.position.set(x, y + 0.3, z + 0.01);
  g.add(e);
}

const GATES = {
  city() {
    const g = new THREE.Group();
    const concrete = mat(0xb8c0cc, { roughness: 0.8 });
    [-HALF, HALF].forEach((x) => box(g, 1.4, 7, 1.6, concrete, x, 3.5));
    box(g, SPAN + 4, 1.3, 4, concrete, 0, 7.4);                       // overpass deck
    box(g, SPAN + 4, 0.18, 0.2, glow(0x3fa7ff, 1.6), 0, 6.72, 2.05);  // underside light strip
    box(g, SPAN + 4, 0.7, 0.15, mat(0x8a94a8, { metalness: 0.6 }), 0, 8.4, 1.9); // railing
    box(g, SPAN + 4, 0.7, 0.15, mat(0x8a94a8, { metalness: 0.6 }), 0, 8.4, -1.9);
    return g;
  },
  canyon() {
    const g = new THREE.Group();
    const rock = mat(0xc4683a, { flatShading: true, roughness: 0.95 });
    const arch = new THREE.Mesh(new THREE.TorusGeometry(HALF + 0.6, 1.9, 7, 18, Math.PI), rock);
    arch.scale.z = 1.3;
    arch.castShadow = true;
    g.add(arch);
    // Chunky boulders at the feet
    [[-HALF - 1, 1.2, 0.8], [HALF + 1.2, 1, -0.6], [-HALF - 2.4, 0.7, -1.2], [HALF + 2.2, 0.8, 1.1]].forEach(([x, r, z]) => {
      const b = new THREE.Mesh(new THREE.DodecahedronGeometry(r * 1.4, 0), rock);
      b.position.set(x, r, z);
      g.add(b);
    });
    return g;
  },
  snow() {
    const g = new THREE.Group();
    const stone = mat(0x8a93a3, { flatShading: true });
    const snowM = mat(0xf6faff);
    const wood = mat(0x6e4a2e);
    [-HALF, HALF].forEach((x) => {
      box(g, 2.2, 7, 2.2, stone, x, 3.5);
      box(g, 2.5, 0.5, 2.5, snowM, x, 7.2);
      banner(g, 0x2f5bd8, x, 4.3, 1.12, 0xffd23f);
    });
    box(g, SPAN + 2.5, 0.7, 3.2, wood, 0, 7.6);                   // bridge deck
    for (let x = -HALF - 1; x <= HALF + 1; x += 1.6) box(g, 0.14, 0.9, 0.14, wood, x, 8.4, 1.5);
    box(g, SPAN + 2.5, 0.14, 0.14, wood, 0, 8.85, 1.5);
    box(g, SPAN + 2.5, 0.35, 3.3, snowM, 0, 8.05);                // snow on the deck
    return g;
  },
  volcano() {
    const g = new THREE.Group();
    const basalt = mat(0x2e2828, { flatShading: true, roughness: 0.95 });
    const seam = glow(0xff6a1a, 1.8);
    [-HALF, HALF].forEach((x) => {
      for (let i = 0; i < 4; i++) box(g, 2.2 - i * 0.12, 1.7, 2.2 - i * 0.12, basalt, x, 0.85 + i * 1.75);
      box(g, 0.2, 6.8, 0.12, seam, x + 0.4, 3.5, 1.12);           // glowing crack
      cyl(g, 0.12, 0.16, 1.2, mat(0x3a2a22), x, 7.8, 0);          // torch
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.9, 8), glow(0xffa030, 2));
      flame.position.set(x, 8.8, 0);
      g.add(flame);
    });
    box(g, SPAN + 2.4, 1.6, 2.4, basalt, 0, 7.3);
    box(g, SPAN + 1.6, 0.16, 0.12, seam, 0, 6.9, 1.22);
    return g;
  },
  forest() {
    const g = new THREE.Group();
    const bark = mat(0x6e4a2a, { flatShading: true });
    const leaf = mat(0x3f9f45, { flatShading: true });
    [-HALF, HALF].forEach((x, i) => {
      cyl(g, 0.9, 1.5, 9, bark, x, 4.5, 0, 9);
      // Roots
      [0, 2.1, 4.2].forEach((a) => {
        const r = new THREE.Mesh(new THREE.ConeGeometry(0.5, 2.2, 6), bark);
        r.position.set(x + Math.cos(a + i) * 1.3, 0.6, Math.sin(a + i) * 1.3);
        r.rotation.z = Math.cos(a + i) * 0.9;
        r.rotation.x = -Math.sin(a + i) * 0.9;
        g.add(r);
      });
    });
    box(g, SPAN + 2, 0.9, 1.6, bark, 0, 8.2);                       // log bridge
    [[-HALF, 10, 0, 3.4], [0, 10.4, 0, 3], [HALF, 10, 0, 3.4], [-HALF / 2, 9.6, 1, 2.4], [HALF / 2, 9.6, -1, 2.4]]
      .forEach(([x, y, z, r]) => {
        const c = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), leaf);
        c.position.set(x, y, z);
        c.castShadow = true;
        g.add(c);
      });
    [-3, 0, 3].forEach((x) => {
      const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 8), glow(0xffd070, 1.4));
      lantern.position.set(x, 7.2, 0);
      g.add(lantern);
    });
    return g;
  },
  space() {
    const g = new THREE.Group();
    const hull = mat(0xc8d2e0, { metalness: 0.7, roughness: 0.3 });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(HALF + 0.3, 0.7, 12, 48), hull);
    ring.position.y = 0.2;
    g.add(ring);
    const inner = new THREE.Mesh(new THREE.TorusGeometry(HALF - 0.4, 0.15, 8, 48), glow(0x5ee0ff, 2));
    inner.position.y = 0.2;
    g.add(inner);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI;
      const pod = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 1.6), glow(i % 2 ? 0x3fa7ff : 0xa855f7, 1.1));
      pod.position.set(Math.cos(a) * (HALF + 0.3), 0.2 + Math.sin(a) * (HALF + 0.3), 0);
      g.add(pod);
    }
    return g;
  },
  sky() {
    const g = new THREE.Group();
    const stone = mat(0xe8dcc4, { flatShading: true });
    const grass = mat(0x6fd26a, { flatShading: true });
    const arch = new THREE.Mesh(new THREE.TorusGeometry(HALF + 0.4, 1.2, 6, 16, Math.PI), stone);
    g.add(arch);
    // Grassy cap and a small waterfall off one side
    const cap = new THREE.Mesh(new THREE.TorusGeometry(HALF + 0.4, 1.25, 6, 16, Math.PI * 0.5), grass);
    cap.position.y = 0.25;
    cap.rotation.z = Math.PI * 0.25;
    g.add(cap);
    const fall = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 7), new THREE.MeshBasicMaterial({ color: 0xbfeaff, transparent: true, opacity: 0.8, side: THREE.DoubleSide }));
    fall.position.set(-HALF - 1.4, 3.5, 0.6);
    g.add(fall);
    return g;
  },
  reef() {
    const g = new THREE.Group();
    const glass = new THREE.MeshStandardMaterial({ color: 0x9ff0ff, transparent: true, opacity: 0.22, roughness: 0.1, metalness: 0.2, side: THREE.DoubleSide, depthWrite: false });
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(HALF + 0.5, HALF + 0.5, 22, 32, 1, true, -Math.PI / 2, Math.PI), glass);
    tube.rotation.x = Math.PI / 2;
    tube.rotation.y = Math.PI / 2;
    tube.position.z = 8; // runs on down the road ahead of the gate
    g.add(tube);
    const rib = mat(0xd8f4ff, { metalness: 0.6, roughness: 0.3 });
    for (let z = -3; z <= 19; z += 5.5) {
      const r = new THREE.Mesh(new THREE.TorusGeometry(HALF + 0.55, 0.22, 8, 32, Math.PI), rib);
      r.position.z = z;
      g.add(r);
      const light = new THREE.Mesh(new THREE.TorusGeometry(HALF + 0.3, 0.07, 6, 32, Math.PI), glow(0x2fe0ff, 1.8));
      light.position.z = z + 0.3;
      g.add(light);
    }
    return g;
  },
  castle() {
    const g = new THREE.Group();
    const stone = mat(0xc8bca4, { flatShading: true, roughness: 0.9 });
    const roof = mat(0x2f5bd8, { flatShading: true });
    [-HALF - 0.5, HALF + 0.5].forEach((x) => {
      box(g, 3, 10, 3, stone, x, 5);
      for (let i = -1; i <= 1; i += 2) for (let j = -1; j <= 1; j += 2) box(g, 0.7, 0.8, 0.7, stone, x + i * 1.15, 10.4, j * 1.15);
      const cone = new THREE.Mesh(new THREE.ConeGeometry(2.2, 3.4, 4), roof);
      cone.position.set(x, 12.4, 0);
      cone.rotation.y = Math.PI / 4;
      g.add(cone);
      banner(g, 0x2f5bd8, x, 6, 1.52, 0xffd23f);
    });
    box(g, SPAN, 3.2, 3, stone, 0, 8.6);                            // wall over the gate
    for (let x = -HALF + 1; x <= HALF - 1; x += 1.6) box(g, 0.8, 0.8, 3, stone, x, 10.6);
    return g;
  },
};

/** A themed gate for this world, or null to keep the default balloon arch. */
export function buildThemeGate(themeId) {
  const make = GATES[themeId];
  if (!make) return null;
  const g = make();
  g.name = `theme-gate-${themeId}`;
  return g;
}
