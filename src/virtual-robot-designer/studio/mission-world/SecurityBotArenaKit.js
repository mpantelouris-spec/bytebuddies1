/**
 * SecurityBotArenaKit — 10 optimistic, kid-friendly Security Bot worlds.
 * Order · safety · intelligence · exploration — never empty, never dystopian.
 */
import * as THREE from 'three';
import { arenaMover } from '../ArenaBuilderCore.js';
import { getSecurityBotArena, SECURITY_BOT_ARENAS } from '../../data/securitybot-arenas.js';

/** Shared optimistic city palette. */
export const SECURITY_CITY_PALETTE = {
  white: 0xf8fafc,
  grey: 0xe2e8f0,
  skyBlue: 0x87ceeb,
  turquoise: 0x22d3ee,
  purple: 0xa855f7,
  green: 0x4ade80,
  orange: 0xfb923c,
  pink: 0xf472b6,
  yellow: 0xfbbf24,
  glass: 0xbae6fd,
};

const MODE_ARENAS = Object.fromEntries(
  Object.entries(SECURITY_BOT_ARENAS).map(([n, a]) => [Number(n), { id: a.id, title: a.title, landmark: a.landmark }]),
);

function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.62,
    metalness: opts.metalness ?? 0.12,
    emissive: opts.emissive ?? 0x000000,
    emissiveIntensity: opts.emissiveIntensity ?? 0,
    transparent: opts.transparent ?? false,
    opacity: opts.opacity ?? 1,
    side: opts.side,
  });
}

function add(g, geo, m, x, y, z, name) {
  const mesh = new THREE.Mesh(geo, m);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (name) mesh.name = name;
  g.add(mesh);
  return mesh;
}

function frame(curve, t, side = 0, y = 0) {
  const p = curve.getPoint(Math.min(0.98, Math.max(0, t)));
  const tan = curve.getTangent(Math.min(0.98, Math.max(0, t))).normalize();
  return {
    point: new THREE.Vector3(p.x + tan.z * side, p.y + y, p.z - tan.x * side),
    yaw: Math.atan2(tan.x, tan.z),
  };
}

function roundedBuilding(g, x, z, w, h, d, seed = 0) {
  const colors = [0xf8fafc, 0xe0f2fe, 0xf5f3ff, 0xecfdf5, 0xfff7ed];
  const accent = [0x22d3ee, 0xa855f7, 0x4ade80, 0xfb923c, 0xf472b6];
  const c = colors[seed % colors.length];
  const a = accent[seed % accent.length];
  const body = add(g, new THREE.BoxGeometry(w, h, d), mat(c, { roughness: 0.45 }), x, h * 0.5, z, `Building${seed}`);
  body.scale.set(1, 1, 1);
  // Rounded top cap
  add(g, new THREE.CylinderGeometry(w * 0.48, w * 0.5, h * 0.12, 12), mat(c), x, h + h * 0.04, z);
  // Blue glass band
  add(g, new THREE.BoxGeometry(w * 0.92, h * 0.35, 0.08), mat(0x7dd3fc, {
    emissive: 0x38bdf8, emissiveIntensity: 0.25, transparent: true, opacity: 0.85,
  }), x, h * 0.55, z + d * 0.5 + 0.05);
  // Purple accent strip
  add(g, new THREE.BoxGeometry(w * 0.15, h * 0.08, d * 0.9), mat(a, { emissive: a, emissiveIntensity: 0.35 }), x, h * 0.82, z);
  // Green roof garden
  add(g, new THREE.BoxGeometry(w * 0.85, 0.25, d * 0.85), mat(0x4ade80, { roughness: 0.9 }), x, h + 0.12, z);
  return body;
}

function cherryTree(g, x, z, seed = 0) {
  const grp = new THREE.Group();
  grp.name = `CherryTree${seed}`;
  grp.position.set(x, 0, z);
  add(grp, new THREE.CylinderGeometry(0.18, 0.28, 2.8, 8), mat(0x92400e, { roughness: 0.95 }), 0, 1.4, 0);
  const blossom = add(grp, new THREE.SphereGeometry(1.6 + (seed % 3) * 0.2, 12, 10), mat(seed % 2 ? 0xfbcfe8 : 0xfda4af, {
    roughness: 0.85,
  }), 0, 3.4, 0);
  blossom.scale.set(1.1, 0.85, 1.1);
  g.add(grp);
  grp.userData.swayTree = true;
  grp.userData.phase = seed * 0.9;
  return grp;
}

function flowerBed(g, x, z, colors = [0xf472b6, 0xfbbf24, 0xa855f7]) {
  const bed = add(g, new THREE.BoxGeometry(3.5, 0.15, 1.8), mat(0x4ade80, { roughness: 0.92 }), x, 0.08, z);
  colors.forEach((c, i) => {
    add(g, new THREE.SphereGeometry(0.12, 6, 5), mat(c, { emissive: c, emissiveIntensity: 0.2 }), x - 1 + i * 0.9, 0.28, z + (i % 2) * 0.3);
  });
  return bed;
}

function simpleNpc(g, x, z, color = 0x60a5fa, seed = 0) {
  const npc = new THREE.Group();
  npc.name = `Npc${seed}`;
  npc.position.set(x, 0, z);
  add(npc, new THREE.CylinderGeometry(0.28, 0.32, 1.1, 8), mat(color), 0, 0.55, 0);
  add(npc, new THREE.SphereGeometry(0.32, 10, 8), mat(0xffe4e6, { roughness: 0.8 }), 0, 1.35, 0);
  g.add(npc);
  npc.userData.walkNpc = true;
  npc.userData.phase = seed * 1.3;
  npc.userData.baseX = x;
  npc.userData.baseZ = z;
  return npc;
}

function deliveryDrone(g, x, y, z, color = 0x22d3ee, seed = 0) {
  const drone = new THREE.Group();
  drone.name = `DeliveryDrone${seed}`;
  drone.position.set(x, y, z);
  add(drone, new THREE.BoxGeometry(0.55, 0.18, 0.55), mat(color, { emissive: color, emissiveIntensity: 0.3 }), 0, 0, 0);
  [-0.45, 0.45].forEach((rx) => {
    [-0.45, 0.45].forEach((rz) => {
      const rotor = add(drone, new THREE.CylinderGeometry(0.22, 0.22, 0.04, 8), mat(0x64748b), rx, 0.12, rz);
      rotor.userData.spinRotor = true;
    });
  });
  g.add(drone);
  drone.userData.flyDrone = true;
  drone.userData.phase = seed;
  return drone;
}

function fountain(g, x, z) {
  const f = new THREE.Group();
  f.name = 'CityFountain';
  f.position.set(x, 0, z);
  add(f, new THREE.CylinderGeometry(2.2, 2.6, 0.5, 16), mat(0xe2e8f0, { roughness: 0.35 }), 0, 0.25, 0);
  add(f, new THREE.CylinderGeometry(0.35, 0.45, 2.2, 10), mat(0xbae6fd, { emissive: 0x38bdf8, emissiveIntensity: 0.2 }), 0, 1.4, 0);
  const pool = add(f, new THREE.CylinderGeometry(1.8, 1.8, 0.08, 16), mat(0x22d3ee, {
    transparent: true, opacity: 0.55, roughness: 0.15, metalness: 0.35,
  }), 0, 0.52, 0);
  pool.userData.splashFountain = true;
  g.add(f);
  return f;
}

function buildBBHeadquarters(g, x, z) {
  const hq = new THREE.Group();
  hq.name = 'ByteBuddiesHQ';
  hq.position.set(x, 0, z);
  // Main tower — rounded white spire
  add(hq, new THREE.CylinderGeometry(4.5, 6, 28, 16), mat(0xf8fafc, { roughness: 0.38 }), 0, 14, 0, 'HQTower');
  add(hq, new THREE.SphereGeometry(5, 16, 12), mat(0xf8fafc), 0, 28, 0, 'HQCap');
  // Observation ring
  add(hq, new THREE.TorusGeometry(5.2, 0.35, 8, 32), mat(0x22d3ee, { emissive: 0x22d3ee, emissiveIntensity: 0.45 }), 0, 22, 0, 'HQRing');
  // BB accent beacon
  add(hq, new THREE.BoxGeometry(2.8, 2.8, 0.3), mat(0xa855f7, { emissive: 0xa855f7, emissiveIntensity: 0.55 }), 0, 18, 5.8, 'HQSign');
  add(hq, new THREE.BoxGeometry(1.2, 1.2, 0.2), mat(0xfbbf24, { emissive: 0xfbbf24, emissiveIntensity: 0.65 }), -0.8, 18.2, 6, 'BBStar');
  g.add(hq);
  hq.userData.landmark = true;
  return hq;
}

function hologramBillboard(g, x, y, z, color = 0x22d3ee, seed = 0) {
  const board = add(g, new THREE.PlaneGeometry(4.5, 2.8), mat(color, {
    emissive: color, emissiveIntensity: 0.55, transparent: true, opacity: 0.82, side: THREE.DoubleSide,
  }), x, y, z, `HoloBoard${seed}`);
  board.userData.pulseHolo = true;
  board.userData.phase = seed;
  return board;
}

function glassBridge(g, x, z, length = 12, yaw = 0) {
  const bridge = new THREE.Group();
  bridge.name = 'GlassBridge';
  bridge.position.set(x, 2.5, z);
  bridge.rotation.y = yaw;
  add(bridge, new THREE.BoxGeometry(length, 0.25, 2.8), mat(0xbae6fd, {
    transparent: true, opacity: 0.55, roughness: 0.12, metalness: 0.2,
  }), 0, 0, 0);
  [-length * 0.45, length * 0.45].forEach((lx, i) => {
    add(bridge, new THREE.CylinderGeometry(0.12, 0.12, 5, 6), mat(0xe2e8f0, { metalness: 0.4 }), lx, -2.5, 0, `BridgePost${i}`);
  });
  g.add(bridge);
  return bridge;
}

function canalWater(g, x, z, length = 18) {
  const water = add(g, new THREE.BoxGeometry(length, 0.12, 3.2), mat(0x22d3ee, {
    transparent: true, opacity: 0.65, roughness: 0.08, metalness: 0.45,
  }), x, 0.06, z, 'Canal');
  water.userData.shimmerWater = true;
  // Lily pads
  for (let i = 0; i < 4; i++) {
    add(g, new THREE.CylinderGeometry(0.35, 0.35, 0.04, 8), mat(0x4ade80), x - length * 0.3 + i * 2.5, 0.14, z + (i % 2 ? 0.6 : -0.6));
  }
  return water;
}

function monorail(g, curve, height = 14) {
  const pts = [];
  for (let i = 0; i <= 24; i++) {
    const p = curve.getPoint(i / 24);
    pts.push(new THREE.Vector3(p.x + 22, height, p.z - 8));
  }
  const rail = add(g, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.08, 6, false), mat(0x94a3b8, { metalness: 0.65 }), 0, 0, 0, 'MonorailTrack');
  const train = new THREE.Group();
  train.name = 'MonorailTrain';
  const mid = curve.getPoint(0.35);
  train.position.set(mid.x + 22, height, mid.z - 8);
  add(train, new THREE.BoxGeometry(5, 1.8, 2.2), mat(0xf8fafc, { metalness: 0.35 }), 0, 0, 0);
  add(train, new THREE.BoxGeometry(4.2, 1.2, 2), mat(0x7dd3fc, { transparent: true, opacity: 0.7 }), 0, 0.5, 0);
  g.add(train);
  train.userData.rideMonorail = true;
  return rail;
}

function patrolArch(g, curve, color = 0x22d3ee) {
  const start = curve.getPoint(0);
  const arch = new THREE.Group();
  arch.name = 'SecurityPatrolArch';
  arch.position.set(start.x, 0, start.z - 2);
  [-3.5, 3.5].forEach((sx, i) => {
    add(arch, new THREE.CylinderGeometry(0.35, 0.45, 5.5, 10), mat(0xf8fafc), sx, 2.75, 0, `ArchPost${i}`);
  });
  add(arch, new THREE.TorusGeometry(3.8, 0.28, 10, 24, Math.PI), mat(color, { emissive: color, emissiveIntensity: 0.4 }), 0, 5.8, 0, 'ArchTop');
  arch.children[arch.children.length - 1].rotation.z = Math.PI;
  add(arch, new THREE.PlaneGeometry(3, 0.8), mat(0x38bdf8, { emissive: 0x38bdf8, emissiveIntensity: 0.5 }), 0, 4.2, 0.5, 'ScanHolo');
  g.add(arch);
  return arch;
}

function hiddenTunnelHint(g, x, z) {
  const tunnel = add(g, new THREE.BoxGeometry(2.5, 2.2, 1.2), mat(0x64748b, { emissive: 0x22d3ee, emissiveIntensity: 0.15 }), x, 1.1, z, 'HiddenTunnel');
  add(g, new THREE.PlaneGeometry(1.8, 0.5), mat(0x22d3ee, { emissive: 0x22d3ee, emissiveIntensity: 0.45 }), x, 2.5, z + 0.62, 'TunnelSign');
  return tunnel;
}

function rooftopGarden(g, x, z, y = 8) {
  const roof = new THREE.Group();
  roof.name = 'RooftopGarden';
  roof.position.set(x, y, z);
  add(roof, new THREE.BoxGeometry(6, 0.3, 5), mat(0x4ade80, { roughness: 0.9 }), 0, 0, 0);
  cherryTree(roof, -1.5, 0, 10);
  cherryTree(roof, 1.5, -1, 11);
  flowerBed(roof, 0, 1.5);
  g.add(roof);
  return roof;
}

function welcomeSign(g, x, z, title = 'NEO CITY') {
  const sign = new THREE.Group();
  sign.name = 'WelcomeSign';
  sign.position.set(x, 0, z);
  add(sign, new THREE.BoxGeometry(5.5, 3.2, 0.35), mat(0xf8fafc, { roughness: 0.4 }), 0, 1.6, 0);
  add(sign, new THREE.PlaneGeometry(4.8, 1.4), mat(0x22d3ee, {
    emissive: 0x22d3ee, emissiveIntensity: 0.55, side: THREE.DoubleSide,
  }), 0, 2.1, 0.2, 'WelcomeHolo');
  g.add(sign);
  return sign;
}

/** Mode 1 — Neo City Central */
function buildNeoCityCentral(g, scene, curve) {
  const spawn = curve.getPoint(0.08);
  const hqAnchor = curve.getPoint(0.42);
  buildBBHeadquarters(g, hqAnchor.x, hqAnchor.z - 28);
  patrolArch(g, curve, 0x22d3ee);
  welcomeSign(g, spawn.x + 10, spawn.z - 6, 'NEO CITY');

  for (let i = 0; i < 14; i++) {
    const t = 0.05 + (i / 13) * 0.88;
    const { point, yaw } = frame(curve, t, 0);
    const side = 9 + (i % 4) * 2;
    const left = frame(curve, t, -side);
    const right = frame(curve, t, side);
    roundedBuilding(g, left.point.x, left.point.z, 5 + (i % 3), 8 + (i % 4) * 2, 5 + (i % 2), i);
    roundedBuilding(g, right.point.x, right.point.z, 4 + (i % 2), 6 + (i % 3) * 2, 4 + (i % 3), i + 20);
    if (i % 2 === 0) cherryTree(g, left.point.x - 3, left.point.z, i);
    if (i % 3 === 1) flowerBed(g, right.point.x + 2, right.point.z);
    if (i % 4 === 0) simpleNpc(g, point.x + (i % 3 - 1) * 4, point.z - 6, [0x60a5fa, 0xf472b6, 0x4ade80][i % 3], i);
    if (i % 3 === 2) deliveryDrone(g, left.point.x, 6 + (i % 2), left.point.z - 4, 0x22d3ee, i);
    if (i === 3) fountain(g, point.x + 12, point.z - 8);
    if (i === 7) canalWater(g, point.x, point.z + 14, 16);
    if (i === 5) glassBridge(g, point.x - 10, point.z + 10, 10, yaw);
    if (i === 9) hologramBillboard(g, right.point.x, 5, right.point.z + 2.5, 0xa855f7, i);
    if (i === 11) hiddenTunnelHint(g, left.point.x - 2, left.point.z);
    if (i === 12) rooftopGarden(g, right.point.x, right.point.z, 9);
  }

  monorail(g, curve);
  // Gentle hills along route edges
  [-35, 35].forEach((x, i) => {
    const hill = add(g, new THREE.SphereGeometry(12, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2.2), mat(0x86efac, { roughness: 0.95 }), x, -1.5, -40 - i * 15);
    hill.scale.set(1.4, 0.45, 1);
  });
  // Warm golden afternoon sun rig
  if (!scene.getObjectByName('SecurityCitySun')) {
    const sun = new THREE.DirectionalLight(0xfff4e0, 1.1);
    sun.name = 'SecurityCitySun';
    sun.position.set(40, 55, 25);
    scene.add(sun);
  }
}

/** Mode 2 — International Airport */
function buildInternationalAirport(g, scene, curve) {
  const tower = new THREE.Group();
  tower.name = 'AirportControlTower';
  tower.position.set(25, 0, -70);
  add(tower, new THREE.CylinderGeometry(2.5, 3.5, 22, 12), mat(0xf8fafc), 0, 11, 0);
  add(tower, new THREE.CylinderGeometry(4, 4, 1.2, 12), mat(0x7dd3fc, { emissive: 0x38bdf8, emissiveIntensity: 0.3 }), 0, 22.5, 0);
  g.add(tower);

  // Curved glass roof terminal
  const mid = curve.getPoint(0.4);
  add(g, new THREE.BoxGeometry(45, 8, 22), mat(0xe0f2fe, { roughness: 0.35 }), mid.x, 4, mid.z - 18, 'TerminalRoof');
  add(g, new THREE.BoxGeometry(42, 6, 0.15), mat(0x7dd3fc, { transparent: true, opacity: 0.45 }), mid.x, 6, mid.z - 6.8, 'GlassRoof');

  for (let i = 0; i < 10; i++) {
    const t = 0.06 + i * 0.085;
    const { point } = frame(curve, t, 0);
    if (i % 2 === 0) {
      add(g, new THREE.BoxGeometry(8, 1.2, 3), mat(0xfbbf24, { emissive: 0xfbbf24, emissiveIntensity: 0.2 }), point.x + 14, 0.6, point.z - 10, `RunwayLight${i}`);
    }
    if (i % 3 === 0) {
      const plane = new THREE.Group();
      plane.position.set(point.x - 20, 0.8, point.z - 22);
      add(plane, new THREE.BoxGeometry(8, 1.2, 2.5), mat(0xf8fafc, { metalness: 0.4 }), 0, 0, 0);
      add(plane, new THREE.BoxGeometry(12, 0.3, 1.8), mat(0x94a3b8, { metalness: 0.5 }), 0, 0.2, 0);
      plane.name = `TaxiingPlane${i}`;
      plane.userData.taxiPlane = true;
      plane.userData.phase = i;
      g.add(plane);
    }
    add(g, new THREE.BoxGeometry(6, 0.15, 1.2), mat(0xe2e8f0, { metalness: 0.35 }), point.x, 0.08, point.z + 8, `MovingWalkway${i}`);
    simpleNpc(g, point.x + 5, point.z + 4, 0x60a5fa, i + 30);
    if (i === 4) {
      const board = add(g, new THREE.BoxGeometry(5, 2.5, 0.2), mat(0x1e293b), point.x + 8, 3, point.z + 2, 'DepartureBoard');
      add(g, new THREE.PlaneGeometry(4.5, 2), mat(0x22d3ee, { emissive: 0x22d3ee, emissiveIntensity: 0.5 }), point.x + 8, 3.2, point.z + 2.15);
    }
    if (i === 7) hiddenTunnelHint(g, point.x - 6, point.z + 10);
  }
}

/** Mode 3 — National Museum */
function buildNationalMuseum(g, scene, curve) {
  add(g, new THREE.BoxGeometry(50, 12, 30), mat(0xf1f5f9, { roughness: 0.32 }), 0, 6, -55, 'MuseumFacade');
  // Skylight strips
  for (let i = -4; i <= 4; i++) {
    add(g, new THREE.BoxGeometry(3, 0.12, 8), mat(0xfffbeb, { emissive: 0xfbbf24, emissiveIntensity: 0.25 }), i * 5, 12.2, -55);
  }
  // Dinosaur skeleton hero
  const dino = new THREE.Group();
  dino.name = 'DinosaurSkeleton';
  dino.position.set(0, 0, -35);
  add(dino, new THREE.CylinderGeometry(0.4, 0.5, 8, 8), mat(0xe2e8f0, { metalness: 0.35 }), 0, 4, 0);
  add(dino, new THREE.SphereGeometry(1.2, 10, 8), mat(0xe2e8f0, { metalness: 0.35 }), 0, 8.5, 3);
  add(dino, new THREE.CylinderGeometry(0.15, 0.15, 5, 6), mat(0xe2e8f0, { metalness: 0.35 }), 2, 6, -1);
  add(dino, new THREE.CylinderGeometry(0.15, 0.15, 5, 6), mat(0xe2e8f0, { metalness: 0.35 }), -2, 6, -1);
  g.add(dino);

  for (let i = 0; i < 8; i++) {
    const t = 0.08 + i * 0.1;
    const { point } = frame(curve, t, 0);
    add(g, new THREE.BoxGeometry(2.2, 1.6, 1.2), mat(0xf8fafc), point.x + 7, 0.8, point.z, `DisplayCase${i}`);
    add(g, new THREE.BoxGeometry(2, 1.4, 0.08), mat(0xbae6fd, { transparent: true, opacity: 0.35 }), point.x + 7, 1.5, point.z + 0.65);
    if (i % 2 === 0) {
      const holo = add(g, new THREE.ConeGeometry(0.5, 1.2, 5), mat(0xa855f7, { emissive: 0xa855f7, emissiveIntensity: 0.45 }), point.x - 6, 1.2, point.z, `HoloExhibit${i}`);
      holo.userData.spinHolo = true;
    }
    if (i === 5) {
      // Laser security grid
      for (let b = 0; b < 3; b++) {
        add(g, new THREE.CylinderGeometry(0.03, 0.03, 6, 4), mat(0xef4444, { emissive: 0xef4444, emissiveIntensity: 1.2 }), point.x, 0.5 + b * 0.5, point.z + 3);
      }
    }
    if (i === 6) hiddenTunnelHint(g, point.x - 4, point.z - 5);
  }
}

/** Mode 4 — Airport security gates */
function buildAirportGates(g, scene, curve) {
  buildInternationalAirport(g, scene, curve);
  for (let i = 0; i < 5; i++) {
    const t = 0.15 + i * 0.15;
    const { point, yaw } = frame(curve, t, 0);
    const gate = new THREE.Group();
    gate.position.copy(point);
    gate.rotation.y = yaw;
    [-2, 2].forEach((sx, j) => {
      add(gate, new THREE.BoxGeometry(0.4, 2.8, 0.4), mat(0x94a3b8, { metalness: 0.5 }), sx, 1.4, 0, `GatePost${j}`);
    });
    add(gate, new THREE.BoxGeometry(4.5, 0.12, 0.5), mat(0x4ade80, { emissive: 0x22c55e, emissiveIntensity: 0.4 }), 0, 0.8, 0, 'ScannerPad');
    add(gate, new THREE.PlaneGeometry(1.2, 1.2), mat(0x22d3ee, { emissive: 0x22d3ee, emissiveIntensity: 0.55 }), 0, 2.2, 0.3, 'IdHologram');
    g.add(gate);
  }
}

/** Mode 5 — Secret robotics lab search */
function buildRoboticsLab(g, scene, curve) {
  add(g, new THREE.BoxGeometry(40, 14, 8), mat(0x1e293b, { roughness: 0.55 }), 0, 7, -60, 'LabWall');
  const core = add(g, new THREE.CylinderGeometry(2.5, 3, 10, 16), mat(0x22d3ee, {
    emissive: 0x22d3ee, emissiveIntensity: 0.55, transparent: true, opacity: 0.85,
  }), 0, 5, -45, 'AICore');
  core.userData.pulseCore = true;

  for (let i = 0; i < 10; i++) {
    const t = 0.05 + i * 0.09;
    const left = frame(curve, t, -8);
    const right = frame(curve, t, 8);
    add(g, new THREE.BoxGeometry(1.2, 6, 4), mat(0x475569), left.point.x, 3, left.point.z, `LabShelfL${i}`);
    add(g, new THREE.BoxGeometry(1.2, 6, 4), mat(0x475569), right.point.x, 3, right.point.z, `LabShelfR${i}`);
    add(g, new THREE.BoxGeometry(1.5, 1.2, 1.2), mat(0x64748b), left.point.x + 0.5, 1.5, left.point.z, `Crate${i}`);
    if (i % 2 === 0) {
      const beam = new THREE.SpotLight(0xfff4d6, 0.8, 14, 0.5, 0.7);
      beam.position.set(left.point.x, 5.5, left.point.z + 2);
      beam.target.position.set(left.point.x, 0, left.point.z);
      g.add(beam, beam.target);
    }
    if (i === 6) add(g, new THREE.BoxGeometry(3, 2.5, 2), mat(0x334155, { emissive: 0x38bdf8, emissiveIntensity: 0.2 }), left.point.x - 3, 1.25, left.point.z, 'TestingChamber');
  }
}

/** Mode 6 — Grand Sports Stadium */
function buildGrandStadium(g, scene, curve) {
  const bowl = add(g, new THREE.CylinderGeometry(38, 42, 8, 32, 1, true), mat(0xf8fafc, { side: THREE.DoubleSide }), 0, 4, -40, 'StadiumBowl');
  for (let tier = 0; tier < 4; tier++) {
    const tierRing = add(g, new THREE.TorusGeometry(34 - tier * 3, 0.8, 6, 48, Math.PI), mat(tier % 2 ? 0x3b82f6 : 0xef4444, {
      emissive: tier % 2 ? 0x3b82f6 : 0xef4444, emissiveIntensity: 0.15,
    }), 0, 2 + tier * 1.5, -40, `CrowdTier${tier}`);
    tierRing.rotation.x = Math.PI / 2;
  }
  add(g, new THREE.BoxGeometry(50, 0.4, 30), mat(0x4ade80, { roughness: 0.88 }), 0, 0.2, -40, 'Pitch');
  for (let i = 0; i < 8; i++) {
    const t = 0.08 + i * 0.1;
    const { point } = frame(curve, t, 0);
    add(g, new THREE.CylinderGeometry(0.25, 0.25, 1.1, 6), mat(0xfb923c), point.x + (i % 3 - 1) * 3, 0.55, point.z, `Cone${i}`);
    add(g, new THREE.BoxGeometry(3, 0.08, 0.06), mat(0xfbbf24), point.x, 0.9, point.z + 2, `BarrierTape${i}`);
    if (i % 2 === 0) simpleNpc(g, point.x + 6, point.z, 0xf472b6, i + 50);
    if (i === 3) add(g, new THREE.CylinderGeometry(0.15, 0.15, 12, 6), mat(0xfbbf24, { emissive: 0xfbbf24, emissiveIntensity: 0.6 }), point.x + 20, 6, point.z - 15, 'Floodlight');
  }
}

/** Mode 7 — Music Festival */
function buildMusicFestival(g, scene, curve) {
  const stage = new THREE.Group();
  stage.name = 'ConcertStage';
  stage.position.set(0, 0, -55);
  add(stage, new THREE.BoxGeometry(18, 6, 4), mat(0x1e293b), 0, 3, 0);
  add(stage, new THREE.BoxGeometry(16, 0.4, 8), mat(0x4ade80), 0, 0.2, 6);
  [-6, 6].forEach((x) => add(stage, new THREE.CylinderGeometry(0.08, 0.08, 10, 6), mat(0x64748b), x, 5, 0));
  g.add(stage);

  add(g, new THREE.CylinderGeometry(8, 8, 0.3, 24), mat(0xf472b6, { emissive: 0xf472b6, emissiveIntensity: 0.2 }), 25, 0.15, -30, 'FerrisBase');
  add(g, new THREE.TorusGeometry(7, 0.35, 8, 24), mat(0x22d3ee, { emissive: 0x22d3ee, emissiveIntensity: 0.35 }), 25, 8, -30, 'FerrisWheel');

  for (let i = 0; i < 9; i++) {
    const t = 0.06 + i * 0.095;
    const { point } = frame(curve, t, 0);
    if (i % 2 === 0) add(g, new THREE.ConeGeometry(1.8, 2.5, 4), mat([0xf472b6, 0x60a5fa, 0xfbbf24][i % 3]), point.x + 12, 1.25, point.z - 8, `FoodTruck${i}`);
    if (i % 3 === 1) {
      const tent = add(g, new THREE.ConeGeometry(2.5, 3.5, 4), mat(0xa855f7, { emissive: 0xa855f7, emissiveIntensity: 0.15 }), point.x - 10, 1.75, point.z, `CampTent${i}`);
      tent.rotation.y = i;
    }
    if (i === 5) {
      const alarm = add(g, new THREE.BoxGeometry(1.8, 1.2, 0.3), mat(0xef4444, { emissive: 0xef4444, emissiveIntensity: 0.8 }), point.x, 2.5, point.z + 3, 'AlarmPanel');
      alarm.userData.blinkAlarm = true;
    }
    simpleNpc(g, point.x + (i % 4 - 2) * 2, point.z + 4, 0x4ade80, i + 60);
  }
}

/** Mode 8 — Luxury shopping + CCTV */
function buildLuxuryMall(g, scene, curve) {
  add(g, new THREE.BoxGeometry(35, 18, 2), mat(0xbae6fd, { transparent: true, opacity: 0.35 }), 0, 9, -58, 'GlassSkylight');
  add(g, new THREE.BoxGeometry(4, 12, 4), mat(0xf8fafc, { metalness: 0.25 }), -12, 6, -50, 'GlassElevator');
  const waterfall = add(g, new THREE.BoxGeometry(3, 8, 0.5), mat(0x22d3ee, { transparent: true, opacity: 0.5 }), 10, 4, -48, 'IndoorWaterfall');
  waterfall.userData.flowWater = true;

  for (let i = 0; i < 8; i++) {
    const t = 0.08 + i * 0.1;
    const { point } = frame(curve, t, 0);
    add(g, new THREE.BoxGeometry(4, 3.5, 2), mat(0xf8fafc), point.x + 9, 1.75, point.z, `ShopFront${i}`);
    add(g, new THREE.PlaneGeometry(3.5, 2.5), mat(0xf472b6, { emissive: 0xf472b6, emissiveIntensity: 0.25 }), point.x + 9, 2.5, point.z + 1.05, `ShopWindow${i}`);
    if (i === 2) {
      const wall = new THREE.Group();
      wall.position.set(point.x - 10, 2.5, point.z);
      for (let s = 0; s < 9; s++) {
        add(wall, new THREE.PlaneGeometry(1.4, 1), mat(s === 4 ? 0x22c55e : 0x1e293b, {
          emissive: s === 4 ? 0x22c55e : 0x334155, emissiveIntensity: s === 4 ? 0.5 : 0.15,
        }), (s % 3) * 1.5 - 1.5, Math.floor(s / 3) * -1.1, 0, `Monitor${s}`);
      }
      g.add(wall);
    }
    deliveryDrone(g, point.x, 5, point.z - 6, 0xa855f7, i);
  }
}

/** Mode 9 — Robotics vault */
function buildRoboticsVault(g, scene, curve) {
  const vault = add(g, new THREE.CylinderGeometry(5, 5, 4, 24), mat(0x64748b, { metalness: 0.55 }), 0, 2, -42, 'VaultDoor');
  add(g, new THREE.TorusGeometry(2.2, 0.25, 8, 24), mat(0xfbbf24, { emissive: 0xfbbf24, emissiveIntensity: 0.45 }), 0, 2.5, -39.2, 'VaultWheel');
  for (let i = 0; i < 6; i++) {
    const t = 0.1 + i * 0.13;
    const { point } = frame(curve, t, 0);
    add(g, new THREE.CylinderGeometry(0.8, 0.8, 3.5, 12), mat(0x22d3ee, {
      emissive: 0x22d3ee, emissiveIntensity: 0.45, transparent: true, opacity: 0.75,
    }), point.x + 6, 1.75, point.z, `EnergyTube${i}`);
    add(g, new THREE.BoxGeometry(2.5, 2, 2), mat(0x475569), point.x - 7, 1, point.z, `PrototypePod${i}`);
    for (let b = 0; b < 4; b++) {
      add(g, new THREE.CylinderGeometry(0.025, 0.025, 5, 4), mat(0xef4444, { emissive: 0xef4444, emissiveIntensity: 1.1 }), point.x + b * 0.8 - 1.2, 0.4, point.z + 2.5);
    }
    if (i === 4) add(g, new THREE.BoxGeometry(5, 3, 0.12), mat(0xbae6fd, { transparent: true, opacity: 0.35 }), point.x, 2, point.z - 5, 'ObservationGlass');
  }
}

/** Mode 10 — Smart City Emergency Centre */
function buildEmergencyCentre(g, scene, curve) {
  const cmd = new THREE.Group();
  cmd.name = 'EmergencyCommandWall';
  cmd.position.set(0, 4, -58);
  for (let s = 0; s < 12; s++) {
    add(cmd, new THREE.PlaneGeometry(2.2, 1.6), mat([0x22d3ee, 0x4ade80, 0xfbbf24, 0xf472b6][s % 4], {
      emissive: [0x22d3ee, 0x4ade80, 0xfbbf24, 0xf472b6][s % 4], emissiveIntensity: 0.35,
    }), (s % 4) * 2.5 - 3.75, Math.floor(s / 4) * -1.8, 0, `HoloDisplay${s}`);
  }
  g.add(cmd);

  for (let i = 0; i < 10; i++) {
    const t = 0.05 + i * 0.09;
    const { point } = frame(curve, t, 0);
    if (i % 2 === 0) {
      const bay = add(g, new THREE.BoxGeometry(4, 3, 5), mat(0x334155, { emissive: 0x38bdf8, emissiveIntensity: 0.15 }), point.x + 14, 1.5, point.z - 6, `DroneBay${i}`);
      deliveryDrone(g, point.x + 14, 4, point.z - 6, 0x22d3ee, i + 80);
    }
    add(g, new THREE.BoxGeometry(3, 2.5, 2), mat([0xef4444, 0x3b82f6, 0x22c55e][i % 3]), point.x - 12, 1.25, point.z, `EmergencyHQ${i}`);
    simpleNpc(g, point.x, point.z + 5, 0x60a5fa, i + 90);
    if (i === 6) {
      add(g, new THREE.PlaneGeometry(20, 8), mat(0x1e293b, { emissive: 0x334155, emissiveIntensity: 0.2 }), 0, 6, -70, 'RainWindow');
    }
  }
  buildBBHeadquarters(g, 30, -80);
}

const BUILDERS = {
  1: buildNeoCityCentral,
  2: buildInternationalAirport,
  3: buildNationalMuseum,
  4: buildAirportGates,
  5: buildRoboticsLab,
  6: buildGrandStadium,
  7: buildMusicFestival,
  8: buildLuxuryMall,
  9: buildRoboticsVault,
  10: buildEmergencyCentre,
};

export function getSecurityBotModeSpec(challenge) {
  if (challenge?.chassisId !== 'securitybot') return null;
  const mode = Math.max(1, Math.min(10, Number(challenge.modeIndex || challenge.modeSpec?.modeNumber) || 1));
  return MODE_ARENAS[mode] || MODE_ARENAS[1];
}

export function installSecurityBotChapter(scene, challenge, curve) {
  if (challenge?.chassisId !== 'securitybot' || !curve) return false;

  const mode = Math.max(1, Math.min(10, Number(challenge.modeIndex || challenge.modeSpec?.modeNumber) || 1));
  const existing = scene.getObjectByName('SecurityBotArena');
  if (existing) {
    if (existing.userData.securityBotMode === mode) return true;
    scene.remove(existing);
  }
  const spec = MODE_ARENAS[mode];
  const root = new THREE.Group();
  root.name = 'SecurityBotArena';
  root.userData.premiumEnvironment = spec.id;
  root.userData.artDirected = true;
  root.userData.securityBotMode = mode;

  const builder = BUILDERS[mode] || BUILDERS[1];
  builder(root, scene, curve);

  scene.add(root);
  scene.userData.securityBotWorld = true;
  scene.userData.securityBotMode = mode;
  scene.userData.horizonKey = 'sky_aerial';
  scene.userData.skipSoftEnvironment = true;
  scene.background = new THREE.Color(0x87ceeb);
  if (scene.fog) {
    scene.fog.color.setHex(0xb8d4e8);
    scene.fog.near = 55;
    scene.fog.far = 165;
  }

  arenaMover(scene, (time) => animateSecurityBotWorld(scene, time));
  return true;
}

export function animateSecurityBotWorld(scene, time) {
  scene.traverse((obj) => {
    if (obj.userData?.swayTree) {
      obj.rotation.z = Math.sin(time * 0.9 + (obj.userData.phase ?? 0)) * 0.04;
    }
    if (obj.userData?.walkNpc) {
      obj.position.x = obj.userData.baseX + Math.sin(time * 0.7 + obj.userData.phase) * 1.2;
      obj.position.z = obj.userData.baseZ + Math.cos(time * 0.55 + obj.userData.phase) * 0.8;
    }
    if (obj.userData?.flyDrone) {
      obj.position.y = 5 + Math.sin(time * 1.4 + obj.userData.phase) * 1.5;
      obj.position.x += Math.sin(time * 0.3 + obj.userData.phase) * 0.003;
    }
    if (obj.userData?.spinRotor) obj.rotation.y = time * 8;
    if (obj.userData?.pulseHolo && obj.material) {
      obj.material.emissiveIntensity = 0.35 + Math.sin(time * 2.5 + (obj.userData.phase ?? 0)) * 0.2;
    }
    if (obj.userData?.pulseCore && obj.material) {
      obj.material.emissiveIntensity = 0.4 + Math.sin(time * 1.8) * 0.25;
    }
    if (obj.userData?.blinkAlarm && obj.material) {
      obj.material.emissiveIntensity = 0.5 + Math.sin(time * 5) * 0.45;
    }
    if (obj.userData?.spinHolo) obj.rotation.y = time * 0.8;
    if (obj.userData?.taxiPlane) {
      obj.position.x += Math.sin(time * 0.2 + obj.userData.phase) * 0.008;
    }
    if (obj.userData?.rideMonorail) {
      obj.position.x += Math.sin(time * 0.15) * 0.012;
    }
    if (obj.userData?.shimmerWater && obj.material) {
      obj.material.opacity = 0.55 + Math.sin(time * 1.5) * 0.08;
    }
    if (obj.userData?.flowWater && obj.material) {
      obj.material.opacity = 0.45 + Math.sin(time * 2) * 0.12;
    }
    if (obj.userData?.splashFountain) {
      obj.scale.y = 1 + Math.sin(time * 3) * 0.06;
    }
  });
}

export function getSecurityBotSky() {
  return { top: '#4fc3f7', mid: '#87ceeb', horizon: '#ffe8b0', fog: '#b8d4e8', near: 55, far: 165 };
}
