/**
 * CrowdKit.js — a 3D crowd of little ByteBuddies robot fans on stepped seating.
 *
 * Every fan is an instance (body, head, visor, and a scarf/flag for some), so a
 * whole stadium is a handful of draw calls. The bounce, sway and cheering run in
 * the vertex shader from a per-fan phase, so there's no per-frame CPU cost.
 *
 *   const crowd = buildSeatedCrowd({ width, rows, rowDepth, rowRise, ... });
 *   crowd.userData.setCheer(1.5)   // jump and wave (decays in update)
 *   crowd.userData.update(t, dt)
 */
import * as THREE from 'three';

const ROBOT_HEADS = [0xf1f5f9, 0xe2e8f0, 0xcbd5e1, 0xfb923c, 0xfacc15, 0x94a3b8, 0xf8fafc, 0x60a5fa];

function rng(seed) {
  let s = seed >>> 0 || 1;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

/** Shared uniforms so every crowd animates from one clock. */
function crowdMaterial(base, uniforms) {
  const m = new THREE.MeshStandardMaterial({ ...base, roughness: base.roughness ?? 0.7 });
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.uniforms.uCheer = uniforms.uCheer;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>
attribute float aPhase;
uniform float uTime;
uniform float uCheer;`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
{
  // idle: gentle sway; cheering: fans jump, faster for the excited ones
  float sway = sin(uTime * 1.6 + aPhase * 6.2831) * 0.035;
  float hop = max(0.0, sin(uTime * (7.0 + fract(aPhase * 13.0) * 4.0) + aPhase * 40.0));
  float excited = step(0.55, fract(aPhase * 7.3)) * 0.12; // some fans always a bit bouncy
  transformed.y += hop * (uCheer * 0.28 + excited * 0.5) ;
  transformed.x += sway;
}`);
  };
  m.customProgramCacheKey = () => 'bb-crowd';
  return m;
}

/**
 * Build a block of seated fans on stepped rows.
 * The block faces +Z (towards the pitch/ring). Row 0 is at the front, lowest.
 * @param {object} o
 * @param {number} o.width      block width (x)
 * @param {number} o.rows       number of rows
 * @param {number} o.rowDepth   depth of each step (z)
 * @param {number} o.rowRise    height of each step (y)
 * @param {number} o.y0         height of the first step
 * @param {number} o.zFront     z of the front edge
 * @param {number[]} o.shirts   shirt colours (team first)
 * @param {number} o.seat       seat spacing
 * @param {number} o.fill       0..1 share of seats taken
 * @param {number} o.scale      fan size
 * @param {number} o.steps      riser colour
 */
export function buildSeatedCrowd({
  width = 20, rows = 6, rowDepth = 0.9, rowRise = 0.55, y0 = 0.4, zFront = 0,
  shirts = [0x22c55e, 0x16a34a, 0xffffff], seat = 0.62, fill = 0.9, scale = 1,
  steps = 0x273041, seed = 7, flags = 0.12, uniforms = null,
} = {}) {
  const g = new THREE.Group();
  g.name = 'Crowd3D';
  const U = uniforms || { uTime: { value: 0 }, uCheer: { value: 0 } };
  const r = rng(seed);

  // stepped concrete risers
  const stepMat = new THREE.MeshStandardMaterial({ color: steps, roughness: 0.92 });
  for (let i = 0; i < rows; i++) {
    const h = y0 + rowRise * (i + 1);
    const step = new THREE.Mesh(new THREE.BoxGeometry(width, h, rowDepth), stepMat);
    step.position.set(0, h / 2, zFront - rowDepth * (i + 0.5));
    step.receiveShadow = true;
    g.add(step);
  }
  // back wall behind the top row
  const backH = y0 + rowRise * rows + 2.2;
  const back = new THREE.Mesh(new THREE.BoxGeometry(width, backH, 0.3), new THREE.MeshStandardMaterial({ color: 0x151b27, roughness: 0.95 }));
  back.position.set(0, backH / 2, zFront - rowDepth * rows - 0.15);
  g.add(back);

  // seats
  const fans = [];
  const perRow = Math.max(1, Math.floor(width / seat));
  for (let i = 0; i < rows; i++) {
    const y = y0 + rowRise * (i + 1);
    const z = zFront - rowDepth * (i + 0.45);
    for (let k = 0; k < perRow; k++) {
      if (r() > fill) continue;
      const x = -width / 2 + seat * (k + 0.5) + (i % 2 ? seat * 0.25 : 0) + (r() - 0.5) * 0.08;
      if (Math.abs(x) > width / 2 - 0.2) continue;
      const teamShirt = r() < 0.72;
      fans.push({
        x, y, z,
        s: scale * (0.9 + r() * 0.22),
        shirt: teamShirt ? shirts[Math.floor(r() * Math.min(2, shirts.length))] : shirts[2 + Math.floor(r() * Math.max(1, shirts.length - 2))] ?? 0xe5e7eb,
        head: ROBOT_HEADS[Math.floor(r() * ROBOT_HEADS.length)],
        phase: r(),
        flag: r() < flags,
        lean: (r() - 0.5) * 0.25,
      });
    }
  }
  if (!fans.length) return g;

  const n = fans.length;
  const bodyGeo = new THREE.CapsuleGeometry(0.17, 0.24, 2, 8);
  bodyGeo.translate(0, 0.29, 0);
  const headGeo = new THREE.SphereGeometry(0.16, 10, 8);
  headGeo.translate(0, 0.72, 0);
  const visorGeo = new THREE.SphereGeometry(0.13, 10, 6, -Math.PI * 0.35, Math.PI * 0.7, Math.PI * 0.33, Math.PI * 0.28);
  visorGeo.translate(0, 0.73, 0.035);
  const flagGeo = new THREE.BoxGeometry(0.46, 0.2, 0.02);
  flagGeo.translate(0.12, 1.12, 0);
  const poleGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.62, 4);
  poleGeo.translate(-0.12, 0.98, 0);

  const phase = new Float32Array(n);
  fans.forEach((f, i) => { phase[i] = f.phase; });

  const mk = (geo, mat, count) => {
    const im = new THREE.InstancedMesh(geo, mat, count);
    im.geometry = im.geometry.clone();
    im.frustumCulled = false;
    return im;
  };
  const bodies = mk(bodyGeo, crowdMaterial({ color: 0xffffff, roughness: 0.6 }, U), n);
  const heads = mk(headGeo, crowdMaterial({ color: 0xffffff, roughness: 0.35, metalness: 0.25 }, U), n);
  const visors = mk(visorGeo, crowdMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.3, emissive: 0x0ea5e9, emissiveIntensity: 0.25 }, U), n);
  const flagFans = fans.map((f, i) => (f.flag ? i : -1)).filter((i) => i >= 0);
  const flagsMesh = flagFans.length ? mk(flagGeo, crowdMaterial({ color: 0xffffff, roughness: 0.8, side: THREE.DoubleSide }, U), flagFans.length) : null;
  const poles = flagFans.length ? mk(poleGeo, crowdMaterial({ color: 0x475569 }, U), flagFans.length) : null;

  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const c = new THREE.Color();
  fans.forEach((f, i) => {
    q.setFromEuler(new THREE.Euler(0, f.lean, 0));
    m.compose(new THREE.Vector3(f.x, f.y, f.z), q, new THREE.Vector3(f.s, f.s, f.s));
    bodies.setMatrixAt(i, m); heads.setMatrixAt(i, m); visors.setMatrixAt(i, m);
    bodies.setColorAt(i, c.setHex(f.shirt));
    heads.setColorAt(i, c.setHex(f.head));
  });
  const flagPhase = new Float32Array(flagFans.length);
  flagFans.forEach((fi, j) => {
    const f = fans[fi];
    q.setFromEuler(new THREE.Euler(0, f.lean, 0));
    m.compose(new THREE.Vector3(f.x, f.y, f.z), q, new THREE.Vector3(f.s, f.s, f.s));
    flagsMesh.setMatrixAt(j, m);
    poles.setMatrixAt(j, m);
    flagsMesh.setColorAt(j, c.setHex(shirts[0]));
    flagPhase[j] = f.phase;
  });
  [bodies, heads, visors].forEach((im) => {
    im.geometry.setAttribute('aPhase', new THREE.InstancedBufferAttribute(phase, 1));
    im.castShadow = false;
    im.receiveShadow = false;
    g.add(im);
  });
  [flagsMesh, poles].forEach((im) => {
    if (!im) return;
    im.geometry.setAttribute('aPhase', new THREE.InstancedBufferAttribute(flagPhase, 1));
    g.add(im);
  });
  g.userData.fanCount = n;
  g.userData.uniforms = U;
  return g;
}

/**
 * A crowd controller shared by several blocks: one clock, one cheer level.
 */
export function createCrowdDirector() {
  const uniforms = { uTime: { value: 0 }, uCheer: { value: 0 } };
  let cheer = 0;
  return {
    uniforms,
    cheer(amount = 1) { cheer = Math.min(2, cheer + amount); },
    update(t, dt = 0.016) {
      uniforms.uTime.value = t;
      cheer = Math.max(0, cheer - dt * 0.7);
      uniforms.uCheer.value = cheer;
    },
  };
}
