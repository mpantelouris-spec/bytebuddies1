/**
 * FlyingChassisSetPiece — large mode-specific hero landmarks beside the flight path.
 */
import * as THREE from 'three';
import { applyModeSplineVariation, installFlyingModeArena } from './FlyingModeArenaKit.js';

export function clearFlyingArenaLayers(scene) {
  if (!scene) return;
  const names = [
    'FlyingChassisSetPiece', 'FlyingVistaLayer', 'FlyingSpawnRoot', 'FlyingModeScenery',
    'FlyingMissionDressing', 'PremiumSpawnSkyIsland', 'AerialGates', 'AerialMissionComposition',
    'ChassisAerialVista', 'aerial-parallax-clouds', 'AerialDifficultyDressing', 'AerialMidground',
    'ue5-aerial-atmosphere',
  ];
  names.forEach((name) => {
    const obj = scene.getObjectByName(name);
    if (obj) obj.parent?.remove(obj);
  });
  ['aaa-sky-dome', 'ChassisAerialVista', 'AerialWorldRoot'].forEach((name) => {
    const obj = scene.getObjectByName(name);
    if (obj) obj.parent?.remove(obj);
  });
  scene.userData.aerialWorldBuilt = false;
  scene.userData.flyingArenaActive = false;
  scene.userData.flyingContract = null;
  scene.userData.useAerialReferenceVista = false;
  scene.userData.kidFlyingWorld = false;
  scene.userData.aerialUE5 = false;
  scene.userData.premiumUE5 = false;
  scene.userData.premiumFlyingVista = false;
  scene.userData.ue5Atmosphere = null;
}

export function installFlyingChassisSetPiece(scene, curve, contract) {
  if (!scene || !curve || !contract?.bible || scene.getObjectByName('FlyingChassisSetPiece')) return null;

  const root = new THREE.Group();
  root.name = 'FlyingChassisSetPiece';
  installFlyingModeArena(scene, curve, contract, root);

  scene.add(root);
  scene.userData.flyingSetPiece = `${contract.bible.aerialVista}:mode${contract.mode}`;
  return root;
}

export function applyFlyingModeSplineVariation(curve, contract) {
  return applyModeSplineVariation(curve, contract);
}
