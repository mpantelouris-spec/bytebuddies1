/**
 * FlyingArenaMaterialKit — shared PBR surfaces, geometry quality, and composed props.
 */
import * as THREE from 'three';
import { pbrMat, createTerrainMaps, buildCinematicLighting } from '../../racing/mk-tracks/BiomeAAAKit.js';

const SURFACE_PRESETS = {
  steel_deck: { color: 0x64748b, roughness: 0.42, metalness: 0.72, variation: 0.12 },
  painted_steel: { color: 0x475569, roughness: 0.38, metalness: 0.58, variation: 0.1 },
  dark_steel: { color: 0x334155, roughness: 0.45, metalness: 0.65, variation: 0.11 },
  helipad_yellow: { color: 0xfbbf24, roughness: 0.35, metalness: 0.22, variation: 0.08 },
  ocean: { color: 0x0284c7, roughness: 0.06, metalness: 0.04, variation: 0.14 },
  lab_floor: { color: 0x78716c, roughness: 0.55, metalness: 0.32, variation: 0.14 },
  concrete: { color: 0x94a3b8, roughness: 0.82, metalness: 0.05, variation: 0.18 },
  rust: { color: 0x57534e, roughness: 0.78, metalness: 0.22, variation: 0.2 },
  grass: { color: 0x22c55e, roughness: 0.88, metalness: 0, variation: 0.22 },
  asphalt: { color: 0x334155, roughness: 0.75, metalness: 0.08, variation: 0.16 },
  white_paint: { color: 0xf8fafc, roughness: 0.62, metalness: 0.04, variation: 0.1 },
  beacon_red: { color: 0xdc2626, roughness: 0.28, metalness: 0.15, variation: 0.06 },
  fire_orange: { color: 0xf97316, roughness: 0.35, metalness: 0.05, variation: 0.08 },
  snow: { color: 0xf1f5f9, roughness: 0.92, metalness: 0, variation: 0.06 },
  cloud: { color: 0xffffff, roughness: 0.95, metalness: 0, variation: 0.08 },
  glass_plasma: { color: 0x22d3ee, roughness: 0.08, metalness: 0.08, variation: 0.04 },
  neon_pink: { color: 0xec4899, roughness: 0.18, metalness: 0.05, variation: 0.04 },
  neon_cyan: { color: 0x06b6d4, roughness: 0.18, metalness: 0.05, variation: 0.04 },
  neon_purple: { color: 0xa855f7, roughness: 0.18, metalness: 0.05, variation: 0.04 },
  repulsor_violet: { color: 0xa78bfa, roughness: 0.15, metalness: 0.12, variation: 0.04 },
  sky_blue: { color: 0x38bdf8, roughness: 0.2, metalness: 0.08, variation: 0.05 },
  stone: { color: 0x78716c, roughness: 0.86, metalness: 0.04, variation: 0.2 },
  rescue_green: { color: 0x22c55e, roughness: 0.4, metalness: 0.08, variation: 0.08 },
};

const mapCache = new Map();

function resolveSurface(colorOrPreset, extra = {}) {
  const preset = typeof colorOrPreset === 'string' ? SURFACE_PRESETS[colorOrPreset] : null;
  const base = preset || { color: colorOrPreset, roughness: 0.72, metalness: 0.12, variation: 0.14 };
  return {
    color: extra.color ?? base.color,
    roughness: extra.roughness ?? base.roughness,
    metalness: extra.metalness ?? base.metalness,
    variation: extra.variation ?? base.variation,
    cacheKey: preset ? colorOrPreset : `c${base.color}`,
  };
}

function mapsFor(surface) {
  const key = `${surface.cacheKey}_${surface.roughness}_${surface.variation}`;
  if (!mapCache.has(key)) {
    mapCache.set(key, createTerrainMaps(surface.color, {
      roughness: surface.roughness,
      variation: surface.variation,
    }));
  }
  return mapCache.get(key);
}

export function flyingMat(colorOrPreset, extra = {}) {
  const surface = resolveSurface(colorOrPreset, extra);
  const useMaps = extra.maps !== false && !extra.emissive && extra.transparent !== true;
  const maps = useMaps ? mapsFor(surface) : null;
  return pbrMat(surface.color, {
    roughness: surface.roughness,
    metalness: surface.metalness,
    emissive: extra.emissive ?? 0x000000,
    emi: extra.emi ?? 0,
    map: extra.map ?? maps?.colorMap ?? null,
    normalMap: extra.normalMap ?? maps?.normalMap ?? null,
    roughnessMap: extra.roughnessMap ?? maps?.roughnessMap ?? null,
    transparent: extra.transparent ?? false,
    opacity: extra.opacity ?? 1,
    transmission: extra.transmission ?? 0,
    ior: extra.ior ?? 1.5,
  });
}

export function flyingMissionMat(color, opacity = 1, glow = 0.22) {
  const maps = mapsFor(resolveSurface(color, { variation: 0.06 }));
  return pbrMat(color, {
    roughness: 0.42,
    metalness: 0.14,
    emissive: color,
    emi: glow,
    map: maps.colorMap,
    normalMap: maps.normalMap,
    transparent: opacity < 1,
    opacity,
  });
}

export const flyingGeo = {
  box: (w, h, d) => new THREE.BoxGeometry(w, h, d),
  sphere: (r, ws = 24, hs = 18) => new THREE.SphereGeometry(r, ws, hs),
  cylinder: (rt, rb, h, seg = 24) => new THREE.CylinderGeometry(rt, rb, h, seg),
  torus: (r, tube, rs = 20, ts = 48, arc = Math.PI * 2) => new THREE.TorusGeometry(r, tube, rs, ts, arc),
  plane: (w, h, ws = 2, hs = 2) => new THREE.PlaneGeometry(w, h, ws, hs),
  cone: (r, h, seg = 24) => new THREE.ConeGeometry(r, h, seg),
  capsule: (r, len, cap = 8, radial = 16) => new THREE.CapsuleGeometry(r, len, cap, radial),
};

export function flyingAdd(group, geo, material, x, y, z, name, options = {}) {
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.set(x, y, z);
  mesh.castShadow = options.castShadow !== false;
  mesh.receiveShadow = options.receiveShadow !== false;
  if (options.rotX != null) mesh.rotation.x = options.rotX;
  if (options.rotY != null) mesh.rotation.y = options.rotY;
  if (options.rotZ != null) mesh.rotation.z = options.rotZ;
  if (options.scale) mesh.scale.set(...options.scale);
  mesh.name = name;
  group.add(mesh);
  return mesh;
}

export function installFlyingCinematicLighting(scene, bounds, sky = {}) {
  if (scene.getObjectByName('aaa-light-rig') || scene.getObjectByName('PremiumKidSun')) return;
  const horizon = new THREE.Color(sky.horizon || sky.mid || '#ffd39a');
  const top = new THREE.Color(sky.top || '#3478b8');
  buildCinematicLighting(scene, bounds || { cx: 0, cz: -90, spanX: 120 }, {
    keyLight: horizon.clone().lerp(new THREE.Color('#fff4e0'), 0.35).getHex(),
    fillLight: top.clone().lerp(new THREE.Color('#ffffff'), 0.4).getHex(),
    rimLight: 0xffffff,
    ambient: top.getHex(),
    ground: horizon.clone().offsetHSL(0, -0.08, -0.15).getHex(),
  }, { castShadow: true, lightBoost: 1.22 });
  const key = scene.children.find((c) => c.isDirectionalLight && c.castShadow);
  if (key?.shadow) {
    key.shadow.mapSize.set(4096, 4096);
    key.shadow.radius = 2;
  }
}

function helipadMarkings(group, x, y, z, radius, prefix) {
  flyingAdd(group, flyingGeo.torus(radius * 0.72, 0.08, 12, 48), flyingMat('helipad_yellow'), x, y + 0.02, z, `${prefix}Ring`);
  flyingAdd(group, flyingGeo.box(radius * 0.12, 0.04, radius * 1.1), flyingMat('helipad_yellow'), x, y + 0.03, z, `${prefix}CrossA`);
  flyingAdd(group, flyingGeo.box(radius * 1.1, 0.04, radius * 0.12), flyingMat('helipad_yellow'), x, y + 0.03, z, `${prefix}CrossB`);
}

export function buildRealisticOilRig(group, x, y, z, name, extras = {}) {
  const legOffsets = [[-5.5, -5.5], [5.5, -5.5], [-5.5, 5.5], [5.5, 5.5]];
  legOffsets.forEach(([lx, lz], i) => {
    flyingAdd(group, flyingGeo.cylinder(0.55, 0.7, 14, 16), flyingMat('painted_steel'), x + lx, y - 6.5, z + lz, `${name}Leg${i}`);
    flyingAdd(group, flyingGeo.box(12, 0.35, 0.35), flyingMat('rust'), x, y - 2.5, z + lz, `${name}Brace${i}`);
  });
  flyingAdd(group, flyingGeo.box(16, 0.85, 16), flyingMat('steel_deck'), x, y, z, `${name}Deck`);
  flyingAdd(group, flyingGeo.cylinder(4.2, 4.2, 0.18, 32), flyingMat('helipad_yellow', { emissive: 0xfbbf24, emi: 0.12 }), x, y + 0.62, z, `${name}Helipad`);
  helipadMarkings(group, x, y + 0.66, z, 3.8, name);
  flyingAdd(group, flyingGeo.cylinder(0.22, 0.28, 9, 16), flyingMat('beacon_red'), x + 6.2, y + 4.8, z + 6.2, `${name}BeaconPole`);
  flyingAdd(group, flyingGeo.sphere(0.65, 16, 12), flyingMat('beacon_red', { emissive: 0xef4444, emi: 0.75 }), x + 6.2, y + 9.5, z + 6.2, `${name}BeaconLight`);
  flyingAdd(group, flyingGeo.box(0.5, 7, 0.5), flyingMat('painted_steel'), x - 6, y + 3.8, z - 5, `${name}CraneMast`);
  flyingAdd(group, flyingGeo.box(7, 0.35, 0.35), flyingMat('painted_steel'), x - 2.5, y + 7.2, z - 5, `${name}CraneArm`);
  if (extras.fire) {
    flyingAdd(group, flyingGeo.cone(2.8, 5.5, 16), flyingMat('fire_orange', { emissive: 0xf97316, emi: 0.72 }), x, y + 3.2, z, `${name}Fire`);
  }
  if (extras.snowCap) {
    flyingAdd(group, flyingGeo.cone(5.5, 7.5, 20), flyingMat('snow'), x, y + 5.2, z, `${name}SnowCap`);
  }
  return group;
}

export function buildRealisticLabPad(group, x, y, z, name, rotY = 0) {
  const padGroup = new THREE.Group();
  padGroup.name = name;
  padGroup.position.set(x, y, z);
  padGroup.rotation.y = rotY;
  group.add(padGroup);
  flyingAdd(padGroup, flyingGeo.box(11.5, 0.95, 11.5), flyingMat('lab_floor'), 0, 0, 0, `${name}Pad`);
  [[-5.2, -5.2], [5.2, -5.2], [5.2, 5.2], [-5.2, 5.2]].forEach(([rx, rz], i) => {
    flyingAdd(padGroup, flyingGeo.cylinder(0.14, 0.14, 2.8, 12), flyingMat('dark_steel'), rx, 1.6, rz, `${name}Strut${i}`);
    flyingAdd(padGroup, flyingGeo.cylinder(0.1, 0.1, 1.2, 10), flyingMat('glass_plasma', { emissive: 0x22d3ee, emi: 0.35 }), rx, 2.9, rz, `${name}Rail${i}`);
  });
  flyingAdd(padGroup, flyingGeo.box(10.5, 0.08, 0.35), flyingMat('glass_plasma', { emissive: 0x22d3ee, emi: 0.42 }), 0, 0.58, 5.2, `${name}PlasmaEdge`);
  return padGroup;
}

export function buildRealisticOceanPlane(group, x, y, z, w = 420, h = 420, name = 'Ocean', opacity = 0.92) {
  const mesh = flyingAdd(
    group,
    flyingGeo.plane(w, h, 32, 32),
    flyingMat('ocean', { transparent: true, opacity, transmission: 0.12, roughness: 0.04 }),
    x, y, z,
    name,
  );
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

export function cloudPuffMat(opacity = 0.32, tint = 0xffffff) {
  return new THREE.MeshPhysicalMaterial({
    color: tint,
    transparent: true,
    opacity,
    roughness: 0.98,
    metalness: 0,
    depthWrite: false,
    fog: true,
  });
}

/** Warm sunset-lit underside, cool white top — matches reference cloud look. */
export function cloudPuffMatLayered(opacity = 0.32, layerRatio = 0.5) {
  const warm = layerRatio < 0.45 ? 0xffc896 : 0xffffff;
  return cloudPuffMat(opacity, warm);
}

export function buildRealisticCloudBank(group, x, y, z, scale = 1, name = 'CloudBank') {
  const bank = new THREE.Group();
  bank.name = name;
  bank.position.set(x, y, z);
  group.add(bank);
  const puffs = [
    [0, 0, 0, 1.3, 0.34], [2.1, 0.5, 0.7, 0.9, 0.28], [-1.8, 0.3, -0.5, 1.0, 0.3],
    [0.6, 0.9, -1.4, 0.75, 0.26], [-1.0, -0.2, 1.2, 0.85, 0.29], [2.4, -0.1, -0.9, 0.65, 0.24],
    [-2.2, 0.6, 0.3, 0.7, 0.27], [1.2, -0.4, 1.5, 0.6, 0.25],
  ];
  puffs.forEach(([px, py, pz, s, op], i) => {
    const layerT = (py + 1) / 2;
    flyingAdd(
      bank,
      flyingGeo.sphere(3.8 * s, 18, 14),
      cloudPuffMatLayered(op, layerT),
      px * scale,
      py * scale * 0.45,
      pz * scale,
      `${name}Puff${i}`,
      { scale: [1.55 * scale, 0.42 * scale, 1.25 * scale], rotY: i * 0.35 },
    );
  });
  return bank;
}

/** Tall fluffy cloud column for slalom pillars and midground markers. */
export function buildRealisticCloudColumn(group, x, y, z, name, height = 20, width = 5.5) {
  const col = new THREE.Group();
  col.name = name;
  col.position.set(x, y, z);
  group.add(col);
  const layers = Math.min(6, Math.ceil(height / 3.2));
  for (let j = 0; j < layers; j++) {
    const layerY = j * 2.6;
    const puffCount = 3 + (j % 2);
    const layerWidth = width * (1 - j * 0.04);
    for (let p = 0; p < puffCount; p++) {
      const ang = (p / puffCount) * Math.PI * 2 + j * 0.55;
      const rad = layerWidth * (0.28 + (p % 3) * 0.12);
      const r = 1.8 + (p % 4) * 0.45;
      flyingAdd(
        col,
        flyingGeo.sphere(r, 16, 12),
        cloudPuffMatLayered(0.24 + (j % 3) * 0.06, j / layers),
        Math.cos(ang) * rad,
        layerY,
        Math.sin(ang) * rad,
        `${name}L${j}P${p}`,
        { scale: [1.6, 0.38, 1.3], rotY: ang * 0.5 },
      );
    }
  }
  return col;
}

/** Distant cyber skyline — low mesh count, sits on the vista floor (never at flight altitude). */
export function buildCyberCitySilhouette(group, cx, floorY, cz, width = 360, depth = 200) {
  const root = new THREE.Group();
  root.name = 'CyberCitySilhouette';
  root.position.set(cx, floorY, cz);
  group.add(root);

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#0a1628';
  ctx.fillRect(0, 0, 512, 256);
  let seed = 77;
  const rnd = () => {
    seed = (seed * 16807 + 7) % 2147483647;
    return seed / 2147483647;
  };
  for (let i = 0; i < 48; i++) {
    const bw = 8 + rnd() * 22;
    const bh = 40 + rnd() * 180;
    const bx = rnd() * (512 - bw);
    ctx.fillStyle = `rgb(${12 + rnd() * 18},${22 + rnd() * 28},${38 + rnd() * 35})`;
    ctx.fillRect(bx, 256 - bh, bw, bh);
    if (rnd() > 0.35) {
      ctx.fillStyle = '#00d4ff';
      ctx.globalAlpha = 0.35 + rnd() * 0.45;
      ctx.fillRect(bx + bw * 0.15, 256 - bh * 0.85, bw * 0.12, bh * 0.7);
      ctx.globalAlpha = 1;
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const skyline = new THREE.Mesh(
    new THREE.PlaneGeometry(width, depth * 0.62),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.95, depthWrite: false, fog: true }),
  );
  skyline.rotation.x = -0.08;
  skyline.position.set(0, depth * 0.28, -depth * 0.42);
  skyline.name = 'CitySkylineBillboard';
  root.add(skyline);

  const haze = new THREE.Mesh(
    new THREE.PlaneGeometry(width * 1.1, depth),
    new THREE.MeshBasicMaterial({ color: 0x4a6080, transparent: true, opacity: 0.25, depthWrite: false, fog: true }),
  );
  haze.rotation.x = -Math.PI / 2;
  haze.position.set(0, 1, -depth * 0.2);
  haze.name = 'CityGroundHaze';
  root.add(haze);
  return root;
}

/** @deprecated Use buildCyberCitySilhouette — full mesh city caused flight-path clipping. */
export function buildCyberCityVista(group, cx, baseY, cz) {
  return buildCyberCitySilhouette(group, cx, baseY, cz);
}

/** Reference screenshot: neon-green pad + gold/white stacked coins. */
export function buildPremiumPlatformWithCoins(group, x, y, z, name = 'PremiumPad', size = 14) {
  flyingAdd(group, flyingGeo.box(size, 0.55, size), flyingMat('rescue_green', { emissive: 0x22c55e, emi: 0.4 }), x, y, z, `${name}Slab`);
  flyingAdd(group, flyingGeo.box(size * 0.92, 0.1, size * 0.92), flyingMat('rescue_green', { emissive: 0x22c55e, emi: 0.62 }), x, y + 0.34, z, `${name}GlowEdge`);
  for (let i = 0; i < 4; i++) {
    const coinColor = i % 2 ? 0xfbbf24 : 0xf8fafc;
    flyingAdd(
      group,
      flyingGeo.cylinder(1.2, 1.2, 0.26, 20),
      flyingMat(coinColor, { emissive: coinColor, emi: 0.28, metalness: 0.4 }),
      x,
      y + 0.58 + i * 0.3,
      z,
      `${name}Coin${i}`,
    );
  }
  return group;
}

/** Place 2–3 reference-style platforms beside the flight path (all missions). */
export function installReferencePathPlatforms(curve, root, { count = 3, side = 22, yDrop = 5 } = {}) {
  if (!curve || !root) return;
  for (let i = 0; i < count; i++) {
    const t = 0.1 + ((i + 1) / (count + 1)) * 0.75;
    const p = curve.getPoint(t);
    const tan = curve.getTangent(t).normalize();
    const right = new THREE.Vector3(tan.z, 0, -tan.x);
    const lateral = (i % 2 ? 1 : -1) * (side + (i % 3) * 5);
    const pos = p.clone().addScaledVector(right, lateral).add(new THREE.Vector3(0, -yDrop + (i % 2), 0));
    buildPremiumPlatformWithCoins(root, pos.x, pos.y, pos.z, `PathPlatform${i}`, 13 + (i % 2) * 2);
  }
}

/** Cyan tutorial arch beside spawn — visible in mode 1 screenshots. */
export function buildTutorialSkyArch(group, curve, t, side, drop, primary, name = 'TutorialArch') {
  const p = curve.getPoint(t);
  const tan = curve.getTangent(t).normalize();
  const right = new THREE.Vector3(tan.z, 0, -tan.x);
  const pos = p.clone().addScaledVector(right, side).add(new THREE.Vector3(0, -drop, 0));
  const yaw = Math.atan2(tan.x, tan.z);
  const arch = flyingAdd(
    group,
    flyingGeo.torus(11, 0.75, 20, 48, Math.PI),
    flyingMat(primary, { emissive: primary, emi: 0.55 }),
    pos.x,
    pos.y + 10,
    pos.z,
    name,
  );
  arch.rotation.y = yaw;
  arch.rotation.z = Math.PI / 2;
  return arch;
}

export function buildFloatingPlatform(group, x, y, z, size = 14, name = 'FloatPad') {
  return buildPremiumPlatformWithCoins(group, x, y, z, name, size);
}

export function buildRealisticCarrierDeck(group, x, y, z, name = 'Carrier') {
  flyingAdd(group, flyingGeo.box(110, 2.2, 38), flyingMat('asphalt', { metalness: 0.35 }), x, y, z, `${name}Deck`);
  flyingAdd(group, flyingGeo.box(110, 0.08, 0.55), flyingMat('white_paint'), x, y + 1.22, z, `${name}CenterLine`);
  flyingAdd(group, flyingGeo.box(18, 9, 7), flyingMat('painted_steel'), x - 35, y + 4.8, z + 10, `${name}Island`);
  flyingAdd(group, flyingGeo.cylinder(3.5, 4, 1.2, 20), flyingMat('dark_steel'), x - 35, y + 10, z + 10, `${name}Radar`);
  return group;
}

export function buildRealisticOffshorePlatform(start) {
  const g = new THREE.Group();
  g.name = 'FlyingSpawn:offshore_platform';
  const base = start.clone().add(new THREE.Vector3(-12, -14, -4));
  buildRealisticOilRig(g, base.x, base.y, base.z, 'SpawnRig');
  return g;
}

export function buildRealisticRepulsorGate(start) {
  const g = new THREE.Group();
  g.name = 'FlyingSpawn:repulsor_gate';
  const pos = start.clone().add(new THREE.Vector3(0, -8, -6));
  g.position.copy(pos);
  flyingAdd(g, flyingGeo.torus(3.2, 0.38, 20, 48), flyingMat('repulsor_violet', { emissive: 0xa78bfa, emi: 0.55 }), 0, 0, 0, 'RepulsorRing', { rotX: Math.PI / 2 });
  flyingAdd(g, flyingGeo.torus(2.4, 0.06, 12, 36), flyingMat('repulsor_violet', { emissive: 0xc4b5fd, emi: 0.85 }), 0, 0, 0, 'RepulsorCore', { rotX: Math.PI / 2 });
  [-2.8, 2.8].forEach((sx, i) => {
    flyingAdd(g, flyingGeo.cylinder(0.35, 0.45, 5.5, 16), flyingMat('dark_steel'), sx, -2.8, 0, `Pylon${i}`);
  });
  return g;
}
