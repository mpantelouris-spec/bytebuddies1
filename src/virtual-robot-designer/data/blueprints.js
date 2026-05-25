/** Editable robot blueprints — remix-ready starting points */

export const ROBOT_BLUEPRINTS = [
  {
    id: 'mars_explorer',
    name: 'Mars Explorer',
    icon: '🚀',
    desc: 'Rugged rover for alien terrain',
    buildMode: 'advanced',
    assembly: {
      base: { shape: 'wedge', color: '#f97316', material: 'carbon', scale: 1.1 },
      slots: {
        movement: { category: 'movement', partId: 'standard' },
        head: { category: 'head', partId: 'tactical' },
        front: { category: 'sensors', partId: 'lidar' },
        back: { category: 'power', partId: 'solar' },
        top: { category: 'comms', partId: 'antenna' },
      },
    },
  },
  {
    id: 'rescue_bot',
    name: 'Rescue Bot',
    icon: '🚑',
    desc: 'Search & rescue with sensors',
    buildMode: 'advanced',
    assembly: {
      base: { shape: 'box', color: '#ef4444', material: 'metal', scale: 1 },
      slots: {
        movement: { category: 'movement', partId: 'tracks' },
        head: { category: 'head', partId: 'camera' },
        front: { category: 'utility', partId: 'claw' },
        left: { category: 'sensors', partId: 'thermal' },
        back: { category: 'power', partId: 'battery' },
      },
    },
  },
  {
    id: 'battle_tank',
    name: 'Battle Tank',
    icon: '🪖',
    desc: 'Heavy armor & tracks',
    buildMode: 'advanced',
    assembly: {
      base: { shape: 'box', color: '#00ff41', material: 'metal', scale: 1.2 },
      slots: {
        movement: { category: 'movement', partId: 'tracks' },
        front: { category: 'utility', partId: 'blade' },
        right: { category: 'utility', partId: 'laser' },
        back: { category: 'power', partId: 'fusion' },
      },
    },
  },
  {
    id: 'hover_drone',
    name: 'Hover Drone',
    icon: '🚁',
    desc: 'Agile aerial scout',
    buildMode: 'advanced',
    assembly: {
      base: { shape: 'round', color: '#00d4ff', material: 'carbon', scale: 0.9 },
      slots: {
        movement: { category: 'movement', partId: 'hover' },
        head: { category: 'head', partId: 'radar_pod' },
        top: { category: 'sensors', partId: 'lidar' },
      },
    },
  },
  {
    id: 'spider_scout',
    name: 'Spider Scout',
    icon: '🕷️',
    desc: 'Six-legged explorer',
    buildMode: 'advanced',
    assembly: {
      base: { shape: 'hex', color: '#ff006e', material: 'carbon', scale: 1 },
      slots: {
        movement: { category: 'movement', partId: 'legs' },
        head: { category: 'head', partId: 'ai_visor' },
        front: { category: 'sensors', partId: 'ultrasonic' },
      },
    },
  },
  {
    id: 'racing_bot',
    name: 'Racing Bot',
    icon: '🏎️',
    desc: 'Turbo speed machine',
    buildMode: 'hybrid',
    assembly: {
      base: { shape: 'wedge', color: '#8B00FF', material: 'carbon', scale: 0.95 },
      slots: {
        movement: { category: 'movement', partId: 'jet' },
        back: { category: 'power', partId: 'fusion' },
      },
      blocks: [
        { id: 'b1', type: 'neon', x: 0, y: 1, z: 1, rotY: 0 },
        { id: 'b2', type: 'motor', x: -1, y: 0, z: 1, rotY: 0 },
        { id: 'b3', type: 'motor', x: 1, y: 0, z: 1, rotY: 0 },
      ],
    },
  },
  {
    id: 'real_rover_starter',
    name: 'Starter Rover',
    icon: '🤖',
    desc: 'Simple 4-wheel robot to customize',
    buildMode: 'advanced',
    assembly: {
      base: { shape: 'box', chassisType: 'rover', color: '#00D9FF', material: 'metal', scale: 1, width: 1, height: 0.62, depth: 1 },
      slots: {
        movement: { category: 'movement', partId: 'standard' },
        head: { category: 'head', partId: 'camera' },
        front: { category: 'sensors', partId: 'ultrasonic' },
      },
    },
  },
  {
    id: 'block_inventor',
    name: 'Block Inventor',
    icon: '🧱',
    desc: 'Start with modular blocks',
    buildMode: 'blocks',
    assembly: {
      base: { shape: 'box', color: '#8B00FF', material: 'plastic', scale: 1 },
      blocks: [
        { id: 'b1', type: 'cube', x: 0, y: 0, z: 0, rotY: 0 },
        { id: 'b2', type: 'cube', x: -1, y: 0, z: 0, rotY: 0 },
        { id: 'b3', type: 'cube', x: 1, y: 0, z: 0, rotY: 0 },
        { id: 'b4', type: 'wheel', x: -1, y: 0, z: 1, rotY: 0 },
        { id: 'b5', type: 'wheel', x: 1, y: 0, z: 1, rotY: 0 },
        { id: 'b6', type: 'ai_core', x: 0, y: 1, z: 0, rotY: 0 },
        { id: 'b7', type: 'sensor', x: 0, y: 1, z: 1, rotY: 0 },
      ],
    },
  },
  {
    id: 'factory_assistant',
    name: 'Factory Assistant',
    icon: '🏭',
    desc: 'Industrial arm with tools',
    buildMode: 'advanced',
    assembly: {
      base: { shape: 'arm', color: '#eceff1', material: 'metal', scale: 1 },
      slots: {
        front: { category: 'utility', partId: 'gripper' },
        top: { category: 'sensors', partId: 'lidar' },
      },
    },
  },
];

export function getBlueprint(id) {
  return ROBOT_BLUEPRINTS.find((b) => b.id === id);
}
