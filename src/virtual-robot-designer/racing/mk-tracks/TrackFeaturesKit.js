/**
 * TrackFeaturesKit.js — Shared MK track elements (boosts, ?-blocks, hazards, signs).
 * Kid-friendly, readable at gameplay distance.
 */
import * as THREE from 'three';
import { placeAtTrack } from '../GameWorldBuilder.js';
import { buildSectionSign } from '../GameWorldBuilder.js';
import { getTrackStandard } from './CodeRacerTrackStandards.js';
import { pbrMat } from './BiomeAAAKit.js';
import { REFERENCE_QUALITY_SKIP } from './BiomeQualityKit.js';

/** All ten CodeRacer biomes ship authored start/finish hero sets — skip duplicate gantries. */
const BIOME_START_HERO_ARENAS = new Set([
  'desert_dunes_01', 'crystal_palace_01', 'sky_island_01', 'volcano_canyon_01',
  'cyber_boulevard_01', 'ice_cavern_01', 'underwater_temple_01',
  'moonlight_cavern_01', 'forest_maze_01', 'magic_forest_01',
]);

const HAZARD_COLORS = {
  water: 0x00ced1,
  ice: 0x5dade2,
  heat: 0xff4500,
  ash: 0x708090,
  steam: 0xcccccc,
  wind: 0x87ceeb,
  crystal: 0x00ffff,
  nebula: 0x8a2be2,
  mist: 0x40e0d0,
};

/** START/FINISH gantry — impossible to miss from chase cam. */
export function buildStartGantry(label = 'BEACH RACE', accent = 0xff8844) {
  const g = new THREE.Group();
  const postMat = pbrMat(0xffffff, { emissive: accent, emi: 0.25, roughness: 0.35 });
  const beamMat = pbrMat(accent, { emissive: accent, emi: 0.55, roughness: 0.25 });
  [-5.5, 5.5].forEach((x) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.5, 5.5, 0.5), postMat);
    post.position.set(x, 2.75, 0);
    g.add(post);
  });
  const beam = new THREE.Mesh(new THREE.BoxGeometry(12, 0.7, 0.6), beamMat);
  beam.position.y = 5.2;
  g.add(beam);

  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#ff6622';
  ctx.fillRect(0, 0, 512, 128);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 8;
  ctx.strokeRect(6, 6, 500, 116);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 52px system-ui,sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, 256, 64);
  const tex = new THREE.CanvasTexture(c);
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 2.5),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true }),
  );
  sign.position.set(0, 4.2, 0.35);
  g.add(sign);

  const light = new THREE.PointLight(accent, 1.2, 18);
  light.position.set(0, 4.5, 1);
  g.add(light);
  return g;
}

/** Floating ?-block pickup pad (kid-friendly item zone). */
export function buildQuestionBlock(scale = 1) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.1 * scale, 1.1 * scale, 1.1 * scale),
    pbrMat(0xffcc00, { emissive: 0xffaa00, emi: 0.35, roughness: 0.35, metalness: 0.1 }),
  );
  body.position.y = 0.55 * scale;
  g.add(body);

  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#ff8800';
  ctx.fillRect(0, 0, 128, 128);
  ctx.strokeStyle = '#cc6600';
  ctx.lineWidth = 6;
  ctx.strokeRect(4, 4, 120, 120);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 72px system-ui,sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('?', 64, 64);
  const tex = new THREE.CanvasTexture(c);
  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(0.85 * scale, 0.85 * scale),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true }),
  );
  face.position.set(0, 0.55 * scale, 0.56 * scale);
  g.add(face);

  const light = new THREE.PointLight(0xffcc00, 0.6, 6);
  light.position.y = 0.8 * scale;
  g.add(light);
  g.userData.bobPhase = Math.random() * Math.PI * 2;
  g.userData.spin = true;
  return g;
}

/** Telegraphed hazard strip beside track (color + glow, no damage). */
export function buildHazardTelegraph(type = 'water', width = 2.5, depth = 1.2) {
  const color = HAZARD_COLORS[type] || 0xff8800;
  const g = new THREE.Group();
  const pad = new THREE.Mesh(
    new THREE.PlaneGeometry(width, depth),
    pbrMat(color, { emissive: color, emi: 0.45, roughness: 0.2, transparent: true, opacity: 0.75 }),
  );
  pad.rotation.x = -Math.PI / 2;
  pad.position.y = 0.04;
  g.add(pad);
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(width * 0.35, 0.06, 6, 16),
    pbrMat(color, { emissive: color, emi: 0.8 }),
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.12;
  g.add(rim);
  g.userData.hazardType = type;
  g.userData.pulse = true;
  return g;
}

/** Shortcut gate marker (narrower path indicator). */
export function buildShortcutMarker(color = 0x44ff88) {
  const g = new THREE.Group();
  const post = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.1, 2.2, 6),
    pbrMat(color, { emissive: color, emi: 0.5 }),
  );
  post.position.y = 1.1;
  g.add(post);
  const flag = new THREE.Mesh(
    new THREE.PlaneGeometry(0.9, 0.5),
    pbrMat(color, { emissive: color, emi: 0.3, side: THREE.DoubleSide }),
  );
  flag.position.set(0.45, 1.8, 0);
  g.add(flag);
  return g;
}

function placeOnTrack(world, curve, t, hw, buildFn, { side = 1, gap = 12, y = 0 } = {}) {
  const { pos, frame } = placeAtTrack(curve, t, side * (hw + gap), y);
  const g = buildFn();
  g.position.copy(pos);
  g.rotation.y = frame.rot ?? 0;
  world.add(g);
  return g;
}

/** Hazard zone width along track parameter (± band). */
const HAZARD_T_BAND = 0.028;

/**
 * Gameplay speed multiplier when kart is in a telegraphed hazard zone.
 * @returns {number} 0.7–1.0 per CodeRacer spec (water 80%, ice 70%, steam 82%, etc.)
 */
export function getHazardSpeedMultiplier(arenaType, trackT) {
  const std = getTrackStandard(arenaType);
  if (!std?.hazardZones?.length || trackT == null || !Number.isFinite(trackT)) return 1;
  let mul = 1;
  for (const hz of std.hazardZones) {
    let delta = trackT - hz.t;
    if (delta > 0.5) delta -= 1;
    if (delta < -0.5) delta += 1;
    if (Math.abs(delta) <= HAZARD_T_BAND) {
      mul = Math.min(mul, hz.slow ?? 0.85);
    }
  }
  return mul;
}

/** Apply master-prompt track features for a biome circuit. */
export function applyTrackStandardFeatures(world, scene, curve, arenaType, { hw = 4, is3D = true } = {}) {
  const std = getTrackStandard(arenaType);
  if (!std) return;

  const animItems = [];
  const startLabel = std.startLabel || std.signs?.[0]?.text || 'START';
  const skipGantry = REFERENCE_QUALITY_SKIP[arenaType]?.gantry
    || BIOME_START_HERO_ARENAS.has(arenaType);
  if (!skipGantry) {
    const startGantry = buildStartGantry(startLabel, std.accentColor ?? 0xff8844);
    const { pos: startPos, frame: startFrame } = placeAtTrack(curve, 0.01, 0, 0);
    startGantry.position.copy(startPos);
    startGantry.rotation.y = startFrame.rot ?? 0;
    startGantry.position.y += (curve.getPointAt(0.01).y || 0);
    world.add(startGantry);
  }

  (std.itemBlocks || []).forEach((t, i) => {
    const block = placeOnTrack(world, curve, t, hw, () => buildQuestionBlock(1.75), {
      side: i % 2 ? -1 : 1,
      gap: 3.5,
      y: is3D ? 0 : 0,
    });
    block.position.y += is3D ? 1.4 + (curve.getPointAt(t).y || 0) : 1.4;
    animItems.push(block);
  });

  (std.hazardZones || []).forEach((hz) => {
    placeOnTrack(world, curve, hz.t, hw, () => buildHazardTelegraph(hz.type), {
      side: 1,
      gap: hw + 1.2,
    });
  });

  if (std.shortcut) {
    placeOnTrack(world, curve, std.shortcut.t, hw, () => buildShortcutMarker(0x66ffaa), {
      side: std.shortcut.side ?? -1,
      gap: std.shortcut.gap ?? 5,
    });
  }

  (std.signs || []).forEach((sign) => {
    const signG = buildSectionSign(sign.text, sign.sub || '', 0xffffff);
    placeOnTrack(world, curve, sign.t, hw, () => signG, { side: -1, gap: 14 });
  });

  const prevTick = world.userData.animTick;
  world.userData.animTick = (time) => {
    prevTick?.(time);
    animItems.forEach((obj) => {
      if (obj.userData?.spin) {
        obj.rotation.y = time * 1.2;
        const ph = obj.userData.bobPhase ?? 0;
        const baseY = obj.userData._baseY ?? obj.position.y;
        if (!obj.userData._baseY) obj.userData._baseY = baseY;
        obj.position.y = baseY + Math.sin(time * 2.2 + ph) * 0.2;
      }
      if (obj.userData?.pulse && obj.children[0]?.material) {
        obj.children[0].material.emissiveIntensity = 0.35 + Math.sin(time * 3) * 0.2;
      }
    });
  };

  scene.userData.trackStandard = std;
  scene.userData.trackSections = std.sections;
  scene.userData.trackLandmarks = std.landmarks;
}
