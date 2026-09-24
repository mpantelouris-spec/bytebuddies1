/**
 * WorldHorizonKit.js — Distant skyline silhouettes on a ring around the track.
 * Readable from chase cam without blocking the road.
 */
import * as THREE from 'three';
import { placeAtTrack } from '../GameWorldBuilder.js';

function makeSilhouetteTexture(drawFn, w = 256, h = 256) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  drawFn(ctx, w, h);
  const tex = new THREE.CanvasTexture(c);
  return tex;
}

function billboard(tex, w, h) {
  return new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({
      map: tex, transparent: true, alphaTest: 0.08, side: THREE.DoubleSide, fog: true, depthWrite: false,
    }),
  );
}

function placeOnHorizon(parent, bounds, angle, dist, mesh) {
  const x = bounds.cx + Math.cos(angle) * dist;
  const z = bounds.cz + Math.sin(angle) * dist;
  mesh.position.set(x, mesh.position.y ?? 0, z);
  mesh.lookAt(bounds.cx, mesh.position.y ?? 0, bounds.cz);
  parent.add(mesh);
}

export function buildSunsetHorizon(world, bounds) {
  const group = new THREE.Group();
  group.name = 'horizon-sunset';
  const dist = bounds.radius + 52;

  const lh = billboard(makeSilhouetteTexture((ctx, w, h) => {
    ctx.fillStyle = '#1a1a22';
    ctx.fillRect(w * 0.42, h * 0.15, w * 0.16, h * 0.7);
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.18, w * 0.07, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffcc66';
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.18, w * 0.035, 0, Math.PI * 2);
    ctx.fill();
  }), 24, 36);
  lh.position.y = 6;
  placeOnHorizon(group, bounds, -Math.PI * 0.5, dist, lh);

  const arch = billboard(makeSilhouetteTexture((ctx, w, h) => {
    ctx.fillStyle = '#3a3530';
    ctx.fillRect(w * 0.1, h * 0.35, w * 0.12, h * 0.45);
    ctx.fillRect(w * 0.78, h * 0.35, w * 0.12, h * 0.45);
    ctx.fillRect(w * 0.08, h * 0.28, w * 0.84, h * 0.12);
  }), 44, 26);
  arch.position.y = 5;
  placeOnHorizon(group, bounds, Math.PI * 0.3, dist, arch);

  const volcano = billboard(makeSilhouetteTexture((ctx, w, h) => {
    ctx.fillStyle = '#2a2020';
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.08);
    ctx.lineTo(w * 0.85, h * 0.75);
    ctx.lineTo(w * 0.15, h * 0.75);
    ctx.closePath();
    ctx.fill();
  }), 30, 24);
  volcano.position.y = 4;
  placeOnHorizon(group, bounds, Math.PI * 0.05, dist + 8, volcano);

  const sun = new THREE.Mesh(
    new THREE.CircleGeometry(12, 32),
    new THREE.MeshBasicMaterial({ color: 0xffaa44, transparent: true, opacity: 0.9, fog: false }),
  );
  sun.position.set(bounds.cx + 30, 20, bounds.minZ - dist);
  group.add(sun);

  world.add(group);
}

export function placeTracksideMoment(world, curve, t, hw, buildFn, { side = 1, gap = 16, y = 0 } = {}) {
  const { pos, frame } = placeAtTrack(curve, t, side * (hw + gap), y);
  const g = buildFn();
  g.position.copy(pos);
  g.rotation.y = frame.rot ?? 0;
  world.add(g);
  return g;
}
