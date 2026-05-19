/**
 * Wireless firmware for micro:bit V2.
 *
 * Default: prebuilt MakeCode Cutebot BLE bridge (fw/bk/lt/rt over Bluetooth UART).
 * Built via `npm run build:makecode-ble` from ble_compile/main.ts — no sad face.
 *
 * Do NOT embed MicroPython `from bluetooth import BLE` into micropython-v2.hex
 * (crashes on boot). For full Python-over-BLE use python.microbit.org instead.
 */
import { buildMicroPythonFirmwareHex } from './embedMicroPython.js';

const CUTEBOT_BLE_HEX = '/microbit-v2-cutebot-ble.hex';
const CODAL_BLE_HEX = '/microbit-v2-bluetooth-base.hex';
const PY_EDITOR_FILE = '/bytebuddies_cutebot_bluetooth.py';

export async function loadHexFile(url, label, onStatus) {
  onStatus?.(`Loading ${label}…`);
  const bust = Date.now();
  const res = await fetch(`${url}?v=${bust}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Missing ${url} — run npm run build`);
  const hex = await res.text();
  if (!hex.startsWith(':')) throw new Error(`Invalid hex: ${url}`);
  return hex;
}

/** MakeCode Cutebot bridge — flash once, then Connect Bluetooth + ▶ Run. */
export async function loadCutebotBluetoothHex(onStatus) {
  const hex = await loadHexFile(CUTEBOT_BLE_HEX, 'Cutebot Bluetooth firmware', onStatus);
  return { hex, board: 'v2', prebuilt: true, source: 'makecode-cutebot-ble' };
}

/** Generic MakeCode Bluetooth UART (no motor commands). */
export async function loadCodalBluetoothHex(onStatus) {
  const hex = await loadHexFile(CODAL_BLE_HEX, 'Bluetooth UART firmware', onStatus);
  return { hex, board: 'v2', prebuilt: true, source: 'codal-bluetooth-uart' };
}

/**
 * Optional: build MicroPython+Cutebot hex (only reliable when flashed from python.microbit.org).
 */
export async function buildMicroPythonBleHex(board = 'v2', onStatus) {
  const hw = board === 'v1' ? 'v1' : 'v2';
  onStatus?.('Loading Python Bluetooth source…');
  const bust = Date.now();
  const res = await fetch(`${PY_EDITOR_FILE}?v=${bust}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Could not load Bluetooth Python source');
  const mainPy = (await res.text()).replace(/^\uFEFF/, '');
  onStatus?.('Building hex (use python.microbit.org if board shows sad face)…');
  const built = await buildMicroPythonFirmwareHex(mainPy, hw);
  return { ...built, board: hw, prebuilt: false, source: PY_EDITOR_FILE };
}

/** Default wireless flash — Cutebot MakeCode BLE (reliable, shows B on LED). */
export async function buildBleBridgeHex(board = 'v2', onStatus) {
  if (board !== 'v1') {
    try {
      return await loadCutebotBluetoothHex(onStatus);
    } catch {
      onStatus?.('Cutebot hex missing — using generic Bluetooth UART…');
      return loadCodalBluetoothHex(onStatus);
    }
  }
  return buildMicroPythonBleHex('v1', onStatus);
}

export async function loadBleBridgeHex(board = 'v2', onStatus) {
  return buildBleBridgeHex(board, onStatus);
}

export const WIRELESS_FLASH_HELP = {
  cutebot: 'Flashes MakeCode Cutebot Bluetooth. LED shows B when ready. Flash once, then code over Bluetooth.',
  codal: 'Generic Bluetooth UART only — use Cutebot hex for robot blocks.',
  pythonEditor:
    'Full Python over Bluetooth: python.microbit.org/v/3 → load bytebuddies_cutebot_bluetooth.py → Download → drag to MICROBIT.',
  pythonEditorUrl: 'https://python.microbit.org/v/3',
  pythonFile: PY_EDITOR_FILE,
};

export default {
  buildBleBridgeHex,
  loadBleBridgeHex,
  loadCutebotBluetoothHex,
  loadCodalBluetoothHex,
  buildMicroPythonBleHex,
  WIRELESS_FLASH_HELP,
};
