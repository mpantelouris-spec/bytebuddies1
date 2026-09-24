/**
 * Smoke test — fighting script compile + combat engine punches land in range.
 */
import { FIGHTING_STARTER_SCRIPT } from '../src/virtual-robot-designer/data/fighting-blocks.js';
import { compileFightingScratchScript } from '../src/virtual-robot-designer/data/fighting-block-runtime.js';
import { createCombatEngine } from '../src/virtual-robot-designer/studio/fighting-combat-engine.js';

const prog = compileFightingScratchScript(FIGHTING_STARTER_SCRIPT);
console.log('tickLoops:', prog.tickLoops.length);
console.log('forever body ops:', prog.tickLoops[0]?.body?.map((b) => b.op).join(' → '));

if (prog.tickLoops.length !== 1) {
  console.error('FAIL: expected 1 tick loop, got', prog.tickLoops.length);
  process.exit(1);
}

const body = prog.tickLoops[0].body || [];
const hasClose = body.some((b) => b.op === 'if_enemy_close' && b.body?.some((x) => x.op === 'jab'));
if (!hasClose) {
  console.error('FAIL: if_enemy_close should contain jab');
  process.exit(1);
}

const challenge = { fightMode: 'training', enemyType: 'dummy', enemyHp: 999 };
const combat = createCombatEngine({ challenge, playerArchetype: 'striker', enemyKey: 'dummy' });
const s0 = combat.getState();
console.log('start distance:', s0.distance?.toFixed(2), 'm');

if (s0.distance > 3) {
  console.error('FAIL: fighters start too far apart:', s0.distance);
  process.exit(1);
}

// Simulate jabs with frame ticks (impact frames are scheduled, not instant)
for (let i = 0; i < 20; i++) {
  combat.doAction('jab');
  for (let f = 0; f < 40; f++) combat.tick(1 / 60);
}
const s1 = combat.getState();
console.log('after 20 jabs — training hits:', s1.trainingHits, 'enemyHp:', s1.enemyHp);

if (s1.trainingHits < 5) {
  console.error('FAIL: jabs should register training hits in range');
  process.exit(1);
}

console.log('OK — fighting combat smoke test passed');
