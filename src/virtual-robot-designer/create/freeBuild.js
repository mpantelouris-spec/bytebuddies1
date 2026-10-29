/**
 * Free Build — robots children build from scratch, piece by piece, on an empty build plate.
 * A build is a list of pieces, each with a type, position, rotation, size and colour:
 *   { id, type, p: [x, y, z], r: [rx, ry, rz] (radians), s: [sx, sy, sz], c: '#hex', f: finish }
 * buildFreeRobot() turns it into a THREE.Group standing on y = 0, facing +z, with wheels
 * marked for spinning and propellers / legs animated. 1 unit ≈ the size of a Studio robot body.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { faceTexture } from './partsRobot.js';

export const PIECE_GROUPS = [
  {
    id: 'bodies', label: 'Bodies', icon: '🚗', pieces: [
      { type: 'carbody', label: 'Car', icon: '🚗' }, { type: 'racecar', label: 'Race car', icon: '🏎' },
      { type: 'truck', label: 'Truck', icon: '🚚' }, { type: 'tankbody', label: 'Tank', icon: '🪖' },
      { type: 'plane', label: 'Plane', icon: '✈️' }, { type: 'jetbody', label: 'Jet', icon: '🛩' },
      { type: 'rocket', label: 'Rocket', icon: '🚀' }, { type: 'heli', label: 'Helicopter', icon: '🚁' },
      { type: 'ufo', label: 'UFO', icon: '🛸' }, { type: 'sub', label: 'Submarine', icon: '🐋' },
      { type: 'boat', label: 'Boat', icon: '🚤' }, { type: 'torso', label: 'Robot body', icon: '🤖' },
      { type: 'head', label: 'Robot head', icon: '🗿' },
      { type: 'motorbike', label: 'Motorbike', icon: '🏍' }, { type: 'digger', label: 'Digger', icon: '🚜' },
      { type: 'firetruck', label: 'Fire engine', icon: '🚒' }, { type: 'hovercar', label: 'Hover car', icon: '🛸' },
      { type: 'spiderbody', label: 'Spider', icon: '🕷' }, { type: 'robodog', label: 'Robot dog', icon: '🐕' },
      { type: 'mechbody', label: 'Mech', icon: '🦾' }, { type: 'armbase', label: 'Robot arm', icon: '🦿' },
      { type: 'birdbody', label: 'Bird', icon: '🐦' }, { type: 'dragon', label: 'Dragon', icon: '🐉' },
    ],
  },
  {
    id: 'shapes', label: 'Shapes', icon: '🧱', pieces: [
      { type: 'block', label: 'Block', icon: '🟦' }, { type: 'plate', label: 'Plate', icon: '▬' },
      { type: 'cylinder', label: 'Cylinder', icon: '🥫' }, { type: 'ball', label: 'Ball', icon: '🔵' },
      { type: 'dome', label: 'Dome', icon: '🔮' }, { type: 'cone', label: 'Cone', icon: '🔺' },
      { type: 'wedge', label: 'Wedge', icon: '📐' }, { type: 'capsule', label: 'Capsule', icon: '💊' },
      { type: 'ring', label: 'Ring', icon: '⭕' }, { type: 'star', label: 'Star', icon: '⭐' },
      { type: 'pyramid', label: 'Pyramid', icon: '🔼' }, { type: 'tube', label: 'Tube', icon: '🧪' },
      { type: 'heart', label: 'Heart', icon: '❤️' }, { type: 'hexagon', label: 'Hexagon', icon: '⬢' },
      { type: 'disc', label: 'Disc', icon: '💿' }, { type: 'arch', label: 'Arch', icon: '🌈' },
    ],
  },
  {
    id: 'move', label: 'Move', icon: '🛞', pieces: [
      { type: 'wheel', label: 'Wheel', icon: '🛞' }, { type: 'bigwheel', label: 'Big wheel', icon: '🛻' },
      { type: 'track', label: 'Track', icon: '🚜' }, { type: 'leg', label: 'Leg', icon: '🦿' },
      { type: 'propeller', label: 'Propeller', icon: '🚁' }, { type: 'hover', label: 'Hover pad', icon: '🛸' },
      { type: 'ballwheel', label: 'Ball wheel', icon: '🎱' }, { type: 'rotor', label: 'Heli rotor', icon: '🌀' },
      { type: 'ski', label: 'Ski', icon: '🎿' },
    ],
  },
  {
    id: 'face', label: 'Face & lights', icon: '😊', pieces: [
      { type: 'eye', label: 'Eye', icon: '👁' }, { type: 'screen', label: 'Screen face', icon: '🖥' },
      { type: 'light', label: 'Light', icon: '💡' }, { type: 'antenna', label: 'Antenna', icon: '📡' },
      { type: 'mouth', label: 'Smile', icon: '🙂' }, { type: 'ear', label: 'Ear', icon: '🐱' },
      { type: 'headlight', label: 'Headlight', icon: '🔦' }, { type: 'visor', label: 'Visor', icon: '🥽' },
      { type: 'horn', label: 'Horn', icon: '🦄' }, { type: 'nose', label: 'Nose', icon: '🔴' },
      { type: 'eyebrow', label: 'Eyebrow', icon: '〰️' },
    ],
  },
  {
    id: 'tools', label: 'Arms & tools', icon: '🦾', pieces: [
      { type: 'arm', label: 'Arm', icon: '💪' }, { type: 'claw', label: 'Claw', icon: '🦀' },
      { type: 'hand', label: 'Hand', icon: '🖐' }, { type: 'blaster', label: 'Blaster', icon: '🔫' },
      { type: 'drill', label: 'Drill', icon: '🔩' }, { type: 'wing', label: 'Wing', icon: '🪽' },
      { type: 'jet', label: 'Jet', icon: '🔥' }, { type: 'spoiler', label: 'Spoiler', icon: '🏁' },
      { type: 'exhaust', label: 'Exhaust', icon: '💨' }, { type: 'cannon', label: 'Cannon', icon: '💥' },
      { type: 'shield', label: 'Shield', icon: '🛡' }, { type: 'sword', label: 'Sword', icon: '🗡' },
      { type: 'hammer', label: 'Hammer', icon: '🔨' }, { type: 'saw', label: 'Saw', icon: '🪚' },
      { type: 'magnet', label: 'Magnet', icon: '🧲' }, { type: 'flag', label: 'Flag', icon: '🚩' },
      { type: 'tail', label: 'Tail', icon: '🦎' }, { type: 'fin', label: 'Fin', icon: '🦈' },
    ],
  },
];
export const PIECE_INFO = Object.fromEntries(PIECE_GROUPS.flatMap((g) => g.pieces.map((p) => [p.type, { ...p, group: g.id }])));

/** The size a new piece starts at, and how high its centre sits above its base. */
export const PIECE_DEFAULTS = {
  block: { s: [0.6, 0.45, 0.6], c: '#6366f1' }, plate: { s: [0.8, 0.08, 0.8], c: '#94a3b8' },
  cylinder: { s: [0.45, 0.5, 0.45], c: '#22c55e' }, ball: { s: [0.5, 0.5, 0.5], c: '#ef4444' },
  dome: { s: [0.5, 0.5, 0.5], c: '#0ea5e9' }, cone: { s: [0.35, 0.45, 0.35], c: '#f97316' },
  wedge: { s: [0.6, 0.35, 0.5], c: '#a855f7' }, capsule: { s: [0.3, 0.55, 0.3], c: '#ec4899' },
  ring: { s: [0.45, 0.45, 0.45], c: '#facc15' }, star: { s: [0.4, 0.4, 0.4], c: '#facc15' },
  wheel: { s: [0.36, 0.36, 0.36], c: '#1f2937' }, bigwheel: { s: [0.6, 0.6, 0.6], c: '#1f2937' },
  track: { s: [0.24, 0.32, 0.9], c: '#1f2937' }, leg: { s: [0.3, 0.6, 0.3], c: '#475569' },
  propeller: { s: [0.6, 0.15, 0.6], c: '#e2e8f0' }, hover: { s: [0.7, 0.18, 0.7], c: '#334155' },
  ballwheel: { s: [0.45, 0.45, 0.45], c: '#f8fafc' },
  eye: { s: [0.16, 0.16, 0.16], c: '#ffffff' }, screen: { s: [0.45, 0.3, 0.06], c: '#0f172a' },
  light: { s: [0.12, 0.12, 0.12], c: '#5eead4' }, antenna: { s: [0.1, 0.4, 0.1], c: '#cbd5e1' },
  mouth: { s: [0.2, 0.08, 0.06], c: '#111827' }, ear: { s: [0.16, 0.2, 0.08], c: '#6366f1' },
  arm: { s: [0.12, 0.45, 0.12], c: '#475569' }, claw: { s: [0.22, 0.2, 0.26], c: '#facc15' },
  hand: { s: [0.18, 0.18, 0.18], c: '#f8fafc' }, blaster: { s: [0.16, 0.16, 0.4], c: '#cbd5e1' },
  drill: { s: [0.16, 0.16, 0.36], c: '#cbd5e1' }, wing: { s: [0.6, 0.06, 0.32], c: '#f8fafc' },
  jet: { s: [0.18, 0.3, 0.18], c: '#cbd5e1' },
  // Bodies are modelled at their real shape, so they start at an even size
  carbody: { s: [0.9, 0.9, 0.9], c: '#ef4444' }, racecar: { s: [0.9, 0.9, 0.9], c: '#f97316' },
  truck: { s: [0.85, 0.85, 0.85], c: '#0ea5e9' }, tankbody: { s: [0.85, 0.85, 0.85], c: '#65a30d' },
  plane: { s: [0.85, 0.85, 0.85], c: '#f8fafc' }, jetbody: { s: [0.85, 0.85, 0.85], c: '#64748b' },
  rocket: { s: [0.75, 0.75, 0.75], c: '#f8fafc' }, heli: { s: [0.85, 0.85, 0.85], c: '#facc15' },
  ufo: { s: [0.85, 0.85, 0.85], c: '#a855f7' }, sub: { s: [0.85, 0.85, 0.85], c: '#facc15' },
  boat: { s: [0.85, 0.85, 0.85], c: '#f8fafc' }, torso: { s: [0.8, 0.8, 0.8], c: '#6366f1' },
  head: { s: [0.6, 0.6, 0.6], c: '#cbd5e1' },
  motorbike: { s: [0.85, 0.85, 0.85], c: '#ef4444' }, digger: { s: [0.85, 0.85, 0.85], c: '#facc15' },
  firetruck: { s: [0.85, 0.85, 0.85], c: '#dc2626' }, hovercar: { s: [0.85, 0.85, 0.85], c: '#8b5cf6' },
  spiderbody: { s: [0.85, 0.85, 0.85], c: '#10b981' }, robodog: { s: [0.85, 0.85, 0.85], c: '#f8fafc' },
  mechbody: { s: [0.9, 0.9, 0.9], c: '#64748b' }, armbase: { s: [0.85, 0.85, 0.85], c: '#ec4899' },
  birdbody: { s: [0.8, 0.8, 0.8], c: '#38bdf8' }, dragon: { s: [0.9, 0.9, 0.9], c: '#22c55e' },
  pyramid: { s: [0.5, 0.45, 0.5], c: '#f59e0b' }, tube: { s: [0.35, 0.5, 0.35], c: '#14b8a6' },
  heart: { s: [0.4, 0.4, 0.2], c: '#ec4899' }, hexagon: { s: [0.5, 0.3, 0.5], c: '#6366f1' },
  disc: { s: [0.6, 0.08, 0.6], c: '#94a3b8' }, arch: { s: [0.6, 0.35, 0.2], c: '#22c55e' },
  rotor: { s: [1.2, 0.2, 1.2], c: '#334155' }, ski: { s: [0.14, 0.12, 0.9], c: '#ef4444' },
  headlight: { s: [0.14, 0.14, 0.08], c: '#fef9c3' }, visor: { s: [0.5, 0.16, 0.1], c: '#22d3ee' },
  horn: { s: [0.1, 0.3, 0.1], c: '#facc15' }, nose: { s: [0.1, 0.1, 0.1], c: '#ef4444' },
  eyebrow: { s: [0.16, 0.04, 0.04], c: '#1f2937' },
  spoiler: { s: [0.8, 0.25, 0.25], c: '#1f2937' }, exhaust: { s: [0.1, 0.1, 0.3], c: '#cbd5e1' },
  cannon: { s: [0.24, 0.24, 0.6], c: '#475569' }, shield: { s: [0.4, 0.5, 0.08], c: '#0ea5e9' },
  sword: { s: [0.1, 0.7, 0.1], c: '#e2e8f0' }, hammer: { s: [0.3, 0.6, 0.18], c: '#94a3b8' },
  saw: { s: [0.4, 0.4, 0.06], c: '#e2e8f0' }, magnet: { s: [0.3, 0.3, 0.12], c: '#ef4444' },
  flag: { s: [0.3, 0.6, 0.04], c: '#22c55e' }, tail: { s: [0.12, 0.12, 0.6], c: '#22c55e' },
  fin: { s: [0.06, 0.35, 0.4], c: '#0ea5e9' },
};

/** Ready-made bodies (shaped like real vehicles) — the main piece most robots start from. */
export const BODY_TYPES = new Set(PIECE_GROUPS[0].pieces.map((p) => p.type));

const FINISH = {
  matte: { rough: 0.8, metal: 0.05, coat: 0 },
  glossy: { rough: 0.3, metal: 0.1, coat: 0.8 },
  metal: { rough: 0.3, metal: 0.75, coat: 0.3 },
  chrome: { rough: 0.1, metal: 0.95, coat: 0.6 },
  glow: { rough: 0.3, metal: 0.1, coat: 0.5, glow: 0.9 },
};

let _env = null;
function envTex() {
  if (_env || typeof document === 'undefined') return _env;
  const c = document.createElement('canvas'); c.width = 512; c.height = 256;
  const g = c.getContext('2d');
  const sky = g.createLinearGradient(0, 0, 0, 256);
  sky.addColorStop(0, '#9fc3f7'); sky.addColorStop(0.45, '#eef3ff'); sky.addColorStop(0.55, '#ffffff'); sky.addColorStop(1, '#5b6478');
  g.fillStyle = sky; g.fillRect(0, 0, 512, 256);
  _env = new THREE.CanvasTexture(c);
  _env.mapping = THREE.EquirectangularReflectionMapping;
  _env.colorSpace = THREE.SRGBColorSpace;
  return _env;
}
function mat(color, finish = 'glossy') {
  const f = FINISH[finish] || FINISH.glossy;
  const m = new THREE.MeshPhysicalMaterial({ color, roughness: f.rough, metalness: f.metal, clearcoat: f.coat, clearcoatRoughness: 0.2, ...(f.glow ? { emissive: color, emissiveIntensity: f.glow } : {}) });
  m.envMap = envTex(); m.envMapIntensity = 0.8;
  return m;
}
const DARK = () => { const m = new THREE.MeshStandardMaterial({ color: 0x2b3240, roughness: 0.45, metalness: 0.7 }); m.envMap = envTex(); return m; };
const CHROME = () => { const m = new THREE.MeshStandardMaterial({ color: 0xdfe5ee, roughness: 0.15, metalness: 1 }); m.envMap = envTex(); m.envMapIntensity = 1.1; return m; };
const RUBBER = () => new THREE.MeshStandardMaterial({ color: 0x1a1d24, roughness: 0.9, metalness: 0.05 });
const GLOW = (c) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 1.6, roughness: 0.3 });
const GLASS = () => { const m = new THREE.MeshPhysicalMaterial({ color: 0x1e3a5f, roughness: 0.05, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.05 }); m.envMap = envTex(); m.envMapIntensity = 1.2; return m; };

function m(geo, material, x = 0, y = 0, z = 0) {
  const o = new THREE.Mesh(geo, material);
  o.position.set(x, y, z);
  o.castShadow = true; o.receiveShadow = true;
  o.userData.skipStudioPaint = true;
  return o;
}
const rot = (o, x = 0, y = 0, z = 0) => { o.rotation.set(x, y, z); return o; };

/** A small wheel with a tyre and hub, side-on (axle along x). Spins in the game. */
function wheelAt(r, w, x, y, z, hubColor = '#cbd5e1') {
  const wg = new THREE.Group(); wg.position.set(x, y, z);
  wg.add(rot(m(new THREE.CylinderGeometry(r, r, w, 26), RUBBER()), 0, 0, Math.PI / 2));
  wg.add(rot(m(new THREE.CylinderGeometry(r * 0.6, r * 0.6, w + 0.02, 18), mat(hubColor, 'metal')), 0, 0, Math.PI / 2));
  wg.traverse((o) => { if (o.isMesh) o.userData.isWheel = true; });
  return wg;
}
/** Spinning blades; axis 'y' (helicopter, drone) or 'z' (plane nose, boat, submarine). */
function bladesAt(radius, color, x, y, z, axis = 'y', count = 2) {
  const outer = new THREE.Group(); outer.position.set(x, y, z);
  if (axis === 'z') outer.rotation.x = Math.PI / 2;
  const spin = new THREE.Group(); outer.add(spin);
  spin.add(m(new THREE.CylinderGeometry(radius * 0.12, radius * 0.12, radius * 0.25, 12), CHROME()));
  for (let i = 0; i < count; i++) spin.add(rot(m(new THREE.BoxGeometry(radius * 2, 0.025, radius * 0.18), mat(color, 'glossy')), 0, (i / count) * Math.PI, 0));
  return { outer, spin };
}
const extrude = (shape, depth, bevel = 0.02) => { const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2 }); geo.translate(0, 0, -depth / 2); return geo; };

/**
 * Swappable parts: things on a body a child can take off or change (wheels for tracks or
 * hover pads, the digger's scoop for a drill, the dog's ears…). Stored on the piece as
 * `o: { drive: 'tracks', tool: 'drill' }`; the first option of each is what the body comes with.
 */
const DRIVE = { wheels: ['Wheels', '🛞'], bigwheels: ['Big wheels', '🛻'], tracks: ['Tracks', '🚜'], hover: ['Hover pads', '🛸'], none: ['None', '🚫'] };
const opts = (list, table) => list.map((id) => [id, ...(table[id] || [id, '•'])]);
const TOOLS = { scoop: ['Scoop', '🪣'], drill: ['Drill', '🔩'], claw: ['Claw', '🦀'], gripper: ['Gripper', '🤏'], magnet: ['Magnet', '🧲'], ladder: ['Ladder', '🪜'], hose: ['Water cannon', '💦'], turret: ['Turret', '🛡'], none: ['None', '🚫'] };
const BITS = { pointy: ['Pointy', '🔺'], round: ['Round', '⚪'], on: ['On', '✅'], wings: ['Wings', '🪽'], propeller: ['Propeller', '🚁'], pads: ['Armour', '🛡'], cannons: ['Cannons', '💥'], horns: ['Horns', '🦄'], periscope: ['Periscope', '🔭'], none: ['None', '🚫'] };
export const SLOT_LABELS = { drive: 'Moves on', tool: 'Tool', ears: 'Ears', tail: 'Tail', shoulders: 'Shoulders', wings: 'Wings', horns: 'Horns', top: 'On top' };
export const BODY_SLOTS = {
  carbody: { drive: opts(['wheels', 'bigwheels', 'tracks', 'hover', 'none'], DRIVE) },
  racecar: { drive: opts(['wheels', 'bigwheels', 'hover', 'none'], DRIVE) },
  truck: { drive: opts(['wheels', 'bigwheels', 'tracks', 'hover', 'none'], DRIVE) },
  firetruck: { drive: opts(['wheels', 'bigwheels', 'tracks', 'none'], DRIVE), tool: opts(['ladder', 'hose', 'none'], TOOLS) },
  tankbody: { drive: opts(['tracks', 'wheels', 'bigwheels', 'hover'], DRIVE), tool: opts(['turret', 'none'], TOOLS) },
  digger: { drive: opts(['tracks', 'wheels', 'bigwheels'], DRIVE), tool: opts(['scoop', 'drill', 'claw', 'none'], TOOLS) },
  hovercar: { drive: opts(['hover', 'wheels', 'bigwheels'], DRIVE) },
  motorbike: { drive: opts(['wheels', 'bigwheels', 'hover'], DRIVE) },
  armbase: { tool: opts(['gripper', 'claw', 'magnet', 'drill'], TOOLS) },
  robodog: { ears: opts(['pointy', 'round', 'none'], BITS), tail: opts(['on', 'none'], BITS) },
  mechbody: { shoulders: opts(['pads', 'cannons', 'none'], BITS) },
  birdbody: { wings: opts(['wings', 'propeller'], BITS) },
  dragon: { wings: opts(['wings', 'none'], BITS), horns: opts(['horns', 'none'], BITS) },
  sub: { top: opts(['periscope', 'none'], BITS) },
};
/** The option a piece has chosen for a slot (or what the body comes with). */
export const slotValue = (piece, slot) => piece?.o?.[slot] ?? BODY_SLOTS[piece?.type]?.[slot]?.[0]?.[0];

/**
 * Wheels / big wheels / tracks / hover pads / nothing at a body's wheel spots.
 * spots: [x, y, z, radius, width] — tracks run along each side under the spots.
 */
function driveAt(g, kind, spots, led) {
  if (kind === 'none') return;
  if (kind === 'wheels' || kind === 'bigwheels') {
    const k = kind === 'bigwheels' ? 1.4 : 1;
    spots.forEach(([x, y, z, r, w]) => g.add(wheelAt(r * k, w * (kind === 'bigwheels' ? 1.25 : 1), x, y, z)));
    return;
  }
  const sides = [-1, 1].map((side) => spots.filter(([x]) => Math.sign(x || 1) === side)).filter((l) => l.length);
  sides.forEach((list) => {
    const x = list[0][0], y = list.reduce((a, q) => a + q[1], 0) / list.length, r = Math.max(...list.map((q) => q[3])), w = Math.max(...list.map((q) => q[4]));
    const z0 = Math.min(...list.map((q) => q[2])), z1 = Math.max(...list.map((q) => q[2]));
    if (kind === 'tracks') {
      g.add(m(new RoundedBoxGeometry(w * 1.3, r * 2, z1 - z0 + r * 2.2, 4, r * 0.9), RUBBER(), x, y, (z0 + z1) / 2));
      list.forEach(([, , z]) => g.add(wheelAt(r * 0.55, w * 1.35, x, y, z, '#64748b')));
    } else {
      list.forEach(([, , z]) => {
        g.add(m(new THREE.CylinderGeometry(r * 0.95, r * 1.1, 0.1, 20), DARK(), x * 0.92, y - r * 0.4, z));
        g.add(rot(m(new THREE.TorusGeometry(r * 0.95, 0.035, 8, 24), GLOW(led), x * 0.92, y - r * 0.48, z), Math.PI / 2));
      });
    }
  });
}

/**
 * One piece at unit size (about 1 × 1 × 1, centred, base at y = -0.5), coloured `c`.
 * The piece's size `s` is applied by scaling the holder.
 */
function pieceModel(type, c, finish, led, o = {}) {
  const g = new THREE.Group();
  // Everything added while `cur` is set belongs to that swappable part (so a click on it knows)
  let cur = null;
  const tagAdds = (grp) => { const add0 = grp.add.bind(grp); grp.add = (...objs) => { if (cur) objs.forEach((ob) => ob.traverse((n) => { n.userData.slot = cur; })); return add0(...objs); }; return grp; };
  tagAdds(g);
  const opt = (slot) => slotValue({ type, o }, slot);
  // A tool from the parts tray, used on a body (the digger's drill, the arm's magnet…)
  const tool = (t, color, x, y, z, size, rx = 0) => { const h = new THREE.Group(); h.add(pieceModel(t, color, 'metal', led)); h.position.set(x, y, z); h.scale.setScalar(size); h.rotation.x = rx; return h; };
  const M = () => mat(c, finish);
  switch (type) {
    case 'block': g.add(m(new RoundedBoxGeometry(1, 1, 1, 4, 0.12), M())); break;
    case 'plate': g.add(m(new RoundedBoxGeometry(1, 1, 1, 2, 0.3), M())); break;
    case 'cylinder': g.add(m(new THREE.CylinderGeometry(0.5, 0.5, 1, 32), M())); break;
    case 'ball': g.add(m(new THREE.SphereGeometry(0.5, 32, 24), M())); break;
    case 'dome': g.add(m(new THREE.SphereGeometry(0.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), M(), 0, -0.5, 0)); g.children[0].scale.y = 2; break;
    case 'cone': g.add(m(new THREE.ConeGeometry(0.5, 1, 32), M())); break;
    case 'wedge': {
      const s = new THREE.Shape(); s.moveTo(-0.5, -0.5); s.lineTo(0.5, -0.5); s.lineTo(-0.5, 0.5); s.closePath();
      const geo = new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: false }); geo.translate(0, 0, -0.5);
      g.add(rot(m(geo, M()), 0, -Math.PI / 2, 0)); break;
    }
    case 'capsule': g.add(m(new THREE.CapsuleGeometry(0.35, 0.3, 8, 24), M())); g.children[0].scale.set(1.43, 1, 1.43); break;
    case 'ring': g.add(rot(m(new THREE.TorusGeometry(0.38, 0.12, 14, 36), M()), 0, 0, 0)); break;
    case 'star': {
      const s = new THREE.Shape();
      for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2 + Math.PI / 2; const r = k % 2 ? 0.22 : 0.5; const x = Math.cos(a) * r, y = Math.sin(a) * r; if (k) s.lineTo(x, y); else s.moveTo(x, y); }
      const geo = new THREE.ExtrudeGeometry(s, { depth: 0.25, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.04, bevelSegments: 2 }); geo.translate(0, 0, -0.125);
      g.add(m(geo, M())); break;
    }
    case 'wheel': case 'bigwheel': {
      const w = new THREE.Group();
      w.add(rot(m(new THREE.CylinderGeometry(0.5, 0.5, 0.45, 32), RUBBER()), 0, 0, Math.PI / 2));
      for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; w.add(rot(m(new THREE.BoxGeometry(0.47, 0.06, 0.1), RUBBER(), 0, Math.cos(a) * 0.5, Math.sin(a) * 0.5), -a)); }
      [-1, 1].forEach((sd) => {
        w.add(rot(m(new THREE.CylinderGeometry(0.32, 0.32, 0.03, 28), mat(c === '#1f2937' ? '#cbd5e1' : c, 'metal'), sd * 0.23, 0, 0), 0, 0, Math.PI / 2));
        w.add(rot(m(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 16), DARK(), sd * 0.25, 0, 0), 0, 0, Math.PI / 2));
      });
      w.traverse((o) => { if (o.isMesh) o.userData.isWheel = true; });
      w.userData.spinWheel = true;
      g.add(w); break;
    }
    case 'track': {
      g.add(m(new RoundedBoxGeometry(1, 1, 1, 4, 0.45), RUBBER()));
      for (let i = 0; i < 9; i++) g.add(m(new THREE.BoxGeometry(1.04, 0.06, 0.05), DARK(), 0, 0.5, -0.42 + i * 0.105));
      [-1, 0, 1].forEach((k) => g.add(rot(m(new THREE.CylinderGeometry(0.33, 0.33, 1.05, 20), mat(c === '#1f2937' ? '#cbd5e1' : c, 'metal'), 0, 0, k * 0.3), 0, 0, Math.PI / 2)));
      break;
    }
    case 'leg': {
      const hip = new THREE.Group(); hip.position.y = 0.42; g.add(hip);
      hip.add(m(new THREE.SphereGeometry(0.28, 16, 12), DARK()));
      hip.add(m(new THREE.CapsuleGeometry(0.22, 0.25, 6, 14), M(), 0, -0.25, 0));
      hip.add(m(new THREE.SphereGeometry(0.22, 14, 10), CHROME(), 0, -0.5, 0));
      hip.add(m(new THREE.CapsuleGeometry(0.18, 0.2, 6, 14), DARK(), 0, -0.68, 0));
      hip.add(m(new RoundedBoxGeometry(0.8, 0.16, 1.1, 2, 0.06), M(), 0, -0.86, 0.12));
      g.userData.leg = hip; break;
    }
    case 'propeller': {
      g.add(m(new THREE.CylinderGeometry(0.1, 0.12, 0.6, 14), CHROME(), 0, -0.2, 0));
      g.add(rot(m(new THREE.TorusGeometry(0.48, 0.035, 8, 36), mat(c, finish)), Math.PI / 2));
      const blades = new THREE.Group(); blades.position.y = 0.15;
      [0, Math.PI / 2].forEach((r) => blades.add(rot(m(new THREE.BoxGeometry(0.9, 0.04, 0.12), mat(c, finish)), 0, r, 0)));
      g.add(blades); g.userData.rotor = blades; break;
    }
    case 'hover': {
      g.add(m(new THREE.CylinderGeometry(0.45, 0.5, 0.6, 32), mat(c, finish)));
      g.add(rot(m(new THREE.TorusGeometry(0.47, 0.06, 10, 36), GLOW(led), 0, -0.32, 0), Math.PI / 2));
      const t = m(new THREE.CylinderGeometry(0.4, 0.15, 0.5, 24, 1, true), new THREE.MeshBasicMaterial({ color: led, transparent: true, opacity: 0.3, depthWrite: false, side: THREE.DoubleSide }), 0, -0.6, 0);
      t.castShadow = false; g.add(t); break;
    }
    case 'ballwheel': {
      const b = m(new THREE.SphereGeometry(0.5, 32, 24), M());
      [0, Math.PI / 2].forEach((r) => b.add(rot(m(new THREE.TorusGeometry(0.505, 0.04, 8, 40), DARK()), 0, r, 0)));
      b.userData.isWheel = true; b.userData.spinWheel = true; g.add(b); break;
    }
    case 'eye': {
      g.add(m(new THREE.SphereGeometry(0.5, 24, 18), mat(c, 'glossy')));
      g.add(m(new THREE.SphereGeometry(0.27, 18, 14), GLOW(led), 0, 0, 0.32));
      g.add(m(new THREE.SphereGeometry(0.13, 12, 10), mat('#0f172a', 'glossy'), 0, 0, 0.52));
      g.add(m(new THREE.SphereGeometry(0.06, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }), 0.08, 0.08, 0.58)); break;
    }
    case 'screen': {
      g.add(m(new RoundedBoxGeometry(1.1, 1.15, 1, 3, 0.15), DARK(), 0, 0, -0.05));
      const tex = faceTexture('happy', led);
      const s = m(new THREE.PlaneGeometry(1, 1), new THREE.MeshStandardMaterial({ map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 1.1 }), 0, 0, 0.47);
      s.castShadow = false; g.add(s); break;
    }
    case 'light': g.add(m(new THREE.SphereGeometry(0.5, 20, 14), GLOW(c))); break;
    case 'antenna': {
      g.add(m(new THREE.CylinderGeometry(0.15, 0.25, 0.1, 12), DARK(), 0, -0.45, 0));
      g.add(m(new THREE.CylinderGeometry(0.08, 0.08, 0.8, 8), CHROME(), 0, -0.05, 0));
      g.add(m(new THREE.SphereGeometry(0.28, 14, 10), GLOW(led), 0, 0.38, 0)); break;
    }
    case 'mouth': g.add(rot(m(new THREE.TorusGeometry(0.42, 0.14, 8, 20, Math.PI), GLOW(led), 0, 0.2, 0), 0, 0, Math.PI)); break;
    case 'ear': g.add(m(new THREE.ConeGeometry(0.5, 1, 4), M())); break;
    case 'arm': {
      g.add(m(new THREE.SphereGeometry(0.5, 14, 10), DARK(), 0, 0.42, 0));
      g.add(m(new THREE.CapsuleGeometry(0.38, 0.5, 6, 12), M(), 0, 0, 0));
      g.add(m(new THREE.SphereGeometry(0.42, 14, 10), CHROME(), 0, -0.45, 0)); break;
    }
    case 'claw': {
      g.add(m(new RoundedBoxGeometry(0.6, 0.5, 0.4, 2, 0.08), DARK(), 0, 0, -0.3));
      [-1, 1].forEach((k) => { g.add(rot(m(new THREE.BoxGeometry(0.16, 0.25, 0.75), M(), k * 0.24, 0, 0.12), 0, k * 0.35, 0)); g.add(rot(m(new THREE.ConeGeometry(0.12, 0.25, 8), CHROME(), k * 0.38, 0, 0.5), Math.PI / 2)); });
      break;
    }
    case 'hand': {
      g.add(m(new THREE.SphereGeometry(0.45, 16, 12), M()));
      for (let i = 0; i < 3; i++) g.add(rot(m(new THREE.CapsuleGeometry(0.1, 0.3, 4, 8), M(), -0.22 + i * 0.22, 0.05, 0.45), Math.PI / 2));
      g.add(rot(m(new THREE.CapsuleGeometry(0.1, 0.25, 4, 8), M(), 0.45, 0, 0.15), 0, 0, Math.PI / 2)); break;
    }
    case 'blaster': {
      g.add(rot(m(new THREE.CylinderGeometry(0.4, 0.45, 1, 18), mat(c, 'metal')), Math.PI / 2));
      [-0.2, 0.2].forEach((z) => g.add(m(new THREE.TorusGeometry(0.43, 0.06, 6, 18), DARK(), 0, 0, z)));
      g.add(m(new THREE.CircleGeometry(0.3, 18), GLOW(led), 0, 0, 0.505)); break;
    }
    case 'drill': {
      const d = new THREE.Group();
      d.add(rot(m(new THREE.ConeGeometry(0.45, 1, 18), mat(c, 'metal')), Math.PI / 2));
      for (let i = 0; i < 4; i++) d.add(m(new THREE.TorusGeometry(0.38 - i * 0.08, 0.04, 6, 18), DARK(), 0, 0, -0.3 + i * 0.2));
      g.add(d); g.userData.drill = d; break;
    }
    case 'wing': {
      const s = new THREE.Shape(); s.moveTo(-0.5, -0.5); s.quadraticCurveTo(0.2, -0.1, 0.5, 0.5); s.lineTo(0.5, -0.1); s.quadraticCurveTo(0.1, -0.5, -0.5, -0.5);
      const geo = new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: false }); geo.translate(0, 0, -0.5);
      g.add(rot(m(geo, M()), Math.PI / 2, 0, 0)); break;
    }
    case 'jet': {
      g.add(m(new THREE.CylinderGeometry(0.42, 0.5, 0.8, 18), mat(c, 'metal'), 0, 0.1, 0));
      const f = m(new THREE.ConeGeometry(0.4, 0.6, 16), GLOW('#f97316'), 0, -0.55, 0); f.rotation.x = Math.PI; g.add(f); break;
    }

    /* ── Bodies (real proportions, base near y = -0.35) ── */
    case 'carbody': {
      g.add(m(new RoundedBoxGeometry(0.9, 0.3, 1.5, 4, 0.1), M(), 0, 0, 0));
      g.add(m(new RoundedBoxGeometry(0.74, 0.3, 0.72, 4, 0.12), GLASS(), 0, 0.26, -0.1));
      g.add(m(new RoundedBoxGeometry(0.78, 0.06, 0.66, 3, 0.03), M(), 0, 0.42, -0.1));
      [-0.3, 0.3].forEach((x) => { g.add(m(new THREE.SphereGeometry(0.08, 14, 10), GLOW('#fef9c3'), x, 0.03, 0.72)); g.add(m(new THREE.BoxGeometry(0.16, 0.06, 0.03), GLOW('#ef4444'), x, 0.05, -0.75)); });
      g.add(m(new RoundedBoxGeometry(0.92, 0.08, 0.06, 2, 0.03), CHROME(), 0, -0.1, 0.76));
      g.add(m(new RoundedBoxGeometry(0.92, 0.08, 0.06, 2, 0.03), CHROME(), 0, -0.1, -0.76));
      cur = 'drive';
      driveAt(g, opt('drive'), [[0.45, -0.14, 0.48, 0.2, 0.16], [-0.45, -0.14, 0.48, 0.2, 0.16], [0.45, -0.14, -0.48, 0.2, 0.16], [-0.45, -0.14, -0.48, 0.2, 0.16]], led);
      cur = null;
      break;
    }
    case 'racecar': {
      g.add(m(new RoundedBoxGeometry(0.5, 0.18, 1.5, 4, 0.08), M(), 0, 0, 0));
      g.add(rot(m(new THREE.ConeGeometry(0.17, 0.5, 18), M(), 0, -0.01, 0.95), Math.PI / 2));
      [-1, 1].forEach((k) => g.add(m(new RoundedBoxGeometry(0.2, 0.16, 0.6, 3, 0.06), M(), k * 0.33, 0, -0.2)));
      g.add(m(new THREE.SphereGeometry(0.17, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2), GLASS(), 0, 0.08, 0.05));
      g.add(m(new RoundedBoxGeometry(0.85, 0.04, 0.22, 2, 0.02), mat('#1f2937', 'glossy'), 0, 0.3, -0.72));
      [-0.3, 0.3].forEach((x) => g.add(m(new THREE.BoxGeometry(0.04, 0.22, 0.12), mat('#1f2937', 'glossy'), x, 0.18, -0.72)));
      g.add(m(new RoundedBoxGeometry(0.8, 0.03, 0.16, 2, 0.01), mat('#1f2937', 'glossy'), 0, -0.07, 1.1));
      cur = 'drive';
      driveAt(g, opt('drive'), [[0.42, 0.62, 0.15], [-0.42, 0.62, 0.15], [0.45, -0.5, 0.2], [-0.45, -0.5, 0.2]].map(([x, z, r]) => [x, r - 0.25, z, r, r === 0.2 ? 0.22 : 0.16]), led);
      cur = null;
      break;
    }
    case 'truck': {
      g.add(m(new RoundedBoxGeometry(0.9, 0.55, 0.55, 4, 0.1), M(), 0, 0.15, 0.55));
      g.add(m(new RoundedBoxGeometry(0.78, 0.22, 0.04, 2, 0.02), GLASS(), 0, 0.27, 0.83));
      g.add(m(new RoundedBoxGeometry(0.96, 0.7, 1.05, 4, 0.06), mat('#f8fafc', 'glossy'), 0, 0.22, -0.32));
      g.add(m(new RoundedBoxGeometry(0.94, 0.1, 1.7, 2, 0.04), DARK(), 0, -0.17, 0.05));
      [-0.3, 0.3].forEach((x) => g.add(m(new THREE.SphereGeometry(0.07, 12, 8), GLOW('#fef9c3'), x, 0.0, 0.83)));
      cur = 'drive';
      driveAt(g, opt('drive'), [0.6, -0.15, -0.55].flatMap((z) => [-1, 1].map((k) => [k * 0.46, -0.2, z, 0.2, 0.16])), led);
      cur = null;
      break;
    }
    case 'tankbody': {
      g.add(m(new RoundedBoxGeometry(0.8, 0.3, 1.3, 4, 0.08), M(), 0, 0.02, 0));
      cur = 'tool';
      if (opt('tool') === 'turret') {
        g.add(m(new THREE.CylinderGeometry(0.28, 0.32, 0.2, 24), M(), 0, 0.27, -0.05));
        g.add(rot(m(new THREE.CylinderGeometry(0.05, 0.06, 0.7, 14), DARK(), 0, 0.29, 0.38), Math.PI / 2));
      }
      cur = null;
      cur = 'drive';
      if (opt('drive') === 'tracks') {
        [-1, 1].forEach((k) => {
          g.add(m(new RoundedBoxGeometry(0.22, 0.32, 1.45, 4, 0.14), RUBBER(), k * 0.5, -0.12, 0));
          [-0.5, -0.17, 0.17, 0.5].forEach((z) => g.add(wheelAt(0.11, 0.23, k * 0.5, -0.12, z, '#64748b')));
        });
      } else driveAt(g, opt('drive'), [0.45, -0.45].flatMap((z) => [-1, 1].map((k) => [k * 0.48, -0.12, z, 0.17, 0.16])), led);
      cur = null;
      break;
    }
    case 'plane': {
      g.add(rot(m(new THREE.CapsuleGeometry(0.2, 1.1, 8, 20), M(), 0, 0.1, 0), Math.PI / 2));
      g.add(m(new RoundedBoxGeometry(1.9, 0.05, 0.38, 2, 0.02), M(), 0, 0.08, 0.05));
      g.add(m(new RoundedBoxGeometry(0.7, 0.04, 0.2, 2, 0.02), M(), 0, 0.18, -0.68));
      g.add(m(new RoundedBoxGeometry(0.04, 0.3, 0.22, 2, 0.02), mat('#ef4444', finish), 0, 0.32, -0.68));
      g.add(m(new THREE.SphereGeometry(0.15, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), GLASS(), 0, 0.24, 0.25));
      [-0.65, 0.65].forEach((x) => g.add(m(new THREE.BoxGeometry(0.06, 0.06, 0.3), GLOW(x < 0 ? '#ef4444' : '#22c55e'), x * 1.4, 0.08, 0.05)));
      const { outer, spin } = bladesAt(0.3, '#1f2937', 0, 0.1, 0.78, 'z', 2); g.add(outer); g.userData.rotor = spin;
      [-0.2, 0.2].forEach((x) => g.add(wheelAt(0.07, 0.05, x, -0.18, 0.2)));
      break;
    }
    case 'jetbody': {
      g.add(rot(m(new THREE.CylinderGeometry(0.2, 0.17, 1.2, 20), M(), 0, 0.05, -0.05), Math.PI / 2));
      g.add(rot(m(new THREE.ConeGeometry(0.2, 0.55, 20), M(), 0, 0.05, 0.82), Math.PI / 2));
      const wing = new THREE.Shape(); wing.moveTo(0, 0.45); wing.lineTo(0.9, -0.25); wing.lineTo(0.9, -0.4); wing.lineTo(0, -0.35); wing.closePath();
      [-1, 1].forEach((k) => { const w = m(extrude(wing, 0.04, 0.01), M(), 0, 0.02, -0.05); w.rotation.set(-Math.PI / 2, 0, 0); w.scale.x = k; g.add(w); });
      [-1, 1].forEach((k) => g.add(rot(m(new RoundedBoxGeometry(0.03, 0.3, 0.25, 2, 0.01), M(), k * 0.12, 0.28, -0.55), 0, 0, k * -0.3)));
      g.add(m(new THREE.SphereGeometry(0.14, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), GLASS(), 0, 0.18, 0.35));
      g.add(rot(m(new THREE.ConeGeometry(0.15, 0.4, 16), GLOW('#f97316'), 0, 0.05, -0.85), -Math.PI / 2));
      break;
    }
    case 'rocket': {
      g.add(m(new THREE.CylinderGeometry(0.28, 0.3, 1.1, 24), M(), 0, 0.15, 0));
      g.add(m(new THREE.ConeGeometry(0.28, 0.5, 24), mat('#ef4444', finish), 0, 0.95, 0));
      g.add(rot(m(new THREE.TorusGeometry(0.1, 0.025, 8, 20), CHROME(), 0, 0.4, 0.28), 0, 0, 0));
      g.add(m(new THREE.CircleGeometry(0.1, 20), GLASS(), 0, 0.4, 0.285));
      for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2; const fin = m(new RoundedBoxGeometry(0.04, 0.4, 0.28, 2, 0.01), mat('#ef4444', finish), Math.sin(a) * 0.36, -0.3, Math.cos(a) * 0.36); fin.rotation.y = a; g.add(fin); }
      g.add(m(new THREE.CylinderGeometry(0.18, 0.24, 0.12, 20), DARK(), 0, -0.46, 0));
      const fl = m(new THREE.ConeGeometry(0.16, 0.4, 16), GLOW('#f97316'), 0, -0.7, 0); fl.rotation.x = Math.PI; fl.castShadow = false; g.add(fl);
      break;
    }
    case 'heli': {
      const cab = m(new THREE.SphereGeometry(0.38, 26, 18), M(), 0, 0.1, 0.1); cab.scale.set(1, 0.9, 1.25); g.add(cab);
      const gl = m(new THREE.SphereGeometry(0.3, 22, 14, 0, Math.PI * 2, 0, Math.PI / 2.2), GLASS(), 0, 0.12, 0.3); gl.rotation.x = Math.PI / 2.6; g.add(gl);
      g.add(rot(m(new THREE.CylinderGeometry(0.05, 0.09, 0.8, 12), M(), 0, 0.18, -0.6), Math.PI / 2.1));
      g.add(m(new RoundedBoxGeometry(0.03, 0.25, 0.16, 2, 0.01), M(), 0, 0.3, -0.98));
      const tr = bladesAt(0.14, '#1f2937', 0.04, 0.3, -0.98, 'y', 2); tr.outer.rotation.z = Math.PI / 2; g.add(tr.outer);
      g.add(m(new THREE.CylinderGeometry(0.05, 0.07, 0.15, 12), DARK(), 0, 0.48, 0.1));
      const { outer, spin } = bladesAt(0.75, '#1f2937', 0, 0.56, 0.1, 'y', 3); g.add(outer); g.userData.rotor = spin;
      [-1, 1].forEach((k) => { g.add(rot(m(new THREE.CylinderGeometry(0.025, 0.025, 0.9, 8), CHROME(), k * 0.28, -0.3, 0.1), Math.PI / 2)); [-0.15, 0.3].forEach((z) => g.add(m(new THREE.CylinderGeometry(0.02, 0.02, 0.2, 6), CHROME(), k * 0.25, -0.2, z))); });
      break;
    }
    case 'ufo': {
      const sau = m(new THREE.SphereGeometry(0.7, 36, 18), M(), 0, 0, 0); sau.scale.y = 0.25; g.add(sau);
      g.add(rot(m(new THREE.TorusGeometry(0.64, 0.04, 10, 48), CHROME(), 0, 0, 0), Math.PI / 2));
      g.add(m(new THREE.SphereGeometry(0.32, 26, 16, 0, Math.PI * 2, 0, Math.PI / 2), GLASS(), 0, 0.1, 0));
      for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; g.add(m(new THREE.SphereGeometry(0.045, 10, 8), GLOW(led), Math.cos(a) * 0.55, -0.04, Math.sin(a) * 0.55)); }
      g.add(m(new THREE.CylinderGeometry(0.2, 0.28, 0.08, 24), GLOW(led), 0, -0.17, 0));
      break;
    }
    case 'sub': {
      g.add(rot(m(new THREE.CapsuleGeometry(0.28, 1.0, 10, 24), M(), 0, 0.05, 0), Math.PI / 2));
      g.add(m(new RoundedBoxGeometry(0.2, 0.28, 0.4, 3, 0.08), M(), 0, 0.42, 0.05));
      cur = 'top';
      if (opt('top') === 'periscope') {
        g.add(m(new THREE.CylinderGeometry(0.025, 0.025, 0.3, 8), CHROME(), 0, 0.7, 0.12));
        g.add(rot(m(new THREE.CylinderGeometry(0.035, 0.035, 0.12, 8), CHROME(), 0, 0.85, 0.16), Math.PI / 2));
      }
      cur = null;
      [-0.3, 0, 0.3].forEach((z) => [-1, 1].forEach((k) => { const p = m(new THREE.CircleGeometry(0.06, 16), GLOW(led), k * 0.285, 0.1, z); p.rotation.y = k * Math.PI / 2; g.add(p); }));
      g.add(m(new RoundedBoxGeometry(0.03, 0.3, 0.16, 2, 0.01), M(), 0, 0.05, -0.75));
      g.add(m(new RoundedBoxGeometry(0.4, 0.03, 0.16, 2, 0.01), M(), 0, 0.05, -0.75));
      const { outer, spin } = bladesAt(0.15, '#cbd5e1', 0, 0.05, -0.88, 'z', 3); g.add(outer); g.userData.rotor = spin;
      break;
    }
    case 'boat': {
      // Top view of the hull with a pointed bow at the front (+z)
      const hs = new THREE.Shape(); hs.moveTo(-0.42, -0.7); hs.lineTo(0.42, -0.7); hs.lineTo(0.45, 0.25); hs.quadraticCurveTo(0.38, 0.65, 0, 0.9); hs.quadraticCurveTo(-0.38, 0.65, -0.45, 0.25); hs.closePath();
      const layer = (depth, material, y, k = 1) => { const o = m(extrude(hs, depth, 0.03), material, 0, y, 0); o.rotation.x = Math.PI / 2; o.scale.set(k, k, 1); return o; };
      g.add(layer(0.3, M(), 0));
      const keel = layer(0.12, M(), -0.18, 0.8); g.add(keel);
      g.add(layer(0.05, mat('#ef4444', 'glossy'), 0.02, 1.03));
      g.add(layer(0.03, mat('#a16207', 'matte'), 0.17, 0.92));
      g.add(m(new RoundedBoxGeometry(0.5, 0.28, 0.45, 3, 0.06), mat('#f8fafc', 'glossy'), 0, 0.33, -0.2));
      g.add(m(new RoundedBoxGeometry(0.46, 0.12, 0.04, 2, 0.02), GLASS(), 0, 0.38, 0.03));
      const { outer, spin } = bladesAt(0.1, '#cbd5e1', 0, -0.15, -0.78, 'z', 3); g.add(outer); g.userData.rotor = spin;
      break;
    }
    case 'torso': {
      g.add(m(new RoundedBoxGeometry(0.8, 0.85, 0.5, 5, 0.16), M(), 0, 0.05, 0));
      g.add(m(new RoundedBoxGeometry(0.4, 0.3, 0.04, 3, 0.04), DARK(), 0, 0.15, 0.26));
      [-0.1, 0, 0.1].forEach((x, i) => g.add(m(new THREE.SphereGeometry(0.035, 10, 8), GLOW(['#ef4444', '#facc15', '#22c55e'][i]), x, 0.2, 0.28)));
      g.add(m(new RoundedBoxGeometry(0.28, 0.05, 0.03, 2, 0.01), GLOW(led), 0, 0.08, 0.28));
      [-1, 1].forEach((k) => g.add(m(new THREE.SphereGeometry(0.14, 16, 12), CHROME(), k * 0.43, 0.32, 0)));
      g.add(m(new RoundedBoxGeometry(0.84, 0.1, 0.54, 2, 0.04), DARK(), 0, -0.33, 0));
      g.add(m(new THREE.CylinderGeometry(0.12, 0.14, 0.1, 16), CHROME(), 0, 0.52, 0));
      break;
    }
    case 'head': {
      g.add(m(new RoundedBoxGeometry(0.8, 0.65, 0.65, 5, 0.18), M(), 0, 0, 0));
      g.add(m(new RoundedBoxGeometry(0.62, 0.2, 0.06, 3, 0.05), DARK(), 0, 0.05, 0.32));
      g.add(m(new RoundedBoxGeometry(0.56, 0.08, 0.02, 2, 0.01), GLOW(led), 0, 0.05, 0.355));
      [-1, 1].forEach((k) => { g.add(rot(m(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 16), CHROME(), k * 0.42, 0, 0), 0, 0, Math.PI / 2)); g.add(rot(m(new THREE.CylinderGeometry(0.04, 0.04, 0.04, 10), GLOW(led), k * 0.47, 0, 0), 0, 0, Math.PI / 2)); });
      g.add(m(new RoundedBoxGeometry(0.2, 0.05, 0.02, 2, 0.01), DARK(), 0, -0.18, 0.33));
      break;
    }

    /* ── More robot types ── */
    case 'motorbike': {
      cur = 'drive';
      if (opt('drive') === 'hover') [0.5, -0.5].forEach((z) => { g.add(m(new THREE.CylinderGeometry(0.22, 0.26, 0.12, 22), DARK(), 0, -0.15, z)); g.add(rot(m(new THREE.TorusGeometry(0.23, 0.04, 8, 24), GLOW(led), 0, -0.22, z), Math.PI / 2)); });
      else [0.55, -0.55].forEach((z) => g.add(opt('drive') === 'bigwheels' ? wheelAt(0.38, 0.2, 0, -0.05, z) : wheelAt(0.3, 0.14, 0, -0.05, z)));
      cur = null;
      g.add(rot(m(new RoundedBoxGeometry(0.22, 0.24, 0.8, 3, 0.08), M(), 0, 0.25, 0), 0.08));
      g.add(m(new RoundedBoxGeometry(0.26, 0.1, 0.42, 3, 0.05), DARK(), 0, 0.42, -0.2));
      g.add(rot(m(new THREE.CylinderGeometry(0.03, 0.03, 0.6, 10), CHROME(), 0, 0.2, 0.5), -0.45));
      g.add(rot(m(new THREE.CylinderGeometry(0.025, 0.025, 0.5, 10), CHROME(), 0, 0.5, 0.36), 0, 0, Math.PI / 2));
      g.add(m(new THREE.SphereGeometry(0.07, 12, 8), GLOW('#fef9c3'), 0, 0.4, 0.5));
      g.add(rot(m(new THREE.CylinderGeometry(0.04, 0.05, 0.4, 10), CHROME(), 0.12, 0.05, -0.45), Math.PI / 2));
      g.add(m(new RoundedBoxGeometry(0.2, 0.18, 0.3, 3, 0.05), mat('#334155', 'metal'), 0, 0.08, 0));
      break;
    }
    case 'digger': {
      cur = 'drive';
      if (opt('drive') === 'tracks') {
        [-1, 1].forEach((k) => {
          g.add(m(new RoundedBoxGeometry(0.22, 0.28, 1.1, 4, 0.12), RUBBER(), k * 0.42, -0.2, 0));
          [-0.35, 0, 0.35].forEach((z) => g.add(wheelAt(0.09, 0.24, k * 0.42, -0.2, z, '#64748b')));
        });
      } else driveAt(g, opt('drive'), [0.35, -0.35].flatMap((z) => [-1, 1].map((k) => [k * 0.42, -0.17, z, 0.17, 0.16])), led);
      cur = null;
      g.add(m(new THREE.CylinderGeometry(0.4, 0.42, 0.1, 24), DARK(), 0, -0.02, 0));
      g.add(m(new RoundedBoxGeometry(0.7, 0.3, 0.8, 4, 0.08), M(), 0, 0.15, -0.05));
      g.add(m(new RoundedBoxGeometry(0.42, 0.42, 0.42, 4, 0.08), M(), 0.12, 0.5, -0.15));
      g.add(m(new RoundedBoxGeometry(0.36, 0.3, 0.04, 2, 0.02), GLASS(), 0.12, 0.52, 0.07));
      cur = 'tool';
      if (opt('tool') !== 'none') {
        g.add(rot(m(new RoundedBoxGeometry(0.12, 0.12, 0.75, 3, 0.04), M(), -0.18, 0.55, 0.45), -0.55));
        g.add(rot(m(new RoundedBoxGeometry(0.1, 0.1, 0.55, 3, 0.04), M(), -0.18, 0.55, 0.95), 0.9));
      }
      cur = null;
      cur = 'tool';
      if (opt('tool') === 'scoop') {
        const bucket = m(new THREE.CylinderGeometry(0.2, 0.2, 0.3, 16, 1, true, 0, Math.PI), mat('#475569', 'metal'), -0.18, 0.22, 1.08);
        bucket.rotation.set(0, 0, Math.PI / 2); bucket.material.side = THREE.DoubleSide; g.add(bucket);
      } else if (opt('tool') === 'drill') {
        const d = tool('drill', '#cbd5e1', -0.18, 0.2, 1.1, 0.42, Math.PI / 2); g.add(d);
      } else if (opt('tool') === 'claw') g.add(tool('claw', '#facc15', -0.18, 0.2, 1.12, 0.4, Math.PI / 2));
      cur = null;
      break;
    }
    case 'firetruck': {
      g.add(m(new RoundedBoxGeometry(0.9, 0.55, 0.5, 4, 0.1), M(), 0, 0.15, 0.6));
      g.add(m(new RoundedBoxGeometry(0.78, 0.2, 0.04, 2, 0.02), GLASS(), 0, 0.27, 0.86));
      g.add(m(new RoundedBoxGeometry(0.94, 0.5, 1.15, 4, 0.06), M(), 0, 0.1, -0.3));
      g.add(m(new RoundedBoxGeometry(0.96, 0.06, 1.2, 2, 0.02), CHROME(), 0, -0.12, -0.3));
      g.add(m(new RoundedBoxGeometry(0.94, 0.1, 1.75, 2, 0.04), DARK(), 0, -0.2, 0.05));
      cur = 'tool';
      if (opt('tool') === 'ladder') {
        [-1, 1].forEach((k) => g.add(m(new THREE.BoxGeometry(0.04, 0.04, 1.3), CHROME(), k * 0.2, 0.42, -0.25)));
        for (let i = 0; i < 7; i++) g.add(m(new THREE.BoxGeometry(0.4, 0.03, 0.03), CHROME(), 0, 0.42, -0.85 + i * 0.2));
      } else if (opt('tool') === 'hose') {
        g.add(m(new THREE.CylinderGeometry(0.14, 0.16, 0.1, 18), DARK(), 0, 0.4, -0.3));
        g.add(rot(tool('cannon', '#cbd5e1', 0, 0.52, -0.2, 0.36), -0.35));
      }
      cur = null;
      [-0.25, 0.25].forEach((x, i) => g.add(m(new THREE.SphereGeometry(0.07, 12, 8), GLOW(i ? '#3b82f6' : '#ef4444'), x, 0.47, 0.6)));
      cur = 'drive';
      driveAt(g, opt('drive'), [0.6, -0.15, -0.6].flatMap((z) => [-1, 1].map((k) => [k * 0.46, -0.22, z, 0.2, 0.16])), led);
      cur = null;
      break;
    }
    case 'hovercar': {
      g.add(m(new RoundedBoxGeometry(0.85, 0.22, 1.5, 5, 0.1), M(), 0, 0.05, 0));
      const cab = m(new THREE.SphereGeometry(0.34, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2), GLASS(), 0, 0.15, -0.05); cab.scale.z = 1.5; g.add(cab);
      g.add(rot(m(new THREE.ConeGeometry(0.2, 0.35, 16), M(), 0, 0.03, 0.88), Math.PI / 2));
      cur = 'drive';
      if (opt('drive') === 'hover') {
        [[0.36, 0.5], [-0.36, 0.5], [0.36, -0.5], [-0.36, -0.5]].forEach(([x, z]) => {
          g.add(m(new THREE.CylinderGeometry(0.17, 0.2, 0.1, 20), DARK(), x, -0.1, z));
          g.add(rot(m(new THREE.TorusGeometry(0.17, 0.035, 8, 24), GLOW(led), x, -0.16, z), Math.PI / 2));
        });
      } else driveAt(g, opt('drive'), [[0.44, -0.1, 0.5, 0.18, 0.14], [-0.44, -0.1, 0.5, 0.18, 0.14], [0.44, -0.1, -0.5, 0.18, 0.14], [-0.44, -0.1, -0.5, 0.18, 0.14]], led);
      cur = null;
      g.add(m(new RoundedBoxGeometry(0.6, 0.04, 0.05, 2, 0.02), GLOW(led), 0, 0.06, 0.76));
      g.add(rot(m(new RoundedBoxGeometry(0.75, 0.04, 0.18, 2, 0.02), M(), 0, 0.33, -0.7), -0.2));
      break;
    }
    case 'spiderbody': {
      const abd = m(new THREE.SphereGeometry(0.38, 26, 18), M(), 0, 0.2, -0.25); abd.scale.set(1, 0.8, 1.15); g.add(abd);
      g.add(m(new THREE.SphereGeometry(0.24, 22, 16), M(), 0, 0.2, 0.25));
      [[-0.08, 0.27, 0.45], [0.08, 0.27, 0.45], [-0.15, 0.22, 0.42], [0.15, 0.22, 0.42]].forEach(([x, y, z]) => g.add(m(new THREE.SphereGeometry(0.05, 12, 8), GLOW(led), x, y, z)));
      // Eight jointed legs: up and out from the body to a knee, then down to the ground
      const seg = (from, to, r, material) => {
        const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
        const len = a.distanceTo(b);
        const o = m(new THREE.CapsuleGeometry(r, Math.max(0.01, len - r * 2), 4, 10), material, (a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
        o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
        return o;
      };
      [-1, 1].forEach((k) => [0.3, 0.1, -0.12, -0.34].forEach((z, i) => {
        const hip = new THREE.Group(); hip.position.set(k * 0.2, 0.18, z * 0.7);
        const spread = -(i - 1.5) * 0.55;              // front legs reach forward, back legs backward
        const knee = [k * 0.4, 0.3, spread * 0.45];
        const foot = [k * 0.75, -0.52, spread * 0.95];
        hip.add(seg([0, 0, 0], knee, 0.035, DARK()));
        hip.add(m(new THREE.SphereGeometry(0.045, 10, 8), CHROME(), ...knee));
        hip.add(seg(knee, foot, 0.03, M()));
        hip.userData.leg = hip; hip.userData.legPhase = (i + (k > 0 ? 1 : 0)) % 2 ? Math.PI : 0; hip.userData.legSwing = 'y';
        g.add(hip);
      }));
      break;
    }
    case 'robodog': {
      g.add(m(new RoundedBoxGeometry(0.5, 0.36, 0.95, 5, 0.14), M(), 0, 0.22, 0));
      g.add(m(new RoundedBoxGeometry(0.4, 0.34, 0.36, 5, 0.12), M(), 0, 0.52, 0.5));
      g.add(m(new RoundedBoxGeometry(0.24, 0.16, 0.2, 4, 0.06), mat('#334155', 'glossy'), 0, 0.45, 0.72));
      g.add(m(new THREE.SphereGeometry(0.045, 10, 8), DARK(), 0, 0.5, 0.83));
      [-1, 1].forEach((k) => {
        g.add(m(new THREE.SphereGeometry(0.06, 12, 8), GLOW(led), k * 0.11, 0.6, 0.68));
        cur = 'ears';
        if (opt('ears') === 'pointy') g.add(rot(m(new RoundedBoxGeometry(0.1, 0.24, 0.06, 2, 0.03), mat('#334155', 'glossy'), k * 0.2, 0.74, 0.45), 0, 0, k * -0.4));
        else if (opt('ears') === 'round') { const e = m(new THREE.SphereGeometry(0.1, 14, 10), mat('#334155', 'glossy'), k * 0.2, 0.72, 0.45); e.scale.z = 0.45; g.add(e); }
        cur = null;
      });
      [[0.18, 0.32], [-0.18, 0.32], [0.18, -0.32], [-0.18, -0.32]].forEach(([x, z], i) => {
        const hip = new THREE.Group(); hip.position.set(x, 0.12, z);
        hip.add(m(new THREE.CapsuleGeometry(0.07, 0.22, 4, 10), mat('#334155', 'glossy'), 0, -0.15, 0));
        hip.add(m(new THREE.SphereGeometry(0.08, 10, 8), DARK(), 0, -0.32, 0.02));
        hip.userData.leg = hip; hip.userData.legPhase = (i === 0 || i === 3) ? 0 : Math.PI;
        g.add(hip);
      });
      cur = 'tail';
      if (opt('tail') === 'on') g.add(rot(m(new THREE.CapsuleGeometry(0.035, 0.25, 4, 8), mat('#334155', 'glossy'), 0, 0.42, -0.55), -0.7));
      cur = null;
      break;
    }
    case 'mechbody': {
      g.add(m(new RoundedBoxGeometry(0.85, 0.55, 0.7, 5, 0.12), M(), 0, 0.55, 0));
      g.add(m(new RoundedBoxGeometry(0.5, 0.22, 0.05, 3, 0.04), GLASS(), 0, 0.62, 0.36));
      [-1, 1].forEach((k) => {
        cur = 'shoulders';
        if (opt('shoulders') === 'pads') g.add(m(new RoundedBoxGeometry(0.3, 0.26, 0.5, 4, 0.08), mat('#f59e0b', 'glossy'), k * 0.55, 0.72, 0));
        else if (opt('shoulders') === 'cannons') g.add(tool('blaster', '#cbd5e1', k * 0.55, 0.78, 0.05, 0.42));
        cur = null;
        g.add(m(new THREE.CylinderGeometry(0.06, 0.06, 0.35, 12), DARK(), k * 0.55, 0.45, 0.15));
        const hip = new THREE.Group(); hip.position.set(k * 0.25, 0.28, 0);
        hip.add(m(new RoundedBoxGeometry(0.2, 0.32, 0.24, 3, 0.06), M(), 0, -0.12, 0));
        hip.add(m(new THREE.SphereGeometry(0.1, 12, 8), CHROME(), 0, -0.3, 0));
        hip.add(m(new RoundedBoxGeometry(0.18, 0.28, 0.2, 3, 0.06), DARK(), 0, -0.45, 0));
        hip.add(m(new RoundedBoxGeometry(0.3, 0.08, 0.42, 3, 0.03), M(), 0, -0.62, 0.06));
        hip.userData.leg = hip; hip.userData.legPhase = k > 0 ? Math.PI : 0;
        g.add(hip);
      });
      g.add(m(new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8), CHROME(), 0.25, 0.95, -0.2));
      g.add(m(new THREE.SphereGeometry(0.05, 10, 8), GLOW(led), 0.25, 1.11, -0.2));
      break;
    }
    case 'armbase': {
      g.add(m(new THREE.CylinderGeometry(0.45, 0.5, 0.18, 32), DARK(), 0, -0.3, 0));
      const turn = tagAdds(new THREE.Group()); turn.position.y = -0.2; g.add(turn);
      turn.add(m(new THREE.CylinderGeometry(0.28, 0.32, 0.2, 28), M(), 0, 0.05, 0));
      turn.add(m(new THREE.SphereGeometry(0.14, 16, 12), CHROME(), 0, 0.22, 0));
      const up = rot(m(new RoundedBoxGeometry(0.16, 0.7, 0.16, 3, 0.06), M(), 0, 0.52, 0.12), 0.35); turn.add(up);
      turn.add(m(new THREE.SphereGeometry(0.11, 14, 10), CHROME(), 0, 0.84, 0.24));
      const fore = rot(m(new RoundedBoxGeometry(0.13, 0.13, 0.62, 3, 0.05), M(), 0, 0.82, 0.55), 0.35); turn.add(fore);
      turn.add(m(new RoundedBoxGeometry(0.22, 0.12, 0.12, 2, 0.04), DARK(), 0, 0.68, 0.84));
      cur = 'tool';
      if (opt('tool') === 'gripper') [-1, 1].forEach((k) => turn.add(m(new RoundedBoxGeometry(0.04, 0.18, 0.08, 2, 0.02), mat('#facc15', 'glossy'), k * 0.08, 0.55, 0.86)));
      else if (opt('tool') === 'claw') turn.add(tool('claw', '#facc15', 0, 0.48, 0.86, 0.45, Math.PI / 2));
      else if (opt('tool') === 'magnet') turn.add(tool('magnet', '#ef4444', 0, 0.5, 0.86, 0.4, -Math.PI / 2));
      else if (opt('tool') === 'drill') { const d = tool('drill', '#cbd5e1', 0, 0.45, 0.86, 0.45, Math.PI / 2); turn.add(d); }
      cur = null;
      turn.add(m(new THREE.SphereGeometry(0.04, 10, 8), GLOW(led), 0, 0.15, 0.3));
      g.userData.turntable = turn;
      break;
    }
    case 'birdbody': {
      const bod = m(new THREE.SphereGeometry(0.38, 26, 18), M(), 0, 0.2, 0); bod.scale.set(0.9, 0.95, 1.15); g.add(bod);
      g.add(m(new THREE.SphereGeometry(0.26, 22, 16), M(), 0, 0.45, 0.32));
      g.add(rot(m(new THREE.ConeGeometry(0.08, 0.22, 12), mat('#f59e0b', 'glossy'), 0, 0.42, 0.62), Math.PI / 2));
      [-1, 1].forEach((k) => {
        g.add(m(new THREE.SphereGeometry(0.07, 12, 8), mat('#ffffff', 'glossy'), k * 0.12, 0.52, 0.52));
        g.add(m(new THREE.SphereGeometry(0.035, 10, 8), DARK(), k * 0.13, 0.53, 0.58));
        cur = 'wings';
        if (opt('wings') === 'wings') {
          const wing = new THREE.Group(); wing.position.set(k * 0.3, 0.28, 0);
          const wm = m(new THREE.SphereGeometry(0.28, 16, 10), mat('#f8fafc', finish), k * 0.25, 0, -0.05); wm.scale.set(1.3, 0.18, 0.75); wing.add(wm);
          wing.userData.flap = k; g.add(wing);
        }
        cur = null;
        g.add(rot(m(new THREE.CylinderGeometry(0.02, 0.02, 0.2, 6), mat('#f59e0b', 'glossy'), k * 0.1, -0.18, 0.05), 0, 0, 0));
      });
      [-0.12, 0, 0.12].forEach((x) => g.add(rot(m(new RoundedBoxGeometry(0.1, 0.03, 0.32, 2, 0.01), M(), x, 0.22, -0.5), 0.3, x * 2, 0)));
      cur = 'wings';
      if (opt('wings') === 'propeller') { const pr = tool('propeller', '#e2e8f0', 0, 0.72, 0.28, 0.6); g.add(pr); }
      cur = null;
      break;
    }
    case 'dragon': {
      const bod = m(new THREE.CapsuleGeometry(0.28, 0.6, 8, 20), M(), 0, 0.15, 0); bod.rotation.x = Math.PI / 2; g.add(bod);
      g.add(rot(m(new THREE.CapsuleGeometry(0.13, 0.35, 6, 14), M(), 0, 0.42, 0.45), -0.7));
      g.add(m(new RoundedBoxGeometry(0.3, 0.24, 0.38, 4, 0.1), M(), 0, 0.62, 0.66));
      [-1, 1].forEach((k) => {
        cur = 'horns';
        if (opt('horns') === 'horns') g.add(rot(m(new THREE.ConeGeometry(0.04, 0.2, 8), mat('#f8fafc', 'glossy'), k * 0.1, 0.8, 0.6), -0.4));
        cur = null;
        g.add(m(new THREE.SphereGeometry(0.04, 10, 8), GLOW('#facc15'), k * 0.1, 0.68, 0.84));
        cur = 'wings';
        if (opt('wings') === 'wings') {
          const wing = new THREE.Group(); wing.position.set(k * 0.22, 0.3, 0.05);
          const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(0.75, 0.25); sh.lineTo(0.65, -0.05); sh.lineTo(0.45, -0.25); sh.lineTo(0.2, -0.3); sh.closePath();
          const wm = m(extrude(sh, 0.03, 0.01), mat('#a3e635', finish), 0, 0, 0); wm.rotation.x = -Math.PI / 2; wm.scale.x = k; wing.add(wm);
          wing.userData.flap = k; g.add(wing);
        }
        cur = null;
        [0.22, -0.22].forEach((z) => g.add(m(new THREE.CapsuleGeometry(0.06, 0.12, 4, 8), M(), k * 0.18, -0.12, z)));
      });
      g.add(rot(m(new THREE.ConeGeometry(0.14, 0.8, 14), M(), 0, 0.1, -0.75), -Math.PI / 2 + 0.2));
      [0.3, 0, -0.3].forEach((z) => g.add(rot(m(new THREE.ConeGeometry(0.06, 0.16, 6), mat('#facc15', 'glossy'), 0, 0.45, z), 0)));
      break;
    }
    /* ── More shapes ── */
    case 'pyramid': g.add(rot(m(new THREE.ConeGeometry(0.71, 1, 4), M()), 0, Math.PI / 4, 0)); break;
    case 'tube': g.add(m(new THREE.CylinderGeometry(0.5, 0.5, 1, 32, 1, true), mat(c, finish))); g.children[0].material.side = THREE.DoubleSide; [0.5, -0.5].forEach((y) => g.add(rot(m(new THREE.TorusGeometry(0.47, 0.05, 8, 32), M(), 0, y, 0), Math.PI / 2))); break;
    case 'heart': {
      const h = new THREE.Shape(); h.moveTo(0, -0.45); h.bezierCurveTo(-0.6, 0, -0.55, 0.5, -0.25, 0.48); h.bezierCurveTo(-0.08, 0.47, 0, 0.32, 0, 0.25); h.bezierCurveTo(0, 0.32, 0.08, 0.47, 0.25, 0.48); h.bezierCurveTo(0.55, 0.5, 0.6, 0, 0, -0.45);
      g.add(m(extrude(h, 0.8, 0.1), M())); break;
    }
    case 'hexagon': g.add(m(new THREE.CylinderGeometry(0.5, 0.5, 1, 6), M())); break;
    case 'disc': g.add(m(new THREE.CylinderGeometry(0.5, 0.5, 1, 40), M())); break;
    case 'arch': { const a = m(new THREE.TorusGeometry(0.38, 0.12, 14, 30, Math.PI), M(), 0, -0.43, 0); a.scale.set(1.05, 2.2, 3.5); g.add(a); break; }
    /* ── More moves ── */
    case 'rotor': {
      g.add(m(new THREE.CylinderGeometry(0.06, 0.08, 0.6, 12), DARK(), 0, -0.2, 0));
      const { outer, spin } = bladesAt(0.5, c, 0, 0.15, 0, 'y', 3); g.add(outer); g.userData.rotor = spin; break;
    }
    case 'ski': {
      g.add(m(new RoundedBoxGeometry(1, 0.3, 1, 2, 0.12), M(), 0, -0.35, 0));
      const tip = m(new THREE.TorusGeometry(0.3, 0.15, 8, 12, Math.PI / 2), M(), 0, -0.05, 0.5); tip.rotation.y = -Math.PI / 2; tip.scale.x = 3; g.add(tip);
      [-0.25, 0.25].forEach((z) => g.add(m(new THREE.CylinderGeometry(0.2, 0.2, 0.7, 8), CHROME(), 0, 0.1, z)));
      break;
    }
    /* ── More face parts ── */
    case 'headlight': {
      g.add(rot(m(new THREE.CylinderGeometry(0.5, 0.45, 1, 22), CHROME()), Math.PI / 2));
      g.add(m(new THREE.CircleGeometry(0.42, 22), GLOW(c), 0, 0, 0.51)); break;
    }
    case 'visor': {
      const v = m(new THREE.CylinderGeometry(0.6, 0.6, 1, 28, 1, true, -0.9, 1.8), new THREE.MeshPhysicalMaterial({ color: c, emissive: c, emissiveIntensity: 0.9, transparent: true, opacity: 0.85, roughness: 0.05, clearcoat: 1, side: THREE.DoubleSide }), 0, 0, -0.1);
      v.scale.set(0.85, 1, 1); g.add(v); break;
    }
    case 'horn': { const h = m(new THREE.ConeGeometry(0.5, 1, 18), M()); g.add(h); for (let i = 0; i < 3; i++) g.add(rot(m(new THREE.TorusGeometry(0.4 - i * 0.12, 0.04, 6, 18), mat('#f8fafc', 'glossy'), 0, -0.3 + i * 0.25, 0), Math.PI / 2)); break; }
    case 'nose': g.add(m(new THREE.SphereGeometry(0.5, 20, 14), M())); break;
    case 'eyebrow': g.add(rot(m(new THREE.CapsuleGeometry(0.4, 0.6, 4, 10), M()), 0, 0, Math.PI / 2)); g.children[0].scale.set(1, 0.7, 1); break;
    /* ── More tools ── */
    case 'spoiler': {
      g.add(m(new RoundedBoxGeometry(1, 0.15, 1, 2, 0.06), M(), 0, 0.42, 0));
      [-0.3, 0.3].forEach((x) => g.add(m(new THREE.BoxGeometry(0.06, 0.8, 0.4), M(), x, 0, 0)));
      [-1, 1].forEach((k) => g.add(m(new THREE.BoxGeometry(0.04, 0.5, 1), M(), k * 0.5, 0.3, 0))); break;
    }
    case 'exhaust': {
      g.add(rot(m(new THREE.CylinderGeometry(0.4, 0.45, 1, 16), CHROME()), Math.PI / 2));
      g.add(m(new THREE.CircleGeometry(0.3, 16), DARK(), 0, 0, -0.51)); g.children[1].rotation.y = Math.PI;
      const fl = m(new THREE.ConeGeometry(0.3, 0.6, 12), GLOW('#38bdf8'), 0, 0, -0.75); fl.rotation.x = -Math.PI / 2; fl.castShadow = false; g.add(fl); break;
    }
    case 'cannon': {
      g.add(m(new THREE.SphereGeometry(0.45, 18, 12), DARK(), 0, 0, -0.3));
      g.add(rot(m(new THREE.CylinderGeometry(0.3, 0.4, 1, 20), M(), 0, 0, 0.1), Math.PI / 2));
      g.add(rot(m(new THREE.TorusGeometry(0.33, 0.07, 8, 20), CHROME(), 0, 0, 0.58), 0)); break;
    }
    case 'shield': {
      const sh = new THREE.Shape(); sh.moveTo(-0.5, 0.5); sh.lineTo(0.5, 0.5); sh.lineTo(0.5, -0.05); sh.quadraticCurveTo(0.45, -0.35, 0, -0.5); sh.quadraticCurveTo(-0.45, -0.35, -0.5, -0.05); sh.closePath();
      g.add(m(extrude(sh, 0.6, 0.15), M()));
      g.add(m(new THREE.CircleGeometry(0.18, 5), mat('#facc15', 'metal'), 0, 0.08, 0.46)); break;
    }
    case 'sword': {
      g.add(m(new RoundedBoxGeometry(0.6, 0.7, 0.2, 2, 0.08), CHROME(), 0, 0.13, 0));
      g.add(m(new THREE.ConeGeometry(0.3, 0.2, 4), CHROME(), 0, 0.58, 0)); g.children[1].scale.z = 0.35;
      g.add(m(new RoundedBoxGeometry(1.6, 0.06, 0.5, 2, 0.02), mat('#facc15', 'metal'), 0, -0.24, 0));
      g.add(m(new THREE.CylinderGeometry(0.22, 0.22, 0.24, 10), M(), 0, -0.4, 0)); g.children[3].material = mat('#7c2d12', 'matte'); break;
    }
    case 'hammer': {
      g.add(m(new THREE.CylinderGeometry(0.1, 0.1, 0.9, 10), mat('#a16207', 'matte'), 0, -0.1, 0));
      g.add(m(new RoundedBoxGeometry(1, 0.35, 0.9, 3, 0.08), M(), 0, 0.35, 0)); break;
    }
    case 'saw': {
      const d = new THREE.Group();
      const sh = new THREE.Shape(); const n = 16;
      for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2; const r = i % 2 ? 0.43 : 0.5; const x = Math.cos(a) * r, y = Math.sin(a) * r; if (i) sh.lineTo(x, y); else sh.moveTo(x, y); }
      d.add(m(extrude(sh, 0.4, 0), CHROME()));
      d.add(m(new THREE.CylinderGeometry(0.12, 0.12, 1.1, 14), mat(c, finish))); d.children[1].rotation.x = Math.PI / 2;
      g.add(d); g.userData.drill = d; break;
    }
    case 'magnet': {
      g.add(m(new THREE.TorusGeometry(0.32, 0.15, 12, 24, Math.PI), M(), 0, 0.1, 0));
      [-0.32, 0.32].forEach((x) => { g.add(m(new THREE.BoxGeometry(0.3, 0.25, 0.3), M(), x, -0.12, 0)); g.add(m(new THREE.BoxGeometry(0.3, 0.15, 0.3), CHROME(), x, -0.32, 0)); }); break;
    }
    case 'flag': {
      g.add(m(new THREE.CylinderGeometry(0.06, 0.06, 1, 8), CHROME(), -0.45, 0, 0));
      const fg = new THREE.PlaneGeometry(0.9, 0.5, 8, 1); const pos = fg.attributes.position;
      for (let i = 0; i < pos.count; i++) pos.setZ(i, Math.sin((pos.getX(i) + 0.45) * 5) * 0.08);
      fg.computeVertexNormals();
      const fl = m(fg, mat(c, finish), 0, 0.22, 0); fl.material.side = THREE.DoubleSide; g.add(fl); break;
    }
    case 'tail': {
      const pts = []; for (let i = 0; i <= 12; i++) pts.push(new THREE.Vector3(0, Math.sin(i / 12 * Math.PI) * 0.25 - 0.1, 0.5 - i / 12));
      g.add(m(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, 0.35, 10), M()));
      g.add(m(new THREE.SphereGeometry(0.38, 14, 10), M(), 0, -0.1, -0.5)); break;
    }
    case 'fin': {
      const fs = new THREE.Shape(); fs.moveTo(0, -0.5); fs.lineTo(0.5, -0.5); fs.quadraticCurveTo(0.1, 0, -0.4, 0.5); fs.quadraticCurveTo(-0.3, -0.1, -0.5, -0.5); fs.closePath();
      g.add(rot(m(extrude(fs, 1, 0.05), M()), 0, Math.PI / 2, 0)); break;
    }
    default: g.add(m(new THREE.BoxGeometry(1, 1, 1), M()));
  }
  return g;
}

/** Make the 3D object for one piece record (used by the builder and the game). */
export function makePieceObject(piece, led = '#5eead4') {
  const holder = new THREE.Group();
  const model = pieceModel(piece.type, piece.c || PIECE_DEFAULTS[piece.type]?.c || '#6366f1', piece.f || 'glossy', led, piece.o);
  holder.add(model);
  holder.position.fromArray(piece.p || [0, 0, 0]);
  holder.rotation.set(...(piece.r || [0, 0, 0]));
  holder.scale.fromArray(piece.s || PIECE_DEFAULTS[piece.type]?.s || [0.5, 0.5, 0.5]);
  if (piece.mx) holder.scale.x *= -1; // the mirror-image twin of a piece on the other side
  holder.userData.pieceId = piece.id;
  holder.userData.pieceType = piece.type;
  return holder;
}

/** How a free-built robot moves in the games: from the parts it has. */
/**
 * What kind of Studio robot a build plays as (which worlds and courses it gets).
 * The main body decides first (a submarine swims, a digger digs, a robot arm builds), then
 * the parts (propellers fly, legs walk, tracks crawl, wheels drive).
 */
const BODY_PLAY = {
  sub: { chassisId: 'submarine', movementId: 'swim', moves: 'swims underwater' },
  boat: { chassisId: 'submarine', movementId: 'swim', moves: 'sails' },
  heli: { chassisId: 'helicopter', movementId: 'flying', moves: 'flies like a helicopter' },
  plane: { chassisId: 'jetplane', movementId: 'jets', moves: 'flies like a plane' },
  jetbody: { chassisId: 'jetplane', movementId: 'jets', moves: 'flies like a jet' },
  rocket: { chassisId: 'drone', movementId: 'flying', moves: 'blasts off' },
  ufo: { chassisId: 'hoverbot', movementId: 'hover', moves: 'hovers like a UFO' },
  tankbody: { chassisId: 'tank', movementId: 'tracks', moves: 'rolls on tracks' },
  motorbike: { chassisId: 'scout', movementId: 'wheels', moves: 'rides' },
  digger: { chassisId: 'miningbot', movementId: 'tracks', moves: 'digs' },
  firetruck: { chassisId: 'firebot', movementId: 'wheels', moves: 'puts out fires' },
  hovercar: { chassisId: 'hoverbot', movementId: 'hover', moves: 'hovers' },
  spiderbody: { chassisId: 'spider', movementId: 'legs', moves: 'walks on eight legs' },
  robodog: { chassisId: 'spider', movementId: 'legs', moves: 'trots on four legs' },
  mechbody: { chassisId: 'mech', movementId: 'legs', moves: 'stomps' },
  armbase: { chassisId: 'robotarm', movementId: 'wheels', moves: 'picks things up' },
  birdbody: { chassisId: 'drone', movementId: 'flying', moves: 'flaps and flies' },
  dragon: { chassisId: 'drone', movementId: 'flying', moves: 'flies like a dragon' },
};
export function freeBuildPlayAs(build) {
  const list = build?.pieces || [];
  const types = new Set(list.map((p) => p.type));
  const has = (...t) => t.some((x) => types.has(x));
  // The first body placed is the robot's main body
  const bodyPiece = list.find((p) => BODY_PLAY[p.type]);
  const body = bodyPiece?.type;
  if (body) {
    // Swapped the wheels for hover pads or tracks? Then it moves that way
    const drive = BODY_SLOTS[body]?.drive && slotValue(bodyPiece, 'drive');
    const base = BODY_PLAY[body];
    if (drive === 'hover' && base.movementId !== 'hover') return { chassisId: 'hoverbot', movementId: 'hover', moves: 'hovers', body };
    if (drive === 'tracks' && base.movementId === 'wheels') return { chassisId: body === 'firetruck' ? 'firebot' : 'tank', movementId: 'tracks', moves: 'rolls on tracks', body };
    if (body === 'tankbody' && ['wheels', 'bigwheels'].includes(drive)) return { chassisId: 'rover', movementId: 'wheels', moves: 'drives', body };
    if (body === 'birdbody' && slotValue(bodyPiece, 'wings') === 'propeller') return { chassisId: 'drone', movementId: 'flying', moves: 'flies with a propeller', body };
    return { ...base, body };
  }
  // Car, race car and truck bodies: on hover pads they hover, on tracks they crawl
  const car = list.find((p) => ['carbody', 'racecar', 'truck'].includes(p.type));
  if (car && !has('propeller', 'rotor', 'leg')) {
    const d = slotValue(car, 'drive');
    if (d === 'hover') return { chassisId: 'hoverbot', movementId: 'hover', moves: 'hovers' };
    if (d === 'tracks') return { chassisId: 'tank', movementId: 'tracks', moves: 'rolls on tracks' };
  }
  if (has('propeller', 'rotor') || (types.has('jet') && !has('wheel', 'bigwheel', 'leg'))) {
    return { chassisId: 'drone', movementId: 'flying', moves: 'flies' };
  }
  if (types.has('leg')) {
    const n = list.filter((p) => p.type === 'leg').length;
    return n >= 4 ? { chassisId: 'spider', movementId: 'legs', moves: 'walks on many legs' } : { chassisId: 'droid', movementId: 'legs', moves: 'walks' };
  }
  if (has('track')) return { chassisId: 'tank', movementId: 'tracks', moves: 'drives on tracks' };
  if (has('wheel', 'bigwheel', 'ballwheel', 'carbody', 'racecar', 'truck')) return { chassisId: 'rover', movementId: 'wheels', moves: 'drives' };
  if (has('hover', 'ski')) return { chassisId: 'hoverbot', movementId: 'hover', moves: has('ski') ? 'skis' : 'hovers' };
  return { chassisId: 'rover', movementId: 'wheels', moves: 'slides' };
}

/**
 * How the build would perform, from its parts (1–5 each), with one engineering tip.
 * Speed: what moves it, minus its weight, plus spoilers / exhausts / jets.
 * Grip: tracks and lots of wheels hold the road; skis and hover pads slide.
 * Weight: how much stuff it's made of (bigger parts weigh more).
 * Tools: arms, claws, drills, magnets… what jobs it can do.
 */
const TOOL_TYPES = new Set(['arm', 'claw', 'hand', 'drill', 'magnet', 'saw', 'hammer', 'cannon', 'blaster', 'shield']);
const BODY_TOOLS = { digger: 1, armbase: 2, firetruck: 1 };  // bodies with a built-in scoop, gripper or ladder
export function robotStats(build) {
  const list = build?.pieces || [];
  const count = (...t) => list.filter((p) => t.includes(p.type)).length;
  const size = (p) => Math.abs((p.s?.[0] ?? 1) * (p.s?.[1] ?? 1) * (p.s?.[2] ?? 1));
  const play = freeBuildPlayAs(build);
  const bulk = list.reduce((a, p) => a + Math.min(3, size(p)) * (BODY_TYPES.has(p.type) ? 2.2 : 0.6), 0);
  const weight = Math.max(1, Math.min(5, Math.round(1 + bulk / 3)));
  // Car, race car and truck bodies come with their own four wheels; a tank body has tracks
  // Bodies bring their own wheels or tracks (unless they've been swapped or taken off)
  const builtIn = (kind) => list.reduce((a, p) => {
    const d = slotValue(p, 'drive');
    if (!d) return a;
    if (kind === 'wheels' && ['wheels', 'bigwheels'].includes(d)) return a + (p.type === 'motorbike' ? 2 : 4);
    if (kind === 'tracks' && d === 'tracks') return a + 1;
    if (kind === 'big' && d === 'bigwheels') return a + 1;
    return a;
  }, 0);
  const wheels = count('wheel', 'bigwheel', 'ballwheel') + builtIn('wheels');
  const tracks = count('track') + builtIn('tracks');
  const flying = ['flying', 'jets'].includes(play.movementId);
  const legged = play.movementId === 'legs';
  const base = flying ? 4 : tracks ? 2 : legged ? 1.5 : play.movementId === 'hover' ? 3.5 : play.movementId === 'swim' ? 2.5 : wheels ? 3 : count('hover', 'ski') ? 3.5 : 1;
  const boosters = Math.min(1.5, count('spoiler', 'exhaust') * 0.5 + count('jet') * 0.75 + (count('racecar') ? 1 : 0));
  const speed = Math.max(1, Math.min(5, Math.round(base + boosters - (weight - 2) * 0.5)));
  const grip = flying ? 0 : Math.max(1, Math.min(5, Math.round(
    tracks ? 5 : legged ? 3 : play.movementId === 'hover' ? 1.5 : wheels >= 6 ? 5 : wheels >= 4 ? 4 : wheels >= 2 ? 2.5 : count('hover', 'ski') ? 1.5 : 1,
  ) + (count('bigwheel') || builtIn('big') ? 1 : 0) - (count('hover', 'ski') && wheels ? 0 : 0)));
  const tools = Math.min(5, count(...TOOL_TYPES) + list.reduce((a, p) => a + (BODY_TOOLS[p.type] && slotValue(p, 'tool') !== 'none' ? BODY_TOOLS[p.type] : 0), 0));
  let tip;
  if (!list.length) tip = 'Add a body to start.';
  else if (!flying && !wheels && !tracks && !legged && !['hover', 'swim'].includes(play.movementId) && !count('hover', 'ski') && play.body !== 'armbase') tip = 'Your robot has nothing to move on: add wheels, tracks or legs.';
  else if (weight >= 4 && speed <= 2) tip = 'It\'s heavy, so it\'s slow. Try smaller parts, or add a spoiler or jet.';
  else if (play.body === 'motorbike' && grip <= 3) tip = 'Motorbikes lean into corners: slow down before the bends.';
  else if (play.movementId === 'hover' && grip <= 2) tip = 'Hovering is fast but slides on corners: brake early before the bends.';
  else if (!flying && wheels > 0 && wheels < 4 && !tracks) tip = 'Add more wheels for better grip on corners (4 is good, 6 is great).';
  else if (speed >= 4 && grip <= 2 && !flying) tip = 'Fast but slippery! More wheels or a track would help it corner.';
  else if (!tools) tip = 'Add an arm, claw or magnet so it can pick things up.';
  else if (!count('eye', 'screen', 'headlight', 'visor')) tip = 'Give it eyes or a screen so it has a face.';
  else tip = 'Nice balance! Test drive it to see how it handles.';
  return { speed, grip, weight, tools, flying, tip };
}

/** The whole robot, standing on the ground, facing +z. */
export function buildFreeRobot(build = {}, led = '#5eead4') {
  const root = new THREE.Group();
  root.name = 'FreeBuildRobot';
  const inner = new THREE.Group();
  root.add(inner);
  const rotors = [], legs = [], drills = [], flaps = [], turns = [];
  (build.pieces || []).forEach((p, i) => {
    const o = makePieceObject(p, led);
    inner.add(o);
    o.traverse((n) => {
      if (n.userData.rotor) rotors.push(n.userData.rotor);
      if (n.userData.leg) legs.push({ hip: n.userData.leg, phase: n.userData.legPhase ?? ((p.p?.[0] || 0) > 0 ? Math.PI : 0), swing: n.userData.legSwing || 'x', i });
      if (n.userData.flap) flaps.push(n);
      if (n.userData.turntable) turns.push(n.userData.turntable);
      if (n.userData.drill) drills.push(n.userData.drill);
    });
  });
  if (!inner.children.length) inner.add(makePieceObject({ id: 'x', type: 'block', p: [0, 0.22, 0] }, led));
  // Stand it on the ground
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(inner);
  if (!box.isEmpty()) inner.position.y = -box.min.y;
  root.userData.freeBuild = true;
  root.userData.animate = (t = 0, dt = 0.016) => {
    rotors.forEach((r, i) => { r.rotation.y += (i % 2 ? -1 : 1) * 20 * dt; });
    legs.forEach(({ hip, phase, swing }) => {
      if (swing === 'y') { hip.userData.baseY ??= hip.rotation.y; hip.rotation.y = hip.userData.baseY + Math.sin(t * 6 + phase) * 0.18; }
      else hip.rotation.x = Math.sin(t * 3.2 + phase) * 0.3;
    });
    flaps.forEach((w) => { w.rotation.z = Math.sin(t * 9) * 0.45 * w.userData.flap; });
    turns.forEach((tt) => { tt.rotation.y = Math.sin(t * 0.8) * 0.6; });
    drills.forEach((d) => { d.rotation.z += 12 * dt; });
  };
  return root;
}

let _n = 0;
export const newPieceId = () => `p${Date.now().toString(36)}${(_n++).toString(36)}`;
