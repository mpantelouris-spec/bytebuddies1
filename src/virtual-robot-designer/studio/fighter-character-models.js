/**
 * Spec-accurate fighting-game robots — Striker (player) & Training Dummy (opponent).
 * Geometry, materials, emissive values, and glow behavior match the design brief.
 */
import * as THREE from 'three';

const PI = Math.PI;

function mesh(geometry, material) {
  const m = new THREE.Mesh(geometry, material);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/** Box with top edge at local origin — geometry hangs down from the bone pivot */
function pivotBox(w, h, d, material) {
  const geo = new THREE.BoxGeometry(w, h, d);
  geo.translate(0, -h * 0.5, 0);
  return mesh(geo, material);
}

function matStd(color, metalness = 0.7, roughness = 0.3, emissive = null, emissiveIntensity = 0) {
  const m = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    metalness,
    roughness,
  });
  if (emissive) {
    m.emissive = new THREE.Color(emissive);
    m.emissiveIntensity = emissiveIntensity;
  }
  return m;
}

function matGloveRed() {
  return new THREE.MeshPhongMaterial({
    color: new THREE.Color('#FF0000'),
    shininess: 60,
    specular: new THREE.Color('#888888'),
    emissive: new THREE.Color('#440000'),
    emissiveIntensity: 0.5,
  });
}

function matGloveBronze() {
  return new THREE.MeshPhongMaterial({
    color: new THREE.Color('#CD7F32'),
    shininess: 40,
    specular: new THREE.Color('#666666'),
    emissive: new THREE.Color('#000000'),
    emissiveIntensity: 0,
  });
}

/**
 * Shared angular mech-boxer body. Boxy armored silhouette — visored head,
 * broad chest with pauldrons, gauntlet forearms, armored legs and boots.
 * Returns all rig references; callers skin it with their own materials.
 */
export function buildMechBoxer({
  bodyMat, darkMat, jointMat, gloveMat, accentMat,
  coreMat, eyeMat, browMat, withCrest, withCoreLight,
  withGloves = true,
}) {
  const g = new THREE.Group();

  // ── PELVIS / ABDOMEN / CHEST ─────────────────────────────────────────────
  const torsoGrp = new THREE.Group();
  torsoGrp.name = 'Torso_Group';
  g.add(torsoGrp);

  const pelvis = mesh(new THREE.BoxGeometry(0.4, 0.18, 0.3), darkMat);
  pelvis.position.y = 0.05;
  torsoGrp.add(pelvis);

  const abdomen = mesh(new THREE.BoxGeometry(0.42, 0.3, 0.3), bodyMat);
  abdomen.position.y = 0.28;
  torsoGrp.add(abdomen);

  const chest = mesh(new THREE.BoxGeometry(0.6, 0.42, 0.38), bodyMat);
  chest.position.y = 0.62;
  torsoGrp.add(chest);

  // Chest armor plate with recessed core socket
  const plate = mesh(new THREE.BoxGeometry(0.5, 0.3, 0.05), accentMat);
  plate.position.set(0, 0.64, 0.2);
  torsoGrp.add(plate);

  // Angled pec plates
  [-1, 1].forEach((sx) => {
    const pec = mesh(new THREE.BoxGeometry(0.2, 0.14, 0.04), darkMat);
    pec.position.set(sx * 0.16, 0.74, 0.225);
    pec.rotation.z = -sx * 0.12;
    torsoGrp.add(pec);
  });

  // CORE — recessed energy sphere
  const core = mesh(new THREE.SphereGeometry(0.09, 32, 20), coreMat);
  core.position.set(0, 0.6, 0.22);
  torsoGrp.add(core);

  let coreLight = null;
  if (withCoreLight) {
    coreLight = new THREE.PointLight(0x00bfff, 1.6, 2.6, 2);
    coreLight.position.set(0, 0.6, 0.28);
    torsoGrp.add(coreLight);
  }

  // Pauldrons (shoulder armor)
  [-1, 1].forEach((sx) => {
    const pauldron = mesh(new THREE.BoxGeometry(0.26, 0.16, 0.3), accentMat);
    pauldron.position.set(sx * 0.42, 0.86, 0);
    torsoGrp.add(pauldron);
  });

  // ── NECK + HEAD ──────────────────────────────────────────────────────────
  const neck = mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.14, 10), jointMat);
  neck.position.y = 0.9;
  torsoGrp.add(neck);

  const headGrp = new THREE.Group();
  headGrp.name = 'Head_Group';
  headGrp.position.y = 1.12;
  torsoGrp.add(headGrp);

  const head = mesh(new THREE.BoxGeometry(0.3, 0.28, 0.3), bodyMat);
  headGrp.add(head);

  // Dark faceplate
  const face = mesh(new THREE.BoxGeometry(0.24, 0.18, 0.03), darkMat);
  face.position.set(0, 0, 0.155);
  headGrp.add(face);

  // Brow visor strip (glowing on Striker, dead on dummy)
  const brow = mesh(new THREE.BoxGeometry(0.28, 0.05, 0.04), browMat);
  brow.position.set(0, 0.09, 0.15);
  headGrp.add(brow);

  // Eye LEDs
  const eyeGeo = new THREE.SphereGeometry(0.032, 16, 10);
  const leftEye = mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.065, 0.01, 0.165);
  const rightEye = mesh(eyeGeo, eyeMat.clone());
  rightEye.position.set(0.065, 0.01, 0.165);
  headGrp.add(leftEye, rightEye);

  // Jaw guard
  const jaw = mesh(new THREE.BoxGeometry(0.26, 0.07, 0.26), jointMat);
  jaw.position.set(0, -0.14, 0.02);
  headGrp.add(jaw);

  if (withCrest) {
    const fin = mesh(new THREE.BoxGeometry(0.03, 0.12, 0.24), accentMat);
    fin.position.set(0, 0.19, -0.02);
    headGrp.add(fin);
  }

  // ── ARMS — TWO real pivots: shoulder (upper arm) and elbow (forearm) ────
  // Previously the whole arm was one rigid group swinging from the shoulder,
  // so the "elbow" was a decorative sphere that never actually bent — a
  // punch looked like a stiff stick rotating, not an arm extending. The
  // forearm is now its own nested group hinged at the elbow, animated
  // independently (bent while guarding/coiling, straightening on extension).
  const gloveRefs = [];
  const armGrps = [];
  [[-0.42, 'left', 0], [0.42, 'right', 1]].forEach(([x, side, si]) => {
    const armGrp = new THREE.Group();
    armGrp.name = `${side}_arm`;
    armGrp.position.set(x, 0.82, 0);
    torsoGrp.add(armGrp);

    const shoulder = mesh(new THREE.SphereGeometry(0.11, 20, 14), jointMat);
    armGrp.add(shoulder);

    const upperArm = mesh(new THREE.BoxGeometry(0.13, 0.3, 0.13), bodyMat);
    upperArm.position.y = -0.17;
    armGrp.add(upperArm);

    // Elbow pivot — a second, independent joint nested inside the shoulder pivot
    const forearmGrp = new THREE.Group();
    forearmGrp.name = `${side}_forearm`;
    forearmGrp.position.y = -0.34;
    armGrp.add(forearmGrp);

    const elbow = mesh(new THREE.SphereGeometry(0.085, 16, 12), jointMat);
    forearmGrp.add(elbow);

    // Gauntlet forearm — chunkier than the upper arm (positions now relative to the elbow)
    const forearm = mesh(new THREE.BoxGeometry(0.16, 0.28, 0.16), accentMat);
    forearm.position.y = -0.16;
    forearmGrp.add(forearm);

    if (withGloves) {
      const glove = mesh(new THREE.SphereGeometry(0.14, 24, 16), gloveMat);
      glove.scale.set(1.0, 0.9, 1.15);
      glove.position.set(0, -0.38, 0.04);
      glove.name = `${side}Glove`;
      forearmGrp.add(glove);
      const knuckle = mesh(new THREE.BoxGeometry(0.16, 0.1, 0.05), gloveMat.clone());
      knuckle.position.set(0, -0.38, 0.18);
      forearmGrp.add(knuckle);
      gloveRefs.push({ glove, si });
      if (side === 'left') g.userData.leftGlove = glove;
      if (side === 'right') g.userData.rightGlove = glove;
    } else {
      const hand = mesh(new THREE.SphereGeometry(0.07, 16, 12), gloveMat);
      hand.position.set(0, -0.36, 0.02);
      forearmGrp.add(hand);
    }
    armGrps.push({ grp: armGrp, forearmGrp, si });
  });

  // ── LEGS — hip → thigh → knee → shin → foot (meshes are children of pivots) ─
  const THIGH_LEN = 0.34;
  const SHIN_LEN = 0.34;
  const HIP_ATTACH_Y = -0.03;
  const legGrps = [];
  [[-0.17, 0], [0.17, 1]].forEach(([x, li]) => {
    // Static hip socket — never rotates; stays welded to pelvis
    const hipSocket = mesh(new THREE.SphereGeometry(0.11, 16, 12), jointMat);
    hipSocket.position.set(x, HIP_ATTACH_Y, 0.01);
    torsoGrp.add(hipSocket);

    const hipCollar = mesh(new THREE.BoxGeometry(0.14, 0.08, 0.12), darkMat);
    hipCollar.position.set(x, HIP_ATTACH_Y + 0.02, 0.04);
    torsoGrp.add(hipCollar);

    // Hip pivot — ONLY rotation drives the kick; position never changes
    const hipGrp = new THREE.Group();
    hipGrp.name = li === 0 ? 'left_hip' : 'right_hip';
    hipGrp.position.set(x, HIP_ATTACH_Y, 0);
    hipGrp.rotation.order = 'YXZ';
    torsoGrp.add(hipGrp);

    const thighGrp = new THREE.Group();
    thighGrp.name = 'thigh_pivot';
    hipGrp.add(thighGrp);

    const thigh = pivotBox(0.16, THIGH_LEN, 0.17, bodyMat);
    thighGrp.add(thigh);

    const shinGrp = new THREE.Group();
    shinGrp.name = 'shin_pivot';
    shinGrp.position.y = -THIGH_LEN;
    thighGrp.add(shinGrp);

    const knee = mesh(new THREE.SphereGeometry(0.09, 16, 12), jointMat);
    shinGrp.add(knee);

    const kneePad = mesh(new THREE.BoxGeometry(0.14, 0.1, 0.06), accentMat);
    kneePad.position.set(0, -0.02, 0.09);
    shinGrp.add(kneePad);

    const shin = pivotBox(0.14, SHIN_LEN, 0.15, bodyMat);
    shinGrp.add(shin);

    const ankleGrp = new THREE.Group();
    ankleGrp.name = 'ankle_pivot';
    ankleGrp.position.y = -SHIN_LEN;
    shinGrp.add(ankleGrp);

    const boot = mesh(new THREE.BoxGeometry(0.18, 0.12, 0.34), darkMat);
    boot.position.set(0, -0.06, 0.06);
    ankleGrp.add(boot);
    const toeCap = mesh(new THREE.BoxGeometry(0.18, 0.08, 0.08), accentMat);
    toeCap.position.set(0, -0.04, 0.24);
    ankleGrp.add(toeCap);

    legGrps.push({
      hipGrp,
      legGrp: hipGrp,
      thighGrp,
      shinGrp,
      ankleGrp,
      li,
      hipX: x,
      hipY: HIP_ATTACH_Y,
      footY: -(THIGH_LEN + SHIN_LEN + 0.1),
    });
  });

  return { g, torsoGrp, headGrp, armGrps, legGrps, core, coreLight, gloveRefs, eyeRefs: [leftEye, rightEye], browRef: brow };
}

/** Striker — cobalt blue armored boxer: cyan core/visor, red gloves */
export function buildSpecStriker() {
  const parts = buildMechBoxer({
    bodyMat: matStd('#0047AB', 0.7, 0.32),
    darkMat: matStd('#0E1B33', 0.6, 0.42),
    jointMat: matStd('#C0C0C0', 0.9, 0.18),
    accentMat: matStd('#003580', 0.72, 0.3),
    gloveMat: matGloveRed(),
    coreMat: matStd('#00BFFF', 0.5, 0.35, '#00BFFF', 3.0),
    eyeMat: matStd('#FF0000', 0.5, 0.2, '#FF0000', 2.0),
    browMat: matStd('#00BFFF', 0.6, 0.2, '#00BFFF', 1.6),
    withCrest: true,
    withCoreLight: true,
  });
  const g = parts.g;
  g.name = 'Striker';

  // Red racing stripes down the sides of the head
  const stripeMat = matStd('#FF0000', 0.45, 0.4, '#FF0000', 0.4);
  [-1, 1].forEach((side) => {
    const stripe = mesh(new THREE.BoxGeometry(0.02, 0.2, 0.26), stripeMat);
    stripe.position.set(side * 0.16, 0.02, 0);
    parts.headGrp.add(stripe);
  });

  attachSpecCombatRig(g, {
    variant: 'striker',
    isDummy: false,
    torsoGrp: parts.torsoGrp,
    headGrp: parts.headGrp,
    armGrps: parts.armGrps,
    legGrps: parts.legGrps,
    core: parts.core,
    coreLight: parts.coreLight,
    coreParticles: null,
    gloveRefs: parts.gloveRefs,
    eyeRefs: parts.eyeRefs,
    visorRef: parts.browRef,
    glowCol: '#00BFFF',
    guardX: -1.15,
    energyLines: [],
  });

  g.userData.isFighterHumanoid = true;
  g.userData.isSpecStriker = true;
  g.userData.combatPBR = true;
  g.userData.core = parts.core;
  return g;
}

/** Training Dummy — bronze/gold, dim, bolted training equipment */
export function buildSpecTrainingDummy() {
  const parts = buildMechBoxer({
    bodyMat: matStd('#CD7F32', 0.55, 0.5),
    darkMat: matStd('#5A3A1A', 0.5, 0.55),
    jointMat: matStd('#B8860B', 0.5, 0.42),
    accentMat: matStd('#B8860B', 0.5, 0.48),
    gloveMat: matGloveBronze(),
    coreMat: matStd('#FFAA00', 0.6, 0.4, '#220000', 0.3),
    eyeMat: matStd('#FFAA00', 0.7, 0.3, '#000000', 0.0),
    browMat: matStd('#704214', 0.5, 0.55),
    withCrest: false,
    withCoreLight: false,
  });
  const g = parts.g;
  g.name = 'TrainingDummy';

  // Red X target on the chest
  const xMat = new THREE.MeshBasicMaterial({ color: 0xE03030 });
  [-1, 1].forEach((sx) => {
    const mark = mesh(new THREE.BoxGeometry(0.3, 0.045, 0.02), xMat);
    mark.rotation.z = sx * PI / 4;
    mark.position.set(0, 0.62, 0.235);
    parts.torsoGrp.add(mark);
  });

  // Bolted feet — training equipment
  const boltMat = matStd('#1A1A1A', 0.8, 0.2);
  parts.legGrps.forEach(({ hipGrp, footY }) => {
    const bolt = mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.08, 8), boltMat);
    bolt.position.set(0, footY ?? -0.78, -0.06);
    hipGrp.add(bolt);
  });

  attachSpecCombatRig(g, {
    variant: 'dummy',
    isDummy: true,
    torsoGrp: parts.torsoGrp,
    headGrp: parts.headGrp,
    armGrps: parts.armGrps,
    legGrps: parts.legGrps,
    core: parts.core,
    coreLight: null,
    coreParticles: null,
    gloveRefs: parts.gloveRefs,
    eyeRefs: parts.eyeRefs,
    visorRef: null,
    glowCol: '#FFAA00',
    guardX: -1.15,
    energyLines: [],
  });

  g.userData.isFighterHumanoid = true;
  g.userData.isSpecDummy = true;
  g.userData.combatPBR = true;
  g.userData.core = parts.core;
  return g;
}

function attachSpecCombatRig(g, {
  variant, isDummy, torsoGrp, headGrp, armGrps, legGrps, core, coreLight,
  coreParticles, gloveRefs, eyeRefs, visorRef, glowCol, guardX, energyLines = [],
}) {
  let animState = 'idle';
  let animTimer = 0;
  let animDuration = 0.5;
  let animPhase = 0;
  let glowL = 0;
  let glowR = 0;
  let damageFlash = 0;
  let linePhase = 0;
  let skeletonDriven = false;
  let animTimeScale = 1;

  const lerp = (a, b, t) => a + (b - a) * Math.min(1, Math.max(0, t));
  const clamp01 = (t) => Math.min(1, Math.max(0, t));
  const smooth = (t) => {
    const x = clamp01(t);
    return x * x * (3 - 2 * x);
  };
  const easeIn = (t) => clamp01(t) ** 2;
  const easeOut = (t) => 1 - (1 - clamp01(t)) ** 2;
  const easeInOut = (t) => {
    const x = clamp01(t);
    return x < 0.5 ? 2 * x * x : 1 - ((-2 * x + 2) ** 2) / 2;
  };
  const easeInOutCubic = (t) => {
    const x = clamp01(t);
    return x < 0.5 ? 4 * x * x * x : 1 - ((-2 * x + 2) ** 3) / 2;
  };
  /** Sample keyed poses with smoothstep — predictable fighting-game motion */
  function samplePoseKeys(keys, p) {
    if (p <= keys[0].t) return { ...keys[0] };
    if (p >= keys[keys.length - 1].t) return { ...keys[keys.length - 1] };
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i];
      const b = keys[i + 1];
      if (p >= a.t && p <= b.t) {
        const u = smooth((p - a.t) / (b.t - a.t));
        const out = { t: p };
        for (const k of Object.keys(a)) {
          if (k !== 't' && k !== 'ease' && typeof a[k] === 'number') {
            out[k] = a[k] + (b[k] - a[k]) * u;
          }
        }
        return out;
      }
    }
    return { ...keys[keys.length - 1] };
  }

  const _kickEulerA = new THREE.Euler(0, 0, 0, 'YXZ');
  const _kickEulerB = new THREE.Euler(0, 0, 0, 'YXZ');
  const _kickQuatA = new THREE.Quaternion();
  const _kickQuatB = new THREE.Quaternion();
  const _kickQuatR = new THREE.Quaternion();

  function segmentEase(mode, t) {
    switch (mode) {
      case 'easeIn': return easeIn(t);
      case 'easeOut': return easeOut(t);
      case 'linear': return clamp01(t);
      case 'easeWhip': {
        const x = clamp01(t);
        if (x < 0.55) return easeIn(x / 0.55) * 1.04;
        return 1.04 - easeOut((x - 0.55) / 0.45) * 0.04;
      }
      default: return easeInOutCubic(t);
    }
  }

  /** Hit reactions — fast impact, elastic settle (not symmetric sine pop) */
  function reactEnvelope(p, peakAt = 0.16) {
    const x = clamp01(p);
    if (x <= peakAt) return easeOut(x / peakAt);
    const u = (x - peakAt) / (1 - peakAt);
    const base = 1 - easeInOutCubic(u);
    const wobble = Math.sin(u * Math.PI * 2.4) * 0.07 * (1 - u);
    return Math.max(0, base + wobble);
  }

  function reactLayer(p, delay = 0) {
    const t = clamp01((p - delay) / Math.max(0.08, 1 - delay * 0.9));
    return reactEnvelope(t);
  }

  /** Natural kick sampler — SLERP hips, eased segments, full-body pose */
  function sampleKickPose(keys, p) {
    if (p <= keys[0].t) return { ...keys[0] };
    if (p >= keys[keys.length - 1].t) return { ...keys[keys.length - 1] };
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i];
      const b = keys[i + 1];
      if (p >= a.t && p <= b.t) {
        const raw = (p - a.t) / (b.t - a.t);
        const u = segmentEase(b.ease, raw);
        const out = { t: p };

        _kickEulerA.set(a.lh ?? 0, a.lhy ?? 0, a.lhz ?? 0);
        _kickEulerB.set(b.lh ?? 0, b.lhy ?? 0, b.lhz ?? 0);
        _kickQuatA.setFromEuler(_kickEulerA);
        _kickQuatB.setFromEuler(_kickEulerB);
        _kickQuatR.slerpQuaternions(_kickQuatA, _kickQuatB, u);
        _kickEulerA.setFromQuaternion(_kickQuatR);
        out.lh = _kickEulerA.x;
        out.lhy = _kickEulerA.y;
        out.lhz = _kickEulerA.z;

        for (const k of Object.keys(a)) {
          if (k === 't' || k === 'ease') continue;
          if (['lh', 'lhy', 'lhz'].includes(k)) continue;
          if (typeof a[k] === 'number' && typeof b[k] === 'number') {
            out[k] = a[k] + (b[k] - a[k]) * u;
          }
        }
        return out;
      }
    }
    return { ...keys[keys.length - 1] };
  }

  /** Phased punch: wind-up → extension → follow-through → recovery */
  function punchPhases(p) {
    const wind = p < 0.12 ? p / 0.12 : 1;
    const ext = p < 0.12 ? 0 : p < 0.45 ? (p - 0.12) / 0.33 : p < 0.58 ? 1 : Math.max(0, 1 - (p - 0.58) / 0.42);
    const hip = p < 0.08 ? 0 : p < 0.5 ? (p - 0.08) / 0.42 : Math.max(0, 1 - (p - 0.5) / 0.5);
    const rec = p > 0.55 ? Math.min(1, (p - 0.55) / 0.45) : 0;
    return { wind, ext, hip, rec };
  }

  /** Heavy attack — longer wind-up, hip leads */
  function heavyPhases(p) {
    const wind = p < 0.18 ? p / 0.18 : 1;
    const ext = p < 0.18 ? 0 : p < 0.42 ? (p - 0.18) / 0.24 : p < 0.55 ? 1 : Math.max(0, 1 - (p - 0.55) / 0.45);
    const hip = p < 0.15 ? p / 0.15 : p < 0.52 ? 1 : Math.max(0, 1 - (p - 0.52) / 0.48);
    const rec = p > 0.6 ? Math.min(1, (p - 0.6) / 0.4) : 0;
    return { wind, ext, hip, rec };
  }

  const KNEE_STAND_BEND = -0.14;
  const THIGH_REST_LEAD = 0.22;
  const THIGH_REST_REAR = -0.14;
  const GUARD_TORSO_Y = 0.3;
  const ELBOW_GUARD_BEND = -1.05;

  // Natural kick poses — anticipation → chamber → snap → impact → follow-through → recovery
  // lh/lhy/lhz = lead hip, ls = knee, lax = ankle, rh/rs = posting leg
  // tx/ty/tz = torso, hx/hz = head, px/gz/gy = weight shift, la/ra = arms
  const G = GUARD_TORSO_Y;
  const KICK_KEYFRAMES = {
    kick: [
      { t: 0,    lh: 0.22, ls: -0.14, lhy: 0, lhz: 0, lax: 0, rh: -0.14, rs: -0.14, rhy: 0, tx: 0, ty: G, tz: 0, hx: 0, hz: 0, px: 0, gz: 0, gy: 0, la: 0, ra: 0, laz: 0.12, raz: -0.12, cs: 1 },
      { t: 0.05, lh: 0.16, ls: -0.26, lhy: 0.02, lax: 0, rh: -0.18, rs: -0.18, rhy: -0.02, tx: -0.02, ty: G + 0.02, tz: -0.02, hx: 0.01, hz: -0.02, px: -0.02, gz: -0.02, la: 0.04, ra: -0.08, laz: 0.12, raz: -0.08, ease: 'easeOut' },
      { t: 0.14, lh: -0.18, ls: -0.88, lhy: 0.05, lax: -0.10, rh: -0.04, rs: -0.30, rhy: -0.03, tx: 0.05, ty: 0.31, tz: -0.05, hx: 0.02, hz: -0.06, px: -0.03, gz: -0.04, gy: 0.008, la: 0.10, ra: -0.18, laz: 0.16, raz: 0.04, ease: 'easeOut' },
      { t: 0.24, lh: -0.52, ls: -1.18, lhy: 0.08, lax: -0.08, rh: 0.02, rs: -0.34, rhy: -0.02, tx: 0.07, ty: 0.29, tz: -0.09, hx: 0.03, hz: -0.09, px: -0.045, gz: -0.03, gy: 0.014, la: 0.14, ra: -0.24, laz: 0.20, raz: 0.08, ease: 'easeOut' },
      { t: 0.32, lh: -0.66, ls: -1.26, lhy: 0.09, lax: -0.06, rh: 0.06, rs: -0.36, rhy: 0, tx: 0.08, ty: 0.27, tz: -0.10, hx: 0.04, hz: -0.10, px: -0.05, gz: -0.02, gy: 0.016, la: 0.16, ra: -0.28, laz: 0.22, raz: 0.10, ease: 'easeOut' },
      { t: 0.38, lh: -0.68, ls: -0.62, lhy: 0.09, lax: -0.02, rh: 0.08, rs: -0.34, rhy: 0.01, tx: 0.06, ty: 0.25, tz: -0.09, hx: 0.03, hz: -0.09, px: -0.03, gz: 0.02, la: 0.14, ra: -0.26, laz: 0.18, raz: 0.12, ease: 'easeIn' },
      { t: 0.46, lh: -1.00, ls: 0.10, lhy: 0.05, lhz: 0.02, lax: 0.14, rh: 0.10, rs: -0.32, rhy: 0.02, tx: -0.03, ty: 0.17, tz: -0.11, hx: -0.01, hz: -0.11, px: 0.02, gz: 0.11, gy: 0.008, la: 0.08, ra: -0.34, laz: 0.12, raz: 0.16, ease: 'easeWhip' },
      { t: 0.54, lh: -1.06, ls: 0.16, lhy: 0.04, lhz: 0.02, lax: 0.16, rh: 0.10, rs: -0.30, rhy: 0.02, tx: -0.04, ty: 0.15, tz: -0.11, hx: -0.02, hz: -0.11, px: 0.02, gz: 0.12, la: 0.06, ra: -0.36, laz: 0.10, raz: 0.18, ease: 'linear' },
      { t: 0.64, lh: -0.72, ls: -0.22, lhy: 0.03, lax: 0.08, rh: 0.04, rs: -0.26, rhy: 0, tx: -0.01, ty: 0.21, tz: -0.07, hx: 0, hz: -0.07, px: 0.01, gz: 0.07, la: 0.06, ra: -0.20, laz: 0.12, raz: 0.10, ease: 'easeIn' },
      { t: 0.76, lh: -0.28, ls: -0.48, lhy: 0.01, lax: 0.02, rh: -0.04, rs: -0.20, rhy: 0, tx: 0.02, ty: 0.25, tz: -0.03, hx: 0.01, hz: -0.03, px: 0, gz: 0.03, la: 0.04, ra: -0.14, laz: 0.12, raz: 0.04, ease: 'easeInOut' },
      { t: 0.88, lh: 0.08, ls: -0.16, lhy: 0, lax: 0, rh: -0.10, rs: -0.14, rhy: 0, tx: 0, ty: G, tz: 0, hx: 0, hz: 0, px: 0, gz: 0.01, la: 0, ra: 0, laz: 0.12, raz: -0.12, ease: 'easeIn' },
      { t: 1.0,  lh: 0.22, ls: -0.14, lhy: 0, lhz: 0, lax: 0, rh: -0.14, rs: -0.14, rhy: 0, tx: 0, ty: G, tz: 0, hx: 0, hz: 0, px: 0, gz: 0, gy: 0, la: 0, ra: 0, laz: 0.12, raz: -0.12, cs: 1 },
    ],
    heavy_kick: [
      { t: 0,    lh: 0.22, ls: -0.14, lhy: 0, lhz: 0, lax: 0, rh: -0.14, rs: -0.14, rhy: 0, tx: 0, ty: G, tz: 0, hx: 0, hz: 0, px: 0, gz: 0, gy: 0, la: 0, ra: 0, laz: 0.12, raz: -0.12, cs: 1 },
      { t: 0.06, lh: 0.14, ls: -0.32, lhy: 0.03, lax: 0, rh: -0.16, rs: -0.20, rhy: -0.02, tx: -0.02, ty: G + 0.03, tz: -0.02, hx: 0.01, px: -0.025, gz: -0.03, la: 0.06, ra: -0.10, ease: 'easeOut' },
      { t: 0.14, lh: -0.08, ls: -0.78, lhy: 0.07, lax: -0.06, rh: 0, rs: -0.28, rhy: -0.02, tx: 0.06, ty: 0.32, tz: -0.06, hx: 0.02, gz: -0.05, gy: 0.012, la: 0.12, ra: -0.16, ease: 'easeOut' },
      { t: 0.24, lh: -0.38, ls: -1.08, lhy: 0.10, lax: -0.06, rh: 0.04, rs: -0.32, rhy: 0, tx: 0.09, ty: 0.29, tz: -0.10, hx: 0.03, gz: -0.04, gy: 0.018, la: 0.16, ra: -0.22, ease: 'easeOut' },
      { t: 0.34, lh: -0.72, ls: -1.32, lhy: 0.12, lax: -0.08, rh: 0.08, rs: -0.36, rhy: 0.01, tx: 0.10, ty: 0.26, tz: -0.13, hx: 0.04, gz: -0.03, gy: 0.024, la: 0.20, ra: -0.28, laz: 0.24, raz: 0.10, ease: 'easeOut' },
      { t: 0.42, lh: -0.82, ls: -1.38, lhy: 0.13, lax: -0.08, rh: 0.10, rs: -0.38, rhy: 0.02, tx: 0.10, ty: 0.24, tz: -0.14, hx: 0.05, gz: -0.02, gy: 0.026, la: 0.22, ra: -0.32, ease: 'easeOut' },
      { t: 0.48, lh: -0.84, ls: -0.48, lhy: 0.13, lax: 0.04, rh: 0.12, rs: -0.36, rhy: 0.02, tx: 0.07, ty: 0.22, tz: -0.12, la: 0.18, ra: -0.28, ease: 'easeIn' },
      { t: 0.56, lh: -1.22, ls: 0.18, lhy: -0.04, lhz: 0.03, lax: 0.18, rh: 0.10, rs: -0.32, rhy: 0.03, tx: -0.05, ty: 0.12, tz: -0.14, hx: -0.03, gz: 0.14, gy: 0.01, la: 0.06, ra: -0.38, cs: 1.08, ease: 'easeWhip' },
      { t: 0.66, lh: -1.28, ls: 0.22, lhy: -0.05, lhz: 0.03, lax: 0.18, rh: 0.08, rs: -0.30, rhy: 0.02, tx: -0.06, ty: 0.10, tz: -0.14, hx: -0.03, gz: 0.15, la: 0.04, ra: -0.40, cs: 1.12, ease: 'linear' },
      { t: 0.76, lh: -0.58, ls: -0.35, lhy: 0.01, lax: 0.06, rh: 0.02, rs: -0.22, rhy: 0, tx: 0.02, ty: 0.20, tz: -0.06, gz: 0.06, la: 0.06, ra: -0.18, cs: 1.06, ease: 'easeIn' },
      { t: 0.86, lh: 0.06, ls: -0.14, lhy: 0, lax: 0, rh: -0.08, rs: -0.14, rhy: 0, tx: 0.04, ty: G, tz: 0.01, hx: 0.03, gz: 0.02, cs: 1.02, ease: 'easeIn' },
      { t: 1.0,  lh: 0.22, ls: -0.14, lhy: 0, lhz: 0, lax: 0, rh: -0.14, rs: -0.14, rhy: 0, tx: 0, ty: G, tz: 0, hx: 0, hz: 0, px: 0, gz: 0, gy: 0, la: 0, ra: 0, laz: 0.12, raz: -0.12, cs: 1 },
    ],
    roundhouse: [
      { t: 0,    lh: 0.22, ls: -0.14, lhy: 0, lhz: 0, lax: 0, rh: -0.14, rs: -0.14, rhy: 0, tx: 0, ty: G, tz: 0, hx: 0, hz: 0, px: 0, gz: 0, gy: 0, la: 0, ra: 0, laz: 0.12, raz: -0.12, cs: 1 },
      { t: 0.06, lh: -0.04, ls: -0.58, lhy: 0.12, lax: 0, rh: -0.02, rs: -0.22, rhy: -0.02, tx: 0.02, ty: 0.30, tz: -0.04, hx: 0.02, gz: -0.02, la: 0.06, ra: -0.10, ease: 'easeOut' },
      { t: 0.16, lh: -0.28, ls: -1.02, lhy: 0.24, lax: -0.04, rh: 0.04, rs: -0.28, rhy: 0, tx: 0.04, ty: 0.27, tz: -0.08, hx: 0.03, gz: -0.01, gy: 0.01, la: 0.04, ra: -0.18, laz: 0.18, raz: 0.06, ease: 'easeOut' },
      { t: 0.26, lh: -0.48, ls: -1.20, lhy: 0.34, lax: -0.06, rh: 0.06, rs: -0.30, rhy: 0.01, tx: 0.03, ty: 0.24, tz: -0.10, hx: 0.03, gz: 0, gy: 0.012, la: 0.02, ra: -0.22, laz: 0.20, raz: 0.08, ease: 'easeOut' },
      { t: 0.36, lh: -0.62, ls: -1.26, lhy: 0.42, lax: -0.04, rh: 0.08, rs: -0.32, rhy: 0.02, tx: 0.01, ty: 0.20, tz: -0.08, la: 0, ra: -0.24, ease: 'easeOut' },
      { t: 0.44, lh: -0.72, ls: -0.42, lhy: 0.48, lax: 0.04, rh: 0.08, rs: -0.30, rhy: 0.02, tx: -0.01, ty: 0.16, tz: 0.02, hx: 0, hz: 0.02, gz: 0.04, ease: 'easeIn' },
      { t: 0.52, lh: -0.96, ls: 0.10, lhy: 0.62, lhz: 0.04, lax: 0.12, rh: 0.06, rs: -0.26, rhy: 0.02, tx: -0.03, ty: 0.12, tz: 0.08, hx: -0.01, hz: 0.06, gz: 0.10, la: -0.04, ra: -0.32, ease: 'easeWhip' },
      { t: 0.62, lh: -1.02, ls: 0.14, lhy: 0.68, lhz: 0.04, lax: 0.14, rh: 0.05, rs: -0.24, rhy: 0.01, tx: -0.04, ty: 0.10, tz: 0.10, hx: -0.02, hz: 0.08, gz: 0.11, la: -0.06, ra: -0.34, ease: 'linear' },
      { t: 0.74, lh: -0.48, ls: -0.38, lhy: 0.28, lax: 0.04, rh: -0.02, rs: -0.18, rhy: 0, tx: 0.01, ty: 0.20, tz: 0.04, gz: 0.05, la: 0, ra: -0.14, ease: 'easeIn' },
      { t: 0.86, lh: 0.06, ls: -0.14, lhy: 0.04, lax: 0, rh: -0.10, rs: -0.14, rhy: 0, tx: 0, ty: G, tz: 0, hx: 0, gz: 0.01, ease: 'easeIn' },
      { t: 1.0,  lh: 0.22, ls: -0.14, lhy: 0, lhz: 0, lax: 0, rh: -0.14, rs: -0.14, rhy: 0, tx: 0, ty: G, tz: 0, hx: 0, hz: 0, px: 0, gz: 0, gy: 0, la: 0, ra: 0, laz: 0.12, raz: -0.12, cs: 1 },
    ],
    sweep: [
      { t: 0,    lh: 0.22, ls: -0.14, lhy: 0, lax: 0, rh: -0.14, rs: -0.14, rhy: 0, tx: 0, ty: G, tz: 0, hx: 0, hz: 0, px: 0, gz: 0, gy: 0, la: 0, ra: 0, laz: 0.12, raz: -0.12 },
      { t: 0.08, lh: 0.12, ls: -0.36, lhy: 0, lax: 0, rh: -0.04, rs: -0.28, rhy: 0, tx: 0.16, ty: 0.28, tz: 0, hx: 0.06, gz: -0.05, gy: -0.05, la: 0.10, ra: 0.10, ease: 'easeOut' },
      { t: 0.18, lh: -0.02, ls: -0.50, lhy: 0.02, lax: -0.06, rh: 0, rs: -0.32, rhy: 0, tx: 0.22, ty: 0.24, tz: 0.01, hx: 0.08, hz: 0.01, gz: -0.03, gy: -0.08, la: 0.08, ra: 0.08, ease: 'easeOut' },
      { t: 0.30, lh: -0.38, ls: -0.28, lhy: 0.04, lax: -0.04, rh: 0.02, rs: -0.34, rhy: 0, tx: 0.24, ty: 0.22, tz: 0.02, hx: 0.09, gz: -0.02, gy: -0.10, la: 0.06, ra: 0.06, ease: 'easeOut' },
      { t: 0.42, lh: -0.58, ls: 0.14, lhy: 0.06, lax: 0.12, rh: 0.04, rs: -0.30, rhy: 0.01, tx: 0.20, ty: 0.20, tz: 0.04, hx: 0.08, hz: 0.03, gz: 0.07, gy: -0.08, la: 0.06, ra: 0.06, ease: 'easeWhip' },
      { t: 0.52, lh: -0.58, ls: 0.14, lhy: 0.06, lax: 0.14, rh: 0.04, rs: -0.28, rhy: 0.01, tx: 0.20, ty: 0.20, tz: 0.04, hx: 0.08, hz: 0.03, gz: 0.08, gy: -0.07, ease: 'linear' },
      { t: 0.68, lh: -0.22, ls: -0.18, lhy: 0.02, lax: 0.04, rh: -0.02, rs: -0.20, rhy: 0, tx: 0.10, ty: G + 0.02, tz: 0.01, hx: 0.04, gz: 0.03, gy: -0.04, ease: 'easeIn' },
      { t: 0.84, lh: 0.06, ls: -0.14, lhy: 0, lax: 0, rh: -0.10, rs: -0.14, rhy: 0, tx: 0.02, ty: G, tz: 0, hx: 0.02, gz: 0.01, gy: -0.01, ease: 'easeIn' },
      { t: 1.0,  lh: 0.22, ls: -0.14, lhy: 0, lax: 0, rh: -0.14, rs: -0.14, rhy: 0, tx: 0, ty: G, tz: 0, hx: 0, hz: 0, px: 0, gz: 0, gy: 0, la: 0, ra: 0, laz: 0.12, raz: -0.12 },
    ],
  };

  function applyKeyframeKick(lead, rear, pose, bob = 0) {
    const leadHip = lead?.hipGrp || lead?.legGrp;
    const rearHip = rear?.hipGrp || rear?.legGrp;
    if (leadHip) {
      leadHip.rotation.order = 'YXZ';
      leadHip.rotation.set(pose.lh, pose.lhy || 0, pose.lhz || 0);
      if (lead.thighGrp) lead.thighGrp.rotation.set(0, 0, 0);
    }
    if (lead?.shinGrp) lead.shinGrp.rotation.set(pose.ls, 0, 0);
    if (lead?.ankleGrp) {
      const kneeExt = Math.max(0, pose.ls);
      const ankleBase = pose.lax ?? (kneeExt > 0 ? kneeExt * 0.42 : pose.ls * 0.18);
      lead.ankleGrp.rotation.x = ankleBase;
    }
    if (rearHip) {
      rearHip.rotation.order = 'YXZ';
      rearHip.rotation.set(pose.rh, pose.rhy || 0, 0);
      if (rear.thighGrp) rear.thighGrp.rotation.set(0, 0, 0);
    }
    if (rear?.shinGrp) {
      const plant = Math.max(0, pose.gz || 0) * 0.35;
      rear.shinGrp.rotation.set((pose.rs ?? -0.14) - plant, 0, 0);
    }
    if (rear?.ankleGrp) {
      const dig = Math.max(0, pose.gz || 0) * 0.12;
      rear.ankleGrp.rotation.set(-dig, 0, 0);
    }

    torsoGrp.rotation.x = Math.max(-0.08, Math.min(0.08, pose.tx));
    torsoGrp.rotation.y = pose.ty;
    torsoGrp.rotation.z = pose.tz || 0;
    headGrp.rotation.x = pose.hx ?? pose.tx * 0.55;
    headGrp.rotation.y = pose.hy ?? -pose.ty * 0.42;
    headGrp.rotation.z = pose.hz ?? (pose.tz || 0) * 0.85;

    g.position.x = pose.px || 0;
    g.position.y = bob;
    g.position.z = pose.gz || 0;

    if (core) {
      const cs = pose.cs ?? 1;
      core.scale.setScalar(cs);
    }
  }

  function applyKeyframeKickArms(pose) {
    armGrps.forEach(({ grp, forearmGrp, si }) => {
      const lead = si === 0 ? -0.12 : 0.06;
      const guardArmX = guardX + lead;
      if (si === 0) {
        grp.rotation.x = guardArmX + (pose.la || 0);
        grp.rotation.z = pose.laz ?? 0.12;
        grp.position.z = Math.max(0, (pose.gz || 0) * 0.35);
        if (forearmGrp) forearmGrp.rotation.x = ELBOW_GUARD_BEND + (pose.la || 0) * 0.25;
      } else {
        grp.rotation.x = guardArmX + (pose.ra || 0);
        grp.rotation.z = pose.raz ?? -0.12;
        grp.position.z = Math.max(0, (pose.gz || 0) * 0.5);
        if (forearmGrp) {
          const ext = Math.abs(pose.ra || 0);
          forearmGrp.rotation.x = lerp(ELBOW_GUARD_BEND, -0.42, Math.min(1, ext * 1.3));
        }
      }
    });
  }

  function kickPoseProgress(p, anim) {
    const keys = KICK_KEYFRAMES[anim];
    if (!keys) return null;
    return sampleKickPose(keys, p);
  }

  function kickStrikeIntensity(pose) {
    const kneeExt = Math.max(0, pose.ls);
    const hipDrive = Math.abs(pose.lh) > 0.85 ? 1 : 0;
    const lunge = Math.max(0, pose.gz || 0) * 4;
    return Math.min(1, Math.max(kneeExt, hipDrive * 0.85, lunge));
  }

  /** Straight/cross — hip coil then explode */
  function crossPhases(p) {
    const coil = p < 0.15 ? p / 0.15 : p < 0.25 ? 1 : Math.max(0, 1 - (p - 0.25) / 0.2);
    const ext = p < 0.15 ? 0 : p < 0.48 ? (p - 0.15) / 0.33 : p < 0.6 ? 1 : Math.max(0, 1 - (p - 0.6) / 0.4);
    const hip = p < 0.12 ? 0 : p < 0.5 ? (p - 0.12) / 0.38 : Math.max(0, 1 - (p - 0.5) / 0.5);
    const rec = p > 0.58 ? Math.min(1, (p - 0.58) / 0.42) : 0;
    return { coil, ext, hip, rec };
  }

  // Elbow/knee resting bend — limbs never lock straight at rest

  function resetLegRotations(legEntry, li) {
    const hip = legEntry?.hipGrp || legEntry?.legGrp;
    if (!hip) return;
    hip.rotation.set(li === 0 ? THIGH_REST_LEAD : THIGH_REST_REAR, 0, 0);
    if (legEntry.thighGrp) legEntry.thighGrp.rotation.set(0, 0, 0);
    if (legEntry.shinGrp) legEntry.shinGrp.rotation.set(KNEE_STAND_BEND, 0, 0);
    if (legEntry.ankleGrp) legEntry.ankleGrp.rotation.set(0, 0, 0);
  }

  function resetLimbPose() {
    armGrps.forEach(({ grp, forearmGrp, si }) => {
      const lead = si === 0 ? -0.12 : 0.06;
      grp.rotation.x = guardX + lead;
      grp.rotation.z = si * 0.15;
      grp.position.z = 0;
      if (forearmGrp) forearmGrp.rotation.x = ELBOW_GUARD_BEND;
    });
    legGrps.forEach((entry) => {
      resetLegRotations(entry, entry.li);
    });
    torsoGrp.rotation.x = 0;
    torsoGrp.rotation.z = 0;
    headGrp.rotation.z = 0;
    g.position.x = 0;
    g.position.z = 0;
    if (core) core.scale.setScalar(1);
  }

  g.userData.setSkeletonDriven = (on) => { skeletonDriven = !!on; };
  g.userData.setTimeScale = (scale) => { animTimeScale = Math.max(0, scale); };

  g.userData.setAnimState = (newState, dur = 0.5) => {
    if (newState === 'block' && animState === 'block') {
      animTimer = Math.max(animTimer, dur);
      return;
    }
    if ((animState === 'knockdown' && animTimer > 0.5) || (animState === 'stagger' && animTimer > 0.3)) return;
    if (newState !== animState) resetLimbPose();
    animState = newState;
    animDuration = Math.max(0.12, dur);
    animTimer = animDuration;
    animPhase = 0;
    if (newState === 'hit' || newState === 'stagger') damageFlash = 0.5;
  };

  g.userData.animate = (t, dt = 0.016) => {
    // Biomechanical skeleton drives joints during attacks — skip keyframe override
    if (skeletonDriven) return;
    const scaledDt = dt * animTimeScale;
    if (animTimeScale < 0.05) return;

    if (animTimer > 0) {
      animTimer -= scaledDt;
      animPhase = 1 - Math.max(0, animTimer) / animDuration;
    } else if (animState !== 'idle' && animState !== 'victory' && animState !== 'block') {
      animState = 'idle';
      resetLimbPose();
    }

    const bob = Math.sin(t * 2.2) * 0.018;
    const p = animPhase;
    const inCombat = animState !== 'idle';
    const blade = 0.3;

    if (!inCombat || animState === 'victory') {
      const breath = Math.sin(t * PI * 0.5);
      g.position.y = bob + breath * 0.012;
      torsoGrp.rotation.y = blade + Math.sin(t * 0.8) * 0.05;
      torsoGrp.rotation.x = breath * 0.02;
      headGrp.rotation.y = -blade * 0.7 + Math.sin(t * 0.5) * 0.1;
      torsoGrp.rotation.z = 0;
      headGrp.rotation.z = Math.sin(t * 1.1) * 0.02;
      g.position.z = Math.sin(t * 0.9) * 0.01;
    }

    // Core breathing animation
    if (isDummy) {
      const s = 1.0 + Math.sin(t * PI * 0.5) * 0.08;
      core.scale.set(s, s, s);
    } else {
      const s = 1.0 + Math.sin(t * PI) * 0.15;
      core.scale.set(s, s, s);
      if (coreLight) coreLight.intensity = 2.0 + Math.sin(t * PI) * 0.5;
    }

    // Energy line flow
    linePhase += dt * 2;
    energyLines.forEach((line, i) => {
      if (line.material) {
        line.material.opacity = 0.65 + Math.sin(linePhase + i) * 0.25;
      }
    });

    armGrps.forEach(({ grp, forearmGrp, si }) => {
      if (!inCombat) {
        const lead = si === 0 ? -0.12 : 0.06; // lead hand out, rear hand tucked
        grp.rotation.x = guardX + lead + Math.sin(t * 3 + si) * 0.08;
        grp.rotation.z = si * 0.15;
        grp.position.z = 0;
        // Elbow stays folded in guard, breathing with a tiny independent flex
        if (forearmGrp) forearmGrp.rotation.x = ELBOW_GUARD_BEND + Math.sin(t * 3 + si + 1) * 0.04;
      }
    });

    const kickAnim = ['kick', 'roundhouse', 'heavy_kick', 'sweep'].includes(animState);
    legGrps.forEach((entry) => {
      if (kickAnim) return;
      const hip = entry.hipGrp || entry.legGrp;
      const { shinGrp, li } = entry;
      const phase = li === 0 ? 0 : PI;
      const stance = li === 0 ? 0.22 : -0.14;
      hip.rotation.x = stance + Math.sin(t * 1.1 + phase) * (inCombat ? 0.05 : 0.1);
      hip.rotation.y = 0;
      hip.rotation.z = 0;
      if (shinGrp && !inCombat) {
        shinGrp.rotation.x = KNEE_STAND_BEND + Math.abs(Math.sin(t * 1.1 + phase)) * 0.06;
      }
    });

    // Eye behavior
    eyeRefs.forEach((eye) => {
      if (isDummy) {
        eye.material.emissiveIntensity = 0;
        return;
      }
      if (animState === 'block') eye.material.emissiveIntensity = 1.5;
      else if (animState === 'jab' || animState === 'cross') eye.material.emissiveIntensity = 3.0;
      else if (['kick', 'roundhouse', 'heavy_kick', 'sweep'].includes(animState)) eye.material.emissiveIntensity = 3.2;
      else if (animState === 'stagger' || animState === 'knockdown') {
        eye.material.emissiveIntensity = 0.2 + Math.abs(Math.sin(t * 20)) * 0.4;
      } else {
        eye.material.emissiveIntensity = 2.0 + Math.sin(t * PI) * 0.15;
      }
    });

    glowL = Math.max(0, glowL - dt * 6);
    glowR = Math.max(0, glowR - dt * 6);
    damageFlash = Math.max(0, damageFlash - dt * 2);

    // Glove glow (Striker only)
    gloveRefs.forEach(({ glove, si }) => {
      if (isDummy) {
        glove.material.emissiveIntensity = 0;
        return;
      }
      const glowAmt = si === 0 ? glowL : glowR;
      if (animState === 'block') {
        glove.material.emissive.set('#ADD8E6');
        glove.material.emissiveIntensity = 1.5;
      } else if (glowAmt > 0.05) {
        glove.material.emissive.set('#00BFFF');
        glove.material.emissiveIntensity = animState === 'cross' ? 3.0 : 2.0;
      } else {
        glove.material.emissive.set('#440000');
        glove.material.emissiveIntensity = 0.5;
      }
    });

    switch (animState) {
      case 'jab':
      case 'low_punch': {
        const { wind, ext, hip, rec } = punchPhases(p);
        const useRight = animState === 'low_punch';
        const armEntry = armGrps.find((a) => a.si === (useRight ? 1 : 0));
        const arm = armEntry?.grp;
        if (arm) {
          arm.rotation.x = guardX + wind * 0.08 - ext * (useRight ? 0.5 : 0.55) + rec * 0.3;
          arm.rotation.y = -wind * 0.06 + ext * 0.04;
          arm.position.z = ext * (useRight ? 0.26 : 0.3) - rec * 0.1;
        }
        if (armEntry?.forearmGrp) {
          armEntry.forearmGrp.rotation.x = lerp(ELBOW_GUARD_BEND, -0.08, ext) + rec * (ELBOW_GUARD_BEND + 0.08) * 0.5;
        }
        torsoGrp.rotation.y = blade - hip * (useRight ? 0.3 : 0.38) + wind * 0.05;
        torsoGrp.rotation.x = -ext * (useRight ? 0.06 : 0.1) + wind * 0.03;
        headGrp.rotation.x = ext * 0.05;
        headGrp.rotation.y = -blade * 0.7 + ext * 0.08;
        g.position.z = ext * 0.06 - rec * 0.04;
        if (core.material) core.material.emissiveIntensity = 2.5 + ext * 1.5;
        if (ext > 0.35 && ext < 0.65) (useRight ? (glowR = Math.max(glowR, ext)) : (glowL = Math.max(glowL, ext)));
        break;
      }
      case 'cross': {
        const { coil, ext, hip, rec } = crossPhases(p);
        const armEntry = armGrps.find((a) => a.si === 1);
        const right = armEntry?.grp;
        if (right) {
          right.rotation.x = guardX + coil * 0.12 - ext * 0.68 + rec * 0.25;
          right.rotation.z = -coil * 0.08 - ext * 0.12;
          right.position.z = ext * 0.36 - rec * 0.12;
        }
        if (armEntry?.forearmGrp) {
          armEntry.forearmGrp.rotation.x = lerp(ELBOW_GUARD_BEND, -0.03, ext) + rec * (ELBOW_GUARD_BEND + 0.03) * 0.4;
        }
        torsoGrp.rotation.y = blade - coil * 0.5 - hip * 0.7 + rec * 0.2;
        torsoGrp.rotation.x = coil * 0.08 - ext * 0.16;
        torsoGrp.rotation.z = -ext * 0.12;
        headGrp.rotation.y = -blade * 0.7 + coil * 0.05;
        headGrp.rotation.x = -coil * 0.06 + ext * 0.08;
        g.position.y = bob - ext * 0.05 + rec * 0.03;
        g.position.z = ext * 0.1 - rec * 0.06;
        if (core.material) core.material.emissiveIntensity = 3.5 + ext;
        if (ext > 0.3 && ext < 0.65) glowR = Math.max(glowR, ext);
        break;
      }
      case 'hook': {
        const { wind, ext, hip, rec } = heavyPhases(p);
        const armEntry = armGrps.find((a) => a.si === 1);
        const right = armEntry?.grp;
        if (right) {
          right.rotation.x = guardX + wind * 0.15 - ext * 0.35 + rec * 0.2;
          right.rotation.z = -wind * 0.35 + ext * 0.55 - rec * 0.15;
          right.position.z = ext * 0.22 - rec * 0.08;
        }
        if (armEntry?.forearmGrp) {
          armEntry.forearmGrp.rotation.x = lerp(ELBOW_GUARD_BEND, -0.75, ext * 0.6) + rec * 0.3;
        }
        torsoGrp.rotation.y = blade - wind * 0.4 - hip * 0.55 + rec * 0.15;
        torsoGrp.rotation.z = ext * 0.18 - wind * 0.05;
        torsoGrp.rotation.x = wind * 0.06 - ext * 0.1;
        headGrp.rotation.y = -blade * 0.6 + ext * 0.1;
        headGrp.rotation.z = ext * 0.08;
        g.position.z = ext * 0.12 - rec * 0.08;
        g.position.y = bob - ext * 0.06;
        if (core.material) core.material.emissiveIntensity = 4.0 + ext;
        if (ext > 0.35 && ext < 0.65) glowR = Math.max(glowR, ext);
        break;
      }
      case 'kick':
      case 'heavy_kick':
      case 'roundhouse':
      case 'sweep': {
        const kickId = animState === 'heavy_kick' ? 'heavy_kick' : animState;
        const pose = kickPoseProgress(p, kickId);
        const lead = legGrps.find((l) => l.li === 0);
        const rear = legGrps.find((l) => l.li === 1);
        if (pose) {
          applyKeyframeKick(lead, rear, pose, bob);
          applyKeyframeKickArms(pose);
          const hit = kickStrikeIntensity(pose);
          if (core.material) {
            core.material.emissiveIntensity = kickId === 'heavy_kick' ? 3.8 + hit * 1.6 : 2.6 + hit * 1.3;
          }
          if (hit > 0.35 && p > 0.42 && p < 0.75) glowL = Math.max(glowL, hit);
        }
        break;
      }
      case 'advance': {
        const step = punchPhases(p).ext;
        legGrps.forEach((entry) => {
          const hip = entry.hipGrp || entry.legGrp;
          const { shinGrp, li } = entry;
          hip.rotation.x = (li === 0 ? 0.28 : -0.16) * step;
          if (shinGrp) shinGrp.rotation.x = KNEE_STAND_BEND - (li === 0 ? step : step * 0.4) * 0.5;
        });
        torsoGrp.rotation.x = step * 0.04;
        break;
      }
      case 'retreat': {
        const step = punchPhases(p).ext;
        legGrps.forEach((entry) => {
          const hip = entry.hipGrp || entry.legGrp;
          const { shinGrp, li } = entry;
          hip.rotation.x = (li === 0 ? -0.14 : 0.22) * step;
          if (shinGrp) shinGrp.rotation.x = KNEE_STAND_BEND - (li === 0 ? step * 0.4 : step) * 0.5;
        });
        torsoGrp.rotation.x = -step * 0.03;
        break;
      }
      case 'block':
        armGrps.forEach(({ grp, forearmGrp }) => {
          grp.rotation.x = lerp(guardX, -1.35, 0.88);
          grp.position.z = 0.16;
          if (forearmGrp) forearmGrp.rotation.x = -1.55;
        });
        torsoGrp.rotation.x = 0.1;
        torsoGrp.rotation.y = blade;
        headGrp.rotation.x = 0.12;
        headGrp.rotation.y = -blade * 0.5;
        legGrps.forEach((entry) => {
          const hip = entry.hipGrp || entry.legGrp;
          const { shinGrp } = entry;
          hip.rotation.x *= 1.1;
          if (shinGrp) shinGrp.rotation.x = -0.35;
        });
        if (core.material) core.material.emissiveIntensity = 1.5;
        break;
      case 'dodge':
        torsoGrp.rotation.z = Math.sin(p * PI) * 0.2;
        g.position.x = Math.sin(p * PI) * 0.15;
        break;
      case 'kick_hit': {
        const headSnap = reactLayer(p, 0) * 1.0;
        const torsoSnap = reactLayer(p, 0.05) * 0.88;
        const legSnap = reactLayer(p, 0.12) * 0.55;
        torsoGrp.rotation.x = -torsoSnap * 0.34;
        torsoGrp.rotation.z = torsoSnap * 0.12;
        headGrp.rotation.x = -headSnap * 0.48;
        headGrp.rotation.z = headSnap * 0.20;
        g.position.z = torsoSnap * 0.16;
        legGrps.forEach((entry) => {
          const hip = entry.hipGrp || entry.legGrp;
          const { shinGrp } = entry;
          if (entry.li === 0) {
            hip.rotation.x = legSnap * 0.22;
            if (shinGrp) shinGrp.rotation.x = KNEE_STAND_BEND - legSnap * 0.30;
          } else {
            hip.rotation.x = -legSnap * 0.08;
            if (shinGrp) shinGrp.rotation.x = KNEE_STAND_BEND - legSnap * 0.18;
          }
        });
        armGrps.forEach(({ grp, forearmGrp }) => {
          grp.rotation.x += torsoSnap * 0.10;
          if (forearmGrp) forearmGrp.rotation.x = ELBOW_GUARD_BEND + torsoSnap * 0.22;
        });
        break;
      }
      case 'kick_heavy_hit': {
        const headSnap = reactLayer(p, 0) * 1.2;
        const torsoSnap = reactLayer(p, 0.04) * 1.05;
        const legSnap = reactLayer(p, 0.10) * 0.72;
        torsoGrp.rotation.x = -torsoSnap * 0.50;
        torsoGrp.rotation.z = torsoSnap * 0.20;
        headGrp.rotation.x = -headSnap * 0.68;
        headGrp.rotation.z = headSnap * 0.30;
        g.position.z = torsoSnap * 0.30;
        g.position.x = -torsoSnap * 0.09;
        legGrps.forEach((entry) => {
          const hip = entry.hipGrp || entry.legGrp;
          const { shinGrp } = entry;
          hip.rotation.x = entry.li === 0 ? legSnap * 0.16 : -legSnap * 0.12;
          if (shinGrp) shinGrp.rotation.x = KNEE_STAND_BEND - legSnap * 0.40;
        });
        armGrps.forEach(({ grp, forearmGrp }) => {
          grp.rotation.x += torsoSnap * 0.16;
          grp.rotation.z += torsoSnap * 0.10;
          if (forearmGrp) forearmGrp.rotation.x = ELBOW_GUARD_BEND + torsoSnap * 0.32;
        });
        if (core.material) core.material.emissiveIntensity = 1.2 + torsoSnap * 0.9;
        break;
      }
      case 'block_kick': {
        const snap = reactEnvelope(p, 0.14);
        armGrps.forEach(({ grp, forearmGrp }) => {
          grp.rotation.x = lerp(guardX, -1.45, 0.92);
          grp.position.z = 0.18 + snap * 0.05;
          if (forearmGrp) forearmGrp.rotation.x = -1.65;
        });
        torsoGrp.rotation.x = 0.14 + snap * 0.07;
        torsoGrp.rotation.y = blade;
        headGrp.rotation.x = 0.08 + snap * 0.04;
        g.position.z = snap * 0.07;
        if (core.material) core.material.emissiveIntensity = 2.2 + snap * 1.8;
        break;
      }
      case 'hit':
      case 'stagger': {
        const power = animState === 'stagger' ? 1.25 : 0.9;
        const snap = reactEnvelope(p) * power;
        const torsoSnap = reactLayer(p, 0.04) * power;
        const headSnap = reactLayer(p, 0) * power;
        torsoGrp.rotation.z = torsoSnap * 0.18;
        torsoGrp.rotation.x = torsoSnap * 0.12;
        headGrp.rotation.z = headSnap * 0.26;
        headGrp.rotation.x = -headSnap * 0.16;
        if (isDummy) torsoGrp.rotation.x = -torsoSnap * 0.30;
        else {
          g.position.x = -torsoSnap * 0.10;
          g.position.z = -torsoSnap * 0.06;
        }
        armGrps.forEach(({ grp, forearmGrp }) => {
          grp.rotation.x += torsoSnap * 0.08;
          if (forearmGrp) forearmGrp.rotation.x = ELBOW_GUARD_BEND + torsoSnap * 0.20;
        });
        break;
      }
      case 'knockdown': {
        const fall = easeInOutCubic(Math.min(1, p * 1.6));
        const settle = reactEnvelope(Math.min(1, p * 1.2), 0.35) * 0.12;
        torsoGrp.rotation.z = fall * 0.85 + settle;
        torsoGrp.rotation.x = fall * 0.4;
        headGrp.rotation.z = fall * 0.3;
        headGrp.rotation.x = -fall * 0.2;
        g.position.y = bob - fall * 0.42;
        g.position.z = -fall * 0.15 - settle * 0.08;
        armGrps.forEach(({ grp, forearmGrp }) => {
          grp.rotation.x = guardX + fall * 0.5;
          grp.rotation.z = fall * 0.3;
          if (forearmGrp) forearmGrp.rotation.x = ELBOW_GUARD_BEND + fall * 0.4;
        });
        legGrps.forEach((entry) => {
          const hip = entry.hipGrp || entry.legGrp;
          const { shinGrp } = entry;
          hip.rotation.x = fall * 0.6;
          if (shinGrp) shinGrp.rotation.x = KNEE_STAND_BEND - fall * 0.8;
        });
        eyeRefs.forEach((eye) => {
          if (!isDummy) eye.material.emissiveIntensity = 0.15 + Math.abs(Math.sin(t * 18)) * 0.25;
        });
        if (core.material) core.material.emissiveIntensity = Math.max(0.2, 1.0 - fall);
        break;
      }
      case 'victory': {
        const raise = Math.min(1, p * 2);
        const armEntry = armGrps.find((a) => a.si === 1);
        const right = armEntry?.grp;
        if (right) { right.rotation.x = lerp(guardX, -2.4, raise); right.rotation.z = 0; }
        // Flexed elbow on the raised fist — a dead-straight arm overhead
        // reads as a mannequin, not a triumphant pose.
        if (armEntry?.forearmGrp) armEntry.forearmGrp.rotation.x = lerp(ELBOW_GUARD_BEND, -0.9, raise);
        break;
      }
      default:
        g.position.x = 0;
        break;
    }
  };

  g.userData.setHealthPct = (pct) => {
    const hp = Math.max(0, Math.min(1, pct));
    let col = glowCol;
    let intensity = isDummy ? 0.3 : 3.0;
    if (hp <= 0.25) {
      col = isDummy ? '#8B4513' : '#8B0000';
      intensity = isDummy ? 0.15 : 0.4;
    } else if (hp <= 0.5) {
      col = isDummy ? '#FFAA00' : '#FF6600';
      intensity = isDummy ? 0.2 : 1.5;
    }
    core.material.color.set(col);
    core.material.emissive.set(col);
    core.material.emissiveIntensity = intensity;
    if (visorRef?.material) visorRef.material.opacity = hp <= 0.25 ? 0.2 : 0.3;
  };

  g.userData.rig = { torsoGrp, headGrp, armGrps, legGrps, core };
}

// ── Other archetypes (tank, blaster, ninja, berserker) — simplified rigs ─────

const _geo = {};
function geo(key, factory) {
  if (!_geo[key]) _geo[key] = factory();
  return _geo[key];
}

function buildArchetypeFighter(primary, accent, variant) {
  const g = new THREE.Group();
  g.name = variant.charAt(0).toUpperCase() + variant.slice(1);
  const bodyMat = matStd(primary || '#0047AB', 0.7, 0.3);
  const accentMat = matStd(accent || '#FF0000', 0.55, 0.35, accent || '#FF0000', 0.5);

  const torsoGrp = new THREE.Group();
  g.add(torsoGrp);
  const torso = mesh(new THREE.BoxGeometry(0.5, 0.8, 0.35), bodyMat);
  torso.position.y = 0.5;
  torsoGrp.add(torso);

  const core = mesh(new THREE.SphereGeometry(0.15, 32, 16), matStd(accent || '#00BFFF', 0.5, 0.4, accent || '#00BFFF', 2.0));
  core.position.set(0, 0.5, 0);
  torsoGrp.add(core);

  const headGrp = new THREE.Group();
  headGrp.position.y = 1.2;
  torsoGrp.add(headGrp);
  const head = mesh(geo('headArc', () => new THREE.IcosahedronGeometry(0.4, 32)), bodyMat);
  head.scale.y = 1.1;
  headGrp.add(head);

  // Neutral joint tone — this rig has no dedicated joint material, unlike
  // the Striker/Dummy chassis, so a plain steel sphere marks each pivot.
  const jointMat = matStd('#8a8f99', 0.85, 0.25);

  // Arms and legs are TWO real pivots each (shoulder+elbow, hip+knee), not
  // one rigid cylinder — same fix as the Striker/Dummy rig, and since this
  // archetype already shares attachSpecCombatRig's animation code below,
  // the elbow/knee bend logic there picks these up automatically.
  const gloveRefs = [];
  const armGrps = [];
  [[-0.35, 0], [0.35, 1]].forEach(([x, si]) => {
    const armGrp = new THREE.Group();
    armGrp.position.set(x, 0.8, 0);
    torsoGrp.add(armGrp);
    const upperArm = mesh(new THREE.CylinderGeometry(0.1, 0.095, 0.3, 14), bodyMat);
    upperArm.position.y = -0.15;
    armGrp.add(upperArm);

    const forearmGrp = new THREE.Group();
    forearmGrp.position.y = -0.3;
    armGrp.add(forearmGrp);
    const elbow = mesh(new THREE.SphereGeometry(0.07, 14, 10), jointMat);
    forearmGrp.add(elbow);
    const forearm = mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.3, 14), bodyMat);
    forearm.position.y = -0.15;
    forearmGrp.add(forearm);
    const glove = mesh(new THREE.SphereGeometry(0.15, 32, 16), matGloveRed());
    glove.scale.z = 0.9;
    glove.position.set(0, -0.3, 0.16);
    forearmGrp.add(glove);

    gloveRefs.push({ glove, si });
    armGrps.push({ grp: armGrp, forearmGrp, si });
  });

  const ARCH_THIGH = 0.46;
  const ARCH_SHIN = 0.49;
  const legGrps = [];
  [[-0.15, 0], [0.15, 1]].forEach(([x, li]) => {
    const hipGrp = new THREE.Group();
    hipGrp.position.set(x, 0.08, 0);
    hipGrp.rotation.order = 'YXZ';
    torsoGrp.add(hipGrp);

    const thighGrp = new THREE.Group();
    hipGrp.add(thighGrp);

    const thighGeo = new THREE.CylinderGeometry(0.12, 0.11, ARCH_THIGH, 14);
    thighGeo.translate(0, -ARCH_THIGH * 0.5, 0);
    const thigh = mesh(thighGeo, bodyMat);
    thighGrp.add(thigh);

    const shinGrp = new THREE.Group();
    shinGrp.position.y = -ARCH_THIGH;
    thighGrp.add(shinGrp);

    const knee = mesh(new THREE.SphereGeometry(0.08, 14, 10), jointMat);
    shinGrp.add(knee);

    const shinGeo = new THREE.CylinderGeometry(0.1, 0.09, ARCH_SHIN, 14);
    shinGeo.translate(0, -ARCH_SHIN * 0.5, 0);
    const shin = mesh(shinGeo, bodyMat);
    shinGrp.add(shin);

    const ankleGrp = new THREE.Group();
    ankleGrp.position.y = -ARCH_SHIN;
    shinGrp.add(ankleGrp);

    const foot = mesh(new THREE.BoxGeometry(0.16, 0.1, 0.32), bodyMat);
    foot.position.set(0, -0.05, 0.05);
    ankleGrp.add(foot);

    legGrps.push({
      hipGrp,
      legGrp: hipGrp,
      thighGrp,
      shinGrp,
      ankleGrp,
      li,
      hipX: x,
      hipY: 0.08,
    });
  });

  attachSpecCombatRig(g, {
    variant,
    isDummy: false,
    torsoGrp,
    headGrp,
    armGrps,
    legGrps,
    core,
    coreLight: null,
    coreParticles: null,
    gloveRefs,
    eyeRefs: [],
    visorRef: null,
    glowCol: accent || '#00BFFF',
    guardX: -0.9,
    energyLines: [],
  });

  g.userData.isFighterHumanoid = true;
  return g;
}

/**
 * Build a production-quality fighting humanoid.
 * Striker and Dummy use spec-accurate geometry from the design brief.
 */
export function buildProfessionalFighterHumanoid(primary, accent, variant = 'striker') {
  if (variant === 'striker') return buildSpecStriker();
  if (variant === 'dummy') return buildSpecTrainingDummy();
  return buildArchetypeFighter(primary, accent, variant);
}

export default buildProfessionalFighterHumanoid;
