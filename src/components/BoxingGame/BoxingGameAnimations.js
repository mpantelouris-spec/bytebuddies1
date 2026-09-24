/**
 * Striker skeletal animations — hip-driven boxing with visible elbow/knee hinge arcs.
 * Keyframes follow wind-up → drive → impact → follow-through → recovery phases.
 */
const D = (x = 0, y = 0, z = 0) => ({ x, y, z });

export const BONE_NAMES = [
  'pelvis', 'spineBase', 'spineMid', 'spineTop', 'chest', 'neck', 'head',
  'leftShoulder', 'leftUpperArm', 'leftElbow', 'leftLowerArm', 'leftWrist',
  'rightShoulder', 'rightUpperArm', 'rightElbow', 'rightLowerArm', 'rightWrist',
  'leftHip', 'leftUpperLeg', 'leftKnee', 'leftLowerLeg',
  'rightHip', 'rightUpperLeg', 'rightKnee', 'rightLowerLeg',
];

const NEUTRAL = Object.fromEntries(BONE_NAMES.map((n) => [n, D()]));

/** Boxing guard — elbows bent ~20°, knees soft, slight crouch */
const GUARD = {
  ...NEUTRAL,
  leftElbow: D(0, 0, 20),
  rightElbow: D(0, 0, 20),
  leftShoulder: D(-6, -10, 5),
  rightShoulder: D(-6, 10, -5),
  leftKnee: D(0, 0, 5),
  rightKnee: D(0, 0, 5),
  spineBase: D(-4, 0, 0),
  spineMid: D(-3, 0, 0),
  chest: D(-5, 0, 0),
  neck: D(3, 0, 0),
  head: D(5, 0, 0),
  rightHip: D(-4, 0, 0),
  leftHip: D(2, 0, 0),
};

function clip(frames, poses, fps = 60) {
  const max = frames[frames.length - 1];
  const duration = max / fps;
  return frames.map((f, i) => ({
    t: f / max,
    pose: { ...GUARD, ...poses[i] },
    ease: poses[i]._ease || null,
  }));
}

function stripEase(pose) {
  const { _ease, ...rest } = pose;
  return rest;
}

function cleanKeys(keys) {
  return keys.map((k) => ({ t: k.t, pose: stripEase(k.pose), ease: k.ease }));
}

export const ANIMATIONS = {
  idle: {
    loop: true,
    duration: 4.0,
    keys: cleanKeys(clip(
      [0, 30, 60, 120, 180, 240],
      [
        GUARD,
        { ...GUARD, chest: D(-7, 0, 0), pelvis: D(0, 2, 0), leftKnee: D(0, 0, 8), rightKnee: D(0, 0, 6), head: D(7, 2, 0), leftElbow: D(0, 0, 22), rightElbow: D(0, 0, 18) },
        { ...GUARD, chest: D(-3, 0, 0), pelvis: D(0, -2, 0), leftKnee: D(0, 0, 5), rightKnee: D(0, 0, 9), head: D(4, -2, 0), neck: D(2, 0, 0) },
        { ...GUARD, chest: D(-6, 0, 0), leftShoulder: D(-7, -11, 4), rightShoulder: D(-7, 11, -4) },
        { ...GUARD, pelvis: D(0, 1, 0), head: D(6, 1, 2) },
        GUARD,
      ],
    )),
  },

  /** Jab — 0.12s, anticipation → snap extension → recovery */
  jab: {
    loop: false,
    duration: 0.12,
    keys: cleanKeys(clip(
      [0, 1, 2, 3, 4, 5, 6, 7],
      [
        { ...GUARD, _ease: 'easeIn' },
        { ...GUARD, leftShoulder: D(0, -5, 0), leftElbow: D(0, 0, 18), spineBase: D(-2, -3, 0), spineMid: D(0, -2, 0), pelvis: D(0, -2, 0), neck: D(2, -1, 0), _ease: 'easeIn' },
        { ...GUARD, leftShoulder: D(0, 10, 10), leftElbow: D(0, 0, 160), spineBase: D(3, 0, 0), pelvis: D(0, 2, 0), leftHip: D(3, 0, 0), chest: D(6, 0, 0), neck: D(4, 2, 0), head: D(6, 2, 0), _ease: 'linear' },
        { ...GUARD, leftShoulder: D(0, 15, 12), leftElbow: D(0, 0, 165), pelvis: D(0, 3, 0), leftHip: D(5, 0, 0), chest: D(8, 0, 0), neck: D(5, 3, 0), head: D(8, 3, 0), _ease: 'easeOut' },
        { ...GUARD, leftShoulder: D(0, 12, 10), leftElbow: D(0, 0, 165), pelvis: D(0, 2, 0), leftHip: D(3, 0, 0), _ease: 'linear' },
        { ...GUARD, leftShoulder: D(0, 3, 5), leftElbow: D(0, 0, 50), pelvis: D(0, 0, 0), leftHip: D(1, 0, 0), _ease: 'easeInOut' },
        { ...GUARD, leftElbow: D(0, 0, 22), _ease: 'easeOut' },
        GUARD,
      ],
    )),
  },

  /** Straight / cross — 0.16s, hip coil drives the punch */
  straight: {
    loop: false,
    duration: 0.16,
    keys: cleanKeys(clip(
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      [
        GUARD,
        { ...GUARD, leftShoulder: D(0, -10, 0), leftElbow: D(0, 0, 20), spineBase: D(-5, -8, 0), spineMid: D(-3, -5, 0), pelvis: D(0, -15, 0), leftHip: D(-8, 0, 0), neck: D(2, -5, 0), _ease: 'easeIn' },
        { ...GUARD, leftShoulder: D(0, -15, 0), leftElbow: D(0, 0, 18), spineBase: D(-6, -10, 0), spineMid: D(-4, -8, 0), pelvis: D(0, -20, 0), leftHip: D(-12, 0, 0), chest: D(-8, 0, 0), neck: D(0, -8, 0), head: D(-4, -8, 0), _ease: 'linear' },
        { ...GUARD, leftShoulder: D(0, -5, 5), leftElbow: D(0, 0, 150), spineBase: D(-2, -2, 0), spineMid: D(-1, -1, 0), pelvis: D(0, -10, 0), leftHip: D(0, 0, 0), _ease: 'linear' },
        { ...GUARD, leftShoulder: D(0, 5, 10), leftElbow: D(0, 0, 130), spineBase: D(2, 0, 0), spineMid: D(1, 0, 0), pelvis: D(0, 0, 0), leftHip: D(5, 0, 0), chest: D(5, 0, 0), _ease: 'linear' },
        { ...GUARD, leftShoulder: D(0, 20, 15), leftElbow: D(0, 0, 165), spineBase: D(4, 3, 0), spineMid: D(3, 2, 0), pelvis: D(0, 5, 0), leftHip: D(10, 0, 0), chest: D(12, 0, 0), neck: D(6, 0, 0), head: D(10, 0, 0), _ease: 'linear' },
        { ...GUARD, leftShoulder: D(0, 25, 15), leftElbow: D(0, 0, 170), pelvis: D(0, 8, 0), leftHip: D(12, 0, 0), chest: D(15, 0, 0), spineBase: D(5, 4, 0), head: D(12, 0, 0), _ease: 'easeOut' },
        { ...GUARD, leftShoulder: D(0, 22, 12), leftElbow: D(0, 0, 170), pelvis: D(0, 5, 0), _ease: 'linear' },
        { ...GUARD, leftShoulder: D(0, 8, 8), leftElbow: D(0, 0, 80), pelvis: D(0, 0, 0), leftHip: D(2, 0, 0), _ease: 'easeIn' },
        { ...GUARD, leftElbow: D(0, 0, 25), _ease: 'easeOut' },
        GUARD,
      ],
    )),
  },

  /** Heavy hook — 0.24s, maximum hip coil and body rotation */
  hook: {
    loop: false,
    duration: 0.24,
    keys: cleanKeys(clip(
      [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
      [
        GUARD,
        { ...GUARD, rightShoulder: D(-8, -20, 0), rightElbow: D(0, 0, 20), spineBase: D(-8, -15, 0), spineMid: D(-6, -12, 0), pelvis: D(0, -30, 0), rightHip: D(-15, 0, 0), chest: D(-10, 0, 0), neck: D(0, -8, 0), head: D(-6, -10, 0), leftKnee: D(0, 0, 12), rightKnee: D(0, 0, 8), _ease: 'easeIn' },
        { ...GUARD, rightShoulder: D(-12, -35, -10), rightElbow: D(0, 0, 0), spineBase: D(-12, -20, 0), spineMid: D(-10, -15, 0), pelvis: D(0, -40, 0), rightHip: D(-18, 0, 0), chest: D(-14, 0, 0), neck: D(-4, -10, 0), head: D(-8, -10, 0), leftKnee: D(0, 0, 18), rightKnee: D(0, 0, 5), _ease: 'easeIn' },
        { ...GUARD, rightShoulder: D(-15, -40, -15), rightElbow: D(0, 0, 0), spineBase: D(-14, -22, 0), spineMid: D(-12, -18, 0), pelvis: D(0, -45, 0), rightHip: D(-20, 0, 0), chest: D(-16, 0, 0), _ease: 'linear' },
        { ...GUARD, rightShoulder: D(-5, -20, 5), rightElbow: D(0, 0, 30), spineBase: D(-6, -10, 0), spineMid: D(-4, -8, 0), pelvis: D(0, -30, 0), rightHip: D(-5, 0, 0), _ease: 'easeOut' },
        { ...GUARD, rightShoulder: D(5, -5, 10), rightElbow: D(0, 0, 80), spineBase: D(-2, -3, 0), pelvis: D(0, -15, 0), rightHip: D(5, 0, 0), chest: D(4, 0, 0), _ease: 'linear' },
        { ...GUARD, rightShoulder: D(8, 10, 20), rightElbow: D(0, 0, 130), spineBase: D(2, 0, 0), spineMid: D(1, 0, 0), pelvis: D(0, 0, 0), rightHip: D(15, 0, 0), chest: D(8, 8, 0), _ease: 'linear' },
        { ...GUARD, rightShoulder: D(10, 25, 30), rightElbow: D(0, 0, 160), spineBase: D(5, 3, 0), spineMid: D(4, 2, 0), pelvis: D(0, 3, 0), rightHip: D(20, 0, 0), chest: D(12, 12, 0), neck: D(6, 5, 0), head: D(10, 5, 0), _ease: 'linear' },
        { ...GUARD, rightShoulder: D(8, 30, 35), rightElbow: D(0, 0, 170), pelvis: D(0, 5, 0), rightHip: D(22, 0, 0), chest: D(15, 15, 0), spineBase: D(6, 5, 0), head: D(14, 5, 0), _ease: 'easeOut' },
        { ...GUARD, rightShoulder: D(6, 28, 32), rightElbow: D(0, 0, 170), pelvis: D(0, 3, 0), _ease: 'linear' },
        { ...GUARD, rightShoulder: D(2, 20, 20), rightElbow: D(0, 0, 160), pelvis: D(0, 0, 0), _ease: 'linear' },
        { ...GUARD, rightShoulder: D(0, 8, 10), rightElbow: D(0, 0, 90), pelvis: D(0, -5, 0), rightHip: D(5, 0, 0), _ease: 'easeIn' },
        { ...GUARD, rightShoulder: D(0, 2, 5), rightElbow: D(0, 0, 35), _ease: 'easeInOut' },
        { ...GUARD, rightElbow: D(0, 0, 22), _ease: 'easeOut' },
        GUARD,
      ],
    )),
  },

  /** Light kick — 6 frames / 0.10s, hip opens then leg whips */
  kick: {
    loop: false,
    duration: 0.10,
    keys: cleanKeys(clip(
      [0, 1, 2, 3, 4, 5, 6],
      [
        GUARD,
        { ...GUARD, leftHip: D(25, 10, 0), leftKnee: D(0, 0, -10), rightKnee: D(0, 0, 15), pelvis: D(0, 5, 0), spineBase: D(-5, 0, 0), _ease: 'easeIn' },
        { ...GUARD, leftHip: D(40, 15, 0), leftKnee: D(0, 0, 150), pelvis: D(0, 8, 0), spineBase: D(2, 0, 0), chest: D(5, 0, 0), rightKnee: D(0, 0, 18), _ease: 'linear' },
        { ...GUARD, leftHip: D(50, 18, 0), leftKnee: D(0, 0, 165), pelvis: D(0, 8, 0), spineBase: D(3, 0, 0), chest: D(6, 0, 0), spineMid: D(-8, 0, 0), _ease: 'linear' },
        { ...GUARD, leftHip: D(50, 18, 0), leftKnee: D(0, 0, 165), pelvis: D(0, 8, 0), _ease: 'easeOut' },
        { ...GUARD, leftHip: D(20, 0, 0), leftKnee: D(0, 0, 30), pelvis: D(0, 0, 0), spineBase: D(0, 0, 0), rightKnee: D(0, 0, 5), _ease: 'easeInOut' },
        { ...GUARD, leftKnee: D(0, 0, 8), _ease: 'easeOut' },
        GUARD,
      ],
    )),
  },

  /** Roundhouse — 10 frames / 0.16s, full-body spin */
  roundhouse: {
    loop: false,
    duration: 0.16,
    keys: cleanKeys(clip(
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      [
        GUARD,
        { ...GUARD, pelvis: D(0, -20, 0), leftHip: D(30, -15, 0), leftKnee: D(0, 0, -60), rightKnee: D(0, 0, 15), spineBase: D(-8, -10, 0), spineMid: D(-6, -8, 0), chest: D(-8, 0, 0), _ease: 'easeIn' },
        { ...GUARD, pelvis: D(0, -35, 0), leftHip: D(45, -20, 0), leftKnee: D(0, 0, -80), rightKnee: D(0, 0, 20), spineBase: D(-12, -15, 0), spineMid: D(-10, -12, 0), chest: D(-10, 0, 0), head: D(-8, -10, 0), _ease: 'easeIn' },
        { ...GUARD, pelvis: D(0, -15, 0), leftHip: D(40, 0, 0), leftKnee: D(0, 0, 160), spineBase: D(-4, -5, 0), spineMid: D(-2, -3, 0), _ease: 'linear' },
        { ...GUARD, pelvis: D(0, 0, 0), leftHip: D(35, 10, 0), leftKnee: D(0, 0, 165), spineBase: D(2, 5, 0), chest: D(10, 18, 0), rightShoulder: D(0, -15, 0), _ease: 'linear' },
        { ...GUARD, pelvis: D(0, 5, 0), leftHip: D(30, 15, 0), leftKnee: D(0, 0, 168), spineBase: D(4, 8, 0), chest: D(12, 20, 0), spineMid: D(3, 10, 0), _ease: 'linear' },
        { ...GUARD, pelvis: D(0, 8, 0), leftHip: D(25, 18, 0), leftKnee: D(0, 0, 170), chest: D(14, 22, 0), spineBase: D(5, 10, 0), head: D(8, 12, 0), _ease: 'easeOut' },
        { ...GUARD, pelvis: D(0, 6, 0), leftKnee: D(0, 0, 170), leftHip: D(22, 12, 0), _ease: 'linear' },
        { ...GUARD, pelvis: D(0, 3, 0), leftKnee: D(0, 0, 100), leftHip: D(15, 0, 0), spineBase: D(2, 3, 0), _ease: 'easeInOut' },
        { ...GUARD, pelvis: D(0, 0, 0), leftKnee: D(0, 0, 40), leftHip: D(5, 0, 0), _ease: 'easeInOut' },
        { ...GUARD, leftKnee: D(0, 0, 8), _ease: 'easeOut' },
        GUARD,
      ],
    )),
  },

  /** Heavy kick — 16 frames / 0.27s, maximum coil and spin */
  haymaker: {
    loop: false,
    duration: 0.27,
    keys: cleanKeys(clip(
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      [
        GUARD,
        { ...GUARD, pelvis: D(0, -30, 0), leftHip: D(50, -25, 0), leftKnee: D(0, 0, -70), spineBase: D(-12, -20, 0), spineMid: D(-10, -15, 0), chest: D(-10, 0, 0), rightKnee: D(0, 0, 20), head: D(-10, 0, 0), _ease: 'easeIn' },
        { ...GUARD, pelvis: D(0, -40, 0), leftHip: D(60, -30, 0), leftKnee: D(0, 0, -90), spineBase: D(-14, -22, 0), spineMid: D(-12, -18, 0), chest: D(-12, 0, 0), head: D(-12, 0, 0), rightKnee: D(0, 0, 22), _ease: 'easeIn' },
        { ...GUARD, pelvis: D(0, -30, 0), leftHip: D(55, -10, 0), leftKnee: D(0, 0, -30), spineBase: D(-8, -12, 0), _ease: 'easeOut' },
        { ...GUARD, pelvis: D(0, -15, 0), leftHip: D(50, 0, 0), leftKnee: D(0, 0, 60), spineBase: D(-4, -5, 0), spineMid: D(-2, -3, 0), _ease: 'linear' },
        { ...GUARD, pelvis: D(0, 0, 0), leftHip: D(40, 15, 0), leftKnee: D(0, 0, 170), spineBase: D(8, 20, 0), spineMid: D(6, 15, 0), chest: D(14, 20, 0), rightShoulder: D(0, -25, 0), leftShoulder: D(0, 20, 0), _ease: 'linear' },
        { ...GUARD, pelvis: D(0, 5, 0), leftHip: D(35, 20, 0), leftKnee: D(0, 0, 172), chest: D(16, 22, 0), spineBase: D(10, 22, 0), head: D(12, 8, 0), _ease: 'easeOut' },
        { ...GUARD, pelvis: D(0, 8, 0), leftKnee: D(0, 0, 172), leftHip: D(32, 18, 0), _ease: 'linear' },
        { ...GUARD, pelvis: D(0, 6, 0), leftKnee: D(0, 0, 165), _ease: 'linear' },
        { ...GUARD, pelvis: D(0, 4, 0), leftKnee: D(0, 0, 120), leftHip: D(18, 8, 0), spineBase: D(4, 8, 0), _ease: 'easeIn' },
        { ...GUARD, pelvis: D(0, 2, 0), leftKnee: D(0, 0, 70), leftHip: D(10, 0, 0), _ease: 'easeIn' },
        { ...GUARD, pelvis: D(0, 0, 0), leftKnee: D(0, 0, 35), _ease: 'easeInOut' },
        { ...GUARD, leftKnee: D(0, 0, 15), _ease: 'easeInOut' },
        { ...GUARD, leftKnee: D(0, 0, 8), _ease: 'easeOut' },
        GUARD,
        GUARD,
        GUARD,
      ],
    )),
  },

  /** Sweep — 7 frames / 0.12s, crouch low kick, guaranteed knockdown */
  sweep: {
    loop: false,
    duration: 0.12,
    keys: cleanKeys(clip(
      [0, 1, 2, 3, 4, 5, 6, 7],
      [
        GUARD,
        { ...GUARD, leftKnee: D(0, 0, 40), rightKnee: D(0, 0, 40), spineBase: D(20, 0, 0), pelvis: D(0, -15, 0), chest: D(15, 0, 0), leftShoulder: D(10, 0, 0), rightShoulder: D(10, 0, 0), _ease: 'easeIn' },
        { ...GUARD, leftHip: D(20, 10, 0), leftKnee: D(0, 0, -40), rightKnee: D(0, 0, 25), spineBase: D(15, 0, 0), pelvis: D(0, -8, 0), _ease: 'linear' },
        { ...GUARD, leftHip: D(35, 15, 0), leftKnee: D(0, 0, 150), spineBase: D(18, 0, 0), pelvis: D(0, 8, 0), chest: D(12, 0, 0), _ease: 'linear' },
        { ...GUARD, leftHip: D(35, 15, 0), leftKnee: D(0, 0, 150), spineBase: D(20, 0, 0), _ease: 'easeOut' },
        { ...GUARD, leftHip: D(10, 0, 0), leftKnee: D(0, 0, 20), spineBase: D(5, 0, 0), pelvis: D(0, 0, 0), leftKnee: D(0, 0, 25), rightKnee: D(0, 0, 8), _ease: 'easeInOut' },
        { ...GUARD, leftKnee: D(0, 0, 8), rightKnee: D(0, 0, 8), spineBase: D(0, 0, 0), _ease: 'easeOut' },
        GUARD,
      ],
    )),
  },

  block: {
    loop: true,
    duration: 0.15,
    keys: [{
      t: 0,
      pose: {
        ...GUARD,
        leftShoulder: D(15, 0, 0), rightShoulder: D(15, 0, 0),
        leftElbow: D(0, 0, 90), rightElbow: D(0, 0, 90),
        spineBase: D(10, 0, 0), spineMid: D(8, 0, 0), chest: D(10, 0, 0),
        neck: D(12, 0, 0), head: D(18, 0, 0),
        pelvis: D(0, -8, 0), leftKnee: D(0, 0, 15), rightKnee: D(0, 0, 15),
      },
    }],
  },

  advance: {
    loop: false,
    duration: 0.2,
    keys: cleanKeys(clip(
      [0, 4, 8, 12],
      [GUARD,
        { ...GUARD, rightHip: D(30, 0, 0), rightKnee: D(0, 0, 20), pelvis: D(0, -4, 0), spineBase: D(0, 4, 0) },
        { ...GUARD, leftHip: D(30, 0, 0), leftKnee: D(0, 0, 20), pelvis: D(0, 4, 0), spineBase: D(0, -3, 0) },
        GUARD],
    )),
  },

  retreat: {
    loop: false,
    duration: 0.2,
    keys: cleanKeys(clip(
      [0, 4, 8, 12],
      [GUARD,
        { ...GUARD, leftHip: D(-25, 0, 0), leftKnee: D(0, 0, 14), pelvis: D(0, 4, 0) },
        { ...GUARD, rightHip: D(-25, 0, 0), rightKnee: D(0, 0, 14), pelvis: D(0, -4, 0) },
        GUARD],
    )),
  },

  hit: {
    loop: false,
    duration: 0.13,
    keys: cleanKeys(clip(
      [0, 2, 4, 6],
      [
        { ...GUARD, spineBase: D(10, 0, 0), head: D(-15, 0, 0), pelvis: D(0, -6, 0), leftShoulder: D(8, 0, 0), rightShoulder: D(8, 0, 0), neck: D(-8, 0, 0) },
        { ...GUARD, spineBase: D(18, 0, 0), head: D(-25, 0, 0), neck: D(-12, 0, 0), leftElbow: D(0, 0, 8), rightElbow: D(0, 0, 8), pelvis: D(0, -10, 0) },
        { ...GUARD, spineBase: D(8, 0, 0), head: D(-12, 0, 0), _ease: 'easeOut' },
        GUARD,
      ],
    )),
  },

  stagger: {
    loop: false,
    duration: 0.35,
    keys: cleanKeys(clip(
      [0, 4, 10, 14],
      [
        { ...GUARD, spineBase: D(18, 0, 0), head: D(-25, 0, 0), pelvis: D(0, -12, 0), leftKnee: D(0, 0, 22), rightKnee: D(0, 0, 22), neck: D(-10, 0, 0) },
        { ...GUARD, spineBase: D(28, 0, 0), head: D(-35, 0, 0), pelvis: D(0, -8, 0), leftShoulder: D(12, 0, 0), rightShoulder: D(12, 0, 0) },
        { ...GUARD, spineBase: D(12, 0, 0), head: D(-18, 0, 0), _ease: 'easeOut' },
        GUARD,
      ],
    )),
  },

  knockdown: {
    loop: false,
    duration: 0.55,
    keys: cleanKeys(clip(
      [0, 2, 5, 8, 12, 16],
      [
        { ...GUARD, spineBase: D(25, 0, 0), head: D(-35, 0, 0), leftShoulder: D(20, 0, 0), rightShoulder: D(20, 0, 0), pelvis: D(0, -20, 0), neck: D(-15, 0, 0) },
        { ...GUARD, pelvis: D(0, 40, 0), spineBase: D(55, 0, 0), spineMid: D(45, 0, 0), head: D(20, 0, 0), leftKnee: D(0, 0, 70), rightKnee: D(0, 0, 70), leftElbow: D(0, 0, 45), rightElbow: D(0, 0, 45), leftShoulder: D(35, 0, 0), rightShoulder: D(35, 0, 0) },
        { ...NEUTRAL, pelvis: D(0, 75, 0), spineBase: D(72, 0, 0), spineMid: D(65, 0, 0), head: D(28, 0, 0), leftKnee: D(0, 0, 92), rightKnee: D(0, 0, 92), leftElbow: D(0, 0, 30), rightElbow: D(0, 0, 30) },
        { ...NEUTRAL, pelvis: D(0, 88, 0), spineBase: D(78, 0, 0), head: D(32, 0, 0), leftKnee: D(0, 0, 96), rightKnee: D(0, 0, 96) },
        { ...NEUTRAL, pelvis: D(0, 92, 0), spineBase: D(80, 0, 0), head: D(30, 0, 0) },
        { ...NEUTRAL, pelvis: D(0, 92, 0), spineBase: D(80, 0, 0), head: D(28, 0, 0) },
      ],
    )),
  },

  standUp: {
    loop: false,
    duration: 0.4,
    keys: cleanKeys(clip(
      [0, 5, 12, 18, 24],
      [
        { ...NEUTRAL, pelvis: D(0, 75, 0), spineBase: D(55, 0, 0), leftElbow: D(0, 0, 50), rightElbow: D(0, 0, 50), leftKnee: D(0, 0, 80), rightKnee: D(0, 0, 80) },
        { ...GUARD, pelvis: D(0, 35, 0), spineBase: D(25, 0, 0), leftKnee: D(0, 0, 55), rightKnee: D(0, 0, 55), leftElbow: D(0, 0, 40), rightElbow: D(0, 0, 40) },
        { ...GUARD, pelvis: D(0, 12, 0), spineBase: D(8, 0, 0), leftKnee: D(0, 0, 25), rightKnee: D(0, 0, 25) },
        { ...GUARD, pelvis: D(0, 3, 0), spineBase: D(-3, 0, 0), head: D(6, 0, 0), leftElbow: D(0, 0, 25), rightElbow: D(0, 0, 25) },
        GUARD,
      ],
    )),
  },
};

export const COMBAT_TO_SKELETAL = {
  jab: 'jab', high_punch: 'jab', light_punch: 'jab', attack: 'jab', attack_light: 'jab',
  cross: 'straight', strong: 'straight', fierce: 'straight', uppercut: 'straight',
  heavy_punch: 'hook', hook: 'hook', attack_heavy: 'hook', slam: 'hook',
  low_kick: 'kick', kick_low: 'kick', short_kick: 'kick', light_kick: 'kick',
  high_kick: 'roundhouse', kick: 'roundhouse', roundhouse: 'roundhouse',
  heavy_kick: 'haymaker',
  sweep: 'sweep',
  block: 'block', advance_step: 'advance', move_toward_enemy: 'advance',
  retreat_step: 'retreat', move_away_enemy: 'retreat',
  knockdown: 'knockdown', hit: 'hit', stagger: 'stagger',
};

export function resolveSkeletalAnim(actionOrState) {
  if (!actionOrState) return 'idle';
  return COMBAT_TO_SKELETAL[actionOrState] || 'idle';
}

function easeIn(t) { return t * t; }
function easeOut(t) { return 1 - (1 - t) ** 2; }
function easeInOut(t) { return t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2; }
function easeLinear(t) { return t; }

function applyEase(t, mode) {
  switch (mode) {
    case 'easeIn': return easeIn(t);
    case 'easeOut': return easeOut(t);
    case 'easeInOut': return easeInOut(t);
    case 'linear': return easeLinear(t);
    default: return easeOut(t);
  }
}

function lerpPose(a, b, t) {
  const out = {};
  const names = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
  names.forEach((name) => {
    const pa = a[name] || { x: 0, y: 0, z: 0 };
    const pb = b[name] || { x: 0, y: 0, z: 0 };
    out[name] = {
      x: pa.x + (pb.x - pa.x) * t,
      y: pa.y + (pb.y - pa.y) * t,
      z: pa.z + (pb.z - pa.z) * t,
    };
  });
  return out;
}

export function sampleAnimation(animName, timeSec) {
  const anim = ANIMATIONS[animName] || ANIMATIONS.idle;
  const dur = anim.duration;
  let t = anim.loop ? (timeSec % dur) / dur : Math.min(1, timeSec / dur);
  if (t <= 0) return anim.keys[0].pose;
  for (let i = 1; i < anim.keys.length; i++) {
    if (anim.keys[i].t >= t) {
      const a = anim.keys[i - 1];
      const b = anim.keys[i];
      const raw = (t - a.t) / Math.max(0.0001, b.t - a.t);
      const segEase = b.ease || (animName === 'idle' ? 'easeInOut' : 'easeOut');
      return lerpPose(a.pose, b.pose, applyEase(raw, segEase));
    }
  }
  return anim.keys[anim.keys.length - 1].pose;
}
