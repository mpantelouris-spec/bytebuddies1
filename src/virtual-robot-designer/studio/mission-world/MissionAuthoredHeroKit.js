/**
 * Converts the authored Visual Bible hero nouns into chunky, readable
 * landmarks. This layer is deliberately shared by ground, aerial, combat,
 * and flappy builders so a specialized arena cannot silently drop v3 art.
 */
import * as THREE from 'three';
import { getMissionArtDirection } from './MissionVisualBibleV2.js';

const HERO_RULES = [
  ['portal', /portal|arch|gate|finish|ring|hatch/],
  ['tower', /tower|lighthouse|spire|skyscraper|gantry|mast|beacon/],
  ['satellite', /radar|satellite|comm dish|scanner|sonar/],
  ['vehicle', /carrier|tanker|truck|helicopter|plane|jet|rover|vehicle/],
  ['medical', /hospital|medical|gurney|patient|defibrillator|stretcher|first aid/],
  ['fire', /fire|flame|lava|volcano|torch|ember|blaze/],
  ['water', /water|ocean|river|lake|waterfall|flood|reef/],
  ['crystal', /crystal|gem|ore|diamond|artifact|fossil/],
  ['web', /web|spider|silk|vine|fungus/],
  ['industrial', /factory|conveyor|press|gear|workbench|crane|pipeline|rail/],
  ['cargo', /crate|box|pallet|package|supply|battery|barrel|bin/],
  ['bridge', /bridge|platform|ramp|scaffold|stair|track|ribbon/],
  ['city', /city|building|rooftop|warehouse|museum|vault|street/],
  ['nature', /tree|forest|farm|crop|wheat|orchard|jungle|kelp|coral/],
  ['target', /target|bullseye|checkpoint|waypoint|marker|pylon/],
  ['shield', /shield|safe zone|quarantine|barrier|wall|fortress/],
  ['trophy', /trophy|champion|medal|podium|master|capstone|boss|throne/],
  ['hazard', /mine|hazard|laser|warning|vent|quake|storm|lightning/],
];

const FAMILY_DEFAULTS = {
  martian: ['satellite', 'crystal', 'tower'],
  industrial: ['industrial', 'cargo', 'tower'],
  underwater: ['nature', 'water', 'crystal'],
  emergency: ['medical', 'vehicle', 'hazard'],
  sky_aerial: ['portal', 'tower', 'vehicle'],
  hybrid_race_sky: ['portal', 'bridge', 'tower'],
  cyber_ninja: ['city', 'hazard', 'satellite'],
  spider_climber: ['web', 'bridge', 'crystal'],
  boxing_mech: ['shield', 'target', 'trophy'],
  flappy: ['portal', 'nature', 'target'],
  sandbox: ['target', 'industrial', 'trophy'],
};

function material(color, emissive = false, options = {}) {
  const params = {
    color,
    emissive: emissive ? color : 0x000000,
    emissiveIntensity: emissive ? 0.55 : 0,
    roughness: options.roughness ?? 0.62,
    metalness: options.metalness ?? 0.12,
    transparent: options.transparent ?? false,
    opacity: options.opacity ?? 1,
  };
  if (options.side !== undefined) params.side = options.side;
  return new THREE.MeshStandardMaterial(params);
}

function mesh(geometry, mat, x, y, z) {
  const value = new THREE.Mesh(geometry, mat);
  value.position.set(x, y, z);
  value.castShadow = true;
  value.receiveShadow = true;
  return value;
}

function addPortal(group, colors) {
  const ring = mesh(new THREE.TorusGeometry(2.2, 0.22, 10, 36), material(colors.accent, true), 0, 2.5, 0);
  group.add(ring);
  group.add(mesh(new THREE.BoxGeometry(0.45, 4.8, 0.55), material(colors.primary), -2.2, 2.1, 0));
  group.add(mesh(new THREE.BoxGeometry(0.45, 4.8, 0.55), material(colors.primary), 2.2, 2.1, 0));
}

function addTower(group, colors) {
  group.add(mesh(new THREE.CylinderGeometry(1.35, 1.8, 6, 8), material(colors.primary), 0, 3, 0));
  group.add(mesh(new THREE.ConeGeometry(1.6, 2.2, 8), material(colors.accent, true), 0, 7.1, 0));
  group.add(mesh(new THREE.SphereGeometry(0.34, 10, 8), material(colors.secondary, true), 0, 8.4, 0));
}

function addSatellite(group, colors) {
  group.add(mesh(new THREE.CylinderGeometry(0.18, 0.28, 3.8, 8), material(colors.primary), 0, 1.9, 0));
  const dish = mesh(
    new THREE.SphereGeometry(1.7, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.35),
    material(colors.secondary, false, { side: THREE.DoubleSide, metalness: 0.45 }),
    0, 4.1, 0,
  );
  dish.rotation.x = Math.PI * 0.65;
  group.add(dish);
  group.add(mesh(new THREE.SphereGeometry(0.22, 8, 6), material(colors.accent, true), 0, 4.5, -1.1));
}

function addVehicle(group, colors) {
  group.add(mesh(new THREE.BoxGeometry(5.8, 0.65, 2.5), material(colors.primary, false, { metalness: 0.35 }), 0, 0.7, 0));
  group.add(mesh(new THREE.BoxGeometry(1.4, 1.5, 1.5), material(colors.secondary), 1.6, 1.75, 0));
  group.add(mesh(new THREE.BoxGeometry(3.2, 0.12, 0.18), material(colors.accent, true), -0.8, 1.2, 1.22));
}

function addMedical(group, colors) {
  group.add(mesh(new THREE.BoxGeometry(4.2, 2.8, 1.2), material(0xf8fafc), 0, 1.4, 0));
  group.add(mesh(new THREE.BoxGeometry(0.45, 1.7, 0.14), material(0xef4444, true), 0, 1.5, 0.68));
  group.add(mesh(new THREE.BoxGeometry(1.7, 0.45, 0.14), material(0xef4444, true), 0, 1.5, 0.69));
  group.add(mesh(new THREE.SphereGeometry(0.25, 8, 6), material(colors.accent, true), 1.65, 2.35, 0.68));
}

function addFire(group, colors) {
  group.add(mesh(new THREE.CylinderGeometry(2.4, 2.8, 0.5, 12), material(0x3f2a28), 0, 0.25, 0));
  [0xf97316, 0xfacc15, colors.accent].forEach((color, i) => {
    const flame = mesh(new THREE.ConeGeometry(1.4 - i * 0.25, 3.8 - i * 0.6, 8), material(color, true), (i - 1) * 0.65, 2, 0);
    flame.rotation.z = (i - 1) * 0.18;
    group.add(flame);
  });
}

function addWater(group, colors) {
  const pool = mesh(
    new THREE.CylinderGeometry(3.2, 3.2, 0.18, 24),
    material(0x22d3ee, true, { transparent: true, opacity: 0.72 }),
    0, 0.12, 0,
  );
  group.add(pool);
  for (let i = 0; i < 5; i++) {
    group.add(mesh(new THREE.SphereGeometry(0.18 + i * 0.04, 8, 6), material(colors.secondary, true), -1 + i * 0.5, 0.7 + i * 0.55, 0));
  }
}

function addCrystal(group, colors) {
  for (let i = 0; i < 5; i++) {
    const crystal = mesh(
      new THREE.ConeGeometry(0.45 + (i % 2) * 0.18, 2.4 + (i % 3) * 0.7, 6),
      material(i % 2 ? colors.accent : colors.secondary, true, { roughness: 0.2 }),
      (i - 2) * 0.75, 1.2 + (i % 3) * 0.35, (i % 2) * 0.45,
    );
    crystal.rotation.z = (i - 2) * 0.08;
    group.add(crystal);
  }
}

function addWeb(group, colors) {
  const webMat = material(0xe2e8f0, true);
  for (let i = 1; i <= 3; i++) group.add(mesh(new THREE.TorusGeometry(i * 0.75, 0.045, 6, 24), webMat, 0, 3, 0));
  for (let i = 0; i < 8; i++) {
    const spoke = mesh(new THREE.BoxGeometry(0.055, 3, 0.055), webMat, 0, 3, 0);
    spoke.rotation.z = i * Math.PI / 4;
    group.add(spoke);
  }
  group.add(mesh(new THREE.SphereGeometry(0.35, 10, 8), material(colors.accent, true), 0, 3, 0));
}

function addIndustrial(group, colors) {
  group.add(mesh(new THREE.BoxGeometry(5, 0.55, 2.2), material(0x475569, false, { metalness: 0.55 }), 0, 0.7, 0));
  for (let i = -2; i <= 2; i++) group.add(mesh(new THREE.CylinderGeometry(0.28, 0.28, 1.8, 10), material(colors.secondary), i, 1.05, 0));
  const gear = mesh(new THREE.TorusGeometry(1.15, 0.28, 8, 12), material(colors.accent, true), 0, 3.2, 0);
  group.add(gear);
}

function addCargo(group, colors) {
  for (let i = 0; i < 5; i++) {
    group.add(mesh(
      new THREE.BoxGeometry(1.4, 1.1, 1.4),
      material([colors.primary, colors.secondary, colors.accent][i % 3]),
      (i % 3 - 1) * 1.55, 0.55 + Math.floor(i / 3) * 1.1, Math.floor(i / 3) * 0.2,
    ));
  }
}

function addBridge(group, colors) {
  group.add(mesh(new THREE.BoxGeometry(6.5, 0.45, 2.4), material(colors.primary), 0, 1.7, 0));
  [-1.1, 1.1].forEach((z) => {
    group.add(mesh(new THREE.BoxGeometry(6.5, 0.12, 0.12), material(colors.accent, true), 0, 2.8, z));
    [-3, 0, 3].forEach((x) => group.add(mesh(new THREE.BoxGeometry(0.12, 2.2, 0.12), material(colors.secondary), x, 1.8, z)));
  });
}

function addCity(group, colors) {
  [-2.1, 0, 2.1].forEach((x, i) => {
    const h = 3.5 + i * 1.5;
    group.add(mesh(new THREE.BoxGeometry(1.7, h, 1.7), material(i % 2 ? colors.primary : 0x1e293b), x, h * 0.5, 0));
    group.add(mesh(new THREE.PlaneGeometry(0.9, 0.35), material(colors.accent, true), x, h * 0.65, 0.86));
  });
}

function addNature(group, colors, environmentId) {
  const underwater = environmentId === 'underwater';
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 1.1;
    group.add(mesh(new THREE.CylinderGeometry(0.16, 0.3, 2.2 + (i % 3), 7), material(underwater ? colors.accent : 0x7c4a2d), x, 1.2, 0));
    group.add(mesh(
      underwater ? new THREE.ConeGeometry(0.55, 1.7, 7) : new THREE.SphereGeometry(0.8, 9, 7),
      material(underwater ? [0xf472b6, 0x22d3ee][i % 2] : 0x34d399, underwater),
      x, 2.6 + (i % 3) * 0.45, 0,
    ));
  }
}

function addTarget(group, colors) {
  group.add(mesh(new THREE.CylinderGeometry(2.1, 2.1, 0.25, 24), material(colors.primary), 0, 2.4, 0));
  group.children[0].rotation.x = Math.PI / 2;
  [1.4, 0.75, 0.25].forEach((radius, i) => {
    const disc = mesh(new THREE.CircleGeometry(radius, 24), material(i === 2 ? colors.accent : (i % 2 ? 0xffffff : colors.secondary), true), 0, 2.4, -0.14 - i * 0.01);
    group.add(disc);
  });
}

function addShield(group, colors) {
  group.add(mesh(
    new THREE.SphereGeometry(2.8, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.55),
    material(colors.secondary, true, { transparent: true, opacity: 0.25, side: THREE.DoubleSide }),
    0, 0.15, 0,
  ));
  group.add(mesh(new THREE.CylinderGeometry(2.3, 2.6, 0.35, 18), material(colors.primary), 0, 0.2, 0));
}

function addTrophy(group, colors) {
  group.add(mesh(new THREE.BoxGeometry(3.2, 0.5, 2.2), material(colors.primary), 0, 0.25, 0));
  group.add(mesh(new THREE.CylinderGeometry(0.35, 0.55, 2.2, 10), material(0xfbbf24, true, { metalness: 0.55 }), 0, 1.6, 0));
  group.add(mesh(new THREE.SphereGeometry(1.15, 14, 10), material(0xfbbf24, true, { metalness: 0.55 }), 0, 3.1, 0));
}

function addHazard(group, colors) {
  for (let i = -2; i <= 2; i++) {
    const cone = mesh(new THREE.ConeGeometry(0.55, 2.2, 8), material(i % 2 ? colors.accent : 0xf97316, true), i * 1.25, 1.1, 0);
    group.add(cone);
  }
  group.add(mesh(new THREE.BoxGeometry(6.8, 0.18, 0.18), material(0xef4444, true), 0, 2.4, 0));
}

const BUILDERS = {
  portal: addPortal,
  tower: addTower,
  satellite: addSatellite,
  vehicle: addVehicle,
  medical: addMedical,
  fire: addFire,
  water: addWater,
  crystal: addCrystal,
  web: addWeb,
  industrial: addIndustrial,
  cargo: addCargo,
  bridge: addBridge,
  city: addCity,
  nature: addNature,
  target: addTarget,
  shield: addShield,
  trophy: addTrophy,
  hazard: addHazard,
};

export function classifyMissionHeroCategories(art) {
  if (!art) return [];
  const text = `${art.heroDescription || ''} ${art.lookDescription || ''} ${art.goalDescription || ''}`.toLowerCase();
  const categories = HERO_RULES.filter(([, pattern]) => pattern.test(text)).map(([category]) => category);
  for (const fallback of FAMILY_DEFAULTS[art.environmentId] || FAMILY_DEFAULTS.industrial) {
    if (!categories.includes(fallback)) categories.push(fallback);
  }
  return categories.slice(0, 3);
}

function colorContract(art) {
  const colors = art.paletteColors || [];
  return {
    primary: new THREE.Color(colors[0] || art.palette?.primary || '#3b82f6').getHex(),
    secondary: new THREE.Color(colors[1] || art.palette?.secondary || '#22d3ee').getHex(),
    accent: new THREE.Color(colors[2] || art.palette?.accent || '#fbbf24').getHex(),
  };
}

function landmarkAnchor(scene, curve, index, environmentId) {
  if (curve) {
    const t = [0.14, 0.5, 0.84][index];
    const point = curve.getPoint(t);
    const tangent = curve.getTangent(t).normalize();
    const aerial = environmentId === 'sky_aerial' || environmentId === 'hybrid_race_sky';
    const side = index % 2 ? -1 : 1;
    const offset = aerial ? 11 + index * 2 : 7.5;
    return {
      position: new THREE.Vector3(
        point.x - tangent.z * side * offset,
        aerial ? point.y - 4 : 0,
        point.z + tangent.x * side * offset,
      ),
      yaw: Math.atan2(tangent.x, tangent.z),
      scale: aerial ? 1.25 : 0.9,
    };
  }
  if (scene.userData.combatMode) {
    return { position: new THREE.Vector3((index - 1) * 5.5, 0, 7.2), yaw: Math.PI, scale: 0.65 };
  }
  if (scene.userData.flappyMode) {
    return { position: new THREE.Vector3(8 + index * 8, 2 + index, -3), yaw: 0, scale: 0.75 };
  }
  return { position: new THREE.Vector3((index - 1) * 7, 0, -12 - index * 8), yaw: 0, scale: 0.85 };
}

export function applyMissionAuthoredHeroDressing(scene, challenge, curve = scene.userData._chassisCurve) {
  if (!challenge?.id || scene.getObjectByName('MissionAuthoredHeroDressing')) return false;
  const art = getMissionArtDirection(challenge);
  if (!art) return false;

  const authoredCategories = classifyMissionHeroCategories(art);
  const maxLandmarks = Math.max(0, scene.userData.maxMissionLandmarks ?? 1);
  const preferred = Number(art.modeNumber) === 10 && authoredCategories.includes('trophy')
    ? ['trophy', ...authoredCategories.filter(category => category !== 'trophy')]
    : authoredCategories;
  const categories = preferred.slice(0, maxLandmarks);
  if (!categories.length) return false;
  const colors = colorContract(art);
  const root = new THREE.Group();
  root.name = 'MissionAuthoredHeroDressing';
  root.userData.skipStylize = true;
  root.userData.missionId = challenge.id;
  root.userData.categories = categories;

  categories.forEach((category, index) => {
    const landmark = new THREE.Group();
    landmark.name = `MissionHero:${category}`;
    landmark.userData.missionHeroCategory = category;
    BUILDERS[category]?.(landmark, colors, art.environmentId);
    const anchor = landmarkAnchor(scene, curve, index, art.environmentId);
    landmark.position.copy(anchor.position);
    landmark.rotation.y = anchor.yaw;
    landmark.scale.setScalar(anchor.scale);
    root.add(landmark);
  });

  scene.add(root);
  scene.userData.missionAuthoredHeroes = categories;
  return root.children.length > 0;
}
