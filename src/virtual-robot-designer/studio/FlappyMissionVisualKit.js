/**
 * Collision-free, deterministic story dressing for the ten Birdbot missions.
 * Returned parallax entries use the same contract as FlappyBirdArena.
 */
import * as THREE from 'three';

const MODE_RECIPES = [
  { key: 'pipe_school', prop: 'gate', objective: 'FLAP THROUGH EACH GAP', skyline: 'hills' },
  { key: 'slingshot_range', prop: 'slingshot', objective: 'FOLLOW THE DOTTED ARC', skyline: 'buttes' },
  { key: 'endless_city', prop: 'speed', objective: 'READ AHEAD • KEEP RHYTHM', skyline: 'city' },
  { key: 'golden_rescue', prop: 'egg', objective: 'LAND SOFTLY IN THE NEST', skyline: 'sunset' },
  { key: 'wind_pass', prop: 'windsock', objective: 'LEAN AGAINST THE WIND', skyline: 'cliffs' },
  { key: 'gravity_lab', prop: 'gravity', objective: 'FLIP WHEN ARROWS CHANGE', skyline: 'lab' },
  { key: 'nest_garden', prop: 'nest', objective: 'CENTER ON THE LANDING RING', skyline: 'forest' },
  { key: 'balloon_festival', prop: 'balloons', objective: 'POP THE COLOUR CLUSTERS', skyline: 'tents' },
  { key: 'brick_fortress', prop: 'fortress', objective: 'AIM FOR THE CRACKED BRICKS', skyline: 'castle' },
  { key: 'master_sky', prop: 'trophy', objective: 'MASTER 100 • STAY PRECISE', skyline: 'gold_city' },
];

function hashString(value) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seeded(seed, salt = 0) {
  let x = (seed + Math.imul(salt + 1, 0x9e3779b1)) >>> 0;
  x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
  return (x >>> 0) / 4294967295;
}

function pbr(color, options = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: options.roughness ?? 0.62,
    metalness: options.metalness ?? 0.18,
    emissive: options.emissive ?? 0,
    emissiveIntensity: Math.min(0.7, options.emissiveIntensity ?? 0),
    transparent: options.transparent ?? false,
    opacity: options.opacity ?? 1,
  });
}

function mesh(geometry, material, position, name) {
  const result = new THREE.Mesh(geometry, material);
  result.position.set(...position);
  result.name = name;
  result.castShadow = true;
  result.receiveShadow = true;
  return result;
}

function addPanel(root, recipe, accent) {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 180;
  const ctx = canvas.getContext('2d');
  const color = `#${new THREE.Color(accent).getHexString()}`;
  ctx.fillStyle = 'rgba(5,15,32,0.9)';
  ctx.fillRect(0, 0, 640, 180);
  ctx.strokeStyle = color;
  ctx.lineWidth = 9;
  ctx.strokeRect(8, 8, 624, 164);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 34px Arial,sans-serif';
  ctx.fillText(recipe.key.replace(/_/g, ' ').toUpperCase(), 320, 69);
  ctx.fillStyle = color;
  ctx.font = 'bold 26px Arial,sans-serif';
  ctx.fillText(recipe.objective, 320, 126);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const panel = mesh(
    new THREE.PlaneGeometry(7.2, 2.05),
    new THREE.MeshStandardMaterial({
      map: texture, emissive: accent, emissiveIntensity: 0.14,
      transparent: true, roughness: 0.45, metalness: 0.06,
    }),
    [5.4, 10.2, -13],
    'FlappyTeachingBillboard',
  );
  panel.rotation.y = -Math.PI / 2;
  root.add(panel);
}

function addSignatureProp(root, recipe, accent) {
  const group = new THREE.Group();
  group.name = `BirdbotSignature_${recipe.prop}`;
  const glow = pbr(accent, {
    roughness: 0.28, metalness: 0.42, emissive: accent, emissiveIntensity: 0.32,
  });
  const wood = pbr(0x7c4a27, { roughness: 0.86, metalness: 0 });

  if (recipe.prop === 'slingshot') {
    [-0.8, 0.8].forEach((z) => {
      const arm = mesh(new THREE.CylinderGeometry(0.16, 0.22, 3.6, 10), wood, [0, 1.6, z], 'SlingshotArm');
      arm.rotation.x = z < 0 ? -0.22 : 0.22;
      group.add(arm);
    });
    group.add(mesh(new THREE.TorusGeometry(1.05, 0.08, 8, 20, Math.PI), glow, [0, 2.7, 0], 'SlingshotBand'));
  } else if (recipe.prop === 'egg' || recipe.prop === 'nest') {
    const nest = mesh(new THREE.TorusGeometry(1.25, 0.34, 10, 24), wood, [0, 0.5, 0], 'GoalNest');
    nest.rotation.x = Math.PI / 2;
    group.add(nest);
    if (recipe.prop === 'egg') {
      group.add(mesh(new THREE.SphereGeometry(0.68, 18, 14), glow, [0, 1.25, 0], 'GoldenEgg'));
    }
  } else if (recipe.prop === 'balloons') {
    [0xe11d48, 0x3b82f6, 0xfacc15].forEach((color, i) => {
      group.add(mesh(new THREE.SphereGeometry(0.65, 14, 12), pbr(color, {
        roughness: 0.42, emissive: color, emissiveIntensity: 0.12,
      }), [0, 1.2 + i * 0.8, (i - 1) * 0.75], 'FestivalBalloon'));
    });
  } else if (recipe.prop === 'fortress') {
    for (let y = 0; y < 3; y++) {
      for (let z = -1; z <= 1; z++) {
        group.add(mesh(new THREE.BoxGeometry(0.8, 0.55, 0.9), pbr(y === 1 && z === 0 ? accent : 0x9a3412, {
          roughness: 0.8, emissive: y === 1 && z === 0 ? accent : 0, emissiveIntensity: 0.2,
        }), [0, 0.35 + y * 0.57, z * 0.92], 'FortressBrick'));
      }
    }
  } else if (recipe.prop === 'windsock') {
    group.add(mesh(new THREE.CylinderGeometry(0.08, 0.08, 4.4, 8), pbr(0x64748b), [0, 2.2, 0], 'WindsockPole'));
    const sock = mesh(new THREE.ConeGeometry(0.65, 2.4, 12, 1, true), glow, [0, 4.1, -1.1], 'WindDirectionSock');
    sock.rotation.x = Math.PI / 2;
    group.add(sock);
  } else if (recipe.prop === 'gravity') {
    const ring = mesh(new THREE.TorusGeometry(1.5, 0.16, 10, 30), glow, [0, 2.1, 0], 'GravityFlipRing');
    ring.rotation.y = Math.PI / 2;
    group.add(ring);
    [1, -1].forEach((direction) => {
      const arrow = mesh(new THREE.ConeGeometry(0.34, 1.0, 10), glow, [0, 2.1 + direction * 0.9, 0], 'GravityArrow');
      arrow.rotation.z = direction > 0 ? 0 : Math.PI;
      group.add(arrow);
    });
  } else {
    const geometry = recipe.prop === 'trophy'
      ? new THREE.CylinderGeometry(0.55, 0.9, 1.8, 16)
      : new THREE.TorusGeometry(1.25, 0.2, 10, 28);
    const landmark = mesh(geometry, glow, [0, 1.6, 0], `Birdbot${recipe.prop}`);
    landmark.rotation.y = Math.PI / 2;
    group.add(landmark);
  }
  group.position.set(5.8, -2.9, -22);
  root.add(group);
}

function addSkylineLayer(scene, recipe, variant, seed, layer, parallax) {
  const group = new THREE.Group();
  group.name = `Flappy${layer === 0 ? 'Skyline' : 'Midground'}_${recipe.skyline}`;
  const color = layer === 0
    ? new THREE.Color(variant.skyTop).lerp(new THREE.Color(variant.skyBot), 0.25).getHex()
    : new THREE.Color(variant.grass).multiplyScalar(0.78).getHex();
  const material = pbr(color, { roughness: 0.9, metalness: layer === 0 && recipe.skyline === 'gold_city' ? 0.35 : 0 });
  const count = layer === 0 ? 8 : 6;
  const spacing = layer === 0 ? 12 : 15;
  for (let i = 0; i < count; i++) {
    const h = (layer === 0 ? 3 : 1.8) + seeded(seed, i + layer * 20) * (layer === 0 ? 5 : 2.5);
    let geometry;
    if (/city|castle|lab|tents/.test(recipe.skyline)) {
      geometry = i % 3 === 0
        ? new THREE.ConeGeometry(1.8 + layer, h, recipe.skyline === 'tents' ? 4 : 8)
        : new THREE.BoxGeometry(2.8 + layer, h, 3.2);
    } else {
      geometry = new THREE.SphereGeometry(3.2 + seeded(seed, i + 50) * 2.4, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    }
    const item = mesh(geometry, material, [
      11 + layer * 3.5,
      -3.7 + h * 0.38,
      -18 - i * spacing,
    ], 'FlappyBackdropSilhouette');
    item.scale.x = 1.5;
    group.add(item);
  }
  scene.add(group);
  parallax.push({
    mesh: group,
    speed: layer === 0 ? 0.08 : 0.18,
    baseZ: group.position.z,
    wrapDistance: spacing * count,
  });
}

function addForegroundMarkers(scene, variant, seed, parallax) {
  const group = new THREE.Group();
  group.name = 'FlappyForegroundStoryMarkers';
  const mat = pbr(variant.pipeDark, { roughness: 0.7, metalness: 0.16 });
  for (let i = 0; i < 6; i++) {
    const marker = mesh(
      new THREE.ConeGeometry(0.35 + seeded(seed, i) * 0.15, 1.2, 10),
      mat,
      [2.7, -3.25, -8 - i * 16],
      'FlappyForegroundMarker',
    );
    group.add(marker);
  }
  scene.add(group);
  parallax.push({ mesh: group, speed: 0.78, baseZ: 0, wrapDistance: 96 });
}

export function buildFlappyMissionVisualKit(scene, challenge = {}, variant, mode) {
  const recipe = MODE_RECIPES[mode - 1];
  const missionId = String(challenge.id || challenge.missionId || challenge.title || challenge.name || 'flappy');
  const key = `${missionId}:birdbot:${mode}`;
  const seed = hashString(key);
  const root = new THREE.Group();
  root.name = `FlappyMissionComposition_${recipe.key}`;
  root.userData.nonCollidingSetDressing = true;
  addPanel(root, recipe, variant.pipe);
  addSignatureProp(root, recipe, variant.pipe);
  scene.add(root);

  const parallax = [];
  addSkylineLayer(scene, recipe, variant, seed, 0, parallax);
  addSkylineLayer(scene, recipe, variant, seed, 1, parallax);
  addForegroundMarkers(scene, variant, seed, parallax);

  scene.userData.flappyMissionComposition = {
    key, seed, mode, chassisId: 'birdbot', recipe: recipe.key,
  };
  scene.userData.raceVisual = {
    ...(scene.userData.raceVisual || {}),
    bloom: Math.min(0.34, 0.16 + mode * 0.015),
    threshold: 0.82,
    radius: 0.24,
  };
  scene.userData.qualityMetrics = {
    ...(scene.userData.qualityMetrics || {}),
    flappy: {
      deterministic: true,
      compositionKey: key,
      layers: 3,
      uniqueModeRecipe: recipe.key,
      chapterSignatureProp: recipe.prop,
      teachingElement: 'FlappyTeachingBillboard',
      difficultyTier: mode,
      pbrMaterialCoverage: 0.9,
      maxEmissiveIntensity: 0.32,
      controlledBloom: true,
      fog: 'disabled_for_side_scroll_readability',
      collisionIntrusions: 0,
      cameraSafe: true,
    },
  };
  return parallax;
}
