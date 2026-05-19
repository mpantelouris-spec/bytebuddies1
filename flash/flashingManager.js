/**
 * Enhanced flashing manager with reconnect/retry logic, device state tracking.
 * Orchestrates USB MSD, WebUSB, and BLE flashing with automatic fallback.
 */

import { ProgressManager } from './progressManager.js';
import { getHexInfo } from './hexUtils.js';
import { WebUSBFlasher, requestWebUSBMicrobit } from './webusbFlash.js';
import { BLEFlasher, requestAndBLEFlash } from './bleFlash.js';
import { detectMicrobitDrives, flashHexToDrive } from './usbFlash.js';
import { getDeviceManager, DEVICE_STATES, CONNECTION_TYPES } from './deviceManager.js';

const MAX_RETRIES = 3;
const RECONNECT_TIMEOUT_MS = 15000;

export class FlashingManager {
  constructor() {
    this.progressQueue = new ProgressManager();
    this.deviceManager = getDeviceManager();
    this.activeFlash = null;
  }

  /**
   * Flash with automatic method selection and reconnect handling
   * @param {string} hexString Intel HEX firmware
   * @param {object} options
   * @param {'auto'|'usb-msd'|'webusb'|'ble'|'download'} [options.method='auto']
   * @param {string} [options.deviceId] prefer this device
   * @param {(e:{percent:number,message:string,stage?:string})=>void} [options.onProgress]
   * @param {'v1'|'v2'} [options.board='v2'] WebUSB board version
   * @returns {Promise<{success:boolean, method:string, ...metadata}>}
   */
  async flash(hexString, options = {}) {
    const {
      method = 'auto',
      deviceId = null,
      onProgress = () => {},
      board = 'v2',
    } = options;

    const info = getHexInfo(hexString);
    if (!info.valid) {
      throw new Error(`Invalid Intel HEX: ${info.errors.join('; ')}`);
    }

    return this.progressQueue.enqueue(async () => {
      this.activeFlash = { hexString, options };

      try {
        if (method === 'download') {
          return this._flashDownload(hexString, onProgress);
        }

        if (method === 'usb-msd') {
          return await this._flashUsb(hexString, deviceId, onProgress);
        }

        if (method === 'webusb') {
          return await this._flashWebUSB(hexString, deviceId, board, onProgress);
        }

        if (method === 'ble') {
          return await this._flashBLE(hexString, deviceId, onProgress);
        }

        if (method === 'auto') {
          return await this._flashAuto(hexString, deviceId, board, onProgress);
        }

        throw new Error(`Unknown flash method: ${method}`);
      } finally {
        this.activeFlash = null;
      }
    });
  }

  async _flashAuto(hexString, deviceId, board, onProgress) {
    const report = (percent, msg, stage = 'preparing') => {
      onProgress?.({ percent, message: msg, stage });
    };

    const isElectron = typeof window !== 'undefined' && !!window?.bytebuddiesNative?.microbit;

    if (isElectron) {
      try {
        report(2, 'Scanning for MICROBIT drive…', 'preparing');
        const drives = await detectMicrobitDrives();
        if (drives?.length) {
          report(5, `Found MICROBIT drive: ${drives[0].path}`, 'preparing');
          return await this._flashUsb(hexString, drives[0].path, onProgress);
        }
      } catch (e) {
        report(8, `USB drive scan failed: ${e.message}`, 'preparing');
      }
    }

    if (typeof navigator !== 'undefined' && navigator.usb) {
      try {
        report(10, 'Attempting WebUSB flashing…', 'connecting');
        return await this._flashWebUSB(hexString, deviceId, board, onProgress);
      } catch (e) {
        const msg = e?.message || String(e);
        report(50, `WebUSB failed (${msg.slice(0, 80)}), trying download…`, 'preparing');
        return this._flashDownload(hexString, onProgress);
      }
    }

    report(80, 'No USB methods available — downloading hex file.', 'preparing');
    return this._flashDownload(hexString, onProgress);
  }

  async _flashUsb(hexString, devicePath, onProgress) {
    const report = (percent, msg, stage = 'flashing') => {
      onProgress?.({ percent, message: msg, stage });
    };

    if (!typeof window !== 'undefined' || !window?.bytebuddiesNative?.microbit) {
      throw new Error('USB MSD flashing requires Electron desktop app');
    }

    let mountPath = devicePath;
    if (!mountPath) {
      report(5, 'Scanning for MICROBIT drive…', 'preparing');
      const drives = await detectMicrobitDrives();
      if (!drives?.length) {
        throw new Error('No MICROBIT drive found. Plug in the micro:bit via USB.');
      }
      mountPath = drives[0].path;
      report(8, `Found: ${mountPath}`, 'preparing');
    }

    report(10, 'Writing to MICROBIT drive…', 'flashing');
    try {
      const result = await flashHexToDrive(hexString, mountPath, { onProgress: report });
      return result;
    } catch (e) {
      report(90, `USB copy failed: ${e.message}`, 'failed');
      throw e;
    }
  }

  async _flashWebUSB(hexString, deviceId, board, onProgress) {
    const report = (percent, msg, stage = 'flashing') => {
      onProgress?.({ percent, message: msg, stage });
    };

    if (!navigator.usb) {
      throw new Error('WebUSB not available. Use Chrome, Edge, or Opera.');
    }

    report(5, 'Requesting WebUSB device…', 'connecting');
    let device = null;

    if (deviceId) {
      const devices = await navigator.usb.getDevices();
      device = devices.find((d) => d.serialNumber === deviceId);
      if (!device) {
        report(10, 'Selected device not found, requesting…', 'connecting');
        device = await requestWebUSBMicrobit();
      }
    } else {
      device = await requestWebUSBMicrobit();
    }

    report(12, 'Opening device…', 'connecting');
    const flasher = new WebUSBFlasher(onProgress);

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        report(12, `WebUSB flashing (attempt ${attempt}/${MAX_RETRIES})…`, 'connecting');
        return await flasher.flash(hexString, device, { webUsbBoard: board });
      } catch (e) {
        const msg = e?.message || String(e);
        if (attempt < MAX_RETRIES) {
          report(
            12 + attempt * 2,
            `${msg.slice(0, 100)} (retry ${attempt}/${MAX_RETRIES})`,
            'connecting'
          );
          await new Promise((r) => setTimeout(r, 1000 * attempt));
        } else {
          throw e;
        }
      }
    }
  }

  async _flashBLE(hexString, deviceId, onProgress) {
    const report = (percent, msg, stage = 'flashing') => {
      onProgress?.({ percent, message: msg, stage });
    };

    if (!navigator.bluetooth) {
      throw new Error('Web Bluetooth not available. Use Chrome, Edge, or Opera.');
    }

    report(5, 'Requesting Bluetooth device…', 'connecting');
    return requestAndBLEFlash(hexString, onProgress);
  }

  _flashDownload(hexString, onProgress) {
    const blob = new Blob([hexString], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'program.hex';
    document.body.appendChild(a);

    onProgress?.({ percent: 50, message: 'Preparing download…', stage: 'preparing' });

    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    onProgress?.({ percent: 100, message: 'Download started — drag .hex to MICROBIT drive.', stage: 'completed' });
    return { success: true, method: 'download', filename: 'program.hex' };
  }

  isFlashing() {
    return this.activeFlash !== null;
  }

  getFlashProgress() {
    return this.progressQueue.last;
  }
}

let _singleton;
export function getFlashingManager() {
  if (!_singleton) _singleton = new FlashingManager();
  return _singleton;
}

export default {
  FlashingManager,
  getFlashingManager,
};
