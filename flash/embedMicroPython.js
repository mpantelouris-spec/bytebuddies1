/**
 * Embed main.py into official MicroPython runtimes (browser-side).
 * Prefer prebuilt /micropython-v*-boot.hex from scripts/build-boot-hex.mjs.
 */
import { MicropythonFsHex, microbitBoardId } from '@microbit/microbit-fs';

/** Blinking heart + smiley — runs forever so the LED is never blank after a good flash. */
export const BYTEBUDDIES_BOOT_MAIN_PY = `from microbit import *
while True:
    display.show(Image.HEART)
    sleep(400)
    display.show(Image.HAPPY)
    sleep(400)
`;

let _runtimeCache = null;

export async function fetchMicroPythonRuntimes() {
  if (_runtimeCache) return _runtimeCache;
  const [hexV1, hexV2] = await Promise.all([
    fetch('/micropython-v1.hex').then((r) => {
      if (!r.ok) throw new Error('Could not load micropython-v1.hex');
      return r.text();
    }),
    fetch('/micropython-v2.hex').then((r) => {
      if (!r.ok) throw new Error('Could not load micropython-v2.hex');
      return r.text();
    }),
  ]);
  _runtimeCache = { hexV1, hexV2 };
  return _runtimeCache;
}

/**
 * Build a single-board Intel HEX (best for WebUSB — no universal split).
 * @param {'v1'|'v2'} board
 */
export async function buildMicroPythonFirmwareHex(mainPy, board = 'v2') {
  const { hexV1, hexV2 } = await fetchMicroPythonRuntimes();
  const isV1 = board === 'v1';
  const runtime = isV1 ? hexV1 : hexV2;
  const boardId = isV1 ? microbitBoardId.V1 : microbitBoardId.V2;
  const fs = new MicropythonFsHex([{ hex: runtime, boardId }]);
  fs.write('main.py', mainPy);
  return { hex: fs.getIntelHex(boardId), board };
}

export async function loadPrebuiltBootHex(board = 'v2') {
  const hw = board === 'v1' ? 'v1' : 'v2';
  const res = await fetch(`/micropython-${hw}-boot.hex`, { cache: 'no-cache' });
  if (!res.ok) return null;
  const hex = await res.text();
  if (!hex.startsWith(':')) return null;
  return hex;
}

/**
 * Prebuilt boot hex when available; otherwise build in-browser.
 */
export async function buildMicroPythonBootHex(board = 'v2') {
  const prebuilt = await loadPrebuiltBootHex(board);
  if (prebuilt) return { hex: prebuilt, board: board === 'v1' ? 'v1' : 'v2', prebuilt: true };
  return { ...(await buildMicroPythonFirmwareHex(BYTEBUDDIES_BOOT_MAIN_PY, board)), prebuilt: false };
}

export function downloadHexForMicrobit(hex, filename = 'bytebuddies-boot.hex') {
  const blob = new Blob([hex], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
