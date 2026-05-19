/**
 * Unified micro:bit flashing — USB MSD (Electron), WebUSB, BLE partial, download fallback.
 * Now includes enhanced device management and automatic reconnection.
 */

import { ProgressManager } from './progressManager.js';
import { getHexInfo } from './hexUtils.js';
import {
  checkBrowserSupport,
  isElectronNative,
  listNativeUsbDrives,
} from './microbitDetector.js';
import { WebUSBFlasher, requestWebUSBMicrobit } from './webusbFlash.js';
import { BLEFlasher, requestAndBLEFlash } from './bleFlash.js';
import { FlashingManager, getFlashingManager } from './flashingManager.js';
import { DeviceManager, getDeviceManager } from './deviceManager.js';

export function downloadHexFile(hexString, filename = 'program.hex') {
  const blob = new Blob([hexString], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return { success: true, method: 'download', filename };
}

export class MicrobitFlashCoordinator {
  constructor() {
    this.queue = new ProgressManager();
    this.support = typeof navigator !== 'undefined' ? checkBrowserSupport() : {};
  }

  /**
   * @param {string} hexString
   * @param {object} options
   * @param {'auto'|'electron-usb'|'webusb'|'ble'|'download'} options.method
   * @param {USBDevice} [options.webUsbDevice] pre-authorized device (optional)
   * @param {BluetoothDevice} [options.bleDevice]
   * @param {string} [options.filename]
   * @param {(e:{percent:number,message:string,stage?:string})=>void} [options.onProgress]
   * @param {'v1'|'v2'} [options.webUsbBoard] board slice for WebUSB when hex is universal (default v2)
   */
  async flash(hexString, options = {}) {
    const {
      method = 'auto',
      webUsbDevice = null,
      bleDevice = null,
      filename = 'program.hex',
      onProgress = () => {},
      webUsbBoard = 'v2',
    } = options;

    const info = getHexInfo(hexString);
    if (!info.valid) {
      throw new Error(`Invalid Intel HEX: ${info.errors.join('; ')}`);
    }

    return this.queue.enqueue(async () => {
      if (method === 'download') {
        onProgress({ percent: 100, message: 'Download started', stage: 'completed' });
        return downloadHexFile(hexString, filename);
      }

      if (method === 'electron-usb') {
        return this._flashElectronUsb(hexString, onProgress);
      }

      if (method === 'webusb') {
        const device = webUsbDevice || (await requestWebUSBMicrobit());
        const flasher = new WebUSBFlasher(onProgress);
        return flasher.flash(hexString, device, { webUsbBoard });
      }

      if (method === 'ble') {
        if (bleDevice) {
          const bf = new BLEFlasher(onProgress);
          return bf.flash(hexString, bleDevice);
        }
        return requestAndBLEFlash(hexString, onProgress);
      }

      if (method === 'auto') {
        if (isElectronNative()) {
          try {
            const drives = await listNativeUsbDrives();
            if (drives?.length) {
              onProgress({ percent: 5, message: 'MICROBIT drive detected — copying hex…', stage: 'preparing' });
              return await this._flashElectronUsb(hexString, onProgress);
            }
          } catch {
            /* fall through */
          }
        }
        if (typeof navigator !== 'undefined' && navigator.usb) {
          try {
            onProgress({ percent: 2, message: 'Select your micro:bit (WebUSB)…', stage: 'connecting' });
            const device = await requestWebUSBMicrobit();
            const flasher = new WebUSBFlasher(onProgress);
            return await flasher.flash(hexString, device, { webUsbBoard });
          } catch (e) {
            if (e.name === 'NotFoundError') {
              onProgress({ percent: 50, message: 'WebUSB cancelled — downloading hex instead.', stage: 'preparing' });
              return downloadHexFile(hexString, filename);
            }
            const msg = e?.message || String(e);
            const recoverable =
              msg.includes('Flash error') ||
              msg.includes('DAPLink refused') ||
              msg.includes('NetworkError') ||
              msg.includes('disconnect');
            if (recoverable) {
              onProgress({
                percent: 55,
                message: `${msg.slice(0, 120)} — downloading .hex so you can use the MICROBIT drive.`,
                stage: 'preparing',
              });
              return downloadHexFile(hexString, filename);
            }
            onProgress({ percent: 40, message: `${msg} — trying download fallback.`, stage: 'preparing' });
            return downloadHexFile(hexString, filename);
          }
        }
        onProgress({ percent: 80, message: 'WebUSB unavailable — downloading hex.', stage: 'preparing' });
        return downloadHexFile(hexString, filename);
      }

      throw new Error(`Unknown flash method: ${method}`);
    });
  }

  async _flashElectronUsb(hexString, onProgress) {
    if (!isElectronNative()) {
      throw new Error('USB drive flashing requires the ByteBuddies desktop app (Electron).');
    }
    const api = window.bytebuddiesNative.microbit;
    let off = () => {};
    if (typeof api.onFlashProgress === 'function') {
      off = api.onFlashProgress((p) => onProgress({ ...p, stage: p.stage || 'flashing' }));
    }
    try {
      return await api.flashUsb(hexString);
    } finally {
      off();
    }
  }
}

let _singleton;
export function getMicrobitFlashCoordinator() {
  if (!_singleton) _singleton = new MicrobitFlashCoordinator();
  return _singleton;
}

export { ProgressManager } from './progressManager.js';
export * from './hexUtils.js';
export * from './microbitDetector.js';
export * from './webusbFlash.js';
export * from './bleFlash.js';
export * from './daplinkManager.js';
export * from './deviceManager.js';
export * from './flashingManager.js';

export default {
  MicrobitFlashCoordinator,
  getMicrobitFlashCoordinator,
  downloadHexFile,
  FlashingManager,
  getFlashingManager,
  DeviceManager,
  getDeviceManager,
};
