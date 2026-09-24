/**
 * Mini FIFA footballers — human kit silhouettes, not boxing mechs.
 * Shirt / shorts / socks / boots. No visors. No combat gloves (keeper yellow only).
 */
import * as THREE from 'three';
import { TEAM_PRESETS } from '../data/football-robot-types.js';
import { attachFootballRig } from './football-rig.js';

const SKINS = ['#e8b896', '#9c6644'];
const HAIRS = ['#2a1a12', '#6b3f24', '#171717'];
const EYE = '#1f2937';

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
  const skin = SKINS[Math.abs(Number(jerseyNumber) || 0) % SKINS.length];
  const hair = HAIRS[Math.abs(Number(jerseyNumber) || 0) % HAIRS.length];
  return {
    team,
    jersey: isKeeper ? '#eab308' : (isBlue ? '#2563eb' : '#16a34a'),
    shorts: isKeeper ? '#111827' : '#f8fafc',
    socks: isKeeper ? '#111827' : (isBlue ? '#2563eb' : '#16a34a'),
    boot: team.boot || '#111827',
    hand: isKeeper ? '#facc15' : skin,
    skin,
    hair,
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

  const pelvis = mesh(new THREE.SphereGeometry(0.12, 10, 8), matStd(c.shorts));
  pelvis.position.y = 0.02;
  torsoGrp.add(pelvis);

  const shorts = mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.24, 10), matStd(c.shorts, 0.05, 0.6));
  shorts.position.y = 0.12;
  shorts.userData.isKitLayer = true;
  torsoGrp.add(shorts);

  const shirt = mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.48, 10), matStd(c.jersey, 0.06, 0.52));
  shirt.position.y = 0.46;
  shirt.userData.isKitLayer = true;
  torsoGrp.add(shirt);

  [-1, 1].forEach((sign) => {
    const collar = mesh(new THREE.BoxGeometry(0.12, 0.025, 0.025), matStd('#f8fafc', 0.1, 0.45));
    collar.position.set(sign * 0.045, 0.69, 0.205);
    collar.rotation.z = sign * 0.52;
    torsoGrp.add(collar);
  });

  const headGrp = new THREE.Group();
  headGrp.name = 'Head_Group';
  headGrp.position.y = 0.92;
  torsoGrp.add(headGrp);

  const neck = mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.1, 8), matStd(c.skin, 0.04, 0.55));
  neck.position.y = -0.08;
  headGrp.add(neck);

  const head = mesh(new THREE.SphereGeometry(0.15, 14, 12), matStd(c.skin, 0.04, 0.52));
  head.position.y = 0.08;
  headGrp.add(head);

  const hair = mesh(new THREE.SphereGeometry(0.156, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), matStd(c.hair, 0.05, 0.7));
  hair.position.y = 0.12;
  hair.rotation.x = 0.15;
  headGrp.add(hair);

  [-0.045, 0.045].forEach((x) => {
    const eye = mesh(new THREE.SphereGeometry(0.018, 8, 6), matStd(EYE, 0.05, 0.4));
    eye.position.set(x, 0.09, 0.11);
    headGrp.add(eye);
  });

  const armGrps = [];
  [[-0.29, 'left', 0], [0.29, 'right', 1]].forEach(([x, side, si]) => {
    const armGrp = new THREE.Group();
    armGrp.name = `${side}_arm`;
    armGrp.position.set(x, 0.62, 0);
    torsoGrp.add(armGrp);

    const sleeve = mesh(new THREE.CylinderGeometry(0.055, 0.06, 0.22, 8), matStd(c.jersey));
    sleeve.position.y = -0.1;
    armGrp.add(sleeve);
    const sleeveTrim = mesh(new THREE.TorusGeometry(0.06, 0.012, 6, 10), matStd('#f8fafc', 0.05, 0.5));
    sleeveTrim.rotation.x = Math.PI / 2;
    sleeveTrim.position.y = -0.205;
    armGrp.add(sleeveTrim);

    const forearmGrp = new THREE.Group();
    forearmGrp.name = `${side}_forearm`;
    forearmGrp.position.y = -0.22;
    armGrp.add(forearmGrp);

    const forearm = mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.22, 8), matStd(c.skin, 0.04, 0.55));
    forearm.position.y = -0.1;
    forearmGrp.add(forearm);

    const hand = mesh(
      c.isKeeper ? new THREE.BoxGeometry(0.14, 0.12, 0.09) : new THREE.SphereGeometry(0.055, 10, 8),
      matStd(c.hand, 0.05, 0.5),
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
    const thigh = mesh(new THREE.CylinderGeometry(0.08, 0.09, THIGH_LEN, 8), matStd(c.shorts));
    thigh.position.y = -THIGH_LEN / 2;
    thighGrp.add(thigh);

    const shinGrp = new THREE.Group();
    shinGrp.name = 'shin_pivot';
    shinGrp.position.y = -THIGH_LEN;
    thighGrp.add(shinGrp);

    const sock = mesh(new THREE.CylinderGeometry(0.065, 0.075, SHIN_LEN, 8), matStd(c.socks));
    sock.position.y = -SHIN_LEN / 2;
    sock.userData.isKitLayer = true;
    shinGrp.add(sock);
    const sockFold = mesh(new THREE.TorusGeometry(0.073, 0.014, 6, 10), matStd('#f8fafc', 0.03, 0.62));
    sockFold.rotation.x = Math.PI / 2;
    sockFold.position.y = -0.035;
    shinGrp.add(sockFold);

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

  if (play === 'defender') g.scale.set(1.18, 1.08, 1.16);
  else if (play === 'midfielder') g.scale.set(1.04, 1.08, 1.04);
  else if (c.isKeeper) g.scale.set(1.14, 1.1, 1.12);
  else g.scale.set(0.98, 1.14, 0.98);

  const tags = { defender: 'DEF', midfielder: 'MID', striker: 'ST', goalkeeper: 'GK' };
  g.add(makeNameplate(`#${jerseyNum}  ${tags[play] || 'ST'}`, teamColor === 'blue' ? '#93c5fd' : '#86efac'));
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

/** User-built striker — human footballer with builder colours + cyber legs (not a rover on the pitch). */
export function buildUserStrikerFootballer(builderCfg = {}) {
  const primary = builderCfg.primaryColor || '#ff8c00';
  const accent = builderCfg.accentColor || '#22d3ee';
  const jerseyNumber = builderCfg.jerseyNumber || 9;
  const name = builderCfg.name || 'My Robot';

  const player = buildFootballPlayer({
    teamColor: 'green',
    jerseyNumber,
    playstyle: 'striker',
  });
  player.name = name.slice(0, 16);

  player.traverse((o) => {
    if (!o.isMesh || !o.material) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    mats.forEach((m) => {
      if (o.userData?.isKitLayer || o.name?.includes('shirt') || (o.parent?.name === 'torsoGrp')) {
        tintMeshMaterial(m, primary, { emissive: primary, emissiveIntensity: 0.08 });
      }
      if (o.userData?.isJerseyPlate) {
        tintMeshMaterial(m, '#ffffff');
      }
    });
  });

  const rig = player.userData?.rig;
  if (rig?.legGrps) {
    rig.legGrps.forEach((leg) => {
      const shinGrp = leg.shinGrp;
      if (!shinGrp) return;
      const cyber = mesh(
        new THREE.BoxGeometry(0.11, 0.2, 0.09),
        matStd(accent, 0.55, 0.35),
      );
      cyber.position.set(0, -0.12, 0.04);
      cyber.userData.isCyberLeg = true;
      shinGrp.add(cyber);
      const glow = mesh(
        new THREE.BoxGeometry(0.08, 0.14, 0.04),
        new THREE.MeshStandardMaterial({
          color: new THREE.Color(accent),
          emissive: new THREE.Color(accent),
          emissiveIntensity: 0.42,
          metalness: 0.4,
          roughness: 0.3,
        }),
      );
      glow.position.set(0, -0.1, 0.1);
      glow.userData.isCyberGlow = true;
      shinGrp.add(glow);
    });
  }

  player.userData.isUserFootballStriker = true;
  player.userData.isUserBuilderStriker = true;
  player.userData.footballKitApplied = true;
  player.userData.builderPrimary = primary;
  player.userData.builderAccent = accent;

  const band = new THREE.Mesh(
    new THREE.TorusGeometry(0.15, 0.028, 8, 16),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 }),
  );
  band.rotation.z = Math.PI / 2;
  band.position.set(0.24, 0.55, 0);
  band.userData.isCaptainBand = true;
  const attach = rig?.torsoGrp || player;
  attach.add(band);

  return player;
}

/** Full kit overlay for custom builder meshes AND captain band on #9. */
export function applyFootballTeamKit(root, { teamColor = 'green', jerseyNumber = 9 } = {}) {
  if (!root) return root;
  if (root.userData?.footballKitApplied) return root;
  root.userData.footballKitApplied = true;

  if (root.userData?.isUserBuilderStriker || (root.userData?.isUserFootballStriker && root.userData?.isFootballPlayer)) {
    return root;
  }

  if (!root.userData?.isFootballPlayer && !root.userData?.isFootballBot) {
    root.traverse((o) => {
      if (!o.isMesh || !o.material) return;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((m) => {
        if (m.emissiveIntensity > 0.4) m.emissiveIntensity = 0;
      });
    });
    addFootballKitLayers(root, { teamColor, jerseyNumber, playstyle: 'striker' });
    root.add(makeNameplate(`#${jerseyNumber}  ST`, '#86efac'));
  }

  const band = new THREE.Mesh(
    new THREE.TorusGeometry(0.15, 0.028, 8, 16),
    new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.4 }),
  );
  band.rotation.z = Math.PI / 2;
  band.position.set(0.24, 0.55, 0);
  band.userData.isCaptainBand = true;
  const attach = root.userData?.rig?.torsoGrp || root;
  attach.add(band);
  return root;
}

export default buildFootballPlayer;
