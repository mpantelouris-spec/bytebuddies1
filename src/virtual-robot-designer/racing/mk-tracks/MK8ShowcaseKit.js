/**
 * MK8ShowcaseKit.js — console-kart finish pass for the outdoor biome circuits.
 *
 * Runs last, after the biome world, roadside dressing and race presentation, and adds
 * the things that make a kart track read like a real console game:
 *   - painted sky with a hot sun + glare, big sun-lit cumulus clouds
 *   - rolling grass hills with rocky cliff bands out to the horizon
 *   - mowed checker grass
 *   - lush clumpy trees (the blocky low-poly trees are swapped out), blossom trees,
 *     flower bushes along the verge, snowy pines on ice worlds
 *   - drifting hot-air balloons
 */
import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { applyPhotoSurfaces } from './MK8PhotoKit.js';

// ── Look profiles ────────────────────────────────────────────────────────────
const LUSH = { leaf: [0x4f9a2c, 0x5fae33, 0x3f8a2a, 0x76b83a], trunk: 0x6b4a2e };
const PROFILES = {
  fairy_glen_01: {
    photoSky: 'day', ground: 'grass', water: true,
    asphalt: true,
    sky: { top: '#5b9cf0', mid: '#a9c4f6', horizon: '#f4d8ec', sun: '#fff1d0', fog: '#b8d0f0' },
    grass: ['#74c24a', '#62b23c'], hills: 'grass', trees: 'lush', blossom: 0.35,
    balloons: 5, clouds: 16, flowers: 46, replaceTrees: true,
  },
  jungle_ruins_01: {
    photoSky: 'day', ground: 'grass', water: true,
    asphalt: true,
    sky: { top: '#5d9fe8', mid: '#a8cdf4', horizon: '#eee4f2', sun: '#fff4d8' },
    grass: ['#6fbd45', '#5daa38'], hills: 'grass', trees: 'lush', blossom: 0.18,
    balloons: 4, clouds: 14, flowers: 36, replaceTrees: true,
  },
  cloud_citadel_01: {
    photoSky: 'day', ground: 'grass', water: true,
    asphalt: true,
    sky: { top: '#4f9be8', mid: '#9fcaf4', horizon: '#f0e6f6', sun: '#fff6e0' },
    grass: ['#78c64c', '#66b53f'], hills: 'grass', trees: 'lush', blossom: 0.25,
    balloons: 6, clouds: 20, flowers: 30, replaceTrees: true,
  },
  sunset_cove_01: {
    photoSky: 'day', ground: 'sand', asphalt: true, replacePalms: true, water: true,
    hide: /^(sunset-distant-island|gltf-vista-distant_island|prop-beach-hut|gltf-building-beach_hut|gltf-hut-|prop-hut-|prop-start-hut|gltf-start-hut|tent_detailed)/,
    sky: { top: '#3f86d8', mid: '#8fc6f0', horizon: '#ffd9b0', sun: '#fff0c8' },
    grass: null, hills: null, trees: null, blossom: 0,
    balloons: 4, clouds: 14, flowers: 28, replaceTrees: false,
  },
  frost_peak_01: {
    photoSky: 'day', ground: 'snow', asphalt: true, replacePines: true,
    sky: { top: '#5d98e0', mid: '#a9cff2', horizon: '#eaf3fb', sun: '#ffffff' },
    grass: ['#f4f8fc', '#e6eef6'], hills: 'snow', trees: 'pine', blossom: 0,
    balloons: 3, clouds: 12, flowers: 0, replaceTrees: false,
  },
  dry_dry_desert: {
    photoSky: 'clear', ground: 'sand', replacePalms: true, water: true, asphalt: true,
    sky: { top: '#3f8ee0', mid: '#9cc9ee', horizon: '#fbe3bc', sun: '#fff2cc' },
    grass: null, hills: 'desert', trees: null, blossom: 0,
    balloons: 3, clouds: 10, flowers: 0, replaceTrees: false, liftRocks: true,
  },
};

// City Circuit: sunny downtown loop instead of the dark neon tunnel
PROFILES.neon_metro_01 = {
  photoSky: 'day', ground: 'grass', asphalt: true, water: true,
  hide: /^(holo-billboard|prop-start-building-holo_billboard|gltf-building-holo_billboard|prop-start-neon_sign|gltf-start-neon_sign|cup-quality-foreground)/,
  sky: { top: '#4f9be8', mid: '#9fcaf4', horizon: '#f0e6f6', sun: '#fff6e0' },
  grass: ['#78c64c', '#66b53f'], hills: 'grass', trees: 'lush', blossom: 0.3,
  balloons: 4, clouds: 12, flowers: 30, replaceTrees: true,
};

// Night worlds keep their mood but get a proper sky and the console start gantry
PROFILES.star_station_01 = { night: 'space', hide: /^cup-quality-(background|midground|foreground)/ };
PROFILES.lava_foundry_01 = { night: 'lava', hide: /^cup-quality-(background|midground|foreground)/ };

const COSMIC_TRACKS = new Set(['rainbow_road_master', 'rainbow_road']);

export function hasMK8Showcase(trackId) {
  return Boolean(PROFILES[trackId]) || COSMIC_TRACKS.has(trackId);
}

// ── Small helpers ────────────────────────────────────────────────────────────
function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function hash3(x, y, z) {
  const h = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return h - Math.floor(h);
}

function noise3(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
  const lerp = (a, b, t) => a + (b - a) * t;
  const c = (dx, dy, dz) => hash3(xi + dx, yi + dy, zi + dz);
  return lerp(
    lerp(lerp(c(0, 0, 0), c(1, 0, 0), u), lerp(c(0, 1, 0), c(1, 1, 0), u), v),
    lerp(lerp(c(0, 0, 1), c(1, 0, 1), u), lerp(c(0, 1, 1), c(1, 1, 1), u), v),
    w,
  );
}

function fbm(x, y, z, oct = 4) {
  let a = 0.5, f = 1, sum = 0;
  for (let i = 0; i < oct; i++) {
    sum += a * noise3(x * f, y * f, z * f);
    f *= 2.03;
    a *= 0.5;
  }
  return sum;
}

const smooth = (e0, e1, x) => {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

/** Lumpy sphere with baked ambient occlusion (dark underside) — foliage and cloud puffs. */
function makeBlobGeometry(seed, { lump = 0.16, freq = 2.2, aoLow = 0.5, detail = 3 } = {}) {
  let g = new THREE.IcosahedronGeometry(1, detail);
  g.deleteAttribute('normal');
  g.deleteAttribute('uv');
  g = mergeVertices(g);
  const pos = g.attributes.position;
  const v = new THREE.Vector3();
  const colors = [];
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n = fbm(v.x * freq + seed, v.y * freq, v.z * freq, 3);
    const clump = fbm(v.x * freq * 2.6, v.y * freq * 2.6 + seed, v.z * freq * 2.6, 2);
    v.multiplyScalar(1 + (n - 0.5) * lump * 2 + (clump - 0.5) * lump * 0.9);
    if (v.y < -0.35) v.y = -0.35 + (v.y + 0.35) * 0.45; // flatter underside
    pos.setXYZ(i, v.x, v.y, v.z);
    const ao = aoLow + (1 - aoLow) * smooth(-0.9, 0.85, v.y);
    const speck = 0.9 + clump * 0.2;
    colors.push(ao * speck, ao * speck, ao * speck);
  }
  g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  g.computeVertexNormals();
  return g;
}

function canvasTexture(w, h, draw, { repeat = null, srgb = true } = {}) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb && THREE.SRGBColorSpace) t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat[0], repeat[1]);
  }
  t.anisotropy = 8;
  return t;
}

/** Mowed-lawn checker with blade speckle, like a kart-game infield. */
function grassTexture([a, b], repeat) {
  return canvasTexture(512, 512, (ctx, w, h) => {
    const r = rng(7);
    ctx.fillStyle = a;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = b;
    ctx.fillRect(0, 0, w / 2, h / 2);
    ctx.fillRect(w / 2, h / 2, w / 2, h / 2);
    for (let i = 0; i < 9000; i++) {
      const x = r() * w, y = r() * h;
      const l = r();
      ctx.fillStyle = l > 0.5 ? `rgba(255,255,220,${0.05 + r() * 0.08})` : `rgba(0,40,0,${0.05 + r() * 0.09})`;
      ctx.fillRect(x, y, 1 + r() * 1.5, 2 + r() * 3);
    }
  }, { repeat });
}

function glowTexture(inner, outer) {
  return canvasTexture(256, 256, (ctx, w) => {
    const g = ctx.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    g.addColorStop(0, inner);
    g.addColorStop(0.18, inner);
    g.addColorStop(0.4, outer);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, w);
  });
}

// ── Road clearance sampling ──────────────────────────────────────────────────
function makeClearance(curve, samples = 500) {
  const pts = curve.getSpacedPoints(samples);
  let minY = Infinity;
  pts.forEach((p) => { minY = Math.min(minY, p.y); });
  const dist = (x, z) => {
    let best = Infinity;
    for (let i = 0; i < pts.length; i++) {
      const dx = pts[i].x - x, dz = pts[i].z - z;
      const d = dx * dx + dz * dz;
      if (d < best) best = d;
    }
    return Math.sqrt(best);
  };
  return { pts, dist, minY };
}

function trackCenter(pts) {
  const b = { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity };
  pts.forEach((p) => {
    b.minX = Math.min(b.minX, p.x); b.maxX = Math.max(b.maxX, p.x);
    b.minZ = Math.min(b.minZ, p.z); b.maxZ = Math.max(b.maxZ, p.z);
  });
  const cx = (b.minX + b.maxX) / 2, cz = (b.minZ + b.maxZ) / 2;
  let radius = 0;
  pts.forEach((p) => { radius = Math.max(radius, Math.hypot(p.x - cx, p.z - cz)); });
  return { cx, cz, radius };
}

// ── Sky ──────────────────────────────────────────────────────────────────────
const SKY_HIDE = /^(track-volumetric-clouds|cup-quality-sky-cloud|cup-quality-atmosphere)/;

function buildSky(scene, center, prof, sunDir) {
  const old = scene.getObjectByName('track-sky-dome');
  if (old) old.visible = false;
  scene.traverse((o) => { if (SKY_HIDE.test(o.name || '')) o.visible = false; });

  const mat = new THREE.ShaderMaterial({
    uniforms: {
      top: { value: new THREE.Color(prof.top) },
      mid: { value: new THREE.Color(prof.mid) },
      horizon: { value: new THREE.Color(prof.horizon) },
      sunColor: { value: new THREE.Color(prof.sun) },
      sunDir: { value: sunDir.clone() },
    },
    vertexShader: /* glsl */`
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 top; uniform vec3 mid; uniform vec3 horizon; uniform vec3 sunColor; uniform vec3 sunDir;
      varying vec3 vDir;
      void main() {
        vec3 d = normalize(vDir);
        float h = d.y;
        vec3 col = mix(horizon, mid, smoothstep(-0.02, 0.22, h));
        col = mix(col, top, smoothstep(0.22, 0.85, h));
        float s = max(dot(d, normalize(sunDir)), 0.0);
        col += sunColor * (pow(s, 900.0) * 6.0 + pow(s, 60.0) * 0.55 + pow(s, 8.0) * 0.22);
        // warm haze band on the horizon
        col = mix(col, horizon * 1.04, (1.0 - smoothstep(0.0, 0.12, abs(h))) * 0.35);
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
  });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(950, 48, 24), mat);
  dome.name = 'mk8-sky';
  dome.renderOrder = -40;
  dome.frustumCulled = false;
  dome.position.set(center.cx, center.y, center.cz);
  scene.add(dome);

  // Sun glare sprite (bloom turns it into a proper lens bloom)
  const glare = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture('rgba(255,255,245,1)', 'rgba(255,236,190,0.35)'),
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    fog: false,
    transparent: true,
  }));
  glare.name = 'mk8-sun-glare';
  glare.position.set(center.cx, center.y, center.cz).addScaledVector(sunDir, 880);
  glare.scale.setScalar(260);
  glare.renderOrder = -39;
  scene.add(glare);

  const horizon = new THREE.Color(prof.horizon);
  scene.background = horizon.clone();
  scene.fog = new THREE.Fog(new THREE.Color(prof.fog || prof.mid), 240, 1300);
  return dome;
}

function buildClouds(group, center, count, sunDir, seed) {
  const r = rng(seed);
  const geo = makeBlobGeometry(3.1, { lump: 0.12, freq: 1.6, aoLow: 0.62, detail: 2 });
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    vertexColors: true,
    roughness: 1,
    metalness: 0,
    emissive: new THREE.Color(0xb8c4e6),
    emissiveIntensity: 0.42,
    fog: false,
  });
  const puffs = [];
  for (let c = 0; c < count; c++) {
    const ang = (c / count) * Math.PI * 2 + r() * 0.3;
    const dist = 420 + r() * 300;
    const cx = center.cx + Math.cos(ang) * dist;
    const cz = center.cz + Math.sin(ang) * dist;
    const cy = center.y + 70 + r() * 110;
    const size = 18 + r() * 22;
    const n = 6 + Math.floor(r() * 5);
    // A cloud is a long row of puffs, tallest in the middle
    const along = new THREE.Vector3(-Math.sin(ang), 0, Math.cos(ang));
    for (let i = 0; i < n; i++) {
      const f = (i / (n - 1)) * 2 - 1;
      const s = size * (1 - Math.abs(f) * 0.45) * (0.7 + r() * 0.5);
      puffs.push({
        x: cx + along.x * f * size * 2.2 + (r() - 0.5) * size * 0.6,
        y: cy + s * 0.25 + (r() - 0.3) * size * 0.35,
        z: cz + along.z * f * size * 2.2 + (r() - 0.5) * size * 0.6,
        s,
      });
    }
  }
  const mesh = new THREE.InstancedMesh(geo, mat, puffs.length);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  puffs.forEach((p, i) => {
    q.setFromEuler(new THREE.Euler(0, r() * Math.PI * 2, 0));
    m.compose(new THREE.Vector3(p.x, p.y, p.z), q, new THREE.Vector3(p.s, p.s * 0.72, p.s));
    mesh.setMatrixAt(i, m);
  });
  mesh.name = 'mk8-clouds';
  mesh.frustumCulled = false;
  group.add(mesh);
  return mesh;
}

// ── Terrain: flat infield + rolling hills and cliffs to the horizon ──────────
const HILL_COLORS = {
  grass: { top: 0x5fae3a, top2: 0x7cc247, rock: 0xa98059, rock2: 0x86633f, far: 0x7fa6a0 },
  snow: { top: 0xf2f7fc, top2: 0xdfeaf5, rock: 0x8f9fb4, rock2: 0x6f8098, far: 0xb8cce4 },
  desert: { top: 0xe8c07a, top2: 0xf0cf8c, rock: 0xc9814a, rock2: 0xa8633a, far: 0xd8b8a0 },
};

function buildTerrain(group, center, clear, style, grassMap, seed) {
  const cols = HILL_COLORS[style];
  const y0 = clear.minY - 0.32;
  const rIn = center.radius + 42;
  const rOut = 820;
  const lowTier = (group.parent?.userData?.mk8Density ?? group.userData?.mk8Density ?? 1) < 0.5;
  const rings = lowTier ? 30 : 56, segs = lowTier ? 90 : 160;
  const verts = [], colors = [], idx = [];
  const cTop = new THREE.Color(cols.top), cTop2 = new THREE.Color(cols.top2);
  const cRock = new THREE.Color(cols.rock), cRock2 = new THREE.Color(cols.rock2);
  const cFar = new THREE.Color(cols.far);
  const heights = [];
  for (let i = 0; i <= rings; i++) {
    const u = i / rings;
    const r = rIn * 0.55 + (rOut - rIn * 0.55) * Math.pow(u, 1.35);
    for (let j = 0; j <= segs; j++) {
      const th = (j / segs) * Math.PI * 2;
      const x = center.cx + Math.cos(th) * r;
      const z = center.cz + Math.sin(th) * r;
      const ring = smooth(rIn, rIn + 90, r);
      const far = smooth(rIn + 160, rIn + 420, r);
      const nx = Math.cos(th) * 2.2 + seed, nz = Math.sin(th) * 2.2;
      let h = ring * (8 + 30 * fbm(nx, 0.3, nz, 4));
      // Terraced mesas — gives the grass-topped cliffs look
      const mesa = fbm(nx * 1.7, 1.1, nz * 1.7, 3);
      if (mesa > 0.55) h += ring * smooth(0.55, 0.64, mesa) * 10;
      h += far * (22 + 58 * fbm(nx * 0.8, 2.7, nz * 0.8, 4));
      h += fbm(x * 0.02, 5.1, z * 0.02, 3) * 6 * ring;
      heights.push(h);
      verts.push(x, y0 + h, z);
    }
  }
  for (let i = 0; i < rings; i++) {
    for (let j = 0; j < segs; j++) {
      const a = i * (segs + 1) + j, b = a + segs + 1;
      idx.push(a, a + 1, b, b, a + 1, b + 1);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  const nrm = geo.attributes.normal;
  const uvs = [];
  for (let k = 0; k < nrm.count; k++) {
    const ny = nrm.getY(k);
    const x = verts[k * 3], z = verts[k * 3 + 2];
    const n = noise3(x * 0.05, heights[k] * 0.12, z * 0.05);
    const grassy = smooth(0.42, 0.62, ny + (n - 0.5) * 0.12);
    const top = cTop.clone().lerp(cTop2, n);
    // Horizontal rock strata on cliffs
    const strata = 0.5 + 0.5 * Math.sin(heights[k] * 0.9 + n * 3);
    const rock = cRock.clone().lerp(cRock2, strata * 0.7);
    const c = rock.lerp(top, grassy);
    // Aerial perspective: far ridges fade toward a cool blue-green
    const dd = Math.hypot(x - center.cx, z - center.cz);
    c.lerp(cFar, smooth(rIn + 180, rOut, dd) * 0.55);
    colors.push(c.r, c.g, c.b);
    uvs.push(x / 14, z / 14);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  const hillMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.95,
    metalness: 0,
    map: style === 'grass' ? noiseDetailTexture() : null,
  });
  const hills = new THREE.Mesh(geo, hillMat);
  hills.name = 'mk8-hills';
  hills.receiveShadow = true;
  group.add(hills);

  // Infield lawn under the whole circuit
  const lawnR = rIn + 6;
  const lawnGeo = new THREE.CircleGeometry(lawnR, 96);
  lawnGeo.rotateX(-Math.PI / 2);
  const lawnMap = grassMap ? grassMap.clone() : null;
  if (lawnMap) {
    lawnMap.needsUpdate = true;
    lawnMap.repeat.set(lawnR / 6, lawnR / 6);
  }
  const lawn = new THREE.Mesh(lawnGeo, new THREE.MeshStandardMaterial({
    color: lawnMap ? 0xffffff : cols.top,
    map: lawnMap,
    roughness: 0.92,
  }));
  lawn.name = 'mk8-lawn';
  lawn.position.set(center.cx, y0 - 0.05, center.cz);
  lawn.receiveShadow = true;
  group.add(lawn);
  return hills;
}

let _detailTex = null;
function noiseDetailTexture() {
  if (_detailTex) return _detailTex;
  _detailTex = canvasTexture(256, 256, (ctx, w, h) => {
    const r = rng(19);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) {
      const v = 200 + Math.floor(r() * 55);
      ctx.fillStyle = `rgb(${v},${v},${v})`;
      ctx.beginPath();
      ctx.arc(r() * w, r() * h, 1 + r() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }, { repeat: [1, 1] });
  return _detailTex;
}

// ── Foliage ──────────────────────────────────────────────────────────────────
function makeForest(group, kind) {
  const blobGeo = makeBlobGeometry(1.7, { lump: 0.18, freq: 2.4, aoLow: 0.42, detail: 2 });
  const leafMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.88, metalness: 0 });
  const trunkGeo = new THREE.CylinderGeometry(0.22, 0.38, 1, 9, 1);
  trunkGeo.translate(0, 0.5, 0);
  const trunkMat = new THREE.MeshStandardMaterial({ color: LUSH.trunk, roughness: 0.95 });
  const blobs = [], trunks = [];

  const addTree = (x, y, z, size, r, blossom = false) => {
    const trunkH = size * (0.9 + r() * 0.4);
    trunks.push({ x, y, z, h: trunkH, s: size * 0.55, tilt: (r() - 0.5) * 0.12 });
    const palette = blossom
      ? [0xf6b8d2, 0xfbd3e4, 0xffffff, 0xf29dc2]
      : LUSH.leaf;
    const n = blossom ? 4 : 5 + Math.floor(r() * 3);
    const cy = y + trunkH + size * 0.55;
    blobs.push({ x, y: cy, z, s: size * 1.05, c: palette[Math.floor(r() * palette.length)] });
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + r();
      const rr = size * (0.55 + r() * 0.35);
      blobs.push({
        x: x + Math.cos(a) * rr,
        y: cy + (r() - 0.35) * size * 0.8,
        z: z + Math.sin(a) * rr,
        s: size * (0.55 + r() * 0.3),
        c: palette[Math.floor(r() * palette.length)],
      });
    }
    blobs.push({ x, y: cy + size * 0.75, z, s: size * 0.7, c: palette[Math.floor(r() * palette.length)] });
  };

  const addBush = (x, y, z, size, r, flowerCol) => {
    blobs.push({ x, y: y + size * 0.35, z, s: size, c: 0x3f8a2a, flat: true });
    blobs.push({ x: x + size * 0.6, y: y + size * 0.25, z: z + (r() - 0.5) * size, s: size * 0.75, c: 0x4a9630, flat: true });
    if (flowerCol != null) {
      for (let i = 0; i < 7; i++) {
        const a = r() * Math.PI * 2, rr = r() * size * 0.85;
        blobs.push({
          x: x + Math.cos(a) * rr, y: y + size * (0.7 + r() * 0.2), z: z + Math.sin(a) * rr,
          s: size * 0.16, c: flowerCol, flower: true,
        });
      }
    }
  };

  const finish = () => {
    const leaf = new THREE.InstancedMesh(blobGeo, leafMat, Math.max(1, blobs.length));
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), col = new THREE.Color();
    blobs.forEach((b, i) => {
      q.setFromEuler(new THREE.Euler(0, (i * 1.7) % 6.28, 0));
      const sy = b.flat ? b.s * 0.7 : b.s * 0.9;
      m.compose(new THREE.Vector3(b.x, b.y, b.z), q, new THREE.Vector3(b.s, sy, b.s));
      leaf.setMatrixAt(i, m);
      leaf.setColorAt(i, col.setHex(b.c));
    });
    leaf.count = blobs.length;
    leaf.castShadow = true;
    leaf.receiveShadow = true;
    leaf.name = `mk8-foliage-${kind}`;
    group.add(leaf);
    const trunk = new THREE.InstancedMesh(trunkGeo, trunkMat, Math.max(1, trunks.length));
    trunks.forEach((t, i) => {
      q.setFromEuler(new THREE.Euler(t.tilt, 0, t.tilt * 0.6));
      m.compose(new THREE.Vector3(t.x, t.y, t.z), q, new THREE.Vector3(t.s, t.h, t.s));
      trunk.setMatrixAt(i, m);
    });
    trunk.count = trunks.length;
    trunk.castShadow = true;
    trunk.name = `mk8-trunks-${kind}`;
    group.add(trunk);
  };
  return { addTree, addBush, finish };
}

function makePines(group) {
  const green = new THREE.Color(0x2c6a3c), green2 = new THREE.Color(0x3d8250);
  const snow = new THREE.Color(0xf4f8ff), bark = new THREE.Color(0x5a3e28);
  const pos = [], col = [];
  const push = (geo, colorAt) => {
    const g = geo.index ? geo.toNonIndexed() : geo;
    const pa = g.attributes.position;
    for (let i = 0; i < pa.count; i++) {
      const x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i);
      pos.push(x, y, z);
      const c = colorAt(x, y, z);
      col.push(c.r, c.g, c.b);
    }
  };
  const trunk = new THREE.CylinderGeometry(0.2, 0.3, 1.4, 8);
  trunk.translate(0, 0.7, 0);
  push(trunk, () => bark);
  [[0, 2.2, 1.5], [1.3, 1.8, 1.25], [2.4, 1.4, 1.0], [3.3, 0.9, 0.8]].forEach(([y, r, h], tier) => {
    const H = h * 1.6;
    const c = new THREE.ConeGeometry(r, H, 14, 3, true);
    // droop the skirt edge so each tier reads as layered branches
    const cp = c.attributes.position;
    for (let i = 0; i < cp.count; i++) {
      const yy = cp.getY(i);
      if (yy < -H / 2 + 0.01) {
        const a = Math.atan2(cp.getZ(i), cp.getX(i));
        cp.setY(i, yy - 0.18 - 0.12 * Math.sin(a * 7 + tier));
      }
    }
    const y0 = y + 1.2 + h * 0.8;
    c.translate(0, y0, 0);
    push(c, (x, yy, z) => {
      const t = (yy - (y0 - H / 2)) / H;
      const n = Math.sin(x * 5.1 + z * 3.7 + tier) * 0.08;
      const base = green.clone().lerp(green2, Math.max(0, Math.min(1, t)));
      return base.lerp(snow, Math.max(0, Math.min(1, (t + n - 0.62) / 0.12)));
    });
  });
  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  merged.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  merged.computeVertexNormals();
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, side: THREE.DoubleSide });
  const list = [];
  return {
    add: (x, y, z, s) => list.push({ x, y, z, s }),
    finish: () => {
      const mesh = new THREE.InstancedMesh(merged, mat, Math.max(1, list.length));
      const m = new THREE.Matrix4();
      list.forEach((p, i) => {
        m.compose(new THREE.Vector3(p.x, p.y, p.z), new THREE.Quaternion(), new THREE.Vector3(p.s, p.s * 1.1, p.s));
        mesh.setMatrixAt(i, m);
      });
      mesh.count = list.length;
      mesh.castShadow = true;
      mesh.name = 'mk8-pines';
      group.add(mesh);
    },
  };
}

function mergeGeometries(geos) {
  const nonIdx = geos.map((g) => (g.index ? g.toNonIndexed() : g));
  let total = 0;
  nonIdx.forEach((g) => { total += g.attributes.position.count; });
  const pos = new Float32Array(total * 3);
  let o = 0;
  nonIdx.forEach((g) => { pos.set(g.attributes.position.array, o); o += g.attributes.position.array.length; });
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  return out;
}

// ── Hot-air balloons ─────────────────────────────────────────────────────────
const BALLOON_SCHEMES = [
  ['#ff6f91', '#ffd0dc', '#ffe36e'],
  ['#5fd1c1', '#e8fff8', '#ffcf4a'],
  ['#ffb347', '#fff1c8', '#ff6f61'],
  ['#8e7dff', '#e6e0ff', '#ffd66e'],
  ['#58b7ff', '#ffffff', '#ff7aa8'],
  ['#8fd14f', '#f4ffe0', '#ff9f43'],
];

function balloonTexture([a, b, band]) {
  return canvasTexture(512, 256, (ctx, w, h) => {
    const gores = 12;
    for (let i = 0; i < gores; i++) {
      ctx.fillStyle = i % 2 ? a : b;
      ctx.fillRect((i / gores) * w, 0, w / gores + 1, h);
    }
    // scalloped band round the equator
    ctx.fillStyle = band;
    ctx.fillRect(0, h * 0.5, w, h * 0.1);
    for (let i = 0; i < gores * 2; i++) {
      ctx.beginPath();
      ctx.arc((i + 0.5) * (w / (gores * 2)), h * 0.6, w / (gores * 4), 0, Math.PI);
      ctx.fill();
    }
    // stars on the band
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < gores; i++) {
      const cx = (i + 0.5) * (w / gores), cy = h * 0.4, R = 9;
      ctx.beginPath();
      for (let k = 0; k < 10; k++) {
        const rr = k % 2 ? R * 0.45 : R;
        const an = (k / 10) * Math.PI * 2 - Math.PI / 2;
        ctx.lineTo(cx + Math.cos(an) * rr, cy + Math.sin(an) * rr);
      }
      ctx.fill();
    }
    // soft top highlight + bottom shade
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, 'rgba(0,0,0,0.18)');
    g.addColorStop(0.15, 'rgba(255,255,255,0.12)');
    g.addColorStop(0.45, 'rgba(255,255,255,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.12)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  });
}

function buildBalloon(scheme) {
  const g = new THREE.Group();
  const spline = new THREE.CatmullRomCurve3([
    [0.9, -6], [1.4, -5], [2.7, -3.4], [4.0, -1.4], [4.9, 0.8], [5.2, 2.8],
    [5.0, 4.6], [4.3, 6.0], [3.1, 7.1], [1.6, 7.75], [0.02, 7.95],
  ].map(([x, y]) => new THREE.Vector3(x, y, 0)));
  const prof = spline.getPoints(40).map((p) => new THREE.Vector2(Math.max(0.02, p.x), p.y));
  const env = new THREE.Mesh(
    new THREE.LatheGeometry(prof, 48),
    new THREE.MeshStandardMaterial({ map: balloonTexture(scheme), roughness: 0.55, metalness: 0, side: THREE.DoubleSide }),
  );
  env.castShadow = true;
  g.add(env);
  const basket = new THREE.Mesh(
    new THREE.CylinderGeometry(0.95, 0.8, 1.1, 12),
    new THREE.MeshStandardMaterial({ color: 0x8a5a2b, roughness: 0.9 }),
  );
  basket.position.y = -9.2;
  g.add(basket);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.12, 6, 16), new THREE.MeshStandardMaterial({ color: 0x5c3a1a }));
  rim.rotation.x = Math.PI / 2;
  rim.position.y = -8.65;
  g.add(rim);
  const ropeMat = new THREE.MeshStandardMaterial({ color: 0x3b2a1a });
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
    const from = new THREE.Vector3(Math.cos(a) * 0.85, -8.65, Math.sin(a) * 0.85);
    const to = new THREE.Vector3(Math.cos(a) * 1.2, -6, Math.sin(a) * 1.2);
    const len = from.distanceTo(to);
    const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, len, 4), ropeMat);
    rope.position.copy(from).add(to).multiplyScalar(0.5);
    rope.lookAt(to);
    rope.rotateX(Math.PI / 2);
    g.add(rope);
  }
  const flame = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 10, 8),
    new THREE.MeshBasicMaterial({ color: 0xffb040 }),
  );
  flame.position.y = -6.4;
  g.add(flame);
  return g;
}

// ── Kart asphalt: fine grey tarmac, faint checker, white edge lines + red/white kerbs ──
function asphaltTexture() {
  return canvasTexture(512, 512, (ctx, w, h) => {
    const r = rng(41);
    ctx.fillStyle = '#62646b';
    ctx.fillRect(0, 0, w, h);
    // faint console-style checker across the tarmac
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        ctx.fillStyle = (i + j) % 2 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.035)';
        ctx.fillRect((i / 4) * w, (j / 4) * h, w / 4, h / 4);
      }
    }
    // soft tonal blotches
    for (let i = 0; i < 70; i++) {
      const x = r() * w, y = r() * h, rad = 20 + r() * 60;
      const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
      const dark = r() < 0.5;
      g.addColorStop(0, dark ? 'rgba(20,20,26,0.10)' : 'rgba(255,255,255,0.06)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    // aggregate speckle
    for (let i = 0; i < 26000; i++) {
      const v = r();
      ctx.fillStyle = v > 0.55 ? `rgba(235,235,240,${0.08 + r() * 0.14})` : `rgba(15,15,20,${0.1 + r() * 0.18})`;
      ctx.fillRect(r() * w, r() * h, 1 + r(), 1 + r());
    }
    // tyre-worn racing lines
    [0.32, 0.68].forEach((u) => {
      const g = ctx.createLinearGradient(u * w - 40, 0, u * w + 40, 0);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(0.5, 'rgba(20,20,25,0.13)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(u * w - 40, 0, 80, h);
    });
    // white edge lines
    ctx.fillStyle = '#f4f4f0';
    ctx.fillRect(w * 0.028, 0, w * 0.026, h);
    ctx.fillRect(w * 0.946, 0, w * 0.026, h);
  }, { repeat: [1, 0.25] });
}

function paintKartAsphalt(scene) {
  const road = scene.userData.raceRoadMesh;
  if (!road?.isMesh || !road.geometry.attributes.uv) return;
  const old = road.material;
  road.material = new THREE.MeshStandardMaterial({
    map: asphaltTexture(),
    roughness: 0.82,
    metalness: 0.02,
    polygonOffset: old?.polygonOffset ?? true,
    polygonOffsetFactor: old?.polygonOffsetFactor ?? -4,
    polygonOffsetUnits: old?.polygonOffsetUnits ?? -4,
  });
  road.userData.themedSurface = 'mk8_asphalt';
  road.parent?.children.forEach((m) => {
    if (m !== road && m.isMesh && m.material === old) m.material = new THREE.MeshStandardMaterial({ color: 0x4a4b50, roughness: 0.9 });
  });
  scene.traverse((o) => {
    if (o.name === 'kart-kerbs') o.visible = true;
    // dirt-road dressing (leaf litter, ruts) doesn't belong on tarmac
    if (/^(rally-center-dashes|road-leaf|road-litter|road-rut)/.test(o.name || '')) o.visible = false;
  });
}

// Faceted low-poly canopies (icosahedron/dodecahedron blobs) → soft clumpy foliage
const POLY_TYPES = new Set(['IcosahedronGeometry', 'DodecahedronGeometry', 'OctahedronGeometry']);
let _canopyGeo = null;
function roundOffLowPolyCanopies(scene) {
  if (!_canopyGeo) _canopyGeo = makeBlobGeometry(4.2, { lump: 0.15, freq: 2.2, aoLow: 0.5, detail: 2 });
  const hsl = { h: 0, s: 0, l: 0 };
  scene.traverse((o) => {
    if (!o.isMesh || o.isInstancedMesh || !POLY_TYPES.has(o.geometry?.type)) return;
    const m = Array.isArray(o.material) ? null : o.material;
    if (!m?.color) return;
    m.color.getHSL(hsl);
    const green = hsl.h > 0.18 && hsl.h < 0.45 && hsl.s > 0.25;
    const blossom = (hsl.h > 0.85 || hsl.h < 0.03) && hsl.l > 0.6;
    if (!green && !blossom) return;
    const rad = o.geometry.parameters?.radius ?? 1;
    const g = _canopyGeo.clone();
    g.scale(rad, rad, rad);
    o.geometry = g;
    o.material = new THREE.MeshStandardMaterial({
      color: m.color.clone(), vertexColors: true, roughness: 0.88, metalness: 0,
    });
    o.castShadow = true;
    o.userData.mk8Canopy = true;
  });
}

// ── Main entry ───────────────────────────────────────────────────────────────
export function applyMK8Showcase(scene, curve, roadHw, trackId, { startT = 0 } = {}) {
  if (COSMIC_TRACKS.has(trackId)) return applyRainbowShowcase(scene, curve, roadHw, trackId);
  const prof = PROFILES[trackId];
  if (!prof || !curve) return null;
  scene.getObjectByName('mk8-showcase')?.removeFromParent();
  // Scenery density follows the device's quality tier (tablets / older laptops = low)
  const tier = scene.userData.qualityTier || 'medium';
  const dens = tier === 'low' ? 0.4 : tier === 'medium' ? 0.75 : 1;
  scene.userData.mk8Density = dens;
  if (prof.night) return applyNightShowcase(scene, curve, trackId, prof);

  const root = new THREE.Group();
  root.name = 'mk8-showcase';
  scene.add(root);

  const clear = makeClearance(curve);
  const c = trackCenter(clear.pts);
  const center = { ...c, y: clear.minY };
  const r = rng(trackId.length * 131 + 7);

  // Sun direction: keep the shadow light's azimuth, sit the disc low like a console sky
  let sunAz = new THREE.Vector3(0.6, 0, -0.8);
  scene.traverse((o) => {
    if (o.isDirectionalLight && o.castShadow) {
      const d = o.position.clone().sub(o.target?.position || new THREE.Vector3());
      if (d.lengthSq() > 0.01) sunAz = new THREE.Vector3(d.x, 0, d.z);
    }
  });
  if (sunAz.lengthSq() < 1e-4) sunAz.set(0.6, 0, -0.8);
  sunAz.normalize();
  const sunDir = sunAz.clone().multiplyScalar(Math.cos(0.42)).setY(Math.sin(0.42)).normalize();

  buildSky(scene, center, prof.sky, sunDir);
  // Parent the sky to the showcase group so a rebuild replaces it instead of stacking
  ['mk8-sky', 'mk8-sun-glare'].forEach((n) => { const o = scene.getObjectByName(n); if (o) root.add(o); });
  if (prof.clouds) buildClouds(root, center, Math.max(4, Math.round(prof.clouds * dens)), sunDir, trackId.length * 17);

  const grassMap = prof.grass ? grassTexture(prof.grass, [1, 1]) : null;
  if (prof.hills) {
    buildTerrain(root, center, clear, prof.hills, grassMap, trackId.length * 0.37);
  }
  // The old flat cut-out backdrop layers fight the painted sky and real hills
  scene.traverse((o) => { if (/^cup-quality-(background|midground)/.test(o.name || '')) o.visible = false; });

  // Mowed checker on the existing infield disc
  if (grassMap) {
    const disc = scene.getObjectByName('track-ground-disc');
    if (disc?.isMesh && disc.geometry.attributes.uv) {
      if (!disc.geometry.boundingSphere) disc.geometry.computeBoundingSphere();
      const rad = disc.geometry.boundingSphere.radius * disc.scale.x;
      const t = grassMap.clone();
      t.needsUpdate = true;
      t.repeat.set(rad / 6, rad / 6);
      disc.material = new THREE.MeshStandardMaterial({ map: t, roughness: 0.92 });
      disc.receiveShadow = true;
    }
  }

  if (prof.asphalt) paintKartAsphalt(scene);
  roundOffLowPolyCanopies(scene);
  scene.traverse((o) => { if (/^(neon-checkpoint|mk8-edge-glow)/.test(o.name || '')) o.visible = false; });
  if (grassMap) {
    const verge = scene.getObjectByName('roadside-verge');
    if (verge?.isMesh) {
      const pos = verge.geometry.attributes.position;
      const uv = [];
      for (let i = 0; i < pos.count; i++) uv.push(pos.getX(i) / 12, pos.getZ(i) / 12);
      verge.geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      const t = grassMap.clone();
      t.needsUpdate = true;
      t.repeat.set(1, 1);
      verge.material = new THREE.MeshStandardMaterial({ map: t, roughness: 0.92 });
    }
  }

  const startP = curve.getPointAt(((startT % 1) + 1) % 1);
  const okSpot = (x, z, pad) => clear.dist(x, z) > roadHw + pad
    && Math.hypot(x - startP.x, z - startP.z) > 16;

  // Foliage along the circuit
  if (prof.trees === 'lush' || prof.flowers) {
    const forest = makeForest(root, trackId);
    if (prof.trees === 'lush') {
      let placed = 0;
      for (let k = 0; k < 900 && placed < Math.round(70 * dens); k++) {
        const t = r();
        const p = curve.getPointAt(t);
        const tan = curve.getTangentAt(t);
        const side = r() < 0.5 ? -1 : 1;
        const off = roadHw + 10 + Math.pow(r(), 0.7) * 34;
        const x = p.x - tan.z * off * side;
        const z = p.z + tan.x * off * side;
        const size = 1.8 + r() * 1.6;
        if (!okSpot(x, z, 7 + size * 1.5)) continue;
        forest.addTree(x, clear.minY - 0.3, z, size, r, r() < prof.blossom);
        placed++;
      }
      // A thick tree line on the outer rim, like the forested banks of a real circuit
      for (let k = 0; k < Math.round(90 * dens); k++) {
        const a = (k / 90) * Math.PI * 2 + r() * 0.05;
        const rad = c.radius + 26 + r() * 14;
        const x = c.cx + Math.cos(a) * rad, z = c.cz + Math.sin(a) * rad;
        if (!okSpot(x, z, 12)) continue;
        forest.addTree(x, clear.minY - 0.3, z, 2.6 + r() * 2.2, r, r() < prof.blossom * 0.5);
      }
    }
    if (prof.flowers) {
      const cols = [0xff4d5e, 0xffd23f, 0xff7ab8, 0xffffff, 0xff8c42];
      let placed = 0;
      for (let k = 0; k < 600 && placed < Math.round(prof.flowers * dens); k++) {
        const t = r();
        const p = curve.getPointAt(t);
        const tan = curve.getTangentAt(t);
        const side = r() < 0.5 ? -1 : 1;
        const off = roadHw + 6.5 + r() * 4;
        const x = p.x - tan.z * off * side;
        const z = p.z + tan.x * off * side;
        if (!okSpot(x, z, 5.8)) continue;
        forest.addBush(x, p.y - 0.05, z, 0.8 + r() * 0.5, r, cols[Math.floor(r() * cols.length)]);
        placed++;
      }
    }
    forest.finish();
  }
  if (prof.trees === 'pine') {
    const pines = makePines(root);
    for (let k = 0; k < 900; k++) {
      const t = r();
      const p = curve.getPointAt(t);
      const tan = curve.getTangentAt(t);
      const side = r() < 0.5 ? -1 : 1;
      const off = roadHw + 10 + Math.pow(r(), 0.6) * 40;
      const x = p.x - tan.z * off * side, z = p.z + tan.x * off * side;
      if (!okSpot(x, z, 8)) continue;
      pines.add(x, clear.minY - 0.3, z, 1.1 + r() * 1.0);
      if (k > 400) break;
    }
    pines.finish();
  }

  scheduleTreeSwap(scene, root, trackId, prof);

  // Balloons drifting above the course
  const balloons = [];
  const balloonCount = Math.max(1, Math.round((prof.balloons || 0) * (dens < 0.5 ? 0.5 : 1)));
  for (let i = 0; i < (prof.balloons ? balloonCount : 0); i++) {
    const b = buildBalloon(BALLOON_SCHEMES[i % BALLOON_SCHEMES.length]);
    const a = (i / balloonCount) * Math.PI * 2 + r() * 0.6;
    const rad = c.radius * (0.55 + r() * 0.8) + 10;
    const s = 1.4 + r() * 0.9;
    b.scale.setScalar(s);
    b.position.set(c.cx + Math.cos(a) * rad, center.y + 38 + r() * 34, c.cz + Math.sin(a) * rad);
    b.userData.baseY = b.position.y;
    b.userData.phase = r() * 10;
    b.name = 'mk8-balloon';
    root.add(b);
    balloons.push(b);
  }
  if (balloons.length) {
    // Gentle bob + spin, driven off the first balloon's render callback
    const driver = balloons[0].children[0];
    driver.onBeforeRender = () => {
      const t = performance.now() * 0.001;
      balloons.forEach((b) => {
        b.position.y = b.userData.baseY + Math.sin(t * 0.35 + b.userData.phase) * 2.2;
        b.rotation.y = t * 0.05 + b.userData.phase;
      });
    };
  }

  scene.userData.mk8Showcase = trackId;
  // If a device still struggles, the lab calls these to drop the costliest extras
  (scene.userData.perfShedders ||= []).push(() => {
    root.traverse((o) => {
      if (/^mk8-(clouds|balloon|palm-nuts)/.test(o.name)) o.visible = false;
      if (/^mk8-foliage|^mk8-trunks|^mk8-pines|^mk8-palm/.test(o.name)) o.castShadow = false;
    });
  });
  scene.userData.mk8PhotoSkyId = prof.photoSky || null;
  applyPhotoSurfaces(scene, root, {
    ground: prof.ground || 'grass',
    asphalt: !!prof.asphalt,
    topTint: prof.hills === 'snow' ? 0xffffff : prof.hills === 'desert' ? 0xf0cf8c : 0x7cc247,
  }).catch((e) => console.warn('[MK8Photo] surfaces failed', e));
  // Brighter, cleaner daylight exposure to match the painted sky
  scene.userData.expMood = 1.08;
  console.log('[MK8Showcase]', trackId, { objects: root.children.length });
  return root;
}

// ── Swap the blocky low-poly glTF trees for lush clumpy ones as they stream in ──
const BLOCKY_TREE = /^tree_(fat|oak|default|detailed|simple|tall|blocks|small|plateau|thin|cone)/i;
const PINE_RE = /^(tree_pine|prop-snow-pine|prop-start-pine|prop-pine|gltf-start-pine|gltf-pine)/i;
const BLOCKY_PALM = /^(tree_palm|prop-palm|prop-start-palm|gltf-.*palm)/i;

function ancestorsVisible(o) {
  for (let q = o.parent; q; q = q.parent) if (!q.visible) return false;
  return true;
}
const BLOCKY_ROCK = /^cliff_(large|block|blockHalf|blockQuarter|cave|corner|half|steps|top|waterfall)/i;

function scheduleTreeSwap(scene, root, trackId, prof) {
  const forest = { list: [] };
  const palms = { list: [], meshes: [] };
  const pines = { list: [], meshes: [] };
  const rebuildPines = () => {
    pines.meshes.forEach((m) => m.removeFromParent());
    const g = new THREE.Group();
    const pb = makePines(g);
    pines.list.forEach((p) => pb.add(p.x, p.y, p.z, p.s));
    pb.finish();
    pines.meshes = [...g.children];
    pines.meshes.forEach((m) => root.add(m));
  };
  const rebuildPalms = () => {
    palms.meshes.forEach((m) => m.removeFromParent());
    const g = new THREE.Group();
    const r = rng(palms.list.length * 17 + 3);
    buildPalmGrove(g, palms.list, r);
    palms.meshes = [...g.children];
    palms.meshes.forEach((m) => root.add(m));
  };
  const seen = new WeakSet();
  let lastScan = 0, scans = 0, mesh = null;
  const rebuild = () => {
    if (mesh) mesh.forEach((m) => m.removeFromParent());
    const g = new THREE.Group();
    const f = makeForest(g, `${trackId}-swap`);
    const r = rng(forest.list.length * 31 + 5);
    forest.list.forEach((p) => f.addTree(p.x, p.y, p.z, p.s, r, r() < prof.blossom));
    f.finish();
    mesh = [...g.children];
    mesh.forEach((m) => root.add(m));
  };
  // An invisible triangle gives a per-frame hook without touching the render loop
  const hookGeo = new THREE.BufferGeometry();
  hookGeo.setAttribute('position', new THREE.Float32BufferAttribute([0, -500, 0, 0.001, -500, 0, 0, -500, 0.001], 3));
  const hook = new THREE.Mesh(hookGeo, new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false }));
  hook.frustumCulled = false;
  hook.name = 'mk8-tree-swap-hook';
  hook.onBeforeRender = () => {
    const now = performance.now();
    if (now - lastScan < 600 || scans > 40) return;
    lastScan = now;
    scans++;
    let found = 0, palmFound = 0, pineFound = 0;
    const box = new THREE.Box3(), size = new THREE.Vector3(), ctr = new THREE.Vector3();
    scene.traverse((o) => {
      if (!o.visible || seen.has(o)) return;
      if (BLOCKY_ROCK.test(o.name || '')) { seen.add(o); o.visible = false; return; }
      if (prof.liftRocks && o.isMesh && /^Mesh_(rock|stone)_/.test(o.name || '') && o.material?.color) {
        // Sun-bounced sandstone: stop the shaded faces reading as black slabs
        seen.add(o);
        o.material = o.material.clone();
        o.material.emissive = o.material.color.clone().multiplyScalar(0.32);
        o.material.flatShading = false;
        o.material.needsUpdate = true;
        return;
      }
      if (prof.hide && prof.hide.test(o.name || '')) { seen.add(o); o.visible = false; return; }
      if ((/^theme-gate-/.test(o.name || '') || o.name === 'balloon-star-arch') && !o.isMesh) {
        seen.add(o);
        o.visible = false;
        root.add(buildStartGantry(scene, o));
        return;
      }
      if (prof.replacePines && PINE_RE.test(o.name || '') && !o.isMesh && ancestorsVisible(o)) {
        seen.add(o);
        box.setFromObject(o);
        if (box.isEmpty()) return;
        box.getSize(size);
        box.getCenter(ctr);
        o.visible = false;
        pines.list.push({ x: ctr.x, y: box.min.y, z: ctr.z, s: Math.max(0.9, Math.min(2.4, size.y / 5.2)) });
        pineFound++;
        return;
      }
      if (prof.replacePalms && BLOCKY_PALM.test(o.name || '') && ancestorsVisible(o)) {
        seen.add(o);
        box.setFromObject(o);
        if (box.isEmpty()) return;
        box.getSize(size);
        box.getCenter(ctr);
        o.visible = false;
        palms.list.push({ x: ctr.x, y: box.min.y, z: ctr.z, h: Math.max(5, Math.min(11, size.y * 1.05)) });
        palmFound++;
        return;
      }
      if (o.isMesh) return;
      if (!prof.replaceTrees || !BLOCKY_TREE.test(o.name || '') || !ancestorsVisible(o)) return;
      seen.add(o);
      box.setFromObject(o);
      if (box.isEmpty()) return;
      box.getSize(size);
      box.getCenter(ctr);
      o.visible = false;
      forest.list.push({ x: ctr.x, y: box.min.y, z: ctr.z, s: Math.max(1.4, Math.min(3.6, size.y * 0.3)) });
      found++;
    });
    if (found) rebuild();
    if (palmFound) rebuildPalms();
    if (pineFound) rebuildPines();
    if (prof.water) upgradeWater(scene);
  };
  root.add(hook);
}

// ── Rainbow Road: night-sky nebula, cloud sea below, star lamp-posts with banners ──
function cosmicSky(scene, center) {
  const mat = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: /* glsl */`
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */`
      varying vec3 vDir;
      float h(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
      float n(vec3 p) {
        vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(mix(h(i), h(i + vec3(1,0,0)), f.x), mix(h(i + vec3(0,1,0)), h(i + vec3(1,1,0)), f.x), f.y),
                   mix(mix(h(i + vec3(0,0,1)), h(i + vec3(1,0,1)), f.x), mix(h(i + vec3(0,1,1)), h(i + vec3(1,1,1)), f.x), f.y), f.z);
      }
      float fbm(vec3 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 5; i++) { s += a * n(p); p *= 2.07; a *= 0.5; } return s; }
      void main() {
        vec3 d = normalize(vDir);
        vec3 col = mix(vec3(0.01, 0.02, 0.06), vec3(0.03, 0.05, 0.14), smoothstep(-0.6, 0.1, d.y));
        col = mix(col, vec3(0.01, 0.02, 0.07), smoothstep(0.1, 0.9, d.y));
        float neb = fbm(d * 2.4 + vec3(3.1, 0.0, 1.7));
        float neb2 = fbm(d * 4.8 + vec3(9.0, 2.0, 5.0));
        col += vec3(0.42, 0.14, 0.52) * smoothstep(0.52, 0.85, neb) * 0.28;
        col += vec3(0.10, 0.30, 0.75) * smoothstep(0.5, 0.85, neb2) * 0.3;
        col += vec3(1.0, 0.55, 0.35) * pow(smoothstep(0.62, 0.9, neb * neb2 * 1.8), 2.0) * 0.18;
        vec3 cell = floor(d * 380.0);
        float st = step(0.9965, h(cell));
        float tw = 0.6 + 0.4 * h(cell + 7.0);
        col += vec3(st * tw);
        vec3 cell2 = floor(d * 120.0);
        col += vec3(0.8, 0.9, 1.0) * step(0.9992, h(cell2)) * 1.6;
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
  });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1800, 48, 24), mat);
  dome.name = 'mk8-cosmic-sky';
  dome.renderOrder = -40;
  dome.frustumCulled = false;
  dome.position.set(center.cx, center.y, center.cz);
  // Keep the sky centred on the camera so the track can never run out of it
  dome.onBeforeRender = (renderer, sc, cam) => { dome.position.copy(cam.position); dome.updateMatrixWorld(); };
  scene.add(dome);
  scene.background = new THREE.Color(0x050818);
  scene.fog = null;
  return dome;
}

function starShape(outer, inner) {
  const sh = new THREE.Shape();
  for (let k = 0; k < 10; k++) {
    const r = k % 2 ? inner : outer;
    const a = (k / 10) * Math.PI * 2 + Math.PI / 2;
    if (k === 0) sh.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else sh.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  sh.closePath();
  return sh;
}

function bannerTexture() {
  // Rainbow pennant: seven bright stripes, a gold star and a pointed tail
  return canvasTexture(128, 256, (ctx, w, h) => {
    const lanes = ['#ff3b3b', '#ff9a2e', '#ffe44a', '#4cff7a', '#3ad6ff', '#4d6bff', '#b04dff'];
    ctx.fillStyle = '#1b1240';
    ctx.fillRect(0, 0, w, h);
    const sw = (w - 16) / lanes.length;
    lanes.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(8 + i * sw, 8, sw + 0.5, h - 56); });
    ctx.fillStyle = '#ffd35a';
    ctx.beginPath();
    for (let k = 0; k < 10; k++) {
      const r = k % 2 ? 13 : 30;
      const a = -Math.PI / 2 + (k * Math.PI) / 5;
      ctx.lineTo(w / 2 + Math.cos(a) * r, 92 + Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, w - 12, h - 52);
    ctx.fillStyle = '#ffd35a';
    ctx.beginPath();
    ctx.moveTo(6, h - 46); ctx.lineTo(w / 2, h); ctx.lineTo(w - 6, h - 46); ctx.closePath();
    ctx.fill();
  });
}

function applyRainbowShowcase(scene, curve, roadHw, trackId) {
  scene.getObjectByName('mk8-showcase')?.removeFromParent();
  const root = new THREE.Group();
  root.name = 'mk8-showcase';
  scene.add(root);
  const clear = makeClearance(curve, 700);
  const c = trackCenter(clear.pts);
  const center = { ...c, y: clear.minY };
  const r = rng(99);
  root.add(cosmicSky(scene, center));

  // Glowing cloud sea far below the road
  const geo = makeBlobGeometry(5.3, { lump: 0.14, freq: 1.5, aoLow: 0.55, detail: 2 });
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0x8ea4e8, vertexColors: true, roughness: 1,
    emissive: new THREE.Color(0x1a2466), emissiveIntensity: 0.8, fog: false,
  });
  const puffs = [];
  const span = c.radius + 260;
  for (let i = 0; i < 170; i++) {
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * span;
    puffs.push({ x: c.cx + Math.cos(a) * d, z: c.cz + Math.sin(a) * d, y: center.y - 70 - r() * 50, s: 22 + r() * 30 });
  }
  const cloud = new THREE.InstancedMesh(geo, cloudMat, puffs.length);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion();
  puffs.forEach((p, i) => {
    q.setFromEuler(new THREE.Euler(0, r() * 6.28, 0));
    m.compose(new THREE.Vector3(p.x, p.y, p.z), q, new THREE.Vector3(p.s, p.s * 0.55, p.s));
    cloud.setMatrixAt(i, m);
  });
  cloud.name = 'mk8-cloud-sea';
  cloud.frustumCulled = false;
  root.add(cloud);
  // Soft moonlight so the cloud tops read
  const moon = new THREE.DirectionalLight(0xb8c8ff, 0.55);
  moon.position.set(c.cx + 200, center.y + 300, c.cz - 150);
  moon.target.position.set(c.cx, center.y - 80, c.cz);
  root.add(moon, moon.target);

  // Star lamp-posts with hanging banners on both edges
  const len = curve.getLength();
  const step = 24;
  const n = Math.floor(len / step);
  const poleGeo = new THREE.CylinderGeometry(0.09, 0.13, 5.2, 8);
  poleGeo.translate(0, 2.6, 0);
  const armGeo = new THREE.BoxGeometry(1.5, 0.08, 0.08);
  armGeo.translate(-0.75, 4.6, 0);
  const starGeo = new THREE.ExtrudeGeometry(starShape(0.62, 0.27), { depth: 0.16, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 2 });
  starGeo.center();
  starGeo.translate(0, 5.65, 0);
  const bannerGeo = new THREE.PlaneGeometry(0.95, 1.9);
  bannerGeo.translate(-1.05, 3.55, 0);
  const metal = new THREE.MeshStandardMaterial({ color: 0xf2c65a, metalness: 0.85, roughness: 0.25, emissive: 0x5a3a08, emissiveIntensity: 0.35 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xffd35a, emissive: 0xffb020, emissiveIntensity: 1.2, metalness: 0.4, roughness: 0.35 });
  const bannerMat = new THREE.MeshStandardMaterial({ map: bannerTexture(), side: THREE.DoubleSide, roughness: 0.7, emissive: 0x2a2440, emissiveIntensity: 0.4 });
  const poles = new THREE.InstancedMesh(poleGeo, metal, n * 2);
  const arms = new THREE.InstancedMesh(armGeo, metal, n * 2);
  const stars = new THREE.InstancedMesh(starGeo, gold, n * 2);
  const banners = new THREE.InstancedMesh(bannerGeo, bannerMat, n * 2);
  let k = 0;
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const p = curve.getPointAt(t), tan = curve.getTangentAt(t);
    const yaw = Math.atan2(tan.x, tan.z);
    for (const side of [-1, 1]) {
      const off = roadHw + 1.1;
      const x = p.x + tan.z * off * side, z = p.z - tan.x * off * side;
      // arm points in over the road
      q.setFromEuler(new THREE.Euler(0, yaw + (side > 0 ? 0 : Math.PI) + Math.PI / 2, 0));
      m.compose(new THREE.Vector3(x, p.y, z), q, new THREE.Vector3(1, 1, 1));
      poles.setMatrixAt(k, m); arms.setMatrixAt(k, m); banners.setMatrixAt(k, m);
      const sq = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw + Math.PI / 2, 0));
      m.compose(new THREE.Vector3(x, p.y, z), sq, new THREE.Vector3(1, 1, 1));
      stars.setMatrixAt(k, m);
      k++;
    }
  }
  [poles, arms, stars, banners].forEach((im, j) => {
    im.count = k;
    im.name = ['mk8-lamp-poles', 'mk8-lamp-arms', 'mk8-lamp-stars', 'mk8-lamp-banners'][j];
    root.add(im);
  });
  // Stop the old small space box poking through as a hard-edged sphere
  scene.traverse((o) => {
    if (o.isMesh && o.material?.side === THREE.BackSide && o !== scene.getObjectByName('mk8-cosmic-sky')) {
      if (o.geometry?.boundingSphere == null) o.geometry?.computeBoundingSphere?.();
      if ((o.geometry?.boundingSphere?.radius ?? 0) > 60) o.visible = false;
    }
  });
  restyleRainbowRoad(scene, root, curve, roadHw);
  scene.userData.mk8Showcase = trackId;
  console.log('[MK8Showcase] rainbow', { lamps: k });
  return root;
}

// ── Palm trees: curved ringed trunk + drooping feathery fronds + coconuts ─────
let _palmAssets = null;
function palmAssets() {
  if (_palmAssets) return _palmAssets;
  // trunk: 12 segments along a gentle S-bend, 1 unit tall (scaled per palm)
  const bend = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.05, 0.35, 0), new THREE.Vector3(0.16, 0.7, 0), new THREE.Vector3(0.3, 1, 0),
  ]);
  const trunk = new THREE.TubeGeometry(bend, 24, 0.045, 10, false);
  const pos = trunk.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const t = v.y;
    const p = bend.getPointAt(Math.min(1, Math.max(0, t)));
    const dx = v.x - p.x, dz = v.z - p.z;
    // taper + ring bumps
    const k = (1.25 - t * 0.45) * (1 + 0.1 * Math.max(0, Math.sin(t * 90)));
    pos.setXYZ(i, p.x + dx * k, v.y, p.z + dz * k);
  }
  trunk.computeVertexNormals();
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0xa88560, roughness: 0.9 });
  new THREE.TextureLoader().load(`${import.meta.env?.BASE_URL || '/'}assets/tracks/_pbr/bark_brown_02_diff.jpg`, (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1, 6);
    trunkMat.map = t;
    trunkMat.color.setHex(0xe8d2b0);
    trunkMat.needsUpdate = true;
  });

  // frond: strip along +x, drooping, with leaflet texture
  const frond = new THREE.PlaneGeometry(1, 0.34, 14, 1);
  frond.translate(0.5, 0, 0);
  const fp = frond.attributes.position;
  for (let i = 0; i < fp.count; i++) {
    const x = fp.getX(i), y = fp.getY(i);
    const w = Math.sin(Math.min(1, x) * Math.PI) * 0.9 + 0.1; // narrow at tip and base
    fp.setXYZ(i, x, -x * x * 0.55 + Math.abs(y) * 0.25, y * w);
  }
  frond.computeVertexNormals();
  const c = document.createElement('canvas');
  c.width = 512; c.height = 128;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, 512, 128);
  ctx.strokeStyle = '#6b8a2a'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(0, 64); ctx.lineTo(512, 64); ctx.stroke();
  for (let i = 4; i < 500; i += 9) {
    const L = 58 * Math.sin((i / 512) * Math.PI) + 6;
    for (const sgn of [-1, 1]) {
      const g = ctx.createLinearGradient(i, 64, i + 26, 64 + sgn * L);
      g.addColorStop(0, '#3f7d22'); g.addColorStop(1, '#8fc74a');
      ctx.strokeStyle = g; ctx.lineWidth = 5.5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(i, 64); ctx.quadraticCurveTo(i + 8, 64 + sgn * L * 0.5, i + 24, 64 + sgn * L); ctx.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  const frondMat = new THREE.MeshStandardMaterial({ map: tex, alphaTest: 0.35, side: THREE.DoubleSide, roughness: 0.75 });
  const nut = new THREE.SphereGeometry(0.06, 10, 8);
  const nutMat = new THREE.MeshStandardMaterial({ color: 0x5a3a1c, roughness: 0.6 });
  _palmAssets = { trunk, trunkMat, frond, frondMat, nut, nutMat, bend };
  return _palmAssets;
}

function buildPalmGrove(group, list, r) {
  if (!list.length) return;
  const A = palmAssets();
  const FR = 9;
  const trunks = new THREE.InstancedMesh(A.trunk, A.trunkMat, list.length);
  const fronds = new THREE.InstancedMesh(A.frond, A.frondMat, list.length * FR);
  const nuts = new THREE.InstancedMesh(A.nut, A.nutMat, list.length * 3);
  const m = new THREE.Matrix4(), base = new THREE.Matrix4(), local = new THREE.Matrix4();
  const q = new THREE.Quaternion(), s = new THREE.Vector3();
  const top = A.bend.getPointAt(1);
  list.forEach((p, i) => {
    const yaw = r() * Math.PI * 2;
    q.setFromEuler(new THREE.Euler(0, yaw, 0));
    s.set(p.h, p.h, p.h);
    base.compose(new THREE.Vector3(p.x, p.y, p.z), q, s);
    trunks.setMatrixAt(i, base);
    for (let k = 0; k < FR; k++) {
      const a = (k / FR) * Math.PI * 2 + r() * 0.3;
      const tilt = 0.25 + r() * 0.35;
      local.compose(
        new THREE.Vector3(top.x, top.y, top.z),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(0, a, tilt, 'YXZ')),
        new THREE.Vector3(0.42 + r() * 0.12, 0.42, 0.42 + r() * 0.1),
      );
      m.multiplyMatrices(base, local);
      fronds.setMatrixAt(i * FR + k, m);
    }
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2;
      local.makeTranslation(top.x + Math.cos(a) * 0.05, top.y - 0.04, top.z + Math.sin(a) * 0.05);
      m.multiplyMatrices(base, local);
      nuts.setMatrixAt(i * 3 + k, m);
    }
  });
  [trunks, fronds, nuts].forEach((im, j) => {
    im.castShadow = true;
    im.receiveShadow = j !== 1;
    im.name = ['mk8-palm-trunks', 'mk8-palm-fronds', 'mk8-palm-nuts'][j];
    group.add(im);
  });
}

// ── Water: glassy, sky-reflecting, gently rippling ───────────────────────────
let _waterNormal = null;
function waterNormalTexture() {
  if (_waterNormal) return _waterNormal;
  const N = 256;
  const h = new Float32Array(N * N);
  const waves = [[1, 2, 0.5], [3, 1, 0.3], [2, 5, 0.18], [6, 3, 0.12], [9, 7, 0.07], [13, 4, 0.05]];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    let v = 0;
    waves.forEach(([a, b, amp], i) => { v += amp * Math.sin(((a * x + b * y) / N) * Math.PI * 2 + i * 1.7); });
    h[y * N + x] = v;
  }
  const c = document.createElement('canvas');
  c.width = c.height = N;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(N, N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const dx = h[y * N + ((x + 1) % N)] - h[y * N + ((x - 1 + N) % N)];
    const dy = h[((y + 1) % N) * N + x] - h[((y - 1 + N) % N) * N + x];
    const n = new THREE.Vector3(-dx * 3, -dy * 3, 1).normalize();
    const o = (y * N + x) * 4;
    img.data[o] = (n.x * 0.5 + 0.5) * 255;
    img.data[o + 1] = (n.y * 0.5 + 0.5) * 255;
    img.data[o + 2] = (n.z * 0.5 + 0.5) * 255;
    img.data[o + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  _waterNormal = new THREE.CanvasTexture(c);
  _waterNormal.wrapS = _waterNormal.wrapT = THREE.RepeatWrapping;
  return _waterNormal;
}

const WATER_NAME = /^(ocean-plane|track-beach-wet|water|lake|pond|river|sea)/i;
function upgradeWater(scene) {
  scene.traverse((o) => {
    if (!o.isMesh || o.userData.mk8Water) return;
    let named = false;
    for (let q = o; q && !q.isScene; q = q.parent) if (WATER_NAME.test(q.name || '')) { named = true; break; }
    if (!named) return;
    const old = o.material;
    const col = old?.color?.clone() || new THREE.Color(0x1aa6b8);
    const nrm = waterNormalTexture().clone();
    nrm.needsUpdate = true;
    if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere();
    const rep = Math.max(2, (o.geometry.boundingSphere.radius * 2) / 14);
    nrm.repeat.set(rep, rep);
    const mat = new THREE.MeshPhysicalMaterial({
      color: col.lerp(new THREE.Color(0x06647e), 0.8),
      roughness: 0.04,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      normalMap: nrm,
      normalScale: new THREE.Vector2(0.5, 0.5),
      envMapIntensity: 1.6,
      emissive: new THREE.Color(0x02262e),
      emissiveIntensity: 0.1,
      polygonOffset: old?.polygonOffset ?? false,
      polygonOffsetFactor: old?.polygonOffsetFactor ?? 0,
      polygonOffsetUnits: old?.polygonOffsetUnits ?? 0,
    });
    o.material = mat;
    o.userData.mk8Water = true;
    o.receiveShadow = true;
    o.castShadow = false;
    o.onBeforeRender = () => {
      const t = performance.now() * 0.00002;
      nrm.offset.set(t * 1.3, t * 0.8);
    };
  });
}

// ── Console-kart start gantry: truss pillars, checkered START banner, start lights ──
function gantryBannerTexture() {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 192;
  const ctx = c.getContext('2d');
  const sq = 24;
  for (let y = 0; y < 192; y += sq) for (let x = 0; x < 1024; x += sq) {
    ctx.fillStyle = ((x + y) / sq) % 2 ? '#111' : '#fafafa';
    ctx.fillRect(x, y, sq, sq);
  }
  const g = ctx.createLinearGradient(0, 36, 0, 156);
  g.addColorStop(0, '#e83a3a'); g.addColorStop(1, '#b01e24');
  ctx.fillStyle = g;
  ctx.fillRect(200, 30, 624, 132);
  ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 8; ctx.strokeRect(204, 34, 616, 124);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'italic 900 96px Arial Black, Arial, sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 5;
  ctx.fillText('START', 512, 100);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function buildStartGantry(scene, oldGate, curveOverride = null, hwOverride = null) {
  const g = new THREE.Group();
  g.name = 'mk8-start-gantry';
  const box = new THREE.Box3().setFromObject(oldGate);
  const ctr = box.getCenter(new THREE.Vector3());
  const curve = curveOverride || scene.userData.raceCurve;
  const hw = hwOverride || scene.userData._raceClearHalfWidth || 4.5;
  let tan = new THREE.Vector3(0, 0, 1);
  let base = new THREE.Vector3(ctr.x, box.min.y, ctr.z);
  if (curve) {
    let bestT = 0, best = Infinity;
    for (let i = 0; i <= 400; i++) {
      const p = curve.getPointAt(i / 400);
      const d = (p.x - ctr.x) ** 2 + (p.z - ctr.z) ** 2;
      if (d < best) { best = d; bestT = i / 400; }
    }
    const p = curve.getPointAt(bestT);
    tan = curve.getTangentAt(bestT).setY(0).normalize();
    base = new THREE.Vector3(p.x, p.y, p.z);
  }
  const span = hw * 2 + 4.2;
  const H = 7.2;
  const metal = new THREE.MeshStandardMaterial({ color: 0xd9dee6, metalness: 0.8, roughness: 0.28 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x23272f, metalness: 0.5, roughness: 0.45 });
  const red = new THREE.MeshStandardMaterial({ color: 0xd62a2a, metalness: 0.3, roughness: 0.35 });
  const pillarGeo = new THREE.BoxGeometry(0.9, H, 0.9);
  for (const side of [-1, 1]) {
    const pil = new THREE.Group();
    const core = new THREE.Mesh(pillarGeo, metal);
    core.position.y = H / 2;
    pil.add(core);
    // red wrap bands + dark foot
    for (let k = 0; k < 3; k++) {
      const band = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.35, 0.98), red);
      band.position.y = 1.4 + k * 2.1;
      pil.add(band);
    }
    const foot = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 1.4), dark);
    foot.position.y = 0.25;
    pil.add(foot);
    pil.position.x = side * span / 2;
    g.add(pil);
  }
  const beam = new THREE.Mesh(new THREE.BoxGeometry(span + 0.9, 2.2, 0.8), dark);
  beam.position.y = H + 0.6;
  g.add(beam);
  const bannerMat = new THREE.MeshStandardMaterial({ map: gantryBannerTexture(), roughness: 0.5, emissive: 0xffffff, emissiveIntensity: 0.12 });
  bannerMat.emissiveMap = bannerMat.map;
  for (const side of [-1, 1]) {
    const banner = new THREE.Mesh(new THREE.PlaneGeometry(span + 0.6, 2.0), bannerMat);
    banner.position.set(0, H + 0.6, side * 0.42);
    if (side < 0) banner.rotation.y = Math.PI;
    g.add(banner);
  }
  // start lights under the beam
  const bulbGeo = new THREE.SphereGeometry(0.26, 16, 12);
  const bulbMat = new THREE.MeshStandardMaterial({ color: 0x400808, emissive: 0xff2a1a, emissiveIntensity: 1.6 });
  const housing = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.8, 0.6), dark);
  housing.position.y = H - 0.9;
  g.add(housing);
  for (let k = 0; k < 5; k++) {
    for (const side of [-1, 1]) {
      const b = new THREE.Mesh(bulbGeo, bulbMat);
      b.position.set(-1.4 + k * 0.7, H - 0.9, side * 0.3);
      g.add(b);
    }
  }
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  g.position.copy(base);
  g.rotation.y = Math.atan2(tan.x, tan.z);
  return g;
}

// ── Night worlds: Space Station (nebula) and Volcano Run (smoky ember sky) ────
function volcanoSky(scene, center) {
  const mat = new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    vertexShader: /* glsl */`
      varying vec3 vDir;
      void main() { vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: /* glsl */`
      uniform float time;
      varying vec3 vDir;
      float h(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
      float n(vec3 p) {
        vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
        return mix(mix(mix(h(i), h(i + vec3(1,0,0)), f.x), mix(h(i + vec3(0,1,0)), h(i + vec3(1,1,0)), f.x), f.y),
                   mix(mix(h(i + vec3(0,0,1)), h(i + vec3(1,0,1)), f.x), mix(h(i + vec3(0,1,1)), h(i + vec3(1,1,1)), f.x), f.y), f.z);
      }
      float fbm(vec3 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 5; i++) { s += a * n(p); p *= 2.03; a *= 0.5; } return s; }
      void main() {
        vec3 d = normalize(vDir);
        float hgt = d.y;
        vec3 col = mix(vec3(0.55, 0.16, 0.04), vec3(0.08, 0.04, 0.05), smoothstep(-0.05, 0.55, hgt));
        float smoke = fbm(d * 3.0 + vec3(time * 0.02, 0.0, time * 0.015));
        float smoke2 = fbm(d * 7.0 - vec3(time * 0.03, 0.0, 0.0));
        vec3 smokeCol = mix(vec3(0.10, 0.07, 0.07), vec3(0.32, 0.16, 0.10), smoothstep(0.1, -0.1, hgt - 0.25));
        col = mix(col, smokeCol, smoothstep(0.42, 0.72, smoke) * 0.85);
        col += vec3(1.0, 0.35, 0.08) * pow(max(0.0, 1.0 - abs(hgt) * 5.0), 3.0) * 0.55;
        col += vec3(1.0, 0.45, 0.12) * step(0.9975, h(floor(d * 260.0))) * smoothstep(0.35, 0.0, hgt) * (0.6 + 0.4 * sin(time * 3.0 + h(floor(d * 260.0)) * 40.0));
        col *= 0.85 + smoke2 * 0.3;
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
  });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1800, 48, 24), mat);
  dome.name = 'mk8-volcano-sky';
  dome.renderOrder = -40;
  dome.frustumCulled = false;
  dome.onBeforeRender = (renderer, sc, cam) => {
    dome.position.copy(cam.position);
    dome.updateMatrixWorld();
    mat.uniforms.time.value = performance.now() * 0.001;
  };
  scene.background = new THREE.Color(0x1a0806);
  scene.fog = new THREE.Fog(0x3a1208, 120, 700);
  return dome;
}

function applyNightShowcase(scene, curve, trackId, prof) {
  const root = new THREE.Group();
  root.name = 'mk8-showcase';
  scene.add(root);
  const clear = makeClearance(curve, 300);
  const c = trackCenter(clear.pts);
  const center = { ...c, y: clear.minY };
  // Hide the old flat sky dome / painted backdrops
  ['track-sky-dome', 'track-starfield', 'track-nebula'].forEach((n) => {
    scene.traverse((o) => { if (o.name === n) o.visible = false; });
  });
  root.add(prof.night === 'space' ? cosmicSky(scene, center) : volcanoSky(scene, center));
  scene.userData.mk8Showcase = trackId;
  scene.userData.mk8PhotoSkyId = null;
  scheduleTreeSwap(scene, root, trackId, prof);
  console.log('[MK8Showcase] night', trackId, prof.night);
  return root;
}

// ── Rainbow Road restyle: glassy pastel tiles, crystal rails, tidy start ─────
function rainbowRoadMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 } },
    transparent: false,
    depthWrite: true,
    side: THREE.DoubleSide,
    vertexShader: /* glsl */`
      varying vec2 vUv;
      varying vec3 vWorld;
      void main() {
        vUv = uv;
        vec4 w = modelMatrix * vec4(position, 1.0);
        vWorld = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */`
      uniform float time;
      varying vec2 vUv;
      varying vec3 vWorld;
      float h(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      vec3 hsv(float hh, float s, float v) {
        vec3 k = clamp(abs(mod(hh * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
        return v * mix(vec3(1.0), k, s);
      }
      void main() {
        // Seven smooth rainbow lanes running along the road
        float bandPos = vUv.x * 7.0;
        float band = floor(bandPos);
        float f = fract(bandPos);
        vec3 col = hsv(band / 6.0 * 0.8, 0.9, 1.0);
        // lanes are brighter in the middle, like rounded glass
        col *= 0.84 + 0.18 * (1.0 - abs(f - 0.5) * 2.0);
        // light pulses flowing forward along the lap
        float flow = sin((vUv.y * 0.12 - time * 0.8) * 6.2831);
        col += mix(col, vec3(1.0), 0.5) * smoothstep(0.88, 1.0, flow) * 0.35;
        // dark grooves between lanes so every stripe stays crisp
        float groove = 1.0 - smoothstep(0.0, 0.08, min(f, 1.0 - f));
        col = mix(col, col * 0.35, groove * 0.75);
        // twinkling stardust
        vec2 sg = vec2(vUv.x * 30.0, vUv.y * 5.5);
        vec2 sp = floor(sg);
        vec2 sf = fract(sg) - 0.5;
        float star = smoothstep(0.12, 0.0, length(sf * vec2(1.0, 1.6)));
        float spark = step(0.98, h(sp)) * star * (0.5 + 0.5 * sin(time * 4.0 + h(sp + 3.0) * 30.0));
        col += vec3(1.0) * spark * 1.2;
        // bright white rails painted along both edges
        float border = 1.0 - smoothstep(0.0, 0.035, min(vUv.x, 1.0 - vUv.x));
        col = mix(col, vec3(1.0, 0.96, 1.0) * 1.6, border);
        col *= 1.12; // a touch over 1 so the bloom pass makes the lanes glow
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }`,
    toneMapped: false,
  });
}

// race-start-gantry: the rainbow arch is Rainbow Road's start gate, so the red START gantry
// (and the checker strip it paints) would make a second start line
const RAINBOW_CLUTTER = /^(balloon-star-arch|rally-center-dashes|golden-star-hoop|gem-stars|asteroid-field|race-start-gantry|race-start-grid)$/;

function restyleRainbowRoad(scene, root, curve, roadHw) {
  const road = scene.getObjectByName('rainbow-glass-ribbon');
  const hw = roadHw || 3.75;
  if (road?.isMesh) {
    const mat = rainbowRoadMaterial();
    road.material = mat;
    road.renderOrder = 2;
    road.onBeforeRender = () => { mat.uniforms.time.value = performance.now() * 0.001; };
    // old flat gold stars + box rails
    road.parent?.children.forEach((c) => { if (c !== road) c.visible = false; });
  }
  const arena = scene.getObjectByName('arena');
  const hideClutter = () => {
    scene.traverse((o) => { if (RAINBOW_CLUTTER.test(o.name || '')) o.visible = false; });
    // loose big torus rings hanging over the grid
    arena?.traverse((o) => {
      if (o.isMesh && o.geometry?.type === 'TorusGeometry' && (o.geometry.parameters?.radius ?? 0) > 2) o.visible = false;
    });
  };
  hideClutter();

  // crystal rails: two glowing tubes each side on slim posts
  const N = 700;
  const railMat = new THREE.MeshBasicMaterial({ color: 0xe8e0ff, toneMapped: false });
  const glowMat = new THREE.MeshBasicMaterial({ color: 0x9fb8ff, transparent: true, opacity: 0.35, toneMapped: false, depthWrite: false });
  for (const side of [-1, 1]) {
    for (const [lift, rad] of [[0.35, 0.05], [0.8, 0.06]]) {
      const pts = [];
      for (let i = 0; i <= N; i++) {
        const t = i / N;
        const p = curve.getPointAt(t % 1), tan = curve.getTangentAt(t % 1);
        const nx = tan.z, nz = -tan.x;
        const l = Math.hypot(nx, nz) || 1;
        pts.push(new THREE.Vector3(p.x + (nx / l) * (hw + 0.25) * side, p.y + lift, p.z + (nz / l) * (hw + 0.25) * side));
      }
      const path = new THREE.CatmullRomCurve3(pts, true);
      const tube = new THREE.Mesh(new THREE.TubeGeometry(path, N, rad, 6, true), railMat);
      tube.name = 'mk8-rainbow-rail';
      root.add(tube);
      const halo = new THREE.Mesh(new THREE.TubeGeometry(path, N, rad * 3.2, 6, true), glowMat);
      halo.name = 'mk8-rainbow-rail-glow';
      root.add(halo);
    }
    // posts every ~4 m
    const len = curve.getLength();
    const n = Math.floor(len / 4);
    const postGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.85, 6);
    postGeo.translate(0, 0.42, 0);
    const posts = new THREE.InstancedMesh(postGeo, railMat, n);
    const m = new THREE.Matrix4();
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const p = curve.getPointAt(t), tan = curve.getTangentAt(t);
      const nx = tan.z, nz = -tan.x;
      const l = Math.hypot(nx, nz) || 1;
      m.makeTranslation(p.x + (nx / l) * (hw + 0.25) * side, p.y, p.z + (nz / l) * (hw + 0.25) * side);
      posts.setMatrixAt(i, m);
    }
    posts.name = 'mk8-rainbow-posts';
    root.add(posts);
  }

  // neon rainbow arch over the start line
  const start = scene.getObjectByName('racing-start-line');
  if (start) root.add(buildRainbowArch(start, curve, hw));

  // some pieces are added after the showcase runs — sweep again shortly
  let sweeps = 0;
  const hookGeo = new THREE.BufferGeometry();
  hookGeo.setAttribute('position', new THREE.Float32BufferAttribute([0, -900, 0, 0.001, -900, 0, 0, -900, 0.001], 3));
  const hook = new THREE.Mesh(hookGeo, new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false }));
  hook.frustumCulled = false;
  let last = 0;
  hook.onBeforeRender = () => {
    const now = performance.now();
    if (sweeps > 20 || now - last < 700) return;
    last = now;
    sweeps++;
    hideClutter();
  };
  root.add(hook);
}

function buildRainbowArch(startGroup, curve, hw) {
  const g = new THREE.Group();
  g.name = 'mk8-rainbow-arch';
  const box = new THREE.Box3().setFromObject(startGroup);
  const ctr = box.getCenter(new THREE.Vector3());
  let bestT = 0, best = Infinity;
  for (let i = 0; i <= 600; i++) {
    const p = curve.getPointAt(i / 600);
    const d = (p.x - ctr.x) ** 2 + (p.z - ctr.z) ** 2;
    if (d < best) { best = d; bestT = i / 600; }
  }
  const p = curve.getPointAt(bestT);
  const tan = curve.getTangentAt(bestT).setY(0).normalize();
  const colors = [0xff3b3b, 0xff9a2e, 0xffe44a, 0x4cff7a, 0x3ad6ff, 0x4d6bff, 0xb04dff];
  const R = hw + 2.6;
  colors.forEach((c, i) => {
    const arc = new THREE.Mesh(
      new THREE.TorusGeometry(R - i * 0.32, 0.16, 10, 72, Math.PI),
      new THREE.MeshBasicMaterial({ color: c, toneMapped: false }),
    );
    g.add(arc);
  });
  // glow halo behind the bands
  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(R - 1.0, 1.6, 12, 72, Math.PI),
    new THREE.MeshBasicMaterial({ color: 0xd9c8ff, transparent: true, opacity: 0.12, depthWrite: false, toneMapped: false }),
  );
  g.add(halo);
  // twinkling stars riding the arch
  const starGeo = new THREE.ExtrudeGeometry(starShape(0.5, 0.22), { depth: 0.1, bevelEnabled: false });
  starGeo.center();
  const starMat = new THREE.MeshBasicMaterial({ color: 0xfff3b0, toneMapped: false });
  for (let k = 0; k <= 8; k++) {
    const a = (k / 8) * Math.PI;
    const st = new THREE.Mesh(starGeo, starMat);
    st.position.set(Math.cos(a) * (R + 0.55), Math.sin(a) * (R + 0.55), 0);
    g.add(st);
  }
  g.position.set(p.x, p.y + 0.1, p.z);
  g.rotation.y = Math.atan2(tan.x, tan.z);
  return g;
}
