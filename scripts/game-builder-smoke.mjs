/**
 * Smoke checks for Game Builder: BB_FULLY_IMPLEMENTED Blockly types must resolve to runtime blocks.
 * Run: node scripts/game-builder-smoke.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const gameBuilderPath = path.join(root, 'src/components/GameBuilder.jsx');
const blocksPath = path.join(root, 'src/utils/blocks.jsx');
const toolboxPath = path.join(root, 'src/utils/blocklyToolboxEntries.js');
const extensionPath = path.join(root, 'src/utils/extensionBlockMaps.js');
const operatorsPath = path.join(root, 'src/utils/operatorsRuntime.js');

function extractSetLiteral(src, marker) {
  const m = src.match(new RegExp(`export const ${marker} = new Set\\(\\[([\\s\\S]*?)\\]\\)`));
  if (!m) return new Set();
  return new Set([...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]));
}

function extractBBFullyImplemented(src) {
  const m = src.match(/export const BB_FULLY_IMPLEMENTED = new Set\(\[([\s\S]*?)\]\)/);
  if (!m) throw new Error('BB_FULLY_IMPLEMENTED not found');
  return new Set([...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]));
}

function extractObjectStringMap(src, marker) {
  const start = src.indexOf(marker);
  if (start < 0) throw new Error(`${marker} not found`);
  const sub = src.slice(start);
  const open = sub.indexOf('{');
  let depth = 0;
  let i = open;
  for (; i < sub.length; i++) {
    const ch = sub[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) break;
    }
  }
  const body = sub.slice(open + 1, i);
  const map = {};
  const re = /\b([a-z][a-zA-Z0-9_]*)\s*:\s*'([^']+)'/g;
  let m;
  while ((m = re.exec(body))) map[m[1]] = m[2];
  return map;
}

function extractBlockDefKeys(src) {
  const start = src.indexOf('export const BLOCK_DEFS = {');
  if (start < 0) throw new Error('BLOCK_DEFS not found in blocks.jsx');
  const sub = src.slice(start);
  const open = sub.indexOf('{');
  let depth = 0;
  let i = open;
  for (; i < sub.length; i++) {
    const ch = sub[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) break;
    }
  }
  const body = sub.slice(open + 1, i);
  const keys = new Set();
  const re = /'([a-z0-9-]+)'\s*:\s*\{/g;
  let m;
  while ((m = re.exec(body))) keys.add(m[1]);
  return keys;
}

function extractCustomImages(src) {
  const out = [];
  const re = /customImage:\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(src))) out.push(m[1]);
  return [...new Set(out)];
}

function resolveGameType(blocklyType, maps, blockDefKeys) {
  for (const map of maps) {
    if (map[blocklyType]) return map[blocklyType];
  }
  if (blockDefKeys.has(blocklyType)) return blocklyType;
  if (typeof blocklyType === 'string' && blocklyType.startsWith('bb_')) {
    const internal = blocklyType.slice(3).replace(/_/g, '-');
    if (blockDefKeys.has(internal)) return internal;
  }
  return null;
}

let failed = false;

const gbSrc = fs.readFileSync(gameBuilderPath, 'utf8');
const blocksSrc = fs.readFileSync(blocksPath, 'utf8');
const toolboxSrc = fs.readFileSync(toolboxPath, 'utf8');
const extensionSrc = fs.readFileSync(extensionPath, 'utf8');
const operatorsSrc = fs.readFileSync(operatorsPath, 'utf8');

const blockDefKeys = extractBlockDefKeys(blocksSrc);
const blocklyToGame = extractObjectStringMap(blocksSrc, 'export const BLOCKLY_TO_GAME_TYPE = {');
const mapType = extractObjectStringMap(gbSrc, 'const mapType = {');
const extensionToGame = extractObjectStringMap(extensionSrc, 'export const EXTENSION_BLOCKLY_TO_GAME = {');
const bbFullyImplemented = extractBBFullyImplemented(toolboxSrc);
const operatorTypes = extractSetLiteral(operatorsSrc, 'OPERATOR_GAME_TYPES');
const looksReporterTypes = extractSetLiteral(toolboxSrc, 'LOOKS_REPORTER_GAME_TYPES');
const listReporterTypes = extractSetLiteral(toolboxSrc, 'LIST_REPORTER_GAME_TYPES');
const maps = [blocklyToGame, mapType, extensionToGame];

function isValidRuntimeType(gameType) {
  if (!gameType) return false;
  if (operatorTypes.has(gameType)) return true;
  if (looksReporterTypes.has(gameType)) return true;
  if (listReporterTypes.has(gameType)) return true;
  return blockDefKeys.has(gameType);
}

const unresolved = [];
for (const bb of bbFullyImplemented) {
  const gameType = resolveGameType(bb, maps, blockDefKeys);
  if (!isValidRuntimeType(gameType)) {
    unresolved.push(`${bb} → ${gameType || '(none)'}`);
  }
}

if (unresolved.length) {
  failed = true;
  console.error(`Unresolved BB_FULLY_IMPLEMENTED blocks (${unresolved.length}):`);
  unresolved.forEach((line) => console.error(`  - ${line}`));
} else {
  console.log(`OK — all ${bbFullyImplemented.size} BB_FULLY_IMPLEMENTED blocks resolve to runtime types`);
}

for (const [bb, gameType] of Object.entries({ ...blocklyToGame, ...mapType, ...extensionToGame })) {
  if (gameType && !isValidRuntimeType(gameType)) {
    console.error(`map entry ${bb} → ${gameType} has no runtime handler`);
    failed = true;
  }
}

const publicDir = path.join(root, 'public');
for (const url of extractCustomImages(gbSrc)) {
  if (!url.startsWith('/')) continue;
  const disk = path.join(publicDir, url.replace(/^\//, '').split('?')[0]);
  if (!fs.existsSync(disk)) {
    console.error(`MISSING asset for library customImage: ${url} (expected ${disk})`);
    failed = true;
  }
}

if (failed) {
  console.error('\ngame-builder-smoke: FAILED');
  process.exit(1);
}
console.log('game-builder-smoke: OK (Blockly map + BLOCK_DEFS + sprite assets)');
