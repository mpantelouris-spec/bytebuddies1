# Micro:bit Flashing System

Production-ready flashing for BBC micro:bit V1 and V2 with **USB drag-and-drop**, **WebUSB**, **Bluetooth LE**, and **automatic fallback**.

## Features

✅ **USB Drag-and-Drop** — Copy .hex to MICROBIT drive (macOS, Windows, Linux)
✅ **WebUSB Flashing** — Direct USB programming via DAPLink (Chrome, Edge, Opera)
✅ **Bluetooth LE** — Wireless partial flashing for V2 (MakeCode-compatible hex)
✅ **Automatic Fallback** — USB → WebUSB → Download if needed
✅ **Device Monitoring** — Real-time detection of connected devices
✅ **Progress Tracking** — Detailed stage-based progress reporting
✅ **Retry & Recovery** — Automatic reconnection and error recovery
✅ **Cross-Platform** — Windows, macOS, Linux
✅ **Electron Support** — Native USB integration for desktop apps
✅ **Intel HEX Utilities** — Parse, validate, chunk, merge hex files

## Architecture

```
flash/
├── hexUtils.js           # Intel HEX parsing/validation/chunking
├── microbitDetector.js   # USB/BLE device discovery
├── usbFlash.js          # Electron USB drive flashing
├── webusbFlash.js       # WebUSB wrapper
├── bleFlash.js          # BLE partial flashing
├── daplinkManager.js    # DAPLink protocol
├── deviceManager.js     # Unified device tracking
├── flashingManager.js   # High-level orchestrator
├── progressManager.js   # Serial queue
└── index.js            # Main exports
```

## Installation

Already integrated into your project. Uses:
- `dapjs` (v2.3.0) — DAPLink protocol
- `@microbit/microbit-universal-hex` (v0.2.2) — Universal hex handling
- `@microbit/microbit-fs` (v0.10.0) — Filesystem operations

## Quick Start

### Browser (One-Click Flash)

```javascript
import { getFlashingManager } from './flash/index.js';

const flasher = getFlashingManager();
await flasher.flash(hexString, {
  onProgress: ({ percent, message, stage }) => {
    console.log(`${stage}: ${percent}% — ${message}`);
  },
});
```

### Electron Desktop

```javascript
// Automatically uses USB drive if available
const result = await flasher.flash(hexString, {
  method: 'auto', // USB → WebUSB → Download
});
```

### Device Monitoring

```javascript
import { getDeviceManager } from './flash/index.js';

const dm = getDeviceManager();
await dm.startMonitoring();

dm.on('device-added', (device) => {
  console.log('Device connected:', device.name);
});

dm.on('device-removed', (device) => {
  console.log('Device disconnected:', device.name);
});
```

## Core Classes

### FlashingManager

```javascript
const fm = getFlashingManager();

// Flash with auto method selection
await fm.flash(hexString, {
  method: 'auto',        // 'auto' | 'usb-msd' | 'webusb' | 'ble' | 'download'
  deviceId: null,        // Optional specific device
  onProgress: (evt) => {},
  board: 'v2',          // WebUSB: 'v1' | 'v2'
});

// Check flashing status
if (fm.isFlashing()) {
  console.log('Currently flashing...');
}

// Get last progress
const progress = fm.getFlashProgress();
```

### DeviceManager

```javascript
const dm = getDeviceManager();

// Start/stop monitoring
await dm.startMonitoring();
dm.stopMonitoring();

// Get devices
const allConnected = await dm.getConnectedDevices();
const healthy = await dm.getHealthyDevices();
const device = dm.getDeviceById('device-id');

// Track device state
dm.updateDeviceState('device-id', 'flashing');
dm.recordDeviceError('device-id');
dm.clearDeviceErrors('device-id');

// Wait for device
const device = await dm.waitForDevice(null, 30000); // 30s timeout

// Listen for changes
dm.on('device-added', (device) => {});
dm.on('device-removed', (device) => {});
dm.on('device-changed', (device) => {});
```

## USB Flashing (Electron)

```javascript
import { detectMicrobitDrives, flashHexToDrive, watchMicrobitVolumes } from './flash/index.js';

// Detect connected drives
const drives = await detectMicrobitDrives();
// [{ path: '/Volumes/MICROBIT', name: 'MICROBIT', platform: 'darwin' }]

// Flash to drive
const result = await flashHexToDrive(hexString, drives[0].path, {
  filename: 'program.hex',
  onProgress: (evt) => {
    console.log(`${evt.percent}% — ${evt.message}`);
  },
});

// Monitor for changes
const stopWatching = watchMicrobitVolumes({
  onChange: (drives) => {
    console.log('Drives changed:', drives);
  },
  intervalMs: 1500,
});

stopWatching(); // Later
```

## WebUSB Flashing

```javascript
import { WebUSBFlasher, requestWebUSBMicrobit } from './flash/index.js';

// Request device
const device = await requestWebUSBMicrobit();

// Flash
const flasher = new WebUSBFlasher(onProgress);
const result = await flasher.flash(hexString, device, {
  webUsbBoard: 'v2', // For universal hex
});
```

## BLE Flashing

```javascript
import { BLEFlasher, canPartialFlashOverBle } from './flash/index.js';

// Check compatibility
if (!canPartialFlashOverBle(hexString)) {
  throw new Error('HEX not compatible with BLE');
}

// Request device
const device = await navigator.bluetooth.requestDevice({
  filters: [{ namePrefix: 'BBC micro:bit' }],
});

// Flash
const flasher = new BLEFlasher(onProgress);
const result = await flasher.flash(hexString, device);
```

## HEX Utilities

```javascript
import {
  parseHex,
  validateHex,
  getHexInfo,
  chunkHex,
  prepareHexForDapLinkWebUSB,
  canPartialFlashOverBle,
  bufferToHex,
  mergeHex,
} from './flash/index.js';

// Parse
const parsed = parseHex(hexString);
console.log(parsed.isValid, parsed.records.length);

// Validate
const validation = validateHex(hexString);
console.log(validation.isValid, validation.errors, validation.warnings);

// Get info
const info = getHexInfo(hexString);
console.log(info.size, info.dataRecords);

// Chunk for transfer
const blocks = chunkHex(hexString, 512);

// Prepare for WebUSB
const cleaned = prepareHexForDapLinkWebUSB(hexString, { board: 'v2' });

// Check BLE support
const supported = canPartialFlashOverBle(hexString);

// Convert buffer to hex
const hex = bufferToHex(buffer, 0x0000);

// Merge hex files
const merged = mergeHex(primaryHex, overlayHex);
```

## Error Handling

The system automatically retries on transient failures:
- WebUSB device not responding → retry with backoff
- Device disconnected → wait for reconnection
- BLE timeout → move closer, retry
- Flash error → fallback to next method

```javascript
try {
  await flasher.flash(hexString);
} catch (e) {
  if (e.message.includes('Flash error')) {
    // DAPLink rejected firmware
    console.error('Try USB drag-and-drop instead');
  } else if (e.message.includes('NotFoundError')) {
    // User cancelled device selection
    console.error('Device selection cancelled');
  }
}
```

## Progress Events

```javascript
// Stage types: connecting, preparing, flashing, verifying, finalizing, completed, failed
onProgress?.({
  percent: 45,                    // 0-100
  message: 'Programming flash…',
  stage: 'flashing',              // Current phase
});
```

## Platform Support

| Platform | USB | WebUSB | BLE | Notes |
|----------|-----|--------|-----|-------|
| Windows | ✅ | ✅ | ✅ | MICROBIT: drive |
| macOS | ✅ | ✅ | ✅ | /Volumes/MICROBIT |
| Linux | ✅ | ✅ | ✅ | /media or /run/media |

## Browser Support

| Feature | Chrome | Edge | Firefox | Safari |
|---------|--------|------|---------|--------|
| WebUSB | ✅ | ✅ | ❌ | ❌ |
| BLE | ✅ | ✅ | ❌ | ⚠️ |
| Download | ✅ | ✅ | ✅ | ✅ |

## Device States

```javascript
import { DEVICE_STATES } from './flash/index.js';

// DISCONNECTED, CONNECTING, CONNECTED, FLASHING, VERIFYING, COMPLETED, FAILED
```

## Documentation

- **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** — Complete reference
- **[EXAMPLES.md](./EXAMPLES.md)** — 10 practical examples

## Performance

- **USB MSD**: 5-30 seconds
- **WebUSB**: 10-45 seconds
- **BLE**: 30-120 seconds
- **Download**: <1 second

## Dependencies

- **dapjs** — DAPLink protocol
- **@microbit/microbit-universal-hex** — V1+V2 hex handling
- **@microbit/microbit-fs** — Filesystem operations
- **Electron** (optional) — Desktop integration

## License

Built for BBC micro:bit educational use. Compatible with MakeCode, MicroPython, and CircuitPython.

## Troubleshooting

**WebUSB not working?**
→ Use Chrome, Edge, or Opera. Try unplugging and replugging device.

**BLE connection lost?**
→ Move closer to device, put it in pairing mode, try USB instead.

**USB drive not detected?**
→ Check drive appears in Finder/File Explorer. Verify DETAILS.TXT exists.

**"Flash error" from DAPLink?**
→ Eject drive, unplug/replug, close other browser tabs using device.

See **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)** for complete troubleshooting.
