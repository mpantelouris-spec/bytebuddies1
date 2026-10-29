/**
 * Sea courses for the Sub Drone. Same idea as sky-courses.js: each mission is
 * the block program that swims it, and the rings / stations sit on that path.
 *
 * Tokens: D2 = Dive 2 (down to 2 deep, at most 2.5 per block), F2 = Swim forward 2,
 * R90 / L90 = Turn right / left 90°, A = the mission's action block.
 */

export const SEA_STEP = 2.4 * 5.5;   // one Swim forward step (the sea is built like the sky worlds)
export const SEA_SPAWN_Y = 0;

const C = (program, theme, extra = {}) => ({ program, theme, ...extra });

export const SEA_COURSES = {
  submarine: [
    C('D2 F2 A R90 F2 A L90 F2 A', 'reef'),
    C('D2 F2 R90 F1 L90 F2 L90 F1 R90 F1', 'kelp'),
    C('D2 F2 L45 F2 R45 F2', 'turtle'),
    C('D3 F1 A F1 R90 F1 A F1 L90 F1 A', 'wreck'),
    C('D2 F1 A R90 F1 A L90 F1 A', 'cave'),
    C('D2 F3 D4 F2 R90 F1', 'current'),
    C('D3 F1 A R90 F1 A L90 F1 A L90 F1 A', 'treasure'),
    C('D2 F1 A F1 A R90 F1 A R90 F1 A', 'cleanup'),
    C('D3 F2 A R90 F1 A L90 F1 A F1 A', 'vents'),
    C('D2 F2 R90 F2 D4 L90 F2 L90 F1 R90 F2', 'finale'),
  ],
};

import { SEA_TIER_COURSES } from './tier-levels/sea-tiers.js';

export function hasSeaCourse(chassisId) {
  return Boolean(SEA_COURSES[chassisId]);
}

export function getSeaCourse(chassisId, modeIndex = 1) {
  const list = SEA_COURSES[chassisId];
  if (!list) return null;
  // Modes 11–50: the tier courses (data/tier-levels/sea-tiers.js)
  const tier = Number(modeIndex) > 10 ? SEA_TIER_COURSES[chassisId]?.[Number(modeIndex) - 11] : null;
  if (tier) return { ...tier, mode: tier.mode, tokens: tier.program.split(/\s+/) };
  const mode = Math.max(1, Math.min(list.length, Math.floor(Number(modeIndex) || 1)));
  return { ...list[mode - 1], mode, tokens: list[mode - 1].program.split(/\s+/) };
}

const parse = (tok) => ({ op: tok[0], n: Number(tok.slice(1)) || 0 });

/** Swim the program (same maths as the simulator) and return the path, rings and stations. */
export function swimSeaProgram(tokens, { x = 0, z = 0, y = SEA_SPAWN_Y, angle = Math.PI } = {}) {
  const path = [{ x, y, z, angle }];
  const rings = []; const stations = [];
  const push = () => path.push({ x, y, z, angle });
  tokens.forEach((tok) => {
    const { op, n } = parse(tok);
    if (op === 'D') {
      const target = Math.max(-n, y - 2.5);
      for (let i = 1; i <= 8; i++) { y += (target - y) / (9 - i); push(); }
      y = target;
    } else if (op === 'F') {
      const sub = 24 * n;
      for (let i = 1; i <= sub; i++) {
        x += Math.sin(angle) * (SEA_STEP / 24); z += Math.cos(angle) * (SEA_STEP / 24); push();
        if (i % 24 === 12) rings.push({ x, y, z, angle });
      }
    } else if (op === 'R' || op === 'L') {
      angle += ((op === 'R' ? -1 : 1) * n * Math.PI) / 180; push();
    } else if (op === 'A') {
      stations.push({ x, y, z, angle });
    }
  });
  return { path, rings, stations, end: { x, y, z, angle } };
}

const ACTION_LABEL = { scan_here: 'Scan here', pick_up: 'Pick up', light_up: 'Light up' };

/** Starter blocks: the first part of the program. Kids finish the rest. */
export function getSeaStarterScript(chassisId, modeIndex = 1, actionId = null) {
  const course = getSeaCourse(chassisId, modeIndex);
  if (!course) return null;
  const b = (id, label, paramValues = {}) => ({ id, label, paramValues });
  let drop = course.drop ?? (course.mode <= 3 ? 1 : course.mode <= 7 ? 2 : 3);
  try { if (typeof window !== 'undefined' && window.__bbSeaFullSolution) drop = 0; } catch { /* ignore */ }
  const moves = course.tokens.map((t, i) => (t[0] !== 'A' ? i : -1)).filter((i) => i > 0);
  const cut = drop && moves.length > drop ? moves[moves.length - drop] : course.tokens.length;
  const blocks = course.tokens.slice(0, cut).map((tok) => {
    const { op, n } = parse(tok);
    if (op === 'D') return b('dive_deep', 'Dive', { depth: n });
    if (op === 'F') return b('swim_forward', 'Swim forward', { steps: n });
    if (op === 'R') return b('turn_right', 'Turn right', { degrees: n });
    if (op === 'L') return b('turn_left', 'Turn left', { degrees: n });
    if (op === 'A' && actionId) return b(actionId, ACTION_LABEL[actionId] || 'Action');
    return null;
  }).filter(Boolean);
  return [b('when_start', 'When START clicked'), ...blocks, b('sonar_ping', 'Sonar scan')];
}
