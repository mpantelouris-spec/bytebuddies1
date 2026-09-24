/**
 * GameWorldBuilder.js — Nintendo-quality game world utilities.
 * Think Imagineer, not robotics engineer.
 */
import * as THREE from 'three';
import { isStartLaunchCorridor } from './mk-tracks/CodeRacerTrackStandards.js';

const _up = new THREE.Vector3(0, 1, 0);
const _tan = new THREE.Vector3();
const _n = new THREE.Vector3();
const _b = new THREE.Vector3();

/** Keep normals continuous along a spline — prevents guardrails crossing the track at seams. */
export function stabilizeNormal(n, prevN) {
  const out = n.clone();
  if (prevN && out.dot(prevN) < 0) out.multiplyScalar(-1);
  return out;
}

/** Pick the normal whose +edge stays closest to the previous rail post (prevents X-crossing). */
export function stabilizeRailNormal(n, prevN, p, edgeOffset, prevEdge) {
  let out = stabilizeNormal(n, prevN);
  if (prevEdge) {
    const cand = p.clone().addScaledVector(out, edgeOffset);
    const altN = out.clone().negate();
    const alt = p.clone().addScaledVector(altN, edgeOffset);
    if (cand.distanceToSquared(prevEdge) > alt.distanceToSquared(prevEdge)) out = altN;
  }
  return out;
}

/** Sample spline with full 3D frame (position, tangent, normal, binormal). */
export function sampleTrackFrame(curve, t) {
  const p = curve.getPointAt(t);
  _tan.copy(curve.getTangentAt(t)).normalize();
  _n.crossVectors(_tan, _up);
  if (_n.lengthSq() < 0.001) _n.set(1, 0, 0);
  else _n.normalize();
  _b.crossVectors(_tan, _n).normalize();
  return {
    p: p.clone(),
    tan: _tan.clone(),
    n: _n.clone(),
    b: _b.clone(),
    rot: Math.atan2(_tan.x, _tan.z),
  };
}

/** Register animated updater on scene. */
export function addWorldMover(scene, fn) {
  (scene.userData.movers = scene.userData.movers || []).push({ update: fn });
}

/** Register collectible (coin, star, crystal, XP orb). */
export function addCollectible(scene, mesh, x, y, z, value = 10, radius = 1.0, type = 'coin') {
  mesh.position.set(x, y, z);
  (scene.userData.collectibles = scene.userData.collectibles || []).push({
    mesh, pos: { x, y, z }, radius, value, collected: false, type,
  });
  return mesh;
}

/** Floating bob + spin animation for collectibles. */
export function animateCollectible(mesh, phase = 0, spin = 1.2) {
  mesh.userData.animPhase = phase;
  mesh.userData.animSpin = spin;
  return mesh;
}

/** Section title sign floating beside track. */
export function buildSectionSign(name, subtitle, color = 0xffffff) {
  const g = new THREE.Group();
  const c = document.createElement('canvas');
  c.width = 512; c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.roundRect(8, 8, 496, 112, 16);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.roundRect(8, 8, 496, 112, 16);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 42px system-ui,sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(name, 256, 58);
  ctx.font = '24px system-ui,sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText(subtitle, 256, 96);
  const tex = new THREE.CanvasTexture(c);
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 2),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }),
  );
  g.add(sign);
  const glow = new THREE.PointLight(color, 1.2, 12);
  glow.position.set(0, 0, 0.5);
  g.add(glow);
  g.userData.signMat = sign.material;
  return g;
}

let _coinFaceTex = null;
let _coinMats = null;
let _coinGeos = null;

function getCoinFaceTexture() {
  if (_coinFaceTex) return _coinFaceTex;
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d');
  const grad = ctx.createRadialGradient(46, 38, 6, 64, 64, 62);
  grad.addColorStop(0, '#e3c25a');
  grad.addColorStop(0.45, '#c4961a');
  grad.addColorStop(1, '#8a6410');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(64, 64, 62, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#6a4c0c';
  ctx.lineWidth = 7;
  ctx.stroke();
  ctx.fillStyle = '#5c4309';
  ctx.font = 'bold 76px Georgia, "Times New Roman", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('$', 64, 70);
  _coinFaceTex = new THREE.CanvasTexture(c);
  if (THREE.SRGBColorSpace) _coinFaceTex.colorSpace = THREE.SRGBColorSpace;
  _coinFaceTex.anisotropy = 4;
  return _coinFaceTex;
}

function getCoinMaterials() {
  if (_coinMats) return _coinMats;
  _coinMats = {
    face: new THREE.MeshBasicMaterial({ map: getCoinFaceTexture() }),
    rim: new THREE.MeshBasicMaterial({ color: 0x8a6410 }),
  };
  return _coinMats;
}

function getCoinGeometries() {
  if (_coinGeos) return _coinGeos;
  const r = 0.48;
  const thick = 0.1;
  _coinGeos = {
    edge: new THREE.CylinderGeometry(r, r, thick, 28, 1, true),
    face: new THREE.CircleGeometry(r * 0.98, 28),
    rim: new THREE.TorusGeometry(r, thick * 0.42, 8, 28),
    thick,
  };
  return _coinGeos;
}

/** Upright Mario-Kart gold disc — MeshBasic so neon bloom cannot blow it out to white. */
export function buildCoin(scale = 1) {
  const g = new THREE.Group();
  const mats = getCoinMaterials();
  const geos = getCoinGeometries();
  const edge = new THREE.Mesh(geos.edge, mats.rim);
  edge.rotation.x = Math.PI / 2;
  g.add(edge);
  const faceA = new THREE.Mesh(geos.face, mats.face);
  faceA.position.z = geos.thick / 2 + 0.002;
  g.add(faceA);
  const faceB = new THREE.Mesh(geos.face, mats.face);
  faceB.position.z = -(geos.thick / 2 + 0.002);
  faceB.rotation.y = Math.PI;
  g.add(faceB);
  g.add(new THREE.Mesh(geos.rim, mats.rim));
  g.scale.setScalar(scale);
  g.userData.animSpin = 2.6;
  g.traverse((o) => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } });
  return g;
}

let _starMat = null;

/** Star collectible — same non-bloom gold treatment as coins. */
export function buildStarCollectible(scale = 1, color = 0xc4961a) {
  const shape = new THREE.Shape();
  const outer = 0.42;
  const inner = 0.17;
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    if (i === 0) shape.moveTo(px, py);
    else shape.lineTo(px, py);
  }
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.09, bevelEnabled: false });
  if (!_starMat) {
    _starMat = new THREE.MeshBasicMaterial({ color });
  }
  const mesh = new THREE.Mesh(geo, _starMat);
  mesh.scale.setScalar(scale);
  mesh.userData.animSpin = 2.2;
  return mesh;
}

/** Crystal collectible / prop. */
export function buildCrystal({ height = 4, color = 0x88ccff, emissive = 0x4488ff } = {}) {
  const g = new THREE.Group();
  const geo = new THREE.ConeGeometry(height * 0.35, height, 6);
  const mat = new THREE.MeshStandardMaterial({
    color, emissive, emissiveIntensity: 0.9, transparent: true, opacity: 0.88, metalness: 0.2, roughness: 0.1,
  });
  const core = new THREE.Mesh(geo, mat);
  core.position.y = height / 2;
  g.add(core);
  const light = new THREE.PointLight(emissive, 0.8, height * 2);
  light.position.y = height * 0.6;
  g.add(light);
  g.userData.crystalMat = mat;
  g.userData.light = light;
  return g;
}

/** Place collectibles on the driving line so a centerline kart can pick them up. */
export function scatterCollectiblesAlongTrack(scene, curve, ts, type = 'coin', value = 15, opts = {}) {
  const meshes = [];
  const hw = opts.halfWidth ?? 4;
  const finishT = opts.finishT ?? 0;
  ts.forEach((t, i) => {
    const frame = sampleTrackFrame(curve, t);
    const pos = frame.p.clone();
    if (isStartLaunchCorridor(t, finishT)) {
      pos.addScaledVector(frame.n, (i % 2 ? 1 : -1) * hw * 0.42);
    }
    pos.y += 0.78;
    const mesh = type === 'star' ? buildStarCollectible(1.15, 0xc4961a) : buildCoin(1.15);
    scene.add(mesh);
    addCollectible(scene, mesh, pos.x, pos.y, pos.z, value, 2.6, type);
    animateCollectible(mesh, i * 1.7);
    meshes.push(mesh);
  });
  return meshes;
}

/** Parallax star warp particles — speed scales with robot velocity. */
export function buildWarpStarfield(scene, count = 350) {
  const pos = new Float32Array(count * 3);
  const speed = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 120;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 60;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 120;
    speed[i] = 0.5 + Math.random() * 2;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xffffff, size: 0.25, transparent: true, opacity: 0.7,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  });
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);
  return {
    points: pts, geo, mat, speed,
    update(dt, warp = 1) {
      for (let i = 0; i < count; i++) {
        pos[i * 3 + 2] += speed[i] * dt * 8 * warp;
        if (pos[i * 3 + 2] > 60) pos[i * 3 + 2] = -60;
      }
      geo.attributes.position.needsUpdate = true;
      mat.size = 0.18 + warp * 0.35;
    },
  };
}

/** Firework burst at position. */
export function spawnFirework(scene, x, y, z, color = 0xff44aa) {
  const N = 24;
  const pos = new Float32Array(N * 3);
  const vel = [];
  for (let i = 0; i < N; i++) {
    pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
    const a = Math.random() * Math.PI * 2;
    const pitch = Math.random() * Math.PI;
    vel.push({
      x: Math.sin(pitch) * Math.cos(a) * (2 + Math.random() * 3),
      y: Math.cos(pitch) * (2 + Math.random() * 3),
      z: Math.sin(pitch) * Math.sin(a) * (2 + Math.random() * 3),
    });
  }
  const geo = new THREE.BufferGeometry();
  const attr = new THREE.BufferAttribute(pos, 3);
  geo.setAttribute('position', attr);
  const mat = new THREE.PointsMaterial({
    color, size: 0.35, transparent: true, opacity: 1,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);
  const start = performance.now();
  const tick = () => {
    const e = (performance.now() - start) / 900;
    if (e > 1) { scene.remove(pts); geo.dispose(); mat.dispose(); return; }
    mat.opacity = 1 - e;
    for (let i = 0; i < N; i++) {
      vel[i].y -= 5 * 0.016;
      pos[i * 3] += vel[i].x * 0.016;
      pos[i * 3 + 1] += vel[i].y * 0.016;
      pos[i * 3 + 2] += vel[i].z * 0.016;
    }
    attr.needsUpdate = true;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/** Animated collectibles tick (bob + spin). */
export function updateCollectibleAnimations(scene, time) {
  (scene.userData.collectibles || []).forEach((c) => {
    if (c.collected || !c.mesh) return;
    const ph = c.mesh.userData.animPhase ?? 0;
    c.mesh.position.y = c.pos.y + Math.sin(time * 2.5 + ph) * 0.25;
    c.mesh.rotation.y = time * (c.mesh.userData.animSpin ?? 1.5);
  });
}

/** Section landmarks placed at curve t-ranges. */
export function placeAtTrack(curve, t, offsetSide = 0, offsetUp = 0) {
  const { p, n, b } = sampleTrackFrame(curve, t);
  const pos = p.clone().addScaledVector(n, offsetSide).addScaledVector(b, offsetUp);
  return { pos, frame: sampleTrackFrame(curve, t) };
}
