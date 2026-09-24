/**
 * robot-visual-identity.js — Part 2 robot scale, colours, and sim presentation.
 */
import * as THREE from 'three';

/** scale = bible relative size; simScale = Live Lab adventure scale multiplier */
export const ROBOT_VISUAL_IDENTITY = {
  crawler:      { scale: 1.4, simScale: 1.72, primary: '#00C851', accent: '#22c55e', label: 'Crawler' },
  tank:         { scale: 1.6, simScale: 1.92, primary: '#2C3E50', accent: '#64748b', label: 'Tank' },
  stealth:      { scale: 1.3, simScale: 1.62, primary: '#0f172a', accent: '#06b6d4', label: 'Stealth' },
  miningbot:    { scale: 1.7, simScale: 2.02, primary: '#78350f', accent: '#fbbf24', label: 'Mining Bot' },
  securitybot:  { scale: 1.35, simScale: 1.68, primary: '#1e40af', accent: '#3b82f6', label: 'Security Bot' },
  farmbot:      { scale: 1.4, simScale: 1.72, primary: '#65a30d', accent: '#a3e635', label: 'Farm Bot' },
  spider:       { scale: 1.2, simScale: 1.52, primary: '#10b981', accent: '#34d399', label: 'Spider Bot' },
  droid:        { scale: 1.45, simScale: 1.78, primary: '#9B59B6', accent: '#c084fc', label: 'Humanoid Droid' },
  mech:         { scale: 1.8, simScale: 2.12, primary: '#dc2626', accent: '#f87171', label: 'Mech Walker' },
  drone:        { scale: 1.0, simScale: 1.32, primary: '#06b6d4', accent: '#22d3ee', label: 'Drone' },
  racedrone:    { scale: 0.9, simScale: 1.22, primary: '#f59e0b', accent: '#fbbf24', label: 'Racing Drone' },
  rescuedrone:  { scale: 1.0, simScale: 1.32, primary: '#dc2626', accent: '#ffffff', label: 'Rescue Drone' },
  helicopter:   { scale: 1.5, simScale: 1.82, primary: '#7c3aed', accent: '#a78bfa', label: 'Helicopter' },
  hoverbot:     { scale: 1.2, simScale: 1.52, primary: '#8b5cf6', accent: '#c4b5fd', label: 'Hover Bot' },
  hoverracer:   { scale: 1.1, simScale: 1.42, primary: '#ec4899', accent: '#f472b6', label: 'Hover Racer' },
  submarine:    { scale: 1.3, simScale: 1.62, primary: '#eab308', accent: '#fde047', label: 'Sub Drone' },
  deepseabot:   { scale: 1.6, simScale: 1.92, primary: '#164e63', accent: '#0ea5e9', label: 'Deep Sea Bot' },
  robotarm:     { scale: 1.0, simScale: 1.45, primary: '#ec4899', accent: '#f97316', label: 'Robot Arm' },
  factorybot:   { scale: 1.4, simScale: 1.72, primary: '#f97316', accent: '#fbbf24', label: 'Factory Bot' },
  spacerover:   { scale: 1.4, simScale: 1.72, primary: '#94a3b8', accent: '#cbd5e1', label: 'Space Rover' },
  legobot:      { scale: 1.3, simScale: 1.62, primary: '#ef4444', accent: '#fbbf24', label: 'LEGO Bot' },
  battlebot:    { scale: 1.9, simScale: 2.22, primary: '#1e293b', accent: '#dc2626', label: 'Battle Mech' },
  striker:      { scale: 1.5, simScale: 1.82, primary: '#f97316', accent: '#fb923c', label: 'Boxing Striker' },
  blaster:      { scale: 1.45, simScale: 1.78, primary: '#7c3aed', accent: '#a855f7', label: 'Elemental Blaster' },
  ninja:        { scale: 1.4, simScale: 1.72, primary: '#334155', accent: '#06b6d4', label: 'Shadow Ninja' },
  berserker:    { scale: 1.7, simScale: 2.02, primary: '#dc2626', accent: '#f87171', label: 'Berserker' },
  medbot:       { scale: 1.35, simScale: 1.68, primary: '#0ea5e9', accent: '#dc2626', label: 'Med Bot' },
  firebot:      { scale: 1.5, simScale: 1.82, primary: '#dc2626', accent: '#fbbf24', label: 'Fire Fighter' },
  jetplane:     { scale: 1.4, simScale: 1.72, primary: '#1e40af', accent: '#3b82f6', label: 'Jet Fighter' },
  steathjet:    { scale: 1.4, simScale: 1.72, primary: '#0f172a', accent: '#64748b', label: 'Stealth Jet' },
  aerobat:      { scale: 1.2, simScale: 1.52, primary: '#dc2626', accent: '#fbbf24', label: 'Aero Stunt' },
  birdbot:      { scale: 1.0, simScale: 1.15, primary: '#e52222', accent: '#fbbf24', label: 'Sling-B' },
  custom:       { scale: 1.0, simScale: 1.65, primary: '#64748b', accent: '#94a3b8', label: 'Custom' },
};

export function getRobotVisualIdentity(chassisId) {
  const id = String(chassisId || 'crawler').toLowerCase();
  return ROBOT_VISUAL_IDENTITY[id] || ROBOT_VISUAL_IDENTITY.custom;
}

export function mergeRobotBuildConfig(config = {}) {
  const id = config.chassisId || config.chassisBuildKey || 'crawler';
  const vis = getRobotVisualIdentity(id);
  return {
    ...config,
    primaryColor: config.primaryColor || vis.primary,
    accentColor: config.accentColor || vis.accent,
    trimColor: config.trimColor || vis.accent,
    ledColor: config.ledColor || vis.accent,
  };
}

/** Apply bible scale + subtle emissive trim on robot root after buildSimRobot */
export function applyRobotVisualIdentity(robot, chassisId, context = {}) {
  if (!robot?.isObject3D) return;
  const vis = getRobotVisualIdentity(chassisId);
  const {
    flappyMode = false,
    footballMode = false,
    combatMode = false,
    raceMode = false,
  } = context;

  let simScale = vis.simScale;
  if (flappyMode) simScale = 1.15;
  else if (footballMode) simScale = 1.45;
  else if (combatMode) simScale = 1.0;
  else if (raceMode) simScale = 1.0;

  robot.scale.setScalar(simScale);
  robot.userData.visualIdentity = vis;

  const primary = new THREE.Color(vis.primary);
  const accent = new THREE.Color(vis.accent);
  robot.traverse((o) => {
    if (!o.isMesh || !o.material) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    mats.forEach((m) => {
      if (!m?.isMaterial) return;
      if (m.color && o.name?.toLowerCase().includes('wheel')) return;
      if (m.emissive) {
        m.emissive.lerp(accent, 0.08);
        m.emissiveIntensity = Math.max(m.emissiveIntensity || 0, 0.12);
      }
      if (m.color && o.userData?.isBody) m.color.lerp(primary, 0.15);
    });
  });
}

export function getCapstoneRobotScale(chassisId) {
  return getRobotVisualIdentity(chassisId).simScale * 1.02;
}
