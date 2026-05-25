/**
 * Kid-friendly Blockly unlock catalog — ties coding blocks to robot parts.
 */
import { migrateDesign } from '../config.js';
import {
  VRD_BLOCK_PALETTE,
  SENSOR_BLOCKS,
  TOOL_BLOCKS,
  LIGHT_BLOCKS,
  AUDIO_BLOCKS,
} from './program-service.js';
import { getAvailableBlocks } from './program-executor.js';
import { listPlacedParts } from './assembly-service.js';
import { getWorkshopPart } from '../data/assembly-parts.js';

const UNLOCK_HINTS = {
  ultrasonic: { part: 'Ultrasonic sensor', zone: 'See', icon: '📡' },
  lidar: { part: 'LIDAR dome', zone: 'See', icon: '🔦' },
  thermal: { part: 'Thermal camera', zone: 'See', icon: '🌡️' },
  nightVision: { part: 'Night vision', zone: 'See', icon: '🌙' },
  temperature: { part: 'Temperature sensor', zone: 'See', icon: '🌡️' },
  gps: { part: 'GPS module', zone: 'See', icon: '🗺️' },
  faceDetect: { part: 'AI face camera', zone: 'See', icon: '😀' },
  voice: { part: 'Voice mic', zone: 'See', icon: '🎤' },
  ai: { part: 'AI brain module', zone: 'See', icon: '🧠' },
  color: { part: 'Color sensor', zone: 'See', icon: '🌈' },
  grabber: { part: 'Claw or gripper', zone: 'Grab', icon: '🦾' },
  drill: { part: 'Drill tool', zone: 'Grab', icon: '⛏️' },
  vacuum: { part: 'Vacuum tool', zone: 'Grab', icon: '🌀' },
  magnet: { part: 'Magnet arm', zone: 'Grab', icon: '🧲' },
  longArm: { part: 'Lift arm', zone: 'Grab', icon: '🏗️' },
  scanner: { part: 'Scanner tool', zone: 'Grab', icon: '🔍' },
  legs: { part: 'Legs (movement)', zone: 'Go', icon: '🦿' },
  jump: { part: 'Jump jets', zone: 'Go', icon: '🦘' },
  underwater: { part: 'Dive system', zone: 'Go', icon: '🌊' },
  wheels: { part: 'Wheels', zone: 'Go', icon: '⚙️' },
  speaker: { part: 'Speaker', zone: 'Fun', icon: '🔊' },
  lights: { part: 'LED lights', zone: 'Fun', icon: '💡' },
};

function blockEntry(block, unlocked, reasonKey) {
  const hint = UNLOCK_HINTS[reasonKey] || { part: 'Add the matching part', zone: 'Parts', icon: '🔧' };
  return {
    id: block.id,
    label: block.label,
    icon: block.icon || hint.icon,
    unlocked,
    hint: unlocked ? 'Ready in Blockly!' : `Add ${hint.part} in the ${hint.zone} tab`,
    zone: hint.zone,
  };
}

function isMotionUnlocked(block, d) {
  if (block.requiresLegs) return d.wheels?.type === 'legs';
  if (block.requiresJump) return d.abilities?.jump;
  if (block.requiresUnderwater) return d.abilities?.underwater || d.abilities?.amphibious;
  if (block.requiresWheels) return d.wheels?.type === 'standard' || d.wheels?.type === 'mecanum';
  return true;
}

function isSensorUnlocked(block, d, unlockedIds) {
  return d.sensors?.[block.requires] || unlockedIds.has(block.id);
}

function isToolUnlocked(block, d, unlockedIds) {
  if (block.requiresTool === 'grabber') {
    return d.tools?.pincer || d.tools?.gripper || (d.tools?.grabber && d.tools.grabber !== 'none');
  }
  if (block.requiresTool === 'drill') return d.tools?.drill;
  if (block.requiresTool === 'vacuum') return d.tools?.vacuum;
  if (block.requiresTool === 'magnet') return d.tools?.magnet;
  if (block.requiresTool === 'longArm') return d.tools?.longArm;
  if (block.requiresTool === 'scanner') return d.tools?.scanner;
  return unlockedIds.has(block.id);
}

/** Full unlock report for Code Studio panel */
export function getBlocklyUnlockReport(design) {
  const d = migrateDesign(design);
  const avail = getAvailableBlocks(d);
  const unlockedIds = avail.unlockedIds;

  const groups = [
    {
      id: 'motion',
      label: 'Move',
      icon: '⚙️',
      items: VRD_BLOCK_PALETTE.map((b) =>
        blockEntry(b, isMotionUnlocked(b, d), b.requiresLegs ? 'legs' : b.requiresJump ? 'jump' : b.requiresUnderwater ? 'underwater' : b.requiresWheels ? 'wheels' : 'wheels'),
      ),
    },
    {
      id: 'sensor',
      label: 'See & Sense',
      icon: '👁',
      items: SENSOR_BLOCKS.map((b) =>
        blockEntry(b, isSensorUnlocked(b, d, unlockedIds), b.requires),
      ),
    },
    {
      id: 'tools',
      label: 'Grab & Tools',
      icon: '🦾',
      items: TOOL_BLOCKS.map((b) =>
        blockEntry(b, isToolUnlocked(b, d, unlockedIds), b.requiresTool),
      ),
    },
    {
      id: 'lights',
      label: 'Lights & Fun',
      icon: '💡',
      items: [
        ...LIGHT_BLOCKS.map((b) => blockEntry(b, avail.lights.length > 0, 'lights')),
        ...AUDIO_BLOCKS.map((b) =>
          blockEntry(b, !b.requiresSpeaker || d.tools?.speaker || d.sensors?.voice, 'speaker'),
        ),
      ],
    },
  ];

  const allItems = groups.flatMap((g) => g.items);
  const unlockedCount = allItems.filter((i) => i.unlocked).length;

  const mountedParts = listPlacedParts(d.assembly).map((p) => {
    const meta = getWorkshopPart(p.category, p.partId);
    return { label: meta?.label || p.partId, icon: meta?.icon || '◆', slot: p.slotLabel };
  });

  return {
    groups,
    unlockedCount,
    totalCount: allItems.length,
    mountedParts,
    motionCount: avail.motion.length,
    sensorCount: avail.sensor.length,
    toolCount: avail.tools.length,
  };
}
