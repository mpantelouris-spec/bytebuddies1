/**
 * FootballBot animation rig — run cycle, dribble, kick (reuses kick-rig-animation).
 */
import { computeKickRigPose, applyKickPoseToRig } from './kick-rig-animation.js';

export function attachFootballRig(g, { team, jerseyNum } = {}) {
  const rig = g.userData.rig;
  if (!rig) return;

  let animState = 'idle';
  let animPhase = 0;
  let runSpeed = 0;
  let skeletonDriven = false;

  g.userData.setAnimState = (state) => {
    if (animState !== state) {
      animState = state;
      animPhase = 0;
    }
  };
  g.userData.setSkeletonDriven = (on) => { skeletonDriven = !!on; };
  g.userData.setTimeScale = () => {};

  g.userData.animate = (t, dt = 1 / 60) => {
    if (skeletonDriven) return;
    const step = Math.max(dt, 1 / 120);
    const speedNorm = Math.min(1, Math.max(0, runSpeed / 6.2));
    // A measured football jog-to-sprint cadence. The old rate climbed to
    // almost three full strides per second, making the little robots look
    // like they were cycling their legs instead of running.
    const strideRate = 6.2 + speedNorm * 4.4;
    animPhase += step * strideRate;
    const { torsoGrp, headGrp, legGrps, armGrps } = rig;
    const bob = Math.max(0, Math.sin(animPhase * 2)) * (0.006 + speedNorm * 0.012);

    if (animState === 'run' || animState === 'chase_ball' || animState === 'dribble') {
      const stride = Math.sin(animPhase);
      const lean = animState === 'dribble' ? 0.045 + speedNorm * 0.035 : 0.07 + speedNorm * 0.055;
      torsoGrp.rotation.x = lean;
      torsoGrp.rotation.z = -stride * 0.025;
      torsoGrp.position.y = bob;
      torsoGrp.position.x = -stride * 0.008;
      headGrp.rotation.x = animState === 'dribble' ? 0.09 : 0.025;

      legGrps.forEach(({ hipGrp, shinGrp, li }) => {
        const phase = li === 0 ? stride : -stride;
        const lift = 0.38 + speedNorm * 0.16;
        if (hipGrp) hipGrp.rotation.x = phase * lift + (li === 0 ? 0.1 : -0.06);
        if (shinGrp) shinGrp.rotation.x = -0.08 + Math.max(0, phase) * (0.34 + speedNorm * 0.14);
        const ankleGrp = legGrps[li]?.ankleGrp;
        if (ankleGrp) ankleGrp.rotation.x = -Math.max(0, phase) * 0.12;
      });

      armGrps.forEach(({ grp, si }) => {
        const armPhase = si === 0 ? -stride : stride;
        grp.rotation.x = -0.24 + armPhase * (0.34 + speedNorm * 0.1);
        grp.rotation.z = (si === 0 ? 0.045 : -0.045) + armPhase * 0.035;
        if (armGrps[si]?.forearmGrp) armGrps[si].forearmGrp.rotation.x = -0.3 + Math.max(0, armPhase) * 0.16;
      });
    } else if (animState === 'celebrate') {
      const c = Math.sin(animPhase * 10);
      torsoGrp.rotation.y = c * 0.3;
      torsoGrp.position.y = Math.abs(Math.sin(animPhase * 12)) * 0.08;
      armGrps.forEach(({ grp }) => { grp.rotation.x = -1.8; });
    } else if (animState === 'idle') {
      const shift = Math.sin(t * 1.4);
      torsoGrp.rotation.x *= 0.92;
      torsoGrp.rotation.z = shift * 0.028;
      torsoGrp.position.y = bob * 0.55 + Math.abs(shift) * 0.01;
      torsoGrp.position.x = shift * 0.014;
      headGrp.rotation.x *= 0.9;
      headGrp.rotation.y = Math.sin(t * 0.75) * 0.05;
      legGrps.forEach(({ hipGrp, shinGrp, li }) => {
        if (hipGrp) hipGrp.rotation.x = li === 0 ? 0.1 : -0.06;
        if (shinGrp) shinGrp.rotation.x = -0.12;
      });
      armGrps.forEach(({ grp, forearmGrp, si }) => {
        grp.rotation.x += (-0.18 - grp.rotation.x) * 0.18;
        grp.rotation.z += ((si === 0 ? 0.04 : -0.04) - grp.rotation.z) * 0.18;
        if (forearmGrp) forearmGrp.rotation.x += (-0.24 - forearmGrp.rotation.x) * 0.18;
      });
    } else if (['kick', 'shoot', 'short_pass', 'long_pass', 'lob_pass'].includes(animState)) {
      const kickId = animState === 'shoot' ? 'heavy_kick' : 'light_kick';
      const frame = Math.floor(animPhase * 60) % (kickId === 'heavy_kick' ? 36 : 24);
      const pose = computeKickRigPose(kickId, frame, 'right');
      applyKickPoseToRig(pose, rig, -1.15, g);
    }
  };

  g.userData.footballRig = { setRunSpeed: (s) => { runSpeed = s; } };
}
