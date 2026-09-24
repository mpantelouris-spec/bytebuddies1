#!/usr/bin/env node
/** Sync rover/scout catalog names to the 10 premium CodeRacer tracks. */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const catalogPath = path.join(root, 'src/virtual-robot-designer/data/chassis-mode-catalog.js');
const { CHASSIS_MODE_MAP } = await import(path.join(root, 'src/virtual-robot-designer/data/chassis-game-modes.js'));
const { BIOME_TRACKS } = await import(path.join(root, 'src/virtual-robot-designer/racing/mk-tracks/BiomeTrackRegistry.js'));

let text = fs.readFileSync(catalogPath, 'utf8');

for (const chassisId of ['rover', 'scout']) {
  const ids = CHASSIS_MODE_MAP[chassisId] || [];
  ids.forEach((modeId, i) => {
    const track = BIOME_TRACKS[i];
    if (!track) return;
    const blockRe = new RegExp(
      `("${modeId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"\\s*:\\s*\\{[\\s\\S]*?)"name":\\s*"[^"]*"`,
    );
    if (!blockRe.test(text)) {
      console.warn('skip (no match):', modeId);
      return;
    }
    text = text.replace(blockRe, `$1"name": "${track.label}"`);
    const shortRe = new RegExp(
      `("${modeId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"\\s*:\\s*\\{[\\s\\S]*?)"shortName":\\s*"[^"]*"`,
    );
    text = text.replace(shortRe, `$1"shortName": "${track.label}"`);
    const descRe = new RegExp(
      `("${modeId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"\\s*:\\s*\\{[\\s\\S]*?)"desc":\\s*"[^"]*"`,
    );
    const story = (track.story || track.label).replace(/"/g, '\\"');
    text = text.replace(descRe, `$1"desc": "${story}"`);
    const tagRe = new RegExp(
      `("${modeId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"\\s*:\\s*\\{[\\s\\S]*?)"tagline":\\s*"[^"]*"`,
    );
    text = text.replace(tagRe, `$1"tagline": "${story}"`);
    console.log('updated catalog:', chassisId, i + 1, track.label);
  });
}

fs.writeFileSync(catalogPath, text);
console.log('Racing catalog names synced.');
