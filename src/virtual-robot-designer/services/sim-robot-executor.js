/**
 * Real simulator step execution — movement, sensors, tools (shared by 3D arena).
 */
import {
  easeInOut,
  checkObstacleAhead,
  checkPointCollision,
  onLineFollowPath,
} from './robot-runtime.js';

function sampleObstacleAlongPath(sx, sz, ex, ez, design, arenaId) {
  const steps = 10;
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    const x = sx + (ex - sx) * t;
    const z = sz + (ez - sz) * t;
    if (checkPointCollision(x, z, arenaId).hit) {
      return { blocked: true, stopT: Math.max(0, t - 0.12) };
    }
    const angle = (Math.atan2(ez - sz, ex - sx) * 180) / Math.PI;
    if (checkObstacleAhead({ x, z, angle }, angle, design, arenaId).hit) {
      return { blocked: true, stopT: Math.max(0, t - 0.15) };
    }
  }
  return { blocked: false, stopT: 1 };
}

function animateForward(p, params, ctx, mult = 1) {
  const { design, arenaId, physics, movingRef, camTargetRef, onMove, stepId } = ctx;
  const cm = parseFloat(params.amount || 80);
  let dist = cm * physics.cmToUnit * mult;
  const rad = (p.angle * Math.PI) / 180;
  const dir = ctx.backward ? -1 : 1;
  const sx = p.x;
  const sz = p.z;
  let ex = sx + Math.cos(rad) * dist * dir;
  let ez = sz + Math.sin(rad) * dist * dir;

  const pathCheck = sampleObstacleAlongPath(sx, sz, ex, ez, design, arenaId);
  if (pathCheck.blocked) {
    ex = sx + (ex - sx) * pathCheck.stopT;
    ez = sz + (ez - sz) * pathCheck.stopT;
    dist *= pathCheck.stopT;
  }

  const speedMul = stepId === 'accelerate' ? 0.65 : physics.wheels?.type === 'tracks' ? 1.15 : physics.wheels?.type === 'legs' ? 1.35 : 1;
  const dur = Math.max(200, (dist / physics.pxPerMs) * 1000 * speedMul);

  return new Promise((resolve) => {
    movingRef.current = true;
    const t0 = performance.now();
    const go = () => {
      const prog = Math.min(1, (performance.now() - t0) / dur);
      const e = easeInOut(prog);
      p.x = sx + (ex - sx) * e;
      p.z = sz + (ez - sz) * e;

      if (stepId === 'follow_line' && arenaId === 'linefollow' && !onLineFollowPath(p.x, p.z, arenaId)) {
        p.angle += p.x > 0.18 ? -2.5 : 2.5;
      }

      camTargetRef.current.x = p.x;
      camTargetRef.current.z = p.z;
      onMove?.({ ...p });
      if (prog < 1) requestAnimationFrame(go);
      else {
        movingRef.current = false;
        resolve();
      }
    };
    requestAnimationFrame(go);
  });
}

function animateTurn(p, params, ctx, dirSign) {
  const { physics, movingRef, onMove } = ctx;
  const deg = parseFloat(params.degrees || params.amount || 90);
  const total = deg * dirSign;
  const turnMul = physics.wheels?.type === 'tracks' ? 1.4 : 1;
  const dur = (Math.abs(deg) / physics.degPerMs) * 1000 * turnMul;
  const sa = p.angle;

  return new Promise((resolve) => {
    movingRef.current = true;
    const t0 = performance.now();
    const go = () => {
      const prog = Math.min(1, (performance.now() - t0) / dur);
      p.angle = sa + total * easeInOut(prog);
      onMove?.({ ...p });
      if (prog < 1) requestAnimationFrame(go);
      else {
        movingRef.current = false;
        resolve();
      }
    };
    requestAnimationFrame(go);
  });
}

/** Create execute(step) bound to sim state */
export function createSimExecutor({
  design,
  arenaId,
  posRef,
  movingRef,
  grabRef,
  camTargetRef,
  onMove,
  physics,
  onSensorRead,
}) {
  return (step) => new Promise((resolve) => {
    const id = step?.id;
    const params = step?.params || {};
    const p = posRef.current;
    const ctx = { design, arenaId, physics, movingRef, grabRef, camTargetRef, onMove, backward: false, stepId: id };

    if (id === 'stop') {
      movingRef.current = false;
      resolve();
      return;
    }
    if (id === 'wait') {
      setTimeout(resolve, (params.secs || 1) * 1000);
      return;
    }
    if (id === 'scan' || id === 'read_proximity') {
      const hit = checkObstacleAhead(p, p.angle, design, arenaId);
      onSensorRead?.({ type: 'ultrasonic', distance: hit.distance ?? (hit.hit ? 0.4 : 2.5), hit: hit.hit });
      setTimeout(resolve, 900);
      return;
    }
    if (id === 'lidar_sweep' || id === 'lidar') {
      const hit = checkObstacleAhead(p, p.angle, design, arenaId);
      onSensorRead?.({ type: 'lidar', distance: hit.distance, hit: hit.hit });
      setTimeout(resolve, 1400);
      return;
    }
    if (id === 'thermal_scan' || id === 'read_temp') {
      onSensorRead?.({ type: 'thermal', value: 22 + Math.random() * 4 });
      setTimeout(resolve, 800);
      return;
    }
    if (id === 'detect_face' || id === 'camera') {
      onSensorRead?.({ type: 'camera', detected: true });
      setTimeout(resolve, 700);
      return;
    }
    if (id === 'grab' || id === 'release' || id === 'lift' || id === 'magnet_pick') {
      grabRef.current = 0.6;
      setTimeout(resolve, 700);
      return;
    }
    if (id === 'lights_on' || id === 'lights_off' || id === 'flash') {
      setTimeout(resolve, id === 'flash' ? 600 : 300);
      return;
    }
    if (id === 'beep' || id === 'speak') {
      setTimeout(resolve, 500);
      return;
    }
    if (id === 'jump') {
      camTargetRef.current.hover = (physics.hoverLift || 0) + 0.35;
      setTimeout(() => {
        camTargetRef.current.hover = physics.hoverLift || 0;
        resolve();
      }, 450);
      return;
    }
    if (id === 'walk') {
      const steps = Math.max(1, params.steps || 3);
      const segment = { amount: (params.amount || 40) / steps };
      (async () => {
        for (let i = 0; i < steps; i += 1) {
          await animateForward(p, segment, { ...ctx, stepId: 'walk' }, 1);
          await new Promise((r) => setTimeout(r, 120));
        }
        resolve();
      })();
      return;
    }
    if (id === 'steer') {
      animateTurn(p, { degrees: params.degrees || 30 }, ctx, params.direction === 'right' ? 1 : -1)
        .then(() => animateForward(p, { amount: params.amount || 25 }, ctx, 1))
        .then(resolve);
      return;
    }
    if (id === 'forward' || id === 'follow_line' || id === 'avoid_wall' || id === 'accelerate') {
      animateForward(p, params, ctx, id === 'accelerate' ? 1.35 : 1).then(resolve);
      return;
    }
    if (id === 'back') {
      animateForward(p, params, { ...ctx, backward: true }, 1).then(resolve);
      return;
    }
    if (id === 'left' || id === 'spin_left') {
      animateTurn(p, params, ctx, -1).then(resolve);
      return;
    }
    if (id === 'right' || id === 'spin_right') {
      animateTurn(p, params, ctx, 1).then(resolve);
      return;
    }
    if (id === 'navigate_to') {
      const tx = params.x ?? 0;
      const tz = params.y ?? params.z ?? 0;
      const dx = tx - p.x;
      const dz = tz - p.z;
      const targetAngle = (Math.atan2(dz, dx) * 180) / Math.PI;
      const turnDeg = ((targetAngle - p.angle + 540) % 360) - 180;
      animateTurn(p, { degrees: Math.abs(turnDeg) }, ctx, turnDeg < 0 ? -1 : 1)
        .then(() => animateForward(p, { amount: Math.hypot(dx, dz) / physics.cmToUnit }, ctx, 1))
        .then(resolve);
      return;
    }

    resolve();
  });
}
