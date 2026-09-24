/** Stage backdrop images for Game Builder (480×360 stage). */
const BG_V = 3;

export const STAGE_BACKDROPS = [
  { name: 'White', image: null },
  { name: 'Grassland', image: `/assets/backgrounds/stage/backdrop_01.png?v=${BG_V}` },
  { name: 'Desert', image: `/assets/backgrounds/stage/backdrop_02.png?v=${BG_V}` },
  { name: 'Beach', image: `/assets/backgrounds/stage/backdrop_03.png?v=${BG_V}` },
  { name: 'Night City', image: `/assets/backgrounds/stage/backdrop_04.png?v=${BG_V}` },
  { name: 'Forest', image: `/assets/backgrounds/stage/backdrop_05.png?v=${BG_V}` },
];

export const STAGE_BACKDROP_NAMES = STAGE_BACKDROPS.map((b) => b.name);

/** Old placeholder labels → current names (saved projects). */
const BACKDROP_LEGACY_ALIASES = {
  'Magic Forest': 'Forest',
  'Volcano Island': 'Desert',
  'Cyberpunk City': 'Night City',
  'Pirate Cove': 'Beach',
  'Space Colony': 'Night City',
  'Haunted Graveyard': 'Forest',
  'Underwater Castle': 'Beach',
  'Candy Land': 'Grassland',
  'Halloween Night': 'Forest',
  'Jungle Temple': 'Forest',
  'Floating Castle': 'Grassland',
  'Wild West': 'Desert',
  'Arctic Aurora': 'Grassland',
  'Sky Kingdom': 'Grassland',
  'Dragon Lair': 'Desert',
  'Cloud Islands': 'Grassland',
  'Robot Factory': 'Night City',
  'Crystal Cave': 'Desert',
  'Sunset Hills': 'Desert',
  'Ocean Shore': 'Beach',
  'Snow Village': 'Grassland',
  'Desert Ruins': 'Desert',
  'Night City': 'Night City',
  'Space Station': 'Night City',
  'Underwater Reef': 'Beach',
  'Volcano Lava': 'Desert',
  'Autumn Forest': 'Forest',
  'Cyber Alley': 'Night City',
  'Medieval Castle': 'Grassland',
  'Floating Islands': 'Grassland',
  'Neon City': 'Night City',
  'Graveyard': 'Forest',
};

export function resolveStageBackdropName(name) {
  if (!name) return name;
  return BACKDROP_LEGACY_ALIASES[name] || name;
}

export function findStageBackdrop(name) {
  const resolved = resolveStageBackdropName(name);
  return STAGE_BACKDROPS.find((b) => b.name === resolved) || null;
}
