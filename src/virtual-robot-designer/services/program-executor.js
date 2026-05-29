import { migrateDesign } from '../config.js';
import { checkObstacleAhead } from './robot-runtime.js';
import { getUnlockedBlocks } from '../data/robot-catalog.js';
import { analyzeRobot } from './robot-profile.js';

import {
  VRD_BLOCK_PALETTE,
  ARCHETYPE_MOTION_BLOCKS,
  UNIVERSAL_BLOCKS,
  SENSOR_BLOCKS,
  TOOL_BLOCKS,
  LIGHT_BLOCKS,
  AUDIO_BLOCKS,
} from './program-service.js';

function filterBaseMotion(d) {
  return VRD_BLOCK_PALETTE.filter((b) => {
    if (b.requiresLegs) return d.wheels?.type === 'legs';
    if (b.requiresJump) return d.abilities?.jump;
    if (b.requiresUnderwater) return d.abilities?.underwater || d.abilities?.amphibious;
    if (b.requiresWheels) return d.wheels?.type === 'standard' || d.wheels?.type === 'mecanum';
    return true;
  });
}

function mergeMotionBlocks(...lists) {
  const seen = new Set();
  const out = [];
  lists.flat().forEach((b) => {
    if (!b || seen.has(b.id)) return;
    seen.add(b.id);
    out.push(b);
  });
  return out;
}

export function getAvailableBlocks(design) {
  const d = migrateDesign(design);
  const profile = analyzeRobot(d);
  const unlocked = new Set(getUnlockedBlocks(d));

  const archetypeMotion = ARCHETYPE_MOTION_BLOCKS[profile.profileId] || [];
  let motion;

  if (profile.isAerial) {
    motion = mergeMotionBlocks(archetypeMotion, UNIVERSAL_BLOCKS);
  } else if (profile.isUnderwater) {
    motion = mergeMotionBlocks(archetypeMotion, UNIVERSAL_BLOCKS);
  } else if (['tank', 'spider', 'humanoid', 'arm', 'drill', 'hover', 'lego', 'mech'].includes(profile.profileId)) {
    const groundCore = filterBaseMotion(d).filter((b) =>
      ['forward', 'back', 'left', 'right', 'steer', 'accelerate'].includes(b.id),
    );
    motion = mergeMotionBlocks(archetypeMotion, groundCore, UNIVERSAL_BLOCKS);
  } else {
    motion = mergeMotionBlocks(filterBaseMotion(d), archetypeMotion, UNIVERSAL_BLOCKS);
  }
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
    profileId: profile.profileId,
    arenaTheme: profile.arenaTheme,
  };
}

export function blockLabel(step) {
  const archetypeAll = Object.values(ARCHETYPE_MOTION_BLOCKS).flat();
  const all = [...VRD_BLOCK_PALETTE, ...UNIVERSAL_BLOCKS, ...archetypeAll, ...SENSOR_BLOCKS, ...TOOL_BLOCKS, ...LIGHT_BLOCKS, ...AUDIO_BLOCKS];
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
