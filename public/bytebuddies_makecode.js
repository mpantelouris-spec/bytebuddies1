// ByteBuddies BLE Bridge for micro:bit v2 — DFRobot Cutebot
// One hex for everything: works over USB serial AND Bluetooth.
// ─────────────────────────────────────────────────────────
// Motor control: I2C address 0x10 (Cutebot onboard STM8 chip)
//   Protocol: 4-byte packet [register, direction, speed, 0]
//   Left motor register:  0x01  Right motor register: 0x02
//   Direction: 1=one way, 2=other way   Speed: 0-100
//   fw/bk: both motors same dir @80
//   lt: left=1, right=2 @60    rt: left=2, right=1 @60
// Headlights: I2C registers 0x04=left, 0x08=right, [reg,R,G,B]
// ─────────────────────────────────────────────────────────

bluetooth.startUartService()
basic.showString("B")

// USB serial handler — same command format as BLE
// Website sends ping()\n on connect to detect bridge firmware
serial.onDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    let line = serial.readUntil(serial.delimiters(Delimiters.NewLine))
    let cmd = line.trim()
    if (cmd.length > 0) {
        runCmd(cmd)
        serial.writeString("\u0004\u0004")
    }
})

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
// Packet: [register, direction, speed, 0]
// register: 0x01=left motor, 0x02=right motor
// direction: 1=one way, 2=other way   speed: 0-100
function cuteMotors(lDir: number, lSpd: number, rDir: number, rSpd: number): void {
    let buf = pins.createBuffer(4)
    buf[0] = 0x01; buf[1] = lDir; buf[2] = lSpd; buf[3] = 0
    pins.i2cWriteBuffer(0x10, buf)
    basic.pause(50)
    buf[0] = 0x02; buf[1] = rDir; buf[2] = rSpd; buf[3] = 0
    pins.i2cWriteBuffer(0x10, buf)
}

function cuteStop(): void {
    let buf = pins.createBuffer(4)
    buf[0] = 0x01; buf[1] = 2; buf[2] = 0; buf[3] = 0
    pins.i2cWriteBuffer(0x10, buf)
    basic.pause(50)
    buf[0] = 0x02
    pins.i2cWriteBuffer(0x10, buf)
}

function runCmd(cmd: string): void {
    if (cmd.length === 0 || cmd.charAt(0) === "#") return
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

    // Bridge firmware probe — website sends ping() to detect this firmware
    if (fn === "ping") {
        // response is just \x04\x04 (sent by caller after runCmd returns)
        return

    // Motors — Cutebot I2C: [register, dir, speed, 0]  0x01=left, 0x02=right
    } else if (fn === "fw") {
        cuteMotors(2, 80, 2, 80)
        if (a0 > 0) { basic.pause(a0); cuteStop() }
    } else if (fn === "bk") {
        cuteMotors(1, 80, 1, 80)
        if (a0 > 0) { basic.pause(a0); cuteStop() }
    } else if (fn === "lt") {
        cuteMotors(1, 60, 2, 60)
        if (a0 > 0) { basic.pause(a0); cuteStop() }
    } else if (fn === "rt") {
        cuteMotors(2, 60, 1, 60)
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

    // Headlights — I2C: reg 0x04=left, 0x08=right, [reg, R, G, B]
    } else if (fn === "hl") {
        let buf = pins.createBuffer(4)
        buf[0] = 0x04; buf[1] = a0; buf[2] = a1; buf[3] = a2
        pins.i2cWriteBuffer(0x10, buf)
        basic.pause(10)
        buf[0] = 0x08
        pins.i2cWriteBuffer(0x10, buf)
    } else if (fn === "hl_l") {
        let buf = pins.createBuffer(4)
        buf[0] = 0x04; buf[1] = a0; buf[2] = a1; buf[3] = a2
        pins.i2cWriteBuffer(0x10, buf)
    } else if (fn === "hl_r") {
        let buf = pins.createBuffer(4)
        buf[0] = 0x08; buf[1] = a0; buf[2] = a1; buf[3] = a2
        pins.i2cWriteBuffer(0x10, buf)
    }
}
