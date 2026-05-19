/**
 * Micro:bit Flash Control Panel
 * 
 * Two distinct buttons:
 * 1. Flash via USB (wired) - Complete firmware replacement
 * 2. Connect & Flash via Bluetooth (wireless) - Live command execution
 */

import React, { useState, useRef } from 'react';
import { 
  usbFlashWorkflow, 
  BluetoothControlManager,
  handleFlashError,
  checkBrowserSupport
} from '../utils/microbitFlashSystem';

export default function MicrobitFlashPanel({ userCode, onLog }) {
  // ─── State Management ─────────────────────────────────────────────────────
  const [usbState, setUsbState] = useState('idle'); // idle, flashing, success, error
  const [usbProgress, setUsbProgress] = useState(0);
  const [usbMessage, setUsbMessage] = useState('');
  
  const [bleState, setBleState] = useState('idle'); // idle, connecting, connected, error
  const [bleMessage, setBleMessage] = useState('');
  const [bleDeviceName, setBleDeviceName] = useState('');
  
  const bleManager = useRef(null);
  const [isRunning, setIsRunning] = useState(false);

  // ─── Browser Support Check ────────────────────────────────────────────────
  const browserSupport = checkBrowserSupport();

  // ═══════════════════════════════════════════════════════════════════════════
  // USB FLASH BUTTON HANDLER (Wired - Complete Firmware Replacement)
  // ═══════════════════════════════════════════════════════════════════════════
  
  const handleUSBFlash = async () => {
    if (!browserSupport.webusb) {
      onLog?.('ERROR: WebUSB not supported. Use Chrome, Edge, or Opera.', 'error');
      return;
    }

    if (!userCode || userCode.trim() === '') {
      onLog?.('ERROR: No code to flash. Create a program first.', 'error');
      return;
    }

    setUsbState('flashing');
    setUsbProgress(0);
    setUsbMessage('Starting...');
    onLog?.('🔌 USB Flash: Starting...', 'info');

    try {
      // Disconnect Bluetooth if connected
      const disconnectExisting = async () => {
        if (bleManager.current?.isConnected) {
          onLog?.('🔌 Disconnecting Bluetooth before USB flash...', 'info');
          await bleManager.current.disconnect();
          setBleState('idle');
          setBleDeviceName('');
        }
      };

      // Flash workflow with status updates
      await usbFlashWorkflow({
        pythonCode: userCode,
        onDisconnectExisting: disconnectExisting,
        useV2Only: true, // More reliable for WebUSB
        onStatusUpdate: (status) => {
          setUsbMessage(status.message);
          if (status.progress !== undefined) {
            setUsbProgress(status.progress);
          }
          onLog?.(`USB: ${status.message}`, 'info');
        }
      });

      setUsbState('success');
      setUsbMessage('✅ Flash complete!');
      onLog?.('✅ USB Flash complete! Your program is now running on the micro:bit.', 'success');

      // Reset to idle after 3 seconds
      setTimeout(() => {
        setUsbState('idle');
        setUsbProgress(0);
        setUsbMessage('');
      }, 3000);

    } catch (error) {
      const errorInfo = handleFlashError(error);
      
      if (errorInfo.type !== 'USER_CANCELLED') {
        setUsbState('error');
        setUsbMessage(`❌ ${errorInfo.message}`);
        onLog?.(`ERROR: USB Flash failed - ${errorInfo.message}`, 'error');
        
        // Show troubleshooting tips
        onLog?.('💡 Try: Unplug micro:bit, wait 5 seconds, reconnect, then try again.', 'info');
        onLog?.('💡 Make sure no other programs are using the micro:bit (close other tabs).', 'info');

        setTimeout(() => {
          setUsbState('idle');
          setUsbMessage('');
        }, 5000);
      } else {
        setUsbState('idle');
        setUsbMessage('');
        onLog?.('USB Flash cancelled', 'info');
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // BLUETOOTH CONNECT HANDLER (Wireless - Live Control Only)
  // ═══════════════════════════════════════════════════════════════════════════
  
  const handleBluetoothConnect = async () => {
    if (!browserSupport.bluetooth) {
      onLog?.('ERROR: Web Bluetooth not supported. Use Chrome, Edge, or Opera.', 'error');
      return;
    }

    setBleState('connecting');
    setBleMessage('Connecting...');
    onLog?.('📡 Bluetooth: Connecting...', 'info');

    try {
      // Create Bluetooth manager if needed
      if (!bleManager.current) {
        bleManager.current = new BluetoothControlManager();
        
        // Set up event handlers
        bleManager.current.onDataReceived = (data) => {
          onLog?.(`📡 Received: ${data}`, 'info');
        };
        
        bleManager.current.onDisconnected = () => {
          setBleState('idle');
          setBleDeviceName('');
          setBleMessage('');
          setIsRunning(false);
          onLog?.('📡 Bluetooth disconnected', 'info');
        };
      }

      // Connect with status updates
      const result = await bleManager.current.connect((status) => {
        setBleMessage(status.message);
        onLog?.(`Bluetooth: ${status.message}`, 'info');
      });

      setBleState('connected');
      setBleDeviceName(result.deviceName);
      setBleMessage('✅ Connected');
      onLog?.(`✅ Bluetooth connected to ${result.deviceName}`, 'success');
      onLog?.('💡 IMPORTANT: Bluetooth is for CONTROL only. Flash firmware via USB first!', 'info');

    } catch (error) {
      const errorInfo = handleFlashError(error);
      
      if (errorInfo.type !== 'USER_CANCELLED') {
        setBleState('error');
        setBleMessage(`❌ ${errorInfo.message}`);
        onLog?.(`ERROR: Bluetooth connection failed - ${errorInfo.message}`, 'error');
        
        if (errorInfo.type === 'FIRMWARE') {
          onLog?.('💡 Solution: Use "Flash via USB" button first to install Bluetooth firmware.', 'info');
        }

        setTimeout(() => {
          setBleState('idle');
          setBleMessage('');
        }, 5000);
      } else {
        setBleState('idle');
        setBleMessage('');
        onLog?.('Bluetooth connection cancelled', 'info');
      }
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // BLUETOOTH RUN HANDLER (Send Commands)
  // ═══════════════════════════════════════════════════════════════════════════
  
  const handleBluetoothRun = async () => {
    if (!bleManager.current?.isConnected) {
      onLog?.('ERROR: Not connected via Bluetooth', 'error');
      return;
    }

    if (!userCode || userCode.trim() === '') {
      onLog?.('ERROR: No code to send', 'error');
      return;
    }

    setIsRunning(true);
    onLog?.('▶️ Sending commands to micro:bit...', 'info');

    try {
      await bleManager.current.sendCommand(userCode);
      onLog?.('✅ Commands sent successfully', 'success');
    } catch (error) {
      onLog?.(`ERROR: Failed to send commands - ${error.message}`, 'error');
    } finally {
      setIsRunning(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // BLUETOOTH STOP HANDLER (Stop Execution)
  // ═══════════════════════════════════════════════════════════════════════════
  
  const handleBluetoothStop = async () => {
    if (!bleManager.current?.isConnected) {
      return;
    }

    onLog?.('⏹️ Stopping execution...', 'info');

    try {
      await bleManager.current.stopExecution();
      setIsRunning(false);
      onLog?.('✅ Execution stopped', 'success');
    } catch (error) {
      onLog?.(`WARNING: Stop command may have failed - ${error.message}`, 'warn');
      setIsRunning(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // BLUETOOTH DISCONNECT HANDLER
  // ═══════════════════════════════════════════════════════════════════════════
  
  const handleBluetoothDisconnect = async () => {
    if (!bleManager.current) return;

    onLog?.('🔌 Disconnecting Bluetooth...', 'info');

    try {
      await bleManager.current.disconnect();
      setBleState('idle');
      setBleDeviceName('');
      setBleMessage('');
      setIsRunning(false);
      onLog?.('✅ Bluetooth disconnected', 'success');
    } catch (error) {
      onLog?.(`WARNING: Disconnect error - ${error.message}`, 'warn');
      setBleState('idle');
      setBleDeviceName('');
      setIsRunning(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // UI RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>BBC micro:bit Flash Control</h2>
      
      {/* Browser Support Warning */}
      {(!browserSupport.webusb || !browserSupport.bluetooth) && (
        <div style={styles.warning}>
          ⚠️ Limited browser support detected. Use Chrome, Edge, or Opera for full functionality.
        </div>
      )}

      {/* ─── SECTION 1: USB FLASH (WIRED) ─────────────────────────────── */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <div>
            <h3 style={styles.sectionTitle}>🔌 Flash via USB (Wired)</h3>
            <p style={styles.sectionDescription}>
              Complete firmware replacement. Stops any running program and flashes your code.
            </p>
          </div>
        </div>

        <button
          onClick={handleUSBFlash}
          disabled={usbState === 'flashing' || !browserSupport.webusb}
          style={{
            ...styles.button,
            ...styles.usbButton,
            ...(usbState === 'flashing' ? styles.buttonDisabled : {}),
          }}
        >
          {usbState === 'idle' && '⚡ Flash via USB'}
          {usbState === 'flashing' && `⚡ Flashing ${usbProgress}%`}
          {usbState === 'success' && '✅ Flash Complete'}
          {usbState === 'error' && '❌ Flash Failed'}
        </button>

        {usbMessage && (
          <div style={styles.statusMessage}>
            {usbMessage}
          </div>
        )}

        {usbState === 'flashing' && (
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${usbProgress}%` }} />
          </div>
        )}

        <div style={styles.infoBox}>
          <strong>How it works:</strong>
          <ul style={styles.infoList}>
            <li>Compiles your code into a .hex file</li>
            <li>Uses WebUSB to connect to micro:bit</li>
            <li>Flashes firmware (replaces any existing program)</li>
            <li>Device resets and runs your program automatically</li>
          </ul>
        </div>
      </div>

      {/* ─── SECTION 2: BLUETOOTH CONTROL (WIRELESS) ──────────────────── */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <div>
            <h3 style={styles.sectionTitle}>📡 Connect via Bluetooth (Wireless)</h3>
            <p style={styles.sectionDescription}>
              Live command execution. Requires Bluetooth firmware (flash via USB first).
            </p>
          </div>
        </div>

        {bleState === 'idle' && (
          <button
            onClick={handleBluetoothConnect}
            disabled={!browserSupport.bluetooth}
            style={{ ...styles.button, ...styles.bleButton }}
          >
            📡 Connect Bluetooth
          </button>
        )}

        {bleState === 'connecting' && (
          <button disabled style={{ ...styles.button, ...styles.buttonDisabled }}>
            📡 Connecting...
          </button>
        )}

        {bleState === 'connected' && (
          <div>
            <div style={styles.connectedStatus}>
              ✅ Connected to: <strong>{bleDeviceName}</strong>
            </div>
            
            <div style={styles.buttonRow}>
              <button
                onClick={handleBluetoothRun}
                disabled={isRunning}
                style={{ ...styles.button, ...styles.runButton }}
              >
                {isRunning ? '⏳ Running...' : '▶️ Run'}
              </button>
              
              <button
                onClick={handleBluetoothStop}
                style={{ ...styles.button, ...styles.stopButton }}
              >
                ⏹️ Stop
              </button>
              
              <button
                onClick={handleBluetoothDisconnect}
                style={{ ...styles.button, ...styles.disconnectButton }}
              >
                🔌 Disconnect
              </button>
            </div>
          </div>
        )}

        {bleState === 'error' && (
          <div>
            <button
              onClick={handleBluetoothConnect}
              style={{ ...styles.button, ...styles.bleButton }}
            >
              📡 Retry Connection
            </button>
          </div>
        )}

        {bleMessage && (
          <div style={styles.statusMessage}>
            {bleMessage}
          </div>
        )}

        <div style={styles.warningBox}>
          <strong>⚠️ IMPORTANT:</strong>
          <ul style={styles.infoList}>
            <li>Bluetooth is for CONTROL ONLY, not firmware flashing</li>
            <li>You must flash Bluetooth firmware via USB first</li>
            <li>Commands are sent as Python code to the REPL</li>
            <li>Use "Stop" to halt execution cleanly</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = {
  container: {
    padding: '20px',
    maxWidth: '800px',
    margin: '0 auto',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#1a1a1a',
  },
  warning: {
    padding: '12px',
    marginBottom: '20px',
    background: '#fff3cd',
    border: '1px solid #ffc107',
    borderRadius: '8px',
    color: '#856404',
  },
  section: {
    padding: '20px',
    marginBottom: '20px',
    background: '#f8f9fa',
    border: '2px solid #dee2e6',
    borderRadius: '12px',
  },
  sectionHeader: {
    marginBottom: '16px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '0 0 8px 0',
    color: '#1a1a1a',
  },
  sectionDescription: {
    fontSize: '14px',
    margin: 0,
    color: '#6c757d',
  },
  button: {
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    width: '100%',
    marginBottom: '12px',
  },
  usbButton: {
    background: '#6366f1',
    color: 'white',
  },
  bleButton: {
    background: '#0ea5e9',
    color: 'white',
  },
  runButton: {
    background: '#22c55e',
    color: 'white',
    width: 'auto',
    flex: 1,
  },
  stopButton: {
    background: '#ef4444',
    color: 'white',
    width: 'auto',
    flex: 1,
  },
  disconnectButton: {
    background: '#6c757d',
    color: 'white',
    width: 'auto',
    flex: 1,
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  buttonRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px',
  },
  statusMessage: {
    padding: '8px 12px',
    marginBottom: '12px',
    background: 'white',
    border: '1px solid #dee2e6',
    borderRadius: '6px',
    fontSize: '14px',
  },
  connectedStatus: {
    padding: '12px',
    marginBottom: '12px',
    background: '#d1fae5',
    border: '1px solid #22c55e',
    borderRadius: '6px',
    fontSize: '14px',
    color: '#065f46',
  },
  progressBar: {
    height: '8px',
    background: '#e5e7eb',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '12px',
  },
  progressFill: {
    height: '100%',
    background: '#6366f1',
    transition: 'width 0.3s',
  },
  infoBox: {
    padding: '12px',
    background: '#e0e7ff',
    border: '1px solid #6366f1',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#3730a3',
  },
  warningBox: {
    padding: '12px',
    background: '#fef3c7',
    border: '1px solid #f59e0b',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#92400e',
  },
  infoList: {
    margin: '8px 0 0 0',
    paddingLeft: '20px',
  },
};
