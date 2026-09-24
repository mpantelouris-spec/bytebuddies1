/**
 * TrackGltfScatter.js — Kenney CC0 glTF scatter + building placement per track.
 * Runs after road mesh exists so props snap to drivable surface.
 */
import * as THREE from 'three';
import { placeAtTrack, sampleTrackFrame } from '../GameWorldBuilder.js';
import { getTrackManifest, trackHasBundledAssets, probeTrackBundledAssets } from './TrackAssetManifest.js';
import { getTrackWorldRecipe } from './TrackWorldRecipes.js';
import { snapPropToRoad } from './TrackGroundSnap.js';
import { countTrackWorldProps } from './TrackWorldBuilder.js';
import { CUP_START_HEROES } from './TrackStartHeroKit.js';
import { isCupTrack, blocksLaunchDriveLane } from './CodeRacerTrackStandards.js';
import {
  loadTrackAsset,
  cloneForInstancing,
  normalizeObjectHeight,
} from './TrackAssetLoader.js';

const SCATTER_HEIGHTS = {
  palm: 11, hut: 7, torch: 5, umbrella: 6, tent: 10, lollipop: 9, candy_cane: 8,
  pillar: 10, neon_sign: 8, tower: 16, jungle: 11, vine_pillar: 8, pine: 12, icicle: 4.5,
  gear: 5, factory_pipe: 9, dome: 9, satellite: 8, daisy: 8, toadstool: 7,
  lollipop_tree: 9, barn: 10,
};

const ANIMAL_HEIGHTS = { seagull: 1.2 };

function roadY(curve, t) {
  return curve.getPointAt(t).y || 0;
}

async function scatterOneKey(world, manifest, scatterKey, placements) {
  const file = manifest.scatter[scatterKey];
  if (!file || !placements.length) return 0;

  const url = `${manifest.base}/${file}`;
  const gltf = await loadTrackAsset(url);
  if (!gltf) return 0;

  const h = SCATTER_HEIGHTS[scatterKey] ?? 5;
  let placed = 0;
  placements.forEach((p, i) => {
    const clone = cloneForInstancing(gltf);
    if (!clone) return;
    normalizeObjectHeight(clone, h);
    clone.position.set(p.pos.x, p.pos.y, p.pos.z);
    clone.rotation.y = p.rot;
    clone.name = `gltf-${scatterKey}-${i}`;
    world.add(clone);
    placed++;
  });
  return placed;
}

async function scatterGltfAlongTrack(world, curve, hw, arenaType, perf, scene, finishT = 0) {
  const manifest = getTrackManifest(arenaType);
  const recipe = getTrackWorldRecipe(arenaType);
  if (!manifest?.scatter || !recipe?.scatter) return 0;

  const cup = isCupTrack(arenaType);
  const propMult = perf?.propMult ?? 1;
  const tier = perf?.tier ?? 'medium';
  const perSide = perf?.maxScatterPerSide ?? Math.round(22 * propMult);
  const maxTotal = cup
    ? 16
    : Math.max(tier === 'low' ? 16 : 22, Math.round(perSide * 1.4));
  const step = (recipe.scatterStep ?? 0.08) * (cup ? 1.15 : tier === 'low' ? 1.02 : 0.85);
  const offset = recipe.scatterOffset ?? 12;

  const placementsByKey = {};
  let idx = 0;
  for (let t = 0.04; t < 0.96 && idx < maxTotal; t += step) {
    const scatterKey = recipe.scatter[idx % recipe.scatter.length];
    const file = manifest.scatter[scatterKey];
    if (!file) { idx++; continue; }

    const side = idx % 2 ? 1 : -1;
    const off = side * (hw + offset + (idx % 3));
    const { pos, frame } = placeAtTrack(curve, t, off, 0);
    let y = roadY(curve, t);
    if (scene) y = snapPropToRoad(scene, pos.x, pos.z, y);

    if (!placementsByKey[scatterKey]) placementsByKey[scatterKey] = [];
    placementsByKey[scatterKey].push({
      pos: new THREE.Vector3(pos.x, y, pos.z),
      rot: frame.rot ?? 0,
    });
    idx++;
  }

  const results = await Promise.all(
    Object.entries(placementsByKey).map(([scatterKey, placements]) =>
      scatterOneKey(world, manifest, scatterKey, placements),
    ),
  );
  return results.reduce((a, b) => a + b, 0);
}

async function placeOneBuilding(world, curve, hw, manifest, b, scene) {
  const file = manifest.buildings[b.type];
  if (!file) return 0;

  const url = `${manifest.base}/${file}`;
  const gltf = await loadTrackAsset(url);
  if (!gltf) return 0;

  const clone = cloneForInstancing(gltf);
  if (!clone) return 0;
  normalizeObjectHeight(clone, b.type === 'skyscraper' ? (b.h ?? 30)
    : b.type === 'ferris_wheel' ? 14
    : b.type === 'lighthouse' ? 18
    : b.type === 'castle_tower' ? 16
    : b.type === 'temple_pyramid' ? 18
    : 12);

  const side = b.side ?? 1;
  const off = side * (hw + (b.off ?? 18));
  const { pos, frame } = placeAtTrack(curve, b.t, off, 0);
  let y = roadY(curve, b.t) + (b.y ?? 0);
  if (scene) y = snapPropToRoad(scene, pos.x, pos.z, y) + (b.y ?? 0);

  clone.position.set(pos.x, y, pos.z);
  clone.rotation.y = frame.rot ?? 0;
  clone.name = `gltf-building-${b.type}`;
  clone.userData.groundSnap = true;
  world.add(clone);
  return 1;
}

async function placeGltfBuildings(world, curve, hw, arenaType, perf, scene, finishT = 0) {
  const manifest = getTrackManifest(arenaType);
  const recipe = getTrackWorldRecipe(arenaType);
  if (!manifest?.buildings || !recipe?.buildings) return 0;

  const cap = Math.min(
    recipe.buildings.length,
    perf?.maxBuildings ?? recipe.buildings.length,
  );
  const buildings = recipe.buildings.slice(0, cap).filter((b) => {
    const off = b.off ?? 18;
    const lateral = b.side === 0 ? Math.abs(off) : hw + off;
    const span = b.type === 'ferris_wheel' ? 10 : b.type === 'temple_gate' ? 6 : 3;
    return !blocksLaunchDriveLane(b.t, finishT, hw, lateral, span);
  });
  const results = await Promise.all(
    buildings.map((b) =>
      placeOneBuilding(world, curve, hw, manifest, b, scene),
    ),
  );
  return results.reduce((a, b) => a + b, 0);
}

async function placeGltfAnimals(world, curve, hw, arenaType, perf, scene) {
  const manifest = getTrackManifest(arenaType);
  const recipe = getTrackWorldRecipe(arenaType);
  if (!manifest?.animals || !recipe?.animals) return 0;

  const cap = Math.min(recipe.animals.length, perf?.maxAnimals ?? recipe.animals.length);
  let placed = 0;

  for (const a of recipe.animals.slice(0, cap)) {
    const file = manifest.animals[a.type];
    if (!file) continue;
    const url = `${manifest.base}/${file}`;
    const gltf = await loadTrackAsset(url);
    if (!gltf) continue;
    const clone = cloneForInstancing(gltf);
    if (!clone) continue;
    normalizeObjectHeight(clone, ANIMAL_HEIGHTS[a.type] ?? 2);

    const side = a.side ?? 1;
    const off = side * (hw + (a.off ?? 16));
    const { pos, frame } = placeAtTrack(curve, a.t, off, 0);
    let y = roadY(curve, a.t) + (a.y ?? 0);
    if (scene && !a.y) y = snapPropToRoad(scene, pos.x, pos.z, y);
    else if (scene) y = snapPropToRoad(scene, pos.x, pos.z, y) + (a.y ?? 0);

    clone.position.set(pos.x, y, pos.z);
    clone.rotation.y = frame.rot ?? 0;
    clone.name = `gltf-animal-${a.type}`;
    world.add(clone);
    placed++;
  }
  return placed;
}

function startHeroGltfHeight(h) {
  if (h.scatter) {
    const base = SCATTER_HEIGHTS[h.scatter] ?? 8;
    if (['palm', 'jungle', 'pine', 'lollipop_tree', 'tower'].includes(h.scatter)) {
      return Math.min(14, Math.max(8, base));
    }
    return Math.min(12, Math.max(4, base));
  }
  if (h.building === 'skyscraper') return Math.min(36, Math.max(28, h.h ?? 30));
  if (h.building === 'ferris_wheel') return 14;
  if (h.building === 'lighthouse') return 18;
  if (h.building === 'castle_tower') return 18;
  if (h.building === 'temple_gate') return 16;
  if (h.building === 'windmill') return 16;
  if (h.building === 'crane') return 16;
  if (h.building === 'factory_wall') return 14;
  if (h.building === 'ski_lodge' || h.building === 'barn' || h.building === 'habitat_dome') return 12;
  if (h.building === 'fairy_cottage' || h.building === 'ticket_booth') return 10;
  if (h.building === 'holo_billboard') return 8;
  if (h.building === 'glass_deck') return 3;
  return 12;
}

async function placeGltfStartHeroes(world, curve, hw, arenaType, finishT, scene) {
  const manifest = getTrackManifest(arenaType);
  const heroes = CUP_START_HEROES[arenaType];
  if (!manifest || !heroes?.length) return 0;

  let placed = 0;
  for (const h of heroes) {
    let file = null;
    if (h.scatter && manifest.scatter?.[h.scatter]) {
      file = manifest.scatter[h.scatter];
    } else if (h.building && manifest.buildings?.[h.building]) {
      file = manifest.buildings[h.building];
    } else if (h.animal && manifest.animals?.[h.animal]) {
      file = manifest.animals[h.animal];
    }
    if (!file) continue;

    const gltf = await loadTrackAsset(`${manifest.base}/${file}`);
    if (!gltf) continue;
    const clone = cloneForInstancing(gltf);
    if (!clone) continue;
    const targetH = h.animal ? (ANIMAL_HEIGHTS[h.animal] ?? 2.5) : startHeroGltfHeight(h);
    normalizeObjectHeight(clone, targetH);

    const t = ((finishT + (h.tOff ?? 0)) % 1 + 1) % 1;
    const side = h.side ?? 1;
    const offVal = h.off ?? 12;
    const lateral = side === 0 ? Math.abs(offVal) : hw + offVal;
    const span = h.building === 'ferris_wheel' ? 10
      : h.building === 'temple_gate' ? 6
      : h.building === 'holo_billboard' ? 4
      : 3;
    if (blocksLaunchDriveLane(t, finishT, hw, lateral, span)) continue;
    let pos;
    let rot = 0;
    if (side === 0) {
      const at = placeAtTrack(curve, t, h.off ?? 0, 0);
      pos = at.pos;
      rot = at.frame.rot ?? 0;
    } else {
      const off = side * (hw + (h.off ?? 12));
      const at = placeAtTrack(curve, t, off, 0);
      pos = at.pos;
      rot = at.frame.rot ?? 0;
    }
    let y = roadY(curve, t) + (h.y ?? 0);
    if (scene) y = snapPropToRoad(scene, pos.x, pos.z, roadY(curve, t)) + (h.y ?? 0);

    clone.position.set(pos.x, y, pos.z);
    clone.rotation.y = rot;
    clone.name = `gltf-start-${h.scatter || h.building}`;
    clone.userData.groundSnap = true;
    world.add(clone);
    placed++;
  }
  return placed;
}

async function placeVistaGltf(world, bounds, arenaType, curve, finishT) {
  const manifest = getTrackManifest(arenaType);
  if (!manifest?.assets || !curve || finishT == null) return 0;
  if (arenaType === 'candy_carnival_01') return 0;

  let placed = 0;
  const frame = sampleTrackFrame(curve, finishT);

  if (arenaType === 'sunset_cove_01') {
    const specs = [
      { key: 'distant_island', ahead: 95, lateral: 0, h: 24, y: -0.4 },
      { key: 'distant_palm', ahead: 78, lateral: -38, h: 14, y: -0.2 },
      { key: 'distant_palm', ahead: 82, lateral: 42, h: 12, y: -0.2 },
    ];
    for (const spec of specs) {
      const file = manifest.assets[spec.key];
      if (!file) continue;
      const gltf = await loadTrackAsset(`${manifest.base}/${file}`);
      if (!gltf) continue;
      const clone = cloneForInstancing(gltf);
      if (!clone) continue;
      normalizeObjectHeight(clone, spec.h);
      const pos = frame.p.clone()
        .add(frame.tan.clone().multiplyScalar(spec.ahead))
        .add(frame.n.clone().multiplyScalar(spec.lateral));
      clone.position.set(pos.x, spec.y ?? 0, pos.z);
      clone.name = `gltf-vista-${spec.key}`;
      world.add(clone);
      placed++;
    }
  }
  return placed;
}

/** Load Kenney glTF props for a track (async, parallel). */
export async function enrichTrackWorldGltf(world, curve, hw, arenaType, perf, scene, finishT = 0) {
  const has = trackHasBundledAssets(arenaType) || await probeTrackBundledAssets(arenaType);
  if (!has) {
    console.warn('[TrackGltf] no bundled assets verified', arenaType);
    return 0;
  }

  const bounds = scene?.userData?.trackBounds;
  const startN = await placeGltfStartHeroes(world, curve, hw, arenaType, finishT, scene);

  const [scatterN, buildN, animalN, vistaN] = await Promise.all([
    scatterGltfAlongTrack(world, curve, hw, arenaType, perf, scene, finishT),
    placeGltfBuildings(world, curve, hw, arenaType, perf, scene, finishT),
    placeGltfAnimals(world, curve, hw, arenaType, perf, scene),
    bounds ? placeVistaGltf(world, bounds, arenaType, curve, finishT) : Promise.resolve(0),
  ]);

  const totalProps = countTrackWorldProps(world);
  // Keep primitive heroes — glTF is additive. Never strip start-line scenery.

  const target = 25;
  console.log('[TrackGltf]', arenaType, {
    mode: 'additive-gltf',
    start: startN,
    scatter: scatterN,
    buildings: buildN,
    animals: animalN,
    vista: vistaN,
    tier: perf?.tier,
    totalProps,
    target,
    ok: totalProps >= target,
  });

  world.userData.gltfEnriched = true;
  world.userData.sceneryPending = false;
  world.userData.sceneryPopulated = true;
  if (scene) scene.userData.sceneryPopulated = true;

  if (totalProps < target) {
    console.warn('[TrackGltf] prop count below target', arenaType, { totalProps, target });
  }

  return startN + scatterN + buildN + animalN + vistaN;
}
