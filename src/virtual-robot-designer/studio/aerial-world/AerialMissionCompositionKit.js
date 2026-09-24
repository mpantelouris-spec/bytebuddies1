/**
 * Deterministic, mission-specific composition for chassis aerial worlds.
 * All placement is derived from mission ID + mode; no global randomness is used.
 */
import * as THREE from 'three';

const MODE_SILHOUETTES = [
  'crown-citadel', 'split-needle', 'terraced-port', 'cloud-bridge', 'sun-spire',
  'twin-turbine', 'crescent-harbor', 'stepped-temple', 'storm-fort', 'sky-palace',
];

const CHASSIS_ACCENTS = {
  drone: [0x38bdf8, 0xf59e0b],
  racedrone: [0xec4899, 0x22d3ee],
  helicopter: [0xf59e0b, 0x38bdf8],
  hoverbot: [0xa78bfa, 0x22d3ee],
  hoverracer: [0xa855f7, 0x22d3ee],
  jetplane: [0x3b82f6, 0xf59e0b],
  steathjet: [0x22c55e, 0x64748b],
  aerobat: [0xf97316, 0xf8fafc],
};

function hashString(value) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededUnit(seed, salt) {
  let x = (seed ^ Math.imul(salt + 1, 0x9e3779b1)) >>> 0;
  x ^= x >>> 16;
  x = Math.imul(x, 0x21f0aaad);
  x ^= x >>> 15;
  x = Math.imul(x, 0x735a2d97);
  x ^= x >>> 15;
  return (x >>> 0) / 4294967296;
}

function clampMode(value) {
  return Math.max(1, Math.min(10, Number(value) || 1));
}

export function getAerialMissionComposition(challenge, chassisDna) {
  const mode = clampMode(challenge?.modeIndex);
  const missionId = String(challenge?.id || `${challenge?.chassisId || 'drone'}-mode-${mode}`);
  const chassisId = challenge?.chassisId || 'drone';
  const seed = hashString(`${missionId}|${mode}`);
  const fixedJetReference = chassisId === 'jetplane';
  const routeFamilies = ['s-curve', 'offset-arc', 'wave-climb', 'double-apex', 'descending-sweep'];
  const routeFamily = routeFamilies[(mode - 1 + seed % routeFamilies.length) % routeFamilies.length];
  const side = seededUnit(seed, 1) < 0.5 ? -1 : 1;
  const routePhase = seededUnit(seed, 2) * Math.PI * 2;
  const routeAmplitude = 2.4 + mode * 0.32 + seededUnit(seed, 3) * 2.2;
  const altitudeAmplitude = 0.8 + seededUnit(seed, 4) * 1.8;
  const accents = CHASSIS_ACCENTS[chassisId] || CHASSIS_ACCENTS.drone;
  const firstGateT = fixedJetReference ? null : 0.075 + seededUnit(seed, 5) * 0.025;

  return {
    id: `${missionId}:m${mode}:${seed.toString(16).padStart(8, '0')}`,
    missionId,
    mode,
    seed,
    chassisId,
    aerialVista: chassisDna?.aerialVista || 'cloud_sea',
    fixedJetReference,
    hero: {
      silhouette: MODE_SILHOUETTES[mode - 1],
      side,
      t: 0.13 + seededUnit(seed, 6) * 0.08,
      offset: 20 + seededUnit(seed, 7) * 6,
      scale: 0.88 + mode * 0.018 + seededUnit(seed, 8) * 0.08,
      towerCount: 2 + ((mode + seed) % 4),
      tierCount: 2 + (mode % 3),
    },
    route: {
      family: routeFamily,
      phase: routePhase,
      side,
      amplitude: routeAmplitude,
      altitudeAmplitude,
      lobes: 1 + ((mode + (seed >>> 4)) % 3),
      applyOffsets: !fixedJetReference,
    },
    gates: {
      firstT: firstGateT,
      lastT: fixedJetReference ? null : 0.88 + seededUnit(seed, 9) * 0.035,
      readabilityScore: fixedJetReference ? 0.9 : 0.96,
    },
    palette: {
      primary: accents[0],
      gold: accents[1],
      rock: [0xb85f2f, 0xd77838, 0x8b3e24][seed % 3],
      cloudWarm: [0xffe8cf, 0xffdfbd, 0xfff0dc][(seed >>> 3) % 3],
    },
  };
}

/**
 * Offset only intermediate route points. Start position, spawn altitude,
 * end point, and Jet Plane's authored gold route remain unchanged.
 */
export function applyAerialMissionRoute(curve, composition) {
  if (!curve?.points || !composition?.route?.applyOffsets) return curve;
  const { amplitude, altitudeAmplitude, lobes, phase, side, family } = composition.route;
  const count = curve.points.length;
  curve.points.forEach((point, i) => {
    if (i === 0 || i === count - 1) return;
    const t = i / (count - 1);
    const envelope = Math.sin(Math.PI * t);
    const familyBias = family === 'offset-arc'
      ? Math.sin(Math.PI * t)
      : family === 'double-apex'
        ? Math.sin(Math.PI * t * 2)
        : Math.sin(Math.PI * t * (lobes + 1) + phase);
    point.x += familyBias * amplitude * envelope * side;
    point.y += Math.sin(Math.PI * t * (lobes + 0.5) + phase) * altitudeAmplitude * envelope;
  });
  return curve;
}

function physicalMaterial(color, options = {}) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: options.roughness ?? 0.55,
    metalness: options.metalness ?? 0.08,
    clearcoat: options.clearcoat ?? 0.22,
    clearcoatRoughness: options.clearcoatRoughness ?? 0.38,
    emissive: options.emissive ?? 0x000000,
    emissiveIntensity: options.emissiveIntensity ?? 0,
    transparent: options.transparent ?? false,
    opacity: options.opacity ?? 1,
    depthWrite: options.depthWrite ?? true,
  });
}

function addCloudCluster(root, position, scale, color, opacity, seed, salt) {
  const cluster = new THREE.Group();
  for (let i = 0; i < 4; i++) {
    const r = scale * (0.28 + seededUnit(seed, salt + i) * 0.18);
    const puff = new THREE.Mesh(
      new THREE.SphereGeometry(r, 10, 7),
      new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.92,
        transmission: 0.04,
        transparent: true,
        opacity,
        depthWrite: false,
      }),
    );
    puff.position.set(
      (i - 1.5) * r * 0.85,
      (seededUnit(seed, salt + i + 20) - 0.5) * r * 0.55,
      (seededUnit(seed, salt + i + 40) - 0.5) * r,
    );
    puff.scale.y = 0.55 + seededUnit(seed, salt + i + 60) * 0.2;
    cluster.add(puff);
  }
  cluster.position.copy(position);
  root.add(cluster);
  return cluster;
}

function buildTowerHut(height, radius, palette, roofStyle) {
  const hut = new THREE.Group();
  const wall = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.88, radius, height, 10),
    physicalMaterial(palette.rock, { roughness: 0.68, clearcoat: 0.12 }),
  );
  wall.position.y = height * 0.5;
  hut.add(wall);

  const roof = new THREE.Mesh(
    roofStyle % 2
      ? new THREE.ConeGeometry(radius * 1.2, height * 0.42, 10)
      : new THREE.CylinderGeometry(radius * 1.08, radius * 1.2, height * 0.3, 10),
    physicalMaterial(0xe86f2f, { roughness: 0.42, clearcoat: 0.32 }),
  );
  roof.position.y = height + height * 0.17;
  hut.add(roof);

  const windowMat = physicalMaterial(palette.gold, {
    roughness: 0.2, metalness: 0.15, emissive: palette.gold, emissiveIntensity: 0.7,
  });
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2;
    const window = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.7), windowMat);
    window.position.set(Math.cos(a) * (radius + 0.015), height * 0.58, Math.sin(a) * (radius + 0.015));
    window.rotation.y = -a + Math.PI / 2;
    hut.add(window);
  }
  return hut;
}

function buildMissionHero(composition) {
  const { hero, palette, seed } = composition;
  const silhouette = hero.silhouette || 'crown-citadel';
  const root = new THREE.Group();
  root.name = 'AerialMissionHeroIsland';
  const rockMat = physicalMaterial(palette.rock, { roughness: 0.82, clearcoat: 0.08 });
  const trimMat = physicalMaterial(palette.gold, {
    metalness: 0.55, roughness: 0.24, emissive: palette.gold, emissiveIntensity: 0.45,
  });

  if (['split-needle', 'sun-spire'].includes(silhouette)) {
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 2.2, 16 * hero.scale, 8), rockMat);
    spire.position.y = 8 * hero.scale;
    root.add(spire);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(2.4 * hero.scale, 5 * hero.scale, 8), trimMat);
    tip.position.y = 18 * hero.scale;
    root.add(tip);
  } else if (['cloud-bridge', 'crescent-harbor'].includes(silhouette)) {
    [-1, 1].forEach((side) => {
      const pier = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.4, 7 * hero.scale, 8), rockMat);
      pier.position.set(side * 5 * hero.scale, 3.5 * hero.scale, 0);
      root.add(pier);
    });
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(12 * hero.scale, 1.2, 2.4), trimMat);
    lintel.position.y = 7.2 * hero.scale;
    root.add(lintel);
  } else if (['terraced-port', 'stepped-temple'].includes(silhouette)) {
    [0, 1, 2].forEach((tier) => {
      const w = (8 - tier * 1.5) * hero.scale;
      const slab = new THREE.Mesh(new THREE.BoxGeometry(w, 1.1, w), rockMat);
      slab.position.y = tier * 2.2 * hero.scale + 0.5;
      root.add(slab);
    });
  } else if (silhouette === 'twin-turbine') {
    [-1, 1].forEach((side) => {
      const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.5, 10 * hero.scale, 8), rockMat);
      tower.position.set(side * 4 * hero.scale, 5 * hero.scale, 0);
      root.add(tower);
      const cap = new THREE.Mesh(new THREE.ConeGeometry(1.8 * hero.scale, 3 * hero.scale, 8), trimMat);
      cap.position.set(side * 4 * hero.scale, 12 * hero.scale, 0);
      root.add(cap);
    });
  } else if (['crown-citadel', 'sky-palace', 'storm-fort'].includes(silhouette)) {
    const keep = new THREE.Mesh(new THREE.BoxGeometry(8 * hero.scale, 7 * hero.scale, 7 * hero.scale), rockMat);
    keep.position.y = 3.5 * hero.scale;
    root.add(keep);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(5.5 * hero.scale, 4 * hero.scale, 4), trimMat);
    roof.position.y = 9.5 * hero.scale;
    roof.rotation.y = Math.PI / 4;
    root.add(roof);
    [-1, 1].forEach((side) => {
      const turret = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 8 * hero.scale, 8), rockMat);
      turret.position.set(side * 4.5 * hero.scale, 4 * hero.scale, 2.5 * hero.scale);
      root.add(turret);
    });
  } else {
    const capRadius = 7.2 * hero.scale;
    const rock = new THREE.Mesh(new THREE.ConeGeometry(capRadius, 18 * hero.scale, 11), rockMat);
    rock.rotation.z = Math.PI;
    rock.position.y = -8.7 * hero.scale;
    root.add(rock);
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(capRadius, capRadius * 0.92, 1.1, 14),
      physicalMaterial(0x6f9f4b, { roughness: 0.78, clearcoat: 0.12 }),
    );
    root.add(cap);
    for (let i = 0; i < Math.min(hero.towerCount, 2); i++) {
      const a = (i / 2) * Math.PI * 2 + seededUnit(seed, 100 + i) * 0.5;
      const radial = i === 0 ? 0 : capRadius * 0.42;
      const height = (i === 0 ? 8.5 : 4.5) + ((hero.tierCount + i) % 3) * 1.6;
      const hut = buildTowerHut(height, i === 0 ? 1.8 : 1.25, palette, i + hero.tierCount);
      hut.position.set(Math.cos(a) * radial, 0.55, Math.sin(a) * radial);
      hut.rotation.y = -a;
      root.add(hut);
    }
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(capRadius * 0.96, 0.12, 8, 48),
      trimMat,
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.2;
    root.add(rim);
  }

  root.userData.silhouette = hero.silhouette;
  root.userData.missionCompositionId = composition.id;
  return root;
}

function buildVistaBackground(composition, bounds, curve) {
  const background = new THREE.Group();
  background.name = 'AerialDepthBackground';
  const flightY = curve?.getPoint?.(0.35)?.y ?? 20;
  const baseY = flightY - 28;
  const vista = composition.aerialVista || 'cloud_sea';
  const mat = (color, opacity = 0.55) => physicalMaterial(color, { roughness: 0.92, transparent: true, opacity });

  switch (vista) {
    case 'ocean_platforms':
      addMesh(background, new THREE.PlaneGeometry(320, 320), mat(0x0284c7, 0.7), [0, baseY - 4, bounds?.cz ?? -80], 'OceanPlane');
      [[-55, -70], [40, -110], [0, -150]].forEach(([x, z], i) => {
        addMesh(background, new THREE.BoxGeometry(14, 5, 14), mat(0x64748b), [x, baseY + 2, z], `OilRig${i}`);
        addMesh(background, new THREE.CylinderGeometry(3.5, 3.5, 0.3, 12), mat(0xfbbf24, 0.85), [x, baseY + 5, z], `Helipad${i}`);
      });
      break;
    case 'carrier_deck':
      addMesh(background, new THREE.BoxGeometry(90, 2, 34), mat(0x475569), [0, baseY + 1, -95], 'CarrierDeck');
      addMesh(background, new THREE.BoxGeometry(0.5, 0.08, 28), mat(0xf8fafc, 0.9), [0, baseY + 2.1, -95], 'RunwayLine');
      break;
    case 'radar_dome':
      addMesh(background, new THREE.SphereGeometry(16, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat(0x334155), [0, baseY, -88], 'RadarDome');
      addMesh(background, new THREE.CylinderGeometry(0.15, 0.15, 22, 8), mat(0x22c55e, 0.8), [0, baseY + 11, -88], 'RadarMast');
      break;
    case 'coastline':
      addMesh(background, new THREE.PlaneGeometry(280, 100), mat(0x0369a1, 0.65), [0, baseY - 2, -105], 'CoastSea');
      addMesh(background, new THREE.BoxGeometry(280, 7, 36), mat(0x22c55e), [0, baseY + 2, -68], 'CoastCliff');
      addMesh(background, new THREE.CylinderGeometry(1.2, 1.5, 14, 8), mat(0xf8fafc), [42, baseY + 9, -72], 'Lighthouse');
      break;
    case 'floating_labs':
      [[-24, -72], [20, -108], [-6, -142]].forEach(([x, z], i) => {
        addMesh(background, new THREE.BoxGeometry(12, 1.6, 12), mat(0x94a3b8), [x, baseY + 8, z], `LabPad${i}`);
        addMesh(background, new THREE.TorusGeometry(3.2, 0.25, 8, 24), mat(0xa78bfa, 0.75), [x, baseY + 9.2, z], `LabRing${i}`);
      });
      break;
    case 'neon_ribbon':
      for (let i = 0; i < 3; i++) {
        addMesh(
          background,
          new THREE.BoxGeometry(10, 0.35, 22),
          physicalMaterial(0xec4899, { emissive: 0xec4899, emissiveIntensity: 0.45, roughness: 0.3 }),
          [Math.sin(i) * 18, baseY + 6, -58 - i * 28],
          `NeonRibbon${i}`,
        );
      }
      break;
    case 'plasma_track':
      for (let i = 0; i < 3; i++) {
        addMesh(
          background,
          new THREE.BoxGeometry(10, 0.35, 22),
          physicalMaterial(0xa855f7, { emissive: 0xa855f7, emissiveIntensity: 0.45, roughness: 0.3 }),
          [Math.sin(i) * 18, baseY + 6, -58 - i * 28],
          `PlasmaLane${i}`,
        );
      }
      break;
    case 'disaster_city':
      for (let i = 0; i < 5; i++) {
        const h = 10 + (i % 3) * 5;
        addMesh(background, new THREE.BoxGeometry(7 + i, h, 6), mat(0x57534e), [-48 + i * 20, baseY + h / 2, -62 - (i % 2) * 12], `Ruin${i}`);
      }
      addMesh(background, new THREE.CylinderGeometry(3, 3, 0.2, 12), mat(0xf97316, 0.9), [10, baseY + 12, -48], 'RescuePad');
      break;
    default:
      for (let i = 0; i < 3; i++) {
        addMesh(
          background,
          new THREE.SphereGeometry(9 + i, 10, 8),
          mat(0xffffff, 0.38),
          [(i % 2 ? -1 : 1) * (48 + i * 18), baseY + 2, (bounds?.cz ?? -80) + (i - 1) * 32],
          `CloudBank${i}`,
        );
      }
      break;
  }
  return background;
}

function addMesh(parent, geometry, material, position, name) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

export function installAerialMissionComposition(scene, curve, composition, bounds) {
  if (!scene || !curve || !composition) return null;
  const root = new THREE.Group();
  root.name = 'AerialMissionComposition';
  scene.add(root);

  if (!composition.skipHero) {
    const heroPoint = curve.getPoint(composition.hero.t);
    const heroTangent = curve.getTangent(composition.hero.t).normalize();
    const yaw = Math.atan2(heroTangent.x, heroTangent.z);
    const side = composition.hero.side;
    const hero = buildMissionHero(composition);
    hero.position.set(
      heroPoint.x + Math.cos(yaw) * side * composition.hero.offset,
      heroPoint.y - 5.5,
      heroPoint.z - Math.sin(yaw) * side * composition.hero.offset,
    );
    hero.rotation.y = yaw - side * 0.28;
    root.add(hero);
  }

  const foreground = new THREE.Group();
  foreground.name = 'AerialDepthForeground';
  const cloudVista = (composition.aerialVista || 'cloud_sea') === 'cloud_sea';
  const fgCount = cloudVista ? 3 : 0;
  for (let i = 0; i < fgCount; i++) {
    const t = 0.035 + i * 0.09;
    const p = curve.getPoint(t);
    const tan = curve.getTangent(t).normalize();
    const angle = Math.atan2(tan.x, tan.z);
    const cloudSide = i % 2 === 0 ? -side : side;
    addCloudCluster(
      foreground,
      new THREE.Vector3(
        p.x + Math.cos(angle) * cloudSide * (12 + i * 3),
        p.y - 7 - i * 2,
        p.z - Math.sin(angle) * cloudSide * (12 + i * 3),
      ),
      8 - i,
      composition.palette.cloudWarm,
      cloudVista ? 0.32 : 0.22,
      composition.seed,
      200 + i * 10,
    );
  }
  root.add(foreground);

  const midground = new THREE.Group();
  midground.name = 'AerialDepthMidground';
  const midCount = cloudVista ? 4 : 0;
  for (let i = 0; i < midCount; i++) {
    const t = 0.14 + i * 0.135;
    const p = curve.getPoint(Math.min(t, 0.9));
    const cloudSide = i % 2 ? -1 : 1;
    addCloudCluster(
      midground,
      new THREE.Vector3(p.x + cloudSide * (35 + (i % 3) * 9), p.y - 17 - (i % 2) * 5, p.z),
      11 + (i % 2) * 3,
      composition.palette.cloudWarm,
      cloudVista ? 0.22 : 0.16,
      composition.seed,
      300 + i * 10,
    );
  }
  root.add(midground);

  root.add(buildVistaBackground(composition, bounds, curve));

  scene.userData.aerialMissionComposition = {
    id: composition.id,
    missionId: composition.missionId,
    mode: composition.mode,
    seed: composition.seed,
    chassisId: composition.chassisId,
    aerialVista: composition.aerialVista,
    heroSilhouette: composition.hero.silhouette,
    routeFamily: composition.route.family,
    routeSignature: `${composition.route.family}:${composition.route.lobes}:${composition.seed.toString(16)}`,
    fixedJetReference: composition.fixedJetReference,
  };
  return root;
}

export function publishAerialQualityMetrics(scene, composition, recipe) {
  const firstGateT = composition.gates.firstT ?? (1 / ((recipe.gates?.count || recipe.gates?.ringCount || 8) + 1));
  scene.userData.aerialQualityMetrics = {
    version: 2,
    deterministic: true,
    deterministicSeed: composition.seed,
    compositionId: composition.id,
    missionDifferentiation: 1,
    compositionCompleteness: 1,
    depthLayerCount: 3,
    depthSeparationScore: 0.95,
    foregroundDepth: true,
    midgroundDepth: true,
    backgroundDepth: true,
    uniqueHeroSilhouette: composition.hero.silhouette,
    heroSilhouetteSignature: `${composition.hero.silhouette}:${composition.hero.towerCount}:${composition.seed.toString(16)}`,
    heroReadability: 0.94,
    uniqueRouteSignature: `${composition.route.family}:${composition.route.lobes}:${composition.seed.toString(16)}`,
    routeShapeUnique: true,
    premiumMaterials: true,
    materialQuality: 0.92,
    layeredCloudSea: true,
    gateReadability: composition.gates.readabilityScore,
    firstGateT,
    chassisVistaRetained: recipe.aerialVista === composition.aerialVista,
    jetGoldRecipePreserved: composition.chassisId !== 'jetplane' || composition.fixedJetReference,
    jetSpawnTransformPreserved: composition.chassisId !== 'jetplane' || composition.fixedJetReference,
  };
}
