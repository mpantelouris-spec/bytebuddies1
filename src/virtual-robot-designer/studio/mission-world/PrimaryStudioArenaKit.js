import * as THREE from 'three';
import { getPrimaryStudioArena } from '../../data/primary-robot-studio.js';
import { getArenaBlueprint } from '../../data/primary-arena-layouts.js';
import { createPrimaryProp } from './PrimaryArenaProps.js';
import { installKartRivals } from '../../racing/KartRivalsKit.js';
import { installRacePresentation } from '../../racing/RacePresentationKit.js';
import { hasMissionTheme, installMissionTheme } from './themes/MissionThemeKit.js';
import { isCarChassis } from '../../data/car-racing-tracks.js';

export function installPrimaryStudioChapter(scene, challenge, curve) {
  if (!challenge?.isChassisMode || !curve || !challenge.chassisId || challenge.chassisId === 'footballbot') return false;
  const arena = getPrimaryStudioArena(challenge.chassisId, challenge.modeIndex);
  const existing = scene.getObjectByName('PrimaryStudioArena');
  if (existing?.userData.arenaId === arena.id) return true;
  if (existing) {
    scene.userData.obstacles = (scene.userData.obstacles || []).filter(o => !o.primaryDecor);
    const geometries = new Set(), materials = new Set();
    existing.traverse(o => {
      if (o.geometry) geometries.add(o.geometry);
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => materials.add(m));
    });
    geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose());
    scene.remove(existing);
  }
  const root = new THREE.Group();
  root.name = 'PrimaryStudioArena';
  root.userData = { arenaId: arena.id, studioMode: arena.mode, studioChassis: challenge.chassisId, premiumEnvironment: arena.id };
  const blueprint = getArenaBlueprint(arena);
  const accent = new THREE.Color(arena.sky).lerp(new THREE.Color(0x218fba), .35).getHex();
  const obstacles = scene.userData.obstacles ||= [];
  // Winding routes double back, so a prop beside one stretch can land on another.
  // Check every placement against the whole route and the start area.
  const routeSamples = curve.getSpacedPoints(240);
  const start = curve.getPointAt(0), startDir = curve.getTangentAt(0).setY(0).normalize();
  const spawnZone = [0, 2, 4, 6, 8].map(k => start.clone().addScaledVector(startDir, -k));
  const PATH_CLEAR = 7.5, SPAWN_CLEAR = 9;
  const isClear = (x, z) => routeSamples.every(q => Math.hypot(q.x - x, q.z - z) >= PATH_CLEAR)
    && spawnZone.every(q => Math.hypot(q.x - x, q.z - z) >= SPAWN_CLEAR);
  blueprint.placements.forEach(({t,side,offset,prop}) => {
    const p = curve.getPoint(t), tangent = curve.getTangent(t).normalize();
    // Push outward from the route until the prop is clear; skip it if it never is.
    let x, z, found = false;
    for (let extra = 0; extra <= 12 && !found; extra += 2) {
      x = p.x - tangent.z * side * (offset + extra);
      z = p.z + tangent.x * side * (offset + extra);
      found = isClear(x, z);
    }
    if (!found) return;
    const model = createPrimaryProp(prop, accent);
    // Keep landmarks readable from the chase camera without letting them fill
    // the whole frame or crowd the driving line.
    model.scale.setScalar(0.68);
    model.position.set(x, challenge.physics === 'flight_3dof' ? p.y - 3 : 0, z);
    model.rotation.y = Math.atan2(tangent.x, tangent.z) + (side > 0 ? Math.PI : 0);
    root.add(model);
    obstacles.push({mesh:model, radius:3.3, primaryDecor:true});
  });
  scene.add(root);
  scene.background = new THREE.Color(arena.sky);
  if (scene.fog) { scene.fog.color.set(arena.fog); scene.fog.near=65; scene.fog.far=205; }
  scene.userData.primaryStudioWorld = true;
  scene.userData.nintendoClean = true;
  scene.userData.nintendoRich = true;
  scene.userData.raceVisual = {...scene.userData.raceVisual, bloom:.16, threshold:.9, radius:.16};
  // Rival karts and laps belong to wheeled racers only — never in a spider,
  // sub or drone finale.
  if (isCarChassis(challenge.chassisId) && (arena.id === 'robot_rally' || arena.isRace)) {
    installRacePresentation(scene, curve, { halfWidth: 4, roadDeck: true });
    installKartRivals(scene, curve, { halfWidth: 4, laps: 3 });
    scene.userData.raceMode = true;
    scene.userData.raceHudTheme = 'default';
    scene.userData.raceWorldName = 'ByteBuddies Rally';
    scene.userData.raceTotalLaps = 3;
    scene.userData.raceRivalCount = 3;
  }
  if (hasMissionTheme(arena.id)) installMissionTheme(scene, curve, arena, challenge);
  return true;
}
