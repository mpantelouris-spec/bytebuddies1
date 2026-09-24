/**
 * MissionHeroKit — mode-start landmark props (bible Part 3 + family hero kits).
 */
import { applyFamilyHeroKit } from '../ArenaBroadcastKit.js';

/** Place 2–3 large hero props at route start — readable on tablet first frame. */
export function placeMissionHero(scene, challenge, curve, environmentId) {
  if (!curve || scene.getObjectByName('FamilyHeroKit')) return;
  applyFamilyHeroKit(scene, environmentId, curve);
  scene.userData.missionHeroPlaced = true;
}
