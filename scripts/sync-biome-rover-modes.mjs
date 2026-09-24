/**
 * Sync rover modes 1–10 in chassis-mode-catalog.js to BIOME_TRACKS.
 * Then run: node scripts/sync-chassis-game-modes.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { BIOME_TRACKS } from '../src/virtual-robot-designer/racing/mk-tracks/BiomeTrackRegistry.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const catalogPath = path.join(__dirname, '../src/virtual-robot-designer/data/chassis-mode-catalog.js');

const ROVER_MODE_IDS = [
  'rover_rover_obstacle_course',
  'rover_balanced_sprint',
  'rover_cargo_delivery_relay',
  'rover_precision_parking_trial',
  'rover_reverse_driving_challenge',
  'rover_slalom_weave',
  'rover_fuel_efficiency_cruise',
  'rover_tow_truck_pull',
  'rover_stop_and_go_traffic_drill',
  'rover_rover_grand_tour',
];

const TIERS = ['Tutorial', 'Tutorial', 'Easy', 'Easy', 'Medium', 'Medium', 'Medium', 'Hard', 'Hard', 'Expert'];
const TYPES = ['Training', 'Training', 'Training', 'Training', 'Mission', 'Mission', 'Mission', 'Mission', 'Mission', 'Mission'];

let src = fs.readFileSync(catalogPath, 'utf8');

ROVER_MODE_IDS.forEach((modeId, i) => {
  const track = BIOME_TRACKS[i];
  if (!track) return;
  const re = new RegExp(`("${modeId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}":\\s*\\{)([\\s\\S]*?)(\\n  \\})`, 'm');
  const match = src.match(re);
  if (!match) {
    console.warn('Missing catalog entry:', modeId);
    return;
  }
  const block = match[2];
  const updated = block
    .replace(/"name":\s*"[^"]*"/, `"name": "${track.label}"`)
    .replace(/"shortName":\s*"[^"]*"/, `"shortName": "${track.label}"`)
    .replace(/"desc":\s*"[^"]*"/, `"desc": "${track.story.replace(/"/g, '\\"')}"`)
    .replace(/"tagline":\s*"[^"]*"/, `"tagline": "${track.story.replace(/"/g, '\\"')}"`)
    .replace(/"difficulty":\s*"[^"]*"/, `"difficulty": "${track.tier}"`)
    .replace(/"modeType":\s*"[^"]*"/, `"modeType": "${TYPES[i]}"`);
  src = src.replace(re, `$1${updated}$3`);
  console.log(`✓ ${i + 1}. ${track.label}`);
});

fs.writeFileSync(catalogPath, src);
console.log('\nCatalog updated. Run: node scripts/sync-chassis-game-modes.mjs');
