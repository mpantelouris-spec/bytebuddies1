import { SNAP_SLOTS, slotAcceptsPart } from '../data/assembly-parts.js';

export const BUILD_SLOT_ORDER = [
  'movement', 'head', 'front', 'left', 'right', 'back', 'top', 'addon_a', 'addon_b',
];

export const ARM_SLOT_ORDER = ['front', 'right', 'left', 'top'];

export const EXTRAS_SLOTS = ['front', 'left', 'right', 'back', 'top'];

export function getSlotOrder(isArm) {
  return isArm ? ARM_SLOT_ORDER : BUILD_SLOT_ORDER;
}

export function findFirstOpenSlot(slots, category, isArm = false) {
  return getSlotOrder(isArm).find(
    (slotId) => !slots?.[slotId] && slotAcceptsPart(slotId, category),
  ) || null;
}

export function canAttachPartAnywhere(slots, category, isArm = false) {
  return !!findFirstOpenSlot(slots, category, isArm);
}

/** Simple 3-step flow for kids */
export function getBuildPhase(asm, isArm = false) {
  const slots = asm?.slots || {};
  if (!isArm && !slots.movement) {
    return {
      phase: 'wheels',
      step: 1,
      total: 3,
      activeSlot: 'movement',
      panelSection: 'movement',
      title: 'Step 1 of 3 — Add wheels',
      detail: 'Pick how your robot moves. Wheels are easiest!',
    };
  }
  if (!isArm && !slots.head) {
    return {
      phase: 'head',
      step: 2,
      total: 3,
      activeSlot: 'head',
      panelSection: 'sensors',
      title: 'Step 2 of 3 — Add a head',
      detail: 'Give your robot eyes or a friendly face.',
    };
  }
  return {
    phase: 'extras',
    step: 3,
    total: 3,
    activeSlot: EXTRAS_SLOTS.find((id) => !slots[id]) || 'front',
    panelSection: 'tools',
    title: 'Step 3 of 3 — Add extras (optional)',
    detail: 'Arms, tools, battery — or skip and test your robot!',
  };
}

export function getBuildHint(asm, isArm = false) {
  const phase = getBuildPhase(asm, isArm);
  return {
    step: phase.step,
    message: phase.title,
    detail: phase.detail,
    highlightSection: phase.panelSection,
    suggestSlot: phase.activeSlot,
    phase: phase.phase,
  };
}

/** Which sockets to show on the 3D robot */
export function getVisibleSockets(asm, isArm = false, options = {}) {
  const { freeBuild = true, guided = false } = options;
  const slots = asm?.slots || {};
  const filled = Object.keys(slots).filter((k) => slots[k]);

  if (freeBuild && !guided) {
    return Object.keys(SNAP_SLOTS);
  }

  const phase = getBuildPhase(asm, isArm);
  if (phase.phase === 'wheels') return ['movement', ...filled];
  if (phase.phase === 'head') return ['head', 'movement', ...filled.filter((s) => s !== 'head')];
  return [...new Set([...EXTRAS_SLOTS, 'movement', 'head', 'addon_a', 'addon_b', ...filled])];
}

export function getEngineeringStatus(asm, isArm = false) {
  const placed = Object.values(asm?.slots || {}).filter(Boolean).length;
  if (placed === 0) {
    return 'Blank invention canvas — drag any part onto a socket. Combine wheels, legs, wings, tools, sensors… anything!';
  }
  const mov = asm?.slots?.movement;
  if (!isArm && !mov) {
    return 'Add a movement system (wheels, tracks, legs, or hover) on the Movement socket.';
  }
  return `${placed} module${placed === 1 ? '' : 's'} mounted — keep inventing!`;
}

export function getSlotLabel(slotId) {
  return SNAP_SLOTS[slotId]?.label || slotId.replace('_', ' ');
}
