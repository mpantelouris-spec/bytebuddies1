/**
 * RacingTrackSystem.js — Spline tracks, ribbon meshes, checkpoints, barriers (RC1).
 */
import * as THREE from 'three';

const _up = new THREE.Vector3(0, 1, 0);
const _tmp = new THREE.Vector3();

/** Sample centerline: position, tangent, normal, rotation Y, track param t. */
export function sampleTrack(curve, t) {
  const p = curve.getPointAt(t);
  const tan = curve.getTangentAt(t).normalize();
  const rot = Math.atan2(tan.x, tan.z);
  const n = _tmp.set(-tan.z, 0, tan.x);
  return { p, tan, rot, n, t };
}

// Cache for precomputed track points — avoids 120 getPointAt() calls per frame
const _trackPointCache = new WeakMap();

function getTrackPointCache(curve, resolution = 200) {
  if (_trackPointCache.has(curve)) return _trackPointCache.get(curve);
  const pts = [];
  for (let i = 0; i <= resolution; i++) {
    const t = i / resolution;
    const p = curve.getPointAt(t);
    pts.push({ t, x: p.x, y: p.y, z: p.z });
  }
  _trackPointCache.set(curve, pts);
  return pts;
}

/**
 * Closest t on closed curve — OPTIMIZED.
 * Uses cached points for O(n) lookup without per-frame curve.getPointAt() calls.
 * Pass `hintT` (the previous frame's result) to search a narrow window for
 * frame-to-frame continuity; falls back to a full search on the first frame.
 */
export function closestTrackT(curve, x, z, samples = 60, hintT = null, hintWindow = 0.015, currentY = null) {
  const cache = getTrackPointCache(curve, 200);
  const cacheLen = cache.length;
  let bestT = 0;
  let bestD = Infinity;

  // Weight Y errors at 60 % of horizontal — enough to prefer the correct loop
  // on a spiral while not over-penalising gentle elevation changes mid-turn.
  const yW = currentY != null ? 0.6 : 0;

  if (hintT != null) {
    // Narrow search around hint — only check ~30 cached points
    const hintIdx = Math.round(hintT * (cacheLen - 1));
    const windowSize = Math.ceil(hintWindow * cacheLen);
    const startIdx = Math.max(0, hintIdx - windowSize);
    const endIdx = Math.min(cacheLen - 1, hintIdx + windowSize);
    
    for (let i = startIdx; i <= endIdx; i++) {
      const pt = cache[i];
      const dy = currentY != null ? (pt.y - currentY) : 0;
      const d = (pt.x - x) ** 2 + (pt.z - z) ** 2 + dy * dy * yW;
      if (d < bestD) { bestD = d; bestT = pt.t; }
    }
    // Also check wrap-around for closed curves
    if (hintT < hintWindow) {
      for (let i = cacheLen - windowSize; i < cacheLen; i++) {
        const pt = cache[i];
        const dy = currentY != null ? (pt.y - currentY) : 0;
        const d = (pt.x - x) ** 2 + (pt.z - z) ** 2 + dy * dy * yW;
        if (d < bestD) { bestD = d; bestT = pt.t; }
      }
    } else if (hintT > 1 - hintWindow) {
      for (let i = 0; i < windowSize; i++) {
        const pt = cache[i];
        const dy = currentY != null ? (pt.y - currentY) : 0;
        const d = (pt.x - x) ** 2 + (pt.z - z) ** 2 + dy * dy * yW;
        if (d < bestD) { bestD = d; bestT = pt.t; }
      }
    }
    const bestPt = cache[Math.round(bestT * (cacheLen - 1))];
    return { t: bestT, dist: Math.sqrt((bestPt.x - x) ** 2 + (bestPt.z - z) ** 2) };
  }
  
  // Full search — still uses cache, not getPointAt()
  for (let i = 0; i < cacheLen; i++) {
    const pt = cache[i];
    const dy = currentY != null ? (pt.y - currentY) : 0;
    const d = (pt.x - x) ** 2 + (pt.z - z) ** 2 + dy * dy * yW;
    if (d < bestD) { bestD = d; bestT = pt.t; }
  }
  const bestPt = cache[Math.round(bestT * (cacheLen - 1))];
  return { t: bestT, dist: Math.sqrt((bestPt.x - x) ** 2 + (bestPt.z - z) ** 2) };
}

/** Animated cosmic highway — semi-transparent, glowing, rainbow cycling. */
export function createRainbowTrackMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      emissiveMul: { value: 1.65 },
      opacity: { value: 0.82 },
    },
    vertexShader: `
      attribute float trackPosition;
      varying float vTrackPos;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      void main() {
        vTrackPos = trackPosition;
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vViewDir = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float emissiveMul;
      uniform float opacity;
      varying float vTrackPos;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      vec3 hsv2rgb(float h, float s, float v) {
        vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
        vec3 p = abs(fract(vec3(h) + K.xyz) * 6.0 - K.www);
        return v * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), s);
      }
      void main() {
        float hue = fract(vTrackPos * 3.0 - time * 0.14);
        vec3 rainbow = hsv2rgb(hue, 0.95, 1.0);
        float centerLine = smoothstep(0.48, 0.50, vUv.x) * smoothstep(0.52, 0.50, vUv.x);
        float edgeL = smoothstep(0.05, 0.0, vUv.x);
        float edgeR = smoothstep(0.95, 1.0, vUv.x);
        float edgeGlow = max(edgeL, edgeR);
        float fresnel = pow(1.0 - max(dot(normalize(vViewDir), vNormal), 0.0), 2.2);
        vec3 col = rainbow * (0.65 + edgeGlow * 0.55 + fresnel * 0.75);
        col = mix(col, vec3(1.0), centerLine * 0.75);
        col *= emissiveMul;
        float alpha = opacity * (0.55 + edgeGlow * 0.35 + fresnel * 0.25);
        gl_FragColor = vec4(col, alpha);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
}

/** Build 3D track ribbon following spline elevation and banking. */
export function buildTrackRibbon3D(curve, {
  halfWidth = 2.5,
  segments = 420,
  material = null,
  trackRepeat = 18,
} = {}) {
  const pos = [];
  const idx = [];
  const uvs = [];
  const trackPos = [];
  const _up = new THREE.Vector3(0, 1, 0);
  const _tan = new THREE.Vector3();
  const _n = new THREE.Vector3();
  const _b = new THREE.Vector3();

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const p = curve.getPointAt(t);
    _tan.copy(curve.getTangentAt(t)).normalize();
    _n.crossVectors(_tan, _up);
    if (_n.lengthSq() < 0.001) _n.set(1, 0, 0);
    else _n.normalize();
    _b.crossVectors(_tan, _n).normalize();
    const l = p.clone().addScaledVector(_n, -halfWidth);
    const r = p.clone().addScaledVector(_n, halfWidth);
    pos.push(l.x, l.y, l.z, r.x, r.y, r.z);
    uvs.push(0, t * trackRepeat, 1, t * trackRepeat);
    trackPos.push(t, t);
    if (i < segments) {
      const b = i * 2;
      idx.push(b, b + 1, b + 2, b + 1, b + 3, b + 2);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setAttribute('trackPosition', new THREE.Float32BufferAttribute(trackPos, 1));
  geo.setIndex(idx);
  geo.computeVertexNormals();

  const mat = material || createRainbowTrackMaterial();
  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = 2;

  const updateTime = (t) => {
    if (mat.uniforms?.time) mat.uniforms.time.value = t;
  };

  return { mesh, geometry: geo, material: mat, updateTime };
}

/** Legacy flat ribbon (kept for simple ground tracks). */
export function buildTrackRibbon(curve, {
  halfWidth = 2.5,
  y = 0.55,
  segments = 320,
  material = null,
  trackRepeat = 14,
} = {}) {
  const pos = [];
  const idx = [];
  const uvs = [];
  const trackPos = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const { p, n } = sampleTrack(curve, t);
    const l = p.clone().addScaledVector(n, -halfWidth);
    const r = p.clone().addScaledVector(n, halfWidth);
    pos.push(l.x, y, l.z, r.x, y, r.z);
    uvs.push(0, t * trackRepeat, 1, t * trackRepeat);
    trackPos.push(t, t);
    if (i < segments) {
      const b = i * 2;
      idx.push(b, b + 1, b + 2, b + 1, b + 3, b + 2);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setAttribute('trackPosition', new THREE.Float32BufferAttribute(trackPos, 1));
  geo.setIndex(idx);
  geo.computeVertexNormals();

  const mat = material || new THREE.MeshStandardMaterial({ color: 0x444450, roughness: 0.65 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;

  const updateTime = (t) => {
    if (mat.uniforms?.time) mat.uniforms.time.value = t;
  };

  return { mesh, geometry: geo, material: mat, updateTime };
}

/** Additive glow halo ribbon around track edges (3D). */
export function buildTrackGlowHalo3D(curve, { halfWidth = 2.5, extra = 1.0, segments = 380, material = null } = {}) {
  const mat = material || createRainbowTrackMaterial();
  mat.transparent = true;
  if (mat.uniforms?.opacity) mat.uniforms.opacity.value = 0.35;
  mat.depthWrite = false;
  mat.blending = THREE.AdditiveBlending;
  return buildTrackRibbon3D(curve, {
    halfWidth: halfWidth + extra,
    segments,
    material: mat,
    trackRepeat: 18,
  });
}

/** Additive glow halo ribbon around track edges (flat). */
export function buildTrackGlowHalo(curve, { halfWidth = 2.5, extra = 0.75, y = 0.54, segments = 280, material = null } = {}) {
  const mat = material || createRainbowTrackMaterial();
  if (mat.transparent !== true) {
    mat.transparent = true;
    mat.opacity = 0.28;
    mat.depthWrite = false;
    mat.blending = THREE.AdditiveBlending;
  }
  return buildTrackRibbon(curve, {
    halfWidth: halfWidth + extra,
    y,
    segments,
    material: mat,
    trackRepeat: 14,
  });
}

/** Standard asphalt/dirt ribbon (non-shader). */
export function buildSurfaceRibbon(curve, halfWidth, y, color, segments = 280) {
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.72, metalness: 0.06 });
  return buildTrackRibbon(curve, { halfWidth, y, segments, material: mat, trackRepeat: 10 });
}

/** Low guardrail posts along both edges for a t-range. */
export function buildGuardrails(curve, group, { halfWidth, startT = 0, endT = 1, postEvery = 0.04, color = 0xcccccc }) {
  const mat = new THREE.MeshStandardMaterial({ color, metalness: 0.4, roughness: 0.5 });
  const railMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, metalness: 0.55, roughness: 0.35 });
  const steps = Math.ceil((endT - startT) / postEvery);
  for (let i = 0; i <= steps; i++) {
    const t = startT + (i / steps) * (endT - startT);
    const { p, n, rot } = sampleTrack(curve, t);
    for (const side of [-1, 1]) {
      const off = side * (halfWidth + 0.2);
      const pos = p.clone().addScaledVector(n, off);
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.55, 6), mat);
      post.position.set(pos.x, 0.55 + 0.28, pos.z);
      group.add(post);
    }
    if (i < steps) {
      const t1 = startT + ((i + 1) / steps) * (endT - startT);
      const a = sampleTrack(curve, t);
      const b = sampleTrack(curve, t1);
      for (const side of [-1, 1]) {
        const off = side * (halfWidth + 0.2);
        const p0 = a.p.clone().addScaledVector(a.n, off);
        const p1 = b.p.clone().addScaledVector(b.n, off);
        const dx = p1.x - p0.x;
        const dz = p1.z - p0.z;
        const len = Math.hypot(dx, dz) || 0.01;
        const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, len, 6), railMat);
        rail.position.set((p0.x + p1.x) / 2, 0.55 + 0.52, (p0.z + p1.z) / 2);
        rail.rotation.z = Math.PI / 2;
        rail.rotation.y = Math.atan2(dx, dz);
        group.add(rail);
      }
    }
  }
}

function _makeCandyCaneTexture() {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 256;
  const ctx = c.getContext('2d');
  const stripeH = 16;
  for (let y = 0; y < c.height; y += stripeH) {
    const idx = Math.floor(y / stripeH);
    ctx.fillStyle = idx % 2 === 0 ? '#ff2255' : '#ffffff';
    ctx.fillRect(0, y, c.width, stripeH);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 4);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function _makeByteBuddiesSignTexture() {
  const c = document.createElement('canvas');
  c.width = 800;
  c.height = 240;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);

  const pad = 10;
  const r = 28;
  const bgGrad = ctx.createLinearGradient(0, 0, c.width, 0);
  bgGrad.addColorStop(0, '#ff2244');
  bgGrad.addColorStop(0.17, '#ff8800');
  bgGrad.addColorStop(0.33, '#ffee00');
  bgGrad.addColorStop(0.5, '#22ff88');
  bgGrad.addColorStop(0.67, '#00ccff');
  bgGrad.addColorStop(0.83, '#4466ff');
  bgGrad.addColorStop(1, '#cc44ff');
  ctx.fillStyle = bgGrad;
  ctx.beginPath();
  ctx.moveTo(pad + r, pad);
  ctx.lineTo(c.width - pad - r, pad);
  ctx.quadraticCurveTo(c.width - pad, pad, c.width - pad, pad + r);
  ctx.lineTo(c.width - pad, c.height - pad - r);
  ctx.quadraticCurveTo(c.width - pad, c.height - pad, c.width - pad - r, c.height - pad);
  ctx.lineTo(pad + r, c.height - pad);
  ctx.quadraticCurveTo(pad, c.height - pad, pad, c.height - pad - r);
  ctx.lineTo(pad, pad + r);
  ctx.quadraticCurveTo(pad, pad, pad + r, pad);
  ctx.closePath();
  ctx.fill();
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#ffcc00';
  ctx.stroke();

  const letters = 'BYTEBUDDIES'.split('');
  const letterColors = [
    '#44eeff', '#55ccff', '#6688ff', '#aa66ff', '#ff55cc',
    '#ff6699', '#ff8866', '#ffaa44', '#ffcc33', '#88ff44', '#44ffcc',
  ];
  const startX = c.width * 0.05;
  const spacing = (c.width * 0.9) / (letters.length - 1);
  ctx.font = '900 72px Arial Black, Impact, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  letters.forEach((ch, i) => {
    const fill = letterColors[i] || '#ffffff';
    const x = startX + i * spacing;
    const y = c.height / 2 + 2;
    ctx.shadowColor = fill;
    ctx.shadowBlur = 24;
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#1a0a00';
    ctx.strokeText(ch, x, y);
    ctx.shadowBlur = 12;
    ctx.fillStyle = fill;
    ctx.fillText(ch, x, y);
  });
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function _makeMarioKartSignTexture() {
  const c = document.createElement('canvas');
  c.width = 800;
  c.height = 240;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);

  const pad = 10;
  const r = 28;
  // Rainbow gradient fill (MK sign background)
  const bgGrad = ctx.createLinearGradient(0, 0, c.width, 0);
  bgGrad.addColorStop(0, '#ff2244');
  bgGrad.addColorStop(0.17, '#ff8800');
  bgGrad.addColorStop(0.33, '#ffee00');
  bgGrad.addColorStop(0.5, '#22ff88');
  bgGrad.addColorStop(0.67, '#00ccff');
  bgGrad.addColorStop(0.83, '#4466ff');
  bgGrad.addColorStop(1, '#cc44ff');
  ctx.fillStyle = bgGrad;
  ctx.beginPath();
  ctx.moveTo(pad + r, pad);
  ctx.lineTo(c.width - pad - r, pad);
  ctx.quadraticCurveTo(c.width - pad, pad, c.width - pad, pad + r);
  ctx.lineTo(c.width - pad, c.height - pad - r);
  ctx.quadraticCurveTo(c.width - pad, c.height - pad, c.width - pad - r, c.height - pad);
  ctx.lineTo(pad + r, c.height - pad);
  ctx.quadraticCurveTo(pad, c.height - pad, pad, c.height - pad - r);
  ctx.lineTo(pad, pad + r);
  ctx.quadraticCurveTo(pad, pad, pad + r, pad);
  ctx.closePath();
  ctx.fill();
  // Gold border
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#ffcc00';
  ctx.stroke();

  const letters = 'MARIOKART'.split('');
  const letterColors = [
    '#44eeff', '#55ccff', '#6688ff', '#aa66ff',
    '#ff55cc', '#ff6699', '#ff8866', '#ffaa44', '#ffcc33',
  ];
  const startX = c.width * 0.09;
  const spacing = (c.width * 0.82) / (letters.length - 1);
  ctx.font = '900 96px Arial Black, Impact, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  letters.forEach((ch, i) => {
    const fill = letterColors[i] || '#ffffff';
    const x = startX + i * spacing;
    const y = c.height / 2 + 2;
    ctx.shadowColor = fill;
    ctx.shadowBlur = 28;
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#1a0a00';
    ctx.strokeText(ch, x, y);
    ctx.shadowBlur = 14;
    ctx.fillStyle = fill;
    ctx.fillText(ch, x, y);
  });
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function _makeRainbowStripeTexture() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 32;
  const ctx = c.getContext('2d');
  const colors = ['#ff2244', '#ff8800', '#ffee00', '#22ff88', '#00ccff', '#4466ff', '#cc44ff'];
  const w = c.width / colors.length;
  colors.forEach((col, i) => {
    ctx.fillStyle = col;
    ctx.fillRect(i * w, 0, w + 1, c.height);
  });
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function _makeFinishLineTexture() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 64;
  const ctx = c.getContext('2d');
  const cols = 16;
  const cellW = c.width / cols;
  for (let i = 0; i < cols; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#0a0a0a';
    ctx.fillRect(i * cellW, 0, cellW + 1, c.height);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function _neonTubeMat(color) {
  return new THREE.MeshBasicMaterial({ color, fog: false, toneMapped: false });
}

function _glowStarMesh(outerR, innerR, depth, color) {
  const mesh = _makeStarMesh(outerR, innerR, depth, color, 3.2);
  mesh.traverse((child) => {
    if (child.isMesh && child.material) {
      child.material = new THREE.MeshBasicMaterial({
        color, fog: false, transparent: true, opacity: 0.85,
      });
    }
  });
  return mesh;
}

/** Hollow gold star frame for start-zone guardrails (MK reference). */
function _makeHollowGoldStar(scale = 1) {
  const outer = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = (i % 2 === 0 ? 0.42 : 0.16) * scale;
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) outer.moveTo(x, y);
    else outer.lineTo(x, y);
  }
  outer.closePath();
  const inner = new THREE.Path();
  for (let i = 0; i < 10; i++) {
    const r = (i % 2 === 0 ? 0.28 : 0.1) * scale;
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) inner.moveTo(x, y);
    else inner.lineTo(x, y);
  }
  inner.closePath();
  outer.holes.push(inner);
  const geo = new THREE.ExtrudeGeometry(outer, { depth: 0.14 * scale, bevelEnabled: false });
  return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
    color: 0xffcc00, emissive: 0xffaa00, emissiveIntensity: 0.5,
    metalness: 0.45, roughness: 0.25, side: THREE.DoubleSide, fog: false,
  }));
}

function _makeStarMesh(outerR, innerR, depth, color, emissiveIntensity = 2.0) {
  const shape = new THREE.Shape();
  const pts = 5;
  for (let i = 0; i < pts * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = (i / (pts * 2)) * Math.PI * 2 - Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
  const mat = new THREE.MeshStandardMaterial({
    color, emissive: color, emissiveIntensity, metalness: 0.35, roughness: 0.25,
  });
  return new THREE.Mesh(geo, mat);
}

function _makeCheckerTexture(repeats = 8, rows = 4) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const ctx = c.getContext('2d');
  const cols = 8;
  const cellW = c.width / cols;
  const cellH = c.height / rows;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? '#ffffff' : '#0a0a0a';
      ctx.fillRect(x * cellW, y * cellH, cellW, cellH);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeats, 1);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Finite-diff frame — stable at closed-curve seam (t=0). */
function _sampleStartFrame(curve, t) {
  const eps = 0.004;
  const p = curve.getPointAt(t);
  const ahead = curve.getPointAt((t + eps) % 1);
  const tan = new THREE.Vector3(ahead.x - p.x, ahead.y - p.y, ahead.z - p.z);
  if (tan.lengthSq() < 1e-8) tan.set(0, 0, -1);
  else tan.normalize();
  const n = new THREE.Vector3().crossVectors(tan, _up);
  if (n.lengthSq() < 1e-6) n.set(1, 0, 0);
  else n.normalize();
  return { p, tan, n, rot: Math.atan2(tan.x, tan.z) };
}

/**
 * MK Rainbow Road start arch — gold portal + rainbow trim + stars (no sign).
 */
export function buildAxisStartGrid({
  x = 0,
  lineZ,
  y = 42,
  halfWidth,
  angle = Math.PI,
  use3D = true,
} = {}) {
  const g = new THREE.Group();
  g.name = 'racing-start-line';

  const rightX = Math.cos(angle);
  const rightZ = -Math.sin(angle);
  const trackWidth = halfWidth * 2;
  const yBase = (use3D ? y : 0) + 0.2;

  const archH = halfWidth * 2.15 + 1.2;
  const archRadius = halfWidth + 0.85;
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xffcc00,
    emissive: 0xff9900,
    emissiveIntensity: 0.12,
    metalness: 0.85,
    roughness: 0.15,
    fog: false,
  });
  const rainbowArchMat = new THREE.MeshStandardMaterial({
    map: _makeRainbowStripeTexture(),
    emissive: 0xffffff,
    emissiveIntensity: 0.15,
    emissiveMap: _makeRainbowStripeTexture(),
    metalness: 0.2,
    roughness: 0.22,
    fog: false,
  });

  const arch = new THREE.Mesh(
    new THREE.TorusGeometry(archRadius, 0.32, 12, 64, Math.PI),
    goldMat,
  );
  arch.position.set(x, yBase + archH - 0.1, lineZ);
  arch.rotation.y = angle;
  arch.rotation.z = Math.PI;
  g.add(arch);

  const rainbowTrim = new THREE.Mesh(
    new THREE.TorusGeometry(archRadius * 0.94, 0.14, 8, 48, Math.PI),
    rainbowArchMat,
  );
  rainbowTrim.position.copy(arch.position);
  rainbowTrim.rotation.copy(arch.rotation);
  rainbowTrim.renderOrder = 16;
  g.add(rainbowTrim);

  const checkerTex = _makeFinishLineTexture();
  const checker = new THREE.Mesh(
    new THREE.PlaneGeometry(trackWidth * 1.04, 0.55),
    new THREE.MeshBasicMaterial({
      map: checkerTex,
      fog: false,
      polygonOffset: true,
      polygonOffsetFactor: -6,
      polygonOffsetUnits: -6,
    }),
  );
  checker.rotation.x = -Math.PI / 2;
  checker.rotation.z = angle;
  checker.position.set(x, yBase + 0.38, lineZ);
  checker.renderOrder = 15;
  g.add(checker);

  const starSpecs = [
    { color: 0x44ff66, scale: 0.55, offset: -archRadius * 0.92 },
    { color: 0x44ccff, scale: 0.65, offset: -archRadius * 0.46 },
    { color: 0xff44cc, scale: 0.85, offset: 0 },
    { color: 0x44ccff, scale: 0.65, offset: archRadius * 0.46 },
    { color: 0x44ff66, scale: 0.55, offset: archRadius * 0.92 },
  ];
  starSpecs.forEach(({ color, scale, offset }) => {
    const star = _glowStarMesh(0.55 * scale, 0.22 * scale, 0.28, color);
    const sx = x + rightX * offset;
    const sz = lineZ + rightZ * offset;
    star.position.set(sx, yBase + archH + 0.6 * scale, sz);
    star.rotation.y = angle;
    star.rotation.x = -Math.PI / 2;
    g.add(star);
  });

  g.userData.startGridBounds = {
    minX: x - halfWidth - 1.8,
    maxX: x + halfWidth + 1.8,
    minZ: lineZ - 18,
    maxZ: lineZ + 14,
  };

  return { group: g, position: { x, y: yBase, z: lineZ }, rotation: angle };
}

/** Mario Kart–style start grid — 3D checker tiles + overhead arch. */
export function buildRacingStartLine(curve, finishT, halfWidth, use3D = false, {
  heading = null,
  position = null,
  spawnT = null,
} = {}) {
  const g = new THREE.Group();
  g.name = 'racing-start-line';

  const lineT = finishT;
  const frame = _sampleStartFrame(curve, lineT);
  const p = position
    ? new THREE.Vector3(position.x, position.y ?? frame.p.y, position.z)
    : frame.p.clone();
  const tan = frame.tan.clone();
  const n = frame.n.clone();
  if (heading != null) {
    tan.set(Math.sin(heading), 0, Math.cos(heading));
    n.set(Math.cos(heading), 0, -Math.sin(heading));
  }

  const trackWidth = halfWidth * 2;
  const tileSize = 0.92;
  const cols = Math.max(8, Math.round(trackWidth / tileSize));
  const checkerRowStart = -1;
  const checkerRowEnd = 2;
  const gridRowEnd = 6;
  const totalRows = gridRowEnd - checkerRowStart;
  const tileH = 0.42;
  const yBase = (use3D ? p.y : 0) + 0.2;

  const white = new THREE.Color(0xffffff);
  const black = new THREE.Color(0x0a0a0a);
  const slotA = new THREE.Color(0x2a2a38);
  const slotB = new THREE.Color(0x1a1a24);

  const tileGeo = new THREE.BoxGeometry(tileSize * 0.96, tileH, tileSize * 0.96);
  const tileMat = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false });
  const tiles = new THREE.InstancedMesh(tileGeo, tileMat, cols * totalRows);
  tiles.renderOrder = 12;
  tiles.frustumCulled = false;

  const _dummy = new THREE.Object3D();
  let idx = 0;
  for (let row = checkerRowStart; row < gridRowEnd; row++) {
    const behind = row * tileSize;
    const rowCenter = p.clone().addScaledVector(tan, -behind);
    const isChecker = row < checkerRowEnd;
    for (let col = 0; col < cols; col++) {
      const laneOff = (col / (cols - 1) - 0.5) * (trackWidth - tileSize * 0.4);
      const pos = rowCenter.clone().addScaledVector(n, laneOff);
      _dummy.position.set(pos.x, yBase + tileH * 0.5, pos.z);
      _dummy.rotation.set(0, frame.rot, 0);
      _dummy.updateMatrix();
      tiles.setMatrixAt(idx, _dummy.matrix);
      if (isChecker) {
        tiles.setColorAt(idx, (Math.abs(row) + col) % 2 === 0 ? white : black);
      } else {
        tiles.setColorAt(idx, (row + col) % 2 === 0 ? slotA : slotB);
      }
      idx++;
    }
  }
  tiles.count = idx;
  tiles.instanceMatrix.needsUpdate = true;
  if (tiles.instanceColor) tiles.instanceColor.needsUpdate = true;
  g.add(tiles);

  // Neon edge strips along grid (Mario Kart lane markers)
  const edgeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false });
  const edgeLen = totalRows * tileSize;
  const edgeBack = ((checkerRowStart + gridRowEnd) * 0.5 - checkerRowStart) * tileSize;
  for (const side of [-1, 1]) {
    const edge = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.5, edgeLen), edgeMat);
    const edgeCenter = p.clone()
      .addScaledVector(tan, -edgeBack)
      .addScaledVector(n, side * (halfWidth + 0.08));
    edge.position.set(edgeCenter.x, yBase + 0.28, edgeCenter.z);
    edge.rotation.y = frame.rot;
    edge.renderOrder = 13;
    g.add(edge);
  }

  // Checkered overhead arch
  const archH = 9;
  const postMat = new THREE.MeshStandardMaterial({
    color: 0xf5f5f5,
    emissive: 0xffffff,
    emissiveIntensity: 0.35,
    metalness: 0.15,
    roughness: 0.4,
  });
  const checkerArchMat = new THREE.MeshBasicMaterial({
    map: _makeCheckerTexture(Math.round(trackWidth / tileSize), 2),
    fog: false,
  });
  for (const side of [-1, 1]) {
    const postPos = p.clone().addScaledVector(n, side * (halfWidth + 0.45));
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.5, archH, 0.5), postMat);
    post.position.set(postPos.x, yBase + archH * 0.5, postPos.z);
    g.add(post);
  }
  const beam = new THREE.Mesh(
    new THREE.BoxGeometry(trackWidth + 1.4, 1.1, 1.4),
    checkerArchMat,
  );
  beam.position.set(p.x, yBase + archH, p.z);
  beam.renderOrder = 14;
  g.add(beam);

  // START / FINISH sign on arch
  const signC = document.createElement('canvas');
  signC.width = 512;
  signC.height = 128;
  const sctx = signC.getContext('2d');
  sctx.fillStyle = '#ffee00';
  sctx.fillRect(0, 0, signC.width, signC.height);
  sctx.strokeStyle = '#000';
  sctx.lineWidth = 10;
  sctx.strokeRect(6, 6, signC.width - 12, signC.height - 12);
  sctx.fillStyle = '#000';
  sctx.font = 'bold 54px Arial Black, Arial, sans-serif';
  sctx.textAlign = 'center';
  sctx.textBaseline = 'middle';
  sctx.fillText('START', signC.width / 2, signC.height / 2 + 2);
  const signTex = new THREE.CanvasTexture(signC);
  signTex.colorSpace = THREE.SRGBColorSpace;
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(trackWidth * 0.55, 1.35),
    new THREE.MeshBasicMaterial({ map: signTex, fog: false, depthWrite: false }),
  );
  sign.position.set(p.x, yBase + archH + 1.0, p.z);
  sign.rotation.y = frame.rot;
  sign.renderOrder = 15;
  g.add(sign);

  g.userData.startGridBounds = {
    minX: p.x - halfWidth - 1,
    maxX: p.x + halfWidth + 1,
    minZ: p.z - totalRows * tileSize - 2,
    maxZ: p.z + tileSize * 2,
  };

  return { group: g, position: p, rotation: frame.rot };
}

/** @deprecated Use buildRacingStartLine */
export function buildCheckeredStart(curve, t, halfWidth, use3D = false) {
  const { p, rot } = sampleTrack(curve, t);
  const ySurf = use3D ? p.y + 0.39 : 0.59;
  const strip = new THREE.Mesh(
    new THREE.PlaneGeometry(halfWidth * 2 - 0.3, 1.15),
    new THREE.MeshBasicMaterial({ map: _makeCheckerTexture(), polygonOffset: true, polygonOffsetFactor: -2 }),
  );
  strip.rotation.x = -Math.PI / 2;
  strip.rotation.z = rot;
  strip.position.set(p.x, ySurf, p.z);
  return strip;
}

/** @deprecated Use buildRacingStartLine */
export function buildStartGantry(curve, t, halfWidth, use3D = false) {
  return buildRacingStartLine(curve, t, halfWidth, use3D);
}

export function buildGoldenStarHoop(curve, t, halfWidth, index, use3D = false) {
  const { p, n, rot } = sampleTrack(curve, t);
  const yBase = use3D ? p.y : 0.55;
  const g = new THREE.Group();
  g.name = 'golden-star-hoop';

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xffcc00,
    emissive: 0xffaa00,
    emissiveIntensity: 1.2,
    metalness: 0.45,
    roughness: 0.28,
  });
  const hoopR = halfWidth + 1.1;
  const hoop = new THREE.Mesh(new THREE.TorusGeometry(hoopR, 0.22, 10, 36), goldMat);
  hoop.rotation.x = Math.PI / 2;
  hoop.position.set(p.x, yBase + hoopR + 0.4, p.z);
  g.add(hoop);

  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const star = _makeStarMesh(0.42, 0.16, 0.12, 0xffdd00, 2.0);
    star.position.set(
      p.x + Math.cos(a) * hoopR,
      yBase + hoopR + 0.4 + Math.sin(a) * hoopR,
      p.z + Math.sin(rot) * Math.cos(a) * hoopR * 0.15,
    );
    star.rotation.y = rot + a;
    star.rotation.x = -Math.PI / 2;
    g.add(star);
  }

  const centerStar = _makeStarMesh(0.7, 0.28, 0.16, 0xff44aa, 2.6);
  centerStar.position.set(p.x, yBase + hoopR + 0.4, p.z);
  centerStar.rotation.x = -Math.PI / 2;
  centerStar.rotation.z = rot;
  g.add(centerStar);

  g.userData.gatePos = { x: p.x, z: p.z };
  g.userData.glowMats = [goldMat];
  g.userData.cpIndex = index;
  return g;
}

/** Rainbow-stripe boost pad for Rainbow Road. */
export function buildRainbowBoostPad(curve, t, halfWidth, use3D = false) {
  const { p, rot } = sampleTrack(curve, t);
  const y = use3D ? p.y + 0.1 : 0.6;
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 64;
  const ctx = c.getContext('2d');
  const stripes = ['#ff2244', '#ff8800', '#ffee00', '#22ff88', '#00ccff', '#4466ff'];
  const sw = c.width / stripes.length;
  stripes.forEach((col, i) => {
    ctx.fillStyle = col;
    ctx.fillRect(i * sw, 0, sw + 1, c.height);
  });
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshStandardMaterial({
    map: tex,
    emissive: 0xffffff,
    emissiveIntensity: 0.35,
    transparent: true,
    opacity: 0.95,
  });
  const pad = new THREE.Mesh(new THREE.PlaneGeometry(halfWidth * 1.6, 1.4), mat);
  pad.rotation.x = -Math.PI / 2;
  pad.rotation.z = rot;
  pad.position.set(p.x, y, p.z);
  pad.userData.boostMat = mat;
  return { mesh: pad, position: { x: p.x, z: p.z } };
}

/** Rainbow corkscrew tunnel rings — decorative hoops along the helix section. */
export function buildCorkscrewTunnelRings(curve, tStart, tEnd, ringCount = 10, use3D = false) {
  const g = new THREE.Group();
  g.name = 'corkscrew-rings';
  const colors = [0xff2244, 0xff8800, 0xffee00, 0x22ff88, 0x00ccff, 0x4466ff, 0xcc44ff];
  const _zAxis = new THREE.Vector3(0, 0, 1);
  for (let i = 0; i <= ringCount; i++) {
    const t = tStart + (tEnd - tStart) * (i / ringCount);
    const { p, tan } = sampleTrack(curve, t);
    const y = use3D ? p.y : 0;
    const col = colors[i % colors.length];
    const mat = new THREE.MeshBasicMaterial({
      color: col, fog: false, toneMapped: false, transparent: true, opacity: 0.92,
    });
    const ringR = 6.8 + Math.sin(i * 0.7) * 0.6;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(ringR, 0.38, 10, 40), mat);
    ring.position.set(p.x, y + 2.2, p.z);
    ring.quaternion.setFromUnitVectors(_zAxis, tan.clone().normalize());
    g.add(ring);
    const inner = new THREE.Mesh(
      new THREE.TorusGeometry(ringR - 0.5, 0.12, 6, 32),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, fog: false }),
    );
    inner.position.copy(ring.position);
    inner.quaternion.copy(ring.quaternion);
    g.add(inner);
  }
  return g;
}

export function buildCheckpointArch(curve, t, halfWidth, color, index, use3D = false) {
  const { p, n, rot } = sampleTrack(curve, t);
  const yBase = use3D ? p.y : 0.55;
  const g = new THREE.Group();
  const glow = new THREE.MeshStandardMaterial({
    color, emissive: color, emissiveIntensity: 0.85, transparent: true, opacity: 0.9,
  });

  for (const off of [-halfWidth + 0.15, halfWidth - 0.15]) {
    const pos = p.clone().addScaledVector(n, off);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 4.5, 8), glow);
    post.position.set(pos.x, yBase + 2.25, pos.z);
    g.add(post);
  }

  const beam = new THREE.Mesh(new THREE.BoxGeometry(halfWidth * 2 - 0.2, 0.28, 0.28), glow);
  beam.position.set(p.x, yBase + 4.5, p.z);
  beam.rotation.y = rot;
  g.add(beam);

  const badge = new THREE.Mesh(
    new THREE.RingGeometry(0.35, 0.5, 16),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85 }),
  );
  badge.rotation.x = -Math.PI / 2;
  badge.position.set(p.x, yBase + 4.5, p.z);
  g.add(badge);

  g.name = 'cp';
  g.userData.gatePos = { x: p.x, z: p.z };
  g.userData.glowMats = [glow];
  g.userData.cpIndex = index;
  return g;
}

export function buildBoostPadMesh(curve, t, halfWidth, use3D = false) {
  const { p, rot } = sampleTrack(curve, t);
  const y = use3D ? p.y + 0.08 : 0.58;
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffaa00, emissive: 0xff8800, emissiveIntensity: 0.75,
    transparent: true, opacity: 0.88,
  });
  const pad = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.1), mat);
  pad.rotation.x = -Math.PI / 2;
  pad.rotation.z = rot;
  pad.position.set(p.x, y, p.z);
  pad.userData.boostMat = mat;
  return { mesh: pad, position: { x: p.x, z: p.z } };
}

const POWERUP_STYLE = {
  speed:  { color: 0x00d9ff, emissive: 0x00d9ff },
  shield: { color: 0x4488ff, emissive: 0x2255ff },
  magnet: { color: 0xcc66ff, emissive: 0xaa33ff },
  star:   { color: 0xffd700, emissive: 0xffaa00 },
};

/** Floating power-up pickup — small glowing octahedron, colour-coded by type. */
export function buildPowerUpMesh(curve, t, type, use3D = false) {
  const { p } = sampleTrack(curve, t);
  const y = (use3D ? p.y : 0) + 1.1;
  const style = POWERUP_STYLE[type] || POWERUP_STYLE.star;
  const mat = new THREE.MeshStandardMaterial({
    color: style.color, emissive: style.emissive, emissiveIntensity: 0.9,
    metalness: 0.3, roughness: 0.25,
  });
  const mesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 0), mat);
  mesh.position.set(p.x, y, p.z);
  mesh.userData.powerupMat = mat;
  mesh.userData.powerupType = type;
  mesh.userData.spinSpeed = 1.6 + Math.random() * 0.6;
  mesh.userData.bobPhase = Math.random() * Math.PI * 2;
  mesh.userData.baseY = y;
  return mesh;
}

/** Bank angle from tangent change (approximate). */
export function getTrackBank(curve, t) {
  const eps = 0.005;
  const t0 = (t - eps + 1) % 1;
  const t1 = (t + eps) % 1;
  const tan0 = curve.getTangentAt(t0).normalize();
  const tan1 = curve.getTangentAt(t1).normalize();
  return Math.atan2(tan1.y - tan0.y, eps * 2) * 0.5;
}

export function createCurveFromPoints(points, closed = true) {
  return new THREE.CatmullRomCurve3(
    points.map((p) => (p.isVector3 ? p : new THREE.Vector3(p.x, p.y ?? 0, p.z))),
    closed,
    'catmullrom',
    0.5,
  );
}
