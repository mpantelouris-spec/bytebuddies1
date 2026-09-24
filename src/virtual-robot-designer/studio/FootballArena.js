/**
 * FootballArena.js — 3D football pitch with goals, stadium lighting, ball physics.
 */
import * as THREE from 'three';
import { createFootballEngine, resolveFootballLayout, PITCH_HALF_X, PITCH_HALF_Z, GOAL_Z } from './football-match-engine.js';
import { createBallMesh, syncBallMesh } from './football-physics.js';
import { alignFighterToRingSurface } from './FightingArena.js';
import { buildFootballPlayerMesh, clampFootballActorScale } from './football/FootballPlayerKit.js';
import { prewarmFootballAssets } from './football/FootballAssetManifest.js';
import { buildFootballStadiumScene, buildFootballPitchGroup, finalizeFootballArenaLighting } from './football/FootballStadiumDirector.js';
import { bindFootballMatchPresentation } from './football/FootballMatchPresentation.js';

export const PITCH_SURFACE_Y = 0.02;
export const FOOTBALL_SCALE = 1.0;

function tagFootballLight(light) {
  light.userData.footballArenaLight = true;
  return light;
}

const GOAL_WIDTH = 4.2;
const GOAL_HEIGHT = 2.5 * 1.12;
const GOAL_DEPTH = 1.6 * 1.1;

function buildGoal(zSign) {
  const grp = new THREE.Group();
  const postMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35, metalness: 0.15 });
  const postR = 0.12;
  const postGeo = new THREE.CylinderGeometry(postR, postR, GOAL_HEIGHT, 10);
  const crossGeo = new THREE.CylinderGeometry(postR, postR, GOAL_WIDTH + postR * 2, 10);
  crossGeo.rotateZ(Math.PI / 2);

  const leftPost = new THREE.Mesh(postGeo, postMat);
  leftPost.position.set(-GOAL_WIDTH / 2, GOAL_HEIGHT / 2, 0);
  const rightPost = new THREE.Mesh(postGeo, postMat);
  rightPost.position.set(GOAL_WIDTH / 2, GOAL_HEIGHT / 2, 0);
  const crossbar = new THREE.Mesh(crossGeo, postMat);
  crossbar.position.set(0, GOAL_HEIGHT, 0);
  grp.add(leftPost, rightPost, crossbar);

  // Back bar + side bars for a proper goal frame
  const backZ = zSign > 0 ? -GOAL_DEPTH : GOAL_DEPTH;
  const backBar = new THREE.Mesh(crossGeo, postMat);
  backBar.position.set(0, GOAL_HEIGHT, backZ);
  grp.add(backBar);
  const sideGeo = new THREE.CylinderGeometry(postR * 0.7, postR * 0.7, GOAL_DEPTH, 8);
  sideGeo.rotateX(Math.PI / 2);
  const leftSide = new THREE.Mesh(sideGeo, postMat);
  leftSide.position.set(-GOAL_WIDTH / 2, GOAL_HEIGHT / 2, backZ / 2);
  const rightSide = new THREE.Mesh(sideGeo, postMat);
  rightSide.position.set(GOAL_WIDTH / 2, GOAL_HEIGHT / 2, backZ / 2);
  grp.add(leftSide, rightSide);

  // Net panels
  const netMat = new THREE.MeshBasicMaterial({
    color: 0xe8f4ff,
    transparent: true,
    opacity: 0.42,
    wireframe: true,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const backNet = new THREE.Mesh(new THREE.PlaneGeometry(GOAL_WIDTH, GOAL_HEIGHT), netMat);
  backNet.position.set(0, GOAL_HEIGHT / 2, backZ);
  grp.add(backNet);
  const roofNet = new THREE.Mesh(new THREE.PlaneGeometry(GOAL_WIDTH, GOAL_DEPTH), netMat);
  roofNet.rotation.x = -Math.PI / 2;
  roofNet.position.set(0, GOAL_HEIGHT, backZ / 2);
  grp.add(roofNet);
  const sideNetW = new THREE.Mesh(new THREE.PlaneGeometry(GOAL_DEPTH, GOAL_HEIGHT), netMat);
  sideNetW.rotation.y = Math.PI / 2;
  sideNetW.position.set(-GOAL_WIDTH / 2, GOAL_HEIGHT / 2, backZ / 2);
  grp.add(sideNetW);
  const sideNetE = sideNetW.clone();
  sideNetE.position.set(GOAL_WIDTH / 2, GOAL_HEIGHT / 2, backZ / 2);
  grp.add(sideNetE);

  // Goal-line marker
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const goalLine = new THREE.Mesh(new THREE.BoxGeometry(GOAL_WIDTH + 0.4, 0.04, 0.12), lineMat);
  goalLine.position.set(0, 0.03, zSign > 0 ? 0.15 : -0.15);
  grp.add(goalLine);

  grp.position.z = zSign * GOAL_Z;
  grp.frustumCulled = false;
  grp.renderOrder = 3;
  return grp;
}

function buildCornerFlag(x, z) {
  const grp = new THREE.Group();
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 1.4, 6),
    new THREE.MeshBasicMaterial({ color: 0xffffff }),
  );
  pole.position.y = 0.7;
  const flag = new THREE.Mesh(
    new THREE.PlaneGeometry(0.5, 0.35),
    new THREE.MeshBasicMaterial({ color: 0xffdd00, side: THREE.DoubleSide }),
  );
  flag.position.set(0.25, 1.15, 0);
  flag.userData.windFlag = true;
  grp.add(pole, flag);
  grp.position.set(x, PITCH_SURFACE_Y, z);
  return grp;
}

function buildStadiumLighting(scene, night = false, opts = {}) {
  const lights = [];
  const tier = scene.userData.qualityTier || 'medium';
  const fifaLite = opts.fifaLite || scene.userData.footballFifa3v3;
  const key = tagFootballLight(new THREE.DirectionalLight(0xfff4dc, night ? (fifaLite ? 1.05 : 1.28) : 1.35));
  key.position.set(6, 18, 8);
  key.castShadow = !fifaLite && tier !== 'low';
  const shadowSize = fifaLite ? 256 : (tier === 'low' ? 128 : tier === 'high' ? 512 : 256);
  key.shadow.mapSize.set(shadowSize, shadowSize);
  key.shadow.camera.left = -22;
  key.shadow.camera.right = 22;
  key.shadow.camera.top = 16;
  key.shadow.camera.bottom = -16;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 48;
  key.shadow.bias = -0.0007;
  key.shadow.normalBias = 0.025;
  const target = new THREE.Object3D();
  target.position.set(0, 0, 0);
  scene.add(target);
  key.target = target;
  scene.add(key);
  scene.userData.footballKeyLight = key;
  scene.userData.footballKeyTarget = target;
  lights.push(key);

  const fill = tagFootballLight(new THREE.DirectionalLight(0xb8e8ff, night ? 0.28 : 0.45));
  fill.position.set(-8, 10, -6);
  scene.add(fill);
  lights.push(fill);

  const amb = tagFootballLight(new THREE.AmbientLight(
    night ? 0x6b8ab8 : 0xfff5e8,
    night ? (fifaLite ? 0.42 : 0.72) : 0.98,
  ));
  scene.add(amb);
  lights.push(amb);
  return lights;
}

function makeFootballBotMesh(config) {
  return buildFootballPlayerMesh(config);
}

function addTeamRing(mesh, colorHex) {
  const arrow = new THREE.Mesh(
    new THREE.ConeGeometry(0.16, 0.34, 8),
    new THREE.MeshBasicMaterial({ color: colorHex }),
  );
  arrow.position.y = 2.22;
  arrow.userData.isActArrow = true;
  arrow.visible = false;
  mesh.add(arrow);
  mesh.userData.actArrow = arrow;
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.55, 0.72, 24),
    new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.55, side: THREE.DoubleSide }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.04;
  ring.userData.isTeamRing = true;
  mesh.add(ring);
  mesh.userData.teamRing = ring;
}

function addPitchMarker(scene, x, z, color = 0xffffff, radius = 0.55) {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(radius * 0.72, radius, 24),
    new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85, side: THREE.DoubleSide }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(x, PITCH_SURFACE_Y + 0.03, z);
  ring.renderOrder = 2;
  scene.add(ring);
}

export function buildFootballArena(scene, challenge = {}, playerConfig = {}) {
  prewarmFootballAssets();
  scene.userData.footballMode = true;
  scene.userData.combatMode = false;
  scene.userData.hideSpawnMarkers = true;
  scene.userData.skipSceneStylize = true;
  scene.userData.skipSoftEnvironment = true;
  scene.userData.skipArenaAtmosphere = true;
  scene.userData.skipAdaptivePerf = true;
  scene.userData.customSky = true;
  scene.userData.customDecor = true;
  const tier = scene.userData.qualityTier || 'medium';
  const layout = resolveFootballLayout(challenge);
  buildFootballStadiumScene(scene, layout.kind, tier);

  if (tier !== 'low') {
    scene.traverse((obj) => {
      if (obj.userData?.footballArenaLight) return;
      if (obj.isAmbientLight) obj.intensity = 0.7;
      if (obj.isHemisphereLight) obj.intensity = 0.85;
      if (obj.isDirectionalLight) obj.intensity *= 0.7;
    });
  }

  const pitchGrp = new THREE.Group();
  pitchGrp.name = 'FootballPitch';
  pitchGrp.add(buildFootballPitchGroup(layout.kind));
  const pitchScale = layout.pitchScale ?? 1;
  if (pitchScale !== 1) pitchGrp.scale.set(pitchScale, 1, pitchScale);
  pitchGrp.add(buildGoal(1));
  pitchGrp.add(buildGoal(-1));
  [
    [-PITCH_HALF_X + 0.5, -PITCH_HALF_Z + 0.5],
    [PITCH_HALF_X - 0.5, -PITCH_HALF_Z + 0.5],
    [-PITCH_HALF_X + 0.5, PITCH_HALF_Z - 0.5],
    [PITCH_HALF_X - 0.5, PITCH_HALF_Z - 0.5],
  ].forEach(([x, z]) => pitchGrp.add(buildCornerFlag(x, z)));
  scene.add(pitchGrp);

  buildStadiumLighting(scene, layout.kind === 'fifa', { fifaLite: layout.kind === 'fifa' && layout.teamSize >= 3 });
  if (layout.kind !== 'fifa' || layout.teamSize < 3) {
    finalizeFootballArenaLighting(scene, tier);
  }
  scene.userData.groundY = PITCH_SURFACE_Y;
  scene.userData.spawnX = layout.player?.x ?? -6;
  scene.userData.spawnZ = layout.player?.z ?? 0;
  scene.userData.spawnY = PITCH_SURFACE_Y;
  scene.userData.footballPitchScale = layout.pitchScale ?? 1;

  const ballMesh = createBallMesh();
  scene.add(ballMesh);
  scene.userData.footballBallMesh = ballMesh;

  const trailDots = layout.kind === 'fifa' && layout.teamSize >= 3
    ? []
    : [0.3, 0.2, 0.11].map((opacity, i) => {
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(0.12 - i * 0.018, 8, 6),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity,
        depthWrite: false,
      }),
    );
    dot.visible = false;
    dot.renderOrder = 7;
    scene.add(dot);
    return dot;
  });
  const trailHistory = Array.from({ length: 3 }, () => new THREE.Vector3());
  const passPositions = new Float32Array(6);
  const passGeometry = new THREE.BufferGeometry();
  passGeometry.setAttribute('position', new THREE.BufferAttribute(passPositions, 3));
  const passLine = new THREE.Line(
    passGeometry,
    new THREE.LineBasicMaterial({
      color: 0x86efac,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }),
  );
  passLine.frustumCulled = false;
  passLine.renderOrder = 9;
  scene.add(passLine);
  let passLineTimer = 0;

  const teamMeshes = [];

  const match = createFootballEngine({
    challenge,
    playerConfig,
    onMatchEvent: (evt) => {
      if (evt.type === 'goal_scored') {
        scene.userData.onFootballGoal?.({ x: evt.x, z: evt.z, scorer: 'player' });
      }
      if (evt.type === 'kick') {
        scene.userData.onFootballKick?.({ x: evt.x, z: evt.z, kickType: evt.kickType });
        if (/pass/i.test(evt.kickType || '') && Number.isFinite(evt.targetX) && Number.isFinite(evt.targetZ)) {
          passPositions.set([evt.x, 0.42, evt.z, evt.targetX, 0.42, evt.targetZ]);
          passGeometry.attributes.position.needsUpdate = true;
          passLine.material.opacity = 0.88;
          passLineTimer = 0.4;
        }
      }
      if (evt.type === 'match_end') {
        scene.userData.onFootballMatchEnd?.(evt);
      }
    },
  });

  const bots = match.getBots?.() || [];
  const playerNums = { defender: 4, striker: 9, midfielder: 8 };
  const enemyNums = { defender: 5, striker: 7, midfielder: 6 };
  bots.forEach((bot) => {
    if (bot.isPlayer) return;
    const teamColor = bot.team === 'player' ? 'green' : 'blue';
    const nums = bot.team === 'player' ? playerNums : enemyNums;
    const mesh = makeFootballBotMesh({
      teamColor,
      jerseyNumber: bot.isKeeper ? 1 : (nums[bot.role] || (bot.team === 'player' ? 10 : 7)),
      playstyle: bot.isKeeper ? 'goalkeeper' : (bot.role || 'striker'),
      name: `${bot.team}_${bot.id}`,
    });
    mesh.position.set(bot.x, 0, bot.z);
    mesh.rotation.y = bot.facing;
    alignFighterToRingSurface(mesh, PITCH_SURFACE_Y);
    mesh.userData.groundY = mesh.position.y;
    if (!mesh.userData.isGltfFootballPlayer) {
      mesh.scale.setScalar(1.0);
    }
    clampFootballActorScale(mesh, 1.68);
    alignFighterToRingSurface(mesh, PITCH_SURFACE_Y);
    const noShadow = scene.userData.footballFifa3v3;
    mesh.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = !noShadow;
        o.receiveShadow = !noShadow;
        o.frustumCulled = true;
      }
    });
    addTeamRing(mesh, bot.team === 'player' ? 0x22c55e : 0x3b82f6);
    scene.add(mesh);
    match.setBotMesh(bot.id, mesh);
    teamMeshes.push(mesh);
    if (bot.team === 'enemy' && !scene.userData.enemyMesh) scene.userData.enemyMesh = mesh;
  });

  scene.userData.footballTeamMeshes = teamMeshes;
  scene.userData.footballTeamSize = layout.teamSize;
  scene.userData.footballLayoutKind = layout.kind;
  scene.userData.footballFifa3v3 = layout.kind === 'fifa' && layout.teamSize >= 3;
  scene.userData.footballCamFollow = layout.cam;
  scene.userData.footballCamMode = scene.userData.footballCamMode || 'broadcast';
  if (layout.cam === 'sideline') {
    scene.userData.footballCamPreset = {
      position: new THREE.Vector3(24, 7.2, 0),
      lookAt: new THREE.Vector3(0, 0.85, 0),
      fov: 48,
    };
  } else if (layout.cam === 'penalty') {
    scene.userData.footballCamPreset = {
      position: new THREE.Vector3(8.8, 3.5, (layout.ball?.z ?? 6) - 5.5),
      lookAt: new THREE.Vector3(0, 1.15, GOAL_Z - 0.4),
      fov: 38,
    };
  } else if (layout.cam === 'keeper') {
    scene.userData.footballCamPreset = {
      position: new THREE.Vector3(9.2, 4.0, -GOAL_Z + 5.5),
      lookAt: new THREE.Vector3(0, 1.0, -GOAL_Z + 1.2),
      fov: 40,
    };
  } else {
    scene.userData.footballCamPreset = {
      position: new THREE.Vector3(14, 5.8, 10),
      lookAt: new THREE.Vector3(0, 0.85, 0),
      fov: 40,
    };
  }
  scene.userData.arenaBounds = {
    flappyNoIntro: true,
    footballCam: true,
    camMaxX: layout.cam === 'sideline' ? 22 : 32,
    camMinZ: layout.cam === 'sideline' ? -14 : -18,
    camMaxZ: layout.cam === 'sideline' ? 14 : 18,
  };
  if (layout.kind === 'penalty' || layout.kind === 'freekick') {
    addPitchMarker(scene, layout.ball.x, layout.ball.z, 0xffffff, 0.7);
  }
  if (layout.kind === 'training') {
    addPitchMarker(scene, 0, 0, 0x86c55e, 0.85);
  }

  scene.userData.football = match;
  scene.userData.getFootballState = () => match.getState();
  scene.userData.getCombatState = () => match.getState();
  syncBallMesh(ballMesh, match.getBall());
  match.syncPresentation?.(0);
  scene.userData.footballSimActive = false;
  let kickoffWhistled = false;
  const ledTexes = [];
  const windFlags = [];
  const kickoffRings = [];
  const crowdFascia = [];
  scene.traverse((o) => {
    if (o.userData?.ledTex) ledTexes.push(o.userData.ledTex);
    if (o.userData?.windFlag) windFlags.push(o);
    if (o.userData?.kickoffRing) kickoffRings.push(o);
    if (o.userData?.crowdFascia) crowdFascia.push(o);
  });
  scene.userData.movers = [{
    update(t, dt) {
      const st = match.getState?.() || {};
      for (const tex of ledTexes) tex.offset.x = (tex.offset.x + dt * 0.11) % 1;
      const flagSwing = Math.sin(t * 2.4) * 0.18;
      for (const flag of windFlags) flag.rotation.y = flagSwing;
      const kickoffOn = !st.kickoffDone;
      const ringScale = kickoffOn ? 1 + Math.sin(t * 5) * 0.08 : 1;
      for (const ring of kickoffRings) {
        ring.visible = kickoffOn;
        if (kickoffOn) ring.scale.setScalar(ringScale);
      }
      const pulse = (st.goalFlash || 0) > 0 ? 1.1 : 0.35;
      for (const fascia of crowdFascia) {
        if (fascia.material?.emissiveIntensity != null) fascia.material.emissiveIntensity = pulse;
      }
      const ball = match.getBall();
      const ballSpeed = Math.hypot(ball.vx || 0, ball.vz || 0);
      const trailMinSpeed = (st.goalFlash || 0) > 0 ? 0.65 : 0.95;
      for (let i = trailHistory.length - 1; i > 0; i -= 1) {
        trailHistory[i].copy(trailHistory[i - 1]);
      }
      trailHistory[0].set(ball.x, ball.y, ball.z);
      for (let i = 0; i < trailDots.length; i += 1) {
        const showTrail = ballSpeed > trailMinSpeed && scene.userData.footballSimActive;
        trailDots[i].visible = showTrail;
        if (showTrail) {
          trailDots[i].position.copy(trailHistory[i]);
          const shotBoost = ballSpeed > 6 ? 1.35 : 1;
          trailDots[i].scale.setScalar(shotBoost);
        }
      }
      if (passLineTimer > 0) {
        passLineTimer = Math.max(0, passLineTimer - dt);
        passLine.material.opacity = 0.88 * (passLineTimer / 0.4);
      } else {
        passLine.material.opacity = 0;
      }
      const key = scene.userData.footballKeyLight;
      const keyTarget = scene.userData.footballKeyTarget;
      if (key && keyTarget) {
        const followX = THREE.MathUtils.clamp(ball.x * 0.1, -2, 2);
        key.position.x = 6 + followX;
        keyTarget.position.x = followX;
        keyTarget.position.z = THREE.MathUtils.clamp(ball.z * 0.08, -2, 2);
        keyTarget.updateMatrixWorld();
      }
      if (!scene.userData.footballSimActive) {
        match.syncPresentation?.(0);
        for (const mesh of teamMeshes) mesh.userData.animate?.(t, dt);
        syncBallMesh(ballMesh, ball, dt);
        return;
      }
      if (st.kickoffDone && !kickoffWhistled) {
        kickoffWhistled = true;
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.frequency.value = 980;
          gain.gain.value = 0.08;
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.18);
        } catch { /* ignore */ }
      }
      try {
        match.tick((st.goalFlash || 0) > 0 ? dt * 0.45 : dt);
      } catch (tickErr) {
        console.warn('[Robot Football] match tick failed', tickErr);
      }
      syncBallMesh(ballMesh, match.getBall(), dt);
    },
  }];
  scene.userData.setFootballSimActive = (active) => {
    const wasActive = !!scene.userData.footballSimActive;
    scene.userData.footballSimActive = !!active;
    if (active && !wasActive && !scene.userData.footballFifaLiveMatch) {
      kickoffWhistled = false;
      match.reset?.();
    }
  };

  if (scene.userData.footballFifa3v3) {
    scene.userData.footballFifaLiveMatch = true;
    scene.userData.footballUserStopped = true;
    scene.userData.footballSimActive = false;
    match.syncPresentation?.(0);
  }

  scene.userData.onFootballGoal = ({ x = 0, z = 0 } = {}) => {
    scene.userData.onCombatImpact?.({ x, y: 1, z, intensity: 1.5, heavy: true });
  };
  scene.userData.onFootballKick = ({ x = 0, z = 0, kickType = '' } = {}) => {
    scene.userData.onCombatAttack?.({ x, z, heavy: kickType === 'shot', actionId: kickType });
  };

  bindFootballMatchPresentation(scene, match);

  return match;
}

export { alignFighterToRingSurface };
