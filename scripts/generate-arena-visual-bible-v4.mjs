/**
 * Generates bytebuddies-arena-visual-bible-v4.md — full mega prompt for Pixar-quality arenas.
 * 33 chassis × 10 missions = 330 (excludes rover, scout, footballbot — separate pipelines).
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { CHASSIS_MODE_MAP, CHASSIS_GAME_MODE_BY_ID } from '../src/virtual-robot-designer/data/chassis-game-modes.js';
import { CHASSIS_VISUAL_DNA } from '../src/virtual-robot-designer/studio/mission-world/MissionKidClarity.js';

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT_REPO = join(__dir, '../docs/bytebuddies-arena-visual-bible-v4.md');
const OUT_ASSETS = '/Users/michelle/.cursor/projects/var-folders-5v-xpxzk4yx4jn2vy-1899c7gh00000gn-T-6f092615-95a9-43a7-a1b1-469eb0f0765b/assets/bytebuddies-arena-visual-bible-v4.md';

const EXCLUDED = new Set(['rover', 'scout', 'footballbot']);
const SPECS = CHASSIS_GAME_MODE_BY_ID;

const ROBOT_META = {
  crawler: { emoji: '🌿', display: 'Crawler', fantasy: 'NASA kid rover conquering Mars hills', camera: 'rover_wide', never: 'grey factory floor, boxing ring, underwater coral' },
  spacerover: { emoji: '🌙', display: 'Space Rover', fantasy: 'Lunar explorer on grey regolith under starfield', camera: 'rover_wide', never: 'orange Mars dirt (that is Crawler), farm soil' },
  miningbot: { emoji: '⛏️', display: 'Mining Bot', fantasy: 'Underground hero with headlamp in amber-lit tunnels', camera: 'factory_overview', never: 'open sunny sky, hospital tiles' },
  securitybot: { emoji: '🛡️', display: 'Security Bot', fantasy: 'Night-patrol guard in parking lots and warehouses', camera: 'chase_close', never: 'Mars dirt, farm barn, boxing ring' },
  farmbot: { emoji: '🚜', display: 'Farm Bot', fantasy: 'Sunny countryside helper on soil furrows', camera: 'rover_wide', never: 'grey industrial concrete, mine tunnel walls' },
  factorybot: { emoji: '🏭', display: 'Factory Bot', fantasy: 'Assembly-line worker on yellow-striped factory floor', camera: 'factory_overview', never: 'outdoor farm, Mars surface' },
  robotarm: { emoji: '🦾', display: 'Robot Arm', fantasy: 'Precision lab arm on white grid mat', camera: 'factory_close', never: 'dirt paths, sky flight rings' },
  legobot: { emoji: '🧱', display: 'LEGO Bot', fantasy: 'Playroom hero on yellow stud mat', camera: 'rover_wide', never: 'realistic concrete, mine tunnels' },
  droid: { emoji: '🤖', display: 'Droid', fantasy: 'Humanoid athlete in gym mats and sports hall', camera: 'chase_close', never: 'farm field, underwater' },
  mech: { emoji: '🦿', display: 'Mech', fantasy: 'Heavy industrial walker in scrap yard', camera: 'chase_close', never: 'hospital, coral reef' },
  spider: { emoji: '🕷️', display: 'Spider Bot', fantasy: 'Wall-climber in vertical shafts and pipes', camera: 'climber_follow', never: 'flat open desert, flight rings' },
  stealth: { emoji: '🥷', display: 'Stealth Bot', fantasy: 'Spy on moonlit rooftops with laser grids', camera: 'stealth_follow', never: 'bright farm noon, boxing stadium' },
  ninja: { emoji: '⚔️', display: 'Ninja Bot', fantasy: 'Temple roof ninja under torii gates', camera: 'stealth_follow', never: 'factory floor, Mars' },
  submarine: { emoji: '🐠', display: 'Sub Drone', fantasy: 'Shallow reef explorer in teal sunlit water', camera: 'underwater_follow', never: 'dry land, sky rings' },
  deepseabot: { emoji: '🦑', display: 'Deep Sea Bot', fantasy: 'Abyss trench with bioluminescence and headlight', camera: 'underwater_follow', never: 'bright coral shallows only, farm' },
  rescuedrone: { emoji: '🚁', display: 'Rescue Drone', fantasy: 'Hero over disaster rubble and smoke', camera: 'aerial_chase', never: 'playful cloud playground, LEGO mat' },
  medbot: { emoji: '🏥', display: 'Med Bot', fantasy: 'Hospital corridor on checker tiles', camera: 'chase_close', never: 'Mars, mine tunnel, boxing ring' },
  firebot: { emoji: '🔥', display: 'Fire Bot', fantasy: 'Burning city streets with wet reflective asphalt', camera: 'chase_close', never: 'snow, underwater, farm' },
  drone: { emoji: '🛸', display: 'Drone', fantasy: 'Sunset cloud playground with holo rings', camera: 'aerial_chase', never: 'canyon rock walls pinching view, underwater' },
  helicopter: { emoji: '🚁', display: 'Helicopter', fantasy: 'Oil-rig hops over cartoon ocean', camera: 'aerial_chase', never: 'identical to Drone cloud-only layout' },
  hoverbot: { emoji: '🛸', display: 'Hover Bot', fantasy: 'Zero-G lab with floating platforms', camera: 'aerial_chase', never: 'farm soil, mine tunnel' },
  jetplane: { emoji: '✈️', display: 'Jet Plane', fantasy: 'Supersonic military sky over carrier vista', camera: 'aerial_chase', never: 'copy Drone ring layout without carrier/speed props' },
  steathjet: { emoji: '🛩️', display: 'Stealth Jet', fantasy: 'Night ops with radar dome and stars', camera: 'aerial_chase', never: 'golden sunset (that is Drone/Jet day)' },
  aerobat: { emoji: '🎪', display: 'Aero Stunt', fantasy: 'Airshow coast with smoke rings', camera: 'aerial_chase', never: 'neon race ribbon (Racing Drone)' },
  racedrone: { emoji: '💨', display: 'Racing Drone', fantasy: 'Twilight neon ribbon speedway', camera: 'race_chase', never: 'plain cloud sea only' },
  hoverracer: { emoji: '⚡', display: 'Hover Racer', fantasy: 'Purple plasma lane with energy pads', camera: 'race_chase', never: 'identical to Racing Drone pink ribbon' },
  tank: { emoji: '🛡️', display: 'Tank', fantasy: 'Desert combat yard with bunkers — NOT boxing ring', camera: 'combat_cam', never: 'boxing canvas, hospital corridor' },
  battlebot: { emoji: '⚔️', display: 'Battle Bot', fantasy: 'Industrial mech combat on metal grating', camera: 'combat_cam', never: 'sand desert (Tank), magic runes (Blaster)' },
  striker: { emoji: '🥊', display: 'Striker', fantasy: 'Classic boxing stadium with canvas ring', camera: 'combat_cam', never: 'open desert yard, tank bunkers' },
  blaster: { emoji: '✨', display: 'Blaster', fantasy: 'Elemental magic rune arena', camera: 'combat_cam', never: 'boxing ropes, desert sand' },
  berserker: { emoji: '💢', display: 'Berserker', fantasy: 'Rage pit with lava glow cracks', camera: 'combat_cam', never: 'clean boxing stadium' },
  birdbot: { emoji: '🐦', display: 'Bird Bot', fantasy: 'Cartoon flappy side-scroll with green pipes', camera: 'side_scroll', never: '3D flight rings, ground route' },
  custom: { emoji: '🎓', display: 'Custom Bot', fantasy: 'School robotics mat with tape path', camera: 'rover_wide', never: 'combat ring, Mars' },
};

function modeArena(chassisId, spec, modeIndex) {
  const dna = CHASSIS_VISUAL_DNA[chassisId] || CHASSIS_VISUAL_DNA.custom;
  const name = (spec.name || '').toLowerCase();
  const id = (spec.id || '').toLowerCase();
  const key = `${id} ${name}`;
  const cap = modeIndex === 10;

  let pathShape = 'Wide readable route 5m across with emissive checkpoint pads every 20m.';
  let terrain = dna.pathStyle;
  let hero = dna.signatureProp;
  let sky = dna.surroundings;
  let props = [dna.signatureProp, '2 numbered checkpoint flags', 'Green goal beacon arch'];
  let mood = cap ? 'Epic capstone — kid feels like a champion.' : 'Welcoming — "I can do this!"';
  let lighting = 'Warm key light 45° left, soft fill, emissive props bloom threshold 0.88.';
  let kit = `PremiumKidArenaKit + buildChassisFloor('${dna.floorKind}')`;

  if (/climb|incline|ascent|mountain|stair/.test(key)) {
    pathShape = 'Stepped incline path rising 4–8m with 3 wide terraces; each terrace is a full platform (not a thin ramp).';
    props = ['Summit flag on top terrace', '2 mid-slope checkpoint flags', 'Dust puff particles on climb'];
  } else if (/mud|puddle|traction|slip/.test(key)) {
    pathShape = 'Straight path with 3 wide brown mud basins (3m each); splash VFX on contact.';
    props = ['Mud splash particles', 'Traction warning signs', 'Green finish arch'];
  } else if (/bridge|log|rope/.test(key)) {
    pathShape = 'Narrow wooden bridge section (4m wide) over visible gap; guard ropes on sides.';
    props = ['Rope bridge with plank texture', '1 support post per side', 'Finish flag on far bank'];
  } else if (/boulder|rock|field/.test(key)) {
    pathShape = 'Zigzag between 4 large boulder silhouettes (collision); path stays 5m wide.';
    props = ['4 rounded boulder props (background only)', 'Orange hazard cones', 'Checkpoint flags'];
  } else if (/tunnel|mine|shaft|dig|cave/.test(key)) {
    pathShape = 'Curved gravel track inside rock tunnel; amber work lights every 15m on walls.';
    terrain = 'Gravel with mine-cart rail hints; walls pinch to 12m wide then open.';
    sky = 'No sky — rock ceiling with amber sconces; depth fog ahead.';
    kit = 'mine_tunnel floor + addTunnelWalls()';
  } else if (/crystal|ore|diamond|vein/.test(key)) {
    props = ['Glowing crystal cluster (emissive cyan)', 'Ore cart silhouette', 'Deposit zone green pad'];
    lighting = 'Amber wall lights + crystal emissive bloom 0.9.';
  } else if (/farm|crop|harvest|wheat|apple|plow|water|weed|greenhouse|soil/.test(key)) {
    pathShape = 'Brown soil furrows between green crop strips; rows run parallel to path.';
    props = ['Red barn silhouette on horizon', 'Hay bale OR apple tree (mode-specific)', 'Sunny checkpoint flags'];
    kit = 'farm_field floor + addSideStripes(green)';
  } else if (/patrol|perimeter|security|vault|cctv|sentry|intruder|barrier/.test(key)) {
    pathShape = 'Dark asphalt with white patrol centre line and orange cone posts.';
    props = ['Chain-link fence silhouette', 'Security gate arm OR scanner booth', 'Blue checkpoint posts'];
    kit = 'asphalt_lot floor';
  } else if (/hospital|med|gurney|patient/.test(key)) {
    pathShape = 'White-blue checker tile corridor 4m wide; walls implied by ceiling lights.';
    props = ['Blue cross wall sign', 'Gurney station', 'Green exit arch'];
    kit = 'hospital_tile checker';
  } else if (/fire|burn|blaze|hydrant/.test(key)) {
    pathShape = 'Wet dark asphalt reflecting orange fire glow from one building silhouette.';
    props = ['Cartoon fire glow (one building)', 'Fire hydrant', 'Rescue zone green beacon'];
    lighting = 'Fire as secondary key light; smoke haze opacity 0.15.';
  } else if (/rescue|disaster|rubble|survivor/.test(key)) {
    pathShape = 'Cracked asphalt with orange cones marking safe lane through rubble silhouettes.';
    props = ['Collapsed building silhouettes (2 max)', 'Survivor marker flag', 'Medkit drop zone'];
  } else if (/ring|slalom|flight|canyon|dogfight|altitude|recon|aerial|hover|jet|drone|typhoon|warp|orbit/.test(key)) {
    pathShape = cap
      ? 'Long aerial spline with 8 premium holo rings (buildPremiumHoloRing); wide forgiving spacing.'
      : '6–8 premium holo rings along golden-hour cloud course; numbered gate sprites.';
    terrain = 'Open air — no solid floor; cloud sea at y=-48.';
    sky = dna.surroundings;
    props = ['Spawn grass island with mechanical huts (buildSpawnSkyIsland)', '3 floating citadel islands offset from path', 'Distant silhouette mesas'];
    kit = 'installPremiumAerialScenery() + enrichAerialFloatingIslands';
    lighting = 'Golden hour sky dome + bloom 0.24 + PremiumKidSun directional.';
  } else if (/sub|reef|coral|dive|kelp|trench|deep|abyss/.test(key)) {
    pathShape = /trench|deep|abyss/.test(key)
      ? 'Rocky ledge trail along trench wall; depth meter HUD.'
      : 'Sandy seabed trail with sun rays from surface.';
    sky = dna.surroundings;
    props = [/trench|deep/.test(key) ? 'Bioluminescent jellyfish silhouette' : 'Coral arch', 'Bubble trail VFX', 'Treasure or sample goal buoy'];
    kit = dna.floorKind + ' + underwater fog';
  } else if (/laser|stealth|cloak|shadow|hack|ghost|ninja|torii|infiltr/.test(key)) {
    pathShape = /climb|ceiling|wall|spider|web/.test(key)
      ? 'Vertical wall holds path; camera tilted 90° for ceiling sections.'
      : 'Dark rooftop or temple tiles with pink laser grid lines (max 6 beams).';
    props = ['Torii gate OR hack terminal', 'Laser grid pairs', 'Goal vault door glow'];
    kit = dna.floorKind;
  } else if (/fight|duel|boxing|brawl|sumo|mortar|fortress|siege|goliath|battle.?royale|berserk|rage/.test(key)) {
    if (chassisId === 'tank') {
      pathShape = 'Sandy lane between concrete bunkers; fortress core glowing blue at defend point.';
      props = ['2 concrete bunkers', 'Fortress core cylinder (emissive)', 'Target dummy silhouette'];
      kit = 'buildTankCombatYard() — NEVER BoxingRing';
    } else if (chassisId === 'striker') {
      pathShape = 'Classic 6m boxing canvas with red rope square; crowd colour blobs in darkness.';
      props = ['Corner posts with red pads', 'Punching bag training prop', 'Opponent silhouette'];
      kit = 'BoxingRing + stadium spotlights';
    } else if (chassisId === 'blaster') {
      pathShape = 'Runed stone circle platform with floating elemental orbs.';
      props = ['Spell target crystal', 'Mana fountain particles', 'Rune ring floor decal'];
    } else if (chassisId === 'berserker') {
      pathShape = 'Obsidian ring with orange lava glow cracks visible below.';
      props = ['Rage totem', 'Training dummy', 'Red spotlight cone'];
    } else {
      pathShape = 'Elevated metal grating combat platform with neon trim.';
      props = ['Energy core pedestal', 'Opponent mech silhouette', 'Stadium rim lights'];
    }
    sky = dna.surroundings;
  } else if (/flappy|pipe|bird|slingshot|nest/.test(key)) {
    pathShape = 'Side-scroll lane; chunky green pipes with gap openings; hills scroll parallax.';
    props = ['2 pipe pairs', 'Scrolling hill billboards', 'Nest goal at end'];
    kit = 'flappy_scroll + pipe kit';
  } else if (/lego|stud|brick/.test(key)) {
    pathShape = 'Yellow stud mat path with red brick lane markers.';
    props = ['Oversized 2×4 brick stack', 'Brick wall silhouette', 'Stud checkpoint posts'];
    kit = 'stud_mat + addStudPattern()';
  } else if (/arm|precision|chip|surgery|sort|assembly/.test(key)) {
    pathShape = 'White grid mat with blue alignment lines; slow precise zones.';
    props = ['Microchip tray', 'Magnifying lamp arm silhouette', 'Precision target pad'];
    kit = 'lab_grid';
  } else if (/factory|conveyor|assembly/.test(key)) {
    pathShape = 'Grey concrete centre stripe yellow; one wall conveyor belt animation.';
    props = ['Overhead crane silhouette', 'Conveyor drop zone', 'Assembly arm (background)'];
    kit = 'factory_floor';
  } else if (/space|lunar|moon|orbit|satellite/.test(key)) {
    pathShape = 'Pale grey regolith with boot-print decals; low-gravity float particles.';
    props = ['Earth blue marble on horizon', 'Satellite dish', 'Sample station flag'];
    kit = 'lunar_grey + crater bumps';
  }

  if (cap) {
    mood = `CAPSTONE for ${ROBOT_META[chassisId]?.display || chassisId}: combine best props from modes 1–9 in one zone; slightly longer path but still ≤4 hero props.`;
    pathShape += ' Capstone: add single celebratory particle burst at goal.';
  }

  return { pathShape, terrain, hero, sky, props, mood, lighting, kit };
}

function robotChapter(chassisId) {
  const meta = ROBOT_META[chassisId] || { emoji: '🤖', display: chassisId, fantasy: '', camera: 'rover_wide', never: '' };
  const dna = CHASSIS_VISUAL_DNA[chassisId] || CHASSIS_VISUAL_DNA.custom;
  return `
# ${meta.emoji} ${meta.display.toUpperCase()} — Robot Visual Bible

## Kid fantasy hook
${meta.fantasy}

## This robot is NOT
${meta.never}

## Visual DNA (locked — do not palette-swap from other robots)
| Field | Spec |
|-------|------|
| **Floor kind** | \`${dna.floorKind}\` — ${dna.label} |
| **Sky / atmosphere** | ${dna.surroundings} |
| **Path material** | ${dna.pathStyle} |
| **Signature landmark** | ${dna.signatureProp} |
| **Camera** | \`${meta.camera}\` — robot fills 25–35% of screen height on tablet |
| **Code entry** | \`CHASSIS_VISUAL_DNA.${chassisId}\` + \`buildChassisFloor('${dna.floorKind}')\` |

## Colour palette (use exactly 2 bold + 1 neutral)
- **Primary:** derived from floor/sky DNA above — never generic grey \`#e5e7eb\` industrial
- **Accent:** emissive checkpoint / goal colour \`#22c55e\` (goal) + one robot accent from DNA
- **Neutral:** ground shadow tone only — not dominant

## Prop vocabulary (only these families appear for ${meta.display})
${dna.signatureProp}; checkpoints; goal arch; one teaching landmark from mode objective. **Max 4 props total.**

## Differentiation rule
If you squint at a screenshot, a kid must name the robot within 3 seconds from **floor shape + skyline**, not colour alone.

---
`;
}

function missionBlock(chassisId, missionId, modeIndex) {
  const spec = SPECS[missionId] || {};
  const meta = ROBOT_META[chassisId] || {};
  const dna = CHASSIS_VISUAL_DNA[chassisId] || CHASSIS_VISUAL_DNA.custom;
  const arena = modeArena(chassisId, spec, modeIndex);
  const cap = modeIndex === 10 ? ' (CAPSTONE)' : '';

  return `
### Mode ${modeIndex}${cap} — ${spec.name || missionId}

| | |
|---|---|
| **Mission ID** | \`${missionId}\` |
| **Arena code** | \`${spec.arenaType || 'ground'}\` |
| **Environment** | ${spec.environmentName || dna.label} (\`${spec.environmentId || 'sandbox'}\`) |
| **Difficulty** | ${spec.difficulty || '—'} · ${spec.modeType || '—'} |

**OBJECTIVE** · ${spec.desc || spec.tagline || 'Complete the mission route.'}

**FAIL** · Leave the marked path or run out of time → restart at last checkpoint.

**STARS** · ⭐ ${spec.starRequirements?.one || 'Complete objective'} · ⭐⭐ ${spec.starRequirements?.two || 'All checkpoints'} · ⭐⭐⭐ ${spec.starRequirements?.three || 'Clean run'}

#### THE ARENA (layout & geometry — unique to this mode)

${arena.pathShape}

**Ground / flight surface:** ${arena.terrain}

#### SURROUNDINGS (sky, vista, background — soft silhouettes only)

${arena.sky}

Sky occupies **60–75%** of frame. Background props are **silhouettes or offset >30m** from play path — never blocking rings or route.

#### KEY PROPS (maximum 4 — name each mesh)

${arena.props.map((p, i) => `${i + 1}. ${p}`).join('\n')}

#### LIGHTING & POST

${arena.lighting}

#### GOAL MARKER

Large green emissive arch or beacon — **visible from spawn**; pulse period 1.6s; bloom-friendly.

#### MOOD

${arena.mood}

#### NEVER (this mission)

- Flat grey 180×180 plane with only colour changed
- CodeRacer scatter (props every 8–12m along corridor)
- Wrong robot floor (see ${meta.display} "NOT" list)
- More than 4 hero props

#### BUILDER IMPLEMENTATION

\`${arena.kit}\` · Route: \`buildChassisRoute\` kid limits (10–14 tiles, max 3 checkpoints, no coin scatter)

---
`;
}

const PART0 = `# BYTEBUDDIES — ARENA VISUAL BIBLE v4
## Mega prompt · Pixar / Nintendo quality · every arena different · every arena on-brand for its robot

> **Purpose:** This document is the single source of truth for artists, level builders, and AI codegen.
> Give any mission block to a builder and they should produce the same quality as the **High-Altitude Sky Arena / Supersonic Dogfight** reference:
> floating grass islands, orange mechanical huts, golden-hour sky, premium holo rings, warm bloom, readable HUD.
>
> **Scope:** 33 chassis × 10 missions = **330 missions** (rover, scout, footballbot use separate kart/football pipelines).
> **Synced from:** \`chassis-game-modes.js\`, \`CHASSIS_VISUAL_DNA\`, \`PremiumKidArenaKit.js\`
> **Version:** 2026-09-06-v4

---

# PART 0 — MASTER QUALITY CONTRACT

## 0.1 Reference quality bar (non-negotiable)

The shipped look must match **MK8 / Sky Garden / Cloud Citadel** tier:

| Layer | Requirement |
|-------|-------------|
| **Sky** | Gradient dome or golden hour — never flat single hex. 60–75% of frame is sky/atmosphere. |
| **Ground** | **Shaped** geometry per robot (furrows, tunnel walls, stud mat, checker tile) — not a palette-swapped plane. |
| **Hero props** | 3–4 chunky meshes with PBR + emissive accents. Named landmarks kids remember. |
| **Checkpoints** | Premium holo rings (aerial) or flags/arches (ground) — emissive, numbered, bloom threshold ≤0.9. |
| **Depth** | At least 2 depth layers: play path + midground offset islands/silhouettes + far vista. |
| **Lighting** | Directional sun + hemisphere fill; shadows on; emissive props glow. |
| **Post** | Bloom 0.14–0.24, subtle grade — warm highlights, not grey realism. |
| **Robot scale** | Robot occupies **25–35%** of screen height on iPad landscape. |
| **Clarity** | 3-second kid test: Where am I? What do I do? What looks cool? |

## 0.2 The #1 failure mode (banned)

**Palette swaps on the same layout** — e.g. eight ground robots sharing grey industrial floor, or eight flyers sharing identical ring slalom with only hue changed.

**Fix:** Every robot has locked \`CHASSIS_VISUAL_DNA.floorKind\` + unique skyline + unique signature prop.

## 0.3 Prop budget (kid clarity)

| Budget item | Limit |
|-------------|-------|
| Hero landmarks | 1 |
| Teaching props (objective-specific) | 1 |
| Checkpoint markers | 2–3 |
| Goal | 1 |
| **Total chunky props** | **≤ 4** |
| Side scatter along route | **0** (use \`skipMissionScatter\`) |
| Floating islands (aerial) | 3 citadel + 1 spawn + silhouettes (distant) |

## 0.4 Pipeline map (engineers)

\`\`\`
buildSmartArena()
  ├─ ground robots → buildKidClarityBaseArena() + buildChassisFloor(floorKind)
  │                  → buildMissionWorld() → installPremiumGroundScenery()
  ├─ sky robots    → buildAerialWorld() → installPremiumAerialScenery()
  ├─ combat        → buildFightingArena() per chassis (Tank=desert yard, Striker=ring, …)
  └─ flappy        → flappy side-scroll kit
\`\`\`

## 0.5 Prompt template (copy for any new mission)

\`\`\`
Build ByteBuddies mission arena for [ROBOT] mode [N]: "[MISSION NAME]".
Quality: Pixar/Nintendo kid game, ages 6–11, tablet landscape.
Robot DNA: floor=[floorKind], sky=[surroundings], signature=[signatureProp].
Arena layout: [unique path description from this bible].
Props (max 4): [list].
NEVER: grey void, industrial floor for non-factory robots, clutter scatter, wrong robot identity.
Implementation: PremiumKidArenaKit + MissionKidClarity v4.
\`\`\`

## 0.6 MEGA PROMPT — paste this, then add one mission block from Part 2

\`\`\`
You are a senior environment artist on a Nintendo-quality kids' robot game (ages 6–11, iPad landscape).

REFERENCE SHOT (quality bar): High-Altitude Sky Arena — golden-hour gradient sky filling 70% of frame; chunky grass floating islands with rocky undersides; orange mechanical huts on metal pillars; premium cyan/gold holographic checkpoint rings with numbered sprites; warm directional sun, soft bloom 0.22; robot fills 30% of screen; glassmorphism HUD is separate — focus on 3D world.

DESIGN PILLARS:
1. IDENTITY FIRST — floor SHAPE and skyline identify the robot, not hue alone.
2. READABILITY — max 4 chunky props; 60–75% empty sky/ceiling; goal visible from spawn.
3. DEPTH — play path + offset midground + far silhouettes (never flat void).
4. JUICE — emissive checkpoints, dust/splash/bubbles on contact, celebratory goal pulse.
5. NO CLUTTER — zero CodeRacer side scatter; no props every 8–12m.

BANNED FOREVER:
- Flat grey 180×180 plane with only color changed
- Eight robots sharing "industrial" floor
- Eight flyers sharing identical ring slalom
- Tank missions in boxing ring
- Underwater text on sky missions

TECH STACK (ByteBuddies):
- Robot DNA: CHASSIS_VISUAL_DNA[chassisId] in MissionKidClarity.js
- Ground: buildChassisFloor(floorKind) + installPremiumGroundScenery()
- Sky: installPremiumAerialScenery() + buildPremiumHoloRing() + enrichAerialFloatingIslands()
- Combat: per-chassis FightingArena (tank=desert yard, striker=boxing ring, …)

For each mission output:
1. THE ARENA — unique layout geometry (not generic "path with checkpoints")
2. SURROUNDINGS — sky/vista specific to THIS robot
3. KEY PROPS — exactly 3–4 named meshes
4. LIGHTING & POST — key/fill/bloom values
5. NEVER — mission-specific anti-patterns
6. MOOD — one sentence kid emotion

Now build: [PASTE MISSION BLOCK FROM PART 2 BELOW]
\`\`\`

## 0.7 Game developer — mode progression (modes 1→10)

| Modes | Visual complexity | Teaching |
|-------|-------------------|----------|
| 1–2 Tutorial/Easy | Simplest path; 1 hero landmark; 2 checkpoints | One new mechanic |
| 3–5 Medium | Introduce hazard shape (mud, laser, ring gap) | Combine 2 mechanics |
| 6–8 Hard | Longer path; secondary landmark offset | Timing + precision |
| 9 Expert | Near-capstone; darker mood or weather | Mastery check |
| 10 Capstone | Best props from modes 1–9 in ONE zone; still ≤4 props | "I am the champion of this robot" |

Capstone rule: **denser emotion, not denser props** — one epic vista, not ten new objects.

## 0.8 Aerial robot differentiation (do not clone Drone layout)

| Robot | Vista below | Ring accent | Spawn island feature |
|-------|-------------|-------------|---------------------|
| Drone | Cloud sea | Cyan + gold | Cloud castle arch |
| Helicopter | Ocean + oil rigs | Yellow + blue | Helipad H marking |
| Jet Plane | Carrier deck | Blue + red | Target drone silhouette |
| Stealth Jet | Radar dome night | Green stealth | Hangar opening |
| Aero Stunt | Coastline sunset | Orange + white | Lighthouse |
| Racing Drone | Neon ribbon twilight | Pink + cyan | Turbo tunnel |
| Hover Racer | Plasma track purple | Violet + cyan | Energy recharge pad |
| Hover Bot | Floating lab platforms | Purple + teal | Repulsor gate |
| Rescue Drone | Disaster rubble (low fly) | Orange + green | Survivor marker |

## 0.9 Ground robot differentiation (do not clone Factory floor)

| Robot | You must see | You must NOT see |
|-------|--------------|------------------|
| Crawler | Red Mars dirt, mesa | Grey concrete |
| Farm Bot | Soil furrows, barn | Factory yellow stripe |
| Mining Bot | Tunnel walls, amber lights | Open blue sky |
| Security Bot | Asphalt patrol line, fence | Farm crops |
| Med Bot | Checker tiles, cross signs | Street fire |
| Fire Bot | Wet street, fire glow | Hospital white |
| LEGO Bot | Stud bumps on yellow mat | Realistic asphalt |
| Spider Bot | Vertical wall holds | Flat desert |

---

# PART 1 — ENVIRONMENT FAMILIES (shared rules, NOT shared geometry)

Families control **physics & camera** only. **Floor shape comes from robot DNA**, not family.

| Family | Robots | Camera | Floor rule |
|--------|--------|--------|------------|
| martian | Crawler | rover_wide | Rust dirt + mesa — not lunar grey |
| industrial | Factory, Arm, LEGO, Droid, Mech | factory_* | Only Factory/Arm/LEGO use their DNA floors |
| underwater | Sub, Deep Sea | underwater_follow | Sandy reef vs abyss rock |
| emergency | Fire, Med, Rescue | chase_close | Street / hospital / rubble — distinct |
| sky_aerial | Drone, Heli, Jet, Hover, Aero, Stealth Jet | aerial_chase | Unique aerialVista per robot |
| hybrid_race_sky | Race Drone, Hover Racer | race_chase | Neon ribbon vs plasma track |
| cyber_ninja | Stealth, Ninja | stealth_follow | Rooftop vs temple tiles |
| spider_climber | Spider | climber_follow | Vertical shaft walls |
| boxing_mech | Tank*, Battle, Striker, Blaster, Berserker | combat_cam | *Tank uses desert yard not ring |
| flappy | Bird Bot | side_scroll | Scrolling hills + pipes |
| sandbox | Custom | rover_wide | School mat grid |

---

# PART 2 — PER-ROBOT CHAPTERS & ALL MISSIONS

`;

let doc = PART0;
const chassisList = Object.keys(CHASSIS_MODE_MAP).filter((c) => !EXCLUDED.has(c));
let missionCount = 0;

for (const chassisId of chassisList) {
  doc += robotChapter(chassisId);
  const missions = CHASSIS_MODE_MAP[chassisId] || [];
  missions.forEach((missionId, idx) => {
    doc += missionBlock(chassisId, missionId, idx + 1);
    missionCount++;
  });
}

doc += `
---

# PART 3 — QA CHECKLIST (per mission before ship)

- [ ] Screenshot squint test: correct robot identity without reading UI
- [ ] Prop count ≤ 4 chunky meshes in play view
- [ ] Goal visible from spawn
- [ ] No grey industrial floor unless Factory Bot
- [ ] Sky ≥ 60% for aerial; tunnel ceiling for mine modes
- [ ] Premium holo rings on all sky checkpoint missions
- [ ] \`node scripts/verify-arena-visual-bible-v3.mjs\` passes
- [ ] Kid clarity: no dressRouteCorridor scatter

---

# PART 4 — ROBOT DIFFERENTIATION MATRIX

| Robot | Floor identity | Sky identity | Never confuse with |
|-------|----------------|--------------|-------------------|
${chassisList.map((id) => {
  const d = CHASSIS_VISUAL_DNA[id] || {};
  const m = ROBOT_META[id] || {};
  return `| ${m.display || id} | ${d.floorKind || '—'} | ${(d.aerialVista || d.label || '—')} | ${(m.never || '').split(',')[0] || '—'} |`;
}).join('\n')}

---

*Generated ${missionCount} mission specs · ByteBuddies Arena Visual Bible v4*
`;

writeFileSync(OUT_REPO, doc, 'utf8');
try {
  writeFileSync(OUT_ASSETS, doc, 'utf8');
  console.log(`Also wrote ${OUT_ASSETS}`);
} catch {
  console.log('(assets path not found — repo copy only)');
}
console.log(`Wrote ${OUT_REPO} (${doc.length} chars, ${missionCount} missions, ${chassisList.length} robots)`);
