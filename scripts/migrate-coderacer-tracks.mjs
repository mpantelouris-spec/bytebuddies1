#!/usr/bin/env node
/** Migrate old CodeRacer track IDs to 10 brand-new premium IDs. */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(root, 'src');

const MAP = {
  garden_01: 'sky_island_01',
  arcade_city_01: 'cyber_boulevard_01',
  cavern_01: 'crystal_palace_01',
  beach_01: 'desert_dunes_01',
  volcano_01: 'volcano_canyon_01',
  mountain_01: 'ice_cavern_01',
  ruins_01: 'underwater_temple_01',
  cyber_downtown_01: 'cyber_boulevard_01',
  mushroom_forest_01: 'forest_maze_01',
  space_drift_01: 'moonlight_cavern_01',
};

function walk(dir, files = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, files);
    else if (/\.(js|jsx|ts|tsx|mjs)$/.test(name)) files.push(p);
  }
  return files;
}

let changed = 0;
for (const file of walk(srcDir)) {
  let text = fs.readFileSync(file, 'utf8');
  let next = text;
  for (const [oldId, newId] of Object.entries(MAP)) {
    next = next.split(oldId).join(newId);
  }
  if (next !== text) {
    fs.writeFileSync(file, next);
    changed++;
    console.log('updated:', path.relative(root, file));
  }
}
console.log(`Done. ${changed} files updated.`);
