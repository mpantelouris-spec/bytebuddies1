/**
 * PremiumKidArenaKit — Nintendo/Pixar-quality curated scenery for kid missions.
 * Re-enables the rich MK8 / Sky Garden assets with a strict prop budget.
 */
import * as THREE from 'three';
import { pbrMat } from '../../racing/mk-tracks/BiomeAAAKit.js';
import { buildFloatingIslandDetailed } from '../../racing/mk-tracks/SkyGardenHeroKit.js';
import { buildPremiumWindmill } from '../../racing/mk-tracks/MK8TrackQualityKit.js';
import { arenaMover } from '../ArenaBuilderCore.js';
import { scatterAerialIslands } from '../aerial-world/AerialIslandKit.js';
import {
  enrichAerialFloatingIslands,
  installAerialCinematicAtmosphere,
  scatterDistantSilhouetteIslands,
} from '../aerial-world/AerialGltfEnrichKit.js';
import { addParallaxCloudLayers, installGoldenHourSky, installThemedAerialSky } from '../aerial-world/AerialSkyKit.js';
import { installFlyingCinematicLighting } from '../aerial-world/FlyingArenaMaterialKit.js';
import { placeAerialHero } from '../aerial-world/AerialHeroKit.js';
import { isArtDirectedVista } from '../aerial-world/PremiumEnvironmentArtKit.js';
import { CHASSIS_VISUAL_DNA } from './MissionKidClarity.js';

const PREMIUM_ISLAND_SCATTER = [
  { t: 0.18, side: -1, off: 50, yOff: -24, hero: true },
  { t: 0.48, side: 1, off: 54, yOff: -20, hero: true },
  { t: 0.76, side: -1, off: 46, yOff: -22, spire: true, castle: true },
];

/** Orange mechanical hut on metal pillar — matches reference sky islands. */
export function buildSkyMechanicalHut() {
  const g = new THREE.Group();
  g.name = 'sky-mechanical-hut';
  const pillar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.55, 0.75, 7, 10),
    pbrMat(0x64748b, { metalness: 0.65, roughness: 0.35 }),
  );
  pillar.position.y = 3.5;
  g.add(pillar);
  const hut = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 2.6, 2.8),
    pbrMat(0xf97316, { roughness: 0.72, emissive: 0x7c2d12, emi: 0.08 }),
  );
  hut.position.y = 8.2;
  g.add(hut);
  const windowMat = pbrMat(0x38bdf8, { emissive: 0x0ea5e9, emi: 0.45 });
  [[-0.9, 0.3], [0.9, 0.3], [0, -0.5]].forEach(([x, z]) => {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.45), windowMat);
    win.position.set(x, 8.4, z + 1.41);
    g.add(win);
  });
  const rivetMat = pbrMat(0x94a3b8, { metalness: 0.8, roughness: 0.25 });
  [-1.4, 1.4].forEach((x) => {
    const rivet = new THREE.Mesh(new THREE.SphereGeometry(0.12, 6, 6), rivetMat);
    rivet.position.set(x, 9.5, 1.2);
    g.add(rivet);
  });
  return g;
}

function addGoldenFlag(parent, x, z, baseY = 0) {
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 2.8, 6),
    pbrMat(0xcbd5e1, { metalness: 0.5 }),
  );
  pole.position.set(x, baseY + 1.4, z);
  parent.add(pole);
  const flag = new THREE.Mesh(
    new THREE.PlaneGeometry(0.9, 0.55),
    pbrMat(0xfbbf24, { emissive: 0xf59e0b, emi: 0.25 }),
  );
  flag.position.set(x + 0.45, baseY + 2.6, z);
  parent.add(flag);
}

/** Large spawn island under the flight path — hero landmark at mission start. */
export function buildSpawnSkyIsland(scene, curve) {
  if (!curve) return null;
  const start = curve.getPoint(0);
  const g = new THREE.Group();
  g.name = 'PremiumSpawnSkyIsland';

  // Reference framing: the island top sits roughly one jet-length below the
  // flight line, not in the distant cloud layer.
  const island = buildFloatingIslandDetailed(13);
  island.position.set(start.x - 3.5, start.y - 13, start.z - 2);
  g.add(island);

  const hutA = buildSkyMechanicalHut();
  hutA.position.set(start.x - 8, start.y - 11, start.z + 1);
  g.add(hutA);

  const hutB = buildSkyMechanicalHut();
  hutB.position.set(start.x + 4, start.y - 10.5, start.z - 5);
  hutB.rotation.y = 0.6;
  g.add(hutB);

  const windmill = buildPremiumWindmill();
  windmill.position.set(start.x + 1, start.y - 12, start.z + 6);
  windmill.scale.setScalar(0.85);
  g.add(windmill);
  arenaMover(scene, (t) => {
    windmill.children.forEach((child) => {
      if (child.userData.blade) child.rotation.y = t * 0.9;
    });
  });

  addGoldenFlag(g, start.x - 5, start.z - 6, start.y - 11);
  addGoldenFlag(g, start.x + 4, start.z + 1, start.y - 11);

  scene.add(g);
  scene.userData.skyReferenceComposition = {
    islandBelowFlightLine: 13,
    heroIslandRadius: 13,
    firstGateFraming: 'immediate_ahead',
  };
  return g;
}

function installPremiumSkyLighting(scene) {
  if (scene.getObjectByName('PremiumKidSun')) return;
  const existingSun = scene.getObjectByName('KidClaritySun');
  if (existingSun) {
    return;
  }
  const sun = new THREE.DirectionalLight(0xffd89b, 1.45);
  sun.name = 'PremiumKidSun';
  sun.position.set(28, 42, 18);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  scene.add(sun);
  const fill = new THREE.HemisphereLight(0x87ceeb, 0x4a8a3a, 0.55);
  fill.name = 'PremiumKidHemi';
  scene.add(fill);
}

function buildAerialIdentitySpawn(scene, curve, dna) {
  if (!curve) return null;
  if ((dna?.aerialVista || 'cloud_sea') === 'cloud_sea') {
    return buildSpawnSkyIsland(scene, curve);
  }

  const start = curve.getPoint(0);
  const g = new THREE.Group();
  g.name = 'PremiumAerialIdentitySpawn';
  g.position.set(start.x, start.y - 7, start.z - 2);
  const vista = dna?.aerialVista;
  const metal = pbrMat(0x64748b, { metalness: 0.62, roughness: 0.34 });
  const glowColor = vista === 'neon_ribbon' ? 0xec4899 : vista === 'plasma_track' ? 0xa855f7 : 0x22d3ee;
  const glow = pbrMat(glowColor, { emissive: glowColor, emi: 0.62, roughness: 0.25 });

  if (vista === 'coastline') {
    const island = buildFloatingIslandDetailed(7);
    island.position.y = -5;
    g.add(island);
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1, 7, 12), pbrMat(0xf8fafc));
    tower.position.y = 1.5;
    g.add(tower);
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.75, 12, 8), pbrMat(0xf97316, { emissive: 0xf97316, emi: 0.55 }));
    beacon.position.y = 5.2;
    g.add(beacon);
  } else if (vista === 'neon_ribbon') {
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(4.7 - i * 0.55, 0.24, 10, 36), glow);
      ring.position.set(0, 7, -i * 2.1);
      g.add(ring);
    }
  } else if (vista === 'plasma_track') {
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(5.8, 5.8, 0.7, 24), metal);
    pad.position.y = 0.35;
    g.add(pad);
    const energy = new THREE.Mesh(new THREE.TorusGeometry(3.8, 0.32, 10, 32), glow);
    energy.rotation.x = Math.PI / 2;
    energy.position.y = 0.8;
    g.add(energy);
  } else if (vista === 'radar_dome') {
    [-4, 4].forEach((x) => {
      const jamb = new THREE.Mesh(new THREE.BoxGeometry(1, 6, 2), metal);
      jamb.position.set(x, 3, 0);
      g.add(jamb);
    });
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(9, 1, 2), metal);
    lintel.position.y = 6;
    g.add(lintel);
    const stealthLine = new THREE.Mesh(new THREE.BoxGeometry(7, 0.18, 0.2), glow);
    stealthLine.position.set(0, 4.2, -1.05);
    g.add(stealthLine);
  } else if (vista === 'carrier_deck') {
    const deck = new THREE.Mesh(new THREE.BoxGeometry(20, 1, 12), metal);
    g.add(deck);
    const runway = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.06, 10), pbrMat(0xf8fafc));
    runway.position.y = 0.54;
    g.add(runway);
  } else {
    const platform = new THREE.Mesh(
      new THREE.CylinderGeometry(6, 6, 0.8, vista === 'ocean_platforms' ? 16 : 8),
      metal,
    );
    g.add(platform);
    const markA = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.08, 0.7), glow);
    markA.position.y = 0.45;
    g.add(markA);
    const markB = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.08, 4), glow);
    markB.position.y = 0.46;
    g.add(markB);
  }
  scene.add(g);
  return g;
}

/**
 * Full premium aerial backdrop — floating islands, cloud sea, golden sky, GLTF castles.
 */
export function installPremiumAerialScenery(scene, curve, recipe, bounds, trackId, dna = {}) {
  const useReferenceVista = scene.userData.useAerialReferenceVista === true;
  const flyingActive = scene.userData.flyingArenaActive === true;
  const flyingBible = scene.userData.flyingContract?.bible;
  const dnaSky = new THREE.Color(dna.sky ?? 0x87b9d6);
  const dnaFog = new THREE.Color(dna.fog ?? dna.sky ?? 0xffd39a);
  const sky = recipe.sky || {
    top: '#3478b8', mid: '#87b9d6', horizon: '#ffd39a', fog: '#d7b78f', near: 90, far: 320,
  };
  const identitySky = recipe.lockSky ? sky : {
    ...sky,
    top: `#${dnaSky.clone().offsetHSL(0, 0.04, -0.2).getHexString()}`,
    mid: `#${dnaSky.getHexString()}`,
    horizon: `#${dnaFog.clone().offsetHSL(0, -0.05, 0.08).getHexString()}`,
    fog: `#${dnaFog.getHexString()}`,
  };
  if (flyingActive && flyingBible) {
    const premiumArtVista = flyingActive && flyingBible && isArtDirectedVista(flyingBible.aerialVista);
    const kidWorld = scene.userData.kidFlyingWorld === true;
    const bg = identitySky.mid || identitySky.top || '#87ceeb';
    scene.background = new THREE.Color(bg);
    if (!scene.fog && identitySky.fog) {
      scene.fog = new THREE.Fog(identitySky.fog, identitySky.near ?? 95, identitySky.far ?? 340);
    }
    // Kid fluffy world + UE5 vista both install sky — skip duplicate golden-hour stacks.
    if (!premiumArtVista && !kidWorld) {
      if (recipe.goldenHour) {
        const warmPeach = flyingBible.aerialVista === 'cloud_sea' || flyingBible.aerialVista === 'carrier_deck';
        installGoldenHourSky(scene, bounds, { ...identitySky, warmPeach });
      } else {
        installThemedAerialSky(scene, {
          ...recipe,
          lockSky: true,
          sky: identitySky,
          parallaxClouds: recipe.parallaxClouds === true,
          stormClouds: recipe.stormClouds,
          rain: recipe.rain,
          starfieldAbove: recipe.starfieldAbove,
        }, bounds);
      }
    }
  } else {
    installGoldenHourSky(scene, bounds, identitySky);
  }
  const premiumArtVista = flyingActive && flyingBible && isArtDirectedVista(flyingBible.aerialVista);
  const kidWorld = scene.userData.kidFlyingWorld === true;
  if (!useReferenceVista && recipe.parallaxClouds !== false && !flyingActive) {
    addParallaxCloudLayers(scene, bounds.cx ?? 0, bounds.cz ?? 0);
  }
  if (!useReferenceVista && flyingActive && recipe.parallaxClouds && !premiumArtVista && !kidWorld) {
    addParallaxCloudLayers(scene, bounds.cx ?? 0, bounds.cz ?? 0);
  }

  if (!useReferenceVista && !flyingActive) {
    buildAerialIdentitySpawn(scene, curve, dna);
  }
  const flyingCitadel = flyingActive
    && flyingBible?.gltfCitadel
    && flyingBible.aerialVista === 'cloud_sea';
  const isCitadel = flyingCitadel
    || ((!flyingActive) && (!dna.aerialVista || dna.aerialVista === 'cloud_sea'));
  if (isCitadel && !useReferenceVista && !flyingActive) {
    const islandRecipe = {
      ...recipe,
      islandScatter: recipe.islandScatter?.slice(0, 4) || PREMIUM_ISLAND_SCATTER,
    };
    scatterAerialIslands(scene, curve, islandRecipe, bounds);
    scatterDistantSilhouetteIslands(scene, curve, bounds);
  }
  if (isCitadel && recipe.hero && !useReferenceVista && !flyingActive) {
    placeAerialHero(scene, curve, recipe);
  }

  if (flyingActive && flyingBible) {
    installFlyingCinematicLighting(scene, bounds, flyingBible.sky || identitySky);
  } else {
    installPremiumSkyLighting(scene);
  }
  scene.userData.premiumKidVisuals = true;
  const bloomLevel = flyingActive
    ? (flyingBible?.bloom ?? (recipe.goldenHour ? 0.24 : 0.2))
    : (recipe.goldenHour ? 0.24 : 0.2);
  scene.userData.raceVisual = {
    ...(scene.userData.raceVisual || {}),
    bloom: bloomLevel,
    threshold: 0.88,
    radius: 0.18,
    grade: { s: 1.18, c: 1.08, g: [1.03, 1.0, 1.04] },
  };

  if (isCitadel && !useReferenceVista && !flyingActive) {
    enrichAerialFloatingIslands(scene, trackId).catch(() => {});
  }
  if (!useReferenceVista && !flyingActive) {
    installAerialCinematicAtmosphere(scene, bounds, recipe, trackId).catch(() => {});
  }
}

function addLandmarkMesh(group, geometry, color, position, options = {}) {
  const mesh = new THREE.Mesh(geometry, pbrMat(color, options));
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

export function buildGroundIdentityLandmark(dna) {
  const g = new THREE.Group();
  const kind = dna.floorKind;
  const accent = 0x22d3ee;
  if (kind === 'martian_dirt') {
    addLandmarkMesh(g, new THREE.CylinderGeometry(4.8, 6.5, 4, 10), 0x9f4635, [0, 2, 0]);
    addLandmarkMesh(g, new THREE.CylinderGeometry(0.08, 0.1, 7, 8), 0xe2e8f0, [0, 6.5, 0]);
    addLandmarkMesh(g, new THREE.BoxGeometry(2.8, 1.4, 0.12), 0x2563eb, [1.4, 8.8, 0]);
  } else if (kind === 'lunar_grey') {
    const dish = addLandmarkMesh(g, new THREE.SphereGeometry(3, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2), 0xe2e8f0, [0, 4, 0], { metalness: 0.45 });
    dish.rotation.x = -0.55;
    addLandmarkMesh(g, new THREE.CylinderGeometry(0.35, 0.5, 4, 10), 0x64748b, [0, 2, 0]);
  } else if (kind === 'mine_tunnel') {
    [-2, 0, 2].forEach((x, i) => addLandmarkMesh(g, new THREE.OctahedronGeometry(1.5 + i * 0.25), accent, [x, 1.6 + i * 0.35, 0], { emissive: accent, emi: 0.55 }));
  } else if (kind === 'farm_field') {
    addLandmarkMesh(g, new THREE.BoxGeometry(7, 5, 6), 0xdc2626, [0, 2.5, 0]);
    const roof = addLandmarkMesh(g, new THREE.ConeGeometry(5, 2.7, 4), 0x7f1d1d, [0, 6.2, 0]);
    roof.rotation.y = Math.PI / 4;
  } else if (kind === 'asphalt_lot') {
    addLandmarkMesh(g, new THREE.BoxGeometry(4, 4, 4), 0x334155, [0, 2, 0]);
    addLandmarkMesh(g, new THREE.BoxGeometry(10, 0.45, 0.55), 0xf97316, [5, 4.8, 0], { emissive: 0xf97316, emi: 0.16 });
  } else if (kind === 'factory_floor') {
    addLandmarkMesh(g, new THREE.BoxGeometry(9, 1.2, 4), 0x475569, [0, 0.8, 0], { metalness: 0.55 });
    addLandmarkMesh(g, new THREE.BoxGeometry(1, 6, 1), 0xfbbf24, [-3, 4, 0], { metalness: 0.45 });
    addLandmarkMesh(g, new THREE.BoxGeometry(5, 0.7, 0.7), 0xfbbf24, [-0.5, 6.5, 0], { metalness: 0.45 });
  } else if (kind === 'lab_grid') {
    addLandmarkMesh(g, new THREE.BoxGeometry(8, 0.6, 5), 0x93c5fd, [0, 0.3, 0]);
    [-2.4, 0, 2.4].forEach((x) => addLandmarkMesh(g, new THREE.BoxGeometry(1.5, 0.35, 1.5), 0x1d4ed8, [x, 0.78, 0], { metalness: 0.28 }));
  } else if (kind === 'stud_mat') {
    [[0, 0, 0xef4444], [1.5, 1.3, 0x3b82f6], [-1.5, 2.6, 0xfbbf24]].forEach(([x, y, c]) => {
      addLandmarkMesh(g, new THREE.BoxGeometry(5, 1.2, 2.5), c, [x, y + 0.6, 0]);
    });
  } else if (kind === 'gym_mats') {
    addLandmarkMesh(g, new THREE.BoxGeometry(9, 0.55, 1), 0xf59e0b, [0, 3.1, 0]);
    [-3.6, 3.6].forEach((x) => addLandmarkMesh(g, new THREE.BoxGeometry(0.7, 3, 0.8), 0x475569, [x, 1.5, 0]));
  } else if (kind === 'scrap_yard') {
    addLandmarkMesh(g, new THREE.BoxGeometry(8, 4, 4), 0xf97316, [0, 2, 0], { metalness: 0.38 });
    addLandmarkMesh(g, new THREE.TorusGeometry(1, 0.22, 8, 20), 0x94a3b8, [0, 8, 0], { metalness: 0.7 });
  } else if (kind === 'climb_shaft') {
    addLandmarkMesh(g, new THREE.TorusGeometry(3.5, 0.28, 8, 28), 0xe2e8f0, [0, 7, 0], { metalness: 0.55 });
    addLandmarkMesh(g, new THREE.CylinderGeometry(0.12, 0.12, 6, 8), 0xe2e8f0, [0, 3, 0]);
  } else if (kind === 'rooftop_tar') {
    addLandmarkMesh(g, new THREE.BoxGeometry(4, 5, 2), 0x111827, [0, 2.5, 0]);
    addLandmarkMesh(g, new THREE.PlaneGeometry(2.7, 2), 0xec4899, [0, 3.1, -1.02], { emissive: 0xec4899, emi: 0.5 });
  } else if (kind === 'temple_tiles') {
    [-3.5, 3.5].forEach((x) => addLandmarkMesh(g, new THREE.BoxGeometry(0.7, 8, 0.8), 0xdc2626, [x, 4, 0]));
    addLandmarkMesh(g, new THREE.BoxGeometry(8, 0.8, 0.9), 0xdc2626, [0, 7.5, 0]);
  } else if (kind === 'sandy_seabed') {
    const coral = addLandmarkMesh(g, new THREE.TorusGeometry(3.3, 0.55, 10, 28), 0xf472b6, [0, 3.4, 0]);
    coral.material.emissive?.setHex(0x831843);
    coral.material.emissiveIntensity = 0.18;
  } else if (kind === 'abyss_rock') {
    [-2.5, 0, 2.5].forEach((x, i) => addLandmarkMesh(g, new THREE.ConeGeometry(1.2, 4 + i, 10), 0x334155, [x, 2 + i / 2, 0]));
    addLandmarkMesh(g, new THREE.SphereGeometry(0.55, 10, 8), accent, [0, 7.5, 0], { emissive: accent, emi: 0.8 });
  } else if (kind === 'hospital_tile') {
    addLandmarkMesh(g, new THREE.BoxGeometry(7, 1, 3), 0xe2e8f0, [0, 1.2, 0]);
    addLandmarkMesh(g, new THREE.BoxGeometry(3, 0.6, 0.5), 0x2563eb, [0, 5, 0], { emissive: 0x2563eb, emi: 0.28 });
    addLandmarkMesh(g, new THREE.BoxGeometry(0.6, 3, 0.5), 0x2563eb, [0, 5, 0], { emissive: 0x2563eb, emi: 0.28 });
  } else if (kind === 'wet_street') {
    addLandmarkMesh(g, new THREE.CylinderGeometry(0.8, 1, 3, 10), 0xdc2626, [0, 1.5, 0]);
    addLandmarkMesh(g, new THREE.TorusGeometry(1.2, 0.25, 8, 20), 0xf97316, [0, 5.4, 0], { emissive: 0xf97316, emi: 0.5 });
  } else if (kind === 'rubble_street') {
    addLandmarkMesh(g, new THREE.CylinderGeometry(0.1, 0.12, 7, 8), 0xe2e8f0, [0, 3.5, 0]);
    addLandmarkMesh(g, new THREE.BoxGeometry(3.4, 1.8, 0.18), 0xf97316, [1.7, 6.1, 0], { emissive: 0xf97316, emi: 0.24 });
  } else {
    addLandmarkMesh(g, new THREE.CylinderGeometry(2.4, 3, 5, 10), 0x64748b, [0, 2.5, 0]);
    addLandmarkMesh(g, new THREE.SphereGeometry(0.65, 10, 8), 0x22c55e, [0, 5.4, 0], { emissive: 0x22c55e, emi: 0.55 });
  }
  return g;
}

/** Ground mission polish — warm sun + one signature landmark from robot DNA. */
export function installPremiumGroundScenery(scene, challenge, curve) {
  const chassisId = challenge?.chassisId || 'custom';
  const dna = CHASSIS_VISUAL_DNA[chassisId] || CHASSIS_VISUAL_DNA.custom;
  if (scene.getObjectByName('PremiumGroundLandmark')) return;

  installPremiumSkyLighting(scene);
  const deepPost = scene.userData.robotDeepRenderSpec?.post || {};
  scene.userData.raceVisual = {
    ...(scene.userData.raceVisual || {}),
    bloom: deepPost.bloom ?? 0.14,
    threshold: deepPost.threshold ?? 0.92,
    radius: deepPost.radius ?? 0.14,
  };

  if (!curve) return;
  const t = 0.72;
  const p = curve.getPoint(t);
  const g = buildGroundIdentityLandmark(dna);
  g.name = 'PremiumGroundLandmark';
  g.position.set(p.x + 16, 0, p.z - 8);
  scene.add(g);
  scene.userData.premiumKidVisuals = true;
}
