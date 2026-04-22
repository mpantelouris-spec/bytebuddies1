import React, { useState, useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';

// ─── micro:bit WebUSB direct-flash (works with ANY firmware) ─────────────────
async function _idbCache(key, fetchFn) {
  try {
    const db = await new Promise((res, rej) => {
      const r = indexedDB.open('bb_hex_cache', 1);
      r.onupgradeneeded = e => e.target.result.createObjectStore('data');
      r.onsuccess = e => res(e.target.result);
      r.onerror = rej;
    });
    const cached = await new Promise(res => {
      const r = db.transaction('data').objectStore('data').get(key);
      r.onsuccess = () => res(r.result || null);
      r.onerror = () => res(null);
    });
    if (cached) return cached;
    const val = await fetchFn();
    await new Promise(res => {
      const tx = db.transaction('data', 'readwrite');
      tx.objectStore('data').put(val, key);
      tx.oncomplete = res;
      tx.onerror = res;
    });
    return val;
  } catch { return fetchFn(); }
}

async function buildMicrobitHex(pythonCode, onStatus) {
  onStatus?.('📦 Loading MicroPython runtime... (cached after first use)');
  const [{ MicropythonFsHex, microbitBoardId }, hexV1, hexV2] = await Promise.all([
    import('@microbit/microbit-fs'),
    _idbCache('mp_v1', () => fetch('/micropython-v1.hex').then(r => { if (!r.ok) throw new Error('hex fetch failed'); return r.text(); })),
    _idbCache('mp_v2', () => fetch('/micropython-v2.hex').then(r => { if (!r.ok) throw new Error('hex fetch failed'); return r.text(); })),
  ]);
  onStatus?.('🔨 Building program hex...');
  const fs = new MicropythonFsHex([
    { hex: hexV1, boardId: microbitBoardId.V1 },
    { hex: hexV2, boardId: microbitBoardId.V2 },
  ]);
  fs.write('main.py', pythonCode);
  return fs.getUniversalHex();
}

async function flashViaDAPLink(hexStr, onProgress) {
  const { WebUSB, DAPLink } = await import('dapjs');
  const device = await navigator.usb.requestDevice({ filters: [{ vendorId: 0x0D28 }] });
  const transport = new WebUSB(device);
  const daplink = new DAPLink(transport);
  daplink.on(DAPLink.EVENT_PROGRESS, p => onProgress(Math.round(p * 100)));
  try {
    await daplink.connect();
    await new Promise(r => setTimeout(r, 600)); // let DAPLink settle before flashing
    await daplink.flash(hexStr);
  } finally {
    try { await daplink.disconnect(); } catch {}
  }
}

// Browser DAPLink cannot handle some Universal Hex extension/UICR records.
// Keep only standard flash-region data so one-click WebUSB flashing is reliable.
function sanitizeHexForWebUsb(rawHex) {
  const MAX_FLASH_ADDR = 0x00080000; // micro:bit flash space upper bound
  const lines = String(rawHex || '').replace(/\r/g, '').split('\n').map(l => l.trim()).filter(Boolean);
  const out = [];
  let currentEla = 0;
  let currentElaLine = ':020000040000FA';
  let emittedEla = null;
  let removed = 0;

  for (const line of lines) {
    const m = /^:([0-9A-Fa-f]{2})([0-9A-Fa-f]{4})([0-9A-Fa-f]{2})([0-9A-Fa-f]*)[0-9A-Fa-f]{2}$/.exec(line);
    if (!m) { removed++; continue; }
    const len = parseInt(m[1], 16);
    const off = parseInt(m[2], 16);
    const type = parseInt(m[3], 16);

    if (type === 0x04) {
      if (m[4].length < 4) { removed++; continue; }
      currentEla = parseInt(m[4].slice(0, 4), 16);
      currentElaLine = line;
      continue;
    }

    if (type === 0x00) {
      const absStart = (currentEla << 16) + off;
      const absEnd = absStart + len;
      if (absStart < 0 || absEnd > MAX_FLASH_ADDR) { removed++; continue; }
      if (emittedEla !== currentEla) {
        out.push(currentElaLine);
        emittedEla = currentEla;
      }
      out.push(line);
      continue;
    }

    if (type === 0x01) continue; // always append one EOF at the end
    if (type === 0x02 || type === 0x03 || type === 0x05) {
      // These are safe metadata records for standard Intel HEX.
      out.push(line);
      continue;
    }

    // Drop unsupported record types (e.g., Universal Hex extension records).
    removed++;
  }

  out.push(':00000001FF');
  return { hex: out.join('\n') + '\n', removedRecords: removed };
}
// ─────────────────────────────────────────────────────────────────────────────

/* ─── Robot command definitions ─── */
const ROBOT_COMMANDS = [
  // Movement
  { cat: 'Movement', id: 'forward',    icon: '⬆️',  label: 'Forward',        color: '#f59e0b', params: [{ key: 'amount',  label: 'steps',  default: '80',   type: 'number' }] },
  { cat: 'Movement', id: 'back',       icon: '⬇️',  label: 'Backward',       color: '#f59e0b', params: [{ key: 'amount',  label: 'steps', default: '80',   type: 'number' }] },
  { cat: 'Movement', id: 'move_left',  icon: '⬅️',  label: 'Move Left',      color: '#f59e0b', params: [{ key: 'amount',  label: 'steps',  default: '80',   type: 'number' }] },
  { cat: 'Movement', id: 'move_right', icon: '➡️',  label: 'Move Right',     color: '#f59e0b', params: [{ key: 'amount',  label: 'steps',  default: '80',   type: 'number' }] },
  { cat: 'Movement', id: 'left',       icon: '↺',   label: 'Turn Left',      color: '#f59e0b', params: [{ key: 'degrees', label: '°',   default: '90',   type: 'number' }] },
  { cat: 'Movement', id: 'right',      icon: '↻',   label: 'Turn Right',     color: '#f59e0b', params: [{ key: 'degrees', label: '°',   default: '90',   type: 'number' }] },
  { cat: 'Movement', id: 'spin_left',  icon: '↺',   label: 'Spin Left',      color: '#f59e0b', params: [{ key: 'degrees', label: '°',   default: '360',  type: 'number' }] },
  { cat: 'Movement', id: 'spin_right', icon: '↻',   label: 'Spin Right',     color: '#f59e0b', params: [{ key: 'degrees', label: '°',   default: '360',  type: 'number' }] },
  { cat: 'Movement', id: 'stop',       icon: '⏹️',  label: 'Stop',           color: '#f59e0b', params: [] },
  { cat: 'Movement', id: 'coast',      icon: '🌊',  label: 'Coast Stop',     color: '#f59e0b', params: [] },
  { cat: 'Movement', id: 'speed',      icon: '⚡',  label: 'Set Speed',      color: '#f59e0b', params: [{ key: 'pct',     label: '%',   default: '75',   type: 'number' }] },
  { cat: 'Movement', id: 'motor_l',    icon: '◀',   label: 'Motor Left',     color: '#f59e0b', params: [{ key: 'power',   label: '%',   default: '50',   type: 'number' }] },
  { cat: 'Movement', id: 'motor_r',    icon: '▶',   label: 'Motor Right',    color: '#f59e0b', params: [{ key: 'power',   label: '%',   default: '50',   type: 'number' }] },
  { cat: 'Movement', id: 'motors',     icon: '⚙️',  label: 'Both Motors',    color: '#f59e0b', params: [{ key: 'left',    label: 'L%',  default: '50',   type: 'number' }, { key: 'right', label: 'R%', default: '50', type: 'number' }] },

  // Sensors
  { cat: 'Sensors', id: 'if_dist',     icon: '📡',  label: 'If Distance <',  color: '#f59e0b', params: [{ key: 'cm',      label: 'cm',  default: '20',   type: 'number' }] },
  { cat: 'Sensors', id: 'if_line',     icon: '〰️',  label: 'If Line Found',  color: '#f59e0b', params: [] },
  { cat: 'Sensors', id: 'if_btn_a',    icon: '🔘',  label: 'If Button A',    color: '#f59e0b', params: [] },
  { cat: 'Sensors', id: 'if_btn_b',    icon: '🔘',  label: 'If Button B',    color: '#f59e0b', params: [] },
  { cat: 'Sensors', id: 'if_touch',    icon: '👆',  label: 'If Touch Pin',   color: '#f59e0b', params: [{ key: 'pin',     label: 'pin', default: '0',    type: 'number' }] },
  { cat: 'Sensors', id: 'if_shake',    icon: '📳',  label: 'If Shaken',      color: '#f59e0b', params: [] },
  { cat: 'Sensors', id: 'if_tilt',     icon: '📐',  label: 'If Tilted',      color: '#f59e0b', params: [{ key: 'dir', label: 'dir', default: 'left', type: 'select', options: ['left','right','forward','back'] }] },
  { cat: 'Sensors', id: 'if_light',    icon: '☀️',  label: 'If Light <',     color: '#f59e0b', params: [{ key: 'val',     label: 'lux', default: '100',  type: 'number' }] },
  { cat: 'Sensors', id: 'wait_dist',   icon: '⏳',  label: 'Wait Until Dist <', color: '#f59e0b', params: [{ key: 'cm',   label: 'cm',  default: '20',   type: 'number' }] },
  { cat: 'Sensors', id: 'wait_line',   icon: '⏳',  label: 'Wait for Line',  color: '#f59e0b', params: [] },
  { cat: 'Sensors', id: 'read_dist',   icon: '📏',  label: 'Read Distance → var', color: '#f59e0b', params: [{ key: 'var', label: 'var', default: 'dist', type: 'text' }] },
  { cat: 'Sensors', id: 'read_light',  icon: '💡',  label: 'Read Light → var',   color: '#f59e0b', params: [{ key: 'var', label: 'var', default: 'light', type: 'text' }] },
  { cat: 'Sensors', id: 'follow_line', icon: '🛤️',  label: 'Follow Line',    color: '#f59e0b', params: [{ key: 'secs',   label: 's',   default: '3',    type: 'number' }] },
  { cat: 'Sensors', id: 'avoid_wall',  icon: '🧱',  label: 'Avoid Walls',    color: '#f59e0b', params: [{ key: 'secs',   label: 's',   default: '5',    type: 'number' }] },
  { cat: 'Sensors', id: 'read_temp',   icon: '🌡️',  label: 'Read Temp → var',    color: '#f59e0b', params: [{ key: 'var', label: 'var', default: 'temp', type: 'text' }] },
  { cat: 'Sensors', id: 'read_compass',icon: '🧭',  label: 'Read Compass → var', color: '#f59e0b', params: [{ key: 'var', label: 'var', default: 'heading', type: 'text' }] },
  { cat: 'Sensors', id: 'read_accel',  icon: '📐',  label: 'Read Accel → var',   color: '#f59e0b', params: [{ key: 'var', label: 'var', default: 'ax', type: 'text' }, { key: 'axis', label: 'axis', default: 'x', type: 'select', options: ['x','y','z'] }] },
  { cat: 'Sensors', id: 'read_btn_a',  icon: '🔘',  label: 'Read Button A → var',color: '#f59e0b', params: [{ key: 'var', label: 'var', default: 'btnA', type: 'text' }] },
  { cat: 'Sensors', id: 'read_btn_b',  icon: '🔘',  label: 'Read Button B → var',color: '#f59e0b', params: [{ key: 'var', label: 'var', default: 'btnB', type: 'text' }] },
  { cat: 'Sensors', id: 'if_temp',     icon: '🌡️',  label: 'If Temp >',      color: '#f59e0b', params: [{ key: 'val', label: '°C', default: '25', type: 'number' }] },
  { cat: 'Sensors', id: 'if_compass',  icon: '🧭',  label: 'If Heading >',   color: '#f59e0b', params: [{ key: 'val', label: '°', default: '180', type: 'number' }] },

  // Math
  { cat: 'Math', id: 'math_random',    icon: '🎲',  label: 'Random Number',  color: '#f59e0b', params: [{ key: 'var', label: 'var', default: 'n', type: 'text' }, { key: 'min', label: 'min', default: '1', type: 'number' }, { key: 'max', label: 'max', default: '10', type: 'number' }] },
  { cat: 'Math', id: 'math_abs',       icon: '±',   label: 'Abs Value',      color: '#f59e0b', params: [{ key: 'var', label: 'result', default: 'x', type: 'text' }, { key: 'src', label: 'of', default: 'x', type: 'text' }] },
  { cat: 'Math', id: 'math_map',       icon: '🗺️',  label: 'Map Value',      color: '#f59e0b', params: [{ key: 'var', label: 'result', default: 'mapped', type: 'text' }, { key: 'src', label: 'from', default: 'x', type: 'text' }, { key: 'low1', label: 'lo1', default: '0', type: 'number' }, { key: 'hi1', label: 'hi1', default: '100', type: 'number' }, { key: 'low2', label: 'lo2', default: '0', type: 'number' }, { key: 'hi2', label: 'hi2', default: '1023', type: 'number' }] },
  { cat: 'Math', id: 'math_constrain', icon: '📏',  label: 'Constrain',      color: '#f59e0b', params: [{ key: 'var', label: 'var', default: 'x', type: 'text' }, { key: 'min', label: 'min', default: '0', type: 'number' }, { key: 'max', label: 'max', default: '100', type: 'number' }] },
  { cat: 'Math', id: 'math_expr',      icon: '🧮',  label: 'Set var = expr', color: '#f59e0b', params: [{ key: 'var', label: 'var', default: 'x', type: 'text' }, { key: 'expr', label: '=', default: 'x + 1', type: 'text' }] },

  // Control
  { cat: 'Control', id: 'on_start',    icon: '🚀',  label: 'On Start',       color: '#f59e0b', params: [] },
  { cat: 'Control', id: 'wait',        icon: '⏱️',  label: 'Wait',           color: '#f59e0b', params: [{ key: 'secs',   label: 's',   default: '1',    type: 'number' }] },
  { cat: 'Control', id: 'forever',     icon: '♾️',  label: 'Forever',        color: '#f59e0b', params: [] },
  { cat: 'Control', id: 'repeat',      icon: '🔁',  label: 'Repeat',         color: '#f59e0b', params: [{ key: 'times',  label: 'x',   default: '3',    type: 'number' }] },
  { cat: 'Control', id: 'repeat_end',  icon: '🔚',  label: 'End Repeat',     color: '#f59e0b', params: [] },
  { cat: 'Control', id: 'while_do',    icon: '🔄',  label: 'While',          color: '#f59e0b', params: [{ key: 'cond', label: 'var', default: 'x', type: 'text' }, { key: 'op', label: 'op', default: '<', type: 'select', options: ['<','>','=','!=','<=','>='] }, { key: 'val', label: 'val', default: '10', type: 'number' }] },
  { cat: 'Control', id: 'while_end',   icon: '🔚',  label: 'End While',      color: '#f59e0b', params: [] },
  { cat: 'Control', id: 'for_range',   icon: '🔢',  label: 'Count',          color: '#f59e0b', params: [{ key: 'var', label: 'var', default: 'i', type: 'text' }, { key: 'from', label: 'from', default: '0', type: 'number' }, { key: 'to', label: 'to', default: '5', type: 'number' }] },
  { cat: 'Control', id: 'for_end',     icon: '🔚',  label: 'End Count',      color: '#f59e0b', params: [] },
  { cat: 'Control', id: 'if_then',     icon: '🔀',  label: 'If / Then',      color: '#f59e0b', params: [{ key: 'cond',   label: 'var', default: 'dist',  type: 'text' }, { key: 'op', label: 'op', default: '<', type: 'select', options: ['<','>','=','!=','<=','>='] }, { key: 'val', label: 'val', default: '20', type: 'number' }] },
  { cat: 'Control', id: 'else_branch', icon: '↔️',  label: 'Else',           color: '#f59e0b', params: [] },
  { cat: 'Control', id: 'else_if',     icon: '↔️',  label: 'Else If',        color: '#f59e0b', params: [{ key: 'cond', label: 'var', default: 'x', type: 'text' }, { key: 'op', label: 'op', default: '<', type: 'select', options: ['<','>','=','!=','<=','>='] }, { key: 'val', label: 'val', default: '0', type: 'number' }] },
  { cat: 'Control', id: 'if_end',      icon: '🔚',  label: 'End If',         color: '#f59e0b', params: [] },
  { cat: 'Control', id: 'break',       icon: '✋',  label: 'Break Loop',     color: '#f59e0b', params: [] },
  { cat: 'Control', id: 'stop_all',    icon: '🛑',  label: 'Stop Program',   color: '#f59e0b', params: [] },

  // Outputs
  { cat: 'Outputs', id: 'led',         icon: '💡',  label: 'LED Colour',     color: '#f59e0b', params: [{ key: 'color',  label: 'col', default: 'red',  type: 'select', options: ['red','green','blue','yellow','cyan','magenta','white','off'] }] },
  { cat: 'Outputs', id: 'led_bright',  icon: '🔆',  label: 'LED Brightness', color: '#f59e0b', params: [{ key: 'pct',    label: '%',   default: '100',  type: 'number' }] },
  { cat: 'Outputs', id: 'led_rgb',     icon: '🌈',  label: 'LED RGB',        color: '#f59e0b', params: [{ key: 'r', label: 'R', default: '255', type: 'number' }, { key: 'g', label: 'G', default: '0', type: 'number' }, { key: 'b', label: 'B', default: '0', type: 'number' }] },
  { cat: 'Outputs', id: 'buzz',        icon: '🔔',  label: 'Buzzer',         color: '#f59e0b', params: [{ key: 'secs',   label: 's',   default: '0.5',  type: 'number' }] },
  { cat: 'Outputs', id: 'play_note',   icon: '🎵',  label: 'Play Note',      color: '#f59e0b', params: [{ key: 'note', label: 'note', default: 'C4', type: 'select', options: ['C3','D3','E3','F3','G3','A3','B3','C4','D4','E4','F4','G4','A4','B4','C5'] }, { key: 'secs', label: 's', default: '0.5', type: 'number' }] },
  { cat: 'Outputs', id: 'play_melody', icon: '🎶',  label: 'Play Melody',    color: '#f59e0b', params: [{ key: 'melody', label: 'tune', default: 'happy', type: 'select', options: ['happy','sad','power_up','siren','birthday','twinkle'] }] },
  { cat: 'Outputs', id: 'display',     icon: '📟',  label: 'Show Text',      color: '#f59e0b', params: [{ key: 'text',   label: 'text', default: 'Hi!',  type: 'text' }] },
  { cat: 'Outputs', id: 'show_num',    icon: '🔢',  label: 'Show Number',    color: '#f59e0b', params: [{ key: 'num',    label: 'val',  default: '42',   type: 'number' }] },
  { cat: 'Outputs', id: 'show_icon',   icon: '😀',  label: 'Show Icon',      color: '#f59e0b', params: [{ key: 'icon', label: 'icon', default: 'HAPPY', type: 'select', options: ['HAPPY','SAD','HEART','SURPRISED','ANGRY','YES','NO','ARROW_N','ARROW_S','ARROW_E','ARROW_W','ASLEEP','CONFUSED','SKULL','DIAMOND'] }] },
  { cat: 'Outputs', id: 'clear_disp',  icon: '🧹',  label: 'Clear Display',  color: '#f59e0b', params: [] },

  // Servo & Actuators
  { cat: 'Servo', id: 'servo',         icon: '🔧',  label: 'Servo Angle',    color: '#f59e0b', params: [{ key: 'pin', label: 'pin', default: '0', type: 'number' }, { key: 'angle', label: '°', default: '90', type: 'number' }] },
  { cat: 'Servo', id: 'servo_sweep',   icon: '↔️',  label: 'Servo Sweep',    color: '#f59e0b', params: [{ key: 'pin', label: 'pin', default: '0', type: 'number' }, { key: 'from', label: 'from°', default: '0', type: 'number' }, { key: 'to', label: 'to°', default: '180', type: 'number' }] },
  { cat: 'Servo', id: 'servo_stop',    icon: '🔧',  label: 'Servo Stop',     color: '#f59e0b', params: [{ key: 'pin', label: 'pin', default: '0', type: 'number' }] },
  { cat: 'Servo', id: 'pin_high',      icon: '⬆️',  label: 'Pin HIGH',       color: '#f59e0b', params: [{ key: 'pin', label: 'pin', default: '0', type: 'number' }] },
  { cat: 'Servo', id: 'pin_low',       icon: '⬇️',  label: 'Pin LOW',        color: '#f59e0b', params: [{ key: 'pin', label: 'pin', default: '0', type: 'number' }] },
  { cat: 'Servo', id: 'pwm',           icon: '〰️',  label: 'Set PWM',        color: '#f59e0b', params: [{ key: 'pin', label: 'pin', default: '0', type: 'number' }, { key: 'val', label: '0-255', default: '128', type: 'number' }] },

  // Variables
  { cat: 'Variables', id: 'var_set',   icon: '📦',  label: 'Set Variable',   color: '#f59e0b', params: [{ key: 'name', label: 'name', default: 'x', type: 'text' }, { key: 'val', label: 'val', default: '0', type: 'number' }] },
  { cat: 'Variables', id: 'var_inc',   icon: '📈',  label: 'Increase Var',   color: '#f59e0b', params: [{ key: 'name', label: 'name', default: 'x', type: 'text' }, { key: 'val', label: 'by',  default: '1', type: 'number' }] },
  { cat: 'Variables', id: 'var_dec',   icon: '📉',  label: 'Decrease Var',   color: '#f59e0b', params: [{ key: 'name', label: 'name', default: 'x', type: 'text' }, { key: 'val', label: 'by',  default: '1', type: 'number' }] },
  { cat: 'Variables', id: 'var_show',  icon: '📊',  label: 'Show Variable',  color: '#f59e0b', params: [{ key: 'name', label: 'name', default: 'x', type: 'text' }] },

  // Communication
  { cat: 'Comms', id: 'send_msg',      icon: '📤',  label: 'Send Message',   color: '#f59e0b', params: [{ key: 'msg', label: 'text', default: 'hello', type: 'text' }] },
  { cat: 'Comms', id: 'radio_send',    icon: '📻',  label: 'Radio Send',     color: '#f59e0b', params: [{ key: 'msg', label: 'text', default: 'go',    type: 'text' }] },
  { cat: 'Comms', id: 'radio_group',   icon: '📡',  label: 'Radio Group',    color: '#f59e0b', params: [{ key: 'grp', label: 'grp',  default: '1',     type: 'number' }] },
  { cat: 'Comms', id: 'radio_recv',    icon: '📥',  label: 'Read Radio → var', color: '#f59e0b', params: [{ key: 'var', label: 'var', default: 'msg', type: 'text' }] },
  { cat: 'Comms', id: 'log',           icon: '🖨️',  label: 'Log to Serial',  color: '#f59e0b', params: [{ key: 'msg', label: 'text', default: 'hello', type: 'text' }] },

  // Lights — NeoPixel / WS2812B strips and robot headlights
  { cat: 'Lights', id: 'neo_init',     icon: '💡',  label: 'NeoPixel Setup', color: '#f59e0b', params: [{ key: 'pin', label: 'pin', default: '0', type: 'number' }, { key: 'n', label: 'LEDs', default: '8', type: 'number' }] },
  { cat: 'Lights', id: 'neo_color',    icon: '🎨',  label: 'Set LED Color',  color: '#f59e0b', params: [{ key: 'idx', label: 'LED#', default: '0', type: 'number' }, { key: 'color', label: 'colour', default: 'red', type: 'select', options: ['red','green','blue','yellow','cyan','magenta','white','off'] }] },
  { cat: 'Lights', id: 'neo_rgb',      icon: '🌈',  label: 'Set LED RGB',    color: '#f59e0b', params: [{ key: 'idx', label: 'LED#', default: '0', type: 'number' }, { key: 'r', label: 'R', default: '255', type: 'number' }, { key: 'g', label: 'G', default: '0', type: 'number' }, { key: 'b', label: 'B', default: '0', type: 'number' }] },
  { cat: 'Lights', id: 'neo_all',      icon: '✨',  label: 'Set All LEDs',   color: '#f59e0b', params: [{ key: 'r', label: 'R', default: '0', type: 'number' }, { key: 'g', label: 'G', default: '0', type: 'number' }, { key: 'b', label: 'B', default: '0', type: 'number' }] },
  { cat: 'Lights', id: 'neo_show',     icon: '▶️',  label: 'NeoPixel Show',  color: '#f59e0b', params: [] },
  { cat: 'Lights', id: 'neo_clear',    icon: '🗑️',  label: 'NeoPixel Off',   color: '#f59e0b', params: [] },
  { cat: 'Lights', id: 'neo_bright',   icon: '🔆',  label: 'NeoPixel Brightness', color: '#f59e0b', params: [{ key: 'pct', label: '%', default: '50', type: 'number' }] },
  { cat: 'Lights', id: 'headlight',    icon: '🔦',  label: 'Headlights Color', color: '#f59e0b', params: [{ key: 'r', label: 'R', default: '255', type: 'number' }, { key: 'g', label: 'G', default: '255', type: 'number' }, { key: 'b', label: 'B', default: '255', type: 'number' }] },
  { cat: 'Lights', id: 'headlight_l',  icon: '◀️',  label: 'Left Headlight', color: '#f59e0b', params: [{ key: 'r', label: 'R', default: '255', type: 'number' }, { key: 'g', label: 'G', default: '0', type: 'number' }, { key: 'b', label: 'B', default: '0', type: 'number' }] },
  { cat: 'Lights', id: 'headlight_r',  icon: '▶️',  label: 'Right Headlight',color: '#f59e0b', params: [{ key: 'r', label: 'R', default: '0', type: 'number' }, { key: 'g', label: 'G', default: '0', type: 'number' }, { key: 'b', label: 'B', default: '255', type: 'number' }] },
  { cat: 'Lights', id: 'disp_pixel',   icon: '🔲',  label: 'Set Pixel',      color: '#f59e0b', params: [{ key: 'x', label: 'x', default: '2', type: 'number' }, { key: 'y', label: 'y', default: '2', type: 'number' }, { key: 'bright', label: 'brightness', default: '9', type: 'number' }] },
  { cat: 'Lights', id: 'disp_image',   icon: '🖼️',  label: 'Show Image',     color: '#f59e0b', params: [{ key: 'icon', label: 'icon', default: 'HAPPY', type: 'select', options: ['HAPPY','SAD','HEART','SURPRISED','ANGRY','YES','NO','ARROW_N','ARROW_S','ARROW_E','ARROW_W','ASLEEP','CONFUSED','SKULL','DIAMOND','SNAKE','RABBIT','COW','DUCK','TORTOISE','BUTTERFLY','STICKFIGURE','GHOST','SWORD','TARGET','PITCHFORK','PACMAN','ROLLERSKATE','HOUSE','TSHIRT','ROLLERSKATE','CHESSBOARD','XMAS','UMBRELLA'] }] },
  { cat: 'Lights', id: 'disp_scroll',  icon: '📜',  label: 'Scroll Text',    color: '#f59e0b', params: [{ key: 'text', label: 'text', default: 'Hello!', type: 'text' }] },
  { cat: 'Lights', id: 'disp_show',    icon: '📟',  label: 'Show Value',     color: '#f59e0b', params: [{ key: 'val', label: 'value', default: '42', type: 'text' }] },
  { cat: 'Lights', id: 'disp_clear',   icon: '🧹',  label: 'Clear Screen',   color: '#f59e0b', params: [] },

  // Sensors extras — line following, sonar read
  { cat: 'Sensors', id: 'read_line_l', icon: '◀️',  label: 'Read Left Line Sensor', color: '#f59e0b', params: [{ key: 'var', label: 'var', default: 'lineL', type: 'text' }] },
  { cat: 'Sensors', id: 'read_line_r', icon: '▶️',  label: 'Read Right Line Sensor', color: '#f59e0b', params: [{ key: 'var', label: 'var', default: 'lineR', type: 'text' }] },
  { cat: 'Sensors', id: 'read_sonar',  icon: '📡',  label: 'Read Sonar (cm) → var',  color: '#f59e0b', params: [{ key: 'var', label: 'var', default: 'dist', type: 'text' }] },
];

/* ─── Supported robot profiles ─── */
const ROBOT_PROFILES = {
  microbit: {
    name: 'micro:bit',
    icon: '🔬',
    baud: 115200,
    buildCmd: (cmd, params) => {
      // Short commands sent to REPL — helper functions defined at connect time
      const p = params || {};
      const ms = (steps) => Math.round((steps||20)*10);
      const tms = (deg) => Math.round((deg||90)*5);
      switch (cmd) {
        case 'forward':    return `fw(${ms(p.amount)})\r\n`;
        case 'back':       return `bk(${ms(p.amount)})\r\n`;
        case 'left':       return `lt(${tms(p.degrees)})\r\n`;
        case 'right':      return `rt(${tms(p.degrees)})\r\n`;
        case 'spin_left':  return `lt(${tms(p.degrees)})\r\n`;
        case 'spin_right': return `rt(${tms(p.degrees)})\r\n`;
        case 'move_left':  return `lt(${ms(p.amount)})\r\n`;
        case 'move_right': return `rt(${ms(p.amount)})\r\n`;
        case 'stop':       return `sp()\r\n`;
        case 'coast':      return `sp()\r\n`;
        case 'speed':      return `# speed ${p.pct||75}%\r\n`;
        case 'motor_l':    return `pin0.write_analog(${Math.round((p.power||50)*10.23)})\r\n`;
        case 'motor_r':    return `pin2.write_analog(${Math.round((p.power||50)*10.23)})\r\n`;
        case 'motors':     return `pin0.write_analog(${Math.round((p.left||50)*10.23)});pin2.write_analog(${Math.round((p.right||50)*10.23)})\r\n`;
        case 'if_dist':    return `if sonar() < ${p.cm||20}:\r\n    `;
        case 'if_line':    return `if ls()[0] == 1:\r\n    `;
        case 'if_btn_a':   return `if button_a.is_pressed():\r\n    `;
        case 'if_btn_b':   return `if button_b.is_pressed():\r\n    `;
        case 'if_touch':   return `if pin${p.pin||0}.is_touched():\r\n    `;
        case 'if_shake':   return `if accelerometer.is_gesture('shake'):\r\n    `;
        case 'if_tilt':    return `if accelerometer.is_gesture('${p.dir||'left'}'):\r\n    `;
        case 'if_light':   return `if display.read_light_level() < ${p.val||100}:\r\n    `;
        case 'wait_dist':  return `while sonar() >= ${p.cm||20}: sleep(50)\r\n`;
        case 'wait_line':  return `while ls()[0] == 0: sleep(50)\r\n`;
        case 'read_dist':  return `${p.var||'dist'} = sonar()\r\n`;
        case 'read_light': return `${p.var||'light'} = display.read_light_level()\r\n`;
        case 'follow_line':return `fw(${Math.round((p.secs||3)*1000)})\r\n`;
        case 'avoid_wall': return `sp()\r\n`;
        case 'wait':       return `sleep(${Math.round((p.secs||1)*1000)})\r\n`;
        case 'repeat':     return `for _i in range(${p.times||3}):\r\n`;
        case 'repeat_end': return `pass\r\n`;
        case 'if_then':    { const op = (p.op||'<') === '=' ? '==' : (p.op||'<'); return `if ${p.cond||'dist'} ${op} ${p.val||20}:\r\n`; }
        case 'if_end':     return `pass\r\n`;
        case 'forever':    return `while True:\r\n`;
        case 'break':      return `break\r\n`;
        case 'stop_all':   return `sp()\r\n`;
        case 'led':        return `display.set_pixel(2,2,${(p.color||'off')!=='off'?9:0})\r\n`;
        case 'led_bright': return `# brightness ${p.pct}\r\n`;
        case 'led_rgb':    return `display.set_pixel(2,2,9)\r\n`;
        case 'buzz':       return `music.pitch(440,${Math.round((p.secs||0.5)*1000)})\r\n`;
        case 'play_note':  return `music.pitch(440,${Math.round((p.secs||0.5)*1000)})\r\n`;
        case 'play_melody':return `music.play(music.${(p.melody||'happy').toUpperCase()})\r\n`;
        case 'display':    return `display.scroll('${p.text||'Hi!'}')\r\n`;
        case 'show_num':   return `display.show(str(${p.num||42}))\r\n`;
        case 'show_icon':  return `display.show(Image.${p.icon||'HAPPY'})\r\n`;
        case 'clear_disp': return `display.clear()\r\n`;
        case 'servo':      return `pin${p.pin||0}.write_analog(int(${p.angle||90}/180*1023))\r\n`;
        case 'servo_sweep':return `pin${p.pin||0}.write_analog(int(${p.to||180}/180*1023))\r\n`;
        case 'servo_stop': return `pin${p.pin||0}.write_digital(0)\r\n`;
        case 'pin_high':   return `pin${p.pin||0}.write_digital(1)\r\n`;
        case 'pin_low':    return `pin${p.pin||0}.write_digital(0)\r\n`;
        case 'pwm':        return `pin${p.pin||0}.write_analog(${p.val||128})\r\n`;
        case 'var_set':    return `${p.name||'x'} = ${p.val||0}\r\n`;
        case 'var_inc':    return `${p.name||'x'} += ${p.val||1}\r\n`;
        case 'var_dec':    return `${p.name||'x'} -= ${p.val||1}\r\n`;
        case 'var_show':   return `display.scroll(str(${p.name||'x'}))\r\n`;
        case 'send_msg':   return `uart.write('${p.msg||'hello'}\\n')\r\n`;
        case 'radio_send': return `radio.send('${p.msg||'go'}')\r\n`;
        case 'radio_group':return `radio.config(group=${p.grp||1})\r\n`;
        case 'radio_recv': return `${p.var||'msg'} = radio.receive()\r\n`;
        case 'log':        return `print('${p.msg||'hello'}')\r\n`;
        // Lights — NeoPixel / display / headlights
        case 'neo_init':    return `_np = NeoPixel(pin${p.pin||0}, ${p.n||8})\r\n`;
        case 'neo_color':   { const cols = {red:'(255,0,0)',green:'(0,255,0)',blue:'(0,0,255)',yellow:'(255,255,0)',cyan:'(0,255,255)',magenta:'(255,0,255)',white:'(255,255,255)',off:'(0,0,0)'}; return `_np[${p.idx||0}] = ${cols[p.color||'red']||'(255,0,0)'}\r\n`; }
        case 'neo_rgb':     return `_np[${p.idx||0}] = (${p.r||255}, ${p.g||0}, ${p.b||0})\r\n`;
        case 'neo_all':     return `for _i in range(len(_np)): _np[_i] = (${p.r||0}, ${p.g||0}, ${p.b||0})\r\n`;
        case 'neo_show':    return `_np.show()\r\n`;
        case 'neo_clear':   return `_np.clear()\r\n`;
        case 'neo_bright':  return `# brightness ${p.pct||50}% (set per-pixel: multiply values by ${p.pct||50}/100)\r\n`;
        case 'headlight':   return `hl(${p.r||255}, ${p.g||255}, ${p.b||255})\r\n`;
        case 'headlight_l': return `hl_l(${p.r||255}, ${p.g||0}, ${p.b||0})\r\n`;
        case 'headlight_r': return `hl_r(${p.r||0}, ${p.g||0}, ${p.b||255})\r\n`;
        case 'disp_pixel':  return `display.set_pixel(${p.x||2}, ${p.y||2}, ${p.bright||9})\r\n`;
        case 'disp_image':  return `display.show(Image.${p.icon||'HAPPY'})\r\n`;
        case 'disp_scroll': return `display.scroll('${p.text||'Hello!'}')\r\n`;
        case 'disp_show':   return `display.show(str(${p.val||42}))\r\n`;
        case 'disp_clear':  return `display.clear()\r\n`;
        // Extra sensors
        case 'read_line_l': return `${p.var||'lineL'}, _ = ls()\r\n`;
        case 'read_line_r': return `_, ${p.var||'lineR'} = ls()\r\n`;
        case 'read_sonar':  return `${p.var||'dist'} = sonar()\r\n`;
        // New control flow
        case 'on_start':      return `# --- on start ---\r\n`;
        case 'while_do':      { const op = (p.op||'<') === '=' ? '==' : (p.op||'<'); return `while ${p.cond||'x'} ${op} ${p.val||10}:\r\n`; }
        case 'while_end':     return `pass\r\n`;
        case 'for_range':     return `for ${p.var||'i'} in range(${p.from||0}, ${parseInt(p.to||5)+1}):\r\n`;
        case 'for_end':       return `pass\r\n`;
        case 'else_branch':   return `else:\r\n`;
        case 'else_if':       { const op = (p.op||'<') === '=' ? '==' : (p.op||'<'); return `elif ${p.cond||'x'} ${op} ${p.val||0}:\r\n`; }
        // New sensors
        case 'read_temp':     return `${p.var||'temp'} = temperature()\r\n`;
        case 'read_compass':  return `${p.var||'heading'} = compass.heading()\r\n`;
        case 'read_accel':    return `${p.var||'ax'} = accelerometer.get_${p.axis||'x'}()\r\n`;
        case 'read_btn_a':    return `${p.var||'btnA'} = button_a.is_pressed()\r\n`;
        case 'read_btn_b':    return `${p.var||'btnB'} = button_b.is_pressed()\r\n`;
        case 'if_temp':       return `if temperature() > ${p.val||25}:\r\n`;
        case 'if_compass':    return `if compass.heading() > ${p.val||180}:\r\n`;
        // Math
        case 'math_random':   return `${p.var||'n'} = random.randint(${p.min||1}, ${p.max||10})\r\n`;
        case 'math_abs':      return `${p.var||'x'} = abs(${p.src||p.var||'x'})\r\n`;
        case 'math_map':      return `${p.var||'mapped'} = int((${p.src||'x'} - ${p.low1||0}) * (${p.hi2||1023} - ${p.low2||0}) / max(1, ${p.hi1||100} - ${p.low1||0}) + ${p.low2||0})\r\n`;
        case 'math_constrain':return `${p.var||'x'} = max(${p.min||0}, min(${p.max||100}, ${p.var||'x'}))\r\n`;
        case 'math_expr':     return `${p.var||'x'} = ${p.expr||'x + 1'}\r\n`;
        default: return '';
      }
    },
    codeHeader: '# micro:bit MicroPython\nfrom microbit import *\nimport music, radio\n\n',
    setupCode: `# ✅ No flashing needed!\n# ByteBuddies connects directly to the micro:bit MicroPython REPL via USB.\n# Just plug in your micro:bit, click "Connect Robot", select the USB serial port, and press Run.\n#\n# The Robot class below is sent automatically at connect time.\n# For reference, here is what gets defined on the micro:bit:\n\nfrom microbit import *\nimport utime\n\nclass Robot:\n    def __init__(self): self.speed = 75\n    def drive(self, dist):\n        pin0.write_digital(1); pin1.write_digital(0 if dist>0 else 1)\n        pin2.write_digital(1); pin3.write_digital(1 if dist>0 else 0)\n        utime.sleep_ms(abs(dist)); self.stop()\n    def turn(self, deg):\n        pin0.write_digital(1); pin1.write_digital(1 if deg<0 else 0)\n        pin2.write_digital(1); pin3.write_digital(0 if deg<0 else 1)\n        utime.sleep_ms(abs(int(deg*5))); self.stop()\n    def stop(self): pin0.write_digital(0); pin2.write_digital(0)\n    def set_speed(self, pct): self.speed = pct\n\nrobot = Robot()\ndisplay.show(Image.HAPPY)\n`,
  },
  mbot: {
    name: 'mBot',
    icon: '🤖',
    baud: 9600,
    buildCmd: (cmd, params) => {
      const p = params || {};
      switch (cmd) {
        case 'forward':    return `FWD:${Math.round(p.amount||20)}\n`;
        case 'back':       return `BWD:${Math.round(p.amount||20)}\n`;
        case 'left':       return `LFT:${p.degrees||90}\n`;
        case 'right':      return `RGT:${p.degrees||90}\n`;
        case 'spin_left':  return `SPL:${p.degrees||360}\n`;
        case 'spin_right': return `SPR:${p.degrees||360}\n`;
        case 'stop':       return `STP\n`;
        case 'coast':      return `CST\n`;
        case 'speed':      return `SPD:${p.pct||75}\n`;
        case 'motor_l':    return `ML:${p.power||50}\n`;
        case 'motor_r':    return `MR:${p.power||50}\n`;
        case 'motors':     return `MV:${p.left||50}:${p.right||50}\n`;
        case 'if_dist':    return `IFD:${p.cm||20}\n`;
        case 'if_line':    return `IFL\n`;
        case 'if_btn_a':   return `IFA\n`;
        case 'if_btn_b':   return `IFB\n`;
        case 'if_touch':   return `IFT:${p.pin||0}\n`;
        case 'wait_dist':  return `WTD:${p.cm||20}\n`;
        case 'wait_line':  return `WTL\n`;
        case 'read_dist':  return `RDD:${p.var||'dist'}\n`;
        case 'read_light': return `RDL:${p.var||'light'}\n`;
        case 'follow_line':return `FLN:${Math.round((p.secs||3)*1000)}\n`;
        case 'avoid_wall': return `AVW:${Math.round((p.secs||5)*1000)}\n`;
        case 'wait':       return `DLY:${Math.round((p.secs||1)*1000)}\n`;
        case 'repeat':     return `RPT:${p.times||3}\n`;
        case 'repeat_end': return `RPE\n`;
        case 'if_then':    return `IFC:${p.cond||'dist'}:${p.op||'<'}:${p.val||20}\n`;
        case 'if_end':     return `IFE\n`;
        case 'forever':    return `FVR\n`;
        case 'break':      return `BRK\n`;
        case 'stop_all':   return `STP\nEND\n`;
        case 'led':        return `LED:${p.color||'off'}\n`;
        case 'led_bright': return `LDB:${p.pct||100}\n`;
        case 'led_rgb':    return `LDC:${p.r||255}:${p.g||0}:${p.b||0}\n`;
        case 'buzz':       return `BZZ:${Math.round((p.secs||0.5)*1000)}\n`;
        case 'play_note':  return `NTE:${p.note||'C4'}:${Math.round((p.secs||0.5)*1000)}\n`;
        case 'play_melody':return `MLY:${p.melody||'happy'}\n`;
        case 'display':    return `DSP:${p.text||'Hi!'}\n`;
        case 'show_num':   return `DSN:${p.num||42}\n`;
        case 'show_icon':  return `ICN:${p.icon||'HAPPY'}\n`;
        case 'clear_disp': return `CLR\n`;
        case 'servo':      return `SRV:${p.pin||0}:${p.angle||90}\n`;
        case 'servo_sweep':return `SWP:${p.pin||0}:${p.from||0}:${p.to||180}\n`;
        case 'servo_stop': return `SRS:${p.pin||0}\n`;
        case 'pin_high':   return `PHI:${p.pin||0}\n`;
        case 'pin_low':    return `PLO:${p.pin||0}\n`;
        case 'pwm':        return `PWM:${p.pin||0}:${p.val||128}\n`;
        case 'var_set':    return `VST:${p.name||'x'}:${p.val||0}\n`;
        case 'var_inc':    return `VIN:${p.name||'x'}:${p.val||1}\n`;
        case 'var_dec':    return `VDE:${p.name||'x'}:${p.val||1}\n`;
        case 'var_show':   return `VSH:${p.name||'x'}\n`;
        case 'send_msg':   return `MSG:${p.msg||'hello'}\n`;
        case 'radio_send': return `RAD:${p.msg||'go'}\n`;
        case 'radio_group':return `RGP:${p.grp||1}\n`;
        case 'log':        return `LOG:${p.msg||'hello'}\n`;
        case 'on_start':      return ``;
        case 'while_do':      return `WHL:${p.cond||'x'}:${p.op||'<'}:${p.val||10}\n`;
        case 'while_end':     return `WHE\n`;
        case 'for_range':     return `FOR:${p.var||'i'}:${p.from||0}:${p.to||5}\n`;
        case 'for_end':       return `FOE\n`;
        case 'else_branch':   return `ELS\n`;
        case 'else_if':       return `ELI:${p.cond||'x'}:${p.op||'<'}:${p.val||0}\n`;
        case 'read_temp': case 'read_compass': case 'read_accel':
        case 'read_btn_a': case 'read_btn_b': case 'if_temp': case 'if_compass':
        case 'math_random': case 'math_abs': case 'math_map':
        case 'math_constrain': case 'math_expr': return ``;
        default: return '';
      }
    },
    codeHeader: '// mBot Serial Protocol\n\n',
    setupCode: `/* ByteBuddies — mBot v1 Controller\n   Requires: Makeblock library (Arduino IDE > Library Manager > search "Makeblock")\n   Board: Arduino Uno  |  Port: your mBot COM port  |  Baud: 9600\n   TIP: if Forward goes backward, swap the signs on FWD & BWD lines */\n\n#include <MeMCore.h>\nMeDCMotor motorL(M1), motorR(M2);  // M1=left, M2=right\nint spd = 200;                     // default speed 0-255\nunsigned long stopAt = 0;          // non-blocking auto-stop timer\n\nvoid drive(int l, int r, long ms) { motorL.run(l); motorR.run(r); stopAt = ms > 0 ? millis() + ms : 0; }\nvoid halt() { motorL.stop(); motorR.stop(); stopAt = 0; }\n\nString pCmd(String s) { int i=s.indexOf(':'); return i>=0?s.substring(0,i):s; }\nlong pVal(String s, int n) {\n  int p=0;\n  for(int k=0;k<n;k++){p=s.indexOf(':',p)+1;if(!p)return 0;}\n  int e=s.indexOf(':',p);\n  return e>=0?s.substring(p,e).toInt():s.substring(p).toInt();\n}\n\nvoid setup() { Serial.begin(9600); halt(); }\n\nvoid loop() {\n  // Auto-stop when timed move expires (non-blocking)\n  if (stopAt > 0 && millis() >= stopAt) halt();\n  if (!Serial.available()) return;\n  String s = Serial.readStringUntil('\\n'); s.trim();\n  if (!s.length()) return;\n  String c = pCmd(s); long v = pVal(s, 1);\n  if      (c=="STP"||c=="CST"||c=="END") halt();\n  else if (c=="FWD") drive(-spd,    spd,    v*50);  // both wheels forward\n  else if (c=="BWD") drive( spd,   -spd,    v*50);  // both wheels backward\n  else if (c=="LFT") drive(-spd/2,  spd,    v*8);   // arc left (left wheel slower)\n  else if (c=="RGT") drive(-spd,    spd/2,  v*8);   // arc right (right wheel slower)\n  else if (c=="SPL") drive( spd/2,  spd/2,  v*5);   // spin left in place\n  else if (c=="SPR") drive(-spd/2, -spd/2,  v*5);   // spin right in place\n  else if (c=="SPD") spd = map(v, 0, 100, 0, 255);\n  else if (c=="ML")  motorL.run(map(v, -100, 100, -255, 255));\n  else if (c=="MR")  motorR.run(map(v, -100, 100, -255, 255));\n  else if (c=="MV")  { long l=pVal(s,1),r=pVal(s,2); drive(map(l,-100,100,-255,255),map(r,-100,100,-255,255),0); }\n}`,
  },
  arduino: {
    name: 'Arduino',
    icon: '⚙️',
    baud: 9600,
    buildCmd: (cmd, params) => {
      const p = params || {};
      switch (cmd) {
        case 'forward':    return `FWD:${Math.round(p.amount||20)}\n`;
        case 'back':       return `BWD:${Math.round(p.amount||20)}\n`;
        case 'left':       return `LFT:${p.degrees||90}\n`;
        case 'right':      return `RGT:${p.degrees||90}\n`;
        case 'spin_left':  return `SPL:${p.degrees||360}\n`;
        case 'spin_right': return `SPR:${p.degrees||360}\n`;
        case 'stop':       return `STP\n`;
        case 'coast':      return `CST\n`;
        case 'speed':      return `SPD:${p.pct||75}\n`;
        case 'motor_l':    return `ML:${p.power||50}\n`;
        case 'motor_r':    return `MR:${p.power||50}\n`;
        case 'motors':     return `MV:${p.left||50}:${p.right||50}\n`;
        case 'if_dist':    return `IFD:${p.cm||20}\n`;
        case 'if_line':    return `IFL\n`;
        case 'if_btn_a':   return `IFA\n`;
        case 'if_btn_b':   return `IFB\n`;
        case 'if_touch':   return `IFT:${p.pin||0}\n`;
        case 'wait_dist':  return `WTD:${p.cm||20}\n`;
        case 'wait_line':  return `WTL\n`;
        case 'read_dist':  return `RDD:${p.var||'dist'}\n`;
        case 'read_light': return `RDL:${p.var||'light'}\n`;
        case 'follow_line':return `FLN:${Math.round((p.secs||3)*1000)}\n`;
        case 'avoid_wall': return `AVW:${Math.round((p.secs||5)*1000)}\n`;
        case 'wait':       return `DLY:${Math.round((p.secs||1)*1000)}\n`;
        case 'repeat':     return `for(int _i=0;_i<${p.times||3};_i++) {\n`;
        case 'repeat_end': return `} // end repeat\n`;
        case 'if_then':    return `if(${p.cond||'dist'} ${p.op||'<'} ${p.val||20}) {\n`;
        case 'if_end':     return `} // end if\n`;
        case 'forever':    return `while(true) {\n`;
        case 'break':      return `break;\n`;
        case 'stop_all':   return `STP\n// program ended\nwhile(true){}\n`;
        case 'led':        return `LED:${p.color||'off'}\n`;
        case 'led_bright': return `LDB:${p.pct||100}\n`;
        case 'led_rgb':    return `LDC:${p.r||255}:${p.g||0}:${p.b||0}\n`;
        case 'buzz':       return `BZZ:${Math.round((p.secs||0.5)*1000)}\n`;
        case 'play_note':  return `NTE:${p.note||'C4'}:${Math.round((p.secs||0.5)*1000)}\n`;
        case 'play_melody':return `MLY:${p.melody||'happy'}\n`;
        case 'display':    return `DSP:${p.text||'Hi!'}\n`;
        case 'show_num':   return `DSN:${p.num||42}\n`;
        case 'show_icon':  return `ICN:${p.icon||'HAPPY'}\n`;
        case 'clear_disp': return `CLR\n`;
        case 'servo':      return `SRV:${p.pin||0}:${p.angle||90}\n`;
        case 'servo_sweep':return `SWP:${p.pin||0}:${p.from||0}:${p.to||180}\n`;
        case 'servo_stop': return `SRS:${p.pin||0}\n`;
        case 'pin_high':   return `PHI:${p.pin||0}\n`;
        case 'pin_low':    return `PLO:${p.pin||0}\n`;
        case 'pwm':        return `PWM:${p.pin||0}:${p.val||128}\n`;
        case 'var_set':    return `int ${p.name||'x'} = ${p.val||0};\n`;
        case 'var_inc':    return `${p.name||'x'} += ${p.val||1};\n`;
        case 'var_dec':    return `${p.name||'x'} -= ${p.val||1};\n`;
        case 'var_show':   return `Serial.println(${p.name||'x'});\n`;
        case 'send_msg':   return `Serial.println("${p.msg||'hello'}");\n`;
        case 'radio_send': return `// radio: ${p.msg||'go'}\n`;
        case 'radio_group':return `// radio group: ${p.grp||1}\n`;
        case 'log':        return `Serial.println("${p.msg||'hello'}");\n`;
        case 'on_start':      return `// setup\n`;
        case 'while_do':      return `while (${p.cond||'x'} ${p.op||'<'} ${p.val||10}) {\n`;
        case 'while_end':     return `} // end while\n`;
        case 'for_range':     return `for (int ${p.var||'i'} = ${p.from||0}; ${p.var||'i'} <= ${p.to||5}; ${p.var||'i'}++) {\n`;
        case 'for_end':       return `} // end for\n`;
        case 'else_branch':   return `} else {\n`;
        case 'else_if':       return `} else if (${p.cond||'x'} ${p.op||'<'} ${p.val||0}) {\n`;
        case 'math_random':   return `int ${p.var||'n'} = random(${p.min||1}, ${p.max||10});\n`;
        case 'math_abs':      return `${p.var||'x'} = abs(${p.src||p.var||'x'});\n`;
        case 'math_constrain':return `${p.var||'x'} = constrain(${p.var||'x'}, ${p.min||0}, ${p.max||100});\n`;
        case 'math_expr':     return `${p.var||'x'} = ${p.expr||'x + 1'};\n`;
        case 'read_temp': case 'read_compass': case 'read_accel':
        case 'read_btn_a': case 'read_btn_b': case 'if_temp':
        case 'if_compass': case 'math_map': return ``;
        default: return '';
      }
    },
    codeHeader: '// Arduino Serial Protocol\n\n',
    setupCode: `/* ByteBuddies — Generic Arduino Robot\n   Adjust pin numbers below to match your motor driver (e.g. L298N).\n   Board: Arduino Uno  |  Baud: 9600\n   TIP: if Forward goes backward, flip the sign in driveL/driveR calls on FWD/BWD lines */\n\nconst int PIN_MA_DIR=2, PIN_MA_PWM=3;  // Left  motor  direction + PWM\nconst int PIN_MB_DIR=4, PIN_MB_PWM=5;  // Right motor  direction + PWM\n\nint spd = 200;\nunsigned long stopAt = 0;\n\nvoid driveL(int v) { digitalWrite(PIN_MA_DIR, v>=0?HIGH:LOW); analogWrite(PIN_MA_PWM, abs(v)); }\nvoid driveR(int v) { digitalWrite(PIN_MB_DIR, v>=0?HIGH:LOW); analogWrite(PIN_MB_PWM, abs(v)); }\nvoid drive(int l, int r, long ms) { driveL(l); driveR(r); stopAt = ms>0 ? millis()+ms : 0; }\nvoid halt() { analogWrite(PIN_MA_PWM,0); analogWrite(PIN_MB_PWM,0); stopAt=0; }\n\nString pCmd(String s){int i=s.indexOf(':');return i>=0?s.substring(0,i):s;}\nlong pVal(String s,int n){int p=0;for(int k=0;k<n;k++){p=s.indexOf(':',p)+1;if(!p)return 0;}int e=s.indexOf(':',p);return e>=0?s.substring(p,e).toInt():s.substring(p).toInt();}\n\nvoid setup() {\n  Serial.begin(9600);\n  pinMode(PIN_MA_DIR,OUTPUT);pinMode(PIN_MA_PWM,OUTPUT);\n  pinMode(PIN_MB_DIR,OUTPUT);pinMode(PIN_MB_PWM,OUTPUT);\n  halt();\n}\nvoid loop() {\n  if (stopAt>0 && millis()>=stopAt) halt();\n  if (!Serial.available()) return;\n  String s=Serial.readStringUntil('\\n');s.trim();\n  if (!s.length()) return;\n  String c=pCmd(s);long v=pVal(s,1);\n  if      (c=="STP"||c=="CST"||c=="END") halt();\n  else if (c=="FWD") drive( spd,  spd,  v*50);\n  else if (c=="BWD") drive(-spd, -spd,  v*50);\n  else if (c=="LFT") drive( spd/2, spd, v*8);\n  else if (c=="RGT") drive( spd, spd/2, v*8);\n  else if (c=="SPL") drive(-spd,  spd,  v*5);\n  else if (c=="SPR") drive( spd, -spd,  v*5);\n  else if (c=="SPD") spd=map(v,0,100,0,255);\n  else if (c=="ML")  driveL(map(v,-100,100,-255,255));\n  else if (c=="MR")  driveR(map(v,-100,100,-255,255));\n  else if (c=="MV")  { long l=pVal(s,1),r=pVal(s,2); drive(map(l,-100,100,-255,255),map(r,-100,100,-255,255),0); }\n}`,
  },
};

/* ─── micro:bit kit setup code (sent at connect via raw REPL) ─── */
const MICROBIT_KIT_SETUPS = {
  generic: [
    'from microbit import *',
    'def fw(ms): pin0.write_digital(1);pin1.write_digital(0);pin2.write_digital(1);pin3.write_digital(1);sleep(ms);pin0.write_digital(0);pin2.write_digital(0)',
    'def bk(ms): pin0.write_digital(0);pin1.write_digital(1);pin2.write_digital(0);pin3.write_digital(1);sleep(ms);pin0.write_digital(0);pin2.write_digital(0)',
    'def lt(ms): pin0.write_digital(0);pin1.write_digital(1);pin2.write_digital(1);pin3.write_digital(0);sleep(ms);pin0.write_digital(0);pin2.write_digital(0)',
    'def rt(ms): pin0.write_digital(1);pin1.write_digital(0);pin2.write_digital(0);pin3.write_digital(1);sleep(ms);pin0.write_digital(0);pin2.write_digital(0)',
    'def sp(): pin0.write_digital(0);pin2.write_digital(0)',
    'display.show(Image.HAPPY)',
  ],
  bitbot: [
    'from microbit import *',
    'def fw(ms): pin0.write_analog(700);pin8.write_digital(0);pin1.write_analog(700);pin12.write_digital(0);sleep(ms);pin0.write_digital(0);pin1.write_digital(0)',
    'def bk(ms): pin0.write_analog(700);pin8.write_digital(1);pin1.write_analog(700);pin12.write_digital(1);sleep(ms);pin0.write_digital(0);pin1.write_digital(0)',
    'def lt(ms): pin0.write_analog(0);pin8.write_digital(0);pin1.write_analog(700);pin12.write_digital(0);sleep(ms);pin0.write_digital(0);pin1.write_digital(0)',
    'def rt(ms): pin0.write_analog(700);pin8.write_digital(0);pin1.write_analog(0);pin12.write_digital(0);sleep(ms);pin0.write_digital(0);pin1.write_digital(0)',
    'def sp(): pin0.write_digital(0);pin1.write_digital(0)',
    'display.show(Image.HAPPY)',
  ],
  maqueen: [
    'from microbit import *',
    // Maqueen I2C addr 0x10: [REG, DIR, SPD]  REG: 0=M1-left, 2=M2-right  DIR: 0=fwd 1=bck
    'def _m(r,d,s): i2c.write(0x10,bytes([r,d,s]))',
    'def sp(): _m(0,0,0);_m(2,0,0)',
    'def fw(ms): _m(0,0,200);_m(2,0,200);sleep(ms);sp()',
    'def bk(ms): _m(0,1,200);_m(2,1,200);sleep(ms);sp()',
    'def lt(ms): _m(0,1,150);_m(2,0,200);sleep(ms);sp()',
    'def rt(ms): _m(0,0,200);_m(2,1,150);sleep(ms);sp()',
    // Line sensors: i2c.write(0x10,bytes([0x1D])); d=i2c.read(0x10,1); left=(d[0]>>1)&1; right=d[0]&1
    'def ls(): i2c.write(0x10,bytes([0x1D]));d=i2c.read(0x10,1);return (d[0]>>1)&1,d[0]&1',
    'display.show(Image.HAPPY)',
  ],
  move: [
    'from microbit import *',
    'i2c.write(0x62,bytes([0x00,0x00]))',
    'i2c.write(0x62,bytes([0x01,0x0D]))',
    'i2c.write(0x62,bytes([0x08,0xAA]))',
    'def _pw(a,b,c,d): i2c.write(0x62,bytes([0xA2,a,b,c,d]))',
    'def sp(): _pw(0,0,0,0)',
    'def fw(ms): _pw(150,0,150,0);sleep(ms);sp()',
    'def bk(ms): _pw(0,150,0,150);sleep(ms);sp()',
    'def lt(ms): _pw(0,120,150,0);sleep(ms);sp()',
    'def rt(ms): _pw(150,0,0,120);sleep(ms);sp()',
    'display.show(Image.HAPPY)',
  ],
  cutebot: [
    'from microbit import *',
    // micro:bit v2 defaults to 400kHz I2C; Cutebot STM8 needs 100kHz
    'i2c.init(freq=100000,sda=pin20,scl=pin19)',
    // Reuse a single bytearray to avoid heap churn in forever loops
    '_B=bytearray(4)',
    'def _cb4(r,a,b,c):\n try:\n  _B[0]=r;_B[1]=a;_B[2]=b;_B[3]=c\n  i2c.write(0x10,_B)\n except: pass',
    'def sp():\n _cb4(0x01,2,0,0)\n sleep(50)\n _cb4(0x02,2,0,0)',
    'def fw(ms):\n _cb4(0x01,2,80,0)\n sleep(50)\n _cb4(0x02,2,80,0)\n sleep(ms)\n sp()',
    'def bk(ms):\n _cb4(0x01,1,80,0)\n sleep(50)\n _cb4(0x02,1,80,0)\n sleep(ms)\n sp()',
    'def lt(ms):\n _cb4(0x01,1,60,0)\n sleep(50)\n _cb4(0x02,2,60,0)\n sleep(ms)\n sp()',
    'def rt(ms):\n _cb4(0x01,2,60,0)\n sleep(50)\n _cb4(0x02,1,60,0)\n sleep(ms)\n sp()',
    // Headlights: reg 0x04=left, 0x08=right (NOT 0x05), format [reg, R, G, B]
    'def hl(r,g,b):\n _cb4(0x04,r,g,b)\n sleep(10)\n _cb4(0x08,r,g,b)',
    'def hl_l(r,g,b): _cb4(0x04,r,g,b)',
    'def hl_r(r,g,b): _cb4(0x08,r,g,b)',
    // Sonar: P1=trig, P2=echo (same as MakeCode pxt-cutebot)
    'def sonar():\n pin1.write_digital(0);pin1.write_digital(1);pin1.write_digital(0)\n t=running_time()\n while pin2.read_digital()==0:\n  if running_time()-t>50:return 400\n t=running_time()\n while pin2.read_digital()==1:\n  if running_time()-t>50:return 400\n return (running_time()-t)*17',
    // Line sensors: P14=left, P13=right (1=on line, 0=no line)
    'def ls(): return pin14.read_digital(),pin13.read_digital()',
    'hl(0,0,0)',
    'display.show(Image.HAPPY)',
  ],
  cutebotpro: [
    'from microbit import *',
    // Cutebot Pro I2C addr 0x10: 5-byte packet [0x01, leftDir, leftSpd, rightDir, rightSpd]
    // DIR: 0x01=forward, 0x02=backward for BOTH motors (symmetric convention)
    'def _cbp(ld,ls,rd,rs): i2c.write(0x10,bytes([0x01,ld,ls,rd,rs]))',
    'def _cb4(r,a,b,c): i2c.write(0x10,bytes([r,a,b,c]))',
    'def sp(): _cbp(0,0,0,0)',
    'def fw(ms): _cbp(0x01,80,0x01,80);sleep(ms);sp()',
    'def bk(ms): _cbp(0x02,80,0x02,80);sleep(ms);sp()',
    'def lt(ms): _cbp(0x02,60,0x01,60);sleep(ms);sp()',
    'def rt(ms): _cbp(0x01,60,0x02,60);sleep(ms);sp()',
    'def hl(r,g,b): _cb4(0x04,r,g,b);_cb4(0x05,r,g,b)',
    'def hl_l(r,g,b): _cb4(0x04,r,g,b)',
    'def hl_r(r,g,b): _cb4(0x05,r,g,b)',
    'hl(0,0,0)',
    'display.show(Image.HAPPY)',
  ],
  maqueenplus: [
    'from microbit import *',
    // Maqueen Plus I2C addr 0x10 — same protocol as Maqueen for drive motors
    'def _m(r,d,s): i2c.write(0x10,bytes([r,d,s]))',
    'def sp(): _m(0,0,0);_m(2,0,0)',
    'def fw(ms): _m(0,0,200);_m(2,0,200);sleep(ms);sp()',
    'def bk(ms): _m(0,1,200);_m(2,1,200);sleep(ms);sp()',
    'def lt(ms): _m(0,1,150);_m(2,0,200);sleep(ms);sp()',
    'def rt(ms): _m(0,0,200);_m(2,1,150);sleep(ms);sp()',
    'def ls(): i2c.write(0x10,bytes([0x1D]));d=i2c.read(0x10,1);return (d[0]>>1)&1,d[0]&1',
    // Headlights via I2C register 0x0B (right RGB) and 0x0F (left RGB)
    'def hl(r,g,b): i2c.write(0x10,bytes([0x0B,r,g,b]));i2c.write(0x10,bytes([0x0F,r,g,b]))',
    'hl(0,0,0)',
    'display.show(Image.HAPPY)',
  ],
  ringbitcar: [
    'from microbit import *',
    // Ring:bit Car v2 uses continuous-rotation servos on P1 (right) and P2 (left)
    // Servo: 75=stopped, 30=one dir, 120=other dir  (period=20ms for 50Hz)
    'pin1.set_analog_period(20);pin2.set_analog_period(20)',
    'def sp(): pin1.write_analog(75);pin2.write_analog(75)',
    'def fw(ms): pin1.write_analog(30);pin2.write_analog(120);sleep(ms);sp()',
    'def bk(ms): pin1.write_analog(120);pin2.write_analog(30);sleep(ms);sp()',
    'def lt(ms): pin1.write_analog(75);pin2.write_analog(120);sleep(ms);sp()',
    'def rt(ms): pin1.write_analog(30);pin2.write_analog(75);sleep(ms);sp()',
    'display.show(Image.HAPPY)',
  ],
};

/* ─── Sim robot type definitions ─── */
const SIM_ROBOTS = [
  { id: 'rover',    label: 'Rover',     icon: '🚗', color: '#6366f1', desc: 'Wheeled explorer robot' },
  { id: 'tank',     label: 'Tank Bot',  icon: '🪖', color: '#84cc16', desc: 'Heavy tracked vehicle' },
  { id: 'drone',    label: 'Drone',     icon: '🚁', color: '#22d3ee', desc: 'Flying quadcopter' },
  { id: 'spider',   label: 'Spider',    icon: '🕷️', color: '#f97316', desc: 'Six-legged walker' },
  { id: 'humanoid', label: 'Humanoid',  icon: '🤖', color: '#ec4899', desc: 'Bipedal walking robot' },
  { id: 'arm',      label: 'Robot Arm', icon: '🦾', color: '#f59e0b', desc: 'Articulated arm (fixed base)' },
];

/* ─── Robot draw functions ─── */
function drawRover(ctx, state) {
  const { ledOn, tick, moving, headlightL, headlightR } = state;
  const wa = (tick || 0) * (moving ? 0.13 : 0);
  const hlL = headlightL ? `rgb(${headlightL.r},${headlightL.g},${headlightL.b})` : '#22d3ee';
  const hlR = headlightR ? `rgb(${headlightR.r},${headlightR.g},${headlightR.b})` : '#ef4444';
  const hlGlow = (c) => c ? (c.r + c.g + c.b > 30) : ledOn;

  // Drop shadow ellipse
  ctx.save();
  ctx.shadowBlur = 18; ctx.shadowColor = 'rgba(0,0,0,0.55)';
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(2, 7, 23, 11, 0, 0, Math.PI*2); ctx.fill();
  ctx.restore();

  // ── 6 wheels — sphere-like with bright highlight spot ──
  [[-14,-11],[-14,0],[-14,11],[14,-11],[14,0],[14,11]].forEach(([wx,wy]) => {
    // Tire outer — radial gradient lit top-left
    ctx.save();
    ctx.shadowBlur = 8; ctx.shadowColor = 'rgba(0,0,0,0.7)';
    const tireG = ctx.createRadialGradient(wx-2.5, wy-2.5, 0.5, wx, wy, 6.5);
    tireG.addColorStop(0, '#3d3d3d');
    tireG.addColorStop(0.5, '#111111');
    tireG.addColorStop(1, '#020202');
    ctx.fillStyle = tireG;
    ctx.beginPath(); ctx.arc(wx, wy, 6.5, 0, Math.PI*2); ctx.fill();
    ctx.restore();
    // Rim edge stroke
    ctx.strokeStyle = 'rgba(80,80,80,0.7)'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.arc(wx, wy, 6.5, 0, Math.PI*2); ctx.stroke();
    // Tread grooves
    ctx.strokeStyle = '#080808'; ctx.lineWidth = 1;
    for (let t = 0; t < 8; t++) {
      const ta = wa + t * Math.PI / 4;
      ctx.beginPath(); ctx.arc(wx, wy, 5.8, ta, ta + 0.25); ctx.stroke();
    }
    // Hub — radial gradient sphere-like
    const hubG = ctx.createRadialGradient(wx-2, wy-2.5, 0.3, wx, wy, 4.2);
    hubG.addColorStop(0, '#f8fafc');
    hubG.addColorStop(0.35, '#94a3b8');
    hubG.addColorStop(0.75, '#475569');
    hubG.addColorStop(1, '#1e293b');
    ctx.fillStyle = hubG;
    ctx.beginPath(); ctx.arc(wx, wy, 4.2, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = 'rgba(148,163,184,0.65)'; ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.arc(wx, wy, 4.2, 0, Math.PI*2); ctx.stroke();
    // Spokes
    for (let s = 0; s < 3; s++) {
      const a = wa + s * Math.PI * 2 / 3;
      ctx.strokeStyle = '#334155'; ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(wx + Math.cos(a)*1.3, wy + Math.sin(a)*1.3);
      ctx.lineTo(wx + Math.cos(a)*3.6, wy + Math.sin(a)*3.6);
      ctx.stroke();
    }
    // Center hub cap
    const capG = ctx.createRadialGradient(wx-0.8, wy-0.8, 0.1, wx, wy, 1.6);
    capG.addColorStop(0, '#f1f5f9'); capG.addColorStop(1, '#475569');
    ctx.fillStyle = capG;
    ctx.beginPath(); ctx.arc(wx, wy, 1.6, 0, Math.PI*2); ctx.fill();
    // Bright specular highlight spot on hub (sphere-like)
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.beginPath(); ctx.ellipse(wx-1.5, wy-1.8, 1.2, 0.75, -0.4, 0, Math.PI*2); ctx.fill();
    // Secondary micro-specular
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath(); ctx.arc(wx-0.9, wy-1.1, 0.45, 0, Math.PI*2); ctx.fill();
    // Rim lighting bottom
    ctx.strokeStyle = 'rgba(148,163,184,0.4)'; ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.arc(wx, wy, 4.0, 0.4*Math.PI, 0.9*Math.PI); ctx.stroke();
  });

  // Suspension bars
  ctx.strokeStyle = '#2d3f52'; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
  [[-14,-11],[-14,0],[-14,11],[14,-11],[14,0],[14,11]].forEach(([sx,sy]) => {
    const bx = sx < 0 ? -9 : 9;
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath(); ctx.arc(bx, sy, 2.5, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(bx, sy); ctx.stroke();
  });

  // ── Body — radial gradient lit top-left ──
  ctx.save();
  ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(0,0,0,0.5)';
  const bg = ctx.createRadialGradient(-6, -12, 1, 0, 0, 22);
  bg.addColorStop(0, '#c7d2fe');
  bg.addColorStop(0.3, '#6366f1');
  bg.addColorStop(0.65, '#4338ca');
  bg.addColorStop(1, '#1e1265');
  ctx.fillStyle = bg;
  ctx.beginPath(); ctx.roundRect(-9, -15, 18, 30, 5); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
  // Edge rim lighting
  ctx.strokeStyle = 'rgba(199,210,254,0.7)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.roundRect(-9, -15, 18, 30, 5); ctx.stroke();
  // Specular highlight rect top-left
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.beginPath(); ctx.roundRect(-8, -14, 12, 11, 4); ctx.fill();
  // Bright specular ellipse
  ctx.fillStyle = 'rgba(255,255,255,0.42)';
  ctx.beginPath(); ctx.ellipse(-4, -11, 4, 2.3, -0.3, 0, Math.PI*2); ctx.fill();
  // Panel lines
  ctx.strokeStyle = 'rgba(165,180,252,0.35)'; ctx.lineWidth = 0.6;
  ctx.beginPath(); ctx.moveTo(-9,-4); ctx.lineTo(9,-4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-9, 5); ctx.lineTo(9, 5); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0,-15); ctx.lineTo(0,15); ctx.stroke();

  // ── Sensor bar (front) ──
  ctx.save();
  ctx.shadowBlur = 8; ctx.shadowColor = 'rgba(0,0,0,0.6)';
  const sbg = ctx.createRadialGradient(-4,-18,1, 0,-16, 8);
  sbg.addColorStop(0,'#2d3f52'); sbg.addColorStop(1,'#0f172a');
  ctx.fillStyle = sbg; ctx.beginPath(); ctx.roundRect(-7,-19,14,6,2); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = 'rgba(71,85,105,0.7)'; ctx.lineWidth = 0.7;
  ctx.beginPath(); ctx.roundRect(-7,-19,14,6,2); ctx.stroke();
  // Left headlight
  ctx.save();
  if (hlGlow(headlightL)) { ctx.shadowBlur = 12; ctx.shadowColor = hlL; }
  ctx.fillStyle = hlL;
  ctx.beginPath(); ctx.arc(-3,-16,3,0,Math.PI*2); ctx.fill();
  ctx.restore();
  // Right headlight
  ctx.save();
  if (hlGlow(headlightR)) { ctx.shadowBlur = 12; ctx.shadowColor = hlR; }
  ctx.fillStyle = hlR;
  ctx.beginPath(); ctx.arc(3,-16,3,0,Math.PI*2); ctx.fill();
  ctx.restore();

  // ── Camera dome — glass sphere with inner caustic ──
  ctx.save();
  ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(0,0,0,0.5)';
  // AO ring at base
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath(); ctx.ellipse(0,-3,6.5,3.5,0,0,Math.PI*2); ctx.fill();
  // Dome glass body — radial lit top-left
  const dg = ctx.createRadialGradient(-3,-6,0.4, 0,-3, 6.2);
  dg.addColorStop(0, '#eff6ff');
  dg.addColorStop(0.25, '#93c5fd');
  dg.addColorStop(0.6, '#1d4ed8');
  dg.addColorStop(0.85, '#1e3a8a');
  dg.addColorStop(1, '#0a1628');
  ctx.fillStyle = dg;
  ctx.beginPath(); ctx.arc(0,-3,6,0,Math.PI*2); ctx.fill();
  ctx.restore();
  // Edge stroke
  ctx.strokeStyle = 'rgba(147,197,253,0.75)'; ctx.lineWidth = 0.9;
  ctx.beginPath(); ctx.arc(0,-3,6,0,Math.PI*2); ctx.stroke();
  // Rim lighting bottom
  ctx.strokeStyle = 'rgba(147,197,253,0.35)'; ctx.lineWidth = 0.7;
  ctx.beginPath(); ctx.arc(0,-3,5.8,0.3*Math.PI,0.9*Math.PI); ctx.stroke();
  // Camera lens
  ctx.fillStyle = '#020617'; ctx.beginPath(); ctx.arc(0,-3,3.2,0,Math.PI*2); ctx.fill();
  // Inner caustic (refraction ring)
  const caustic = ctx.createRadialGradient(-0.5,-3.5,0.5, 0,-3,3);
  caustic.addColorStop(0,'rgba(99,102,241,0.8)'); caustic.addColorStop(1,'rgba(30,27,75,0.0)');
  ctx.fillStyle = caustic;
  ctx.beginPath(); ctx.arc(-0.5,-3.5,1.8,0,Math.PI*2); ctx.fill();
  // Glass specular bright
  ctx.fillStyle = 'rgba(255,255,255,0.62)';
  ctx.beginPath(); ctx.ellipse(-2.2,-5.8,1.6,0.95,0.5,0,Math.PI*2); ctx.fill();
  // Secondary small specular
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath(); ctx.arc(-1.2,-4.5,0.65,0,Math.PI*2); ctx.fill();

  // ── Direction arrow ──
  ctx.fillStyle = 'rgba(165,243,252,0.9)';
  ctx.beginPath(); ctx.moveTo(14,0); ctx.lineTo(9,-4); ctx.lineTo(9,4); ctx.closePath(); ctx.fill();
}

function drawTank(ctx, state) {
  const { ledOn, tick } = state;

  // Drop shadow
  ctx.save();
  ctx.shadowBlur = 20; ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.fillStyle = 'rgba(0,0,0,0.38)';
  ctx.beginPath(); ctx.ellipse(3,8,26,13,0,0,Math.PI*2); ctx.fill();
  ctx.restore();

  // ── Tracks — subtle gradient shading ──
  [[-14,0],[14,0]].forEach(([tx]) => {
    const side = tx < 0 ? -1 : 1;
    ctx.save();
    ctx.shadowBlur = 8; ctx.shadowColor = 'rgba(0,0,0,0.5)';
    // Track body — radial gradient for depth
    const trG = ctx.createRadialGradient(tx-4,-10,2, tx,0,16);
    trG.addColorStop(0,'#384e10'); trG.addColorStop(0.5,'#1a2e05'); trG.addColorStop(1,'#070f01');
    ctx.fillStyle = trG;
    ctx.beginPath();
    ctx.arc(tx,-12,8,Math.PI,0);
    ctx.lineTo(tx+8*side,12);
    ctx.arc(tx,12,8,0,Math.PI);
    ctx.closePath(); ctx.fill();
    ctx.restore();
    // Edge stroke
    ctx.strokeStyle = 'rgba(74,112,16,0.65)'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(tx,-12,8,Math.PI,0);
    ctx.lineTo(tx+8*side,12);
    ctx.arc(tx,12,8,0,Math.PI);
    ctx.closePath(); ctx.stroke();
    // Track pad links — gradient shaded
    for (let i = -11; i <= 11; i += 4) {
      const padG = ctx.createLinearGradient(tx-7,i, tx-7,i+3);
      padG.addColorStop(0,'#4a6c14'); padG.addColorStop(1,'#1a2e05');
      ctx.fillStyle = padG;
      ctx.fillRect(tx-7, i, 14, 2.5);
      ctx.strokeStyle = 'rgba(77,124,15,0.5)'; ctx.lineWidth = 0.4;
      ctx.strokeRect(tx-7, i, 14, 2.5);
    }
    // Top-side specular sheen
    ctx.fillStyle = 'rgba(180,220,80,0.10)';
    ctx.beginPath(); ctx.roundRect(tx-7,-11,14,22,3); ctx.fill();
    // Drive sprockets — sphere-like radial gradient
    const sg = ctx.createRadialGradient(tx-3,-14,0.8, tx,-12,7.5);
    sg.addColorStop(0,'#c8f560'); sg.addColorStop(0.35,'#65a30d'); sg.addColorStop(0.7,'#2d5a06'); sg.addColorStop(1,'#0d1a02');
    ctx.save(); ctx.shadowBlur=7; ctx.shadowColor='rgba(0,0,0,0.55)';
    ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(tx,-12,7.5,0,Math.PI*2); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = 'rgba(132,204,22,0.65)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(tx,-12,7.5,0,Math.PI*2); ctx.stroke();
    // Rim lighting on sprocket
    ctx.strokeStyle = 'rgba(163,230,53,0.35)'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.arc(tx,-12,7.2,0.4*Math.PI,0.9*Math.PI); ctx.stroke();
    // Sprocket teeth
    for (let t = 0; t < 6; t++) {
      const ta = t * Math.PI / 3;
      ctx.fillStyle = '#3a5c0e';
      ctx.beginPath(); ctx.arc(tx+Math.cos(ta)*7, -12+Math.sin(ta)*7, 1.5, 0, Math.PI*2); ctx.fill();
    }
    const sg2 = ctx.createRadialGradient(tx-3,10,0.8, tx,12,7.5);
    sg2.addColorStop(0,'#84cc16'); sg2.addColorStop(0.5,'#3a5c0e'); sg2.addColorStop(1,'#0d1a02');
    ctx.fillStyle = sg2; ctx.beginPath(); ctx.arc(tx,12,7.5,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle = 'rgba(77,124,15,0.6)'; ctx.lineWidth = 1; ctx.stroke();
    // Specular on top sprocket
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.beginPath(); ctx.ellipse(tx-2.5,-14.5,2.8,1.6,0.4,0,Math.PI*2); ctx.fill();
  });

  // ── Armored hull — radial gradient lit top-left ──
  ctx.save();
  ctx.shadowBlur = 8; ctx.shadowColor = 'rgba(0,0,0,0.5)';
  const hg = ctx.createRadialGradient(-7,-10,1, 0,0,18);
  hg.addColorStop(0,'#c8f560');
  hg.addColorStop(0.3,'#7ec413');
  hg.addColorStop(0.6,'#3f6212');
  hg.addColorStop(1,'#111e03');
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.moveTo(-6,-12); ctx.lineTo(6,-12); ctx.lineTo(10,-8);
  ctx.lineTo(10,8); ctx.lineTo(6,12); ctx.lineTo(-6,12);
  ctx.lineTo(-10,8); ctx.lineTo(-10,-8); ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
  // Rim lighting edge stroke
  ctx.strokeStyle = 'rgba(200,245,96,0.7)'; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-6,-12); ctx.lineTo(6,-12); ctx.lineTo(10,-8);
  ctx.lineTo(10,8); ctx.lineTo(6,12); ctx.lineTo(-6,12);
  ctx.lineTo(-10,8); ctx.lineTo(-10,-8); ctx.closePath(); ctx.stroke();
  // Specular highlight strip top-left
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.beginPath(); ctx.moveTo(-6,-12); ctx.lineTo(6,-12); ctx.lineTo(9,-9); ctx.lineTo(-9,-9); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.32)';
  ctx.beginPath(); ctx.ellipse(-3,-8,4,2,0.2,0,Math.PI*2); ctx.fill();
  // Armor panel lines
  ctx.strokeStyle = 'rgba(163,230,53,0.3)'; ctx.lineWidth = 0.7;
  ctx.beginPath(); ctx.moveTo(-10,0); ctx.lineTo(10,0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0,-12); ctx.lineTo(0,12); ctx.stroke();
  // Rivets
  [[-7,-10],[-7,0],[-7,10],[7,-10],[7,0],[7,10]].forEach(([rx,ry]) => {
    const rv = ctx.createRadialGradient(rx-0.5,ry-0.5,0.1, rx,ry,1.5);
    rv.addColorStop(0,'#e4fb6a'); rv.addColorStop(1,'#3f6212');
    ctx.fillStyle = rv; ctx.beginPath(); ctx.arc(rx,ry,1.5,0,Math.PI*2); ctx.fill();
  });

  // AO at hull-turret joint
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.arc(0,0,10,0,Math.PI*2); ctx.fill();

  // ── Turret — sphere-like radial gradient, bright top-left ──
  ctx.save();
  ctx.shadowBlur = 14; ctx.shadowColor = 'rgba(0,0,0,0.55)';
  const tg = ctx.createRadialGradient(-4,-4,0.8, 0,0,9.5);
  tg.addColorStop(0,'#e8fc80');
  tg.addColorStop(0.3,'#a3d40e');
  tg.addColorStop(0.6,'#3d6b07');
  tg.addColorStop(1,'#071002');
  ctx.fillStyle = tg; ctx.beginPath(); ctx.arc(0,0,9.5,0,Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
  ctx.strokeStyle = 'rgba(200,245,96,0.7)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(0,0,9.5,0,Math.PI*2); ctx.stroke();
  // Rim lighting bottom
  ctx.strokeStyle = 'rgba(163,230,53,0.35)'; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.arc(0,0,9.2,0.35*Math.PI,0.85*Math.PI); ctx.stroke();
  // Turret specular highlight (larger + bright)
  ctx.fillStyle = 'rgba(255,255,255,0.38)';
  ctx.beginPath(); ctx.ellipse(-3,-3.5,4,2.3,0.4,0,Math.PI*2); ctx.fill();
  // Secondary specular dot
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath(); ctx.arc(-4.5,-4.5,1.2,0,Math.PI*2); ctx.fill();
  // Turret rivets
  for (let r = 0; r < 6; r++) {
    const ra = r * Math.PI / 3 + 0.2;
    const rx = Math.cos(ra)*7.5, ry = Math.sin(ra)*7.5;
    const rv2 = ctx.createRadialGradient(rx-0.4,ry-0.4,0.1,rx,ry,1.3);
    rv2.addColorStop(0,'#d4f04a'); rv2.addColorStop(1,'#3f6212');
    ctx.fillStyle = rv2; ctx.beginPath(); ctx.arc(rx,ry,1.3,0,Math.PI*2); ctx.fill();
  }
  // Turret hatch — radial gradient
  const hatchG = ctx.createRadialGradient(-3,-3,0.5,-2,-2,4.5);
  hatchG.addColorStop(0,'#a3e635'); hatchG.addColorStop(0.5,'#4d7c0f'); hatchG.addColorStop(1,'#0d1a02');
  ctx.fillStyle = hatchG; ctx.beginPath(); ctx.arc(-2,-2,4.5,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle = 'rgba(163,230,53,0.7)'; ctx.lineWidth = 0.8; ctx.stroke();

  // ── Barrel ──
  ctx.save();
  ctx.shadowBlur = 8; ctx.shadowColor = 'rgba(0,0,0,0.5)';
  const brg = ctx.createLinearGradient(9,-2.5,9,2.5);
  brg.addColorStop(0,'#b5e048'); brg.addColorStop(0.4,'#65a30d'); brg.addColorStop(1,'#1a2e05');
  ctx.fillStyle = brg; ctx.beginPath(); ctx.roundRect(9,-2.5,17,5,2); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = 'rgba(132,204,22,0.7)'; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.roundRect(9,-2.5,17,5,2); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.beginPath(); ctx.roundRect(10,-2.2,16,1.5,1); ctx.fill();
  // Muzzle brake
  ctx.save();
  ctx.shadowBlur = 6; ctx.shadowColor = 'rgba(0,0,0,0.5)';
  const mbg = ctx.createLinearGradient(25,-3,25,3);
  mbg.addColorStop(0,'#5a8f12'); mbg.addColorStop(1,'#0d1a02');
  ctx.fillStyle = mbg; ctx.beginPath(); ctx.roundRect(25,-3,5,6,1); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = 'rgba(77,124,15,0.7)'; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.roundRect(25,-3,5,6,1); ctx.stroke();

  // ── Sensor eye ──
  if (ledOn) {
    ctx.save(); ctx.shadowBlur = 10; ctx.shadowColor = '#fbbf24';
    ctx.fillStyle = '#fef08a';
    ctx.beginPath(); ctx.arc(4,-3,3,0,Math.PI*2); ctx.fill();
    ctx.restore();
  } else {
    const eyeG = ctx.createRadialGradient(3,-4,0.5,4,-3,3.5);
    eyeG.addColorStop(0,'#bbf7d0'); eyeG.addColorStop(1,'#166534');
    ctx.fillStyle = eyeG; ctx.beginPath(); ctx.arc(4,-3,3,0,Math.PI*2); ctx.fill();
  }
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.beginPath(); ctx.arc(4,-3,1.5,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.beginPath(); ctx.arc(3.3,-3.7,0.8,0,Math.PI*2); ctx.fill();
}

function drawDrone(ctx, state) {
  const { ledOn, tick } = state;
  const spin = (tick||0) * 0.35;

  // ── Arms (X-config) — gradient from dark to darker ──
  ctx.lineCap = 'round';
  [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([dx,dy]) => {
    // Drop shadow
    ctx.strokeStyle = 'rgba(0,0,0,0.38)'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(dx*3+1,dy*3+1); ctx.lineTo(dx*19+1,dy*19+1); ctx.stroke();
    // Arm dark base
    ctx.strokeStyle = '#0a1020'; ctx.lineWidth = 5.5;
    ctx.beginPath(); ctx.moveTo(dx*3,dy*3); ctx.lineTo(dx*19,dy*19); ctx.stroke();
    // Mid gradient shade
    ctx.strokeStyle = '#1c2840'; ctx.lineWidth = 3.8;
    ctx.beginPath(); ctx.moveTo(dx*3,dy*3); ctx.lineTo(dx*19,dy*19); ctx.stroke();
    // Top-left highlight edge
    ctx.strokeStyle = 'rgba(100,116,139,0.55)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(dx*3-dy*0.9,dy*3-dx*0.9); ctx.lineTo(dx*19-dy*0.9,dy*19-dx*0.9); ctx.stroke();
  });

  // ── Motor pods + spinning propellers ──
  [[-19,-19],[19,-19],[19,19],[-19,19]].forEach(([px,py],i) => {
    // Propeller motion blur glow
    const propGlow = ctx.createRadialGradient(px,py,2,px,py,12);
    propGlow.addColorStop(0,'rgba(186,230,253,0.35)');
    propGlow.addColorStop(0.7,'rgba(148,210,253,0.15)');
    propGlow.addColorStop(1,'rgba(148,210,253,0)');
    ctx.fillStyle = propGlow;
    ctx.beginPath(); ctx.arc(px,py,12,0,Math.PI*2); ctx.fill();
    // Propeller disc rings
    ctx.strokeStyle = 'rgba(148,210,253,0.5)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(px,py,11,0,Math.PI*2); ctx.stroke();
    ctx.strokeStyle = 'rgba(148,210,253,0.25)'; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.arc(px,py,9,0,Math.PI*2); ctx.stroke();

    // AO under motor
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.beginPath(); ctx.arc(px,py,7,0,Math.PI*2); ctx.fill();

    // Motor pod — sphere-like radial gradient
    ctx.save();
    ctx.shadowBlur = 8; ctx.shadowColor = 'rgba(0,0,0,0.55)';
    const mg = ctx.createRadialGradient(px-2,py-2,0.4, px,py,6.5);
    mg.addColorStop(0,'#cbd5e1');
    mg.addColorStop(0.35,'#64748b');
    mg.addColorStop(0.7,'#1e293b');
    mg.addColorStop(1,'#060c18');
    ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(px,py,6.5,0,Math.PI*2); ctx.fill();
    ctx.restore();
    // Edge stroke
    ctx.strokeStyle = 'rgba(100,116,139,0.65)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(px,py,6.5,0,Math.PI*2); ctx.stroke();
    // Rim lighting bottom
    ctx.strokeStyle = 'rgba(148,163,184,0.3)'; ctx.lineWidth = 0.7;
    ctx.beginPath(); ctx.arc(px,py,6.2,0.35*Math.PI,0.85*Math.PI); ctx.stroke();
    // Specular highlight — sphere-like
    ctx.fillStyle = 'rgba(255,255,255,0.42)';
    ctx.beginPath(); ctx.ellipse(px-2,py-2.5,2.2,1.3,0.5,0,Math.PI*2); ctx.fill();
    // Secondary micro specular
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.beginPath(); ctx.arc(px-3,py-3,0.8,0,Math.PI*2); ctx.fill();

    // Spinning blades
    ctx.save(); ctx.translate(px,py); ctx.rotate(spin + i*Math.PI*0.5);
    for (let b = 0; b < 2; b++) {
      ctx.save(); ctx.rotate(b*Math.PI);
      ctx.fillStyle = 'rgba(186,230,253,0.2)';
      ctx.beginPath(); ctx.ellipse(0,-7.5,4,8.5,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = 'rgba(186,230,253,0.6)';
      ctx.beginPath(); ctx.ellipse(0,-7.5,2.5,7.5,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.28)';
      ctx.beginPath(); ctx.ellipse(-0.5,-6,1,3.5,0,0,Math.PI*2); ctx.fill();
      ctx.restore();
    }
    ctx.restore();

    // LED status dot
    const ledColors = ['#ef4444','#22c55e','#22c55e','#ef4444'];
    if (ledOn) {
      ctx.save(); ctx.shadowBlur = 8; ctx.shadowColor = '#fbbf24';
      ctx.fillStyle = '#fef08a';
      ctx.beginPath(); ctx.arc(px,py,2.5,0,Math.PI*2); ctx.fill();
      ctx.restore();
    } else {
      ctx.fillStyle = ledColors[i];
      ctx.beginPath(); ctx.arc(px,py,2.5,0,Math.PI*2); ctx.fill();
    }
  });

  // ── Shadow ──
  ctx.save();
  ctx.shadowBlur = 14; ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.beginPath(); ctx.ellipse(2,5,13,9,0,0,Math.PI*2); ctx.fill();
  ctx.restore();

  // ── Central body diamond — radial gradient bright cyan top-left to dark navy ──
  ctx.save();
  ctx.shadowBlur = 14; ctx.shadowColor = 'rgba(0,0,0,0.5)';
  const bg = ctx.createRadialGradient(-5,-5,0.5, 0,0,14);
  bg.addColorStop(0,'#a5f3fc');
  bg.addColorStop(0.25,'#22d3ee');
  bg.addColorStop(0.55,'#0369a1');
  bg.addColorStop(0.8,'#0c2d54');
  bg.addColorStop(1,'#020d1a');
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.moveTo(0,-13); ctx.lineTo(13,0); ctx.lineTo(0,13); ctx.lineTo(-13,0); ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
  // Edge stroke
  ctx.strokeStyle = 'rgba(56,189,248,0.75)'; ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0,-13); ctx.lineTo(13,0); ctx.lineTo(0,13); ctx.lineTo(-13,0); ctx.closePath();
  ctx.stroke();
  // Top facet highlight
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath(); ctx.moveTo(0,-13); ctx.lineTo(13,0); ctx.lineTo(0,-4); ctx.closePath(); ctx.fill();
  // Specular highlight ellipse top-left
  ctx.fillStyle = 'rgba(255,255,255,0.42)';
  ctx.beginPath(); ctx.ellipse(-4,-6,4.5,2.2,0.7,0,Math.PI*2); ctx.fill();
  // Secondary specular dot
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  ctx.beginPath(); ctx.arc(-5.5,-7,1,0,Math.PI*2); ctx.fill();
  // Carbon fiber texture lines
  ctx.strokeStyle = 'rgba(2,132,199,0.3)'; ctx.lineWidth = 0.5;
  ctx.beginPath(); ctx.moveTo(-9,-4); ctx.lineTo(9,4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-9,4); ctx.lineTo(9,-4); ctx.stroke();

  // ── Camera gimbal — sphere-like ──
  ctx.save();
  ctx.shadowBlur = 8; ctx.shadowColor = 'rgba(0,0,0,0.5)';
  const gimbalG = ctx.createRadialGradient(-1.5,1.5,0.4, 0,3,5.5);
  gimbalG.addColorStop(0,'#475569');
  gimbalG.addColorStop(0.5,'#1e293b');
  gimbalG.addColorStop(1,'#060c18');
  ctx.fillStyle = gimbalG; ctx.beginPath(); ctx.arc(0,3,5.5,0,Math.PI*2); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = 'rgba(71,85,105,0.65)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0,3,5.5,0,Math.PI*2); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.beginPath(); ctx.ellipse(-1.2,1.5,1.5,0.9,0.4,0,Math.PI*2); ctx.fill();
  // Camera lens
  const lensG = ctx.createRadialGradient(-1,2,0.3,0,3,3.2);
  lensG.addColorStop(0, ledOn ? '#fef08a' : '#67e8f9');
  lensG.addColorStop(0.6, ledOn ? '#f59e0b' : '#0e7490');
  lensG.addColorStop(1,'#0c1a2e');
  if (ledOn) { ctx.save(); ctx.shadowBlur = 10; ctx.shadowColor = '#fbbf24'; }
  ctx.fillStyle = lensG; ctx.beginPath(); ctx.arc(0,3,3.2,0,Math.PI*2); ctx.fill();
  if (ledOn) ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,0.68)';
  ctx.beginPath(); ctx.arc(-1.1,2.1,1.2,0,Math.PI*2); ctx.fill();

  // Direction arrow
  ctx.fillStyle = 'rgba(224,242,254,0.9)';
  ctx.beginPath(); ctx.moveTo(14,0); ctx.lineTo(9,-4); ctx.lineTo(9,4); ctx.closePath(); ctx.fill();
}

function drawSpider(ctx, state) {
  const { ledOn, tick, moving } = state;
  const w = Math.sin((tick||0)*0.2) * (moving?5:1);

  // ── 6 legs with joints — segmented dark chitin ──
  const legDefs = [
    [[-9,-4], [-20,-18+w], [-27,-24+w*1.2]],
    [[-10,0], [-24,-2],    [-30,-1]],
    [[-9,4],  [-20,18-w],  [-27,24-w*1.2]],
    [[9,-4],  [20,-18-w],  [27,-24-w*1.2]],
    [[10,0],  [24,-2],     [30,-1]],
    [[9,4],   [20,18+w],   [27,24+w*1.2]],
  ];

  ctx.lineCap = 'round';
  // Thigh segments — dark base + lighter joint highlight
  ctx.strokeStyle = '#3d1a05'; ctx.lineWidth = 3.5;
  legDefs.forEach(([[sx,sy],[kx,ky]]) => {
    ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(kx,ky); ctx.stroke();
  });
  ctx.strokeStyle = '#92400e'; ctx.lineWidth = 2.5;
  legDefs.forEach(([[sx,sy],[kx,ky]]) => {
    ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(kx,ky); ctx.stroke();
  });
  // Shin segments — slightly darker than thigh
  ctx.strokeStyle = '#2a0e02'; ctx.lineWidth = 2.5;
  legDefs.forEach(([[,],[kx,ky],[fx,fy]]) => {
    ctx.beginPath(); ctx.moveTo(kx,ky); ctx.lineTo(fx,fy); ctx.stroke();
  });
  ctx.strokeStyle = '#9a3d0a'; ctx.lineWidth = 1.8;
  legDefs.forEach(([[,],[kx,ky],[fx,fy]]) => {
    ctx.beginPath(); ctx.moveTo(kx,ky); ctx.lineTo(fx,fy); ctx.stroke();
  });
  // Leg chitin highlight — lighter at joints
  ctx.strokeStyle = 'rgba(251,146,60,0.28)'; ctx.lineWidth = 0.8;
  legDefs.forEach(([[sx,sy],[kx,ky],[fx,fy]]) => {
    ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(kx,ky); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(kx,ky); ctx.lineTo(fx,fy); ctx.stroke();
  });
  // Knee joints — sphere-like radial gradients
  legDefs.forEach(([[,],[kx,ky]]) => {
    const kjG = ctx.createRadialGradient(kx-1,ky-1,0.2, kx,ky,3);
    kjG.addColorStop(0,'#fcd34d');
    kjG.addColorStop(0.35,'#d97706');
    kjG.addColorStop(0.7,'#92400e');
    kjG.addColorStop(1,'#451a03');
    ctx.fillStyle = kjG;
    ctx.beginPath(); ctx.arc(kx,ky,3,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle = 'rgba(251,191,36,0.5)'; ctx.lineWidth = 0.6;
    ctx.beginPath(); ctx.arc(kx,ky,3,0,Math.PI*2); ctx.stroke();
    // Specular highlight on knee joint
    ctx.fillStyle = 'rgba(255,255,255,0.42)';
    ctx.beginPath(); ctx.ellipse(kx-0.9,ky-1,1.1,0.65,0.5,0,Math.PI*2); ctx.fill();
    // Rim lighting bottom
    ctx.strokeStyle = 'rgba(217,119,6,0.3)'; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.arc(kx,ky,2.8,0.35*Math.PI,0.85*Math.PI); ctx.stroke();
  });
  // Foot tips — sharp dark
  legDefs.forEach(([[,],[,],[fx,fy]]) => {
    const ftG = ctx.createRadialGradient(fx-0.5,fy-0.5,0.2,fx,fy,2.2);
    ftG.addColorStop(0,'#57534e'); ftG.addColorStop(0.5,'#1c1917'); ftG.addColorStop(1,'#050403');
    ctx.fillStyle = ftG;
    ctx.beginPath(); ctx.arc(fx,fy,2.2,0,Math.PI*2); ctx.fill();
  });

  // Shadow
  ctx.save();
  ctx.shadowBlur = 14; ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(2,5,15,11,0,0,Math.PI*2); ctx.fill();
  ctx.restore();

  // ── Abdomen (rear segment) — radial gradient + specular highlight ellipse ──
  ctx.save();
  ctx.shadowBlur = 12; ctx.shadowColor = 'rgba(0,0,0,0.5)';
  const ag = ctx.createRadialGradient(-5,-10,1, 0,-5,15);
  ag.addColorStop(0,'#fde68a');
  ag.addColorStop(0.2,'#fb923c');
  ag.addColorStop(0.5,'#ea580c');
  ag.addColorStop(0.75,'#9a3412');
  ag.addColorStop(1,'#350a02');
  ctx.fillStyle = ag;
  ctx.beginPath(); ctx.ellipse(-2,-5,10,13,0.1,0,Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
  // Edge stroke
  ctx.strokeStyle = 'rgba(251,146,60,0.7)'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.ellipse(-2,-5,10,13,0.1,0,Math.PI*2); ctx.stroke();
  // Rim lighting bottom
  ctx.strokeStyle = 'rgba(251,146,60,0.3)'; ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.ellipse(-2,-5,9.5,12.5,0.1,0.35*Math.PI,0.85*Math.PI); ctx.stroke();
  // Abdomen chitin stripes
  ctx.strokeStyle = 'rgba(251,146,60,0.4)'; ctx.lineWidth = 1.2;
  [-10,-5,0].forEach(y => {
    ctx.beginPath(); ctx.moveTo(-10,y); ctx.lineTo(6,y); ctx.stroke();
  });
  // Specular highlight ellipse — top-left
  ctx.fillStyle = 'rgba(255,255,255,0.32)';
  ctx.beginPath(); ctx.ellipse(-5,-11,4.5,2.8,0.3,0,Math.PI*2); ctx.fill();
  // Secondary micro specular
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.beginPath(); ctx.arc(-6,-12.5,1.2,0,Math.PI*2); ctx.fill();
  // AO at joint
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(0,2,8,5,0,0,Math.PI*2); ctx.fill();

  // ── Cephalothorax — radial gradient with specular ──
  ctx.save();
  ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(0,0,0,0.45)';
  const cg = ctx.createRadialGradient(-4,2,1, 1,7,16);
  cg.addColorStop(0,'#fed7aa');
  cg.addColorStop(0.25,'#f97316');
  cg.addColorStop(0.55,'#c2410c');
  cg.addColorStop(0.8,'#7c1d06');
  cg.addColorStop(1,'#280702');
  ctx.fillStyle = cg;
  ctx.beginPath(); ctx.ellipse(1,7,13,10,0,0,Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0;
  ctx.restore();
  // Edge stroke
  ctx.strokeStyle = 'rgba(251,146,60,0.65)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.ellipse(1,7,13,10,0,0,Math.PI*2); ctx.stroke();
  // Rim lighting bottom
  ctx.strokeStyle = 'rgba(234,88,12,0.3)'; ctx.lineWidth = 0.7;
  ctx.beginPath(); ctx.ellipse(1,7,12.5,9.5,0,0.35*Math.PI,0.85*Math.PI); ctx.stroke();
  // Cephalothorax specular highlight
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.beginPath(); ctx.ellipse(-4,3,5.5,3.2,0.3,0,Math.PI*2); ctx.fill();
  // Secondary specular dot
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath(); ctx.arc(-5,2,1.4,0,Math.PI*2); ctx.fill();

  // ── 8 eyes — glowing ──
  const eyePositions=[[-5,2],[-2,0],[2,0],[5,2],[-5,5],[-2,7],[2,7],[5,5]];
  if (ledOn) {
    ctx.save(); ctx.shadowBlur = 8; ctx.shadowColor = '#fbbf24';
    eyePositions.slice(0,4).forEach(([ex,ey]) => {
      const eyeG = ctx.createRadialGradient(ex-0.4,ey-0.4,0.2,ex,ey,1.8);
      eyeG.addColorStop(0,'#fff7c0'); eyeG.addColorStop(0.5,'#fef08a'); eyeG.addColorStop(1,'#f59e0b');
      ctx.fillStyle = eyeG;
      ctx.beginPath(); ctx.arc(ex,ey,1.8,0,Math.PI*2); ctx.fill();
    });
    ctx.restore();
    eyePositions.slice(4).forEach(([ex,ey]) => {
      ctx.fillStyle = '#fef3c7'; ctx.beginPath(); ctx.arc(ex,ey,1.4,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.beginPath(); ctx.arc(ex+0.3,ey+0.3,0.6,0,Math.PI*2); ctx.fill();
    });
  } else {
    eyePositions.forEach(([ex,ey]) => {
      const eyeG = ctx.createRadialGradient(ex-0.3,ey-0.3,0.2,ex,ey,1.6);
      eyeG.addColorStop(0,'#fef3c7'); eyeG.addColorStop(1,'#92400e');
      ctx.fillStyle = eyeG;
      ctx.beginPath(); ctx.arc(ex,ey,1.6,0,Math.PI*2); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.beginPath(); ctx.arc(ex+0.3,ey+0.3,0.7,0,Math.PI*2); ctx.fill();
    });
  }

  // ── Fangs/chelicerae ──
  ctx.strokeStyle = '#3d1a05'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-3,15); ctx.quadraticCurveTo(-5,18,-5,22); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(3,15); ctx.quadraticCurveTo(5,18,5,22); ctx.stroke();
  ctx.strokeStyle = '#92400e'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-3,15); ctx.quadraticCurveTo(-5,18,-5,22); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(3,15); ctx.quadraticCurveTo(5,18,5,22); ctx.stroke();
  const fangG1 = ctx.createRadialGradient(-6,21,0.3,-5,22,2.5);
  fangG1.addColorStop(0,'#92400e'); fangG1.addColorStop(1,'#120501');
  ctx.fillStyle = fangG1; ctx.beginPath(); ctx.arc(-5,22,2.5,0,Math.PI*2); ctx.fill();
  const fangG2 = ctx.createRadialGradient(4,21,0.3,5,22,2.5);
  fangG2.addColorStop(0,'#92400e'); fangG2.addColorStop(1,'#120501');
  ctx.fillStyle = fangG2; ctx.beginPath(); ctx.arc(5,22,2.5,0,Math.PI*2); ctx.fill();
}

function drawHumanoid(ctx, state) {
  const { ledOn, tick, moving } = state;
  const phase = moving ? (tick||0)*0.18 : 0;

  const lThighDeg = Math.sin(phase)*28;
  const rThighDeg = Math.sin(phase+Math.PI)*28;
  const lKneeDeg  = Math.max(5,-lThighDeg*0.7+12);
  const rKneeDeg  = Math.max(5,-rThighDeg*0.7+12);
  const lArmDeg   = Math.sin(phase+Math.PI)*20;
  const rArmDeg   = Math.sin(phase)*20;

  const drawLimb = (hx,hy,s1,s2,a1d,a2d,col,w) => {
    const a1=a1d*Math.PI/180;
    const kx=hx+Math.sin(a1)*s1, ky=hy+Math.cos(a1)*s1;
    const a2=(a1d+a2d)*Math.PI/180;
    const ex=kx+Math.sin(a2)*s2, ey=ky+Math.cos(a2)*s2;
    ctx.strokeStyle=col; ctx.lineWidth=w; ctx.lineCap='round'; ctx.lineJoin='round';
    ctx.beginPath(); ctx.moveTo(hx,hy); ctx.lineTo(kx,ky); ctx.lineTo(ex,ey); ctx.stroke();
    return {kx,ky,ex,ey};
  };

  // Shadow
  ctx.fillStyle='rgba(0,0,0,0.22)';
  ctx.beginPath(); ctx.ellipse(0,32,12,5,0,0,Math.PI*2); ctx.fill();

  // ── Legs — gradient strokes (lighter near joints) ──
  const lLeg = drawLimb(-5,12,14,13,lThighDeg,lKneeDeg,'#5b21b6',6);
  const rLeg = drawLimb( 5,12,14,13,rThighDeg,rKneeDeg,'#6d28d9',6);
  // Limb highlight pass
  const lLeg2 = drawLimb(-5,12,14,13,lThighDeg,lKneeDeg,'rgba(139,92,246,0.45)',2);
  const rLeg2 = drawLimb( 5,12,14,13,rThighDeg,rKneeDeg,'rgba(139,92,246,0.45)',2);
  // Knee joints — sphere-like radial gradients
  [lLeg.kx,rLeg.kx].forEach((kx,i) => {
    const ky = i===0 ? lLeg.ky : rLeg.ky;
    const kjG = ctx.createRadialGradient(kx-1,ky-1,0.3, kx,ky,3.5);
    kjG.addColorStop(0,'#c4b5fd');
    kjG.addColorStop(0.4,'#7c3aed');
    kjG.addColorStop(1,'#2e1065');
    ctx.fillStyle=kjG;
    ctx.beginPath(); ctx.arc(kx,ky,3.5,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='rgba(167,139,250,0.6)'; ctx.lineWidth=0.7;
    ctx.beginPath(); ctx.arc(kx,ky,3.5,0,Math.PI*2); ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.45)';
    ctx.beginPath(); ctx.ellipse(kx-0.9,ky-1,1.1,0.65,0.5,0,Math.PI*2); ctx.fill();
  });
  // Feet (boots)
  ctx.save();
  ctx.shadowBlur=6; ctx.shadowColor='rgba(0,0,0,0.4)';
  const bootG1 = ctx.createRadialGradient(lLeg.ex-1,lLeg.ey-1,0.5, lLeg.ex+1,lLeg.ey+1,7);
  bootG1.addColorStop(0,'#4c1d95'); bootG1.addColorStop(1,'#1a0836');
  ctx.fillStyle=bootG1;
  ctx.beginPath(); ctx.roundRect(lLeg.ex-3,lLeg.ey-2,9,5,2); ctx.fill();
  const bootG2 = ctx.createRadialGradient(rLeg.ex-1,rLeg.ey-1,0.5, rLeg.ex+1,rLeg.ey+1,7);
  bootG2.addColorStop(0,'#4c1d95'); bootG2.addColorStop(1,'#1a0836');
  ctx.fillStyle=bootG2;
  ctx.beginPath(); ctx.roundRect(rLeg.ex-3,rLeg.ey-2,9,5,2); ctx.fill();
  ctx.restore();
  ctx.strokeStyle='rgba(109,40,217,0.7)'; ctx.lineWidth=0.8;
  ctx.strokeRect(lLeg.ex-3,lLeg.ey-2,9,5); ctx.strokeRect(rLeg.ex-3,rLeg.ey-2,9,5);

  // ── Torso — radial gradient + specular + shadow ──
  ctx.save();
  ctx.shadowBlur=8; ctx.shadowColor='rgba(0,0,0,0.5)';
  const tg = ctx.createRadialGradient(-7,-8,1, 0,1,22);
  tg.addColorStop(0,'#c4b5fd');
  tg.addColorStop(0.3,'#7c3aed');
  tg.addColorStop(0.65,'#5b21b6');
  tg.addColorStop(1,'#1e0a4a');
  ctx.fillStyle=tg; ctx.beginPath(); ctx.roundRect(-10,-10,20,22,5); ctx.fill();
  ctx.shadowBlur=0;
  ctx.restore();
  // Edge stroke
  ctx.strokeStyle='rgba(196,181,253,0.7)'; ctx.lineWidth=1; ctx.stroke();
  // Specular highlight rect top-left
  ctx.fillStyle='rgba(255,255,255,0.16)';
  ctx.beginPath(); ctx.roundRect(-9,-9,13,9,4); ctx.fill();
  // Specular ellipse
  ctx.fillStyle='rgba(255,255,255,0.35)';
  ctx.beginPath(); ctx.ellipse(-5,-6,5,2.5,0.2,0,Math.PI*2); ctx.fill();
  // Torso panel lines
  ctx.strokeStyle='rgba(196,181,253,0.3)'; ctx.lineWidth=0.7;
  ctx.beginPath(); ctx.moveTo(-10,-2); ctx.lineTo(10,-2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-10,5); ctx.lineTo(10,5); ctx.stroke();
  // Shoulder pads — sphere-like radialGradients
  [[-14,-12],[6,-12]].forEach(([spx,spy]) => {
    const spG = ctx.createRadialGradient(spx+1,spy+1,0.5, spx+4,spy+4,8);
    spG.addColorStop(0,'#a78bfa');
    spG.addColorStop(0.4,'#7c3aed');
    spG.addColorStop(1,'#3b0f80');
    ctx.fillStyle=spG;
    ctx.beginPath(); ctx.roundRect(spx,spy,8,8,3); ctx.fill();
    ctx.strokeStyle='rgba(167,139,250,0.65)'; ctx.lineWidth=0.8; ctx.stroke();
    // Specular on shoulder pad
    ctx.fillStyle='rgba(255,255,255,0.35)';
    ctx.beginPath(); ctx.ellipse(spx+1.5,spy+1.5,2,1.2,0.4,0,Math.PI*2); ctx.fill();
  });
  // Chest LED
  if(ledOn){
    ctx.save(); ctx.shadowBlur=10; ctx.shadowColor='#fbbf24';
    ctx.fillStyle='#fef08a';
    ctx.beginPath(); ctx.roundRect(-4,-6,8,8,2); ctx.fill();
    ctx.restore();
  } else {
    ctx.fillStyle='#22d3ee'; ctx.beginPath(); ctx.roundRect(-4,-6,8,8,2); ctx.fill();
    ctx.fillStyle='rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.roundRect(-3,-5,3,6,1); ctx.fill();
    ctx.beginPath(); ctx.roundRect(0,-5,3,6,1); ctx.fill();
  }
  // Waist belt
  const wbG = ctx.createLinearGradient(-10,10,-10,14);
  wbG.addColorStop(0,'#4c1d95'); wbG.addColorStop(1,'#1a0836');
  ctx.fillStyle=wbG; ctx.beginPath(); ctx.roundRect(-10,10,20,4,1); ctx.fill();
  ctx.strokeStyle='rgba(124,58,237,0.6)'; ctx.lineWidth=0.6; ctx.stroke();

  // ── Arms — gradient strokes (lighter at joints) ──
  const lArm = drawLimb(-11,-6,12,10,lArmDeg,lArmDeg*0.4,'#5b21b6',5);
  const rArm = drawLimb( 11,-6,12,10,rArmDeg,rArmDeg*0.4,'#5b21b6',5);
  drawLimb(-11,-6,12,10,lArmDeg,lArmDeg*0.4,'rgba(139,92,246,0.4)',1.5);
  drawLimb( 11,-6,12,10,rArmDeg,rArmDeg*0.4,'rgba(139,92,246,0.4)',1.5);
  // Elbow joints — sphere-like
  [lArm.kx,rArm.kx].forEach((kx,i) => {
    const ky = i===0 ? lArm.ky : rArm.ky;
    const ejG = ctx.createRadialGradient(kx-0.8,ky-0.8,0.2, kx,ky,3);
    ejG.addColorStop(0,'#a78bfa');
    ejG.addColorStop(0.45,'#7c3aed');
    ejG.addColorStop(1,'#2e1065');
    ctx.fillStyle=ejG;
    ctx.beginPath(); ctx.arc(kx,ky,3,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='rgba(167,139,250,0.55)'; ctx.lineWidth=0.6; ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.42)';
    ctx.beginPath(); ctx.ellipse(kx-0.7,ky-0.8,0.9,0.55,0.5,0,Math.PI*2); ctx.fill();
  });
  // Hands — sphere-like
  [lArm,rArm].forEach(({ex,ey}) => {
    const hndG = ctx.createRadialGradient(ex-1.2,ey-1.2,0.4, ex,ey,4);
    hndG.addColorStop(0,'#8b5cf6');
    hndG.addColorStop(0.5,'#5b21b6');
    hndG.addColorStop(1,'#1e0a4a');
    ctx.fillStyle=hndG;
    ctx.beginPath(); ctx.arc(ex,ey,4,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='rgba(167,139,250,0.6)'; ctx.lineWidth=0.8;
    ctx.beginPath(); ctx.arc(ex,ey,4,0,Math.PI*2); ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,0.38)';
    ctx.beginPath(); ctx.ellipse(ex-1.2,ey-1.5,1.4,0.8,0.4,0,Math.PI*2); ctx.fill();
  });

  // ── Neck ──
  const nkG = ctx.createRadialGradient(-1.5,-13,0.5, 0,-11,5);
  nkG.addColorStop(0,'#7c3aed'); nkG.addColorStop(1,'#2e1065');
  ctx.fillStyle=nkG;
  ctx.beginPath(); ctx.roundRect(-3,-14,6,6,2); ctx.fill();

  // ── Head — radial gradient lit top-left + specular ──
  ctx.save();
  ctx.shadowBlur=8; ctx.shadowColor='rgba(0,0,0,0.5)';
  const hg = ctx.createRadialGradient(-7,-32,1, 0,-24,18);
  hg.addColorStop(0,'#ddd6fe');
  hg.addColorStop(0.3,'#a78bfa');
  hg.addColorStop(0.6,'#6d28d9');
  hg.addColorStop(1,'#2e1065');
  ctx.fillStyle=hg; ctx.beginPath(); ctx.roundRect(-10,-34,20,20,7); ctx.fill();
  ctx.shadowBlur=0;
  ctx.restore();
  // Edge stroke
  ctx.strokeStyle='rgba(221,214,254,0.7)'; ctx.lineWidth=1; ctx.stroke();
  // Specular highlight rect top-left
  ctx.fillStyle='rgba(255,255,255,0.18)';
  ctx.beginPath(); ctx.roundRect(-9,-33,12,8,4); ctx.fill();
  // Specular ellipse bright
  ctx.fillStyle='rgba(255,255,255,0.42)';
  ctx.beginPath(); ctx.ellipse(-5,-30,4,2,0.2,0,Math.PI*2); ctx.fill();
  // Secondary micro specular
  ctx.fillStyle='rgba(255,255,255,0.5)';
  ctx.beginPath(); ctx.arc(-7,-32,1.2,0,Math.PI*2); ctx.fill();
  // Visor
  if(ledOn){
    ctx.save(); ctx.shadowBlur=10; ctx.shadowColor='#67e8f9';
    ctx.fillStyle='#a5f3fc';
    ctx.beginPath(); ctx.roundRect(-7,-30,14,9,3); ctx.fill();
    ctx.restore();
  } else {
    ctx.fillStyle='#164e63';
    ctx.beginPath(); ctx.roundRect(-7,-30,14,9,3); ctx.fill();
    ctx.fillStyle='#0e7490';
    ctx.beginPath(); ctx.roundRect(-6,-29,5,7,2); ctx.fill();
    ctx.beginPath(); ctx.roundRect(1,-29,5,7,2); ctx.fill();
    ctx.fillStyle='rgba(103,232,249,0.5)';
    ctx.beginPath(); ctx.arc(-3,-25.5,1.5,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(3,-25.5,1.5,0,Math.PI*2); ctx.fill();
  }
  // Chin/jaw detail
  ctx.fillStyle='#4c1d95';
  ctx.beginPath(); ctx.roundRect(-6,-17,12,3,1); ctx.fill();
  // Ear fins
  ctx.fillStyle='#6d28d9';
  ctx.beginPath(); ctx.moveTo(-10,-28); ctx.lineTo(-14,-24); ctx.lineTo(-10,-20); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(10,-28); ctx.lineTo(14,-24); ctx.lineTo(10,-20); ctx.closePath(); ctx.fill();
  // Antenna
  ctx.strokeStyle='#a78bfa'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(0,-34); ctx.lineTo(0,-41); ctx.stroke();
  const antG = ctx.createRadialGradient(-1,-42,0.5, 0,-41,3);
  antG.addColorStop(0,'#f5d0fe'); antG.addColorStop(1,'#a21caf');
  ctx.fillStyle=antG;
  ctx.beginPath(); ctx.arc(0,-41,3,0,Math.PI*2); ctx.fill();
  if(ledOn){ ctx.save(); ctx.shadowBlur=8; ctx.shadowColor='#f0abfc'; ctx.fill(); ctx.restore(); }
  ctx.strokeStyle='rgba(221,214,254,0.7)'; ctx.lineWidth=0.8; ctx.stroke();
}

function drawArm(ctx, state) {
  const { servoAngle, ledOn } = state;
  const angle1 = ((servoAngle||90)-90)*Math.PI/180;
  const angle2 = angle1*0.6;

  // ── Base plate — radial gradient from steel grey top to dark bottom ──
  ctx.save();
  ctx.shadowBlur=8; ctx.shadowColor='rgba(0,0,0,0.5)';
  const bpg = ctx.createRadialGradient(-10,15,1, 0,21,28);
  bpg.addColorStop(0,'#94a3b8');
  bpg.addColorStop(0.4,'#475569');
  bpg.addColorStop(1,'#0f1b2d');
  ctx.fillStyle=bpg; ctx.beginPath(); ctx.roundRect(-20,14,40,14,4); ctx.fill();
  ctx.shadowBlur=0;
  ctx.restore();
  ctx.strokeStyle='rgba(71,85,105,0.7)'; ctx.lineWidth=1; ctx.stroke();
  // Specular strip top-left
  ctx.fillStyle='rgba(255,255,255,0.14)';
  ctx.beginPath(); ctx.roundRect(-19,14.5,18,4,2); ctx.fill();
  // Base bolts — sphere-like
  [[-16,18],[16,18],[-16,24],[16,24]].forEach(([bx,by])=>{
    const bltG = ctx.createRadialGradient(bx-0.5,by-0.5,0.2, bx,by,2);
    bltG.addColorStop(0,'#cbd5e1'); bltG.addColorStop(1,'#334155');
    ctx.fillStyle=bltG; ctx.beginPath(); ctx.arc(bx,by,2,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='rgba(148,163,184,0.5)'; ctx.lineWidth=0.5; ctx.stroke();
  });
  // Mounting plate circle — sphere-like radialGradient
  ctx.save();
  ctx.shadowBlur=6; ctx.shadowColor='rgba(0,0,0,0.45)';
  const mpg = ctx.createRadialGradient(-3,11,1, 0,14,12);
  mpg.addColorStop(0,'#94a3b8');
  mpg.addColorStop(0.5,'#475569');
  mpg.addColorStop(1,'#0f1b2d');
  ctx.fillStyle=mpg; ctx.beginPath(); ctx.arc(0,14,12,0,Math.PI*2); ctx.fill();
  ctx.restore();
  ctx.strokeStyle='rgba(71,85,105,0.7)'; ctx.lineWidth=1.5; ctx.stroke();
  // Rim lighting on mounting plate
  ctx.strokeStyle='rgba(148,163,184,0.35)'; ctx.lineWidth=0.8;
  ctx.beginPath(); ctx.arc(0,14,11.5,0.4*Math.PI,0.85*Math.PI); ctx.stroke();
  // Specular on mounting plate
  ctx.fillStyle='rgba(255,255,255,0.3)';
  ctx.beginPath(); ctx.ellipse(-3,11,3.5,2,0.3,0,Math.PI*2); ctx.fill();
  // Rotation ring
  ctx.strokeStyle='rgba(148,163,184,0.7)'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.arc(0,14,9,0,Math.PI*2); ctx.stroke();

  // ── Upper arm — radial gradient + specular ──
  ctx.save(); ctx.translate(0,14); ctx.rotate(angle1);
  ctx.save();
  ctx.shadowBlur=6; ctx.shadowColor='rgba(0,0,0,0.45)';
  const uag = ctx.createRadialGradient(-3,-18,1, 0,-18,12);
  uag.addColorStop(0,'#cbd5e1');
  uag.addColorStop(0.35,'#64748b');
  uag.addColorStop(0.7,'#2d3f52');
  uag.addColorStop(1,'#0c1825');
  ctx.fillStyle=uag; ctx.beginPath(); ctx.roundRect(-5,-36,10,36,4); ctx.fill();
  ctx.restore();
  ctx.strokeStyle='rgba(203,213,225,0.65)'; ctx.lineWidth=1; ctx.stroke();
  // Upper arm specular highlight
  ctx.fillStyle='rgba(255,255,255,0.18)';
  ctx.beginPath(); ctx.roundRect(-4,-35,5,14,3); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.35)';
  ctx.beginPath(); ctx.ellipse(-3,-28,1.8,6,0,0,Math.PI*2); ctx.fill();
  // Cable
  ctx.strokeStyle='rgba(100,116,139,0.7)'; ctx.lineWidth=1.5; ctx.setLineDash([2,2]);
  ctx.beginPath(); ctx.moveTo(3,-5); ctx.lineTo(3,-28); ctx.stroke();
  ctx.setLineDash([]);

  // Elbow joint — sphere-like radial gradient with bright highlight ──
  ctx.save();
  ctx.shadowBlur=8; ctx.shadowColor='rgba(0,0,0,0.5)';
  const ejg = ctx.createRadialGradient(-3,-38,0.5, 0,-36,8);
  ejg.addColorStop(0,'#a5b4fc');
  ejg.addColorStop(0.3,'#6366f1');
  ejg.addColorStop(0.65,'#3730a3');
  ejg.addColorStop(1,'#12106a');
  ctx.fillStyle=ejg; ctx.beginPath(); ctx.arc(0,-36,8,0,Math.PI*2); ctx.fill();
  ctx.restore();
  ctx.strokeStyle='rgba(165,180,252,0.65)'; ctx.lineWidth=1.5; ctx.stroke();
  // Rim lighting on elbow
  ctx.strokeStyle='rgba(199,210,254,0.35)'; ctx.lineWidth=0.8;
  ctx.beginPath(); ctx.arc(0,-36,7.5,0.4*Math.PI,0.85*Math.PI); ctx.stroke();
  // Elbow specular
  ctx.fillStyle='rgba(255,255,255,0.45)';
  ctx.beginPath(); ctx.ellipse(-2,-38,2.5,1.5,0.4,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='rgba(199,210,254,0.5)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.arc(0,-36,5,0,Math.PI*2); ctx.stroke();

  ctx.save(); ctx.translate(0,-36); ctx.rotate(angle2);

  // ── Forearm — radial gradient + specular ──
  ctx.save();
  ctx.shadowBlur=6; ctx.shadowColor='rgba(0,0,0,0.45)';
  const fag = ctx.createRadialGradient(-3,-14,0.5, 0,-14,9);
  fag.addColorStop(0,'#a5b4fc');
  fag.addColorStop(0.4,'#6366f1');
  fag.addColorStop(0.75,'#3730a3');
  fag.addColorStop(1,'#12106a');
  ctx.fillStyle=fag; ctx.beginPath(); ctx.roundRect(-4,-28,8,28,4); ctx.fill();
  ctx.restore();
  ctx.strokeStyle='rgba(165,180,252,0.65)'; ctx.lineWidth=1; ctx.stroke();
  // Forearm specular
  ctx.fillStyle='rgba(255,255,255,0.22)';
  ctx.beginPath(); ctx.roundRect(-3,-27,4,12,3); ctx.fill();
  ctx.fillStyle='rgba(255,255,255,0.38)';
  ctx.beginPath(); ctx.ellipse(-2.5,-22,1.5,5,0,0,Math.PI*2); ctx.fill();

  // Wrist joint — sphere-like radial gradient
  ctx.save();
  ctx.shadowBlur=6; ctx.shadowColor='rgba(0,0,0,0.45)';
  const wjg = ctx.createRadialGradient(-2,-30,0.5, 0,-28,6);
  wjg.addColorStop(0,'#67e8f9');
  wjg.addColorStop(0.4,'#0891b2');
  wjg.addColorStop(0.75,'#0c4a6e');
  wjg.addColorStop(1,'#021222');
  ctx.fillStyle=wjg; ctx.beginPath(); ctx.arc(0,-28,6,0,Math.PI*2); ctx.fill();
  ctx.restore();
  ctx.strokeStyle='rgba(103,232,249,0.65)'; ctx.lineWidth=1.2; ctx.stroke();
  // Rim lighting on wrist
  ctx.strokeStyle='rgba(34,211,238,0.3)'; ctx.lineWidth=0.7;
  ctx.beginPath(); ctx.arc(0,-28,5.7,0.35*Math.PI,0.85*Math.PI); ctx.stroke();
  // Wrist specular
  ctx.fillStyle='rgba(255,255,255,0.42)';
  ctx.beginPath(); ctx.ellipse(-1.5,-29.5,1.8,1,0.4,0,Math.PI*2); ctx.fill();

  // ── Gripper ──
  const gc = ledOn ? '#fbbf24' : '#0e7490';
  const gcl = ledOn ? '#fef08a' : '#22d3ee';
  if(ledOn){ ctx.save(); ctx.shadowBlur=8; ctx.shadowColor='#fbbf24'; }
  ctx.fillStyle=gc;
  ctx.beginPath(); ctx.roundRect(-7,-35,5,9,3); ctx.fill();
  ctx.beginPath(); ctx.roundRect(2,-35,5,9,3); ctx.fill();
  ctx.fillStyle=gcl;
  ctx.beginPath(); ctx.roundRect(-6.5,-34.5,2,4,1); ctx.fill();
  ctx.beginPath(); ctx.roundRect(4.5,-34.5,2,4,1); ctx.fill();
  if(ledOn) ctx.restore();
  ctx.strokeStyle=gcl; ctx.lineWidth=0.8;
  ctx.strokeRect(-7,-35,5,9); ctx.strokeRect(2,-35,5,9);

  ctx.restore(); ctx.restore();

  // Angle label
  ctx.fillStyle='#94a3b8'; ctx.font='bold 10px monospace'; ctx.textAlign='center';
  ctx.fillText(`${Math.round(servoAngle||90)}°`,0,32);
}

function drawGrid(ctx) {
  ctx.strokeStyle = 'rgba(99,102,241,0.12)'; ctx.lineWidth = 1;
  for (let x = 0; x < 480; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,360); ctx.stroke(); }
  for (let y = 0; y < 360; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(480,y); ctx.stroke(); }
}

/* ─── Track definitions & draw functions ─── */
export const TRACKS = [
  { id: 'open',      icon: '⬜', label: 'Open Field',    desc: 'Plain grid — no obstacles' },
  { id: 'square',    icon: '⬛', label: 'Square Track',   desc: 'Rectangular loop road' },
  { id: 'figure8',   icon: '∞',  label: 'Figure 8',      desc: 'Figure-8 loop crossing in the middle' },
  { id: 'linefollow',icon: '〰️', label: 'Line Follow',   desc: 'Winding black line on white' },
  { id: 'maze',      icon: '🧩', label: 'Maze',          desc: 'Navigate through walls' },
  { id: 'obstacles', icon: '🔴', label: 'Obstacles',     desc: 'Dodge scattered obstacles' },
  { id: 'city',      icon: '🏙️', label: 'City Grid',     desc: 'Drive through road intersections' },
  { id: 'ramp',      icon: '🏔️', label: 'Ramp Course',   desc: 'Angled ramps and speed zones' },
];

function drawTrack(ctx, trackId) {
  if (!trackId || trackId === 'open') return;
  ctx.save();
  ctx.scale(1.5, 1.5); // tracks designed for 320×240; scale to 480×360

  if (trackId === 'square') {
    // Grass background
    ctx.fillStyle = '#166534'; ctx.fillRect(0, 0, 320, 240);
    // Road (outer minus inner)
    ctx.fillStyle = '#475569';
    ctx.fillRect(18, 14, 284, 212);
    ctx.fillStyle = '#166534';
    ctx.fillRect(62, 50, 196, 140);
    // Kerb lines (white border)
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.5; ctx.setLineDash([]);
    ctx.strokeRect(18, 14, 284, 212);
    ctx.strokeRect(62, 50, 196, 140);
    // Centre dashes
    ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1.5; ctx.setLineDash([12, 8]);
    ctx.strokeRect(40, 32, 240, 176);
    ctx.setLineDash([]);
    // Start/finish line
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 5; i++) {
      if (i % 2 === 0) { ctx.fillStyle = '#ffffff'; } else { ctx.fillStyle = '#000'; }
      ctx.fillRect(155 + i*6, 14, 6, 18);
    }
  }

  else if (trackId === 'figure8') {
    ctx.fillStyle = '#166534'; ctx.fillRect(0, 0, 320, 240);
    // Draw two circular road loops
    const drawLoop = (cx, cy, ro, ri) => {
      ctx.beginPath(); ctx.arc(cx, cy, ro, 0, Math.PI*2);
      ctx.fillStyle = '#475569'; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, ri, 0, Math.PI*2);
      ctx.fillStyle = '#166534'; ctx.fill();
      // kerb
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(cx, cy, ro, 0, Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, ri, 0, Math.PI*2); ctx.stroke();
      // centre dash
      ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1.5; ctx.setLineDash([8, 6]);
      ctx.beginPath(); ctx.arc(cx, cy, (ro+ri)/2, 0, Math.PI*2); ctx.stroke();
      ctx.setLineDash([]);
    };
    drawLoop(100, 120, 72, 38);
    drawLoop(220, 120, 72, 38);
    // Fill crossover bridge (hide gap)
    ctx.fillStyle = '#475569';
    ctx.fillRect(145, 98, 30, 44);
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.setLineDash([]);
    ctx.strokeRect(145, 98, 30, 44);
    // Start marker
    ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(100, 55, 5, 0, Math.PI*2); ctx.fill();
  }

  else if (trackId === 'linefollow') {
    // White background
    ctx.fillStyle = '#f8fafc'; ctx.fillRect(0, 0, 320, 240);
    // Draw faint dots
    ctx.fillStyle = 'rgba(99,102,241,0.1)';
    for (let x = 16; x < 320; x += 32) for (let y = 16; y < 240; y += 32) { ctx.beginPath(); ctx.arc(x,y,2,0,Math.PI*2); ctx.fill(); }
    // Winding black line
    ctx.strokeStyle = '#1e293b'; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(30, 120);
    ctx.bezierCurveTo(60, 30,  120, 30,  160, 120);
    ctx.bezierCurveTo(200, 210, 260, 210, 290, 120);
    ctx.stroke();
    // Start dot
    ctx.fillStyle = '#22c55e'; ctx.beginPath(); ctx.arc(30, 120, 8, 0, Math.PI*2); ctx.fill();
    // End dot
    ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(290, 120, 8, 0, Math.PI*2); ctx.fill();
    // labels
    ctx.fillStyle = '#64748b'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center';
    ctx.fillText('START', 30, 108); ctx.fillText('END', 290, 108);
  }

  else if (trackId === 'maze') {
    ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, 320, 240);
    // Floor
    ctx.fillStyle = '#1e293b'; ctx.fillRect(8, 8, 304, 224);
    // Walls
    const walls = [
      [8,8,304,12],   // top
      [8,220,304,12], // bottom
      [8,8,12,224],   // left
      [300,8,12,224], // right
      [8,8,12,120],[70,8,12,80],[70,80,100,12],[170,8,12,80],[170,80,100,12],[270,8,12,120],
      [70,160,12,80],[170,160,12,80],
      [100,110,120,12],[100,130,120,12],
      [8,120,60,12],[252,120,60,12],
    ];
    ctx.fillStyle = '#334155';
    walls.forEach(([x,y,w,h]) => {
      ctx.fillRect(x,y,w,h);
      ctx.strokeStyle='#475569'; ctx.lineWidth=1; ctx.setLineDash([]);
      ctx.strokeRect(x,y,w,h);
    });
    // Start
    ctx.fillStyle = '#22c55e'; ctx.beginPath(); ctx.arc(40, 60, 8, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
    ctx.fillText('S', 40, 63);
    // End
    ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.arc(280, 180, 8, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#000'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
    ctx.fillText('E', 280, 183);
  }

  else if (trackId === 'obstacles') {
    ctx.fillStyle = '#0c4a6e'; ctx.fillRect(0, 0, 320, 240);
    // Grid marks
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1;
    for (let x = 0; x < 320; x += 40) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,240); ctx.stroke(); }
    for (let y = 0; y < 240; y += 40) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(320,y); ctx.stroke(); }
    // Obstacles
    const obs = [
      [100,60,18,'#ef4444'],[200,80,14,'#ef4444'],[80,160,16,'#ef4444'],
      [240,160,18,'#ef4444'],[160,120,12,'#f97316'],[130,200,14,'#ef4444'],
      [260,50,10,'#f97316'],[50,100,12,'#dc2626'],[290,190,16,'#ef4444'],
    ];
    obs.forEach(([x,y,r,c]) => {
      const g = ctx.createRadialGradient(x-r*0.3,y-r*0.3,1,x,y,r);
      g.addColorStop(0,'#fca5a5'); g.addColorStop(1,c);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#7f1d1d'; ctx.lineWidth=1.5; ctx.stroke();
      ctx.fillStyle='#fff'; ctx.font='bold 9px monospace'; ctx.textAlign='center';
      ctx.fillText('!',x,y+3);
    });
    // Start
    ctx.fillStyle='#22c55e'; ctx.beginPath(); ctx.arc(30,210,10,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#fff'; ctx.font='bold 9px monospace'; ctx.textAlign='center'; ctx.fillText('S',30,213);
  }

  else if (trackId === 'city') {
    ctx.fillStyle = '#14532d'; ctx.fillRect(0, 0, 320, 240);
    // Roads (horizontal)
    const roads = [[0,80,320,40],[0,160,320,40]];
    // Roads (vertical)
    roads.push([80,0,40,240],[200,0,40,240]);
    ctx.fillStyle = '#374151';
    roads.forEach(([x,y,w,h]) => ctx.fillRect(x,y,w,h));
    // Road lines
    ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 1.5; ctx.setLineDash([10,8]);
    // horizontal centre lines
    ctx.beginPath(); ctx.moveTo(0,100); ctx.lineTo(80,100); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(120,100); ctx.lineTo(200,100); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(240,100); ctx.lineTo(320,100); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,180); ctx.lineTo(80,180); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(120,180); ctx.lineTo(200,180); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(240,180); ctx.lineTo(320,180); ctx.stroke();
    // vertical centre lines
    ctx.beginPath(); ctx.moveTo(100,0); ctx.lineTo(100,80); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(100,120); ctx.lineTo(100,160); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(100,200); ctx.lineTo(100,240); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(220,0); ctx.lineTo(220,80); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(220,120); ctx.lineTo(220,160); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(220,200); ctx.lineTo(220,240); ctx.stroke();
    ctx.setLineDash([]);
    // Buildings (blocks)
    ctx.fillStyle = '#1e3a5f';
    [[10,10,62,62],[130,10,62,62],[250,10,62,62],
     [10,130,62,22],[130,130,62,22],[250,130,62,22],
     [10,168,62,62],[130,168,62,62],[250,168,62,62]].forEach(([x,y,w,h]) => {
      ctx.fillRect(x,y,w,h);
      ctx.strokeStyle='#2563eb'; ctx.lineWidth=1; ctx.strokeRect(x,y,w,h);
      // windows
      ctx.fillStyle='#93c5fd';
      for (let wx=x+6;wx<x+w-8;wx+=10) for (let wy=y+6;wy<y+h-8;wy+=10) ctx.fillRect(wx,wy,5,5);
      ctx.fillStyle='#1e3a5f';
    });
    // Start marker
    ctx.fillStyle='#22c55e'; ctx.beginPath(); ctx.arc(160,120,8,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#fff'; ctx.font='bold 8px monospace'; ctx.textAlign='center'; ctx.fillText('S',160,123);
  }

  else if (trackId === 'ramp') {
    // Ground
    ctx.fillStyle = '#78350f'; ctx.fillRect(0, 0, 320, 240);
    // Tarmac base
    ctx.fillStyle = '#292524'; ctx.fillRect(20, 20, 280, 200);
    // Speed zones
    const zones = [[20,20,90,200,'#16a34a22'],[110,20,100,200,'#fbbf2422'],[210,20,90,200,'#dc262622']];
    zones.forEach(([x,y,w,h,c]) => { ctx.fillStyle=c; ctx.fillRect(x,y,w,h); });
    // Zone labels
    ctx.font='bold 9px monospace'; ctx.textAlign='center';
    ctx.fillStyle='#22c55e'; ctx.fillText('SLOW',65,235);
    ctx.fillStyle='#f59e0b'; ctx.fillText('MEDIUM',160,235);
    ctx.fillStyle='#ef4444'; ctx.fillText('FAST',255,235);
    // Ramps (trapezoid shapes)
    const ramps = [[50,120,70,20,'#6b7280'],[180,80,80,20,'#6b7280'],[220,160,70,20,'#6b7280']];
    ramps.forEach(([x,y,w,h,c]) => {
      ctx.fillStyle=c;
      ctx.beginPath(); ctx.moveTo(x,y+h); ctx.lineTo(x+10,y); ctx.lineTo(x+w-10,y); ctx.lineTo(x+w,y+h); ctx.closePath(); ctx.fill();
      ctx.strokeStyle='#9ca3af'; ctx.lineWidth=1; ctx.stroke();
      ctx.fillStyle='#d1d5db'; ctx.font='8px monospace'; ctx.textAlign='center'; ctx.fillText('▲',x+w/2,y+h-3);
    });
    // Speed limit signs
    [[100,30,'30'],[200,30,'60'],[300,30,'90']].forEach(([x,y,v]) => {
      ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(x,y,9,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#ef4444'; ctx.lineWidth=2; ctx.stroke();
      ctx.fillStyle='#000'; ctx.font='bold 7px monospace'; ctx.textAlign='center'; ctx.fillText(v,x,y+3);
    });
    // Kerb lines
    ctx.strokeStyle='#ffffff'; ctx.lineWidth=2; ctx.setLineDash([]);
    ctx.strokeRect(20,20,280,200);
    // Start line
    ctx.setLineDash([]);
    for (let i=0;i<5;i++) { ctx.fillStyle=i%2===0?'#fff':'#000'; ctx.fillRect(20+i*6,20,6,14); }
  }

  ctx.restore(); // undo scale(1.5, 1.5)
}

function drawTrail(ctx, trail) {
  if (trail.length < 2) return;
  ctx.beginPath(); ctx.strokeStyle = 'rgba(99,102,241,0.45)'; ctx.lineWidth = 2; ctx.setLineDash([4,4]);
  trail.forEach((p,i) => i===0 ? ctx.moveTo(p.x,p.y) : ctx.lineTo(p.x,p.y));
  ctx.stroke(); ctx.setLineDash([]);
}

/* ─── Virtual robot display ─── */
/* ease in-out cubic */
const easeInOut = t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;

/* ─── Virtual robot — smooth animation via ref API ─── */
const VirtualRobot = forwardRef(function VirtualRobot({ simRobotType, simTrack, isFullscreen }, ref) {
  const canvasRef = useRef(null);
  const posRef   = useRef({ x: 240, y: 180, angle: -90 });
  const trailRef = useRef([]);
  const stateRef = useRef({ ledOn: false, servoAngle: 90, tick: 0, moving: false, wheelAngle: 0, headlightL: null, headlightR: null });
  const animLoopRef = useRef(null);

  // Output display state (React state so panel re-renders when lights change)
  const [out, setOut] = useState({
    headlightL: null, headlightR: null,
    neopixels: Array(8).fill(null), neoCount: 8,
    displayText: '', displayIcon: null,
    ledMatrix: Array(25).fill(0),
  });
  const outRef = useRef(out);
  const updateOut = (patch) => {
    outRef.current = { ...outRef.current, ...patch };
    setOut({ ...outRef.current });
  };

  // Named colour → {r,g,b}
  const NAMED_RGB = { red:[255,0,0], green:[0,200,0], blue:[0,0,255], yellow:[255,220,0], cyan:[0,220,220], magenta:[220,0,220], white:[255,255,255], orange:[255,140,0], pink:[255,0,150], purple:[150,0,255], off:[0,0,0] };
  const namedToRgb = (n) => { const c = NAMED_RGB[(n||'').toLowerCase()] || [255,255,255]; return {r:c[0],g:c[1],b:c[2]}; };
  const rgbStr = (c) => c ? `rgb(${c.r},${c.g},${c.b})` : null;

  // Micro:bit 5×5 icon patterns (row-major, 1=on)
  const MB_ICONS = {
    HAPPY:    [0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,1,0,0,0,1,0,1,1,1,0],
    SAD:      [0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,1,1,1,0,1,0,0,0,1],
    HEART:    [0,1,0,1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,1,0,0,0,1,0,0],
    YES:      [0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0,0,0],
    NO:       [1,0,0,0,1,0,1,0,1,0,0,0,1,0,0,0,1,0,1,0,1,0,0,0,1],
    ARROW_N:  [0,0,1,0,0,0,1,1,1,0,1,0,1,0,1,0,0,1,0,0,0,0,1,0,0],
    ARROW_S:  [0,0,1,0,0,0,0,1,0,0,1,0,1,0,1,0,1,1,1,0,0,0,1,0,0],
    ARROW_E:  [0,0,1,0,0,0,0,0,1,0,1,1,1,1,1,0,0,0,1,0,0,0,1,0,0],
    ARROW_W:  [0,0,1,0,0,1,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,1,0,0],
    SURPRISED:[0,1,0,1,0,0,1,0,1,0,0,0,0,0,0,0,1,1,1,0,0,1,1,1,0],
    ANGRY:    [1,0,0,0,1,0,1,0,1,0,0,0,0,0,0,0,1,0,1,0,1,1,1,1,1],
    DIAMOND:  [0,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0,0],
    SKULL:    [0,1,1,1,0,1,0,1,0,1,1,1,1,1,1,0,1,1,1,0,0,1,1,1,0],
    ASLEEP:   [0,0,0,0,0,1,1,0,1,1,0,0,0,0,0,0,1,0,1,0,0,1,1,1,0],
    CONFUSED: [0,1,1,1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1,0,0,0],
  };

  /* pixel scale: 1cm = 4px, capped to keep robot on screen */
  const CM_TO_PX = 1;  /* 1 step = 1 pixel */
  const DEG_PER_MS = 0.18;   /* ~180°/s turn speed */
  const PX_PER_MS  = 0.18;   /* ~180px/s drive speed */

  // Resize canvas to native screen size when fullscreen
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (isFullscreen) {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    } else {
      canvas.width  = 480;
      canvas.height = 360;
    }
  }, [isFullscreen]);

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Scale everything to logical 480×360 space
    const sx = W / 480, sy = H / 360;
    ctx.save();
    ctx.scale(sx, sy);

    drawTrack(ctx, simTrack);
    if (!simTrack || simTrack === 'open') drawGrid(ctx);
    const state = stateRef.current;

    if (simRobotType === 'arm') {
      ctx.save(); ctx.translate(240, 200);
      drawArm(ctx, state);
      ctx.restore();
    } else {
      drawTrail(ctx, trailRef.current);
      const { x, y, angle } = posRef.current;
      ctx.save(); ctx.translate(x, y);
      if (simRobotType === 'humanoid') {
        const facingLeft = Math.cos(angle * Math.PI / 180) < -0.1;
        if (facingLeft) ctx.scale(-1, 1);
        drawHumanoid(ctx, state);
      } else {
        // Sprites are drawn with front facing local -Y (upward).
        // Movement uses standard math angles (0=right, -90=up).
        // Pre-rotate +90° so the sprite visually matches the movement direction.
        ctx.rotate(angle * Math.PI / 180);
        ctx.rotate(Math.PI / 2);
        if      (simRobotType === 'rover')  drawRover(ctx, state);
        else if (simRobotType === 'tank')   drawTank(ctx, state);
        else if (simRobotType === 'drone')  drawDrone(ctx, state);
        else if (simRobotType === 'spider') drawSpider(ctx, state);
        else drawRover(ctx, state);
      }
      ctx.restore();
    }
    // Hover / drag highlight ring around robot
    if (simRobotType !== 'arm') {
      const { x, y } = posRef.current;
      if (hoverRobotRef.current || draggingRobotRef.current) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.strokeStyle = draggingRobotRef.current ? '#facc15' : '#a78bfa';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([6, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
        // Small drag icon hint
        ctx.fillStyle = draggingRobotRef.current ? '#facc15cc' : '#a78bfacc';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(draggingRobotRef.current ? '✥ dragging' : '✥ drag me', x, y - 36);
        ctx.restore();
      }
    }

    ctx.restore(); // pop scale
  }, [simRobotType, simTrack, isFullscreen]);

  /* continuous tick loop — keeps animated robots alive */
  useEffect(() => {
    let id;
    const tick = () => {
      stateRef.current.tick = (stateRef.current.tick || 0) + 1;
      drawFrame();
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [drawFrame]);

  /* reset on robot type change */
  useEffect(() => {
    posRef.current = { x: 160, y: 120, angle: -90 };
    trailRef.current = [];
    stateRef.current = { ledOn: false, servoAngle: 90, tick: 0, moving: false, wheelAngle: 0 };
    updateOut({ headlightL:null, headlightR:null, neopixels:Array(8).fill(null), neoCount:8, displayText:'', displayIcon:null, ledMatrix:Array(25).fill(0) });
  }, [simRobotType]);

  /* ─── Animate a single command, return Promise that resolves when done ─── */
  const execute = useCallback((cmd) => {
    return new Promise(resolve => {
      const { id, params } = cmd;
      const p = posRef.current;
      const s = stateRef.current;

      /* non-movement commands resolve immediately */
      if (id === 'stop' || id === 'coast') { s.moving = false; resolve(); return; }
      if (id === 'wait') { setTimeout(resolve, (parseFloat(params?.secs)||1) * 1000); return; }
      if (id === 'servo' || id === 'servo_sweep') {
        const targetAngle = parseFloat(params?.angle || params?.to || 90);
        const startAngle  = s.servoAngle;
        const diff = targetAngle - startAngle;
        const dur  = Math.abs(diff) * 8 + 200;
        const t0   = performance.now();
        const go = () => {
          const prog = Math.min(1, (performance.now() - t0) / dur);
          s.servoAngle = startAngle + diff * easeInOut(prog);
          if (prog < 1) requestAnimationFrame(go); else resolve();
        };
        requestAnimationFrame(go); return;
      }

      // ── Headlights ──
      if (id === 'headlight') {
        const c = { r: +(params?.r??255), g: +(params?.g??255), b: +(params?.b??255) };
        s.headlightL = c; s.headlightR = c;
        updateOut({ headlightL: c, headlightR: c }); resolve(); return;
      }
      if (id === 'headlight_l') {
        const c = { r: +(params?.r??255), g: +(params?.g??0), b: +(params?.b??0) };
        s.headlightL = c; updateOut({ headlightL: c }); resolve(); return;
      }
      if (id === 'headlight_r') {
        const c = { r: +(params?.r??0), g: +(params?.g??0), b: +(params?.b??255) };
        s.headlightR = c; updateOut({ headlightR: c }); resolve(); return;
      }

      // ── NeoPixel ──
      if (id === 'neo_init') {
        const n = +(params?.n || 8);
        updateOut({ neoCount: n, neopixels: Array(n).fill(null) }); resolve(); return;
      }
      if (id === 'neo_color') {
        const pxs = [...outRef.current.neopixels];
        pxs[+(params?.idx||0)] = namedToRgb(params?.color);
        updateOut({ neopixels: pxs }); resolve(); return;
      }
      if (id === 'neo_rgb') {
        const pxs = [...outRef.current.neopixels];
        pxs[+(params?.idx||0)] = { r: +(params?.r||0), g: +(params?.g||0), b: +(params?.b||0) };
        updateOut({ neopixels: pxs }); resolve(); return;
      }
      if (id === 'neo_all') {
        const c = { r: +(params?.r||0), g: +(params?.g||0), b: +(params?.b||0) };
        updateOut({ neopixels: Array(outRef.current.neoCount || 8).fill(c) }); resolve(); return;
      }
      if (id === 'neo_clear') { updateOut({ neopixels: Array(outRef.current.neoCount||8).fill(null) }); resolve(); return; }
      if (id === 'neo_show' || id === 'neo_bright') { resolve(); return; }

      // ── Display / micro:bit ──
      if (id === 'disp_scroll' || id === 'show_num' || id === 'show_icon') {
        const txt = params?.text || String(params?.num ?? '') || params?.icon || '';
        updateOut({ displayText: txt, displayIcon: null, ledMatrix: Array(25).fill(0) });
        setTimeout(resolve, Math.max(600, txt.length * 120)); return;
      }
      if (id === 'disp_show') { updateOut({ displayText: String(params?.val ?? ''), displayIcon: null }); resolve(); return; }
      if (id === 'disp_image') {
        const icon = params?.icon || 'HAPPY';
        const matrix = MB_ICONS[icon] || Array(25).fill(0);
        updateOut({ displayIcon: icon, displayText: '', ledMatrix: matrix }); resolve(); return;
      }
      if (id === 'disp_pixel') {
        const mx = [...outRef.current.ledMatrix];
        mx[+(params?.y||0)*5 + +(params?.x||0)] = +(params?.bright||9);
        updateOut({ ledMatrix: mx, displayText: '', displayIcon: null }); resolve(); return;
      }
      if (id === 'disp_clear') { updateOut({ displayText:'', displayIcon:null, ledMatrix:Array(25).fill(0) }); resolve(); return; }
      if (id === 'led') { s.ledOn = (params?.color||'') !== 'off'; resolve(); return; }
      if (id === 'led_rgb') { s.ledOn = true; resolve(); return; }
      if (id === 'clear_disp') { s.ledOn = false; updateOut({ displayText:'', displayIcon:null, ledMatrix:Array(25).fill(0) }); resolve(); return; }

      /* movement commands */
      const FORWARD  = ['forward','follow_line','avoid_wall'];
      const BACKWARD = ['back'];
      const STRAFEL  = ['move_left'];
      const STRAFER  = ['move_right'];
      const TURNL    = ['left','spin_left'];
      const TURNR    = ['right','spin_right'];

      if (FORWARD.includes(id) || BACKWARD.includes(id) || STRAFEL.includes(id) || STRAFER.includes(id)) {
        const cm   = parseFloat(params?.amount || 80);
        const dist = Math.min(cm * CM_TO_PX, 400);
        const dur  = dist / PX_PER_MS;
        // Forward/back use facing angle; strafe is 90° perpendicular
        const baseRad = p.angle * Math.PI / 180;
        let moveRad, dir;
        if (STRAFEL.includes(id))      { moveRad = baseRad - Math.PI / 2; dir = 1; }
        else if (STRAFER.includes(id)) { moveRad = baseRad + Math.PI / 2; dir = 1; }
        else                           { moveRad = baseRad; dir = BACKWARD.includes(id) ? -1 : 1; }
        const rad  = moveRad;
        const startX = p.x, startY = p.y;
        const endX   = Math.max(20, Math.min(460, startX + Math.cos(rad) * dist * dir));
        const endY   = Math.max(20, Math.min(340, startY + Math.sin(rad) * dist * dir));
        trailRef.current.push({ x: startX, y: startY });
        s.moving = true;
        const t0 = performance.now();
        const go = () => {
          const prog = Math.min(1, (performance.now() - t0) / dur);
          const ease = easeInOut(prog);
          p.x = startX + (endX - startX) * ease;
          p.y = startY + (endY - startY) * ease;
          s.wheelAngle = (s.wheelAngle || 0) + dir * 8;
          if (prog < 1) { requestAnimationFrame(go); }
          else {
            p.x = endX; p.y = endY;
            s.moving = false;
            if (trailRef.current.length > 80) trailRef.current = trailRef.current.slice(-80);
            resolve();
          }
        };
        requestAnimationFrame(go);

      } else if (TURNL.includes(id) || TURNR.includes(id)) {
        const deg    = parseFloat(params?.degrees || 90);
        const dir    = TURNL.includes(id) ? -1 : 1;
        const total  = deg * dir;
        const dur    = Math.abs(deg) / DEG_PER_MS;
        const startA = p.angle;
        s.moving = true;
        const t0 = performance.now();
        const go = () => {
          const prog = Math.min(1, (performance.now() - t0) / dur);
          p.angle = startA + total * easeInOut(prog);
          s.wheelAngle = (s.wheelAngle || 0) + dir * 5;
          if (prog < 1) { requestAnimationFrame(go); }
          else { p.angle = startA + total; s.moving = false; resolve(); }
        };
        requestAnimationFrame(go);

      } else {
        resolve();
      }
    });
  }, [CM_TO_PX, PX_PER_MS, DEG_PER_MS]);

  const reset = useCallback(() => {
    posRef.current = { x: 240, y: 180, angle: -90 };
    trailRef.current = [];
    stateRef.current = { ledOn: false, servoAngle: 90, tick: 0, moving: false, wheelAngle: 0 };
    updateOut({ headlightL:null, headlightR:null, neopixels:Array(8).fill(null), neoCount:8, displayText:'', displayIcon:null, ledMatrix:Array(25).fill(0) });
  }, []);

  // Soft reset — clears trail & state, resets angle to face up, keeps x/y position
  const resetState = useCallback(() => {
    trailRef.current = [];
    stateRef.current = { ledOn: false, servoAngle: 90, tick: 0, moving: false, wheelAngle: 0 };
    posRef.current = { ...posRef.current, angle: -90 };
    updateOut({ headlightL:null, headlightR:null, neopixels:Array(8).fill(null), neoCount:8, displayText:'', displayIcon:null, ledMatrix:Array(25).fill(0) });
  }, []);

  useImperativeHandle(ref, () => ({ execute, reset, resetState }), [execute, reset, resetState]);

  // Convert a mouse event's CSS coords → logical 480×360 canvas coords
  const toLogical = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width)  * 480,
      y: ((e.clientY - rect.top)  / rect.height) * 360,
    };
  };

  const draggingRobotRef = useRef(false);
  const dragOffsetRef    = useRef({ x: 0, y: 0 });
  const hoverRobotRef    = useRef(false);

  const handleMouseDown = (e) => {
    const { x, y } = toLogical(e);
    const p = posRef.current;
    const dist = Math.hypot(x - p.x, y - p.y);
    if (dist < 36) { // hit-test radius
      draggingRobotRef.current = true;
      dragOffsetRef.current = { x: x - p.x, y: y - p.y };
      e.preventDefault();
    }
  };

  const handleMouseMove = (e) => {
    const { x, y } = toLogical(e);
    const p = posRef.current;
    hoverRobotRef.current = Math.hypot(x - p.x, y - p.y) < 36;
    if (draggingRobotRef.current) {
      posRef.current.x = Math.max(20, Math.min(460, x - dragOffsetRef.current.x));
      posRef.current.y = Math.max(20, Math.min(340, y - dragOffsetRef.current.y));
    }
    // Update cursor live
    const canvas = canvasRef.current;
    if (canvas) canvas.style.cursor = draggingRobotRef.current ? 'grabbing' : hoverRobotRef.current ? 'grab' : 'crosshair';
  };

  const handleMouseUp = () => { draggingRobotRef.current = false; };

  const hasOutput = out.headlightL || out.headlightR || out.neopixels.some(Boolean) || out.displayText || out.displayIcon || out.ledMatrix.some(Boolean);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <canvas ref={canvasRef} width={480} height={360}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          borderRadius: isFullscreen ? 0 : 10,
          background: '#080818', display: 'block',
          width: '100%', height: isFullscreen ? '100%' : 'auto',
          maxWidth: isFullscreen ? '100%' : 480,
          cursor: 'crosshair',
        }} />

      {/* ── Output Panel ── */}
      <div style={{
        background: '#0f172a', borderTop: '1px solid #1e293b',
        borderRadius: '0 0 10px 10px', padding: '10px 14px',
        display: 'flex', flexDirection: 'column', gap: 8,
        minHeight: 56,
      }}>
        {/* Headlights row — always visible */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, width: 78 }}>💡 Headlights</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {['L','R'].map((side, i) => {
              const c = i === 0 ? out.headlightL : out.headlightR;
              const col = rgbStr(c) || '#1e293b';
              const glow = c && (c.r + c.g + c.b) > 10;
              return (
                <div key={side} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%',
                    background: col,
                    boxShadow: glow ? `0 0 10px 4px ${col}` : 'none',
                    border: '1.5px solid #334155',
                    transition: 'all 0.2s',
                    }} />
                    <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700 }}>{side}</span>
                  </div>
                );
              })}
            </div>
          </div>

        {/* NeoPixel strip */}
        {out.neopixels.some(Boolean) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, width: 78 }}>🌈 NeoPixels</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {out.neopixels.map((c, i) => {
                const col = rgbStr(c) || '#1e293b';
                const glow = c && (c.r + c.g + c.b) > 10;
                return (
                  <div key={i} style={{
                    width: 18, height: 18, borderRadius: 4,
                    background: col,
                    boxShadow: glow ? `0 0 8px 3px ${col}` : 'none',
                    border: '1.5px solid #334155',
                    transition: 'all 0.2s',
                  }} />
                );
              })}
            </div>
          </div>
        )}

        {/* LED matrix (5×5) */}
        {(out.ledMatrix.some(Boolean) || out.displayText) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, width: 78 }}>📟 Display</span>
            {out.displayText ? (
              <div style={{
                background: '#1e293b', borderRadius: 6, padding: '4px 12px',
                color: '#f59e0b', fontFamily: 'monospace', fontSize: 15, fontWeight: 700,
                letterSpacing: 2, border: '1px solid #334155',
                maxWidth: 220, overflow: 'hidden', whiteSpace: 'nowrap',
                animation: out.displayText.length > 4 ? 'lh-scroll 3s linear infinite' : 'none',
              }}>
                {out.displayText}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,14px)', gap: 2 }}>
                {out.ledMatrix.map((b, i) => (
                  <div key={i} style={{
                    width: 14, height: 14, borderRadius: 3,
                    background: b > 0 ? `rgba(251,191,36,${b/9})` : '#1e293b',
                    boxShadow: b > 0 ? `0 0 6px 2px rgba(251,191,36,${b/12})` : 'none',
                    transition: 'all 0.15s',
                  }} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Idle state */}
        {!hasOutput && (
          <div style={{ fontSize: 11, color: '#334155', fontStyle: 'italic', textAlign: 'center', paddingBottom: 2 }}>
            Run a Lights or Outputs block to see it here
          </div>
        )}
      </div>
    </div>
  );
});

/* ─── Generate a complete MicroPython program from block list ─── */
function generateFullProgram(blocks, kit) {
  const kitLines = {
    generic: [
      'def fw(ms): pin0.write_digital(1);pin1.write_digital(0);pin2.write_digital(1);pin3.write_digital(1);sleep(ms);pin0.write_digital(0);pin2.write_digital(0)',
      'def bk(ms): pin0.write_digital(0);pin1.write_digital(1);pin2.write_digital(0);pin3.write_digital(1);sleep(ms);pin0.write_digital(0);pin2.write_digital(0)',
      'def lt(ms): pin0.write_digital(0);pin1.write_digital(1);pin2.write_digital(1);pin3.write_digital(0);sleep(ms);pin0.write_digital(0);pin2.write_digital(0)',
      'def rt(ms): pin0.write_digital(1);pin1.write_digital(0);pin2.write_digital(0);pin3.write_digital(1);sleep(ms);pin0.write_digital(0);pin2.write_digital(0)',
      'def sp(): pin0.write_digital(0);pin2.write_digital(0)',
    ],
    bitbot: [
      'def fw(ms): pin0.write_analog(700);pin8.write_digital(0);pin1.write_analog(700);pin12.write_digital(0);sleep(ms);pin0.write_digital(0);pin1.write_digital(0)',
      'def bk(ms): pin0.write_analog(700);pin8.write_digital(1);pin1.write_analog(700);pin12.write_digital(1);sleep(ms);pin0.write_digital(0);pin1.write_digital(0)',
      'def lt(ms): pin0.write_analog(700);pin8.write_digital(1);pin1.write_analog(700);pin12.write_digital(0);sleep(ms);pin0.write_digital(0);pin1.write_digital(0)',
      'def rt(ms): pin0.write_analog(700);pin8.write_digital(0);pin1.write_analog(700);pin12.write_digital(1);sleep(ms);pin0.write_digital(0);pin1.write_digital(0)',
      'def sp(): pin0.write_digital(0);pin1.write_digital(0)',
    ],
    maqueen: [
      'def _m(r,d,s): i2c.write(0x10,bytes([r,d,s]))',
      'def sp(): _m(0,0,0);_m(2,0,0)',
      'def fw(ms): _m(0,0,200);_m(2,0,200);sleep(ms);sp()',
      'def bk(ms): _m(0,1,200);_m(2,1,200);sleep(ms);sp()',
      'def lt(ms): _m(0,1,150);_m(2,0,200);sleep(ms);sp()',
      'def rt(ms): _m(0,0,200);_m(2,1,150);sleep(ms);sp()',
      'def ls(): i2c.write(0x10,bytes([0x1D]));d=i2c.read(0x10,1);return (d[0]>>1)&1,d[0]&1',
    ],
    move: [
      'i2c.write(0x62,bytes([0x00,0x00]))',
      'i2c.write(0x62,bytes([0x01,0x0D]))',
      'i2c.write(0x62,bytes([0x08,0xAA]))',
      'def _pw(a,b,c,d): i2c.write(0x62,bytes([0xA2,a,b,c,d]))',
      'def sp(): _pw(0,0,0,0)',
      'def fw(ms): _pw(150,0,150,0);sleep(ms);sp()',
      'def bk(ms): _pw(0,150,0,150);sleep(ms);sp()',
      'def lt(ms): _pw(0,120,150,0);sleep(ms);sp()',
      'def rt(ms): _pw(150,0,0,120);sleep(ms);sp()',
    ],
    cutebot: [
      // micro:bit v2 defaults to 400kHz I2C; Cutebot STM8 needs 100kHz
      'i2c.init(freq=100000,sda=pin20,scl=pin19)',
      // Reuse a single bytearray to avoid heap churn in forever loops
      '_B=bytearray(4)',
      'def _cb4(r,a,b,c):\n try:\n  _B[0]=r;_B[1]=a;_B[2]=b;_B[3]=c\n  i2c.write(0x10,_B)\n except: pass',
      'def sp():\n _cb4(0x01,2,0,0)\n sleep(50)\n _cb4(0x02,2,0,0)',
      'def fw(ms):\n _cb4(0x01,2,80,0)\n sleep(50)\n _cb4(0x02,2,80,0)\n sleep(ms)\n sp()',
      'def bk(ms):\n _cb4(0x01,1,80,0)\n sleep(50)\n _cb4(0x02,1,80,0)\n sleep(ms)\n sp()',
      'def lt(ms):\n _cb4(0x01,1,60,0)\n sleep(50)\n _cb4(0x02,2,60,0)\n sleep(ms)\n sp()',
      'def rt(ms):\n _cb4(0x01,2,60,0)\n sleep(50)\n _cb4(0x02,1,60,0)\n sleep(ms)\n sp()',
      // Headlights: reg 0x04=left, 0x08=right (NOT 0x05), format [reg, R, G, B]
      'def hl(r,g,b):\n _cb4(0x04,r,g,b)\n sleep(10)\n _cb4(0x08,r,g,b)',
      'def hl_l(r,g,b): _cb4(0x04,r,g,b)',
      'def hl_r(r,g,b): _cb4(0x08,r,g,b)',
      'def sonar():\n pin1.write_digital(0);pin1.write_digital(1);pin1.write_digital(0)\n t=running_time()\n while pin2.read_digital()==0:\n  if running_time()-t>50:return 400\n t=running_time()\n while pin2.read_digital()==1:\n  if running_time()-t>50:return 400\n return (running_time()-t)*17',
      'def ls(): return pin14.read_digital(),pin13.read_digital()',
    ],
    cutebotpro: [
      'def _cbp(ld,ls,rd,rs): i2c.write(0x10,bytes([0x01,ld,ls,rd,rs]))',
      'def _cb4(r,a,b,c): i2c.write(0x10,bytes([r,a,b,c]))',
      'def sp(): _cbp(0,0,0,0)',
      'def fw(ms): _cbp(0x01,80,0x01,80);sleep(ms);sp()',
      'def bk(ms): _cbp(0x02,80,0x02,80);sleep(ms);sp()',
      'def lt(ms): _cbp(0x02,60,0x01,60);sleep(ms);sp()',
      'def rt(ms): _cbp(0x01,60,0x02,60);sleep(ms);sp()',
      'def hl(r,g,b): _cb4(0x04,r,g,b);_cb4(0x05,r,g,b)',
    ],
    maqueenplus: [
      'def _m(r,d,s): i2c.write(0x10,bytes([r,d,s]))',
      'def sp(): _m(0,0,0);_m(2,0,0)',
      'def fw(ms): _m(0,0,200);_m(2,0,200);sleep(ms);sp()',
      'def bk(ms): _m(0,1,200);_m(2,1,200);sleep(ms);sp()',
      'def lt(ms): _m(0,1,150);_m(2,0,200);sleep(ms);sp()',
      'def rt(ms): _m(0,0,200);_m(2,1,150);sleep(ms);sp()',
      'def ls(): i2c.write(0x10,bytes([0x1D]));d=i2c.read(0x10,1);return (d[0]>>1)&1,d[0]&1',
      'def hl(r,g,b): i2c.write(0x10,bytes([0x0B,r,g,b]));i2c.write(0x10,bytes([0x0F,r,g,b]))',
    ],
    ringbitcar: [
      'pin1.set_analog_period(20);pin2.set_analog_period(20)',
      'def sp(): pin1.write_analog(75);pin2.write_analog(75)',
      'def fw(ms): pin1.write_analog(30);pin2.write_analog(120);sleep(ms);sp()',
      'def bk(ms): pin1.write_analog(120);pin2.write_analog(30);sleep(ms);sp()',
      'def lt(ms): pin1.write_analog(75);pin2.write_analog(120);sleep(ms);sp()',
      'def rt(ms): pin1.write_analog(30);pin2.write_analog(75);sleep(ms);sp()',
    ],
  };

  const profile = ROBOT_PROFILES.microbit;
  const ordered = [...blocks].sort((a, b) => a.y - b.y);
  let indent = 0;
  const bodyLines = [];
  const needsRandom = blocks.some(b => b.id === 'math_random');
  const needsRadio  = blocks.some(b => ['radio_send', 'radio_group', 'radio_recv', 'send_msg'].includes(b.id));
  const needsNeo    = blocks.some(b => b.id.startsWith('neo_'));

  // Blocks that open an indented body
  const INDENT_OPENERS = new Set([
    'repeat', 'forever', 'while_do', 'for_range',
    'if_then', 'if_temp', 'if_compass',
    'if_dist', 'if_line', 'if_btn_a', 'if_btn_b',
    'if_touch', 'if_shake', 'if_tilt', 'if_light',
  ]);

  for (const block of ordered) {
    // Strip trailing \r\n (and optional indent spaces) from the raw command string
    const raw = profile.buildCmd(block.id, block.params)
      .replace(/\r\n\s*$/, '')
      .replace(/\n\s*$/, '');

    // Visual marker — no code
    if (block.id === 'on_start') { bodyLines.push(''); bodyLines.push('# --- on start ---'); continue; }

    // End blocks: emit pass at CURRENT (inner) indent FIRST, then decrement
    if (['repeat_end', 'if_end', 'while_end', 'for_end'].includes(block.id)) {
      bodyLines.push(' '.repeat(indent) + 'pass');
      indent = Math.max(0, indent - 4);
      continue;
    }

    // Else / elif: guard previous body with pass, close it, emit else/elif, reopen
    if (block.id === 'else_branch') {
      bodyLines.push(' '.repeat(indent) + 'pass');
      indent = Math.max(0, indent - 4);
      bodyLines.push(' '.repeat(indent) + 'else:');
      indent += 4;
      continue;
    }
    if (block.id === 'else_if') {
      const op = block.params?.op === '=' ? '==' : (block.params?.op || '<');
      bodyLines.push(' '.repeat(indent) + 'pass');
      indent = Math.max(0, indent - 4);
      bodyLines.push(' '.repeat(indent) + `elif ${block.params?.cond||'x'} ${op} ${block.params?.val||0}:`);
      indent += 4;
      continue;
    }

    if (!raw) continue;
    bodyLines.push(' '.repeat(indent) + raw);

    if (INDENT_OPENERS.has(block.id)) indent += 4;
  }

  const setup = kitLines[kit] || kitLines.generic;
  return [
    'from microbit import *',
    ...(needsRandom ? ['import random'] : []),
    ...(needsRadio  ? ['import radio', 'radio.on()'] : []),
    ...(needsNeo    ? ['from neopixel import NeoPixel'] : []),
    '',
    '# Robot helpers',
    ...setup,
    '',
    'display.show(Image.HAPPY)',
    'sleep(500)',
    '',
    '# Your program',
    ...bodyLines,
  ].join('\n') + '\n';
}

/* ─── Main RobotPanel component ─── */
export default function RobotPanel() {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [portInfo, setPortInfo] = useState(null);
  const [robotType, setRobotType] = useState('microbit');
  const [microbitKit, setMicrobitKit] = useState(() => localStorage.getItem('cv_mb_kit') || 'generic');
  const [program, setProgram] = useState(() => {
    try { const s = localStorage.getItem('cv_robotlab_program'); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [terminal, setTerminal] = useState([]);
  const [running, setRunning] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  // Auto-open setup guide for robots that need a sketch upload
  React.useEffect(() => {
    if (robotType === 'mbot' || robotType === 'arduino') setShowSetup(true);
  }, [robotType]);
  const [flashProgress, setFlashProgress] = useState(null); // null=idle, 0-100+=flashing, 'done'=complete
  const [firmwareOk, setFirmwareOk] = useState(null); // null=unknown, true=microPython, false=makecode
  const [showCode, setShowCode] = useState(false);
  const [ledColor, setLedColor] = useState('off');
  const [editingIdx, setEditingIdx] = useState(null);
  const [simRobotType, setSimRobotType] = useState(() => localStorage.getItem('cv_robotlab_robottype') || 'rover');
  const [simTrack, setSimTrack] = useState(() => localStorage.getItem('cv_robotlab_track') || 'open');
  const [simFs, setSimFs] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [activeBlockUid, setActiveBlockUid] = useState(null);

  const portRef = useRef(null);
  const robotRef = useRef(null);
  const simFsRef = useRef(null);
  const writerRef = useRef(null);
  const readerRef = useRef(null);
  const terminalRef = useRef(null);
  const connectedRef = useRef(false);
  const firmwareOkRef = useRef(null); // mirrors firmwareOk state for use inside async closures
  const rawReplDoneRef = useRef(null); // resolves when micro:bit raw REPL sends \x04\x04 completion
  const serialSniffRef = useRef(null); // { pattern, resolve } — used for firmware detection
  const bridgeModeRef  = useRef(false); // true when USB is connected to pxt bridge firmware (not MicroPython)

  // BLE (Bluetooth) — Nordic UART Service for wireless micro:bit connection
  // NUS standard: 6e400002 = TX of microbit (NOTIFY → browser reads)
  //               6e400003 = RX of microbit (WRITE  → browser sends)
  const BLE_NUS_SERVICE = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
  const BLE_NUS_TX      = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'; // micro:bit RECEIVES (RX) — browser writes to this
  const BLE_NUS_RX      = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'; // micro:bit TRANSMITS (TX) — browser subscribes to this (NOTIFY)
  const btDeviceRef     = useRef(null);
  const btTxCharRef     = useRef(null);
  const connectionTypeRef = useRef(null); // 'usb' | 'bluetooth'
  const bleBufferRef    = useRef('');

  const profile = ROBOT_PROFILES[robotType];

  useEffect(() => {
    const handler = () => setSimFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const toggleSimFs = () => {
    if (!simFs) simFsRef.current?.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  const addTerminal = useCallback((msg, type = 'info') => {
    setTerminal(prev => [...prev.slice(-80), { msg, type, time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) }]);
    setTimeout(() => { terminalRef.current?.scrollTo(0, 99999); }, 50);
  }, []);

  /* ─── Web Serial connect ─── */
  // Process incoming BLE data — same buffer logic as the USB readLoop
  const handleBleData = useCallback((event) => {
    const chunk = new TextDecoder().decode(event.target.value);
    bleBufferRef.current += chunk;
    let buffer = bleBufferRef.current;
    if (serialSniffRef.current && buffer.includes(serialSniffRef.current.pattern)) {
      const resolve = serialSniffRef.current.resolve;
      serialSniffRef.current = null;
      resolve(true);
    }
    {
      let cnt = 0, pos = -1;
      for (let i = 0; i < buffer.length; i++) {
        if (buffer[i] === '\x04') { cnt++; if (cnt === 2) { pos = i; break; } }
      }
      if (pos >= 0) {
        if (rawReplDoneRef.current) {
          buffer.slice(0, pos).split('\n').forEach(line => {
            const clean = line.replace(/[\x00-\x09\x0b-\x1f\x7f-\x9f]/g, '').trim();
            if (clean && !clean.includes('\x04')) addTerminal(`← ${clean}`, 'recv');
          });
          rawReplDoneRef.current();
          rawReplDoneRef.current = null;
        }
        buffer = buffer.slice(pos + 1);
      }
    }
    const lines = buffer.split('\n');
    buffer = lines.pop();
    lines.forEach(line => {
      const clean = line.replace(/[\x00-\x09\x0b-\x1f\x7f-\x9f]/g, '').trim();
      if (clean && !clean.includes('\x04')) addTerminal(`← ${clean}`, 'recv');
    });
    bleBufferRef.current = buffer;
  }, [addTerminal]);

  const connectBluetooth = async () => {
    if (!navigator.bluetooth) {
      addTerminal('⚠️ Web Bluetooth not supported. Use Chrome or Edge.', 'error');
      return;
    }
    setConnecting(true);
    try {
      addTerminal('📡 Step 1/6: Opening device picker — select your micro:bit…', 'info');
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { name: 'ByteBuddies' },
          { namePrefix: 'BBC micro:bit' },
        ],
        optionalServices: [BLE_NUS_SERVICE],
      });
      addTerminal(`✅ Step 1/6: Device selected — "${device.name}"`, 'success');

      btDeviceRef.current = device;
      device.addEventListener('gattserverdisconnected', () => {
        btTxCharRef.current = null;
        btDeviceRef.current = null;
        connectionTypeRef.current = null;
        connectedRef.current = false;
        firmwareOkRef.current = null;
        setConnected(false);
        setFirmwareOk(null);
        addTerminal('🔌 Bluetooth disconnected', 'info');
      });

      addTerminal('📡 Step 2/6: Connecting to GATT server…', 'info');
      const server = await device.gatt.connect();
      addTerminal('✅ Step 2/6: GATT connected', 'success');

      // Windows needs extra time to complete GATT service discovery
      await new Promise(r => setTimeout(r, 1500));

      addTerminal('📡 Step 3/6: Scanning all services on device…', 'info');
      let service = null;

      // Step A: enumerate ALL services first — this triggers full GATT discovery
      // and fixes the Windows Chrome stale-cache bug
      try {
        const allServices = await server.getPrimaryServices();
        if (allServices.length === 0) {
          addTerminal('  ⚠️ Device has 0 services — MakeCode BLE program may not be running', 'warn');
        } else {
          allServices.forEach(s => addTerminal(`  found service: ${s.uuid}`, 'info'));
          service = allServices.find(s => s.uuid.toLowerCase() === BLE_NUS_SERVICE.toLowerCase()) || null;
        }
      } catch (e) {
        addTerminal(`  getPrimaryServices() failed: ${e.message}`, 'warn');
      }

      // Step B: fallback — try direct UUID lookup (sometimes works after Step A)
      if (!service) {
        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            service = await server.getPrimaryService(BLE_NUS_SERVICE);
            break;
          } catch (e) {
            addTerminal(`  direct lookup attempt ${attempt}/3: ${e.message}`, 'info');
            if (attempt < 3) await new Promise(r => setTimeout(r, 800));
          }
        }
      }

      if (!service) {
        addTerminal('❌ Step 3/6 FAILED: UART service not found on this device.', 'error');
        addTerminal('🔧 Check: did you follow ALL steps in Setup Guide → Bluetooth?', 'warn');
        addTerminal('   • Project Settings → Bluetooth → "No Pairing Required" ticked?', 'info');
        addTerminal('   • bluetooth extension added in MakeCode?', 'info');
        addTerminal('   • Did you flash the ByteBuddies hex? (click ⚡ Flash BLE Firmware via USB)', 'info');
        try { server.disconnect(); } catch (_) {}
        return;
      }
      addTerminal('✅ Step 3/6: UART service found', 'success');

      addTerminal('📡 Step 4/6: Discovering characteristics…', 'info');
      let txChar, rxChar;
      try {
        const allChars = await service.getCharacteristics();
        allChars.forEach(c => addTerminal(`  char ${c.uuid} props: ${Object.keys(c.properties).filter(k => c.properties[k]).join(',')}`, 'info'));
        // Try property-based detection first
        rxChar = allChars.find(c => c.properties.notify || c.properties.indicate);
        txChar = allChars.find(c => c.properties.writeWithoutResponse || c.properties.write);
        // Fallback: Windows/Chrome BLE cache bug returns empty properties — use NUS UUIDs directly
        // NUS standard: 6e400003 = micro:bit TX (NOTIFY), 6e400002 = micro:bit RX (WRITE)
        if (!rxChar) rxChar = allChars.find(c => c.uuid.toLowerCase().includes('6e400003'))
                           || await service.getCharacteristic(BLE_NUS_RX);
        if (!txChar) txChar = allChars.find(c => c.uuid.toLowerCase().includes('6e400002'))
                           || await service.getCharacteristic(BLE_NUS_TX);
        if (!rxChar || !txChar) throw new Error(`Missing NUS characteristics`);
        addTerminal(`✅ Step 4/6: notify=${rxChar.uuid.slice(4,8)} write=${txChar.uuid.slice(4,8)}`, 'success');
      } catch (e) {
        addTerminal(`❌ Step 4/6 FAILED: ${e.message}`, 'error');
        try { server.disconnect(); } catch (_) {}
        return;
      }

      addTerminal('📡 Step 5/6: Starting notifications…', 'info');
      try {
        await rxChar.startNotifications();
        rxChar.addEventListener('characteristicvaluechanged', handleBleData);
        addTerminal('✅ Step 5/6: Notifications active', 'success');
      } catch (e) {
        addTerminal(`❌ Step 5/6 FAILED: ${e.message}`, 'error');
        try { server.disconnect(); } catch (_) {}
        return;
      }

      btTxCharRef.current = txChar;
      connectionTypeRef.current = 'bluetooth';
      connectedRef.current = true;
      setConnected(true);

      addTerminal('📡 Step 6/6: Testing firmware (exec support)…', 'info');
      const enc = new TextEncoder();
      const bleWrite = async (data) => {
        const bytes = typeof data === 'string' ? enc.encode(data) : data;
        for (let i = 0; i < bytes.length; i += 20) {
          try { await txChar.writeValueWithoutResponse(bytes.slice(i, i + 20)); }
          catch (wErr) {
            try { await txChar.writeValue(bytes.slice(i, i + 20)); }
            catch (e) { addTerminal(`  write error: ${e.message}`, 'warn'); }
          }
          if (i + 20 < bytes.length) await new Promise(r => setTimeout(r, 30));
        }
      };
      await new Promise(r => setTimeout(r, 600));
      bleBufferRef.current = '';
      rawReplDoneRef.current = null;

      // Test 1: Basic command execution
      const testDone = new Promise(resolve => {
        rawReplDoneRef.current = () => { rawReplDoneRef.current = null; resolve(true); };
        setTimeout(() => { if (rawReplDoneRef.current) { rawReplDoneRef.current = null; resolve(false); } }, 6000);
      });
      await bleWrite('display.show(Image.HAPPY)\n');
      const testOk = await testDone;

      if (!testOk) {
        addTerminal('⚠️ Step 6/6: Firmware did not respond to test command.', 'warn');
        addTerminal('Try one of these:', 'warn');
        addTerminal('  1. Press ▶ Run (might still work)', 'info');
        addTerminal('  2. Check setup guide: CUTEBOT_BLUETOOTH_SETUP.md', 'info');
        addTerminal('  3. Flash bytebuddies_cutebot_bluetooth.py via python.microbit.org', 'info');
        setFirmwareOk(true); firmwareOkRef.current = true;
      } else {
        addTerminal('✅ Step 6/6: Firmware responding correctly!', 'success');
        // Optional: Test I2C availability if Cutebot
        if (microbitKit === 'cutebot') {
          addTerminal('💡 Tip: If motors click instead of moving, recompile & flash bytebuddies_cutebot_bluetooth.py', 'info');
        }
        setFirmwareOk(true); firmwareOkRef.current = true;
      }
      addTerminal(`🤖 Bluetooth connected! Press ▶ Run to send your program.`, 'success');

    } catch (e) {
      if (e.name !== 'NotFoundError') addTerminal(`❌ ${e.message}`, 'error');
    } finally {
      setConnecting(false);
    }
  };

  const connect = async () => {
    if (!navigator.serial) {
      addTerminal('⚠️ Web Serial not supported. Use Chrome or Edge browser.', 'error');
      return;
    }
    setConnecting(true);
    try {
      const port = await navigator.serial.requestPort();
      // If port is already open (leftover from a previous session), close it first
      if (port.readable) {
        try {
          port.readable.cancel?.();
          port.writable.abort?.();
          await port.close();
        } catch (_) {}
        await new Promise(r => setTimeout(r, 200));
      }
      await port.open({ baudRate: profile.baud });
      portRef.current = port;

      // Set up writer
      writerRef.current = port.writable.getWriter();

      // Set up reader in background
      const readLoop = async () => {
        const reader = port.readable.getReader();
        readerRef.current = reader;
        const decoder = new TextDecoder();
        let buffer = '';
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            buffer += chunk;
            // Sniff for expected strings (used for firmware detection)
            if (serialSniffRef.current && buffer.includes(serialSniffRef.current.pattern)) {
              const resolve = serialSniffRef.current.resolve;
              serialSniffRef.current = null;
              resolve(true);
            }
            // Detect raw REPL completion: exactly 2 \x04 bytes (stdout\x04 + stderr\x04)
            // They may NOT be consecutive when there's an error traceback in stderr
            // ALWAYS consume \x04\x04 from buffer to prevent stale bytes causing premature completion
            {
              let cnt = 0, pos = -1;
              for (let i = 0; i < buffer.length; i++) {
                if (buffer[i] === '\x04') { cnt++; if (cnt === 2) { pos = i; break; } }
              }
              if (pos >= 0) {
                if (rawReplDoneRef.current) {
                  // Display any print() output that arrived in same chunk as the completion markers
                  buffer.slice(0, pos).split('\n').forEach(line => {
                    const clean = line.replace(/[\x00-\x09\x0b-\x1f\x7f-\x9f]/g, '').trim();
                    if (clean && !clean.includes('\x04')) addTerminal(`← ${clean}`, 'recv');
                  });
                  rawReplDoneRef.current();
                  rawReplDoneRef.current = null;
                }
                // Always consume the \x04\x04 bytes even if no one is waiting
                buffer = buffer.slice(pos + 1);
              }
            }
            // Display printable lines in terminal (data that arrived before completion)
            const lines = buffer.split('\n');
            buffer = lines.pop();
            lines.forEach(line => {
              const clean = line.replace(/[\x00-\x09\x0b-\x1f\x7f-\x9f]/g, '').trim();
              if (clean && !clean.includes('\x04')) addTerminal(`← ${clean}`, 'recv');
            });
          }
        } catch (e) {
          // port closed
        } finally {
          reader.releaseLock();
        }
      };
      readLoop();

      const info = port.getInfo();
      setPortInfo(info);
      connectionTypeRef.current = 'usb';
      connectedRef.current = true;
      setConnected(true);

      // For micro:bit: detect firmware then set up raw REPL if MicroPython is present
      if (robotType === 'microbit') {
        const enc = new TextEncoder();
        const writeChunked = async (data) => {
          const bytes = typeof data === 'string' ? enc.encode(data) : data;
          for (let i = 0; i < bytes.length; i += 32) {
            await writerRef.current.ready;
            await writerRef.current.write(bytes.slice(i, i + 32));
            if (i + 32 < bytes.length) await new Promise(r => setTimeout(r, 15));
          }
        };
        const waitFor = (pattern, ms = 2000) => new Promise(resolve => {
          serialSniffRef.current = { pattern, resolve };
          setTimeout(() => {
            if (serialSniffRef.current?.pattern === pattern) {
              serialSniffRef.current = null;
              resolve(false);
            }
          }, ms);
        });

        try {
          // Force exit any existing raw REPL first (Ctrl+B → interactive mode)
          // Without this, if already in raw REPL, \x01 produces no banner → detection fails
          await writeChunked('\x02');
          await new Promise(r => setTimeout(r, 300));

          // Exact pyboard.py sequence — up to 3 attempts
          let gotRepl = false;
          for (let attempt = 0; attempt < 3 && !gotRepl; attempt++) {
            if (attempt > 0) await new Promise(r => setTimeout(r, 500));
            await writeChunked('\x03\x03');          // interrupt (both bytes at once)
            await new Promise(r => setTimeout(r, 100)); // 100ms — same as pyboard.py
            const p = waitFor('raw REPL', 2000);    // register listener BEFORE sending \x01
            await writeChunked('\x01');              // enter raw REPL
            gotRepl = await p;
          }

          if (!gotRepl) {
            // No MicroPython REPL — check if it's the ByteBuddies bridge firmware (pxt)
            // Bridge responds to ping()\n with \x04\x04
            rawReplDoneRef.current = null;
            const bridgeProbed = new Promise(resolve => {
              rawReplDoneRef.current = () => { rawReplDoneRef.current = null; resolve(true); };
              setTimeout(() => { if (rawReplDoneRef.current) { rawReplDoneRef.current = null; resolve(false); } }, 3000);
            });
            await writeChunked('ping()\n');
            const isBridge = await bridgeProbed;

            if (isBridge) {
              bridgeModeRef.current = true;
              setFirmwareOk(true); firmwareOkRef.current = true;
              addTerminal('✅ ByteBuddies Bridge firmware detected!', 'success');
              addTerminal('🤖 USB + Bluetooth in one hex. Press ▶ Run!', 'success');
            } else {
              setFirmwareOk(false);
              firmwareOkRef.current = false;
              addTerminal('⚠️ Unknown firmware. Flash the ByteBuddies hex first:', 'warn');
              addTerminal('1️⃣ Click ⚡ Flash BLE Firmware via USB (or download .hex)', 'info');
              addTerminal('2️⃣ After flashing: disconnect USB → re-plug → reconnect here', 'info');
              return;
            }
          }

          setFirmwareOk(true);
          firmwareOkRef.current = true;
          addTerminal('✅ MicroPython detected', 'success');

          // Step 3: send kit setup lines one by one via raw REPL
          // Raw REPL format: send code then \x04 (Ctrl+D) to execute; wait for \x04\x04 response
          const lines = MICROBIT_KIT_SETUPS[microbitKit] || MICROBIT_KIT_SETUPS.generic;
          for (const line of lines) {
            const done = new Promise(resolve => {
              rawReplDoneRef.current = resolve;
              setTimeout(resolve, 3000);
            });
            await writeChunked(line + '\x04');
            await done;
          }
          localStorage.setItem('cv_mb_kit', microbitKit);
          addTerminal(`🔬 micro:bit ready — ${microbitKit} kit loaded. Press ▶ Run to go!`, 'success');
        } catch (e) {
          addTerminal(`⚠️ Setup error: ${e.message}`, 'warn');
        }
      }

      addTerminal(`✅ Connected! (${profile.name})`, 'success');
      if (robotType === 'microbit') addTerminal('💡 Press ▶ Run to send your program — no need to re-flash each time!', 'info');
    } catch (e) {
      if (e.name !== 'NotFoundError') addTerminal(`❌ ${e.message}`, 'error');
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = async () => {
    if (connectionTypeRef.current === 'bluetooth') {
      try { btDeviceRef.current?.gatt?.disconnect(); } catch (_) {}
      btTxCharRef.current = null;
      btDeviceRef.current = null;
    } else {
      try {
        writerRef.current?.releaseLock();
        readerRef.current?.cancel();
        await portRef.current?.close();
      } catch (_) {}
      portRef.current = null;
      writerRef.current = null;
      readerRef.current = null;
    }
    connectionTypeRef.current = null;
    connectedRef.current = false;
    firmwareOkRef.current = null;
    bridgeModeRef.current = false;
    setConnected(false);
    setFirmwareOk(null);
    setPortInfo(null);
    addTerminal('🔌 Disconnected', 'info');
  };

  /* ─── Send data in chunks to avoid 64-byte UART buffer overflow ─── */
  const writeChunked = useCallback(async (data) => {
    const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
    if (connectionTypeRef.current === 'bluetooth') {
      if (!btTxCharRef.current) return;
      for (let i = 0; i < bytes.length; i += 20) {
        try { await btTxCharRef.current.writeValueWithoutResponse(bytes.slice(i, i + 20)); }
        catch (_) {
          try { await btTxCharRef.current.writeValue(bytes.slice(i, i + 20)); }
          catch (e) { addTerminal(`BLE write error: ${e.message}`, 'warn'); break; }
        }
        if (i + 20 < bytes.length) await new Promise(r => setTimeout(r, 20));
      }
    } else {
      if (!writerRef.current) return;
      for (let i = 0; i < bytes.length; i += 32) {
        await writerRef.current.ready;
        await writerRef.current.write(bytes.slice(i, i + 32));
        if (i + 32 < bytes.length) await new Promise(r => setTimeout(r, 15));
      }
    }
  }, []);

  /* ─── Send command via micro:bit raw REPL, wait for \x04\x04 completion ─── */
  const sendMicrobitRaw = useCallback(async (code) => {
    if (!writerRef.current && !btTxCharRef.current) return false;
    try {
      const trimmed = code.trim();
      if (!trimmed) return true;
      const done = new Promise((resolve, reject) => {
        rawReplDoneRef.current = resolve;
        setTimeout(() => { rawReplDoneRef.current = null; reject(new Error('timeout')); }, 25000);
      });
      const term = (connectionTypeRef.current === 'bluetooth' || bridgeModeRef.current) ? '\n' : '\x04';
      await writeChunked(trimmed + term);
      await done;
      addTerminal(`→ ${trimmed}`, 'send');
      return true;
    } catch (e) {
      addTerminal(`❌ Send error: ${e.message}`, 'error');
      return false;
    }
  }, [writeChunked, addTerminal]);

  /* ─── Send raw command ─── */
  const sendRaw = async (text) => {
    if (!writerRef.current) return false;
    try {
      await writerRef.current.ready; // wait for serial buffer to have capacity
      const encoder = new TextEncoder();
      await writerRef.current.write(encoder.encode(text));
      addTerminal(`→ ${text.trim()}`, 'send');
      return true;
    } catch (e) {
      addTerminal(`❌ Send error: ${e.message}`, 'error');
      return false;
    }
  };

  /* ─── Run program ─── */
  const runningRef = useRef(false);
  // Execute a sorted block list.
  // Rule: when a "loop-repeat" or "loop-forever" block is encountered,
  //       ALL blocks that follow it (by y-position) become its body.
  //       Blocks BEFORE it run once first.
  //       For nested loops, the same rule applies recursively within the body.
  const executeBlocks = async (blocks, simOnly = false) => {
    let i = 0;
    while (i < blocks.length) {
      if (!runningRef.current) return;
      const step = blocks[i];

      if (step.id === 'repeat' || step.id === 'forever') {
        const times = step.id === 'forever' ? Infinity : (parseInt(step.params?.times) || 1);
        // Find matching repeat_end, or use everything after as body
        const endIdx = blocks.findIndex((b, j) => j > i && b.id === 'repeat_end');
        const body = endIdx === -1 ? blocks.slice(i + 1) : blocks.slice(i + 1, endIdx);
        for (let t = 0; t < times; t++) {
          if (!runningRef.current) break;
          await executeBlocks(body);
        }
        // Skip past the end block if present
        i = endIdx === -1 ? blocks.length : endIdx + 1;
        continue;
      }
      if (step.id === 'repeat_end') { i++; continue; } // standalone end block, skip

      if (step.id === 'for_range') {
        const endIdx = blocks.findIndex((b, j) => j > i && b.id === 'for_end');
        const body = endIdx === -1 ? blocks.slice(i + 1) : blocks.slice(i + 1, endIdx);
        const from = parseInt(step.params?.from) || 0;
        const to = parseInt(step.params?.to) || 5;
        for (let t = from; t <= to; t++) {
          if (!runningRef.current) break;
          await executeBlocks(body);
        }
        i = endIdx === -1 ? blocks.length : endIdx + 1;
        continue;
      }
      if (step.id === 'for_end') { i++; continue; }

      if (step.id === 'while_do') {
        // In sim mode we run up to 50 iterations (no real variable evaluation)
        const endIdx = blocks.findIndex((b, j) => j > i && b.id === 'while_end');
        const body = endIdx === -1 ? blocks.slice(i + 1) : blocks.slice(i + 1, endIdx);
        let guard = 0;
        while (guard++ < 50 && runningRef.current) await executeBlocks(body);
        i = endIdx === -1 ? blocks.length : endIdx + 1;
        continue;
      }
      if (step.id === 'while_end') { i++; continue; }

      // Handle if-type blocks: in simulation always run the "true" body
      // (we can't read real sensor values, so we simulate condition = true)
      const IF_BLOCKS = ['if_then', 'if_dist', 'if_line', 'if_btn_a', 'if_btn_b',
                         'if_touch', 'if_shake', 'if_tilt', 'if_light', 'if_temp', 'if_compass'];
      if (IF_BLOCKS.includes(step.id)) {
        const endIdx = blocks.findIndex((b, j) => j > i && b.id === 'if_end');
        const allBody = endIdx === -1 ? blocks.slice(i + 1) : blocks.slice(i + 1, endIdx);
        // Only run up to else_branch/else_if (the "true" body)
        const elseIdx = allBody.findIndex(b => ['else_branch', 'else_if'].includes(b.id));
        const trueBody = elseIdx === -1 ? allBody : allBody.slice(0, elseIdx);
        if (!connectedRef.current && trueBody.length > 0) await executeBlocks(trueBody);
        i = endIdx === -1 ? blocks.length : endIdx + 1;
        continue;
      }

      // Skip purely structural markers
      if (['on_start', 'else_branch', 'else_if', 'if_end'].includes(step.id)) { i++; continue; }

      // Normal block
      setActiveBlockUid(step.uid);
      if (connectedRef.current && !simOnly) {
        if (robotType === 'microbit') {
          // Run physical and simulation in parallel; physical uses raw REPL with completion wait
          await Promise.all([
            sendMicrobitRaw(profile.buildCmd(step.id, step.params)),
            robotRef.current ? robotRef.current.execute(step) : Promise.resolve(),
          ]);
        } else {
          await sendRaw(profile.buildCmd(step.id, step.params));
          await new Promise(r => setTimeout(r, 200));
          if (robotRef.current) await robotRef.current.execute(step);
        }
      } else {
        if (robotRef.current) await robotRef.current.execute(step);
      }
      i++;
    }
  };

  const saveProgram = () => {
    try {
      localStorage.setItem('cv_robotlab_program', JSON.stringify(program));
      localStorage.setItem('cv_robotlab_robottype', simRobotType);
      localStorage.setItem('cv_robotlab_track', simTrack);
    } catch {}
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1800);
  };

  useEffect(() => {
    const handler = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveProgram(); } };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [program, simRobotType, simTrack]);

  const runProgram = async () => {
    if (!program.length) return;
    if (connectedRef.current && robotType === 'microbit' && firmwareOkRef.current === false) {
      addTerminal('⚠️ Flash the ByteBuddies hex first — click ⚡ Flash BLE Firmware via USB then reconnect.', 'warn');
      return;
    }
    setRunning(true);
    runningRef.current = true;
    robotRef.current?.resetState(); // clear trail/state but keep user-dragged position
    const orderedSteps = [...program].sort((a, b) => a.y - b.y);
    // Track concepts used
    const conceptsUsed = {};
    orderedSteps.forEach(step => {
      if (step.id?.includes('loop') || step.id === 'loop-repeat' || step.id === 'loop-forever') conceptsUsed.loops = (conceptsUsed.loops || 0) + 1;
      if (step.id?.includes('logic') || step.id?.includes('if')) conceptsUsed.conditions = (conceptsUsed.conditions || 0) + 1;
      if (step.id?.includes('var')) conceptsUsed.variables = (conceptsUsed.variables || 0) + 1;
      if (step.id?.includes('forward') || step.id?.includes('turn') || step.id?.includes('move')) conceptsUsed.motion = (conceptsUsed.motion || 0) + 1;
      if (step.id?.includes('led') || step.id?.includes('servo') || step.id?.includes('sensor')) conceptsUsed.hardware = (conceptsUsed.hardware || 0) + 1;
    });
    try {
      const existing = JSON.parse(localStorage.getItem('cv_concepts') || '{}');
      Object.entries(conceptsUsed).forEach(([k, v]) => { existing[k] = (existing[k] || 0) + v; });
      existing.totalRuns = (existing.totalRuns || 0) + 1;
      existing.lastRun = new Date().toISOString();
      localStorage.setItem('cv_concepts', JSON.stringify(existing));
    } catch {}

    // If micro:bit is connected with MicroPython and the program has control-flow blocks,
    // send the full compiled program as one raw REPL exec (much more reliable than line-by-line)
    const COMPLEX_IDS = new Set(['if_then','if_dist','if_line','if_btn_a','if_btn_b',
      'if_touch','if_shake','if_tilt','if_light','if_temp','if_compass','for_range','while_do']);
    const hasComplexFlow = orderedSteps.some(s => COMPLEX_IDS.has(s.id));

    if (robotType === 'microbit' && connectedRef.current && firmwareOkRef.current === true) {
      robotRef.current?.resetState();
      if (connectionTypeRef.current === 'bluetooth' || bridgeModeRef.current) {
        // BLE or USB-bridge mode: send setup code as single atomic block to avoid timing issues
        const setupLines = MICROBIT_KIT_SETUPS[microbitKit] || MICROBIT_KIT_SETUPS.generic;

        // Combine all setup lines into one Python block for atomicity
        const setupBlock = setupLines.map(line => {
          // For multi-line strings, they already contain \n as escape sequences
          // Just use them directly - Python will interpret \n correctly
          return line;
        }).join('\n');

        // Send as one combined block wrapped in exec to handle multi-line definitions
        const combined = `exec("""${setupBlock.replace(/\\/g, '\\\\').replace(/"""/g, '\\"""')}""")\n`;
        try {
          await sendMicrobitRaw(combined);
        } catch (e) {
          addTerminal(`⚠️ Setup warning (continuing anyway): ${e.message}`, 'warn');
        }
        await executeBlocks(orderedSteps);
      } else {
        // USB/MicroPython: send the full program as one raw REPL exec.
        const pythonCode = generateFullProgram(program, microbitKit);
        const hasForever = orderedSteps.some(s => s.id === 'forever');
        if (hasForever) {
          await writeChunked(pythonCode + '\x04');
          addTerminal('▶ Running forever — press Stop to interrupt', 'info');
          await new Promise(resolve => { const iv = setInterval(() => { if (!runningRef.current) { clearInterval(iv); resolve(); } }, 200); });
        } else {
          await Promise.all([
            sendMicrobitRaw(pythonCode),
            executeBlocks(orderedSteps, true),
          ]);
        }
      }
    } else {
      await executeBlocks(orderedSteps);
    }
    // Only send stop + "finished" if the program ran to completion naturally
    // (stopProgram already handles the user-stopped case)
    if (runningRef.current) {
      if (connectedRef.current && connectionTypeRef.current !== 'bluetooth' && !bridgeModeRef.current) await sendRaw(profile.buildCmd('stop', {}));
      addTerminal('✅ Program finished', 'success');
    }
    runningRef.current = false;
    setRunning(false);
    setActiveBlockUid(null);
  };

  const stopProgram = async () => {
    runningRef.current = false;
    setRunning(false);
    setActiveBlockUid(null);
    if (connectedRef.current) {
      if (robotType === 'microbit' && firmwareOkRef.current === true) {
        if (connectionTypeRef.current === 'bluetooth' || bridgeModeRef.current) {
          await writeChunked('sp()\n');
        } else {
          // USB: interrupt running program with Ctrl+C, then stop motors
          await writeChunked('\x03\x03');
          await new Promise(r => setTimeout(r, 400));
          await sendMicrobitRaw('sp()');
        }
      } else {
        await sendRaw(profile.buildCmd('stop', {}));
      }
    }
    addTerminal('⏹ Stopped', 'warn');
  };

  const handleSaveHex = useCallback(async () => {
    if (!program.length) { addTerminal('⚠️ Add some blocks first!', 'warn'); return; }
    try {
      const pythonCode = generateFullProgram(program, microbitKit);
      const hexStr = await buildMicrobitHex(pythonCode, (msg) => addTerminal(msg, 'info'));
      const blob = new Blob([hexStr], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'bytebuddies.hex';
      document.body.appendChild(a); a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      addTerminal('💾 bytebuddies.hex saved — copy it to your MICROBIT USB drive to flash!', 'success');
    } catch (e) {
      addTerminal(`❌ Save failed: ${e.message}`, 'error');
    }
  }, [program, microbitKit, addTerminal]);

  const handleFlash = useCallback(async () => {
    // ⚡ Flash = alias for Save .hex — DAPLink removed (unreliable with universal hex format)
    handleSaveHex();
  }, [handleSaveHex]);

  const canvasAreaRef = useRef(null);
  const [draggingBlock, setDraggingBlock] = useState(null);
  const [dragOffset, setDragOffsetState] = useState({ x: 0, y: 0 });
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [hoveredBlock, setHoveredBlock] = useState(null);

  /* ─── Program: array of block objects with x,y positions ─── */
  // program items: { uid, id, label, icon, color, cat, params, x, y }

  const createBlock = (cmd, x = 60, y = 60) => {
    const params = {};
    cmd.params.forEach(p => { params[p.key] = p.default; });
    // Stack below existing blocks
    const maxY = program.reduce((m, b) => Math.max(m, b.y), 0);
    return { uid: Date.now() + Math.random(), id: cmd.id, label: cmd.label, icon: cmd.icon, color: cmd.color, cat: cmd.cat, params, x, y: program.length ? maxY + 52 : 40 };
  };

  const addBlock = (cmd) => setProgram(prev => [...prev, createBlock(cmd)]);

  const removeBlock = (uid) => { setProgram(prev => prev.filter(b => b.uid !== uid)); if (selectedBlock === uid) setSelectedBlock(null); };

  const updateParam = (uid, key, val) => setProgram(prev => prev.map(b => b.uid === uid ? { ...b, params: { ...b.params, [key]: val } } : b));

  /* ─── Block dragging on canvas ─── */
  const handleBlockMouseDown = (e, block) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    e.stopPropagation();
    setSelectedBlock(block.uid);
    const rect = canvasAreaRef.current.getBoundingClientRect();
    setDraggingBlock(block.uid);
    setDragOffsetState({ x: e.clientX - rect.left - block.x, y: e.clientY - rect.top - block.y });
  };

  const handleCanvasMouseMove = useCallback((e) => {
    if (!draggingBlock || !canvasAreaRef.current) return;
    const rect = canvasAreaRef.current.getBoundingClientRect();
    const x = Math.max(0, e.clientX - rect.left - dragOffset.x);
    const y = Math.max(0, e.clientY - rect.top - dragOffset.y);
    setProgram(prev => prev.map(b => b.uid === draggingBlock ? { ...b, x, y } : b));
  }, [draggingBlock, dragOffset]);

  const handleCanvasMouseUp = () => setDraggingBlock(null);

  /* ─── Drop from sidebar ─── */
  const handleCanvasDrop = (e) => {
    e.preventDefault();
    const cmdId = e.dataTransfer.getData('robot-cmd');
    const cmd = ROBOT_COMMANDS.find(c => c.id === cmdId);
    if (!cmd || !canvasAreaRef.current) return;
    const rect = canvasAreaRef.current.getBoundingClientRect();
    const x = Math.max(0, e.clientX - rect.left - 80);
    const y = Math.max(0, e.clientY - rect.top - 20);
    const params = {};
    cmd.params.forEach(p => { params[p.key] = p.default; });
    setProgram(prev => [...prev, { uid: Date.now() + Math.random(), id: cmd.id, label: cmd.label, icon: cmd.icon, color: cmd.color, cat: cmd.cat, params, x, y }]);
  };

  /* ─── Run program uses blocks sorted by Y ─── */
  const sortedProgram = [...program].sort((a, b) => a.y - b.y);

  /* ─── Generated code viewer ─── */
  const generatedCode = profile.codeHeader + sortedProgram.map(s => profile.buildCmd(s.id, s.params)).join('');

  const s = {
    panel: { display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'inherit' },
    header: { padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
    title: { fontSize: 20, fontWeight: 700, margin: 0 },
    body: { display: 'flex', flex: 1, overflow: 'hidden', gap: 0 },
    leftCol: { width: 190, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-secondary)' },
    midCol: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    rightCol: { width: 340, borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    runBar: { padding: '10px 12px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'center', background: 'var(--bg-secondary)' },
    btn: (bg, fg = '#fff') => ({ padding: '8px 16px', borderRadius: 8, border: 'none', background: bg, color: fg, fontWeight: 600, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }),
    terminal: { flex: 1, overflowY: 'auto', padding: 10, fontFamily: 'monospace', fontSize: 12, background: '#0c0c1e' },
    termLine: (type) => ({ color: type === 'send' ? '#60a5fa' : type === 'recv' ? '#4ade80' : type === 'error' ? '#f87171' : type === 'success' ? '#34d399' : type === 'warn' ? '#fbbf24' : '#94a3b8', padding: '1px 0' }),
    iconBtn: { background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13, padding: '2px 4px', borderRadius: 4 },
    connDot: (ok) => ({ width: 10, height: 10, borderRadius: '50%', background: ok ? '#22c55e' : '#94a3b8', boxShadow: ok ? '0 0 6px #22c55e' : 'none' }),
    tabBar: { display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' },
    tab: (active) => ({ padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: active ? '#6366f1' : 'var(--text-muted)', background: 'transparent', border: 'none', borderBottom: active ? '2px solid #6366f1' : '2px solid transparent' }),
    codeBox: { flex: 1, overflowY: 'auto', padding: 12, fontFamily: 'monospace', fontSize: 12, background: '#0c0c1e', color: '#a5f3fc', whiteSpace: 'pre', lineHeight: 1.6 },
  };

  const [rightTab, setRightTab] = useState('virtual');
  const [activeCat, setActiveCat] = useState('Movement');
  const [showRecipe, setShowRecipe] = useState(false);

  return (
    <div style={s.panel}>
      {/* Keyframe for active block pulse animation */}
      <style>{`@keyframes cv-running-pulse { from { opacity: 1; box-shadow: 0 0 6px #fbbf24; } to { opacity: 0.7; box-shadow: 0 0 14px #fbbf24; } }`}</style>
      {/* Header */}
      <div style={s.header}>
        <span style={{ fontSize: 28 }}>🤖</span>
        <div>
          <h2 style={s.title}>Robot Lab</h2>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>Connect & program your robot</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Robot type */}
          <select
            value={robotType}
            onChange={e => setRobotType(e.target.value)}
            disabled={connected}
            style={{ padding: '6px 10px', borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 13 }}
          >
            {Object.entries(ROBOT_PROFILES).map(([k, v]) => (
              <option key={k} value={k}>{v.icon} {v.name}</option>
            ))}
          </select>

          {/* micro:bit kit selector */}
          {robotType === 'microbit' && (
            <select
              value={microbitKit}
              onChange={e => setMicrobitKit(e.target.value)}
              disabled={connected}
              style={{ padding: '6px 10px', borderRadius: 8, background: '#1e1b4b', border: '1px solid #6366f1', color: '#a5b4fc', fontSize: 13 }}
            >
              <option value="generic">🔌 Generic H-bridge</option>
              <option value="cutebot">🐱 Elecfreaks Cutebot</option>
              <option value="cutebotpro">🐱 Elecfreaks Cutebot Pro</option>
              <option value="bitbot">🤖 4tronix Bit:Bot</option>
              <option value="maqueen">🦆 DFRobot Maqueen</option>
              <option value="maqueenplus">🦆 DFRobot Maqueen Plus</option>
              <option value="move">🚗 Kitronik :MOVE Motor</option>
              <option value="ringbitcar">🚙 Elecfreaks Ring:bit Car</option>
            </select>
          )}

          {/* Connect status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border)', fontSize: 13 }}>
            <div style={s.connDot(connected)} />
            <span>{connected ? `${profile.name} connected` : 'Not connected'}</span>
          </div>

          {connected
            ? <button style={s.btn('#ef4444')} onClick={disconnect}>Disconnect</button>
            : robotType === 'microbit'
              ? <span style={{ display:'flex', gap:6 }}>
                  <button style={s.btn('#6366f1')} onClick={connect} disabled={connecting} title="Connect via USB cable">
                    {connecting ? 'Connecting…' : '🔌 USB'}
                  </button>
                  <button style={s.btn('#0ea5e9')} onClick={connectBluetooth} disabled={connecting} title="Connect wirelessly via Bluetooth">
                    {connecting ? 'Connecting…' : '📡 Bluetooth'}
                  </button>
                </span>
              : <button style={s.btn('#6366f1')} onClick={connect} disabled={connecting}>
                  {connecting ? 'Connecting…' : '🔌 Connect Robot'}
                </button>
          }
          <button style={s.btn('var(--bg-secondary)', 'var(--text-muted)')} onClick={() => setShowSetup(!showSetup)}>
            📋 Setup Guide
          </button>
        </div>
      </div>

      {/* Setup guide banner */}
      {showSetup && (
        <div style={{ padding: 16, background: '#1e1b4b', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <strong style={{ fontSize: 14 }}>📋 {profile.name} Setup Guide</strong>
            <button style={s.iconBtn} onClick={() => setShowSetup(false)}>✕</button>
          </div>
          <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 2 }}>
            {robotType === 'microbit' && <>
              <li><strong>🔌 USB (easiest):</strong> Connect with a USB cable → click <strong>🔌 USB</strong> → select the serial port → click <strong>Run</strong></li>
              <li>No flashing needed over USB — ByteBuddies sends code directly to MicroPython REPL</li>
            </>}
            {robotType === 'mbot' && <>
              <li>Step 1 — <strong>Download &amp; upload the sketch</strong> to your mBot (Arduino IDE + Makeblock library)</li>
              <li>Step 2 — Connect mBot via USB cable</li>
              <li>Step 3 — Click <strong>Connect Robot</strong> → select the mBot port → click <strong>Run</strong></li>
            </>}
            {robotType === 'arduino' && <>
              <li>Step 1 — <strong>Download &amp; upload the sketch</strong> to your Arduino (Arduino IDE)</li>
              <li>Step 2 — Connect Arduino via USB cable</li>
              <li>Step 3 — Click <strong>Connect Robot</strong> → select the COM port → click <strong>Run</strong></li>
            </>}
          </ol>
          {robotType === 'microbit' && (
            <div style={{ marginTop: 12, padding: '12px 14px', background: '#0c1a2e', border: '1px solid #0ea5e9', borderRadius: 8 }}>
              <strong style={{ fontSize: 13, color: '#38bdf8' }}>📡 Wireless via Bluetooth — one-click USB flash</strong>
              <p style={{ margin: '6px 0', fontSize: 12, color: 'var(--text-secondary)' }}>
                Connect your micro:bit via USB, then click the button below. ByteBuddies will automatically flash the BLE firmware — no MakeCode needed!
              </p>
              <a
                href="/microbit-bluetooth-working.hex"
                download="microbit-bluetooth-working.hex"
                style={{ ...s.btn('#0ea5e9'), fontSize: 13, padding: '9px 18px', fontWeight: 700, marginTop: 4, display: 'inline-block', textDecoration: 'none' }}
              >
                ⚡ Download & Flash
              </a>
              <p style={{ margin: '8px 0 0', fontSize: 11, color: 'var(--text-secondary)' }}>
                1. Click to download<br/>
                2. Plug micro:bit via USB<br/>
                3. Drag file onto MICROBIT drive<br/>
                4. Should show "B" ✓
              </p>
            </div>
          )}
          {(robotType === 'mbot' || robotType === 'arduino') && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: '#0f2a1a', border: '1px solid #16a34a', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <a
                href={robotType === 'mbot' ? '/bytebuddies-mbot.ino' : '/bytebuddies-arduino.ino'}
                download
                style={{ ...s.btn('#16a34a'), fontSize: 14, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', fontWeight: 700, flexShrink: 0 }}>
                ⬇️ Download {robotType === 'mbot' ? 'mBot' : 'Arduino'} Sketch (.ino)
              </a>
              <span style={{ fontSize: 12, color: '#86efac' }}>
                {robotType === 'mbot'
                  ? 'Upload once via Arduino IDE (needs Makeblock library) — then just Connect + Run every time'
                  : 'Upload once via Arduino IDE — then just Connect + Run every time'}
              </span>
            </div>
          )}
          <details style={{ marginTop: 10 }}>
            <summary style={{ cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#818cf8' }}>
              Show sketch source code →
            </summary>
            <pre style={{ marginTop: 8, padding: 10, background: '#0c0c1e', borderRadius: 8, fontSize: 11, color: '#a5f3fc', overflowX: 'auto', maxHeight: 200 }}>
              {profile.setupCode}
            </pre>
            <button style={{ ...s.btn('#6366f1'), marginTop: 6, fontSize: 12 }}
              onClick={() => navigator.clipboard?.writeText(profile.setupCode).then(() => addTerminal('Code copied to clipboard!', 'success'))}>
              📋 Copy Code
            </button>
          </details>
        </div>
      )}

      {(() => {
        const ua = navigator.userAgent;
        const isFirefox = ua.includes('Firefox');
        const isSafari = ua.includes('Safari') && !ua.includes('Chrome');
        const noSerial = !navigator.serial;
        // Only show warning if on a browser that truly doesn't support Web Serial
        if (!noSerial || (!isFirefox && !isSafari)) return null;
        const browserName = isFirefox ? 'Firefox' : isSafari ? 'Safari' : 'your browser';
        return (
          <div style={{ padding: '12px 20px', background: '#1e1b4b', borderBottom: '1px solid #4338ca', fontSize: 13, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 20 }}>ℹ️</span>
            <div>
              <strong>You're using {browserName}</strong> — the simulator below works fine, but connecting to a real robot requires
              {' '}<strong>Google Chrome</strong> or <strong>Microsoft Edge</strong>.
              {' '}<span style={{ color: '#818cf8' }}>The program builder and simulator work in any browser.</span>
            </div>
          </div>
        );
      })()}

      <div style={s.body}>
        {/* Left: block palette sidebar */}
        <div style={s.leftCol}>
          {/* Category tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, padding: 6, borderBottom: '1px solid var(--border)' }}>
            {['Movement','Sensors','Control','Math','Outputs','Servo','Variables','Comms','Lights'].map(cat => {
              const col = '#f59e0b';
              return (
                <button key={cat} onClick={() => setActiveCat(cat)} style={{
                  padding: '4px 8px', borderRadius: 6, border: `1.5px solid ${activeCat === cat ? col : 'transparent'}`,
                  background: activeCat === cat ? `${col}22` : 'transparent',
                  color: activeCat === cat ? col : 'var(--text-muted)',
                  fontSize: 10, fontWeight: 700, cursor: 'pointer', transition: 'all 0.12s',
                }}>{cat}</button>
              );
            })}
          </div>
          {/* Block list — draggable */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '6px 4px' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', padding: '4px 10px 6px', fontStyle: 'italic' }}>
              Drag blocks onto the canvas →
            </div>
            {ROBOT_COMMANDS.filter(c => c.cat === activeCat).map(cmd => (
              <div
                key={cmd.id}
                draggable
                onDragStart={e => e.dataTransfer.setData('robot-cmd', cmd.id)}
                onClick={() => addBlock(cmd)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '7px 10px', margin: '2px 4px', borderRadius: 8,
                  border: `2px solid ${cmd.color}`,
                  background: `${cmd.color}22`,
                  color: 'var(--text-primary)', cursor: 'grab', fontSize: 12,
                  fontWeight: 600, userSelect: 'none', transition: 'transform 0.1s, box-shadow 0.1s',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(3px)'; e.currentTarget.style.boxShadow = `0 2px 12px ${cmd.color}44`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
                title="Click to add · Drag to place"
              >
                <span style={{ fontSize: 15 }}>{cmd.icon}</span>
                <span style={{ flex: 1 }}>{cmd.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Middle: free-form block canvas */}
        <div style={s.midCol}>
          <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}>🧩 Block Canvas</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Top → bottom · indent blocks inside a loop</span>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button
                title="Show track recipes"
                style={{ ...s.btn('var(--bg-primary)', '#a78bfa'), fontSize: 12, padding: '5px 10px' }}
                onClick={() => setShowRecipe(v => !v)}
              >💡 Recipe</button>
              <button style={s.btn('var(--bg-primary)', 'var(--text-muted)')} onClick={() => { setProgram([]); setSelectedBlock(null); }}>
                🗑 Clear
              </button>
            </div>
          </div>

          {/* Track recipe panel */}
          {showRecipe && (() => {
            // Each recipe is a list of block specs to auto-load
            const RECIPES = {
              open:       { title: 'Open Field', blocks: [
                { id:'forward', params:{amount:'100'} },
                { id:'right',   params:{degrees:'90'} },
              ]},
              square:     { title: 'Square Track — drive a square', blocks: [
                { id:'repeat', params:{times:'4'} },
                { id:'forward',     params:{amount:'120'} },
                { id:'right',       params:{degrees:'90'} },
              ]},
              figure8:    { title: 'Round / Figure-8 Track — full circle', blocks: [
                { id:'repeat', params:{times:'36'} },
                { id:'forward',     params:{amount:'18'} },
                { id:'right',       params:{degrees:'10'} },
              ]},
              linefollow: { title: 'Line Follow', blocks: [
                { id:'forward', params:{amount:'300'} },
              ]},
              maze:       { title: 'Maze', blocks: [
                { id:'forward', params:{amount:'80'} },
                { id:'right',   params:{degrees:'90'} },
                { id:'forward', params:{amount:'80'} },
                { id:'left',    params:{degrees:'90'} },
                { id:'forward', params:{amount:'80'} },
              ]},
              obstacles:  { title: 'Obstacles Course', blocks: [
                { id:'forward', params:{amount:'60'} },
                { id:'right',   params:{degrees:'45'} },
                { id:'forward', params:{amount:'80'} },
                { id:'left',    params:{degrees:'45'} },
              ]},
              city:       { title: 'City Grid', blocks: [
                { id:'repeat', params:{times:'4'} },
                { id:'forward',     params:{amount:'80'} },
                { id:'right',       params:{degrees:'90'} },
              ]},
              ramp:       { title: 'Ramp', blocks: [
                { id:'forward', params:{amount:'300'} },
              ]},
            };
            const r = RECIPES[simTrack] || RECIPES.open;

            const loadRecipe = () => {
              const newBlocks = r.blocks.map((spec, i) => {
                const cmd = ROBOT_COMMANDS.find(c => c.id === spec.id);
                if (!cmd) return null;
                return {
                  uid: Date.now() + i,
                  id: cmd.id, label: cmd.label, icon: cmd.icon,
                  color: cmd.color, cat: cmd.cat,
                  params: { ...spec.params },
                  x: 60, y: 30 + i * 60,
                };
              }).filter(Boolean);
              setProgram(newBlocks);
              setShowRecipe(false);
            };

            return (
              <div style={{ background: '#1a1040', borderBottom: '1px solid #7c3aed44', padding: '10px 16px', fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontWeight: 700, color: '#a78bfa' }}>💡 {r.title}</span>
                  <button
                    onClick={loadRecipe}
                    style={{ background: '#7c3aed', border: 'none', color: '#fff', borderRadius: 6,
                      padding: '4px 12px', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>
                    ⚡ Load onto canvas
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {r.blocks.map((spec, i) => {
                    const cmd = ROBOT_COMMANDS.find(c => c.id === spec.id);
                    if (!cmd) return null;
                    const isLoop = spec.id.startsWith('loop');
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8,
                        paddingLeft: isLoop ? 0 : 16,
                        color: isLoop ? '#c4b5fd' : '#e2e8f0' }}>
                        <span style={{ fontSize: 14 }}>{cmd.icon}</span>
                        <span style={{ flex: 1 }}>{cmd.label}</span>
                        {Object.entries(spec.params).map(([k, v]) => (
                          <span key={k} style={{ background: `${cmd.color}22`, border: `1px solid ${cmd.color}55`,
                            borderRadius: 4, padding: '1px 8px', color: cmd.color, fontFamily: 'monospace' }}>
                            {v}{k === 'degrees' ? '°' : k === 'times' ? '×' : ''}
                          </span>
                        ))}
                      </div>
                    );
                  })}
                </div>
                <div style={{ marginTop: 8, color: '#64748b', fontSize: 11 }}>
                  🔁 Repeat block runs everything below it N times · Click "Load" to auto-place blocks
                </div>
              </div>
            );
          })()}

          {/* Canvas with dot grid */}
          <div
            ref={canvasAreaRef}
            style={{
              flex: 1, position: 'relative', overflow: 'auto',
              backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.25) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              cursor: draggingBlock ? 'grabbing' : 'default',
              minHeight: 0,
            }}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            onDragOver={e => e.preventDefault()}
            onDrop={handleCanvasDrop}
            onClick={() => setSelectedBlock(null)}
          >
            {/* SVG connection lines + loop brackets */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              {/* Body scope brackets — drawn for all control-flow headers */}
              {(() => {
                const BLOCK_END = {
                  repeat: 'repeat_end', forever: 'repeat_end',
                  for_range: 'for_end', while_do: 'while_end',
                  if_then: 'if_end', if_temp: 'if_end', if_compass: 'if_end',
                  if_dist: 'if_end', if_line: 'if_end', if_btn_a: 'if_end',
                  if_btn_b: 'if_end', if_touch: 'if_end', if_shake: 'if_end',
                  if_tilt: 'if_end', if_light: 'if_end',
                };
                const LOOP_IDS = new Set(['repeat','forever','for_range','while_do']);
                return sortedProgram.map((block, i) => {
                  const endId = BLOCK_END[block.id];
                  if (!endId) return null;
                  const endIdx = sortedProgram.findIndex((b, j) => j > i && b.id === endId);
                  const bodyBlocks = endIdx === -1
                    ? sortedProgram.slice(i + 1)
                    : sortedProgram.slice(i + 1, endIdx);
                  if (!bodyBlocks.length) return null;
                  const top = block.y + 36;
                  const lastBlock = endIdx === -1 ? bodyBlocks[bodyBlocks.length - 1] : sortedProgram[endIdx];
                  const bot = lastBlock.y + 36;
                  const bx = Math.min(block.x, ...bodyBlocks.map(b => b.x)) - 6;
                  const isLoop = LOOP_IDS.has(block.id);
                  const label = block.id === 'repeat' ? `🔁 × ${block.params?.times||3}`
                    : block.id === 'forever' ? '♾️ loop forever'
                    : block.id === 'for_range' ? `🔢 ${block.params?.var||'i'}: ${block.params?.from||0}→${block.params?.to||5}`
                    : block.id === 'while_do' ? `🔄 while ${block.params?.cond||'x'} ${block.params?.op||'<'} ${block.params?.val||10}`
                    : `🔀 if block`;
                  return (
                    <g key={block.uid + '-bracket'}>
                      <rect
                        x={bx - 2} y={top - 4}
                        width={Math.max(...bodyBlocks.map(b => b.x)) + 200 - bx + 4}
                        height={Math.max(0, bot - top + 8)}
                        rx="8"
                        fill={block.color} fillOpacity={isLoop ? '0.07' : '0.05'}
                        stroke={block.color} strokeWidth={isLoop ? 2 : 1.5}
                        strokeOpacity="0.4" strokeDasharray="6,4"
                      />
                      <text x={bx + 6} y={top - 7} fill={block.color} fontSize="10" fontWeight="700" opacity="0.85">
                        {label}
                      </text>
                    </g>
                  );
                });
              })()}
              {/* Connection lines */}
              {sortedProgram.map((block, i) => {
                if (i === 0) return null;
                const prev = sortedProgram[i - 1];
                const x1 = prev.x + 90, y1 = prev.y + 36;
                const x2 = block.x + 90, y2 = block.y;
                return (
                  <path key={block.uid}
                    d={`M${x1},${y1} C${x1},${y1 + 20} ${x2},${y2 - 20} ${x2},${y2}`}
                    fill="none" stroke={block.color} strokeWidth="2"
                    strokeDasharray="5,4" opacity="0.5"
                  />
                );
              })}
            </svg>

            {program.length === 0 && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', pointerEvents: 'none' }}>
                <div style={{ fontSize: 52, marginBottom: 12, opacity: 0.3 }}>🤖</div>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>Empty canvas</div>
                <div style={{ fontSize: 13 }}>Click or drag blocks from the left panel</div>
              </div>
            )}

            {/* Render blocks */}
            {program.map(block => {
              const cmdDef = ROBOT_COMMANDS.find(c => c.id === block.id);
              const isSelected = selectedBlock === block.uid;
              const isDragging = draggingBlock === block.uid;
              const isActive = activeBlockUid === block.uid;
              const stepNum = sortedProgram.findIndex(b => b.uid === block.uid) + 1;
              return (
                <div
                  key={block.uid}
                  style={{
                    position: 'absolute', left: block.x, top: block.y,
                    background: `${block.color}22`,
                    border: `2px solid ${block.color}`,
                    borderRadius: 10,
                    padding: '7px 32px 7px 12px',
                    fontSize: 13, fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 6,
                    whiteSpace: 'nowrap', cursor: isDragging ? 'grabbing' : 'grab',
                    userSelect: 'none', zIndex: isDragging ? 100 : isActive ? 100 : isSelected ? 50 : 1,
                    boxShadow: isActive
                      ? '0 0 16px rgba(251,191,36,0.7), 0 0 32px rgba(251,191,36,0.3)'
                      : isSelected
                        ? `0 0 0 3px ${block.color}88, 0 4px 20px ${block.color}44`
                        : isDragging ? `0 6px 24px ${block.color}55` : 'none',
                    outline: isActive ? '2px solid #fbbf24' : undefined,
                    transform: isDragging ? 'scale(1.04)' : isActive ? 'scale(1.03)' : 'scale(1)',
                    transition: isDragging ? 'none' : 'box-shadow 0.15s, transform 0.15s, outline 0.15s',
                  }}
                  onMouseDown={e => handleBlockMouseDown(e, block)}
                  onMouseEnter={() => setHoveredBlock(block.uid)}
                  onMouseLeave={() => setHoveredBlock(null)}
                  tabIndex={0}
                  onKeyDown={e => {
                    if ((e.key === 'Delete' || e.key === 'Backspace') && e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT' && e.target.tagName !== 'TEXTAREA') removeBlock(block.uid);
                    if (e.key === 'ArrowUp') setProgram(p => p.map(b => b.uid === block.uid ? { ...b, y: b.y - 8 } : b));
                    if (e.key === 'ArrowDown') setProgram(p => p.map(b => b.uid === block.uid ? { ...b, y: b.y + 8 } : b));
                    if (e.key === 'ArrowLeft') setProgram(p => p.map(b => b.uid === block.uid ? { ...b, x: b.x - 8 } : b));
                    if (e.key === 'ArrowRight') setProgram(p => p.map(b => b.uid === block.uid ? { ...b, x: b.x + 8 } : b));
                  }}
                >
                  {/* Active block "Running" badge */}
                  {isActive && (
                    <div style={{
                      position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)',
                      background: '#fbbf24', color: '#000', fontSize: 10, fontWeight: 800,
                      borderRadius: 999, padding: '2px 8px', whiteSpace: 'nowrap',
                      animation: 'cv-running-pulse 0.8s ease-in-out infinite alternate',
                      zIndex: 101,
                    }}>
                      ▶ Running
                    </div>
                  )}
                  {/* Block notch top */}
                  <div style={{ position: 'absolute', top: -6, left: 16, width: 24, height: 6, background: `${block.color}`, borderRadius: '4px 4px 0 0' }} />
                  {/* Block notch bottom */}
                  <div style={{ position: 'absolute', bottom: -6, left: 16, width: 24, height: 6, background: `${block.color}`, borderRadius: '0 0 4px 4px' }} />

                  {/* Step order badge */}
                  <span style={{
                    position: 'absolute', top: -10, left: -8,
                    background: block.color, color: '#fff',
                    borderRadius: '50%', width: 18, height: 18,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 800, boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                  }}>{stepNum}</span>

                  <span style={{ fontSize: 16 }}>{block.icon}</span>
                  <span style={{ color: block.color, marginRight: 2 }}>{block.label}</span>

                  {/* Inline param inputs */}
                  {cmdDef?.params.map(p => (
                    <span key={p.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      {p.type === 'select' ? (
                        <select
                          value={block.params[p.key]}
                          onChange={e => updateParam(block.uid, p.key, e.target.value)}
                          onMouseDown={e => e.stopPropagation()}
                          onClick={e => e.stopPropagation()}
                          style={{ background: 'rgba(0,0,0,0.35)', border: `1px solid ${block.color}88`, borderRadius: 4, color: '#fff', fontSize: 12, fontWeight: 700, padding: '1px 4px', fontFamily: 'var(--font-mono)' }}
                        >
                          {p.options.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input
                          type={p.type === 'number' ? 'number' : 'text'}
                          value={block.params[p.key]}
                          onChange={e => updateParam(block.uid, p.key, e.target.value)}
                          onMouseDown={e => e.stopPropagation()}
                          onClick={e => e.stopPropagation()}
                          style={{ background: 'rgba(0,0,0,0.35)', border: `1px solid ${block.color}88`, borderRadius: 4, color: '#fff', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)', padding: '1px 5px', width: p.type === 'text' ? 64 : 48, outline: 'none', margin: '0 2px', verticalAlign: 'middle' }}
                        />
                      )}
                      <span style={{ fontSize: 10, color: `${block.color}cc` }}>{p.label}</span>
                    </span>
                  ))}

                  {/* Category label */}
                  <span style={{ position: 'absolute', bottom: 1, left: 12, fontSize: 9, color: 'var(--text-muted)' }}>{block.cat}</span>

                  {/* Delete button */}
                  <button
                    style={{
                      position: 'absolute', top: 3, right: 3, width: 20, height: 20,
                      borderRadius: '50%', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700,
                      background: hoveredBlock === block.uid ? '#ef4444' : 'transparent',
                      color: hoveredBlock === block.uid ? '#fff' : 'transparent',
                      transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                    onMouseDown={e => e.stopPropagation()}
                    onClick={e => { e.stopPropagation(); removeBlock(block.uid); }}
                  >×</button>
                </div>
              );
            })}
          </div>

          <div style={s.runBar}>
            {running
              ? <button style={s.btn('#ef4444')} onClick={stopProgram}>⏹ Stop</button>
              : <button style={{ ...s.btn('#22c55e'), opacity: program.length === 0 ? 0.4 : 1 }} onClick={runProgram} disabled={program.length === 0}>
                  ▶ Run
                </button>
            }
            <button
              onClick={saveProgram}
              style={{
                ...s.btn(savedFlash ? '#22c55e' : '#334155'),
                transition: 'background 0.3s', minWidth: 80,
              }}
            >
              {savedFlash ? '✓ Saved!' : '💾 Save'}
            </button>
            {robotType === 'microbit' && (
              <button
                style={{ ...s.btn(flashProgress !== null ? '#f59e0b' : '#6366f1'), marginLeft: 4, minWidth: 90 }}
                onClick={handleFlash}
                disabled={flashProgress !== null || program.length === 0}
                title="Flash program directly to micro:bit via USB — works with any firmware"
              >
                {flashProgress === 'done' ? '✅ Done!' : flashProgress !== null ? `⚡ ${flashProgress}%` : '⚡ Flash'}
              </button>
            )}
            {robotType === 'microbit' && (
              <button
                style={{ ...s.btn('#0e7490'), marginLeft: 2 }}
                onClick={handleSaveHex}
                disabled={program.length === 0}
                title="Download .hex file — copy it to the MICROBIT USB drive"
              >
                💾 .hex
              </button>
            )}
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{program.length} block{program.length !== 1 ? 's' : ''}</span>
            {!connected && program.length > 0 && robotType === 'microbit' && <span style={{ fontSize: 12, color: '#a5b4fc', marginLeft: 'auto' }}>💡 Click ⚡ Flash to program your micro:bit</span>}
            {!connected && program.length > 0 && robotType !== 'microbit' && <span style={{ fontSize: 12, color: '#fbbf24', marginLeft: 'auto' }}>⚠️ Sim only — connect robot first</span>}
            {connected && firmwareOk === false && <span style={{ fontSize: 12, color: '#fbbf24', marginLeft: 'auto' }}>💡 MakeCode detected — click ⚡ Flash</span>}
            {connected && firmwareOk === true && <span style={{ fontSize: 12, color: '#4ade80', marginLeft: 'auto' }}>✅ {profile.name} live ready</span>}
            {connected && firmwareOk === null && robotType !== 'microbit' && <span style={{ fontSize: 12, color: '#4ade80', marginLeft: 'auto' }}>✅ {profile.name} ready</span>}
          </div>
        </div>

        {/* Right: virtual robot + terminal */}
        <div style={s.rightCol}>
          <div style={s.tabBar}>
            {['virtual', 'terminal', 'code'].map(tab => (
              <button key={tab} style={s.tab(rightTab === tab)} onClick={() => setRightTab(tab)}>
                {tab === 'virtual' ? '🤖 Simulator' : tab === 'terminal' ? '💻 Terminal' : '📄 Code'}
              </button>
            ))}
          </div>

          {rightTab === 'virtual' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 16px', gap: 10, overflowY: 'auto' }}>
              {/* Robot type picker */}
              <div style={{ width: '100%' }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)', marginBottom: 6 }}>Choose Robot</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5 }}>
                  {SIM_ROBOTS.map(r => (
                    <button
                      key={r.id}
                      title={r.desc}
                      onClick={() => { setSimRobotType(r.id); robotRef.current?.reset(); }}
                      style={{
                        padding: '6px 4px',
                        borderRadius: 8,
                        border: `2px solid ${simRobotType === r.id ? r.color : 'transparent'}`,
                        background: simRobotType === r.id ? `${r.color}22` : 'var(--bg-secondary)',
                        color: simRobotType === r.id ? r.color : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: 11,
                        fontWeight: simRobotType === r.id ? 700 : 400,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                        transition: 'all 0.15s',
                      }}
                    >
                      <span style={{ fontSize: 18 }}>{r.icon}</span>
                      <span>{r.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Track selector */}
              <div style={{ width: '100%' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Track / Environment</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
                  {TRACKS.map(t => (
                    <button
                      key={t.id}
                      title={t.desc}
                      onClick={() => { setSimTrack(t.id); robotRef.current?.reset(); }}
                      style={{
                        padding: '5px 3px',
                        borderRadius: 7,
                        border: `2px solid ${simTrack === t.id ? '#6366f1' : 'transparent'}`,
                        background: simTrack === t.id ? '#6366f122' : 'var(--bg-secondary)',
                        color: simTrack === t.id ? '#6366f1' : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: 10,
                        fontWeight: simTrack === t.id ? 700 : 400,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                        transition: 'all 0.15s',
                      }}
                    >
                      <span style={{ fontSize: 15 }}>{t.icon}</span>
                      <span style={{ lineHeight: 1.2, textAlign: 'center' }}>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Canvas + fullscreen wrapper */}
              <div ref={simFsRef} style={{
                width: '100%', position: 'relative',
                ...(simFs ? {
                  background: '#080818', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  width: '100vw', height: '100vh',
                } : {}),
              }}>
                {/* Fullscreen toggle button */}
                <button
                  onClick={toggleSimFs}
                  title={simFs ? 'Exit fullscreen (Esc)' : 'Fullscreen'}
                  style={{
                    position: 'absolute', top: simFs ? 16 : 4, right: simFs ? 16 : 4, zIndex: 10,
                    background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff', borderRadius: 8, padding: '5px 10px', cursor: 'pointer',
                    fontSize: 14, lineHeight: 1, backdropFilter: 'blur(4px)',
                  }}
                >{simFs ? '✕ Exit' : '⛶'}</button>

                <VirtualRobot ref={robotRef} simRobotType={simRobotType} simTrack={simTrack} isFullscreen={simFs} />

                {!simFs && (
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 4 }}>
                    {SIM_ROBOTS.find(r => r.id === simRobotType)?.desc} — runs your program visually
                  </div>
                )}
                {simFs && (
                  <div style={{
                    position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
                    zIndex: 20, display: 'flex', gap: 14, alignItems: 'center',
                    background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
                    borderRadius: 40, padding: '10px 24px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
                  }}>
                    {/* Play / Stop */}
                    <button
                      onClick={running ? stopProgram : runProgram}
                      style={{
                        width: 56, height: 56, borderRadius: '50%', border: 'none',
                        background: running
                          ? 'linear-gradient(135deg,#ef4444,#b91c1c)'
                          : 'linear-gradient(135deg,#22c55e,#16a34a)',
                        color: '#fff', fontSize: 24, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: running
                          ? '0 0 20px rgba(239,68,68,0.5)'
                          : '0 0 20px rgba(34,197,94,0.5)',
                        transition: 'all 0.15s ease',
                      }}
                    >{running ? '⏹' : '▶'}</button>

                    {/* Reset */}
                    <button
                      onClick={() => { stopProgram(); robotRef.current?.reset(); }}
                      title="Reset"
                      style={{
                        width: 44, height: 44, borderRadius: '50%', border: 'none',
                        background: 'rgba(255,255,255,0.12)', color: '#fff',
                        fontSize: 20, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >↺</button>

                    {/* Robot name */}
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, maxWidth: 160 }}>
                      {SIM_ROBOTS.find(r => r.id === simRobotType)?.label}
                    </span>
                  </div>
                )}
              </div>

              <button style={{ ...s.btn('var(--bg-secondary)', 'var(--text-muted)'), fontSize: 12 }}
                onClick={() => robotRef.current?.reset()}>
                ↺ Reset
              </button>

              {/* Manual controls — hide for arm */}
              {simRobotType !== 'arm' && (
                <div style={{ width: '100%', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Manual Control</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: 5, maxWidth: 230, margin: '0 auto' }}>
                    {/* Row 1: empty, empty, up, empty, empty */}
                    <div /><div />
                    <button title="Forward" style={{ ...s.btn('#22c55e'), justifyContent: 'center', padding: '7px 0' }} onClick={() => { robotRef.current?.execute({ id: 'forward', params: { amount: 40 } }); if (connected) sendRaw(profile.buildCmd('forward', { amount: 40 })); }}>⬆️</button>
                    <div /><div />
                    {/* Row 2: turn-left, strafe-left, stop, strafe-right, turn-right */}
                    <button title="Turn Left" style={{ ...s.btn('#3b82f6'), justifyContent: 'center', padding: '7px 0' }} onClick={() => { robotRef.current?.execute({ id: 'left', params: { degrees: 45 } }); if (connected) sendRaw(profile.buildCmd('left', { degrees: 45 })); }}>↺</button>
                    <button title="Move Left" style={{ ...s.btn('#06b6d4'), justifyContent: 'center', padding: '7px 0' }} onClick={() => robotRef.current?.execute({ id: 'move_left', params: { amount: 40 } })}>⬅️</button>
                    <button title="Stop" style={{ ...s.btn('#f59e0b'), justifyContent: 'center', padding: '7px 0' }} onClick={() => { if (connected) sendRaw(profile.buildCmd('stop', {})); }}>⏹</button>
                    <button title="Move Right" style={{ ...s.btn('#06b6d4'), justifyContent: 'center', padding: '7px 0' }} onClick={() => robotRef.current?.execute({ id: 'move_right', params: { amount: 40 } })}>➡️</button>
                    <button title="Turn Right" style={{ ...s.btn('#a855f7'), justifyContent: 'center', padding: '7px 0' }} onClick={() => { robotRef.current?.execute({ id: 'right', params: { degrees: 45 } }); if (connected) sendRaw(profile.buildCmd('right', { degrees: 45 })); }}>↻</button>
                    {/* Row 3: empty, empty, down, empty, empty */}
                    <div /><div />
                    <button title="Backward" style={{ ...s.btn('#ef4444'), justifyContent: 'center', padding: '7px 0' }} onClick={() => { robotRef.current?.execute({ id: 'back', params: { amount: 40 } }); if (connected) sendRaw(profile.buildCmd('back', { amount: 40 })); }}>⬇️</button>
                    <div /><div />
                  </div>
                  <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-muted)', marginTop: 5 }}>
                    ↺↻ = turn · ⬅️➡️ = strafe · ⬆️⬇️ = drive
                  </div>
                </div>
              )}
              {simRobotType === 'arm' && (
                <div style={{ width: '100%', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Arm Control</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 40 }}>Angle</span>
                    <input type="range" min="0" max="180" defaultValue="90"
                      style={{ flex: 1 }}
                      onChange={e => robotRef.current?.execute({ id: 'servo', params: { pin: 0, angle: e.target.value } })} />
                    <span style={{ fontSize: 12, minWidth: 32, color: 'var(--text-primary)' }}>90°</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {rightTab === 'terminal' && (
            <>
              <div ref={terminalRef} style={s.terminal}>
                {terminal.length === 0 && <div style={{ color: '#475569' }}>// Terminal output will appear here…</div>}
                {terminal.map((line, i) => (
                  <div key={i} style={s.termLine(line.type)}>
                    <span style={{ color: '#334155', marginRight: 6 }}>{line.time}</span>
                    {line.msg}
                  </div>
                ))}
              </div>
              <div style={{ padding: 8, borderTop: '1px solid var(--border)', display: 'flex', gap: 6 }}>
                <input
                  id="rawCmd"
                  placeholder="Send raw command…"
                  style={{ flex: 1, padding: '6px 10px', borderRadius: 6, background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 12 }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && e.target.value.trim()) {
                      sendRaw(e.target.value.trim() + '\n');
                      e.target.value = '';
                    }
                  }}
                />
                <button style={s.btn('#6366f1')} onClick={() => {
                  const el = document.getElementById('rawCmd');
                  if (el?.value.trim()) { sendRaw(el.value.trim() + '\n'); el.value = ''; }
                }}>Send</button>
                <button style={s.btn('var(--bg-secondary)', 'var(--text-muted)')} onClick={() => setTerminal([])}>Clear</button>
              </div>
            </>
          )}

          {rightTab === 'code' && (
            <>
              <div style={s.codeBox}>{generatedCode || '// Add blocks to generate code…'}</div>
              <div style={{ padding: 8, borderTop: '1px solid var(--border)', display: 'flex', gap: 6 }}>
                <button style={s.btn('#6366f1')} onClick={() => navigator.clipboard?.writeText(generatedCode).then(() => addTerminal('Code copied!', 'success'))}>
                  📋 Copy Code
                </button>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', alignSelf: 'center' }}>
                  {profile.name} format
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Flash progress overlay */}
      {flashProgress !== null && flashProgress !== 'done' && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, background: '#1e1b4b', border: '1px solid #6366f1', borderRadius: 12, padding: '14px 20px', minWidth: 260, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: '#e0e7ff' }}>⚡ Flashing to micro:bit...</div>
          <div style={{ background: '#312e81', borderRadius: 6, height: 8, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg,#6366f1,#a5b4fc)', width: `${flashProgress}%`, transition: 'width 0.3s ease', borderRadius: 6 }} />
          </div>
          <div style={{ fontSize: 12, color: '#a5b4fc', marginTop: 6, textAlign: 'right' }}>{flashProgress}%</div>
        </div>
      )}
    </div>
  );
}
