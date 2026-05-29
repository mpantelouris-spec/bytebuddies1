/**
 * CustomPartsPage.jsx
 * Kids can design their own custom robot parts with real-time 3D previews.
 * Views: 'library' → 'select-type' → 'building'
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';

// ─── localStorage key ──────────────────────────────────────────────────────
const LS_KEY = 'bb-studio-custom-parts';

function loadParts() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; } catch { return []; }
}
function saveParts(parts) {
  localStorage.setItem(LS_KEY, JSON.stringify(parts));
}
function uid() { return `cp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`; }

// ─── Part type metadata ────────────────────────────────────────────────────
const PART_TYPES = [
  // Body / Chassis
  { id: 'chassis',     icon: '📦', label: 'Chassis',          color: '#7c3aed', desc: 'Main robot body & frame' },
  { id: 'rover-body',  icon: '🚙', label: 'Rover Body',       color: '#8b5cf6', desc: 'Wheeled ground vehicle body' },
  { id: 'spider-body', icon: '🕷️', label: 'Spider Body',      color: '#6d28d9', desc: 'Multi-legged walker body' },
  { id: 'humanoid',    icon: '🤖', label: 'Humanoid Body',    color: '#7c3aed', desc: 'Bipedal robot torso' },
  { id: 'drone-body',  icon: '🚁', label: 'Drone Frame',      color: '#5b21b6', desc: 'Aerial quadcopter frame' },
  { id: 'plane-body',  icon: '✈️', label: 'Plane Body',       color: '#4c1d95', desc: 'Fixed-wing aircraft body' },
  { id: 'hover-body',  icon: '🛸', label: 'Hover Body',       color: '#7c3aed', desc: 'Anti-gravity platform' },
  { id: 'aqua-body',   icon: '🌊', label: 'Aqua Body',        color: '#0891b2', desc: 'Underwater hull' },
  // Movement
  { id: 'wheel',       icon: '🛞', label: 'Wheel',            color: '#0891b2', desc: 'How your robot rolls' },
  { id: 'track',       icon: '⛓️', label: 'Track',            color: '#075985', desc: 'Tank-tread crawler track' },
  { id: 'leg',         icon: '🦵', label: 'Robot Leg',        color: '#0369a1', desc: 'Walking leg joint system' },
  { id: 'propeller',   icon: '🌀', label: 'Propeller',        color: '#0284c7', desc: 'Spinning thrust propeller' },
  { id: 'fin',         icon: '🐟', label: 'Aqua Fin',         color: '#0e7490', desc: 'Underwater fin or jet' },
  { id: 'hover-pad',   icon: '🔵', label: 'Hover Pad',        color: '#06b6d4', desc: 'Anti-gravity levitation pad' },
  // Arms & Tools
  { id: 'arm',         icon: '🦾', label: 'Arm',              color: '#dc2626', desc: 'Reach & manipulate things' },
  { id: 'claw',        icon: '🦀', label: 'Claw',             color: '#b91c1c', desc: 'Grip and grab objects' },
  { id: 'drill-tool',  icon: '⛏️', label: 'Drill Tool',       color: '#92400e', desc: 'Mining & drilling tool' },
  { id: 'laser-tool',  icon: '⚡', label: 'Laser Tool',       color: '#7c3aed', desc: 'Precision laser cutter' },
  { id: 'weld-tool',   icon: '🔥', label: 'Welder',           color: '#ea580c', desc: 'Welding & repair tool' },
  { id: 'rescue-tool', icon: '🚨', label: 'Rescue Tool',      color: '#ef4444', desc: 'Emergency rescue attachment' },
  // Sensors
  { id: 'sensor',      icon: '📡', label: 'Sensor',           color: '#059669', desc: 'Detect the environment' },
  { id: 'camera-part', icon: '📷', label: 'Camera',           color: '#0891b2', desc: 'Vision & recording module' },
  { id: 'scanner',     icon: '🔍', label: 'Scanner',          color: '#047857', desc: 'LIDAR or radar scanner' },
  { id: 'detector',    icon: '🧲', label: 'Detector',         color: '#065f46', desc: 'Magnetic or bio detector' },
  // Power
  { id: 'battery',     icon: '🔋', label: 'Battery',          color: '#16a34a', desc: 'Power storage module' },
  { id: 'solar-panel', icon: '☀️', label: 'Solar Panel',      color: '#ca8a04', desc: 'Solar energy collector' },
  { id: 'reactor',     icon: '⚛️', label: 'Reactor',          color: '#0e7490', desc: 'Advanced power core' },
  // AI & Communication
  { id: 'ai-chip',     icon: '🧠', label: 'AI Module',        color: '#6d28d9', desc: 'Intelligent processing unit' },
  { id: 'antenna',     icon: '📶', label: 'Antenna',          color: '#0284c7', desc: 'Communication system' },
  // Head & Lighting
  { id: 'head',        icon: '🤖', label: 'Robot Head',       color: '#7c3aed', desc: 'Head unit & optics' },
  { id: 'light-part',  icon: '💡', label: 'Light',            color: '#d97706', desc: 'Lighting system' },
  // Structural & Decoration
  { id: 'armor',       icon: '🛡️', label: 'Armor',            color: '#374151', desc: 'Protective plating' },
  { id: 'joint',       icon: '🔄', label: 'Joint / Hinge',   color: '#6366f1', desc: 'Rotating mechanical joint' },
  { id: 'decoration',  icon: '✨', label: 'Decoration',       color: '#d97706', desc: 'Make your robot look awesome' },
  // LEGO Mode
  { id: 'lego-block',  icon: '🧱', label: 'LEGO Block',       color: '#ef4444', desc: 'Snap-together brick part' },
];

const TYPE_COLORS = Object.fromEntries(PART_TYPES.map(p => [p.id, p.color]));

// ─── Default configs per part type ────────────────────────────────────────
// Shared chassis default for all body types
const CHASSIS_DEFAULT = { shape: 'box', width: 1.4, height: 0.6, depth: 1.8, material: 'plastic', color: '#FF8C00', weight: 3, wheelSockets: 4, sensorSockets: 2, armSockets: 1, hasHead: true };
const WHEEL_DEFAULT   = { style: 'standard', radius: 0.35, thickness: 0.22, tireColor: '#222222', rimColor: '#888888', grip: 80, weight: 0.5 };
const SENSOR_DEFAULT  = { type: 'camera', range: 6, accuracy: 90, powerDrain: 2, size: 0.3, color: '#00d9ff' };
const ARM_DEFAULT     = { type: 'grabber', length: 1.2, strength: 70, color: '#888888', side: 'right' };
const DECO_DEFAULT    = { type: 'led-strip', color: '#00ffff', glowIntensity: 1.2, position: 'top', size: 0.6 };

const DEFAULTS = {
  chassis:     { name: 'My Chassis',       ...CHASSIS_DEFAULT },
  'rover-body':{ name: 'My Rover Body',    ...CHASSIS_DEFAULT, color: '#FF8C00' },
  'spider-body':{ name: 'My Spider Body',  ...CHASSIS_DEFAULT, shape: 'sphere', color: '#10b981', wheelSockets: 0 },
  humanoid:    { name: 'My Humanoid',      ...CHASSIS_DEFAULT, color: '#9B59B6', height: 1.2 },
  'drone-body':{ name: 'My Drone Frame',   ...CHASSIS_DEFAULT, shape: 'cylinder', color: '#06b6d4', wheelSockets: 0, weight: 0.8 },
  'plane-body':{ name: 'My Plane Body',    ...CHASSIS_DEFAULT, color: '#1e40af', depth: 2.4, weight: 1.4 },
  'hover-body':{ name: 'My Hover Body',    ...CHASSIS_DEFAULT, shape: 'cylinder', color: '#8b5cf6', wheelSockets: 0, weight: 1.0 },
  'aqua-body': { name: 'My Aqua Body',     ...CHASSIS_DEFAULT, color: '#0284c7', depth: 2.2, weight: 3.0 },
  wheel:       { name: 'My Wheel',         ...WHEEL_DEFAULT },
  track:       { name: 'My Track',         ...WHEEL_DEFAULT, style: 'track', radius: 0.4, tireColor: '#333333' },
  leg:         { name: 'My Robot Leg',     type: 'spider', length: 1.0, joints: 2, color: '#10b981', weight: 0.6 },
  propeller:   { name: 'My Propeller',     type: 'quad', radius: 0.5, blades: 4, color: '#374151', weight: 0.2 },
  fin:         { name: 'My Aqua Fin',      type: 'tail', length: 0.8, color: '#0284c7', weight: 0.3 },
  'hover-pad': { name: 'My Hover Pad',     type: 'antigrav', size: 0.6, color: '#8b5cf6', weight: 0.4 },
  arm:         { name: 'My Arm',           ...ARM_DEFAULT },
  claw:        { name: 'My Claw',          ...ARM_DEFAULT, type: 'claw', color: '#FF6B6B' },
  'drill-tool':{ name: 'My Drill',         type: 'drill', length: 0.8, color: '#888888', weight: 1.2 },
  'laser-tool':{ name: 'My Laser',         type: 'laser', range: 5, color: '#FF00FF', powerDrain: 3 },
  'weld-tool': { name: 'My Welder',        type: 'welder', reach: 0.6, color: '#FF4500', weight: 0.8 },
  'rescue-tool':{ name: 'My Rescue Tool', type: 'cutter', force: 80, color: '#ef4444', weight: 1.0 },
  sensor:      { name: 'My Sensor',        ...SENSOR_DEFAULT },
  'camera-part':{ name: 'My Camera',       ...SENSOR_DEFAULT, type: 'camera', color: '#1E90FF' },
  scanner:     { name: 'My Scanner',       ...SENSOR_DEFAULT, type: 'lidar', range: 15, color: '#FF3333' },
  detector:    { name: 'My Detector',      ...SENSOR_DEFAULT, type: 'magnetic', range: 3, color: '#6366f1' },
  battery:     { name: 'My Battery',       type: 'lithium', capacity: 5000, voltage: 12, color: '#00C851', weight: 1.5 },
  'solar-panel':{ name: 'My Solar Panel',  type: 'solar', area: 0.5, efficiency: 80, color: '#FFD700', weight: 0.4 },
  reactor:     { name: 'My Reactor',       type: 'fusion', output: 100, color: '#00D9FF', weight: 3.0 },
  'ai-chip':   { name: 'My AI Module',     type: 'neural', cores: 8, memory: 16, color: '#7c3aed', weight: 0.1 },
  antenna:     { name: 'My Antenna',       type: 'wifi', range: 100, frequency: 2.4, color: '#00D9FF', weight: 0.2 },
  head:        { name: 'My Robot Head',    ...CHASSIS_DEFAULT, shape: 'sphere', width: 0.6, height: 0.6, depth: 0.6, color: '#9B59B6', weight: 0.5 },
  'light-part':{ name: 'My Light',         ...DECO_DEFAULT, type: 'led', color: '#00ffff' },
  armor:       { name: 'My Armor',         ...CHASSIS_DEFAULT, shape: 'box', color: '#374151', height: 0.2, weight: 2.0 },
  joint:       { name: 'My Joint',         type: 'rotating', range: 180, torque: 50, color: '#818CF8', weight: 0.3 },
  decoration:  { name: 'My Decoration',    ...DECO_DEFAULT },
  'lego-block':{ name: 'My LEGO Block',    shape: 'box', studs: 4, color: '#E74C3C', width: 0.32, height: 0.19, depth: 0.32, weight: 0.1 },
};

// ─── 3D Preview builders ───────────────────────────────────────────────────
function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({ color: new THREE.Color(color), metalness: 0.25, roughness: 0.55, ...opts });
}
function mesh(geo, material) {
  const m = new THREE.Mesh(geo, material);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

function buildChassisPreview(group, cfg) {
  const c = new THREE.Color(cfg.color);
  const bodyMat = mat(c.getHexString(), { metalness: cfg.material === 'metal' ? 0.7 : 0.15, roughness: cfg.material === 'carbon' ? 0.2 : 0.55 });
  let body;
  if (cfg.shape === 'sphere') {
    body = mesh(new THREE.SphereGeometry(cfg.width * 0.5, 20, 16), bodyMat);
    body.scale.set(1, cfg.height / cfg.width, cfg.depth / cfg.width);
  } else if (cfg.shape === 'cylinder') {
    body = mesh(new THREE.CylinderGeometry(cfg.width * 0.45, cfg.width * 0.45, cfg.height, 20), bodyMat);
    body.scale.z = cfg.depth / cfg.width;
  } else if (cfg.shape === 'cone') {
    body = mesh(new THREE.ConeGeometry(cfg.width * 0.45, cfg.height * 1.6, 16), bodyMat);
  } else {
    body = mesh(new THREE.BoxGeometry(cfg.width, cfg.height, cfg.depth), bodyMat);
  }
  body.position.y = cfg.height * 0.5;
  group.add(body);

  // Wheel socket indicators
  const socketMat = mat('#333', { emissive: new THREE.Color('#ff8c00'), emissiveIntensity: 0.5 });
  const sockPositions = cfg.wheelSockets === 6
    ? [[-0.6,0,-0.7],[0.6,0,-0.7],[-0.6,0,0],[0.6,0,0],[-0.6,0,0.7],[0.6,0,0.7]]
    : [[-0.6,0,-0.5],[0.6,0,-0.5],[-0.6,0,0.5],[0.6,0,0.5]];
  sockPositions.forEach(([x,y,z]) => {
    const s = mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.08, 8), socketMat);
    s.position.set(x * (cfg.width / 1.4), y, z * (cfg.depth / 1.8));
    s.rotation.z = Math.PI / 2;
    group.add(s);
  });
}

function buildWheelPreview(group, cfg) {
  const tireMat = mat(cfg.tireColor, { roughness: cfg.style === 'off-road' ? 0.95 : 0.7 });
  const rimMat  = mat(cfg.rimColor,  { metalness: 0.75, roughness: 0.25 });
  // Tire
  const tire = mesh(new THREE.TorusGeometry(cfg.radius, cfg.thickness * 0.48, 16, 40), tireMat);
  tire.rotation.y = Math.PI / 2;
  group.add(tire);
  // Rim
  const rim = mesh(new THREE.CylinderGeometry(cfg.radius * 0.6, cfg.radius * 0.6, cfg.thickness * 0.35, 20), rimMat);
  rim.rotation.z = Math.PI / 2;
  group.add(rim);
  // Spokes
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const spoke = mesh(new THREE.BoxGeometry(cfg.radius * 0.8, cfg.thickness * 0.08, cfg.thickness * 0.08), rimMat);
    spoke.position.set(Math.cos(angle) * cfg.radius * 0.3, Math.sin(angle) * cfg.radius * 0.3, 0);
    spoke.rotation.z = angle;
    group.add(spoke);
  }
  if (cfg.style === 'spike') {
    const spikeMat = mat('#cc2200', { metalness: 0.6 });
    for (let i = 0; i < 8; i++) {
      const ang = (i / 8) * Math.PI * 2;
      const spike = mesh(new THREE.ConeGeometry(0.04, 0.18, 6), spikeMat);
      spike.position.set(
        Math.cos(ang) * (cfg.radius + 0.09),
        Math.sin(ang) * (cfg.radius + 0.09),
        0,
      );
      spike.rotation.z = ang + Math.PI / 2;
      group.add(spike);
    }
  }
  if (cfg.style === 'omni') {
    const bMat = mat('#555');
    for (let i = 0; i < 10; i++) {
      const ang = (i / 10) * Math.PI * 2;
      const b = mesh(new THREE.CylinderGeometry(0.055, 0.055, cfg.thickness * 0.95, 8), bMat);
      b.position.set(Math.cos(ang) * cfg.radius, Math.sin(ang) * cfg.radius, 0);
      b.rotation.z = ang + Math.PI / 2;
      group.add(b);
    }
  }
}

function buildSensorPreview(group, cfg) {
  const sensorMat = mat(cfg.color, { metalness: 0.3, roughness: 0.4 });
  const darkMat   = mat('#1a1a2e');
  const glassMat  = new THREE.MeshStandardMaterial({ color: new THREE.Color(cfg.color), transparent: true, opacity: 0.45, metalness: 0.1 });

  if (cfg.type === 'camera') {
    const body = mesh(new THREE.BoxGeometry(cfg.size * 1.2, cfg.size * 0.9, cfg.size * 0.7), sensorMat);
    group.add(body);
    const lens = mesh(new THREE.CylinderGeometry(cfg.size * 0.28, cfg.size * 0.32, cfg.size * 0.35, 20), darkMat);
    lens.rotation.x = Math.PI / 2;
    lens.position.z = cfg.size * 0.5;
    group.add(lens);
    const glass = mesh(new THREE.CylinderGeometry(cfg.size * 0.2, cfg.size * 0.2, 0.02, 20), glassMat);
    glass.rotation.x = Math.PI / 2;
    glass.position.z = cfg.size * 0.67;
    group.add(glass);
  } else if (cfg.type === 'sonar' || cfg.type === 'lidar') {
    const body = mesh(new THREE.CylinderGeometry(cfg.size * 0.5, cfg.size * 0.5, cfg.size * 0.7, 20), sensorMat);
    group.add(body);
    const dish = mesh(new THREE.SphereGeometry(cfg.size * 0.52, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), glassMat);
    dish.position.y = cfg.size * 0.35;
    group.add(dish);
  } else if (cfg.type === 'ir') {
    const body = mesh(new THREE.BoxGeometry(cfg.size * 0.6, cfg.size * 0.6, cfg.size * 0.4), sensorMat);
    group.add(body);
    for (let i = -1; i <= 1; i++) {
      const eye = mesh(new THREE.SphereGeometry(cfg.size * 0.12, 10, 8), darkMat);
      eye.position.set(i * cfg.size * 0.18, 0, cfg.size * 0.22);
      group.add(eye);
    }
  } else {
    // gyro / gps
    const body = mesh(new THREE.BoxGeometry(cfg.size, cfg.size, cfg.size * 0.5), sensorMat);
    group.add(body);
    const board = mesh(new THREE.BoxGeometry(cfg.size * 0.8, cfg.size * 0.8, 0.04), mat('#1a6632'));
    board.position.y = cfg.size * 0.28;
    group.add(board);
  }

  // Range cone (translucent)
  const coneH = Math.min(cfg.range * 0.35, 2.5);
  const coneGeo = new THREE.ConeGeometry(coneH * 0.45, coneH, 16, 1, true);
  const coneMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(cfg.color), transparent: true, opacity: 0.08, side: THREE.DoubleSide });
  const cone = new THREE.Mesh(coneGeo, coneMat);
  cone.rotation.x = -Math.PI / 2;
  cone.position.z = coneH * 0.5 + cfg.size * 0.4;
  group.add(cone);
}

function buildArmPreview(group, cfg) {
  const armMat  = mat(cfg.color, { metalness: 0.55, roughness: 0.35 });
  const darkMat = mat('#222');
  const redMat  = mat('#cc2200', { metalness: 0.6 });

  // Base joint
  const base = mesh(new THREE.SphereGeometry(0.14, 12, 10), armMat);
  group.add(base);

  // Arm segments
  const seg1 = mesh(new THREE.CylinderGeometry(0.06, 0.08, cfg.length * 0.55, 10), armMat);
  seg1.position.y = cfg.length * 0.28;
  seg1.rotation.z = 0.28;
  group.add(seg1);

  const joint = mesh(new THREE.SphereGeometry(0.1, 10, 8), darkMat);
  joint.position.set(cfg.length * 0.16, cfg.length * 0.56, 0);
  group.add(joint);

  const seg2 = mesh(new THREE.CylinderGeometry(0.05, 0.06, cfg.length * 0.45, 10), armMat);
  seg2.position.set(cfg.length * 0.32, cfg.length * 0.78, 0);
  seg2.rotation.z = -0.35;
  group.add(seg2);

  // End effector
  if (cfg.type === 'grabber') {
    for (let s of [-1, 1]) {
      const claw = mesh(new THREE.BoxGeometry(0.06, 0.18, 0.06), darkMat);
      claw.position.set(cfg.length * 0.47 + s * 0.07, cfg.length * 1.0, 0);
      group.add(claw);
    }
  } else if (cfg.type === 'drill') {
    const drill = mesh(new THREE.ConeGeometry(0.07, 0.28, 12), mat('#888', { metalness: 0.85 }));
    drill.position.set(cfg.length * 0.5, cfg.length * 1.05, 0);
    group.add(drill);
  } else if (cfg.type === 'laser') {
    const emitter = mesh(new THREE.CylinderGeometry(0.06, 0.05, 0.18, 12), redMat);
    emitter.position.set(cfg.length * 0.49, cfg.length * 1.02, 0);
    emitter.rotation.z = Math.PI / 2;
    group.add(emitter);
  } else if (cfg.type === 'torch' || cfg.type === 'saw') {
    const tool = mesh(new THREE.BoxGeometry(0.16, 0.16, 0.08), mat('#555', { metalness: 0.7 }));
    tool.position.set(cfg.length * 0.49, cfg.length * 1.02, 0);
    group.add(tool);
  }
}

function buildDecorationPreview(group, cfg) {
  const col = cfg.color;
  const glowMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(col),
    emissive: new THREE.Color(col),
    emissiveIntensity: cfg.glowIntensity,
    transparent: true,
    opacity: 0.9,
  });

  if (cfg.type === 'led-strip') {
    for (let i = 0; i < 8; i++) {
      const led = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, cfg.size * 0.18), glowMat);
      led.position.set((i - 3.5) * cfg.size * 0.14, 0, 0);
      group.add(led);
    }
  } else if (cfg.type === 'spotlight') {
    const spot = new THREE.Mesh(new THREE.ConeGeometry(cfg.size * 0.38, cfg.size * 0.7, 12, 1, true), glowMat);
    spot.rotation.x = Math.PI;
    group.add(spot);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(cfg.size * 0.2, cfg.size * 0.2, cfg.size * 0.15, 12), mat('#333'));
    base.position.y = cfg.size * 0.07;
    group.add(base);
  } else if (cfg.type === 'antenna') {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.055, cfg.size * 1.1, 8), mat('#555', { metalness: 0.7 }));
    pole.position.y = cfg.size * 0.55;
    group.add(pole);
    const orb = new THREE.Mesh(new THREE.SphereGeometry(cfg.size * 0.2, 12, 10), glowMat);
    orb.position.y = cfg.size * 1.1;
    group.add(orb);
  } else if (cfg.type === 'neon-ring') {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(cfg.size * 0.7, 0.06, 8, 48), glowMat);
    group.add(ring);
  } else if (cfg.type === 'badge') {
    const badge = new THREE.Mesh(new THREE.BoxGeometry(cfg.size * 0.9, cfg.size * 0.65, 0.06), mat('#fff', { metalness: 0.5 }));
    group.add(badge);
    const star = new THREE.Mesh(new THREE.SphereGeometry(cfg.size * 0.18, 8, 6), glowMat);
    group.add(star);
  }
}

// ─── 3D Preview Canvas ─────────────────────────────────────────────────────
function PartPreviewCanvas({ partType, config }) {
  const wrapRef  = useRef(null);
  const sceneRef = useRef(null);
  const camRef   = useRef(null);
  const rendRef  = useRef(null);
  const groupRef = useRef(null);
  const rafRef   = useRef(null);
  const roRef    = useRef(null);
  // Holographic extras
  const platRingRef  = useRef(null);
  const innerRingRef = useRef(null);
  const holoRingRef  = useRef(null);
  // Orbit state
  const orbitRef = useRef({ theta: 0.4, phi: 0.52, radius: 3.6, isDragging: false, lastX: 0, lastY: 0, autoSpin: true });

  // Init once
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const W = Math.max(el.clientWidth, 1);
    const H = Math.max(el.clientHeight, 1);

    // ── Scene ──────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeef1f8);
    scene.fog = new THREE.FogExp2(0xeef1f8, 0.045);
    sceneRef.current = scene;

    // ── Camera (spherical orbit) ───────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(46, W / H, 0.1, 80);
    const updateCamera = () => {
      const o = orbitRef.current;
      camera.position.set(
        o.radius * Math.sin(o.phi) * Math.sin(o.theta),
        o.radius * Math.cos(o.phi) + 0.2,
        o.radius * Math.sin(o.phi) * Math.cos(o.theta)
      );
      camera.lookAt(0, 0.2, 0);
    };
    updateCamera();
    camRef.current = camera;

    // ── Renderer ──────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.95;
    el.appendChild(renderer.domElement);
    rendRef.current = renderer;

    // ── Lighting: bright studio 3-point ──────────────────────────────────
    scene.add(new THREE.AmbientLight(0xc8d4f0, 1.4));
    const key = new THREE.DirectionalLight(0xfff8f0, 1.8);
    key.position.set(5, 10, 7);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.bias = -0.0003;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xd0e4ff, 0.7);
    fill.position.set(-5, 4, -3);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xf0e8ff, 0.5);
    rim.position.set(0, -1, -5);
    scene.add(rim);

    // ── Floor + subtle grid ───────────────────────────────────────────────
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 16),
      new THREE.MeshStandardMaterial({ color: 0xe8ecf5, metalness: 0.0, roughness: 0.9 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.14;
    floor.receiveShadow = true;
    scene.add(floor);

    const gridMat    = new THREE.LineBasicMaterial({ color: 0xc4cce0, transparent: true, opacity: 0.55 });
    const gridAccMat = new THREE.LineBasicMaterial({ color: 0xa0aace, transparent: true, opacity: 0.75 });
    const GS = 6; const GStep = 0.8;
    for (let i = -GS; i <= GS; i++) {
      const m = i % 3 === 0 ? gridAccMat : gridMat;
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-GS * GStep, -0.13, i * GStep), new THREE.Vector3(GS * GStep, -0.13, i * GStep)]), m));
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(i * GStep, -0.13, -GS * GStep), new THREE.Vector3(i * GStep, -0.13, GS * GStep)]), m));
    }

    // ── Platform & rings ─────────────────────────────────────────────────
    const platMat = new THREE.MeshStandardMaterial({ color: 0xdde3f4, metalness: 0.25, roughness: 0.35 });
    const plat = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 0.06, 64), platMat);
    plat.position.y = -0.08;
    plat.receiveShadow = true;
    scene.add(plat);

    // Outer purple ring (animated pulse)
    const platRingMat = new THREE.MeshStandardMaterial({
      color: 0x7c3aed, emissive: new THREE.Color(0x7c3aed), emissiveIntensity: 0.9,
    });
    const platRing = new THREE.Mesh(new THREE.TorusGeometry(1.26, 0.038, 8, 72), platRingMat);
    platRing.position.y = -0.05;
    platRing.rotation.x = Math.PI / 2;
    scene.add(platRing);
    platRingRef.current = platRing;

    // Inner accent ring
    const innerRingMat = new THREE.MeshStandardMaterial({
      color: 0x4f46e5, emissive: new THREE.Color(0x4f46e5), emissiveIntensity: 0.55,
    });
    const innerRing = new THREE.Mesh(new THREE.TorusGeometry(0.88, 0.022, 8, 56), innerRingMat);
    innerRing.position.y = -0.05;
    innerRing.rotation.x = Math.PI / 2;
    scene.add(innerRing);
    innerRingRef.current = innerRing;

    // Floating soft ring
    const holoMat = new THREE.MeshStandardMaterial({
      color: 0x7c3aed, emissive: new THREE.Color(0x7c3aed), emissiveIntensity: 0.3,
      transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false,
    });
    const holoRing = new THREE.Mesh(new THREE.TorusGeometry(1.8, 0.04, 6, 40), holoMat);
    holoRing.rotation.x = Math.PI * 0.3;
    holoRing.position.y = 0.7;
    scene.add(holoRing);
    holoRingRef.current = holoRing;

    // Crosshair guide
    const crossMat = new THREE.LineBasicMaterial({ color: 0x8888cc, transparent: true, opacity: 0.3 });
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-1.2, -0.12, 0), new THREE.Vector3(1.2, -0.12, 0)]), crossMat));
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, -0.12, -1.2), new THREE.Vector3(0, -0.12, 1.2)]), crossMat));

    // ── Orbit / mouse controls ─────────────────────────────────────────────
    const onMouseDown = (e) => {
      const o = orbitRef.current;
      o.isDragging = true; o.autoSpin = false;
      o.lastX = e.clientX; o.lastY = e.clientY;
      el.style.cursor = 'grabbing';
    };
    const onMouseMove = (e) => {
      const o = orbitRef.current;
      if (!o.isDragging) return;
      const dx = e.clientX - o.lastX;
      const dy = e.clientY - o.lastY;
      o.theta -= dx * 0.012;
      o.phi = Math.max(0.1, Math.min(Math.PI * 0.46, o.phi + dy * 0.009));
      o.lastX = e.clientX; o.lastY = e.clientY;
      updateCamera();
    };
    const onMouseUp = () => {
      orbitRef.current.isDragging = false;
      el.style.cursor = 'grab';
      clearTimeout(orbitRef.current._t);
      orbitRef.current._t = setTimeout(() => { orbitRef.current.autoSpin = true; }, 2500);
    };
    const onWheel = (e) => {
      orbitRef.current.radius = Math.max(1.8, Math.min(8, orbitRef.current.radius + e.deltaY * 0.006));
      updateCamera();
    };
    const onTouchStart = (e) => {
      if (e.touches.length !== 1) return;
      const o = orbitRef.current;
      o.isDragging = true; o.autoSpin = false;
      o.lastX = e.touches[0].clientX; o.lastY = e.touches[0].clientY;
    };
    const onTouchMove = (e) => {
      if (e.touches.length !== 1) return;
      const o = orbitRef.current;
      if (!o.isDragging) return;
      const dx = e.touches[0].clientX - o.lastX;
      const dy = e.touches[0].clientY - o.lastY;
      o.theta -= dx * 0.012;
      o.phi = Math.max(0.1, Math.min(Math.PI * 0.46, o.phi + dy * 0.009));
      o.lastX = e.touches[0].clientX; o.lastY = e.touches[0].clientY;
      updateCamera();
    };
    const onTouchEnd = () => { orbitRef.current.isDragging = false; };
    el.addEventListener('dblclick', () => {
      const o = orbitRef.current; o.theta = 0.4; o.phi = 0.52; o.radius = 3.6; o.autoSpin = true;
      updateCamera();
    });

    el.style.cursor = 'grab';
    el.addEventListener('mousedown',  onMouseDown);
    el.addEventListener('mousemove',  onMouseMove);
    el.addEventListener('mouseup',    onMouseUp);
    el.addEventListener('mouseleave', onMouseUp);
    el.addEventListener('wheel',      onWheel, { passive: true });
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove',  onTouchMove,  { passive: true });
    el.addEventListener('touchend',   onTouchEnd);

    // ── ResizeObserver ─────────────────────────────────────────────────────
    const onResize = () => {
      if (!el) return;
      const w = Math.max(el.clientWidth, 1);
      const h = Math.max(el.clientHeight, 1);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(el);
    roRef.current = ro;

    // ── Animation loop ─────────────────────────────────────────────────────
    let t = 0;
    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      t += 0.016;

      // Auto-spin when idle
      const o = orbitRef.current;
      if (o.autoSpin && !o.isDragging) {
        o.theta += 0.007;
        updateCamera();
      }

      // Part levitation
      if (groupRef.current) {
        groupRef.current.position.y = Math.sin(t * 1.2) * 0.05 + 0.1;
      }

      // Platform ring pulse
      if (platRingRef.current)  platRingRef.current.material.emissiveIntensity  = 1.0 + Math.sin(t * 2.4) * 0.35;
      if (innerRingRef.current) innerRingRef.current.material.emissiveIntensity = 0.5 + Math.sin(t * 3.8 + 1) * 0.28;

      // Holographic ring orbit
      if (holoRingRef.current) {
        holoRingRef.current.rotation.y += 0.008;
        holoRingRef.current.material.opacity = 0.1 + Math.sin(t * 1.6) * 0.05;
      }

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      el.removeEventListener('mousedown',  onMouseDown);
      el.removeEventListener('mousemove',  onMouseMove);
      el.removeEventListener('mouseup',    onMouseUp);
      el.removeEventListener('mouseleave', onMouseUp);
      el.removeEventListener('wheel',      onWheel);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove',  onTouchMove);
      el.removeEventListener('touchend',   onTouchEnd);
      cancelAnimationFrame(rafRef.current);
      roRef.current?.disconnect();
      if (el && renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  // Rebuild model on config change
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Remove old model
    if (groupRef.current) {
      scene.remove(groupRef.current);
      groupRef.current.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
      groupRef.current = null;
    }

    const group = new THREE.Group();
    try {
      if (partType === 'chassis')    buildChassisPreview(group, config);
      if (partType === 'wheel')      buildWheelPreview(group, config);
      if (partType === 'sensor')     buildSensorPreview(group, config);
      if (partType === 'arm')        buildArmPreview(group, config);
      if (partType === 'decoration') buildDecorationPreview(group, config);
    } catch (e) {
      console.error('Part preview error:', e);
    }
    scene.add(group);
    groupRef.current = group;
  }, [partType, config]);

  return <div ref={wrapRef} style={{ width: '100%', height: '100%' }} />;
}

// ─── Slider row ────────────────────────────────────────────────────────────
function SliderRow({ label, value, min, max, step = 0.01, onChange, unit = '' }) {
  return (
    <div className="bb-cp-param-row">
      <div className="bb-cp-param-label">
        <span>{label}</span>
        <span className="bb-cp-param-val">{typeof value === 'number' ? value.toFixed(step < 1 ? 2 : 0) : value}{unit}</span>
      </div>
      <input
        type="range" className="bb-cp-slider"
        min={min} max={max} step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
      />
    </div>
  );
}

// ─── Choice buttons ─────────────────────────────────────────────────────────
function Choices({ options, value, onChange }) {
  return (
    <div className="bb-cp-choices">
      {options.map(opt => (
        <button
          key={opt.id ?? opt}
          className={`bb-cp-btn-choice${(opt.id ?? opt) === value ? ' active' : ''}`}
          onClick={() => onChange(opt.id ?? opt)}
        >
          {opt.icon && <span>{opt.icon}</span>}
          {opt.label ?? opt}
        </button>
      ))}
    </div>
  );
}

// ─── Color row ─────────────────────────────────────────────────────────────
const PALETTE = [
  '#FF3333','#FF8C00','#FFD700','#00C851','#1E90FF','#9B59B6',
  '#FFFFFF','#CCCCCC','#555555','#111111','#00D9FF','#FF69B4',
];
function ColorRow({ label, value, onChange }) {
  return (
    <div className="bb-cp-param-row" style={{ marginBottom: 10 }}>
      <div className="bb-cp-param-label"><span>{label}</span></div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 4 }}>
        {PALETTE.map(c => (
          <button
            key={c}
            onClick={() => onChange(c)}
            style={{
              width: 24, height: 24, borderRadius: 6, border: c === value ? '2.5px solid #fff' : '2px solid transparent',
              background: c, cursor: 'pointer',
              boxShadow: c === value ? '0 0 0 2px #7c3aed' : '0 1px 4px rgba(0,0,0,0.3)',
              transition: 'all 0.12s',
            }}
          />
        ))}
        <input type="color" value={value} onChange={e => onChange(e.target.value)}
          style={{ width: 24, height: 24, borderRadius: 6, border: 'none', cursor: 'pointer', padding: 1, background: '#222' }} />
      </div>
    </div>
  );
}

// ─── Name field ─────────────────────────────────────────────────────────────
function NameField({ value, onChange }) {
  return (
    <div className="bb-cp-param-row" style={{ marginBottom: 12 }}>
      <div className="bb-cp-param-label"><span>Part Name</span></div>
      <input
        type="text"
        className="bb-cp-name-input"
        value={value}
        onChange={e => onChange(e.target.value)}
        maxLength={30}
        placeholder="Give your part a name..."
      />
    </div>
  );
}

// ─── Stats impact ───────────────────────────────────────────────────────────
function StatsPanel({ partType, config }) {
  const stats = computeStats(partType, config);
  return (
    <div className="bb-cp-stats-panel">
      <div className="bb-cp-stats-title">📊 Stats Impact</div>
      {stats.map(s => (
        <div key={s.label} className="bb-cp-stat-row">
          <span className="bb-cp-stat-label">{s.icon} {s.label}</span>
          <div className="bb-cp-stat-bar-wrap">
            <div className="bb-cp-stat-bar" style={{ width: `${s.value}%`, background: s.color }} />
          </div>
          <span className="bb-cp-stat-val">{s.value}</span>
        </div>
      ))}
    </div>
  );
}

function computeStats(partType, cfg) {
  if (partType === 'chassis') return [
    { label: 'Durability',  icon: '🛡️', value: Math.round(50 + cfg.width * 14 + cfg.height * 8),     color: '#22c55e' },
    { label: 'Agility',     icon: '⚡', value: Math.max(10, Math.round(100 - cfg.weight * 8)),        color: '#3b82f6' },
    { label: 'Capacity',    icon: '📦', value: Math.round(40 + cfg.wheelSockets * 5 + cfg.sensorSockets * 7), color: '#f59e0b' },
    { label: 'Weight',      icon: '⚖️', value: Math.round(cfg.weight * 10),                           color: '#ef4444' },
  ];
  if (partType === 'wheel') return [
    { label: 'Speed',       icon: '🚀', value: Math.round(60 + (0.6 - cfg.radius) * 40),              color: '#3b82f6' },
    { label: 'Grip',        icon: '🏁', value: cfg.grip,                                              color: '#22c55e' },
    { label: 'Stability',   icon: '⚖️', value: Math.round(50 + cfg.thickness * 80),                   color: '#f59e0b' },
    { label: 'Weight',      icon: '⚖️', value: Math.round(cfg.weight * 30),                           color: '#ef4444' },
  ];
  if (partType === 'sensor') return [
    { label: 'Range',       icon: '📡', value: Math.round(cfg.range * 8),                             color: '#3b82f6' },
    { label: 'Accuracy',    icon: '🎯', value: cfg.accuracy,                                          color: '#22c55e' },
    { label: 'Power Use',   icon: '🔋', value: Math.round(cfg.powerDrain * 14),                       color: '#f59e0b' },
    { label: 'Size',        icon: '📦', value: Math.round(cfg.size * 90),                             color: '#ef4444' },
  ];
  if (partType === 'arm') return [
    { label: 'Reach',       icon: '🦾', value: Math.round(cfg.length * 55),                           color: '#3b82f6' },
    { label: 'Strength',    icon: '💪', value: cfg.strength,                                          color: '#22c55e' },
    { label: 'Precision',   icon: '🎯', value: Math.round(85 - cfg.length * 8),                       color: '#f59e0b' },
    { label: 'Weight',      icon: '⚖️', value: Math.round(cfg.length * 18),                           color: '#ef4444' },
  ];
  // decoration
  return [
    { label: 'Style',       icon: '✨', value: Math.round(60 + cfg.glowIntensity * 20),               color: '#f59e0b' },
    { label: 'Glow',        icon: '💡', value: Math.round(cfg.glowIntensity * 55),                    color: '#3b82f6' },
    { label: 'Cool Factor', icon: '😎', value: Math.round(70 + cfg.size * 20),                        color: '#22c55e' },
    { label: 'Weight',      icon: '⚖️', value: 5,                                                     color: '#ef4444' },
  ];
}

// ─── Chassis Builder ───────────────────────────────────────────────────────
function ChassisBuilder({ config, setConfig }) {
  const p = (key, val) => setConfig(prev => ({ ...prev, [key]: val }));
  return (
    <>
      <NameField value={config.name} onChange={v => p('name', v)} />
      <div className="bb-cp-param-group">
        <div className="bb-cp-param-group-title">Shape</div>
        <Choices
          options={[{id:'box',label:'Box'},{id:'sphere',label:'Sphere'},{id:'cylinder',label:'Cylinder'},{id:'cone',label:'Cone'}]}
          value={config.shape} onChange={v => p('shape', v)}
        />
      </div>
      <div className="bb-cp-param-group">
        <div className="bb-cp-param-group-title">Dimensions</div>
        <SliderRow label="Width"  value={config.width}  min={0.6} max={2.4} onChange={v => p('width', v)} />
        <SliderRow label="Height" value={config.height} min={0.3} max={1.4} onChange={v => p('height', v)} />
        <SliderRow label="Depth"  value={config.depth}  min={0.6} max={2.8} onChange={v => p('depth', v)} />
      </div>
      <div className="bb-cp-param-group">
        <div className="bb-cp-param-group-title">Material</div>
        <Choices
          options={[{id:'plastic',label:'Plastic'},{id:'metal',label:'Metal'},{id:'carbon',label:'Carbon'},{id:'rubber',label:'Rubber'}]}
          value={config.material} onChange={v => p('material', v)}
        />
      </div>
      <div className="bb-cp-param-group">
        <div className="bb-cp-param-group-title">Color</div>
        <ColorRow label="" value={config.color} onChange={v => p('color', v)} />
      </div>
      <div className="bb-cp-param-group">
        <div className="bb-cp-param-group-title">Sockets & Slots</div>
        <SliderRow label="Wheel Sockets" value={config.wheelSockets}  min={2} max={8} step={2} onChange={v => p('wheelSockets', v)} unit=" sockets" />
        <SliderRow label="Sensor Slots"  value={config.sensorSockets} min={0} max={6} step={1} onChange={v => p('sensorSockets', v)} unit=" slots" />
        <SliderRow label="Arm Mounts"    value={config.armSockets}    min={0} max={4} step={1} onChange={v => p('armSockets', v)} unit=" mounts" />
        <SliderRow label="Weight (kg)"   value={config.weight}        min={0.5} max={8} step={0.5} onChange={v => p('weight', v)} unit=" kg" />
      </div>
    </>
  );
}

// ─── Wheel Builder ─────────────────────────────────────────────────────────
function WheelBuilder({ config, setConfig }) {
  const p = (key, val) => setConfig(prev => ({ ...prev, [key]: val }));
  return (
    <>
      <NameField value={config.name} onChange={v => p('name', v)} />
      <div className="bb-cp-param-group">
        <div className="bb-cp-param-group-title">Wheel Style</div>
        <Choices
          options={[{id:'standard',label:'Standard'},{id:'off-road',label:'Off-Road'},{id:'racing',label:'Racing'},{id:'spike',label:'Spike'},{id:'omni',label:'Omni'}]}
          value={config.style} onChange={v => p('style', v)}
        />
      </div>
      <div className="bb-cp-param-group">
        <div className="bb-cp-param-group-title">Dimensions</div>
        <SliderRow label="Radius"    value={config.radius}    min={0.18} max={0.65} onChange={v => p('radius', v)} />
        <SliderRow label="Thickness" value={config.thickness} min={0.1}  max={0.45} onChange={v => p('thickness', v)} />
      </div>
      <div className="bb-cp-param-group">
        <div className="bb-cp-param-group-title">Colors</div>
        <ColorRow label="Tire Color" value={config.tireColor} onChange={v => p('tireColor', v)} />
        <ColorRow label="Rim Color"  value={config.rimColor}  onChange={v => p('rimColor', v)} />
      </div>
      <div className="bb-cp-param-group">
        <div className="bb-cp-param-group-title">Performance</div>
        <SliderRow label="Grip (%)"   value={config.grip}   min={10} max={100} step={5} onChange={v => p('grip', v)} unit="%" />
        <SliderRow label="Weight (kg)" value={config.weight} min={0.1} max={2} step={0.1} onChange={v => p('weight', v)} unit=" kg" />
      </div>
    </>
  );
}

// ─── Sensor Builder ────────────────────────────────────────────────────────
function SensorBuilder({ config, setConfig }) {
  const p = (key, val) => setConfig(prev => ({ ...prev, [key]: val }));
  return (
    <>
      <NameField value={config.name} onChange={v => p('name', v)} />
      <div className="bb-cp-param-group">
        <div className="bb-cp-param-group-title">Sensor Type</div>
        <Choices
          options={[{id:'camera',label:'Camera'},{id:'sonar',label:'Sonar'},{id:'lidar',label:'Lidar'},{id:'ir',label:'IR'},{id:'gyro',label:'Gyro'},{id:'gps',label:'GPS'}]}
          value={config.type} onChange={v => p('type', v)}
        />
      </div>
      <div className="bb-cp-param-group">
        <div className="bb-cp-param-group-title">Specs</div>
        <SliderRow label="Range (m)"   value={config.range}      min={1} max={15} step={0.5} onChange={v => p('range', v)} unit=" m" />
        <SliderRow label="Accuracy (%)" value={config.accuracy}  min={40} max={100} step={5} onChange={v => p('accuracy', v)} unit="%" />
        <SliderRow label="Power Drain" value={config.powerDrain} min={0.5} max={8} step={0.5} onChange={v => p('powerDrain', v)} />
        <SliderRow label="Size"        value={config.size}       min={0.1} max={0.8} onChange={v => p('size', v)} />
      </div>
      <div className="bb-cp-param-group">
        <div className="bb-cp-param-group-title">Color</div>
        <ColorRow label="" value={config.color} onChange={v => p('color', v)} />
      </div>
    </>
  );
}

// ─── Arm Builder ───────────────────────────────────────────────────────────
function ArmBuilder({ config, setConfig }) {
  const p = (key, val) => setConfig(prev => ({ ...prev, [key]: val }));
  return (
    <>
      <NameField value={config.name} onChange={v => p('name', v)} />
      <div className="bb-cp-param-group">
        <div className="bb-cp-param-group-title">Arm Type</div>
        <Choices
          options={[{id:'grabber',label:'Grabber'},{id:'drill',label:'Drill'},{id:'torch',label:'Torch'},{id:'saw',label:'Saw'},{id:'laser',label:'Laser'}]}
          value={config.type} onChange={v => p('type', v)}
        />
      </div>
      <div className="bb-cp-param-group">
        <div className="bb-cp-param-group-title">Specs</div>
        <SliderRow label="Length"      value={config.length}   min={0.4} max={2.2} onChange={v => p('length', v)} />
        <SliderRow label="Strength (%)" value={config.strength} min={10} max={100} step={5} onChange={v => p('strength', v)} unit="%" />
      </div>
      <div className="bb-cp-param-group">
        <div className="bb-cp-param-group-title">Side</div>
        <Choices
          options={[{id:'right',label:'Right'},{id:'left',label:'Left'},{id:'both',label:'Both'}]}
          value={config.side} onChange={v => p('side', v)}
        />
      </div>
      <div className="bb-cp-param-group">
        <div className="bb-cp-param-group-title">Color</div>
        <ColorRow label="" value={config.color} onChange={v => p('color', v)} />
      </div>
    </>
  );
}

// ─── Decoration Builder ────────────────────────────────────────────────────
function DecorationBuilder({ config, setConfig }) {
  const p = (key, val) => setConfig(prev => ({ ...prev, [key]: val }));
  return (
    <>
      <NameField value={config.name} onChange={v => p('name', v)} />
      <div className="bb-cp-param-group">
        <div className="bb-cp-param-group-title">Decoration Type</div>
        <Choices
          options={[{id:'led-strip',label:'LED Strip'},{id:'spotlight',label:'Spotlight'},{id:'antenna',label:'Antenna'},{id:'neon-ring',label:'Neon Ring'},{id:'badge',label:'Badge'}]}
          value={config.type} onChange={v => p('type', v)}
        />
      </div>
      <div className="bb-cp-param-group">
        <div className="bb-cp-param-group-title">Appearance</div>
        <ColorRow label="Color" value={config.color} onChange={v => p('color', v)} />
        <SliderRow label="Glow Intensity" value={config.glowIntensity} min={0} max={3} step={0.1} onChange={v => p('glowIntensity', v)} />
        <SliderRow label="Size" value={config.size} min={0.2} max={1.4} onChange={v => p('size', v)} />
      </div>
      <div className="bb-cp-param-group">
        <div className="bb-cp-param-group-title">Position</div>
        <Choices
          options={[{id:'top',label:'Top'},{id:'front',label:'Front'},{id:'side',label:'Side'},{id:'back',label:'Back'}]}
          value={config.position} onChange={v => p('position', v)}
        />
      </div>
    </>
  );
}

// ─── Part Type Selector ────────────────────────────────────────────────────
function PartTypeSelector({ onSelect, onBack }) {
  return (
    <div className="bb-cp-page">
      <div className="bb-cp-page-head">
        <button className="bb-cp-back-btn" onClick={onBack}>← Back</button>
        <div>
          <div className="bb-cp-page-title">✨ What would you like to create?</div>
          <div className="bb-cp-page-sub">Choose a part type to start designing</div>
        </div>
      </div>
      <div className="bb-cp-type-grid">
        {PART_TYPES.map(pt => (
          <button
            key={pt.id}
            className="bb-cp-type-card"
            style={{ '--type-color': pt.color }}
            onClick={() => onSelect(pt.id)}
          >
            <div className="bb-cp-type-icon">{pt.icon}</div>
            <div className="bb-cp-type-label">{pt.label}</div>
            <div className="bb-cp-type-desc">{pt.desc}</div>
            <div className="bb-cp-type-arrow">→</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Builder View ──────────────────────────────────────────────────────────
function BuilderView({ partType, editingId, savedConfig, onSave, onBack }) {
  const [config, setConfig] = useState(savedConfig || DEFAULTS[partType]);
  const typeInfo = PART_TYPES.find(pt => pt.id === partType);

  const handleSave = () => onSave({ id: editingId || uid(), type: partType, ...config });

  const renderBuilder = () => {
    switch (partType) {
      // Body types — all use ChassisBuilder
      case 'chassis':
      case 'rover-body':
      case 'spider-body':
      case 'humanoid':
      case 'drone-body':
      case 'plane-body':
      case 'hover-body':
      case 'aqua-body':
      case 'head':
      case 'armor':
      case 'lego-block':
        return <ChassisBuilder config={config} setConfig={setConfig} />;
      // Wheel/movement types
      case 'wheel':
      case 'track':
      case 'leg':
      case 'propeller':
      case 'fin':
      case 'hover-pad':
        return <WheelBuilder config={config} setConfig={setConfig} />;
      // Sensor types
      case 'sensor':
      case 'camera-part':
      case 'scanner':
      case 'detector':
      case 'battery':
      case 'solar-panel':
      case 'reactor':
      case 'ai-chip':
      case 'antenna':
        return <SensorBuilder config={config} setConfig={setConfig} />;
      // Arm / tool types
      case 'arm':
      case 'claw':
      case 'drill-tool':
      case 'laser-tool':
      case 'weld-tool':
      case 'rescue-tool':
      case 'joint':
        return <ArmBuilder config={config} setConfig={setConfig} />;
      // Decoration / lights
      case 'decoration':
      case 'light-part':
        return <DecorationBuilder config={config} setConfig={setConfig} />;
      default: return <ChassisBuilder config={config} setConfig={setConfig} />;
    }
  };

  return (
    <div className="bb-cp-builder-wrap">
      {/* Top bar */}
      <div className="bb-cp-builder-bar">
        <button className="bb-cp-back-btn" onClick={onBack}>← Back</button>
        <div className="bb-cp-builder-title">
          <span>{typeInfo?.icon}</span>
          {editingId ? `Edit ${typeInfo?.label}` : `New ${typeInfo?.label}`}
        </div>
        <button className="bb-cp-save-btn" onClick={handleSave}>
          💾 Save Part
        </button>
      </div>

      {/* 3-column layout */}
      <div className="bb-cp-builder">
        {/* Left: controls */}
        <div className="bb-cp-left">
          <div className="bb-cp-scroll">
            {renderBuilder()}
          </div>
        </div>

        {/* Center: 3D preview */}
        <div className="bb-cp-center">
          <div className="bb-cp-preview-label">🔭 Live 3D Preview</div>
          <div className="bb-cp-canvas-wrap">
            <PartPreviewCanvas partType={partType} config={config} key={partType} />
          </div>
          <div className="bb-cp-preview-hint">
            Drag to rotate · Scroll to zoom · Double-click to reset
          </div>
        </div>

        {/* Right: stats */}
        <div className="bb-cp-right">
          <StatsPanel partType={partType} config={config} />
          <div className="bb-cp-part-badge" style={{ background: typeInfo?.color }}>
            {typeInfo?.icon} {typeInfo?.label}
          </div>
          <div className="bb-cp-save-hint">
            Your part will be saved to My Parts library and will appear in the Build page.
          </div>
          <button className="bb-cp-save-btn-big" onClick={handleSave}>
            💾 Save to My Parts
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── My Custom Parts Library ───────────────────────────────────────────────
function MyCustomPartsLibrary({ parts, onNew, onEdit, onDelete }) {
  const [filter, setFilter] = useState('all');

  const GROUP_TYPES = {
    body:      ['chassis','rover-body','spider-body','humanoid','drone-body','plane-body','hover-body','aqua-body','head'],
    movement:  ['wheel','track','leg','propeller','fin','hover-pad'],
    arms:      ['arm','claw','drill-tool','laser-tool','weld-tool','rescue-tool','joint'],
    sensors:   ['sensor','camera-part','scanner','detector'],
    power:     ['battery','solar-panel','reactor'],
    ai:        ['ai-chip','antenna'],
    structure: ['armor'],
    deco:      ['decoration','light-part'],
    lego:      ['lego-block'],
  };
  const filtered = filter === 'all'
    ? parts
    : GROUP_TYPES[filter]
      ? parts.filter(p => GROUP_TYPES[filter].includes(p.type))
      : parts.filter(p => p.type === filter);

  return (
    <div className="bb-cp-page">
      {/* Header */}
      <div className="bb-cp-lib-head">
        <div>
          <div className="bb-cp-page-title">✨ My Custom Parts</div>
          <div className="bb-cp-page-sub">{parts.length} part{parts.length !== 1 ? 's' : ''} created</div>
        </div>
        <button className="bb-cp-new-btn" onClick={onNew}>
          + Create New Part
        </button>
      </div>

      {/* Filter pills */}
      <div className="bb-cp-filter-row">
        {[
          { id: 'all',        label: 'All Parts',  icon: '🔍' },
          { id: 'body',       label: 'Body',        icon: '📦' },
          { id: 'movement',   label: 'Movement',    icon: '🛞' },
          { id: 'arms',       label: 'Arms & Tools',icon: '🦾' },
          { id: 'sensors',    label: 'Sensors',     icon: '📡' },
          { id: 'power',      label: 'Power',       icon: '🔋' },
          { id: 'ai',         label: 'AI & Comms',  icon: '🧠' },
          { id: 'structure',  label: 'Structural',  icon: '🛡️' },
          { id: 'deco',       label: 'Decoration',  icon: '✨' },
          { id: 'lego',       label: 'LEGO',        icon: '🧱' },
        ].map(f => {
          const GROUP_MAP = {
            body:      ['chassis','rover-body','spider-body','humanoid','drone-body','plane-body','hover-body','aqua-body','head'],
            movement:  ['wheel','track','leg','propeller','fin','hover-pad'],
            arms:      ['arm','claw','drill-tool','laser-tool','weld-tool','rescue-tool','joint'],
            sensors:   ['sensor','camera-part','scanner','detector'],
            power:     ['battery','solar-panel','reactor'],
            ai:        ['ai-chip','antenna'],
            structure: ['armor'],
            deco:      ['decoration','light-part'],
            lego:      ['lego-block'],
          };
          const isActive = f.id === 'all' ? filter === 'all' : GROUP_MAP[f.id]?.includes(filter) || filter === f.id;
          const handleClick = () => setFilter(f.id === 'all' ? 'all' : f.id);
          return (
            <button
              key={f.id}
              className={`bb-cp-filter-pill${isActive ? ' active' : ''}`}
              onClick={handleClick}
            >
              {f.icon} {f.label}
            </button>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="bb-cp-empty">
          <div className="bb-cp-empty-icon">🔧</div>
          <div className="bb-cp-empty-title">
            {parts.length === 0 ? 'No parts yet!' : 'No parts match this filter'}
          </div>
          <div className="bb-cp-empty-sub">
            {parts.length === 0
              ? 'Create your first custom part to get started. Your designs will show up here.'
              : 'Try selecting a different filter above.'}
          </div>
          {parts.length === 0 && (
            <button className="bb-cp-new-btn" onClick={onNew} style={{ marginTop: 16 }}>
              ✨ Create Your First Part
            </button>
          )}
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 && (
        <div className="bb-cp-grid">
          {filtered.map(part => {
            const typeInfo = PART_TYPES.find(pt => pt.id === part.type);
            return (
              <div key={part.id} className="bb-cp-card">
                <div className="bb-cp-card-thumb" style={{ background: `linear-gradient(135deg, ${typeInfo?.color}33, ${typeInfo?.color}11)` }}>
                  <span style={{ fontSize: 40 }}>{typeInfo?.icon}</span>
                </div>
                <div className="bb-cp-card-body">
                  <div className="bb-cp-card-name">{part.name}</div>
                  <div className="bb-cp-card-type" style={{ color: typeInfo?.color }}>
                    {typeInfo?.label}
                    {part.type === 'chassis' && ` · ${part.shape}`}
                    {part.type === 'wheel' && ` · ${part.style}`}
                    {part.type === 'sensor' && ` · ${part.type}`}
                    {part.type === 'arm' && ` · ${part.type}`}
                  </div>
                  {part.color && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
                      <div style={{ width: 12, height: 12, borderRadius: 3, background: part.color, border: '1px solid rgba(0,0,0,0.2)' }} />
                      <span style={{ fontSize: 11, color: '#888' }}>{part.color}</span>
                    </div>
                  )}
                  <div className="bb-cp-card-actions">
                    <button className="bb-cp-card-btn edit" onClick={() => onEdit(part)}>✏️ Edit</button>
                    <button className="bb-cp-card-btn delete" onClick={() => onDelete(part.id)}>🗑️</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main CustomPartsPage ──────────────────────────────────────────────────
export default function CustomPartsPage({ customParts, setCustomParts }) {
  // view: 'library' | 'select-type' | 'building'
  const [view, setView]         = useState('library');
  const [partType, setPartType] = useState(null);
  const [editingPart, setEditingPart] = useState(null); // part being edited (or null for new)

  const handleNew = () => setView('select-type');

  const handleSelectType = (type) => {
    setPartType(type);
    setEditingPart(null);
    setView('building');
  };

  const handleEdit = (part) => {
    setPartType(part.type);
    setEditingPart(part);
    setView('building');
  };

  const handleSave = (partData) => {
    setCustomParts(prev => {
      const exists = prev.find(p => p.id === partData.id);
      const next = exists
        ? prev.map(p => p.id === partData.id ? partData : p)
        : [...prev, partData];
      saveParts(next);
      return next;
    });
    setView('library');
    setEditingPart(null);
  };

  const handleDelete = (id) => {
    setCustomParts(prev => {
      const next = prev.filter(p => p.id !== id);
      saveParts(next);
      return next;
    });
  };

  if (view === 'select-type') {
    return (
      <div className="bb-cp-root">
        <PartTypeSelector onSelect={handleSelectType} onBack={() => setView('library')} />
      </div>
    );
  }

  if (view === 'building' && partType) {
    return (
      <div className="bb-cp-root bb-cp-root--building">
        <BuilderView
          partType={partType}
          editingId={editingPart?.id}
          savedConfig={editingPart ? { ...editingPart } : null}
          onSave={handleSave}
          onBack={() => { setView('library'); setEditingPart(null); }}
        />
      </div>
    );
  }

  return (
    <div className="bb-cp-root">
      <MyCustomPartsLibrary
        parts={customParts}
        onNew={handleNew}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
