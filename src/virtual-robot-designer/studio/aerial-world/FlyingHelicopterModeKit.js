/**
 * FlyingHelicopterModeKit — 10 visually distinct Helicopter arenas over ocean platforms.
 */
import * as THREE from 'three';
import {
  flyingMat, flyingGeo, flyingAdd,
  buildRealisticOilRig, buildRealisticOceanPlane,
} from './FlyingArenaMaterialKit.js';
import { arenaMover } from '../ArenaBuilderCore.js';
import { registerFlyingMissionPad } from './FlyingDroneModeKit.js';

const mat = flyingMat;
const add = flyingAdd;

function frameAt(curve, t, side = 0, drop = 0) {
  const p = curve.getPoint(t);
  const tan = curve.getTangent(t).normalize();
  const yaw = Math.atan2(tan.x, tan.z);
  const right = new THREE.Vector3(tan.z, 0, -tan.x);
  const pos = p.clone().addScaledVector(right, side).add(new THREE.Vector3(0, -drop, 0));
  return { pos, yaw, right, flightY: p.y, p, tan };
}

function oilRig(g, x, y, z, name, extras = {}) {
  buildRealisticOilRig(g, x, y, z, name, extras);
}

export function applyHelicopterModeRecipeFlags(recipe, mode) {
  const flags = {
    1: {},
    2: { tunnel: false },
    3: { stormClouds: true, rain: true, stormWall: true, goldenHour: false },
    4: { cloudPillars: 0 },
    5: { launchTower: true, starfieldAbove: 50, goldenHour: false },
    6: { hoverPads: 3 },
    7: {},
    8: { tunnel: true, windZones: 3 },
    9: { stormClouds: true, rain: true, stormWall: true, goldenHour: false },
    10: { sections: true, stormClouds: true, rain: true, goldenHour: false },
  };
  return { ...recipe, ...(flags[mode] || {}) };
}

export function installHelicopterModeArena(scene, curve, contract, root) {
  const mode = contract.mode;
  const primary = contract.bible?.gateColors?.primary ?? 0xfbbf24;
  const secondary = contract.bible?.gateColors?.secondary ?? 0x1e40af;

  const ocean = frameAt(curve, 0.5, 0, 38);
  buildRealisticOceanPlane(root, ocean.p.x, ocean.flightY - 41, ocean.p.z - 20, 420, 420, 'HeliOceanPlane');

  const spawn = curve.getPoint(0);
  oilRig(root, spawn.x - 48, spawn.y - 38, spawn.z - 55, 'RigA');
  oilRig(root, spawn.x + 42, spawn.y - 38, spawn.z - 95, 'RigB');
  oilRig(root, spawn.x + 5, spawn.y - 38, spawn.z - 135, 'RigC');
  oilRig(root, spawn.x - 30, spawn.y - 38, spawn.z - 175, 'RigD');

  switch (mode) {
    case 1: {
      const start = curve.getPoint(0);
      add(root, new THREE.BoxGeometry(2.4, 2.4, 2.4), mat(0xf97316), start.x, start.y - 5, start.z, 'CargoCrate');
      add(root, new THREE.BoxGeometry(0.15, 4, 0.15), mat(0x94a3b8), start.x, start.y - 3, start.z, 'CargoHookLine');
      [0.25, 0.5, 0.75].forEach((t, i) => {
        const p = frameAt(curve, t, i % 2 ? 18 : -18, 10);
        add(root, new THREE.TorusGeometry(5, 0.35, 8, 24), mat(primary, { emissive: primary, emi: 0.35 }), p.p.x, p.flightY, p.p.z, `CargoGate${i}`);
      });
      break;
    }
    case 2: {
      for (let i = 0; i < 4; i++) {
        const t = 0.15 + i * 0.2;
        const p = frameAt(curve, t, 0, 0);
        add(root, new THREE.BoxGeometry(52, 14, 3), mat(0x22c55e, { transparent: true, opacity: 0.12 }), p.p.x - 22, p.flightY, p.p.z, `AltWallL${i}`);
        add(root, new THREE.BoxGeometry(52, 14, 3), mat(0x22c55e, { transparent: true, opacity: 0.12 }), p.p.x + 22, p.flightY, p.p.z, `AltWallR${i}`);
      }
      const rigPad = frameAt(curve, 0.45, 0, 34);
      const movingPad = add(root, new THREE.CylinderGeometry(4.5, 4.5, 0.3, 12), mat(0xfbbf24, { emissive: 0xfbbf24, emi: 0.45 }), rigPad.p.x + 42, rigPad.flightY - 34, rigPad.p.z - 95, 'MovingRigPad');
      registerFlyingMissionPad(scene, curve, 0.45, 'RIG 2', 0, -34);
      arenaMover(scene, (time) => {
        movingPad.position.x = rigPad.p.x + 42 + Math.sin(time * 0.8) * 3;
        movingPad.position.z = rigPad.p.z - 95 + Math.cos(time * 0.6) * 2;
      });
      break;
    }
    case 3: {
      const fireRig = frameAt(curve, 0.2, 0, 36);
      oilRig(root, fireRig.p.x - 48, fireRig.flightY - 38, fireRig.p.z - 55, 'FireRig', { fire: true });
      for (let i = 0; i < 5; i++) {
        const t = 0.1 + i * 0.16;
        const p = frameAt(curve, t, i % 2 ? 20 : -20, 6);
        add(root, new THREE.BoxGeometry(24, 28, 4), mat(0x475569, { transparent: true, opacity: 0.6 }), p.pos.x, p.pos.y + 10, p.pos.z, `StormWall${i}`);
      }
      const bucket = frameAt(curve, 0.35, 0, 0);
      add(root, new THREE.CylinderGeometry(2.8, 1.8, 3, 10), mat(0x38bdf8, { transparent: true, opacity: 0.65 }), bucket.p.x, bucket.p.y - 6, bucket.p.z, 'WaterBucket');
      break;
    }
    case 4: {
      const cross = frameAt(curve, 0.5, 0, 18);
      const figure8 = add(root, new THREE.TorusGeometry(14, 1, 8, 48), mat(0xffffff, { transparent: true, opacity: 0.35 }), cross.p.x, cross.flightY - 6, cross.p.z, 'OceanFigure8');
      figure8.rotation.x = Math.PI / 2;
      const summit = frameAt(curve, 0.6, 0, 36);
      oilRig(root, summit.p.x + 5, summit.flightY - 38, summit.p.z - 135, 'SummitRig', { snowCap: true });
      break;
    }
    case 5: {
      const start = curve.getPoint(0);
      add(root, new THREE.CylinderGeometry(6, 7, 58, 12), mat(0x64748b, { metalness: 0.45 }), start.x, start.y - 30, start.z + 10, 'HeliLaunchTower');
      add(root, new THREE.ConeGeometry(8, 14, 12), mat(0xf97316, { emissive: 0xf97316, emi: 0.65, transparent: true, opacity: 0.75 }), start.x, start.y - 34, start.z + 10, 'HeliLaunchFlame');
      [0.2, 0.4, 0.6, 0.8].forEach((t, i) => {
        const p = curve.getPoint(t);
        const wash = add(root, new THREE.TorusGeometry(3, 0.15, 6, 16), mat(0xe0f2fe, { transparent: true, opacity: 0.4 }), p.x, p.y - 2, p.z, `RotorWash${i}`);
        arenaMover(scene, (time) => { wash.rotation.z = time * 4 + i; });
      });
      break;
    }
    case 6: {
      [0.25, 0.5, 0.75].forEach((t, i) => {
        const block = frameAt(curve, t, (i - 1) * 22, 28);
        const h = 12 + (i % 2) * 5;
        add(root, new THREE.BoxGeometry(14, h, 12), mat(0x78716c), block.pos.x, block.pos.y + h / 2, block.pos.z, `GirderPlatform${i}`);
        add(root, new THREE.BoxGeometry(8, 0.5, 0.6), mat(0x94a3b8, { metalness: 0.4 }), block.pos.x, block.pos.y + h + 0.5, block.pos.z, `SteelGirder${i}`);
        registerFlyingMissionPad(scene, curve, t, 'STEEL', (i - 1) * 22, h + 2);
      });
      break;
    }
    case 7: {
      const tanker = frameAt(curve, 0.5, 0, 12);
      add(root, new THREE.BoxGeometry(10, 2.5, 24), mat(0x334155), tanker.pos.x, tanker.pos.y - 12, tanker.pos.z - 16, 'TankerHull');
      add(root, new THREE.BoxGeometry(6, 5, 5), mat(0xf8fafc), tanker.pos.x, tanker.pos.y - 8, tanker.pos.z - 4, 'TankerBridge');
      add(root, new THREE.CylinderGeometry(1.2, 1.2, 8, 8), mat(0xfbbf24, { emissive: 0xfbbf24, emi: 0.35 }), tanker.p.x + 8, tanker.flightY - 2, tanker.p.z, 'FuelBuoy');
      break;
    }
    case 8: {
      const pts = [];
      for (let i = 0; i <= 32; i++) pts.push(curve.getPoint(i / 32));
      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 64, 7, 14, false),
        mat(secondary, { emissive: secondary, emi: 0.3, transparent: true, opacity: 0.25 }),
      );
      tube.name = 'MedevacWindTunnel';
      root.add(tube);
      const hospital = frameAt(curve, 0.5, 0, 28);
      add(root, new THREE.BoxGeometry(12, 10, 10), mat(0xf8fafc), hospital.pos.x, hospital.pos.y + 2, hospital.pos.z, 'HospitalBlock');
      add(root, new THREE.BoxGeometry(4, 4, 0.3), mat(0xdc2626, { emissive: 0xdc2626, emi: 0.45 }), hospital.pos.x, hospital.pos.y + 6, hospital.pos.z + 5.2, 'HospitalCross');
      registerFlyingMissionPad(scene, curve, 0.5, 'RESCUE', 0, 0);
      break;
    }
    case 9: {
      const eye = frameAt(curve, 0.65, 0, 0);
      add(root, new THREE.TorusGeometry(22, 1.5, 8, 48), mat(0x64748b, { transparent: true, opacity: 0.5 }), eye.p.x, eye.flightY, eye.p.z, 'StormEyeOcean');
      const vehicle = frameAt(curve, 0.65, 0, 34);
      add(root, new THREE.BoxGeometry(2.5, 1.4, 4), mat(0xfbbf24), vehicle.pos.x, vehicle.pos.y - 32, vehicle.pos.z - 9, 'StrandedRover');
      add(root, new THREE.BoxGeometry(0.12, 18, 0.12), mat(0xcbd5e1), vehicle.p.x, vehicle.p.y - 14, vehicle.p.z, 'WinchCable');
      break;
    }
    case 10: {
      oilRig(root, spawn.x - 48, spawn.y - 38, spawn.z - 55, 'CapRig1');
      oilRig(root, spawn.x + 42, spawn.y - 38, spawn.z - 95, 'CapRig2');
      add(root, new THREE.CylinderGeometry(5, 5, 0.25, 12), mat(0x22c55e, { emissive: 0x22c55e, emi: 0.4 }), spawn.x + 5, spawn.y - 36, spawn.z - 135, 'MedevacPad');
      for (let i = 0; i < 4; i++) {
        const t = 0.55 + i * 0.06;
        const p = frameAt(curve, t, i % 2 ? 16 : -16, 4);
        add(root, new THREE.BoxGeometry(20, 18, 3), mat(0x334155, { transparent: true, opacity: 0.55 }), p.pos.x, p.pos.y + 6, p.pos.z, `CapstoneStorm${i}`);
      }
      const finish = frameAt(curve, 0.92, 0, 0);
      const warp = add(root, new THREE.TorusGeometry(12, 1, 10, 40), mat(0xa855f7, { emissive: 0xa855f7, emi: 0.65 }), finish.p.x, finish.p.y, finish.p.z, 'SkyCraneWarpFinish');
      warp.rotation.y = finish.yaw;
      add(root, new THREE.BoxGeometry(2.4, 2.4, 2.4), mat(0xf97316), finish.p.x, finish.p.y - 4, finish.p.z, 'CapstoneCargo');
      break;
    }
    default:
      break;
  }

  scene.userData.helicopterModeArena = mode;
  return root;
}

export function applyHelicopterModeSpline(curve, mode) {
  if (!curve?.points) return curve;
  const count = curve.points.length;
  const amps = {
    1: { x: 0.8, y: 0.35, z: 0.4 },
    2: { x: 0.55, y: 0.25, z: 0.35 },
    3: { x: 1.4, y: 2.0, z: 0.75 },
    4: { x: 2.2, y: 0.85, z: 1.6 },
    5: { x: 1.6, y: 3.2, z: 1.0 },
    6: { x: 1.2, y: 1.0, z: 0.65 },
    7: { x: 2.6, y: 0.45, z: 1.3 },
    8: { x: 0.35, y: 0.12, z: 0.18 },
    9: { x: 1.85, y: 0.55, z: 1.45 },
    10: { x: 2.0, y: 1.6, z: 0.95 },
  };
  const amp = amps[mode] || amps[1];
  const phase = mode * 1.08;
  curve.points.forEach((point, i) => {
    if (i === 0 || i === count - 1) return;
    const t = i / (count - 1);
    const envelope = Math.sin(Math.PI * t);
    point.x += Math.sin(t * Math.PI * (2 + mode * 0.18) + phase) * amp.x * envelope;
    point.y += Math.sin(t * Math.PI * 3 + phase * 0.5) * amp.y * envelope;
    point.z += Math.cos(t * Math.PI * (1 + mode * 0.14) + phase) * amp.z * envelope;
  });
  return curve;
}
