/**
 * PremiumFlyingEnvironmentKit — UE5-grade flying vistas (10 environments).
 * Geometry: PremiumEnvironmentBuilders.js · Post: AerialUERenderKit · Renderer: AerialWebGPUKit
 */
import {
  buildArtDirectedEnvironment,
  installPremiumEnvironmentLighting,
  buildGothicClockworkSpire,
  buildVenetianMidnightCanal,
  buildCyberneticAssemblyLine,
  buildNeonServerNecropolis,
  buildMonasticRuins,
  buildObsidianCitadel,
  buildQuantumReactorCore,
  buildBioluminescentTrench,
  buildVictorianGrandLibrary,
  buildLowOrbitStealthCarrier,
} from './PremiumEnvironmentArtKit.js';

export {
  buildGothicClockworkSpire,
  buildVenetianMidnightCanal,
  buildCyberneticAssemblyLine,
  buildNeonServerNecropolis,
  buildMonasticRuins,
  buildObsidianCitadel,
  buildQuantumReactorCore,
  buildBioluminescentTrench,
  buildVictorianGrandLibrary,
  buildLowOrbitStealthCarrier,
  installPremiumEnvironmentLighting,
};

export const PREMIUM_ENVIRONMENT_IDS = [
  'gothic_clockwork_spire',
  'venetian_midnight_canal',
  'cybernetic_assembly_line',
  'neon_server_necropolis',
  'monastic_ruins',
  'obsidian_citadel',
  'quantum_reactor_core',
  'bioluminescent_trench',
  'victorian_grand_library',
  'low_orbit_stealth_carrier',
];

export function installPremiumFlyingEnvironment(g, vista, backdrop, y, bounds, curve) {
  return buildArtDirectedEnvironment(g, vista, backdrop, y, bounds, curve) != null;
}

/** Per-frame premium vista animation (gears, water, LEDs, lightning, dust, bio, hex). */
export function animatePremiumEnvironments(scene, time) {
  scene.traverse((obj) => {
    if (obj.userData?.spinGear) obj.rotation.z += obj.userData.spinGear * 0.016;
    if (obj.userData?.spinRing) obj.rotation.z = time * 0.55;

    if (obj.userData?.animateWater && obj.geometry?.attributes?.position) {
      const pos = obj.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const z = pos.getZ(i);
        pos.setY(i, Math.sin(x * 0.08 + time * 1.2) * 0.12 + Math.cos(z * 0.06 + time) * 0.08);
      }
      pos.needsUpdate = true;
    }

    if (obj.name?.startsWith('DataStream') && obj.material) {
      obj.material.emissiveIntensity = 0.55 + Math.sin(time * 4 + obj.position.y * 0.5) * 0.35;
    }
    if (obj.userData?.pulseRibbon && obj.material) {
      obj.material.emissiveIntensity = 0.7 + Math.sin(time * 3.5 + obj.position.z * 0.08) * 0.3;
      obj.material.opacity = 0.82 + Math.sin(time * 2 + obj.position.x * 0.05) * 0.12;
    }
    if (obj.name?.startsWith('HoloTerminal') && obj.material) {
      obj.material.emissiveIntensity = 0.4 + Math.sin(time * 2 + obj.position.x * 0.05) * 0.25;
    }

    if (obj.name?.startsWith('HexRing') || obj.name === 'CorePlasma') {
      obj.rotation.y = time * 0.35;
      if (obj.material?.emissiveIntensity != null) {
        obj.material.emissiveIntensity = 0.75 + Math.sin(time * 2.5 + obj.position.x * 0.02) * 0.25;
      }
      if (obj.name === 'CorePlasma') {
        const s = 1 + Math.sin(time * 3) * 0.06;
        obj.scale.set(s, s, s);
      }
    }

    if (obj.name?.startsWith('BioOrb') && obj.material) {
      obj.material.emissiveIntensity = 0.55 + Math.sin(time * 1.2 + obj.position.x * 0.1) * 0.3;
    }
    if (obj.userData?.driftParticles && obj.isInstancedMesh) {
      obj.rotation.y = time * 0.02;
    }
    if (obj.userData?.dustMotes && obj.isInstancedMesh) {
      obj.rotation.y = time * 0.04;
      obj.rotation.x = Math.sin(time * 0.15) * 0.02;
    }
    if (obj.userData?.sparkField && obj.isPoints) {
      obj.rotation.y = time * 0.08;
      if (obj.material) obj.material.opacity = 0.65 + Math.sin(time * 5) * 0.2;
    }

    if (obj.userData?.lightningFlash && obj.material?.emissiveIntensity != null) {
      obj.material.emissiveIntensity = Math.sin(time * 0.5) > 0.92 ? 1.8 : 0.06;
    }
    if (obj.userData?.rainStreak && obj.material) {
      obj.material.opacity = 0.08 + Math.sin(time * 8 + obj.position.x) * 0.04;
    }

    if (obj.name?.startsWith('ChandelierBulb') || obj.name?.startsWith('TableLamp')) {
      if (obj.material?.emissiveIntensity != null) {
        obj.material.emissiveIntensity = 0.55 + Math.sin(time * 1.5 + obj.position.x) * 0.15;
      }
    }
  });
}
