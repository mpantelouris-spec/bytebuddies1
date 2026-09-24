/**
 * FootballBot archetype — stats, team colours, boot modifiers, playstyles.
 */

export const FOOTBALL_CHASSIS_ID = 'footballbot';

export const TEAM_PRESETS = {
  red: { primary: '#DC2626', accent: '#FFFFFF', boot: '#1a1a1a', name: 'Red' },
  blue: { primary: '#3B82F6', accent: '#FFFFFF', boot: '#0f172a', name: 'Blue' },
  green: { primary: '#22C55E', accent: '#FFFFFF', boot: '#0f172a', name: 'Green' },
  yellow: { primary: '#EAB308', accent: '#1a1a1a', boot: '#1a1a1a', name: 'Yellow' },
};

export const BOOT_TYPES = {
  standard: { id: 'standard', label: 'Standard Boots', kickPower: 1, accuracy: 1, speed: 1 },
  power: { id: 'power', label: 'Power Boots', kickPower: 1.25, accuracy: 0.85, speed: 0.95 },
  precision: { id: 'precision', label: 'Precision Boots', kickPower: 0.9, accuracy: 1.2, speed: 1 },
  speed: { id: 'speed', label: 'Speed Boots', kickPower: 0.85, accuracy: 0.95, speed: 1.2 },
};

export const PLAYSTYLES = {
  striker: { id: 'striker', label: 'Striker', chaseWeight: 1.2, shootWeight: 1.3, defendWeight: 0.6 },
  midfielder: { id: 'midfielder', label: 'Midfielder', chaseWeight: 1, passWeight: 1.2, defendWeight: 0.8 },
  defender: { id: 'defender', label: 'Defender', chaseWeight: 0.7, defendWeight: 1.4, passWeight: 0.9 },
  goalkeeper: { id: 'goalkeeper', label: 'Goalkeeper', guardWeight: 1.5, diveWeight: 1.3, chaseWeight: 0.4 },
};

export const FOOTBALL_ROBOT = {
  id: 'footballbot',
  name: 'Striker FC',
  icon: '⚽',
  style: 'Football / Soccer',
  health: 100,
  speed: 12,
  kickPower: 10,
  accuracy: 8,
  dribble: 9,
  color: '#16A34A',
  sensorPitch: -0.35, // downward ball-tracking ray
};

export const KICK_TYPES = {
  passShort: { id: 'passShort', label: 'Short Pass', basePower: 4, maxPower: 7, loftAngle: 2, accuracy: 0.92, animFrames: 18 },
  passLong: { id: 'passLong', label: 'Long Pass', basePower: 9, maxPower: 14, loftAngle: 8, accuracy: 0.78, animFrames: 22 },
  shot: { id: 'shot', label: 'Power Shot', basePower: 16, maxPower: 26, loftAngle: 6, accuracy: 0.78, animFrames: 28 },
  lob: { id: 'lob', label: 'Lob', basePower: 8, maxPower: 12, loftAngle: 35, accuracy: 0.65, animFrames: 24 },
  volley: { id: 'volley', label: 'Volley', basePower: 14, maxPower: 22, loftAngle: 10, accuracy: 0.55, animFrames: 30 },
  clear: { id: 'clear', label: 'Clear', basePower: 11, maxPower: 16, loftAngle: 18, accuracy: 0.72, animFrames: 20 },
};

export function getFootballStats(config = {}) {
  const team = TEAM_PRESETS[config.teamColor] || TEAM_PRESETS.green;
  const boot = BOOT_TYPES[config.bootType] || BOOT_TYPES.standard;
  const style = PLAYSTYLES[config.playstyle] || PLAYSTYLES.striker;
  return {
    ...FOOTBALL_ROBOT,
    team,
    boot,
    playstyle: style,
    jerseyNumber: config.jerseyNumber ?? 10,
    kickPowerMult: boot.kickPower,
    accuracyMult: boot.accuracy,
    speedMult: boot.speed,
  };
}

export function calculateKickForce(kickType, contactTiming = 1, robotStats = {}) {
  const kt = KICK_TYPES[kickType] || KICK_TYPES.passShort;
  const timing = Math.max(0.3, Math.min(1, contactTiming));
  const powerMult = robotStats.kickPowerMult ?? 1;
  const accMult = robotStats.accuracyMult ?? 1;
  const power = (kt.basePower + (kt.maxPower - kt.basePower) * timing) * powerMult;
  const accuracy = kt.accuracy * accMult * (0.6 + timing * 0.4);
  const loft = kt.loftAngle * (kickType === 'lob' ? 1 : 0.8 + timing * 0.2);
  return { power, accuracy, loft, kickType: kt.id };
}
