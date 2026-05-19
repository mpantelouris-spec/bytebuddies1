/**
 * micro:bit device discovery — WebUSB, Web Bluetooth, optional native USB MSD (Electron).
 */

const DAPLINK_VENDOR_ID = 0x0d28;

export const PRODUCT_IDS = {
  MICROBIT_V1: [0x0204, 0x0207, 0x9900, 0x0205],
  /** V2 / V2.2 DAPLink (CMSIS-DAP interface) */
  MICROBIT_V2: [0x0214, 0x0215, 0x0216],
};

/** WebUSB requestDevice filters — V1 and V2 (vendor 0x0d28). */
export function getMicrobitWebUsbFilters() {
  const filters = [];
  for (const productId of [...PRODUCT_IDS.MICROBIT_V1, ...PRODUCT_IDS.MICROBIT_V2]) {
    filters.push({ vendorId: DAPLINK_VENDOR_ID, productId });
  }
  return filters;
}

export function usbVersionToBoard(version) {
  if (version === 'V1') return 'v1';
  if (version === 'V2') return 'v2';
  return 'v2';
}

export function boardToUsbVersion(board) {
  return board === 'v1' ? 'V1' : 'V2';
}

export const BLE_UUIDS = {
  NUS: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
  NUS_B5B3: '6e400001-b5b3-f393-e0a9-e50e24dcca9e',
  NUS_TX: '6e400002-b5a3-f393-e0a9-e50e24dcca9e',
  NUS_RX: '6e400003-b5a3-f393-e0a9-e50e24dcca9e',
  NUS_TX_B5B3: '6e400002-b5b3-f393-e0a9-e50e24dcca9e',
  NUS_RX_B5B3: '6e400003-b5b3-f393-e0a9-e50e24dcca9e',
  // Official micro:bit UART service (MakeCode bluetooth.startUartService())
  MICROBIT_UART: 'e95d127b-251d-470a-a062-fa1922dfa9a8',
  PARTIAL_FLASH_SERVICE: 'e97dd91d-251d-470a-a062-fa1922dfa9a8',
  PARTIAL_FLASH_CHAR: 'e97d3b10-251d-470a-a062-fa1922dfa9a8',
  DFU_SERVICE: 'e95d93b0-251d-470a-a062-fa1922dfa9a8',
};

export function isElectronNative() {
  return typeof window !== 'undefined' && !!window.bytebuddiesNative?.microbit;
}

/** Web Bluetooth requires HTTPS or localhost (not plain http://IP). */
export function getWebBluetoothStatus() {
  if (typeof navigator === 'undefined' || !navigator.bluetooth) {
    return {
      available: false,
      reason: 'unsupported',
      message: 'Web Bluetooth needs Chrome or Edge.',
    };
  }
  const secure = typeof window !== 'undefined' && window.isSecureContext;
  if (!secure) {
    const loc = typeof window !== 'undefined' ? window.location : null;
    const host = loc?.hostname || '';
    const port = loc?.port ? `:${loc.port}` : '';
    let hint = 'https://bytebuddies.technology';
    if (host && (host === 'localhost' || host === '127.0.0.1')) {
      hint = `http://localhost${port || ':5173'}`;
    } else if (host) {
      hint = `https://${host}${port} or http://localhost${port || ':5173'}`;
    }
    return {
      available: false,
      reason: 'insecure',
      message: `Bluetooth blocked on this page. Open ${hint} (Chrome/Edge).`,
      currentUrl: loc?.href,
    };
  }
  return { available: true, reason: 'ok' };
}

export function checkBrowserSupport() {
  const ble = getWebBluetoothStatus();
  return {
    webusb: typeof navigator !== 'undefined' && !!navigator.usb,
    bluetooth: ble.available,
    bluetoothMessage: ble.message,
    bluetoothReason: ble.reason,
    secureContext: typeof window !== 'undefined' && !!window.isSecureContext,
    electronUsb: isElectronNative(),
    recommended: typeof navigator !== 'undefined' && /Chrome|Edge|Chromium|Opera/i.test(navigator.userAgent || ''),
  };
}

/**
 * V2 interface firmware often reports 0x0204 (same PID as V1 CMSIS-DAP) — use name hints too.
 */
export function detectMicrobitVersionFromUsbId(productId, productName = '') {
  const name = String(productName || '').toLowerCase();
  if (name.includes('v2') || name.includes('nrf52') || name.includes('nrf52833')) return 'V2';
  if (PRODUCT_IDS.MICROBIT_V2.includes(productId)) return 'V2';
  if (PRODUCT_IDS.MICROBIT_V1.includes(productId)) {
    // Ambiguous: V1 and V2 both use 0x0204 CMSIS-DAP in Chrome — do not force V1
    if (productId === 0x0204 && /cmsis|dap|lpc1768|mbed/.test(name)) return 'Unknown';
    return 'V1';
  }
  return 'Unknown';
}

export async function listWebUSBDevices() {
  if (!navigator.usb) return [];
  const devices = await navigator.usb.getDevices();
  return devices
    .filter(d => d.vendorId === DAPLINK_VENDOR_ID)
    .map(d => ({
      id: d.serialNumber || String(d.deviceAddress ?? ''),
      name: d.productName || 'BBC micro:bit',
      type: 'webusb',
      version: detectMicrobitVersionFromUsbId(d.productId, d.productName),
      device: d,
      connected: true,
    }));
}

export async function requestWebUSBDevice() {
  if (!navigator.usb) throw new Error('WebUSB not supported');
  const device = await navigator.usb.requestDevice({ filters: getMicrobitWebUsbFilters() });
  return {
    id: device.serialNumber || String(device.deviceAddress ?? ''),
    name: device.productName || 'BBC micro:bit',
    type: 'webusb',
    version: detectMicrobitVersionFromUsbId(device.productId, device.productName),
    device,
    connected: true,
  };
}

export async function requestBluetoothDevice(options = {}) {
  if (!navigator.bluetooth) throw new Error('Web Bluetooth not supported');
  const { optionalServices = [] } = options;
  const device = await navigator.bluetooth.requestDevice({
    filters: [
      { namePrefix: 'BBC micro:bit' },
      { namePrefix: 'BBC' },
      { name: 'ByteBuddies' },
      { namePrefix: 'microbit' },
    ],
    optionalServices: [
      BLE_UUIDS.NUS,
      BLE_UUIDS.NUS_B5B3,
      BLE_UUIDS.MICROBIT_UART,
      BLE_UUIDS.PARTIAL_FLASH_SERVICE,
      BLE_UUIDS.DFU_SERVICE,
      ...optionalServices,
    ],
  });
  return {
    id: device.id,
    name: device.name,
    type: 'ble',
    version: 'V2',
    device,
    connected: false,
  };
}

export async function listNativeUsbDrives() {
  if (!isElectronNative()) return [];
  try {
    return await window.bytebuddiesNative.microbit.listDrives();
  } catch {
    return [];
  }
}

export function monitorWebUSBDevices(onConnect, onDisconnect) {
  if (!navigator.usb) return () => {};
  const c = e => {
    const d = e.device;
    if (d.vendorId === DAPLINK_VENDOR_ID) onConnect?.({ type: 'webusb', device: d });
  };
  const disc = e => {
    const d = e.device;
    if (d.vendorId === DAPLINK_VENDOR_ID) onDisconnect?.({ type: 'webusb', device: d });
  };
  navigator.usb.addEventListener('connect', c);
  navigator.usb.addEventListener('disconnect', disc);
  return () => {
    navigator.usb.removeEventListener('connect', c);
    navigator.usb.removeEventListener('disconnect', disc);
  };
}

export async function getAllDetectedDevices() {
  const out = [];
  if (navigator.usb) {
    try {
      out.push(...(await listWebUSBDevices()));
    } catch {
      /* */
    }
  }
  try {
    const native = await listNativeUsbDrives();
    for (const d of native) {
      out.push({ ...d, type: 'usb-msd', connected: true });
    }
  } catch {
    /* */
  }
  return out;
}

export async function getDeviceInfo(device, type = 'webusb') {
  try {
    if (type === 'webusb') {
      return {
        type: 'webusb',
        id: device.serialNumber,
        name: device.productName,
        version: detectMicrobitVersionFromUsbId(device.productId, device.productName),
        vendorId: device.vendorId,
        productId: device.productId,
      };
    }
    if (type === 'ble') {
      return {
        type: 'ble',
        id: device.id,
        name: device.name,
        version: 'V2',
        gatt: device.gatt?.connected ? 'connected' : 'disconnected',
      };
    }
  } catch {
    return null;
  }
  return null;
}

export async function validateDevice(device, type = 'webusb') {
  try {
    if (type === 'webusb') {
      return device.vendorId === DAPLINK_VENDOR_ID && !!device.productName;
    }
    if (type === 'ble' && device.gatt) {
      const server = await device.gatt.connect();
      const services = await server.getPrimaryServices();
      device.gatt.disconnect();
      return services.length > 0;
    }
  } catch {
    return false;
  }
  return false;
}

export default {
  checkBrowserSupport,
  listWebUSBDevices,
  requestWebUSBDevice,
  requestBluetoothDevice,
  monitorWebUSBDevices,
  listNativeUsbDrives,
  getAllDetectedDevices,
  getDeviceInfo,
  validateDevice,
  BLE_UUIDS,
  DAPLINK_VENDOR_ID,
};
