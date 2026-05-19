/**
 * Strict hex validation matching MakeCode's requirements
 * Prevents DAPLink failures by validating address order
 */

import { parseHex } from './hexUtils.js';

/**
 * Validate hex has addresses in incremental order (CRITICAL for DAPLink)
 * DAPLink FAILS if addresses jump backwards!
 */
function validateAddressOrder(records) {
  let lastAddress = -1;

  for (const record of records) {
    if (record.type === 0x00) { // DATA record
      const currentAddress = record.absoluteAddress;

      // Check for backwards jump
      if (currentAddress < lastAddress) {
        return {
          valid: false,
          error: `Address jump backwards at line ${record.line}: 0x${currentAddress.toString(16)} < 0x${lastAddress.toString(16)}. DAPLink will reject this!`,
          address: currentAddress,
          lastAddress,
        };
      }

      // Warn about large gaps (might indicate corruption)
      const gap = currentAddress - lastAddress;
      if (gap > 1024 * 100) { // 100KB gap
        console.warn(`⚠️ Large address gap: 0x${lastAddress.toString(16)} → 0x${currentAddress.toString(16)} (${gap} bytes)`);
      }

      lastAddress = currentAddress + record.byteCount;
    }
  }

  return { valid: true };
}

/**
 * Comprehensive hex validation (stricter than basic validation)
 */
export function validateHexStrict(hexString) {
  const basic = parseHex(hexString);

  // Check basic validity
  if (!basic.isValid) {
    return {
      valid: false,
      errors: basic.errors,
      critical: true,
      reason: 'Hex parsing failed',
    };
  }

  // Check address order (CRITICAL - DAPLink requirement)
  const addressCheck = validateAddressOrder(basic.records);
  if (!addressCheck.valid) {
    return {
      valid: false,
      errors: [addressCheck.error],
      critical: true,
      reason: 'Address order violation',
    };
  }

  // Check file size (size = actual data bytes, not address span)
  const size = basic.size;
  // After separating a universal hex, a single-board MicroPython hex is ~250–900 KB.
  // Allow up to 2 MB to cover universal hex (both boards) passed through unreduced.
  const MAX_HEX_BYTES = 2 * 1024 * 1024; // 2 MB actual data bytes

  const warnings = [];

  if (size === 0) {
    return { valid: false, errors: ['Hex file is empty'], critical: true };
  }

  if (size > MAX_HEX_BYTES) {
    return { valid: false, errors: [`Hex file too large: ${(size / 1024).toFixed(1)} KB data`], critical: true };
  }

  // Detect universal hex by presence of 0x0A board-ID records (not by size).
  // After separateUniversalHex() the 0x0A records are removed, so isUniversal=false is correct.
  const isUniversal = basic.records.some(r => r.type === 0x0A);
  if (isUniversal) {
    warnings.push('Hex contains universal hex board-ID records (0x0A) — consider separating before flashing');
  }

  // Check for ELA records (Extended Linear Address)
  const hasELA = basic.records.some(r => r.type === 0x04);
  if (!hasELA && size < 64 * 1024) {
    warnings.push('No extended addressing found, might be incomplete hex');
  }

  // Check for EOF record
  const hasEOF = basic.records.some(r => r.type === 0x01);
  if (!hasEOF) {
    warnings.push('Missing end-of-file record');
  }

  // Check data records
  if (basic.dataRecords.length === 0) {
    return { valid: false, errors: ['No data records found'], critical: true };
  }

  // Check for suspicious patterns
  const allFFs = basic.records.filter(r => r.type === 0x00).every(r => r.data.every(b => b === 0xFF));
  if (allFFs && basic.dataRecords.length > 0) {
    warnings.push('All data bytes are 0xFF (erased/blank)');
  }

  return {
    valid: true,
    size,
    isUniversal,
    dataRecords: basic.dataRecords.length,
    warnings,
    info: {
      sizeKB: (size / 1024).toFixed(1),
      sizeType: isUniversal ? 'universal' : 'single-board',
      recordCount: basic.records.length,
    },
  };
}

/**
 * Check if hex looks like it came from MicroPython fs.getUniversalHex()
 */
export function isMicroPythonUniversalHex(hexString) {
  const validation = validateHexStrict(hexString);

  if (!validation.valid) return { isMicroPython: false, reason: validation.errors[0] };

  // MicroPython universal hex should be ~1.8MB
  if (validation.size < 1.5 * 1024 * 1024 || validation.size > 2 * 1024 * 1024) {
    return {
      isMicroPython: false,
      reason: `Size ${(validation.size/1024/1024).toFixed(2)}MB doesn't match MicroPython universal (~1.8MB)`
    };
  }

  if (!validation.isUniversal) {
    return { isMicroPython: false, reason: 'Not a universal hex file' };
  }

  return {
    isMicroPython: true,
    reason: 'Matches MicroPython universal hex format',
    size: validation.size,
    info: validation.info,
  };
}

/**
 * Debug: Show hex structure
 */
export function debugHexStructure(hexString) {
  const parsed = parseHex(hexString);

  console.log('=== HEX Structure ===');
  console.log(`Total lines: ${parsed.records.length}`);
  console.log(`Data records: ${parsed.dataRecords.length}`);
  console.log(`Valid: ${parsed.isValid}`);
  console.log(`Size: ${(parsed.size / 1024).toFixed(1)}KB`);

  // Show address ranges
  let minAddr = Infinity;
  let maxAddr = -1;

  for (const record of parsed.records) {
    if (record.type === 0x00) {
      minAddr = Math.min(minAddr, record.absoluteAddress);
      maxAddr = Math.max(maxAddr, record.absoluteAddress + record.byteCount);
    }
  }

  if (minAddr !== Infinity) {
    console.log(`Address range: 0x${minAddr.toString(16)} → 0x${maxAddr.toString(16)}`);
    console.log(`Span: ${(maxAddr - minAddr) / 1024}KB`);
  }

  // Show first few records
  console.log('\nFirst 10 data records:');
  let count = 0;
  for (const record of parsed.records) {
    if (record.type === 0x00 && count < 10) {
      console.log(`  0x${record.absoluteAddress.toString(16).padStart(8, '0')}: ${record.byteCount} bytes`);
      count++;
    }
  }

  // Check for address issues
  console.log('\n=== Address Analysis ===');
  let lastAddr = -1;
  let issues = [];

  for (const record of parsed.records) {
    if (record.type === 0x00) {
      if (record.absoluteAddress < lastAddr) {
        issues.push(`⚠️ Address jump backwards: 0x${lastAddr.toString(16)} → 0x${record.absoluteAddress.toString(16)}`);
      }
      lastAddr = record.absoluteAddress + record.byteCount;
    }
  }

  if (issues.length === 0) {
    console.log('✅ Address order is correct (incremental)');
  } else {
    console.log('❌ Address order issues:');
    issues.forEach(i => console.log(i));
  }

  return { minAddr, maxAddr, issues };
}

export default {
  validateHexStrict,
  validateAddressOrder,
  isMicroPythonUniversalHex,
  debugHexStructure,
};
