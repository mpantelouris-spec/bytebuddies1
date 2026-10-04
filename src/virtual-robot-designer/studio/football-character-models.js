/**
 * Cute visor football robots — ByteBuddies look (round head, big eyes), orange vs blue.
 */
import * as THREE from 'three';
import { TEAM_PRESETS } from '../data/football-robot-types.js';
import { attachFootballRig } from './football-rig.js';

const EYE_WHITE = '#f8fbff';
const EYE_PUPIL = '#0f172a';

function matStd(color, metalness = 0.08, roughness = 0.62) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    metalness,
    roughness,
  });
}

function mesh(geo, mat) {
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = true;
  m.receiveShadow = true;
  m.frustumCulled = false;
  return m;
}

function makeNameplate(label, tint = '#ffffff') {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(8, 12, 20, 0.82)';
  if (ctx.roundRect) {
    ctx.roundRect(8, 12, 240, 40, 8);
    ctx.fill();
  } else ctx.fillRect(8, 12, 240, 40);
  ctx.fillStyle = tint;
  ctx.font = 'bold 28px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(label).slice(0, 12).toUpperCase(), 128, 34);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
  sprite.scale.set(1.2, 0.3, 1);
  sprite.position.set(0, 1.98, 0);
  sprite.userData.isNameplate = true;
  sprite.renderOrder = 8;
  return sprite;
}

function makeNumberTex(number, fg = '#ffffff') {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 128, 128);
  ctx.fillStyle = fg;
  ctx.font = 'bold 96px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(number), 64, 72);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function kitFor(teamColor, play, jerseyNumber = 9) {
  const team = TEAM_PRESETS[teamColor] || TEAM_PRESETS.green;
  const isBlue = teamColor === 'blue';
  const isKeeper = play === 'goalkeeper';
  const body = isKeeper ? '#eab308' : (isBlue ? '#3b82f6' : '#f97316');
  const dark = isKeeper ? '#7c2d12' : (isBlue ? '#1e3a8a' : '#9a3412');
  return {
    team,
    jersey: body,
    shorts: dark,
    socks: body,
    boot: '#111827',
    hand: isKeeper ? '#facc15' : body,
    visor: isBlue ? '#7dd3fc' : '#ffedd5',
    accent: isBlue ? '#93c5fd' : '#fdba74',
    isKeeper,
    isBlue,
  };
}

function addNumberPlates(torsoGrp, jerseyNum) {
  const numMat = new THREE.MeshBasicMaterial({
    map: makeNumberTex(jerseyNum),
    transparent: true,
    depthWrite: false,
  });
  const chest = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.32), numMat);
  chest.position.set(0, 0.58, 0.17);
  chest.userData.isJerseyPlate = true;
  torsoGrp.add(chest);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.3), numMat.clone());
  back.position.set(0, 0.6, -0.16);
  back.rotation.y = Math.PI;
  back.userData.isJerseyPlate = true;
  torsoGrp.add(back);
}

/** Shirt / shorts / socks overlay for custom builder meshes so they match teammates. */
export function addFootballKitLayers(root, { teamColor = 'green', jerseyNumber = 9, playstyle = 'striker' } = {}) {
  if (!root || root.userData?.kitLayersAdded) return root;
  root.userData.kitLayersAdded = true;
  const c = kitFor(teamColor, playstyle, jerseyNumber);
  const kit = new THREE.Group();
  kit.name = 'FootballKitOverlay';
  kit.userData.isKitLayer = true;

  const shirt = mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.48, 10), matStd(c.jersey, 0.06, 0.55));
  shirt.position.y = 1.12;
  shirt.userData.isKitLayer = true;
  kit.add(shirt);

  const shorts = mesh(new THREE.CylinderGeometry(0.24, 0.22, 0.22, 10), matStd(c.shorts, 0.05, 0.6));
  shorts.position.y = 0.82;
  shorts.userData.isKitLayer = true;
  kit.add(shorts);

  [-0.11, 0.11].forEach((x) => {
    const sock = mesh(new THREE.CylinderGeometry(0.08, 0.09, 0.32, 8), matStd(c.socks, 0.05, 0.55));
    sock.position.set(x, 0.42, 0);
    sock.userData.isKitLayer = true;
    kit.add(sock);
    const boot = mesh(new THREE.BoxGeometry(0.14, 0.1, 0.26), matStd(c.boot, 0.2, 0.45));
    boot.position.set(x, 0.18, 0.04);
    boot.userData.isKitLayer = true;
    kit.add(boot);
  });

  addNumberPlates(kit, jerseyNumber);
  kit.children.filter((ch) => ch.userData?.isJerseyPlate).forEach((plate) => {
    plate.position.y += 0.55;
  });
  root.add(kit);
  return kit;
}

export function buildFootballPlayer(config = {}) {
  const teamColor = config.teamColor || 'green';
  const jerseyNum = config.jerseyNumber ?? 10;
  const play = config.playstyle || 'striker';
  const c = kitFor(teamColor, play, jerseyNum);

  const g = new THREE.Group();
  g.name = 'FootballPlayer';

  const torsoGrp = new THREE.Group();
  torsoGrp.name = 'Torso_Group';
  g.add(torsoGrp);

  const pelvis = mesh(new THREE.SphereGeometry(0.16, 12, 10), matStd(c.shorts, 0.18, 0.42));
  pelvis.position.y = 0.04;
  torsoGrp.add(pelvis);

  const body = mesh(new THREE.SphereGeometry(0.34, 16, 14), matStd(c.jersey, 0.22, 0.38));
  body.scale.set(0.92, 1.05, 0.82);
  body.position.y = 0.48;
  body.userData.isKitLayer = true;
  torsoGrp.add(body);

  const chestPlate = mesh(new THREE.CircleGeometry(0.16, 16), matStd(c.accent, 0.35, 0.28));
  chestPlate.position.set(0, 0.52, 0.27);
  torsoGrp.add(chestPlate);

  const headGrp = new THREE.Group();
  headGrp.name = 'Head_Group';
  headGrp.position.y = 0.92;
  torsoGrp.add(headGrp);

  const neck = mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.08, 10), matStd(c.jersey, 0.2, 0.4));
  neck.position.y = -0.06;
  headGrp.add(neck);

  const head = mesh(new THREE.SphereGeometry(0.28, 18, 16), matStd(c.jersey, 0.18, 0.32));
  head.position.y = 0.18;
  headGrp.add(head);

  const visor = mesh(
    new THREE.SphereGeometry(0.24, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.62),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(c.visor),
      emissive: new THREE.Color(c.visor),
      emissiveIntensity: 0.22,
      metalness: 0.45,
      roughness: 0.18,
    }),
  );
  visor.position.set(0, 0.16, 0.06);
  visor.rotation.x = 0.35;
  headGrp.add(visor);

  [-0.08, 0.08].forEach((x) => {
    const white = mesh(new THREE.SphereGeometry(0.075, 12, 10), matStd(EYE_WHITE, 0.05, 0.28));
    white.position.set(x, 0.2, 0.2);
    white.scale.set(0.85, 1.05, 0.55);
    headGrp.add(white);
    const pupil = mesh(new THREE.SphereGeometry(0.038, 10, 8), matStd(EYE_PUPIL, 0.05, 0.35));
    pupil.position.set(x, 0.2, 0.24);
    pupil.scale.set(0.7, 1, 0.5);
    headGrp.add(pupil);
  });

  const earL = mesh(new THREE.SphereGeometry(0.07, 8, 8), matStd(c.accent, 0.25, 0.4));
  earL.position.set(-0.26, 0.16, 0);
  headGrp.add(earL);
  const earR = earL.clone();
  earR.position.x = 0.26;
  headGrp.add(earR);

  const armGrps = [];
  [[-0.29, 'left', 0], [0.29, 'right', 1]].forEach(([x, side, si]) => {
    const armGrp = new THREE.Group();
    armGrp.name = `${side}_arm`;
    armGrp.position.set(x, 0.62, 0);
    torsoGrp.add(armGrp);

    const sleeve = mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.22, 8), matStd(c.jersey, 0.2, 0.38));
    sleeve.position.y = -0.1;
    armGrp.add(sleeve);

    const forearmGrp = new THREE.Group();
    forearmGrp.name = `${side}_forearm`;
    forearmGrp.position.y = -0.22;
    armGrp.add(forearmGrp);

    const forearm = mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.22, 8), matStd(c.jersey, 0.2, 0.4));
    forearm.position.y = -0.1;
    forearmGrp.add(forearm);

    const hand = mesh(
      c.isKeeper ? new THREE.BoxGeometry(0.16, 0.14, 0.1) : new THREE.SphereGeometry(0.07, 10, 8),
      matStd(c.hand, 0.12, 0.4),
    );
    hand.position.set(0, -0.24, 0.01);
    forearmGrp.add(hand);
    armGrps.push({ grp: armGrp, forearmGrp, si });
  });

  const THIGH_LEN = 0.31;
  const SHIN_LEN = 0.29;
  const HIP_ATTACH_Y = -0.02;
  const hipSpread = play === 'defender' ? 0.16 : 0.13;
  const legGrps = [];
  [[-hipSpread, 0], [hipSpread, 1]].forEach(([x, li]) => {
    const hipGrp = new THREE.Group();
    hipGrp.name = li === 0 ? 'left_hip' : 'right_hip';
    hipGrp.position.set(x, HIP_ATTACH_Y, 0);
    hipGrp.rotation.order = 'YXZ';
    torsoGrp.add(hipGrp);

    const thighGrp = new THREE.Group();
    thighGrp.name = 'thigh_pivot';
    hipGrp.add(thighGrp);
    const thigh = mesh(new THREE.CylinderGeometry(0.09, 0.1, THIGH_LEN, 8), matStd(c.shorts, 0.18, 0.42));
    thigh.position.y = -THIGH_LEN / 2;
    thighGrp.add(thigh);

    const shinGrp = new THREE.Group();
    shinGrp.name = 'shin_pivot';
    shinGrp.position.y = -THIGH_LEN;
    thighGrp.add(shinGrp);

    const sock = mesh(new THREE.CylinderGeometry(0.075, 0.085, SHIN_LEN, 8), matStd(c.socks, 0.18, 0.4));
    sock.position.y = -SHIN_LEN / 2;
    sock.userData.isKitLayer = true;
    shinGrp.add(sock);

    const ankleGrp = new THREE.Group();
    ankleGrp.name = 'ankle_pivot';
    ankleGrp.position.y = -SHIN_LEN;
    shinGrp.add(ankleGrp);

    const boot = mesh(new THREE.BoxGeometry(0.12, 0.09, 0.26), matStd(c.boot, 0.22, 0.42));
    boot.position.set(0, -0.05, 0.05);
    ankleGrp.add(boot);
    const tongue = mesh(new THREE.BoxGeometry(0.075, 0.035, 0.12), matStd('#111827', 0.15, 0.45));
    tongue.position.set(0, 0.008, 0.105);
    tongue.rotation.x = -0.28;
    ankleGrp.add(tongue);

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

  addNumberPlates(torsoGrp, jerseyNum);

  g.userData.isFootballBot = true;
  g.userData.isFootballPlayer = true;
  g.userData.combatPBR = true;
  g.userData.teamColor = teamColor;
  g.userData.jerseyNumber = jerseyNum;
  g.userData.bootType = config.bootType || 'standard';
  g.userData.playstyle = play;
  g.userData.rig = {
    torsoGrp,
    headGrp,
    armGrps,
    legGrps,
    variant: 'football',
  };

  if (play === 'defender') g.scale.set(1.22, 1.16, 1.2);
  else if (play === 'midfielder') g.scale.set(1.12, 1.14, 1.12);
  else if (c.isKeeper) g.scale.set(1.2, 1.18, 1.18);
  else g.scale.set(1.14, 1.2, 1.14);

  attachFootballRig(g, { team: c.team, jerseyNum });
  return g;
}

export function buildFootballBot(config = {}) {
  return buildFootballPlayer(config);
}

export function buildFootballHumanoidStub(opts = {}) {
  return buildFootballPlayer(opts);
}

function tintMeshMaterial(mat, colorHex, { emissive = null, emissiveIntensity = 0 } = {}) {
  if (!mat?.color) return;
  mat.color.set(colorHex);
  if (emissive && mat.emissive) {
    mat.emissive.set(emissive);
    mat.emissiveIntensity = emissiveIntensity;
  }
}

/** User striker — same cute visor robot as teammates, in team orange. */
export function buildUserStrikerFootballer(builderCfg = {}) {
  const jerseyNumber = builderCfg.jerseyNumber || 9;
  const name = builderCfg.name || 'My Robot';
  const player = buildFootballPlayer({
    teamColor: 'green',
    jerseyNumber,
    playstyle: builderCfg.playstyle || 'striker',
  });
  player.name = name.slice(0, 16);
  player.userData.isUserFootballStriker = true;
  player.userData.isUserBuilderStriker = true;
  player.userData.footballKitApplied = true;
  return player;
}

export function applyFootballTeamKit(root) {
  if (!root) return root;
  root.userData.footballKitApplied = true;
  return root;
}

export default buildFootballPlayer;
