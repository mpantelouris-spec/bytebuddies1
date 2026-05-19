/**
 * Single entry point for micro:bit flashing — call from UI on user click only.
 * Requests WebUSB permission FIRST (while user gesture is active), then builds/flashes.
 */

import { getDualModeFlashManager } from './dualModeFlashManager.js';
import {
  listWebUSBDevices,
  requestWebUSBDevice,
  detectMicrobitVersionFromUsbId,
  usbVersionToBoard,
} from './microbitDetector.js';
import { requestWebUSBMicrobit } from './webusbFlash.js';

/**
 * Pick USB device during user gesture (before long async work).
 * @param {string} [selectedUsbId]
 * @returns {Promise<{ device: USBDevice|null, board: 'v1'|'v2', version: string }|null>}
 */
export async function requestMicrobitUsbEarly(selectedUsbId) {
  if (!navigator.usb) return null;

  const known = await listWebUSBDevices();
  let picked = null;

  if (selectedUsbId) {
    picked = known.find((d) => d.id === selectedUsbId);
  }
  if (!picked && known.length === 1) {
    picked = known[0];
  }
  if (!picked && known.length > 1) {
    picked = await requestWebUSBDevice();
  }
  if (!picked && known.length === 0) {
    const device = await requestWebUSBMicrobit();
    const version = detectMicrobitVersionFromUsbId(device.productId, device.productName);
    return { device, board: usbVersionToBoard(version), version };
  }

  if (picked?.device) {
    const version =
      picked.version ||
      detectMicrobitVersionFromUsbId(picked.device.productId, picked.device.productName);
    return {
      device: picked.device,
      board: usbVersionToBoard(version),
      version,
    };
  }

  return null;
}

/**
 * Flash hex with dual-mode fallback. Pass webUsbDevice + board from requestMicrobitUsbEarly().
 */
export async function flashMicrobitHex(hexString, options = {}) {
  const dual = getDualModeFlashManager();
  return dual.flash(hexString, options);
}

export async function scanMicrobitDevices() {
  return getDualModeFlashManager().scanConnections();
}

export default { flashMicrobitHex, requestMicrobitUsbEarly, scanMicrobitDevices };
