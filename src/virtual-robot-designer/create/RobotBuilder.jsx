/**
 * Robot Builder — build your own robot in 3D, like LEGO.
 * Pick a part from the tray and a see-through "ghost" of it follows the pointer, snapping onto
 * whatever it touches: the build plate or any part of the robot. Click to stick it on.
 * Mirror mode adds the matching part on the other side. Wheels go on the sides, legs and
 * hover pads go underneath and stand the robot up. Then Move, Paint, Turn or Delete parts.
 * The robot is saved as a list of pieces (freeBuild.js) and drives in Robot Studio.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createSimWebGLRenderer } from '../services/art-direction.js';
import { PIECE_GROUPS, PIECE_INFO, PIECE_DEFAULTS, makePieceObject, freeBuildPlayAs, newPieceId, robotStats, BODY_SLOTS, SLOT_LABELS, slotValue } from './freeBuild.js';
import { pieceThumb } from './pieceThumbs.js';
import { EmojiIcon, IconText } from '../../components/ui/Icon.jsx';

const SWATCHES = ['#ef4444', '#f97316', '#facc15', '#84cc16', '#22c55e', '#14b8a6', '#0ea5e9', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#f8fafc', '#94a3b8', '#475569', '#1f2937', '#92400e'];
const LIGHTS = ['#5eead4', '#22d3ee', '#60a5fa', '#a78bfa', '#f472b6', '#facc15', '#4ade80', '#fb7185'];
const FINISHES = [['matte', 'Matte'], ['glossy', 'Shiny'], ['metal', 'Metal'], ['chrome', 'Chrome'], ['glow', 'Glow']];
const NAMES = ['Sparky', 'Bolt', 'Pixel', 'Zippy', 'Captain Cog', 'Nova', 'Widget', 'Tinker', 'Robo-Rex', 'Gizmo', 'Comet', 'Turbo', 'Echo', 'Rusty', 'Blink', 'Chip'];
const TOOLS = [
  ['build', 'Build', '🧱', 'B'], ['move', 'Move', '✋', 'M'], ['paint', 'Paint', '🎨', 'P'], ['turn', 'Turn', '🔄', 'T'], ['erase', 'Delete', '🗑', 'X'],
];
const SNAP = 0.025;
const snap = (v) => Math.round(v / SNAP) * SNAP;
const r3 = (v) => Math.round(v * 1000) / 1000;
const V = (x, y, z) => new THREE.Vector3(x, y, z);

/* ── How each part attaches ──
 * out: the part's own direction that points away from the surface it is stuck to.
 * Shapes stand on their base (+Y); faces look out (+Z); wheels stick out sideways (+X);
 * exhausts and tails point backwards (-Z); jets fire their flame outwards (-Y). */
const FACE = new Set(['eye', 'screen', 'mouth', 'headlight', 'visor', 'nose', 'eyebrow', 'blaster', 'claw', 'drill', 'cannon', 'saw', 'magnet', 'shield', 'hand']);
const SIDE = new Set(['wheel', 'bigwheel', 'track', 'wing']);
const BACK = new Set(['exhaust', 'tail']);
const UNDER = new Set(['leg', 'hover', 'ballwheel', 'ski']);
function outAxis(type) {
  if (FACE.has(type)) return V(0, 0, 1);
  if (SIDE.has(type)) return V(1, 0, 0);
  if (BACK.has(type)) return V(0, 0, -1);
  if (type === 'jet') return V(0, -1, 0);
  return V(0, 1, 0);
}

/** The part's own box at a given size (unrotated). */
const boxCache = new Map();
function localBox(type, s) {
  const key = `${type}|${s.join(',')}`;
  if (boxCache.has(key)) return boxCache.get(key);
  const o = makePieceObject({ id: 'probe', type, p: [0, 0, 0], r: [0, 0, 0], s });
  o.updateMatrixWorld(true);
  const b = new THREE.Box3().setFromObject(o);
  boxCache.set(key, b);
  return b;
}
/** How far the part's origin sits from the surface along its out axis. */
function standOff(box, a) {
  if (a.x > 0.5) return -box.min.x;
  if (a.x < -0.5) return box.max.x;
  if (a.y > 0.5) return -box.min.y;
  if (a.y < -0.5) return box.max.y;
  if (a.z > 0.5) return -box.min.z;
  return box.max.z;
}

const quatOf = (r) => new THREE.Quaternion().setFromEuler(new THREE.Euler(r[0], r[1], r[2]));
const eulerOf = (q) => { const e = new THREE.Euler().setFromQuaternion(q); return [r3(e.x), r3(e.y), r3(e.z)]; };
/** The mirror image of a piece across the robot's middle (x → -x). */
function mirrored(piece, id) {
  const q = quatOf(piece.r);
  const qm = new THREE.Quaternion(q.x, -q.y, -q.z, q.w);
  return { ...piece, id, p: [r3(-piece.p[0]), piece.p[1], piece.p[2]], r: eulerOf(qm), mx: !piece.mx };
}

/** A few ideas to start from (children can change every piece). */
const P = (type, p, extra = {}) => ({ id: newPieceId(), type, p, r: [0, 0, 0], s: PIECE_DEFAULTS[type].s.slice(), c: PIECE_DEFAULTS[type].c, f: 'glossy', ...extra });
const pair = (a) => { const b = mirrored(a, newPieceId()); a.m = b.id; b.m = a.id; return [a, b]; };
const IDEAS = {
  rover: () => [
    P('block', [0, 0.45, 0], { s: [0.8, 0.4, 1], c: '#0ea5e9' }), P('block', [0, 0.85, -0.05], { s: [0.55, 0.4, 0.5], c: '#f8fafc' }),
    P('screen', [0, 0.85, 0.21]), P('antenna', [0.18, 1.25, -0.1]),
    ...pair(P('wheel', [0.5, 0.2, 0.3])), ...pair(P('wheel', [0.5, 0.2, -0.3])),
  ],
  walker: () => [
    P('capsule', [0, 1.05, 0], { s: [0.45, 0.7, 0.4], c: '#a855f7' }), P('ball', [0, 1.6, 0], { s: [0.42, 0.42, 0.42], c: '#f8fafc' }),
    ...pair(P('eye', [0.09, 1.65, 0.18])), P('mouth', [0, 1.5, 0.2], { s: [0.12, 0.05, 0.04] }),
    ...pair(P('leg', [0.13, 0.35, 0])), ...pair(P('arm', [0.32, 1.05, 0], { r: [0, 0, -0.3] })),
  ],
  drone: () => [
    P('dome', [0, 0.35, 0], { s: [0.6, 0.35, 0.6], c: '#f97316' }), P('plate', [0, 0.3, 0], { s: [1.1, 0.06, 0.18], c: '#334155' }), P('plate', [0, 0.3, 0], { s: [0.18, 0.06, 1.1], c: '#334155' }),
    ...pair(P('propeller', [0.55, 0.4, 0], { s: [0.45, 0.12, 0.45] })), P('propeller', [0, 0.4, 0.55], { s: [0.45, 0.12, 0.45] }), P('propeller', [0, 0.4, -0.55], { s: [0.45, 0.12, 0.45] }),
    P('eye', [0, 0.45, 0.27], { s: [0.14, 0.14, 0.14] }),
  ],
  car: () => [
    P('carbody', [0, 0.3, 0], { s: [0.9, 0.9, 0.9], c: '#ef4444' }),
    ...pair(P('eye', [0.14, 0.62, 0.4], { s: [0.15, 0.15, 0.15] })), P('spoiler', [0, 0.62, -0.62], { s: [0.7, 0.2, 0.22] }),
  ],
  spider: () => [P('spiderbody', [0, 0.38, 0]), P('antenna', [0, 0.62, -0.25], { s: [0.08, 0.3, 0.08] })],
  dog: () => [P('robodog', [0, 0.3, 0]), P('light', [0, 0.88, 0.4], { s: [0.1, 0.1, 0.1], c: '#f472b6' })],
  sub: () => [
    P('sub', [0, 0.3, 0], { c: '#facc15' }), ...pair(P('eye', [0.12, 0.42, 0.6], { s: [0.13, 0.13, 0.13] })),
    ...pair(P('fin', [0.3, 0.3, -0.3], { s: [0.05, 0.25, 0.3] })),
  ],
  digger: () => [P('digger', [0, 0.32, 0]), P('light', [0.12, 0.92, -0.15], { s: [0.12, 0.12, 0.12], c: '#f97316' })],
  arm: () => [P('armbase', [0, 0.35, 0])],
  fire: () => [P('firetruck', [0, 0.36, 0]), ...pair(P('eye', [0.16, 0.5, 0.78], { s: [0.12, 0.12, 0.12] }))],
  mech: () => [P('mechbody', [0, 0.36, 0]), P('cannon', [0.5, 0.85, 0.2], { s: [0.16, 0.16, 0.4] })],
  bike: () => [P('motorbike', [0, 0.32, 0]), P('flag', [0, 0.75, -0.4], { s: [0.2, 0.4, 0.04], c: '#facc15' })],
  bird: () => [P('birdbody', [0, 0.28, 0])],
  dragon: () => [P('dragon', [0, 0.28, 0])],
  hover: () => [P('hovercar', [0, 0.35, 0]), ...pair(P('eye', [0.14, 0.5, 0.35], { s: [0.12, 0.12, 0.12] }))],
};

/** A see-through copy of a part, used as the placement ghost. */
function ghostify(obj, ok = true) {
  obj.traverse((n) => {
    if (!n.isMesh) return;
    const mats = Array.isArray(n.material) ? n.material : [n.material];
    n.material = mats.map((m) => {
      const g = m.clone();
      g.transparent = true; g.opacity = 0.55; g.depthWrite = false;
      if ('emissive' in g) { g.emissive = new THREE.Color(ok ? 0x22c55e : 0xef4444); g.emissiveIntensity = 0.35; }
      return g;
    });
    if (n.material.length === 1) n.material = n.material[0];
    n.castShadow = false;
    n.raycast = () => {};
  });
  return obj;
}

/** A soft studio backdrop: a vertical gradient in the scene background. */
function studioBackground() {
  const c = document.createElement('canvas'); c.width = 4; c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, '#dbeafe'); grad.addColorStop(0.55, '#ede9fe'); grad.addColorStop(1, '#fdf2f8');
  g.fillStyle = grad; g.fillRect(0, 0, 4, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** What to call a body's swappable part in messages ("the wheels", "the scoop"). */
function partName(piece, slot) {
  const v = slotValue(piece, slot);
  const label = BODY_SLOTS[piece?.type]?.[slot]?.find(([id]) => id === v)?.[1];
  // Ears, tail, horns, shoulders: name the part itself, not its style ("the ears", not "the pointy")
  if (['ears', 'tail', 'horns', 'shoulders'].includes(slot) && v !== 'cannons') return (SLOT_LABELS[slot] || slot).toLowerCase();
  if (!label || v === 'none' || v === 'on') return (SLOT_LABELS[slot] || slot).toLowerCase().replace('moves on', 'wheels');
  return label.toLowerCase();
}

/** "them" for wheels, tracks, ears…; "it" for a scoop or a tail. */
const partIt = (piece, slot) => (['ears', 'horns', 'wings', 'shoulders'].includes(slot) || ['wheels', 'bigwheels', 'tracks', 'hover', 'pads', 'cannons'].includes(slotValue(piece, slot)) || slot === 'drive' ? 'them' : 'it');

export default function RobotBuilder({ initial, onSave, onPlay, onBack }) {
  const [pieces, setPieces] = useState(() => initial?.build?.pieces?.map((p) => ({ ...p })) || []);
  const [tool, setTool] = useState('build');
  const [part, setPart] = useState(null); // the part type being placed
  const [group, setGroup] = useState('bodies');
  const [spin, setSpin] = useState(0); // 90° turns of the ghost around its out axis
  const [mirror, setMirror] = useState(true);
  const [statsOpen, setStatsOpen] = useState(true);
  const [paintColor, setPaintColor] = useState('#ef4444');
  const [sel, setSel] = useState(null);
  const [name, setName] = useState(initial?.name || NAMES[Math.floor(Math.random() * NAMES.length)]);
  const [led, setLed] = useState(initial?.ledColor || '#5eead4');
  const [saved, setSaved] = useState(false);
  const [robotId, setRobotId] = useState(initial?.id);
  const [ideasOpen, setIdeasOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [slotMenu, setSlotMenu] = useState(null);   // { pieceId, slot, x, y }: the swap menu by a clicked part
  const [hoverSlot, setHoverSlot] = useState(null); // { pieceId, slot } under the pointer
  const hist = useRef({ past: [], future: [] });
  const hostRef = useRef(null);
  const three = useRef({});
  const live = useRef({});
  live.current = { pieces, tool, part, spin, mirror, paintColor, sel, led };

  const say = (t) => { setToast(t); clearTimeout(say.t); say.t = setTimeout(() => setToast(''), 2200); };
  const commit = useCallback((next) => {
    hist.current.past.push(live.current.pieces); if (hist.current.past.length > 100) hist.current.past.shift(); hist.current.future = [];
    setPieces(next); setSaved(false);
  }, []);
  const undo = () => { const h = hist.current; if (!h.past.length) return; h.future.push(pieces); setPieces(h.past.pop()); setSel(null); };
  const redo = () => { const h = hist.current; if (!h.future.length) return; h.past.push(pieces); setPieces(h.future.pop()); setSel(null); };
  /** Change a piece (and its mirror twin, while mirror mode is on). */
  const editPiece = (id, fn) => {
    const list = live.current.pieces;
    const p = list.find((x) => x.id === id); if (!p) return;
    const twin = live.current.mirror && p.m ? list.find((x) => x.id === p.m) : null;
    commit(list.map((x) => {
      if (x.id === p.id) return { ...x, ...fn(x) };
      if (twin && x.id === twin.id) { const patch = fn(x); delete patch.p; delete patch.r; return { ...x, ...patch }; }
      return x;
    }));
  };
  /** Move or turn a piece; its mirror twin (mirror mode on) follows as a mirror image. */
  const placePiece = (id, p, r) => {
    const list = live.current.pieces;
    const piece = list.find((x) => x.id === id); if (!piece) return;
    const twin = live.current.mirror && piece.m ? list.find((x) => x.id === piece.m) : null;
    const tw = twin ? mirrored({ ...piece, p, r }, twin.id) : null;
    commit(list.map((x) => (x.id === id ? { ...x, p, r } : tw && x.id === twin.id ? { ...x, p: tw.p, r: tw.r } : x)));
  };
  const removePiece = (id) => {
    const list = live.current.pieces;
    const p = list.find((x) => x.id === id); if (!p) return;
    const gone = new Set([id, ...(live.current.mirror && p.m ? [p.m] : [])]);
    commit(list.filter((x) => !gone.has(x.id)).map((x) => (x.m && gone.has(x.m) ? { ...x, m: undefined } : x)));
    if (gone.has(live.current.sel)) setSel(null);
  };

  /**
   * Where a part would go if dropped at this raycast hit: position, rotation and, for parts
   * that go underneath (legs, hover pads), how far to lift the robot so it stands on them.
   */
  const placement = (type, hit, list, scaleOverride) => {
    const s = (scaleOverride || PIECE_DEFAULTS[type].s).slice();
    const n = hit.normal.clone();
    const pt = hit.point.clone();
    if (UNDER.has(type)) {
      // Underneath whatever was clicked; legs stretch to reach the floor
      const hb = hit.pieceBox;
      const x = hb ? THREE.MathUtils.clamp(pt.x, hb.min.x + 0.05, hb.max.x - 0.05) : pt.x;
      const z = hb ? THREE.MathUtils.clamp(pt.z, hb.min.z + 0.05, hb.max.z - 0.05) : pt.z;
      let under = hb ? hb.min.y : 0.6;
      const lb = localBox(type, s);
      const need = type === 'leg' ? 0.55 : (lb.max.y - lb.min.y) + 0.02;
      const lift = hb && under < need ? need - under : 0;
      under += lift;
      if (type === 'leg') {
        const s1 = under / 1.36;
        return { p: [snap(x), r3(0.94 * s1), snap(z)], r: [0, 0, 0], s: [s[0], r3(s1), s[2]], lift };
      }
      return { p: [snap(x), r3(under - lb.max.y), snap(z)], r: [0, 0, 0], s, lift };
    }
    if (type === 'arm' && Math.abs(n.y) < 0.6) {
      // Arms hang from the shoulder where you click
      const side = Math.sign(n.x) || 1;
      return { p: [snap(pt.x + n.x * s[0] * 0.45), r3(pt.y - 0.42 * s[1]), snap(pt.z + n.z * s[0] * 0.45)], r: [0, 0, r3(-side * 0.18)], s, lift: 0 };
    }
    let a = outAxis(type);
    // Wheels only turn to face sideways; on top or the front they keep rolling forwards
    if (SIDE.has(type) && Math.abs(n.x) < 0.5) a = null;
    const q = new THREE.Quaternion();
    if (a) q.setFromUnitVectors(a, n);
    const spin = live.current.spin;
    if (spin) q.premultiply(new THREE.Quaternion().setFromAxisAngle(n, (spin * Math.PI) / 2));
    const lb = localBox(type, s);
    const d = a ? standOff(lb, a) : (Math.abs(n.y) > 0.5 ? (n.y > 0 ? -lb.min.y : lb.max.y) : Math.abs(n.x) > 0.5 ? (n.x > 0 ? -lb.min.x : lb.max.x) : (n.z > 0 ? -lb.min.z : lb.max.z));
    const p = pt.add(n.multiplyScalar(d * 0.98));
    // Middle magnet: a part that would overlap its own mirror copy goes in the middle instead
    const halfW = Math.max(lb.max.x - lb.min.x, lb.max.z - lb.min.z) / 2;
    if (Math.abs(n.x) < 0.5 && Math.abs(p.x) < Math.max(0.04, halfW * 0.9)) p.x = 0;
    // The first part on an empty plate goes in the middle
    if (!list.length) { p.x = 0; p.z = THREE.MathUtils.clamp(p.z, -0.4, 0.4); }
    return { p: [snap(p.x), r3(Math.max(p.y, 0)), snap(p.z)], r: eulerOf(q), s, lift: 0 };
  };

  /* ── The 3D workshop ── */
  useEffect(() => {
    const host = hostRef.current;
    const renderer = createSimWebGLRenderer({ antialias: true });
    if (!renderer) return undefined;
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    Object.assign(renderer.domElement.style, { width: '100%', height: '100%', display: 'block', touchAction: 'none' });
    host.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.background = studioBackground();
    scene.add(new THREE.HemisphereLight(0xffffff, 0xc7d2fe, 1.5));
    const sun = new THREE.DirectionalLight(0xffffff, 2.3); sun.position.set(3, 7, 5); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -3, right: 3, top: 3, bottom: -3 }); sun.shadow.bias = -0.0004; scene.add(sun);
    const rim = new THREE.DirectionalLight(0xc4b5fd, 1.1); rim.position.set(-4, 3, -4); scene.add(rim);
    // The floor and the round build plate
    const floor = new THREE.Mesh(new THREE.CircleGeometry(14, 64), new THREE.MeshStandardMaterial({ color: 0xf3e8ff, roughness: 0.95 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -0.13; floor.receiveShadow = true; scene.add(floor);
    const plate = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.2, 0.12, 72), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55, metalness: 0.05 }));
    plate.position.y = -0.06; plate.receiveShadow = true; plate.name = 'plate'; scene.add(plate);
    const edge = new THREE.Mesh(new THREE.TorusGeometry(2.12, 0.035, 10, 120), new THREE.MeshStandardMaterial({ color: 0xa78bfa, emissive: 0x8b5cf6, emissiveIntensity: 0.6 }));
    edge.rotation.x = Math.PI / 2; scene.add(edge);
    const grid = new THREE.GridHelper(4, 16, 0xc4b5fd, 0xe0e7ff); grid.position.y = 0.002; scene.add(grid);
    const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.34, 3), new THREE.MeshBasicMaterial({ color: 0x22c55e }));
    arrow.rotation.x = Math.PI / 2; arrow.position.set(0, 0.012, 1.8); scene.add(arrow);
    const lc = document.createElement('canvas'); lc.width = 256; lc.height = 64; const lx = lc.getContext('2d');
    lx.fillStyle = '#16a34a'; lx.font = 'bold 40px Arial'; lx.textAlign = 'center'; lx.fillText('FRONT', 128, 46);
    const label = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.2), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(lc), transparent: true }));
    label.rotation.x = -Math.PI / 2; label.position.set(0, 0.012, 1.5); scene.add(label);
    // Mirror line: shows where the middle of the robot is
    const mid = new THREE.Mesh(new THREE.PlaneGeometry(0.012, 4), new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.6 }));
    mid.rotation.x = -Math.PI / 2; mid.position.y = 0.004; scene.add(mid);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.05, 100);
    camera.position.set(1.75, 1.25, 2.45);
    const orbit = new OrbitControls(camera, renderer.domElement);
    orbit.target.set(0, 0.35, 0); orbit.enableDamping = true; orbit.minDistance = 1.3; orbit.maxDistance = 9; orbit.maxPolarAngle = Math.PI * 0.495;
    const robot = new THREE.Group(); scene.add(robot);
    const ghostRoot = new THREE.Group(); scene.add(ghostRoot);
    const hover = new THREE.BoxHelper(undefined, 0xf59e0b); hover.visible = false; scene.add(hover);
    const selBox = new THREE.BoxHelper(undefined, 0x8b5cf6); selBox.visible = false; scene.add(selBox);
    const partBox = new THREE.Box3(); const partHelper = new THREE.Box3Helper(partBox, 0x22c55e); partHelper.visible = false; scene.add(partHelper);
    let hovered = '';
    /** Outline one swappable part of a body in green, and say what it is. */
    const showPart = (hit) => {
      const key = hit?.slot ? `${hit.pieceId}|${hit.slot}` : '';
      if (key === hovered) return;
      hovered = key;
      partHelper.visible = false;
      if (key) {
        partBox.makeEmpty();
        hit.holder.updateMatrixWorld(true);
        hit.holder.traverse((n) => { if (n.isMesh && n.userData.slot === hit.slot) partBox.expandByObject(n); });
        partBox.expandByScalar(0.02);
        partHelper.visible = !partBox.isEmpty();
      }
      setHoverSlot(key ? { pieceId: hit.pieceId, slot: hit.slot } : null);
    };
    const stagePos = (e) => { const r = host.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };

    const resize = () => {
      const w = host.clientWidth || 600, h = host.clientHeight || 450;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(host);

    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const nm = new THREE.Matrix3();
    /** What's under the pointer: a robot piece (with its world box) or the plate. */
    const pick = (e, skipId) => {
      const r = renderer.domElement.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const targets = robot.children.filter((o) => o.userData.pieceId !== skipId);
      const hits = ray.intersectObjects([...targets, plate], true);
      for (const h of hits) {
        let o = h.object;
        while (o && !o.userData.pieceId && o !== plate) o = o.parent;
        if (!o) continue;
        const normal = h.face ? h.face.normal.clone().applyMatrix3(nm.getNormalMatrix(h.object.matrixWorld)).normalize() : V(0, 1, 0);
        if (o === plate) return { point: h.point.clone(), normal: V(0, 1, 0), plate: true };
        // A swappable part of a body (its wheels, scoop, ears…)
        let sl = h.object; while (sl && sl !== o && !sl.userData.slot) sl = sl.parent;
        const slot = sl && sl !== o ? sl.userData.slot : null;
        return { point: h.point.clone(), normal, pieceId: o.userData.pieceId, holder: o, slot, pieceBox: new THREE.Box3().setFromObject(o) };
      }
      return null;
    };

    // Ghost of the part being placed (or dragged)
    let ghost = null, ghostKey = '';
    const showGhost = (type, place, piece) => {
      const key = `${type}|${place.s.join(',')}|${piece?.c || ''}|${piece?.mx || ''}`;
      if (key !== ghostKey) {
        ghostRoot.clear();
        ghost = ghostify(makePieceObject({ id: 'ghost', type, p: [0, 0, 0], r: [0, 0, 0], s: place.s, c: piece?.c, f: piece?.f, mx: piece?.mx }, live.current.led));
        ghostRoot.add(ghost);
        if (live.current.mirror) {
          const twin = ghostify(makePieceObject({ id: 'ghost2', type, p: [0, 0, 0], r: [0, 0, 0], s: place.s, c: piece?.c, f: piece?.f, mx: !piece?.mx }, live.current.led));
          twin.name = 'twin'; ghostRoot.add(twin);
        }
        ghostKey = key;
      }
      ghost.position.fromArray(place.p); ghost.rotation.set(...place.r);
      const twin = ghostRoot.getObjectByName('twin');
      if (twin) {
        const m = mirrored({ p: place.p, r: place.r }, 'x');
        twin.visible = live.current.mirror && Math.abs(place.p[0]) > 0.03;
        twin.position.fromArray(m.p); twin.rotation.set(...m.r);
      }
      ghostRoot.visible = true;
    };
    const hideGhost = () => { ghostRoot.visible = false; };

    let down = null, drag = null, lastPlace = null;
    const onMove = (e) => {
      const L = live.current;
      if (drag) {
        const hit = pick(e, drag.id);
        if (hit) {
          const pl = placement(drag.piece.type, hit, L.pieces, drag.piece.s);
          lastPlace = { ...pl, hit };
          showGhost(drag.piece.type, pl, drag.piece);
          drag.holder.visible = false;
        }
        return;
      }
      if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) { hideGhost(); hover.visible = false; return; }
      const hit = pick(e);
      if (L.tool === 'build' && L.part) {
        if (hit) { const pl = placement(L.part, hit, L.pieces); lastPlace = { ...pl, hit }; showGhost(L.part, pl); } else hideGhost();
        hover.visible = false; showPart(null);
      } else {
        hideGhost();
        if (hit?.holder) { hover.setFromObject(hit.holder); hover.visible = !hit.slot; renderer.domElement.style.cursor = 'pointer'; } else { hover.visible = false; renderer.domElement.style.cursor = ''; }
        showPart(L.tool === 'paint' || L.tool === 'turn' ? null : hit);
      }
    };
    const onDown = (e) => {
      if (e.button !== 0) return;
      down = { x: e.clientX, y: e.clientY };
      const L = live.current;
      if (L.tool === 'move') {
        const hit = pick(e);
        if (hit?.holder) {
          const piece = L.pieces.find((p) => p.id === hit.pieceId);
          if (piece) { drag = { id: piece.id, piece, holder: hit.holder, slot: hit.slot, at: stagePos(e), startX: e.clientX, startY: e.clientY, moved: false }; orbit.enabled = false; }
        }
      }
    };
    const onUp = (e) => {
      const L = live.current;
      if (drag) {
        const moved = Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY) > 6;
        drag.holder.visible = true; hideGhost(); orbit.enabled = true;
        if (moved && lastPlace) {
          placePiece(drag.piece.id, lastPlace.p, lastPlace.r);
        } else {
          setSel(drag.id);
          setSlotMenu(drag.slot ? { pieceId: drag.id, slot: drag.slot, ...drag.at } : null);
        }
        drag = null; down = null; lastPlace = null;
        return;
      }
      if (!down) return;
      const click = Math.hypot(e.clientX - down.x, e.clientY - down.y) <= 6;
      down = null;
      if (!click) return;
      const hit = pick(e);
      if (L.tool === 'build') {
        if (!L.part) {
          if (hit?.pieceId) { setSel(hit.pieceId); setSlotMenu(hit.slot ? { pieceId: hit.pieceId, slot: hit.slot, ...stagePos(e) } : null); } else { setSel(null); setSlotMenu(null); }
          return;
        }
        if (!hit) return;
        const pl = placement(L.part, hit, L.pieces);
        let list = L.pieces;
        if (pl.lift) list = list.map((x) => ({ ...x, p: [x.p[0], r3(x.p[1] + pl.lift), x.p[2]] }));
        const piece = { id: newPieceId(), type: L.part, p: pl.p, r: pl.r, s: pl.s, c: PIECE_DEFAULTS[L.part].c, f: 'glossy' };
        const add = [piece];
        if (L.mirror && Math.abs(piece.p[0]) > 0.03) { const twin = mirrored(piece, newPieceId()); piece.m = twin.id; twin.m = piece.id; add.push(twin); }
        commit([...list, ...add]);
        if (pl.lift) say('Your robot stood up on its new parts!');
        else if (BODY_SLOTS[L.part]) say(`Tip: put the part back (Esc), then click your ${PIECE_INFO[L.part].label.toLowerCase()} to swap its parts`);
        return;
      }
      if (!hit?.pieceId) { setSel(null); setSlotMenu(null); return; }
      if (L.tool === 'paint') editPiece(hit.pieceId, () => ({ c: L.paintColor }));
      else if (L.tool === 'erase' && hit.slot) {
        // Delete on a body's wheels / scoop / ears takes off just that part
        const pc = L.pieces.find((x) => x.id === hit.pieceId);
        const canRemove = BODY_SLOTS[pc?.type]?.[hit.slot]?.some(([id]) => id === 'none');
        if (canRemove) {
          const name = partName(pc, hit.slot);
          editPiece(hit.pieceId, (x) => ({ o: { ...(x.o || {}), [hit.slot]: 'none' } }));
          say(`Took off the ${name}. Click the ${PIECE_INFO[pc.type].label.toLowerCase()} with ✋ Move to put something back.`);
        } else {
          setSel(hit.pieceId); setSlotMenu({ pieceId: hit.pieceId, slot: hit.slot, ...stagePos(e) });
          const them = partIt(pc, hit.slot);
          say(`The ${partName(pc, hit.slot)} can't come off, but you can swap ${them} for something else.`);
        }
      }
      else if (L.tool === 'erase') removePiece(hit.pieceId);
      else if (L.tool === 'turn') {
        const x = L.pieces.find((pc) => pc.id === hit.pieceId);
        if (x) placePiece(x.id, x.p, eulerOf(quatOf(x.r).premultiply(new THREE.Quaternion().setFromAxisAngle(V(0, 1, 0), Math.PI / 4))));
      } else setSel(hit.pieceId);
    };
    const onLeave = () => { hideGhost(); hover.visible = false; };
    renderer.domElement.addEventListener('pointermove', onMove);
    renderer.domElement.addEventListener('pointerdown', onDown);
    renderer.domElement.addEventListener('pointerup', onUp);
    renderer.domElement.addEventListener('pointerleave', onLeave);
    renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());

    let raf, last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      // Keep the robot in the middle of the view as it grows
      const want = three.current.focus;
      if (want && orbit.enabled) {
        const d = want.clone().sub(orbit.target).multiplyScalar(Math.min(1, dt * 4));
        orbit.target.add(d); camera.position.add(d);
      }
      orbit.update();
      robot.children.forEach((o) => o.traverse((n) => { if (n.userData.rotor) n.userData.rotor.rotation.y += 9 * dt; }));
      ghostRoot.traverse((n) => { if (n.userData.rotor) n.userData.rotor.rotation.y += 9 * dt; });
      if (selBox.visible && selBox.object) selBox.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    three.current = { scene, robot, objs: new Map(), selBox, hideGhost, camera, orbit };
    if (import.meta.env.DEV) window.__bbRobotBuilder = three;
    if (import.meta.env.DEV) {
      // Test hook: where a world point appears on screen
      window.__rbScreen = (x, y, z) => { const v = V(x, y, z).project(camera); const r = renderer.domElement.getBoundingClientRect(); return [r.left + (v.x + 1) / 2 * r.width, r.top + (1 - v.y) / 2 * r.height]; };
    }
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); orbit.dispose(); renderer.dispose(); renderer.domElement.remove();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Keep the 3D pieces in step with the list ── */
  useEffect(() => {
    const { robot, objs, selBox } = three.current;
    if (!robot) return;
    const keep = new Set(pieces.map((p) => p.id));
    [...objs.keys()].forEach((id) => { if (!keep.has(id)) { robot.remove(objs.get(id).o); objs.delete(id); } });
    pieces.forEach((p) => {
      const look = `${p.type}|${p.c}|${p.f}|${led}|${p.mx ? 1 : 0}|${JSON.stringify(p.o || {})}`;
      let entry = objs.get(p.id);
      if (!entry || entry.look !== look) {
        if (entry) robot.remove(entry.o);
        const o = makePieceObject(p, led);
        o.traverse((n) => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });
        robot.add(o);
        entry = { o, look };
        objs.set(p.id, entry);
      }
      entry.o.position.fromArray(p.p);
      entry.o.rotation.set(...p.r);
      entry.o.scale.fromArray(p.s);
      if (p.mx) entry.o.scale.x *= -1;
    });
    robot.updateMatrixWorld(true);
    const bb = new THREE.Box3().setFromObject(robot);
    three.current.focus = bb.isEmpty() ? V(0, 0.35, 0) : V(0, THREE.MathUtils.clamp((bb.min.y + bb.max.y) / 2, 0.3, 1.6), THREE.MathUtils.clamp((bb.min.z + bb.max.z) / 2, -0.6, 0.6));
    const so = sel && objs.get(sel)?.o;
    if (so) { selBox.setFromObject(so); selBox.visible = true; } else selBox.visible = false;
  }, [pieces, sel, led]);

  useEffect(() => { three.current.hideGhost?.(); }, [tool, part, mirror, spin]);
  useEffect(() => { if (tool !== 'build') setPart(null); if (tool === 'build') setSel(null); }, [tool]);

  /* ── Keyboard ── */
  useEffect(() => {
    const key = (e) => {
      if (/input|textarea|select/i.test(e.target.tagName)) return;
      const k = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && k === 'z') { e.preventDefault(); if (e.shiftKey) redo(); else undo(); return; }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (k === 'r') { setSpin((s) => (s + 1) % 4); return; }
      if (k === 'escape') { setPart(null); setSel(null); setSlotMenu(null); return; }
      if ((k === 'delete' || k === 'backspace') && sel) { e.preventDefault(); removePiece(sel); return; }
      const t = TOOLS.find(([, , , hk]) => hk.toLowerCase() === k);
      if (t) setTool(t[0]);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  });

  const play = useMemo(() => freeBuildPlayAs({ pieces }), [pieces]);
  const config = useMemo(() => {
    const counts = {};
    pieces.forEach((p) => { if (['shapes', 'bodies'].includes(PIECE_INFO[p.type]?.group)) counts[p.c] = (counts[p.c] || 0) + 1; });
    const main = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '#6366f1';
    return {
      id: robotId, name: name || 'My Robot', chassisId: play.chassisId, movementId: play.movementId,
      primaryColor: main, accentColor: '#facc15', ledColor: led, sensors: ['camera'], tools: [], socketAttachments: {},
      build: { pieces }, workshop: true, freeBuild: true,
    };
  }, [pieces, name, led, play, robotId]);

  const selected = pieces.find((p) => p.id === sel) || null;
  const info = selected ? PIECE_INFO[selected.type] : null;
  const scaleSel = (k) => editPiece(selected.id, (x) => ({ s: x.s.map((v, i) => (k[i] ? Math.max(0.03, r3(v * k[i])) : v)) }));
  const groupDef = PIECE_GROUPS.find((g) => g.id === group);
  const hoverPiece = hoverSlot && pieces.find((x) => x.id === hoverSlot.pieceId);
  const hint = hoverPiece
    ? (tool === 'erase'
      ? (BODY_SLOTS[hoverPiece.type]?.[hoverSlot.slot]?.some(([id]) => id === 'none')
        ? `Click to take off the ${partName(hoverPiece, hoverSlot.slot)}`
        : `The ${partName(hoverPiece, hoverSlot.slot)} can't come off: click to swap ${partIt(hoverPiece, hoverSlot.slot)}`)
      : `Click the ${partName(hoverPiece, hoverSlot.slot)} to swap ${partIt(hoverPiece, hoverSlot.slot)}${BODY_SLOTS[hoverPiece.type]?.[hoverSlot.slot]?.some(([id]) => id === 'none') ? ` or take ${partIt(hoverPiece, hoverSlot.slot)} off` : ''}`)
    : tool === 'build'
    ? (part ? `Click on the plate or your robot to stick on the ${PIECE_INFO[part].label.toLowerCase()} · R turns it · Esc puts it back` : 'Pick a part from the tray below')
    : tool === 'move' ? 'Drag a part to move it · click a part to change its colour or size'
      : tool === 'paint' ? 'Pick a colour, then click parts to paint them'
        : tool === 'turn' ? 'Click a part to turn it'
          : 'Click a part to delete it';

  return (
    <div className="rb2">
      <div className="rb2-top">
        <button className="cs-btn cs-btn--ghost" onClick={onBack}>← Create Studio</button>
        <input className="rb2-name" value={name} maxLength={20} onChange={(e) => { setName(e.target.value); setSaved(false); }} aria-label="Robot name" />
        <span className="rb2-badge"><EmojiIcon e="🧩" /> {pieces.length} part{pieces.length === 1 ? '' : 's'} · {play.moves}</span>
        <span className="cs-topbar-title" />
        <div style={{ position: 'relative' }}>
          <button className="cs-btn" onClick={() => setIdeasOpen((v) => !v)}><EmojiIcon e="💡" style={{ marginRight: '0.35em' }} />Ideas</button>
          {ideasOpen && (
            <div className="rb-ideas">
              <p className="cs-muted">Start from an idea, then make it your own.</p>
              {[['car', 'Race car', '🏎'], ['rover', 'Wheelie rover', '🚙'], ['walker', 'Walking bot', '🦿'], ['drone', 'Flying drone', '🚁'],
                ['spider', 'Spider bot', '🕷'], ['dog', 'Robot dog', '🐕'], ['sub', 'Submarine', '🐋'], ['digger', 'Digger', '🚜'],
                ['arm', 'Robot arm', '🦿'], ['fire', 'Fire engine', '🚒'], ['mech', 'Mech', '🦾'], ['bike', 'Motorbike', '🏍'],
                ['bird', 'Bird bot', '🐦'], ['dragon', 'Dragon', '🐉'], ['hover', 'Hover car', '🛸']].map(([id, label, icon]) => (
                <button key={id} className="cs-btn cs-btn--sm" onClick={() => { commit(IDEAS[id]()); setSel(null); setIdeasOpen(false); }}><EmojiIcon e={icon} style={{ marginRight: '0.35em' }} />{label}</button>
              ))}
              <button className="cs-btn cs-btn--sm cs-btn--ghost" onClick={() => { if (!pieces.length || window.confirm('Start again with an empty build plate?')) { commit([]); setSel(null); } setIdeasOpen(false); }}><EmojiIcon e="🧹" style={{ marginRight: '0.35em' }} />Empty plate</button>
            </div>
          )}
        </div>
        <div className="rb2-lights" title="Eye and light colour">
          {LIGHTS.map((c) => <button key={c} className={`rb2-dot${led === c ? ' is-on' : ''}`} style={{ background: c }} aria-label={`Lights ${c}`} onClick={() => { setLed(c); setSaved(false); }} />)}
        </div>
        <button className="cs-btn cs-btn--primary" disabled={!pieces.length} onClick={() => { const e = onSave(config); if (e?.id) setRobotId(e.id); setSaved(true); }}><IconText>{saved ? '✅ Saved' : '💾 Save'}</IconText></button>
        <button className="cs-btn cs-btn--go" disabled={!pieces.length} onClick={() => { const e = onPlay(config); if (e?.id) setRobotId(e.id); }}><EmojiIcon e="▶" style={{ marginRight: '0.35em' }} />Test drive</button>
      </div>

      <div className="rb2-stage">
        <div ref={hostRef} className="rb2-canvas" aria-label="3D build area" />

        <div className="rb2-tools" role="toolbar" aria-label="Build tools">
          {TOOLS.map(([id, label, icon, hk]) => (
            <button key={id} className={`rb2-tool${tool === id ? ' is-on' : ''}`} onClick={() => setTool(id)} title={`${label} (${hk})`}>
              <span><EmojiIcon e={icon} /></span><small>{label}</small>
            </button>
          ))}
          <span className="rb2-sep" />
          <button className={`rb2-tool${mirror ? ' is-on is-mirror' : ''}`} onClick={() => setMirror((v) => !v)} title="Mirror: add the matching part on the other side">
            <span><EmojiIcon e="🪞" /></span><small>Mirror {mirror ? 'on' : 'off'}</small>
          </button>
          <button className="rb2-tool" onClick={() => setSpin((s) => (s + 1) % 4)} disabled={tool !== 'build' || !part} title="Turn the part before placing it (R)">
            <span>↻</span><small>Spin</small>
          </button>
          <span className="rb2-sep" />
          <button className="rb2-tool" onClick={undo} disabled={!hist.current.past.length} title="Undo (Ctrl/Cmd+Z)"><span>↩</span><small>Undo</small></button>
          <button className="rb2-tool" onClick={redo} disabled={!hist.current.future.length} title="Redo"><span>↪</span><small>Redo</small></button>
        </div>

        <div className="rb2-hint">{hint}</div>
        {slotMenu && (() => {
          const pc = pieces.find((x) => x.id === slotMenu.pieceId);
          const options = BODY_SLOTS[pc?.type]?.[slotMenu.slot];
          if (!pc || !options) return null;
          const cur = slotValue(pc, slotMenu.slot);
          return (
            <div className="rb2-slotmenu" style={{ left: Math.max(8, Math.min(slotMenu.x + 12, (hostRef.current?.clientWidth || 9999) - 220)), top: Math.max(8, Math.min(slotMenu.y + 12, (hostRef.current?.clientHeight || 9999) - 260)) }} role="menu" aria-label={`Swap the ${partName(pc, slotMenu.slot)}`}>
              <div className="rb2-slotmenu-title"><EmojiIcon e="🔧" /> {SLOT_LABELS[slotMenu.slot]}<button className="rb2-x" onClick={() => setSlotMenu(null)} aria-label="Close">✕</button></div>
              {options.map(([id, label, icon]) => (
                <button key={id} role="menuitem" className={`rb2-slotmenu-item${cur === id ? ' is-on' : ''}${id === 'none' ? ' is-off' : ''}`}
                  onClick={() => { editPiece(pc.id, (x) => ({ o: { ...(x.o || {}), [slotMenu.slot]: id } })); setSlotMenu(null); say(id === 'none' ? `Took off the ${partName(pc, slotMenu.slot)}` : `Swapped to ${label.toLowerCase()}!`); }}>
                  <EmojiIcon e={id === 'none' ? '🗑' : icon} style={{ marginRight: '0.4em' }} />{id === 'none' ? 'Take it off' : label}{cur === id ? ' ✓' : ''}
                </button>
              ))}
            </div>
          );
        })()}
        {toast && <div className="rb2-toast">{toast}</div>}
        {pieces.length > 0 && !(selected && tool !== 'paint' && !(tool === 'build' && part)) && (() => {
          const st = robotStats({ pieces });
          const bars = [['speed', 'Speed', '⚡', st.speed], st.flying ? ['grip', 'Lift', '🪽', 5] : ['grip', 'Grip', '🛞', st.grip], ['weight', 'Weight', '🏋️', st.weight], ['tools', 'Tools', '🦾', st.tools]];
          return (
            <div className={`rb2-stats${statsOpen ? '' : ' is-closed'}`} aria-label="Robot stats">
              <button className="rb2-stats-head" onClick={() => setStatsOpen((v) => !v)} aria-expanded={statsOpen}>
                <EmojiIcon e="📊" /> <b>Robot stats</b><span>{statsOpen ? '▾' : '▸'}</span>
              </button>
              {statsOpen && (<>
                {bars.map(([id, label, icon, v]) => (
                  <div key={id} className={`rb2-stat rb2-stat--${id}`}>
                    <span className="rb2-stat-label"><EmojiIcon e={icon} /> {label}</span>
                    <span className="rb2-stat-bar" role="meter" aria-valuemin={0} aria-valuemax={5} aria-valuenow={v} aria-label={label}>
                      {[1, 2, 3, 4, 5].map((n) => <i key={n} className={n <= v ? 'is-on' : ''} />)}
                    </span>
                  </div>
                ))}
                <div className="rb2-stats-tip"><EmojiIcon e="💡" style={{ marginRight: '0.3em' }} />{st.tip}</div>
              </>)}
            </div>
          );
        })()}
        {!pieces.length && !part && (
          <div className="rb2-empty"><b>Let's build a robot!</b><span>Pick a <b>body</b> from the tray below, then click the plate to place it.</span></div>
        )}

        {tool === 'paint' && (
          <div className="rb2-float rb2-paint">
            <div className="rb2-float-title"><EmojiIcon e="🎨" /> Paint colour</div>
            <div className="rb2-swatches">
              {SWATCHES.map((c) => <button key={c} className={`rb2-sw${paintColor === c ? ' is-on' : ''}`} style={{ background: c }} onClick={() => setPaintColor(c)} aria-label={`Paint ${c}`} />)}
              <label className="rb2-sw rb2-sw--any" title="Any colour"><input type="color" value={paintColor} onChange={(e) => setPaintColor(e.target.value)} /></label>
            </div>
          </div>
        )}

        {selected && tool !== 'paint' && !(tool === 'build' && part) && (
          <div className="rb2-float rb2-card">
            <div className="rb2-float-title"><img src={pieceThumb(selected.type) || ''} alt="" /> {info?.label}
              <button className="rb2-x" onClick={() => setSel(null)} aria-label="Close">✕</button></div>
            <div className="rb2-swatches">
              {SWATCHES.map((c) => <button key={c} className={`rb2-sw${selected.c === c ? ' is-on' : ''}`} style={{ background: c }} onClick={() => editPiece(selected.id, () => ({ c }))} aria-label={`Colour ${c}`} />)}
            </div>
            <div className="rb2-row">{FINISHES.map(([id, label]) => <button key={id} className={`rb2-chip${selected.f === id ? ' is-on' : ''}`} onClick={() => editPiece(selected.id, () => ({ f: id }))}>{label}</button>)}</div>
            {BODY_SLOTS[selected.type] && (
              <div className="rb2-swap" aria-label="Swap parts">
                <div className="rb2-swap-title"><EmojiIcon e="🔧" /> Swap parts</div>
                {Object.entries(BODY_SLOTS[selected.type]).map(([slot, options]) => (
                  <div key={slot} className={`rb2-swap-row${slotMenu?.slot === slot || hoverSlot?.slot === slot ? ' is-focus' : ''}`}>
                    <span>{SLOT_LABELS[slot] || slot}</span>
                    <div>
                      {options.map(([id, label, icon]) => (
                        <button key={id} className={`rb2-chip${slotValue(selected, slot) === id ? ' is-on' : ''}`} title={label}
                          onClick={() => editPiece(selected.id, (x) => ({ o: { ...(x.o || {}), [slot]: id } }))}>
                          <EmojiIcon e={icon} style={{ marginRight: '0.25em' }} />{label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="rb2-row">
              <button className="rb2-chip" onClick={() => scaleSel([0.9, 0.9, 0.9])}>− Smaller</button>
              <button className="rb2-chip" onClick={() => scaleSel([1.1, 1.1, 1.1])}>+ Bigger</button>
            </div>
            <div className="rb2-stretch">
              {[['Wider', 0], ['Taller', 1], ['Longer', 2]].map(([label, i]) => (
                <div key={label}><span>{label}</span>
                  <button onClick={() => scaleSel([0, 1, 2].map((j) => (j === i ? 0.88 : 0)))} aria-label={`Less ${label}`}>−</button>
                  <button onClick={() => scaleSel([0, 1, 2].map((j) => (j === i ? 1.12 : 0)))} aria-label={`More ${label}`}>+</button>
                </div>
              ))}
            </div>
            <button className="rb2-del" onClick={() => removePiece(selected.id)}><EmojiIcon e="🗑" style={{ marginRight: '0.35em' }} />Delete{mirror && selected.m ? ' both' : ''}</button>
          </div>
        )}
      </div>

      <div className="rb2-tray">
        <div className="rb2-tabs">
          {PIECE_GROUPS.map((g) => (
            <button key={g.id} className={`rb2-tab${group === g.id ? ' is-on' : ''}`} onClick={() => setGroup(g.id)}><EmojiIcon e={g.icon} /> {g.label}</button>
          ))}
        </div>
        <div className="rb2-parts">
          {groupDef.pieces.map((pc) => (
            <button key={pc.type} className={`rb2-part${part === pc.type && tool === 'build' ? ' is-on' : ''}`}
              onClick={() => { setTool('build'); setPart((p) => (p === pc.type ? null : pc.type)); setSpin(0); }} title={pc.label}>
              {pieceThumb(pc.type) ? <img src={pieceThumb(pc.type)} alt="" draggable={false} /> : <span className="rb2-part-emoji"><EmojiIcon e={pc.icon} /></span>}
              <small>{pc.label}</small>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
