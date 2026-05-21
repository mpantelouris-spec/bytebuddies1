# ByteBuddies Quarky Firmware — ESP32 MicroPython
# -------------------------------------------------------
# This file is for reference / advanced use only.
# ByteBuddies loads helper functions automatically at connect
# time — you do NOT need to manually flash this file.
#
# FIRST-TIME SETUP (one time only):
#   1. Install Thonny IDE from https://thonny.org
#   2. In Thonny: Tools → Options → Interpreter
#      → Select "MicroPython (ESP32)"
#      → Click "Install or update MicroPython"
#      → Choose your Quarky serial port → Install
#   3. After MicroPython is installed, connect Quarky to
#      ByteBuddies via the Robot Lab USB button.
#      ByteBuddies sends the helper functions below automatically!
#
# MOTOR PINS (DRV8833 motor driver on Quarky):
#   Left  motor: AIN1 = GPIO26 (forward), AIN2 = GPIO27 (backward)
#   Right motor: BIN1 = GPIO14 (forward), BIN2 = GPIO12 (backward)
#   Adjust these if your Quarky version uses different pins.
#
# LED MATRIX:
#   35 NeoPixel RGB LEDs on GPIO5 (7 columns x 5 rows)
#
# IR SENSORS:
#   Left IR:  GPIO34 (input-only)
#   Right IR: GPIO35 (input-only)
#
# SERVO PORTS:
#   Servo 1: GPIO16,  Servo 2: GPIO17
# -------------------------------------------------------

from machine import Pin, PWM
import time, neopixel

# ── Motor pins ──────────────────────────────────────────
_LA = PWM(Pin(26), freq=1000, duty=0)   # Left  motor forward
_LB = PWM(Pin(27), freq=1000, duty=0)   # Left  motor backward
_RA = PWM(Pin(14), freq=1000, duty=0)   # Right motor forward
_RB = PWM(Pin(12), freq=1000, duty=0)   # Right motor backward

# ── LED matrix (35 NeoPixels, GPIO5) ───────────────────
_NP = neopixel.NeoPixel(Pin(5), 35)

# ── Motor helpers ────────────────────────────────────────
def sp():
    """Stop all motors immediately."""
    _LA.duty(0); _LB.duty(0)
    _RA.duty(0); _RB.duty(0)

def fw(ms):
    """Drive forward for ms milliseconds."""
    _LA.duty(800); _LB.duty(0)
    _RA.duty(800); _RB.duty(0)
    time.sleep_ms(ms)
    sp()

def bk(ms):
    """Drive backward for ms milliseconds."""
    _LA.duty(0); _LB.duty(800)
    _RA.duty(0); _RB.duty(800)
    time.sleep_ms(ms)
    sp()

def lt(ms):
    """Turn left (pivot) for ms milliseconds."""
    _LA.duty(0);   _LB.duty(600)
    _RA.duty(800); _RB.duty(0)
    time.sleep_ms(ms)
    sp()

def rt(ms):
    """Turn right (pivot) for ms milliseconds."""
    _LA.duty(800); _LB.duty(0)
    _RA.duty(0);   _RB.duty(600)
    time.sleep_ms(ms)
    sp()

# ── LED helpers ──────────────────────────────────────────
def hl(r, g, b):
    """Set all 35 LEDs to the given RGB colour."""
    for i in range(35):
        _NP[i] = (r, g, b)
    _NP.write()

def hl_pixel(idx, r, g, b):
    """Set a single LED (0-34) to RGB."""
    _NP[idx] = (r, g, b)
    _NP.write()

# ── Sensor helpers ───────────────────────────────────────
def ls():
    """Read infrared line sensors. Returns (left, right) — 1 = line detected."""
    return Pin(34, Pin.IN).value(), Pin(35, Pin.IN).value()

# ── Startup indicator ────────────────────────────────────
hl(0, 255, 0)       # Flash green = ready
time.sleep_ms(300)
hl(0, 0, 0)
print("Quarky ready!")
