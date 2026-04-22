# ByteBuddies Cutebot Bluetooth - WORKING VERSION
# Tested and working - simple and reliable
# Flash via: https://python.microbit.org/v/3

from microbit import *
import bluetooth

# Show startup status
display.show('S')

try:
    # Initialize Bluetooth
    ble = bluetooth.BLE()
    ble.active(True)
    display.show('B')

    # Register Nordic UART Service
    ((tx_h, rx_h),) = ble.gatts_register_services(((
        bluetooth.UUID('6e400001-b5b3-f393-e0a9-e50e24dcca9e'), (
            (bluetooth.UUID('6e400003-b5b3-f393-e0a9-e50e24dcca9e'), 0x0010),
            (bluetooth.UUID('6e400002-b5b3-f393-e0a9-e50e24dcca9e'), 0x0004),
        )
    ),))

    # Setup I2C for Cutebot at 100kHz
    i2c.init(freq=100000, sda=pin20, scl=pin19)

    # Buffer for I2C commands
    _B = bytearray(4)

    # Motor control - sends I2C command to Cutebot motor controller (address 0x10)
    def _motor(reg, direction, speed):
        try:
            _B[0] = reg
            _B[1] = direction
            _B[2] = speed
            _B[3] = 0
            i2c.write(0x10, _B)
        except:
            pass

    # Movement commands
    def fw(ms=0):
        _motor(0x01, 2, 80)  # Left forward
        _motor(0x02, 2, 80)  # Right forward
        if ms > 0:
            sleep(ms)
            sp()

    def bk(ms=0):
        _motor(0x01, 1, 80)  # Left backward
        _motor(0x02, 1, 80)  # Right backward
        if ms > 0:
            sleep(ms)
            sp()

    def lt(ms=0):
        _motor(0x01, 1, 60)  # Left backward
        _motor(0x02, 2, 60)  # Right forward
        if ms > 0:
            sleep(ms)
            sp()

    def rt(ms=0):
        _motor(0x01, 2, 60)  # Left forward
        _motor(0x02, 1, 60)  # Right backward
        if ms > 0:
            sleep(ms)
            sp()

    def sp():
        _motor(0x01, 2, 0)
        _motor(0x02, 2, 0)

    # Headlights
    def hl(r, g, b):
        try:
            _B[0] = 0x04
            _B[1] = r
            _B[2] = g
            _B[3] = b
            i2c.write(0x10, _B)
            sleep(10)
            _B[0] = 0x08
            i2c.write(0x10, _B)
        except:
            pass

    def hl_l(r, g, b):
        try:
            _B[0] = 0x04
            _B[1] = r
            _B[2] = g
            _B[3] = b
            i2c.write(0x10, _B)
        except:
            pass

    def hl_r(r, g, b):
        try:
            _B[0] = 0x08
            _B[1] = r
            _B[2] = g
            _B[3] = b
            i2c.write(0x10, _B)
        except:
            pass

    # Turn off lights at startup
    hl(0, 0, 0)

    # Bluetooth variables
    _conn = None
    _buf = ''

    def _send(s):
        if _conn is None:
            return
        b = s.encode() if isinstance(s, str) else s
        for i in range(0, len(b), 20):
            try:
                ble.gatts_notify(_conn, tx_h, b[i:i+20])
            except:
                pass
            sleep(10)

    def _recv(chunk):
        global _buf
        _buf += chunk

        while '\n' in _buf or '\x04' in _buf:
            idx = -1
            if '\n' in _buf:
                idx = _buf.index('\n')
            if '\x04' in _buf:
                idx2 = _buf.index('\x04')
                if idx < 0 or idx2 < idx:
                    idx = idx2

            if idx < 0:
                break

            cmd = _buf[:idx].strip()
            _buf = _buf[idx+1:]

            if cmd:
                try:
                    exec(cmd)
                except:
                    pass
                _send('\x04\x04')

    def _irq(event, data):
        global _conn, _buf
        if event == 1:
            _conn = data[0]
            _buf = ''
            display.show(Image.HAPPY)
        elif event == 2:
            _conn = None
            _buf = ''
            display.show('B')
        elif event == 3:
            if data[1] == rx_h:
                _recv(ble.gatts_read(rx_h).decode('utf-8', 'replace'))

    # Start advertising
    _name = b'ByteBuddies'
    _ADV = bytes([2, 0x01, 0x06, len(_name)+1, 0x09]) + _name
    ble.irq(_irq)
    ble.gap_advertise(100000, _ADV)
    display.show('B')

except Exception as e:
    display.scroll(str(e), delay=80)
    display.show(Image.SAD)
