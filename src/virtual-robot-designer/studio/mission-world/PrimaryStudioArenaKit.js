import * as THREE from 'three';
import { getPrimaryStudioArena } from '../../data/primary-robot-studio.js';
import { getArenaBlueprint } from '../../data/primary-arena-layouts.js';
import { createPrimaryProp } from './PrimaryArenaProps.js';
import { installKartRivals } from '../../racing/KartRivalsKit.js';
import { installRacePresentation } from '../../racing/RacePresentationKit.js';
import { hasMissionTheme, installMissionTheme } from './themes/MissionThemeKit.js';
import { isCarChassis } from '../../data/car-racing-tracks.js';

function buildHumanoidVenue(root, arena, curve) {
  const indoorGym = ['balance_gym', 'wind_balance_bridge', 'walker_champion'].includes(arena.id);
  const performance = ['dance_stage', 'talent_show', 'pose_mirror'].includes(arena.id);
  const sports = arena.id === 'sports_day';
  if (!indoorGym && !performance && !sports) return;

  const mat = (color, roughness = .72, metalness = .08, emissive = 0) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness, emissive, emissiveIntensity: emissive ? .35 : 0 });
    return m;
  };
  const navy = mat(0x101b35, .82), seatBlue = mat(0x233c67), trim = mat(sports ? 0x35d5c5 : performance ? 0xe258d8 : 0x55c8ee, .48, .22, sports ? 0x087a71 : performance ? 0x75106f : 0x075d76);
  const floorMat = mat(sports ? 0x247d62 : performance ? 0x211b37 : indoorGym ? 0x25334b : 0x986a42, .55);
  const box = (w, h, d, material, x, y, z, parent = root) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z); mesh.receiveShadow = true; mesh.castShadow = true; parent.add(mesh); return mesh;
  };
  const pathStart = curve.getPointAt(0), pathEnd = curve.getPointAt(1);
  const centerZ = (pathStart.z + pathEnd.z) / 2;
  const venueLength = Math.max(42, Math.abs(pathEnd.z - pathStart.z) + 22);
  root.children.filter(child => child.name.startsWith('HumanoidVenue:')).forEach(child => {
    child.traverse(object => {
      object.geometry?.dispose();
      (Array.isArray(object.material) ? object.material : object.material ? [object.material] : []).forEach(material => material.dispose());
    });
    root.remove(child);
  });
  const venue = new THREE.Group(); venue.name = `HumanoidVenue:${arena.id}`; root.add(venue);

  // A defined competition floor replaces the bare, floating obstacle-course feel.
  box(42, .16, venueLength, floorMat, 0, -.06, centerZ, venue);
  const stripeMat = mat(0xe8f3fa, .52, .12, 0x253a55);
  if (sports) {
    // Blue indoor track lanes enclosing a green central warm-up field.
    box(25, .025, venueLength - 5, mat(0x1688a3, .55), 0, -.045, centerZ, venue);
    box(12, .035, venueLength - 12, mat(0x277953, .84), 0, -.025, centerZ, venue);
    [-11,-8,-5,5,8,11].forEach(x => box(.09, .018, venueLength - 7, stripeMat, x, -.005, centerZ, venue));
    [-12,12].forEach(x => box(.24, .03, venueLength - 6, trim, x, .01, centerZ, venue));
  } else if (performance) {
    box(20, .025, venueLength - 4, mat(0x291c44, .35, .3, 0x160925), 0, -.045, centerZ, venue);
    for (let i = -3; i <= 3; i++) box(2.1, .045, 2.1, mat(i % 2 ? 0x8e43ca : 0x1bafd0, .32, .35, i % 2 ? 0x49127b : 0x08708a), i * 2.5, .005, centerZ + 2, venue);
  } else {
    // One cushioned runway aligned with the balance course; keep the wood court visible around it.
    box(7.2, .025, venueLength - 8, mat(0x245d78, .62), 0, -.035, centerZ, venue);
    [-3.5,3.5].forEach(x => box(.09, .018, venueLength - 9, stripeMat, x, -.005, centerZ, venue));
    [-3.8,3.8].forEach(x => box(.16, .03, venueLength - 6, trim, x, .01, centerZ, venue));
  }

  // Deep, tiered seating, roof trusses, and lit fascia frame the full route.
  [-1,1].forEach(side => {
    const x = side * 19;
    box(7.2, .55, venueLength, navy, x, .18, centerZ, venue);
    for (let row = 0; row < 5; row++) {
      box(6.3, .34, venueLength - row * 2, row % 2 ? seatBlue : navy,
        x, .62 + row * .48, centerZ, venue);
      box(6.45, .075, venueLength - row * 2,
        row % 3 === 0 ? trim : seatBlue, x, .84 + row * .48, centerZ, venue);
    }
    box(8.5, .22, venueLength + 4, navy, x, 3.15, centerZ, venue);
    box(8.8, .12, venueLength + 4, trim, x, 3.29, centerZ, venue);
    [-1,1].forEach(end => box(.5, 6.5, .6, navy, x, 3.3, centerZ + end * (venueLength / 2 - 1), venue));
  });
  for (let z = centerZ - venueLength / 2 + 5; z < centerZ + venueLength / 2; z += 11) {
    box(42, .22, .35, navy, 0, 7.8, z, venue);
    box(.22, 1.5, .22, trim, -20, 7, z, venue);
    box(.22, 1.5, .22, trim, 20, 7, z, venue);
  }

  // Large readable scoreboard at the finish end gives the space a destination.
  const boardZ = pathEnd.z - 5;
  box(7.2, 3, .55, navy, 0, 6.4, boardZ, venue);
  box(6.55, 2.38, .12, trim, 0, 6.4, boardZ + .36, venue);
  box(5.9, 1.8, .08, mat(0x08172a, .25, .18, 0x05111f), 0, 6.4, boardZ + .46, venue);
  // Bright score tiles read from the chase camera as a live event display.
  [-2.6, -1.75, -0.9, 0.9, 1.75, 2.6].forEach((x, i) => {
    box(.34, .12, .06, mat(i % 2 ? 0x4de0ca : 0xffd36d, .24, .18, i % 2 ? 0x08776d : 0x8c5100), x * .83, 7.15, boardZ + .54, venue);
  });
  box(3.1, .08, .06, stripeMat, 0, 5.55, boardZ + .54, venue);
  [-4.2,4.2].forEach(x => box(.28, 4.3, .42, navy, x, 3.9, boardZ, venue));
  if (performance) {
    // A framed proscenium and rows of stage lights make show levels feel intentional.
    box(26, .55, .7, navy, 0, 8.7, centerZ - 3, venue);
    [-12,12].forEach(x => box(.55, 8.5, .7, trim, x, 4.4, centerZ - 3, venue));
    for (let i = -4; i <= 4; i++) {
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(.24, 12, 8), mat(i % 2 ? 0x50dfff : 0xffcb58, .25, .25, i % 2 ? 0x0c70a0 : 0xa35b08));
      lamp.position.set(i * 2.5, 8.15, centerZ - 2.5); venue.add(lamp);
    }
  }
}

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
  const humanoidVenue = ['droid', 'mech', 'legobot', 'blockbot'].includes(challenge.chassisId)
    && ['balance_gym', 'wind_balance_bridge', 'walker_champion', 'dance_stage', 'talent_show', 'pose_mirror', 'sports_day'].includes(arena.id);
  scene.background = new THREE.Color(humanoidVenue ? (arena.id === 'sports_day' ? 0x10233b : ['dance_stage', 'talent_show', 'pose_mirror'].includes(arena.id) ? 0x171126 : 0x18263a) : arena.sky);
  if (scene.fog) { scene.fog.color.set(humanoidVenue ? scene.background : arena.fog); scene.fog.near=humanoidVenue ? 95 : 65; scene.fog.far=humanoidVenue ? 270 : 205; }
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
  if (['droid', 'mech', 'legobot', 'blockbot'].includes(challenge.chassisId)) {
    buildHumanoidVenue(scene, arena, curve);
  }
  return true;
}
