/**
 * Colour worlds for arcade modes 11–50. The scene is built as normal, then the
 * big scenery (ground, walls, hills, sky, fog) is regraded into one of eight
 * worlds, and the level's lighting mood is laid on top. Small gameplay pieces —
 * apples, dots, coins, bricks, raiders, the robot — keep their colours so they
 * stay easy to read.
 */
import * as THREE from 'three';
import { getMood } from '../data/tier-levels/moods.js';
import { applyTierMoodGrade } from '../studio/TierMoodGrade.js';

// hue: target hue (0–1) the scenery is pulled towards; tex: tint for textured ground
const DAY_WORLDS = [
  { name: 'Meadow', bg: 0xa5dcff, hue: null, sat: 1, light: 0, tex: 0xffffff },
  { name: 'Desert', bg: 0xf8d9a0, hue: 0.1, sat: 0.8, light: 0.06, tex: 0xf3cf8a },
  { name: 'Snowfield', bg: 0xdbeafe, hue: 0.58, sat: 0.25, light: 0.22, tex: 0xf1f5f9 },
  { name: 'Autumn', bg: 0xfcd9b6, hue: 0.07, sat: 1.1, light: -0.02, tex: 0xf4a259 },
  { name: 'Candy', bg: 0xfbcfe8, hue: 0.9, sat: 0.9, light: 0.1, tex: 0xf9a8d4 },
  { name: 'Jungle', bg: 0x86efac, hue: 0.36, sat: 1.25, light: -0.12, tex: 0x4ade80 },
  { name: 'Beach', bg: 0x7dd3fc, hue: 0.13, sat: 0.7, light: 0.12, tex: 0xfde68a },
  { name: 'Moon base', bg: 0x1e293b, hue: 0.62, sat: 0.12, light: -0.05, tex: 0x94a3b8 },
];
const NIGHT_WORLDS = [
  { name: 'Neon', bg: 0x1e1b4b, hue: null, sat: 1, light: 0, tex: 0xffffff },
  { name: 'Sunset arcade', bg: 0x4c1d2f, hue: 0.03, sat: 1.1, light: 0.02, tex: 0xfda4af },
  { name: 'Aurora', bg: 0x062e2a, hue: 0.42, sat: 1.1, light: 0, tex: 0x6ee7b7 },
  { name: 'Ember', bg: 0x2a0a06, hue: 0.02, sat: 1.2, light: -0.02, tex: 0xfb923c },
  { name: 'Ice cave', bg: 0x0c2a44, hue: 0.55, sat: 0.8, light: 0.06, tex: 0xbae6fd },
  { name: 'Toxic', bg: 0x1a2e05, hue: 0.25, sat: 1.2, light: 0, tex: 0xbef264 },
  { name: 'Royal', bg: 0x2e1a05, hue: 0.12, sat: 1.1, light: 0.04, tex: 0xfde047 },
  { name: 'Deep sea', bg: 0x032b3d, hue: 0.5, sat: 1, light: 0, tex: 0x67e8f9 },
];
const NIGHT_GAMES = new Set(['pacbot', 'brickbot', 'raiderbot']);

export function arcadeWorld(gameId, index) {
  const list = NIGHT_GAMES.has(gameId) ? NIGHT_WORLDS : DAY_WORLDS;
  return list[((Number(index) || 0) % list.length + list.length) % list.length];
}

function pullHue(h, target, k) {
  let d = target - h;
  if (d > 0.5) d -= 1; if (d < -0.5) d += 1;
  return (h + d * k + 1) % 1;
}

export function gradeArcadeScene(scene, gameId, worldIndex, moodIndex) {
  const W = arcadeWorld(gameId, worldIndex);
  const hsl = { h: 0, s: 0, l: 0 };
  const texTint = new THREE.Color(W.tex);
  const seen = new Set();
  scene.updateMatrixWorld(true);
  scene.traverse((o) => {
    if (!o.isMesh || !o.geometry) return;
    if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere();
    const scale = o.getWorldScale(new THREE.Vector3());
    const size = (o.geometry.boundingSphere?.radius || 0) * Math.max(scale.x, scale.y, scale.z);
    if (size < 1.5) return; // gameplay pieces stay as they are
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    o.material = mats.map((m) => {
      if (!m?.color || seen.has(m)) return m;
      const c = m.clone(); seen.add(c);
      if (c.map) c.color.lerp(texTint, 0.8);
      else if (W.hue != null) {
        c.color.getHSL(hsl);
        c.color.setHSL(pullHue(hsl.h, W.hue, 0.9), Math.min(1, hsl.s * W.sat), Math.max(0, Math.min(1, hsl.l + W.light)));
      }
      return c;
    });
    if (o.material.length === 1) o.material = o.material[0];
  });
  if (W.hue != null) {
    scene.background = new THREE.Color(W.bg);
    if (scene.fog) scene.fog.color = new THREE.Color(W.bg);
  }
  applyTierMoodGrade(scene, getMood(moodIndex));
  scene.userData.arcadeWorld = W.name;
  return W;
}
