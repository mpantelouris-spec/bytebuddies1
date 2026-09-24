/**
 * IllustratedTrackWorlds.js — 10 premium illustrated CodeRacer tracks (spec-driven).
 */
import * as THREE from 'three';
import { placeAtTrack } from '../GameWorldBuilder.js';
import { buildAAAParticles } from './BiomeAAAKit.js';
import { getTrackStandard } from './CodeRacerTrackStandards.js';
import { placeCheckpointArches, placeBoostPads } from './BiomeHeroShared.js';
import { buildWideCheckeredStart } from './SunsetCoastHeroKit.js';
import {
  buildGiantPinkFlower,
  buildFloatingIslandDetailed,
  buildRopeBridge,
  buildCloudLayerBelow,
  buildMushroomGrove,
  buildGoldRails,
} from './SkyGardenHeroKit.js';
import { buildHoloBillboard, buildSkyscraper } from './CyberCityHeroKit.js';
import { buildLavaRiver, buildCalderaBackdrop } from './VolcanoHeroKit.js';
import { buildSkiLodge, buildSnowPine } from './FrostPeakHeroKit.js';
import { buildGiantCrystalCluster, buildCavernSparkles } from './CrystalCavernHeroKit.js';
import { buildPalmTree } from './biome-world-kit.js';
import { buildWindmillLandmark } from './MeadowHeroKit.js';
import { buildTempleGate, buildRuinsRopeBridge } from './RuinsHeroKit.js';
import { buildNeonRingGate, buildAsteroidPlatform } from './GalaxyHeroKit.js';
import {
  ILLUSTRATED_PALETTES,
  tierN,
  installIllustratedLighting,
  installIllustratedSky,
  buildIllustratedMushroom,
  buildIllustratedWaterfall,
  buildParallaxHills,
  buildNeonTunnelSegment,
  animateIllustratedProps,
  illMat,
} from './IllustratedTrackKit.js';

function place(world, curve, t, side, yOff = 0) {
  const { pos, frame } = placeAtTrack(curve, t, side, yOff);
  return { pos, frame };
}

function installGarden01(world, scene, curve, hw, bounds, finishT, tier) {
  const pal = ILLUSTRATED_PALETTES.sky_island_01;
  installIllustratedSky(scene, bounds, pal, tier);
  installIllustratedLighting(scene, bounds, pal, tier);
  world.add(buildCloudLayerBelow(bounds));

  const mainIsland = buildFloatingIslandDetailed(tierN(tier, 14, 11, 8));
  mainIsland.position.set(bounds.cx, -4, bounds.cz);
  world.add(mainIsland);

  const secondIsland = buildFloatingIslandDetailed(tierN(tier, 9, 7, 5));
  const pBridge = place(curve, (finishT + 0.38) % 1, hw + 22, -6);
  secondIsland.position.copy(pBridge.pos);
  secondIsland.position.y = -8;
  world.add(secondIsland);

  const heroFlower = buildGiantPinkFlower(1.05);
  heroFlower.name = 'hero-giant-flower';
  const fp = place(curve, finishT + 0.06, -(hw + 14), 0);
  heroFlower.position.copy(fp.pos);
  heroFlower.rotation.y = (fp.frame.rot ?? 0) + 0.15;
  world.add(heroFlower);

  const mushCount = tierN(tier, 6, 4, 2);
  const capColors = [0xff0000, 0x8a2be2, 0x3498db, 0xff69b4, 0x9b59b6, 0x00ced1];
  for (let i = 0; i < mushCount; i++) {
    const t = (finishT + 0.18 + (i / mushCount) * 0.22) % 1;
    const side = i % 2 ? hw + 9 : -(hw + 9);
    const mush = buildIllustratedMushroom(capColors[i % capColors.length], 0.9 + (i % 2) * 0.2);
    const mp = place(curve, t, side, 0);
    mush.position.copy(mp.pos);
    world.add(mush);
  }

  const bridge = buildRopeBridge(40);
  const bp = place(curve, (finishT + 0.32) % 1, 0, 0);
  bridge.position.copy(bp.pos);
  bridge.rotation.y = bp.frame.rot ?? 0;
  world.add(bridge);

  const waterfall = buildIllustratedWaterfall(8, 14);
  const wp = place(curve, (finishT + 0.48) % 1, hw + 12, 0);
  waterfall.position.copy(wp.pos);
  world.add(waterfall);

  world.add(buildGoldRails(curve, hw, 0.85));
  world.add(buildWideCheckeredStart(curve, finishT, hw));
  buildAAAParticles(world, ['petals', 'mist'], bounds, tierN(tier, 0.35, 0.22, 0.1));
  world.userData.worldStory = 'Enchanted Garden — flower entrance, mushroom grove, rope bridge, waterfall loop';
}

function installArcadeCity01(world, scene, curve, hw, bounds, finishT, tier) {
  const pal = ILLUSTRATED_PALETTES.cyber_boulevard_01;
  installIllustratedSky(scene, bounds, pal, tier);
  installIllustratedLighting(scene, bounds, pal, tier);
  world.add(buildParallaxHills(bounds, 0x001533, -15, tierN(tier, 5, 3, 2)));

  const billboard = buildHoloBillboard('ARCADE GP');
  const bp = place(curve, finishT + 0.07, 0, 14);
  billboard.position.copy(bp.pos);
  billboard.rotation.y = bp.frame.rot ?? 0;
  world.add(billboard);

  const tunnel = buildNeonTunnelSegment(38, tier);
  const tp = place(curve, (finishT + 0.22) % 1, 0, 0);
  tunnel.position.copy(tp.pos);
  tunnel.rotation.y = tp.frame.rot ?? 0;
  world.add(tunnel);

  const towers = tierN(tier, 14, 8, 4);
  for (let i = 0; i < towers; i++) {
    const t = (i + 0.5) / towers;
    const tower = buildSkyscraper(22 + (i % 4) * 6, i % 2 ? 0xff00ff : 0x00ffff);
    const pp = place(curve, t, (i % 2 ? 1 : -1) * (hw + 16), 0);
    tower.position.copy(pp.pos);
    world.add(tower);
  }
  buildAAAParticles(world, ['rain', 'neon-sparks'], bounds, tierN(tier, 0.4, 0.25, 0.12));
  world.userData.worldStory = 'Neon Arcade City — ARCADE GP hologram, LED tunnel, sky highway';
}

function installCavern01(world, scene, curve, hw, bounds, finishT, tier) {
  const pal = ILLUSTRATED_PALETTES.crystal_palace_01;
  scene.background = new THREE.Color(0x030408);
  scene.fog = new THREE.FogExp2(pal.fog, 0.011);
  installIllustratedLighting(scene, bounds, pal, tier);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(bounds.spanX * 2.5, bounds.spanZ * 2.5),
    illMat(0x060408, { emi: 0.35, roughness: 0.08, metalness: 0.9 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(bounds.cx, -0.8, bounds.cz);
  world.add(floor);

  const pillar = buildGiantCrystalCluster(2.2);
  pillar.position.set(bounds.cx, 0, bounds.cz);
  world.add(pillar);

  const clusters = tierN(tier, 8, 5, 3);
  for (let i = 0; i < clusters; i++) {
    const c = buildGiantCrystalCluster(1.2 + (i % 2) * 0.3);
    const t = (finishT + 0.1 + i * 0.11) % 1;
    const pp = place(curve, t, (i % 2 ? 1 : -1) * (hw + 10), 0);
    c.position.copy(pp.pos);
    world.add(c);
  }
  world.add(buildCavernSparkles(bounds, tierN(tier, 400, 180, 60)));
  world.userData.worldStory = 'Crystal Cavern — quartz pillar cathedral, crystal maze, glass bridge';
}

function installBeach01(world, scene, curve, hw, bounds, finishT, tier) {
  const pal = ILLUSTRATED_PALETTES.desert_dunes_01;
  installIllustratedSky(scene, bounds, pal, tier);
  installIllustratedLighting(scene, bounds, pal, tier);

  const ocean = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 500),
    illMat(0x00ced1, { emi: 0.25, roughness: 0.05, metalness: 0.4 }),
  );
  ocean.rotation.x = -Math.PI / 2;
  ocean.position.set(bounds.cx + 70, -1.5, bounds.cz);
  world.add(ocean);

  const palms = tierN(tier, 12, 8, 4);
  for (let i = 0; i < palms; i++) {
    const palm = buildPalmTree(0.85 + (i % 3) * 0.15);
    const pp = place(curve, (finishT + i / palms) % 1, hw + 10 + (i % 2) * 4, 0);
    palm.position.copy(pp.pos);
    world.add(palm);
  }

  const arch = new THREE.Group();
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(7, 0.8, 8, 32),
    illMat(0xff6b9d, { emi: 0.6 }),
  );
  ring.rotation.y = Math.PI / 2;
  ring.position.y = 7;
  arch.add(ring);
  const ap = place(curve, (finishT + 0.38) % 1, 0, 0);
  arch.position.copy(ap.pos);
  arch.rotation.y = ap.frame.rot ?? 0;
  world.add(arch);

  buildAAAParticles(world, ['mist', 'sand'], bounds, tierN(tier, 0.3, 0.18, 0.08));
  world.userData.worldStory = 'Sunset Beach — pier start, coral arch hairpin, dune jump';
}

function installVolcano01(world, scene, curve, hw, bounds, finishT, tier) {
  const pal = ILLUSTRATED_PALETTES.volcano_canyon_01;
  installIllustratedSky(scene, bounds, pal, tier);
  installIllustratedLighting(scene, bounds, pal, tier);
  world.add(buildCalderaBackdrop());
  const lava = buildLavaRiver(55);
  lava.position.set(bounds.cx + hw + 8, 0, bounds.cz);
  world.add(lava);
  buildAAAParticles(world, ['embers', 'ash'], bounds, tierN(tier, 0.45, 0.28, 0.12));
  world.userData.worldStory = 'Volcanic Inferno — lava-edge straight, basalt bridge, ash tunnel';
}

function installMountain01(world, scene, curve, hw, bounds, finishT, tier) {
  const pal = ILLUSTRATED_PALETTES.ice_cavern_01;
  installIllustratedSky(scene, bounds, pal, tier);
  installIllustratedLighting(scene, bounds, pal, tier);

  const lodge = buildSkiLodge();
  const lp = place(curve, finishT + 0.05, hw + 16, 0);
  lodge.position.copy(lp.pos);
  world.add(lodge);

  const windmill = buildWindmillLandmark();
  const wp = place(curve, (finishT + 0.12) % 1, -(hw + 18), 0);
  windmill.position.copy(wp.pos);
  world.add(windmill);

  const pines = tierN(tier, 10, 6, 4);
  for (let i = 0; i < pines; i++) {
    const pine = buildSnowPine(0.75 + (i % 3) * 0.15);
    const pp = place(curve, (finishT + i / pines) % 1, (i % 2 ? 1 : -1) * (hw + 7), 0);
    pine.position.copy(pp.pos);
    world.add(pine);
  }
  buildAAAParticles(world, ['snow'], bounds, tierN(tier, 0.4, 0.25, 0.1));
  world.userData.worldStory = 'Frost Peak — lodge start, pine slalom, frozen lake, snow jump';
}

function installRuins01(world, scene, curve, hw, bounds, finishT, tier) {
  const pal = ILLUSTRATED_PALETTES.underwater_temple_01;
  installIllustratedSky(scene, bounds, pal, tier);
  installIllustratedLighting(scene, bounds, pal, tier);

  const gate = buildTempleGate();
  const gp = place(curve, finishT + 0.08, 0, 0);
  gate.position.copy(gp.pos);
  gate.rotation.y = gp.frame.rot ?? 0;
  world.add(gate);

  const bridge = buildRuinsRopeBridge(28);
  const bp = place(curve, (finishT + 0.52) % 1, 0, 0);
  bridge.position.copy(bp.pos);
  bridge.rotation.y = bp.frame.rot ?? 0;
  world.add(bridge);

  const wf = buildIllustratedWaterfall(5, 12);
  const wp = place(curve, (finishT + 0.55) % 1, hw + 10, 0);
  wf.position.copy(wp.pos);
  world.add(wf);

  buildAAAParticles(world, ['mist', 'leaves'], bounds, tierN(tier, 0.35, 0.2, 0.1));
  world.userData.worldStory = 'Jungle Ruins — temple gate, firefly tunnel, waterfall bridge';
}

function installCyberDowntown01(world, scene, curve, hw, bounds, finishT, tier) {
  const pal = ILLUSTRATED_PALETTES.cyber_boulevard_01;
  installIllustratedSky(scene, bounds, pal, tier);
  installIllustratedLighting(scene, bounds, pal, tier);

  const billboard = buildHoloBillboard('CYBER GRAND PRIX');
  const bp = place(curve, finishT + 0.07, 0, 15);
  billboard.position.copy(bp.pos);
  billboard.rotation.y = bp.frame.rot ?? 0;
  world.add(billboard);

  const tunnel = buildNeonTunnelSegment(36, tier);
  const tp = place(curve, (finishT + 0.24) % 1, 0, 0);
  tunnel.position.copy(tp.pos);
  tunnel.rotation.y = tp.frame.rot ?? 0;
  world.add(tunnel);

  for (let i = 0; i < tierN(tier, 12, 7, 4); i++) {
    const tower = buildSkyscraper(20 + (i % 3) * 5, 0x00bfff);
    const pp = place(curve, (i + 0.3) / 12, (i % 2 ? 1 : -1) * (hw + 14), 0);
    tower.position.copy(pp.pos);
    world.add(tower);
  }
  buildAAAParticles(world, ['rain', 'steam'], bounds, tierN(tier, 0.38, 0.22, 0.1));
  world.userData.worldStory = 'Cyber Downtown — CYBER GRAND PRIX, neon tunnel, sky highway';
}

function installMushroomForest01(world, scene, curve, hw, bounds, finishT, tier) {
  const pal = ILLUSTRATED_PALETTES.forest_maze_01;
  installIllustratedSky(scene, bounds, pal, tier);
  installIllustratedLighting(scene, bounds, pal, tier);

  const ring = tierN(tier, 8, 6, 4);
  for (let i = 0; i < ring; i++) {
    const angle = (i / ring) * Math.PI * 2;
    const mush = buildIllustratedMushroom(i % 2 ? 0xff0000 : 0x8a2be2, 1.1);
    mush.position.set(bounds.cx + Math.cos(angle) * 18, 0, bounds.cz + Math.sin(angle) * 18);
    world.add(mush);
  }

  const center = buildIllustratedMushroom(0x00bfff, 1.35);
  const cp = place(curve, finishT + 0.06, 0, 0);
  center.position.copy(cp.pos);
  world.add(center);

  const slalom = tierN(tier, 10, 6, 4);
  for (let i = 0; i < slalom; i++) {
    const grove = buildMushroomGrove();
    const pp = place(curve, (finishT + 0.2 + i / slalom * 0.5) % 1, (i % 2 ? 1 : -1) * (hw + 6), 0);
    grove.position.copy(pp.pos);
    grove.scale.setScalar(0.85);
    world.add(grove);
  }
  buildAAAParticles(world, ['mist', 'pollen'], bounds, tierN(tier, 0.32, 0.2, 0.1));
  world.userData.worldStory = 'Mushroom Forest — toadstool circle, red slalom, purple grove';
}

function installSpaceDrift01(world, scene, curve, hw, bounds, finishT, tier) {
  const pal = ILLUSTRATED_PALETTES.moonlight_cavern_01;
  installIllustratedSky(scene, bounds, pal, tier);
  installIllustratedLighting(scene, bounds, pal, tier);

  const ring = buildNeonRingGate(tierN(tier, 15, 12, 8));
  const rp = place(curve, finishT + 0.08, 0, 12);
  ring.position.copy(rp.pos);
  ring.rotation.y = rp.frame.rot ?? 0;
  world.add(ring);

  const platforms = tierN(tier, 6, 4, 2);
  for (let i = 0; i < platforms; i++) {
    const plat = buildAsteroidPlatform(3 + (i % 2));
    const pp = place(curve, (finishT + 0.15 + i * 0.12) % 1, (i % 2 ? 1 : -1) * (hw + 12), 0);
    plat.position.copy(pp.pos);
    world.add(plat);
  }
  buildAAAParticles(world, ['stardust', 'comet'], bounds, tierN(tier, 0.35, 0.2, 0.08));
  world.userData.worldStory = 'Space Drift — neon ring gate, asteroid jump, nebula tunnel';
}

const INSTALLERS = {
  sky_island_01: installGarden01,
  cyber_boulevard_01: installArcadeCity01,
  crystal_palace_01: installCavern01,
  desert_dunes_01: installBeach01,
  volcano_canyon_01: installVolcano01,
  ice_cavern_01: installMountain01,
  underwater_temple_01: installRuins01,
  cyber_boulevard_01: installCyberDowntown01,
  forest_maze_01: installMushroomForest01,
  moonlight_cavern_01: installSpaceDrift01,
};

export function installIllustratedTrackWorld(world, scene, curve, hw, bounds, arenaType, finishT, spec, tier = 'medium') {
  const fn = INSTALLERS[arenaType];
  if (!fn) return;
  fn(world, scene, curve, hw, bounds, finishT, tier);

  const std = getTrackStandard(arenaType);
  if (std?.checkpointTs?.length) {
    placeCheckpointArches(world, curve, hw, std.checkpointTs, std.checkpointColors);
  }
  if (std?.boostTs?.length) {
    placeBoostPads(world, curve, std.boostTs);
  }
}

export function animateIllustratedWorld(world, arenaType, time, tier) {
  animateIllustratedProps(world, time);
}
