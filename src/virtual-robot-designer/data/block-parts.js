/** Futuristic modular block robotics — snap-together invention system */

export const BLOCK_CELL = 0.28;

export const BLOCK_TYPES = [
  { id: 'cube', label: 'Cube Block', icon: '⬜', category: 'structure', color: '#8B00FF', emissive: 0.2 },
  { id: 'round', label: 'Rounded Cube', icon: '⚪', category: 'structure', color: '#7c3aed', emissive: 0.18 },
  { id: 'plate', label: 'Plate Block', icon: '▬', category: 'structure', color: '#5A2E8F', emissive: 0.12 },
  { id: 'ibeam', label: 'I-Beam Block', icon: '工', category: 'structure', color: '#64748b', emissive: 0.1 },
  { id: 'corner', label: 'Corner Block', icon: '◢', category: 'structure', color: '#475569', emissive: 0.14 },
  { id: 'armor', label: 'Hex Armor', icon: '🛡️', category: 'armor', color: '#374151', emissive: 0.08 },
  { id: 'chevron', label: 'Chevron Armor', icon: '🔺', category: 'armor', color: '#1e293b', emissive: 0.1 },
  { id: 'diamond', label: 'Diamond Plate', icon: '◆', category: 'armor', color: '#334155', emissive: 0.12 },
  { id: 'layered', label: 'Layered Armor', icon: '📚', category: 'armor', color: '#475569', emissive: 0.08 },
  { id: 'reflect', label: 'Reflective Armor', icon: '✨', category: 'armor', color: '#94a3b8', emissive: 0.35 },
  { id: 'energy', label: 'Energy Core', icon: '💎', category: 'functional', color: '#00d4ff', emissive: 0.65, transparent: true },
  { id: 'neon', label: 'LED Block', icon: '💜', category: 'functional', color: '#ff006e', emissive: 0.9 },
  { id: 'hinge', label: 'Joint Block', icon: '🔗', category: 'connector', color: '#64748b', emissive: 0.12 },
  { id: 'balljoint', label: 'Ball Joint', icon: '⚫', category: 'connector', color: '#94a3b8', emissive: 0.15 },
  { id: 'slide', label: 'Slide Joint', icon: '↔', category: 'connector', color: '#64748b', emissive: 0.1 },
  { id: 'magnet', label: 'Magnetic Connector', icon: '🧲', category: 'connector', color: '#ef4444', emissive: 0.4 },
  { id: 'lighttube', label: 'Light Tube', icon: '💡', category: 'decorative', color: '#00FFFF', emissive: 0.85, transparent: true },
  { id: 'antenna_blk', label: 'Antenna Block', icon: '📶', category: 'decorative', color: '#FF006E', emissive: 0.55 },
  { id: 'vent', label: 'Vent Block', icon: '💨', category: 'decorative', color: '#64748b', emissive: 0.2 },
  { id: 'window', label: 'Window Block', icon: '🪟', category: 'decorative', color: '#0066FF', emissive: 0.3, transparent: true },
  { id: 'wheel', label: 'Wheel Block', icon: '🛞', category: 'movement', color: '#1e293b', emissive: 0.1, affects: { wheels: { type: 'standard', count: 4 } } },
  { id: 'motor', label: 'Motor Block', icon: '⚙️', category: 'movement', color: '#fbbf24', emissive: 0.35, affects: { wheels: { motor: 'strong' } } },
  { id: 'track', label: 'Track Block', icon: '🏗️', category: 'movement', color: '#475569', emissive: 0.1, affects: { wheels: { type: 'tracks', count: 2 } } },
  { id: 'hover', label: 'Hover Block', icon: '💨', category: 'movement', color: '#06b6d4', emissive: 0.45, affects: { wheels: { type: 'hover', count: 4 } } },
  { id: 'sensor', label: 'Sensor Block', icon: '📡', category: 'sensors', color: '#00d4ff', emissive: 0.7, affects: { sensors: { ultrasonic: true, proximity: true } } },
  { id: 'lidar', label: 'LIDAR Block', icon: '🔦', category: 'sensors', color: '#22d3ee', emissive: 0.8, affects: { sensors: { lidar: true, camera: true } } },
  { id: 'camera', label: 'Camera Block', icon: '📷', category: 'sensors', color: '#00ff88', emissive: 0.5, affects: { sensors: { camera: true } } },
  { id: 'ai_core', label: 'AI Core', icon: '🧠', category: 'ai', color: '#a855f7', emissive: 0.85, affects: { modules: { ai: 'core' } } },
  { id: 'claw', label: 'Claw Block', icon: '🦀', category: 'tools', color: '#94a3b8', emissive: 0.15, affects: { tools: { pincer: true, grabber: 'pincer' } } },
  { id: 'gripper', label: 'Gripper Block', icon: '🤏', category: 'tools', color: '#cbd5e1', emissive: 0.12, affects: { tools: { gripper: true } } },
  { id: 'blade', label: 'Blade Block', icon: '🚜', category: 'tools', color: '#64748b', emissive: 0.1, affects: { tools: { bulldozer: true, pusher: 'bulldozer' } } },
  { id: 'battery', label: 'Battery Block', icon: '🔋', category: 'power', color: '#fbbf24', emissive: 0.25, affects: { modules: { power: 'battery' } } },
  { id: 'fusion', label: 'Fusion Block', icon: '☢️', category: 'power', color: '#00d4ff', emissive: 0.95, affects: { modules: { power: 'fusion' }, wheels: { motor: 'turbo' } } },
  { id: 'antenna', label: 'Antenna Block', icon: '📶', category: 'comms', color: '#ff006e', emissive: 0.55, affects: { modules: { comms: 'antenna' } } },
  { id: 'disco', label: 'Disco Block', icon: '🪩', category: 'fun', color: '#ec4899', emissive: 0.75, affects: { abilities: { chaosMode: true } } },
  { id: 'foam', label: 'Foam Block', icon: '🫧', category: 'fun', color: '#38bdf8', emissive: 0.4, affects: { tools: { water: true } } },
  { id: 'decor', label: 'Deco Panel', icon: '✨', category: 'fun', color: '#c084fc', emissive: 0.35 },
  { id: 'brick_2x2', label: '2×2 Brick', icon: '🟥', category: 'structure', color: '#ef4444', emissive: 0.15 },
  { id: 'brick_2x4', label: '2×4 Brick', icon: '🟦', category: 'structure', color: '#3b82f6', emissive: 0.15 },
  { id: 'brick_curved', label: 'Curved Brick', icon: '🔵', category: 'structure', color: '#22c55e', emissive: 0.18 },
  { id: 'slope', label: 'Slope Brick', icon: '◢', category: 'structure', color: '#f59e0b', emissive: 0.12 },
  { id: 'plate_thin', label: 'Thin Plate', icon: '▭', category: 'structure', color: '#eab308', emissive: 0.1 },
  { id: 'technic_axle', label: 'Technic Axle', icon: '➖', category: 'connector', color: '#64748b', emissive: 0.2 },
  { id: 'technic_pin', label: 'Technic Pin', icon: '📌', category: 'connector', color: '#94a3b8', emissive: 0.15 },
  { id: 'peg', label: 'Peg Connector', icon: '🔩', category: 'connector', color: '#78716c', emissive: 0.1 },
  { id: 'toy_wheel', label: 'Toy Wheel', icon: '🛞', category: 'movement', color: '#1e293b', emissive: 0.1, affects: { wheels: { type: 'standard', count: 4 } } },
  { id: 'toy_joint', label: 'Toy Joint', icon: '🔗', category: 'connector', color: '#f472b6', emissive: 0.25 },
  { id: 'energy_clear', label: 'Clear Energy Block', icon: '💎', category: 'functional', color: '#00d4ff', emissive: 0.75, transparent: true },
  { id: 'energy_core_mini', label: 'Mini Energy Core', icon: '⚡', category: 'functional', color: '#22d3ee', emissive: 0.55, transparent: true },
  { id: 'transparent', label: 'Clear Panel', icon: '🪟', category: 'decorative', color: '#94a3b8', emissive: 0.08, transparent: true },
  { id: 'stud_tile', label: 'Stud Tile', icon: '▪', category: 'structure', color: '#64748b', emissive: 0.08 },
  { id: 'technic_beam', label: 'Technic Beam', icon: '▬', category: 'structure', color: '#475569', emissive: 0.1 },
  { id: 'technic_gear', label: 'Technic Gear', icon: '⚙️', category: 'connector', color: '#fbbf24', emissive: 0.3 },
  { id: 'technic_gearbox', label: 'Gearbox', icon: '⚙️', category: 'movement', color: '#78716c', emissive: 0.15, affects: { wheels: { motor: 'strong' } } },
  { id: 'propeller', label: 'Propeller Block', icon: '🚁', category: 'movement', color: '#38bdf8', emissive: 0.35, affects: { wheels: { type: 'hover', count: 4 } } },
  { id: 'fin_block', label: 'Fin Block', icon: '🐟', category: 'decorative', color: '#06b6d4', emissive: 0.2 },
  { id: 'flag_block', label: 'Flag Block', icon: '🚩', category: 'decorative', color: '#ef4444', emissive: 0.15 },
  { id: 'speaker_blk', label: 'Speaker Block', icon: '🔊', category: 'comms', color: '#64748b', emissive: 0.2, affects: { tools: { speaker: true } } },
  { id: 'microphone_blk', label: 'Mic Block', icon: '🎙️', category: 'comms', color: '#a855f7', emissive: 0.35, affects: { sensors: { voice: true } } },
  { id: 'gyro_blk', label: 'Gyro Block', icon: '🧭', category: 'sensors', color: '#22c55e', emissive: 0.4, affects: { sensors: { gyroscope: true } } },
  { id: 'gps_blk', label: 'GPS Block', icon: '🛰️', category: 'sensors', color: '#3b82f6', emissive: 0.35, affects: { sensors: { gps: true } } },
  { id: 'thermal_blk', label: 'Thermal Block', icon: '🌡️', category: 'sensors', color: '#f97316', emissive: 0.45, affects: { sensors: { thermal: true } } },
  { id: 'magnet_arm_blk', label: 'Magnet Tool', icon: '🧲', category: 'tools', color: '#ef4444', emissive: 0.4, affects: { tools: { magnet: true } } },
  { id: 'fork_blk', label: 'Fork Block', icon: '🏗️', category: 'tools', color: '#94a3b8', emissive: 0.12, affects: { tools: { forklift: true } } },
  { id: 'solar_blk', label: 'Solar Block', icon: '☀️', category: 'power', color: '#fbbf24', emissive: 0.35, affects: { abilities: { solarCharge: true } } },
  { id: 'reactor_blk', label: 'Reactor Block', icon: '☢️', category: 'power', color: '#00d4ff', emissive: 0.9, affects: { modules: { power: 'fusion' }, wheels: { motor: 'turbo' } } },
  { id: 'lego_1x1', label: '1×1 Brick', icon: '🟥', category: 'structure', color: '#dc2626', emissive: 0.12 },
  { id: 'lego_1x2', label: '1×2 Brick', icon: '🟧', category: 'structure', color: '#ea580c', emissive: 0.12 },
  { id: 'lego_1x4', label: '1×4 Brick', icon: '🟨', category: 'structure', color: '#ca8a04', emissive: 0.12 },
  { id: 'arch_brick', label: 'Arch Brick', icon: '⌒', category: 'structure', color: '#a855f7', emissive: 0.14 },
  { id: 'window_large', label: 'Large Window', icon: '🪟', category: 'decorative', color: '#38bdf8', emissive: 0.25, transparent: true },
  { id: 'light_brick', label: 'Light Brick', icon: '💡', category: 'decorative', color: '#fde047', emissive: 0.85 },
  { id: 'pipe', label: 'Pipe Block', icon: '🔧', category: 'connector', color: '#64748b', emissive: 0.1 },
  { id: 'cable', label: 'Cable Block', icon: '🔌', category: 'connector', color: '#1e293b', emissive: 0.15 },
];

export const BLOCK_CATEGORIES = [
  { id: 'structure', label: 'Structure', icon: '🧱' },
  { id: 'armor', label: 'Armor', icon: '🛡️' },
  { id: 'functional', label: 'Functional', icon: '⚡' },
  { id: 'connector', label: 'Connectors', icon: '🔗' },
  { id: 'decorative', label: 'Decorative', icon: '✨' },
  { id: 'movement', label: 'Move', icon: '⚙️' },
  { id: 'sensors', label: 'Sensors', icon: '📡' },
  { id: 'ai', label: 'AI', icon: '🧠' },
  { id: 'tools', label: 'Tools', icon: '🦾' },
  { id: 'power', label: 'Power', icon: '🔋' },
  { id: 'comms', label: 'Comms', icon: '📶' },
  { id: 'fun', label: 'Fun', icon: '🎉' },
];

export const BLOCK_LAYERS = [
  { id: 'base', label: 'Base Layer', y: 0 },
  { id: 'mid', label: 'Mid Layer', y: 1 },
  { id: 'top', label: 'Top Layer', y: 2 },
  { id: 'crown', label: 'Crown', y: 3 },
];

export function getBlockType(typeId) {
  return BLOCK_TYPES.find((b) => b.id === typeId);
}

export function gridToWorld(gx, gy, gz) {
  return [gx * BLOCK_CELL, gy * BLOCK_CELL + BLOCK_CELL * 0.5, gz * BLOCK_CELL];
}

export function worldKey(gx, gy, gz) {
  return `${gx},${gy},${gz}`;
}

export const DEFAULT_BLOCKS = [];
