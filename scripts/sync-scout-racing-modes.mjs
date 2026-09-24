/**
 * Sync scout chassis modes 1–10 to the same 10 AAA biome tracks as rover.
 * Run: node scripts/sync-scout-racing-modes.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CHASSIS_MODE_MAP } from '../src/virtual-robot-designer/data/chassis-game-modes.js';
import { applyCarRacingArena } from '../src/virtual-robot-designer/data/car-racing-tracks.js';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const filePath = path.join(root, 'src/virtual-robot-designer/data/chassis-game-modes.js');
let text = fs.readFileSync(filePath, 'utf8');

const scoutIds = CHASSIS_MODE_MAP.scout;
const roverIds = CHASSIS_MODE_MAP.rover;

scoutIds.forEach((scoutId, i) => {
  const roverId = roverIds[i];
  const scoutBlockRe = new RegExp(`"${scoutId}":\\s*\\{([\\s\\S]*?)^\\s*\\},`, 'm');
  const roverBlockRe = new RegExp(`"${roverId}":\\s*\\{([\\s\\S]*?)^\\s*\\},`, 'm');
  const scoutMatch = scoutBlockRe.exec(text);
  const roverMatch = roverBlockRe.exec(text);
  if (!scoutMatch || !roverMatch) {
    console.warn('Skip', scoutId);
    return;
  }

  const scoutBlock = scoutMatch[0];
  const roverBlock = roverMatch[0];

  const copyFields = [
    'arenaType', 'name', 'desc', 'shortName', 'tagline', 'color', 'icon',
    'linkedRaceCourse', 'environmentId', 'environmentName', 'environmentEmoji',
    'raceTrackLabel', 'mkTier', 'mkDifficulty', 'physics', 'camera', 'genre', 'cat',
    'catalogName', 'winCondition',
  ];

  let newBlock = scoutBlock;
  for (const field of copyFields) {
    const re = new RegExp(`"${field}":\\s*(?:"(?:\\\\.|[^"\\\\])*"|\\[[\\s\\S]*?\\]|[^,\\n]+)`, 'm');
    const roverVal = re.exec(roverBlock);
    if (!roverVal) continue;
    if (re.test(newBlock)) {
      newBlock = newBlock.replace(re, roverVal[0]);
    }
  }

  // campusMode name/shortName/objectives from rover
  const campusRe = /"campusMode":\s*\{[\s\S]*?\n\s*\}/m;
  const roverCampus = campusRe.exec(roverBlock);
  if (roverCampus && campusRe.test(newBlock)) {
    newBlock = newBlock.replace(campusRe, roverCampus[0]);
  }

  text = text.replace(scoutBlock, newBlock);
  console.log('Synced', scoutId, '->', roverId);
});

fs.writeFileSync(filePath, text);
console.log('Done — scout modes updated in chassis-game-modes.js');
