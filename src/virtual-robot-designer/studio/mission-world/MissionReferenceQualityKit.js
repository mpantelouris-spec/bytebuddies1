/**
 * MissionReferenceQualityKit
 *
 * Deterministic, route-aware ground compositions derived from the authored
 * Visual Bible.  The kit deliberately uses a small vocabulary of shared PBR
 * primitives: art direction supplies the authorship while instancing keeps
 * the scene budget predictable across the full mission catalogue.
 */
import * as THREE from 'three';
import { MISSION_ART_DIRECTION_V3 } from './MissionArtDirectionV3.js';
import { CHASSIS_VISUAL_DNA } from './MissionKidClarity.js';

export const MISSION_REFERENCE_QUALITY_VERSION = '2026-09-07-v3-floor-identity';

const FLOOR_LAYER_MAP = {
  farm_field: { foreground: 'cone', route: 'cone', skyline: 'cone' },
  hospital_tile: { foreground: 'cube', route: 'cube', skyline: 'cube' },
  combat_ring: { foreground: 'torus', route: 'cylinder', skyline: 'cylinder' },
  temple_tiles: { foreground: 'cylinder', route: 'cylinder', skyline: 'cone' },
  sandy_seabed: { foreground: 'sphere', route: 'torus', skyline: 'cone' },
  abyss_rock: { foreground: 'rock', route: 'rock', skyline: 'cone' },
  lab_grid: { foreground: 'cube', route: 'sphere', skyline: 'cube' },
  scrap_yard: { foreground: 'rock', route: 'cylinder', skyline: 'cube' },
  gym_mats: { foreground: 'cylinder', route: 'cylinder', skyline: 'cube' },
  factory_floor: { foreground: 'cube', route: 'cylinder', skyline: 'cube' },
  mine_tunnel: { foreground: 'rock', route: 'cylinder', skyline: 'rock' },
  climb_shaft: { foreground: 'torus', route: 'cylinder', skyline: 'cylinder' },
  rooftop_tar: { foreground: 'cube', route: 'cube', skyline: 'cube' },
  wet_street: { foreground: 'cube', route: 'cylinder', skyline: 'cube' },
  rubble_street: { foreground: 'rock', route: 'cube', skyline: 'cube' },
  desert_sand: { foreground: 'cone', route: 'rock', skyline: 'cone' },
  lunar_grey: { foreground: 'sphere', route: 'rock', skyline: 'sphere' },
  flappy_scroll: { foreground: 'cone', route: 'cone', skyline: 'cone' },
  stud_mat: { foreground: 'cube', route: 'cube', skyline: 'cube' },
  asphalt_lot: { foreground: 'cube', route: 'cylinder', skyline: 'cube' },
  open_sky: { foreground: 'sphere', route: 'torus', skyline: 'cone' },
};

function layerGeometry(recipe, layer) {
  const kind = recipe.floorKind || 'martian_dirt';
  const shape = FLOOR_LAYER_MAP[kind]?.[layer] || 'rock';
  return GEOMETRY[shape] || GEOMETRY.rock;
}

const GEOMETRY = {
  cube: new THREE.BoxGeometry(1, 1, 1),
  cylinder: new THREE.CylinderGeometry(0.5, 0.58, 1, 10),
  rock: new THREE.DodecahedronGeometry(0.7, 0),
  cone: new THREE.ConeGeometry(0.65, 1.5, 9),
  sphere: new THREE.SphereGeometry(0.6, 12, 8),
  torus: new THREE.TorusGeometry(0.75, 0.12, 8, 20),
  plane: new THREE.PlaneGeometry(1, 1),
};

const MATERIAL_CACHE = new Map();
const UP = new THREE.Vector3(0, 1, 0);
const dummy = new THREE.Object3D();

function hashString(value) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededUnit(seed, salt = 0) {
  let x = (seed + Math.imul(salt + 1, 0x9e3779b1)) >>> 0;
  x ^= x >>> 16;
  x = Math.imul(x, 0x21f0aaad);
  x ^= x >>> 15;
  x = Math.imul(x, 0x735a2d97);
  return ((x ^ (x >>> 15)) >>> 0) / 4294967296;
}

function colorNumber(value, fallback) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)) {
    return Number.parseInt(value.slice(1), 16);
  }
  return fallback;
}

function pbr(color, options = {}) {
  const key = [
    color,
    options.roughness ?? 0.72,
    options.metalness ?? 0.08,
    options.emissive ?? 0,
    options.emissiveIntensity ?? 0,
    options.transparent ? 1 : 0,
    options.opacity ?? 1,
  ].join(':');
  if (!MATERIAL_CACHE.has(key)) {
    const params = {
      color,
      roughness: options.roughness ?? 0.72,
      metalness: options.metalness ?? 0.08,
      emissive: options.emissive ?? 0x000000,
      emissiveIntensity: options.emissiveIntensity ?? 0,
      transparent: options.transparent ?? false,
      opacity: options.opacity ?? 1,
      depthWrite: options.depthWrite ?? true,
    };
    if (options.side !== undefined) params.side = options.side;
    MATERIAL_CACHE.set(key, new THREE.MeshStandardMaterial(params));
  }
  return MATERIAL_CACHE.get(key);
}

function slug(value) {
  return String(value || 'mission')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 42);
}

function resolveMissionEntry(challenge) {
  const directId = challenge?.id;
  if (directId && MISSION_ART_DIRECTION_V3[directId]) {
    return { missionId: directId, art: MISSION_ART_DIRECTION_V3[directId] };
  }
  const chassisId = challenge?.chassisId || challenge?.modeSpec?.chassisId;
  const modeNumber = Number(
    challenge?.modeIndex
    || challenge?.modeNumber
    || challenge?.modeSpec?.modeNumber
    || 1,
  );
  const match = Object.entries(MISSION_ART_DIRECTION_V3).find(([, art]) => (
    art.chassisId === chassisId && Number(art.modeNumber) === modeNumber
  ));
  if (match) return { missionId: match[0], art: match[1] };
  const title = challenge?.shortName || challenge?.modeName || challenge?.title || challenge?.name || 'Ground Mission';
  return {
    missionId: directId || `${chassisId || 'custom'}_${slug(title)}`,
    art: {
      chassisId: chassisId || 'custom',
      modeNumber,
      title,
      environmentId: challenge?.environmentId || 'industrial',
      lookDescription: challenge?.gameplayDescription || challenge?.description || title,
      heroDescription: challenge?.uniqueElements?.feature2 || challenge?.primaryObjective?.label || title,
      goalDescription: challenge?.primaryObjective?.label || 'Reach the mission goal',
      palette: {},
    },
  };
}

function classifyMotif(text) {
  const rules = [
    ['water', /water|ocean|coral|reef|puddle|mud|river|seabed|trench|submarine|rain/i],
    ['farm', /farm|crop|orchard|wheat|barn|soil|greenhouse|hay|apple/i],
    ['crystal', /crystal|diamond|gem|ore|mine|cave|rock|boulder|rubble|mountain/i],
    ['fire', /fire|lava|volcan|burn|heat|flame|steam/i],
    ['temple', /temple|torii|ninja|pagoda|lantern|dojo/i],
    ['medical', /hospital|medical|medkit|clinic|rescue|patient/i],
    ['play', /lego|brick|play|disco|party|toy/i],
    ['gym', /gym|hurdle|balance|training|sport|jump/i],
    ['city', /city|street|rooftop|warehouse|security|vault|traffic|building/i],
    ['science', /lab|scanner|satellite|radar|solar|research|precision/i],
    ['industrial', /factory|conveyor|pipe|scrap|crane|metal|assembly|hydraulic/i],
  ];
  return rules.find(([, regex]) => regex.test(text))?.[0] || 'adventure';
}

function heroKindFor(motif, text) {
  if (/bridge|arch|gate|portal|door/i.test(text)) return 'arch';
  if (/tower|beacon|lighthouse|antenna|radar|flag|signpost/i.test(text)) return 'tower';
  if (/tree|crop|forest|orchard|plant/i.test(text)) return 'tree';
  if (/crystal|diamond|gem|ore/i.test(text)) return 'crystal';
  if (/barn|warehouse|hospital|temple|factory|building|station|hut/i.test(text)) return 'building';
  return {
    water: 'arch',
    farm: 'tree',
    crystal: 'crystal',
    fire: 'tower',
    temple: 'arch',
    medical: 'building',
    play: 'building',
    gym: 'arch',
    city: 'building',
    science: 'tower',
    industrial: 'tower',
    adventure: 'tower',
  }[motif];
}

function teachingKindFor(text) {
  if (/depth|altitude|angle|meter|gauge|elevation/i.test(text)) return 'gauge';
  if (/target|bullseye|accuracy|aim/i.test(text)) return 'target';
  if (/sort|bin|colour|color|match/i.test(text)) return 'sorter';
  if (/scan|sensor|detect|radar/i.test(text)) return 'scanner';
  return 'sign';
}

/**
 * Produces a named, stable authored recipe. Every mission receives a unique
 * missionId/layoutId even when it shares a chassis palette and motif.
 */
export function deriveMissionReferenceRecipe(challenge) {
  const { missionId, art } = resolveMissionEntry(challenge);
  const modeNumber = Math.max(1, Math.min(10, Number(art.modeNumber) || 1));
  const authoredText = [
    art.title,
    art.lookDescription,
    art.heroDescription,
    art.goalDescription,
    art.scatterRecipe,
    challenge?.modeName,
    challenge?.gameplayDescription,
    challenge?.description,
  ].filter(Boolean).join(' ');
  const seed = hashString(`${missionId}|${authoredText}`);
  const chassisId = art.chassisId || challenge?.chassisId || 'custom';
  const dna = CHASSIS_VISUAL_DNA[chassisId] || CHASSIS_VISUAL_DNA.custom;
  const motif = classifyMotif(`${authoredText} ${dna.label || ''} ${dna.surroundings || ''}`);
  const primary = colorNumber(art.palette?.primary || art.paletteColors?.[0], dna.ground ?? 0x4f7c5d);
  const secondary = colorNumber(art.palette?.secondary || art.paletteColors?.[1], dna.sky ?? 0xd9a441);
  const accent = colorNumber(art.palette?.accent || art.paletteColors?.[2], dna.fog ?? 0x38bdf8);
  const layoutVariant = (hashString(chassisId) + modeNumber * 7 + seed) % 12;
  const heroText = `${dna.signatureProp || ''} ${art.heroDescription || ''} ${art.lookDescription || ''}`;
  const heroKind = heroKindFor(motif, heroText);
  return Object.freeze({
    recipeName: `ground-${slug(chassisId)}-m${modeNumber}-${slug(art.title)}`,
    missionId,
    layoutId: `${slug(missionId)}-v${layoutVariant}-${seed.toString(36)}`,
    chassisId,
    modeNumber,
    progression: modeNumber / 10,
    title: art.title || challenge?.modeName || challenge?.name || 'Ground Mission',
    objective: art.goalDescription || challenge?.primaryObjective?.label || 'Reach the goal',
    motif,
    heroKind,
    signatureProp: dna.signatureProp || null,
    floorKind: dna.floorKind || null,
    teachingKind: teachingKindFor(`${art.lookDescription || ''} ${art.heroDescription || ''}`),
    seed,
    palette: { primary, secondary, accent },
    routePieceCount: 6 + modeNumber,
    skylineCount: 8 + Math.ceil(modeNumber * 0.8),
    foregroundScale: 0.9 + modeNumber * 0.035,
    authoredText,
  });
}

function curveFrame(curve, t, side = 0, y = 0) {
  const point = curve.getPointAt(Math.max(0, Math.min(1, t)));
  const tangent = curve.getTangentAt(Math.max(0, Math.min(1, t))).normalize();
  const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
  point.addScaledVector(normal, side);
  point.y += y;
  return { point, tangent, normal, yaw: Math.atan2(tangent.x, tangent.z) };
}

function addMesh(parent, geometry, material, position, scale, name) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = name;
  mesh.position.copy(position);
  mesh.scale.set(...scale);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addInstanced(parent, name, geometry, material, transforms) {
  const mesh = new THREE.InstancedMesh(geometry, material, transforms.length);
  mesh.name = name;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  transforms.forEach((transform, index) => {
    dummy.position.copy(transform.position);
    dummy.rotation.set(...(transform.rotation || [0, 0, 0]));
    dummy.scale.set(...transform.scale);
    dummy.updateMatrix();
    mesh.setMatrixAt(index, dummy.matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
  parent.add(mesh);
  return mesh;
}

function buildForegroundFrame(root, curve, recipe) {
  const transforms = [];
  [-1, 1].forEach((side, sideIndex) => {
    [0.025, 0.105].forEach((t, i) => {
      const frame = curveFrame(curve, t, side * (7.8 + i * 2.3), 1.2);
      transforms.push({
        position: frame.point,
        rotation: [0, frame.yaw + seededUnit(recipe.seed, sideIndex * 4 + i) * 0.8, 0],
        scale: [
          (2.4 + seededUnit(recipe.seed, i + 9)) * recipe.foregroundScale,
          (3.8 + recipe.progression * 2.2) * recipe.foregroundScale,
          (2.1 + seededUnit(recipe.seed, i + 17)) * recipe.foregroundScale,
        ],
      });
    });
  });
  const geometry = layerGeometry(recipe, 'foreground');
  addInstanced(root, 'MissionRQForegroundFrame', geometry, pbr(recipe.palette.primary, { roughness: 0.9 }), transforms);
  return transforms.length;
}

function buildRouteSetPieces(root, curve, recipe) {
  const transforms = [];
  for (let i = 0; i < recipe.routePieceCount; i++) {
    const t = 0.14 + (i / Math.max(1, recipe.routePieceCount - 1)) * 0.7;
    const alternatingSide = (i + recipe.seed) % 2 ? 1 : -1;
    const offset = alternatingSide * (5.3 + seededUnit(recipe.seed, i) * (2.4 + recipe.progression * 2));
    const frame = curveFrame(curve, t, offset, 0.65);
    const base = 0.8 + seededUnit(recipe.seed, i + 40) * 0.8;
    transforms.push({
      position: frame.point,
      rotation: [0, frame.yaw + seededUnit(recipe.seed, i + 60) * Math.PI, 0],
      scale: [base, 1.1 + recipe.progression * 0.9, base],
    });
  }
  const geometry = layerGeometry(recipe, 'route');
  addInstanced(root, 'MissionRQRouteSetPieces', geometry, pbr(recipe.palette.secondary, {
    roughness: recipe.motif === 'science' ? 0.34 : 0.76,
    metalness: ['science', 'industrial'].includes(recipe.motif) ? 0.46 : 0.08,
  }), transforms);
  return transforms.length;
}

function buildSkyline(root, curve, recipe) {
  const mid = curveFrame(curve, 0.58);
  const transforms = [];
  for (let i = 0; i < recipe.skylineCount; i++) {
    const side = i % 2 ? 1 : -1;
    const spread = (Math.floor(i / 2) - recipe.skylineCount / 4) * 7.5;
    const position = mid.point.clone()
      .addScaledVector(mid.normal, side * (24 + seededUnit(recipe.seed, i + 80) * 13))
      .addScaledVector(mid.tangent, spread);
    const height = 5 + seededUnit(recipe.seed, i + 100) * (8 + recipe.modeNumber);
    position.y += height / 2 - 0.2;
    transforms.push({
      position,
      rotation: [0, mid.yaw + seededUnit(recipe.seed, i + 120) * 0.35, 0],
      scale: [3.5 + seededUnit(recipe.seed, i + 140) * 4, height, 3.5],
    });
  }
  const geo = layerGeometry(recipe, 'skyline');
  addInstanced(root, 'MissionRQSkylineDepth', geo, pbr(recipe.palette.primary, { roughness: 0.94 }), transforms);
  return transforms.length;
}

function buildHero(root, curve, recipe) {
  const heroT = 0.52 + recipe.modeNumber * 0.018 + (recipe.seed % 9) * 0.012;
  const heroSide = ((recipe.seed + recipe.modeNumber) % 2 ? 1 : -1) * (10 + (recipe.modeNumber % 4) * 2);
  const frame = curveFrame(curve, heroT, heroSide, 0);
  const hero = new THREE.Group();
  hero.name = `MissionRQHero:${recipe.missionId}`;
  hero.position.copy(frame.point);
  hero.rotation.y = frame.yaw;
  const body = pbr(recipe.palette.primary, { roughness: 0.48, metalness: 0.18 });
  const trim = pbr(recipe.palette.accent, {
    roughness: 0.3,
    metalness: 0.3,
    emissive: recipe.palette.accent,
    emissiveIntensity: 0.22,
  });
  if (recipe.heroKind === 'arch') {
    [-1, 1].forEach(x => addMesh(hero, GEOMETRY.cylinder, body, new THREE.Vector3(x * 3.2, 3.2, 0), [1, 6.4, 1], 'HeroPier'));
    addMesh(hero, GEOMETRY.cube, trim, new THREE.Vector3(0, 6.4, 0), [7.4, 0.8, 1.1], 'HeroLintel');
  } else if (recipe.heroKind === 'building') {
    addMesh(hero, GEOMETRY.cube, body, new THREE.Vector3(0, 3.5, 0), [8, 7, 6], 'HeroBuilding');
    addMesh(hero, GEOMETRY.cube, trim, new THREE.Vector3(0, 4, 3.04), [4.2, 2.2, 0.15], 'HeroFacade');
    addMesh(hero, GEOMETRY.cone, body, new THREE.Vector3(0, 8, 0), [5.5, 2.5, 4.5], 'HeroRoof');
  } else if (recipe.heroKind === 'tree') {
    addMesh(hero, GEOMETRY.cylinder, pbr(0x6b4423), new THREE.Vector3(0, 3, 0), [1.2, 6, 1.2], 'HeroTrunk');
    addMesh(hero, GEOMETRY.sphere, body, new THREE.Vector3(0, 7.2, 0), [5, 4.2, 5], 'HeroCanopy');
  } else if (recipe.heroKind === 'crystal') {
    [-2, 0, 2].forEach((x, i) => addMesh(hero, GEOMETRY.cone, trim, new THREE.Vector3(x, 2.4 + i, 0), [2, 4.8 + i * 2, 2], `HeroCrystal${i}`));
  } else {
    addMesh(hero, GEOMETRY.cylinder, body, new THREE.Vector3(0, 4, 0), [2.4, 8, 2.4], 'HeroTower');
    addMesh(hero, GEOMETRY.sphere, trim, new THREE.Vector3(0, 8.8, 0), [1.8, 1.8, 1.8], 'HeroBeacon');
    addMesh(hero, GEOMETRY.torus, trim, new THREE.Vector3(0, 6.8, 0), [2.2, 2.2, 2.2], 'HeroRing').rotation.x = Math.PI / 2;
  }
  root.add(hero);
  return hero;
}

function buildTeachingLandmark(root, curve, recipe) {
  const frame = curveFrame(curve, 0.34 + (recipe.seed % 7) * 0.01, -7, 0);
  const teaching = new THREE.Group();
  teaching.name = `MissionRQTeaching:${recipe.teachingKind}`;
  teaching.position.copy(frame.point);
  teaching.rotation.y = frame.yaw;
  const base = pbr(0x27364b, { roughness: 0.48, metalness: 0.42 });
  const glow = pbr(recipe.palette.accent, {
    roughness: 0.24,
    metalness: 0.24,
    emissive: recipe.palette.accent,
    emissiveIntensity: 0.58,
  });
  addMesh(teaching, GEOMETRY.cylinder, base, new THREE.Vector3(0, 1.5, 0), [0.65, 3, 0.65], 'TeachingPost');
  if (recipe.teachingKind === 'target') {
    const target = addMesh(teaching, GEOMETRY.torus, glow, new THREE.Vector3(0, 4.1, 0), [2, 2, 2], 'TeachingTarget');
    target.rotation.y = Math.PI / 2;
  } else if (recipe.teachingKind === 'scanner') {
    addMesh(teaching, GEOMETRY.torus, glow, new THREE.Vector3(0, 3.8, 0), [2.2, 2.2, 2.2], 'TeachingScanner');
  } else if (recipe.teachingKind === 'sorter') {
    [-1.2, 0, 1.2].forEach((x, i) => addMesh(teaching, GEOMETRY.cube, i === 1 ? glow : base, new THREE.Vector3(x, 3.4, 0), [0.9, 1.2, 0.8], `TeachingBin${i}`));
  } else {
    addMesh(teaching, GEOMETRY.cube, glow, new THREE.Vector3(0, 3.8, 0), [3.5, recipe.teachingKind === 'gauge' ? 2.6 : 1.5, 0.22], 'TeachingPanel');
    if (recipe.teachingKind === 'gauge') {
      const needle = addMesh(teaching, GEOMETRY.cube, pbr(0xffffff, { emissive: 0xffffff, emissiveIntensity: 0.3 }), new THREE.Vector3(0, 3.8, -0.2), [0.12, 1.05, 0.12], 'TeachingNeedle');
      needle.rotation.z = (recipe.progression - 0.5) * 1.3;
    }
  }
  root.add(teaching);
  return teaching;
}

/**
 * Installs the complete ground composition. `suppressLandmarks` is used by
 * Crawler gold chapters, whose authored geometry remains the sole focal set.
 */
export function installMissionReferenceQuality(scene, challenge, curve, options = {}) {
  if (!scene || !curve) return null;
  const existing = scene.getObjectByName('MissionReferenceQualityRoot');
  if (existing) return scene.userData.missionReferenceQuality?.recipe || null;

  const recipe = deriveMissionReferenceRecipe(challenge);
  const root = new THREE.Group();
  root.name = 'MissionReferenceQualityRoot';
  root.userData.missionId = recipe.missionId;
  root.userData.layoutId = recipe.layoutId;
  root.userData.recipeName = recipe.recipeName;

  const foregroundInstances = buildForegroundFrame(root, curve, recipe);
  const routeInstances = buildRouteSetPieces(root, curve, recipe);
  const skylineInstances = buildSkyline(root, curve, recipe);
  const hasExistingHero = Boolean(
    scene.getObjectByName('PremiumGroundLandmark')
    || scene.getObjectByName('MissionAuthoredHero')
    || scene.getObjectByName('MissionHero')
  );
  const landmarksSuppressed = options.suppressLandmarks === true;
  const hero = (!landmarksSuppressed && !hasExistingHero) ? buildHero(root, curve, recipe) : null;
  const teaching = !landmarksSuppressed ? buildTeachingLandmark(root, curve, recipe) : null;

  scene.add(root);
  const qualityMetrics = {
    version: MISSION_REFERENCE_QUALITY_VERSION,
    missionId: recipe.missionId,
    layoutId: recipe.layoutId,
    recipeName: recipe.recipeName,
    groundOnly: true,
    deterministicSeed: recipe.seed,
    progressionMode: recipe.modeNumber,
    progressionTier: recipe.modeNumber <= 3 ? 'discover' : recipe.modeNumber <= 7 ? 'develop' : 'master',
    composition: {
      foregroundFraming: foregroundInstances,
      routeAlignedSetPieces: routeInstances,
      skylineInstances,
      heroLandmarks: hero ? 1 : 0,
      teachingLandmarks: teaching ? 1 : 0,
      landmarksSuppressed,
    },
    kidClarity: {
      routeClearance: 5.3,
      focalHierarchy: landmarksSuppressed ? ['gold-chapter', 'route', 'goal'] : ['hero', 'teaching', 'route', 'goal'],
      duplicateHeroPrevented: hasExistingHero || landmarksSuppressed,
      colorCodedObjective: true,
    },
    performance: {
      instancedMeshes: 3,
      instancedObjects: foregroundInstances + routeInstances + skylineInstances,
      uniqueLandmarkGroups: Number(Boolean(hero)) + Number(Boolean(teaching)),
      sharedGeometry: true,
      sharedMaterials: true,
    },
    recipe,
  };
  root.userData.qualityMetrics = qualityMetrics;
  scene.userData.missionReferenceQuality = qualityMetrics;
  scene.userData.missionCompositionRecipe = {
    missionId: recipe.missionId,
    layoutId: recipe.layoutId,
    name: recipe.recipeName,
  };
  scene.userData.premiumKidVisuals = true;
  return recipe;
}
