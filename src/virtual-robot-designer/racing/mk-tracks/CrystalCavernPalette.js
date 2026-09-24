/**
 * CrystalCavernPalette.js — Reference-image bioluminescent cave racer colors.
 */
export const CRYSTAL_CAVERN_PALETTE = {
  caveRockDark: 0x1f2833,
  caveRockMid: 0x4a4a4a,
  cavePurple: 0x9013fe,
  caveBlue: 0x1a3a52,
  crystalBlue: 0x00ffff,
  crystalBlueLight: 0x50e3c2,
  crystalPurple: 0xbd10e0,
  crystalPurpleDeep: 0x7a2fb5,
  crystalMagenta: 0xff1493,
  crystalLavender: 0xd4a5ff,
  trackObsidian: 0x0a0a0c,
  trackReflect: 0x121212,
  neonCyan: 0x00ffff,
  waterBase: 0x1a6b8a,
  waterEmissive: 0x00ffff,
  fogColor: 0x1a2040,
  ambientColor: 0x0d1020,
  hemiSky: 0x1a2040,
  hemiGround: 0x0a0a0c,
};

export const CRYSTAL_CAVERN_EMISSIVE = {
  laneStrip: 5.5,
  checkpointSign: 6.0,
  crystalHero: 3.8,
  crystalSmall: 2.8,
  archRing: 4.2,
  waterCaustic: 1.6,
  boostPad: 3.2,
};

export const CRYSTAL_CAVERN_TRACK = {
  trackWidth: 8.0,
  kerbWidth: 0.8,
  roadThickness: 0.18,
  archSpan: 10,
  archClearance: 3.5,
  checkeredWidth: 10,
  checkeredSquares: 16,
  checkpointTs: [0.25, 0.5, 0.75],
  boostTs: [0.18],
  hazardTs: [{ t: 0.35, slow: 0.85 }],
};
