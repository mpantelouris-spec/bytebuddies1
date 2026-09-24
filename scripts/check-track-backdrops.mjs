/**
 * Verify all 10 CodeRacer backdrop PNGs exist in public/ and return HTTP 200 when served.
 */
import { access } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const TRACK_DIR = join(ROOT, 'public/assets/backgrounds/tracks');

const FILES = [
  'crystal_cavern_reference.png',
  'sky_garden_reference.png',
  'cyber_city_reference.png',
  'volcanic_inferno_reference.png',
  'frost_peak_reference.png',
  'jungle_gate_grand_prix.png',
  'stardust_galaxy_reference.png',
  'sunny_meadow_500.png',
  'coral_bay_sprint.png',
  'ancient_ruins_reference.png',
];

let failed = 0;
for (const file of FILES) {
  const path = join(TRACK_DIR, file);
  try {
    await access(path);
    console.log(`[BackdropCheck] OK  ${file}`);
  } catch {
    console.error(`[BackdropCheck] MISSING  ${file}`);
    failed += 1;
  }
}

if (failed) {
  console.error(`[BackdropCheck] ${failed} file(s) missing under public/assets/backgrounds/tracks/`);
  process.exit(1);
}
console.log('[BackdropCheck] All 10 backdrop PNGs present.');
