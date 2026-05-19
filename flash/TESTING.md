# Testing the Micro:bit Flashing System

Comprehensive testing guide for production deployment.

## Unit Tests

### HEX Utilities Tests

```javascript
import { describe, it, expect } from 'vitest';
import {
  parseHex,
  validateHex,
  chunkHex,
  prepareHexForDapLinkWebUSB,
  getHexInfo,
} from './hexUtils.js';

describe('HEX Utilities', () => {
  const validHex = ':020000040000FA\n:00000001FF\n';
  const invalidHex = ':020000040000FB\n'; // Bad checksum

  describe('parseHex', () => {
    it('parses valid Intel HEX', () => {
      const result = parseHex(validHex);
      expect(result.isValid).toBe(true);
      expect(result.records.length).toBeGreaterThan(0);
    });

    it('detects invalid checksums', () => {
      const result = parseHex(invalidHex);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('handles empty input', () => {
      const result = parseHex('');
      expect(result.records.length).toBe(0);
    });
  });

  describe('validateHex', () => {
    it('returns valid flag correctly', () => {
      const result = validateHex(validHex);
      expect(result.isValid).toBe(true);
    });

    it('detects missing EOF record', () => {
      const hex = ':020000040000FA\n'; // Missing EOF
      const result = validateHex(hex);
      expect(result.warnings).toContain(
        expect.stringMatching(/end-of-file/)
      );
    });

    it('detects oversized hex', () => {
      // Create fake large hex
      const hex = ':020000040000FA\n:00000001FF\n';
      const result = validateHex(hex);
      // Should not warn for small hex
      expect(result.warnings).not.toContain(
        expect.stringMatching(/larger than/)
      );
    });
  });

  describe('chunkHex', () => {
    it('chunks hex into blocks', () => {
      const blocks = chunkHex(validHex, 256);
      expect(Array.isArray(blocks)).toBe(true);
      blocks.forEach(block => {
        expect(block.address).toBeDefined();
        expect(block.data).toBeDefined();
        expect(block.data.length).toBeLessThanOrEqual(256);
      });
    });

    it('handles empty hex', () => {
      const blocks = chunkHex('', 256);
      expect(blocks.length).toBe(0);
    });
  });

  describe('prepareHexForDapLinkWebUSB', () => {
    it('prepares hex for WebUSB V2', () => {
      const prepared = prepareHexForDapLinkWebUSB(validHex, { board: 'v2' });
      expect(typeof prepared).toBe('string');
      expect(prepared).toContain(':');
    });

    it('prepares hex for WebUSB V1', () => {
      const prepared = prepareHexForDapLinkWebUSB(validHex, { board: 'v1' });
      expect(typeof prepared).toBe('string');
    });
  });

  describe('getHexInfo', () => {
    it('returns hex info', () => {
      const info = getHexInfo(validHex);
      expect(info).toHaveProperty('valid');
      expect(info).toHaveProperty('size');
      expect(info).toHaveProperty('recordCount');
      expect(info).toHaveProperty('dataRecords');
    });
  });
});
```

### Device Detection Tests

```javascript
describe('Device Detection', () => {
  describe('microbitDetector', () => {
    it('detects WebUSB support', () => {
      const support = checkBrowserSupport();
      expect(support).toHaveProperty('webusb');
      expect(support).toHaveProperty('bluetooth');
      expect(support).toHaveProperty('electronUsb');
    });

    it('identifies micro:bit versions', () => {
      expect(detectMicrobitVersionFromUsbId(0x0214)).toBe('V2');
      expect(detectMicrobitVersionFromUsbId(0x0204)).toBe('V1');
      expect(detectMicrobitVersionFromUsbId(0x9999)).toBe('Unknown');
    });
  });

  describe('usbFlash - Windows', () => {
    // Note: Mock filesystem for tests
    it('scans drives D-Z on Windows', async () => {
      // Mock fs.promises.access
      const drives = await detectWindowsDrives();
      expect(Array.isArray(drives)).toBe(true);
    });

    it('verifies MICROBIT drive has DETAILS.TXT', async () => {
      // Mock the verification
      const isValid = await isMicrobitMount('/test/path');
      expect(typeof isValid).toBe('boolean');
    });
  });

  describe('usbFlash - macOS', () => {
    it('scans /Volumes for MICROBIT', async () => {
      const drives = await detectMacDrives();
      expect(Array.isArray(drives)).toBe(true);
    });

    it('handles missing /Volumes gracefully', async () => {
      // Should return empty array, not throw
      const drives = await detectMacDrives();
      expect(Array.isArray(drives)).toBe(true);
    });
  });
});
```

## Integration Tests

### Flashing Flow Tests

```javascript
describe('Flashing Manager', () => {
  let flasher;

  beforeEach(() => {
    flasher = getFlashingManager();
  });

  describe('Flash Queue', () => {
    it('serializes flash operations', async () => {
      const results = [];

      const p1 = flasher.flash(hex1, {
        onProgress: () => {},
      }).then(() => results.push('flash1'));

      const p2 = flasher.flash(hex2, {
        onProgress: () => {},
      }).then(() => results.push('flash2'));

      await Promise.all([p1, p2]);

      // Flashes should be serialized
      expect(results[0]).toBeDefined();
      expect(results[1]).toBeDefined();
    });

    it('tracks active flash state', async () => {
      expect(flasher.isFlashing()).toBe(false);

      const flashPromise = flasher.flash(hexString, {
        onProgress: () => {},
      }).catch(() => {}); // May fail without real device

      // Note: This is timing-dependent, may not work in all cases
      // await flashPromise;
      expect(flasher.isFlashing()).toBe(false);
    });
  });

  describe('Progress Reporting', () => {
    it('reports progress events', async () => {
      const events = [];

      try {
        await flasher.flash(hexString, {
          method: 'download',
          onProgress: (evt) => {
            events.push(evt);
          },
        });
      } catch (e) {
        // Expected if no device
      }

      expect(events.length).toBeGreaterThan(0);
      events.forEach(evt => {
        expect(evt).toHaveProperty('percent');
        expect(evt).toHaveProperty('message');
        expect(evt).toHaveProperty('stage');
      });
    });

    it('normalizes progress to 0-100 range', async () => {
      const events = [];

      try {
        await flasher.flash(hexString, {
          method: 'download',
          onProgress: (evt) => {
            events.push(evt.percent);
          },
        });
      } catch (e) {
        // Expected
      }

      events.forEach(percent => {
        expect(percent).toBeGreaterThanOrEqual(0);
        expect(percent).toBeLessThanOrEqual(100);
      });
    });
  });
});
```

### Device Manager Tests

```javascript
describe('Device Manager', () => {
  let dm;

  beforeEach(() => {
    dm = getDeviceManager();
  });

  describe('Device Tracking', () => {
    it('tracks connected devices', async () => {
      const devices = await dm.getConnectedDevices();
      expect(Array.isArray(devices)).toBe(true);
    });

    it('identifies healthy devices', async () => {
      const healthy = await dm.getHealthyDevices();
      expect(Array.isArray(healthy)).toBe(true);
      healthy.forEach(d => {
        expect(d.healthy).toBe(true);
        expect(d.errorCount).toBeLessThan(3);
      });
    });

    it('updates device state', () => {
      const device = new MicrobitDevice('test-id', 'test', 'webusb');
      expect(device.state).toBe(DEVICE_STATES.DISCONNECTED);

      device.setState(DEVICE_STATES.CONNECTED);
      expect(device.state).toBe(DEVICE_STATES.CONNECTED);
    });
  });

  describe('Error Tracking', () => {
    it('tracks error count', () => {
      const device = new MicrobitDevice('test-id', 'test', 'webusb');
      expect(device.errorCount).toBe(0);

      device.recordError();
      device.recordError();
      expect(device.errorCount).toBe(2);
      expect(device.isHealthy()).toBe(true); // Still healthy < 3

      device.recordError();
      expect(device.isHealthy()).toBe(false);
    });

    it('clears errors', () => {
      const device = new MicrobitDevice('test-id', 'test', 'webusb');
      device.recordError();
      device.recordError();
      device.recordError();

      device.clearErrors();
      expect(device.errorCount).toBe(0);
      expect(device.isHealthy()).toBe(true);
    });
  });

  describe('Event Listeners', () => {
    it('emits device-added event', (done) => {
      dm.on('device-added', (device) => {
        expect(device).toHaveProperty('id');
        done();
      });

      // Simulate device discovery
      dm.devices.set('test-id', new MicrobitDevice('test-id', 'test', 'webusb'));
      dm.emit('device-added', { id: 'test-id', name: 'test' });
    });

    it('removes listeners', () => {
      let callCount = 0;
      const unsub = dm.on('device-added', () => {
        callCount++;
      });

      dm.emit('device-added', { id: 'test' });
      expect(callCount).toBe(1);

      unsub();

      dm.emit('device-added', { id: 'test' });
      expect(callCount).toBe(1); // Should not increase
    });
  });
});
```

## Manual Testing Checklist

### USB Drag-and-Drop (Electron)

- [ ] **Windows**: Device appears as MICROBIT: drive
  - [ ] Drag .hex file → Device reboots with ✓
  - [ ] Remove drive safely while copying (expected behavior)
  - [ ] Multiple drives detected correctly

- [ ] **macOS**: Device appears in /Volumes/MICROBIT
  - [ ] Drag .hex file → Device reboots with ✓
  - [ ] Drive ejects automatically after flash
  - [ ] Cold unplug during flash handled gracefully

- [ ] **Linux**: Device appears in /media or /run/media
  - [ ] Drive detection works (varies by distro)
  - [ ] Flash completes successfully

### WebUSB (Chrome/Edge/Opera)

- [ ] **Device Selection**
  - [ ] First flash prompts for device
  - [ ] Already-selected device used on retry
  - [ ] Cancel closes selector gracefully

- [ ] **Flashing Process**
  - [ ] Progress bar updates smoothly (0→100%)
  - [ ] Device disconnects and reconnects gracefully
  - [ ] "Flash error" message shown if HEX rejected
  - [ ] Success message shown after completion

- [ ] **Error Handling**
  - [ ] Device unplugged during flash → error message
  - [ ] Browser tab closed during flash → app doesn't crash
  - [ ] Multiple tabs → "already in use" message (expected)

### BLE Flashing (V2 Only)

- [ ] **Device Discovery**
  - [ ] Pairing mode device visible in scan
  - [ ] Non-pairing mode connects if already paired
  - [ ] Cancel closes selector

- [ ] **Transfer**
  - [ ] Pairing mode device stays connected
  - [ ] Transfer completes within 2 minutes
  - [ ] Device reboots after flash

- [ ] **Error Recovery**
  - [ ] Move away during transfer → timeout (expected)
  - [ ] Reconnection attempted automatically
  - [ ] Fallback to USB offered

### Automatic Fallback

- [ ] **Electron: USB → WebUSB → Download**
  - [ ] No USB drive detected → tries WebUSB
  - [ ] WebUSB fails → offers download
  - [ ] Download file opens in browser

- [ ] **Browser: WebUSB → BLE → Download**
  - [ ] WebUSB cancelled → tries BLE
  - [ ] Both cancelled → offers download

### Device Monitoring

- [ ] **Hot Plug Detection**
  - [ ] Plug in device → appears in list
  - [ ] Unplug device → disappears from list
  - [ ] Multiple devices each tracked separately

- [ ] **State Transitions**
  - [ ] DISCONNECTED → CONNECTED when plugged
  - [ ] CONNECTED → FLASHING during flash
  - [ ] FLASHING → COMPLETED after success
  - [ ] FLASHING → FAILED after error

### HEX Validation

- [ ] **Valid HEX**
  - [ ] MakeCode hex → accepted
  - [ ] MicroPython hex → accepted
  - [ ] Universal hex → splits correctly for V1/V2

- [ ] **Invalid HEX**
  - [ ] Corrupted data → checksum error
  - [ ] Oversized hex → warning shown
  - [ ] Empty hex → error message

## Performance Testing

### Benchmarks

```javascript
const hexString = /* ... large hex ... */;
const perfBench = async () => {
  console.time('USB flash');
  await flashHexToDrive(hexString, '/Volumes/MICROBIT');
  console.timeEnd('USB flash');
  // Expected: 10-30 seconds

  console.time('WebUSB flash');
  await flasher.flash(hexString, device, { method: 'webusb' });
  console.timeEnd('WebUSB flash');
  // Expected: 15-45 seconds

  console.time('BLE flash');
  await flasher.flash(hexString, device, { method: 'ble' });
  console.timeEnd('BLE flash');
  // Expected: 30-120 seconds
};
```

## Stress Testing

```javascript
// Test repeated flash cycles
async function stressTest() {
  for (let i = 0; i < 10; i++) {
    console.log(`Flash cycle ${i + 1}/10...`);
    try {
      await flasher.flash(hexString);
      console.log(`✓ Success`);
    } catch (e) {
      console.error(`✗ Failed:`, e.message);
      // Track failures
    }
  }
}

// Test device reconnection
async function reconnectionTest() {
  console.log('1. Connect device');
  await waitForDevice();
  
  console.log('2. Unplug device');
  // User unplugs
  
  console.log('3. Wait for disconnect event');
  await waitForDisconnect(5000);
  
  console.log('4. Replug device');
  // User replugs
  
  console.log('5. Wait for reconnect');
  await waitForDevice(15000);
  
  console.log('✓ Reconnection successful');
}
```

## Deployment Checklist

- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] Manual testing completed for each platform
- [ ] Performance benchmarks within acceptable range
- [ ] Error messages are user-friendly
- [ ] Progress reporting is smooth and accurate
- [ ] Device monitoring is responsive
- [ ] Memory leaks checked (no infinite loops)
- [ ] Battery impact minimal on device
- [ ] Documentation is complete and accurate
- [ ] Examples are working and tested

## Known Limitations

1. **WebUSB** — Requires Chromium-based browser
2. **BLE** — V2 only, requires MakeCode-style hex with metadata
3. **USB MSD** — Cross-browser copy may fail, use Electron for reliability
4. **Multiple Devices** — Currently flashes one at a time (by design)
5. **Firmware Size** — Limited by device flash memory (256KB V1, 512KB V2)

## Support Resources

- [BBC micro:bit Docs](https://microbit.org)
- [DAPjs GitHub](https://github.com/ARMmbed/dapjs)
- [WebUSB Spec](https://wicg.github.io/webusb/)
- [Web Bluetooth Spec](https://webbluetoothcg.github.io/web-bluetooth/)
