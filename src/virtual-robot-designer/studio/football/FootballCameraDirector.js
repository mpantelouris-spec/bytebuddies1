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
  establishing: { x: 30, y: 10.5, z: 0, fov: 48 },
  broadcast: { x: 29, y: 7.2, z: 0, fov: 42 },
  coop: { x: 22, y: 14, z: 0, fov: 58 },
  goal: { fov: 30, pushX: 8.5, pushY: 4.2 },
};

export function resolveFootballCameraMode(ctx = {}) {
  if ((ctx.goalFlash || 0) > 0) return FOOTBALL_CAM_MODES.GOAL_REPLAY;
  if (ctx.layoutCam === 'penalty' || ctx.layoutCam === 'keeper') return FOOTBALL_CAM_MODES.PENALTY;
  if (!ctx.kickoffDone || (ctx.kickoffTimer || 0) > 0.05) return FOOTBALL_CAM_MODES.ESTABLISHING;
  if (ctx.userCamMode === 'coop') return FOOTBALL_CAM_MODES.COOP;
  if (ctx.layoutCam === 'solo') return FOOTBALL_CAM_MODES.SOLO;
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
    bz = (preset.position?.z ?? 0) + THREE.MathUtils.clamp(ballZ * 0.12, -2.5, 2.5);
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
    const panX = Math.abs(ballZ) > 7 ? THREE.MathUtils.clamp(ballX * 0.24, -2.8, 2.8) : 0;
    bx = b.x * zoom;
    bz = THREE.MathUtils.clamp(ballZ * 0.72 + ballVz * 0.18, -10.5, 10.5) + panX + ballVx * 0.08;
    camH = b.y * (flash > 0 ? 0.76 : 1) + Math.min(ballY - BALL_CONFIG.groundY, 0.5) * 0.35;
    fov = b.fov;
    lookX = THREE.MathUtils.clamp(ballX * 0.34 + ballVx * 0.14, -6.5, 6.5);
    lookY = 0.62 + Math.min(Math.hypot(ballVx, ballVz) * 0.018, 0.22);
    lookZ = THREE.MathUtils.clamp(ballZ * 0.95 + ballVz * 0.22, -11, 11);
    if (Number.isFinite(ctx.possessionX) && Number.isFinite(ctx.possessionZ)) {
      lookX = lookX * 0.45 + ctx.possessionX * 0.55;
      lookZ = lookZ * 0.45 + ctx.possessionZ * 0.55;
      lookY = 0.68;
    }
    bx = THREE.MathUtils.clamp(bx, 18, ctx.camMaxX ?? 30);
    bz = THREE.MathUtils.clamp(bz, ctx.camMinZ ?? -14, ctx.camMaxZ ?? 14);
  }

  return { bx, bz, camH, fov, lookX, lookY, lookZ, camLerp, lookLerp, slowMo, mode };
}
