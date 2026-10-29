/**
 * Track Maker — build your own race track, piece by piece, and race it in Robot Studio.
 * Road pieces snap on one after another from the start line (like blocks in a program);
 * the track joins itself back to the start. A little kart can test-drive it in the editor,
 * and Race it! runs it as a real kart race in the chosen world.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createSimWebGLRenderer } from '../services/art-direction.js';
import { buildMKTrackArena } from '../racing/RacingCourse.js';
import {
  TRACK_PIECES, PIECE_BY_ID, TRACK_IDEAS, TRACK_WORLDS, TRACK_WIDTH, TRACK_BOUNDS,
  layPieces, trackLoop, checkTrack, blankTrack, trackToRaceCourse, surpriseTrack, fixTrack,
  TRACK_ITEMS, MAX_TRACK_ITEMS, LANES, loopFractions, itemPosition, encodeTrack,
} from './raceTracks.js';

/**
 * Hide tall scenery (city towers, clouds) standing between the camera and the track, so the
 * track is always visible while building. Re-run whenever the view is turned.
 */
function clearView(ws, camera, targets) {
  (ws.userData.viewHidden || []).forEach((o) => { o.visible = true; });
  const hidden = [];
  const rays = targets.map((t) => {
    const dir = t.clone().sub(camera.position); const dist = dir.length();
    return { ray: new THREE.Ray(camera.position.clone(), dir.normalize()), dist };
  });
  const box = new THREE.Box3(), hit = new THREE.Vector3(), size = new THREE.Vector3();
  const visit = (o, depth) => {
    if (!o.visible || o.isLight || o.isCamera) return;
    if (o.isMesh || o.isInstancedMesh || (o.isGroup && depth > 0)) {
      box.setFromObject(o);
      if (box.isEmpty()) return;
      box.getSize(size);
      const huge = size.x > 260 || size.z > 260;
      if (!huge && box.max.y > 9 && !box.containsPoint(camera.position)) {
        if (rays.some(({ ray, dist }) => ray.intersectBox(box, hit) && hit.distanceTo(camera.position) < dist - 4)) {
          if (size.x < 120 && size.z < 120) { o.visible = false; hidden.push(o); return; }
        }
      }
    }
    if (depth < 6) o.children.forEach((c) => visit(c, depth + 1));
  };
  ws.children.forEach((c) => visit(c, 0));
  ws.userData.viewHidden = hidden;
}

/** The race scales every circuit up a little (RacingCourse longCourseScale). */
const RACE_SCALE = 1.28;
import { EmojiIcon, IconText } from '../../components/ui/Icon.jsx';

const EMOJIS = ['🏁', '🏎️', '🚀', '⚡', '🌈', '🔥', '❄️', '🌴', '🍭', '👑', '🐉', '🌙'];
const PIECE_COLORS = { straight: '#0ea5e9', long: '#0284c7', left: '#8b5cf6', right: '#8b5cf6', gentleLeft: '#a855f7', gentleRight: '#a855f7', hairpinLeft: '#ec4899', hairpinRight: '#ec4899', sLeft: '#f59e0b', sRight: '#f59e0b', hillUp: '#22c55e', hillDown: '#16a34a' };

/** A little drawing of a piece's road shape for the tray (made from the piece itself). */
function PieceIcon({ id, size = 46 }) {
  const pts = layPieces([id]);
  const xs = pts.map((p) => p.x), zs = pts.map((p) => p.z);
  const minX = Math.min(...xs), maxX = Math.max(...xs), minZ = Math.min(...zs), maxZ = Math.max(...zs);
  const span = Math.max(maxX - minX, maxZ - minZ, 1);
  const pad = 7, k = (size - pad * 2) / span;
  const ox = pad + ((size - pad * 2) - (maxX - minX) * k) / 2, oz = pad + ((size - pad * 2) - (maxZ - minZ) * k) / 2;
  // Drawn so "forward" points up the icon
  const P = (p) => `${(ox + (p.z - minZ) * k).toFixed(1)},${(size - (oz + (p.x - minX) * k)).toFixed(1)}`;
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${P(p)}`).join(' ');
  const piece = PIECE_BY_ID[id];
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <path d={d} fill="none" stroke="#334155" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke="#fff" strokeWidth="1.4" strokeDasharray="3 3" strokeLinecap="round" />
      <circle cx={P(pts[pts.length - 1]).split(',')[0]} cy={P(pts[pts.length - 1]).split(',')[1]} r="3" fill={PIECE_COLORS[id]} />
      {piece.rise ? <text x={size - 4} y="12" fontSize="11" textAnchor="end" fill="#16a34a" fontWeight="900">{piece.rise > 0 ? '▲' : '▼'}</text> : null}
    </svg>
  );
}

/** A road ribbon mesh along points (with kerbs), lying on the ground. */
function roadMesh(points, { width = TRACK_WIDTH, color = 0x3f4654, opacity = 1, closed = false, kerbs = true }) {
  const g = new THREE.Group();
  if (points.length < 2) return g;
  const P = closed ? [...points, points[0]] : points;
  const pos = [], idx = [], kerbPos = [], kerbCol = [];
  const side = (i) => {
    const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)];
    const dx = b.x - a.x, dz = b.z - a.z; const L = Math.hypot(dx, dz) || 1;
    return [-dz / L, dx / L];
  };
  P.forEach((p, i) => {
    const [nx, nz] = side(i);
    const y = (p.y || 0) * 0.6 + 0.05;
    pos.push(p.x + nx * width / 2, y, p.z + nz * width / 2, p.x - nx * width / 2, y, p.z - nz * width / 2);
    if (i) idx.push((i - 1) * 2, i * 2, (i - 1) * 2 + 1, i * 2, i * 2 + 1, (i - 1) * 2 + 1);
    if (kerbs) {
      const red = Math.floor(i / 2) % 2 ? [0.94, 0.27, 0.27] : [0.97, 0.98, 1];
      [[1, 0.8], [-1, 0.8]].forEach(([s, w]) => {
        const e = width / 2, o = e + w;
        kerbPos.push(p.x + nx * s * e, y + 0.03, p.z + nz * s * e, p.x + nx * s * o, y + 0.03, p.z + nz * s * o);
        kerbCol.push(...red, ...red);
      });
    }
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx); geo.computeVertexNormals();
  const road = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 0.85, transparent: opacity < 1, opacity, side: THREE.DoubleSide, depthWrite: opacity >= 1 }));
  road.receiveShadow = true;
  g.add(road);
  if (kerbs) {
    // two strips (left and right), each a ribbon of quads
    [0, 1].forEach((s) => {
      const kp = [], kc = [], ki = [];
      for (let i = 0; i < P.length; i++) {
        const o = (i * 4 + s * 2) * 3;
        kp.push(...kerbPos.slice(o, o + 6)); kc.push(...kerbCol.slice((i * 4 + s * 2) * 3, (i * 4 + s * 2) * 3 + 6));
        if (i) ki.push((i - 1) * 2, i * 2, (i - 1) * 2 + 1, i * 2, i * 2 + 1, (i - 1) * 2 + 1);
      }
      const kg = new THREE.BufferGeometry();
      kg.setAttribute('position', new THREE.Float32BufferAttribute(kp, 3));
      kg.setAttribute('color', new THREE.Float32BufferAttribute(kc, 3));
      kg.setIndex(ki); kg.computeVertexNormals();
      g.add(new THREE.Mesh(kg, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6, transparent: opacity < 1, opacity, side: THREE.DoubleSide })));
    });
  }
  // Centre line
  const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(P.map((p) => new THREE.Vector3(p.x, (p.y || 0) * 0.6 + 0.09, p.z))), new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 1.6, gapSize: 1.6, transparent: true, opacity: 0.85 * opacity }));
  line.computeLineDistances();
  g.add(line);
  return g;
}

function startLine(p) {
  const c = document.createElement('canvas'); c.width = 64; c.height = 16;
  const x = c.getContext('2d');
  for (let i = 0; i < 16; i++) for (let j = 0; j < 4; j++) { x.fillStyle = (i + j) % 2 ? '#111' : '#fff'; x.fillRect(i * 4, j * 4, 4, 4); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter;
  const g = new THREE.Group();
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1.6, TRACK_WIDTH).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: t }));
  m.rotation.y = -p.a; m.position.set(p.x, 0.1, p.z);
  g.add(m);
  // An arch over the start
  const post = (s) => { const q = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 5, 10), new THREE.MeshStandardMaterial({ color: 0xef4444 })); q.position.set(p.x - Math.sin(p.a) * s * (TRACK_WIDTH / 2 + 1), 2.5, p.z + Math.cos(p.a) * s * (TRACK_WIDTH / 2 + 1)); return q; };
  g.add(post(1), post(-1));
  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.2, TRACK_WIDTH + 2.5), new THREE.MeshStandardMaterial({ map: t }));
  bar.position.set(p.x, 5, p.z); bar.rotation.y = -p.a;
  g.add(bar);
  return g;
}

/** A marker over an item on the road, so it shows straight away (the world shows the real one). */
const ITEM_COLORS = { bumper: 0xf97316, boost: 0x06b6d4, ramp: 0xeab308 };
function itemMarker(type) {
  const g = new THREE.Group();
  const c = ITEM_COLORS[type] || 0xffffff;
  const mat = new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.35, roughness: 0.5 });
  if (type === 'bumper') {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.5, 1.1, 14), mat); post.position.y = 0.55; g.add(post);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.5, 14, 10), new THREE.MeshStandardMaterial({ color: 0xffffff })); cap.scale.y = 0.45; cap.position.y = 1.1; g.add(cap);
  } else if (type === 'boost') {
    const pad = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.12, 1.6), mat); pad.position.y = 0.1; g.add(pad);
    [-0.5, 0.3].forEach((x) => { const a = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.6, 3), new THREE.MeshBasicMaterial({ color: 0xffffff })); a.rotation.z = -Math.PI / 2; a.position.set(x, 0.25, 0); g.add(a); });
  } else {
    const ramp = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.4, 1.8), mat); ramp.rotation.z = 0.2; ramp.position.y = 0.3; g.add(ramp);
  }
  // A pin above it, easy to spot from far away
  const pin = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.0, 12), new THREE.MeshBasicMaterial({ color: c }));
  pin.rotation.x = Math.PI; pin.position.y = 3.0; pin.userData.bob = true; g.add(pin);
  g.traverse((n) => { if (n.isMesh) n.castShadow = true; });
  return g;
}

function miniKart(color = 0xf97316) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.7, 1.5), new THREE.MeshStandardMaterial({ color, roughness: 0.4 }));
  body.position.y = 0.75; g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 12), new THREE.MeshStandardMaterial({ color: 0xf8fafc }));
  head.position.set(-0.2, 1.45, 0); g.add(head);
  [[0.9, 0.8], [0.9, -0.8], [-0.9, 0.8], [-0.9, -0.8]].forEach(([x, z]) => {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.35, 14), new THREE.MeshStandardMaterial({ color: 0x111827 }));
    w.rotation.x = Math.PI / 2; w.position.set(x, 0.42, z); g.add(w);
  });
  g.traverse((n) => { if (n.isMesh) n.castShadow = true; });
  return g;
}

export default function TrackMaker({ initial, onSave, onPlay, onBack }) {
  const [track, setTrack] = useState(() => ({ ...blankTrack(), ...(initial || {}) }));
  const [sel, setSel] = useState(null); // index of the selected piece (new pieces go after it)
  const [hoverPiece, setHoverPiece] = useState(null);
  const [panel, setPanel] = useState(null);
  const [saved, setSaved] = useState(false);
  const [driving, setDriving] = useState(false);
  const [tab, setTab] = useState('road');           // tray: 'road' pieces or 'items' on the road
  const [itemTool, setItemTool] = useState('bumper'); // which item a click on the road places
  const [itemMsg, setItemMsg] = useState('');
  const [shareMsg, setShareMsg] = useState('');
  const history = useRef({ past: [], future: [] });
  const hostRef = useRef(null);
  const three = useRef({});
  const world = TRACK_WORLDS.find((w) => w.id === track.world) || TRACK_WORLDS[0];
  const check = useMemo(() => checkTrack(track), [track]);
  const fixed = useMemo(() => (check.ok ? null : fixTrack(track.pieces)), [check.ok, track.pieces]);
  const [nudge, setNudge] = useState(0); // makes the problem message bounce when Race it! is pressed too early

  const snapshot = () => { history.current.past.push(track.pieces); if (history.current.past.length > 100) history.current.past.shift(); history.current.future = []; };
  const update = (patch) => { setTrack((t) => ({ ...t, ...patch })); setSaved(false); };
  const setPieces = (pieces) => { snapshot(); update({ pieces }); };
  const undo = () => { const h = history.current; if (!h.past.length) return; h.future.push(track.pieces); update({ pieces: h.past.pop() }); setSel(null); };
  const redo = () => { const h = history.current; if (!h.future.length) return; h.past.push(track.pieces); update({ pieces: h.future.pop() }); };
  const addPiece = (id) => {
    const at = sel == null ? track.pieces.length : sel + 1;
    setPieces([...track.pieces.slice(0, at), id, ...track.pieces.slice(at)]);
    if (sel != null) setSel(at);
  };
  const removeSel = () => { if (sel == null) return; setPieces(track.pieces.filter((_, i) => i !== sel)); setSel(sel > 0 ? sel - 1 : null); };

  /* ── 3D scene ── */
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
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xbfe3ff);
    scene.fog = new THREE.Fog(0xbfe3ff, 160, 320);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x6b8f5a, 1.3));
    const sun = new THREE.DirectionalLight(0xffffff, 2); sun.position.set(40, 80, 30); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -90, right: 90, top: 90, bottom: -90, far: 250 }); scene.add(sun);
    const ground = new THREE.Mesh(new THREE.CircleGeometry(220, 64), new THREE.MeshStandardMaterial({ color: 0x86c66b, roughness: 1 }));
    ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
    // The racing area
    const B = TRACK_BOUNDS;
    const edge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(B * 2, B * 2)), new THREE.LineDashedMaterial({ color: 0xffffff, dashSize: 3, gapSize: 2 }));
    edge.rotation.x = -Math.PI / 2; edge.position.y = 0.04; edge.computeLineDistances(); scene.add(edge);
    const camera = new THREE.PerspectiveCamera(42, 1, 0.5, 2500);
    camera.position.set(0, 62, 118);
    const orbit = new OrbitControls(camera, renderer.domElement);
    orbit.enableDamping = true; orbit.maxPolarAngle = Math.PI * 0.46; orbit.minDistance = 30; orbit.maxDistance = 260;
    orbit.mouseButtons = { LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN };
    orbit.addEventListener('end', () => { const st = three.current; if (st.worldScene && st.viewTargets) clearView(st.worldScene, camera, st.viewTargets()); });
    const trackRoot = new THREE.Group(); scene.add(trackRoot);
    const itemRoot = new THREE.Group(); trackRoot.add(itemRoot);
    const ghostRoot = new THREE.Group(); scene.add(ghostRoot);
    const kart = miniKart(); kart.visible = false; scene.add(kart);
    // A click (not a drag) on the road places an item when the Items tray is open
    let down = null;
    renderer.domElement.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY, b: e.button }; });
    renderer.domElement.addEventListener('pointerup', (e) => {
      if (!down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      const b = down.b; down = null;
      if (moved > 6 || b !== 0) return;
      const rect = renderer.domElement.getBoundingClientRect();
      const ndc = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      const ray = new THREE.Raycaster(); ray.setFromCamera(ndc, camera);
      const hit = new THREE.Vector3();
      if (ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.6), hit)) three.current.onPick?.(hit.x / RACE_SCALE, hit.z / RACE_SCALE);
    });
    const resize = () => { const w = host.clientWidth || 800, h = host.clientHeight || 500; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(host);
    let raf, last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      orbit.update();
      const st = three.current;
      if (st.drive && st.loopPts?.length > 2) {
        const L = st.loopPts;
        st.driveT = (st.driveT + dt * 16) % L.length;
        const i = Math.floor(st.driveT), f = st.driveT - i;
        const a = L[i], b = L[(i + 1) % L.length];
        kart.visible = true;
        kart.position.set((a.x + (b.x - a.x) * f) * RACE_SCALE, ((a.y || 0) + ((b.y || 0) - (a.y || 0)) * f) * 0.6 + (st.worldScene ? 0.6 : 0.05), (a.z + (b.z - a.z) * f) * RACE_SCALE);
        kart.rotation.y = -Math.atan2(b.z - a.z, b.x - a.x);
      } else kart.visible = false;
      st.itemRoot?.children.forEach((c) => c.traverse((n) => { if (n.userData.bob) n.position.y = 2.4 + Math.sin(now / 260) * 0.3; }));
      ghostRoot.children.forEach((c) => { c.traverse((n) => { if (n.material?.opacity != null && n.userData.pulse) n.material.opacity = 0.45 + Math.sin(now / 200) * 0.15; }); });
      renderer.render(st.worldScene || scene, camera);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    trackRoot.scale.set(RACE_SCALE, 1, RACE_SCALE); ghostRoot.scale.set(RACE_SCALE, 1, RACE_SCALE);
    three.current = { scene, trackRoot, itemRoot, ghostRoot, ground, camera, orbit, kart, driveT: 0 };
    if (import.meta.env.DEV) window.__bbTrackMaker = three;
    return () => { cancelAnimationFrame(raf); ro.disconnect(); orbit.dispose(); renderer.dispose(); renderer.domElement.remove(); };
  }, []);

  /* Rebuild the road when the track changes */
  useEffect(() => {
    const st = three.current;
    if (!st.trackRoot) return;
    st.trackRoot.clear(); st.ghostRoot.clear();
    st.itemRoot.clear(); st.trackRoot.add(st.itemRoot);
    st.ground.material.color.set(new THREE.Color(0x7ccf5a).lerp(new THREE.Color(world.color), 0.12));
    const { laid, loop } = trackLoop(track);
    st.loopPts = loop;
    const closing = loop.filter((p) => p.piece === 'close');
    const plain = new THREE.Group(); plain.userData.plainRoad = true;
    plain.add(roadMesh(laid, { closed: false }));
    if (closing.length) plain.add(roadMesh([laid[laid.length - 1], ...closing, laid[0]], { color: check.ok ? 0x5b6475 : 0xb45309, opacity: 0.75, kerbs: false }));
    plain.add(startLine(laid[0]));
    plain.visible = !st.worldScene;
    st.trackRoot.add(plain);
    // Selected piece glow
    if (sel != null) {
      const segment = laid.filter((p) => p.piece === sel);
      if (segment.length > 1) { const hl = roadMesh(segment, { color: 0xfacc15, opacity: 0.55, kerbs: false, width: TRACK_WIDTH + 1.4 }); hl.position.y = 0.45; st.trackRoot.add(hl); }
    }
    // Items on the road (bumpers, boost pads, ramps)
    const fr = loopFractions(loop);
    const laneStep = (st.worldScene?.userData?.raceLaneStep ?? 2.4) / RACE_SCALE;
    (track.items || []).forEach((it) => {
      const pos = itemPosition(loop, fr, it.t, it.lane, laneStep);
      const m = itemMarker(it.type);
      m.position.set(pos.x, (pos.y || 0) * 0.6 + 0.6, pos.z);
      m.rotation.y = -pos.a;
      // Drawn bigger than the real item so it's easy to spot from up high
      m.scale.set(2.2 / RACE_SCALE, 2.2, 2.2 / RACE_SCALE);
      st.itemRoot.add(m);
    });
    // Where the road runs into itself
    check.where.slice(0, 40).forEach((p) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(1.4, 12, 8), new THREE.MeshBasicMaterial({ color: 0xef4444, transparent: true, opacity: 0.8 }));
      m.position.set(p.x, 1.2, p.z); st.trackRoot.add(m);
    });
    // Ghost of the piece you're about to add
    if (hoverPiece) {
      const at = sel == null ? track.pieces.length : sel + 1;
      const before = layPieces(track.pieces.slice(0, at));
      const withIt = layPieces([...track.pieces.slice(0, at), hoverPiece]);
      const cx = laid[0].x - layPieces(track.pieces)[0].x, cz = laid[0].z - layPieces(track.pieces)[0].z;
      const seg = withIt.slice(before.length - 1).map((p) => ({ ...p, x: p.x + cx, z: p.z + cz }));
      const g = roadMesh(seg, { color: 0x22c55e, opacity: 0.55, kerbs: false });
      g.position.y = 0.5; g.traverse((n) => { if (n.isMesh) n.userData.pulse = true; });
      st.ghostRoot.add(g);
    }
  }, [track, sel, hoverPiece, check, world.color]);

  /* Clicking the road with the Items tray open: place the item there (or take one away) */
  useEffect(() => {
    three.current.onPick = (x, z) => {
      if (tab !== 'items') return;
      const { loop } = trackLoop(track);
      if (loop.length < 3) return;
      let best = 0, bd = Infinity;
      loop.forEach((p, i) => { const d = (p.x - x) ** 2 + (p.z - z) ** 2; if (d < bd) { bd = d; best = i; } });
      if (Math.sqrt(bd) > TRACK_WIDTH / 2 + 1.5) { setItemMsg('Click on the road itself to put it there.'); return; }
      const fr = loopFractions(loop);
      const p = loop[best], q = loop[(best + 1) % loop.length];
      const dx = q.x - p.x, dz = q.z - p.z, L = Math.hypot(dx, dz) || 1;
      const side = (x - p.x) * (-dz / L) + (z - p.z) * (dx / L);
      const laneStep = (three.current.worldScene?.userData?.raceLaneStep ?? 2.4) / RACE_SCALE;
      const lane = Math.max(-1, Math.min(1, Math.round(side / laneStep)));
      const t = fr[best];
      const lapLen = checkTrack(track).length || 200;
      const items = track.items || [];
      const near = items.findIndex((it) => Math.min(Math.abs(it.t - t), 1 - Math.abs(it.t - t)) * lapLen < 4 && (itemTool === 'erase' || it.lane === lane));
      if (near >= 0) { update({ items: items.filter((_, i) => i !== near) }); setItemMsg('Taken away.'); return; }
      if (itemTool === 'erase') { setItemMsg('Nothing there to take away.'); return; }
      if (t < 0.04 || t > 0.985) { setItemMsg('Keep the start line clear: put it further along the road.'); return; }
      if (items.length >= MAX_TRACK_ITEMS) { setItemMsg(`That's the most a track can have (${MAX_TRACK_ITEMS}). Click one to take it away.`); return; }
      update({ items: [...items, { type: itemTool, t: +t.toFixed(4), lane }] });
      const info = TRACK_ITEMS.find((i) => i.id === itemTool);
      setItemMsg(`${info.emoji} ${info.label} in the ${LANES.find(([v]) => v === lane)[1].toLowerCase()} lane`);
    };
  });

  /* Scatter a few items round the lap (never all three lanes blocked at once) */
  const sprinkleItems = () => {
    const n = 7, out = [];
    for (let i = 0; i < n; i++) {
      const t = 0.1 + (0.82 * (i + 0.5 + (Math.random() - 0.5) * 0.5)) / n;
      const type = ['bumper', 'bumper', 'boost', 'ramp'][Math.floor(Math.random() * 4)];
      out.push({ type, t: +t.toFixed(4), lane: Math.floor(Math.random() * 3) - 1 });
    }
    update({ items: out });
    setItemMsg('Items scattered round your track: click any of them to take it away.');
  };

  useEffect(() => { three.current.drive = driving; three.current.driveT = 0; }, [driving]);

  /* The real kart world around the track — built by the race itself, so it looks exactly like
     Race it! (rebuilt a moment after each change; the plain road shows while it builds). */
  const [worldBusy, setWorldBusy] = useState(false);
  useEffect(() => {
    const st = three.current;
    if (!st.scene) return undefined;
    setWorldBusy(true);
    const timer = setTimeout(() => {
      const ws = new THREE.Scene();
      ws.userData.qualityTier = 'medium';
      ws.add(new THREE.HemisphereLight(0xffffff, 0x8a9a7a, 1.2));
      ws.add(new THREE.AmbientLight(0xffffff, 0.35));
      const sun = new THREE.DirectionalLight(0xfff4e0, 2.2); sun.position.set(60, 120, 40); ws.add(sun);
      try {
        buildMKTrackArena(ws, track.world, trackToRaceCourse(track).expandedCarTrack);
        ws.add(st.trackRoot); ws.add(st.ghostRoot); ws.add(st.kart);
        const old = st.worldScene;
        st.worldScene = ws;
        old?.userData?._raceClearanceCancel?.();
        st.trackRoot.children.forEach((c) => { if (c.userData.plainRoad) c.visible = false; });
        // Frame the whole track (only when the road or world changed, not when items are added)
        const frameKey = `${track.world}|${track.pieces.join(',')}`;
        if (st.framedKey !== frameKey) {
          st.framedKey = frameKey;
          const { size } = trackLoop(track);
          const dist = Math.max(55, size * RACE_SCALE * 1.05);
          st.camera.position.set(0, dist * 0.55, dist);
          st.orbit.target.set(0, 0, 0); st.orbit.update();
        }
        st.viewTargets = () => {
          const L = (st.loopPts || []).filter((_, i) => i % 12 === 0).map((p) => new THREE.Vector3(p.x * RACE_SCALE, 1, p.z * RACE_SCALE));
          return [new THREE.Vector3(0, 0, 0), ...L];
        };
        // scenery keeps streaming in for a few seconds: clear the view a few times
        [0, 1200, 3000, 6000].forEach((ms) => setTimeout(() => { if (st.worldScene === ws) clearView(ws, st.camera, st.viewTargets()); }, ms));
      } catch (e) { console.warn('[TrackMaker] world', e); st.worldScene = null; st.scene.add(st.trackRoot, st.ghostRoot, st.kart); }
      setWorldBusy(false);
    }, 650);
    return () => clearTimeout(timer);
  }, [track.pieces, track.world, JSON.stringify(track.items || []), track.rivals, track.rivalPace]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const keys = (e) => {
      if (/input|textarea|select/i.test(e.target.tagName)) return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); if (e.shiftKey) redo(); else undo(); return; }
      if ((e.key === 'Delete' || e.key === 'Backspace') && sel != null) { e.preventDefault(); removeSel(); }
      if (e.key === 'Escape') setSel(null);
    };
    window.addEventListener('keydown', keys);
    return () => window.removeEventListener('keydown', keys);
  });

  const save = () => { onSave(track); setSaved(true); };
  // Autosave: every change is kept (a moment after you stop), so nothing is lost if you leave
  const firstRender = useRef(true);
  const pending = useRef(null);
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return undefined; }
    pending.current = track;
    const t = setTimeout(() => { onSave(track); setSaved(true); pending.current = null; }, 700);
    return () => clearTimeout(t);
  }, [track]); // eslint-disable-line react-hooks/exhaustive-deps
  // Leaving straight after a change (Back, another tab, closing the page): save it now
  useEffect(() => {
    const flush = () => { if (pending.current) { onSave(pending.current); pending.current = null; } };
    window.addEventListener('pagehide', flush);
    return () => { window.removeEventListener('pagehide', flush); flush(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="tm">
      <div className="ab-top">
        <button className="cs-btn cs-btn--ghost" onClick={onBack}>← Create Studio</button>
        <select className="ab-emoji" value={track.emoji} onChange={(e) => update({ emoji: e.target.value })} aria-label="Track icon">
          {EMOJIS.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
        <input className="ab-name" value={track.name} maxLength={24} onChange={(e) => update({ name: e.target.value })} aria-label="Track name" />
        <div style={{ position: 'relative' }}>
          <button className="ab-world" onClick={() => setPanel(panel === 'world' ? null : 'world')} style={{ '--a': world.color, '--b': '#334155' }}>
            <i>{world.emoji}</i><span><b>{world.label}</b><small>Change world</small></span>
          </button>
          {panel === 'world' && (
            <div className="ab-pop tm-worlds">
              {TRACK_WORLDS.map((w) => (
                <button key={w.id} className={`tm-world${w.id === track.world ? ' is-on' : ''}`} style={{ '--c': w.color }} onClick={() => { update({ world: w.id }); setPanel(null); }}>
                  <i>{w.emoji}</i><b>{w.label}</b>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="tm-chips" aria-label="Laps">
          <span>Laps</span>{[1, 2, 3].map((n) => <button key={n} className={`rb2-chip${track.laps === n ? ' is-on' : ''}`} onClick={() => update({ laps: n })}>{n}</button>)}
        </div>
        <div className="tm-chips" aria-label="Checkpoint gates">
          <span>Gates</span>{[2, 3, 4, 5].map((n) => <button key={n} className={`rb2-chip${track.gates === n ? ' is-on' : ''}`} onClick={() => update({ gates: n })}>{n}</button>)}
        </div>
        <span className="cs-topbar-title" />
        <div style={{ position: 'relative' }}>
          <button className="cs-btn" onClick={() => { navigator.clipboard?.writeText(encodeTrack(track)).catch(() => {}); setShareMsg('Share code copied! A friend can paste it into "Import track" in Create Studio.'); setPanel(panel === 'share' ? null : 'share'); }}><EmojiIcon e="🔗" style={{ marginRight: '0.35em' }} />Share</button>
          {panel === 'share' && (
            <div className="ab-pop tm-share">
              <b>{shareMsg}</b>
              <textarea readOnly value={encodeTrack(track)} onFocus={(e) => e.target.select()} rows={3} />
            </div>
          )}
        </div>
        <button className="cs-btn cs-btn--primary" onClick={save}><IconText>{saved ? '✅ Saved' : '💾 Saving…'}</IconText></button>
        <button className={`cs-btn cs-btn--go${check.ok ? '' : ' tm-notready'}`} onClick={() => { if (!check.ok) { setNudge((n) => n + 1); return; } onSave(track); onPlay(track); }} title={check.ok ? 'Race your track' : check.problems[0]}><EmojiIcon e="🏎️" style={{ marginRight: '0.35em' }} />Race it!</button>
      </div>

      <div className="ab-stage">
        <div ref={hostRef} className="ab-canvas" aria-label="3D view of your race track" />
        <div className="rb2-tools ab-tools" role="toolbar" aria-label="Track tools">
          <button className={`rb2-tool${driving ? ' is-on' : ''}`} onClick={() => setDriving((v) => !v)} title="Watch a kart drive your track"><span><EmojiIcon e="🏎️" /></span><small>{driving ? 'Stop' : 'Test lap'}</small></button>
          <span className="rb2-sep" />
          <button className="rb2-tool" onClick={undo} disabled={!history.current.past.length} title="Undo (Ctrl/Cmd+Z)"><span>↩</span><small>Undo</small></button>
          <button className="rb2-tool" onClick={redo} disabled={!history.current.future.length} title="Redo"><span>↪</span><small>Redo</small></button>
          <button className="rb2-tool" onClick={removeSel} disabled={sel == null} title="Delete the selected piece"><span><EmojiIcon e="🗑" /></span><small>Delete</small></button>
          <span className="rb2-sep" />
          <button className="rb2-tool" onClick={() => setPanel(panel === 'ideas' ? null : 'ideas')} title="Start from an idea"><span><EmojiIcon e="💡" /></span><small>Ideas</small></button>
          <button className="rb2-tool" onClick={() => { setPieces(surpriseTrack()); setSel(null); }} title="Make a random race track"><span><EmojiIcon e="🎲" /></span><small>Surprise</small></button>
          <button className="rb2-tool" onClick={() => { if (window.confirm('Start a new track?')) { setPieces(['long']); setSel(null); } }} title="Start again"><span><EmojiIcon e="🧹" /></span><small>Clear</small></button>
        </div>
        {panel === 'ideas' && (
          <div className="rb2-float tm-ideas">
            <div className="rb2-float-title"><EmojiIcon e="💡" /> Start from an idea</div>
            {TRACK_IDEAS.map((t) => <button key={t.id} className="cs-btn cs-btn--sm" style={{ width: '100%', marginBottom: 6, justifyContent: 'flex-start' }} onClick={() => { setPieces(t.pieces.slice()); setSel(null); setPanel(null); }}>{t.emoji} {t.name}</button>)}
          </div>
        )}
        <div className="rb2-hint">{tab === 'items' ? (itemMsg || `Click on the road to put a ${TRACK_ITEMS.find((i) => i.id === itemTool)?.label.toLowerCase() || 'item'} there: left, middle or right lane · click an item to take it away`) : sel != null ? `Piece ${sel + 1} selected — new pieces go after it · Delete removes it · Esc to add at the end` : 'Click a road piece below to add it to the end of your track · drag to turn the view'}</div>
        {worldBusy && <div className="tm-busy">Building the world…</div>}
        <div key={nudge} className={`ab-check ${check.ok ? 'is-ok' : 'is-bad'}${nudge && !check.ok ? ' tm-bounce' : ''}`}>
          <IconText>{check.ok ? `✅ Ready to race! ${check.length} m a lap` : `⚠️ ${nudge ? 'Not ready to race yet: ' : ''}${check.problems[0]}`}</IconText>
          {!check.ok && (fixed
            ? <button className="tm-fix" onClick={() => { setPieces(fixed); setSel(null); }}><EmojiIcon e="🪄" style={{ marginRight: '0.3em' }} />Fix it for me</button>
            : <button className="tm-fix" onClick={() => setPanel('ideas')}><EmojiIcon e="💡" style={{ marginRight: '0.3em' }} />Try an idea</button>)}
        </div>
      </div>

      <div className="rb2-tray">
        <div className="tm-tabs" role="tablist" aria-label="What to add">
          <button role="tab" aria-selected={tab === 'road'} className={`tm-tab${tab === 'road' ? ' is-on' : ''}`} onClick={() => { setTab('road'); setItemMsg(''); }}><EmojiIcon e="🛣️" style={{ marginRight: '0.35em' }} />Road pieces</button>
          <button role="tab" aria-selected={tab === 'items'} className={`tm-tab${tab === 'items' ? ' is-on' : ''}`} onClick={() => { setTab('items'); setSel(null); }}><EmojiIcon e="🚧" style={{ marginRight: '0.35em' }} />Items &amp; rivals <i className="tm-count">{(track.items || []).length}</i></button>
        </div>
        {tab === 'items' ? (
          <div className="tm-items">
            <div className="rb2-parts">
              {TRACK_ITEMS.map((it) => (
                <button key={it.id} className={`rb2-part tm-piece tm-item${itemTool === it.id ? ' is-on' : ''}`} onClick={() => { setItemTool(it.id); setItemMsg(''); }} title={it.tip}>
                  <span className="tm-item-icon"><EmojiIcon e={it.emoji} /></span>
                  <small>{it.label}</small>
                  <em>{(track.items || []).filter((x) => x.type === it.id).length || ''}</em>
                </button>
              ))}
              <button className={`rb2-part tm-piece tm-item${itemTool === 'erase' ? ' is-on' : ''}`} onClick={() => { setItemTool('erase'); setItemMsg(''); }} title="Click an item on the road to take it away">
                <span className="tm-item-icon"><EmojiIcon e="🧽" /></span><small>Take away</small>
              </button>
              <button className="rb2-part tm-piece tm-item" onClick={sprinkleItems} title="Scatter some items round the track">
                <span className="tm-item-icon"><EmojiIcon e="🎲" /></span><small>Scatter</small>
              </button>
              <button className="rb2-part tm-piece tm-item" disabled={!(track.items || []).length} onClick={() => { update({ items: [] }); setItemMsg('All items taken off the road.'); }} title="Take every item off the road">
                <span className="tm-item-icon"><EmojiIcon e="🧹" /></span><small>Clear all</small>
              </button>
            </div>
            <div className="tm-rivals">
              <div className="tm-chips" aria-label="Rival karts">
                <span>Rival karts</span>{[0, 1, 2, 3].map((n) => <button key={n} className={`rb2-chip${(track.rivals ?? 3) === n ? ' is-on' : ''}`} onClick={() => update({ rivals: n })}>{n}</button>)}
              </div>
              <div className="tm-chips" aria-label="Rival speed">
                <span>Rival speed</span>{[['slow', '🐢 Slow'], ['normal', '🏎️ Normal'], ['fast', '🚀 Fast']].map(([id, label]) => <button key={id} disabled={(track.rivals ?? 3) === 0} className={`rb2-chip${(track.rivalPace || 'normal') === id ? ' is-on' : ''}`} onClick={() => update({ rivalPace: id })}>{label}</button>)}
              </div>
              <div className="cs-muted tm-items-tip"><EmojiIcon e="💡" style={{ marginRight: '0.3em' }} />Bumpers block a lane. In Robot Studio, use <b>When an object is ahead</b> → <b>Move to a clear lane</b> to dodge them.</div>
            </div>
          </div>
        ) : (<>
        <div className="tm-seq" aria-label="Your track, in order">
          <span className="tm-seq-label"><EmojiIcon e="🏁" /> Start</span>
          {track.pieces.map((id, i) => (
            <button key={`${i}-${id}`} className={`tm-step${sel === i ? ' is-on' : ''}`} style={{ '--c': PIECE_COLORS[id] }} onClick={() => setSel(sel === i ? null : i)} title={`${i + 1}. ${PIECE_BY_ID[id]?.label}`}>
              <PieceIcon id={id} size={30} /><small>{PIECE_BY_ID[id]?.label}</small>
            </button>
          ))}
          <span className="tm-seq-label">↩ back to start</span>
        </div>
        <div className="rb2-parts">
          {TRACK_PIECES.map((p) => (
            <button key={p.id} className="rb2-part tm-piece" style={{ '--c': PIECE_COLORS[p.id] }} onClick={() => addPiece(p.id)}
              onMouseEnter={() => setHoverPiece(p.id)} onMouseLeave={() => setHoverPiece(null)} onFocus={() => setHoverPiece(p.id)} onBlur={() => setHoverPiece(null)} title={`Add a ${p.label.toLowerCase()}`}>
              <PieceIcon id={p.id} size={54} />
              <small>{p.label}</small>
            </button>
          ))}
        </div>
        </>)}
      </div>
    </div>
  );
}
