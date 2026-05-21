/**
 * micro:bit flash — wired (MICROBIT drive) + wireless (Bluetooth bridge).
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  getDualModeFlashManager,
  CONNECTION_MODE,
  checkBrowserSupport,
  boardToUsbVersion,
} from '@flash/index.js';
import { flashMicrobitHex } from '@flash/flashMicrobit.js';
import { buildMicroPythonBootHex, downloadHexForMicrobit } from '@flash/embedMicroPython.js';
import { buildBleBridgeHex } from '@flash/buildBleBridgeHex.js';
import {
  isBrowserMsdFlashSupported,
  pickMicrobitDirHandle,
  getStoredMicrobitDirHandle,
} from '@flash/msdBrowserFlash.js';

export default function MicrobitDualFlashPanel({
  buildHex,
  hasProgram = false,
  board = 'v2',
  onBoardChange,
  disabled = false,
  onTerminal,
  beforeUsbFlash,
  onFlashProgress,
  onConnectBluetooth,
  onConnectUsb,
  bluetoothConnected = false,
}) {
  const [expanded, setExpanded] = useState(false);
  const [scan, setScan] = useState(null);
  const [connectionMode, setConnectionMode] = useState(CONNECTION_MODE.DISCONNECTED);
  const [progress, setProgress] = useState(null);
  const [statusLine, setStatusLine] = useState('');
  const [lastError, setLastError] = useState(null);
  const [flashing, setFlashing] = useState(false);
  const [msdLinked, setMsdLinked] = useState(false);
  const [connectingBt, setConnectingBt] = useState(false);
  const msdHandleRef = useRef(null);
  const lastFlashAction = useRef(null);

  const support = typeof navigator !== 'undefined' ? checkBrowserSupport() : {};
  const bleOk = support.bluetooth && !support.bluetoothReason;
  const msdOk = isBrowserMsdFlashSupported();

  const log = useCallback((msg, type = 'info') => onTerminal?.(msg, type), [onTerminal]);

  const pickBoard = (hw) => {
    if (hw !== board) onBoardChange?.(hw);
  };

  useEffect(() => {
    if (msdOk) {
      getStoredMicrobitDirHandle().then((h) => {
        if (h) {
          msdHandleRef.current = h;
          setMsdLinked(true);
        }
      });
    }
  }, [msdOk]);

  useEffect(() => {
    const dual = getDualModeFlashManager();
    const off = dual.onState((s) => setConnectionMode(s.connectionMode));
    dual.scanConnections().then(setScan);
    return () => off();
  }, []);

  /** Pick MICROBIT folder while the click gesture is still valid. */
  const ensureMsdLink = async () => {
    if (!msdOk) return null;
    if (msdHandleRef.current) return msdHandleRef.current;
    const stored = await getStoredMicrobitDirHandle();
    if (stored) {
      msdHandleRef.current = stored;
      setMsdLinked(true);
      return stored;
    }
    const handle = await pickMicrobitDirHandle();
    msdHandleRef.current = handle;
    setMsdLinked(true);
    return handle;
  };

  const linkDrive = async () => {
    try {
      await ensureMsdLink();
      log('MICROBIT drive linked.', 'success');
    } catch (e) {
      log(e?.message || String(e), 'error');
    }
  };

  const runFlash = async (getHex, filename, boardHw = board) => {
    if (flashing) return;
    setFlashing(true);
    setLastError(null);
    setProgress(0);

    try {
      let msdDirHandle = null;
      if (msdOk) {
        try {
          setStatusLine('Select the MICROBIT drive…');
          msdDirHandle = await ensureMsdLink();
        } catch (e) {
          if (e?.name === 'AbortError') {
            setLastError('Pick the MICROBIT folder to flash (or use Download .hex).');
            log('Folder picker cancelled.', 'warn');
            return;
          }
          throw e;
        }
      }

      setStatusLine('Preparing firmware…');
      const hex = await getHex((m) => {
        if (m) setStatusLine(m.slice(0, 60));
      }, boardHw);

      const result = await flashMicrobitHex(hex, {
        method: 'auto',
        board: boardHw,
        filename,
        msdDirHandle,
        beforeUsbFlash,
        onProgress: (e) => {
          if (typeof e.percent === 'number') {
            setProgress(Math.round(e.percent));
            onFlashProgress?.(Math.round(e.percent));
          }
          if (e.message) setStatusLine(e.message);
        },
      });

      if (result?.method === 'browser-msd' || result?.method === 'usb-msd') {
        setMsdLinked(true);
      }

      if (result?.fallback === 'download' || result?.method === 'download') {
        downloadHexForMicrobit(hex, filename);
        setLastError('Auto-copy failed — .hex downloaded. Drag it onto the MICROBIT drive.');
        log('Downloaded .hex — drag onto MICROBIT to finish.', 'warn');
        return;
      }

      if (result?.success === false) {
        throw new Error('Flash did not complete.');
      }

      setProgress('done');
      const isBle = filename.includes('ble');
      setStatusLine(isBle ? 'Done — check LED (no sad face)' : 'Done — LED blinks heart');
      log(
        isBle
          ? 'Bluetooth UART firmware flashed. Wait 5s. Sad face = failed — use Download wireless .hex or USB test first.'
          : 'Flashed. Click 🔌 USB to connect, then ▶ Run.',
        'success',
      );
    } catch (e) {
      const msg = e?.message || String(e);
      setLastError(msg);
      log(msg, 'error');
    } finally {
      setFlashing(false);
      setTimeout(() => {
        setProgress(null);
        onFlashProgress?.(null);
      }, 2000);
    }
  };

  const flashBlocks = () => {
    if (!hasProgram) {
      setLastError('Add blocks on the canvas first.');
      return;
    }
    lastFlashAction.current = 'blocks';
    runFlash((s) => buildHex(s), 'program.hex');
  };

  const flashUsbRuntime = () => {
    lastFlashAction.current = 'mp';
    runFlash(
      async (s, hw) => {
        s?.('Loading USB firmware…');
        const { hex } = await buildMicroPythonBootHex(hw || board);
        return hex;
      },
      `micropython-${board}-boot.hex`,
    );
  };

  const flashWireless = () => {
    const hw = board === 'v1' ? 'v1' : 'v2';
    if (hw !== 'v2') {
      log('Wireless uses V2 — switching board to V2.', 'warn');
      pickBoard('v2');
    }
    lastFlashAction.current = 'ble';
    runFlash(
      async (s) => {
        const { hex } = await buildBleBridgeHex('v2', s);
        return hex;
      },
      'bb-wireless-v2.hex',
      'v2',
    );
  };

  const downloadUsbTestHex = async () => {
    try {
      const { hex } = await buildMicroPythonBootHex(board);
      downloadHexForMicrobit(hex, `micropython-${board}-boot.hex`);
      log('USB test .hex downloaded — drag onto MICROBIT if flash fails.', 'success');
    } catch (e) {
      log(e?.message || String(e), 'error');
    }
  };

  const downloadWirelessHex = async () => {
    try {
      log('Building wireless .hex…', 'info');
      const { hex, source } = await buildBleBridgeHex('v2', (m) => m && log(m, 'info'));
      downloadHexForMicrobit(hex, 'bb-wireless-v2.hex');
      log(`Downloaded from ${source || 'build'} — drag onto MICROBIT if flash button fails.`, 'success');
    } catch (e) {
      log(e?.message || String(e), 'error');
    }
  };

  const connectBt = async () => {
    if (!onConnectBluetooth) return;
    setConnectingBt(true);
    try {
      await onConnectBluetooth();
    } finally {
      setConnectingBt(false);
    }
  };

  const dot =
    bluetoothConnected || connectionMode === CONNECTION_MODE.BLUETOOTH
      ? '#0ea5e9'
      : connectionMode === CONNECTION_MODE.USB || scan?.usb?.length
        ? '#22c55e'
        : '#64748b';

  return (
    <div className="bb-dual-flash bb-dual-flash--tidy">
      <button
        type="button"
        className="bb-dual-flash__header"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
      >
        <span className="bb-dual-flash__dot" style={{ background: dot }} />
        <span className="bb-dual-flash__title">micro:bit</span>
        <span className="bb-dual-flash__mode">
          {bluetoothConnected ? 'Bluetooth' : scan?.usb?.length ? 'USB' : 'Ready'}
          {' · '}
          {boardToUsbVersion(board)}
        </span>
        <span className="bb-dual-flash__chevron">{expanded ? '▾' : '▸'}</span>
      </button>

      {expanded && (
        <div className="bb-dual-flash__body">
          {!msdOk && (
            <p className="bb-dual-flash__warn">
              Use Chrome or Edge for one-click flash. Safari cannot write to the MICROBIT drive.
            </p>
          )}

          <div className="bb-dual-flash__pills">
            <button type="button" className={board === 'v2' ? 'active' : ''} onClick={() => pickBoard('v2')} disabled={flashing}>
              V2
            </button>
            <button type="button" className={board === 'v1' ? 'active' : ''} onClick={() => pickBoard('v1')} disabled={flashing}>
              V1
            </button>
            {msdOk && (
              <button type="button" className={msdLinked ? 'linked' : ''} onClick={linkDrive} disabled={flashing}>
                {msdLinked ? 'MICROBIT linked' : 'Link MICROBIT'}
              </button>
            )}
            {onConnectUsb && (
              <button type="button" className="bb-dual-flash__pill-connect" onClick={onConnectUsb} disabled={flashing}>
                🔌 USB connect
              </button>
            )}
          </div>

          {statusLine && <p className="bb-dual-flash__status">{statusLine}</p>}
          {typeof progress === 'number' && (
            <div className="bb-dual-flash__bar">
              <div className="bb-dual-flash__bar-fill" style={{ width: `${progress}%` }} />
            </div>
          )}

          <section className="bb-dual-flash__section">
            <h4 className="bb-dual-flash__section-title">USB (wired)</h4>
            <p className="bb-dual-flash__section-desc">
              Flash blocks, then <strong>🔌 USB connect</strong> and ▶ Run. Heart on LED = USB MicroPython.
            </p>
            <div className="bb-dual-flash__btn-row">
              <button
                type="button"
                className="bb-dual-flash__btn bb-dual-flash__btn--primary"
                onClick={flashBlocks}
                disabled={disabled || flashing || !hasProgram}
              >
                Flash my blocks
              </button>
              <button type="button" className="bb-dual-flash__btn" onClick={flashUsbRuntime} disabled={flashing}>
                USB test (heart)
              </button>
              <button type="button" className="bb-dual-flash__btn bb-dual-flash__btn--ghost" onClick={downloadUsbTestHex} disabled={flashing}>
                Download .hex
              </button>
            </div>
          </section>

          <section className="bb-dual-flash__section bb-dual-flash__section--bt">
            <h4 className="bb-dual-flash__section-title">Bluetooth (wireless)</h4>
            <ol className="bb-dual-flash__steps">
              <li><strong>1. Flash wireless</strong> — MakeCode Cutebot bridge (flash once)</li>
              <li>LED shows <strong>B</strong> when ready (sad face = wrong/old firmware)</li>
              <li>Unplug USB, press reset, <strong>2. Connect Bluetooth</strong></li>
              <li>Build blocks → <strong>▶ Run</strong> (no reflash for each program)</li>
            </ol>
            <p className="bb-dual-flash__section-desc">
              Uses prebuilt MakeCode firmware — not MicroPython embed (that caused the sad face).
            </p>
            {!bleOk && support.bluetoothMessage && <p className="bb-dual-flash__warn">{support.bluetoothMessage}</p>}
            <div className="bb-dual-flash__btn-row">
              <button type="button" className="bb-dual-flash__btn bb-dual-flash__btn--bt" onClick={flashWireless} disabled={disabled || flashing}>
                1. Flash wireless
              </button>
              <button type="button" className="bb-dual-flash__btn bb-dual-flash__btn--ghost" onClick={downloadWirelessHex} disabled={flashing}>
                Download wireless .hex
              </button>
              <button
                type="button"
                className="bb-dual-flash__btn bb-dual-flash__btn--connect"
                onClick={connectBt}
                disabled={disabled || flashing || connectingBt || !bleOk || !onConnectBluetooth}
              >
                {connectingBt ? 'Connecting…' : bluetoothConnected ? '2. Connected ✓' : '2. Connect Bluetooth'}
              </button>
            </div>
          </section>

          {lastError && (
            <div className="bb-dual-flash__error">
              <p>{lastError}</p>
              <button
                type="button"
                onClick={() => {
                  const a = lastFlashAction.current;
                  if (a === 'blocks') flashBlocks();
                  else if (a === 'ble') flashWireless();
                  else flashUsbRuntime();
                }}
                disabled={flashing}
              >
                Retry
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
