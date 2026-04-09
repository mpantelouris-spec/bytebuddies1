// ByteBuddies BLE Bridge for micro:bit v2
// ─────────────────────────────────────────────────────────
// This firmware is pre-compiled and available directly on your ByteBuddies website.
// In Robot Lab → Setup Guide → Bluetooth, click "⚡ Flash BLE Firmware via USB"
// (or download bytebuddies_ble.hex and drag it onto the MICROBIT USB drive)
// ─────────────────────────────────────────────────────────
// Supported commands over Bluetooth:
//   fw(ms), bk(ms), lt(ms), rt(ms), sp()       — motors
//   sleep(ms)                                   — wait
//   display.show(Image.HAPPY/SAD/HEART/...)     — show icon
//   display.scroll('text')                      — scroll text
//   display.show(str(n)) / display.scroll(str(n)) — show number
//   display.set_pixel(x, y, brightness)        — LED pixel
//   display.clear()                             — clear display
//   music.pitch(freq, ms) / buzz(freq, ms)     — play tone
//   music.play(music.MELODY)                   — short chime
//   hl(r,g,b), hl_l(r,g,b), hl_r(r,g,b)       — headlights (analog P8/P9)
// ─────────────────────────────────────────────────────────

let _buf = ""
bluetooth.startUartService()
basic.showString("B")

bluetooth.onBluetoothConnected(function () {
    _buf = ""
    basic.showIcon(IconNames.Happy)
})
bluetooth.onBluetoothDisconnected(function () {
    _buf = ""
    stopAll()
    basic.showString("B")
})
bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    let line = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))
    runCmd(line.trim())
    bluetooth.uartWriteString("\u0004\u0004")
})

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

    if (fn === "fw") {
        pins.digitalWritePin(DigitalPin.P0, 1); pins.digitalWritePin(DigitalPin.P1, 0)
        pins.digitalWritePin(DigitalPin.P2, 1); pins.digitalWritePin(DigitalPin.P3, 1)
        if (a0 > 0) { basic.pause(a0); stopAll() }
    } else if (fn === "bk") {
        pins.digitalWritePin(DigitalPin.P0, 0); pins.digitalWritePin(DigitalPin.P1, 1)
        pins.digitalWritePin(DigitalPin.P2, 0); pins.digitalWritePin(DigitalPin.P3, 1)
        if (a0 > 0) { basic.pause(a0); stopAll() }
    } else if (fn === "lt") {
        pins.digitalWritePin(DigitalPin.P0, 0); pins.digitalWritePin(DigitalPin.P1, 1)
        pins.digitalWritePin(DigitalPin.P2, 1); pins.digitalWritePin(DigitalPin.P3, 0)
        if (a0 > 0) { basic.pause(a0); stopAll() }
    } else if (fn === "rt") {
        pins.digitalWritePin(DigitalPin.P0, 1); pins.digitalWritePin(DigitalPin.P1, 0)
        pins.digitalWritePin(DigitalPin.P2, 0); pins.digitalWritePin(DigitalPin.P3, 1)
        if (a0 > 0) { basic.pause(a0); stopAll() }
    } else if (fn === "sp") {
        stopAll()
    } else if (fn === "sleep") {
        basic.pause(a0)
    } else if (fn === "display.show") {
        if (inner.indexOf("SAD") >= 0)            basic.showIcon(IconNames.Sad)
        else if (inner.indexOf("HEART") >= 0)     basic.showIcon(IconNames.Heart)
        else if (inner.indexOf("ANGRY") >= 0)     basic.showIcon(IconNames.Angry)
        else if (inner.indexOf("YES") >= 0)       basic.showIcon(IconNames.Yes)
        else if (inner.indexOf("NO") >= 0)        basic.showIcon(IconNames.No)
        else if (inner.indexOf("str(") >= 0) {
            let si = inner.indexOf("str(") + 4
            let ns = inner.substr(si); let ei = ns.indexOf(")")
            basic.showNumber(parseInt(ei >= 0 ? ns.substr(0, ei) : ns))
        } else { basic.showIcon(IconNames.Happy) }
    } else if (fn === "display.scroll") {
        if (inner.indexOf("str(") >= 0) {
            let si = inner.indexOf("str(") + 4
            let ns = inner.substr(si); let ei = ns.indexOf(")")
            basic.showNumber(parseInt(ei >= 0 ? ns.substr(0, ei) : ns))
        } else {
            basic.showString(inner.split("'").join("").split('"').join(""))
        }
    } else if (fn === "display.set_pixel") {
        if (a2 > 0) { led.plot(a0, a1) } else { led.unplot(a0, a1) }
    } else if (fn === "display.clear") {
        basic.clearScreen()
    } else if (fn === "music.pitch" || fn === "buzz") {
        music.playTone(a0 > 0 ? a0 : 440, a1 > 0 ? a1 : 500)
    } else if (fn === "music.play") {
        music.playTone(784, 100); music.playTone(1047, 200)
    } else if (fn === "hl" || fn === "hl_l" || fn === "hl_r") {
        let b = (a0 + a1 + a2) / 3 * 4
        if (fn !== "hl_r") pins.analogWritePin(AnalogPin.P8, b)
        if (fn !== "hl_l") pins.analogWritePin(AnalogPin.P9, b)
    }
}

function stopAll(): void {
    pins.digitalWritePin(DigitalPin.P0, 0); pins.digitalWritePin(DigitalPin.P1, 0)
    pins.digitalWritePin(DigitalPin.P2, 0); pins.digitalWritePin(DigitalPin.P3, 0)
}
