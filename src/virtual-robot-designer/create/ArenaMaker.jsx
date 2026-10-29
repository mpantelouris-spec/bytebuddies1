/**
 * Arena Maker — build your own arena in 3D, inside the real Robot Studio world.
 * The board is drawn with the same builders the game uses (CustomArenaLab), in the world's
 * own scenery, so what you build is exactly what your robot drives in. Pick a piece from the
 * tray and click or drag on the board to place it; right-drag turns the view.
 * Saved arenas keep the same map format, so Play opens them in the lab as before.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  TILE_INFO, THEMES, THEME_CATEGORIES, themeFor, GOALS, BUILTIN_ARENAS,
  checkArena, encodeArena, normaliseMap,
} from '../arcade/games/arena.js';
import { CELL, arenaLayout, installArenaWorld, buildArenaBoard } from '../studio/CustomArenaLab.js';
import { MISSION_THEME_ROOT } from '../studio/mission-world/themes/MissionThemeKit.js';
import { MISSION_THEME_RECIPES } from '../studio/mission-world/themes/recipes/index.js';
import { createSimWebGLRenderer } from '../services/art-direction.js';
import { arenaTileThumb, propThumb, hideFloor } from './arenaThumbs.js';
import { EmojiIcon, IconText } from '../../components/ui/Icon.jsx';

const PIECES = [
  ['#', 'Build'], ['P', 'Build'], ['B', 'Build'],
  ['S', 'Goals'], ['F', 'Goals'], ['G', 'Goals'], ['C', 'Goals'],
  ['L', 'Danger'], ['H', 'Danger'], ['V', 'Danger'],
  ['K', 'Gadgets'], ['D', 'Gadgets'],
];
const TIPS = {
  '#': 'Walls block the way.',
  P: 'A decoration — pick any tree, house, rocket or cupcake below. It blocks the way like a wall.',
  B: 'A crate. It blocks the way like a wall.',
  S: 'Where your robot starts (only one). It faces the first open square.',
  F: 'The finish flag.',
  G: 'Gems to collect.',
  C: 'Coins to collect — use the "Collect every coin" goal!',
  L: 'Lava! Touching it bumps your robot back — code a way round it.',
  H: 'A bug that walks left and right.',
  V: 'A bug that walks up and down.',
  K: 'Pick up a key to open a door.',
  D: 'A locked door. Needs a key.',
};
/** Decorations children can pick, from every Robot Studio world. */
const DECOR = {
  Nature: ['treeRound', 'treePine', 'treePalm', 'treeBlossom', 'treeAutumn', 'bush', 'flowers', 'sunflower', 'mushroom', 'rock', 'cactus', 'pond', 'giantDaisy', 'giantTulip', 'giantSunflower'],
  Town: ['house', 'shop', 'tower', 'lamp', 'bench', 'fence', 'trafficLight', 'cone', 'hydrant', 'bins', 'signpost', 'stall'],
  Fun: ['balloons', 'slide', 'swings', 'ferrisWheel', 'carousel', 'hotAirBalloon', 'cupcake', 'cake', 'teddy', 'toyBlocks', 'toyCar', 'trophy'],
  Farm: ['barn', 'tractor', 'hayBale', 'cow', 'sheep', 'pig', 'chicken', 'pumpkin', 'scarecrow'],
  Space: ['rocket', 'satellite', 'dome', 'moonRock', 'crater', 'planet', 'alienPlant', 'crystal'],
  Sea: ['coralBranch', 'kelp', 'shell', 'starfish', 'turtle', 'shipwreck', 'treasureChest', 'jellyfish'],
  Builders: ['crate', 'barrel', 'container', 'crane', 'dumpTruck', 'excavator', 'goldPile', 'logPile'],
};
const nice = (id) => id.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
const SIZES = { S: [10, 8], M: [14, 10], L: [18, 12] };
const EMOJIS = ['🏟️', '🏰', '🌋', '🚀', '🍭', '❄️', '🌻', '👑', '💎', '🐞', '🌀', '🔥', '🏴‍☠️', '🎂', '🌙', '🎪'];
const TIMES = [[0, 'No limit'], [60, '60 s'], [90, '90 s'], [120, '2 min']];
const hex = (n) => `#${(n ?? 0).toString(16).padStart(6, '0')}`;

export function blankArena(size = 'M') {
  const [w, h] = SIZES[size];
  const map = Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => (x === 0 || y === 0 || x === w - 1 || y === h - 1 ? '#' : '.')).join(''));
  const set = (x, y, c) => { map[y] = map[y].slice(0, x) + c + map[y].slice(x + 1); };
  set(1, 1, 'S');
  set(w - 2, h - 2, 'F');
  return { id: `arena-${Date.now()}`, name: 'My Arena', emoji: '🏟️', theme: 'garden', goal: 'flag', lives: 3, time: 0, map, hint: '', custom: true };
}

/** A random "perfect" maze with gems and coins tucked into dead ends. */
function magicMaze(w, h) {
  const g = Array.from({ length: h }, () => Array(w).fill('#'));
  const cw = Math.floor((w - 1) / 2), ch = Math.floor((h - 1) / 2);
  const seen = new Set(['0,0']);
  const stack = [[0, 0]];
  g[1][1] = '.';
  while (stack.length) {
    const [cx, cy] = stack[stack.length - 1];
    const n = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => [cx + dx, cy + dy, dx, dy]).filter(([x, y]) => x >= 0 && y >= 0 && x < cw && y < ch && !seen.has(`${x},${y}`));
    if (!n.length) { stack.pop(); continue; }
    const [nx, ny, dx, dy] = n[Math.floor(Math.random() * n.length)];
    seen.add(`${nx},${ny}`);
    g[1 + cy * 2 + dy][1 + cx * 2 + dx] = '.';
    g[1 + ny * 2][1 + nx * 2] = '.';
    stack.push([nx, ny]);
  }
  // A few extra holes make loops, which feel friendlier
  for (let i = 0; i < Math.floor((w * h) / 40); i++) {
    const x = 1 + Math.floor(Math.random() * (w - 2)), y = 1 + Math.floor(Math.random() * (h - 2));
    if (g[y][x] === '#' && ((g[y][x - 1] === '.' && g[y][x + 1] === '.') || (g[y - 1]?.[x] === '.' && g[y + 1]?.[x] === '.'))) g[y][x] = '.';
  }
  // Farthest square from the start gets the flag; dead ends get treasure
  const dist = new Map([['1,1', 0]]);
  const q = [[1, 1]];
  let far = [1, 1];
  while (q.length) {
    const [x, y] = q.shift();
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
      const nx = x + dx, ny = y + dy;
      if (g[ny]?.[nx] === '.' && !dist.has(`${nx},${ny}`)) { dist.set(`${nx},${ny}`, dist.get(`${x},${y}`) + 1); q.push([nx, ny]); if (dist.get(`${nx},${ny}`) > dist.get(`${far[0]},${far[1]}`)) far = [nx, ny]; }
    });
  }
  g[1][1] = 'S';
  g[far[1]][far[0]] = 'F';
  let k = 0;
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    if (g[y][x] !== '.') continue;
    const exits = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => g[y + dy][x + dx] !== '#').length;
    if (exits === 1) g[y][x] = k++ % 2 ? 'C' : 'G';
  }
  return g.map((r) => r.join(''));
}

function WorldPicker({ value, onPick, onClose }) {
  const [cat, setCat] = useState(themeFor(value).cat);
  return (
    <div className="cs-modal-bg" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="cs-modal" role="dialog" aria-label="Choose a world">
        <div className="cs-modal-head">
          <b><EmojiIcon e="🌍" style={{ marginRight: '0.35em' }} />Choose a world</b>
          <span className="cs-muted">Each world is a full 3D scene from Robot Studio.</span>
          <button className="cs-btn cs-btn--ghost cs-btn--sm" onClick={onClose}>✕</button>
        </div>
        <div className="cs-chips" style={{ padding: '0 16px' }}>
          {THEME_CATEGORIES.map((c) => <button key={c} className={`cs-chip${cat === c ? ' is-on' : ''}`} onClick={() => setCat(c)}>{c}</button>)}
        </div>
        <div className="cs-world-grid">
          {Object.entries(THEMES).filter(([, t]) => t.cat === cat).map(([id, t]) => (
            <button key={id} className={`cs-world${value === id ? ' is-on' : ''}`} onClick={() => { onPick(id); onClose(); }}
              style={{ '--a': hex(t.floorA), '--b': hex(t.wall), '--sky': hex(t.sky) }}>
              <span className="cs-world-art"><i>{t.emoji}</i></span>
              <b>{t.name}</b>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


/**
 * The 3D build view: the world (rebuilt when the world or size changes) and the board
 * (rebuilt after every edit), with a hover square, a ghost of the piece and live animations.
 */
function useArenaStage(hostRef, arena, tile, prop, tool, onPaint, onStroke) {
  const ref = useRef({});
  const live = useRef({});
  live.current = { tile, prop, tool, onPaint, onStroke, arena };
  const W = normaliseMap(arena.map)[0].length, H = normaliseMap(arena.map).length;

  // Renderer, camera and controls (once)
  useEffect(() => {
    const host = hostRef.current;
    const renderer = createSimWebGLRenderer({ antialias: true });
    if (!renderer) return undefined;
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.shadowMap.enabled = true;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    Object.assign(renderer.domElement.style, { width: '100%', height: '100%', display: 'block', touchAction: 'none' });
    host.appendChild(renderer.domElement);
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 2500);
    const orbit = new OrbitControls(camera, renderer.domElement);
    orbit.enableDamping = true;
    orbit.maxPolarAngle = Math.PI * 0.47;
    orbit.minDistance = 8; orbit.maxDistance = 90;
    // Left button and one finger build; right button / two fingers turn and zoom the view
    orbit.mouseButtons = { LEFT: null, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE };
    orbit.touches = { ONE: null, TWO: THREE.TOUCH.DOLLY_ROTATE };
    const resize = () => {
      const w = host.clientWidth || 800, h = host.clientHeight || 500;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(host);

    const ray = new THREE.Raycaster();
    const ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const cellAt = (e) => {
      const r = renderer.domElement.getBoundingClientRect();
      ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera);
      const p = new THREE.Vector3();
      if (!ray.ray.intersectPlane(ground, p)) return null;
      const L = ref.current.layout;
      if (!L) return null;
      const x = Math.round(p.x / CELL + (L.W - 1) / 2), y = Math.round(p.z / CELL + (L.H - 1) / 2);
      return x >= 0 && y >= 0 && x < L.W && y < L.H ? [x, y] : null;
    };
    let painting = false;
    let lastCell = '';
    const onMove = (e) => {
      const c = cellAt(e);
      ref.current.hoverCell = c;
      if (painting && c && `${c}` !== lastCell) { lastCell = `${c}`; live.current.onPaint(c[0], c[1], true); }
    };
    const onDown = (e) => {
      if (e.button !== 0) return;
      const c = cellAt(e);
      if (!c) return;
      renderer.domElement.setPointerCapture?.(e.pointerId);
      live.current.onStroke();
      lastCell = `${c}`;
      const keepGoing = live.current.onPaint(c[0], c[1], false);
      painting = keepGoing !== false;
    };
    const onUp = () => { painting = false; lastCell = ''; };
    const onLeave = () => { ref.current.hoverCell = null; };
    renderer.domElement.addEventListener('pointermove', onMove);
    renderer.domElement.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    renderer.domElement.addEventListener('pointerleave', onLeave);
    renderer.domElement.addEventListener('contextmenu', (e) => e.preventDefault());

    let raf, t = 0, last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;
      orbit.update();
      const st = ref.current;
      (st.ud?.movers || []).forEach((m) => { try { m.update?.(t, dt, {}); } catch { /* preview only */ } });
      if (st.hover && st.layout) {
        const c = st.hoverCell;
        st.hover.visible = !!c;
        if (st.ghost) st.ghost.visible = !!c && live.current.tool === 'build';
        if (c) {
          const p = st.layout.pos(c[0], c[1]);
          st.hover.position.set(p.x, 0.09, p.z);
          st.hover.material.color.set(live.current.tool === 'erase' ? 0xef4444 : live.current.tool === 'fill' ? 0x0ea5e9 : 0x22c55e);
          if (st.ghost) st.ghost.position.set(p.x, 0.02 + Math.sin(t * 4) * 0.04, p.z);
        }
      }
      if (st.scene) renderer.render(st.scene, camera);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    Object.assign(ref.current, { renderer, camera, orbit });
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); orbit.dispose(); renderer.dispose(); renderer.domElement.remove();
      window.removeEventListener('pointerup', onUp);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // The world around the board: rebuilt when the world or the arena size changes
  useEffect(() => {
    const st = ref.current;
    if (!st.renderer) return;
    const scene = new THREE.Scene();
    const layout = arenaLayout(arena.map, { centred: true });
    // Daylight like the lab's; each world then tints these lights its own way
    const span0 = Math.max(W, H) * CELL;
    scene.add(new THREE.HemisphereLight(0xdff2ff, 0x6b8f5a, 1.15));
    scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const sun = new THREE.DirectionalLight(0xffffff, 2.1);
    sun.position.set(span0 * 0.6, span0 * 1.4, span0 * 0.8);
    sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -span0, right: span0, top: span0, bottom: -span0, far: span0 * 4 });
    scene.add(sun);
    try { installArenaWorld(scene, arena, layout); } catch (e) { console.warn('[ArenaMaker] world', e); }
    // Indoor worlds (museum, classroom, sports hall…) are rooms with a ceiling: take the lid off,
    // like a dollhouse, so you can see in while building. (The walls already vanish from outside.)
    if (MISSION_THEME_RECIPES[themeFor(arena.theme).recipe]?.room) {
      const themeRoot = scene.getObjectByName(MISSION_THEME_ROOT);
      themeRoot?.updateMatrixWorld(true);
      themeRoot?.traverse((o) => {
        if (!o.isMesh) return;
        const b = new THREE.Box3().setFromObject(o);
        if (!b.isEmpty() && b.min.y > 6) o.visible = false;
      });
    }
    const hover = new THREE.Mesh(new THREE.BoxGeometry(CELL * 0.98, 0.06, CELL * 0.98), new THREE.MeshBasicMaterial({ color: 0x22c55e, transparent: true, opacity: 0.45, depthWrite: false }));
    hover.renderOrder = 5;
    scene.add(hover);
    st.scene = scene; st.layout = layout; st.hover = hover; st.board = null; st.ghost = null; st.ghostKey = '';
    if (import.meta.env.DEV) { window.__abScene = scene; window.__abCam = st.camera; window.__abRenderer = st.renderer; }
    // Frame the board
    const span = Math.max(W, H) * CELL;
    st.camera.position.set(0, span * 0.85, span * 0.75);
    st.orbit.target.set(0, 0, 0);
    st.orbit.update();
    st.rebuild?.();
  }, [arena.theme, W, H]); // eslint-disable-line react-hooks/exhaustive-deps

  // The board: rebuilt after each edit (next animation frame, so dragging stays smooth)
  useEffect(() => {
    const st = ref.current;
    st.rebuild = () => {
      if (!st.scene) return;
      if (st.board) st.scene.remove(st.board);
      const root = new THREE.Group();
      const ud = { obstacles: [], collectibles: [], movers: [] };
      try { buildArenaBoard(root, live.current.arena, arenaLayout(live.current.arena.map, { centred: true }), ud); } catch (e) { console.warn('[ArenaMaker] board', e); }
      st.scene.add(root);
      st.board = root; st.ud = ud;
    };
    cancelAnimationFrame(st.rebuildRaf);
    st.rebuildRaf = requestAnimationFrame(() => st.rebuild());
  }, [arena.map, arena.props, arena.theme]);

  // The ghost of the piece being placed
  useEffect(() => {
    const st = ref.current;
    if (!st.scene) return;
    const key = `${tile}|${prop}|${arena.theme}|${tool}`;
    if (key === st.ghostKey) return;
    if (st.ghost) st.scene.remove(st.ghost);
    st.ghost = null; st.ghostKey = key;
    if (tool !== 'build') return;
    const g = new THREE.Group();
    try {
      const one = { theme: arena.theme, map: [tile], props: tile === 'P' && prop ? { '0,0': prop } : undefined, name: 'ghost' };
      buildArenaBoard(g, one, arenaLayout(one.map, { centred: true }), { obstacles: [], collectibles: [], movers: [] });
    } catch { /* no ghost */ }
    g.traverse((n) => {
      if (!n.isMesh) return;
      const mats = Array.isArray(n.material) ? n.material : [n.material];
      n.material = mats.map((m) => { const c = m.clone(); c.transparent = true; c.opacity = 0.6; c.depthWrite = false; return c; });
      if (n.material.length === 1) n.material = n.material[0];
      n.castShadow = false;
    });
    // the floor square of the one-piece board is not part of the ghost
    if (!'LS'.includes(tile)) hideFloor(g);
    g.visible = false;
    st.scene.add(g);
    st.ghost = g;
  });

  return ref;
}

export default function ArenaMaker({ initial, robotConfig, onSave, onPlay, onBack }) {
  void robotConfig;
  const [arena, setArena] = useState(() => ({ time: 0, props: {}, ...(initial || blankArena('M')) }));
  const [tile, setTile] = useState('#');
  const [prop, setProp] = useState(null);
  const [decorCat, setDecorCat] = useState('Nature');
  const [tool, setTool] = useState('build');
  const [saved, setSaved] = useState(false);
  const [panel, setPanel] = useState(null); // 'world' | 'settings' | 'share' | 'templates'
  const [copied, setCopied] = useState(false);
  const [topView, setTopView] = useState(false);
  const history = useRef({ past: [], future: [] });
  const hostRef = useRef(null);
  const map = useMemo(() => normaliseMap(arena.map), [arena.map]);
  const check = useMemo(() => checkArena(arena, { lab: true }), [arena]);
  const theme = themeFor(arena.theme);
  const H = map.length, W = map[0].length;

  const snap = () => ({ map: arena.map, props: arena.props });
  const snapshot = () => { history.current.past.push(snap()); if (history.current.past.length > 80) history.current.past.shift(); history.current.future = []; };
  const update = (patch) => { setArena((a) => ({ ...a, ...patch })); setSaved(false); };
  const undo = () => { const h = history.current; if (!h.past.length) return; h.future.push(snap()); update(h.past.pop()); };
  const redo = () => { const h = history.current; if (!h.future.length) return; h.past.push(snap()); update(h.future.pop()); };

  const setCell = (rows, x, y, c) => { rows[y] = rows[y].slice(0, x) + c + rows[y].slice(x + 1); };
  /** Paint one square (or fill an area) with the current piece; returns false to stop a drag. */
  const paintCell = (x, y) => {
    const t = tool === 'erase' ? '.' : tile;
    if (tool === 'fill') {
      setArena((a) => {
        const rows = normaliseMap(a.map).slice();
        const from = rows[y][x];
        if (from === t || t === 'S') return a;
        const props = { ...(a.props || {}) };
        const q = [[x, y]]; const seen = new Set();
        while (q.length) {
          const [cx, cy] = q.pop(); const k = `${cx},${cy}`;
          if (seen.has(k) || rows[cy]?.[cx] !== from) continue;
          seen.add(k); setCell(rows, cx, cy, t);
          if (t === 'P' && prop) props[k] = prop; else delete props[k];
          q.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
        }
        return { ...a, map: rows, props };
      });
      setSaved(false);
      return false;
    }
    setArena((a) => {
      const rows = normaliseMap(a.map).slice();
      const k = `${x},${y}`;
      const props = { ...(a.props || {}) };
      if (rows[y][x] === t && (t !== 'P' || props[k] === (prop || undefined))) return a;
      if (t === 'S') for (let j = 0; j < rows.length; j++) rows[j] = rows[j].replace(/S/g, '.');
      setCell(rows, x, y, t);
      if (t === 'P' && prop) props[k] = prop; else delete props[k];
      return { ...a, map: rows, props };
    });
    setSaved(false);
    return t !== 'S';
  };
  const stage = useArenaStage(hostRef, arena, tile, prop, tool, paintCell, snapshot);

  useEffect(() => {
    const st = stage.current;
    if (!st.camera || !st.orbit) return;
    const span = Math.max(W, H) * CELL;
    if (topView) st.camera.position.set(0, span * 1.25, 0.01); else st.camera.position.set(0, span * 0.85, span * 0.75);
    st.orbit.target.set(0, 0, 0); st.orbit.update();
  }, [topView]); // eslint-disable-line react-hooks/exhaustive-deps

  const sprinkle = () => {
    snapshot();
    const rows = map.slice(); const free = [];
    rows.forEach((r, y) => [...r].forEach((c, x) => { if (c === '.') free.push([x, y]); }));
    for (let i = 0; i < Math.min(6, free.length); i++) { const [x, y] = free.splice(Math.floor(Math.random() * free.length), 1)[0]; setCell(rows, x, y, i % 2 ? 'C' : 'G'); }
    update({ map: rows });
  };
  const resize = (size) => { snapshot(); update({ map: blankArena(size).map, props: {} }); };
  const clearAll = () => { if (window.confirm('Clear the whole arena?')) { snapshot(); update({ map: blankArena(W <= 10 ? 'S' : W <= 14 ? 'M' : 'L').map, props: {} }); } };
  const save = () => { onSave(arena); setSaved(true); };
  // Autosave: every change is kept (a moment after you stop), so nothing is lost if you leave
  const firstRender = useRef(true);
  const pending = useRef(null);
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return undefined; }
    pending.current = arena;
    const t = setTimeout(() => { onSave(arena); setSaved(true); pending.current = null; }, 700);
    return () => clearTimeout(t);
  }, [arena]); // eslint-disable-line react-hooks/exhaustive-deps
  // Leaving straight after a change (Back, another tab, closing the page): save it now
  useEffect(() => {
    const flush = () => { if (pending.current) { onSave(pending.current); pending.current = null; } };
    window.addEventListener('pagehide', flush);
    return () => { window.removeEventListener('pagehide', flush); flush(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const code = useMemo(() => encodeArena(arena), [arena]);

  useEffect(() => {
    const keys = (e) => {
      if (/input|textarea|select/i.test(e.target.tagName)) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); if (e.shiftKey) redo(); else undo(); return; }
      const k = e.key.toLowerCase();
      if (k === 'b') setTool('build'); else if (k === 'x' || k === 'e') setTool('erase'); else if (k === 'f') setTool('fill');
    };
    window.addEventListener('keydown', keys);
    return () => window.removeEventListener('keydown', keys);
  });

  const pickPiece = (t) => { setTile(t); setTool('build'); if (t !== 'P') setProp(null); };
  const hint = tool === 'erase' ? 'Click or drag over squares to clear them'
    : tool === 'fill' ? `Click an area to fill it with ${TILE_INFO[tile].name.toLowerCase()}s`
      : `Click or drag on the board to place ${tile === 'P' && prop ? nice(prop).toLowerCase() : TILE_INFO[tile].name.toLowerCase()}s · right-drag to turn the view`;

  return (
    <div className="ab">
      {panel === 'world' && <WorldPicker value={arena.theme} onPick={(id) => update({ theme: id })} onClose={() => setPanel(null)} />}
      {panel === 'templates' && (
        <div className="cs-modal-bg" onMouseDown={(e) => { if (e.target === e.currentTarget) setPanel(null); }}>
          <div className="cs-modal" role="dialog" aria-label="Start from a template">
            <div className="cs-modal-head"><b><EmojiIcon e="📋" style={{ marginRight: '0.35em' }} />Start from a template</b><button className="cs-btn cs-btn--ghost cs-btn--sm" onClick={() => setPanel(null)}>✕</button></div>
            <div className="cs-world-grid">
              {BUILTIN_ARENAS.map((t) => (
                <button key={t.id} className="cs-world" style={{ '--a': hex(themeFor(t.theme).floorA), '--b': hex(themeFor(t.theme).wall), '--sky': hex(themeFor(t.theme).sky) }}
                  onClick={() => { snapshot(); update({ map: t.map.map((r) => r.replace(/[OJI]/g, '.')), props: {}, goal: t.goal, theme: themeFor(t.theme) === THEMES[t.theme] ? t.theme : arena.theme, hint: t.hint }); setPanel(null); }}>
                  <span className="cs-world-art"><i>{t.emoji}</i></span><b>{t.name}</b>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="ab-top">
        <button className="cs-btn cs-btn--ghost" onClick={onBack}>← Create Studio</button>
        <select className="ab-emoji" value={arena.emoji} onChange={(e) => update({ emoji: e.target.value })} aria-label="Arena icon">
          {EMOJIS.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
        <input className="ab-name" value={arena.name} maxLength={24} onChange={(e) => update({ name: e.target.value })} aria-label="Arena name" />
        <button className="ab-world" onClick={() => setPanel('world')} style={{ '--a': hex(theme.floorA), '--b': hex(theme.wall) }}>
          <i>{theme.emoji}</i><span><b>{theme.name}</b><small>Change world</small></span>
        </button>
        <select className="ab-goal" value={arena.goal} onChange={(e) => update({ goal: e.target.value })} aria-label="Goal">
          {Object.entries(GOALS).map(([id, label]) => <option key={id} value={id}>{({ flag: '🏁', gems: '💎', both: '💎🏁', coins: '🪙' })[id]} {label}</option>)}
        </select>
        <span className="cs-topbar-title" />
        <div style={{ position: 'relative' }}>
          <button className="cs-btn" onClick={() => setPanel(panel === 'settings' ? null : 'settings')}><EmojiIcon e="⚙️" style={{ marginRight: '0.35em' }} />Settings</button>
          {panel === 'settings' && (
            <div className="ab-pop">
              <div className="cs-label" style={{ marginTop: 0 }}>Lives</div>
              <div className="cs-chips">{[1, 2, 3].map((n) => <button key={n} className={`cs-chip${arena.lives === n ? ' is-on' : ''}`} onClick={() => update({ lives: n })}><IconText>{'❤️'.repeat(n)}</IconText></button>)}</div>
              <div className="cs-label">Size</div>
              <div className="cs-chips">{Object.keys(SIZES).map((sz) => <button key={sz} className={`cs-chip${W === SIZES[sz][0] ? ' is-on' : ''}`} onClick={() => { if (W === SIZES[sz][0] || window.confirm('Changing size starts a fresh arena (you can Undo). OK?')) resize(sz); }}>{sz}</button>)}</div>
              <div className="cs-label">Time limit</div>
              <div className="cs-chips">{TIMES.map(([v, l]) => <button key={v} className={`cs-chip${(arena.time || 0) === v ? ' is-on' : ''}`} onClick={() => update({ time: v })}>{l}</button>)}</div>
              <div className="cs-label">Hint for players</div>
              <input className="cs-input" value={arena.hint || ''} maxLength={90} placeholder="e.g. Grab the key first!" onChange={(e) => update({ hint: e.target.value })} />
            </div>
          )}
        </div>
        <div style={{ position: 'relative' }}>
          <button className="cs-btn" onClick={() => setPanel(panel === 'share' ? null : 'share')}><EmojiIcon e="🔗" style={{ marginRight: '0.35em' }} />Share</button>
          {panel === 'share' && (
            <div className="ab-pop">
              <b>Share code</b> — friends paste this into <i>Import arena</i>.
              <div className="cs-row" style={{ flexWrap: 'nowrap', marginTop: 8 }}>
                <input className="cs-input" readOnly value={code} onFocus={(e) => e.target.select()} />
                <button className="cs-btn" onClick={() => { navigator.clipboard?.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); }}><IconText>{copied ? '✅' : 'Copy'}</IconText></button>
              </div>
            </div>
          )}
        </div>
        <button className="cs-btn cs-btn--primary" onClick={save}><IconText>{saved ? '✅ Saved' : '💾 Saving…'}</IconText></button>
        <button className="cs-btn cs-btn--go" disabled={!check.ok} onClick={() => { onSave(arena); onPlay(arena); }} title={check.ok ? 'Play your arena' : 'Fix the problems first'}><EmojiIcon e="▶" style={{ marginRight: '0.35em' }} />Play it!</button>
      </div>

      <div className="ab-stage">
        <div ref={hostRef} className="ab-canvas" aria-label="3D arena — click or drag to build" />
        <div className="rb2-tools ab-tools" role="toolbar" aria-label="Arena tools">
          {[['build', 'Build', '🧱', 'B'], ['fill', 'Fill', '🪣', 'F'], ['erase', 'Erase', '🧽', 'X']].map(([id, label, icon, hk]) => (
            <button key={id} className={`rb2-tool${tool === id ? ' is-on' : ''}`} onClick={() => setTool(id)} title={`${label} (${hk})`}><span><EmojiIcon e={icon} /></span><small>{label}</small></button>
          ))}
          <span className="rb2-sep" />
          <button className="rb2-tool" onClick={undo} disabled={!history.current.past.length} title="Undo (Ctrl/Cmd+Z)"><span>↩</span><small>Undo</small></button>
          <button className="rb2-tool" onClick={redo} disabled={!history.current.future.length} title="Redo"><span>↪</span><small>Redo</small></button>
          <span className="rb2-sep" />
          <button className={`rb2-tool${topView ? ' is-on' : ''}`} onClick={() => setTopView((v) => !v)} title="Look from above"><span><EmojiIcon e="🗺️" /></span><small>{topView ? '3D view' : 'Top view'}</small></button>
          <button className="rb2-tool" onClick={() => { snapshot(); update({ map: magicMaze(W, H), props: {} }); }} title="Make a random maze"><span><EmojiIcon e="🎲" /></span><small>Maze</small></button>
          <button className="rb2-tool" onClick={sprinkle} title="Scatter gems and coins"><span><EmojiIcon e="✨" /></span><small>Treasure</small></button>
          <button className="rb2-tool" onClick={() => setPanel('templates')} title="Start from a template"><span><EmojiIcon e="📋" /></span><small>Ideas</small></button>
          <button className="rb2-tool" onClick={clearAll} title="Clear the arena"><span><EmojiIcon e="🧹" /></span><small>Clear</small></button>
        </div>
        <div className="rb2-hint">{hint}</div>
        <div className={`ab-check ${check.ok ? 'is-ok' : 'is-bad'}`}><IconText>{check.ok ? '✅ Your arena can be finished!' : `⚠️ ${check.problems[0]}`}</IconText></div>
      </div>

      <div className="rb2-tray">
        <div className="ab-tray-row">
          <div className="rb2-parts">
            {PIECES.map(([t]) => (
              <button key={t} className={`rb2-part${tile === t && tool === 'build' ? ' is-on' : ''}`} onClick={() => pickPiece(t)} title={TIPS[t]}>
                {arenaTileThumb(t, arena.theme) ? <img src={arenaTileThumb(t, arena.theme)} alt="" draggable={false} /> : <span className="rb2-part-emoji">{TILE_INFO[t].emoji}</span>}
                <small>{t === 'P' ? 'Decoration' : TILE_INFO[t].name}</small>
              </button>
            ))}
          </div>
        </div>
        {tile === 'P' && (
          <div className="ab-decor">
            <div className="rb2-tabs">
              {Object.keys(DECOR).map((c) => <button key={c} className={`rb2-tab${decorCat === c ? ' is-on' : ''}`} onClick={() => setDecorCat(c)}>{c}</button>)}
            </div>
            <div className="rb2-parts">
              <button className={`rb2-part${!prop ? ' is-on' : ''}`} onClick={() => setProp(null)} title={`Mix of ${theme.name} decorations`}>
                <span className="rb2-part-emoji">{theme.emoji}</span><small>World mix</small>
              </button>
              {DECOR[decorCat].map((name) => (
                <button key={name} className={`rb2-part${prop === name ? ' is-on' : ''}`} onClick={() => { setProp(name); setTool('build'); }} title={nice(name)}>
                  {propThumb(name) ? <img src={propThumb(name)} alt="" draggable={false} /> : <span className="rb2-part-emoji">🌳</span>}
                  <small>{nice(name)}</small>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
