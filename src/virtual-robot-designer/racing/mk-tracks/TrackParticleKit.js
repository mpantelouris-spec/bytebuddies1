/**
 * TrackParticleKit.js — Per-biome particle systems.
 */
import * as THREE from 'three';
import { isCosmicSkywayArena } from './CosmicSkywayRegistry.js';

function scatterPoints(count, bounds, yMin, yMax, name, color, size, extra = null) {
  const positions = new Float32Array(count * 3);
  const span = Math.max(bounds.spanX, bounds.spanZ) + 50;
  for (let i = 0; i < count; i++) {
    positions[i * 3] = bounds.cx + (Math.random() - 0.5) * span;
    positions[i * 3 + 1] = yMin + Math.random() * (yMax - yMin);
    positions[i * 3 + 2] = bounds.cz + (Math.random() - 0.5) * span;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const pts = new THREE.Points(
    geo,
    new THREE.PointsMaterial({ color, size, transparent: true, opacity: 0.7, depthWrite: false }),
  );
  pts.name = name;
  pts.userData.animated = true;
  if (extra) pts.userData.particleType = extra;
  return pts;
}

export function installTrackParticles(world, bounds, arenaType, perf = null) {
  if (perf && !perf.particles) return null;
  const g = new THREE.Group();
  g.name = 'track-particles';
  const mult = perf?.propMult ?? 1;

  switch (isCosmicSkywayArena(arenaType) ? 'star_station_01' : arenaType) {
    case 'sunset_cove_01':
      g.add(scatterPoints(Math.round(160 * mult), bounds, 0.3, 2.5, 'sand-particles', 0xffcc88, 0.12, 'sand'));
      break;
    case 'candy_carnival_01':
      g.add(scatterPoints(120, bounds, 2, 18, 'confetti-particles', 0xff69b4, 0.12, 'confetti'));
      break;
    case 'neon_metro_01':
      g.add(buildRainLines(160));
      g.add(scatterPoints(60, bounds, 0, 2, 'mist-particles', 0x888899, 0.15, 'mist'));
      break;
    case 'cloud_citadel_01':
      g.add(scatterPoints(100, bounds, 4, 20, 'sparkle-particles', 0xffd700, 0.1, 'sparkle'));
      break;
    case 'jungle_ruins_01':
      g.add(scatterPoints(100, bounds, 2, 20, 'leaf-particles', 0x2ecc71, 0.14, 'leaf'));
      g.add(scatterPoints(40, bounds, 1, 8, 'firefly-particles', 0x7cfc00, 0.08, 'firefly'));
      break;
    case 'frost_peak_01':
      g.add(scatterPoints(150, bounds, 2, 25, 'snow-particles', 0xffffff, 0.1, 'snow'));
      break;
    case 'lava_foundry_01':
      g.add(scatterPoints(90, bounds, 1, 20, 'ember-particles', 0xff4500, 0.1, 'ember'));
      break;
    case 'star_station_01':
      g.add(scatterPoints(80, bounds, 2, 15, 'dust-particles', 0xaa44ff, 0.08, 'dust'));
      break;
    case 'fairy_glen_01':
      g.add(scatterPoints(100, bounds, 1, 12, 'sparkle-particles', 0xffd700, 0.1, 'sparkle'));
      g.add(scatterPoints(50, bounds, 1, 6, 'firefly-particles', 0x7cfc00, 0.08, 'firefly'));
      break;
    case 'thunder_ridge_01':
      g.add(buildRainLines(140));
      g.add(scatterPoints(60, bounds, 0, 1, 'splash-particles', 0x87ceeb, 0.1, 'splash'));
      break;
    default:
      g.add(scatterPoints(60, bounds, 2, 15, 'sparkle-particles', 0xffffff, 0.1));
  }
  world.add(g);
  return g;
}

function buildRainLines(count) {
  const positions = new Float32Array(count * 6);
  for (let i = 0; i < count; i++) {
    const x = (Math.random() - 0.5) * 90;
    const y = Math.random() * 35 + 5;
    const z = (Math.random() - 0.5) * 90;
    positions[i * 6] = x;
    positions[i * 6 + 1] = y;
    positions[i * 6 + 2] = z;
    positions[i * 6 + 3] = x;
    positions[i * 6 + 4] = y - 2.5;
    positions[i * 6 + 5] = z;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const lines = new THREE.LineSegments(
    geo,
    new THREE.LineBasicMaterial({ color: 0xaaaaaa, transparent: true, opacity: 0.35 }),
  );
  lines.name = 'rain-lines';
  lines.userData.animated = true;
  return lines;
}

export function animateTrackParticles(world, time) {
  world.traverse((obj) => {
    if (!obj.userData?.animated || !obj.geometry?.attributes?.position) return;
    const arr = obj.geometry.attributes.position.array;
    const type = obj.userData.particleType;

    if (obj.name === 'rain-lines') {
      for (let i = 0; i < arr.length; i += 6) {
        arr[i + 1] -= 0.35;
        arr[i + 4] -= 0.35;
        if (arr[i + 1] < 0) {
          arr[i + 1] = 30 + Math.random() * 10;
          arr[i + 4] = arr[i + 1] - 2.5;
        }
      }
    } else {
      for (let i = 0; i < arr.length; i += 3) {
        arr[i + 1] += Math.sin(time + i) * 0.004;
        if (type === 'ember') arr[i + 1] += 0.025;
        if (type === 'snow') arr[i + 1] -= 0.02;
        if (type === 'leaf') {
          arr[i] += Math.cos(time + i * 0.1) * 0.01;
          arr[i + 2] += Math.sin(time + i * 0.1) * 0.01;
          if (arr[i + 1] < 0) arr[i + 1] = 25;
        }
        if (type === 'ember' && arr[i + 1] > 28) arr[i + 1] = 0;
        if (type === 'snow' && arr[i + 1] < 0) arr[i + 1] = 25;
        if (type === 'confetti') {
          arr[i] += Math.sin(time * 2 + i) * 0.008;
          arr[i + 1] -= 0.015;
          if (arr[i + 1] < 0) arr[i + 1] = 20;
        }
      }
    }
    obj.geometry.attributes.position.needsUpdate = true;
  });
}
