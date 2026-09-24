/**
 * FlyingDroneModeKit — 10 visually distinct Training Drone arenas.
 * Each mode gets a large hero landmark kids can name at a glance.
 */
import * as THREE from 'three';
import { flyingMat, flyingGeo, flyingAdd, buildTutorialSkyArch, buildPremiumPlatformWithCoins } from './FlyingArenaMaterialKit.js';
import { arenaMover } from '../ArenaBuilderCore.js';

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

export function registerFlyingMissionPad(scene, curve, t, label, side = 0, yOffset = 0) {
  const p = curve.getPoint(t);
  const tan = curve.getTangent(t).normalize();
  const right = new THREE.Vector3(tan.z, 0, -tan.x);
  const pos = p.clone().addScaledVector(right, side).add(new THREE.Vector3(0, yOffset, 0));
  if (!scene.userData.flyingMissionPads) scene.userData.flyingMissionPads = [];
  scene.userData.flyingMissionPads.push({
    x: pos.x,
    y: pos.y,
    z: pos.z,
    label,
    type: 'pad',
  });
  return pos;
}

/** Per-mode recipe flags so installFlyingModeScenery matches the authored arena. */
export function applyDroneModeRecipeFlags(recipe, mode) {
  const flags = {
    1: { parallaxClouds: true },
    2: { tunnel: false },
    3: { stormClouds: true, rain: true, stormWall: true, goldenHour: false, parallaxClouds: false },
    4: { cloudPillars: 8 },
    5: { launchTower: true, starfieldAbove: 50, goldenHour: false, parallaxClouds: false },
    6: { hoverPads: 3 },
    7: { parallaxClouds: true },
    8: { tunnel: true, windZones: 3 },
    9: { stormWall: true, rain: true, stormClouds: true, goldenHour: false, parallaxClouds: false },
    10: { sections: true, stormClouds: true, rain: true, goldenHour: false, parallaxClouds: false },
  };
  return { ...recipe, ...(flags[mode] || {}) };
}

export function installDroneModeArena(scene, curve, contract, root) {
  const mode = contract.mode;
  const primary = contract.bible?.gateColors?.primary ?? 0x38bdf8;
  const secondary = contract.bible?.gateColors?.secondary ?? 0xfacc15;

  switch (mode) {
    case 1: {
      buildTutorialSkyArch(root, curve, 0.06, -24, 6, primary, 'DroneTutorialArch');
      [0.32, 0.58].forEach((t, i) => {
        const pad = frameAt(curve, t, (i % 2 ? 1 : -1) * 22, 5);
        buildPremiumPlatformWithCoins(root, pad.pos.x, pad.pos.y, pad.pos.z, `TutorialPad${i}`, 13);
      });
      break;
    }
    case 2: {
      for (let i = 0; i < 4; i++) {
        const t = 0.15 + i * 0.2;
        const p = frameAt(curve, t, 0, 0);
        add(root, new THREE.BoxGeometry(52, 14, 3), mat(0x22c55e, { transparent: true, opacity: 0.12 }), p.p.x - 22, p.flightY, p.p.z, `AltWallL${i}`);
        add(root, new THREE.BoxGeometry(52, 14, 3), mat(0x22c55e, { transparent: true, opacity: 0.12 }), p.p.x + 22, p.flightY, p.p.z, `AltWallR${i}`);
        add(root, new THREE.BoxGeometry(20, 0.4, 20), mat(0x22c55e, { emissive: 0x22c55e, emi: 0.25 }), p.p.x, p.flightY - 1, p.p.z, `AltPlatform${i}`);
      }
      break;
    }
    case 3: {
      for (let i = 0; i < 5; i++) {
        const t = 0.1 + i * 0.16;
        const p = frameAt(curve, t, i % 2 ? 20 : -20, 6);
        add(root, new THREE.BoxGeometry(24, 28, 4), mat(0x475569, { transparent: true, opacity: 0.6 }), p.pos.x, p.pos.y + 10, p.pos.z, `StormWall${i}`);
      }
      const pit = frameAt(curve, 0.72, 0, 36);
      add(root, new THREE.CylinderGeometry(18, 22, 1.2, 24), mat(0x64748b), pit.p.x, pit.flightY - 36, pit.p.z, 'TargetPit');
      for (let i = 0; i < 5; i++) {
        const ang = (i / 5) * Math.PI * 2;
        add(root, new THREE.CylinderGeometry(2.5, 2.5, 0.3, 12), mat(0xef4444, { emissive: 0xef4444, emi: 0.5 }), pit.p.x + Math.cos(ang) * 8, pit.flightY - 35, pit.p.z + Math.sin(ang) * 8, `FloorTarget${i}`);
      }
      break;
    }
    case 4: {
      const cross = frameAt(curve, 0.5, 0, 18);
      const bridge = add(root, new THREE.TorusGeometry(16, 1.2, 8, 48), mat(0xffffff, { transparent: true, opacity: 0.45, emissive: 0xffffff, emi: 0.15 }), cross.p.x, cross.flightY - 8, cross.p.z, 'Figure8CloudBridge');
      bridge.rotation.x = Math.PI / 2;
      [0.3, 0.5, 0.7].forEach((t, i) => {
        const orbit = frameAt(curve, t, (i - 1) * 14, 0);
        const buddy = add(root, new THREE.BoxGeometry(3.2, 0.4, 3.2), mat(primary, { emissive: primary, emi: 0.35 }), orbit.p.x, orbit.flightY, orbit.p.z, `BuddyDrone${i}`);
        arenaMover(scene, (time) => {
          buddy.position.y = orbit.flightY + Math.sin(time + i) * 1.5;
          buddy.rotation.y = time * 0.6 + i;
        });
      });
      break;
    }
    case 5: {
      const start = curve.getPoint(0);
      add(root, new THREE.CylinderGeometry(6, 7, 58, 12), mat(0x64748b, { metalness: 0.45 }), start.x, start.y - 30, start.z + 10, 'DroneLaunchTower');
      add(root, new THREE.ConeGeometry(8, 14, 12), mat(0xf97316, { emissive: 0xf97316, emi: 0.65, transparent: true, opacity: 0.75 }), start.x, start.y - 34, start.z + 10, 'DroneLaunchFlame');
      for (let i = 0; i < 6; i++) {
        const t = i / 6;
        const p = curve.getPoint(t * 0.85);
        const helix = add(root, new THREE.TorusGeometry(4 + i * 0.4, 0.25, 6, 20), mat(secondary, { emissive: secondary, emi: 0.4 }), p.x + Math.cos(i * 1.2) * 6, p.y, p.z + Math.sin(i * 1.2) * 6, `SpiralRing${i}`);
        helix.rotation.x = Math.PI / 2;
      }
      break;
    }
    case 6: {
      [0.25, 0.5, 0.75].forEach((t, i) => {
        const block = frameAt(curve, t, (i - 1) * 22, 28);
        const h = 14 + (i % 2) * 6;
        add(root, new THREE.BoxGeometry(12, h, 10), mat(0x78716c), block.pos.x, block.pos.y + h / 2, block.pos.z, `SkyBlock${i}`);
        add(root, new THREE.CylinderGeometry(3.5, 3.5, 0.35, 10), mat(0xfbbf24, { emissive: 0xfbbf24, emi: 0.35 }), block.pos.x, block.pos.y + h + 0.2, block.pos.z, `Helipad${i}`);
        if (i === 1) {
          add(root, new THREE.BoxGeometry(5, 0.2, 5), mat(0x22c55e, { emissive: 0x22c55e, emi: 0.45 }), block.pos.x, block.pos.y + h + 0.5, block.pos.z, 'DropZoneX');
          registerFlyingMissionPad(scene, curve, t, 'DROP', (i - 1) * 22, h + 2);
        }
      });
      break;
    }
    case 7: {
      ['A', 'B', 'C'].forEach((letter, i) => {
        const t = 0.22 + i * 0.24;
        const col = frameAt(curve, t, 18, 0);
        add(root, new THREE.CylinderGeometry(2.2, 2.8, 14, 10), mat(0x38bdf8, { transparent: true, opacity: 0.55, emissive: 0x38bdf8, emi: 0.35 }), col.p.x, col.flightY - 4, col.p.z, `PhotoMonolith${letter}`);
        add(root, new THREE.BoxGeometry(3, 2, 0.4), mat(0xffffff), col.p.x, col.flightY + 4, col.p.z + 1.6, `Camera${letter}`);
      });
      break;
    }
    case 8: {
      const pts = [];
      for (let i = 0; i <= 32; i++) pts.push(curve.getPoint(i / 32));
      const tunnelPath = new THREE.CatmullRomCurve3(pts);
      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(tunnelPath, 64, 7, 14, false),
        mat(0x14b8a6, { emissive: 0x14b8a6, emi: 0.35, transparent: true, opacity: 0.28 }),
      );
      tube.name = 'DroneWindMegatunnel';
      root.add(tube);
      [0.32, 0.68].forEach((t, i) => {
        const mast = frameAt(curve, t, i ? 24 : -24, 16);
        add(root, new THREE.CylinderGeometry(0.5, 0.5, 22, 8), mat(0xe2e8f0), mast.pos.x, mast.pos.y + 8, mast.pos.z, `TurbineMast${i}`);
        const blade = add(root, new THREE.BoxGeometry(14, 0.4, 1.2), mat(0xcbd5e1, { metalness: 0.4 }), mast.pos.x, mast.pos.y + 18, mast.pos.z, `TurbineBlade${i}`);
        arenaMover(scene, (time) => { blade.rotation.z = time * 2.2; });
      });
      break;
    }
    case 9: {
      const eye = frameAt(curve, 0.65, 0, 0);
      add(root, new THREE.TorusGeometry(22, 1.5, 8, 48), mat(0x64748b, { transparent: true, opacity: 0.5 }), eye.p.x, eye.flightY, eye.p.z, 'StormEyeWall');
      const stunt = frameAt(curve, 0.72, 0, 0);
      const starRing = add(root, new THREE.TorusGeometry(5.5, 0.5, 8, 32), mat(0xfacc15, { emissive: 0xfacc15, emi: 0.7 }), stunt.p.x, stunt.p.y, stunt.p.z, 'StuntRingPedestal');
      starRing.rotation.x = Math.PI / 4;
      starRing.rotation.z = Math.PI / 6;
      break;
    }
    case 10: {
      for (let i = 0; i < 4; i++) {
        const t = 0.55 + i * 0.06;
        const p = frameAt(curve, t, i % 2 ? 16 : -16, 4);
        add(root, new THREE.BoxGeometry(20, 18, 3), mat(0x334155, { transparent: true, opacity: 0.55 }), p.pos.x, p.pos.y + 6, p.pos.z, `CapstoneStorm${i}`);
      }
      const finish = frameAt(curve, 0.92, 0, 0);
      const warp = add(root, new THREE.TorusGeometry(12, 1, 10, 40), mat(0xa855f7, { emissive: 0xa855f7, emi: 0.65 }), finish.p.x, finish.p.y, finish.p.z, 'CapstoneWarpCathedral');
      warp.rotation.y = finish.yaw;
      arenaMover(scene, (time) => { warp.rotation.z = time * 0.25; });
      particles(root, finish.p, 0xfbbf24, 24);
      break;
    }
    default:
      break;
  }

  scene.userData.droneModeArena = mode;
  return root;
}

function particles(g, center, color, count) {
  const positions = [];
  for (let i = 0; i < count; i++) positions.push((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 10);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color, size: 0.35, transparent: true, opacity: 0.7, depthWrite: false }));
  pts.position.copy(center);
  pts.name = 'DroneModeParticles';
  g.add(pts);
}

/** Stronger per-mode path shaping so adjacent modes feel different in flight. */
export function applyDroneModeSpline(curve, mode) {
  if (!curve?.points) return curve;
  const count = curve.points.length;
  const amps = {
    1: { x: 1.2, y: 0.4, z: 0.5 },
    2: { x: 0.6, y: 0.2, z: 0.3 },
    3: { x: 1.5, y: 2.2, z: 0.8 },
    4: { x: 2.4, y: 0.9, z: 1.8 },
    5: { x: 1.8, y: 3.5, z: 1.2 },
    6: { x: 1.4, y: 1.1, z: 0.7 },
    7: { x: 2.8, y: 0.5, z: 1.4 },
    8: { x: 0.4, y: 0.15, z: 0.2 },
    9: { x: 2.0, y: 0.6, z: 1.6 },
    10: { x: 2.2, y: 1.8, z: 1.0 },
  };
  const amp = amps[mode] || amps[1];
  const phase = mode * 1.15;
  curve.points.forEach((point, i) => {
    if (i === 0 || i === count - 1) return;
    const t = i / (count - 1);
    const envelope = Math.sin(Math.PI * t);
    point.x += Math.sin(t * Math.PI * (2 + mode * 0.2) + phase) * amp.x * envelope;
    point.y += Math.sin(t * Math.PI * 3 + phase * 0.5) * amp.y * envelope;
    point.z += Math.cos(t * Math.PI * (1 + mode * 0.15) + phase) * amp.z * envelope;
  });
  return curve;
}
