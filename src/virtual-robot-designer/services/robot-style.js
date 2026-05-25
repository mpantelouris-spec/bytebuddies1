import { migrateDesign } from '../config.js';
import { setBuildMode, applyBlueprint, clearBlocks } from './block-service.js';
import { clearAllParts } from './assembly-service.js';
import { getBlueprint } from '../data/blueprints.js';

/** Two build styles kids choose between */
export const ROBOT_STYLES = {
  advanced: {
    id: 'advanced',
    label: 'Real Robot',
    tagline: 'Looks like a real machine',
    icon: '🤖',
    desc: 'Pick a body shape, add wheels, sensors & tools — like a movie robot',
    blueprintId: 'real_rover_starter',
  },
  blocks: {
    id: 'blocks',
    label: 'LEGO Robot',
    tagline: 'Snap bricks together',
    icon: '🧱',
    desc: 'Stack colorful blocks with studs — invent anything like LEGO',
    blueprintId: 'block_inventor',
  },
};

export function getStyleMeta(buildMode) {
  return ROBOT_STYLES[buildMode === 'blocks' ? 'blocks' : 'advanced'];
}

/** Apply style: mode + optional starter template (skip blueprint when blank=true) */
export function applyRobotStyle(design, styleId, { blank = false } = {}) {
  const style = ROBOT_STYLES[styleId];
  if (!style) return migrateDesign(design);

  let next = migrateDesign(design);
  next = setBuildMode(next, style.id);

  if (!blank) {
    const bp = getBlueprint(style.blueprintId);
    if (bp) next = applyBlueprint(next, bp);
  }

  sessionStorage.setItem('vrd_robot_style', style.id);
  return migrateDesign(next);
}

/** Switch between Real ↔ LEGO (fresh starter) */
export function switchRobotStyle(design, newStyleId) {
  let next = clearAllParts(design);
  next = clearBlocks(next);
  return applyRobotStyle(next, newStyleId);
}
