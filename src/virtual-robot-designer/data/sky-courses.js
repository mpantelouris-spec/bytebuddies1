/**
 * Sky courses for the Robot Studio flyers (Drone, Racing Drone, Jet Explorer).
 *
 * Every course is written as the block program that flies it. The rings are
 * placed on the exact path that program flies (same maths as the simulator),
 * so every course can be solved with the blocks kids have, and the starter
 * script is simply the first part of that program.
 *
 * Program tokens: U8 = Fly up 8, D4 = Fly down 4, F2 = Fly forward 2,
 * R90 / L90 = Bank right / left 90°, A = the mission's action block.
 */

// Same numbers as the simulator (LiveLabPage: MOVE_STEP_SIZE × aerialStepMul, bank_right)
export const SKY_STEP = 2.4 * 5.5;          // one Fly forward step
export const SKY_BANK_DIST = SKY_STEP * 0.55; // distance flown while banking
export const SKY_SPAWN_Y = 3;

const C = (program, theme, extra = {}) => ({ program, theme, ...extra });

export const SKY_COURSES = {
  drone: [
    C('U8 F2 R30 F2 F2', 'meadow'),
    C('U8 F2 A R90 F2 A L90 F2 A', 'meadow', { balloons: true }),
    C('U8 F2 U4 F2 D4 F2', 'rainbow'),
    C('U8 F2 A U5 R45 F2 A U5 L90 F2 A', 'skyislands'),
    C('U10 F2 R45 F2 A L90 F2 A R45 F1 A', 'snow'),
    C('U8 F1 A F1 R90 F1 A F1 L90 F1 A F1 A', 'savanna'),
    C('U8 F1 R45 F1 L90 F1 R90 F1 L45 F2', 'meadow', { windsocks: true }),
    C('U8 F1 A R90 F1 A L90 F1 A L90 F1 A', 'festival'),
    C('U8 F2 U6 F1 R90 F2 L90 F2 D4 F1', 'space'),
    C('U8 F2 R90 F1 A U5 L90 F2 A U5 F1 R90 F1 A U5 L90 F1 A', 'airshow'),
  ],
  racedrone: [
    C('U6 F2 L30 F2 F2', 'neon'),
    C('U6 F2 R90 F2 R90 F2', 'stadium'),
    C('U6 F1 R45 F1 L90 F1 R90 F1 L90 F1 R45 F1', 'forest'),
    C('U4 F2 R45 F2 L90 F2 R45 F2', 'canyon'),
    C('U14 F2 A U4 F2 A U4 R60 F2 A', 'city'),
    C('U6 F3 L30 F3 R30 F2', 'beach'),
    C('U10 F2 U6 R60 F2 L60 D6 F2 U4 F1', 'snow'),
    C('U6 F2 L90 F1 L90 F2 R90 F1 R90 F2', 'harbour'),
    C('U12 F2 R45 F2 L45 U6 F2 D6 F2', 'volcano'),
    C('U6 F2 R90 F2 U5 R90 F2 L90 D5 F2 L90 F1', 'stadium', { grandPrix: true }),
  ],
  jetplane: [
    C('U6 F2 U4 F2 R30 F2', 'ocean', { carrier: true }),
    C('U10 F3 R30 F2 L60 F2', 'skyislands'),
    C('U6 F2 R45 F2 L90 F2 R45 F2', 'canyon'),
    C('U8 F2 F2 F2', 'saltflat'),
    C('U8 F2 R90 F2 R90 F2', 'arctic'),
    C('U14 F2 L45 F2 R90 F2 L45 F1', 'volcano'),
    C('U8 F2 R90 F1 R90 F2 U4 L90 F1 L90 F2', 'airshow'),
    C('U10 F2 L60 F2 R60 F2 R60 F1', 'neon'),
    C('U8 F4 R30 F3', 'ocean'),
    C('U8 F2 R90 F2 U6 L90 F2 L90 F1 D6 R90 F2', 'airshow', { finale: true }),
  ],
};

import { SKY_TIER_COURSES } from './tier-levels/sky-tiers.js';

export function hasSkyCourse(chassisId) {
  return Boolean(SKY_COURSES[chassisId]);
}

export function getSkyCourse(chassisId, modeIndex = 1) {
  const list = SKY_COURSES[chassisId];
  if (!list) return null;
  // Modes 11–50: the tier courses (data/tier-levels/sky-tiers.js)
  const tier = Number(modeIndex) > 10 ? SKY_TIER_COURSES[chassisId]?.[Number(modeIndex) - 11] : null;
  if (tier) return { ...tier, mode: tier.mode, tokens: tier.program.split(/\s+/) };
  const mode = Math.max(1, Math.min(list.length, Math.floor(Number(modeIndex) || 1)));
  return { ...list[mode - 1], mode, tokens: list[mode - 1].program.split(/\s+/) };
}

const parse = (tok) => ({ op: tok[0], n: Number(tok.slice(1)) || 0 });

/**
 * Fly the program and return the path. Points carry `kind` so the builder knows
 * where rings (middle of each forward step) and stations (where A happens) go.
 */
export function flySkyProgram(tokens, { x = 0, z = 0, y = SKY_SPAWN_Y, angle = Math.PI } = {}) {
  const path = [{ x, y, z, angle }];
  const rings = [];
  const stations = [];
  const push = () => path.push({ x, y, z, angle });
  tokens.forEach((tok) => {
    const { op, n } = parse(tok);
    if (op === 'U' || op === 'D') {
      const target = y + (op === 'U' ? n : -n);
      for (let i = 1; i <= 8; i++) { y += (target - y) / (9 - i); push(); }
      y = target;
    } else if (op === 'F') {
      const sub = 24 * n;
      for (let i = 1; i <= sub; i++) {
        x += Math.sin(angle) * (SKY_STEP / 24);
        z += Math.cos(angle) * (SKY_STEP / 24);
        push();
        if (i % 24 === 12) rings.push({ x, y, z, angle });
      }
    } else if (op === 'R' || op === 'L') {
      const sub = Math.max(6, Math.round(n / 5));
      const dA = ((op === 'R' ? -1 : 1) * n * Math.PI) / 180 / sub;
      for (let i = 1; i <= sub; i++) {
        angle += dA;
        x += Math.sin(angle) * (SKY_BANK_DIST / sub);
        z += Math.cos(angle) * (SKY_BANK_DIST / sub);
        push();
      }
    } else if (op === 'A') {
      stations.push({ x, y, z, angle });
    }
  });
  return { path, rings, stations, end: { x, y, z, angle } };
}

/** Evenly keep at most `max` items (rings read best as a short, clear line). */
export function thinRings(rings, max = 8) {
  if (rings.length <= max) return rings;
  return Array.from({ length: max }, (_, i) => rings[Math.round((i * (rings.length - 1)) / (max - 1))]);
}

const ACTION_LABEL = {
  drop_package: 'Drop package', take_photo: 'Take photo', light_up: 'Light up', land: 'Land',
};

/**
 * Starter blocks: the first part of the course program. Kids finish the rest.
 * Mode 1 leaves out one block ("add one movement block"), later modes leave more.
 */
export function getSkyStarterScript(chassisId, modeIndex = 1, actionId = null) {
  const course = getSkyCourse(chassisId, modeIndex);
  if (!course) return null;
  const b = (id, label, paramValues = {}) => ({ id, label, paramValues });
  let drop = course.drop ?? (course.mode <= 3 ? 1 : course.mode <= 7 ? 2 : 3);
  // Local testing only: start with the whole solution so a run can be checked end to end
  try { if (typeof window !== 'undefined' && window.__bbSkyFullSolution) drop = 0; } catch { /* ignore */ }
  // Leave out the last `drop` movement blocks (and anything after them)
  const moves = course.tokens.map((t, i) => (t[0] !== 'A' ? i : -1)).filter((i) => i > 0);
  const cut = drop && moves.length > drop ? moves[moves.length - drop] : course.tokens.length;
  const blocks = course.tokens.slice(0, cut).map((tok) => {
    const { op, n } = parse(tok);
    if (op === 'U') return b('fly_up', 'Fly up', { height: n });
    if (op === 'D') return b('fly_down', 'Fly down', { height: n });
    if (op === 'F') return b('fly_forward', 'Fly forward', { steps: n });
    if (op === 'R') return b('bank_right', 'Bank right', { degrees: n });
    if (op === 'L') return b('bank_left', 'Bank left', { degrees: n });
    if (op === 'A' && actionId) return b(actionId, ACTION_LABEL[actionId] || 'Action');
    return null;
  }).filter(Boolean);
  return [b('when_start', 'When START clicked'), ...blocks, b('hover_hold', 'Hover', { seconds: 1 })];
}
