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
import { DualModeFlashManager, getDualModeFlashManager } from './dualModeFlashManager.js';

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
      selectedUsbId = null,
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
        const dual = getDualModeFlashManager();
        return dual.flash(hexString, {
          method: 'webusb',
          board: webUsbBoard,
          filename,
          onProgress,
          webUsbDevice,
          selectedUsbId,
          beforeUsbFlash: options.beforeUsbFlash,
        });
      }

      if (method === 'ble') {
        if (bleDevice) {
          const bf = new BLEFlasher(onProgress);
          return bf.flash(hexString, bleDevice);
        }
        return requestAndBLEFlash(hexString, onProgress);
      }

      if (method === 'auto' || method === 'dual-auto') {
        const dual = getDualModeFlashManager();
        return dual.flash(hexString, {
          method: 'dual-auto',
          board: webUsbBoard,
          filename,
          onProgress,
          webUsbDevice,
          bleDevice,
          selectedUsbId,
          beforeUsbFlash: options.beforeUsbFlash,
        });
      }

      throw new Error(`Unknown flash method: ${method}`);
    });
  }

  /** Flash without coordinator queue (use from UI click handlers). */
  async flashDirect(hexString, options = {}) {
    const info = getHexInfo(hexString);
    if (!info.valid) {
      throw new Error(`Invalid Intel HEX: ${info.errors.slice(0, 3).join('; ')}`);
    }
    const dual = getDualModeFlashManager();
    const method = options.method || 'dual-auto';
    return dual.flash(hexString, {
      method: method === 'auto' ? 'dual-auto' : method,
      board: options.webUsbBoard || 'v2',
      filename: options.filename || 'program.hex',
      onProgress: options.onProgress || (() => {}),
      webUsbDevice: options.webUsbDevice,
      bleDevice: options.bleDevice,
      selectedUsbId: options.selectedUsbId,
      beforeUsbFlash: options.beforeUsbFlash,
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
export * from './dualModeFlashManager.js';
export * from './pairedDevices.js';
export * from './flashMicrobit.js';
export * from './embedMicroPython.js';
export * from './msdBrowserFlash.js';
export * from './bleConnect.js';
export * from './bleUart.js';
export * from './buildBleBridgeHex.js';
export * from './microbitWebBle.js';

export default {
  MicrobitFlashCoordinator,
  getMicrobitFlashCoordinator,
  downloadHexFile,
  FlashingManager,
  getFlashingManager,
  DeviceManager,
  getDeviceManager,
  DualModeFlashManager,
  getDualModeFlashManager,
};
