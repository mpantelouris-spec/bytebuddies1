/**
 * MissionArenaFinalize — delegates to MissionWorldKit (single graphics orchestrator).
 */
import { buildMissionWorld } from './mission-world/MissionWorldKit.js';
import { isCarChassis } from '../data/car-racing-tracks.js';
import { applyMissionKidClarity } from './mission-world/MissionKidClarity.js';
import { isPrimaryStudioChassis } from '../data/primary-robot-studio.js';

/** Run after buildSmartArena for chassis modes; robot missions call after buildMissionArena. */
export function finalizeMissionArenaVisuals(scene, arenaType, challenge) {
  applyMissionKidClarity(scene, challenge);
  if (scene.userData.combatMode || scene.userData.flappyMode || scene.userData.biomeAAA) return;
  if (scene.userData.aerialWorldBuilt || scene.userData.skipMissionWorld) return;
  if (!challenge?.isChassisMode && !challenge?.isRobotMission) return;

  const chassisId = challenge.chassisId || '';
  if ((isCarChassis(chassisId) && !isPrimaryStudioChassis(chassisId)) || chassisId === 'footballbot') return;

  // Robot missions build route in buildMissionArena — defer until SimCanvas calls this after that.
  if (challenge.isRobotMission) return;

  buildMissionWorld(scene, arenaType, challenge);
}

export { buildMissionWorld };
