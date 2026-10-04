/** Stage backdrop images for Game Builder (480×360 stage, art is 960×720). */
const BG_V = 4;
const DIR = '/assets/backgrounds/stage';

/** Order matters: saved projects use the backdrop number, so only ever append. */
const BACKDROP_FILES = [
  ['Grassland', 'grassland'],
  ['Desert', 'desert'],
  ['Beach', 'beach'],
  ['Night City', 'night_city'],
  ['Forest', 'forest'],
  ['Outer Space', 'outer_space'],
  ['Underwater Reef', 'underwater_reef'],
  ['Snow Village', 'snow_village'],
  ['Volcano Island', 'volcano_island'],
  ['Candy Land', 'candy_land'],
  ['Haunted House', 'haunted_house'],
  ['Jungle Temple', 'jungle_temple'],
  ['Medieval Castle', 'medieval_castle'],
  ['Pirate Cove', 'pirate_cove'],
  ['Arctic Aurora', 'arctic_aurora'],
  ['Floating Islands', 'floating_islands'],
  ['Crystal Cave', 'crystal_cave'],
  ['Robot Factory', 'robot_factory'],
  ['Wild West', 'wild_west'],
  ['Autumn Forest', 'autumn_forest'],
  ['Ancient Egypt', 'ancient_egypt'],
  ['Neon City', 'neon_city'],
  ['Dragon Lair', 'dragon_lair'],
  ['Farm', 'farm'],
  ['Football Stadium', 'football_stadium'],
  ['Classroom', 'classroom'],
  ['Dinosaur Valley', 'dinosaur_valley'],
  ['Space Station', 'space_station'],
  ['Mushroom Village', 'mushroom_village'],
  ['Playground', 'playground'],
  ['Sunset Hills', 'sunset_hills'],
  ['Race Track', 'race_track'],
];

export const STAGE_BACKDROPS = [
  { name: 'White', image: null },
  ...BACKDROP_FILES.map(([name, file]) => ({
    name,
    image: `${DIR}/${file}.jpg?v=${BG_V}`,
    thumb: `${DIR}/thumbs/${file}.jpg?v=${BG_V}`,
  })),
];

export const STAGE_BACKDROP_NAMES = STAGE_BACKDROPS.map((b) => b.name);

/** Old placeholder labels → current names (saved projects). */
const BACKDROP_LEGACY_ALIASES = {
  'Magic Forest': 'Mushroom Village',
  'Cyberpunk City': 'Neon City',
  'Space Colony': 'Outer Space',
  'Haunted Graveyard': 'Haunted House',
  'Underwater Castle': 'Underwater Reef',
  'Halloween Night': 'Haunted House',
  'Floating Castle': 'Floating Islands',
  'Sky Kingdom': 'Floating Islands',
  'Cloud Islands': 'Floating Islands',
  'Ocean Shore': 'Beach',
  'Desert Ruins': 'Ancient Egypt',
  'Volcano Lava': 'Volcano Island',
  'Cyber Alley': 'Neon City',
  'Graveyard': 'Haunted House',
};

export function resolveStageBackdropName(name) {
  if (!name) return name;
  return BACKDROP_LEGACY_ALIASES[name] || name;
}

export function findStageBackdrop(name) {
  const resolved = resolveStageBackdropName(name);
  return STAGE_BACKDROPS.find((b) => b.name === resolved) || null;
}
