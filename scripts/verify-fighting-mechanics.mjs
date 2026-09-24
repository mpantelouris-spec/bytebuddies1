/**
 * Verify Mortal Kombat 11 style fighting mechanics.
 */
import {
  MOVES, resolveMove, getAttackTiming, framesToSeconds,
  attackBlockedByGuard, getComboDamageScale, FIGHT_HEALTH, MK_MAX_COMBO, IMPACT,
} from '../src/virtual-robot-designer/data/fighting-boxing-mechanics.js';

const errors = [];

['high_punch', 'low_punch', 'high_kick', 'low_kick', 'heavy_punch', 'heavy_kick', 'throw', 'energy_bolt'].forEach((id) => {
  const m = MOVES[id];
  if (!m) errors.push(`Missing MK move: ${id}`);
  else if (m.startup > 10) errors.push(`${id} startup too slow for MK`);
});

const hp = MOVES.high_punch;
if (hp.startup !== 2) errors.push(`High punch should be 2f startup, got ${hp.startup}`);
if (hp.damage !== 5) errors.push(`High punch damage should be 5, got ${hp.damage}`);
if (hp.startup + hp.active + hp.recovery !== 9) errors.push('High punch should total 9 frames');

if (IMPACT.BLOCK_REDUCTION !== 0.3) errors.push('MK block should pass 30% chip damage');
if (getComboDamageScale(1) !== 0.8) errors.push('MK 2nd hit should be 80%');
if (getComboDamageScale(3) !== 0.7) errors.push('MK 4th hit should be 70%');
if (MK_MAX_COMBO !== 7) errors.push('MK max combo should be 7');

if (!attackBlockedByGuard(MOVES.high_punch, 'back', false)) errors.push('Hold-back should block high punch');
if (attackBlockedByGuard(MOVES.throw, 'back', false)) errors.push('Throw should be unblockable');

if (resolveMove('jab')?.id !== 'high_punch') errors.push('jab alias should map to high_punch');
if (resolveMove('cross')?.id !== 'heavy_punch') errors.push('cross alias should map to heavy_punch');

if (FIGHT_HEALTH !== 1000) errors.push('Health should be 1000');

if (errors.length) {
  console.error('MK mechanics verification FAILED:');
  errors.forEach((e) => console.error('  -', e));
  process.exit(1);
}

console.log('MK mechanics verification OK');
console.log(`  High Punch: ${hp.startup + hp.active + hp.recovery}f (${framesToSeconds(9).toFixed(3)}s), ${hp.damage} dmg`);
console.log(`  Block chip: ${IMPACT.BLOCK_REDUCTION * 100}% damage passes`);
console.log(`  Max combo: ${MK_MAX_COMBO} hits`);
