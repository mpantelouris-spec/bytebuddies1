/**
 * Single source of truth — modular robotics parts catalog.
 * Every part: 3D mesh key, design patch, stats, coding unlocks, simulator wheel type.
 */
import { EXTENDED_CHASSIS, EXTENDED_CATEGORIES, EXTENDED_PARTS } from './modular-parts-extended.js';

function part(category, id, label, icon, patch = {}, meta = {}) {
  return {
    category,
    id,
    label,
    icon,
    patch,
    unlocks: meta.unlocks,
    wheelType: meta.wheelType,
    wheelCount: meta.wheelCount,
    wheelSize: meta.wheelSize,
    motor: meta.motor,
    meshKey: meta.meshKey || id,
    statMods: meta.statMods || {},
  };
}

/** Chassis / body frames — each changes 3D hull shape & base stats */
export const MODULAR_CHASSIS = [
  { id: 'rover', label: 'Compact Rover', icon: '🚗', meshShape: 'box', width: 1, height: 0.62, depth: 1.2, scale: 1, template: 'rover' },
  { id: 'tank', label: 'Heavy Tank', icon: '🪖', meshShape: 'box', width: 1.15, height: 0.72, depth: 1.35, scale: 1.08, template: 'tank' },
  { id: 'humanoid', label: 'Humanoid Torso', icon: '🤖', meshShape: 'box', width: 0.85, height: 0.95, depth: 0.7, scale: 1, template: 'humanoid' },
  { id: 'drone', label: 'Drone Core', icon: '🚁', meshShape: 'round', width: 0.9, height: 0.35, depth: 0.9, scale: 0.95, template: 'drone' },
  { id: 'spider', label: 'Spider Body', icon: '🕷️', meshShape: 'hex', width: 1, height: 0.45, depth: 1, scale: 1, template: 'spider' },
  { id: 'industrial', label: 'Industrial Platform', icon: '🏭', meshShape: 'box', width: 1.25, height: 0.78, depth: 1.4, scale: 1.12, template: 'rover' },
  { id: 'racing', label: 'Racing Chassis', icon: '🏎️', meshShape: 'wedge', width: 1.1, height: 0.42, depth: 1.5, scale: 1, template: 'rover' },
  { id: 'exploration', label: 'Exploration Frame', icon: '🔭', meshShape: 'wedge', width: 1.05, height: 0.58, depth: 1.25, scale: 1.02, template: 'rover' },
  { id: 'rescue', label: 'Rescue Chassis', icon: '🚑', meshShape: 'box', width: 1.1, height: 0.68, depth: 1.3, scale: 1.05, template: 'rover' },
  { id: 'utility', label: 'Utility Frame', icon: '🧰', meshShape: 'box', width: 1.2, height: 0.7, depth: 1.35, scale: 1.08, template: 'rover' },
  { id: 'cube', label: 'Modular Cube Frame', icon: '🧊', meshShape: 'box', width: 1, height: 1, depth: 1, scale: 1, template: 'blank' },
  { id: 'circular', label: 'Circular Chassis', icon: '⭕', meshShape: 'round', width: 1, height: 0.5, depth: 1, scale: 1, template: 'rover' },
  { id: 'scout', label: 'Scout Frame', icon: '🔍', meshShape: 'wedge', width: 0.85, height: 0.48, depth: 1.1, scale: 0.9, template: 'rover' },
  { id: 'combat', label: 'Armored Combat', icon: '🛡️', meshShape: 'box', width: 1.2, height: 0.75, depth: 1.35, scale: 1.1, template: 'tank' },
  { id: 'forklift', label: 'Forklift Platform', icon: '🏗️', meshShape: 'box', width: 1.05, height: 0.72, depth: 1.25, scale: 1.05, template: 'rover' },
  { id: 'hauler', label: 'Cargo Hauler', icon: '📦', meshShape: 'box', width: 1.35, height: 0.8, depth: 1.55, scale: 1.15, template: 'rover' },
  { id: 'mini', label: 'Mini Robot Body', icon: '🐜', meshShape: 'box', width: 0.65, height: 0.45, depth: 0.75, scale: 0.75, template: 'rover' },
  { id: 'mech', label: 'Giant Mech Body', icon: '🦾', meshShape: 'box', width: 1.4, height: 1.1, depth: 1.2, scale: 1.25, template: 'humanoid' },
  { id: 'amphibious', label: 'Amphibious Hull', icon: '🌊', meshShape: 'wedge', width: 1.1, height: 0.55, depth: 1.4, scale: 1.05, template: 'rover' },
  { id: 'hover_platform', label: 'Hover Platform', icon: '🛸', meshShape: 'round', width: 1.05, height: 0.38, depth: 1.05, scale: 1, template: 'drone' },
  { id: 'arm', label: 'Robot Arm Base', icon: '🦿', meshShape: 'arm', width: 0.7, height: 0.5, depth: 0.7, scale: 1, template: 'arm' },
  ...EXTENDED_CHASSIS,
];

export const REGISTRY_CATEGORIES = [
  { id: 'chassis', label: 'Chassis', icon: '🚗' },
  { id: 'movement', label: 'Movement', icon: '⚙️' },
  { id: 'head', label: 'Head / AI', icon: '👁' },
  { id: 'sensors', label: 'Sensors', icon: '📡' },
  { id: 'utility', label: 'Arms & Tools', icon: '🦾' },
  { id: 'power', label: 'Power', icon: '🔋' },
  { id: 'ai', label: 'Computers', icon: '🧠' },
  { id: 'comms', label: 'Comms', icon: '📶' },
  { id: 'armor', label: 'Armor', icon: '🛡️' },
  { id: 'structure', label: 'Structure', icon: '🔩' },
  { id: 'lighting', label: 'Lights', icon: '💡' },
  { id: 'cosmetic', label: 'Style', icon: '✨' },
  { id: 'fun', label: 'Fun', icon: '🎉' },
  ...EXTENDED_CATEGORIES,
];

export const MODULAR_PARTS = [
  // ── MOVEMENT: wheels ──
  part('movement', 'standard', 'Drive Wheels', '🛞', { wheels: { type: 'standard', count: 4, size: 'medium' } }, { wheelType: 'standard', wheelCount: 4 }),
  part('movement', 'small_wheels', 'Small Wheels', '⚪', { wheels: { type: 'standard', count: 4, size: 'small' } }, { wheelType: 'standard', wheelCount: 4, wheelSize: 'small', statMods: { agility: 8 } }),
  part('movement', 'heavy', 'Off-Road Wheels', '⚫', { wheels: { type: 'standard', count: 4, size: 'large', motor: 'strong' } }, { wheelType: 'standard', wheelCount: 4, wheelSize: 'large', motor: 'strong' }),
  part('movement', 'racing_wheels', 'Racing Wheels', '🏁', { wheels: { type: 'standard', count: 4, size: 'medium', motor: 'turbo' } }, { wheelType: 'standard', wheelCount: 4, motor: 'turbo', statMods: { speed: 12 } }),
  part('movement', 'omni', 'Omni Wheels', '🔘', { wheels: { type: 'mecanum', count: 4 } }, { wheelType: 'mecanum', wheelCount: 4, statMods: { agility: 15 } }),
  part('movement', 'mecanum', 'Mecanum Wheels', '↔️', { wheels: { type: 'mecanum', count: 4, size: 'medium' } }, { wheelType: 'mecanum', wheelCount: 4 }),
  part('movement', 'magnetic_wheels', 'Magnetic Wheels', '🧲', { wheels: { type: 'standard', count: 4 }, abilities: { magneticGrip: true } }, { wheelType: 'standard', wheelCount: 4 }),
  part('movement', 'glow_wheels', 'Glow Wheels', '✨', { wheels: { type: 'standard', count: 4 }, cosmetics: { accentLights: true } }, { wheelType: 'standard', wheelCount: 4 }),
  // tracks
  part('movement', 'tracks', 'Tank Tracks', '🏗️', { wheels: { type: 'tracks', count: 2, size: 'large' } }, { wheelType: 'tracks', wheelCount: 2 }),
  part('movement', 'mini_tracks', 'Mini Tracks', '🔗', { wheels: { type: 'tracks', count: 2, size: 'small' } }, { wheelType: 'tracks', wheelCount: 2, statMods: { agility: 5 } }),
  part('movement', 'rubber_tracks', 'Rubber Tracks', '⬛', { wheels: { type: 'tracks', count: 2, size: 'medium', motor: 'strong' } }, { wheelType: 'tracks', wheelCount: 2, motor: 'strong' }),
  // legs
  part('movement', 'legs', 'Walking Legs', '🦿', { wheels: { type: 'legs', count: 4 } }, { wheelType: 'legs', wheelCount: 4 }),
  part('movement', 'spider_legs', 'Spider Legs', '🕷️', { wheels: { type: 'legs', count: 6 } }, { wheelType: 'legs', wheelCount: 6 }),
  part('movement', 'hydraulic_legs', 'Hydraulic Legs', '🦖', { wheels: { type: 'legs', count: 2, size: 'large', motor: 'strong' } }, { wheelType: 'legs', wheelCount: 2, motor: 'strong' }),
  part('movement', 'walker', 'Articulated Walker', '🦕', { wheels: { type: 'legs', count: 2, size: 'large' } }, { wheelType: 'legs', wheelCount: 2 }),
  part('movement', 'climbing_legs', 'Climbing Legs', '🧗', { wheels: { type: 'legs', count: 4 }, abilities: { climb: true } }, { wheelType: 'legs', wheelCount: 4 }),
  // flight / hover
  part('movement', 'hover', 'Hover Pods', '💨', { wheels: { type: 'hover', count: 4 } }, { wheelType: 'hover', wheelCount: 4 }),
  part('movement', 'jet', 'Jet Thrusters', '🚀', { wheels: { type: 'hover', count: 2, motor: 'turbo' }, abilities: { speedBoost: true } }, { wheelType: 'hover', wheelCount: 2, motor: 'turbo' }),
  part('movement', 'rotors', 'Drone Rotors', '🚁', { wheels: { type: 'hover', count: 4 }, template: 'drone' }, { wheelType: 'hover', wheelCount: 4 }),
  part('movement', 'quad_props', 'Quadcopter Props', '🛸', { wheels: { type: 'hover', count: 4 } }, { wheelType: 'hover', wheelCount: 4 }),
  part('movement', 'antigrav', 'Anti-Gravity Pads', '🌌', { wheels: { type: 'hover', count: 4 }, abilities: { antigrav: true } }, { wheelType: 'hover', wheelCount: 4 }),
  part('movement', 'amphibious_prop', 'Amphibious Propellers', '🌊', { wheels: { type: 'hover', count: 2 }, abilities: { amphibious: true } }, { wheelType: 'hover', wheelCount: 2 }),
  part('movement', 'magnetic_rail', 'Magnetic Rail Glide', '🛤️', { wheels: { type: 'mecanum', count: 2 }, abilities: { magneticGrip: true } }, { wheelType: 'mecanum', wheelCount: 2 }),

  // ── HEADS ──
  part('head', 'camera', 'Camera Head', '📷', { sensors: { camera: true } }),
  part('head', 'ai_visor', 'AI Visor', '🥽', { sensors: { camera: true }, cosmetics: { accentLights: true } }),
  part('head', 'holo_face', 'Holo Face', '😊', { sensors: { camera: true }, cosmetics: { accentLights: true, ledColor: '#00D9FF' } }),
  part('head', 'tactical', 'Tactical Head', '🎯', { sensors: { camera: true, thermal: true } }),
  part('head', 'radar_pod', 'Radar Dome', '📻', { sensors: { lidar: true, proximity: true } }, { unlocks: ['lidar_sweep'] }),
  part('head', 'drone_optic', 'Drone Optics', '👁', { sensors: { camera360: true, gyroscope: true } }),
  part('head', 'surveillance', 'Surveillance Head', '📹', { sensors: { camera: true, nightVision: true } }),
  part('head', 'dual_eye', 'Dual-Eye AI', '👀', { sensors: { camera: true, proximity: true } }),
  part('head', 'android_head', 'Android Head', '🤖', { sensors: { camera: true }, cosmetics: { accentLights: true } }),
  part('head', 'animal_head', 'Animal Head', '🐶', { sensors: { camera: true }, cosmetics: { pattern: 'fun' } }),

  // ── SENSORS ──
  part('sensors', 'ultrasonic', 'Ultrasonic', '📡', { sensors: { ultrasonic: true } }, { unlocks: ['scan', 'if_obstacle'] }),
  part('sensors', 'lidar', 'LIDAR Dome', '🔦', { sensors: { lidar: true } }, { unlocks: ['lidar_sweep'] }),
  part('sensors', 'thermal', 'Thermal Cam', '🌡️', { sensors: { thermal: true } }, { unlocks: ['thermal_scan'] }),
  part('sensors', 'infrared', 'Infrared Vision', '🔴', { sensors: { nightVision: true } }, { unlocks: ['night_vision'] }),
  part('sensors', 'proximity', 'Proximity Array', '📍', { sensors: { proximity: true, collision: true } }, { unlocks: ['scan', 'if_obstacle'] }),
  part('sensors', 'gyro', 'Gyroscope', '🧭', { sensors: { gyroscope: true, accelerometer: true } }),
  part('sensors', 'depth', 'Depth Camera', '📐', { sensors: { ultrasonic: true, inclinometer: true } }),
  part('sensors', 'env', 'Environment Pack', '🌍', { sensors: { temperature: true, humidity: true, light: true } }, { unlocks: ['read_temp'] }),
  part('sensors', 'gps', 'GPS Module', '🛰️', { sensors: { gps: true } }, { unlocks: ['navigate_to'] }),
  part('sensors', 'compass', 'Compass', '🧭', { sensors: { compass: true } }),
  part('sensors', 'motion', 'Motion Detector', '👁️', { sensors: { motion: true, proximity: true } }),
  part('sensors', 'voice', 'Voice Recognition', '🎤', { sensors: { voice: true } }, { unlocks: ['listen_voice'] }),
  part('sensors', 'face', 'Face Recognition', '😀', { sensors: { faceDetect: true, camera: true } }, { unlocks: ['detect_face'] }),

  // ── UTILITY / ARMS ──
  part('utility', 'claw', 'Robotic Claw', '🦀', { tools: { pincer: true, grabber: 'pincer' } }, { unlocks: ['grab'] }),
  part('utility', 'gripper', 'Precision Gripper', '🤏', { tools: { gripper: true, grabber: 'gripper' } }, { unlocks: ['grab'] }),
  part('utility', 'blade', 'Dozer Blade', '🚜', { tools: { bulldozer: true } }),
  part('utility', 'forklift', 'Forklift', '🏗️', { tools: { longArm: true, pusher: 'fork' } }, { unlocks: ['lift'] }),
  part('utility', 'magnet', 'Magnet Arm', '🧲', { tools: { magnet: true } }, { unlocks: ['magnet_pick'] }),
  part('utility', 'drill', 'Drill', '⛏️', { tools: { drill: true } }, { unlocks: ['drill'] }),
  part('utility', 'vacuum', 'Vacuum', '🌀', { tools: { vacuum: true } }, { unlocks: ['vacuum'] }),
  part('utility', 'laser', 'Laser Pointer', '🔴', { tools: { laser: true } }),
  part('utility', 'welder', 'Welding Torch', '🔥', { tools: { flamethrower: true } }),
  part('utility', 'scanner_tool', 'Scanner Tool', '🔍', { tools: { scanner: true } }, { unlocks: ['scan_area'] }),
  part('utility', 'telescopic_arm', 'Telescopic Arm', '📏', { tools: { longArm: true } }),
  part('utility', 'cargo_hook', 'Cargo Hook', '🪝', { tools: { hook: true } }, { unlocks: ['grab'] }),
  part('utility', 'soft_gripper', 'Soft Gripper', '🧤', { tools: { gripper: true, grabber: 'soft' } }, { unlocks: ['grab'] }),

  // ── POWER ──
  part('power', 'battery', 'Battery Pack', '🔋', { wheels: { motor: 'medium' } }, { statMods: { battery: 15 } }),
  part('power', 'fusion', 'Fusion Core', '☢️', { wheels: { motor: 'turbo' }, abilities: { speedBoost: true } }, { statMods: { power: 25, battery: 30 } }),
  part('power', 'solar', 'Solar Panels', '☀️', { abilities: { solarCharge: true } }, { statMods: { battery: 10 } }),
  part('power', 'backup', 'Backup Cells', '🔌', { abilities: { regeneration: true } }),
  part('power', 'capacitor', 'Capacitor Bank', '⚡', { abilities: { speedBoost: true } }, { statMods: { agility: 10 } }),
  part('power', 'cooling', 'Cooling System', '❄️', { chassis: { material: 'metal' } }),
  part('power', 'generator', 'Power Generator', '🔧', { statMods: { power: 20 } }),

  // ── AI / COMPUTERS ──
  part('ai', 'basic_ai', 'Basic AI Core', '🧠', { sensors: { ai: true } }),
  part('ai', 'advanced_ai', 'Advanced AI Core', '🤖', { sensors: { ai: true, camera: true } }, { unlocks: ['ai_decide'] }),
  part('ai', 'neural', 'Neural Processor', '🧬', { sensors: { ai: true }, abilities: { learning: true } }, { unlocks: ['ai_decide', 'detect_face'] }),
  part('ai', 'nav_computer', 'Navigation Computer', '🗺️', { sensors: { gps: true, gyroscope: true } }, { unlocks: ['navigate_to'] }),
  part('ai', 'pathfinding', 'Pathfinding Module', '🛤️', { abilities: { autoPath: true } }, { unlocks: ['navigate_to'] }),
  part('ai', 'voice_ai', 'Voice AI', '🗣️', { sensors: { voice: true, ai: true } }, { unlocks: ['listen_voice'] }),

  // ── COMMS ──
  part('comms', 'antenna', 'Antenna', '📡', { cosmetics: { accentLights: true } }),
  part('comms', 'dish', 'Satellite Dish', '🛰️', { sensors: { light: true } }),
  part('comms', 'holo_proj', 'Holo Projector', '🌈', { cosmetics: { accentLights: true, ledColor: '#FF006E' } }),
  part('comms', 'radio', 'Radio System', '📻', { cosmetics: { soundTheme: 'beeps' } }),
  part('comms', 'speaker', 'Speaker', '🔊', { tools: { speaker: true } }),
  part('comms', 'mic', 'Microphone', '🎙️', { sensors: { voice: true } }, { unlocks: ['listen_voice'] }),

  // ── ARMOR / STRUCTURE ──
  part('armor', 'light_plate', 'Light Armor', '🛡️', { chassis: { material: 'metal' }, statMods: { weight: 5 } }),
  part('armor', 'heavy_plate', 'Heavy Armor', '🏰', { chassis: { material: 'metal', size: 'large' }, statMods: { weight: 15, speed: -8 } }),
  part('armor', 'bumper', 'Bumper Guard', '🚧', { tools: { bulldozer: true } }),
  part('armor', 'side_plate', 'Side Plating', '⬜', { statMods: { stability: 10 } }),
  part('structure', 'beam', 'Support Beam', '📏', { statMods: { stability: 8 } }),
  part('structure', 'hinge', 'Hinge Joint', '🔗', { statMods: { agility: 3 } }),
  part('structure', 'bracket', 'Mount Bracket', '📐', {}),
  part('structure', 'connector', 'Connector Hub', '🔌', {}),

  // ── LIGHTING ──
  part('lighting', 'headlights', 'Headlights', '🔦', { cosmetics: { accentLights: true } }, { unlocks: ['lights_on'] }),
  part('lighting', 'underglow', 'Underglow', '💜', { cosmetics: { accentLights: true, ledColor: '#8B00FF' } }, { unlocks: ['lights_on'] }),
  part('lighting', 'warning', 'Warning Lights', '🚨', { cosmetics: { accentLights: true, ledColor: '#ef4444' } }),
  part('lighting', 'emergency', 'Emergency Beacon', '🆘', { cosmetics: { accentLights: true } }),

  // ── COSMETIC / FUN ──
  part('cosmetic', 'neon', 'Neon Strip', '💜', { cosmetics: { accentLights: true, ledColor: '#8B00FF' } }),
  part('cosmetic', 'glow', 'Energy Tubes', '⚡', { cosmetics: { accentLights: true, ledColor: '#00FF41' } }),
  part('cosmetic', 'decals', 'Racing Decals', '🏁', { chassis: { pattern: 'racing' } }),
  part('cosmetic', 'carbon', 'Carbon Finish', '⬛', { chassis: { material: 'carbon' } }),
  part('fun', 'disco', 'Disco Lights', '🪩', { cosmetics: { accentLights: true }, abilities: { chaosMode: true } }),
  part('fun', 'foam', 'Foam Cannon', '🫧', { tools: { ballLauncher: true } }),
  part('fun', 'confetti', 'Confetti Launcher', '🎊', { tools: { dart: true }, abilities: { chaosMode: true } }),
  part('fun', 'paint_sprayer', 'Paint Sprayer', '🎨', { tools: { water: true } }),
  part('fun', 'turbo', 'Turbo Boost', '⚡', { abilities: { speedBoost: true }, wheels: { motor: 'turbo' } }),
  part('fun', 'led_projector', 'LED Projector', '📽️', { cosmetics: { accentLights: true } }),
  ...EXTENDED_PARTS,
];

export function getRegistryPart(category, partId) {
  return MODULAR_PARTS.find((p) => p.category === category && p.id === partId);
}

export function getRegistryChassis(id) {
  return MODULAR_CHASSIS.find((c) => c.id === id);
}

/** Flat list for workshop / assembly validation */
export const MODULAR_WORKSHOP_PARTS = MODULAR_PARTS.map(({ category, id, label, icon }) => ({
  category,
  id,
  label,
  icon,
}));

/** Build MODULE_PARTS map for robot-catalog applyModulePatch */
export function buildModulePartsMap() {
  const map = {};
  for (const p of MODULAR_PARTS) {
    if (!map[p.category]) map[p.category] = [];
    map[p.category].push({
      id: p.id,
      label: p.label,
      icon: p.icon,
      patch: p.patch,
      unlocks: p.unlocks,
    });
  }
  map.chassis = MODULAR_CHASSIS.map((c) => ({
    id: c.id,
    label: c.label,
    icon: c.icon,
    patch: {
      template: c.template || 'rover',
      chassis: {
        shape: c.meshShape === 'round' || c.meshShape === 'hex' ? 'circular' : 'rectangular',
        material: 'plastic',
        size: c.scale >= 1.1 ? 'large' : c.scale <= 0.85 ? 'small' : 'medium',
      },
    },
  }));
  return map;
}

export function applyMovementFromRegistry(design, movementSlot) {
  if (!movementSlot) return design;
  const meta = getRegistryPart(movementSlot.category, movementSlot.partId);
  if (!meta?.wheelType) return design;
  return {
    ...design,
    wheels: {
      ...design.wheels,
      type: meta.wheelType,
      count: meta.wheelCount ?? (meta.wheelType === 'tracks' ? 2 : meta.wheelType === 'legs' ? 4 : 4),
      size: meta.wheelSize || design.wheels?.size || 'medium',
      motor: meta.motor || design.wheels?.motor,
    },
  };
}

export const ALL_SLOT_IDS = [
  'movement', 'head', 'front', 'left', 'right', 'back', 'top', 'addon_a', 'addon_b',
];
