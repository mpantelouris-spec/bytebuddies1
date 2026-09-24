/**
 * ArenaModeDressing — modeIndex hero props per environment family (Visual Bible Part 1 + Part 5).
 */
import * as THREE from 'three';
import { ENVIRONMENTS } from '../data/robot-arena-config.js';
import { arenaMover } from './ArenaBuilderCore.js';
import { buildCapstoneDecor, isCapstoneMode } from './CapstoneArenaBuilder.js';
import { applyMissionVisuals } from './MissionVisualDirector.js';
import { applyMissionCinematicPolish } from './MissionCinematicPolish.js';
import {
  addConveyor, addCoralCluster, addCrystalFormation, addTree, addMartianRock,
  addNeonRingGate, addWarehouseShelf, addLaserGridPair, addMissionSign, addHorizonSilhouette,
} from './ArenaSceneryKit.js';
import { isCarChassis } from '../data/car-racing-tracks.js';

function modeIdx(challenge) {
  return Math.max(1, Math.min(10, Number(challenge?.modeIndex) || 1));
}

function envFamily(challenge, arenaType) {
  if (challenge?.environmentId && ENVIRONMENTS[challenge.environmentId]) return challenge.environmentId;
  for (const [id, env] of Object.entries(ENVIRONMENTS)) {
    if (env.arenaTypes?.includes(arenaType)) return id;
  }
  if (/coral|trench|kelp|shipwreck|atlantis|mariana|underwater|seafloor/i.test(arenaType)) return 'underwater';
  if (/firebot|hospital|snow_rescue|blaze/i.test(arenaType)) return 'emergency';
  if (/flight|drone|canyon|cloud|jet|warp|orbit|typhoon|rooftop/i.test(arenaType)) return 'sky_aerial';
  if (/museum|shadow|cyber|night_patrol|escape/i.test(arenaType)) return 'cyber_ninja';
  if (/spider|pipeline|temple_climb|collapsed/i.test(arenaType)) return 'spider_climber';
  if (/factory|warehouse|mine|power_garden|auto_factory|colosseum/i.test(arenaType)) return 'industrial';
  if (/alien|desert_rally|space/i.test(arenaType)) return 'martian';
  if (/checkpoint|targets|delivery|sandbox/i.test(arenaType)) return 'sandbox';
  return 'industrial';
}

function addBox(scene, x, y, z, w, h, d, col, emissive = 0, ei = 0) {
  const m = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshStandardMaterial({ color: col, emissive: emissive || col, emissiveIntensity: ei, roughness: 0.85 }),
  );
  m.position.set(x, y + h / 2, z);
  m.castShadow = true;
  scene.add(m);
  return m;
}

function addBeacon(scene, x, z, col = 0xfbbf24) {
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.1, 2, 6),
    new THREE.MeshStandardMaterial({ color: 0x64748b }),
  );
  pole.position.set(x, 1, z);
  scene.add(pole);
  const lamp = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 8, 8),
    new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 1.2 }),
  );
  lamp.position.set(x, 2.1, z);
  scene.add(lamp);
  const pl = new THREE.PointLight(col, 0.8, 8);
  pl.position.set(x, 2.2, z);
  scene.add(pl);
}

function dressMartian(scene, idx) {
  const props = [
    () => { addCrystalFormation(scene, -5, -12, 0xa855f7); addMartianRock(scene, 4, -14); },
    () => { for (let i = 0; i < 3; i++) addMartianRock(scene, -6 + i * 3, -16 - i); },
    () => { addMartianRock(scene, -5, -18); addTree(scene, 6, -20, 0.6); },
    () => { for (let i = 0; i < 5; i++) addMartianRock(scene, -8 + i * 2.5, -20 - i * 1.5); },
    () => { addCrystalFormation(scene, 0, -22, 0x3b82f6); },
    () => { addMartianRock(scene, 6, -24); addBeacon(scene, -4, -26, 0xfbbf24); },
    () => addBox(scene, -3, 0, -12, 0.5, 0.1, 6, 0xdc2626, 0xff0000, 0.8),
    () => { addMartianRock(scene, 0, -20); addBeacon(scene, 0, -26, 0x22c55e); },
    () => addBeacon(scene, -8, -28, 0x06b6d4),
    () => { addCrystalFormation(scene, 0, -30, 0xffd700); addBox(scene, 0, 0, -32, 2, 3, 0.3, 0xffd700, 0xfbbf24, 0.7); },
  ];
  props[idx - 1]?.();
}

function dressIndustrial(scene, idx) {
  const props = [
    () => addConveyor(scene, -9, -10, 5),
    () => { addWarehouseShelf(scene, -11, -14); addBox(scene, 6, 0.5, -14, 1.2, 1.2, 1.2, 0xf97316); },
    () => addConveyor(scene, 8, -18, 6),
    () => { addBox(scene, -5, 0, -18, 2, 1, 1, 0xef4444); addConveyor(scene, 5, -20, 4); },
    () => addBox(scene, 0, 0, -16, 5, 0.12, 8, 0xfbbf24, 0xfbbf24, 0.5),
    () => { addCrystalFormation(scene, -6, -24, 0x3b82f6); addBeacon(scene, 6, -24, 0x22c55e); },
    () => { addConveyor(scene, 7, -12, 3); addBox(scene, 7, 0, -12, 0.9, 1.4, 0.9, 0xdc2626, 0xff0000, 0.3); },
    () => addWarehouseShelf(scene, -10, -26),
    () => addConveyor(scene, 5, -28, 5),
    () => { addBox(scene, 0, 0, -32, 2.5, 2.5, 0.3, 0xffd700, 0xfbbf24, 0.7); addConveyor(scene, -8, -30, 4); },
  ];
  props[idx - 1]?.();
}

function dressUnderwater(scene, idx) {
  const props = [
    () => { addCoralCluster(scene, -5, -12); addCoralCluster(scene, 4, -14); },
    () => addBox(scene, 6, 0, -16, 0.3, 8, 12, 0x0f172a),
    () => { addCrystalFormation(scene, 0, -20, 0x22d3ee); addBeacon(scene, 0, -20, 0x22d3ee); },
    () => addBox(scene, 3, 0.4, -18, 0.8, 0.6, 0.5, 0xffd700, 0xfbbf24, 0.5),
    () => { addCoralCluster(scene, -4, -22); addCoralCluster(scene, 3, -23); },
    () => { const s = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x06b6d4, emissiveIntensity: 1 })); s.position.set(2, 1.2, -24); scene.add(s); },
    () => addCoralCluster(scene, -6, -14),
    () => { for (let i = 0; i < 5; i++) { const o = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x06b6d4, emissiveIntensity: 1 })); o.position.set((Math.random() - 0.5) * 10, 0.5 + i * 0.3, -18 - i * 2); scene.add(o); } },
    () => addCrystalFormation(scene, 0, -26, 0xe0f2fe),
    () => { addCoralCluster(scene, -3, -30); addBox(scene, 0, 0, -30, 1, 1, 1, 0xe0f2fe, 0x7dd3fc, 0.5); },
  ];
  props[idx - 1]?.();
}

function dressEmergency(scene, idx) {
  const props = [
    () => { addBox(scene, -6, 0, -10, 2, 2.5, 1, 0xdc2626); addBeacon(scene, 5, -12, 0xff4400); },
    () => addBox(scene, 0, 0.8, -16, 2, 0.6, 1, 0xffffff),
    () => addBeacon(scene, -4, -20, 0x38bdf8),
    () => addBox(scene, 6, 0, -14, 0.5, 1.2, 0.5, 0x06b6d4, 0x06b6d4, 0.5),
    () => addBox(scene, -7, 0, -24, 0.3, 0.8, 4, 0xfbbf24, 0xfbbf24, 0.6),
    () => addBox(scene, 4, 0, -28, 3, 0.1, 2, 0xdc2626, 0xff0000, 0.4),
    () => addBeacon(scene, 0, -18, 0xff4400),
    () => addBox(scene, -5, 0, -22, 1.5, 0.8, 0.8, 0xef4444),
    () => addBox(scene, 3, 0, -26, 2, 0.05, 3, 0xfbbf24),
    () => addBox(scene, 0, 0, -32, 2, 2, 0.2, 0xffd700, 0xfbbf24, 0.8),
  ];
  props[idx - 1]?.();
}

function dressSky(scene, idx) {
  const props = [
    () => addNeonRingGate(scene, 0, 4, -12),
    () => addBeacon(scene, -5, -16, 0xfbbf24),
    () => addNeonRingGate(scene, 4, 5, -20),
    () => { const h = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xfbbf24, emissiveIntensity: 0.8 })); h.position.set(0, 0.05, -14); h.rotation.x = -Math.PI / 2; scene.add(h); },
    () => addNeonRingGate(scene, -6, 6, -22, 0xec4899),
    () => addBox(scene, 5, 4, -18, 0.8, 0.8, 0.8, 0x22c55e),
    () => addBeacon(scene, 0, -28, 0x38bdf8),
    () => { const tunnel = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.5, 8, 12, 1, true), new THREE.MeshStandardMaterial({ color: 0x7c3aed, emissive: 0x7c3aed, emissiveIntensity: 0.4, transparent: true, opacity: 0.35, side: THREE.DoubleSide })); tunnel.rotation.x = Math.PI / 2; tunnel.position.set(0, 3, -24); scene.add(tunnel); },
    () => addNeonRingGate(scene, -4, 3.5, -30, 0x06b6d4),
    () => { for (let i = 0; i < 6; i++) { const fw = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), new THREE.MeshBasicMaterial({ color: 0xff66cc })); fw.position.set((Math.random() - 0.5) * 8, 3 + Math.random() * 4, -26 - i); scene.add(fw); } },
  ];
  props[idx - 1]?.();
}

function dressHybridRace(scene, idx) {
  dressSky(scene, idx);
  for (let z = -8; z > -32; z -= 6) {
    const pad = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 1 }),
    );
    pad.rotation.x = -Math.PI / 2;
    pad.position.set((z % 12 === 0 ? 3 : -3), 0.05, z);
    scene.add(pad);
    arenaMover(scene, (t) => { pad.material.emissiveIntensity = 0.6 + Math.sin(t * 4 + z) * 0.4; });
  }
  if (idx >= 7) {
    const warp = new THREE.Mesh(
      new THREE.CylinderGeometry(3, 3, 14, 16, 1, true),
      new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0x7c3aed, emissiveIntensity: 0.5, transparent: true, opacity: 0.3, side: THREE.DoubleSide }),
    );
    warp.rotation.x = Math.PI / 2;
    warp.position.set(0, 2.5, -34);
    scene.add(warp);
  }
}

function dressCyber(scene, idx) {
  const props = [
    () => addLaserGridPair(scene, 0, -10, 5),
    () => addBox(scene, -6, 1.2, -14, 1, 0.8, 0.4, 0x22c55e, 0x22c55e, 0.9),
    () => addLaserGridPair(scene, 4, -18, 4),
    () => addBeacon(scene, 0, -22, 0xec4899),
    () => addBox(scene, -5, 0, -26, 2, 1, 0.2, 0x64748b),
    () => addLaserGridPair(scene, 3, -20, 3),
    () => addBox(scene, 0, 0.8, -28, 1.2, 1, 0.3, 0x22c55e, 0x22c55e, 0.8),
    () => addBeacon(scene, -4, -24, 0x06b6d4),
    () => addBox(scene, 5, 0, -30, 0.8, 0.8, 0.8, 0xff4400, 0xff4400, 0.6),
    () => addLaserGridPair(scene, 0, -32, 6),
  ];
  props[idx - 1]?.();
}

function dressSpider(scene, idx) {
  const props = [
    () => { const web = new THREE.Mesh(new THREE.PlaneGeometry(8, 10), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 })); web.position.set(0, 5, -16); scene.add(web); },
    () => addBox(scene, 0, 2, -14, 8, 0.3, 0.8, 0x78716c),
    () => addBox(scene, -3, 4, -20, 0.2, 3, 0.2, 0xa855f7, 0x7c3aed, 0.3),
    () => addBeacon(scene, 4, -18, 0xff8800),
    () => { for (let i = 0; i < 5; i++) addBox(scene, -6 + i * 3, 0.4, -22 - i, 1.5, 0.8, 1.5, 0x9e8060); },
    () => addBox(scene, 0, 0.2, -26, 0.6, 0.6, 0.6, 0xfbbf24, 0xfbbf24, 0.8),
    () => addBox(scene, -5, 0, -24, 2, 0.05, 2, 0xdc2626, 0xff0000, 0.5),
    () => addBox(scene, 0, 0, -28, 0.4, 8, 0.4, 0x64748b),
    () => { for (let i = 0; i < 4; i++) addBox(scene, -4 + i * 2.5, 0.3, -30 - i, 0.8, 0.6, 0.8, 0x57534e); },
    () => addBox(scene, 0, 3, -34, 6, 4, 0.2, 0xffffff, 0xe2e8f0, 0.2),
  ];
  props[idx - 1]?.();
}

function dressSandbox(scene, idx) {
  const cols = [0xef4444, 0x3b82f6, 0x22c55e, 0xfbbf24];
  const props = [
    () => addBeacon(scene, 0, -12, cols[0]),
    () => { for (let i = 0; i < 4; i++) addBox(scene, -8 + i * 4, 0, -16, 0.8, 0.8, 0.8, cols[i % 4]); },
    () => addBox(scene, -6, 0, -20, 0.3, 0.05, 12, 0x10b981, 0x10b981, 0.5),
    () => addBox(scene, 5, 0, -24, 2, 0.6, 2, 0xe2e8f0),
    () => addBox(scene, 0, 0, -28, 3, 0.1, 8, 0x94a3b8),
    () => addBeacon(scene, 6, -30, cols[2]),
    () => { addBox(scene, -4, 0, -22, 1, 0.8, 1, 0xf97316); addBox(scene, 4, 0, -26, 1, 0.8, 1, 0x8b5cf6); },
    () => addBox(scene, 0, 0, -32, 4, 0.05, 4, 0x64748b),
    () => addBox(scene, -5, 0, -34, 1.5, 1.2, 1.5, 0x1e293b),
    () => addBox(scene, 0, 0, -36, 2, 2, 0.3, 0xffd700, 0xfbbf24, 0.7),
  ];
  props[idx - 1]?.();
}

function dressBoxing(scene, idx) {
  dressCyber(scene, idx);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(5.5, 0.12, 8, 32),
    new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xfbbf24, emissiveIntensity: 0.65 }),
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.set(0, 0.08, -16 - idx * 1.5);
  scene.add(ring);
}

const DRESSERS = {
  martian: dressMartian,
  industrial: dressIndustrial,
  underwater: dressUnderwater,
  emergency: dressEmergency,
  sky_aerial: dressSky,
  hybrid_race_sky: dressHybridRace,
  cyber_ninja: dressCyber,
  spider_climber: dressSpider,
  sandbox: dressSandbox,
  boxing_mech: dressBoxing,
};

export function applyArenaModeDressing(scene, arenaType, challenge = {}) {
  if (scene.userData.combatMode || scene.userData.flappyMode) return;
  // MissionWorldKit owns scatter, route, bloom for chassis + campaign missions.
  if (challenge?.isChassisMode || challenge?.isRobotMission || scene.userData.missionWorldKit) return;
  const chassisId = challenge?.chassisId || '';
  if (isCarChassis(chassisId) || chassisId === 'footballbot') return;

  const family = envFamily(challenge, arenaType);
  const idx = challenge?.isRobotMission ? 1 : modeIdx(challenge);
  const dresser = DRESSERS[family];
  const horizonFamily = family === 'hybrid_race_sky' ? 'sky_aerial' : (family === 'boxing_mech' ? 'industrial' : family);

  if (!scene.getObjectByName('HorizonSilhouette')) {
    addHorizonSilhouette(scene, horizonFamily);
  }

  if ((challenge?.isChassisMode || challenge?.isRobotMission) && !scene.getObjectByName('StartMissionSign')) {
    const obj = challenge?.modeSpec?.gameplayDescription?.match(/Objective:\s*([^.]+)/i)?.[1]
      || challenge?.primaryObjective?.label
      || challenge?.tagline
      || challenge?.desc?.slice(0, 48)
      || 'Reach the green goal';
    const sign = addMissionSign(
      scene, -7, 3.2, 2,
      challenge.shortName || challenge.name || 'Mission',
      obj,
      0x38bdf8,
    );
    sign.name = 'StartMissionSign';
  }

  if (!dresser && challenge?.isRobotMission) {
    if (!scene.getObjectByName('MissionVisualRoot')) applyMissionVisuals(scene, challenge);
    applyMissionCinematicPolish(scene, challenge, arenaType);
    scene.userData.modeDressing = { family, robotMission: true, arenaType };
    return;
  }
  if (!dresser) return;

  if (isCapstoneMode(challenge)) {
    for (let m = 1; m <= 9; m++) dresser(scene, m);
    dresser(scene, 10);
    const curve = scene.userData._chassisCurve;
    if (curve) buildCapstoneDecor(scene, family, curve, 10);
    applyMissionVisuals(scene, challenge);
    applyMissionCinematicPolish(scene, challenge, arenaType);
    scene.userData.modeDressing = { family, modeIndex: 10, arenaType, capstone: true };
    return;
  }

  dresser(scene, idx);
  applyMissionVisuals(scene, challenge);
  applyMissionCinematicPolish(scene, challenge, arenaType);
  scene.userData.modeDressing = { family, modeIndex: idx, arenaType };
}
