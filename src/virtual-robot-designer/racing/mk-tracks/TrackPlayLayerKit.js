/**
 * TrackPlayLayerKit.js — Layer 2 (road markings) + Layer 3 (minimal foreground signs).
 * Real-time 3D play dressing only — no photo backdrops.
 */
import * as THREE from 'three';
import { placeAtTrack } from '../GameWorldBuilder.js';
import { getTrackStandard, filterLaunchCorridorTs } from './CodeRacerTrackStandards.js';
import { pbrMat } from './BiomeAAAKit.js';
import { buildWideCheckeredStart } from './SunsetCoastHeroKit.js';
import { buildGoldRails } from './SkyGardenHeroKit.js';
import { buildCheckpointArch, placeCheckpointArches, placeBoostPads } from './BiomeHeroShared.js';
import { buildHoloBillboard } from './CyberCityHeroKit.js';

function roadY(curve, t) {
  return curve.getPointAt(t).y || 0;
}

function stdCpBoost(world, curve, hw, arenaType, skipCheckpoints = false, finishT = 0) {
  const std = getTrackStandard(arenaType);
  if (!std) return;
  if (!skipCheckpoints && std.checkpointTs?.length) {
    placeCheckpointArches(world, curve, hw, std.checkpointTs, std.checkpointColors || []);
  }
  const boostTs = filterLaunchCorridorTs(std.boostTs, finishT ?? 0);
  if (boostTs.length) placeBoostPads(world, curve, boostTs);
}

function makeSignMesh(text, color = 0x00ffff, w = 5.5, h = 1.2) {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 96;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#001a28';
  ctx.fillRect(0, 0, 512, 96);
  ctx.fillStyle = `#${new THREE.Color(color).getHexString()}`;
  ctx.font = 'bold 38px system-ui,sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 48);
  const tex = new THREE.CanvasTexture(c);
  return new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshStandardMaterial({
      map: tex,
      emissiveMap: tex,
      emissive: color,
      emissiveIntensity: 1.2,
      transparent: true,
      depthWrite: false,
    }),
  );
}

function placeStartSign(world, curve, finishT, text, color = 0xff6622, yOff = 4.5) {
  const { pos, frame } = placeAtTrack(curve, finishT, 0, -2);
  const sign = makeSignMesh(text, color);
  sign.position.copy(pos);
  sign.position.y += roadY(curve, finishT) + yOff;
  sign.rotation.y = frame.rot ?? 0;
  world.add(sign);
}

function buildLaneStrips(curve, hw, color, emi = 0.55, steps = 24, offsets = null) {
  const g = new THREE.Group();
  g.name = 'lane-strips';
  const mat = pbrMat(color, { emissive: color, emi, roughness: 0.15 });
  const offs = offsets ?? [-hw * 0.35, hw * 0.35];
  const total = steps * offs.length;
  const geo = new THREE.BoxGeometry(0.14, 0.05, 2.0);
  const im = new THREE.InstancedMesh(geo, mat, total);
  im.name = 'lane-strips-instanced';

  const m = new THREE.Matrix4();
  const p = new THREE.Vector3();
  const q = new THREE.Quaternion();
  const s = new THREE.Vector3(1, 1, 1);
  let idx = 0;

  offs.forEach((off) => {
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const { pos, frame } = placeAtTrack(curve, t, off, 0.1);
      p.copy(pos);
      p.y += roadY(curve, t) + 0.08;
      q.setFromEuler(new THREE.Euler(0, frame.rot ?? 0, 0));
      m.compose(p, q, s);
      im.setMatrixAt(idx, m);
      idx++;
    }
  });
  im.instanceMatrix.needsUpdate = true;
  g.add(im);
  return g;
}

function buildGoldRailsLite(curve, hw, steps = 24) {
  const g = new THREE.Group();
  g.name = 'gold-rails-lite';
  const railMat = pbrMat(0xffd700, { metalness: 0.8, roughness: 0.2, emissive: 0xffd700, emi: 0.4 });
  [-hw * 0.32, hw * 0.32].forEach((off) => {
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const { pos, frame } = placeAtTrack(curve, t, off, 0.1);
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.06, 1.8), railMat);
      rail.position.copy(pos);
      rail.position.y += roadY(curve, t) + 0.08;
      rail.rotation.y = frame.rot ?? 0;
      g.add(rail);
    }
  });
  return g;
}

function buildHazardStripes(curve, hw, steps = 24) {
  const g = new THREE.Group();
  g.name = 'hazard-stripes';
  const mat = pbrMat(0xffe600, { emissive: 0xffe600, emi: 0.5, roughness: 0.2 });
  for (let i = 0; i < steps; i++) {
    if (i % 2) continue;
    const t = i / steps;
    [-hw - 0.12, hw + 0.12].forEach((off) => {
      const { pos, frame } = placeAtTrack(curve, t, off, 0.1);
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.06, 1.2), mat);
      stripe.position.copy(pos);
      stripe.position.y += roadY(curve, t) + 0.08;
      stripe.rotation.y = frame.rot ?? 0;
      g.add(stripe);
    });
  }
  return g;
}

function buildLavaCracks(curve, steps = 28) {
  const g = new THREE.Group();
  g.name = 'lava-cracks';
  const mat = pbrMat(0xff4500, { emissive: 0xff4500, emi: 0.65, roughness: 0.25 });
  for (let i = 0; i < steps; i++) {
    if (i % 3 !== 0) continue;
    const t = i / steps;
    const { pos, frame } = placeAtTrack(curve, t, (i % 2 ? 0.8 : -0.8), 0.08);
    const crack = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.04, 0.18), mat);
    crack.position.copy(pos);
    crack.position.y += roadY(curve, t) + 0.09;
    crack.rotation.y = frame.rot ?? 0;
    g.add(crack);
  }
  return g;
}

const PLAY_LAYERS = {
  sunset_cove_01(world, curve, hw, finishT) {
    world.add(buildWideCheckeredStart(curve, hw, finishT));
    stdCpBoost(world, curve, hw, 'sunset_cove_01', true, finishT);
  },
  candy_carnival_01(world, curve, hw, finishT) {
    world.add(buildWideCheckeredStart(curve, hw, finishT));
    stdCpBoost(world, curve, hw, 'candy_carnival_01', true, finishT);
  },
  neon_metro_01(world, curve, hw, finishT) {
    world.add(buildWideCheckeredStart(curve, hw, finishT));
    world.add(buildLaneStrips(curve, hw, 0xff00ff, 0.75, 28));
    stdCpBoost(world, curve, hw, 'neon_metro_01', false, finishT);
  },
  cloud_citadel_01(world, curve, hw, finishT) {
    world.add(buildWideCheckeredStart(curve, hw, finishT));
    world.add(buildGoldRailsLite(curve, hw, 28));
    stdCpBoost(world, curve, hw, 'cloud_citadel_01', false, finishT);
  },
  jungle_ruins_01(world, curve, hw, finishT) {
    world.add(buildWideCheckeredStart(curve, hw, finishT));
    stdCpBoost(world, curve, hw, 'jungle_ruins_01', false, finishT);
  },
  frost_peak_01(world, curve, hw, finishT) {
    world.add(buildWideCheckeredStart(curve, hw, finishT));
    world.add(buildLaneStrips(curve, hw, 0xb8ddf0, 0.4, 24));
    stdCpBoost(world, curve, hw, 'frost_peak_01', false, finishT);
  },
  lava_foundry_01(world, curve, hw, finishT) {
    world.add(buildWideCheckeredStart(curve, hw, finishT));
    world.add(buildLavaCracks(curve, 28));
    stdCpBoost(world, curve, hw, 'lava_foundry_01', false, finishT);
  },
  star_station_01(world, curve, hw, finishT) {
    world.add(buildWideCheckeredStart(curve, hw, finishT));
    stdCpBoost(world, curve, hw, 'star_station_01', false, finishT);
  },
  fairy_glen_01(world, curve, hw, finishT) {
    world.add(buildWideCheckeredStart(curve, hw, finishT));
    world.add(buildLaneStrips(curve, hw, 0x7cfc00, 0.55, 26));
    stdCpBoost(world, curve, hw, 'fairy_glen_01', false, finishT);
  },
  thunder_ridge_01(world, curve, hw, finishT) {
    world.add(buildWideCheckeredStart(curve, hw, finishT));
    world.add(buildHazardStripes(curve, hw, 24));
    stdCpBoost(world, curve, hw, 'thunder_ridge_01', false, finishT);
  },
};

function placeTrackStartSign(world, curve, finishT, arenaType, yOff = 4.5) {
  const std = getTrackStandard(arenaType);
  if (!std) return;
  placeStartSign(world, curve, finishT, std.startLabel, std.accentColor, yOff);
}

const FOREGROUND_LAYERS = {
  sunset_cove_01(world, scene, curve, hw, bounds, finishT) {
    // Track name shown on 3D start gantry — no flat overlay sign
  },
  candy_carnival_01(world, scene, curve, hw, bounds, finishT) {
    placeTrackStartSign(world, curve, finishT, 'candy_carnival_01');
  },
  neon_metro_01(world, scene, curve, hw, bounds, finishT) {
    const bill = buildHoloBillboard('METRO RUSH');
    bill.scale.setScalar(0.55);
    const { pos, frame } = placeAtTrack(curve, finishT, 0, 10);
    bill.position.copy(pos);
    bill.position.y += roadY(curve, finishT) + 6;
    bill.rotation.y = frame.rot ?? 0;
    world.add(bill);
  },
  cloud_citadel_01(world, scene, curve, hw, bounds, finishT) {
    placeTrackStartSign(world, curve, finishT, 'cloud_citadel_01');
  },
  jungle_ruins_01(world, scene, curve, hw, bounds, finishT) {
    placeTrackStartSign(world, curve, finishT, 'jungle_ruins_01');
  },
  frost_peak_01(world, scene, curve, hw, bounds, finishT) {
    placeTrackStartSign(world, curve, finishT, 'frost_peak_01');
  },
  lava_foundry_01(world, scene, curve, hw, bounds, finishT) {
    placeTrackStartSign(world, curve, finishT, 'lava_foundry_01');
  },
  star_station_01(world, scene, curve, hw, bounds, finishT) {
    placeTrackStartSign(world, curve, finishT, 'star_station_01');
  },
  fairy_glen_01(world, scene, curve, hw, bounds, finishT) {
    placeTrackStartSign(world, curve, finishT, 'fairy_glen_01');
  },
  thunder_ridge_01(world, scene, curve, hw, bounds, finishT) {
    placeTrackStartSign(world, curve, finishT, 'thunder_ridge_01');
  },
};

export function installTrackPlayLayer(world, curve, hw, arenaType, finishT) {
  const fn = PLAY_LAYERS[arenaType];
  if (fn) fn(world, curve, hw, finishT);
}

export function installTrackForeground(world, scene, curve, hw, bounds, arenaType, finishT) {
  const fn = FOREGROUND_LAYERS[arenaType];
  if (fn) fn(world, scene, curve, hw, bounds, finishT);
}

/** Legacy — backdrop handled in BiomeAAAWorlds. */
export function applyTrackBackdrop(scene, bounds, arenaType) {
  return null;
}
