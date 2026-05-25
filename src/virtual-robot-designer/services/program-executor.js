import { migrateDesign } from '../config.js';
import { checkObstacleAhead } from './robot-runtime.js';
import { getUnlockedBlocks } from '../data/robot-catalog.js';

// Remove duplicate block defs from executor - import palette from here
import {
  VRD_BLOCK_PALETTE,
  SENSOR_BLOCKS,
  TOOL_BLOCKS,
  LIGHT_BLOCKS,
  AUDIO_BLOCKS,
} from './program-service.js';

export function getAvailableBlocks(design) {
  const d = migrateDesign(design);
  const unlocked = new Set(getUnlockedBlocks(d));
  const motion = VRD_BLOCK_PALETTE.filter((b) => {
    if (b.requiresLegs) return d.wheels?.type === 'legs';
    if (b.requiresJump) return d.abilities?.jump;
    if (b.requiresUnderwater) return d.abilities?.underwater || d.abilities?.amphibious;
    if (b.requiresWheels) return d.wheels?.type === 'standard' || d.wheels?.type === 'mecanum';
    return true;
  });
  const sensor = SENSOR_BLOCKS.filter((b) => d.sensors?.[b.requires] || unlocked.has(b.id));
  const tools = TOOL_BLOCKS.filter((b) => {
    if (b.requiresTool === 'grabber') return d.tools?.pincer || d.tools?.gripper || (d.tools?.grabber && d.tools.grabber !== 'none');
    if (b.requiresTool === 'drill') return d.tools?.drill;
    if (b.requiresTool === 'vacuum') return d.tools?.vacuum;
    if (b.requiresTool === 'magnet') return d.tools?.magnet;
    if (b.requiresTool === 'longArm') return d.tools?.longArm;
    if (b.requiresTool === 'scanner') return d.tools?.scanner;
    return unlocked.has(b.id);
  });
  const lights = d.cosmetics?.accentLights !== false ? LIGHT_BLOCKS : [];
  const audio = AUDIO_BLOCKS.filter((b) => {
    if (b.requiresSpeaker) return d.tools?.speaker || d.sensors?.voice;
    return true;
  });
  return {
    motion,
    sensor,
    tools,
    lights,
    audio,
    unlockedIds: unlocked,
  };
}

export function blockLabel(step) {
  const all = [...VRD_BLOCK_PALETTE, ...SENSOR_BLOCKS, ...TOOL_BLOCKS, ...LIGHT_BLOCKS, ...AUDIO_BLOCKS];
  return all.find((b) => b.id === step.id)?.label || step.id;
}

/** Expand program with obstacle avoidance and conditional steps */
export function expandProgramForExecution(program, design, pos, arenaId) {
  const d = migrateDesign(design);
  const expanded = [];

  program.forEach((step) => {
    if (step.id === 'if_obstacle') {
      const hit = checkObstacleAhead(pos, pos.angle, d, arenaId).hit;
      if (hit) {
        const body = step.body?.length ? step.body : [{ id: 'left', params: { degrees: step.params?.degrees || 45 } }];
        body.forEach((s) => expanded.push({ ...s, meta: 'if_obstacle' }));
      }
      return;
    }
    expanded.push(step);
  });

  return expanded;
}

/** Adjust forward step if obstacle detected mid-path */
export function applyObstacleAvoidance(step, pos, design, arenaId) {
  if (step.id !== 'forward') return [step];
  const d = migrateDesign(design);
  if (!d.sensors?.ultrasonic && !d.sensors?.proximity) return [step];

  const obstacle = checkObstacleAhead(pos, pos.angle, d, arenaId);
  if (!obstacle.hit) return [step];

  return [
    { id: 'scan', params: {}, meta: 'auto' },
    { id: 'left', params: { degrees: 50 }, meta: 'avoid' },
    { id: 'forward', params: { amount: Math.round((step.params?.amount || 40) * 0.4) }, meta: 'avoid' },
  ];
}
