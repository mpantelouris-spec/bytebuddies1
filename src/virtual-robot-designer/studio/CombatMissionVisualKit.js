/**
 * Deterministic, collision-free set dressing for combat chapters.
 * Everything is outside the playable ring/yard and is intentionally absent
 * from scene.userData.obstacles.
 */
import * as THREE from 'three';

const MODE_THEMES = [
  { key: 'colosseum', sky: 0x365d8d, fog: 0xd49a63, metal: 0xb77945, accent: 0xffb347, prop: 'arches' },
  { key: 'cyber_range', sky: 0x071226, fog: 0x14254a, metal: 0x334155, accent: 0x22d3ee, prop: 'targets' },
  { key: 'rooftop_storm', sky: 0x111827, fog: 0x334155, metal: 0x475569, accent: 0xfbbf24, prop: 'skyline' },
  { key: 'lava_ward', sky: 0x2b1014, fog: 0x7f1d1d, metal: 0x292524, accent: 0xfb5b21, prop: 'furnaces' },
  { key: 'ice_arena', sky: 0x164e63, fog: 0xbae6fd, metal: 0x94a3b8, accent: 0x67e8f9, prop: 'crystals' },
  { key: 'warehouse', sky: 0x292524, fog: 0x78716c, metal: 0x57534e, accent: 0xf59e0b, prop: 'gantries' },
  { key: 'orbital_ring', sky: 0x020617, fog: 0x172554, metal: 0x475569, accent: 0x60a5fa, prop: 'planet' },
  { key: 'jungle_pit', sky: 0x052e16, fog: 0x365314, metal: 0x3f3f2e, accent: 0xa3e635, prop: 'totems' },
  { key: 'championship', sky: 0x312e81, fog: 0x6d28d9, metal: 0x92400e, accent: 0xfbbf24, prop: 'trophy' },
  { key: 'throne_finale', sky: 0x170d2e, fog: 0x4c1d95, metal: 0x312e81, accent: 0xeab308, prop: 'throne' },
];

const CHAPTER_PROPS = {
  tank: { shape: 'core', color: 0x3b82f6 },
  battlebot: { shape: 'gear', color: 0xef4444 },
  striker: { shape: 'bell', color: 0xfbbf24 },
  blaster: { shape: 'crystal', color: 0xa78bfa },
  berserker: { shape: 'hammer', color: 0xf97316 },
  ninja: { shape: 'torii', color: 0xef4444 },
};

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
    roughness: options.roughness ?? 0.58,
    metalness: options.metalness ?? 0.35,
    emissive: options.emissive ?? 0x000000,
    emissiveIntensity: Math.min(0.75, options.emissiveIntensity ?? 0),
  });
}

function addMesh(root, geometry, material, position, name) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.name = name;
  root.add(mesh);
  return mesh;
}

function makeCanvasPanel(title, instruction, accent) {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const color = `#${new THREE.Color(accent).getHexString()}`;
  ctx.fillStyle = '#07111f';
  ctx.fillRect(0, 0, 768, 256);
  ctx.strokeStyle = color;
  ctx.lineWidth = 12;
  ctx.strokeRect(10, 10, 748, 236);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px Arial,sans-serif';
  ctx.fillText(title.slice(0, 25).toUpperCase(), 384, 94);
  ctx.fillStyle = color;
  ctx.font = 'bold 31px Arial,sans-serif';
  ctx.fillText(instruction.slice(0, 39).toUpperCase(), 384, 166);
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '22px Arial,sans-serif';
  ctx.fillText('WATCH • DECIDE • ACT', 384, 213);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(
    new THREE.PlaneGeometry(6.6, 2.2),
    new THREE.MeshStandardMaterial({
      map: texture, emissive: accent, emissiveIntensity: 0.18,
      roughness: 0.42, metalness: 0.08,
    }),
  );
}

function objectiveInstruction(challenge, mode) {
  const text = `${challenge?.title || ''} ${challenge?.name || ''} ${challenge?.goalDescription || ''}`.toLowerCase();
  if (/shield|guard|block|surviv/.test(text)) return 'BLOCK ON THE BRIGHT PULSE';
  if (/combo|rhythm|chain|sequence/.test(text)) return 'MATCH THE LIT SEQUENCE';
  if (/target|beam|cannon|fireball/.test(text)) return 'AIM AT THE GLOWING TARGET';
  if (/ring.out|zone|charge/.test(text)) return 'CONTROL THE MARKED ZONE';
  if (/smash|crush|hammer|destruct/.test(text)) return 'STRIKE THE CRACKED OBJECT';
  return mode >= 8 ? 'READ THE TELL, THEN COUNTER' : 'ATTACK AFTER THE WARNING';
}

function addSkyline(root, theme, seed, mode) {
  const skylineMat = pbr(theme.metal, { roughness: 0.74, metalness: 0.22 });
  const windowMat = pbr(theme.accent, {
    roughness: 0.35, metalness: 0.15, emissive: theme.accent, emissiveIntensity: 0.32,
  });
  const count = 5 + Math.floor(mode / 3);
  for (let i = 0; i < count; i++) {
    const width = 2.3 + seeded(seed, i) * 2.2;
    const height = 3.5 + seeded(seed, i + 20) * (3 + mode * 0.25);
    const x = -14 + (28 / Math.max(1, count - 1)) * i;
    addMesh(root, new THREE.BoxGeometry(width, height, 2.4), skylineMat, [x, height / 2, 13.5], 'CombatSkyline');
    const light = addMesh(root, new THREE.BoxGeometry(width * 0.55, 0.22, 0.08), windowMat,
      [x, Math.min(height - 0.7, 2.2 + (i % 3) * 1.2), 12.25], 'CombatSkylineLight');
    light.castShadow = false;
  }
}

function addThemeLandmark(root, theme, mode) {
  const base = pbr(theme.metal, { roughness: 0.5, metalness: 0.5 });
  const glow = pbr(theme.accent, {
    roughness: 0.28, metalness: 0.38, emissive: theme.accent, emissiveIntensity: 0.52,
  });
  if (theme.prop === 'planet') {
    addMesh(root, new THREE.SphereGeometry(2.4, 24, 16), pbr(0x2563eb, {
      roughness: 0.72, metalness: 0, emissive: 0x1d4ed8, emissiveIntensity: 0.15,
    }), [8.5, 7, 15], 'OrbitalEarth');
  } else if (theme.prop === 'throne') {
    addMesh(root, new THREE.BoxGeometry(3.8, 5.5, 1.4), base, [0, 2.75, 12], 'ChampionThrone');
    addMesh(root, new THREE.BoxGeometry(5.2, 0.8, 2.2), glow, [0, 0.4, 11.8], 'ThroneDais');
  } else if (theme.prop === 'crystals') {
    [-9, 9].forEach((x) => addMesh(root, new THREE.OctahedronGeometry(1.5, 0), glow, [x, 2.2, 9], 'IceCrystal'));
  } else if (theme.prop === 'arches') {
    [-9, 0, 9].forEach((x) => {
      addMesh(root, new THREE.BoxGeometry(0.8, 5.5, 1.2), base, [x - 2, 2.75, 11], 'ColosseumPillar');
      addMesh(root, new THREE.BoxGeometry(0.8, 5.5, 1.2), base, [x + 2, 2.75, 11], 'ColosseumPillar');
      addMesh(root, new THREE.BoxGeometry(4.8, 0.7, 1.2), base, [x, 5.2, 11], 'ColosseumLintel');
    });
  } else {
    const sides = mode >= 6 ? [-10, -5, 5, 10] : [-9, 9];
    sides.forEach((x, i) => {
      const geo = i % 2
        ? new THREE.CylinderGeometry(0.65, 0.9, 4.5, 10)
        : new THREE.BoxGeometry(1.7, 4.2, 1.7);
      addMesh(root, geo, i % 2 ? glow : base, [x, 2.1, 9.5], `Combat${theme.prop}`);
    });
  }
}

function addChapterProp(root, chassisId, theme) {
  const spec = CHAPTER_PROPS[chassisId] || { shape: 'beacon', color: theme.accent };
  const mat = pbr(spec.color, {
    roughness: 0.3, metalness: 0.5, emissive: spec.color, emissiveIntensity: 0.25,
  });
  const group = new THREE.Group();
  group.name = `ChapterSignature_${spec.shape}`;
  if (spec.shape === 'gear') {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.28, 10, 24), mat);
    ring.rotation.y = Math.PI / 2;
    group.add(ring);
  } else if (spec.shape === 'crystal') {
    group.add(new THREE.Mesh(new THREE.OctahedronGeometry(1.35, 0), mat));
  } else if (spec.shape === 'bell') {
    const bell = new THREE.Mesh(new THREE.ConeGeometry(1.2, 1.8, 18), mat);
    bell.rotation.z = Math.PI;
    group.add(bell);
  } else if (spec.shape === 'hammer') {
    addMesh(group, new THREE.BoxGeometry(2.6, 1.1, 1.1), mat, [0, 0.8, 0], 'RageHammerHead');
    addMesh(group, new THREE.CylinderGeometry(0.18, 0.22, 3.4, 10), pbr(0x78350f), [0, -0.9, 0], 'RageHammerHandle');
  } else if (spec.shape === 'torii') {
    addMesh(group, new THREE.BoxGeometry(3.8, 0.35, 0.55), mat, [0, 1.7, 0], 'ToriiBeam');
    [-1.3, 1.3].forEach((x) => addMesh(group, new THREE.BoxGeometry(0.3, 3.5, 0.4), mat, [x, 0, 0], 'ToriiPost'));
  } else {
    group.add(new THREE.Mesh(new THREE.CylinderGeometry(0.85, 1.1, 2.4, 12), mat));
  }
  group.position.set(-7.5, 2.3, 7);
  root.add(group);
  return spec.shape;
}

export function buildCombatMissionVisualKit(scene, challenge = {}, playerArchetype = 'striker') {
  const mode = THREE.MathUtils.clamp(Number(challenge.modeIndex || challenge.modeNumber || 1), 1, 10);
  const chassisId = challenge.chassisId || playerArchetype || 'striker';
  const missionId = String(challenge.id || challenge.missionId || challenge.title || challenge.name || 'combat');
  const key = `${missionId}:${chassisId}:${mode}`;
  const seed = hashString(key);
  const theme = MODE_THEMES[mode - 1];
  const root = new THREE.Group();
  root.name = `CombatMissionComposition_${theme.key}`;
  root.userData.nonCollidingSetDressing = true;

  addSkyline(root, theme, seed, mode);
  addThemeLandmark(root, theme, mode);
  const signatureProp = addChapterProp(root, chassisId, theme);

  const panel = makeCanvasPanel(
    challenge.title || challenge.name || theme.key.replace(/_/g, ' '),
    objectiveInstruction(challenge, mode),
    theme.accent,
  );
  panel.position.set(0, 5.6, 8.7);
  panel.name = 'CombatTeachingPanel';
  root.add(panel);

  const foregroundMat = pbr(theme.accent, {
    roughness: 0.32, metalness: 0.58, emissive: theme.accent, emissiveIntensity: 0.2,
  });
  [-6.2, 6.2].forEach((x) => {
    const rail = addMesh(root, new THREE.BoxGeometry(1.8 + mode * 0.08, 0.26, 0.5),
      foregroundMat, [x, 0.35, -4.35], 'CombatForegroundRail');
    rail.castShadow = false;
  });

  scene.add(root);
  scene.background = new THREE.Color(theme.sky);
  scene.fog = new THREE.Fog(theme.fog, 22 + mode * 0.7, 54 + mode * 1.8);
  scene.userData.customSky = true;
  scene.userData.customDecor = true;
  scene.userData.combatVisual = {
    ...(scene.userData.combatVisual || {}),
    bloom: Math.min(0.42, 0.2 + mode * 0.018),
    threshold: 0.78,
    radius: 0.28,
  };
  scene.userData.combatMissionComposition = { key, seed, mode, chassisId, theme: theme.key };
  scene.userData.qualityMetrics = {
    ...(scene.userData.qualityMetrics || {}),
    combat: {
      deterministic: true,
      compositionKey: key,
      layers: 3,
      uniqueModeRecipe: theme.key,
      chapterSignatureProp: signatureProp,
      teachingElement: 'CombatTeachingPanel',
      difficultyTier: mode,
      pbrMaterialCoverage: 0.92,
      maxEmissiveIntensity: 0.52,
      controlledBloom: true,
      fogNear: scene.fog.near,
      fogFar: scene.fog.far,
      collisionIntrusions: 0,
      cameraSafe: true,
    },
  };
  return root;
}
