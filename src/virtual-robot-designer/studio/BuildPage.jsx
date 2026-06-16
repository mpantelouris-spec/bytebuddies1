/**
 * BuildPage.jsx
 * Full 3-column build experience: Parts library | 3D Viewer | Stats/Config
 * v2 — bright stage, rich part tiles, delete functionality, robot-click overlay
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import {
  CHASSIS_DATA, SENSORS_DATA, TOOLS_DATA, POWER_DATA, HEADS_DATA, ARMS_DATA, LIGHTS_DATA,
  AI_DATA, COMM_DATA, STRUCTURAL_DATA, DECO_DATA, LEGO_DATA,
  BLOCKS_DATA, SAMPLE_ROBOTS, buildRobotModel,
} from '../services/studio-robot-builder.js';

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
  spacerover: SOCKET_DEFS.rover, legobot: SOCKET_DEFS.rover,
  tank: SOCKET_DEFS.tank, stealth: SOCKET_DEFS.tank, miningbot: SOCKET_DEFS.tank,
  securitybot: SOCKET_DEFS.tank, battlebot: SOCKET_DEFS.tank, farmbot: SOCKET_DEFS.tank,
  factorybot: SOCKET_DEFS.tank, medbot: SOCKET_DEFS.tank, firebot: SOCKET_DEFS.tank,
  spider: SOCKET_DEFS.spider,
  drone: SOCKET_DEFS.drone, racedrone: SOCKET_DEFS.drone, rescuedrone: SOCKET_DEFS.drone,
  droid: SOCKET_DEFS.humanoid, mech: SOCKET_DEFS.humanoid,
  helicopter: SOCKET_DEFS.heli,
  hoverbot: SOCKET_DEFS.hover, hoverracer: SOCKET_DEFS.hover,
  submarine: SOCKET_DEFS.sub, deepseabot: SOCKET_DEFS.sub,
  robotarm: SOCKET_DEFS.arm,
  jetplane: SOCKET_DEFS.plane, stealthjet: SOCKET_DEFS.plane, aerobat: SOCKET_DEFS.plane,
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
      {isCustom && <span className="bb-pt-custom-star">✨</span>}
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

// ─── Chassis card (larger card for body category) ─────────────────────────
function ChassisCard({ ch, active, onClick }) {
  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ partType: 'chassis', id: ch.id }));
    e.dataTransfer.setData('bb/chassis', '1');
    e.dataTransfer.effectAllowed = 'copy';
  };
  return (
    <button
      className={`bb-chassis-card${active ? ' selected' : ''}`}
      onClick={onClick}
      draggable
      onDragStart={handleDragStart}
      title={ch.desc || ch.name}
      style={active ? { background: `linear-gradient(160deg,${ch.bgGrad[0]},${ch.bgGrad[1]})`, borderColor: ch.accentColor || '#7c3aed' } : {}}
    >
      <span className="bb-chassis-icon">{ch.icon}</span>
      <span className="bb-chassis-name">{ch.name}</span>
      <span className="bb-chassis-badge" style={active ? { background: ch.primaryColor, color: '#fff' } : {}}>{ch.badge}</span>
      <div className="bb-chassis-bars">
        <div className="bb-chassis-bar" title="Speed" style={{ width: `${ch.speed}%`, background: '#1E90FF' }} />
        <div className="bb-chassis-bar" title="Power" style={{ width: `${ch.power}%`, background: '#9B59B6' }} />
        <div className="bb-chassis-bar" title="Durability" style={{ width: `${ch.durability}%`, background: '#00C851' }} />
      </div>
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
              {s.id === 'S' ? '🤏' : s.id === 'M' ? '👐' : '🤲'}
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
  const [activePop, setActivePop] = useState(null);
  const [popTab, setPopTab]       = useState('classic');
  const containerRef              = useRef(null);

  const PALETTES = {
    classic:  PALETTE_CLASSIC,
    metallic: PALETTE_METALLIC,
    neon:     PALETTE_NEON,
    dark:     PALETTE_DARK,
  };

  const COLOR_DEFS = [
    { key: 'primaryColor', label: 'Body',   def: '#FF8C00', hasTabs: true },
    { key: 'accentColor',  label: 'Accent', def: '#FFD700', hasTabs: true },
    { key: 'trimColor',    label: 'Trim',   def: '#FFD700', hasTabs: true },
    { key: 'wheelColor',   label: 'Wheel',  def: '#1a1a1a', hasTabs: false, swatches: WHEEL_COLORS },
    { key: 'ledColor',     label: 'LED',    def: '#00D9FF', hasTabs: false, swatches: LED_COLORS },
  ];

  // Close popover on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setActivePop(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
      background: 'rgba(0,0,0,0.18)', borderBottom: '1px solid rgba(255,255,255,0.06)',
      flexShrink: 0,
    }}>
      <span style={{ fontSize: 11, color: '#aaa', fontWeight: 700, marginRight: 2, flexShrink: 0 }}>🎨 Colors</span>

      {/* Colour swatches */}
      {COLOR_DEFS.map(({ key, label, def, hasTabs, swatches }) => {
        const value  = robotConfig[key] || def;
        const isOpen = activePop === key;
        const currentSwatches = hasTabs ? (PALETTES[popTab] || PALETTE_CLASSIC) : (swatches || PALETTE_CLASSIC);

        return (
          <div key={key} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Swatch circle button */}
            <button
              title={`${label}: ${value}`}
              onClick={() => { setActivePop(isOpen ? null : key); setPopTab('classic'); }}
              style={{
                width: 28, height: 28, borderRadius: '50%', border: 'none',
                background: value, cursor: 'pointer',
                outline: isOpen ? '3px solid #fff' : '2px solid rgba(255,255,255,0.3)',
                outlineOffset: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                transition: 'outline 0.12s, transform 0.12s',
                transform: isOpen ? 'scale(1.15)' : 'scale(1)',
              }}
            />
            <span style={{ fontSize: 9, color: '#888', marginTop: 3, userSelect: 'none' }}>{label}</span>

            {/* Popover */}
            {isOpen && (
              <div style={{
                position: 'absolute', top: 48, left: '50%', transform: 'translateX(-50%)',
                background: '#1a1a2e', border: '1px solid #2a2a40', borderRadius: 12,
                padding: 12, zIndex: 9999,
                boxShadow: '0 16px 48px rgba(0,0,0,0.75)',
                minWidth: 220,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#ddd', marginBottom: 8, textAlign: 'center' }}>
                  {label} Color
                </div>

                {/* Palette tabs */}
                {hasTabs && (
                  <div style={{ display: 'flex', gap: 3, marginBottom: 8 }}>
                    {[['classic','Classic'],['metallic','Metal'],['neon','Neon'],['dark','Dark']].map(([k, l]) => (
                      <button key={k} onClick={() => setPopTab(k)} style={{
                        flex: 1, fontSize: 9, padding: '3px 0', borderRadius: 6, border: 'none',
                        background: popTab === k ? '#7c3aed' : '#2a2a40',
                        color: popTab === k ? '#fff' : '#777', cursor: 'pointer', fontWeight: 700,
                      }}>{l}</button>
                    ))}
                  </div>
                )}

                {/* Colour swatches grid */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
                  {currentSwatches.map(c => (
                    <button key={c} onClick={() => setRobotConfig(prev => ({ ...prev, [key]: c }))}
                      title={c} style={{
                        width: 26, height: 26, borderRadius: 5, border: 'none', cursor: 'pointer',
                        background: c,
                        outline: value === c ? '2px solid #fff' : '1px solid rgba(255,255,255,0.15)',
                        outlineOffset: value === c ? 1 : 0,
                        transition: 'outline 0.08s',
                      }}
                    />
                  ))}
                  {/* Custom colour input */}
                  <input type="color" value={value}
                    onChange={e => setRobotConfig(prev => ({ ...prev, [key]: e.target.value }))}
                    title="Custom colour"
                    style={{ width: 26, height: 26, border: 'none', borderRadius: 5, cursor: 'pointer', padding: 0, background: 'none' }}
                  />
                </div>

                {/* Current colour preview */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 4, background: value, border: '1px solid rgba(255,255,255,0.2)', flexShrink: 0 }} />
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#aaa' }}>{value.toUpperCase()}</span>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Divider */}
      <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.12)', margin: '0 4px', flexShrink: 0 }} />

      {/* Metalness slider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        <span style={{ fontSize: 12 }} title="Metallic shine">🔩</span>
        <input type="range" min={0} max={1} step={0.05}
          value={robotConfig.materialMetalness ?? 0.4}
          onChange={e => setRobotConfig(prev => ({ ...prev, materialMetalness: parseFloat(e.target.value) }))}
          style={{ width: 56, accentColor: '#aaa' }}
          title={`Metallic: ${Math.round((robotConfig.materialMetalness ?? 0.4) * 100)}%`}
        />
      </div>

      {/* Glow slider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        <span style={{ fontSize: 12 }} title="LED glow intensity">💡</span>
        <input type="range" min={0} max={3} step={0.1}
          value={robotConfig.materialGlow ?? 1.0}
          onChange={e => setRobotConfig(prev => ({ ...prev, materialGlow: parseFloat(e.target.value) }))}
          style={{ width: 56, accentColor: '#00D9FF' }}
          title={`Glow: ${Math.round((robotConfig.materialGlow ?? 1.0) / 3 * 100)}%`}
        />
      </div>
    </div>
  );
}

// ─── 3D Viewer ─────────────────────────────────────────────────────────────
function RobotCanvas({ robotConfig, onRobotClick, onDrop, children }) {
  const wrapRef  = useRef(null);
  const sceneRef = useRef(null);
  const camRef   = useRef(null);
  const rendRef  = useRef(null);
  const robotRef = useRef(null);   // the raw robot model
  const pivotRef = useRef(null);   // wrapper group for orbit rotation
  const rafRef   = useRef(null);
  const roRef    = useRef(null);

  // Init scene once per key-mount
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const W = Math.max(el.clientWidth, 1);
    const H = Math.max(el.clientHeight, 1);

    // ── Scene: LIGHT background ─────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f2f8);
    scene.fog = new THREE.Fog(0xf0f2f8, 22, 50);
    sceneRef.current = scene;

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
    // Studio ceiling panels
    envCtx.strokeStyle = 'rgba(255,255,255,0.08)'; envCtx.lineWidth = 1;
    for (let x = 0; x < 512; x += 64) {
      envCtx.beginPath(); envCtx.moveTo(x, 0); envCtx.lineTo(x, 110); envCtx.stroke();
    }
    // Bright horizon band
    envCtx.fillStyle = 'rgba(255,255,255,0.28)';
    envCtx.fillRect(0, 108, 512, 40);
    const envTex = new THREE.CanvasTexture(envCanvas);
    envTex.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = envTex;

    // Camera
    const camera = new THREE.PerspectiveCamera(46, W / H, 0.1, 80);
    camera.position.set(2.4, 2.0, 3.6);
    camera.lookAt(0, 0.4, 0);
    camRef.current = camera;

    // Renderer — high quality settings
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.outputColorSpace = THREE.SRGBColorSpace || 'srgb';
    el.appendChild(renderer.domElement);
    rendRef.current = renderer;

    // ── Lights: professional studio 3-point lighting ──────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const hemi = new THREE.HemisphereLight(0xd0e8ff, 0xd8e0f0, 0.5);
    scene.add(hemi);

    // Key light (main dramatic light from upper front-right)
    const sun = new THREE.DirectionalLight(0xfff4e0, 1.8);
    sun.position.set(6, 10, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -5; sun.shadow.camera.right = 5;
    sun.shadow.camera.top = 5;   sun.shadow.camera.bottom = -5;
    sun.shadow.bias = -0.0002;
    scene.add(sun);

    // Fill light (softer, from left)
    const fill = new THREE.DirectionalLight(0xc8e0ff, 0.6);
    fill.position.set(-6, 5, -3);
    scene.add(fill);

    // Rim light (back light for depth separation, blue-purple tint)
    const rim = new THREE.DirectionalLight(0xc0a0ff, 0.5);
    rim.position.set(0, 3, -8);
    scene.add(rim);

    // Bottom bounce light
    const bounce = new THREE.DirectionalLight(0xfff0d8, 0.2);
    bounce.position.set(0, -4, 2);
    scene.add(bounce);

    // ── Floor + grid ─────────────────────────────────────────────────────────
    const floorGeo  = new THREE.CircleGeometry(4.5, 64);
    const floorMat  = new THREE.MeshStandardMaterial({ color: 0xe8edf5, metalness: 0.08, roughness: 0.9 });
    const floor     = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y  = -0.12;
    floor.receiveShadow = true;
    scene.add(floor);

    // Platform disc
    const platMat = new THREE.MeshStandardMaterial({ color: 0xdde2f2, metalness: 0.55, roughness: 0.3 });
    const plat    = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.08, 64), platMat);
    plat.position.y = -0.04;
    plat.receiveShadow = true;
    scene.add(plat);

    // Platform accent ring (purple)
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x7c3aed, emissive: new THREE.Color(0x7c3aed), emissiveIntensity: 0.7 });
    const ring    = new THREE.Mesh(new THREE.TorusGeometry(1.52, 0.04, 8, 72), ringMat);
    ring.position.y = 0.02;
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);

    // Shadow ground (barely visible on light bg)
    const shadowGeo = new THREE.CircleGeometry(2.0, 32);
    const shadowMat = new THREE.MeshStandardMaterial({ color: 0xc8cee0, transparent: true, opacity: 0.18 });
    const shadow    = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y  = -0.11;
    scene.add(shadow);

    // ── Particle system ───────────────────────────────────────────────────
    const MAX_P = 120;
    const pPositions = new Float32Array(MAX_P * 3);
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    // Draw a soft circle sprite for particles
    const sprCanvas = document.createElement('canvas');
    sprCanvas.width = 32; sprCanvas.height = 32;
    const sCtx = sprCanvas.getContext('2d');
    const radGrad = sCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
    radGrad.addColorStop(0, 'rgba(200,180,140,1)');
    radGrad.addColorStop(1, 'rgba(200,180,140,0)');
    sCtx.fillStyle = radGrad; sCtx.fillRect(0, 0, 32, 32);
    const sprTex = new THREE.CanvasTexture(sprCanvas);
    const pMat = new THREE.PointsMaterial({
      size: 0.07, map: sprTex, transparent: true,
      opacity: 0.8, depthWrite: false, sizeAttenuation: true,
    });
    const pPoints = new THREE.Points(pGeo, pMat);
    scene.add(pPoints);
    // Particle pool
    const pPool = [];
    for (let i = 0; i < MAX_P; i++) pPool.push({ x: 0, y: -100, z: 0, vx: 0, vy: 0, vz: 0, life: 0 });
    let pActive = 0;
    const emitDust = (x, y, z, count = 3, vy0 = 0.08) => {
      let emitted = 0;
      for (let i = 0; i < MAX_P && emitted < count; i++) {
        if (pPool[i].life <= 0) {
          pPool[i].x = x + (Math.random() - 0.5) * 0.3;
          pPool[i].y = y + Math.random() * 0.05;
          pPool[i].z = z + (Math.random() - 0.5) * 0.3;
          pPool[i].vx = (Math.random() - 0.5) * 0.025;
          pPool[i].vy = vy0 + Math.random() * 0.04;
          pPool[i].vz = (Math.random() - 0.5) * 0.025;
          pPool[i].life = 0.8 + Math.random() * 0.8;
          emitted++;
        }
      }
    };
    const updateParticles = (dt) => {
      pActive = 0;
      for (let i = 0; i < MAX_P; i++) {
        const p = pPool[i];
        if (p.life > 0) {
          p.life -= dt * 0.9;
          p.x += p.vx; p.y += p.vy; p.z += p.vz;
          p.vy -= 0.004; // gravity
          pPositions[i * 3]     = p.life > 0 ? p.x : 0;
          pPositions[i * 3 + 1] = p.life > 0 ? p.y : -100;
          pPositions[i * 3 + 2] = p.life > 0 ? p.z : 0;
          if (p.life > 0) pActive++;
        } else {
          pPositions[i * 3 + 1] = -100;
        }
      }
      pGeo.attributes.position.needsUpdate = true;
      pMat.opacity = Math.min(0.8, 0.3 + pActive * 0.01);
    };

    // ── Orbit pivot group (separates orbit from robot-local animations) ───
    const pivot = new THREE.Group();
    scene.add(pivot);
    pivotRef.current = pivot;

    // ── Raycaster for robot-click ─────────────────────────────────────────────
    const raycaster = new THREE.Raycaster();
    const mouse     = new THREE.Vector2();

    const handleClick = (e) => {
      if (!pivotRef.current || !onRobotClick) return;
      const rect = el.getBoundingClientRect();
      mouse.x =  ((e.clientX - rect.left)  / rect.width)  * 2 - 1;
      mouse.y = -((e.clientY - rect.top)   / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camRef.current);
      const hits = raycaster.intersectObjects(pivotRef.current.children, true);
      if (hits.length > 0) {
        onRobotClick();
        if (hits[0].object.material?.emissive) {
          hits[0].object.material.emissive.set(0xffffff);
          hits[0].object.material.emissiveIntensity = 0.4;
          setTimeout(() => {
            if (hits[0].object.material?.emissive) {
              hits[0].object.material.emissive.set(0x000000);
              hits[0].object.material.emissiveIntensity = 0;
            }
          }, 350);
        }
      }
    };
    el.addEventListener('click', handleClick);

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
    window.addEventListener('resize', onResize);

    // ── Orbit drag controls ───────────────────────────────────────────────
    let isDragging = false, lastX = 0, lastY = 0;
    let orbitY = 0, orbitX = 0;
    const onMouseDown = (e) => { isDragging = true; lastX = e.clientX; lastY = e.clientY; };
    const onMouseMove = (e) => {
      if (!isDragging) return;
      orbitY += (e.clientX - lastX) * 0.012;
      orbitX = Math.max(-0.5, Math.min(0.5, orbitX + (e.clientY - lastY) * 0.008));
      lastX = e.clientX; lastY = e.clientY;
    };
    const onMouseUp = () => { isDragging = false; };
    el.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // ── Animation ──────────────────────────────────────────────────────────
    let t = 0;
    let pEmitTimer = 0;
    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      const dt = 0.016;
      t += dt;
      const robot = robotRef.current;
      if (pivot) {
        if (!isDragging) orbitY += 0.004;
        pivot.rotation.y = orbitY;
        pivot.rotation.x = orbitX;
        pivot.position.y = Math.sin(t * 1.4) * 0.055;
        if (robot && robot.userData.animate) {
          robot.userData.animate(t);
        }
        // Emit particles based on chassis type
        pEmitTimer += dt;
        if (pEmitTimer > 0.12 && robot) {
          pEmitTimer = 0;
          const cid = robot.userData.chassisId || '';
          if (/spider|walker|droid|mech|legobot/.test(cid)) {
            // Foot-level dust for walking robots
            const leg = Math.floor(Math.random() * 4);
            const lx = (leg < 2 ? -0.5 : 0.5) * 0.8 + (Math.random() - 0.5) * 0.2;
            const lz = (leg % 2 === 0 ? 0.3 : -0.3) + (Math.random() - 0.5) * 0.2;
            emitDust(lx, 0.02, lz, 2, 0.04);
          } else if (/drone|helicopter|hoverbot/.test(cid)) {
            // Propeller wash — downward particle rings
            for (let i = 0; i < 4; i++) {
              const a = (i / 4) * Math.PI * 2;
              emitDust(
                Math.cos(a) * 0.55, 0.1 + pivot.position.y, Math.sin(a) * 0.55,
                1, -0.05
              );
            }
          } else if (/rover|scout|crawler|tank/.test(cid)) {
            // Wheel dust
            emitDust(-0.7 + (Math.random() - 0.5) * 0.2, 0.08, 0.5 + (Math.random() - 0.5) * 0.3, 1, 0.03);
            emitDust(0.7 + (Math.random() - 0.5) * 0.2, 0.08, 0.5 + (Math.random() - 0.5) * 0.3, 1, 0.03);
          }
        }
      }
      updateParticles(dt);
      // Pulse the platform ring
      ring.material.emissiveIntensity = 0.5 + Math.sin(t * 2.0) * 0.2;
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      el.removeEventListener('click', handleClick);
      el.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      cancelAnimationFrame(rafRef.current);
      roRef.current?.disconnect();
      window.removeEventListener('resize', onResize);
      if (el && renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Rebuild robot model when config changes — attach to pivot, not scene
  useEffect(() => {
    const pivot = pivotRef.current;
    const scene = sceneRef.current;
    if (!pivot) return;
    if (robotRef.current) {
      pivot.remove(robotRef.current);
      robotRef.current = null;
    }
    const model = buildRobotModel(robotConfig);
    pivot.add(model);
    robotRef.current = model;
    // Apply environment map for metallic reflections
    if (scene && model.userData.envTex) {
      scene.environment = model.userData.envTex;
    }
  }, [robotConfig]);

  return (
    <div ref={wrapRef} className="bb-studio-canvas-wrap" style={{ cursor: 'pointer' }} onDrop={onDrop}>
      {children}
    </div>
  );
}


// ─── Left Panel ────────────────────────────────────────────────────────────
function LeftPanel({ robotConfig, setRobotConfig, activeRobotId, setActiveRobotId, customParts = [], onGoCreate }) {
  const [activeCat, setActiveCat] = useState('body');
  const [search, setSearch]       = useState('');
  const [savedRobots]             = useState(SAMPLE_ROBOTS);

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
        const allChassis = [...CHASSIS_DATA, ...customChassis.map(c => ({
          id: c.id, name: c.name, icon: '✨', badge: 'Custom',
          primaryColor: c.color, accentColor: c.color,
          speed: 70, power: 70, durability: 70,
          bgGrad: [`${c.color}33`, `${c.color}11`],
          isCustom: true,
        }))];
        const filtered = allChassis.filter(c => !q || c.name.toLowerCase().includes(q));
        return (
          <>
            <p className="bb-studio-section-label">Chassis Type</p>
            <div className="bb-chassis-grid">
              {filtered.map(ch => (
                <ChassisCard
                  key={ch.id}
                  ch={ch}
                  active={robotConfig.chassisId === ch.id}
                  onClick={() => setRobotConfig(prev => ({
                    ...prev,
                    chassisId: ch.id,
                    primaryColor: ch.primaryColor || prev.primaryColor,
                    accentColor: ch.accentColor || prev.accentColor,
                    socketAttachments: {}, // reset sockets when chassis changes
                  }))}
                />
              ))}
              <button className="bb-chassis-card bb-chassis-card--create" onClick={onGoCreate}>
                <span className="bb-chassis-icon">✨</span>
                <span className="bb-chassis-name">Create Custom</span>
                <span className="bb-chassis-badge" style={{ background: '#7c3aed', color: '#fff' }}>New</span>
              </button>
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
        <div className="bb-studio-left-label">🔧 Build Your Robot</div>
        <input
          className="bb-studio-search"
          placeholder="🔍  Search parts..."
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
            <span>{cat.icon}</span>
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
function RightPanel({ robotConfig, setRobotConfig, onSimulate, robotValidation }) {
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
    weight:     Math.round(chassis.weight * sizeWeightMult * 10) / 10,
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
        <div className="bb-studio-right-title">📊 Robot Stats</div>
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
                  {n.severity === 'error' ? '✕' : '⚠'}
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
              <span>{s.icon} {s.label}</span>
              <span className="bb-studio-stat-val">{s.value}%</span>
            </div>
            <div className="bb-studio-stat-bar">
              <div className="bb-studio-stat-fill" style={{ width: `${s.value}%`, background: s.color }} />
            </div>
          </div>
        ))}

        {/* Color Customization */}
        <div style={{ fontSize: 12, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>🎨 Color Customization</div>

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
        <div style={{ fontSize: 12, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginTop: 8 }}>✨ Material Properties</div>
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
            🔩 Installed Parts ({installedParts.length})
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
          📝 Code My Robot →
        </button>
        <button className="bb-studio-act-btn bb-studio-act-btn--save">
          💾 Save Design
        </button>
        <button className="bb-studio-act-btn bb-studio-act-btn--code">
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
          🔄 Clear Parts
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
export default function BuildPage({ robotConfig, setRobotConfig, onSimulate, customParts = [], onGoCreate, robotValidation }) {
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
      case 'chassis':  { const ch=CHASSIS_DATA.find(c=>c.id===id); return {...prev,chassisId:id,socketAttachments:{},primaryColor:ch?.primaryColor||prev.primaryColor,accentColor:ch?.accentColor||prev.accentColor}; }
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
      <LeftPanel
        robotConfig={robotConfig}
        setRobotConfig={setRobotConfig}
        activeRobotId={activeRobotId}
        setActiveRobotId={setActiveRobotId}
        customParts={customParts}
        onGoCreate={onGoCreate}
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
          <span className="bb-studio-viewport-title">🤖 {robotConfig.name || 'My Robot'}</span>
          <span style={{ fontSize: 11, color: '#aaa', fontStyle: 'italic' }}>
            {draggingPartType
              ? `🎯 Hover a glowing socket to snap ${draggingPartType} here`
              : 'Drag parts onto glowing sockets · Click robot to manage'}
          </span>
          <button className="bb-studio-vp-btn bb-studio-vp-btn--test" onClick={onSimulate}>📝 Code My Robot</button>
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
          onRobotClick={() => setPartsOverlay(v => !v)}
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
          <span className="bb-studio-canvas-hint">🖱 Drag to rotate · Click robot to manage parts</span>
        </RobotCanvas>

        {/* Click-robot overlay */}
        {partsOverlay && (
          <div className="bb-parts-overlay">
            <div className="bb-parts-overlay-inner">
              <div className="bb-parts-overlay-head">
                <span>🔩 Robot Parts</span>
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
                    <button className="bb-parts-overlay-del" onClick={p.onRemove}>🗑️ Remove</button>
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
        robotValidation={robotValidation}
      />
    </div>
  );
}
