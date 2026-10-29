/** Block Crafter modes 11–50, using its ten real voxel worlds. */
import { writeData, TIERS } from './common.mjs';

const WORLDS = [
  [
    ['Woodland Gatherer', 'Chop 5 logs from the trees'],
    ['Ranger’s Clearing', 'Clear the clearing: chop down every tree'],
    ['Lakeside Lumber and Replant', 'Chop 12 logs, then plant 3 new trees'],
    ['Night Forest Clear-Out', 'Chop down every tree in the forest'],
  ],
  [
    ['First Wooden Pickaxe', 'Craft 1 wooden pickaxe'],
    ['Tools for the Trail', 'Craft 2 wooden pickaxes'],
    ['Workshop Stock-Up', 'Craft 3 wooden pickaxes'],
    ['Carpenter’s Supply Run', 'Craft 4 wooden pickaxes'],
  ],
  [
    ['Riverside House', 'Build a house'],
    ['Snowy Street', 'Build 2 houses for the village'],
    ['Desert Outpost', 'Build 2 houses and a watchtower'],
    ['Lantern Village', 'Build a village: 3 houses, a watchtower and 2 trees'],
  ],
  [
    ['Coal and Iron Starter Mine', 'Mine 4 coal and 3 iron ore'],
    ['Two-Level Mine Survey', 'Mine 6 coal and 4 iron ore'],
    ['Deep Seam Expedition', 'Mine 8 coal and 6 iron ore'],
    ['Master Miner’s Haul', 'Mine 10 coal and 8 iron ore'],
  ],
  [
    ['The First Buried Diamond', 'Dig under the glowing block to find 1 diamond'],
    ['Desert Marker Trail', 'Dig under all 2 glowing blocks to find 2 diamonds'],
    ['Three-Site Treasure Hunt', 'Dig under all 3 glowing blocks to find 3 diamonds'],
    ['Five-Point Desert Expedition', 'Dig under all 5 glowing blocks to find 5 diamonds'],
  ],
  [
    ['Snowy Summit Steps', 'Build steps and stand next to the gold block on the summit'],
    ['Upper Ridge Ascent', 'Build steps up the taller, steeper peak to the gold block'],
    ['High Peak Route', 'Build steps up the taller, steeper peak to the gold block'],
    ['Snowcap Summit Mastery', 'Build steps up the tallest, steepest peak to the gold block'],
  ],
  [
    ['Lava Bridge Builder', 'Place blocks to bridge the lava and reach the portal'],
    ['Eight-Block Lava Crossing', 'Bridge the 8-block lava river and reach the portal'],
    ['Ten-Block Lava Crossing', 'Bridge the 10-block lava river and reach the portal'],
    ['Eleven-Block Portal Bridge', 'Bridge the 11-block lava river and reach the portal'],
  ],
  [
    ['Deep Hall Diamond Hunt', 'Mine 3 diamonds in the deep hall'],
    ['Underground Survey', 'Mine 5 diamonds in the deep hall'],
    ['Deep Stone Expedition', 'Mine 7 diamonds in the deep hall'],
    ['Nine-Diamond Master Survey', 'Mine 9 diamonds in the deep hall'],
  ],
  [
    ['Sky Island Bridge', 'Build bridges across the sky to the gold block'],
    ['Zigzag Island Crossing', 'Bridge from island to island and climb to the gold block'],
    ['Narrow Skyway', 'Bridge between the small islands and climb to the gold block'],
    ['High-Altitude Island Chain', 'Bridge across the full island chain and climb to the gold block'],
  ],
  [
    ['Stone Tool Workshop', 'From nothing: craft a stone pickaxe'],
    ['Furnace Foundations', 'From nothing: craft a furnace'],
    ['Smelt Two Iron Ingots', 'From nothing: smelt 2 iron ingots'],
    ['Iron Pickaxe Capstone', 'From nothing: craft an iron pickaxe'],
  ],
];

export function buildCraft() {
  const levels = [];
  for (let tier = 0; tier < 4; tier++) {
    for (let world = 0; world < WORLDS.length; world++) {
      const [name, goal] = WORLDS[world][tier];
      levels.push({
        mode: 11 + tier * 10 + world,
        name,
        tier: TIERS[tier],
        baseMode: world + 1,
        world: world + 1,
        goal,
      });
    }
  }
  const size = writeData('craft-tiers.js', 'Block Crafter modes 11–50: four difficulty tiers across ten voxel worlds.', {
    BLOCK_CRAFTER_TIER_LEVELS: levels,
  });
  return { levels, size };
}

if (process.argv[1]?.endsWith('build-craft.mjs')) {
  const { levels, size } = buildCraft();
  console.log(`Generated ${levels.length} Block Crafter tiers (${size} bytes)`);
}
