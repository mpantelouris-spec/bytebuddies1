# ByteBuddies general BLE bridge for micro:bit v2.
# Uses the simplest stable UART pattern (B5B3 + WRITE_NO_RESPONSE 0x0004)
# to maximize compatibility with classroom firmware builds.

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
            (UUID("6e400003-b5b3-f393-e0a9-e50e24dcca9e"), 0x0010),  # NOTIFY
            (UUID("6e400002-b5b3-f393-e0a9-e50e24dcca9e"), 0x0004),  # WRITE_NO_RESPONSE
        )
    ),))

    _name = b"ByteBuddies"
    _ADV = bytes([2, 0x01, 0x06, len(_name) + 1, 0x09]) + _name

    _conn = None
    _buf = ""

    def _send(s):
        if _conn is None:
            return
        b = s.encode() if isinstance(s, str) else s
        for i in range(0, len(b), 20):
            try:
                ble.gatts_notify(_conn, tx_h, b[i:i + 20])
            except:
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
            _buf = _buf[idx + 1:]
            if cmd:
                try:
                    exec(cmd)
                except:
                    pass
                _send("\x04\x04")

    def _irq(event, data):
        global _conn, _buf
        if event == 1:  # connected
            _conn = data[0]
            _buf = ""
            display.show(Image.HAPPY)
        elif event == 2:  # disconnected
            _conn = None
            _buf = ""
            display.show("B")
            ble.gap_advertise(100000, _ADV)
        elif event == 3:  # write
            if data[1] == rx_h:
                _recv(ble.gatts_read(rx_h).decode("utf-8", "replace"))

    ble.irq(_irq)
    ble.gap_advertise(100000, _ADV)
    display.show("B")

except Exception as e:
    display.scroll(str(e), delay=80)
    display.show(Image.SAD)
