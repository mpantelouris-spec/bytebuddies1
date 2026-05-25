/** Virtual Robot Designer — standalone app configuration */

import { DEFAULT_ASSEMBLY } from './data/assembly-parts.js';

export const VRD_CONFIG = {
  app_name: 'Virtual Robot Designer',
  theme: 'neon-futuristic',
  colors: ['#8B00FF', '#FF006E', '#00FF41', '#00D4FF'],
  requires_hardware: false,
  has_simulator: true,
  has_ai: true,
  has_code_editor: true,
  api_prefix: '/api/vrd',
  database: 'VirtualRobotDB',
  tagline: 'Design incredible robots, generate wild variants with AI, test them in simulation—all without hardware!',
};

export const VRD_TABS = [
  { id: 'design', label: 'Create', icon: '🎨' },
  { id: 'code', label: 'Program', icon: '⌨' },
  { id: 'simulator', label: 'Test', icon: '🚀' },
  { id: 'creations', label: 'My Creations', icon: '📁' },
  { id: 'gallery', label: 'Gallery', icon: '🌐' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export { TEST_ARENA_COURSES as VRD_ARENAS } from './data/test-arena-courses.js';

export const VRD_ACHIEVEMENTS = [
  { id: 'first_design', title: 'First Design', desc: 'Create 1 design', icon: '🎨', stat: 'designs_created', target: 1 },
  { id: 'designer', title: 'Designer', desc: 'Create 5 designs', icon: '🖌️', stat: 'designs_created', target: 5 },
  { id: 'builder', title: 'Builder', desc: 'Create 10 designs', icon: '🔧', stat: 'designs_created', target: 10 },
  { id: 'speed_demon', title: 'Speed Demon', desc: '90+ speed on a design', icon: '⚡', stat: 'max_speed', target: 90 },
  { id: 'variant_maker', title: 'Variant Maker', desc: 'Generate 5 variants', icon: '🤖', stat: 'variants_generated', target: 5 },
  { id: 'sim_tester', title: 'Simulator Tester', desc: 'Run 10 simulations', icon: '🚀', stat: 'simulations_run', target: 10 },
  { id: 'social', title: 'Social Butterfly', desc: 'Share 5 designs', icon: '🦋', stat: 'designs_shared', target: 5 },
  { id: 'liked', title: 'Community Star', desc: 'Get 50 likes', icon: '⭐', stat: 'likes_received', target: 50 },
];

const defaultSensors = () => ({
  camera: false, camera360: false, thermal: false, nightVision: false, xray: false,
  ultrasonic: true, lidar: false, proximity: false,
  gyroscope: false, accelerometer: false, inclinometer: false,
  touch: true, pressure: false, collision: false,
  temperature: false, light: false, humidity: false,
});

const defaultTools = () => ({
  grabber: 'none', shooter: 'none', pusher: 'none', other: 'none',
  pincer: false, gripper: false, rotatingGrip: false, longArm: false, megaClaw: false,
  ballLauncher: false, dart: false, water: false, laser: false,
  bumper: false, bulldozer: false, saw: false, laserBlade: false,
  magnet: false, net: false, drill: false, vacuum: false, flamethrower: false,
});

const defaultAbilities = () => ({
  speedBoost: false, stealth: false, forceField: false, regeneration: false,
  teleport: false, clone: false, sizeChange: false, superStrength: false,
  timeSlow: false, chaosMode: false,
});

const defaultCosmetics = () => ({
  primaryColor: '#8B00FF', secondaryColor: '#FF006E', pattern: 'solid',
  accentLights: true, ledColor: '#00FF41', soundTheme: 'beeps',
});

export const DEFAULT_ROBOT_DESIGN = {
  name: 'My Robot',
  description: '',
  tags: [],
  template: 'blank',
  chassis: {
    shape: 'rectangular', size: 'medium', color: '#8B00FF', pattern: 'solid', material: 'plastic',
    scaleX: 1, scaleY: 1, scaleZ: 1,
  },
  wheels: { type: 'standard', count: 4, size: 'medium', motor: 'medium', steering: 'differential' },
  sensors: defaultSensors(),
  tools: defaultTools(),
  abilities: defaultAbilities(),
  cosmetics: defaultCosmetics(),
  program: { mode: 'blocks', blocks: [], python: '', javascript: '' },
  modules: {},
  assembly: { ...DEFAULT_ASSEMBLY },
};

export function migrateDesign(d) {
  if (!d) return { ...DEFAULT_ROBOT_DESIGN, program: { mode: 'blocks', blocks: [], python: '', javascript: '' } };
  return {
    ...DEFAULT_ROBOT_DESIGN,
    ...d,
    chassis: { ...DEFAULT_ROBOT_DESIGN.chassis, ...d.chassis },
    wheels: { ...DEFAULT_ROBOT_DESIGN.wheels, ...d.wheels },
    sensors: { ...defaultSensors(), ...d.sensors },
    tools: { ...defaultTools(), ...d.tools },
    abilities: { ...defaultAbilities(), ...d.abilities },
    cosmetics: { ...defaultCosmetics(), ...d.cosmetics },
    program: { ...DEFAULT_ROBOT_DESIGN.program, ...d.program },
    modules: { ...DEFAULT_ROBOT_DESIGN.modules, ...d.modules },
    assembly: {
      ...DEFAULT_ASSEMBLY,
      ...d.assembly,
      base: { ...DEFAULT_ASSEMBLY.base, ...d.assembly?.base },
      slots: { ...DEFAULT_ASSEMBLY.slots, ...d.assembly?.slots },
      blocks: [...(d.assembly?.blocks || DEFAULT_ASSEMBLY.blocks)],
    },
  };
}

export const DESIGN_TEMPLATES = {
  blank: { template: 'blank', name: 'Blank Canvas', chassis: { shape: 'rectangular', size: 'medium', color: '#94a3b8', pattern: 'solid', material: 'plastic', scaleX: 1, scaleY: 1, scaleZ: 1 }, wheels: { type: 'standard', count: 4, size: 'medium', motor: 'medium' }, sensors: defaultSensors(), tools: defaultTools(), abilities: defaultAbilities() },
  rover: { template: 'rover', name: 'Rover', chassis: { shape: 'rectangular', size: 'medium', color: '#8B00FF', pattern: 'solid', material: 'plastic' }, wheels: { type: 'standard', count: 4, size: 'medium', motor: 'medium' }, sensors: { ...defaultSensors(), ultrasonic: true, touch: true } },
  tank: { template: 'tank', name: 'Tank Bot', chassis: { shape: 'rectangular', size: 'medium', color: '#00FF41', pattern: 'solid', material: 'metal' }, wheels: { type: 'tracks', count: 2, size: 'large', motor: 'strong' }, tools: { ...defaultTools(), pusher: 'bulldozer', bulldozer: true } },
  drone: { template: 'drone', name: 'Drone', chassis: { shape: 'circular', size: 'small', color: '#00D4FF', pattern: 'solid', material: 'carbon' }, wheels: { type: 'hover', count: 4, size: 'small', motor: 'strong' }, sensors: { ...defaultSensors(), camera: true, gyroscope: true, accelerometer: true, light: true } },
  spider: { template: 'spider', name: 'Spider', chassis: { shape: 'circular', size: 'medium', color: '#FF006E', pattern: 'solid', material: 'carbon' }, wheels: { type: 'legs', count: 6, size: 'small', motor: 'medium' }, sensors: { ...defaultSensors(), touch: true, gyroscope: true, accelerometer: true } },
  humanoid: { template: 'humanoid', name: 'Humanoid', chassis: { shape: 'rectangular', size: 'medium', color: '#FF006E', pattern: 'solid', material: 'plastic' }, wheels: { type: 'legs', count: 2, size: 'medium', motor: 'medium' }, sensors: { ...defaultSensors(), camera: true, ultrasonic: true, gyroscope: true }, tools: { ...defaultTools(), grabber: 'pincer', pincer: true } },
  arm: { template: 'arm', name: 'Robot Arm', chassis: { shape: 'cube', size: 'medium', color: '#f59e0b', pattern: 'solid', material: 'metal' }, wheels: { type: 'standard', count: 0, size: 'medium', motor: 'medium' } },
};

export const TEMPLATE_OPTIONS = [
  { id: 'rover', icon: '🚗', label: 'Rover' },
  { id: 'tank', icon: '🪖', label: 'Tank' },
  { id: 'drone', icon: '🚁', label: 'Drone' },
  { id: 'spider', icon: '🕷️', label: 'Spider' },
  { id: 'humanoid', icon: '🤖', label: 'Humanoid' },
  { id: 'arm', icon: '🦾', label: 'Arm' },
  { id: 'blank', icon: '📄', label: 'Blank' },
];
