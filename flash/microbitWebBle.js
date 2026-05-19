/**
 * Connect to micro:bit over Bluetooth.
 *
 * After CODAL "Bluetooth UART" flash: use official micro:bit profile (microbit-web-bluetooth).
 * After Python editor flash: use Nordic UART (NUS) fallback.
 */
import { requestMicrobit, getServices } from 'microbit-web-bluetooth';
import { getWebBluetoothStatus } from './microbitDetector.js';
import { MicrobitBleUart, requestMicrobitBleDevice, formatSignalBars, rssiToBars } from './bleUart.js';

/**
 * @returns {Promise<{
 *   device: BluetoothDevice,
 *   mode: 'profile' | 'nus',
 *   uartService?: import('microbit-web-bluetooth').UartService,
 *   writeChar?: BluetoothRemoteGATTCharacteristic,
 *   notifyChar?: BluetoothRemoteGATTCharacteristic,
 *   signal: ReturnType<typeof rssiToBars>,
 *   disconnect: () => void,
 * }>}
 */
// All optional services needed: official micro:bit profile + NUS variants + flash services
const ALL_OPTIONAL_SERVICES = [
  '6e400001-b5a3-f393-e0a9-e50e24dcca9e', // NUS B5A3 (MakeCode UART)
  '6e400001-b5b3-f393-e0a9-e50e24dcca9e', // NUS B5B3 (legacy)
  'e95d127b-251d-470a-a062-fa1922dfa9a8', // micro:bit I/O Pin service
  'e95d9882-251d-470a-a062-fa1922dfa9a8', // Button service
  'e95dd91d-251d-470a-a062-fa1922dfa9a8', // LED service
  'e95d6100-251d-470a-a062-fa1922dfa9a8', // Temperature service
  'e95d0753-251d-470a-a062-fa1922dfa9a8', // Accelerometer service
  'e95df2d8-251d-470a-a062-fa1922dfa9a8', // Magnetometer service
  'e95d93af-251d-470a-a062-fa1922dfa9a8', // Event service
  'e95d93b0-251d-470a-a062-fa1922dfa9a8', // DFU service
  'e97dd91d-251d-470a-a062-fa1922dfa9a8', // Partial flash service
  '0000180a-0000-1000-8000-00805f9b34fb', // Device information
];

export async function connectMicrobitWireless(log = () => {}) {
  const status = getWebBluetoothStatus();
  if (!status.available) {
    throw new Error(status.message || 'Web Bluetooth not available');
  }

  if (navigator.bluetooth.getAvailability) {
    const avail = await navigator.bluetooth.getAvailability();
    if (!avail) {
      throw new Error('Bluetooth is off. Turn on Bluetooth in System Settings.');
    }
  }

  log('Opening device picker — choose your micro:bit…');
  const device = await navigator.bluetooth.requestDevice({
    filters: [
      { namePrefix: 'BBC micro:bit' },
      { namePrefix: 'BBC' },
      { namePrefix: 'micro:bit' },
      { name: 'ByteBuddies' },
    ],
    optionalServices: ALL_OPTIONAL_SERVICES,
  });

  log(`Selected: ${device.name || 'micro:bit'}`);

  if (!device.gatt.connected) {
    log('Connecting…');
    await device.gatt.connect();
  }
  await new Promise((r) => setTimeout(r, 1500));

  // MakeCode Bluetooth UART (official micro:bit profile via microbit-web-bluetooth)
  try {
    log('Looking for Bluetooth UART service…');
    const services = await getServices(device);
    if (services.uartService) {
      log('Connected — MakeCode Bluetooth UART');
      return {
        device,
        mode: 'profile',
        uartService: services.uartService,
        signal: rssiToBars(null),
        disconnect: () => { try { device.gatt.disconnect(); } catch { /* */ } },
      };
    }
  } catch (e) {
    log(`Profile UART unavailable: ${e.message}`);
  }

  // Fallback: Nordic UART Service (NUS) — MicroPython / custom firmware
  log('Trying Nordic UART (NUS)…');
  const nus = new MicrobitBleUart(log);
  await nus.connect(device);
  log('Connected — Nordic UART');
  const sig = nus.signal;
  log(`Signal: ${formatSignalBars(sig.bars)} ${sig.label}`);

  return {
    device,
    mode: 'nus',
    writeChar: nus.rxChar,
    notifyChar: nus.txChar,
    signal: sig,
    ping: () => nus.ping(),
    writeBytes: (d) => nus.writeBytes(d),
    onNotify: (h) => nus.onNotify(h),
    disconnect: () => nus.disconnect(),
  };
}

export { formatSignalBars, rssiToBars };
