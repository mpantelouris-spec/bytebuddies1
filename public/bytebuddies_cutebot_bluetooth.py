# ByteBuddies BLE Firmware for micro:bit v2 + Cutebot Robot
# This firmware combines:
#  - Nordic UART Service (Bluetooth) for command input
#  - Cutebot I2C motor control (pre-initialized)
#  - Full Python exec() support for block execution
#
# Flash ONCE via USB at https://python.microbit.org/v/3
# Status display: S=start, 1=BT module, 2=BLE active, 3=service ready, C=Cutebot setup, B=Broadcasting

from microbit import *

display.show('S')

try:
    import bluetooth
    display.show('1')

    # Import and initialize Bluetooth
    ble = bluetooth.BLE()
    ble.active(True)
    display.show('2')

    # Nordic UART Service - same UUIDs as MakeCode/standard implementations
    # TX = micro:bit → browser (NOTIFY)
    # RX = browser → micro:bit (WRITE WITHOUT RESPONSE)
    ((tx_h, rx_h),) = ble.gatts_register_services(((
        bluetooth.UUID('6e400001-b5b3-f393-e0a9-e50e24dcca9e'), (
            (bluetooth.UUID('6e400003-b5b3-f393-e0a9-e50e24dcca9e'), 0x0010),  # NOTIFY (TX)
            (bluetooth.UUID('6e400002-b5b3-f393-e0a9-e50e24dcca9e'), 0x0004),  # WRITE_NO_RESPONSE (RX)
        )
    ),))
    display.show('3')

    # ─── Initialize Cutebot I2C Motor Control ───
    # micro:bit v2: I2C on P19 (scl), P20 (sda) at 100kHz
    i2c.init(freq=100000, sda=pin20, scl=pin19)

    # Pre-allocate bytearray for I2C writes to avoid heap fragmentation in loops
    _B = bytearray(4)

    # ─── Cutebot motor control ───
    def _cb4(r, a, b, c):
        """Write 4-byte I2C command to motor controller (addr 0x10)"""
        try:
            _B[0] = r
            _B[1] = a
            _B[2] = b
            _B[3] = c
            i2c.write(0x10, _B)
        except:
            pass

    def sp():
        """Stop all motors"""
        _cb4(0x01, 2, 0, 0)
        sleep(50)
        _cb4(0x02, 2, 0, 0)

    def fw(ms):
        """Move forward for ms milliseconds"""
        _cb4(0x01, 2, 80, 0)
        sleep(50)
        _cb4(0x02, 2, 80, 0)
        sleep(ms)
        sp()

    def bk(ms):
        """Move backward for ms milliseconds"""
        _cb4(0x01, 1, 80, 0)
        sleep(50)
        _cb4(0x02, 1, 80, 0)
        sleep(ms)
        sp()

    def lt(ms):
        """Turn left for ms milliseconds"""
        _cb4(0x01, 1, 60, 0)
        sleep(50)
        _cb4(0x02, 2, 60, 0)
        sleep(ms)
        sp()

    def rt(ms):
        """Turn right for ms milliseconds"""
        _cb4(0x01, 2, 60, 0)
        sleep(50)
        _cb4(0x02, 1, 60, 0)
        sleep(ms)
        sp()

    def hl(r, g, b):
        """Set both headlights RGB color"""
        _cb4(0x04, r, g, b)
        sleep(10)
        _cb4(0x08, r, g, b)

    def hl_l(r, g, b):
        """Set left headlight RGB color"""
        _cb4(0x04, r, g, b)

    def hl_r(r, g, b):
        """Set right headlight RGB color"""
        _cb4(0x08, r, g, b)

    def sonar():
        """Read ultrasonic distance in cm"""
        pin1.write_digital(0)
        pin1.write_digital(1)
        pin1.write_digital(0)
        t = running_time()
        while pin2.read_digital() == 0:
            if running_time() - t > 50:
                return 400
        t = running_time()
        while pin2.read_digital() == 1:
            if running_time() - t > 50:
                return 400
        return (running_time() - t) * 17

    def ls():
        """Read line sensors: return (left, right) where 1=on line, 0=no line"""
        return pin14.read_digital(), pin13.read_digital()

    # Initialize headlights to off
    hl(0, 0, 0)

    display.show('C')  # Cutebot setup complete

    # ─── Bluetooth UART service ───
    _conn = None
    _buf = ''

    def _send(s):
        """Send string back to browser via Bluetooth"""
        if _conn is None:
            return
        b = s.encode()
        for i in range(0, len(b), 20):
            try:
                ble.gatts_notify(_conn, tx_h, b[i:i + 20])
            except:
                pass
            sleep(10)

    def _recv(chunk):
        """Receive and execute commands from browser"""
        global _buf
        _buf += chunk

        # Process complete commands (terminated by \n or \x04)
        while True:
            i4 = _buf.find('\x04')
            inl = _buf.find('\n')

            if i4 < 0 and inl < 0:
                break

            if i4 < 0:
                idx = inl
            elif inl < 0:
                idx = i4
            else:
                idx = min(i4, inl)

            cmd = _buf[:idx].strip()
            _buf = _buf[idx + 1:]

            if cmd:
                try:
                    exec(compile(cmd, '<bt>', 'exec'), globals())
                except:
                    pass

                # Always respond with \x04\x04 (REPL completion signal)
                _send('\x04\x04')

    def _irq(event, data):
        """Handle Bluetooth events"""
        global _conn, _buf

        if event == 1:  # Central connected
            _conn = data[0]
            _buf = ''
            display.show(Image.HAPPY)

        elif event == 2:  # Central disconnected
            _conn = None
            _buf = ''
            display.show('B')
            ble.gap_advertise(100_000, _ADV)

        elif event == 3:  # Data received
            if data[1] == rx_h:
                _recv(ble.gatts_read(rx_h).decode('utf-8', 'replace'))

    # Advertisement payload
    _name = b'ByteBuddies'
    _ADV = bytes([2, 0x01, 0x06, len(_name) + 1, 0x09]) + _name

    # Set up interrupt handler and start advertising
    ble.irq(_irq)
    ble.gap_advertise(100_000, _ADV)
    display.show('B')  # Broadcasting - ready to connect!

except Exception as e:
    # Display error message
    display.scroll(str(e), delay=80)
    display.show(Image.SAD)
