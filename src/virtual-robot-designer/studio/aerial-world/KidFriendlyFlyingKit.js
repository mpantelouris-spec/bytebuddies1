/**
 * KidFriendlyFlyingKit — fluffy, rounded, colourful sky worlds for all 9 flyers.
 * Replaces dark premium vistas in chassis missions with readable kid scenery.
 */
import * as THREE from 'three';
import { pbrMat } from '../../racing/mk-tracks/BiomeAAAKit.js';
import { addParallaxCloudLayers, installAerialSky } from './AerialSkyKit.js';
import { flyingAdd, flyingGeo, flyingMat } from './FlyingArenaMaterialKit.js';
import { arenaMover } from '../ArenaBuilderCore.js';
import { buildFloatingIslandDetailed } from '../../racing/mk-tracks/SkyGardenHeroKit.js';

/** Bright fluffy sky shared by every kid flying mission. */
export const KID_FLYING_SKY = {
  top: '#4fc3f7',
  mid: '#87ceeb',
  horizon: '#ffe8b0',
  fog: '#e8f4ff',
  near: 95,
  far: 340,
};

/** Per-flyer accent colours — same cheerful sky, different ring/island tints. */
export const KID_FLYING_ACCENTS = {
  drone: { primary: 0x38bdf8, secondary: 0xfbbf24, cloud: 0xfff7ed, cloudAlt: 0xffe4e6, balloons: [0x38bdf8, 0xf472b6, 0xfbbf24] },
  helicopter: { primary: 0xfbbf24, secondary: 0x38bdf8, cloud: 0xfffbeb, cloudAlt: 0xe0f2fe, balloons: [0xfbbf24, 0x34d399, 0x60a5fa] },
  hoverbot: { primary: 0xc084fc, secondary: 0x22d3ee, cloud: 0xf5f3ff, cloudAlt: 0xecfeff, balloons: [0xa78bfa, 0x22d3ee, 0xf472b6] },
  jetplane: { primary: 0x60a5fa, secondary: 0xf87171, cloud: 0xffffff, cloudAlt: 0xffedd5, balloons: [0x3b82f6, 0xef4444, 0xfbbf24] },
  steathjet: { primary: 0x4ade80, secondary: 0x818cf8, cloud: 0xf0fdf4, cloudAlt: 0xeef2ff, balloons: [0x22c55e, 0x818cf8, 0x38bdf8] },
  aerobat: { primary: 0xfb923c, secondary: 0xf472b6, cloud: 0xfff7ed, cloudAlt: 0xffedd5, balloons: [0xfb923c, 0xf472b6, 0xfacc15] },
  racedrone: { primary: 0xf472b6, secondary: 0x34d399, cloud: 0xfff1f2, cloudAlt: 0xecfdf5, balloons: [0xec4899, 0x06b6d4, 0xa855f7] },
  hoverracer: { primary: 0xa855f7, secondary: 0x22d3ee, cloud: 0xfaf5ff, cloudAlt: 0xecfeff, balloons: [0xa855f7, 0x22d3ee, 0xf472b6] },
  rescuedrone: { primary: 0xfb923c, secondary: 0x22c55e, cloud: 0xffedd5, cloudAlt: 0xf0fdf4, balloons: [0xf97316, 0x22c55e, 0xfbbf24] },
};

const add = flyingAdd;
const geo = flyingGeo;
const mat = flyingMat;

function puff(parent, x, y, z, r, color, opacity = 0.82, name = 'Puff') {
  const m = new THREE.MeshBasicMaterial({
    color, transparent: true, opacity, depthWrite: false, fog: true,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 12), m);
  mesh.position.set(x, y, z);
  mesh.name = name;
  mesh.scale.set(1.15, 0.72, 1.05);
  parent.add(mesh);
  return mesh;
}

/** Rounded fluffy cloud stack — 4–6 puffs. */
export function buildFluffyCloudStack(parent, x, y, z, color = 0xffffff, scale = 1, name = 'FluffyCloud') {
  const g = new THREE.Group();
  g.name = name;
  g.position.set(x, y, z);
  const r = 3.2 * scale;
  puff(g, 0, 0, 0, r, color);
  puff(g, r * 0.65, r * 0.08, r * 0.15, r * 0.72, color, 0.78);
  puff(g, -r * 0.62, r * 0.05, -r * 0.12, r * 0.68, color, 0.76);
  puff(g, r * 0.1, r * 0.35, -r * 0.08, r * 0.55, color, 0.74);
  puff(g, -r * 0.15, -r * 0.12, r * 0.2, r * 0.48, color, 0.7);
  g.userData.bobCloud = true;
  g.userData.phase = Math.random() * Math.PI * 2;
  parent.add(g);
  return g;
}

/** Colourful floating island with grass cap + flag. */
export function buildRainbowIsland(parent, x, y, z, seed = 0, name = 'RainbowIsland') {
  const g = new THREE.Group();
  g.name = `${name}${seed}`;
  g.position.set(x, y, z);
  const island = buildFloatingIslandDetailed(5 + (seed % 3), 0x86efac, 0x4ade80);
  island.scale.setScalar(0.55 + (seed % 2) * 0.12);
  g.add(island);
  const flagColors = [0xf472b6, 0x38bdf8, 0xfbbf24, 0x34d399, 0xa855f7];
  const fc = flagColors[seed % flagColors.length];
  add(g, geo.cylinder(0.06, 0.06, 2.4, 8), mat('white_paint'), 0, 2.8, 0.8, 'FlagPole');
  add(g, geo.box(1.1, 0.7, 0.06), mat(fc, { emissive: fc, emi: 0.35 }), 0.55, 3.5, 0.8, 'FlagCloth');
  add(g, geo.sphere(0.35, 10, 8), mat(0xfbbf24, { emissive: 0xfbbf24, emi: 0.5 }), 0, 4.2, 0.8, 'FlagStar');
  g.userData.bobIsland = true;
  g.userData.phase = seed * 0.7;
  parent.add(g);
  return g;
}

/** Rounded star balloon bobbing above the route. */
export function buildStarBalloon(parent, x, y, z, color = 0xf472b6, name = 'StarBalloon') {
  const g = new THREE.Group();
  g.name = name;
  g.position.set(x, y, z);
  const balloon = add(g, geo.sphere(1.4, 16, 14), mat(color, { emissive: color, emi: 0.42, roughness: 0.35 }), 0, 2.2, 0, 'Balloon');
  balloon.scale.set(1, 1.12, 1);
  add(g, geo.cylinder(0.04, 0.04, 2.2, 6), mat('white_paint'), 0, 0.9, 0, 'String');
  const star = add(g, geo.sphere(0.28, 8, 6), mat(0xfbbf24, { emissive: 0xfbbf24, emi: 0.65 }), 0, 3.6, 0, 'BalloonStar');
  star.userData.spinStar = true;
  g.userData.bobBalloon = true;
  g.userData.phase = Math.random() * Math.PI * 2;
  parent.add(g);
  return g;
}

/** Candy-coloured welcome arch at spawn. */
export function buildCandyWelcomeArch(parent, x, y, z) {
  const g = new THREE.Group();
  g.name = 'CandyWelcomeArch';
  g.position.set(x, y, z);
  const colors = [0x38bdf8, 0xf472b6, 0xfbbf24, 0x34d399];
  [-5, 5].forEach((sx, i) => {
    add(g, geo.cylinder(0.55, 0.65, 8, 12), mat(colors[i % 4], { emissive: colors[i % 4], emi: 0.25 }), sx, 4, -2, `ArchPost${i}`);
  });
  const arch = add(g, geo.torus(5.5, 0.45, 12, 32, Math.PI), mat(0xf472b6, { emissive: 0xf472b6, emi: 0.35 }), 0, 8.5, -2, 'ArchRainbow', { rotZ: Math.PI });
  arch.userData.pulseArch = true;
  add(g, geo.torus(4.8, 0.25, 12, 32, Math.PI), mat(0x38bdf8, { emissive: 0x38bdf8, emi: 0.4 }), 0, 8.5, -1.6, 'ArchInner', { rotZ: Math.PI });
  parent.add(g);
  return g;
}

/** Vertical cloud pillar hint stack. */
function buildCloudPillar(parent, x, y, z, color, h = 14) {
  const g = new THREE.Group();
  g.name = 'CloudPillar';
  g.position.set(x, y, z);
  for (let i = 0; i < 5; i++) {
    puff(g, 0, i * (h / 5), 0, 1.8 - i * 0.12, color, 0.65 - i * 0.08, `PillarPuff${i}`);
  }
  parent.add(g);
  return g;
}

/** Soft cloud sea far below the flight path. */
function buildCloudSeaFloor(parent, cx, cz, span) {
  const g = new THREE.Group();
  g.name = 'KidCloudSeaFloor';
  for (let i = 0; i < 28; i++) {
    const lx = cx + (Math.random() - 0.5) * span;
    const lz = cz + (Math.random() - 0.5) * span * 0.6 - 40;
    buildFluffyCloudStack(g, lx, -28 + Math.random() * 4, lz, i % 2 ? 0xfff7ed : 0xffffff, 1.4 + Math.random() * 0.8, `SeaCloud${i}`);
  }
  parent.add(g);
  return g;
}

/** Main kid vista — fluffy corridor along the spline. */
export function installKidFriendlyFlyingWorld(root, scene, curve, bounds, contract) {
  const chassisId = contract?.chassisId || 'drone';
  const accent = KID_FLYING_ACCENTS[chassisId] || KID_FLYING_ACCENTS.drone;
  root.name = 'KidFriendlyFlyingWorld';
  root.userData.premiumEnvironment = 'kid_friendly_sky_garden';
  root.userData.artDirected = true;

  const start = curve.getPoint(0);
  buildCandyWelcomeArch(root, start.x, start.y - 1, start.z - 3);

  for (let i = 0; i < 18; i++) {
    const t = 0.04 + (i / 17) * 0.9;
    const p = curve.getPoint(t);
    const tan = curve.getTangent(t).normalize();
    const rx = tan.z;
    const rz = -tan.x;
    const side = 20 + (i % 3) * 4;
    buildFluffyCloudStack(root, p.x + rx * side, p.y - 3, p.z + rz * side, accent.cloud, 0.9 + (i % 2) * 0.15, `RouteCloudL${i}`);
    buildFluffyCloudStack(root, p.x - rx * side, p.y - 4, p.z - rz * side, accent.cloudAlt, 0.85 + (i % 2) * 0.12, `RouteCloudR${i}`);
    if (i % 2 === 0) {
      buildCloudPillar(root, p.x + rx * (side + 6), p.y - 8, p.z + rz * (side + 6), accent.primary, 12);
    }
    if (i % 3 === 1) {
      buildRainbowIsland(root, p.x - rx * (side + 10), p.y - 14, p.z - rz * (side + 8), i, `Island${i}`);
    }
    if (i % 2 === 0) {
      buildStarBalloon(root, p.x + (i % 4 - 2) * 3, p.y + 5 + (i % 3), p.z - 4, accent.balloons[i % 3], `Balloon${i}`);
    }
  }

  buildCloudSeaFloor(root, bounds.cx ?? 0, bounds.cz ?? 0, bounds.spanZ ?? 200);

  // Sparkle stars sprinkled along path
  const sparkleGeo = new THREE.BufferGeometry();
  const sparkleCount = 120;
  const positions = new Float32Array(sparkleCount * 3);
  for (let s = 0; s < sparkleCount; s++) {
    const t = Math.random();
    const p = curve.getPoint(t);
    positions[s * 3] = p.x + (Math.random() - 0.5) * 30;
    positions[s * 3 + 1] = p.y + Math.random() * 12;
    positions[s * 3 + 2] = p.z + (Math.random() - 0.5) * 20;
  }
  sparkleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const sparkles = new THREE.Points(
    sparkleGeo,
    new THREE.PointsMaterial({
      color: 0xfbbf24, size: 0.35, transparent: true, opacity: 0.85,
      depthWrite: false, blending: THREE.AdditiveBlending,
    }),
  );
  sparkles.name = 'KidSkySparkles';
  sparkles.userData.twinkle = true;
  root.add(sparkles);

  scene.userData.kidFlyingWorld = true;
  scene.userData.kidFlyingAccent = accent;
  return root;
}

export function installKidFriendlyFlyingSky(scene, bounds = {}, sky = KID_FLYING_SKY) {
  installAerialSky(scene, { sky, lockSky: true, parallaxClouds: true }, bounds);
  addParallaxCloudLayers(scene, bounds.cx ?? 0, bounds.cz ?? 0);
  scene.background = new THREE.Color(sky.mid || sky.top);
  if (scene.fog) {
    scene.fog.color.set(sky.fog || sky.mid);
    scene.fog.near = sky.near ?? 95;
    scene.fog.far = sky.far ?? 340;
  }
}

export function installKidFriendlyFlyingLighting(scene) {
  if (scene.getObjectByName('KidFlyingLights')) return;
  const rig = new THREE.Group();
  rig.name = 'KidFlyingLights';
  rig.add(new THREE.AmbientLight(0xfff7ed, 0.55));
  rig.add(new THREE.HemisphereLight(0x87ceeb, 0xffe8b0, 0.72));
  const sun = new THREE.DirectionalLight(0xfff4e0, 0.85);
  sun.position.set(40, 80, 30);
  rig.add(sun);
  const fill = new THREE.DirectionalLight(0xbae6fd, 0.35);
  fill.position.set(-30, 40, -20);
  rig.add(fill);
  scene.add(rig);
}

export function animateKidFriendlyFlying(scene, time) {
  scene.traverse((obj) => {
    if (obj.userData?.bobBalloon || obj.userData?.bobCloud || obj.userData?.bobIsland) {
      const ph = obj.userData.phase ?? 0;
      obj.position.y += Math.sin(time * 1.6 + ph) * 0.004;
    }
    if (obj.userData?.spinStar) obj.rotation.y = time * 1.2;
    if (obj.userData?.pulseArch && obj.material?.emissiveIntensity != null) {
      obj.material.emissiveIntensity = 0.28 + Math.sin(time * 2) * 0.12;
    }
    if (obj.userData?.twinkle && obj.material) {
      obj.material.opacity = 0.65 + Math.sin(time * 3.5) * 0.2;
    }
  });
}

/** Kid gate palette override for bible contract. */
export function getKidFlyingBibleOverrides(chassisId) {
  const accent = KID_FLYING_ACCENTS[chassisId] || KID_FLYING_ACCENTS.drone;
  return {
    sky: { ...KID_FLYING_SKY },
    gateColors: { primary: accent.primary, secondary: accent.secondary, final: 0x22c55e },
    goldenHour: false,
    parallaxClouds: true,
    bloom: 0.22,
  };
}
