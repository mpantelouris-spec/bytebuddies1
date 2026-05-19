/**
 * BLE wireless flashing — micro:bit V2 Partial Flashing Service
 * (MakeCode-style hex with embedded magic). MicroPython universal hex
 * must use WebUSB or USB MSD copy instead.
 *
 * For reliable BLE updates, put the micro:bit in Bluetooth pairing mode
 * (hold A+B, tap reset, release reset) so the link is not running user code.
 */

import {
  canPartialFlashOverBle,
  extractMakeCodePartialHashes,
  extractPartialFlashPayload,
} from './hexUtils.js';
import { BLE_UUIDS } from './microbitDetector.js';

const CMD_REGION = 0x00;
const CMD_WRITE = 0x01;
const CMD_EOT = 0x02;
const CMD_STATUS = 0xee;
const CMD_RESET = 0xff;

const NOTIFY_READ = 0x00;
const NOTIFY_WRITE = 0x01;
const NOTIFY_WRITE_OK = 0xff;
const NOTIFY_WRITE_OOO = 0xaa;

const REGION_DAL = 0x01;

class BleNotifyReader {
  constructor(char) {
    this.char = char;
    this._q = [];
    this._waiters = [];
    this._handler = this._onNotify.bind(this);
    char.addEventListener('characteristicvaluechanged', this._handler);
  }

  _onNotify(ev) {
    const v = new Uint8Array(ev.target.value.buffer);
    if (this._waiters.length) {
      const w = this._waiters.shift();
      clearTimeout(w.timer);
      w.resolve(v);
    } else {
      this._q.push(v);
    }
  }

  async read(timeoutMs = 10000) {
    if (this._q.length) return this._q.shift();
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        const idx = this._waiters.findIndex(w => w.resolve === resolve);
        if (idx >= 0) this._waiters.splice(idx, 1);
        reject(new Error('BLE notification timeout'));
      }, timeoutMs);
      this._waiters.push({ resolve, reject, timer });
    });
  }

  dispose() {
    this.char.removeEventListener('characteristicvaluechanged', this._handler);
    for (const w of this._waiters) clearTimeout(w.timer);
    this._waiters.length = 0;
  }
}

export class BLEFlasher {
  constructor(onProgress) {
    this.onProgress = onProgress;
  }

  _report(percent, message, stage = 'flashing') {
    this.onProgress?.({ percent: Math.min(100, Math.max(0, percent)), message, stage });
  }

  /**
   * @param {string} hexString
   * @param {BluetoothDevice} device from requestDevice
   */
  async flash(hexString, device) {
    if (!navigator.bluetooth) throw new Error('Web Bluetooth not available');
    if (!canPartialFlashOverBle(hexString)) {
      throw new Error(
        'This HEX file cannot be updated over Bluetooth. ' +
          'Use WebUSB or copy to the MICROBIT drive for MicroPython / universal hex. ' +
          'BLE partial flashing only works with MakeCode-style programs that include the MakeCode metadata block.'
      );
    }

    const hashes = extractMakeCodePartialHashes(hexString);
    const payloadInfo = extractPartialFlashPayload(hexString);
    if (!hashes || !payloadInfo) {
      throw new Error('Could not parse MakeCode partial-flash metadata from HEX file.');
    }

    this._report(5, 'Connecting to micro:bit (BLE)…', 'connecting');
    let server = await device.gatt.connect();
    this._report(15, 'Opening Partial Flashing service…', 'connecting');

    let service = await server.getPrimaryService(BLE_UUIDS.PARTIAL_FLASH_SERVICE);
    let char = await service.getCharacteristic(BLE_UUIDS.PARTIAL_FLASH_CHAR);
    await char.startNotifications();
    let reader = new BleNotifyReader(char);

    try {
      this._report(25, 'Verifying DAL hash…', 'verifying');
      await char.writeValueWithoutResponse(new Uint8Array([CMD_REGION, REGION_DAL]));
      let regionReply = await reader.read(10000);
      if (regionReply[0] !== NOTIFY_READ || regionReply.length < 18) {
        throw new Error('Unexpected BLE response while reading memory map');
      }
      const deviceDalHash = regionReply.slice(10, 18);
      for (let i = 0; i < 8; i++) {
        if (deviceDalHash[i] !== hashes.templateHash[i]) {
          throw new Error(
            'DAL hash mismatch — firmware on the micro:bit does not match this HEX. ' +
              'Do one full USB flash (WebUSB or MICROBIT drive), then retry BLE.'
          );
        }
      }

      this._report(35, 'Checking micro:bit mode…', 'verifying');
      await char.writeValueWithoutResponse(new Uint8Array([CMD_STATUS]));
      const status = await reader.read(6000).catch(() => null);
      if (status && status[0] === CMD_STATUS && status[2] === 0x01) {
        this._report(38, 'Entering pairing mode for safe flash…', 'connecting');
        await char.writeValueWithoutResponse(new Uint8Array([CMD_RESET, 0x00]));
        reader.dispose();
        reader = null;
        await new Promise(r => setTimeout(r, 2500));
        try {
          server.disconnect();
        } catch {
          /* */
        }
        await new Promise(r => setTimeout(r, 500));
        server = await device.gatt.connect();
        service = await server.getPrimaryService(BLE_UUIDS.PARTIAL_FLASH_SERVICE);
        char = await service.getCharacteristic(BLE_UUIDS.PARTIAL_FLASH_CHAR);
        await char.startNotifications();
        reader = new BleNotifyReader(char);
        await char.writeValueWithoutResponse(new Uint8Array([CMD_REGION, REGION_DAL]));
        regionReply = await reader.read(10000);
        if (regionReply[0] !== NOTIFY_READ) throw new Error('BLE reconnect failed');
      }

      const { payload, magicAddr } = payloadInfo;
      const total = payload.length;
      if (total === 0) throw new Error('Nothing to transfer (empty partial payload).');

      let globalPkt = 0;
      for (let offset = 0; offset < total; offset += 16) {
        const chunk = payload.subarray(offset, Math.min(offset + 16, total));
        const flashAddr = magicAddr + offset;
        const pktBuf = new Uint8Array(20).fill(0xff);
        pktBuf[0] = CMD_WRITE;
        pktBuf[1] = flashAddr & 0xff;
        pktBuf[2] = (flashAddr >> 8) & 0xff;
        pktBuf[3] = globalPkt & 0xff;
        pktBuf.set(chunk, 4);

        await char.writeValueWithoutResponse(pktBuf);
        globalPkt++;

        if (globalPkt % 4 === 0) {
          const note = await reader.read(15000);
          if (note[0] !== NOTIFY_WRITE) {
            throw new Error('Unexpected BLE write acknowledgement');
          }
          if (note[1] === NOTIFY_WRITE_OOO) {
            throw new Error(
              'BLE packet out-of-order. Move closer to the micro:bit, use pairing mode, or flash over USB.'
            );
          }
          if (note[1] !== NOTIFY_WRITE_OK) {
            throw new Error(`BLE flash rejected (code ${note[1]})`);
          }
        }

        const pct = 50 + Math.floor(((offset + 16) / total) * 45);
        this._report(Math.min(95, pct), `BLE transfer ${Math.min(100, Math.round(((offset + 16) / total) * 100))}%`, 'flashing');
      }

      this._report(96, 'Sending end-of-transmission…', 'finalizing');
      await char.writeValueWithoutResponse(new Uint8Array([CMD_EOT]));
      await new Promise(r => setTimeout(r, 2000));
      this._report(100, 'BLE partial flash complete.', 'completed');

      try {
        server.disconnect();
      } catch {
        /* */
      }
      return { success: true, method: 'ble-partial' };
    } finally {
      reader?.dispose();
    }
  }
}

export async function requestAndBLEFlash(hexString, onProgress) {
  if (!navigator.bluetooth) throw new Error('Web Bluetooth not supported');
  const device = await navigator.bluetooth.requestDevice({
    filters: [
      { namePrefix: 'BBC micro:bit' },
      { namePrefix: 'BBC' },
      { name: 'ByteBuddies' },
      { namePrefix: 'microbit' },
    ],
    optionalServices: [BLE_UUIDS.PARTIAL_FLASH_SERVICE, BLE_UUIDS.NUS, BLE_UUIDS.DFU_SERVICE],
  });
  const flasher = new BLEFlasher(onProgress);
  return flasher.flash(hexString, device);
}

export async function quickBLEFlash(hexString, device, onProgress) {
  const flasher = new BLEFlasher(onProgress);
  return flasher.flash(hexString, device);
}

export default { BLEFlasher, requestAndBLEFlash, quickBLEFlash };
