/**
 * Verify combat fighters keep spec PBR materials after art-direction passes.
 */
import { buildCombatFighterMesh } from '../src/virtual-robot-designer/services/studio-robot-builder.js';
import { stylizeMeshMaterials, prepareCombatFighter } from '../src/virtual-robot-designer/services/art-direction.js';

function findCoreEmissive(mesh) {
  let max = 0;
  mesh.traverse((o) => {
    if (!o.isMesh || !o.material) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    mats.forEach((m) => {
      if (m.emissiveIntensity > max) max = m.emissiveIntensity;
    });
  });
  return max;
}

function findBodyMetalness(mesh) {
  let metalness = 0;
  mesh.traverse((o) => {
    if (!o.isMesh || !o.material) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    mats.forEach((m) => {
      if (m.isMeshStandardMaterial && m.metalness > metalness) metalness = m.metalness;
    });
  });
  return metalness;
}

const striker = buildCombatFighterMesh('striker');
const dummy = buildCombatFighterMesh('dummy');

const strikerCoreBefore = findCoreEmissive(striker);
const strikerMetalBefore = findBodyMetalness(striker);

prepareCombatFighter(striker);
stylizeMeshMaterials(striker, { keepEmissive: true });

const strikerCoreAfter = findCoreEmissive(striker);
const strikerMetalAfter = findBodyMetalness(striker);

const errors = [];

if (!striker.userData.combatPBR) errors.push('Striker missing combatPBR tag');
if (!dummy.userData.isFighterHumanoid) errors.push('Dummy missing isFighterHumanoid tag');
if (strikerCoreBefore < 2.5) errors.push(`Striker core emissive too low before stylize: ${strikerCoreBefore}`);
if (strikerCoreAfter < 2.5) errors.push(`Striker core emissive destroyed by stylize: ${strikerCoreAfter} (was ${strikerCoreBefore})`);
if (strikerMetalAfter < 0.5) errors.push(`Striker metalness destroyed: ${strikerMetalAfter} (was ${strikerMetalBefore})`);

if (errors.length) {
  console.error('Fighting scene verification FAILED:');
  errors.forEach((e) => console.error('  -', e));
  process.exit(1);
}

console.log('Fighting scene verification OK');
console.log(`  Striker core emissive: ${strikerCoreAfter} (preserved from ${strikerCoreBefore})`);
console.log(`  Striker body metalness: ${strikerMetalAfter} (preserved from ${strikerMetalBefore})`);
console.log(`  Dummy variant: ${dummy.name}`);
