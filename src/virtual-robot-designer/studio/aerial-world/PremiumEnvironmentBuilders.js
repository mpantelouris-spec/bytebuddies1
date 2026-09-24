// WebGL path - geometry + PBR; hero effects tuned via AerialUERenderKit profiles.
import * as THREE from 'three';
import { pbrMat } from '../../racing/mk-tracks/BiomeAAAKit.js';
import {
  mat,
  add,
  geo,
  seededRnd,
  instancedMesh,
  windowGrid,
  archRow,
  hazardStripes,
  hexPrism,
  reflectiveWater,
  cableTray,
  starField,
  mossMat,
  obsidianMat,
  sparkPoints,
} from './PremiumEnvironmentHelpers.js';

function brassClearcoat(extra = {}) {
  const m = mat(0xb45309, {
    metalness: 0.72,
    roughness: 0.32,
    emissive: 0xfbbf24,
    emi: 0.12,
    ...extra,
  });
  if (m.isMeshPhysicalMaterial) {
    m.clearcoat = 0.4;
    m.clearcoatRoughness = 0.18;
  }
  return m;
}

function placeGear(parent, x, y, z, radius, brass, iron, name, spin = 0.2) {
  const gearGroup = new THREE.Group();
  gearGroup.position.set(x, y, z);
  gearGroup.rotation.x = Math.PI / 2;
  gearGroup.name = name;
  gearGroup.userData.spinGear = spin;
  const hub = new THREE.Mesh(geo.cylinder(radius * 0.35, radius * 0.35, 0.55, 12), brass);
  hub.name = `${name}Hub`;
  gearGroup.add(hub);
  const rim = new THREE.Mesh(geo.cylinder(radius, radius, 0.45, 24), brass);
  rim.name = `${name}Rim`;
  gearGroup.add(rim);
  for (let t = 0; t < 12; t++) {
    const ang = (t / 12) * Math.PI * 2;
    const tooth = new THREE.Mesh(geo.box(0.42, radius * 0.38, 0.52), iron);
    tooth.position.set(Math.cos(ang) * radius, Math.sin(ang) * radius, 0);
    tooth.rotation.z = ang;
    tooth.name = `${name}Tooth${t}`;
    gearGroup.add(tooth);
  }
  parent.add(gearGroup);
  return gearGroup;
}

function clockFace(parent, x, y, z, radius, brass, iron, name) {
  const face = add(parent, geo.cylinder(radius, radius, 0.18, 32), brass, x, y, z, `${name}Face`, { rotX: Math.PI / 2 });
  add(parent, geo.cylinder(radius * 0.92, radius * 0.92, 0.04, 32), mat(0xf8fafc, { roughness: 0.55 }), x, y + 0.1, z, `${name}Dial`, { rotX: Math.PI / 2 });
  const hour = add(parent, geo.box(0.12, radius * 0.45, 0.06), iron, x, y + 0.14, z, `${name}HourHand`, { rotZ: 0.6 });
  hour.rotation.x = Math.PI / 2;
  const minute = add(parent, geo.box(0.08, radius * 0.62, 0.05), iron, x, y + 0.16, z, `${name}MinuteHand`, { rotZ: -1.1 });
  minute.rotation.x = Math.PI / 2;
  return face;
}

function chainDrive(parent, x1, y1, z1, x2, y2, z2, brass, prefix) {
  const segments = 14;
  for (let i = 0; i < segments; i++) {
    const t = i / (segments - 1);
    const cx = x1 + (x2 - x1) * t;
    const cy = y1 + (y2 - y1) * t + Math.sin(t * Math.PI) * 0.8;
    const cz = z1 + (z2 - z1) * t;
    add(parent, geo.box(0.55, 0.22, 0.38), brass, cx, cy, cz, `${prefix}Link${i}`);
  }
}

/** 1 — Gothic Clockwork Spire */
export function buildGothicClockworkSpire(g, backdrop, y) {
  const base = backdrop.at(0, -55);
  const root = new THREE.Group();
  root.name = 'GothicClockworkSpire';
  root.position.set(base.x, y - 28, base.z);
  g.add(root);

  const iron = mat('dark_steel', { metalness: 0.82, roughness: 0.38 });
  const brass = brassClearcoat();
  const stone = mat('stone', { roughness: 0.88 });
  const rnd = seededRnd(17);

  add(root, geo.plane(72, 48, 12, 8), stone, 0, 0.02, 8, 'CobblePlaza', { rotX: -Math.PI / 2 });
  for (let c = 0; c < 24; c++) {
    const ox = (c % 8 - 3.5) * 4.2;
    const oz = Math.floor(c / 8) * 5 - 4;
    add(root, geo.box(1.6, 0.12, 1.6), mat(0x64748b, { roughness: 0.92 }), ox, 0.08, oz + 8, `Cobble${c}`);
  }

  add(root, geo.cylinder(9, 12, 48, 12), iron, 0, 24, 0, 'ClockSpireCore');
  add(root, geo.cone(10, 18, 12), brass, 0, 57, 0, 'SpireCap');
  add(root, geo.cylinder(5.5, 7, 36, 10), iron, -18, 18, -6, 'FlankSpireL');
  add(root, geo.cone(6, 12, 10), brass, -18, 39, -6, 'FlankCapL');
  add(root, geo.cylinder(5.5, 7, 36, 10), iron, 18, 18, -6, 'FlankSpireR');
  add(root, geo.cone(6, 12, 10), brass, 18, 39, -6, 'FlankCapR');

  const clockPositions = [[0, 38, -9.2], [-18, 30, -6.8], [18, 30, -6.8], [0, 22, 9.5]];
  clockPositions.forEach(([cx, cy, cz], i) => clockFace(root, cx, cy, cz, 2.8, brass, iron, `Clock${i}`));

  const gearData = [];
  for (let i = 0; i < 24; i++) {
    const gx = (i % 6 - 2.5) * 10 + (rnd() - 0.5) * 3;
    const gz = -8 - Math.floor(i / 6) * 14 - rnd() * 6;
    const gr = 2.2 + rnd() * 3.5;
    const gy = 6 + rnd() * 34;
    gearData.push({ gx, gy, gz, gr });
    placeGear(root, gx, gy, gz, gr, brass, iron, `Gear${i}`, 0.12 + rnd() * 0.38);
  }
  for (let c = 0; c < 10; c++) {
    const a = gearData[c];
    const b = gearData[c + 1];
    if (a && b) chainDrive(root, a.gx, a.gy, a.gz, b.gx, b.gy, b.gz, brass, `Chain${c}`);
  }

  for (let a = 0; a < 8; a++) {
    const ax = (a - 3.5) * 14;
    add(root, geo.box(2.8, 30, 2.8), iron, ax, 15, -6, `FlyingButtress${a}`);
    add(root, geo.box(6, 0.5, 9), brass, ax, 30, -2, `GargoyleLedge${a}`);
    add(root, geo.box(1.2, 1.8, 2.4), iron, ax, 31.2, -1, `Gargoyle${a}`);
  }

  add(root, geo.torus(5.5, 0.22, 8, 24), brass, 0, 44, -11, 'RoseWindowOuter', { rotX: Math.PI / 2 });
  for (let s = 0; s < 8; s++) {
    const ang = (s / 8) * Math.PI * 2;
    add(root, geo.box(0.12, 4.8, 0.12), brass, Math.cos(ang) * 3.2, 44, -11 + Math.sin(ang) * 3.2, `RoseTracery${s}`, { rotY: ang });
  }
  add(root, geo.torus(6, 0.25, 8, 32), brass, 0, 42, -12, 'ClockRing', { rotX: Math.PI / 2 }).userData.spinGear = 0.08;

  for (let l = 0; l < 6; l++) {
    const lx = -24 + l * 9;
    add(root, geo.cylinder(0.08, 0.12, 5, 6), iron, lx, 2.5, 18, `LampPost${l}`);
    add(root, geo.sphere(0.35, 8, 6), mat(0xfbbf24, { emissive: 0xfbbf24, emi: 0.65 }), lx, 5.4, 18, `GasLamp${l}`);
  }
}

/** 2 — Venetian Midnight Canal */
export function buildVenetianMidnightCanal(g, backdrop, y) {
  const canal = backdrop.at(0, -50);
  const root = new THREE.Group();
  root.name = 'VenetianMidnightCanal';
  g.add(root);

  const stone = mat('stone', { roughness: 0.88 });
  const warm = 0xfbbf24;
  reflectiveWater(root, canal.x, y - 2, canal.z, 340, 140, 'CanalWaterSSR');

  for (let b = 0; b < 10; b++) {
    const side = b % 2 === 0 ? -1 : 1;
    const bx = side * (20 + (b % 3) * 3);
    const bz = -30 - b * 12;
    const p = backdrop.at(bx, bz);
    const h = 14 + (b % 4) * 6;
    const palazzo = add(root, geo.box(14, h, 10), stone, p.x, y + h / 2, p.z, `Palazzo${b}`);
    windowGrid(palazzo, 0, -h / 2 + 2, side * 5.2, 12, h - 4, 4, Math.floor(h / 3.5), warm, `Palazzo${b}`, 'x');
    add(root, geo.box(14, 1.2, 11), stone, p.x, y + h + 0.6, p.z, `PalazzoRoof${b}`);
    if (b % 3 === 0) {
      add(root, geo.cylinder(0.6, 0.8, 12, 8), stone, p.x, y + h + 7, p.z, `Campanile${b}`);
    }
  }

  for (let br = 0; br < 4; br++) {
    const pier = backdrop.at(-36 + br * 24, -18 - br * 6);
    add(root, geo.box(18, 0.4, 3.2), stone, pier.x, y + 0.6, pier.z, `CanalBridge${br}`);
    add(root, geo.cylinder(0.35, 0.45, 4.5, 8), mat('dark_steel'), pier.x - 7, y + 2.5, pier.z, `BridgeArchL${br}`);
    add(root, geo.cylinder(0.35, 0.45, 4.5, 8), mat('dark_steel'), pier.x + 7, y + 2.5, pier.z, `BridgeArchR${br}`);
    add(root, geo.cylinder(0.35, 0.5, 3.2, 8), mat(warm, { emissive: warm, emi: 0.55 }), pier.x, y + 2.2, pier.z, `BridgeLamp${br}`);
  }

  const moonPos = backdrop.at(42, -8);
  add(root, geo.sphere(3.2, 20, 16), mat(0xf8fafc, { emissive: 0xe2e8f0, emi: 0.28 }), moonPos.x, y + 38, moonPos.z, 'MoonDisc');

  const gondolaOffsets = [[-12, -35], [16, -58]];
  gondolaOffsets.forEach(([ox, oz], i) => {
    const gp = backdrop.at(ox, oz);
    add(root, geo.box(5.5, 0.35, 1.2), mat(0x1e293b, { roughness: 0.75 }), gp.x, y + 0.15, gp.z, `GondolaHull${i}`);
    add(root, geo.box(0.08, 2.8, 0.08), mat('dark_steel'), gp.x, y + 1.6, gp.z, `GondolaPole${i}`);
  });

  for (let m = 0; m < 8; m++) {
    const mp = backdrop.at(-28 + m * 8, -42 - (m % 2) * 10);
    add(root, geo.cylinder(0.12, 0.18, 3.5, 6), mat('dark_steel'), mp.x, y + 1.2, mp.z, `MooringPole${m}`);
    add(root, geo.sphere(0.22, 6, 4), mat(0x991b1b, { emissive: 0x7f1d1d, emi: 0.2 }), mp.x, y + 3.2, mp.z, `MooringBuoy${m}`);
  }

  starField(root, canal.x, y + 42, canal.z - 20, 120, { x: 180, y: 35, z: 90 }, 'CanalStars');
}

/** 3 — Abandoned Cybernetic Assembly Line */
export function buildCyberneticAssemblyLine(g, backdrop, y) {
  const floor = backdrop.at(0, -45);
  const root = new THREE.Group();
  root.name = 'CyberneticAssemblyLine';
  g.add(root);

  add(root, geo.plane(360, 120, 16, 6), mat('asphalt'), floor.x, y - 1, floor.z, 'FactoryFloor', { rotX: -Math.PI / 2 });
  hazardStripes(root, floor.x, y - 0.92, floor.z + 48, 320, 4, 'AssemblyHazard');

  for (let lane = 0; lane < 3; lane++) {
    const lx = (lane - 1) * 28;
    for (let s = 0; s < 5; s++) {
      const p = backdrop.at(lx, -40 - s * 22);
      add(root, geo.box(22, 1.2, 3.2), mat('painted_steel'), p.x, y + 2, p.z, `Conveyor${lane}_${s}`);
      for (let r = 0; r < 6; r++) {
        add(root, geo.cylinder(0.35, 0.35, 3.2, 8), mat('dark_steel'), p.x - 10 + r * 3.8, y + 1.2, p.z, `Roller${lane}_${s}_${r}`);
      }
      add(root, geo.cylinder(0.85, 0.85, 2.2, 10), mat('dark_steel'), p.x - 9, y + 3.4, p.z, `RobotArmBase${lane}_${s}`);
      add(root, geo.box(7, 0.38, 0.38), mat('helipad_yellow'), p.x - 5, y + 5.8, p.z, `RobotArm${lane}_${s}`);
      add(root, geo.box(2.2, 0.28, 0.28), mat('rust'), p.x - 2, y + 6.6, p.z, `RobotGripper${lane}_${s}`);
    }
  }

  const debrisGeo = new THREE.BoxGeometry(0.45, 0.28, 0.38);
  const debrisMat = mat('rust');
  instancedMesh(
    root,
    debrisGeo,
    debrisMat,
    500,
    (dummy, i) => {
      const p = backdrop.at(-90 + (i % 25) * 7.5, -28 - Math.floor(i / 25) * 9);
      dummy.position.set(p.x + (Math.random() - 0.5) * 8, y + Math.random() * 10, p.z + (Math.random() - 0.5) * 5);
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      dummy.scale.setScalar(0.6 + Math.random() * 1.6);
    },
    'AssemblyDebrisInstanced',
  );

  const sparkRoot = new THREE.Group();
  sparkRoot.position.set(floor.x, 0, floor.z);
  root.add(sparkRoot);
  sparkPoints(sparkRoot, 800, { x: 300, y: 18, z: 110 }, y + 2, 'AssemblySparkField');

  const gantry = backdrop.at(0, -30);
  add(root, geo.box(280, 1.2, 2.5), mat('painted_steel', { metalness: 0.75 }), gantry.x, y + 16, gantry.z, 'GantryBeam');
  add(root, geo.box(3.5, 16, 3.5), mat('dark_steel'), gantry.x - 130, y + 8, gantry.z, 'GantryTowerL');
  add(root, geo.box(3.5, 16, 3.5), mat('dark_steel'), gantry.x + 130, y + 8, gantry.z, 'GantryTowerR');
  add(root, geo.box(8, 1.5, 4), mat('helipad_yellow'), gantry.x, y + 14, gantry.z, 'GantryCrane');

  for (let pipe = 0; pipe < 6; pipe++) {
    const pp = backdrop.at(-70 + pipe * 28, -55);
    add(root, geo.cylinder(0.45, 0.45, 42, 10), mat('painted_steel'), pp.x, y + 12, pp.z, `PipeRun${pipe}`);
    add(root, geo.cylinder(0.55, 0.55, 0.8, 10), mat('rust'), pp.x, y + 8, pp.z, `PipeFlange${pipe}`);
  }
}

/** 4 — Neon Server Necropolis */
export function buildNeonServerNecropolis(g, backdrop, y) {
  const root = new THREE.Group();
  root.name = 'NeonServerNecropolis';
  g.add(root);

  const floorPos = backdrop.at(0, -20);
  add(root, geo.plane(340, 130, 24, 12), mat(0x0f172a), floorPos.x, y + 4, floorPos.z, 'NecropolisFloor', { rotX: -Math.PI / 2 });
  for (let gx = 0; gx < 34; gx++) {
    for (let gz = 0; gz < 13; gz++) {
      if ((gx + gz) % 2 === 0) continue;
      const lx = floorPos.x - 160 + gx * 10;
      const lz = floorPos.z - 60 + gz * 10;
      add(root, geo.box(8, 0.04, 0.12), mat(0x22c55e, { emissive: 0x22c55e, emi: 0.25 }), lx, y + 4.06, lz, `FloorGridX${gx}_${gz}`);
    }
  }

  const rackColors = [0x22c55e, 0x06b6d4, 0xa855f7];
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 4; col++) {
      const p = backdrop.at(-48 + col * 32, -50 - row * 18);
      const h = 10 + (col % 2) * 4;
      add(root, geo.box(4.2, h, 2.8), mat('dark_steel', { metalness: 0.78 }), p.x, y + h / 2 + 4, p.z, `ServerRack${row}_${col}`);
      const c = rackColors[(row + col) % 3];
      for (let led = 0; led < 14; led++) {
        add(root, geo.box(3.4, 0.08, 0.1), mat(c, { emissive: c, emi: 0.85 }), p.x, y + 5 + led * 0.85, p.z + 1.45, `DataStream${row}_${col}_${led}`);
      }
      if (col < 3) {
        const next = backdrop.at(-48 + (col + 1) * 32, -50 - row * 18);
        cableTray(root, p.x + 2.5, y + h + 5, p.z, next.x - 2.5, next.z, `RackCable${row}_${col}`);
      }
    }
  }

  for (let i = 0; i < 8; i++) {
    const arch = backdrop.at(-56 + i * 16, -30);
    add(root, geo.box(0.28, 22, 0.28), mat(0x22c55e, { emissive: 0x22c55e, emi: 0.55 }), arch.x, y + 15, arch.z, `DataPylon${i}`);
    const ring = add(root, geo.torus(3.2, 0.1, 8, 32), mat(0x06b6d4, { emissive: 0x06b6d4, emi: 0.72 }), arch.x, y + 24, arch.z, `DataRing${i}`, { rotX: Math.PI / 2 });
    ring.userData.spinRing = 0.35 + i * 0.04;
  }

  for (let t = 0; t < 6; t++) {
    const tp = backdrop.at(-40 + t * 16, -12);
    add(root, geo.box(3.5, 2.8, 0.12), mat('dark_steel'), tp.x, y + 7, tp.z, `HoloScreen${t}`);
    add(root, geo.plane(3.2, 2.4), mat(0x06b6d4, { emissive: 0x22d3ee, emi: 0.75, transparent: true, opacity: 0.82 }), tp.x, y + 7.2, tp.z + 0.12, `HoloTerminal${t}`);
  }
}

/** 5 — Overgrown Monastic Ruins */
export function buildMonasticRuins(g, backdrop, y) {
  const root = new THREE.Group();
  root.name = 'MonasticRuins';
  g.add(root);

  const moss = mossMat();
  const stone = mat('stone', { roughness: 0.9, metalness: 0.02 });
  const ruinBase = backdrop.at(0, -48);

  add(root, geo.box(80, 22, 40), stone, ruinBase.x, y + 11, ruinBase.z, 'CathedralNave');
  add(root, geo.box(80, 4, 42), moss, ruinBase.x, y + 24, ruinBase.z, 'RoofMoss');

  for (let col = 0; col < 5; col++) {
    const cx = ruinBase.x - 32 + col * 16;
    add(root, geo.cylinder(1.3, 1.6, 28, 10), stone, cx, y + 14, ruinBase.z - 18, `Column${col}`);
    add(root, geo.box(3.2, 9, 3.2), moss, cx + 1.8, y + 18, ruinBase.z - 16, `Ivy${col}`);
    add(root, geo.box(2.8, 1.2, 2.8), stone, cx, y + 28.5, ruinBase.z - 18, `ColumnCap${col}`);
  }

  add(root, geo.box(12, 18, 8), stone, ruinBase.x, y + 9, ruinBase.z + 28, 'BellTower');
  add(root, geo.cone(4.5, 7, 8), moss, ruinBase.x, y + 21.5, ruinBase.z + 28, 'TowerMossCap');
  add(root, geo.cylinder(1.8, 2.2, 1.5, 12), brassClearcoat({ emi: 0.08 }), ruinBase.x, y + 20, ruinBase.z + 28, 'BellBronze');

  archRow(root, ruinBase.x, y + 2, ruinBase.z + 12, 6, 10, 8, stone, 'Cloister');

  add(root, geo.torus(4.2, 0.2, 8, 24), stone, ruinBase.x, y + 20, ruinBase.z - 20.5, 'RoseWindowFrame', { rotX: Math.PI / 2 });
  for (let s = 0; s < 6; s++) {
    const ang = (s / 6) * Math.PI * 2;
    add(root, geo.box(0.1, 3.5, 0.1), stone, ruinBase.x + Math.cos(ang) * 2.5, y + 20, ruinBase.z - 20.5 + Math.sin(ang) * 2.5, `RoseSpoke${s}`, { rotY: ang });
  }

  for (let i = 0; i < 8; i++) {
    const r = backdrop.at(-52 + i * 15, -58 - (i % 2) * 14);
    add(root, geo.box(9, 6 + (i % 3) * 4, 7), stone, r.x, y + 4, r.z, `RuinWall${i}`);
    add(root, geo.box(9.5, 1.8, 7.5), moss, r.x, y + 8 + (i % 3) * 2, r.z, `WallMoss${i}`);
  }

  for (let gIdx = 0; gIdx < 6; gIdx++) {
    const gp = backdrop.at(-20 + gIdx * 8, -38);
    add(root, geo.box(1.4, 1.8, 0.35), stone, gp.x, y + 0.9, gp.z, `Gravestone${gIdx}`);
    add(root, geo.box(1.6, 0.25, 0.5), moss, gp.x, y + 1.9, gp.z, `GraveMoss${gIdx}`);
  }
}

/** 6 — Storm-Swept Obsidian Citadel */
export function buildObsidianCitadel(g, backdrop, y) {
  const root = new THREE.Group();
  root.name = 'ObsidianCitadel';
  g.add(root);

  const obsidian = obsidianMat();
  const citadel = backdrop.at(0, -52);

  for (let t = 0; t < 5; t++) {
    const tw = 14 - t * 2;
    const th = 16 + t * 5;
    const tx = citadel.x + (t - 2) * 18;
    const tower = add(root, geo.box(tw, th, tw * 0.82), obsidian, tx, y + th / 2 + t * 2, citadel.z, `ObsidianTower${t}`);
    tower.userData.lightningFlash = true;
    add(root, geo.cone(tw * 0.62, 8.5, 8), obsidian, tx, y + th + 8 + t * 2, citadel.z, `TowerSpire${t}`);
    for (let cren = 0; cren < 6; cren++) {
      add(root, geo.box(1.2, 0.8, 1.2), obsidian, tx - tw / 2 + cren * (tw / 5), y + th + t * 2, citadel.z + tw * 0.35, `Crenellation${t}_${cren}`);
    }
  }

  add(root, geo.box(90, 2.2, 50), obsidian, citadel.x, y + 2.5, citadel.z + 20, 'CitadelWall');
  for (let g = 0; g < 12; g++) {
    add(root, geo.box(2.5, 1.4, 2.5), obsidian, citadel.x - 40 + g * 7.5, y + 4, citadel.z + 44, `WallMerlon${g}`);
  }

  add(root, geo.box(10, 8, 1.2), obsidian, citadel.x, y + 4, citadel.z + 46, 'PortcullisFrame');
  for (let bar = 0; bar < 7; bar++) {
    add(root, geo.cylinder(0.18, 0.18, 7.5, 6), mat('dark_steel', { metalness: 0.9 }), citadel.x - 3 + bar, y + 4, citadel.z + 46.8, `PortcullisBar${bar}`);
  }

  const fog = add(root, geo.plane(300, 80, 4, 2), mat(0x1e1b4b, { transparent: true, opacity: 0.35 }), citadel.x, y + 35, citadel.z - 20, 'StormFogLayer', { rotX: -Math.PI / 2 });
  fog.userData.volumetricFog = true;

  for (let r = 0; r < 48; r++) {
    const rx = citadel.x - 120 + r * 5;
    const streak = add(root, geo.plane(0.08, 12), mat(0x94a3b8, { transparent: true, opacity: 0.18 }), rx, y + 18 + (r % 6) * 4, citadel.z - 8, `RainStreak${r}`);
    streak.userData.rainStreak = 0.4 + (r % 5) * 0.12;
  }

  const wet = pbrMat(0x0f172a, { roughness: 0.08, metalness: 0.65, transparent: true, opacity: 0.45 });
  if (wet.isMeshPhysicalMaterial) {
    wet.clearcoat = 0.9;
    wet.clearcoatRoughness = 0.05;
  }
  const wetFloor = new THREE.Mesh(new THREE.PlaneGeometry(120, 60, 8, 4), wet);
  wetFloor.rotation.x = -Math.PI / 2;
  wetFloor.position.set(citadel.x, y + 0.08, citadel.z + 18);
  wetFloor.name = 'WetFloorReflection';
  root.add(wetFloor);
}

/** 7 — Quantum Reactor Core */
export function buildQuantumReactorCore(g, backdrop, y) {
  const root = new THREE.Group();
  root.name = 'QuantumReactorCore';
  g.add(root);

  const core = backdrop.at(0, -40);
  add(root, geo.cylinder(16, 18, 6, 24), mat('dark_steel', { metalness: 0.82 }), core.x, y + 3, core.z, 'ReactorBase');
  add(root, geo.cylinder(12, 14, 2.5, 24), mat('dark_steel', { metalness: 0.75 }), core.x, y + 6.8, core.z, 'ReactorCollar');

  for (let ring = 0; ring < 4; ring++) {
    const r = 7.5 + ring * 3.2;
    const hexRing = add(root, geo.torus(r, 0.22, 6, 6), mat(0x06b6d4, { emissive: 0x06b6d4, emi: 0.88 }), core.x, y + 8 + ring * 4.2, core.z, `HexRing${ring}`, { rotX: Math.PI / 2 });
    hexRing.userData.spinRing = 0.28 + ring * 0.08;
  }

  for (let i = 0; i < 12; i++) {
    const ang = (i / 12) * Math.PI * 2;
    const hx = core.x + Math.cos(ang) * 14;
    const hz = core.z + Math.sin(ang) * 14;
    hexPrism(root, hx, y + 12, hz, 1.9, 0.4, mat(0xa855f7, { emissive: 0x22d3ee, emi: 0.95 }), `HexCell${i}`, ang);
  }

  const plasma = add(root, geo.sphere(5, 24, 18), mat(0x22d3ee, { emissive: 0x06b6d4, emi: 1.2, transparent: true, opacity: 0.55 }), core.x, y + 14, core.z, 'CorePlasma');
  plasma.userData.pulseCore = true;

  const pylonPositions = [];
  for (let p = 0; p < 8; p++) {
    const ang = (p / 8) * Math.PI * 2;
    const px = core.x + Math.cos(ang) * 22;
    const pz = core.z + Math.sin(ang) * 22;
    pylonPositions.push(new THREE.Vector3(px, y + 12, pz));
    add(root, geo.cylinder(0.35, 0.5, 22, 8), mat('repulsor_violet', { emissive: 0xa855f7, emi: 0.55 }), px, y + 12, pz, `ReactorPylon${p}`);
    add(root, geo.sphere(0.65, 10, 8), mat(0x22d3ee, { emissive: 0x06b6d4, emi: 0.9 }), px, y + 23, pz, `PylonCap${p}`);
  }

  for (let a = 0; a < 8; a++) {
    const from = pylonPositions[a];
    const to = pylonPositions[(a + 2) % 8];
    const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
    mid.y += 4 + (a % 3);
    const curve = new THREE.QuadraticBezierCurve3(from, mid, to);
    const arcGeo = new THREE.TubeGeometry(curve, 24, 0.12, 6, false);
    const arc = new THREE.Mesh(arcGeo, mat(0x06b6d4, { emissive: 0x22d3ee, emi: 0.85, transparent: true, opacity: 0.75 }));
    arc.name = `EnergyArc${a}`;
    root.add(arc);
  }

  hazardStripes(root, core.x, y + 0.4, core.z + 20, 48, 48, 'ReactorHazard');
}

/** 8 — Bioluminescent Deep Trench */
export function buildBioluminescentTrench(g, backdrop, y) {
  const root = new THREE.Group();
  root.name = 'BioluminescentTrench';
  g.add(root);

  const abyss = backdrop.at(0, -45);
  add(root, geo.plane(360, 140, 20, 8), mat(0x020617, { transparent: true, opacity: 0.96 }), abyss.x, y - 4, abyss.z, 'TrenchFloor', { rotX: -Math.PI / 2 });

  const particulates = instancedMesh(
    root,
    new THREE.SphereGeometry(0.09, 4, 4),
    pbrMat(0x22d3ee, { emissive: 0x22d3ee, emi: 0.4, transparent: true, opacity: 0.8 }),
    150,
    (dummy, i) => {
      const p = backdrop.at(-80 + (i % 20) * 8, -30 - Math.floor(i / 20) * 12);
      dummy.position.set(p.x + Math.sin(i * 1.7) * 6, y + 2 + (i % 18) * 1.4, p.z + Math.cos(i * 2.3) * 5);
      dummy.scale.setScalar(0.5 + (i % 7) * 0.18);
    },
    'AbyssParticulates',
  );
  particulates.userData.driftParticles = true;

  const floraColors = [0x22c55e, 0x06b6d4, 0xa855f7];
  for (let i = 0; i < 20; i++) {
    const p = backdrop.at(-72 + (i % 10) * 15, -32 - Math.floor(i / 10) * 22);
    const col = floraColors[i % 3];
    const fanH = 3.5 + (i % 4);
    add(root, geo.cylinder(0.12, 0.45, fanH, 6), mat(col, { emissive: col, emi: 0.62 }), p.x, y + fanH / 2, p.z, `SeaFan${i}`);
    const bell = add(root, geo.sphere(0.85 + (i % 3) * 0.15, 10, 8), mat(col, { emissive: col, emi: 0.88, transparent: true, opacity: 0.82 }), p.x, y + fanH + 0.8, p.z, `JellyfishBell${i}`);
    bell.userData.pulseBio = true;
    for (let tent = 0; tent < 5; tent++) {
      const tang = (tent / 5) * Math.PI * 2;
      add(root, geo.box(0.08, 2.2 + tent * 0.3, 0.08), mat(col, { emissive: col, emi: 0.55 }), p.x + Math.cos(tang) * 0.5, y + fanH - 0.5, p.z + Math.sin(tang) * 0.5, `Tentacle${i}_${tent}`);
    }
  }

  for (let j = 0; j < 8; j++) {
    const vent = backdrop.at(-48 + j * 14, -55);
    add(root, geo.cone(2.2, 5.5, 10), mat(0x06b6d4, { emissive: 0x22d3ee, emi: 0.48, transparent: true, opacity: 0.42 }), vent.x, y + 1.2, vent.z, `ThermalVent${j}`);
    add(root, geo.cylinder(0.6, 1.2, 1.2, 8), mat(0x1e293b, { roughness: 0.9 }), vent.x, y + 0.4, vent.z, `VentBase${j}`);
  }

  for (let f = 0; f < 4; f++) {
    const fp = backdrop.at(-60 + f * 40, -40);
    const fogPlane = add(root, geo.plane(180, 60, 2, 1), mat(0x020617, { transparent: true, opacity: 0.55 }), fp.x, y + 8 + f * 6, fp.z, `DepthFog${f}`, { rotX: -Math.PI / 2 });
    fogPlane.userData.depthFog = true;
  }
}

/** 9 — Victorian Grand Library */
export function buildVictorianGrandLibrary(g, backdrop, y) {
  const root = new THREE.Group();
  root.name = 'VictorianGrandLibrary';
  g.add(root);

  const hall = backdrop.at(0, -42);
  add(root, geo.box(120, 28, 60), mat('stone', { roughness: 0.86 }), hall.x, y + 14, hall.z, 'LibraryHall');
  add(root, geo.box(118, 2.2, 58), mat(0x78350f, { roughness: 0.7 }), hall.x, y + 28.6, hall.z, 'WalnutCeiling');

  for (let shelf = 0; shelf < 8; shelf++) {
    const sx = hall.x - 49 + shelf * 14;
    add(root, geo.box(10.5, 20, 2.2), mat(0x78350f, { roughness: 0.65 }), sx, y + 10, hall.z - 25, `BookStack${shelf}`);
    for (let tier = 0; tier < 8; tier++) {
      add(root, geo.box(9.5, 0.38, 1.8), mat(0x991b1b, { emissive: 0x7f1d1d, emi: 0.08 }), sx, y + 2.5 + tier * 2.4, hall.z - 25, `Books${shelf}_${tier}`);
    }
  }

  for (let col = 0; col < 6; col++) {
    add(root, geo.cylinder(0.85, 1.05, 24, 12), mat('stone'), hall.x - 42 + col * 17, y + 12, hall.z + 22, `LibraryColumn${col}`);
  }

  add(root, geo.box(100, 0.6, 14), mat(0x78350f), hall.x, y + 18, hall.z + 8, 'BalconyDeck');
  for (let rail = 0; rail < 20; rail++) {
    add(root, geo.box(0.12, 1.4, 0.12), mat(0x78350f), hall.x - 48 + rail * 5, y + 19.2, hall.z + 15, `BalconyRail${rail}`);
  }
  add(root, geo.box(100, 1.2, 0.4), mat(0x78350f), hall.x, y + 19.8, hall.z + 15, 'BalconyTopRail');

  const domeColors = [0xdc2626, 0x2563eb, 0xfbbf24, 0x22c55e, 0xa855f7, 0x06b6d4];
  for (let pane = 0; pane < 8; pane++) {
    const ang = (pane / 8) * Math.PI * 2;
    add(root, geo.plane(8, 6), mat(domeColors[pane % 6], { emissive: domeColors[pane % 6], emi: 0.35, transparent: true, opacity: 0.72 }), hall.x + Math.cos(ang) * 2, y + 30, hall.z + Math.sin(ang) * 2, `StainedGlass${pane}`, { rotY: ang, rotX: -0.35 });
  }
  add(root, geo.sphere(6, 16, 8, 0, Math.PI), mat(0x1e293b, { transparent: true, opacity: 0.25 }), hall.x, y + 31, hall.z, 'GlassDomeFrame');

  add(root, geo.cylinder(0.55, 0.65, 8.5, 12), mat(0xfbbf24, { emissive: 0xfbbf24, emi: 0.55 }), hall.x, y + 21, hall.z, 'ChandelierStem');
  for (let l = 0; l < 6; l++) {
    const ang = (l / 6) * Math.PI * 2;
    add(root, geo.sphere(0.38, 8, 6), mat(0xfff3c4, { emissive: 0xfbbf24, emi: 0.72 }), hall.x + Math.cos(ang) * 3.2, y + 17, hall.z + Math.sin(ang) * 3.2, `ChandelierBulb${l}`);
  }

  const dust = instancedMesh(
    root,
    new THREE.SphereGeometry(0.06, 4, 4),
    pbrMat(0xfff3c4, { emissive: 0xfff3c4, emi: 0.22, transparent: true, opacity: 0.7 }),
    350,
    (dummy, i) => {
      dummy.position.set(
        hall.x + (Math.sin(i * 3.17) * 0.5) * 95,
        y + 6 + (Math.cos(i * 2.41) * 0.5 + 0.5) * 20,
        hall.z + (Math.sin(i * 5.03) * 0.5) * 48,
      );
      dummy.scale.setScalar(0.6 + (i % 4) * 0.2);
    },
    'LibraryDustMotes',
  );
  dust.userData.dustMotes = true;

  for (let table = 0; table < 4; table++) {
    const tx = hall.x - 24 + table * 16;
    add(root, geo.box(5, 0.35, 2.8), mat(0x78350f), tx, y + 3.2, hall.z + 4, `ReadingTable${table}`);
    add(root, geo.cylinder(0.06, 0.08, 2.2, 6), mat('dark_steel'), tx + 1.8, y + 4.8, hall.z + 4.8, `TableLampStem${table}`);
    add(root, geo.sphere(0.28, 8, 6), mat(0xfbbf24, { emissive: 0xfbbf24, emi: 0.6 }), tx + 1.8, y + 5.8, hall.z + 4.8, `TableLamp${table}`);
  }
}

/** 10 — Low-Orbit Stealth Carrier */
export function buildLowOrbitStealthCarrier(g, backdrop, y, bounds, curve) {
  const root = new THREE.Group();
  root.name = 'LowOrbitStealthCarrier';
  g.add(root);

  const t = curve?.getPoint?.(0.55) || { x: 0, z: -58 };
  const deckPos = { x: t.x - 10, y: bounds?.floorY ?? y - 6, z: t.z - 58 };
  const hangar = mat('painted_steel', { metalness: 0.78, roughness: 0.22 });
  const scratch = mat('dark_steel', { metalness: 0.85, roughness: 0.18 });

  add(root, geo.box(100, 0.85, 55), hangar, deckPos.x, deckPos.y, deckPos.z, 'CarrierDeck');
  add(root, geo.box(90, 14.5, 3.2), scratch, deckPos.x, deckPos.y + 7.2, deckPos.z - 28, 'HangarBackWall');
  for (let row = 0; row < 3; row++) {
    for (let riv = 0; riv < 12; riv++) {
      add(root, geo.cylinder(0.14, 0.14, 0.18, 6), mat('helipad_yellow'), deckPos.x - 38 + riv * 7, deckPos.y + 4 + row * 4, deckPos.z - 26.5, `HangarRivet${row}_${riv}`);
    }
  }

  [-24, 0, 24].forEach((ox, i) => {
    add(root, geo.cylinder(1.5, 1.9, 2.9, 12), scratch, deckPos.x + ox, deckPos.y + 2.6, deckPos.z - 4, `StealthDrone${i}`);
    add(root, geo.box(5.2, 0.28, 1.5), hangar, deckPos.x + ox, deckPos.y + 3.9, deckPos.z - 3, `DroneWing${i}`);
    add(root, geo.cone(0.8, 2.2, 8), scratch, deckPos.x + ox, deckPos.y + 4.8, deckPos.z - 2, `DroneNose${i}`);
  });

  add(root, geo.box(18, 6.5, 8.5), scratch, deckPos.x + 52, deckPos.y + 1.2, deckPos.z - 35, 'CommandIsland');
  add(root, geo.box(6, 3.5, 4), mat('glass_plasma', { emissive: 0x22d3ee, emi: 0.35, transparent: true, opacity: 0.55 }), deckPos.x + 52, deckPos.y + 5.5, deckPos.z - 35, 'CommandBridge');

  for (let groove = 0; groove < 8; groove++) {
    add(root, geo.box(10, 0.12, 0.35), mat('dark_steel'), deckPos.x - 36 + groove * 10, deckPos.y + 0.48, deckPos.z + 18, `CatapultGroove${groove}`);
  }

  for (let panel = 0; panel < 6; panel++) {
    add(root, geo.box(8, 0.15, 4.5), mat('dark_steel', { metalness: 0.7 }), deckPos.x - 30 + panel * 12, deckPos.y + 0.55, deckPos.z - 12, `SolarPanel${panel}`);
    add(root, geo.box(7.5, 0.05, 4), mat(0x1e3a8a, { emissive: 0x3b82f6, emi: 0.15 }), deckPos.x - 30 + panel * 12, deckPos.y + 0.62, deckPos.z - 12, `SolarCell${panel}`);
  }

  starField(root, deckPos.x, deckPos.y + 55, deckPos.z - 60, 200, { x: 220, y: 80, z: 140 }, 'CarrierStars');

  add(root, geo.plane(400, 120, 4, 2), mat(0x020617, { transparent: true, opacity: 0.88 }), deckPos.x, deckPos.y + 48, deckPos.z - 82, 'EarthLimb', { rotX: -0.22 });
  add(root, geo.sphere(80, 28, 18, 0, Math.PI), mat(0x1e40af, { emissive: 0x3b82f6, emi: 0.1, transparent: true, opacity: 0.28 }), deckPos.x - 120, deckPos.y + 22, deckPos.z - 120, 'PlanetCurve');

  for (let ant = 0; ant < 5; ant++) {
    add(root, geo.cylinder(0.12, 0.18, 6 + ant, 6), mat('painted_steel'), deckPos.x - 20 + ant * 10, deckPos.y + 4 + ant * 0.5, deckPos.z - 42, `AntennaMast${ant}`);
    add(root, geo.box(0.08, 3.5, 0.08), mat('dark_steel'), deckPos.x - 20 + ant * 10, deckPos.y + 8, deckPos.z - 42, `AntennaDish${ant}`, { rotZ: 0.4 });
  }
  add(root, geo.box(14, 0.4, 0.4), mat('dark_steel'), deckPos.x + 30, deckPos.y + 9, deckPos.z - 40, 'AntennaArrayBar');
}
