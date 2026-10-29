/**
 * FlappyBirdArena.js — 3D side-scrolling Flappy Bird (Part 8)
 * Bird stays fixed on Z; world scrolls toward camera. Cylindrical pipes, parallax, audio.
 */
import * as THREE from 'three';
import { FLAPPY_TIER_LEVELS } from '../data/tier-levels/sports-tiers.js';
import { getTierMood } from '../data/tier-levels/index.js';
import { tint } from '../data/tier-levels/moods.js';
import { playFlapSound, playScoreSound, playCollisionSound, playGameOverSound, playWinSound, playBeepSound } from './flappy-bird-audio.js';
import { applyMissionKidClarity } from './mission-world/MissionKidClarity.js';
import { buildClassicFlappyBackdrop, flappyGrassTexture, flappySoilTexture, pbr } from './flappy/FlappyClassicBackdrop.js';

const SCROLL_SPEED = 5.5;
const GRAVITY = -13;
const FLAP_VEL = 7.8;
const PIPE_RADIUS = 1.25;
const BIRD_Z = 0;
const GROUND_Y = -4;
const CEIL_Y = 13;
const START_Y = 5;
const WORLD_H = CEIL_Y - GROUND_Y;

/** Map game-world Y to spec height units (0 = ground, ~20 = ceiling). */
function yToHeight(y) {
  return Math.round(Math.max(0, Math.min(20, ((y - GROUND_Y) / WORLD_H) * 20)) * 10) / 10;
}

/** Map spec height units to world Y. */
function heightToY(h) {
  const t = Math.max(0, Math.min(20, h)) / 20;
  return GROUND_Y + 0.35 + t * (WORLD_H - 0.7);
}
const PIPE_COUNT = 28;
const FIRST_PIPE_Z = -6;
const DESPAWN_Z = 16;
const GROUND_SEGS = 6; // enough ground for the angled camera to see far down the course

const PIPE_GREEN = 0x5ec637;
const PIPE_DARK = 0x3a9e28;

const FLAPPY_VARIANTS = [
  { skyTop: 0x5aaee0, skyBot: 0xcde9f2, pipe: 0x5fae2e, pipeDark: 0x3f7f1c, grass: 0x6aa53c, label: 'Pipe Navigator' },
  { skyTop: 0xfbbf24, skyBot: 0xfde68a, pipe: 0x22c55e, pipeDark: 0x15803d, grass: 0xa3e635, label: 'Slingshot Launch' },
  { skyTop: 0x38bdf8, skyBot: 0x7dd3fc, pipe: 0x06b6d4, pipeDark: 0x0891b2, grass: 0x4ade80, label: 'Endless Runner' },
  { skyTop: 0xfbbf24, skyBot: 0xf97316, pipe: 0x22c55e, pipeDark: 0x16a34a, grass: 0xfacc15, label: 'Golden Egg' },
  { skyTop: 0x94a3b8, skyBot: 0xcbd5e1, pipe: 0x64748b, pipeDark: 0x475569, grass: 0x94a3b8, label: 'Wind Gust' },
  { skyTop: 0xa855f7, skyBot: 0x7c3aed, pipe: 0xec4899, pipeDark: 0xdb2777, grass: 0xc084fc, label: 'Gravity Flip' },
  { skyTop: 0x4ade80, skyBot: 0x86efac, pipe: 0x15803d, pipeDark: 0x14532d, grass: 0x22c55e, label: 'Nest Landing' },
  { skyTop: 0xf472b6, skyBot: 0xfbcfe8, pipe: 0xf43f5e, pipeDark: 0xe11d48, grass: 0xfda4af, label: 'Balloon Pop' },
  { skyTop: 0x78716c, skyBot: 0xa8a29e, pipe: 0x57534e, pipeDark: 0x44403c, grass: 0xd6d3d1, label: 'Fortress Smash' },
  { skyTop: 0xffd700, skyBot: 0xfffbeb, pipe: 0xfbbf24, pipeDark: 0xd97706, grass: 0xfde047, label: 'Master 100' },
];

function deterministicSeed(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function getModeDifficulty(mode) {
  const t = (mode - 1) / 9;
  return {
    speedScale: 0.94 + t * 0.34,
    pipeSpacing: 12 - t * 2.25,
    gapMin: 3.8 - t * 0.6,
    gapMax: 5.9 - t * 1.25,
    gapStart: 5.25 - t * 1.35,
    verticalDrift: 1.55 + t * 0.8,
  };
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function makePipeMaterial(pipeGreen = PIPE_GREEN, pipeDark = PIPE_DARK) {
  // Glossy painted steel, like the other arenas' props
  const body = new THREE.MeshPhysicalMaterial({ color: pipeGreen, roughness: 0.32, metalness: 0.25, clearcoat: 0.6, clearcoatRoughness: 0.25 });
  const cap = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(pipeGreen).multiplyScalar(0.92), roughness: 0.3, metalness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.2 });
  const flange = pbr(new THREE.Color(pipeDark).multiplyScalar(0.8).getHex(), { rough: 0.4, metal: 0.55 });
  const bolt = pbr(0xb8c0c8, { rough: 0.3, metal: 0.9 });
  return { body, cap, flange, bolt };
}

function createPipeLayoutGenerator(mode = 1, seed = 1) {
  // Modes 11–50 pass their own difficulty settings (data/tier-levels/sports-tiers.js)
  const difficulty = typeof mode === 'object' ? mode : getModeDifficulty(mode);
  let state = seed >>> 0;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  let gapCY = (GROUND_Y + CEIL_Y) / 2;
  let firstPipe = true;
  return () => {
    // Give every pair a visibly different pipe height and opening, like the
    // classic game. Sampling the opening width per pair avoids the old slow
    // random walk where many consecutive pillars ended up nearly identical.
    const gapSize = firstPipe
      ? difficulty.gapStart
      : difficulty.gapMin + random() * (difficulty.gapMax - difficulty.gapMin);
    firstPipe = false;
    // Keep height changes reachable while allowing the gap to move enough that
    // the upper and lower pillars have clearly different lengths.
    const maxVerticalStep = difficulty.verticalDrift * 1.35;
    gapCY += (random() * 2 - 1) * maxVerticalStep;
    const half = gapSize / 2;
    gapCY = Math.max(GROUND_Y + half + 0.9, Math.min(CEIL_Y - half - 0.8, gapCY));
    return { gapCY, gapSize };
  };
}

function buildVerticalPipe(height, mats, withCapAtBottom) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(PIPE_RADIUS, PIPE_RADIUS, 1, 32), mats.body);
  body.scale.y = height;
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);
  // Mouth: a wider collar with a rolled lip, a flange ring and bolts
  const cap = new THREE.Group();
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(PIPE_RADIUS * 1.18, PIPE_RADIUS * 1.18, 0.62, 32), mats.cap);
  collar.castShadow = true;
  cap.add(collar);
  const lip = new THREE.Mesh(new THREE.TorusGeometry(PIPE_RADIUS * 1.18, 0.08, 10, 40), mats.cap);
  lip.rotation.x = Math.PI / 2;
  lip.position.y = withCapAtBottom ? -0.31 : 0.31;
  cap.add(lip);
  const flange = new THREE.Mesh(new THREE.CylinderGeometry(PIPE_RADIUS * 1.08, PIPE_RADIUS * 1.08, 0.12, 32), mats.flange);
  flange.position.y = withCapAtBottom ? 0.37 : -0.37;
  cap.add(flange);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const bolt = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.1, 6), mats.bolt);
    bolt.rotation.z = Math.PI / 2;
    bolt.position.set(Math.cos(a) * PIPE_RADIUS * 1.18, 0, Math.sin(a) * PIPE_RADIUS * 1.18);
    bolt.lookAt(0, 0, 0);
    cap.add(bolt);
  }
  cap.position.y = withCapAtBottom ? -height / 2 + 0.31 : height / 2 - 0.31;
  g.add(cap);
  // stripe/outline are kept as empty placeholders for the sizing code
  const stripe = new THREE.Object3D();
  const outline = new THREE.Object3D();
  return { group: g, body, cap, stripe, outline };
}

function setPipeSegmentHeight(pipePart, height, cap, capAtBottom) {
  const h = Math.max(0.5, height);
  pipePart.body.scale.y = h;
  pipePart.stripe.scale.y = h;
  pipePart.outline.scale.y = h;
  pipePart.cap.position.y = capAtBottom ? -h / 2 + 0.31 : h / 2 - 0.31;
}

function layoutPipePair(pipe, pz, layout) {
  const { gapCY, gapSize } = layout;
  const halfGap = gapSize / 2;
  const topBottom = gapCY + halfGap;
  const botTop = gapCY - halfGap;
  const topH = Math.max(0.5, CEIL_Y - topBottom);
  const botH = Math.max(0.5, botTop - GROUND_Y);
  pipe.gapCY = gapCY;
  pipe.halfGap = halfGap;
  pipe.gapSize = gapSize;
  pipe.z = pz;
  setPipeSegmentHeight(pipe.topPart, topH, pipe.topCap, true);
  pipe.topGroup.position.set(0, topBottom + topH / 2, pz);
  setPipeSegmentHeight(pipe.botPart, botH, pipe.botCap, false);
  pipe.botGroup.position.set(0, GROUND_Y + botH / 2, pz);
}

function makePipePair(scene, mats, pz, layout) {
  const top = buildVerticalPipe(1, mats, true);
  const bot = buildVerticalPipe(1, mats, false);
  scene.add(top.group);
  scene.add(bot.group);
  top.group.name = 'flappyPipe';
  bot.group.name = 'flappyPipe';
  const pipe = {
    z: pz, gapCY: layout.gapCY, halfGap: layout.gapSize / 2, gapSize: layout.gapSize,
    topGroup: top.group, botGroup: bot.group,
    topPart: top, botPart: bot,
    topBody: top.body, botBody: bot.body, topCap: top.cap, botCap: bot.cap,
    scored: false,
  };
  layoutPipePair(pipe, pz, layout);
  return pipe;
}

const FLAPPY_HS_KEY = 'bb-flappy-high-score';

function loadFlappyBest() {
  try { return Math.max(0, parseInt(localStorage.getItem(FLAPPY_HS_KEY) || '0', 10) || 0); } catch { return 0; }
}

function saveFlappyBest(score) {
  try { localStorage.setItem(FLAPPY_HS_KEY, String(score)); } catch { /* ignore */ }
}

export function buildFlappyBirdArena(scene, challenge = {}) {
  applyMissionKidClarity(scene, challenge);
  const modeN = Number(challenge.modeIndex || challenge.modeNumber) || 1;
  const tierLevel = modeN > 10 ? FLAPPY_TIER_LEVELS[modeN - 11] : null;
  const variantIdx = tierLevel ? tierLevel.look : Math.max(0, Math.min(9, modeN - 1));
  const flapMood = tierLevel ? getTierMood('birdbot', tierLevel) : null;
  const baseVariant = FLAPPY_VARIANTS[variantIdx];
  // Tier levels: the same world in its own light (dawn, dusk, storm…)
  const variant = tierLevel ? {
    ...baseVariant,
    skyTop: tint(baseVariant.skyTop, flapMood), skyBot: tint(baseVariant.skyBot, flapMood),
    pipe: tint(baseVariant.pipe, flapMood, 0.5), pipeDark: tint(baseVariant.pipeDark, flapMood, 0.5),
    grass: tint(baseVariant.grass, flapMood, 0.6), label: tierLevel.name,
  } : baseVariant;
  const mode = tierLevel ? modeN : variantIdx + 1;
  const difficulty = tierLevel ? tierLevel.difficulty : getModeDifficulty(mode);
  const pipeTarget = tierLevel?.target || 0; // tier levels are won by passing this many pipes
  const compositionKey = `${challenge.id || challenge.missionId || challenge.title || challenge.name || 'flappy'}:birdbot:${mode}`;
  const layoutSeed = deterministicSeed(compositionKey);
  const SKY_TOP = variant.skyTop;
  const SKY_BOT = variant.skyBot;
  scene.userData.flappyVariant = variant;
  scene.userData.flappyModeLabel = variant.label;

  scene.userData.customSky = true;
  scene.userData.customDecor = true;
  scene.userData.arenaBounds = {
    camMinZ: -9999, camMaxX: 24, camMaxZ: 9999,
    flappySideCam: true, flappyNoIntro: true,
  };
  scene.userData.lightMood = [1.15, 1.05, 0.95];

  const skyCanvas = document.createElement('canvas');
  skyCanvas.width = 2;
  skyCanvas.height = 512;
  const skyCtx = skyCanvas.getContext('2d');
  const grad = skyCtx.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, `#${new THREE.Color(SKY_TOP).getHexString()}`);
  grad.addColorStop(1, `#${new THREE.Color(SKY_BOT).getHexString()}`);
  skyCtx.fillStyle = grad;
  skyCtx.fillRect(0, 0, 2, 512);
  scene.background = new THREE.CanvasTexture(skyCanvas);
  scene.background.colorSpace = THREE.SRGBColorSpace; // otherwise read as linear and washed out
  scene.background.mapping = THREE.EquirectangularReflectionMapping;

  // Daylight like the other arenas: sky/ground fill plus a warm sun with soft
  // shadows. The lab's generic lights are switched off on the first frame so
  // they don't stack on top and wash the scene out.
  const ambient = new THREE.HemisphereLight(0xcfe8ff, 0x5a7a3a, 1.0);
  const sun = new THREE.DirectionalLight(0xfff1dc, 2.4);
  sun.position.set(16, 26, 14);
  sun.target.position.set(0, 0, -10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.03;
  Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 90 });
  ambient.userData.flappyLight = true;
  sun.userData.flappyLight = true;
  scene.add(ambient, sun, sun.target);
  // Haze gives the distant hills and city real depth
  scene.fog = new THREE.Fog(new THREE.Color(SKY_BOT).getHex(), 45, 150);

  // Classic side-scroller: the camera sits on +X looking across the course,
  // with the bird on the left third and pipes arriving from the right.
  // Raised three-quarter view: the course recedes to the right, so the pipes,
  // ground and backdrop read with real depth while the bird stays on the left
  const CAM = { x: 21, y: 9.5, z: 8, lookX: 0, lookY: 3.6, lookZ: -6.5, fov: 44 };
  scene.userData.flappyCamPreset = CAM;
  const faceCamera = (m) => m.lookAt(CAM.x, CAM.y, CAM.z);
  scene.userData.qualityMetrics = {
    ...(scene.userData.qualityMetrics || {}),
    flappy: { classic3d: true, deterministic: true, sideCamera: true },
  };
  const parallaxLayers = buildClassicFlappyBackdrop(scene, variant);

  const birdShadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.7, 24),
    new THREE.MeshBasicMaterial({ color: 0x1f3a10, transparent: true, opacity: 0.3, depthWrite: false }),
  );
  birdShadow.rotation.x = -Math.PI / 2;
  birdShadow.position.set(0, GROUND_Y + 0.02, BIRD_Z);
  birdShadow.name = 'FlappyBirdShadow';
  birdShadow.userData.flappyOwn = true;
  scene.add(birdShadow);

  const clouds = [];

  const groundSegs = [];
  const dirtMat = pbr(0xffffff, { map: flappySoilTexture(), rough: 0.95 });
  const grassMat = pbr(0xffffff, { map: flappyGrassTexture(variant.grass), rough: 0.92 });
  // Lawn over a deep soil bank, reaching under the camera
  for (let i = 0; i < GROUND_SEGS; i++) {
    const seg = new THREE.Group();
    const dirt = new THREE.Mesh(new THREE.BoxGeometry(70, 12, 28), dirtMat);
    dirt.position.set(-6, GROUND_Y - 6.45, 0);
    seg.add(dirt);
    const grass = new THREE.Mesh(new THREE.BoxGeometry(70, 0.9, 28), grassMat);
    grass.position.set(-6, GROUND_Y - 0.45, 0);
    grass.receiveShadow = true;
    seg.add(grass);
    seg.position.z = 28 - i * 28;
    scene.add(seg);
    groundSegs.push(seg);
  }

  const pipeMats = makePipeMaterial(variant.pipe, variant.pipeDark);
  const layoutGen = createPipeLayoutGenerator(tierLevel ? difficulty : mode, layoutSeed);
  const pipes = [];
  for (let i = 0; i < PIPE_COUNT; i++) {
    pipes.push(makePipePair(scene, pipeMats, FIRST_PIPE_Z - i * difficulty.pipeSpacing, layoutGen()));
  }
  scene.userData.qualityMetrics.flappy = {
    ...scene.userData.qualityMetrics.flappy,
    gapRange: [difficulty.gapMin, difficulty.gapMax],
    pipeSpacing: difficulty.pipeSpacing,
    speedScale: difficulty.speedScale,
  };

  let scoreLabel = null;
  const updateScore = (score, best = 0, gameOver = false) => {
    if (scoreLabel) {
      scene.remove(scoreLabel);
      scoreLabel.geometry.dispose();
      scoreLabel.material.map?.dispose();
      scoreLabel.material.dispose();
    }
    // Big white outlined number, like the original score
    const cv = document.createElement('canvas');
    cv.width = 320;
    cv.height = 200;
    const ctx = cv.getContext('2d');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    const outlinedText = (text, y, size, fill) => {
      ctx.font = `900 ${size}px "Arial Black", Arial, sans-serif`;
      ctx.lineWidth = size * 0.16;
      ctx.strokeStyle = '#3a2208';
      ctx.strokeText(text, 160, y);
      ctx.fillStyle = fill;
      ctx.fillText(text, 160, y);
    };
    if (gameOver) outlinedText('GAME OVER', 34, 40, '#fca03c');
    outlinedText(String(score), gameOver ? 105 : 80, 96, '#ffffff');
    outlinedText(`BEST ${best}`, gameOver ? 172 : 160, 28, '#ffe9a8');
    const tex = new THREE.CanvasTexture(cv);
    scoreLabel = new THREE.Mesh(
      new THREE.PlaneGeometry(3.4, 2.1),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false, side: THREE.DoubleSide }),
    );
    scoreLabel.position.set(1, 9.2, -7);
    faceCamera(scoreLabel);
    scoreLabel.renderOrder = 20; // HUD-like: never hidden behind a pipe
    scene.add(scoreLabel);
  };
  updateScore(0, 0);

  const hintCv = document.createElement('canvas');
  hintCv.width = 440;
  hintCv.height = 72;
  const hintCtx = hintCv.getContext('2d');
  roundRect(hintCtx, 0, 0, 440, 72, 14);
  hintCtx.fillStyle = 'rgba(0,0,0,0.45)';
  hintCtx.fill();
  hintCtx.font = 'bold 22px Arial';
  hintCtx.fillStyle = '#fff';
  hintCtx.textAlign = 'center';
  hintCtx.textBaseline = 'middle';
  hintCtx.fillText('Press Simulate — your code flies the bird', 220, 36);
  const hintTex = new THREE.CanvasTexture(hintCv);
  const hint = new THREE.Mesh(
    new THREE.PlaneGeometry(6.2, 1),
    new THREE.MeshBasicMaterial({ map: hintTex, transparent: true, depthWrite: false, depthTest: false, side: THREE.DoubleSide }),
  );
  hint.position.set(1, 7.4, -7);
  faceCamera(hint);
  hint.renderOrder = 20;
  scene.add(hint);
  setTimeout(() => { if (hint.parent) scene.remove(hint); }, 8000);

  let vy = 0;
  let flappyY = START_Y;
  let score = 0;
  let bestScore = loadFlappyBest();
  let alive = true;
  let died = false;
  let awaitingRestart = false;
  let crashType = '';
  let speedMul = 1;
  let scrollSetting = 5;
  let flapStrength = 5;
  let gravityStrength = 5;
  let showScoreHud = true;
  let gameStarted = false;
  let bobPhase = 0;
  let simActive = false;
  let gamePaused = false;
  let pauseTimer = 0;
  let freezeThisFrame = false;
  let runAliveTime = 0;
  let layoutGenRun = createPipeLayoutGenerator(tierLevel ? difficulty : mode, layoutSeed);
  let lastGapEventPipe = null;
  let gameOverFired = false;
  let wingFlapT = 0;
  let camShakeT = 0;
  let deathT = 0;
  let _firstFrame = true;
  let messageMesh = null;
  let messageTimer = 0;
  const variableOverlays = new Map();
  let _rsRef = null;

  const gravityScale = () => gravityStrength / 5;
  const flapScale = () => flapStrength / 5;

  const nearestPipe = () => {
    let best = null;
    let bestDist = Infinity;
    for (const pipe of pipes) {
      const dz = pipe.z - BIRD_Z;
      // Keep reporting a pipe until the bird is fully past it (same reach as the
      // crash check below) — switching early made coded birds clip the pipe they were leaving
      if (dz <= 1.8 && dz > -30 && Math.abs(dz) < bestDist) {
        bestDist = Math.abs(dz);
        best = pipe;
      }
    }
    return best || pipes[0];
  };

  const scrollWorld = (dt) => {
    if (gamePaused) return;
    const spd = SCROLL_SPEED * difficulty.speedScale * speedMul * dt;
    for (const pipe of pipes) {
      pipe.z += spd;
      pipe.topGroup.position.z = pipe.z;
      pipe.botGroup.position.z = pipe.z;
    }
    for (const seg of groundSegs) {
      seg.position.z += spd;
      if (seg.position.z > 42) seg.position.z -= GROUND_SEGS * 28;
    }
    for (const layer of parallaxLayers) {
      layer.mesh.position.z += spd * layer.speed;
      if (layer.mesh.position.z > 20) {
        // Repeating layers step back by exactly one period, so there is no seam
        layer.mesh.position.z = layer.period ? layer.mesh.position.z - layer.period : layer.baseZ - (layer.wrapDistance || 80);
      }
    }
    for (const c of clouds) {
      c.group.position.z += spd * c.speed;
      if (c.group.position.z > 25) c.group.position.z = c.baseZ - 60;
    }
  };

  const recyclePipes = () => {
    let minZ = Math.min(...pipes.map((p) => p.z));
    for (const pipe of pipes) {
      if (pipe.z > DESPAWN_Z) {
        pipe.scored = false;
        minZ -= difficulty.pipeSpacing;
        layoutPipePair(pipe, minZ, layoutGenRun());
        pipe.topGroup.visible = true;
        pipe.botGroup.visible = true;
      }
    }
  };

  scene.userData.flappyMode = true;
  scene.userData.endlessMode = true;
  scene.userData.finishZone = null;
  scene.userData.collectibles = [];

  const fireEvent = (type, detail = {}) => {
    scene.userData._flappyEventCb?.(type, detail);
  };

  const resetRound = () => {
    vy = 0;
    flappyY = START_Y;
    alive = true;
    died = false;
    awaitingRestart = false;
    crashType = '';
    score = 0;
    gameStarted = false;
    gameOverFired = false;
    lastGapEventPipe = null;
    deathT = 0;
    bobPhase = 0;
    runAliveTime = 0;
    gamePaused = false;
    pauseTimer = 0;
    layoutGenRun = createPipeLayoutGenerator(tierLevel ? difficulty : mode, layoutSeed);
    pipes.forEach((p, i) => {
      p.scored = false;
      layoutPipePair(p, FIRST_PIPE_Z - i * difficulty.pipeSpacing, layoutGenRun());
      p.topGroup.visible = true;
      p.botGroup.visible = true;
    });
    groundSegs.forEach((seg, i) => { seg.position.z = 28 - i * 28; });
    updateScore(0, bestScore);
  };

  const codeFlap = (power = 1) => {
    if (!simActive || !alive || awaitingRestart) return false;
    if (!gameStarted) gameStarted = true;
    // Strength 5 = a normal flap; 2 is a small hop, 8 a big jump (it used to be squeezed into 85–115%)
    vy = FLAP_VEL * Math.max(0.4, Math.min(1.6, power * flapScale()));
    wingFlapT = 0.3;
    scene.userData._wingFlapPulse = true;
    playFlapSound();
    return true;
  };

  scene.userData.flap = codeFlap;
  scene.userData.setFlappySimActive = (active) => { simActive = !!active; };
  scene.userData.setFlapStrength = (v) => { flapStrength = Math.max(1, Math.min(10, v || 5)); };
  scene.userData.setGravityStrength = (v) => { gravityStrength = Math.max(1, Math.min(10, v || 5)); };
  scene.userData.setScrollSpeed = (v) => {
    scrollSetting = Math.max(1, Math.min(10, v || 5));
    speedMul = scrollSetting / 5;
  };
  scene.userData.setShowScoreHud = (show) => { showScoreHud = !!show; };
  scene.userData.restartFlappyGame = () => { resetRound(); gameOverFired = false; };
  scene.userData.freezeBird = () => { freezeThisFrame = true; vy = 0; };
  scene.userData.moveBirdBy = (dyUnits) => {
    if (!simActive || !alive || awaitingRestart) return;
    const dy = (dyUnits / 20) * WORLD_H;
    flappyY = Math.max(GROUND_Y + 0.35, Math.min(CEIL_Y - 0.5, flappyY + dy));
    if (flappyY <= GROUND_Y + 0.36 && dyUnits < 0 && _rsRef) {
      _crash('ground', _rsRef);
    }
  };
  scene.userData.setBirdHeight = (h) => {
    if (!simActive || !alive || awaitingRestart) return;
    flappyY = heightToY(h);
    vy = 0;
  };
  scene.userData.pauseFlappyGame = (secs) => {
    gamePaused = true;
    pauseTimer = Math.max(0.1, secs || 1);
  };
  scene.userData.showFlappyMessage = (text, secs = 2) => {
    if (messageMesh) {
      scene.remove(messageMesh);
      messageMesh.geometry?.dispose();
      messageMesh.material?.map?.dispose();
      messageMesh.material?.dispose();
    }
    const cv = document.createElement('canvas');
    cv.width = 480;
    cv.height = 80;
    const ctx = cv.getContext('2d');
    roundRect(ctx, 0, 0, 480, 80, 12);
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fill();
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(text || '').slice(0, 40), 240, 40);
    const tex = new THREE.CanvasTexture(cv);
    messageMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(5.5, 0.9),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false, side: THREE.DoubleSide }),
    );
    messageMesh.position.set(1, 7.2, -5);
    faceCamera(messageMesh);
    messageMesh.renderOrder = 20;
    scene.add(messageMesh);
    messageTimer = secs;
  };
  // "Show variable" panel under the score; redrawn only when a value changes
  let varPanel = null;
  let varText = '';
  const drawVariables = () => {
    const lines = [...variableOverlays.entries()].map(([k, v]) => `${k} = ${Math.round((Number(v) || 0) * 10) / 10}`);
    const text = lines.join('\n');
    if (text === varText) return;
    varText = text;
    if (varPanel) {
      scene.remove(varPanel);
      varPanel.material.map?.dispose();
      varPanel.material.dispose();
      varPanel.geometry.dispose();
      varPanel = null;
    }
    if (!lines.length) return;
    const cv = document.createElement('canvas');
    cv.width = 360;
    cv.height = 20 + lines.length * 44;
    const ctx = cv.getContext('2d');
    roundRect(ctx, 0, 0, cv.width, cv.height, 16);
    ctx.fillStyle = 'rgba(15,23,42,0.72)';
    ctx.fill();
    ctx.font = 'bold 30px Arial, sans-serif';
    ctx.fillStyle = '#7dd3fc';
    ctx.textBaseline = 'middle';
    lines.forEach((l, i) => ctx.fillText(l, 20, 32 + i * 44));
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    const h = (cv.height / cv.width) * 3.2;
    varPanel = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, h),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: false, side: THREE.DoubleSide }),
    );
    varPanel.position.set(1, 7.6 - h / 2, -7);
    faceCamera(varPanel);
    varPanel.renderOrder = 20;
    scene.add(varPanel);
  };
  scene.userData.showFlappyVariable = (name, value) => {
    variableOverlays.set(name, value);
    drawVariables();
  };
  scene.userData.hideFlappyVariable = (name) => {
    variableOverlays.delete(name);
    drawVariables();
  };
  scene.userData.updateFlappyVariableOverlays = (vars = {}) => {
    Object.entries(vars).forEach(([k, v]) => {
      if (variableOverlays.has(k)) variableOverlays.set(k, v);
    });
    drawVariables();
  };
  scene.userData.playFlappySound = (sound) => {
    const s = String(sound || 'beep');
    if (s === 'flap') playFlapSound();
    else if (s === 'score') playScoreSound();
    else if (s === 'collision') playCollisionSound();
    else if (s === 'game_over') playGameOverSound();
    else if (s === 'win') playWinSound();
    else playBeepSound();
  };
  scene.userData.getFlappySensors = () => {
    const pipe = nearestPipe();
    const dist = pipe ? Math.max(0, BIRD_Z - pipe.z) : 99;
    return {
      distanceToPipe: Math.round(dist * 10) / 10,
      birdHeight: yToHeight(flappyY),
      gapCenterHeight: pipe ? yToHeight(pipe.gapCY) : 0,
      // How far the bird is below the middle of the gap (negative = above it)
      belowGap: pipe ? Math.round((yToHeight(pipe.gapCY) - yToHeight(flappyY)) * 10) / 10 : 0,
      gapSize: pipe ? Math.round((pipe.gapSize / WORLD_H) * 20 * 10) / 10 : 0,
      isFalling: vy < -0.05,
      timeAlive: Math.round(runAliveTime * 10) / 10,
      score,
      highScore: bestScore,
    };
  };
  scene.userData.getFlappyState = () => ({
    alive, crashed: died, awaitingRestart, collisionType: crashType,
    score, best: bestScore, gameStarted, vy, wingFlapT, camShakeT, deathT,
  });

  scene.userData.movers = [{
    update(t, dt, rs) {
      _rsRef = rs;
      if (_firstFrame) {
        _firstFrame = false;
        // Only the flappy lights, and none of the lab's ground markers, which
        // would float mid-air at y = 0 in this side view
        scene.traverse((o) => {
          if (o.isLight && !o.userData.flappyLight) o.visible = false;
        });
        // The flappy scene itself uses no ring or disc meshes, so any are lab markers
        scene.traverse((o) => {
          if (o.isMesh && !o.userData.flappyOwn && /^(Ring|Circle)Geometry$/.test(o.geometry?.type || '')) o.visible = false;
        });
        rs.x = 0;
        rs.y = flappyY;
        rs.z = BIRD_Z;
        rs.angle = Math.PI;
      }

      // Ground shadow follows the bird's height
      const lift = Math.max(0, flappyY - GROUND_Y);
      birdShadow.scale.setScalar(Math.max(0.35, 1.1 - lift * 0.05));
      birdShadow.material.opacity = Math.max(0.08, 0.34 - lift * 0.015);
      if (wingFlapT > 0) wingFlapT -= dt;
      if (camShakeT > 0) camShakeT -= dt;
      rs.flappyVy = vy;
      rs.flappyWingFlap = wingFlapT > 0;
      rs.flappyWingFlapT = wingFlapT;
      rs.flappyCamShake = camShakeT;
      rs.flappyDead = died;

      if (messageTimer > 0) {
        messageTimer -= dt;
        if (messageTimer <= 0 && messageMesh?.parent) {
          scene.remove(messageMesh);
          messageMesh.geometry?.dispose();
          messageMesh.material?.map?.dispose();
          messageMesh.material?.dispose();
          messageMesh = null;
        }
      }

      if (gamePaused) {
        pauseTimer -= dt;
        if (pauseTimer <= 0) gamePaused = false;
        rs.x = 0;
        rs.y = flappyY;
        rs.z = BIRD_Z;
        rs.flappyScore = score;
        rs.flappyBest = bestScore;
        return;
      }

      // Test 11: world scrolls whenever Simulate is running (pipes approach fixed bird)
      if (simActive && alive && !awaitingRestart) {
        scrollWorld(dt);
        recyclePipes();
      }

      if (simActive && alive && !awaitingRestart && gameStarted) {
        runAliveTime += dt;
      }

      if (!alive) {
        deathT += dt;
        vy += GRAVITY * gravityScale() * dt;
        flappyY += vy * dt;
        if (flappyY <= GROUND_Y + 0.35) {
          flappyY = GROUND_Y + 0.35;
          vy = Math.max(vy * -0.2, 0);
        }
        rs.x = 0;
        rs.y = flappyY;
        rs.z = BIRD_Z;
        rs.flappyCrashed = died;
        rs.flappyAwaitingRestart = awaitingRestart;
        rs.flappyScore = score;
        rs.flappyBest = bestScore;
        rs.flappyTilt = Math.min(1.4, 0.4 + deathT * 2);
        return;
      }

      if (!gameStarted) {
        if (simActive && !awaitingRestart) gameStarted = true;
        else {
          bobPhase += dt * 2.4;
          flappyY = START_Y + Math.sin(bobPhase) * 0.35;
          vy = 0;
          rs.x = 0;
          rs.y = flappyY;
          rs.z = BIRD_Z;
          rs.flappyScore = score;
          rs.flappyBest = bestScore;
          rs.flappyTilt = Math.sin(bobPhase) * 0.05;
          return;
        }
      }

      vy += GRAVITY * gravityScale() * dt;
      flappyY += vy * dt;
      if (freezeThisFrame) {
        vy = 0;
        freezeThisFrame = false;
      }

      if (scoreLabel && showScoreHud) {
        scoreLabel.visible = true;
        scoreLabel.position.set(1, 9.2, -7);
        faceCamera(scoreLabel);
      } else if (scoreLabel) scoreLabel.visible = false;

      if (flappyY > CEIL_Y - 0.5) {
        _crash('ceiling', rs);
        return;
      }
      if (flappyY <= GROUND_Y + 0.35) {
        _crash('ground', rs);
        return;
      }

      for (const pipe of pipes) {
        const relZ = pipe.z - BIRD_Z;
        if (relZ < -2.2 || relZ > 1.8) continue;
        const margin = 0.38;
        const inGap = flappyY > pipe.gapCY - pipe.halfGap + margin
          && flappyY < pipe.gapCY + pipe.halfGap - margin;
        if (!inGap) {
          _crash(flappyY >= pipe.gapCY + pipe.halfGap - margin ? 'pipe_top' : 'pipe_bottom', rs);
          return;
        }
        if (!pipe.scored && relZ > 0.35) {
          pipe.scored = true;
          score += 1;
          if (score > bestScore) {
            bestScore = score;
            saveFlappyBest(bestScore);
          }
          rs.collectedItems = score;
          updateScore(score, bestScore);
          playScoreSound();
          if (lastGapEventPipe !== pipe) {
            lastGapEventPipe = pipe;
            fireEvent('gap_passed', { score });
          }
          if (pipeTarget && score >= pipeTarget && !rs.done) rs.done = true;
        }
      }

      rs.x = 0;
      rs.y = flappyY;
      rs.z = BIRD_Z;
      rs.flappyScore = score;
      rs.flappyBest = bestScore;
      rs.flappyStarted = gameStarted;
      rs.flappyCrashed = false;
      rs.flappyAwaitingRestart = false;
      rs.flappyTilt = THREE.MathUtils.clamp(vy * 0.055, -0.45, 1.35);
    },
  }];

  function _crash(type, rs) {
    if (!alive) return;
    alive = false;
    died = true;
    awaitingRestart = true;
    crashType = type;
    if (score > bestScore) {
      bestScore = score;
      saveFlappyBest(bestScore);
    }
    vy = FLAP_VEL * 0.25;
    camShakeT = 0.15;
    deathT = 0;
    rs.flappyCrashed = true;
    rs.flappyAwaitingRestart = true;
    rs.flappyScore = score;
    rs.flappyBest = bestScore;
    updateScore(score, bestScore, true);
    playCollisionSound();
    playGameOverSound();
    fireEvent('collision', { type: crashType });
    if (!gameOverFired) {
      gameOverFired = true;
      fireEvent('game_over', { score, best: bestScore, type: crashType });
    }
  }

  scene.userData.rwReset = resetRound;
  scene.userData._flappyCleanup = () => {
    ['flappyMode', 'endlessMode', 'flap', 'setFlappySimActive', 'getFlappyState',
      'getFlappySensors', 'setFlapStrength', 'setGravityStrength', 'setShowScoreHud',
      'restartFlappyGame', '_flappyEventCb'].forEach((k) => delete scene.userData[k]);
  };
}
