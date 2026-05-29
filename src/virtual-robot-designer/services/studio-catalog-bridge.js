/**
 * Bridges the full modular parts registry → ByteBuddies Studio (BuildPage) UI format.
 */
import {
  MODULAR_CHASSIS,
  MODULAR_PARTS,
  CATALOG_PART_COUNT,
  CATALOG_CHASSIS_COUNT,
} from '../data/modular-parts-registry.js';

const LEGACY_MOVEMENT = [
  { id: 'wheels', name: 'Wheels (4)', icon: '🛞', desc: 'Standard grip', bg: '#FFF3E0', accent: '#FF8C00' },
  { id: 'wheels6', name: 'Wheels (6)', icon: '🛞', desc: 'Extra traction', bg: '#E8F5E9', accent: '#00C851' },
  { id: 'tracks', name: 'Tracks', icon: '⛓️', desc: 'Tank treads', bg: '#ECEFF1', accent: '#555' },
  { id: 'legs', name: 'Legs', icon: '🦵', desc: 'Articulated gait', bg: '#F3E5F5', accent: '#9B59B6' },
  { id: 'flying', name: 'Hover', icon: '🚁', desc: 'Thrust levitation', bg: '#E0F7FA', accent: '#00D9FF' },
  { id: 'jets', name: 'Jets', icon: '🚀', desc: 'Rocket propulsion', bg: '#FFEBEE', accent: '#FF3333' },
];

const GRAD_PALETTE = [
  ['#FFF3E0', '#FFE0B2'],
  ['#E3F2FD', '#BBDEFB'],
  ['#E8F5E9', '#C8E6C9'],
  ['#F3E5F5', '#E1BEE7'],
  ['#ECFEFF', '#CFFAFE'],
  ['#F5F3FF', '#EDE9FE'],
  ['#FEF2F2', '#FEE2E2'],
  ['#FFFBEB', '#FEF3C7'],
];

const ACCENT_COLORS = ['#FF8C00', '#1E90FF', '#00C851', '#9B59B6', '#06b6d4', '#7c3aed', '#ef4444', '#f59e0b'];

function hashIdx(str, mod) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h) % mod;
}

/** Map registry chassis → studio 3D builder key */
export function resolveChassisBuildKey(c) {
  const id = c.id || '';
  const t = c.template || 'rover';
  const shape = c.meshShape || 'box';

  const direct = {
    rover: 'rover', tank: 'tank', spider: 'spider', humanoid: 'droid', drone: 'drone',
    racing: 'scout', exploration: 'scout', rescue: 'rover', utility: 'factorybot',
    industrial: 'factorybot', combat: 'tank', forklift: 'robotarm', hauler: 'tank',
    mini: 'scout', mech: 'mech', amphibious: 'crawler', hover_platform: 'hoverbot',
    underwater: 'submarine', arm: 'robotarm', tracked_crawler: 'tank',
    animal_quad: 'crawler', battle_bot: 'battlebot', companion: 'rover',
    sci_fi: 'drone', aero: 'jetplane', delivery: 'rover',
    exploration_rover: 'scout', racing_rover: 'racedrone', armored_rover: 'tank', cargo_rover: 'factorybot',
    climbing_spider: 'spider', tactical_spider: 'spider', stealth_spider: 'stealth',
    android_body: 'droid', athletic_humanoid: 'droid',
    quadcopter: 'drone', racing_drone: 'racedrone', cargo_drone: 'rescuedrone', stealth_drone: 'steathjet',
    jet_fighter: 'jetplane', glider: 'aerobat', transport_plane: 'jetplane', stunt_plane: 'aerobat',
    submarine_hull: 'submarine', aquatic_drone: 'deepseabot',
    anti_gravity_platform: 'hoverbot', hover_racing: 'hoverracer',
    factory_base: 'factorybot', crane_platform: 'robotarm', space_rover: 'spacerover',
    scout: 'scout', crawler: 'crawler', stealth: 'stealth', miningbot: 'miningbot',
    securitybot: 'securitybot', farmbot: 'farmbot', droid: 'droid',
    racedrone: 'racedrone', rescuedrone: 'rescuedrone', helicopter: 'helicopter',
    hoverbot: 'hoverbot', hoverracer: 'hoverracer', deepseabot: 'deepseabot',
    robotarm: 'robotarm', factorybot: 'factorybot', battlebot: 'battlebot',
    spacerover: 'spacerover', jetplane: 'jetplane', steathjet: 'steathjet', aerobat: 'aerobat',
    medbot: 'medbot', firebot: 'firebot', legobot: 'legobot',
  };
  if (direct[id]) return direct[id];

  if (t === 'spider' || shape === 'hex') return 'spider';
  if (t === 'drone' || shape === 'round') return 'drone';
  if (t === 'humanoid') return 'droid';
  if (t === 'tank') return 'tank';
  if (t === 'jet') return 'jetplane';
  if (t === 'submarine') return 'submarine';
  if (t === 'hover') return 'hoverbot';
  if (t === 'arm' || shape === 'arm') return 'robotarm';
  if (shape === 'wedge') return 'scout';
  return 'rover';
}

function movementHintFromKey(buildKey, c) {
  if (['drone', 'racedrone', 'rescuedrone', 'helicopter', 'jetplane', 'steathjet', 'aerobat'].includes(buildKey)) return 'flying';
  if (['hoverbot', 'hoverracer'].includes(buildKey)) return 'hover';
  if (['submarine', 'deepseabot'].includes(buildKey)) return 'swim';
  if (['spider', 'droid', 'mech'].includes(buildKey)) return 'legs';
  if (['tank', 'miningbot', 'battlebot'].includes(buildKey)) return 'tracks';
  if (c.template === 'racing') return 'wheels';
  return 'wheels';
}

function badgeForChassis(c, buildKey) {
  const badges = {
    spider: 'Walker', drone: 'Fly', jetplane: 'Jet', submarine: 'Dive', hoverbot: 'Hover',
    tank: 'Heavy', robotarm: 'Arm', factorybot: 'Industrial', droid: 'Humanoid', mech: 'Mech',
  };
  return badges[buildKey] || (c.template ? c.template.charAt(0).toUpperCase() + c.template.slice(1) : 'Modular');
}

export function registryChassisToStudio(c) {
  const buildKey = resolveChassisBuildKey(c);
  const idx = hashIdx(c.id, GRAD_PALETTE.length);
  const accent = ACCENT_COLORS[idx];
  const scale = c.scale ?? 1;
  const speed = Math.round(Math.min(99, Math.max(25, 72 + (scale - 1) * -8 + (buildKey.includes('race') ? 18 : 0))));
  const power = Math.round(Math.min(99, Math.max(30, 65 + scale * 12)));
  const durability = Math.round(Math.min(99, Math.max(35, 70 + scale * 10)));

  return {
    id: c.id,
    buildKey,
    name: c.label,
    icon: c.icon,
    badge: badgeForChassis(c, buildKey),
    primaryColor: accent,
    accentColor: '#00D9FF',
    speed,
    power,
    durability,
    weight: `${(1.2 + scale * 0.9).toFixed(1)} kg`,
    movement: movementHintFromKey(buildKey, c) === 'flying' ? 'Flying' : 'Wheels',
    movementHint: movementHintFromKey(buildKey, c),
    bgGrad: GRAD_PALETTE[idx],
    fromRegistry: true,
  };
}

/** Merge legacy studio chassis with full modular registry (dedupe by id). */
export function buildStudioChassisData(legacyChassis = []) {
  const legacyIds = new Set(legacyChassis.map((c) => c.id));
  const registryChassis = MODULAR_CHASSIS
    .filter((c) => !legacyIds.has(c.id))
    .map(registryChassisToStudio);
  return [
    ...legacyChassis.map((c) => ({ ...c, buildKey: c.buildKey || c.id })),
    ...registryChassis,
  ];
}

export function findStudioChassis(chassisId, studioChassisList) {
  return studioChassisList.find((c) => c.id === chassisId)
    || studioChassisList.find((c) => c.buildKey === chassisId)
    || studioChassisList[0];
}

function partTile(p, fallbackColor = '#7c3aed') {
  return {
    id: p.id,
    registryId: p.id,
    category: p.category,
    name: p.label,
    icon: p.icon,
    color: fallbackColor,
    desc: p.unlocks?.length ? `Unlocks coding blocks` : 'Engineering part',
    fromRegistry: true,
  };
}

const CATEGORY_COLORS = {
  sensors: '#1E90FF',
  head: '#9B59B6',
  face: '#BB86FC',
  utility: '#FF8C00',
  power: '#00C851',
  ai: '#7c3aed',
  comms: '#06b6d4',
  armor: '#64748b',
  structure: '#888888',
  lighting: '#FFD700',
  cosmetic: '#ec4899',
  decoration: '#f59e0b',
  fun: '#FF006E',
  movement: '#1E90FF',
};

function partsByCategories(...cats) {
  return MODULAR_PARTS.filter((p) => cats.includes(p.category)).map((p) =>
    partTile(p, CATEGORY_COLORS[p.category] || '#7c3aed'),
  );
}

export const STUDIO_SENSORS_DATA = partsByCategories('sensors');
export const STUDIO_HEADS_DATA = partsByCategories('head', 'face');
export const STUDIO_ARMS_DATA = partsByCategories('utility');
export const STUDIO_TOOLS_DATA = partsByCategories('utility', 'fun');
export const STUDIO_POWER_DATA = partsByCategories('power', 'ai');
export const STUDIO_LIGHTS_DATA = partsByCategories('lighting', 'cosmetic');
export const STUDIO_ARMOR_DATA = partsByCategories('armor', 'structure');
export const STUDIO_COMMS_DATA = partsByCategories('comms');
export const STUDIO_EFFECTS_DATA = partsByCategories('fun', 'decoration');

const MOVEMENT_ICONS = {
  standard: '🛞', tracks: '⛓️', legs: '🦵', hover: '🚁', mecanum: '🔘',
};

export const STUDIO_MOVEMENT_OPTS = [
  ...LEGACY_MOVEMENT,
  ...MODULAR_PARTS.filter((p) => p.category === 'movement')
    .filter((p) => !LEGACY_MOVEMENT.some((m) => m.id === p.id))
    .map((p) => ({
      id: p.id,
      name: p.label,
      icon: p.icon || MOVEMENT_ICONS[p.wheelType] || '⚙️',
      desc: p.tags?.includes('flying') ? 'Aerial system' : p.tags?.includes('underwater') ? 'Aquatic' : 'Drive system',
      bg: '#f0eeff',
      accent: CATEGORY_COLORS.movement,
      wheelType: p.wheelType,
      fromRegistry: true,
    })),
];

export function buildStudioCategories(studioChassisData) {
  return [
  { id: 'body', label: 'Body', icon: '📦', count: studioChassisData.length },
  { id: 'movement', label: 'Move', icon: '⚙️', count: STUDIO_MOVEMENT_OPTS.length },
  { id: 'heads', label: 'Head', icon: '🤖', count: STUDIO_HEADS_DATA.length },
  { id: 'sensors', label: 'Sense', icon: '📡', count: STUDIO_SENSORS_DATA.length },
  { id: 'arms', label: 'Arms', icon: '🦾', count: STUDIO_ARMS_DATA.length },
  { id: 'tools', label: 'Tools', icon: '🔧', count: STUDIO_TOOLS_DATA.length },
  { id: 'power', label: 'Power', icon: '🔋', count: STUDIO_POWER_DATA.length },
  { id: 'armor', label: 'Armor', icon: '🛡️', count: STUDIO_ARMOR_DATA.length },
  { id: 'comms', label: 'Comms', icon: '📶', count: STUDIO_COMMS_DATA.length },
  { id: 'lights', label: 'Lights', icon: '💡', count: STUDIO_LIGHTS_DATA.length },
  { id: 'effects', label: 'FX', icon: '✨', count: STUDIO_EFFECTS_DATA.length },
  ];
}

export function getStudioCatalogSummary(studioChassisData) {
  return {
    parts: CATALOG_PART_COUNT,
    chassis: CATALOG_CHASSIS_COUNT,
    studioChassis: studioChassisData?.length || 0,
  };
}

export { CATALOG_PART_COUNT, CATALOG_CHASSIS_COUNT };
