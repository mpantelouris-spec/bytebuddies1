/** Web Bluetooth connection for Quarky boards exposing a Nordic UART service. */
import { MicrobitBleUart, NUS_B5A3, NUS_B5B3, rssiToBars } from './bleUart.js';
import { getWebBluetoothStatus } from './microbitDetector.js';

const QUARKY_UART_SERVICES = [NUS_B5B3.service, NUS_B5A3.service];

export async function connectQuarkyWireless(log = () => {}) {
  const status = getWebBluetoothStatus();
  if (!status.available) throw new Error(status.message || 'Web Bluetooth is not available');
  if (navigator.bluetooth.getAvailability && !(await navigator.bluetooth.getAvailability())) {
    throw new Error('Bluetooth is off. Turn on Bluetooth in your device settings.');
  }

  log('Choose your Quarky in the Bluetooth picker (it may be named Quarky or Quarky wxyz)…');
  const device = await navigator.bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: QUARKY_UART_SERVICES,
  });
  log(`Selected: ${device.name || 'Bluetooth device'}`);

  const uart = new MicrobitBleUart(log);
  try {
    await uart.connect(device);
  } catch (error) {
    try { device.gatt?.disconnect(); } catch { /* best effort */ }
    if (/UART service not found/i.test(error.message)) {
      throw new Error('This Quarky does not expose the ByteBuddies BLE UART. Use Quarky MicroPython firmware with Nordic UART (NUS), then reconnect.');
    }
    throw error;
  }

  return {
    device,
    mode: 'nus',
    writeChar: uart.rxChar,
    notifyChar: uart.txChar,
    signal: uart.signal || rssiToBars(null),
    onNotify: (handler) => uart.onNotify(handler),
    disconnect: () => uart.disconnect(),
  };
}
