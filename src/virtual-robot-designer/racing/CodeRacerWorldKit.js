/**
 * CodeRacerWorldKit.js — 3D race elements: coins, stars, billboards, mascot, animations.
 */
import * as THREE from 'three';
import { scatterCollectiblesAlongTrack, updateCollectibleAnimations, placeAtTrack } from './GameWorldBuilder.js';
import { BIOME_ARENA_TYPES } from './mk-tracks/BiomeTrackRegistry.js';
import { getTrackStandard } from './mk-tracks/CodeRacerTrackStandards.js';

function makeBillboard(text, color = 0x00ffff, w = 6, h = 1.4) {
  const c = document.createElement('canvas');
  c.width = 640;
  c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#001a28';
  ctx.fillRect(0, 0, 640, 128);
  ctx.fillStyle = `#${new THREE.Color(color).getHexString()}`;
  ctx.font = 'bold 42px system-ui,sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 320, 64);
  const tex = new THREE.CanvasTexture(c);
  return new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshStandardMaterial({
      map: tex,
      emissiveMap: tex,
      emissive: color,
      emissiveIntensity: 1.3,
      transparent: true,
      depthWrite: false,
    }),
  );
}

const SECTION_EMOJI = {
  curve: '🌴',
  hairpin: '🔄',
  arch: '🏛️',
  bridge: '🌉',
  tunnel: '🚇',
  straight: '⬆️',
  finish: '🏁',
  gate: '🚪',
  loop: '🌀',
  deck: '🛸',
  climb: '⛰️',
  slalom: '❄️',
  floor: '🔥',
  channel: '🌊',
  ring: '🪐',
  tunnel2: '⛈️',
};

function emojiForSection(name) {
  const n = (name || '').toLowerCase();
  for (const [key, em] of Object.entries(SECTION_EMOJI)) {
    if (n.includes(key)) return em;
  }
  return '🏎️';
}

/** Big friendly signs matching Track palette section names. */
export function placeSectionBillboards(world, curve, hw, arenaType) {
  const std = getTrackStandard(arenaType);
  const sections = std?.sections || [];
  if (!sections.length) return;
  const g = new THREE.Group();
  g.name = 'section-billboards';
  const n = sections.length;
  const color = std.accentColor ?? 0xff8c42;
  sections.forEach((name, i) => {
    const t = (i + 0.5) / n;
    const side = i % 2 ? 1 : -1;
    const { pos, frame } = placeAtTrack(curve, t, side * (hw + 7), 0);
    const label = `${name.toUpperCase()}! ${emojiForSection(name)}`;
    const sign = makeBillboard(label, color, 6.5, 1.5);
    sign.position.copy(pos);
    sign.rotation.y = frame.rot ?? 0;
    sign.userData.groundSnap = true;
    sign.userData.groundSnapOffset = 5.2;
    g.add(sign);
  });
  world.add(g);
}

/** Chunky waving robot mascot at start grid. */
export function placeStartMascot(world, curve, finishT, accentColor = 0x44ccff) {
  const g = new THREE.Group();
  g.name = 'start-mascot';
  const bodyMat = new THREE.MeshStandardMaterial({ color: accentColor, emissive: accentColor, emissiveIntensity: 0.35 });
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.8 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.1, 0.7), bodyMat);
  body.position.y = 1.1;
  g.add(body);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.75, 0.75), bodyMat);
  head.position.y = 2.0;
  g.add(head);
  [-0.22, 0.22].forEach((x) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), eyeMat);
    eye.position.set(x, 2.1, 0.32);
    g.add(eye);
  });
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.7, 0.25), bodyMat);
  arm.position.set(0.7, 1.5, 0);
  arm.name = 'mascot-wave-arm';
  g.add(arm);
  const { pos, frame } = placeAtTrack(curve, finishT, -9, -2);
  g.position.copy(pos);
  g.rotation.y = frame.rot ?? 0;
  g.userData.animated = true;
  g.userData.groundSnap = true;
  g.userData.groundSnapOffset = 0;
  world.add(g);
}

/** Coin + star lines along the 3D spline for CodeRacer biome circuits. */
export function buildCodeRacerCollectibles(scene, curve, { coinCount = 42, starEvery = 5, finishT = 0, halfWidth = 4 } = {}) {
  const coinTs = [];
  for (let i = 0; i < coinCount; i++) {
    coinTs.push(0.10 + (i / coinCount) * 0.88);
  }
  scatterCollectiblesAlongTrack(scene, curve, coinTs, 'coin', 10, { finishT, halfWidth });

  const starTs = coinTs.filter((_, i) => i > 0 && i % starEvery === 0).slice(0, 6);
  if (starTs.length) scatterCollectiblesAlongTrack(scene, curve, starTs, 'star', 25, { finishT, halfWidth });

  scene.userData.codeRacerCoinTotal = coinTs.length + starTs.length;
  return { coinCount: coinTs.length, starCount: starTs.length };
}

export function tickCodeRacerCollectibles(scene, time) {
  updateCollectibleAnimations(scene, time);
  scene.traverse((obj) => {
    if (obj.name === 'start-mascot') {
      const arm = obj.getObjectByName('mascot-wave-arm');
      if (arm) arm.rotation.z = Math.sin(time * 3.2) * 0.45 - 0.2;
      obj.position.y += Math.sin(time * 2) * 0.002;
    }
  });
}

export function isCodeRacerArena(arenaType) {
  return BIOME_ARENA_TYPES.has(arenaType);
}
