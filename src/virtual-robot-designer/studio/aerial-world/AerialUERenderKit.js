/**
 * AerialUERenderKit — UE5-inspired cinematic rendering for flying arenas.
 * RENDER_PATH: webgl | EFFECT: gtao|clearcoat|ibl|volumetric-fog (WebGPU SSR/N8AO via AerialWebGPUKit when available)
 */
import * as THREE from 'three';
import {
  buildAtmosphereSky,
  buildVolumetricCloudLayer,
  pbrMat,
} from '../../racing/mk-tracks/BiomeAAAKit.js';
import { animateVistaDetails } from './FlyingVistaDetailKit.js';

function hex(c) {
  return `#${new THREE.Color(c).getHexString()}`;
}

/** HDR equirectangular env from sky stops — metal rings & hull pick up sky/reflection. */
export function bindAerialEnvironment(scene, sky = {}) {
  if (scene.userData.skipSoftEnvironment === false) return;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 0, 128);
  grad.addColorStop(0, sky.top || '#1e3a5f');
  grad.addColorStop(0.45, sky.mid || '#3478b8');
  grad.addColorStop(0.72, sky.horizon || '#ff9a4a');
  grad.addColorStop(1, sky.fog || '#d7b78f');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 128);
  const tex = new THREE.CanvasTexture(canvas);
  if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
  tex.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = tex;
  scene.environmentIntensity = sky.envIntensity ?? 0.72;
  scene.userData.skipSoftEnvironment = true;
}

/** Per-vista UE5 render targets — GTAO stands in for N8AO on WebGL stack. */
export const PREMIUM_RENDER_PROFILES = {
  gothic_clockwork_spire: {
    bloom: 0.28, threshold: 0.84, radius: 0.18,
    grade: { s: 1.1, c: 1.12, g: [1.02, 0.98, 0.94] },
    gtao: { blendIntensity: 0.72, radius: 0.32, samples: 8 },
    clearcoatBoost: true,
  },
  venetian_midnight_canal: {
    bloom: 0.22, threshold: 0.88, radius: 0.16,
    grade: { s: 1.08, c: 1.1, g: [0.92, 0.96, 1.08] },
    gtao: { blendIntensity: 0.52, radius: 0.2, samples: 6 },
    envIntensity: 1.05,
  },
  cybernetic_assembly_line: {
    bloom: 0.26, threshold: 0.82, radius: 0.2,
    grade: { s: 1.05, c: 1.08, g: [1.04, 0.98, 0.92] },
    gtao: { blendIntensity: 0.58, radius: 0.24, samples: 7 },
  },
  neon_server_necropolis: {
    bloom: 0.38, threshold: 0.72, radius: 0.28,
    grade: { s: 1.28, c: 1.14, g: [0.88, 1.02, 1.1] },
    gtao: { blendIntensity: 0.45, radius: 0.18, samples: 6 },
  },
  monastic_ruins: {
    bloom: 0.2, threshold: 0.9, radius: 0.14,
    grade: { s: 1.22, c: 1.06, g: [1.06, 1.04, 0.92] },
    gtao: { blendIntensity: 0.65, radius: 0.26, samples: 8 },
  },
  obsidian_citadel: {
    bloom: 0.24, threshold: 0.86, radius: 0.18,
    grade: { s: 1.06, c: 1.16, g: [0.9, 0.94, 1.08] },
    gtao: { blendIntensity: 0.55, radius: 0.22, samples: 7 },
    clearcoatBoost: true,
    wetSurfaces: true,
  },
  quantum_reactor_core: {
    bloom: 0.42, threshold: 0.68, radius: 0.3,
    grade: { s: 1.3, c: 1.12, g: [0.96, 0.92, 1.14] },
    gtao: { blendIntensity: 0.42, radius: 0.16, samples: 6 },
  },
  bioluminescent_trench: {
    bloom: 0.3, threshold: 0.76, radius: 0.22,
    grade: { s: 1.18, c: 1.1, g: [0.88, 1.04, 1.12] },
    gtao: { blendIntensity: 0.48, radius: 0.2, samples: 6 },
  },
  victorian_grand_library: {
    bloom: 0.18, threshold: 0.92, radius: 0.12,
    grade: { s: 1.14, c: 1.08, g: [1.08, 1.02, 0.94] },
    gtao: { blendIntensity: 0.68, radius: 0.28, samples: 8 },
  },
  low_orbit_stealth_carrier: {
    bloom: 0.22, threshold: 0.88, radius: 0.16,
    grade: { s: 1.08, c: 1.1, g: [0.94, 0.98, 1.06] },
    gtao: { blendIntensity: 0.5, radius: 0.2, samples: 6 },
    envIntensity: 1.15,
  },
};

/** UE-style post + exposure targets (LiveLab bloom/GTAO reads raceVisual). */
export function applyUE5AerialRenderProfile(scene, contract) {
  const bible = contract?.bible;
  const mission = contract?.mission;
  const storm = mission?.recipeId === 'storm_cloud'
    || mission?.recipeId === 'typhoon'
    || mission?.recipeId === 'warp_gate';
  const vista = contract?.environmentVistaId
    || (mission?.premiumVista && PREMIUM_RENDER_PROFILES[mission.premiumVista] ? mission.premiumVista : null)
    || bible?.aerialVista
    || 'gothic_clockwork_spire';
  const premium = PREMIUM_RENDER_PROFILES[vista];
  const neon = vista === 'neon_server_necropolis' || vista === 'quantum_reactor_core';
  const bloom = premium?.bloom ?? bible?.bloom ?? (neon ? 0.34 : storm ? 0.26 : 0.3);
  scene.userData.raceVisual = {
    ...(scene.userData.raceVisual || {}),
    bloom,
    threshold: premium?.threshold ?? (neon ? 0.78 : storm ? 0.86 : 0.82),
    radius: premium?.radius ?? (neon ? 0.24 : 0.2),
    grade: storm
      ? { s: 1.08, c: 1.12, g: [0.96, 0.98, 1.06] }
      : premium?.grade ?? { s: 1.16, c: 1.08, g: [1.04, 1.0, 1.05] },
    gtao: premium?.gtao,
    premiumVista: vista,
  };
  const expByVista = {
    neon_server_necropolis: 1.0,
    venetian_midnight_canal: 1.05,
    bioluminescent_trench: 1.02,
    quantum_reactor_core: 1.06,
  };
  scene.userData.expMood = expByVista[vista] ?? (storm ? 1.04 : 1.05);
  scene.userData.aerialUE5 = true;
  if (premium?.envIntensity) {
    scene.userData.premiumEnvIntensity = premium.envIntensity;
    if (scene.environment) scene.environmentIntensity = premium.envIntensity;
  }
}

/** Sun disc, god-rays, upper volumetric clouds — tuned per vista silhouette. */
export function installUE5AerialAtmosphere(scene, bounds = {}, sky = {}, recipe = {}, vista = 'gothic_clockwork_spire') {
  if (scene.getObjectByName('ue5-aerial-atmosphere')) return;
  const root = new THREE.Group();
  root.name = 'ue5-aerial-atmosphere';
  const cx = bounds.cx ?? 0;
  const cz = bounds.cz ?? 0;

  buildAtmosphereSky(scene, sky.top || '#1e3a5f', sky.horizon || '#ff9a4a', 920, sky.mid || '#3478b8');
  bindAerialEnvironment(scene, sky);

  // God-ray planes and lens flares sit on the flight path and read as an orange
  // fullscreen wash when the chase cam intersects them — sky dome only for golden hour.
  if (vista === 'gothic_clockwork_spire' || vista === 'monastic_ruins') {
    const clouds = buildVolumetricCloudLayer({ cx, cz, spanX: bounds.spanX ?? 160, spanZ: bounds.spanZ ?? 220 }, 58, 0xfff7ed, 0.28, 1.05, 6);
    clouds.name = 'ue5-volumetric-clouds';
    root.add(clouds);
  } else if (vista === 'venetian_midnight_canal') {
    const mist = buildVolumetricCloudLayer({ cx, cz, spanX: 200, spanZ: 240 }, 8, 0x1e293b, 0.22, 0.85, 5);
    mist.name = 'ue5-canal-mist';
    root.add(mist);
  } else if (vista === 'obsidian_citadel' || vista === 'bioluminescent_trench') {
    const fog = buildVolumetricCloudLayer({ cx, cz, spanX: 220, spanZ: 260 }, 18, vista === 'obsidian_citadel' ? 0x1e1b4b : 0x083344, 0.38, 1.25, 6);
    fog.name = 'ue5-storm-fog';
    root.add(fog);
  } else if (vista === 'cybernetic_assembly_line') {
    const haze = buildVolumetricCloudLayer({ cx, cz, spanX: 180, spanZ: 200 }, 14, 0x78716c, 0.28, 1.0, 5);
    haze.name = 'ue5-factory-haze';
    root.add(haze);
  } else if (vista === 'neon_server_necropolis') {
    bindAerialEnvironment(scene, {
      ...sky,
      top: sky.top || '#0a0a0a',
      mid: sky.mid || '#0f172a',
      horizon: sky.horizon || '#1e293b',
      fog: sky.fog || '#0a0a0f',
      envIntensity: 1.2,
    });
    scene.environmentIntensity = 1.2;
    const cyanMist = buildVolumetricCloudLayer({ cx, cz, spanX: 160, spanZ: 240 }, 10, 0x06b6d4, 0.1, 1.35, 5);
    cyanMist.name = 'ue5-neon-cyan-mist';
    root.add(cyanMist);
    const magMist = buildVolumetricCloudLayer({ cx, cz, spanX: 140, spanZ: 200 }, 8, 0xec4899, 0.07, 1.2, 4);
    magMist.name = 'ue5-neon-magenta-mist';
    root.add(magMist);
  } else if (vista === 'quantum_reactor_core') {
    bindAerialEnvironment(scene, { ...sky, top: sky.top || '#0a0a0a' });
  } else if (vista === 'low_orbit_stealth_carrier') {
    bindAerialEnvironment(scene, { ...sky, top: '#020617', mid: '#0f172a', horizon: '#1e40af', fog: '#020617' });
    scene.environmentIntensity = 1.15;
  }

  if (!scene.fog || !scene.fog.isFog) {
    scene.fog = new THREE.Fog(sky.fog || sky.mid || '#64748b', sky.near ?? 85, sky.far ?? 320);
  } else if (scene.fog.isFog) {
    scene.fog.color.set(sky.fog || sky.mid || '#64748b');
    scene.fog.near = sky.near ?? scene.fog.near;
    scene.fog.far = sky.far ?? scene.fog.far;
  }

  scene.add(root);
  scene.userData.ue5Atmosphere = root;
}

export function enhanceAerialMaterials(scene) {
  const vista = scene.userData.raceVisual?.premiumVista;
  const profile = PREMIUM_RENDER_PROFILES[vista];
  scene.traverse((obj) => {
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    mats.forEach((m) => {
      if (!m || !(m.isMeshPhysicalMaterial || m.isMeshStandardMaterial)) return;
      if ((m.emissiveIntensity ?? 0) > 0.4) {
        m.emissiveIntensity = Math.min(m.emissiveIntensity * 1.08, 2.2);
        m.toneMapped = false;
      }
      if (m.isMeshPhysicalMaterial) {
        m.envMapIntensity = Math.max(m.envMapIntensity ?? 0.55, profile?.envIntensity ? 0.95 : 0.78);
        if (m.metalness > 0.25 || profile?.clearcoatBoost) {
          m.clearcoat = Math.max(m.clearcoat ?? 0, profile?.wetSurfaces ? 0.85 : 0.45);
          m.clearcoatRoughness = profile?.wetSurfaces ? 0.06 : 0.12;
        }
      }
      if (obj.name === 'CanalWaterSSR' && m.isMeshPhysicalMaterial) {
        m.clearcoat = 1;
        m.clearcoatRoughness = 0.03;
        m.roughness = 0.02;
        m.metalness = 0.9;
      }
    });
  });
}

export function animateUE5AerialEffects(scene, time) {
  animateVistaDetails(scene, time);
  const atmo = scene.getObjectByName('ue5-aerial-atmosphere');
  if (!atmo) return;
  atmo.children.forEach((child) => {
    if (child.name === 'aaa-god-rays') {
      child.children.forEach((ray) => {
        const ph = ray.userData.pulse ?? 0;
        ray.material.opacity = 0.06 + (Math.sin(time * 0.4 + ph) + 1) * 0.045;
      });
    }
    if (child.name === 'ue5-volumetric-clouds' || child.name === 'aaa-clouds') {
      child.children.forEach((cloud) => {
        const drift = cloud.userData.drift ?? 0.3;
        const ph = cloud.userData.phase ?? 0;
        cloud.position.x += Math.sin(time * drift + ph) * 0.008;
      });
    }
    if (child.name === 'ue5-sun-flare') {
      child.position.y = 46 + Math.sin(time * 0.15) * 1.5;
    }
  });
  const city = scene.getObjectByName('CyberCityDetailed') || scene.getObjectByName('CyberCityUE5');
  if (city) {
    city.traverse((obj) => {
      if ((obj.name?.includes('Win_') || obj.name?.startsWith('CyberSpire')) && obj.material?.emissiveIntensity != null) {
        obj.material.emissiveIntensity = 0.55 + Math.sin(time * 2 + obj.position.y * 0.1) * 0.35;
      }
    });
  }
}

export function getUE5SkyStops(bibleSky) {
  if (!bibleSky) return null;
  return {
    top: bibleSky.top?.startsWith?.('#') ? bibleSky.top : hex(bibleSky.top),
    mid: bibleSky.mid?.startsWith?.('#') ? bibleSky.mid : hex(bibleSky.mid),
    horizon: bibleSky.horizon?.startsWith?.('#') ? bibleSky.horizon : hex(bibleSky.horizon),
    fog: bibleSky.fog?.startsWith?.('#') ? bibleSky.fog : hex(bibleSky.fog),
    near: bibleSky.near,
    far: bibleSky.far,
    warmPeach: true,
  };
}
