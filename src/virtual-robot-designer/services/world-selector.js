/**
 * World Selector Service
 *
 * Single entry-point for all adaptive-world decisions.
 * Analyses a robot design → returns tailored environments, missions,
 * coding blocks, physics, and smart recommendations.
 */
import { migrateDesign } from '../config.js';
import { resolveProfileId, detectCapabilities, analyzeRobot } from './robot-profile.js';
import { getAdaptiveWorld, ADAPTIVE_WORLDS, BLOCK_CATEGORY_LABELS } from '../data/adaptive-worlds.js';

/**
 * Full adaptive world data for a design.
 * @param {object} design
 * @returns {{
 *   profileId: string,
 *   world: object,
 *   recommendation: object,
 *   environments: object[],
 *   missions: object[],
 *   codingBlocks: object[],
 *   codingBlocksByCategory: object,
 *   specialFeatures: object[],
 *   physicsProfile: object,
 *   unlockedEnvironmentIds: string[],
 *   defaultEnvironmentId: string,
 *   defaultMissionId: string,
 * }}
 */
export function getAdaptiveWorldForDesign(design) {
  const d = migrateDesign(design);
  const profileId = resolveProfileId(d);
  const world = getAdaptiveWorld(profileId);
  const capabilities = detectCapabilities(d);

  const environments = applyCapabilityUnlocks(world.environments, capabilities);
  const missions = world.missions || [];
  const codingBlocks = buildCodingBlockPalette(world.codingBlocks || [], capabilities, profileId);
  const codingBlocksByCategory = groupBlocksByCategory(codingBlocks);

  const defaultEnvironment = environments.find((e) => e.unlocked) || environments[0];
  const defaultMission = missions[0];

  return {
    profileId,
    world,
    recommendation: world.recommendation,
    environments,
    missions,
    codingBlocks,
    codingBlocksByCategory,
    specialFeatures: world.specialFeatures || [],
    physicsProfile: world.physicsProfile || {},
    unlockedEnvironmentIds: environments.filter((e) => e.unlocked).map((e) => e.id),
    defaultEnvironmentId: defaultEnvironment?.id || 'open',
    defaultMissionId: defaultMission?.id || 'explore',
  };
}

/**
 * Apply capability-based unlocks on top of profile defaults.
 * Sensors / tools / movement can open additional environments.
 */
function applyCapabilityUnlocks(environments, capabilities) {
  return environments.map((env) => {
    let unlocked = env.unlocked;
    // Always unlock for robot that naturally belongs there
    if (!unlocked) {
      if (env.id === 'sky_rings' && capabilities.isFlying) unlocked = true;
      if (env.id === 'underwater_reef' && capabilities.isUnderwater) unlocked = true;
      if (env.id === 'ai_patrol' && capabilities.hasAI) unlocked = true;
      if (env.id === 'terrain_climb' && (capabilities.canClimb || capabilities.hasLegs)) unlocked = true;
    }
    return { ...env, unlocked };
  });
}

/**
 * Merge base coding blocks with extra blocks unlocked by capabilities.
 */
function buildCodingBlockPalette(baseBlocks, capabilities, profileId) {
  const blocks = [...baseBlocks];
  const ids = new Set(blocks.map((b) => b.id));

  const addIfNew = (block) => {
    if (!ids.has(block.id)) { ids.add(block.id); blocks.push(block); }
  };

  // Wheels always unlock basic drive blocks
  if (capabilities.hasWheels && !['arm', 'drill'].includes(profileId)) {
    addIfNew({ id: 'drive_fwd',  label: 'Drive Forward', icon: '⬆️',  color: '#1e90ff', category: 'move' });
    addIfNew({ id: 'drive_rev',  label: 'Reverse',        icon: '⬇️',  color: '#1e90ff', category: 'move' });
    addIfNew({ id: 'steer_left', label: 'Steer Left',     icon: '↩️',  color: '#1e90ff', category: 'move' });
    addIfNew({ id: 'steer_right',label: 'Steer Right',    icon: '↪️',  color: '#1e90ff', category: 'move' });
    addIfNew({ id: 'set_speed',  label: 'Adjust Speed',   icon: '⚡',  color: '#f59e0b', category: 'move' });
  }

  // Tracks unlock tank blocks
  if (capabilities.hasTracks) {
    addIfNew({ id: 'tank_left',  label: 'Tank Steer Left',   icon: '↩️',  color: '#78716c', category: 'move' });
    addIfNew({ id: 'tank_right', label: 'Tank Steer Right',  icon: '↪️',  color: '#78716c', category: 'move' });
    addIfNew({ id: 'rotate_spot',label: 'Rotate In Place',   icon: '🔄',  color: '#a16207', category: 'move' });
  }

  // Legs unlock walking blocks
  if (capabilities.hasLegs) {
    addIfNew({ id: 'walk',   label: 'Walk',   icon: '🚶',  color: '#a855f7', category: 'move' });
    addIfNew({ id: 'crouch', label: 'Crouch', icon: '⬇️',  color: '#8b5cf6', category: 'move' });
  }

  // Flying unlocks aerial blocks
  if (capabilities.isFlying) {
    addIfNew({ id: 'take_off',  label: 'Take Off',    icon: '🚀',  color: '#0ea5e9', category: 'move' });
    addIfNew({ id: 'land',      label: 'Land',         icon: '🛬',  color: '#0ea5e9', category: 'move' });
    addIfNew({ id: 'hover',     label: 'Hover',        icon: '⏸️',  color: '#38bdf8', category: 'move' });
    addIfNew({ id: 'altitude',  label: 'Altitude Control',icon: '📊',  color: '#7dd3fc', category: 'smart'});
  }

  // Grabber unlocks manipulation blocks
  if (capabilities.hasGrabber) {
    addIfNew({ id: 'grab',    label: 'Grab Object',   icon: '🤏',  color: '#06b6d4', category: 'action' });
    addIfNew({ id: 'release', label: 'Release Object',icon: '✋',  color: '#0284c7', category: 'action' });
  }

  // Drill unlocks tunnelling blocks
  if (capabilities.hasDrill) {
    addIfNew({ id: 'drill_on',  label: 'Activate Drill', icon: '⛏️',  color: '#a16207', category: 'action' });
    addIfNew({ id: 'tunnel_fwd',label: 'Tunnel Forward',  icon: '⬆️',  color: '#92400e', category: 'move' });
  }

  // AI sensor unlocks smart blocks
  if (capabilities.hasAI) {
    addIfNew({ id: 'detect_obj', label: 'Detect Object',    icon: '🔍',  color: '#8b5cf6', category: 'sense' });
    addIfNew({ id: 'follow_tgt', label: 'Follow Target',    icon: '👣',  color: '#7c3aed', category: 'smart' });
    addIfNew({ id: 'auto_avoid', label: 'Autonomous Avoid', icon: '🤖',  color: '#4c1d95', category: 'smart' });
  }

  // Underwater unlocks dive blocks
  if (capabilities.isUnderwater) {
    addIfNew({ id: 'dive',    label: 'Dive',    icon: '⬇️',  color: '#06b6d4', category: 'move' });
    addIfNew({ id: 'ascend_s',label: 'Ascend',  icon: '⬆️',  color: '#38bdf8', category: 'move' });
    addIfNew({ id: 'sonar',   label: 'Sonar Scan',icon: '📡',color: '#0891b2', category: 'sense'});
  }

  // Jump jets
  if (capabilities.canJump) {
    addIfNew({ id: 'leap', label: 'Leap', icon: '🦘',  color: '#22c55e', category: 'move' });
  }

  return blocks;
}

function groupBlocksByCategory(blocks) {
  const groups = {};
  for (const block of blocks) {
    const cat = block.category || 'move';
    if (!groups[cat]) {
      const meta = BLOCK_CATEGORY_LABELS[cat] || { label: cat, icon: '⚙️', color: '#64748b' };
      groups[cat] = { ...meta, id: cat, blocks: [] };
    }
    groups[cat].blocks.push(block);
  }
  return groups;
}

/**
 * All world profiles available for display in a picker,
 * each showing whether it's the child's current profile.
 */
export function getAllWorldProfiles(design) {
  const d = migrateDesign(design);
  const currentProfileId = resolveProfileId(d);

  return Object.entries(ADAPTIVE_WORLDS).map(([profileId, world]) => ({
    profileId,
    label: world.recommendation.badge,
    headline: world.recommendation.headline,
    color: world.recommendation.color,
    icon: world.recommendation.badge.split(' ')[0],
    isCurrent: profileId === currentProfileId,
    envCount: (world.environments || []).length,
    missionCount: (world.missions || []).length,
    blockCount: (world.codingBlocks || []).length,
  }));
}

/**
 * Smart tips for the child — tells them what to add to unlock more worlds.
 */
export function getExpansionTips(design) {
  const d = migrateDesign(design);
  const cap = detectCapabilities(d);
  const profileId = resolveProfileId(d);
  const tips = [];

  if (!cap.isFlying && profileId !== 'drone' && profileId !== 'jet') {
    tips.push({ icon: '🚁', text: 'Add propellers to unlock flying worlds!' });
  }
  if (!cap.isUnderwater && profileId !== 'submarine') {
    tips.push({ icon: '🌊', text: 'Add a dive system to explore underwater caves!' });
  }
  if (!cap.hasAI) {
    tips.push({ icon: '🧠', text: 'Add an AI brain module to unlock smart missions!' });
  }
  if (!cap.hasGrabber && !cap.hasArm) {
    tips.push({ icon: '🤏', text: 'Add a grabber claw to unlock factory challenges!' });
  }
  if (!cap.hasDrill) {
    tips.push({ icon: '⛏️', text: 'Add a drill to unlock underground mining worlds!' });
  }

  return tips.slice(0, 3); // Show top 3 tips
}
