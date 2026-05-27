/**
 * robotValidator.js
 * ByteBuddies Robot Validation Engine
 *
 * Pure logic — no UI. Call these functions from any component.
 * All messages are child-friendly (no stack traces, no technical jargon).
 */

export const SEV = { ERROR: 'error', WARN: 'warning', INFO: 'info', OK: 'ok' };

// ─── Robot config validator ─────────────────────────────────────────────────
export function validateRobot(robotConfig) {
  if (!robotConfig) return { valid: false, score: 0, results: [noConfig()] };
  const results = [];

  // ── Chassis ─────────────────────────────────────────────────────────────
  if (!robotConfig.chassisId) {
    results.push(e('NO_CHASSIS', 'chassis',
      "Your robot needs a body! Pick a chassis to get started."));
  } else {
    results.push(ok('CHASSIS_OK', 'chassis', `${robotConfig.chassisId} chassis selected ✓`));
  }

  // ── Movement ─────────────────────────────────────────────────────────────
  if (!robotConfig.movementId) {
    results.push(e('NO_MOVEMENT', 'movement',
      "Your robot can't move yet! Add wheels, tracks, legs, or a hover system."));
  } else {
    results.push(ok('MOVEMENT_OK', 'movement', `${robotConfig.movementId} movement ready ✓`));
  }

  // ── Power source ─────────────────────────────────────────────────────────
  if (!robotConfig.powerId) {
    results.push(w('NO_POWER', 'power',
      "Your robot has no power source — it won't run far! Add a battery or solar panel."));
  } else {
    results.push(ok('POWER_OK', 'power', `${robotConfig.powerId} power source installed ✓`));
  }

  // ── Flying without gyro ──────────────────────────────────────────────────
  if (['flying', 'jets'].includes(robotConfig.movementId)) {
    if (!robotConfig.sensors?.includes('gyro')) {
      results.push(i('FLY_NO_GYRO', 'sensors',
        "Flying robots balance better with a Gyro sensor! Try adding one."));
    }
  }

  // ── Heavy load check ─────────────────────────────────────────────────────
  const partCount = (robotConfig.sensors?.length || 0) + (robotConfig.tools?.length || 0);
  if (partCount > 5) {
    results.push(w('OVERLOADED', 'power',
      "Your robot is carrying a lot of parts! Make sure it has enough power."));
  }

  // ── Tool without arm ─────────────────────────────────────────────────────
  const armTools = ['grabber', 'claw', 'drill', 'saw'];
  const hasArmTool = robotConfig.tools?.some(t => armTools.includes(t));
  if (hasArmTool && !robotConfig.armId) {
    results.push(w('TOOL_NO_ARM', 'tools',
      "Your claw or drill works best attached to an arm! Try adding one in Build."));
  }

  // ── Sensor crowding warning ───────────────────────────────────────────────
  if ((robotConfig.tools?.length || 0) >= 2 && (robotConfig.sensors?.length || 0) >= 3) {
    results.push(i('CROWDED', 'sensors',
      "Your robot is very full! Some sensors may be blocked by other parts."));
  }

  // ── Compute health score ─────────────────────────────────────────────────
  const score = computeScore(robotConfig, results);

  return {
    valid: !results.some(r => r.severity === SEV.ERROR),
    score,
    results,
    summary: buildSummary(results),
  };
}

// ─── Code block validator ────────────────────────────────────────────────────
export function validateCode(codeBlocks, robotConfig) {
  if (!codeBlocks || codeBlocks.length === 0) {
    return {
      valid: true,
      results: [i('EMPTY_PROGRAM', 'code', "Your robot has no instructions yet. Add some blocks to the Code tab!")],
      invalidBlockIds: new Set(),
    };
  }

  const results = [];
  const invalidBlockIds = new Set();

  for (const block of codeBlocks) {
    const blockResults = validateBlock(block, robotConfig);
    for (const r of blockResults) {
      results.push(r);
      if (r.severity === SEV.ERROR && r.blockId !== undefined) {
        invalidBlockIds.add(r.blockId);
      }
    }
  }

  // ── Detect infinite loop (repeat_forever + no stop) ─────────────────────
  const hasForever = codeBlocks.some(b => b.id === 'repeat_forever');
  const hasStop    = codeBlocks.some(b => b.id === 'stop');
  if (hasForever && !hasStop) {
    results.push(w('INFINITE_LOOP', 'code',
      "Your program runs forever with no Stop! Consider adding a Stop block."));
  }

  // ── Detect movement-only program (no sensors for avoidance) ─────────────
  const hasMoveBlocks = codeBlocks.some(b => ['move_forward', 'move_backward'].includes(b.id));
  const hasSenseBlocks = codeBlocks.some(b => ['scan', 'if_obstacle', 'look', 'if_see_object'].includes(b.id));
  if (hasMoveBlocks && !hasSenseBlocks && (robotConfig?.sensors?.length || 0) > 0) {
    results.push(i('UNUSED_SENSORS', 'code',
      "Your robot has sensors but your program doesn't use them! Try a Scan or If-Obstacle block."));
  }

  return {
    valid: !results.some(r => r.severity === SEV.ERROR),
    results,
    invalidBlockIds,
  };
}

function validateBlock(block, robotConfig) {
  const results = [];
  const cfg = robotConfig || {};

  switch (block.id) {
    // Flying blocks
    case 'fly_up':
    case 'fly_down':
      if (!['flying', 'jets'].includes(cfg.movementId)) {
        results.push(e('CANT_FLY', 'code',
          `"${block.label}" won't work — your robot can't fly! Add Hover or Jets in Build.`,
          block.instanceId));
      }
      break;

    // Scan blocks
    case 'scan':
    case 'if_obstacle':
      if (!cfg.sensors?.some(s => ['ultrasonic', 'lidar'].includes(s))) {
        results.push(e('NO_SCAN_SENSOR', 'code',
          `"${block.label}" needs a Sonar or LIDAR sensor. Add one in Build!`,
          block.instanceId));
      }
      break;

    // Vision blocks
    case 'look':
    case 'if_see_object':
      if (!cfg.sensors?.includes('camera')) {
        results.push(e('NO_CAMERA', 'code',
          `"${block.label}" needs a Camera sensor. Add one in Build!`,
          block.instanceId));
      }
      break;

    // Grabber blocks
    case 'grab':
    case 'release':
      if (!cfg.tools?.some(t => ['grabber', 'claw'].includes(t))) {
        results.push(e('NO_GRABBER', 'code',
          `"${block.label}" needs a Grabber or Claw tool. Add one in Build!`,
          block.instanceId));
      }
      break;

    // Drill
    case 'drill':
      if (!cfg.tools?.includes('drill')) {
        results.push(e('NO_DRILL', 'code',
          '"Drill" needs a Drill tool. Add one in Build!',
          block.instanceId));
      }
      break;

    // Laser
    case 'fire_laser':
      if (!cfg.tools?.includes('laser')) {
        results.push(e('NO_LASER', 'code',
          '"Fire Laser" needs a Laser tool. Add one in Build!',
          block.instanceId));
      }
      break;

    // Light blocks
    case 'lights_on':
    case 'lights_off':
    case 'flash': {
      const lightIds = ['led-white', 'led-cyan', 'led-red', 'searchlight', 'strobes', 'ring'];
      if (!lightIds.includes(cfg.lightId)) {
        results.push(w('NO_LIGHTS', 'code',
          `"${block.label}" works best with LED lights. Add lights in Build!`,
          block.instanceId));
      }
      break;
    }

    // Movement blocks — need some movement system
    case 'move_forward':
    case 'move_backward':
    case 'turn_left':
    case 'turn_right':
    case 'spin':
      if (!cfg.movementId) {
        results.push(e('NO_MOVEMENT_SYSTEM', 'code',
          `"${block.label}" needs a movement system. Add wheels, tracks, or legs in Build!`,
          block.instanceId));
      }
      break;

    default:
      break;
  }

  return results;
}

// ─── Preflight check (robot + code combined) ────────────────────────────────
export function runPreflight(robotConfig, codeBlocks = []) {
  const robot = validateRobot(robotConfig);
  const code  = validateCode(codeBlocks, robotConfig);

  const allResults = [...robot.results, ...code.results].filter(
    r => r.severity !== SEV.OK
  );
  const errors   = allResults.filter(r => r.severity === SEV.ERROR);
  const warnings = allResults.filter(r => r.severity === SEV.WARN);
  const infos    = allResults.filter(r => r.severity === SEV.INFO);

  // Pre-flight checks displayed as a checklist
  const checks = buildPreflightChecklist(robotConfig, codeBlocks);

  return {
    canRun: errors.length === 0,
    errors,
    warnings,
    infos,
    allResults,
    checks,
    robotScore: robot.score,
    summary: robot.summary,
  };
}

function buildPreflightChecklist(robotConfig, codeBlocks) {
  const cfg = robotConfig || {};
  return [
    {
      label: 'Robot body',
      pass: !!cfg.chassisId,
      detail: cfg.chassisId ? `${cfg.chassisId} chassis` : 'No chassis selected',
    },
    {
      label: 'Movement system',
      pass: !!cfg.movementId,
      detail: cfg.movementId ? `${cfg.movementId} ready` : 'No movement selected',
    },
    {
      label: 'Power source',
      pass: !!cfg.powerId,
      detail: cfg.powerId ? `${cfg.powerId} installed` : 'No power source',
      warn: !cfg.powerId,
    },
    {
      label: 'Program loaded',
      pass: (codeBlocks || []).filter(b => b.id !== 'repeat').length > 0,
      detail: `${(codeBlocks || []).filter(b => b.id !== 'repeat').length} instruction blocks`,
      warn: (codeBlocks || []).filter(b => b.id !== 'repeat').length === 0,
    },
    {
      label: 'Code compatible with robot',
      pass: (() => {
        const v = validateCode(codeBlocks, robotConfig);
        return v.valid;
      })(),
      detail: (() => {
        const v = validateCode(codeBlocks, robotConfig);
        const errors = v.results.filter(r => r.severity === SEV.ERROR);
        return errors.length === 0 ? 'All blocks supported' : `${errors.length} block issues found`;
      })(),
    },
  ];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function e(code, area, message, blockId) {
  return { severity: SEV.ERROR, code, area, message, blockId };
}
function w(code, area, message, blockId) {
  return { severity: SEV.WARN, code, area, message, blockId };
}
function i(code, area, message) {
  return { severity: SEV.INFO, code, area, message };
}
function ok(code, area, message) {
  return { severity: SEV.OK, code, area, message };
}
function noConfig() {
  return e('NO_CONFIG', 'system', 'Robot configuration is missing.');
}

function buildSummary(results) {
  const errors   = results.filter(r => r.severity === SEV.ERROR).length;
  const warnings = results.filter(r => r.severity === SEV.WARN).length;
  if (errors > 0)   return { level: 'error',   label: `${errors} issue${errors > 1 ? 's' : ''} to fix` };
  if (warnings > 0) return { level: 'warning', label: `${warnings} tip${warnings > 1 ? 's' : ''}` };
  return { level: 'ok', label: 'Robot looks great!' };
}

function computeScore(robotConfig, results) {
  let score = 0;
  const cfg = robotConfig || {};
  if (cfg.chassisId)  score += 25;
  if (cfg.movementId) score += 25;
  if (cfg.powerId)    score += 15;
  if (cfg.headId)     score += 5;
  if (cfg.armId)      score += 5;
  if ((cfg.sensors?.length || 0) > 0) score += 15;
  if ((cfg.tools?.length   || 0) > 0) score += 5;
  if (cfg.lightId)    score += 5;
  // Penalty for errors
  const errors = results.filter(r => r.severity === SEV.ERROR).length;
  score = Math.max(0, score - errors * 10);
  return Math.min(score, 100);
}
