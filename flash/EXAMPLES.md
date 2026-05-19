# Micro:bit Flashing — Practical Examples

## Example 1: Simple One-Click Flash

The most basic usage for classroom/workshop apps:

```javascript
import { getFlashingManager } from './flash/index.js';

async function flashProgram(hexString) {
  const flasher = getFlashingManager();
  
  try {
    const result = await flasher.flash(hexString, {
      onProgress: (evt) => {
        console.log(`${evt.percent}% — ${evt.message}`);
      },
    });
    
    console.log('✓ Flash successful:', result.method);
    return true;
  } catch (e) {
    console.error('✗ Flash failed:', e.message);
    return false;
  }
}
```

## Example 2: React Component with Progress Bar

```javascript
import React, { useState } from 'react';
import { getFlashingManager } from './flash/index.js';

export function FlashButton({ hexString }) {
  const [isFlashing, setIsFlashing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');

  const handleFlash = async () => {
    setIsFlashing(true);
    setProgress(0);
    const flasher = getFlashingManager();

    try {
      await flasher.flash(hexString, {
        onProgress: (evt) => {
          setProgress(evt.percent);
          setMessage(evt.message);
        },
      });
      setMessage('✓ Flash complete!');
    } catch (e) {
      setMessage(`✗ Error: ${e.message}`);
    } finally {
      setIsFlashing(false);
    }
  };

  return (
    <div>
      <button onClick={handleFlash} disabled={isFlashing}>
        {isFlashing ? 'Flashing...' : 'Flash Program'}
      </button>
      <progress value={progress} max="100" />
      <p>{message}</p>
    </div>
  );
}
```

## Example 3: Device List with Live Updates

```javascript
import React, { useEffect, useState } from 'react';
import { getDeviceManager } from './flash/index.js';

export function DeviceList() {
  const [devices, setDevices] = useState([]);
  const deviceManager = getDeviceManager();

  useEffect(() => {
    // Start monitoring
    deviceManager.startMonitoring();

    // Listen for changes
    const unsubAdd = deviceManager.on('device-added', () => updateList());
    const unsubRemove = deviceManager.on('device-removed', () => updateList());

    const updateList = async () => {
      const connected = await deviceManager.getConnectedDevices();
      setDevices(connected);
    };

    updateList();

    return () => {
      unsubAdd();
      unsubRemove();
      deviceManager.stopMonitoring();
    };
  }, []);

  return (
    <div>
      <h2>Connected Devices</h2>
      {devices.length === 0 ? (
        <p>No devices found. Plug in your micro:bit.</p>
      ) : (
        <ul>
          {devices.map((device) => (
            <li key={device.id}>
              <strong>{device.name}</strong> ({device.type}) — {device.state}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## Example 4: Electron Desktop App

Main process (`electron/main.mjs`):

```javascript
import { app, BrowserWindow, ipcMain } from 'electron';
import { watchMicrobitVolumes, flashHexToDrive } from '../flash/index.js';

let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    webPreferences: {
      preload: './electron/preload.mjs',
      contextIsolation: true,
    },
  });

  mainWindow.loadFile('dist/index.html');
});

ipcMain.handle('flash:program', async (event, { hexString }) => {
  const drives = await detectMicrobitDrives();
  if (!drives.length) {
    throw new Error('No MICROBIT drive found');
  }

  return new Promise((resolve, reject) => {
    flashHexToDrive(hexString, drives[0].path, {
      onProgress: (progress) => {
        event.sender.send('flash:progress', progress);
      },
    }).then(resolve).catch(reject);
  });
});
```

Renderer process (React):

```javascript
import { ipcRenderer } from 'electron';

async function flashProgram(hexString) {
  ipcRenderer.on('flash:progress', (event, progress) => {
    updateProgressBar(progress.percent);
  });

  try {
    const result = await ipcRenderer.invoke('flash:program', { hexString });
    console.log('Flashed via:', result.method);
  } catch (e) {
    console.error(e);
  }
}
```

## Example 5: Fallback Strategy (Browser + Electron)

```javascript
import { getFlashingManager } from './flash/index.js';

export async function smartFlash(hexString) {
  const flasher = getFlashingManager();
  
  // Try different methods in order
  const methods = [
    { name: 'USB Drive', value: 'usb-msd' },
    { name: 'WebUSB', value: 'webusb' },
    { name: 'Bluetooth', value: 'ble' },
    { name: 'Download', value: 'download' },
  ];

  for (const method of methods) {
    try {
      console.log(`Trying ${method.name}...`);
      const result = await flasher.flash(hexString, {
        method: method.value,
        onProgress: (evt) => console.log(`${method.name}: ${evt.percent}%`),
      });
      console.log(`✓ Success via ${method.name}`);
      return result;
    } catch (e) {
      console.warn(`${method.name} failed:`, e.message);
      continue;
    }
  }

  throw new Error('All flash methods failed');
}
```

## Example 6: HEX File Validation

```javascript
import {
  validateHex,
  getHexInfo,
  prepareHexForDapLinkWebUSB,
} from './flash/index.js';

function validateAndPrepareHex(hexString) {
  // Check validity
  const validation = validateHex(hexString);
  if (!validation.isValid) {
    throw new Error(`Invalid HEX: ${validation.errors.join(', ')}`);
  }

  // Show warnings
  if (validation.warnings.length > 0) {
    console.warn('HEX warnings:', validation.warnings);
  }

  // Get info
  const info = getHexInfo(hexString);
  console.log(`HEX size: ${info.size} bytes`);

  // Prepare for WebUSB (board-specific)
  const webUsbHex = prepareHexForDapLinkWebUSB(hexString, { board: 'v2' });

  return {
    isValid: validation.isValid,
    warnings: validation.warnings,
    size: info.size,
    webUsbHex,
  };
}
```

## Example 7: BLE Flashing with Pairing Mode

```javascript
import { BLEFlasher, canPartialFlashOverBle } from './flash/index.js';

async function bleFlashWithGuide(hexString) {
  // Check HEX compatibility
  if (!canPartialFlashOverBle(hexString)) {
    alert('This program is not compatible with Bluetooth flashing.\n\n' +
          'Use WebUSB or drag-and-drop to the MICROBIT drive instead.');
    return;
  }

  // Ask user for pairing mode
  const userReady = confirm(
    'Put your micro:bit in pairing mode:\n\n' +
    '1. Hold buttons A and B together\n' +
    '2. Tap the Reset button (back of device)\n' +
    '3. Release the Reset button\n' +
    '4. Release A and B buttons\n\n' +
    'Then click OK to proceed.'
  );

  if (!userReady) return;

  // Request device
  const device = await navigator.bluetooth.requestDevice({
    filters: [{ namePrefix: 'BBC micro:bit' }],
  });

  // Flash
  const flasher = new BLEFlasher((evt) => {
    console.log(`${evt.percent}% — ${evt.message}`);
  });

  try {
    const result = await flasher.flash(hexString, device);
    alert('✓ Bluetooth flash successful!');
  } catch (e) {
    alert(`✗ Bluetooth flash failed: ${e.message}`);
  }
}
```

## Example 8: Progress with Stages

```javascript
function flashWithDetailedProgress(hexString) {
  const stageDescriptions = {
    'connecting': '🔌 Connecting to device...',
    'preparing': '📦 Preparing firmware...',
    'flashing': '⚡ Programming flash memory...',
    'verifying': '✓ Verifying...',
    'finalizing': '🔄 Finalizing...',
    'completed': '✅ Done!',
    'failed': '❌ Failed',
  };

  return getFlashingManager().flash(hexString, {
    onProgress: (evt) => {
      const description = stageDescriptions[evt.stage] || evt.stage;
      console.log(`[${evt.percent}%] ${description}`);
      console.log(`  ${evt.message}`);

      // Update UI based on stage
      updateProgressUI({
        percent: evt.percent,
        stage: evt.stage,
        description: description,
        message: evt.message,
      });
    },
  });
}
```

## Example 9: Retry with Exponential Backoff

```javascript
async function flashWithRetry(hexString, maxAttempts = 3) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`Flash attempt ${attempt}/${maxAttempts}...`);
      return await getFlashingManager().flash(hexString, {
        onProgress: (evt) => {
          console.log(`Attempt ${attempt}: ${evt.percent}% — ${evt.message}`);
        },
      });
    } catch (e) {
      lastError = e;
      console.error(`Attempt ${attempt} failed:`, e.message);

      if (attempt < maxAttempts) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }

  throw new Error(`All ${maxAttempts} attempts failed: ${lastError.message}`);
}
```

## Example 10: Full Classroom App Integration

```javascript
import React, { useEffect, useState } from 'react';
import { getFlashingManager, getDeviceManager, validateHex } from './flash/index.js';

export function ClassroomFlashApp() {
  const [hexString, setHexString] = useState('');
  const [devices, setDevices] = useState([]);
  const [isFlashing, setIsFlashing] = useState(false);
  const [progress, setProgress] = useState({ percent: 0, message: '', stage: '' });
  const [error, setError] = useState('');

  const deviceManager = getDeviceManager();
  const flasher = getFlashingManager();

  useEffect(() => {
    // Start device monitoring
    deviceManager.startMonitoring();
    deviceManager.on('device-added', updateDevices);
    deviceManager.on('device-removed', updateDevices);

    const updateDevices = async () => {
      const connected = await deviceManager.getConnectedDevices();
      setDevices(connected);
    };

    updateDevices();

    return () => deviceManager.stopMonitoring();
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setHexString(e.target.result);
      setError('');
    };
    reader.readAsText(file);
  };

  const handleFlash = async () => {
    // Validate HEX
    const validation = validateHex(hexString);
    if (!validation.isValid) {
      setError(`Invalid HEX: ${validation.errors.join(', ')}`);
      return;
    }

    setIsFlashing(true);
    setError('');

    try {
      await flasher.flash(hexString, {
        onProgress: (evt) => {
          setProgress(evt);
        },
      });
      setProgress({ percent: 100, message: '✓ Flash complete!', stage: 'completed' });
    } catch (e) {
      setError(`Flash failed: ${e.message}`);
      setProgress({ percent: 0, message: '', stage: 'failed' });
    } finally {
      setIsFlashing(false);
    }
  };

  return (
    <div className="flash-app">
      <h1>📚 Classroom Micro:bit Flash Tool</h1>

      <div className="devices-section">
        <h2>Connected Devices: {devices.length}</h2>
        {devices.length === 0 ? (
          <p className="warning">⚠️ No micro:bits detected. Plug in via USB.</p>
        ) : (
          <ul>
            {devices.map(d => (
              <li key={d.id} className={d.state}>
                {d.name} ({d.type}) — {d.state}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="hex-section">
        <h2>Program File</h2>
        <input type="file" accept=".hex" onChange={handleFileUpload} />
        {hexString && <p>✓ HEX loaded ({hexString.length} bytes)</p>}
      </div>

      <div className="flash-section">
        <button
          onClick={handleFlash}
          disabled={!hexString || isFlashing}
          className="flash-button"
        >
          {isFlashing ? 'Flashing...' : 'Flash Program'}
        </button>

        {progress.percent > 0 && (
          <div className="progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <div className="progress-info">
              <p className="progress-message">{progress.message}</p>
              <p className="progress-stage">[{progress.stage}] {progress.percent}%</p>
            </div>
          </div>
        )}

        {error && <p className="error">✗ {error}</p>}
      </div>
    </div>
  );
}
```

## Best Practices from Examples

1. **Always validate HEX before flashing**
2. **Show progress with stage information** (connecting, flashing, verifying)
3. **Handle errors gracefully** with user-friendly messages
4. **Support multiple flash methods** with automatic fallback
5. **Monitor device connection** for real-time UI updates
6. **Implement retry logic** for transient failures
7. **Guide users through BLE pairing mode** when needed
8. **Use Electron for better USB support** on desktop
9. **Respect user time** with proper timeout handling
10. **Test with real hardware** before production deployment
