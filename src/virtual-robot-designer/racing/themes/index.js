/** Kart track themes 11–19 — each replaces the base biome scenery around the race curve. */
import { createThemeContext, hideBaseWorld } from './RaceThemeCore.js';
import { buildNeonNitroNights } from './NeonNitroNights.js';
import { buildDesertDuneDrift } from './DesertDuneDrift.js';
import { buildHauntedHollowGP } from './HauntedHollowGP.js';
import { buildCoralCircuit } from './CoralCircuit.js';
import { buildBambooThunderRally } from './BambooThunderRally.js';
import { buildMeteorMineMadness } from './MeteorMineMadness.js';
import { buildPinwheelPlazaSprint } from './PinwheelPlazaSprint.js';
import { buildGlacialGorgeGP } from './GlacialGorgeGP.js';
import { buildSafariStampedeCup } from './SafariStampedeCup.js';

const BUILDERS = {
  neon_nitro_nights: buildNeonNitroNights,
  desert_dune_drift: buildDesertDuneDrift,
  haunted_hollow_gp: buildHauntedHollowGP,
  coral_circuit: buildCoralCircuit,
  bamboo_thunder_rally: buildBambooThunderRally,
  meteor_mine_madness: buildMeteorMineMadness,
  pinwheel_plaza_sprint: buildPinwheelPlazaSprint,
  glacial_gorge_gp: buildGlacialGorgeGP,
  safari_stampede_cup: buildSafariStampedeCup,
};

export function hasRaceTheme(id) {
  return Boolean(id && BUILDERS[id]);
}

export function installRaceTheme(scene, curve, id, opts = {}) {
  const build = BUILDERS[id];
  if (!build) return null;
  hideBaseWorld(scene);
  const ctx = createThemeContext(scene, curve, { ...opts, seed: id.length * 7919 });
  build(ctx);
  ctx.finish();
  scene.userData.racePresentation = id;
  scene.userData.raceThemeId = id;
  console.log('[RaceTheme] installed', id, { lap: Math.round(ctx.len), objects: ctx.root.children.length });
  return ctx.root;
}
