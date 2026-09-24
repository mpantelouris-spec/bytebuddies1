/**
 * Audit: every chassis gets 10 themed modes — non-car never on kart cup arenas.
 */
import { CHASSIS_DATA } from '../src/virtual-robot-designer/services/studio-robot-builder.js';
import { CHASSIS_ENVIRONMENT, KART_RACE_ARENA_TYPES } from '../src/virtual-robot-designer/data/robot-arena-config.js';
import { getCoursesForChassis } from '../src/virtual-robot-designer/data/chassis-game-modes.js';
import { isCarChassis } from '../src/virtual-robot-designer/data/car-racing-tracks.js';

const SKIP_FIGHT = new Set(['striker', 'blaster', 'ninja', 'berserker', 'tank', 'battlebot', 'footballbot']);

let failed = 0;

for (const ch of CHASSIS_DATA) {
  if (!CHASSIS_ENVIRONMENT[ch.id]) {
    console.error(`FAIL env map: ${ch.id}`);
    failed++;
  }

  const modes = getCoursesForChassis(ch.id, []);
  if (modes.length !== 10) {
    console.error(`FAIL mode count: ${ch.id} -> ${modes.length}`);
    failed++;
  }

  if (isCarChassis(ch.id)) continue;

  for (const m of modes) {
    if (m.linkedRaceCourse) {
      console.error(`FAIL race link: ${ch.id} mode ${m.modeIndex} ${m.id} -> ${m.linkedRaceCourse}`);
      failed++;
    }
    if (KART_RACE_ARENA_TYPES.has(m.arenaType)) {
      console.error(`FAIL kart arena: ${ch.id} mode ${m.modeIndex} ${m.id} -> ${m.arenaType}`);
      failed++;
    }
    if (ch.id === 'birdbot' && m.arenaType !== 'flappy_bird') {
      console.error(`FAIL flappy: ${m.id} -> ${m.arenaType}`);
      failed++;
    }
    if (SKIP_FIGHT.has(ch.id) && m.arenaType === 'robot_fight' && ch.id !== 'tank' && ch.id !== 'battlebot') {
      // fighters OK
    }
  }
}

if (failed) {
  console.error(`\n${failed} arena audit failure(s)`);
  process.exit(1);
}
console.log(`OK — ${CHASSIS_DATA.length} chassis arena audit`);
