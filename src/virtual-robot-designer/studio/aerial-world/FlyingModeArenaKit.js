/**
 * FlyingModeArenaKit — 10 visually distinct arenas per flyer (modes 1–10).
 * Drone delegates to FlyingDroneModeKit; all other chassis get recipe-keyed hero layouts.
 */
import * as THREE from 'three';
import { flyingMat, flyingAdd, buildPremiumPlatformWithCoins, buildTutorialSkyArch, flyingGeo } from './FlyingArenaMaterialKit.js';
import { arenaMover } from '../ArenaBuilderCore.js';
import { installDroneModeArena, applyDroneModeRecipeFlags, applyDroneModeSpline } from './FlyingDroneModeKit.js';
import { installHelicopterModeArena, applyHelicopterModeRecipeFlags, applyHelicopterModeSpline } from './FlyingHelicopterModeKit.js';
import { installHoverBotModeArena, applyHoverBotModeRecipeFlags, applyHoverBotModeSpline } from './FlyingHoverBotModeKit.js';

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

function particles(g, center, color, count = 20) {
  const positions = [];
  for (let i = 0; i < count; i++) {
    positions.push((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 12);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color, size: 0.35, transparent: true, opacity: 0.7, depthWrite: false }));
  pts.position.copy(center);
  pts.name = 'ModeArenaParticles';
  g.add(pts);
}

/** Recipe-driven flags for installFlyingModeScenery + installAerialDifficulty on ALL flyers. */
const RECIPE_SCENE_FLAGS = {
  drone_canyon: { parallaxClouds: true },
  canyon_flight: { cloudPillars: 0 },
  storm_cloud: { stormClouds: true, rain: true, stormWall: true, goldenHour: false, parallaxClouds: false },
  cloud_race: { cloudPillars: 10 },
  space_orbit: { launchTower: true, starfieldAbove: 55, goldenHour: false, parallaxClouds: false },
  flight_rings: { hoverPads: 3 },
  jet_stunt: {},
  rooftop_delivery: { tunnel: true, windZones: 3 },
  typhoon: { stormClouds: true, rain: true, stormWall: true, goldenHour: false, parallaxClouds: false },
  warp_gate: { sections: true, stormClouds: true, rain: true, goldenHour: false, parallaxClouds: false },
  rainbow_road: { raceRibbon: true, goldenHour: false, parallaxClouds: false },
  sunny_circuit: { cloudPillars: 8 },
  dragon_skyway: { tunnel: true, stormClouds: true, goldenHour: false },
  volcano_drift: { stormWall: true, rain: true, goldenHour: false },
  street_grand_prix: { hoverPads: 2, windZones: 2 },
};

export function applyModeRecipeFlags(recipe, contract) {
  if (!recipe || !contract) return recipe;
  if (contract.chassisId === 'drone') return applyDroneModeRecipeFlags(recipe, contract.mode);
  if (contract.chassisId === 'helicopter') return applyHelicopterModeRecipeFlags(recipe, contract.mode);
  if (contract.chassisId === 'hoverbot') return applyHoverBotModeRecipeFlags(recipe, contract.mode);
  const recipeId = contract.mission?.recipeId || recipe.id;
  const flags = RECIPE_SCENE_FLAGS[recipeId] || {};
  return { ...recipe, ...flags };
}

const SPLINE_AMPS = {
  drone_canyon: { x: 1.2, y: 0.4, z: 0.5 },
  canyon_flight: { x: 0.6, y: 0.2, z: 0.3 },
  storm_cloud: { x: 1.5, y: 2.2, z: 0.8 },
  cloud_race: { x: 2.4, y: 0.9, z: 1.8 },
  space_orbit: { x: 1.8, y: 3.5, z: 1.2 },
  flight_rings: { x: 1.4, y: 1.1, z: 0.7 },
  jet_stunt: { x: 2.8, y: 0.5, z: 1.4 },
  rooftop_delivery: { x: 0.4, y: 0.15, z: 0.2 },
  typhoon: { x: 2.0, y: 0.6, z: 1.6 },
  warp_gate: { x: 2.2, y: 1.8, z: 1.0 },
  rainbow_road: { x: 1.6, y: 0.35, z: 1.1 },
  sunny_circuit: { x: 2.1, y: 0.8, z: 1.5 },
  dragon_skyway: { x: 2.5, y: 1.2, z: 2.0 },
  volcano_drift: { x: 1.9, y: 0.7, z: 1.3 },
  street_grand_prix: { x: 1.3, y: 0.9, z: 0.6 },
};

export function applyModeSplineVariation(curve, contract) {
  if (!curve?.points || !contract) return curve;
  if (contract.chassisId === 'drone') return applyDroneModeSpline(curve, contract.mode);
  if (contract.chassisId === 'helicopter') return applyHelicopterModeSpline(curve, contract.mode);
  if (contract.chassisId === 'hoverbot') return applyHoverBotModeSpline(curve, contract.mode);
  const recipeId = contract.mission?.recipeId || 'drone_canyon';
  const amp = SPLINE_AMPS[recipeId] || SPLINE_AMPS.drone_canyon;
  const mode = contract.mode;
  const phase = mode * 1.15;
  const count = curve.points.length;
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

function buildRecipeArena(scene, curve, contract, root, recipeId) {
  const primary = contract.bible?.gateColors?.primary ?? 0x38bdf8;
  const secondary = contract.bible?.gateColors?.secondary ?? 0xfacc15;
  const vista = contract.bible?.aerialVista;

  switch (recipeId) {
    case 'drone_canyon': {
      buildTutorialSkyArch(root, curve, 0.06, -24, 6, primary, 'ModeTutorialArch');
      [0.35, 0.62].forEach((t, i) => {
        const pad = frameAt(curve, t, (i % 2 ? 1 : -1) * 22, 5);
        buildPremiumPlatformWithCoins(root, pad.pos.x, pad.pos.y, pad.pos.z, `SlalomPad${i}`, 13);
      });
      break;
    }
    case 'canyon_flight': {
      for (let i = 0; i < 4; i++) {
        const t = 0.15 + i * 0.2;
        const p = frameAt(curve, t, 0, 0);
        add(root, flyingGeo.box(52, 14, 3), mat(0x22c55e, { transparent: true, opacity: 0.18 }), p.p.x - 22, p.flightY, p.p.z, `AltWallL${i}`);
        add(root, flyingGeo.box(52, 14, 3), mat(0x22c55e, { transparent: true, opacity: 0.18 }), p.p.x + 22, p.flightY, p.p.z, `AltWallR${i}`);
        add(root, flyingGeo.box(22, 0.55, 22), mat(0x22c55e, { emissive: 0x22c55e, emi: 0.35 }), p.p.x, p.flightY - 1, p.p.z, `AltPlatform${i}`);
        add(root, flyingGeo.box(48, 0.35, 2.5), mat(0x22c55e, { emissive: 0x22c55e, emi: 0.45, transparent: true, opacity: 0.35 }), p.p.x, p.flightY + 0.5, p.p.z, `AltBand${i}`);
      }
      break;
    }
    case 'storm_cloud': {
      for (let i = 0; i < 5; i++) {
        const t = 0.1 + i * 0.16;
        const p = frameAt(curve, t, i % 2 ? 20 : -20, 6);
        add(root, new THREE.BoxGeometry(24, 28, 4), mat(0x475569, { transparent: true, opacity: 0.6 }), p.pos.x, p.pos.y + 10, p.pos.z, `StormWall${i}`);
      }
      const pit = frameAt(curve, 0.72, 0, 36);
      add(root, new THREE.CylinderGeometry(18, 22, 1.2, 24), mat(0x64748b), pit.p.x, pit.flightY - 36, pit.p.z, 'DiveTargetPit');
      for (let i = 0; i < 5; i++) {
        const ang = (i / 5) * Math.PI * 2;
        add(root, new THREE.CylinderGeometry(2.5, 2.5, 0.3, 12), mat(0xef4444, { emissive: 0xef4444, emi: 0.5 }), pit.p.x + Math.cos(ang) * 8, pit.flightY - 35, pit.p.z + Math.sin(ang) * 8, `FloorTarget${i}`);
      }
      break;
    }
    case 'cloud_race': {
      const cross = frameAt(curve, 0.5, 0, 18);
      const bridge = add(root, new THREE.TorusGeometry(16, 1.2, 8, 48), mat(0xffffff, { transparent: true, opacity: 0.45, emissive: 0xffffff, emi: 0.15 }), cross.p.x, cross.flightY - 8, cross.p.z, 'Figure8Bridge');
      bridge.rotation.x = Math.PI / 2;
      [0.3, 0.5, 0.7].forEach((t, i) => {
        const orbit = frameAt(curve, t, (i - 1) * 14, 0);
        const buddy = add(root, new THREE.BoxGeometry(3.2, 0.4, 3.2), mat(primary, { emissive: primary, emi: 0.35 }), orbit.p.x, orbit.flightY, orbit.p.z, `OrbitBuddy${i}`);
        arenaMover(scene, (time) => {
          buddy.position.y = orbit.flightY + Math.sin(time + i) * 1.5;
          buddy.rotation.y = time * 0.6 + i;
        });
      });
      break;
    }
    case 'space_orbit': {
      const start = curve.getPoint(0);
      add(root, new THREE.CylinderGeometry(6, 7, 58, 12), mat(0x64748b, { metalness: 0.45 }), start.x, start.y - 30, start.z + 10, 'LaunchTower');
      add(root, new THREE.ConeGeometry(8, 14, 12), mat(0xf97316, { emissive: 0xf97316, emi: 0.65, transparent: true, opacity: 0.75 }), start.x, start.y - 34, start.z + 10, 'LaunchFlame');
      for (let i = 0; i < 6; i++) {
        const t = i / 6;
        const p = curve.getPoint(t * 0.85);
        const helix = add(root, new THREE.TorusGeometry(4 + i * 0.4, 0.25, 6, 20), mat(secondary, { emissive: secondary, emi: 0.4 }), p.x + Math.cos(i * 1.2) * 6, p.y, p.z + Math.sin(i * 1.2) * 6, `SpiralRing${i}`);
        helix.rotation.x = Math.PI / 2;
      }
      for (let i = 0; i < 30; i++) {
        add(root, new THREE.SphereGeometry(0.2, 4, 4), mat(0xf8fafc, { emissive: 0xffffff, emi: 0.35 }), start.x + (Math.random() - 0.5) * 100, start.y + 20 + Math.random() * 50, start.z - 40 - Math.random() * 60, `OrbitStar${i}`);
      }
      break;
    }
    case 'flight_rings': {
      [0.25, 0.5, 0.75].forEach((t, i) => {
        const block = frameAt(curve, t, (i - 1) * 22, 28);
        const h = 14 + (i % 2) * 6;
        add(root, new THREE.BoxGeometry(12, h, 10), mat(0x78716c), block.pos.x, block.pos.y + h / 2, block.pos.z, `RooftopBlock${i}`);
        add(root, new THREE.CylinderGeometry(3.5, 3.5, 0.35, 10), mat(0xfbbf24, { emissive: 0xfbbf24, emi: 0.35 }), block.pos.x, block.pos.y + h + 0.2, block.pos.z, `Helipad${i}`);
      });
      break;
    }
    case 'jet_stunt': {
      ['A', 'B', 'C'].forEach((letter, i) => {
        const t = 0.22 + i * 0.24;
        const col = frameAt(curve, t, 18, 0);
        add(root, new THREE.CylinderGeometry(2.2, 2.8, 14, 10), mat(primary, { transparent: true, opacity: 0.55, emissive: primary, emi: 0.35 }), col.p.x, col.flightY - 4, col.p.z, `StuntMonolith${letter}`);
        add(root, new THREE.BoxGeometry(3, 2, 0.4), mat(0xffffff), col.p.x, col.flightY + 4, col.p.z + 1.6, `Camera${letter}`);
      });
      const stunt = frameAt(curve, 0.55, 0, 0);
      const ring = add(root, new THREE.TorusGeometry(7, 0.5, 8, 32), mat(secondary, { emissive: secondary, emi: 0.6 }), stunt.p.x, stunt.p.y, stunt.p.z, 'StuntTiltRing');
      ring.rotation.x = Math.PI / 5;
      break;
    }
    case 'rooftop_delivery': {
      const pts = [];
      for (let i = 0; i <= 32; i++) pts.push(curve.getPoint(i / 32));
      const tunnelPath = new THREE.CatmullRomCurve3(pts);
      const tunnelColor = vista === 'neon_ribbon' ? 0xec4899 : vista === 'plasma_track' ? 0xa855f7 : 0x14b8a6;
      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(tunnelPath, 64, 7, 14, false),
        mat(tunnelColor, { emissive: tunnelColor, emi: 0.35, transparent: true, opacity: 0.28 }),
      );
      tube.name = 'ModeWindTunnel';
      root.add(tube);
      [0.32, 0.68].forEach((t, i) => {
        const mast = frameAt(curve, t, i ? 24 : -24, 16);
        add(root, new THREE.CylinderGeometry(0.5, 0.5, 22, 8), mat(0xe2e8f0), mast.pos.x, mast.pos.y + 8, mast.pos.z, `TurbineMast${i}`);
        const blade = add(root, new THREE.BoxGeometry(14, 0.4, 1.2), mat(0xcbd5e1, { metalness: 0.4 }), mast.pos.x, mast.pos.y + 18, mast.pos.z, `TurbineBlade${i}`);
        arenaMover(scene, (time) => { blade.rotation.z = time * 2.2; });
      });
      break;
    }
    case 'typhoon': {
      const eye = frameAt(curve, 0.65, 0, 0);
      add(root, new THREE.TorusGeometry(22, 1.5, 8, 48), mat(0x64748b, { transparent: true, opacity: 0.5 }), eye.p.x, eye.flightY, eye.p.z, 'StormEyeWall');
      const stunt = frameAt(curve, 0.72, 0, 0);
      const starRing = add(root, new THREE.TorusGeometry(5.5, 0.5, 8, 32), mat(0xfacc15, { emissive: 0xfacc15, emi: 0.7 }), stunt.p.x, stunt.p.y, stunt.p.z, 'TyphoonStuntRing');
      starRing.rotation.x = Math.PI / 4;
      starRing.rotation.z = Math.PI / 6;
      break;
    }
    case 'warp_gate': {
      for (let i = 0; i < 4; i++) {
        const t = 0.55 + i * 0.06;
        const p = frameAt(curve, t, i % 2 ? 16 : -16, 4);
        add(root, new THREE.BoxGeometry(20, 18, 3), mat(0x334155, { transparent: true, opacity: 0.55 }), p.pos.x, p.pos.y + 6, p.pos.z, `CapstoneStorm${i}`);
      }
      const finish = frameAt(curve, 0.92, 0, 0);
      const warp = add(root, new THREE.TorusGeometry(12, 1, 10, 40), mat(0xa855f7, { emissive: 0xa855f7, emi: 0.65 }), finish.p.x, finish.p.y, finish.p.z, 'CapstoneWarp');
      warp.rotation.y = finish.yaw;
      arenaMover(scene, (time) => { warp.rotation.z = time * 0.25; });
      particles(root, finish.p, 0xfbbf24, 24);
      break;
    }
    case 'rainbow_road': {
      const colors = [0xec4899, 0x06b6d4, 0xa855f7];
      [0.15, 0.35, 0.55, 0.75].forEach((t, i) => {
        const p = frameAt(curve, t, 0, 10);
        add(root, new THREE.BoxGeometry(18, 0.6, 28), mat(colors[i % 3], { emissive: colors[i % 3], emi: 0.6 }), p.pos.x, p.pos.y, p.pos.z, `NeonRibbonSeg${i}`);
        [-12, 12].forEach((side, j) => {
          add(root, new THREE.BoxGeometry(0.5, 14, 0.5), mat(colors[(i + 1) % 3], { emissive: colors[(i + 1) % 3], emi: 0.5 }), p.pos.x + side, p.pos.y + 7, p.pos.z, `NeonPost${i}_${j}`);
        });
      });
      break;
    }
    case 'sunny_circuit': {
      [0.2, 0.45, 0.7].forEach((t, i) => {
        const frame = frameAt(curve, t, (i % 2 ? -1 : 1) * 20, 12);
        const bank = add(root, new THREE.BoxGeometry(16, 8, 3), mat(0xfbbf24, { emissive: 0xfbbf24, emi: 0.2 }), frame.pos.x, frame.pos.y + 4, frame.pos.z, `DriftBank${i}`);
        bank.rotation.y = frame.yaw;
      });
      break;
    }
    case 'dragon_skyway': {
      const spine = frameAt(curve, 0.4, 0, 20);
      for (let i = 0; i < 8; i++) {
        const seg = add(root, new THREE.BoxGeometry(6, 4, 8), mat(0x7c3aed, { emissive: 0x7c3aed, emi: 0.25 }), spine.pos.x + (i - 4) * 5, spine.pos.y + Math.sin(i) * 2, spine.pos.z - i * 4, `DragonSpine${i}`);
        seg.rotation.y = spine.yaw;
      }
      const pts = [];
      for (let i = 0; i <= 24; i++) pts.push(curve.getPoint(0.35 + (i / 24) * 0.35));
      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 5, 12, false),
        mat(0xa855f7, { emissive: 0xa855f7, emi: 0.4, transparent: true, opacity: 0.25 }),
      );
      tube.name = 'DragonTunnel';
      root.add(tube);
      break;
    }
    case 'volcano_drift': {
      const p = frameAt(curve, 0.55, 30, 20);
      add(root, new THREE.ConeGeometry(16, 24, 12), mat(0x7f1d1d), p.pos.x, p.pos.y, p.pos.z, 'VolcanoCone');
      add(root, new THREE.SphereGeometry(5, 10, 8), mat(0xf97316, { emissive: 0xf97316, emi: 0.65 }), p.pos.x, p.pos.y + 14, p.pos.z, 'LavaGlow');
      const drift = frameAt(curve, 0.7, 0, 0);
      add(root, new THREE.TorusGeometry(8, 0.6, 8, 32), mat(secondary, { emissive: secondary, emi: 0.5 }), drift.p.x, drift.p.y, drift.p.z, 'DriftRing');
      break;
    }
    case 'street_grand_prix': {
      for (let i = 0; i < 5; i++) {
        const t = 0.15 + i * 0.16;
        const block = frameAt(curve, t, i % 2 ? 18 : -18, 30);
        const h = 10 + (i % 3) * 4;
        add(root, new THREE.BoxGeometry(10, h, 8), mat(0x57534e), block.pos.x, block.pos.y + h / 2, block.pos.z, `StreetBlock${i}`);
        add(root, new THREE.CylinderGeometry(2.5, 2.5, 0.2, 10), mat(0xf97316, { emissive: 0xf97316, emi: 0.3 }), block.pos.x, block.pos.y + h + 0.2, block.pos.z, `RoofSkimPad${i}`);
      }
      break;
    }
    default:
      break;
  }
}

/** Install large mode-specific hero geometry — primary visual differentiator between modes 1–10. */
export function installFlyingModeArena(scene, curve, contract, root) {
  if (!scene || !curve || !contract || !root) return root;
  const recipeId = contract.mission?.recipeId || 'drone_canyon';

  if (contract.chassisId === 'drone') {
    installDroneModeArena(scene, curve, contract, root);
  } else if (contract.chassisId === 'helicopter') {
    installHelicopterModeArena(scene, curve, contract, root);
  } else if (contract.chassisId === 'hoverbot') {
    installHoverBotModeArena(scene, curve, contract, root);
  } else {
    buildRecipeArena(scene, curve, contract, root, recipeId);
  }

  // Reference platforms only on tutorial-style mode 1 — not every mission.
  if (contract.mode === 1 && contract.chassisId !== 'steathjet') {
    [0.42].forEach((t, i) => {
      const p = curve.getPoint(t);
      const tan = curve.getTangent(t).normalize();
      const right = new THREE.Vector3(tan.z, 0, -tan.x);
      const lateral = (i % 2 ? 1 : -1) * 20;
      const pos = p.clone().addScaledVector(right, lateral).add(new THREE.Vector3(0, -4, 0));
      buildPremiumPlatformWithCoins(root, pos.x, pos.y, pos.z, `PathPlatform${i}`, 14);
    });
  }
  scene.userData.flyingModeArena = { chassisId: contract.chassisId, mode: contract.mode, recipeId };
  return root;
}
