/**
 * FlyingHoverBotModeKit — 10 visually distinct Hover Bot arenas in floating labs.
 */
import * as THREE from 'three';
import {
  flyingMat, flyingGeo, flyingAdd, buildRealisticLabPad,
} from './FlyingArenaMaterialKit.js';
import { arenaMover } from '../ArenaBuilderCore.js';
import { registerFlyingMissionPad } from './FlyingDroneModeKit.js';

const PAD_DROP = 34;

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

function labPad(g, x, y, z, name, rotY = 0) {
  return buildRealisticLabPad(g, x, y, z, name, rotY);
}

function plasmaBridge(g, ax, ay, az, bx, by, bz, name) {
  const mid = new THREE.Vector3((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2);
  const len = new THREE.Vector3(ax - bx, ay - by, az - bz).length();
  const bridge = add(g, new THREE.BoxGeometry(2.2, 0.35, len), mat(0x22d3ee, { emissive: 0x22d3ee, emi: 0.45 }), mid.x, mid.y + 0.6, mid.z, name);
  bridge.lookAt(bx, by, bz);
  bridge.rotateX(Math.PI / 2);
  return bridge;
}

function repulsorArch(g, x, y, z, yaw, name, scale = 1) {
  const ring = add(g, new THREE.TorusGeometry(3.2 * scale, 0.35 * scale, 10, 32), mat(0xa78bfa, { emissive: 0xa78bfa, emi: 0.55 }), x, y, z, name);
  ring.rotation.y = yaw;
  return ring;
}

function particles(g, center, color, count = 20) {
  const positions = [];
  for (let i = 0; i < count; i++) {
    positions.push((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 10);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color, size: 0.35, transparent: true, opacity: 0.7, depthWrite: false }));
  pts.position.copy(center);
  g.add(pts);
}

export function applyHoverBotModeRecipeFlags(recipe, mode) {
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

export function installHoverBotModeArena(scene, curve, contract, root) {
  const mode = contract.mode;
  const primary = contract.bible?.gateColors?.primary ?? 0xa78bfa;
  const secondary = contract.bible?.gateColors?.secondary ?? 0x22d3ee;

  const base = frameAt(curve, 0.5, 0, PAD_DROP + 8);
  const padA = { x: base.p.x - 28, y: base.flightY - PAD_DROP, z: base.p.z - 18 };
  const padB = { x: base.p.x, y: base.flightY - PAD_DROP, z: base.p.z - 38 };
  const padC = { x: base.p.x + 28, y: base.flightY - PAD_DROP, z: base.p.z - 58 };
  labPad(root, padA.x, padA.y, padA.z, 'VistaLabA');
  labPad(root, padB.x, padB.y, padB.z, 'VistaLabB');
  labPad(root, padC.x, padC.y, padC.z, 'VistaLabC');
  plasmaBridge(root, padA.x, padA.y, padA.z, padB.x, padB.y, padB.z, 'VistaBridgeAB');
  plasmaBridge(root, padB.x, padB.y, padB.z, padC.x, padC.y, padC.z, 'VistaBridgeBC');

  switch (mode) {
    case 1: {
      const start = frameAt(curve, 0.06, 0, 0);
      const arch = repulsorArch(root, start.p.x, start.p.y - 2, start.p.z, start.yaw, 'TutorialRepulsor', 1.4);
      arenaMover(scene, (time) => { arch.material.emissiveIntensity = 0.35 + Math.sin(time * 3) * 0.25; });
      [0.28, 0.52, 0.76].forEach((t, i) => {
        const p = frameAt(curve, t, (i - 1) * 20, PAD_DROP);
        labPad(root, p.pos.x, p.pos.y, p.pos.z, `GlidePad${i}`, p.yaw);
      });
      break;
    }
    case 2: {
      for (let i = 0; i < 4; i++) {
        const t = 0.15 + i * 0.2;
        const p = frameAt(curve, t, 0, 0);
        add(root, new THREE.BoxGeometry(52, 14, 3), mat(0x22c55e, { transparent: true, opacity: 0.12 }), p.p.x - 22, p.flightY, p.p.z, `AltWallL${i}`);
        add(root, new THREE.BoxGeometry(52, 14, 3), mat(0x22c55e, { transparent: true, opacity: 0.12 }), p.p.x + 22, p.flightY, p.p.z, `AltWallR${i}`);
        const debris = add(root, new THREE.BoxGeometry(3, 3, 3), mat(0x64748b), p.p.x + (i % 2 ? 8 : -8), p.flightY - 2, p.p.z, `DebrisBlock${i}`);
        arenaMover(scene, (time) => { debris.position.x += Math.sin(time + i) * 0.02; });
      }
      [0.25, 0.55].forEach((t, i) => {
        const gate = frameAt(curve, t, 0, 0);
        const hex = add(root, new THREE.TorusGeometry(5, 0.3, 6, 6), mat(primary, { emissive: primary, emi: 0.4 }), gate.p.x, gate.p.y, gate.p.z, `HexRepulsor${i}`);
        hex.rotation.x = Math.PI / 2;
      });
      const bridgePt = frameAt(curve, 0.4, 0, PAD_DROP);
      plasmaBridge(root, bridgePt.pos.x - 14, bridgePt.pos.y, bridgePt.pos.z, bridgePt.pos.x + 14, bridgePt.pos.y, bridgePt.pos.z, 'AltitudePlasmaBridge');
      break;
    }
    case 3: {
      for (let i = 0; i < 5; i++) {
        const t = 0.1 + i * 0.16;
        const p = frameAt(curve, t, i % 2 ? 20 : -20, 6);
        add(root, new THREE.BoxGeometry(24, 28, 4), mat(0x7c3aed, { transparent: true, opacity: 0.55 }), p.pos.x, p.pos.y + 10, p.pos.z, `PurpleStormWall${i}`);
      }
      for (let i = 0; i < 24; i++) {
        const t = 0.2 + (i / 23) * 0.35;
        const p = curve.getPoint(t);
        add(root, new THREE.BoxGeometry(3, 0.25, 3), mat(secondary, { emissive: secondary, emi: 0.55 }), p.x, p.y - 3, p.z, `MagRailSeg${i}`);
      }
      break;
    }
    case 4: {
      const cross = frameAt(curve, 0.5, 0, 12);
      add(root, new THREE.BoxGeometry(80, 22, 80), mat(0xc4b5fd, { transparent: true, opacity: 0.08 }), cross.p.x, cross.flightY - 8, cross.p.z, 'ZeroGChamber');
      [0.25, 0.5, 0.75].forEach((t, i) => {
        const p = frameAt(curve, t, (i - 1) * 24, PAD_DROP);
        const pad = labPad(root, p.pos.x, p.pos.y, p.pos.z, `ZeroGPad${i}`, p.yaw);
        arenaMover(scene, (time) => { pad.rotation.y = p.yaw + time * 0.15; });
      });
      const ring = add(root, new THREE.TorusGeometry(14, 0.8, 8, 48), mat(0xffffff, { transparent: true, opacity: 0.3 }), cross.p.x, cross.flightY - 6, cross.p.z, 'ZeroGFigure8');
      ring.rotation.x = Math.PI / 2;
      break;
    }
    case 5: {
      const start = curve.getPoint(0);
      add(root, new THREE.CylinderGeometry(5, 6, 52, 12), mat(0x64748b, { metalness: 0.4 }), start.x, start.y - 28, start.z + 8, 'HoverLaunchTower');
      const gate = repulsorArch(root, start.x, start.y - 4, start.z, 0, 'HeightRepulsor', 1.2);
      for (let i = 0; i < 5; i++) {
        add(root, new THREE.BoxGeometry(0.3, 2, 0.3), mat(secondary, { emissive: secondary, emi: 0.4 }), start.x + 4.5, start.y - 8 + i * 4, start.z, `HeightTick${i}`);
      }
      arenaMover(scene, (time) => { gate.rotation.z = Math.sin(time) * 0.08; });
      for (let i = 0; i < 5; i++) {
        const t = i / 5;
        const p = curve.getPoint(t * 0.82);
        add(root, new THREE.TorusGeometry(3.5 + i * 0.3, 0.22, 6, 20), mat(primary, { emissive: primary, emi: 0.35 }), p.x, p.y, p.z, `SpiralLabRing${i}`);
      }
      break;
    }
    case 6: {
      [0.25, 0.5, 0.75].forEach((t, i) => {
        const block = frameAt(curve, t, (i - 1) * 22, PAD_DROP);
        labPad(root, block.pos.x, block.pos.y, block.pos.z, `BankPad${i}`, block.yaw);
        if (i > 0) {
          const prev = frameAt(curve, 0.25 + (i - 1) * 0.25, (i - 1 - 1) * 22, PAD_DROP);
          plasmaBridge(root, prev.pos.x, prev.pos.y, prev.pos.z, block.pos.x, block.pos.y, block.pos.z, `BankBridge${i}`);
        }
        registerFlyingMissionPad(scene, curve, t, 'LAND', (i - 1) * 22, -PAD_DROP + 2);
      });
      break;
    }
    case 7: {
      ['A', 'B', 'C'].forEach((letter, i) => {
        const t = 0.22 + i * 0.24;
        const col = frameAt(curve, t, 16, 0);
        add(root, new THREE.CylinderGeometry(2, 2.6, 12, 10), mat(primary, { transparent: true, opacity: 0.5, emissive: primary, emi: 0.3 }), col.p.x, col.flightY - 3, col.p.z, `ArcColumn${letter}`);
      });
      const shield = frameAt(curve, 0.45, 0, 0);
      const dome = add(root, new THREE.SphereGeometry(9, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat(secondary, { transparent: true, opacity: 0.22, emissive: secondary, emi: 0.35 }), shield.p.x, shield.p.y - 4, shield.p.z, 'EnergyShieldDome');
      arenaMover(scene, (time) => { dome.scale.setScalar(1 + Math.sin(time * 2) * 0.04); });
      break;
    }
    case 8: {
      const pts = [];
      for (let i = 0; i <= 32; i++) pts.push(curve.getPoint(i / 32));
      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 64, 7, 14, false),
        mat(0xa855f7, { emissive: 0xa855f7, emi: 0.35, transparent: true, opacity: 0.28 }),
      );
      tube.name = 'PlasmaBoostTunnel';
      root.add(tube);
      const mid = frameAt(curve, 0.5, 0, PAD_DROP);
      add(root, new THREE.CylinderGeometry(4, 4, 0.4, 12), mat(secondary, { emissive: secondary, emi: 0.65 }), mid.pos.x, mid.pos.y + 1, mid.pos.z, 'PlasmaBoostPad');
      registerFlyingMissionPad(scene, curve, 0.5, 'BOOST', 0, -PAD_DROP + 2);
      break;
    }
    case 9: {
      const left = frameAt(curve, 0.35, -32, PAD_DROP);
      const right = frameAt(curve, 0.65, 32, PAD_DROP);
      labPad(root, left.pos.x, left.pos.y, left.pos.z, 'ChasmPadL');
      labPad(root, right.pos.x, right.pos.y, right.pos.z, 'ChasmPadR');
      const chasm = frameAt(curve, 0.5, 0, PAD_DROP + 2);
      const voidPlane = add(root, new THREE.PlaneGeometry(70, 70), mat(0x020617), chasm.p.x, chasm.p.y - 1, chasm.p.z, 'ChasmVoid');
      voidPlane.rotation.x = -Math.PI / 2;
      const eye = frameAt(curve, 0.65, 0, 0);
      add(root, new THREE.TorusGeometry(20, 1.2, 8, 48), mat(0x64748b, { transparent: true, opacity: 0.45 }), eye.p.x, eye.flightY, eye.p.z, 'ChasmStormEye');
      break;
    }
    case 10: {
      const start = frameAt(curve, 0.06, 0, 0);
      repulsorArch(root, start.p.x, start.p.y - 2, start.p.z, start.yaw, 'CapstoneRepulsor', 1.5);
      for (let i = 0; i < 4; i++) {
        const t = 0.55 + i * 0.06;
        const p = frameAt(curve, t, i % 2 ? 14 : -14, 4);
        add(root, new THREE.BoxGeometry(18, 16, 3), mat(0x7c3aed, { transparent: true, opacity: 0.5 }), p.pos.x, p.pos.y + 5, p.pos.z, `CapstoneStorm${i}`);
      }
      const tunnelMid = frameAt(curve, 0.72, 0, 0);
      add(root, new THREE.TorusGeometry(8, 0.5, 8, 32), mat(secondary, { emissive: secondary, emi: 0.5 }), tunnelMid.p.x, tunnelMid.p.y, tunnelMid.p.z, 'CapstonePlasmaRing');
      const finish = frameAt(curve, 0.92, 0, 0);
      const warp = add(root, new THREE.TorusGeometry(11, 0.9, 10, 40), mat(primary, { emissive: primary, emi: 0.65 }), finish.p.x, finish.p.y, finish.p.z, 'CapstoneWarpArch');
      warp.rotation.y = finish.yaw;
      arenaMover(scene, (time) => { warp.rotation.z = time * 0.22; });
      particles(root, finish.p, secondary, 24);
      break;
    }
    default:
      break;
  }

  scene.userData.hoverbotModeArena = mode;
  return root;
}

export function applyHoverBotModeSpline(curve, mode) {
  if (!curve?.points) return curve;
  const count = curve.points.length;
  const amps = {
    1: { x: 0.9, y: 0.3, z: 0.45 },
    2: { x: 0.5, y: 0.22, z: 0.32 },
    3: { x: 1.35, y: 1.95, z: 0.72 },
    4: { x: 2.15, y: 0.82, z: 1.55 },
    5: { x: 1.55, y: 3.1, z: 0.95 },
    6: { x: 1.25, y: 1.05, z: 0.68 },
    7: { x: 2.65, y: 0.48, z: 1.35 },
    8: { x: 0.38, y: 0.14, z: 0.2 },
    9: { x: 1.75, y: 0.58, z: 1.4 },
    10: { x: 1.95, y: 1.55, z: 0.92 },
  };
  const amp = amps[mode] || amps[1];
  const phase = mode * 1.12;
  curve.points.forEach((point, i) => {
    if (i === 0 || i === count - 1) return;
    const t = i / (count - 1);
    const envelope = Math.sin(Math.PI * t);
    point.x += Math.sin(t * Math.PI * (2 + mode * 0.19) + phase) * amp.x * envelope;
    point.y += Math.sin(t * Math.PI * 3 + phase * 0.5) * amp.y * envelope;
    point.z += Math.cos(t * Math.PI * (1 + mode * 0.14) + phase) * amp.z * envelope;
  });
  return curve;
}
