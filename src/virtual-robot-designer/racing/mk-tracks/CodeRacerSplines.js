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


/**
 * Polygon circuit with rounded corners — technical layouts with real straights and
 * corners (so every turn can be coded as its own block). Points are emitted ~every
 * 3.5 m so the Catmull-Rom curve hugs the design.
 */
function roundedPolygon(corners, radius = 10, y = 0) {
  const n = corners.length;
  const out = [];
  const step = 3.5;
  const V = (p) => ({ x: p[0], z: p[1] });
  const fillets = corners.map((c, i) => {
    const P = V(c), A = V(corners[(i - 1 + n) % n]), B = V(corners[(i + 1) % n]);
    const da = { x: A.x - P.x, z: A.z - P.z }, db = { x: B.x - P.x, z: B.z - P.z };
    const la = Math.hypot(da.x, da.z), lb = Math.hypot(db.x, db.z);
    const ua = { x: da.x / la, z: da.z / la }, ub = { x: db.x / lb, z: db.z / lb };
    const cosT = Math.max(-1, Math.min(1, ua.x * ub.x + ua.z * ub.z));
    const theta = Math.acos(cosT);
    const r = Math.min(radius, (Math.min(la, lb) * 0.45) * Math.tan(theta / 2));
    const d = r / Math.tan(theta / 2);
    const p1 = { x: P.x + ua.x * d, z: P.z + ua.z * d };
    const p2 = { x: P.x + ub.x * d, z: P.z + ub.z * d };
    const bis = { x: ua.x + ub.x, z: ua.z + ub.z };
    const bl = Math.hypot(bis.x, bis.z) || 1;
    const cd = r / Math.sin(theta / 2);
    const C = { x: P.x + (bis.x / bl) * cd, z: P.z + (bis.z / bl) * cd };
    return { p1, p2, C, r };
  });
  for (let i = 0; i < n; i++) {
    const f = fillets[i], g = fillets[(i + 1) % n];
    // arc around corner i from p1 to p2
    const a1 = Math.atan2(f.p1.z - f.C.z, f.p1.x - f.C.x);
    let a2 = Math.atan2(f.p2.z - f.C.z, f.p2.x - f.C.x);
    let da = a2 - a1;
    while (da > Math.PI) da -= Math.PI * 2;
    while (da < -Math.PI) da += Math.PI * 2;
    const arcN = Math.max(2, Math.ceil(Math.abs(da) * f.r / step));
    for (let k = 0; k < arcN; k++) {
      const a = a1 + (da * k) / arcN;
      out.push({ x: f.C.x + Math.cos(a) * f.r, z: f.C.z + Math.sin(a) * f.r });
    }
    // straight from p2 of this corner to p1 of the next
    const L = Math.hypot(g.p1.x - f.p2.x, g.p1.z - f.p2.z);
    const segN = Math.max(1, Math.ceil(L / step));
    for (let k = 0; k < segN; k++) {
      out.push({ x: f.p2.x + ((g.p1.x - f.p2.x) * k) / segN, z: f.p2.z + ((g.p1.z - f.p2.z) * k) / segN });
    }
  }
  return out.map((p, i) => ({ x: p.x, y: typeof y === 'function' ? y(i / out.length) : y, z: p.z }));
}

/** Smooth polar loop r(a) = base + wobble — flowing S-bends / lobes. */
function polarLoop(base, amp, lobes, n = 96, y = 0, squashZ = 1) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const a = Math.PI / 2 + t * Math.PI * 2;
    const r = base + amp * Math.sin(lobes * a);
    pts.push({ x: Math.cos(a) * r, y: typeof y === 'function' ? y(t) : y, z: Math.sin(a) * r * squashZ });
  }
  return pts;
}

/** Peanut / dog-bone — two hairpins joined by pinched curves. */
function peanutLoop(rx, rz, pinch = 0.25, n = 96, y = 0) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const a = Math.PI / 2 + t * Math.PI * 2;
    pts.push({ x: Math.cos(a) * rx, y: typeof y === 'function' ? y(t) : y, z: Math.sin(a) * rz * (1 - pinch + pinch * Math.cos(2 * a)) });
  }
  return pts;
}

/** Mode 1 — Sunset Cove: scenic coastal loop (pier → ocean bend → bay return) */
export const SUNSET_COVE_SPLINE = coastalElevation(SUNSET_COAST_RAW);

/** Mode 2 — Candy Carnival: figure-8 midway circuit */
export const CANDY_CARNIVAL_SPLINE = buildFigure8Circuit(52, 54, 42);

/** Mode 6 — Frost Peak: alpine oval with gentle downhill */
/** Ice Valley — peanut with a hairpin at each end (difficulty 5). */
export const FROST_PEAK_SPLINE = peanutLoop(56, 38, 0.3, 96, (t) => 5.5 + 2.5 * Math.cos(t * Math.PI * 2));

/** Mode 7 — Lava Foundry: compact stadium */
/** Volcano Run — M-shape: long straight, then a sharp V dip across the top (difficulty 7). */
export const LAVA_FOUNDRY_SPLINE = roundedPolygon([[-50, -34], [50, -34], [50, 36], [22, 36], [0, 8], [-22, 36], [-50, 36]], 9, 0);

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
/** City Circuit — L-shaped city blocks, six 90° corners (difficulty 2). */
export const NEON_METRO_SPLINE = roundedPolygon([[-50, -36], [50, -36], [50, 4], [6, 4], [6, 36], [-50, 36]], 11, 0);

/** Mode 4 — Cloud Citadel: high oval, gentle waves (no step dips) */
export const CLOUD_CITADEL_SPLINE = loop(46, 40, 24, (t) => 10 + Math.sin(t * Math.PI * 2) * 1.4);

/** Mode 5 — Jungle Ruins: smooth jungle oval */
/** Jungle Ruins — snake S with eight corners and two switchbacks (difficulty 8). */
export const JUNGLE_RUINS_SPLINE = roundedPolygon([[-56, -42], [56, -42], [56, -12], [-14, -12], [-14, 14], [56, 14], [56, 42], [-56, 42]], 10, 0);

/** Mode 9 — Fairy Glen: garden oval */
/** Forest Trail — three flowing lobes with S-bends between them (difficulty 4). */
export const FAIRY_GLEN_SPLINE = polarLoop(42, 8, 3, 108, 0);

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
/** Lopsided figure-8: a big loop round one wormhole, a tight one round the other. */
export const COSMIC_WORMHOLE_RUN_SPLINE = (() => {
  const pts = [];
  const n = 60;
  for (let i = 0; i < n; i++) {
    const a = Math.PI / 2 + (i / n) * Math.PI * 2;
    pts.push({
      x: 56 * Math.sin(a),
      y: 9 + 7 * Math.cos(a) + Math.sin(2 * a) * 2,
      z: 40 * Math.sin(2 * a) * (1 + 0.45 * Math.sin(a)),
    });
  }
  return pts;
})();
/** Wavy oval: the road weaves in and out past five clusters of rocks. */
export const COSMIC_ASTEROID_BELT_SPLINE = (() => {
  const pts = [];
  const n = 60;
  for (let i = 0; i < n; i++) {
    const a = Math.PI / 2 + (i / n) * Math.PI * 2;
    const rad = 1 + 0.13 * Math.sin(5 * a);
    pts.push({ x: 58 * Math.cos(a) * rad, y: 10 + Math.sin(a * 2) * 2.5, z: 44 * Math.sin(a) * rad });
  }
  return pts;
})();
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
/** D-shaped oval: one long straight past the black hole, one big sweeping curve. */
export const COSMIC_VOID_OVAL_SPLINE = (() => {
  const pts = [];
  const n = 48;
  for (let i = 0; i < n; i++) {
    const a = Math.PI / 2 + (i / n) * Math.PI * 2;
    const s = Math.sin(a);
    pts.push({ x: 60 * Math.cos(a), y: 9 + Math.cos(a) * 4, z: s > 0 ? 46 * s : 12 * s });
  }
  return pts;
})();
/** Tight, pointed figure-8 (a lemniscate): the hardest track, cutting close to the black hole. */
export const COSMIC_EVENT_HORIZON_SPLINE = (() => {
  const pts = [];
  const n = 64;
  for (let i = 0; i < n; i++) {
    const t = Math.PI / 2 + (i / n) * Math.PI * 2;
    const d = 1 + Math.sin(t) ** 2;
    pts.push({ x: 64 * Math.cos(t) / d, y: 9 + 6.5 * Math.sin(t), z: 70 * Math.sin(t) * Math.cos(t) / d });
  }
  return pts;
})();
