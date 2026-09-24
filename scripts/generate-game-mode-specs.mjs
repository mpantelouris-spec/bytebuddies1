/**
 * Generates game-mode-specifications.js — 350 detailed mode specs (35 chassis × 10).
 * Run: node scripts/generate-game-mode-specs.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

// Dynamic import from source (Node ESM)
const { CHASSIS_MODE_MAP, CHASSIS_GAME_MODE_BY_ID } = await import(
  path.join(root, 'src/virtual-robot-designer/data/chassis-game-modes.js')
);
const { CHASSIS_MODE_CATALOG } = await import(
  path.join(root, 'src/virtual-robot-designer/data/chassis-mode-catalog.js')
);
const { getChassisEnvironment, getModeArenaType } = await import(
  path.join(root, 'src/virtual-robot-designer/data/robot-arena-config.js')
);
const { getCarRacingTrack, isCarChassis } = await import(
  path.join(root, 'src/virtual-robot-designer/data/car-racing-tracks.js')
);
const { MEGA_MODE_SPEC_OVERRIDES } = await import('./mega-mode-spec-data.mjs');

const CHASSIS_META = {
  rover: { label: 'Rover (Balanced)', role: 'balanced wheeled racer', ability1: 'Balanced speed and steering', ability2: 'Stable acceleration for learners', advantage: 'Never too twitchy or sluggish — ideal teaching chassis' },
  scout: { label: 'Scout Rover (Speed)', role: 'high-speed recon vehicle', ability1: 'Top-tier straight-line speed', ability2: 'Rapid direction changes', advantage: 'Wins time-attack modes with momentum control' },
  crawler: { label: 'Crawler (All-Terrain)', role: 'off-road tread platform', ability1: 'High traction on loose surfaces', ability2: 'Climb steep grades', advantage: 'Maintains grip where wheeled bots spin out' },
  tank: { label: 'Tank (Heavy)', role: 'armored combat platform', ability1: 'Massive knockback resistance', ability2: 'Heavy weapon mounts', advantage: 'Absorbs hits while pushing objectives' },
  stealth: { label: 'Stealth (Dark Ops)', role: 'covert infiltration unit', ability1: 'Low sensor signature', ability2: 'Precision slow movement', advantage: 'Slips past patrols when speed bots fail' },
  miningbot: { label: 'Mining Bot (Heavy Duty)', role: 'industrial extractor', ability1: 'Ore crushing torque', ability2: 'Reinforced chassis', advantage: 'Hauls heavy loads through unstable tunnels' },
  securitybot: { label: 'Security Bot (Patrol)', role: 'perimeter guard', ability1: 'Patrol route memory', ability2: 'Intruder pursuit', advantage: 'Relentless circuit coverage' },
  farmbot: { label: 'Farm Bot (Agriculture)', role: 'autonomous farm hand', ability1: 'Row-following accuracy', ability2: 'Tool swap attachments', advantage: 'Repeats long field patterns flawlessly' },
  spider: { label: 'Spider Bot (Walker)', role: 'eight-legged climber', ability1: 'Wall and ceiling adhesion', ability2: 'Multi-leg gait stability', advantage: 'Traverses vertical mesh others cannot' },
  droid: { label: 'Humanoid (Bipedal)', role: 'biped service robot', ability1: 'Two-leg balance control', ability2: 'Human-scale manipulation', advantage: 'Navigates stairs and doors built for people' },
  mech: { label: 'Mech Walker (Heavy Walker)', role: 'industrial biped', ability1: 'Hydraulic stomp force', ability2: 'Dual-arm lifting', advantage: 'Combines walker agility with tank mass' },
  drone: { label: 'Drone (Quadcopter)', role: 'aerial scout', ability1: 'Hover stability', ability2: 'Ring gate precision', advantage: '3D movement through sky courses' },
  racedrone: { label: 'Racing Drone (Speed)', role: 'FPV racer', ability1: 'Burst acceleration', ability2: 'Tight gate threading', advantage: 'Hybrid sky + Rainbow Road circuits' },
  rescuedrone: { label: 'Rescue Drone (Search & Rescue)', role: 'emergency flyer', ability1: 'Thermal scanning', ability2: 'Supply drop accuracy', advantage: 'Reaches disaster zones ground bots cannot' },
  helicopter: { label: 'Helicopter (Heavy Lift)', role: 'rotor cargo craft', ability1: 'Vertical lift capacity', ability2: 'Precision hover landing', advantage: 'Places heavy payloads on rooftops' },
  hoverbot: { label: 'Hover Bot (Anti-Gravity)', role: 'repulsor glider', ability1: 'Frictionless glide', ability2: 'Altitude hold', advantage: 'Smooth traversal over gaps' },
  hoverracer: { label: 'Hover Racer (Turbo)', role: 'anti-grav speedster', ability1: 'Plasma boost', ability2: 'Drift cornering', advantage: 'Quantum speedway + sky hybrid tracks' },
  submarine: { label: 'Sub Drone (Underwater)', role: 'reef survey sub', ability1: 'Buoyancy trim', ability2: 'Sonar mapping', advantage: 'Stable in currents with depth control' },
  deepseabot: { label: 'Deep Sea Bot (Deep Dive)', role: 'abyss explorer', ability1: 'Pressure-rated hull', ability2: 'Biolume navigation', advantage: 'Operates in crushing deep trenches' },
  robotarm: { label: 'Robot Arm (Precision)', role: 'manipulator arm', ability1: 'Sub-millimeter placement', ability2: 'Force feedback grip', advantage: 'Micro tasks impossible for mobile bots' },
  factorybot: { label: 'Factory Bot (Industrial)', role: 'assembly line worker', ability1: 'Conveyor synchronization', ability2: 'Quality inspection sensors', advantage: 'Keeps pace with factory timing' },
  spacerover: { label: 'Space Rover (Astronaut)', role: 'planetary rover', ability1: 'Low-gravity traction', ability2: 'Sample drill arm', advantage: 'Martian dust and crater rims' },
  legobot: { label: 'LEGO Bot (Builder)', role: 'modular constructor', ability1: 'Brick latch precision', ability2: 'Pattern replication', advantage: 'Builds structures block by block' },
  battlebot: { label: 'Battle Mech (Combat)', role: 'combat mech', ability1: 'Energy weapons', ability2: 'Shield matrix', advantage: 'Dominates destructible arenas' },
  striker: { label: 'Boxing Striker (Boxing)', role: 'boxing fighter', ability1: 'Combo punch chains', ability2: 'Block and counter', advantage: 'Ring control and knockout timing' },
  footballbot: { label: 'Striker FC (Football)', role: 'soccer striker', ability1: 'Ball chase AI', ability2: 'Power shot', advantage: '3D turf physics mastery' },
  blaster: { label: 'Elemental Blaster (Mage)', role: 'elemental caster', ability1: 'Multi-element attacks', ability2: 'Arcane shield', advantage: 'Element combos in combat arenas' },
  ninja: { label: 'Shadow Ninja (Stealth)', role: 'stealth assassin', ability1: 'Shadow dash', ability2: 'Shuriken accuracy', advantage: 'Laser grid infiltration' },
  berserker: { label: 'Berserker (Rage)', role: 'rage brawler', ability1: 'Rage meter burst', ability2: 'Destructible smash', advantage: 'Damage scales with aggression' },
  medbot: { label: 'Med Bot (Medical)', role: 'field medic', ability1: 'Triage routing', ability2: 'Precision care tools', advantage: 'Hospital corridor sprint saves' },
  firebot: { label: 'Fire Fighter (Emergency)', role: 'fire rescue truck', ability1: 'Water cannon pressure', ability2: 'Smoke navigation', advantage: 'Burning city district specialist' },
  jetplane: { label: 'Jet Fighter (Fixed-Wing)', role: 'supersonic jet', ability1: 'Afterburner speed', ability2: 'Missile lock', advantage: 'Dogfight in sky canyons' },
  steathjet: { label: 'Stealth Jet (Stealth)', role: 'stealth aircraft', ability1: 'Radar evasion', ability2: 'Thermal suppression', advantage: 'Invisible approach runs' },
  aerobat: { label: 'Aero Stunt (Aerobatics)', role: 'aerobatic plane', ability1: 'Barrel roll control', ability2: 'Smoke trail loops', advantage: 'Air-show pylon precision' },
  birdbot: { label: 'Sling-B (Flappy Bird / Launcher)', role: 'flappy launcher bot', ability1: 'Flap thrust', ability2: 'Catapult launch', advantage: '2.5D pipe corridor mastery' },
  custom: { label: 'Create Custom', role: 'user-built robot', ability1: 'Configurable motors', ability2: 'Custom sensors', advantage: 'Test any block combination' },
};

const DIFFICULTIES = ['Tutorial', 'Easy', 'Easy', 'Medium', 'Medium', 'Medium', 'Hard', 'Hard', 'Hard', 'Expert'];
const TYPES_BY_ENV = {
  underwater: ['Exploration', 'Navigation', 'Challenge', 'Exploration', 'Survival', 'Puzzle', 'Collection', 'Navigation', 'Science', 'Hybrid'],
  emergency: ['Rescue', 'Rescue', 'Navigation', 'Challenge', 'Climb', 'Strategy', 'Crisis', 'Race', 'Defense', 'Hybrid'],
  sky_aerial: ['Navigation', 'Challenge', 'Combat', 'Patrol', 'Race', 'Delivery', 'Exploration', 'Survival', 'Stunt', 'Hybrid'],
  flappy: ['Action', 'Challenge', 'Endurance', 'Rescue', 'Navigation', 'Puzzle', 'Precision', 'Collection', 'Combat', 'Mastery'],
  rainbow_road: ['Race', 'Race', 'Race', 'Race', 'Race', 'Race', 'Challenge', 'Challenge', 'Navigation', 'Hybrid'],
  hybrid_race_sky: ['Race', 'Navigation', 'Race', 'Navigation', 'Race', 'Navigation', 'Race', 'Survival', 'Race', 'Hybrid'],
  football: ['Football', 'Football', 'Football', 'Football', 'Football', 'Football', 'Football', 'Football', 'Football', 'Football'],
  boxing_mech: ['Combat', 'Combat', 'Combat', 'Combat', 'Survival', 'Combat', 'Combat', 'Challenge', 'Escort', 'Combat'],
  martian: ['Exploration', 'Science', 'Construction', 'Navigation', 'Survival', 'Construction', 'Exploration', 'Communication', 'Strategy', 'Hybrid'],
  cyber_ninja: ['Stealth', 'Stealth', 'Stealth', 'Patrol', 'Stealth', 'Infiltration', 'Stealth', 'Patrol', 'Escape', 'Mastery'],
  industrial: ['Simulation', 'Logistics', 'Quality', 'Synchronization', 'Industrial', 'Navigation', 'Hazard', 'Emergency', 'Packaging', 'Mastery'],
  spider_climber: ['Climb', 'Balance', 'Infiltration', 'Trap', 'Navigation', 'Jump', 'Sensor', 'Race', 'Kinematics', 'Boss'],
  sandbox: ['Challenge', 'Navigation', 'Calibration', 'Sandbox', 'Tuning', 'Attachment', 'AI', 'Community', 'Duel', 'Showcase'],
};

const TRACK_LABELS = {
  rainbow_road: 'Rainbow Road — cosmic glass ribbon in deep space',
  sunny_circuit: 'Candy Kingdom — pastel cookie villages and sugar rivers',
  dragon_skyway: 'Dragon Skyway — floating castles and cloud waterfalls',
  volcano_drift: 'Volcano Drift — lava geysers and ash storms',
  street_grand_prix: 'Rainbow Road Grand Prix — expert 3-lap circuit',
  circuit_sprint: 'Circuit Sprint — time-attack rainbow ribbon',
};

const CONCEPTS = [
  ['sequential execution', 'WHEN START blocks', 'top-to-bottom program flow'],
  ['variables', 'speed constants', 'monitoring sensor values'],
  ['loops', 'REPEAT blocks', 'lap and patrol cycles'],
  ['conditionals', 'IF/ELSE', 'obstacle and zone triggers'],
  ['events', 'sensor callbacks', 'checkpoint gate handlers'],
  ['functions', 'custom block stacks', 'reusable maneuvers'],
  ['state machines', 'mode switching', 'cargo load/unload phases'],
  ['timing', 'wait blocks', 'traffic light rhythms'],
  ['debugging', 'step simulation', 'fixing drift errors'],
  ['optimization', 'code refinement', 'star-rating improvements'],
];

const STAR_TEMPLATES = {
  Tutorial: ['Complete the objective', 'Beat the suggested time', 'Perfect run — no penalties'],
  Easy: ['Finish the mission', 'Hit all checkpoints', 'Fast + clean completion'],
  Medium: ['Complete primary goal', 'Secondary objective met', 'Expert time + bonus'],
  Hard: ['Survive and finish', 'High score threshold', 'Flawless mastery run'],
  Expert: ['Clear the boss stage', 'Top-tier performance', 'Legendary perfect run'],
};

function trackForMode(chassisId, modeIndex) {
  if (isCarChassis(chassisId)) return getCarRacingTrack(chassisId, modeIndex);
  const arena = getModeArenaType(chassisId, modeIndex);
  const label = Object.entries(TRACK_LABELS).find(([k]) => k === arena)?.[1];
  return label ? { label: label.split(' — ')[0], arenaType: arena } : null;
}

function buildVisual(mode, meta, env, track, idx) {
  const m = idx;
  const trackLine = track
    ? `The active circuit is ${track.label}: a Mario Kart–quality 3D ribbon track with glossy glass tiles, neon guardrails, checkpoint arches, and boost pads. Stars and nebula skies frame the course.`
    : `The arena is ${env.name} — a dedicated 3D environment with bespoke geometry, not a generic flat floor. Lighting, fog, and particles match the ${meta.role} fantasy.`;

  return `${trackLine} Camera uses the "${env.camera}" profile: chase angles tuned for this robot class. `
    + `Mode ${m} lighting emphasizes readability — emissive markers guide the player, while atmospheric effects (caustics, smoke, holograms, or stadium floods) sell the theme. `
    + `HUD shows mission timer, checkpoint progress, star tier targets, battery/health where relevant, and a minimap on racing circuits. `
    + `Primary palette pulls from ${env.emoji} ${env.name} with accent colors on interactive objects (gates, cargo, enemies, goals). `
    + `Particle systems highlight collisions, boosts, healing, impacts, and collectibles so children get instant feedback when their code works.`;
}

function buildGameplay(mode, meta, env, track, idx) {
  const name = mode.name;
  const desc = mode.desc || mode.tagline || '';
  const trackNote = track ? ` on the ${track.label} circuit` : ` inside ${env.name}`;
  return `Objective: ${desc}. You pilot the ${meta.label}${trackNote}, starting at the mission spawn marker. `
    + `Use Blockly robot blocks (WHEN START, MOVE, TURN, sensors, loops) — arrow keys also drive manual testing in Simulate. `
    + `Challenge ramps at mode ${idx}: earlier modes teach one concept; this mode combines ${idx >= 7 ? 'multiple systems' : 'two related systems'}. `
    + `Success means meeting the win condition (checkpoints, deliveries, goals, survival, or finish line) before optional time limits. `
    + `Failure triggers respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives. `
    + `Press ▶ Simulate to run your program; edit blocks between attempts to earn higher star tiers.`;
}

function buildSpec(modeId, mode, chassisId, modeIndex) {
  const catalog = CHASSIS_MODE_CATALOG[modeId];
  const meta = CHASSIS_META[chassisId] || CHASSIS_META.custom;
  const env = getChassisEnvironment(chassisId);
  const track = trackForMode(chassisId, modeIndex);
  const diff = catalog?.difficulty || DIFFICULTIES[modeIndex - 1];
  const type = TYPES_BY_ENV[env.id]?.[modeIndex - 1] || catalog?.modeType || 'Challenge';
  const concepts = catalog?.programmingConcepts || CONCEPTS[modeIndex - 1];
  const displayName = catalog?.name || mode.name;
  const objective = catalog?.desc || mode.desc;
  const stars = catalog
    ? { one: catalog.starOne, two: catalog.starTwo, three: catalog.starThree }
    : (STAR_TEMPLATES[diff] || STAR_TEMPLATES.Medium);
  const timeEst = catalog
    ? `${catalog.timeEstimateMinutes}-${catalog.timeEstimateMinutes + 5} minutes`
    : `${2 + modeIndex}-${8 + modeIndex * 2} minutes`;
  const nextId = catalog?.unlocksNext || CHASSIS_MODE_MAP[chassisId]?.[modeIndex] || null;

  const base = {
    id: modeId,
    robot: meta.label,
    chassisId,
    modeNumber: modeIndex,
    modeName: displayName,
    catalogName: mode.name,
    quickInfo: {
      difficulty: diff,
      type,
      timeEstimate: timeEst,
      stars: { one: stars.one || stars[0], two: stars.two || stars[1], three: stars.three || stars[2] },
    },
    visualDescription: buildVisual({ ...mode, name: displayName, desc: objective }, meta, env, track, modeIndex),
    gameplayDescription: buildGameplay({ ...mode, name: displayName, desc: objective }, meta, env, track, modeIndex),
    mechanics: {
      primary: type === 'Race' ? 'Spline-track racing with laps and gates' : `${type} objective chain`,
      secondary: track ? 'Boost pads, star collectibles, fall-off respawn' : 'Zone triggers, sensors, arena hazards',
      physics: env.physics,
      sensors: modeIndex >= 4 ? 'Distance, line, and zone sensors active' : 'Basic movement sensors',
      special: track ? 'Lap counter and race HUD' : `${env.name} environment systems`,
    },
    robotAbilities: {
      keyAbility1: meta.ability1,
      keyAbility2: meta.ability2,
      whyThisRobot: `Built for ${meta.role} — this mode stresses those strengths.`,
      uniqueAdvantage: meta.advantage,
    },
    educationalValue: {
      programmingConcepts: concepts,
      realWorldConnection: `Mirrors real ${meta.role} tasks in industry and research.`,
      skillsDeveloped: ['problem decomposition', 'testing and iteration', 'spatial reasoning'],
      progression: `Mode ${modeIndex} teaches ${concepts[0]} before harder modes stack concepts.`,
    },
    uniqueElements: {
      feature1: track ? `${track.label} visual theme` : `${env.name} exclusive geometry`,
      feature2: `${displayName}: ${objective}`,
      innovation: modeIndex === 10 ? 'Boss / mastery capstone for this chassis' : `Teaches ${Array.isArray(concepts) ? concepts[0] : concepts}`,
    },
    progression: {
      unlocks: nextId ? `Mode ${modeIndex + 1}` : 'Chassis mastery complete',
      reward: catalog?.rewardBadge || `${meta.label} Mode ${modeIndex} Star`,
      nextRecommended: nextId ? (CHASSIS_MODE_CATALOG[nextId]?.name || CHASSIS_GAME_MODE_BY_ID[nextId]?.name) : 'Try another chassis',
    },
    environmentId: env.id,
    environmentName: env.name,
    raceTrack: track?.label || null,
    arenaType: track?.arenaType || getModeArenaType(chassisId, modeIndex),
  };

  const mega = MEGA_MODE_SPEC_OVERRIDES[modeId];
  if (!mega) return base;

  return {
    ...base,
    modeName: mega.modeName || base.modeName,
    visualDescription: mega.visualDescription || base.visualDescription,
    gameplayDescription: mega.gameplayDescription || base.gameplayDescription,
    megaSpec: true,
    quickInfo: {
      ...base.quickInfo,
      ...mega.quickInfo,
      stars: { ...base.quickInfo.stars, ...mega.quickInfo?.stars },
    },
    mechanics: {
      ...base.mechanics,
      primary: mega.mechanics?.primary || base.mechanics.primary,
      secondary: mega.mechanics?.secondary || base.mechanics.secondary,
      teaches: mega.mechanics?.teaches || base.mechanics.teaches,
    },
    educationalValue: {
      ...base.educationalValue,
      teaches: mega.mechanics?.teaches || base.educationalValue.progression,
      progression: mega.mechanics?.teaches
        ? `Teaches: ${mega.mechanics.teaches}`
        : base.educationalValue.progression,
    },
    uniqueElements: {
      ...base.uniqueElements,
      feature1: mega.modeName || base.uniqueElements.feature1,
      feature2: mega.mechanics?.teaches || base.uniqueElements.feature2,
    },
  };
}

const specs = {};
for (const [chassisId, ids] of Object.entries(CHASSIS_MODE_MAP)) {
  if (chassisId === 'custom') continue;
  ids.forEach((id, i) => {
    const mode = CHASSIS_GAME_MODE_BY_ID[id];
    if (mode) specs[id] = buildSpec(id, mode, chassisId, i + 1);
  });
}
// custom chassis
CHASSIS_MODE_MAP.custom?.forEach((id, i) => {
  const mode = CHASSIS_GAME_MODE_BY_ID[id];
  if (mode) specs[id] = buildSpec(id, mode, 'custom', i + 1);
});

const outPath = path.join(root, 'src/virtual-robot-designer/data/game-mode-specifications.js');
const header = `/**
 * game-mode-specifications.js — Detailed specs for all ${Object.keys(specs).length} chassis game modes.
 * AUTO-GENERATED by scripts/generate-game-mode-specs.mjs — do not edit by hand.
 */
`;

const body = `${header}
export const GAME_MODE_SPECS_BY_ID = ${JSON.stringify(specs, null, 2)};

export const GAME_MODE_SPEC_COUNT = ${Object.keys(specs).length};

export function getGameModeSpec(modeId) {
  return GAME_MODE_SPECS_BY_ID[modeId] || null;
}

export function getGameModeSpecsForChassis(chassisId) {
  const ids = Object.values(GAME_MODE_SPECS_BY_ID).filter((s) => s.chassisId === chassisId);
  return ids.sort((a, b) => a.modeNumber - b.modeNumber);
}

/** Format a spec as markdown (for docs / tooltips) */
export function formatModeSpecMarkdown(spec) {
  if (!spec) return '';
  const q = spec.quickInfo;
  return [
    \`## \${spec.robot} — Mode \${spec.modeNumber}: \${spec.modeName}\`,
    \`**Difficulty:** \${q.difficulty} · **Type:** \${q.type} · **Time:** \${q.timeEstimate}\`,
    \`**Stars:** 1★ \${q.stars.one} · 2★ \${q.stars.two} · 3★ \${q.stars.three}\`,
    '',
    '### Visual',
    spec.visualDescription,
    '',
    '### Gameplay',
    spec.gameplayDescription,
    '',
    '### Mechanics',
    \`- Primary: \${spec.mechanics.primary}\`,
    spec.mechanics.secondary ? \`- Secondary: \${spec.mechanics.secondary}\` : '',
    spec.mechanics.teaches ? \`- Teaches: \${spec.mechanics.teaches}\` : '',
    \`- Physics: \${spec.mechanics.physics}\`,
    \`- Special: \${spec.mechanics.special}\`,
    '',
    '### Educational',
    \`- Concepts: \${spec.educationalValue.programmingConcepts.join(', ')}\`,
    \`- Skills: \${spec.educationalValue.skillsDeveloped.join(', ')}\`,
  ].join('\\n');
}
`;

fs.writeFileSync(outPath, body);
console.log(`Wrote ${Object.keys(specs).length} mode specs to ${outPath}`);
