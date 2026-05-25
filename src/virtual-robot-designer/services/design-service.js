import { migrateDesign } from '../config.js';
import { migrateAssembly } from '../services/assembly-service.js';

const CHASSIS_SPEED = {
  rover: 0, tank: -8, drone: 12, spider: -4, humanoid: -6, industrial: -12, racing: 15, exploration: 5, arm: -10,
  rescue: 2, utility: -5, cube: 0, circular: 3, scout: 10, combat: -10, forklift: -6, hauler: -14, mini: 8,
  mech: -18, amphibious: 4, hover_platform: 14,
  underwater: 3, animal_quad: 6, battle_bot: -5, companion: 2, transformer: 5, toy_frame: 8, sci_fi: 10, aero: 16,
};
const CHASSIS_WEIGHT = {
  rover: 0, tank: 12, drone: -8, spider: 2, humanoid: 5, industrial: 18, racing: -5, exploration: 3, arm: -6,
  rescue: 6, utility: 10, cube: 4, circular: 2, scout: -4, combat: 20, forklift: 14, hauler: 22, mini: -10,
  mech: 25, amphibious: 8, hover_platform: -6,
  underwater: 6, animal_quad: 0, battle_bot: 16, companion: -4, transformer: 4, toy_frame: -6, sci_fi: 2, aero: -8,
};

export function computeDesignStats(design) {
  const d = migrateDesign(design);
  const asm = migrateAssembly(d);
  const chassisType = asm.base?.chassisType || d.chassis?.type || 'rover';
  const wheelCount = d.wheels?.count ?? 4;
  const motorBonus = { weak: -20, medium: 0, strong: 15, turbo: 30 };
  const wheelPenalty = { standard: 0, mecanum: -5, tracks: -12, legs: -25, hover: -8 };
  const sizeMod = { tiny: -10, small: -5, medium: 0, large: 10 };
  const motorPow = motorBonus[d.wheels?.motor] ?? 0;
  const wheelPen = wheelPenalty[d.wheels?.type] ?? 0;
  const sizeM = sizeMod[d.chassis?.size] ?? 0;
  const scaleMod = ((asm.base?.scale ?? 1) - 1) * 12;
  const sensorCount = countActiveSensors(d);
  const toolCount = countActiveTools(d);
  const abilityCount = countActiveAbilities(d);
  const slotCount = Object.values(asm.slots || {}).filter(Boolean).length;

  let speed = 55 + motorPow + wheelPen - sizeM * 0.5 - sensorCount * 2;
  speed += (CHASSIS_SPEED[chassisType] ?? 0);
  speed += Math.min(6, Math.max(-4, (wheelCount - 4) * -1.5));
  if (d.abilities?.speedBoost) speed += 15;
  if (d.abilities?.chaosMode) speed += 8;

  let power = 50 + motorPow * 0.8 + toolCount * 5 + slotCount * 2;
  if (d.abilities?.superStrength) power += 12;

  let agility = 60 - sizeM - Math.abs(wheelPen) * 0.5 - scaleMod * 0.4;
  agility += wheelCount >= 6 ? 8 : wheelCount <= 2 ? -6 : 0;
  if (d.abilities?.timeSlow) agility += 10;

  let weightVal = 30 + sizeM * 2 + sensorCount * 3 + toolCount * 8 + scaleMod;
  weightVal += (CHASSIS_WEIGHT[chassisType] ?? 0);
  weightVal += Math.max(0, (wheelCount - 4) * 2);
  if (d.chassis?.material === 'metal' || asm.base?.material === 'metal') weightVal += 8;

  let battery = 80 - sensorCount * 5 - abilityCount * 5 - slotCount * 2;
  battery -= (d.wheels?.motor === 'turbo' ? 20 : d.wheels?.motor === 'strong' ? 8 : 0);
  if (d.cosmetics?.accentLights) battery -= 3;

  const topSpeedMs = +(speed / 40).toFixed(1);
  const runtimeHours = +((battery / 100) * 3.2).toFixed(1);
  const loadCapacity = Math.max(1, Math.round(12 - weightVal * 0.08));

  return {
    speed: clamp(speed),
    power: clamp(power),
    agility: clamp(agility),
    weight: clamp(weightVal),
    battery: clamp(battery),
    sensorCount,
    toolCount,
    abilityCount,
    topSpeedMs,
    runtimeHours,
    loadCapacity,
    stability: clamp(agility + (wheelCount >= 6 ? 10 : 0) - (weightVal > 70 ? 15 : 0)),
  };
}

function clamp(n) {
  return Math.min(100, Math.max(5, Math.round(n)));
}

export function countActiveSensors(d) {
  return Object.entries(d.sensors || {}).filter(([, v]) => v === true).length;
}

export function countActiveTools(d) {
  const t = d.tools || {};
  let n = 0;
  if (t.grabber && t.grabber !== 'none') n++;
  if (t.shooter && t.shooter !== 'none') n++;
  if (t.pusher && t.pusher !== 'none') n++;
  if (t.other && t.other !== 'none') n++;
  Object.keys(t).forEach((k) => {
    if (['grabber', 'shooter', 'pusher', 'other'].includes(k)) return;
    if (t[k] === true) n++;
  });
  return n;
}

export function countActiveAbilities(d) {
  return Object.values(d.abilities || {}).filter(Boolean).length;
}

export function statBarColor(stat, value) {
  if (stat === 'speed' || stat === 'agility') {
    if (value >= 70) return '#00FF41';
    if (value >= 45) return '#fbbf24';
    return '#ef4444';
  }
  if (stat === 'power') {
    if (value >= 65) return '#00FF41';
    if (value >= 40) return '#fbbf24';
    return '#ef4444';
  }
  if (stat === 'weight') {
    if (value >= 25 && value <= 55) return '#00FF41';
    if (value <= 70) return '#fbbf24';
    return '#ef4444';
  }
  if (stat === 'battery') {
    if (value >= 55) return '#00FF41';
    if (value >= 35) return '#fbbf24';
    return '#ef4444';
  }
  return '#8B00FF';
}

export function getBalanceStatus(stats) {
  const { speed, power, agility, weight, battery } = stats;
  if (weight > 75) return { label: '⚠️ TOO HEAVY', color: '#ef4444' };
  if (weight < 15) return { label: '⚠️ TOO LIGHT', color: '#fbbf24' };
  if (battery < 25) return { label: '⚠️ LOW BATTERY', color: '#ef4444' };
  if (speed > 90 && agility < 40) return { label: '⚡ SPEEDY BUT WOBBLY', color: '#fbbf24' };
  const spread = Math.max(speed, power, agility) - Math.min(speed, power, agility);
  if (spread < 35) return { label: '✅ BALANCED', color: '#00FF41' };
  return { label: '✓ READY TO BUILD', color: '#00D4FF' };
}

/** Friendly stats messages for primary students */
export function getKidBalanceStatus(stats) {
  const { speed, agility, weight, battery } = stats;
  if (battery < 25) {
    return { emoji: '🔋', label: 'Needs more battery!', color: '#fbbf24', tip: 'Try fewer parts or a smaller size.' };
  }
  if (weight > 78) {
    return { emoji: '💪', label: 'Super strong!', color: '#00FF41', tip: 'Your robot is tough — great for pushing things!' };
  }
  if (speed > 85 && agility < 45) {
    return { emoji: '🏎️', label: 'Super fast!', color: '#00D4FF', tip: 'Fast robot — test it in the simulator!' };
  }
  if (speed > 70 && agility > 55) {
    return { emoji: '🌟', label: 'Awesome robot!', color: '#00FF41', tip: 'Ready to code and test!' };
  }
  const spread = Math.max(speed, agility) - Math.min(speed, agility);
  if (spread < 30) {
    return { emoji: '✅', label: 'Perfect balance!', color: '#00FF41', tip: 'Great job — try the simulator next!' };
  }
  return { emoji: '🤖', label: 'Looking good!', color: '#00D4FF', tip: 'Keep adding parts or test your robot!' };
}

export function applyVariantMods(base, mods) {
  const next = migrateDesign(base);
  if (mods.chassis) next.chassis = { ...next.chassis, ...mods.chassis };
  if (mods.wheels) next.wheels = { ...next.wheels, ...mods.wheels };
  if (mods.sensors) next.sensors = { ...next.sensors, ...mods.sensors };
  if (mods.tools) next.tools = { ...next.tools, ...mods.tools };
  if (mods.abilities) next.abilities = { ...next.abilities, ...mods.abilities };
  if (mods.cosmetics) next.cosmetics = { ...next.cosmetics, ...mods.cosmetics };
  if (mods.template) next.template = mods.template;
  return next;
}

export function buildRichVariants(baseDesign) {
  const base = migrateDesign(baseDesign);
  const baseStats = computeDesignStats(base);
  const defs = [
    {
      variant_name: '⚡ SPEED DEMON',
      personality: 'Zippy, brave, always rushing. Excels on track courses. Crashes into obstacles. Zero patience.',
      useCase: '🏁 Racing · ⚡ Speed tests · 🎯 Quick missions',
      coolness: 5,
      changes: ['8 ultra-thin wheels', 'Turbo motor (200 spd)', '50% lighter chassis', 'Racing stripes', 'Speed Boost ability'],
      mods: { wheels: { ...base.wheels, count: 8, motor: 'turbo', size: 'small', type: 'standard' }, chassis: { ...base.chassis, size: 'small', color: '#FF006E', pattern: 'stripes' }, abilities: { ...base.abilities, speedBoost: true } },
    },
    {
      variant_name: '🦾 MEGA CLAW MONSTER',
      personality: 'Slow but unstoppable. Loves grabbing things. Gentle giant energy.',
      useCase: '🦾 Grab challenges · 📦 Delivery missions',
      coolness: 5,
      changes: ['Tank treads', 'Mega claw grabber', 'Large metal chassis', 'Strong motors'],
      mods: { wheels: { ...base.wheels, type: 'tracks', motor: 'strong', size: 'large' }, chassis: { ...base.chassis, size: 'large', material: 'metal', color: '#00FF41' }, tools: { ...base.tools, grabber: 'mega', megaClaw: true, longArm: true } },
    },
    {
      variant_name: '👁️ SURVEILLANCE MONSTER',
      personality: 'Sees everything. Paranoid. Never blinks.',
      useCase: '🔍 Scout · 🗺️ Mapping · 👀 Stealth watch',
      coolness: 4,
      changes: ['360° camera', 'LIDAR + ultrasonic', 'Night vision', 'All motion sensors'],
      mods: { sensors: { camera: true, camera360: true, lidar: true, ultrasonic: true, nightVision: true, gyroscope: true, accelerometer: true, thermal: true }, chassis: { ...base.chassis, color: '#8B00FF' } },
    },
    {
      variant_name: '🛡️ TANK WARRIOR',
      personality: 'Heavy, proud, unstoppable. Bulldozes through problems.',
      useCase: '⚔️ Battle arena · 🧱 Obstacle smash · 💪 Sumo',
      coolness: 5,
      changes: ['Tank treads', 'Bulldozer blade', 'Force field', 'Metal armor'],
      mods: { wheels: { ...base.wheels, type: 'tracks', motor: 'strong' }, chassis: { ...base.chassis, size: 'large', material: 'metal', color: '#64748b' }, tools: { ...base.tools, pusher: 'bulldozer', bulldozer: true }, abilities: { ...base.abilities, forceField: true } },
    },
    {
      variant_name: '🌀 CHAOS SPINNER',
      personality: 'Unpredictable. Laughs at physics. Students love it.',
      useCase: '🎲 Fun demos · 🌪️ Chaos mode · 🎪 Show-off',
      coolness: 5,
      changes: ['Mecanum wheels', 'ALL abilities ON', 'Circular chassis', 'Laser cannon + flamethrower'],
      mods: { wheels: { ...base.wheels, type: 'mecanum', motor: 'turbo' }, chassis: { ...base.chassis, shape: 'circular', color: '#00D4FF' }, abilities: { speedBoost: true, stealth: true, regeneration: true, forceField: true, chaosMode: true }, tools: { ...base.tools, laser: true, flamethrower: true } },
    },
  ];
  return defs.map((def, i) => {
    const merged = applyVariantMods(base, def.mods);
    const stats = computeDesignStats(merged);
    return {
      id: `var-${Date.now()}-${i}`,
      variant_name: def.variant_name,
      personality: def.personality,
      useCase: def.useCase,
      coolness: def.coolness,
      changes: def.changes,
      modifications: def.mods,
      robot_config: merged,
      statComparison: {
        speed: { from: baseStats.speed, to: stats.speed },
        power: { from: baseStats.power, to: stats.power },
        agility: { from: baseStats.agility, to: stats.agility },
        battery: { from: baseStats.battery, to: stats.battery },
      },
    };
  });
}

export function buildDemoProgram(design) {
  const d = migrateDesign(design);
  const stats = computeDesignStats(d);
  const steps = [];
  const forwardAmount = Math.round(40 + stats.speed * 0.4);
  const turnDeg = Math.round(30 + stats.agility * 0.3);
  steps.push({ id: 'forward', params: { amount: forwardAmount } });
  if (d.abilities?.chaosMode) {
    steps.push({ id: 'left', params: { degrees: 180 } });
  }
  steps.push({ id: 'left', params: { degrees: turnDeg } });
  steps.push({ id: 'forward', params: { amount: forwardAmount * 0.7 } });
  if (d.sensors?.ultrasonic) steps.push({ id: 'wait', params: { secs: 0.5 } });
  steps.push({ id: 'right', params: { degrees: turnDeg } });
  steps.push({ id: 'forward', params: { amount: forwardAmount * 0.5 } });
  if (d.abilities?.speedBoost) steps.push({ id: 'forward', params: { amount: forwardAmount } });
  steps.push({ id: 'stop', params: {} });
  return steps;
}

export function checkAchievements(stats, dbStats) {
  const unlocked = [];
  const maxSpeed = Math.max(dbStats.max_speed || 0, stats.speed);
  if (maxSpeed >= 90) unlocked.push('speed_demon');
  if ((dbStats.designs_created || 0) >= 1) unlocked.push('first_design');
  if ((dbStats.designs_created || 0) >= 5) unlocked.push('designer');
  if ((dbStats.variants_generated || 0) >= 5) unlocked.push('variant_maker');
  if ((dbStats.simulations_run || 0) >= 10) unlocked.push('sim_tester');
  if ((dbStats.designs_shared || 0) >= 5) unlocked.push('social');
  if ((dbStats.likes_received || 0) >= 50) unlocked.push('liked');
  return unlocked;
}
