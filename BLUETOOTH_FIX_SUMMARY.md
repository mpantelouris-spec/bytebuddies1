# ByteBuddies Bluetooth Motor Control Fix

## Problem Identified

Your Cutebot robot is connecting via Bluetooth but motors make clicking noises instead of smooth movement. This indicates that the I2C motor control initialization might not be working properly over the Bluetooth connection.

## Root Cause

The original Bluetooth firmware (`bytebuddies_ble.py`) relies on the browser sending setup code over Bluetooth before running programs. While this architecture is flexible, timing or transmission issues can prevent the I2C motor controller from initializing correctly.

## Solutions Provided

### Solution 1: Flash the Improved Bluetooth Firmware (RECOMMENDED)

A new, optimized firmware has been created that includes Cutebot motor control built-in:

**File:** `public/bytebuddies_cutebot_bluetooth.py`

**Benefits:**
- I2C is properly initialized at startup (not sent over BLE)
- All motor control functions are pre-compiled and ready
- Better error handling and status display codes
- Same Bluetooth UART interface as before

**How to Flash:**
1. Go to https://python.microbit.org/v/3 (MicroPython online editor)
2. Click "Load" and select `bytebuddies_cutebot_bluetooth.py`
3. Click "Download" to get the hex file
4. Drag the hex file onto your micro:bit drive
5. Wait for flashing to complete
6. Reconnect via ByteBuddies app

**Display codes:**
- **S** = Starting
- **1** = Bluetooth module loaded
- **2** = BLE active
- **3** = Service registered
- **C** = Cutebot setup complete (new!)
- **B** = Broadcasting - ready to connect
- **😊** = Connected and running

### Solution 2: Improved Browser Code (Automatic)

The RobotPanel.jsx has been updated to:
- Send all setup code as one atomic block (instead of line-by-line)
- Provide better diagnostics and error messages
- Suggest the new firmware if motors don't work

**This change is automatic when you redeploy/rebuild the site.**

## Motor Control Protocol (Reference)

The Cutebot motor controller uses:

```
I2C Address: 0x10
Packet format: [register, direction, speed, padding]

Left motor:   register = 0x01
Right motor:  register = 0x02

Direction:
  1 = backward
  2 = forward  
  (Direction 0 is INVALID - locks the STM8 chip)

Speed: 0-100
  0 = stop
  80 = normal speed
  100 = max speed
```

**Example:** Moving forward at speed 80:
```python
i2c.write(0x10, bytes([0x01, 2, 80, 0]))  # Left motor forward
i2c.write(0x10, bytes([0x02, 2, 80, 0]))  # Right motor forward
```

## Files Changed

### New Files Created:
- `public/bytebuddies_cutebot_bluetooth.py` - Improved firmware source
- `public/CUTEBOT_BLUETOOTH_SETUP.md` - User setup guide
- `BLUETOOTH_FIX_SUMMARY.md` - This file

### Modified Files:
- `src/components/RobotPanel.jsx`:
  - Lines 3218-3237: Improved BLE setup code transmission (send as atomic block)
  - Lines 2771-2815: Better diagnostics during firmware test

## How to Verify the Fix Works

1. **After flashing** the new firmware:
   - micro:bit should show: S → 1 → 2 → 3 → C → B
   - Wait for "B" (Broadcasting)

2. **Connect via ByteBuddies:**
   - Click "Connect Robot" → Bluetooth
   - Select "ByteBuddies"
   - Should see HAPPY face
   - Terminal should show "✅ Step 6/6: Firmware responding correctly!"

3. **Test motors:**
   - Drag "Forward" block to canvas
   - Click "▶ Run"
   - Robot should move SMOOTHLY (no clicking!)
   - Motors should start, run for 800ms, stop cleanly

## Troubleshooting

### Still Making Clicking Noises?
- The old firmware might still be flashed
- Solution: Flash `bytebuddies_cutebot_bluetooth.py` (new firmware)

### "No reply from micro:bit" Message?
- The firmware might not support code execution
- Solution: Flash the new firmware
- OR: Try running anyway (might still work)

### Cannot Find "ByteBuddies" in BLE List?
- Firmware crashed - check micro:bit display for error
- Micro:bit v1 doesn't have Bluetooth (needs v2)
- Browser doesn't support Web Bluetooth (use Chrome/Edge)

### Motors stop working after brief use?
- Power cycle: remove batteries, wait 5 sec, reconnect
- Check battery voltage (should be 3V+)
- Reconnect Bluetooth

## Technical Details

### I2C Bus Configuration
```python
# micro:bit v2 defaults:
#   Default: 400kHz I2C
# Cutebot STM8 needs:
#   100kHz I2C on pins 19 (SCL), 20 (SDA)

i2c.init(freq=100000, sda=pin20, scl=pin19)
```

### Why Separate Setup Blocks?
The original design sent setup code line-by-line over Bluetooth for flexibility. The new firmware compiles setup into the firmware itself for reliability.

### Backward Compatibility
Both approaches use the same Bluetooth UART service (Nordic UART Service - NUS), so they're compatible with the same browser code.

## Deployment Steps

1. Rebuild the website:
   ```bash
   npm run build
   ```

2. Deploy to VPS:
   ```bash
   git add .
   git commit -m "Fix Bluetooth motor control - add improved firmware and robust setup"
   git push
   ```

3. User should flash the new firmware:
   - Use `python.microbit.org` to flash `bytebuddies_cutebot_bluetooth.py`
   - OR update their browser (automatic on next release)

## Questions?

- Check `public/CUTEBOT_BLUETOOTH_SETUP.md` for detailed setup guide
- Check `cutebot-test-checklist.md` for verification steps
- Check `ble_compile/main.ts` for reference Bluetooth implementation (MakeCode version)
