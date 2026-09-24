/**
 * RacingRaceLogic.js — Checkpoints, laps, wrong-way, fall detection.
 */
import * as THREE from 'three';
import {
  activateBoost, updateBoostTimer, computeSpeedKmh,
  activateShield, activateMagnet, updateMagnetTimer, collectStar, recordPowerup,
} from './RacingPhysics.js';
import { closestTrackT } from './RacingTrackSystem.js';
import { sampleTrackFrame } from './GameWorldBuilder.js';
import { isOnLaunchStrip, RAINBOW_LAUNCH_ZONE } from './ProfessionalRainbowTrack.js';

/** Tile center (+0.2) + half tile height (0.18) — wheel contact on legacy tile ribbon tracks */
export const TILE_SURFACE_OFFSET = 0.38;
/** MarioKartTrackBuilder road deck offset above spline Y */
export const MK_ROAD_DECK_OFFSET = 0.02;
/** Flat MK asphalt deck top (MarioKartTrackBuilder road y=0.35 + 0.02) */
export const FLAT_ROAD_BASE_Y = 0.35;
export const FLAT_ROAD_SURFACE_Y = FLAT_ROAD_BASE_Y + MK_ROAD_DECK_OFFSET;
/** Extra origin lift so tyre sidewalls + chassis read above asphalt (visual only). */
export const KART_VISUAL_LIFT = 0.08;
/** Minimum gap between lowest mesh point and road surface. */
export const KART_CHASSIS_ROAD_GAP = 0.025;
/** Legacy default clearance when bbox is unavailable */
export const KART_CLEARANCE = 0.10;
/** buildRover wheel center Y (0.3) − tire radius (0.22) at model scale 1 */
export const ROVER_WHEEL_DROP = 0.08;

/** Road deck height above spline (or flat world Y). */
export function getRoadDeckOffset(scene) {
  if (scene?.userData?.raceRoadDeckOffset != null) return scene.userData.raceRoadDeckOffset;
  if (scene?.userData?.isRainbowRoad) return TILE_SURFACE_OFFSET;
  const mesh = scene?.userData?.racingConfig?.mesh;
  if (mesh === 'rainbow' || mesh === 'tile') return TILE_SURFACE_OFFSET;
  return MK_ROAD_DECK_OFFSET;
}

const _rayOrigin = new THREE.Vector3();
const _rayDir = new THREE.Vector3(0, -1, 0);

/** Raycast the built road mesh — most reliable surface height at (x, z). */
export function raycastRoadSurfaceY(scene, x, z, fallbackY = FLAT_ROAD_SURFACE_Y) {
  const mesh = scene?.userData?.raceRoadMesh;
  if (!mesh || x == null || z == null) return fallbackY;
  scene.updateMatrixWorld?.(true);
  _rayOrigin.set(x, 120, z);
  const raycaster = new THREE.Raycaster(_rayOrigin, _rayDir);
  const hits = raycaster.intersectObject(mesh, true);
  if (hits.length > 0) {
    // Never snap below the analytic deck — stray hits / coplanar geometry cause sinking.
    return Math.max(fallbackY - 0.02, hits[0].point.y);
  }
  return fallbackY;
}

export function roadSurfaceYAt(track3D, splineY, scene, trackT = null) {
  if (scene?.userData?.sampleKartRoadY && trackT != null && Number.isFinite(trackT)) {
    return scene.userData.sampleKartRoadY(trackT);
  }
  return track3D ? splineY + getRoadDeckOffset(scene) : FLAT_ROAD_SURFACE_Y;
}

/** Robot origin Y when wheels sit on the road surface at splineY / trackT. */
export function kartOriginYAt(track3D, splineY, wheelOriginOffset, scene, trackT = null, x = null, z = null) {
  const splineRoad = roadSurfaceYAt(track3D, splineY, scene, trackT);
  const roadY = (track3D && scene && x != null && z != null)
    ? raycastRoadSurfaceY(scene, x, z, splineRoad)
    : splineRoad;
  const off = wheelOriginOffset ?? KART_CLEARANCE;
  return roadY + off;
}

/** Distance from robot origin down to wheel contact (positive, position-invariant). */
export function measureKartWheelDrop(robot) {
  if (!robot) return KART_CLEARANCE;
  robot.updateMatrixWorld(true);
  const originY = robot.position.y;
  let wheelBottom = Infinity;
  robot.traverse((o) => {
    if (!o.isMesh) return;
    let node = o;
    let isWheelMesh = false;
    while (node) {
      if (node.userData?.isWheel) { isWheelMesh = true; break; }
      node = node.parent;
    }
    if (!isWheelMesh) return;
    const bb = new THREE.Box3().setFromObject(o);
    if (!bb.isEmpty()) wheelBottom = Math.min(wheelBottom, bb.min.y);
  });
  if (Number.isFinite(wheelBottom)) {
    return Math.max(KART_CLEARANCE * (robot.scale?.x || 1), originY - wheelBottom + 0.002);
  }
  const bbox = new THREE.Box3().setFromObject(robot);
  if (!bbox.isEmpty()) return Math.max(KART_CLEARANCE * (robot.scale?.x || 1), originY - bbox.min.y);
  return ROVER_WHEEL_DROP * (robot.scale?.x || 1);
}

/** Snap wheel contact to roadY; returns positive origin clearance above road. */
export function alignKartToRoad(model, roadY) {
  let clearance = measureKartWheelDrop(model);
  model.position.y = roadY + clearance;
  model.updateMatrixWorld(true);
  // Second pass — ensure wheel patch meets road after matrix update.
  let wheelBottom = Infinity;
  model.traverse((o) => {
    if (!o.isMesh) return;
    let node = o;
    while (node && !node.userData?.isWheel) node = node.parent;
    if (!node?.userData?.isWheel) return;
    const bb = new THREE.Box3().setFromObject(o);
    if (!bb.isEmpty()) wheelBottom = Math.min(wheelBottom, bb.min.y);
  });
  if (Number.isFinite(wheelBottom) && wheelBottom < roadY - 0.005) {
    model.position.y += roadY - wheelBottom;
    clearance = model.position.y - roadY;
  }
  // Visual lift so tyre sidewalls and chassis read above asphalt (not clipped).
  model.position.y += KART_VISUAL_LIFT;
  clearance = model.position.y - roadY;
  // Ensure lowest mesh point (body skirts) clears the deck.
  model.updateMatrixWorld(true);
  const hull = new THREE.Box3().setFromObject(model);
  if (!hull.isEmpty() && hull.min.y < roadY + KART_CHASSIS_ROAD_GAP) {
    model.position.y += (roadY + KART_CHASSIS_ROAD_GAP) - hull.min.y;
    clearance = model.position.y - roadY;
  }
  model.traverse((o) => { if (o.isMesh) o.frustumCulled = false; });
  return clearance;
}

/** Plant kart on road; stores positive clearance (origin above road) on rs. */
export function plantKartOnRoad(robot, scene, { x, z, trackT, splineY = 0, rs = null } = {}) {
  const track3D = !!scene?.userData?.track3D;
  const splineRoad = roadSurfaceYAt(track3D, splineY, scene, trackT);
  const roadY = (track3D && x != null && z != null)
    ? raycastRoadSurfaceY(scene, x, z, splineRoad)
    : splineRoad;
  const clearance = alignKartToRoad(robot, roadY);
  if (rs) {
    rs._kartRoadClearance = clearance;
    rs._originAboveRoad = clearance;
    rs._wheelOriginOffset = clearance;
    rs._groundClearance = clearance;
  }
  robot.userData._kartRoadClearance = clearance;
  robot.userData._originAboveRoad = clearance;
  robot.userData._lastRoadY = roadY;
  return { y: robot.position.y, wheelOffset: clearance, roadY };
}

function wheelOriginOffset(rs, robot = null) {
  const stored = rs?._kartRoadClearance
    ?? rs?._originAboveRoad
    ?? rs?._wheelOriginOffset
    ?? rs?._groundClearance
    ?? robot?.userData?._kartRoadClearance
    ?? robot?.userData?._originAboveRoad;
  if (stored != null && stored > 0.01) return stored;
  if (robot) return measureKartWheelDrop(robot);
  return KART_CLEARANCE;
}

export function raceSurfaceY(track3D, pointY = 0, scene = null) {
  return kartOriginYAt(track3D, pointY, KART_CLEARANCE, scene);
}

function normalizeAngleDiff(diff) {
  while (diff > Math.PI) diff -= Math.PI * 2;
  while (diff < -Math.PI) diff += Math.PI * 2;
  return diff;
}

/** Telemetry for KS2 block coding — mirrors getFlappySensors pattern. */
export function getRaceSensors(rs = {}) {
  return {
    speed: rs.raceSpeedKmh ?? 0,
    distanceToLeftRail: rs.distanceToLeftRail ?? 99,
    distanceToRightRail: rs.distanceToRightRail ?? 99,
    isOnTrack: rs.isOnTrack !== false,
    currentLap: rs.raceLap ?? 1,
    wrongWay: !!rs.raceWrongWay,
    falling: !!rs.raceFalling,
  };
}

/** Fixed behind-the-kart chase camera — offset rotates with robot heading, angle never swings. */
export function sampleFixedChaseCamera(kx, ky, kz, angle = Math.PI, {
  camBack = 8,
  camUp = 3,
  lookAhead = 5,
  lookHeight = 1.0,
} = {}) {
  const fwdX = Math.sin(angle);
  const fwdZ = Math.cos(angle);
  return {
    camX: kx - fwdX * camBack,
    camY: ky + camUp,
    camZ: kz - fwdZ * camBack,
    lookX: kx + fwdX * lookAhead,
    lookY: ky + lookHeight,
    lookZ: kz + fwdZ * lookAhead,
  };
}

/** Fixed behind-the-kart camera on the launch grid — MK straight-ahead view. */
export function sampleGridLaunchCamera(kx, ky, kz, angle = Math.PI) {
  const fwdX = Math.sin(angle);
  const fwdZ = Math.cos(angle);
  return {
    camX: kx - fwdX * 11,
    camY: ky + 4.5,
    camZ: kz - fwdZ * 11,
    lookX: kx + fwdX * 55,
    lookY: ky + 1.0,
    lookZ: kz + fwdZ * 55,
  };
}

/** Closer behind-the-kart view for race start / grid — shows start line and road ahead. */
export function sampleRaceStartCamera(curve, trackT, kartX, kartY, kartZ, kartAngle = Math.PI) {
  return sampleFixedChaseCamera(kartX, kartY, kartZ, kartAngle, {
    camBack: 9.0,
    camUp: 3.8,
    lookAhead: 12.5,
    lookHeight: 1.0,
  });
}

/** Mario Kart chase camera — fixed offset behind kart (no spline swing). */
export function sampleRaceCamera(curve, trackT, kartX, kartY, kartZ, {
  kartAngle = null,
  camBack = 8,
  camUp = 3,
  lookAhead = 5,
  lookHeight = 1.0,
} = {}) {
  let angle = kartAngle;
  if (angle == null && curve && Number.isFinite(trackT)) {
    const eps = 0.005;
    const pA = curve.getPointAt((trackT - eps + 1) % 1);
    const pB = curve.getPointAt((trackT + eps) % 1);
    angle = Math.atan2(pB.x - pA.x, pB.z - pA.z);
  }
  return sampleFixedChaseCamera(kartX, kartY, kartZ, angle ?? Math.PI, {
    camBack,
    camUp,
    lookAhead,
    lookHeight,
  });
}

/** Place the kart on the track centerline, facing along the spline. */
export function computeRaceSpawn(curve, finishT, { spawnBack = 1.0, spawnTOffset = null, spawnT: explicitSpawnT = null, spawnPosition = null, track3D = false } = {}) {
  if (spawnPosition) {
    const baseY = spawnPosition.y ?? (track3D ? curve.getPointAt(finishT).y : 0);
    const hintT = closestTrackT(
      curve, spawnPosition.x, spawnPosition.z, 120, finishT, 0.04,
      track3D ? baseY : null,
    ).t;
    return {
      x: spawnPosition.x,
      z: spawnPosition.z,
      y: raceSurfaceY(track3D, baseY),
      angle: spawnPosition.angle ?? Math.PI,
      trackT: spawnPosition.trackT ?? explicitSpawnT ?? hintT,
    };
  }
  const placeAtT = (spawnT) => {
    const t = ((spawnT % 1) + 1) % 1;
    const spawnPt = curve.getPointAt(t);
    const eps = 0.004;
    const ahead = curve.getPointAt((t + eps) % 1);
    const faceAngle = Math.atan2(ahead.x - spawnPt.x, ahead.z - spawnPt.z);
    return {
      x: spawnPt.x,
      z: spawnPt.z,
      y: raceSurfaceY(track3D, track3D ? spawnPt.y : 0),
      angle: faceAngle,
      trackT: t,
    };
  };

  // Preferred: absolute t on the spline (e.g. launch straight grid).
  if (explicitSpawnT != null && Number.isFinite(explicitSpawnT)) {
    return placeAtT(explicitSpawnT);
  }

  // Fixed distance back along the spline (Mario Kart grid on the straight).
  if (spawnTOffset != null && spawnTOffset > 0) {
    return placeAtT((finishT - spawnTOffset + 1) % 1);
  }

  const frame = sampleTrackFrame(curve, finishT);
  // Don't use frame.tan/frame.rot anywhere — finishT is exactly the closed
  // curve's t=0/1 seam where getTangentAt() can return a sign-flipped or
  // wildly wrong derivative. Use finite-difference for BOTH the facing angle
  // AND the spawn offset so the kart always starts in the right position and
  // faces the right direction regardless of spline parameterisation.
  const eps = 0.004;
  const aheadT = (finishT + eps) % 1;
  const ahead = curve.getPointAt(aheadT);
  const forwardAngle = Math.atan2(ahead.x - frame.p.x, ahead.z - frame.p.z);
  // Move the spawn spawnBack units BEHIND the finish line along the true
  // forward direction (finite-diff), not along the unstable getTangentAt.
  const fwdX = Math.sin(forwardAngle);
  const fwdZ = Math.cos(forwardAngle);
  const sx = frame.p.x - fwdX * spawnBack;
  const sz = frame.p.z - fwdZ * spawnBack;
  // Interpolate Y at the actual spawn position (not finishT) so 3D elevation
  // matches the grid tile the kart sits on.
  const spawnT = closestTrackT(curve, sx, sz, 120, finishT, 0.02, track3D ? frame.p.y : null).t;
  const spawnPt = curve.getPointAt(spawnT);
  const surfaceY = raceSurfaceY(track3D, track3D ? spawnPt.y : 0);
  // Recompute facing from the actual spawn point so we never start sideways
  const ahead2 = curve.getPointAt((spawnT + 0.004) % 1);
  const faceAngle = Math.atan2(ahead2.x - spawnPt.x, ahead2.z - spawnPt.z);
  return {
    x: spawnPt.x,
    z: spawnPt.z,
    y: surfaceY,
    angle: faceAngle,
    trackT: spawnT,
  };
}

/**
 * Mario Kart "Follow track" — advance the kart along the spline centerline.
 * Returns true when movement was applied (caller should skip angle-based motion).
 */
export function advanceAlongRaceTrack(rs, dt, scene, fwdSpd) {
  const curve = scene?.userData?.raceCurve;
  if (!curve || fwdSpd <= 0) return false;
  const track3D = !!scene?.userData?.track3D;
  const curveLen = Math.max(1, curve.getLength());

  // Advance along the stored t — do NOT re-search closest point each frame
  // (on a 3D spiral, x/z search jumps between loops and kills lap progress).
  let trackT = rs._raceTrackTHint ?? rs.raceTrackT;
  if (trackT == null || !Number.isFinite(trackT)) {
    const searchY = track3D ? rs.y : null;
    trackT = closestTrackT(curve, rs.x, rs.z, 60, null, 0.02, searchY).t;
  }

  const isOpen = curve.closed === false;
  let newT = trackT + (fwdSpd * dt) / curveLen;
  if (isOpen) {
    if (newT >= 1) newT = 1;
    else if (newT < 0) newT = 0;
  } else {
    newT = ((newT % 1) + 1) % 1;
  }
  const pt = curve.getPointAt(newT);
  const eps = 0.004;
  const pA = curve.getPointAt((newT - eps + 1) % 1);
  const pB = curve.getPointAt((newT + eps) % 1);

  rs.x = pt.x;
  rs.z = pt.z;
  rs.y = kartOriginYAt(track3D, track3D ? pt.y : 0, wheelOriginOffset(rs), scene, newT, pt.x, pt.z);
  rs.angle = Math.atan2(pB.x - pA.x, pB.z - pA.z);
  rs._raceTrackTHint = newT;
  rs.raceTrackT = newT;
  return true;
}

function fmtLapTime(sec) {
  if (sec == null || !Number.isFinite(sec)) return '--:--.-';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${s.toFixed(1).padStart(4, '0')}`;
}

/**
 * Create race state mover for scene.userData.movers.
 * @param {object} config
 * @param {THREE.CatmullRomCurve3} config.curve
 * @param {number} config.totalLaps
 * @param {number[]} config.checkpointTs
 * @param {number[]} config.boostTs
 * @param {number} config.finishT
 * @param {number} config.halfWidth
 * @param {boolean} config.fallOffEnabled
 * @param {Function} config.onBurst
 * @param {object} config.env - optional { update(time, dt) }
 * @param {Function} config.onTrackTimeUpdate - optional (t) => shader sync
 */
export function createRaceMover(config) {
  const {
    curve,
    totalLaps = 3,
    checkpointTs = [0.24, 0.52, 0.78],
    boostTs = [0.05, 0.62],
    pickupTs = [],
    finishT = 0,
    halfWidth = 2.5,
    fallOffEnabled = true,
    track3D = false,
    finishRadius = 4,
    spawnBack = 1.0,
    spawnTOffset = null,
    spawnT = null,
    spawnPosition = null,
    onBurst = () => {},
    onPickup = () => {},
    env = null,
    onTrackTimeUpdate = null,
    glowRefs = [],
    flatStraightTrack = null,
    useLateralFall = false,
    difficulty = 3,
  } = config;
  const beginner = difficulty <= 2;

  const spawn = computeRaceSpawn(curve, finishT, { spawnBack, spawnTOffset, spawnT, spawnPosition, track3D });
  const startPt = curve.getPointAt(finishT);

  const finishPos = { x: startPt.x, z: startPt.z, radius: finishRadius };

  const gateMeshes = checkpointTs.map((t, i) => {
    const p = curve.getPointAt(t);
    return { x: p.x, z: p.z, radius: 4.2, index: i };
  });

  const padPositions = boostTs.map((t) => {
    const p = curve.getPointAt(t);
    return { x: p.x, z: p.z };
  });

  const pickups = pickupTs.map((pk, i) => {
    const p = curve.getPointAt(pk.t);
    return { x: p.x, y: p.y, z: p.z, type: pk.type, radius: 1.4, collected: false, index: i, respawnT: 0 };
  });

  let lap = 1;
  let cpIndex = 0;
  let lapStartT = 0;
  let lapTime = 0;
  let bestLap = null;
  let lastX = 0;
  let lastZ = 0;
  let lastAngle = 0;
  let speedKmh = 0;
  let missedCheckpoint = false;
  let finishCooldown = 0;
  let wrongWayTimer = 0;
  let _firstFrame = true;
  // Seed the hint with a real global search at the actual spawn position,
  // not finishT itself — the kart spawns spawnBack units behind the finish
  // line, and with a narrow per-frame search window that offset can fall
  // outside the window if seeded from finishT directly, locking onto the
  // wrong point on frame 1 and producing false "wrong way" readings from
  // the very start even when driving straight forward.
  // Pass spawn.y so the initial global search picks the correct loop on a
  // 3D spiral (otherwise it may latch onto the wrong height on frame 0).
  let lastTrackTHint = closestTrackT(curve, spawn.x, spawn.z, 120, null, 0.04, track3D ? spawn.y : null).t;

  return {
    spawn,
    finishPos,
    gateMeshes,
    padPositions,
    pickups,
    update(time, dt, rs, scene) {
      if (env?.update) env.update(time, dt);
      if (onTrackTimeUpdate) onTrackTimeUpdate(time);

      // Throttle glow updates — emissive pulse is cosmetic, not worth every frame.
      if (Math.floor(time * 12) % 5 === 0) {
        const pulse = 0.5 + Math.sin(time * 5) * 0.4;
        glowRefs.forEach((ref) => {
          ref.mats?.forEach((m) => {
            if (m?.emissiveIntensity != null) m.emissiveIntensity = 0.7 + pulse * 0.25;
          });
        });
      }

      if (_firstFrame) {
        _firstFrame = false;
        lap = 1; cpIndex = 0; lapStartT = time; lapTime = 0; bestLap = null;
        missedCheckpoint = false; finishCooldown = 1.8; wrongWayTimer = 0;
        rs.x = spawn.x; rs.z = spawn.z;
        rs.angle = spawn.angle;
        const spawnHint = spawn.trackT ?? closestTrackT(curve, spawn.x, spawn.z, 120, finishT, 0.04, track3D ? spawn.y : null).t;
        rs._raceTrackTHint = spawnHint;
        rs.raceTrackT = spawnHint;
        const spawnPt = curve.getPointAt(spawnHint);
        rs.y = kartOriginYAt(track3D, track3D ? spawnPt.y : 0, wheelOriginOffset(rs), scene, spawnHint, spawnPt.x, spawnPt.z);
        lastX = rs.x; lastZ = rs.z; lastAngle = rs.angle;
        return;
      }
      // Auto-steer only when the student adds "Follow track" — never force it.
      if (rs.done) return;

      // When Follow Track is driving along the spline (rail mode), trust the
      // param advanced by advanceAlongRaceTrack — re-searching closest x/z each
      // frame jumps between spiral loops and kills lap progress / camera aim.
      let trackT;
      let trackDist;
      let onLaunchStrip = flatStraightTrack && isOnLaunchStrip(rs.x, rs.z, halfWidth);

      // Trust spline hint when advanceAlongRaceTrack placed the kart on the centerline.
      // Re-searching with a narrow window lags behind fast t advancement → false falls.
      const splineHint = rs._raceTrackTHint ?? rs.raceTrackT;
      let splineSnapDist = Infinity;
      if (splineHint != null && Number.isFinite(splineHint)) {
        const hintPt = curve.getPointAt(splineHint);
        splineSnapDist = Math.hypot(rs.x - hintPt.x, rs.z - hintPt.z);
      }

      if (rs.raceAutoSteer && rs.raceTrackT != null && Number.isFinite(rs.raceTrackT)) {
        trackT = rs.raceTrackT;
        const railPt = curve.getPointAt(trackT);
        trackDist = Math.hypot(rs.x - railPt.x, rs.z - railPt.z);
        lastTrackTHint = trackT;
      } else if (splineHint != null && Number.isFinite(splineHint) && splineSnapDist < halfWidth * 0.85) {
        trackT = splineHint;
        trackDist = splineSnapDist;
        lastTrackTHint = trackT;
      } else {
        // Find the closest track point near where we were last frame, not a
        // fresh global search.  On a 3D spiral, different loops share the same
        // (x,z) footprint at different heights; passing the vehicle's current Y
        // makes the search prefer the loop the kart is actually on, preventing
        // both the sinking-into-another-loop and the wrong-tangent (circles)
        // issues that occurred when the wrong loop was selected.
        const _searchY = track3D ? rs.y : null;
        const found = closestTrackT(curve, rs.x, rs.z, 40, lastTrackTHint, 0.04, _searchY);
        trackT = found.t;
        trackDist = found.dist;
        lastTrackTHint = trackT;
      }
      const velX = rs.x - lastX;
      const velZ = rs.z - lastZ;
      const velLen = Math.hypot(velX, velZ);

      const dx = rs.x - lastX;
      const dz = rs.z - lastZ;
      speedKmh = computeSpeedKmh(lastX, lastZ, rs.x, rs.z, dt);
      rs._raceSpeedEstimate = speedKmh / 3.6;
      lastX = rs.x; lastZ = rs.z; lastAngle = rs.angle;
      lapTime = time - lapStartT;

      if (onLaunchStrip) {
        rs.raceWrongWay = false;
        wrongWayTimer = 0;
      }

      let _cachedTrackPt = null;
      let _cachedTangent = null;
      let _raceLateralOff = null;
      const getTrackPt = () => {
        if (!_cachedTrackPt) _cachedTrackPt = curve.getPointAt(trackT);
        return _cachedTrackPt;
      };
      const getTrackTangent = () => {
        if (!_cachedTangent) {
          const tEps = 0.004;
          const tA = (trackT - tEps + 1) % 1;
          const tB = (trackT + tEps) % 1;
          const pA = curve.getPointAt(tA);
          const pB = curve.getPointAt(tB);
          const dx = pB.x - pA.x;
          const dz = pB.z - pA.z;
          const len = Math.hypot(dx, dz) || 1;
          _cachedTangent = { x: dx, z: dz, nx: dx / len, nz: dz / len };
        }
        return _cachedTangent;
      };
      if (track3D || scene?.userData?.mkThemedTrack) {
        const trackPt = getTrackPt();
        const targetY = kartOriginYAt(track3D, track3D ? trackPt.y : 0, wheelOriginOffset(rs), scene, trackT, trackPt.x, trackPt.z);
        if (!rs.raceFalling || (track3D && (rs._fallTimer ?? 0) < 1.0)) {
          const ySnap = Math.min(1, dt * (track3D ? 6 : 8));
          rs.y += (targetY - rs.y) * ySnap;
          rs._lastRoadY = targetY - wheelOriginOffset(rs);
        }

        // Wrong-way detection — skip on launch grid and rail mode.
        if (!rs.raceAutoSteer && !onLaunchStrip && velLen > 0.02) {
          const tan = getTrackTangent();
          const dot = (velX / velLen) * tan.nx + (velZ / velLen) * tan.nz;
          const wrongWayThreshold = beginner ? -0.88 : (track3D ? -0.72 : -0.50);
          const wrongWayDebounce  = beginner ? 8.0 : (track3D ? 4.0  : 0.40);
          if (dot < wrongWayThreshold) {
            wrongWayTimer += dt;
            if (wrongWayTimer > wrongWayDebounce) rs.raceWrongWay = true;
          } else {
            wrongWayTimer = Math.max(0, wrongWayTimer - dt * 3);
            if (wrongWayTimer === 0) rs.raceWrongWay = false;
          }
        }

        // Guardrail collision + telemetry — always compute lateral offset for fall checks
        const tan = getTrackTangent();
        const nx = -tan.nz;
        const nz = tan.nx;
        const latOff = (rs.x - trackPt.x) * nx + (rs.z - trackPt.z) * nz;
        _raceLateralOff = latOff;

        if (!rs.raceFalling) {
          const railEdge = halfWidth + 0.45;
          rs.distanceToLeftRail = Math.max(0, railEdge - latOff);
          rs.distanceToRightRail = Math.max(0, railEdge + latOff);
          rs.isOnTrack = Math.abs(latOff) <= halfWidth * 0.92;

          if (Math.abs(latOff) > halfWidth + (beginner ? 1.4 : 0.32)) {
            const over = Math.abs(latOff) - (halfWidth + (beginner ? 1.4 : 0.32));
            const bounce = Math.min(1, dt * (beginner ? 4 : 10)) * over * (beginner ? 0.4 : 0.85);
            rs.x -= nx * Math.sign(latOff) * bounce;
            rs.z -= nz * Math.sign(latOff) * bounce;
            if (rs._raceSpeedEstimate) rs._raceSpeedEstimate *= beginner ? 0.97 : 0.9;
          } else if (!rs.raceAutoSteer && !beginner) {
            const edgeT = Math.min(1, Math.abs(latOff) / (halfWidth * 0.52));
            if (edgeT > 0.35) {
              const pull = latOff * Math.min(1, dt * (0.8 + edgeT * 0.4)) * 0.35;
              rs.x -= nx * pull;
              rs.z -= nz * pull;
            }
          }
        }
      }

      updateBoostTimer(rs, dt);
      updateMagnetTimer(rs, dt);
      for (const pad of padPositions) {
        if ((rs.x - pad.x) ** 2 + (rs.z - pad.z) ** 2 < 3.5) {
          if (!pad._hitThisFrame) {
            rs.raceBoostPadsHit = (rs.raceBoostPadsHit || 0) + 1;
            pad._hitThisFrame = true;
            // Reset after the robot moves away so it can't spam-increment
            setTimeout(() => { pad._hitThisFrame = false; }, 400);
          }
          activateBoost(rs, { boostMul: 1.35 }, 0.8);
          const burstY = track3D ? (getTrackPt().y + 0.3) : ((scene?.userData?.groundY ?? 0.6) + 0.1);
          onBurst(rs.x, burstY, rs.z, 0xffaa00);
        }
      }

      // Power-up pickups — speed/shield/magnet/star. Respawn each lap.
      for (const pk of pickups) {
        if (pk.collected) continue;
        if ((rs.x - pk.x) ** 2 + (rs.z - pk.z) ** 2 < pk.radius ** 2) {
          pk.collected = true;
          pk.respawnLap = lap + 1;
          recordPowerup(rs, pk.type);
          if (pk.type === 'speed') activateBoost(rs, { boostMul: 1.5 }, 1.2);
          else if (pk.type === 'shield') activateShield(rs);
          else if (pk.type === 'magnet') activateMagnet(rs, 6);
          else if (pk.type === 'star') collectStar(rs);
          onPickup(pk.x, (pk.y ?? 0) + 0.6, pk.z, pk.type);
        } else if (pk.collected && lap >= pk.respawnLap) {
          pk.collected = false;
        }
      }

      const cpGateMul = rs.raceMagnetActive ? 1.6 : 1;
      if (cpIndex < gateMeshes.length) {
        const cp = gateMeshes[cpIndex];
        if ((rs.x - cp.x) ** 2 + (rs.z - cp.z) ** 2 < (cp.radius * cpGateMul) ** 2) {
          cpIndex++;
          rs.raceTotalCheckpoints = (rs.raceTotalCheckpoints || 0) + 1;
          onBurst(cp.x, 4, cp.z, 0x00ff88);
        }
      }

      if (finishCooldown > 0) finishCooldown -= dt;

      if ((rs.x - finishPos.x) ** 2 + (rs.z - finishPos.z) ** 2 < finishPos.radius ** 2 && finishCooldown <= 0) {
        if (cpIndex >= gateMeshes.length) {
          if (bestLap == null || lapTime < bestLap) bestLap = lapTime;
          if (lap >= totalLaps) {
            rs.done = true;
            rs.raceWon = true;
            onBurst(finishPos.x, 4, finishPos.z, 0xffd400);
          } else {
            lap++;
            cpIndex = 0;
            lapStartT = time;
            lapTime = 0;
            finishCooldown = 2.5;
            rs.raceFinalLap = lap >= totalLaps;
          }
        } else if (cpIndex > 0) missedCheckpoint = true;
      }

      // Fall off track — lateral distance on ribbon tracks, centerline distance otherwise.
      let fallDist;
      let fallEdge;
      if (onLaunchStrip) {
        // Flat launch grid: axis-aligned bounds, not spline lateral offset.
        fallDist = Math.abs(rs.x - (RAINBOW_LAUNCH_ZONE.x ?? 0));
        fallEdge = halfWidth + 2.5;
      } else if (useLateralFall && _raceLateralOff != null) {
        fallDist = Math.abs(_raceLateralOff);
        fallEdge = halfWidth + 3.5;
      } else {
        fallDist = trackDist;
        fallEdge = track3D ? halfWidth + 5.0 : halfWidth + 0.9;
      }
      const raceGrace = (rs.raceCountdown ?? 0) > 0 || (rs.raceTotalTime ?? 0) < 4.0;
      if (fallOffEnabled && !rs.done && !raceGrace) {
        if (fallDist > fallEdge) {
          if ((rs.raceShieldCount || 0) > 0 && !rs._shieldConsumedThisFall) {
            // Shield power-up cancels one fall — snap back onto the track and keep racing.
            rs.raceShieldCount -= 1;
            rs._shieldConsumedThisFall = true;
            const safePt = curve.getPointAt(trackT);
            rs.x = safePt.x; rs.z = safePt.z;
            rs.y = kartOriginYAt(true, safePt.y, wheelOriginOffset(rs), scene, trackT, safePt.x, safePt.z);
            rs.raceFalling = false;
            rs._fallTimer = 0;
            onBurst(rs.x, rs.y + 0.4, rs.z, 0x44aaff);
          } else {
            rs.raceFalling = true;
            rs._fallTimer = (rs._fallTimer ?? 0) + dt;
            // On 3D tracks, the Y-snap above keeps the vehicle surfaced for the
            // first second, so only subtract Y after the grace period expires.
            if (!track3D || (rs._fallTimer ?? 0) >= 1.0) {
              rs.y -= dt * (track3D ? 2.5 : 4);
            }
            if (rs._fallTimer > 3) {
              rs.done = true;
              rs.raceWon = false;
              rs.raceFailReason = 'Your robot fell into space!';
            }
          }
        } else {
          rs.raceFalling = false;
          rs._fallTimer = 0;
          rs._shieldConsumedThisFall = false;
        }
      }

      rs.raceLap = lap;
      rs.raceTotalLaps = totalLaps;
      rs.raceLapTime = lapTime;
      rs.raceBestLap = bestLap;
      rs.raceSpeedKmh = speedKmh;
      rs.raceCheckpoint = cpIndex;
      rs.raceCheckpointsTotal = gateMeshes.length;
      rs.raceMissedCheckpoint = missedCheckpoint;
      rs.raceTotalTime = time;
      rs.raceLapTimeStr = fmtLapTime(lapTime);
      rs.raceBestLapStr = fmtLapTime(bestLap);
      // Rail mode: advanceAlongRaceTrack owns raceTrackT — don't overwrite it.
      if (!rs.raceAutoSteer) rs.raceTrackT = trackT;
    },
  };
}
