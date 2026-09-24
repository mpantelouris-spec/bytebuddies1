/**
 * Hand-authored geometry for the two gold chapters in ROBOT CHAPTER DEEP SPEC.
 * These are visual teaching sets, not generic keyword props.
 */
import * as THREE from 'three';
import { arenaMover } from '../ArenaBuilderCore.js';
import { getGoldChapterMode } from './RobotChapterDeepSpec.js';

function material(color, options = {}) {
  const params = {
    color,
    roughness: options.roughness ?? 0.78,
    metalness: options.metalness ?? 0.05,
    emissive: options.emissive ?? 0x000000,
    emissiveIntensity: options.emissiveIntensity ?? 0,
    transparent: options.transparent ?? false,
    opacity: options.opacity ?? 1,
  };
  if (options.side !== undefined) params.side = options.side;
  return new THREE.MeshStandardMaterial(params);
}

function addMesh(group, geometry, mat, position, name) {
  const mesh = new THREE.Mesh(geometry, mat);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (name) mesh.name = name;
  group.add(mesh);
  return mesh;
}

function curveFrame(curve, t, side = 0, yOffset = 0) {
  const p = curve.getPoint(t);
  const tangent = curve.getTangent(t).normalize();
  return {
    point: new THREE.Vector3(p.x + tangent.z * side, p.y + yOffset, p.z - tangent.x * side),
    yaw: Math.atan2(tangent.x, tangent.z),
  };
}

function addFlag(group, p, gold = false) {
  addMesh(group, new THREE.CylinderGeometry(0.08, 0.1, 5.5, 8), material(0xe2e8f0, { metalness: 0.55 }), [p.x, p.y + 2.75, p.z], 'FlagPole');
  addMesh(group, new THREE.BoxGeometry(2.8, 1.25, 0.12), material(gold ? 0xfbbf24 : 0x2563eb, {
    emissive: gold ? 0xf59e0b : 0x1d4ed8,
    emissiveIntensity: 0.3,
  }), [p.x + 1.4, p.y + 5, p.z], gold ? 'GoldNasaFlag' : 'NasaFlag');
}

function addMudBasins(group, curve, ts = [0.3, 0.5, 0.7]) {
  ts.forEach((t, i) => {
    const { point } = curveFrame(curve, t, 0, 0.055);
    const puddle = addMesh(
      group,
      new THREE.CylinderGeometry(2.5, 2.8, 0.1, 24),
      material(i % 2 ? 0x6d3f27 : 0x79513a, { roughness: 0.34, metalness: 0.08 }),
      [point.x, point.y, point.z],
      `MudBasin${i + 1}`,
    );
    puddle.scale.z = 0.72;
  });
}

function addRopeBridge(group, curve, t = 0.55) {
  const { point, yaw } = curveFrame(curve, t, 0, 0.18);
  const bridge = new THREE.Group();
  bridge.name = 'RopeBridge';
  bridge.position.copy(point);
  bridge.rotation.y = yaw;
  for (let i = -4; i <= 4; i++) {
    addMesh(bridge, new THREE.BoxGeometry(4.2, 0.18, 0.75), material(i % 2 ? 0x9a6a3a : 0xb77942), [0, 0, i * 0.72], `BridgePlank${i + 5}`);
  }
  [-2.1, 2.1].forEach((x) => {
    [-3.2, 3.2].forEach((z) => addMesh(bridge, new THREE.CylinderGeometry(0.1, 0.12, 2.2, 8), material(0x6b4423), [x, 1, z]));
    const rope = addMesh(bridge, new THREE.CylinderGeometry(0.06, 0.06, 6.4, 8), material(0xd6b884), [x, 1.65, 0]);
    rope.rotation.x = Math.PI / 2;
  });
  group.add(bridge);
}

function addTerraces(group, curve, startT = 0.36) {
  [0, 1, 2].forEach((level) => {
    const { point, yaw } = curveFrame(curve, startT + level * 0.17, level % 2 ? 8 : -8, 0);
    const terrace = addMesh(
      group,
      new THREE.BoxGeometry(9, 0.9 + level * 0.65, 7),
      material(level === 2 ? 0xa94732 : 0xb8523c, { roughness: 0.96 }),
      [point.x, point.y + 0.45 + level * 0.32, point.z],
      `MarsTerrace${level + 1}`,
    );
    terrace.rotation.y = yaw;
  });
}

function addBoulderField(group, curve) {
  [0.28, 0.43, 0.58, 0.73].forEach((t, i) => {
    const { point } = curveFrame(curve, t, i % 2 ? 4.8 : -4.8, 1.2);
    const boulder = addMesh(group, new THREE.DodecahedronGeometry(1.7 + (i % 2) * 0.35, 0), material(0x8b4636, { roughness: 0.98 }), point.toArray(), `Boulder${i + 1}`);
    boulder.scale.set(1.25, 0.9, 1);
  });
}

function addTrench(group, curve) {
  [0.35, 0.53, 0.71].forEach((t, i) => {
    [-1, 1].forEach((side) => {
      const { point, yaw } = curveFrame(curve, t, side * 5.3, 1.15);
      const wall = addMesh(group, new THREE.BoxGeometry(3.6, 2.3, 11), material(i % 2 ? 0x8b3a2a : 0x713225, { roughness: 0.96 }), point.toArray(), `TrenchWall${i}${side}`);
      wall.rotation.y = yaw;
    });
  });
}

function addDunes(group, curve) {
  [0.3, 0.5, 0.7].forEach((t, i) => {
    const { point, yaw } = curveFrame(curve, t, i % 2 ? 7 : -7, 0.5);
    const dune = addMesh(group, new THREE.SphereGeometry(4.8, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), material(0xd87552, { roughness: 0.98 }), point.toArray(), `Dune${i + 1}`);
    dune.scale.set(1.7, 0.65, 1);
    dune.rotation.y = yaw;
  });
}

function addSeismicPlates(group, curve) {
  [0.32, 0.52, 0.72].forEach((t, i) => {
    const { point, yaw } = curveFrame(curve, t, 0, 0.08);
    const plate = addMesh(group, new THREE.BoxGeometry(5.4, 0.12, 5.2), material(i % 2 ? 0x9f4635 : 0xaf5039, { roughness: 0.95 }), point.toArray(), `SeismicPlate${i + 1}`);
    plate.rotation.y = yaw + (i - 1) * 0.1;
    const crack = addMesh(group, new THREE.BoxGeometry(0.12, 0.08, 4), material(0x5c2810), [point.x, point.y + 0.09, point.z], `SeismicCrack${i + 1}`);
    crack.rotation.y = yaw + (i % 2 ? 0.5 : -0.45);
  });
}

function addIncline(group, curve) {
  const { point, yaw } = curveFrame(curve, 0.58, 8, 1.7);
  const ramp = addMesh(group, new THREE.BoxGeometry(8, 1.2, 24), material(0xa94732, { roughness: 0.96 }), point.toArray(), 'InclineHoldRamp');
  ramp.rotation.set(-THREE.MathUtils.degToRad(15), yaw, 0);
  const crate = addMesh(group, new THREE.BoxGeometry(3, 3, 3), material(0xb77942), [point.x, point.y + 2.2, point.z + 8], 'HeavyLoadCrate');
  crate.rotation.y = yaw;
}

function addPatrolZones(group, curve) {
  [0.28, 0.52, 0.76].forEach((t, i) => {
    const { point } = curveFrame(curve, t, i === 1 ? 3.5 : -3.5, 0.1);
    const color = [0x22d3ee, 0xfbbf24, 0xa78bfa][i];
    const ring = addMesh(group, new THREE.RingGeometry(2, 2.35, 28), material(color, {
      emissive: color, emissiveIntensity: 0.58, transparent: true, opacity: 0.86, side: THREE.DoubleSide,
    }), point.toArray(), `PatrolZone${String.fromCharCode(65 + i)}`);
    ring.rotation.x = -Math.PI / 2;
    addMesh(group, new THREE.CylinderGeometry(0.1, 0.12, 3.2, 8), material(color, { emissive: color, emissiveIntensity: 0.45 }), [point.x, point.y + 1.6, point.z]);
  });
}

export function installGoldCrawlerChapter(scene, challenge, curve) {
  const spec = getGoldChapterMode(challenge);
  if (!spec || spec.chassisId !== 'crawler' || !curve || scene.getObjectByName('GoldCrawlerArena')) return false;
  const root = new THREE.Group();
  root.name = 'GoldCrawlerArena';
  root.userData.layoutKind = spec.layoutKind;
  root.userData.heroProp = spec.heroProp;
  switch (spec.layoutKind) {
    case 'stepped_terraces': {
      addTerraces(root, curve);
      const { point } = curveFrame(curve, 0.82, 7, 2.6);
      addFlag(root, point);
      break;
    }
    case 'mud_basins': {
      addMudBasins(root, curve);
      const { point, yaw } = curveFrame(curve, 0.2, 4.5, 1.5);
      const sign = addMesh(root, new THREE.BoxGeometry(2.8, 1.5, 0.18), material(0xf97316, { emissive: 0x7c2d12, emissiveIntensity: 0.18 }), point.toArray(), 'TractionWarningSign');
      sign.rotation.y = yaw;
      break;
    }
    case 'rope_bridge': addRopeBridge(root, curve); break;
    case 'boulder_zigzag': {
      addBoulderField(root, curve);
      const { point } = curveFrame(curve, 0.82, 5, 0);
      addFlag(root, point);
      break;
    }
    case 'shallow_trench': {
      addTrench(root, curve);
      const { point } = curveFrame(curve, 0.82, 6, 2.5);
      const dish = addMesh(root, new THREE.SphereGeometry(2.2, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), material(0x94a3b8, { metalness: 0.55 }), point.toArray(), 'TrenchCommDish');
      dish.rotation.x = -0.55;
      break;
    }
    case 'dune_ridges': {
      addDunes(root, curve);
      const { point } = curveFrame(curve, 0.72, 6, 0);
      addFlag(root, point);
      break;
    }
    case 'seismic_plates': {
      addSeismicPlates(root, curve);
      const { point } = curveFrame(curve, 0.78, 5, 1.5);
      addMesh(root, new THREE.CylinderGeometry(0.35, 0.55, 3, 10), material(0xef4444, { emissive: 0xef4444, emissiveIntensity: 0.48 }), point.toArray(), 'SeismicSensor');
      break;
    }
    case 'incline_hold': addIncline(root, curve); break;
    case 'patrol_zones': addPatrolZones(root, curve); break;
    case 'crawler_capstone': {
      addTerraces(root, curve, 0.18);
      addMudBasins(root, curve, [0.48]);
      addRopeBridge(root, curve, 0.72);
      const { point } = curveFrame(curve, 0.9, 5, 0);
      addFlag(root, point, true);
      break;
    }
    default: return false;
  }
  scene.add(root);
  scene.userData.goldChapterMode = spec;
  return true;
}

function addJetSilhouette(root, point, name, color = 0x475569) {
  const g = new THREE.Group();
  g.name = name;
  g.position.copy(point);
  addMesh(g, new THREE.BoxGeometry(9, 1.4, 3), material(color, { metalness: 0.48 }), [0, 0, 0]);
  addMesh(g, new THREE.BoxGeometry(18, 0.35, 2.3), material(color, { metalness: 0.48 }), [0, 0, 0]);
  addMesh(g, new THREE.BoxGeometry(5, 0.3, 6), material(color, { metalness: 0.48 }), [0, 0, 2.5]);
  root.add(g);
  return g;
}

export function installGoldJetChapter(scene, challenge, curve) {
  const spec = getGoldChapterMode(challenge);
  if (!spec || spec.chassisId !== 'jetplane' || !curve || scene.getObjectByName('GoldJetArena')) return false;
  const root = new THREE.Group();
  root.name = 'GoldJetArena';
  root.userData.layoutKind = spec.layoutKind;
  root.userData.heroProp = spec.heroProp;
  const cyan = material(0x00d4ff, { emissive: 0x00d4ff, emissiveIntensity: 0.65, metalness: 0.25 });
  const gold = material(0xffa040, { emissive: 0xffa040, emissiveIntensity: 0.5, metalness: 0.2 });

  if (spec.layoutKind === 'ace_slalom') {
    const start = curve.getPoint(0);
    const mid = curve.getPoint(0.22);
    addMesh(root, new THREE.BoxGeometry(36, 2.2, 14), material(0x475569, { metalness: 0.5, roughness: 0.42 }), [mid.x + 16, mid.y - 8, mid.z], 'AceCarrierDeck');
    addMesh(root, new THREE.BoxGeometry(0.35, 0.08, 12), material(0xf8fafc), [mid.x + 16, mid.y - 6.85, mid.z], 'AceCarrierLine');
    addFlag(root, new THREE.Vector3(start.x - 6, start.y - 8, start.z + 2), true);
    addFlag(root, new THREE.Vector3(start.x + 5, start.y - 8, start.z - 1), true);
  } else if (spec.layoutKind === 'precision_dive') {
    const p = curve.getPoint(0.72);
    [5.5, 3.6, 1.8].forEach((r, i) => {
      const target = addMesh(root, new THREE.RingGeometry(r - 0.45, r, 36), i % 2 ? cyan : gold, [p.x, p.y - 8, p.z], `StrikeTargetRing${i + 1}`);
      target.rotation.x = -Math.PI / 2;
    });
  } else if (spec.layoutKind === 'carrier_pass') {
    const p = curve.getPoint(0.56);
    addMesh(root, new THREE.BoxGeometry(80, 2, 30), material(0x475569, { metalness: 0.56, roughness: 0.46 }), [p.x, p.y - 4.5, p.z], 'TouchAndGoCarrierDeck');
    addMesh(root, new THREE.BoxGeometry(1, 0.08, 25), material(0xf8fafc), [p.x, p.y - 3.45, p.z], 'CarrierCenterLine');
  } else if (spec.layoutKind === 'mach_straight') {
    const p = curve.getPoint(0.48);
    [-6, 6].forEach((x) => addMesh(root, new THREE.BoxGeometry(0.7, 10, 0.7), gold, [p.x + x, p.y, p.z], 'MachGatePost'));
    addMesh(root, new THREE.BoxGeometry(13, 1.1, 0.8), gold, [p.x, p.y + 5, p.z], 'Mach2SpeedGate');
  } else if (spec.layoutKind === 'day_radar_evasion') {
    const p = curve.getPoint(0.58);
    const dish = addMesh(root, new THREE.SphereGeometry(4, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), material(0x64748b, { metalness: 0.48 }), [p.x + 15, p.y - 14, p.z], 'DayRadarDish');
    dish.rotation.x = -0.55;
    const sweep = addMesh(root, new THREE.ConeGeometry(7, 28, 24, 1, true), material(0x22c55e, {
      emissive: 0x22c55e, emissiveIntensity: 0.25, transparent: true, opacity: 0.16, side: THREE.DoubleSide,
    }), [p.x + 15, p.y, p.z], 'RadarSweepCone');
    sweep.rotation.z = Math.PI / 2;
    arenaMover(scene, (time) => { sweep.rotation.y = time * 0.42; });
  } else if (spec.layoutKind === 'jammer_figure8') {
    [0.38, 0.68].forEach((t, i) => {
      const p = curve.getPoint(t);
      addMesh(root, new THREE.CylinderGeometry(0.8, 1.2, 8, 10), material(0xa855f7, { emissive: 0xa855f7, emissiveIntensity: 0.62 }), [p.x + (i ? -10 : 10), p.y - 3, p.z], `JammerPylon${i + 1}`);
    });
  } else if (spec.layoutKind === 'tanker_corridor') {
    const p = curve.getPoint(0.48);
    const tanker = addJetSilhouette(root, new THREE.Vector3(p.x + 15, p.y + 2, p.z), 'TankerPlane', 0x94a3b8);
    tanker.scale.setScalar(1.35);
    const hose = addMesh(root, new THREE.CylinderGeometry(0.1, 0.1, 10, 8), material(0xfbbf24), [p.x + 9, p.y, p.z], 'FuelHose');
    hose.rotation.z = Math.PI / 2;
  } else if (spec.layoutKind === 'open_canyon_slalom') {
    const p = curve.getPoint(0.58);
    const island = addMesh(root, new THREE.ConeGeometry(10, 20, 10), material(0x6b5a4a, { roughness: 0.94 }), [p.x + 30, p.y - 18, p.z], 'CanyonCitadelIsland');
    island.rotation.z = Math.PI;
    addMesh(root, new THREE.CylinderGeometry(7, 8, 1.8, 12), material(0x4a8a3a), [p.x + 30, p.y - 7, p.z], 'CanyonIslandGrass');
  } else if (spec.layoutKind === 'escort_corridor') {
    const p = curve.getPoint(0.5);
    const transport = addJetSilhouette(root, new THREE.Vector3(p.x - 17, p.y, p.z), 'EscortTransport', 0x64748b);
    transport.scale.set(1.4, 1.4, 1.8);
  } else if (spec.layoutKind === 'ace_capstone') {
    const p = curve.getPoint(0.86);
    addMesh(root, new THREE.BoxGeometry(15, 2.4, 0.24), gold, [p.x, p.y + 6, p.z], 'GoldAceBanner');
  }

  scene.add(root);
  scene.userData.goldChapterMode = spec;
  return true;
}
