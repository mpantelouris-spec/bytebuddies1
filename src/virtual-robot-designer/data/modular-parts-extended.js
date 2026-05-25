/**
 * Extended modular catalog — structural, face, water, decoration, extra movement & tools.
 * Merged into MODULAR_PARTS by modular-parts-registry.js
 */

function part(category, id, label, icon, patch = {}, meta = {}) {
  return {
    category, id, label, icon, patch,
    unlocks: meta.unlocks,
    wheelType: meta.wheelType,
    wheelCount: meta.wheelCount,
    wheelSize: meta.wheelSize,
    motor: meta.motor,
    meshKey: meta.meshKey || id,
    statMods: meta.statMods || {},
    tags: meta.tags || [],
  };
}

export const EXTENDED_CHASSIS = [
  { id: 'underwater', label: 'Submarine Hull', icon: '🐟', meshShape: 'wedge', width: 1.1, height: 0.5, depth: 1.5, scale: 1.05, template: 'rover' },
  { id: 'animal_quad', label: 'Animal Quad Body', icon: '🐕', meshShape: 'box', width: 1, height: 0.55, depth: 1.3, scale: 1, template: 'rover' },
  { id: 'battle_bot', label: 'Battle Bot Frame', icon: '⚔️', meshShape: 'box', width: 1.15, height: 0.7, depth: 1.2, scale: 1.08, template: 'tank' },
  { id: 'companion', label: 'AI Companion Body', icon: '💙', meshShape: 'round', width: 0.75, height: 0.85, depth: 0.75, scale: 0.9, template: 'rover' },
  { id: 'transformer', label: 'Transform Frame', icon: '🔀', meshShape: 'wedge', width: 1, height: 0.65, depth: 1.1, scale: 1, template: 'blank' },
  { id: 'toy_frame', label: 'Toy Frame', icon: '🧸', meshShape: 'box', width: 0.9, height: 0.7, depth: 0.9, scale: 0.95, template: 'blank' },
  { id: 'sci_fi', label: 'Sci-Fi Shell', icon: '🌌', meshShape: 'hex', width: 1.05, height: 0.6, depth: 1.15, scale: 1.02, template: 'drone' },
  { id: 'aero', label: 'Aerodynamic Shell', icon: '✈️', meshShape: 'wedge', width: 1.2, height: 0.4, depth: 1.6, scale: 1.05, template: 'racing' },
];

export const EXTENDED_CATEGORIES = [
  { id: 'face', label: 'Face Parts', icon: '😊' },
  { id: 'decoration', label: 'Decorate', icon: '🎨' },
];

export const EXTENDED_PARTS = [
  // More movement
  part('movement', 'monster_wheels', 'Monster Truck Wheels', '🛻', { wheels: { type: 'standard', count: 4, size: 'large', motor: 'strong' } }, { wheelType: 'standard', wheelCount: 4, wheelSize: 'large', motor: 'strong', tags: ['wheeled'] }),
  part('movement', 'caster', 'Robotic Casters', '⚙️', { wheels: { type: 'mecanum', count: 4, size: 'small' } }, { wheelType: 'mecanum', wheelCount: 4, tags: ['wheeled'] }),
  part('movement', 'snow_tracks', 'Snow Tracks', '❄️', { wheels: { type: 'tracks', count: 2, size: 'large' } }, { wheelType: 'tracks', wheelCount: 2, tags: ['wheeled'] }),
  part('movement', 'industrial_treads', 'Industrial Treads', '🏭', { wheels: { type: 'tracks', count: 2, motor: 'strong' } }, { wheelType: 'tracks', wheelCount: 2 }),
  part('movement', 'mech_legs', 'Mech Legs', '🦾', { wheels: { type: 'legs', count: 2, size: 'large' } }, { wheelType: 'legs', wheelCount: 2, tags: ['humanoid', 'mech'] }),
  part('movement', 'insect_legs', 'Insect Legs', '🐛', { wheels: { type: 'legs', count: 6 } }, { wheelType: 'legs', wheelCount: 6, tags: ['spider'] }),
  part('movement', 'spring_legs', 'Spring Legs', '🦘', { wheels: { type: 'legs', count: 2 }, abilities: { jump: true } }, { wheelType: 'legs', wheelCount: 2, unlocks: ['jump'] }),
  part('movement', 'wings', 'Wing System', '🪽', { wheels: { type: 'hover', count: 2 }, abilities: { glide: true } }, { wheelType: 'hover', wheelCount: 2, tags: ['flying'] }),
  part('movement', 'rocket', 'Rocket Thrusters', '🔥', { wheels: { type: 'hover', count: 2, motor: 'turbo' }, abilities: { speedBoost: true } }, { wheelType: 'hover', wheelCount: 2, motor: 'turbo', tags: ['flying'] }),
  part('movement', 'stabilizer', 'Flight Stabilizers', '⚖️', { sensors: { gyroscope: true }, wheels: { type: 'hover', count: 4 } }, { wheelType: 'hover', wheelCount: 4, tags: ['flying'] }),
  part('movement', 'sub_thruster', 'Submarine Thruster', '🐟', { wheels: { type: 'hover', count: 2 }, abilities: { underwater: true } }, { wheelType: 'hover', wheelCount: 2, tags: ['underwater'], unlocks: ['dive'] }),
  part('movement', 'underwater_prop', 'Underwater Propeller', '🌊', { wheels: { type: 'hover', count: 2 }, abilities: { amphibious: true, underwater: true } }, { wheelType: 'hover', wheelCount: 2, tags: ['underwater'], unlocks: ['dive'] }),
  part('movement', 'aquatic_fins', 'Aquatic Fins', '🐠', { wheels: { type: 'legs', count: 4 }, abilities: { underwater: true } }, { wheelType: 'legs', wheelCount: 4, tags: ['underwater'] }),

  // Structural
  part('structure', 'core_frame', 'Core Frame', '⬡', { statMods: { stability: 12 } }),
  part('structure', 'light_frame', 'Lightweight Frame', '🪶', { statMods: { agility: 10, weight: -8 } }),
  part('structure', 'armored_shell', 'Armored Shell', '🛡️', { chassis: { material: 'metal' }, statMods: { weight: 10, stability: 15 } }),
  part('structure', 'cube_connector', 'Cube Connector', '🧊', {}),
  part('structure', 'circular_hub', 'Circular Hub', '⭕', {}),
  part('structure', 'rotating_base', 'Rotating Base', '🔄', { abilities: { rotateBase: true } }),
  part('structure', 'snap_connector', 'Snap Connector', '🧲', {}),
  part('structure', 'magnetic_joint', 'Magnetic Joint', '🧲', { abilities: { magneticGrip: true } }),
  part('structure', 'expand_section', 'Expandable Section', '📐', { statMods: { stability: 5 } }),
  part('structure', 'reinforced', 'Reinforced Support', '🏗️', { statMods: { stability: 18 } }),

  // Arms & tools
  part('utility', 'robotic_arm', 'Robotic Arm', '🦾', { tools: { longArm: true } }, { unlocks: ['arm_rotate'] }),
  part('utility', 'hydraulic_arm', 'Hydraulic Arm', '🔧', { tools: { longArm: true, pusher: 'hydraulic' } }),
  part('utility', 'crane_arm', 'Crane Arm', '🏗️', { tools: { longArm: true } }, { unlocks: ['lift'] }),
  part('utility', 'tentacle', 'Tentacle Arm', '🐙', { tools: { gripper: true, grabber: 'soft' } }, { unlocks: ['grab'] }),
  part('utility', 'suction', 'Suction Cup', '🔵', { tools: { vacuum: true, grabber: 'suction' } }, { unlocks: ['grab'] }),
  part('utility', 'scoop', 'Scoop Shovel', '🥄', { tools: { bulldozer: true } }),
  part('utility', 'foam_blaster', 'Foam Blaster', '🫧', { tools: { ballLauncher: true } }),
  part('utility', 'paint_gun', 'Paint Gun', '🎨', { tools: { water: true } }),
  part('utility', 'repair_arm', 'Repair Tool', '🔩', { tools: { scanner: true } }),

  // Heads
  part('head', 'helmet_head', 'Helmet Head', '⛑️', { cosmetics: { accentLights: true } }),
  part('head', 'cube_head', 'Cube Head', '🧊', { sensors: { camera: true } }),
  part('head', 'round_head', 'Rounded Head', '⚪', { sensors: { camera: true }, cosmetics: { accentLights: true } }),
  part('head', 'mech_head', 'Mech Head', '🦾', { sensors: { camera: true, thermal: true } }),

  // Face components (mount on head slot)
  part('face', 'led_eyes', 'LED Eyes', '👀', { cosmetics: { accentLights: true, ledColor: '#00D9FF' } }),
  part('face', 'holo_eyes', 'Holographic Eyes', '✨', { cosmetics: { accentLights: true } }, { unlocks: ['lights_on'] }),
  part('face', 'digital_mouth', 'Digital Mouth', '👄', { tools: { speaker: true } }),
  part('face', 'emotion_display', 'Emotion Display', '😊', { sensors: { ai: true }, cosmetics: { accentLights: true } }),
  part('face', 'sensor_array', 'Sensor Array', '📡', { sensors: { proximity: true, ultrasonic: true } }, { unlocks: ['scan'] }),
  part('face', 'antenna_ears', 'Antenna Ears', '📶', { cosmetics: { accentLights: true } }),

  // Sensors
  part('sensors', 'touch', 'Touch Sensor', '👆', { sensors: { touch: true, collision: true } }),
  part('sensors', 'pressure', 'Pressure Sensor', '⚖️', { sensors: { pressure: true } }),
  part('sensors', 'color', 'Color Sensor', '🌈', { sensors: { color: true, camera: true } }, { unlocks: ['follow_line'] }),
  part('sensors', 'light', 'Light Sensor', '💡', { sensors: { light: true } }),
  part('sensors', 'heat', 'Heat Sensor', '🔥', { sensors: { thermal: true } }),

  // Power
  part('power', 'reactor', 'Glowing Reactor', '☢️', { abilities: { speedBoost: true }, cosmetics: { accentLights: true } }, { statMods: { power: 30 } }),
  part('power', 'energy_conduit', 'Energy Conduit', '⚡', { cosmetics: { accentLights: true, ledColor: '#00FF41' } }),
  part('power', 'wire_harness', 'Wire Harness', '🔌', {}),

  // Decoration
  part('decoration', 'shoulder_pads', 'Shoulder Pads', '🏈', { statMods: { stability: 5 } }),
  part('decoration', 'spikes', 'Spike Kit', '🔱', { cosmetics: { pattern: 'aggressive' } }),
  part('decoration', 'fins', 'Decorative Fins', '🐟', {}),
  part('decoration', 'cape', 'Hero Cape', '🦸', { cosmetics: { pattern: 'fun' } }),
  part('decoration', 'flag', 'Flag', '🚩', {}),
  part('decoration', 'exhaust', 'Exhaust Pipes', '💨', { cosmetics: { accentLights: true } }),
  part('decoration', 'sticker_pack', 'Sticker Pack', '⭐', { cosmetics: { pattern: 'racing' } }),
  part('decoration', 'hologram', 'Hologram Panel', '🌈', { cosmetics: { accentLights: true, ledColor: '#FF006E' } }),
  part('decoration', 'vent_decor', 'Decorative Vents', '💨', {}),

  // Cosmetic materials
  part('cosmetic', 'metallic', 'Metallic Finish', '✨', { chassis: { material: 'metal' } }),
  part('cosmetic', 'matte', 'Matte Finish', '⬜', { chassis: { material: 'plastic' } }),
  part('cosmetic', 'glow_trim', 'Glow Trim', '💫', { cosmetics: { accentLights: true } }),
];
