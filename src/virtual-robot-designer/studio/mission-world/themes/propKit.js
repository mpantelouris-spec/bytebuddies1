/** Low-level builders shared by the mission theme prop library. Props face local +z and sit on y = 0. */
import * as THREE from 'three';

const matCache = new Map();

/** Cached standard material — keeps instanced scatter merges down to a few draw calls. */
export function M(color, o = {}) {
  const key = `${color}|${JSON.stringify(o, (k, v) => (v && v.isTexture ? v.uuid : v))}`;
  let m = matCache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness: 0.62, metalness: 0.02, ...o });
    matCache.set(key, m);
  }
  return m;
}

/** Emissive material. */
export function E(color, intensity = 0.9, o = {}) {
  return M(color, { emissive: color, emissiveIntensity: intensity, roughness: 0.35, ...o });
}

export function clearMaterialCache() {
  matCache.clear();
}

export function put(g, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, rz);
  m.castShadow = true;
  m.receiveShadow = true;
  g.add(m);
  return m;
}

export const box = (g, w, h, d, mat, x = 0, y = h / 2, z = 0, ry = 0) => put(g, new THREE.BoxGeometry(w, h, d), mat, x, y, z, 0, ry, 0);
export const cyl = (g, rt, rb, h, mat, x = 0, y = h / 2, z = 0, seg = 12) => put(g, new THREE.CylinderGeometry(rt, rb, h, seg), mat, x, y, z);
export const sph = (g, r, mat, x = 0, y = r, z = 0, seg = 14) => put(g, new THREE.SphereGeometry(r, seg, Math.max(6, Math.round(seg * 0.7))), mat, x, y, z);
export const cone = (g, r, h, mat, x = 0, y = h / 2, z = 0, seg = 10) => put(g, new THREE.ConeGeometry(r, h, seg), mat, x, y, z);
export const tor = (g, r, t, mat, x = 0, y = 0, z = 0, arc = Math.PI * 2, rx = 0, ry = 0) => put(g, new THREE.TorusGeometry(r, t, 10, 32, arc), mat, x, y, z, rx, ry, 0);
export const ico = (g, r, mat, x = 0, y = r, z = 0, detail = 0) => put(g, new THREE.IcosahedronGeometry(r, detail), mat, x, y, z);
export const G = () => new THREE.Group();

export function pick(rand, list) {
  return list[Math.floor(rand() * list.length) % list.length];
}

let texCache = new Map();
/** Cached canvas texture. */
export function tex(key, draw, w = 128, h = w) {
  if (texCache.has(key)) return texCache.get(key);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  texCache.set(key, t);
  return t;
}

export function clearTextureCache() {
  texCache = new Map();
}

export const css = (hex) => `#${new THREE.Color(hex).getHexString()}`;

/** Window-grid facade texture for buildings. */
export function facadeTexture(wall, glass, lit = false) {
  return tex(`facade-${wall}-${glass}-${lit}`, (x, w, h) => {
    x.fillStyle = css(wall);
    x.fillRect(0, 0, w, h);
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 3; c++) {
        x.fillStyle = lit && (r + c) % 3 !== 0 ? '#ffe39a' : css(glass);
        x.fillRect(10 + c * 40, 10 + r * 30, 26, 18);
        x.fillStyle = 'rgba(255,255,255,0.35)';
        x.fillRect(10 + c * 40, 10 + r * 30, 26, 4);
      }
    }
  }, 128, 128);
}

/** Text/label texture for signs and posters. */
export function labelTexture(text, bg = '#ffffff', fg = '#1e293b', w = 512, h = 160, font = 'bold 72px system-ui, Arial') {
  return tex(`label-${text}-${bg}-${fg}-${w}-${h}`, (x) => {
    x.fillStyle = bg;
    x.beginPath();
    x.roundRect(4, 4, w - 8, h - 8, 22);
    x.fill();
    x.strokeStyle = 'rgba(0,0,0,0.18)';
    x.lineWidth = 8;
    x.stroke();
    x.fillStyle = fg;
    x.font = font;
    x.textAlign = 'center';
    x.textBaseline = 'middle';
    x.fillText(text, w / 2, h / 2 + 4);
  }, w, h);
}
