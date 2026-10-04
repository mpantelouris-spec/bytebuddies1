/**
 * Builds public/bytebuddies-runtime.hex — one universal hex:
 *   micro:bit V2 → runtime with Bluetooth + USB
 *   micro:bit V1 → runtime with USB only (V1 has no room for Bluetooth + the runtime)
 *
 * Needs a MakeCode toolchain folder (npm i pxt pxt-microbit && npx pxt target microbit):
 *   PXT_DIR=/path/to/toolchain node firmware/build-runtime.mjs
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { separateUniversalHex, createUniversalHex, microbitBoardId } from '@microbit/microbit-universal-hex';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'firmware/bb-runtime');
const PXT_DIR = process.env.PXT_DIR;
if (!PXT_DIR) { console.error('Set PXT_DIR to a MakeCode toolchain folder'); process.exit(1); }

const basePxt = JSON.parse(fs.readFileSync(path.join(src, 'pxt.json'), 'utf8'));
const main = fs.readFileSync(path.join(src, 'main.ts'), 'utf8');

function build(variant) {
  const pxt = JSON.parse(JSON.stringify(basePxt));
  let code = main;
  if (variant === 'v1') {
    delete pxt.dependencies.bluetooth;
    delete pxt.yotta;
    pxt.disablesVariants = ['mbcodal'];
    code = code.split('\n').filter((l) => !/\/\/ @(ble|full|v2)\b/.test(l)).join('\n');
  } else {
    pxt.disablesVariants = ['mbdal'];
    code = code.split('\n').filter((l) => !l.includes('// @v1')).join('\n');
  }
  fs.writeFileSync(path.join(PXT_DIR, 'pxt.json'), JSON.stringify(pxt, null, 2));
  fs.writeFileSync(path.join(PXT_DIR, 'main.ts'), code);
  fs.rmSync(path.join(PXT_DIR, 'built'), { recursive: true, force: true });
  console.log('=== building', variant);
  execSync('npx pxt install && npx pxt build', { cwd: PXT_DIR, stdio: 'inherit' });
  const hex = fs.readFileSync(path.join(PXT_DIR, 'built/binary.hex'), 'utf8');
  const want = variant === 'v1' ? microbitBoardId.V1 : microbitBoardId.V2;
  const part = separateUniversalHex(hex).find((p) => p.boardId === want);
  if (!part) throw new Error(`No ${variant} image in build`);
  return part.hex;
}

const v2 = build('v2');
const v1 = build('v1');
const out = createUniversalHex([{ hex: v1, boardId: microbitBoardId.V1 }, { hex: v2, boardId: microbitBoardId.V2 }]);
fs.writeFileSync(path.join(root, 'public/bytebuddies-runtime.hex'), out);
console.log('wrote public/bytebuddies-runtime.hex', (out.length / 1024).toFixed(0), 'KB');
