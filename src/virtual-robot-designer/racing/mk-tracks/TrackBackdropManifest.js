/**
 * TrackBackdropManifest.js — Reference PNG backdrops + atmosphere per premium track.
 * Hybrid pipeline: illustrated backdrop fills the view; 3D road/kart sit in the play layer.
 */
const T = '/assets/backgrounds/tracks';

export const TRACK_BACKDROPS = {
  crystal_palace_01: {
    sky: `${T}/crystal_cavern_reference.png`,
    fog: 0x87ceeb,
    fogDensity: 0.002,
    backdrop: { bgColor: 0x0a1420, planeY: 14, scale: 1.42 },
  },
  cyber_boulevard_01: {
    sky: `${T}/cyber_city_reference.png`,
    fog: 0x001030,
    fogDensity: 0.004,
    backdrop: { bgColor: 0x020818, planeY: 12, scale: 1.4 },
  },
  forest_maze_01: {
    sky: `${T}/jungle_gate_grand_prix.png`,
    fog: 0x2e5228,
    fogDensity: 0.0035,
    backdrop: { bgColor: 0x0a1810, planeY: 13, scale: 1.38 },
  },
  volcano_canyon_01: {
    sky: `${T}/volcanic_inferno_reference.png`,
    fog: 0x662200,
    fogDensity: 0.005,
    backdrop: { bgColor: 0x180800, planeY: 13, scale: 1.4 },
  },
  ice_cavern_01: {
    sky: `${T}/frost_peak_reference.png`,
    fog: 0xd0e8f8,
    fogDensity: 0.003,
    underground: true,
    backdrop: { bgColor: 0x0c1828, planeY: 14, scale: 1.38 },
  },
  underwater_temple_01: {
    sky: `${T}/coral_bay_sprint.png`,
    fog: 0x004466,
    fogDensity: 0.004,
    underground: true,
    backdrop: { bgColor: 0x001828, planeY: 13, scale: 1.4 },
  },
  sky_island_01: {
    sky: `${T}/sky_garden_reference.png`,
    fog: 0x99ddee,
    fogDensity: 0.002,
    backdrop: { bgColor: 0x4080a0, planeY: 15, scale: 1.45 },
  },
  dry_dry_desert: {
    sky: `${T}/sunny_meadow_500.png`,
    fog: 0xffcc66,
    fogDensity: 0.0025,
    backdrop: { bgColor: 0x2a2010, planeY: 11, scale: 1.22, planeExtra: 18 },
  },
  desert_dunes_01: {
    sky: `${T}/sunny_meadow_500.png`,
    fog: 0xffcc66,
    fogDensity: 0.003,
    backdrop: { bgColor: 0x2a2010, planeY: 13, scale: 1.38 },
  },
  moonlight_cavern_01: {
    sky: `${T}/stardust_galaxy_reference.png`,
    fog: 0x2a1050,
    fogDensity: 0.005,
    underground: true,
    cosmic: true,
    backdrop: { bgColor: 0x080418, planeY: 14, scale: 1.42 },
  },
  magic_forest_01: {
    sky: `${T}/ancient_ruins_reference.png`,
    fog: 0x3a5a32,
    fogDensity: 0.0035,
    backdrop: { bgColor: 0x0a1810, planeY: 13, scale: 1.4 },
  },
  sunset_cove_01: {
    sky: `${T}/sunset-cove-premium-backdrop.png`,
    fog: 0xb7ddec,
    fogDensity: 0.0012,
    backdrop: { bgColor: 0x287fc4, planeY: 11, scale: 1.22, planeExtra: 18 },
  },
  candy_carnival_01: {
    sky: `${T}/candy-carnival-premium-backdrop.png`,
    fog: 0xffe8f4,
    fogDensity: 0.0014,
    backdrop: { bgColor: 0x7ec8ff, planeY: 11, scale: 1.22, planeExtra: 18 },
  },
  neon_metro_01: {
    sky: `${T}/neon-metro-premium-backdrop.png`,
    fog: 0x1a1040,
    fogDensity: 0.002,
    backdrop: { bgColor: 0x020818, planeY: 11, scale: 1.22, planeExtra: 18 },
  },
  cloud_citadel_01: {
    sky: `${T}/cloud-citadel-premium-backdrop.png`,
    fog: 0xc8e8ff,
    fogDensity: 0.0012,
    backdrop: { bgColor: 0x4fc3f7, planeY: 12, scale: 1.24, planeExtra: 18 },
  },
  jungle_ruins_01: {
    sky: `${T}/jungle-ruins-premium-backdrop.png`,
    fog: 0xa8d090,
    fogDensity: 0.0016,
    backdrop: { bgColor: 0x0a1810, planeY: 11, scale: 1.22, planeExtra: 18 },
  },
  frost_peak_01: {
    sky: `${T}/frost-peak-premium-backdrop.png`,
    fog: 0xd8eef8,
    fogDensity: 0.0014,
    backdrop: { bgColor: 0x0c1828, planeY: 11, scale: 1.22, planeExtra: 18 },
  },
  lava_foundry_01: {
    sky: `${T}/lava-foundry-premium-backdrop.png`,
    fog: 0x662200,
    fogDensity: 0.002,
    backdrop: { bgColor: 0x180800, planeY: 11, scale: 1.22, planeExtra: 18 },
  },
  star_station_01: {
    sky: `${T}/star-station-premium-backdrop.png`,
    fog: 0x1a0840,
    fogDensity: 0.002,
    cosmic: true,
    backdrop: { bgColor: 0x080418, planeY: 11, scale: 1.22, planeExtra: 18 },
  },
  fairy_glen_01: {
    sky: `${T}/fairy-glen-premium-backdrop.png`,
    fog: 0xd0ecc0,
    fogDensity: 0.0012,
    backdrop: { bgColor: 0x4080a0, planeY: 12, scale: 1.24, planeExtra: 18 },
  },
  thunder_ridge_01: {
    sky: `${T}/thunder-ridge-premium-backdrop.png`,
    fog: 0xb0c4d8,
    fogDensity: 0.0014,
    backdrop: { bgColor: 0x2a3040, planeY: 11, scale: 1.22, planeExtra: 18 },
  },
};

export function getTrackBackdrop(arenaType) {
  return TRACK_BACKDROPS[arenaType] || null;
}
