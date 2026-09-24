#!/usr/bin/env node
/**
 * Build arena visual bible v2 — CodeRacer track quality bar.
 * Visuals: hand-authored LOOK/HERO/GOAL/MOOD from original bible (cleaned).
 * Mission: objectives/stars from game-mode-specifications.js.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CHASSIS_MODE_MAP } from '../src/virtual-robot-designer/data/chassis-game-modes.js';
import { GAME_MODE_SPECS_BY_ID } from '../src/virtual-robot-designer/data/game-mode-specifications.js';
import { CHASSIS_MODE_CATALOG } from '../src/virtual-robot-designer/data/chassis-mode-catalog.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_OUT = path.join(
  process.env.HOME,
  '.cursor/projects/var-folders-5v-xpxzk4yx4jn2vy-1899c7gh00000gn-T-6f092615-95a9-43a7-a1b1-469eb0f0765b/assets/bytebuddies-arena-visual-bible-v2.md',
);
const OLD_BIBLE = path.join(path.dirname(DEFAULT_OUT), 'bytebuddies-arena-visual-bible.md');
const OUT = process.argv[2] || DEFAULT_OUT;

const EXCLUDE = new Set(['rover', 'scout', 'footballbot']);

const ROBOT_META = {
  crawler: { name: 'CRAWLER', emoji: '🌿', family: 'Martian / Red Planet' },
  tank: { name: 'TANK', emoji: '🛡️', family: 'Industrial + Combat' },
  stealth: { name: 'STEALTH', emoji: '🌑', family: 'Cyber Ninja Night City' },
  miningbot: { name: 'MINING BOT', emoji: '⛏️', family: 'Industrial / Underground' },
  securitybot: { name: 'SECURITY BOT', emoji: '👮', family: 'Industrial / Urban' },
  farmbot: { name: 'FARM BOT', emoji: '🌾', family: 'Power Garden / Farm' },
  spider: { name: 'SPIDER BOT', emoji: '🕷️', family: 'Spider Climber' },
  droid: { name: 'HUMANOID DROID', emoji: '🤖', family: 'Industrial Factory' },
  mech: { name: 'MECH WALKER', emoji: '🦾', family: 'Industrial + Combat' },
  drone: { name: 'DRONE', emoji: '🚁', family: 'Sky Aerial' },
  racedrone: { name: 'RACING DRONE', emoji: '🏎️', family: 'Hybrid Sky Race' },
  rescuedrone: { name: 'RESCUE DRONE', emoji: '🚑', family: 'Emergency + Sky' },
  helicopter: { name: 'HELICOPTER', emoji: '🚁', family: 'Sky Aerial Heavy' },
  hoverbot: { name: 'HOVER BOT', emoji: '🛸', family: 'Anti-Gravity Sci-Fi' },
  hoverracer: { name: 'HOVER RACER', emoji: '🏁', family: 'Neon Sky Speedway' },
  submarine: { name: 'SUB DRONE', emoji: '🌊', family: 'Underwater' },
  deepseabot: { name: 'DEEP SEA BOT', emoji: '🐙', family: 'Underwater Abyss' },
  robotarm: { name: 'ROBOT ARM', emoji: '🦿', family: 'Industrial Workbench' },
  factorybot: { name: 'FACTORY BOT', emoji: '🏭', family: 'Industrial AGV' },
  spacerover: { name: 'SPACE ROVER', emoji: '🚀', family: 'Martian Exploration' },
  legobot: { name: 'LEGO BOT', emoji: '🧱', family: 'Play / Builder' },
  battlebot: { name: 'BATTLE MECH', emoji: '⚔️', family: 'Combat Ring' },
  striker: { name: 'BOXING STRIKER', emoji: '🥊', family: 'Combat Ring' },
  blaster: { name: 'ELEMENTAL BLASTER', emoji: '✨', family: 'Combat Magic' },
  ninja: { name: 'SHADOW NINJA', emoji: '🥷', family: 'Cyber + Combat' },
  berserker: { name: 'BERSERKER', emoji: '💢', family: 'Combat Heavy' },
  medbot: { name: 'MED BOT', emoji: '🏥', family: 'Emergency Hospital' },
  firebot: { name: 'FIRE FIGHTER', emoji: '🔥', family: 'Emergency Fire' },
  jetplane: { name: 'JET FIGHTER', emoji: '✈️', family: 'Sky Military' },
  steathjet: { name: 'STEALTH JET', emoji: '🌑', family: 'Sky Stealth' },
  aerobat: { name: 'AERO STUNT', emoji: '💫', family: 'Sky Aerobatic' },
  birdbot: { name: 'SLING-B / BIRDBOT', emoji: '🐦', family: 'Flappy 2.5D' },
  custom: { name: 'CUSTOM', emoji: '✨', family: 'Sandbox Lab' },
};

const HEADER_TO_CHASSIS = Object.fromEntries(
  Object.entries(ROBOT_META).map(([id, m]) => [m.name.toUpperCase(), id]),
);
HEADER_TO_CHASSIS['SLING-B / BIRDBOT'] = 'birdbot';
HEADER_TO_CHASSIS['FIRE FIGHTER'] = 'firebot';

const FAMILY_AAA = {
  martian: { palette: '#C1440E · #F4A460 · #8B4513', camera: 'rover_wide', lighting: 'Warm sunset key, dust puffs, twin-moon sky', scatter: 'rocks, NASA flags, solar panels, beacons every 8m' },
  industrial: { palette: '#FBBF24 · #64748B · #3B82F6', camera: 'factory_overview', lighting: 'Fluorescent strips + warm work pools', scatter: 'conveyors, shelves, crates, stack lights every 10m' },
  underwater: { palette: '#0D9488 · #22D3EE · #F472B6', camera: 'underwater_follow', lighting: 'Caustic god-rays, bioluminescent fill', scatter: 'coral, kelp, bubbles, wreck ribs every 8m' },
  emergency: { palette: '#DC2626 · #EA580C · #06B6D4', camera: 'chase_close', lighting: 'Rotating red/blue rim, smoke key', scatter: 'cones, barriers, hydrants, tape every 12m' },
  sky_aerial: { palette: '#38BDF8 · #FBBF24 · #EF4444', camera: 'aerial_chase', lighting: 'Golden-hour clouds, ring-gate rim', scatter: 'neon rings, pylons, helipads, cloud platforms' },
  hybrid_race_sky: { palette: '#EC4899 · #06B6D4 · #A855F7', camera: 'aerial_chase', lighting: 'Neon warp tunnels, motion streaks', scatter: 'speed rings, boost pads, warp arches every 15m' },
  cyber_ninja: { palette: '#EC4899 · #06B6D4 · #EF4444', camera: 'stealth_follow', lighting: 'Neon rim, rain ripples, laser emissive', scatter: 'laser grids, hack terminals, guard spots every 10m' },
  spider_climber: { palette: '#10B981 · #E2E8F0 · #365314', camera: 'climber_follow', lighting: 'Cave rim + fungus glow', scatter: 'pipes, girders, web strands, hooks' },
  boxing_mech: { palette: '#EF4444 · #FBBF24 · #E5E7EB', camera: 'fight_broadcast', lighting: 'Four-corner stadium spots, fighter rim', scatter: 'ropes, corner posts, crowd silhouettes, jumbotron' },
  flappy: { palette: '#EF4444 · #22C55E · #87CEEB', camera: 'side_scroll', lighting: 'Bright cartoon sky, parallax hills', scatter: 'pipe pairs, slingshot, nests, balloons' },
  sandbox: { palette: '#3B82F6 · #22C55E · #FBBF24', camera: 'lab_overview', lighting: 'Clean white lab + coloured zone tiles', scatter: 'modular walls, flags, tape paths' },
  rainbow_road: { palette: '#CC44FF · #FF88CC · #0A0028', camera: 'race_chase', lighting: 'Cosmic starfield + rainbow emissive', scatter: 'star gates, nebula pillars' },
};

function extractField(block, field) {
  const re = new RegExp(`\\*\\*${field}:\\*\\*\\s*([\\s\\S]*?)(?=\\n\\*\\*[A-Z]|\\n### |\\n---|$)`, 'i');
  const m = block.match(re);
  return m ? m[1].trim().replace(/\n+/g, ' ') : '';
}

function cleanLook(text) {
  return text
    .replace(/Part 1 palette anchors[^.]*\./gi, '')
    .replace(/camera `[^`]+` keeps the bot large in frame on 1024×768 landscape tablets;?\s*/gi, '')
    .replace(/Arena spans roughly \d+m with [^.]+\./gi, '')
    .replace(/;\s*ore dust puffs and drill sparks on contact\./gi, '.')
    .replace(/;\s*web strand snap glitter and dust on landing\./gi, '.')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function cleanMood(mood, modeName) {
  if (!mood) return `Focused adventure — the kid feels like a hero finishing "${modeName}".`;
  if (/grinning as their robot/i.test(mood)) {
    const feel = mood.match(/feels ([^—]+)/i)?.[1]?.trim();
    if (feel) return `The kid feels ${feel} — proud when the goal lights up.`;
    return `The kid feels pumped and proud completing "${modeName}".`;
  }
  return mood.replace(/Playing '[^']+',\s*/i, '').trim();
}

function headerToChassisId(line) {
  const upper = line.toUpperCase();
  for (const [name, id] of Object.entries(HEADER_TO_CHASSIS)) {
    if (upper.includes(name)) return id;
  }
  if (upper.includes('BIRDBOT') || upper.includes('SLING-B')) return 'birdbot';
  if (upper.includes('FIRE FIGHTER') || upper.includes('FIREBOT')) return 'firebot';
  return null;
}

function parseOldBibleVisuals() {
  const map = new Map();
  if (!fs.existsSync(OLD_BIBLE)) return map;
  const raw = fs.readFileSync(OLD_BIBLE, 'utf8');
  const start = raw.indexOf('# PART 3 — ALL ARENAS');
  const end = raw.indexOf('# PART 4 —');
  if (start === -1 || end === -1) return map;

  const part3 = raw.slice(start, end);
  const sections = part3.split(/\n## /).slice(1);
  for (const section of sections) {
    const headerLine = section.split('\n')[0];
    const chassisId = headerToChassisId(headerLine);
    if (!chassisId) continue;

    const blocks = section.split(/\n### Mode /).slice(1);
    for (const block of blocks) {
      const modeNum = parseInt(block.match(/^(\d+)/)?.[1], 10);
      if (!modeNum) continue;
      map.set(`${chassisId}|${modeNum}`, {
        look: cleanLook(extractField(block, 'LOOK')),
        hero: extractField(block, 'HERO PROPS'),
        goal: extractField(block, 'GOAL MARKER'),
        mood: extractField(block, 'MOOD'),
      });
    }
  }
  return map;
}

function extractObjective(gameplay) {
  if (!gameplay) return 'Complete the mission.';
  const m = gameplay.match(/Objective:\s*([^.]+)/i);
  if (m) return m[1].trim().replace(/\.$/, '') + '.';
  const first = gameplay.split('.')[0];
  return first.length < 100 ? `${first}.` : `${first.slice(0, 97)}…`;
}

function extractFail(gameplay) {
  const parts = [];
  if (/time limit|timer/i.test(gameplay || '')) parts.push('timer runs out');
  if (/alarm/i.test(gameplay || '')) parts.push('alarm triggered');
  if (/fall/i.test(gameplay || '')) parts.push('fall off course');
  if (/damage|hp|health/i.test(gameplay || '')) parts.push('too much damage');
  if (/stuck/i.test(gameplay || '')) parts.push('get stuck');
  return parts.length ? `${parts.join(', ')} → respawn.` : 'Miss objective → respawn.';
}

function synthesizeVisual(spec, familySpec) {
  const name = spec.modeName;
  const env = spec.environmentName || 'themed arena';
  return {
    look: `${env} mission course ~40m — chunky readable 3D path, emissive checkpoints, ${familySpec.lighting}. Kid sees robot fill 25% of screen on tablet.`,
    hero: `3–5 themed props from scatter kit: ${familySpec.scatter}`,
    goal: `Emissive green #22c55e arch + "${name.toUpperCase()}" hologram label`,
    mood: `The kid feels focused and proud finishing "${name}".`,
  };
}

function formatMode(spec, catalog, visuals, familySpec) {
  const n = spec.modeNumber;
  const cap = n === 10 ? ' (CAPSTONE)' : '';
  const stars = spec.quickInfo?.stars || {};
  const cat = catalog || {};
  const tagline = cat.tagline || cat.desc || spec.modeName;
  const obj = extractObjective(spec.gameplayDescription);
  const fail = extractFail(spec.gameplayDescription);
  const concepts = (cat.programmingConcepts || spec.educationalValue?.programmingConcepts || []).join(', ') || 'Blockly basics';

  const v = visuals.look
    ? visuals
    : synthesizeVisual(spec, familySpec);

  return `### Mode ${n} — ${spec.modeName}${cap}

> **${tagline}**

| | |
|---|---|
| **Difficulty** | ${spec.quickInfo?.difficulty || cat.difficulty || '—'} · ${spec.quickInfo?.type || cat.modeType || 'Mission'} |
| **Arena** | \`${spec.arenaType}\` · ${spec.environmentName} (\`${spec.environmentId}\`) |

**OBJECTIVE** · ${obj}  
**FAIL** · ${fail}  
**STARS** · ⭐ ${stars.one || cat.starOne || 'Complete'} · ⭐⭐ ${stars.two || cat.starTwo || 'Fast'} · ⭐⭐⭐ ${stars.three || cat.starThree || 'Perfect'}  
**CODE** · ${concepts}

**PALETTE** ${familySpec.palette}  
**CAMERA** \`${familySpec.camera}\`  
**LIGHTING** ${familySpec.lighting}  
**SCATTER DENSITY** ${familySpec.scatter} *(CodeRacer parity: prop every 8–12m)*

**LOOK:** ${v.look}  
**HERO PROPS:** ${v.hero}  
**GOAL MARKER:** ${v.goal}  
**MOOD:** ${cleanMood(v.mood, spec.modeName)}

`;
}

function loadArtDirectionParts() {
  if (!fs.existsSync(OLD_BIBLE)) return '';
  const raw = fs.readFileSync(OLD_BIBLE, 'utf8');
  const start = raw.indexOf('# PART 0');
  const end = raw.indexOf('# PART 3 — ALL ARENAS');
  if (start === -1 || end === -1) return '';
  return `${raw.slice(start, end).trim()}\n\n---\n\n`;
}

function build() {
  const oldVisuals = parseOldBibleVisuals();
  const lines = [];

  lines.push('# BYTEBUDDIES — ARENA VISUAL BIBLE v2');
  lines.push('## CodeRacer quality bar · 32 robots × 10 missions');
  lines.push('');
  lines.push('> Same spec density as `CodeRacerTrackStandards.js` + `BiomeAAAVisualSpec.js`: palette, camera, lighting, scatter recipe, hero landmark, goal marker, mood.');
  lines.push('> Mission objectives synced from `game-mode-specifications.js`. Visual LOOK blocks from hand-authored bible (template slop removed).');
  lines.push('> **Excluded:** rover, scout, footballbot');
  lines.push('');
  lines.push('---');
  lines.push('');

  const artParts = loadArtDirectionParts();
  if (artParts) lines.push(artParts);

  lines.push('# QUALITY BAR (match Mario Kart / CodeRacer tracks)');
  lines.push('');
  lines.push('| Racing track has | Every mission arena must have |');
  lines.push('|------------------|------------------------------|');
  lines.push('| Unique palette + fog | `ArenaBroadcastKit` family AAA spec |');
  lines.push('| Dense scatter every 8–12m | `ArenaSceneryKit` route corridor |');
  lines.push('| Hero landmark at start | Mode dressing + mission sign |');
  lines.push('| Checkpoint arches | Emissive goal + star tiers |');
  lines.push('| Horizon / vista (no void) | `addHorizonSilhouette` ring |');
  lines.push('| Bloom + grade CSS | `sim-visual-polish` atmosphere |');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('# PART 3 — ALL MISSIONS');
  lines.push('');

  let modeCount = 0;
  for (const [chassisId, modeIds] of Object.entries(CHASSIS_MODE_MAP)) {
    if (EXCLUDE.has(chassisId)) continue;
    const meta = ROBOT_META[chassisId] || { name: chassisId.toUpperCase(), emoji: '🤖', family: '' };
    lines.push(`## ${meta.name} ${meta.emoji} — ${meta.family}`);
    lines.push('');

    for (const modeId of modeIds) {
      const spec = GAME_MODE_SPECS_BY_ID[modeId];
      if (!spec) {
        lines.push(`### MISSING: ${modeId}\n`);
        continue;
      }
      const catalog = CHASSIS_MODE_CATALOG[modeId];
      const envId = spec.environmentId || 'industrial';
      const familySpec = FAMILY_AAA[envId] || FAMILY_AAA.industrial;
      const visuals = oldVisuals.get(`${chassisId}|${spec.modeNumber}`) || {};
      if (visuals.mood) visuals.mood = cleanMood(visuals.mood, spec.modeName);
      lines.push(formatMode(spec, catalog, visuals, familySpec));
      modeCount++;
    }
    lines.push('---');
    lines.push('');
  }

  lines.push(`**Total missions: ${modeCount}**`);
  lines.push('');
  lines.push('# PART 4 — IMPLEMENTATION');
  lines.push('');
  lines.push('| Layer | File |');
  lines.push('|-------|------|');
  lines.push('| Family AAA look | `ArenaBroadcastKit.js` |');
  lines.push('| Route scatter | `ArenaSceneryKit.js` `dressRouteCorridor` |');
  lines.push('| Builder routing | `AdventureArenaBuilder.js` `PREMIUM_BUILDERS` |');
  lines.push('| Atmosphere | `sim-visual-polish.js` |');
  lines.push('');
  lines.push('**Ship test:** Mining Bot mode 1, Security Bot warehouse, Stealth neon city, Sub Drone coral — no grey void, props every 10m, objective banner visible.');
  lines.push('');
  lines.push('# END');

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, lines.join('\n'));
  console.log(`Wrote ${modeCount} missions (${oldVisuals.size} hand-authored visuals) → ${OUT}`);
}

build();
