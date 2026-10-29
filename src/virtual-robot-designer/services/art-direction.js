/**
 * art-direction.js — Unified visual identity for ByteBuddies Live Lab
 * Stylised educational 3D: soft plastic materials, readable paths, gentle lighting.
 */
import * as THREE from 'three';

/** Max metalness / min roughness — no chrome, no photoreal PBR */
export const MATERIAL_RULES = {
  maxMetalness: 0.14,
  minRoughness: 0.62,
  envMapIntensity: 0.22,
  maxEmissiveIntensity: 1.6,
};

/** Accent colours used ONLY for robot / UI state feedback */
export const STATE_COLORS = {
  idle: 0x5eead4,
  active: 0x38bdf8,
  executing: 0x4ade80,
  error: 0xf87171,
  success: 0xfbbf24,
  thinking: 0xa78bfa,
};

/** Soft educational palette — path > obstacle > decoration hierarchy */
export const WORLD_COLORS = {
  path: 0xd4a574,
  pathGlow: 0xfbbf24,
  pathRail: 0x78716c,
  obstacle: 0xb45309,
  goal: 0xfbbf24,
  decoration: 0x86efac,
  ground: 0x3d5a3a,
  skyTop: 0x87ceeb,
  skyBottom: 0xe0f2fe,
};

/** Matte soft-plastic material factory */
export function createPlasticMaterial(color, opts = {}) {
  const hex = typeof color === 'number' ? color : new THREE.Color(color).getHex();
  const mat = new THREE.MeshStandardMaterial({
    color: hex,
    metalness: opts.metalness ?? 0.06,
    roughness: opts.roughness ?? 0.72,
    flatShading: false,
  });
  if (opts.emissive != null) {
    mat.emissive = new THREE.Color(opts.emissive);
    mat.emissiveIntensity = Math.min(opts.emissiveIntensity ?? 0.35, MATERIAL_RULES.maxEmissiveIntensity);
  }
  if (opts.transparent) {
    mat.transparent = true;
    mat.opacity = opts.opacity ?? 0.85;
  }
  mat.envMapIntensity = opts.envMapIntensity ?? MATERIAL_RULES.envMapIntensity;
  return mat;
}

/** Walk up tree — true if this object belongs to a combat PBR fighter/arena piece */
function isCombatPBRNode(o) {
  let n = o;
  while (n) {
    if (n.userData?.combatPBR || n.userData?.isCombatFighter || n.userData?.isFighterHumanoid) return true;
    if (n.userData?.skipStylize) return true;
    n = n.parent;
  }
  return false;
}

/** Soften existing meshes to match art direction (post-process robots & arenas) */
export function stylizeMeshMaterials(root, { keepEmissive = true } = {}) {
  root.traverse((o) => {
    if (!o.isMesh || !o.material || isCombatPBRNode(o) || o.userData?.skipStudioPaint) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    mats.forEach((m) => {
      if (!m.isMeshStandardMaterial && !m.isMeshPhysicalMaterial) return;
      m.metalness = Math.min(m.metalness ?? 0, MATERIAL_RULES.maxMetalness);
      m.roughness = Math.max(m.roughness ?? 0.5, MATERIAL_RULES.minRoughness);
      m.envMapIntensity = MATERIAL_RULES.envMapIntensity;
      if (m.map && m.metalness > 0.4) m.metalness = 0.08;
      if (!keepEmissive) {
        m.emissiveIntensity = Math.min(m.emissiveIntensity ?? 0, 0.5);
      } else if (m.emissiveIntensity > MATERIAL_RULES.maxEmissiveIntensity) {
        m.emissiveIntensity = MATERIAL_RULES.maxEmissiveIntensity;
      }
    });
  });
}

const _BLACK = new THREE.Color(0, 0, 0);

/** Tag eye / LED / visor meshes for state animation */
export function tagRobotSensorMeshes(robot) {
  const sensors = [];
  robot.traverse((o) => {
    if (!o.isMesh || !o.material) return;
    const m = o.material;
    const name = (o.name || '').toLowerCase();
    // Explicit LED or name-matched = full state color override
    const isColorLed =
      o.userData?.isLed ||
      /eye|led|visor|sensor|glow|status/.test(name);
    // Non-black emissive without name tag = structural glow (headlights, etc.) — pulse intensity only
    const isStructuralGlow =
      !isColorLed &&
      m.emissive && !m.emissive.equals(_BLACK) && (m.emissiveIntensity ?? 0) > 0.25;

    if (isColorLed || isStructuralGlow) {
      o.userData.isSensor = true;
      o.userData.lockEmissiveColor = isStructuralGlow; // don't change color, only pulse intensity
      o.userData.baseEmissive = m.emissiveIntensity ?? 0.5;
      if (!m.emissive) {
        m.emissive = m.color?.clone() || new THREE.Color(STATE_COLORS.idle);
        m.emissiveIntensity = 0.35;
        o.userData.baseEmissive = 0.35;
      }
      sensors.push(o);
    }
  });
  robot.userData.sensorMeshes = sensors;
  return sensors;
}

/** Prepare combat fighter — preserve full PBR + emissive glow (no plastic stylize) */
export function prepareCombatFighter(robot) {
  robot.userData.combatPBR = true;
  robot.userData.isCombatFighter = true;
  robot.traverse((o) => {
    if (o.isMesh) {
      o.frustumCulled = false;
      o.userData.combatPBR = true;
    }
  });
  return robot;
}

/** Prepare robot for Live Lab — soft materials + sensor tags */
export function prepareLabRobot(robot) {
  if (robot.userData?.isCombatFighter || robot.userData?.combatPBR) {
    return prepareCombatFighter(robot);
  }
  stylizeMeshMaterials(robot, { keepEmissive: true });
  // Zero out environment reflections on body meshes so the arena's blue env
  // doesn't tint the robot's user-chosen colors
  robot.traverse((o) => {
    if (!o.isMesh || !o.material) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    mats.forEach((m) => {
      if (m.isMeshStandardMaterial || m.isMeshPhysicalMaterial) {
        m.envMapIntensity = 0;
      }
    });
  });
  tagRobotSensorMeshes(robot);
  robot.userData.artDirection = true;
  return robot;
}

/** Keep the player kart readable on night tracks (chase cam looks at a dark rear). */
export function lightRaceRobot(robot) {
  if (!robot || robot.userData.raceLit) return robot;
  robot.userData.raceLit = true;
  if (robot.userData.isMKKart) {
    // The console kart is fully PBR-lit; a soft fill keeps it readable on night tracks
    const soft = new THREE.PointLight(0xfff4e4, 0.9, 6, 2);
    soft.name = 'race-kart-fill';
    soft.position.set(0, 1.6, -1.8);
    robot.add(soft);
    return robot;
  }

  robot.traverse((o) => {
    if (!o.isMesh || !o.material) return;
    if (o.userData?.isWheel) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    mats.forEach((m) => {
      if (!m?.color || (!m.isMeshStandardMaterial && !m.isMeshPhysicalMaterial)) return;
      const lum = m.color.r * 0.2126 + m.color.g * 0.7152 + m.color.b * 0.0722;
      if (lum < 0.08) return;
      const em = m.emissive;
      const emi = m.emissiveIntensity || 0;
      if (emi > 0.4 && em && (em.r + em.g + em.b) > 0.2) return;
      m.emissive = m.color.clone().multiplyScalar(0.55);
      m.emissiveIntensity = Math.max(emi, 0.62);
      m.envMapIntensity = Math.max(m.envMapIntensity || 0, 0.28);
      m.needsUpdate = true;
    });
  });

  const fill = new THREE.PointLight(0xfff4e4, 2.6, 8, 2);
  fill.name = 'race-kart-fill';
  fill.position.set(0, 1.45, -1.55);
  robot.add(fill);
  const front = new THREE.PointLight(0xe8f0ff, 1.5, 6, 2);
  front.name = 'race-kart-front';
  front.position.set(0, 0.85, 1.15);
  robot.add(front);
  return robot;
}

/** Neutral daylight env map for outdoor MK circuits (no pink wash). */
export function setupMKDayEnvironment(scene) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 128);
  grad.addColorStop(0, '#9fd4ff');
  grad.addColorStop(0.55, '#e8f4ff');
  grad.addColorStop(1, '#8bc96a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = tex;
  scene.environmentIntensity = 0.42;
  return tex;
}

/** Night stadium reflections for MK circuit tracks */
export function setupStadiumNightEnvironment(scene) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 128);
  grad.addColorStop(0, '#0a1030');
  grad.addColorStop(0.45, '#121a40');
  grad.addColorStop(1, '#060810');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = tex;
  scene.environmentIntensity = 0.35;
  return tex;
}

/** Bright env map for Mario Kart race worlds (skipSoftEnvironment courses). */
export function setupRaceEnvironment(scene, { space = false } = {}) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 128);
  if (space) {
    grad.addColorStop(0, '#1a1440');
    grad.addColorStop(0.5, '#3a2c70');
    grad.addColorStop(1, '#5a4a80');
  } else {
    grad.addColorStop(0, '#b8e0ff');
    grad.addColorStop(0.5, '#ffe0f0');
    grad.addColorStop(1, '#a8d8a0');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = tex;
  // Space courses: very low env intensity — we don't want the env map
  // competing with the neon track colours.
  scene.environmentIntensity = space ? 0.4 : 0.8;
  return tex;
}

/** Night-stadium environment for football pitch */
export function setupFootballEnvironment(scene) {
  const nightFifa = scene.userData.footballLayoutKind === 'fifa' || scene.userData.footballFifa3v3;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 128);
  if (nightFifa) {
    grad.addColorStop(0, '#0a1428');
    grad.addColorStop(0.45, '#0f2038');
    grad.addColorStop(1, '#1a4a32');
  } else {
    grad.addColorStop(0, '#8ec4ea');
    grad.addColorStop(0.5, '#f3c49a');
    grad.addColorStop(1, '#3d6a48');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = tex;
  scene.environmentIntensity = nightFifa ? 0.14 : 0.9;
  return tex;
}

/** Dark gym environment — keeps fighter emissive glow visible */
export function setupCombatEnvironment(scene) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 128);
  grad.addColorStop(0, '#0a1018');
  grad.addColorStop(0.5, '#101820');
  grad.addColorStop(1, '#050508');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = tex;
  scene.environmentIntensity = 0.1;
  return tex;
}

/** Subtle gradient environment — no harsh reflections */
export function setupSoftEnvironment(scene) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 128);
  grad.addColorStop(0, '#9ec5e8');
  grad.addColorStop(0.55, '#c8dff0');
  grad.addColorStop(1, '#6b8fa8');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = tex;
  scene.environmentIntensity = MATERIAL_RULES.envMapIntensity;
  return tex;
}

/** Soft global lighting — clarity over decoration */
export function setupSimLighting(scene, { isForest = false, shadowEnabled = true, shadowMapSize = 1024 } = {}) {
  const amb = new THREE.AmbientLight(isForest ? 0xe8f4e8 : 0xf0f4ff, isForest ? 0.45 : 0.50);
  scene.add(amb);

  const hemi = new THREE.HemisphereLight(
    isForest ? 0xfff4d6 : 0xdce8ff,
    isForest ? 0x4a6741 : 0xc8d0dc,
    isForest ? 0.40 : 0.38,
  );
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(isForest ? 0xffe8b0 : 0xfffef5, isForest ? 0.85 : 0.90);
  sun.position.set(isForest ? 14 : 10, isForest ? 20 : 16, isForest ? -4 : 8);
  sun.castShadow = shadowEnabled;
  if (shadowEnabled) {
    sun.shadow.mapSize.set(shadowMapSize, shadowMapSize);
  }
  sun.shadow.camera.left = -28;
  sun.shadow.camera.right = 28;
  sun.shadow.camera.top = 28;
  sun.shadow.camera.bottom = -28;
  sun.shadow.camera.far = 110;
  sun.shadow.bias = -0.0003;
  sun.shadow.normalBias = 0.02;
  scene.add(sun);

  const fill = new THREE.DirectionalLight(isForest ? 0xffe8c0 : 0xd0e0ff, isForest ? 0.25 : 0.30);
  fill.position.set(-14, 6, 18);
  scene.add(fill);

  return { amb, hemi, sun, fill };
}

/** Renderer + bloom tuned for educational clarity (not cinematic neon).
 *  Race courses default to direct renderer.render() (no EffectComposer) for 60fps. */
export function configureLabRenderer(renderer, bloomPass, { isForest = false, isRace = false } = {}) {
  const lowPower = typeof window !== 'undefined' && getStudioDeviceProfile().lowPower;
  renderer.toneMapping = lowPower ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = isForest ? 1.05 : isRace ? 1.22 : 1.1;
  if (bloomPass) {
    bloomPass.strength   = isForest ? 0.18 : isRace ? 0.35 : 0.20;
    bloomPass.radius     = isRace ? 0.45 : 0.30;
    bloomPass.threshold  = isForest ? 0.72 : isRace ? 0.72 : 0.70;
  }
}

/**
 * Detect device quality tier once at startup.
 * Returns 'low' | 'medium' | 'high'.
 * Chromebooks, tablets, and phones stay on a cheap GPU path; Macs and PCs
 * keep medium/high when they can actually hold 60fps.
 */
let _deviceProfileCache = null;

function uaString() {
  return (typeof navigator !== 'undefined' && navigator.userAgent) || '';
}

export function isChromebook() {
  return /CrOS|Chromebook/i.test(uaString());
}

export function isIPadLike() {
  if (typeof navigator === 'undefined') return false;
  const ua = uaString();
  const touch = (navigator.maxTouchPoints || 0) > 1;
  if (/iPad/i.test(ua)) return true;
  // iPadOS 13+ pretends to be a Mac in the user agent.
  return /Macintosh|Mac OS X/i.test(ua) && touch;
}

export function isMobileOrTablet() {
  const ua = uaString();
  if (isIPadLike()) return true;
  if (/iPhone|iPod|Android.*Mobile|Windows Phone/i.test(ua)) return true;
  if (/Android(?!.*Mobile)|Tablet|Kindle|Silk/i.test(ua)) return true;
  const touch = typeof navigator !== 'undefined' && (navigator.maxTouchPoints || 0) > 1;
  const coarse = typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: coarse)')?.matches;
  const shortSide = Math.min(
    (typeof window !== 'undefined' && (window.screen?.width || window.innerWidth)) || 1920,
    (typeof window !== 'undefined' && (window.screen?.height || window.innerHeight)) || 1080,
  );
  if (coarse && touch && shortSide <= 1366) return true;
  const narrow = (typeof window !== 'undefined' ? window.innerWidth : 1920) < 1100;
  return !!(touch && narrow && coarse);
}

function peekGpuRenderer() {
  if (isIPadLike() || isMobileOrTablet()) return { renderer: '', weak: true };
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl') || c.getContext('experimental-webgl');
    if (!gl) return { renderer: '', weak: true };
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '') : '';
    const weak = /SwiftShader|llvmpipe|SoftGL|Microsoft Basic Render|Mali-|PowerVR|Adreno \(TM\) [2-5]|Intel (U?HD|Iris( Xe)? Graphics)|ANGLE \(Intel/i.test(renderer)
      || renderer === '';
    const lose = gl.getExtension('WEBGL_lose_context');
    lose?.loseContext?.();
    return { renderer, weak };
  } catch {
    return { renderer: '', weak: true };
  }
}

/**
 * One snapshot used by 3D quality, layout CSS, and WebGL flags.
 * kind: chromebook | tablet | phone | laptop | desktop
 */
export function getStudioDeviceProfile() {
  if (_deviceProfileCache) return overlaySavedQuality(_deviceProfileCache);
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      kind: 'desktop',
      tier: 'medium',
      lowPower: false,
      maxPixelRatio: 1.5,
      allowGtao: false,
      allowBloom: true,
      stackedLayout: false,
      gpuHint: '',
    };
  }

  const ua = uaString();
  const mem = navigator.deviceMemory;
  const cores = navigator.hardwareConcurrency;
  const dpr = window.devicePixelRatio || 1;
  const screenW = window.screen?.width || window.innerWidth || 1920;
  const screenH = window.screen?.height || window.innerHeight || 1080;
  const chromebook = isChromebook();
  const tabletOrPhone = isMobileOrTablet();
  const phone = /iPhone|iPod|Android.*Mobile/i.test(ua);
  const gpu = peekGpuRenderer();
  const schoolMachine = chromebook
    || (mem != null && mem <= 4)
    || (cores != null && cores <= 4 && (mem == null || mem <= 8))
    || gpu.weak;

  let kind = 'desktop';
  if (phone) kind = 'phone';
  else if (tabletOrPhone) kind = 'tablet';
  else if (chromebook) kind = 'chromebook';
  else if (/Macintosh|Mac OS X/i.test(ua) || /Windows NT|Linux/i.test(ua)) {
    kind = (mem != null && mem >= 16 && cores != null && cores >= 8) ? 'desktop' : 'laptop';
  }

  let tier = 'medium';
  if (phone || tabletOrPhone) {
    tier = 'low';
  } else if (chromebook) {
    tier = (mem != null && mem >= 8 && !gpu.weak && cores >= 8) ? 'medium' : 'low';
  } else if ((mem != null && mem <= 2) || (cores != null && cores <= 2) || screenW * screenH < 1280 * 720 || gpu.renderer && /SwiftShader|llvmpipe|Microsoft Basic/i.test(gpu.renderer)) {
    tier = 'low';
  } else if (kind === 'desktop' && mem != null && mem >= 16 && cores != null && cores >= 8 && dpr <= 2 && !schoolMachine) {
    tier = 'high';
  } else {
    tier = 'medium';
  }

  const lowPower = kind === 'chromebook' || kind === 'tablet' || kind === 'phone' || tier === 'low';
  const maxPixelRatio = kind === 'phone' || kind === 'tablet'
    ? Math.min(dpr, 1)
    : kind === 'chromebook'
      ? Math.min(dpr, tier === 'low' ? 0.9 : 1.0)
      : tier === 'high'
        ? Math.min(dpr, 1.75)
        : Math.min(dpr, 1.25);

  _deviceProfileCache = {
    kind,
    tier,
    lowPower,
    maxPixelRatio,
    allowGtao: tier === 'high' && !lowPower,
    allowBloom: tier !== 'low' && kind !== 'chromebook',
    stackedLayout: false,
    gpuHint: gpu.renderer,
  };
  return overlaySavedQuality(_deviceProfileCache);
}

function overlaySavedQuality(profile) {
  if (profile.kind === 'tablet' || profile.kind === 'phone') {
    return {
      ...profile,
      tier: 'low',
      lowPower: true,
      allowGtao: false,
      allowBloom: false,
      maxPixelRatio: 1,
      stackedLayout: false,
    };
  }
  const saved = (() => {
    try { return localStorage.getItem('bb_quality_tier'); } catch { return null; }
  })();
  if (saved !== 'low' && saved !== 'medium' && saved !== 'high') return profile;
  const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
  const lowPower = profile.lowPower || saved === 'low';
  return {
    ...profile,
    tier: saved,
    lowPower,
    allowGtao: saved === 'high' && !lowPower,
    allowBloom: saved !== 'low' && profile.kind !== 'chromebook',
    maxPixelRatio: saved === 'low'
      ? Math.min(dpr, profile.kind === 'chromebook' ? 0.9 : 1.0)
      : profile.maxPixelRatio,
  };
}

export function detectQualityTier() {
  const profile = getStudioDeviceProfile();
  if (profile.kind === 'tablet' || profile.kind === 'phone') return 'low';
  const saved = (() => {
    try { return localStorage.getItem('bb_quality_tier'); } catch { return null; }
  })();
  if (saved === 'low' || saved === 'medium' || saved === 'high') return saved;
  return profile.tier;
}

/** Cup tracks used to force high on every laptop — that melted Chromebooks. */
export function detectCupTrackQualityTier() {
  const profile = getStudioDeviceProfile();
  if (profile.kind === 'chromebook' || profile.kind === 'tablet' || profile.kind === 'phone') {
    return profile.kind === 'chromebook' ? (profile.tier === 'high' ? 'medium' : profile.tier) : 'low';
  }
  const saved = (() => {
    try { return localStorage.getItem('bb_quality_tier'); } catch { return null; }
  })();
  if (saved === 'low' || saved === 'medium' || saved === 'high') return saved;
  // Real desktops can take the extra track detail; school laptops stay on auto tier.
  if (profile.kind === 'desktop' && profile.tier === 'medium') return 'high';
  return profile.tier;
}

/**
 * Per-tier settings object for quick access throughout the app.
 */
export const QUALITY_PRESETS = {
  low: {
    pixelRatio:     1.0,
    shadowEnabled:  false,
    shadowMapSize:  512,
    postProcessing: false,
    bloomScale:     0,
    bloomStrength:  0,
    maxPointLights: 0,
    particleCount:  32,
    trackLod:       0.72,
    worldLod:       0.55,
    simParticles:   6,
    mossCurbs:      true,
    pbrTexSize:     512,
  },
  medium: {
    pixelRatio:     1.0,
    shadowEnabled:  true,
    shadowMapSize:  1024,
    postProcessing: true,
    bloomScale:     0.55,
    bloomStrength:  0.4,
    maxPointLights: 3,
    particleCount:  64,
    trackLod:       0.88,
    worldLod:       0.72,
    simParticles:   10,
    mossCurbs:      true,
    pbrTexSize:     768,
  },
  high: {
    pixelRatio:     1.5,
    shadowEnabled:  true,
    shadowMapSize:  2048,
    postProcessing: true,
    bloomScale:     0.65,
    bloomStrength:  0.5,
    maxPointLights: 6,
    particleCount:  120,
    trackLod:       0.95,
    worldLod:       0.85,
    simParticles:   14,
    mossCurbs:      true,
    pbrTexSize:     1024,
  },
};

/**
 * Create a WebGL renderer with fallbacks for school laptops / disabled GPU acceleration.
 * Pass a DOM `canvas` when possible — embedded preview browsers often need a mounted canvas.
 */
export function isEmbeddedPreviewBrowser() {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /Electron|Cursor/i.test(ua);
}

export function createSimWebGLRenderer({
  antialias = false,
  lowPower = false,
  canvas,
  preserveDrawingBuffer = false,
} = {}) {
  const profile = typeof window !== 'undefined' ? getStudioDeviceProfile() : { lowPower: false, kind: 'desktop' };
  const preferLow = lowPower || profile.lowPower;
  const aa = antialias && !preferLow;
  const power = preferLow ? 'low-power' : (profile.kind === 'desktop' ? 'high-performance' : 'default');
  const baseCanvas = canvas || document.createElement('canvas');
  const attempts = [
    { canvas: baseCanvas, antialias: aa, powerPreference: power, precision: preferLow ? 'mediump' : 'highp', stencil: false, preserveDrawingBuffer, failIfMajorPerformanceCaveat: false },
    { canvas: baseCanvas, antialias: false, powerPreference: 'low-power', precision: 'lowp', stencil: false, alpha: false, preserveDrawingBuffer, failIfMajorPerformanceCaveat: false },
    { canvas: baseCanvas, antialias: false, forceWebGL: true, powerPreference: 'default', precision: 'lowp', stencil: false, alpha: false, depth: true, preserveDrawingBuffer, failIfMajorPerformanceCaveat: false },
    { canvas: baseCanvas, antialias: false, powerPreference: 'default', precision: 'lowp', stencil: false, alpha: false, depth: true, preserveDrawingBuffer, failIfMajorPerformanceCaveat: false },
  ];
  let lastErr = null;
  for (const opts of attempts) {
    try {
      const renderer = new THREE.WebGLRenderer(opts);
      if (renderer.getContext()) return renderer;
      renderer.dispose();
    } catch (err) {
      lastErr = err;
    }
  }
  if (typeof console !== 'undefined') {
    console.warn('[ByteBuddies] WebGL unavailable', lastErr?.message || lastErr);
  }
  return null;
}

/** Turn raw init errors into short, actionable simulator messages. */
export function formatSimStartupError(err) {
  if (isEmbeddedPreviewBrowser()) {
    return 'WebGL is not available in Cursor’s built-in browser preview. Open this page in Chrome, Safari, or Edge (hardware acceleration on) to run the 3D track.';
  }
  const msg = String(err?.message || err || '').toLowerCase();
  if (msg.includes('webgl') || msg.includes('context') || msg.includes('gles')) {
    return 'WebGL is blocked or unavailable. In Chrome/Edge go to Settings → System → turn on "Use hardware acceleration", then restart the browser.';
  }
  if (msg.includes('memory') || msg.includes('allocation') || msg.includes('out of')) {
    return 'Your GPU ran out of memory loading the 3D track. Close other tabs, then click "Run in low graphics mode" below.';
  }
  if (msg.includes('shader')) {
    return 'Your graphics driver could not compile the 3D shaders. Try updating Windows / your browser, or use low graphics mode.';
  }
  return err?.message || '3D simulator failed to start. Try reloading the page.';
}

/** Execution trail — subtle world-space step visibility */
export function createExecutionTrail(scene, maxPts = 24) {
  const positions = new Float32Array(maxPts * 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setDrawRange(0, 0);
  const mat = new THREE.LineBasicMaterial({
    color: STATE_COLORS.executing,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
  });
  const line = new THREE.Line(geo, mat);
  line.frustumCulled = false;
  line.renderOrder = 2;
  scene.add(line);

  const pts = [];
  return {
    mesh: line,
    addPoint(x, y, z) {
      pts.push({ x, y: y + 0.15, z });
      if (pts.length > maxPts) pts.shift();
      for (let i = 0; i < pts.length; i++) {
        positions[i * 3] = pts[i].x;
        positions[i * 3 + 1] = pts[i].y;
        positions[i * 3 + 2] = pts[i].z;
      }
      geo.setDrawRange(0, pts.length);
      geo.attributes.position.needsUpdate = true;
    },
    clear() {
      pts.length = 0;
      geo.setDrawRange(0, 0);
    },
    dispose() {
      scene.remove(line);
      geo.dispose();
      mat.dispose();
    },
  };
}

// ── Movement Preview Path ─────────────────────────────────────────────────────
// Draws a dotted line on the ground showing where the robot will go based on
// the current block program. Updates live as the child edits blocks.
// Hidden during simulation (execution trail takes over).

export function createPreviewPath(scene, maxPts = 128) {
  const positions = new Float32Array(maxPts * 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setDrawRange(0, 0);

  // Dashed line material — compute line distances after each update
  const mat = new THREE.LineDashedMaterial({
    color: 0x44ddff,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    dashSize: 0.35,
    gapSize: 0.22,
    linewidth: 1,
  });
  const line = new THREE.Line(geo, mat);
  line.frustumCulled = false;
  line.renderOrder = 3;
  scene.add(line);

  // Small diamond markers at block segment endpoints
  const markerGeo = new THREE.OctahedronGeometry(0.18, 0);
  const markerMat = new THREE.MeshBasicMaterial({ color: 0x00eeff, transparent: true, opacity: 0.8, depthWrite: false });
  const markers = [];
  const MAX_MARKERS = 16;
  for (let i = 0; i < MAX_MARKERS; i++) {
    const m = new THREE.Mesh(markerGeo, markerMat.clone());
    m.visible = false;
    m.renderOrder = 4;
    scene.add(m);
    markers.push(m);
  }

  let visible = false;

  return {
    mesh: line,
    // points: [{x,z}]  segmentEnds: [{x,z}]
    update(points, segmentEnds = []) {
      const n = Math.min(points.length, maxPts);
      for (let i = 0; i < n; i++) {
        positions[i * 3]     = points[i].x;
        positions[i * 3 + 1] = 0.09;
        positions[i * 3 + 2] = points[i].z;
      }
      geo.setDrawRange(0, n);
      geo.attributes.position.needsUpdate = true;
      line.computeLineDistances();

      for (let i = 0; i < MAX_MARKERS; i++) {
        if (i < segmentEnds.length) {
          markers[i].position.set(segmentEnds[i].x, 0.28, segmentEnds[i].z);
          markers[i].visible = true;
          markers[i].rotation.y = (Date.now() * 0.001) + i * 0.5; // gentle spin
        } else {
          markers[i].visible = false;
        }
      }
      visible = true;
    },
    clear() {
      geo.setDrawRange(0, 0);
      markers.forEach(m => { m.visible = false; });
      visible = false;
    },
    get isVisible() { return visible; },
    dispose() {
      scene.remove(line);
      geo.dispose();
      mat.dispose();
      markerGeo.dispose();
      markers.forEach(m => { scene.remove(m); m.material.dispose(); });
    },
  };
}
