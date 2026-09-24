/**
 * FlyingVistaDetailKit — rich, silhouette-unique vista backdrops per flyer bible.
 */
import * as THREE from 'three';
import { pbrMat } from '../../racing/mk-tracks/BiomeAAAKit.js';
import {
  flyingMat,
  flyingGeo,
  flyingAdd,
  buildRealisticOceanPlane,
  buildRealisticOilRig,
  buildRealisticLabPad,
  buildRealisticCarrierDeck,
} from './FlyingArenaMaterialKit.js';
import {
  installPremiumFlyingEnvironment,
  animatePremiumEnvironments,
} from './PremiumFlyingEnvironmentKit.js';

const mat = flyingMat;
const add = flyingAdd;

function seededRnd(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 7) % 2147483647;
    return s / 2147483647;
  };
}

function windowGrid(parent, x, y, z, faceW, faceH, cols, rows, neonColor, prefix, face = 'x') {
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      if ((c + r) % 3 === 0) continue;
      const wx = face === 'x' ? x + faceW / 2 + 0.08 : x + (c - cols / 2) * (faceW / cols);
      const wy = y + 1.5 + r * (faceH / rows);
      const wz = face === 'z' ? z + faceH / 2 + 0.08 : z + (c - cols / 2) * (faceW / cols);
      const win = new THREE.Mesh(
        new THREE.PlaneGeometry(faceW / cols * 0.55, faceH / rows * 0.65),
        pbrMat(neonColor, { emissive: neonColor, emi: 0.45 + ((c + r) % 2) * 0.35, roughness: 0.2 }),
      );
      win.position.set(wx, wy, wz);
      if (face === 'x') win.rotation.y = Math.PI / 2;
      win.name = `${prefix}Win_${c}_${r}`;
      parent.add(win);
    }
  }
}

/** Cyber-city — tiered towers, spires, skybridges, helipads (drone / cloud_sea). */
export function buildCyberCityDetailed(group, cx, floorY, cz) {
  if (group.getObjectByName('CyberCityDetailed')) return group.getObjectByName('CyberCityDetailed');
  const root = new THREE.Group();
  root.name = 'CyberCityDetailed';
  root.position.set(cx, floorY, cz);
  group.add(root);

  const rnd = seededRnd(91);
  const bodyA = pbrMat(0x1e293b, { roughness: 0.48, metalness: 0.42 });
  const bodyB = pbrMat(0x334155, { roughness: 0.52, metalness: 0.38 });
  const cyan = pbrMat(0x06b6d4, { emissive: 0x06b6d4, emi: 1.2 });
  const gold = pbrMat(0xfbbf24, { emissive: 0xfbbf24, emi: 0.55 });
  const glass = pbrMat(0x38bdf8, { emissive: 0x22d3ee, emi: 0.25, roughness: 0.08, metalness: 0.15 });

  const towers = [];
  for (let i = 0; i < 16; i++) {
    const baseW = 6 + rnd() * 8;
    const tiers = 2 + Math.floor(rnd() * 2);
    let tierY = 0;
    let tierW = baseW;
    const x = (i - 8) * 14 + (rnd() - 0.5) * 5;
    const z = -38 - rnd() * 88;
    const towerGroup = new THREE.Group();
    towerGroup.name = `CyberTowerGroup${i}`;
    towerGroup.position.set(x, 0, z);
    root.add(towerGroup);

    for (let t = 0; t < tiers; t++) {
      const h = 12 + rnd() * 14;
      const d = tierW * (0.75 + rnd() * 0.2);
      const body = new THREE.Mesh(new THREE.BoxGeometry(tierW, h, d), t % 2 ? bodyA : bodyB);
      body.position.set(0, tierY + h / 2, 0);
      body.name = `CyberTier${i}_${t}`;
      towerGroup.add(body);
      windowGrid(towerGroup, tierW / 2, tierY, 0, tierW * 0.85, h * 0.85, 4, Math.floor(h / 3.5), 0x06b6d4, `T${i}_${t}`, 'x');
      if (t === tiers - 1 && rnd() > 0.55) {
        const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.55, 5 + rnd() * 8, 8), cyan);
        spire.position.set(0, tierY + h + 2.5, 0);
        spire.name = `CyberSpire${i}`;
        towerGroup.add(spire);
        const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 6), gold);
        beacon.position.set(0, tierY + h + 5.5 + rnd() * 4, 0);
        towerGroup.add(beacon);
      }
      tierY += h;
      tierW *= 0.82;
    }

    if (rnd() > 0.6) {
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 0.12, 16), gold);
      pad.position.set(0, tierY + 0.08, 0);
      pad.name = `RoofPad${i}`;
      towerGroup.add(pad);
      add(towerGroup, flyingGeo.torus(2, 0.06, 8, 24), mat(0xfbbf24, { emi: 0.35 }), 0, tierY + 0.15, 0, `PadRing${i}`, { rotX: Math.PI / 2 });
    }

    const crown = new THREE.Mesh(new THREE.BoxGeometry(tierW * 1.05, 0.35, tierW * 0.75), glass);
    crown.position.set(0, tierY + 0.2, 0);
    towerGroup.add(crown);

    if (rnd() > 0.45) {
      const hvac = new THREE.Mesh(new THREE.BoxGeometry(tierW * 0.35, 0.9, tierW * 0.28), bodyB);
      hvac.position.set(tierW * 0.22, tierY + 0.55, tierW * 0.18);
      hvac.name = `RoofHvac${i}`;
      towerGroup.add(hvac);
    }
    if (rnd() > 0.5) {
      const sign = new THREE.Mesh(new THREE.BoxGeometry(0.12, tierY * 0.35, 1.8), cyan);
      sign.position.set(tierW / 2 + 0.12, tierY * 0.42, 0);
      sign.name = `CyberNeonSign${i}`;
      towerGroup.add(sign);
    }
    if (i % 4 === 0) {
      const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.5, 6), mat('dark_steel'));
      antenna.position.set(-tierW * 0.2, tierY + 1.8, 0);
      towerGroup.add(antenna);
      add(towerGroup, flyingGeo.sphere(0.18, 6, 4), gold, -tierW * 0.2, tierY + 3.5, 0, `AntennaTip${i}`);
    }

    towers.push({ x, z, topY: tierY, w: tierW });
  }

  for (let s = 0; s < 8; s++) {
    const sx = (s - 4) * 22;
    const glow = new THREE.Mesh(
      new THREE.BoxGeometry(18, 0.08, 0.35),
      pbrMat(0x06b6d4, { emissive: 0x06b6d4, emi: 0.65 }),
    );
    glow.position.set(sx, 0.12, -12 - (s % 3) * 6);
    glow.name = `StreetGlow${s}`;
    root.add(glow);
  }

  for (let b = 0; b < 4; b++) {
    const a = towers[b * 3];
    const c = towers[b * 3 + 1];
    if (!a || !c) continue;
    const midX = (a.x + c.x) / 2;
    const midZ = (a.z + c.z) / 2;
    const bridgeY = Math.min(a.topY, c.topY) * 0.55;
    const span = Math.hypot(c.x - a.x, c.z - a.z);
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(span, 0.35, 2.2), glass);
    bridge.position.set(midX, bridgeY, midZ);
    bridge.rotation.y = Math.atan2(c.x - a.x, c.z - a.z);
    bridge.name = `SkyBridge${b}`;
    root.add(bridge);
  }

  const haze = new THREE.Mesh(
    new THREE.PlaneGeometry(440, 130),
    new THREE.MeshBasicMaterial({ color: 0xd7b78f, transparent: true, opacity: 0.16, depthWrite: false, fog: true }),
  );
  haze.rotation.x = -Math.PI / 2;
  haze.position.set(0, 1.5, -58);
  root.add(haze);
  return root;
}

export function buildOceanVistaDetailed(g, backdrop, y) {
  buildRealisticOceanPlane(g, backdrop.pos.x, y - 4, backdrop.pos.z, 480, 480);
  [[-52, -58], [38, -98], [8, -138], [-28, -178]].forEach(([sx, fz], i) => {
    const p = backdrop.at(sx, fz);
    buildRealisticOilRig(g, p.x, y, p.z, `Rig${i}`, i === 1 ? { fire: true } : i === 2 ? { snowCap: true } : {});
    if (i === 0) {
      add(g, flyingGeo.box(14, 3.5, 5), mat('painted_steel'), p.x + 22, y + 1.8, p.z - 8, 'SupplyBarge');
      add(g, flyingGeo.cylinder(0.25, 0.25, 12, 8), mat('dark_steel'), p.x + 18, y + 8, p.z - 6, 'CraneMast');
      add(g, flyingGeo.box(10, 0.35, 0.5), mat('helipad_yellow'), p.x + 22, y + 13, p.z - 6, 'CraneArm');
    }
  });
  for (let w = 0; w < 6; w++) {
    const foam = backdrop.at(-70 + w * 24, -40 - w * 8);
    add(g, flyingGeo.box(8, 0.15, 3), mat(0xffffff, { transparent: true, opacity: 0.35 }), foam.x, y - 3.2, foam.z, `WaveFoam${w}`);
  }
  for (let b = 0; b < 5; b++) {
    const buoy = backdrop.at(-80 + b * 38, -22 - b * 5);
    add(g, flyingGeo.cylinder(0.9, 1.1, 2.2, 10), mat(0xf97316, { emissive: 0xf97316, emi: 0.35 }), buoy.x, y - 2.5, buoy.z, `Buoy${b}`);
    add(g, flyingGeo.sphere(0.35, 8, 6), mat(0xffffff), buoy.x, y - 1.2, buoy.z, `BuoyTop${b}`);
  }
}

export function buildLabVistaDetailed(g, backdrop, y) {
  const pads = [[-24, -68], [20, -98], [-8, -128]];
  pads.forEach(([sx, fz], i) => {
    const p = backdrop.at(sx, fz);
    buildRealisticLabPad(g, p.x, y + 10, p.z, `LabPad${i}`, i * 0.4);
    const dome = add(g, flyingGeo.sphere(5.5, 20, 14), mat('glass_plasma', { emissive: 0xa78bfa, emi: 0.22, transparent: true, opacity: 0.35 }), p.x, y + 16, p.z, `LabDome${i}`);
    add(g, flyingGeo.cylinder(0.15, 0.2, 4, 10), mat('dark_steel'), p.x + 4, y + 18, p.z, `DishMast${i}`);
    add(g, flyingGeo.cylinder(2.2, 2.2, 0.15, 16), mat('repulsor_violet', { emi: 0.45 }), p.x + 4, y + 20, p.z, `Dish${i}`, { rotX: 0.35 });
    if (i < 2) {
      const next = backdrop.at(pads[i + 1][0], pads[i + 1][1]);
      const tubePts = [new THREE.Vector3(p.x + 5, y + 11, p.z), new THREE.Vector3((p.x + next.x) / 2, y + 13, (p.z + next.z) / 2), new THREE.Vector3(next.x - 5, y + 11, next.z)];
      const tube = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(tubePts), 16, 0.55, 10, false),
        mat('glass_plasma', { emissive: 0x22d3ee, emi: 0.4, transparent: true, opacity: 0.55 }),
      );
      tube.name = `LabTube${i}`;
      g.add(tube);
    }
  });
}

export function buildCarrierVistaDetailed(g, deckPos) {
  buildRealisticCarrierDeck(g, deckPos.x, deckPos.y, deckPos.z);
  [-28, -8, 12, 32].forEach((ox, i) => {
    add(g, flyingGeo.cylinder(1.2, 1.5, 2.5, 10), mat('dark_steel'), deckPos.x + ox, deckPos.y + 2.2, deckPos.z - 4, `ParkedJet${i}`);
    add(g, flyingGeo.box(4.5, 0.35, 1.2), mat('painted_steel'), deckPos.x + ox, deckPos.y + 3.5, deckPos.z - 3, `JetWing${i}`);
  });
  add(g, flyingGeo.box(22, 8, 6), mat('painted_steel'), deckPos.x + 55, deckPos.y + 2, deckPos.z - 30, 'EscortHull');
  add(g, flyingGeo.box(4, 6, 3), mat('white_paint'), deckPos.x + 55, deckPos.y + 6, deckPos.z - 28, 'EscortBridge');
}

export function buildRadarVistaDetailed(g, backdrop, y) {
  const dome = backdrop.at(0, -36);
  add(g, flyingGeo.sphere(18, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat('dark_steel', { metalness: 0.55 }), dome.x, y, dome.z, 'RadarDomeMesh');
  add(g, flyingGeo.cylinder(2, 2.5, 3, 12), mat('dark_steel'), dome.x, y + 1.5, dome.z, 'RadarBase');
  const sweep = add(g, new THREE.ConeGeometry(24, 0.8, 32, 1, true), mat(0x22c55e, { emissive: 0x22c55e, emi: 0.42, transparent: true, opacity: 0.22 }), dome.x, y + 10, dome.z, 'RadarSweepMesh');
  sweep.rotation.x = Math.PI / 2;
  sweep.userData.radarSweep = true;
  for (let i = 0; i < 4; i++) {
    const hangar = backdrop.at(-35 + i * 22, -20 - i * 12);
    add(g, flyingGeo.box(16, 6, 10), mat(0x1e293b), hangar.x, y + 3, hangar.z, `Hangar${i}`);
    add(g, flyingGeo.box(14, 4.5, 0.2), mat(0x334155), hangar.x, y + 3, hangar.z + 5.2, `HangarDoor${i}`);
  }
  for (let i = 0; i < 48; i++) {
    const star = add(g, flyingGeo.sphere(0.12, 4, 4), mat(0xf8fafc, { emissive: 0xffffff, emi: 0.5 }), dome.x + (Math.random() - 0.5) * 140, y + 35 + Math.random() * 35, dome.z - 50 - Math.random() * 90, `Star${i}`);
    star.material.transparent = true;
    star.material.opacity = 0.9;
  }
}

export function buildCoastVistaDetailed(g, backdrop, y) {
  const coast = backdrop.at(0, -48);
  add(g, flyingGeo.plane(300, 110), mat('ocean', { transparent: true, opacity: 0.82 }), coast.x, y - 1.5, coast.z, 'SeaPlane', { rotX: -Math.PI / 2 });
  add(g, flyingGeo.box(300, 8, 40), mat('grass'), coast.x, y + 3, coast.z + 34, 'CliffGrass');
  add(g, flyingGeo.box(300, 2, 38), mat('stone'), coast.x, y - 0.5, coast.z + 34, 'CliffRock');
  const light = backdrop.at(44, -26);
  add(g, flyingGeo.cylinder(1.2, 1.5, 16, 10), mat('white_paint'), light.x, y + 10, light.z, 'LighthouseTower');
  add(g, flyingGeo.cylinder(2.2, 2.8, 3, 12), mat('white_paint'), light.x, y + 19, light.z, 'LighthouseLantern');
  add(g, flyingGeo.cone(2.5, 2, 12), mat(0xfbbf24, { emissive: 0xfbbf24, emi: 0.65 }), light.x, y + 21, light.z, 'BeaconLight');
  const cone = add(g, new THREE.ConeGeometry(8, 18, 16, 1, true), mat(0xfff3c4, { emissive: 0xfbbf24, emi: 0.15, transparent: true, opacity: 0.12 }), light.x, y + 12, light.z, 'BeaconCone');
  cone.rotation.x = -Math.PI / 2;
  add(g, flyingGeo.box(28, 0.4, 3), mat('stone'), coast.x - 20, y + 1, coast.z + 18, 'Pier');
  for (let i = 0; i < 5; i++) {
    add(g, flyingGeo.cylinder(0.5, 0.5, 2.5, 8), mat('dark_steel'), coast.x - 28 + i * 6, y + 2.5, coast.z + 18, `PierPile${i}`);
  }
  add(g, flyingGeo.torus(5, 0.35, 10, 32), mat(0xffffff, { transparent: true, opacity: 0.4 }), backdrop.at(-18, -4).x, y + 14, backdrop.at(-18, -4).z, 'SmokeRingArch', { rotX: Math.PI / 2 });
}

export function buildNeonRibbonVistaDetailed(g, backdrop, y) {
  add(g, flyingGeo.plane(320, 120), mat(0x120428, { transparent: true, opacity: 0.94 }), backdrop.at(0, -15).x, y + 10, backdrop.at(0, -15).z, 'VoidFloor', { rotX: -Math.PI / 2 });
  add(g, flyingGeo.plane(280, 90), mat(0xec4899, { emissive: 0xec4899, emi: 0.08, transparent: true, opacity: 0.12 }), backdrop.at(0, -40).x, y + 11, backdrop.at(0, -40).z, 'NeonGrid', { rotX: -Math.PI / 2 });
  const colors = [0xec4899, 0x06b6d4, 0xa855f7];
  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    const p = backdrop.at(Math.sin(t * Math.PI * 2) * 28, -50 - i * 24);
    const col = colors[i % 3];
    add(g, flyingGeo.box(20, 0.5, 34), mat(col, { emissive: col, emi: 0.72 }), p.x, y + 6, p.z, `RibbonSeg${i}`);
    [-11, 11].forEach((side, j) => {
      add(g, flyingGeo.box(0.5, 22, 0.5), mat(colors[(i + 1) % 3], { emissive: colors[(i + 1) % 3], emi: 0.55 }), p.x + side, y + 14, p.z, `RibbonPylon${i}_${j}`);
    });
    add(g, flyingGeo.box(8, 4, 0.15), mat(col, { emissive: col, emi: 0.85 }), p.x, y + 10, p.z + 18, `HoloBillboard${i}`);
  }
  const arch = backdrop.at(0, -30);
  add(g, flyingGeo.torus(9, 0.45, 12, 40), mat(0xec4899, { emissive: 0xec4899, emi: 0.75 }), arch.x, y + 18, arch.z, 'NeonFinishArch', { rotX: Math.PI / 2 });
}

export function buildPlasmaTrackVistaDetailed(g, backdrop, y) {
  add(g, flyingGeo.plane(320, 120), mat(0x4c1d95, { transparent: true, opacity: 0.9 }), backdrop.at(0, -18).x, y + 8, backdrop.at(0, -18).z, 'PlasmaVoid', { rotX: -Math.PI / 2 });
  for (let lane = 0; lane < 3; lane++) {
    for (let i = 0; i < 4; i++) {
      const p = backdrop.at((lane - 1) * 22, -48 - i * 22);
      const tube = add(g, flyingGeo.cylinder(3.2, 3.2, 22, 20), mat(0xa855f7, { emissive: 0xa855f7, emi: 0.35, transparent: true, opacity: 0.45 }), p.x, y + 6, p.z, `PlasmaTube${lane}_${i}`, { rotX: Math.PI / 2 });
      tube.rotation.z = Math.PI / 2;
      add(g, flyingGeo.torus(3.5, 0.12, 8, 32), mat(0x22d3ee, { emissive: 0x22d3ee, emi: 0.65 }), p.x, y + 6, p.z + 12, `WarpRing${lane}_${i}`, { rotX: Math.PI / 2 });
    }
  }
  for (let i = 0; i < 6; i++) {
    const pylon = backdrop.at(-40 + i * 16, -35);
    add(g, flyingGeo.cylinder(0.35, 0.5, 26, 10), mat('repulsor_violet', { emissive: 0x22d3ee, emi: 0.5 }), pylon.x, y + 14, pylon.z, `EnergyPylon${i}`);
    add(g, flyingGeo.sphere(1.2, 10, 8), mat(0x22d3ee, { emissive: 0x22d3ee, emi: 0.85 }), pylon.x, y + 27, pylon.z, `PylonOrb${i}`);
    if (i < 5) {
      const next = backdrop.at(-40 + (i + 1) * 16, -35);
      const arcPts = [
        new THREE.Vector3(pylon.x, y + 27, pylon.z),
        new THREE.Vector3((pylon.x + next.x) / 2, y + 32, (pylon.z + next.z) / 2),
        new THREE.Vector3(next.x, y + 27, next.z),
      ];
      const arc = new THREE.Mesh(
        new THREE.TubeGeometry(new THREE.CatmullRomCurve3(arcPts), 12, 0.08, 8, false),
        mat(0xa855f7, { emissive: 0x22d3ee, emi: 0.75, transparent: true, opacity: 0.7 }),
      );
      arc.name = `PlasmaArc${i}`;
      g.add(arc);
    }
  }
}

export function buildDisasterVistaDetailed(g, backdrop, y) {
  const haze = backdrop.at(0, -5);
  add(g, flyingGeo.plane(360, 150), mat(0x78716c, { transparent: true, opacity: 0.4 }), haze.x, y + 28, haze.z, 'SmokeLayer', { rotX: -Math.PI / 2 });
  for (let i = 0; i < 7; i++) {
    const h = 16 + (i % 4) * 7;
    const ruin = backdrop.at(-64 + i * 20, -55 - (i % 2) * 14);
    const tilt = (i % 2 ? 1 : -1) * 0.12;
    const block = add(g, flyingGeo.box(10 + (i % 2) * 2, h, 8), mat(0x57534e), ruin.x, y + h / 2, ruin.z, `RuinBlock${i}`);
    block.rotation.z = tilt;
    windowGrid(g, ruin.x + 4.2, y, ruin.z, 6, h * 0.8, 3, 4, 0xfbbf24, `Ruin${i}`, 'x');
    if (i % 2 === 0) {
      add(g, flyingGeo.cone(1.8, 3.5, 10), mat(0xf97316, { emissive: 0xf97316, emi: 0.75 }), ruin.x + 3, y + 1.8, ruin.z + 4, `Fire${i}`);
      add(g, flyingGeo.cylinder(3, 3, 0.14, 12), mat(0xf97316, { emissive: 0xf97316, emi: 0.35 }), ruin.x, y + h + 0.1, ruin.z, `RescuePad${i}`);
    }
  }
  add(g, flyingGeo.box(40, 0.35, 3), mat(0x44403c), backdrop.at(0, -42).x, y + 4, backdrop.at(0, -42).z, 'CollapsedBridge');
  [[-20, -36], [22, -50], [6, -70]].forEach(([sx, fz], i) => {
    const s = backdrop.at(sx, fz);
    add(g, flyingGeo.sphere(0.7, 10, 8), mat(0x22c55e, { emissive: 0x22c55e, emi: 0.8 }), s.x, y + 16, s.z, `SurvivorBeacon${i}`);
  });
}

export function installFlyingVistaDetails(g, vista, backdrop, y, bounds, curve) {
  if (installPremiumFlyingEnvironment(g, vista, backdrop, y, bounds, curve)) return;
  switch (vista) {
    case 'ocean_platforms':
      buildOceanVistaDetailed(g, backdrop, y);
      break;
    case 'floating_labs':
      buildLabVistaDetailed(g, backdrop, y);
      break;
    case 'carrier_deck': {
      const t = curve.getPoint(0.55);
      buildCarrierVistaDetailed(g, { x: t.x - 10, y: bounds?.floorY ?? y - 6, z: t.z - 58 });
      break;
    }
    case 'radar_dome':
      buildRadarVistaDetailed(g, backdrop, y);
      break;
    case 'coastline':
      buildCoastVistaDetailed(g, backdrop, y);
      break;
    case 'neon_ribbon':
      buildNeonRibbonVistaDetailed(g, backdrop, y);
      break;
    case 'plasma_track':
      buildPlasmaTrackVistaDetailed(g, backdrop, y);
      break;
    case 'disaster_city':
      buildDisasterVistaDetailed(g, backdrop, y);
      break;
    case 'cloud_sea':
    default: {
      const cityBase = backdrop.at(0, -60);
      const floorY = bounds?.floorY ?? y - 36;
      buildCyberCityDetailed(g, cityBase.x, floorY, cityBase.z);
      break;
    }
  }
}

export function animateVistaDetails(scene, time) {
  animatePremiumEnvironments(scene, time);
  scene.traverse((obj) => {
    if (obj.userData?.radarSweep) obj.rotation.z = time * 0.45;
    if (obj.name?.startsWith('CyberNeon') || obj.name?.includes('Win_')) {
      if (obj.material?.emissiveIntensity != null) {
        obj.material.emissiveIntensity = 0.5 + Math.sin(time * 1.8 + obj.position.y * 0.08) * 0.35;
      }
    }
    if (obj.name?.startsWith('Fire') && obj.material) {
      obj.material.emissiveIntensity = 0.65 + Math.sin(time * 3 + obj.position.x) * 0.25;
      obj.scale.y = 1 + Math.sin(time * 4) * 0.08;
    }
  });
}
