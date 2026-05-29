/**
 * Screen-space socket picking during HTML5 drag — maps pointer to nearest valid socket.
 */
import * as THREE from 'three';
import { getSlotPosition } from '../data/assembly-parts.js';
import { slotAcceptsPart } from '../data/assembly-parts.js';

const PICK_RADIUS_PX = 52;

/**
 * @param {object} opts
 * @param {{ x: number, y: number, width: number, height: number }} opts.pointer canvas-relative
 * @param {THREE.Camera} opts.camera
 * @param {number[]} opts.robotPosition world [x,y,z]
 * @param {number} opts.robotScale
 * @param {object} opts.base assembly base
 * @param {string[]} opts.visibleSlots
 * @param {string|null} opts.dragCategory
 * @param {object} opts.slots filled slots map
 */
export function pickSocketAtScreen({
  pointer,
  camera,
  robotPosition,
  robotScale,
  base,
  visibleSlots,
  dragCategory,
  slots,
}) {
  if (!pointer || !dragCategory || !camera) return null;

  let best = null;
  let bestDist = PICK_RADIUS_PX;
  const worldPos = new THREE.Vector3();
  const ndc = new THREE.Vector3();

  for (const slotId of visibleSlots) {
    if (slots?.[slotId]) continue;
    if (!slotAcceptsPart(slotId, dragCategory)) continue;

    const local = getSlotPosition(slotId, base);
    worldPos.set(
      robotPosition[0] + local[0] * robotScale,
      robotPosition[1] + local[1] * robotScale,
      robotPosition[2] + local[2] * robotScale,
    );
    ndc.copy(worldPos).project(camera);
    if (ndc.z > 1 || ndc.z < -1) continue;

    const sx = (ndc.x * 0.5 + 0.5) * pointer.width;
    const sy = (-ndc.y * 0.5 + 0.5) * pointer.height;
    const dist = Math.hypot(sx - pointer.x, sy - pointer.y);
    if (dist < bestDist) {
      bestDist = dist;
      best = slotId;
    }
  }
  return best;
}

export function listSocketScreenStates({
  pointer,
  camera,
  robotPosition,
  robotScale,
  base,
  visibleSlots,
  dragCategory,
  slots,
}) {
  const states = {};
  if (!pointer || !dragCategory || !camera) return states;

  const worldPos = new THREE.Vector3();
  const ndc = new THREE.Vector3();

  for (const slotId of visibleSlots) {
    const filled = !!slots?.[slotId];
    const accepts = slotAcceptsPart(slotId, dragCategory);
    const local = getSlotPosition(slotId, base);
    worldPos.set(
      robotPosition[0] + local[0] * robotScale,
      robotPosition[1] + local[1] * robotScale,
      robotPosition[2] + local[2] * robotScale,
    );
    ndc.copy(worldPos).project(camera);
    const onScreen = ndc.z <= 1 && ndc.z >= -1;
    const sx = onScreen ? (ndc.x * 0.5 + 0.5) * pointer.width : -9999;
    const sy = onScreen ? (-ndc.y * 0.5 + 0.5) * pointer.height : -9999;
    const dist = onScreen ? Math.hypot(sx - pointer.x, sy - pointer.y) : 9999;
    states[slotId] = {
      filled,
      accepts,
      invalid: !filled && !accepts,
      validDrop: !filled && accepts,
      near: dist < PICK_RADIUS_PX * 1.4,
      dist,
    };
  }
  return states;
}
