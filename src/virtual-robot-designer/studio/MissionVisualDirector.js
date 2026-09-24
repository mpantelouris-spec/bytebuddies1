/**
 * MissionVisualDirector — Bible v2: visualDescription + arenaSetup → route hero geometry.
 * Auto-presets all 360 chassis modes from game-mode-specifications.js.
 */
import * as THREE from 'three';
import { GAME_MODE_SPECS_BY_ID } from '../data/game-mode-specifications.js';
import { getMissionArtDirection } from './mission-world/MissionVisualBibleV2.js';
import { arenaMover } from './ArenaBuilderCore.js';
import {
  addMudPuddle, addLogBridge, addDeliveryZone, addFuelStation, addTrafficLight,
  addSlalomGate, addBoulder, addRainbowRail, addGrandstand, addParkingBay,
  addMountainPeak, addTargetMarker, addTowTruck, addCoralCluster, addNeonRingGate,
  addLaserGridPair, addTree, addMartianRock, addConveyor, addWarehouseShelf,
  addCrystalFormation,
} from './ArenaSceneryKit.js';

const RAINBOW_COLORS = [0xef4444, 0xf97316, 0xfbbf24, 0x22c55e, 0x3b82f6, 0x6366f1, 0xa855f7];

const ENVIRONMENT_TAGS = {
  underwater: ['coral', 'underwater', 'deep'],
  emergency: ['hospital', 'fire', 'rescue'],
  sky_aerial: ['ring', 'cloud', 'jet'],
  cyber_ninja: ['laser', 'stealth', 'museum', 'cyber'],
  industrial: ['factory', 'warehouse', 'conveyor'],
  martian: ['martian', 'mountain', 'rocky'],
  spider_climber: ['web', 'pipe', 'climb'],
  sandbox: ['checkpoint'],
  hybrid_race_sky: ['ring', 'rainbow', 'hover'],
  flappy: ['bird', 'flappy_pipe'],
  football: ['football'],
  boxing_mech: ['boxing', 'combat', 'colosseum'],
  rainbow_road: ['rainbow', 'grandstand'],
};

const TYPE_TAGS = {
  Race: ['grandstand', 'slalom'],
  Exploration: ['forest', 'checkpoint'],
  Science: ['target', 'crystal'],
  Rescue: ['rescue', 'hospital'],
  Stealth: ['stealth', 'laser'],
  Combat: ['combat', 'boxing'],
  Navigation: ['ring', 'checkpoint'],
  Climb: ['climb', 'mountain'],
  Survival: ['storm', 'fire'],
  Hybrid: ['capstone'],
  Mastery: ['capstone', 'grandstand'],
  Boss: ['boss', 'colosseum'],
};

const PROP_TAG_MAP = {
  dune_markers: ['desert', 'sand'],
  dunes: ['desert', 'sand'],
  ruin_pillars: ['temple', 'pillar'],
  pillars: ['temple', 'pillar'],
  tent: ['camp', 'desert'],
  camps: ['camp', 'rescue'],
  sandstorm: ['sandstorm', 'desert'],
  spikes: ['spikes'],
  sentinel: ['sentinel'],
  tomb: ['temple', 'boss'],
};

function mat(col, emissive = 0, ei = 0, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color: col, emissive: emissive || col, emissiveIntensity: ei,
    roughness: opts.roughness ?? 0.85, ...opts,
  });
}

function detectVisualTags(text = '') {
  const t = text.toLowerCase();
  const tags = [];
  const push = (tag) => { if (!tags.includes(tag)) tags.push(tag); };

  if (/mud puddle|murky|swamp|slippery|bog/.test(t)) push('mud');
  if (/log bridge|fallen tree|stream crossing|narrow bridge/.test(t)) push('log_bridge');
  if (/mountain|uphill|steep|incline|peak|elevation|summit/.test(t)) push('mountain');
  if (/rocky|boulder|rocks protrude|rock field/.test(t)) push('rocky', 'boulder');
  if (/rainbow/.test(t)) push('rainbow');
  if (/delivery zone|cargo|relay|pickup zone/.test(t)) push('delivery');
  if (/fuel station|refuel|fuel gauge|gas pump/.test(t)) push('fuel');
  if (/traffic light|red\/green|stop light/.test(t)) push('traffic');
  if (/slalom gate|gate counter|pylon/.test(t)) push('slalom');
  if (/grandstand|championship|spectator|crowd|arena lights/.test(t)) push('grandstand');
  if (/parking|parking lot|parking space/.test(t)) push('parking');
  if (/hidden target|target marker|beacon target/.test(t)) push('target');
  if (/tow|towing rope|disabled truck|haul/.test(t)) push('tow');
  if (/coral|reef|kelp|bioluminescent|seagrass/.test(t)) push('coral');
  if (/ring gate|neon ring|flight ring|aerial gate/.test(t)) push('ring');
  if (/laser (barrier|grid)|laser beam|laser wall/.test(t)) push('laser');
  if (/hospital|corridor|ward|triage|medical bay/.test(t)) push('hospital');
  if (/forest|vegetation|trees|jungle|canopy/.test(t)) push('forest');
  if (/martian|alien|crater|red planet|dust storm/.test(t)) push('martian');
  if (/underwater|submerged|depth|pressure hull|sonar/.test(t)) push('underwater');
  if (/spider|web|crawl|pipeline/.test(t)) push('web', 'pipe');
  if (/museum|heist|artifact vault/.test(t)) push('museum');
  if (/capstone|mega-track|combining all|finale/.test(t)) push('capstone');
  if (/volcano|lava|magma|ember|fiery/.test(t)) push('lava', 'volcano');
  if (/fire|smoke|blaze|burning|flame/.test(t)) push('fire');
  if (/snow|arctic|ice|blizzard|frost|glacier/.test(t)) push('snow', 'arctic');
  if (/desert|sand dune|oasis|sandstorm/.test(t)) push('desert', 'sand');
  if (/factory|conveyor|assembly line|industrial/.test(t)) push('factory', 'conveyor');
  if (/warehouse|shelf|crate stack|logistics/.test(t)) push('warehouse');
  if (/mine|shaft|ore|drill|tunnel/.test(t)) push('mine');
  if (/stealth|shadow|ninja|infiltrat/.test(t)) push('stealth');
  if (/boxing|combat ring|colosseum|brawl|mech fight/.test(t)) push('boxing', 'combat');
  if (/jet|dogfight|missile|afterburner|supersonic/.test(t)) push('jet');
  if (/helicopter|rotor|chopper|hover landing/.test(t)) push('helicopter');
  if (/hover|anti-grav|repulsor|glide/.test(t)) push('hover');
  if (/surgery|robot arm|manipulator|precision arm/.test(t)) push('arm');
  if (/lego|brick|modular build/.test(t)) push('lego');
  if (/security|patrol|camera|perimeter/.test(t)) push('security');
  if (/storm|typhoon|lightning|thunder|hurricane/.test(t)) push('storm');
  if (/temple|ruins|ancient|pyramid/.test(t)) push('temple');
  if (/crystal|cavern|gem formation/.test(t)) push('crystal');
  if (/power garden|flower|bloom|petal/.test(t)) push('garden');
  if (/tsunami|tidal wave|huge wave/.test(t)) push('tsunami');
  if (/space|orbit|zero.?g|cosmic|starfield/.test(t)) push('space');
  if (/farm|crop|harvest|field row|agriculture/.test(t)) push('field', 'crop');
  if (/barn|silo|tractor|irrigation|fence/.test(t)) push('barn');
  if (/trench|sewer|underground passage/.test(t)) push('trench');
  if (/cave|cavern entrance/.test(t)) push('cave');
  if (/canyon|gorge|ravine/.test(t)) push('canyon');
  if (/stair|stairwell|elevator|biped/.test(t)) push('stair');
  if (/rescue|search.and.rescue|supply drop/.test(t)) push('rescue');
  if (/medic|triage|patient/.test(t)) push('hospital');
  if (/spike trap|spikes/.test(t)) push('spikes');
  if (/sentinel|guardian bot/.test(t)) push('sentinel');
  if (/shipwreck|wreck|sunken/.test(t)) push('wreck');
  if (/treasure|chest|gold coin/.test(t)) push('treasure');
  if (/football|soccer|turf|goal post/.test(t)) push('football');
  if (/flappy|pipe corridor|flap thrust/.test(t)) push('bird', 'flappy_pipe');
  if (/checkpoint|waypoint|marker pole/.test(t)) push('checkpoint');
  if (/cyber|neon street|hacker/.test(t)) push('cyber');
  if (/rage|berserk|smash/.test(t)) push('rage');
  if (/elemental|magic|arcane|blaster/.test(t)) push('magic');
  if (/drone league|fpv|quadcopter/.test(t)) push('ring');
  if (/graveyard|haunted|ghost/.test(t)) push('haunted');
  if (/pirate|ship deck/.test(t)) push('pirate');
  if (/carnival|funfair|ferris/.test(t)) push('carnival');
  if (/military|bunker|barricade/.test(t)) push('military');
  if (/cargo ship|freighter/.test(t)) push('cargo');
  if (/boss|throne|final challenge/.test(t)) push('boss');

  return tags;
}

function buildAllPresetsFromSpecs() {
  const out = {};
  for (const spec of Object.values(GAME_MODE_SPECS_BY_ID)) {
    const cid = spec.chassisId;
    const n = spec.modeNumber;
    if (!cid || !n) continue;
    const tags = detectVisualTags(spec.visualDescription || '');
    (ENVIRONMENT_TAGS[spec.environmentId] || []).forEach((tg) => tags.push(tg));
    const typeTag = TYPE_TAGS[spec.quickInfo?.type];
    if (typeTag) typeTag.forEach((tg) => tags.push(tg));
    if (!out[cid]) out[cid] = {};
    out[cid][n] = [...new Set(tags)];
  }
  return out;
}

const MODE_PRESETS = buildAllPresetsFromSpecs();

function tagsFromArenaSetup(setup = {}) {
  const tags = [];
  (setup.props || []).forEach((p) => {
    (PROP_TAG_MAP[p] || []).forEach((tg) => tags.push(tg));
  });
  (setup.obstacles || []).forEach((o) => {
    if (o.type === 'boulder' || o.type === 'falling_rock') tags.push('boulder');
    if (o.type === 'spike_trap') tags.push('spikes');
    if (o.type === 'sentinel') tags.push('sentinel');
    if (o.type === 'jellyfish' || o.type === 'coral') tags.push('coral');
    if (o.type === 'laser' || o.type === 'electric_fence') tags.push('laser');
    if (o.type === 'drone_patrol') tags.push('security');
  });
  if (setup.collectibles?.length) tags.push('treasure', 'checkpoint');
  if (setup.zones?.length) tags.push('delivery');
  return [...new Set(tags)];
}

function sampleRoute(scene, fractions) {
  const curve = scene.userData._chassisCurve;
  if (curve) return fractions.map((t) => curve.getPoint(Math.max(0, Math.min(1, t))));
  return fractions.map((t) => new THREE.Vector3((t % 0.3) * 6 - 3, 0, 4 - t * 34));
}

function placeMud(scene, points) {
  points.slice(1, Math.min(points.length, 9)).forEach((p, i) => {
    addMudPuddle(scene, p.x + (i % 2 ? 1.2 : -1.2), p.z, 1.1 + (i % 3) * 0.25);
  });
}

function placeLogBridge(scene, points) {
  const mid = points[Math.floor(points.length / 2)] || points[0];
  addLogBridge(scene, mid.x, mid.z, 11);
  addTree(scene, mid.x - 3, mid.z - 2, 0.8);
  addTree(scene, mid.x + 3, mid.z + 2, 0.7);
}

function placeMountain(scene, points) {
  addMountainPeak(scene, -14, -38);
  const cols = [0x22c55e, 0x3b82f6, 0xfbbf24];
  [0.2, 0.45, 0.7, 0.9].forEach((t, i) => {
    const p = points[Math.min(i, points.length - 1)];
    const marker = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.8, 0.5), mat(cols[i % 3], cols[i % 3], 0.6));
    marker.position.set(p.x + 2.5, 0.4, p.z);
    scene.add(marker);
  });
  points.forEach((p, i) => { if (i % 2 === 0) addMartianRock(scene, p.x - 4, p.z); });
}

function placeRainbow(scene, points) {
  points.slice(0, 6).forEach((p, i) => {
    addRainbowRail(scene, p.x - 2.8, p.z, RAINBOW_COLORS[i % RAINBOW_COLORS.length]);
    addRainbowRail(scene, p.x + 2.8, p.z, RAINBOW_COLORS[(i + 3) % RAINBOW_COLORS.length]);
  });
}

function placeDelivery(scene, points) {
  const cols = [0xef4444, 0xfbbf24, 0xa855f7];
  [0.25, 0.55, 0.8].forEach((t, i) => {
    const p = points[Math.min(Math.floor(t * (points.length - 1)), points.length - 1)];
    addDeliveryZone(scene, p.x, p.z, cols[i % cols.length], i === 0 ? 'PICKUP' : `ZONE ${i}`);
  });
}

function placeFuel(scene, points) {
  [0.15, 0.4, 0.65, 0.85].forEach((t) => {
    const p = points[Math.min(Math.floor(t * (points.length - 1)), points.length - 1)];
    addFuelStation(scene, p.x + 3.5, p.z);
  });
}

function placeTraffic(scene, points) {
  [0.2, 0.45, 0.7].forEach((t) => {
    const p = points[Math.min(Math.floor(t * (points.length - 1)), points.length - 1)];
    addTrafficLight(scene, p.x, p.z);
  });
}

function placeSlalom(scene, points) {
  points.slice(1, Math.min(11, points.length)).forEach((p, i) => addSlalomGate(scene, p.x + (i % 2 ? 1.5 : -1.5), p.z));
}

function placeBoulders(scene, points) {
  points.forEach((p, i) => {
    if (i % 2 === 1) addBoulder(scene, p.x + (i % 4 - 2) * 1.5, p.z, 0.7 + (i % 3) * 0.2);
  });
}

function placeGrandstand(scene, points) {
  const start = points[0];
  const end = points[points.length - 1];
  if (start) addGrandstand(scene, start.x - 8, start.z + 2);
  if (end) addGrandstand(scene, end.x + 8, end.z - 2);
}

function placeParking(scene, points) {
  const p = points[Math.floor(points.length * 0.65)] || points[points.length - 1];
  addParkingBay(scene, p.x, p.z, 0xfbbf24);
  addParkingBay(scene, p.x - 3.5, p.z, 0xef4444);
}

function placeTargets(scene, points) {
  const cols = [0xef4444, 0x3b82f6, 0x22c55e, 0xfbbf24, 0xa855f7];
  points.slice(1, 6).forEach((p, i) => addTargetMarker(scene, p.x + (i % 2 ? 2.5 : -2.5), p.z, cols[i % cols.length]));
}

function placeTow(scene, points) {
  const p = points[Math.floor(points.length * 0.55)] || points[1];
  addTowTruck(scene, p.x - 4, p.z);
}

function placeCoral(scene, points) {
  points.forEach((p, i) => addCoralCluster(scene, p.x + (i % 2 ? 3 : -3), p.z));
}

function placeRings(scene, points) {
  points.slice(1, 8).forEach((p, i) => addNeonRingGate(scene, p.x, 3.5 + (i % 3), p.z, RAINBOW_COLORS[i % RAINBOW_COLORS.length]));
}

function placeLaser(scene, points) {
  points.slice(1, 6).forEach((p) => addLaserGridPair(scene, p.x, p.z, 4));
}

function placeForest(scene, points) {
  points.forEach((p, i) => {
    if (i % 2 === 0) addTree(scene, p.x + 5, p.z, 0.7 + (i % 3) * 0.15);
    if (i % 3 === 0) addTree(scene, p.x - 5, p.z, 0.85);
  });
}

function placeFactory(scene, points) {
  points.forEach((p, i) => {
    if (i % 3 === 0) addConveyor(scene, p.x + 6, p.z, 4);
    if (i % 4 === 1) addWarehouseShelf(scene, p.x - 7, p.z);
  });
}

function placeLava(scene, points) {
  points.slice(1, 7).forEach((p) => {
    const crack = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 1.2), mat(0xff4400, 0xff0000, 0.9));
    crack.rotation.x = -Math.PI / 2;
    crack.position.set(p.x, 0.04, p.z);
    scene.add(crack);
  });
}

function placeSnow(scene, points) {
  points.forEach((p, i) => {
    if (i % 2 === 0) {
      const drift = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), mat(0xe0f2fe, 0, 0));
      drift.scale.set(1.4, 0.4, 1);
      drift.position.set(p.x + 4, 0.15, p.z);
      scene.add(drift);
    }
  });
}

function placeDesert(scene, points) {
  points.forEach((p, i) => {
    const dune = new THREE.Mesh(new THREE.SphereGeometry(1.5, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), mat(0xd4a553, 0, 0));
    dune.scale.set(1.6, 0.35, 1.1);
    dune.position.set(p.x + (i % 2 ? 4 : -4), 0.12, p.z);
    scene.add(dune);
  });
}

function placeHospital(scene, points) {
  points.slice(0, 4).forEach((p) => {
    const bed = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 0.9), mat(0xffffff, 0, 0));
    bed.position.set(p.x + 3, 0.25, p.z);
    scene.add(bed);
    const cross = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), mat(0xef4444, 0xff0000, 0.8));
    cross.position.set(p.x + 3, 0.8, p.z + 0.5);
    scene.add(cross);
  });
}

function placeCombat(scene, points) {
  const p = points[Math.floor(points.length / 2)] || points[0];
  const ring = new THREE.Mesh(new THREE.TorusGeometry(5, 0.15, 8, 32), mat(0xfbbf24, 0xfbbf24, 0.7));
  ring.rotation.x = Math.PI / 2;
  ring.position.set(p?.x ?? 0, 0.1, p?.z ?? -16);
  scene.add(ring);
  [-5, 5].forEach((ox) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 2.5, 8), mat(0xdc2626, 0xff0000, 0.5));
    post.position.set((p?.x ?? 0) + ox, 1.25, (p?.z ?? -16));
    scene.add(post);
  });
}

function placeSpace(scene, points) {
  points.slice(0, 5).forEach((p, i) => {
    const sat = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 0.6), mat(0x94a3b8, 0x38bdf8, 0.4, { metalness: 0.6 }));
    sat.position.set(p.x + 5, 2 + i * 0.5, p.z);
    scene.add(sat);
  });
}

function placeCrystal(scene, points) {
  points.forEach((p, i) => addCrystalFormation(scene, p.x + (i % 2 ? 3 : -3), p.z, RAINBOW_COLORS[i % RAINBOW_COLORS.length]));
}

function placeCheckpoint(scene, points) {
  points.forEach((p, i) => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 2, 6), mat(0x22c55e, 0x22c55e, 0.6));
    pole.position.set(p.x, 1, p.z);
    scene.add(pole);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.5), mat(0x22c55e, 0x22c55e, 0.4, { side: THREE.DoubleSide }));
    flag.position.set(p.x + 0.4, 1.6, p.z);
    scene.add(flag);
  });
}

function placeCapstone(scene, points, tags) {
  if (!tags.includes('mud')) placeMud(scene, points);
  if (!tags.includes('delivery')) placeDelivery(scene, points);
  if (!tags.includes('fuel')) placeFuel(scene, points);
  if (!tags.includes('traffic')) placeTraffic(scene, points);
  if (!tags.includes('slalom')) placeSlalom(scene, points);
  placeGrandstand(scene, points);
  const end = points[points.length - 1];
  const arch = new THREE.Mesh(
    new THREE.TorusGeometry(4, 0.15, 8, 24, Math.PI),
    mat(0xffd700, 0xfbbf24, 0.8),
  );
  arch.rotation.x = Math.PI / 2;
  arch.position.set(end?.x ?? 0, 3.5, (end?.z ?? -30) - 2);
  scene.add(arch);
}

const TAG_PLACERS = {
  mud: placeMud,
  log_bridge: placeLogBridge,
  mountain: placeMountain,
  rocky: placeBoulders,
  boulder: placeBoulders,
  rainbow: placeRainbow,
  delivery: placeDelivery,
  fuel: placeFuel,
  traffic: placeTraffic,
  slalom: placeSlalom,
  grandstand: placeGrandstand,
  parking: placeParking,
  target: placeTargets,
  tow: placeTow,
  coral: placeCoral,
  ring: placeRings,
  laser: placeLaser,
  forest: placeForest,
  martian: (scene, points) => points.forEach((p, i) => { if (i % 2) addMartianRock(scene, p.x + 4, p.z); }),
  underwater: placeCoral,
  web: (scene, points) => {
    const p = points[Math.floor(points.length / 2)];
    const web = new THREE.Mesh(new THREE.PlaneGeometry(10, 12), mat(0xffffff, 0, 0, { transparent: true, opacity: 0.2 }));
    web.position.set(p?.x ?? 0, 5, p?.z ?? -16);
    scene.add(web);
  },
  museum: placeLaser,
  capstone: placeCapstone,
  field: placeForest,
  crop: placeForest,
  barn: (scene, points) => {
    const p = points[Math.floor(points.length * 0.4)];
    const barn = new THREE.Mesh(new THREE.BoxGeometry(4, 2.5, 3), mat(0xb45309, 0, 0));
    barn.position.set((p?.x ?? 0) - 7, 1.25, p?.z ?? -14);
    scene.add(barn);
  },
  factory: placeFactory,
  conveyor: placeFactory,
  warehouse: placeFactory,
  lava: placeLava,
  volcano: placeLava,
  fire: placeLava,
  snow: placeSnow,
  arctic: placeSnow,
  desert: placeDesert,
  sand: placeDesert,
  sandstorm: placeDesert,
  hospital: placeHospital,
  rescue: placeHospital,
  combat: placeCombat,
  boxing: placeCombat,
  colosseum: placeCombat,
  boss: placeCombat,
  space: placeSpace,
  crystal: placeCrystal,
  checkpoint: placeCheckpoint,
  pipe: (scene, points) => points.forEach((p) => {
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 5, 8), mat(0x78716c, 0, 0, { metalness: 0.5 }));
    pipe.position.set(p.x + 5, 2.5, p.z);
    scene.add(pipe);
  }),
  climb: placeMountain,
  temple: (scene, points) => points.forEach((p, i) => {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 2.8, 6), mat(0x9e8060, 0, 0));
    pillar.position.set(p.x + (i % 2 ? 4 : -4), 1.4, p.z);
    scene.add(pillar);
  }),
  pillar: (scene, points) => TAG_PLACERS.temple(scene, points),
  stealth: placeLaser,
  cyber: placeLaser,
  jet: placeRings,
  helicopter: placeRings,
  hover: placeRings,
  storm: placeSnow,
  tsunami: (scene, points) => {
    const wave = new THREE.Mesh(new THREE.BoxGeometry(20, 2, 3), mat(0x0ea5e9, 0x06b6d4, 0.4, { transparent: true, opacity: 0.5 }));
    wave.position.set(0, 0.8, points[3]?.z ?? -14);
    scene.add(wave);
    arenaMover(scene, (t) => { wave.position.z = (points[3]?.z ?? -14) + Math.sin(t) * 2; });
  },
  garden: (scene, points) => points.forEach((p, i) => addTree(scene, p.x + (i % 3 - 1) * 2, p.z, 0.6)),
  haunted: placeForest,
  pirate: (scene, points) => {
    const p = points[Math.floor(points.length / 2)];
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 5, 6), mat(0x5c4030, 0, 0));
    mast.position.set((p?.x ?? 0) - 6, 2.5, p?.z ?? -14);
    scene.add(mast);
  },
  military: placeCombat,
  spikes: placeLaser,
  sentinel: (scene, points) => {
    const p = points[Math.floor(points.length / 2)];
    const bot = new THREE.Mesh(new THREE.BoxGeometry(1, 1.6, 0.8), mat(0x8b4513, 0xff4400, 0.4));
    bot.position.set(p?.x ?? 0, 0.8, p?.z ?? -15);
    scene.add(bot);
  },
  wreck: placeCoral,
  treasure: placeTargets,
  football: placeCombat,
  bird: placeRings,
  flappy_pipe: placeRings,
  magic: placeCrystal,
  rage: placeCombat,
  security: placeLaser,
  arm: placeFactory,
  lego: (scene, points) => points.forEach((p, i) => {
    const brick = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 0.8), mat(RAINBOW_COLORS[i % RAINBOW_COLORS.length], 0, 0));
    brick.position.set(p.x + 3, 0.2, p.z);
    scene.add(brick);
  }),
  mine: (scene, points) => points.forEach((p) => addBoulder(scene, p.x + 4, p.z, 1.1)),
  trench: placeMud,
  cave: placeCrystal,
  canyon: placeMountain,
  stair: (scene, points) => {
    const p = points[Math.floor(points.length / 2)];
    for (let s = 0; s < 5; s++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(2, 0.25, 0.8), mat(0x94a3b8, 0, 0));
      step.position.set((p?.x ?? 0) + s * 0.4, 0.15 + s * 0.25, (p?.z ?? -14) - s * 0.7);
      scene.add(step);
    }
  },
  camp: placeDesert,
  deep: (scene) => { if (scene.fog) scene.fog.density = Math.min(0.04, (scene.fog.density || 0.02) + 0.015); },
  rows: (scene, points) => {
    points.forEach((p) => {
      [-4, 4].forEach((ox) => {
        const row = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.4, 3), mat(0x22c55e, 0x16a34a, 0.2));
        row.position.set(p.x + ox, 0.2, p.z);
        scene.add(row);
      });
    });
  },
};

export function mergeTags(challenge) {
  const art = getMissionArtDirection(challenge);
  if (art) {
    // Authored v3 visuals replace legacy story/setup keyword inference. For
    // example, an aerial "depth" HUD must never install seabed scenery.
    const tags = detectVisualTags(`${art.lookDescription} ${art.heroDescription}`);
    const familyTags = ENVIRONMENT_TAGS[art.environmentId] || [];
    let merged = [...new Set([...tags, ...familyTags])];
    merged = merged.filter(tag => tag !== 'rainbow' && tag !== 'football');
    // The supplied Stealth Bot section accidentally describes jets. Keep its
    // ground-family contract until that conflicting source copy is corrected.
    if (art.chassisId === 'stealth') {
      merged = merged.filter(tag => !['jet', 'helicopter', 'ring', 'cloud'].includes(tag));
    }
    if (['sky_aerial', 'hybrid_race_sky'].includes(art.environmentId)) {
      merged = merged.filter(tag => !['coral', 'underwater', 'deep', 'wreck', 'trench', 'mud'].includes(tag));
    }
    return merged;
  }
  const spec = challenge?.modeSpec;
  const fromText = detectVisualTags(spec?.visualDescription || '');
  const fromStory = detectVisualTags(challenge?.story || challenge?.desc || '');
  const chassis = challenge?.chassisId || spec?.chassisId || '';
  const modeN = challenge?.modeIndex || spec?.modeNumber || 1;
  const preset = MODE_PRESETS[chassis]?.[modeN] || [];
  const fromSetup = tagsFromArenaSetup(challenge?.arenaSetup || challenge?.modeSpec?.arenaSetup);
  const envId = challenge?.environmentId || spec?.environmentId;
  const envTags = ENVIRONMENT_TAGS[envId] || [];
  const merged = [...new Set([...preset, ...fromText, ...fromStory, ...fromSetup, ...envTags])];
  if (modeN === 10 && !merged.includes('capstone')) merged.push('capstone');
  if (challenge?.isRobotMission && merged.length < 2) {
    merged.push('checkpoint', 'treasure');
  }
  return merged;
}

/** Apply mission-specific geometry from modeSpec / campaign setup. */
export function applyMissionVisuals(scene, challenge = {}) {
  if (scene.userData.combatMode || scene.userData.flappyMode || scene.userData.aerialWorldBuilt) return;
  const isMission = challenge?.isChassisMode || challenge?.isRobotMission;
  if (!isMission && !challenge?.modeSpec) return;
  if (scene.getObjectByName('MissionVisualRoot')) return;

  const tags = mergeTags(challenge);
  if (!tags.length) return;

  const root = new THREE.Group();
  root.name = 'MissionVisualRoot';
  scene.add(root);

  const fractions = Array.from({ length: 12 }, (_, i) => i / 11);
  const points = sampleRoute(scene, fractions);

  const applied = new Set();
  const appliedPlacers = new Set();
  const authored = getMissionArtDirection(challenge);
  const previousChildren = new Set(scene.children);
  tags.forEach((tag) => {
    if (applied.has(tag)) return;
    const fn = TAG_PLACERS[tag];
    if (fn) {
      // Several tags alias the same geometry builder. Budget three distinct
      // hero recipes for authored missions instead of duplicating whole kits.
      if (authored && (appliedPlacers.has(fn) || appliedPlacers.size >= 3)) return;
      fn(scene, points, tags);
      applied.add(tag);
      appliedPlacers.add(fn);
    }
  });
  for (const child of [...scene.children]) {
    if (!previousChildren.has(child)) root.add(child);
  }

  scene.userData.missionVisualTags = tags;
  scene.userData.missionAppliedVisualTags = [...applied];

  if (tags.some((t) => ['underwater', 'coral', 'deep'].includes(t))) {
    arenaMover(scene, (t) => {
      scene.traverse((o) => {
        if (o.isMesh && o.material?.emissiveIntensity > 0.2 && o.name !== 'MissionBanner') {
          o.material.emissiveIntensity = 0.35 + Math.sin(t * 2 + o.position.z) * 0.15;
        }
      });
    });
  }
}

export { MODE_PRESETS, detectVisualTags };
