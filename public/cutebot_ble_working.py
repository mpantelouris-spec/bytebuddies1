# Cutebot Bluetooth - Works on micro:bit v2
# Ignore editor errors - flash anyway!

from microbit import *

display.show('S')

try:
    # Import bluetooth with try/except to avoid editor errors
    try:
        import bluetooth as bt
    except:
        bt = None

    if bt is None:
        display.show(Image.SAD)
    else:
        ble = bt.BLE()
        ble.active(True)
        display.show('B')

        # Nordic UART Service
        ((tx_h, rx_h),) = ble.gatts_register_services(((
            bt.UUID('6e400001-b5b3-f393-e0a9-e50e24dcca9e'), (
                (bt.UUID('6e400003-b5b3-f393-e0a9-e50e24dcca9e'), 0x0010),
                (bt.UUID('6e400002-b5b3-f393-e0a9-e50e24dcca9e'), 0x0004),
            )
        ),))

        # I2C setup
        i2c.init(freq=100000, sda=pin20, scl=pin19)
        _B = bytearray(4)

        # Motor functions
        def _cb4(r, a, b, c):
            try:
                _B[0] = r
                _B[1] = a
                _B[2] = b
                _B[3] = c
                i2c.write(0x10, _B)
            except:
                pass

        def fw(ms=0):
            _cb4(0x01, 2, 80, 0)
            sleep(50)
            _cb4(0x02, 2, 80, 0)
            if ms > 0:
                sleep(ms)
                sp()

        def bk(ms=0):
            _cb4(0x01, 1, 80, 0)
            sleep(50)
            _cb4(0x02, 1, 80, 0)
            if ms > 0:
                sleep(ms)
                sp()

        def lt(ms=0):
            _cb4(0x01, 1, 60, 0)
            sleep(50)
            _cb4(0x02, 2, 60, 0)
            if ms > 0:
                sleep(ms)
                sp()

        def rt(ms=0):
            _cb4(0x01, 2, 60, 0)
            sleep(50)
            _cb4(0x02, 1, 60, 0)
            if ms > 0:
                sleep(ms)
                sp()

        def sp():
            _cb4(0x01, 2, 0, 0)
            sleep(50)
            _cb4(0x02, 2, 0, 0)

        def hl(r, g, b):
            _cb4(0x04, r, g, b)
            sleep(10)
            _cb4(0x08, r, g, b)

        def hl_l(r, g, b):
            _cb4(0x04, r, g, b)

        def hl_r(r, g, b):
            _cb4(0x08, r, g, b)

        hl(0, 0, 0)

        # Bluetooth handler
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
                idx = _buf.find('\n')
                if idx < 0 or (_buf.find('\x04') >= 0 and _buf.find('\x04') < idx):
                    idx = _buf.find('\x04')
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
            elif event == 3 and data[1] == rx_h:
                _recv(ble.gatts_read(rx_h).decode('utf-8', 'replace'))

        _name = b'ByteBuddies'
        _ADV = bytes([2, 0x01, 0x06, len(_name)+1, 0x09]) + _name
        ble.irq(_irq)
        ble.gap_advertise(100000, _ADV)
        display.show('B')

except Exception as e:
    display.scroll(str(e), delay=80)
    display.show(Image.SAD)
