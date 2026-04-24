# ByteBuddies Cutebot Bluetooth Setup Guide

This guide helps you get your Cutebot robot working with Bluetooth on the ByteBuddies web app.

## Quick Start (Recommended)

If your Cutebot isn't working over Bluetooth, follow these steps:

### 1. Flash the Bluetooth Firmware

The best way to get a fully working Cutebot Bluetooth firmware is to use the **MicroPython online editor**.

**Important:** If Bluetooth connects but Run does not move the robot, re-flash using the **latest** `bytebuddies_cutebot_bluetooth.py` from this project. Older firmware split incoming data on newlines, which broke the multi-line Cutebot setup the app sends over BLE. Current firmware uses **Ctrl-D (ASCII 4) only** as the end-of-message marker so full setup scripts run correctly.

**Steps:**
1. Download the firmware source: `bytebuddies_cutebot_bluetooth.py`
2. Go to https://python.microbit.org/v/3 (MicroPython editor for micro:bit v2)
3. Click the **Load** button and select `bytebuddies_cutebot_bluetooth.py`
4. Click **Download** to get the `.hex` file
5. Drag the `.hex` file onto your micro:bit USB drive (it should appear as "MICROBIT" in your file explorer)
6. The micro:bit will flash automatically - wait for the download LED to stop blinking
7. You should see "B" on the micro:bit display (Broadcasting - ready to connect)

### 2. Connect via ByteBuddies Web App

1. Go to https://bytebuddies.technology
2. Select "micro:bit" as your robot
3. Click "Connect Robot" and select "Bluetooth"
4. Find "ByteBuddies" in the Bluetooth device list
5. Click to pair and connect
6. You should see a "HAPPY" face on the micro:bit display
7. The app will show "✅ Step 6/6: micro:bit responded!" in the terminal

### 3. Test Motor Control

1. Build a simple program: drag a "Forward" block into the canvas
2. Click "▶ Run"
3. Your Cutebot should move forward (smooth motion, not clicking)

## What Each Display Code Means

When flashing the firmware, you'll see codes on the micro:bit display:

- **S** = Starting up
- **1** = Bluetooth module loaded
- **2** = BLE subsystem active
- **3** = UART service registered  
- **C** = Cutebot motor control initialized (new firmware only)
- **B** = Broadcasting - ready to accept Bluetooth connections
- **😊** = Connected and running normally
- **😞** = Error occurred - check the scrolling error message

## Hardware Requirements

- **micro:bit v2** (Bluetooth requires v2, not v1)
- **Cutebot robot** with motor controller at I2C address 0x10
- **Fully charged batteries** in the Cutebot
- **USB cable** (just for initial firmware flashing via Python editor)
- **Chrome or Edge browser** (Firefox and Safari don't support Web Bluetooth)

## Troubleshooting

### Issue: The editor doesn’t recognise `bluetooth` / shows a red error

**What’s going on:** The firmware uses the **official micro:bit v2** form: `from bluetooth import BLE, UUID` (same idea as the [BBC micro:bit BLE docs](https://microbit-micropython.readthedocs.io/en/v2-docs/ble.html)). That only exists on **micro:bit v2** MicroPython. Desktop / web editors often still check against **normal** Python, so they may underline `bluetooth` even though the script is valid on the board.

**What to do:**
1. In **https://python.microbit.org/v/3**, set the project to **micro:bit v2**, not v1 (**v1 has no BLE** in MicroPython).
2. Flash with **Download** and watch the display: you should see **S → 1 → 2 → …** If the editor still complains but the micro:bit reaches **1**, you can ignore the squiggle.
3. A **sad face** and scrolling text is a **real** error on the device — read the message (wrong board, v1, or a bug in the script).

### Issue: Motors make clicking noises instead of smooth movement

**Cause:** I2C motor controller isn't initialized properly
**Solution:**  Make sure you flashed the `bytebuddies_cutebot_bluetooth.py` firmware (the new improved version)

### Issue: "Connection timeout" or "No reply from micro:bit"

**Cause:** Firmware doesn't support proper code execution
**Solution:** Reflash with the `bytebuddies_cutebot_bluetooth.py` firmware which has the exec() handler

### Issue: Can't find "ByteBuddies" in Bluetooth device list

**Cause:** 
1. Firmware crashed (micro:bit shows sad face)
2. Micro:bit not flashed yet
3. Browser doesn't support Web Bluetooth (check browser compatibility)

**Solution:**
1. Check the micro:bit display - if sad face, see scrolling error message
2. Ensure you flashed a .hex file successfully (download LED stopped blinking)
3. Try Google Chrome on desktop/laptop (best Web Bluetooth support)

### Issue: Motors worked once, then stopped working

**Cause:** I2C initialization might have failed on reconnection
**Solution:** 
1. Disconnect the Bluetooth connection
2. Power cycle the robot (remove batteries, wait 5 seconds, reconnect)
3. Reconnect via ByteBuddies

### Issue: "display.show(Image.HAPPY)" command fails during ping

**Cause:** The firmware might be a generic MicroPython version, not the ByteBuddies version
**Solution:** Reflash with `bytebuddies_cutebot_bluetooth.py`

## Technical Details

### I2C Motor Controller Protocol

The Cutebot motor controller at address 0x10 uses this protocol:

```python
# 4-byte command: [register, param1, param2, param3]
_B = bytearray(4)
_B[0] = register  # 0x01=left motor, 0x02=right motor
_B[1] = direction # 0x01=backward, 0x02=forward  
_B[2] = speed     # 0-255
_B[3] = 0         # unused/padding
i2c.write(0x10, _B)
```

**Important:** The I2C bus must be initialized at **100kHz** (not the default 400kHz):

```python
i2c.init(freq=100000, sda=pin20, scl=pin19)
```

### Bluetooth UART Service (Nordic UART Service)

The firmware uses standard Nordic UART Service (NUS) UUIDs:

- **Service UUID:** `6e400001-b5b3-f393-e0a9-e50e24dcca9e`
- **TX (Notify):** `6e400003-b5b3-f393-e0a9-e50e24dcca9e` (firmware → browser)
- **RX (Write):** `6e400002-b5b3-f393-e0a9-e50e24dcca9e` (browser → firmware)

The firmware executes received Python code and replies with `\x04\x04` when complete (REPL completion signal).

## How to Compile Firmware Yourself

If you want to create a custom firmware:

1. Edit `bytebuddies_cutebot_bluetooth.py` with your changes
2. Go to https://python.microbit.org/v/3
3. Load the Python file
4. Click **Download** to get the hex file
5. Flash to micro:bit as described above

## Using USB + Bluetooth Together

You can have BOTH USB wired control AND Bluetooth in the same session:

1. Flash the Bluetooth firmware
2. Connect via Bluetooth as normal
3. Keep the USB cable connected (it provides power but doesn't interfere)
4. Both connections will work simultaneously (browser chooses which to use)

## Still Not Working?

1. **Check your micro:bit model:** Must be v2 (has 2 extra GND pads on the back). v1 doesn't have Bluetooth.
2. **Check your browser:** Must be Chrome/Edge. Safari and Firefox don't support Web Bluetooth API.
3. **Check I2C pins:** Make sure no other code or shields are using I2C pins 19 & 20.
4. **Check motor controller:** The Cutebot must have the STM8 motor controller board with I2C at address 0x10.
5. **Battery power:** Make sure batteries are fully charged - weak batteries can cause I2C communication failures.

If you're still stuck, share:
- What you see on the micro:bit display (happy/sad/letter)
- What message the ByteBuddies terminal shows
- What browser you're using
- Whether the motors work with USB wired connection
