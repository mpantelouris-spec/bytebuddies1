/**
 * ThemeSceneryKit.js — rebuilds each kart world's scenery from Kenney CC0
 * models (public/assets/kenney) in place of the old primitive decoration.
 *
 * Props are placed in three bands beyond the fence on both sides of the road —
 * near (flowers, bushes, lamps), mid (trees, houses) and far (cliffs, towers,
 * skyscrapers, hangars) — plus a race-day start area (grandstands, banner
 * towers, flags). Every model is scaled to a real height and nothing is
 * allowed within reach of any stretch of road, including hairpins.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const BASE = `${import.meta.env?.BASE_URL ?? '/'}assets/kenney/`;

// [model, [minHeight, maxHeight] in metres]
const P = (f, h) => ({ f, h });

const RECIPES = {
  beach: {
    near: [P('nature/flower_redA', [0.8, 1.1]), P('nature/flower_yellowA', [0.8, 1.1]), P('nature/plant_bushLarge', [1.4, 2]), P('nature/rock_largeA', [1, 1.8])],
    mid: [P('nature/tree_palmDetailedTall', [10, 14]), P('nature/tree_palmTall', [9, 13]), P('nature/tree_palmBend', [8, 11]), P('nature/tree_palmDetailedShort', [6, 8]), P('nature/plant_bushLarge', [2, 3])],
    far: [P('nature/cliff_large_rock', [14, 22]), P('nature/cliff_waterfall_rock', [14, 20]), P('nature/tree_palmDetailedTall', [10, 14])],
  },
  city: {
    near: [P('roads/light-square-double', [6, 7]), P('roads/traffic-light', [4, 5])],
    mid: [P('city/building-a', [10, 16]), P('city/building-c', [10, 16]), P('city/building-e', [12, 18]), P('city/building-g', [12, 18]), P('city/building-h', [10, 14])],
    far: [P('city/building-skyscraper-a', [45, 70]), P('city/building-skyscraper-b', [45, 70]), P('city/building-skyscraper-c', [50, 80]), P('city/building-skyscraper-d', [45, 70]), P('city/building-skyscraper-e', [55, 85])],
  },
  canyon: {
    tint: 0xd9804a,
    near: [P('nature/cactus_short', [1.5, 2.5]), P('nature/cactus_tall', [3, 4.5]), P('nature/rock_largeC', [1.2, 2])],
    mid: [P('nature/rock_tallA', [8, 14]), P('nature/rock_tallC', [9, 15]), P('nature/cactus_tall', [4, 5.5]), P('nature/stone_tallB', [8, 13]), P('nature/cliff_block_rock', [10, 16])],
    far: [P('nature/cliff_large_rock', [22, 34]), P('nature/cliff_block_rock', [18, 28]), P('nature/rock_tallF', [18, 26])],
  },
  snow: {
    near: [P('nature/tree_pineSmallA', [2, 3]), P('nature/rock_largeA', [1, 1.8])],
    mid: [P('nature/tree_pineTallA_detailed', [9, 13]), P('nature/tree_pineTallB_detailed', [9, 13]), P('nature/tree_pineRoundA', [6, 9])],
    far: [P('nature/cliff_large_rock', [24, 36]), P('nature/tree_pineTallA_detailed', [14, 18])],
    snowCap: true,
  },
  volcano: {
    tint: 0x4a3c3a,
    near: [P('nature/rock_largeA', [1.2, 2.2]), P('nature/rock_largeC', [1.2, 2.2])],
    mid: [P('nature/rock_tallA', [6, 12]), P('nature/rock_tallF', [7, 12]), P('nature/stone_tallB', [6, 10])],
    far: [P('nature/cliff_large_rock', [24, 38]), P('nature/cliff_block_rock', [20, 30])],
  },
  forest: {
    near: [P('nature/mushroom_redGroup', [0.8, 1.3]), P('nature/mushroom_tanGroup', [0.8, 1.3]), P('nature/flower_purpleA', [0.8, 1.1]), P('nature/plant_bushDetailed', [1.4, 2.2]), P('nature/stump_old', [1, 1.5])],
    mid: [P('nature/tree_oak', [9, 13]), P('nature/tree_detailed', [8, 12]), P('nature/tree_fat', [8, 11]), P('nature/mushroom_redTall', [3, 5]), P('nature/log_large', [1, 1.5])],
    far: [P('nature/tree_oak', [14, 20]), P('nature/tree_default', [12, 18]), P('nature/cliff_large_rock', [18, 26])],
  },
  space: {
    near: [P('space/machine_generatorLarge', [2, 3]), P('space/rock_crystalsLargeA', [2, 3.5]), P('space/craft_speederA', [1.4, 2])],
    mid: [P('space/satelliteDish_large', [8, 12]), P('space/structure_detailed', [6, 9]), P('space/rock_crystalsLargeB', [4, 7]), P('space/craft_cargoA', [3, 5])],
    far: [P('space/hangar_largeA', [16, 24]), P('space/hangar_roundGlass', [14, 20]), P('space/rocket_fuelA', [20, 30]), P('space/meteor_detailed', [10, 16])],
  },
  sky: {
    near: [P('nature/flower_yellowA', [0.8, 1.1]), P('nature/plant_bushLarge', [1.4, 2])],
    mid: [P('nature/tree_default', [7, 10]), P('nature/tree_oak', [8, 11])],
    far: [P('nature/cliff_waterfall_rock', [18, 26]), P('nature/cliff_large_rock', [18, 26])],
  },
  reef: {
    near: [P('nature/rock_largeA', [1, 1.8]), P('nature/lily_large', [0.4, 0.6])],
    mid: [P('nature/rock_tallC', [5, 9]), P('nature/plant_bushLarge', [2, 3])],
    far: [P('nature/cliff_large_rock', [18, 26])],
  },
  castle: {
    near: [P('castle/flag-pennant', [3, 4]), P('nature/plant_bushLarge', [1.4, 2]), P('castle/rocks-large', [1.4, 2.2])],
    mid: [P('castle/tree-large', [8, 11]), P('castle/tower-hexagon-base', [7, 10]), P('castle/wall', [4, 5]), P('castle/flag-banner-long', [5, 6])],
    far: [P('castle/tower-square-top-roof-high', [22, 30]), P('castle/tower-hexagon-roof', [20, 28]), P('castle/tower-square-mid', [18, 26])],
  },
};

// Race-day start area shared by every world
const START_SET = [
  { f: 'racing/grandStandCovered', h: 7, side: 1, along: -6, lateral: 6 },
  { f: 'racing/grandStandCovered', h: 7, side: -1, along: -6, lateral: 6 },
  { f: 'racing/bannerTowerRed', h: 6, side: 1, along: 10, lateral: 1.5 },
  { f: 'racing/bannerTowerGreen', h: 6, side: -1, along: 10, lateral: 1.5 },
  { f: 'racing/flagCheckers', h: 4, side: 1, along: 2, lateral: 1 },
  { f: 'racing/flagCheckers', h: 4, side: -1, along: 2, lateral: 1 },
];

// Old primitive decoration this kit replaces (functional pieces are kept:
// checkpoint arches, boost pads, the start strip, ground and water)
const OLD_DECOR = /^(prop-|gltf-|cup-reference|story-|landmark-|section-billboards|holo-billboard|metro-gp-sign|metro-train|sunset-distant|track-beach-berm|mk8-edge-glow|mk8-center-lanes|mk8-waterfall|lane-strips)|^Group$/;

const loader = new GLTFLoader();
const cache = new Map();
function loadModel(file) {
  if (!cache.has(file)) {
    cache.set(file, new Promise((resolve) => {
      loader.load(`${BASE}${file}.glb`, (g) => resolve(g.scene), undefined, () => resolve(null));
    }));
  }
  return cache.get(file);
}

function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
function hashStr(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** A sized, grounded copy of a model; tinted or snow-capped for the world. */
function instance(src, height, theme, rand) {
  const model = src.clone(true);
  const box = new THREE.Box3().setFromObject(model);
  const h = Math.max(box.max.y - box.min.y, 0.01);
  model.scale.multiplyScalar(height / h);
  model.updateMatrixWorld(true);
  box.setFromObject(model);
  // Centre the model on its footprint: some models (the meteor) sit far from their own
  // origin, which once scaled up put them on the road the clearance check had just kept clear.
  const centre = box.getCenter(new THREE.Vector3());
  model.position.x -= centre.x;
  model.position.z -= centre.z;
  model.position.y -= box.min.y;
  const obj = new THREE.Group();
  obj.name = src.name || 'scenery-prop';
  obj.add(model);
  obj.rotation.y = rand() * Math.PI * 2;
  if (theme.tint || theme.snowCap) {
    const tint = theme.tint ? new THREE.Color(theme.tint) : null;
    obj.traverse((m) => {
      if (!m.isMesh) return;
      m.material = Array.isArray(m.material) ? m.material.map((x) => x.clone()) : m.material.clone();
      (Array.isArray(m.material) ? m.material : [m.material]).forEach((mat) => {
        if (tint && mat.color) mat.color.lerp(tint, 0.55);
        // Frosted look: lift greens and rocks towards snow white
        if (theme.snowCap && mat.color) mat.color.lerp(new THREE.Color(0xeef4ff), 0.35);
      });
    });
  }
  obj.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  return { obj, radius: Math.max(box.max.x - box.min.x, box.max.z - box.min.z) / 2 };
}

/** Hide the old primitive decoration so the new scenery reads cleanly. */
export function hideOldDecoration(world) {
  let hidden = 0;
  world.children.forEach((c) => {
    if (OLD_DECOR.test(c.name || c.type) && c.name !== 'roadside-dressing' && c.name !== 'theme-scenery') {
      c.visible = false;
      hidden++;
    }
  });
  return hidden;
}

export function hasThemeScenery(themeId) {
  return Boolean(RECIPES[themeId]);
}

/** Hides old decoration before every render so late-streaming pieces never flash on screen. */
export function keepOldDecorationHidden(world) {
  const original = world.updateMatrixWorld;
  world.updateMatrixWorld = function patched(force) {
    hideOldDecoration(world);
    return original.call(this, force);
  };
  return () => {
    hideOldDecoration(world);
    world.updateMatrixWorld = original;
  };
}

/**
 * Build the world's scenery. `fenceOffset` is the distance from the road
 * centreline to the fence; `hw` the road half-width.
 */
export async function applyThemeScenery(world, curve, hw, theme, { fenceOffset, startT = 0 } = {}) {
  const recipe = RECIPES[theme.id];
  if (!recipe || !world || world.getObjectByName('theme-scenery')) return null;
  const root = new THREE.Group();
  root.name = 'theme-scenery';
  world.add(root);

  const files = new Set([...recipe.near, ...recipe.mid, ...recipe.far].map((p) => p.f));
  START_SET.forEach((s) => files.add(s.f));
  const models = new Map();
  await Promise.all([...files].map(async (f) => models.set(f, await loadModel(f))));

  const len = curve.getLength();
  const samples = curve.getSpacedPoints(Math.max(300, Math.round(len / 1.5)));
  const nearestRoad = (x, z) => {
    let best = Infinity;
    for (let i = 0; i < samples.length; i += 2) {
      const q = samples[i];
      const d = (q.x - x) ** 2 + (q.z - z) ** 2;
      if (d < best) best = d;
    }
    return Math.sqrt(best);
  };
  const placed = [];
  const spotFree = (x, z, r) => placed.every((p) => Math.hypot(p.x - x, p.z - z) > p.r + r + 0.6);
  const rand = rng(hashStr(theme.id));

  const put = (entry, x, z, y, yaw, fixedHeight) => {
    const src = models.get(entry.f);
    if (!src) return false;
    const height = fixedHeight ?? entry.h[0] + rand() * (entry.h[1] - entry.h[0]);
    const { obj, radius } = instance(src, height, { tint: recipe.tint, snowCap: recipe.snowCap }, rand);
    // Keep every prop clear of the fence line and of any other piece of road
    if (nearestRoad(x, z) - radius < fenceOffset + 0.8) return false;
    if (!spotFree(x, z, radius)) return false;
    obj.position.x = x;
    obj.position.z = z;
    obj.position.y += y;
    if (yaw !== undefined) obj.rotation.y = yaw;
    root.add(obj);
    placed.push({ x, z, r: radius });
    return true;
  };

  const band = (list, step, lateralMin, lateralMax, chance) => {
    const n = Math.floor(len / step);
    for (let i = 0; i < n; i++) {
      const t = (i + rand() * 0.6) / n;
      const p = curve.getPointAt(t % 1);
      const tan = curve.getTangentAt(t % 1).setY(0).normalize();
      const right = new THREE.Vector3(tan.z, 0, -tan.x);
      for (const side of [-1, 1]) {
        if (rand() > chance) continue;
        const lat = lateralMin + rand() * (lateralMax - lateralMin);
        const entry = list[Math.floor(rand() * list.length)];
        put(entry, p.x + right.x * side * lat, p.z + right.z * side * lat, 0);
      }
    }
  };

  // Race-day start area: grandstands behind the fence, banner towers and flags
  START_SET.forEach((s) => {
    const t = (((startT + s.along / len) % 1) + 1) % 1;
    const p = curve.getPointAt(t);
    const tan = curve.getTangentAt(t).setY(0).normalize();
    const right = new THREE.Vector3(tan.z, 0, -tan.x);
    const lat = fenceOffset + s.lateral + (s.f.includes('grandStand') ? 3 : 0);
    // Stands face the road
    const yaw = Math.atan2(-right.x * s.side, -right.z * s.side);
    put(s, p.x + right.x * s.side * lat, p.z + right.z * s.side * lat, 0, yaw, s.h);
  });

  // Far first so big landmarks claim their space, then fill inwards
  band(recipe.far, 24, fenceOffset + 22, fenceOffset + 60, 0.9);
  band(recipe.mid, 8, fenceOffset + 2.5, fenceOffset + 16, 0.9);
  band(recipe.mid, 14, fenceOffset + 16, fenceOffset + 26, 0.7);   // second row for depth
  band(recipe.near, 6, fenceOffset + 1, fenceOffset + 4, 0.6);

  root.userData.count = placed.length;
  return root;
}
