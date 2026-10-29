/**
 * BuildPage.jsx
 * Full 3-column build experience: Parts library | 3D Viewer | Stats/Config
 * v2 — bright stage, rich part tiles, delete functionality, robot-click overlay
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { asPrebuiltRobot, isCreatedRobot } from '../services/studio-robot-store.js';
import { loadXbotFootballer } from './football/FootballPlayerKit.js';
import * as THREE from 'three';
import {
  CHASSIS_DATA, SENSORS_DATA, TOOLS_DATA, POWER_DATA, HEADS_DATA, ARMS_DATA, LIGHTS_DATA,
  AI_DATA, COMM_DATA, STRUCTURAL_DATA, DECO_DATA, LEGO_DATA,
  BLOCKS_DATA, buildRobotModel, normalizeRobotBuildConfig, applyStudioPaint,
} from '../services/studio-robot-builder.js';
import {
  parseWeightKg,
  getPrimaryRobotDisplay,
  getStudioRobotGroup,
  STARTER_CHASSIS_IDS,
  RETIRED_CHASSIS_IDS,
  FAMILY_PICKER_LABEL,
  partitionByStarterIds,
  isStarterChassis,
} from '../data/primary-robot-studio.js';
import { createSimWebGLRenderer, getStudioDeviceProfile } from '../services/art-direction.js';
import { EmojiIcon, IconText } from '../../components/ui/Icon.jsx';

// ─── Colour palettes ────────────────────────────────────────────────────────
const PALETTE_CLASSIC = [
  '#FF3333', '#FF8C00', '#FFD700', '#00C851', '#1E90FF', '#9B59B6',
  '#FF69B4', '#00D9FF', '#FFFFFF', '#CCCCCC', '#888888', '#333333',
];
const PALETTE_METALLIC = [
  '#C0C0C0', '#FFD700', '#CD7F32', '#B87333', '#E8E8E8', '#A8A9AD',
  '#B9A44C', '#8B8B8B', '#4A4A4A', '#2C2C2C', '#708090', '#36454F',
];
const PALETTE_NEON = [
  '#39FF14', '#FF1493', '#00FFFF', '#FF6600', '#BF00FF', '#FFFF00',
  '#FF0090', '#00FF9F', '#FF4500', '#4D4DFF', '#FF3366', '#00E5FF',
];
const PALETTE_DARK = [
  '#0d0d1a', '#1a1a2e', '#16213e', '#0f3460', '#1B1B2F', '#2C2C54',
  '#162032', '#1a2744', '#2d1b69', '#3d0000', '#002200', '#1a0a00',
];
const PALETTE = [...PALETTE_CLASSIC];

const WHEEL_COLORS = [
  '#1a1a1a', '#2a2a2a', '#3d3d3d', '#555555', '#777777', '#AAAAAA',
  '#CD7F32', '#FFD700', '#FF3333', '#1E90FF', '#00C851', '#9B59B6',
];
const LED_COLORS = [
  '#00D9FF', '#FFFFFF', '#FF3333', '#00C851', '#FF8C00', '#9B59B6',
  '#39FF14', '#FF1493', '#4D4DFF', '#FF6600', '#FFFF00', '#BF00FF',
];

// ─── Part descriptions & accent colors ────────────────────────────────────
const PART_META = {
  // Sensors
  camera:      { desc: 'HD vision system',    bg: '#E3F2FD', accent: '#1E90FF' },
  ultrasonic:  { desc: 'Distance scanner',    bg: '#E0F7FA', accent: '#00BCD4' },
  lidar:       { desc: '360° 3D mapping',     bg: '#FFEBEE', accent: '#FF3333' },
  ir:          { desc: 'Heat & motion',        bg: '#FFF3E0', accent: '#FF8C00' },
  gyro:        { desc: 'Balance control',     bg: '#E8F5E9', accent: '#00C851' },
  gps:         { desc: 'GPS navigation',      bg: '#FFFDE7', accent: '#FFD700' },
  // Tools
  grabber:     { desc: 'Pick up objects',     bg: '#FFF3E0', accent: '#FF8C00' },
  drill:       { desc: 'Drilling tool',       bg: '#FAFAFA', accent: '#888888' },
  laser:       { desc: 'Laser emitter',       bg: '#F3E5F5', accent: '#9B59B6' },
  shovel:      { desc: 'Terrain digger',      bg: '#EFEBE9', accent: '#8B4513' },
  claw:        { desc: 'Crab claw grip',      bg: '#FFEBEE', accent: '#FF6B6B' },
  saw:         { desc: 'Cutting blade',       bg: '#F5F5F5', accent: '#555555' },
  // Arms
  simple:      { desc: 'Basic arm',           bg: '#FAFAFA', accent: '#888' },
  'claw-arm':  { desc: 'Claw manipulator',   bg: '#FFF3E0', accent: '#FF8C00' },
  'drill-arm': { desc: 'Drill attachment',   bg: '#F5F5F5', accent: '#555' },
  torch:       { desc: 'Welding torch',       bg: '#FFEBEE', accent: '#FF4500' },
  'laser-arm': { desc: 'Laser arm',           bg: '#F3E5F5', accent: '#9B59B6' },
  bucket:      { desc: 'Bucket scoop',        bg: '#EFEBE9', accent: '#8B4513' },
  // Power
  solar:       { desc: 'Solar panels',        bg: '#FFFDE7', accent: '#FFD700' },
  battery:     { desc: 'Li-ion battery',      bg: '#E8F5E9', accent: '#00C851' },
  nuclear:     { desc: 'Nuclear core',        bg: '#E0F7FA', accent: '#00D9FF' },
  fuel:        { desc: 'Hydrogen cell',       bg: '#FFF3E0', accent: '#FF8C00' },
  // Heads
  dome:        { desc: 'Dome scanner',        bg: '#FAFAFA', accent: '#888' },
  spike:       { desc: 'Spike antenna',       bg: '#FFEBEE', accent: '#FF0000' },
  antenna:     { desc: 'Signal antenna',      bg: '#E0F7FA', accent: '#00D9FF' },
  flat:        { desc: 'Flat sensor plate',   bg: '#E3F2FD', accent: '#1E90FF' },
  face:        { desc: 'Friendly face',       bg: '#FFFDE7', accent: '#FFD700' },
  scanner:     { desc: 'Laser scanner',       bg: '#E8F5E9', accent: '#00C851' },
  // Lights
  'led-white': { desc: 'White LED strip',     bg: '#FAFAFA', accent: '#AAA' },
  'led-cyan':  { desc: 'Cyan glow',           bg: '#E0F7FA', accent: '#00D9FF' },
  'led-red':   { desc: 'Red warning light',   bg: '#FFEBEE', accent: '#FF3333' },
  searchlight: { desc: 'High-power beam',     bg: '#FFFDE7', accent: '#FFD700' },
  strobes:     { desc: 'Strobe flashes',      bg: '#F3E5F5', accent: '#FF00FF' },
  ring:        { desc: 'LED ring halo',       bg: '#FFFDE7', accent: '#FFD700' },
};

const MOVEMENT_OPTS = [
  { id: 'wheels',  name: 'Wheels (4)', icon: '🛞', desc: 'Standard grip',   bg: '#FFF3E0', accent: '#FF8C00' },
  { id: 'wheels6', name: 'Wheels (6)', icon: '🛞', desc: 'Extra traction',  bg: '#E8F5E9', accent: '#00C851' },
  { id: 'tracks',  name: 'Tracks',     icon: '⛓️', desc: 'Tank treads',     bg: '#ECEFF1', accent: '#555' },
  { id: 'legs',    name: 'Legs',       icon: '🦵', desc: 'Articulated gait',bg: '#F3E5F5', accent: '#9B59B6' },
  { id: 'flying',  name: 'Hover',      icon: '🚁', desc: 'Thrust levitation',bg: '#E0F7FA', accent: '#00D9FF' },
  { id: 'jets',    name: 'Jets',       icon: '🚀', desc: 'Rocket propulsion',bg: '#FFEBEE', accent: '#FF3333' },
];

// ─── Socket System ──────────────────────────────────────────────────────────
// Which socket type accepts which part categories
const SOCKET_ACCEPTS = {
  wheel_socket:   ['movement'],
  sensor_socket:  ['sensor', 'light', 'comm'],
  head_socket:    ['head'],
  arm_socket:     ['arm', 'tool'],
  battery_socket: ['power'],
  ai_socket:      ['ai'],
  struct_socket:  ['struct', 'deco', 'lego'],
};
// Part category → socket type (for MIME type encoding during drag)
const PART_TO_SOCKET_TYPE = {
  movement: 'wheel_socket',  sensor: 'sensor_socket', light: 'sensor_socket',
  comm:     'sensor_socket', head:   'head_socket',   arm:   'arm_socket',
  tool:     'arm_socket',    power:  'battery_socket', ai:   'ai_socket',
  struct:   'struct_socket', deco:   'struct_socket',  lego: 'struct_socket',
};

// Socket positions [x%, y%] relative to the Three.js canvas area.
// Camera is elevated ~30° so "top" = low y%, "bottom" = high y%.
const _s = (id, type, x, y, label, max, icon) => ({ id, type, pos:[x,y], label, max, icon });

const SOCKET_DEFS = {
  rover: [
    _s('head',     'head_socket',    50, 14, 'Head Mount',       1, '🤖'),
    _s('sensor_t', 'sensor_socket',  50, 26, 'Top Sensor',       2, '📡'),
    _s('arm_l',    'arm_socket',     18, 46, 'Left Arm',         1, '🦾'),
    _s('arm_r',    'arm_socket',     82, 46, 'Right Arm',        1, '🦾'),
    _s('wheel_fl', 'wheel_socket',   32, 57, 'Front-L Wheel',    1, '🛞'),
    _s('wheel_fr', 'wheel_socket',   68, 57, 'Front-R Wheel',    1, '🛞'),
    _s('wheel_rl', 'wheel_socket',   30, 67, 'Rear-L Wheel',     1, '🛞'),
    _s('wheel_rr', 'wheel_socket',   70, 67, 'Rear-R Wheel',     1, '🛞'),
    _s('battery',  'battery_socket', 50, 75, 'Power Source',     1, '🔋'),
    _s('ai',       'ai_socket',      50, 46, 'AI Core',          1, '🧠'),
  ],
  tank: [
    _s('head',     'head_socket',    50, 16, 'Head Mount',       1, '🤖'),
    _s('sensor_t', 'sensor_socket',  50, 28, 'Top Sensor',       2, '📡'),
    _s('arm_t',    'arm_socket',     50, 42, 'Turret Arm',       1, '🦾'),
    _s('track_l',  'wheel_socket',   16, 62, 'Left Track',       1, '⛓️'),
    _s('track_r',  'wheel_socket',   84, 62, 'Right Track',      1, '⛓️'),
    _s('battery',  'battery_socket', 50, 74, 'Power Source',     1, '🔋'),
    _s('ai',       'ai_socket',      50, 50, 'AI Core',          1, '🧠'),
  ],
  spider: [
    _s('sensor_t', 'sensor_socket',  50, 20, 'Top Sensor',       2, '📡'),
    _s('arm_l',    'arm_socket',     20, 44, 'Left Arm',         1, '🦾'),
    _s('arm_r',    'arm_socket',     80, 44, 'Right Arm',        1, '🦾'),
    _s('leg_fl',   'wheel_socket',   33, 52, 'Front-L Leg',      1, '🦵'),
    _s('leg_fr',   'wheel_socket',   67, 52, 'Front-R Leg',      1, '🦵'),
    _s('leg_ml',   'wheel_socket',   16, 62, 'Mid-L Leg',        1, '🦵'),
    _s('leg_mr',   'wheel_socket',   84, 62, 'Mid-R Leg',        1, '🦵'),
    _s('leg_bl',   'wheel_socket',   28, 72, 'Back-L Leg',       1, '🦵'),
    _s('leg_br',   'wheel_socket',   72, 72, 'Back-R Leg',       1, '🦵'),
    _s('battery',  'battery_socket', 50, 68, 'Power Source',     1, '🔋'),
  ],
  drone: [
    _s('sensor_t', 'sensor_socket',  50, 24, 'Top Sensor',       2, '📡'),
    _s('prop_fl',  'wheel_socket',   26, 36, 'Front-L Rotor',    1, '🚁'),
    _s('prop_fr',  'wheel_socket',   74, 36, 'Front-R Rotor',    1, '🚁'),
    _s('prop_rl',  'wheel_socket',   26, 64, 'Rear-L Rotor',     1, '🚁'),
    _s('prop_rr',  'wheel_socket',   74, 64, 'Rear-R Rotor',     1, '🚁'),
    _s('camera',   'sensor_socket',  50, 72, 'Camera Gimbal',    1, '📷'),
    _s('battery',  'battery_socket', 50, 50, 'Battery Slot',     1, '🔋'),
    _s('ai',       'ai_socket',      50, 42, 'AI Core',          1, '🧠'),
  ],
  humanoid: [
    _s('head',     'head_socket',    50, 11, 'Head Mount',       1, '🤖'),
    _s('sensor_c', 'sensor_socket',  50, 28, 'Chest Sensor',     2, '📡'),
    _s('arm_l',    'arm_socket',     18, 38, 'Left Arm',         1, '🦾'),
    _s('arm_r',    'arm_socket',     82, 38, 'Right Arm',        1, '🦾'),
    _s('battery',  'battery_socket', 50, 48, 'Chest Battery',    1, '🔋'),
    _s('ai',       'ai_socket',      50, 40, 'AI Core',          1, '🧠'),
    _s('leg_l',    'wheel_socket',   38, 72, 'Left Leg',         1, '🦵'),
    _s('leg_r',    'wheel_socket',   62, 72, 'Right Leg',        1, '🦵'),
  ],
  heli: [
    _s('rotor',    'wheel_socket',   50, 20, 'Main Rotor',       1, '🚁'),
    _s('sensor_n', 'sensor_socket',  28, 46, 'Nose Sensor',      1, '📡'),
    _s('sensor_t', 'sensor_socket',  50, 28, 'Top Sensor',       1, '📡'),
    _s('tail',     'arm_socket',     82, 48, 'Tail Rotor',       1, '🦾'),
    _s('battery',  'battery_socket', 50, 60, 'Fuel Cell',        1, '🔋'),
    _s('ai',       'ai_socket',      50, 50, 'AI Core',          1, '🧠'),
    _s('cargo',    'struct_socket',  50, 72, 'Cargo Slot',       1, '📦'),
  ],
  hover: [
    _s('sensor_t', 'sensor_socket',  50, 20, 'Top Sensor',       2, '📡'),
    _s('lift_fl',  'wheel_socket',   28, 38, 'Front-L Lift',     1, '🚀'),
    _s('lift_fr',  'wheel_socket',   72, 38, 'Front-R Lift',     1, '🚀'),
    _s('lift_rl',  'wheel_socket',   28, 64, 'Rear-L Lift',      1, '🚀'),
    _s('lift_rr',  'wheel_socket',   72, 64, 'Rear-R Lift',      1, '🚀'),
    _s('arm_l',    'arm_socket',     18, 50, 'Left Arm',         1, '🦾'),
    _s('arm_r',    'arm_socket',     82, 50, 'Right Arm',        1, '🦾'),
    _s('battery',  'battery_socket', 50, 55, 'Power Core',       1, '🔋'),
  ],
  sub: [
    _s('sensor_f', 'sensor_socket',  22, 48, 'Front Sensor',     1, '📡'),
    _s('sensor_t', 'sensor_socket',  50, 26, 'Top Sensor',       1, '📡'),
    _s('arm_l',    'arm_socket',     22, 58, 'Port Arm',         1, '🦾'),
    _s('arm_r',    'arm_socket',     78, 58, 'Starboard Arm',    1, '🦾'),
    _s('prop',     'wheel_socket',   84, 52, 'Propeller',        1, '🌀'),
    _s('battery',  'battery_socket', 50, 60, 'Power Cell',       1, '🔋'),
    _s('ai',       'ai_socket',      50, 48, 'AI Core',          1, '🧠'),
  ],
  plane: [
    _s('sensor_n', 'sensor_socket',  20, 48, 'Nose Sensor',      1, '📡'),
    _s('engine_l', 'wheel_socket',   28, 58, 'Left Engine',      1, '🚀'),
    _s('engine_r', 'wheel_socket',   72, 58, 'Right Engine',     1, '🚀'),
    _s('arm_l',    'arm_socket',     25, 52, 'Left Wing',        1, '🦾'),
    _s('arm_r',    'arm_socket',     75, 52, 'Right Wing',       1, '🦾'),
    _s('battery',  'battery_socket', 50, 52, 'Fuel Tank',        1, '🔋'),
    _s('ai',       'ai_socket',      50, 44, 'AI Core',          1, '🧠'),
  ],
  arm: [
    _s('gripper',  'arm_socket',     50, 20, 'End Effector',     1, '🦾'),
    _s('sensor',   'sensor_socket',  34, 34, 'Wrist Sensor',     2, '📡'),
    _s('battery',  'battery_socket', 50, 70, 'Power Base',       1, '🔋'),
    _s('ai',       'ai_socket',      50, 58, 'Controller',       1, '🧠'),
  ],
};

// Map each chassis ID to its socket set
const CHASSIS_SOCKETS = {
  rover: SOCKET_DEFS.rover, scout: SOCKET_DEFS.rover, crawler: SOCKET_DEFS.rover,
  spacerover: SOCKET_DEFS.rover, legobot: SOCKET_DEFS.rover, blockbot: SOCKET_DEFS.rover,
  tank: SOCKET_DEFS.tank, stealth: SOCKET_DEFS.tank, miningbot: SOCKET_DEFS.tank,
  securitybot: SOCKET_DEFS.tank, battlebot: SOCKET_DEFS.tank, farmbot: SOCKET_DEFS.tank,
  factorybot: SOCKET_DEFS.tank, medbot: SOCKET_DEFS.tank, firebot: SOCKET_DEFS.tank,
  spider: SOCKET_DEFS.spider,
  drone: SOCKET_DEFS.drone, racedrone: SOCKET_DEFS.drone, rescuedrone: SOCKET_DEFS.drone,
  droid: SOCKET_DEFS.humanoid, mech: SOCKET_DEFS.humanoid,
  striker: SOCKET_DEFS.humanoid, blaster: SOCKET_DEFS.humanoid,
  ninja: SOCKET_DEFS.humanoid, berserker: SOCKET_DEFS.humanoid,
  footballbot: SOCKET_DEFS.humanoid,
  helicopter: SOCKET_DEFS.heli,
  hoverbot: SOCKET_DEFS.hover, hoverracer: SOCKET_DEFS.hover,
  submarine: SOCKET_DEFS.sub, deepseabot: SOCKET_DEFS.sub,
  robotarm: SOCKET_DEFS.arm,
  jetplane: SOCKET_DEFS.plane, steathjet: SOCKET_DEFS.plane, aerobat: SOCKET_DEFS.plane,
};

const CATEGORIES = [
  { id: 'body',       label: 'Body',       icon: '📦' },
  { id: 'movement',   label: 'Movement',   icon: '⚙️' },
  { id: 'heads',      label: 'Heads',      icon: '🤖' },
  { id: 'sensors',    label: 'Sensors',    icon: '📡' },
  { id: 'arms',       label: 'Arms',       icon: '🦾' },
  { id: 'tools',      label: 'Tools',      icon: '🔧' },
  { id: 'power',      label: 'Power',      icon: '🔋' },
  { id: 'lights',     label: 'Lights',     icon: '💡' },
  { id: 'ai',         label: 'AI Brain',   icon: '🧠' },
  { id: 'comm',       label: 'Comms',      icon: '📶' },
  { id: 'structural', label: 'Armor',      icon: '🛡️' },
  { id: 'deco',       label: 'Decor',      icon: '🎨' },
  { id: 'lego',       label: 'LEGO',       icon: '🧱' },
];

// ─── Rich part tile ────────────────────────────────────────────────────────
function PartTile({ id, icon, name, desc, active, onClick, bg = '#F5F5F5', accent = '#7c3aed', isCustom = false, partType }) {
  const handleDragStart = (e) => {
    if (!partType) return;
    e.dataTransfer.setData('text/plain', JSON.stringify({ partType, id }));
    // Encode part type in MIME key so it's readable during dragover (data values aren't accessible then)
    e.dataTransfer.setData(`bb/${partType}`, '1');
    e.dataTransfer.effectAllowed = 'copy';
  };
  return (
    // Use div instead of button to avoid browser button+drag conflicts
    <div
      role="button"
      tabIndex={0}
      className={`bb-pt${active ? ' bb-pt--active' : ''}`}
      onClick={onClick}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick && onClick(); } }}
      draggable={!!partType}
      onDragStart={handleDragStart}
      title={desc ? `${name} — ${desc}` : name}
      style={active
        ? { '--pt-accent': accent, '--pt-bg': bg, borderColor: accent, background: bg }
        : { '--pt-accent': accent, '--pt-bg': bg }
      }
    >
      {active && <span className="bb-pt-check">✓</span>}
      {isCustom && <span className="bb-pt-custom-star"><EmojiIcon e="✨" /></span>}
      {partType && !active && <span className="bb-pt-drag-hint">⠿ drag</span>}
      <div className="bb-pt-icon-wrap" style={{ background: active ? `${accent}22` : '#f0f0f0' }}>
        <span className="bb-pt-icon">{icon}</span>
      </div>
      <div className="bb-pt-body">
        <span className="bb-pt-name">{name}</span>
        {desc && <span className="bb-pt-desc">{desc}</span>}
      </div>
    </div>
  );
}

// ─── Chassis card (larger card for body category) ─────────────────────────
const MORE_FAMILY_ORDER = ['wheeled', 'aerial', 'walker', 'underwater', 'arm', 'footballbot', 'birdbot', 'arcade', 'custom'];

function groupMoreChassis(more) {
  const groups = new Map();
  for (const ch of more) {
    const fam = ch.isCustom ? 'custom' : getStudioRobotGroup(ch.id);
    if (!groups.has(fam)) groups.set(fam, []);
    groups.get(fam).push(ch);
  }
  return MORE_FAMILY_ORDER.filter((k) => groups.has(k)).map((k) => ({
    id: k,
    label: FAMILY_PICKER_LABEL[k] || 'More',
    items: groups.get(k),
  }));
}

function disposeThumbModel(obj) {
  obj.traverse((n) => {
    n.geometry?.dispose?.();
    const mats = n.material ? (Array.isArray(n.material) ? n.material : [n.material]) : [];
    mats.forEach((m) => m.dispose?.());
  });
}

let thumbRenderer = null;
let thumbCamera = null;
let thumbScene = null;
let thumbQueue = Promise.resolve();
const thumbCache = new Map();

function getThumbRenderer() {
  if (thumbRenderer) return thumbRenderer;
  thumbRenderer = createSimWebGLRenderer({ antialias: true, lowPower: true });
  if (!thumbRenderer) return null;
  thumbRenderer.setSize(160, 160, false);
  thumbRenderer.setClearColor(0xf3f5fb, 1);
  thumbCamera = new THREE.PerspectiveCamera(34, 1, 0.08, 80);
  thumbScene = new THREE.Scene();
  thumbScene.add(new THREE.AmbientLight(0xffffff, 1.15));
  const key = new THREE.DirectionalLight(0xffffff, 1.25);
  key.position.set(2.4, 5.2, 3.6);
  thumbScene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 0.45);
  fill.position.set(-3, 2, -2);
  thumbScene.add(fill);
  return thumbRenderer;
}

const XBOT_CHASSIS = new Set(['footballbot', 'striker']);

function renderChassisThumbUrl(ch) {
  const key = `${ch.id}|${ch.primaryColor}|${ch.accentColor}`;
  if (thumbCache.has(key)) return Promise.resolve(thumbCache.get(key));
  thumbQueue = thumbQueue.then(async () => {
    if (thumbCache.has(key)) return thumbCache.get(key);
    // Footballer and boxer use the animated X Bot body — wait for it so the card shows the real robot
    if (XBOT_CHASSIS.has(ch.id)) await loadXbotFootballer();
    const renderer = getThumbRenderer();
    if (!renderer) return null;
    let model = null;
    try {
      model = buildRobotModel(normalizeRobotBuildConfig({
        chassisId: ch.id,
        name: ch.name,
        primaryColor: ch.primaryColor,
        accentColor: ch.accentColor,
        sensors: [],
        tools: [],
      }));
      thumbScene.add(model);
      // settle animated bodies into their idle pose (not the T-pose)
      if (model.userData.animate) for (let i = 1; i <= 20; i++) model.userData.animate(i * 0.05, 0.05);
      model.updateMatrixWorld(true);
      frameStudioRobot(model, thumbCamera);
      renderer.render(thumbScene, thumbCamera);
      const url = renderer.domElement.toDataURL('image/png');
      thumbCache.set(key, url);
      return url;
    } catch {
      return null;
    } finally {
      if (model) {
        thumbScene.remove(model);
      }
    }
  }).catch(() => null);
  return thumbQueue;
}

export function ChassisThumb({ ch }) {
  const [src, setSrc] = useState(null);
  useEffect(() => {
    let live = true;
    renderChassisThumbUrl(ch).then((url) => { if (live && url) setSrc(url); });
    return () => { live = false; };
  }, [ch.id, ch.primaryColor, ch.accentColor]);
  return (
    <span className="bb-chassis-thumb">
      {src
        ? <img src={src} alt="" draggable={false} />
        : <span className="bb-chassis-icon">{ch.icon}</span>}
    </span>
  );
}

function ChassisCard({ ch, active, onClick }) {
  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ partType: 'chassis', id: ch.id }));
    e.dataTransfer.setData('bb/chassis', '1');
    e.dataTransfer.effectAllowed = 'copy';
  };
  return (
    <button
      type="button"
      className={`bb-chassis-card${active ? ' selected' : ''}`}
      onClick={onClick}
      draggable
      onDragStart={handleDragStart}
      title={ch.desc || ch.name}
    >
      <ChassisThumb ch={ch} />
      <span className="bb-chassis-name">{ch.name}</span>
    </button>
  );
}

// ─── Body Size Picker ──────────────────────────────────────────────────────
function BodySizePicker({ bodySize, onChange }) {
  const sizes = [
    { id: 'S', label: 'Small', desc: 'Lighter · Faster · Less durable', spd: '+15%', wt: '−30%' },
    { id: 'M', label: 'Medium', desc: 'Balanced — recommended', spd: '—',    wt: '—'     },
    { id: 'L', label: 'Large',  desc: 'Heavier · Slower · More durable', spd: '−15%', wt: '+40%' },
  ];
  return (
    <div style={{ padding: '8px 0 4px' }}>
      <p className="bb-studio-section-label" style={{ marginBottom: 6 }}>Body Size</p>
      <div style={{ display: 'flex', gap: 6 }}>
        {sizes.map(s => (
          <button key={s.id} onClick={() => onChange(s.id)}
            title={s.desc}
            style={{
              flex: 1, padding: '8px 4px', borderRadius: 10, cursor: 'pointer',
              border: `2px solid ${bodySize === s.id ? '#7c3aed' : '#e0e0e0'}`,
              background: bodySize === s.id ? 'rgba(124,58,237,0.10)' : '#fafafa',
              color: bodySize === s.id ? '#7c3aed' : '#666',
              fontWeight: bodySize === s.id ? 800 : 600,
              fontSize: 11, transition: 'all 0.15s',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            }}>
            <span style={{ fontSize: 16 }}>
              <IconText>{s.id === 'S' ? '🤏' : s.id === 'M' ? '👐' : '🤲'}</IconText>
            </span>
            <span>{s.label}</span>
            <span style={{ fontSize: 9, opacity: 0.7, fontWeight: 400 }}>Spd {s.spd}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Color Toolbar (always-visible in viewport) ────────────────────────────
function ColorToolbar({ robotConfig, setRobotConfig }) {
  const [slot, setSlot] = useState('primaryColor');

  const COLOR_DEFS = [
    { key: 'primaryColor', label: 'Body',   def: '#FF8C00' },
    { key: 'accentColor',  label: 'Accent', def: '#FFD700' },
    { key: 'trimColor',    label: 'Trim',   def: '#FFD700' },
    { key: 'wheelColor',   label: 'Wheel',  def: '#1a1a1a' },
    { key: 'ledColor',     label: 'LED',    def: '#00D9FF' },
  ];

  const swatches = slot === 'wheelColor' ? WHEEL_COLORS
    : slot === 'ledColor' ? LED_COLORS
    : PALETTE_CLASSIC;
  const current = robotConfig[slot] || COLOR_DEFS.find((d) => d.key === slot)?.def || '#FF8C00';

  const paint = (c) => {
    setRobotConfig((prev) => {
      const next = { ...prev, [slot]: c };
      if (slot === 'primaryColor') next.accentColor = c;
      return next;
    });
  };

  return (
    <div className="bb-color-toolbar">
      <span className="bb-color-toolbar-label">Paint</span>
      <div className="bb-color-slots">
        {COLOR_DEFS.map(({ key, label, def }) => {
          const value = robotConfig[key] || def;
          return (
            <button
              key={key}
              type="button"
              className={`bb-color-slot${slot === key ? ' active' : ''}`}
              onClick={() => setSlot(key)}
              title={label}
            >
              <span className="bb-color-slot-dot" style={{ background: value }} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
      <div className="bb-color-swatches">
        {swatches.map((c) => (
          <button
            key={c}
            type="button"
            className={`bb-color-chip${current.toLowerCase() === c.toLowerCase() ? ' active' : ''}`}
            style={{ background: c }}
            title={c}
            onClick={() => paint(c)}
          />
        ))}
        <label className="bb-color-chip bb-color-chip--custom" title="Any colour">
          <input type="color" value={/^#[0-9a-f]{6}$/i.test(current) ? current : '#FF8C00'} onChange={(e) => paint(e.target.value)} />
        </label>
      </div>
    </div>
  );
}

/** Plant robot on y=0 and point the studio camera at its visual center. */
function frameStudioRobot(model, camera) {
  if (!model || !camera) return;
  if (typeof model.userData.animate === 'function') model.userData.animate(0);

  const box = new THREE.Box3().setFromObject(model);
  if (box.isEmpty()) return;

  model.position.y -= box.min.y;

  box.setFromObject(model);
  const center = new THREE.Vector3();
  const size = new THREE.Vector3();
  box.getCenter(center);
  box.getSize(size);

  const midY = center.y;
  const span = Math.max(size.x, size.y, size.z, 1);
  const dist = Math.max(3.4, span * 2.15);

  camera.position.set(dist * 0.55, midY + dist * 0.38, dist * 0.85);
  camera.lookAt(0, midY, 0);
}

// ─── Stage motion helpers ───────────────────────────────────────────────────
// Robots that float above the stage instead of standing on it.
const HOVER_CHASSIS = /drone|helicopter|hover|jet|aerobat|submarine|deepsea/;
// Robots whose rotors push air down onto the stage.
const ROTOR_CHASSIS = /drone|helicopter|hover/;
const GRAVITY = 26;
const IDLE_SPIN = 0.28;              // rad/s turntable speed when untouched
const ANIM_STEP = 1 / 60;            // robot rigs were authored for 60 fps steps
const CAM_AZIMUTH = Math.atan2(0.55, 0.85);
const CAM_ELEVATION = Math.atan2(0.38, Math.hypot(0.55, 0.85));
const CAM_RADIUS = Math.hypot(0.55, 0.38, 0.85);

function radialTexture(inner, outer) {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 128;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

/** Measure a freshly built (unparented) robot in its rest pose. */
function measureStudioRobot(model) {
  if (typeof model.userData.animate === 'function') model.userData.animate(0);
  const box = new THREE.Box3().setFromObject(model);
  if (box.isEmpty()) return { floor: 0, height: 1, footprint: 1, span: 1 };
  const size = box.getSize(new THREE.Vector3());
  return {
    floor: -box.min.y,
    height: size.y,
    footprint: Math.max(size.x, size.z, 0.4),
    span: Math.max(size.x, size.y, size.z, 1),
  };
}

/** Damped spring toward `target`; underdamped springs give the cartoon wobble. */
function stepSpring(s, target, stiffness, damping, dt) {
  s.v += ((target - s.x) * stiffness - s.v * damping) * dt;
  s.x += s.v * dt;
}

// ─── 3D Viewer ─────────────────────────────────────────────────────────────
function RobotCanvas({ robotConfig, onRobotClick, onDrop, children }) {
  const wrapRef  = useRef(null);
  const rigRef   = useRef(null);   // stage rig shared between the init and rebuild effects
  const clickRef = useRef(onRobotClick);
  clickRef.current = onRobotClick;

  // Init scene once per key-mount
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    let renderer = null;
    let raf = 0;
    try {

    const W = Math.max(el.clientWidth, 1);
    const H = Math.max(el.clientHeight, 1);
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    // ── Scene: LIGHT background ─────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f2f8);
    scene.fog = new THREE.Fog(0xf0f2f8, 22, 50);

    // ── Environment map for metallic reflections ─────────────────────────
    const envCanvas = document.createElement('canvas');
    envCanvas.width = 512; envCanvas.height = 256;
    const envCtx = envCanvas.getContext('2d');
    const envGrad = envCtx.createLinearGradient(0, 0, 0, 256);
    envGrad.addColorStop(0.0, '#a0b8e0');
    envGrad.addColorStop(0.35, '#d8e8ff');
    envGrad.addColorStop(0.5, '#f4f6ff');
    envGrad.addColorStop(0.65, '#d0d8ec');
    envGrad.addColorStop(1.0, '#889aae');
    envCtx.fillStyle = envGrad; envCtx.fillRect(0, 0, 512, 256);
    envCtx.strokeStyle = 'rgba(255,255,255,0.08)'; envCtx.lineWidth = 1;
    for (let x = 0; x < 512; x += 64) {
      envCtx.beginPath(); envCtx.moveTo(x, 0); envCtx.lineTo(x, 110); envCtx.stroke();
    }
    envCtx.fillStyle = 'rgba(255,255,255,0.28)';
    envCtx.fillRect(0, 108, 512, 40);
    const envTex = new THREE.CanvasTexture(envCanvas);
    envTex.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = envTex;

    // Camera
    const camera = new THREE.PerspectiveCamera(46, W / H, 0.1, 80);
    camera.position.set(2.4, 2.0, 3.6);
    camera.lookAt(0, 0.4, 0);

    // Renderer — high quality settings, never throw if GPU/WebGL is blocked
    const device = getStudioDeviceProfile();
    renderer = createSimWebGLRenderer({ antialias: !device.lowPower });
    if (!renderer) throw new Error('Error creating WebGL context.');
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, device.maxPixelRatio || 1.25));
    renderer.shadowMap.enabled = !device.lowPower;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace || 'srgb';
    el.appendChild(renderer.domElement);

    // ── Lights: professional studio 3-point lighting ──────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    scene.add(new THREE.HemisphereLight(0xd0e8ff, 0xd8e0f0, 0.5));
    const sun = new THREE.DirectionalLight(0xfff4e0, 1.8);
    sun.position.set(6, 10, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -5; sun.shadow.camera.right = 5;
    sun.shadow.camera.top = 5;   sun.shadow.camera.bottom = -5;
    sun.shadow.bias = -0.0002;
    sun.shadow.radius = 4;
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xc8e0ff, 0.6);
    fill.position.set(-6, 5, -3);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xc0a0ff, 0.5);
    rim.position.set(0, 3, -8);
    scene.add(rim);
    const bounce = new THREE.DirectionalLight(0xfff0d8, 0.2);
    bounce.position.set(0, -4, 2);
    scene.add(bounce);

    // ── Turntable stage: gives the robot a floor to stand and land on ─────
    const disposables = [];
    const own = (x) => { disposables.push(x); return x; };
    const stage = new THREE.Group();
    const deck = new THREE.Mesh(
      own(new THREE.CylinderGeometry(1, 1.02, 0.1, 72)),
      own(new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6, metalness: 0.02 })),
    );
    deck.position.y = -0.05;
    deck.receiveShadow = true;
    const plinth = new THREE.Mesh(
      own(new THREE.CylinderGeometry(1.05, 1.12, 0.16, 72)),
      own(new THREE.MeshStandardMaterial({ color: 0xd9def0, roughness: 0.7 })),
    );
    plinth.position.y = -0.18;
    const trim = new THREE.Mesh(
      own(new THREE.CylinderGeometry(1.035, 1.035, 0.035, 72, 1, true)),
      own(new THREE.MeshBasicMaterial({ color: 0xa78bfa, transparent: true, opacity: 0.45 })),
    );
    trim.position.y = -0.085;
    stage.add(deck, plinth, trim);
    scene.add(stage);

    // Soft contact shadow — shrinks and fades as the robot leaves the floor
    const blob = new THREE.Mesh(
      own(new THREE.PlaneGeometry(1, 1)),
      own(new THREE.MeshBasicMaterial({
        map: own(radialTexture('rgba(40,30,80,0.6)', 'rgba(40,30,80,0)')),
        transparent: true, depthWrite: false,
      })),
    );
    blob.rotation.x = -Math.PI / 2;
    blob.position.y = 0.003;
    blob.renderOrder = 1;
    scene.add(blob);

    // ── Dust puffs: pooled sprites that bloom outward and fade ─────────────
    const puffTex = own(radialTexture('rgba(255,255,255,1)', 'rgba(255,255,255,0)'));
    const puffs = [];
    for (let i = 0; i < 40; i++) {
      const mat = own(new THREE.SpriteMaterial({ map: puffTex, color: 0xfffaf2, transparent: true, depthWrite: false, opacity: 0 }));
      const sprite = new THREE.Sprite(mat);
      sprite.visible = false;
      scene.add(sprite);
      puffs.push({ sprite, life: 0, max: 1, size: 0.2, v: new THREE.Vector3() });
    }
    const emitPuff = (x, y, z, vx, vy, vz, size, life) => {
      const p = puffs.find((q) => q.life <= 0);
      if (!p) return;
      p.sprite.position.set(x, y, z);
      p.v.set(vx, vy, vz);
      p.size = size; p.life = life; p.max = life;
      p.sprite.visible = true;
    };
    const puffRing = (radius, count, speed = 1.6, size = 0.26) => {
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + Math.random() * 0.4;
        emitPuff(
          Math.cos(a) * radius, 0.05, Math.sin(a) * radius,
          Math.cos(a) * speed * (0.7 + Math.random() * 0.5), 0.4 + Math.random() * 0.5, Math.sin(a) * speed * (0.7 + Math.random() * 0.5),
          size * (0.8 + Math.random() * 0.5), 0.45 + Math.random() * 0.25,
        );
      }
    };
    const updatePuffs = (dt) => {
      const drag = Math.exp(-3.5 * dt);
      for (const p of puffs) {
        if (p.life <= 0) continue;
        p.life -= dt;
        if (p.life <= 0) { p.sprite.visible = false; continue; }
        const k = 1 - p.life / p.max;
        p.sprite.position.addScaledVector(p.v, dt);
        p.v.multiplyScalar(drag);
        p.sprite.scale.setScalar(p.size * (0.55 + k * 1.3));
        p.sprite.material.opacity = Math.pow(1 - k, 1.6) * 0.8;
      }
    };

    // ── Robot rig ─────────────────────────────────────────────────────────
    // pivot (turntable yaw) → lift (height, hop spin) → squash (scale about the
    // feet) → ground (keeps feet on y=0) → model. The robot's own animate()
    // may move the model freely without undoing the floor offset.
    const pivot  = new THREE.Group();
    const lift   = new THREE.Group();
    const squash = new THREE.Group();
    const ground = new THREE.Group();
    pivot.add(lift); lift.add(squash); squash.add(ground);
    scene.add(pivot);

    const motion = {
      y: 0, vy: 0, airborne: false, crouch: 0,
      sq: { x: 0, v: 0 }, spin: { x: 0, v: 0 }, spinTarget: 0,
      hover: false, rotor: false, hoverH: 0, footprint: 1,
    };
    const frame = { dist: 4, midY: 0.5, targetDist: 4, targetMidY: 0.5 };
    let model = null;
    let chassisId = null;
    let animAcc = 0;
    let animT = 0;
    let washTimer = 0;

    const setModel = (next) => {
      if (model) ground.remove(model);
      const m = measureStudioRobot(next);
      const nextId = next.userData.chassisId || '';
      const isNewChassis = nextId !== chassisId;
      model = next;
      chassisId = nextId;
      animT = 0; animAcc = 0;
      ground.position.y = m.floor;
      ground.add(next);

      motion.hover = HOVER_CHASSIS.test(nextId);
      motion.rotor = ROTOR_CHASSIS.test(nextId);
      motion.hoverH = motion.hover ? Math.min(0.6, Math.max(0.3, m.height * 0.35)) : 0;
      motion.footprint = m.footprint;

      const radius = Math.min(2.8, Math.max(1.15, m.footprint * 0.78));
      stage.scale.set(radius, 1, radius);
      frame.targetMidY = m.height / 2 + motion.hoverH;
      frame.targetDist = Math.max(3.4, Math.max(m.span, radius * 1.6) * 2.15);
      if (next.userData.envTex) scene.environment = next.userData.envTex;

      if (reduceMotion) return;
      if (isNewChassis) {
        // Drop in from above and land with a squash ("boing")
        motion.y = 1.4 + m.height * 0.5;
        motion.vy = 0;
        motion.airborne = true;
        motion.crouch = 0;
        motion.sq.x = -0.18; motion.sq.v = 0;
      } else {
        // Same robot, new paint or parts: a happy wiggle
        motion.sq.v += 3.2;
        puffRing(m.footprint * 0.45, 6, 1.1, 0.18);
      }
    };

    const hop = () => {
      if (reduceMotion || motion.airborne || motion.crouch > 0) return;
      motion.crouch = 0.09; // brief anticipation squat before the jump
    };

    rigRef.current = { setModel };

    // ── Raycaster for robot-click ─────────────────────────────────────────
    const raycaster = new THREE.Raycaster();
    const mouse     = new THREE.Vector2();
    let dragDistance = 0;

    const handleClick = (e) => {
      if (dragDistance > 6 || !model) return; // it was a drag, not a click
      const rect = el.getBoundingClientRect();
      mouse.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      mouse.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObject(model, true);
      if (!hits.length) return;
      hop();
      const mesh = hits[0].object;
      const mat = mesh.material;
      if (mat?.emissive && !mesh.userData.flashing) {
        const prevColor = mat.emissive.getHex();
        const prevIntensity = mat.emissiveIntensity;
        mesh.userData.flashing = true;
        mat.emissive.set(0xffffff);
        mat.emissiveIntensity = Math.max(prevIntensity, 0.45);
        setTimeout(() => {
          mat.emissive.setHex(prevColor);
          mat.emissiveIntensity = prevIntensity;
          mesh.userData.flashing = false;
        }, 160);
      }
      // Let the hop read before the coding panel opens over it
      setTimeout(() => clickRef.current?.(), reduceMotion ? 0 : 240);
    };
    el.addEventListener('click', handleClick);

    // ── ResizeObserver ─────────────────────────────────────────────────────
    const onResize = () => {
      const w = Math.max(el.clientWidth, 1);
      const h = Math.max(el.clientHeight, 1);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(el);

    // ── Orbit drag with inertia (mouse, pen and touch) ────────────────────
    let dragging = false, lastX = 0, lastY = 0, lastMoveAt = 0;
    let yaw = 0.5, yawVel = IDLE_SPIN, pitch = 0;
    const onPointerDown = (e) => {
      dragging = true;
      dragDistance = 0;
      lastX = e.clientX; lastY = e.clientY;
      lastMoveAt = performance.now();
      yawVel = 0;
    };
    const onPointerMove = (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      const now = performance.now();
      const dt = Math.max((now - lastMoveAt) / 1000, 1 / 240);
      yaw += dx * 0.012;
      yawVel = yawVel * 0.4 + (dx * 0.012 / dt) * 0.6;
      pitch = Math.max(-0.25, Math.min(0.5, pitch + dy * 0.006));
      dragDistance += Math.abs(dx) + Math.abs(dy);
      lastX = e.clientX; lastY = e.clientY; lastMoveAt = now;
    };
    const onPointerUp = () => {
      if (!dragging) return;
      dragging = false;
      if (performance.now() - lastMoveAt > 80) yawVel = 0; // held still before release
      yawVel = Math.max(-9, Math.min(9, yawVel));
    };
    el.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    // ── Animation ──────────────────────────────────────────────────────────
    const clock = new THREE.Clock();
    let t = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(clock.getDelta(), 1 / 20);
      t += dt;

      // Turntable: flick inertia settles back into the slow idle spin
      if (!dragging) {
        const idle = reduceMotion ? IDLE_SPIN * 0.3 : IDLE_SPIN;
        yawVel = idle + (yawVel - idle) * Math.exp(-2.4 * dt);
        yaw += yawVel * dt;
      }
      pivot.rotation.y = yaw;

      // Anticipation squat → launch with a stretch and a full spin
      if (motion.crouch > 0) {
        motion.crouch -= dt;
        if (motion.crouch <= 0) {
          motion.crouch = 0;
          motion.airborne = true;
          motion.vy = 6.4;
          motion.sq.v -= 4;
          motion.spinTarget += Math.PI * 2;
          puffRing(motion.footprint * 0.4, 5, 1.2, 0.18);
        }
      }

      // Jump / drop physics with a bouncy landing
      if (motion.airborne) {
        motion.vy -= GRAVITY * dt;
        motion.y += motion.vy * dt;
        if (motion.y <= 0 && motion.vy < 0) {
          const impact = -motion.vy;
          motion.y = 0;
          motion.sq.v += impact * 0.6;
          if (impact > 3.5) {
            motion.vy = impact * 0.3;           // one little bounce
          } else {
            motion.vy = 0;
            motion.airborne = false;
          }
          if (impact > 2) {
            if (motion.hover) puffRing(motion.footprint * 0.5, 6, 1.3, 0.2);
            else puffRing(motion.footprint * 0.5, Math.min(14, Math.round(4 + impact)), 1.8, 0.26);
          }
        }
      }

      // Squash & stretch: breathing idle + crouch + velocity stretch
      const breath = motion.hover || reduceMotion ? 0 : Math.sin(t * 2.4) * 0.014;
      stepSpring(motion.sq, breath + (motion.crouch > 0 ? 0.17 : 0), 340, 12, dt);
      const stretch = motion.airborne ? Math.max(-0.12, Math.min(0.14, motion.vy * 0.018)) : 0;
      const s = Math.max(-0.3, Math.min(0.32, motion.sq.x - stretch));
      squash.scale.set(1 + s * 0.55, 1 - s, 1 + s * 0.55);

      // Hop spin with a slight overshoot wobble
      stepSpring(motion.spin, motion.spinTarget, 70, 11, dt);
      lift.rotation.y = motion.spin.x;

      // Hover robots float; ground robots stay planted
      const bob = motion.hover && !reduceMotion ? Math.sin(t * 1.7) * 0.06 : 0;
      lift.position.y = motion.hoverH + bob + motion.y;

      // Contact shadow follows height and squash
      const h = lift.position.y;
      const shadowSize = motion.footprint * 1.15 * (1 + Math.max(0, s) * 0.5) / (1 + h * 0.8);
      blob.scale.set(shadowSize, shadowSize, 1);
      blob.material.opacity = 0.85 / (1 + h * 1.6);

      // Rotor downwash kicks up dust under hovering rotor robots
      if (motion.rotor && !reduceMotion) {
        washTimer += dt;
        if (washTimer > 0.1) {
          washTimer = 0;
          const a = Math.random() * Math.PI * 2;
          const r = motion.footprint * 0.3;
          emitPuff(Math.cos(a) * r, 0.04, Math.sin(a) * r, Math.cos(a) * 1.3, 0.12, Math.sin(a) * 1.3, 0.15, 0.6);
        }
      }

      // Robot rigs advance in fixed 60 Hz steps so they look the same on any display
      if (model?.userData.animate) {
        animAcc += dt;
        let steps = 0;
        while (animAcc >= ANIM_STEP && steps < 4) {
          animT += ANIM_STEP;
          model.userData.animate(animT);
          animAcc -= ANIM_STEP;
          steps++;
        }
        if (steps === 4) animAcc = 0;
      }

      updatePuffs(dt);

      // Camera eases between robot sizes; vertical drag orbits the camera, not the robot
      const ease = 1 - Math.exp(-5 * dt);
      frame.dist += (frame.targetDist - frame.dist) * ease;
      frame.midY += (frame.targetMidY - frame.midY) * ease;
      const elev = CAM_ELEVATION + pitch;
      const r = frame.dist * CAM_RADIUS;
      camera.position.set(
        Math.sin(CAM_AZIMUTH) * Math.cos(elev) * r,
        frame.midY + Math.sin(elev) * r,
        Math.cos(CAM_AZIMUTH) * Math.cos(elev) * r,
      );
      camera.lookAt(0, frame.midY, 0);

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      rigRef.current = null;
      el.removeEventListener('click', handleClick);
      el.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      cancelAnimationFrame(raf);
      ro.disconnect();
      disposables.forEach((d) => d.dispose());
      envTex.dispose();
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
      renderer.dispose();
    };
    } catch (err) {
      console.warn('[BuildPage 3D]', err);
      cancelAnimationFrame(raf);
      try { renderer?.dispose(); } catch { /* ignore */ }
      el.replaceChildren();
      const fallback = document.createElement('div');
      fallback.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:28px;text-align:center;color:#334155;font-family:system-ui,sans-serif;gap:10px;background:#f0f2f8';
      fallback.innerHTML = '<div style="font-size:42px">🤖</div><div style="font-weight:800;font-size:16px">Open this page in Chrome</div><div style="font-size:13px;max-width:280px;line-height:1.5">The 3D robot view needs a full browser window — not a preview pane.</div>';
      el.appendChild(fallback);
      return undefined;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Rebuild robot model when config changes
  useEffect(() => {
    let cancelled = false;
    let retry = 0;
    const run = () => {
      if (cancelled) return;
      const rig = rigRef.current;
      if (!rig) {
        retry = requestAnimationFrame(run);
        return;
      }
      const model = buildRobotModel(normalizeRobotBuildConfig(robotConfig));
      applyStudioPaint(
        model,
        robotConfig.primaryColor,
        robotConfig.accentColor,
        robotConfig.wheelColor,
      );
      rig.setModel(model);
    };
    run();
    return () => { cancelled = true; cancelAnimationFrame(retry); };
  }, [robotConfig]);

  return (
    <div ref={wrapRef} className="bb-studio-canvas-wrap" style={{ cursor: 'pointer', touchAction: 'none' }} onDrop={onDrop}>
      {children}
    </div>
  );
}


// ─── Left Panel ────────────────────────────────────────────────────────────
function LeftPanel({ robotConfig, setRobotConfig, activeRobotId, setActiveRobotId, customParts = [], onGoCreate, onSimulate, onSaveDesign, onFootballLaunch }) {
  const [activeCat, setActiveCat] = useState('body');
  const [search, setSearch]       = useState('');
  const [showMoreChassis, setShowMoreChassis] = useState(() => !isStarterChassis(robotConfig?.chassisId));

  useEffect(() => {
    if (robotConfig?.chassisId && !isStarterChassis(robotConfig.chassisId)) {
      setShowMoreChassis(true);
    }
  }, [robotConfig?.chassisId]);

  const toggleSensor = (id) =>
    setRobotConfig(prev => ({
      ...prev,
      sensors: prev.sensors.includes(id)
        ? prev.sensors.filter(s => s !== id)
        : [...prev.sensors, id],
    }));

  const toggleTool = (id) =>
    setRobotConfig(prev => ({
      ...prev,
      tools: prev.tools.includes(id)
        ? prev.tools.filter(t => t !== id)
        : [...prev.tools, id],
    }));

  const toggleStructural = (id) =>
    setRobotConfig(prev => {
      const cur = prev.structParts || [];
      return { ...prev, structParts: cur.includes(id) ? cur.filter(s => s !== id) : [...cur, id] };
    });

  const toggleDeco = (id) =>
    setRobotConfig(prev => {
      const cur = prev.decoParts || [];
      return { ...prev, decoParts: cur.includes(id) ? cur.filter(d => d !== id) : [...cur, id] };
    });

  const toggleLego = (id) =>
    setRobotConfig(prev => {
      const cur = prev.legoParts || [];
      return { ...prev, legoParts: cur.includes(id) ? cur.filter(l => l !== id) : [...cur, id] };
    });

  const customTile = (catLabel) => (
    <PartTile
      key="__custom__"
      id="__custom__"
      icon="✨"
      name="Create Custom"
      desc={`Design your own ${catLabel}`}
      bg="#f0eeff"
      accent="#7c3aed"
      isCustom
      onClick={onGoCreate}
    />
  );

  const renderParts = () => {
    const q = search.toLowerCase();
    switch (activeCat) {
      case 'body': {
        const customChassis = customParts.filter(p => p.type === 'chassis');
        const allChassis = [...CHASSIS_DATA.filter((c) => !RETIRED_CHASSIS_IDS.has(c.id)), ...customChassis.map(c => ({
          id: c.id, name: c.name, icon: '✨', badge: 'Custom',
          primaryColor: c.color, accentColor: c.color,
          speed: 70, power: 70, durability: 70,
          bgGrad: [`${c.color}33`, `${c.color}11`],
          isCustom: true,
        }))];
        const filtered = allChassis.filter(c => !q || c.name.toLowerCase().includes(q));
        const { starters, more } = partitionByStarterIds(filtered, (c) => c.id, STARTER_CHASSIS_IDS);
        const searching = Boolean(q);
        const showExtras = searching || showMoreChassis;
        const extraGroups = searching ? [{ id: 'search', label: 'Matches', items: filtered }] : groupMoreChassis(more);

        // A robot made in Create Studio is not one of these pre-built robots
        const usingCreated = isCreatedRobot(robotConfig);
        const pickChassis = (ch) => {
          if (ch.id === 'footballbot' && onFootballLaunch) {
            onFootballLaunch();
            return;
          }
          setRobotConfig((prev) => {
            const next = {
              ...asPrebuiltRobot(prev),
              chassisId: ch.id,
              name: getPrimaryRobotDisplay(ch.id).name,
              primaryColor: ch.primaryColor || prev.primaryColor,
              accentColor: ch.accentColor || prev.accentColor,
              movementId: ({
                wheels: 'wheels', wheels6: 'wheels6', tracks: 'tracks',
                legs: 'legs', flying: 'flying', hover: 'flying', swim: 'flying', jets: 'jets',
              }[ch.movementHint] || prev.movementId),
              socketAttachments: {},
            };
            delete next.chassisBuildKey;
            // A prebuilt robot is a different robot: drop the custom design (or it keeps
            // drawing the designed model) and the saved id (or Save would overwrite it)
            delete next.design;
            delete next.id;
            return next;
          });
        };

        const renderCards = (list) => list.map((ch) => (
          <ChassisCard
            key={ch.id}
            ch={ch}
            active={!usingCreated && robotConfig.chassisId === ch.id}
            onClick={() => pickChassis(ch)}
          />
        ));

        return (
          <>
            {usingCreated && (
              <div className="bb-created-note">
                <span><b>{robotConfig.name || 'Your robot'}</b> is a robot you built. Pick a robot below to switch to it.</span>
                <button type="button" onClick={onGoCreate}>Edit in Create</button>
              </div>
            )}
            <p className="bb-studio-section-label">Pick a robot</p>
            {!searching && (
              <div className="bb-chassis-grid">
                {renderCards(starters)}
                <button type="button" className="bb-chassis-card bb-chassis-card--create" onClick={onGoCreate}>
                  <span className="bb-chassis-thumb bb-chassis-thumb--create"><EmojiIcon e="✨" /></span>
                  <span className="bb-chassis-name">Create Custom</span>
                </button>
              </div>
            )}
            {more.length > 0 && !searching && (
              <button
                type="button"
                className="bb-chassis-more-btn"
                onClick={() => setShowMoreChassis((v) => !v)}
                aria-expanded={showMoreChassis}
              >
                {showMoreChassis ? 'Hide extra robots' : `More robots (${more.length})`}
              </button>
            )}
            {showExtras && extraGroups.map((group) => (
              <div key={group.id} className="bb-chassis-family">
                <p className="bb-studio-section-label bb-chassis-family-label">{group.label}</p>
                <div className="bb-chassis-grid">
                  {renderCards(group.items)}
                </div>
              </div>
            ))}
            <div className="bb-paint-block">
              <p className="bb-studio-section-label">Paint your robot</p>
              <div className="bb-paint-dots">
                {PALETTE_CLASSIC.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`bb-paint-dot${(robotConfig.primaryColor || '').toLowerCase() === c.toLowerCase() ? ' active' : ''}`}
                    style={{ background: c }}
                    title={c}
                    onClick={() => setRobotConfig((prev) => ({
                      ...prev,
                      primaryColor: c,
                      accentColor: c,
                    }))}
                  />
                ))}
                <label className="bb-paint-custom" title="Pick any colour">
                  <input
                    type="color"
                    value={robotConfig.primaryColor || '#FF8C00'}
                    onChange={(e) => setRobotConfig((prev) => ({
                      ...prev,
                      primaryColor: e.target.value,
                      accentColor: e.target.value,
                    }))}
                  />
                </label>
              </div>
            </div>
            <BodySizePicker
              bodySize={robotConfig.bodySize || 'M'}
              onChange={size => setRobotConfig(prev => ({ ...prev, bodySize: size }))}
            />
          </>
        );
      }

      case 'movement': {
        const filtered = MOVEMENT_OPTS.filter(m => !q || m.name.toLowerCase().includes(q));
        return (
          <>
            <p className="bb-studio-section-label">Movement System</p>
            <div className="bb-pt-grid">
              {filtered.map(m => (
                <PartTile key={m.id} {...m} bg={m.bg} accent={m.accent}
                  partType="movement"
                  active={robotConfig.movementId === m.id}
                  onClick={() => setRobotConfig(prev => ({ ...prev, movementId: m.id }))}
                />
              ))}
              {customTile('movement system')}
            </div>
          </>
        );
      }

      case 'heads': {
        const filtered = HEADS_DATA.filter(h => !q || h.name.toLowerCase().includes(q));
        return (
          <>
            <p className="bb-studio-section-label">Head Type</p>
            <div className="bb-pt-grid">
              {filtered.map(h => {
                const m = PART_META[h.id] || {};
                return (
                  <PartTile key={h.id} id={h.id} icon={h.icon} name={h.name}
                    desc={m.desc} bg={m.bg} accent={m.accent || h.color}
                    partType="head"
                    active={robotConfig.headId === h.id}
                    onClick={() => setRobotConfig(prev => ({ ...prev, headId: prev.headId === h.id ? null : h.id }))}
                  />
                );
              })}
            </div>
          </>
        );
      }

      case 'sensors': {
        const customSensors = customParts.filter(p => p.type === 'sensor');
        const allSensors = [...SENSORS_DATA, ...customSensors.map(s => ({
          id: s.id, name: s.name, icon: '✨', color: s.color || '#7c3aed', isCustom: true,
        }))];
        const filtered = allSensors.filter(s => !q || s.name.toLowerCase().includes(q));
        return (
          <>
            <p className="bb-studio-section-label">Sensors</p>
            <div className="bb-pt-grid">
              {filtered.map(s => {
                const m = PART_META[s.id] || {};
                return (
                  <PartTile key={s.id} id={s.id} icon={s.icon} name={s.name}
                    desc={m.desc || (s.isCustom ? 'Custom sensor' : '')}
                    bg={m.bg || '#f0eeff'} accent={m.accent || s.color}
                    partType="sensor"
                    active={robotConfig.sensors.includes(s.id)}
                    isCustom={s.isCustom}
                    onClick={() => toggleSensor(s.id)}
                  />
                );
              })}
              {customTile('sensor')}
            </div>
          </>
        );
      }

      case 'arms': {
        const filtered = ARMS_DATA.filter(a => !q || a.name.toLowerCase().includes(q));
        return (
          <>
            <p className="bb-studio-section-label">Arms & Manipulators</p>
            <div className="bb-pt-grid">
              {filtered.map(a => {
                const m = PART_META[a.id] || {};
                return (
                  <PartTile key={a.id} id={a.id} icon={a.icon} name={a.name}
                    desc={m.desc} bg={m.bg} accent={m.accent || a.color}
                    partType="arm"
                    active={robotConfig.armId === a.id}
                    onClick={() => setRobotConfig(prev => ({ ...prev, armId: prev.armId === a.id ? null : a.id }))}
                  />
                );
              })}
              {customTile('arm')}
            </div>
          </>
        );
      }

      case 'tools': {
        const filtered = TOOLS_DATA.filter(t => !q || t.name.toLowerCase().includes(q));
        return (
          <>
            <p className="bb-studio-section-label">Tools</p>
            <div className="bb-pt-grid">
              {filtered.map(t => {
                const m = PART_META[t.id] || {};
                return (
                  <PartTile key={t.id} id={t.id} icon={t.icon} name={t.name}
                    desc={m.desc} bg={m.bg} accent={m.accent || t.color}
                    partType="tool"
                    active={robotConfig.tools.includes(t.id)}
                    onClick={() => toggleTool(t.id)}
                  />
                );
              })}
              {customTile('tool')}
            </div>
          </>
        );
      }

      case 'power': {
        const filtered = POWER_DATA.filter(p => !q || p.name.toLowerCase().includes(q));
        return (
          <>
            <p className="bb-studio-section-label">Power Source</p>
            <div className="bb-pt-grid">
              {filtered.map(p => {
                const m = PART_META[p.id] || {};
                return (
                  <PartTile key={p.id} id={p.id} icon={p.icon} name={p.name}
                    desc={m.desc} bg={m.bg} accent={m.accent || p.color}
                    partType="power"
                    active={robotConfig.powerId === p.id}
                    onClick={() => setRobotConfig(prev => ({ ...prev, powerId: p.id }))}
                  />
                );
              })}
            </div>
          </>
        );
      }

      case 'lights': {
        const filtered = LIGHTS_DATA.filter(l => !q || l.name.toLowerCase().includes(q));
        return (
          <>
            <p className="bb-studio-section-label">Lighting</p>
            <div className="bb-pt-grid">
              {filtered.map(l => {
                const m = PART_META[l.id] || {};
                return (
                  <PartTile key={l.id} id={l.id} icon={l.icon} name={l.name}
                    desc={m.desc} bg={m.bg} accent={m.accent || l.color}
                    partType="light"
                    active={robotConfig.lightId === l.id}
                    onClick={() => setRobotConfig(prev => ({ ...prev, lightId: prev.lightId === l.id ? null : l.id }))}
                  />
                );
              })}
            </div>
          </>
        );
      }
      case 'ai': {
        const filtered = AI_DATA.filter(a => !q || a.name.toLowerCase().includes(q));
        return (
          <>
            <p className="bb-studio-section-label">AI Brain &amp; CPU</p>
            <div className="bb-pt-grid">
              {filtered.map(a => (
                <PartTile key={a.id} id={a.id} icon={a.icon} name={a.name}
                  desc={a.unlock}
                  bg={`${a.color}18`} accent={a.color}
                  partType="ai"
                  active={robotConfig.aiId === a.id}
                  onClick={() => setRobotConfig(prev => ({ ...prev, aiId: prev.aiId === a.id ? null : a.id }))}
                />
              ))}
            </div>
          </>
        );
      }

      case 'comm': {
        const filtered = COMM_DATA.filter(c => !q || c.name.toLowerCase().includes(q));
        return (
          <>
            <p className="bb-studio-section-label">Communication Systems</p>
            <div className="bb-pt-grid">
              {filtered.map(c => (
                <PartTile key={c.id} id={c.id} icon={c.icon} name={c.name}
                  desc={c.unlock}
                  bg={`${c.color}18`} accent={c.color}
                  partType="comm"
                  active={robotConfig.commId === c.id}
                  onClick={() => setRobotConfig(prev => ({ ...prev, commId: prev.commId === c.id ? null : c.id }))}
                />
              ))}
              {customTile('communication module')}
            </div>
          </>
        );
      }

      case 'structural': {
        const filtered = STRUCTURAL_DATA.filter(s => !q || s.name.toLowerCase().includes(q));
        return (
          <>
            <p className="bb-studio-section-label">Armor &amp; Structure</p>
            <div className="bb-pt-grid">
              {filtered.map(s => (
                <PartTile key={s.id} id={s.id} icon={s.icon} name={s.name}
                  desc={s.unlock}
                  bg={`${s.color}18`} accent={s.color}
                  partType="struct"
                  active={(robotConfig.structParts || []).includes(s.id)}
                  onClick={() => toggleStructural(s.id)}
                />
              ))}
            </div>
          </>
        );
      }

      case 'deco': {
        const filtered = DECO_DATA.filter(d => !q || d.name.toLowerCase().includes(q));
        return (
          <>
            <p className="bb-studio-section-label">Decoration &amp; Styling</p>
            <div className="bb-pt-grid">
              {filtered.map(d => (
                <PartTile key={d.id} id={d.id} icon={d.icon} name={d.name}
                  desc={d.unlock}
                  bg={`${d.color}18`} accent={d.color}
                  partType="deco"
                  active={(robotConfig.decoParts || []).includes(d.id)}
                  onClick={() => toggleDeco(d.id)}
                />
              ))}
            </div>
          </>
        );
      }

      case 'lego': {
        const filtered = LEGO_DATA.filter(l => !q || l.name.toLowerCase().includes(q));
        return (
          <>
            <p className="bb-studio-section-label">LEGO Mode Parts</p>
            <div className="bb-pt-grid">
              {filtered.map(l => (
                <PartTile key={l.id} id={l.id} icon={l.icon} name={l.name}
                  desc={l.unlock}
                  bg={`${l.color}18`} accent={l.color}
                  partType="lego"
                  active={(robotConfig.legoParts || []).includes(l.id)}
                  onClick={() => toggleLego(l.id)}
                />
              ))}
            </div>
            <p className="bb-studio-section-label" style={{ marginTop: 12 }}>Snap Blocks</p>
            <div className="bb-studio-blocks-grid" style={{ padding: '0 4px 8px' }}>
              {BLOCKS_DATA.map(b => (
                <div key={b.id} className="bb-studio-block-item" style={{ background: b.color }} title={b.label} />
              ))}
            </div>
          </>
        );
      }

      default: return null;
    }
  };

  return (
    <div className="bb-studio-left">
      {/* Header */}
      <div className="bb-studio-left-top">
        <div className="bb-studio-left-label"><EmojiIcon e="🔧" style={{ marginRight: '0.35em' }} />Build Your Robot</div>
        <input
          className="bb-studio-search"
          placeholder="Search parts..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Category pills */}
      <div className="bb-studio-cats">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`bb-studio-cat-btn ${activeCat === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCat(cat.id)}
          >
            <EmojiIcon e={cat.icon} />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Parts scroll area */}
      <div className="bb-studio-parts-scroll">
        {renderParts()}
      </div>

    </div>
  );
}

// ─── Color Section with tabs ────────────────────────────────────────────────
function ColorSection({ label, value, onChange, presets, swatches }) {
  const [paletteTab, setPaletteTab] = React.useState('classic');
  const palettes = { classic: PALETTE_CLASSIC, metallic: PALETTE_METALLIC, neon: PALETTE_NEON, dark: PALETTE_DARK };
  const currentPalette = presets || palettes[paletteTab];

  return (
    <div className="bb-studio-color-section">
      <div className="bb-studio-color-label">{label}</div>
      {!presets && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
          {[['classic','Classic'],['metallic','Metal'],['neon','Neon'],['dark','Dark']].map(([k,l]) => (
            <button key={k} onClick={() => setPaletteTab(k)}
              style={{
                fontSize: 9, padding: '2px 6px', borderRadius: 6, border: 'none',
                background: paletteTab === k ? '#7c3aed' : 'rgba(255,255,255,0.08)',
                color: paletteTab === k ? '#fff' : '#aaa',
                cursor: 'pointer', fontWeight: paletteTab === k ? 700 : 400,
              }}>{l}</button>
          ))}
        </div>
      )}
      <div className="bb-studio-colors" style={{ gap: 5 }}>
        {currentPalette.map(c => (
          <button key={c}
            className={`bb-studio-color-swatch ${value === c ? 'active' : ''}`}
            style={{ background: c, border: value === c ? `2px solid #fff` : c === '#FFFFFF' ? '1.5px solid #ddd' : 'none' }}
            onClick={() => onChange(c)}
            title={c}
          />
        ))}
        <input type="color" value={value} onChange={e => onChange(e.target.value)}
          style={{ width: 22, height: 22, padding: 0, border: 'none', borderRadius: 4, cursor: 'pointer', background: 'none' }}
          title="Custom color" />
      </div>
    </div>
  );
}

// ─── Right Panel ────────────────────────────────────────────────────────────
function RightPanel({ robotConfig, setRobotConfig, onSimulate, onSaveDesign, robotValidation }) {
  const chassis = CHASSIS_DATA.find(c => c.id === robotConfig.chassisId) || CHASSIS_DATA[0];

  // Validation notices (errors + warnings only)
  const notices = (robotValidation?.results || []).filter(
    r => r.severity === 'error' || r.severity === 'warning'
  );

  const removeSensor     = (id) => setRobotConfig(prev => ({ ...prev, sensors:       prev.sensors.filter(s => s !== id) }));
  const removeTool       = (id) => setRobotConfig(prev => ({ ...prev, tools:         prev.tools.filter(t => t !== id)   }));
  const removeHead       = ()   => setRobotConfig(prev => ({ ...prev, headId:        null }));
  const removeArm        = ()   => setRobotConfig(prev => ({ ...prev, armId:         null }));
  const removeLight      = ()   => setRobotConfig(prev => ({ ...prev, lightId:       null }));
  const removeAI         = ()   => setRobotConfig(prev => ({ ...prev, aiId:          null }));
  const removeComm       = ()   => setRobotConfig(prev => ({ ...prev, commId:        null }));
  const removeStructural = (id) => setRobotConfig(prev => ({ ...prev, structParts: (prev.structParts || []).filter(s => s !== id) }));
  const removeDeco       = (id) => setRobotConfig(prev => ({ ...prev, decoParts:       (prev.decoParts       || []).filter(d => d !== id) }));
  const removeLego       = (id) => setRobotConfig(prev => ({ ...prev, legoParts:       (prev.legoParts       || []).filter(l => l !== id) }));

  const powerEntry  = POWER_DATA.find(p => p.id === robotConfig.powerId);
  const aiEntry     = AI_DATA.find(a => a.id === robotConfig.aiId);
  const powerBoost  = powerEntry?.stat?.speed  ?? 0;
  const aiBoost     = aiEntry?.stat?.ai        ?? 0;
  const armorBoost  = (robotConfig.structParts || []).reduce((acc, id) => {
    const s = STRUCTURAL_DATA.find(x => x.id === id);
    return acc + (s?.stat?.armor ?? 0);
  }, 0);
  // Body size multipliers
  const sizeKey = robotConfig.bodySize || 'M';
  const sizeSpeedDelta = sizeKey === 'S' ? 15 : sizeKey === 'L' ? -15 : 0;
  const sizeDurDelta   = sizeKey === 'S' ? -15 : sizeKey === 'L' ? 20 : 0;
  const sizeWeightMult = sizeKey === 'S' ? 0.7 : sizeKey === 'L' ? 1.4 : 1.0;
  const sizeLabel      = sizeKey === 'S' ? '🤏 Small' : sizeKey === 'L' ? '🤲 Large' : '👐 Medium';

  const stats = {
    speed:      Math.min(chassis.speed + sizeSpeedDelta + (robotConfig.movementId === 'flying' ? 30 : robotConfig.movementId === 'jets' ? 50 : 0) + powerBoost, 100),
    power:      Math.min(chassis.power + (robotConfig.tools.length * 5) + (aiBoost > 0 ? Math.floor(aiBoost / 4) : 0), 100),
    durability: Math.min(chassis.durability + sizeDurDelta + Math.floor(armorBoost / 2), 100),
    ai:         Math.min(aiBoost, 100),
    weight:     (() => {
      const w = Math.round(parseWeightKg(chassis?.weight) * sizeWeightMult * 10) / 10;
      return Number.isFinite(w) ? w : 2.0;
    })(),
  };

  // Build full installed-parts list with remove callbacks
  const installedParts = [
    ...robotConfig.sensors.map(id => {
      const s = SENSORS_DATA.find(x => x.id === id);
      return s ? { ...s, onRemove: () => removeSensor(id) } : null;
    }),
    ...robotConfig.tools.map(id => {
      const t = TOOLS_DATA.find(x => x.id === id);
      return t ? { ...t, onRemove: () => removeTool(id) } : null;
    }),
    ...(robotConfig.headId ? (() => {
      const h = HEADS_DATA.find(x => x.id === robotConfig.headId);
      return h ? [{ ...h, onRemove: removeHead }] : [];
    })() : []),
    ...(robotConfig.armId ? (() => {
      const a = ARMS_DATA.find(x => x.id === robotConfig.armId);
      return a ? [{ ...a, onRemove: removeArm }] : [];
    })() : []),
    ...(robotConfig.lightId ? (() => {
      const l = LIGHTS_DATA.find(x => x.id === robotConfig.lightId);
      return l ? [{ ...l, onRemove: removeLight }] : [];
    })() : []),
    ...(robotConfig.aiId ? (() => {
      const a = AI_DATA.find(x => x.id === robotConfig.aiId);
      return a ? [{ ...a, onRemove: removeAI }] : [];
    })() : []),
    ...(robotConfig.commId ? (() => {
      const c = COMM_DATA.find(x => x.id === robotConfig.commId);
      return c ? [{ ...c, onRemove: removeComm }] : [];
    })() : []),
    ...(robotConfig.structParts || []).map(id => {
      const s = STRUCTURAL_DATA.find(x => x.id === id);
      return s ? { ...s, onRemove: () => removeStructural(id) } : null;
    }),
    ...(robotConfig.decoParts || []).map(id => {
      const d = DECO_DATA.find(x => x.id === id);
      return d ? { ...d, onRemove: () => removeDeco(id) } : null;
    }),
    ...(robotConfig.legoParts || []).map(id => {
      const l = LEGO_DATA.find(x => x.id === id);
      return l ? { ...l, onRemove: () => removeLego(id) } : null;
    }),
  ].filter(Boolean);

  return (
    <div className="bb-studio-right">
      <div className="bb-studio-right-head">
        <div className="bb-studio-right-title"><EmojiIcon e="📊" style={{ marginRight: '0.35em' }} />Robot Stats</div>
      </div>

      <div className="bb-studio-right-scroll">
        {/* Validation notices */}
        {notices.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
            {notices.slice(0, 4).map((n, i) => (
              <div key={i} style={{
                display: 'flex', gap: 8, alignItems: 'flex-start',
                padding: '7px 10px', borderRadius: 8,
                background: n.severity === 'error' ? 'rgba(239,68,68,0.12)' : 'rgba(249,115,22,0.12)',
                border: `1px solid ${n.severity === 'error' ? '#ef444444' : '#f9731644'}`,
                fontSize: 11, lineHeight: 1.4,
              }}>
                <span style={{ color: n.severity === 'error' ? '#ef4444' : '#f97316', fontSize: 13, flexShrink: 0 }}>
                  <IconText>{n.severity === 'error' ? '✕' : '⚠'}</IconText>
                </span>
                <span style={{ color: n.severity === 'error' ? '#fca5a5' : '#fdba74' }}>{n.message}</span>
              </div>
            ))}
          </div>
        )}
        {/* Specs card */}
        <div className="bb-studio-specs-card">
          <div className="bb-studio-specs-name">{robotConfig.name || 'My Robot'}</div>
          <div className="bb-studio-specs-sub">{chassis.name} · {sizeLabel} · {chassis.movement}</div>
          <div className="bb-studio-specs-grid">
            <div className="bb-studio-spec-item">
              <div className="bb-studio-spec-label">Weight</div>
              <div className="bb-studio-spec-val">{stats.weight}kg</div>
            </div>
            <div className="bb-studio-spec-item">
              <div className="bb-studio-spec-label">Parts</div>
              <div className="bb-studio-spec-val">{installedParts.length}</div>
            </div>
            <div className="bb-studio-spec-item">
              <div className="bb-studio-spec-label">Movement</div>
              <div className="bb-studio-spec-val">{chassis.movement}</div>
            </div>
            <div className="bb-studio-spec-item">
              <div className="bb-studio-spec-label">Sensors</div>
              <div className="bb-studio-spec-val">{robotConfig.sensors.length}</div>
            </div>
            <div className="bb-studio-spec-item">
              <div className="bb-studio-spec-label">AI</div>
              <div className="bb-studio-spec-val">{robotConfig.aiId ? '✓' : '—'}</div>
            </div>
            <div className="bb-studio-spec-item">
              <div className="bb-studio-spec-label">Armor</div>
              <div className="bb-studio-spec-val">{(robotConfig.structParts || []).length}</div>
            </div>
          </div>
        </div>

        {/* Stat bars */}
        {[
          { label: 'Speed',      value: stats.speed,      color: '#1E90FF', icon: '🚀' },
          { label: 'Power',      value: stats.power,      color: '#9B59B6', icon: '⚡' },
          { label: 'Durability', value: stats.durability, color: '#00C851', icon: '🛡️' },
          ...(stats.ai > 0 ? [{ label: 'AI Level', value: stats.ai, color: '#7C3AED', icon: '🧠' }] : []),
        ].map(s => (
          <div key={s.label} className="bb-studio-stat-row">
            <div className="bb-studio-stat-head">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><EmojiIcon e={s.icon} color={s.color} />{s.label}</span>
              <span className="bb-studio-stat-val">{s.value}%</span>
            </div>
            <div className="bb-studio-stat-bar">
              <div className="bb-studio-stat-fill" style={{ width: `${s.value}%`, background: s.color }} />
            </div>
          </div>
        ))}

        {/* Color Customization */}
        <div style={{ fontSize: 12, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}><EmojiIcon e="🎨" style={{ marginRight: '0.35em' }} />Color Customization</div>

        <ColorSection
          label="Primary Color (Body)"
          value={robotConfig.primaryColor}
          onChange={c => setRobotConfig(prev => ({ ...prev, primaryColor: c }))}
        />
        <ColorSection
          label="Accent Color (Panels)"
          value={robotConfig.accentColor}
          onChange={c => setRobotConfig(prev => ({ ...prev, accentColor: c }))}
        />
        <ColorSection
          label="Trim Color (Details)"
          value={robotConfig.trimColor || '#FFD700'}
          onChange={c => setRobotConfig(prev => ({ ...prev, trimColor: c }))}
        />
        <ColorSection
          label="Wheel / Track Color"
          value={robotConfig.wheelColor || '#1a1a1a'}
          onChange={c => setRobotConfig(prev => ({ ...prev, wheelColor: c }))}
          presets={WHEEL_COLORS}
        />
        <ColorSection
          label="LED / Glow Color"
          value={robotConfig.ledColor || '#00D9FF'}
          onChange={c => setRobotConfig(prev => ({ ...prev, ledColor: c }))}
          presets={LED_COLORS}
        />

        {/* Material Sliders */}
        <div style={{ fontSize: 12, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 8 }}><EmojiIcon e="✨" style={{ marginRight: '0.35em' }} />Material Properties</div>
        {[
          { key: 'materialMetalness', label: '🔩 Metallic', min: 0, max: 1, step: 0.05, def: 0.4, tip: '0 = Matte plastic → 1 = Polished metal' },
          { key: 'materialRoughness', label: '🪨 Roughness', min: 0, max: 1, step: 0.05, def: 0.5, tip: '0 = Glossy mirror → 1 = Rough matte' },
          { key: 'materialGlow',      label: '💡 Glow Intensity', min: 0, max: 3, step: 0.1,  def: 1.0, tip: 'Brightness of LED/emissive lights' },
        ].map(({ key, label, min, max, step, def, tip }) => {
          const val = robotConfig[key] ?? def;
          return (
            <div key={key} className="bb-studio-color-section">
              <div className="bb-studio-color-label" title={tip}>{label} — {Math.round(val * 100 / max)}%</div>
              <input type="range" min={min} max={max} step={step} value={val}
                onChange={e => setRobotConfig(prev => ({ ...prev, [key]: parseFloat(e.target.value) }))}
                style={{ width: '100%', accentColor: '#7c3aed' }}
              />
            </div>
          );
        })}

        {/* ── Installed parts with delete buttons ─────────────────────────── */}
        <div className="bb-installed-parts">
          <div className="bb-studio-color-label" style={{ marginBottom: 8 }}>
            <EmojiIcon e="🔩" style={{ marginRight: '0.35em' }} />Installed Parts ({installedParts.length})
          </div>
          {installedParts.length === 0 && (
            <div className="bb-installed-empty">No parts added yet. Select parts from the left panel.</div>
          )}
          {installedParts.map(p => (
            <div key={p.id} className="bb-installed-row">
              <span className="bb-installed-icon" style={{ color: p.color }}>{p.icon}</span>
              <span className="bb-installed-name">{p.name}</span>
              <button
                className="bb-installed-del"
                title={`Remove ${p.name}`}
                onClick={p.onRemove}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="bb-studio-actions">
        <button className="bb-studio-act-btn bb-studio-act-btn--simulate" onClick={onSimulate}>
          <EmojiIcon e="📝" style={{ marginRight: '0.35em' }} />Code My Robot →
        </button>
        <button type="button" className="bb-studio-act-btn bb-studio-act-btn--save" onClick={onSaveDesign}>
          <EmojiIcon e="💾" style={{ marginRight: '0.35em' }} />Save Design
        </button>
        <button type="button" className="bb-studio-act-btn bb-studio-act-btn--code" onClick={onSimulate}>
          &lt;/&gt; Generate Code
        </button>
        <button className="bb-studio-act-btn bb-studio-act-btn--ghost"
          onClick={() => setRobotConfig(prev => ({
            ...prev,
            sensors: [], tools: [],
            headId: null, armId: null, lightId: null,
            aiId: null, commId: null,
            structParts: [], decoParts: [], legoParts: [],
          }))}>
          <EmojiIcon e="🔄" style={{ marginRight: '0.35em' }} />Clear Parts
        </button>
      </div>
    </div>
  );
}

// ─── Socket Overlay ──────────────────────────────────────────────────────────
function SocketOverlay({ sockets, draggingPartType, socketAttachments, onSocketDrop, onDetach }) {
  const isDragging = !!draggingPartType;
  return (
    <div className="bb-socket-overlay" aria-hidden="true">
      {sockets.map(socket => {
        const attached   = socketAttachments[socket.id] || [];
        const isOccupied = attached.length > 0;
        const accepts    = SOCKET_ACCEPTS[socket.type] || [];
        const isCompat   = isDragging && accepts.includes(draggingPartType);
        const isFull     = attached.length >= socket.max;

        // Only render if dragging (show all sockets) or occupied (show badge + remove btn)
        if (!isDragging && !isOccupied) return null;

        let cls = 'bb-socket';
        if (isDragging) cls += isCompat && !isFull ? ' bb-socket--valid' : ' bb-socket--invalid';
        else if (isOccupied)                          cls += ' bb-socket--occupied';

        return (
          <div
            key={socket.id}
            className={cls}
            style={{ left: `${socket.pos[0]}%`, top: `${socket.pos[1]}%` }}
            onDragOver={e => {
              if (!isDragging) return;
              e.preventDefault(); e.stopPropagation();
              e.dataTransfer.dropEffect = (isCompat && !isFull) ? 'copy' : 'none';
            }}
            onDrop={e => {
              e.preventDefault(); e.stopPropagation();
              if (!isCompat || isFull) return;
              const raw = e.dataTransfer.getData('text/plain');
              if (raw) onSocketDrop(socket.id, JSON.parse(raw));
            }}
          >
            <span className="bb-socket-icon">{socket.icon}</span>

            {/* Tooltip shown during drag */}
            {isDragging && (
              <div className="bb-socket-tooltip">
                <strong>{socket.label}</strong>
                <span className="bb-socket-cap">{attached.length}/{socket.max} slots</span>
                {isCompat && !isFull  && <span className="bb-socket-accept">✓ Drop here!</span>}
                {isCompat && isFull   && <span className="bb-socket-reject">✗ Slot full</span>}
                {!isCompat            && <span className="bb-socket-reject">✗ Wrong type</span>}
              </div>
            )}

            {/* Occupied badge */}
            {isOccupied && (
              <span className="bb-socket-badge">
                {attached.length > 1 ? `×${attached.length}` : '✓'}
              </span>
            )}

            {/* Detach button (visible when not dragging) */}
            {isOccupied && !isDragging && (
              <button
                className="bb-socket-detach"
                title={`Remove ${attached[attached.length - 1]?.id || 'part'}`}
                onClick={e => {
                  e.stopPropagation();
                  onDetach(socket.id, attached[attached.length - 1]);
                }}
              >×</button>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Build Page ─────────────────────────────────────────────────────────────
export default function BuildPage({ robotConfig, setRobotConfig, onSimulate, onRobotClick, customParts = [], onGoCreate, robotValidation, onSaveDesign, onFootballLaunch }) {
  const [activeRobotId,    setActiveRobotId]    = useState(1);
  const [partsOverlay,     setPartsOverlay]     = useState(false);
  const [isDragOver,       setIsDragOver]       = useState(false);
  const [draggingPartType, setDraggingPartType] = useState(null);
  const chassis        = CHASSIS_DATA.find(c => c.id === robotConfig.chassisId) || CHASSIS_DATA[0];
  const currentSockets = CHASSIS_SOCKETS[robotConfig.chassisId] || CHASSIS_SOCKETS.rover;

  // ── Helpers: apply a part to the flat robotConfig fields ─────────────────
  const applyPartToConfig = useCallback((prev, partType, id) => {
    switch (partType) {
      case 'sensor':   return { ...prev, sensors:    prev.sensors.includes(id) ? prev.sensors : [...prev.sensors, id] };
      case 'tool':     return { ...prev, tools:      prev.tools.includes(id)   ? prev.tools   : [...prev.tools,   id] };
      case 'head':     return { ...prev, headId:     id };
      case 'arm':      return { ...prev, armId:      id };
      case 'power':    return { ...prev, powerId:    id };
      case 'light':    return { ...prev, lightId:    id };
      case 'ai':       return { ...prev, aiId:       id };
      case 'comm':     return { ...prev, commId:     id };
      case 'movement': return { ...prev, movementId: id };
      case 'struct':   { const c = prev.structParts||[]; return { ...prev, structParts: c.includes(id)?c:[...c,id] }; }
      case 'deco':     { const c = prev.decoParts||[];   return { ...prev, decoParts:   c.includes(id)?c:[...c,id] }; }
      case 'lego':     { const c = prev.legoParts||[];   return { ...prev, legoParts:   c.includes(id)?c:[...c,id] }; }
      case 'chassis':  { const ch=CHASSIS_DATA.find(c=>c.id===id); return {...prev,chassisId:id,name:getPrimaryRobotDisplay(id).name,socketAttachments:{},primaryColor:ch?.primaryColor||prev.primaryColor,accentColor:ch?.accentColor||prev.accentColor}; }
      default: return prev;
    }
  }, []);

  const removePartFromConfig = useCallback((prev, partType, id) => {
    switch (partType) {
      case 'sensor':   return { ...prev, sensors:    prev.sensors.filter(s=>s!==id) };
      case 'tool':     return { ...prev, tools:      prev.tools.filter(t=>t!==id) };
      case 'head':     return { ...prev, headId:     null };
      case 'arm':      return { ...prev, armId:      null };
      case 'power':    return { ...prev, powerId:    null };
      case 'light':    return { ...prev, lightId:    null };
      case 'ai':       return { ...prev, aiId:       null };
      case 'comm':     return { ...prev, commId:     null };
      case 'movement': return { ...prev, movementId: null };
      case 'struct':   return { ...prev, structParts: (prev.structParts||[]).filter(s=>s!==id) };
      case 'deco':     return { ...prev, decoParts:   (prev.decoParts||[]).filter(d=>d!==id) };
      case 'lego':     return { ...prev, legoParts:   (prev.legoParts||[]).filter(l=>l!==id) };
      default: return prev;
    }
  }, []);

  // ── Socket drop: snap part to a specific socket ───────────────────────────
  const handleSocketDrop = useCallback((socketId, { partType, id }) => {
    setDraggingPartType(null);
    setIsDragOver(false);
    setRobotConfig(prev => {
      const sockets = CHASSIS_SOCKETS[prev.chassisId] || CHASSIS_SOCKETS.rover;
      const socket  = sockets.find(s => s.id === socketId);
      if (!socket) return prev;
      const sa      = { ...(prev.socketAttachments || {}) };
      const cur     = sa[socketId] || [];
      if (cur.length >= socket.max) return prev;
      sa[socketId]  = [...cur, { partType, id }];
      return applyPartToConfig({ ...prev, socketAttachments: sa }, partType, id);
    });
  }, [setRobotConfig, applyPartToConfig]);

  // ── Socket detach: remove a part from a specific socket ───────────────────
  const handleSocketDetach = useCallback((socketId, { partType, id }) => {
    setRobotConfig(prev => {
      const sa     = { ...(prev.socketAttachments || {}) };
      sa[socketId] = (sa[socketId] || []).filter(p => !(p.partType === partType && p.id === id));
      // Only remove from flat config if no other socket still holds this part
      const stillUsed = Object.values(sa).flat().some(p => p.partType === partType && p.id === id);
      let next = { ...prev, socketAttachments: sa };
      if (!stillUsed) next = removePartFromConfig(next, partType, id);
      return next;
    });
  }, [setRobotConfig, removePartFromConfig]);

  // ── Background drop (on canvas, not a socket) ────────────────────────────
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    setDraggingPartType(null);
    const raw = e.dataTransfer.getData('text/plain');
    if (!raw) return;
    const { partType, id } = JSON.parse(raw);
    setRobotConfig(prev => applyPartToConfig(prev, partType, id));
  }, [setRobotConfig, applyPartToConfig]);

  const removeSensor     = (id) => setRobotConfig(prev => removePartFromConfig(prev, 'sensor',   id));
  const removeTool       = (id) => setRobotConfig(prev => removePartFromConfig(prev, 'tool',     id));
  const removeAI         = ()   => setRobotConfig(prev => removePartFromConfig(prev, 'ai',       null));
  const removeComm       = ()   => setRobotConfig(prev => removePartFromConfig(prev, 'comm',     null));
  const removeStructural = (id) => setRobotConfig(prev => removePartFromConfig(prev, 'struct',   id));
  const removeDeco       = (id) => setRobotConfig(prev => removePartFromConfig(prev, 'deco',     id));
  const removeLego       = (id) => setRobotConfig(prev => removePartFromConfig(prev, 'lego',     id));

  return (
    <div className="bb-studio-build">
      <div className="bb-studio-commandbar">
        <div className="bb-studio-command-copy">
          <span className="bb-studio-command-kicker">ROBOT HANGAR / ACTIVE BAY 01</span>
          <strong>Make something that moves.</strong>
          <span>Snap parts, give your robot a personality, then send it into the arena.</span>
        </div>
        <div className="bb-studio-mode-dock" aria-label="Creator modes">
          <span className="bb-studio-mode-chip active"><b>01</b> BUILD</span>
          <button className="bb-studio-mode-chip" onClick={onSimulate}><b>02</b> PLAY TEST <span>↗</span></button>
          <button className="bb-studio-mode-chip" onClick={onSimulate}><b>03</b> CODE <span>↗</span></button>
        </div>
        <div className="bb-studio-quick-actions">
          <button type="button" onClick={onSaveDesign} title="Save this invention"><EmojiIcon e="✦" style={{ marginRight: '0.35em' }} />Save</button>
          <button type="button" onClick={onGoCreate} title="Open the modular builder">＋ New invention</button>
        </div>
      </div>

      <div className="bb-studio-workspace">
        <LeftPanel
          robotConfig={robotConfig}
          setRobotConfig={setRobotConfig}
          activeRobotId={activeRobotId}
          setActiveRobotId={setActiveRobotId}
          customParts={customParts}
          onGoCreate={onGoCreate}
          onSimulate={onSimulate}
          onSaveDesign={onSaveDesign}
          onFootballLaunch={onFootballLaunch}
        />

      {/* Center Viewport */}
      <div
        className="bb-studio-center"
        onDragEnter={e => {
          // Detect part type from MIME key (readable during drag, unlike data values)
          const bbMime = [...e.dataTransfer.types].find(t => t.startsWith('bb/'));
          const pt = bbMime ? bbMime.slice(3) : null;
          setDraggingPartType(pt);
          setIsDragOver(true);
        }}
        onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
        onDragLeave={e => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsDragOver(false);
            setDraggingPartType(null);
          }
        }}
      >
        <div className="bb-studio-viewport-header">
          <span className="bb-studio-viewport-title"><EmojiIcon e="🤖" style={{ marginRight: '0.35em' }} />{robotConfig.name || 'My Robot'}</span>
          <span className="bb-studio-viewport-hint">
            <IconText>{draggingPartType
              ? `🎯 Hover a glowing socket to snap ${draggingPartType} here`
              : 'Drag parts onto glowing sockets · Click robot to code'}</IconText>
          </span>
          <button className="bb-studio-vp-btn" onClick={() => setPartsOverlay(true)} title="Manage attached parts"><EmojiIcon e="🔩" style={{ marginRight: '0.35em' }} />Parts</button>
          <button className="bb-studio-vp-btn bb-studio-vp-btn--test" onClick={onSimulate}><EmojiIcon e="📝" style={{ marginRight: '0.35em' }} />Code My Robot</button>
          <button className="bb-studio-vp-btn bb-studio-vp-btn--reset"
            onClick={() => setRobotConfig(prev => ({
              ...prev,
              sensors: [], tools: [],
              headId: null, armId: null, lightId: null,
              aiId: null, commId: null,
              structParts: [], decoParts: [], legoParts: [],
              socketAttachments: {},
            }))}>
            ↺ Clear
          </button>
        </div>

        {/* Always-visible colour toolbar */}
        <ColorToolbar robotConfig={robotConfig} setRobotConfig={setRobotConfig} />

        {/* 3D canvas — socket overlay rendered as children so it lives inside the canvas-wrap */}
        <RobotCanvas
          robotConfig={robotConfig}
          onRobotClick={() => (onRobotClick || onSimulate)?.()}
          onDrop={handleDrop}
        >
          <SocketOverlay
            sockets={currentSockets}
            draggingPartType={draggingPartType}
            socketAttachments={robotConfig.socketAttachments || {}}
            onSocketDrop={handleSocketDrop}
            onDetach={handleSocketDetach}
          />
          <span className="bb-studio-canvas-label">{chassis.name} · {chassis.badge}</span>
          <span className="bb-studio-canvas-hint"><EmojiIcon e="🖱" style={{ marginRight: '0.35em' }} />Drag to rotate · Click robot to open Events coding</span>
        </RobotCanvas>

        {/* Click-robot overlay */}
        {partsOverlay && (
          <div className="bb-parts-overlay">
            <div className="bb-parts-overlay-inner">
              <div className="bb-parts-overlay-head">
                <span><EmojiIcon e="🔩" style={{ marginRight: '0.35em' }} />Robot Parts</span>
                <button className="bb-parts-overlay-close" onClick={() => setPartsOverlay(false)}>✕</button>
              </div>

              {(() => {
                const allInstalled = [
                  ...robotConfig.sensors.map(id => { const s = SENSORS_DATA.find(x => x.id === id); return s ? { ...s, onRemove: () => removeSensor(id) } : null; }),
                  ...robotConfig.tools.map(id => { const t = TOOLS_DATA.find(x => x.id === id); return t ? { ...t, onRemove: () => removeTool(id) } : null; }),
                  ...(robotConfig.aiId ? [(() => { const a = AI_DATA.find(x => x.id === robotConfig.aiId); return a ? { ...a, onRemove: () => removeAI() } : null; })()] : []),
                  ...(robotConfig.commId ? [(() => { const c = COMM_DATA.find(x => x.id === robotConfig.commId); return c ? { ...c, onRemove: () => removeComm() } : null; })()] : []),
                  ...(robotConfig.structParts || []).map(id => { const s = STRUCTURAL_DATA.find(x => x.id === id); return s ? { ...s, onRemove: () => removeStructural(id) } : null; }),
                  ...(robotConfig.decoParts || []).map(id => { const d = DECO_DATA.find(x => x.id === id); return d ? { ...d, onRemove: () => removeDeco(id) } : null; }),
                  ...(robotConfig.legoParts || []).map(id => { const l = LEGO_DATA.find(x => x.id === id); return l ? { ...l, onRemove: () => removeLego(id) } : null; }),
                ].filter(Boolean);
                if (allInstalled.length === 0) return (
                  <div className="bb-parts-overlay-empty">No removable parts installed.<br/>Select parts from the left panel.</div>
                );
                return allInstalled.map(p => (
                  <div key={p.id} className="bb-parts-overlay-row">
                    <span className="bb-parts-overlay-icon">{p.icon}</span>
                    <span className="bb-parts-overlay-name">{p.name}</span>
                    <button className="bb-parts-overlay-del" onClick={p.onRemove}><EmojiIcon e="🗑️" style={{ marginRight: '0.35em' }} />Remove</button>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}

      </div>

        <RightPanel
          robotConfig={robotConfig}
          setRobotConfig={setRobotConfig}
          onSimulate={onSimulate}
          onSaveDesign={onSaveDesign}
          robotValidation={robotValidation}
        />
      </div>
    </div>
  );
}
