/**
 * Football player pipeline — glTF skinned mesh when available, procedural fallback.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { loadRobotGltf } from '../../three/gltfLoader.js';
import {
  buildFootballPlayer,
  buildFootballHumanoidStub,
} from '../football-character-models.js';
import { FOOTBALL_GLB, footballGlbReady, FOOTBALL_GLB_PLAYERS_ENABLED } from './FootballAssetManifest.js';

const TEAM_JERSEY = { green: '#16a34a', blue: '#2563eb' };
let _greenTpl = null;
let _blueTpl = null;

function normalizeFootballGlbScale(root, targetHeight = 1.72) {
  root.traverse((o) => {
    if (o.isSkinnedMesh?.skeleton) {
      o.skeleton.update();
      o.computeBoundingBox?.();
      o.computeBoundingSphere?.();
    }
  });
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  if (box.isEmpty()) {
    root.scale.setScalar(0.85);
    return;
  }
  const size = box.getSize(new THREE.Vector3());
  const h = Math.max(size.y, 0.35);
  const s = THREE.MathUtils.clamp(targetHeight / h, 0.04, 2.2);
  root.scale.setScalar(s);
  root.updateMatrixWorld(true);
  const grounded = new THREE.Box3().setFromObject(root);
  root.position.y -= grounded.min.y;
  root.position.x -= (grounded.min.x + grounded.max.x) * 0.5;
  root.position.z -= (grounded.min.z + grounded.max.z) * 0.5;
}

function tintKit(root, teamColor) {
  const hex = TEAM_JERSEY[teamColor] || TEAM_JERSEY.green;
  const kit = new THREE.Color(hex);
  root.traverse((o) => {
    if (!o.isMesh || !o.material) return;
    if (o.userData?.isSkin || o.userData?.isHair) return;
    const name = (o.name || '').toLowerCase();
    if (/skin|face|head|hair|eye|teeth|hand|foot/i.test(name)) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    mats.forEach((m) => {
      if (m.color) m.color.lerp(kit, 0.38);
    });
  });
}

function wrapGlbPlayer(scene, { teamColor, jerseyNumber, playstyle, name }) {
  const g = new THREE.Group();
  g.name = name || 'FootballBot';
  normalizeFootballGlbScale(scene);
  scene.rotation.y = Math.PI;
  scene.traverse((o) => {
    if (o.isMesh) {
      o.castShadow = true;
      o.receiveShadow = true;
      o.frustumCulled = true;
    }
  });
  tintKit(scene, teamColor);
  g.add(scene);
  g.userData.isFootballPlayer = true;
  g.userData.isGltfFootballPlayer = true;
  g.userData.teamColor = teamColor;
  g.userData.jerseyNumber = jerseyNumber;
  g.userData.playstyle = playstyle;
  g.userData.setAnimState = (state) => {
    g.userData._animState = state;
  };
  g.userData.animate = (t, dt) => {
    const spd = g.userData._runSpeed || 0;
    if (spd > 0.08) {
      scene.rotation.y = Math.sin(t * (8 + spd * 0.6)) * 0.02;
    }
  };
  g.userData.footballRig = { setRunSpeed: (s) => { g.userData._runSpeed = s; } };
  return g;
}

export function clampFootballActorScale(root, targetHeight = 1.95) {
  if (!root) return;
  root.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(root);
  if (box.isEmpty()) return;
  const h = Math.max(box.getSize(new THREE.Vector3()).y, 0.15);
  if (h <= targetHeight * 1.15) return;
  const factor = THREE.MathUtils.clamp(targetHeight / h, 0.02, 1.5);
  root.scale.multiplyScalar(factor);
}

export async function preloadFootballGlbTemplates() {
  if (!FOOTBALL_GLB_PLAYERS_ENABLED) return;
  _greenTpl = await loadRobotGltf(FOOTBALL_GLB.playerGreen);
  _blueTpl = await loadRobotGltf(FOOTBALL_GLB.playerBlue);
  if (!_greenTpl) {
  _greenTpl = await loadRobotGltf(FOOTBALL_GLB.footballer);
  }
}

export function cloneGlbFootballPlayer(config = {}) {
  if (!FOOTBALL_GLB_PLAYERS_ENABLED) return null;
  const { teamColor = 'green' } = config;
  if (!footballGlbReady(teamColor)) return null;
  const tpl = teamColor === 'blue' ? _blueTpl : _greenTpl;
  if (!tpl) return null;
  const mesh = wrapGlbPlayer(tpl.clone(true), config);
  const box = new THREE.Box3().setFromObject(mesh);
  const h = box.isEmpty() ? 0 : box.getSize(new THREE.Vector3()).y;
  if (h > 2.0 || h < 0.4) {
    console.warn('[FootballPlayerKit] glTF scale out of range — procedural fallback', h);
    return null;
  }
  return mesh;
}

// ─── X Bot footballers ──────────────────────────────────────────────────────
// A sleek, properly proportioned robot humanoid with motion-captured idle,
// walk and run clips (three.js example model). Each player gets its own
// skeleton via SkeletonUtils.clone so animations play independently.
const XBOT_URL = FOOTBALL_GLB.footballer;
const XBOT_HEIGHT = 1.85;
const KIT = {
  green: { shell: 0x1fa34a },
  blue: { shell: 0x2563eb },
};
let _xbot = null;
let _xbotPromise = null;

export function loadXbotFootballer() {
  if (!_xbotPromise) {
    _xbotPromise = new GLTFLoader().loadAsync(XBOT_URL)
      .then((gltf) => { _xbot = gltf; return gltf; })
      .catch((err) => { console.warn('[FootballPlayerKit] X Bot unavailable', err); return null; });
  }
  return _xbotPromise;
}
if (typeof window !== 'undefined') loadXbotFootballer();

// Body regions by dominant bone, painted as a football kit on a robot body
const REGION_OF = (bone) => {
  const n = bone.replace(/^mixamorig:?/, '');
  if (/^(Head|HeadTop_End|LeftEye|RightEye)$/.test(n)) return 'head';
  if (n === 'Neck') return 'collar';
  if (/^(Spine|Spine1|Spine2|LeftShoulder|RightShoulder|LeftArm|RightArm)$/.test(n)) return 'jersey';
  if (/ForeArm$/.test(n)) return 'forearm';
  if (/Hand/.test(n)) return 'glove';
  if (/^(Hips|LeftUpLeg|RightUpLeg)$/.test(n)) return 'shorts';
  if (/^(LeftLeg|RightLeg)$/.test(n)) return 'socks';
  if (/Toe/.test(n)) return 'toe';
  if (/Foot$/.test(n)) return 'boot';
  return 'jersey';
};
const _kitGeoCache = new Map();

export function kitPalette(shell) {
  const c = new THREE.Color(shell);
  const hsl = {}; c.getHSL(hsl);
  // Dark kits get white shorts; bright kits get dark shorts
  const shorts = hsl.l > 0.55 ? 0x1c2230 : 0xf4f6fa;
  return {
    jersey: c, collar: new THREE.Color(0xffffff), shorts: new THREE.Color(shorts),
    socks: c.clone().offsetHSL(0, 0, -0.06), boot: new THREE.Color(0x14161c), toe: new THREE.Color(0xd4ff3a),
    forearm: new THREE.Color(0x4a5362), limb: new THREE.Color(0x4a5362), glove: new THREE.Color(0x1f242e),
    head: new THREE.Color(0xeef2f7), joint: new THREE.Color(0x232833),
  };
}

function kitGeometry(mesh, cacheKey, pal, joints = false) {
  const key = `${mesh.geometry.uuid}:${cacheKey}`;
  if (_kitGeoCache.has(key)) return _kitGeoCache.get(key);
  const geo = mesh.geometry.clone();
  const si = geo.attributes.skinIndex;
  const sw = geo.attributes.skinWeight;
  const pos = geo.attributes.position;
  const bones = mesh.skeleton.bones;
  const regions = new Array(si.count);
  const bonesOf = new Array(si.count);
  for (let i = 0; i < si.count; i++) {
    let best = 0; let bw = -1;
    for (let k = 0; k < 4; k++) {
      const w = sw.getComponent(i, k);
      if (w > bw) { bw = w; best = si.getComponent(i, k); }
    }
    bonesOf[i] = bones[best]?.name || '';
    regions[i] = REGION_OF(bonesOf[i]);
  }
  // Shorts stop mid-thigh; the lower thigh is bare robot limb
  let yMin = Infinity; let yMax = -Infinity;
  for (let i = 0; i < si.count; i++) {
    if (/UpLeg$/.test(bonesOf[i])) { const y = pos.getY(i); yMin = Math.min(yMin, y); yMax = Math.max(yMax, y); }
  }
  const cut = yMin + (yMax - yMin) * 0.5;
  const col = new Float32Array(si.count * 3);
  for (let i = 0; i < si.count; i++) {
    let r = regions[i];
    if (r === 'shorts' && /UpLeg$/.test(bonesOf[i]) && pos.getY(i) < cut) r = 'limb';
    // Joint balls: waist/shoulders sit under the shirt, hips under the shorts
    if (joints && /Hips$/.test(bonesOf[i])) r = 'jersey'; // the waist ball is the tucked-in shirt
    if (joints && !['jersey', 'collar', 'shorts'].includes(r)) r = 'joint';
    const c = pal[r] || pal.jersey;
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  _kitGeoCache.set(key, geo);
  return geo;
}


/** Bones of an X Bot clone by short name (Hips, LeftArm, …). */
export function xbotBones(model) {
  const bones = {};
  model.traverse((o) => { if (o.isBone) bones[o.name.replace(/^mixamorig:?/, '')] = o; });
  return bones;
}

/** Paint an X Bot clone by body region; palette keys: jersey, collar, shorts, limb, socks, boot, toe, forearm, glove, head, joint. */
export function paintRobotKit(model, pal, cacheKey, { bodyMetal = 0.18, bodyRough = 0.42 } = {}) {
  model.traverse((o) => {
    if (!o.isMesh) return;
    const joints = /joint/i.test(o.material?.name || '');
    o.userData.kitPart = joints ? 'joints' : 'body';
    o.geometry = kitGeometry(o, cacheKey, pal, joints);
    o.material = new THREE.MeshStandardMaterial({ vertexColors: true, metalness: joints ? 0.45 : bodyMetal, roughness: joints ? 0.38 : bodyRough });
    o.castShadow = true;
    o.receiveShadow = true;
    o.frustumCulled = false; // skinned bounds don't follow the animation
  });
}

/** Loaded X Bot glTF (scene + clips), or null while it is still loading. */
export function getXbotGltf() { return _xbot; }
export { normalizeFootballGlbScale, skeletonClone };

function numberTexture(num, shellHex) {
  const cv = document.createElement('canvas');
  cv.width = 128; cv.height = 128;
  const x = cv.getContext('2d');
  const hsl = {}; new THREE.Color(shellHex).getHSL(hsl);
  x.font = '900 104px Arial Black, Arial, sans-serif';
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.lineWidth = 8; x.strokeStyle = 'rgba(0,0,0,0.35)';
  x.strokeText(String(num), 64, 70);
  x.fillStyle = hsl.l > 0.55 ? '#1c2230' : '#ffffff';
  x.fillText(String(num), 64, 70);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Attach an object to a bone with sizes/offsets given in final player metres. */
function attachToBone(bone, obj, offset) {
  const ws = bone.getWorldScale(new THREE.Vector3()).x || 1;
  obj.scale.multiplyScalar(1 / ws);
  obj.position.set(offset[0] / ws, offset[1] / ws, offset[2] / ws);
  bone.add(obj);
}

/** Glowing wrap visor and antenna fitted to the X Bot's real head shape. */
export function addRobotHead(model, { accent = 0x5ff5ff, tipColor = 0xffffff } = {}) {
  const bones = xbotBones(model);
  model.updateMatrixWorld(true);
  const head = bones.Head;
  // Measure the head in rest pose so the visor wraps the real face
  const hb = new THREE.Box3();
  const v = new THREE.Vector3();
  model.traverse((o) => {
    if (!o.isSkinnedMesh || /joint/i.test(o.userData.kitPart || '')) return;
    const si = o.geometry.attributes.skinIndex;
    for (let i = 0; i < si.count; i++) {
      if (o.skeleton.bones[si.getX(i)] !== head) continue;
      o.getVertexPosition(i, v);
      hb.expandByPoint(o.localToWorld(v));
    }
  });
  if (head && !hb.isEmpty()) {
    const size = hb.getSize(new THREE.Vector3());
    const c = hb.getCenter(new THREE.Vector3());
    const toBone = (obj, worldPos) => {
      const ws = head.getWorldScale(new THREE.Vector3()).x || 1;
      obj.scale.multiplyScalar(1 / ws);
      obj.position.copy(head.worldToLocal(worldPos.clone()));
      obj.quaternion.copy(head.getWorldQuaternion(new THREE.Quaternion()).invert());
      head.add(obj);
    };
    // Wrap-around glowing visor across the face
    const rx = size.x * 0.53;
    const visor = new THREE.Mesh(
      new THREE.CylinderGeometry(rx, rx * 0.94, size.y * 0.2, 32, 1, true, -1.25, 2.5),
      new THREE.MeshStandardMaterial({ color: 0x0b1522, emissive: accent, emissiveIntensity: 1.5, roughness: 0.2, metalness: 0.3, side: THREE.DoubleSide }),
    );
    visor.scale.z = (size.z * 0.53) / rx;
    visor.name = 'robotVisor';
    toBone(visor, new THREE.Vector3(c.x, hb.min.y + size.y * 0.56, c.z));
    // Little antenna with a glowing tip
    const ant = new THREE.Group();
    const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.008, 0.07, 8), new THREE.MeshStandardMaterial({ color: 0x3a4150, metalness: 0.7, roughness: 0.3 }));
    stalk.position.y = 0.035;
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.016, 12, 10), new THREE.MeshStandardMaterial({ color: tipColor, emissive: tipColor, emissiveIntensity: 0.9 }));
    tip.position.y = 0.075;
    ant.add(stalk, tip);
    stalk.userData.skipBounds = true;
    tip.userData.skipBounds = true;
    ant.rotation.z = -0.3;
    toBone(ant, new THREE.Vector3(c.x + size.x * 0.28, hb.max.y - size.y * 0.12, c.z - size.z * 0.1));
    return { visor, headBox: hb };
  }
  return null;
}

function dressRobotFootballer(model, { shellHex, jerseyNumber, accent = 0x5ff5ff }) {
  const bones = xbotBones(model);
  addRobotHead(model, { accent, tipColor: shellHex });
  const chest = bones.Spine2;
  if (chest && jerseyNumber != null) {
    const mat = new THREE.MeshBasicMaterial({ map: numberTexture(jerseyNumber, shellHex), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
    const back = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), mat);
    back.rotation.y = Math.PI;
    back.name = 'shirtNumber';
    attachToBone(chest, back, [0, 0.05, -0.125]);
  }
}

/** A team-coloured, animated robot footballer, or null if the model isn't loaded yet. */
function buildXbotFootballer({ teamColor = 'green', shellColor = null, jerseyNumber = null } = {}) {
  if (!_xbot) return null;
  const model = skeletonClone(_xbot.scene);
  // shellColor lets the player's own robot keep its colour (e.g. orange striker)
  const shellHex = shellColor ? new THREE.Color(shellColor).getHex() : (KIT[teamColor] || KIT.green).shell;
  paintRobotKit(model, kitPalette(shellHex), `fb:${shellHex}`);
  normalizeFootballGlbScale(model, XBOT_HEIGHT);
  // The model already faces +Z, which is the direction the match engine steers towards
  dressRobotFootballer(model, { shellHex, jerseyNumber });

  const mixer = new THREE.AnimationMixer(model);
  const actions = {};
  _xbot.animations.forEach((clip) => { actions[clip.name] = mixer.clipAction(clip); });
  const ANIM = { idle: 'idle', run: 'run', dribble: 'run', walk: 'walk', celebrate: 'agree' };
  let current = null;
  let runSpeed = 0;
  const play = (name) => {
    const next = actions[name] || actions.idle;
    if (!next || next === current) return;
    next.reset();
    if (current) next.fadeIn(0.2); // first pose is instant, so stills never show a T-pose
    next.play();
    current?.fadeOut(0.2);
    current = next;
  };
  play('idle');

  const g = new THREE.Group();
  g.add(model);
  g.userData.xbot = true;
  g.userData.setAnimState = (state) => {
    // Blend into a walk at low speeds so players don't snap straight into a sprint.
    const want = state === 'run' || state === 'dribble' ? (runSpeed < 0.35 ? 'walk' : 'run') : (ANIM[state] || 'idle');
    play(want);
  };
  g.userData.animate = (t, dt) => {
    // The old 0.6 multiplier pinned almost every real movement speed at 1.5x,
    // making the mocap sprint look frantic. Keep the source run cadence close
    // to natural speed, with only a small response to faster movement.
    if (actions.run) actions.run.timeScale = THREE.MathUtils.clamp(0.78 + runSpeed * 0.075, 0.78, 1.22);
    mixer.update(Math.min(dt || 1 / 60, 0.1));
  };
  g.userData.footballRig = { setRunSpeed: (s) => { runSpeed = s || 0; } };
  return g;
}

/**
 * Sync mesh build: an animated X Bot when loaded; otherwise the procedural
 * player now, swapped for the X Bot the moment the model finishes loading.
 */
export function buildFootballPlayerMesh(config = {}) {
  const xbot = buildXbotFootballer(config);
  if (xbot) return wrapXbot(xbot, config);
  const fallback = buildProceduralFootballPlayer(config);
  loadXbotFootballer().then(() => {
    const next = buildXbotFootballer(config);
    if (!next || !fallback.parent) return;
    // Replace only the old figure; team rings and name tags added by the match stay
    fallback.userData.fighterCore?.removeFromParent();
    fallback.add(next);
    Object.assign(fallback.userData, {
      rig: undefined,
      fighterCore: undefined,
      animate: next.userData.animate,
      setAnimState: next.userData.setAnimState,
      footballRig: next.userData.footballRig,
      xbot: true,
    });
  });
  return fallback;
}

function wrapXbot(xbot, config) {
  const g = new THREE.Group();
  g.name = config.name || 'FootballBot';
  g.add(xbot);
  g.userData.isFootballPlayer = true;
  g.userData.xbot = true;
  g.userData.animate = xbot.userData.animate;
  g.userData.setAnimState = xbot.userData.setAnimState;
  g.userData.footballRig = xbot.userData.footballRig;
  return g;
}

/** The original procedural FIFA player (used until the X Bot has loaded). */
function buildProceduralFootballPlayer(config = {}) {
  const glb = cloneGlbFootballPlayer(config);
  if (glb) return glb;
  try {
    const fighter = buildFootballPlayer({
      teamColor: config.teamColor,
      jerseyNumber: config.jerseyNumber,
      playstyle: config.playstyle,
    });
    const g = new THREE.Group();
    g.name = config.name || 'FootballBot';
    g.add(fighter);
    g.userData.fighterCore = fighter;
    g.userData.rig = fighter.userData.rig;
    g.userData.isFootballPlayer = true;
    g.userData.animate = (t, dt) => fighter.userData.animate?.(t, dt);
    g.userData.setAnimState = (s, d) => fighter.userData.setAnimState?.(s, d);
    g.userData.setSkeletonDriven = (on) => fighter.userData.setSkeletonDriven?.(on);
    g.userData.footballRig = fighter.userData.footballRig;
    g.traverse((o) => { if (o.isMesh) o.frustumCulled = true; });
    return g;
  } catch (err) {
    console.warn('[FootballPlayerKit] procedural fallback', config.name, err);
    const stub = buildFootballHumanoidStub(config);
    const g = new THREE.Group();
    g.name = config.name || 'FootballBot';
    g.add(stub);
    g.userData.setAnimState = () => {};
    g.userData.animate = () => {};
    return g;
  }
}
