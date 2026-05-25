#!/usr/bin/env node
/**
 * Smoke-check VRD modules import and core logic without a browser.
 */
import { placePartOnSlot } from '../src/virtual-robot-designer/services/assembly-service.js';
import { slotAcceptsPart } from '../src/virtual-robot-designer/data/assembly-parts.js';
import { computeDesignStats } from '../src/virtual-robot-designer/services/design-service.js';
import { createFreshRobotDesign } from '../src/virtual-robot-designer/utils/initRobotDesign.js';
import { MODULAR_CHASSIS } from '../src/virtual-robot-designer/data/modular-parts-registry.js';

const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

let d = createFreshRobotDesign();
assert(MODULAR_CHASSIS.length >= 6, 'chassis catalog');
assert(!slotAcceptsPart('movement', 'sensors'), 'invalid socket combo');
d = placePartOnSlot(d, 'movement', 'movement', 'standard');
assert(d.assembly?.slots?.movement?.partId === 'standard', 'place movement');
const stats = computeDesignStats(d);
assert(stats.speed >= 5 && stats.speed <= 100, 'stats clamped');

if (failures.length) {
  console.error('VRD smoke FAILED:\n', failures.map((f) => `  - ${f}`).join('\n'));
  process.exit(1);
}
console.log('VRD smoke OK');
