/**
 * Smoke checks for Game Builder: fully-implemented Blockly types must map to game block types.
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

function extractBBFullyImplemented(src) {
  const m = src.match(/export const BB_FULLY_IMPLEMENTED = new Set\(\[([\s\S]*?)\]\)/);
  if (!m) throw new Error('BB_FULLY_IMPLEMENTED not found in blocklyToolboxEntries.js');
  return [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
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

function extractMapTypeKeys(src) {
  const start = src.indexOf('const mapType = {');
  if (start < 0) throw new Error('mapType not found in GameBuilder.jsx');
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
  const keys = [];
  const re = /\b(bb_[a-z0-9_]+)\s*:/g;
  let m;
  while ((m = re.exec(body))) keys.push(m[1]);
  return keys;
}

function extractCustomImages(src) {
  const out = [];
  const re = /customImage:\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(src))) out.push(m[1]);
  return [...new Set(out)];
}

let failed = false;

const gbSrc = fs.readFileSync(gameBuilderPath, 'utf8');
const blocksSrc = fs.readFileSync(blocksPath, 'utf8');
const toolboxSrc = fs.readFileSync(toolboxPath, 'utf8');
const blockDefKeys = extractBlockDefKeys(blocksSrc);
const mapKeys = new Set(extractMapTypeKeys(gbSrc));
const bbFullyImplemented = extractBBFullyImplemented(toolboxSrc);

for (const bb of bbFullyImplemented) {
  if (!mapKeys.has(bb)) {
    console.error(`MISSING mapType entry for ${bb} (in BB_FULLY_IMPLEMENTED)`);
    failed = true;
  }
}

for (const bb of mapKeys) {
  const gameType = (() => {
    const match = gbSrc.match(new RegExp(`${bb}:\\s*'([^']+)'`));
    return match ? match[1] : null;
  })();
  if (gameType && !blockDefKeys.has(gameType)) {
    console.error(`mapType ${bb} → ${gameType} has no BLOCK_DEFS entry`);
    failed = true;
  }
}

const publicDir = path.join(root, 'public');
for (const url of extractCustomImages(gbSrc)) {
  if (!url.startsWith('/')) continue;
  const disk = path.join(publicDir, url.replace(/^\//, ''));
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
