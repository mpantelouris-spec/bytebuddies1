// ByteBuddies BLE Bridge for micro:bit v2
// ─────────────────────────────────────────────────────────
// HOW TO USE:
//  1. Go to https://makecode.microbit.org → New Project
//  2. Click the gear ⚙️ → Project Settings
//     → Bluetooth → tick "No Pairing Required" → Save
//  3. Click Extensions → search "bluetooth" → add it
//  4. (Optional, for headlights) Extensions → search "neopixel" → add it
//  5. Click the "JavaScript" tab at the top of the editor
//  6. Select ALL the existing code (Ctrl+A) and DELETE it
//  7. Paste this entire file in its place
//  8. Click Download → drag the .hex file onto the MICROBIT drive
//  9. Unplug USB.  Screen shows "B" = ready to connect wirelessly!
// 10. In ByteBuddies → Robot Lab → click "📡 Bluetooth"
//     → select your "BBC micro:bit [XXXXX]" from the list
// ─────────────────────────────────────────────────────────
// Supported commands: motors, display, scroll, LED pixels,
//   sound/music, sleep, headlights (NeoPixel on P8)
// ─────────────────────────────────────────────────────────

let _buf = ""
// NeoPixel strip for headlights (P8, 2 LEDs — adjust pin/count for your robot)
let _hlStrip = neopixel.create(DigitalPin.P8, 2, NeoPixelMode.RGB)

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

// Receive newline-terminated commands from ByteBuddies
bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    let line = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))
    runCmd(line.trim())
    // Reply with \x04\x04 — the completion signal ByteBuddies waits for
    bluetooth.uartWriteString("\u0004\u0004")
})

function runCmd(cmd: string): void {
    if (cmd.length === 0) return
    // Skip Python setup lines
    if (cmd.charAt(0) === "#") return
    if (cmd.indexOf("from ") === 0) return
    if (cmd.indexOf("import ") === 0) return
    if (cmd.indexOf("def ") === 0) return
    if (cmd.indexOf("class ") === 0) return
    if (cmd.charAt(0) === "_") return

    // Parse  funcname(arg1, arg2, ...)
    let pi = cmd.indexOf("(")
    if (pi < 0) return
    let fn = cmd.substr(0, pi).trim()
    let inner = cmd.substr(pi + 1).replace(/\).*/, "").trim()
    let parts = inner.length > 0 ? inner.split(",") : []
    let a0 = parts.length > 0 ? parseInt(parts[0].trim()) : 0
    let a1 = parts.length > 1 ? parseInt(parts[1].trim()) : 0
    let a2 = parts.length > 2 ? parseInt(parts[2].trim()) : 0

    // ── Motors ──────────────────────────────────────────────────
    if (fn === "fw") {
        pins.digitalWritePin(DigitalPin.P0, 1)
        pins.digitalWritePin(DigitalPin.P1, 0)
        pins.digitalWritePin(DigitalPin.P2, 1)
        pins.digitalWritePin(DigitalPin.P3, 1)
        if (a0 > 0) { basic.pause(a0); stopAll() }
    } else if (fn === "bk") {
        pins.digitalWritePin(DigitalPin.P0, 0)
        pins.digitalWritePin(DigitalPin.P1, 1)
        pins.digitalWritePin(DigitalPin.P2, 0)
        pins.digitalWritePin(DigitalPin.P3, 1)
        if (a0 > 0) { basic.pause(a0); stopAll() }
    } else if (fn === "lt") {
        pins.digitalWritePin(DigitalPin.P0, 0)
        pins.digitalWritePin(DigitalPin.P1, 1)
        pins.digitalWritePin(DigitalPin.P2, 1)
        pins.digitalWritePin(DigitalPin.P3, 0)
        if (a0 > 0) { basic.pause(a0); stopAll() }
    } else if (fn === "rt") {
        pins.digitalWritePin(DigitalPin.P0, 1)
        pins.digitalWritePin(DigitalPin.P1, 0)
        pins.digitalWritePin(DigitalPin.P2, 0)
        pins.digitalWritePin(DigitalPin.P3, 1)
        if (a0 > 0) { basic.pause(a0); stopAll() }
    } else if (fn === "sp") {
        stopAll()

    // ── Wait / sleep ─────────────────────────────────────────────
    } else if (fn === "sleep") {
        basic.pause(a0)

    // ── Display: icons ───────────────────────────────────────────
    } else if (fn === "display.show") {
        if (inner.indexOf("HAPPY") >= 0)      basic.showIcon(IconNames.Happy)
        else if (inner.indexOf("SAD") >= 0)   basic.showIcon(IconNames.Sad)
        else if (inner.indexOf("HEART") >= 0) basic.showIcon(IconNames.Heart)
        else if (inner.indexOf("ANGRY") >= 0) basic.showIcon(IconNames.Angry)
        else if (inner.indexOf("ASLEEP") >= 0) basic.showIcon(IconNames.Asleep)
        else if (inner.indexOf("SURPRISED") >= 0) basic.showIcon(IconNames.Surprised)
        else if (inner.indexOf("CONFUSED") >= 0) basic.showIcon(IconNames.Confused)
        else if (inner.indexOf("YES") >= 0)   basic.showIcon(IconNames.Yes)
        else if (inner.indexOf("NO") >= 0)    basic.showIcon(IconNames.No)
        else if (inner.indexOf("SKULL") >= 0) basic.showIcon(IconNames.Skull)
        else if (inner.indexOf("DIAMOND") >= 0) basic.showIcon(IconNames.Diamond)
        else if (inner.indexOf("SQUARE") >= 0) basic.showIcon(IconNames.Square)
        else if (inner.indexOf("TRIANGLE") >= 0) basic.showIcon(IconNames.Triangle)
        else if (inner.indexOf("CHESSBOARD") >= 0) basic.showIcon(IconNames.Chessboard)
        else if (inner.indexOf("TARGET") >= 0) basic.showIcon(IconNames.Target)
        else if (inner.indexOf("ARROW_N") >= 0) basic.showIcon(IconNames.ArrowNorth)
        else if (inner.indexOf("ARROW_S") >= 0) basic.showIcon(IconNames.ArrowSouth)
        else if (inner.indexOf("ARROW_E") >= 0) basic.showIcon(IconNames.ArrowEast)
        else if (inner.indexOf("ARROW_W") >= 0) basic.showIcon(IconNames.ArrowWest)
        else if (inner.indexOf("str(") >= 0) {
            // display.show(str(n)) — extract the number and show it
            let numStr = inner.replace("str(", "").replace(/[^0-9\-]/g, "")
            basic.showNumber(parseInt(numStr))
        }
        else basic.showIcon(IconNames.Happy)

    // ── Display: scroll text / numbers ───────────────────────────
    } else if (fn === "display.scroll") {
        if (inner.indexOf("str(") >= 0) {
            let numStr = inner.replace("str(", "").replace(/[^0-9\-]/g, "")
            basic.showNumber(parseInt(numStr))
        } else {
            let txt = inner.replace(/['"]/g, "")
            basic.showString(txt)
        }

    // ── Display: individual pixel ────────────────────────────────
    } else if (fn === "display.set_pixel") {
        // display.set_pixel(x, y, brightness 0-9)
        // MakeCode led.plotBrightness takes 0-255, so scale up
        if (a2 > 0) led.plotBrightness(a0, a1, Math.round(a2 * 28))
        else led.unplot(a0, a1)

    // ── Display: clear ───────────────────────────────────────────
    } else if (fn === "display.clear") {
        basic.clearScreen()

    // ── Sound / music ────────────────────────────────────────────
    } else if (fn === "music.pitch") {
        // music.pitch(freq, duration_ms)
        music.playTone(a0, a1)

    } else if (fn === "music.play") {
        // music.play(music.MELODY_NAME) — map common melodies
        if (inner.indexOf("POWER_UP") >= 0)    music.beginMelody(music.powerUp, MelodyOptions.Once)
        else if (inner.indexOf("POWER_DOWN") >= 0) music.beginMelody(music.powerDown, MelodyOptions.Once)
        else if (inner.indexOf("JUMP_UP") >= 0)  music.beginMelody(music.jumpUp, MelodyOptions.Once)
        else if (inner.indexOf("JUMP_DOWN") >= 0) music.beginMelody(music.jumpDown, MelodyOptions.Once)
        else if (inner.indexOf("BIRTHDAY") >= 0) music.beginMelody(music.birthday, MelodyOptions.Once)
        else if (inner.indexOf("RINGTONE") >= 0) music.beginMelody(music.ringtone, MelodyOptions.Once)
        else if (inner.indexOf("BA_DING") >= 0 || inner.indexOf("HAPPY") >= 0) music.beginMelody(music.baDing, MelodyOptions.Once)
        else if (inner.indexOf("DADADADUM") >= 0) music.beginMelody(music.dadadadum, MelodyOptions.Once)
        else if (inner.indexOf("ENTERTAINER") >= 0) music.beginMelody(music.entertainer, MelodyOptions.Once)
        else if (inner.indexOf("PRELUDE") >= 0) music.beginMelody(music.prelude, MelodyOptions.Once)
        else if (inner.indexOf("ODE") >= 0)     music.beginMelody(music.ode, MelodyOptions.Once)
        else if (inner.indexOf("NYAN") >= 0)    music.beginMelody(music.nyan, MelodyOptions.Once)
        else if (inner.indexOf("FUNK") >= 0)    music.beginMelody(music.funk, MelodyOptions.Once)
        else if (inner.indexOf("BLUES") >= 0)   music.beginMelody(music.blues, MelodyOptions.Once)
        else if (inner.indexOf("WEDDING") >= 0) music.beginMelody(music.wedding, MelodyOptions.Once)
        else if (inner.indexOf("FUNERAL") >= 0) music.beginMelody(music.funeral, MelodyOptions.Once)
        else if (inner.indexOf("PUNCHLINE") >= 0) music.beginMelody(music.punchline, MelodyOptions.Once)
        else music.beginMelody(music.baDing, MelodyOptions.Once)

    // ── Headlights (NeoPixel on P8, 2 LEDs: index 0=left, 1=right) ─
    } else if (fn === "hl") {
        // hl(r, g, b) — both headlights
        _hlStrip.setPixelColor(0, neopixel.rgb(a0, a1, a2))
        _hlStrip.setPixelColor(1, neopixel.rgb(a0, a1, a2))
        _hlStrip.show()
    } else if (fn === "hl_l") {
        // hl_l(r, g, b) — left headlight only
        _hlStrip.setPixelColor(0, neopixel.rgb(a0, a1, a2))
        _hlStrip.show()
    } else if (fn === "hl_r") {
        // hl_r(r, g, b) — right headlight only
        _hlStrip.setPixelColor(1, neopixel.rgb(a0, a1, a2))
        _hlStrip.show()

    // ── Buzzer (simple on/off using pin write) ────────────────────
    } else if (fn === "buzz") {
        // buzz(freq, duration) — same as music.pitch
        music.playTone(a0 > 0 ? a0 : 440, a1 > 0 ? a1 : 500)
    }
}

function stopAll(): void {
    pins.digitalWritePin(DigitalPin.P0, 0)
    pins.digitalWritePin(DigitalPin.P1, 0)
    pins.digitalWritePin(DigitalPin.P2, 0)
    pins.digitalWritePin(DigitalPin.P3, 0)
}
