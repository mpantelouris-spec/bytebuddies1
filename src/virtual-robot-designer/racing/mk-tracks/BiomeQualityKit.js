/**
 * BiomeQualityKit.js — Lightweight MK8 polish (gantry + checkered) without scene overload.
 * Heavy hero scenery stays in per-track HeroKits; this only fills gaps.
 */
import { placeAtTrack } from '../GameWorldBuilder.js';
import { getTrackStandard } from './CodeRacerTrackStandards.js';
import { sampleTrackBounds } from './BiomeAAAKit.js';
import {
  buildCheckeredStartGantry,
  buildIndustrialStartGantry,
  buildWideCheckeredStart,
} from './SunsetCoastHeroKit.js';

function worldHasNamed(world, name) {
  let found = false;
  world.traverse((o) => { if (o.name === name) found = true; });
  return found;
}

function getStartLabel(arenaType) {
  const std = getTrackStandard(arenaType);
  return std?.startLabel || std?.signs?.[0]?.text || arenaType.replace(/_/g, ' ').toUpperCase();
}

function roadY(curve, t) {
  return curve.getPointAt(t).y || 0;
}

export function placeIndustrialGantry(world, curve, finishT, label, opts = {}) {
  if (worldHasNamed(world, 'industrial-start-gantry')) return;
  const hw = opts.halfWidth ?? 4;
  const gantry = opts.kidStart
    ? buildCheckeredStartGantry(hw, label || 'START')
    : buildIndustrialStartGantry(label);
  gantry.scale.setScalar(opts.kidStart ? 1 : 1.1);
  const { pos, frame } = placeAtTrack(curve, finishT, 0, 0);
  gantry.position.copy(pos);
  gantry.rotation.y = frame.rot ?? 0;
  gantry.position.y += roadY(curve, finishT);
  world.add(gantry);
}

export function placeWideCheckeredIfMissing(world, curve, hw, finishT) {
  if (worldHasNamed(world, 'checkered-start-wide')) return;
  world.add(buildWideCheckeredStart(curve, hw, finishT));
}

/**
 * Minimal quality pass — industrial start gantry + checkered strip only.
 * Checkpoints, boosts, crowds, and vistas are authored in HeroKits.
 */
export function applyReferenceQualityPass(world, scene, curve, hw, bounds, arenaType, opts = {}) {
  const finishT = opts.finishT ?? 0;
  const skip = opts.skip || {};

  if (!skip.gantry) {
    const gantryLabel = opts.startLabel || (opts.kidStart ? 'START' : getStartLabel(arenaType));
    placeIndustrialGantry(world, curve, finishT, gantryLabel, {
      kidStart: !!opts.kidStart,
      halfWidth: hw,
    });
  }
  if (!skip.checkered) placeWideCheckeredIfMissing(world, curve, hw, finishT);

  world.userData.referenceQuality = arenaType;
  return world;
}

/** Per-track skip flags — avoid duplicating fully-authored hero sets. */
export const REFERENCE_QUALITY_SKIP = {
  desert_dunes_01: { gantry: true, checkered: true },
  crystal_palace_01: { checkered: true },
  sky_island_01: { checkered: true },
  volcano_canyon_01: { checkered: true },
  cyber_boulevard_01: { checkered: true },
  ice_cavern_01: { checkered: true },
  underwater_temple_01: { checkered: true },
  moonlight_cavern_01: { checkered: true },
  forest_maze_01: { checkered: true },
  cyber_boulevard_01: { checkered: true },
};
