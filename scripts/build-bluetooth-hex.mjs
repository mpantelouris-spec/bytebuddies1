/**
 * Build Bluetooth-ready universal hex files by embedding main.py into the
 * official MicroPython v1+v2 runtimes.
 *
 * Outputs:
 * - public/microbit-bluetooth-general.hex (general BLE bridge for all kits)
 * - public/microbit-v2-bluetooth-general.hex (v2-only build, closer to typical V2 .hex size)
 * - public/bytebuddies_ble.hex           (backward-compatible filename)
 * - public/microbit-bluetooth-working.hex (Cutebot-tuned firmware)
 * - public/microbit-v2-bluetooth-working.hex (Cutebot-tuned v2-only build)
 * - public/microbit-v2-bluetooth-base.hex (optional: prebuilt MakeCode-style V2 bridge)
 *
 * Run: npm run build:ble-hex
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const pub = (...p) => path.join(root, 'public', ...p);

const { MicropythonFsHex, microbitBoardId } = await import('@microbit/microbit-fs');

const hexV1 = fs.readFileSync(pub('micropython-v1.hex'), 'utf8');
const hexV2 = fs.readFileSync(pub('micropython-v2.hex'), 'utf8');
function buildHexFromPy(pyFilename) {
  const py = fs.readFileSync(pub(pyFilename), 'utf8');
  const mpfs = new MicropythonFsHex([
    { hex: hexV1, boardId: microbitBoardId.V1 },
    { hex: hexV2, boardId: microbitBoardId.V2 },
  ]);
  mpfs.write('main.py', py);
  return mpfs.getUniversalHex();
}

function buildV2HexFromPy(pyFilename) {
  const py = fs.readFileSync(pub(pyFilename), 'utf8');
  const mpfs = new MicropythonFsHex([
    { hex: hexV2, boardId: microbitBoardId.V2 },
  ]);
  mpfs.write('main.py', py);
  return mpfs.getIntelHex(microbitBoardId.V2);
}

function writeHex(outFilename, hexText) {
  const outPath = pub(outFilename);
  fs.writeFileSync(outPath, hexText, 'utf8');
  console.log('Wrote', path.relative(root, outPath), `(${(hexText.length / 1024).toFixed(0)} KB text)`);
}

const generalHex = buildHexFromPy('bytebuddies_ble.py');
writeHex('microbit-bluetooth-general.hex', generalHex);
writeHex('bytebuddies_ble.hex', generalHex); // keep older filename working

const cutebotHex = buildHexFromPy('bytebuddies_cutebot_bluetooth.py');
writeHex('microbit-bluetooth-working.hex', cutebotHex);

const v2BasePath = pub('microbit-v2-bluetooth-base.hex');
if (fs.existsSync(v2BasePath)) {
  const v2BaseHex = fs.readFileSync(v2BasePath, 'utf8');
  writeHex('microbit-v2-bluetooth-general.hex', v2BaseHex);
  writeHex('microbit-v2-bluetooth-working.hex', v2BaseHex);
} else {
  writeHex('microbit-v2-bluetooth-general.hex', buildV2HexFromPy('bytebuddies_ble.py'));
  writeHex('microbit-v2-bluetooth-working.hex', buildV2HexFromPy('bytebuddies_cutebot_bluetooth.py'));
}
