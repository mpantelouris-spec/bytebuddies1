import { migrateDesign } from '../config.js';
import { buildDemoProgram, computeDesignStats } from './design-service.js';
import { generatePythonFromDesign, generateRobotClassPython } from './robot-code-generator.js';

/** Motion blocks unlocked per smart-stage profile (not shown for wrong robot types). */
export const ARCHETYPE_MOTION_BLOCKS = {
  wheeled: [],
  inventor: [],
  tank: [
    { id: 'tank_steer', label: '🎮 Tank steer', icon: '🎮', color: '#78716c', params: { direction: 'left', degrees: 45 } },
    { id: 'rotate_place', label: '🔄 Rotate in place', icon: '🔄', color: '#78716c', params: { degrees: 90 } },
    { id: 'climb_mode', label: '🏔️ Climb mode', icon: '🏔️', color: '#f97316', params: {} },
    { id: 'power_mode', label: '⚡ Power mode', icon: '⚡', color: '#eab308', params: {} },
    { id: 'push_object', label: '💪 Push object', icon: '💪', color: '#94a3b8', params: { amount: 40 } },
  ],
  drone: [
    { id: 'takeoff', label: '🛸 Take off', icon: '🛸', color: '#0ea5e9', params: {} },
    { id: 'land', label: '🛬 Land', icon: '🛬', color: '#0ea5e9', params: {} },
    { id: 'fly_up', label: '⬆ Fly up', icon: '⬆', color: '#38bdf8', params: { amount: 30 } },
    { id: 'fly_down', label: '⬇ Fly down', icon: '⬇', color: '#38bdf8', params: { amount: 30 } },
    { id: 'hover', label: '🛸 Hover', icon: '🛸', color: '#06b6d4', params: { secs: 1 } },
    { id: 'rotate_air', label: '🔄 Rotate mid-air', icon: '🔄', color: '#8b5cf6', params: { degrees: 90 } },
    { id: 'altitude_hold', label: '✈️ Altitude hold', icon: '✈️', color: '#6366f1', params: { secs: 2 } },
    { id: 'aerial_scan', label: '📡 Aerial scan', icon: '📡', color: '#22c55e', params: {} },
  ],
  jet: [
    { id: 'thrust', label: '🔥 Increase thrust', icon: '🔥', color: '#f97316', params: { amount: 60 } },
    { id: 'roll_left', label: '↰ Roll left', icon: '↰', color: '#ef4444', params: {} },
    { id: 'roll_right', label: '↱ Roll right', icon: '↱', color: '#ef4444', params: {} },
    { id: 'pitch_up', label: '⬆ Pitch up', icon: '⬆', color: '#f59e0b', params: {} },
    { id: 'pitch_down', label: '⬇ Pitch down', icon: '⬇', color: '#f59e0b', params: {} },
    { id: 'glide', label: '🪂 Glide', icon: '🪂', color: '#94a3b8', params: { secs: 2 } },
    { id: 'jet_boost', label: '⚡ Jet boost', icon: '⚡', color: '#eab308', params: { amount: 50 } },
    { id: 'loop_maneuver', label: '🔁 Loop', icon: '🔁', color: '#ec4899', params: {} },
  ],
  helicopter: [
    { id: 'takeoff', label: '🛸 Take off', icon: '🛸', color: '#0ea5e9', params: {} },
    { id: 'hover', label: '⚖️ Hover stabilize', icon: '⚖️', color: '#06b6d4', params: { secs: 2 } },
    { id: 'fly_up', label: '⬆ Ascend', icon: '⬆', color: '#38bdf8', params: { amount: 25 } },
    { id: 'fly_down', label: '⬇ Lower cable', icon: '⬇', color: '#38bdf8', params: { amount: 25 } },
    { id: 'land', label: '🛬 Emergency land', icon: '🛬', color: '#64748b', params: {} },
    { id: 'grab', label: '📦 Pickup cargo', icon: '📦', color: '#94a3b8', params: {} },
  ],
  spider: [
    { id: 'step_forward', label: '🦶 Step forward', icon: '🦶', color: '#10b981', params: { steps: 3, amount: 35 } },
    { id: 'climb_wall', label: '🧗 Climb wall', icon: '🧗', color: '#ef4444', params: {} },
    { id: 'stabilize_legs', label: '⚖️ Stabilize legs', icon: '⚖️', color: '#6366f1', params: {} },
    { id: 'crouch', label: '🫳 Crouch', icon: '🫳', color: '#78716c', params: {} },
    { id: 'leap', label: '🏃 Leap', icon: '🏃', color: '#f59e0b', params: {} },
    { id: 'terrain_detect', label: '🔍 Terrain detect', icon: '🔍', color: '#22c55e', params: {} },
  ],
  humanoid: [
    { id: 'walk', label: '🦿 Walk', icon: '🦿', color: '#22c55e', params: { steps: 4, amount: 30 } },
    { id: 'crouch', label: '🫳 Crouch', icon: '🫳', color: '#78716c', params: {} },
    { id: 'balance_mode', label: '⚖️ Balance mode', icon: '⚖️', color: '#a855f7', params: {} },
    { id: 'wave', label: '👋 Wave', icon: '👋', color: '#ec4899', params: {} },
  ],
  arm: [
    { id: 'rotate_arm', label: '🦾 Rotate arm', icon: '🦾', color: '#0ea5e9', params: { degrees: 90 } },
    { id: 'precision_mode', label: '🎯 Precision mode', icon: '🎯', color: '#8b5cf6', params: {} },
    { id: 'stack_object', label: '📚 Stack object', icon: '📚', color: '#22c55e', params: {} },
    { id: 'sort_color', label: '🎨 Sort by color', icon: '🎨', color: '#f59e0b', params: {} },
  ],
  submarine: [
    { id: 'dive', label: '🌊 Dive', icon: '🌊', color: '#0ea5e9', params: {} },
    { id: 'ascend', label: '💨 Ascend', icon: '💨', color: '#38bdf8', params: {} },
    { id: 'sonar_scan', label: '📡 Sonar scan', icon: '📡', color: '#06b6d4', params: {} },
    { id: 'water_stabilize', label: '⚖️ Water stabilize', icon: '⚖️', color: '#0284c7', params: {} },
    { id: 'sample_collect', label: '🧪 Collect sample', icon: '🧪', color: '#14b8a6', params: {} },
  ],
  hover: [
    { id: 'hover', label: '🛸 Hover stabilize', icon: '🛸', color: '#c026d3', params: { secs: 2 } },
    { id: 'float_up', label: '⬆ Float upward', icon: '⬆', color: '#d946ef', params: { amount: 25 } },
    { id: 'anti_gravity_boost', label: '✨ Anti-gravity boost', icon: '✨', color: '#a855f7', params: {} },
    { id: 'side_drift', label: '↔ Side drift', icon: '↔', color: '#06b6d4', params: { amount: 30 } },
  ],
  drill: [
    { id: 'activate_drill', label: '⛏️ Activate drill', icon: '⛏️', color: '#a16207', params: { secs: 2 } },
    { id: 'tunnel_forward', label: '🕳️ Tunnel forward', icon: '🕳️', color: '#78716c', params: { amount: 40 } },
    { id: 'scan_minerals', label: '💎 Scan minerals', icon: '💎', color: '#eab308', params: {} },
  ],
  lego: [
    { id: 'attach_block', label: '🧱 Attach block', icon: '🧱', color: '#f97316', params: {} },
    { id: 'stack_pieces', label: '📚 Stack pieces', icon: '📚', color: '#22c55e', params: {} },
  ],
  battle: [],
  companion: [],
  mech: [
    { id: 'power_mode', label: '⚡ Power mode', icon: '⚡', color: '#eab308', params: {} },
    { id: 'push_object', label: '💪 Push object', icon: '💪', color: '#94a3b8', params: { amount: 50 } },
  ],
};

export const UNIVERSAL_BLOCKS = [
  { id: 'wait', label: '⏱ Wait', icon: '⏱', color: '#fbbf24', params: { secs: 1 } },
  { id: 'stop', label: '⏹ Stop', icon: '⏹', color: '#ef4444', params: {} },
];

export const VRD_BLOCK_PALETTE = [
  { id: 'forward', label: '▶ Move forward', icon: '▶', color: '#00D4FF', params: { amount: 50 } },
  { id: 'back', label: '◀ Move back', icon: '◀', color: '#00D4FF', params: { amount: 30 } },
  { id: 'left', label: '↺ Turn left', icon: '↺', color: '#8B00FF', params: { degrees: 45 } },
  { id: 'right', label: '↻ Turn right', icon: '↻', color: '#8B00FF', params: { degrees: 45 } },
  { id: 'steer', label: '🎮 Steer', icon: '🎮', color: '#06b6d4', requiresWheels: true, params: { degrees: 30 } },
  { id: 'accelerate', label: '🚀 Boost', icon: '🚀', color: '#f97316', params: { amount: 30 } },
  { id: 'walk', label: '🦿 Walk step', icon: '🦿', color: '#22c55e', requiresLegs: true, params: { steps: 1 } },
  { id: 'jump', label: '🦘 Jump', icon: '🦘', color: '#84cc16', requiresJump: true, params: {} },
  { id: 'dive', label: '🌊 Dive', icon: '🌊', color: '#0ea5e9', requiresUnderwater: true, params: {} },
  { id: 'wait', label: '⏱ Wait', icon: '⏱', color: '#fbbf24', params: { secs: 1 } },
  { id: 'stop', label: '⏹ Stop', icon: '⏹', color: '#ef4444', params: {} },
];

export const SENSOR_BLOCKS = [
  { id: 'scan', label: '📡 Ultrasonic scan', icon: '📡', color: '#00d4ff', requires: 'ultrasonic', params: {} },
  { id: 'lidar_sweep', label: '🔦 LIDAR sweep', icon: '🔦', color: '#00ff88', requires: 'lidar', params: {} },
  { id: 'if_obstacle', label: '⚠️ If obstacle → turn', icon: '⚠️', color: '#fbbf24', requires: 'ultrasonic', params: { degrees: 45 } },
  { id: 'thermal_scan', label: '🌡️ Thermal scan', icon: '🌡️', color: '#f97316', requires: 'thermal', params: {} },
  { id: 'night_vision', label: '🌙 Night vision', icon: '🌙', color: '#6366f1', requires: 'nightVision', params: {} },
  { id: 'read_temp', label: '🌡️ Read temperature', icon: '🌡️', color: '#eab308', requires: 'temperature', params: {} },
  { id: 'navigate_to', label: '🗺️ Navigate to point', icon: '🗺️', color: '#22c55e', requires: 'gps', params: { x: 0, y: 0 } },
  { id: 'detect_face', label: '😀 Detect face', icon: '😀', color: '#ec4899', requires: 'faceDetect', params: {} },
  { id: 'listen_voice', label: '🎤 Listen for voice', icon: '🎤', color: '#a855f7', requires: 'voice', params: {} },
  { id: 'ai_decide', label: '🧠 AI decide', icon: '🧠', color: '#8b5cf6', requires: 'ai', params: {} },
  { id: 'follow_line', label: '🌈 Follow line', icon: '🌈', color: '#22c55e', requires: 'color', params: {} },
];

export const TOOL_BLOCKS = [
  { id: 'grab', label: '🦀 Grab', icon: '🦀', color: '#94a3b8', requiresTool: 'grabber', params: {} },
  { id: 'release', label: '✋ Release', icon: '✋', color: '#94a3b8', requiresTool: 'grabber', params: {} },
  { id: 'drill', label: '⛏️ Drill', icon: '⛏️', color: '#78716c', requiresTool: 'drill', params: {} },
  { id: 'vacuum', label: '🌀 Vacuum', icon: '🌀', color: '#0ea5e9', requiresTool: 'vacuum', params: {} },
  { id: 'magnet_pick', label: '🧲 Magnet pick', icon: '🧲', color: '#64748b', requiresTool: 'magnet', params: {} },
  { id: 'lift', label: '🏗️ Lift cargo', icon: '🏗️', color: '#f59e0b', requiresTool: 'longArm', params: {} },
  { id: 'scan_area', label: '🔍 Scan area', icon: '🔍', color: '#06b6d4', requiresTool: 'scanner', params: {} },
];

export const LIGHT_BLOCKS = [
  { id: 'lights_on', label: '💡 Lights on', icon: '💡', color: '#00ff88', params: {} },
  { id: 'lights_off', label: '🌑 Lights off', icon: '🌑', color: '#64748b', params: {} },
  { id: 'flash', label: '✨ Flash lights', icon: '✨', color: '#eab308', params: { times: 3 } },
];

export const AUDIO_BLOCKS = [
  { id: 'speak', label: '🔊 Speak phrase', icon: '🔊', color: '#a855f7', requiresSpeaker: true, params: { text: 'Hello!' } },
  { id: 'beep', label: '🔔 Beep', icon: '🔔', color: '#94a3b8', params: {} },
];

export function defaultProgram() {
  return { mode: 'blocks', blocks: [], python: '', javascript: '' };
}

export { generatePythonFromDesign, generateRobotClassPython };

export function generateJavaScriptFromDesign(design) {
  const d = migrateDesign(design);
  const stats = computeDesignStats(d);
  const fwd = Math.round(40 + stats.speed * 0.4);
  const turn = Math.round(30 + stats.agility * 0.3);
  return `// ByteBuddies Robot Program
// Unit: ${d.name || 'My Robot'}
const bot = new ByteBuddy();

await bot.forward(${fwd});
${d.sensors?.ultrasonic ? `if (await bot.obstacleAhead()) {
  await bot.turnLeft(${turn});
  await bot.forward(${Math.round(fwd * 0.5)});
}` : ''}
await bot.turnLeft(${turn});
await bot.forward(${Math.round(fwd * 0.7)});
${d.abilities?.speedBoost ? `await bot.forward(${fwd}); // turbo` : ''}
await bot.stop();
`;
}

export function parsePythonToSteps(code) {
  const steps = [];
  const lines = code.split('\n');
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith('#') || t.startsWith('from ') || t.startsWith('import ') || t.startsWith('bot =')) continue;
    const fwd = t.match(/(?:(?:self\.)?bot\.)?forward\s*\(\s*(\d+)/);
    if (fwd) { steps.push({ id: 'forward', params: { amount: Number(fwd[1]) } }); continue; }
    const back = t.match(/(?:(?:self\.)?bot\.)?backward\s*\(\s*(\d+)/);
    if (back) { steps.push({ id: 'back', params: { amount: Number(back[1]) } }); continue; }
    const left = t.match(/(?:bot\.)?turn_left\s*\(\s*(\d+)/);
    if (left) { steps.push({ id: 'left', params: { degrees: Number(left[1]) } }); continue; }
    const right = t.match(/(?:(?:self\.)?bot\.)?turn_right\s*\(\s*(\d+)/);
    if (right) { steps.push({ id: 'right', params: { degrees: Number(right[1]) } }); continue; }
    if (t.includes('stop()')) { steps.push({ id: 'stop', params: {} }); continue; }
    if (t.includes('scan()')) { steps.push({ id: 'scan', params: {} }); continue; }
    if (t.includes('lidar_sweep()')) { steps.push({ id: 'lidar_sweep', params: {} }); continue; }
    if (t.includes('grab()')) { steps.push({ id: 'grab', params: {} }); continue; }
    if (t.includes('release()')) { steps.push({ id: 'release', params: {} }); continue; }
    if (t.includes('lights_on()')) { steps.push({ id: 'lights_on', params: {} }); continue; }
    if (t.includes('lights_off()')) { steps.push({ id: 'lights_off', params: {} }); continue; }
    const wait = t.match(/(?:bot\.)?wait\s*\(\s*([\d.]+)/);
    if (wait) { steps.push({ id: 'wait', params: { secs: Number(wait[1]) } }); continue; }
    if (t.startsWith('if ') && t.includes('obstacle')) {
      steps.push({ id: 'if_obstacle', params: { degrees: 45 } });
    }
  }
  return steps.length ? steps : null;
}

export function parseJavaScriptToSteps(code) {
  const steps = [];
  const fwd = [...code.matchAll(/forward\s*\(\s*(\d+)/g)];
  fwd.forEach((m) => steps.push({ id: 'forward', params: { amount: Number(m[1]) } }));
  const left = [...code.matchAll(/turnLeft\s*\(\s*(\d+)/g)];
  left.forEach((m) => steps.push({ id: 'left', params: { degrees: Number(m[1]) } }));
  const right = [...code.matchAll(/turnRight\s*\(\s*(\d+)/g)];
  right.forEach((m) => steps.push({ id: 'right', params: { degrees: Number(m[1]) } }));
  if (code.includes('stop()')) steps.push({ id: 'stop', params: {} });
  return steps.length ? steps : null;
}

/** Resolve executable steps from design program or auto-generate */
export function resolveProgram(design) {
  const d = migrateDesign(design);
  const prog = d.program || defaultProgram();

  if (prog.mode === 'blocks' && prog.blocks?.length > 0) {
    return prog.blocks.map((b) => ({ id: b.id, params: { ...b.params } }));
  }
  if (prog.mode === 'python' && prog.python?.trim()) {
    const parsed = parsePythonToSteps(prog.python);
    if (parsed) return parsed;
  }
  if (prog.mode === 'javascript' && prog.javascript?.trim()) {
    const parsed = parseJavaScriptToSteps(prog.javascript);
    if (parsed) return parsed;
  }
  return buildDemoProgram(d);
}

export function getComponentAPI(design) {
  const d = migrateDesign(design);
  const api = [];

  if (d.sensors?.ultrasonic) {
    api.push({ group: 'Ultrasonic', fn: 'sensor.detect_distance()', desc: 'Read proximity in meters' });
    api.push({ group: 'Ultrasonic', fn: 'sensor.avoid_obstacle()', desc: 'Turn away from obstacle' });
    api.push({ group: 'Ultrasonic', fn: 'sensor.read_proximity()', desc: 'Boolean obstacle check' });
  }
  if (d.sensors?.camera) {
    api.push({ group: 'Camera', fn: 'camera.detect_color()', desc: 'Identify dominant color' });
    api.push({ group: 'Camera', fn: 'camera.identify_object()', desc: 'Classify visible object' });
    api.push({ group: 'Camera', fn: 'camera.track_motion()', desc: 'Follow moving target' });
  }
  if (d.sensors?.lidar) {
    api.push({ group: 'LIDAR', fn: 'lidar.sweep()', desc: '360° environment scan' });
    api.push({ group: 'LIDAR', fn: 'lidar.map_room()', desc: 'Build spatial map' });
  }
  if (d.tools?.pincer || d.tools?.gripper || d.tools?.grabber !== 'none') {
    api.push({ group: 'Claw', fn: 'claw.open()', desc: 'Release gripper' });
    api.push({ group: 'Claw', fn: 'claw.close()', desc: 'Close gripper' });
    api.push({ group: 'Claw', fn: 'claw.grip_strength(power)', desc: 'Set grip force 0-100' });
  }
  if (d.cosmetics?.accentLights) {
    api.push({ group: 'LED', fn: 'led.color(r, g, b)', desc: 'Set accent color' });
    api.push({ group: 'LED', fn: 'led.brightness(level)', desc: 'Adjust brightness' });
    api.push({ group: 'LED', fn: 'led.animate_sequence()', desc: 'Run LED pattern' });
  }
  if (d.wheels?.count > 0) {
    api.push({ group: 'Motor', fn: 'motor.forward(speed)', desc: 'Drive forward' });
    api.push({ group: 'Motor', fn: 'motor.backward(speed)', desc: 'Drive reverse' });
    api.push({ group: 'Motor', fn: 'motor.turn(direction, angle)', desc: 'Rotate chassis' });
  }

  return api;
}

export { expandProgramForExecution, applyObstacleAvoidance, getAvailableBlocks, blockLabel } from './program-executor.js';

export function ensureProgramInitialized(design) {
  const d = migrateDesign(design);
  const prog = { ...defaultProgram(), ...d.program };
  if (!prog.python) prog.python = generatePythonFromDesign(d);
  if (!prog.javascript) prog.javascript = generateJavaScriptFromDesign(d);
  if (!prog.blocks?.length) prog.blocks = buildDemoProgram(d);
  return prog;
}
