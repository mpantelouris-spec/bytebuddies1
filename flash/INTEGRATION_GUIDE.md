# Micro:bit Flashing System — Complete Integration Guide

This guide covers the production-ready micro:bit flashing system with support for Windows, macOS, Linux, WebUSB, Bluetooth LE, and Electron desktop integration.

## Overview

The system is organized into modular components:

- **hexUtils.js** — Intel HEX parsing, validation, chunking, merging
- **microbitDetector.js** — USB device detection (WebUSB), Bluetooth device discovery
- **usbFlash.js** — Native USB drag-and-drop flashing (Electron/Node.js)
- **webusbFlash.js** — WebUSB flashing via DAPLink protocol
- **bleFlash.js** — Bluetooth LE partial flashing (MakeCode-compatible)
- **daplinkManager.js** — DAPLink protocol handler with retry logic
- **deviceManager.js** — Unified device tracking, state management, reconnection handling
- **flashingManager.js** — High-level flashing orchestrator with automatic fallback
- **progressManager.js** — Serial queue and progress normalization
- **index.js** — Main exports and legacy MicrobitFlashCoordinator

## Quick Start

### Browser-based (WebUSB + BLE)

```javascript
import { getFlashingManager } from './flash/index.js';

const flasher = getFlashingManager();

// Flash with automatic method selection
const result = await flasher.flash(hexString, {
  onProgress: (evt) => {
    console.log(`${evt.percent}% — ${evt.message}`);
  },
});

console.log('Flash result:', result);
// { success: true, method: 'webusb' }
```

### Electron Desktop (USB + WebUSB + Fallback)

```javascript
import { getFlashingManager } from './flash/index.js';

const flasher = getFlashingManager();

const result = await flasher.flash(hexString, {
  method: 'auto', // Auto-selects USB MSD, then WebUSB, then download
  onProgress: ({ percent, message, stage }) => {
    console.log(`[${stage}] ${percent}% — ${message}`);
  },
});
```

## Device Management

### Real-time Device Monitoring

```javascript
import { getDeviceManager } from './flash/index.js';

const deviceManager = getDeviceManager();

// Listen for device changes
deviceManager.on('device-added', (device) => {
  console.log('Device connected:', device);
});

deviceManager.on('device-removed', (device) => {
  console.log('Device disconnected:', device);
});

// Start monitoring (USB volumes + WebUSB + BLE)
await deviceManager.startMonitoring();

// Get list of connected devices
const devices = await deviceManager.getConnectedDevices();
console.log('Connected devices:', devices);

// Get healthy devices (low error count)
const healthy = await deviceManager.getHealthyDevices();

// Stop monitoring
deviceManager.stopMonitoring();
```

### Device States

Devices move through states during the flash process:

```javascript
import { DEVICE_STATES } from './flash/index.js';

// DISCONNECTED, CONNECTING, CONNECTED, FLASHING, VERIFYING, COMPLETED, FAILED
```

### Waiting for Reconnection

```javascript
// Wait for a device to reconnect within 30 seconds
const device = await deviceManager.waitForDevice(null, 30000);
```

## Advanced Usage

### USB Drag-and-Drop Flashing (Electron Only)

```javascript
import { detectMicrobitDrives, flashHexToDrive } from './flash/index.js';

// Detect connected micro:bits
const drives = await detectMicrobitDrives();
// [{ path: '/Volumes/MICROBIT', name: 'MICROBIT', platform: 'darwin' }]

// Flash to specific drive
const result = await flashHexToDrive(hexString, drives[0].path, {
  filename: 'program.hex',
  onProgress: (evt) => {
    console.log(`${evt.percent}% — ${evt.message}`);
  },
});

// Watch for drive changes
const stopWatching = watchMicrobitVolumes({
  onChange: (drives) => {
    console.log('Drives changed:', drives);
  },
  intervalMs: 1500,
});

// Later: stopWatching();
```

### WebUSB Flashing with Manual Device Selection

```javascript
import { WebUSBFlasher, requestWebUSBMicrobit } from './flash/index.js';

const device = await requestWebUSBMicrobit();
const flasher = new WebUSBFlasher(onProgress);

const result = await flasher.flash(hexString, device, {
  webUsbBoard: 'v2', // 'v1' or 'v2'
});
```

### BLE Flashing (V2 Only, MakeCode Hex)

```javascript
import { BLEFlasher, canPartialFlashOverBle } from './flash/index.js';

// Check if HEX supports BLE flashing
if (!canPartialFlashOverBle(hexString)) {
  console.error('HEX not compatible with BLE');
  throw new Error('Use WebUSB or USB drag-and-drop instead');
}

const device = await navigator.bluetooth.requestDevice({
  filters: [{ namePrefix: 'BBC micro:bit' }],
});

const flasher = new BLEFlasher(onProgress);
const result = await flasher.flash(hexString, device);
```

### Intel HEX Utilities

```javascript
import {
  parseHex,
  validateHex,
  chunkHex,
  prepareHexForDapLinkWebUSB,
  sanitizeHexForWebUSB,
  getHexInfo,
} from './flash/index.js';

// Parse Intel HEX file
const parsed = parseHex(hexString);
console.log('Records:', parsed.records.length);
console.log('Valid:', parsed.isValid);
console.log('Errors:', parsed.errors);

// Validate with warnings
const validation = validateHex(hexString);
console.log('Valid:', validation.isValid);
console.log('Warnings:', validation.warnings);
console.log('Size:', validation.size);

// Chunk into blocks (for BLE transfer)
const blocks = chunkHex(hexString, 512); // 512 byte blocks
blocks.forEach((block, i) => {
  console.log(`Block ${i}: address 0x${block.address.toString(16)}, size ${block.size}`);
});

// Prepare for DAPLink WebUSB
const cleaned = prepareHexForDapLinkWebUSB(hexString, { board: 'v2' });

// Get file info
const info = getHexInfo(hexString);
console.log('Size:', info.size);
console.log('Data records:', info.dataRecords);
```

## Error Handling

### Automatic Retry and Recovery

The system includes built-in retry logic with exponential backoff:

```javascript
const result = await flasher.flash(hexString, {
  // Automatically retries up to 3 times on transient failures
  // Falls back to download if WebUSB fails
  // Detects device disconnection and prompts for reconnection
});
```

### Error Recovery Strategies

| Error | Recovery |
|-------|----------|
| WebUSB "Flash error" | Eject drive, unplug/replug, retry or use USB copy |
| BLE timeout | Move closer to device, use pairing mode, try USB instead |
| Device disconnected | Wait for reconnection, auto-resume if within timeout |
| Drive not found | Plug in device, wait for mount, retry |
| Invalid HEX | Regenerate firmware, check HEX validation |

### Handling Specific Errors

```javascript
try {
  await flasher.flash(hexString, { method: 'webusb' });
} catch (e) {
  if (e.message.includes('Flash error')) {
    console.error('DAPLink rejected firmware — try USB copy');
    await flasher.flash(hexString, { method: 'usb-msd' });
  } else if (e.message.includes('NotFoundError')) {
    console.error('Device selection cancelled by user');
  } else if (e.message.includes('NetworkError')) {
    console.error('Device disconnected during flash');
  }
}
```

## Platform Support

### Windows
- ✅ USB drag-and-drop (MICROBIT: drive)
- ✅ WebUSB (Chrome, Edge, Opera)
- ✅ BLE (if Bluetooth adapter present)
- ✅ Download fallback

### macOS
- ✅ USB drag-and-drop (/Volumes/MICROBIT)
- ✅ WebUSB (Chrome, Edge, Opera)
- ✅ BLE
- ✅ Download fallback

### Linux
- ✅ USB drag-and-drop (/media, /run/media)
- ✅ WebUSB (Chrome, Edge, Opera, Chromium)
- ✅ BLE
- ✅ Download fallback

## Hardware Support

- ✅ BBC micro:bit V1 (USB MSD, WebUSB)
- ✅ BBC micro:bit V2 (USB MSD, WebUSB, BLE partial)
- ✅ Compatible with DAPLink/CMSIS-DAP devices

## Browser Requirements

| Feature | Chrome | Edge | Firefox | Safari |
|---------|--------|------|---------|--------|
| WebUSB | ✅ | ✅ | ❌ | ❌ |
| Web Bluetooth | ✅ | ✅ | ❌ | ⚠️ |
| Download | ✅ | ✅ | ✅ | ✅ |

## Best Practices

### 1. Always Validate HEX Before Flashing

```javascript
const info = getHexInfo(hexString);
if (!info.valid) {
  throw new Error(`Invalid HEX: ${info.errors.join(', ')}`);
}
```

### 2. Use Device Manager for User-Facing Apps

```javascript
const deviceManager = getDeviceManager();
await deviceManager.startMonitoring();

// UI updates based on device state
deviceManager.on('device-added', updateDeviceList);
deviceManager.on('device-removed', updateDeviceList);
```

### 3. Show Progress to Users

```javascript
await flasher.flash(hexString, {
  onProgress: ({ percent, message, stage }) => {
    // Update UI with progress
    progressBar.value = percent;
    statusText.innerText = message;
    
    // Adjust UI based on stage
    if (stage === 'connecting') {
      showSpinner();
    } else if (stage === 'flashing') {
      showProgressBar();
    } else if (stage === 'completed') {
      showSuccessMessage();
    }
  },
});
```

### 4. Handle Long Operations

```javascript
// Timeout user if flashing takes too long
const timeoutId = setTimeout(() => {
  alert('Flashing taking longer than expected. Check device connection.');
}, 120000); // 2 minutes

try {
  await flasher.flash(hexString);
} finally {
  clearTimeout(timeoutId);
}
```

### 5. Electron Desktop Apps

```javascript
// In main.mjs
import { watchMicrobitVolumes } from './flash/index.js';

// Monitor drives for UI updates
const stopWatching = watchMicrobitVolumes({
  onChange: (drives) => {
    mainWindow.webContents.send('drives-updated', drives);
  },
});

// Cleanup on quit
app.on('window-all-closed', () => {
  stopWatching();
  app.quit();
});
```

## Testing

### Unit Testing HEX Utilities

```javascript
import { validateHex, parseHex } from './flash/index.js';

describe('HEX Utilities', () => {
  it('validates correct Intel HEX', () => {
    const hex = ':020000040000FA\r\n:00000001FF\r\n';
    const result = validateHex(hex);
    expect(result.isValid).toBe(true);
  });

  it('detects invalid checksums', () => {
    const hex = ':020000040000FB\r\n'; // Bad checksum
    const parsed = parseHex(hex);
    expect(parsed.isValid).toBe(false);
  });
});
```

### Integration Testing Flash Flow

```javascript
// Use a mock WebUSB device
const mockDevice = {
  vendorId: 0x0d28,
  productId: 0x0214,
  productName: 'BBC micro:bit',
};

const flasher = new WebUSBFlasher(onProgress);
// Test without real device connection
```

## Performance Notes

- **USB MSD**: 5-30 seconds (depends on file size, USB speed)
- **WebUSB**: 10-45 seconds (includes handshake, flashing, verification)
- **BLE**: 30-120 seconds (wireless, higher latency)
- **Download**: <1 second (user must manually copy to drive)

## Troubleshooting

### WebUSB Not Working
1. Use Chrome, Edge, Opera, or Chromium-based browser
2. Check USB cable is connected
3. Try unplugging and replugging the device
4. Clear browser cache and reload page

### BLE Connection Issues
1. Put device in pairing mode (hold A+B, tap reset)
2. Move closer to device (2-3 meters)
3. Disable other Bluetooth connections
4. Restart Bluetooth on computer

### USB Drive Not Detected (Electron)
1. Check System Settings > Removable Media
2. Verify drive appears in Finder/File Explorer
3. Try different USB port
4. Check DETAILS.TXT exists on drive

## License

These flashing utilities are designed for BBC micro:bit educational use.

## References

- [DAPjs Library](https://github.com/ARMmbed/dapjs)
- [BBC micro:bit Python](https://microbit-micropython.readthedocs.io/)
- [WebUSB API](https://wicg.github.io/webusb/)
- [Web Bluetooth API](https://webbluetoothcg.github.io/web-bluetooth/)
