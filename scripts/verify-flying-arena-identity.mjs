/**
 * Ensures 9 flyers × 10 missions have unique locked vistas and FlyingArenaKit wiring.
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  FLYER_VISUAL_BIBLES,
  getFlyingArenaContract,
  getFlyingModeRecipe,
  resolveFlyingChassisId,
  FLYING_ARENA_SPEC_VERSION,
} from '../src/virtual-robot-designer/studio/aerial-world/FlyingArenaSpec.js';
import { applyFlyingRecipeContract } from '../src/virtual-robot-designer/studio/aerial-world/FlyingArenaKit.js';
import { getAerialRecipe, isAerialArenaType } from '../src/virtual-robot-designer/studio/aerial-world/AerialCourseRecipes.js';
import { CHASSIS_MODE_MAP } from '../src/virtual-robot-designer/data/chassis-game-modes.js';

const __dir = dirname(fileURLToPath(import.meta.url));
const kitSrc = readFileSync(join(__dir, '../src/virtual-robot-designer/studio/aerial-world/FlyingArenaKit.js'), 'utf8');
const worldSrc = readFileSync(join(__dir, '../src/virtual-robot-designer/studio/aerial-world/AerialWorldKit.js'), 'utf8');
const modesSrc = readFileSync(join(__dir, '../src/virtual-robot-designer/data/chassis-game-modes.js'), 'utf8');

const flyers = Object.keys(FLYER_VISUAL_BIBLES);
const vistas = new Set(flyers.map((id) => FLYER_VISUAL_BIBLES[id].aerialVista));
const skies = new Set(flyers.map((id) => FLYER_VISUAL_BIBLES[id].sky.top));

let fail = 0;
const err = (msg) => { console.error('FAIL:', msg); fail++; };

if (flyers.length !== 9) err(`expected 9 flyers, got ${flyers.length}`);
if (vistas.size !== 9) err(`aerialVista must be unique per flyer, got ${vistas.size}`);
if (skies.size < 8) err(`sky.top palettes too similar across flyers ${skies.size}`);
if (!kitSrc.includes('installFlyingVistaLayer')) err('installFlyingVistaLayer missing in FlyingArenaKit');
if (!kitSrc.includes('worldAt')) err('worldAt curve-relative vista helper missing');
if (!kitSrc.includes('installFlyingModeScenery')) err('installFlyingModeScenery missing');
if (!kitSrc.includes('installFlyingArenaIdentity')) err('installFlyingArenaIdentity missing');
if (worldSrc.includes('installAerialMissionComposition(scene, curve, flyingComposition')) {
  err('flying robots still use generic mission composition');
}
if (!worldSrc.includes('resolveFlyingChassisId')) err('resolveFlyingChassisId missing in AerialWorldKit');
if (worldSrc.includes('flyingContract.useReferenceVista) {\n      installAerialReferenceVista')) {
  err('flying contract must not stack legacy reference vista');
}
if (resolveFlyingChassisId({ id: 'jetplane_supersonic_dogfight' }) !== 'jetplane') {
  err('resolveFlyingChassisId must infer jetplane from mission id');
}

for (const chassisId of flyers) {
  const contract = getFlyingArenaContract({ chassisId, modeIndex: 1, arenaType: 'drone_canyon' });
  const recipe = applyFlyingRecipeContract(getAerialRecipe('canyon_flight'), contract);
  if (recipe.aerialVista !== contract.bible.aerialVista) err(`${chassisId} recipe vista not locked`);
  if (recipe.sky.top !== contract.bible.sky.top) err(`${chassisId} sky not locked to bible`);
  if (chassisId !== 'drone' && recipe.hero) err(`${chassisId} should not inherit recipe hero landmarks`);
  if (recipe.islandScatter?.length) err(`${chassisId} should not scatter citadel islands`);
  if (chassisId === 'jetplane' && !contract.useReferenceVista) err('jetplane must use reference vista');
  if (chassisId === 'helicopter' && contract.bible.aerialVista !== 'venetian_midnight_canal') err('helicopter vista');
  if (chassisId === 'racedrone' && contract.bible.aerialVista !== 'neon_server_necropolis') err('racedrone vista');
  if (chassisId === 'hoverracer' && contract.bible.aerialVista !== 'quantum_reactor_core') err('hoverracer vista');
  if (chassisId === 'rescuedrone' && contract.bible.aerialVista !== 'bioluminescent_trench') err('rescuedrone vista');
  if (chassisId === 'drone' && contract.bible.aerialVista !== 'gothic_clockwork_spire') err('drone vista');
  const hoverM10 = getFlyingArenaContract({ chassisId: 'hoverbot', modeIndex: 10 });
  if (hoverM10.bible.aerialVista !== 'victorian_grand_library') err('hoverbot mode 10 must use victorian library');
}

const recipeSets = new Map();
for (const chassisId of flyers) {
  const recipes = [];
  for (let mode = 1; mode <= 10; mode++) {
    const contract = getFlyingArenaContract({ chassisId, modeIndex: mode });
    const recipeId = contract.arenaType;
    if (!isAerialArenaType(recipeId)) err(`${chassisId} mode ${mode} arenaType ${recipeId} not aerial`);
    recipes.push(recipeId);
  }
  if (new Set(recipes).size !== 10) err(`${chassisId} must use 10 distinct spline recipes, got ${new Set(recipes).size}`);
  recipeSets.set(chassisId, recipes);
}

for (const chassisId of flyers) {
  const modeIds = CHASSIS_MODE_MAP[chassisId] || [];
  if (modeIds.length !== 10) err(`${chassisId} CHASSIS_MODE_MAP must have 10 modes, got ${modeIds.length}`);
  for (let i = 0; i < modeIds.length; i++) {
    const id = modeIds[i];
    const blockRe = new RegExp(`"${id}"\\s*:\\s*\\{([\\s\\S]*?)\\n  \\},`);
    const block = modesSrc.match(blockRe)?.[1] || '';
    const physics = block.match(/"physics":\s*"([^"]+)"/)?.[1];
    const env = block.match(/"environmentId":\s*"([^"]+)"/)?.[1];
    const expectedRecipe = getFlyingModeRecipe(chassisId, i + 1);
    const arenaType = block.match(/"arenaType":\s*"([^"]+)"/)?.[1];
    if (chassisId === 'rescuedrone' && physics !== 'flight_3dof') err(`${id} must use flight_3dof, got ${physics}`);
    if (chassisId === 'rescuedrone' && env !== 'sky_aerial') err(`${id} must use sky_aerial env`);
    if (['drone', 'helicopter', 'hoverbot', 'jetplane', 'steathjet', 'aerobat'].includes(chassisId) && physics !== 'flight_3dof') {
      err(`${id} expected flight_3dof, got ${physics}`);
    }
    if (['racedrone', 'hoverracer'].includes(chassisId) && physics !== 'hybrid') {
      err(`${id} expected hybrid physics, got ${physics}`);
    }
    if (arenaType !== expectedRecipe) err(`${id} arenaType ${arenaType} != bible recipe ${expectedRecipe}`);
  }
}

if (fail) {
  console.error(`\n${fail} flying arena check(s) failed`);
  process.exit(1);
}

console.log('PASS flying arena identity', FLYING_ARENA_SPEC_VERSION, {
  flyers: flyers.length,
  missions: flyers.length * 10,
  uniqueVistas: vistas.size,
  uniqueSkyTops: skies.size,
});
