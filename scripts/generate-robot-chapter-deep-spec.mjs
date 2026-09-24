/**
 * Generates bytebuddies-robot-chapter-deep-spec.md — palettes, cameras, gold chapters.
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CHASSIS_MODE_MAP, CHASSIS_GAME_MODE_BY_ID } from '../src/virtual-robot-designer/data/chassis-game-modes.js';
import { CHASSIS_VISUAL_DNA } from '../src/virtual-robot-designer/studio/mission-world/MissionKidClarity.js';

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dir, '../docs/bytebuddies-robot-chapter-deep-spec.md');
const OUT_ASSETS = '/Users/michelle/.cursor/projects/var-folders-5v-xpxzk4yx4jn2vy-1899c7gh00000gn-T-6f092615-95a9-43a7-a1b1-469eb0f0765b/assets/bytebuddies-robot-chapter-deep-spec.md';

const EXCLUDED = new Set(['rover', 'scout', 'footballbot']);

const CAMERA_BY_FAMILY = {
  martian_dirt: 'rover_wide', lunar_grey: 'rover_wide', farm_field: 'rover_wide', stud_mat: 'rover_wide',
  mine_tunnel: 'factory_overview', factory_floor: 'factory_overview', lab_grid: 'lab_overview',
  asphalt_lot: 'chase_close', hospital_tile: 'chase_close', wet_street: 'chase_close', rubble_street: 'chase_close',
  gym_mats: 'chase_close', scrap_yard: 'chase_close', climb_shaft: 'climber_follow',
  rooftop_tar: 'stealth_follow', temple_tiles: 'stealth_follow',
  sandy_seabed: 'underwater_follow', abyss_rock: 'underwater_follow',
  open_sky: 'aerial_chase', flappy_scroll: 'side_scroll', desert_sand: 'fight_broadcast',
  combat_ring: 'fight_broadcast',
};

const POST_BY_FAMILY = {
  open_sky: { bloom: 0.24, threshold: 0.88, radius: 0.18 },
  hybrid: { bloom: 0.20, threshold: 0.90, radius: 0.16 },
  ground: { bloom: 0.14, threshold: 0.92, radius: 0.14 },
  underwater: { bloom: 0.18, threshold: 0.90, radius: 0.16 },
  combat: { bloom: 0.10, threshold: 0.94, radius: 0.12 },
};

function hex(n) {
  if (!n) return '—';
  return `#${n.toString(16).padStart(6, '0')}`;
}

function fogRange(floorKind) {
  if (floorKind === 'open_sky') return '90 / 320';
  if (floorKind === 'mine_tunnel' || floorKind === 'abyss_rock') return '28 / 95';
  if (floorKind === 'underwater' || floorKind === 'sandy_seabed') return '35 / 110';
  return '48 / 125';
}

function postFor(floorKind) {
  if (floorKind === 'open_sky') return POST_BY_FAMILY.open_sky;
  if (floorKind === 'neon' || floorKind === 'plasma') return POST_BY_FAMILY.hybrid;
  if (floorKind === 'sandy_seabed' || floorKind === 'abyss_rock') return POST_BY_FAMILY.underwater;
  if (floorKind === 'combat_ring' || floorKind === 'desert_sand') return POST_BY_FAMILY.combat;
  return POST_BY_FAMILY.ground;
}

const CRAWLER_MODES = [
  { n: 1, name: 'Rocky Mountain Climb', arena: 'Stepped rust-dirt terraces rising 6m; 5m wide tread path; dust puffs on each step.', prop: 'Snow-cap mesa summit flag (8m, emissive green)', mood: 'Proud first climb' },
  { n: 2, name: 'Mud Puddle Traction Test', arena: 'Straight 40m path; 3 brown mud basins 3m wide; splash particles on entry.', prop: 'Orange traction warning sign', mood: 'Silly splashes' },
  { n: 3, name: 'Log Bridge Crossing', arena: 'Wooden plank bridge 4m wide over 6m gap; rope rails; slow zone.', prop: 'Rope bridge with knot posts', mood: 'Careful crossing' },
  { n: 4, name: 'Boulder Field Crawl', arena: 'Zigzag between 4 rounded boulder silhouettes (collision); path stays open.', prop: 'NASA sample flag between boulders', mood: 'Explorer dodge' },
  { n: 5, name: 'Trench Explorer', arena: 'Shallow trench 2m deep, 6m wide; rust walls; twin moons visible.', prop: 'Comm dish at trench end', mood: 'Discovery' },
  { n: 6, name: 'Sand Dune Drift', arena: 'Gentle dune ridges across path; soft sand shader; drift marks behind robot.', prop: 'Windsock on dune crest', mood: 'Fast slide' },
  { n: 7, name: 'Earthquake Hazard Trial', arena: 'Path with 3 cracked ground plates (visual only); subtle camera shake on cracks.', prop: 'Seismic sensor post blinking red', mood: 'Dramatic tension' },
  { n: 8, name: 'Heavy Incline Hold', arena: '15° sustained incline 30m; wider path 6m; anti-roll tutorial.', prop: 'Heavy load crate (decorative) at bottom', mood: 'Determination' },
  { n: 9, name: 'Wilderness Search Patrol', arena: 'Three large zone markers A/B/C on mesa map; patrol between zones.', prop: 'Zone beacon pillars (3m, cyan pulse)', mood: 'Search adventure' },
  { n: 10, name: 'All-Terrain Master', arena: 'Capstone: terrace + mud + bridge in one 60m loop; still ≤4 props.', prop: 'Gold NASA flag at finish mesa', mood: 'Champion moment' },
];

const JET_MODES = [
  { n: 1, name: 'Supersonic Dogfight', arena: '6 holo rings, golden-hour spline; spawn grass island below start.', prop: 'buildSpawnSkyIsland + carrier vista', mood: 'Reference quality — welcoming ace' },
  { n: 2, name: 'Precision Air Strike', arena: 'Single large target ring over cloud sea; dive from y=32 to y=12.', prop: 'Ground target bullseye on cloud layer', mood: 'Focused strike' },
  { n: 3, name: 'Carrier Touch-and-Go', arena: 'Low pass over carrier deck silhouette at y=8; 4 wide rings.', prop: 'Carrier deck mesh (80×30m) at z=-100', mood: 'Navy cool' },
  { n: 4, name: 'Mach 2 Speed Trap', arena: 'Straight spline; rings closer spacing; motion blur hint via FOV 52.', prop: 'Speed gate arch with MACH 2 billboard', mood: 'Adrenaline' },
  { n: 5, name: 'Radar Evasion', arena: 'Dark storm tint; green radar sweep cone on vista (stealth jet share NOT — day ops).', prop: 'Radar dish with rotating cone', mood: 'Sneaky tension' },
  { n: 6, name: 'Missile Jammer', arena: 'Figure-8 light pattern; purple jammer pylons offset (2 only).', prop: 'Jammer pylon (emissive purple)', mood: 'Tech hero' },
  { n: 7, name: 'Mid-Air Tanker Refuel', arena: 'Slow ring through refuel corridor; tanker silhouette parallel to path.', prop: 'Tanker plane billboard + fuel hose line', mood: 'Calm precision' },
  { n: 8, name: 'Canyon Run Precision', arena: 'Tighter slalom; mesa silhouettes far below — NOT pinch walls in camera.', prop: 'Canyon citadel island offset right', mood: 'Skill test' },
  { n: 9, name: 'Escort Transport', arena: 'Wide escort corridor; transport silhouette flies parallel (background).', prop: 'Transport plane silhouette', mood: 'Team mission' },
  { n: 10, name: 'Top Gun Ace Fighter', arena: 'Capstone: 8 rings + carrier + spawn island; bloom 0.24.', prop: 'Gold ace banner between final rings', mood: 'Movie finale' },
];

const GOLD_CRAWLER = `
# GOLD CHAPTER — CRAWLER (ground exemplar)

## Concept art brief
*Kid NASA rover on a warm Mars playground — not gritty realism.* Soft peach sky, twin cartoon moons, one mesa on the horizon. Ground is **shaped red dirt with tread ruts**, never flat grey. The robot should look like a toy hero climbing adventure hills. Reference mood: LEGO Mars Mission meets Pixar **Wall·E** opening sky.

## Palette (use exactly)

| Role | Hex | Three.js | Notes |
|------|-----|----------|-------|
| Sky top | #ffc9a6 | \`0xffc9a6\` | Peach wash |
| Sky horizon | #f4a47d | \`0xf4a47d\` | Warm haze |
| Ground regolith | #c65f45 | \`0xc65f45\` | Mars rust |
| Ground shadow | #8b3a2a | — | Underside of mesa |
| Path rut dark | #a0522d | — | Tire tracks |
| Accent checkpoint | #fbbf24 | — | Flag poles |
| Goal emissive | #22c55e | — | Finish arch |
| Fog | #f4a47d | \`0xf4a47d\` | Warm, not grey |

## Camera rig

| Parameter | Value |
|-----------|-------|
| Preset | \`rover_wide\` |
| camBack | 7.0 m |
| camUp | 3.4 m |
| lookAhead | 7.0 m |
| lookHeight | 0.8 m |
| FOV | 50° |
| Robot screen height | 28–32% on iPad landscape |

## Lighting rig

| Light | Color | Intensity | Position |
|-------|-------|-----------|----------|
| Key sun | #fff1d6 | 1.35 | (-8, 14, -6) |
| Hemisphere sky | #fffbeb | 1.25 | ground color #c65f45 |
| Fill | — | 0 | (use hemi only) |
| Shadows | ON | 1024 map | key light |

## Post-processing

| bloom | threshold | radius |
|-------|-----------|--------|
| 0.14 | 0.92 | 0.14 |

## Fog

| near | far | color |
|------|-----|-------|
| 48 m | 125 m | #f4a47d |

## Floor geometry (\`martian_dirt\`)

- Base: 180×180 m plane, roughness 0.9, metalness 0
- Optional: subtle undulation overlay (\`applyUndulatingGroundOverlay\`) on mode 1+5
- Horizon: \`martian_dirt\` silhouette — 8 mesa blocks, height 4–10 m, color #5c2810
- **Never** use \`industrial\` horizon key

## Signature meshes

| Mesh | Size | Position | Material |
|------|------|----------|----------|
| ChassisSignatureProp | 6×8×2 m mesa OR flag | (18, 0, -75) | rock / blue flag |
| Checkpoint flag | 0.9×0.5 m plane | on path | emissive blue |
| Goal arch | 5 m wide | path end | green emissive |

## All 10 modes — unique arena layout

${CRAWLER_MODES.map((m) => `### Mode ${m.n} — ${m.name}
- **Arena:** ${m.arena}
- **Hero prop:** ${m.prop}
- **Mood:** ${m.mood}`).join('\n\n')}

## Never (Crawler)
Grey concrete, factory yellow stripe, boxing ring, underwater caustics, cloud holo rings, farm barn.

## Code checklist
- [ ] \`CHASSIS_VISUAL_DNA.crawler.floorKind === 'martian_dirt'\`
- [ ] \`buildChassisFloor('martian_dirt')\` — not flat industrial
- [ ] \`installPremiumGroundScenery\` — mesa or treehouse offset
- [ ] \`horizonKey: 'martian_dirt'\`
`;

const GOLD_JET = `
# GOLD CHAPTER — JET PLANE (aerial exemplar — reference screenshot)

## Concept art brief
*Saturday-morning cartoon fighter ace.* Golden-hour sky fills **70% of frame**. Chunky grass **floating islands** with rocky undersides; **orange mechanical huts** on grey metal pillars; **premium cyan/gold holo rings** with numbered sprites. Aircraft carrier far below. This is the **quality bar for all sky robots** — Drone gets cloud castle, Helicopter gets oil rigs, but **this** density and bloom level.

## Palette

| Role | Hex | Notes |
|------|-----|-------|
| Sky top | #3478b8 | Golden-hour recipe |
| Sky mid | #87b9d6 | |
| Sky horizon | #ffd39a | |
| Fog | #d7b78f | far 320m |
| Grass island | #4a8a3a / #5a9e3a | SkyGardenHeroKit |
| Rock underside | #6b5a4a | |
| Mech hut | #f97316 | buildSkyMechanicalHut |
| Pillar metal | #64748b | |
| Ring cyan | #00d4ff / #38bdf8 | buildPremiumHoloRing |
| Ring gold rim | #ffa040 | |
| Goal | #22c55e | final ring |

## Camera rig

| Parameter | Value |
|-----------|-------|
| Preset | \`aerial_chase\` |
| camBack | 10.5 m |
| camUp | 5.8 m |
| lookAhead | 12 m |
| lookHeight | 3.0 m |
| FOV | 48° (52° mode 4 speed) |
| Robot screen height | 25–30% |

## Lighting rig

| Light | Color | Intensity | Position |
|-------|-------|-----------|----------|
| PremiumKidSun | #ffd89b | 1.45 | (28, 42, 18) |
| Hemisphere | #87ceeb / #4a8a3a | 0.55 | — |
| Ring point lights | cyan | 0.45 | per gate |

## Post-processing

| bloom | threshold | radius | grade |
|-------|-----------|--------|-------|
| 0.24 | 0.88 | 0.18 | s1.18 c1.08 |

## Fog

| near | far |
|------|-----|
| 90 m | 320 m |

## World layers (install order)

1. \`installGoldenHourSky()\` — gradient dome
2. \`addParallaxCloudLayers()\` — 3 speeds
3. \`buildSpawnSkyIsland()\` — grass + 2 huts + windmill + flags
4. \`scatterAerialIslands()\` — 3 citadel heroes offset 40–54m
5. \`scatterDistantSilhouetteIslands()\` — 4 depth layers
6. \`buildPremiumHoloRing()\` × 6–8 gates
7. \`enrichAerialFloatingIslands()\` — GLTF towers async
8. \`buildChassisAerialVista('carrier_deck')\` — deck at y=-42

## Signature meshes

| Mesh | Kit function |
|------|----------------|
| Spawn island | buildFloatingIslandDetailed(11) |
| Mechanical hut ×2 | buildSkyMechanicalHut() |
| Windmill | buildPremiumWindmill() |
| Holo ring | buildPremiumHoloRing(4.2, cyan, gold) |
| Carrier | BoxGeometry 80×2×30 at y=-42 |

## All 10 modes

${JET_MODES.map((m) => `### Mode ${m.n} — ${m.name}
- **Arena:** ${m.arena}
- **Hero prop:** ${m.prop}
- **Mood:** ${m.mood}`).join('\n\n')}

## Never (Jet Plane)
Identical layout to Drone without carrier; boxing ring; mine tunnel; flat #87ceeb only sky without gradient dome.

## Code checklist
- [ ] \`installPremiumAerialScenery()\` called in AerialWorldKit
- [ ] \`buildPremiumHoloRing\` not buildKidFriendlyRing
- [ ] \`aerialVista: 'carrier_deck'\`
- [ ] bloom ≥ 0.22 on mode 1
`;

const TEMPLATE = `
# PART A — ROBOT CHAPTER EXPANSION TEMPLATE

Copy this section for each robot when doing a deep art pass. Fill every row — empty cells mean "not ready to ship."

## [ROBOT NAME] — Deep Spec

### Concept art brief (4–6 sentences)
_Mood, kid fantasy, one film/game reference, what makes it NOT another robot._

### Palette
| Role | Hex | Three.js |
|------|-----|----------|
| Sky / ceiling | | |
| Ground / floor | | |
| Fog | | |
| Accent 1 | | |
| Goal emissive | #22c55e | |

### Camera
| preset | camBack | camUp | lookAhead | lookHeight | FOV | robot % |

### Lighting
| key color | intensity | position | hemi | shadows |

### Post
| bloom | threshold | radius |

### Fog
| near | far | color |

### Floor geometry
\`floorKind\`: ___ — describe meshes, not just color

### Signature meshes (≤4)
| name | size m | position | notes |

### Mode table (all 10)
| # | Name | Unique arena geometry | Hero prop | Mood |

### Never list
### Code files to touch
`;

let compact = `
# PART C — ALL 33 ROBOTS — COMPACT DEEP SPEC

Use this table for art direction at a glance. Expand any robot to full template (Part A) when starting its ship PR.
See **ship playbook** for order: Jet → Drone → Helicopter → Crawler → Farm → …

| Robot | floorKind | Sky | Ground | Fog | Camera | Fog n/f | Bloom | Signature | Concept one-liner |
|-------|-----------|-----|--------|-----|--------|---------|-------|-----------|-------------------|
`;

const chassisList = Object.keys(CHASSIS_MODE_MAP).filter((c) => !EXCLUDED.has(c));
const displayNames = {
  crawler: 'Crawler', spacerover: 'Space Rover', miningbot: 'Mining Bot', securitybot: 'Security Bot',
  farmbot: 'Farm Bot', factorybot: 'Factory Bot', robotarm: 'Robot Arm', legobot: 'LEGO Bot',
  droid: 'Droid', mech: 'Mech', spider: 'Spider Bot', stealth: 'Stealth Bot', ninja: 'Ninja Bot',
  submarine: 'Sub Drone', deepseabot: 'Deep Sea Bot', rescuedrone: 'Rescue Drone', medbot: 'Med Bot',
  firebot: 'Fire Bot', drone: 'Drone', helicopter: 'Helicopter', hoverbot: 'Hover Bot',
  jetplane: 'Jet Plane', steathjet: 'Stealth Jet', aerobat: 'Aero Stunt', racedrone: 'Racing Drone',
  hoverracer: 'Hover Racer', tank: 'Tank', battlebot: 'Battle Bot', striker: 'Striker',
  blaster: 'Blaster', berserker: 'Berserker', birdbot: 'Bird Bot', custom: 'Custom Bot',
};

for (const id of chassisList) {
  const d = CHASSIS_VISUAL_DNA[id] || {};
  const cam = CAMERA_BY_FAMILY[d.floorKind] || 'chase_close';
  const post = postFor(d.floorKind);
  const concept = (d.surroundings || '').slice(0, 60) + (d.surroundings?.length > 60 ? '…' : '');
  compact += `| ${displayNames[id] || id} | \`${d.floorKind || '?'}\` | ${hex(d.sky)} | ${hex(d.ground)} | ${hex(d.fog)} | \`${cam}\` | ${fogRange(d.floorKind)} | ${post.bloom} | ${d.signatureProp || '—'} | ${concept} |\n`;
}

const doc = `# BYTEBUDDIES — ROBOT CHAPTER DEEP SPEC
## Art-direction numbers · concept briefs · camera FOV · full gold chapters

> **Use with:** \`bytebuddies-arena-visual-bible-v4.md\` (all 330 missions) + \`bytebuddies-arena-ship-playbook.md\` (how to ship).
>
> **Gold chapters** (Crawler + Jet Plane) are copy-paste quality targets. Expand other robots using Part A template when their PR starts.

---

${TEMPLATE}

---

${GOLD_JET}

---

${GOLD_CRAWLER}

---

${compact}

---

# PART D — HOW TO EXPAND THE NEXT ROBOT

1. Duplicate **Part A template** below this line for e.g. Farm Bot
2. Copy palette hex from Part C table as starting point
3. Pull mission names from v4 bible Part 2
4. Write unique **Arena** line per mode (must differ from Crawler)
5. Implement per **ship playbook** Phases 1–5
6. When screenshot passes QA, move Part C row to a full gold chapter (optional)

**Next recommended expansions:** Farm Bot (ground #2), Drone (aerial #2), Mining Bot (tunnel).

*Generated ${chassisList.length} robot compact rows · v4 deep spec*
`;

writeFileSync(OUT, doc, 'utf8');
try { writeFileSync(OUT_ASSETS, doc, 'utf8'); } catch { /* ok */ }
console.log(`Wrote ${OUT} (${doc.length} chars)`);
