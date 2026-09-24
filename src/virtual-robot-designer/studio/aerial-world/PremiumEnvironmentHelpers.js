/**
 * Shared geometry + PBR helpers for premium flying environments.
 * WebGL path: procedural meshes + flyingMat/pbrMat (hero FX via AerialUERenderKit).
 */
import * as THREE from 'three';
import { pbrMat } from '../../racing/mk-tracks/BiomeAAAKit.js';
import { flyingMat, flyingGeo, flyingAdd } from './FlyingArenaMaterialKit.js';

export const mat = flyingMat;
export const add = flyingAdd;
export const geo = flyingGeo;

export function seededRnd(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 7) % 2147483647;
    return s / 2147483647;
  };
}

export function instancedMesh(parent, baseGeo, material, count, placeFn, name) {
  const mesh = new THREE.InstancedMesh(baseGeo, material, count);
  mesh.name = name;
  const dummy = new THREE.Object3D();
  for (let i = 0; i < count; i++) {
    placeFn(dummy, i);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;
  parent.add(mesh);
  return mesh;
}

export function windowGrid(parent, x, y, z, faceW, faceH, cols, rows, neonColor, prefix, face = 'x') {
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      if ((c + r) % 4 === 0) continue;
      const wx = face === 'x' ? x + faceW / 2 + 0.08 : x + (c - cols / 2) * (faceW / cols);
      const wy = y + 1.2 + r * (faceH / rows);
      const wz = face === 'z' ? z + faceH / 2 + 0.08 : z + (c - cols / 2) * (faceW / cols);
      const win = new THREE.Mesh(
        new THREE.PlaneGeometry(faceW / cols * 0.55, faceH / rows * 0.62),
        pbrMat(neonColor, { emissive: neonColor, emi: 0.35 + ((c + r) % 3) * 0.2, roughness: 0.15 }),
      );
      win.position.set(wx, wy, wz);
      if (face === 'x') win.rotation.y = Math.PI / 2;
      win.name = `${prefix}Win_${c}_${r}`;
      parent.add(win);
    }
  }
}

export function archRow(parent, x, y, z, count, span, height, stoneMat, prefix) {
  for (let i = 0; i < count; i++) {
    const ox = x + (i - (count - 1) / 2) * span;
    add(parent, geo.box(0.8, height, 0.8), stoneMat, ox - span * 0.38, y + height / 2, z, `${prefix}ColL${i}`);
    add(parent, geo.box(0.8, height, 0.8), stoneMat, ox + span * 0.38, y + height / 2, z, `${prefix}ColR${i}`);
    add(parent, geo.torus(span * 0.38, 0.18, 6, 16, Math.PI), stoneMat, ox, y + height, z, `${prefix}Arch${i}`, { rotY: Math.PI / 2 });
  }
}

export function hazardStripes(parent, x, y, z, w, d, prefix) {
  for (let i = 0; i < Math.floor(w / 2); i++) {
    const col = i % 2 ? 0xfbbf24 : 0x1e293b;
    add(parent, geo.box(1.8, 0.06, d), mat(col, { emissive: col, emi: i % 2 ? 0.15 : 0 }), x - w / 2 + i * 2, y, z, `${prefix}Stripe${i}`);
  }
}

export function hexPrism(parent, x, y, z, radius, height, material, name, rotY = 0) {
  const m = add(parent, geo.cylinder(radius, radius, height, 6), material, x, y, z, name);
  m.rotation.y = rotY;
  return m;
}

/** SSR-style water: clearcoat + env reflection (WebGL fallback per spec §2). */
export function reflectiveWater(parent, x, y, z, w, h, name = 'CanalWaterSSR') {
  const water = pbrMat(0x0c1929, {
    roughness: 0.015,
    metalness: 0.88,
    emissive: 0x1e3a5f,
    emi: 0.06,
    transparent: true,
    opacity: 0.9,
  });
  if (water.isMeshPhysicalMaterial) {
    water.clearcoat = 1;
    water.clearcoatRoughness = 0.03;
  }
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h, 48, 20), water);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(x, y, z);
  mesh.name = name;
  mesh.userData.animateWater = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

export function cableTray(parent, x1, y, z1, x2, z2, prefix) {
  const midX = (x1 + x2) / 2;
  const midZ = (z1 + z2) / 2;
  const len = Math.hypot(x2 - x1, z2 - z1);
  const tray = add(parent, geo.box(len, 0.25, 0.8), mat('dark_steel', { metalness: 0.7 }), midX, y, midZ, `${prefix}Tray`);
  tray.rotation.y = Math.atan2(x2 - x1, z2 - z1);
  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    add(parent, geo.cylinder(0.04, 0.04, 0.04, 6), mat(0x22c55e, { emissive: 0x22c55e, emi: 0.6 }), x1 + (x2 - x1) * t, y - 0.15, z1 + (z2 - z1) * t, `${prefix}Cable${i}`);
  }
}

export function starField(parent, cx, cy, cz, count, spread, prefix) {
  return instancedMesh(
    parent,
    new THREE.SphereGeometry(0.1, 4, 4),
    pbrMat(0xf8fafc, { emissive: 0xffffff, emi: 0.6 }),
    count,
    (dummy, i) => {
      dummy.position.set(
        cx + (Math.sin(i * 12.989) * 0.5) * spread.x,
        cy + (Math.cos(i * 4.141) * 0.5 + 0.5) * spread.y,
        cz + (Math.sin(i * 7.233) * 0.5) * spread.z,
      );
      dummy.scale.setScalar(0.5 + (i % 5) * 0.15);
    },
    prefix,
  );
}

export function mossMat() {
  return mat(0x4a7c59, { roughness: 0.92, metalness: 0.02, maps: true });
}

export function obsidianMat() {
  const m = pbrMat(0x0f172a, { roughness: 0.15, metalness: 0.55, emissive: 0x312e81, emi: 0.06 });
  if (m.isMeshPhysicalMaterial) {
    m.clearcoat = 0.95;
    m.clearcoatRoughness = 0.06;
  }
  return m;
}

export function sparkPoints(parent, count, spread, yBase, name) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * spread.x;
    positions[i * 3 + 1] = yBase + Math.random() * spread.y;
    positions[i * 3 + 2] = (Math.random() - 0.5) * spread.z;
  }
  const geoPts = new THREE.BufferGeometry();
  geoPts.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const pts = new THREE.Points(
    geoPts,
    new THREE.PointsMaterial({ color: 0xfbbf24, size: 0.22, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  pts.name = name;
  pts.userData.sparkField = true;
  parent.add(pts);
  return pts;
}
