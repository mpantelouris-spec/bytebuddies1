/**
 * Detect what kind of invention the child built — drives simulator physics & mission hints.
 */
import { migrateDesign } from '../config.js';
import { migrateAssembly } from './assembly-service.js';
import { getRegistryPart } from '../data/modular-parts-registry.js';

export const ARCHETYPES = {
  inventor: { id: 'inventor', label: 'Custom Invention', icon: '💡', missions: ['Free Explore', 'Invention Challenge'] },
  car: { id: 'car', label: 'Wheeled Robot', icon: '🚗', missions: ['City Race', 'Delivery Run', 'Obstacle Course'] },
  tank: { id: 'tank', label: 'Tank / Crawler', icon: '🪖', missions: ['Rough Terrain', 'Construction Zone'] },
  humanoid: { id: 'humanoid', label: 'Humanoid / Walker', icon: '🤖', missions: ['Maze Walk', 'Rescue Mission', 'Balance Test'] },
  spider: { id: 'spider', label: 'Spider Bot', icon: '🕷️', missions: ['Wall Climb', 'Web Traverse'] },
  drone: { id: 'drone', label: 'Flying Drone', icon: '🚁', missions: ['Sky Course', 'Package Drop', 'Aerial Survey'] },
  mech: { id: 'mech', label: 'Mech / Giant', icon: '🦾', missions: ['Heavy Lift', 'Factory Line'] },
  arm: { id: 'arm', label: 'Robot Arm', icon: '🦿', missions: ['Pick & Stack', 'Color Sort', 'Assembly Line'] },
  submarine: { id: 'submarine', label: 'Underwater Bot', icon: '🐟', missions: ['Deep Dive', 'Reef Explore'] },
  battle: { id: 'battle', label: 'Battle Bot', icon: '⚔️', missions: ['Arena Dodge', 'Target Practice'] },
  companion: { id: 'companion', label: 'AI Companion', icon: '💙', missions: ['Follow Friend', 'Voice Chat'] },
  lego: { id: 'lego', label: 'Block Invention', icon: '🧱', missions: ['Block Stack', 'Creative Build Test'] },
};

export function detectRobotArchetype(design) {
  const d = migrateDesign(design);
  const asm = migrateAssembly(d);
  const slots = asm.slots || {};
  const chassis = asm.base?.chassisType || 'rover';
  const wt = d.wheels?.type;
  const mov = slots.movement?.partId;
  const movMeta = slots.movement ? getRegistryPart(slots.movement.category, slots.movement.partId) : null;
  const tags = movMeta?.tags || [];

  if (asm.buildMode === 'blocks' && (asm.blocks?.length || 0) >= 3) return ARCHETYPES.lego;
  if (asm.buildMode === 'blocks') return ARCHETYPES.inventor;

  if (tags.includes('underwater') || d.abilities?.underwater || chassis === 'underwater' || mov === 'sub_thruster') {
    return ARCHETYPES.submarine;
  }
  if (asm.base?.shape === 'arm' || chassis === 'arm') return ARCHETYPES.arm;
  if (chassis === 'mech' || tags.includes('mech')) return ARCHETYPES.mech;
  if (chassis === 'battle_bot' || chassis === 'combat') return ARCHETYPES.battle;
  if (chassis === 'companion' || (d.sensors?.ai && d.sensors?.voice)) return ARCHETYPES.companion;
  if (wt === 'hover' || tags.includes('flying') || chassis === 'drone' || chassis === 'hover_platform') {
    return ARCHETYPES.drone;
  }
  if (wt === 'legs' && (d.wheels?.count >= 6 || tags.includes('spider') || chassis === 'spider')) {
    return ARCHETYPES.spider;
  }
  if (wt === 'legs' || chassis === 'humanoid' || tags.includes('humanoid')) {
    return ARCHETYPES.humanoid;
  }
  if (wt === 'tracks' || chassis === 'tank') return ARCHETYPES.tank;
  if (wt === 'standard' || wt === 'mecanum' || tags.includes('wheeled')) return ARCHETYPES.car;

  const placed = Object.values(slots).filter(Boolean).length;
  if (placed === 0) return ARCHETYPES.inventor;
  return ARCHETYPES.inventor;
}

export function getArchetypePhysicsOverrides(archetypeId, design) {
  const d = migrateDesign(design);
  switch (archetypeId) {
    case 'drone':
      return { isFlying: true, hoverLift: 0.55 };
    case 'submarine':
      return { isFlying: false, hoverLift: -0.15, underwater: true };
    case 'spider':
      return { legAnimSpeed: 1.8, climb: true };
    case 'humanoid':
      return { legAnimSpeed: 1.3 };
    case 'tank':
      return { trackAnimSpeed: 1.6 };
    default:
      return {};
  }
}
