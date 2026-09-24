/** Compile the supplied visual bible without changing gameplay specifications. */
import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { GAME_MODE_SPECS_BY_ID } from '../src/virtual-robot-designer/data/game-mode-specifications.js';

const source = readFileSync(new URL('../docs/bytebuddies-arena-visual-bible-v3.txt', import.meta.url), 'utf8');
const chassis = ['crawler', 'tank', 'stealth', 'miningbot', 'securitybot', 'farmbot', 'spider', 'droid', 'mech', 'drone', 'racedrone', 'rescuedrone', 'helicopter', 'hoverbot', 'hoverracer', 'submarine', 'deepseabot', 'robotarm', 'factorybot', 'spacerover', 'legobot', 'battlebot', 'striker', 'blaster', 'ninja', 'berserker', 'medbot', 'firebot', 'jetplane', 'steathjet', 'aerobat', 'birdbot', 'custom'];
const missions = source.split('PART 3 — ALL MISSIONS')[1].split('PART 4 — IMPLEMENTATION')[0];
const blocks = [...missions.matchAll(/^Mode (\d+) — (.+)\n([\s\S]*?)(?=^Mode \d+ — |$(?![\s\S]))/gm)];
assert.equal(blocks.length, 330, 'The bible must contain all 330 missions');
const specs = Object.values(GAME_MODE_SPECS_BY_ID);
const records = {};
for (const [index, match] of blocks.entries()) {
  const chassisId = chassis[Math.floor(index / 10)];
  const modeNumber = Number(match[1]);
  assert.equal(modeNumber, index % 10 + 1, `Unexpected mode order for ${chassisId}`);
  const spec = specs.find(s => s.chassisId === chassisId && s.modeNumber === modeNumber);
  assert.ok(spec, `Missing gameplay spec: ${chassisId} ${modeNumber}`);
  const block = match[3].replaceAll('**', '');
  const field = (label, separator = ':') => {
    const value = block.match(new RegExp(`^${label}${separator} (.+)$`, 'm'))?.[1];
    assert.ok(value, `Missing ${label}: ${spec.id}`);
    return value.trim();
  };
  const colors = field('PALETTE', '').match(/#[\da-f]{6}/gi);
  assert.ok(colors?.length >= 3, `Invalid palette: ${spec.id}`);
  const environmentId = block.match(/^\w+ · .+ \((\w+)\)$/m)?.[1];
  assert.ok(environmentId, `Missing environment: ${spec.id}`);
  records[spec.id] = {
    chassisId, modeNumber, title: match[2].replace(/ \(CAPSTONE\)$/, ''), environmentId,
    palette: { primary: colors[0], secondary: colors[1], accent: colors[2] }, paletteColors: colors,
    camera: field('CAMERA', '').split(/\s/)[0], cameraDescription: field('CAMERA', ''), lighting: field('LIGHTING', ''),
    scatterRecipe: field('SCATTER DENSITY', ''),
    lookDescription: field('LOOK'), heroDescription: field('HERO PROPS'),
    goalDescription: field('GOAL MARKER'), mood: field('MOOD'),
  };
}
const output = `/** Generated from docs/bytebuddies-arena-visual-bible-v3.txt. Run scripts/import-arena-visual-bible-v3.mjs. */\nexport const MISSION_ART_DIRECTION_V3 = ${JSON.stringify(records, null, 2)};\n`;
const destination = new URL('../src/virtual-robot-designer/studio/mission-world/MissionArtDirectionV3.js', import.meta.url);
if (process.argv.includes('--check')) {
  assert.equal(readFileSync(destination, 'utf8'), output, 'Generated visual data is stale');
} else {
  writeFileSync(destination, output);
}
console.log(`Validated ${Object.keys(records).length} v3 mission visual records across ${chassis.length} robots.`);
