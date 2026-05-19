/**
 * WebUSB flashing (Chromium) — vendor 0x0d28, DAPjs transport.
 */

import { sanitizeHexForWebUSB, getHexInfo } from './hexUtils.js';
import { DAPLinkManager } from './daplinkManager.js';

const VENDOR_ID = 0x0d28;

export class WebUSBFlasher {
  constructor(onProgress) {
    this.onProgress = onProgress;
    this.manager = new DAPLinkManager();
  }

  async flash(hexString, device, opts = {}) {
    if (!navigator.usb) throw new Error('WebUSB is not available. Use Chrome or Edge.');
    const info = getHexInfo(hexString);
    if (!info.valid) throw new Error(`Invalid HEX: ${info.errors.join(', ')}`);
    return this.manager.flashDevice(device, hexString, this.onProgress, opts);
  }
}

export async function requestWebUSBMicrobit() {
  if (!navigator.usb) throw new Error('WebUSB not supported');
  return navigator.usb.requestDevice({ filters: [{ vendorId: VENDOR_ID }] });
}

export async function requestAndFlash(hexString, onProgress) {
  const device = await requestWebUSBMicrobit();
  const flasher = new WebUSBFlasher(onProgress);
  return flasher.flash(hexString, device);
}

export async function quickFlash(hexString, device, onProgress) {
  const flasher = new WebUSBFlasher(onProgress);
  return flasher.flash(hexString, device);
}

export { sanitizeHexForWebUSB };

export default { WebUSBFlasher, requestAndFlash, quickFlash, requestWebUSBMicrobit };
