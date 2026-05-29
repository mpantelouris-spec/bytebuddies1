/**
 * Specialized robotics parts — per robot family (plane, security, LEGO, medical, etc.)
 * Merged into modular-parts-full-catalog.js
 */

function p(category, id, label, icon, patch = {}, meta = {}) {
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
    visual: meta.visual || category,
    statMods: meta.statMods || {},
    tags: meta.tags || [],
  };
}

function chassis(id, label, icon, shape, w, h, d, scale, template) {
  return {
    id,
    label,
    icon,
    meshShape: shape,
    width: w,
    height: h,
    depth: d,
    scale,
    template: template || 'rover',
  };
}

/** Extra chassis bodies aligned with robot families in the build spec */
export const SPECIALIZED_CHASSIS = [
  chassis('exploration_rover', 'Exploration Rover', '🔭', 'wedge', 1.1, 0.58, 1.35, 1.04, 'rover'),
  chassis('racing_rover', 'Racing Rover', '🏎️', 'wedge', 1.05, 0.4, 1.55, 1, 'racing'),
  chassis('armored_rover', 'Armored Rover', '🛡️', 'box', 1.18, 0.74, 1.32, 1.1, 'tank'),
  chassis('cargo_rover', 'Cargo Rover', '📦', 'box', 1.3, 0.78, 1.5, 1.14, 'rover'),
  chassis('climbing_spider', 'Climbing Spider', '🕷️', 'hex', 0.95, 0.42, 1.05, 0.98, 'spider'),
  chassis('tactical_spider', 'Tactical Spider', '🎯', 'hex', 1.05, 0.48, 1.1, 1.02, 'spider'),
  chassis('stealth_spider', 'Stealth Spider', '👤', 'hex', 0.9, 0.38, 1, 0.92, 'spider'),
  chassis('android_body', 'Android Body', '🤖', 'box', 0.82, 0.98, 0.68, 1, 'humanoid'),
  chassis('athletic_humanoid', 'Athletic Frame', '🏃', 'box', 0.78, 0.92, 0.65, 0.95, 'humanoid'),
  chassis('quadcopter', 'Quadcopter Frame', '🚁', 'round', 0.88, 0.32, 0.88, 0.94, 'drone'),
  chassis('racing_drone', 'Racing Drone', '🏁', 'round', 0.75, 0.28, 0.85, 0.88, 'drone'),
  chassis('cargo_drone', 'Cargo Drone', '📦', 'round', 1.05, 0.4, 1.05, 1.02, 'drone'),
  chassis('stealth_drone', 'Stealth Drone', '🌑', 'wedge', 0.95, 0.3, 1.15, 0.96, 'drone'),
  chassis('jet_fighter', 'Fighter Jet Frame', '✈️', 'wedge', 1.15, 0.38, 1.7, 1.08, 'jet'),
  chassis('glider', 'Glider Body', '🪂', 'wedge', 1.2, 0.28, 1.8, 1.05, 'jet'),
  chassis('transport_plane', 'Transport Plane', '🛫', 'box', 1.35, 0.55, 1.9, 1.15, 'jet'),
  chassis('stunt_plane', 'Stunt Aircraft', '🎪', 'wedge', 1, 0.35, 1.45, 1, 'jet'),
  chassis('submarine_hull', 'Submarine Hull', '🐟', 'wedge', 1.15, 0.52, 1.55, 1.08, 'submarine'),
  chassis('aquatic_drone', 'Aquatic Drone', '🐠', 'round', 0.95, 0.4, 1.1, 1, 'submarine'),
  chassis('anti_gravity_platform', 'Anti-Gravity Platform', '🛸', 'round', 1.1, 0.35, 1.1, 1.05, 'hover'),
  chassis('hover_racing', 'Hover Racing Shell', '💨', 'wedge', 1.05, 0.32, 1.4, 1.02, 'hover'),
  chassis('factory_base', 'Factory Machine Base', '🏭', 'box', 1.3, 0.82, 1.45, 1.15, 'arm'),
  chassis('crane_platform', 'Crane Platform', '🏗️', 'arm', 1.1, 0.75, 1.2, 1.1, 'arm'),
  chassis('space_rover', 'Space Explorer Frame', '🌌', 'box', 1.05, 0.65, 1.25, 1.05, 'rover'),
];

export const SPECIALIZED_PARTS = [
  // ── ROVER MOVEMENT (extra) ──
  p('movement', 'offroad_wheels', 'Off-Road Wheels', '🏔️', { wheels: { type: 'standard', count: 4, size: 'large', motor: 'strong' } }, { wheelType: 'standard', wheelCount: 4, wheelSize: 'large', motor: 'strong', statMods: { stability: 10 }, tags: ['rover', 'wheeled'] }),
  p('movement', 'suspension_wheels', 'Suspension Wheels', '🔩', { wheels: { type: 'standard', count: 4, size: 'medium', motor: 'medium' } }, { wheelType: 'standard', wheelCount: 4, statMods: { stability: 12, agility: 4 }, tags: ['rover'] }),
  p('movement', 'crawler_wheels', 'Crawler Wheels', '🐛', { wheels: { type: 'standard', count: 6, size: 'large' } }, { wheelType: 'standard', wheelCount: 6, statMods: { stability: 14 }, tags: ['rover'] }),
  p('movement', 'mining_tracks', 'Mining Tracks', '⛏️', { wheels: { type: 'tracks', count: 2, motor: 'strong' } }, { wheelType: 'tracks', wheelCount: 2, motor: 'strong', unlocks: ['drill'], tags: ['rover', 'mining'] }),

  // ── SPIDER ──
  p('movement', 'agile_spider_legs', 'Agile Spider Legs', '🕷️', { wheels: { type: 'legs', count: 6 } }, { wheelType: 'legs', wheelCount: 6, statMods: { agility: 18 }, tags: ['spider', 'climb'] }),
  p('movement', 'heavy_spider_legs', 'Heavy Spider Legs', '🦂', { wheels: { type: 'legs', count: 6, motor: 'strong' } }, { wheelType: 'legs', wheelCount: 6, motor: 'strong', statMods: { stability: 15, weight: 8 }, tags: ['spider'] }),
  p('movement', 'magnetic_climb_legs', 'Magnetic Climbing Legs', '🧲', { wheels: { type: 'legs', count: 6 }, abilities: { climb: true, magneticGrip: true } }, { wheelType: 'legs', wheelCount: 6, unlocks: ['climb'], tags: ['spider', 'climb'] }),
  p('sensors', 'spider_eyes', 'Spider Eye Array', '👁️', { sensors: { camera: true, proximity: true, nightVision: true } }, { visual: 'sensor_camera', tags: ['spider'] }),
  p('utility', 'wall_grips', 'Wall Grip Pads', '🧗', { abilities: { climb: true } }, { visual: 'structure', statMods: { agility: 6 }, tags: ['spider'] }),
  p('utility', 'venom_probe', 'Research Probe', '💉', { tools: { scanner: true } }, { visual: 'arm_tool', unlocks: ['scan_area'], tags: ['spider'] }),
  p('utility', 'climbing_claws_attach', 'Climbing Claws', '🦞', { abilities: { climb: true }, tools: { pincer: true } }, { visual: 'arm_claw', unlocks: ['grab', 'climb'], tags: ['spider'] }),

  // ── DRONE / PLANE ──
  p('movement', 'racing_propellers', 'Racing Propellers', '🏁', { wheels: { type: 'hover', count: 4, motor: 'turbo' } }, { wheelType: 'hover', wheelCount: 4, motor: 'turbo', statMods: { speed: 14 }, tags: ['flying', 'drone'] }),
  p('movement', 'stealth_propellers', 'Stealth Propellers', '🌑', { wheels: { type: 'hover', count: 4 }, abilities: { stealth: true } }, { wheelType: 'hover', wheelCount: 4, tags: ['flying', 'drone'] }),
  p('movement', 'heavy_lift_rotors', 'Heavy Lift Rotors', '📦', { wheels: { type: 'hover', count: 4, motor: 'strong' } }, { wheelType: 'hover', wheelCount: 4, motor: 'strong', statMods: { power: 12 }, tags: ['flying', 'drone'] }),
  p('movement', 'jet_turbines', 'Jet Turbines', '✈️', { wheels: { type: 'hover', count: 2, motor: 'turbo' }, abilities: { speedBoost: true, glide: true } }, { wheelType: 'hover', wheelCount: 2, motor: 'turbo', tags: ['flying', 'jet'] }),
  p('movement', 'propeller_engines', 'Propeller Engines', '🌀', { wheels: { type: 'hover', count: 2 } }, { wheelType: 'hover', wheelCount: 2, tags: ['flying', 'jet'] }),
  p('movement', 'wing_flaps', 'Wing Flaps', '🪽', { wheels: { type: 'hover', count: 2 }, abilities: { glide: true } }, { wheelType: 'hover', wheelCount: 2, visual: 'plane_wing', tags: ['flying', 'jet'] }),
  p('movement', 'flight_stabilizers', 'Flight Stabilizers', '⚖️', { sensors: { gyroscope: true }, wheels: { type: 'hover', count: 2 } }, { wheelType: 'hover', wheelCount: 2, statMods: { stability: 12 }, visual: 'plane_stabilizer', tags: ['flying'] }),
  p('structure', 'main_wings', 'Main Wings', '✈️', { abilities: { glide: true } }, { visual: 'plane_wing', statMods: { stability: 10 }, tags: ['jet', 'plane'] }),
  p('structure', 'rudder', 'Tail Rudder', '🎯', { sensors: { gyroscope: true } }, { visual: 'plane_stabilizer', tags: ['jet', 'plane'] }),
  p('structure', 'jet_exhaust', 'Jet Exhaust', '🔥', { cosmetics: { accentLights: true }, abilities: { speedBoost: true } }, { visual: 'plane_exhaust', tags: ['jet'] }),
  p('structure', 'cockpit_canopy', 'Cockpit Canopy', '🪟', { sensors: { camera: true } }, { visual: 'plane_canopy', tags: ['jet', 'plane'] }),
  p('sensors', 'aerial_camera', 'Aerial Camera', '📷', { sensors: { camera: true, camera360: true } }, { visual: 'sensor_camera', unlocks: ['aerial_scan'], tags: ['drone', 'flying'] }),
  p('structure', 'prop_guard', 'Propeller Guards', '⭕', { statMods: { stability: 8 } }, { visual: 'drone_guard', tags: ['drone'] }),
  p('utility', 'cargo_hook', 'Cargo Hook', '🪝', { tools: { hook: true, longArm: true } }, { unlocks: ['lift', 'grab'], visual: 'arm_fork', tags: ['drone'] }),

  // ── HOVER ──
  p('movement', 'hover_engines', 'Hover Engines', '💨', { wheels: { type: 'hover', count: 4 } }, { wheelType: 'hover', wheelCount: 4, tags: ['hover', 'flying'] }),
  p('movement', 'levitation_rings', 'Levitation Rings', '💫', { wheels: { type: 'hover', count: 4 }, abilities: { antigrav: true } }, { wheelType: 'hover', wheelCount: 4, visual: 'hover_ring', tags: ['hover', 'flying'] }),
  p('movement', 'hover_boosters', 'Hover Boosters', '🚀', { wheels: { type: 'hover', count: 4, motor: 'turbo' }, abilities: { speedBoost: true } }, { wheelType: 'hover', wheelCount: 4, motor: 'turbo', statMods: { speed: 10 }, tags: ['hover'] }),

  // ── UNDERWATER ──
  p('movement', 'sub_propellers', 'Submarine Propellers', '🐟', { wheels: { type: 'hover', count: 2 }, abilities: { underwater: true } }, { wheelType: 'hover', wheelCount: 2, unlocks: ['dive', 'sonar_scan'], tags: ['underwater'] }),
  p('movement', 'water_jets', 'Water Jets', '💦', { wheels: { type: 'hover', count: 2, motor: 'turbo' }, abilities: { underwater: true, amphibious: true } }, { wheelType: 'hover', wheelCount: 2, motor: 'turbo', tags: ['underwater'] }),
  p('movement', 'underwater_stabilizers', 'Underwater Stabilizers', '⚓', { sensors: { gyroscope: true }, abilities: { underwater: true } }, { visual: 'plane_stabilizer', tags: ['underwater'] }),
  p('sensors', 'sonar_dome', 'Sonar Dome', '📡', { sensors: { ultrasonic: true, lidar: true } }, { unlocks: ['sonar_scan'], visual: 'sensor_lidar', tags: ['underwater'] }),
  p('structure', 'ballast_tank', 'Ballast Tank', '⚖️', { abilities: { underwater: true } }, { visual: 'structure', statMods: { stability: 12, weight: 10 }, tags: ['underwater'] }),
  p('lighting', 'aquatic_lights', 'Aquatic Lights', '🔦', { cosmetics: { accentLights: true, ledColor: '#06b6d4' } }, { unlocks: ['lights_on'], visual: 'lighting', tags: ['underwater'] }),

  // ── HUMANOID ──
  p('movement', 'jumping_legs', 'Jumping Legs', '🦘', { wheels: { type: 'legs', count: 2 }, abilities: { jump: true } }, { wheelType: 'legs', wheelCount: 2, unlocks: ['jump'], statMods: { agility: 14 }, tags: ['humanoid'] }),
  p('movement', 'athletic_legs', 'Athletic Robotic Legs', '🏃', { wheels: { type: 'legs', count: 2, motor: 'turbo' } }, { wheelType: 'legs', wheelCount: 2, motor: 'turbo', statMods: { speed: 10, agility: 12 }, tags: ['humanoid'] }),
  p('utility', 'precision_hand', 'Precision Hand', '🤏', { tools: { gripper: true, grabber: 'gripper' } }, { unlocks: ['grab'], visual: 'arm_claw', tags: ['humanoid'] }),
  p('utility', 'humanoid_hand', 'Humanoid Hand', '✋', { tools: { gripper: true, grabber: 'gripper', longArm: true } }, { unlocks: ['grab', 'arm_rotate'], visual: 'arm_claw', tags: ['humanoid'] }),

  // ── ARMS & INDUSTRIAL TOOLS ──
  p('utility', 'industrial_grabber', 'Industrial Grabber', '🦾', { tools: { pincer: true, grabber: 'pincer', longArm: true } }, { unlocks: ['grab', 'lift'], visual: 'arm_claw', statMods: { power: 10 }, tags: ['industrial'] }),
  p('utility', 'laser_cutter', 'Laser Cutter', '🔪', { tools: { laser: true } }, { visual: 'arm_laser', unlocks: ['scan_area'], tags: ['industrial'] }),
  p('utility', 'screwdriver_tool', 'Screwdriver Tool', '🔩', { tools: { scanner: true } }, { visual: 'arm_tool', tags: ['industrial'] }),
  p('utility', 'wrench_tool', 'Wrench Tool', '🔧', { tools: { scanner: true, longArm: true } }, { visual: 'arm_tool', tags: ['industrial'] }),
  p('utility', 'assembly_arm', 'Assembly Arm', '🏭', { tools: { longArm: true, gripper: true } }, { unlocks: ['arm_rotate', 'grab'], visual: 'arm_claw', tags: ['industrial', 'factory'] }),
  p('utility', 'rescue_claw', 'Rescue Claw', '🚑', { tools: { pincer: true, grabber: 'soft' } }, { unlocks: ['grab'], visual: 'arm_claw', tags: ['rescue'] }),
  p('utility', 'emergency_cutter', 'Emergency Cutter', '✂️', { tools: { laser: true } }, { visual: 'arm_laser', tags: ['rescue'] }),
  p('utility', 'medical_scanner', 'Medical Scanner', '🏥', { tools: { scanner: true }, sensors: { thermal: true } }, { unlocks: ['thermal_scan', 'scan_area'], visual: 'medical_scanner', tags: ['medical'] }),
  p('utility', 'stretcher_attach', 'Stretcher Mount', '🛏️', { tools: { longArm: true, hook: true } }, { unlocks: ['lift'], visual: 'arm_fork', tags: ['medical', 'rescue'] }),
  p('utility', 'excavation_drill', 'Excavation Drill', '⛏️', { tools: { drill: true } }, { unlocks: ['drill'], visual: 'arm_tool', statMods: { power: 15 }, tags: ['mining'] }),
  p('utility', 'mining_claw', 'Mining Claw', '⛏️', { tools: { pincer: true, drill: true } }, { unlocks: ['grab', 'drill'], visual: 'arm_claw', tags: ['mining'] }),
  p('utility', 'terrain_cutter', 'Terrain Cutter', '🪨', { tools: { bulldozer: true, drill: true } }, { unlocks: ['drill'], visual: 'arm_blade', tags: ['mining'] }),
  p('utility', 'crane_hook', 'Crane Hook', '🏗️', { tools: { hook: true, longArm: true } }, { unlocks: ['lift'], visual: 'arm_fork', tags: ['construction'] }),
  p('utility', 'cement_sprayer', 'Cement Sprayer', '🧱', { tools: { water: true, bulldozer: true } }, { visual: 'arm_tool', tags: ['construction'] }),
  p('utility', 'lifting_platform', 'Lifting Platform', '📐', { tools: { longArm: true, forklift: true } }, { unlocks: ['lift'], visual: 'arm_fork', tags: ['construction'] }),
  p('utility', 'sample_collector', 'Sample Collector', '🧪', { tools: { gripper: true, scanner: true } }, { unlocks: ['grab', 'sample_collect'], visual: 'arm_claw', tags: ['science'] }),
  p('utility', 'microscope_scanner', 'Microscope Scanner', '🔬', { tools: { scanner: true }, sensors: { camera: true } }, { unlocks: ['scan_area'], visual: 'medical_scanner', tags: ['science'] }),
  p('utility', 'research_probe', 'Research Probe', '🔭', { tools: { scanner: true, longArm: true } }, { unlocks: ['scan_area'], visual: 'arm_tool', tags: ['science'] }),

  // ── SENSORS (extra) ──
  p('sensors', 'hd_camera', 'HD Camera', '📹', { sensors: { camera: true, depth: true } }, { unlocks: ['scan'], visual: 'sensor_camera' }),
  p('sensors', 'camera_360', '360° Camera', '🔄', { sensors: { camera360: true } }, { unlocks: ['aerial_scan', 'scan'], visual: 'sensor_camera' }),
  p('sensors', 'radar_sensor', 'Radar Scanner', '📻', { sensors: { lidar: true, proximity: true } }, { unlocks: ['lidar_sweep'], visual: 'sensor_lidar' }),
  p('sensors', 'sonar', 'Sonar', '🌊', { sensors: { ultrasonic: true } }, { unlocks: ['sonar_scan'], visual: 'sensor_ultrasonic', tags: ['underwater'] }),
  p('sensors', 'gas_detector', 'Gas Detector', '☁️', { sensors: { airQuality: true } }, { visual: 'sensor' }),
  p('sensors', 'facial_recognition', 'Face Recognition Cam', '😀', { sensors: { faceDetect: true, camera: true, ai: true } }, { unlocks: ['detect_face'], visual: 'sensor_camera' }),
  p('sensors', 'color_scanner', 'Color Scanner', '🌈', { sensors: { color: true } }, { unlocks: ['follow_line'], visual: 'sensor_camera' }),
  p('sensors', 'collision_detector', 'Collision Detector', '💥', { sensors: { collision: true, proximity: true } }, { unlocks: ['if_obstacle'], visual: 'sensor' }),
  p('sensors', 'vibration_sensor', 'Vibration Sensor', '📳', { sensors: { accelerometer: true, motion: true } }, { visual: 'sensor' }),
  p('sensors', 'radiation_detector', 'Radiation Detector', '☢️', { sensors: { radiation: true } }, { unlocks: ['thermal_scan'], visual: 'sensor_thermal' }),
  p('sensors', 'magnetic_scanner', 'Magnetic Scanner', '🧲', { sensors: { compass: true }, abilities: { magneticGrip: true } }, { visual: 'sensor' }),
  p('sensors', 'bio_scanner', 'Bio Scanner', '🧬', { sensors: { ai: true, thermal: true } }, { unlocks: ['thermal_scan'], visual: 'medical_scanner' }),

  // ── POWER (extra) ──
  p('power', 'small_battery', 'Small Battery', '🔋', {}, { statMods: { battery: 8 }, visual: 'power_battery' }),
  p('power', 'large_battery', 'Large Battery', '🔋', { wheels: { motor: 'strong' } }, { statMods: { battery: 25, weight: 6 }, visual: 'power_battery' }),
  p('power', 'lithium_battery', 'Lithium Battery', '⚡', { statMods: { battery: 18, agility: 5 }, visual: 'power_battery' }),
  p('power', 'industrial_battery', 'Industrial Battery', '🏭', { statMods: { battery: 30, power: 15, weight: 10 }, visual: 'power_battery' }),
  p('power', 'racing_battery', 'Racing Battery', '🏁', { abilities: { speedBoost: true } }, { statMods: { battery: 12, speed: 8 }, visual: 'power_battery' }),
  p('power', 'hydrogen_cell', 'Hydrogen Cell', '💧', { abilities: { regeneration: true } }, { statMods: { battery: 22, power: 10 }, visual: 'power_fusion' }),
  p('power', 'plasma_core', 'Plasma Core', '⚛️', { abilities: { speedBoost: true } }, { statMods: { power: 28, battery: 20 }, visual: 'power_fusion' }),
  p('power', 'reactor_core', 'Reactor Core', '☢️', { abilities: { speedBoost: true, superStrength: true } }, { statMods: { power: 35, battery: 35, weight: 12 }, visual: 'power_fusion' }),
  p('power', 'power_distributor', 'Power Distributor', '🔌', { statMods: { power: 12 }, visual: 'power_battery' }),
  p('power', 'energy_regulator', 'Energy Regulator', '⚙️', { statMods: { battery: 10, agility: 4 }, visual: 'power_battery' }),
  p('power', 'charging_port', 'Charging Port', '🔋', { abilities: { regeneration: true, solarCharge: true } }, { visual: 'power_battery' }),

  // ── AI (extra) ──
  p('ai', 'navigation_ai', 'Navigation AI', '🗺️', { sensors: { ai: true, gps: true } }, { unlocks: ['navigate_to'], visual: 'power_fusion' }),
  p('ai', 'security_ai', 'Security AI', '🛡️', { sensors: { ai: true, motion: true, camera: true } }, { unlocks: ['ai_decide', 'detect_face'], visual: 'power_fusion', tags: ['security'] }),
  p('ai', 'medical_ai', 'Medical AI', '🏥', { sensors: { ai: true, thermal: true } }, { unlocks: ['thermal_scan'], visual: 'medical_scanner', tags: ['medical'] }),
  p('ai', 'factory_ai', 'Factory AI', '🏭', { sensors: { ai: true } }, { unlocks: ['arm_rotate', 'ai_decide'], visual: 'power_fusion', tags: ['factory'] }),
  p('ai', 'exploration_ai', 'Exploration AI', '🔭', { sensors: { ai: true, gps: true, lidar: true } }, { unlocks: ['navigate_to', 'scan'], visual: 'power_fusion' }),
  p('ai', 'drone_ai', 'Drone AI', '🚁', { sensors: { ai: true, gyroscope: true } }, { unlocks: ['aerial_scan', 'ai_decide'], visual: 'power_fusion', tags: ['drone', 'flying'] }),
  p('ai', 'standard_cpu', 'Standard CPU', '💻', { sensors: { ai: true } }, { visual: 'power_fusion' }),
  p('ai', 'advanced_processor', 'Advanced Processor', '🖥️', { sensors: { ai: true, camera: true } }, { unlocks: ['ai_decide'], visual: 'power_fusion' }),
  p('ai', 'neural_processor', 'Neural Processor', '🧬', { sensors: { ai: true }, abilities: { learning: true } }, { unlocks: ['ai_decide', 'detect_face'], visual: 'power_fusion' }),
  p('ai', 'quantum_processor', 'Quantum Processor', '⚛️', { sensors: { ai: true }, abilities: { learning: true, autoPath: true } }, { unlocks: ['ai_decide', 'navigate_to'], statMods: { power: 20 }, visual: 'power_fusion' }),
  p('ai', 'memory_core', 'Memory Core', '💾', { sensors: { ai: true } }, { statMods: { power: 8 }, visual: 'power_battery' }),
  p('ai', 'storage_drive', 'Storage Drive', '💿', {}, { visual: 'power_battery' }),
  p('ai', 'learning_module', 'AI Learning Module', '📚', { sensors: { ai: true }, abilities: { learning: true } }, { unlocks: ['ai_decide'], visual: 'power_fusion' }),

  // ── COMMS (extra) ──
  p('comms', 'bluetooth_module', 'Bluetooth Module', '📲', { cosmetics: { soundTheme: 'beeps' } }, { visual: 'comms' }),
  p('comms', 'wifi_module', 'WiFi Module', '📶', { sensors: { gps: true } }, { visual: 'comms' }),
  p('comms', 'emergency_beacon', 'Emergency Beacon', '🆘', { cosmetics: { accentLights: true, ledColor: '#ef4444' } }, { visual: 'lighting' }),
  p('comms', 'hologram_communicator', 'Hologram Communicator', '💬', { cosmetics: { accentLights: true } }, { visual: 'comms_holo' }),

  // ── SECURITY ──
  p('lighting', 'spotlight', 'Security Spotlight', '🔦', { cosmetics: { accentLights: true }, sensors: { camera: true } }, { unlocks: ['lights_on', 'night_vision'], visual: 'security_spotlight', tags: ['security'] }),
  p('fun', 'siren', 'Patrol Siren', '🚨', { tools: { speaker: true }, cosmetics: { accentLights: true, ledColor: '#ef4444' } }, { visual: 'security_siren', tags: ['security'] }),
  p('sensors', 'security_camera', 'Security Camera', '📹', { sensors: { camera: true, motion: true, nightVision: true } }, { unlocks: ['detect_face'], visual: 'sensor_camera', tags: ['security'] }),
  p('armor', 'armored_shield', 'Armored Shield', '🛡️', { statMods: { stability: 20, speed: -6, weight: 12 } }, { visual: 'armor', tags: ['security'] }),
  p('sensors', 'patrol_scanner', 'Patrol Scanner', '🚔', { sensors: { lidar: true, motion: true, proximity: true } }, { unlocks: ['scan', 'lidar_sweep'], visual: 'sensor_lidar', tags: ['security'] }),

  // ── FACTORY / SPACE / MEDICAL ──
  p('utility', 'conveyor_attachment', 'Conveyor Attachment', '📦', { tools: { bulldozer: true, longArm: true } }, { visual: 'arm_blade', tags: ['factory'] }),
  p('utility', 'sorting_arm', 'Sorting Arm', '🔀', { tools: { gripper: true, scanner: true } }, { unlocks: ['grab'], visual: 'arm_claw', tags: ['factory'] }),
  p('utility', 'medicine_dispenser', 'Medicine Dispenser', '💊', { tools: { scanner: true } }, { visual: 'medical_scanner', tags: ['medical'] }),
  p('utility', 'emergency_kit', 'Emergency Kit', '🩹', { tools: { scanner: true, speaker: true } }, { visual: 'medical_scanner', tags: ['medical'] }),
  p('structure', 'oxygen_tank', 'Oxygen Tank', '🫁', { abilities: { underwater: true } }, { visual: 'structure', statMods: { battery: -5 }, tags: ['space'] }),
  p('comms', 'space_antenna', 'Space Antenna', '🛰️', { sensors: { gps: true } }, { visual: 'comms_dish', tags: ['space'] }),
  p('utility', 'magnetic_boots', 'Magnetic Boots', '🧲', { abilities: { magneticGrip: true, climb: true } }, { visual: 'structure', tags: ['space'] }),

  // ── STRUCTURE / CONNECTORS ──
  p('structure', 'armor_plating', 'Armor Plating', '🛡️', { chassis: { material: 'metal' }, statMods: { stability: 14, weight: 8 } }, { visual: 'armor' }),
  p('structure', 'reinforcement_bars', 'Reinforcement Bars', '📏', { statMods: { stability: 12 } }, { visual: 'structure' }),
  p('structure', 'piston', 'Hydraulic Piston', '🔩', { abilities: { superStrength: true }, statMods: { power: 10 } }, { visual: 'structure' }),
  p('structure', 'hydraulic_system', 'Hydraulic System', '⚙️', { statMods: { power: 12, stability: 8 } }, { visual: 'structure' }),
  p('structure', 'shoulder_socket', 'Shoulder Socket', '🔗', {}, { visual: 'connector_hub', tags: ['connector'] }),
  p('structure', 'axle_mount', 'Axle Mount', '⚙️', {}, { visual: 'connector_hub', tags: ['connector'] }),
  p('structure', 'wing_mount', 'Wing Mount', '✈️', {}, { visual: 'connector_hub', tags: ['connector', 'plane'] }),
  p('structure', 'sensor_port', 'Sensor Port', '📡', {}, { visual: 'connector_hub', tags: ['connector'] }),
  p('structure', 'power_port', 'Power Port', '🔋', { statMods: { battery: 5 } }, { visual: 'connector_hub', tags: ['connector'] }),

  // ── LIGHTING (extra) ──
  p('lighting', 'floodlights', 'Floodlights', '💡', { cosmetics: { accentLights: true } }, { unlocks: ['lights_on'], visual: 'lighting' }),
  p('lighting', 'neon_strips', 'Neon Strips', '💜', { cosmetics: { accentLights: true, ledColor: '#8B00FF' } }, { unlocks: ['lights_on'], visual: 'lighting' }),
  p('lighting', 'police_lights', 'Police Lights', '🚔', { cosmetics: { accentLights: true, ledColor: '#3b82f6' } }, { visual: 'security_siren', tags: ['security'] }),
  p('lighting', 'rgb_lighting', 'RGB Lighting', '🌈', { cosmetics: { accentLights: true } }, { unlocks: ['lights_on'], visual: 'lighting' }),
  p('lighting', 'holographic_lights', 'Holographic Lights', '✨', { cosmetics: { accentLights: true, ledColor: '#00D9FF' } }, { visual: 'comms_holo' }),

  // ── DECORATION (extra) ──
  p('decoration', 'racing_stripes', 'Racing Stripes', '🏁', { chassis: { pattern: 'racing' } }, { visual: 'decoration' }),
  p('decoration', 'camouflage', 'Camouflage', '🌿', { chassis: { pattern: 'camo' }, abilities: { stealth: true } }, { visual: 'decoration' }),
  p('decoration', 'number_plate', 'Number Plate', '🔢', {}, { visual: 'decoration' }),
  p('decoration', 'glowing_panels', 'Glowing Panels', '💫', { cosmetics: { accentLights: true } }, { visual: 'lighting' }),
  p('decoration', 'hologram_badge', 'Hologram Badge', '🏅', { cosmetics: { accentLights: true } }, { visual: 'comms_holo' }),

  // ── WEAPON / ACTION (kid-safe: foam, water, tools) ──
  p('fun', 'water_cannon', 'Water Cannon', '💦', { tools: { water: true } }, { visual: 'arm_tool', tags: ['action'] }),
  p('fun', 'net_launcher', 'Net Launcher', '🕸️', { tools: { dart: true } }, { visual: 'arm_tool', tags: ['action'] }),
  p('fun', 'shield_emitter', 'Shield Emitter', '🛡️', { abilities: { forceField: true } }, { visual: 'effect_shield', statMods: { stability: 15 }, tags: ['action'] }),
  p('fun', 'smoke_emitter', 'Smoke Emitter', '💨', { abilities: { stealth: true }, cosmetics: { accentLights: true } }, { visual: 'effect_smoke', tags: ['action'] }),

  // ── LEGO MODE ──
  p('structure', 'lego_block', 'LEGO Block', '🧱', { cosmetics: { pattern: 'lego' } }, { visual: 'lego_block', tags: ['lego'] }),
  p('movement', 'lego_wheels', 'LEGO Wheels', '⚙️', { wheels: { type: 'standard', count: 4, size: 'small' } }, { wheelType: 'standard', wheelCount: 4, visual: 'lego_wheel', tags: ['lego', 'wheeled'] }),
  p('structure', 'lego_gears', 'LEGO Gears', '⚙️', { statMods: { power: 6 } }, { visual: 'lego_gear', tags: ['lego'] }),
  p('structure', 'lego_hinge', 'LEGO Hinge', '🔗', { abilities: { rotateBase: true } }, { visual: 'lego_hinge', tags: ['lego'] }),
  p('structure', 'lego_connector', 'LEGO Connector', '🧲', {}, { visual: 'lego_block', tags: ['lego', 'connector'] }),
  p('movement', 'lego_motor', 'LEGO Motor', '🔋', { wheels: { type: 'standard', count: 2, motor: 'medium' } }, { wheelType: 'standard', wheelCount: 2, visual: 'lego_motor', tags: ['lego'] }),
  p('head', 'lego_eyes', 'LEGO Robotic Eyes', '👀', { sensors: { camera: true }, cosmetics: { pattern: 'lego' } }, { visual: 'lego_eyes', tags: ['lego'] }),
  p('utility', 'lego_claw', 'LEGO Claw', '🦀', { tools: { pincer: true, grabber: 'pincer' } }, { unlocks: ['grab'], visual: 'lego_claw', tags: ['lego'] }),
  p('movement', 'lego_propeller', 'LEGO Propeller', '🚁', { wheels: { type: 'hover', count: 2 } }, { wheelType: 'hover', wheelCount: 2, visual: 'lego_prop', tags: ['lego', 'flying'] }),

  // ── EFFECTS ──
  p('fun', 'thruster_trail', 'Thruster Trail', '🔥', { cosmetics: { accentLights: true }, abilities: { speedBoost: true } }, { visual: 'effect_thruster', tags: ['effect'] }),
  p('fun', 'energy_field', 'Energy Field', '⚡', { abilities: { forceField: true }, cosmetics: { accentLights: true } }, { visual: 'effect_shield', tags: ['effect'] }),
  p('cosmetic', 'particle_glow', 'Particle Glow', '✨', { cosmetics: { accentLights: true, ledColor: '#a855f7' } }, { visual: 'effect_glow', tags: ['effect'] }),
];

export const SPECIALIZED_PART_COUNT = SPECIALIZED_PARTS.length;
export const SPECIALIZED_CHASSIS_COUNT = SPECIALIZED_CHASSIS.length;
