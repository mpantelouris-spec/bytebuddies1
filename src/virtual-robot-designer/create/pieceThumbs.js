/**
 * Little 3D pictures of each Robot Builder part for the parts tray, rendered once with a
 * shared off-screen renderer and cached as image URLs.
 */
import * as THREE from 'three';
import { makePieceObject, PIECE_DEFAULTS } from './freeBuild.js';

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
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8b8fb8, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 2.4);
  sun.position.set(2, 4, 3);
  scene.add(sun);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 50);
  kit = { renderer, scene, camera, canvas };
  return kit;
}

/** A PNG data URL showing the part at its default size and colour (null if WebGL is unavailable). */
export function pieceThumb(type) {
  if (cache.has(type)) return cache.get(type);
  let url = null;
  try {
    const { renderer, scene, camera, canvas } = getKit();
    const obj = makePieceObject({ id: 'thumb', type, p: [0, 0, 0], r: [0, 0, 0], s: PIECE_DEFAULTS[type]?.s || [0.5, 0.5, 0.5] });
    obj.rotation.y = -0.55;
    scene.add(obj);
    obj.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(obj);
    const centre = box.getCenter(new THREE.Vector3());
    const r = box.getSize(new THREE.Vector3()).length() / 2 || 0.5;
    const dist = r / Math.sin(THREE.MathUtils.degToRad(15)) * 1.05;
    camera.position.copy(centre).add(new THREE.Vector3(0.45, 0.55, 1).normalize().multiplyScalar(dist));
    camera.lookAt(centre);
    renderer.setClearColor(0x000000, 0);
    renderer.render(scene, camera);
    url = canvas.toDataURL('image/png');
    scene.remove(obj);
  } catch {
    url = null;
  }
  cache.set(type, url);
  return url;
}
