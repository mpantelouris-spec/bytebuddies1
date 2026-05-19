/**
 * Re-exports and helpers — core implementation in bleUart.js.
 */
import {
  BleNotifyReader,
  MicrobitBleUart,
  NUS_B5A3,
  NUS_B5B3,
  requestMicrobitBleDevice,
  BLE_OPTIONAL_SERVICES,
  crc32,
  rssiToBars,
  formatSignalBars,
} from './bleUart.js';
import { BLE_UUIDS } from './microbitDetector.js';

export {
  BleNotifyReader,
  MicrobitBleUart,
  NUS_B5A3,
  NUS_B5B3,
  requestMicrobitBleDevice,
  crc32,
  rssiToBars,
  formatSignalBars,
};

export const BLE_NUS_VARIANTS = [
  { service: NUS_B5B3.service, write: NUS_B5B3.rx, notify: NUS_B5B3.tx },
  { service: NUS_B5A3.service, write: NUS_B5A3.rx, notify: NUS_B5A3.tx },
];

export const BLE_NUS_ALL_SERVICES = [
  ...BLE_NUS_VARIANTS.map((v) => v.service),
  BLE_UUIDS.PARTIAL_FLASH_SERVICE,
  BLE_UUIDS.DFU_SERVICE,
];

export function matchBleNusVariant(serviceUuid) {
  const u = String(serviceUuid || '').toLowerCase();
  if (u.includes('6e400001-b5b3')) return BLE_NUS_VARIANTS[1];
  if (u.includes('6e400001-b5a3')) return BLE_NUS_VARIANTS[0];
  return null;
}

export function pickNusCharacteristics(allChars, variant) {
  const norm = (id) => String(id || '').toLowerCase().replace(/-/g, '');
  const writeUuid = norm(variant.write);
  const notifyUuid = norm(variant.notify);
  const writeChar =
    allChars.find((c) => norm(c.uuid) === writeUuid) ||
    allChars.find((c) => norm(c.uuid).includes('6e400002'));
  const notifyChar =
    allChars.find((c) => norm(c.uuid) === notifyUuid) ||
    allChars.find((c) => norm(c.uuid).includes('6e400003'));
  return { writeChar, notifyChar };
}

/** @deprecated Prefer MicrobitBleUart.connect() */
export async function connectMicrobitBleNus(device, log = () => {}) {
  const uart = new MicrobitBleUart(log);
  await uart.connect(device);
  return {
    server: device.gatt,
    writeChar: uart.rxChar,
    notifyChar: uart.txChar,
    nusVariant: uart.variant,
  };
}

export async function bleWriteChunked(writeChar, data) {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  for (let i = 0; i < bytes.length; i += 20) {
    const chunk = bytes.slice(i, i + 20);
    try {
      if (writeChar.properties.writeWithoutResponse) {
        await writeChar.writeValueWithoutResponse(chunk);
      } else {
        await writeChar.writeValue(chunk);
      }
    } catch {
      await writeChar.writeValue(chunk);
    }
    if (i + 20 < bytes.length) await new Promise((r) => setTimeout(r, 25));
  }
}

export async function blePing(writeChar, notifyChar, onNotify, timeoutMs = 8000) {
  const uart = new MicrobitBleUart();
  uart.rxChar = writeChar;
  uart.txChar = notifyChar;
  uart.reader = new BleNotifyReader(notifyChar);
  const off = onNotify ? uart.onNotify(onNotify) : null;
  try {
    return await uart.writeWithAck('ping()\x04', timeoutMs);
  } finally {
    off?.();
    uart.reader.dispose();
  }
}
