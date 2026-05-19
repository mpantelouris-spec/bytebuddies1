from microbit import *
import bluetooth

uart = bluetooth.UARTService()
ble = bluetooth.BLE()
ble.active(True)
ble.config(gap_name="ByteBuddies")

display.scroll("READY")

while True:
    # Send button states over Bluetooth
    msg = "A:{} B:{}\n".format(button_a.is_pressed(), button_b.is_pressed())
    uart.write(msg)

    # Read incoming Bluetooth commands
    if uart.any():
        command = uart.read().decode().strip()

        if command == "LEDON":
            display.show(Image.HEART)

        elif command == "LEDOFF":
            display.clear()

        else:
            # Try to execute as Python code
            try:
                exec(command)
            except:
                pass

    # USB serial output
    print(msg)

    sleep(200)
