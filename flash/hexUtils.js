/**
 * Intel HEX utilities for BBC micro:bit (V1 + V2 universal hex).
 */

import { isUniversalHex, separateUniversalHex, microbitBoardId as uhBoardId } from '@microbit/microbit-universal-hex';

// Re-export universal hex utilities so consumers can import from @flash/index.js
export { isUniversalHex, separateUniversalHex };
export const microbitBoardId = uhBoardId;

export const RECORD_TYPES = {
  DATA: 0x00,
  END_OF_FILE: 0x01,
  EXTENDED_SEGMENT_ADDRESS: 0x02,
  START_SEGMENT_ADDRESS: 0x03,
  EXTENDED_LINEAR_ADDRESS: 0x04,
  START_LINEAR_ADDRESS: 0x05,
};

const MAGIC_PARTIAL = '708E3B92C615A841C49866C975EE5197';
const MAGIC_EMBEDDED = '41140E2FB82FA2BB';

export function parseHexLine(line) {
  if (!line || !line.startsWith(':')) return null;
  const match = /^:([0-9A-Fa-f]{2})([0-9A-Fa-f]{4})([0-9A-Fa-f]{2})([0-9A-Fa-f]*)([0-9A-Fa-f]{2})$/.exec(line.trim());
  if (!match) return null;
  const byteCount = parseInt(match[1], 16);
  const address = parseInt(match[2], 16);
  const recordType = parseInt(match[3], 16);
  const dataHex = match[4];
  const checksum = parseInt(match[5], 16);
  if (dataHex.length !== byteCount * 2) return null;
  const data = [];
  for (let i = 0; i < dataHex.length; i += 2) {
    data.push(parseInt(dataHex.slice(i, i + 2), 16));
  }
  let sum = byteCount + (address >> 8) + (address & 0xff) + recordType;
  for (const byte of data) sum += byte;
  const calculatedChecksum = ((~sum) + 1) & 0xff;
  if (calculatedChecksum !== checksum) return null;
  return { byteCount, address, type: recordType, data, checksum, line };
}

export function parseHex(hexString) {
  const lines = String(hexString || '')
    .replace(/\r/g, '')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);
  const records = [];
  let ela = 0;
  const errors = [];
  for (let i = 0; i < lines.length; i++) {
    const record = parseHexLine(lines[i]);
    if (!record) {
      errors.push(`Line ${i + 1}: invalid or checksum error`);
      continue;
    }
    if (record.type === RECORD_TYPES.EXTENDED_LINEAR_ADDRESS) {
      ela = (record.data[0] << 8) | record.data[1];
    }
    record.ela = ela;
    record.absoluteAddress = (ela << 16) | record.address;
    records.push(record);
    if (record.type === RECORD_TYPES.END_OF_FILE) break;
  }
  return {
    records,
    isValid: errors.length === 0,
    errors,
    totalLines: lines.length,
    dataRecords: records.filter(r => r.type === RECORD_TYPES.DATA),
    size: calculateHexSize(records),
  };
}

function calculateHexSize(records) {
  // Use actual data bytes, not address span.
  // Address span is misleading for sparse hex files: V2 MicroPython has ~28 bytes of
  // NVM config at 0x10000000, which makes the address span ~268MB even though only
  // ~450KB of flash data is actually present.
  let totalBytes = 0;
  for (const record of records) {
    if (record.type === RECORD_TYPES.DATA) {
      totalBytes += record.byteCount;
    }
  }
  return totalBytes;
}

/**
 * Repair corrupted or out-of-order hex files by rebuilding them in proper address order.
 * Iterates over actual data addresses only — safe for sparse/universal hex.
 */
export function repairHex(hexString) {
  const { map } = buildAddressByteMap(hexString);

  if (map.size === 0) {
    return ':00000001FF\n';
  }

  // Sort only actual data addresses — never iterate over the full address range
  const sortedAddresses = [...map.keys()].sort((a, b) => a - b);

  const RECORD_SIZE = 32;
  const GAP_THRESHOLD = 256; // gaps ≤ this are filled with 0xFF within the same record run
  const lines = [];
  let currentEla = -1;
  let i = 0;

  while (i < sortedAddresses.length) {
    // Find end of this contiguous block
    let j = i + 1;
    while (j < sortedAddresses.length && sortedAddresses[j] - sortedAddresses[j - 1] <= GAP_THRESHOLD) {
      j++;
    }

    // Emit records for addresses[i..j-1]
    const blockStart = sortedAddresses[i];
    const blockEnd = sortedAddresses[j - 1] + 1;
    let pos = blockStart;

    while (pos < blockEnd) {
      const newEla = (pos >>> 16) & 0xFFFF;
      if (newEla !== currentEla) {
        currentEla = newEla;
        const elaData = [(newEla >>> 8) & 0xFF, newEla & 0xFF];
        lines.push(formatHexLine(0, 0x04, elaData));
      }

      const offset = pos & 0xFFFF;
      const data = [];
      while (data.length < RECORD_SIZE && pos < blockEnd) {
        data.push(map.has(pos) ? map.get(pos) : 0xFF);
        pos++;
        if ((pos & 0xFFFF) === 0) break; // don't cross 64KB boundary in one record
      }

      if (data.length > 0) {
        lines.push(formatHexLine(offset, 0x00, data));
      }
    }

    i = j;
  }

  lines.push(':00000001FF');
  return lines.join('\n');
}

/**
 * Format a single Intel HEX record line with checksum
 */
function formatHexLine(address, type, data) {
  const byteCount = data.length;
  const addr_hi = (address >>> 8) & 0xFF;
  const addr_lo = address & 0xFF;

  // Calculate checksum
  let sum = byteCount + addr_hi + addr_lo + type;
  for (const byte of data) {
    sum += byte;
  }
  const checksum = ((~sum) + 1) & 0xFF;

  // Build the line
  let line = ':';
  line += byteCount.toString(16).padStart(2, '0').toUpperCase();
  line += address.toString(16).padStart(4, '0').toUpperCase();
  line += type.toString(16).padStart(2, '0').toUpperCase();
  for (const byte of data) {
    line += byte.toString(16).padStart(2, '0').toUpperCase();
  }
  line += checksum.toString(16).padStart(2, '0').toUpperCase();

  return line;
}

export function validateHex(hexString) {
  const parsed = parseHex(hexString);
  return {
    isValid: parsed.isValid,
    errors: parsed.errors,
    warnings: validateHexContent(parsed),
    size: parsed.size,
    recordCount: parsed.records.length,
    dataRecords: parsed.dataRecords.length,
  };
}

function validateHexContent(parsed) {
  const warnings = [];
  if (parsed.size === 0) warnings.push('HEX file contains no data');
  if (parsed.size > 512 * 1024) warnings.push('HEX larger than typical micro:bit image');
  const hasEof = parsed.records.some(r => r.type === RECORD_TYPES.END_OF_FILE);
  if (!hasEof) warnings.push('Missing end-of-file record');
  return warnings;
}

export function buildAddressByteMap(hexString) {
  const parsed = parseHex(hexString);
  if (!parsed.isValid) {
    throw new Error(`Invalid HEX: ${parsed.errors.join('; ')}`);
  }
  const map = new Map();
  for (const record of parsed.dataRecords) {
    for (let i = 0; i < record.data.length; i++) {
      map.set(record.absoluteAddress + i, record.data[i]);
    }
  }
  return { map, parsed };
}

export function chunkHex(hexString, blockSize = 512) {
  const { map } = buildAddressByteMap(hexString);
  if (map.size === 0) return [];
  const addresses = [...map.keys()].sort((a, b) => a - b);
  const minAddress = addresses[0];
  const maxAddress = addresses[addresses.length - 1];
  const blocks = [];
  let blockStart = Math.floor(minAddress / blockSize) * blockSize;
  while (blockStart <= maxAddress) {
    const blockData = new Uint8Array(blockSize).fill(0xff);
    let hasData = false;
    for (let i = 0; i < blockSize; i++) {
      const addr = blockStart + i;
      if (map.has(addr)) {
        blockData[i] = map.get(addr);
        hasData = true;
      }
    }
    if (hasData) {
      blocks.push({ address: blockStart, data: blockData, size: blockSize });
    }
    blockStart += blockSize;
  }
  return blocks;
}

export function sanitizeHexForWebUSB(hexString) {
  const MAX_FLASH_ADDRESS = 0x00080000;
  const lines = String(hexString || '')
    .replace(/\r/g, '')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);
  const output = [];
  let currentEla = 0;
  let currentElaLine = ':020000040000FA';
  let emittedEla = null;
  for (const line of lines) {
    const match = /^:([0-9A-Fa-f]{2})([0-9A-Fa-f]{4})([0-9A-Fa-f]{2})([0-9A-Fa-f]*)[0-9A-Fa-f]{2}$/.exec(line);
    if (!match) continue;
    const byteCount = parseInt(match[1], 16);
    const offset = parseInt(match[2], 16);
    const recordType = parseInt(match[3], 16);
    if (recordType === 0x04) {
      if (match[4].length < 4) continue;
      currentEla = parseInt(match[4].slice(0, 4), 16);
      currentElaLine = line;
      continue;
    }
    // Keep standard metadata records — universal hex / DAPLink expect these (matches MakeCode-style filtering).
    if (recordType === 0x02 || recordType === 0x03 || recordType === 0x05) {
      output.push(line);
      continue;
    }
    if (recordType === 0x01) {
      continue;
    }
    if (recordType === 0x00) {
      const fullAddress = (currentEla << 16) | offset;
      if (fullAddress + byteCount > MAX_FLASH_ADDRESS) continue;
      if (emittedEla !== currentEla) {
        output.push(currentElaLine);
        emittedEla = currentEla;
      }
      output.push(line);
    }
  }
  output.push(':00000001FF');
  return output.join('\r\n') + '\r\n';
}

/**
 * DAPLink over WebUSB only accepts a **single-board** Intel HEX.
 * MicroPython `getUniversalHex()` wraps V1 + V2 — DAPLink rejects that with a generic "Flash error".
 * This extracts the image for the chosen hardware, then applies {@link sanitizeHexForWebUSB}.
 *
 * @param {string} hexString universal or plain Intel HEX
 * @param {{ board?: 'v1' | 'v2' }} [options]
 * @returns {string} sanitized Intel HEX for WebUSB
 */
export function prepareHexForDapLinkWebUSB(hexString, options = {}) {
  const board = options.board === 'v1' ? 'v1' : 'v2';
  let raw = String(hexString || '');
  try {
    if (isUniversalHex(raw)) {
      const parts = separateUniversalHex(raw);
      const wantId = board === 'v1' ? uhBoardId.V1 : uhBoardId.V2;
      const chosen =
        parts.find((p) => p.boardId === wantId) ||
        parts.find((p) => p.boardId === uhBoardId.V2) ||
        parts[0];
      if (chosen?.hex) raw = chosen.hex;
    }
  } catch (e) {
    console.warn('[prepareHexForDapLinkWebUSB] universal split failed, using raw hex:', e);
  }
  return sanitizeHexForWebUSB(raw);
}

export function calculateChecksum(byteCount, address, recordType, data) {
  let sum = byteCount + (address >> 8) + (address & 0xff) + recordType;
  for (const byte of data) sum += byte;
  return ((~sum) + 1) & 0xff;
}

export function bufferToHex(buffer, startAddress = 0) {
  const lines = [];
  const blockSize = 16;
  const elaHigh = (startAddress >> 16) & 0xffff;
  if (elaHigh > 0) {
    const elaData = [(elaHigh >> 8) & 0xff, elaHigh & 0xff];
    const elaChecksum = calculateChecksum(2, 0, 0x04, elaData);
    lines.push(
      `:02000004${elaData[0].toString(16).padStart(2, '0')}${elaData[1].toString(16).padStart(2, '0')}${elaChecksum.toString(16).padStart(2, '0')}`
    );
  }
  for (let i = 0; i < buffer.length; i += blockSize) {
    const chunk = [...buffer.slice(i, Math.min(i + blockSize, buffer.length))];
    const address = (startAddress + i) & 0xffff;
    const checksum = calculateChecksum(chunk.length, address, 0x00, chunk);
    let line = `:${chunk.length.toString(16).padStart(2, '0')}${address.toString(16).padStart(4, '0')}00`;
    for (const byte of chunk) line += byte.toString(16).padStart(2, '0');
    line += checksum.toString(16).padStart(2, '0');
    lines.push(line);
  }
  lines.push(':00000001FF');
  return lines.join('\r\n') + '\r\n';
}

export function mergeHex(primaryHex, overlayHex) {
  const a = buildAddressByteMap(primaryHex).map;
  const b = buildAddressByteMap(overlayHex).map;
  for (const [addr, val] of b) a.set(addr, val);
  if (a.size === 0) return ':00000001FF\n';
  const addrs = [...a.keys()].sort((x, y) => x - y);
  const min = addrs[0];
  const max = addrs[addrs.length - 1];
  const len = max - min + 1;
  const buf = new Uint8Array(len).fill(0xff);
  for (const [addr, val] of a) buf[addr - min] = val;
  return bufferToHex(buf, min);
}

export function getHexInfo(hexString) {
  const parsed = parseHex(hexString);
  const validation = validateHex(hexString);
  return {
    valid: parsed.isValid,
    size: parsed.size,
    recordCount: parsed.records.length,
    dataRecords: parsed.dataRecords.length,
    errors: parsed.errors,
    warnings: validation.warnings,
  };
}

export function canPartialFlashOverBle(hexString) {
  const h = String(hexString || '').toUpperCase();
  return h.includes(MAGIC_PARTIAL) && h.includes(MAGIC_EMBEDDED);
}

export function extractMakeCodePartialHashes(hexString) {
  const h = String(hexString || '').toUpperCase();
  const i = h.indexOf(MAGIC_PARTIAL);
  if (i < 0) return null;
  const after = h.slice(i + MAGIC_PARTIAL.length);
  const hexTemplate = after.slice(0, 16);
  const hexProgram = after.slice(16, 32);
  if (hexTemplate.length !== 16 || hexProgram.length !== 16) return null;
  return {
    templateHash: hexToBytes(hexTemplate),
    programHash: hexToBytes(hexProgram),
  };
}

function hexToBytes(s) {
  const out = new Uint8Array(s.length / 2);
  for (let i = 0; i < s.length; i += 2) {
    out[i / 2] = parseInt(s.slice(i, i + 2), 16);
  }
  return out;
}

export function extractPartialFlashPayload(hexString) {
  const { map } = buildAddressByteMap(hexString);
  const magic = hexToBytes(MAGIC_PARTIAL);
  const emb = hexToBytes(MAGIC_EMBEDDED);
  let magicAddr = -1;
  let embAddr = -1;
  const maxScan = 0x80000;
  for (let base = 0; base < maxScan - magic.length; base++) {
    let ok = true;
    for (let j = 0; j < magic.length; j++) {
      if ((map.get(base + j) ?? 0xff) !== magic[j]) {
        ok = false;
        break;
      }
    }
    if (ok) {
      magicAddr = base;
      break;
    }
  }
  if (magicAddr < 0) return null;
  for (let base = magicAddr; base < maxScan - emb.length; base++) {
    let ok = true;
    for (let j = 0; j < emb.length; j++) {
      if ((map.get(base + j) ?? 0xff) !== emb[j]) {
        ok = false;
        break;
      }
    }
    if (ok) {
      embAddr = base;
      break;
    }
  }
  if (embAddr < 0) return null;
  const pageSize = 1024;
  const endFlash = Math.floor(embAddr / pageSize) * pageSize;
  const len = Math.max(0, endFlash - magicAddr);
  const payload = new Uint8Array(len);
  for (let i = 0; i < len; i++) payload[i] = map.get(magicAddr + i) ?? 0xff;
  return { magicAddr, embAddr, payload };
}

export default {
  RECORD_TYPES,
  parseHex,
  parseHexLine,
  validateHex,
  chunkHex,
  mergeHex,
  sanitizeHexForWebUSB,
  prepareHexForDapLinkWebUSB,
  calculateChecksum,
  bufferToHex,
  getHexInfo,
  canPartialFlashOverBle,
  extractMakeCodePartialHashes,
  extractPartialFlashPayload,
  repairHex,
  isUniversalHex,
  separateUniversalHex,
  microbitBoardId,
};
