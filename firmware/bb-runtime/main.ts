/**
 * ByteBuddies Runtime for micro:bit (V1 + V2)
 *
 * Flash this ONCE. After that ByteBuddies sends programs over Bluetooth or USB:
 * they are saved on the micro:bit and run straight away (and again on reset).
 *
 * Protocol — one line per message, each answered with one line:
 *   HELLO            → BB:RT1:<kit>:<v1|v2>:<saved lines>
 *   KIT <name>       → OK          (generic, cutebot, maqueen, bitbot, move, ringbit)
 *   BEGIN / L <op> / END  → OK … then OK SAVED <n> | OK NOSAVE <n>, and the program runs
 *   RUN / STOP       → OK
 *   DO <op>          → OK when finished (runs one instruction now)
 *   Q <operand>      → V:<value>   (read a sensor, e.g. Q $D)
 * Program instructions are described in src/utils/runtimeCompiler.js.
 */

// ── State ────────────────────────────────────────────────────────────────────
let kit = "generic"
let prog: string[] = []
let loading: string[] = []
let running = false
let stopReq = false
let speedPct = 100
let varNames: string[] = []
let varVals: number[] = []
let replyBle = false

function reply(s: string) {
    if (replyBle) bluetooth.uartWriteLine(s) // @ble
    if (!replyBle) serial.writeLine(s)
}

// ── Variables ───────────────────────────────────────────────────────────────
function getVar(n: string): number {
    const i = varNames.indexOf(n)
    return i < 0 ? 0 : varVals[i]
}
function setVar(n: string, v: number) {
    const i = varNames.indexOf(n)
    if (i < 0) { varNames.push(n); varVals.push(v) } else varVals[i] = v
}

// ── Kit drivers ─────────────────────────────────────────────────────────────
function clamp(v: number, lo: number, hi: number) { return v < lo ? lo : v > hi ? hi : v }

function i2c4(addr: number, a: number, b: number, c: number, d: number) {
    const buf = pins.createBuffer(4)
    buf[0] = a; buf[1] = b; buf[2] = c; buf[3] = d
    pins.i2cWriteBuffer(addr, buf)
}
let moveReady = false
function moveInit() {
    if (moveReady) return
    const b = pins.createBuffer(2)
    b[0] = 0x01; b[1] = 0x0D; pins.i2cWriteBuffer(0x62, b)   // MODE2
    b[0] = 0x08; b[1] = 0xAA; pins.i2cWriteBuffer(0x62, b)   // outputs = PWM
    b[0] = 0x00; b[1] = 0x00; pins.i2cWriteBuffer(0x62, b)   // MODE1 wake
    moveReady = true
}

/** Drive both wheels, -100..100 each (scaled by the current speed). */
function motors(l: number, r: number) {
    l = clamp(Math.idiv(l * speedPct, 100), -100, 100)
    r = clamp(Math.idiv(r * speedPct, 100), -100, 100)
    if (kit == "cutebot") {
        i2c4(0x10, 0x01, l >= 0 ? 0x02 : 0x01, Math.abs(l), 0)
        i2c4(0x10, 0x02, r >= 0 ? 0x02 : 0x01, Math.abs(r), 0)
    } else if (kit == "maqueen") {
        const b = pins.createBuffer(3)
        b[0] = 0x00; b[1] = l >= 0 ? 0 : 1; b[2] = Math.idiv(Math.abs(l) * 255, 100); pins.i2cWriteBuffer(0x10, b)
        b[0] = 0x02; b[1] = r >= 0 ? 0 : 1; b[2] = Math.idiv(Math.abs(r) * 255, 100); pins.i2cWriteBuffer(0x10, b)
    } else if (kit == "bitbot") {
        pins.analogWritePin(AnalogPin.P0, l > 0 ? Math.idiv(l * 1023, 100) : 0)
        pins.analogWritePin(AnalogPin.P8, l < 0 ? Math.idiv(-l * 1023, 100) : 0)
        pins.analogWritePin(AnalogPin.P1, r > 0 ? Math.idiv(r * 1023, 100) : 0)
        pins.analogWritePin(AnalogPin.P12, r < 0 ? Math.idiv(-r * 1023, 100) : 0)
    } else if (kit == "move") {
        moveInit()
        const b = pins.createBuffer(5)
        b[0] = 0xA2
        b[1] = r > 0 ? Math.idiv(r * 255, 100) : 0; b[2] = r < 0 ? Math.idiv(-r * 255, 100) : 0
        b[3] = l > 0 ? Math.idiv(l * 255, 100) : 0; b[4] = l < 0 ? Math.idiv(-l * 255, 100) : 0
        pins.i2cWriteBuffer(0x62, b)
    } else if (kit == "ringbit") {
        pins.servoWritePin(AnalogPin.P2, 90 + Math.idiv(l * 9, 10))
        pins.servoWritePin(AnalogPin.P1, 90 - Math.idiv(r * 9, 10))
    } else {
        // generic H-bridge: left P0 fwd / P1 back, right P2 fwd / P12 back
        pins.analogWritePin(AnalogPin.P0, l > 0 ? Math.idiv(l * 1023, 100) : 0)
        pins.analogWritePin(AnalogPin.P1, l < 0 ? Math.idiv(-l * 1023, 100) : 0)
        pins.analogWritePin(AnalogPin.P2, r > 0 ? Math.idiv(r * 1023, 100) : 0)
        pins.analogWritePin(AnalogPin.P12, r < 0 ? Math.idiv(-r * 1023, 100) : 0)
    }
}
function halt() {
    if (kit == "ringbit") { pins.servoWritePin(AnalogPin.P2, 90); pins.servoWritePin(AnalogPin.P1, 90) }
    else motors(0, 0)
}

function sonarPins(): number[] {
    if (kit == "cutebot") return [DigitalPin.P8, DigitalPin.P12]
    if (kit == "maqueen") return [DigitalPin.P1, DigitalPin.P2]
    if (kit == "bitbot") return [DigitalPin.P15, DigitalPin.P15]
    if (kit == "move") return [DigitalPin.P13, DigitalPin.P14]
    return [DigitalPin.P1, DigitalPin.P2]
}
function distanceCm(): number {
    const p = sonarPins()
    pins.setPull(p[0], PinPullMode.PullNone)
    pins.digitalWritePin(p[0], 0); control.waitMicros(2)
    pins.digitalWritePin(p[0], 1); control.waitMicros(10)
    pins.digitalWritePin(p[0], 0)
    const us = pins.pulseIn(p[1], PulseValue.High, 25000)
    return us <= 0 ? 400 : Math.idiv(us, 58)
}
/** 1 = this side of the robot is over a dark line */
function line(left: boolean): number {
    if (kit == "cutebot" || kit == "maqueen") {
        const pin = left ? DigitalPin.P13 : DigitalPin.P14
        pins.setPull(pin, PinPullMode.PullNone)
        return pins.digitalReadPin(pin) == 0 ? 1 : 0
    }
    if (kit == "bitbot") return pins.digitalReadPin(left ? DigitalPin.P11 : DigitalPin.P5)
    if (kit == "move") return pins.analogReadPin(left ? AnalogPin.P2 : AnalogPin.P1) > 512 ? 1 : 0
    return 0
}
function headlights(r: number, g: number, b: number, side: number) {
    // side: 0 both, 1 left, 2 right
    if (kit == "cutebot") {
        if (side != 2) i2c4(0x10, 0x08, r, g, b)
        if (side != 1) i2c4(0x10, 0x04, r, g, b)
    } else if (kit == "maqueen") {
        const on = r + g + b > 0 ? 1 : 0
        if (side != 2) pins.digitalWritePin(DigitalPin.P8, on)
        if (side != 1) pins.digitalWritePin(DigitalPin.P12, on)
    }
    // Bit:Bot / Move lights are NeoPixels, which MakeCode cannot drive while Bluetooth is on.
}

// ── Operands & conditions ───────────────────────────────────────────────────
function isNum(s: string): boolean {
    if (s.length == 0) return false
    const c = s.charCodeAt(0)
    return (c >= 48 && c <= 57) || c == 45
}
function val(t: string): number {
    if (isNum(t)) return parseInt(t)
    if (t.charAt(0) == "$") return sensor(t.substr(1))
    return getVar(t)
}
function sensor(s: string): number {
    if (s == "D") return distanceCm()
    if (s == "LL") return line(true)
    if (s == "LR") return line(false)
    if (s == "LT") return input.lightLevel()
    if (s == "BA") return input.buttonIsPressed(Button.A) ? 1 : 0
    if (s == "BB") return input.buttonIsPressed(Button.B) ? 1 : 0
    if (s == "TM") return input.temperature() // @full
    if (s == "AX") return input.acceleration(Dimension.X) // @full
    if (s == "AY") return input.acceleration(Dimension.Y) // @full
    if (s == "AZ") return input.acceleration(Dimension.Z) // @full
    if (s == "SH") return input.isGesture(Gesture.Shake) ? 1 : 0 // @full
    if (s == "TL") return input.isGesture(Gesture.TiltLeft) ? 1 : 0 // @full
    if (s == "TR") return input.isGesture(Gesture.TiltRight) ? 1 : 0 // @full
    if (s == "TF") return input.isGesture(Gesture.LogoDown) ? 1 : 0 // @full
    if (s == "TB") return input.isGesture(Gesture.LogoUp) ? 1 : 0 // @full
    if (s == "TP0") return input.pinIsPressed(TouchPin.P0) ? 1 : 0
    if (s == "TP1") return input.pinIsPressed(TouchPin.P1) ? 1 : 0
    if (s == "TP2") return input.pinIsPressed(TouchPin.P2) ? 1 : 0
    return 0
}
function test(a: number, op: string, b: number): boolean {
    if (op == "<") return a < b
    if (op == ">") return a > b
    if (op == "=") return a == b
    if (op == "!") return a != b
    if (op == "L") return a <= b
    if (op == "G") return a >= b
    return false
}
function calc(a: number, op: string, b: number): number {
    if (op == "+") return a + b
    if (op == "-") return a - b
    if (op == "*") return a * b
    if (op == "/") return b == 0 ? 0 : Math.idiv(a, b)
    if (op == "%") return b == 0 ? 0 : a % b
    return a
}
function rest(t: string[], from: number): string {
    let s = ""
    for (let i = from; i < t.length; i++) s += (i > from ? " " : "") + t[i]
    return s
}

function tone(hz: number, ms: number) {
    music.playTone(hz, ms) // @v2
    pins.analogPitch(hz, ms) // @v1
}

// ── Wait that can be interrupted by STOP ───────────────────────────────────
function waitMs(ms: number) {
    const end = input.runningTime() + ms
    while (input.runningTime() < end) {
        if (stopReq) return
        basic.pause(Math.min(20, end - input.runningTime()))
    }
}
function drive(l: number, r: number, ms: number) { motors(l, r); waitMs(ms); halt() }

// ── Run one instruction. Returns the next program counter. ─────────────────
function step(line: string, pc: number): number {
    const t = line.split(" ")
    const op = t[0]
    if (op == "F") drive(100, 100, val(t[1]))
    else if (op == "B") drive(-100, -100, val(t[1]))
    else if (op == "L") drive(-75, 75, val(t[1]))
    else if (op == "R") drive(75, -75, val(t[1]))
    else if (op == "S") halt()
    else if (op == "M") motors(val(t[1]), val(t[2]))
    else if (op == "SP") speedPct = clamp(val(t[1]), 0, 100)
    else if (op == "W") waitMs(val(t[1]))
    else if (op == "=") setVar(t[1], val(t[2]))
    else if (op == "+" || op == "-" || op == "*" || op == "/") setVar(t[1], calc(getVar(t[1]), op, val(t[2])))
    else if (op == "OP") setVar(t[1], calc(val(t[2]), t[3], val(t[4])))
    else if (op == "RN") setVar(t[1], randint(val(t[2]), val(t[3])))
    else if (op == "AB") setVar(t[1], Math.abs(val(t[2])))
    else if (op == "MP") { const d = val(t[4]) - val(t[3]); setVar(t[1], d == 0 ? val(t[5]) : val(t[5]) + Math.idiv((val(t[2]) - val(t[3])) * (val(t[6]) - val(t[5])), d)) }
    else if (op == "CN") setVar(t[1], clamp(getVar(t[1]), val(t[2]), val(t[3])))
    else if (op == "J") return parseInt(t[1])
    else if (op == "JF") { if (!test(val(t[1]), t[2], val(t[3]))) return parseInt(t[4]) }
    else if (op == "T") basic.showString(rest(t, 1), 80)
    else if (op == "N") basic.showNumber(val(t[1]), 80)
    else if (op == "I") showIcon(t[1])
    else if (op == "C") basic.clearScreen()
    else if (op == "PX") { if (val(t[3]) > 0) led.plotBrightness(val(t[1]), val(t[2]), val(t[3]) * 28); else led.unplot(val(t[1]), val(t[2])) }
    else if (op == "HL") headlights(val(t[1]), val(t[2]), val(t[3]), 0)
    else if (op == "HLL") headlights(val(t[1]), val(t[2]), val(t[3]), 1)
    else if (op == "HLR") headlights(val(t[1]), val(t[2]), val(t[3]), 2)
    else if (op == "TN") tone(val(t[1]), val(t[2]))
    else if (op == "BZ") tone(440, val(t[1]))
    else if (op == "MY") playMelody(t[1]) // @full
    else if (op == "SV") pins.servoWritePin(apinFor(val(t[1])), clamp(val(t[2]), 0, 180))
    else if (op == "SW") { // @full
        const a = val(t[2]); const b = val(t[3]); const dir = a <= b ? 2 : -2 // @full
        for (let x = a; dir > 0 ? x <= b : x >= b; x += dir) { pins.servoWritePin(apinFor(val(t[1])), x); waitMs(15); if (stopReq) break } // @full
    } // @full
    else if (op == "PH") pins.digitalWritePin(pinFor(val(t[1])), 1)
    else if (op == "PL") pins.digitalWritePin(pinFor(val(t[1])), 0)
    else if (op == "PW") pins.analogWritePin(apinFor(val(t[1])), clamp(val(t[2]), 0, 1023))
    else if (op == "LG") reply("LOG:" + rest(t, 1))
    else if (op == "FL") followLine(val(t[1])) // @full
    else if (op == "AW") avoidWalls(val(t[1])) // @full
    else if (op == "X") return prog.length
    return pc + 1
}

function pinFor(n: number): DigitalPin {
    const all = [DigitalPin.P0, DigitalPin.P1, DigitalPin.P2, DigitalPin.P3, DigitalPin.P4, DigitalPin.P5, DigitalPin.P6, DigitalPin.P7, DigitalPin.P8, DigitalPin.P9, DigitalPin.P10, DigitalPin.P11, DigitalPin.P12, DigitalPin.P13, DigitalPin.P14, DigitalPin.P15, DigitalPin.P16]
    return all[clamp(n, 0, 16)]
}
function apinFor(n: number): AnalogPin {
    const all = [AnalogPin.P0, AnalogPin.P1, AnalogPin.P2, AnalogPin.P3, AnalogPin.P4, AnalogPin.P5, AnalogPin.P6, AnalogPin.P7, AnalogPin.P8, AnalogPin.P9, AnalogPin.P10, AnalogPin.P11, AnalogPin.P12, AnalogPin.P13, AnalogPin.P14, AnalogPin.P15, AnalogPin.P16]
    return all[clamp(n, 0, 16)]
}
// Icons as 25-character LED patterns (smaller than the built-in icon library)
const ICON_NAMES = ["HAPPY", "SAD", "HEART", "SURPRISED", "ANGRY", "ASLEEP", "CONFUSED", "YES", "NO", "ARROW_N", "ARROW_S", "ARROW_E", "ARROW_W"]
const ICON_LEDS = ["0000001010000001000101110", "0000001010000000111010001", "0101011111111110111000100", "0101000000001000101000100", "1000101010000001111110101", "0000011011000000111000000", "0000001010000000101010101", "0000000001000101010001000", "1000101010001000101010001", "0010001110101010010000100", "0010000100101010111000100", "0010000010111110001000100", "0010001000111110100000100"]
function showIcon(n: string) {
    let i = ICON_NAMES.indexOf(n)
    if (i < 0) i = 0
    const p = ICON_LEDS[i]
    basic.clearScreen()
    for (let k = 0; k < 25; k++) if (p.charAt(k) == "1") led.plot(k % 5, Math.idiv(k, 5))
}
// Short tunes as note lists (the built-in melody library is too big alongside Bluetooth)
function playMelody(n: string) { // @full
    let notes = [523, 659, 784] // @full
    if (n == "sad") notes = [392, 330, 262] // @full
    else if (n == "power_up") notes = [262, 330, 392, 523] // @full
    else if (n == "siren") notes = [523, 392, 523, 392] // @full
    else if (n == "birthday") notes = [262, 262, 294, 262, 349, 330] // @full
    else if (n == "twinkle") notes = [262, 262, 392, 392, 440, 440, 392] // @full
    for (let i = 0; i < notes.length && !stopReq; i++) tone(notes[i], 220) // @full
} // @full
function followLine(ms: number) { // @full
    const end = input.runningTime() + ms // @full
    while (input.runningTime() < end && !stopReq) { // @full
        const l = line(true); const r = line(false) // @full
        if (l && r) motors(45, 45) // @full
        else if (l) motors(10, 45) // @full
        else if (r) motors(45, 10) // @full
        else motors(25, 25) // @full
        basic.pause(20) // @full
    } // @full
    halt() // @full
} // @full
function avoidWalls(ms: number) { // @full
    const end = input.runningTime() + ms // @full
    while (input.runningTime() < end && !stopReq) { // @full
        if (distanceCm() < 20) { drive(-60, -60, 300); drive(75, -75, 450) } // @full
        else { motors(50, 50); basic.pause(40) } // @full
    } // @full
    halt() // @full
} // @full

// ── Running a program ──────────────────────────────────────────────────────
function runProgram() {
    if (running) { stopReq = true; while (running) basic.pause(10) }
    stopReq = false
    running = true
    varNames = []; varVals = []
    speedPct = 100
    control.inBackground(function () {
        let pc = 0
        let steps = 0
        while (pc >= 0 && pc < prog.length && !stopReq) {
            pc = step(prog[pc], pc)
            steps++
            if (steps % 25 == 0) basic.pause(1) // let Bluetooth and STOP through
        }
        halt()
        running = false
        reply("DONE")
    })
}

// ── Saving programs (survive reset) ────────────────────────────────────────
const CHUNK = 28
const MAX_CHUNKS = 15
function saveProgram(): boolean {
    const text = prog.join("\n")
    const chunks = Math.idiv(text.length + CHUNK - 1, CHUNK)
    if (chunks > MAX_CHUNKS) { flashstorage.put("pn", "0"); return false }
    for (let i = 0; i < chunks; i++) flashstorage.put("p" + i, text.substr(i * CHUNK, CHUNK))
    flashstorage.put("pn", "" + chunks)
    return loadProgram() && prog.join("\n") == text
}
function loadProgram(): boolean {
    const n = parseInt(flashstorage.get("pn"))
    if (!(n > 0)) return false
    let text = ""
    for (let i = 0; i < n; i++) text += flashstorage.get("p" + i)
    prog = text.split("\n")
    return true
}

// ── Commands from ByteBuddies ──────────────────────────────────────────────
function handle(line: string) {
    line = line.trim()
    if (line.length == 0) return
    const sp = line.indexOf(" ")
    const cmd = sp < 0 ? line : line.substr(0, sp)
    const arg = sp < 0 ? "" : line.substr(sp + 1)
    if (cmd == "HELLO") {
        reply("BB:RT1:" + kit + ":" + (control.ramSize() > 100000 ? "v2" : "v1") + ":" + prog.length)
    } else if (cmd == "KIT") {
        kit = arg; moveReady = false
        flashstorage.put("kit", kit)
        halt()
        reply("OK")
    } else if (cmd == "BEGIN") {
        stopReq = true
        loading = []
        reply("OK")
    } else if (cmd == "L") {
        loading.push(arg)
        reply("OK")
    } else if (cmd == "END") {
        prog = loading
        loading = []
        const saved = saveProgram()
        reply((saved ? "OK SAVED " : "OK NOSAVE ") + prog.length)
        showIcon("YES")
        basic.pause(300)
        runProgram()
    } else if (cmd == "RUN") {
        reply("OK")
        runProgram()
    } else if (cmd == "STOP") {
        stopReq = true
        halt()
        music.stopAllSounds() // @v2
        reply("OK")
    } else if (cmd == "DO") {
        stopReq = false
        step(arg, 0)
        reply("OK")
    } else if (cmd == "Q") {
        reply("V:" + val(arg))
    } else {
        reply("ERR " + cmd)
    }
}

bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () { // @ble
    replyBle = true // @ble
    handle(bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))) // @ble
}) // @ble
serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    replyBle = false
    handle(serial.readUntil(serial.delimiters(Delimiters.NewLine)))
})
bluetooth.onBluetoothConnected(function () { showIcon("HAPPY") }) // @ble
bluetooth.onBluetoothDisconnected(function () { basic.showString("B") }) // @ble
input.onButtonPressed(Button.A, function () { if (prog.length) runProgram() })
input.onButtonPressed(Button.B, function () { stopReq = true; halt() })

// ── Start up ───────────────────────────────────────────────────────────────
serial.redirectToUSB()
serial.setBaudRate(BaudRate.BaudRate115200)
bluetooth.startUartService() // @ble
const savedKit = flashstorage.get("kit")
if (savedKit.length > 0) kit = savedKit
halt()
basic.showString("B")
if (loadProgram()) {
    basic.pause(600)
    runProgram()
}
