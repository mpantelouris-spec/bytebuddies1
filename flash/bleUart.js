/**
 * micro:bit Bluetooth — Nordic UART Service (NUS) per Web Bluetooth spec.
 *
 * Service: 6E400001-B5A3-F393-E0A9-E50E24DCCA9E
 * RX (app → micro:bit): 6E400002 — central writes firmware/commands
 * TX (micro:bit → app): 6E400003 — notifications / acknowledgements
 *
 * Also supports B5B3 variant (legacy ByteBuddies / Cutebot firmware).
 */

import { BLE_UUIDS, getWebBluetoothStatus } from './microbitDetector.js';

/** Standard Nordic UART (user / MakeCode docs). */
export const NUS_B5A3 = {
  service: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
  rx: '6e400002-b5a3-f393-e0a9-e50e24dcca9e',
  tx: '6e400003-b5a3-f393-e0a9-e50e24dcca9e',
};

/** Alternate UUID set used by some ByteBuddies builds. */
export const NUS_B5B3 = {
  service: '6e400001-b5b3-f393-e0a9-e50e24dcca9e',
  rx: '6e400002-b5b3-f393-e0a9-e50e24dcca9e',
  tx: '6e400003-b5b3-f393-e0a9-e50e24dcca9e',
};

/** B5B3 first — matches firmware on device (B5A3 fails on many V2 boards). */
export const NUS_VARIANTS = [NUS_B5B3, NUS_B5A3];

export const BLE_OPTIONAL_SERVICES = [
  ...NUS_VARIANTS.map((v) => v.service),
  BLE_UUIDS.MICROBIT_UART,
  BLE_UUIDS.PARTIAL_FLASH_SERVICE,
  BLE_UUIDS.DFU_SERVICE,
];

const CHUNK_SIZE = 18;
const MAX_RETRIES = 3;
const PACKET_TIMEOUT_MS = 5000;

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

export function rssiToBars(rssi) {
  if (rssi == null || !Number.isFinite(rssi)) return { bars: 0, label: '—', rssi: null };
  if (rssi >= -55) return { bars: 3, label: 'Strong', rssi };
  if (rssi >= -70) return { bars: 2, label: 'OK', rssi };
  if (rssi >= -85) return { bars: 1, label: 'Weak', rssi };
  return { bars: 0, label: 'Very weak', rssi };
}

export function formatSignalBars(bars) {
  return '🔵'.repeat(bars) + '⚪'.repeat(Math.max(0, 3 - bars));
}

/** Notification queue — waits for micro:bit TX characteristic data. */
export class BleNotifyReader {
  constructor(char) {
    this.char = char;
    this._q = [];
    this._waiters = [];
    this._handler = (ev) => {
      const v = new Uint8Array(ev.target.value.buffer);
      if (this._waiters.length) {
        const w = this._waiters.shift();
        clearTimeout(w.timer);
        w.resolve(v);
      } else {
        this._q.push(v);
      }
    };
    char.addEventListener('characteristicvaluechanged', this._handler);
  }

  async read(timeoutMs = PACKET_TIMEOUT_MS) {
    if (this._q.length) return this._q.shift();
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        const idx = this._waiters.findIndex((w) => w.resolve === resolve);
        if (idx >= 0) this._waiters.splice(idx, 1);
        reject(new Error('No response from micro:bit (timeout)'));
      }, timeoutMs);
      this._waiters.push({ resolve, reject, timer });
    });
  }

  dispose() {
    this.char.removeEventListener('characteristicvaluechanged', this._handler);
    for (const w of this._waiters) clearTimeout(w.timer);
    this._waiters.length = 0;
  }
}

function normUuid(u) {
  return String(u || '').toLowerCase().replace(/-/g, '');
}

function pickChars(allChars, variant) {
  const rxId = normUuid(variant.rx);
  const txId = normUuid(variant.tx);
  const rxChar =
    allChars.find((c) => normUuid(c.uuid) === rxId) ||
    allChars.find((c) => normUuid(c.uuid).includes('6e400002'));
  const txChar =
    allChars.find((c) => normUuid(c.uuid) === txId) ||
    allChars.find((c) => normUuid(c.uuid).includes('6e400003'));
  return { rxChar, txChar };
}

/**
 * Step 1: Browser dialog — pick a nearby micro:bit.
 */
export async function requestMicrobitBleDevice() {
  const status = getWebBluetoothStatus();
  if (!status.available) {
    throw new Error(status.message || 'Web Bluetooth not available');
  }

  try {
    return await navigator.bluetooth.requestDevice({
      filters: [
        { namePrefix: 'BBC micro:bit' },
        { namePrefix: 'BBC' },
        { namePrefix: 'micro:bit' },
        { name: 'ByteBuddies' },
      ],
      optionalServices: BLE_OPTIONAL_SERVICES,
    });
  } catch (e) {
    if (e.name !== 'NotFoundError') throw e;
  }

  for (const variant of NUS_VARIANTS) {
    try {
      return await navigator.bluetooth.requestDevice({
        filters: [{ services: [variant.service] }],
        optionalServices: BLE_OPTIONAL_SERVICES,
      });
    } catch (e) {
      if (e.name !== 'NotFoundError') throw e;
    }
  }

  return navigator.bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: BLE_OPTIONAL_SERVICES,
  });
}

/**
 * Full UART connection: GATT → service → RX/TX → notifications.
 */
export class MicrobitBleUart {
  constructor(log = () => {}) {
    this.log = log;
    this.device = null;
    this.server = null;
    this.variant = null;
    this.rxChar = null;
    this.txChar = null;
    this.reader = null;
    this.rssi = null;
    this._rssiStop = null;
  }

  get signal() {
    return rssiToBars(this.rssi);
  }

  async requestDevice() {
    this.log('Scanning for Bluetooth devices…');
    this.device = await requestMicrobitBleDevice();
    this.log(`Selected: ${this.device.name || 'micro:bit'}`);
    return this.device;
  }

  async connect(existingDevice = null) {
    if (existingDevice) this.device = existingDevice;
    if (!this.device) await this.requestDevice();

    this.log('Opening secure Bluetooth connection…');
    this.server = this.device.gatt;
    if (!this.server.connected) {
      await this.server.connect();
    }
    await new Promise((r) => setTimeout(r, 2000));

    this.log('Finding Nordic UART service…');
    let service = null;
    for (const variant of NUS_VARIANTS) {
      try {
        service = await this.server.getPrimaryService(variant.service);
        this.variant = variant;
        break;
      } catch {
        /* try next */
      }
    }

    if (!service) {
      const all = await this.server.getPrimaryServices();
      for (const s of all) {
        const v = NUS_VARIANTS.find(
          (x) => normUuid(s.uuid).includes(normUuid(x.service).slice(0, 8)),
        );
        if (v) {
          service = s;
          this.variant = v;
          break;
        }
      }
    }

    if (!service || !this.variant) {
      throw new Error(
        'UART service not found. Flash wireless firmware over USB (LED shows B), unplug USB, reset, then retry.',
      );
    }

    this.log(`UART service found (${this.variant === NUS_B5A3 ? 'B5A3' : 'B5B3'})`);

    const chars = await service.getCharacteristics();
    let { rxChar, txChar } = pickChars(chars, this.variant);
    if (!rxChar) rxChar = await service.getCharacteristic(this.variant.rx);
    if (!txChar) txChar = await service.getCharacteristic(this.variant.tx);
    if (!rxChar || !txChar) {
      throw new Error('Missing UART RX/TX characteristics on micro:bit');
    }

    this.rxChar = rxChar;
    this.txChar = txChar;

    this.log('Subscribing to TX notifications…');
    await this.txChar.startNotifications();
    this.reader = new BleNotifyReader(this.txChar);

    this._startRssiMonitor();
    this.log('Bluetooth handshake complete');
    return { device: this.device, rxChar: this.rxChar, txChar: this.txChar, variant: this.variant };
  }

  _startRssiMonitor() {
    if (!this.device?.watchAdvertisements) return;
    const onAdv = (ev) => {
      if (typeof ev.rssi === 'number') this.rssi = ev.rssi;
    };
    this.device.addEventListener('advertisementreceived', onAdv);
    this._rssiStop = () => this.device.removeEventListener('advertisementreceived', onAdv);
    this.device.watchAdvertisements?.().catch(() => {});
  }

  /**
   * Write one packet (≤18 bytes payload + 2-byte header) with retry.
   * @param {Uint8Array} payload
   * @param {number} packetIndex 1-based
   * @param {number} packetTotal
   */
  async writePacket(payload, packetIndex, packetTotal, onProgress) {
    const header = new Uint8Array(2);
    header[0] = packetIndex & 0xff;
    header[1] = packetTotal & 0xff;
    const packet = new Uint8Array(header.length + payload.length);
    packet.set(header, 0);
    packet.set(payload, header.length);

    let lastErr;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        await this._writeRaw(packet);
        onProgress?.({ packetIndex, packetTotal, attempt });
        return true;
      } catch (e) {
        lastErr = e;
        this.log(`Packet ${packetIndex}/${packetTotal} retry ${attempt}/${MAX_RETRIES}…`);
        await new Promise((r) => setTimeout(r, 200 * attempt));
      }
    }
    throw lastErr || new Error(`Packet ${packetIndex} failed after ${MAX_RETRIES} retries`);
  }

  /**
   * Send firmware / data in 18-byte chunks with packet numbers (steps 4–5 in spec).
   */
  async transferPackets(data, onProgress) {
    const bytes = data instanceof Uint8Array ? data : new TextEncoder().encode(String(data));
    const totalPackets = Math.ceil(bytes.length / CHUNK_SIZE) || 1;
    const fileCrc = crc32(bytes);

    for (let i = 0; i < totalPackets; i++) {
      const start = i * CHUNK_SIZE;
      const chunk = bytes.subarray(start, Math.min(start + CHUNK_SIZE, bytes.length));
      const pct = Math.floor(((i + 1) / totalPackets) * 90);
      onProgress?.({
        percent: pct,
        message: `Packet ${i + 1} of ${totalPackets}`,
        packetIndex: i + 1,
        packetTotal: totalPackets,
        stage: 'flashing',
      });
      await this.writePacket(chunk, i + 1, totalPackets);
    }

    onProgress?.({ percent: 95, message: 'Verifying checksum…', stage: 'verifying' });
    const crcBuf = new Uint8Array(4);
    new DataView(crcBuf.buffer).setUint32(0, fileCrc, true);
    await this.writePacket(crcBuf, totalPackets + 1, totalPackets + 1);

    onProgress?.({ percent: 100, message: 'Transfer complete', stage: 'completed' });
    return { success: true, fileCrc };
  }

  async _writeRaw(bytes) {
    for (let i = 0; i < bytes.length; i += 20) {
      const chunk = bytes.subarray(i, Math.min(i + 20, bytes.length));
      if (this.rxChar.properties.writeWithoutResponse) {
        await this.rxChar.writeValueWithoutResponse(chunk);
      } else {
        await this.rxChar.writeValue(chunk);
      }
      if (i + 20 < bytes.length) await new Promise((r) => setTimeout(r, 25));
    }
  }

  /** Bridge protocol: send text and wait for \\x04 ack in TX notify. */
  async writeWithAck(text, timeoutMs = 8000) {
    const enc = new TextEncoder();
    const data = typeof text === 'string' ? enc.encode(text) : text;
    await this._writeRaw(data);

    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      try {
        const note = await this.reader.read(Math.min(2000, deadline - Date.now()));
        const decoded = new TextDecoder().decode(note);
        if (decoded.includes('\x04')) return true;
      } catch {
        /* keep waiting */
      }
    }
    return false;
  }

  async ping() {
    return this.writeWithAck('ping()\x04', 8000);
  }

  /** Send a REPL/bridge command (appends \\x04 if missing). */
  async sendCommand(text, timeoutMs = 8000) {
    const payload = String(text).endsWith('\x04') ? String(text) : `${text}\x04`;
    return this.writeWithAck(payload, timeoutMs);
  }

  async writeBytes(data) {
    return this._writeRaw(data instanceof Uint8Array ? data : new TextEncoder().encode(String(data)));
  }

  onNotify(handler) {
    const wrapped = (ev) => handler(ev);
    this.txChar.addEventListener('characteristicvaluechanged', wrapped);
    return () => this.txChar.removeEventListener('characteristicvaluechanged', wrapped);
  }

  disconnect() {
    this.reader?.dispose();
    this.reader = null;
    this._rssiStop?.();
    this._rssiStop = null;
    try {
      this.device?.gatt?.disconnect();
    } catch {
      /* */
    }
  }
}

/** Connect for Run (NUS bridge) — returns connection handles for RobotPanel. */
export async function connectMicrobitUart(log = () => {}) {
  const uart = new MicrobitBleUart(log);
  await uart.connect();
  return uart;
}

export default {
  MicrobitBleUart,
  BleNotifyReader,
  NUS_B5A3,
  NUS_B5B3,
  requestMicrobitBleDevice,
  connectMicrobitUart,
  crc32,
  rssiToBars,
  formatSignalBars,
};
