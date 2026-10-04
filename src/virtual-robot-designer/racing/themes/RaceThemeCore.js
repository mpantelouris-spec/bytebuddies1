/**
 * RaceThemeCore.js — shared toolkit for the kart track themes (modes 11–19).
 * A theme hides the base biome scenery and dresses the whole lap along the race curve.
 * Distances `d` are metres along the lap from the kart spawn; `side` is metres to screen-right.
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export const THEME_ROOT_NAME = 'race-theme-scene';

const SKY_NAMES = [
  'track-sky-dome', 'biome-sky-dome', 'aaa-sky-dome', 'storm-cloud-dome', 'track-starfield',
  'track-nebula', 'track-aurora', 'track-volumetric-clouds', 'track-carnival-sky',
];

export function seeded(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function wrapT(t) {
  return ((t % 1) + 1) % 1;
}

export function toon(color, opts = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.02, ...opts });
}

export function glow(color, intensity = 1, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color, emissive: color, emissiveIntensity: intensity, roughness: 0.4, metalness: 0, ...opts,
  });
}

export function canvasTexture(draw, w = 128, h = w, { repeat = null, srgb = true } = {}) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const tex = new THREE.CanvasTexture(c);
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  if (repeat) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeat[0], repeat[1]);
  }
  tex.anisotropy = 4;
  return tex;
}

/** Bold rounded sign text (neon, banners, wooden signs). */
export function signTexture(text, {
  w = 512, h = 128, bg = '#1a1030', fg = '#ffffff', stroke = null, font = 'bold 76px system-ui, Arial, sans-serif',
  border = null, glowColor = null, radius = 18,
} = {}) {
  return canvasTexture((x) => {
    if (bg) {
      x.fillStyle = bg;
      x.beginPath();
      x.roundRect(4, 4, w - 8, h - 8, radius);
      x.fill();
    }
    if (border) {
      x.strokeStyle = border;
      x.lineWidth = 8;
      x.beginPath();
      x.roundRect(8, 8, w - 16, h - 16, radius);
      x.stroke();
    }
    x.font = font;
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    if (glowColor) {
      x.shadowColor = glowColor;
      x.shadowBlur = 24;
    }
    if (stroke) {
      x.lineWidth = 10;
      x.strokeStyle = stroke;
      x.strokeText(text, w / 2, h / 2 + 4);
    }
    x.fillStyle = fg;
    x.fillText(text, w / 2, h / 2 + 4);
  }, w, h);
}

let _glowTex = null;
function glowTexture() {
  if (_glowTex) return _glowTex;
  _glowTex = canvasTexture((x, w) => {
    const g = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.25, 'rgba(255,255,255,0.55)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g;
    x.fillRect(0, 0, w, w);
  }, 128);
  return _glowTex;
}

/** Soft additive halo (lamps, moon, crystals). */
export function glowSprite(color, size = 2, opacity = 0.85) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({
    map: glowTexture(), color, transparent: true, opacity,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  s.scale.set(size, size, 1);
  return s;
}

export function createThemeContext(scene, curve, { halfWidth = 4, spawn = null, startT = 0, seed = 7 } = {}) {
  ['candy-rainbow-scene', 'original-race-presentation', THEME_ROOT_NAME].forEach((name) => {
    const old = scene.getObjectByName(name);
    if (old) old.parent?.remove(old);
  });

  const t0 = wrapT(spawn?.trackT ?? startT ?? 0);
  const p0 = curve.getPointAt(t0);
  let yLift = spawn && Number.isFinite(spawn.y) ? spawn.y - p0.y : 0.2;
  if (!Number.isFinite(yLift) || Math.abs(yLift) > 3) yLift = 0.2;
  const len = Math.max(50, curve.getLength());

  const frame = (d, side = 0) => {
    const t = wrapT(t0 + d / len);
    const p = curve.getPointAt(t);
    const q = curve.getPointAt(wrapT(t + 0.002));
    const tan = new THREE.Vector3(q.x - p.x, 0, q.z - p.z);
    if (tan.lengthSq() < 1e-8) tan.set(0, 0, 1);
    tan.normalize();
    const right = new THREE.Vector3(-tan.z, 0, tan.x);
    const roadY = p.y + yLift;
    const pos = new THREE.Vector3(p.x, roadY, p.z).addScaledVector(right, side);
    return { t, d, pos, tan, right, roadY, angle: Math.atan2(tan.x, tan.z) };
  };

  const samples = [];
  let minY = Infinity;
  let cx = 0;
  let cz = 0;
  let maxR = 0;
  for (let i = 0; i < 600; i++) {
    const t = i / 600;
    const p = curve.getPointAt(t);
    samples.push({ t, x: p.x, y: p.y, z: p.z });
    minY = Math.min(minY, p.y);
    cx += p.x / 600;
    cz += p.z / 600;
  }
  samples.forEach((s) => { maxR = Math.max(maxR, Math.hypot(s.x - cx, s.z - cz)); });

  const clear = (pos, radius, ownT) => {
    const limit = halfWidth + 2.2 + radius;
    const lim2 = limit * limit;
    for (const s of samples) {
      const dt = Math.abs(s.t - ownT);
      if (Math.min(dt, 1 - dt) < 0.02) continue;
      const dx = s.x - pos.x;
      const dz = s.z - pos.z;
      if (dx * dx + dz * dz < lim2) return false;
    }
    return true;
  };

  const root = new THREE.Group();
  root.name = THEME_ROOT_NAME;
  const ticks = [];

  const ctx = {
    scene, curve, root, hw: halfWidth, len, t0, yLift, frame, clear,
    rand: seeded(seed),
    minRoadY: minY + yLift,
    center: new THREE.Vector3(cx, minY + yLift, cz),
    radius: maxR,
    spawn,
    ticks,
  };

  ctx.place = (obj, d, side = 0, { y = 0, face = true, rotY = 0, clearR = null, ground = false } = {}) => {
    const f = frame(d, side);
    if (clearR != null && !clear(f.pos, clearR, f.t)) return null;
    obj.position.set(f.pos.x, (ground ? ctx.groundY : f.roadY) + y, f.pos.z);
    obj.rotation.y = (face ? f.angle : 0) + rotY;
    root.add(obj);
    return obj;
  };

  const _q = new THREE.Quaternion();
  const _e = new THREE.Euler();
  ctx.matrixAt = (d, side = 0, { y = 0, face = true, rotY = 0, scale = 1, clearR = null, ground = false, tilt = 0 } = {}) => {
    const f = frame(d, side);
    if (clearR != null && !clear(f.pos, clearR, f.t)) return null;
    const s = typeof scale === 'number' ? new THREE.Vector3(scale, scale, scale) : scale;
    _e.set(tilt, (face ? f.angle : 0) + rotY, 0);
    _q.setFromEuler(_e);
    const pos = new THREE.Vector3(f.pos.x, (ground ? ctx.groundY : f.roadY) + y, f.pos.z);
    return new THREE.Matrix4().compose(pos, _q.clone(), s);
  };

  ctx.scatter = (template, matrices) => scatterInstanced(root, template, matrices.filter(Boolean));

  /** fn(nowSeconds, camera) runs every rendered frame. */
  ctx.tick = (fn) => ticks.push(fn);

  ctx.finish = () => {
    if (ticks.length) {
      const driver = new THREE.Mesh(
        new THREE.PlaneGeometry(0.01, 0.01),
        new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false }),
      );
      driver.frustumCulled = false;
      let last = -1;
      driver.onBeforeRender = (_r, _s, camera) => {
        const now = performance.now() * 0.001;
        if (now === last) return;
        last = now;
        for (const fn of ticks) fn(now, camera);
      };
      root.add(driver);
    }
    scene.add(root);
    scene.userData.racePresentationRoot = root;
  };

  ctx.groundY = ctx.minRoadY - 0.12;
  return ctx;
}

/** Instance every mesh of `template` at each matrix — whole-lap dressing in a few draw calls. */
export function scatterInstanced(root, template, matrices) {
  if (!matrices.length) return [];
  template.updateMatrixWorld(true);
  const out = [];
  const tmp = new THREE.Matrix4();
  const byMaterial = new Map();
  const loose = [];
  template.traverse((o) => {
    if (!o.isMesh) return;
    if (Array.isArray(o.material)) {
      loose.push({ geometry: o.geometry, material: o.material, local: o.matrixWorld.clone() });
      return;
    }
    const g = (o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone()).applyMatrix4(o.matrixWorld);
    ['position', 'normal', 'uv'].forEach((k) => {
      if (!g.attributes[k] && k === 'uv') g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    });
    // Keep vertex colours (gradient grass, stems); everything else must match to merge
    Object.keys(g.attributes).forEach((k) => { if (!['position', 'normal', 'uv', 'color'].includes(k)) g.deleteAttribute(k); });
    if (!byMaterial.has(o.material)) byMaterial.set(o.material, []);
    byMaterial.get(o.material).push(g);
  });
  const identity = new THREE.Matrix4();
  byMaterial.forEach((geos, material) => {
    if (!geos.every((g) => g.attributes.color)) geos.forEach((g) => g.deleteAttribute('color'));
    const merged = geos.length === 1 ? geos[0] : mergeGeometries(geos, false);
    if (!merged) return;
    loose.push({ geometry: merged, material, local: identity });
  });
  loose.forEach(({ geometry, material, local }) => {
    const im = new THREE.InstancedMesh(geometry, material, matrices.length);
    matrices.forEach((m, i) => im.setMatrixAt(i, tmp.multiplyMatrices(m, local)));
    im.instanceMatrix.needsUpdate = true;
    im.castShadow = true;
    im.receiveShadow = true;
    im.computeBoundingSphere();
    root.add(im);
    out.push(im);
  });
  return out;
}

/** Hide the base biome scenery group so only road, kerbs, start line and checkpoints remain. */
export function hideBaseWorld(scene) {
  const id = scene.userData.arenaType;
  const hide = (name) => {
    const g = scene.getObjectByName(name);
    if (g) g.visible = false;
  };
  if (id) hide(`track-${id}`);
  SKY_NAMES.forEach((name) => {
    const o = scene.getObjectByName(name);
    if (o) o.parent?.remove(o);
  });
}

export function themeSky(ctx, {
  top, mid, horizon, fog = horizon, near = 70, far = 320, stars = 0, starColor = 0xffffff,
}) {
  const { scene } = ctx;
  const r = 900;
  const geo = new THREE.SphereGeometry(r, 40, 24);
  const cTop = new THREE.Color(top);
  const cMid = new THREE.Color(mid);
  const cHor = new THREE.Color(horizon);
  const colors = [];
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const t = Math.max(0, Math.min(1, (pos.getY(i) / r + 1) * 0.5));
    const c = t < 0.5 ? cHor.clone() : (t < 0.62 ? cHor.clone().lerp(cMid, (t - 0.5) / 0.12) : cMid.clone().lerp(cTop, (t - 0.62) / 0.38));
    colors.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const dome = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
    vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false,
  }));
  dome.name = 'track-sky-dome';
  dome.renderOrder = -30;
  dome.frustumCulled = false;
  dome.position.set(ctx.center.x, ctx.minRoadY, ctx.center.z);
  scene.add(dome);
  scene.userData.trackSkyDome = dome;
  scene.userData.customSky = true;

  if (stars > 0) {
    const pts = [];
    const rand = seeded(99);
    for (let i = 0; i < stars; i++) {
      const th = rand() * Math.PI * 2;
      const ph = 0.08 + rand() * 1.3;
      pts.push(
        Math.cos(th) * Math.cos(ph) * 820 + ctx.center.x,
        Math.sin(ph) * 820 + ctx.minRoadY,
        Math.sin(th) * Math.cos(ph) * 820 + ctx.center.z,
      );
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    const starfield = new THREE.Points(g, new THREE.PointsMaterial({
      color: starColor, size: 2.2, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.9,
    }));
    starfield.name = 'track-starfield';
    starfield.frustumCulled = false;
    scene.add(starfield);
  }
  scene.background = new THREE.Color(horizon);
  scene.fog = new THREE.Fog(fog, near, far);
  return dome;
}

/** Retint the base lights (sun, sky/ground bounce, ambient) for the theme mood. */
export function themeLights(scene, {
  sun = 0xffffff, sunIntensity = null, hemiSky = null, hemiGround = null, hemiIntensity = null,
  ambient = null, ambientIntensity = null, night = false,
}) {
  scene.traverse((o) => {
    if (o.isDirectionalLight) {
      o.color.set(sun);
      if (sunIntensity != null) o.intensity = sunIntensity;
    } else if (o.isHemisphereLight) {
      if (hemiSky != null) o.color.set(hemiSky);
      if (hemiGround != null) o.groundColor.set(hemiGround);
      if (hemiIntensity != null) o.intensity = hemiIntensity;
    } else if (o.isAmbientLight) {
      if (ambient != null) o.color.set(ambient);
      if (ambientIntensity != null) o.intensity = ambientIntensity;
    }
  });
  if (night) {
    scene.userData.suppressSimDaylight = true;
    scene.traverse((o) => {
      if (o.isDirectionalLight) o.intensity = Math.max(o.intensity, 1.2);
      else if (o.isHemisphereLight) o.intensity = Math.max(o.intensity, 1.05);
      else if (o.isAmbientLight) o.intensity = Math.max(o.intensity, 0.9);
    });
    if (!scene.getObjectByName('theme-night-kart-hemi')) {
      const hemi = new THREE.HemisphereLight(0xfff2dd, 0x445588, 0.75);
      hemi.name = 'theme-night-kart-hemi';
      scene.add(hemi);
    }
  }
}

/** Big flat ground at the lowest road point; elevated road reads as a bridge. */
export function themeGround(ctx, { color, map = null, roughness = 0.9, metalness = 0, y = null, radiusPad = 420, emissive = null }) {
  const geo = new THREE.CircleGeometry(ctx.radius + radiusPad, 72);
  geo.rotateX(-Math.PI / 2);
  const mat = toon(color, { roughness, metalness, map });
  if (emissive != null) {
    mat.emissive = new THREE.Color(emissive);
    mat.emissiveIntensity = 0.25;
  }
  const m = new THREE.Mesh(geo, mat);
  if (y != null) ctx.groundY = y;
  m.position.set(ctx.center.x, ctx.groundY, ctx.center.z);
  m.receiveShadow = true;
  m.name = 'race-theme-ground';
  ctx.root.add(m);
  return m;
}

/** Support pillars wherever the road rises above the ground. */
export function roadSupports(ctx, template, { step = 10, minHeight = 1.2, sides = [-1, 1], inset = 0.6 } = {}) {
  const mats = [];
  for (let d = 0; d < ctx.len; d += step) {
    const f = ctx.frame(d);
    const h = f.roadY - ctx.groundY - 0.2;
    if (h < minHeight) continue;
    sides.forEach((s) => {
      const sf = ctx.frame(d, s * (ctx.hw - inset));
      mats.push(new THREE.Matrix4().compose(
        new THREE.Vector3(sf.pos.x, ctx.groundY, sf.pos.z),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(0, sf.angle, 0)),
        new THREE.Vector3(1, h, 1),
      ));
    });
  }
  return ctx.scatter(template, mats);
}

/** Ribbon following the road between `from` and `to` metres, at lateral offsets a..b. */
export function ribbonGeometry(ctx, a, b, { from = -12, to = null, y = 0.035, step = 1.2, repeatLen = 4, followGround = false } = {}) {
  const end = to ?? ctx.len - 12;
  const steps = Math.max(2, Math.ceil((end - from) / step));
  const pos = [];
  const uv = [];
  const idx = [];
  for (let i = 0; i <= steps; i++) {
    const d = from + ((end - from) * i) / steps;
    const f = ctx.frame(d);
    const pa = f.pos.clone().addScaledVector(f.right, a);
    const pb = f.pos.clone().addScaledVector(f.right, b);
    const yy = (followGround ? ctx.groundY : f.roadY) + y;
    pos.push(pa.x, yy, pa.z, pb.x, yy, pb.z);
    const v = (d - from) / repeatLen;
    uv.push(0, v, 1, v);
    if (i < steps) {
      const k = i * 2;
      idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

function overlayMat(mat, factor = -2) {
  mat.side = THREE.DoubleSide;
  mat.polygonOffset = true;
  mat.polygonOffsetFactor = factor;
  mat.polygonOffsetUnits = factor;
  return mat;
}

/** Full-lap road skin (asphalt, planks, cobbles, sand, ice...). */
export function roadSurface(ctx, { color = 0xffffff, map = null, roughness = 0.85, metalness = 0, emissive = null, emissiveIntensity = 0.2, repeatLen = 4, width = null, y = 0.03, envMapIntensity = 0.5 }) {
  const w = width ?? ctx.hw * 2;
  const mat = overlayMat(toon(color, { map, roughness, metalness, envMapIntensity }));
  if (emissive != null) {
    mat.emissive = new THREE.Color(emissive);
    mat.emissiveIntensity = emissiveIntensity;
  }
  const mesh = new THREE.Mesh(ribbonGeometry(ctx, -w / 2, w / 2, { from: 0, to: ctx.len + 1.5, y, repeatLen }), mat);
  mesh.receiveShadow = true;
  mesh.name = 'race-theme-road';
  ctx.root.add(mesh);
  return mesh;
}

/** Coloured lengthwise lanes (rainbow road, painted stripes). */
export function laneStripes(ctx, colors, { from = 8, to = null, width = null, y = 0.045, emissiveIntensity = 0.25, opacity = 1 } = {}) {
  const w = width ?? ctx.hw * 1.9;
  const g = new THREE.Group();
  colors.forEach((c, k) => {
    const a = -w / 2 + (w * k) / colors.length;
    const b = -w / 2 + (w * (k + 1)) / colors.length;
    const mat = overlayMat(glow(c, emissiveIntensity, { roughness: 0.35, transparent: opacity < 1, opacity }), -3);
    g.add(new THREE.Mesh(ribbonGeometry(ctx, a, b, { from, to: to ?? ctx.len - 20, y }), mat));
  });
  ctx.root.add(g);
  return g;
}

/** Thin glowing strip at a lateral offset (neon edge lines, painted edge lines). */
export function edgeStrip(ctx, color, { offset, width = 0.18, y = 0.05, intensity = 1.2, from = 0, to = null, sides = [-1, 1] } = {}) {
  const mat = overlayMat(glow(color, intensity, { roughness: 0.3 }), -3);
  sides.forEach((s) => {
    const o = s * offset;
    ctx.root.add(new THREE.Mesh(ribbonGeometry(ctx, o - width / 2, o + width / 2, { from, to: to ?? ctx.len + 1.5, y }), mat));
  });
}

/** Alternating kerb blocks down both edges of the whole lap. */
export function kerbs(ctx, colorA = 0xe53935, colorB = 0xffffff, { seg = 1.5, width = 0.6, height = 0.14, offset = null, emissive = 0 } = {}) {
  const off = offset ?? ctx.hw + 0.2;
  const geo = new THREE.BoxGeometry(width, height, seg);
  const lists = [[], []];
  let i = 0;
  for (let d = 0; d < ctx.len; d += seg, i++) {
    [-1, 1].forEach((s) => lists[i % 2].push(ctx.matrixAt(d, s * off, { y: height / 2 })));
  }
  [colorA, colorB].forEach((c, k) => {
    const tpl = new THREE.Mesh(geo, emissive ? glow(c, emissive) : toon(c, { roughness: 0.5 }));
    ctx.scatter(tpl, lists[k]);
  });
}

export function startStripes(ctx, color = 0xffffff, { d = 4.2 } = {}) {
  const mat = overlayMat(toon(color, { roughness: 0.4 }), -4);
  const f = ctx.frame(d);
  for (let x = -ctx.hw * 0.88; x <= ctx.hw * 0.88 + 0.01; x += 0.95) {
    const bar = new THREE.Mesh(new THREE.PlaneGeometry(0.48, 2.4), mat);
    bar.rotation.x = -Math.PI / 2;
    const holder = new THREE.Group();
    holder.add(bar);
    const p = f.pos.clone().addScaledVector(f.right, x);
    holder.position.set(p.x, f.roadY + 0.05, p.z);
    holder.rotation.y = f.angle;
    ctx.root.add(holder);
  }
}

/** Spinning collectible coins in little rows along the whole lap. */
export function coins(ctx, { color = 0xffc93a, emissive = 0xffa000, every = 32, start = 12, height = 1.15 } = {}) {
  const geo = new THREE.CylinderGeometry(0.5, 0.5, 0.12, 28);
  geo.rotateX(Math.PI / 2);
  const mat = toon(color, { metalness: 0.65, roughness: 0.22, emissive, emissiveIntensity: 0.45 });
  const holders = [];
  for (let d = start; d < ctx.len - 10; d += every) {
    const n = 1 + Math.floor(ctx.rand() * 3);
    const lane = (ctx.rand() - 0.5) * ctx.hw * 1.1;
    const lengthwise = ctx.rand() < 0.5;
    for (let k = 0; k < n; k++) {
      const coin = new THREE.Mesh(geo, mat);
      coin.castShadow = true;
      const dd = lengthwise ? d + k * 3 : d;
      const side = lengthwise ? lane : lane + (k - (n - 1) / 2) * 1.3;
      ctx.place(coin, dd, side, { y: height });
      holders.push({ coin, base: coin.rotation.y, phase: holders.length * 0.7 });
    }
  }
  ctx.tick((now) => {
    for (const h of holders) h.coin.rotation.y = h.base + now * 3 + h.phase;
  });
}

/** Falling rain streaks or snow flakes that follow the camera. */
export function precipitation(ctx, { count = 1400, color = 0xaecbff, size = 0.12, speed = 26, area = 60, height = 30, streak = true, opacity = 0.55 } = {}) {
  const pos = new Float32Array(count * 3);
  const rand = seeded(42);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (rand() - 0.5) * area;
    pos[i * 3 + 1] = rand() * height;
    pos[i * 3 + 2] = (rand() - 0.5) * area;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const tex = streak
    ? canvasTexture((x, w, h) => {
      const g = x.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, 'rgba(255,255,255,0)');
      g.addColorStop(1, 'rgba(255,255,255,1)');
      x.fillStyle = g;
      x.fillRect(w / 2 - 2, 0, 4, h);
    }, 16, 64)
    : glowTexture();
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({
    color, size: streak ? size * 6 : size * 3, map: tex, transparent: true, opacity, depthWrite: false,
  }));
  pts.frustumCulled = false;
  ctx.root.add(pts);
  let lastNow = null;
  ctx.tick((now, camera) => {
    const dt = lastNow == null ? 0 : Math.min(0.05, now - lastNow);
    lastNow = now;
    if (camera) pts.position.set(camera.position.x, camera.position.y - height * 0.45, camera.position.z);
    const a = geo.attributes.position.array;
    for (let i = 0; i < count; i++) {
      a[i * 3 + 1] -= speed * dt;
      if (!streak) a[i * 3] += Math.sin(now + i) * dt * 0.6;
      if (a[i * 3 + 1] < 0) a[i * 3 + 1] += height;
    }
    geo.attributes.position.needsUpdate = true;
  });
  return pts;
}

/** Sloped verge from the road edge down to the ground, so raised road reads as an embankment. */
export function embankment(ctx, { color, map = null, width = 16, repeatLen = 6, roughness = 0.95 } = {}) {
  const mat = toon(color, { map, roughness, side: THREE.DoubleSide });
  [-1, 1].forEach((s) => {
    const steps = Math.ceil(ctx.len / 1.5);
    const pos = [];
    const uv = [];
    const idx = [];
    for (let i = 0; i <= steps; i++) {
      const d = (ctx.len * i) / steps;
      const f = ctx.frame(d);
      const inner = f.pos.clone().addScaledVector(f.right, s * (ctx.hw + 0.5));
      const outer = f.pos.clone().addScaledVector(f.right, s * (ctx.hw + width));
      pos.push(inner.x, f.roadY - 0.06, inner.z, outer.x, ctx.groundY + 0.02, outer.z);
      uv.push(0, d / repeatLen, width / repeatLen, d / repeatLen);
      if (i < steps) {
        const k = i * 2;
        idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, mat);
    m.receiveShadow = true;
    ctx.root.add(m);
  });
}

/** Big sun / moon disc low in the sky, roughly ahead of the start. */
export function skyDisc(ctx, { color = 0xfff1c4, halo = 0xffd28a, size = 28, haloSize = 180, dist = 620, height = 70, yaw = 0 } = {}) {
  const f = ctx.frame(0);
  const dir = f.tan.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
  const pos = new THREE.Vector3(ctx.center.x, ctx.minRoadY + height, ctx.center.z).addScaledVector(dir, dist);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(size, 48), new THREE.MeshBasicMaterial({ color, fog: false }));
  disc.position.copy(pos);
  disc.lookAt(ctx.center.x, ctx.minRoadY + height * 0.5, ctx.center.z);
  disc.renderOrder = -20;
  ctx.root.add(disc);
  const h = glowSprite(halo, haloSize, 0.75);
  h.material.fog = false;
  h.position.copy(pos);
  h.renderOrder = -21;
  ctx.root.add(h);
  return { disc, halo: h, pos };
}

export function collectLights(scene) {
  const lights = [];
  scene.traverse((o) => { if (o.isHemisphereLight || o.isAmbientLight || o.isDirectionalLight) lights.push(o); });
  return lights;
}

/** Tileable canvas noise/texture helper for ground & road skins. */
export function speckleTexture(base, dots, { size = 256, count = 900, rMin = 1, rMax = 3, repeat = [1, 1] } = {}) {
  return canvasTexture((x, w, h) => {
    x.fillStyle = base;
    x.fillRect(0, 0, w, h);
    for (let i = 0; i < count; i++) {
      x.fillStyle = dots[i % dots.length];
      x.globalAlpha = 0.35 + Math.random() * 0.5;
      x.beginPath();
      x.arc(Math.random() * w, Math.random() * h, rMin + Math.random() * (rMax - rMin), 0, Math.PI * 2);
      x.fill();
    }
    x.globalAlpha = 1;
  }, size, size, { repeat });
}

// ─── Shared prop builders ────────────────────────────────────────────

export function palmTree(scale = 1, { trunk = 0x9a6a3a, leaf = 0x2fb14e } = {}) {
  const g = new THREE.Group();
  const trunkMat = toon(trunk);
  let y = 0;
  let x = 0;
  for (let i = 0; i < 6; i++) {
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.2 - i * 0.015, 0.26 - i * 0.015, 1.1, 7), trunkMat);
    x += 0.09 * i;
    seg.position.set(x, y + 0.55, 0);
    seg.rotation.z = -0.08 * i;
    g.add(seg);
    y += 1.02;
  }
  const leafMat = toon(leaf, { side: THREE.DoubleSide, flatShading: true });
  for (let i = 0; i < 7; i++) {
    const leafMesh = new THREE.Mesh(new THREE.ConeGeometry(0.5, 3.2, 4, 1, true), leafMat);
    leafMesh.scale.set(1, 1, 0.25);
    const a = (i / 7) * Math.PI * 2;
    leafMesh.position.set(x + Math.cos(a) * 1.2, y + 0.1, Math.sin(a) * 1.2);
    leafMesh.rotation.set(Math.sin(a) * 1.25, -a, Math.cos(a) * -1.25 + Math.PI);
    leafMesh.rotation.order = 'YXZ';
    leafMesh.lookAt(x + Math.cos(a) * 3, y - 0.8, Math.sin(a) * 3);
    leafMesh.rotateX(Math.PI / 2);
    g.add(leafMesh);
  }
  const nut = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 6), toon(0x6b4a2a));
  nut.position.set(x, y - 0.1, 0);
  g.add(nut);
  g.scale.setScalar(scale);
  return g;
}

export function pineTree(scale = 1, greens = [0x2f9a4a, 0x38ad55, 0x44c062], { snow = false } = {}) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.24, 1, 6), toon(0x7a4f2a));
  trunk.position.y = 0.5;
  g.add(trunk);
  for (let i = 0; i < 3; i++) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(1.35 - i * 0.32, 1.7, 8), toon(greens[i % greens.length], { flatShading: true }));
    cone.position.y = 1.4 + i * 0.95;
    g.add(cone);
    if (snow) {
      const cap = new THREE.Mesh(new THREE.ConeGeometry(0.75 - i * 0.2, 0.7, 8), toon(0xf4fbff, { flatShading: true }));
      cap.position.y = 1.9 + i * 0.95;
      g.add(cap);
    }
  }
  g.scale.setScalar(scale);
  return g;
}

export function lowPolyMountain(rand, colors, { snow = 0xf4fbff, rMin = 16, rMax = 28, hMin = 26, hMax = 44, sides = 6 } = {}) {
  const g = new THREE.Group();
  const r = rMin + rand() * (rMax - rMin);
  const h = hMin + rand() * (hMax - hMin);
  const rot = rand() * Math.PI;
  const body = new THREE.Mesh(new THREE.ConeGeometry(r, h, sides), toon(colors[Math.floor(rand() * colors.length)], { flatShading: true, roughness: 0.8 }));
  body.position.y = h / 2;
  body.rotation.y = rot;
  g.add(body);
  if (snow != null) {
    const capH = h * 0.26;
    const cap = new THREE.Mesh(new THREE.ConeGeometry(r * 0.27, capH, sides), toon(snow, { flatShading: true }));
    cap.position.y = h - capH / 2 + 0.05;
    cap.rotation.y = rot;
    g.add(cap);
  }
  return g;
}

export function cloudPuff(rand, mat, count = 5, rMin = 1.2, rMax = 2.5) {
  const g = new THREE.Group();
  for (let i = 0; i < count; i++) {
    const r = rMin + rand() * (rMax - rMin);
    const s = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), mat);
    s.position.set((i - count / 2) * r * 0.9 + rand() * r * 0.4, rand() * r * 0.5, (rand() - 0.5) * r);
    g.add(s);
  }
  return g;
}

export function rockLump(color, { flat = true } = {}) {
  const m = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 0), toon(color, { flatShading: flat, roughness: 0.9 }));
  m.scale.set(1.3, 0.8, 1);
  return m;
}

/** Scatter a template along both roadsides over the whole lap. */
export function sideScatter(ctx, template, {
  step = 12, jitter = 6, sides = [-1, 1], offMin = 4, offMax = 12, clearR = 1.5, scaleMin = 0.8, scaleMax = 1.3,
  y = 0, ground = false, randomYaw = true, from = 0, to = null,
} = {}) {
  const mats = [];
  const end = to ?? ctx.len;
  for (let d = from; d < end; d += step) {
    sides.forEach((s) => {
      const dd = d + (ctx.rand() - 0.5) * jitter;
      const side = s * (ctx.hw + offMin + ctx.rand() * (offMax - offMin));
      const sc = scaleMin + ctx.rand() * (scaleMax - scaleMin);
      mats.push(ctx.matrixAt(dd, side, {
        y, clearR: clearR * sc, scale: sc, ground, face: !randomYaw, rotY: randomYaw ? ctx.rand() * Math.PI * 2 : 0,
      }));
    });
  }
  return ctx.scatter(template, mats);
}

/** Arch over the road at distance d: two posts + a beam + optional sign texture. */
export function roadArch(ctx, d, { postMat, beamMat, signMap = null, height = 6.5, span = null, beamH = 1.4, signW = null, postW = 0.7 } = {}) {
  const w = span ?? ctx.hw * 2 + 2.4;
  const g = new THREE.Group();
  [-1, 1].forEach((s) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(postW, height, postW), postMat);
    post.position.set(s * w / 2, height / 2, 0);
    g.add(post);
  });
  const beam = new THREE.Mesh(new THREE.BoxGeometry(w + postW, beamH, 0.6), beamMat);
  beam.position.y = height;
  g.add(beam);
  if (signMap) {
    const sign = new THREE.Mesh(
      new THREE.PlaneGeometry(signW ?? w * 0.8, beamH * 0.9),
      new THREE.MeshStandardMaterial({ map: signMap, emissive: 0xffffff, emissiveMap: signMap, emissiveIntensity: 0.6, transparent: true }),
    );
    sign.position.set(0, height, -0.32);
    sign.rotation.y = Math.PI;
    g.add(sign);
  }
  ctx.place(g, d, 0);
  return g;
}
