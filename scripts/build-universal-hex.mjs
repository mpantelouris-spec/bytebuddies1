#!/usr/bin/env node
/**
 * Build the universal MicroPython hex once at build time
 * This is more reliable than building it dynamically in the browser
 */

import fs from 'fs';
import path from 'path';
import { MicropythonFsHex, microbitBoardId } from '@microbit/microbit-fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

async function buildUniversalHex() {
  console.log('=== Building Universal MicroPython Hex ===\n');

  const hexV1Path = path.join(projectRoot, 'public/micropython-v1.hex');
  const hexV2Path = path.join(projectRoot, 'public/micropython-v2.hex');
  const outputPath = path.join(projectRoot, 'public/micropython-universal.hex');

  // Verify input files exist
  if (!fs.existsSync(hexV1Path)) {
    console.error(`❌ V1 hex not found: ${hexV1Path}`);
    process.exit(1);
  }
  if (!fs.existsSync(hexV2Path)) {
    console.error(`❌ V2 hex not found: ${hexV2Path}`);
    process.exit(1);
  }

  // Skip rebuild if output already exists and is newer than both inputs
  if (fs.existsSync(outputPath)) {
    const outMtime = fs.statSync(outputPath).mtimeMs;
    const v1Mtime  = fs.statSync(hexV1Path).mtimeMs;
    const v2Mtime  = fs.statSync(hexV2Path).mtimeMs;
    if (outMtime > v1Mtime && outMtime > v2Mtime) {
      const sizeKB = (fs.statSync(outputPath).size / 1024).toFixed(1);
      console.log(`✅ Universal hex up-to-date (${sizeKB} KB) — skipping rebuild.\n`);
      return;
    }
  }

  console.log(`📂 Input files:`);
  console.log(`  V1: ${hexV1Path}`);
  console.log(`  V2: ${hexV2Path}`);

  // Load hex files
  const hexV1 = fs.readFileSync(hexV1Path, 'utf8');
  const hexV2 = fs.readFileSync(hexV2Path, 'utf8');

  console.log(`\n📦 Sizes:`);
  console.log(`  V1: ${(hexV1.length / 1024).toFixed(1)} KB`);
  console.log(`  V2: ${(hexV2.length / 1024).toFixed(1)} KB`);

  // Build universal hex WITHOUT any files
  console.log(`\n🔨 Building universal hex (base firmware only)...`);
  const fs_builder = new MicropythonFsHex([
    { hex: hexV1, boardId: microbitBoardId.V1 },
    { hex: hexV2, boardId: microbitBoardId.V2 },
  ]);

  const universalHex = fs_builder.getUniversalHex();

  console.log(`✅ Universal hex generated:`);
  console.log(`  Size: ${(universalHex.length / 1024).toFixed(1)} KB`);
  console.log(`  Lines: ${universalHex.split('\n').length}`);

  // Validate it's the right size
  const sizeKB = universalHex.length / 1024;
  if (sizeKB < 1500 || sizeKB > 2000) {
    console.warn(`⚠️ WARNING: Hex size ${sizeKB.toFixed(1)}KB is outside expected range (1500-2000KB)`);
  }

  // Write output
  console.log(`\n💾 Writing output...`);
  fs.writeFileSync(outputPath, universalHex, 'utf8');
  console.log(`✅ Written to: ${outputPath}`);
  console.log(`\n✅ Build complete!`);

  return { hexV1, hexV2, universalHex };
}

buildUniversalHex().catch(e => {
  console.error('\n❌ Build failed:', e.message);
  process.exit(1);
});
