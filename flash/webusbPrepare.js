/**
 * Prepare a micro:bit USB device for DAPLink WebUSB flashing.
 * Fixes common "Unable to claim interface" when the serial port or MSD drive holds the device.
 */

const VENDOR_ID = 0x0d28;

export function isClaimInterfaceError(err) {
  const msg = err?.message || String(err);
  return msg.includes('claimInterface') || msg.includes('Unable to claim');
}

/**
 * Close and reopen the USB device so DAPLink can claim interfaces.
 * @param {USBDevice} device
 * @param {(msg: string) => void} [onStatus]
 */
export async function prepareMicrobitWebUSB(device, onStatus) {
  if (!device || device.vendorId !== VENDOR_ID) {
    throw new Error('Not a micro:bit USB device');
  }

  onStatus?.('Preparing USB for flashing…');

  try {
    if (device.opened) {
      try {
        await device.close();
      } catch {
        /* */
      }
      await delay(400);
    }

    await device.open();

    try {
      await device.reset();
      await delay(900);
    } catch {
      /* reset optional — DAPLink may still connect */
    }

    if (!device.opened) {
      await device.open();
    }

    const configValue = device.configuration?.configurationValue;
    if (configValue !== 1) {
      try {
        await device.selectConfiguration(1);
      } catch {
        /* some browsers already on config 1 */
      }
    }

    await delay(200);
    return device;
  } catch (e) {
    const busy = isClaimInterfaceError(e) || /busy|claim/i.test(e?.message || '');
    if (busy) {
      throw new Error(
        'USB interface busy — disconnect Robot Lab USB, eject the MICROBIT drive, unplug/replug, then flash again.',
      );
    }
    throw new Error(`Could not open micro:bit for flashing: ${e?.message || e}`);
  }
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export default { prepareMicrobitWebUSB, isClaimInterfaceError };
