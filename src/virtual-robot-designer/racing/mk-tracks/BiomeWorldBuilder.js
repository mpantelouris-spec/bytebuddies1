/**
 * BiomeWorldBuilder.js — Ten premium 3D CodeRacer environments.
 */
import { buildAAAWorld } from './BiomeAAAWorlds.js';
import { isCosmicSkywayArena } from './CosmicSkywayRegistry.js';

const BIOME_ARENAS = [
  'sunset_cove_01', 'candy_carnival_01', 'neon_metro_01', 'cloud_citadel_01',
  'jungle_ruins_01', 'frost_peak_01', 'lava_foundry_01', 'star_station_01',
  'fairy_glen_01', 'thunder_ridge_01',
];

export function buildBiomeWorld(scene, curve, root, mkTrack, opts = {}) {
  const result = buildAAAWorld(scene, curve, root, mkTrack, opts);
  if (!result) return null;
  return {
    update(time) { result.update?.(time); },
  };
}

export function isBiomeArena(arenaType) {
  return BIOME_ARENAS.includes(arenaType) || isCosmicSkywayArena(arenaType);
}
