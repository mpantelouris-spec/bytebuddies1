/**
 * TrackHeroWorldKit.js — Authored 3D track worlds (no reference PNG backdrops).
 */
import * as THREE from 'three';
import { getBiomeAAASpec } from './BiomeAAAVisualSpec.js';
import { placeAtTrack } from '../GameWorldBuilder.js';
import {
  buildAtmosphereSky,
  buildCinematicLighting,
  buildLensFlare,
  buildGodRays,
  buildVolumetricCloudLayer,
  buildAAAParticles,
  buildAAATerrain,
  buildWaterSurface,
} from './BiomeAAAKit.js';
import {
  setupRaceEnvironment,
  setupMKDayEnvironment,
  setupStadiumNightEnvironment,
} from '../../services/art-direction.js';
import { purgeAllGenericFiller, buildReferenceChaseBackdrop } from './ReferenceBackdropKit.js';
import { getTrackBackdrop } from './TrackBackdropManifest.js';
import {
  placeSunsetHeroSet,
  buildIndustrialStartGantry,
  buildMossCliff,
  buildDomeTownWithCrowd,
  buildFlyingVehicles,
} from './SunsetCoastHeroKit.js';
import {
  buildStartHeroSet as buildCrystalStartHero,
  buildCrystalStartCorridor,
  buildCavernCeiling,
  buildCavernVista,
  placeCrystalScenery,
  installCrystalCavernLighting,
  animateCrystalWorld,
  buildTrackCavernWalls,
  buildCavernSparkles,
  buildCrystalSkyHemisphere,
  buildGiantCrystalCluster,
} from './CrystalCavernHeroKit.js';
import {
  buildStartHeroSet as buildSkyStartHero,
  placeSkyGardenScenery,
  buildCloudLayerBelow,
  animateSkyGarden,
  buildGiantPinkFlower,
  buildFloatingIslandDetailed,
  buildRopeBridge,
  buildTinyCastle,
  buildMushroomGrove,
} from './SkyGardenHeroKit.js';
import {
  buildStartHeroSet as buildVolcanoStartHero,
  placeVolcanoScenery,
  animateVolcano,
  buildResearchHut,
  buildLavaRiver,
  buildCalderaBackdrop,
} from './VolcanoHeroKit.js';
import {
  buildStartHeroSet as buildCyberStartHero,
  placeCyberScenery,
  animateCyberCity,
  buildHoloBillboard,
  buildSkyscraper,
} from './CyberCityHeroKit.js';
import {
  buildStartHeroSet as buildFrostStartHero,
  placeFrostScenery,
  animateFrost,
  buildSkiLodge,
  buildSnowPine,
  buildSnowman,
} from './FrostPeakHeroKit.js';
import {
  buildStartHeroSet as buildRuinsStartHero,
  placeRuinsScenery,
  animateRuins,
  buildTempleGate,
  buildAnimalStatue,
  buildRuinsRopeBridge,
  buildArchaeologistCamp,
} from './RuinsHeroKit.js';
import {
  buildStartHeroSet as buildGalaxyStartHero,
  placeGalaxyScenery,
  animateGalaxy,
  buildNeonRingGate,
  buildAsteroidPlatform,
  buildAlienSpectatorBooth,
  buildCosmicObservatory,
} from './GalaxyHeroKit.js';
import {
  buildStartHeroSet as buildMeadowStartHero,
  placeMeadowScenery,
  animateMeadow,
  buildRedBarnHero,
  buildWindmillLandmark,
  buildMeadowHills,
  buildWildflowerCluster,
} from './MeadowHeroKit.js';
import {
  buildStartHeroSet as buildMetroStartHero,
  placeMetroScenery,
  buildMetroCeiling,
  animateMetro,
  buildMetroNeonSign,
  buildFluorescentLight,
  buildGraffitiWall,
  buildAbandonedTrain,
} from './MetroHeroKit.js';
import {
  buildPremiumCrystal,
  createCrystalCluster,
  buildGiantFlower,
  buildTempleArch,
  buildLavaFlow,
  buildNeonBillboard,
  buildIceFormation,
  buildCrystalSparkles,
  buildVolcanoAsh,
  animatePremiumBiome,
} from './PremiumBiomeEnhancements.js';

// ── Local helpers ────────────────────────────────────────────────────────────
function tierScale(scene, high, medium, low) {
  const t = scene.userData?.qualityTier || 'medium';
  if (t === 'high') return high;
  if (t === 'low') return low;
  return medium;
}
function buildPalmTree(scale = 1) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18 * scale, 0.28 * scale, 7 * scale, 8),
    new THREE.MeshStandardMaterial({ color: 0x7a5c3a, roughness: 0.9 }),
  );
  trunk.position.y = 3.5 * scale;
  g.add(trunk);
  for (let i = 0; i < 6; i++) {
    const leaf = new THREE.Mesh(
      new THREE.ConeGeometry(2.2 * scale, 0.35 * scale, 6),
      new THREE.MeshStandardMaterial({ color: 0x2d8a30, roughness: 0.8 }),
    );
    const a = (i / 6) * Math.PI * 2;
    leaf.position.set(Math.cos(a) * 1.8 * scale, 7 * scale, Math.sin(a) * 1.8 * scale);
    leaf.rotation.z = Math.cos(a) * 0.5;
    leaf.rotation.x = Math.sin(a) * 0.5;
    g.add(leaf);
  }
  return g;
}

function buildRainbowArc(bounds) {
  const g = new THREE.Group();
  g.name = 'rainbow-arc';
  const arcColors = [0xff0044, 0xff8800, 0xffee00, 0x00ee44, 0x0088ff, 0x8800ff];
  arcColors.forEach((color, i) => {
    const r = 90 - i * 5;
    const arc = new THREE.Mesh(
      new THREE.TorusGeometry(r, 1.5, 8, 64, Math.PI),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55 - i * 0.04, fog: false, depthWrite: false }),
    );
    arc.position.set(bounds.cx, -20, bounds.cz + 80);
    arc.rotation.x = Math.PI * 0.5;
    g.add(arc);
  });
  return g;
}

function applyAtmosphere(scene, bounds, arenaType) {
  const spec = getBiomeAAASpec(arenaType);
  const backdrop = getTrackBackdrop(arenaType);
  const fogColor = backdrop?.fog ?? spec.palette?.fog ?? 0x888888;
  const fogDensity = Math.min(backdrop?.fogDensity ?? spec.fogDensity ?? 0.004, 0.006);
  scene.fog = new THREE.FogExp2(fogColor, fogDensity);
  if (backdrop?.underground && arenaType === 'crystal_palace_01') {
    scene.background = new THREE.Color(0x0a0a0c);
    scene.userData.suppressSimDaylight = true;
    return spec;
  }
  if (backdrop?.cosmic || spec.cosmic) {
    buildAtmosphereSky(scene, 0x0a0018, 0x1a0840, 500, 0x2a1060);
    scene.userData.suppressSimDaylight = true;
    return spec;
  }
  const pal = spec.palette || {};
  buildAtmosphereSky(scene, pal.primary ?? fogColor, pal.fog ?? fogColor, 480, pal.secondary ?? fogColor);
  return spec;
}

const HERO_INSTALLERS = {
  // ── TRACK 1: Sunset Coast Circuit ──────────────────────────────────────────
  desert_dunes_01(world, scene, curve, hw, bounds, finishT, spec) {
    // Dramatic tropical sunset: deep ocean-blue dome → warm coral horizon → flamingo pink
    buildAtmosphereSky(scene, 0x0d2d5a, 0xff7040, 480, 0xff4d80);
    scene.fog = new THREE.FogExp2(0xff9a5c, 0.0025);
    buildCinematicLighting(scene, bounds, spec, { lightBoost: 1.0 });
    world.add(buildLensFlare(bounds));
    world.add(buildGodRays(bounds, 0xffcc88, 4));

    const ocean = new THREE.Mesh(
      new THREE.PlaneGeometry(600, 600, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x00aabb, roughness: 0.08, metalness: 0.45,
        emissive: 0x004466, emissiveIntensity: 0.15 }),
    );
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.set(bounds.cx + 90, -2, bounds.cz);
    world.add(ocean);

    // Sandy beach strip (#F4D03F gold sand)
    const sand = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 1000),
      new THREE.MeshStandardMaterial({ color: 0xf4d03f, roughness: 0.95, metalness: 0 }),
    );
    sand.rotation.x = -Math.PI / 2;
    sand.position.set(bounds.cx + hw + 22, -0.35, bounds.cz);
    world.add(sand);

    // 18 palm trees lining the circuit (#2ECC71 palm green)
    for (let i = 0; i < 18; i++) {
      const t = (i + 0.5) / 18;
      const side = i % 2 ? 1 : -1;
      const { pos } = placeAtTrack(curve, t, side * (hw + 9 + (i % 3) * 2.5), 0);
      const palm = buildPalmTree(0.9 + (i % 4) * 0.18);
      palm.position.copy(pos);
      world.add(palm);
    }

    // Coral arch landmark — 12 m torus over track at 30% progress
    const coralArch = new THREE.Group();
    coralArch.name = 'coral-arch';
    const archRing = new THREE.Mesh(
      new THREE.TorusGeometry(7.5, 0.9, 10, 36),
      new THREE.MeshStandardMaterial({ color: 0xff7f50, roughness: 0.45, metalness: 0.2,
        emissive: 0x993300, emissiveIntensity: 0.25 }),
    );
    archRing.rotation.y = Math.PI / 2;
    archRing.position.y = 7.5;
    coralArch.add(archRing);
    // Two support pillars
    [-1, 1].forEach((side) => {
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.7, 0.9, 9, 8),
        new THREE.MeshStandardMaterial({ color: 0xe87050, roughness: 0.6 }),
      );
      pillar.position.set(side * 7.5, 4.5, 0);
      coralArch.add(pillar);
    });
    const { pos: archPos, frame: archFrame } = placeAtTrack(curve, (finishT + 0.3) % 1, 0, 0);
    coralArch.position.copy(archPos);
    coralArch.rotation.y = archFrame.rot ?? 0;
    world.add(coralArch);

    // Surf shack + crowd dome + flying vehicles
    world.add(buildDomeTownWithCrowd(28, 18, 'BEACH RACE'));
    const fliers = buildFlyingVehicles(bounds, 6);
    world.add(fliers);

    // Mossy cliff backdrop
    const cliff = buildMossCliff(18, 20);
    cliff.position.set(bounds.cx - 50, 0, bounds.cz + 30);
    world.add(cliff);

    placeSunsetHeroSet(world, curve, hw, bounds);
  },

  // ── TRACK 2: Crystal Cavern Run ─────────────────────────────────────────────
  crystal_palace_01(world, scene, curve, hw, bounds, finishT) {
    scene.background = new THREE.Color(0x030408);
    scene.fog = new THREE.FogExp2(0x06101e, 0.013);
    installCrystalCavernLighting(scene, bounds);

    // Cave enclosure hull (#0B0B0B obsidian)
    const radius = Math.max(bounds.spanX, bounds.spanZ) * 0.95 + 40;
    const caveHull = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 36, 18),
      new THREE.MeshStandardMaterial({ color: 0x060508, roughness: 1, metalness: 0, side: THREE.BackSide }),
    );
    caveHull.position.set(bounds.cx, 14, bounds.cz);
    world.add(caveHull);

    // Obsidian reflective floor (#0B0B0B with #00FFFF cyan emissive)
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(bounds.spanX * 2.8 + 70, bounds.spanZ * 2.8 + 70),
      new THREE.MeshStandardMaterial({ color: 0x060408, roughness: 0.06, metalness: 0.95,
        emissive: 0x002035, emissiveIntensity: 0.5 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(bounds.cx, -0.9, bounds.cz);
    world.add(floor);

    // Dense crystal walls 80 samples — fills entire circuit
    world.add(buildTrackCavernWalls(curve, hw, tierScale(scene, 80, 36, 20)));
    world.add(buildCrystalStartHero(curve, hw, finishT));
    world.add(buildCrystalStartCorridor(curve, hw, finishT));
    world.add(buildCavernCeiling(bounds));
    world.add(buildCavernVista());
    placeCrystalScenery(world, curve, hw);

    // 1000-particle bioluminescent sparkle cloud
    world.add(buildCavernSparkles(bounds, tierScale(scene, 800, 280, 80)));

    // 6 massive crystal formations at key circuit positions
    [
      [bounds.cx - 32, 0, bounds.cz + 22],
      [bounds.cx + 38, 0, bounds.cz - 28],
      [bounds.cx - 18, 0, bounds.cz - 38],
      [bounds.cx + 24, 0, bounds.cz + 44],
      [bounds.cx - 50, 0, bounds.cz - 10],
      [bounds.cx + 48, 0, bounds.cz + 10],
    ].forEach(([x, y, z], idx) => {
      const cluster = buildGiantCrystalCluster(2.0 + (idx % 3) * 0.35);
      cluster.position.set(x, y, z);
      world.add(cluster);
    });

    // Crystal sky hemisphere fills cave ceiling with amethyst
    world.add(buildCrystalSkyHemisphere(bounds));

    // Central 30 m quartz pillar landmark (spec: tallest geometry)
    const quartzGroup = new THREE.Group();
    quartzGroup.name = 'quartz-pillar';
    const quartzBody = new THREE.Mesh(
      new THREE.CylinderGeometry(1.8, 3.2, 30, 8),
      new THREE.MeshStandardMaterial({ color: 0xe8f8ff, roughness: 0.08, metalness: 0.3,
        emissive: 0x00aaff, emissiveIntensity: 0.4, transparent: true, opacity: 0.9 }),
    );
    quartzBody.position.y = 15;
    quartzGroup.add(quartzBody);
    const quartzTip = new THREE.Mesh(
      new THREE.ConeGeometry(1.8, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0x9966cc, roughness: 0.05,
        emissive: 0x6600cc, emissiveIntensity: 0.6 }),
    );
    quartzTip.position.y = 34;
    quartzGroup.add(quartzTip);
    quartzGroup.add(new THREE.PointLight(0x00ffff, 5, 40));
    quartzGroup.position.set(bounds.cx, 0, bounds.cz);
    world.add(quartzGroup);
  },

  // ── TRACK 3: Sky Garden Ascent ──────────────────────────────────────────────
  sky_island_01(world, scene, curve, hw, bounds, finishT, spec) {
    buildAtmosphereSky(scene, 0x0a3a9a, 0x44ccff, 490, 0x88ffcc);
    scene.fog = new THREE.FogExp2(0x99ddee, 0.002);
    buildCinematicLighting(scene, bounds, spec, { lightBoost: 1.15 });

    world.add(buildCloudLayerBelow(bounds));
    world.add(buildVolumetricCloudLayer(bounds, 62, 0xffffff, 0.34, 0.78, 7));
    world.add(buildVolumetricCloudLayer(bounds, 48, 0xe8f4ff, 0.22, 0.52, 11));

    [
      [bounds.cx - 60, -6, bounds.cz + 44, 11],
      [bounds.cx + 65, -4, bounds.cz - 32, 9],
      [bounds.cx - 80, 12, bounds.cz + 10, 8],
      [bounds.cx + 55, 14, bounds.cz + 28, 7],
      [bounds.cx - 35, -10, bounds.cz - 48, 10],
    ].forEach(([x, y, z, r]) => {
      const island = buildFloatingIslandDetailed(r);
      island.position.set(x, y, z);
      world.add(island);
    });

    world.add(buildSkyStartHero(curve, hw, finishT));
    placeSkyGardenScenery(world, curve, hw, bounds);
    world.add(buildRainbowArc(bounds));

    const castle = buildTinyCastle();
    castle.position.set(bounds.cx - 48, 6, bounds.cz + 38);
    castle.scale.setScalar(1.45);
    world.add(castle);

    const grove = buildMushroomGrove();
    grove.position.set(bounds.cx + 42, 0, bounds.cz - 28);
    grove.scale.setScalar(1.2);
    world.add(grove);

    const heroFlower = buildGiantPinkFlower(1.4);
    const { pos: flowerPos } = placeAtTrack(curve, (finishT + 0.14) % 1, -(hw + 16), 0);
    heroFlower.position.copy(flowerPos);
    world.add(heroFlower);

    buildAAAParticles(world, ['petals', 'mist'], bounds, 0.22);
  },

  // ── TRACK 4: Volcanic Inferno Pass ─────────────────────────────────────────
  volcano_canyon_01(world, scene, curve, hw, bounds, finishT, spec) {
    // Volcanic sky: charcoal (#2F2F2F) top → deep crimson → lava orange (#FF4500)
    buildAtmosphereSky(scene, 0x0e0300, 0x7a1400, 470, 0xdd3300);
    scene.fog = new THREE.FogExp2(0x5a0a00, 0.009);
    buildCinematicLighting(scene, bounds, spec, { lightBoost: 1.2 });
    world.add(buildGodRays(bounds, 0xff5511, 5));

    // Caldera volcanic backdrop mountain
    const caldera = buildCalderaBackdrop();
    caldera.position.set(bounds.cx + 80, 0, bounds.cz - 60);
    world.add(caldera);

    // Research hut / volcanologist station (storytelling prop)
    const hut = buildResearchHut();
    const { pos: hutPos } = placeAtTrack(curve, (finishT + 0.18) % 1, hw + 16, 0);
    hut.position.copy(hutPos);
    world.add(hut);

    // 3 lava rivers crossing near track
    world.add(buildLavaRiver(45));
    const lavaR2 = buildLavaRiver(35);
    lavaR2.position.set(bounds.cx - 20, 0, bounds.cz + 15);
    world.add(lavaR2);

    // Premium lava flows at t=0.35 and t=0.65
    world.add(buildLavaFlow(curve, 0.30, 12, 1.3));
    world.add(buildLavaFlow(curve, 0.62, 9, 1.0));

    // 300 ash particles + ember cloud
    world.add(buildVolcanoAsh(300, bounds));

    world.add(buildVolcanoStartHero(curve, hw, finishT));
    placeVolcanoScenery(world, curve, hw, bounds);
  },

  // ── TRACK 5: Cyber City Circuit ─────────────────────────────────────────────
  cyber_boulevard_01(world, scene, curve, hw, bounds, finishT, spec) {
    // Pitch-black deep navy (#001F3F) night sky
    buildAtmosphereSky(scene, 0x000005, 0x000818, 470, 0x000e2a);
    scene.fog = new THREE.FogExp2(0x000a20, 0.008);
    buildCinematicLighting(scene, bounds, spec, { lightBoost: 1.0 });

    // Rain particles — heavy downpour (#FF00FF / #00BFFF reflections)
    buildAAAParticles(world, ['rain'], bounds, tierScale(scene, 0.55, 0.28, 0.15));

    const towerCount = tierScale(scene, 20, 12, 6);
    for (let i = 0; i < towerCount; i++) {
      const t = (i + 0.5) / towerCount;
      const side = i % 2 ? 1 : -1;
      const h = 26 + (i % 5) * 8;
      const tower = buildSkyscraper(h, i % 3 === 0 ? 0xff00ff : i % 3 === 1 ? 0x00ffff : 0x39ff14);
      const { pos, frame } = placeAtTrack(curve, t, side * (hw + 16 + (i % 4) * 4), 0);
      tower.position.copy(pos);
      tower.rotation.y = (frame.rot ?? 0) + Math.PI;
      world.add(tower);
    }

    // Hero holographic billboard "CYBER GP" at start/finish
    const heroBillboard = buildHoloBillboard('ARCADE GP');
    const { pos: billPos, frame: billFrame } = placeAtTrack(curve, (finishT + 0.08) % 1, 0, 16);
    heroBillboard.position.copy(billPos);
    heroBillboard.rotation.y = billFrame.rot ?? 0;
    world.add(heroBillboard);

    // "CODE YOUR RIDE" robot shop billboard (#39FF14 holo green)
    world.add(buildNeonBillboard(new THREE.Vector3(bounds.cx - 32, 22, bounds.cz + 18), 11, 7, 'CODE YOUR RIDE'));
    world.add(buildNeonBillboard(new THREE.Vector3(bounds.cx + 38, 20, bounds.cz - 12), 10, 6, 'RACE ON!'));

    world.add(buildCyberStartHero(curve, hw, finishT));
    placeCyberScenery(world, curve, hw, bounds);
  },

  // ── TRACK 6: Frost Peak Rally ──────────────────────────────────────────────
  ice_cavern_01(world, scene, curve, hw, bounds, finishT, spec) {
    // Crisp alpine sky: steel blue (#5DADE2) top → snow white (#FFFAFA) horizon
    buildAtmosphereSky(scene, 0x2a5070, 0xb8ddf0, 490, 0xd0eeff);
    scene.fog = new THREE.FogExp2(0xd0e8f5, 0.0028);
    buildCinematicLighting(scene, bounds, spec, { lightBoost: 1.05 });
    world.add(buildGodRays(bounds, 0xe8f4ff, 3));

    // Ski lodge — main storytelling landmark at start
    const lodge = buildSkiLodge();
    const { pos: lodgePos } = placeAtTrack(curve, (finishT + 0.05) % 1, hw + 18, 0);
    lodge.position.copy(lodgePos);
    world.add(lodge);

    // 20 snow-covered pine trees in slalom formation
    for (let i = 0; i < 20; i++) {
      const t = (i + 0.5) / 20;
      const side = i % 2 ? 1 : -1;
      const pine = buildSnowPine(0.8 + (i % 4) * 0.2);
      const { pos } = placeAtTrack(curve, t, side * (hw + 8 + (i % 3) * 2), 0);
      pine.position.copy(pos);
      world.add(pine);
    }

    // 3 snowmen holding WINTER CUP trophy along course
    [0.25, 0.55, 0.78].forEach((t) => {
      const snowman = buildSnowman();
      const { pos } = placeAtTrack(curve, (finishT + t) % 1, hw + 12, 0);
      snowman.position.copy(pos);
      world.add(snowman);
    });

    // 4 ice crystal formations flanking corners
    world.add(buildIceFormation(new THREE.Vector3(bounds.cx - 28, 0.5, bounds.cz - 22), 1.8));
    world.add(buildIceFormation(new THREE.Vector3(bounds.cx + 32, 0.5, bounds.cz + 18), 1.5));
    world.add(buildIceFormation(new THREE.Vector3(bounds.cx + 15, 0.5, bounds.cz - 40), 1.3));
    world.add(buildIceFormation(new THREE.Vector3(bounds.cx - 45, 0.5, bounds.cz + 10), 1.6));

    // Heavy snowfall particles
    buildAAAParticles(world, ['snow'], bounds, 0.55);

    world.add(buildFrostStartHero(curve, hw, finishT));
    placeFrostScenery(world, curve, hw, bounds);
  },

  // ── TRACK 7: Ancient Ruins Raceway ──────────────────────────────────────────
  underwater_temple_01(world, scene, curve, hw, bounds, finishT, spec) {
    // Lush jungle canopy sky: near-black forest top → emerald (#228B22) horizon
    buildAtmosphereSky(scene, 0x060e08, 0x1a4510, 480, 0x3a7030);
    scene.fog = new THREE.FogExp2(0x2e5228, 0.007);
    buildCinematicLighting(scene, bounds, spec, { lightBoost: 1.05 });
    world.add(buildGodRays(bounds, 0x80ff60, 5));

    // 20m stone arch with gold inlay — main hero landmark
    const heroArch = new THREE.Group();
    heroArch.name = 'stone-arch-hero';
    // Two massive stone pillars
    [-1, 1].forEach((side) => {
      const pillar = new THREE.Mesh(
        new THREE.BoxGeometry(3.5, 20, 3.5),
        new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.85, metalness: 0.05 }),
      );
      pillar.position.set(side * (hw + 1.5), 10, 0);
      heroArch.add(pillar);
      // Gold inlay bands
      for (let band = 0; band < 4; band++) {
        const inlay = new THREE.Mesh(
          new THREE.BoxGeometry(3.7, 0.4, 3.7),
          new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.3, metalness: 0.8,
            emissive: 0x886600, emissiveIntensity: 0.4 }),
        );
        inlay.position.set(side * (hw + 1.5), 3 + band * 4.5, 0);
        heroArch.add(inlay);
      }
    });
    // Top lintel
    const lintel = new THREE.Mesh(
      new THREE.BoxGeometry((hw + 1.5) * 2 + 3.5, 2.5, 3.5),
      new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.85 }),
    );
    lintel.position.set(0, 21.25, 0);
    heroArch.add(lintel);
    // Gold cap
    const goldCap = new THREE.Mesh(
      new THREE.BoxGeometry((hw + 1.5) * 2 + 4, 0.6, 4),
      new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.25, metalness: 0.9 }),
    );
    goldCap.position.set(0, 22.8, 0);
    heroArch.add(goldCap);
    const { pos: archPos, frame: archFrame } = placeAtTrack(curve, (finishT + 0.22) % 1, 0, 0);
    heroArch.position.copy(archPos);
    heroArch.rotation.y = archFrame.rot ?? 0;
    world.add(heroArch);

    // Temple gate at track start
    const gate = buildTempleGate();
    const { pos: gatePos, frame: gateFrame } = placeAtTrack(curve, (finishT + 0.12) % 1, 0, 0);
    gate.position.copy(gatePos);
    gate.rotation.y = gateFrame.rot ?? 0;
    world.add(gate);

    // Animal statues (jaguar + others) flanking the arch
    ['jaguar', 'eagle', 'serpent'].forEach((animal, idx) => {
      const statue = buildAnimalStatue(animal);
      const { pos } = placeAtTrack(curve, (finishT + 0.19 + idx * 0.03) % 1,
        idx % 2 ? (hw + 8) : -(hw + 8), 0);
      statue.position.copy(pos);
      world.add(statue);
    });

    // Rope bridge spanning a gorge at 55%
    const bridge = buildRuinsRopeBridge(30);
    const { pos: bridgePos, frame: bridgeFrame } = placeAtTrack(curve, (finishT + 0.55) % 1, 0, 0);
    bridge.position.copy(bridgePos);
    bridge.rotation.y = bridgeFrame.rot ?? 0;
    world.add(bridge);

    // Archaeologist camp storytelling prop
    const camp = buildArchaeologistCamp();
    const { pos: campPos } = placeAtTrack(curve, (finishT + 0.70) % 1, hw + 14, 0);
    camp.position.copy(campPos);
    world.add(camp);

    // Two additional PremiumBiome temple arches
    world.add(buildTempleArch(new THREE.Vector3(bounds.cx - 22, 0, bounds.cz + 24), 8, 7));
    world.add(buildTempleArch(new THREE.Vector3(bounds.cx + 28, 0, bounds.cz - 18), 7, 6));

    // Jungle humidity haze particles
    buildAAAParticles(world, ['mist'], bounds, 0.4);

    world.add(buildRuinsStartHero(curve, hw, finishT));
    placeRuinsScenery(world, curve, hw, bounds);
  },

  // ── TRACK 8: Stardust Galaxy Drift ──────────────────────────────────────────
  moonlight_cavern_01(world, scene, curve, hw, bounds, finishT, spec) {
    // Deep cosmic void: midnight violet (#8A2BE2) dome → black
    buildAtmosphereSky(scene, 0x010005, 0x06001a, 500, 0x130835);
    scene.fog = new THREE.FogExp2(0x040010, 0.0022);
    buildCinematicLighting(scene, bounds, spec, { lightBoost: 0.9 });

    // 3000 stardust particles filling the void
    buildAAAParticles(world, ['stardust'], bounds, tierScale(scene, 0.55, 0.25, 0.12));

    // 30 m hero neon ring gate — main landmark visible from track start
    const heroRing = buildNeonRingGate(15);
    const { pos: ringPos, frame: ringFrame } = placeAtTrack(curve, (finishT + 0.1) % 1, 0, 15);
    heroRing.position.copy(ringPos);
    heroRing.rotation.y = ringFrame.rot ?? 0;
    world.add(heroRing);

    // 4 more ring gates distributed around circuit (6m radius each)
    [0.25, 0.45, 0.65, 0.82].forEach((t) => {
      const ring = buildNeonRingGate(6 + Math.random() * 3);
      const { pos, frame } = placeAtTrack(curve, (finishT + t) % 1, 0, 7);
      ring.position.copy(pos);
      ring.rotation.y = frame.rot ?? 0;
      world.add(ring);
    });

    // 8 asteroid platforms flanking circuit
    for (let i = 0; i < 8; i++) {
      const ast = buildAsteroidPlatform(4 + (i % 3) * 2, i % 3);
      const t = (i + 0.5) / 8;
      const side = i % 2 ? 1 : -1;
      const { pos } = placeAtTrack(curve, t, side * (hw + 20 + (i % 3) * 8), -3);
      ast.position.copy(pos);
      world.add(ast);
    }

    // Cosmic observatory landmark
    const obs = buildCosmicObservatory();
    obs.position.set(bounds.cx - 50, -5, bounds.cz + 30);
    world.add(obs);

    // 5 alien spectator booths along sidelines
    for (let i = 0; i < 5; i++) {
      const booth = buildAlienSpectatorBooth();
      const t = (i + 0.5) / 5;
      const side = i % 2 ? 1 : -1;
      const { pos } = placeAtTrack(curve, t, side * (hw + 14), 0);
      booth.position.copy(pos);
      world.add(booth);
    }

    // Crystal sparkle — nebula gas cloud effect
    world.add(buildCrystalSparkles(tierScale(scene, 1200, 400, 120), bounds));

    world.add(buildGalaxyStartHero(curve, hw, finishT));
    placeGalaxyScenery(world, curve, hw, bounds);
  },

  // ── TRACK 9: Enchanted Mushroom Forest ─────────────────────────────────────
  forest_maze_01(world, scene, curve, hw, bounds, finishT, spec) {
    buildAtmosphereSky(scene, 0x0a2810, 0x228b22, 480, 0x7cfc00);
    scene.fog = new THREE.FogExp2(0x3a5a32, 0.005);
    buildCinematicLighting(scene, bounds, spec, { lightBoost: 1.12 });

    const centralFlower = buildGiantPinkFlower(1.15);
    const { pos: centerPos } = placeAtTrack(curve, (finishT + 0.06) % 1, 0, 0);
    centralFlower.position.copy(centerPos);
    world.add(centralFlower);

    const ringCount = tierScale(scene, 8, 6, 4);
    for (let i = 0; i < ringCount; i++) {
      const grove = buildMushroomGrove();
      const angle = (i / ringCount) * Math.PI * 2;
      grove.position.set(bounds.cx + Math.cos(angle) * 20, 0, bounds.cz + Math.sin(angle) * 20);
      grove.scale.setScalar(0.85 + (i % 3) * 0.12);
      world.add(grove);
    }

    const slalomCount = tierScale(scene, 12, 8, 5);
    for (let i = 0; i < slalomCount; i++) {
      const t = (i + 1) / (slalomCount + 1);
      const side = i % 2 ? 1 : -1;
      const mush = buildMushroomGrove();
      mush.scale.setScalar(0.6 + (i % 2) * 0.1);
      const { pos } = placeAtTrack(curve, (finishT + t) % 1, side * (hw + 7), 0);
      mush.position.copy(pos);
      world.add(mush);
    }

    buildAAAParticles(world, ['mist', 'pollen'], bounds, tierScale(scene, 0.32, 0.2, 0.1));
    world.add(buildSkyStartHero(curve, hw, finishT));
    placeSkyGardenScenery(world, curve, hw, bounds);
  },

  // ── TRACK 10: Cyber Neon Downtown ───────────────────────────────────────────
  cyber_boulevard_01(world, scene, curve, hw, bounds, finishT, spec) {
    buildAtmosphereSky(scene, 0x000005, 0x000818, 470, 0x000e2a);
    scene.fog = new THREE.FogExp2(0x000a20, 0.008);
    buildCinematicLighting(scene, bounds, spec, { lightBoost: 1.0 });
    buildAAAParticles(world, ['rain'], bounds, tierScale(scene, 0.5, 0.25, 0.12));

    const towerCount = tierScale(scene, 18, 10, 5);
    for (let i = 0; i < towerCount; i++) {
      const t = (i + 0.5) / towerCount;
      const side = i % 2 ? 1 : -1;
      const h = 24 + (i % 5) * 7;
      const tower = buildSkyscraper(h, i % 3 === 0 ? 0xff00ff : i % 3 === 1 ? 0x00bfff : 0x39ff14);
      const { pos, frame } = placeAtTrack(curve, t, side * (hw + 16 + (i % 4) * 4), 0);
      tower.position.copy(pos);
      tower.rotation.y = (frame.rot ?? 0) + Math.PI;
      world.add(tower);
    }

    const heroBillboard = buildHoloBillboard('CYBER GRAND PRIX');
    const { pos: billPos, frame: billFrame } = placeAtTrack(curve, (finishT + 0.08) % 1, 0, 16);
    heroBillboard.position.copy(billPos);
    heroBillboard.rotation.y = billFrame.rot ?? 0;
    world.add(heroBillboard);

    world.add(buildNeonBillboard(new THREE.Vector3(bounds.cx - 30, 22, bounds.cz + 16), 12, 6, 'CYBER GRAND PRIX'));
    world.add(buildNeonBillboard(new THREE.Vector3(bounds.cx + 36, 20, bounds.cz - 14), 10, 5, 'NEON RUSH'));

    world.add(buildCyberStartHero(curve, hw, finishT));
    placeCyberScenery(world, curve, hw, bounds);
  },
};

const HERO_ANIMATORS = {
  desert_dunes_01(world, time) {
    animatePremiumBiome(world, time, 'desert_dunes_01');
  },
  crystal_palace_01(world, time) {
    animateCrystalWorld(world, time);
    animatePremiumBiome(world, time, 'crystal_palace_01');
  },
  sky_island_01(world, time) {
    animateSkyGarden(world, time);
    animatePremiumBiome(world, time, 'sky_island_01');
  },
  volcano_canyon_01(world, time) {
    animateVolcano(world, time);
    animatePremiumBiome(world, time, 'volcano_canyon_01');
  },
  cyber_boulevard_01(world, time) {
    animateCyberCity(world, time);
    animatePremiumBiome(world, time, 'cyber_boulevard_01');
  },
  ice_cavern_01(world, time) {
    animateFrost(world, time);
    animatePremiumBiome(world, time, 'ice_cavern_01');
  },
  underwater_temple_01(world, time) {
    animateRuins(world, time);
    animatePremiumBiome(world, time, 'underwater_temple_01');
  },
  moonlight_cavern_01(world, time) {
    animateGalaxy(world, time);
    animatePremiumBiome(world, time, 'moonlight_cavern_01');
  },
  cyber_boulevard_01(world, time) {
    animateCyberCity(world, time);
    animatePremiumBiome(world, time, 'cyber_boulevard_01');
  },
  forest_maze_01(world, time) {
    animateSkyGarden(world, time);
    animatePremiumBiome(world, time, 'forest_maze_01');
  },
};

export function installTrackAtmosphere(scene, bounds, arenaType) {
  purgeAllGenericFiller(scene);
  return applyAtmosphere(scene, bounds, arenaType);
}

export function installBiomeEnvironment(scene, arenaType, spec) {
  const cosmic = backdropCosmic(arenaType, spec);
  const deepUnderground = spec?.underground || arenaType === 'crystal_palace_01';
  if (cosmic) setupRaceEnvironment(scene, { space: true });
  else if (arenaType === 'cyber_boulevard_01') setupStadiumNightEnvironment(scene);
  else if (deepUnderground) setupRaceEnvironment(scene, { space: true });
  else if (arenaType === 'cyber_boulevard_01') setupStadiumNightEnvironment(scene);
  else setupMKDayEnvironment(scene);
  scene.environmentIntensity = deepUnderground
    ? 0.45
    : (cosmic ? 0.5 : 0.55);
}

function backdropCosmic(arenaType, spec) {
  return arenaType === 'moonlight_cavern_01' || spec?.cosmic;
}

export function buildBiomeFloorPad(bounds, color, y = -0.45) {
  const g = new THREE.Group();
  g.name = 'biome-track-floor';
  const w = Math.max(bounds.spanX, bounds.spanZ) * 1.5 + 40;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(w, w),
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.92,
      metalness: 0.04,
      emissive: color,
      emissiveIntensity: 0.14,
    }),
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(bounds.cx, y, bounds.cz);
  mesh.receiveShadow = true;
  g.add(mesh);
  return g;
}

/** Ground/water under the circuit so the track reads as a real world (not empty void). */
export function installTrackGround(scene, world, bounds, curve, arenaType, spec) {
  const underground = spec?.underground
    || arenaType === 'crystal_palace_01';
  if (underground) {
    world.add(buildBiomeFloorPad(bounds, spec?.ground ?? 0x0a0a0c, -0.55));
    return;
  }
  const size = Math.max(bounds.spanX, bounds.spanZ) * 2.4 + 60;
  const terrain = buildAAATerrain(scene, bounds, spec?.ground ?? 0x4a8a3a, size, curve);
  if (terrain?.parent) {
    terrain.parent.remove(terrain);
    world.add(terrain);
  }
  if (spec?.features?.water && arenaType === 'desert_dunes_01') {
    world.add(buildWaterSurface(bounds, { width: size, depth: size * 0.55 }));
  }
}

export function installTrackHeroWorld(world, scene, curve, hw, bounds, arenaType, finishT, spec) {
  const fn = HERO_INSTALLERS[arenaType];
  if (fn) fn(world, scene, curve, hw, bounds, finishT, spec);
}

export function animateTrackHeroWorld(world, arenaType, time) {
  const fn = HERO_ANIMATORS[arenaType];
  if (fn) fn(world, time);
}
