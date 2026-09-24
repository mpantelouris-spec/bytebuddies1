/**
 * BoxingGameCharacter — rigged Striker with bone hierarchy, hinge limits, SLERP poses.
 */
import * as THREE from 'three';
import { sampleAnimation, ANIMATIONS, resolveSkeletalAnim } from './BoxingGameAnimations.js';

const DEG = THREE.MathUtils.degToRad;
const _euler = new THREE.Euler();
const _qTarget = new THREE.Quaternion();

/** Hinge joints — only Z axis may rotate (elbows/knees) */
const HINGE_BONES = new Set(['leftElbow', 'rightElbow', 'leftKnee', 'rightKnee']);

const JOINT_LIMITS = {
  leftElbow: { x: [0, 0], y: [0, 0], z: [0, 180] },
  rightElbow: { x: [0, 0], y: [0, 0], z: [0, 180] },
  leftKnee: { x: [0, 0], y: [0, 0], z: [0, 180] },
  rightKnee: { x: [0, 0], y: [0, 0], z: [0, 180] },
  neck: { x: [-30, 30], y: [-45, 45], z: [-15, 15] },
  spineBase: { x: [-30, 30], y: [-30, 30], z: [-30, 30] },
  spineMid: { x: [-40, 40], y: [-40, 40], z: [-40, 40] },
  spineTop: { x: [-35, 35], y: [-35, 35], z: [-35, 35] },
  leftShoulder: { x: [-45, 120], y: [-45, 100], z: [-60, 60] },
  rightShoulder: { x: [-45, 120], y: [-100, 45], z: [-60, 60] },
};

function clampDeg(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function clampRot(name, rot) {
  const lim = JOINT_LIMITS[name];
  if (!lim) return rot;
  return {
    x: clampDeg(rot.x, lim.x[0], lim.x[1]),
    y: clampDeg(rot.y, lim.y[0], lim.y[1]),
    z: clampDeg(rot.z, lim.z[0], lim.z[1]),
  };
}

function bone(name, parent, pos = [0, 0, 0]) {
  const b = new THREE.Bone();
  b.name = name;
  b.position.set(...pos);
  parent.add(b);
  return b;
}

function part(geo, mat, boneRef, pos = [0, 0, 0], scale = [1, 1, 1]) {
  if (!boneRef) return null;
  const m = new THREE.Mesh(geo, mat);
  m.position.set(...pos);
  m.scale.set(...scale);
  m.castShadow = true;
  m.receiveShadow = true;
  boneRef.add(m);
  return m;
}

const VARIANTS = {
  striker: {
    body: 0x0047ab, accent: 0x00bfff, glove: 0xff0000, core: 0x00ffff,
    metalness: 0.9, roughness: 0.25, emissive: 3.0, eye: 0xff0000,
  },
  dummy: {
    body: 0xb8860b, accent: 0xcd7f32, glove: 0x8b6914, core: 0x444444,
    metalness: 0.35, roughness: 0.75, emissive: 0.3, eye: 0x333333,
  },
};

const ATTACK_ANIMS = new Set(['jab', 'straight', 'hook', 'kick', 'roundhouse', 'haymaker', 'sweep']);

export class BoxingGameCharacter {
  constructor({ variant = 'striker', scale = 1.0 } = {}) {
    this.variant = variant;
    this.scale = scale;
    this.group = new THREE.Group();
    this.group.name = variant === 'dummy' ? 'TrainingDummy' : 'Striker';
    this.bones = {};
    this.rootBone = new THREE.Bone();
    this.rootBone.name = 'root';
    this.group.add(this.rootBone);

    this.currentAnim = 'idle';
    this.animTime = 0;
    this.blendFrom = null;
    this.blendT = 1;
    this.blendDur = 0.08;
    this._slerpSpeed = 0.42;
    this.healthPct = 1;
    this.gloveMeshes = [];
    this.eyeMeshes = [];

    this._buildSkeleton();
    this._buildVisuals(VARIANTS[variant] || VARIANTS.striker);
    this._storeNeutralQuats();
    this.playAnimation('idle', { loop: true });
  }

  _buildSkeleton() {
    const r = this.rootBone;
    const pelvis = bone('pelvis', r, [0, 1.0, 0]);
    const spineBase = bone('spineBase', pelvis, [0, 0.12, 0]);
    const spineMid = bone('spineMid', spineBase, [0, 0.18, 0]);
    const spineTop = bone('spineTop', spineMid, [0, 0.18, 0]);
    const chest = bone('chest', spineTop, [0, 0.15, 0]);
    const neck = bone('neck', chest, [0, 0.22, 0]);
    const head = bone('head', neck, [0, 0.18, 0]);

    const lSh = bone('leftShoulder', chest, [-0.28, 0.22, 0]);
    const lUa = bone('leftUpperArm', lSh, [0, -0.08, 0]);
    const lEl = bone('leftElbow', lUa, [0, -0.28, 0]);
    const lLa = bone('leftLowerArm', lEl, [0, -0.26, 0]);
    const lWr = bone('leftWrist', lLa, [0, -0.22, 0]);

    const rSh = bone('rightShoulder', chest, [0.28, 0.22, 0]);
    const rUa = bone('rightUpperArm', rSh, [0, -0.08, 0]);
    const rEl = bone('rightElbow', rUa, [0, -0.28, 0]);
    const rLa = bone('rightLowerArm', rEl, [0, -0.26, 0]);
    const rWr = bone('rightWrist', rLa, [0, -0.22, 0]);

    const lHip = bone('leftHip', pelvis, [-0.18, -0.05, 0]);
    const lUl = bone('leftUpperLeg', lHip, [0, -0.22, 0]);
    const lKn = bone('leftKnee', lUl, [0, -0.38, 0]);
    const lLl = bone('leftLowerLeg', lKn, [0, -0.36, 0]);

    const rHip = bone('rightHip', pelvis, [0.18, -0.05, 0]);
    const rUl = bone('rightUpperLeg', rHip, [0, -0.22, 0]);
    const rKn = bone('rightKnee', rUl, [0, -0.38, 0]);
    const rLl = bone('rightLowerLeg', rKn, [0, -0.36, 0]);

    Object.assign(this.bones, {
      pelvis, spineBase, spineMid, spineTop, chest, neck, head,
      leftShoulder: lSh, leftUpperArm: lUa, leftElbow: lEl, leftLowerArm: lLa, leftWrist: lWr,
      rightShoulder: rSh, rightUpperArm: rUa, rightElbow: rEl, rightLowerArm: rLa, rightWrist: rWr,
      leftHip: lHip, leftUpperLeg: lUl, leftKnee: lKn, leftLowerLeg: lLl,
      rightHip: rHip, rightUpperLeg: rUl, rightKnee: rKn, rightLowerLeg: rLl,
    });
  }

  _buildVisuals(pal) {
    const bodyMat = new THREE.MeshStandardMaterial({
      color: pal.body, metalness: pal.metalness, roughness: pal.roughness,
    });
    const accentMat = new THREE.MeshStandardMaterial({
      color: pal.accent, metalness: pal.metalness * 0.8, roughness: pal.roughness,
    });
    const jointMat = new THREE.MeshStandardMaterial({
      color: 0xc0c0c0, metalness: 0.9, roughness: 0.2,
    });
    const gloveMat = new THREE.MeshStandardMaterial({
      color: pal.glove, metalness: 0.5, roughness: 0.4,
      emissive: 0x440000, emissiveIntensity: 0.5,
    });
    const coreMat = new THREE.MeshStandardMaterial({
      color: pal.core, emissive: pal.core, emissiveIntensity: pal.emissive,
      metalness: 0.2, roughness: 0.3,
    });
    const eyeMat = new THREE.MeshStandardMaterial({
      color: pal.eye, emissive: pal.eye, emissiveIntensity: pal.emissive > 1 ? 2.0 : 0.2,
    });
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x00bfff, emissive: 0x00bfff, emissiveIntensity: 1.5,
      transparent: true, opacity: 0.35, metalness: 0.3, roughness: 0.2,
    });

    part(new THREE.BoxGeometry(0.42, 0.55, 0.28), bodyMat, this.bones.chest, [0, 0.05, 0]);
    this.coreMesh = part(new THREE.SphereGeometry(0.12, 16, 16), coreMat, this.bones.chest, [0, 0.05, 0.12]);
    part(new THREE.BoxGeometry(0.38, 0.2, 0.24), bodyMat, this.bones.pelvis, [0, -0.05, 0]);

    part(new THREE.IcosahedronGeometry(0.22, 1), bodyMat, this.bones.head, [0, 0.12, 0.02]);
    part(new THREE.SphereGeometry(0.04, 8, 8), eyeMat, this.bones.head, [-0.08, 0.14, 0.12]);
    part(new THREE.SphereGeometry(0.04, 8, 8), eyeMat, this.bones.head, [0.08, 0.14, 0.12]);
    part(new THREE.SphereGeometry(0.18, 12, 8), visorMat, this.bones.head, [0, 0.12, 0.14], [1.2, 0.5, 0.3]);
    [-1, 1].forEach((s) => {
      part(new THREE.BoxGeometry(0.02, 0.18, 0.02), accentMat, this.bones.head, [s * 0.14, 0.22, 0]);
    });

    part(new THREE.SphereGeometry(0.06, 10, 10), jointMat, this.bones.leftElbow);
    part(new THREE.SphereGeometry(0.06, 10, 10), jointMat, this.bones.rightElbow);
    part(new THREE.SphereGeometry(0.07, 10, 10), jointMat, this.bones.leftKnee, [0, -0.02, 0]);
    part(new THREE.SphereGeometry(0.07, 10, 10), jointMat, this.bones.rightKnee, [0, -0.02, 0]);
    part(new THREE.SphereGeometry(0.08, 10, 10), jointMat, this.bones.leftShoulder);
    part(new THREE.SphereGeometry(0.08, 10, 10), jointMat, this.bones.rightShoulder);

    part(new THREE.BoxGeometry(0.14, 0.32, 0.14), bodyMat, this.bones.leftUpperArm);
    part(new THREE.BoxGeometry(0.12, 0.28, 0.12), bodyMat, this.bones.leftLowerArm);
    const lg = part(new THREE.SphereGeometry(0.11, 12, 12), gloveMat, this.bones.leftWrist, [0, -0.08, 0.04]);
    if (lg) this.gloveMeshes.push(lg);

    part(new THREE.BoxGeometry(0.14, 0.32, 0.14), bodyMat, this.bones.rightUpperArm);
    part(new THREE.BoxGeometry(0.12, 0.28, 0.12), bodyMat, this.bones.rightLowerArm);
    const rg = part(new THREE.SphereGeometry(0.11, 12, 12), gloveMat.clone(), this.bones.rightWrist, [0, -0.08, 0.04]);
    if (rg) this.gloveMeshes.push(rg);

    part(new THREE.BoxGeometry(0.16, 0.38, 0.16), bodyMat, this.bones.leftUpperLeg);
    part(new THREE.BoxGeometry(0.14, 0.36, 0.14), accentMat, this.bones.leftLowerLeg, [0, -0.18, 0]);
    part(new THREE.BoxGeometry(0.16, 0.38, 0.16), bodyMat, this.bones.rightUpperLeg);
    part(new THREE.BoxGeometry(0.14, 0.36, 0.14), accentMat, this.bones.rightLowerLeg, [0, -0.18, 0]);

    this.group.scale.setScalar(this.scale);
    this.group.userData.combatPBR = true;
    this.group.userData.skipSceneStylize = true;
  }

  _storeNeutralQuats() {
    this.poseQuats = {};
    Object.entries(this.bones).forEach(([name, b]) => {
      this.poseQuats[name] = b.quaternion.clone();
    });
  }

  isAnimLocked() {
    const hold = ['hit', 'stagger', 'standUp'];
    if (this.currentAnim === 'knockdown') return true;
    if (!hold.includes(this.currentAnim)) return false;
    const anim = ANIMATIONS[this.currentAnim];
    return this.animTime < (anim?.duration ?? 0);
  }

  playAnimation(name, { loop, force = false } = {}) {
    const anim = ANIMATIONS[name];
    if (!anim) return;
    if (this.currentAnim === name && !force) {
      if (anim.loop) return;
      if (this.animTime < anim.duration) return;
    }
    this.blendFrom = this.currentAnim;
    this.blendT = 0;
    this.currentAnim = name;
    this.animTime = 0;
    this._loop = loop ?? anim.loop;
    const fast = ATTACK_ANIMS.has(name) || ['hit', 'block'].includes(name);
    this.blendDur = fast ? 0.03 : 0.07;
  }

  playFromCombat(actionId, stateFlags = {}) {
    if (stateFlags.knockdown) { this.playAnimation('knockdown'); return; }
    if (stateFlags.blocking) { this.playAnimation('block'); return; }
    if (stateFlags.staggered) { this.playAnimation('stagger'); return; }
    const anim = resolveSkeletalAnim(actionId);
    if (anim === 'idle') this.playAnimation('idle');
    else this.playAnimation(anim);
  }

  _rotToQuat(name, rot) {
    const clamped = clampRot(name, rot);
    if (HINGE_BONES.has(name)) {
      _euler.set(0, 0, DEG(clamped.z), 'XYZ');
    } else {
      _euler.set(DEG(clamped.x), DEG(clamped.y), DEG(clamped.z), 'XYZ');
    }
    return _qTarget.setFromEuler(_euler);
  }

  _applyPose(pose, blend = 1) {
    Object.entries(pose).forEach(([name, rot]) => {
      const b = this.bones[name];
      if (!b) return;
      const tq = this._rotToQuat(name, rot);
      if (blend >= 1) {
        b.quaternion.copy(tq);
      } else {
        b.quaternion.slerp(tq, blend);
      }
    });
  }

  _updateGloveGlow() {
    const attacking = ATTACK_ANIMS.has(this.currentAnim);
    const anim = ANIMATIONS[this.currentAnim];
    const peak = attacking && anim && this.animTime > anim.duration * 0.25 && this.animTime < anim.duration * 0.55;
    this.gloveMeshes.forEach((g, i) => {
      const mat = g.material;
      if (this.currentAnim === 'block') {
        mat.emissive.setHex(0xadd8e6);
        mat.emissiveIntensity = 1.5;
      } else if (peak) {
        mat.emissive.setHex(0x00bfff);
        mat.emissiveIntensity = this.currentAnim === 'hook' || this.currentAnim === 'haymaker' ? 3.0 : 2.0;
      } else {
        mat.emissive.setHex(0x440000);
        mat.emissiveIntensity = 0.5;
      }
    });
  }

  _updateCoreHealth() {
    if (!this.coreMesh) return;
    const hp = this.healthPct;
    let col = 0x00ff88;
    let intensity = 3.0;
    if (hp <= 0.25) { col = 0xff2200; intensity = 0.4; }
    else if (hp <= 0.5) { col = 0xff6600; intensity = 1.5; }
    this.coreMesh.material.color.setHex(col);
    this.coreMesh.material.emissive.setHex(col);
    this.coreMesh.material.emissiveIntensity = intensity;
    const pulse = 1 + Math.sin(this.animTime * Math.PI * (ATTACK_ANIMS.has(this.currentAnim) ? 8 : 2)) * 0.12;
    this.coreMesh.scale.setScalar(pulse);
  }

  update(dt) {
    const anim = ANIMATIONS[this.currentAnim] || ANIMATIONS.idle;
    this.animTime += dt;

    if (!this._loop && this.animTime >= anim.duration) {
      if (this.currentAnim === 'knockdown') {
        this.animTime = anim.duration;
        this._applyPose(sampleAnimation('knockdown', anim.duration), 1);
        this._updateGloveGlow();
        this._updateCoreHealth();
        return;
      }
      if (this.currentAnim !== 'idle') {
        this.playAnimation('idle');
        return;
      }
    }

    const pose = sampleAnimation(this.currentAnim, this.animTime);
    const slerp = this.blendT < 1 ? Math.min(1, dt / this.blendDur) : this._slerpSpeed;

    if (this.blendT < 1) {
      this.blendT = Math.min(1, this.blendT + dt / this.blendDur);
      const prevPose = sampleAnimation(this.blendFrom || 'idle', Math.min(this.animTime, ANIMATIONS[this.blendFrom]?.duration ?? 0));
      Object.keys(pose).forEach((name) => {
        const b = this.bones[name];
        if (!b) return;
        const a = prevPose[name] || { x: 0, y: 0, z: 0 };
        const c = pose[name] || { x: 0, y: 0, z: 0 };
        const t = this.blendT;
        const mixed = {
          x: a.x + (c.x - a.x) * t,
          y: a.y + (c.y - a.y) * t,
          z: a.z + (c.z - a.z) * t,
        };
        b.quaternion.slerp(this._rotToQuat(name, mixed), slerp);
      });
    } else {
      Object.entries(pose).forEach(([name, rot]) => {
        const b = this.bones[name];
        if (!b) return;
        b.quaternion.slerp(this._rotToQuat(name, rot), slerp);
      });
    }

    this._updateGloveGlow();
    this._updateCoreHealth();
  }

  get userData() {
    return {
      setAnimState: (state) => this.playFromCombat(state, {}),
      animate: (t, dt) => this.update(dt),
      setHealthPct: (pct) => { this.healthPct = pct; },
    };
  }

  attachUserDataToGroup() {
    this.group.userData.setAnimState = (state) => this.playFromCombat(state, {
      knockdown: state === 'knockdown',
      blocking: state === 'block',
      staggered: state === 'stagger' || state === 'hit',
    });
    this.group.userData.animate = (t, dt) => this.update(dt);
    this.group.userData.setHealthPct = (pct) => { this.healthPct = pct; };
  }

  getObject3D() {
    this.attachUserDataToGroup();
    return this.group;
  }
}

export function createStrikerCharacter(opts = {}) {
  return new BoxingGameCharacter({ variant: 'striker', scale: 1.0, ...opts });
}

export function createDummyCharacter(opts = {}) {
  return new BoxingGameCharacter({ variant: 'dummy', scale: 1.0, ...opts });
}
