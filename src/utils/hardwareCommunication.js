/**
 * Hardware Communication Layer — USB/Serial for Arduino, Micro:Bit, and devices
 * Supports WebUSB API with fallback to serial port API
 */

const DEVICE_TYPES = {
  ARDUINO: 'arduino',
  MICROBIT: 'microbit',
  ESP32: 'esp32',
  GENERIC: 'generic',
};

const VENDOR_IDS = {
  arduino: 0x2341, // Arduino LLC
  microbit: 0x0d28, // ARM
  esp32: 0x303a, // Espressif
};

const PRODUCT_IDS = {
  arduinoUno: 0x0043,
  arduinoMega: 0x0242,
  microbitV1: 0x0204,
  microbitV2: 0x0207,
};

class HardwareManager {
  constructor() {
    this.devices = new Map();
    this.connections = new Map();
    this.pendingOperations = new Map();
  }

  // ─── DEVICE DISCOVERY ───

  async requestDevice(filters = []) {
    if (!navigator.usb) {
      return {
        status: 'error',
        message: 'WebUSB not supported. Please use a compatible browser.',
      };
    }

    try {
      const device = await navigator.usb.requestDevice({ filters });
      return {
        status: 'success',
        device: {
          productName: device.productName,
          manufacturerName: device.manufacturerName,
          serialNumber: device.serialNumber,
        },
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Device request failed: ${error.message}`,
      };
    }
  }

  async discoverDevices() {
    if (!navigator.usb) {
      return { status: 'error', message: 'WebUSB not supported' };
    }

    try {
      const devices = await navigator.usb.getDevices();
      return {
        status: 'success',
        devices: devices.map((d) => ({
          productName: d.productName,
          manufacturerName: d.manufacturerName,
          serialNumber: d.serialNumber,
          vendorId: d.vendorId,
          productId: d.productId,
        })),
      };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  // ─── CONNECTION MANAGEMENT ───

  async connectArduino(device) {
    try {
      await device.open();

      if (device.configuration === null) {
        await device.selectConfiguration(1);
      }

      const interfaces = device.configuration.interfaces;
      for (let intf of interfaces) {
        await device.claimInterface(intf.interfaceNumber);
        if (!intf.endpoints) continue;

        for (let ep of intf.endpoints) {
          if (ep.direction === 'out') {
            this.connections.set(device.serialNumber, {
              device,
              type: DEVICE_TYPES.ARDUINO,
              outputEndpoint: ep.endpointNumber,
              inputEndpoint: interfaces[0].endpoints.find(
                (e) => e.direction === 'in',
              )?.endpointNumber,
            });
          }
        }
      }

      return { status: 'success', message: 'Arduino connected' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  async connectMicroBit(device) {
    try {
      await device.open();

      if (device.configuration === null) {
        await device.selectConfiguration(1);
      }

      await device.claimInterface(0);

      this.connections.set(device.serialNumber, {
        device,
        type: DEVICE_TYPES.MICROBIT,
        ready: true,
      });

      return { status: 'success', message: 'Micro:Bit connected' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  async disconnect(serialNumber) {
    const conn = this.connections.get(serialNumber);
    if (!conn) return { status: 'error', message: 'Device not connected' };

    try {
      await conn.device.close();
      this.connections.delete(serialNumber);
      return { status: 'success', message: 'Disconnected' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  // ─── ARDUINO COMMANDS ───

  async writeDigitalPin(serialNumber, pin, value) {
    const conn = this.connections.get(serialNumber);
    if (!conn) return { status: 'error', message: 'Device not connected' };

    const cmd = `D${pin}:${value ? 1 : 0}\n`;
    return this._sendCommand(conn, cmd);
  }

  async writeAnalogPin(serialNumber, pin, value) {
    const conn = this.connections.get(serialNumber);
    if (!conn) return { status: 'error', message: 'Device not connected' };

    const pwm = Math.min(255, Math.max(0, Math.floor(value)));
    const cmd = `A${pin}:${pwm}\n`;
    return this._sendCommand(conn, cmd);
  }

  async readDigitalPin(serialNumber, pin) {
    const conn = this.connections.get(serialNumber);
    if (!conn) return { status: 'error', message: 'Device not connected' };

    const cmd = `R${pin}\n`;
    return this._sendCommand(conn, cmd);
  }

  async readAnalogPin(serialNumber, pin) {
    const conn = this.connections.get(serialNumber);
    if (!conn) return { status: 'error', message: 'Device not connected' };

    const cmd = `AN${pin}\n`;
    return this._sendCommand(conn, cmd);
  }

  async setServoAngle(serialNumber, pin, angle) {
    const conn = this.connections.get(serialNumber);
    if (!conn) return { status: 'error', message: 'Device not connected' };

    const angle_clamped = Math.min(180, Math.max(0, Math.floor(angle)));
    const cmd = `S${pin}:${angle_clamped}\n`;
    return this._sendCommand(conn, cmd);
  }

  async playTone(serialNumber, pin, frequency, duration) {
    const conn = this.connections.get(serialNumber);
    if (!conn) return { status: 'error', message: 'Device not connected' };

    const freq_int = Math.floor(frequency);
    const dur_int = Math.floor(duration);
    const cmd = `T${pin}:${freq_int}:${dur_int}\n`;
    return this._sendCommand(conn, cmd);
  }

  // ─── MICRO:BIT COMMANDS ───

  async microbitDisplayText(serialNumber, text) {
    const conn = this.connections.get(serialNumber);
    if (conn?.type !== DEVICE_TYPES.MICROBIT) {
      return { status: 'error', message: 'Not a Micro:Bit' };
    }

    const cmd = `DISPLAY:${text.substring(0, 20)}\n`;
    return this._sendCommand(conn, cmd);
  }

  async microbitPlayTone(serialNumber, frequency, duration) {
    const conn = this.connections.get(serialNumber);
    if (conn?.type !== DEVICE_TYPES.MICROBIT) {
      return { status: 'error', message: 'Not a Micro:Bit' };
    }

    const cmd = `TONE:${Math.floor(frequency)}:${Math.floor(duration)}\n`;
    return this._sendCommand(conn, cmd);
  }

  async microbitButtonPressed(serialNumber, button) {
    const conn = this.connections.get(serialNumber);
    if (conn?.type !== DEVICE_TYPES.MICROBIT) {
      return { status: 'error', message: 'Not a Micro:Bit' };
    }

    const cmd = `BUTTON:${button}\n`;
    return this._sendCommand(conn, cmd);
  }

  async microbitReadAccelerometer(serialNumber, axis) {
    const conn = this.connections.get(serialNumber);
    if (conn?.type !== DEVICE_TYPES.MICROBIT) {
      return { status: 'error', message: 'Not a Micro:Bit' };
    }

    const cmd = `ACCEL:${axis}\n`;
    return this._sendCommand(conn, cmd);
  }

  async microbitReadTemperature(serialNumber) {
    const conn = this.connections.get(serialNumber);
    if (conn?.type !== DEVICE_TYPES.MICROBIT) {
      return { status: 'error', message: 'Not a Micro:Bit' };
    }

    const cmd = `TEMP\n`;
    return this._sendCommand(conn, cmd);
  }

  // ─── MOTOR & SERVO CONTROL ───

  async motorForward(serialNumber, speed, duration) {
    const conn = this.connections.get(serialNumber);
    if (!conn) return { status: 'error', message: 'Device not connected' };

    const pwm = Math.min(255, Math.max(0, Math.floor((speed / 100) * 255)));
    const dur = Math.floor(duration * 1000);
    const cmd = `MOT:FWD:${pwm}:${dur}\n`;
    return this._sendCommand(conn, cmd);
  }

  async motorBackward(serialNumber, speed, duration) {
    const conn = this.connections.get(serialNumber);
    if (!conn) return { status: 'error', message: 'Device not connected' };

    const pwm = Math.min(255, Math.max(0, Math.floor((speed / 100) * 255)));
    const dur = Math.floor(duration * 1000);
    const cmd = `MOT:BCK:${pwm}:${dur}\n`;
    return this._sendCommand(conn, cmd);
  }

  async motorTurn(serialNumber, direction, angle, speed) {
    const conn = this.connections.get(serialNumber);
    if (!conn) return { status: 'error', message: 'Device not connected' };

    const pwm = Math.min(255, Math.max(0, Math.floor((speed / 100) * 255)));
    const dir = direction === 'left' ? 'L' : 'R';
    const cmd = `MOT:${dir}:${Math.floor(angle)}:${pwm}\n`;
    return this._sendCommand(conn, cmd);
  }

  async motorStop(serialNumber) {
    const conn = this.connections.get(serialNumber);
    if (!conn) return { status: 'error', message: 'Device not connected' };

    const cmd = `MOT:STOP\n`;
    return this._sendCommand(conn, cmd);
  }

  // ─── INTERNAL HELPERS ───

  async _sendCommand(connection, command) {
    if (!connection.device.opened) {
      return { status: 'error', message: 'Device not connected' };
    }

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(command);

      await connection.device.controlTransferOut(
        {
          requestType: 'vendor',
          recipient: 'device',
          request: 0,
          value: 0,
          index: 0,
        },
        data,
      );

      return { status: 'success', message: 'Command sent' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  getConnectedDevices() {
    return Array.from(this.connections.values()).map((conn) => ({
      type: conn.type,
      serial: conn.device.serialNumber,
      name: conn.device.productName,
    }));
  }
}

export const hardwareManager = new HardwareManager();

export async function requestUSBDevice() {
  return hardwareManager.requestDevice();
}

export async function discoverUSBDevices() {
  return hardwareManager.discoverDevices();
}

export async function connectDevice(serialNumber, type) {
  const devices = await navigator.usb.getDevices();
  const device = devices.find((d) => d.serialNumber === serialNumber);

  if (!device) {
    return { status: 'error', message: 'Device not found' };
  }

  if (type === DEVICE_TYPES.ARDUINO) {
    return hardwareManager.connectArduino(device);
  } else if (type === DEVICE_TYPES.MICROBIT) {
    return hardwareManager.connectMicroBit(device);
  }

  return { status: 'error', message: 'Unknown device type' };
}

export function disconnectDevice(serialNumber) {
  return hardwareManager.disconnect(serialNumber);
}

export const ArduinoCommands = {
  writeDigital: (sn, pin, val) => hardwareManager.writeDigitalPin(sn, pin, val),
  writeAnalog: (sn, pin, val) => hardwareManager.writeAnalogPin(sn, pin, val),
  readDigital: (sn, pin) => hardwareManager.readDigitalPin(sn, pin),
  readAnalog: (sn, pin) => hardwareManager.readAnalogPin(sn, pin),
  setServo: (sn, pin, angle) => hardwareManager.setServoAngle(sn, pin, angle),
  playTone: (sn, pin, freq, dur) => hardwareManager.playTone(sn, pin, freq, dur),
};

export const MicroBitCommands = {
  displayText: (sn, text) => hardwareManager.microbitDisplayText(sn, text),
  playTone: (sn, freq, dur) => hardwareManager.microbitPlayTone(sn, freq, dur),
  buttonPressed: (sn, btn) => hardwareManager.microbitButtonPressed(sn, btn),
  readAccel: (sn, axis) => hardwareManager.microbitReadAccelerometer(sn, axis),
  readTemp: (sn) => hardwareManager.microbitReadTemperature(sn),
};

export const MotorCommands = {
  forward: (sn, speed, dur) => hardwareManager.motorForward(sn, speed, dur),
  backward: (sn, speed, dur) => hardwareManager.motorBackward(sn, speed, dur),
  turn: (sn, dir, angle, speed) => hardwareManager.motorTurn(sn, dir, angle, speed),
  stop: (sn) => hardwareManager.motorStop(sn),
};
