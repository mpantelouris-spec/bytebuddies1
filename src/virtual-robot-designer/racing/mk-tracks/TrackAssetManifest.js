/**
 * TrackAssetManifest.js — Per-track Kenney CC0 glTF paths (public/assets/tracks/).
 */
import { BUNDLED_TRACKS } from './bundled-tracks-data.js';

const BASE = '/assets/tracks';

export const TRACK_ASSET_MANIFEST = {
  sunset_cove_01: {
    base: `${BASE}/sunset_cove_01`,
    scatter: { palm: 'palm_tree.glb', hut: 'beach_hut.glb', torch: 'tiki_torch.glb', umbrella: 'beach_umbrella.glb' },
    buildings: { lighthouse: 'checkpoint_arch.glb', beach_hut: 'beach_hut.glb' },
    animals: { seagull: 'seagull.glb' },
    assets: {
      palm_tree: 'palm_tree.glb',
      beach_hut: 'beach_hut.glb',
      tiki_torch: 'tiki_torch.glb',
      beach_umbrella: 'beach_umbrella.glb',
      island_rock: 'island_rock.glb',
      checkpoint_arch: 'checkpoint_arch.glb',
      hibiscus_flower: 'hibiscus_flower.glb',
      distant_palm: 'distant_palm.glb',
      distant_island: 'distant_island.glb',
    },
  },
  candy_carnival_01: {
    base: `${BASE}/candy_carnival_01`,
    scatter: { tent: 'circus_tent.glb', lollipop: 'lollipop.glb', candy_cane: 'candy_cane.glb' },
    buildings: { ticket_booth: 'ticket_booth.glb', ferris_wheel: 'ferris_base.glb', candy_shop: 'ticket_booth.glb' },
    assets: {
      circus_tent: 'circus_tent.glb',
      lollipop: 'lollipop.glb',
      candy_cane: 'candy_cane.glb',
      ticket_booth: 'ticket_booth.glb',
      ferris_base: 'ferris_base.glb',
      tent_small: 'tent_small.glb',
    },
  },
  neon_metro_01: {
    base: `${BASE}/neon_metro_01`,
    scatter: { pillar: 'metro_pillar.glb', neon_sign: 'neon_awning.glb' },
    buildings: { skyscraper: 'skyscraper_a.glb', holo_billboard: 'neon_awning.glb', metro_train: 'building_block.glb' },
    assets: {
      skyscraper_a: 'skyscraper_a.glb',
      skyscraper_b: 'skyscraper_b.glb',
      skyscraper_c: 'skyscraper_c.glb',
      building_block: 'building_block.glb',
      metro_pillar: 'metro_pillar.glb',
      neon_awning: 'neon_awning.glb',
    },
  },
  cloud_citadel_01: {
    base: `${BASE}/cloud_citadel_01`,
    scatter: { tower: 'castle_tower.glb' },
    buildings: { castle_tower: 'castle_tower.glb' },
    assets: {
      castle_tower: 'castle_tower.glb',
      castle_tower_b: 'castle_tower_b.glb',
      cloud_rock: 'cloud_rock.glb',
      bridge_piece: 'bridge_piece.glb',
    },
  },
  jungle_ruins_01: {
    base: `${BASE}/jungle_ruins_01`,
    scatter: { jungle: 'jungle_tree.glb', vine_pillar: 'temple_pillar.glb' },
    buildings: { temple_pyramid: 'statue_block.glb', temple_gate: 'temple_pillar.glb' },
    assets: {
      jungle_tree: 'jungle_tree.glb',
      jungle_tree_b: 'jungle_tree_b.glb',
      temple_pillar: 'temple_pillar.glb',
      statue_jaguar: 'statue_jaguar.glb',
      statue_block: 'statue_block.glb',
      vine_rock: 'vine_rock.glb',
    },
  },
  frost_peak_01: {
    base: `${BASE}/frost_peak_01`,
    scatter: { pine: 'snow_pine.glb', icicle: 'ice_rock.glb' },
    buildings: { ski_lodge: 'ski_cabin.glb' },
    assets: {
      snow_pine: 'snow_pine.glb',
      snow_pine_tall: 'snow_pine_tall.glb',
      ice_rock: 'ice_rock.glb',
      snow_rock: 'snow_rock.glb',
      ski_cabin: 'ski_cabin.glb',
    },
  },
  lava_foundry_01: {
    base: `${BASE}/lava_foundry_01`,
    scatter: { gear: 'gear_rock.glb', factory_pipe: 'factory_pipe.glb' },
    buildings: { factory_wall: 'factory_pipe.glb', crane: 'forge_rock.glb' },
    assets: {
      forge_rock: 'forge_rock.glb',
      lava_cliff: 'lava_cliff.glb',
      factory_pipe: 'factory_pipe.glb',
      gear_rock: 'gear_rock.glb',
      campfire: 'campfire.glb',
    },
  },
  star_station_01: {
    base: `${BASE}/star_station_01`,
    scatter: { dome: 'habitat_dome.glb', satellite: 'satellite_base.glb' },
    buildings: { habitat_dome: 'habitat_dome.glb', glass_deck: 'glass_panel.glb' },
    assets: {
      habitat_dome: 'habitat_dome.glb',
      habitat_dome_b: 'habitat_dome_b.glb',
      station_tower: 'station_tower.glb',
      satellite_base: 'satellite_base.glb',
      glass_panel: 'glass_panel.glb',
    },
  },
  fairy_glen_01: {
    base: `${BASE}/fairy_glen_01`,
    scatter: { daisy: 'giant_daisy.glb', toadstool: 'toadstool.glb', lollipop_tree: 'fairy_flower.glb' },
    buildings: { fairy_cottage: 'cottage.glb' },
    assets: {
      giant_daisy: 'giant_daisy.glb',
      toadstool: 'toadstool.glb',
      toadstool_tall: 'toadstool_tall.glb',
      fairy_flower: 'fairy_flower.glb',
      cottage: 'cottage.glb',
      mushroom_group: 'mushroom_group.glb',
    },
  },
  thunder_ridge_01: {
    base: `${BASE}/thunder_ridge_01`,
    scatter: { pine: 'mountain_pine.glb', barn: 'barn.glb' },
    buildings: { windmill: 'windmill_base.glb', barn: 'barn.glb' },
    assets: {
      mountain_pine: 'mountain_pine.glb',
      mountain_pine_tall: 'mountain_pine_tall.glb',
      barn: 'barn.glb',
      barn_wide: 'barn_wide.glb',
      windmill_base: 'windmill_base.glb',
      ridge_rock: 'ridge_rock.glb',
    },
  },
};

export const KART_ASSET_MANIFEST = {
  student_race: '/assets/karts/student_race.glb',
};

/** Runtime probe cache — static BUNDLED_TRACKS alone is not trusted. */
const _verifiedTracks = new Map();
const _pendingProbes = new Map();

export function getTrackManifest(trackId) {
  return TRACK_ASSET_MANIFEST[trackId] ?? null;
}

export function getTrackAssetUrl(trackId, assetKey) {
  const manifest = getTrackManifest(trackId);
  const file = manifest?.assets?.[assetKey];
  if (!file) return null;
  return `${manifest.base}/${file}`;
}

function firstManifestFile(manifest) {
  if (!manifest) return null;
  const scatterKey = Object.keys(manifest.scatter ?? {})[0];
  if (scatterKey && manifest.scatter[scatterKey]) {
    return `${manifest.base}/${manifest.scatter[scatterKey]}`;
  }
  const assetKey = Object.keys(manifest.assets ?? {})[0];
  if (assetKey && manifest.assets[assetKey]) {
    return `${manifest.base}/${manifest.assets[assetKey]}`;
  }
  return null;
}

/** Sync check — optimistic for bundled tracks; probe confirms later. */
export function trackHasBundledAssets(trackId) {
  if (_verifiedTracks.has(trackId)) return _verifiedTracks.get(trackId);
  return BUNDLED_TRACKS[trackId] === true;
}

/** HEAD-probe one manifest file; caches result. */
export async function probeTrackBundledAssets(trackId) {
  if (_verifiedTracks.has(trackId)) return _verifiedTracks.get(trackId);
  if (_pendingProbes.has(trackId)) return _pendingProbes.get(trackId);

  if (BUNDLED_TRACKS[trackId] !== true) {
    _verifiedTracks.set(trackId, false);
    return false;
  }

  const manifest = getTrackManifest(trackId);
  const url = firstManifestFile(manifest);
  if (!url) {
    _verifiedTracks.set(trackId, false);
    return false;
  }

  const promise = fetch(url, { method: 'HEAD', cache: 'force-cache', signal: AbortSignal.timeout(5000) })
    .then((res) => {
      const len = parseInt(res.headers.get('content-length') || '0', 10);
      const ok = res.ok && len > 512;
      _verifiedTracks.set(trackId, ok);
      if (!ok) console.warn('[TrackAssetManifest] glTF probe failed:', trackId, url, res.status, len);
      return ok;
    })
    .catch(() => {
      _verifiedTracks.set(trackId, false);
      return false;
    })
    .finally(() => _pendingProbes.delete(trackId));

  _pendingProbes.set(trackId, promise);
  return promise;
}

/** Warm Kenney glTF probes + priority models so first cup track loads fast. */
export function prewarmCupTrackAssets() {
  if (typeof window === 'undefined') return;
  import('./TrackAssetLoader.js').then(({ loadTrackAsset }) => {
    Object.keys(BUNDLED_TRACKS).filter((id) => BUNDLED_TRACKS[id]).forEach((id) => {
      probeTrackBundledAssets(id);
      const manifest = getTrackManifest(id);
      if (!manifest) return;
      const urls = [];
      if (manifest.scatter) urls.push(...Object.values(manifest.scatter).slice(0, 2).map((f) => `${manifest.base}/${f}`));
      if (manifest.buildings) urls.push(...Object.values(manifest.buildings).slice(0, 1).map((f) => `${manifest.base}/${f}`));
      urls.forEach((url) => loadTrackAsset(url));
    });
  });
}
