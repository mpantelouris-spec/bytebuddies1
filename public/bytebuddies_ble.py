# ByteBuddies BLE Firmware for micro:bit v2
# Flash ONCE via USB at https://python.microbit.org/v/3
# Screen codes:  S=Starting  1=BT imported  2=BLE active  3=Service registered  B=Broadcasting
# Sad face + scrolling text = error — read it and tell your teacher!

from microbit import *
display.show('S')

try:
    import bluetooth
    display.show('1')

    ble = bluetooth.BLE()
    ble.active(True)
    display.show('2')

    # Nordic UART Service (NUS) — same UUIDs as MakeCode Bluetooth extension
    # TX = micro:bit → browser (NOTIFY)
    # RX = browser → micro:bit (WRITE WITHOUT RESPONSE = 0x0004)
    ((tx_h, rx_h),) = ble.gatts_register_services(((
        bluetooth.UUID('6e400001-b5b3-f393-e0a9-e50e24dcca9e'), (
            (bluetooth.UUID('6e400003-b5b3-f393-e0a9-e50e24dcca9e'), 0x0010),  # NOTIFY
            (bluetooth.UUID('6e400002-b5b3-f393-e0a9-e50e24dcca9e'), 0x0004),  # WRITE_NO_RESPONSE
        )
    ),))
    display.show('3')

    # Advertisement payload: Flags + Complete Local Name "ByteBuddies"
    _name = b'ByteBuddies'
    _ADV  = bytes([2, 0x01, 0x06, len(_name) + 1, 0x09]) + _name

    _conn = None
    _buf  = ''

    def _send(s):
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
        global _buf
        _buf += chunk
        # Accept both \n and \x04 as command terminators so ByteBuddies
        # browser app can ping with either style
        while True:
            i4  = _buf.find('\x04')
            inl = _buf.find('\n')
            if i4 < 0 and inl < 0:
                break
            if   i4  < 0: idx = inl
            elif inl < 0: idx = i4
            else:         idx = min(i4, inl)
            cmd  = _buf[:idx].strip()
            _buf = _buf[idx + 1:]
            if cmd:
                try:
                    exec(compile(cmd, '<b>', 'exec'), globals())
                except:
                    pass
                # Always reply with \x04\x04 — the completion signal
                _send('\x04\x04')

    def _irq(event, data):
        global _conn, _buf
        if event == 1:          # central connected
            _conn = data[0]
            _buf  = ''
            display.show(Image.HAPPY)
        elif event == 2:        # central disconnected
            _conn = None
            _buf  = ''
            display.show('B')
            ble.gap_advertise(100_000, _ADV)
        elif event == 3:        # write received
            if data[1] == rx_h:
                _recv(ble.gatts_read(rx_h).decode('utf-8', 'replace'))

    ble.irq(_irq)
    ble.gap_advertise(100_000, _ADV)
    display.show('B')   # Broadcasting — ready to connect!

except Exception as e:
    display.scroll(str(e), delay=80)
    display.show(Image.SAD)
