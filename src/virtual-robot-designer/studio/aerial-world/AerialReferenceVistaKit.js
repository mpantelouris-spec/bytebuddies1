/**
 * Real 3D aerial game world — no painted backdrop images.
 * Kid-clarity budget: 1 hero island, 1 distant citadel, 2 cloud clusters, open sky.
 */
import * as THREE from 'three';

const THEMES = {
  jetplane: { grass: 0x4f9a3c, rock: 0x8d5a38, hut: 0xf97316, roof: 0x3b6ea8, accent: 0xffb347 },
  drone: { grass: 0x4f9a3c, rock: 0x7a6a4a, hut: 0x38bdf8, roof: 0x2563eb, accent: 0xf59e0b },
  helicopter: { grass: 0x3f7a32, rock: 0x6b5340, hut: 0xf59e0b, roof: 0x92400e, accent: 0x38bdf8 },
  hoverbot: { grass: 0x65a30d, rock: 0x78716c, hut: 0xa78bfa, roof: 0x7c3aed, accent: 0x22d3ee },
  racedrone: { grass: 0x4ade80, rock: 0x57534e, hut: 0xec4899, roof: 0xdb2777, accent: 0x22d3ee },
  hoverracer: { grass: 0x22d3ee, rock: 0x334155, hut: 0xa855f7, roof: 0x7e22ce, accent: 0x22d3ee },
  steathjet: { grass: 0x3f6212, rock: 0x1f2937, hut: 0x22c55e, roof: 0x14532d, accent: 0x64748b },
  aerobat: { grass: 0x84cc16, rock: 0xa16207, hut: 0xf97316, roof: 0xf8fafc, accent: 0xfbbf24 },
};

function mat(color, extra = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: extra.roughness ?? 0.74,
    metalness: extra.metalness ?? 0.08,
    emissive: extra.emissive ?? 0x000000,
    emissiveIntensity: extra.emi ?? 0,
    transparent: extra.transparent ?? false,
    opacity: extra.opacity ?? 1,
    flatShading: extra.flat ?? false,
    side: extra.side ?? THREE.FrontSide,
  });
}

function add(group, geo, material, x, y, z, rot = null, scale = null) {
  const mesh = new THREE.Mesh(geo, material);
  mesh.position.set(x, y, z);
  if (rot) mesh.rotation.set(rot[0], rot[1], rot[2]);
  if (scale) mesh.scale.set(scale[0], scale[1], scale[2]);
  mesh.castShadow = !material.transparent;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

function frameAxes(curve) {
  const spawn = curve.getPoint(0);
  const tan = curve.getTangent(0).clone().normalize();
  const yaw = Math.atan2(tan.x, tan.z);
  const fwd = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
  const right = new THREE.Vector3(fwd.z, 0, -fwd.x);
  return { spawn, fwd, right };
}

function buildCloud(_theme, size = 6) {
  const g = new THREE.Group();
  const cloud = mat(0xfff6ea, { roughness: 0.92, metalness: 0, emi: 0.04, emissive: 0xffe8c8 });
  const offsets = [
    [0, 0, 0, 1],
    [size * 0.55, size * 0.06, size * 0.1, 0.78],
    [-size * 0.48, size * 0.04, -size * 0.08, 0.72],
  ];
  offsets.forEach(([x, y, z, s]) => {
    add(g, new THREE.SphereGeometry(size * s, 10, 8), cloud, x, y, z, null, [1.3, 0.58, 1.1]);
  });
  return g;
}

function buildHut(theme, tall = 8.4) {
  const g = new THREE.Group();
  add(g, new THREE.CylinderGeometry(0.42, 0.62, tall * 0.72, 8), mat(0x64748b, { metalness: 0.58, roughness: 0.32 }), 0, tall * 0.36, 0);
  add(g, new THREE.BoxGeometry(2.8, 2.4, 2.5), mat(theme.hut, { roughness: 0.68, emissive: theme.hut, emi: 0.08 }), 0, tall * 0.78, 0);
  add(g, new THREE.BoxGeometry(3.05, 0.28, 2.75), mat(0x9a3412, { roughness: 0.55, metalness: 0.2 }), 0, tall * 0.92, 0);
  const glass = mat(0x7dd3fc, { metalness: 0.35, roughness: 0.18, emissive: 0x38bdf8, emi: 0.45 });
  add(g, new THREE.BoxGeometry(0.55, 0.48, 0.08), glass, -0.7, tall * 0.8, 1.28);
  add(g, new THREE.BoxGeometry(0.55, 0.48, 0.08), glass, 0.7, tall * 0.8, 1.28);
  add(g, new THREE.OctahedronGeometry(0.55), mat(0x38bdf8, { metalness: 0.4, emissive: 0x0ea5e9, emi: 0.7 }), 0, tall + 0.15, 0);
  return g;
}

function buildIsland(theme, radius = 12, opts = {}) {
  const g = new THREE.Group();
  const rock = mat(theme.rock, { roughness: 0.94, flat: true });
  const grass = mat(theme.grass, { roughness: 0.86 });
  add(g, new THREE.CylinderGeometry(radius, radius * 1.1, 2.2, 10), grass, 0, 0.85, 0);
  add(g, new THREE.CylinderGeometry(radius * 0.94, radius * 1.06, 2.8, 9), rock, 0, -1.1, 0);
  const under = add(g, new THREE.ConeGeometry(radius * 0.82, radius * 1.05, 8), rock, 0, -radius * 0.55, 0);
  under.rotation.x = Math.PI;
  if (opts.hut !== false) {
    const hut = buildHut(theme, 7.2);
    hut.position.set(radius * 0.12, 1.55, -radius * 0.06);
    g.add(hut);
  }
  return g;
}

function buildCitadel(theme) {
  const g = new THREE.Group();
  const keep = mat(0xf2e6cf, { roughness: 0.82 });
  const roof = mat(theme.roof, { roughness: 0.55, metalness: 0.16, emissive: theme.roof, emi: 0.08 });
  add(g, new THREE.BoxGeometry(14, 11, 12), keep, 0, 6.5, 0);
  add(g, new THREE.ConeGeometry(8.5, 5.5, 4), roof, 0, 14.5, 0, [0, Math.PI / 4, 0]);
  [[-7, -4], [7, -4], [-7, 4], [7, 4]].forEach(([x, z], i) => {
    const h = 12 + (i % 2) * 2;
    add(g, new THREE.CylinderGeometry(1.2, 1.4, h, 8), keep, x, h / 2 + 1, z);
    add(g, new THREE.ConeGeometry(1.7, 2.6, 8), roof, x, h + 1.8, z);
  });
  return g;
}

function installSun(scene) {
  if (scene.getObjectByName('AerialGameSun')) return;
  const sun = new THREE.DirectionalLight(0xfff1c8, 1.55);
  sun.name = 'AerialGameSun';
  sun.position.set(36, 48, 22);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -80;
  sun.shadow.camera.right = 80;
  sun.shadow.camera.top = 80;
  sun.shadow.camera.bottom = -80;
  scene.add(sun);
  const fill = new THREE.HemisphereLight(0x87ceeb, 0x4a7a3a, 0.55);
  fill.name = 'AerialGameHemi';
  scene.add(fill);
  const disc = new THREE.Mesh(
    new THREE.SphereGeometry(6, 16, 12),
    new THREE.MeshBasicMaterial({ color: 0xffe08a, fog: false }),
  );
  disc.position.set(70, 42, -40);
  scene.add(disc);
}

export function installAerialReferenceVista(scene, curve, chassisId = 'drone') {
  if (!scene || !curve || scene.getObjectByName('AerialReferenceVista')) return null;

  const theme = THEMES[chassisId] || THEMES.jetplane;
  const preset = {
    camBack: 8.4,
    camUp: 3.8,
    lookAhead: 14,
    lookHeight: 0.8,
    fov: 50,
    ...(scene.userData.missionCameraPreset || {}),
  };
  scene.userData.missionCameraPreset = { ...preset };
  if (!scene.userData.customSky) {
    scene.background = new THREE.Color(0x6bb7e6);
    if (scene.fog) {
      scene.fog.color.setHex(0xc5e4f5);
      if ('near' in scene.fog) scene.fog.near = 70;
      if ('far' in scene.fog) scene.fog.far = 280;
    }
  }
  installSun(scene);

  const { spawn, fwd, right } = frameAxes(curve);
  const root = new THREE.Group();
  root.name = 'AerialReferenceVista';

  const hero = buildIsland(theme, 10.5, { hut: true });
  hero.position.copy(spawn).addScaledVector(fwd, 10).addScaledVector(right, -11).add(new THREE.Vector3(0, -7.4, 0));
  root.add(hero);

  const citadel = buildCitadel(theme);
  citadel.scale.setScalar(0.92);
  citadel.position.copy(spawn).addScaledVector(fwd, 78).addScaledVector(right, -6).add(new THREE.Vector3(0, -20, 0));
  root.add(citadel);

  [[14, -14, -12], [28, 12, -14]].forEach(([along, side, yOff]) => {
    const cloud = buildCloud(theme, 5.8);
    cloud.position.copy(spawn)
      .addScaledVector(fwd, along)
      .addScaledVector(right, side)
      .add(new THREE.Vector3(0, yOff, 0));
    root.add(cloud);
  });

  scene.add(root);
  scene.userData.aerialReferenceVista = { chassisId, realtime3d: true, image: null };
  return root;
}
