/**
 * Verify every Flappy BirdBot toolbox block is registered in ROBOT_BLOCK_DEFS.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  FLAPPY_BLOCK_INVENTORY,
  getAllFlappyBlockTypes,
  buildFlappyBirdToolbox,
} from '../src/virtual-robot-designer/data/flappy-blockly-toolbox.js';
import { FLAPPY_BLOCK_DEFS } from '../src/virtual-robot-designer/data/flappy-block-defs.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const liveLabPath = path.join(__dirname, '../src/virtual-robot-designer/studio/LiveLabPage.jsx');
const src = fs.readFileSync(liveLabPath, 'utf8');

const defTypes = new Set([
  ...[...src.matchAll(/\{\s*type\s*:\s*'([^']+)'/g)].map((m) => m[1]),
  ...FLAPPY_BLOCK_DEFS.map((d) => d.type),
]);
const toolboxTypes = getAllFlappyBlockTypes();
const builtin = new Set(['math_number']);

const missing = toolboxTypes.filter((t) => !defTypes.has(t) && !builtin.has(t));
const extraInToolbox = Object.entries(FLAPPY_BLOCK_INVENTORY).flatMap(([cat, blocks]) =>
  blocks.filter((b) => !String(b).startsWith('__label__')).map((b) => ({ cat, type: b })),
);

if (missing.length) {
  console.error('Missing block definitions in LiveLabPage ROBOT_BLOCK_DEFS:');
  missing.forEach((t) => console.error('  -', t));
  process.exit(1);
}

const toolbox = buildFlappyBirdToolbox();
const flyoutCount = toolbox.contents.reduce((n, cat) => n + cat.contents.filter((c) => c.kind === 'block').length, 0);
const expectedCount = getAllFlappyBlockTypes().length;
const coreFlyoutCount = toolbox.contents
  .filter((c) => !String(c.name || '').startsWith('⭐'))
  .reduce((n, cat) => n + cat.contents.filter((c) => c.kind === 'block').length, 0);

if (coreFlyoutCount !== expectedCount) {
  console.error(`Toolbox block count mismatch: expected ${expectedCount} in core categories, got ${coreFlyoutCount}`);
  process.exit(1);
}

console.log(`OK — ${expectedCount} Flappy blocks in toolbox across ${toolbox.contents.length} categories`);
extraInToolbox.forEach(({ cat, type }) => {
  const tag = builtin.has(type) ? '(builtin)' : defTypes.has(type) ? '✓' : '✗';
  console.log(`  ${tag} ${cat}: ${type}`);
});
