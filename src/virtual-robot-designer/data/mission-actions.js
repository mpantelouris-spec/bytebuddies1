/**
 * mission-actions.js — the "doing" blocks each robot needs for its missions.
 *
 * Missions say things like "pick the carrots", "spray water on the fire" or
 * "drop the parcel at the balloon". Each of those maps to an action block, and
 * a mission marker only counts once the robot performs that action on it.
 */
import { getPrimaryStudioArena, getStudioRobotGroup } from './primary-robot-studio.js';

const GROUND = ['wheeled', 'walker', 'underwater'];

/** Palette entries (robotGroups may list families or exact chassis ids). */
export const ACTION_BLOCKS = [
  { id: 'pick_up', label: 'Pick up', icon: '🧺', robotGroups: GROUND },
  { id: 'drop_off', label: 'Drop off', icon: '📥', robotGroups: GROUND },
  { id: 'scan_here', label: 'Scan here', icon: '🔎', robotGroups: GROUND },
  { id: 'light_up', label: 'Light up', icon: '💡', robotGroups: [...GROUND, 'aerial'] },
  { id: 'press_alarm', label: 'Press button', icon: '🔴', robotGroups: ['wheeled', 'walker'] },
  { id: 'push_object', label: 'Push', icon: '💪', robotGroups: ['tank', 'mech', 'droid', 'crawler', 'berserker'] },
  { id: 'spray_water', label: 'Spray water', icon: '💦', robotGroups: ['firebot'] },
  { id: 'drill', label: 'Drill', icon: '⛏️', robotGroups: ['miningbot', 'spacerover', 'crawler', 'deepseabot'] },
  { id: 'plant_flag', label: 'Plant flag', icon: '🚩', robotGroups: ['spacerover', 'crawler'] },
  // Flying
  { id: 'takeoff', label: 'Take off', icon: '🛫', robotGroups: ['aerial'] },
  { id: 'land', label: 'Land', icon: '🛬', robotGroups: ['aerial'] },
  { id: 'drop_package', label: 'Drop package', icon: '📦', robotGroups: ['aerial'] },
  { id: 'take_photo', label: 'Take photo', icon: '📸', robotGroups: ['aerial'] },
];

export const ACTION_BY_ID = Object.fromEntries(ACTION_BLOCKS.map((b) => [b.id, b]));
export const ACTION_IDS = new Set(ACTION_BLOCKS.map((b) => b.id));

/** How long each action block takes to run (seconds). */
export const ACTION_DURATION = {
  pick_up: 0.7, drop_off: 0.7, scan_here: 0.9, light_up: 0.6, press_alarm: 0.5,
  push_object: 0.9, spray_water: 1.1, drill: 1.2, plant_flag: 0.9,
  drop_package: 0.8, take_photo: 0.8,
};


/**
 * Pick the action a mission needs from its objective text.
 * @returns {null | {id, label, icon, verb, hint}}
 */
export function actionForObjective(text = '', chassisId = '', family = '') {
  const t = String(text).toLowerCase();
  const aerial = family === 'aerial';
  const pick = (id, verb) => {
    const b = ACTION_BY_ID[id];
    if (!b) return null;
    const allowed = b.robotGroups.includes(family) || b.robotGroups.includes(chassisId);
    if (!allowed) return null;
    return { ...b, verb, hint: `Use ${b.icon} ${b.label} at each glowing marker` };
  };
  if (/\bfinale\b|every rescue|everything|every skill|combined|champion/.test(t)) return null;
  if (aerial) {
    if (/\bland\b|landing|helipad|lily pad|rooftop|island to island|\bpad\b/.test(t)) return pick('land', 'landed');
    if (/deliver|drop|carry|supplies|medicine|parcel|crates|float ring|first-aid|cargo|kits/.test(t)) return pick('drop_package', 'delivered');
    if (/photo|survey|check on|check every|tour|landmark|search|find the|scan/.test(t)) return pick('take_photo', 'photographed');
    if (/light up|lantern|lights/.test(t)) return pick('light_up', 'lit');
    return null;
  }
  if (/spray|put out|cool down|stop the fire/.test(t) && chassisId === 'firebot') return pick('spray_water', 'sprayed');
  if (/plant the flag|plant a flag/.test(t)) return pick('plant_flag', 'planted');
  if (/drill|dig|uncover/.test(t)) return pick('drill', 'drilled') || pick('scan_here', 'scanned');
  if (/pick|collect|harvest|gather|eggs|acorns|nuggets|gems|crystal samples|litter/.test(t)) return pick('pick_up', 'collected');
  if (/deliver|bring|carry|tip the|load|stack|supplies|letters|hay|bricks|stones|logs|containers|beams/.test(t)) return pick('drop_off', 'delivered');
  if (/push|knock|topple/.test(t)) return pick('push_object', 'pushed');
  if (/alarm|button/.test(t)) return pick('press_alarm', 'pressed');
  if (/light|shine|lantern|lamp/.test(t)) return pick('light_up', 'lit');
  if (/scan|check|inspect|measure|survey|search|find|visit every|look/.test(t)) return pick('scan_here', 'scanned');
  return null;
}

/** The action a primary-studio mission needs, or null for plain "reach the marker" missions. */
export function getMissionAction(challenge) {
  if (!challenge?.chassisId || !challenge?.arenaBible) return null;
  const family = getStudioRobotGroup(challenge.chassisId);
  if (family === 'arm' || family === 'birdbot' || family === 'footballbot') return null;
  const arena = getPrimaryStudioArena(challenge.chassisId, challenge.modeIndex || 1);
  if (!arena || arena.isRace) return null;
  // Tier levels (modes 11–50) say which action they need
  if (arena.tierLevel) {
    const b = arena.action ? ACTION_BY_ID[arena.action] : null;
    return b ? { ...b, verb: b.label.toLowerCase(), hint: `Use ${b.icon} ${b.label} at each glowing marker` } : null;
  }
  return actionForObjective(arena.objective || challenge.desc || '', challenge.chassisId, family);
}

export function isActionBlock(id) {
  return ACTION_IDS.has(id);
}

