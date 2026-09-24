/**
 * BiomeAAAWorlds.js — Delegates to RealGameTrackKit (3D worlds, no PNG backdrops).
 */
import * as THREE from 'three';
import { sampleTrackBounds } from './BiomeAAAKit.js';
import { buildRealGameWorld, animateRealGameWorld } from './RealGameTrackKit.js';
import { BIOME_ARENA_TYPES } from './BiomeTrackRegistry.js';

function buildHeroTrackAAA(scene, curve, root, opts, arenaType) {
  const bounds = sampleTrackBounds(curve);
  const world = new THREE.Group();
  world.name = `track-${arenaType}`;
  world.userData.arenaType = arenaType;
  const hw = opts.halfWidth || 4;
  const finishT = opts.finishT ?? 0;

  buildRealGameWorld(scene, curve, world, bounds, arenaType, finishT, opts);

  world.userData.animTick = (time) => animateRealGameWorld(scene, world, time);
  root.add(world);
  scene.userData.biomeWorldBuilt = arenaType;
  scene.userData.herokitBuilt = arenaType;
  return world;
}

const AAA_BUILDERS = Object.fromEntries(
  [...BIOME_ARENA_TYPES].map((id) => [id, (s, c, r, o) => buildHeroTrackAAA(s, c, r, o, id)]),
);

export function purgeGenericBiomeFiller(scene) {
  const removeNames = [
    'reference-chase-backdrop', 'reference-sky-dome', 'aaa-sky-dome',
    'track-sky-dome', 'track-starfield', 'storm-cloud-dome',
  ];
  removeNames.forEach((name) => {
    const o = scene.getObjectByName(name);
    if (o) scene.remove(o);
  });
}

export function buildAAAWorld(scene, curve, root, mkTrack, opts = {}) {
  const arena = mkTrack?.arenaType || '';
  purgeGenericBiomeFiller(scene);
  const builder = AAA_BUILDERS[arena];
  if (!builder) {
    console.warn('[BiomeAAA] No builder for arena:', arena);
    return null;
  }
  try {
    const world = builder(scene, curve, root, { ...opts, mkTrack });
    if (!world) return null;
    return {
      update(time) { world?.userData?.animTick?.(time); },
      world,
    };
  } catch (err) {
    console.error('[BiomeAAA] world build failed:', arena, err);
    return null;
  }
}

export { BIOME_ARENA_TYPES };
