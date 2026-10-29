/**
 * 3D pictures of Arena Maker pieces and decorations for the tray, drawn with the same
 * builders the game uses (buildArenaBoard / the world props), cached as image URLs.
 */
import * as THREE from 'three';
import { buildArenaBoard, arenaLayout } from '../studio/CustomArenaLab.js';
import { MISSION_PROPS } from '../studio/mission-world/themes/MissionThemeKit.js';

const SIZE = 112;
const cache = new Map();
let kit = null;

function getKit() {
  if (kit) return kit;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = SIZE;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(SIZE, SIZE, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8b8fb8, 1.7));
  const sun = new THREE.DirectionalLight(0xffffff, 2.2);
  sun.position.set(3, 6, 4);
  scene.add(sun);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 200);
  kit = { renderer, scene, camera, canvas };
  return kit;
}

function shoot(obj, { tilt = 0.75 } = {}) {
  const { renderer, scene, camera, canvas } = getKit();
  scene.add(obj);
  obj.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(obj);
  const c = box.getCenter(new THREE.Vector3());
  const r = box.getSize(new THREE.Vector3()).length() / 2 || 1;
  const dist = r / Math.sin(THREE.MathUtils.degToRad(15)) * 1.02;
  camera.position.copy(c).add(new THREE.Vector3(0.55, tilt, 1).normalize().multiplyScalar(dist));
  camera.lookAt(c);
  renderer.setClearColor(0x000000, 0);
  renderer.render(scene, camera);
  scene.remove(obj);
  return canvas.toDataURL('image/png');
}

/** Hide the floor square and the board edging that come with a one-square board. */
export function hideFloor(root) {
  root.children.slice(0, 3).forEach((c) => { if (c.isInstancedMesh || (c.geometry?.parameters?.height ?? 1) < 0.15) root.remove(c); });
  // empty instanced meshes (no walls on this square) would still count towards the framing
  [...root.children].forEach((c) => { if (c.isInstancedMesh && c.count === 0) root.remove(c); });
}

/** A picture of one map piece (wall, gem, bug, flag…) in a world, standing on its floor square. */
export function arenaTileThumb(tile, theme, prop) {
  const key = `t|${tile}|${theme}|${prop || ''}`;
  if (cache.has(key)) return cache.get(key);
  let url = null;
  try {
    const arena = { theme, map: [tile], props: prop ? { '0,0': prop } : undefined, name: 'thumb' };
    const root = new THREE.Group();
    buildArenaBoard(root, arena, arenaLayout(arena.map, { centred: true }), { obstacles: [], collectibles: [], movers: [] });
    // Show the piece itself, not its floor square and edging (lava and the start pad keep theirs)
    if (!'LS'.includes(tile)) hideFloor(root);
    root.traverse((o) => { if (o.material?.blending === THREE.AdditiveBlending) o.removeFromParent?.(); });
    url = shoot(root);
  } catch { url = null; }
  cache.set(key, url);
  return url;
}

/** A picture of a world decoration (tree, rocket, cupcake…). */
export function propThumb(name) {
  const key = `p|${name}`;
  if (cache.has(key)) return cache.get(key);
  let url = null;
  try {
    let s = 7;
    const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    const obj = MISSION_PROPS[name]?.(rnd, {});
    if (obj) url = shoot(obj, { tilt: 0.45 });
  } catch { url = null; }
  cache.set(key, url);
  return url;
}
