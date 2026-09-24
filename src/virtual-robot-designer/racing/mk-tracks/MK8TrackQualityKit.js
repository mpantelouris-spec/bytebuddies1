/**
 * MK8TrackQualityKit.js — Mario Kart 8–grade shared track dressing & hero props.
 * Reference fidelity: chunky moss curbs, twin gold lanes, glowing landmarks, particle life.
 */
import * as THREE from 'three';
import { placeAtTrack } from '../GameWorldBuilder.js';
import { pbrMat } from './BiomeAAAKit.js';
import { getTrackStandard } from './CodeRacerTrackStandards.js';
import { isCosmicSkywayArena } from './CosmicSkywayRegistry.js';
import { buildSurfShack, buildMiningCartProp, buildTransitBreakRoom } from './TrackStoryKit.js';
import { buildResearchHut } from './VolcanoHeroKit.js';
import { buildHoloBillboard } from './CyberCityHeroKit.js';
import { buildSkiLodge } from './FrostPeakHeroKit.js';
import { buildTempleGate } from './RuinsHeroKit.js';
import { buildNeonRingGate } from './GalaxyHeroKit.js';
import { buildWindmillLandmark } from './MeadowHeroKit.js';
import { buildMetroNeonSign } from './MetroHeroKit.js';
import { buildGiantCrystalCluster } from './CrystalCavernHeroKit.js';
import { buildGear, buildToadstool, buildTemplePyramid } from './TrackPropBuilders.js';

function roadY(curve, t) {
  return curve.getPointAt(t).y || 0;
}

function mkMat(color, opts = {}) {
  return pbrMat(color, {
    roughness: opts.roughness ?? 0.45,
    metalness: opts.metalness ?? 0.1,
    emissive: opts.emissive ?? color,
    emi: opts.emi ?? 0,
    ...opts,
  });
}

/** Chunky stone slab overlay on drivable surface — reads like MK8 reference art. */
export function buildStoneSlabRoadOverlay(curve, hw, {
  steps = 56,
  slabColor = 0x2a9a8a,
  accentColor = 0x3db89e,
  width = 8,
  lipColor = 0x3d8a32,
  lipEmi = 0.12,
} = {}) {
  const g = new THREE.Group();
  g.name = 'mk8-stone-road';
  const baseMat = mkMat(slabColor, { roughness: 0.55, metalness: 0.08 });
  const accentMat = mkMat(accentColor, { roughness: 0.48, metalness: 0.12, emi: 0.08 });
  const lipMat = mkMat(lipColor, { roughness: 0.88, emi: lipEmi });
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const y = roadY(curve, t);
    const { pos, frame } = placeAtTrack(curve, t, 0, 0.08);
    const slab = new THREE.Mesh(
      new THREE.BoxGeometry(width, 0.22, 2.6 + (i % 3) * 0.15),
      i % 4 === 0 ? accentMat : baseMat,
    );
    slab.position.copy(pos);
    slab.position.y += y + 0.14;
    slab.rotation.y = (frame.rot ?? 0) + (i % 2 ? 0.02 : -0.02);
    g.add(slab);
    // Themed curb lips — match biome palette (never hardcoded grass green)
    [-1, 1].forEach((side) => {
      const lip = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.35, 2.4),
        lipMat,
      );
      const lipPos = placeAtTrack(curve, t, side * (width / 2 - 0.2), 0.2);
      lip.position.copy(lipPos.pos);
      lip.position.y += y + 0.28;
      lip.rotation.y = lipPos.frame.rot ?? 0;
      g.add(lip);
    });
  }
  return g;
}
export function buildMossCurbs(curve, hw, {
  steps = 24,
  mossColor = 0x3d8a32,
  flowerColor = 0xff69b4,
  curbHeight = 0.38,
  curbDepth = 0.72,
  flowers = true,
} = {}) {
  const g = new THREE.Group();
  g.name = 'mk8-moss-curbs';
  const mossMat = mkMat(mossColor, { roughness: 0.92 });
  const flowerMat = mkMat(flowerColor, { emi: 0.35, roughness: 0.6 });

  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const y = roadY(curve, t);
    [-1, 1].forEach((side) => {
      const off = side * (hw + curbDepth * 0.55);
      const { pos, frame } = placeAtTrack(curve, t, off, curbHeight * 0.5);
      const block = new THREE.Mesh(
        new THREE.BoxGeometry(curbDepth, curbHeight, curbDepth * 1.1),
        mossMat,
      );
      block.position.copy(pos);
      block.position.y += y + curbHeight * 0.5;
      block.rotation.y = frame.rot ?? 0;
      if (i % 3 === 0) block.scale.set(1.1, 1.15, 1.05);
      g.add(block);
      if (i % 4 === 0 && flowers) {
        const flower = new THREE.Mesh(new THREE.SphereGeometry(0.22, 6, 6), flowerMat);
        flower.position.copy(pos);
        flower.position.y += y + curbHeight + 0.15;
        flower.position.x += side * 0.15;
        g.add(flower);
      }
    });
  }
  return g;
}

/** Twin parallel gold center lines — MK8 Sky Garden lane read. */
export function buildTwinGoldLanes(curve, hw, {
  steps = 80,
  laneColor = 0xffd700,
  separation = 0.35,
  emi = 0.55,
} = {}) {
  const g = new THREE.Group();
  g.name = 'mk8-twin-gold-lanes';
  const laneMat = mkMat(laneColor, { metalness: 0.72, roughness: 0.18, emi: emi * 0.65 });
  [-separation, separation].forEach((off) => {
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const { pos, frame } = placeAtTrack(curve, t, off, 0.1);
      const seg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.1, 2.6), laneMat);
      seg.position.copy(pos);
      seg.position.y += roadY(curve, t) + 0.11;
      seg.rotation.y = frame.rot ?? 0;
      g.add(seg);
    }
  });
  return g;
}

/** Single dashed or solid center lane per biome accent. */
export function buildCenterLaneMarkings(curve, hw, {
  steps = 64,
  color = 0xffffff,
  dashed = true,
  emi = 0.45,
  width = 0.12,
} = {}) {
  const g = new THREE.Group();
  g.name = 'mk8-center-lanes';
  const mat = mkMat(color, { metalness: 0.5, roughness: 0.25, emi });
  for (let i = 0; i < steps; i++) {
    if (dashed && i % 2) continue;
    const t = i / steps;
    const { pos, frame } = placeAtTrack(curve, t, 0, 0.09);
    const dash = new THREE.Mesh(new THREE.BoxGeometry(width, 0.05, 1.6), mat);
    dash.position.copy(pos);
    dash.position.y += roadY(curve, t) + 0.1;
    dash.rotation.y = frame.rot ?? 0;
    g.add(dash);
  }
  return g;
}

/** Edge glow strips at track borders. */
export function buildEdgeGlowRails(curve, hw, color, steps = 36) {
  const g = new THREE.Group();
  g.name = 'mk8-edge-glow';
  const mat = mkMat(color, { emi: 0.28, roughness: 0.12, metalness: 0.2 });
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    [-hw - 0.15, hw + 0.15].forEach((off) => {
      const { pos, frame } = placeAtTrack(curve, t, off, 0.14);
      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.18, 3.2), mat);
      strip.position.copy(pos);
      strip.position.y += roadY(curve, t) + 0.12;
      strip.rotation.y = frame.rot ?? 0;
      g.add(strip);
    });
  }
  return g;
}

/** Giant lily flower — reference hero landmark with glow + petal drift. */
export function buildGiantLilyFlower(scale = 1.2) {
  const g = new THREE.Group();
  g.name = 'mk8-giant-lily';
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55 * scale, 0.75 * scale, 14 * scale, 12),
    mkMat(0x2d7a3a, { roughness: 0.82 }),
  );
  stem.position.y = 7 * scale;
  g.add(stem);

  const petalMat = mkMat(0xff69b4, { emi: 0.35, roughness: 0.45, metalness: 0.05 });
  for (let i = 0; i < 6; i++) {
    const petal = new THREE.Mesh(new THREE.SphereGeometry(4.2 * scale, 14, 12, 0, Math.PI * 2, 0, Math.PI / 2.2), petalMat);
    const a = (i / 6) * Math.PI * 2;
    petal.position.set(Math.cos(a) * 4.5 * scale, 13.5 * scale, Math.sin(a) * 4.5 * scale);
    petal.rotation.y = a;
    petal.scale.set(1.35, 0.55, 1.25);
    g.add(petal);
  }
  const center = new THREE.Mesh(
    new THREE.SphereGeometry(2.5 * scale, 16, 14),
    mkMat(0xffd700, { emi: 0.45, metalness: 0.35, roughness: 0.2 }),
  );
  center.position.y = 13.5 * scale;
  g.add(center);
  const light = new THREE.PointLight(0xff88cc, 1.2, 28);
  light.position.y = 14 * scale;
  g.add(light);
  g.userData.petalDrift = true;
  return g;
}

/** SKY EXPLORERS treehouse — telescope + banner (reference landmark). */
export function buildSkyExplorersTreehouse() {
  const g = new THREE.Group();
  g.name = 'mk8-sky-explorers-treehouse';
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.6, 9, 12), mkMat(0x5a3a1a, { roughness: 0.88 }));
  trunk.position.y = 4.5;
  g.add(trunk);
  const foliage = new THREE.Mesh(
    new THREE.SphereGeometry(5.5, 14, 12),
    mkMat(0x3a9e42, { roughness: 0.75, emissive: 0x1a5020, emi: 0.15 }),
  );
  foliage.position.y = 11;
  foliage.scale.set(1.2, 0.85, 1.2);
  g.add(foliage);
  const house = new THREE.Mesh(new THREE.BoxGeometry(5.5, 3.8, 4.2), mkMat(0x8b6914, { roughness: 0.82 }));
  house.position.set(0, 9.5, 1.2);
  g.add(house);
  const deck = new THREE.Mesh(new THREE.BoxGeometry(6, 0.25, 4.5), mkMat(0x6b4a20));
  deck.position.set(0, 7.8, 1.5);
  g.add(deck);
  const telescope = new THREE.Group();
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 2.2, 8), mkMat(0x888899, { metalness: 0.7 }));
  tube.rotation.z = -0.35;
  tube.position.set(1.8, 8.8, 2.5);
  telescope.add(tube);
  const lens = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), mkMat(0x44aaff, { emi: 0.6 }));
  lens.position.set(2.6, 9.2, 2.8);
  telescope.add(lens);
  g.add(telescope);
  const c = document.createElement('canvas');
  c.width = 640;
  c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#f8f8ff';
  ctx.fillRect(0, 0, 640, 128);
  ctx.strokeStyle = '#4a8a3a';
  ctx.lineWidth = 6;
  ctx.strokeRect(8, 8, 624, 112);
  ctx.fillStyle = '#2d6a32';
  ctx.font = 'bold 52px system-ui,sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SKY EXPLORERS', 320, 64);
  const bannerTex = new THREE.CanvasTexture(c);
  const banner = new THREE.Mesh(
    new THREE.PlaneGeometry(5.5, 1.4),
    new THREE.MeshBasicMaterial({ map: bannerTex, fog: false }),
  );
  banner.position.set(0, 11.5, 3.8);
  g.add(banner);
  return g;
}

/** Colorful giant mushroom cluster on floating rock. */
export function buildGiantMushroomCluster() {
  const g = new THREE.Group();
  g.name = 'mk8-mushroom-cluster';
  const rock = new THREE.Mesh(
    new THREE.CylinderGeometry(5, 6.5, 2.5, 12),
    mkMat(0x6a5a48, { roughness: 0.9 }),
  );
  rock.position.y = 1;
  g.add(rock);
  const specs = [
    { x: -2, z: 0, h: 4.5, cap: 0xff4444, scale: 1.3 },
    { x: 2.2, z: 1, h: 3.2, cap: 0x9b59b6, scale: 1.0 },
    { x: 0.5, z: -1.8, h: 5.2, cap: 0x3498db, scale: 1.5 },
    { x: -1, z: 2, h: 3.8, cap: 0xff69b4, scale: 1.1 },
  ];
  specs.forEach(({ x, z, h, cap, scale }) => {
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.35 * scale, 0.5 * scale, h, 8), mkMat(0xf5f0e8));
    stem.position.set(x, h / 2 + 1.2, z);
    g.add(stem);
    const capMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.4 * scale, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2),
      mkMat(cap, { emi: 0.7, roughness: 0.35 }),
    );
    capMesh.position.set(x, h + 1.5, z);
    capMesh.scale.set(1.4, 0.65, 1.4);
    g.add(capMesh);
    for (let d = 0; d < 4; d++) {
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), mkMat(0xffffff, { emi: 0.3 }));
      dot.position.set(x + (d - 1.5) * 0.35 * scale, h + 1.7, z + (d % 2) * 0.25);
      g.add(dot);
    }
  });
  return g;
}

export function buildPremiumWindmill() {
  const g = new THREE.Group();
  g.name = 'mk8-windmill';
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.2, 1.2, 10), mkMat(0x8a7a68, { roughness: 0.88 }));
  base.position.y = 0.6;
  g.add(base);
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.6, 11, 10), mkMat(0xf0ebe0, { roughness: 0.7 }));
  tower.position.y = 6.5;
  g.add(tower);
  const hub = new THREE.Mesh(new THREE.SphereGeometry(0.55, 10, 10), mkMat(0x666666, { metalness: 0.6 }));
  hub.position.y = 12.5;
  g.add(hub);
  for (let b = 0; b < 4; b++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.18, 6.5, 0.1), mkMat(0xffffff, { roughness: 0.55 }));
    blade.position.set(0, 12.5, 3.2);
    blade.rotation.y = (b / 4) * Math.PI * 2;
    blade.userData.blade = true;
    g.add(blade);
  }
  g.userData.spin = true;
  return g;
}

/** Multi-band rainbow arc through mist (reference bottom-right). */
export function buildRainbowArc(radius = 42, y = 22) {
  const g = new THREE.Group();
  g.name = 'mk8-rainbow';
  const colors = [0xff0000, 0xff8800, 0xffff00, 0x00ff00, 0x0088ff, 0x8800ff];
  colors.forEach((col, i) => {
    const arc = new THREE.Mesh(
      new THREE.TorusGeometry(radius - i * 0.35, 0.55, 6, 48, Math.PI),
      new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.42, fog: false }),
    );
    arc.rotation.x = Math.PI / 2;
    arc.rotation.z = -Math.PI / 5;
    arc.position.y = y + i * 0.15;
    g.add(arc);
  });
  return g;
}

export function buildWaterfallMist(width = 4, height = 16) {
  const g = new THREE.Group();
  g.name = 'mk8-waterfall';
  const fall = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({ color: 0xb8e8ff, transparent: true, opacity: 0.72, fog: false }),
  );
  fall.position.y = height / 2;
  g.add(fall);
  for (let m = 0; m < 12; m++) {
    const mist = new THREE.Mesh(
      new THREE.SphereGeometry(0.5 + (m % 3) * 0.35, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xddeeff, transparent: true, opacity: 0.35, fog: false }),
    );
    mist.position.set((m % 4 - 1.5) * 1.4, 1 + (m % 4) * 1.5, (Math.floor(m / 4) - 0.5) * 1.5);
    mist.scale.set(1.6, 0.7, 1.6);
    mist.userData.mist = true;
    g.add(mist);
  }
  return g;
}

/** Dense fluffy cloud sea below floating tracks. */
export function buildCloudSea(bounds, layers = 32) {
  const g = new THREE.Group();
  g.name = 'mk8-cloud-sea';
  for (let i = 0; i < layers; i++) {
    const puff = new THREE.Mesh(
      new THREE.SphereGeometry(10 + (i % 5) * 4, 12, 10),
      new THREE.MeshBasicMaterial({
        color: i % 3 ? 0xf8f8ff : 0xe8f4ff,
        transparent: true,
        opacity: 0.5 + (i % 3) * 0.08,
        fog: false,
      }),
    );
    puff.position.set(
      bounds.cx + Math.sin(i * 1.9) * bounds.spanX * 0.85,
      -22 - (i % 4) * 5,
      bounds.cz + Math.cos(i * 2.3) * bounds.spanZ * 0.85,
    );
    puff.scale.set(2.5, 0.55 + (i % 2) * 0.15, 2.2);
    g.add(puff);
  }
  return g;
}

/** Falling petal particles around giant flowers. */
export function buildPetalParticles(count = 40, color = 0xff69b4) {
  const g = new THREE.Group();
  g.name = 'mk8-petal-particles';
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.65, fog: false });
  for (let i = 0; i < count; i++) {
    const petal = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.18), mat);
    petal.position.set((Math.random() - 0.5) * 12, 4 + Math.random() * 14, (Math.random() - 0.5) * 12);
    petal.userData.petal = true;
    petal.userData.phase = Math.random() * Math.PI * 2;
    petal.userData.speed = 0.3 + Math.random() * 0.5;
    g.add(petal);
  }
  return g;
}

const BIOME_DRESSING = {
  desert_dunes_01: {
    moss: 0x2ecc71, flower: 0xff6b9d, lane: 0xffffff, edge: 0x00ced1,
    twinGold: false, dashed: true, slab: 0xff7f50, slabAccent: 0xff9955,
  },
  crystal_palace_01: {
    moss: 0x5fb55f, flower: 0x7cfc00, lane: 0x7cfc00, edge: 0x00ff88,
    twinGold: false, dashed: true, emi: 0.35, curbHeight: 0.42, slab: 0x4a8a3a, slabAccent: 0x5fb55f,
  },
  sky_island_01: {
    moss: 0x3d9e4a, flower: 0xff69b4, lane: 0xffd700, edge: 0x00fa9a,
    twinGold: true, dashed: false, slab: 0x2a9a8a, slabAccent: 0x3db89e,
  },
  volcano_canyon_01: {
    moss: 0x4a3020, flower: 0xff4500, lane: 0xff4500, edge: 0xffd700,
    twinGold: false, dashed: true, curbHeight: 0.65, slab: 0x2f2f2f, slabAccent: 0x4a3020,
  },
  cyber_boulevard_01: {
    moss: 0x111122, flower: 0xff00ff, lane: 0xff00ff, edge: 0x00bfff,
    twinGold: false, dashed: false, emi: 0.45, slab: 0x001f3f, slabAccent: 0x002a55,
  },
  ice_cavern_01: {
    moss: 0xe8f4ff, flower: 0xb8a9c9, lane: 0xc0c0c0, edge: 0x5dade2,
    twinGold: false, dashed: true, curbHeight: 0.55, slab: 0xb8ddf0, slabAccent: 0xd0eeff,
  },
  underwater_temple_01: {
    moss: 0x556b2f, flower: 0xffd700, lane: 0xffd700, edge: 0x40e0d0,
    twinGold: true, dashed: false, slab: 0x556b2f, slabAccent: 0x6a8040,
  },
  moonlight_cavern_01: {
    moss: 0x2a1040, flower: 0xff1493, lane: 0xffffff, edge: 0x8a2be2,
    twinGold: false, dashed: false, emi: 0.4, slab: 0x5a2a9a, slabAccent: 0x7a40c0,
  },
  forest_maze_01: {
    moss: 0x228b22, flower: 0x2ecc71, lane: 0xffffff, edge: 0xffd700,
    twinGold: false, dashed: true, slab: 0x556b2f, slabAccent: 0x6a8040,
  },
  magic_forest_01: {
    moss: 0x7cfc00, flower: 0xffd700, lane: 0xff69b4, edge: 0x7cb342,
    twinGold: true, dashed: false, emi: 0.35, slab: 0x7cb342, slabAccent: 0x8fd456,
  },
  sunset_cove_01: {
    moss: 0x3d9e4a, lip: 0x00ced1, flower: 0xff6b9d, lane: 0xffffff, edge: 0x00ced1,
    twinGold: false, dashed: true, emi: 0.28, slab: 0xff9955, slabAccent: 0xffb366,
  },
  candy_carnival_01: {
    moss: 0xffc8e8, lip: 0xff69b4, flower: 0xffd700, lane: 0xffd700, edge: 0xffd700,
    twinGold: true, dashed: false, emi: 0.42, slab: 0xffb6d9, slabAccent: 0xffd0e8,
  },
  neon_metro_01: {
    moss: 0x2a2a40, lip: 0x00ffff, flower: 0xff00ff, lane: 0xff00ff, edge: 0x00ffff,
    twinGold: false, dashed: false, emi: 0.5, slab: 0x1a1a28, slabAccent: 0x2a2a40,
  },
  cloud_citadel_01: {
    moss: 0x4a8a3a, lip: 0x87ceeb, flower: 0xff69b4, lane: 0xffd700, edge: 0x87ceeb,
    twinGold: true, dashed: false, emi: 0.35, slab: 0x6ab8a8, slabAccent: 0x7ec8b8,
  },
  jungle_ruins_01: {
    moss: 0x556b2f, lip: 0x7cfc00, flower: 0x7cfc00, lane: 0xffd700, edge: 0x556b2f,
    twinGold: false, dashed: true, emi: 0.25, slab: 0x556b2f, slabAccent: 0x6a8040,
  },
  frost_peak_01: {
    moss: 0xd0eeff, lip: 0x5dade2, flower: 0xb8a9c9, lane: 0xc0c0c0, edge: 0x5dade2,
    twinGold: false, dashed: true, curbHeight: 0.5, emi: 0.2, slab: 0xb8ddf0, slabAccent: 0xd0eeff,
  },
  lava_foundry_01: {
    moss: 0x4a3020, lip: 0xff4500, flower: 0xff4500, lane: 0xff4500, edge: 0xffd700,
    twinGold: false, dashed: true, curbHeight: 0.62, emi: 0.45, slab: 0x2f2f2f, slabAccent: 0x4a3020,
  },
  star_station_01: {
    moss: 0x14161e, lip: 0xff9a2e, flower: 0x33e6ff, lane: 0xff9a2e, edge: 0x33e6ff,
    twinGold: false, dashed: false, emi: 0.6, slab: 0x1c1e28, slabAccent: 0x262a36,
  },
  fairy_glen_01: {
    moss: 0x8fd456, lip: 0xff69b4, flower: 0xffd700, lane: 0xff69b4, edge: 0x7cb342,
    twinGold: true, dashed: false, emi: 0.38, slab: 0x9ed866, slabAccent: 0xb8e878,
  },
  thunder_ridge_01: {
    moss: 0x5a6068, lip: 0xffd700, flower: 0x87ceeb, lane: 0xffffff, edge: 0xffd700,
    twinGold: false, dashed: true, emi: 0.3, slab: 0x5a6068, slabAccent: 0x6a7080,
  },
};

/** MK8 play-layer dressing — lane markings + edge glow; kerbs from MarioKartTrackBuilder only on cup tracks. */
export function installMK8PlayDressing(world, curve, hw, arenaType, opts = {}) {
  const cfg = BIOME_DRESSING[arenaType]
    || (isCosmicSkywayArena(arenaType) ? BIOME_DRESSING.star_station_01 : null);
  if (!cfg) return;
  const tier = opts.qualityTier || 'medium';
  const cupIds = new Set([
    'sunset_cove_01', 'candy_carnival_01', 'neon_metro_01', 'cloud_citadel_01',
    'jungle_ruins_01', 'frost_peak_01', 'lava_foundry_01', 'star_station_01',
    'fairy_glen_01', 'thunder_ridge_01',
  ]);
  const isCup = cupIds.has(arenaType) || isCosmicSkywayArena(arenaType);
  // Cup tracks: skip heavy moss slabs — keep lane guides + edge glow for MK8 road read.
  if (isCup) {
    const steps = tier === 'high' ? 30 : tier === 'medium' ? 24 : 18;
    if (cfg.twinGold || arenaType === 'candy_carnival_01') {
      world.add(buildTwinGoldLanes(curve, hw, {
        laneColor: arenaType === 'candy_carnival_01' ? 0xffffff : cfg.lane,
        emi: cfg.emi ?? 0.32,
        steps,
      }));
    } else {
      world.add(buildCenterLaneMarkings(curve, hw, {
        color: cfg.lane ?? 0xffffff,
        dashed: cfg.dashed ?? true,
        emi: cfg.emi ?? 0.28,
        steps,
      }));
    }
    if (tier !== 'low') {
      world.add(buildEdgeGlowRails(curve, hw, cfg.edge ?? cfg.lip ?? 0x00ced1, Math.max(12, steps / 2)));
    }
    return;
  }
  const curbSteps = tier === 'high' ? 32 : tier === 'medium' ? 26 : 16;

  // Road surface = MarioKartTrackBuilder PBR only — never stack box slabs on the drivable mesh.
  // Cup tracks: kerbs from MarioKartTrackBuilder only (no chunky moss curb duplicates).
  if (!isCup && tier !== 'low') {
    const mossCurbs = opts.mossCurbs ?? true;
    if (mossCurbs) {
      world.add(buildMossCurbs(curve, hw, {
        steps: curbSteps,
        mossColor: cfg.moss,
        flowerColor: cfg.flower,
        curbHeight: cfg.curbHeight ?? 0.38,
        flowers: true,
      }));
    }
  }

  if (cfg.twinGold) {
    world.add(buildTwinGoldLanes(curve, hw, { laneColor: cfg.lane, emi: cfg.emi ?? 0.28, steps: curbSteps + 8 }));
  } else {
    world.add(buildCenterLaneMarkings(curve, hw, {
      color: cfg.lane,
      dashed: cfg.dashed ?? true,
      emi: cfg.emi ?? 0.22,
      steps: curbSteps + 4,
    }));
  }
  if (!isCup && tier !== 'low') {
    world.add(buildEdgeGlowRails(curve, hw, cfg.edge, Math.max(10, curbSteps / 2)));
  }
}

function placeCupProp(world, curve, finishT, frac, lateral, obj, yLift = 0) {
  const t = (finishT + frac) % 1;
  const p = placeAtTrack(curve, t, lateral, 0);
  obj.position.copy(p.pos);
  obj.position.y += roadY(curve, t) + yLift;
  obj.rotation.y = p.frame.rot ?? 0;
  world.add(obj);
  return obj;
}

function buildMetroTunnelArch() {
  const g = new THREE.Group();
  g.name = 'metro-tunnel-arch';
  const mat = pbrMat(0x101018, { roughness: 0.9 });
  const glow = pbrMat(0x00ffff, { emi: 0.7, roughness: 0.3 });
  [-6, 6].forEach((x) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(1.2, 8, 10), mat);
    wall.position.set(x, 4, 0);
    g.add(wall);
  });
  const roof = new THREE.Mesh(new THREE.BoxGeometry(14, 1, 10), mat);
  roof.position.y = 8.4;
  g.add(roof);
  const strip = new THREE.Mesh(new THREE.BoxGeometry(12, 0.12, 0.2), glow);
  strip.position.y = 7.8;
  g.add(strip);
  return g;
}

function buildIceBridgeVista(hw) {
  const g = new THREE.Group();
  g.name = 'frost-ice-bridge';
  const ice = new THREE.Mesh(
    new THREE.BoxGeometry(hw * 2 + 4, 0.35, 14),
    pbrMat(0x88ddff, { transparent: true, opacity: 0.7, emi: 0.25, roughness: 0.15 }),
  );
  ice.position.y = 0.2;
  g.add(ice);
  [-hw - 1.2, hw + 1.2].forEach((x) => {
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 1.4, 14),
      pbrMat(0xc0e8ff, { metalness: 0.6, emi: 0.2 }),
    );
    rail.position.set(x, 1.1, 0);
    g.add(rail);
  });
  const voidMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(22, 18),
    pbrMat(0x041018, { roughness: 1 }),
  );
  voidMesh.rotation.x = -Math.PI / 2;
  voidMesh.position.y = -6;
  g.add(voidMesh);
  return g;
}

function buildForgeGearArch(hw) {
  const g = new THREE.Group();
  g.name = 'hero-gear-arch';
  const left = buildGear(3.0);
  left.position.set(-hw - 2, 6, 0);
  g.add(left);
  const right = buildGear(3.0);
  right.position.set(hw + 2, 6, 0);
  g.add(right);
  return g;
}

function buildFairyToadstoolArch(hw) {
  const g = new THREE.Group();
  g.name = 'hero-toadstool-arch';
  const left = buildToadstool(2.2);
  left.position.set(-hw - 1.5, 0, 0);
  g.add(left);
  const right = buildToadstool(2.2);
  right.position.set(hw + 1.5, 0, 0);
  g.add(right);
  return g;
}

/** Place props on mid-track vistas — keeps start-line camera clear. */
function placeVista(curve, finishT, trackFrac, side, yOff = 0) {
  const t = (finishT + trackFrac) % 1;
  return placeAtTrack(curve, t, side, yOff);
}

/** Cup-track hero landmarks — MK8 focal props per 2026 lineup. */
function installCupHeroLandmarks(world, curve, hw, bounds, arenaType, finishT = 0) {
  switch (arenaType) {
    case 'sunset_cove_01': {
      const shack = buildSurfShack();
      const p = placeVista(curve, finishT, 0.45, -(hw + 20));
      shack.position.copy(p.pos);
      shack.position.y += roadY(curve, (finishT + 0.45) % 1);
      shack.rotation.y = (p.frame.rot ?? 0) + Math.PI / 2;
      world.add(shack);
      const wf = buildWaterfallMist(3, 10);
      const wp = placeVista(curve, finishT, 0.58, hw + 14);
      wf.position.copy(wp.pos);
      wf.position.y += roadY(curve, (finishT + 0.58) % 1);
      world.add(wf);
      return;
    }
    case 'candy_carnival_01': {
      const mushrooms = buildGiantMushroomCluster();
      mushrooms.scale.setScalar(1.25);
      const mp = placeVista(curve, finishT, 0.55, hw + 18);
      mushrooms.position.copy(mp.pos);
      mushrooms.position.y += roadY(curve, (finishT + 0.55) % 1);
      world.add(mushrooms);
      const lily = buildGiantLilyFlower(0.9);
      const lp = placeVista(curve, finishT, 0.35, -(hw + 16));
      lily.position.copy(lp.pos);
      lily.position.y += roadY(curve, (finishT + 0.35) % 1);
      world.add(lily);
      world.add(buildPetalParticles(28, 0xff69b4));
      return;
    }
    case 'neon_metro_01': {
      const bill = buildHoloBillboard('NEON METRO');
      const t = (finishT + 0.38) % 1;
      const p = placeAtTrack(curve, t, 0, 14);
      bill.position.copy(p.pos);
      bill.rotation.y = p.frame.rot ?? 0;
      world.add(bill);
      const sign = buildMetroNeonSign();
      const sp = placeVista(curve, finishT, 0.38, -(hw + 12));
      sign.position.copy(sp.pos);
      sign.position.y += roadY(curve, (finishT + 0.38) % 1);
      sign.rotation.y = (sp.frame.rot ?? 0) + Math.PI;
      world.add(sign);
      placeCupProp(world, curve, finishT, 0.38, 0, buildMetroTunnelArch());
      placeCupProp(world, curve, finishT, 0.62, 0, buildMetroTunnelArch());
      return;
    }
    case 'cloud_citadel_01': {
      world.add(buildCloudSea(bounds, 28));
      const treehouse = buildSkyExplorersTreehouse();
      treehouse.scale.setScalar(1.05);
      const p1 = placeVista(curve, finishT, 0.15, hw + 20);
      treehouse.position.copy(p1.pos);
      treehouse.position.y += roadY(curve, (finishT + 0.15) % 1);
      treehouse.rotation.y = (p1.frame.rot ?? 0) + Math.PI;
      world.add(treehouse);
      const windmill = buildPremiumWindmill();
      const wp = placeVista(curve, finishT, 0.18, -(hw + 20));
      windmill.position.copy(wp.pos);
      windmill.position.y += roadY(curve, (finishT + 0.18) % 1);
      world.add(windmill);
      const rainbow = buildRainbowArc(34, 42);
      rainbow.position.set(bounds.cx + bounds.spanX * 0.3, 10, bounds.cz - bounds.spanZ * 0.25);
      world.add(rainbow);
      return;
    }
    case 'jungle_ruins_01': {
      const gate = buildTempleGate();
      const t = (finishT + 0.12) % 1;
      const p = placeAtTrack(curve, t, 0, 0);
      gate.position.copy(p.pos);
      gate.rotation.y = p.frame.rot ?? 0;
      gate.position.y += roadY(curve, t);
      world.add(gate);
      const pyramid = buildTemplePyramid(1.4);
      const pp = placeVista(curve, finishT, 0.22, hw + 24);
      pyramid.position.copy(pp.pos);
      pyramid.position.y += roadY(curve, (finishT + 0.22) % 1);
      world.add(pyramid);
      return;
    }
    case 'frost_peak_01': {
      const lodge = buildSkiLodge();
      const t = (finishT + 0.06) % 1;
      const p = placeAtTrack(curve, t, hw + 16, 0);
      lodge.position.copy(p.pos);
      lodge.position.y += roadY(curve, t);
      world.add(lodge);
      placeCupProp(world, curve, finishT, 0.55, 0, buildIceBridgeVista(hw));
      return;
    }
    case 'lava_foundry_01': {
      placeCupProp(world, curve, finishT, 0.4, 0, buildForgeGearArch(hw));
      const hut = buildResearchHut();
      const t = (finishT + 0.42) % 1;
      const p = placeAtTrack(curve, t, hw + 14, 0);
      hut.position.copy(p.pos);
      hut.position.y += roadY(curve, t);
      world.add(hut);
      return;
    }
    case 'star_station_01': {
      const ring = buildNeonRingGate(16);
      const t = (finishT + 0.3) % 1;
      const p = placeAtTrack(curve, t, 0, 12);
      ring.position.copy(p.pos);
      ring.rotation.y = p.frame.rot ?? 0;
      world.add(ring);
      const crystal = buildGiantCrystalCluster();
      const cp = placeVista(curve, finishT, 0.5, -(hw + 16));
      crystal.position.copy(cp.pos);
      crystal.position.y += roadY(curve, (finishT + 0.5) % 1);
      world.add(crystal);
      return;
    }
    case 'fairy_glen_01': {
      placeCupProp(world, curve, finishT, 0.5, 0, buildFairyToadstoolArch(hw));
      const lily = buildGiantLilyFlower(1.05);
      const lp = placeVista(curve, finishT, 0.4, -(hw + 18));
      lily.position.copy(lp.pos);
      lily.position.y += roadY(curve, (finishT + 0.4) % 1);
      world.add(lily);
      world.add(buildPetalParticles(20, 0xff69b4));
      return;
    }
    case 'thunder_ridge_01': {
      const windmill = buildWindmillLandmark();
      const wp = placeVista(curve, finishT, 0.65, -(hw + 18));
      windmill.position.copy(wp.pos);
      windmill.position.y += roadY(curve, (finishT + 0.65) % 1);
      world.add(windmill);
      const wf = buildWaterfallMist(4, 14);
      const wfp = placeVista(curve, finishT, 0.62, hw + 14);
      wf.position.copy(wfp.pos);
      wf.position.y += roadY(curve, (finishT + 0.62) % 1);
      world.add(wf);
      return;
    }
    default:
      break;
  }
}

/** Per-biome hero landmark boost — reference-quality focal props. */
export function installMK8HeroLandmarks(world, curve, hw, bounds, arenaType, finishT = 0) {
  const cupIds = new Set([
    'sunset_cove_01', 'candy_carnival_01', 'neon_metro_01', 'cloud_citadel_01',
    'jungle_ruins_01', 'frost_peak_01', 'lava_foundry_01', 'star_station_01',
    'fairy_glen_01', 'thunder_ridge_01',
  ]);
  if (cupIds.has(arenaType)) {
    installCupHeroLandmarks(world, curve, hw, bounds, arenaType, finishT);
    return;
  }

  const std = getTrackStandard(arenaType);
  const label = std?.startLabel || std?.displayName || arenaType;

  if (arenaType === 'sky_island_01') {
    // Vista placements — never block the start-line chase camera
    const lily = buildGiantLilyFlower(1.0);
    const { pos, frame } = placeVista(curve, finishT, 0.42, -(hw + 22));
    lily.position.copy(pos);
    lily.position.y += roadY(curve, (finishT + 0.42) % 1);
    lily.rotation.y = (frame.rot ?? 0) + 0.15;
    world.add(lily);
    world.add(buildPetalParticles(16, 0xff69b4));

    const treehouse = buildSkyExplorersTreehouse();
    treehouse.scale.setScalar(1.1);
    const p1 = placeVista(curve, finishT, 0.55, hw + 20);
    treehouse.position.copy(p1.pos);
    treehouse.position.y += roadY(curve, (finishT + 0.55) % 1);
    treehouse.rotation.y = (p1.frame.rot ?? 0) + Math.PI;
    world.add(treehouse);

    const mushrooms = buildGiantMushroomCluster();
    mushrooms.scale.setScalar(1.15);
    const mp = placeVista(curve, finishT, 0.68, -(hw + 18));
    mushrooms.position.copy(mp.pos);
    mushrooms.position.y += roadY(curve, (finishT + 0.68) % 1);
    world.add(mushrooms);

    const windmill = buildPremiumWindmill();
    windmill.scale.setScalar(1.0);
    const wp = placeVista(curve, finishT, 0.28, hw + 22);
    windmill.position.copy(wp.pos);
    windmill.position.y += roadY(curve, (finishT + 0.28) % 1);
    world.add(windmill);

    const rainbow = buildRainbowArc(36, 38);
    rainbow.position.set(bounds.cx + bounds.spanX * 0.35, 8, bounds.cz - bounds.spanZ * 0.3);
    world.add(rainbow);

    [0.35, 0.58].forEach((frac) => {
      const wf = buildWaterfallMist(3.5, 12);
      const { pos: wpos } = placeVista(curve, finishT, frac, hw + 14);
      wf.position.copy(wpos);
      wf.position.y += roadY(curve, (finishT + frac) % 1);
      world.add(wf);
    });
    return;
  }

  if (arenaType === 'desert_dunes_01') {
    const shack = buildSurfShack();
    const p = placeVista(curve, finishT, 0.45, -(hw + 20));
    shack.position.copy(p.pos);
    shack.position.y += roadY(curve, (finishT + 0.45) % 1);
    shack.rotation.y = (p.frame.rot ?? 0) + Math.PI / 2;
    world.add(shack);
    return;
  }

  if (arenaType === 'crystal_palace_01') {
    return;
  }

  if (arenaType === 'volcano_canyon_01') {
    const hut = buildResearchHut();
    const t = (finishT + 0.4) % 1;
    const p = placeAtTrack(curve, t, hw + 14, 0);
    hut.position.copy(p.pos);
    hut.position.y += roadY(curve, t);
    world.add(hut);
    return;
  }

  if (arenaType === 'cyber_boulevard_01') {
    const bill = buildHoloBillboard('CYBER GP');
    const t = (finishT + 0.08) % 1;
    const p = placeAtTrack(curve, t, 0, 14);
    bill.position.copy(p.pos);
    bill.rotation.y = p.frame.rot ?? 0;
    world.add(bill);
    return;
  }

  if (arenaType === 'ice_cavern_01') {
    const lodge = buildSkiLodge();
    const t = (finishT + 0.05) % 1;
    const p = placeAtTrack(curve, t, hw + 16, 0);
    lodge.position.copy(p.pos);
    lodge.position.y += roadY(curve, t);
    world.add(lodge);
    return;
  }

  if (arenaType === 'underwater_temple_01') {
    const gate = buildTempleGate();
    const t = (finishT + 0.12) % 1;
    const p = placeAtTrack(curve, t, 0, 0);
    gate.position.copy(p.pos);
    gate.rotation.y = p.frame.rot ?? 0;
    gate.position.y += roadY(curve, t);
    world.add(gate);
    return;
  }

  if (arenaType === 'moonlight_cavern_01') {
    const ring = buildNeonRingGate(14);
    const t = (finishT + 0.1) % 1;
    const p = placeAtTrack(curve, t, 0, 12);
    ring.position.copy(p.pos);
    ring.rotation.y = p.frame.rot ?? 0;
    world.add(ring);
    return;
  }

  if (arenaType === 'forest_maze_01') {
    const windmill = buildWindmillLandmark();
    const t = (finishT + 0.28) % 1;
    const p = placeAtTrack(curve, t, -(hw + 16), 0);
    windmill.position.copy(p.pos);
    windmill.position.y += roadY(curve, t);
    world.add(windmill);
    return;
  }

  if (arenaType === 'cyber_boulevard_01') {
    const room = buildTransitBreakRoom();
    const p2 = placeVista(curve, finishT, 0.62, -(hw + 12));
    room.position.copy(p2.pos);
    room.position.y += roadY(curve, (finishT + 0.62) % 1);
    room.rotation.y = (p2.frame.rot ?? 0) + Math.PI;
    world.add(room);
    return;
  }

  // Fallback plaque
  const plaque = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 2),
    new THREE.MeshBasicMaterial({
      map: (() => {
        const c = document.createElement('canvas');
        c.width = 512;
        c.height = 128;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#1a1a28';
        ctx.fillRect(0, 0, 512, 128);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 44px system-ui,sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label.toUpperCase().slice(0, 24), 256, 64);
        return new THREE.CanvasTexture(c);
      })(),
      fog: false,
    }),
  );
  const { pos, frame } = placeAtTrack(curve, finishT + 0.02, 0, 5);
  plaque.position.copy(pos);
  plaque.position.y += roadY(curve, finishT + 0.02) + 5;
  plaque.rotation.y = frame.rot ?? 0;
  world.add(plaque);
}

export function animateMK8Quality(world, time) {
  world.traverse((o) => {
    if (o.userData?.blade) o.rotation.y += 0.025;
    if (o.userData?.spin) {
      o.children.forEach((c) => { if (c.userData?.blade) c.rotation.y += 0.03; });
    }
    if (o.userData?.petal) {
      const ph = o.userData.phase ?? 0;
      const spd = o.userData.speed ?? 0.4;
      o.position.y -= spd * 0.02;
      o.position.x += Math.sin(time * 1.5 + ph) * 0.015;
      if (o.position.y < 0) o.position.y = 12 + Math.random() * 6;
    }
    if (o.userData?.mist) {
      o.material.opacity = 0.25 + Math.sin(time * 2 + o.id) * 0.12;
    }
  });
}
