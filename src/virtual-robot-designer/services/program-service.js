import { migrateDesign } from '../config.js';
import { buildDemoProgram, computeDesignStats } from './design-service.js';

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

export function generatePythonFromDesign(design) {
  const d = migrateDesign(design);
  const stats = computeDesignStats(d);
  const fwd = Math.round(40 + stats.speed * 0.4);
  const turn = Math.round(30 + stats.agility * 0.3);
  const lines = [
    '# ByteBuddies Robot Program',
    `# Unit: ${d.name || 'My Robot'} | Template: ${d.template}`,
    'from robot import ByteBuddy',
    '',
    'bot = ByteBuddy()',
    'bot.lights_on()',
  ];
  if (d.sensors?.ultrasonic) lines.push('bot.enable_ultrasonic()');
  if (d.sensors?.lidar) lines.push('bot.enable_lidar()');
  if (d.sensors?.camera) lines.push('bot.enable_camera()');
  lines.push('');
  lines.push(`bot.forward(${fwd})`);
  if (d.sensors?.ultrasonic) {
    lines.push('if bot.obstacle_ahead():');
    lines.push(`    bot.turn_left(${turn})`);
    lines.push(`    bot.forward(${Math.round(fwd * 0.5)})`);
  }
  lines.push(`bot.turn_left(${turn})`);
  lines.push(`bot.forward(${Math.round(fwd * 0.7)})`);
  if (d.abilities?.speedBoost) lines.push(`bot.forward(${fwd})  # speed boost!`);
  lines.push('bot.stop()');
  return lines.join('\n');
}

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
    const fwd = t.match(/(?:bot\.)?forward\s*\(\s*(\d+)/);
    if (fwd) { steps.push({ id: 'forward', params: { amount: Number(fwd[1]) } }); continue; }
    const back = t.match(/(?:bot\.)?backward\s*\(\s*(\d+)/);
    if (back) { steps.push({ id: 'back', params: { amount: Number(back[1]) } }); continue; }
    const left = t.match(/(?:bot\.)?turn_left\s*\(\s*(\d+)/);
    if (left) { steps.push({ id: 'left', params: { degrees: Number(left[1]) } }); continue; }
    const right = t.match(/(?:bot\.)?turn_right\s*\(\s*(\d+)/);
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
