/**
 * Broadcast camera director — FIFA Tele Broadcast / action follow / goal replay.
 */
import * as THREE from 'three';
import { BALL_CONFIG } from '../football-physics.js';

export const FOOTBALL_CAM_MODES = {
  ESTABLISHING: 'establishing',
  BROADCAST: 'broadcast',
  ACTION: 'action',
  COOP: 'coop',
  GOAL_REPLAY: 'goal_replay',
  PENALTY: 'penalty',
  SOLO: 'solo',
};

const PRESETS = {
  establishing: { x: 7.2, y: 3.4, z: 0, fov: 46 },
  // FIFA "Tele Broadcast": high in the main stand, side-on, panning with play
  broadcast: { x: 27, y: 13, z: 0, fov: 34 },
  coop: { x: 16, y: 10, z: 0, fov: 52 },
  goal: { fov: 34, pushX: 5.2, pushY: 2.4 },
};

export function resolveFootballCameraMode(ctx = {}) {
  if (ctx.layoutCam === 'penalty' || ctx.layoutCam === 'keeper') return FOOTBALL_CAM_MODES.PENALTY;
  if ((ctx.goalFlash || 0) > 0) return FOOTBALL_CAM_MODES.GOAL_REPLAY;
  if (ctx.userCamMode === 'coop') return FOOTBALL_CAM_MODES.COOP;
  return FOOTBALL_CAM_MODES.BROADCAST;
}

/**
 * @returns {{ bx, bz, camH, fov, lookX, lookY, lookZ, camLerp, lookLerp, slowMo, mode }}
 */
export function computeFootballCamera(ctx = {}, ball = {}, preset = {}) {
  const mode = resolveFootballCameraMode(ctx);
  const ballX = ball.x || 0;
  const ballZ = ball.z || 0;
  const ballY = ball.y || BALL_CONFIG.groundY;
  const ballVx = ball.vx || 0;
  const ballVz = ball.vz || 0;
  let bx;
  let bz;
  let camH;
  let fov;
  let lookX;
  let lookY;
  let lookZ;
  let camLerp = 0.085;
  let lookLerp = 0.1;
  let slowMo = 1;

  if (mode === FOOTBALL_CAM_MODES.GOAL_REPLAY) {
    const g = PRESETS.goal;
    const goalLineZ = ctx.lastScoredTeam === 'player'
      ? (ctx.goalZ || 12.5)
      : -(ctx.goalZ || 12.5);
    bx = g.pushX + ballX * 0.35;
    bz = ballZ * 0.45;
    camH = g.pushY;
    fov = g.fov;
    lookX = ballX;
    lookY = 0.85;
    lookZ = goalLineZ * 0.88;
    camLerp = 0.12;
    lookLerp = 0.14;
    slowMo = 0.4;
  } else if (mode === FOOTBALL_CAM_MODES.ESTABLISHING) {
    const e = PRESETS.establishing;
    bx = e.x;
    bz = 0;
    camH = e.y;
    fov = e.fov;
    lookX = 0;
    lookY = 0.45;
    lookZ = 0;
    camLerp = 0.065;
    lookLerp = 0.08;
  } else if (mode === FOOTBALL_CAM_MODES.ACTION) {
    const px = ctx.playerX;
    const pz = ctx.playerZ;
    const goalZ = ctx.goalZ || 12.5;
    const facing = Number.isFinite(ctx.playerFacing) ? ctx.playerFacing : Math.atan2(ballX - px, ballZ - pz);
    const fwdX = Math.sin(facing);
    const fwdZ = Math.cos(facing);
    const toGoalZ = goalZ - pz;
    const blendFwdX = fwdX * 0.55 + (ballX - px) / Math.max(1, Math.hypot(ballX - px, ballZ - pz)) * 0.45;
    const blendFwdZ = fwdZ * 0.55 + (ballZ - pz) / Math.max(1, Math.hypot(ballX - px, ballZ - pz)) * 0.45;
    const fLen = Math.hypot(blendFwdX, blendFwdZ) || 1;
    const fx = blendFwdX / fLen;
    const fz = blendFwdZ / fLen;
    const back = 6.8;
    const side = 2.1;
    bx = px - fx * back - fz * side * 0.22;
    bz = pz - fz * back + fx * side;
    camH = 2.35 + Math.min(ballY - BALL_CONFIG.groundY, 1.1) * 0.22;
    fov = 41;
    lookX = ballX * 0.28 + px * 0.42 + fx * 2.4;
    lookY = 0.52 + Math.min(Math.hypot(ballVx, ballVz) * 0.012, 0.18);
    lookZ = ballZ * 0.22 + pz * 0.38 + toGoalZ * 0.28;
    camLerp = 0.12;
    lookLerp = 0.13;
    bx = THREE.MathUtils.clamp(bx, 14, ctx.camMaxX ?? 28);
    bz = THREE.MathUtils.clamp(bz, ctx.camMinZ ?? -12, ctx.camMaxZ ?? 12);
  } else if (mode === FOOTBALL_CAM_MODES.COOP) {
    const c = PRESETS.coop;
    bx = c.x;
    bz = THREE.MathUtils.clamp(ballZ * 0.38, -8, 8);
    camH = c.y;
    fov = c.fov;
    lookX = ballX * 0.55;
    lookY = 0.5;
    lookZ = ballZ * 0.88;
    camLerp = 0.07;
  } else if (mode === FOOTBALL_CAM_MODES.PENALTY) {
    bx = preset.position?.x ?? 8.8;
    bz = (preset.position?.z ?? 0) + (preset.fixedZ ? 0 : THREE.MathUtils.clamp(ballZ * 0.12, -2.5, 2.5));
    camH = preset.position?.y ?? 3.5;
    fov = preset.fov ?? 38;
    const look = preset.lookAt;
    lookX = (look?.x ?? 0) + ballX * 0.08;
    lookY = look?.y ?? 1.15;
    lookZ = (look?.z ?? 0) + ballZ * 0.1;
  } else {
    const b = PRESETS.broadcast;
    const flash = ctx.goalFlash || 0;
    const zoom = flash > 0 ? 0.58 : 1;
    fov = b.fov;
    lookX = THREE.MathUtils.clamp(ballX + ballVx * 0.14, -17, 17);
    lookY = 0.85 + Math.min(Math.hypot(ballVx, ballVz) * 0.012, 0.18);
    lookZ = THREE.MathUtils.clamp(ballZ * 0.92 + ballVz * 0.18, -11, 11);
    if (Number.isFinite(ctx.possessionX) && Number.isFinite(ctx.possessionZ)) {
      lookX = lookX * 0.35 + ctx.possessionX * 0.65;
      lookZ = lookZ * 0.35 + ctx.possessionZ * 0.65;
      lookY = 0.9;
    }
    // Camera rides a rail along the touchline, a little behind the ball, and
    // pushes in slightly (narrower lens) after a goal
    lookX *= 0.55;
    lookY = 0.6;
    bx = b.x;
    bz = THREE.MathUtils.clamp(lookZ * 0.82, -11, 11);
    camH = b.y;
    fov = b.fov * zoom + (1 - zoom) * 20;
  }

  return { bx, bz, camH, fov, lookX, lookY, lookZ, camLerp, lookLerp, slowMo, mode };
}
