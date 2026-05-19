/**
 * MakeCode-style dual-mode flashing: USB (WebUSB / MSD) primary, Bluetooth partial fallback.
 */

import { ProgressManager } from './progressManager.js';
import { getHexInfo, canPartialFlashOverBle, isUniversalHex, separateUniversalHex, microbitBoardId } from './hexUtils.js';
import {
  checkBrowserSupport,
  listWebUSBDevices,
  requestWebUSBDevice,
  requestBluetoothDevice,
  listNativeUsbDrives,
  isElectronNative,
  detectMicrobitVersionFromUsbId,
} from './microbitDetector.js';
import { WebUSBFlasher, requestWebUSBMicrobit } from './webusbFlash.js';
import { BLEFlasher } from './bleFlash.js';
import { getDeviceManager } from './deviceManager.js';
import { loadPairedBleDevices, savePairedBleDevice } from './pairedDevices.js';
import { prepareMicrobitWebUSB, isClaimInterfaceError } from './webusbPrepare.js';
import {
  flashHexToBrowserMsd,
  isBrowserMsdFlashSupported,
  pickMicrobitDirHandle,
} from './msdBrowserFlash.js';

function downloadHexFile(hexString, filename = 'program.hex') {
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

export const CONNECTION_MODE = {
  DISCONNECTED: 'disconnected',
  USB: 'usb',
  BLUETOOTH: 'bluetooth',
};

const USB_RETRY_DELAYS_MS = [1000, 2000, 4000, 8000];

export function crc32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc ^= bytes[i];
    for (let j = 0; j < 8; j++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function isUsbDisconnectError(err) {
  const msg = err?.message || String(err);
  return /disconnect|NetworkError|device was disconnected|lost/i.test(msg);
}

async function resolveUsbDevice({ webUsbDevice, selectedUsbId, report }) {
  if (webUsbDevice) return webUsbDevice;

  const known = await listWebUSBDevices();
  if (selectedUsbId) {
    const match = known.find((d) => d.id === selectedUsbId);
    if (match?.device) {
      report(8, `Using selected device: ${match.name}`, 'connecting');
      return match.device;
    }
  }
  if (known.length === 1) {
    report(8, `Using authorized device: ${known[0].name}`, 'connecting');
    return known[0].device;
  }
  if (known.length > 1) {
    report(8, 'Multiple USB micro:bits — select one…', 'connecting');
    const picked = await requestWebUSBDevice();
    return picked.device;
  }
  report(8, 'Select your micro:bit (USB)…', 'connecting');
  return requestWebUSBMicrobit();
}

function createReporter(onProgress, onLog) {
  const startedAt = Date.now();
  let lastPercent = 0;

  return (percent, message, stage = 'flashing', extra = {}) => {
    lastPercent = percent;
    let etaSeconds = null;
    if (percent > 5 && percent < 98) {
      const elapsed = (Date.now() - startedAt) / 1000;
      const rate = percent / elapsed;
      if (rate > 0) etaSeconds = Math.round((100 - percent) / rate);
    }
    const payload = {
      percent,
      message,
      stage,
      etaSeconds,
      ...extra,
    };
    onProgress(payload);
    onLog?.(message, stage === 'failed' ? 'error' : 'info');
  };
}

export class DualModeFlashManager {
  constructor() {
    this.queue = new ProgressManager();
    this.deviceManager = getDeviceManager();
    this.support = typeof navigator !== 'undefined' ? checkBrowserSupport() : {};
    this.connectionMode = CONNECTION_MODE.DISCONNECTED;
    this.activeDevice = null;
    this.logs = [];
    this._logListeners = new Set();
    this._stateListeners = new Set();
    this._lastScan = null;
    this._usbAbort = false;
  }

  onLog(fn) {
    this._logListeners.add(fn);
    return () => this._logListeners.delete(fn);
  }

  onState(fn) {
    this._stateListeners.add(fn);
    return () => this._stateListeners.delete(fn);
  }

  _emitLog(message, level = 'info') {
    const entry = { message, level, time: Date.now() };
    this.logs.push(entry);
    if (this.logs.length > 200) this.logs.shift();
    for (const fn of this._logListeners) {
      try {
        fn(entry);
      } catch {
        /* */
      }
    }
  }

  _emitState(patch) {
    const state = {
      connectionMode: this.connectionMode,
      activeDevice: this.activeDevice,
      lastScan: this._lastScan,
      support: this.support,
      ...patch,
    };
    for (const fn of this._stateListeners) {
      try {
        fn(state);
      } catch {
        /* */
      }
    }
    return state;
  }

  /**
   * Scan USB (authorized + MSD) and load paired BLE history.
   */
  async scanConnections() {
    this._emitLog('Detecting devices…', 'info');
    const usb = [];
    const webusb = await listWebUSBDevices().catch(() => []);
    usb.push(...webusb);

    if (isElectronNative()) {
      const drives = await listNativeUsbDrives().catch(() => []);
      for (const d of drives) {
        usb.push({ ...d, type: 'usb-msd', connectionLabel: 'Wired (USB drive)' });
      }
    }

    for (const d of usb) {
      d.connectionLabel = d.type === 'usb-msd' ? 'Wired (USB drive)' : 'Wired (WebUSB)';
    }

    const pairedBluetooth = loadPairedBleDevices();
    const scan = {
      usb,
      pairedBluetooth,
      bluetoothAvailable: !!this.support.bluetooth,
      recommended: usb.length > 0 ? CONNECTION_MODE.USB : CONNECTION_MODE.BLUETOOTH,
      scannedAt: Date.now(),
    };
    this._lastScan = scan;
    this._emitLog(
      usb.length
        ? `Found ${usb.length} USB device(s)${pairedBluetooth.length ? `, ${pairedBluetooth.length} remembered Bluetooth` : ''}.`
        : 'No USB micro:bit — plug in via cable or use wireless.',
      usb.length ? 'success' : 'warn',
    );
    this._emitState({ lastScan: scan });
    return scan;
  }

  prepareHex(hexString, board = 'v2') {
    let hex = String(hexString || '');
    if (!isUniversalHex(hex)) return hex;
    const parts = separateUniversalHex(hex);
    const wantId = board === 'v1' ? microbitBoardId.V1 : microbitBoardId.V2;
    const chosen =
      parts.find((p) => p.boardId === wantId) ||
      parts.find((p) => p.boardId === microbitBoardId.V2) ||
      parts[0];
    return chosen?.hex || hex;
  }

  /**
   * Dual-mode flash: USB → BLE partial → download (MakeCode-style).
   */
  async flash(hexString, options = {}) {
    const {
      method = 'dual-auto',
      board = 'v2',
      filename = 'program.hex',
      onProgress = () => {},
      webUsbDevice = null,
      selectedUsbId = null,
      bleDevice = null,
      beforeUsbFlash = null,
      msdDirHandle = null,
    } = options;

    const info = getHexInfo(hexString);
    if (!info.valid) {
      throw new Error(`Invalid Intel HEX: ${info.errors.join('; ')}`);
    }

    const hex = this.prepareHex(hexString, board);
    const report = createReporter(
      (e) => onProgress(e),
      (msg, level) => this._emitLog(msg, level),
    );

    const run = async () => {
      report(0, 'Detecting device…', 'preparing');
      await this.scanConnections().catch(() => {});

      if (method === 'download') {
        report(100, 'Downloading .hex file…', 'completed');
        return downloadHexFile(hex, filename);
      }

      if (method === 'ble' || method === 'bluetooth') {
        return this._flashBluetooth(hexString, { bleDevice, report, board });
      }

      const usbOpts = {
        webUsbDevice,
        selectedUsbId,
        report,
        board,
        beforeUsbFlash,
        originalHex: hexString,
        filename,
        bleDevice,
        msdDirHandle,
      };

      if (method === 'webusb' || method === 'usb') {
        try {
          return await this._flashUsb(hex, usbOpts);
        } catch (usbErr) {
          return this._handleUsbFailure(usbErr, hex, hexString, usbOpts);
        }
      }

      try {
        report(2, 'Connecting via USB (primary)…', 'connecting', { connectionMode: CONNECTION_MODE.USB });
        return await this._flashUsb(hex, usbOpts);
      } catch (usbErr) {
        return this._handleUsbFailure(usbErr, hex, hexString, usbOpts);
      }
    };

    return run();
  }

  async _handleUsbFailure(usbErr, hex, originalHex, opts) {
    const { report, board, filename, bleDevice } = opts;
    const msg = usbErr?.message || String(usbErr);
    report(45, `USB flash failed: ${msg.slice(0, 140)}`, 'failed');

    if (isClaimInterfaceError(usbErr)) {
      report(46, 'Eject MICROBIT drive, disconnect Robot Lab USB, replug, retry.', 'preparing');
    }

    if (canPartialFlashOverBle(originalHex)) {
      report(48, 'Switching to wireless (Bluetooth)…', 'connecting', {
        connectionMode: CONNECTION_MODE.BLUETOOTH,
      });
      try {
        return await this._flashBluetooth(originalHex, { bleDevice, report, board });
      } catch (bleErr) {
        const bmsg = bleErr?.message || String(bleErr);
        report(55, `Bluetooth failed: ${bmsg.slice(0, 100)}`, 'failed');
        if (/signal|timeout|disconnect/i.test(bmsg)) {
          report(56, 'Bluetooth signal lost — move closer or use USB.', 'failed');
        }
      }
    } else if (isUsbDisconnectError(usbErr)) {
      report(47, 'USB disconnected — use wireless only if you have MakeCode firmware on the board.', 'warn');
    }

    if (isBrowserMsdFlashSupported()) {
      try {
        report(55, 'USB failed — try copying to MICROBIT drive…', 'preparing');
        const msd = await flashHexToBrowserMsd(hex, filename, {
          onProgress: (p) => report(p.percent, p.message, p.stage),
          promptIfMissing: true,
        });
        return { ...msd, connectionMode: CONNECTION_MODE.USB };
      } catch (msdErr) {
        if (msdErr?.name !== 'AbortError') {
          report(60, `MICROBIT copy: ${msdErr.message}`, 'failed');
        }
      }
    }

    report(72, 'Downloading .hex — drag onto MICROBIT drive to finish.', 'preparing');
    const dl = downloadHexFile(hex, filename);
    return {
      ...dl,
      connectionMode: CONNECTION_MODE.DISCONNECTED,
      fallback: 'download',
      partial: true,
    };
  }

  async _flashBrowserMsd(hex, opts) {
    const { report, filename, msdDirHandle } = opts;
    if (!isBrowserMsdFlashSupported()) return null;
    try {
      report(4, 'Copying to MICROBIT USB drive (wired)…', 'connecting', {
        connectionMode: CONNECTION_MODE.USB,
      });
      const result = await flashHexToBrowserMsd(hex, filename, {
        dirHandle: msdDirHandle || undefined,
        onProgress: (p) => report(p.percent, p.message, p.stage || 'flashing'),
        promptIfMissing: !msdDirHandle,
      });
      this.activeDevice = { type: 'browser-msd', name: 'MICROBIT' };
      return { ...result, connectionMode: CONNECTION_MODE.USB };
    } catch (e) {
      if (e?.name === 'AbortError') {
        throw new Error('MICROBIT folder picker cancelled — pick the MICROBIT drive to flash.');
      }
      report(6, `${e.message} — trying WebUSB…`, 'preparing');
      return null;
    }
  }

  async _flashUsb(hex, opts) {
    const { webUsbDevice, selectedUsbId, report, board, beforeUsbFlash, originalHex, filename, bleDevice } = opts;
    this.connectionMode = CONNECTION_MODE.USB;
    this._emitState();

    if (isElectronNative()) {
      const drives = await listNativeUsbDrives();
      if (drives?.length) {
        report(8, `Connecting via USB drive (${drives[0].path})…`, 'connecting');
        const api = window.bytebuddiesNative.microbit;
        const result = await api.flashUsb(hex, { filename });
        this.activeDevice = { type: 'usb-msd', name: drives[0].path };
        report(100, 'Flash complete (USB drive).', 'completed');
        return { ...result, method: 'usb-msd', connectionMode: CONNECTION_MODE.USB };
      }
    }

    if (typeof beforeUsbFlash === 'function') {
      await beforeUsbFlash();
    }

    // Wired copy (same as drag-and-drop) — most reliable in Chrome/Edge on Mac/Windows.
    const msd = await this._flashBrowserMsd(hex, opts);
    if (msd) return msd;

    if (!navigator.usb) {
      throw new Error('WebUSB not available — link the MICROBIT drive or use Copy hex.');
    }

    report(5, 'Trying WebUSB programming…', 'connecting', { connectionMode: CONNECTION_MODE.USB });

    const device =
      webUsbDevice || (await resolveUsbDevice({ webUsbDevice: null, selectedUsbId, report }));
    const serial = device.serialNumber || 'micro:bit';
    const version = detectMicrobitVersionFromUsbId(device.productId, device.productName);
    this.activeDevice = { type: 'webusb', id: serial, name: device.productName, version };

    const flasher = new WebUSBFlasher((e) => {
      report(e.percent, e.message, e.stage || 'flashing', { connectionMode: CONNECTION_MODE.USB });
    });

    let lastErr;
    for (let attempt = 0; attempt < USB_RETRY_DELAYS_MS.length; attempt++) {
      try {
        if (attempt > 0) {
          report(10, `USB retry ${attempt + 1}/${USB_RETRY_DELAYS_MS.length}…`, 'connecting');
          await prepareMicrobitWebUSB(device, () => {});
          await new Promise((r) => setTimeout(r, USB_RETRY_DELAYS_MS[attempt]));
        }
        report(12, 'Transferring firmware…', 'flashing');
        const result = await flasher.flash(hex, device, { webUsbBoard: board });
        report(100, 'Flash complete! Restart your micro:bit if needed.', 'completed');
        return { ...result, method: 'webusb', connectionMode: CONNECTION_MODE.USB, serial };
      } catch (e) {
        lastErr = e;
        if (isUsbDisconnectError(e) && canPartialFlashOverBle(originalHex)) {
          report(20, 'USB disconnected mid-flash — trying Bluetooth…', 'failed');
          return this._handleUsbFailure(e, hex, originalHex, opts);
        }
        if (isUsbDisconnectError(e)) {
          throw new Error('USB disconnected during flash.');
        }
      }
    }
    throw lastErr || new Error('USB flash failed');
  }

  async _flashBluetooth(hexString, { bleDevice, report }) {
    this.connectionMode = CONNECTION_MODE.BLUETOOTH;
    this._emitState();

    if (!navigator.bluetooth) {
      throw new Error('Web Bluetooth not available — use Chrome or Edge on HTTPS.');
    }

    if (!canPartialFlashOverBle(hexString)) {
      throw new Error(
        'Full firmware cannot be sent over Bluetooth. Flash MicroPython once over USB, then use Connect + Run.',
      );
    }

    report(5, 'Scanning for Bluetooth devices…', 'connecting', { connectionMode: CONNECTION_MODE.BLUETOOTH });

    let device = bleDevice;
    if (!device) {
      try {
        const picked = await requestBluetoothDevice();
        device = picked.device;
      } catch (e) {
        if (e.name === 'NotFoundError') throw new Error('Bluetooth pairing cancelled.');
        throw e;
      }
    }

    savePairedBleDevice({ id: device.id, name: device.name });
    this.activeDevice = { type: 'ble', id: device.id, name: device.name };

    report(12, `Wireless: ${device.name || 'micro:bit'}`, 'connecting');

    const payload = new TextEncoder().encode(hexString);
    const fileCrc = crc32(payload);
    report(15, `Verifying CRC32: 0x${fileCrc.toString(16)}`, 'verifying');

    const flasher = new BLEFlasher((e) => {
      const m = e.message || '';
      const packetMatch = /packet\s+(\d+)\s*\/\s*(\d+)/i.exec(m);
      const extra = packetMatch
        ? { packetIndex: Number(packetMatch[1]), packetTotal: Number(packetMatch[2]) }
        : {};
      report(e.percent, e.message, e.stage || 'flashing', {
        connectionMode: CONNECTION_MODE.BLUETOOTH,
        ...extra,
      });
    });

    let lastErr;
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        if (attempt > 0) {
          const delay = USB_RETRY_DELAYS_MS[attempt] || 8000;
          report(20, `Bluetooth retry in ${delay / 1000}s…`, 'connecting');
          await new Promise((r) => setTimeout(r, delay));
        }
        report(18, 'Transferring firmware wirelessly…', 'flashing');
        const result = await flasher.flash(hexString, device);
        report(100, 'Wireless flash complete!', 'completed');
        return { ...result, method: 'ble', connectionMode: CONNECTION_MODE.BLUETOOTH, fileCrc };
      } catch (e) {
        lastErr = e;
        const msg = e?.message || String(e);
        if (/out-of-order|packet/i.test(msg)) {
          report(30, `Transfer error: ${msg.slice(0, 80)}`, 'failed');
        } else if (/timeout|signal|disconnect/i.test(msg)) {
          report(30, 'Bluetooth signal lost or timed out.', 'failed');
        } else if (/checksum|hash/i.test(msg)) {
          report(30, `Verification failed: ${msg.slice(0, 80)}`, 'failed');
        }
      }
    }
    throw lastErr || new Error('Bluetooth flash failed');
  }

  getConnectionMode() {
    return this.connectionMode;
  }

  getLogs() {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}

let _singleton;
export function getDualModeFlashManager() {
  if (!_singleton) _singleton = new DualModeFlashManager();
  return _singleton;
}

export default { DualModeFlashManager, getDualModeFlashManager, CONNECTION_MODE, crc32 };
