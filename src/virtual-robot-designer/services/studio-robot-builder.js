/**
 * studio-robot-builder.js
 * Three.js robot model builder for ByteBuddies Robot Invention Studio.
 * Creates distinct, visually rich 3D models for each chassis type.
 */
import * as THREE from 'three';
import { prepareLabRobot } from './art-direction.js';

// Shared geometry instances (reused across builds)
const BOX_GEO = new THREE.BoxGeometry(1, 1, 1);
const SPHERE_GEO = new THREE.SphereGeometry(1, 12, 8);
const CYL_GEO = new THREE.CylinderGeometry(1, 1, 1, 20);

// ─── Procedural Texture Cache ─────────────────────────────────────────────
const _texCache = {};

function _drawNoise(ctx, w, h, alpha = 0.04) {
  const id = ctx.createImageData(w, h);
  for (let i = 0; i < id.data.length; i += 4) {
    const v = (Math.random() - 0.5) * 40;
    id.data[i] = 128 + v; id.data[i + 1] = 128 + v; id.data[i + 2] = 128 + v;
    id.data[i + 3] = Math.floor(alpha * 255);
  }
  ctx.putImageData(id, 0, 0);
}

/** Metal panel texture with seam lines + rivets */
function getPanelTex(key = 'panel') {
  if (_texCache[key]) return _texCache[key];
  const S = 512;
  const c = document.createElement('canvas'); c.width = S; c.height = S;
  const g = c.getContext('2d');
  // Light gradient base — stays near white so it doesn't mute the base color
  const grd = g.createLinearGradient(0, 0, S, S);
  grd.addColorStop(0, '#e8e8e8'); grd.addColorStop(0.5, '#d8d8d8'); grd.addColorStop(1, '#e0e0e0');
  g.fillStyle = grd; g.fillRect(0, 0, S, S);
  // Panel seam grid lines
  g.strokeStyle = 'rgba(30,30,30,0.45)'; g.lineWidth = 1.8;
  for (let i = 0; i <= S; i += 80) {
    g.beginPath(); g.moveTo(i, 0); g.lineTo(i, S); g.stroke();
    g.beginPath(); g.moveTo(0, i); g.lineTo(S, i); g.stroke();
  }
  // Inner panel bevel highlight
  g.strokeStyle = 'rgba(200,200,200,0.18)'; g.lineWidth = 0.8;
  for (let i = 0; i <= S; i += 80) {
    g.beginPath(); g.moveTo(i + 2, 0); g.lineTo(i + 2, S); g.stroke();
    g.beginPath(); g.moveTo(0, i + 2); g.lineTo(S, i + 2); g.stroke();
  }
  // Rivets at intersections
  const rv = 3.5;
  for (let x = 40; x < S; x += 80) {
    for (let y = 40; y < S; y += 80) {
      const rg = g.createRadialGradient(x - 1, y - 1, 0, x, y, rv);
      rg.addColorStop(0, 'rgba(230,230,230,0.9)'); rg.addColorStop(1, 'rgba(100,100,100,0.5)');
      g.fillStyle = rg; g.beginPath(); g.arc(x, y, rv, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(50,50,50,0.3)'; g.lineWidth = 0.8;
      g.beginPath(); g.arc(x, y, rv, 0, Math.PI * 2); g.stroke();
    }
  }
  // Fine scratches
  g.strokeStyle = 'rgba(220,220,220,0.12)'; g.lineWidth = 0.6;
  for (let n = 0; n < 30; n++) {
    const x = Math.random() * S, y = Math.random() * S;
    const len = 8 + Math.random() * 40, a = Math.random() * Math.PI;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len); g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(3, 3);
  _texCache[key] = tex;
  return tex;
}

/** Brushed metal texture (directional striations) */
function getBrushedMetalTex() {
  if (_texCache.brushed) return _texCache.brushed;
  const S = 256;
  const c = document.createElement('canvas'); c.width = S; c.height = S;
  const g = c.getContext('2d');
  g.fillStyle = '#888'; g.fillRect(0, 0, S, S);
  for (let y = 0; y < S; y += 2) {
    const v = 100 + Math.random() * 40;
    g.strokeStyle = `rgba(${v},${v},${v},0.18)`; g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(0, y); g.lineTo(S, y + (Math.random() - 0.5) * 3); g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(2, 2);
  _texCache.brushed = tex;
  return tex;
}

/** Carbon fiber weave texture */
function getCarbonFiberTex() {
  if (_texCache.carbon) return _texCache.carbon;
  const S = 128;
  const c = document.createElement('canvas'); c.width = S; c.height = S;
  const g = c.getContext('2d');
  g.fillStyle = '#111'; g.fillRect(0, 0, S, S);
  const cell = 8;
  for (let cx = 0; cx < S; cx += cell) {
    for (let cy = 0; cy < S; cy += cell) {
      const tog = ((cx / cell) + (cy / cell)) % 2 === 0;
      g.fillStyle = tog ? 'rgba(55,55,55,0.9)' : 'rgba(20,20,20,0.9)';
      g.fillRect(cx, cy, cell, cell);
      g.strokeStyle = 'rgba(0,0,0,0.7)'; g.lineWidth = 0.8;
      g.strokeRect(cx, cy, cell, cell);
      // fiber sheen
      const sg = g.createLinearGradient(cx, cy, cx + cell, cy);
      sg.addColorStop(0, 'rgba(255,255,255,0.0)');
      sg.addColorStop(0.5, tog ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)');
      sg.addColorStop(1, 'rgba(255,255,255,0.0)');
      g.fillStyle = sg; g.fillRect(cx, cy, cell, cell);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(4, 4);
  _texCache.carbon = tex;
  return tex;
}

/** Rubber tread texture */
function getRubberTex() {
  if (_texCache.rubber) return _texCache.rubber;
  const S = 128;
  const c = document.createElement('canvas'); c.width = S; c.height = S;
  const g = c.getContext('2d');
  g.fillStyle = '#222'; g.fillRect(0, 0, S, S);
  g.strokeStyle = 'rgba(80,80,80,0.6)'; g.lineWidth = 3;
  for (let y = 0; y < S; y += 14) {
    g.beginPath(); g.moveTo(0, y); g.lineTo(S, y); g.stroke();
  }
  g.strokeStyle = 'rgba(60,60,60,0.4)'; g.lineWidth = 1.5;
  for (let x = 0; x < S; x += 20) {
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x, S); g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(2, 1);
  _texCache.rubber = tex;
  return tex;
}

/** Glass lens texture (subtle internal ring reflections) */
function getGlassTex() {
  if (_texCache.glass) return _texCache.glass;
  const S = 128;
  const c = document.createElement('canvas'); c.width = S; c.height = S;
  const g = c.getContext('2d');
  g.fillStyle = 'rgba(10,30,60,0.92)'; g.fillRect(0, 0, S, S);
  for (let r = 8; r < 60; r += 12) {
    g.strokeStyle = `rgba(100,180,255,${0.15 - r * 0.001})`; g.lineWidth = 1;
    g.beginPath(); g.arc(S / 2, S / 2, r, 0, Math.PI * 2); g.stroke();
  }
  const sg = g.createRadialGradient(S * 0.35, S * 0.35, 2, S / 2, S / 2, S * 0.5);
  sg.addColorStop(0, 'rgba(255,255,255,0.25)'); sg.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = sg; g.fillRect(0, 0, S, S);
  const tex = new THREE.CanvasTexture(c);
  _texCache.glass = tex;
  return tex;
}

/** Equirectangular environment texture for scene reflections */
function buildEnvTex() {
  if (_texCache.env) return _texCache.env;
  const W = 512, H = 256;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  const sky = g.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0.0, '#a8c8f8');   // top sky blue
  sky.addColorStop(0.35, '#dce8ff');  // horizon
  sky.addColorStop(0.5, '#f0f4ff');   // bright horizon
  sky.addColorStop(0.65, '#c8d4e8');  // ground horizon
  sky.addColorStop(1.0, '#8090a8');   // dark ground
  g.fillStyle = sky; g.fillRect(0, 0, W, H);
  // Horizon white glow
  g.fillStyle = 'rgba(255,255,255,0.22)';
  g.fillRect(0, H * 0.42, W, H * 0.16);
  // Studio ceiling panels
  for (let x = 0; x < W; x += 60) {
    g.strokeStyle = 'rgba(255,255,255,0.06)'; g.lineWidth = 1;
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H * 0.4); g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  _texCache.env = tex;
  return tex;
}

// ─── Chassis catalogue ─────────────────────────────────────────────────────
export const CHASSIS_DATA = [
  // ── Ground Robots ──────────────────────────────────────────────────────────
  {
    id: 'rover',
    name: 'Rover',
    icon: '🚙',
    badge: 'Balanced',
    primaryColor: '#FF8C00',
    accentColor: '#FFD700',
    speed: 75, power: 70, durability: 80,
    weight: '2.1 kg', movement: 'Wheels',
    movementHint: 'wheels',
    bgGrad: ['#FFF3E0', '#FFE0B2'],
  },
  {
    id: 'scout',
    name: 'Scout Rover',
    icon: '⚡',
    badge: 'Speed',
    primaryColor: '#1E90FF',
    accentColor: '#00D9FF',
    speed: 95, power: 60, durability: 55,
    weight: '1.2 kg', movement: 'Wheels',
    movementHint: 'wheels',
    bgGrad: ['#E3F2FD', '#BBDEFB'],
  },
  {
    id: 'crawler',
    name: 'Crawler',
    icon: '🌿',
    badge: 'All-Terrain',
    primaryColor: '#00C851',
    accentColor: '#69F0AE',
    speed: 60, power: 80, durability: 85,
    weight: '2.8 kg', movement: 'Wheels (6)',
    movementHint: 'wheels6',
    bgGrad: ['#E8F5E9', '#C8E6C9'],
  },
  {
    id: 'tank',
    name: 'Tank',
    icon: '🛡️',
    badge: 'Heavy',
    primaryColor: '#2C3E50',
    accentColor: '#95A5A6',
    speed: 40, power: 95, durability: 95,
    weight: '4.5 kg', movement: 'Tracks',
    movementHint: 'tracks',
    bgGrad: ['#ECEFF1', '#CFD8DC'],
  },
  {
    id: 'stealth',
    name: 'Stealth',
    icon: '🌑',
    badge: 'Dark Ops',
    primaryColor: '#0d0d1a',
    accentColor: '#00D9FF',
    speed: 70, power: 88, durability: 90,
    weight: '3.5 kg', movement: 'Wheels',
    movementHint: 'wheels',
    bgGrad: ['#E8EAF6', '#C5CAE9'],
  },
  {
    id: 'miningbot',
    name: 'Mining Bot',
    icon: '⛏️',
    badge: 'Heavy Duty',
    primaryColor: '#78350f',
    accentColor: '#fbbf24',
    speed: 30, power: 98, durability: 95,
    weight: '7.0 kg', movement: 'Tracks',
    movementHint: 'tracks',
    bgGrad: ['#FFFBEB', '#FEF3C7'],
  },
  {
    id: 'securitybot',
    name: 'Security Bot',
    icon: '👮',
    badge: 'Patrol',
    primaryColor: '#1e40af',
    accentColor: '#60a5fa',
    speed: 68, power: 72, durability: 80,
    weight: '2.3 kg', movement: 'Wheels',
    movementHint: 'wheels',
    bgGrad: ['#EFF6FF', '#DBEAFE'],
  },
  {
    id: 'farmbot',
    name: 'Farm Bot',
    icon: '🌾',
    badge: 'Agriculture',
    primaryColor: '#65a30d',
    accentColor: '#bef264',
    speed: 38, power: 75, durability: 80,
    weight: '2.6 kg', movement: 'Wheels',
    movementHint: 'wheels',
    bgGrad: ['#F7FEE7', '#ECFCCB'],
  },
  // ── Walking Robots ─────────────────────────────────────────────────────────
  {
    id: 'spider',
    name: 'Spider Bot',
    icon: '🕷️',
    badge: 'Walker',
    primaryColor: '#10b981',
    accentColor: '#34d399',
    speed: 55, power: 72, durability: 78,
    weight: '1.8 kg', movement: 'Legs',
    movementHint: 'legs',
    bgGrad: ['#D1FAE5', '#A7F3D0'],
  },
  {
    id: 'droid',
    name: 'Humanoid',
    icon: '🤖',
    badge: 'Bipedal',
    primaryColor: '#9B59B6',
    accentColor: '#BB86FC',
    speed: 65, power: 75, durability: 70,
    weight: '2.0 kg', movement: 'Legs',
    movementHint: 'legs',
    bgGrad: ['#F3E5F5', '#E1BEE7'],
  },
  {
    id: 'mech',
    name: 'Mech Walker',
    icon: '🦾',
    badge: 'Heavy Walker',
    primaryColor: '#dc2626',
    accentColor: '#fbbf24',
    speed: 45, power: 95, durability: 92,
    weight: '5.2 kg', movement: 'Legs',
    movementHint: 'legs',
    bgGrad: ['#FEF2F2', '#FEE2E2'],
  },
  // ── Flying Robots ──────────────────────────────────────────────────────────
  {
    id: 'drone',
    name: 'Drone',
    icon: '🚁',
    badge: 'Quadcopter',
    primaryColor: '#06b6d4',
    accentColor: '#67e8f9',
    speed: 88, power: 60, durability: 50,
    weight: '0.8 kg', movement: 'Flying',
    movementHint: 'flying',
    bgGrad: ['#ECFEFF', '#CFFAFE'],
  },
  {
    id: 'racedrone',
    name: 'Racing Drone',
    icon: '🏎️',
    badge: 'Speed',
    primaryColor: '#f59e0b',
    accentColor: '#fcd34d',
    speed: 99, power: 55, durability: 40,
    weight: '0.5 kg', movement: 'Flying',
    movementHint: 'flying',
    bgGrad: ['#FFFBEB', '#FEF3C7'],
  },
  {
    id: 'rescuedrone',
    name: 'Rescue Drone',
    icon: '🚑',
    badge: 'Search & Rescue',
    primaryColor: '#ef4444',
    accentColor: '#fca5a5',
    speed: 78, power: 65, durability: 60,
    weight: '1.1 kg', movement: 'Flying',
    movementHint: 'flying',
    bgGrad: ['#FEF2F2', '#FEE2E2'],
  },
  {
    id: 'helicopter',
    name: 'Helicopter',
    icon: '🚁',
    badge: 'Heavy Lift',
    primaryColor: '#7c3aed',
    accentColor: '#c4b5fd',
    speed: 70, power: 85, durability: 75,
    weight: '2.4 kg', movement: 'Flying',
    movementHint: 'flying',
    bgGrad: ['#EDE9FE', '#DDD6FE'],
  },
  // ── Hover Robots ───────────────────────────────────────────────────────────
  {
    id: 'hoverbot',
    name: 'Hover Bot',
    icon: '🛸',
    badge: 'Anti-Gravity',
    primaryColor: '#8b5cf6',
    accentColor: '#c4b5fd',
    speed: 80, power: 70, durability: 65,
    weight: '1.0 kg', movement: 'Hover',
    movementHint: 'hover',
    bgGrad: ['#F5F3FF', '#EDE9FE'],
  },
  {
    id: 'hoverracer',
    name: 'Hover Racer',
    icon: '🏁',
    badge: 'Turbo',
    primaryColor: '#ec4899',
    accentColor: '#f9a8d4',
    speed: 96, power: 62, durability: 48,
    weight: '0.7 kg', movement: 'Hover',
    movementHint: 'hover',
    bgGrad: ['#FDF2F8', '#FCE7F3'],
  },
  // ── Underwater Robots ──────────────────────────────────────────────────────
  {
    id: 'submarine',
    name: 'Sub Drone',
    icon: '🌊',
    badge: 'Underwater',
    primaryColor: '#0284c7',
    accentColor: '#38bdf8',
    speed: 50, power: 75, durability: 85,
    weight: '3.0 kg', movement: 'Swim',
    movementHint: 'swim',
    bgGrad: ['#F0F9FF', '#E0F2FE'],
  },
  {
    id: 'deepseabot',
    name: 'Deep Sea Bot',
    icon: '🐙',
    badge: 'Deep Dive',
    primaryColor: '#164e63',
    accentColor: '#22d3ee',
    speed: 35, power: 88, durability: 95,
    weight: '5.8 kg', movement: 'Swim',
    movementHint: 'swim',
    bgGrad: ['#ECFEFF', '#CFFAFE'],
  },
  // ── Factory / Industrial Robots ────────────────────────────────────────────
  {
    id: 'robotarm',
    name: 'Robot Arm',
    icon: '🦿',
    badge: 'Precision',
    primaryColor: '#ec4899',
    accentColor: '#f9a8d4',
    speed: 30, power: 90, durability: 88,
    weight: '4.0 kg', movement: 'Fixed',
    movementHint: 'wheels',
    bgGrad: ['#FDF2F8', '#FCE7F3'],
  },
  {
    id: 'factorybot',
    name: 'Factory Bot',
    icon: '🏭',
    badge: 'Industrial',
    primaryColor: '#f97316',
    accentColor: '#fdba74',
    speed: 42, power: 88, durability: 90,
    weight: '3.8 kg', movement: 'Tracks',
    movementHint: 'tracks',
    bgGrad: ['#FFF7ED', '#FFEDD5'],
  },
  // ── Space Robots ───────────────────────────────────────────────────────────
  {
    id: 'spacerover',
    name: 'Space Rover',
    icon: '🚀',
    badge: 'Astronaut',
    primaryColor: '#94a3b8',
    accentColor: '#e2e8f0',
    speed: 48, power: 78, durability: 90,
    weight: '3.2 kg', movement: 'Wheels (6)',
    movementHint: 'wheels6',
    bgGrad: ['#F8FAFC', '#F1F5F9'],
  },
  // ── Special Robots ─────────────────────────────────────────────────────────
  {
    id: 'legobot',
    name: 'LEGO Bot',
    icon: '🧱',
    badge: 'Builder',
    primaryColor: '#f59e0b',
    accentColor: '#fcd34d',
    speed: 55, power: 65, durability: 80,
    weight: '1.5 kg', movement: 'Legs',
    movementHint: 'legs',
    bgGrad: ['#FFFBEB', '#FEF3C7'],
  },
  {
    id: 'battlebot',
    name: 'Battle Mech',
    icon: '⚔️',
    badge: 'Combat',
    primaryColor: '#1f2937',
    accentColor: '#ef4444',
    speed: 65, power: 99, durability: 99,
    weight: '6.0 kg', movement: 'Tracks',
    movementHint: 'tracks',
    bgGrad: ['#F9FAFB', '#F3F4F6'],
  },
  {
    id: 'medbot',
    name: 'Med Bot',
    icon: '🏥',
    badge: 'Medical',
    primaryColor: '#0ea5e9',
    accentColor: '#7dd3fc',
    speed: 50, power: 65, durability: 70,
    weight: '1.8 kg', movement: 'Wheels',
    movementHint: 'wheels',
    bgGrad: ['#F0F9FF', '#E0F2FE'],
  },
  {
    id: 'firebot',
    name: 'Fire Fighter',
    icon: '🔥',
    badge: 'Emergency',
    primaryColor: '#dc2626',
    accentColor: '#fbbf24',
    speed: 72, power: 82, durability: 88,
    weight: '3.5 kg', movement: 'Wheels',
    movementHint: 'wheels',
    bgGrad: ['#FEF2F2', '#FEE2E2'],
  },
  // ── Jet / Plane ────────────────────────────────────────────────────────────
  {
    id: 'jetplane',
    name: 'Jet Fighter',
    icon: '✈️',
    badge: 'Fixed-Wing',
    primaryColor: '#1e40af',
    accentColor: '#60a5fa',
    speed: 99, power: 70, durability: 55,
    weight: '1.4 kg', movement: 'Jets',
    movementHint: 'jets',
    bgGrad: ['#EFF6FF', '#DBEAFE'],
  },
  {
    id: 'steathjet',
    name: 'Stealth Jet',
    icon: '🌑',
    badge: 'Stealth',
    primaryColor: '#0d0d1a',
    accentColor: '#06b6d4',
    speed: 95, power: 75, durability: 60,
    weight: '1.6 kg', movement: 'Jets',
    movementHint: 'jets',
    bgGrad: ['#E8EAF6', '#C5CAE9'],
  },
  {
    id: 'aerobat',
    name: 'Aero Stunt',
    icon: '💫',
    badge: 'Aerobatics',
    primaryColor: '#ef4444',
    accentColor: '#fbbf24',
    speed: 88, power: 65, durability: 50,
    weight: '1.0 kg', movement: 'Jets',
    movementHint: 'jets',
    bgGrad: ['#FFF1F2', '#FFE4E6'],
  },
];

// ─── Parts catalogues ──────────────────────────────────────────────────────

// SENSORS — Vision, Distance, Environment, AI Vision, Special
export const SENSORS_DATA = [
  // Vision
  { id: 'camera',       name: 'Camera',          icon: '📷', color: '#1E90FF',  stat: { vision: +15 }, unlock: 'See & record' },
  { id: 'hd-camera',    name: 'HD Camera',        icon: '🎥', color: '#2563EB',  stat: { vision: +25 }, unlock: 'High-res video' },
  { id: 'cam-360',      name: '360° Camera',      icon: '🌐', color: '#3B82F6',  stat: { vision: +35 }, unlock: 'Full panorama' },
  { id: 'night-vision', name: 'Night Vision',     icon: '🌙', color: '#6366F1',  stat: { vision: +20 }, unlock: 'See in dark' },
  { id: 'thermal',      name: 'Thermal Vision',   icon: '🌡️', color: '#EF4444',  stat: { vision: +18 }, unlock: 'Heat detection' },
  { id: 'depth-cam',    name: 'Depth Camera',     icon: '🔭', color: '#0891B2',  stat: { vision: +30 }, unlock: '3D depth mapping' },
  // Distance
  { id: 'ultrasonic',   name: 'Sonar',            icon: '📡', color: '#00D9FF',  stat: { range: +12 },  unlock: 'Distance scan' },
  { id: 'lidar',        name: 'LIDAR',            icon: '🔴', color: '#FF3333',  stat: { range: +40 },  unlock: '360° 3D mapping' },
  { id: 'radar',        name: 'Radar',            icon: '🛰️', color: '#F59E0B',  stat: { range: +50 },  unlock: 'Long-range detect' },
  { id: 'sonar',        name: 'Sonar Dome',       icon: '🔊', color: '#06B6D4',  stat: { range: +20 },  unlock: 'Underwater scan' },
  // Environment
  { id: 'ir',           name: 'Infrared',         icon: '♨️', color: '#FF8C00',  stat: { sense: +10 },  unlock: 'Heat & motion' },
  { id: 'gyro',         name: 'Gyro',             icon: '🔄', color: '#00C851',  stat: { balance: +20 },unlock: 'Balance control' },
  { id: 'gps',          name: 'GPS',              icon: '📍', color: '#FFD700',  stat: { nav: +25 },    unlock: 'GPS navigation' },
  { id: 'temp-sensor',  name: 'Temp Sensor',      icon: '🌡️', color: '#F87171',  stat: { sense: +8 },   unlock: 'Temperature read' },
  { id: 'gas-detector', name: 'Gas Detector',     icon: '💨', color: '#A3E635',  stat: { sense: +12 },  unlock: 'Detect gases' },
  { id: 'pressure',     name: 'Pressure Sensor',  icon: '⏱️', color: '#818CF8',  stat: { sense: +8 },   unlock: 'Measure pressure' },
  // AI Vision
  { id: 'face-recog',   name: 'Face Recognition', icon: '👤', color: '#7C3AED',  stat: { ai: +30 },     unlock: 'Face detection' },
  { id: 'obj-recog',    name: 'Object Scanner',   icon: '🧠', color: '#8B5CF6',  stat: { ai: +25 },     unlock: 'Identify objects' },
  { id: 'color-scan',   name: 'Color Scanner',    icon: '🎨', color: '#EC4899',  stat: { ai: +15 },     unlock: 'Detect colors' },
  // Special
  { id: 'radiation',    name: 'Radiation Sensor', icon: '☢️', color: '#84CC16',  stat: { sense: +20 },  unlock: 'Radiation detect' },
  { id: 'bio-scanner',  name: 'Bio Scanner',      icon: '🧬', color: '#10B981',  stat: { sense: +25 },  unlock: 'Life detection' },
  { id: 'magnetic',     name: 'Magnetic Scanner', icon: '🧲', color: '#6366F1',  stat: { sense: +15 },  unlock: 'Detect metals' },
  { id: 'collision',    name: 'Collision Sensor', icon: '💥', color: '#F97316',  stat: { safety: +20 }, unlock: 'Bump detection' },
  { id: 'motion-det',   name: 'Motion Detector',  icon: '〰️', color: '#F59E0B',  stat: { safety: +15 }, unlock: 'Motion alerts' },
];

// TOOLS — Industrial, Rescue, Mining, Science, Construction
export const TOOLS_DATA = [
  // Standard Grabs
  { id: 'grabber',      name: 'Grabber',          icon: '✊', color: '#FF8C00',  stat: { grip: +20 },   unlock: 'Pick up objects' },
  { id: 'claw',         name: 'Claw',             icon: '🦀', color: '#FF6B6B',  stat: { grip: +25 },   unlock: 'Crab claw grip' },
  { id: 'mag-hand',     name: 'Magnetic Hand',    icon: '🧲', color: '#818CF8',  stat: { grip: +30 },   unlock: 'Grab metal objects' },
  { id: 'precision',    name: 'Precision Hand',   icon: '✋', color: '#94A3B8',  stat: { grip: +35 },   unlock: 'Delicate tasks' },
  { id: 'humanoid-hand',name: 'Humanoid Hand',    icon: '🖐️', color: '#FBBF24',  stat: { grip: +40 },   unlock: 'Human-like grasp' },
  // Industrial
  { id: 'drill',        name: 'Drill',            icon: '🔩', color: '#888888',  stat: { power: +15 },  unlock: 'Drilling tool' },
  { id: 'laser',        name: 'Laser Cutter',     icon: '⚡', color: '#FF00FF',  stat: { power: +20 },  unlock: 'Cut with laser' },
  { id: 'welding',      name: 'Welding Torch',    icon: '🔥', color: '#FF4500',  stat: { power: +18 },  unlock: 'Weld metal' },
  { id: 'screwdriver',  name: 'Screwdriver',      icon: '🔧', color: '#6B7280',  stat: { power: +8 },   unlock: 'Assembly tool' },
  { id: 'wrench',       name: 'Wrench',           icon: '🔩', color: '#9CA3AF',  stat: { power: +8 },   unlock: 'Repair tool' },
  { id: 'saw',          name: 'Saw',              icon: '⚙️', color: '#555555',  stat: { power: +12 },  unlock: 'Cutting blade' },
  { id: 'assembly-arm', name: 'Assembly Arm',     icon: '🦿', color: '#EC4899',  stat: { power: +22 },  unlock: 'Assembly tasks' },
  // Rescue
  { id: 'rescue-claw',  name: 'Rescue Claw',      icon: '🚨', color: '#EF4444',  stat: { rescue: +30 }, unlock: 'Emergency rescue' },
  { id: 'med-scanner',  name: 'Medical Scanner',  icon: '🏥', color: '#0EA5E9',  stat: { rescue: +25 }, unlock: 'Scan injuries' },
  { id: 'stretcher',    name: 'Stretcher',        icon: '🛏️', color: '#BAE6FD',  stat: { rescue: +20 }, unlock: 'Carry patients' },
  // Mining
  { id: 'excavator',    name: 'Excavation Drill', icon: '⛏️', color: '#78350F',  stat: { mining: +35 }, unlock: 'Dig terrain' },
  { id: 'mining-claw',  name: 'Mining Claw',      icon: '🪨', color: '#92400E',  stat: { mining: +30 }, unlock: 'Extract ore' },
  { id: 'terrain-cut',  name: 'Terrain Cutter',   icon: '🗡️', color: '#6B7280',  stat: { mining: +25 }, unlock: 'Cut rock' },
  { id: 'shovel',       name: 'Shovel',           icon: '🪣', color: '#8B4513',  stat: { mining: +15 }, unlock: 'Terrain digger' },
  // Construction
  { id: 'crane-hook',   name: 'Crane Hook',       icon: '🏗️', color: '#F97316',  stat: { build: +30 },  unlock: 'Lift heavy loads' },
  { id: 'cement',       name: 'Cement Sprayer',   icon: '💧', color: '#A3A3A3',  stat: { build: +20 },  unlock: 'Apply cement' },
  // Science
  { id: 'sample',       name: 'Sample Collector', icon: '🧪', color: '#10B981',  stat: { science: +25 },unlock: 'Collect samples' },
  { id: 'micro-scan',   name: 'Microscope',       icon: '🔬', color: '#6366F1',  stat: { science: +30 },unlock: 'Micro-analysis' },
  { id: 'probe',        name: 'Research Probe',   icon: '📊', color: '#8B5CF6',  stat: { science: +20 },unlock: 'Environment data' },
];

// ARMS — Full arm assemblies
export const ARMS_DATA = [
  { id: 'simple',       name: 'Simple Arm',       icon: '💪', color: '#888888',  stat: { reach: +10 },  unlock: 'Basic arm' },
  { id: 'claw-arm',     name: 'Claw Arm',         icon: '🦾', color: '#FF8C00',  stat: { reach: +20 },  unlock: 'Claw manipulator' },
  { id: 'drill-arm',    name: 'Drill Arm',        icon: '🔧', color: '#555555',  stat: { reach: +15 },  unlock: 'Drill attachment' },
  { id: 'torch',        name: 'Torch Arm',        icon: '🔥', color: '#FF4500',  stat: { reach: +15 },  unlock: 'Welding arm' },
  { id: 'laser-arm',    name: 'Laser Arm',        icon: '⚡', color: '#9B59B6',  stat: { reach: +25 },  unlock: 'Laser emitter arm' },
  { id: 'bucket',       name: 'Bucket Arm',       icon: '🪣', color: '#8B4513',  stat: { reach: +12 },  unlock: 'Scoop & carry' },
  { id: 'industrial',   name: 'Industrial Arm',   icon: '🦿', color: '#374151',  stat: { reach: +35 },  unlock: 'Heavy factory arm' },
  { id: 'rescue-arm',   name: 'Rescue Arm',       icon: '🚑', color: '#EF4444',  stat: { reach: +20 },  unlock: 'Emergency cutter' },
  { id: 'crane-arm',    name: 'Crane Arm',        icon: '🏗️', color: '#F59E0B',  stat: { reach: +40 },  unlock: 'Lift large items' },
  { id: 'dual-arm',     name: 'Dual Arms',        icon: '🤲', color: '#7C3AED',  stat: { reach: +50 },  unlock: 'Two-sided manipulation' },
  { id: 'tentacle',     name: 'Flex Tentacle',    icon: '🐙', color: '#06B6D4',  stat: { reach: +30 },  unlock: 'Flexible reach' },
  { id: 'magnet-arm',   name: 'Magnet Arm',       icon: '🧲', color: '#818CF8',  stat: { reach: +22 },  unlock: 'Magnetic pickup' },
];

// POWER — Batteries, Advanced, Systems
export const POWER_DATA = [
  // Batteries
  { id: 'battery-sm',   name: 'Small Battery',    icon: '🔋', color: '#6EE7B7',  stat: { energy: 30, weight: -2 }, unlock: 'Light power source' },
  { id: 'battery',      name: 'Li-Ion Battery',   icon: '🔋', color: '#00C851',  stat: { energy: 55, weight: -1 }, unlock: 'Standard power' },
  { id: 'battery-lg',   name: 'Large Battery',    icon: '🔋', color: '#059669',  stat: { energy: 75, weight: +2 }, unlock: 'High capacity' },
  { id: 'industrial-bat',name:'Industrial Battery',icon: '⚡', color: '#065F46',  stat: { energy: 90, weight: +5 }, unlock: 'Factory-grade power' },
  { id: 'racing-bat',   name: 'Racing Battery',   icon: '🏁', color: '#FCD34D',  stat: { energy: 70, speed: +10 }, unlock: 'Burst speed power' },
  // Advanced
  { id: 'solar',        name: 'Solar Panels',     icon: '☀️', color: '#FFD700',  stat: { energy: 40, regen: true }, unlock: 'Self-recharging' },
  { id: 'fusion',       name: 'Fusion Core',      icon: '🌟', color: '#FDE68A',  stat: { energy: 100, weight: +3 }, unlock: 'Endless power' },
  { id: 'hydrogen',     name: 'Hydrogen Cell',    icon: '💧', color: '#BAE6FD',  stat: { energy: 80, weight: 0 }, unlock: 'Clean fuel cell' },
  { id: 'plasma',       name: 'Plasma Core',      icon: '🔮', color: '#C4B5FD',  stat: { energy: 95, weight: +4 }, unlock: 'High-output plasma' },
  { id: 'nuclear',      name: 'Reactor Core',     icon: '⚛️', color: '#00D9FF',  stat: { energy: 100, weight: +8 }, unlock: 'Nuclear reactor' },
  // Systems
  { id: 'power-dist',   name: 'Power Distributor',icon: '🔌', color: '#6366F1',  stat: { efficiency: +20 }, unlock: 'Optimize power flow' },
  { id: 'cooling',      name: 'Cooling System',   icon: '❄️', color: '#7DD3FC',  stat: { efficiency: +15 }, unlock: 'Prevent overheating' },
  { id: 'charging',     name: 'Charging Port',    icon: '🔌', color: '#A78BFA',  stat: { efficiency: +10 }, unlock: 'Quick charge' },
];

// HEADS — Scanners, Faces, Antennae, Optics
export const HEADS_DATA = [
  { id: 'dome',         name: 'Dome',             icon: '⛑️', color: '#888888',  stat: { armor: +5 },   unlock: 'Dome scanner' },
  { id: 'spike',        name: 'Spike Head',       icon: '🔺', color: '#FF0000',  stat: { attack: +10 }, unlock: 'Spike antenna' },
  { id: 'antenna',      name: 'Antenna',          icon: '📻', color: '#00D9FF',  stat: { comm: +20 },   unlock: 'Signal antenna' },
  { id: 'flat',         name: 'Flat Top',         icon: '🟦', color: '#1E90FF',  stat: { sensor: +10 }, unlock: 'Flat sensor plate' },
  { id: 'face',         name: 'Robot Face',       icon: '😊', color: '#FFD700',  stat: { ai: +15 },     unlock: 'Friendly face' },
  { id: 'scanner',      name: 'Scanner Head',     icon: '🔍', color: '#00C851',  stat: { scan: +25 },   unlock: 'Laser scanner' },
  { id: 'visor',        name: 'Visor',            icon: '🥽', color: '#0EA5E9',  stat: { vision: +20 }, unlock: 'Wide vision visor' },
  { id: 'sensor-array', name: 'Sensor Array',     icon: '📟', color: '#8B5CF6',  stat: { scan: +30 },   unlock: 'Multi-sensor dome' },
  { id: 'periscope',    name: 'Periscope',        icon: '🔭', color: '#06B6D4',  stat: { range: +25 },  unlock: 'Extended vision' },
  { id: 'horns',        name: 'Combat Horns',     icon: '🤘', color: '#DC2626',  stat: { attack: +20 }, unlock: 'Battle horns' },
  { id: 'holo-head',    name: 'Holo Projector',   icon: '💫', color: '#A78BFA',  stat: { comm: +30 },   unlock: 'Hologram display' },
  { id: 'camo-dome',    name: 'Stealth Dome',     icon: '🌑', color: '#1F2937',  stat: { stealth: +25 },unlock: 'Low-profile stealth' },
];

// LIGHTS — LEDs, Spotlights, Specials
export const LIGHTS_DATA = [
  { id: 'led-white',    name: 'White LED',        icon: '💡', color: '#FFFFFF',  stat: { visibility: +10 }, unlock: 'White LED strip' },
  { id: 'led-cyan',     name: 'Cyan LED',         icon: '🔵', color: '#00D9FF',  stat: { visibility: +12 }, unlock: 'Cyan glow strips' },
  { id: 'led-red',      name: 'Red Warning',      icon: '🔴', color: '#FF3333',  stat: { visibility: +10 }, unlock: 'Red warning light' },
  { id: 'searchlight',  name: 'Searchlight',      icon: '🔦', color: '#FFFFAA',  stat: { visibility: +30 }, unlock: 'High-power beam' },
  { id: 'strobes',      name: 'Strobes',          icon: '⚡', color: '#FF00FF',  stat: { visibility: +20 }, unlock: 'Strobe flashes' },
  { id: 'ring',         name: 'Ring Light',       icon: '⭕', color: '#FFD700',  stat: { visibility: +15 }, unlock: 'LED ring halo' },
  { id: 'neon',         name: 'Neon Strips',      icon: '🌈', color: '#EC4899',  stat: { visibility: +18 }, unlock: 'Neon body lighting' },
  { id: 'police',       name: 'Police Lights',    icon: '🚨', color: '#3B82F6',  stat: { visibility: +25 }, unlock: 'Emergency lights' },
  { id: 'emergency',    name: 'Emergency Lights', icon: '⚠️', color: '#EF4444',  stat: { visibility: +22 }, unlock: 'SOS beacon' },
  { id: 'rgb',          name: 'RGB Lighting',     icon: '🎨', color: '#A855F7',  stat: { visibility: +20 }, unlock: 'Full RGB control' },
  { id: 'holo-lights',  name: 'Holo Lights',      icon: '🌟', color: '#C4B5FD',  stat: { visibility: +28 }, unlock: 'Holographic glow' },
  { id: 'floodlights',  name: 'Floodlights',      icon: '🏟️', color: '#FEF3C7',  stat: { visibility: +35 }, unlock: 'Wide area lighting' },
];

// AI MODULES — Navigation, Combat, Medical, Science
export const AI_DATA = [
  { id: 'nav-ai',       name: 'Navigation AI',    icon: '🧭', color: '#0EA5E9',  stat: { ai: +20, nav: +25 },   unlock: 'Auto pathfinding' },
  { id: 'security-ai',  name: 'Security AI',      icon: '🔒', color: '#1E40AF',  stat: { ai: +20, guard: +30 }, unlock: 'Patrol & detect threats' },
  { id: 'medical-ai',   name: 'Medical AI',       icon: '🏥', color: '#10B981',  stat: { ai: +20, heal: +30 },  unlock: 'Medical diagnosis' },
  { id: 'factory-ai',   name: 'Factory AI',       icon: '🏭', color: '#F97316',  stat: { ai: +20, build: +30 }, unlock: 'Industrial automation' },
  { id: 'explore-ai',   name: 'Exploration AI',   icon: '🔭', color: '#8B5CF6',  stat: { ai: +20, map: +30 },   unlock: 'Terrain exploration' },
  { id: 'drone-ai',     name: 'Drone AI',         icon: '🚁', color: '#06B6D4',  stat: { ai: +20, fly: +30 },   unlock: 'Aerial autonomy' },
  { id: 'std-cpu',      name: 'Standard CPU',     icon: '💻', color: '#6B7280',  stat: { ai: +10 },             unlock: 'Basic processor' },
  { id: 'adv-cpu',      name: 'Advanced CPU',     icon: '🖥️', color: '#4F46E5',  stat: { ai: +25 },             unlock: 'Advanced processor' },
  { id: 'neural-cpu',   name: 'Neural Processor', icon: '🧠', color: '#7C3AED',  stat: { ai: +40 },             unlock: 'Neural learning chip' },
  { id: 'quantum-cpu',  name: 'Quantum Processor',icon: '⚛️', color: '#EC4899',  stat: { ai: +60 },             unlock: 'Quantum computing' },
  { id: 'mem-core',     name: 'Memory Core',      icon: '💾', color: '#0891B2',  stat: { ai: +10, storage: +20 },unlock: 'Expanded memory' },
  { id: 'ai-learn',     name: 'AI Learning Module',icon:'🎓', color: '#F59E0B',  stat: { ai: +30 },             unlock: 'Self-improving AI' },
];

// COMMUNICATION PARTS
export const COMM_DATA = [
  { id: 'comm-antenna', name: 'Antenna',          icon: '📶', color: '#00D9FF',  stat: { range: +15 },  unlock: 'Basic communication' },
  { id: 'sat-dish',     name: 'Satellite Dish',   icon: '📡', color: '#F59E0B',  stat: { range: +50 },  unlock: 'Satellite uplink' },
  { id: 'radio',        name: 'Radio Module',     icon: '📻', color: '#6366F1',  stat: { range: +20 },  unlock: 'Radio broadcast' },
  { id: 'bluetooth',    name: 'Bluetooth System', icon: '🔷', color: '#0EA5E9',  stat: { range: +10 },  unlock: 'Short-range wireless' },
  { id: 'wifi',         name: 'Wi-Fi Module',     icon: '📶', color: '#10B981',  stat: { range: +25 },  unlock: 'Internet connected' },
  { id: 'beacon',       name: 'Emergency Beacon', icon: '🆘', color: '#EF4444',  stat: { range: +30 },  unlock: 'SOS signal' },
  { id: 'holo-comm',    name: 'Holo Communicator',icon: '💫', color: '#A78BFA',  stat: { range: +35 },  unlock: 'Hologram messaging' },
];

// STRUCTURAL PARTS — Armor, Supports, Joints
export const STRUCTURAL_DATA = [
  { id: 'armor-plate',  name: 'Armor Plating',    icon: '🛡️', color: '#374151',  stat: { armor: +30, weight: +3 }, unlock: 'Heavy protection' },
  { id: 'support-beam', name: 'Support Beam',     icon: '📏', color: '#6B7280',  stat: { armor: +10 },  unlock: 'Structural support' },
  { id: 'reinf-bar',    name: 'Reinforce Bar',    icon: '🔩', color: '#9CA3AF',  stat: { armor: +15 },  unlock: 'Added rigidity' },
  { id: 'hinge',        name: 'Hinge Joint',      icon: '⚙️', color: '#A78BFA',  stat: { flex: +20 },   unlock: 'Pivoting parts' },
  { id: 'rot-joint',    name: 'Rotating Joint',   icon: '🔄', color: '#818CF8',  stat: { flex: +30 },   unlock: 'Full rotation' },
  { id: 'piston',       name: 'Piston',           icon: '🔧', color: '#F97316',  stat: { power: +15 },  unlock: 'Hydraulic push' },
  { id: 'hydraulic',    name: 'Hydraulic System', icon: '💧', color: '#0284C7',  stat: { power: +25 },  unlock: 'Heavy lifting power' },
  { id: 'stabilizer',   name: 'Stabilizer',       icon: '⚖️', color: '#10B981',  stat: { balance: +20 },unlock: 'Improved balance' },
];

// DECORATION PARTS
export const DECO_DATA = [
  { id: 'decal',        name: 'Decal',            icon: '🎨', color: '#EC4899',  stat: {},  unlock: 'Custom sticker art' },
  { id: 'logo',         name: 'Logo Badge',       icon: '🏷️', color: '#F59E0B',  stat: {},  unlock: 'Team logo badge' },
  { id: 'num-plate',    name: 'Number Plate',     icon: '🔢', color: '#6366F1',  stat: {},  unlock: 'Robot ID plate' },
  { id: 'stripes',      name: 'Racing Stripes',   icon: '〽️', color: '#EF4444',  stat: { speed: +2 }, unlock: 'Go faster stripes' },
  { id: 'camo',         name: 'Camouflage',       icon: '🌿', color: '#65A30D',  stat: { stealth: +15 }, unlock: 'Stealth camo skin' },
  { id: 'glow-panel',   name: 'Glow Panel',       icon: '✨', color: '#A78BFA',  stat: {},  unlock: 'Glowing body panel' },
  { id: 'holo-badge',   name: 'Holo Badge',       icon: '💎', color: '#67E8F9',  stat: {},  unlock: 'Holographic badge' },
  { id: 'fire-paint',   name: 'Flame Paint',      icon: '🔥', color: '#F97316',  stat: {},  unlock: 'Fire livery skin' },
  { id: 'chrome',       name: 'Chrome Finish',    icon: '🪞', color: '#CBD5E1',  stat: {},  unlock: 'Mirror chrome body' },
  { id: 'carbon-skin',  name: 'Carbon Fiber',     icon: '◼️', color: '#1F2937',  stat: { weight: -1 }, unlock: 'Lightweight carbon' },
];

// LEGO MODE PARTS
export const LEGO_DATA = [
  { id: 'lego-block',   name: 'LEGO Block',       icon: '🧱', color: '#EF4444',  stat: {},  unlock: 'Snap-on block' },
  { id: 'lego-wheel',   name: 'LEGO Wheel',       icon: '⚙️', color: '#3B82F6',  stat: { speed: +5 }, unlock: 'Snap wheel' },
  { id: 'lego-gear',    name: 'LEGO Gear',        icon: '🔄', color: '#F59E0B',  stat: { power: +5 }, unlock: 'Snap gear' },
  { id: 'lego-hinge',   name: 'LEGO Hinge',       icon: '🔩', color: '#10B981',  stat: { flex: +10 }, unlock: 'Snap hinge' },
  { id: 'lego-conn',    name: 'LEGO Connector',   icon: '🔗', color: '#8B5CF6',  stat: {},  unlock: 'Snap connector' },
  { id: 'lego-motor',   name: 'LEGO Motor',       icon: '⚡', color: '#EC4899',  stat: { speed: +8 }, unlock: 'Powered axle' },
  { id: 'lego-eyes',    name: 'LEGO Robot Eyes',  icon: '👀', color: '#06B6D4',  stat: { vision: +5 },unlock: 'Brick eyes' },
  { id: 'lego-claw',    name: 'LEGO Claw',        icon: '🦾', color: '#F97316',  stat: { grip: +8 }, unlock: 'Brick claw arm' },
  { id: 'lego-prop',    name: 'LEGO Propeller',   icon: '🌀', color: '#0EA5E9',  stat: { fly: +8 },  unlock: 'Spinning propeller' },
];

export const BLOCKS_DATA = [
  { id: 'lego-1x1-red',    color: '#E74C3C', icon: '🟥', label: '1×1 Red' },
  { id: 'lego-1x1-blue',   color: '#3498DB', icon: '🟦', label: '1×1 Blue' },
  { id: 'lego-1x1-green',  color: '#2ECC71', icon: '🟩', label: '1×1 Green' },
  { id: 'lego-1x1-yellow', color: '#F1C40F', icon: '🟨', label: '1×1 Yellow' },
  { id: 'lego-1x1-purple', color: '#9B59B6', icon: '🟪', label: '1×1 Purple' },
  { id: 'lego-1x1-orange', color: '#E67E22', icon: '🟧', label: '1×1 Orange' },
  { id: 'lego-2x1-gray',   color: '#95A5A6', icon: '⬜', label: '2×1 Gray' },
  { id: 'lego-2x2-white',  color: '#ECF0F1', icon: '⬜', label: '2×2 White' },
  { id: 'lego-slope-red',  color: '#C0392B', icon: '🔺', label: 'Slope' },
  { id: 'lego-round-blue', color: '#2980B9', icon: '🔵', label: 'Round' },
  { id: 'lego-arch',       color: '#8E44AD', icon: '🌉', label: 'Arch' },
  { id: 'lego-axle',       color: '#7F8C8D', icon: '➕', label: 'Axle' },
];

// ─── Sample saved robots ───────────────────────────────────────────────────
export const SAMPLE_ROBOTS = [
  {
    id: 1,
    name: 'Rover X1',
    chassisId: 'rover',
    primaryColor: '#FF8C00',
    accentColor: '#FFD700',
    sensors: ['camera', 'ultrasonic'],
    tools: ['grabber'],
    selectedRobot: true,
    bgGrad: ['#FFF3E0', '#FFE0B2'],
    icon: '🚙',
    wheels: 4,
    xp: 450,
  },
  {
    id: 2,
    name: 'Speedster',
    chassisId: 'scout',
    primaryColor: '#1E90FF',
    accentColor: '#00D9FF',
    sensors: [],
    tools: [],
    bgGrad: ['#E3F2FD', '#BBDEFB'],
    icon: '⚡',
    wheels: 4,
    xp: 320,
  },
  {
    id: 3,
    name: 'Climber',
    chassisId: 'crawler',
    primaryColor: '#00C851',
    accentColor: '#69F0AE',
    sensors: ['ultrasonic'],
    tools: ['claw'],
    bgGrad: ['#E8F5E9', '#C8E6C9'],
    icon: '🌿',
    wheels: 6,
    xp: 280,
  },
  {
    id: 4,
    name: 'Explorer',
    chassisId: 'crawler',
    primaryColor: '#FF8C00',
    accentColor: '#FFD700',
    sensors: ['camera', 'ultrasonic', 'gps'],
    tools: ['shovel'],
    bgGrad: ['#FFF8E1', '#FFECB3'],
    icon: '🔭',
    wheels: 6,
    xp: 195,
  },
  {
    id: 5,
    name: 'Walker',
    chassisId: 'droid',
    primaryColor: '#9B59B6',
    accentColor: '#BB86FC',
    sensors: ['camera'],
    tools: [],
    bgGrad: ['#F3E5F5', '#E1BEE7'],
    icon: '🤖',
    wheels: 2,
    xp: 120,
  },
];

// ─── Material helpers ──────────────────────────────────────────────────────
function mat(color, metalness = 0.3, roughness = 0.5, emissive = null, emissiveIntensity = 0.8) {
  const c = new THREE.Color(color);
  const m = new THREE.MeshStandardMaterial({
    color: c,
    metalness: Math.min(metalness, 0.25),
    roughness,
    envMapIntensity: 0,
  });
  if (emissive) {
    m.emissive = new THREE.Color(emissive);
    m.emissiveIntensity = emissiveIntensity;
  }
  return m;
}

/** Body panel material */
function matPanel(color, metalness = 0.55, roughness = 0.42, emissive = null, emissiveIntensity = 0.8) {
  const m = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    metalness: 0.08,
    roughness: 0.55,
    envMapIntensity: 0,
  });
  if (emissive) { m.emissive = new THREE.Color(emissive); m.emissiveIntensity = emissiveIntensity; }
  return m;
}

/** Brushed-metal joint material */
function matBrushed(color, metalness = 0.82, roughness = 0.28) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    metalness, roughness,
    map: getBrushedMetalTex(),
  });
}

/** Carbon-fiber material (for drone arms, plane wings) */
function matCarbon(metalness = 0.35, roughness = 0.52) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color('#1a1a1a'),
    metalness, roughness,
    map: getCarbonFiberTex(),
  });
}

/** Glass lens material */
function matGlass(color = '#0a1e3c') {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    metalness: 0.1, roughness: 0.05,
    transparent: true, opacity: 0.72,
    map: getGlassTex(),
  });
}

/** Rubber/tire material */
function matRubber(color = '#1a1a1a') {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    metalness: 0.08, roughness: 0.95,
    map: getRubberTex(),
  });
}

function mesh(geo, material) {
  const m = new THREE.Mesh(geo, material);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function box(w, h, d, color, metalness = 0.3, roughness = 0.5, emissive = null) {
  return mesh(new THREE.BoxGeometry(w, h, d), mat(color, metalness, roughness, emissive));
}

function sphere(r, color, metalness = 0.4, roughness = 0.4, emissive = null) {
  return mesh(new THREE.SphereGeometry(r, 12, 8), mat(color, metalness, roughness, emissive));
}

function cylinder(r, h, color, metalness = 0.5, roughness = 0.4) {
  return mesh(new THREE.CylinderGeometry(r, r, h, 20), mat(color, metalness, roughness));
}

function wheel(radius, thick, tireColor, rimColor = '#cccccc') {
  const g = new THREE.Group();
  // Tire — rubber textured (unique geometry per wheel — shared CYL_GEO + scale breaks culling)
  const tire = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, thick, 20), matRubber(tireColor));
  tire.rotation.z = Math.PI / 2;
  tire.castShadow = true; tire.receiveShadow = true;
  g.add(tire);
  // Rim — brushed metal
  const rimR = radius * 0.52;
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(rimR, rimR, thick * 1.02, 16), matBrushed(rimColor, 0.85, 0.22));
  rim.rotation.z = Math.PI / 2;
  rim.castShadow = true;
  g.add(rim);
  // Lug nut detail ring
  const hubR = radius * 0.18;
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(hubR, hubR, thick * 1.04, 12), mat('#aaaaaa', 0.9, 0.15));
  hub.rotation.z = Math.PI / 2;
  g.add(hub);
  // 5 lug bolts arranged radially
  for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI * 2;
    const bolt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022 * radius, 0.022 * radius, thick * 1.06, 6),
      mat('#888888', 0.9, 0.2)
    );
    bolt.rotation.z = Math.PI / 2;
    bolt.position.set(0, 0, 0);
    const bx = Math.cos(ang) * radius * 0.32;
    const bz = Math.sin(ang) * radius * 0.32;
    bolt.position.set(0, bx, bz);
    g.add(bolt);
  }
  return g;
}

function addWheels(group, positions, radius, thick, tireColor) {
  positions.forEach(([x, y, z]) => {
    const w = wheel(radius, thick, tireColor);
    w.position.set(x, y, z);
    w.userData.isWheel = true;
    w.traverse((c) => { if (c.isMesh) c.userData.isWheel = true; });
    group.add(w);
  });
}

// ─── Chassis builders ──────────────────────────────────────────────────────

function buildRover(primary, accent) {
  const g = new THREE.Group();
  // Main body — panel-textured (sized geometry, not shared BOX_GEO + scale)
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.42, 1.55), matPanel(primary, 0.42, 0.45));
  body.position.set(0, 0.42, 0); body.castShadow = true; body.receiveShadow = true;
  g.add(body);
  // Cab — panel-textured
  const cab = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.38, 0.74), matPanel(primary, 0.42, 0.45));
  cab.position.set(0, 0.77, -0.15); cab.castShadow = true; cab.receiveShadow = true;
  g.add(cab);
  // Hood
  const hood = box(0.98, 0.08, 0.52, primary, 0.5, 0.4);
  hood.position.set(0, 0.64, 0.52);
  g.add(hood);
  // Windshield
  const wind = box(0.72, 0.3, 0.04, '#1a1a2a', 0.7, 0.08);
  wind.position.set(0, 0.76, 0.24);
  wind.rotation.x = -0.36;
  g.add(wind);
  // Rear window
  const rear = box(0.64, 0.24, 0.04, '#1a1a2a', 0.7, 0.08);
  rear.position.set(0, 0.79, -0.54);
  g.add(rear);
  // Roof rack
  const rack = box(0.72, 0.055, 0.42, accent, 0.65, 0.3);
  rack.position.set(0, 1.0, -0.15);
  g.add(rack);
  // Headlights
  [-0.4, 0.4].forEach(x => {
    const hl = box(0.13, 0.09, 0.04, '#fffbe6', 0, 0.5, '#fff8d0');
    hl.material.emissiveIntensity = 0.5;
    hl.position.set(x, 0.53, 0.78);
    g.add(hl);
  });
  // Tail lights
  [-0.38, 0.38].forEach(x => {
    const tl = box(0.1, 0.07, 0.03, '#ff2222', 0, 0.5, '#ff0000');
    tl.material.emissiveIntensity = 0.6;
    tl.position.set(x, 0.52, -0.79);
    g.add(tl);
  });
  // Accent stripes
  [-0.58, 0.58].forEach(x => {
    const s = box(0.035, 0.38, 1.08, accent, 0.5, 0.3);
    s.position.set(x, 0.42, 0);
    g.add(s);
  });
  // Bumpers
  const fbump = box(1.02, 0.15, 0.06, accent, 0.6, 0.4);
  fbump.position.set(0, 0.25, 0.79);
  g.add(fbump);
  const rbump = box(1.02, 0.15, 0.06, accent, 0.6, 0.4);
  rbump.position.set(0, 0.25, -0.79);
  g.add(rbump);
  // 4 Wheels
  addWheels(g, [
    [-0.7, 0.3, 0.55],
    [ 0.7, 0.3, 0.55],
    [-0.7, 0.3, -0.55],
    [ 0.7, 0.3, -0.55],
  ], 0.3, 0.22, '#1a1a1a');
  return g;
}

function buildScout(primary, accent) {
  const g = new THREE.Group();
  // Sleek low body
  const body = box(0.88, 0.28, 1.65, primary, 0.55, 0.3);
  body.position.set(0, 0.3, 0);
  g.add(body);
  // Cockpit
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.38, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    mat(accent, 0.7, 0.08),
  );
  dome.position.set(0, 0.52, 0.08);
  g.add(dome);
  // Front splitter
  const split = box(0.75, 0.05, 0.18, accent, 0.7, 0.25);
  split.position.set(0, 0.18, 0.85);
  g.add(split);
  // Glow strip
  const glow = box(0.76, 0.03, 1.32, accent, 0.1, 0.6, accent);
  glow.material.emissiveIntensity = 0.9;
  glow.position.set(0, 0.45, 0);
  g.add(glow);
  // Rear wing
  const wing = box(0.98, 0.18, 0.06, primary, 0.6, 0.3);
  wing.position.set(0, 0.5, -0.82);
  g.add(wing);
  // Exhausts
  [-0.24, 0.24].forEach(x => {
    const ex = cylinder(0.055, 0.22, '#333', 0.8, 0.3);
    ex.position.set(x, 0.26, -0.9);
    ex.rotation.x = -0.18;
    g.add(ex);
  });
  // 4 wheels
  addWheels(g, [
    [-0.58, 0.22, 0.6],
    [ 0.58, 0.22, 0.6],
    [-0.58, 0.22, -0.6],
    [ 0.58, 0.22, -0.6],
  ], 0.22, 0.18, '#333333');
  return g;
}

function buildCrawler(primary, accent) {
  const g = new THREE.Group();
  // Wide rugged body
  const body = box(1.25, 0.52, 1.45, primary, 0.4, 0.62);
  body.position.set(0, 0.5, 0);
  g.add(body);
  // Flat top
  const top = box(1.12, 0.1, 1.2, accent, 0.55, 0.35);
  top.position.set(0, 0.82, 0);
  g.add(top);
  // Sensor pod
  const pod = box(0.7, 0.2, 0.55, primary, 0.5, 0.4);
  pod.position.set(0, 0.98, 0.08);
  g.add(pod);
  // Antenna
  const ant = cylinder(0.025, 0.5, '#666', 0.7, 0.4);
  ant.position.set(0.25, 1.22, 0.08);
  g.add(ant);
  // Bull bar
  const bar = box(1.18, 0.12, 0.07, '#444', 0.75, 0.3);
  bar.position.set(0, 0.34, 0.77);
  g.add(bar);
  // 6 large wheels
  addWheels(g, [
    [-0.76, 0.34, 0.58],
    [ 0.76, 0.34, 0.58],
    [-0.76, 0.34, 0],
    [ 0.76, 0.34, 0],
    [-0.76, 0.34, -0.58],
    [ 0.76, 0.34, -0.58],
  ], 0.34, 0.26, '#1a1a1a');
  return g;
}

function buildTank(primary, accent) {
  const PI = Math.PI;
  const g = new THREE.Group();

  // ── LOWER HULL — panel-textured armor ────────────────────────────────────
  const lowerHull = new THREE.Mesh(BOX_GEO, matPanel(primary, 0.65, 0.40));
  lowerHull.scale.set(1.38, 0.36, 1.92);
  lowerHull.position.set(0, 0.3, 0); lowerHull.castShadow = true; lowerHull.receiveShadow = true;
  g.add(lowerHull);

  // ── UPPER HULL (sloped armor plates) — panel-textured ──────────────────
  const upperHull = new THREE.Mesh(BOX_GEO, matPanel(primary, 0.62, 0.42));
  upperHull.scale.set(1.18, 0.22, 1.52);
  upperHull.position.set(0, 0.57, -0.06); upperHull.castShadow = true;
  g.add(upperHull);

  // Front glacis (angled forward plate) — brushed metal accent
  const glacis = new THREE.Mesh(BOX_GEO, matPanel(accent, 0.68, 0.36));
  glacis.scale.set(1.14, 0.28, 0.42);
  glacis.position.set(0, 0.5, 0.8);
  glacis.rotation.x = 0.48;
  glacis.castShadow = true;
  g.add(glacis);

  // Rear engine deck — panel textured
  const engDeck = new THREE.Mesh(BOX_GEO, matPanel(primary, 0.65, 0.38));
  engDeck.scale.set(1.14, 0.14, 0.36);
  engDeck.position.set(0, 0.55, -0.9); engDeck.castShadow = true;
  g.add(engDeck);

  // Engine grill (rear vents)
  for (let i = 0; i < 4; i++) {
    const vent = box(0.88, 0.04, 0.06, '#0a0a0a', 0.9, 0.2);
    vent.position.set(0, 0.56, -0.76 - i * 0.06);
    g.add(vent);
  }

  // Exhaust pipes (rear)
  [-0.32, 0.32].forEach(x => {
    const exhaust = cylinder(0.038, 0.3, '#333', 0.85, 0.3);
    exhaust.position.set(x, 0.68, -1.06);
    g.add(exhaust);
    // Exhaust cap
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.038, 0.04, 8), mat('#1a1a1a', 0.9, 0.2));
    cap.position.set(x, 0.85, -1.06);
    g.add(cap);
  });

  // Headlights (front)
  [-0.36, 0.36].forEach(x => {
    const light = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.05, 10),
      mat('#f0f0f0', 0.2, 0.05, '#ffffff'));
    light.material.emissiveIntensity = 1.0;
    light.rotation.x = PI / 2;
    light.position.set(x, 0.55, 1.0);
    g.add(light);
  });

  // Tow hooks (front corners)
  [-0.54, 0.54].forEach(x => {
    const hook = box(0.06, 0.06, 0.16, accent, 0.8, 0.3);
    hook.position.set(x, 0.34, 0.98);
    g.add(hook);
  });

  // Side skirts (armor panels over tracks)
  [-0.74, 0.74].forEach(x => {
    const skirt = box(0.06, 0.28, 1.82, accent, 0.64, 0.38);
    skirt.position.set(x, 0.44, -0.04);
    g.add(skirt);
    // Skirt bolt details
    for (let z = -0.7; z <= 0.7; z += 0.35) {
      const bolt = box(0.04, 0.04, 0.04, '#1a1a1a', 0.9, 0.2);
      bolt.position.set(x, 0.52, z);
      g.add(bolt);
    }
  });

  // ── TURRET ────────────────────────────────────────────────────────────────
  const turretGrp = new THREE.Group();
  turretGrp.position.set(0, 0.68, -0.1);
  g.add(turretGrp);

  // Turret ring
  const turretRing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.46, 0.46, 0.06, 16),
    mat(accent, 0.68, 0.35)
  );
  turretGrp.add(turretRing);

  // Turret body (rounded hex form)
  const turretBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.34, 0.42, 0.32, 10),
    mat(primary, 0.62, 0.4)
  );
  turretBody.position.set(0, 0.19, 0);
  turretGrp.add(turretBody);

  // Turret front mantlet (gun mount)
  const mantlet = box(0.38, 0.28, 0.12, accent, 0.7, 0.35);
  mantlet.position.set(0, 0.2, 0.42);
  turretGrp.add(mantlet);

  // Commander hatch
  const hatch = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.15, 0.06, 10),
    mat(accent, 0.72, 0.32)
  );
  hatch.position.set(-0.14, 0.38, -0.06);
  turretGrp.add(hatch);

  // Loader hatch
  const loaderHatch = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.12, 0.05, 10),
    mat(primary, 0.68, 0.38)
  );
  loaderHatch.position.set(0.14, 0.38, -0.08);
  turretGrp.add(loaderHatch);

  // Periscope / sight
  const sight = box(0.06, 0.1, 0.06, '#111', 0.9, 0.2);
  sight.position.set(-0.12, 0.45, 0.1);
  turretGrp.add(sight);

  // Commander MG (machine gun)
  const mg = cylinder(0.022, 0.42, '#333', 0.88, 0.25);
  mg.rotation.x = PI / 2;
  mg.position.set(-0.14, 0.44, 0.22);
  turretGrp.add(mg);

  // Smoke dischargers (3 per side)
  [-1, 1].forEach(s => {
    for (let i = 0; i < 3; i++) {
      const smokeDisc = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.18, 6),
        mat('#2a2a2a', 0.85, 0.3)
      );
      smokeDisc.rotation.x = PI / 2;
      smokeDisc.rotation.z = s * -0.35;
      smokeDisc.position.set(s * 0.36, 0.26, 0.22 - i * 0.08);
      turretGrp.add(smokeDisc);
    }
  });

  // Radio antenna
  const antenna = cylinder(0.008, 0.65, accent, 0.8, 0.3);
  antenna.position.set(0.22, 0.78, -0.24);
  turretGrp.add(antenna);

  // ── MAIN GUN BARREL ───────────────────────────────────────────────────────
  // Barrel assembly (base + tube + muzzle brake)
  const barrelBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.075, 0.082, 0.32, 10),
    mat('#2a2a2a', 0.88, 0.22)
  );
  barrelBase.rotation.x = PI / 2;
  barrelBase.position.set(0, 0.2, 0.58);
  turretGrp.add(barrelBase);

  const barrelTube = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.068, 1.05, 10),
    mat('#1a1a1a', 0.88, 0.2)
  );
  barrelTube.rotation.x = PI / 2;
  barrelTube.position.set(0, 0.2, 1.17);
  turretGrp.add(barrelTube);

  // Muzzle brake (distinctive T-shape)
  const muzzle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.07, 0.07, 0.16, 8),
    mat('#1a1a1a', 0.9, 0.18)
  );
  muzzle.rotation.x = PI / 2;
  muzzle.position.set(0, 0.2, 1.72);
  turretGrp.add(muzzle);
  // Muzzle brake lateral holes
  [-1, 1].forEach(s => {
    const hole = box(0.1, 0.055, 0.04, '#050505', 0.9, 0.1);
    hole.position.set(s * 0.07, 0.2, 1.72);
    turretGrp.add(hole);
  });

  // ── TRACK ASSEMBLIES ─────────────────────────────────────────────────────
  const animatedWheels = [];
  [-0.76, 0.76].forEach(x => {
    // Drive sprocket (front, toothed)
    const sprocket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 0.26, 14),
      mat('#111', 0.78, 0.32)
    );
    sprocket.rotation.z = PI / 2;
    sprocket.position.set(x, 0.22, 0.9);
    g.add(sprocket);
    // Sprocket teeth
    for (let t = 0; t < 7; t++) {
      const tooth = box(0.04, 0.28, 0.06, '#0a0a0a', 0.8, 0.4);
      const ang = (t / 7) * PI * 2;
      tooth.position.set(x, 0.22 + Math.cos(ang) * 0.2, 0.9 + Math.sin(ang) * 0.2);
      tooth.rotation.x = ang;
      g.add(tooth);
    }
    animatedWheels.push(sprocket);

    // Idler wheel (rear)
    const idler = new THREE.Mesh(
      new THREE.CylinderGeometry(0.19, 0.19, 0.24, 12),
      mat('#111', 0.78, 0.32)
    );
    idler.rotation.z = PI / 2;
    idler.position.set(x, 0.2, -0.88);
    g.add(idler);
    animatedWheels.push(idler);

    // Road wheel row (5 wheels)
    for (let i = 0; i < 5; i++) {
      const zPos = -0.6 + i * 0.3;
      const roadWheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.155, 0.155, 0.22, 10),
        mat('#1a1a1a', 0.72, 0.35)
      );
      roadWheel.rotation.z = PI / 2;
      roadWheel.position.set(x, 0.155, zPos);
      g.add(roadWheel);
      // Hub cap
      const hub = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.07, 0.24, 8),
        mat(accent, 0.78, 0.3)
      );
      hub.rotation.z = PI / 2;
      hub.position.set(x, 0.155, zPos);
      g.add(hub);
      animatedWheels.push(roadWheel);
    }

    // Track belt — bottom run (flat links)
    for (let z = -0.92; z <= 0.92; z += 0.12) {
      const link = box(0.27, 0.07, 0.1, '#2a2a2a', 0.62, 0.55);
      link.position.set(x, 0.02, z);
      g.add(link);
      // Tread grouser
      const grouser = box(0.3, 0.035, 0.04, '#1a1a1a', 0.7, 0.6);
      grouser.position.set(x, -0.016, z);
      g.add(grouser);
    }

    // Track belt — side curved sections (simplified arcs)
    // Front curve links
    for (let a = 0; a <= PI; a += PI / 8) {
      const link = box(0.27, 0.07, 0.09, '#2a2a2a', 0.62, 0.55);
      link.position.set(x, 0.22 + Math.sin(a) * 0.2, 0.9 - Math.cos(a) * 0.2);
      link.rotation.x = a;
      g.add(link);
    }
    // Rear curve links
    for (let a = PI; a <= PI * 2; a += PI / 8) {
      const link = box(0.27, 0.07, 0.09, '#2a2a2a', 0.62, 0.55);
      link.position.set(x, 0.2 - Math.sin(a) * 0.19, -0.88 + Math.cos(a) * 0.19);
      link.rotation.x = a;
      g.add(link);
    }
  });

  // ── STATUS LIGHT ──────────────────────────────────────────────────────────
  const statusLight = box(0.06, 0.06, 0.06, accent, 0, 0.1, accent);
  statusLight.material.emissiveIntensity = 1.8;
  statusLight.position.set(0, 0.52, 1.0);
  g.add(statusLight);

  // ── ANIMATION ─────────────────────────────────────────────────────────────
  g.userData.animate = (t) => {
    animatedWheels.forEach((w, i) => {
      w.rotation.x += 0.04; // spin along X (since rotation.z = PI/2 makes the cylinder axis horizontal)
    });
    // Turret idle rotation
    turretGrp.rotation.y = Math.sin(t * 0.4) * 0.18;
    // Status LED pulse
    statusLight.material.emissiveIntensity = 1.4 + Math.sin(t * 3.5) * 0.5;
  };

  return g;
}

function buildStealth(primary, accent) {
  const g = new THREE.Group();
  // Ultra-low body
  const body = box(1.05, 0.24, 1.75, primary, 0.85, 0.08);
  body.position.set(0, 0.28, 0);
  g.add(body);
  // Angled nose
  const nose = box(0.72, 0.2, 0.56, primary, 0.85, 0.08);
  nose.position.set(0, 0.4, 0.7);
  nose.rotation.x = 0.38;
  g.add(nose);
  // Glow lines (cyan)
  const glow = box(0.88, 0.03, 1.45, accent, 0.1, 0.6, accent);
  glow.material.emissiveIntensity = 1.4;
  glow.position.set(0, 0.41, 0);
  g.add(glow);
  // Side skirts
  [-0.56, 0.56].forEach(x => {
    const skirt = box(0.07, 0.14, 1.55, '#0d0d1a', 0.9, 0.15);
    skirt.position.set(x, 0.26, 0);
    g.add(skirt);
    // Side strip
    const strip = box(0.03, 0.06, 1.3, accent, 0.1, 0.5, accent);
    strip.material.emissiveIntensity = 0.9;
    strip.position.set(x, 0.35, 0);
    g.add(strip);
  });
  // Cockpit slit
  const cockpit = box(0.7, 0.12, 0.45, '#0a1a2e', 0.7, 0.05);
  cockpit.position.set(0, 0.45, 0.35);
  g.add(cockpit);
  // 4 wheels
  addWheels(g, [
    [-0.65, 0.22, 0.62],
    [ 0.65, 0.22, 0.62],
    [-0.65, 0.22, -0.62],
    [ 0.65, 0.22, -0.62],
  ], 0.22, 0.18, '#0d0d1a');
  return g;
}

function buildDroid(primary, accent) {
  const PI = Math.PI;
  const g = new THREE.Group();
  // Raise entire robot so feet land at y≈0 (ground plane)
  // Foot bottom is at approx −0.94 in local space; lift by 0.95
  g.position.y = 0.95;
  // ── Root groups for gait animation ──────────────────────────────────────
  const hipGroup   = new THREE.Group(); // hips counter-rotate to upper body
  const upperGroup = new THREE.Group(); // torso + head + arms
  hipGroup.position.set(0, 0.22, 0);
  upperGroup.position.set(0, 0.22, 0);
  g.add(hipGroup);
  g.add(upperGroup);

  // ════════════════════════════════════════════════════════
  // HEAD
  // ════════════════════════════════════════════════════════
  const headGrp = new THREE.Group();
  headGrp.position.set(0, 1.08, 0);
  headGrp.userData.isHead = true;
  upperGroup.add(headGrp);

  // Helmet base — rounded top, flat bottom
  const helmBase = new THREE.Mesh(new THREE.SphereGeometry(0.26, 16, 12), mat(primary, 0.55, 0.35));
  helmBase.scale.set(1, 1.05, 0.95);
  headGrp.add(helmBase);

  // Helmet brim / chin guard
  const chinGuard = box(0.44, 0.1, 0.38, primary, 0.55, 0.38);
  chinGuard.position.set(0, -0.18, 0);
  headGrp.add(chinGuard);

  // Cheek plates
  [-1, 1].forEach(s => {
    const cheek = box(0.06, 0.14, 0.22, primary, 0.6, 0.3);
    cheek.position.set(s * 0.24, -0.1, 0.02);
    headGrp.add(cheek);
  });

  // Visor — full-width dark shield with blue emissive tint
  const visor = box(0.44, 0.13, 0.04, '#06111e', 0.85, 0.05, '#1e90ff');
  visor.material.emissiveIntensity = 0.55;
  visor.position.set(0, 0.02, 0.25);
  headGrp.add(visor);

  // Eye lenses — glowing cyan
  const eyeRefs = [];
  [-0.11, 0.11].forEach(x => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.052, 12, 8), mat('#00d9ff', 0, 0.1, '#00d9ff'));
    eye.material.emissiveIntensity = 2.2;
    eye.position.set(x, 0.025, 0.26);
    headGrp.add(eye);
    eyeRefs.push(eye);
  });

  // Head status LED (top crest)
  const crestLed = box(0.06, 0.04, 0.18, accent, 0.6, 0.2, accent);
  crestLed.material.emissiveIntensity = 1.4;
  crestLed.position.set(0, 0.27, 0);
  headGrp.add(crestLed);

  // Side antenna nubs
  [-1, 1].forEach(s => {
    const ant = cylinder(0.022, 0.12, accent, 0.7, 0.3);
    ant.rotation.z = s * 0.35;
    ant.position.set(s * 0.28, 0.22, 0);
    headGrp.add(ant);
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), mat(accent, 0, 0.1, accent));
    tip.material.emissiveIntensity = 1.8;
    tip.position.set(s * 0.32, 0.32, 0);
    headGrp.add(tip);
  });

  // Neck connector
  const neck = cylinder(0.1, 0.14, primary, 0.55, 0.4);
  neck.position.set(0, -0.26, 0);
  headGrp.add(neck);

  // ════════════════════════════════════════════════════════
  // TORSO
  // ════════════════════════════════════════════════════════
  const torsoGrp = new THREE.Group();
  upperGroup.add(torsoGrp);

  // Main torso body — trapezoid-like (wider at top)
  const torso = box(0.76, 0.7, 0.52, primary, 0.48, 0.38);
  torso.position.set(0, 0.53, 0);
  torsoGrp.add(torso);

  // Chest front panel
  const chestPanel = box(0.52, 0.62, 0.05, accent, 0.62, 0.28);
  chestPanel.position.set(0, 0.53, 0.285);
  torsoGrp.add(chestPanel);

  // Central chest glow strip
  const chestGlow = box(0.08, 0.48, 0.04, '#00d9ff', 0, 0.1, '#00d9ff');
  chestGlow.material.emissiveIntensity = 1.6;
  chestGlow.position.set(0, 0.53, 0.29);
  torsoGrp.add(chestGlow);

  // Side chest ribs (4 per side)
  [-1, 1].forEach(s => {
    for (let i = 0; i < 4; i++) {
      const rib = box(0.18, 0.03, 0.06, accent, 0.65, 0.3);
      rib.position.set(s * 0.3, 0.72 - i * 0.14, 0.26);
      torsoGrp.add(rib);
    }
  });

  // Spine ridge (back)
  const spine = box(0.06, 0.58, 0.06, accent, 0.7, 0.25);
  spine.position.set(0, 0.53, -0.27);
  torsoGrp.add(spine);

  // Back thruster pods
  [-0.2, 0.2].forEach(x => {
    const pod = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.09, 0.22, 8), mat('#222', 0.8, 0.3));
    pod.rotation.x = PI / 2;
    pod.position.set(x, 0.62, -0.31);
    torsoGrp.add(pod);
    const glow = new THREE.Mesh(new THREE.CircleGeometry(0.052, 10), mat(accent, 0, 0.1, accent));
    glow.material.emissiveIntensity = 1.2;
    glow.rotation.y = PI;
    glow.position.set(x, 0.62, -0.44);
    torsoGrp.add(glow);
  });

  // Abdomen / waist taper
  const abdomen = box(0.62, 0.2, 0.44, primary, 0.5, 0.4);
  abdomen.position.set(0, 0.12, 0);
  torsoGrp.add(abdomen);

  // Pelvis plate
  const pelvis = box(0.7, 0.18, 0.5, accent, 0.55, 0.35);
  pelvis.position.set(0, -0.06, 0);
  torsoGrp.add(pelvis);

  // Collarbone bar
  const collar = box(0.68, 0.05, 0.12, accent, 0.7, 0.3);
  collar.position.set(0, 0.9, 0.1);
  torsoGrp.add(collar);

  // ════════════════════════════════════════════════════════
  // ARMS (2 — left side=-1, right side=+1)
  // ════════════════════════════════════════════════════════
  const armRefs = [];
  [-1, 1].forEach((s, si) => {
    const armRoot = new THREE.Group();
    armRoot.position.set(s * 0.44, 0.88, 0);
    upperGroup.add(armRoot);

    // Shoulder ball joint
    const shoulderBall = new THREE.Mesh(new THREE.SphereGeometry(0.115, 12, 8), mat(accent, 0.65, 0.28));
    armRoot.add(shoulderBall);

    // Shoulder pad (angular plate)
    const shoulderPad = box(s < 0 ? -0.2 : 0.2, 0.05, 0.28, primary, 0.5, 0.35);
    shoulderPad.position.set(s * 0.1, 0.06, 0);
    armRoot.add(shoulderPad);

    // Upper arm group — swings from shoulder
    const upperArmGrp = new THREE.Group();
    upperArmGrp.position.set(0, -0.12, 0);
    armRoot.add(upperArmGrp);

    // Bicep
    const bicep = box(0.155, 0.32, 0.155, primary, 0.48, 0.4);
    bicep.position.set(0, -0.16, 0);
    upperArmGrp.add(bicep);

    // Bicep accent stripe
    const bicepStripe = box(0.04, 0.22, 0.16, accent, 0.6, 0.28);
    bicepStripe.position.set(s * 0.06, -0.16, 0);
    upperArmGrp.add(bicepStripe);

    // Elbow ball joint
    const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.088, 10, 8), mat(accent, 0.65, 0.3));
    elbow.position.set(0, -0.34, 0);
    upperArmGrp.add(elbow);

    // Forearm group — bends at elbow
    const forearmGrp = new THREE.Group();
    forearmGrp.position.set(0, -0.38, 0);
    upperArmGrp.add(forearmGrp);

    // Forearm tube
    const forearm = box(0.13, 0.3, 0.13, primary, 0.5, 0.38);
    forearm.position.set(0, -0.15, 0);
    forearmGrp.add(forearm);

    // Forearm tech panel
    const techPanel = box(0.04, 0.2, 0.14, accent, 0.6, 0.25, accent);
    techPanel.material.emissiveIntensity = 0.4;
    techPanel.position.set(s * 0.065, -0.15, 0);
    forearmGrp.add(techPanel);

    // Wrist ring
    const wrist = new THREE.Mesh(new THREE.TorusGeometry(0.072, 0.018, 8, 14), mat(accent, 0.7, 0.25));
    wrist.rotation.x = PI / 2;
    wrist.position.set(0, -0.31, 0);
    forearmGrp.add(wrist);

    // ── HAND ──────────────────────────────────────────────
    const handGrp = new THREE.Group();
    handGrp.position.set(0, -0.36, 0);
    forearmGrp.add(handGrp);

    // Palm
    const palm = box(0.155, 0.1, 0.125, '#2a2a2a', 0.72, 0.3);
    palm.position.set(0, -0.05, 0);
    handGrp.add(palm);

    // 4 fingers
    const fingerOffsets = [-0.052, -0.017, 0.017, 0.052];
    fingerOffsets.forEach((fz, fi) => {
      const knuckle = box(0.034, 0.068, 0.034, '#3a3a3a', 0.65, 0.35);
      knuckle.position.set(0, -0.12, fz);
      handGrp.add(knuckle);
      const mid = box(0.03, 0.055, 0.03, primary, 0.5, 0.4);
      mid.position.set(0, -0.19, fz);
      handGrp.add(mid);
      const fingertip = box(0.028, 0.045, 0.028, accent, 0.55, 0.3);
      fingertip.position.set(0, -0.25, fz);
      handGrp.add(fingertip);
    });

    // Thumb
    const thumbGrp = new THREE.Group();
    thumbGrp.position.set(s * 0.072, -0.06, -0.055);
    thumbGrp.rotation.z = s * 0.6;
    handGrp.add(thumbGrp);
    const thumbBase = box(0.03, 0.058, 0.03, '#3a3a3a', 0.65, 0.35);
    thumbBase.position.set(0, -0.03, 0);
    thumbGrp.add(thumbBase);
    const thumbTip = box(0.028, 0.048, 0.028, accent, 0.55, 0.3);
    thumbTip.position.set(0, -0.08, 0);
    thumbGrp.add(thumbTip);

    armRefs.push({ armRoot, upperArmGrp, forearmGrp, si });
  });

  // ════════════════════════════════════════════════════════
  // LEGS (2 — hierarchical: hip → thigh → shin → foot)
  // ════════════════════════════════════════════════════════
  const legRefs = [];
  [-1, 1].forEach((s, si) => {
    // Hip socket
    const hipSocket = new THREE.Group();
    hipSocket.position.set(s * 0.24, -0.1, 0);
    hipGroup.add(hipSocket);

    const hipBall = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), mat(accent, 0.65, 0.3));
    hipSocket.add(hipBall);

    // Thigh group (swings from hip)
    const thighGrp = new THREE.Group();
    thighGrp.position.set(0, -0.1, 0);
    hipSocket.add(thighGrp);

    const thigh = box(0.2, 0.38, 0.2, primary, 0.45, 0.42);
    thigh.position.set(0, -0.19, 0);
    thighGrp.add(thigh);

    // Thigh front accent
    const thighAccent = box(0.05, 0.28, 0.22, accent, 0.6, 0.3);
    thighAccent.position.set(0, -0.19, 0.1);
    thighGrp.add(thighAccent);

    // Knee joint
    const kneeBall = new THREE.Mesh(new THREE.SphereGeometry(0.105, 10, 8), mat(accent, 0.68, 0.28));
    kneeBall.position.set(0, -0.4, 0);
    thighGrp.add(kneeBall);

    // Knee cap plate
    const kneeCap = box(0.14, 0.07, 0.15, primary, 0.5, 0.35);
    kneeCap.position.set(0, -0.4, 0.1);
    thighGrp.add(kneeCap);

    // Shin group (bends at knee)
    const shinGrp = new THREE.Group();
    shinGrp.position.set(0, -0.44, 0);
    thighGrp.add(shinGrp);

    const shin = box(0.17, 0.36, 0.17, primary, 0.48, 0.42);
    shin.position.set(0, -0.18, 0);
    shinGrp.add(shin);

    // Shin back calf guard
    const calf = box(0.13, 0.28, 0.06, accent, 0.6, 0.32);
    calf.position.set(0, -0.18, -0.12);
    shinGrp.add(calf);

    // Ankle ball
    const ankle = new THREE.Mesh(new THREE.SphereGeometry(0.075, 10, 8), mat(accent, 0.65, 0.3));
    ankle.position.set(0, -0.38, 0);
    shinGrp.add(ankle);

    // Foot group
    const footGrp = new THREE.Group();
    footGrp.position.set(0, -0.42, 0);
    shinGrp.add(footGrp);

    const foot = box(0.22, 0.1, 0.35, '#1a1a1a', 0.65, 0.4);
    foot.position.set(0, -0.05, 0.06);
    footGrp.add(foot);

    // Heel spur
    const heel = box(0.16, 0.08, 0.1, accent, 0.6, 0.35);
    heel.position.set(0, -0.05, -0.14);
    footGrp.add(heel);

    // Toe cap
    const toe = box(0.18, 0.06, 0.06, primary, 0.55, 0.38);
    toe.position.set(0, -0.04, 0.22);
    footGrp.add(toe);

    legRefs.push({ thighGrp, shinGrp, footGrp, si });
  });

  // ════════════════════════════════════════════════════════
  // ANIMATION — walking gait cycle
  // ════════════════════════════════════════════════════════
  g.userData.animate = (t) => {
    const freq = 1.5; // gait frequency
    const walk = Math.sin(t * freq);

    // Subtle full-body bob
    g.position.y = Math.abs(Math.sin(t * freq)) * 0.015;

    // Hip counter-rotation (hips sway opposite to shoulders)
    hipGroup.rotation.y   = walk * 0.07;
    upperGroup.rotation.y = -walk * 0.05;

    // Torso lateral sway
    upperGroup.rotation.z = Math.sin(t * freq * 0.5) * 0.022;

    // Eye pulse
    eyeRefs.forEach(e => {
      e.material.emissiveIntensity = 1.8 + Math.sin(t * 3.0) * 0.5;
    });

    // Crest LED flicker
    crestLed.material.emissiveIntensity = 1.1 + Math.sin(t * 4.5) * 0.4;

    // Chest glow breathe
    chestGlow.material.emissiveIntensity = 1.2 + Math.sin(t * 1.1) * 0.5;

    // ── Arms swing counter to legs (natural bipedal gait) ──
    armRefs.forEach(({ armRoot, upperArmGrp, forearmGrp, si }) => {
      const phase = si === 0 ? 0 : PI;
      // Shoulder swing
      armRoot.rotation.x      = Math.sin(t * freq + phase) * 0.22;
      // Elbow natural bend during swing
      upperArmGrp.rotation.x  = 0.08 + Math.abs(Math.sin(t * freq + phase)) * 0.18;
      // Forearm subtle follow
      forearmGrp.rotation.x   = Math.sin(t * freq + phase + 0.4) * 0.08;
    });

    // ── Legs: thigh swing + knee bend ──
    legRefs.forEach(({ thighGrp, shinGrp, footGrp, si }) => {
      const phase = si === 0 ? PI : 0; // opposite to arm on same side
      const swing = Math.sin(t * freq + phase);
      // Hip/thigh forward-back
      thighGrp.rotation.x = swing * 0.28;
      // Knee bends when leg lifts (forward phase)
      const kneeBend = Math.max(0, swing) * 0.45;
      shinGrp.rotation.x = -kneeBend;
      // Ankle dorsiflexion to keep foot level
      footGrp.rotation.x = kneeBend * 0.5;
    });
  };

  return g;
}

// ─── New chassis builders ──────────────────────────────────────────────────

function buildSpider(primary, accent) {
  const g = new THREE.Group();
  const BODY_Y = 0.38; // height of body centre off ground

  // ── ABDOMEN — large bulbous rear section (panel-textured) ──
  const abdomen = new THREE.Mesh(new THREE.SphereGeometry(0.38, 18, 12), matPanel(primary, 0.5, 0.48));
  abdomen.scale.set(0.95, 0.82, 1.25);
  abdomen.position.set(0, BODY_Y, -0.52);
  abdomen.castShadow = true;
  g.add(abdomen);
  // Segmented plate lines on abdomen
  for (let i = 0; i < 5; i++) {
    const seg = new THREE.Mesh(
      new THREE.TorusGeometry(0.36 - i * 0.015, 0.008, 4, 20),
      mat(accent, 0.7, 0.3, accent, 0.3)
    );
    seg.scale.set(0.95, 1.0, 1.25);
    seg.rotation.x = Math.PI / 2;
    seg.position.set(0, BODY_Y + 0.05 - i * 0.09, -0.52);
    g.add(seg);
  }
  // Hourglass marking on abdomen
  const mark = box(0.1, 0.04, 0.52, accent, 0.4, 0.35, accent);
  mark.material.emissiveIntensity = 1.2;
  mark.position.set(0, BODY_Y + 0.32, -0.52);
  g.add(mark);

  // ── WAIST PEG — hydraulic connector ──
  const waist = new THREE.Mesh(CYL_GEO, matBrushed('#333', 0.88, 0.22));
  waist.scale.set(0.09, 0.18, 0.09);
  waist.position.set(0, BODY_Y, -0.14);
  g.add(waist);
  // Waist ring detail
  const waistRing = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.02, 6, 16), mat(accent, 0.8, 0.2));
  waistRing.rotation.x = Math.PI / 2;
  waistRing.position.set(0, BODY_Y, -0.14);
  g.add(waistRing);

  // ── CEPHALOTHORAX — flat oval head/body plate (panel-textured) ──
  const ceph = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, 0.18, 12), matPanel(primary, 0.55, 0.38));
  ceph.position.set(0, BODY_Y, 0.14);
  ceph.castShadow = true;
  g.add(ceph);
  // Ceph top glow panel
  const cephPanel = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.04, 10),
    mat(accent, 0.3, 0.5, accent, 0.6));
  cephPanel.position.set(0, BODY_Y + 0.11, 0.14);
  g.add(cephPanel);

  // ── EYE CLUSTER — 6 eyes in two rows on forward face ──
  const eyeRefs = [];
  [
    [-0.13, BODY_Y + 0.13, 0.46],
    [ 0.13, BODY_Y + 0.13, 0.46],
    [-0.2,  BODY_Y + 0.09, 0.4 ],
    [ 0.2,  BODY_Y + 0.09, 0.4 ],
    [-0.07, BODY_Y + 0.18, 0.44],
    [ 0.07, BODY_Y + 0.18, 0.44],
  ].forEach(([ex, ey, ez]) => {
    const eye = sphere(0.048, '#00ffcc', 0, 0.2, '#00ffcc');
    eye.material.emissiveIntensity = 2.6;
    eye.position.set(ex, ey, ez);
    g.add(eye);
    eyeRefs.push(eye);
  });

  // Fangs (chelicerae)
  [-0.1, 0.1].forEach(x => {
    const fang = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.2, 5), mat('#111', 0.9, 0.4));
    fang.rotation.x = Math.PI * 0.6;
    fang.position.set(x, BODY_Y - 0.02, 0.58);
    g.add(fang);
  });

  // ── 8 LEGS — hierarchical: pivot → coxa → femurGrp → tibiaGrp → claw ──
  // Each leg is a chain of Groups so parent rotation drags children cleanly
  const legPivots = []; // for animation

  // zAttach: fore-aft position along body, spreadAngle: initial Y rotation outward
  const legDefs = [
    { z: 0.28, spreadY:  0.6 },  // L1 front
    { z: 0.10, spreadY:  0.3 },  // L2
    { z:-0.08, spreadY: -0.2 },  // L3
    { z:-0.26, spreadY: -0.55 }, // L4 rear
  ];

  [-1, 1].forEach((side, si) => {
    legDefs.forEach(({ z, spreadY }, li) => {
      // ── Pivot group anchored at body edge ──
      const pivot = new THREE.Group();
      pivot.position.set(side * 0.36, BODY_Y, z);
      pivot.rotation.y = side * spreadY; // fan legs forward/back
      g.add(pivot);

      // Coxa — short horizontal segment going straight out (brushed metal)
      const coxaGrp = new THREE.Group();
      const coxaMesh = new THREE.Mesh(BOX_GEO, matPanel(primary, 0.55, 0.40));
      coxaMesh.scale.set(0.28, 0.068, 0.075);
      coxaMesh.position.set(side * 0.14, 0, 0);
      coxaMesh.castShadow = true;
      coxaGrp.add(coxaMesh);
      // Hip socket ball
      const hipBall = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), matBrushed(accent, 0.78, 0.22));
      hipBall.position.set(0, 0, 0);
      coxaGrp.add(hipBall);
      pivot.add(coxaGrp);

      // Femur group — hangs off end of coxa, angles upward then out
      const femurGrp = new THREE.Group();
      femurGrp.position.set(side * 0.28, 0, 0);
      femurGrp.rotation.z = side * 0.55;
      coxaGrp.add(femurGrp);

      const femurMesh = new THREE.Mesh(BOX_GEO, matBrushed(accent, 0.72, 0.28));
      femurMesh.scale.set(0.38, 0.058, 0.065);
      femurMesh.position.set(side * 0.19, 0, 0);
      femurMesh.castShadow = true;
      femurGrp.add(femurMesh);
      // Hydraulic cylinder alongside femur
      const hydro = new THREE.Mesh(CYL_GEO, mat('#555', 0.9, 0.15));
      hydro.scale.set(0.018, 0.3, 0.018);
      hydro.position.set(side * 0.19, 0.04, 0);
      hydro.rotation.z = Math.PI / 2;
      femurGrp.add(hydro);

      // Knee sphere — polished joint
      const knee = new THREE.Mesh(new THREE.SphereGeometry(0.056, 10, 8), matBrushed(accent, 0.82, 0.15));
      knee.position.set(side * 0.38, 0, 0);
      femurGrp.add(knee);

      // Tibia group — hangs off knee, angles sharply downward
      const tibiaGrp = new THREE.Group();
      tibiaGrp.position.set(side * 0.38, 0, 0);
      tibiaGrp.rotation.z = side * -1.05;
      femurGrp.add(tibiaGrp);

      const tibiaMesh = new THREE.Mesh(BOX_GEO, matPanel(primary, 0.50, 0.48));
      tibiaMesh.scale.set(0.38, 0.048, 0.056);
      tibiaMesh.position.set(side * 0.19, 0, 0);
      tibiaMesh.castShadow = true;
      tibiaGrp.add(tibiaMesh);

      // Ankle joint ball
      const ankle = new THREE.Mesh(new THREE.SphereGeometry(0.034, 8, 6), matBrushed('#777', 0.8, 0.18));
      ankle.position.set(side * 0.38, 0, 0);
      tibiaGrp.add(ankle);

      // Claw at tip of tibia — polished steel
      const clawGrp = new THREE.Group();
      clawGrp.position.set(side * 0.38, 0, 0);
      tibiaGrp.add(clawGrp);
      const clawMesh = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.13, 6), mat('#c0c0c0', 0.95, 0.08));
      clawMesh.rotation.z = side > 0 ? -Math.PI / 2 : Math.PI / 2;
      clawMesh.position.set(side * 0.065, 0, 0);
      clawMesh.castShadow = true;
      clawGrp.add(clawMesh);
      // Rubber grip pad at claw tip
      const grip = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 5), matRubber('#222'));
      grip.position.set(side * 0.12, -0.02, 0);
      clawGrp.add(grip);

      // Alternating tripod gait: even/odd pairs with phase offset per side
      const phase = (li % 2 === 0 ? 0 : Math.PI) + (si === 0 ? Math.PI : 0);
      legPivots.push({ pivot, femurGrp, tibiaGrp, phase });
    });
  });

  // ── ANIMATION ──
  g.userData.animate = (t) => {
    eyeRefs.forEach((e, i) => {
      e.material.emissiveIntensity = 2.0 + Math.sin(t * 5 + i * 0.9) * 0.9;
    });
    legPivots.forEach(({ pivot, femurGrp, tibiaGrp, phase }) => {
      const wave = Math.sin(t * 4.0 + phase);
      pivot.rotation.x     =  wave * 0.18;         // swing fore/aft
      femurGrp.rotation.x  =  wave * 0.12;         // femur lifts
      tibiaGrp.rotation.x  = -wave * 0.16;         // tibia compensates
    });
    g.position.y = Math.abs(Math.sin(t * 4.0)) * 0.012; // body bob
  };

  return g;
}

function buildMech(primary, accent) {
  const PI = Math.PI;
  const g = new THREE.Group();
  // Raise so feet touch ground (feet bottom ≈ −0.82, lift by 0.84)
  g.position.y = 0.84;

  // ── TORSO GROUP (for upper body sway) ────────────────────────────────────
  const torsoGrp = new THREE.Group();
  g.add(torsoGrp);

  // Wide armored torso
  const torso = box(1.08, 0.84, 0.8, primary, 0.65, 0.35);
  torso.position.set(0, 0.72, 0);
  torsoGrp.add(torso);

  // Chest front plate
  const chest = box(0.78, 0.56, 0.07, accent, 0.7, 0.28);
  chest.position.set(0, 0.72, 0.42);
  torsoGrp.add(chest);

  // Cockpit window (pilot viewport)
  const cockpit = box(0.52, 0.28, 0.06, '#020a18', 0.85, 0.04, '#0055ff');
  cockpit.material.emissiveIntensity = 0.6;
  cockpit.position.set(0, 0.82, 0.47);
  torsoGrp.add(cockpit);

  // Cockpit frame
  const cpFrame = box(0.56, 0.32, 0.04, accent, 0.8, 0.25);
  cpFrame.position.set(0, 0.82, 0.455);
  torsoGrp.add(cpFrame);

  // Side ventilation panels
  [-1, 1].forEach(s => {
    const vent = box(0.06, 0.48, 0.22, '#111', 0.9, 0.2);
    vent.position.set(s * 0.56, 0.72, 0.3);
    torsoGrp.add(vent);
    // Vent slats
    for (let i = 0; i < 4; i++) {
      const slat = box(0.065, 0.03, 0.2, accent, 0.75, 0.3);
      slat.position.set(s * 0.56, 0.52 + i * 0.12, 0.3);
      torsoGrp.add(slat);
    }
  });

  // Chest glow stripes (twin vertical)
  const glowRefs = [];
  [-0.14, 0.14].forEach(x => {
    const strip = box(0.04, 0.44, 0.03, accent, 0, 0.1, accent);
    strip.material.emissiveIntensity = 1.5;
    strip.position.set(x, 0.72, 0.48);
    torsoGrp.add(strip);
    glowRefs.push(strip);
  });

  // ── HEAD ─────────────────────────────────────────────────────────────────
  const headGrp = new THREE.Group();
  headGrp.position.set(0, 1.38, 0);
  headGrp.userData.isHead = true;
  torsoGrp.add(headGrp);

  const head = box(0.54, 0.44, 0.5, primary, 0.62, 0.3);
  headGrp.add(head);

  // Visor strip
  const visor = box(0.44, 0.12, 0.06, '#220000', 0.2, 0.5, '#ff2200');
  visor.material.emissiveIntensity = 1.4;
  visor.position.set(0, 0.04, 0.27);
  headGrp.add(visor);

  // Antenna horns
  [-0.18, 0.18].forEach(x => {
    const horn = cylinder(0.02, 0.28, accent, 0.8, 0.3);
    horn.position.set(x, 0.3, 0);
    headGrp.add(horn);
    const tip = sphere(0.025, accent, 0, 0.1, accent);
    tip.material.emissiveIntensity = 2.0;
    tip.position.set(x, 0.46, 0);
    headGrp.add(tip);
    glowRefs.push(tip);
  });

  // ── SHOULDER CANNONS + ARMS ───────────────────────────────────────────────
  const armGrps = [];
  [-1, 1].forEach((s, si) => {
    const armGrp = new THREE.Group();
    armGrp.position.set(s * 0.66, 0.96, 0);
    torsoGrp.add(armGrp);

    // Shoulder ball
    const shoulder = sphere(0.22, accent, 0.62, 0.28);
    armGrp.add(shoulder);

    // Shoulder cannon (over-shoulder mount)
    const canMount = box(0.12, 0.08, 0.14, '#1a1a1a', 0.88, 0.2);
    canMount.position.set(0, 0.2, 0);
    armGrp.add(canMount);
    const cannon = cylinder(0.07, 0.6, '#222', 0.88, 0.22);
    cannon.rotation.x = PI / 2;
    cannon.position.set(0, 0.24, 0.35);
    armGrp.add(cannon);
    const cannonTip = sphere(0.04, accent, 0, 0.2, accent);
    cannonTip.material.emissiveIntensity = 1.8;
    cannonTip.position.set(0, 0.24, 0.66);
    armGrp.add(cannonTip);
    glowRefs.push(cannonTip);

    // Upper arm
    const ua = box(0.26, 0.5, 0.26, primary, 0.62, 0.35);
    ua.position.set(0, -0.26, 0);
    armGrp.add(ua);

    // Forearm
    const fa = box(0.22, 0.4, 0.22, accent, 0.68, 0.28);
    fa.position.set(0, -0.54, 0);
    armGrp.add(fa);

    // Fist / weapon
    const fist = box(0.28, 0.2, 0.28, '#1a1a1a', 0.85, 0.22);
    fist.position.set(0, -0.78, 0);
    armGrp.add(fist);

    armGrps.push({ grp: armGrp, si });
  });

  // ── LEGS ──────────────────────────────────────────────────────────────────
  const legGrps = [];
  [-0.3, 0.3].forEach((x, li) => {
    const legGrp = new THREE.Group();
    legGrp.position.set(x, 0, 0);
    g.add(legGrp);

    const hip = sphere(0.18, accent, 0.68, 0.28);
    hip.position.set(0, 0.24, 0);
    legGrp.add(hip);

    const thigh = box(0.28, 0.46, 0.28, primary, 0.62, 0.35);
    thigh.position.set(0, 0.0, 0);
    legGrp.add(thigh);

    const knee = sphere(0.16, accent, 0.68, 0.28);
    knee.position.set(0, -0.24, 0);
    legGrp.add(knee);

    // Shin group (bends at knee)
    const shinGrp = new THREE.Group();
    shinGrp.position.set(0, -0.28, 0);
    legGrp.add(shinGrp);

    const shin = box(0.26, 0.46, 0.32, primary, 0.62, 0.36);
    shin.position.set(0, -0.22, 0.03);
    shinGrp.add(shin);

    const foot = box(0.3, 0.14, 0.48, '#111', 0.75, 0.35);
    foot.position.set(0, -0.5, 0.1);
    shinGrp.add(foot);

    // Foot thruster nozzle
    const thruster = sphere(0.05, accent, 0, 0.2, accent);
    thruster.material.emissiveIntensity = 1.2;
    thruster.position.set(0, -0.58, -0.14);
    shinGrp.add(thruster);
    glowRefs.push(thruster);

    legGrps.push({ legGrp, shinGrp, li });
  });

  // ── ANIMATION ─────────────────────────────────────────────────────────────
  g.userData.animate = (t) => {
    const freq = 1.1;
    // Heavy stomping bob
    g.position.y = 0.84 + Math.abs(Math.sin(t * freq)) * 0.03;

    // Torso counter-sway
    torsoGrp.rotation.y = Math.sin(t * freq * 0.5) * 0.05;
    torsoGrp.rotation.z = Math.sin(t * freq * 0.5) * 0.03;

    // Head scan
    headGrp.rotation.y = Math.sin(t * 0.6) * 0.2;

    // Arm swing + cannon aim
    armGrps.forEach(({ grp, si }) => {
      grp.rotation.x = Math.sin(t * freq + si * PI) * 0.18;
    });

    // Leg stomp cycle
    legGrps.forEach(({ legGrp, shinGrp, li }) => {
      const phase = li === 0 ? 0 : PI;
      legGrp.rotation.x = Math.sin(t * freq + phase) * 0.22;
      shinGrp.rotation.x = -Math.max(0, Math.sin(t * freq + phase)) * 0.4;
    });

    // Visor + glow pulse
    visor.material.emissiveIntensity = 1.0 + Math.sin(t * 3.5) * 0.5;
    glowRefs.forEach((r, i) => {
      r.material.emissiveIntensity = 1.2 + Math.sin(t * 4 + i * 0.7) * 0.6;
    });
  };

  return g;
}

function buildDroneQuad(primary, accent) {
  const g = new THREE.Group();

  // ── CENTRAL BODY — octagonal aluminium shell (panel-textured) ────────────
  const bodyTop = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.29, 0.1, 8), matPanel(primary, 0.75, 0.20));
  bodyTop.position.set(0, 0.34, 0); bodyTop.castShadow = true;
  g.add(bodyTop);
  const bodyMid = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.29, 0.1, 8), matPanel(primary, 0.70, 0.22));
  bodyMid.position.set(0, 0.25, 0); bodyMid.castShadow = true;
  g.add(bodyMid);
  const bodyBot = new THREE.Mesh(new THREE.CylinderGeometry(0.29, 0.22, 0.08, 8), matPanel(primary, 0.65, 0.24));
  bodyBot.position.set(0, 0.17, 0); bodyBot.castShadow = true;
  g.add(bodyBot);
  // Top access panel
  const topPanel = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.03, 8), mat(accent, 0.75, 0.18));
  topPanel.position.set(0, 0.4, 0);
  g.add(topPanel);
  // Battery cover (rear bulge)
  const battCover = box(0.2, 0.09, 0.14, '#2a2a2a', 0.8, 0.35);
  battCover.position.set(0, 0.28, -0.12);
  g.add(battCover);
  // Ventilation grille (front)
  [-0.06, 0, 0.06].forEach(x => {
    const vent = box(0.02, 0.06, 0.02, '#111', 0.85, 0.4);
    vent.position.set(x, 0.22, 0.18);
    g.add(vent);
  });
  // Status LED strip (top ring)
  const statusLed = sphere(0.032, '#00ff44', 0, 0.2, '#00ff44');
  statusLed.material.emissiveIntensity = 2.2;
  statusLed.position.set(0, 0.32, 0.22);
  g.add(statusLed);

  // ── GIMBAL CAMERA SYSTEM ──────────────────────────────────────────────────
  // Gimbal mount arm
  const gimbalArm = cylinder(0.022, 0.12, '#333', 0.8, 0.3);
  gimbalArm.position.set(0, 0.15, 0.06);
  g.add(gimbalArm);
  // Stabilisation yoke (horizontal bar)
  const yoke = box(0.18, 0.022, 0.022, '#444', 0.78, 0.28);
  yoke.position.set(0, 0.08, 0.06);
  g.add(yoke);
  // Camera ball housing
  const camBall = new THREE.Mesh(new THREE.SphereGeometry(0.085, 14, 10), mat('#111', 0.78, 0.16));
  camBall.position.set(0, 0.08, 0.06);
  g.add(camBall);
  // Lens — glass material with internal rings
  const lensRing = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.025, 16), matBrushed('#555', 0.85, 0.15));
  lensRing.rotation.x = Math.PI / 2;
  lensRing.position.set(0, 0.08, 0.14);
  g.add(lensRing);
  const lensGlass = new THREE.Mesh(new THREE.CircleGeometry(0.044, 16), matGlass('#0a1835'));
  lensGlass.rotation.x = -Math.PI / 2;
  lensGlass.rotation.z = Math.PI / 2;
  lensGlass.position.set(0, 0.08, 0.155);
  g.add(lensGlass);
  // Lens reflection highlight
  const lensHighlight = new THREE.Mesh(new THREE.CircleGeometry(0.014, 8),
    new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.35, metalness: 0, roughness: 0 }));
  lensHighlight.rotation.x = -Math.PI / 2;
  lensHighlight.rotation.z = Math.PI / 2;
  lensHighlight.position.set(0.012, 0.083, 0.157);
  g.add(lensHighlight);
  // IR rangefinder LED (under front)
  const ir = sphere(0.018, '#ff4400', 0, 0.2, '#ff4400');
  ir.material.emissiveIntensity = 1.8;
  ir.position.set(0.06, 0.08, 0.14);
  g.add(ir);

  // ── 4 ARMS + MOTOR + PROPELLERS ──────────────────────────────────────────
  const rotorGroups = [];
  [[1,1],[-1,1],[1,-1],[-1,-1]].forEach(([ax, az], mi) => {
    const armAngle = Math.atan2(az, ax);
    // Tapered carbon fiber arm
    const arm = new THREE.Mesh(
      new THREE.BoxGeometry(0.62, 0.036, 0.058),
      matCarbon(0.38, 0.50)
    );
    arm.position.set(ax * 0.28, 0.28, az * 0.28);
    arm.rotation.y = armAngle;
    arm.castShadow = true;
    g.add(arm);
    // Cable duct along arm
    const duct = new THREE.Mesh(BOX_GEO, mat('#222', 0.6, 0.5));
    duct.scale.set(0.56, 0.012, 0.012);
    duct.position.set(ax * 0.28, 0.302, az * 0.28);
    duct.rotation.y = armAngle;
    g.add(duct);
    // Motor housing (stacked cylinders for detail)
    const mBot = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.075, 0.04, 14), mat('#404040', 0.82, 0.2));
    mBot.position.set(ax * 0.565, 0.275, az * 0.565);
    g.add(mBot);
    const mTop = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.07, 0.055, 14), mat('#2a2a2a', 0.88, 0.18));
    mTop.position.set(ax * 0.565, 0.315, az * 0.565);
    g.add(mTop);
    // Motor LED indicator (CW=blue, CCW=red)
    const mLed = sphere(0.02, mi%2===0?'#4488ff':'#ff4444', 0, 0.2, mi%2===0?'#4488ff':'#ff4444');
    mLed.material.emissiveIntensity = 2.0;
    mLed.position.set(ax * 0.565, 0.35, az * 0.565);
    g.add(mLed);
    // Propeller guard ring (partial)
    const guard = new THREE.Mesh(
      new THREE.TorusGeometry(0.29, 0.012, 6, 24, Math.PI * 1.5),
      mat('#333', 0.5, 0.4)
    );
    guard.position.set(ax * 0.565, 0.37, az * 0.565);
    g.add(guard);
    // Rotor group — 2-blade aerodynamic carbon fiber propeller
    const rGrp = new THREE.Group();
    rGrp.position.set(ax * 0.565, 0.38, az * 0.565);
    // Hub cap
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.018, 8), matBrushed('#333', 0.85, 0.2));
    rGrp.add(hub);
    for (let bi = 0; bi < 2; bi++) {
      // Aerodynamic blade — tapered and pitched
      const bladeGrp = new THREE.Group();
      bladeGrp.rotation.y = bi * Math.PI;
      rGrp.add(bladeGrp);
      // Root (wider)
      const root = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.009, 0.08), matCarbon(0.3, 0.55));
      root.position.set(0.04, 0, 0); root.rotation.x = -0.14;
      bladeGrp.add(root);
      // Mid blade
      const mid = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.008, 0.06), matCarbon(0.3, 0.55));
      mid.position.set(0.19, 0, 0); mid.rotation.x = -0.1;
      bladeGrp.add(mid);
      // Tip (narrow)
      const tip = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.007, 0.04), matCarbon(0.3, 0.55));
      tip.position.set(0.38, 0, 0); tip.rotation.x = -0.06;
      bladeGrp.add(tip);
      // Tip accent color stripe
      const tipAcc = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.009, 0.042), mat(accent, 0.4, 0.3));
      tipAcc.position.set(0.54, 0, 0);
      bladeGrp.add(tipAcc);
    }
    g.add(rGrp);
    rotorGroups.push({ grp: rGrp, dir: mi % 2 === 0 ? 1 : -1 });
  });

  // ── ULTRASONIC SENSOR ARRAY ───────────────────────────────────────────────
  [[-0.14,0.14],[0.14,0.14],[-0.14,-0.14],[0.14,-0.14]].forEach(([sx,sz]) => {
    const sDome = new THREE.Mesh(new THREE.SphereGeometry(0.026, 8, 6), mat('#555', 0.5, 0.35));
    sDome.position.set(sx, 0.15, sz);
    g.add(sDome);
  });

  // ── NAVIGATION LIGHTS (port/starboard/tail/top) ───────────────────────────
  const navRed = sphere(0.028, '#ff2200', 0, 0, '#ff2200');
  navRed.material.emissiveIntensity = 2.8;
  navRed.position.set(-0.58, 0.31, -0.58);
  g.add(navRed);
  const navGreen = sphere(0.028, '#00ff55', 0, 0, '#00ff55');
  navGreen.material.emissiveIntensity = 2.8;
  navGreen.position.set(0.58, 0.31, 0.58);
  g.add(navGreen);
  const navWhite = sphere(0.022, '#ffffff', 0, 0, '#ffffff');
  navWhite.material.emissiveIntensity = 2.0;
  navWhite.position.set(0, 0.42, 0);
  g.add(navWhite);
  // Anti-collision strobe (belly)
  const strobe = sphere(0.02, '#ff6600', 0, 0, '#ff6600');
  strobe.material.emissiveIntensity = 2.5;
  strobe.position.set(0, 0.12, 0);
  g.add(strobe);

  // ── LANDING SKIDS (T-bar design) ─────────────────────────────────────────
  [[-1,1],[1,1],[-1,-1],[1,-1]].forEach(([lx,lz]) => {
    const skidStrut = cylinder(0.014, 0.2, '#555', 0.65, 0.4);
    skidStrut.position.set(lx * 0.18, 0.1, lz * 0.18);
    g.add(skidStrut);
  });
  // Cross rails
  [[-0.18,0.18],[0.18,0.18]].forEach(([lx,lz]) => {
    const rail = box(0.38, 0.018, 0.018, '#444', 0.68, 0.38);
    rail.position.set(0, 0.01, lz);
    g.add(rail);
  });
  const frontRail = box(0.018, 0.018, 0.38, '#444', 0.68, 0.38);
  frontRail.position.set(-0.18, 0.01, 0);
  g.add(frontRail);
  const rearRail = box(0.018, 0.018, 0.38, '#444', 0.68, 0.38);
  rearRail.position.set(0.18, 0.01, 0);
  g.add(rearRail);

  // ── ANIMATION ─────────────────────────────────────────────────────────────
  let _navFlash = 0;
  g.userData.animate = (t) => {
    rotorGroups.forEach(({ grp, dir }) => {
      grp.rotation.y += 0.38 * dir;
    });
    g.rotation.x = Math.sin(t * 0.68) * 0.052;
    g.rotation.z = Math.sin(t * 0.52 + 1.1) * 0.045;
    _navFlash += 0.04;
    navWhite.material.emissiveIntensity = Math.sin(_navFlash * 2.4) > 0.75 ? 3.0 : 0.25;
    navRed.material.emissiveIntensity   = 1.8 + Math.sin(t * 3.2) * 0.9;
    navGreen.material.emissiveIntensity = 1.8 + Math.sin(t * 3.2 + Math.PI) * 0.9;
    strobe.material.emissiveIntensity   = Math.sin(t * 6) > 0.9 ? 3.5 : 0.1;
    statusLed.material.emissiveIntensity = 1.8 + Math.sin(t * 2) * 0.5;
    ir.material.emissiveIntensity = 1.2 + Math.sin(t * 8) * 0.6;
  };
  return g;
}

function buildHelicopter(primary, accent) {
  const g = new THREE.Group();
  // Fuselage
  const fuse = box(0.66, 0.44, 1.58, primary, 0.5, 0.4);
  fuse.position.set(0, 0.42, 0);
  g.add(fuse);
  // Nose bubble (glass)
  const nose = sphere(0.3, '#1a1a2a', 0.7, 0.08);
  nose.position.set(0, 0.44, 0.78);
  g.add(nose);
  // Tail boom
  const tail = box(0.18, 0.16, 0.92, primary, 0.55, 0.42);
  tail.position.set(0, 0.5, -0.92);
  g.add(tail);
  // Vertical tail fin
  const vfin = box(0.04, 0.44, 0.3, accent, 0.6, 0.35);
  vfin.position.set(0, 0.7, -1.22);
  g.add(vfin);
  // Skids
  [-0.26, 0.26].forEach(x => {
    const strut = box(0.06, 0.28, 0.06, '#666', 0.6, 0.4);
    strut.position.set(x, 0.14, 0);
    g.add(strut);
    const skid = box(0.06, 0.06, 1.12, '#666', 0.6, 0.4);
    skid.position.set(x, 0.0, 0);
    g.add(skid);
  });
  // Side windows
  [-0.34, 0.34].forEach(x => {
    const win = box(0.04, 0.2, 0.38, '#1a1a2a', 0.7, 0.08);
    win.position.set(x, 0.5, 0.32);
    g.add(win);
  });
  // ── Main rotor group (SPINS around Y) ─────────────────────────────────────
  const mainRotor = new THREE.Group();
  mainRotor.position.set(0, 0.9, 0);
  const mainHub = cylinder(0.09, 0.1, '#333', 0.8, 0.3);
  mainRotor.add(mainHub);
  for (let b = 0; b < 2; b++) {
    const blade = box(1.22, 0.028, 0.14, accent, 0.5, 0.35);
    blade.rotation.y = b * Math.PI / 2;
    blade.position.y = 0.06;
    mainRotor.add(blade);
  }
  g.add(mainRotor);
  // ── Tail rotor group (SPINS around X) ─────────────────────────────────────
  const tailRotor = new THREE.Group();
  tailRotor.position.set(0.18, 0.77, -1.37);
  const tailHub = cylinder(0.04, 0.04, '#333', 0.8, 0.3);
  tailHub.rotation.z = Math.PI / 2;
  tailRotor.add(tailHub);
  for (let b = 0; b < 2; b++) {
    const tb = box(0.03, 0.26, 0.055, accent, 0.5, 0.35);
    tb.rotation.z = b * Math.PI / 2;
    tailRotor.add(tb);
  }
  g.add(tailRotor);
  // Rotor spin animation
  g.userData.animate = () => {
    mainRotor.rotation.y += 0.2;
    tailRotor.rotation.x += 0.28;
  };
  return g;
}

function buildHoverSaucer(primary, accent) {
  const g = new THREE.Group();
  // Saucer disc body
  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(0.72, 0.88, 0.23, 32),
    mat(primary, 0.55, 0.3)
  );
  disc.position.set(0, 0.3, 0);
  disc.castShadow = true;
  g.add(disc);
  // Upper dome
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    mat(accent, 0.4, 0.15, accent, 0.25)
  );
  dome.material.emissiveIntensity = 0.2;
  dome.position.set(0, 0.41, 0);
  g.add(dome);
  // Cockpit window (inner darker dome)
  const win = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2),
    mat('#0a2a5a', 0.8, 0.05, '#0033ff', 0.35)
  );
  win.material.emissiveIntensity = 0.35;
  win.position.set(0, 0.42, 0);
  g.add(win);
  // Ring of 6 thrusters with animated nozzle glow
  const nozzleRefs = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const tx = Math.cos(angle) * 0.79;
    const tz = Math.sin(angle) * 0.79;
    const thruster = cylinder(0.076, 0.13, '#333', 0.8, 0.3);
    thruster.position.set(tx, 0.22, tz);
    g.add(thruster);
    const nozzle = sphere(0.06, accent, 0, 0.5, accent);
    nozzle.material.emissiveIntensity = 1.6;
    nozzle.position.set(tx, 0.14, tz);
    g.add(nozzle);
    nozzleRefs.push(nozzle);
  }
  // Underglow ring
  const underglow = new THREE.Mesh(
    new THREE.CylinderGeometry(0.74, 0.74, 0.04, 32),
    mat(accent, 0, 0.5, accent, 1.3)
  );
  underglow.position.set(0, 0.19, 0);
  g.add(underglow);
  // Electromagnetic shield ring (outer animated torus)
  const shieldMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(accent),
    emissive: new THREE.Color(accent),
    emissiveIntensity: 0.6,
    transparent: true,
    opacity: 0.22,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const shield = new THREE.Mesh(
    new THREE.TorusGeometry(0.92, 0.055, 12, 48),
    shieldMat
  );
  shield.position.set(0, 0.38, 0);
  g.add(shield);
  // Inner energy ring (closer, faster pulse)
  const innerShieldMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(accent),
    emissive: new THREE.Color(accent),
    emissiveIntensity: 1.0,
    transparent: true,
    opacity: 0.15,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const innerShield = new THREE.Mesh(
    new THREE.TorusGeometry(0.82, 0.03, 8, 40),
    innerShieldMat
  );
  innerShield.position.set(0, 0.32, 0);
  innerShield.rotation.x = Math.PI / 2;
  g.add(innerShield);
  // Thruster pulse animation + shield shimmer
  g.userData.animate = (t) => {
    nozzleRefs.forEach((n, i) => {
      n.material.emissiveIntensity = 1.0 + Math.sin(t * 6 + i * (Math.PI / 3)) * 0.8;
    });
    underglow.material.emissiveIntensity = 0.9 + Math.sin(t * 4) * 0.4;
    // EM shield shimmer — rotate + pulse opacity
    shield.rotation.y += 0.008;
    shieldMat.emissiveIntensity = 0.4 + Math.sin(t * 3.5) * 0.4;
    shieldMat.opacity = 0.15 + Math.sin(t * 3.5) * 0.1;
    innerShield.rotation.z += 0.022;
    innerShieldMat.emissiveIntensity = 0.8 + Math.sin(t * 7 + 1.5) * 0.6;
    // Whole saucer hover bob
    g.position.y = Math.sin(t * 1.1) * 0.04;
  };
  return g;
}

function buildSubmarine(primary, accent) {
  const g = new THREE.Group();
  // Main cylindrical hull
  const hull = new THREE.Mesh(
    new THREE.CylinderGeometry(0.33, 0.33, 1.78, 20),
    mat(primary, 0.6, 0.4)
  );
  hull.rotation.x = Math.PI / 2;
  hull.position.set(0, 0.4, 0);
  g.add(hull);
  // Nose cone
  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(0.33, 0.48, 20),
    mat(accent, 0.65, 0.35)
  );
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, 0.4, 1.0);
  g.add(nose);
  // Conning tower
  const tower = box(0.24, 0.38, 0.42, primary, 0.55, 0.38);
  tower.position.set(0, 0.75, 0.12);
  g.add(tower);
  // Periscope
  const scope = cylinder(0.032, 0.38, '#666', 0.7, 0.4);
  scope.position.set(0.07, 1.01, 0.1);
  g.add(scope);
  // Viewport porthole
  const port = sphere(0.09, '#00aaff', 0.6, 0.1, '#0044ff');
  port.material.emissiveIntensity = 0.8;
  port.position.set(0, 0.42, 0.37);
  g.add(port);
  // Vertical tail fin
  const vfin = box(0.04, 0.44, 0.26, accent, 0.6, 0.35);
  vfin.position.set(0, 0.6, -0.84);
  g.add(vfin);
  // Horizontal tail fins
  [-0.25, 0.25].forEach(x => {
    const fin = box(0.26, 0.04, 0.24, accent, 0.6, 0.35);
    fin.position.set(x, 0.4, -0.84);
    g.add(fin);
  });
  // Propeller hub + spinning blade group
  const propHub = cylinder(0.055, 0.05, '#444', 0.8, 0.3);
  propHub.rotation.x = Math.PI / 2;
  propHub.position.set(0, 0.4, -1.02);
  g.add(propHub);
  const propGroup = new THREE.Group();
  propGroup.position.set(0, 0.4, -1.02);
  for (let i = 0; i < 3; i++) {
    const blade = box(0.05, 0.23, 0.04, accent, 0.6, 0.35);
    blade.rotation.z = (i / 3) * Math.PI * 2;
    propGroup.add(blade);
  }
  g.add(propGroup);
  // Directional side thrusters (4 vectored pods)
  const thrusterNozzles = [];
  [[0.34, 0.4, 0.28], [-0.34, 0.4, 0.28], [0.34, 0.4, -0.44], [-0.34, 0.4, -0.44]].forEach(([tx, ty, tz]) => {
    const pod = cylinder(0.048, 0.11, '#2a2a3a', 0.75, 0.3);
    pod.rotation.z = Math.PI / 2;
    pod.position.set(tx, ty, tz);
    g.add(pod);
    const nozzle = sphere(0.042, accent, 0, 0.4, accent);
    nozzle.material.emissiveIntensity = 1.4;
    nozzle.position.set(tx + (tx > 0 ? 0.06 : -0.06), ty, tz);
    g.add(nozzle);
    thrusterNozzles.push(nozzle);
  });
  // Bioluminescent porthole accents
  const bioLights = [];
  [-0.3, 0, 0.3].forEach(tz => {
    const bio = sphere(0.055, '#00ffcc', 0, 0.3, '#00ffcc');
    bio.material.emissiveIntensity = 1.2;
    bio.position.set(0.34, 0.52, tz);
    g.add(bio);
    const bio2 = sphere(0.055, '#00ffcc', 0, 0.3, '#00ffcc');
    bio2.material.emissiveIntensity = 1.2;
    bio2.position.set(-0.34, 0.52, tz);
    g.add(bio2);
    bioLights.push(bio, bio2);
  });
  // Depth pressure ring details
  [-0.5, 0, 0.48].forEach(tz => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.33, 0.025, 8, 20),
      mat(accent, 0.6, 0.35)
    );
    ring.rotation.y = Math.PI / 2;
    ring.position.set(0, 0.4, tz);
    g.add(ring);
  });
  g.userData.animate = (t) => {
    propGroup.rotation.z += 0.07;
    // Thruster nozzle pulse
    thrusterNozzles.forEach((n, i) => {
      n.material.emissiveIntensity = 1.0 + Math.sin(t * 5 + i * 1.2) * 0.7;
    });
    // Bioluminescent glow ripple
    bioLights.forEach((b, i) => {
      b.material.emissiveIntensity = 0.6 + Math.sin(t * 2.2 + i * 0.8) * 0.9;
    });
    // Subtle hull pitch
    g.rotation.x = Math.sin(t * 0.6) * 0.035;
  };
  return g;
}

function buildRobotArm(primary, accent) {
  const PI = Math.PI;
  const g = new THREE.Group();

  // ── BASE PEDESTAL ─────────────────────────────────────────────────────────
  // Mounting plate — panel textured
  const plate = new THREE.Mesh(BOX_GEO, matPanel('#1a1a1a', 0.88, 0.25));
  plate.scale.set(0.9, 0.06, 0.9);
  plate.position.set(0, 0.03, 0); plate.receiveShadow = true;
  g.add(plate);
  // Bolt corners
  [[-0.38,-0.38],[0.38,-0.38],[-0.38,0.38],[0.38,0.38]].forEach(([bx,bz]) => {
    const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.08, 6), mat(accent, 0.9, 0.2));
    bolt.position.set(bx, 0.07, bz);
    g.add(bolt);
  });

  // Main pedestal column — brushed metal
  const pedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.34, 0.32, 12),
    matBrushed('#252525', 0.85, 0.28)
  );
  pedestal.position.set(0, 0.22, 0); pedestal.castShadow = true;
  g.add(pedestal);

  // Pedestal ribbing
  for (let i = 0; i < 6; i++) {
    const ang = (i / 6) * PI * 2;
    const rib = box(0.04, 0.28, 0.06, '#1a1a1a', 0.88, 0.25);
    rib.position.set(Math.cos(ang) * 0.3, 0.22, Math.sin(ang) * 0.3);
    rib.rotation.y = ang;
    g.add(rib);
  }

  // Cable entry (bottom)
  const cableEntry = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.055, 0.12, 8),
    mat('#111', 0.9, 0.2)
  );
  cableEntry.position.set(0.22, 0.12, 0);
  g.add(cableEntry);

  // ── J1 — TURNTABLE (waist rotation) ───────────────────────────────────
  const j1Grp = new THREE.Group();
  j1Grp.position.set(0, 0.38, 0);
  g.add(j1Grp);

  const turntable = new THREE.Mesh(
    new THREE.CylinderGeometry(0.26, 0.28, 0.1, 14),
    matBrushed(primary, 0.78, 0.22)
  );
  turntable.castShadow = true;
  j1Grp.add(turntable);

  // Turntable ring accent
  const tRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.26, 0.018, 8, 28),
    mat(accent, 0.85, 0.18, accent)
  );
  tRing.material.emissiveIntensity = 0.9;
  j1Grp.add(tRing);

  // ── J2 — SHOULDER (pitch) ─────────────────────────────────────────────
  const j2Grp = new THREE.Group();
  j2Grp.position.set(0, 0.1, 0);
  j1Grp.add(j2Grp);

  // Shoulder housing — panel-textured servo box
  const shoulderHousing = new THREE.Mesh(BOX_GEO, matPanel(primary, 0.70, 0.30));
  shoulderHousing.scale.set(0.36, 0.3, 0.28);
  shoulderHousing.position.set(0, 0.15, 0); shoulderHousing.castShadow = true;
  j2Grp.add(shoulderHousing);

  // Shoulder bearing rings
  [-0.15, 0.15].forEach(x => {
    const bearing = new THREE.Mesh(
      new THREE.TorusGeometry(0.11, 0.022, 8, 18),
      mat(accent, 0.88, 0.15)
    );
    bearing.rotation.y = PI / 2;
    bearing.position.set(x, 0.15, 0);
    j2Grp.add(bearing);
  });

  // ── LINK 1 — UPPER ARM ────────────────────────────────────────────────
  const link1Grp = new THREE.Group();
  link1Grp.position.set(0, 0.32, 0);
  j2Grp.add(link1Grp);

  // Main arm box
  const upperArm = box(0.2, 0.72, 0.2, primary, 0.65, 0.35);
  upperArm.position.set(0, 0.36, 0);
  link1Grp.add(upperArm);

  // Arm cable conduit
  const conduit = box(0.06, 0.68, 0.06, '#1a1a1a', 0.88, 0.2);
  conduit.position.set(0.12, 0.36, 0.12);
  link1Grp.add(conduit);

  // Arm glow strip (status)
  const armStrip = box(0.04, 0.6, 0.04, accent, 0, 0.1, accent);
  armStrip.material.emissiveIntensity = 1.2;
  armStrip.position.set(-0.11, 0.36, 0.11);
  link1Grp.add(armStrip);

  // Arm stiffener ribs
  for (let r = 0; r < 4; r++) {
    const rib = box(0.22, 0.025, 0.22, accent, 0.75, 0.28);
    rib.position.set(0, 0.12 + r * 0.18, 0);
    link1Grp.add(rib);
  }

  // ── J3 — ELBOW (pitch) ───────────────────────────────────────────────
  const j3Grp = new THREE.Group();
  j3Grp.position.set(0, 0.74, 0);
  link1Grp.add(j3Grp);

  const elbowHousing = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.16, 0.3, 12),
    mat(accent, 0.75, 0.25)
  );
  elbowHousing.rotation.z = PI / 2;
  j3Grp.add(elbowHousing);

  // Elbow bearing
  const elbowBearing = new THREE.Mesh(
    new THREE.TorusGeometry(0.155, 0.02, 8, 18),
    mat(primary, 0.88, 0.18)
  );
  j3Grp.add(elbowBearing);

  // ── LINK 2 — FOREARM ─────────────────────────────────────────────────
  const link2Grp = new THREE.Group();
  link2Grp.position.set(0, 0.15, 0);
  j3Grp.add(link2Grp);

  const forearm = box(0.16, 0.52, 0.16, primary, 0.62, 0.38);
  forearm.position.set(0, 0.26, 0);
  link2Grp.add(forearm);

  // Forearm cable wrap
  for (let c = 0; c < 5; c++) {
    const wrap = new THREE.Mesh(
      new THREE.TorusGeometry(0.095, 0.01, 6, 14),
      mat('#111', 0.9, 0.2)
    );
    wrap.position.set(0, 0.06 + c * 0.1, 0);
    link2Grp.add(wrap);
  }

  // Forearm glow strip
  const faStrip = box(0.035, 0.44, 0.035, accent, 0, 0.1, accent);
  faStrip.material.emissiveIntensity = 1.0;
  faStrip.position.set(0.09, 0.26, -0.09);
  link2Grp.add(faStrip);

  // ── J4/J5 — WRIST ASSEMBLY ────────────────────────────────────────────
  const j4Grp = new THREE.Group();
  j4Grp.position.set(0, 0.54, 0);
  link2Grp.add(j4Grp);

  // Wrist roll housing
  const wristRoll = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 0.14, 10),
    mat(accent, 0.78, 0.22)
  );
  j4Grp.add(wristRoll);

  // Wrist pitch housing
  const wristPitch = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.09, 0.18, 10),
    mat(primary, 0.72, 0.28)
  );
  wristPitch.rotation.z = PI / 2;
  wristPitch.position.set(0, 0.1, 0);
  j4Grp.add(wristPitch);

  // ── J6 — END EFFECTOR (3-finger gripper) ─────────────────────────────
  const j6Grp = new THREE.Group();
  j6Grp.position.set(0, 0.22, 0);
  j4Grp.add(j6Grp);

  // Gripper flange
  const flange = new THREE.Mesh(
    new THREE.CylinderGeometry(0.1, 0.1, 0.06, 10),
    mat('#111', 0.92, 0.2)
  );
  j6Grp.add(flange);

  // Gripper fingers (3 at 120° apart)
  const fingerRefs = [];
  for (let f = 0; f < 3; f++) {
    const ang = (f / 3) * PI * 2;
    const fingerGrp = new THREE.Group();
    fingerGrp.position.set(Math.cos(ang) * 0.09, 0.02, Math.sin(ang) * 0.09);
    fingerGrp.rotation.y = ang;
    j6Grp.add(fingerGrp);

    const knuckle = box(0.045, 0.06, 0.04, accent, 0.8, 0.25);
    knuckle.position.set(0, 0.03, 0);
    fingerGrp.add(knuckle);

    const tip = box(0.04, 0.1, 0.035, '#222', 0.85, 0.25);
    tip.position.set(0, 0.12, 0);
    fingerGrp.add(tip);

    // Fingertip grip pad
    const pad = box(0.035, 0.04, 0.03, accent, 0.3, 0.5, accent);
    pad.material.emissiveIntensity = 0.6;
    pad.position.set(0, 0.18, 0);
    fingerGrp.add(pad);

    fingerRefs.push(fingerGrp);
  }

  // Work lamp (pointing at gripper)
  const lamp = box(0.05, 0.05, 0.05, '#ffffcc', 0, 0.1, '#ffffff');
  lamp.material.emissiveIntensity = 1.5;
  lamp.position.set(0.1, 0.08, 0);
  j6Grp.add(lamp);

  // ── ANIMATION — coordinated 6-DOF industrial cycle ────────────────────
  g.userData.animate = (t) => {
    // J1 — slow waist sweep
    j1Grp.rotation.y = Math.sin(t * 0.5) * 0.65;
    // J2 — shoulder pitch
    j2Grp.rotation.x = -0.3 + Math.sin(t * 0.7 + 0.8) * 0.35;
    // J3 — elbow flex
    j3Grp.rotation.x = 0.5 + Math.sin(t * 0.9 + 1.2) * 0.45;
    // J4 — wrist roll
    j4Grp.rotation.y = Math.sin(t * 2.2) * 0.8;
    // J5 — wrist pitch
    j4Grp.rotation.x = Math.sin(t * 1.8 + 0.5) * 0.35;
    // J6 — gripper open/close
    const grip = 0.08 + Math.abs(Math.sin(t * 1.4)) * 0.14;
    fingerRefs.forEach((fg, i) => {
      const a = (i / 3) * PI * 2;
      fg.position.set(Math.cos(a) * grip, 0.02, Math.sin(a) * grip);
    });
    // Glow strips pulse with activity
    armStrip.material.emissiveIntensity = 0.8 + Math.sin(t * 4) * 0.5;
    faStrip.material.emissiveIntensity  = 0.8 + Math.sin(t * 4 + 1) * 0.5;
  };

  return g;
}

function buildSpaceRover(primary, accent) {
  const g = new THREE.Group();
  // Low wide chassis
  const body = box(1.22, 0.3, 1.58, primary, 0.55, 0.4);
  body.position.set(0, 0.47, 0);
  g.add(body);
  // Solar panel wings
  [-0.9, 0.9].forEach(x => {
    const panel = box(0.52, 0.04, 0.94, '#0055aa', 0.4, 0.6);
    panel.position.set(x, 0.64, 0);
    g.add(panel);
    // Panel grid detail
    const grid = box(0.5, 0.02, 0.07, accent, 0.3, 0.5);
    grid.position.set(x, 0.67, 0);
    g.add(grid);
  });
  // Instrument mast
  const mast = cylinder(0.035, 0.68, '#888', 0.7, 0.4);
  mast.position.set(0.2, 0.9, 0.36);
  g.add(mast);
  // Camera head on mast
  const camBox = box(0.22, 0.17, 0.19, '#222', 0.8, 0.2);
  camBox.position.set(0.2, 1.26, 0.36);
  g.add(camBox);
  // RTG power unit (rear cylinder)
  const rtg = cylinder(0.09, 0.46, '#666', 0.7, 0.35);
  rtg.rotation.z = Math.PI / 2;
  rtg.position.set(0, 0.54, -0.7);
  g.add(rtg);
  // 6 large rocker-bogie wheels
  addWheels(g, [
    [-0.74, 0.28, 0.56], [0.74, 0.28, 0.56],
    [-0.74, 0.28, 0],    [0.74, 0.28, 0],
    [-0.74, 0.28, -0.56],[0.74, 0.28, -0.56],
  ], 0.3, 0.21, '#2a2a2a');
  return g;
}

function buildLegoBot(primary, accent) {
  const g = new THREE.Group();
  // Blocky square body
  const body = box(0.92, 0.84, 0.84, primary, 0.35, 0.65);
  body.position.set(0, 0.72, 0);
  g.add(body);
  // Body stud
  const stud = cylinder(0.2, 0.18, primary, 0.4, 0.6);
  stud.position.set(0, 1.18, 0);
  g.add(stud);
  // Square head
  const head = box(0.72, 0.64, 0.7, accent, 0.38, 0.6);
  head.position.set(0, 1.51, 0);
  g.add(head);
  // Head stud
  const headStud = cylinder(0.15, 0.14, accent, 0.4, 0.6);
  headStud.position.set(0, 1.87, 0);
  g.add(headStud);
  // Square eyes
  [-0.17, 0.17].forEach(x => {
    const eye = box(0.17, 0.17, 0.04, '#111', 0.5, 0.5, accent);
    eye.material.emissiveIntensity = 0.9;
    eye.position.set(x, 1.55, 0.37);
    g.add(eye);
  });
  // Square mouth
  const mouth = box(0.32, 0.08, 0.04, '#111', 0.5, 0.5);
  mouth.position.set(0, 1.35, 0.37);
  g.add(mouth);
  // Block arms
  [-0.64, 0.64].forEach(x => {
    const ua = box(0.26, 0.54, 0.26, primary, 0.4, 0.65);
    ua.position.set(x, 0.72, 0);
    g.add(ua);
    const hand = box(0.24, 0.32, 0.24, accent, 0.4, 0.65);
    hand.position.set(x, 0.38, 0);
    g.add(hand);
  });
  // Block legs
  [-0.24, 0.24].forEach(x => {
    const leg = box(0.32, 0.54, 0.32, primary, 0.4, 0.65);
    leg.position.set(x, 0.16, 0);
    g.add(leg);
    const foot = box(0.34, 0.19, 0.4, accent, 0.4, 0.65);
    foot.position.set(x, -0.14, 0.06);
    g.add(foot);
  });
  return g;
}

function buildJetPlane(primary, accent) {
  const PI = Math.PI;
  const g = new THREE.Group();
  // Raise so wheels touch ground
  g.position.y = 0.14;

  // ── FUSELAGE — multi-section tapered body ─────────────────────────────────
  // All cylinder sections share rotation.x = PI/2 → axis along Z (fwd = -Z)

  // Radar nose cone (pointed) — brushed metal tip
  const noseCone = new THREE.Mesh(
    new THREE.ConeGeometry(0.14, 0.72, 12),
    matBrushed(primary, 0.82, 0.18)
  );
  noseCone.rotation.x = -PI / 2;
  noseCone.position.set(0, 0.22, -1.44);
  noseCone.castShadow = true;
  g.add(noseCone);

  // Radome tip — radar-absorbing material
  const radome = new THREE.Mesh(
    new THREE.SphereGeometry(0.062, 10, 8),
    mat('#2a1a1a', 0.2, 0.65)
  );
  radome.position.set(0, 0.22, -1.76);
  g.add(radome);

  // Forward fuselage — panel textured
  const fuseFwd = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.18, 0.58, 12),
    matPanel(primary, 0.80, 0.20)
  );
  fuseFwd.rotation.x = PI / 2;
  fuseFwd.position.set(0, 0.22, -1.08);
  fuseFwd.castShadow = true;
  g.add(fuseFwd);

  // Cockpit section — panel textured
  const fuseCpit = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.205, 0.52, 12),
    matPanel(primary, 0.80, 0.20)
  );
  fuseCpit.rotation.x = PI / 2;
  fuseCpit.position.set(0, 0.22, -0.56);
  fuseCpit.castShadow = true;
  g.add(fuseCpit);

  // Mid fuselage (widest) — panel textured
  const fuseMid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.24, 0.88, 12),
    matPanel(primary, 0.78, 0.22)
  );
  fuseMid.rotation.x = PI / 2;
  fuseMid.position.set(0, 0.22, 0.0);
  fuseMid.castShadow = true;
  g.add(fuseMid);

  // Aft fuselage — panel textured
  const fuseAft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.22, 0.72, 12),
    matPanel(primary, 0.78, 0.22)
  );
  fuseAft.rotation.x = PI / 2;
  fuseAft.position.set(0, 0.22, 0.62);
  fuseAft.castShadow = true;
  g.add(fuseAft);

  // Tail boom — panel textured
  const fuseTail = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.18, 0.62, 12),
    matPanel(primary, 0.78, 0.22)
  );
  fuseTail.rotation.x = PI / 2;
  fuseTail.position.set(0, 0.22, 1.02);
  fuseTail.castShadow = true;
  g.add(fuseTail);

  // ── COCKPIT CANOPY — glass material ─────────────────────────────────────
  const canopy = new THREE.Mesh(
    new THREE.SphereGeometry(0.185, 12, 8, 0, PI * 2, 0, PI * 0.52),
    matGlass('#071828')
  );
  canopy.material.transparent = true;
  canopy.material.opacity = 0.76;
  canopy.position.set(0, 0.375, -0.58);
  g.add(canopy);
  // Canopy side frames
  [-0.065, 0.065].forEach(x => {
    const frame = box(0.012, 0.022, 0.34, accent, 0.82, 0.28);
    frame.position.set(x, 0.4, -0.58);
    g.add(frame);
  });
  // HUD glow inside canopy
  const hud = box(0.14, 0.06, 0.01, accent, 0, 0.1, accent);
  hud.material.emissiveIntensity = 0.8;
  hud.position.set(0, 0.36, -0.74);
  g.add(hud);

  // ── MAIN DELTA WINGS ──────────────────────────────────────────────────────
  [-1, 1].forEach((s, si) => {
    // Main wing panel
    const wing = new THREE.Mesh(
      new THREE.BoxGeometry(0.94, 0.055, 1.12),
      mat(primary, 0.72, 0.28)
    );
    wing.position.set(s * 0.62, 0.19, 0.14);
    wing.rotation.z = s * -0.04;
    wing.rotation.y = s * 0.16;
    g.add(wing);

    // Leading edge stripe
    const le = box(0.04, 0.06, 0.92, accent, 0.82, 0.2);
    le.position.set(s * 0.62, 0.19, -0.28);
    le.rotation.y = s * 0.16;
    g.add(le);

    // Wing tip winglet
    const tip = new THREE.Mesh(
      new THREE.BoxGeometry(0.055, 0.22, 0.24),
      mat(accent, 0.8, 0.2)
    );
    tip.position.set(s * 1.12, 0.24, 0.08);
    tip.rotation.z = s * 0.32;
    g.add(tip);

    // Aileron (trailing edge)
    const aileron = box(0.6, 0.042, 0.16, accent, 0.72, 0.3);
    aileron.position.set(s * 0.62, 0.18, 0.58);
    aileron.rotation.y = s * 0.16;
    aileron.rotation.x = s * -0.06;
    g.add(aileron);

    // Under-wing pylon
    const pylon = box(0.055, 0.15, 0.36, '#1a1a2a', 0.88, 0.22);
    pylon.position.set(s * 0.62, 0.05, 0.1);
    g.add(pylon);

    // Missile body
    const missile = new THREE.Mesh(
      new THREE.CylinderGeometry(0.026, 0.026, 0.42, 6),
      mat('#b0b8c8', 0.9, 0.15)
    );
    missile.rotation.x = PI / 2;
    missile.position.set(s * 0.62, -0.02, 0.1);
    g.add(missile);
    const missileTip = new THREE.Mesh(
      new THREE.ConeGeometry(0.026, 0.12, 6),
      mat('#cc2222', 0.8, 0.2)
    );
    missileTip.rotation.x = -PI / 2;
    missileTip.position.set(s * 0.62, -0.02, -0.12);
    g.add(missileTip);

    // Nav light
    const navLight = box(0.042, 0.042, 0.042, '#fff', 0.1, 0.5, s < 0 ? '#ff1111' : '#00ff44');
    navLight.material.emissiveIntensity = 2.2;
    navLight.position.set(s * 1.16, 0.21, 0.1);
    g.add(navLight);
  });

  // ── TWIN VERTICAL TAIL FINS ───────────────────────────────────────────────
  [-0.23, 0.23].forEach((x, i) => {
    const fin = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.6, 0.56),
      mat(primary, 0.74, 0.26)
    );
    fin.position.set(x, 0.55, 0.85);
    fin.rotation.y = i === 0 ? 0.17 : -0.17;
    g.add(fin);

    // Rudder
    const rudder = box(0.052, 0.5, 0.11, accent, 0.72, 0.28);
    rudder.position.set(x, 0.55, 1.12);
    g.add(rudder);

    // Fin tip light
    const finTip = sphere(0.028, accent, 0, 0.2, accent);
    finTip.material.emissiveIntensity = 2.0;
    finTip.position.set(x, 0.88, 0.68);
    g.add(finTip);
  });

  // ── HORIZONTAL STABILIZERS ────────────────────────────────────────────────
  [-1, 1].forEach(s => {
    const hStab = new THREE.Mesh(
      new THREE.BoxGeometry(0.56, 0.05, 0.36),
      mat(primary, 0.72, 0.28)
    );
    hStab.position.set(s * 0.4, 0.22, 0.96);
    hStab.rotation.y = s * 0.09;
    g.add(hStab);
    const elev = box(0.44, 0.042, 0.1, accent, 0.72, 0.3);
    elev.position.set(s * 0.4, 0.22, 1.18);
    g.add(elev);
  });

  // ── TWIN ENGINE NACELLES ──────────────────────────────────────────────────
  const engineGlows = [];
  [-0.2, 0.2].forEach(ex => {
    // Air intake (chin scoop)
    const intake = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.09, 0.4),
      mat('#0a0a14', 0.92, 0.08)
    );
    intake.position.set(ex, 0.09, -0.2);
    g.add(intake);
    const intakeLip = box(0.22, 0.025, 0.038, accent, 0.82, 0.18);
    intakeLip.position.set(ex, 0.14, -0.42);
    g.add(intakeLip);

    // Engine cylinder
    const eng = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.13, 0.88, 12),
      mat('#101520', 0.92, 0.1)
    );
    eng.rotation.x = PI / 2;
    eng.position.set(ex, 0.22, 0.62);
    g.add(eng);

    // Engine band rings
    for (let r = 0; r < 3; r++) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.115, 0.008, 6, 14),
        mat(accent, 0.88, 0.14)
      );
      ring.rotation.x = PI / 2;
      ring.position.set(ex, 0.22, 0.32 + r * 0.22);
      g.add(ring);
    }

    // Nozzle
    const nozzle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.068, 0.1, 0.2, 12),
      mat('#080808', 0.96, 0.08)
    );
    nozzle.rotation.x = PI / 2;
    nozzle.position.set(ex, 0.22, 1.17);
    g.add(nozzle);

    // Afterburner glow disc
    const glowDisc = new THREE.Mesh(
      new THREE.CircleGeometry(0.065, 12),
      mat(accent, 0, 0.05, accent)
    );
    glowDisc.material.emissiveIntensity = 3.0;
    glowDisc.rotation.y = PI;
    glowDisc.position.set(ex, 0.22, 1.3);
    g.add(glowDisc);
    engineGlows.push(glowDisc);

    // Afterburner flame cone
    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(0, 0.068, 10),
      mat('#ff5500', 0, 0.05, '#ff2200')
    );
    flame.material.emissiveIntensity = 2.0;
    flame.material.transparent = true;
    flame.material.opacity = 0.65;
    flame.rotation.x = PI / 2;
    flame.position.set(ex, 0.22, 1.42);
    g.add(flame);
    engineGlows.push(flame);
  });

  // ── FUSELAGE DETAIL ───────────────────────────────────────────────────────
  // Side intake scoops
  [-1, 1].forEach(s => {
    const scoop = box(0.055, 0.16, 0.34, primary, 0.76, 0.28);
    scoop.position.set(s * 0.26, 0.22, -0.18);
    g.add(scoop);
    const scoopRim = box(0.038, 0.025, 0.34, accent, 0.82, 0.2);
    scoopRim.position.set(s * 0.28, 0.09, -0.18);
    g.add(scoopRim);
  });

  // Fuselage accent stripe
  const stripe = box(0.038, 0.055, 1.52, accent, 0.72, 0.22, accent);
  stripe.material.emissiveIntensity = 0.35;
  stripe.position.set(0, 0.38, -0.28);
  g.add(stripe);

  // Pitot tube
  const pitot = cylinder(0.007, 0.3, accent, 0.92, 0.18);
  pitot.rotation.x = -PI / 2;
  pitot.position.set(0.09, 0.24, -1.92);
  g.add(pitot);

  // ── LANDING GEAR ──────────────────────────────────────────────────────────
  // Nose gear
  const noseStrut = cylinder(0.025, 0.16, '#888', 0.82, 0.28);
  noseStrut.position.set(0, 0.04, -0.78);
  g.add(noseStrut);
  const noseWheel = new THREE.Mesh(
    new THREE.TorusGeometry(0.052, 0.02, 6, 12),
    mat('#222', 0.82, 0.6)
  );
  noseWheel.rotation.y = PI / 2;
  noseWheel.position.set(0, -0.05, -0.78);
  g.add(noseWheel);

  // Main gear (twin)
  [-0.48, 0.48].forEach(gx => {
    const strut = cylinder(0.025, 0.18, '#888', 0.82, 0.28);
    strut.position.set(gx, 0.02, 0.14);
    g.add(strut);
    const wheel = new THREE.Mesh(
      new THREE.TorusGeometry(0.062, 0.024, 6, 12),
      mat('#222', 0.82, 0.6)
    );
    wheel.rotation.y = PI / 2;
    wheel.position.set(gx, -0.08, 0.14);
    g.add(wheel);
  });

  // ── ANIMATION ─────────────────────────────────────────────────────────────
  g.userData.animate = (t) => {
    // Gentle idle banking / pitch oscillation
    g.rotation.z = Math.sin(t * 0.55) * 0.038;
    g.rotation.x = Math.sin(t * 0.38) * 0.016;
    // Afterburner flicker
    engineGlows.forEach((gw, i) => {
      gw.material.emissiveIntensity =
        2.0 + Math.sin(t * 22 + i * 1.7) * 0.9 + Math.random() * 0.4;
    });
  };

  return g;
}

// ─── NEW UNIQUE CHASSIS BUILDERS ──────────────────────────────────────────

// FARM BOT — wide tractor-inspired agricultural robot with cultivator arm and seed hoppers
function buildFarmBot(primary, accent) {
  const g = new THREE.Group();
  // Wide low chassis (tractor body)
  const body = box(1.1, 0.38, 1.3, primary, 0.65, 0.5);
  body.position.set(0, 0.32, 0);
  g.add(body);
  // Hood / engine bay
  const hood = box(0.78, 0.3, 0.52, accent, 0.6, 0.4);
  hood.position.set(0, 0.56, 0.38);
  g.add(hood);
  // Exhaust stack
  const exhaust = cylinder(0.04, 0.38, '#333', 0.8, 0.3);
  exhaust.position.set(0.22, 0.82, 0.38);
  g.add(exhaust);
  const smoke = sphere(0.06, '#888', 0.3, 0.8);
  smoke.position.set(0.22, 1.04, 0.38);
  g.add(smoke);
  // Cab / operator dome
  const cab = box(0.62, 0.38, 0.5, '#1a3a1a', 0.7, 0.15, '#00ff88');
  cab.material.emissiveIntensity = 0.15;
  cab.position.set(0, 0.62, -0.14);
  g.add(cab);
  // Big rear wheels (×2) — large diameter
  [-0.62, 0.62].forEach(x => {
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.22, 14), mat('#222', 0.8, 0.3));
    rim.rotation.z = Math.PI / 2;
    rim.position.set(x, 0.32, -0.32);
    g.add(rim);
    const tyre = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.09, 8, 16), mat('#111', 0.9, 0.5));
    tyre.rotation.x = Math.PI / 2;
    tyre.position.set(x, 0.32, -0.32);
    g.add(tyre);
  });
  // Small front wheels (×2)
  addWheels(g, [[-0.5, 0.2, 0.42], [0.5, 0.2, 0.42]], 0.16, 0.14, '#222');
  // Cultivator arm (rear mounted, angled down)
  const armBase = box(0.14, 0.18, 0.14, '#555', 0.7, 0.35);
  armBase.position.set(0, 0.44, -0.72);
  g.add(armBase);
  const arm = box(0.12, 0.08, 0.58, accent, 0.65, 0.4);
  arm.rotation.x = 0.32;
  arm.position.set(0, 0.3, -0.96);
  g.add(arm);
  // Cultivator tines (3 prongs)
  [-0.16, 0, 0.16].forEach(x => {
    const tine = new THREE.Mesh(new THREE.ConeGeometry(0.025, 0.22, 5), mat('#888', 0.8, 0.4));
    tine.rotation.x = Math.PI;
    tine.position.set(x, 0.06, -1.14);
    g.add(tine);
  });
  // Seed hopper (left side box)
  const hopper = box(0.22, 0.32, 0.38, '#e8c44a', 0.5, 0.5);
  hopper.position.set(-0.62, 0.56, -0.08);
  g.add(hopper);
  const hopperLid = box(0.24, 0.06, 0.4, '#c8a030', 0.55, 0.45);
  hopperLid.position.set(-0.62, 0.74, -0.08);
  g.add(hopperLid);
  // Status LED
  const statusLed = sphere(0.04, '#00ff44', 0, 0.2, '#00ff44');
  statusLed.material.emissiveIntensity = 1.8;
  statusLed.position.set(0.3, 0.72, 0.38);
  g.add(statusLed);

  g.userData.animate = (t) => {
    statusLed.material.emissiveIntensity = 1.4 + Math.sin(t * 1.8) * 0.6;
    arm.rotation.x = 0.32 + Math.sin(t * 1.4) * 0.12;
  };
  return g;
}

// HOVER RACER — ultra-low sleek racing hover vehicle with side exhausts and spoiler
function buildHoverRacer(primary, accent) {
  const g = new THREE.Group();
  // Flat aerodynamic hull
  const hull = new THREE.Mesh(
    new THREE.BoxGeometry(0.72, 0.12, 1.48),
    mat(primary, 0.7, 0.25)
  );
  hull.position.set(0, 0.22, 0);
  g.add(hull);
  // Nose cone (tapered front)
  const nose = new THREE.Mesh(
    new THREE.CylinderGeometry(0.0, 0.22, 0.5, 6),
    mat(accent, 0.6, 0.3)
  );
  nose.rotation.x = Math.PI / 2;
  nose.position.set(0, 0.22, 0.98);
  g.add(nose);
  // Driver cockpit bubble
  const cockpit = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 8), mat('#0a0a1a', 0.85, 0.08, '#0044ff'));
  cockpit.material.emissiveIntensity = 0.25;
  cockpit.scale.set(0.7, 0.55, 1.1);
  cockpit.position.set(0, 0.36, 0.2);
  g.add(cockpit);
  // Rear spoiler
  const spoilerPost = box(0.04, 0.22, 0.05, accent, 0.6, 0.3);
  spoilerPost.position.set(0, 0.38, -0.66);
  g.add(spoilerPost);
  const spoilerWing = box(0.82, 0.06, 0.14, accent, 0.65, 0.28);
  spoilerWing.position.set(0, 0.52, -0.66);
  g.add(spoilerWing);
  // Racing stripe
  const stripe = box(0.08, 0.02, 1.4, accent, 0.4, 0.3, accent);
  stripe.material.emissiveIntensity = 1.2;
  stripe.position.set(0, 0.29, 0);
  g.add(stripe);
  // Side hover pods (×2) with thrust rings
  const nozzleRefs = [];
  [-0.42, 0.42].forEach((x, i) => {
    const pod = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.28, 10), mat(primary, 0.7, 0.25));
    pod.position.set(x, 0.18, 0);
    g.add(pod);
    // Thrust glow ring underneath
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.025, 8, 24),
      new THREE.MeshStandardMaterial({ color: new THREE.Color('#00ccff'), emissive: new THREE.Color('#00ccff'), emissiveIntensity: 1.8, transparent: true, opacity: 0.85 }));
    ring.position.set(x, 0.06, 0);
    g.add(ring);
    nozzleRefs.push(ring);
    // Side exhaust vent
    const vent = box(0.06, 0.06, 0.32, '#333', 0.8, 0.35);
    vent.position.set(x + (x > 0 ? 0.16 : -0.16), 0.22, -0.2);
    g.add(vent);
    // Racing number LED
    const numLed = sphere(0.04, accent, 0, 0.3, accent);
    numLed.material.emissiveIntensity = 2.2;
    numLed.position.set(x, 0.29, 0.55);
    g.add(numLed);
    nozzleRefs.push(numLed);
  });
  // Front bumper
  const bumper = box(0.72, 0.1, 0.08, '#333', 0.75, 0.4);
  bumper.position.set(0, 0.22, 0.74);
  g.add(bumper);

  g.userData.animate = (t) => {
    g.position.y = Math.sin(t * 2.8) * 0.035;
    g.rotation.z = Math.sin(t * 1.6) * 0.02;
    nozzleRefs.forEach((n, i) => {
      n.material.emissiveIntensity = 1.4 + Math.sin(t * 8 + i * 0.5) * 0.9;
    });
  };
  return g;
}

// DEEP SEA BOT — alien-looking extreme-depth explorer, angular pressure hull with sonar array
function buildDeepSeaBot(primary, accent) {
  const g = new THREE.Group();
  // Heavy octagonal pressure hull
  const hull = new THREE.Mesh(
    new THREE.CylinderGeometry(0.44, 0.44, 0.88, 8),
    mat(primary, 0.5, 0.45)
  );
  hull.position.set(0, 0.48, 0);
  g.add(hull);
  // Forward sensor dome
  const senseDome = new THREE.Mesh(new THREE.SphereGeometry(0.28, 12, 8), mat('#0a1a2a', 0.85, 0.05, '#00ffcc'));
  senseDome.material.emissiveIntensity = 0.3;
  senseDome.scale.set(1, 0.75, 1);
  senseDome.position.set(0, 0.54, 0.48);
  g.add(senseDome);
  // Pressure rings (4 reinforcement bands)
  const ringRefs = [];
  [-0.26, 0, 0.28].forEach(y => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.46, 0.032, 8, 16), mat('#333', 0.75, 0.35));
    ring.position.set(0, 0.48 + y, 0);
    g.add(ring);
    ringRefs.push(ring);
  });
  // Sonar array — 4 upward-facing dishes
  [-0.24, 0.24].forEach(x => {
    [-0.22, 0.22].forEach(z => {
      const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.06, 0.06, 8), mat(accent, 0.6, 0.35));
      dish.position.set(x, 0.96, z);
      g.add(dish);
      const dishLens = sphere(0.055, '#00ffcc', 0, 0.2, '#00ffcc');
      dishLens.material.emissiveIntensity = 1.6;
      dishLens.position.set(x, 1.02, z);
      g.add(dishLens);
    });
  });
  // 4 vectored thrusters (side-mounted)
  const thrusterGlows = [];
  [[0.5, 0.52, 0.28], [-0.5, 0.52, 0.28], [0.5, 0.52, -0.28], [-0.5, 0.52, -0.28]].forEach(([tx, ty, tz]) => {
    const tBody = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.22, 8), mat('#1a2a3a', 0.75, 0.35));
    tBody.rotation.z = Math.PI / 2;
    tBody.position.set(tx, ty, tz);
    g.add(tBody);
    const tGlow = sphere(0.06, accent, 0, 0.3, accent);
    tGlow.material.emissiveIntensity = 1.4;
    tGlow.position.set(tx + (tx > 0 ? 0.12 : -0.12), ty, tz);
    g.add(tGlow);
    thrusterGlows.push(tGlow);
  });
  // Bioluminescent port windows (×4)
  const bioLights = [];
  [0, Math.PI / 2, Math.PI, Math.PI * 1.5].forEach((angle, i) => {
    const port = sphere(0.06, '#00ffcc', 0, 0.25, '#00ffcc');
    port.material.emissiveIntensity = 1.2;
    port.position.set(Math.sin(angle) * 0.46, 0.48, Math.cos(angle) * 0.46);
    g.add(port);
    bioLights.push(port);
  });
  // Keel weight
  const keel = box(0.3, 0.12, 0.72, '#111', 0.85, 0.4);
  keel.position.set(0, 0.06, 0);
  g.add(keel);

  g.userData.animate = (t) => {
    thrusterGlows.forEach((n, i) => { n.material.emissiveIntensity = 1.0 + Math.sin(t * 4 + i * 0.9) * 0.7; });
    bioLights.forEach((b, i) => { b.material.emissiveIntensity = 0.8 + Math.sin(t * 2.2 + i * 1.1) * 0.7; });
    senseDome.material.emissiveIntensity = 0.2 + Math.sin(t * 1.5) * 0.2;
    g.rotation.x = Math.sin(t * 0.7) * 0.04;
    g.position.y = Math.sin(t * 0.9) * 0.03;
  };
  return g;
}

// SECURITY BOT — upright armored patrol platform with rotating surveillance head
function buildSecurityBot(primary, accent) {
  const g = new THREE.Group();
  // ── Wheeled base / armored platform ──────────────────────────────────────
  const base = box(0.82, 0.22, 1.05, '#1a1a2e', 0.75, 0.3);
  base.position.set(0, 0.14, 0);
  g.add(base);
  // Armor skirt sides
  [-0.44, 0.44].forEach(x => {
    const skirt = box(0.06, 0.18, 1.02, primary, 0.7, 0.3);
    skirt.position.set(x, 0.14, 0);
    g.add(skirt);
  });
  // 4 wheels (low-profile patrol tyres)
  addWheels(g, [
    [-0.48, 0.12,  0.36], [0.48, 0.12,  0.36],
    [-0.48, 0.12, -0.36], [0.48, 0.12, -0.36],
  ], 0.12, 0.14, '#111');
  // ── Vertical torso mast ────────────────────────────────────────────────
  const mast = box(0.36, 0.72, 0.36, primary, 0.65, 0.28);
  mast.position.set(0, 0.62, -0.06);
  g.add(mast);
  // Chest armour panel
  const chest = box(0.3, 0.5, 0.06, '#0d0d2a', 0.8, 0.2);
  chest.position.set(0, 0.62, 0.21);
  g.add(chest);
  // Security badge / logo plate
  const badge = box(0.18, 0.14, 0.04, accent, 0.4, 0.3, accent);
  badge.material.emissiveIntensity = 0.6;
  badge.position.set(0, 0.72, 0.24);
  g.add(badge);
  // ── Shoulder-mounted spotlight arms ────────────────────────────────────
  const spotlightRefs = [];
  [-0.24, 0.24].forEach(x => {
    const arm = box(0.38, 0.06, 0.06, '#333', 0.7, 0.4);
    arm.position.set(x * 1.1, 0.92, 0.06);
    g.add(arm);
    const spotlight = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.09, 0.15, 8),
      mat('#ccc', 0.8, 0.15)
    );
    spotlight.rotation.x = -Math.PI / 2;
    spotlight.position.set(x * 1.5, 0.92, 0.22);
    g.add(spotlight);
    const beam = sphere(0.07, '#ffffff', 0.1, 0.1, '#ffffaa');
    beam.material.emissiveIntensity = 2.2;
    beam.material.transparent = true;
    beam.material.opacity = 0.85;
    beam.position.set(x * 1.5, 0.92, 0.32);
    g.add(beam);
    spotlightRefs.push(beam);
  });
  // ── Siren lights (red / blue alternating) ──────────────────────────────
  const sirenBar = box(0.38, 0.08, 0.12, '#222', 0.6, 0.4);
  sirenBar.position.set(0, 1.03, 0.06);
  g.add(sirenBar);
  const sirenRed  = sphere(0.055, '#ff1111', 0, 0, '#ff1111');
  sirenRed.material.emissiveIntensity = 2.5;
  sirenRed.position.set(-0.14, 1.05, 0.1);
  g.add(sirenRed);
  const sirenBlue = sphere(0.055, '#1111ff', 0, 0, '#1111ff');
  sirenBlue.material.emissiveIntensity = 2.5;
  sirenBlue.position.set(0.14, 1.05, 0.1);
  g.add(sirenBlue);
  // ── Rotating surveillance head ─────────────────────────────────────────
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.12, 0.02);
  g.add(headGroup);
  const headBody = box(0.32, 0.28, 0.3, primary, 0.65, 0.25);
  headGroup.add(headBody);
  // Main surveillance camera (front)
  const camHousing = box(0.18, 0.14, 0.08, '#111', 0.75, 0.2);
  camHousing.position.set(0, 0, 0.2);
  headGroup.add(camHousing);
  const camLens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.06, 0.08, 10),
    mat('#000830', 0.3, 0.05, '#0033ff', 0.9)
  );
  camLens.rotation.x = Math.PI / 2;
  camLens.position.set(0, 0, 0.26);
  headGroup.add(camLens);
  // Side cameras (180° coverage)
  [-0.18, 0.18].forEach(x => {
    const sideCam = box(0.06, 0.08, 0.1, '#222', 0.7, 0.2);
    sideCam.position.set(x, 0.02, 0.06);
    headGroup.add(sideCam);
    const sideLens = sphere(0.04, '#001a66', 0.2, 0.05, '#0044ff');
    sideLens.material.emissiveIntensity = 0.7;
    sideLens.position.set(x * 1.5, 0.02, 0.1);
    headGroup.add(sideLens);
  });
  // Scanning laser emitter
  const laserDot = sphere(0.025, '#ff0000', 0, 0, '#ff0000');
  laserDot.material.emissiveIntensity = 3.0;
  laserDot.position.set(0.06, -0.06, 0.28);
  headGroup.add(laserDot);
  // Antenna sensor spikes
  [[-0.1, 0.08], [0.1, 0.06]].forEach(([ax, az]) => {
    const ant = cylinder(0.012, 0.22, '#555', 0.6, 0.4);
    ant.position.set(ax, 0.22, az);
    headGroup.add(ant);
    const tip = sphere(0.022, accent, 0, 0, accent);
    tip.material.emissiveIntensity = 1.5;
    tip.position.set(ax, 0.34, az);
    headGroup.add(tip);
  });
  // ── Animation ──────────────────────────────────────────────────────────
  let sirenPhase = 0;
  g.userData.animate = (t) => {
    // Head scans left-right slowly
    headGroup.rotation.y = Math.sin(t * 0.6) * 0.65;
    // Siren alternates red/blue
    sirenPhase += 0.08;
    const s = Math.sin(sirenPhase * 3.5);
    sirenRed.material.emissiveIntensity  = s > 0 ? 3.0 : 0.4;
    sirenBlue.material.emissiveIntensity = s < 0 ? 3.0 : 0.4;
    // Spotlight pulse
    spotlightRefs.forEach((b, i) => {
      b.material.emissiveIntensity = 1.4 + Math.sin(t * 2.2 + i * Math.PI) * 0.8;
    });
    // Laser scan flicker
    laserDot.material.emissiveIntensity = 2.5 + Math.sin(t * 12) * 0.8;
  };
  return g;
}

// RACING DRONE — aerodynamic FPV racing quad: sleek, aggressive, fast
function buildRacingDrone(primary, accent) {
  const g = new THREE.Group();
  // Aerodynamic body — flattened oval hull
  const hull = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.26, 0.1, 8),
    mat(primary, 0.7, 0.2)
  );
  hull.position.set(0, 0.32, 0);
  g.add(hull);
  // Top fairing (low profile)
  const fairing = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 10, 6, 0, Math.PI * 2, 0, Math.PI * 0.45),
    mat(accent, 0.5, 0.2)
  );
  fairing.position.set(0, 0.34, 0);
  g.add(fairing);
  // FPV Camera (front-facing)
  const camBox = box(0.1, 0.08, 0.06, '#111', 0.8, 0.15);
  camBox.position.set(0, 0.3, 0.22);
  camBox.rotation.x = 0.35; // canted angle (FPV tilt)
  g.add(camBox);
  const fpvLens = sphere(0.04, '#003399', 0.2, 0.05, '#0055ff');
  fpvLens.material.emissiveIntensity = 0.9;
  fpvLens.position.set(0, 0.29, 0.26);
  g.add(fpvLens);
  // 4 thin carbon arms at 45° (X-config racing layout)
  const rotorGroups = [];
  [[1,1],[-1,1],[1,-1],[-1,-1]].forEach(([ax,az], mi) => {
    const arm = box(0.52, 0.028, 0.044, '#111', 0.8, 0.3);
    arm.position.set(ax * 0.26, 0.32, az * 0.26);
    arm.rotation.y = Math.PI / 4;
    g.add(arm);
    // Motor bell (racing motor)
    const motor = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.065, 0.06, 8),
      mat('#222', 0.85, 0.2)
    );
    motor.position.set(ax * 0.45, 0.34, az * 0.45);
    g.add(motor);
    // Racing rotor (2 thin high-pitch blades)
    const rGrp = new THREE.Group();
    rGrp.position.set(ax * 0.45, 0.38, az * 0.45);
    for (let b = 0; b < 2; b++) {
      const blade = box(0.38, 0.009, 0.048, accent, 0.4, 0.5);
      blade.rotation.y = b * Math.PI * 0.5;
      rGrp.add(blade);
    }
    g.add(rGrp);
    rotorGroups.push({ grp: rGrp, dir: mi % 2 === 0 ? 1 : -1 });
    // Racing LED on each arm tip
    const led = sphere(0.022, accent, 0, 0, accent);
    led.material.emissiveIntensity = 2.8;
    led.position.set(ax * 0.49, 0.32, az * 0.49);
    g.add(led);
  });
  // Underbelly battery pack
  const batt = box(0.3, 0.07, 0.18, '#1a1a1a', 0.75, 0.35);
  batt.position.set(0, 0.26, 0);
  g.add(batt);
  // Racing stripe decal
  const stripe = box(0.04, 0.12, 0.36, accent, 0.1, 0.4, accent);
  stripe.material.emissiveIntensity = 0.8;
  stripe.position.set(0, 0.34, 0);
  g.add(stripe);
  // Animate: fast rotors + aggressive banking
  g.userData.animate = (t) => {
    rotorGroups.forEach(({ grp, dir }) => { grp.rotation.y += 0.55 * dir; });
    g.rotation.x = Math.sin(t * 1.2) * 0.09;
    g.rotation.z = Math.sin(t * 0.8 + 0.9) * 0.07;
  };
  return g;
}

// MEDICAL BOT — gentle rounded medical assistant with diagnostic systems
function buildMedbot(primary, accent) {
  const g = new THREE.Group();
  // Rounded base platform
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.5, 0.18, 18),
    mat('#f0f4f8', 0.4, 0.5)
  );
  base.position.set(0, 0.1, 0);
  g.add(base);
  addWheels(g, [
    [-0.38, 0.12,  0.28], [0.38, 0.12,  0.28],
    [-0.38, 0.12, -0.28], [0.38, 0.12, -0.28],
  ], 0.12, 0.1, '#ccc');
  // Body — tall rounded white torso
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.42, 0.72, 18),
    mat('#ffffff', 0.3, 0.55)
  );
  body.position.set(0, 0.55, 0);
  g.add(body);
  // Medical cross emblem (front)
  const crossH = box(0.22, 0.06, 0.04, '#e00000', 0.2, 0.5);
  crossH.position.set(0, 0.58, 0.37);
  g.add(crossH);
  const crossV = box(0.06, 0.22, 0.04, '#e00000', 0.2, 0.5);
  crossV.position.set(0, 0.58, 0.37);
  g.add(crossV);
  // Rounded head dome
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 16, 10),
    mat('#f5f5f5', 0.35, 0.5)
  );
  head.position.set(0, 1.05, 0);
  g.add(head);
  // Friendly face visor
  const visor = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5),
    mat('#a8d8ea', 0.3, 0.05, '#00aaff', 0.2)
  );
  visor.material.emissiveIntensity = 0.2;
  visor.rotation.x = -Math.PI / 2;
  visor.position.set(0, 1.08, 0.12);
  g.add(visor);
  // Status indicator eyes
  const eyeRefs = [];
  [-0.09, 0.09].forEach(x => {
    const eye = sphere(0.05, accent, 0, 0.1, accent);
    eye.material.emissiveIntensity = 1.6;
    eye.position.set(x, 1.1, 0.26);
    g.add(eye);
    eyeRefs.push(eye);
  });
  // Medical arm (left side — IV dispenser)
  const armL = box(0.1, 0.38, 0.1, '#e8e8e8', 0.4, 0.5);
  armL.position.set(-0.48, 0.62, 0);
  g.add(armL);
  const ivBag = box(0.12, 0.18, 0.08, '#cce5ff', 0.2, 0.6, '#44aaff');
  ivBag.material.emissiveIntensity = 0.3;
  ivBag.position.set(-0.48, 0.36, 0);
  g.add(ivBag);
  // Diagnostic scanner arm (right side)
  const armR = box(0.1, 0.38, 0.1, '#e8e8e8', 0.4, 0.5);
  armR.position.set(0.48, 0.62, 0);
  g.add(armR);
  const scanner = box(0.18, 0.08, 0.14, accent, 0.4, 0.3, accent);
  scanner.material.emissiveIntensity = 0.7;
  scanner.position.set(0.48, 0.38, 0);
  g.add(scanner);
  // Health indicator ring (glows around base)
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.46, 0.03, 8, 32),
    mat(accent, 0.2, 0.4, accent, 1.2)
  );
  ring.position.set(0, 0.2, 0);
  g.add(ring);
  // Animation
  g.userData.animate = (t) => {
    eyeRefs.forEach((e, i) => {
      e.material.emissiveIntensity = 1.2 + Math.sin(t * 1.8 + i) * 0.6;
    });
    ring.material.emissiveIntensity = 0.8 + Math.sin(t * 2) * 0.5;
    scanner.material.emissiveIntensity = 0.5 + Math.abs(Math.sin(t * 3)) * 1.2;
  };
  return g;
}

// FIRE BOT — heavy emergency responder with water cannon and ladder
function buildFirebot(primary, accent) {
  const g = new THREE.Group();
  // Heavy fire-engine red chassis
  const chassis = box(1.15, 0.38, 1.72, primary, 0.55, 0.4);
  chassis.position.set(0, 0.38, 0);
  g.add(chassis);
  // Yellow safety stripes
  for (let z = -0.5; z <= 0.5; z += 0.35) {
    const stripe = box(1.16, 0.08, 0.09, '#f5c518', 0.3, 0.5);
    stripe.position.set(0, 0.44, z);
    g.add(stripe);
  }
  // 6 large wheels (fire truck stance)
  addWheels(g, [
    [-0.62, 0.22,  0.58], [0.62, 0.22,  0.58],
    [-0.62, 0.22,  0.00], [0.62, 0.22,  0.00],
    [-0.62, 0.22, -0.58], [0.62, 0.22, -0.58],
  ], 0.22, 0.2, '#111');
  // Cab (front section)
  const cab = box(0.94, 0.42, 0.62, primary, 0.5, 0.38);
  cab.position.set(0, 0.76, 0.56);
  g.add(cab);
  // Windshield
  const wind = box(0.74, 0.28, 0.04, '#99ddff', 0.2, 0.05, '#44aaff');
  wind.material.emissiveIntensity = 0.2;
  wind.position.set(0, 0.82, 0.86);
  g.add(wind);
  // Emergency light bar on cab roof
  const lightBar = box(0.8, 0.1, 0.22, '#333', 0.6, 0.3);
  lightBar.position.set(0, 1.0, 0.56);
  g.add(lightBar);
  const sirenRed  = sphere(0.06, '#ff2200', 0, 0, '#ff2200');
  sirenRed.material.emissiveIntensity = 2.8;
  sirenRed.position.set(-0.22, 1.05, 0.56);
  g.add(sirenRed);
  const sirenAmber = sphere(0.06, '#ff8800', 0, 0, '#ff8800');
  sirenAmber.material.emissiveIntensity = 2.8;
  sirenAmber.position.set(0, 1.05, 0.56);
  g.add(sirenAmber);
  const sirenWhite = sphere(0.06, '#ffffff', 0, 0, '#ffffff');
  sirenWhite.material.emissiveIntensity = 2.0;
  sirenWhite.position.set(0.22, 1.05, 0.56);
  g.add(sirenWhite);
  // Water cannon (turret on roof centre)
  const turretBase = cylinder(0.14, 0.12, '#555', 0.7, 0.3);
  turretBase.position.set(0, 0.78, -0.14);
  g.add(turretBase);
  const cannon = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.07, 0.58, 8),
    mat('#444', 0.8, 0.25)
  );
  cannon.rotation.x = -Math.PI / 2 + 0.38;
  cannon.position.set(0, 0.92, -0.02);
  g.add(cannon);
  const cannonTip = sphere(0.055, '#66aaff', 0.2, 0.3, '#22aaff');
  cannonTip.material.emissiveIntensity = 0.8;
  cannonTip.position.set(0, 1.12, -0.38);
  g.add(cannonTip);
  // Folded ladder (rear)
  const ladderBase = box(0.14, 0.52, 0.1, '#ffcc00', 0.6, 0.3);
  ladderBase.position.set(0, 0.72, -0.68);
  g.add(ladderBase);
  for (let ry = 0.5; ry <= 0.9; ry += 0.12) {
    const rung = box(0.4, 0.025, 0.04, '#ffcc00', 0.6, 0.3);
    rung.position.set(0, ry, -0.68);
    g.add(rung);
  }
  // Hose reel (side)
  const hoseReel = new THREE.Mesh(
    new THREE.TorusGeometry(0.16, 0.06, 8, 16),
    mat('#dd4400', 0.5, 0.5)
  );
  hoseReel.rotation.y = Math.PI / 2;
  hoseReel.position.set(0.6, 0.52, -0.28);
  g.add(hoseReel);
  // Animation — siren flash
  g.userData.animate = (t) => {
    const f = Math.sin(t * 5);
    sirenRed.material.emissiveIntensity   = f > 0.5 ? 3.5 : 0.5;
    sirenAmber.material.emissiveIntensity = Math.abs(f) > 0.3 ? 2.5 : 0.4;
    sirenWhite.material.emissiveIntensity = f < -0.5 ? 3.0 : 0.5;
    cannonTip.material.emissiveIntensity  = 0.5 + Math.sin(t * 2.5) * 0.5;
  };
  return g;
}

// FACTORY BOT — vertical industrial lifter/sorter with articulated claw arm
function buildFactoryBot(primary, accent) {
  const g = new THREE.Group();
  // Compact wheeled chassis base
  const base = box(0.88, 0.22, 1.1, '#2a2a2a', 0.75, 0.35);
  base.position.set(0, 0.14, 0);
  g.add(base);
  addWheels(g, [
    [-0.48, 0.14,  0.38], [0.48, 0.14,  0.38],
    [-0.48, 0.14, -0.38], [0.48, 0.14, -0.38],
  ], 0.14, 0.16, '#1a1a1a');
  // Industrial body column
  const column = box(0.46, 0.96, 0.44, primary, 0.65, 0.28);
  column.position.set(0, 0.74, 0.06);
  g.add(column);
  // Warning stripe panel
  for (let y = 0.34; y <= 0.94; y += 0.2) {
    const stripe = box(0.47, 0.07, 0.06, '#f5c518', 0.3, 0.5);
    stripe.position.set(0, y, 0.28);
    g.add(stripe);
  }
  // Status lights on column
  const statusGreen = sphere(0.04, '#00ff44', 0, 0, '#00ff44');
  statusGreen.material.emissiveIntensity = 2.2;
  statusGreen.position.set(0.18, 1.08, 0.28);
  g.add(statusGreen);
  const statusRed = sphere(0.04, '#ff3300', 0, 0, '#ff3300');
  statusRed.material.emissiveIntensity = 2.2;
  statusRed.position.set(-0.18, 1.08, 0.28);
  g.add(statusRed);
  // Shoulder mount / pivot bracket
  const shoulder = cylinder(0.18, 0.14, '#444', 0.75, 0.3);
  shoulder.position.set(0, 1.28, 0.06);
  g.add(shoulder);
  // Industrial arm — upper segment
  const armUpper = box(0.14, 0.58, 0.14, primary, 0.6, 0.3);
  armUpper.position.set(0.3, 1.1, 0.14);
  armUpper.rotation.z = -0.38;
  g.add(armUpper);
  // Elbow joint
  const elbow = sphere(0.1, accent, 0.65, 0.25);
  elbow.position.set(0.5, 0.82, 0.14);
  g.add(elbow);
  // Forearm reaching forward
  const forearm = box(0.11, 0.46, 0.11, primary, 0.6, 0.3);
  forearm.position.set(0.58, 0.56, 0.26);
  forearm.rotation.z = 0.28;
  g.add(forearm);
  // Industrial gripper claw
  const wrist = sphere(0.08, '#333', 0.7, 0.25);
  wrist.position.set(0.62, 0.3, 0.36);
  g.add(wrist);
  [-0.07, 0.07].forEach(dx => {
    const finger = box(0.06, 0.18, 0.05, '#555', 0.7, 0.3);
    finger.position.set(0.62 + dx, 0.14, 0.36);
    finger.rotation.z = dx < 0 ? 0.3 : -0.3;
    g.add(finger);
  });
  // Glow accent strip on arm
  const armGlow = box(0.04, 0.5, 0.04, accent, 0.1, 0.5, accent);
  armGlow.material.emissiveIntensity = 1.0;
  armGlow.position.set(0.36, 1.0, 0.22);
  armGlow.rotation.z = -0.38;
  g.add(armGlow);
  // Conveyor-style forklift forks (front)
  [-0.18, 0.18].forEach(x => {
    const fork = box(0.05, 0.06, 0.62, accent, 0.6, 0.4);
    fork.position.set(x, 0.4, -0.5);
    g.add(fork);
  });
  // Lift frame
  const frame = box(0.44, 0.62, 0.04, '#333', 0.7, 0.35);
  frame.position.set(0, 0.6, -0.22);
  g.add(frame);
  // Animation — arm sweep + status blink
  g.userData.animate = (t) => {
    elbow.position.x = 0.5 + Math.sin(t * 0.8) * 0.1;
    armGlow.material.emissiveIntensity = 0.7 + Math.sin(t * 3) * 0.5;
    statusGreen.material.emissiveIntensity = 1.5 + Math.sin(t * 2.4) * 0.8;
    statusRed.material.emissiveIntensity   = Math.abs(Math.sin(t * 2.4 + Math.PI)) > 0.5 ? 2.5 : 0.3;
  };
  return g;
}

// ─── Attachment builders ───────────────────────────────────────────────────

function addCamera(group) {
  // Mounted on the roof — small bracket + housing + lens
  const mount = cylinder(0.045, 0.1, '#2a2a30', 0.6, 0.5);
  mount.position.set(0, 0.92, 0.18);
  group.add(mount);
  const body = box(0.16, 0.13, 0.15, '#23232a', 0.55, 0.45);
  body.position.set(0, 1.0, 0.2);
  group.add(body);
  const lens = cylinder(0.05, 0.07, '#1a1aff', 0.5, 0.15);
  lens.rotation.x = Math.PI / 2;
  lens.material.emissive = new THREE.Color('#0044cc');
  lens.material.emissiveIntensity = 0.55;
  lens.position.set(0, 1.0, 0.29);
  group.add(lens);
}

function addSonar(group) {
  const sonar = box(0.26, 0.1, 0.09, '#00d9ff', 0.5, 0.4, '#00d9ff');
  sonar.material.emissiveIntensity = 0.5;
  sonar.position.set(0, 0.74, 0.54);
  group.add(sonar);
}

function addGrabber(group) {
  const arm = cylinder(0.04, 0.5, '#888', 0.7, 0.3);
  arm.rotation.x = Math.PI / 2;
  arm.position.set(0, 0.62, 0.68);
  group.add(arm);
  [-0.1, 0.1].forEach(x => {
    const claw = box(0.05, 0.22, 0.06, '#666', 0.75, 0.3);
    claw.position.set(x, 0.62, 0.95);
    claw.rotation.z = x < 0 ? 0.3 : -0.3;
    group.add(claw);
  });
}

// ─── Main export ───────────────────────────────────────────────────────────

/** Modular builder chassis IDs → studio build keys */
const MODULAR_BUILD_KEYS = {
  'rover-explorer': 'rover', 'rover-racer': 'scout', 'rover-cargo': 'crawler',
  'mech-slim': 'mech', 'mech-warrior': 'mech', 'mech-heavy': 'droid',
  'spider-nano': 'spider', 'spider-scout': 'spider', 'spider-tank': 'battlebot',
  'drone-quad': 'drone', 'drone-hex': 'drone', 'drone-wing': 'jetplane',
  'tank-fast': 'tank', 'tank-heavy': 'tank', 'tank-siege': 'battlebot',
  'hover-pod': 'hoverbot', 'hover-skiff': 'hoverracer', 'hover-orb': 'hoverbot',
  'sub-torpedo': 'submarine', 'sub-squid': 'submarine', 'sub-heavy': 'deepseabot',
  'carrier-launch': 'spacerover', 'carrier-bus': 'spacerover', 'carrier-orbital': 'spacerover',
};

export function normalizeRobotBuildConfig(config = {}) {
  const base = {
    name: 'Rover X1',
    chassisId: 'rover',
    primaryColor: '#FF8C00',
    accentColor: '#FFD700',
    trimColor: '#FFD700',
    wheelColor: '#1a1a1a',
    ledColor: '#00D9FF',
    movementId: 'wheels',
    sensors: ['camera'],
    tools: [],
    materialMetalness: 0.4,
    materialRoughness: 0.5,
    materialGlow: 1.0,
    ...config,
  };
  if (!base.chassisBuildKey && MODULAR_BUILD_KEYS[base.chassisId]) {
    base.chassisBuildKey = MODULAR_BUILD_KEYS[base.chassisId];
  }
  if (!CHASSIS_DATA.find(c => c.id === base.chassisId)) {
    if (!base.chassisBuildKey) base.chassisBuildKey = MODULAR_BUILD_KEYS[base.chassisId] || 'rover';
    base.chassisId = 'rover';
  }
  return base;
}

/** Clone geometry per mesh and bake scale — fixes shared-geometry rendering bugs in WebGL */
export function bakeMeshScalesIntoGeometry(root) {
  root.traverse(obj => {
    if (!obj.isMesh || !obj.geometry) return;
    const { x, y, z } = obj.scale;
    obj.geometry = obj.geometry.clone();
    if (Math.abs(x - 1) > 1e-4 || Math.abs(y - 1) > 1e-4 || Math.abs(z - 1) > 1e-4) {
      obj.geometry.scale(x, y, z);
      obj.scale.set(1, 1, 1);
    }
    obj.frustumCulled = false;
    obj.castShadow = true;
    obj.receiveShadow = true;
  });
}

function buildFallbackSimRobot(cfg) {
  const primary = cfg.primaryColor || '#FF8C00';
  const accent = cfg.accentColor || '#FFD700';
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: primary, metalness: 0.45, roughness: 0.48 });
  const accentMat = new THREE.MeshStandardMaterial({ color: accent, metalness: 0.5, roughness: 0.4 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.42, 1.55), bodyMat);
  body.position.set(0, 0.42, 0);
  g.add(body);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.38, 0.74), bodyMat);
  cab.position.set(0, 0.77, -0.15);
  g.add(cab);
  const hood = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.08, 0.52), accentMat);
  hood.position.set(0, 0.64, 0.52);
  g.add(hood);
  [[-0.7, 0.28, 0.55], [0.7, 0.28, 0.55], [-0.7, 0.28, -0.55], [0.7, 0.28, -0.55]].forEach(([x, y, z]) => {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.2, 16), new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.92 }));
    w.rotation.z = Math.PI / 2;
    w.position.set(x, y, z);
    g.add(w);
  });
  g.userData.chassisId = cfg.chassisBuildKey || cfg.chassisId || 'rover';
  g.userData.envTex = buildEnvTex();
  bakeMeshScalesIntoGeometry(g);
  return g;
}

/** Build + prepare robot for Live Lab / simulator (handles shared-geometry WebGL bugs) */
export function buildSimRobot(config = {}) {
  const cfg = normalizeRobotBuildConfig(config);
  try {
    const group = buildRobotModel(cfg);
    bakeMeshScalesIntoGeometry(group);
    let meshCount = 0;
    group.traverse(o => { if (o.isMesh) meshCount++; });
    if (meshCount < 2) throw new Error('robot mesh count too low');
    prepareLabRobot(group);
    return group;
  } catch (e) {
    console.warn('[buildSimRobot] using fallback rover mesh', e);
    return buildFallbackSimRobot(cfg);
  }
}

export function buildRobotModel(config = {}) {
  const chassis = CHASSIS_DATA.find(c => c.id === config.chassisId) || CHASSIS_DATA[0];
  const buildId = config.chassisBuildKey || chassis.id;

  const primary    = config.primaryColor  || chassis.primaryColor;
  const accent     = config.accentColor   || chassis.accentColor;
  const trimColor  = config.trimColor     || accent;
  const wheelColor = config.wheelColor    || '#1a1a1a';
  const ledColor   = config.ledColor      || '#00D9FF';
  const metalnessOverride = config.materialMetalness !== undefined ? config.materialMetalness : null;
  const roughnessOverride = config.materialRoughness !== undefined ? config.materialRoughness : null;
  const glowOverride      = config.materialGlow      !== undefined ? config.materialGlow      : null;

  // Override the shared wheel helper to use user-chosen wheelColor
  const _origWheel = wheel;
  const wheelFn = (radius, thick, _ignored, rimColor = '#cccccc') =>
    _origWheel(radius, thick, wheelColor, rimColor);

  let group;
  switch (buildId) {
    // Ground robots
    case 'rover':       group = buildRover(primary, accent);        break;
    case 'scout':       group = buildScout(primary, accent);        break;
    case 'crawler':     group = buildCrawler(primary, accent);      break;
    case 'tank':        group = buildTank(primary, accent);         break;
    case 'stealth':     group = buildStealth(primary, accent);      break;
    case 'miningbot':   group = buildTank(primary, accent);         break;
    case 'securitybot': group = buildSecurityBot(primary, accent);  break;
    case 'farmbot':     group = buildFarmBot(primary, accent);      break;
    case 'medbot':      group = buildMedbot(primary, accent);       break;
    case 'firebot':     group = buildFirebot(primary, accent);      break;
    // Walking robots
    case 'spider':      group = buildSpider(primary, accent);       break;
    case 'droid':       group = buildDroid(primary, accent);        break;
    case 'mech':        group = buildMech(primary, accent);         break;
    case 'legobot':     group = buildLegoBot(primary, accent);      break;
    // Flying robots
    case 'drone':       group = buildDroneQuad(primary, accent);    break;
    case 'racedrone':   group = buildRacingDrone(primary, accent);  break;
    case 'rescuedrone': group = buildDroneQuad(primary, accent);    break;
    case 'helicopter':  group = buildHelicopter(primary, accent);   break;
    // Hover robots
    case 'hoverbot':    group = buildHoverSaucer(primary, accent);  break;
    case 'hoverracer':  group = buildHoverRacer(primary, accent);   break;
    // Underwater robots
    case 'submarine':   group = buildSubmarine(primary, accent);    break;
    case 'deepseabot':  group = buildDeepSeaBot(primary, accent);   break;
    // Factory robots
    case 'robotarm':    group = buildRobotArm(primary, accent);     break;
    case 'factorybot':  group = buildFactoryBot(primary, accent);   break;
    case 'battlebot':   group = buildTank(primary, accent);         break;
    // Space robots
    case 'spacerover':  group = buildSpaceRover(primary, accent);   break;
    // Jet planes
    case 'jetplane':    group = buildJetPlane(primary, accent);     break;
    case 'steathjet':   group = buildJetPlane(primary, accent);     break;
    case 'aerobat':     group = buildJetPlane(primary, accent);     break;
    default:            group = buildRover(primary, accent);
  }

  // Sensors — legacy ids + registry heuristics
  const sensorIds = config.sensors || [];
  if (sensorIds.some((id) => /camera|vision|optic|face/i.test(id))) addCamera(group);
  if (sensorIds.some((id) => /ultra|sonar|lidar|radar|proximity/i.test(id))) addSonar(group);

  // Tools — legacy + registry
  const toolIds = config.tools || [];
  if (toolIds.some((id) => /grab|claw|grip|pincer|hand|fork/i.test(id))) addGrabber(group);

  // Apply material overrides from config (metalness, roughness, glow, ledColor)
  const ledColorObj = new THREE.Color(ledColor);
  group.traverse(obj => {
    if (!obj.isMesh || !obj.material) return;
    const m = obj.material;
    if (!m.emissive) return;

    // Apply metalness/roughness overrides to non-emissive structural parts
    if (metalnessOverride !== null && m.emissiveIntensity < 0.5) {
      obj.material = m.clone();
      obj.material.metalness = Math.max(0, Math.min(1, metalnessOverride));
    }
    if (roughnessOverride !== null && m.emissiveIntensity < 0.5) {
      if (obj.material === m) obj.material = m.clone();
      obj.material.roughness = Math.max(0, Math.min(1, roughnessOverride));
    }

    // Apply ledColor + glow intensity to emissive parts
    const em = obj.material.emissive;
    if (em.r > 0.01 || em.g > 0.01 || em.b > 0.01) {
      const isRed = em.r > 0.5 && em.g < 0.2 && em.b < 0.2;  // keep tail/warning lights
      if (!isRed) {
        if (obj.material === m) obj.material = m.clone();
        obj.material.emissive = ledColorObj;
        if (glowOverride !== null) {
          obj.material.emissiveIntensity = obj.material.emissiveIntensity * glowOverride;
        }
      }
    }
  });

  // Tag group with chassis id (for particle system and other callers)
  group.userData.chassisId = buildId;
  // Tag group with env texture reference so callers can apply to scene
  group.userData.envTex = buildEnvTex();

  return group;
}
