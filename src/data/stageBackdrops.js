/** Stage backdrop images for Game Builder (480×360 stage). */
const BG_V = 2;

export const STAGE_BACKDROPS = [
  { name: 'White', image: null },
  { name: 'Magic Forest', image: `/assets/backgrounds/stage/backdrop_01.png?v=${BG_V}` },
  { name: 'Volcano Island', image: `/assets/backgrounds/stage/backdrop_02.png?v=${BG_V}` },
  { name: 'Cyberpunk City', image: `/assets/backgrounds/stage/backdrop_03.png?v=${BG_V}` },
  { name: 'Pirate Cove', image: `/assets/backgrounds/stage/backdrop_04.png?v=${BG_V}` },
  { name: 'Space Colony', image: `/assets/backgrounds/stage/backdrop_05.png?v=${BG_V}` },
  { name: 'Haunted Graveyard', image: `/assets/backgrounds/stage/backdrop_06.png?v=${BG_V}` },
  { name: 'Underwater Castle', image: `/assets/backgrounds/stage/backdrop_07.png?v=${BG_V}` },
  { name: 'Candy Land', image: `/assets/backgrounds/stage/backdrop_08.png?v=${BG_V}` },
  { name: 'Halloween Night', image: `/assets/backgrounds/stage/backdrop_09.png?v=${BG_V}` },
  { name: 'Jungle Temple', image: `/assets/backgrounds/stage/backdrop_10.png?v=${BG_V}` },
  { name: 'Floating Castle', image: `/assets/backgrounds/stage/backdrop_11.png?v=${BG_V}` },
  { name: 'Wild West', image: `/assets/backgrounds/stage/backdrop_12.png?v=${BG_V}` },
  { name: 'Arctic Aurora', image: `/assets/backgrounds/stage/backdrop_13.png?v=${BG_V}` },
  { name: 'Sky Kingdom', image: `/assets/backgrounds/stage/backdrop_14.png?v=${BG_V}` },
  { name: 'Dragon Lair', image: `/assets/backgrounds/stage/backdrop_15.png?v=${BG_V}` },
  { name: 'Cloud Islands', image: `/assets/backgrounds/stage/backdrop_16.png?v=${BG_V}` },
  { name: 'Robot Factory', image: `/assets/backgrounds/stage/backdrop_17.png?v=${BG_V}` },
];

export const STAGE_BACKDROP_NAMES = STAGE_BACKDROPS.map((b) => b.name);

/** Old placeholder labels → current names (saved projects). */
const BACKDROP_LEGACY_ALIASES = {
  'Crystal Cave': 'Volcano Island',
  'Sunset Hills': 'Cyberpunk City',
  'Ocean Shore': 'Pirate Cove',
  'Snow Village': 'Space Colony',
  'Desert Ruins': 'Haunted Graveyard',
  'Night City': 'Underwater Castle',
  'Space Station': 'Candy Land',
  'Underwater Reef': 'Arctic Aurora',
  'Volcano Lava': 'Dragon Lair',
  'Autumn Forest': 'Dragon Lair',
  'Cyber Alley': 'Cloud Islands',
  'Medieval Castle': 'Wild West',
  'Floating Islands': 'Floating Castle',
  'Neon City': 'Cyberpunk City',
  Graveyard: 'Haunted Graveyard',
};

export function resolveStageBackdropName(name) {
  if (!name) return name;
  return BACKDROP_LEGACY_ALIASES[name] || name;
}

export function findStageBackdrop(name) {
  const resolved = resolveStageBackdropName(name);
  return STAGE_BACKDROPS.find((b) => b.name === resolved) || null;
}
