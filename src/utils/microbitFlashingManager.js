/**
 * Unified BBC micro:bit Flashing Manager
 * Orchestrates WebUSB, BLE, and drag-and-drop flashing
 * Provides a single API similar to MakeCode's flashing system
 */

import { sanitizeHexForWebUSB, getHexInfo } from './hexUtils.js';
import { WebUSBFlasher, requestAndFlash } from './webusbFlash.js';
import { BLEFlasher, requestAndBLEFlash } from './bleFlash.js';
import {
  checkBrowserSupport,
  requestWebUSBDevice,
  requestBluetoothDevice,
  monitorWebUSBDevices,
  getDeviceInfo,
} from './microbitDetector.js';

/**
 * Main flashing manager class
 */
export class MicrobitFlashingManager {
  constructor() {
    this.webusb = null;
    this.ble = null;
    this.currentDevice = null;
    this.support = checkBrowserSupport();
    this.listeners = new Map();
    this._setupMonitoring();
  }

  /**
   * Flash firmware using best available method
   * Tries WebUSB first, falls back to BLE or download
   */
  async flash(hexString, options = {}) {
    const {
      method = 'auto',           // 'auto', 'webusb', 'ble', or 'download'
      device = null,             // Pre-selected device
      onProgress = null,
      onError = null,
    } = options;

    try {
      // Validate hex
      const hexInfo = getHexInfo(hexString);
      if (!hexInfo.valid) {
        throw new Error(`Invalid hex file: ${hexInfo.errors.join(', ')}`);
      }

      // Choose flashing method
      if (method === 'auto') {
        return await this._flashAuto(hexString, { onProgress, onError });
      } else if (method === 'webusb') {
        return await this._flashWebUSB(hexString, device, onProgress);
      } else if (method === 'ble') {
        return await this._flashBLE(hexString, device, onProgress);
      } else if (method === 'download') {
        return await this._flashDownload(hexString);
      } else {
        throw new Error(`Unknown flash method: ${method}`);
      }

    } catch (error) {
      onError?.(error);
      throw error;
    }
  }

  /**
   * Auto-select best flashing method
   */
  async _flashAuto(hexString, { onProgress, onError }) {
    // Try WebUSB first (fastest)
    if (this.support.webusb) {
      try {
        return await this._flashWebUSB(hexString, null, onProgress);
      } catch (error) {
        console.warn('WebUSB flash failed, trying BLE...', error);
        onProgress?.({
          percent: 0,
          message: 'WebUSB unavailable, trying Bluetooth...',
        });

        // Fall back to BLE
        if (this.support.bluetooth) {
          try {
            return await this._flashBLE(hexString, null, onProgress);
          } catch (bleError) {
            console.warn('BLE flash failed too', bleError);
            // Fall back to download
            return await this._flashDownload(hexString);
          }
        }
      }
    }

    // If no WebUSB, try BLE
    if (this.support.bluetooth) {
      try {
        return await this._flashBLE(hexString, null, onProgress);
      } catch (error) {
        console.warn('BLE flash failed', error);
        return await this._flashDownload(hexString);
      }
    }

    // Fall back to download
    return await this._flashDownload(hexString);
  }

  /**
   * Flash via WebUSB
   */
  async _flashWebUSB(hexString, device, onProgress) {
    if (!this.support.webusb) {
      throw new Error('WebUSB not supported in this browser');
    }

    // Request device if not provided
    if (!device) {
      device = await requestWebUSBDevice();
    }

    // Sanitize hex for WebUSB
    const cleanHex = sanitizeHexForWebUSB(hexString);

    // Create flasher and start
    const flasher = new WebUSBFlasher(onProgress);
    return flasher.flash(cleanHex, device.device || device);
  }

  /**
   * Flash via Bluetooth
   */
  async _flashBLE(hexString, device, onProgress) {
    if (!this.support.bluetooth) {
      throw new Error('Web Bluetooth not supported in this browser');
    }

    // Request device if not provided
    if (!device) {
      device = await requestBluetoothDevice();
    }

    // Create flasher and start
    const flasher = new BLEFlasher(onProgress);
    return flasher.flash(hexString, device.device || device);
  }

  /**
   * Download hex file (manual flashing)
   */
  async _flashDownload(hexString) {
    return new Promise((resolve, reject) => {
      try {
        const blob = new Blob([hexString], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bytebuddies.hex';

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);

        resolve({
          success: true,
          message:
            'Hex file downloaded. Drag it to your MICROBIT drive to flash.',
          method: 'download',
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Get available devices
   */
  async getAvailableDevices() {
    const devices = [];

    // Get WebUSB devices
    if (this.support.webusb) {
      try {
        const { listWebUSBDevices } = await import('./microbitDetector.js');
        const webusb = await listWebUSBDevices();
        devices.push(...webusb);
      } catch (error) {
        console.error('Error getting WebUSB devices:', error);
      }
    }

    return devices;
  }

  /**
   * Set up device monitoring
   */
  _setupMonitoring() {
    if (this.support.webusb) {
      const cleanup = monitorWebUSBDevices(
        (device) => this._emit('device-connected', device),
        (device) => this._emit('device-disconnected', device)
      );

      // Store cleanup function
      if (!this._cleanups) this._cleanups = [];
      this._cleanups.push(cleanup);
    }
  }

  /**
   * Event listener support
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Emit event
   */
  _emit(event, data) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(cb => cb(data));
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this._cleanups) {
      this._cleanups.forEach(fn => fn());
    }
    this.listeners.clear();
  }
}

/**
 * Singleton instance
 */
let instance = null;

export function getMicrobitFlashingManager() {
  if (!instance) {
    instance = new MicrobitFlashingManager();
  }
  return instance;
}

/**
 * Quick API for common use cases
 */
export const quickFlash = {
  /**
   * Flash with automatic method selection
   */
  auto: async (hexString, onProgress) => {
    const manager = getMicrobitFlashingManager();
    return manager.flash(hexString, {
      method: 'auto',
      onProgress,
    });
  },

  /**
   * Flash via WebUSB only
   */
  webusb: async (hexString, onProgress) => {
    const manager = getMicrobitFlashingManager();
    return manager.flash(hexString, {
      method: 'webusb',
      onProgress,
    });
  },

  /**
   * Flash via Bluetooth only
   */
  ble: async (hexString, onProgress) => {
    const manager = getMicrobitFlashingManager();
    return manager.flash(hexString, {
      method: 'ble',
      onProgress,
    });
  },

  /**
   * Download for manual flashing
   */
  download: async (hexString) => {
    const manager = getMicrobitFlashingManager();
    return manager.flash(hexString, {
      method: 'download',
    });
  },

  /**
   * Get browser support info
   */
  support: () => checkBrowserSupport(),

  /**
   * Get available devices
   */
  devices: async () => {
    const manager = getMicrobitFlashingManager();
    return manager.getAvailableDevices();
  },
};

export default {
  MicrobitFlashingManager,
  getMicrobitFlashingManager,
  quickFlash,
};
