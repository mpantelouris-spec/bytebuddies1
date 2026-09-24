/**
 * VenetianMidnightCanalKit — art-directed vista #2 (Helicopter).
 * Hero: reflective canal + Rialto bridge + moonlit palazzo row.
 */
import * as THREE from 'three';
import { createTerrainMaps, pbrMat } from '../../../racing/mk-tracks/BiomeAAAKit.js';
import { add, geo, mat, archRow, reflectiveWater, starField } from '../PremiumEnvironmentHelpers.js';

function palazzoStone() {
  const maps = createTerrainMaps(0x57534e, { roughness: 0.86, variation: 0.2 });
  return pbrMat(0x57534e, {
    roughness: 0.86,
    metalness: 0.04,
    map: maps.colorMap,
    normalMap: maps.normalMap,
    roughnessMap: maps.roughnessMap,
  });
}

function warmWindow(color = 0xfbbf24, emi = 0.42) {
  return pbrMat(color, { emissive: color, emi, roughness: 0.18 });
}

function buildPalazzo(parent, x, y, z, h, w, d, name, side, stone, winWarm, winBright) {
  add(parent, geo.box(w, h, d), stone, x, y + h / 2, z, `${name}Body`);
  // Loggia arches at base
  archRow(parent, x, y + 2, z + side * (d / 2 + 0.4), 3, 3.2, 5, stone, `${name}Loggia`);
  // Window strips
  for (let floor = 0; floor < Math.floor(h / 4.5); floor++) {
    for (let col = 0; col < 3; col++) {
      const wx = x + (col - 1) * (w / 3.5);
      const wy = y + 3 + floor * 4.2;
      const win = new THREE.Mesh(
        new THREE.PlaneGeometry(w / 4, 2.2),
        ((floor + col) % 2) ? winBright : winWarm,
      );
      win.position.set(wx, wy, z + side * (d / 2 + 0.12));
      if (side < 0) win.rotation.y = Math.PI;
      win.name = `${name}Win_${floor}_${col}`;
      parent.add(win);
    }
  }
  if (Math.abs(x) < 8) {
    add(parent, geo.cylinder(0.12, 0.15, h * 0.65, 8), stone, x + side * 2, y + h * 0.55, z, `${name}Campanile`);
    add(parent, geo.cone(1.2, 2.5, 8), mat(0x78716c), x + side * 2, y + h * 0.65 + 1.2, z, `${name}Spire`);
  }
}

export function installVenetianCanalLighting(scene, root) {
  if (!scene || scene.getObjectByName('VenetianVistaLights')) return;
  const rig = new THREE.Group();
  rig.name = 'VenetianVistaLights';
  const moon = new THREE.DirectionalLight(0xc7d2fe, 0.18);
  moon.position.set(60, 80, -40);
  rig.add(moon);
  root.traverse((obj) => {
    if (!obj.name?.startsWith('BridgeLamp')) return;
    const pl = new THREE.PointLight(0xfbbf24, 0.28, 22, 2);
    pl.position.copy(obj.position);
    rig.add(pl);
  });
  scene.add(rig);
}

export function buildVenetianMidnightCanal(g, backdrop, y) {
  const canal = backdrop.at(0, -48);
  const root = new THREE.Group();
  root.name = 'VenetianMidnightCanal';
  g.add(root);

  const stone = palazzoStone();
  const winWarm = warmWindow(0xfbbf24, 0.32);
  const winBright = warmWindow(0xfbbf24, 0.5);
  const lampGlow = warmWindow(0xfff3c4, 0.75);
  const waterY = y - 2;

  // Canal water + mirror duplicate for SSR-style read (WebGL fallback)
  reflectiveWater(root, canal.x, waterY, canal.z, 360, 150, 'CanalWaterSSR');
  const mirror = reflectiveWater(root, canal.x, waterY - 0.35, canal.z + 0.2, 360, 150, 'CanalMirror');
  mirror.material.opacity = 0.35;
  mirror.position.y = waterY - 0.4;
  if (mirror.material.isMeshPhysicalMaterial) mirror.material.metalness = 0.95;

  // Left bank palazzi (receding perspective)
  for (let i = 0; i < 8; i++) {
    const pz = -18 - i * 16;
    const h = 16 + (i % 3) * 5;
    buildPalazzo(root, -22 - (i % 2) * 3, y, canal.z + pz, h, 14, 9, `PalazzoL${i}`, -1, stone, winWarm, winBright);
  }
  // Right bank
  for (let i = 0; i < 8; i++) {
    const pz = -22 - i * 15;
    const h = 18 + (i % 2) * 6;
    buildPalazzo(root, 24 + (i % 2) * 2, y, canal.z + pz, h, 13, 8, `PalazzoR${i}`, 1, stone, winWarm, winBright);
  }

  // Hero Rialto bridge
  const bridgeZ = canal.z - 28;
  add(root, geo.box(22, 0.5, 10), stone, canal.x, y + 1.2, bridgeZ, 'RialtoDeck');
  add(root, geo.box(22, 3.5, 0.6), stone, canal.x, y + 3, bridgeZ - 5.2, 'RialtoParapet');
  add(root, geo.box(22, 3.5, 0.6), stone, canal.x, y + 3, bridgeZ + 5.2, 'RialtoParapetBack');
  [-9, 0, 9].forEach((ox, i) => {
    add(root, geo.cylinder(0.5, 0.65, 4.5, 10), stone, canal.x + ox, y + 3.2, bridgeZ, `RialtoArch${i}`);
  });
  [-8, 8].forEach((lx, i) => {
    add(root, geo.cylinder(0.35, 0.45, 3.2, 8), mat('dark_steel'), canal.x + lx, y + 2.8, bridgeZ + 4, `BridgeLampPost${i}`);
    add(root, geo.sphere(0.32, 8, 6), lampGlow, canal.x + lx, y + 4.2, bridgeZ + 4, `BridgeLamp${i}`);
  });

  // Gondola silhouettes
  [[-6, -12], [8, -38]].forEach(([ox, oz], i) => {
    add(root, geo.box(5, 0.35, 1.2), mat(0x1e293b), canal.x + ox, waterY + 0.25, canal.z + oz, `GondolaHull${i}`);
    add(root, geo.box(0.15, 2.2, 0.15), mat(0x78350f), canal.x + ox - 1, waterY + 1.2, canal.z + oz, `GondolaOar${i}`);
  });

  // Mooring poles
  for (let m = 0; m < 6; m++) {
    const mx = canal.x - 30 + m * 12;
    add(root, geo.cylinder(0.25, 0.3, 2.8, 8), mat(0x78350f), mx, waterY + 1.4, canal.z - 8, `Mooring${m}`);
    add(root, geo.cylinder(0.35, 0.35, 0.5, 8), mat(0xf97316, { emissive: 0xf97316, emi: 0.3 }), mx, waterY + 2.8, canal.z - 8, `MooringCap${m}`);
  }

  // Moon + stars
  add(root, geo.sphere(3.5, 24, 18), mat(0xf1f5f9, { emissive: 0xe2e8f0, emi: 0.22 }), canal.x + 55, y + 42, canal.z + 20, 'MoonDisc');
  starField(root, canal.x, y + 35, canal.z + 10, 140, { x: 200, y: 50, z: 120 }, 'CanalStars');

  root.userData.premiumEnvironment = 'venetian_midnight_canal';
  root.userData.artDirected = true;
  return root;
}
