#!/usr/bin/env node
/**
 * Copy / prepare track backdrop PNGs in public/assets/backgrounds/tracks/
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'public/assets/backgrounds/tracks');

const COPIES = [
  ['public/assets/backgrounds/crystal_cavern_reference.png', 'crystal_cavern_reference.png'],
  ['public/assets/backgrounds/stage/backdrop_01.png', 'sunset_coast_reference.png'],
  ['public/assets/backgrounds/stage/backdrop_03.png', 'sky_garden_reference.png'],
  ['public/assets/backgrounds/stage/backdrop_02.png', 'volcanic_inferno_reference.png'],
  ['public/assets/backgrounds/stage/backdrop_04.png', 'cyber_city_reference.png'],
  ['public/assets/backgrounds/stage/backdrop_05.png', 'frost_peak_reference.png'],
  ['public/assets/backgrounds/stage/backdrop_01.png', 'ancient_ruins_reference.png'],
  ['public/assets/backgrounds/stage/backdrop_02.png', 'stardust_galaxy_reference.png'],
  ['public/assets/backgrounds/stage/backdrop_03.png', 'meadow_valley_reference.png'],
  ['public/assets/backgrounds/stage/backdrop_04.png', 'shadow_metro_reference.png'],
];

fs.mkdirSync(OUT, { recursive: true });

for (const [srcRel, destName] of COPIES) {
  const src = path.join(ROOT, srcRel);
  const dest = path.join(OUT, destName);
  if (!fs.existsSync(src)) {
    console.error('[Backdrop] MISSING source:', srcRel);
    continue;
  }
  fs.copyFileSync(src, dest);
  console.log('[Backdrop] Ready:', destName, `(${fs.statSync(dest).size} bytes)`);
}
