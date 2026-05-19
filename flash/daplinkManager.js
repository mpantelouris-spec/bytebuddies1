/**
 * DAPLink over WebUSB — connect, flash, disconnect with retries.
 */

import { prepareHexForDapLinkWebUSB } from './hexUtils.js';
import { prepareMicrobitWebUSB, isClaimInterfaceError } from './webusbPrepare.js';

const VENDOR_ID = 0x0d28;

export class DAPLinkManager {
  /**
   * @param {USBDevice} device
   * @param {string} hexString raw or universal Intel HEX
   * @param {(e:{percent:number,message:string,stage?:string})=>void} onProgress
   * @param {{ webUsbBoard?: 'v1' | 'v2' }} [opts]
   */
  async flashDevice(device, hexString, onProgress = () => {}, opts = {}) {
    const { webUsbBoard = 'v2' } = opts;
    const { WebUSB, DAPLink } = await import('dapjs');

    const report = (percent, message, stage = 'flashing') => {
      onProgress({ percent: Math.min(100, Math.max(0, percent)), message, stage });
    };

    const cleanHex = prepareHexForDapLinkWebUSB(hexString, { board: webUsbBoard });
    report(8, `Prepared ${String(webUsbBoard).toUpperCase()}-only image for WebUSB (~${Math.round(cleanHex.length / 1024)} KB).`, 'preparing');
    const transport = new WebUSB(device);
    const daplink = new DAPLink(transport);

    let progressHandler;
    try {
      report(5, 'Opening USB device…', 'connecting');
      await prepareMicrobitWebUSB(device, (m) => report(6, m, 'connecting'));

      let lastErr;
      for (let attempt = 1; attempt <= 5; attempt++) {
        try {
          await daplink.connect();
          lastErr = null;
          break;
        } catch (e) {
          lastErr = e;
          const msg = e?.message || String(e);
          report(8, `Connect retry ${attempt}/5…`, 'connecting');
          if (isClaimInterfaceError(e) && attempt < 5) {
            await prepareMicrobitWebUSB(device, () => {});
            await new Promise((r) => setTimeout(r, 700 * attempt));
          } else {
            await new Promise((r) => setTimeout(r, 400 * attempt));
          }
        }
      }
      if (lastErr) {
        if (isClaimInterfaceError(lastErr)) {
          throw new Error(
            'Unable to claim USB interface. Eject the MICROBIT drive, disconnect Robot Lab USB, unplug/replug, then retry.',
          );
        }
        throw lastErr;
      }

      await new Promise(r => setTimeout(r, 600));
      report(
        12,
        'Tip: if WebUSB keeps failing, eject the MICROBIT drive in Finder, unplug/replug, then try again.',
        'connecting'
      );
      progressHandler = (p) => {
        const pct = 15 + Math.round(Number(p) * 78);
        report(pct, `Flashing… ${pct}%`, 'flashing');
      };
      daplink.on(DAPLink.EVENT_PROGRESS, progressHandler);
      report(15, 'Programming flash…', 'flashing');
      try {
        const enc = new TextEncoder();
        const bytes = enc.encode(cleanHex);
        const payload = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
        await daplink.flash(payload);
      } catch (err) {
        const msg = err?.message || String(err);
        if (msg === 'Flash error' || msg.includes('Flash error')) {
          throw new Error(
            'DAPLink refused the firmware (often invalid universal hex or device busy). ' +
              'Close other tabs using the micro:bit, unplug/replug, or use Download .hex and drag to the MICROBIT drive.'
          );
        }
        throw err;
      }
      report(96, 'Finalizing…', 'finalizing');
      await new Promise((r) => setTimeout(r, 400));
      try {
        report(97, 'Restarting micro:bit (watch for blinking LEDs)…', 'finalizing');
        await device.reset();
        await new Promise((r) => setTimeout(r, 2500));
      } catch {
        /* reset optional — user can press reset button */
      }
      report(100, 'WebUSB flash complete.', 'completed');
      return { success: true, method: 'webusb' };
    } finally {
      if (progressHandler) {
        try {
          daplink.removeListener(DAPLink.EVENT_PROGRESS, progressHandler);
        } catch {
          /* */
        }
      }
      try {
        await daplink.disconnect();
      } catch {
        /* */
      }
    }
  }

  static getVendorId() {
    return VENDOR_ID;
  }
}

export default { DAPLinkManager };
