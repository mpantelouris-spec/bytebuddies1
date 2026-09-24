/**
 * Audit: every studio chassis + modular variant resolves to the correct mesh key (not rover).
 */
import { CHASSIS_DATA, MODULAR_BUILD_KEYS, normalizeRobotBuildConfig } from '../src/virtual-robot-designer/services/studio-robot-builder.js';
import { resolveChassisKey, CHASSIS_MODE_MAP } from '../src/virtual-robot-designer/data/chassis-game-modes.js';
import { isCarChassis } from '../src/virtual-robot-designer/data/car-racing-tracks.js';

const CAR_OK = new Set(['rover', 'scout']);
const SKIP_ARENA = new Set(['footballbot', 'striker', 'blaster', 'ninja', 'berserker']);

function resolveBuildId(cfg) {
  const chassis = CHASSIS_DATA.find((c) => c.id === cfg.chassisId) || CHASSIS_DATA[0];
  return (
    (cfg.chassisBuildKey && cfg.chassisBuildKey !== cfg.chassisId ? cfg.chassisBuildKey : null)
    || (CHASSIS_DATA.some((c) => c.id === cfg.chassisId) ? cfg.chassisId : null)
    || MODULAR_BUILD_KEYS[cfg.chassisId]
    || cfg.chassisBuildKey
    || chassis.id
  );
}

let failed = 0;

for (const ch of CHASSIS_DATA) {
  const cfg = normalizeRobotBuildConfig({ chassisId: ch.id });
  const buildId = resolveBuildId(cfg);
  const modeKey = resolveChassisKey(ch.id);
  const hasModes = CHASSIS_MODE_MAP[modeKey]?.length === 10;

  if (buildId === 'rover' && ch.id !== 'rover' && !CAR_OK.has(ch.id)) {
    console.error(`FAIL mesh: ${ch.id} -> buildId=${buildId}`);
    failed++;
  }
  if (!hasModes && !SKIP_ARENA.has(ch.id)) {
    console.error(`FAIL modes: ${ch.id} key=${modeKey}`);
    failed++;
  }
  if (isCarChassis(ch.id) && !CAR_OK.has(ch.id)) {
    console.error(`FAIL car gate: ${ch.id} marked car chassis`);
    failed++;
  }
}

for (const [modularId, buildKey] of Object.entries(MODULAR_BUILD_KEYS)) {
  const cfg = normalizeRobotBuildConfig({ chassisId: modularId });
  const buildId = resolveBuildId(cfg);
  if (buildId === 'rover' && buildKey !== 'rover') {
    console.error(`FAIL modular: ${modularId} -> ${buildId} (expected ${buildKey})`);
    failed++;
  }
  const modeKey = resolveChassisKey(modularId);
  if (modeKey === 'custom' && buildKey !== 'rover') {
    console.error(`FAIL modular modes: ${modularId} -> ${modeKey}`);
    failed++;
  }
}

if (failed) {
  console.error(`\n${failed} chassis audit failure(s)`);
  process.exit(1);
}
console.log(`OK — ${CHASSIS_DATA.length} chassis + ${Object.keys(MODULAR_BUILD_KEYS).length} modular variants`);
