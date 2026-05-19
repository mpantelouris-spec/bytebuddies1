/**
 * BBC micro:bit Flashing System
 * 
 * Two distinct modes:
 * 1. USB Flash - Complete firmware replacement via WebUSB/DAPLink
 * 2. Bluetooth Control - Live command execution via Web Bluetooth API
 */

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 1: USB FLASHING SYSTEM (Complete firmware replacement)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * IndexedDB cache for runtime hex files
 */
async function cacheHexFile(key, fetchFn) {
  try {
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('microbit_hex_cache', 1);
      request.onupgradeneeded = e => e.target.result.createObjectStore('hexfiles');
      request.onsuccess = e => resolve(e.target.result);
      request.onerror = reject;
    });
    
    const cached = await new Promise(resolve => {
      const transaction = db.transaction('hexfiles', 'readonly');
      const store = transaction.objectStore('hexfiles');
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
    
    if (cached) return cached;
    
    const value = await fetchFn();
    await new Promise(resolve => {
      const transaction = db.transaction('hexfiles', 'readwrite');
      const store = transaction.objectStore('hexfiles');
      store.put(value, key);
      transaction.oncomplete = resolve;
      transaction.onerror = resolve;
    });
    
    return value;
  } catch {
    return fetchFn();
  }
}

/**
 * Build micro:bit Universal Hex (V1 + V2)
 */
export async function buildUniversalHex(pythonCode, onStatusUpdate) {
  onStatusUpdate?.({ stage: 'loading', message: 'Loading MicroPython runtime...' });
  
  const [{ MicropythonFsHex, microbitBoardId }, hexV1, hexV2] = await Promise.all([
    import('@microbit/microbit-fs'),
    cacheHexFile('micropython_v1', () => 
      fetch('/micropython-v1.hex').then(r => {
        if (!r.ok) throw new Error('MicroPython V1 hex download failed');
        return r.text();
      })
    ),
    cacheHexFile('micropython_v2', () => 
      fetch('/micropython-v2.hex').then(r => {
        if (!r.ok) throw new Error('MicroPython V2 hex download failed');
        return r.text();
      })
    ),
  ]);
  
  onStatusUpdate?.({ stage: 'building', message: 'Compiling program...' });
  
  const fs = new MicropythonFsHex([
    { hex: hexV1, boardId: microbitBoardId.V1 },
    { hex: hexV2, boardId: microbitBoardId.V2 },
  ]);
  
  fs.write('main.py', pythonCode);
  return fs.getUniversalHex();
}

/**
 * Build micro:bit V2-only Hex (more reliable for WebUSB)
 */
export async function buildV2OnlyHex(pythonCode, onStatusUpdate) {
  onStatusUpdate?.({ stage: 'loading', message: 'Loading MicroPython V2 runtime...' });
  
  const [{ MicropythonFsHex, microbitBoardId }, hexV2] = await Promise.all([
    import('@microbit/microbit-fs'),
    cacheHexFile('micropython_v2', () => 
      fetch('/micropython-v2.hex').then(r => {
        if (!r.ok) throw new Error('MicroPython V2 hex download failed');
        return r.text();
      })
    ),
  ]);
  
  onStatusUpdate?.({ stage: 'building', message: 'Compiling V2 program...' });
  
  const fs = new MicropythonFsHex([
    { hex: hexV2, boardId: microbitBoardId.V2 },
  ]);
  
  fs.write('main.py', pythonCode);
  return fs.getIntelHex(microbitBoardId.V2);
}

/**
 * Sanitize hex for WebUSB (remove unsupported extension records)
 */
export function sanitizeHexForWebUSB(rawHex) {
  const MAX_FLASH_ADDRESS = 0x00080000;
  const lines = String(rawHex || '')
    .replace(/\r/g, '')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);
  
  const output = [];
  let currentExtendedLinearAddress = 0;
  let currentELALine = ':020000040000FA';
  let emittedELA = null;
  let removedRecords = 0;

  for (const line of lines) {
    const match = /^:([0-9A-Fa-f]{2})([0-9A-Fa-f]{4})([0-9A-Fa-f]{2})([0-9A-Fa-f]*)[0-9A-Fa-f]{2}$/.exec(line);
    if (!match) {
      removedRecords++;
      continue;
    }

    const byteCount = parseInt(match[1], 16);
    const offset = parseInt(match[2], 16);
    const recordType = parseInt(match[3], 16);

    if (recordType === 0x04) {
      if (match[4].length < 4) {
        removedRecords++;
        continue;
      }
      currentExtendedLinearAddress = parseInt(match[4].slice(0, 4), 16);
      currentELALine = line;
      continue;
    }

    if (recordType === 0x05 || recordType === 0x03) {
      removedRecords++;
      continue;
    }

    if (recordType === 0x01) {
      output.push(line);
      continue;
    }

    if (recordType === 0x00) {
      const fullAddress = (currentExtendedLinearAddress << 16) | offset;
      if (fullAddress >= MAX_FLASH_ADDRESS) {
        removedRecords++;
        continue;
      }
      if (emittedELA !== currentExtendedLinearAddress) {
        output.push(currentELALine);
        emittedELA = currentExtendedLinearAddress;
      }
      output.push(line);
    } else {
      removedRecords++;
    }
  }

  return { hex: output.join('\r\n') + '\r\n', removedRecords };
}

/**
 * Flash hex file to micro:bit via WebUSB/DAPLink
 * CRITICAL: This completely replaces the firmware, stopping any running program
 */
export async function flashViaUSB(hexString, onProgressUpdate, existingDevice = null) {
  const { WebUSB, DAPLink } = await import('dapjs');
  
  let device = existingDevice;
  
  if (!device) {
    device = await navigator.usb.requestDevice({ 
      filters: [{ vendorId: 0x0D28 }] // micro:bit DAPLink vendor ID
    });
  }
  
  const transport = new WebUSB(device);
  const daplink = new DAPLink(transport);
  
  daplink.on(DAPLink.EVENT_PROGRESS, progress => {
    onProgressUpdate?.({ 
      stage: 'flashing', 
      progress: Math.round(progress * 100),
      message: `Flashing... ${Math.round(progress * 100)}%`
    });
  });
  
  try {
    onProgressUpdate?.({ stage: 'connecting', message: 'Connecting to micro:bit...' });
    await daplink.connect();
    
    // CRITICAL: Let DAPLink settle and ensure clean state
    await new Promise(resolve => setTimeout(resolve, 600));
    
    onProgressUpdate?.({ stage: 'flashing', progress: 0, message: 'Flashing firmware...' });
    await daplink.flash(hexString);
    
    onProgressUpdate?.({ stage: 'complete', progress: 100, message: 'Flash complete!' });
    
  } finally {
    // CRITICAL: Always disconnect to reset device properly
    try {
      await daplink.disconnect();
    } catch (disconnectError) {
      console.warn('DAPLink disconnect warning:', disconnectError);
    }
  }
  
  return { success: true, device };
}

/**
 * Complete USB Flash Workflow
 * STOPS any existing connections, builds hex, and flashes
 */
export async function usbFlashWorkflow({
  pythonCode,
  onStatusUpdate,
  onDisconnectExisting,
  useV2Only = true
}) {
  try {
    // Check WebUSB support
    if (!navigator.usb) {
      throw new Error('WebUSB not supported. Use Chrome, Edge, or Opera.');
    }
    
    // STEP 1: Disconnect any existing connections
    onStatusUpdate?.({ stage: 'preparing', message: 'Preparing to flash...' });
    if (onDisconnectExisting) {
      await onDisconnectExisting();
      await new Promise(resolve => setTimeout(resolve, 400));
    }
    
    // STEP 2: Build hex file
    const rawHex = useV2Only 
      ? await buildV2OnlyHex(pythonCode, onStatusUpdate)
      : await buildUniversalHex(pythonCode, onStatusUpdate);
    
    // STEP 3: Sanitize for WebUSB
    onStatusUpdate?.({ stage: 'sanitizing', message: 'Optimizing hex file...' });
    const { hex: cleanHex, removedRecords } = sanitizeHexForWebUSB(rawHex);
    
    if (removedRecords > 0) {
      console.log(`Removed ${removedRecords} unsupported hex records for WebUSB`);
    }
    
    // STEP 4: Flash to device
    onStatusUpdate?.({ stage: 'selecting', message: 'Select your micro:bit...' });
    const result = await flashViaUSB(cleanHex, onStatusUpdate);
    
    // STEP 5: Device resets automatically after flash
    onStatusUpdate?.({ stage: 'success', message: 'Program flashed successfully!' });
    
    return result;
    
  } catch (error) {
    if (error.name === 'NotFoundError') {
      throw new Error('No device selected');
    }
    throw error;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 2: BLUETOOTH CONTROL SYSTEM (Live command execution)
// ═══════════════════════════════════════════════════════════════════════════

// Nordic UART Service UUIDs (two variants due to micro:bit firmware differences)
const BLE_NUS_SERVICE_UUID_A = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const BLE_NUS_SERVICE_UUID_B = '6e400001-b5b3-f393-e0a9-e50e24dcca9e';
const BLE_NUS_TX_CHAR_UUID_A = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'; // Write to micro:bit
const BLE_NUS_TX_CHAR_UUID_B = '6e400002-b5b3-f393-e0a9-e50e24dcca9e';
const BLE_NUS_RX_CHAR_UUID_A = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'; // Notify from micro:bit
const BLE_NUS_RX_CHAR_UUID_B = '6e400003-b5b3-f393-e0a9-e50e24dcca9e';

/**
 * Bluetooth Connection Manager
 * IMPORTANT: This is for CONTROL ONLY, not firmware flashing
 */
export class BluetoothControlManager {
  constructor() {
    this.device = null;
    this.server = null;
    this.txCharacteristic = null; // Write to micro:bit
    this.rxCharacteristic = null; // Receive from micro:bit
    this.onDataReceived = null;
    this.onDisconnected = null;
    this.dataBuffer = '';
    this.isConnected = false;
  }

  /**
   * Connect to micro:bit via Bluetooth
   */
  async connect(onStatusUpdate) {
    try {
      // Check Web Bluetooth support
      if (!navigator.bluetooth) {
        throw new Error('Web Bluetooth not supported. Use Chrome, Edge, or Opera.');
      }

      onStatusUpdate?.({ stage: 'requesting', message: 'Select your micro:bit...' });
      
      // Request device (shows pairing dialog)
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          { namePrefix: 'BBC micro:bit' },
          { namePrefix: 'Cutebot' }
        ],
        optionalServices: [
          BLE_NUS_SERVICE_UUID_A,
          BLE_NUS_SERVICE_UUID_B
        ]
      });

      // Handle disconnection
      this.device.addEventListener('gattserverdisconnected', () => {
        this.isConnected = false;
        this.txCharacteristic = null;
        this.rxCharacteristic = null;
        this.onDisconnected?.();
      });

      onStatusUpdate?.({ stage: 'connecting', message: 'Connecting to GATT server...' });
      this.server = await this.device.gatt.connect();

      // CRITICAL: Wait for service discovery (Windows needs this)
      await new Promise(resolve => setTimeout(resolve, 1500));

      onStatusUpdate?.({ stage: 'discovering', message: 'Discovering services...' });
      
      // Find UART service
      let service = null;
      const allServices = await this.server.getPrimaryServices();
      
      service = allServices.find(s => {
        const uuid = s.uuid.toLowerCase();
        return uuid === BLE_NUS_SERVICE_UUID_A.toLowerCase() || 
               uuid === BLE_NUS_SERVICE_UUID_B.toLowerCase();
      });

      if (!service) {
        // Fallback: Direct UUID lookup
        try {
          service = await this.server.getPrimaryService(BLE_NUS_SERVICE_UUID_A);
        } catch {
          service = await this.server.getPrimaryService(BLE_NUS_SERVICE_UUID_B);
        }
      }

      if (!service) {
        throw new Error(
          'UART service not found. Make sure you flashed the Bluetooth firmware first.'
        );
      }

      onStatusUpdate?.({ stage: 'characteristics', message: 'Setting up communication...' });
      
      // Get characteristics
      const characteristics = await service.getCharacteristics();
      
      this.rxCharacteristic = characteristics.find(c => 
        c.uuid.includes('6e400003') || c.properties.notify
      );
      
      this.txCharacteristic = characteristics.find(c => 
        c.uuid.includes('6e400002') || c.properties.writeWithoutResponse || c.properties.write
      );

      if (!this.rxCharacteristic || !this.txCharacteristic) {
        throw new Error('UART characteristics not found');
      }

      // Start notifications
      await this.rxCharacteristic.startNotifications();
      this.rxCharacteristic.addEventListener('characteristicvaluechanged', 
        this._handleDataReceived.bind(this)
      );

      this.isConnected = true;
      onStatusUpdate?.({ stage: 'connected', message: 'Bluetooth connected!' });

      // Test connection
      await this._testConnection(onStatusUpdate);

      return { success: true, deviceName: this.device.name };

    } catch (error) {
      this.isConnected = false;
      if (error.name === 'NotFoundError') {
        throw new Error('No device selected');
      }
      throw error;
    }
  }

  /**
   * Test the connection by sending a simple command
   */
  async _testConnection(onStatusUpdate) {
    try {
      onStatusUpdate?.({ stage: 'testing', message: 'Testing firmware...' });
      
      // Send test command (show happy face)
      await this.sendCommand('display.show(Image.HAPPY)');
      
      onStatusUpdate?.({ stage: 'ready', message: 'Firmware test passed!' });
    } catch (error) {
      onStatusUpdate?.({ 
        stage: 'warning', 
        message: 'Firmware test failed. Connection may be unstable.' 
      });
    }
  }

  /**
   * Handle incoming data from micro:bit
   */
  _handleDataReceived(event) {
    const decoder = new TextDecoder();
    const value = decoder.decode(event.target.value);
    
    this.dataBuffer += value;
    
    // Check for REPL prompt (indicates command complete)
    if (value.includes('>>>') || value.includes('\x04')) {
      if (this.onDataReceived) {
        this.onDataReceived(this.dataBuffer);
      }
      this.dataBuffer = '';
    }
  }

  /**
   * Send command to micro:bit
   * IMPORTANT: This sends Python code to execute, NOT a firmware flash
   */
  async sendCommand(pythonCode) {
    if (!this.isConnected || !this.txCharacteristic) {
      throw new Error('Not connected to micro:bit');
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(pythonCode + '\x04'); // \x04 = CTRL-D (execute)

    // Send in 20-byte chunks (BLE MTU limitation)
    for (let i = 0; i < data.length; i += 20) {
      const chunk = data.slice(i, i + 20);
      
      try {
        await this.txCharacteristic.writeValueWithoutResponse(chunk);
      } catch {
        // Fallback for devices without writeWithoutResponse
        await this.txCharacteristic.writeValue(chunk);
      }

      // Small delay between chunks
      if (i + 20 < data.length) {
        await new Promise(resolve => setTimeout(resolve, 30));
      }
    }
  }

  /**
   * STOP execution on micro:bit
   * CRITICAL: Ensures program stops running
   */
  async stopExecution() {
    if (!this.isConnected) return;

    try {
      // Send CTRL-C (interrupt) three times
      const encoder = new TextEncoder();
      const interrupt = encoder.encode('\x03');
      
      for (let i = 0; i < 3; i++) {
        await this.txCharacteristic.writeValueWithoutResponse(interrupt);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Send soft reset
      await this.sendCommand('import microbit; microbit.reset()');
      
    } catch (error) {
      console.warn('Stop execution warning:', error);
    }
  }

  /**
   * Disconnect from micro:bit
   */
  async disconnect() {
    try {
      await this.stopExecution();
      
      if (this.server && this.server.connected) {
        this.server.disconnect();
      }
      
      this.isConnected = false;
      this.device = null;
      this.server = null;
      this.txCharacteristic = null;
      this.rxCharacteristic = null;
      
    } catch (error) {
      console.warn('Disconnect warning:', error);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION 3: ERROR HANDLING & UTILITIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Unified error handler
 */
export function handleFlashError(error) {
  if (error.name === 'NotFoundError') {
    return { 
      type: 'USER_CANCELLED', 
      message: 'Device selection cancelled' 
    };
  }
  
  if (error.name === 'SecurityError') {
    return { 
      type: 'SECURITY', 
      message: 'Permission denied. Check browser settings.' 
    };
  }
  
  if (error.name === 'NetworkError' || error.name === 'NotSupportedError') {
    return { 
      type: 'CONNECTION', 
      message: 'Device connection failed. Unplug and reconnect micro:bit.' 
    };
  }
  
  if (error.message?.includes('UART service')) {
    return { 
      type: 'FIRMWARE', 
      message: 'Bluetooth firmware not found. Flash the firmware first using USB.' 
    };
  }
  
  return { 
    type: 'UNKNOWN', 
    message: error.message || 'Unknown error occurred' 
  };
}

/**
 * Check browser compatibility
 */
export function checkBrowserSupport() {
  return {
    webusb: !!navigator.usb,
    bluetooth: !!navigator.bluetooth,
    recommended: /Chrome|Edge|Opera/.test(navigator.userAgent)
  };
}

export default {
  // USB Flashing
  usbFlashWorkflow,
  buildUniversalHex,
  buildV2OnlyHex,
  flashViaUSB,
  sanitizeHexForWebUSB,
  
  // Bluetooth Control
  BluetoothControlManager,
  
  // Utilities
  handleFlashError,
  checkBrowserSupport
};
