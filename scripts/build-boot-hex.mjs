/**
 * Pre-build MicroPython + blinking heart/happy boot test for V1 and V2.
 * Run: node scripts/build-boot-hex.mjs (also via npm run build)
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MicropythonFsHex, microbitBoardId } from '@microbit/microbit-fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pub = (...p) => path.join(__dirname, '..', 'public', ...p);

const BOOT_MAIN_PY = `from microbit import *
while True:
    display.show(Image.HEART)
    sleep(400)
    display.show(Image.HAPPY)
    sleep(400)
`;

for (const [ver, runtimeFile, boardId] of [
  ['v1', 'micropython-v1.hex', microbitBoardId.V1],
  ['v2', 'micropython-v2.hex', microbitBoardId.V2],
]) {
  const hex = fs.readFileSync(pub(runtimeFile), 'utf8');
  const mpfs = new MicropythonFsHex([{ hex, boardId }]);
  mpfs.write('main.py', BOOT_MAIN_PY);
  const out = mpfs.getIntelHex(boardId);
  const outPath = pub(`micropython-${ver}-boot.hex`);
  fs.writeFileSync(outPath, out);
  console.log('Wrote', path.basename(outPath), `(${(out.length / 1024).toFixed(0)} KB)`);
}
