import React, { useState, useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import ScratchStyleBlock from './ScratchStyleBlock';
import UnifiedBlocklyWorkspace from './UnifiedBlocklyWorkspace';
import { resolveBlocklyNodeType } from '../utils/blocks';
import { BLOCK_STACK_GAP, columnizeBlocks } from '../utils/blockStack';
import { snapCanvasStack } from '../utils/blockSnap';
import { emitAddSidebarBlock } from '../utils/blockLibraryEvents';
import AppMode from '../utils/AppMode';
import { getFlashingInstructions, getTroubleshootingSteps } from '../utils/simpleMicrobitFlash';
import {
  getMicrobitFlashCoordinator,
  checkBrowserSupport,
  isElectronNative,
  validateHex,
  getHexInfo,
  isUniversalHex,
  separateUniversalHex,
  microbitBoardId,
  getWebBluetoothStatus,
  buildMicroPythonBootHex,
  buildBleBridgeHex,
  connectMicrobitWireless,
} from '@flash/index.js';
import { flashMicrobitHex, requestMicrobitUsbEarly } from '@flash/flashMicrobit.js';
import { formatSignalBars } from '@flash/microbitWebBle.js';
import { connectQuarkyWireless } from '@flash/quarkyWebBle.js';
import { validateHexStrict } from '@flash/hexValidationStrict.js';
import MicrobitDualFlashPanel from './MicrobitDualFlashPanel.jsx';
import {
  ROBOT_COMMANDS, darkenHex, ROBOT_PROFILES, ROBOT_BOARD_EXTENSIONS, getRobotCommandsForBoard, MICROBIT_KIT_SETUPS,
  requestRobotSerialPort, QUARKY_HELPER_SCRIPT, MICROBIT_FALLBACKS, generateFullProgram, generateQuarkyProgram, generateQuarkyPictoBloxProgram,
} from '../utils/robotProfiles.js';
import { compileForRuntime, RUNTIME_KIT } from '../utils/runtimeCompiler.js';
import { EmojiIcon, IconText } from './ui/Icon.jsx';

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

/** Build universal MicroPython hex in the browser (works on production without localhost). */
async function buildMicrobitHexInBrowser(pythonCode, onStatus) {
  onStatus?.('📦 Loading MicroPython runtime…');
  const [{ MicropythonFsHex, microbitBoardId: mbId }, hexV1, hexV2] = await Promise.all([
    import('@microbit/microbit-fs'),
    _idbCache('micropython_v1', () =>
      fetch('/micropython-v1.hex').then((r) => {
        if (!r.ok) throw new Error('Could not load micropython-v1.hex');
        return r.text();
      }),
    ),
    _idbCache('micropython_v2', () =>
      fetch('/micropython-v2.hex').then((r) => {
        if (!r.ok) throw new Error('Could not load micropython-v2.hex');
        return r.text();
      }),
    ),
  ]);

  onStatus?.('⚙️ Compiling your program…');
  const fs = new MicropythonFsHex([
    { hex: hexV1, boardId: mbId.V1 },
    { hex: hexV2, boardId: mbId.V2 },
  ]);
  fs.write('main.py', pythonCode);
  const hex = fs.getUniversalHex();
  onStatus?.(`✅ Program built (${(hex.length / 1024).toFixed(0)} KB universal hex)`);
  return hex;
}

/** Optional local dev server fallback (node build-hex-server.mjs). */
async function buildMicrobitHexViaServer(pythonCode, onStatus) {
  onStatus?.('📦 Building via local hex server (localhost:3456)…');
  const response = await fetch('http://localhost:3456/api/build-hex', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pythonCode }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || response.statusText || 'Hex server error');
  }
  const result = await response.json();
  if (!result.success) throw new Error(result.error || 'Hex build failed');
  return result.hex;
}

async function buildMicrobitHex(pythonCode, onStatus) {
  try {
    return await buildMicrobitHexInBrowser(pythonCode, onStatus);
  } catch (browserErr) {
    onStatus?.(`⚠️ In-browser build failed: ${browserErr.message}`);
    try {
      return await buildMicrobitHexViaServer(pythonCode, onStatus);
    } catch (serverErr) {
      throw new Error(
        `Could not build program hex. ${browserErr.message}. ` +
          (serverErr.message?.includes('fetch')
            ? 'Start optional dev server: node build-hex-server.mjs'
            : serverErr.message),
      );
    }
  }
}

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
const TRACKS = [
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
  const audioCtxRef = useRef(null);
  const activeOscRef = useRef([]);

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
  const NOTE_FREQ = {
    C3: 131, D3: 147, E3: 165, F3: 175, G3: 196, A3: 220, B3: 247,
    C4: 262, D4: 294, E4: 330, F4: 349, G4: 392, A4: 440, B4: 494, C5: 523, E5: 659,
  };

  const getAudioCtx = () => {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      if (!audioCtxRef.current) audioCtxRef.current = new Ctx();
      if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
      return audioCtxRef.current;
    } catch (e) {
      return null;
    }
  };

  const playTone = (freq = 440, seconds = 0.25) => {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    const dur = Math.max(0.05, Number(seconds) || 0.25);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(Number(freq) || 440, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + dur + 0.01);
    activeOscRef.current.push({ osc, gain });
    osc.onended = () => {
      activeOscRef.current = activeOscRef.current.filter((n) => n.osc !== osc);
    };
  };

  const playMelody = (name = 'happy') => {
    const tunes = {
      happy: ['C4', 'E4', 'G4', 'C5'],
      sad: ['C4', 'A3', 'G3', 'E3'],
      power_up: ['C4', 'E4', 'G4', 'C5', 'E5'],
      siren: ['A4', 'E4', 'A4', 'E4'],
      birthday: ['C4', 'C4', 'D4', 'C4', 'F4', 'E4'],
      twinkle: ['C4', 'C4', 'G4', 'G4', 'A4', 'A4', 'G4'],
    };
    const seq = tunes[String(name || '').toLowerCase()] || tunes.happy;
    seq.forEach((note, idx) => {
      setTimeout(() => playTone(NOTE_FREQ[note] || 440, 0.22), idx * 180);
    });
  };

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
      if (id === 'buzz') { playTone(440, parseFloat(params?.secs || 0.5)); resolve(); return; }
      if (id === 'play_note') { playTone(NOTE_FREQ[String(params?.note || 'C4').toUpperCase()] || 262, parseFloat(params?.secs || 0.5)); resolve(); return; }
      if (id === 'play_melody') { playMelody(params?.melody || 'happy'); resolve(); return; }
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
      if (id === 'display' || id === 'disp_scroll' || id === 'show_num') {
        const txt = params?.text || String(params?.num ?? '') || '';
        updateOut({ displayText: txt, displayIcon: null, ledMatrix: Array(25).fill(0) });
        setTimeout(resolve, Math.max(600, txt.length * 120)); return;
      }
      if (id === 'show_icon') {
        const icon = params?.icon || 'HAPPY';
        const matrix = MB_ICONS[icon] || Array(25).fill(0);
        updateOut({ displayIcon: icon, displayText: '', ledMatrix: matrix });
        setTimeout(resolve, 800); return;
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
          <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, width: 78 }}><EmojiIcon e="💡" style={{ marginRight: '0.35em' }} />Headlights</span>
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
            <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, width: 78 }}><EmojiIcon e="🌈" style={{ marginRight: '0.35em' }} />NeoPixels</span>
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


/* ─── Main RobotPanel component ─── */
function BoardPicture({ board, style }) {
  const common = { viewBox: '0 0 180 92', role: 'img', 'aria-label': `${ROBOT_PROFILES[board]?.name || board} board`, style };
  if (board === 'microbit') return <svg {...common}>
    <rect x="36" y="5" width="108" height="82" rx="13" fill="#087c72" stroke="#38d4bd" strokeWidth="3" />
    <rect x="43" y="12" width="94" height="68" rx="8" fill="#10a58f" />
    {Array.from({ length: 25 }, (_, i) => <circle key={i} cx={62 + (i % 5) * 14} cy={29 + Math.floor(i / 5) * 12} r="2.8" fill="#d7fff5" opacity={i % 3 ? .88 : .52} />)}
    <circle cx="51" cy="67" r="7" fill="#e34463" stroke="#ff9dad" strokeWidth="2" /><circle cx="129" cy="67" r="7" fill="#e34463" stroke="#ff9dad" strokeWidth="2" />
    <path d="M54 87v5m18-5v5m18-5v5m18-5v5m18-5v5" stroke="#d8dce7" strokeWidth="3" strokeLinecap="round" />
  </svg>;
  if (board === 'mbot') return <svg {...common}>
    <rect x="34" y="30" width="112" height="47" rx="17" fill="#168ac0" stroke="#50c7f2" strokeWidth="3" />
    <rect x="49" y="37" width="82" height="31" rx="11" fill="#27a8d8" />
    <circle cx="42" cy="55" r="22" fill="#212b3b" stroke="#596579" strokeWidth="4" /><circle cx="138" cy="55" r="22" fill="#212b3b" stroke="#596579" strokeWidth="4" />
    <circle cx="42" cy="55" r="8" fill="#8c9aad" /><circle cx="138" cy="55" r="8" fill="#8c9aad" />
    <rect x="72" y="21" width="36" height="16" rx="5" fill="#1c2c41" stroke="#90a4ba" strokeWidth="2" />
    <circle cx="80" cy="29" r="3" fill="#e7f3ff" /><circle cx="100" cy="29" r="3" fill="#e7f3ff" />
    <rect x="82" y="46" width="16" height="12" rx="3" fill="#f6c94a" /><path d="M90 47v10m-6-5h12" stroke="#775615" strokeWidth="2" />
    <path d="M55 76v8m70-8v8" stroke="#ffca55" strokeWidth="4" strokeLinecap="round" />
  </svg>;
  if (board === 'arduino') return <svg {...common}>
    <path d="M40 12h91l12 12v51l-10 8H43l-8-9V23z" fill="#08759a" stroke="#43c9df" strokeWidth="3" />
    <rect x="40" y="32" width="23" height="34" rx="3" fill="#c9d1dc" /><rect x="44" y="36" width="15" height="25" rx="2" fill="#667385" />
    <rect x="75" y="28" width="35" height="29" rx="3" fill="#202a37" stroke="#748396" strokeWidth="2" />
    <rect x="82" y="63" width="25" height="12" rx="2" fill="#263240" />
    <circle cx="126" cy="65" r="5" fill="#e44a52" /><circle cx="68" cy="20" r="3" fill="#e8c456" />
    {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={72 + i * 8} cy="77" r="2" fill="#f4d36a" />)}
    {Array.from({ length: 6 }, (_, i) => <circle key={i} cx="135" cy={28 + i * 7} r="2" fill="#f4d36a" />)}
  </svg>;
  return <svg {...common}>
    <path d="M49 8h82l12 12v52l-11 11H48L37 72V20z" fill="#6946c4" stroke="#b2a0ff" strokeWidth="3" />
    <path d="M51 15h78v60H51z" fill="#7958df" />
    <rect x="68" y="26" width="42" height="31" rx="4" fill="#29243d" stroke="#b9a7ff" strokeWidth="2" />
    {Array.from({ length: 15 }, (_, i) => <circle key={i} cx={76 + (i % 5) * 7} cy={34 + Math.floor(i / 5) * 7} r="1.7" fill={i % 4 === 0 ? '#ffd45c' : '#d9d3ff'} />)}
    <rect x="57" y="26" width="6" height="22" rx="2" fill="#d8d3e9" /><rect x="116" y="27" width="7" height="21" rx="2" fill="#3b3158" />
    <circle cx="59" cy="62" r="4" fill="#50dfbf" /><circle cx="121" cy="62" r="4" fill="#ffcd54" />
    <rect x="78" y="65" width="27" height="6" rx="2" fill="#34275c" />
    <path d="M48 82v7m15-7v7m15-7v7m15-7v7m15-7v7m15-7v7" stroke="#d8dce7" strokeWidth="3" strokeLinecap="round" />
  </svg>;
}

export default function RobotPanel({ onNavigate }) {
  const [connected, setConnected] = useState(false);
  const [connectionKind, setConnectionKind] = useState(null); // 'usb' | 'bluetooth'
  const [connecting, setConnecting] = useState(false);
  const [portInfo, setPortInfo] = useState(null);
  const [robotType, setRobotType] = useState(() => {
    const saved = localStorage.getItem('cv_robotlab_board');
    return saved && ROBOT_PROFILES[saved] ? saved : 'microbit';
  });
  const [showBoardMenu, setShowBoardMenu] = useState(false);
  const [microbitKit, setMicrobitKit] = useState(() => localStorage.getItem('cv_mb_kit') || 'generic');
  /** WebUSB flashes a single-board hex; universal .hex is split using V1 vs V2 here. */
  const [microbitHw, setMicrobitHw] = useState(() => localStorage.getItem('cv_mb_hw') || 'v2');
  const [program, setProgram] = useState(() => {
    try { const s = localStorage.getItem('cv_robotlab_program'); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [terminal, setTerminal] = useState([]);
  const [running, setRunning] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [flashProgress, setFlashProgress] = useState(null); // null=idle, 0-100+=flashing, 'done'=complete
  const [rightTab, setRightTab] = useState('virtual');
  const [firmwareOk, setFirmwareOk] = useState(null); // null=unknown, true=microPython, false=makecode
  const [showCode, setShowCode] = useState(false);
  const [ledColor, setLedColor] = useState('off');
  const [editingIdx, setEditingIdx] = useState(null);
  const [simRobotType, setSimRobotType] = useState(() => localStorage.getItem('cv_robotlab_robottype') || 'rover');
  const [simTrack, setSimTrack] = useState(() => localStorage.getItem('cv_robotlab_track') || 'open');
  const [simFs, setSimFs] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [flashMethod, setFlashMethod] = useState(null); // 'usb', 'bluetooth', or null
  const [activeBlockUid, setActiveBlockUid] = useState(null);

  const portRef = useRef(null);
  const robotRef = useRef(null);
  const simFsRef = useRef(null);
  const writerRef = useRef(null);
  const readerRef = useRef(null);
  const serialProtoRef = useRef(0);     // 2 = mBot/Arduino sketch that replies OK / V:value
  const pendingReplyRef = useRef(null); // waiting for that reply
  const runtimeRef = useRef(null);      // ByteBuddies Runtime on the micro:bit: { kit, board }
  const terminalRef = useRef(null);
  const connectedRef = useRef(false);
  const firmwareOkRef = useRef(null); // mirrors firmwareOk state for use inside async closures
  const rawReplDoneRef = useRef(null); // resolves when micro:bit raw REPL sends \x04\x04 completion
  const serialSniffRef = useRef(null); // { pattern, resolve } — used for firmware detection
  const bridgeModeRef  = useRef(false); // true when USB is connected to pxt bridge firmware (not MicroPython)
  const bleKeepaliveRef = useRef(null); // interval id for BLE GATT keepalive pings

  // BLE — Nordic UART (NUS). ByteBuddies firmware uses B5B3; MakeCode uses B5A3 — support both.
  const BLE_NUS_VARIANTS = [
    {
      service: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
      write: '6e400002-b5a3-f393-e0a9-e50e24dcca9e',
      notify: '6e400003-b5a3-f393-e0a9-e50e24dcca9e',
    },
    {
      service: '6e400001-b5b3-f393-e0a9-e50e24dcca9e',
      write: '6e400002-b5b3-f393-e0a9-e50e24dcca9e',
      notify: '6e400003-b5b3-f393-e0a9-e50e24dcca9e',
    },
  ];
  const BLE_NUS_ALL_SERVICES = BLE_NUS_VARIANTS.map((v) => v.service);
  const matchBleNusVariant = (serviceUuid) => {
    const u = String(serviceUuid || '').toLowerCase();
    if (u.includes('6e400001-b5b3')) return BLE_NUS_VARIANTS[1];
    if (u.includes('6e400001-b5a3')) return BLE_NUS_VARIANTS[0];
    return null;
  };
  // micro:bit swaps the Nordic UART roles — choose characteristics by what they can do
  const pickNusCharacteristics = (allChars) => {
    const norm = (u) => String(u || '').toLowerCase().replace(/-/g, '');
    const nus = allChars.filter((c) => /6e40000[23]/.test(norm(c.uuid)));
    const pool = nus.length ? nus : allChars;
    const canWrite = (c) => c.properties.write || c.properties.writeWithoutResponse;
    const canNotify = (c) => c.properties.notify || c.properties.indicate;
    const writeChar = pool.find((c) => canWrite(c) && !canNotify(c)) || pool.find(canWrite);
    const notifyChar = pool.find((c) => canNotify(c) && c !== writeChar) || pool.find(canNotify);
    return { writeChar, notifyChar };
  };
  const btDeviceRef     = useRef(null);
  const btWriteCharRef  = useRef(null);
  const btNotifyCharRef = useRef(null);
  const btUartServiceRef = useRef(null);
  const btUartRef = useRef(null);
  const connectionTypeRef = useRef(null); // 'usb' | 'bluetooth'
  const bleBufferRef    = useRef('');

  const profile = ROBOT_PROFILES[robotType];
  const boardExtension = ROBOT_BOARD_EXTENSIONS[robotType];
  const boardCommands = getRobotCommandsForBoard(robotType);
  // The exact sketch users download, so the preview can never drift from it
  const [sketchSource, setSketchSource] = useState('');
  useEffect(() => {
    const url = profile?.sketchUrl;
    if (!url) { setSketchSource(profile?.setupCode || ''); return undefined; }
    let alive = true;
    fetch(url).then((r) => r.text()).then((t) => { if (alive) setSketchSource(t); }).catch(() => {});
    return () => { alive = false; };
  }, [robotType]);


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
  /** Device-specific steps for copying a .hex onto the micro:bit by hand. */
  const showCopySteps = (file) => {
    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
    if (ios || /Android/.test(ua)) {
      addTerminal(`📱 ${ios ? 'iPad / iPhone' : 'Android'}: install the free “micro:bit” app, then open ${file} from Downloads → Share → micro:bit → Flash.`, 'info');
      addTerminal('   The app sends it over Bluetooth — follow its pairing steps (hold A+B, press reset).', 'info');
    } else if (/Windows/.test(ua)) {
      addTerminal(`💻 Windows: open File Explorer, then drag ${file} from Downloads onto the MICROBIT drive.`, 'info');
    } else if (/CrOS/.test(ua)) {
      addTerminal(`💻 Chromebook: open the Files app, then drag ${file} from Downloads onto MICROBIT.`, 'info');
    } else {
      addTerminal(`💻 Mac / Linux: drag ${file} from Downloads onto the MICROBIT drive (Finder → Locations on a Mac).`, 'info');
    }
    addTerminal('   The yellow light flashes while it copies. When it stops, the micro:bit restarts by itself.', 'info');
  };

  const attachRuntime = async (hello) => {
    const [, , , board = 'v2', saved = '0'] = hello.split(':');
    runtimeRef.current = { board, saved: Number(saved) || 0 };
    setFirmwareOk(true);
    firmwareOkRef.current = true;
    const want = RUNTIME_KIT[microbitKit];
    if (want === null) addTerminal('⚠️ This robot kit is not supported by ByteBuddies Runtime yet. Its motors may not work correctly. Choose a supported kit in Robot Lab, or use the MicroPython connection instead.', 'error');
    await serialAsk(`KIT ${want || 'generic'}\n`, 2500);
    addTerminal(`✅ ByteBuddies Runtime found (micro:bit ${board.toUpperCase()}). Press ▶ Run — your program is sent and saved on the micro:bit.`, 'success');
    if (board === 'v1') addTerminal('ℹ️ micro:bit V1 runs the runtime over USB only (no room for Bluetooth). Melodies, follow-line and avoid-walls are V2 only.', 'info');
  };

  /** Replies from mBot/Arduino sketches and the ByteBuddies Runtime. Returns true if handled. */
  const routeLine = (clean) => {
    if (/^(OK|V:|BB:|ERR)/.test(clean)) {
      const pending = pendingReplyRef.current;
      if (pending) { pendingReplyRef.current = null; pending.resolve(clean); }
      return true;
    }
    if (clean === 'DONE') { if (runtimeRef.current) addTerminal('🏁 Program finished on the micro:bit', 'success'); return true; }
    if (clean.startsWith('LOG:')) { addTerminal(`🤖 micro:bit says: ${clean.slice(4)}`, 'recv'); return true; }
    return false;
  };

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
      if (routeLine(clean)) return;
      if (clean && !clean.includes('\x04')) addTerminal(`← ${clean}`, 'recv');
    });
    bleBufferRef.current = buffer;
  }, [addTerminal]);

  const connectBluetooth = async () => {
    const bleStatus = getWebBluetoothStatus();
    if (!bleStatus.available) {
      addTerminal(`❌ ${bleStatus.message}`, 'error');
      if (bleStatus.currentUrl) addTerminal(`   Current page: ${bleStatus.currentUrl}`, 'info');
      return;
    }
    if (connectedRef.current && connectionTypeRef.current === 'usb') {
      addTerminal('🔌 Disconnecting USB so Bluetooth can work…', 'info');
      await disconnect();
      await new Promise((r) => setTimeout(r, 600));
    }
    setConnecting(true);
    let quarkyBleReady = false;
    try {
      addTerminal('📡 Unplug USB after flash, press reset, then connect here.', 'info');

      const conn = robotType === 'quarky'
        ? await connectQuarkyWireless((m) => addTerminal(`  ${m}`, 'info'))
        : await connectMicrobitWireless((m) => addTerminal(`  ${m}`, 'info'));
      const device = conn.device;
      btUartRef.current = conn;
      btDeviceRef.current = device;

      const isProfile = conn.mode === 'profile' && conn.uartService;
      btUartServiceRef.current = isProfile ? conn.uartService : null;
      btWriteCharRef.current = conn.writeChar || null;
      btNotifyCharRef.current = conn.notifyChar || null;
      bridgeModeRef.current = !isProfile;

      const sig = conn.signal || { bars: 1, label: 'OK' };
      addTerminal(`📶 Signal ${formatSignalBars(sig.bars)} ${sig.label}`, 'info');

      device.addEventListener('gattserverdisconnected', () => {
        clearInterval(bleKeepaliveRef.current);
        bleKeepaliveRef.current = null;
        btUartRef.current?.disconnect?.();
        btUartRef.current = null;
        btWriteCharRef.current = null;
        btNotifyCharRef.current = null;
        btUartServiceRef.current = null;
        btDeviceRef.current = null;
        connectionTypeRef.current = null;
        connectedRef.current = false;
        firmwareOkRef.current = null;
        bridgeModeRef.current = false;
        setConnected(false);
        setConnectionKind(null);
        setFirmwareOk(null);
        addTerminal('🔌 Bluetooth disconnected', 'info');
      });

      if (isProfile) {
        conn.uartService.addEventListener('receiveText', (ev) => {
          const chunk = ev.detail || '';
          if (chunk) handleBleData({ target: { value: new TextEncoder().encode(chunk) } });
        });
        connectionTypeRef.current = 'bluetooth';
        runtimeRef.current = null;
        const hello = await serialAsk('HELLO\n', 2500);
        if (hello && hello.startsWith('BB:RT')) {
          await attachRuntime(hello);
        } else {
          addTerminal('✅ Connected — MakeCode Bluetooth (Cutebot bridge)', 'success');
          addTerminal('💡 For loops, sensors and saving programs over Bluetooth: ⚡ Flash → ⭐ ByteBuddies Runtime (once).', 'info');
          try {
            await conn.uartService.sendText('ping\n');
          } catch (_) { /* optional */ }
        }
      } else if (robotType === 'quarky') {
        connectionTypeRef.current = 'bluetooth';
        runtimeRef.current = null;
        conn.onNotify?.(handleBleData);
        addTerminal('🔎 Checking Quarky MicroPython over Bluetooth…', 'info');
        const waitForRepl = (ms = 3500) => new Promise((resolve) => {
          serialSniffRef.current = { pattern: 'raw REPL', resolve };
          setTimeout(() => {
            if (serialSniffRef.current?.pattern === 'raw REPL') {
              serialSniffRef.current = null;
              resolve(false);
            }
          }, ms);
        });
        let gotRepl = false;
        for (let attempt = 0; attempt < 4 && !gotRepl; attempt++) {
          await writeChunked('\x03\x03');
          await new Promise((r) => setTimeout(r, 180));
          await writeChunked('\x02');
          await new Promise((r) => setTimeout(r, 180));
          const ready = waitForRepl();
          await writeChunked('\x01');
          gotRepl = await ready;
        }
        if (!gotRepl) {
          addTerminal('⚠️ Bluetooth connected, but Quarky did not expose a MicroPython REPL over BLE UART.', 'warn');
          addTerminal('💡 Quarky BLE needs compatible MicroPython + Nordic UART firmware; its standard PictoBlox Bluetooth firmware uses a different protocol.', 'info');
        } else {
          const ready = new Promise((resolve) => {
            rawReplDoneRef.current = () => { rawReplDoneRef.current = null; resolve(true); };
            setTimeout(() => { if (rawReplDoneRef.current) { rawReplDoneRef.current = null; resolve(false); } }, 8000);
          });
          await writeChunked(QUARKY_HELPER_SCRIPT + '\x04');
          if (await ready) {
            quarkyBleReady = true;
            addTerminal('✅ Quarky MicroPython is ready over Bluetooth — press ▶ Run.', 'success');
          } else {
            addTerminal('⚠️ Connected, but Quarky did not finish loading the robot helpers.', 'warn');
          }
        }
      } else {
        conn.onNotify?.(handleBleData);
        addTerminal('✅ Connected — MicroPython Bluetooth bridge', 'success');
        bleBufferRef.current = '';
        addTerminal('📡 Ping test…', 'info');
        const testOk = await conn.ping?.();
        if (!testOk) {
          addTerminal('⚠️ No ping — flash via python.microbit.org (bytebuddies_cutebot_bluetooth.py)', 'warn');
        } else {
          addTerminal('✅ Link OK', 'success');
          const lines = [...(MICROBIT_KIT_SETUPS[microbitKit] || MICROBIT_KIT_SETUPS.generic), ...MICROBIT_FALLBACKS];
          let setupOk = 0;
          for (const line of lines) {
            bleBufferRef.current = '';
            rawReplDoneRef.current = null;
            const done = new Promise((resolve) => {
              rawReplDoneRef.current = () => { rawReplDoneRef.current = null; resolve(); };
              setTimeout(() => { if (rawReplDoneRef.current) { rawReplDoneRef.current = null; resolve(); } }, 5000);
            });
            await conn.writeBytes(line + '\x04');
            await done;
            setupOk++;
          }
          addTerminal(`🔬 Kit ready (${setupOk}/${lines.length} lines)`, 'success');
        }
      }

      connectionTypeRef.current = 'bluetooth';
      connectedRef.current = true;
      setConnected(true);
      setConnectionKind('bluetooth');
      const firmwareReady = robotType === 'quarky' ? quarkyBleReady : true;
      setFirmwareOk(firmwareReady);
      firmwareOkRef.current = firmwareReady;

      // Keep the GATT connection alive — OS/browser will drop it after ~30s of inactivity.
      clearInterval(bleKeepaliveRef.current);
      bleKeepaliveRef.current = setInterval(async () => {
        if (!connectedRef.current) { clearInterval(bleKeepaliveRef.current); return; }
        try {
          if (btUartServiceRef.current) {
            await btUartServiceRef.current.sendText('\n');
          } else if (btWriteCharRef.current) {
            await btWriteCharRef.current.writeValueWithoutResponse(new Uint8Array([0x00]));
          }
        } catch (_) { /* ignore — disconnect event will fire if link is truly gone */ }
      }, 20000);

      addTerminal('🤖 Bluetooth ready — press ▶ Run', 'success');
    } catch (e) {
      if (e.name === 'NotFoundError') {
        addTerminal('Bluetooth cancelled — no device chosen.', 'warn');
      } else if (e.name === 'SecurityError') {
        const st = getWebBluetoothStatus();
        addTerminal(`❌ ${st.message || 'Bluetooth blocked on this page.'}`, 'error');
      } else {
        addTerminal(`❌ Bluetooth: ${e.message}`, 'error');
        addTerminal('🔧 Flash wireless → LED shows B → unplug USB → reset → Connect Bluetooth', 'warn');
      }
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
      const port = await requestRobotSerialPort(robotType);
      // If port is already open (leftover from a previous session), close it first
      if (port.readable) {
        try {
          port.readable.cancel?.();
          port.writable.abort?.();
          await port.close();
        } catch (_) {}
        await new Promise(r => setTimeout(r, 200));
      }
      await port.open({
        baudRate: profile.baud,
        bufferSize: 1024,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        flowControl: 'none',
      });
      try {
        await port.setSignals({ dataTerminalReady: true, requestToSend: false });
      } catch (_) { /* some adapters do not support setSignals */ }
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
              if (routeLine(clean)) return; // replies are handled by the runner, not printed
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
      setConnectionKind('usb');

      if (robotType === 'arduino' || robotType === 'mbot') {
        addTerminal(`⏳ Waiting for ${profile.name} to reboot after USB connect…`, 'info');
        await new Promise((r) => setTimeout(r, 2200));
        serialProtoRef.current = 0;
        let hello = null;
        for (let attempt = 0; attempt < 3 && !hello; attempt++) hello = await serialAsk('PNG\n', 1200);
        if (hello && hello.startsWith('V:')) {
          serialProtoRef.current = 2;
          await serialAsk('STP\n', 1500);
          addTerminal(`✅ ${profile.name} connected — sensors, lights and sound ready. Press ▶ Run`, 'success');
        } else {
          try { await writerRef.current.write(new TextEncoder().encode('STP\n')); } catch (_) { /* ignore */ }
          addTerminal(`⚠️ Connected, but this ${profile.name} has an older ByteBuddies sketch (or none).`, 'warn');
          addTerminal(`⬇️ Download the ${profile.name} sketch from the Setup Guide and upload it once — then moves, sensors, lights and sound all work.`, 'info');
        }
      }

      // For micro:bit and Quarky: detect firmware then set up raw REPL if MicroPython is present
      if (robotType === 'microbit') {
        runtimeRef.current = null;
        await new Promise((r) => setTimeout(r, 400));
        let hello = null;
        for (let attempt = 0; attempt < 2 && !hello; attempt++) hello = await serialAsk('HELLO\n', 1200);
        if (hello && hello.startsWith('BB:RT')) {
          await attachRuntime(hello);
          addTerminal(`✅ Connected! (${profile.name})`, 'success');
          return;
        }
      }

      if (robotType === 'microbit' || robotType === 'quarky') {
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
          // Give the device time to boot MicroPython after a fresh flash or replug
          await new Promise(r => setTimeout(r, 1200));

          // Force exit any existing raw REPL first (Ctrl+B → interactive mode)
          // Without this, if already in raw REPL, \x01 produces no banner → detection fails
          await writeChunked('\x02');
          await new Promise(r => setTimeout(r, 400));

          // Enter raw REPL — up to 8 attempts (fresh flash / busy main.py needs extra tries)
          let gotRepl = false;
          for (let attempt = 0; attempt < 8 && !gotRepl; attempt++) {
            if (attempt > 0) await new Promise(r => setTimeout(r, 600));
            await writeChunked('\x03\x03');
            await new Promise(r => setTimeout(r, 200));
            await writeChunked('\x02');
            await new Promise(r => setTimeout(r, 300));
            const p = waitFor('raw REPL', 4000);
            await writeChunked('\x01');
            gotRepl = await p;
          }

          if (!gotRepl) {
            // No MicroPython REPL — check for ByteBuddies BLE bridge (exec ends with \\x04)
            rawReplDoneRef.current = null;
            const bridgeProbed = new Promise(resolve => {
              rawReplDoneRef.current = () => { rawReplDoneRef.current = null; resolve(true); };
              setTimeout(() => { if (rawReplDoneRef.current) { rawReplDoneRef.current = null; resolve(false); } }, 3000);
            });
            await writeChunked('ping()\x04');
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
          const kitLabel = robotType === 'quarky' ? 'Quarky' : 'kit';
          addTerminal(`✅ MicroPython detected — loading ${kitLabel}…`, 'success');

          if (robotType === 'quarky') {
            const done = new Promise((resolve) => {
              rawReplDoneRef.current = () => { rawReplDoneRef.current = null; resolve(); };
              setTimeout(() => { if (rawReplDoneRef.current) { rawReplDoneRef.current = null; resolve(); } }, 8000);
            });
            await writeChunked(QUARKY_HELPER_SCRIPT + '\x04');
            await done;
            addTerminal('🔬 Quarky motors and lights ready — Press ▶ Run!', 'success');
          } else {
          // Step 3: send kit setup lines one by one via raw REPL
          // Device stays in raw REPL between executions — just send each line + \x04.
          const lines = [...(MICROBIT_KIT_SETUPS[microbitKit] || MICROBIT_KIT_SETUPS.generic), ...MICROBIT_FALLBACKS];
          let setupOk = 0;
          for (const line of lines) {
            const done = new Promise(resolve => {
              rawReplDoneRef.current = resolve;
              setTimeout(resolve, 4000);
            });
            await writeChunked(line + '\x04');
            await done;
            setupOk++;
          }
          addTerminal(`🔬 Kit ready (${setupOk}/${lines.length} lines sent) — Press ▶ Run!`, 'success');
          localStorage.setItem('cv_mb_kit', microbitKit);
          }
        } catch (e) {
          addTerminal(`⚠️ Setup error: ${e.message}`, 'warn');
        }
      }

      addTerminal(`✅ Connected! (${profile.name})`, 'success');
      if (robotType === 'microbit' || robotType === 'quarky') addTerminal('💡 Press ▶ Run to send your program — no need to re-flash each time!', 'info');
    } catch (e) {
      if (e.name !== 'NotFoundError') addTerminal(`❌ ${e.message}`, 'error');
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = async () => {
    clearInterval(bleKeepaliveRef.current);
    bleKeepaliveRef.current = null;
    if (connectionTypeRef.current === 'bluetooth') {
      try { btUartRef.current?.disconnect(); } catch (_) {}
      btUartRef.current = null;
      btWriteCharRef.current = null;
      btNotifyCharRef.current = null;
      btUartServiceRef.current = null;
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
    serialProtoRef.current = 0;
    runtimeRef.current = null;
    pendingReplyRef.current?.resolve(null);
    pendingReplyRef.current = null;
    firmwareOkRef.current = null;
    bridgeModeRef.current = false;
    setConnected(false);
    setConnectionKind(null);
    setFirmwareOk(null);
    setPortInfo(null);
    addTerminal('🔌 Disconnected', 'info');
  };

  /* ─── Send data in chunks to avoid 64-byte UART buffer overflow ─── */
  const writeChunked = useCallback(async (data) => {
    const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
    if (connectionTypeRef.current === 'bluetooth') {
      if (btUartServiceRef.current) {
        const text = typeof data === 'string' ? data : new TextDecoder().decode(bytes);
        await btUartServiceRef.current.sendText(text);
        return;
      }
      if (!btWriteCharRef.current) return;
      for (let i = 0; i < bytes.length; i += 20) {
        try { await btWriteCharRef.current.writeValueWithoutResponse(bytes.slice(i, i + 20)); }
        catch (_) {
          try { await btWriteCharRef.current.writeValue(bytes.slice(i, i + 20)); }
          catch (e) { addTerminal(`BLE write error: ${e.message}`, 'warn'); break; }
        }
        if (i + 20 < bytes.length) await new Promise(r => setTimeout(r, 25));
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

  /* ─── Send Python to micro:bit (raw REPL over USB, or \\x04-exec over BLE bridge) ─── */
  const sendMicrobitRaw = useCallback(async (code, opts = {}) => {
    if (!writerRef.current && !btWriteCharRef.current && !btUartServiceRef.current) return false;
    try {
      const trimmed = code.trim();
      if (!trimmed) return true;

      const isBridge = bridgeModeRef.current;
      const isProfileBt = btUartServiceRef.current && !isBridge;
      const timeoutMs = opts.timeoutMs ?? (isBridge ? 45000 : 15000);

      if (isProfileBt) {
        const line = trimmed.replace(/\r\n$/, '').replace(/\r$/, '');
        if (!opts.quiet) addTerminal('▶ Sending via Bluetooth…', 'info');
        await writeChunked(line + '\n');
        await new Promise((r) => setTimeout(r, 400));
        if (!opts.quiet) addTerminal('✅ Sent', 'success');
        return true;
      }

      rawReplDoneRef.current = null;

      if (!isBridge) {
        await writeChunked('\x03\x03');
        await new Promise(r => setTimeout(r, 200));
      }

      const done = new Promise((resolve, reject) => {
        rawReplDoneRef.current = resolve;
        setTimeout(() => { rawReplDoneRef.current = null; reject(new Error('timeout')); }, timeoutMs);
      });
      await writeChunked(trimmed + '\x04');
      if (!opts.quiet) addTerminal('▶ Sending program…', 'info');
      await done;
      if (!opts.quiet) addTerminal('✅ Program sent', 'success');
      return true;
    } catch (e) {
      addTerminal(`❌ Send error: ${e.message}`, 'error');
      return false;
    }
  }, [writeChunked, addTerminal]);

  /* ─── mBot / Arduino: send one line and wait for the robot's reply ─── */
  const estimateMs = (line) => {
    const [c, a, b] = line.trim().split(':');
    const n = Number(a) || 0;
    switch (c) {
      case 'FWD': case 'BWD': return n * 10;
      case 'LFT': case 'RGT': case 'SPL': case 'SPR': return n * 5;
      case 'DLY': case 'BZZ': return n;
      case 'NTE': return Number(b) || 0;
      case 'SWP': return (Math.abs((Number(b) || 0) - n) / 2) * 15 + 300;
      case 'SRV': return 300;
      default: return 0;
    }
  };
  const serialAsk = async (line, timeoutMs) => {
    const ble = connectionTypeRef.current === 'bluetooth';
    if (!ble && !writerRef.current) return null;
    const wait = new Promise((resolve) => {
      let timer = null;
      const done = (v) => { clearTimeout(timer); resolve(v); };
      pendingReplyRef.current = { resolve: done };
      timer = setTimeout(() => {
        if (pendingReplyRef.current?.resolve === done) pendingReplyRef.current = null;
        resolve(null);
      }, timeoutMs ?? estimateMs(line) + 2500);
    });
    try {
      if (ble && btUartServiceRef.current) await btUartServiceRef.current.sendText(line);
      else if (ble) await writeChunked(line);
      else {
        await writerRef.current.ready;
        await writerRef.current.write(new TextEncoder().encode(line));
      }
    } catch (e) {
      addTerminal(`❌ Send error: ${e.message}`, 'error');
      pendingReplyRef.current?.resolve(null);
      return null;
    }
    if (!/^(Q|PNG|HELLO|L |KIT|BEGIN)/.test(line)) addTerminal(`→ ${line.trim()}`, 'send');
    const reply = await wait;
    if (reply === null && runningRef.current) addTerminal(`⚠️ ${profile.name} didn’t answer “${line.trim()}” — check the cable and that the latest sketch is uploaded.`, 'warn');
    return reply;
  };

  /* ─── Send raw command ─── */
  const sendRaw = async (text) => {
    if (connectionTypeRef.current === 'bluetooth' && btUartServiceRef.current) {
      try {
        const line = text.trim().replace(/\r\n$/, '') + '\n';
        await btUartServiceRef.current.sendText(line);
        addTerminal(`→ ${line.trim()}`, 'send');
        return true;
      } catch (e) {
        addTerminal(`❌ BLE send: ${e.message}`, 'error');
        return false;
      }
    }
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

  const sendLive = async (cmd, params = {}) => {
    const text = profile.buildCmd(cmd, params);
    if (!text) return;
    if (robotType === 'microbit' || robotType === 'quarky') {
      await sendMicrobitRaw(text, { quiet: true });
      return;
    }
    await sendRaw(text);
  };

  /* ─── Run program ─── */
  const runningRef = useRef(false);
  const runtimeVarsRef = useRef({});
  const numOr = (v, fallback = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };
  const resolveVarValue = (raw) => {
    if (raw === undefined || raw === null) return 0;
    const s = String(raw).trim();
    if (s in runtimeVarsRef.current) return numOr(runtimeVarsRef.current[s], 0);
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  };
  const evalSimpleExpr = (expr) => {
    const source = String(expr || '0');
    const substituted = source.replace(/[A-Za-z_]\w*/g, (name) => {
      if (name in runtimeVarsRef.current) return String(numOr(runtimeVarsRef.current[name], 0));
      return '0';
    });
    if (!/^[\d+\-*/%().\s]+$/.test(substituted)) return 0;
    try {
      // eslint-disable-next-line no-new-func
      const out = Function(`return (${substituted})`)();
      return numOr(out, 0);
    } catch {
      return 0;
    }
  };
  const applyRuntimeMathAndVars = (step) => {
    const p = step?.params || {};
    switch (step?.id) {
      case 'var_set': {
        runtimeVarsRef.current[String(p.name || 'x')] = numOr(p.val, 0);
        break;
      }
      case 'var_inc': {
        const k = String(p.name || 'x');
        runtimeVarsRef.current[k] = numOr(runtimeVarsRef.current[k], 0) + numOr(p.val, 1);
        break;
      }
      case 'var_dec': {
        const k = String(p.name || 'x');
        runtimeVarsRef.current[k] = numOr(runtimeVarsRef.current[k], 0) - numOr(p.val, 1);
        break;
      }
      case 'math_random': {
        const k = String(p.var || 'n');
        const min = Math.floor(numOr(p.min, 1));
        const max = Math.floor(numOr(p.max, 10));
        const lo = Math.min(min, max);
        const hi = Math.max(min, max);
        const value = Math.floor(Math.random() * (hi - lo + 1)) + lo;
        runtimeVarsRef.current[k] = value;
        addTerminal(`🧮 ${k} = ${value}`, 'recv');
        break;
      }
      case 'math_abs': {
        const k = String(p.var || 'x');
        const value = Math.abs(resolveVarValue(p.src || k));
        runtimeVarsRef.current[k] = value;
        addTerminal(`🧮 ${k} = ${value}`, 'recv');
        break;
      }
      case 'math_map': {
        const k = String(p.var || 'mapped');
        const src = resolveVarValue(p.src || 'x');
        const low1 = numOr(p.low1, 0);
        const hi1 = numOr(p.hi1, 100);
        const low2 = numOr(p.low2, 0);
        const hi2 = numOr(p.hi2, 1023);
        const denom = (hi1 - low1) || 1;
        const value = Math.round(((src - low1) * (hi2 - low2)) / denom + low2);
        runtimeVarsRef.current[k] = value;
        addTerminal(`🧮 ${k} = ${value}`, 'recv');
        break;
      }
      case 'math_constrain': {
        const k = String(p.var || 'x');
        const min = numOr(p.min, 0);
        const max = numOr(p.max, 100);
        const value = Math.max(Math.min(resolveVarValue(k), Math.max(min, max)), Math.min(min, max));
        runtimeVarsRef.current[k] = value;
        addTerminal(`🧮 ${k} = ${value}`, 'recv');
        break;
      }
      case 'math_expr': {
        const k = String(p.var || 'x');
        const value = evalSimpleExpr(p.expr || '0');
        runtimeVarsRef.current[k] = value;
        addTerminal(`🧮 ${k} = ${value}`, 'recv');
        break;
      }
      case 'var_show': {
        const k = String(p.name || 'x');
        const value = k in runtimeVarsRef.current ? runtimeVarsRef.current[k] : '(undefined)';
        addTerminal(`📊 ${k} = ${value}`, 'recv');
        break;
      }
      default:
        break;
    }
  };
  /* ─── Block runner ───────────────────────────────────────────────────────
     Loops, ifs and whiles nest properly (depth-matched ends). On mBot/Arduino
     every block waits for the robot's "OK", and sensor blocks ask the robot
     for real readings. */
  const OPEN_FOR_END = {
    repeat_end: ['repeat', 'forever'], for_end: ['for_range'], while_end: ['while_do'],
    if_end: ['if_then', 'if_dist', 'if_line', 'if_btn_a', 'if_btn_b', 'if_touch', 'if_shake', 'if_tilt', 'if_light', 'if_temp', 'if_compass'],
  };
  const END_FOR = {};
  Object.entries(OPEN_FOR_END).forEach(([end, opens]) => opens.forEach((o) => { END_FOR[o] = end; }));
  const findEnd = (blocks, i) => {
    const end = END_FOR[blocks[i].id];
    let depth = 0;
    for (let j = i + 1; j < blocks.length; j++) {
      const id = blocks[j].id;
      if (END_FOR[id] === end) depth++;
      else if (id === end) { if (depth === 0) return j; depth--; }
    }
    return -1;
  };
  const compare = (a, op, b) => {
    switch (op) {
      case '>': return a > b; case '=': case '==': return a === b; case '!=': return a !== b;
      case '<=': return a <= b; case '>=': return a >= b; default: return a < b;
    }
  };
  const serialBoard = () => (robotType === 'mbot' || robotType === 'arduino') && serialProtoRef.current === 2;
  const query = async (cmd) => {
    const r = await serialAsk(`${cmd}\n`, 2500);
    if (!r || !r.startsWith('V:')) return null;
    return r.slice(2).split(':').map(Number);
  };
  /** Read a sensor: real value from mBot/Arduino, otherwise a pretend value for the simulator. */
  const readSensor = async (kind, step) => {
    if (connectedRef.current && serialBoard()) {
      if (kind === 'dist') return (await query('QDS'))?.[0] ?? 400;
      if (kind === 'line') return (await query('QLN')) || [0, 0];
      if (kind === 'light') return (await query('QLT'))?.[0] ?? 0;
      if (kind === 'btn_a') return (await query('QBA'))?.[0] ?? 0;
      if (kind === 'btn_b') return (await query('QBB'))?.[0] ?? 0;
      if (kind === 'touch') return (await query(`QTP:${step?.params?.pin || 0}`))?.[0] ?? 0;
    }
    return { dist: 15, line: [1, 1], light: 50, btn_a: 1, btn_b: 1, touch: 1 }[kind];
  };
  const unsupportedNote = useRef(new Set());
  const noteOnce = (msg) => { if (!unsupportedNote.current.has(msg)) { unsupportedNote.current.add(msg); addTerminal(msg, 'warn'); } };
  /** Is this condition true right now? */
  const testCondition = async (step) => {
    const p = step.params || {};
    const live = connectedRef.current && serialBoard();
    switch (step.id) {
      case 'if_then': case 'else_if': case 'while_do':
        return compare(resolveVarValue(p.cond), p.op || '<', resolveVarValue(p.val));
      case 'if_dist': return (await readSensor('dist')) < numOr(p.cm, 20);
      case 'if_line': { const [l, r] = await readSensor('line'); return !!(l || r); }
      case 'if_btn_a': return !!(await readSensor('btn_a'));
      case 'if_btn_b': return !!(await readSensor('btn_b'));
      case 'if_touch': return !!(await readSensor('touch', step));
      case 'if_light': return (await readSensor('light')) < numOr(p.val, 100);
      default:
        if (live) { noteOnce(`ℹ️ ${profile.name} has no sensor for “${step.id.replace('if_', '')}” — that check counts as false.`); return false; }
        return true; // simulator: show what the body does
    }
  };

  const executeBlocks = async (blocks, simOnly = false) => {
    let i = 0;
    while (i < blocks.length) {
      if (!runningRef.current) return 'stop';
      const step = blocks[i];
      const live = connectedRef.current && !simOnly;

      if (step.id === 'break') return 'break';

      if (step.id === 'repeat' || step.id === 'forever' || step.id === 'for_range' || step.id === 'while_do') {
        const endIdx = findEnd(blocks, i);
        const body = endIdx === -1 ? blocks.slice(i + 1) : blocks.slice(i + 1, endIdx);
        setActiveBlockUid(step.uid);
        if (step.id === 'for_range') {
          const name = String(step.params?.var || 'i');
          const from = Math.round(resolveVarValue(step.params?.from ?? 0));
          const to = Math.round(resolveVarValue(step.params?.to ?? 5));
          for (let t = from; t <= to && runningRef.current; t++) {
            runtimeVarsRef.current[name] = t;
            if (await executeBlocks(body, simOnly) === 'break') break;
          }
        } else if (step.id === 'while_do') {
          let guard = 0;
          while (runningRef.current && guard++ < 10000 && await testCondition(step)) {
            if (await executeBlocks(body, simOnly) === 'break') break;
            await new Promise((r) => setTimeout(r, 0));
          }
        } else {
          const times = step.id === 'forever' ? Infinity : Math.max(0, Math.round(resolveVarValue(step.params?.times ?? 1)));
          for (let t = 0; t < times && runningRef.current; t++) {
            if (await executeBlocks(body, simOnly) === 'break') break;
            await new Promise((r) => setTimeout(r, 0));
          }
        }
        i = endIdx === -1 ? blocks.length : endIdx + 1;
        continue;
      }

      if (OPEN_FOR_END.if_end.includes(step.id)) {
        const endIdx = findEnd(blocks, i);
        const all = endIdx === -1 ? blocks.slice(i + 1) : blocks.slice(i + 1, endIdx);
        // Split into branches at else_if / else that belong to THIS if (depth 0)
        const branches = [{ cond: step, body: [] }];
        let depth = 0;
        for (const b of all) {
          if (END_FOR[b.id]) depth++;
          else if (OPEN_FOR_END[b.id]) depth--;
          if (depth === 0 && b.id === 'else_if') { branches.push({ cond: b, body: [] }); continue; }
          if (depth === 0 && b.id === 'else_branch') { branches.push({ cond: null, body: [] }); continue; }
          branches[branches.length - 1].body.push(b);
        }
        setActiveBlockUid(step.uid);
        for (const br of branches) {
          if (br.cond === null || await testCondition(br.cond)) {
            const r = await executeBlocks(br.body, simOnly);
            if (r === 'break') return 'break';
            break;
          }
        }
        i = endIdx === -1 ? blocks.length : endIdx + 1;
        continue;
      }

      if (['on_start', 'else_branch', 'else_if', 'if_end', 'repeat_end', 'for_end', 'while_end'].includes(step.id)) { i++; continue; }

      setActiveBlockUid(step.uid);
      applyRuntimeMathAndVars(step);
      const p = step.params || {};

      // Sensor reads and waits
      if (['read_dist', 'read_sonar', 'read_light', 'read_line_l', 'read_line_r', 'read_btn_a', 'read_btn_b'].includes(step.id) && (simOnly || !live || serialBoard())) {
        const name = String(p.var || 'value');
        let v;
        if (step.id === 'read_dist' || step.id === 'read_sonar') v = await readSensor('dist');
        else if (step.id === 'read_light') v = await readSensor('light');
        else if (step.id === 'read_line_l') v = (await readSensor('line'))[0];
        else if (step.id === 'read_line_r') v = (await readSensor('line'))[1];
        else v = await readSensor(step.id === 'read_btn_a' ? 'btn_a' : 'btn_b');
        runtimeVarsRef.current[name] = Number(v) || 0;
        addTerminal(`📏 ${name} = ${runtimeVarsRef.current[name]}`, 'recv');
        if (!(live && !serialBoard())) { i++; continue; }
      }
      if ((step.id === 'wait_dist' || step.id === 'wait_line') && live && serialBoard()) {
        const t0 = Date.now();
        while (runningRef.current && Date.now() - t0 < 60000) {
          const ok = step.id === 'wait_dist' ? (await readSensor('dist')) < numOr(p.cm, 20) : (await readSensor('line')).some(Boolean);
          if (ok) break;
          await new Promise((r) => setTimeout(r, 80));
        }
        i++; continue;
      }
      if ((step.id === 'follow_line' || step.id === 'avoid_wall') && live && serialBoard()) {
        const until = Date.now() + numOr(p.secs, 3) * 1000;
        while (runningRef.current && Date.now() < until) {
          if (step.id === 'follow_line') {
            const [l, r] = await readSensor('line');
            await serialAsk(l && r ? 'MV:45:45\n' : l ? 'MV:10:45\n' : r ? 'MV:45:10\n' : 'MV:25:25\n');
          } else if ((await readSensor('dist')) < 20) {
            await serialAsk('BWD:20\n', 3000); await serialAsk('RGT:90\n', 3000);
          } else await serialAsk('MV:50:50\n');
          await new Promise((r) => setTimeout(r, 40));
        }
        await serialAsk('STP\n');
        i++; continue;
      }

      // Things the mBot/Arduino can't show are shown in the terminal instead
      const SAY = { display: p.text, show_num: p.num, show_icon: p.icon, disp_scroll: p.text, disp_show: p.val, send_msg: p.msg, log: p.msg, radio_send: p.msg };
      if (live && (robotType === 'mbot' || robotType === 'arduino') && step.id in SAY) {
        addTerminal(`🤖 ${profile.name} says: ${SAY[step.id]}`, 'recv');
      }

      if (live) {
        if (robotType === 'microbit' || robotType === 'quarky') {
          await Promise.all([
            sendMicrobitRaw(profile.buildCmd(step.id, step.params)),
            robotRef.current ? robotRef.current.execute(step) : Promise.resolve(),
          ]);
        } else if (serialBoard()) {
          const lines = profile.buildCmd(step.id, step.params).split('\n').filter(Boolean);
          const robotJob = (async () => { for (const ln of lines) { if (!runningRef.current) break; await serialAsk(`${ln}\n`); } })();
          await Promise.all([robotJob, robotRef.current ? robotRef.current.execute(step) : Promise.resolve()]);
        } else {
          // Older sketch without replies: send and give it time
          await sendRaw(profile.buildCmd(step.id, step.params));
          await new Promise(r => setTimeout(r, 200));
          if (robotRef.current) await robotRef.current.execute(step);
        }
      } else if (robotRef.current) {
        await robotRef.current.execute(step);
      }
      i++;
    }
    return 'done';
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
    if ((robotType === 'microbit' || robotType === 'quarky') && !connectedRef.current) {
      addTerminal('ℹ️ No robot connected — running in simulation only', 'info');
    }
    if (connectedRef.current && robotType === 'microbit' && firmwareOkRef.current === false) {
      addTerminal('⚠️ Flash once first: ⚡ Flash → “MicroPython (USB, flash once)” or “Bluetooth bridge firmware”.', 'warn');
      return;
    }
    if (connectedRef.current && robotType === 'quarky' && firmwareOkRef.current === false) {
      addTerminal('⚠️ MicroPython not detected. Flash MicroPython to your Quarky first (see Setup Guide).', 'warn');
      return;
    }
    setRunning(true);
    runningRef.current = true;
    runtimeVarsRef.current = {};
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

    // ByteBuddies Runtime: send the program (USB or Bluetooth); it is saved and runs on the micro:bit
    if (robotType === 'microbit' && connectedRef.current && runtimeRef.current) {
      const { lines, warnings } = compileForRuntime(program);
      warnings.forEach((w) => addTerminal(`⚠️ ${w}`, 'warn'));
      await serialAsk(`KIT ${RUNTIME_KIT[microbitKit] || 'generic'}\n`, 2500);
      addTerminal(`📡 Sending your program to the micro:bit (${lines.length} steps)…`, 'info');
      let ok = (await serialAsk('BEGIN\n', 3000)) !== null;
      for (let k = 0; ok && k < lines.length && runningRef.current; k++) {
        ok = (await serialAsk(`L ${lines[k]}\n`, 3000)) !== null;
        if (k % 10 === 9) setFlashProgress(Math.round(((k + 1) / lines.length) * 100));
      }
      setFlashProgress(null);
      const endReply = ok && runningRef.current ? await serialAsk('END\n', 8000) : null;
      if (!endReply) {
        if (runningRef.current) addTerminal('❌ The micro:bit stopped answering — move closer or reconnect, then press ▶ Run again.', 'error');
      } else {
        addTerminal(/SAVED/.test(endReply)
          ? '💾 Saved on the micro:bit and running! It runs again when you press A or reset — even unplugged.'
          : '▶ Running on the micro:bit (too long to save — it stays until the micro:bit is reset).', 'success');
        robotRef.current?.resetState();
        await executeBlocks(orderedSteps, true); // on-screen twin
      }
      runningRef.current = false;
      setRunning(false);
      setActiveBlockUid(null);
      return;
    }

    // If micro:bit is connected with MicroPython and the program has control-flow blocks,
    // send the full compiled program as one raw REPL exec (much more reliable than line-by-line)
    const COMPLEX_IDS = new Set(['if_then','if_dist','if_line','if_btn_a','if_btn_b',
      'if_touch','if_shake','if_tilt','if_light','if_temp','if_compass','for_range','while_do']);
    const hasComplexFlow = orderedSteps.some(s => COMPLEX_IDS.has(s.id));

    // BLE firmware splits on \n before \x04, so multi-line programs don't exec correctly over BT.
    // Only use the full-program path for USB; Bluetooth always runs commands one-at-a-time.
    const canRunFullPython =
      firmwareOkRef.current === true &&
      connectionTypeRef.current === 'usb';

    if ((robotType === 'microbit' || robotType === 'quarky') && connectedRef.current && canRunFullPython) {
      robotRef.current?.resetState();
      const pythonCode = robotType === 'quarky'
        ? generateQuarkyProgram(program)
        : generateFullProgram(program, microbitKit);
      const hasForever = orderedSteps.some(s => s.id === 'forever');
      const isBridge = bridgeModeRef.current;

      if (hasForever) {
        await sendMicrobitRaw(pythonCode, { timeoutMs: 60000 });
        addTerminal('▶ Running forever — press Stop to interrupt', 'info');
        await executeBlocks(orderedSteps, true);
        await new Promise(resolve => {
          const iv = setInterval(() => { if (!runningRef.current) { clearInterval(iv); resolve(); } }, 200);
        });
      } else {
        await Promise.all([
          sendMicrobitRaw(pythonCode, { timeoutMs: isBridge ? 60000 : 30000 }),
          executeBlocks(orderedSteps, true),
        ]);
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
    pendingReplyRef.current?.resolve(null);
    pendingReplyRef.current = null;
    if (connectedRef.current && runtimeRef.current) {
      setRunning(false);
      setActiveBlockUid(null);
      await serialAsk('STOP\n', 2000);
      addTerminal('⏹ Stopped', 'warn');
      return;
    }
    setRunning(false);
    setActiveBlockUid(null);
    if (connectedRef.current) {
      if ((robotType === 'microbit' || robotType === 'quarky') && firmwareOkRef.current === true) {
        if (bridgeModeRef.current) {
          await writeChunked('sp()\x04');
        } else if (connectionTypeRef.current === 'bluetooth') {
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

  const buildHexForDualFlash = useCallback(
    async (onStatus) => {
      if (!program.length) throw new Error('Add blocks before flashing');
      let pythonCode = generateFullProgram(program, microbitKit);
      const startupIndicator = `# Startup\ntry:\n    display.show(Image.YES)\n    sleep(500)\nexcept:\n    pass\n`;
      pythonCode = startupIndicator + pythonCode;
      return buildMicrobitHex(pythonCode, onStatus);
    },
    [program, microbitKit],
  );

  const handleDownloadQuarkyProgram = useCallback(() => {
    if (!program.length) { addTerminal('⚠️ Add blocks before downloading a Quarky program.', 'warn'); return; }
    try {
      const { source, warnings } = generateQuarkyPictoBloxProgram(program);
      const url = URL.createObjectURL(new Blob([source], { type: 'text/x-python;charset=utf-8' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'bytebuddies-quarky.py';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      addTerminal('📥 Downloaded bytebuddies-quarky.py — open the code in PictoBlox Python with Board set to Quarky, then use Upload Code over USB.', 'success');
      warnings.forEach(warning => addTerminal(`⚠️ ${warning}`, 'warn'));
    } catch (e) {
      addTerminal(`❌ Program download failed: ${e.message}`, 'error');
    }
  }, [program, addTerminal]);

  const showDownloadInstructions = useCallback(() => {
    const instructions = getFlashingInstructions();
    addTerminal(`📋 ${instructions.title}`, 'info');
    for (const step of instructions.steps) addTerminal(step, 'info');
    for (const note of instructions.keyPoints) addTerminal(note, 'warn');
    addTerminal('⏳ After copying to MICROBIT, wait for the checkmark (✓) on the display.', 'success');
  }, [addTerminal]);

  const runCoordinatorFlash = useCallback(async (hexStr, coordMethod, filename = 'program.hex', webUsbDevice = null) => {
    const releaseUsbForFlash = async () => {
      if (connectedRef.current && connectionTypeRef.current === 'usb') {
        addTerminal('🔌 Releasing USB serial so the flasher can use WebUSB…', 'info');
        await disconnect();
        await new Promise((r) => setTimeout(r, 1000));
      }
    };
    let _lastProgressMsg = '';
    const onProgress = (e) => {
      if (e && typeof e.percent === 'number') setFlashProgress(Math.round(e.percent));
      if (e?.message && e.message !== _lastProgressMsg) {
        _lastProgressMsg = e.message;
        addTerminal(e.message, 'info');
      }
    };
    setFlashProgress(0);
    let success = false;
    let flashResult = null;
    try {
      addTerminal('🔍 Validating hex…', 'info');
      const info = getHexInfo(hexStr);
      if (!info.valid) {
        addTerminal(`❌ Invalid hex: ${info.errors.slice(0, 3).join('; ')}`, 'error');
        setFlashProgress(null);
        return null;
      }
      const basicValidation = validateHex(hexStr);
      if (!basicValidation.isValid) {
        addTerminal(`⚠️ Hex warnings (continuing): ${basicValidation.errors.slice(0, 2).join('; ')}`, 'warn');
      }

      // Show hex file info
      let hexToFlash = hexStr;
      addTerminal(`📦 Program size: ${(info.size / 1024).toFixed(1)} KB`, 'info');

      // Universal hex: split to the selected board first. Never repairHex() the full universal
      // image — that strips 0x0A board records and breaks WebUSB/DAPLink (Flash error).
      const sizeKB = hexToFlash.length / 1024;
      if (isUniversalHex(hexToFlash)) {
        addTerminal(`🔧 Extracting ${microbitHw === 'v1' ? 'V1' : 'V2'} image from universal hex…`, 'info');
        try {
          const separated = separateUniversalHex(hexToFlash);
          const wantId = microbitHw === 'v1' ? microbitBoardId.V1 : microbitBoardId.V2;
          const chosen =
            separated.find((x) => x.boardId === wantId) ||
            separated.find((x) => x.boardId === microbitBoardId.V2) ||
            separated[0];
          if (chosen?.hex) {
            hexToFlash = chosen.hex;
            addTerminal(`✅ Board image ready (${(hexToFlash.length / 1024).toFixed(0)} KB)`, 'info');
          }
        } catch (splitErr) {
          addTerminal(`⚠️ Could not split universal hex: ${splitErr.message}`, 'warn');
        }
      }

      if (sizeKB < 100) {
        addTerminal('⚠️ Hex file looks too small — check your program.', 'warn');
      }

      const strictValidation = validateHexStrict(hexToFlash);
      if (!strictValidation.valid) {
        addTerminal(`⚠️ Hex warning: ${strictValidation.errors[0]}`, 'warn');
        addTerminal('Continuing flash — official micro:bit images use multi-region layout.', 'info');
      } else if (strictValidation.warnings?.length) {
        strictValidation.warnings.forEach((w) => addTerminal(`ℹ️ ${w}`, 'info'));
      }

      // Proceed with flash
      addTerminal('🚀 Starting flash…', 'info');
      const flashMethod =
        coordMethod === 'auto' || coordMethod === 'flash-program' ? 'dual-auto' : coordMethod;

      if (coordMethod === 'electron-usb') {
        flashResult = await getMicrobitFlashCoordinator().flash(hexToFlash, {
          method: 'electron-usb',
          filename,
          onProgress,
          webUsbBoard: microbitHw === 'v1' ? 'v1' : 'v2',
        });
      } else if (coordMethod === 'download') {
        flashResult = await getMicrobitFlashCoordinator().flash(hexToFlash, {
          method: 'download',
          filename,
          onProgress,
        });
      } else {
        flashResult = await flashMicrobitHex(hexToFlash, {
          method: flashMethod,
          filename,
          onProgress,
          board: microbitHw === 'v1' ? 'v1' : 'v2',
          webUsbDevice,
          beforeUsbFlash: webUsbDevice ? null : releaseUsbForFlash,
        });
      }

      if (flashResult?.method === 'download' || flashResult?.fallback === 'download') {
        addTerminal(`📥 Downloaded ${filename} — copy it to the MICROBIT drive (USB fallback).`, 'warn');
        showCopySteps(filename);
        setFlashProgress(null);
      } else if (flashResult?.method === 'ble' || flashResult?.method === 'webusb' || flashResult?.method === 'usb-msd') {
        addTerminal(`✅ Flash complete (${flashResult.method.toUpperCase()})`, 'success');
        addTerminal('💡 If nothing appears on screen: press RESET on the back of the micro:bit.', 'info');
        success = true;
      } else {
        addTerminal('✅ Flash complete — device should show a checkmark (✓).', 'success');
        success = true;
      }
    } catch (e) {
      const msg = e?.message || String(e);
      addTerminal(`❌ Flash failed: ${msg}`, 'error');

      // Provide helpful recovery steps based on error type
      if (msg.includes('Flash error') || msg.includes('DAPLink')) {
        addTerminal('💡 Try: Eject the MICROBIT drive, unplug/replug the device, then try again.', 'info');
      } else if (msg.includes('NotFound') || msg.includes('not found')) {
        addTerminal('💡 Make sure your micro:bit is plugged in and the drive appears in Finder/File Explorer.', 'info');
      } else if (msg.includes('Network') || msg.includes('disconnect')) {
        addTerminal('💡 Device disconnected. Reconnect and try again.', 'info');
      } else if (msg.includes('Bluetooth') || msg.includes('BLE')) {
        addTerminal('💡 Try: Put device in pairing mode (hold A+B, tap reset, release reset), move closer, or use USB.', 'info');
      }

      setFlashProgress(null);
    }
    if (success) {
      setFlashProgress('done');
      setTimeout(() => setFlashProgress(null), 2200);
    }
    return flashResult;
  }, [addTerminal, showDownloadInstructions, microbitHw, disconnect]);

  const handleFlashMethod = useCallback(async (method) => {
    if (robotType !== 'microbit') return;
    setFlashMethod(null);
    setRightTab('terminal');

    if (method === 'download-runtime') {
      try {
        const hexStr = await fetch('/bytebuddies-runtime.hex').then((r) => { if (!r.ok) throw new Error('Could not download the runtime'); return r.text(); });
        const url = URL.createObjectURL(new Blob([hexStr], { type: 'application/octet-stream' }));
        const a = document.createElement('a');
        a.href = url; a.download = 'bytebuddies-runtime.hex';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
        addTerminal('📥 Downloaded bytebuddies-runtime.hex (works on micro:bit V1 and V2).', 'success');
        showCopySteps('bytebuddies-runtime.hex');
        addTerminal('Then: 🔌 USB or 📡 Bluetooth → ▶ Run. You never need to flash again.', 'info');
      } catch (e) {
        addTerminal(`❌ ${e.message}`, 'error');
      }
      return;
    }

    let webUsbDevice = null;
    const needsUsb = method !== 'flash-prog-download' && method !== 'flash-prog-ble';
    if (needsUsb && typeof navigator !== 'undefined' && navigator.usb) {
      try {
        if (connectedRef.current && connectionTypeRef.current === 'usb') {
          addTerminal('🔌 Releasing USB serial…', 'info');
          await disconnect();
          await new Promise((r) => setTimeout(r, 800));
        }
        addTerminal('🔌 Select your micro:bit (USB)…', 'info');
        const usbPick = await requestMicrobitUsbEarly();
        webUsbDevice = usbPick?.device ?? usbPick;
        if (usbPick?.board) {
          setMicrobitHw(usbPick.board);
          localStorage.setItem('cv_mb_hw', usbPick.board);
          addTerminal(`Detected micro:bit ${usbPick.version || usbPick.board.toUpperCase()} — flashing ${usbPick.board.toUpperCase()} firmware`, 'info');
        }
      } catch (e) {
        if (e?.name === 'NotFoundError') {
          addTerminal('USB selection cancelled.', 'warn');
          return;
        }
        addTerminal(`USB: ${e?.message || e}`, 'warn');
      }
    }

    if (method === 'flash-runtime') {
      try {
        addTerminal('📦 Loading the ByteBuddies Runtime…', 'info');
        const hexStr = await fetch('/bytebuddies-runtime.hex').then((r) => { if (!r.ok) throw new Error('Could not download the runtime'); return r.text(); });
        const res = await runCoordinatorFlash(hexStr, 'auto', 'bytebuddies-runtime.hex', webUsbDevice);
        if (res?.fallback === 'download' || res?.method === 'download') {
          showCopySteps('bytebuddies-runtime.hex');
        } else if (res) {
          addTerminal('✅ Runtime installed! The micro:bit shows B. Now 🔌 USB (or 📡 Bluetooth on V2) → ▶ Run.', 'success');
        }
      } catch (e) {
        addTerminal(`❌ ${e.message}`, 'error');
      }
      return;
    }

    const needsProgram =
      method !== 'bluetooth-firmware' &&
      method.startsWith('flash-prog');
    if (needsProgram && !program.length) {
      addTerminal('⚠️ Add some blocks first, or use “Bluetooth bridge firmware” to set up wireless.', 'warn');
      return;
    }

    const support = typeof navigator !== 'undefined' ? checkBrowserSupport() : {};

    if (method === 'flash-prog-auto' || method === 'flash-program') {
      try {
        addTerminal('🔨 Building your program…', 'info');
        let pythonCode = generateFullProgram(program, microbitKit);
        const startupIndicator = `# Startup\ntry:\n    display.show(Image.YES)\n    sleep(500)\nexcept:\n    pass\n`;
        pythonCode = startupIndicator + pythonCode;
        const hexStr = await buildMicrobitHex(pythonCode, (msg) => addTerminal(msg, 'info'));
        await runCoordinatorFlash(hexStr, 'auto', 'program.hex', webUsbDevice);
      } catch (e) {
        addTerminal(`❌ ${e.message}`, 'error');
      }
      return;
    }

    if (method === 'flash-prog-webusb') {
      try {
        addTerminal('🔨 Building your program…', 'info');
        let pythonCode = generateFullProgram(program, microbitKit);
        const startupIndicator = `# Startup\ntry:\n    display.show(Image.YES)\n    sleep(500)\nexcept:\n    pass\n`;
        pythonCode = startupIndicator + pythonCode;
        const hexStr = await buildMicrobitHex(pythonCode, (msg) => addTerminal(msg, 'info'));
        if (!support.webusb) {
          addTerminal('⚠️ WebUSB not available in this browser.', 'warn');
          await runCoordinatorFlash(hexStr, 'download', 'program.hex');
          return;
        }
        await runCoordinatorFlash(hexStr, 'auto', 'program.hex', webUsbDevice);
      } catch (e) {
        addTerminal(`❌ ${e.message}`, 'error');
      }
      return;
    }

    if (method === 'flash-prog-msd') {
      try {
        if (!isElectronNative()) {
          addTerminal('💡 USB drive auto-flash needs the ByteBuddies desktop app (`npm run desktop`).', 'info');
          await handleFlashMethod('flash-prog-download');
          return;
        }
        addTerminal('🔨 Building your program…', 'info');
        let pythonCode = generateFullProgram(program, microbitKit);
        const startupIndicator = `# Startup\ntry:\n    display.show(Image.YES)\n    sleep(500)\nexcept:\n    pass\n`;
        pythonCode = startupIndicator + pythonCode;
        const hexStr = await buildMicrobitHex(pythonCode, (msg) => addTerminal(msg, 'info'));
        await runCoordinatorFlash(hexStr, 'electron-usb', 'program.hex');
      } catch (e) {
        addTerminal(`❌ ${e.message}`, 'error');
      }
      return;
    }

    if (method === 'flash-prog-ble') {
      try {
        addTerminal('🔨 Building your program…', 'info');
        let pythonCode = generateFullProgram(program, microbitKit);
        const startupIndicator = `# Startup\ntry:\n    display.show(Image.YES)\n    sleep(500)\nexcept:\n    pass\n`;
        pythonCode = startupIndicator + pythonCode;
        const hexStr = await buildMicrobitHex(pythonCode, (msg) => addTerminal(msg, 'info'));

        const hasMakeCodeMetadata = hexStr.includes(':020000040010EA') || hexStr.includes('MakeCode');
        if (!hasMakeCodeMetadata) {
          addTerminal('ℹ️ Block programs use MicroPython — full firmware must go over USB.', 'info');
          addTerminal('📡 For wireless control: flash “Bluetooth bridge firmware” once, then Connect Bluetooth.', 'info');
          if (!support.webusb) {
            addTerminal('⚠️ WebUSB not available — downloading .hex for MICROBIT drive.', 'warn');
            await runCoordinatorFlash(hexStr, 'download', 'program.hex');
            return;
          }
          addTerminal('🔌 Flashing over USB (WebUSB)…', 'info');
          await runCoordinatorFlash(hexStr, 'auto', 'program.hex', webUsbDevice);
          return;
        }

        if (!support.bluetooth) {
          addTerminal('⚠️ Web Bluetooth not available — use Chrome/Edge on HTTPS.', 'warn');
          await runCoordinatorFlash(hexStr, 'auto', 'program.hex', webUsbDevice);
          return;
        }
        addTerminal('📡 MakeCode-style hex — attempting BLE partial flash…', 'info');
        addTerminal('💡 Put micro:bit in pairing mode if flash fails: hold A+B, tap reset, release reset.', 'info');
        await runCoordinatorFlash(hexStr, 'ble', 'program.hex');
      } catch (e) {
        addTerminal(`❌ ${e.message}`, 'error');
      }
      return;
    }

    if (method === 'flash-prog-download') {
      try {
        addTerminal('🔨 Building your program…', 'info');
        let pythonCode = generateFullProgram(program, microbitKit);
        const startupIndicator = `# Startup\ntry:\n    display.show(Image.YES)\n    sleep(500)\nexcept:\n    pass\n`;
        pythonCode = startupIndicator + pythonCode;
        const hexStr = await buildMicrobitHex(pythonCode, (msg) => addTerminal(msg, 'info'));
        await runCoordinatorFlash(hexStr, 'download', 'program.hex');
      } catch (e) {
        addTerminal(`❌ ${e.message}`, 'error');
      }
      return;
    }

    if (method === 'flash-micropython-runtime') {
      try {
        addTerminal(`📥 Building MicroPython ${microbitHw === 'v1' ? 'V1' : 'V2'} with startup display…`, 'info');
        addTerminal('💡 After flash you should see ✓ then YES → BB on the LED.', 'info');
        const { hex: hexStr } = await buildMicroPythonBootHex(microbitHw === 'v1' ? 'v1' : 'v2');
        const rt = await runCoordinatorFlash(hexStr, 'auto', 'micropython-runtime.hex', webUsbDevice);
        if (rt?.fallback === 'download' || rt?.method === 'download') {
          addTerminal('📥 Finish setup: drag the downloaded file onto MICROBIT, wait for ✓ then YES/BB.', 'warn');
        } else {
          addTerminal('✅ MicroPython on board! You should see YES then BB. Click 🔌 USB, then ▶ Run.', 'success');
          try { localStorage.setItem('cv_mb_runtime_flashed', microbitHw); } catch (_) {}
        }
      } catch (e) {
        addTerminal(`❌ ${e.message}`, 'error');
      }
      return;
    }

    if (method === 'bluetooth-firmware') {
      try {
        addTerminal('📥 Loading MakeCode Bluetooth firmware (Cutebot bridge)…', 'info');
        addTerminal('💡 Flash once — LED shows B, then 📡 Bluetooth + ▶ Run (no reflash).', 'info');
        const { hex: hexStr, source } = await buildBleBridgeHex(
          microbitHw === 'v1' ? 'v1' : 'v2',
          (m) => m && addTerminal(m, 'info'),
        );
        addTerminal(`📦 ${source || 'wireless firmware'}`, 'info');
        const ble = await runCoordinatorFlash(hexStr, 'auto', 'bluetooth-firmware.hex', webUsbDevice);
        if (ble?.fallback === 'download' || ble?.method === 'download') {
          addTerminal('📥 Drag the downloaded .hex onto MICROBIT. Wait for B, then Connect Bluetooth.', 'warn');
        } else {
          addTerminal('✅ Wireless firmware flashed. LED should show B (sad face = wrong file).', 'success');
          addTerminal('📡 Unplug USB → reset → Connect Bluetooth → ▶ Run', 'info');
        }
      } catch (e) {
        addTerminal(`❌ ${e.message}`, 'error');
      }
    }
  }, [program, microbitKit, microbitHw, robotType, addTerminal, runCoordinatorFlash, disconnect]);

  const canvasAreaRef = useRef(null);
  const ROBOT_BLOCK_LANE_X = 30;
  const ROBOT_BLOCK_START_Y = 40;
  const normalizeRobotProgram = useCallback((blocks) => (
    columnizeBlocks(blocks || [], {
      laneX: ROBOT_BLOCK_LANE_X,
      startY: ROBOT_BLOCK_START_Y,
      gap: BLOCK_STACK_GAP,
    })
  ), []);
  const [draggingBlock, setDraggingBlock] = useState(null);
  const [dragOffset, setDragOffsetState] = useState({ x: 0, y: 0 });
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [hoveredBlock, setHoveredBlock] = useState(null);

  useEffect(() => {
    setProgram((prev) => normalizeRobotProgram(prev));
  }, [normalizeRobotProgram]);

  /* ─── Program: array of block objects with x,y positions ─── */
  // program items: { uid, id, label, icon, color, cat, params, x, y }

  const createBlock = (cmd) => {
    const params = {};
    cmd.params.forEach(p => { params[p.key] = p.default; });
    // Stack below existing blocks
    const maxY = program.reduce((m, b) => Math.max(m, b.y), 0);
    return {
      uid: Date.now() + Math.random(),
      id: cmd.id,
      label: cmd.label,
      icon: cmd.icon,
      color: cmd.color,
      cat: cmd.cat,
      params,
      x: ROBOT_BLOCK_LANE_X,
      y: program.length ? maxY + BLOCK_STACK_GAP : ROBOT_BLOCK_START_Y,
    };
  };

  const blocklyNodesToRobotProgram = useCallback((nodes = []) => {
    const typeToCommand = {
      bb_event_start: 'on_start',
      bb_sprite_move: 'forward',
      bb_sprite_turn: 'right',
      bb_control_wait: 'wait',
      bb_loop_repeat: 'repeat',
      bb_loop_forever: 'forever',
      bb_logic_if: 'if_then',
      bb_sound_play: 'buzz',
      bb_robot_if_dist: 'if_dist',
      bb_robot_led_color: 'led',
      bb_robot_led_brightness: 'led_bright',
      bb_robot_led_rgb: 'led_rgb',
      bb_robot_buzz: 'buzz',
      bb_robot_play_note: 'play_note',
      bb_robot_play_melody: 'play_melody',
      bb_robot_show_text: 'display',
      bb_robot_show_number: 'show_num',
      bb_robot_show_icon: 'show_icon',
      bb_robot_disp_image: 'disp_image',
      bb_var_create: 'var_set',
      bb_var_change: 'var_inc',
    };
    const next = [];
    const make = (id, params = {}) => {
      const cmd = ROBOT_COMMANDS.find((c) => c.id === id);
      if (!cmd) return null;
      return {
        uid: Date.now() + Math.random() + next.length,
        id: cmd.id,
        label: cmd.label,
        icon: cmd.icon,
        color: cmd.color,
        cat: cmd.cat,
        params: { ...Object.fromEntries((cmd.params || []).map((p) => [p.key, p.default])), ...params },
        x: ROBOT_BLOCK_LANE_X,
        y: 0,
      };
    };
    const walk = (list = []) => {
      list.forEach((node) => {
        const blocklyType = resolveBlocklyNodeType(node) || node?.type;
        let mapped = typeToCommand[blocklyType];
        const f = node.fields || {};
        let dataObj = null;
        try {
          dataObj = node?.data ? JSON.parse(node.data) : null;
        } catch (e) {
          dataObj = null;
        }
        const dataTag = String(dataObj?.directType || node?.data || '').trim().toLowerCase();
        const robotDataMatch = /^robot:([a-z0-9_]+)$/.exec(dataTag);
        if (robotDataMatch?.[1]) mapped = robotDataMatch[1];
        if (!mapped && dataObj?.robotId) mapped = String(dataObj.robotId);
        if (!mapped && blocklyType === 'bb_generic_stack') {
          const raw = String(f.LABEL || '').trim().toLowerCase();
          const m = /^robot:([a-z0-9_]+)$/.exec(raw);
          if (m) mapped = m[1];
          if (!mapped) {
            const byLabel = ROBOT_COMMANDS.find((c) => String(c.label || '').toLowerCase() === raw);
            if (byLabel) mapped = byLabel.id;
          }
        }
        if (!mapped) return;

        // bb_robot_generic blocks store values in V1/V2/V3 fields — read those directly
        // rather than falling through to the named-field handlers below (which target old block types).
        if (blocklyType === 'bb_robot_generic') {
          const defs = Array.isArray(dataObj?.params) ? dataObj.params : [];
          const parsedParams = {};
          defs.forEach((def, idx) => {
            const k = String(def?.key || '').trim();
            if (!k) return;
            const rawVal = f[`V${idx + 1}`];
            parsedParams[k] = String(rawVal ?? def?.default ?? '');
          });
          const b = make(mapped, parsedParams);
          if (b) next.push(b);
          return;
        }

        if (mapped === 'forward') {
          const b = make('forward', { amount: String(f.STEPS || 80) });
          if (b) next.push(b);
          return;
        }
        if (mapped === 'right') {
          const dir = String(f.DIRECTION || 'right');
          const turnCmd = dir === 'left' ? 'left' : 'right';
          const b = make(turnCmd, { degrees: String(f.DEGREES || 90) });
          if (b) next.push(b);
          return;
        }
        if (mapped === 'wait') {
          const b = make('wait', { secs: String(f.SECONDS || 1) });
          if (b) next.push(b);
          return;
        }
        if (mapped === 'if_dist') {
          const b = make('if_dist', { cm: String(f.CM || 20) });
          if (b) next.push(b);
          return;
        }
        if (mapped === 'led') {
          const b = make('led', { color: String(f.COLOR || 'red') });
          if (b) next.push(b);
          return;
        }
        if (mapped === 'led_bright') {
          const b = make('led_bright', { pct: String(f.PCT || 100) });
          if (b) next.push(b);
          return;
        }
        if (mapped === 'led_rgb') {
          const b = make('led_rgb', { r: String(f.R || 255), g: String(f.G || 0), b: String(f.B || 0) });
          if (b) next.push(b);
          return;
        }
        if (mapped === 'buzz') {
          const b = make('buzz', { secs: String(f.SECS || 0.5) });
          if (b) next.push(b);
          return;
        }
        if (mapped === 'play_note') {
          const b = make('play_note', { note: String(f.NOTE || 'C4'), secs: String(f.SECS || 0.5) });
          if (b) next.push(b);
          return;
        }
        if (mapped === 'play_melody') {
          const b = make('play_melody', { melody: String(f.MELODY || 'happy') });
          if (b) next.push(b);
          return;
        }
        if (mapped === 'display') {
          const b = make('display', { text: String(f.TEXT || 'Hi!') });
          if (b) next.push(b);
          return;
        }
        if (mapped === 'show_num') {
          const b = make('show_num', { num: String(f.NUM || 42) });
          if (b) next.push(b);
          return;
        }
        if (mapped === 'show_icon') {
          const b = make('show_icon', { icon: String(f.ICON || 'HAPPY') });
          if (b) next.push(b);
          return;
        }
        if (mapped === 'disp_image') {
          const b = make('disp_image', { icon: String(f.ICON || 'HAPPY') });
          if (b) next.push(b);
          return;
        }
        if (mapped === 'repeat') {
          const head = make('repeat', { times: String(f.TIMES || 10) });
          if (head) next.push(head);
          walk(node?.statements?.DO || []);
          const end = make('repeat_end');
          if (end) next.push(end);
          return;
        }
        if (mapped === 'forever') {
          const head = make('forever');
          if (head) next.push(head);
          walk(node?.statements?.DO || []);
          const end = make('repeat_end');
          if (end) next.push(end);
          return;
        }
        if (mapped === 'if_then') {
          const head = make('if_then');
          if (head) next.push(head);
          walk(node?.statements?.DO || []);
          if ((node?.statements?.ELSE || []).length) {
            const eb = make('else_branch');
            if (eb) next.push(eb);
            walk(node.statements.ELSE);
          }
          const end = make('if_end');
          if (end) next.push(end);
          return;
        }
        const b = make(mapped);
        if (b) next.push(b);
      });
    };
    walk(nodes);
    return normalizeRobotProgram(next);
  }, [normalizeRobotProgram]);

  const addBlock = (cmd) => setProgram((prev) => normalizeRobotProgram([...prev, createBlock(cmd)]));

  const toBlocklySidebarName = useCallback((cmd) => {
    const map = {
      on_start: 'on start',
      forward: 'move steps',
      back: 'move steps',
      move_left: 'move steps',
      move_right: 'move steps',
      left: 'turn degrees',
      right: 'turn degrees',
      spin_left: 'turn degrees',
      spin_right: 'turn degrees',
      wait: 'wait',
      repeat: 'repeat N times',
      forever: 'forever',
      if_then: 'if / else',
      buzz: 'play sound',
      var_set: 'create variable',
      var_inc: 'change by',
    };
    return map[cmd?.id] || cmd?.label || 'block';
  }, []);

  const removeBlock = (uid) => {
    setProgram((prev) => normalizeRobotProgram(prev.filter((b) => b.uid !== uid)));
    if (selectedBlock === uid) setSelectedBlock(null);
  };

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
    const x = ROBOT_BLOCK_LANE_X;
    const y = Math.max(0, e.clientY - rect.top - dragOffset.y);
    setProgram(prev => prev.map(b => b.uid === draggingBlock ? { ...b, x, y } : b));
  }, [draggingBlock, dragOffset]);

  const handleCanvasMouseUp = useCallback(() => {
    if (!draggingBlock) return;
    setProgram((prev) => {
      const dragged = prev.find((b) => b.uid === draggingBlock);
      if (!dragged) return normalizeRobotProgram(prev);
      const snapped = snapCanvasStack({
        draggedId: dragged.uid,
        x: ROBOT_BLOCK_LANE_X,
        y: dragged.y,
        blocks: prev,
        getId: (b) => b.uid,
        minX: ROBOT_BLOCK_LANE_X,
        minY: 0,
      });
      const withSnap = prev.map((b) =>
        b.uid === draggingBlock ? { ...b, x: snapped.x, y: snapped.y } : b
      );
      return normalizeRobotProgram(withSnap);
    });
    setDraggingBlock(null);
  }, [draggingBlock, normalizeRobotProgram]);

  /* ─── Drop from sidebar ─── */
  const handleCanvasDrop = (e) => {
    e.preventDefault();
    const cmdId = e.dataTransfer.getData('robot-cmd');
    const cmd = ROBOT_COMMANDS.find(c => c.id === cmdId);
    if (!cmd || !canvasAreaRef.current) return;
    const rect = canvasAreaRef.current.getBoundingClientRect();
    const y = Math.max(0, e.clientY - rect.top - 20);
    const params = {};
    cmd.params.forEach(p => { params[p.key] = p.default; });
    setProgram((prev) => normalizeRobotProgram([
      ...prev,
      {
        uid: Date.now() + Math.random(),
        id: cmd.id,
        label: cmd.label,
        icon: cmd.icon,
        color: cmd.color,
        cat: cmd.cat,
        params,
        x: ROBOT_BLOCK_LANE_X,
        y,
      },
    ]));
  };

  /* ─── Run program uses blocks sorted by Y ─── */
  const sortedProgram = [...program].sort((a, b) => a.y - b.y);
  const useUnifiedBlocklyCanvas = true;
  const isLightTheme = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'light';
  const ui = isLightTheme
    ? {
        codeBg: '#f3f6ff',
        codeText: '#1f2a44',
        setupBg: '#eef2ff',
        setupBorder: '#c7d2fe',
        setupAccent: '#4338ca',
        infoBg: '#e0f2fe',
        infoBorder: '#7dd3fc',
        infoText: '#0c4a6e',
        successBg: '#ecfdf5',
        successBorder: '#86efac',
        successText: '#166534',
        warnBg: '#eef2ff',
        warnBorder: '#a5b4fc',
        warnText: '#4338ca',
        tabInactiveBg: '#eef2ff',
        tabInactiveText: '#334155',
      }
    : {
        codeBg: '#0c0c1e',
        codeText: '#a5f3fc',
        setupBg: '#1e1b4b',
        setupBorder: 'var(--border)',
        setupAccent: '#818cf8',
        infoBg: '#0c1a2e',
        infoBorder: '#0ea5e9',
        infoText: '#38bdf8',
        successBg: '#0f2a1a',
        successBorder: '#16a34a',
        successText: '#86efac',
        warnBg: '#1e1b4b',
        warnBorder: '#4338ca',
        warnText: '#818cf8',
        tabInactiveBg: 'rgba(12,22,48,0.75)',
        tabInactiveText: '#cbd5e1',
      };

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
    runBar: {
      padding: '10px 12px',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      flexWrap: 'wrap',
      flexShrink: 0,
      background: 'var(--bg-secondary)',
      position: 'relative',
      zIndex: 20,
    },
    midFooter: { flexShrink: 0, display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border)' },
    btn: (bg, fg = '#fff') => ({ padding: '8px 16px', borderRadius: 8, border: 'none', background: bg, color: fg, fontWeight: 600, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }),
    terminal: { flex: 1, overflowY: 'auto', padding: 10, fontFamily: 'monospace', fontSize: 12, background: ui.codeBg },
    termLine: (type) => ({ color: type === 'send' ? '#60a5fa' : type === 'recv' ? '#4ade80' : type === 'error' ? '#f87171' : type === 'success' ? '#34d399' : type === 'warn' ? '#fbbf24' : '#94a3b8', padding: '1px 0' }),
    iconBtn: { background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13, padding: '2px 4px', borderRadius: 4 },
    connDot: (ok) => ({ width: 10, height: 10, borderRadius: '50%', background: ok ? '#22c55e' : '#94a3b8', boxShadow: ok ? '0 0 6px #22c55e' : 'none' }),
    tabBar: { display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' },
    tab: (active) => ({ padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', color: active ? '#6366f1' : 'var(--text-muted)', background: 'transparent', border: 'none', borderBottom: active ? '2px solid #6366f1' : '2px solid transparent' }),
    codeBox: { flex: 1, overflowY: 'auto', padding: 12, fontFamily: 'monospace', fontSize: 12, background: ui.codeBg, color: ui.codeText, whiteSpace: 'pre', lineHeight: 1.6 },
  };

  const [activeCat, setActiveCat] = useState('Movement');
  const [showRecipe, setShowRecipe] = useState(false);

  return (
    <div style={s.panel}>
      {/* Keyframe for active block pulse animation */}
      <style>{`
        @keyframes cv-running-pulse { from { opacity: 1; box-shadow: 0 0 6px #fbbf24; } to { opacity: 0.7; box-shadow: 0 0 14px #fbbf24; } }
        @keyframes lh-scroll { 0% { transform: translateX(60%); } 100% { transform: translateX(-110%); } }
      `}</style>
      {/* Header */}
      <div style={s.header}>
        <button
          type="button"
          onClick={() => (onNavigate ? onNavigate('dashboard') : (window.location.hash = 'dashboard'))}
          title="Back to homepage"
          aria-label="Back to homepage"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '8px 14px',
            borderRadius: 10,
            border: 'none',
            background: '#6366f1',
            color: '#fff',
            fontWeight: 800,
            fontSize: 14,
            cursor: 'pointer',
            flexShrink: 0,
            boxShadow: '0 3px 0 #4338ca',
          }}
        >
          <span aria-hidden="true">←</span>
          Back
        </button>
        <img src="/images/bytebuddies-mascot-head.webp" alt="" draggable="false" style={{ width: 48, height: 48, objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(0 3px 6px rgba(30,10,80,0.35))' }} />
        <div>
          <h2 style={s.title}>Robot Lab</h2>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)' }}>Connect & program your robot</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              aria-label="Choose board"
              aria-haspopup="dialog"
              aria-expanded={showBoardMenu}
              onClick={() => !connected && setShowBoardMenu(open => !open)}
              disabled={connected}
              title={connected ? 'Disconnect before changing boards' : 'Choose the board you are using'}
              style={{ ...s.btn(showBoardMenu ? '#4f46e5' : 'var(--bg-secondary)', 'var(--text-primary)'), border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}
            >
              <EmojiIcon e="🔌" style={{ marginRight: '0.35em' }} />Board: {profile.icon} {profile.name} <span aria-hidden="true">▾</span>
            </button>
            {showBoardMenu && !connected && <div
              role="presentation"
              onMouseDown={event => { if (event.target === event.currentTarget) setShowBoardMenu(false); }}
              style={{ position: 'fixed', inset: 0, display: 'grid', placeItems: 'center', padding: 18, background: 'rgba(5,7,18,.68)', zIndex: 1200 }}
            >
              <div role="dialog" aria-modal="true" aria-labelledby="robot-board-dialog-title" style={{ width: 'min(760px, 100%)', maxHeight: 'min(620px, calc(100vh - 36px))', display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: 15, background: 'var(--bg-primary)', border: '1px solid var(--border)', boxShadow: '0 20px 55px rgba(0,0,0,.48)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ flex: 1 }}><strong id="robot-board-dialog-title" style={{ display: 'block', fontSize: 18, color: 'var(--text-primary)' }}>Select a Board</strong><span style={{ display: 'block', marginTop: 3, fontSize: 12, color: 'var(--text-muted)' }}>Choose the board you want to connect and program.</span></div>
                  <button type="button" aria-label="Close board selector" onClick={() => setShowBoardMenu(false)} style={{ width: 34, height: 34, border: '1px solid var(--border)', borderRadius: 9, background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 19, cursor: 'pointer' }}>×</button>
                </div>
                <div style={{ padding: 16, overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: 10 }}>
                {Object.entries(ROBOT_PROFILES).map(([key, board]) => {
                  const detail = key === 'microbit' ? 'micro:bit extension · USB or Bluetooth'
                    : key === 'mbot' ? 'mBot extension · USB serial'
                    : key === 'arduino' ? 'Arduino extension · USB serial'
                    : 'Quarky extension · USB or BLE UART';
                  const selected = robotType === key;
                  return <button key={key} type="button" aria-pressed={selected} onClick={() => { setRobotType(key); localStorage.setItem('cv_robotlab_board', key); setActiveCat('Movement'); setShowSetup(false); setFlashMethod(null); setShowBoardMenu(false); }} style={{ position: 'relative', display: 'flex', flexDirection: 'column', minWidth: 0, padding: 10, textAlign: 'left', border: selected ? '2px solid #818cf8' : '1px solid var(--border)', borderRadius: 11, background: selected ? 'rgba(99,102,241,.11)' : 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'pointer', transition: 'border-color .15s, background .15s', overflow: 'hidden' }}>
                    <span style={{ display: 'grid', placeItems: 'center', width: '100%', height: 100, marginBottom: 8, borderRadius: 7, background: 'rgba(99,102,241,.07)' }}><BoardPicture board={key} style={{ width: 'min(165px, 100%)', height: 92, filter: 'drop-shadow(0 5px 5px rgba(0,0,0,.22))' }} /></span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><strong style={{ fontSize: 14 }}><EmojiIcon e={board.icon} style={{ marginRight: '0.35em' }} />{board.name}</strong>{selected && <span style={{ marginLeft: 'auto', padding: '2px 6px', borderRadius: 999, background: '#6366f1', color: 'white', fontSize: 9, fontWeight: 800 }}>✓ Active</span>}</span>
                    <span style={{ marginTop: 4, fontSize: 11, lineHeight: 1.35, color: 'var(--text-muted)' }}>{detail}</span>
                  </button>;
                })}
                </div>
                </div>
              </div>
            </div>}
          </div>
          {robotType === 'microbit' && (
            <label title="This selects the motor driver for your robot car." style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 8px', border: `1px solid ${microbitKit === 'generic' ? '#f59e0b' : 'var(--border)'}`, borderRadius: 9, background: 'var(--bg-secondary)', fontSize: 11, color: microbitKit === 'generic' ? '#fbbf24' : 'var(--text-muted)' }}>
              Robot kit
              <select
                aria-label="Choose micro:bit robot kit"
                value={microbitKit}
                onChange={e => { setMicrobitKit(e.target.value); localStorage.setItem('cv_mb_kit', e.target.value); }}
                disabled={connected}
                style={{ padding: '5px 7px', borderRadius: 6, background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 13, fontWeight: 700 }}
              >
                <option value="generic">Generic H-bridge</option>
                <option value="cutebot">Elecfreaks Cutebot</option>
                <option value="cutebotpro">Elecfreaks Cutebot Pro</option>
                <option value="bitbot">4tronix Bit:Bot</option>
                <option value="maqueen">DFRobot Maqueen</option>
                <option value="maqueenplus">DFRobot Maqueen Plus</option>
                <option value="move">Kitronik :MOVE Motor</option>
                <option value="ringbitcar">Elecfreaks Ring:bit Car</option>
              </select>
            </label>
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
                  <IconText>{connecting ? 'Connecting…' : '🔌 Connect USB'}</IconText>
                  </button>
                  <button style={s.btn('#0ea5e9')} onClick={connectBluetooth} disabled={connecting} title="Connect wirelessly via Bluetooth">
                  <IconText>{connecting ? 'Connecting…' : '📡 Connect Bluetooth'}</IconText>
                  </button>
                </span>
              : robotType === 'quarky'
              ? <span style={{ display:'flex', gap:6 }}>
                  <button style={s.btn('#6366f1')} onClick={connect} disabled={connecting} title="Connect Quarky over USB">
                    <IconText>{connecting ? 'Connecting…' : '🔌 Connect USB'}</IconText>
                  </button>
                  <button style={s.btn('#0ea5e9')} onClick={connectBluetooth} disabled={connecting} title="Connect Quarky via Bluetooth Low Energy">
                    <IconText>{connecting ? 'Connecting…' : '📡 Connect Bluetooth'}</IconText>
                  </button>
                </span>
              : <button style={s.btn('#6366f1')} onClick={connect} disabled={connecting}>
                  <IconText>{connecting ? 'Connecting…' : '🔌 Connect'}</IconText>
                </button>
          }
          {robotType === 'microbit' ? (
            <button style={s.btn(flashProgress !== null ? '#f59e0b' : '#7c3aed')} onClick={() => handleFlashMethod('flash-runtime')} disabled={flashProgress !== null} title="Install the ByteBuddies runtime once, then send programs with Run">
              <EmojiIcon e="⚡" style={{ marginRight: '0.35em' }} />Flash micro:bit
            </button>
          ) : robotType === 'mbot' || robotType === 'arduino' ? (
            <a href={profile.sketchUrl} download style={{ ...s.btn('#16a34a'), textDecoration: 'none' }}>
              <EmojiIcon e="⬇" style={{ marginRight: '0.35em' }} />Download {profile.name} sketch
            </a>
          ) : (
            <button style={s.btn('#7c3aed')} onClick={() => setShowSetup(true)}>
              <EmojiIcon e="🛠" style={{ marginRight: '0.35em' }} />Quarky setup
            </button>
          )}
          <button style={s.btn('var(--bg-secondary)', 'var(--text-muted)')} onClick={() => setShowSetup(!showSetup)} aria-expanded={showSetup}>
            <IconText>{showSetup ? '✕ Close setup' : '⚙ Setup & settings'}</IconText>
          </button>
        </div>
      </div>

      {/* Setup guide banner */}
      {showSetup && (
        <div style={{ padding: 16, background: ui.setupBg, borderBottom: `1px solid ${ui.setupBorder}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <strong style={{ fontSize: 14 }}><EmojiIcon e="📋" style={{ marginRight: '0.35em' }} />{profile.name} Setup Guide</strong>
            <button style={s.iconBtn} onClick={() => setShowSetup(false)}>✕</button>
          </div>
          {robotType === 'microbit' && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '8px 0 12px', padding: 10, borderRadius: 9, background: ui.infoBg, border: `1px solid ${ui.infoBorder}` }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>
                Board
                <select value={microbitHw} onChange={e => { setMicrobitHw(e.target.value); localStorage.setItem('cv_mb_hw', e.target.value); }} disabled={connected} title="Choose V1 or V2 before USB flashing" style={{ padding: '6px 8px', borderRadius: 7, background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                  <option value="v2">micro:bit V2</option>
                  <option value="v1">micro:bit V1</option>
                </select>
              </label>
              <span style={{ alignSelf: 'center', fontSize: 11, color: 'var(--text-muted)' }}>USB flashing also detects the board automatically.</span>
            </div>
          )}
          {robotType === 'mbot' && (
            <section style={{ padding: 14, margin: '8px 0 12px', borderRadius: 12, background: ui.infoBg, border: `1px solid ${ui.infoBorder}`, color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <strong style={{ color: 'var(--text-primary)', fontSize: 15 }}>mBot setup · one-time USB upload</strong>
                  <div style={{ marginTop: 3, fontSize: 12 }}>For the classic mBot with an mCore board. Keep the robot switched on.</div>
                </div>
                <a href="/bytebuddies-mbot.ino" download style={{ ...s.btn('#16a34a'), textDecoration: 'none', whiteSpace: 'nowrap' }}>
                  <EmojiIcon e="⬇" style={{ marginRight: '0.35em' }} />Download mBot sketch (.ino)
                </a>
              </div>
              <ol style={{ margin: '12px 0 0', paddingLeft: 22, fontSize: 13, lineHeight: 1.7 }}>
                <li>Install <a href="https://github.com/Makeblock-official/Makeblock-Libraries" target="_blank" rel="noopener noreferrer" style={{ color: '#818cf8', fontWeight: 700 }}>Makeblock’s official Arduino library</a> in Arduino IDE: <strong>Sketch → Include Library → Add .ZIP Library</strong>. Restart the IDE if it was open.</li>
                <li>Open the downloaded <strong>bytebuddies-mbot.ino</strong>. In Arduino IDE choose <strong>Arduino Uno</strong> and the serial port for the mBot (often named USB Serial or CH340).</li>
                <li>Click <strong>Upload</strong> and wait for <strong>Done uploading</strong>. The sketch uses the mBot’s M1/M2 motors, Port 3 ultrasonic sensor, Port 2 line sensor and built-in LEDs/buzzer.</li>
                <li>Close Arduino IDE and its Serial Monitor to release the port. In Chrome or Edge, return here, choose <strong>mBot</strong>, click <strong>Connect Robot</strong>, and select that same port.</li>
                <li>Use a simple <strong>Move forward</strong> block and press <strong>Run</strong>. The sketch only needs re-uploading when ByteBuddies provides an updated sketch.</li>
              </ol>
              <details style={{ marginTop: 10 }}>
                <summary style={{ cursor: 'pointer', fontSize: 12, fontWeight: 700, color: ui.setupAccent }}>Troubleshooting</summary>
                <ul style={{ margin: '6px 0 0', paddingLeft: 20, fontSize: 12, lineHeight: 1.65 }}>
                  <li><strong>“MeMCore.h: No such file”</strong> — install the Makeblock library ZIP, then reopen Arduino IDE.</li>
                  <li><strong>Port busy or missing</strong> — close Arduino Serial Monitor, unplug/replug the USB data cable, then reconnect.</li>
                  <li><strong>Connected but wheels do not move</strong> — check the mBot battery charge and power switch; USB alone may not power the motors.</li>
                  <li><strong>One wheel runs backward</strong> — the sketch has a <code>FLIP</code> setting near the top for motor direction correction.</li>
                </ul>
              </details>
            </section>
          )}
          <ol style={{ display: robotType === 'mbot' ? 'none' : undefined, margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 2 }}>
            {robotType === 'microbit' && <>
              <li><strong>Easiest (any device):</strong> <EmojiIcon e="⚡" style={{ marginRight: '0.35em' }} />Flash → <strong>⭐ ByteBuddies Runtime</strong> once. Then 🔌 USB or 📡 Bluetooth → ▶ Run — programs are saved on the micro:bit. On iPad, use “📥 Download runtime” and the free micro:bit app.</li>
              <li><strong>Flash once, code forever:</strong> <EmojiIcon e="⚡" style={{ marginRight: '0.35em' }} />Flash → <strong>MicroPython (USB, flash once)</strong> — only needed one time per board</li>
              <li>Then: USB cable → <strong><EmojiIcon e="🔌" style={{ marginRight: '0.35em' }} />USB</strong> → build blocks → <strong><EmojiIcon e="▶" style={{ marginRight: '0.35em' }} />Run</strong> (sends code wirelessly over USB — no reflash)</li>
              <li><strong>Wireless:</strong> <EmojiIcon e="⚡" style={{ marginRight: '0.35em' }} />Flash → <strong>Bluetooth bridge firmware</strong> once → wait for <strong>B</strong> → <strong><EmojiIcon e="📡" style={{ marginRight: '0.35em' }} />Bluetooth</strong> → pick <strong>ByteBuddies</strong> → ▶ Run</li>
              <li>Set <strong>V1/V2</strong> next to the kit menu before flashing so the correct image is used</li>
              <li>Only use <strong>Flash program</strong> if you need a .hex file offline — normal coding does not need it</li>
            </>}
            {robotType === 'quarky' && <>
              <li><strong>Install or repair firmware:</strong> use STEMpedia’s <a href="https://ai.thestempedia.com/docs/quarky/quarky-troubleshooting/quarky-firmware-troubleshooting/" target="_blank" rel="noopener noreferrer" style={{color:'#6366f1'}}>official Quarky firmware guide</a> in PictoBlox on a computer over USB-C.</li>
              <li>In PictoBlox, select <strong>Board → Quarky</strong>, connect over USB, and use <strong>Python Upload Mode</strong>.</li>
              <li>Choose <strong>Export for PictoBlox</strong>, open the downloaded Python code in PictoBlox, then choose <strong>Upload Code</strong>. The export uses Quarky’s documented left/right motor API.</li>
              <li><strong>Bluetooth from this page:</strong> this connection supports Quarky firmware that exposes a Nordic UART service and MicroPython REPL. Select <strong><EmojiIcon e="📡" style={{ marginRight: '0.35em' }} />Connect Bluetooth</strong>, then choose your powered Quarky (often named <em>Quarky wxyz</em>). Standard PictoBlox Bluetooth firmware uses a different protocol and cannot run ByteBuddies code through this connection.</li>
              <li>Sensor and advanced control blocks are marked as TODO in the export and need setup in PictoBlox before uploading.</li>
            </>}
            {robotType === 'arduino' && <>
              <li>Use <strong>Chrome or Edge</strong> (Web Serial). Upload <a href="/bytebuddies-arduino.ino" download style={{color:'#6366f1'}}>bytebuddies-arduino.ino</a> in Arduino IDE (Uno, 9600 baud).</li>
              <li>Plug in USB. Click <strong>Connect Robot</strong> — pick Arduino, CH340, or CP210x. If the list is empty, cancel and the next picker shows every port.</li>
              <li>Wiring is listed at the top of the sketch (motors 2/3 + 4/5, buzzer 8, ultrasonic 12/11, line sensors A0/A1, light A2, buttons 6/7) — change the numbers there if yours differ.</li>
              <li><strong>Used ByteBuddies before?</strong> Upload the new sketch once more — it adds sensors, lights, sound and servos.</li>
              <li>Wait 2 seconds after connect (the board resets). Then press <strong><EmojiIcon e="▶" style={{ marginRight: '0.35em' }} />Run</strong> or use the arrow pad.</li>
            </>}
          </ol>
          <details style={{ marginTop: 10 }}>
            <summary style={{ cursor: 'pointer', fontSize: 13, fontWeight: 600, color: ui.setupAccent }}>
              Show sketch source code →
            </summary>
            <pre style={{ marginTop: 8, padding: 10, background: ui.codeBg, borderRadius: 8, fontSize: 11, color: ui.codeText, overflowX: 'auto', maxHeight: 200 }}>
              {sketchSource || 'Loading…'}
            </pre>
            <button style={{ ...s.btn('#6366f1'), marginTop: 6, fontSize: 12 }}
              onClick={() => navigator.clipboard?.writeText(sketchSource).then(() => addTerminal('Code copied to clipboard!', 'success'))}>
              <EmojiIcon e="📋" style={{ marginRight: '0.35em' }} />Copy Code
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
          <div style={{ padding: '12px 20px', background: ui.warnBg, borderBottom: `1px solid ${ui.warnBorder}`, fontSize: 13, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 20 }}><EmojiIcon e="ℹ️" /></span>
            <div>
              <strong>You're using {browserName}</strong> — the simulator below works fine, but connecting to a real robot requires
              {' '}<strong>Google Chrome</strong> or <strong>Microsoft Edge</strong>.
              {' '}<span style={{ color: ui.warnText }}>The program builder and simulator work in any browser.</span>
            </div>
          </div>
        );
      })()}

      <div style={s.body}>
        {/* Left: block palette sidebar */}
        <div style={s.leftCol}>
          {/* One clear category picker uses less room than nine wrapped tabs. */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 9px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>
            Blocks
            <select aria-label="Block category" value={activeCat} onChange={e => setActiveCat(e.target.value)} style={{ flex: 1, minWidth: 0, padding: '6px 8px', borderRadius: 7, background: ui.tabInactiveBg, border: '1px solid var(--border)', color: ui.tabInactiveText, fontSize: 12, fontWeight: 700 }}>
              {Array.from(new Set(boardCommands.map(command => command.cat))).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </label>
          <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', background: 'rgba(99,102,241,.08)' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#a5b4fc' }}><EmojiIcon e={profile.icon} style={{ marginRight: '0.35em' }} />{boardExtension?.name} extension loaded</div>
            <div style={{ marginTop: 3, fontSize: 10, lineHeight: 1.4, color: 'var(--text-muted)' }}>{boardExtension?.summary} · {boardCommands.length} board-compatible blocks</div>
          </div>
          {/* Block list — draggable */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '6px 4px' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', padding: '4px 10px 6px', fontStyle: 'italic' }}>
              Drag blocks onto the canvas →
            </div>
            {boardCommands.filter(c => c.cat === activeCat).map(cmd => (
              <div
                key={cmd.id}
                draggable
                onDragStart={e => {
                  e.dataTransfer.effectAllowed = 'copy';
                  if (useUnifiedBlocklyCanvas) {
                    const name = toBlocklySidebarName(cmd);
                    const payload = { name, type: `robot:${cmd.id}`, color: cmd.color, meta: { robotId: cmd.id, label: cmd.label, icon: cmd.icon, params: cmd.params || [] } };
                    e.dataTransfer.setData('text/plain', name);
                    e.dataTransfer.setData('application/x-bb-sidebar-block', JSON.stringify(payload));
                    return;
                  }
                  e.dataTransfer.setData('robot-cmd', cmd.id);
                }}
                onClick={() => {
                  if (useUnifiedBlocklyCanvas) {
                    emitAddSidebarBlock(
                      toBlocklySidebarName(cmd),
                      `robot:${cmd.id}`,
                      cmd.color,
                      { robotId: cmd.id, label: cmd.label, icon: cmd.icon, params: cmd.params || [] },
                    );
                    return;
                  }
                  addBlock(cmd);
                }}
                style={{
                  margin: '3px 4px',
                  cursor: 'grab',
                }}
                title="Click to add · Drag to place"
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    minHeight: 30,
                    padding: '4px 8px',
                    borderRadius: 7,
                    border: `1px solid ${darkenHex(cmd.color, 10)}`,
                    background: `linear-gradient(180deg, ${cmd.color} 0%, ${darkenHex(cmd.color, 28)} 100%)`,
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 700,
                    boxShadow: `0 2px 0 ${darkenHex(cmd.color, 56)}, inset 0 1px 0 rgba(255,255,255,0.22)`,
                    userSelect: 'none',
                  }}
                >
                  <span style={{ fontSize: 13, lineHeight: 1 }}><EmojiIcon e={cmd.icon} /></span>
                  <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cmd.label}</span>
                  {(cmd.params || []).slice(0, 2).map((p) => (
                    <span
                      key={p.key}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                        padding: '1px 6px',
                        borderRadius: 10,
                        background: '#ffffff',
                        color: '#575E75',
                        fontSize: 10,
                        fontWeight: 700,
                      }}
                    >
                      {p.labels ? (p.labels[p.options?.indexOf(p.default)] ?? String(p.default ?? '')) : String(p.default ?? '')}
                      {p.type === 'select' ? '▾' : ''}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Middle: free-form block canvas */}
        <div style={s.midCol}>
          <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontWeight: 600, fontSize: 14 }}><EmojiIcon e="🧩" style={{ marginRight: '0.35em' }} />Block Canvas</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Top → bottom · indent blocks inside a loop</span>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button
                title="Show track recipes"
                style={{ ...s.btn('var(--bg-primary)', '#a78bfa'), fontSize: 12, padding: '5px 10px' }}
                onClick={() => setShowRecipe(v => !v)}
              ><EmojiIcon e="💡" style={{ marginRight: '0.35em' }} />Recipe</button>
              <button style={s.btn('var(--bg-primary)', 'var(--text-muted)')} onClick={() => { setProgram([]); setSelectedBlock(null); }}>
                <EmojiIcon e="🗑" style={{ marginRight: '0.35em' }} />Clear
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
                  <span style={{ fontWeight: 700, color: '#a78bfa' }}><EmojiIcon e="💡" style={{ marginRight: '0.35em' }} />{r.title}</span>
                  <button
                    onClick={loadRecipe}
                    style={{ background: '#7c3aed', border: 'none', color: '#fff', borderRadius: 6,
                      padding: '4px 12px', cursor: 'pointer', fontWeight: 700, fontSize: 12 }}>
                    <EmojiIcon e="⚡" style={{ marginRight: '0.35em' }} />Load onto canvas
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
                        <span style={{ fontSize: 14 }}><EmojiIcon e={cmd.icon} /></span>
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
                  <EmojiIcon e="🔁" style={{ marginRight: '0.35em' }} />Repeat block runs everything below it N times · Click "Load" to auto-place blocks
                </div>
              </div>
            );
          })()}

          {/* Canvas with dot grid */}
          {useUnifiedBlocklyCanvas ? (
            <div className="bb-workspace-scratch-toolbox" style={{ flex: 1, minHeight: 0, background: 'var(--bg-primary)' }}>
              <UnifiedBlocklyWorkspace
                libraryPage="workspace"
                extensionsKey={robotType}
                scrollbarSide="top-left"
                onModelChange={(nodes) => setProgram(blocklyNodesToRobotProgram(nodes))}
                style={{ height: '100%' }}
              />
            </div>
          ) : (
          <div
            ref={canvasAreaRef}
            className="robot-block-canvas"
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
                <div style={{ fontSize: 52, marginBottom: 12, opacity: 0.3 }}><EmojiIcon e="🤖" /></div>
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
              
              // Convert to ScratchStyleBlock format
              const scratchBlock = {
                id: block.id,
                category: block.cat,
                type: block.id,
              };
              
              return (
                <ScratchStyleBlock
                  key={block.uid}
                  block={scratchBlock}
                  tabIndex={0}
                  onMouseDown={e => handleBlockMouseDown(e, block)}
                  onMouseEnter={() => setHoveredBlock(block.uid)}
                  onMouseLeave={() => setHoveredBlock(null)}
                  onKeyDown={e => {
                    if ((e.key === 'Delete' || e.key === 'Backspace') && e.target.tagName !== 'INPUT' && e.target.tagName !== 'SELECT' && e.target.tagName !== 'TEXTAREA') removeBlock(block.uid);
                    if (e.key === 'ArrowUp') setProgram((p) => normalizeRobotProgram(p.map(b => b.uid === block.uid ? { ...b, y: b.y - 8 } : b)));
                    if (e.key === 'ArrowDown') setProgram((p) => normalizeRobotProgram(p.map(b => b.uid === block.uid ? { ...b, y: b.y + 8 } : b)));
                  }}
                  style={{
                    position: 'absolute',
                    left: block.x,
                    top: block.y,
                    cursor: isDragging ? 'grabbing' : 'grab',
                    userSelect: 'none',
                    zIndex: isDragging ? 100 : isActive ? 100 : isSelected ? 50 : 1,
                    outline: isActive ? '3px solid #fbbf24' : isSelected ? `3px solid ${block.color}88` : 'none',
                    outlineOffset: '2px',
                    transform: 'none',
                    transition: 'outline 0.15s',
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
                      <EmojiIcon e="▶" style={{ marginRight: '0.35em' }} />Running
                    </div>
                  )}

                  {/* Step order badge */}
                  <span style={{
                    position: 'absolute', top: -10, left: -8,
                    background: block.color, color: '#fff',
                    borderRadius: '50%', width: 18, height: 18,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, fontWeight: 800, boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                  }}>{stepNum}</span>

                  <span style={{ fontSize: 16 }}><EmojiIcon e={block.icon} /></span>
                  <span style={{ marginRight: 4 }}>{block.label}</span>

                  {/* Inline param inputs */}
                  {cmdDef?.params.map(p => (
                    <span key={p.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      {p.type === 'select' ? (
                        <select
                          value={block.params[p.key]}
                          onChange={e => updateParam(block.uid, p.key, e.target.value)}
                          onMouseDown={e => e.stopPropagation()}
                          onClick={e => e.stopPropagation()}
                          style={{
                            background: '#ffffff', border: 'none', borderRadius: 10,
                            padding: '2px 6px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
                            color: '#575E75',
                          }}
                        >
                          {p.options.map((opt, i) => <option key={opt} value={opt}>{p.labels ? p.labels[i] : opt}</option>)}
                        </select>
                      ) : (
                        <input
                          type={p.type === 'number' ? 'number' : 'text'}
                          value={block.params[p.key]}
                          onChange={e => updateParam(block.uid, p.key, e.target.value)}
                          onMouseDown={e => e.stopPropagation()}
                          onClick={e => e.stopPropagation()}
                          style={{
                            background: '#ffffff', border: 'none', borderRadius: 10,
                            padding: '2px 8px', width: p.type === 'text' ? 80 : 50,
                            fontSize: 12, fontWeight: 600, textAlign: 'center',
                            fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
                            color: '#575E75',
                          }}
                          placeholder={p.default}
                        />
                      )}
                    </span>
                  ))}

                  {/* Delete button */}
                  <button
                    style={{
                      position: 'absolute', top: 5, right: 5, width: 18, height: 18,
                      borderRadius: '50%', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700,
                      background: hoveredBlock === block.uid ? '#ef4444' : 'transparent',
                      color: hoveredBlock === block.uid ? '#fff' : 'transparent',
                      transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      padding: 0, lineHeight: 1, pointerEvents: 'auto',
                    }}
                    onMouseDown={e => e.stopPropagation()}
                    onClick={e => { e.stopPropagation(); removeBlock(block.uid); }}
                  >×</button>
                </ScratchStyleBlock>
              );
            })}
          </div>
          )}

          <div style={s.runBar}>
            {running
              ? <button style={s.btn('#ef4444')} onClick={stopProgram}><EmojiIcon e="⏹" style={{ marginRight: '0.35em' }} />Stop</button>
              : <button style={{ ...s.btn('#22c55e'), opacity: program.length === 0 ? 0.4 : 1 }} onClick={runProgram} disabled={program.length === 0}>
                  <EmojiIcon e="▶" style={{ marginRight: '0.35em' }} />Run
                </button>
            }
            <button
              onClick={saveProgram}
              style={{
                ...s.btn(savedFlash ? '#22c55e' : '#334155'),
                transition: 'background 0.3s', minWidth: 80,
              }}
            >
              <IconText>{savedFlash ? '✓ Saved!' : '💾 Save'}</IconText>
            </button>
            {robotType === 'microbit' && (
              <div style={{ position: 'relative' }}>
                <button
                  style={{ ...s.btn(flashProgress !== null ? '#f59e0b' : '#6366f1'), marginLeft: 4, minWidth: 90 }}
                  onClick={() => setFlashMethod(flashMethod ? null : 'showOptions')}
                  disabled={flashProgress !== null}
                  title="Flash your program or Bluetooth bridge firmware"
                >
                  <IconText>{flashProgress === 'done' ? '✅ Done!' : flashProgress !== null ? `⚡ ${flashProgress}%` : '⚡ Flash'}</IconText>
                </button>
                {flashMethod === 'showOptions' && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, marginTop: 6,
                    background: 'var(--bg-primary)', border: '1px solid var(--border)',
                    borderRadius: 8,                     boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
                    zIndex: 1000, minWidth: 300, maxHeight: 'min(360px, 50vh)', overflowY: 'auto',
                  }}>
                    <button
                      onClick={() => handleFlashMethod('flash-runtime')}
                      style={{
                        display: 'block', width: '100%', padding: '12px 14px', textAlign: 'left',
                        background: 'linear-gradient(90deg, rgba(250,204,21,0.22), rgba(34,197,94,0.12))', border: 'none', color: 'var(--text-primary)',
                        cursor: 'pointer', fontSize: 13, borderBottom: '1px solid var(--border)', fontWeight: 700,
                      }}
                      title="Flash once — then send programs over USB or Bluetooth from any device. Programs are saved on the micro:bit."
                    >
                      ⭐ ByteBuddies Runtime — flash once (recommended)
                      <div style={{ fontWeight: 500, fontSize: 11, opacity: 0.75, marginTop: 2 }}>Then ▶ Run sends programs over USB or Bluetooth and saves them on the micro:bit</div>
                    </button>
                    <button
                      onClick={() => handleFlashMethod('download-runtime')}
                      style={{
                        display: 'block', width: '100%', padding: '10px 14px', textAlign: 'left',
                        background: 'transparent', border: 'none', color: 'var(--text-primary)',
                        cursor: 'pointer', fontSize: 13, borderBottom: '1px solid var(--border)', fontWeight: 600,
                      }}
                      title="For iPad, Safari, Firefox or any computer: download the runtime and copy it to the micro:bit"
                    >
                      <EmojiIcon e="📥" style={{ marginRight: '0.35em' }} />Download runtime — iPad, Safari, Firefox, any computer
                    </button>
                    <details style={{ padding: '0 10px 10px', borderTop: '1px solid var(--border)' }}>
                      <summary style={{ padding: '10px 4px 4px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12, fontWeight: 700 }}>
                        More flashing choices
                      </summary>
                    <button
                      onClick={() => handleFlashMethod('flash-micropython-runtime')}
                      style={{
                        display: 'block', width: '100%', padding: '10px 14px', textAlign: 'left',
                        background: 'rgba(34,197,94,0.12)', border: 'none', color: 'var(--text-primary)',
                        cursor: 'pointer', fontSize: 13, borderBottom: '1px solid var(--border)',
                        transition: 'background 0.2s', fontWeight: 600,
                      }}
                      onMouseEnter={e => { e.target.style.background = 'var(--bg-secondary)'; }}
                      onMouseLeave={e => { e.target.style.background = 'rgba(34,197,94,0.12)'; }}
                      title="Flash MicroPython once — then use USB + Run without reflashing"
                    >
                      <EmojiIcon e="✅" style={{ marginRight: '0.35em' }} />MicroPython (USB) — flash once
                    </button>
                    <button
                      onClick={() => handleFlashMethod('bluetooth-firmware')}
                      style={{
                        display: 'block', width: '100%', padding: '10px 14px', textAlign: 'left',
                        background: 'rgba(14,165,233,0.12)', border: 'none', color: 'var(--text-primary)',
                        cursor: 'pointer', fontSize: 13, borderBottom: '1px solid var(--border)',
                        transition: 'background 0.2s', fontWeight: 600,
                      }}
                      onMouseEnter={e => { e.target.style.background = 'var(--bg-secondary)'; }}
                      onMouseLeave={e => { e.target.style.background = 'rgba(14,165,233,0.12)'; }}
                      title="BLE bridge — flash once, then Connect Bluetooth + Run"
                    >
                      <EmojiIcon e="📡" style={{ marginRight: '0.35em' }} />Bluetooth bridge — flash once
                    </button>
                    <button
                      onClick={() => handleFlashMethod('flash-prog-auto')}
                      style={{
                        display: 'block', width: '100%', padding: '10px 14px', textAlign: 'left',
                        background: 'transparent', border: 'none', color: 'var(--text-muted)',
                        cursor: 'pointer', fontSize: 12, borderBottom: '1px solid var(--border)',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={e => { e.target.style.background = 'var(--bg-secondary)'; }}
                      onMouseLeave={e => { e.target.style.background = 'transparent'; }}
                      title="Bakes blocks into a hex file — only if you need offline .hex"
                    >
                      <EmojiIcon e="⚡" style={{ marginRight: '0.35em' }} />Flash current program (advanced)
                    </button>
                    <button
                      onClick={() => handleFlashMethod('flash-prog-webusb')}
                      style={{
                        display: 'block', width: '100%', padding: '10px 14px', textAlign: 'left',
                        background: 'transparent', border: 'none', color: 'var(--text-primary)',
                        cursor: 'pointer', fontSize: 13, borderBottom: '1px solid var(--border)',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={e => { e.target.style.background = 'var(--bg-secondary)'; }}
                      onMouseLeave={e => { e.target.style.background = 'transparent'; }}
                      title="Chrome / Edge — direct USB like MakeCode"
                    >
                      <EmojiIcon e="🔌" style={{ marginRight: '0.35em' }} />WebUSB only (Chrome / Edge)
                    </button>
                    <button
                      onClick={() => handleFlashMethod('flash-prog-msd')}
                      style={{
                        display: 'block', width: '100%', padding: '10px 14px', textAlign: 'left',
                        background: 'transparent', border: 'none', color: 'var(--text-primary)',
                        cursor: 'pointer', fontSize: 13, borderBottom: '1px solid var(--border)',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={e => { e.target.style.background = 'var(--bg-secondary)'; }}
                      onMouseLeave={e => { e.target.style.background = 'transparent'; }}
                      title="Requires ByteBuddies desktop (Electron)"
                    >
                      <EmojiIcon e="💾" style={{ marginRight: '0.35em' }} />USB drive copy (desktop app)
                    </button>
                    <button
                      onClick={() => handleFlashMethod('flash-prog-ble')}
                      style={{
                        display: 'block', width: '100%', padding: '10px 14px', textAlign: 'left',
                        background: 'transparent', border: 'none', color: 'var(--text-primary)',
                        cursor: 'pointer', fontSize: 13, borderBottom: '1px solid var(--border)',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={e => { e.target.style.background = 'var(--bg-secondary)'; }}
                      onMouseLeave={e => { e.target.style.background = 'transparent'; }}
                      title="MicroPython → USB; MakeCode hex → wireless partial update"
                    >
                      <EmojiIcon e="📡" style={{ marginRight: '0.35em' }} />Bluetooth (USB for blocks / partial for MakeCode)
                    </button>
                    <button
                      onClick={() => handleFlashMethod('flash-prog-download')}
                      style={{
                        display: 'block', width: '100%', padding: '10px 14px', textAlign: 'left',
                        background: 'transparent', border: 'none', color: 'var(--text-primary)',
                        cursor: 'pointer', fontSize: 13, borderBottom: '1px solid var(--border)',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={e => { e.target.style.background = 'var(--bg-secondary)'; }}
                      onMouseLeave={e => { e.target.style.background = 'transparent'; }}
                      title="Drag program.hex to the MICROBIT drive"
                    >
                      <EmojiIcon e="⬇️" style={{ marginRight: '0.35em' }} />Download .hex only
                    </button>
                    </details>
                  </div>
                )}
              </div>
            )}
            {robotType === 'quarky' && (
              <button style={{ ...s.btn('#0e7490'), marginLeft: 2 }} onClick={handleDownloadQuarkyProgram} disabled={program.length === 0} title="Export the blocks using Quarky's native PictoBlox Python API">
                <EmojiIcon e="⬇️" style={{ marginRight: '0.35em' }} />Export for PictoBlox
              </button>
            )}
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{program.length} block{program.length !== 1 ? 's' : ''}</span>
            {!connected && program.length > 0 && robotType === 'microbit' && <span style={{ fontSize: 12, color: '#a5b4fc', marginLeft: 'auto' }}><EmojiIcon e="💡" style={{ marginRight: '0.35em' }} />Click ⚡ Flash to program your micro:bit</span>}
            {!connected && program.length > 0 && robotType !== 'microbit' && <span style={{ fontSize: 12, color: '#fbbf24', marginLeft: 'auto' }}><EmojiIcon e="⚠️" style={{ marginRight: '0.35em' }} />Sim only — connect robot first</span>}
            {connected && firmwareOk === false && robotType === 'microbit' && <span style={{ fontSize: 12, color: '#fbbf24', marginLeft: 'auto' }}><EmojiIcon e="💡" style={{ marginRight: '0.35em' }} />MakeCode detected — click ⚡ Flash</span>}
            {connected && firmwareOk === false && robotType === 'quarky' && <span style={{ fontSize: 12, color: '#fbbf24', marginLeft: 'auto' }}><EmojiIcon e="💡" style={{ marginRight: '0.35em' }} />No MicroPython detected — flash it via Thonny first</span>}
            {connected && firmwareOk === true && <span style={{ fontSize: 12, color: '#4ade80', marginLeft: 'auto' }}><EmojiIcon e="✅" style={{ marginRight: '0.35em' }} />{profile.name} live ready</span>}
            {connected && firmwareOk === null && robotType !== 'microbit' && <span style={{ fontSize: 12, color: '#4ade80', marginLeft: 'auto' }}><EmojiIcon e="✅" style={{ marginRight: '0.35em' }} />{profile.name} ready</span>}
          </div>
        </div>

        {/* Right: virtual robot + terminal */}
        <div style={s.rightCol}>
          <div style={s.tabBar}>
            {['virtual', 'terminal', 'code'].map(tab => (
              <button key={tab} style={s.tab(rightTab === tab)} onClick={() => setRightTab(tab)}>
                <IconText>{tab === 'virtual' ? '🤖 Simulator' : tab === 'terminal' ? '💻 Terminal' : '📄 Code'}</IconText>
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
                      <span style={{ fontSize: 18 }}><EmojiIcon e={r.icon} /></span>
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
                      <span style={{ fontSize: 15 }}><EmojiIcon e={t.icon} /></span>
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
                    ><IconText>{running ? '⏹' : '▶'}</IconText></button>

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
                    <button title="Forward" style={{ ...s.btn('#22c55e'), justifyContent: 'center', padding: '7px 0' }} onClick={() => { robotRef.current?.execute({ id: 'forward', params: { amount: 40 } }); if (connected) sendLive('forward', { amount: 40 }); }}><EmojiIcon e="⬆️" /></button>
                    <div /><div />
                    {/* Row 2: turn-left, strafe-left, stop, strafe-right, turn-right */}
                    <button title="Turn Left" style={{ ...s.btn('#3b82f6'), justifyContent: 'center', padding: '7px 0' }} onClick={() => { robotRef.current?.execute({ id: 'left', params: { degrees: 45 } }); if (connected) sendLive('left', { degrees: 45 }); }}>↺</button>
                    <button title="Move Left" style={{ ...s.btn('#06b6d4'), justifyContent: 'center', padding: '7px 0' }} onClick={() => robotRef.current?.execute({ id: 'move_left', params: { amount: 40 } })}><EmojiIcon e="⬅️" /></button>
                    <button title="Stop" style={{ ...s.btn('#f59e0b'), justifyContent: 'center', padding: '7px 0' }} onClick={() => { if (connected) sendLive('stop', {}); }}><EmojiIcon e="⏹" /></button>
                    <button title="Move Right" style={{ ...s.btn('#06b6d4'), justifyContent: 'center', padding: '7px 0' }} onClick={() => robotRef.current?.execute({ id: 'move_right', params: { amount: 40 } })}><EmojiIcon e="➡️" /></button>
                    <button title="Turn Right" style={{ ...s.btn('#a855f7'), justifyContent: 'center', padding: '7px 0' }} onClick={() => { robotRef.current?.execute({ id: 'right', params: { degrees: 45 } }); if (connected) sendLive('right', { degrees: 45 }); }}>↻</button>
                    {/* Row 3: empty, empty, down, empty, empty */}
                    <div /><div />
                    <button title="Backward" style={{ ...s.btn('#ef4444'), justifyContent: 'center', padding: '7px 0' }} onClick={() => { robotRef.current?.execute({ id: 'back', params: { amount: 40 } }); if (connected) sendLive('back', { amount: 40 }); }}><EmojiIcon e="⬇️" /></button>
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
              {robotType === 'microbit' && (
                <MicrobitDualFlashPanel
                  buildHex={buildHexForDualFlash}
                  hasProgram={program.length > 0}
                  board={microbitHw === 'v1' ? 'v1' : 'v2'}
                  onBoardChange={(hw) => {
                    setMicrobitHw(hw);
                    localStorage.setItem('cv_mb_hw', hw);
                  }}
                  disabled={flashProgress !== null}
                  onTerminal={addTerminal}
                  onFlashProgress={setFlashProgress}
                  onConnectBluetooth={connectBluetooth}
                  onConnectUsb={connect}
                  bluetoothConnected={connected && connectionKind === 'bluetooth'}
                  beforeUsbFlash={async () => {
                    if (connectedRef.current && connectionTypeRef.current === 'usb') {
                      addTerminal('🔌 Releasing USB serial for WebUSB flash…', 'info');
                      await disconnect();
                      await new Promise((r) => setTimeout(r, 1000));
                    }
                  }}
                />
              )}
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
                  <EmojiIcon e="📋" style={{ marginRight: '0.35em' }} />Copy Code
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
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, background: ui.setupBg, border: `1px solid ${ui.setupBorder}`, borderRadius: 12, padding: '14px 20px', minWidth: 260, boxShadow: '0 8px 32px rgba(0,0,0,0.35)' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: isLightTheme ? '#1e293b' : '#e0e7ff' }}><EmojiIcon e="⚡" style={{ marginRight: '0.35em' }} />Flashing to micro:bit...</div>
          <div style={{ background: isLightTheme ? '#c7d2fe' : '#312e81', borderRadius: 6, height: 8, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'linear-gradient(90deg,#6366f1,#a5b4fc)', width: `${flashProgress}%`, transition: 'width 0.3s ease', borderRadius: 6 }} />
          </div>
          <div style={{ fontSize: 12, color: isLightTheme ? '#4338ca' : '#a5b4fc', marginTop: 6, textAlign: 'right' }}>{flashProgress}%</div>
        </div>
      )}
    </div>
  );
}
