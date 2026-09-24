import * as THREE from 'three';
import { getPrimaryStudioArena } from '../../data/primary-robot-studio.js';
import { getArenaBlueprint } from '../../data/primary-arena-layouts.js';
import { createPrimaryProp } from './PrimaryArenaProps.js';
import { installKartRivals } from '../../racing/KartRivalsKit.js';
import { installRacePresentation } from '../../racing/RacePresentationKit.js';

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
  blueprint.placements.forEach(({t,side,offset,prop}) => {
    const p = curve.getPoint(t), tangent = curve.getTangent(t).normalize();
    const model = createPrimaryProp(prop, accent);
    // Keep landmarks readable from the chase camera without letting them fill
    // the whole frame or crowd the driving line.
    model.scale.setScalar(0.68);
    model.position.set(p.x - tangent.z * side * offset, challenge.physics === 'flight_3dof' ? p.y - 3 : 0, p.z + tangent.x * side * offset);
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
  if (arena.id === 'robot_rally' || challenge.modeIndex === 10) {
    installRacePresentation(scene, curve, { halfWidth: 4, roadDeck: true });
    installKartRivals(scene, curve, { halfWidth: 4, laps: 3 });
    scene.userData.raceMode = true;
    scene.userData.raceHudTheme = 'default';
    scene.userData.raceWorldName = 'ByteBuddies Rally';
    scene.userData.raceTotalLaps = 3;
    scene.userData.raceRivalCount = 3;
  }
  return true;
}
