/**
 * BiomeAAAKit.js — AAA-quality procedural PBR, atmosphere, lighting, and particles.
 * WebGL-optimized: 1024px procedural textures simulate 4K detail via tiling + anisotropy.
 */
import * as THREE from 'three';
import { placeAtTrack } from '../GameWorldBuilder.js';
import { sampleTrackBounds, cornerPosition, faceCenter } from './mk-track-layout.js';
import { animateParticles } from './biome-world-kit.js';

const TEX_SIZE = 1024;

// ── Procedural texture generators ───────────────────────────────────────────

function noiseCanvas(size = TEX_SIZE) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  return { canvas: c, ctx: c.getContext('2d') };
}

export function createTerrainMaps(baseColor, { roughness = 0.85, variation = 0.2 } = {}) {
  const { canvas, ctx } = noiseCanvas();
  const col = new THREE.Color(baseColor);
  const r = col.r * 255, g = col.g * 255, b = col.b * 255;
  ctx.fillStyle = `rgb(${r | 0},${g | 0},${b | 0})`;
  ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE);
  for (let i = 0; i < 8000; i++) {
    const s = 1 + (Math.random() - 0.5) * variation * 2;
    ctx.fillStyle = `rgba(${Math.min(255, r * s)},${Math.min(255, g * s)},${Math.min(255, b * s)},${0.04 + Math.random() * 0.12})`;
    const sz = 1 + Math.random() * 4;
    ctx.fillRect(Math.random() * TEX_SIZE, Math.random() * TEX_SIZE, sz, sz);
  }
  const colorMap = new THREE.CanvasTexture(canvas);
  colorMap.wrapS = colorMap.wrapT = THREE.RepeatWrapping;
  colorMap.repeat.set(8, 8);
  colorMap.anisotropy = 8;

  const { canvas: nc, ctx: nx } = noiseCanvas(512);
  for (let i = 0; i < 6000; i++) {
    const v = 120 + Math.random() * 135;
    nx.fillStyle = `rgb(${v},${v},${v + 10})`;
    nx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
  }
  const normalMap = new THREE.CanvasTexture(nc);
  normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.set(8, 8);

  const { canvas: rc, ctx: rx } = noiseCanvas(512);
  for (let i = 0; i < 4000; i++) {
    const v = Math.floor((roughness + (Math.random() - 0.5) * 0.3) * 255);
    rx.fillStyle = `rgb(${v},${v},${v})`;
    rx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
  }
  const roughnessMap = new THREE.CanvasTexture(rc);
  roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(8, 8);

  return { colorMap, normalMap, roughnessMap };
}

export function pbrMat(color, {
  roughness = 0.55, metalness = 0.1, emissive = 0x000000, emi = 0,
  map = null, normalMap = null, roughnessMap = null,
  transparent = false, opacity = 1, transmission = 0, ior = 1.5,
} = {}) {
  const matOpts = {
    color, roughness, metalness,
    emissive, emissiveIntensity: emi,
    map, normalMap, roughnessMap,
    transparent, opacity,
    transmission, ior,
    flatShading: false,
    clearcoat: metalness > 0.4 ? 0.6 : 0,
    clearcoatRoughness: 0.15,
    envMapIntensity: 0.78,
  };
  if (normalMap) matOpts.normalScale = new THREE.Vector2(0.35, 0.35);
  if (emi > 0.45) matOpts.toneMapped = false;
  return new THREE.MeshPhysicalMaterial(matOpts);
}

// ── Atmosphere ──────────────────────────────────────────────────────────────

export function buildAtmosphereSky(scene, topColor, horizonColor, radius = 450, midColor = null) {
  const existing = scene.getObjectByName('aaa-sky-dome');
  if (existing) scene.remove(existing);
  const geo = new THREE.SphereGeometry(radius, 48, 24);
  const top = new THREE.Color(topColor);
  const hor = new THREE.Color(horizonColor);
  const mid = midColor ? new THREE.Color(midColor) : top.clone().lerp(hor, 0.45);
  const colors = [];
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const t = Math.pow(Math.max(0, (y / radius + 1) * 0.5), 0.48);
    const c = t < 0.55 ? hor.clone().lerp(mid, t / 0.55) : mid.clone().lerp(top, (t - 0.55) / 0.45);
    colors.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  const dome = new THREE.Mesh(
    geo,
    new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false }),
  );
  dome.name = 'aaa-sky-dome';
  dome.renderOrder = -30;
  scene.add(dome);
  scene.background = new THREE.Color(horizonColor);
  return dome;
}

export function buildVolumetricCloudLayer(bounds, y, color = 0xffffff, opacity = 0.55, scale = 1, count = 12) {
  const g = new THREE.Group();
  g.name = 'aaa-clouds';
  const layers = Math.max(4, Math.min(count, 12));
  for (let i = 0; i < layers; i++) {
    const w = 28 + Math.random() * 36;
    const cloud = new THREE.Mesh(
      new THREE.SphereGeometry(w * 0.28 * scale, 8, 6),
      new THREE.MeshStandardMaterial({
        color, transparent: true, opacity: opacity * (0.35 + Math.random() * 0.45),
        roughness: 1, depthWrite: false, emissive: color, emissiveIntensity: 0.03,
      }),
    );
    cloud.position.set(
      bounds.cx + (Math.random() - 0.5) * bounds.spanX * 1.2,
      y + Math.random() * 8,
      bounds.cz + (Math.random() - 0.5) * bounds.spanZ * 1.2,
    );
    cloud.scale.set(1.8 + Math.random(), 0.5 + Math.random() * 0.4, 1.2 + Math.random());
    cloud.userData.drift = 0.2 + Math.random() * 0.4;
    cloud.userData.phase = Math.random() * Math.PI * 2;
    g.add(cloud);
  }
  return g;
}

export function buildGodRays(bounds, color = 0xffdd88, count = 6) {
  const g = new THREE.Group();
  g.name = 'aaa-god-rays';
  for (let i = 0; i < count; i++) {
    const ray = new THREE.Mesh(
      new THREE.PlaneGeometry(8 + Math.random() * 12, 60 + Math.random() * 40),
      new THREE.MeshBasicMaterial({
        color, transparent: true, opacity: 0.09 + Math.random() * 0.08,
        side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending,
      }),
    );
    const angle = (i / count) * Math.PI * 2;
    ray.position.set(bounds.cx + Math.cos(angle) * 20, 30, bounds.cz + Math.sin(angle) * 20);
    ray.rotation.set(-0.4 + Math.random() * 0.2, angle, 0);
    ray.userData.pulse = Math.random() * Math.PI * 2;
    g.add(ray);
  }
  return g;
}

export function buildLensFlare(bounds, color = 0xffdd66) {
  const g = new THREE.Group();
  const core = new THREE.Mesh(
    new THREE.CircleGeometry(16, 32),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.92, fog: false }),
  );
  g.add(core);
  [2.5, 4, 6].forEach((s, i) => {
    const halo = new THREE.Mesh(
      new THREE.CircleGeometry(16 * s, 32),
      new THREE.MeshBasicMaterial({
        color: i === 1 ? 0xff8844 : color,
        transparent: true, opacity: 0.12 - i * 0.03, fog: false,
        blending: THREE.AdditiveBlending, depthWrite: false,
      }),
    );
    halo.position.z = -i * 2;
    g.add(halo);
  });
  g.position.set(bounds.cx + 85, 38, bounds.minZ - 65);
  return g;
}

// ── Lighting rig ────────────────────────────────────────────────────────────

export function buildCinematicLighting(scene, bounds, spec, { castShadow = true, lightBoost = 1 } = {}) {
  const rig = new THREE.Group();
  rig.name = 'aaa-light-rig';
  const b = lightBoost;

  const amb = new THREE.AmbientLight(spec.ambient ?? 0xffffff, 0.48 * b);
  scene.add(amb);

  const hemi = new THREE.HemisphereLight(spec.keyLight ?? 0xffffff, spec.ground ?? 0x444444, 1.05 * b);
  scene.add(hemi);

  const key = new THREE.DirectionalLight(spec.keyLight ?? 0xfff4e0, 5.2 * b);
  // Golden hour: azimuth 255°, elevation 8°
  key.position.set(
    bounds.cx + Math.cos(255 * Math.PI / 180) * 90,
    12 + Math.sin(8 * Math.PI / 180) * 80,
    bounds.cz + Math.sin(255 * Math.PI / 180) * 90,
  );
  key.castShadow = castShadow;
  if (castShadow) {
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.near = 10;
  key.shadow.camera.far = 220;
  key.shadow.camera.left = -80;
  key.shadow.camera.right = 80;
  key.shadow.camera.top = 80;
  key.shadow.camera.bottom = -80;
  key.shadow.bias = -0.0002;
  key.shadow.normalBias = 0.02;
  }
  scene.add(key);

  const fill = new THREE.DirectionalLight(spec.fillLight ?? 0xd0e0ff, 1.1 * b);
  fill.position.set(bounds.cx - 40, 30, bounds.cz - 45);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(spec.rimLight ?? 0xffffff, 1.8 * b);
  rim.position.set(bounds.cx + 20, 25, bounds.cz - 60);
  scene.add(rim);

  const bounce = new THREE.PointLight(spec.ground ?? 0x3d9e4a, 0.5 * b, bounds.spanX * 0.6);
  bounce.position.set(bounds.cx, 1.2, bounds.cz);
  scene.add(bounce);

  return { key, fill, rim, amb, hemi };
}

// ── Terrain & surfaces ──────────────────────────────────────────────────────

export function buildAAATerrain(scene, bounds, color, size = 360, curve = null) {
  const maps = createTerrainMaps(color);
  const segs = 120;
  const geo = new THREE.PlaneGeometry(size, size, segs, segs);
  const trackSamples = [];
  if (curve) {
    for (let s = 0; s <= 96; s++) {
      const p = curve.getPointAt(s / 96);
      trackSamples.push(p.x, p.z);
    }
  }
  const trackCorridor = 9;
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), z = pos.getZ(i);
    const wx = bounds.cx + x;
    const wz = bounds.cz + z;
    let disp = Math.sin(wx * 0.06) * Math.cos(wz * 0.05) * 0.55
      + Math.sin(wx * 0.12 + 1.2) * Math.cos(wz * 0.09) * 0.28;
    const distFromCenter = Math.hypot(wx - bounds.cx, wz - bounds.cz);
    const trackChannel = Math.abs(distFromCenter - bounds.radius);
    if (trackChannel < 14) disp -= (1 - trackChannel / 14) * 0.4;
    if (distFromCenter < bounds.radius * 0.35) disp = Math.min(disp, -0.1);
    if (trackSamples.length) {
      let minTrackDist = Infinity;
      for (let t = 0; t < trackSamples.length; t += 2) {
        const d = Math.hypot(wx - trackSamples[t], wz - trackSamples[t + 1]);
        if (d < minTrackDist) minTrackDist = d;
      }
      if (minTrackDist < trackCorridor) {
        const blend = 1 - minTrackDist / trackCorridor;
        disp = Math.min(disp, -0.22 - blend * 0.12);
      }
    }
    pos.setY(i, disp);
  }
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, pbrMat(color, {
    map: maps.colorMap, normalMap: maps.normalMap, roughnessMap: maps.roughnessMap,
    roughness: 0.88, metalness: 0.02,
  }));
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(bounds.cx, -0.28, bounds.cz);
  mesh.renderOrder = 0;
  mesh.receiveShadow = true;
  mesh.name = 'aaa-terrain';
  scene.add(mesh);
  return mesh;
}

export function buildWaterSurface(bounds, {
  color = 0x1a6b9a, width = 360, depth = 150, emissive = 0x0a4466,
  position = null,
} = {}) {
  const geo = new THREE.PlaneGeometry(width, depth, 48, 24);
  const mesh = new THREE.Mesh(geo, pbrMat(color, {
    roughness: 0.02, metalness: 0.85, emissive, emi: 0.2,
    transparent: true, opacity: 0.92, transmission: 0.35, ior: 1.33,
  }));
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.copy(position ?? new THREE.Vector3(bounds.cx - 55, -0.12, bounds.minZ - 45));
  mesh.userData.wave = true;
  mesh.receiveShadow = true;
  mesh.name = 'aaa-water';
  return mesh;
}

export function buildLavaSurface(bounds, count = 8) {
  const g = new THREE.Group();
  g.name = 'aaa-lava';
  for (let i = 0; i < count; i++) {
    const lava = new THREE.Mesh(
      new THREE.PlaneGeometry(10 + Math.random() * 6, 4 + Math.random() * 3, 8, 4),
      pbrMat(0xff4500, { roughness: 0.3, metalness: 0.2, emissive: 0xff2200, emi: 1.2 }),
    );
    lava.rotation.x = -Math.PI / 2;
    const angle = (i / count) * Math.PI * 2;
    lava.position.set(
      bounds.cx + Math.cos(angle) * (bounds.radius + 14),
      0.05,
      bounds.cz + Math.sin(angle) * (bounds.radius + 14),
    );
    lava.rotation.z = angle;
    lava.userData.flicker = Math.random() * Math.PI * 2;
    const light = new THREE.PointLight(0xff4500, 3, 16, 1.5);
    light.position.y = 1;
    lava.add(light);
    g.add(lava);
  }
  return g;
}

export function buildIceLake(bounds, radius = 35) {
  const mesh = new THREE.Mesh(
    new THREE.CircleGeometry(radius, 48),
    pbrMat(0x88ccee, {
      roughness: 0.05, metalness: 0.6, emissive: 0x4488cc, emi: 0.15,
      transparent: true, opacity: 0.88, transmission: 0.25, ior: 1.31,
    }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(bounds.cx, 0.04, bounds.cz);
  mesh.receiveShadow = true;
  mesh.name = 'aaa-ice-lake';
  return mesh;
}

// ── Particles ───────────────────────────────────────────────────────────────

const PARTICLE_COLORS = {
  mist: 0xccddff, sand: 0xf5deb3, haze: 0xffeedd,
  sparkles: 0x00ffff, dust: 0xaaaaaa, shards: 0x88ffff,
  petals: 0xffb6c1, pollen: 0xffeedd,
  embers: 0xff6600, ash: 0x666666, sparks: 0xffaa00,
  rain: 0x88ccff, neon: 0xff00ff, vapor: 0xcccccc,
  snow: 0xffffff, ice: 0xccddff, breathVapor: 0xddeeff,
  leaves: 0x6b8e23, insects: 0xffff88,
  stardust: 0xdda0ff, comet: 0xffffff, cosmic: 0xaa88ff,
  seeds: 0xf5deb3, droplets: 0x88aacc,
  steam: 0xcccccc,
};

export function buildAAAParticles(root, types, bounds, intensity = 1) {
  const systems = [];
  types.forEach((type, ti) => {
    const count = Math.floor((type === 'snow' ? 140 : 80) * intensity);
    const verts = [];
    const phases = [];
    const spread = bounds.radius * 2.5 + 40;
    for (let i = 0; i < count; i++) {
      verts.push(
        bounds.cx + (Math.random() - 0.5) * spread,
        0.5 + Math.random() * 18,
        bounds.cz + (Math.random() - 0.5) * spread,
      );
      phases.push(Math.random() * Math.PI * 2);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    const additive = ['sparkles', 'embers', 'sparks', 'neon', 'stardust', 'comet', 'shards'].includes(type);
    const pts = new THREE.Points(geo, new THREE.PointsMaterial({
      color: PARTICLE_COLORS[type] ?? 0xffffff,
      size: type === 'snow' ? 0.22 : 0.3,
      transparent: true,
      opacity: additive ? 0.9 : 0.75,
      depthWrite: false,
      blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
      sizeAttenuation: true,
    }));
    pts.name = `aaa-particles-${type}`;
    pts.userData.phases = phases;
    pts.userData.particleType = type;
    pts.userData.basePositions = verts.slice();
    root.add(pts);
    systems.push(pts);
  });
  return systems;
}

export function animateAAAParticles(root, time) {
  root.traverse((obj) => {
    if (!obj.isPoints || !obj.userData.phases || !obj.userData.basePositions) return;
    const pos = obj.geometry.attributes.position;
    const phases = obj.userData.phases;
    const type = obj.userData.particleType;
    const base = obj.userData.basePositions;
    for (let i = 0; i < pos.count; i++) {
      const bi = i * 3;
      let bx = base[bi], by = base[bi + 1], bz = base[bi + 2];
      const ph = phases[i];
      if (type === 'snow' || type === 'rain' || type === 'ash') {
        by = ((by - time * (type === 'rain' ? 3 : 1.2)) % 20) + 1;
        bx += Math.sin(time * 0.5 + ph) * 0.15;
      } else if (type === 'embers' || type === 'sparks') {
        by += Math.sin(time * 2 + ph) * 0.08 + time * 0.02;
        bx += Math.sin(time + ph) * 0.05;
      } else if (type === 'petals' || type === 'leaves') {
        by += Math.sin(time * 0.8 + ph) * 0.05;
        bx += Math.sin(time * 0.4 + ph) * 0.12;
        bz += Math.cos(time * 0.35 + ph) * 0.1;
      } else {
        by += Math.sin(time * 1.5 + ph) * 0.04;
        bx += Math.sin(time * 0.3 + ph) * 0.01;
      }
      pos.setXYZ(i, bx, by, bz);
    }
    pos.needsUpdate = true;
  });
}

export function animateAAAWorld(world, time) {
  world.traverse((obj) => {
    if (obj.userData.wave && obj.geometry?.attributes?.position) {
      const pos = obj.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), z = pos.getZ(i);
        pos.setY(i, Math.sin(x * 0.15 + time * 0.9) * 0.12 + Math.cos(z * 0.12 + time * 0.7) * 0.08);
      }
      pos.needsUpdate = true;
    }
    if (obj.userData.flicker != null && obj.material?.emissiveIntensity != null) {
      obj.material.emissiveIntensity = 0.9 + Math.sin(time * 4 + obj.userData.flicker) * 0.35;
    }
    if (obj.userData.drift != null) {
      obj.position.x += Math.sin(time * obj.userData.drift + obj.userData.phase) * 0.008;
      obj.position.z += Math.cos(time * obj.userData.drift * 0.7 + obj.userData.phase) * 0.006;
    }
    if (obj.userData.pulse != null && obj.material?.opacity != null) {
      obj.material.opacity = 0.05 + Math.sin(time * 0.6 + obj.userData.pulse) * 0.03;
    }
    if (obj.userData.spin) obj.rotation.z = time * 0.5;
    if (obj.userData.grazePhase != null) {
      obj.rotation.y = Math.sin(time * 0.4 + obj.userData.grazePhase) * 0.18;
    }
    if (obj.userData.baseEmissive != null && obj.material?.emissiveIntensity != null) {
      obj.material.emissiveIntensity = obj.userData.baseEmissive + Math.sin(time * 2 + obj.id % 7) * obj.userData.baseEmissive * 0.3;
    }
  });
  animateAAAParticles(world, time);
  animateParticles(world, time);
}

// ── Track infrastructure ────────────────────────────────────────────────────

export function scatterBiomeGuardrails(world, curve, halfWidth, style = 'default', step = 0.2) {
  const STYLES = {
    sunset_coast: { a: 0xffffff, b: 0x1a6b9a, emi: 0 },
    crystal_cavern: { a: 0x00ffff, b: 0x222244, emi: 0.5 },
    sky_garden: { a: 0xffd700, b: 0x4a8a3a, emi: 0.2 },
    volcanic_inferno: { a: 0xffaa44, b: 0x3a2a22, emi: 0.4 },
    cyber_city: { a: 0xff00ff, b: 0x001f3f, emi: 0.8 },
    frost_peak: { a: 0xe8f4ff, b: 0x88bbee, emi: 0.15 },
    ancient_ruins: { a: 0xffd700, b: 0x6a5a40, emi: 0.1 },
    stardust_galaxy: { a: 0xdda0ff, b: 0x442266, emi: 0.6 },
    meadow_valley: { a: 0xffffff, b: 0x8b6914, emi: 0 },
    shadow_metro: { a: 0xffff00, b: 0x333333, emi: 0.5 },
    default: { a: 0xffffff, b: 0xe82020, emi: 0 },
  };
  const s = STYLES[style] || STYLES.default;
  let i = 0;
  for (let t = 0.04; t < 0.96; t += step) {
    for (const side of [-1, 1]) {
      const { pos, frame } = placeAtTrack(curve, t, side * (halfWidth + 1.8), 0);
      const rot = frame.rot ?? Math.atan2(frame.tan.x, frame.tan.z);
      const stripe = (i % 2) === 0;
      const col = stripe ? s.a : s.b;
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.95, 0.22),
        pbrMat(col, { roughness: 0.4, emissive: col, emi: s.emi * (stripe ? 0.3 : 0.15) }),
      );
      post.position.copy(pos);
      post.position.y += 0.48;
      post.rotation.y = rot;
      post.castShadow = true;
      world.add(post);
      i++;
    }
  }
}

export function scatterAAAGuardrails(world, curve, halfWidth, step = 0.14) {
  const railMat = pbrMat(0xeeeeee, { roughness: 0.35, metalness: 0.45 });
  const postMat = (stripe) => pbrMat(stripe ? 0xffffff : 0xe82020, { roughness: 0.4, metalness: 0.15 });
  let i = 0;
  let prevLeft = null;
  let prevRight = null;
  for (let t = 0.03; t < 0.97; t += step) {
    for (const side of [-1, 1]) {
      const offset = side * (halfWidth + 2.2);
      const { pos, frame } = placeAtTrack(curve, t, offset, 0);
      const rot = frame.rot ?? Math.atan2(frame.tan.x, frame.tan.z);
      const stripe = (i % 2) === 0;
      const post = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 1.1, 0.3),
        postMat(stripe),
      );
      post.position.copy(pos);
      post.position.y += 0.55;
      post.rotation.y = rot;
      post.castShadow = true;
      world.add(post);

      const prev = side < 0 ? prevLeft : prevRight;
      if (prev) {
        const mid = new THREE.Vector3().addVectors(prev, pos).multiplyScalar(0.5);
        const len = prev.distanceTo(pos);
        const rail = new THREE.Mesh(new THREE.BoxGeometry(len, 0.1, 0.14), railMat);
        rail.position.set(mid.x, (prev.y + pos.y) * 0.5 + 0.82, mid.z);
        rail.rotation.y = rot;
        rail.castShadow = true;
        world.add(rail);
      }
      if (side < 0) prevLeft = pos.clone();
      else prevRight = pos.clone();
      i++;
    }
  }
}

export function scatterAAALights(world, curve, halfWidth, color = 0xfff4cc, count = 14) {
  for (let i = 0; i < count; i++) {
    const t = 0.04 + (i / count) * 0.92;
    const side = i % 2 ? 1 : -1;
    const { pos, frame } = placeAtTrack(curve, t, side * (halfWidth + 4.8), 0);
    const rot = frame.rot ?? Math.atan2(frame.tan.x, frame.tan.z);
    const pole = new THREE.Group();
    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.18, 6, 8),
      pbrMat(0x888899, { roughness: 0.35, metalness: 0.7 }),
    );
    shaft.position.y = 3;
    shaft.castShadow = true;
    pole.add(shaft);
    const lamp = new THREE.Mesh(
      new THREE.SphereGeometry(0.38, 10, 10),
      pbrMat(color, { roughness: 0.15, metalness: 0.3, emissive: color, emi: 1.15 }),
    );
    lamp.position.y = 6.2;
    pole.add(lamp);
    const light = new THREE.PointLight(color, 4.2, 28, 1.5);
    light.position.y = 6.2;
    pole.add(light);
    pole.position.copy(pos);
    pole.position.y = pos.y;
    pole.rotation.y = rot;
    world.add(pole);
  }
}

export function buildAAAGrandstand(length = 34, tiers = 5, accent = 0xcc2222) {
  const g = new THREE.Group();
  for (let tier = 0; tier < tiers; tier++) {
    const seat = new THREE.Mesh(
      new THREE.BoxGeometry(length, 1.15, 3 + tier * 0.5),
      pbrMat(tier % 2 ? accent : 0x2a3a55, { roughness: 0.65 }),
    );
    seat.position.set(0, 0.57 + tier * 1.1, -tier * 1.7);
    seat.castShadow = true;
    seat.receiveShadow = true;
    g.add(seat);
  }
  const crowdColors = [0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3, 0xff9ff3, 0x54a0ff];
  for (let i = 0; i < 56; i++) {
    const person = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.58, 0.3),
      pbrMat(crowdColors[i % crowdColors.length], { roughness: 0.8 }),
    );
    const tier = i % tiers;
    person.position.set(
      (Math.random() - 0.5) * (length - 2),
      1.25 + tier * 1.1,
      -tier * 1.7 - 0.5 + (Math.random() - 0.5) * 0.5,
    );
    g.add(person);
  }
  return g;
}

export function buildAAATrackArch(label, fg = '#ffffff', bg = '#ff7f50') {
  const arch = new THREE.Group();
  arch.scale.setScalar(0.42);
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 1024, 512);
  grad.addColorStop(0, bg);
  grad.addColorStop(1, '#ffffff18');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 512);
  ctx.strokeStyle = fg;
  ctx.lineWidth = 14;
  ctx.strokeRect(16, 16, 992, 480);
  ctx.shadowColor = fg;
  ctx.shadowBlur = 24;
  ctx.fillStyle = fg;
  ctx.font = 'bold 72px system-ui,sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, 512, 200);
  ctx.shadowBlur = 0;
  ctx.font = '600 40px system-ui,sans-serif';
  ctx.fillStyle = '#ffffffcc';
  ctx.fillText('MK CIRCUIT', 512, 280);
  const tex = new THREE.CanvasTexture(canvas);
  const frameMat = pbrMat(0xf5f5f5, { roughness: 0.35, metalness: 0.25, emissive: 0xffffff, emi: 0.08 });
  const left = new THREE.Mesh(new THREE.BoxGeometry(1.4, 11, 1.4), frameMat);
  left.position.set(-7, 5.5, 0);
  left.castShadow = true;
  arch.add(left);
  const right = left.clone();
  right.position.x = 7;
  arch.add(right);
  const top = new THREE.Mesh(new THREE.BoxGeometry(15, 1.5, 1.5), frameMat);
  top.position.y = 11;
  arch.add(top);
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(12, 5),
    new THREE.MeshBasicMaterial({ map: tex, fog: false }),
  );
  sign.position.set(0, 8, 0.8);
  arch.add(sign);
  const trim = new THREE.Mesh(
    new THREE.TorusGeometry(7.5, 0.2, 8, 32, Math.PI),
    pbrMat(0xffd700, { roughness: 0.2, metalness: 0.8, emissive: 0xffaa00, emi: 0.5 }),
  );
  trim.position.y = 11;
  trim.rotation.x = Math.PI;
  arch.add(trim);
  return arch;
}

export function placeStartArch(world, curve, label, fg, bg, finishT = 0) {
  const arch = buildAAATrackArch(label, fg, bg);
  const { pos, frame } = placeAtTrack(curve, finishT ?? 0, 0, 0);
  arch.position.copy(pos);
  arch.position.y = (pos.y || 0) + 0.05;
  arch.rotation.y = frame.rot ?? Math.atan2(frame.tan?.x ?? 0, frame.tan?.z ?? 1);
  world.add(arch);
}

export { sampleTrackBounds, cornerPosition, faceCenter };
