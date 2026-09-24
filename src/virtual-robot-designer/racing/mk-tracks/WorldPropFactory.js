/**
 * WorldPropFactory.js — Unique foreground, midground, and skyline props.
 * Every prop is parameterized so no two instances look identical.
 */
import * as THREE from 'three';
import { pbrMat } from './BiomeAAAKit.js';
import {
  buildPalmTree, buildBeachUmbrella, buildCliff, buildCrystalCluster,
  buildGiantFlower, buildWaterfall, buildBasaltCliff, buildNeonBillboard,
  buildSkyscraper, buildSnowPine, buildTemplePillar, buildRedBarn,
  buildWindmill, buildCow, buildMetroArch, buildGraffitiWall, buildSteamVent,
} from './biome-world-kit.js';

const rng = (seed) => {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
};

function vary(g, seed, { scale = [0.85, 1.2], rot = 0.4 } = {}) {
  const r = rng(seed);
  const sc = scale[0] + r() * (scale[1] - scale[0]);
  g.scale.setScalar(sc);
  g.rotation.y += (r() - 0.5) * rot * Math.PI;
  g.userData.seed = seed;
  return g;
}

// ── Foreground (road-edge detail) ───────────────────────────────────────────

export function buildGrassClump(seed = 1) {
  const g = new THREE.Group();
  const r = rng(seed);
  const count = 4 + Math.floor(r() * 6);
  for (let i = 0; i < count; i++) {
    const h = 0.25 + r() * 0.55;
    const blade = new THREE.Mesh(
      new THREE.ConeGeometry(0.04 + r() * 0.03, h, 3),
      pbrMat(0x4a8a3a + Math.floor(r() * 0x080808), { roughness: 0.9 }),
    );
    blade.position.set((r() - 0.5) * 0.5, h * 0.5, (r() - 0.5) * 0.5);
    blade.rotation.z = (r() - 0.5) * 0.3;
    g.add(blade);
  }
  return vary(g, seed, { scale: [0.7, 1.3] });
}

export function buildWildflower(seed = 1, palette = [0xff6699, 0xffcc00, 0xff88cc, 0xffffff]) {
  const g = new THREE.Group();
  const r = rng(seed);
  const col = palette[Math.floor(r() * palette.length)];
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.5 + r() * 0.3, 4), pbrMat(0x3a7a2a));
  stem.position.y = 0.25;
  g.add(stem);
  const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.12 + r() * 0.08, 6, 6), pbrMat(col, { emissive: col, emi: 0.15 }));
  bloom.position.y = 0.55 + r() * 0.2;
  g.add(bloom);
  return vary(g, seed);
}

export function buildRoadRock(seed = 1) {
  const r = rng(seed);
  const geo = new THREE.DodecahedronGeometry(0.2 + r() * 0.35, 0);
  const mesh = new THREE.Mesh(geo, pbrMat(0x888877 + Math.floor(r() * 0x111111), { roughness: 0.92 }));
  mesh.position.y = 0.15;
  return vary(mesh, seed);
}

export function buildRaceBanner(seed = 1, color = 0xff4444) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 2.8, 5), pbrMat(0xcccccc, { metalness: 0.5 }));
  pole.position.y = 1.4;
  g.add(pole);
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.9), pbrMat(color, { emissive: color, emi: 0.2, side: THREE.DoubleSide }));
  flag.position.set(0.7, 2.2, 0);
  flag.userData.wave = true;
  flag.userData.phase = seed;
  g.add(flag);
  return vary(g, seed);
}

export function buildWoodenFenceSegment(seed = 1) {
  const g = new THREE.Group();
  const r = rng(seed);
  for (let p = 0; p < 4; p++) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.9 + r() * 0.2, 0.12), pbrMat(0x8b6914, { roughness: 0.85 }));
    post.position.set(p * 0.7, 0.45, 0);
    g.add(post);
  }
  const rail = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.08, 0.08), pbrMat(0x9a7844));
  rail.position.y = 0.7;
  g.add(rail);
  return vary(g, seed);
}

export function buildTireMark(seed = 1) {
  const r = rng(seed);
  const mark = new THREE.Mesh(
    new THREE.PlaneGeometry(0.8 + r() * 0.6, 0.15),
    pbrMat(0x222222, { roughness: 0.95, transparent: true, opacity: 0.6 }),
  );
  mark.rotation.x = -Math.PI / 2;
  mark.position.y = 0.02;
  mark.rotation.z = r() * Math.PI;
  return mark;
}

export function buildOilStain(seed = 1) {
  const r = rng(seed);
  const stain = new THREE.Mesh(
    new THREE.CircleGeometry(0.3 + r() * 0.4, 8),
    pbrMat(0x1a1a1a, { roughness: 0.2, metalness: 0.3, transparent: true, opacity: 0.5 }),
  );
  stain.rotation.x = -Math.PI / 2;
  stain.position.y = 0.015;
  return stain;
}

export function buildRoadSign(seed = 1, label = '→') {
  const g = new THREE.Group();
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 1.6, 5), pbrMat(0x888888, { metalness: 0.6 }));
  post.position.y = 0.8;
  g.add(post);
  const board = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.06), pbrMat(0x2266aa));
  board.position.y = 1.5;
  g.add(board);
  return vary(g, seed);
}

export function buildBush(seed = 1, color = 0x3a6a2a) {
  const r = rng(seed);
  const g = new THREE.Group();
  const blobs = 2 + Math.floor(r() * 3);
  for (let i = 0; i < blobs; i++) {
    const s = 0.3 + r() * 0.35;
    const blob = new THREE.Mesh(new THREE.SphereGeometry(s, 6, 5), pbrMat(color + Math.floor(r() * 0x050505), { roughness: 0.9 }));
    blob.position.set((r() - 0.5) * 0.6, s * 0.6, (r() - 0.5) * 0.6);
    blob.scale.y = 0.7 + r() * 0.3;
    g.add(blob);
  }
  return vary(g, seed, { scale: [0.8, 1.4] });
}

export function buildPebbles(seed = 1) {
  const g = new THREE.Group();
  const r = rng(seed);
  for (let i = 0; i < 3 + Math.floor(r() * 4); i++) {
    const peb = new THREE.Mesh(
      new THREE.SphereGeometry(0.04 + r() * 0.06, 5, 4),
      pbrMat(0x999988, { roughness: 0.95 }),
    );
    peb.position.set((r() - 0.5) * 0.4, 0.04, (r() - 0.5) * 0.4);
    peb.scale.y = 0.6;
    g.add(peb);
  }
  return g;
}

export function buildLantern(seed = 1, color = 0xffaa44) {
  const g = new THREE.Group();
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 2.2, 5), pbrMat(0x5a4030));
  post.position.y = 1.1;
  g.add(post);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), pbrMat(color, { emissive: color, emi: 0.8 }));
  lamp.position.y = 2.3;
  g.add(lamp);
  const light = new THREE.PointLight(color, 0.8, 8, 2);
  light.position.y = 2.3;
  g.add(light);
  g.userData.flicker = true;
  g.userData.phase = seed;
  return vary(g, seed);
}

// ── Midground (architecture, trees, water features) ─────────────────────────

export function buildVariedPalm(seed) {
  const r = rng(seed);
  return vary(buildPalmTree(0.75 + r() * 0.7), seed, { rot: 0.6 });
}

export function buildVariedPine(seed) {
  const r = rng(seed);
  return vary(buildSnowPine(0.7 + r() * 0.6), seed);
}

export function buildDeadTree(seed = 1) {
  const g = new THREE.Group();
  const r = rng(seed);
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.25, 3 + r() * 2, 5), pbrMat(0x4a3020, { roughness: 0.9 }));
  trunk.position.y = 1.5;
  trunk.rotation.z = (r() - 0.5) * 0.2;
  g.add(trunk);
  for (let i = 0; i < 2 + Math.floor(r() * 3); i++) {
    const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 1 + r(), 4), pbrMat(0x3a2818));
    branch.position.set((r() - 0.5) * 0.8, 2 + r() * 2, (r() - 0.5) * 0.5);
    branch.rotation.z = (r() - 0.5) * 1.2;
    g.add(branch);
  }
  return vary(g, seed);
}

export function buildMossyBoulder(seed = 1) {
  const r = rng(seed);
  const rock = new THREE.Mesh(
    new THREE.DodecahedronGeometry(1.2 + r() * 1.5, 1),
    pbrMat(0x6a6a5a, { roughness: 0.88 }),
  );
  rock.position.y = 0.8;
  const moss = new THREE.Mesh(new THREE.SphereGeometry(0.5 + r() * 0.4, 6, 5), pbrMat(0x3a6a2a, { roughness: 0.95 }));
  moss.position.set(0.3, 1.2, 0.2);
  moss.scale.y = 0.5;
  const g = new THREE.Group();
  g.add(rock);
  g.add(moss);
  return vary(g, seed);
}

export function buildMarketStall(seed = 1) {
  const g = new THREE.Group();
  const r = rng(seed);
  const table = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.8, 1.5), pbrMat(0x8b6914));
  table.position.y = 0.4;
  g.add(table);
  const awning = new THREE.Mesh(new THREE.BoxGeometry(3, 0.08, 2), pbrMat(0xcc4444 + Math.floor(r() * 0x002200)));
  awning.position.y = 2.2;
  g.add(awning);
  for (let leg = 0; leg < 4; leg++) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.2, 4), pbrMat(0x666666));
    pole.position.set((leg % 2 ? 1 : -1) * 1.2, 1.1, (leg < 2 ? -0.6 : 0.6));
    g.add(pole);
  }
  return vary(g, seed);
}

export function buildVillageCottage(seed = 1) {
  const g = new THREE.Group();
  const r = rng(seed);
  const body = new THREE.Mesh(new THREE.BoxGeometry(4 + r(), 3, 3.5), pbrMat(0xd4c4a8, { roughness: 0.8 }));
  body.position.y = 1.5;
  g.add(body);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(3.5, 2, 4), pbrMat(0x8b4513, { roughness: 0.85 }));
  roof.position.y = 4;
  roof.rotation.y = Math.PI / 4;
  g.add(roof);
  const chimney = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.5, 0.5), pbrMat(0x888888));
  chimney.position.set(1, 4.5, 0);
  g.add(chimney);
  return vary(g, seed, { scale: [0.9, 1.3] });
}

export function buildObservationTower(seed = 1) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(2, 2.5, 4, 8), pbrMat(0x888888, { roughness: 0.7 }));
  base.position.y = 2;
  g.add(base);
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.8, 12, 8), pbrMat(0xaaaaaa));
  tower.position.y = 10;
  g.add(tower);
  const deck = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 0.5, 8), pbrMat(0x666666));
  deck.position.y = 16;
  g.add(deck);
  return vary(g, seed);
}

export function buildGlowingMushroom(seed = 1) {
  const g = new THREE.Group();
  const r = rng(seed);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 0.6 + r() * 0.4, 6), pbrMat(0xddddcc));
  stem.position.y = 0.3;
  g.add(stem);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.4 + r() * 0.3, 8, 6), pbrMat(0x88ffaa, { emissive: 0x44ff88, emi: 0.6 }));
  cap.position.y = 0.8;
  cap.scale.y = 0.6;
  g.add(cap);
  return vary(g, seed);
}

export function buildNeonPylon(seed = 1) {
  const r = rng(seed);
  const col = [0xff00ff, 0x00ffff, 0xff4488][Math.floor(r() * 3)];
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 8 + r() * 4, 6), pbrMat(0x333344, { metalness: 0.7 }));
  pole.position.y = 4;
  g.add(pole);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.08, 6, 16), pbrMat(col, { emissive: col, emi: 1.0 }));
  ring.position.y = 7;
  ring.rotation.x = Math.PI / 2;
  g.add(ring);
  return vary(g, seed);
}

// ── Skyline / background silhouettes ────────────────────────────────────────

export function buildMountainSilhouette(width = 80, height = 35, seed = 1, color = 0x445566) {
  const r = rng(seed);
  const shape = new THREE.Shape();
  const peaks = 5 + Math.floor(r() * 4);
  shape.moveTo(-width / 2, 0);
  for (let i = 0; i <= peaks; i++) {
    const x = -width / 2 + (i / peaks) * width;
    const h = height * (0.4 + r() * 0.6);
    shape.lineTo(x, h);
  }
  shape.lineTo(width / 2, 0);
  shape.closePath();
  const mesh = new THREE.Mesh(
    new THREE.ShapeGeometry(shape),
    pbrMat(color, { roughness: 0.95, transparent: true, opacity: 0.85 }),
  );
  mesh.name = 'skyline-mountain';
  return mesh;
}

export function buildCitySkyline(width = 90, seed = 1) {
  const g = new THREE.Group();
  const r = rng(seed);
  const count = 8 + Math.floor(r() * 6);
  for (let i = 0; i < count; i++) {
    const h = 15 + r() * 35;
    const w = 3 + r() * 5;
    const bld = new THREE.Mesh(new THREE.BoxGeometry(w, h, 4), pbrMat(0x1a1a2a, { emissive: 0x001133, emi: 0.15 }));
    bld.position.set(-width / 2 + (i / count) * width + r() * 3, h / 2, 0);
    for (let win = 0; win < Math.floor(h / 3); win++) {
      if (r() > 0.4) {
        const light = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.6), pbrMat(0xffffaa, { emissive: 0xffff88, emi: 0.8 }));
        light.position.set(bld.position.x, win * 2.5 + 1, 2.1);
        g.add(light);
      }
    }
    g.add(bld);
  }
  g.name = 'skyline-city';
  return g;
}

export function buildDistantForest(width = 70, seed = 1, treeColor = 0x2a5a2a) {
  const g = new THREE.Group();
  const r = rng(seed);
  for (let i = 0; i < 20 + Math.floor(r() * 15); i++) {
    const h = 4 + r() * 8;
    const tree = new THREE.Mesh(new THREE.ConeGeometry(1.5 + r(), h, 5), pbrMat(treeColor + Math.floor(r() * 0x080808), { roughness: 0.9 }));
    tree.position.set(-width / 2 + r() * width, h / 2, r() * 3);
    tree.scale.setScalar(0.8 + r() * 0.5);
    g.add(tree);
  }
  g.name = 'skyline-forest';
  return g;
}

export function buildVolcanoSilhouette(seed = 1) {
  const g = new THREE.Group();
  const cone = new THREE.Mesh(new THREE.ConeGeometry(25, 45, 8), pbrMat(0x3a2a22, { roughness: 0.9 }));
  cone.position.y = 22;
  g.add(cone);
  const glow = new THREE.Mesh(new THREE.SphereGeometry(3, 8, 6), pbrMat(0xff4400, { emissive: 0xff2200, emi: 1.2 }));
  glow.position.y = 44;
  glow.userData.pulse = true;
  g.add(glow);
  g.name = 'skyline-volcano';
  return g;
}

// ── Prop registry for recipe runner ─────────────────────────────────────────

export const PROP_BUILDERS = {
  grass_clump: (s) => buildGrassClump(s),
  wildflower: (s, o) => buildWildflower(s, o?.palette),
  road_rock: (s) => buildRoadRock(s),
  race_banner: (s, o) => buildRaceBanner(s, o?.color),
  wooden_fence: (s) => buildWoodenFenceSegment(s),
  tire_mark: (s) => buildTireMark(s),
  oil_stain: (s) => buildOilStain(s),
  road_sign: (s) => buildRoadSign(s),
  bush: (s, o) => buildBush(s, o?.color),
  pebbles: (s) => buildPebbles(s),
  lantern: (s, o) => buildLantern(s, o?.color),
  varied_palm: (s) => buildVariedPalm(s),
  varied_pine: (s) => buildVariedPine(s),
  dead_tree: (s) => buildDeadTree(s),
  mossy_boulder: (s) => buildMossyBoulder(s),
  market_stall: (s) => buildMarketStall(s),
  village_cottage: (s) => buildVillageCottage(s),
  observation_tower: (s) => buildObservationTower(s),
  glowing_mushroom: (s) => buildGlowingMushroom(s),
  neon_pylon: (s) => buildNeonPylon(s),
  palm_tree: (s) => buildVariedPalm(s),
  cliff: (s) => vary(buildCliff(10 + (s % 5) * 2, 14 + (s % 4) * 3), s),
  crystal_cluster: (s) => vary(buildCrystalCluster(8 + (s % 6) * 2), s),
  giant_flower: (s) => vary(buildGiantFlower([0xff69b4, 0xda70d6, 0xffd700][s % 3]), s),
  waterfall: (s) => buildWaterfall(3 + (s % 3), 12 + (s % 5) * 2),
  basalt_cliff: (s) => vary(buildBasaltCliff(14 + (s % 4) * 3), s),
  skyscraper: (s) => vary(buildSkyscraper(22 + (s % 5) * 8, [0xff00ff, 0x00ffff][s % 2]), s),
  neon_billboard: (s) => buildNeonBillboard(['RACE', 'NEON', 'CYBER', 'GO'][s % 4]),
  snow_pine: (s) => buildVariedPine(s),
  temple_pillar: (s) => vary(buildTemplePillar(8 + (s % 4) * 3), s),
  red_barn: (s) => vary(buildRedBarn(), s),
  windmill: (s) => vary(buildWindmill(), s),
  cow: (s) => vary(buildCow(s), s),
  metro_arch: (s) => vary(buildMetroArch(7 + (s % 3), 8 + (s % 4)), s),
  graffiti_wall: (s) => vary(buildGraffitiWall(), s),
  steam_vent: (s) => vary(buildSteamVent(), s),
  beach_umbrella: (s) => vary(buildBeachUmbrella(), s),
};

export function buildProp(type, seed, opts = {}) {
  const fn = PROP_BUILDERS[type];
  return fn ? fn(seed, opts) : buildGrassClump(seed);
}
