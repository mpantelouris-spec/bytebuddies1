/**
 * studio-robot-builder.js
 * Three.js robot model builder for ByteBuddies Robot Invention Studio.
 * Creates distinct, visually rich 3D models for each chassis type.
 */
import * as THREE from 'three';

// Shared geometry instances (reused across builds)
const BOX_GEO = new THREE.BoxGeometry(1, 1, 1);
const SPHERE_GEO = new THREE.SphereGeometry(1, 12, 8);
const CYL_GEO = new THREE.CylinderGeometry(1, 1, 1, 20);

// ─── Chassis catalogue ─────────────────────────────────────────────────────
export const CHASSIS_DATA = [
  {
    id: 'rover',
    name: 'Rover',
    icon: '🚙',
    badge: 'Balanced',
    primaryColor: '#FF8C00',
    accentColor: '#FFD700',
    speed: 75, power: 70, durability: 80,
    weight: '2.1 kg', movement: 'Wheels',
    bgGrad: ['#FFF3E0', '#FFE0B2'],
  },
  {
    id: 'scout',
    name: 'Scout',
    icon: '⚡',
    badge: 'Speed',
    primaryColor: '#1E90FF',
    accentColor: '#00D9FF',
    speed: 95, power: 60, durability: 55,
    weight: '1.2 kg', movement: 'Wheels',
    bgGrad: ['#E3F2FD', '#BBDEFB'],
  },
  {
    id: 'crawler',
    name: 'Crawler',
    icon: '🌿',
    badge: 'All-Terrain',
    primaryColor: '#00C851',
    accentColor: '#69F0AE',
    speed: 60, power: 80, durability: 85,
    weight: '2.8 kg', movement: 'Wheels',
    bgGrad: ['#E8F5E9', '#C8E6C9'],
  },
  {
    id: 'tank',
    name: 'Tank',
    icon: '🛡️',
    badge: 'Heavy',
    primaryColor: '#2C3E50',
    accentColor: '#95A5A6',
    speed: 40, power: 95, durability: 95,
    weight: '4.5 kg', movement: 'Tracks',
    bgGrad: ['#ECEFF1', '#CFD8DC'],
  },
  {
    id: 'stealth',
    name: 'Stealth',
    icon: '🌑',
    badge: 'Dark Ops',
    primaryColor: '#0d0d1a',
    accentColor: '#00D9FF',
    speed: 70, power: 88, durability: 90,
    weight: '3.5 kg', movement: 'Wheels',
    bgGrad: ['#E8EAF6', '#C5CAE9'],
  },
  {
    id: 'droid',
    name: 'Droid',
    icon: '🤖',
    badge: 'Humanoid',
    primaryColor: '#9B59B6',
    accentColor: '#BB86FC',
    speed: 65, power: 75, durability: 70,
    weight: '2.0 kg', movement: 'Legs',
    bgGrad: ['#F3E5F5', '#E1BEE7'],
  },
];

// ─── Parts catalogues ──────────────────────────────────────────────────────
export const SENSORS_DATA = [
  { id: 'camera',      name: 'Camera',    icon: '📷', color: '#1E90FF' },
  { id: 'ultrasonic',  name: 'Sonar',     icon: '📡', color: '#00D9FF' },
  { id: 'lidar',       name: 'LIDAR',     icon: '🔴', color: '#FF3333' },
  { id: 'ir',          name: 'Infrared',  icon: '🌡️', color: '#FF8C00' },
  { id: 'gyro',        name: 'Gyro',      icon: '🔄', color: '#00C851' },
  { id: 'gps',         name: 'GPS',       icon: '📍', color: '#FFD700' },
];

export const TOOLS_DATA = [
  { id: 'grabber', name: 'Grabber', icon: '✊', color: '#FF8C00' },
  { id: 'drill',   name: 'Drill',   icon: '🔩', color: '#888888' },
  { id: 'laser',   name: 'Laser',   icon: '⚡', color: '#FF00FF' },
  { id: 'shovel',  name: 'Shovel',  icon: '🪣', color: '#8B4513' },
  { id: 'claw',    name: 'Claw',    icon: '🦀', color: '#FF6B6B' },
  { id: 'saw',     name: 'Saw',     icon: '⚙️', color: '#555555' },
];

export const POWER_DATA = [
  { id: 'solar',   name: 'Solar',     icon: '☀️', color: '#FFD700' },
  { id: 'battery', name: 'Battery',   icon: '🔋', color: '#00C851' },
  { id: 'nuclear', name: 'Nuclear',   icon: '⚛️', color: '#00D9FF' },
  { id: 'fuel',    name: 'Fuel Cell', icon: '🧪', color: '#FF8C00' },
];

export const HEADS_DATA = [
  { id: 'dome',    name: 'Dome',     icon: '⛑️', color: '#888' },
  { id: 'spike',   name: 'Spike',    icon: '🔺', color: '#FF0000' },
  { id: 'antenna', name: 'Antenna',  icon: '📻', color: '#00D9FF' },
  { id: 'flat',    name: 'Flat Top', icon: '🟦', color: '#1E90FF' },
  { id: 'face',    name: 'Robot',    icon: '😊', color: '#FFD700' },
  { id: 'scanner', name: 'Scanner',  icon: '🔍', color: '#00C851' },
];

export const ARMS_DATA = [
  { id: 'simple',  name: 'Simple',   icon: '💪', color: '#888' },
  { id: 'claw',    name: 'Claw Arm', icon: '🦾', color: '#FF8C00' },
  { id: 'drill',   name: 'Drill Arm',icon: '🔧', color: '#555' },
  { id: 'torch',   name: 'Torch',    icon: '🔥', color: '#FF4500' },
  { id: 'laser',   name: 'Laser Arm',icon: '⚡', color: '#9B59B6' },
  { id: 'bucket',  name: 'Bucket',   icon: '🪣', color: '#8B4513' },
];

export const LIGHTS_DATA = [
  { id: 'led-white',  name: 'White LED',  icon: '💡', color: '#FFFFFF' },
  { id: 'led-cyan',   name: 'Cyan LED',   icon: '🔵', color: '#00D9FF' },
  { id: 'led-red',    name: 'Red LED',    icon: '🔴', color: '#FF3333' },
  { id: 'searchlight',name: 'Searchlight',icon: '🔦', color: '#FFFFAA' },
  { id: 'strobes',    name: 'Strobes',    icon: '⚡', color: '#FF00FF' },
  { id: 'ring',       name: 'Ring Light', icon: '⭕', color: '#FFD700' },
];

export const BLOCKS_DATA = [
  { id: 'cube-red',    color: '#E74C3C', icon: '🟥', label: '1×1' },
  { id: 'cube-blue',   color: '#3498DB', icon: '🟦', label: '1×1' },
  { id: 'cube-green',  color: '#2ECC71', icon: '🟩', label: '1×1' },
  { id: 'cube-yellow', color: '#F1C40F', icon: '🟨', label: '1×1' },
  { id: 'cube-purple', color: '#9B59B6', icon: '🟪', label: '1×1' },
  { id: 'cube-orange', color: '#E67E22', icon: '🟧', label: '1×1' },
];

// ─── Sample saved robots ───────────────────────────────────────────────────
export const SAMPLE_ROBOTS = [
  {
    id: 1,
    name: 'Rover X1',
    chassisId: 'rover',
    primaryColor: '#FF8C00',
    accentColor: '#FFD700',
    sensors: ['camera', 'ultrasonic'],
    tools: ['grabber'],
    selectedRobot: true,
    bgGrad: ['#FFF3E0', '#FFE0B2'],
    icon: '🚙',
    wheels: 4,
    xp: 450,
  },
  {
    id: 2,
    name: 'Speedster',
    chassisId: 'scout',
    primaryColor: '#1E90FF',
    accentColor: '#00D9FF',
    sensors: [],
    tools: [],
    bgGrad: ['#E3F2FD', '#BBDEFB'],
    icon: '⚡',
    wheels: 4,
    xp: 320,
  },
  {
    id: 3,
    name: 'Climber',
    chassisId: 'crawler',
    primaryColor: '#00C851',
    accentColor: '#69F0AE',
    sensors: ['ultrasonic'],
    tools: ['claw'],
    bgGrad: ['#E8F5E9', '#C8E6C9'],
    icon: '🌿',
    wheels: 6,
    xp: 280,
  },
  {
    id: 4,
    name: 'Explorer',
    chassisId: 'crawler',
    primaryColor: '#FF8C00',
    accentColor: '#FFD700',
    sensors: ['camera', 'ultrasonic', 'gps'],
    tools: ['shovel'],
    bgGrad: ['#FFF8E1', '#FFECB3'],
    icon: '🔭',
    wheels: 6,
    xp: 195,
  },
  {
    id: 5,
    name: 'Walker',
    chassisId: 'droid',
    primaryColor: '#9B59B6',
    accentColor: '#BB86FC',
    sensors: ['camera'],
    tools: [],
    bgGrad: ['#F3E5F5', '#E1BEE7'],
    icon: '🤖',
    wheels: 2,
    xp: 120,
  },
];

// ─── Material helpers ──────────────────────────────────────────────────────
function mat(color, metalness = 0.3, roughness = 0.5, emissive = null, emissiveIntensity = 0.8) {
  const m = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    metalness,
    roughness,
  });
  if (emissive) {
    m.emissive = new THREE.Color(emissive);
    m.emissiveIntensity = emissiveIntensity;
  }
  return m;
}

function mesh(geo, material, sx = 1, sy = 1, sz = 1) {
  const m = new THREE.Mesh(geo, material);
  m.scale.set(sx, sy, sz);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function box(w, h, d, color, metalness = 0.3, roughness = 0.5, emissive = null) {
  return mesh(BOX_GEO, mat(color, metalness, roughness, emissive), w, h, d);
}

function sphere(r, color, metalness = 0.4, roughness = 0.4, emissive = null) {
  return mesh(SPHERE_GEO, mat(color, metalness, roughness, emissive), r, r, r);
}

function cylinder(r, h, color, metalness = 0.5, roughness = 0.4) {
  return mesh(CYL_GEO, mat(color, metalness, roughness), r, h, r);
}

function wheel(radius, thick, tireColor, rimColor = '#cccccc') {
  const g = new THREE.Group();
  // Tire
  const tire = cylinder(radius, thick, tireColor, 0.6, 0.8);
  tire.rotation.z = Math.PI / 2;
  tire.castShadow = true;
  g.add(tire);
  // Rim
  const rim = cylinder(radius * 0.52, thick * 1.02, rimColor, 0.85, 0.25);
  rim.rotation.z = Math.PI / 2;
  g.add(rim);
  // Hub
  const hub = cylinder(radius * 0.18, thick * 1.04, '#888888', 0.9, 0.2);
  hub.rotation.z = Math.PI / 2;
  g.add(hub);
  return g;
}

function addWheels(group, positions, radius, thick, tireColor) {
  positions.forEach(([x, y, z]) => {
    const w = wheel(radius, thick, tireColor);
    w.position.set(x, y, z);
    group.add(w);
  });
}

// ─── Chassis builders ──────────────────────────────────────────────────────

function buildRover(primary, accent) {
  const g = new THREE.Group();
  // Main body
  const body = box(1.15, 0.42, 1.55, primary, 0.35, 0.5);
  body.position.set(0, 0.42, 0);
  g.add(body);
  // Cab
  const cab = box(0.84, 0.38, 0.74, primary, 0.35, 0.5);
  cab.position.set(0, 0.77, -0.15);
  g.add(cab);
  // Hood
  const hood = box(0.98, 0.08, 0.52, primary, 0.5, 0.4);
  hood.position.set(0, 0.64, 0.52);
  g.add(hood);
  // Windshield
  const wind = box(0.72, 0.3, 0.04, '#1a3a5c', 0.7, 0.08);
  wind.position.set(0, 0.76, 0.24);
  wind.rotation.x = -0.36;
  g.add(wind);
  // Rear window
  const rear = box(0.64, 0.24, 0.04, '#1a3a5c', 0.7, 0.08);
  rear.position.set(0, 0.79, -0.54);
  g.add(rear);
  // Roof rack
  const rack = box(0.72, 0.055, 0.42, accent, 0.65, 0.3);
  rack.position.set(0, 1.0, -0.15);
  g.add(rack);
  // Headlights
  [-0.4, 0.4].forEach(x => {
    const hl = box(0.13, 0.09, 0.04, '#fffbe6', 0, 0.5, '#fff8d0');
    hl.material.emissiveIntensity = 0.5;
    hl.position.set(x, 0.53, 0.78);
    g.add(hl);
  });
  // Tail lights
  [-0.38, 0.38].forEach(x => {
    const tl = box(0.1, 0.07, 0.03, '#ff2222', 0, 0.5, '#ff0000');
    tl.material.emissiveIntensity = 0.6;
    tl.position.set(x, 0.52, -0.79);
    g.add(tl);
  });
  // Accent stripes
  [-0.58, 0.58].forEach(x => {
    const s = box(0.035, 0.38, 1.08, accent, 0.5, 0.3);
    s.position.set(x, 0.42, 0);
    g.add(s);
  });
  // Bumpers
  const fbump = box(1.02, 0.15, 0.06, accent, 0.6, 0.4);
  fbump.position.set(0, 0.25, 0.79);
  g.add(fbump);
  const rbump = box(1.02, 0.15, 0.06, accent, 0.6, 0.4);
  rbump.position.set(0, 0.25, -0.79);
  g.add(rbump);
  // 4 Wheels
  addWheels(g, [
    [-0.7, 0.3, 0.55],
    [ 0.7, 0.3, 0.55],
    [-0.7, 0.3, -0.55],
    [ 0.7, 0.3, -0.55],
  ], 0.3, 0.22, '#1a1a1a');
  return g;
}

function buildScout(primary, accent) {
  const g = new THREE.Group();
  // Sleek low body
  const body = box(0.88, 0.28, 1.65, primary, 0.55, 0.3);
  body.position.set(0, 0.3, 0);
  g.add(body);
  // Cockpit
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.38, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    mat(accent, 0.7, 0.08),
  );
  dome.position.set(0, 0.52, 0.08);
  g.add(dome);
  // Front splitter
  const split = box(0.75, 0.05, 0.18, accent, 0.7, 0.25);
  split.position.set(0, 0.18, 0.85);
  g.add(split);
  // Glow strip
  const glow = box(0.76, 0.03, 1.32, accent, 0.1, 0.6, accent);
  glow.material.emissiveIntensity = 0.9;
  glow.position.set(0, 0.45, 0);
  g.add(glow);
  // Rear wing
  const wing = box(0.98, 0.18, 0.06, primary, 0.6, 0.3);
  wing.position.set(0, 0.5, -0.82);
  g.add(wing);
  // Exhausts
  [-0.24, 0.24].forEach(x => {
    const ex = cylinder(0.055, 0.22, '#333', 0.8, 0.3);
    ex.position.set(x, 0.26, -0.9);
    ex.rotation.x = -0.18;
    g.add(ex);
  });
  // 4 wheels
  addWheels(g, [
    [-0.58, 0.22, 0.6],
    [ 0.58, 0.22, 0.6],
    [-0.58, 0.22, -0.6],
    [ 0.58, 0.22, -0.6],
  ], 0.22, 0.18, '#333333');
  return g;
}

function buildCrawler(primary, accent) {
  const g = new THREE.Group();
  // Wide rugged body
  const body = box(1.25, 0.52, 1.45, primary, 0.4, 0.62);
  body.position.set(0, 0.5, 0);
  g.add(body);
  // Flat top
  const top = box(1.12, 0.1, 1.2, accent, 0.55, 0.35);
  top.position.set(0, 0.82, 0);
  g.add(top);
  // Sensor pod
  const pod = box(0.7, 0.2, 0.55, primary, 0.5, 0.4);
  pod.position.set(0, 0.98, 0.08);
  g.add(pod);
  // Antenna
  const ant = cylinder(0.025, 0.5, '#666', 0.7, 0.4);
  ant.position.set(0.25, 1.22, 0.08);
  g.add(ant);
  // Bull bar
  const bar = box(1.18, 0.12, 0.07, '#444', 0.75, 0.3);
  bar.position.set(0, 0.34, 0.77);
  g.add(bar);
  // 6 large wheels
  addWheels(g, [
    [-0.76, 0.34, 0.58],
    [ 0.76, 0.34, 0.58],
    [-0.76, 0.34, 0],
    [ 0.76, 0.34, 0],
    [-0.76, 0.34, -0.58],
    [ 0.76, 0.34, -0.58],
  ], 0.34, 0.26, '#1a1a1a');
  return g;
}

function buildTank(primary, accent) {
  const g = new THREE.Group();
  // Wide hull
  const hull = box(1.45, 0.44, 1.85, primary, 0.6, 0.42);
  hull.position.set(0, 0.44, 0);
  g.add(hull);
  // Upper hull plate
  const plate = box(1.2, 0.14, 1.6, accent, 0.65, 0.38);
  plate.position.set(0, 0.73, 0);
  g.add(plate);
  // Turret base
  const turretBase = cylinder(0.44, 0.14, accent, 0.65, 0.38);
  turretBase.position.set(0, 0.87, -0.08);
  g.add(turretBase);
  // Turret top
  const turret = cylinder(0.35, 0.3, primary, 0.6, 0.38);
  turret.position.set(0, 0.97, -0.08);
  g.add(turret);
  // Barrel
  const barrel = cylinder(0.065, 0.95, '#444', 0.8, 0.3);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0, 0.94, 0.55);
  g.add(barrel);
  // Track guards L/R
  [-0.78, 0.78].forEach(x => {
    const guard = box(0.22, 0.32, 1.9, accent, 0.65, 0.35);
    guard.position.set(x, 0.32, 0);
    g.add(guard);
    // Treads
    for (let i = -0.75; i <= 0.75; i += 0.2) {
      const tread = box(0.2, 0.08, 0.09, '#333', 0.55, 0.55);
      tread.position.set(x, 0.1, i);
      g.add(tread);
    }
  });
  return g;
}

function buildStealth(primary, accent) {
  const g = new THREE.Group();
  // Ultra-low body
  const body = box(1.05, 0.24, 1.75, primary, 0.85, 0.08);
  body.position.set(0, 0.28, 0);
  g.add(body);
  // Angled nose
  const nose = box(0.72, 0.2, 0.56, primary, 0.85, 0.08);
  nose.position.set(0, 0.4, 0.7);
  nose.rotation.x = 0.38;
  g.add(nose);
  // Glow lines (cyan)
  const glow = box(0.88, 0.03, 1.45, accent, 0.1, 0.6, accent);
  glow.material.emissiveIntensity = 1.4;
  glow.position.set(0, 0.41, 0);
  g.add(glow);
  // Side skirts
  [-0.56, 0.56].forEach(x => {
    const skirt = box(0.07, 0.14, 1.55, '#0d0d1a', 0.9, 0.15);
    skirt.position.set(x, 0.26, 0);
    g.add(skirt);
    // Side strip
    const strip = box(0.03, 0.06, 1.3, accent, 0.1, 0.5, accent);
    strip.material.emissiveIntensity = 0.9;
    strip.position.set(x, 0.35, 0);
    g.add(strip);
  });
  // Cockpit slit
  const cockpit = box(0.7, 0.12, 0.45, '#0a1a2e', 0.7, 0.05);
  cockpit.position.set(0, 0.45, 0.35);
  g.add(cockpit);
  // 4 wheels
  addWheels(g, [
    [-0.65, 0.22, 0.62],
    [ 0.65, 0.22, 0.62],
    [-0.65, 0.22, -0.62],
    [ 0.65, 0.22, -0.62],
  ], 0.22, 0.18, '#0d0d1a');
  return g;
}

function buildDroid(primary, accent) {
  const g = new THREE.Group();
  // Torso
  const torso = box(0.78, 0.72, 0.6, primary, 0.45, 0.4);
  torso.position.set(0, 0.58, 0);
  g.add(torso);
  // Chest detail
  const chest = box(0.56, 0.44, 0.06, accent, 0.55, 0.3);
  chest.position.set(0, 0.58, 0.3);
  g.add(chest);
  // Head
  const head = sphere(0.3, accent, 0.5, 0.3);
  head.position.set(0, 1.14, 0);
  g.add(head);
  // Visor
  const visor = box(0.42, 0.14, 0.04, '#0a1a3a', 0.8, 0.05, '#0033ff');
  visor.material.emissiveIntensity = 0.7;
  visor.position.set(0, 1.14, 0.28);
  g.add(visor);
  // Eyes
  [-0.12, 0.12].forEach(x => {
    const eye = sphere(0.06, '#00d9ff', 0, 0.3, '#00d9ff');
    eye.material.emissiveIntensity = 2.0;
    eye.position.set(x, 1.16, 0.28);
    g.add(eye);
  });
  // Shoulder joints
  [-0.52, 0.52].forEach(x => {
    const shoulder = sphere(0.12, accent, 0.6, 0.3);
    shoulder.position.set(x, 0.92, 0);
    g.add(shoulder);
    // Upper arm
    const ua = box(0.16, 0.5, 0.16, primary, 0.45, 0.4);
    ua.position.set(x * 1.05, 0.62, 0);
    g.add(ua);
    // Forearm
    const fa = box(0.13, 0.38, 0.13, accent, 0.5, 0.35);
    fa.position.set(x * 1.08, 0.3, 0);
    g.add(fa);
    // Hand
    const hand = sphere(0.11, '#333', 0.7, 0.3);
    hand.position.set(x * 1.1, 0.08, 0);
    g.add(hand);
  });
  // Pelvis
  const pelvis = box(0.68, 0.24, 0.56, accent, 0.5, 0.35);
  pelvis.position.set(0, 0.12, 0);
  g.add(pelvis);
  // Legs
  [-0.22, 0.22].forEach(x => {
    const thigh = box(0.2, 0.44, 0.2, primary, 0.4, 0.5);
    thigh.position.set(x, -0.14, 0);
    g.add(thigh);
    // Knee joint
    const knee = sphere(0.12, accent, 0.6, 0.3);
    knee.position.set(x, -0.38, 0);
    g.add(knee);
    // Shin
    const shin = box(0.16, 0.4, 0.16, primary, 0.45, 0.45);
    shin.position.set(x, -0.6, 0);
    g.add(shin);
    // Foot
    const foot = box(0.22, 0.12, 0.32, '#333', 0.6, 0.4);
    foot.position.set(x, -0.83, 0.06);
    g.add(foot);
  });
  return g;
}

// ─── Attachment builders ───────────────────────────────────────────────────

function addCamera(group) {
  const body = box(0.2, 0.18, 0.18, '#111', 0.8, 0.2);
  body.position.set(0, 1.3, 0.28);
  group.add(body);
  const lens = cylinder(0.07, 0.09, '#1a1aff', 0.5, 0.15);
  lens.rotation.x = Math.PI / 2;
  lens.material.emissive = new THREE.Color('#0000cc');
  lens.material.emissiveIntensity = 0.6;
  lens.position.set(0, 1.3, 0.38);
  group.add(lens);
}

function addSonar(group) {
  const sonar = box(0.26, 0.1, 0.09, '#00d9ff', 0.5, 0.4, '#00d9ff');
  sonar.material.emissiveIntensity = 0.5;
  sonar.position.set(0, 0.74, 0.54);
  group.add(sonar);
}

function addGrabber(group) {
  const arm = cylinder(0.04, 0.5, '#888', 0.7, 0.3);
  arm.rotation.x = Math.PI / 2;
  arm.position.set(0, 0.62, 0.68);
  group.add(arm);
  [-0.1, 0.1].forEach(x => {
    const claw = box(0.05, 0.22, 0.06, '#666', 0.75, 0.3);
    claw.position.set(x, 0.62, 0.95);
    claw.rotation.z = x < 0 ? 0.3 : -0.3;
    group.add(claw);
  });
}

// ─── Main export ───────────────────────────────────────────────────────────

export function buildRobotModel(config) {
  const chassis = CHASSIS_DATA.find(c => c.id === config.chassisId) || CHASSIS_DATA[0];
  const primary = config.primaryColor || chassis.primaryColor;
  const accent = config.accentColor || chassis.accentColor;

  let group;
  switch (chassis.id) {
    case 'rover':   group = buildRover(primary, accent);   break;
    case 'scout':   group = buildScout(primary, accent);   break;
    case 'crawler': group = buildCrawler(primary, accent); break;
    case 'tank':    group = buildTank(primary, accent);    break;
    case 'stealth': group = buildStealth(primary, accent); break;
    case 'droid':   group = buildDroid(primary, accent);   break;
    default:        group = buildRover(primary, accent);
  }

  // Sensors
  if (config.sensors?.includes('camera'))     addCamera(group);
  if (config.sensors?.includes('ultrasonic')) addSonar(group);

  // Tools
  if (config.tools?.includes('grabber'))      addGrabber(group);

  return group;
}
