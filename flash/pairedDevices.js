/**
 * Persist recently used micro:bit BLE devices (Web Bluetooth has no background scan).
 */

const STORAGE_KEY = 'bb_mb_paired_ble';

export function loadPairedBleDevices() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function savePairedBleDevice(device) {
  if (!device?.id) return;
  const entry = {
    id: device.id,
    name: device.name || 'BBC micro:bit',
    lastSeen: Date.now(),
  };
  const list = loadPairedBleDevices().filter((d) => d.id !== entry.id);
  list.unshift(entry);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 8)));
  } catch {
    /* quota */
  }
}

export function removePairedBleDevice(id) {
  const list = loadPairedBleDevices().filter((d) => d.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* */
  }
}

export default { loadPairedBleDevices, savePairedBleDevice, removePairedBleDevice };
