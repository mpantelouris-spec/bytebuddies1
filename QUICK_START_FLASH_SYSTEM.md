# Quick Start: micro:bit Flash System

## 🚀 5-Minute Setup

### Step 1: Install Dependencies

```bash
npm install @microbit/microbit-fs dapjs
```

### Step 2: Add Files to Your Project

```
src/
├── utils/
│   └── microbitFlashSystem.js  ✅ Copy this file
├── components/
│   └── MicrobitFlashPanel.jsx  ✅ Copy this file
public/
└── firmware_bluetooth_template.py  ✅ Copy this file
```

### Step 3: Use in Your App

```javascript
import MicrobitFlashPanel from './components/MicrobitFlashPanel';

function App() {
  const [code, setCode] = useState(`from microbit import *

while True:
    display.show(Image.HEART)
    sleep(1000)
`);

  return (
    <div>
      <textarea 
        value={code}
        onChange={(e) => setCode(e.target.value)}
        style={{ width: '100%', height: '200px' }}
      />
      
      <MicrobitFlashPanel 
        userCode={code}
        onLog={(msg, level) => console.log(`[${level}] ${msg}`)}
      />
    </div>
  );
}
```

### Step 4: Test It!

**For USB Flash (Wired):**
1. Connect micro:bit via USB
2. Click "⚡ Flash via USB"
3. Select device
4. Watch progress
5. Done! Program runs on micro:bit

**For Bluetooth (Wireless):**
1. Flash Bluetooth firmware first (USB button)
2. Power micro:bit (battery/USB)
3. Click "📡 Connect Bluetooth"
4. Use Run/Stop buttons

---

## 📖 Example: Robot Control

```javascript
// Complete example with robot control

import React, { useState } from 'react';
import MicrobitFlashPanel from './components/MicrobitFlashPanel';

const robotProgram = `from microbit import *

class Robot:
    def drive(self, distance):
        # Left motor forward
        pin0.write_digital(1)
        pin1.write_digital(0 if distance > 0 else 1)
        # Right motor forward
        pin2.write_digital(1)
        pin3.write_digital(1 if distance > 0 else 0)
        sleep(abs(distance))
        self.stop()
    
    def turn(self, angle):
        # Rotate in place
        pin0.write_digital(1)
        pin1.write_digital(1 if angle < 0 else 0)
        pin2.write_digital(1)
        pin3.write_digital(0 if angle < 0 else 1)
        sleep(abs(int(angle * 5)))
        self.stop()
    
    def stop(self):
        pin0.write_digital(0)
        pin2.write_digital(0)

robot = Robot()

# Drive forward, turn right, drive forward
robot.drive(500)
robot.turn(90)
robot.drive(500)
robot.stop()
`;

export default function RobotController() {
  const [code, setCode] = useState(robotProgram);
  const [logs, setLogs] = useState([]);

  const handleLog = (message, level) => {
    setLogs(prev => [...prev, { message, level, time: Date.now() }]);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1>Robot Controller</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Code Editor */}
        <div>
          <h2>Program</h2>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={{
              width: '100%',
              height: '400px',
              fontFamily: 'monospace',
              fontSize: '14px',
              padding: '10px',
            }}
          />
        </div>

        {/* Flash Panel */}
        <div>
          <MicrobitFlashPanel userCode={code} onLog={handleLog} />
        </div>
      </div>

      {/* Logs */}
      <div style={{ marginTop: '20px' }}>
        <h2>Logs</h2>
        <div style={{
          background: '#1a1a1a',
          color: '#0f0',
          padding: '10px',
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '12px',
          height: '200px',
          overflow: 'auto',
        }}>
          {logs.map((log, i) => (
            <div key={i} style={{
              color: log.level === 'error' ? '#f00' :
                     log.level === 'success' ? '#0f0' :
                     log.level === 'warn' ? '#fa0' : '#0f0'
            }}>
              [{new Date(log.time).toLocaleTimeString()}] {log.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## 🎯 Common Patterns

### Pattern 1: Flash Button in Toolbar

```javascript
import { usbFlashWorkflow } from '../utils/microbitFlashSystem';

function Toolbar({ code }) {
  const [flashing, setFlashing] = useState(false);

  const handleFlash = async () => {
    setFlashing(true);
    try {
      await usbFlashWorkflow({
        pythonCode: code,
        useV2Only: true,
        onStatusUpdate: (status) => {
          console.log(status.message);
        }
      });
      alert('Flash complete!');
    } catch (error) {
      alert(`Flash failed: ${error.message}`);
    } finally {
      setFlashing(false);
    }
  };

  return (
    <button onClick={handleFlash} disabled={flashing}>
      {flashing ? 'Flashing...' : '⚡ Flash'}
    </button>
  );
}
```

### Pattern 2: Bluetooth Live Control

```javascript
import { BluetoothControlManager } from '../utils/microbitFlashSystem';

function LiveControl() {
  const ble = useRef(null);
  const [connected, setConnected] = useState(false);

  const connect = async () => {
    ble.current = new BluetoothControlManager();
    await ble.current.connect();
    setConnected(true);
  };

  const moveForward = () => {
    ble.current?.sendCommand('robot.drive(500)');
  };

  const moveBackward = () => {
    ble.current?.sendCommand('robot.drive(-500)');
  };

  const turnLeft = () => {
    ble.current?.sendCommand('robot.turn(-90)');
  };

  const turnRight = () => {
    ble.current?.sendCommand('robot.turn(90)');
  };

  const stop = () => {
    ble.current?.stopExecution();
  };

  return (
    <div>
      {!connected ? (
        <button onClick={connect}>Connect</button>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          <div></div>
          <button onClick={moveForward}>↑</button>
          <div></div>
          <button onClick={turnLeft}>←</button>
          <button onClick={stop}>⏹</button>
          <button onClick={turnRight}>→</button>
          <div></div>
          <button onClick={moveBackward}>↓</button>
          <div></div>
        </div>
      )}
    </div>
  );
}
```

### Pattern 3: Progress Bar Component

```javascript
function FlashProgressBar({ progress, message }) {
  return (
    <div>
      <div style={{
        width: '100%',
        height: '30px',
        background: '#e0e0e0',
        borderRadius: '15px',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #4CAF50, #8BC34A)',
          transition: 'width 0.3s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
        }}>
          {progress}%
        </div>
      </div>
      <p>{message}</p>
    </div>
  );
}
```

---

## ⚡ Tips & Best Practices

### 1. Always Check Browser Support

```javascript
import { checkBrowserSupport } from '../utils/microbitFlashSystem';

const support = checkBrowserSupport();
if (!support.webusb) {
  alert('Please use Chrome, Edge, or Opera');
}
```

### 2. Handle Errors Gracefully

```javascript
import { handleFlashError } from '../utils/microbitFlashSystem';

try {
  await flashViaUSB(hex);
} catch (error) {
  const errorInfo = handleFlashError(error);
  if (errorInfo.type === 'FIRMWARE') {
    showBluetoothSetupGuide();
  } else if (errorInfo.type === 'CONNECTION') {
    showUnplugInstructions();
  }
}
```

### 3. Disconnect Before USB Flash

```javascript
const flash = async () => {
  // CRITICAL: Disconnect Bluetooth first
  if (bleManager.current?.isConnected) {
    await bleManager.current.disconnect();
    await new Promise(r => setTimeout(r, 500)); // Wait for clean disconnect
  }
  
  await usbFlashWorkflow({ ... });
};
```

### 4. Cache Status Updates

```javascript
const [statusHistory, setStatusHistory] = useState([]);

const flash = async () => {
  await usbFlashWorkflow({
    pythonCode: code,
    onStatusUpdate: (status) => {
      setStatusHistory(prev => [...prev, status]);
    }
  });
};
```

### 5. Stop Before Disconnect

```javascript
const disconnect = async () => {
  // CRITICAL: Stop execution first
  await bleManager.current?.stopExecution();
  await new Promise(r => setTimeout(r, 200));
  await bleManager.current?.disconnect();
};
```

---

## 🐛 Common Issues & Fixes

### Issue 1: "Device not found"
**Cause:** User cancelled selection  
**Fix:** User action required, just retry

### Issue 2: "Flash failed halfway"
**Cause:** USB disconnected during flash  
**Fix:** Unplug, reconnect, retry. Device is still functional.

### Issue 3: "UART service not found"
**Cause:** Bluetooth firmware not flashed  
**Fix:** Use USB button to flash Bluetooth firmware first

### Issue 4: "Commands not working via Bluetooth"
**Cause:** Wrong firmware or syntax error  
**Fix:** 
1. Reflash Bluetooth firmware
2. Check Python syntax
3. Test with simple command: `display.show(Image.HEART)`

### Issue 5: "Program keeps running after stop"
**USB mode:** Shouldn't happen. Reflash device.  
**Bluetooth mode:** Ensure `stopExecution()` is called properly.

---

## 📚 Next Steps

1. ✅ Test with basic examples
2. ✅ Implement error handling
3. ✅ Add progress indicators
4. ✅ Test on real hardware
5. ✅ Deploy to production (HTTPS required)

**Ready to deploy?** Read [MICROBIT_FLASH_SYSTEM_DOCS.md](./MICROBIT_FLASH_SYSTEM_DOCS.md) for full details.

---

## 🎓 Learning Resources

- [Web Bluetooth API Docs](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API)
- [WebUSB API Docs](https://developer.mozilla.org/en-US/docs/Web/API/USB)
- [micro:bit Python Docs](https://microbit-micropython.readthedocs.io/)
- [DAPLink Protocol](https://github.com/ARMmbed/DAPLink)

---

**Questions?** Check the full documentation or examine the code comments.
