/**
 * Update chassis-game-modes.js rover mode arena types to 2026 track lineup.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BIOME_TRACKS } from '../src/virtual-robot-designer/racing/mk-tracks/BiomeTrackRegistry.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const path = join(ROOT, 'src/virtual-robot-designer/data/chassis-game-modes.js');
let content = readFileSync(path, 'utf8');

const OLD_TO_NEW = {
  crystal_palace_01: 'sunset_cove_01',
  cyber_boulevard_01: 'candy_carnival_01',
  forest_maze_01: 'neon_metro_01',
  volcano_canyon_01: 'cloud_citadel_01',
  ice_cavern_01: 'jungle_ruins_01',
  underwater_temple_01: 'frost_peak_01',
  sky_island_01: 'lava_foundry_01',
  desert_dunes_01: 'star_station_01',
  moonlight_cavern_01: 'fairy_glen_01',
  magic_forest_01: 'thunder_ridge_01',
};

for (const [oldId, newId] of Object.entries(OLD_TO_NEW)) {
  content = content.split(oldId).join(newId);
}

// Update mode metadata from registry for rover entries
BIOME_TRACKS.forEach((track, i) => {
  const modeNum = i + 1;
  const label = track.label;
  const emoji = track.emoji;
  const story = track.story;
  content = content.replace(
    new RegExp(`("modeIndex": ${modeNum},[^}]+?"name": )"[^"]+"`, 'g'),
    `$1"${label}"`,
  );
});

writeFileSync(path, content);
console.log('[update-chassis-tracks] chassis-game-modes.js updated for 10 new tracks');
