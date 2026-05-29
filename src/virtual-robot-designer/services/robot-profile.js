/**
 * Unified robot analysis — drives smart stages, coding blocks, physics, and missions.
 */
import { migrateDesign } from '../config.js';
import { migrateAssembly } from './assembly-service.js';
import { getRegistryPart } from '../data/modular-parts-registry.js';
import { detectRobotArchetype, ARCHETYPES } from './robot-archetypes.js';
import { getCoursesForProfile, getCourseDisplay } from '../data/smart-stage-courses.js';

/** Smart stage profile ids (simulator + block families). */
export const PROFILE_IDS = [
  'wheeled', 'tank', 'drone', 'jet', 'helicopter', 'spider', 'humanoid', 'arm',
  'submarine', 'hover', 'drill', 'lego', 'inventor', 'mech', 'battle', 'companion',
];

const PROFILE_META = {
  wheeled: {
    arenaTheme: 'ground',
    arenaLabel: 'STEM Challenge Arena',
    tipIcon: '🏎️',
    tip: 'This rover is built for ground challenges!',
    recommend: 'Perfect for obstacle courses, delivery runs & line following',
    tagline: 'My robot was built for THIS mission.',
  },
  tank: {
    arenaTheme: 'rough',
    arenaLabel: 'Heavy Terrain Course',
    tipIcon: '🚜',
    tip: 'This tank crushes rough terrain!',
    recommend: 'Built for ramps, rocky paths & pushing heavy cargo',
    tagline: 'My robot was built for THIS mission.',
  },
  drone: {
    arenaTheme: 'sky',
    arenaLabel: 'Sky City Arena',
    tipIcon: '🚁',
    tip: 'This drone soars through aerial challenges!',
    recommend: 'Fly through rings, avoid air obstacles & scan from above',
    tagline: 'My robot was built for THIS mission.',
  },
  jet: {
    arenaTheme: 'sky',
    arenaLabel: 'Jet Racing Circuit',
    tipIcon: '✈️',
    tip: 'This jet is built for high-speed aerial racing!',
    recommend: 'Canyon runs, sky loops & precision flight stunts',
    tagline: 'My robot was built for THIS mission.',
  },
  helicopter: {
    arenaTheme: 'sky',
    arenaLabel: 'Rescue Sky Zone',
    tipIcon: '🚁',
    tip: 'This helicopter excels at hover rescues!',
    recommend: 'Precision hovering, cargo pickup & rooftop landings',
    tagline: 'My robot was built for THIS mission.',
  },
  spider: {
    arenaTheme: 'terrain',
    arenaLabel: 'Vertical Terrain Zone',
    tipIcon: '🕷️',
    tip: 'This walker scales walls and crosses rough terrain!',
    recommend: 'Climb towers, leap gaps & explore cave systems',
    tagline: 'My robot was built for THIS mission.',
  },
  humanoid: {
    arenaTheme: 'terrain',
    arenaLabel: 'Robotics Academy Gym',
    tipIcon: '🤖',
    tip: 'This humanoid trains on balance and agility!',
    recommend: 'Balance beams, carry tasks & interactive challenges',
    tagline: 'My robot was built for THIS mission.',
  },
  arm: {
    arenaTheme: 'factory',
    arenaLabel: 'Industrial Workstation',
    tipIcon: '🦾',
    tip: 'This arm robot rules the factory floor!',
    recommend: 'Sorting, stacking, assembly & precision grabs',
    tagline: 'My robot was built for THIS mission.',
  },
  submarine: {
    arenaTheme: 'underwater',
    arenaLabel: 'Ocean Explorer Zone',
    tipIcon: '🐟',
    tip: 'This bot explores underwater worlds!',
    recommend: 'Reef samples, cave mapping & buoyancy missions',
    tagline: 'My robot was built for THIS mission.',
  },
  hover: {
    arenaTheme: 'hover',
    arenaLabel: 'Anti-Gravity Arena',
    tipIcon: '🛸',
    tip: 'This hover bot glides over floating platforms!',
    recommend: 'Cross energy bridges & drift through neon cities',
    tagline: 'My robot was built for THIS mission.',
  },
  drill: {
    arenaTheme: 'mining',
    arenaLabel: 'Crystal Mining Tunnels',
    tipIcon: '⛏️',
    tip: 'This drill bot tunnels underground!',
    recommend: 'Drill walls, collect minerals & avoid cave-ins',
    tagline: 'My robot was built for THIS mission.',
  },
  lego: {
    arenaTheme: 'lego',
    arenaLabel: 'Giant LEGO City',
    tipIcon: '🧱',
    tip: 'Your block invention gets a creative sandbox!',
    recommend: 'Block parks, cargo puzzles & build challenges',
    tagline: 'My robot was built for THIS mission.',
  },
  inventor: {
    arenaTheme: 'ground',
    arenaLabel: 'Invention Test Pad',
    tipIcon: '💡',
    tip: 'Keep inventing — each part unlocks new missions!',
    recommend: 'Add movement, sensors & tools to unlock specialized arenas',
    tagline: 'Experiment to discover your robot\'s perfect mission.',
  },
  mech: {
    arenaTheme: 'rough',
    arenaLabel: 'Heavy Lift Zone',
    tipIcon: '🦾',
    tip: 'This mech handles industrial strength tasks!',
    recommend: 'Heavy cargo, construction sites & power modes',
    tagline: 'My robot was built for THIS mission.',
  },
  battle: {
    arenaTheme: 'ground',
    arenaLabel: 'Battle Training Arena',
    tipIcon: '⚔️',
    tip: 'This battle bot dodges and strikes!',
    recommend: 'Arena dodge, target practice & stealth courses',
    tagline: 'My robot was built for THIS mission.',
  },
  companion: {
    arenaTheme: 'ai',
    arenaLabel: 'AI Puzzle Lab',
    tipIcon: '💙',
    tip: 'Your AI companion learns as it explores!',
    recommend: 'Detect targets, patrol areas & smart navigation',
    tagline: 'My robot was built for THIS mission.',
  },
};

export function detectCapabilities(design) {
  const d = migrateDesign(design);
  const asm = migrateAssembly(d);
  const slots = asm.slots || {};
  const mov = slots.movement?.partId;
  const movMeta = slots.movement ? getRegistryPart(slots.movement.category, slots.movement.partId) : null;
  const tags = movMeta?.tags || [];
  const wt = d.wheels?.type;
  const chassis = asm.base?.chassisType || '';
  const planeChassis = /jet|glider|plane|stunt|fighter|transport_plane/i.test(chassis);
  const droneChassis = /drone|quadcopter|aerial/i.test(chassis);

  return {
    hasWheels: wt === 'standard' || wt === 'mecanum' || tags.includes('wheeled'),
    hasTracks: wt === 'tracks' || asm.base?.chassisType === 'tank',
    hasLegs: wt === 'legs',
    isFlying: tags.includes('flying') || wt === 'hover' || droneChassis || planeChassis
      || ['drone', 'hover_platform', 'quadcopter', 'racing_drone', 'cargo_drone', 'stealth_drone',
        'jet_fighter', 'glider', 'transport_plane', 'stunt_plane', 'anti_gravity_platform', 'hover_racing'].includes(chassis),
    isJet: mov === 'jet' || mov === 'jets' || mov === 'jet_turbines' || tags.includes('jet') || planeChassis,
    isHelicopter: tags.includes('rotors') || mov === 'quad_props' || mov === 'rotors',
    isHover: wt === 'hover' || asm.base?.chassisType === 'hover_platform',
    isUnderwater: tags.includes('underwater') || !!d.abilities?.underwater
      || ['underwater', 'submarine_hull', 'aquatic_drone', 'amphibious'].includes(chassis),
    hasArm: asm.base?.shape === 'arm' || asm.base?.chassisType === 'arm' || !!slots.tool,
    hasGrabber: !!(d.tools?.grabber && d.tools.grabber !== 'none') || d.tools?.pincer || d.tools?.gripper,
    hasDrill: !!d.tools?.drill,
    hasAI: !!d.sensors?.ai,
    isLego: asm.buildMode === 'blocks' && (asm.blocks?.length || 0) >= 3,
    canClimb: !!d.abilities?.climb || tags.includes('climb'),
    canJump: !!d.abilities?.jump,
  };
}

/** Map archetype + capabilities → smart profile id. */
export function resolveProfileId(design) {
  const d = migrateDesign(design);
  const cap = detectCapabilities(d);
  const archetype = detectRobotArchetype(d);

  if (cap.isLego) return 'lego';
  if (cap.isUnderwater || archetype.id === 'submarine') return 'submarine';
  if (cap.hasDrill && !cap.hasWheels) return 'drill';
  if (archetype.id === 'arm') return 'arm';
  if (cap.isJet) return 'jet';
  if (cap.isHelicopter) return 'helicopter';
  if (cap.isHover && archetype.id === 'drone') return 'hover';
  if (archetype.id === 'drone') return 'drone';
  if (archetype.id === 'tank') return 'tank';
  if (archetype.id === 'spider') return 'spider';
  if (archetype.id === 'humanoid') return 'humanoid';
  if (archetype.id === 'mech') return 'mech';
  if (archetype.id === 'battle') return 'battle';
  if (archetype.id === 'companion') return 'companion';
  if (archetype.id === 'car') return 'wheeled';
  if (archetype.id === 'inventor') return 'inventor';
  return 'wheeled';
}

/**
 * Full robot profile — single source for simulator, code studio, and UI hints.
 */
export function analyzeRobot(design) {
  const d = migrateDesign(design);
  const archetype = detectRobotArchetype(d);
  const profileId = resolveProfileId(d);
  const meta = PROFILE_META[profileId] || PROFILE_META.inventor;
  const capabilities = detectCapabilities(d);
  const courses = getCoursesForProfile(profileId);
  const defaultCourseId = courses.find((c) => c.recommended)?.id || courses[0]?.id || 'open';

  return {
    archetype,
    profileId,
    arenaTheme: meta.arenaTheme,
    arenaLabel: meta.arenaLabel,
    tipIcon: meta.tipIcon,
    tip: meta.tip,
    recommend: meta.recommend,
    tagline: meta.tagline,
    missions: archetype.missions,
    courses,
    defaultCourseId,
    capabilities,
    isAerial: ['sky', 'hover'].includes(meta.arenaTheme) || capabilities.isFlying,
    isUnderwater: meta.arenaTheme === 'underwater' || capabilities.isUnderwater,
    isFactory: meta.arenaTheme === 'factory' || profileId === 'arm',
  };
}

export function getCourseMetaForProfile(profile, courseId) {
  const fromList = profile.courses.find((c) => c.id === courseId);
  const display = getCourseDisplay(courseId);
  return {
    ...display,
    ...(fromList || {}),
    id: courseId,
  };
}

export { ARCHETYPES, detectRobotArchetype };
