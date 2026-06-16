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

/** Soften existing meshes to match art direction (post-process robots & arenas) */
export function stylizeMeshMaterials(root, { keepEmissive = true } = {}) {
  root.traverse((o) => {
    if (!o.isMesh || !o.material) return;
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

/** Prepare robot for Live Lab — soft materials + sensor tags */
export function prepareLabRobot(robot) {
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
export function setupSimLighting(scene, { isForest = false } = {}) {
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
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
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

/** Renderer + bloom tuned for educational clarity (not cinematic neon) */
export function configureLabRenderer(renderer, bloomPass, { isForest = false } = {}) {
  renderer.toneMapping = THREE.ReinhardToneMapping;
  renderer.toneMappingExposure = isForest ? 1.1 : 1.2;
  if (bloomPass) {
    bloomPass.strength = isForest ? 0.10 : 0.08;
    bloomPass.radius = 0.3;
    bloomPass.threshold = 1.6;  // only bright emissives/LEDs bloom, not normal surfaces
  }
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
