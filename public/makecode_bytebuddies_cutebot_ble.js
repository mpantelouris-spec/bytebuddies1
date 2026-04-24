/**
 * ByteBuddies ↔ Cutebot — MakeCode (JavaScript) Bluetooth bridge
 * ----------------------------------------------------------------
 * Matches ByteBuddies Robot Lab BLE protocol used with MicroPython firmware:
 *   - Each command chunk ends with ASCII 4 (Ctrl+D, \x04)
 *   - Reply with two \x04 bytes so the web app sees "raw REPL done"
 *
 * HOW TO USE IN MAKECODE (https://makecode.microbit.org)
 *   1. New project → micro:bit V2.
 *   2. Extensions → search "Bluetooth" → add the official Bluetooth package.
 *   3. Project settings (gear) → Bluetooth → enable "No pairing required" (same as Web Bluetooth).
 *   4. Switch editor to JavaScript and replace the default program with this file's body
 *      (everything below the "--- paste below ---" line), OR merge `onStart` + handlers into main.
 *   5. Download .hex to the micro:bit, then connect from ByteBuddies with Bluetooth.
 *
 * LIMITS (vs full MicroPython on the board)
 *   - Flow blocks that emit Python `if` / `while` / `for` / variables are not interpreted here.
 *   - Motion, stop, headlights, simple sleep(), and the big `exec("""...""")` setup blob are handled
 *     so normal straight-line Cutebot stacks work; complex programs still need the .py firmware.
 */

// --- paste below into MakeCode JavaScript (main) ---------------------------------

let UART_END = String.fromCharCode(4)
let REPL_DONE = String.fromCharCode(4) + String.fromCharCode(4)

/** Cutebot motor driver I2C address 0x10 → decimal 16 */
let I2C_ADDR = 16

function i2cWrite4(r, a, b, c) {
    let buf = pins.createBuffer(4)
    buf[0] = r & 255
    buf[1] = a & 255
    buf[2] = b & 255
    buf[3] = c & 255
    pins.i2cWriteBuffer(I2C_ADDR, buf)
}

function spMotors() {
    i2cWrite4(0x01, 2, 0, 0)
    basic.pause(50)
    i2cWrite4(0x02, 2, 0, 0)
}

function fw(ms) {
    i2cWrite4(0x01, 2, 80, 0)
    basic.pause(50)
    i2cWrite4(0x02, 2, 80, 0)
    basic.pause(ms)
    spMotors()
}

function bk(ms) {
    i2cWrite4(0x01, 1, 80, 0)
    basic.pause(50)
    i2cWrite4(0x02, 1, 80, 0)
    basic.pause(ms)
    spMotors()
}

function lt(ms) {
    i2cWrite4(0x01, 1, 60, 0)
    basic.pause(50)
    i2cWrite4(0x02, 2, 60, 0)
    basic.pause(ms)
    spMotors()
}

function rt(ms) {
    i2cWrite4(0x01, 2, 60, 0)
    basic.pause(50)
    i2cWrite4(0x02, 1, 60, 0)
    basic.pause(ms)
    spMotors()
}

function hl(r, g, b) {
    i2cWrite4(0x04, r, g, b)
    basic.pause(10)
    i2cWrite4(0x08, r, g, b)
}

function hl_l(r, g, b) {
    i2cWrite4(0x04, r, g, b)
}

function hl_r(r, g, b) {
    i2cWrite4(0x08, r, g, b)
}

function sonarCm() {
    pins.digitalWritePin(DigitalPin.P1, 0)
    pins.digitalWritePin(DigitalPin.P1, 1)
    pins.digitalWritePin(DigitalPin.P1, 0)
    let t = input.runningTime()
    while (pins.digitalReadPin(DigitalPin.P2) == 0) {
        if (input.runningTime() - t > 50) return 400
    }
    t = input.runningTime()
    while (pins.digitalReadPin(DigitalPin.P2) == 1) {
        if (input.runningTime() - t > 50) return 400
    }
    return (input.runningTime() - t) * 17
}

function lineSensors() {
    return [pins.digitalReadPin(DigitalPin.P14), pins.digitalReadPin(DigitalPin.P13)]
}

function cutebotInit() {
    // Same idea as MicroPython: 100 kHz-ish bus; MakeCode uses default I2C pins on V2 (P19/P20).
    for (let i = 0; i < 3; i++) {
        try {
            hl(0, 0, 0)
            basic.showString("C")
            return
        } catch (e) {
            basic.pause(100)
        }
    }
    basic.showString("c")
}

function ackRepl() {
    bluetooth.uartWriteString(REPL_DONE)
}

/** Run one line of "Python-looking" text from ByteBuddies (no trailing \\x04). */
function runOneLine(line) {
    line = line.replace(/\r/g, "").trim()
    if (!line || line[0] == "#") return

    let m = /^fw\((\d+)\)\s*$/.exec(line)
    if (m) { fw(parseInt(m[1])); return }
    m = /^bk\((\d+)\)\s*$/.exec(line)
    if (m) { bk(parseInt(m[1])); return }
    m = /^lt\((\d+)\)\s*$/.exec(line)
    if (m) { lt(parseInt(m[1])); return }
    m = /^rt\((\d+)\)\s*$/.exec(line)
    if (m) { rt(parseInt(m[1])); return }
    m = /^sp\(\)\s*$/.exec(line)
    if (m) { spMotors(); return }
    m = /^sleep\((\d+)\)\s*$/.exec(line)
    if (m) { basic.pause(parseInt(m[1])); return }
    m = /^hl\((\d+),\s*(\d+),\s*(\d+)\)\s*$/.exec(line)
    if (m) { hl(parseInt(m[1]), parseInt(m[2]), parseInt(m[3])); return }
    m = /^hl_l\((\d+),\s*(\d+),\s*(\d+)\)\s*$/.exec(line)
    if (m) { hl_l(parseInt(m[1]), parseInt(m[2]), parseInt(m[3])); return }
    m = /^hl_r\((\d+),\s*(\d+),\s*(\d+)\)\s*$/.exec(line)
    if (m) { hl_r(parseInt(m[1]), parseInt(m[2]), parseInt(m[3])); return }
    m = /^display\.show\(Image\.(\w+)\)\s*$/.exec(line)
    if (m) {
        if (m[1] == "HAPPY") basic.showIcon(IconNames.Happy)
        else if (m[1] == "SAD") basic.showIcon(IconNames.Sad)
        else if (m[1] == "HEART") basic.showIcon(IconNames.Heart)
        else basic.showString("?")
        return
    }
    m = /^display\.clear\(\)\s*$/.exec(line)
    if (m) { basic.clearScreen(); return }
}

/**
 * ByteBuddies sends a big `exec("""...""")` once over BLE with Cutebot defs — we cannot exec Python.
 * We already initialised Cutebot in onStart; acknowledge so the browser does not time out.
 */
function handleExecBlob(cmd) {
    let lines = cmd.split("\n")
    for (let i = 0; i < lines.length; i++) {
        let L = lines[i].replace(/\r/g, "").trim()
        if (L.indexOf("hl(0,0,0)") >= 0) {
            try { hl(0, 0, 0) } catch (_) {}
        }
        if (L.indexOf("display.show(Image.HAPPY)") >= 0) {
            basic.showIcon(IconNames.Happy)
        }
    }
}

function handleUartChunk(cmd) {
    cmd = cmd.replace(/\r/g, "").trim()
    if (!cmd) {
        ackRepl()
        return
    }
    if (cmd.indexOf("exec(") >= 0 && (cmd.indexOf('"""') >= 0 || cmd.indexOf("'''") >= 0)) {
        handleExecBlob(cmd)
        ackRepl()
        return
    }
    let lines = cmd.split("\n")
    for (let i = 0; i < lines.length; i++) {
        runOneLine(lines[i])
    }
    ackRepl()
}

bluetooth.onBluetoothConnected(function () {
    basic.showIcon(IconNames.Happy)
})

bluetooth.onBluetoothDisconnected(function () {
    basic.showString("B")
})

bluetooth.onUartDataReceived(UART_END, function () {
    let chunk = bluetooth.uartReadUntil(UART_END)
    handleUartChunk(chunk)
})

basic.showString("S")
bluetooth.startUartService()
cutebotInit()
basic.showString("B")
