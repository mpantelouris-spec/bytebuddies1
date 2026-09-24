/**
 * BiomeAAAVisualSpec.js — Lighting, fog, post per 2026 track lineup.
 */
export const BIOME_CAMERA_STANDARD = {
  camBack: 6.4,
  camUp: 2.9,
  lookAhead: 8,
  lookHeight: 0.7,
  tiltDeg: 9,
  fov: 50,
};

const BASE_POST = { bloom: 0.42, grain: 0.015, vignette: 0.12, chroma: 0.0018, motionBlur: 0.12 };

export const BIOME_AAA_SPECS = {
  sunset_cove_01: {
    palette: { primary: '#FF8C42', secondary: '#87CEEB', accent: '#FF69B4', fog: 0xffaa77 },
    keyLight: 0xfff0c8, fillLight: 0xffb366, rimLight: 0xff6622, ambient: 0xffe0b0,
    ground: 0xe8c992, roadStyle: 'sunset_coral',
    lightingTemp: 'warm-sunset', atmosphere: 'tropical-bay', fogDensity: 0.0007,
    post: { ...BASE_POST, bloom: 0.52, gradeSat: 1.48, gradeGain: [1.08, 1.05, 1.0], gradeCss: 'saturate(1.55) contrast(1.12) brightness(1.12) hue-rotate(-4deg)' },
    mood: 'Sunset Cove — tropical bay golden hour',
  },
  candy_carnival_01: {
    palette: { primary: '#FF69B4', secondary: '#FFD700', accent: '#FF69B4', fog: 0xffe0f0 },
    keyLight: 0xffffff, fillLight: 0xff69b4, rimLight: 0xffd700, ambient: 0xfff0f8,
    ground: 0xffc8e8, roadStyle: 'candy_pink',
    lightingTemp: 'bright-day', atmosphere: 'carnival', fogDensity: 0.0008,
    post: { ...BASE_POST, bloom: 0.48, gradeSat: 1.5, gradeGain: [1.06, 1.02, 1.04], gradeCss: 'saturate(1.55) contrast(1.12) brightness(1.12)' },
    mood: 'Candy Carnival — bright midway colors',
  },
  neon_metro_01: {
    palette: { primary: '#FF00FF', secondary: '#00FFFF', accent: '#FF00FF', fog: 0x001030 },
    keyLight: 0xff00ff, fillLight: 0x00ffff, rimLight: 0x00ffff, ambient: 0x08091a,
    ground: 0x1a1a28, roadStyle: 'cyber_navy',
    lightingTemp: 'neon-night', atmosphere: 'metro-tunnel', fogDensity: 0.004,
    post: { ...BASE_POST, bloom: 0.55, gradeCss: 'saturate(1.35) contrast(1.12) brightness(0.92)' },
    underground: true,
    suppressSimDaylight: true,
    mood: 'Neon Metro — rainy underground rush',
  },
  cloud_citadel_01: {
    palette: { primary: '#87CEEB', secondary: '#FFD700', accent: '#87CEEB', fog: 0xb0d8f8 },
    keyLight: 0xffffff, fillLight: 0xaaddff, rimLight: 0xffd700, ambient: 0xe8f4ff,
    ground: 0x4a8a3a, roadStyle: 'sky_jade',
    lightingTemp: 'sky-bright', atmosphere: 'cloud-castle', fogDensity: 0.002,
    post: { ...BASE_POST, bloom: 0.38, gradeCss: 'saturate(1.32) contrast(1.08) brightness(1.08)' },
    mood: 'Cloud Citadel — floating castle islands',
  },
  jungle_ruins_01: {
    palette: { primary: '#228B22', secondary: '#7CFC00', accent: '#FFD700', fog: 0x2e5228 },
    keyLight: 0xfff8e0, fillLight: 0x556b2f, rimLight: 0x7cfc00, ambient: 0x3a5a32,
    ground: 0x556b2f, roadStyle: 'ruins_moss',
    lightingTemp: 'dappled-sun', atmosphere: 'jungle-temple', fogDensity: 0.0035,
    post: { ...BASE_POST, bloom: 0.28, gradeCss: 'saturate(1.22) contrast(1.05) brightness(0.98)' },
    mood: 'Jungle Ruins — temple courtyard rally',
  },
  frost_peak_01: {
    palette: { primary: '#5DADE2', secondary: '#E8F4FF', accent: '#FFFFFF', fog: 0xd0e8f8 },
    keyLight: 0xe8f4ff, fillLight: 0xb8ddf0, rimLight: 0xffffff, ambient: 0xd0e8f8,
    ground: 0xe8f4fc, roadStyle: 'frost_ice',
    lightingTemp: 'cold-day', atmosphere: 'alpine-snow', fogDensity: 0.0025,
    post: { ...BASE_POST, bloom: 0.32, gradeCss: 'saturate(1.25) contrast(1.08) brightness(1.1)' },
    mood: 'Frost Peak — alpine ice descent',
  },
  lava_foundry_01: {
    palette: { primary: '#FF4500', secondary: '#2F2F2F', accent: '#FFD700', fog: 0x662200 },
    keyLight: 0xff8844, fillLight: 0xff6622, rimLight: 0xffcc00, ambient: 0x4a2010,
    ground: 0x3a2a22, roadStyle: 'volcano_charcoal',
    lightingTemp: 'forge-hot', atmosphere: 'volcanic-forge', fogDensity: 0.0028,
    post: { ...BASE_POST, bloom: 0.42, gradeCss: 'saturate(1.35) contrast(1.12) brightness(1.02)' },
    underground: true,
    mood: 'Lava Foundry — molten forge circuit',
  },
  star_station_01: {
    palette: { primary: '#AA44FF', secondary: '#00FFFF', accent: '#FF8844', fog: 0x4a2878 },
    keyLight: 0xfff0e8, fillLight: 0x6a7088, rimLight: 0x44eeff, ambient: 0x2a2c3a,
    ground: 0x0a0818, roadStyle: 'cosmic_metal',
    lightingTemp: 'cosmic-skyway', atmosphere: 'neon-space-highway', fogDensity: 0.0012,
    post: { ...BASE_POST, bloom: 0.45, gradeCss: 'saturate(1.2) contrast(1.12) brightness(1.02)' },
    underground: false,
    isCosmicBiome: true,
    mood: 'Cosmic Skyway — neon highway past wormhole and planet',
  },
  fairy_glen_01: {
    palette: { primary: '#7CFC00', secondary: '#FFD700', accent: '#FF69B4', fog: 0xd0ecc0 },
    keyLight: 0xfff8e0, fillLight: 0xa8e060, rimLight: 0xffd700, ambient: 0xc8e8a0,
    ground: 0x7cb342, roadStyle: 'garden_green',
    lightingTemp: 'golden-hour', atmosphere: 'enchanted-garden', fogDensity: 0.0009,
    post: { ...BASE_POST, bloom: 0.42, gradeCss: 'saturate(1.42) contrast(1.1) brightness(1.08)' },
    mood: 'Fairy Glen — enchanted garden spiral',
  },
  thunder_ridge_01: {
    palette: { primary: '#4A5568', secondary: '#87CEEB', accent: '#FFD700', fog: 0xb0c4d8 },
    keyLight: 0x8899aa, fillLight: 0x4a5568, rimLight: 0xffd700, ambient: 0x2a3040,
    ground: 0x5a6068, roadStyle: 'metro_black',
    lightingTemp: 'storm-mountain', atmosphere: 'thunder-storm', fogDensity: 0.001,
    post: { ...BASE_POST, bloom: 0.32, gradeCss: 'saturate(1.12) contrast(1.08) brightness(1.0)' },
    mood: 'Thunder Ridge — storm mountain challenge',
  },
};

export function getBiomeAAASpec(arenaType) {
  return BIOME_AAA_SPECS[arenaType] || BIOME_AAA_SPECS.sunset_cove_01;
}

export function getBiomeCssGrade(arenaType) {
  return getBiomeAAASpec(arenaType).post?.gradeCss || 'saturate(1.28) contrast(1.08) brightness(1.08)';
}
