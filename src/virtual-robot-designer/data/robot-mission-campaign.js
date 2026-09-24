/**
 * robot-mission-campaign.js — Full-year mission catalog for non-racing robots
 * Replaces generic catalog missions with narrative-driven MG / CD / SV missions.
 */
import { WHEELYBOT_MISSIONS, WHEELYBOT_ZONES } from './missions/wheelybot-missions.js';
import { CLIMBERBOT_MISSIONS, CLIMBERBOT_ZONES } from './missions/climberbot-missions.js';
import { DRONEBOT_MISSIONS, DRONEBOT_ZONES } from './missions/dronebot-missions.js';
import { MANIPULATORBOT_MISSIONS, MANIPULATORBOT_ZONES } from './missions/manipulatorbot-missions.js';
import { HUMANOIDBOT_MISSIONS, HUMANOIDBOT_ZONES } from './missions/humanoidbot-missions.js';
import { SECURITYBOT_MISSIONS, SECURITYBOT_ZONES } from './missions/security-missions.js';
import { MEDBOT_MISSIONS, MEDBOT_ZONES } from './missions/medbot-missions.js';
import { UNDERWATERBOT_MISSIONS, UNDERWATERBOT_ZONES } from './missions/underwater-missions.js';
import { BIRDBOT_MISSIONS, BIRDBOT_ZONES } from './missions/birdbot-missions.js';
import { MININGBOT_MISSIONS, MININGBOT_ZONES } from './missions/miningbot-missions.js';

/** Racing courses — never replace or modify */
export const PROTECTED_RACING_IDS = new Set([
  'street_grand_prix', 'sunny_circuit', 'volcano_drift', 'dragon_skyway',
  'circuit_sprint', 'time_trial_gauntlet', 'sky_racers', 'neon_race',
  'drone_racing_league', 'storm_cloud_chase', 'cloud_race', 'warp_gate_champ',
  'desert_dunes_dash', 'neon_city_speedway', 'canyon_crawl', 'pyramid_peak',
  'steel_factory_circuit', 'inverted_space_crawler', 'cloud_canyon_circuit',
  'temple_flythrough_race', 'plasma_tube_championship', 'galactic_grand_prix',
]);

export const ROBOT_CAMPAIGNS = {
  wheelybot:      { label: 'WheelyBot',      icon: '🚗', robotTypes: ['rover'],                              zones: WHEELYBOT_ZONES,      missions: WHEELYBOT_MISSIONS },
  climberbot:     { label: 'ClimberBot',     icon: '🏔️', robotTypes: ['tank'],                               zones: CLIMBERBOT_ZONES,     missions: CLIMBERBOT_MISSIONS },
  dronebot:       { label: 'DroneBot',       icon: '🚁', robotTypes: ['drone', 'hover', 'racedrone', 'jet'], zones: DRONEBOT_ZONES,       missions: DRONEBOT_MISSIONS },
  manipulatorbot: { label: 'ManipulatorBot', icon: '🦾', robotTypes: ['factory', 'factorybot'],              zones: MANIPULATORBOT_ZONES, missions: MANIPULATORBOT_MISSIONS },
  humanoidbot:    { label: 'HumanoidBot',    icon: '🤖', robotTypes: ['humanoid', 'spider'],                 zones: HUMANOIDBOT_ZONES,    missions: HUMANOIDBOT_MISSIONS },
  securitybot:    { label: 'SecurityBot',    icon: '👮', robotTypes: ['security'],                           zones: SECURITYBOT_ZONES,    missions: SECURITYBOT_MISSIONS },
  medbot:         { label: 'MedBot',         icon: '🏥', robotTypes: ['medbot', 'firebot'],                  zones: MEDBOT_ZONES,         missions: MEDBOT_MISSIONS },
  underwaterbot:  { label: 'UnderwaterBot',  icon: '🤿', robotTypes: ['underwater'],                        zones: UNDERWATERBOT_ZONES,  missions: UNDERWATERBOT_MISSIONS },
  birdbot:        { label: 'BirdBot',        icon: '🐦', robotTypes: ['birdbot'],                            zones: BIRDBOT_ZONES,        missions: BIRDBOT_MISSIONS },
  miningbot:      { label: 'MiningBot',      icon: '⛏️', robotTypes: ['miningbot'],                         zones: MININGBOT_ZONES,      missions: MININGBOT_MISSIONS },
};

export const ALL_ROBOT_MISSIONS = [
  ...WHEELYBOT_MISSIONS,
  ...CLIMBERBOT_MISSIONS,
  ...DRONEBOT_MISSIONS,
  ...MANIPULATORBOT_MISSIONS,
  ...HUMANOIDBOT_MISSIONS,
  ...SECURITYBOT_MISSIONS,
  ...MEDBOT_MISSIONS,
  ...UNDERWATERBOT_MISSIONS,
  ...BIRDBOT_MISSIONS,
  ...MININGBOT_MISSIONS,
];

const MISSION_BY_ID = Object.fromEntries(ALL_ROBOT_MISSIONS.map((m) => [m.id, m]));

/** Map detectRobotType() → campaign key */
export function getCampaignKeyForRobotType(robotType) {
  for (const [key, camp] of Object.entries(ROBOT_CAMPAIGNS)) {
    if (camp.robotTypes.includes(robotType)) return key;
  }
  return null;
}

export function getRobotMission(idOrChallenge) {
  const id = typeof idOrChallenge === 'object'
    ? (idOrChallenge.missionId || idOrChallenge.robotMissionId || idOrChallenge.id)
    : idOrChallenge;
  return MISSION_BY_ID[id] || null;
}

export function getMissionsForRobotType(robotType) {
  const key = getCampaignKeyForRobotType(robotType);
  return key ? ROBOT_CAMPAIGNS[key].missions : [];
}

export function getZonesForRobotType(robotType) {
  const key = getCampaignKeyForRobotType(robotType);
  return key ? ROBOT_CAMPAIGNS[key].zones : [];
}

export function getCampaignForRobotType(robotType) {
  const key = getCampaignKeyForRobotType(robotType);
  return key ? ROBOT_CAMPAIGNS[key] : null;
}

/** Total bonus XP from sub-objectives */
export function calcMissionMaxXp(mission) {
  if (!mission) return 0;
  const subXp = (mission.subObjectives || []).reduce((s, o) => s + (o.bonusXP || 0), 0);
  return (mission.xpBase || 100) + subXp;
}

/** Star rating: 1 = primary only, 2 = primary + 1 sub, 3 = all subs */
export function calcMissionStars(mission, meta = {}) {
  if (!mission || !meta.completed) return 0;
  let stars = 1;
  const subs = mission.subObjectives || [];
  const done = subs.filter((s) => meta.subCompleted?.[s.id]).length;
  if (done >= 1) stars = 2;
  if (subs.length > 0 && done >= subs.length) stars = 3;
  return stars;
}

/** Story + objectives for mission panel */
export function getRobotMissionStory(mission) {
  if (!mission) return null;
  const zone = ROBOT_CAMPAIGNS[mission.robot]?.zones?.find((z) => z.id === mission.zoneId);
  return {
    emoji: mission.icon,
    title: mission.name,
    code: mission.code,
    story: mission.story,
    missionType: mission.missionType,
    difficulty: mission.difficulty,
    codingConcept: mission.codingConcept,
    teaches: mission.teaches,
    tip: mission.codingConcept,
    primaryObjective: mission.primaryObjective,
    subObjectives: mission.subObjectives,
    objectives: [
      mission.primaryObjective?.text,
      ...(mission.subObjectives || []).map((s) => s.text),
    ].filter(Boolean),
    winText: mission.winText,
    failTip: mission.failTip,
    failTips: mission.failTips || { generic: mission.failTip },
    zoneName: zone?.name,
    zoneSubtitle: zone?.subtitle,
    xpBase: mission.xpBase,
    maxXp: calcMissionMaxXp(mission),
  };
}

/** Fail tip by reason */
export function getMissionFailTip(mission, reason = 'generic') {
  if (!mission) return 'Try again — adjust your blocks and run again!';
  const tips = mission.failTips || {};
  return tips[reason] || tips.generic || mission.failTip || 'Try again with different blocks!';
}

/** Convert robot mission → LiveLab course object */
export function robotMissionToCourse(mission) {
  const zone = ROBOT_CAMPAIGNS[mission.robot]?.zones?.find((z) => z.id === mission.zoneId);
  const subXp = (mission.subObjectives || []).reduce((s, o) => s + (o.bonusXP || 0), 0);
  const teaches = mission.teaches || [];
  const systemsBuilt = teaches.map((t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')).filter(Boolean);
  const storyFirst = (mission.story || '').split(/[.!?]/)[0]?.trim();
  return {
    id: mission.id,
    missionId: mission.id,
    robotMissionId: mission.id,
    isRobotMission: true,
    cat: `campaign_${mission.robot}`,
    icon: mission.icon,
    name: `${mission.code}: ${mission.name}`,
    shortName: mission.name,
    tagline: storyFirst || mission.name,
    desc: mission.story,
    arenaType: mission.arenaType,
    color: mission.color || zone?.color || '#22c55e',
    obstacles: (mission.arenaSetup?.obstacles || []).length,
    totalDist: mission.totalDist || 30,
    estMinutes: mission.estMinutes || 10,
    timeLimit: mission.timeLimit || 120,
    rec: mission.rec || [],
    genre: mission.genre || 'adventure',
    missionType: mission.missionType,
    difficulty: mission.difficulty,
    code: mission.code,
    zoneId: mission.zoneId,
    zoneName: zone?.name,
    zoneSubtitle: zone?.subtitle,
    xpBase: mission.xpBase,
    xpReward: mission.xpBase + subXp,
    winText: mission.winText,
    codingConcept: mission.codingConcept,
    failTip: mission.failTip,
    failTips: mission.failTips,
    primaryObjective: mission.primaryObjective,
    subObjectives: mission.subObjectives,
    arenaSetup: mission.arenaSetup,
    systemsBuilt: systemsBuilt.length ? systemsBuilt : ['movement', 'sequencing'],
    finalOutcome: mission.winText,
    zones: 1,
    zoneCount: 1,
    medals: {
      bronze: { label: 'Complete primary objective', check: (s) => (s.progress || 0) >= 100 },
      silver: { label: 'Complete 1 bonus challenge', check: (s) => (s.subCompletedCount || 0) >= 1 },
      gold: { label: 'Complete all bonus challenges', check: (s) => (s.subCompletedCount || 0) >= (mission.subObjectives?.length || 0) },
    },
    gameObjectives: [
      mission.primaryObjective?.text,
      ...(mission.subObjectives || []).map((s) => `${s.text} (+${s.bonusXP} XP)`),
    ].filter(Boolean),
    winCondition: mission.primaryObjective?.text,
    codeHint: `CODING TIP: ${mission.codingConcept}`,
    collectTarget: mission.primaryObjective?.target,
    teaches,
  };
}

export function expandRobotMissionsAsCourses() {
  return ALL_ROBOT_MISSIONS.map(robotMissionToCourse);
}

/** Campaign sections for WorldPicker */
export function getCampaignSectionsForRobot(robotType) {
  const campaign = getCampaignForRobotType(robotType);
  if (!campaign) return [];
  return campaign.zones.map((zone) => ({
    zone,
    missions: campaign.missions.filter((m) => m.zoneId === zone.id),
  }));
}

export const MISSION_TYPE_LABELS = {
  MG: { label: 'Mini-Game', icon: '🎮', color: '#f97316' },
  CD: { label: 'Collect & Deliver', icon: '📦', color: '#22c55e' },
  SV: { label: 'Survival', icon: '🛡️', color: '#ef4444' },
};

/** Picker section metadata — one section per robot campaign */
export const CAMPAIGN_WORLD_SECTIONS = Object.fromEntries(
  Object.entries(ROBOT_CAMPAIGNS).map(([key, camp]) => [
    `campaign_${key}`,
    {
      label: `${camp.label} Campaign`,
      icon: camp.icon,
      blurb: `${camp.missions.length} missions · ${camp.zones.length} story zones`,
      color: camp.zones[0]?.color || '#22c55e',
    },
  ]),
);

const ZONE_ARENA_GRADIENTS = {
  robot_reef:      'linear-gradient(135deg, #003060 0%, #0044aa 50%, #00c8a0 100%)',
  desert_rally:    'linear-gradient(135deg, #7a3500 0%, #d47020 50%, #f59e0b 100%)',
  neon_city:       'linear-gradient(135deg, #0f172a 0%, #6b21a8 50%, #ec4899 100%)',
  arctic_station:  'linear-gradient(135deg, #0369a1 0%, #93c5fd 50%, #e0f2fe 100%)',
  jungle:          'linear-gradient(135deg, #14532d 0%, #4ade80 100%)',
  sky_island:      'linear-gradient(135deg, #ff6b1a 0%, #38bdf8 100%)',
  factory_floor:   'linear-gradient(135deg, #1a1a22 0%, #3b82f6 100%)',
  temple_maze:     'linear-gradient(135deg, #78350f 0%, #a855f7 100%)',
  warehouse_sort:  'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
  lava_canyon:     'linear-gradient(135deg, #450a0a 0%, #b91c1c 50%, #f97316 100%)',
  space_corridor:  'linear-gradient(135deg, #0a0018 0%, #1e1b4b 50%, #312e81 100%)',
  storm_cloud:     'linear-gradient(135deg, #1e293b 0%, #475569 50%, #64748b 100%)',
  volcanic_climb:  'linear-gradient(135deg, #3b0000 0%, #7c2d12 50%, #c2410c 100%)',
};

/** Zone-grouped hero cards for the mission picker */
export function getCampaignZoneWorlds(robotType) {
  const campaign = getCampaignForRobotType(robotType);
  if (!campaign) return [];
  return campaign.zones.map((zone) => ({
    zoneId: zone.id,
    meta: {
      label: zone.name,
      icon: zone.icon,
      color: zone.color,
      gradient: ZONE_ARENA_GRADIENTS[zone.arenaBase] || `linear-gradient(135deg, ${zone.color}88, ${zone.color})`,
      tagline: zone.subtitle,
      palette: zone.subtitle,
      missionCount: campaign.missions.filter((m) => m.zoneId === zone.id).length,
    },
  }));
}
