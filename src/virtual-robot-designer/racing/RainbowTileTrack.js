/**
 * RainbowTileTrack.js — Glowing rainbow square tiles (Mario Kart Rainbow Road style).
 */
import * as THREE from 'three';
import { sampleTrackFrame, stabilizeNormal, stabilizeRailNormal } from './GameWorldBuilder.js';
import { makeHollowGoldStar } from './RainbowRoadVisuals.js';
import {
  buildRainbowGlassRibbon,
  createNeonCableMaterial,
  createRainbowGlassTrackMaterial,
  NEON_RAIL_COLORS,
} from './RainbowRoadGlassShader.js';

/** Bump when track visuals change — shown on race HUD so users can confirm fresh deploy. */
export const RAINBOW_TRACK_BUILD = 'v30';

const RAINBOW = [
  new THREE.Color(0xff2244),
  new THREE.Color(0xff8800),
  new THREE.Color(0xffee00),
  new THREE.Color(0x22ff88),
  new THREE.Color(0x00ccff),
  new THREE.Color(0x4466ff),
  new THREE.Color(0xcc44ff),
];

const dummy = new THREE.Object3D();

function rainbowAt(i) {
  const n = RAINBOW.length;
  return RAINBOW[((i % n) + n) % n];
}

/** Shared glossy rainbow road tile material — used for the full circuit. */
function _makeStarGlossTexture() {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#f4f0ff';
  ctx.fillRect(0, 0, c.width, c.height);
  for (let i = 0; i < 28; i++) {
    const sx = Math.random() * c.width;
    const sy = Math.random() * c.height;
    const r = 0.6 + Math.random() * 1.8;
    ctx.fillStyle = `rgba(255,255,255,${0.15 + Math.random() * 0.35})`;
    ctx.beginPath();
    for (let p = 0; p < 5; p++) {
      const a = (p / 5) * Math.PI * 2 - Math.PI / 2;
      const rad = p % 2 === 0 ? r : r * 0.42;
      const px = sx + Math.cos(a) * rad;
      const py = sy + Math.sin(a) * rad;
      if (p === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 1);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

let _starGlossTex = null;
function _getStarGlossTex() {
  if (!_starGlossTex) _starGlossTex = _makeStarGlossTexture();
  return _starGlossTex;
}

export function createRainbowRoadTileMaterial() {
  return new THREE.MeshBasicMaterial({
    color: 0xffffff,
    map: _getStarGlossTex(),
    fog: false,
    transparent: true,
    opacity: 0.94,
    depthWrite: true,
    toneMapped: false,
  });
}

/** Map lane index → rainbow color across track WIDTH (red left → violet right). */
export function rainbowLaneColor(lane, lanes, out = new THREE.Color()) {
  if (lanes <= 1) return out.copy(RAINBOW[0]);
  // Discrete bands — each lane snaps to a palette slot for crisp MK stripes
  const idx = Math.round((lane / (lanes - 1)) * (RAINBOW.length - 1));
  return out.copy(RAINBOW[idx]);
}

export const RAINBOW_ROAD_TILE_SIZE = 1.05;

/** Cheap neon edge rails — one InstancedMesh per side, sampled every N edge points. */
function buildInstancedRailStrips(edgePts, stepInterval, tileSize, trackGroup, hueOffset = 0) {
  const railPts = [];
  for (let i = 0; i < edgePts.length; i += stepInterval) {
    if (edgePts[i]) railPts.push(edgePts[i]);
  }
  const count = railPts.length;
  if (count === 0) return null;

  const geo = new THREE.BoxGeometry(0.24, 0.32, tileSize * 1.02);
  const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false });
  const mesh = new THREE.InstancedMesh(geo, mat, count);
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  mesh.frustumCulled = false;

  const _col = new THREE.Color();
  const _tan = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    const pos = railPts[i];
    if (!pos) continue;
    const prev = railPts[Math.max(0, i - 1)];
    const next = railPts[Math.min(count - 1, i + 1)];
    _tan.subVectors(next, prev);
    if (_tan.lengthSq() < 0.0001) _tan.set(0, 0, 1);
    else _tan.normalize();

    dummy.position.copy(pos);
    dummy.lookAt(pos.x + _tan.x, pos.y + _tan.y, pos.z + _tan.z);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);

    _col.copy(rainbowAt(i + hueOffset));
    mesh.setColorAt(i, _col);
  }
  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  trackGroup.add(mesh);
  return mesh;
}
// Outputs colour values > 1.0 in linear space so UnrealBloomPass picks them up.
function makeNeonTubeMat(hueOffset = 0) {
  return new THREE.ShaderMaterial({
    uniforms: { time: { value: 0 }, hueOff: { value: hueOffset } },
    vertexShader: `
      varying float vU;
      void main() {
        vU = uv.x;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float hueOff;
      varying float vU;
      vec3 hue2rgb(float h) {
        h = mod(h, 1.0);
        vec3 c = abs(mod(h * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0;
        return clamp(c, 0.0, 1.0);
      }
      void main() {
        float h = mod(vU * 1.5 + hueOff + time * 0.12, 1.0);
        vec3 col = hue2rgb(h);
        // 2.2× puts tubes clearly above the bloom threshold without
        // nuking the whole scene with white light.
        gl_FragColor = vec4(col * 1.55, 1.0);
      }
    `,
    depthWrite: true,
  });
}

let _candyCaneTex = null;
function _makeCandyCaneTex() {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 256;
  const ctx = c.getContext('2d');
  const stripeH = 16;
  for (let y = 0; y < c.height; y += stripeH) {
    ctx.fillStyle = Math.floor(y / stripeH) % 2 === 0 ? '#ff2255' : '#ffffff';
    ctx.fillRect(0, y, c.width, stripeH);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 3);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
function _getCandyCaneTex() {
  if (!_candyCaneTex) _candyCaneTex = _makeCandyCaneTex();
  return _candyCaneTex;
}

function makeSolidNeonMat(color) {
  return new THREE.MeshBasicMaterial({
    color,
    fog: false,
    toneMapped: false,
  });
}

function makeGoldPostMat() {
  return new THREE.MeshStandardMaterial({
    color: 0xffb020,
    emissive: 0xff8800,
    emissiveIntensity: 0.3,
    metalness: 0.5,
    roughness: 0.3,
    fog: false,
  });
}

function makeGoldStarCap() {
  const shape = new THREE.Shape();
  const pts = 5;
  for (let i = 0; i < pts * 2; i++) {
    const r = i % 2 === 0 ? 0.32 : 0.13;
    const a = (i / (pts * 2)) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: false });
  return new THREE.Mesh(geo, makeGoldPostMat());
}

function tubeCrossesCenterline(a, b, c0, c1, halfWidth) {
  const dx = b.x - a.x;
  const dz = b.z - a.z;
  const len2 = dx * dx + dz * dz;
  if (len2 < 0.01) return false;
  const mx = (c0.x + c1.x) * 0.5;
  const mz = (c0.z + c1.z) * 0.5;
  const t = Math.max(0, Math.min(1, ((mx - a.x) * dx + (mz - a.z) * dz) / len2));
  const px = a.x + t * dx;
  const pz = a.z + t * dz;
  return Math.hypot(px - mx, pz - mz) < halfWidth * 0.88;
}

function inGuardrailSkipZone(p, zone) {
  if (!zone) return false;
  return p.x >= zone.minX && p.x <= zone.maxX && p.z >= zone.minZ && p.z <= zone.maxZ;
}

/** Gold star fence post geometry (5-point star + pole). */
function _makeStarPostGeometry() {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 0.55 : 0.22;
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const starGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.14, bevelEnabled: false });
  return starGeo;
}

const _goldStarMat = () => new THREE.MeshBasicMaterial({
  color: 0xffd700,
  fog: false,
  toneMapped: false,
});

/** Instanced gold star posts every `spacingM` meters along both rail edges. */
function buildStarFencePosts(curve, trackGroup, {
  halfWidth, use3D, spacingM = 3.0, guardrailSkipZone = null,
}) {
  const curveLen = curve.getLength();
  const count = Math.max(2, Math.floor(curveLen / spacingM));
  const starGeo = _makeStarPostGeometry();
  const starMat = _goldStarMat();
  const poleGeo = new THREE.CylinderGeometry(0.14, 0.16, 2.1, 10);
  const poleMat = new THREE.MeshBasicMaterial({
    map: _getCandyCaneTex(),
    fog: false,
    toneMapped: false,
  });
  const edgeOffset = halfWidth + 0.55;
  const railGroup = new THREE.Group();
  railGroup.name = 'star-fence-posts';

  const leftStars = new THREE.InstancedMesh(starGeo, starMat, count);
  const rightStars = new THREE.InstancedMesh(starGeo, starMat, count);
  leftStars.frustumCulled = false;
  rightStars.frustumCulled = false;

  const _yAxis = new THREE.Vector3(0, 1, 0);
  const _dir = new THREE.Vector3();
  const _quat = new THREE.Quaternion();
  let li = 0;
  let ri = 0;
  let prevN = null;
  let prevEdge = null;

  for (let i = 0; i <= count; i++) {
    const dist = (i / count) * curveLen;
    const t = curve.getUtoTmapping(dist, curveLen);
    const frame = sampleTrackFrame(curve, t);
    const { p, tan } = frame;
    const n = stabilizeRailNormal(frame.n, prevN, p, edgeOffset, prevEdge);
    prevN = n;
    prevEdge = p.clone().addScaledVector(n, edgeOffset);
    if (inGuardrailSkipZone(p, guardrailSkipZone)) continue;

    const surfaceY = (use3D ? p.y : 0) + 0.2;
    for (const [side, mesh, idxRef] of [[-1, leftStars, 'l'], [1, rightStars, 'r']]) {
      const edge = p.clone().addScaledVector(n, side * edgeOffset);
      edge.y = surfaceY + 2.35;
      dummy.position.copy(edge);
      dummy.lookAt(edge.x + tan.x, edge.y, edge.z + tan.z);
      dummy.rotation.x = -Math.PI / 2;
      dummy.scale.set(2.2, 2.2, 2.2);
      dummy.updateMatrix();
      if (side === -1) leftStars.setMatrixAt(li++, dummy.matrix);
      else rightStars.setMatrixAt(ri++, dummy.matrix);

      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(edge.x, surfaceY + 1.0, edge.z);
      railGroup.add(pole);
    }
  }
  leftStars.count = li;
  rightStars.count = ri;
  leftStars.instanceMatrix.needsUpdate = true;
  rightStars.instanceMatrix.needsUpdate = true;
  railGroup.add(leftStars, rightStars);

  // 3-tier neon cables between posts
  const tubeMats = [
    createNeonCableMaterial(NEON_RAIL_COLORS.top),
    createNeonCableMaterial(NEON_RAIL_COLORS.mid),
    createNeonCableMaterial(NEON_RAIL_COLORS.bot),
  ];
  const tubeHeights = [1.15, 0.85, 0.55];
  prevN = null;
  prevEdge = null;

  for (let i = 0; i < count; i++) {
    const d0 = (i / count) * curveLen;
    const d1 = ((i + 1) / count) * curveLen;
    const t0 = curve.getUtoTmapping(d0, curveLen);
    const t1 = curve.getUtoTmapping(d1, curveLen);
    const f0 = sampleTrackFrame(curve, t0);
    const f1 = sampleTrackFrame(curve, t1);
    const n0 = stabilizeRailNormal(f0.n, prevN, f0.p, edgeOffset, prevEdge);
    prevN = n0;
    prevEdge = f0.p.clone().addScaledVector(n0, edgeOffset);
    if (inGuardrailSkipZone(f0.p, guardrailSkipZone) || inGuardrailSkipZone(f1.p, guardrailSkipZone)) continue;

    const sy0 = (use3D ? f0.p.y : 0) + 0.2;
    const sy1 = (use3D ? f1.p.y : 0) + 0.2;

    for (const side of [-1, 1]) {
      const e0 = f0.p.clone().addScaledVector(n0, side * edgeOffset);
      const n1 = stabilizeRailNormal(f1.n, prevN, f1.p, edgeOffset, prevEdge);
      const e1 = f1.p.clone().addScaledVector(n1, side * edgeOffset);

      tubeHeights.forEach((h, ti) => {
        const a = e0.clone(); a.y = sy0 + h;
        const b = e1.clone(); b.y = sy1 + h;
        _dir.subVectors(b, a);
        const len = _dir.length();
        if (len < 0.05 || tubeCrossesCenterline(a, b, f0.p, f1.p, halfWidth)) return;
        _dir.normalize();
        const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, len, 8), tubeMats[ti]);
        seg.position.copy(a).addScaledVector(_dir, len * 0.5);
        _quat.setFromUnitVectors(_yAxis, _dir);
        seg.quaternion.copy(_quat);
        railGroup.add(seg);
      });
    }
  }

  // Hollow gold stars on every 2nd post
  for (let i = 0; i <= count; i += 2) {
    const dist = (i / count) * curveLen;
    const t = curve.getUtoTmapping(dist, curveLen);
    const frame = sampleTrackFrame(curve, t);
    const n = stabilizeRailNormal(frame.n, prevN, frame.p, edgeOffset, prevEdge);
    if (inGuardrailSkipZone(frame.p, guardrailSkipZone)) continue;
    const surfaceY = (use3D ? frame.p.y : 0) + 0.2;
    for (const side of [-1, 1]) {
      const edge = frame.p.clone().addScaledVector(n, side * (edgeOffset + 0.45));
      const star = makeHollowGoldStar();
      star.position.set(edge.x, surfaceY + 1.05, edge.z);
      star.rotation.y = Math.atan2(frame.tan.x, frame.tan.z);
      star.rotation.x = -Math.PI / 2;
      railGroup.add(star);
    }
  }

  trackGroup.add(railGroup);
  return railGroup;
}

/** Place instanced tile with Y-axis heading only — no roll/twist on 3D splines. */
function _setTileMatrix(pos, headingY) {
  dummy.position.copy(pos);
  dummy.rotation.set(0, headingY, 0);
  dummy.scale.set(1, 1, 1);
  dummy.updateMatrix();
}

/** Straight guardrails for the flat launch — axis-aligned posts + neon cables. */
function buildFlatLaunchGuardrails(trackGroup, {
  halfWidth, x = 0, y = 48, zHigh = 77, zLow = 22, use3D = true, spacingM = 3.0,
}) {
  const railGroup = new THREE.Group();
  railGroup.name = 'flat-launch-guardrails';
  const edgeOffset = halfWidth + 0.55;
  const surfaceY = (use3D ? y : 0) + 0.2;
  const starGeo = _makeStarPostGeometry();
  const starMat = _goldStarMat();
  const poleGeo = new THREE.CylinderGeometry(0.14, 0.16, 2.1, 10);
  const poleMat = new THREE.MeshBasicMaterial({ map: _getCandyCaneTex(), fog: false, toneMapped: false });
  const tubeMats = [
    createNeonCableMaterial(NEON_RAIL_COLORS.top),
    createNeonCableMaterial(NEON_RAIL_COLORS.mid),
    createNeonCableMaterial(NEON_RAIL_COLORS.bot),
  ];
  const tubeHeights = [1.15, 0.85, 0.55];
  const _yAxis = new THREE.Vector3(0, 1, 0);
  const _dir = new THREE.Vector3();
  const _quat = new THREE.Quaternion();

  const posts = [];
  for (let z = zHigh; z >= zLow - 0.01; z -= spacingM) posts.push(z);

  for (const z of posts) {
    for (const side of [-1, 1]) {
      const px = x + side * edgeOffset;
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(px, surfaceY + 1.0, z);
      railGroup.add(pole);

      const star = new THREE.Mesh(starGeo, starMat);
      star.position.set(px, surfaceY + 2.35, z);
      star.rotation.set(-Math.PI / 2, Math.PI, 0);
      star.scale.set(2.2, 2.2, 2.2);
      railGroup.add(star);
    }
  }

  for (let i = 0; i < posts.length - 1; i++) {
    const z0 = posts[i];
    const z1 = posts[i + 1];
    for (const side of [-1, 1]) {
      const px = x + side * edgeOffset;
      tubeHeights.forEach((h, ti) => {
        const a = new THREE.Vector3(px, surfaceY + h, z0);
        const b = new THREE.Vector3(px, surfaceY + h, z1);
        _dir.subVectors(b, a);
        const len = _dir.length();
        if (len < 0.05) return;
        _dir.normalize();
        const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, len, 8), tubeMats[ti]);
        seg.position.copy(a).addScaledVector(_dir, len * 0.5);
        _quat.setFromUnitVectors(_yAxis, _dir);
        seg.quaternion.copy(_quat);
        railGroup.add(seg);
      });
    }
  }

  trackGroup.add(railGroup);
  return railGroup;
}

/** Perfectly flat MK launch strip — axis-aligned tiles, no spline twist. */
export function buildFlatRainbowLaunchStrip(group, {
  halfWidth = 3.75,
  tileSize = RAINBOW_ROAD_TILE_SIZE,
  lanes = 7,
  x = 0,
  y = 48,
  zHigh = 77,
  zLow = 22,
  use3D = true,
} = {}) {
  const trackGroup = new THREE.Group();
  trackGroup.name = 'rainbow-flat-launch';
  group.add(trackGroup);

  const effLanes = Math.max(7, Math.round(lanes));
  const lanePitch = (halfWidth * 2) / effLanes;
  const step = tileSize * 0.82;
  const yTile = (use3D ? y : 0) + 0.34;
  const tileGeo = new THREE.BoxGeometry(lanePitch * 0.98, 0.28, tileSize * 1.02);
  const tileMat = createRainbowRoadTileMaterial();

  const rows = [];
  for (let z = zHigh; z >= zLow - 0.01; z -= step) rows.push(z);

  const count = rows.length * effLanes;
  const tiles = new THREE.InstancedMesh(tileGeo, tileMat, count);
  tiles.frustumCulled = false;
  let idx = 0;
  const _col = new THREE.Color();
  const heading = Math.PI; // faces −Z (launch direction)

  rows.forEach((z, ri) => {
    for (let lane = 0; lane < effLanes; lane++) {
      const laneOff = (lane / (effLanes - 1) - 0.5) * halfWidth * 2;
      _setTileMatrix(new THREE.Vector3(x + laneOff, yTile, z), heading);
      tiles.setMatrixAt(idx, dummy.matrix);
      rainbowLaneColor(lane, effLanes, _col);
      tiles.setColorAt(idx, _col);
      idx++;
    }
  });
  tiles.count = idx;
  tiles.instanceMatrix.needsUpdate = true;
  if (tiles.instanceColor) tiles.instanceColor.needsUpdate = true;
  trackGroup.add(tiles);

  // Glass under-layer for launch straight
  const launchLen = zHigh - zLow;
  const glassGeo = new THREE.PlaneGeometry(halfWidth * 2, launchLen, 1, 1);
  const glassMat = createRainbowGlassTrackMaterial();
  const glass = new THREE.Mesh(glassGeo, glassMat);
  glass.rotation.x = -Math.PI / 2;
  glass.rotation.z = 0;
  glass.position.set(x, yTile - 0.12, (zHigh + zLow) * 0.5);
  glass.renderOrder = 4;
  trackGroup.add(glass);
  tiles.renderOrder = 5;

  buildFlatLaunchGuardrails(trackGroup, { halfWidth, x, y, zHigh, zLow, use3D });

  return { group: trackGroup, tiles, updateTime: (t) => { glassMat.uniforms.time.value = t; } };
}

/** Simple straight rainbow road — axis-aligned tile rows + start grid. */
export function buildStraightRainbowTileTrack(group, {
  halfWidth = 3.75,
  tileSize = 1.15,
  lanes = 5,
  zStart = 78,
  zEnd = -100,
  y = 40,
  use3D = true,
} = {}) {
  const trackGroup = new THREE.Group();
  trackGroup.name = 'rainbow-straight-track';
  group.add(trackGroup);

  const step = tileSize * 0.88;
  const rows = [];
  for (let z = zStart; z >= zEnd - 0.01; z -= step) rows.push(z);

  const tileGeo = new THREE.BoxGeometry(tileSize * 1.04, 0.36, tileSize * 1.04);
  const tileMat = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false });
  const count = rows.length * lanes;
  const tiles = new THREE.InstancedMesh(tileGeo, tileMat, count);
  tiles.castShadow = false;
  tiles.receiveShadow = false;
  tiles.frustumCulled = false;

  const yTile = (use3D ? y : 0) + 0.2;
  const _look = new THREE.Vector3();
  const _col = new THREE.Color();
  let idx = 0;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, minZ = Infinity, maxZ = -Infinity;

  rows.forEach((z, ri) => {
    for (let lane = 0; lane < lanes; lane++) {
      const laneOff = (lane / (lanes - 1) - 0.5) * halfWidth * 2;
      dummy.position.set(laneOff, yTile, z);
      _setTileMatrix(new THREE.Vector3(laneOff, yTile, z), Math.PI);
      tiles.setMatrixAt(idx, dummy.matrix);
      _col.copy(rainbowAt(Math.floor(z * 1.1 + laneOff * 0.35) + lane));
      tiles.setColorAt(idx, _col);
      idx++;
      if (laneOff < minX) minX = laneOff; if (laneOff > maxX) maxX = laneOff;
      if (yTile < minY) minY = yTile; if (yTile > maxY) maxY = yTile;
      if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
    }
  });

  tiles.count = idx;
  tiles.instanceMatrix.needsUpdate = true;
  if (tiles.instanceColor) tiles.instanceColor.needsUpdate = true;
  const cx = (minX + maxX) * 0.5;
  const cy = (minY + maxY) * 0.5;
  const cz = (minZ + maxZ) * 0.5;
  const radius = Math.hypot(maxX - minX, maxY - minY, maxZ - minZ) * 0.6 + 40;
  tiles.boundingSphere = new THREE.Sphere(new THREE.Vector3(cx, cy, cz), radius);
  trackGroup.add(tiles);

  return { group: trackGroup, tiles, updateTime: () => {} };
}

export function buildRainbowTileTrack(curve, group, {
  halfWidth = 4,
  tileSize = RAINBOW_ROAD_TILE_SIZE,
  use3D = true,
  lanes = 7,
  trackLod = 1.0,
  guardrailSkipZone = null,
  flatLaunch = null,
} = {}) {
  const lod = Math.max(0.55, Math.min(1, trackLod));
  const trackGroup = new THREE.Group();
  trackGroup.name = 'rainbow-tile-track';
  group.add(trackGroup);

  // Flat MK launch straight (no spline twist at start grid)
  let flatLaunchUpdate = () => {};
  if (flatLaunch) {
    const flat = buildFlatRainbowLaunchStrip(trackGroup, {
      halfWidth,
      tileSize,
      lanes,
      use3D,
      x: flatLaunch.x ?? 0,
      y: flatLaunch.y ?? 48,
      zHigh: flatLaunch.zHigh ?? 77,
      zLow: flatLaunch.zLow ?? 22,
    });
    flatLaunchUpdate = flat.updateTime;
  }

  const curveLen = curve.getLength();
  const segments = Math.max(300, Math.floor((curveLen / tileSize) * lod));
  const effLanes = Math.max(7, Math.round(lanes));
  const steps = Math.max(120, Math.floor((curveLen / (tileSize * 0.72)) * lod));

  const ribbonSkip = flatLaunch ? {
    x: flatLaunch.x ?? 0,
    zLow: (flatLaunch.zLow ?? 22) - 1,
    zHigh: (flatLaunch.zHigh ?? 77) + 1,
    halfWidth,
  } : null;

  // Glass ribbon for curved sections only — flat launch uses its own axis-aligned glass plane
  const glass = buildRainbowGlassRibbon(curve, {
    halfWidth,
    segments,
    use3D,
    tileRepeatAlong: Math.max(12, Math.floor(curveLen / tileSize)),
    skipZone: ribbonSkip,
  });
  if (!flatLaunch) glass.mesh.position.y = -0.06;
  glass.mesh.renderOrder = 2;
  trackGroup.add(glass.mesh);

  // 3D rainbow tiles on curved sections only (skip flat launch zone)
  const lanePitch = (halfWidth * 2) / effLanes;
  const tileGeo = new THREE.BoxGeometry(lanePitch * 0.98, 0.28, tileSize * 1.02);
  const tileMat = createRainbowRoadTileMaterial();
  const count = (steps + 1) * effLanes;
  const tiles = new THREE.InstancedMesh(tileGeo, tileMat, count);
  tiles.frustumCulled = false;
  let idx = 0;
  const _col = new THREE.Color();
  let prevN = null;
  const launchZMin = flatLaunch ? (flatLaunch.zLow ?? 22) - 0.5 : -Infinity;
  const launchZMax = flatLaunch ? (flatLaunch.zHigh ?? 77) + 0.5 : Infinity;
  const launchX = flatLaunch?.x ?? 0;

  for (let s = 0; s <= steps; s++) {
    const frame = sampleTrackFrame(curve, s / steps);
    const { p, tan } = frame;
    // Skip samples inside the flat launch corridor
    if (flatLaunch && Math.abs(p.x - launchX) < halfWidth + 1
        && p.z >= launchZMin && p.z <= launchZMax) {
      continue;
    }
    const n = stabilizeNormal(frame.n, prevN);
    prevN = n;
    const y = (use3D ? p.y : 0) + 0.34;
    for (let lane = 0; lane < effLanes; lane++) {
      const laneOff = (lane / (effLanes - 1) - 0.5) * halfWidth * 2;
      const pos = p.clone().addScaledVector(n, laneOff);
      pos.y = y;
      rainbowLaneColor(lane, effLanes, _col);
      _setTileMatrix(pos, Math.atan2(tan.x, tan.z));
      tiles.setMatrixAt(idx, dummy.matrix);
      tiles.setColorAt(idx, _col);
      idx++;
    }
  }
  tiles.count = idx;
  tiles.instanceMatrix.needsUpdate = true;
  if (tiles.instanceColor) tiles.instanceColor.needsUpdate = true;
  trackGroup.add(tiles);

  buildStarFencePosts(curve, trackGroup, {
    halfWidth,
    use3D,
    spacingM: 3.0,
    guardrailSkipZone,
  });

  return {
    group: trackGroup,
    tiles,
    updateTime: (t) => {
      glass.updateTime(t);
      flatLaunchUpdate(t);
    },
  };
}

/** Reusable helper — builds the instanced tile grid + neon tube edges + under-glow. */
function buildTileTrack(curve, group, {
  trackName = 'tile-track',
  tileColors,
  tubeHue0 = 0.0,
  tubeHue1 = 0.5,
  tubeColor0 = null,
  tubeColor1 = null,
  glowColor = 0x8844ff,
  halfWidth = 3.5,
  tileSize = 1.15,
  use3D = false,
  lanes = 5,
  tileHeight = 0.36,
  glowOpacity = 0.28,
  useMeshBasic = true,
} = {}) {
  const trackGroup = new THREE.Group();
  trackGroup.name = trackName;
  group.add(trackGroup);

  const curveLen = curve.getLength();
  const steps = Math.max(100, Math.floor(curveLen / (tileSize * 0.88)));
  const count = steps * lanes;

  const tileGeo = new THREE.BoxGeometry(tileSize * 0.92, tileHeight, tileSize * 0.92);
  const tileMat = useMeshBasic
    ? new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false })
    : new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.32, metalness: 0.08, fog: false });
  const tiles = new THREE.InstancedMesh(tileGeo, tileMat, count);
  tiles.castShadow = false;
  tiles.receiveShadow = false;
  tiles.frustumCulled = false;

  const leftEdgePts = [];
  const rightEdgePts = [];
  let idx = 0;
  const _col = new THREE.Color();

  for (let s = 0; s <= steps; s++) {
    const t = s / steps;
    const frame = sampleTrackFrame(curve, t);
    const { p, n, tan } = frame;
    const y = (use3D ? p.y : 0) + 0.2;
    for (let lane = 0; lane < lanes; lane++) {
      const laneOff = (lane / (lanes - 1) - 0.5) * halfWidth * 2;
      const pos = p.clone().addScaledVector(n, laneOff);
      pos.y = y;
      dummy.position.copy(pos);
      dummy.lookAt(pos.clone().add(tan));
      dummy.updateMatrix();
      tiles.setMatrixAt(idx, dummy.matrix);
      _col.copy(tileColors[(s + lane) % tileColors.length]);
      tiles.setColorAt(idx, _col);
      idx++;
    }
    const edgeY = (use3D ? p.y : 0) + 0.55;
    leftEdgePts.push(new THREE.Vector3(p.x + n.x * (halfWidth + 0.25), edgeY, p.z + n.z * (halfWidth + 0.25)));
    rightEdgePts.push(new THREE.Vector3(p.x - n.x * (halfWidth + 0.25), edgeY, p.z - n.z * (halfWidth + 0.25)));
  }
  tiles.instanceMatrix.needsUpdate = true;
  if (tiles.instanceColor) tiles.instanceColor.needsUpdate = true;
  trackGroup.add(tiles);

  // Neon edge tubes — same HDR shader as Rainbow Road
  const tubeSeg = Math.min(200, steps);
  const leftCurve3  = new THREE.CatmullRomCurve3(leftEdgePts,  true, 'catmullrom', 0.3);
  const rightCurve3 = new THREE.CatmullRomCurve3(rightEdgePts, true, 'catmullrom', 0.3);
  let leftMat, rightMat;
  if (tubeColor0) {
    // Solid-colour override (volcano lava, etc.)
    leftMat  = makeNeonTubeMat(tubeHue0);
    rightMat = makeNeonTubeMat(tubeHue1);
  } else {
    leftMat  = makeNeonTubeMat(tubeHue0);
    rightMat = makeNeonTubeMat(tubeHue1);
  }
  const leftTube  = new THREE.Mesh(new THREE.TubeGeometry(leftCurve3,  tubeSeg, 0.28, 8, true), leftMat);
  const rightTube = new THREE.Mesh(new THREE.TubeGeometry(rightCurve3, tubeSeg, 0.28, 8, true), rightMat);
  leftTube.frustumCulled = false;
  rightTube.frustumCulled = false;
  trackGroup.add(leftTube, rightTube);

  // Additive under-glow
  const railSteps = Math.floor(steps / 2);
  const glowGeo = new THREE.BoxGeometry(halfWidth * 2.4, 0.06, tileSize);
  const glowMat = new THREE.MeshBasicMaterial({
    color: glowColor, transparent: true, opacity: glowOpacity,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const glows = new THREE.InstancedMesh(glowGeo, glowMat, railSteps);
  glows.frustumCulled = false;
  let gi = 0;
  for (let s = 0; s <= steps; s += 2) {
    const frame = sampleTrackFrame(curve, s / steps);
    const { p, tan } = frame;
    const pos = p.clone(); pos.y = (use3D ? p.y : 0) + 0.04;
    dummy.position.copy(pos); dummy.lookAt(pos.clone().add(tan)); dummy.updateMatrix();
    glows.setMatrixAt(gi++, dummy.matrix);
  }
  glows.instanceMatrix.needsUpdate = true;
  trackGroup.add(glows);

  return {
    group: trackGroup,
    tiles,
    updateTime: (time) => {
      leftMat.uniforms.time.value  = time;
      rightMat.uniforms.time.value = time;
    },
  };
}

/** Candy Kingdom — glowing pastel checkered tile grid + HDR neon candy rails. */
export function buildCandyTileTrack(curve, group, {
  halfWidth = 3.5, tileSize = 1.1, use3D = false, lanes = 5,
} = {}) {
  return buildTileTrack(curve, group, {
    trackName: 'candy-tile-track',
    tileColors: [
      new THREE.Color(0xff88aa),
      new THREE.Color(0xffeedd),
      new THREE.Color(0xffcc88),
      new THREE.Color(0xffaacc),
      new THREE.Color(0xffffff),
      new THREE.Color(0xcc88ff),
    ],
    tubeHue0: 0.88,   // hot pink
    tubeHue1: 0.72,   // purple-pink
    glowColor: 0xff66cc,
    halfWidth, tileSize, use3D, lanes,
    glowOpacity: 0.30,
  });
}

/** Dragon Skyway — deep blue / teal / gold glowing tile track + cyan-to-purple neon tubes. */
export function buildDragonTileTrack(curve, group, {
  halfWidth = 3.5, tileSize = 1.15, use3D = true, lanes = 5,
} = {}) {
  return buildTileTrack(curve, group, {
    trackName: 'dragon-tile-track',
    tileColors: [
      new THREE.Color(0x0044ff),
      new THREE.Color(0x0099ee),
      new THREE.Color(0x00ddcc),
      new THREE.Color(0x4400ff),
      new THREE.Color(0x8800ff),
      new THREE.Color(0xffcc00),
      new THREE.Color(0x0066dd),
    ],
    tubeHue0: 0.55,   // cyan-blue
    tubeHue1: 0.75,   // purple
    glowColor: 0x0088ff,
    halfWidth, tileSize, use3D, lanes,
    glowOpacity: 0.30,
  });
}

/** Volcano Drift — red / orange / yellow lava tile track + orange-white neon tubes. */
export function buildVolcanoTileTrack(curve, group, {
  halfWidth = 3.5, tileSize = 1.15, use3D = false, lanes = 5,
} = {}) {
  return buildTileTrack(curve, group, {
    trackName: 'volcano-tile-track',
    tileColors: [
      new THREE.Color(0xff2200),
      new THREE.Color(0xff6600),
      new THREE.Color(0xffaa00),
      new THREE.Color(0xffdd00),
      new THREE.Color(0xff4400),
      new THREE.Color(0xffffff),
      new THREE.Color(0xff8800),
    ],
    tubeHue0: 0.04,   // orange-red
    tubeHue1: 0.10,   // yellow-orange
    glowColor: 0xff4400,
    halfWidth, tileSize, use3D, lanes,
    glowOpacity: 0.35,
  });
}
