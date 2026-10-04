/**
 * RouteGuide.js — turn-by-turn coding guide for a race circuit.
 *
 * Walks the track spline from the start grid and splits it into straights and
 * bends, then expresses each piece as the blocks a student would use:
 *   Move forward N  ·  Curve left D° over N steps  ·  Curve right D° over N steps
 * Step counts use the race engine's own step length for the given Set speed, and
 * are rounded with carry so the whole lap still adds up (heading closes at 360°).
 */

// Mirrors LiveLabPage: MOVE_STEP_SIZE × wheel speed (1.2) × RACE_SPEED_BOOST
const MOVE_STEP_SIZE = 2.4;
const WHEELS_SPD = 1.2;
const RACE_SPEED_BOOST = 4.2;

export function raceStepLength(speedPct = 60) {
  return MOVE_STEP_SIZE * WHEELS_SPD * RACE_SPEED_BOOST * (speedPct / 100);
}

const wrap = (a) => {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
};

/**
 * @param {THREE.Curve} curve  closed race spline
 * @param {number} startT      spawn position on the spline (0..1)
 * @param {object} [opts]
 * @param {number} [opts.speed=60]        Set speed % the guide assumes
 * @param {number} [opts.straightRadius]  bends gentler than this (m) count as straight
 * @returns {{ speed:number, stepLength:number, steps:Array }}
 */
export function computeRouteGuide(curve, startT = 0, { speed = 60, straightRadius = 160, stepRound = 0.5, degRound = 5, maxBendDeg = 100, maxBendSteps = 3.5, startPose = null } = {}) {
  if (!curve?.getPointAt) return null;
  const len = curve.getLength();
  const stepLen = raceStepLength(speed);
  const N = Math.max(400, Math.round(len / 0.6));
  const samples = [];
  for (let i = 0; i <= N; i++) {
    const t = (((startT + i / N) % 1) + 1) % 1;
    const tan = curve.getTangentAt(t);
    samples.push({ t, h: Math.atan2(tan.x, tan.z) });
  }
  const ds = len / N;
  // smoothed curvature (rad per metre) over a ~5 m window
  const raw = [];
  for (let i = 0; i < N; i++) raw.push(wrap(samples[i + 1].h - samples[i].h) / ds);
  const win = Math.max(1, Math.round(2.5 / ds));
  const k = raw.map((_, i) => {
    let s = 0, c = 0;
    for (let j = -win; j <= win; j++) { s += raw[(i + j + N) % N]; c++; }
    return s / c;
  });
  const kStraight = 1 / straightRadius;
  const kind = k.map((v) => (Math.abs(v) < kStraight ? 0 : Math.sign(v)));

  // runs of the same kind
  let runs = [];
  for (let i = 0; i < N; i++) {
    const last = runs[runs.length - 1];
    const dh = wrap(samples[i + 1].h - samples[i].h);
    if (last && last.kind === kind[i]) {
      last.n++;
      last.dh += dh;
    } else {
      runs.push({ kind: kind[i], start: i, n: 1, dh });
    }
  }
  // absorb tiny wiggles (< 5 m) into their neighbour
  const minN = Math.round(5 / ds);
  let changed = true;
  while (changed && runs.length > 1) {
    changed = false;
    for (let i = 0; i < runs.length; i++) {
      if (runs[i].n >= minN) continue;
      const tgt = i > 0 ? i - 1 : i + 1;
      runs[tgt].n += runs[i].n;
      runs[tgt].dh += runs[i].dh;
      if (tgt > i) runs[tgt].start = runs[i].start;
      runs.splice(i, 1);
      changed = true;
      break;
    }
    // merge neighbours that ended up the same kind
    for (let i = runs.length - 1; i > 0; i--) {
      if (runs[i].kind === runs[i - 1].kind) {
        runs[i - 1].n += runs[i].n;
        runs[i - 1].dh += runs[i].dh;
        runs.splice(i, 1);
        changed = true;
      }
    }
  }

  // Long bends become several shorter pieces so each arc hugs the road
  const split = [];
  runs.forEach((r) => {
    if (r.kind === 0) { split.push(r); return; }
    // A real corner (60–100°) stays one block; long gentle sweeps are split by length
    const deg = Math.abs(r.dh * 180 / Math.PI);
    const isCorner = deg > 60 && deg <= maxBendDeg && (r.n * ds) <= 5 * stepLen;
    const byLen = isCorner ? 1 : Math.ceil((r.n * ds) / (maxBendSteps * stepLen));
    const k = Math.max(1, Math.ceil(deg / maxBendDeg), byLen);
    let used = 0;
    for (let i = 0; i < k; i++) {
      const n = i === k - 1 ? r.n - used : Math.round(r.n / k);
      let dh = 0;
      for (let j = r.start + used; j < r.start + used + n; j++) dh += wrap(samples[j + 1].h - samples[j].h);
      split.push({ kind: r.kind, start: r.start + used, n, dh });
      used += n;
    }
  });
  runs = split;

  // Closed-loop block builder: drive the blocks as we write them so rounding
  // errors are corrected by the next piece instead of piling up.
  const roundTo = (v, q) => Math.round(v / q) * q;
  // Start exactly where (and facing where) the kart sits on the grid
  const P0 = curve.getPointAt(startT);
  let x = startPose?.x ?? P0.x;
  let z = startPose?.z ?? P0.z;
  let a = Number.isFinite(startPose?.angle) ? startPose.angle : samples[0].h;
  const endPt = (r) => curve.getPointAt(samples[Math.min(N, r.start + r.n)].t);
  const drive = (dist, rot) => {
    const sub = Math.max(4, Math.ceil(dist / 0.5));
    for (let i = 0; i < sub; i++) {
      a += rot / sub;
      x += Math.sin(a) * (dist / sub);
      z += Math.cos(a) * (dist / sub);
    }
  };
  const steps = [];
  runs.forEach((r, ri) => {
    const E = endPt(r);
    const t0 = samples[r.start].t;
    const t1 = samples[Math.min(N, r.start + r.n)].t;
    if (r.kind === 0) {
      const L = (E.x - x) * Math.sin(a) + (E.z - z) * Math.cos(a);
      const n = Math.max(stepRound, roundTo(L / stepLen, stepRound));
      drive(n * stepLen, 0);
      steps.push({ block: 'move_forward', steps: n, t0, t1 });
      return;
    }
    // Aim the bend so the following straight points at that straight's end
    const next = runs[(ri + 1) % runs.length];
    let targetH;
    if (next && next.kind === 0 && ri + 1 < runs.length) {
      const E2 = endPt(next);
      targetH = Math.atan2(E2.x - E.x, E2.z - E.z);
    } else {
      const tn = curve.getTangentAt(t1);
      targetH = Math.atan2(tn.x, tn.z);
    }
    // Prefer friendly multiples of 5°, but use the exact degree when the next
    // straight is long enough for the rounding to push the kart off the road.
    const rawDeg = (wrap(targetH - a) * 180) / Math.PI;
    let theta = roundTo(rawDeg, degRound);
    if (next) {
      const nextLen = next.n * ds;
      if (nextLen * Math.sin(Math.abs(theta - rawDeg) * Math.PI / 180) > 0.8) theta = Math.round(rawDeg);
    }
    const th = (theta * Math.PI) / 180;
    const chordDir = a + th / 2;
    const c = (E.x - x) * Math.sin(chordDir) + (E.z - z) * Math.cos(chordDir);
    const L = Math.abs(th) < 1e-3 ? c : (c * th) / (2 * Math.sin(th / 2));
    const n = Math.max(stepRound, roundTo(Math.max(0, L) / stepLen, stepRound));
    drive(n * stepLen, th);
    if (Math.abs(theta) < degRound) steps.push({ block: 'move_forward', steps: n, t0, t1 });
    else steps.push({ block: theta > 0 ? 'curve_left' : 'curve_right', degrees: Math.abs(theta), steps: n, t0, t1 });
  });
  // merge back-to-back forwards
  for (let i = steps.length - 1; i > 0; i--) {
    if (steps[i].block === 'move_forward' && steps[i - 1].block === 'move_forward') {
      steps[i - 1].steps += steps[i].steps;
      steps[i - 1].t1 = steps[i].t1;
      steps.splice(i, 1);
    }
  }
  // The finish line is a wide gate, so pieces in the last few metres of the lap
  // (often a tight twist back onto the grid) are never needed — drop them.
  let total = steps.reduce((a, st) => a + st.steps * stepLen, 0);
  while (steps.length > 2) {
    const last = steps[steps.length - 1];
    const lastLen = last.steps * stepLen;
    const sharp = last.block !== 'move_forward' && last.degrees / Math.max(0.5, last.steps) > 90;
    if (total - lastLen < len - 9 && !sharp) break;
    total -= lastLen;
    steps.pop();
  }
  steps.forEach((s, i) => { s.index = i + 1; s.label = describeStep(s); });
  return { speed, stepLength: stepLen, steps, laps: 1 };
}

export function describeStep(s) {
  const n = Number.isInteger(s.steps) ? s.steps : s.steps.toFixed(1);
  if (s.block === 'move_forward') return `Move forward ${n}`;
  const dir = s.block === 'curve_left' ? 'left' : 'right';
  return `Curve ${dir} ${s.degrees}°, ${n} steps`;
}

/**
 * Drive the guide with the same maths the race engine uses (turn spread over the
 * block's distance) and report the worst drift from the road centre-line.
 */
export function simulateRouteGuide(curve, startT, guide, startPose = null) {
  const p0 = curve.getPointAt(startT);
  const tan = curve.getTangentAt(startT);
  let x = startPose?.x ?? p0.x, z = startPose?.z ?? p0.z;
  let a = Number.isFinite(startPose?.angle) ? startPose.angle : Math.atan2(tan.x, tan.z);
  const pts = curve.getSpacedPoints(800);
  let worst = 0;
  const check = () => {
    let best = Infinity;
    for (const q of pts) { const d = (q.x - x) ** 2 + (q.z - z) ** 2; if (d < best) best = d; }
    worst = Math.max(worst, Math.sqrt(best));
  };
  guide.steps.forEach((s) => {
    const dist = s.steps * guide.stepLength;
    const rot = s.block === 'curve_left' ? (s.degrees * Math.PI) / 180 : s.block === 'curve_right' ? -(s.degrees * Math.PI) / 180 : 0;
    const sub = Math.max(8, Math.ceil(dist / 0.5));
    for (let i = 0; i < sub; i++) {
      a += rot / sub;
      x += Math.sin(a) * (dist / sub);
      z += Math.cos(a) * (dist / sub);
      if (i % 4 === 0) check();
    }
  });
  return { worstDrift: worst, end: { x, z }, endGap: Math.hypot(x - p0.x, z - p0.z) };
}
