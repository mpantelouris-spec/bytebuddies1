/**
 * PremiumTrackWorlds.js — 10 brand-new CodeRacer premium track worlds (spec-driven).
 */
import { placeAtTrack } from '../GameWorldBuilder.js';
import { getTrackStandard } from './CodeRacerTrackStandards.js';
import { placeCheckpointArches, placeBoostPads } from './BiomeHeroShared.js';
import { buildWideCheckeredStart } from './SunsetCoastHeroKit.js';
import {
  tierN,
  PREMIUM_PALETTES,
  installPremiumSky,
  buildFacetedCrystal,
  buildCrystalArch,
  buildTitleBillboard,
  buildNeonBillboard,
  buildCyberBuilding,
  buildTrackLamps,
  buildGiantTree,
  buildTwistedTree,
  buildMazeWalls,
  buildLavaShaderRiver,
  buildBasaltColumns,
  buildSandstonePillars,
  buildSparkleParticles,
  buildColoredParticles,
  buildRainLines,
  buildIcicles,
  buildFloatingPlatforms,
  animatePremiumProps,
} from './PremiumTrackKit.js';

function place(curve, t, side, yOff = 0) {
  return placeAtTrack(curve, t, side, yOff);
}

function installCrystalPalace01(world, scene, curve, hw, bounds, finishT, tier, arenaType) {
  const pal = PREMIUM_PALETTES.crystal_palace_01;
  installPremiumSky(scene, pal, tier, arenaType);
  const title = buildTitleBillboard('CRYSTAL PALACE', 0x7cfc00, 0x00ff88, 18, 5);
  const tp = place(curve, finishT + 0.04, 0, 16);
  title.position.copy(tp.pos);
  title.rotation.y = tp.frame.rot ?? 0;
  world.add(title);
  const arch = buildCrystalArch(12, 15);
  const ap = place(curve, finishT + 0.05, 0, 0);
  arch.position.copy(ap.pos);
  world.add(arch);
  const crystals = tierN(tier, 15, 10, 5);
  for (let i = 0; i < crystals; i++) {
    const c = buildFacetedCrystal(0.9 + (i % 4) * 0.4, i % 2 ? 0xe0ffff : 0x00ff88);
    const pp = place(curve, (finishT + 0.1 + i / crystals * 0.8) % 1, (i % 2 ? 1 : -1) * (hw + 10), 0);
    c.position.copy(pp.pos);
    world.add(c);
  }
  world.add(buildSparkleParticles(tierN(tier, 300, 180, 80), bounds, 0xffffff));
  world.add(buildWideCheckeredStart(curve, hw, finishT));
}

function installCyberBoulevard01(world, scene, curve, hw, bounds, finishT, tier, arenaType) {
  const pal = PREMIUM_PALETTES.cyber_boulevard_01;
  installPremiumSky(scene, pal, tier, arenaType);
  const billboard = buildNeonBillboard('CYBER GP', 8, 6);
  const bp = place(curve, finishT + 0.06, 0, 12);
  billboard.position.copy(bp.pos);
  billboard.rotation.y = bp.frame.rot ?? 0;
  world.add(billboard);
  const towers = tierN(tier, 12, 8, 4);
  for (let i = 0; i < towers; i++) {
    const b = buildCyberBuilding(24 + (i % 5) * 7);
    const pp = place(curve, (i + 0.3) / towers, (i % 2 ? 1 : -1) * (hw + 18), 0);
    b.position.copy(pp.pos);
    world.add(b);
  }
  world.add(buildTrackLamps(curve, hw, finishT, tierN(tier, 20, 14, 8)));
  world.add(buildRainLines(tierN(tier, 280, 160, 70)));
  world.add(buildWideCheckeredStart(curve, hw, finishT));
}

function installForestMaze01(world, scene, curve, hw, bounds, finishT, tier, arenaType) {
  const pal = PREMIUM_PALETTES.forest_maze_01;
  installPremiumSky(scene, pal, tier, arenaType);
  const trees = tierN(tier, 8, 5, 3);
  for (let i = 0; i < trees; i++) {
    const tree = buildGiantTree(0.9 + (i % 2) * 0.12);
    const pp = place(curve, (finishT + i / trees * 0.9) % 1, (i % 2 ? 1 : -1) * (hw + 14), 0);
    tree.position.copy(pp.pos);
    world.add(tree);
  }
  world.add(buildMazeWalls(curve, hw, finishT, tierN(tier, 80, 50, 25)));
  world.add(buildColoredParticles(tierN(tier, 150, 90, 40), bounds, 0x2ecc71, 'leaf-particles', 0.08));
  world.add(buildWideCheckeredStart(curve, hw, finishT));
}

function installVolcanoCanyon01(world, scene, curve, hw, bounds, finishT, tier, arenaType) {
  const pal = PREMIUM_PALETTES.volcano_canyon_01;
  installPremiumSky(scene, pal, tier, arenaType);
  const lava = buildLavaShaderRiver(80, hw * 5);
  const lp = place(curve, finishT + 0.35, hw + 14, -0.3);
  lava.position.copy(lp.pos);
  lava.rotation.y = lp.frame.rot ?? 0;
  world.add(lava);
  world.add(buildBasaltColumns(tierN(tier, 10, 7, 4), curve, hw, finishT));
  world.add(buildColoredParticles(tierN(tier, 200, 120, 50), bounds, 0xff6b1a, 'ember-particles', 0.15));
  world.add(buildWideCheckeredStart(curve, hw, finishT));
}

function installIceCavern01(world, scene, curve, hw, bounds, finishT, tier, arenaType) {
  const pal = PREMIUM_PALETTES.ice_cavern_01;
  installPremiumSky(scene, pal, tier, arenaType);
  for (let i = 0; i < tierN(tier, 12, 8, 4); i++) {
    const ice = buildFacetedCrystal(1.0 + (i % 3) * 0.35, 0xb8ddf0);
    const pp = place(curve, (finishT + i / 12) % 1, (i % 2 ? 1 : -1) * (hw + 9), 0);
    ice.position.copy(pp.pos);
    world.add(ice);
  }
  world.add(buildIcicles(curve, hw, finishT, tierN(tier, 14, 8, 4)));
  world.add(buildSparkleParticles(tierN(tier, 220, 120, 50), bounds, 0xe8f4ff));
  world.add(buildWideCheckeredStart(curve, hw, finishT));
}

function installUnderwaterTemple01(world, scene, curve, hw, bounds, finishT, tier, arenaType) {
  const pal = PREMIUM_PALETTES.underwater_temple_01;
  installPremiumSky(scene, pal, tier, arenaType);
  const arch = buildCrystalArch(11, 13);
  arch.position.set(bounds.cx, 0, bounds.cz + 18);
  world.add(arch);
  for (let i = 0; i < tierN(tier, 10, 6, 3); i++) {
    const coral = buildFacetedCrystal(0.75, 0x40e0d0);
    const pp = place(curve, (finishT + i / 10) % 1, (i % 2 ? 1 : -1) * (hw + 8), 0);
    coral.position.copy(pp.pos);
    world.add(coral);
  }
  world.add(buildColoredParticles(tierN(tier, 160, 90, 40), bounds, 0x88ddff, 'bubble-particles', 0.12));
  world.add(buildWideCheckeredStart(curve, hw, finishT));
}

function installSkyIsland01(world, scene, curve, hw, bounds, finishT, tier, arenaType) {
  const pal = PREMIUM_PALETTES.sky_island_01;
  installPremiumSky(scene, pal, tier, arenaType);
  world.add(buildFloatingPlatforms(curve, finishT, tierN(tier, 8, 5, 3)));
  const flower = buildFacetedCrystal(2.0, 0xff69b4);
  const fp = place(curve, finishT + 0.1, 0, 14);
  flower.position.copy(fp.pos);
  world.add(flower);
  world.add(buildSparkleParticles(tierN(tier, 200, 110, 45), bounds, 0xffd700));
  world.add(buildWideCheckeredStart(curve, hw, finishT));
}

function installDesertDunes01(world, scene, curve, hw, bounds, finishT, tier, arenaType) {
  const pal = PREMIUM_PALETTES.desert_dunes_01;
  installPremiumSky(scene, pal, tier, arenaType);
  world.add(buildSandstonePillars(tierN(tier, 8, 5, 3), curve, hw, finishT));
  world.add(buildColoredParticles(tierN(tier, 120, 70, 30), bounds, 0xffcc66, 'sand-particles', 0.1));
  world.add(buildWideCheckeredStart(curve, hw, finishT));
}

function installMoonlightCavern01(world, scene, curve, hw, bounds, finishT, tier, arenaType) {
  const pal = PREMIUM_PALETTES.moonlight_cavern_01;
  installPremiumSky(scene, pal, tier, arenaType);
  world.add(buildCrystalArch(13, 14));
  for (let i = 0; i < tierN(tier, 12, 8, 4); i++) {
    const ore = buildFacetedCrystal(1.1, 0xaa44ff);
    const pp = place(curve, (finishT + i / 12) % 1, (i % 2 ? 1 : -1) * (hw + 9), 0);
    ore.position.copy(pp.pos);
    world.add(ore);
  }
  world.add(buildColoredParticles(tierN(tier, 240, 140, 60), bounds, 0xff88ff, 'spore-particles', 0.14));
  world.add(buildWideCheckeredStart(curve, hw, finishT));
}

function installMagicForest01(world, scene, curve, hw, bounds, finishT, tier, arenaType) {
  const pal = PREMIUM_PALETTES.magic_forest_01;
  installPremiumSky(scene, pal, tier, arenaType);
  for (let i = 0; i < tierN(tier, 8, 5, 3); i++) {
    const tree = buildTwistedTree(0.85 + (i % 2) * 0.1);
    const pp = place(curve, (finishT + i / 8) % 1, (i % 2 ? 1 : -1) * (hw + 11), 0);
    tree.position.copy(pp.pos);
    world.add(tree);
  }
  world.add(buildSparkleParticles(tierN(tier, 220, 130, 55), bounds, 0xffd700));
  world.add(buildWideCheckeredStart(curve, hw, finishT));
}

const INSTALLERS = {
  crystal_palace_01: installCrystalPalace01,
  cyber_boulevard_01: installCyberBoulevard01,
  forest_maze_01: installForestMaze01,
  volcano_canyon_01: installVolcanoCanyon01,
  ice_cavern_01: installIceCavern01,
  underwater_temple_01: installUnderwaterTemple01,
  sky_island_01: installSkyIsland01,
  desert_dunes_01: installDesertDunes01,
  moonlight_cavern_01: installMoonlightCavern01,
  magic_forest_01: installMagicForest01,
};

export function installPremiumTrackWorld(world, scene, curve, hw, bounds, arenaType, finishT, spec, tier = 'medium') {
  if (scene.userData.useReferenceBackdrop) return;
  const fn = INSTALLERS[arenaType];
  if (!fn) return;
  fn(world, scene, curve, hw, bounds, finishT, tier, arenaType);
  const std = getTrackStandard(arenaType);
  if (std?.checkpointTs?.length) {
    placeCheckpointArches(world, curve, hw, std.checkpointTs, std.checkpointColors);
  }
  if (std?.boostTs?.length) placeBoostPads(world, curve, std.boostTs);
}

export function animatePremiumWorld(world, time) {
  animatePremiumProps(world, time);
}
