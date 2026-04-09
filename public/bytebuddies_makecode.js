// ByteBuddies BLE Bridge for micro:bit v2 — DFRobot Cutebot
// ─────────────────────────────────────────────────────────
// This firmware is pre-compiled and available directly on your ByteBuddies website.
// In Robot Lab → Setup Guide → Bluetooth, click "⚡ Flash BLE Firmware via USB"
// (or download bytebuddies_ble.hex and drag it onto the MICROBIT USB drive)
// ─────────────────────────────────────────────────────────
// Motor control: I2C address 0x10 (Cutebot onboard STM8 chip)
// Headlights: analog P8 (left) and P9 (right)
// ─────────────────────────────────────────────────────────

bluetooth.startUartService()
basic.showString("B")

bluetooth.onBluetoothConnected(function () {
    basic.showIcon(IconNames.Happy)
})
bluetooth.onBluetoothDisconnected(function () {
    cuteStop()
    basic.showString("B")
})
bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    let line = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))
    runCmd(line.trim())
    bluetooth.uartWriteString("\u0004\u0004")
})

// Send motor command to Cutebot via I2C
// Packet: [0x01, motor_index, direction, speed]
// motor_index: 0x01=M1 left, 0x02=M2 right
// direction:   0x01=CW (fw for left), 0x02=CCW (fw for right), 0x00=stop
// speed: 0-100
function cuteMotors(lDir: number, lSpd: number, rDir: number, rSpd: number): void {
    let buf = pins.createBuffer(4)
    buf[0] = 0x01; buf[1] = 0x01; buf[2] = lDir; buf[3] = lSpd
    pins.i2cWriteBuffer(0x10, buf)
    buf[1] = 0x02; buf[2] = rDir; buf[3] = rSpd
    pins.i2cWriteBuffer(0x10, buf)
}

function cuteStop(): void {
    let buf = pins.createBuffer(4)
    buf[0] = 0x01; buf[1] = 0x01; buf[2] = 0x00; buf[3] = 0
    pins.i2cWriteBuffer(0x10, buf)
    buf[1] = 0x02
    pins.i2cWriteBuffer(0x10, buf)
}

function runCmd(cmd: string): void {
    if (cmd.length === 0 || cmd.charAt(0) === "#" || cmd.indexOf("from ") === 0 ||
        cmd.indexOf("import ") === 0 || cmd.indexOf("def ") === 0 || cmd.charAt(0) === "_") return
    let pi = cmd.indexOf("(")
    if (pi < 0) return
    let fn = cmd.substr(0, pi).trim()
    let rest = cmd.substr(pi + 1)
    let cp = rest.indexOf(")")
    let inner = (cp >= 0 ? rest.substr(0, cp) : rest).trim()
    let parts = inner.length > 0 ? inner.split(",") : []
    let a0 = parts.length > 0 ? parseInt(parts[0].trim()) : 0
    let a1 = parts.length > 1 ? parseInt(parts[1].trim()) : 0
    let a2 = parts.length > 2 ? parseInt(parts[2].trim()) : 0

    // Motors — Cutebot I2C
    if (fn === "fw") {
        cuteMotors(0x01, 80, 0x02, 80)         // M1 CW, M2 CCW = forward
        if (a0 > 0) { basic.pause(a0); cuteStop() }
    } else if (fn === "bk") {
        cuteMotors(0x02, 80, 0x01, 80)         // M1 CCW, M2 CW = backward
        if (a0 > 0) { basic.pause(a0); cuteStop() }
    } else if (fn === "lt") {
        cuteMotors(0x02, 60, 0x02, 60)         // both same dir = spin left
        if (a0 > 0) { basic.pause(a0); cuteStop() }
    } else if (fn === "rt") {
        cuteMotors(0x01, 60, 0x01, 60)         // both same dir = spin right
        if (a0 > 0) { basic.pause(a0); cuteStop() }
    } else if (fn === "sp") {
        cuteStop()
    } else if (fn === "sleep") {
        basic.pause(a0)

    // Display
    } else if (fn === "display.show") {
        if (inner.indexOf("SAD") >= 0)        basic.showIcon(IconNames.Sad)
        else if (inner.indexOf("HEART") >= 0) basic.showIcon(IconNames.Heart)
        else if (inner.indexOf("ANGRY") >= 0) basic.showIcon(IconNames.Angry)
        else if (inner.indexOf("YES") >= 0)   basic.showIcon(IconNames.Yes)
        else if (inner.indexOf("NO") >= 0)    basic.showIcon(IconNames.No)
        else if (inner.indexOf("str(") >= 0) {
            let si = inner.indexOf("str(") + 4
            let ns = inner.substr(si)
            let ei = ns.indexOf(")")
            basic.showNumber(parseInt(ei >= 0 ? ns.substr(0, ei) : ns))
        } else { basic.showIcon(IconNames.Happy) }
    } else if (fn === "display.scroll") {
        if (inner.indexOf("str(") >= 0) {
            let si = inner.indexOf("str(") + 4
            let ns = inner.substr(si)
            let ei = ns.indexOf(")")
            basic.showNumber(parseInt(ei >= 0 ? ns.substr(0, ei) : ns))
        } else {
            basic.showString(inner.split("'").join("").split('"').join(""))
        }
    } else if (fn === "display.set_pixel") {
        if (a2 > 0) { led.plot(a0, a1) } else { led.unplot(a0, a1) }
    } else if (fn === "display.clear") {
        basic.clearScreen()

    // Sound (micro:bit v2 built-in speaker)
    } else if (fn === "music.pitch" || fn === "buzz") {
        music.playTone(a0 > 0 ? a0 : 440, a1 > 0 ? a1 : 500)
    } else if (fn === "music.play") {
        music.playTone(784, 100)
        music.playTone(1047, 200)

    // Headlights — white LEDs on P8 (left) and P9 (right), analog 0-1023
    } else if (fn === "hl" || fn === "hl_l" || fn === "hl_r") {
        let b = Math.round((a0 + a1 + a2) / 3 * 4)
        if (fn !== "hl_r") pins.analogWritePin(AnalogPin.P8, b)
        if (fn !== "hl_l") pins.analogWritePin(AnalogPin.P9, b)
    }
}
