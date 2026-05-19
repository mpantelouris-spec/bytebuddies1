/**
 * Unified micro:bit device manager — tracks connected devices, handles reconnects.
 * Supports USB MSD (Electron), WebUSB, and BLE connections.
 */

import { listWebUSBDevices, monitorWebUSBDevices, getAllDetectedDevices } from './microbitDetector.js';
import { detectMicrobitDrives, watchMicrobitVolumes } from './usbFlash.js';

export const DEVICE_STATES = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  FLASHING: 'flashing',
  VERIFYING: 'verifying',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

export const CONNECTION_TYPES = {
  USB_MSD: 'usb-msd',
  WEBUSB: 'webusb',
  BLE: 'ble',
};

export class MicrobitDevice {
  constructor(id, name, type, version = 'Unknown') {
    this.id = id;
    this.name = name;
    this.type = type; // usb-msd, webusb, ble
    this.version = version;
    this.state = DEVICE_STATES.DISCONNECTED;
    this.lastSeen = Date.now();
    this.nativeDevice = null;
    this.errorCount = 0;
    this.metadata = {};
  }

  isHealthy() {
    return this.state === DEVICE_STATES.CONNECTED && this.errorCount < 3;
  }

  recordError() {
    this.errorCount++;
  }

  clearErrors() {
    this.errorCount = 0;
  }

  setState(newState) {
    if (newState === this.state) return;
    const oldState = this.state;
    this.state = newState;
    this.lastSeen = Date.now();
    return { old: oldState, new: newState };
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      version: this.version,
      state: this.state,
      healthy: this.isHealthy(),
      errorCount: this.errorCount,
      lastSeen: this.lastSeen,
    };
  }
}

export class DeviceManager {
  constructor(options = {}) {
    this.devices = new Map(); // id -> MicrobitDevice
    this.listeners = new Set();
    this.scanning = false;
    this.stopWatchers = [];
    this.pollIntervalMs = options.pollIntervalMs || 2000;
    this._isElectron = typeof window !== 'undefined' && !!window?.bytebuddiesNative?.microbit;
  }

  on(event, fn) {
    if (event === 'device-added' || event === 'device-removed' || event === 'device-changed') {
      this.listeners.add({ event, fn });
    }
    return () => this.listeners.delete({ event, fn });
  }

  emit(event, data) {
    for (const { event: e, fn } of this.listeners) {
      if (e === event) {
        try {
          fn(data);
        } catch (err) {
          console.error(`[DeviceManager] listener error for ${event}:`, err);
        }
      }
    }
  }

  async startMonitoring() {
    if (this.scanning) return;
    this.scanning = true;

    await this.scan();

    if (this._isElectron) {
      const unwatch = watchMicrobitVolumes({
        onChange: () => this._onUsbDrivesChanged(),
        intervalMs: this.pollIntervalMs,
      });
      this.stopWatchers.push(unwatch);
    }

    if (typeof navigator !== 'undefined' && navigator.usb) {
      const unmonitor = monitorWebUSBDevices(
        (ev) => this._onWebUSBConnect(ev),
        (ev) => this._onWebUSBDisconnect(ev)
      );
      this.stopWatchers.push(unmonitor);
    }
  }

  stopMonitoring() {
    this.scanning = false;
    for (const stop of this.stopWatchers) {
      try {
        stop?.();
      } catch {}
    }
    this.stopWatchers.length = 0;
  }

  async scan() {
    const allDevices = await getAllDetectedDevices();

    const existing = new Set(this.devices.keys());
    const found = new Set();

    for (const devData of allDevices) {
      found.add(devData.id);

      if (this.devices.has(devData.id)) {
        const device = this.devices.get(devData.id);
        if (device.state === DEVICE_STATES.DISCONNECTED) {
          device.setState(DEVICE_STATES.CONNECTED);
          this.emit('device-changed', device.toJSON());
        }
        device.lastSeen = Date.now();
      } else {
        const device = new MicrobitDevice(devData.id, devData.name, devData.type, devData.version);
        device.nativeDevice = devData.device;
        device.setState(DEVICE_STATES.CONNECTED);
        this.devices.set(devData.id, device);
        this.emit('device-added', device.toJSON());
      }
    }

    for (const id of existing) {
      if (!found.has(id)) {
        const device = this.devices.get(id);
        if (device.state !== DEVICE_STATES.DISCONNECTED) {
          device.setState(DEVICE_STATES.DISCONNECTED);
          this.emit('device-removed', device.toJSON());
        }
      }
    }
  }

  async _onUsbDrivesChanged() {
    await this.scan();
  }

  async _onWebUSBConnect(ev) {
    await this.scan();
  }

  async _onWebUSBDisconnect(ev) {
    await this.scan();
  }

  async getConnectedDevices() {
    await this.scan();
    return Array.from(this.devices.values())
      .filter((d) => d.state === DEVICE_STATES.CONNECTED)
      .map((d) => d.toJSON());
  }

  async getHealthyDevices() {
    await this.scan();
    return Array.from(this.devices.values())
      .filter((d) => d.isHealthy())
      .map((d) => d.toJSON());
  }

  getDeviceById(id) {
    const device = this.devices.get(id);
    return device ? device.toJSON() : null;
  }

  recordDeviceError(id) {
    const device = this.devices.get(id);
    if (device) {
      device.recordError();
      this.emit('device-changed', device.toJSON());
    }
  }

  clearDeviceErrors(id) {
    const device = this.devices.get(id);
    if (device) {
      device.clearErrors();
      this.emit('device-changed', device.toJSON());
    }
  }

  updateDeviceState(id, state) {
    const device = this.devices.get(id);
    if (device) {
      device.setState(state);
      this.emit('device-changed', device.toJSON());
    }
  }

  async waitForDevice(filteredId, timeoutMs = 30000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      const devices = await this.getConnectedDevices();
      const match = devices.find((d) => !filteredId || d.id === filteredId);
      if (match) return match;
      await new Promise((r) => setTimeout(r, 500));
    }
    throw new Error(`Device not found within ${timeoutMs}ms`);
  }
}

let _singleton;
export function getDeviceManager() {
  if (!_singleton) _singleton = new DeviceManager();
  return _singleton;
}

export default {
  MicrobitDevice,
  DeviceManager,
  getDeviceManager,
  DEVICE_STATES,
  CONNECTION_TYPES,
};
