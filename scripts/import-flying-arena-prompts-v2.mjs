import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { CHASSIS_MODE_MAP } from '../src/virtual-robot-designer/data/chassis-game-modes.js';

const source = readFileSync(new URL('../docs/bytebuddies-flying-arena-prompts-v2.txt', import.meta.url), 'utf8');
const records = {};
for (const block of source.split('MISSION ID:').slice(1)) {
  const id = block.split('\n')[0].trim();
  const field = label => {
    const value = block.match(new RegExp(`^${label}:\\s*(.+)$`, 'm'))?.[1];
    assert.ok(value, `${id}: missing ${label}`);
    return value.trim();
  };
  const section = n => block.match(new RegExp(`━━━ ${n}\\. [^\\n]+\\n([\\s\\S]*?)(?=━━━ ${n + 1}\\.)`))?.[1].trim();
  const robot = field('ROBOT').match(/^(\w+) · Mode (\d+)\/10/);
  assert.ok(robot, `${id}: invalid robot`);
  const [, chassisId, number] = robot;
  const mode = Number(number);
  assert.equal(CHASSIS_MODE_MAP[chassisId]?.[mode - 1], id, `${id}: catalog order mismatch`);
  assert.ok(!records[id], `${id}: duplicate mission`);
  const colors = section(5).match(/#[\da-f]{6}/gi);
  const gateText = section(5).split(' · ').slice(4).join(' · ');
  const range = gateText.match(/^(\d+)(?:[–-](\d+))?/);
  assert.ok(range, `${id}: missing gate count`);
  const sky = Object.fromEntries(['top', 'mid', 'horizon', 'fog'].map(key => [key, field(key)]));
  const [near, far] = field('near/far').split('/').map(Number);
  const recipeId = field('ARENA RECIPE').split(' ')[0];
  records[id] = {
    id, chassisId, mode, title: field('DISPLAY NAME'), objective: field('OBJECTIVE'),
    version: field('SPEC VERSION'), recipeId,
    sky: { ...sky, near, far }, goldenHour: field('goldenHour') === 'YES',
    bloom: Number(field('bloom')), parallaxClouds: field('parallaxClouds').startsWith('YES'),
    aerialVista: block.match(/aerialVista: '([^']+)'/)[1],
    spawnKind: field('spawnKind'),
    gateColors: Object.fromEntries(['primary','secondary','final'].map((key,i) => [key, parseInt(colors[i].slice(1),16)])),
    gates: { count: Number(range[2] || range[1]), targetCount: /5 ground bullseyes/.test(gateText) ? 5 : 0,
      tier: /hard tier|tight FPV/.test(gateText) ? 'hard' : /forgiving|wide/.test(gateText) ? 'forgiving' : 'standard',
      stuntRing: /stunt ring \(mixed\)|7 rings \+ stunt/.test(gateText), description: gateText },
    layout: section(4), dressing: section(6), bans: section(9),
  };
}
assert.equal(Object.keys(records).length, 90);
assert.equal(new Set(Object.values(records).map(r => r.chassisId)).size, 9);
const output = `/** Generated from docs/bytebuddies-flying-arena-prompts-v2.txt; do not edit. */\nexport const FLYING_MISSION_SPECS = ${JSON.stringify(records,null,2)};\n`;
const path = new URL('../src/virtual-robot-designer/studio/aerial-world/FlyingMissionSpecs.js',import.meta.url);
if (process.argv.includes('--check')) assert.equal(readFileSync(path,'utf8'),output,'Flying specs are stale');
else writeFileSync(path,output);
console.log('PASS: imported all 90 flying mission build orders.');
