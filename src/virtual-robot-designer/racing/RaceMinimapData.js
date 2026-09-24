/** Rainbow segment colours for minimap track lines. */
import { createCircuitCurve, MARIO_CIRCUIT_RAINBOW, MARIO_CIRCUIT_CANDY, MARIO_CIRCUIT_DRAGON } from './MarioKartTrackBuilder.js';
import { VOLCANO_DRIFT_SPLINE, ZONE_VOLCANO_DRIFT } from './zone-configs/ZoneConfig_VolcanoDrift.js';
import { ZONE_RAINBOW_ROAD } from './zone-configs/ZoneConfig_RainbowRoad.js';
import { ZONE_SUNNY_CIRCUIT } from './zone-configs/ZoneConfig_SunnyCircuit.js';
import { ZONE_DRAGON_SKYWAY } from './zone-configs/ZoneConfig_DragonSkyway.js';
import { MK_TRACKS, buildMKZoneConfig } from './mk-tracks/MKTrackRegistry.js';
import { BIOME_TRACKS, BIOME_ARENA_TYPES } from './mk-tracks/BiomeTrackRegistry.js';

export const MINIMAP_RAINBOW = [
  '#ff3344', '#ff8822', '#ffee22', '#33cc55', '#3388ff', '#6644cc', '#cc44ff',
];

/**
 * Sample a race spline into 2D top-down minimap data.
 * @param {import('three').Curve} curve
 */
export function buildMinimapFromCurve(curve, {
  segments = [],
  samples = 140,
  finishT = 0,
  checkpointTs = [],
} = {}) {
  const points = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const p = curve.getPointAt(t);
    points.push({ t, x: p.x, z: p.z });
  }

  const bounds = points.reduce((b, p) => ({
    minX: Math.min(b.minX, p.x),
    maxX: Math.max(b.maxX, p.x),
    minZ: Math.min(b.minZ, p.z),
    maxZ: Math.max(b.maxZ, p.z),
  }), { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity });

  const pad = 6;
  bounds.minX -= pad;
  bounds.maxX += pad;
  bounds.minZ -= pad;
  bounds.maxZ += pad;

  const startPt = curve.getPointAt(finishT);
  const checkpoints = checkpointTs.map((t, i) => {
    const p = curve.getPointAt(t);
    return { t, x: p.x, z: p.z, index: i + 1 };
  });

  return {
    version: 17,
    points,
    bounds,
    segments: segments.map((s, i) => ({
      ...s,
      color: MINIMAP_RAINBOW[i % MINIMAP_RAINBOW.length],
    })),
    start: { x: startPt.x, z: startPt.z, t: finishT },
    checkpoints,
    isCircuit: true,
  };
}

/** Map world XZ → canvas with uniform scale so the circuit keeps its true shape. */
export function mapWorldToCanvas(x, z, bounds, size, pad = 10) {
  const inner = size - pad * 2;
  const w = bounds.maxX - bounds.minX || 1;
  const h = bounds.maxZ - bounds.minZ || 1;
  const scale = inner / Math.max(w, h);
  const drawW = w * scale;
  const drawH = h * scale;
  const offX = pad + (inner - drawW) * 0.5;
  const offY = pad + (inner - drawH) * 0.5;
  return {
    cx: offX + (x - bounds.minX) * scale,
    cy: offY + (z - bounds.minZ) * scale,
  };
}

/** @deprecated alias kept for imports */
export function mapWorldToCanvasUniform(x, z, bounds, size, pad = 10) {
  return mapWorldToCanvas(x, z, bounds, size, pad);
}

export function normalizeTrackT(t) {
  if (!Number.isFinite(t)) return 0;
  let tt = t % 1;
  if (tt < 0) tt += 1;
  return tt;
}

export function isTInSegment(t, seg) {
  if (!seg) return false;
  const tt = normalizeTrackT(t);
  if (seg.startT <= seg.endT) return tt >= seg.startT && tt < seg.endT;
  return tt >= seg.startT || tt < seg.endT;
}

export function colorForEdge(tA, tB, segments) {
  const midT = normalizeTrackT((tA + tB) * 0.5);
  if (segments?.length) return segmentColorAtT(segments, midT);
  return MINIMAP_RAINBOW[Math.floor(midT * MINIMAP_RAINBOW.length) % MINIMAP_RAINBOW.length];
}

export function getSectionAtT(segments, t) {
  if (!segments?.length) return null;
  const tt = normalizeTrackT(t);
  for (const seg of segments) {
    if (seg.startT <= seg.endT) {
      if (tt >= seg.startT && tt < seg.endT) return seg;
    } else if (tt >= seg.startT || tt < seg.endT) {
      return seg;
    }
  }
  return segments[segments.length - 1];
}

export function getNextSection(segments, t) {
  if (!segments?.length) return null;
  const current = getSectionAtT(segments, t);
  const idx = Math.max(0, segments.indexOf(current));
  return segments[(idx + 1) % segments.length];
}

/** True when trackT is within [from, to] on a 0–1 circuit (handles wrap). */
export function isTAhead(trackT, from, span = 0.12) {
  const t = normalizeTrackT(trackT);
  const a = normalizeTrackT(from);
  const b = normalizeTrackT(from + span);
  if (b >= a) return t >= a && t <= b;
  return t >= a || t <= b;
}

export function segmentColorAtT(segments, t) {
  const seg = getSectionAtT(segments, t);
  return seg?.color || MINIMAP_RAINBOW[0];
}

const _minimapCache = new Map();
const MINIMAP_CACHE_VERSION = 37;

function createBiomeMinimapCurve(spline, arenaType) {
  const track = BIOME_TRACKS.find((t) => t.arenaType === arenaType);
  if (track?.trackShape === 'coastal') {
    return createCircuitCurve(spline, true, 0.22, 'centripetal');
  }
  if (track?.trackShape === 's-curve') {
    return createCircuitCurve(spline, true, 0.10, 'catmullrom');
  }
  if (track?.trackShape === 'figure-8') {
    return createCircuitCurve(spline, true, 0.16, 'centripetal');
  }
  if (BIOME_ARENA_TYPES.has(arenaType)) {
    return createCircuitCurve(spline, true, 0.28, 'centripetal');
  }
  return createCircuitCurve(spline);
}

const ALL_TRACK_SPLINE_SOURCES = [...MK_TRACKS, ...BIOME_TRACKS];

const MK_MINIMAP_SPLINES = Object.fromEntries(
  ALL_TRACK_SPLINE_SOURCES.map((t) => [t.arenaType, () => t.spline]),
);

const COURSE_MINIMAP_BUILDERS = {
  rainbow_road: () => MARIO_CIRCUIT_RAINBOW,
  street_grand_prix: () => MARIO_CIRCUIT_RAINBOW,
  circuit_sprint: () => MARIO_CIRCUIT_RAINBOW,
  rainbow_road_master: () => MARIO_CIRCUIT_RAINBOW,
  sunny_circuit: () => MARIO_CIRCUIT_CANDY,
  dragon_skyway: () => MARIO_CIRCUIT_DRAGON,
  volcano_drift: () => VOLCANO_DRIFT_SPLINE,
  ...MK_MINIMAP_SPLINES,
};

const MK_ZONE_RACING = Object.fromEntries(
  ALL_TRACK_SPLINE_SOURCES.map((t) => [t.arenaType, buildMKZoneConfig(t).racing]),
);

const COURSE_ZONE_RACING = {
  rainbow_road: ZONE_RAINBOW_ROAD.racing,
  street_grand_prix: ZONE_RAINBOW_ROAD.racing,
  circuit_sprint: ZONE_RAINBOW_ROAD.racing,
  rainbow_road_master: ZONE_RAINBOW_ROAD.racing,
  sunny_circuit: ZONE_SUNNY_CIRCUIT.racing,
  dragon_skyway: ZONE_DRAGON_SKYWAY.racing,
  volcano_drift: ZONE_VOLCANO_DRIFT.racing,
  ...MK_ZONE_RACING,
};

/** Resolve minimap data from stats payload or build from course config (cached). */
export function resolveRaceMinimap(challenge, fromStats) {
  const arenaType = challenge?.arenaType;
  const cacheKey = (arenaType && BIOME_ARENA_TYPES.has(arenaType))
    ? arenaType
    : (challenge?.linkedRaceCourse || challenge?.id || arenaType);

  if (fromStats?.version >= 9 && fromStats?.points?.length && !arenaType) {
    return fromStats;
  }

  if (!cacheKey) return fromStats?.points?.length ? fromStats : null;
  const cacheId = `${MINIMAP_CACHE_VERSION}:${cacheKey}`;
  if (_minimapCache.has(cacheId)) {
    return _minimapCache.get(cacheId);
  }

  const zoneRacing = COURSE_ZONE_RACING[cacheKey];
  const racing = zoneRacing
    ? { ...zoneRacing, ...(challenge?.racing || {}) }
    : (challenge?.racing || {});
  const spline = racing.splinePoints || COURSE_MINIMAP_BUILDERS[cacheKey]?.();
  if (!spline) return fromStats?.points?.length ? fromStats : null;
  const curve = BIOME_ARENA_TYPES.has(cacheKey)
    ? createBiomeMinimapCurve(spline, cacheKey)
    : createCircuitCurve(spline);
  const sampleCount = BIOME_ARENA_TYPES.has(cacheKey) ? 200 : 140;
  const data = buildMinimapFromCurve(curve, {
    segments: racing.trackSegments || challenge?.trackSegments || [],
    finishT: racing.finishT ?? 0,
    checkpointTs: racing.checkpointTs || [],
    samples: sampleCount,
  });
  _minimapCache.set(cacheId, data);
  return data;
}
