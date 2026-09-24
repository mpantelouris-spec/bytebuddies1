/**
 * CodeRacerSplines.js — Smooth closed loops (even control points, no duplicate close).
 * Hand-placed sparse points + CatmullRom make the road look crooked.
 */
function coastalElevation(points) {
  const n = points.length;
  return points.map((p, i) => {
    const t = i / Math.max(1, n - 1);
    const wave = Math.sin(t * Math.PI * 2) * 1.65 + Math.sin(t * Math.PI * 4 + 0.9) * 0.6;
    return { x: p.x, y: (p.y ?? 0) + wave, z: p.z };
  });
}

/** Coastal loop — inlined (avoid TenPremiumTracks + THREE on critical import path). */
const SUNSET_COAST_RAW = [
  { x: 0, z: 60 }, { x: 28, z: 54 }, { x: 46, z: 38 }, { x: 48, z: 12 },
  { x: 42, z: -18 }, { x: 18, z: -36 }, { x: -8, z: -38 }, { x: -32, z: -28 },
  { x: -48, z: 0 }, { x: -44, z: 32 }, { x: -18, z: 50 }, { x: 0, z: 60 },
];
function loop(rx, rz, n = 24, y = 0) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const a = Math.PI / 2 + t * Math.PI * 2;
    const yy = typeof y === 'function' ? y(t) : y;
    pts.push({ x: Math.cos(a) * rx, y: yy, z: Math.sin(a) * rz });
  }
  return pts;
}

/** Rounded-rectangle stadium (power 2 = ellipse, 4 = long straights + round corners). */
function stadium(rx, rz, n = 28, power = 3.2, y = 0) {
  const pts = [];
  const p = 2 / power;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const a = Math.PI / 2 + t * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const x = Math.sign(c) * rx * Math.pow(Math.abs(c), p);
    const z = Math.sign(s) * rz * Math.pow(Math.abs(s), p);
    const yy = typeof y === 'function' ? y(t) : y;
    pts.push({ x, y: yy, z });
  }
  return pts;
}

/**
 * F1-style circuit — long straights + tight hairpin corners (stadium layout).
 */
function buildF1Circuit(n = 40, rx = 58, rz = 38, power = 5.15) {
  const pts = [];
  const p = 2 / power;
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const a = Math.PI / 2 + t * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    pts.push({
      x: Math.sign(c) * rx * Math.pow(Math.abs(c), p),
      y: 0,
      z: Math.sign(s) * rz * Math.pow(Math.abs(s), p),
    });
  }
  return pts;
}

/** Figure-8 circuit — lemniscate loop (crosses at center, two lobes). */
function buildFigure8Circuit(n = 52, rx = 52, rz = 40) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = Math.PI / 2 + (i / n) * 2 * Math.PI;
    pts.push({
      x: rx * Math.sin(a),
      y: 0,
      z: rz * Math.sin(2 * a),
    });
  }
  return pts;
}

/** Mode 1 — Sunset Cove: scenic coastal loop (pier → ocean bend → bay return) */
export const SUNSET_COVE_SPLINE = coastalElevation(SUNSET_COAST_RAW);

/** Mode 2 — Candy Carnival: figure-8 midway circuit */
export const CANDY_CARNIVAL_SPLINE = buildFigure8Circuit(52, 54, 42);

/** Mode 6 — Frost Peak: alpine oval with gentle downhill */
export const FROST_PEAK_SPLINE = loop(46, 40, 24, (t) => 8 - t * 5);

/** Mode 7 — Lava Foundry: compact stadium */
export const LAVA_FOUNDRY_SPLINE = stadium(36, 30, 28, 2.8, 0);

/**
 * Mode 8 — Star Station: cosmic skyway figure-8. The two lobes meet at the
 * centre 12 units apart vertically, so one half flies over the other.
 */
export const STAR_STATION_SPLINE = (() => {
  const pts = [];
  const n = 56;
  for (let i = 0; i < n; i++) {
    const a = Math.PI / 2 + (i / n) * 2 * Math.PI;
    pts.push({
      x: 54 * Math.sin(a),
      y: 8 + 6 * Math.cos(a) + Math.sin(2 * a) * 1.2,
      z: 40 * Math.sin(2 * a),
    });
  }
  return pts;
})();

/** Mode 10 — Thunder Ridge: flowing oval with a mild pinch (still C2-smooth) */
export const THUNDER_RIDGE_SPLINE = (() => {
  const pts = [];
  for (let i = 0; i < 28; i++) {
    const t = i / 28;
    const a = Math.PI / 2 + t * Math.PI * 2;
    pts.push({
      x: Math.cos(a) * 44 + Math.sin(2 * a) * 4,
      y: 2 + t * 8,
      z: Math.sin(a) * 40,
    });
  }
  return pts;
})();

/** Mode 3 — Neon Metro: stadium with round corners */
export const NEON_METRO_SPLINE = stadium(46, 38, 28, 3.4, 0);

/** Mode 4 — Cloud Citadel: high oval, gentle waves (no step dips) */
export const CLOUD_CITADEL_SPLINE = loop(46, 40, 24, (t) => 10 + Math.sin(t * Math.PI * 2) * 1.4);

/** Mode 5 — Jungle Ruins: smooth jungle oval */
export const JUNGLE_RUINS_SPLINE = loop(44, 40, 24, 0);

/** Mode 9 — Fairy Glen: garden oval */
export const FAIRY_GLEN_SPLINE = loop(42, 38, 24, 0);

/** Cosmic bonus tracks — elevated space highways (distinct layouts, shared visuals). */
function cosmicFigure8(n, rx, rz, y0, yAmp, yRipple = 0.2) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = Math.PI / 2 + (i / n) * 2 * Math.PI;
    pts.push({
      x: rx * Math.sin(a),
      y: y0 + yAmp * Math.cos(a) + Math.sin(2 * a) * (yAmp * yRipple),
      z: rz * Math.sin(2 * a),
    });
  }
  return pts;
}

function cosmicStadium(rx, rz, n, power, y0, yWave) {
  return stadium(rx, rz, n, power, (t) => y0 + Math.sin(t * Math.PI * 2) * yWave);
}

export const COSMIC_NEBULA_RING_SPLINE = cosmicStadium(50, 42, 36, 3.2, 11, 4);
export const COSMIC_WORMHOLE_RUN_SPLINE = cosmicFigure8(54, 44, 30, 9, 7, 0.28);
export const COSMIC_ASTEROID_BELT_SPLINE = loop(58, 46, 32, (t) => 10 + Math.sin(t * Math.PI * 4) * 2.5);
export const COSMIC_TWIN_LOOP_SPLINE = cosmicFigure8(58, 58, 44, 10, 7, 0.22);
export const COSMIC_SUPERNOVA_SPLINE = buildF1Circuit(44, 62, 40, 5.2).map((p, i, arr) => ({
  ...p,
  y: 12 + Math.sin((i / arr.length) * Math.PI * 2) * 3.5,
}));
/** Egg-shaped loop: wide sweeping arc on one side, tighter hairpin on the other, big climb. */
export const COSMIC_COMET_ARC_SPLINE = (() => {
  const pts = [];
  const n = 40;
  for (let i = 0; i < n; i++) {
    const a = Math.PI / 2 + (i / n) * Math.PI * 2;
    pts.push({
      x: 58 * Math.cos(a),
      y: 10 + 6 * Math.sin(a),
      z: 40 * Math.sin(a) - 10 * Math.cos(2 * a),
    });
  }
  return pts;
})();
export const COSMIC_ORBIT_CROSS_SPLINE = cosmicFigure8(56, 66, 30, 10, 8, 0.18);
/** Three-lobed flower loop with a climb and dip on every lobe. */
export const COSMIC_PULSAR_SPIRAL_SPLINE = (() => {
  const pts = [];
  const n = 60;
  for (let i = 0; i < n; i++) {
    const a = Math.PI / 2 + (i / n) * Math.PI * 2;
    const rad = 48 + 9 * Math.cos(3 * a);
    pts.push({
      x: Math.cos(a) * rad,
      y: 10 + 5 * Math.sin(3 * a),
      z: Math.sin(a) * rad * 0.9,
    });
  }
  return pts;
})();
export const COSMIC_VOID_OVAL_SPLINE = loop(50, 44, 30, (t) => 9 + Math.cos(t * Math.PI * 2) * 4);
export const COSMIC_EVENT_HORIZON_SPLINE = cosmicFigure8(52, 44, 34, 9, 6.5, 0.32);
