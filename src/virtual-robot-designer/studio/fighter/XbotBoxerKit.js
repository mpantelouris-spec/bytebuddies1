/**
 * Robot boxer — the X Bot body in a boxing kit (armoured chest, trunks, big
 * glossy gloves, visor helmet) with boxing moves posed on the real skeleton.
 *
 * The mixer plays the idle / walk cycles; every frame a boxing pose (guard,
 * punches, kicks, blocks, hits, knockdown…) is layered on top as model-space
 * bone rotations, eased so every move blends smoothly into the next.
 * Same userData API as the classic boxer: setAnimState(state, dur), animate(t, dt),
 * setTimeScale, setHealthPct, setSkeletonDriven.
 */
import * as THREE from 'three';
import {
  getXbotGltf, loadXbotFootballer, skeletonClone, normalizeFootballGlbScale,
  paintRobotKit, addRobotHead, xbotBones,
} from '../football/FootballPlayerKit.js';

export { loadXbotFootballer as loadXbotBoxer };

const TEAM = {
  blue: { body: '#2f6fe4', trunks: '#f4f6fa', glove: '#d62828', visor: 0x5ff5ff },
  red: { body: '#d63b3b', trunks: '#1c2230', glove: '#f5b301', visor: 0xffb347 },
};

function boxerPalette({ body, trunks }) {
  const c = new THREE.Color(body);
  const t = new THREE.Color(trunks);
  const metal = new THREE.Color(0x6a7384);
  return {
    jersey: c, collar: new THREE.Color(0x2a303c), shorts: t,
    limb: metal, socks: metal, forearm: metal,
    boot: new THREE.Color(0x1a1e27), toe: c.clone(),
    glove: new THREE.Color(0x1d222c), head: c.clone().lerp(new THREE.Color(0xffffff), 0.1),
    joint: new THREE.Color(0x1d222c),
  };
}

/** Big boxing glove with a white cuff, fitted around the hand bone. */
function attachGlove(model, bones, side, color) {
  const hand = bones[`${side}Hand`];
  const fore = bones[`${side}ForeArm`];
  if (!hand || !fore) return null;
  const hp = hand.getWorldPosition(new THREE.Vector3());
  const dir = hp.clone().sub(fore.getWorldPosition(new THREE.Vector3())).normalize();
  const g = new THREE.Group();
  g.name = `${side}Glove`;
  const mat = new THREE.MeshPhysicalMaterial({
    color, roughness: 0.32, metalness: 0.05, clearcoat: 0.8, clearcoatRoughness: 0.2,
    emissive: new THREE.Color(color), emissiveIntensity: 0,
  });
  const fist = new THREE.Mesh(new THREE.SphereGeometry(0.096, 24, 18), mat);
  fist.scale.set(1.05, 0.98, 1.3);
  fist.position.z = 0.02;
  const thumb = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 10), mat);
  thumb.position.set(0, 0.058, -0.02);
  thumb.scale.set(1, 1, 1.6);
  const cuff = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.066, 0.075, 20),
    new THREE.MeshStandardMaterial({ color: 0xf4f6fa, roughness: 0.55 }),
  );
  cuff.rotation.x = Math.PI / 2;
  cuff.position.z = -0.09;
  [fist, thumb, cuff].forEach((m) => { m.castShadow = true; m.userData.skipBounds = m !== fist; });
  g.add(fist, thumb, cuff);
  // World placement → hand-bone local
  const worldQ = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
  const center = hp.clone().addScaledVector(dir, 0.07);
  const ws = hand.getWorldScale(new THREE.Vector3()).x || 1;
  g.scale.setScalar(1 / ws);
  g.position.copy(hand.worldToLocal(center));
  g.quaternion.copy(hand.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(worldQ));
  hand.add(g);
  return { group: g, mat };
}

// ─── Pose maths ─────────────────────────────────────────────────────────────
const clamp01 = (t) => Math.min(1, Math.max(0, t));
const smooth = (t) => { const x = clamp01(t); return x * x * (3 - 2 * x); };
const easeOut = (t) => 1 - (1 - clamp01(t)) ** 3;
const easeIn = (t) => clamp01(t) ** 2;
const lerp = (a, b, t) => a + (b - a) * t;

/** Punch envelope: small wind-up, snap out, brief hold, relaxed recovery. */
function punchEnv(p) {
  if (p < 0.14) return -0.18 * smooth(p / 0.14);
  if (p < 0.38) return lerp(-0.18, 1, easeOut((p - 0.14) / 0.24));
  if (p < 0.55) return 1;
  return 1 - smooth((p - 0.55) / 0.45);
}
/** Kick envelope: chamber → extend → retract → plant. Returns [chamber, extend]. */
function kickEnv(p) {
  const chamber = p < 0.28 ? smooth(p / 0.28) : p < 0.8 ? 1 : 1 - smooth((p - 0.8) / 0.2);
  const extend = p < 0.28 ? 0 : p < 0.5 ? easeOut((p - 0.28) / 0.22) : p < 0.62 ? 1 : 1 - smooth((p - 0.62) / 0.2);
  return [chamber, extend];
}
/** Hit envelope: sharp snap then slow settle. */
function hitEnv(p) {
  return p < 0.12 ? easeOut(p / 0.12) : 1 - smooth((p - 0.12) / 0.88);
}

const POSE_KEYS = [
  'hipsY', 'spineX', 'spineY', 'spineZ', 'neckX', 'neckY',
  'lArmX', 'lArmY', 'lArmZ', 'lForeX', 'lForeY', 'lForeZ',
  'rArmX', 'rArmY', 'rArmZ', 'rForeX', 'rForeY', 'rForeZ',
  'lLegX', 'lLegZ', 'lKnee', 'lFoot', 'rLegX', 'rLegZ', 'rKnee', 'rFoot',
  'rootY', 'rootZ', 'rootX', 'rootRotX', 'rootRotY', 'rootRotZ', 'glowL', 'glowR', 'ground',
];
const zeroPose = () => ({ ...Object.fromEntries(POSE_KEYS.map((k) => [k, 0])), ground: 1 });

/** Arm values are written for the left arm; the right arm mirrors Y/Z. */
function setArm(P, side, x, y, z, fx, fy = 0, fz = 0) {
  const m = side === 'l' ? 1 : -1;
  P[`${side}ArmX`] = x; P[`${side}ArmY`] = y * m; P[`${side}ArmZ`] = z * m;
  P[`${side}ForeX`] = fx; P[`${side}ForeY`] = fy * m; P[`${side}ForeZ`] = fz * m;
}
function mixArm(P, side, w, x, y, z, fx, fy = 0, fz = 0) {
  const m = side === 'l' ? 1 : -1;
  P[`${side}ArmX`] = lerp(P[`${side}ArmX`], x, w);
  P[`${side}ArmY`] = lerp(P[`${side}ArmY`], y * m, w);
  P[`${side}ArmZ`] = lerp(P[`${side}ArmZ`], z * m, w);
  P[`${side}ForeX`] = lerp(P[`${side}ForeX`], fx, w);
  P[`${side}ForeY`] = lerp(P[`${side}ForeY`], fy * m, w);
  P[`${side}ForeZ`] = lerp(P[`${side}ForeZ`], fz * m, w);
}
function setLeg(P, side, x, z, knee, foot = 0) {
  const m = side === 'l' ? 1 : -1;
  P[`${side}LegX`] = x; P[`${side}LegZ`] = z * m; P[`${side}Knee`] = knee; P[`${side}Foot`] = foot;
}
function mixLeg(P, side, w, x, z, knee, foot = 0) {
  const m = side === 'l' ? 1 : -1;
  P[`${side}LegX`] = lerp(P[`${side}LegX`], x, w);
  P[`${side}LegZ`] = lerp(P[`${side}LegZ`], z * m, w);
  P[`${side}Knee`] = lerp(P[`${side}Knee`], knee, w);
  P[`${side}Foot`] = lerp(P[`${side}Foot`], foot, w);
}

/** Orthodox guard: lead (left) hand out at eye level, rear hand at the chin, knees soft. */
function guardPose(P, t, amp = 1) {
  // Layered, out-of-step rhythms so the guard breathes instead of ticking
  const bounce = Math.sin(t * 5.4);
  const sway = Math.sin(t * 1.3);
  const breath = Math.sin(t * 2.1);
  setArm(P, 'l', -0.95 + Math.sin(t * 2.6) * 0.05 * amp, 0, -0.32 + Math.sin(t * 1.9) * 0.04 * amp, -1.75 + Math.sin(t * 2.6 + 0.8) * 0.06 * amp);
  setArm(P, 'r', -0.62 + Math.sin(t * 2.3 + 1.7) * 0.04 * amp, 0, -0.42, -2.25 + Math.sin(t * 2.3 + 2.4) * 0.05 * amp);
  setLeg(P, 'l', -0.32, 0.07, 0.52 + bounce * 0.05 * amp, -0.18);
  setLeg(P, 'r', 0.08, 0.07, 0.5 + bounce * 0.05 * amp, -0.28);
  P.hipsY = -0.3 + sway * 0.05 * amp;
  P.spineZ = sway * 0.03 * amp;
  P.spineX = 0.1 + breath * 0.015;
  P.neckX = 0.1 - breath * 0.02;
  P.neckY = 0.24 - sway * 0.06 * amp; // eyes stay on the opponent while the body sways
}

/** Target pose for a state at progress p (0…1). */
function buildPose(state, p, t, meta) {
  const P = zeroPose();
  guardPose(P, t + meta.seed, state === 'idle' ? 1 : 0.35);
  switch (state) {
    case 'jab': {
      const e = punchEnv(p);
      mixArm(P, 'l', Math.max(0, e), -1.52, 0, -0.14, -0.02);
      P.spineY = -0.32 * e; P.hipsY -= 0.1 * e; P.rootZ = 0.07 * e; P.glowL = Math.max(0, e);
      break;
    }
    case 'cross': {
      const e = punchEnv(p);
      mixArm(P, 'r', Math.max(0, e), -1.52, 0, -0.26, -0.04);
      P.spineY = 0.55 * e; P.hipsY += 0.32 * e; P.spineX += 0.1 * e; P.rootZ = 0.12 * e;
      P.rKnee += 0.1 * e; P.rFoot -= 0.2 * e; P.glowR = Math.max(0, e);
      break;
    }
    case 'low_punch': {
      const e = punchEnv(p);
      mixArm(P, 'r', Math.max(0, e), -1.2, 0, -0.3, -0.1);
      P.spineX += 0.28 * e; P.spineY = 0.4 * e;
      P.lKnee += 0.35 * e; P.rKnee += 0.35 * e; P.rootZ = 0.1 * e; P.glowR = Math.max(0, e);
      break;
    }
    case 'hook': {
      const e = punchEnv(p);
      const wind = p < 0.18 ? smooth(p / 0.18) : 1 - smooth((p - 0.18) / 0.2);
      mixArm(P, 'l', Math.max(0, e), -1.4, 0.95, -0.1, -0.15, -1.55);
      P.spineY = 0.25 * wind - 0.62 * Math.max(0, e); P.hipsY -= 0.2 * Math.max(0, e);
      P.rootZ = 0.06 * e; P.lFoot -= 0.15 * e; P.glowL = Math.max(0, e);
      break;
    }
    case 'uppercut': {
      const dip = p < 0.25 ? smooth(p / 0.25) : 1 - smooth((p - 0.25) / 0.2);
      const e = p < 0.25 ? 0 : punchEnv((p - 0.2) / 0.8);
      mixArm(P, 'r', dip, -0.25, 0, -0.35, -1.35);
      mixArm(P, 'r', Math.max(0, e), -1.05, 0, -0.35, -1.5);
      P.lKnee += 0.4 * dip; P.rKnee += 0.4 * dip;
      P.spineX += 0.18 * dip - 0.16 * Math.max(0, e); P.spineY = 0.45 * Math.max(0, e);
      P.glowR = Math.max(0, e);
      break;
    }
    case 'kick': {
      const [c, x] = kickEnv(p);
      mixLeg(P, 'r', c, lerp(-1.25, -1.5, x), 0.02, lerp(1.9, 0.08, x), 0.4 * x);
      P.spineX -= 0.28 * c; P.rootZ = 0.1 * x;
      P.lKnee += 0.12 * c;
      break;
    }
    case 'roundhouse':
    case 'heavy_kick': {
      const big = state === 'heavy_kick' ? 1.25 : 1;
      const [c, x] = kickEnv(p);
      mixLeg(P, 'r', c, lerp(-0.7, -0.45, x), lerp(0.9, 1.35, x) * Math.min(big, 1.1), lerp(1.9, 0.1, x), 0.5 * x);
      P.spineZ = -0.42 * c * big; P.spineX -= 0.1 * c;
      P.rootRotY = -0.65 * c * big; P.lFoot -= 0.2 * c;
      P.rootZ = 0.08 * x;
      break;
    }
    case 'sweep': {
      const down = p < 0.25 ? smooth(p / 0.25) : p < 0.8 ? 1 : 1 - smooth((p - 0.8) / 0.2);
      const spin = smooth((p - 0.15) / 0.65);
      mixLeg(P, 'l', down, -1.0, 0.1, 2.1, 0.4);
      mixLeg(P, 'r', down, -0.2, 1.35, 0.1, 0);
      mixArm(P, 'l', down, -0.7, 0, -0.1, -0.2);
      mixArm(P, 'r', down, -0.7, 0, -0.1, -0.2);
      P.spineX += 0.45 * down;
      P.rootRotY = -Math.PI * 2 * spin * down;
      break;
    }
    case 'block':
    case 'block_kick': {
      const w = smooth(p / 0.15);
      mixArm(P, 'l', w, -0.72, 0, -0.52, -2.4, 0, -0.1);
      mixArm(P, 'r', w, -0.72, 0, -0.52, -2.4, 0, -0.1);
      P.neckX += 0.22 * w; P.spineX += 0.14 * w;
      if (state === 'block_kick') {
        mixLeg(P, 'l', w, -0.95, 0.12, 1.5, 0.2);
        mixArm(P, 'l', w, -0.35, 0, -0.35, -1.5);
      }
      break;
    }
    case 'dodge': {
      const w = p < 0.3 ? smooth(p / 0.3) : 1 - smooth((p - 0.55) / 0.45);
      const s = meta.dodgeSide;
      P.spineZ = 0.5 * s * w; P.spineX += 0.28 * w; P.rootX = -0.16 * s * w;
      P.lKnee += 0.5 * w; P.rKnee += 0.5 * w;
      break;
    }
    case 'advance':
    case 'retreat': {
      const s = state === 'advance' ? 1 : -1;
      P.rootZ = 0.05 * s * Math.sin(p * Math.PI);
      break;
    }
    case 'hit':
    case 'stagger':
    case 'kick_hit':
    case 'kick_heavy_hit': {
      const e = hitEnv(p);
      const big = state === 'stagger' || state === 'kick_heavy_hit' ? 1.6 : 1;
      if (state.startsWith('kick')) {
        P.spineX += 0.42 * e * big; P.spineZ = 0.28 * e * meta.hitSide; P.neckX += 0.2 * e;
        mixArm(P, 'l', e, -0.5, 0, -0.55, -1.9);
        mixArm(P, 'r', e, -0.5, 0, -0.55, -1.9);
      } else {
        P.neckX -= 0.5 * e; P.neckY += 0.3 * e * meta.hitSide; P.spineX -= 0.26 * e * big;
        P.spineY = 0.25 * e * meta.hitSide;
        mixArm(P, 'l', e * 0.6, -0.4, 0.3, 0, -1.3);
        mixArm(P, 'r', e * 0.6, -0.4, 0.3, 0, -1.3);
      }
      P.rootZ = -0.1 * e * big;
      if (state === 'stagger') P.spineZ += Math.sin(p * 14) * 0.18 * (1 - p);
      break;
    }
    case 'knockdown': {
      const back = smooth(p / 0.22);
      const fall = easeIn((p - 0.18) / 0.3);
      const settle = p > 0.48 ? Math.sin(clamp01((p - 0.48) / 0.12) * Math.PI) * 0.08 : 0;
      P.spineX -= 0.35 * back;
      P.neckX -= 0.4 * back;
      mixArm(P, 'l', fall, -2.3, 0, 0.7, -0.4);
      mixArm(P, 'r', fall, -2.3, 0, 0.7, -0.4);
      mixLeg(P, 'l', fall, -0.25, 0.15, 0.5, 0);
      mixLeg(P, 'r', fall, 0.05, 0.1, 0.25, 0);
      P.rootZ = -0.25 * back;
      P.rootRotX = -1.5 * fall;
      P.rootY = 0.1 * fall + settle;
      P.ground = 1 - fall;
      break;
    }
    case 'victory': {
      const w = smooth(p / 0.12);
      const hop = Math.abs(Math.sin(t * 5.5));
      mixArm(P, 'l', w, -2.85, 0, 0.3, -0.35);
      mixArm(P, 'r', w, -2.85, 0, 0.3, -0.35);
      P.neckX = lerp(P.neckX, -0.25, w); P.neckY = 0; P.hipsY = lerp(P.hipsY, 0, w);
      P.rootY = hop * 0.09 * w;
      mixLeg(P, 'l', w, -0.05, 0.05, 0.15 + hop * 0.2, 0);
      mixLeg(P, 'r', w, -0.05, 0.05, 0.15 + hop * 0.2, 0);
      P.glowL = P.glowR = 0.6 * w;
      break;
    }
    default: break;
  }
  return P;
}

const STATE_ALIASES = { celebrate: 'victory', attack: 'jab', punch: 'jab', heavy: 'cross', guard: 'idle' };
const FAST_STATES = new Set(['jab', 'cross', 'hook', 'uppercut', 'low_punch', 'kick', 'roundhouse', 'heavy_kick', 'sweep', 'hit', 'kick_hit', 'kick_heavy_hit', 'stagger', 'dodge', 'block', 'block_kick']);
const HOLD_STATES = new Set(['idle', 'victory', 'block']);

/**
 * Animated robot boxer, or null if the X Bot hasn't loaded yet.
 * height/footY let it stand exactly where the classic boxer stood.
 */
export function buildXbotBoxer({ team = 'blue', primary, accent, height = 1.85, footY = 0 } = {}) {
  const gltf = getXbotGltf();
  if (!gltf) return null;
  const kit = TEAM[team === 'red' ? 'red' : 'blue'];
  const body = primary || kit.body;
  const trunks = accent || kit.trunks;
  const model = skeletonClone(gltf.scene);
  paintRobotKit(model, boxerPalette({ body, trunks }), `box:${body}:${trunks}`, { bodyMetal: 0.35, bodyRough: 0.3 });
  normalizeFootballGlbScale(model, height);
  model.position.y += footY;
  const bones = xbotBones(model);
  const head = addRobotHead(model, { accent: kit.visor, tipColor: new THREE.Color(body).getHex() });
  const gloves = {
    l: attachGlove(model, bones, 'Left', kit.glove),
    r: attachGlove(model, bones, 'Right', kit.glove),
  };
  // Fingers curl away inside the gloves
  const fingers = Object.entries(bones)
    .filter(([n]) => /Hand(Thumb|Index|Middle|Ring|Pinky)1$/.test(n)).map(([, b]) => b);

  const rig = new THREE.Group();
  rig.name = 'BoxerRig';
  rig.add(model);
  const g = new THREE.Group();
  g.name = team === 'red' ? 'RedBoxer' : 'BlueBoxer';
  g.add(rig);
  // Feet stay planted: whatever the knees do, the lowest foot is kept at rest height
  const feet = ['LeftFoot', 'RightFoot', 'LeftToeBase', 'RightToeBase'].map((n) => bones[n]).filter(Boolean);
  const _fp = new THREE.Vector3();
  const lowestFoot = () => {
    let y = Infinity;
    const host = rig.parent || g; // after a swap the rig lives in the stand-in's group
    for (const f of feet) { f.getWorldPosition(_fp); host.worldToLocal(_fp); y = Math.min(y, _fp.y); }
    return y;
  };
  g.updateMatrixWorld(true);
  const restFootY = lowestFoot();

  const mixer = new THREE.AnimationMixer(model);
  const actions = {};
  gltf.animations.forEach((clip) => { actions[clip.name] = mixer.clipAction(clip); });
  let base = null;
  const playBase = (name, timeScale = 1) => {
    const next = actions[name] || actions.idle;
    if (!next) return;
    next.timeScale = timeScale;
    if (next === base) return;
    next.reset();
    if (base) { next.fadeIn(0.2); base.fadeOut(0.2); }
    next.play();
    base = next;
  };
  playBase('idle');

  let animState = 'idle';
  let animTimer = 0;
  let animDuration = 0.5;
  let timeScale = 1;
  let health = 1;
  let lastT = null;
  const meta = { dodgeSide: 1, hitSide: 1, seed: Math.random() * 20 };
  const cur = zeroPose();
  let first = true;

  const setAnimState = (next, dur = 0.5) => {
    const state = STATE_ALIASES[next] || next || 'idle';
    if (state === 'block' && animState === 'block') { animTimer = Math.max(animTimer, dur); return; }
    if ((animState === 'knockdown' && animTimer > 0.5 && state !== 'idle') || (animState === 'stagger' && animTimer > 0.3 && state === 'hit')) return;
    if (state === 'dodge') meta.dodgeSide *= -1;
    if (state.includes('hit') || state === 'stagger') meta.hitSide = Math.random() < 0.5 ? -1 : 1;
    animState = state;
    animDuration = Math.max(0.12, dur);
    animTimer = animDuration;
  };

  const q = new THREE.Quaternion();
  const pw = new THREE.Quaternion();
  const rootQ = new THREE.Quaternion();
  const rootQi = new THREE.Quaternion();
  const e = new THREE.Euler();
  /** Rotate a bone about model-space axes (X, then Y, then Z) on top of the clip pose. */
  // The mixer only writes a bone when its clip value changes (e.g. not during a
  // hit-stop freeze), so each frame starts from the clean clip pose we saved.
  const clipPose = new Map();
  const turn = (bone, x, y, z) => {
    if (!bone) return;
    if (!clipPose.has(bone)) clipPose.set(bone, new THREE.Quaternion());
    clipPose.get(bone).copy(bone.quaternion);
    if ((Math.abs(x) + Math.abs(y) + Math.abs(z)) < 1e-4) return;
    e.set(x, y, z, 'ZYX');
    q.setFromEuler(e);
    q.premultiply(rootQ).multiply(rootQi); // model space → world
    bone.parent.getWorldQuaternion(pw);
    const pwi = pw.clone().invert();
    bone.quaternion.premultiply(pwi.multiply(q).multiply(pw));
  };

  // Footwork: whenever the fight moves the boxer, the legs step at the real speed
  const NO_STEP = new Set(['kick', 'roundhouse', 'heavy_kick', 'sweep', 'knockdown', 'victory', 'block_kick']);
  const _hp = new THREE.Vector3();
  const _prev = new THREE.Vector3();
  const _fwd = new THREE.Vector3();
  const _ws = new THREE.Vector3();
  let havePrev = false;
  let moveSpeed = 0;
  let moveDir = 1;
  let walkW = 0;
  const updateFootwork = (dt) => {
    const host = rig.parent || g;
    host.getWorldPosition(_hp);
    let sp = 0;
    if (havePrev && dt > 0) {
      const dx = _hp.x - _prev.x;
      const dz = _hp.z - _prev.z;
      const hs = host.getWorldScale(_ws).x || 1;
      sp = Math.hypot(dx, dz) / dt / hs;
      if (sp > height * 8) sp = 0; // a teleport (reset / respawn), not a step
      host.getWorldDirection(_fwd);
      const along = (dx * _fwd.x + dz * _fwd.z) / (dt * (host.getWorldScale(_ws).x || 1));
      if (Math.abs(along) > height * 0.06) moveDir = along > 0 ? 1 : -1; // ignore tiny back-and-forth
    }
    _prev.copy(_hp);
    havePrev = true;
    moveSpeed += (sp - moveSpeed) * (1 - Math.exp(-8 * dt));
    const scripted = animState === 'advance' ? 1 : animState === 'retreat' ? -1 : 0;
    const stepping = !NO_STEP.has(animState) && (moveSpeed > height * 0.08 || scripted !== 0);
    walkW += ((stepping ? 1 : 0) - walkW) * (1 - Math.exp(-10 * dt));
    if (stepping) {
      const dir = moveSpeed > height * 0.08 ? moveDir : scripted;
      playBase('walk', dir * THREE.MathUtils.clamp(moveSpeed / (height * 0.5), 0.6, 1.6));
    } else {
      playBase('idle');
    }
  };

  const animate = (t, dt) => {
    if (dt == null) dt = lastT == null ? 1 / 60 : Math.min(0.1, Math.max(0, t - lastT));
    lastT = t;
    const sdt = Math.min(dt, 0.1) * timeScale;
    if (animTimer > 0) {
      animTimer -= sdt;
    } else if (!HOLD_STATES.has(animState)) {
      animState = 'idle';
    }
    const p = animTimer > 0 ? 1 - animTimer / animDuration : 1;
    const target = buildPose(animState, p, t, meta);
    const rate = animState === 'knockdown' ? 14 : FAST_STATES.has(animState) ? 30 : 12;
    const k = first ? 1 : 1 - Math.exp(-rate * Math.max(sdt, 1e-4));
    first = false;
    for (const key of POSE_KEYS) cur[key] += (target[key] - cur[key]) * k;

    updateFootwork(sdt);
    clipPose.forEach((cq, bone) => bone.quaternion.copy(cq));
    mixer.update(sdt);
    for (const f of fingers) f.scale.setScalar(0.02); // the clips reset finger scale

    // Root motion: bob, lunges, spins and the knockdown fall
    rig.position.set(cur.rootX * height, cur.rootY * height, cur.rootZ * height);
    rig.rotation.set(cur.rootRotX, cur.rootRotY, cur.rootRotZ);

    rig.updateMatrixWorld(true);
    model.getWorldQuaternion(rootQ);
    rootQi.copy(rootQ).invert();
    const B = bones;
    turn(B.Hips, 0, cur.hipsY * (1 - 0.5 * walkW), 0);
    turn(B.Spine, cur.spineX / 3, cur.spineY / 3, cur.spineZ / 3);
    turn(B.Spine1, cur.spineX / 3, cur.spineY / 3, cur.spineZ / 3);
    turn(B.Spine2, cur.spineX / 3, cur.spineY / 3, cur.spineZ / 3);
    turn(B.Neck, cur.neckX, cur.neckY, 0);
    turn(B.LeftArm, cur.lArmX, cur.lArmY, cur.lArmZ);
    turn(B.LeftForeArm, cur.lForeX, cur.lForeY, cur.lForeZ);
    turn(B.RightArm, cur.rArmX, cur.rArmY, cur.rArmZ);
    turn(B.RightForeArm, cur.rForeX, cur.rForeY, cur.rForeZ);
    // While stepping, the walk cycle owns the legs; the stance only adds soft knees
    const L = 1 - 0.7 * walkW;
    turn(B.LeftUpLeg, cur.lLegX * L, 0, cur.lLegZ * L);
    turn(B.LeftLeg, cur.lKnee * L, 0, 0);
    turn(B.LeftFoot, cur.lFoot * L, 0, 0);
    turn(B.RightUpLeg, cur.rLegX * L, 0, cur.rLegZ * L);
    turn(B.RightLeg, cur.rKnee * L, 0, 0);
    turn(B.RightFoot, cur.rFoot * L, 0, 0);
    if (feet.length && cur.ground > 0.01) {
      model.updateMatrixWorld(true);
      rig.position.y += (restFootY - lowestFoot()) * cur.ground;
    }

    // Glowing gloves on impact, visor flares on attacks and flickers when hurt
    if (gloves.l) gloves.l.mat.emissiveIntensity = cur.glowL * 0.55;
    if (gloves.r) gloves.r.mat.emissiveIntensity = cur.glowR * 0.55;
    if (head?.visor) {
      const hurt = animState === 'stagger' || animState === 'knockdown';
      head.visor.material.emissiveIntensity = hurt
        ? 0.3 + Math.abs(Math.sin(t * 22)) * 0.6
        : 1.3 + Math.max(cur.glowL, cur.glowR) * 1.2 - (1 - health) * 0.5;
    }
  };

  g.userData.isFighterHumanoid = true;
  g.userData.isCuteBoxer = true;
  g.userData.isXbotBoxer = true;
  g.userData.combatPBR = true;
  g.userData.skipStudioPaint = true;
  g.userData.leftGlove = gloves.l?.group;
  g.userData.rightGlove = gloves.r?.group;
  g.userData.setAnimState = setAnimState;
  g.userData.animate = animate;
  g.userData.setTimeScale = (s) => { timeScale = Math.max(0, s); };
  g.userData.setHealthPct = (pct) => { health = clamp01(pct > 1 ? pct / 100 : pct); };
  g.userData.setSkeletonDriven = () => {};
  animate(0, 1 / 60);
  return g;
}
