/**
 * PremiumEnvironmentArtKit — routes art-directed builds + per-vista lighting.
 */
import { buildGothicClockworkSpire, installGothicClockworkLighting } from './premium/GothicClockworkSpireKit.js';
import { buildVenetianMidnightCanal, installVenetianCanalLighting } from './premium/VenetianMidnightCanalKit.js';
import { buildCyberneticAssemblyLine, installCyberneticAssemblyLighting } from './premium/CyberneticAssemblyLineKit.js';
import { buildNeonServerNecropolis, installNeonNecropolisLighting } from './premium/NeonServerNecropolisKit.js';
import {
  installMonasticRuinsLighting,
  installObsidianCitadelLighting,
  installQuantumReactorLighting,
  installBioluminescentTrenchLighting,
  installVictorianLibraryLighting,
  installLowOrbitCarrierLighting,
} from './premium/PremiumEnvironmentLighting.js';
import {
  buildMonasticRuins as buildMonasticBase,
  buildObsidianCitadel as buildObsidianBase,
  buildQuantumReactorCore as buildQuantumBase,
  buildBioluminescentTrench as buildBioBase,
  buildVictorianGrandLibrary as buildLibraryBase,
  buildLowOrbitStealthCarrier as buildCarrierBase,
} from './PremiumEnvironmentBuilders.js';

function markArtDirected(root, vistaId) {
  if (root) {
    root.userData.premiumEnvironment = vistaId;
    root.userData.artDirected = true;
  }
  return root;
}

export { buildGothicClockworkSpire } from './premium/GothicClockworkSpireKit.js';
export { buildVenetianMidnightCanal } from './premium/VenetianMidnightCanalKit.js';
export { buildCyberneticAssemblyLine } from './premium/CyberneticAssemblyLineKit.js';
export { buildNeonServerNecropolis } from './premium/NeonServerNecropolisKit.js';

export function buildMonasticRuins(g, backdrop, y) {
  buildMonasticBase(g, backdrop, y);
  return markArtDirected(g.getObjectByName('MonasticRuins'), 'monastic_ruins');
}

export function buildObsidianCitadel(g, backdrop, y) {
  buildObsidianBase(g, backdrop, y);
  return markArtDirected(g.getObjectByName('ObsidianCitadel'), 'obsidian_citadel');
}

export function buildQuantumReactorCore(g, backdrop, y) {
  buildQuantumBase(g, backdrop, y);
  return markArtDirected(g.getObjectByName('QuantumReactorCore'), 'quantum_reactor_core');
}

export function buildBioluminescentTrench(g, backdrop, y) {
  buildBioBase(g, backdrop, y);
  return markArtDirected(g.getObjectByName('BioluminescentTrench'), 'bioluminescent_trench');
}

export function buildVictorianGrandLibrary(g, backdrop, y) {
  buildLibraryBase(g, backdrop, y);
  return markArtDirected(g.getObjectByName('VictorianGrandLibrary'), 'victorian_grand_library');
}

export function buildLowOrbitStealthCarrier(g, backdrop, y, bounds, curve) {
  buildCarrierBase(g, backdrop, y, bounds, curve);
  return markArtDirected(g.getObjectByName('LowOrbitStealthCarrier'), 'low_orbit_stealth_carrier');
}

export function buildArtDirectedEnvironment(g, vista, backdrop, y, bounds, curve) {
  switch (vista) {
    case 'gothic_clockwork_spire':
      return buildGothicClockworkSpire(g, backdrop, y);
    case 'venetian_midnight_canal':
      return buildVenetianMidnightCanal(g, backdrop, y);
    case 'cybernetic_assembly_line':
      return buildCyberneticAssemblyLine(g, backdrop, y);
    case 'neon_server_necropolis':
      return buildNeonServerNecropolis(g, backdrop, y);
    case 'monastic_ruins':
      return buildMonasticRuins(g, backdrop, y);
    case 'obsidian_citadel':
      return buildObsidianCitadel(g, backdrop, y);
    case 'quantum_reactor_core':
      return buildQuantumReactorCore(g, backdrop, y);
    case 'bioluminescent_trench':
      return buildBioluminescentTrench(g, backdrop, y);
    case 'victorian_grand_library':
      return buildVictorianGrandLibrary(g, backdrop, y);
    case 'low_orbit_stealth_carrier':
      return buildLowOrbitStealthCarrier(g, backdrop, y, bounds, curve);
    default:
      return null;
  }
}

export function installPremiumEnvironmentLighting(scene, vista, vistaRoot) {
  if (!scene || !vistaRoot) return;
  switch (vista) {
    case 'gothic_clockwork_spire':
      installGothicClockworkLighting(scene, vistaRoot);
      break;
    case 'venetian_midnight_canal':
      installVenetianCanalLighting(scene, vistaRoot);
      break;
    case 'cybernetic_assembly_line':
      installCyberneticAssemblyLighting(scene, vistaRoot);
      break;
    case 'neon_server_necropolis':
      installNeonNecropolisLighting(scene, vistaRoot);
      break;
    case 'monastic_ruins':
      installMonasticRuinsLighting(scene, vistaRoot);
      break;
    case 'obsidian_citadel':
      installObsidianCitadelLighting(scene, vistaRoot);
      break;
    case 'quantum_reactor_core':
      installQuantumReactorLighting(scene, vistaRoot);
      break;
    case 'bioluminescent_trench':
      installBioluminescentTrenchLighting(scene, vistaRoot);
      break;
    case 'victorian_grand_library':
      installVictorianLibraryLighting(scene, vistaRoot);
      break;
    case 'low_orbit_stealth_carrier':
      installLowOrbitCarrierLighting(scene, vistaRoot);
      break;
    default:
      break;
  }
}

export function isArtDirectedVista(vista) {
  return [
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
  ].includes(vista);
}
