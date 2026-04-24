# ByteBuddies Cutebot BLE firmware for micro:bit v2.
# Keeps BLE stack minimal/stable and uses Cutebot I2C helpers.

from microbit import *

display.show("S")

try:
    from bluetooth import BLE, UUID

    ble = BLE()
    ble.active(True)
    display.show("B")

    # Nordic UART service (legacy B5B3 variant; app accepts B5A3 and B5B3)
    ((tx_h, rx_h),) = ble.gatts_register_services(((
        UUID("6e400001-b5b3-f393-e0a9-e50e24dcca9e"), (
            (UUID("6e400003-b5b3-f393-e0a9-e50e24dcca9e"), 0x0010),
            (UUID("6e400002-b5b3-f393-e0a9-e50e24dcca9e"), 0x0004),
        )
    ),))

    # ─── Cutebot I2C (optional — do not crash BLE if no chassis / wrong wiring) ───
    _B = bytearray(4)

    def _cb4(r, a, b, c):
        try:
            _B[0] = r
            _B[1] = a
            _B[2] = b
            _B[3] = c
            i2c.write(0x10, _B)
        except Exception:
            pass

    def sp():
        _cb4(0x01, 2, 0, 0)
        sleep(50)
        _cb4(0x02, 2, 0, 0)

    def fw(ms):
        _cb4(0x01, 2, 80, 0)
        sleep(50)
        _cb4(0x02, 2, 80, 0)
        sleep(ms)
        sp()

    def bk(ms):
        _cb4(0x01, 1, 80, 0)
        sleep(50)
        _cb4(0x02, 1, 80, 0)
        sleep(ms)
        sp()

    def lt(ms):
        _cb4(0x01, 1, 60, 0)
        sleep(50)
        _cb4(0x02, 2, 60, 0)
        sleep(ms)
        sp()

    def rt(ms):
        _cb4(0x01, 2, 60, 0)
        sleep(50)
        _cb4(0x02, 1, 60, 0)
        sleep(ms)
        sp()

    def hl(r, g, b):
        _cb4(0x04, r, g, b)
        sleep(10)
        _cb4(0x08, r, g, b)

    def hl_l(r, g, b):
        _cb4(0x04, r, g, b)

    def hl_r(r, g, b):
        _cb4(0x08, r, g, b)

    def sonar():
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
        return pin14.read_digital(), pin13.read_digital()

    try:
        i2c.init(freq=100000, sda=pin20, scl=pin19)
        hl(0, 0, 0)
        display.show("C")
    except Exception:
        display.show("c")

    _conn = None
    _buf = ""

    def _send(s):
        if _conn is None:
            return
        b = s.encode()
        for i in range(0, len(b), 20):
            try:
                ble.gatts_notify(_conn, tx_h, b[i : i + 20])
            except Exception:
                pass
            sleep(10)

    def _recv(chunk):
        global _buf
        _buf += chunk
        while True:
            idx = _buf.find("\x04")
            if idx < 0:
                break
            cmd = _buf[:idx].strip()
            _buf = _buf[idx + 1 :]
            if cmd:
                try:
                    exec(compile(cmd, "<bt>", "exec"), globals())
                except Exception:
                    pass
                _send("\x04\x04")

    def _irq(event, data):
        global _conn, _buf
        if event == 1:
            _conn = data[0]
            _buf = ""
            display.show(Image.HAPPY)
        elif event == 2:
            _conn = None
            _buf = ""
            display.show("B")
            ble.gap_advertise(100000, _ADV)
        elif event == 3:
            if data[1] == rx_h:
                _recv(ble.gatts_read(rx_h).decode("utf-8", "replace"))

    _name = b"ByteBuddies"
    _ADV = bytes([2, 0x01, 0x06, len(_name) + 1, 0x09]) + _name

    ble.irq(_irq)
    ble.gap_advertise(100000, _ADV)
    display.show("B")

except Exception as e:
    display.scroll(str(e), delay=80)
    display.show(Image.SAD)
