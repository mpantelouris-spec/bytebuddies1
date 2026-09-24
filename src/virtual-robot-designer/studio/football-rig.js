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
    const speedNorm = Math.min(1.4, Math.max(0, runSpeed / 5.2));
    const strideRate = 7 + speedNorm * 7;
    animPhase += step * strideRate;
    const { torsoGrp, headGrp, legGrps, armGrps } = rig;
    const bob = Math.sin(animPhase * 1.15) * (0.018 + speedNorm * 0.022);

    if (animState === 'run' || animState === 'chase_ball' || animState === 'dribble') {
      const stride = Math.sin(animPhase);
      const lean = animState === 'dribble' ? 0.05 + speedNorm * 0.04 : 0.07 + speedNorm * 0.05;
      torsoGrp.rotation.x = lean;
      torsoGrp.rotation.z *= 0.86;
      torsoGrp.position.y = bob;
      torsoGrp.position.x *= 0.86;
      headGrp.rotation.x = animState === 'dribble' ? 0.18 + speedNorm * 0.08 : 0.04;

      legGrps.forEach(({ hipGrp, shinGrp, li }) => {
        const phase = li === 0 ? stride : -stride;
        const lift = 0.42 + speedNorm * 0.28;
        if (hipGrp) hipGrp.rotation.x = phase * lift + (li === 0 ? 0.1 : -0.06);
        if (shinGrp) shinGrp.rotation.x = -0.12 + Math.max(0, phase) * (0.55 + speedNorm * 0.22);
      });

      armGrps.forEach(({ grp, si }) => {
        const armPhase = si === 0 ? -stride : stride;
        grp.rotation.x = -0.42 + armPhase * (0.28 + speedNorm * 0.14);
        grp.rotation.z = (si === 0 ? 0.1 : -0.1) + armPhase * 0.08;
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
    } else if (['kick', 'shoot', 'short_pass', 'long_pass', 'lob_pass'].includes(animState)) {
      const kickId = animState === 'shoot' ? 'heavy_kick' : 'light_kick';
      const frame = Math.floor(animPhase * 60) % (kickId === 'heavy_kick' ? 36 : 24);
      const pose = computeKickRigPose(kickId, frame, 'right');
      applyKickPoseToRig(pose, rig, -1.15, g);
    }
  };

  g.userData.footballRig = { setRunSpeed: (s) => { runSpeed = s; } };
}
