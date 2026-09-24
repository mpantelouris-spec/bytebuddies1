/**
 * NeonServerNecropolisKit — art-directed vista #4 (Race Drone).
 * Reference: cyberpunk data-center corridor — flanking server racks, cyan/magenta
 * data ribbons, reflective floor, SERVER NECROPOLIS hero rack.
 */
import * as THREE from 'three';
import { pbrMat } from '../../../racing/mk-tracks/BiomeAAAKit.js';
import { add, geo, mat, seededRnd, instancedMesh } from '../PremiumEnvironmentHelpers.js';

const CYAN = 0x00ffff;
const CYAN_SOFT = 0x06b6d4;
const MAGENTA = 0xff00ff;
const MAGENTA_SOFT = 0xec4899;
const LIME = 0x22c55e;
const STEEL = 0x1e293b;
const FLOOR = 0x050810;

function rackSteel() {
  const m = pbrMat(STEEL, { roughness: 0.22, metalness: 0.92, emissive: 0x0f172a, emi: 0.04 });
  if (m.isMeshPhysicalMaterial) {
    m.clearcoat = 0.65;
    m.clearcoatRoughness = 0.08;
  }
  return m;
}

function neonMat(color, emi = 0.85) {
  const m = pbrMat(color, { emissive: color, emi, roughness: 0.08, metalness: 0.15, transparent: true, opacity: 0.92 });
  m.toneMapped = false;
  return m;
}

function reflectiveFloorMat() {
  const m = pbrMat(FLOOR, { roughness: 0.04, metalness: 0.95, emissive: 0x06b6d4, emi: 0.03 });
  if (m.isMeshPhysicalMaterial) {
    m.clearcoat = 1;
    m.clearcoatRoughness = 0.02;
  }
  return m;
}

function serverLabel(parent, x, y, z, text, name = 'ServerLabel') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 96;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(6,182,212,0.15)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = 'bold 28px "Courier New", monospace';
  ctx.fillStyle = '#00ffff';
  ctx.shadowColor = '#06b6d4';
  ctx.shadowBlur = 12;
  ctx.fillText(text, 16, 58);
  const tex = new THREE.CanvasTexture(canvas);
  if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
  const plane = add(
    parent,
    geo.plane(4.2, 0.72),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, fog: true }),
    x, y, z,
    name,
  );
  plane.rotation.y = Math.PI / 2;
  return plane;
}

function buildServerRack(parent, x, y, z, h, facingY, prefix, { hero = false } = {}) {
  const steel = rackSteel();
  const body = add(parent, geo.box(3.6, h, 2.4), steel, x, y + h / 2, z, `${prefix}Body`);
  body.rotation.y = facingY;

  const faceX = x + Math.sin(facingY) * 1.22;
  const faceZ = z + Math.cos(facingY) * 1.22;

  for (let v = 0; v < Math.floor(h / 1.4); v++) {
    add(parent, geo.box(3.1, 0.06, 0.08), mat(0x334155, { metalness: 0.8 }), faceX, y + 1.2 + v * 1.35, faceZ, `${prefix}Vent${v}`);
    const ledColor = v % 3 === 0 ? CYAN_SOFT : (v % 3 === 1 ? MAGENTA_SOFT : LIME);
    add(
      parent,
      geo.box(2.8, 0.05, 0.04),
      neonMat(ledColor, 0.55 + (v % 2) * 0.25),
      faceX + Math.sin(facingY) * 0.06,
      y + 1.45 + v * 1.35,
      faceZ + Math.cos(facingY) * 0.06,
      `${prefix}DataStream${v}`,
    );
  }

  for (let u = 0; u < 4; u++) {
    add(
      parent,
      geo.box(0.12, 0.12, 0.06),
      neonMat(u % 2 ? LIME : CYAN_SOFT, 0.9),
      faceX + (u - 1.5) * 0.55,
      y + h - 0.6,
      faceZ,
      `${prefix}StatusLed${u}`,
    );
  }

  if (hero) {
    serverLabel(parent, faceX + Math.sin(facingY) * 0.14, y + h * 0.62, faceZ + Math.cos(facingY) * 0.14, 'SERVER NECROPOLIS', `${prefix}HeroLabel`);
  }

  return body;
}

/** Thick emissive cable between two points (data ribbon). */
function dataRibbon(parent, x1, y1, z1, x2, y2, z2, color, radius, prefix) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dz = z2 - z1;
  const len = Math.hypot(dx, dy, dz);
  if (len < 0.5) return;
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const midZ = (z1 + z2) / 2;
  const tube = add(parent, geo.cylinder(radius, radius, len, 8), neonMat(color, 0.95), midX, midY, midZ, `${prefix}Ribbon`);
  tube.rotation.order = 'YXZ';
  tube.rotation.y = Math.atan2(dx, dz);
  tube.rotation.x = Math.acos(Math.max(-1, Math.min(1, dy / len)));
  tube.userData.pulseRibbon = true;
  return tube;
}

function weaveDataCables(parent, backdrop, y, aisleX, aisleZ) {
  const colors = [CYAN, MAGENTA, CYAN_SOFT, MAGENTA_SOFT];
  for (let i = 0; i < 10; i++) {
    const zOff = -18 - i * 14;
    const lp = backdrop.at(-20, zOff);
    const rp = backdrop.at(20, zOff);
    const c = colors[i % colors.length];
    const archY = y + 14 + (i % 3) * 3;
    dataRibbon(parent, lp.x, y + 18, lp.z, aisleX, archY, aisleZ + zOff * 0.15, c, 0.22, `ArchCable${i}A`);
    dataRibbon(parent, aisleX, archY, aisleZ + zOff * 0.15, rp.x, y + 18, rp.z, c, 0.22, `ArchCable${i}B`);
    dataRibbon(parent, lp.x, y + 2, lp.z, rp.x, y + 1.5, rp.z, colors[(i + 1) % colors.length], 0.14, `FloorCable${i}`);
  }

  for (let w = 0; w < 6; w++) {
    const p1 = backdrop.at(-18 + (w % 2) * 36, -25 - w * 22);
    const p2 = backdrop.at(-12 + (w % 3) * 8, -38 - w * 20);
    const p3 = backdrop.at(14 - (w % 2) * 10, -52 - w * 18);
    dataRibbon(parent, p1.x, y + 6 + w * 2, p1.z, p2.x, y + 10 + w, p2.z, colors[w % 4], 0.18, `Weave${w}A`);
    dataRibbon(parent, p2.x, y + 10 + w, p2.z, p3.x, y + 5 + w * 1.5, p3.z, colors[(w + 2) % 4], 0.16, `Weave${w}B`);
  }
}

export function installNeonNecropolisLighting(scene, root) {
  if (!scene || scene.getObjectByName('NeonVistaLights')) return;
  const rig = new THREE.Group();
  rig.name = 'NeonVistaLights';
  rig.add(new THREE.AmbientLight(0x0f172a, 0.04));
  const cyanFill = new THREE.DirectionalLight(CYAN_SOFT, 0.06);
  cyanFill.position.set(-40, 30, -20);
  rig.add(cyanFill);
  const magRim = new THREE.DirectionalLight(MAGENTA_SOFT, 0.05);
  magRim.position.set(35, 18, 50);
  rig.add(magRim);
  root.traverse((obj) => {
    if (!obj.name?.startsWith('DataStream') && !obj.name?.includes('Ribbon')) return;
    if ((obj.position.x + obj.position.z + obj.position.y) % 5 > 3.2) return;
    const col = obj.name.includes('Arch') || obj.position.y > 12 ? CYAN : MAGENTA_SOFT;
    const pl = new THREE.PointLight(col, 0.22, 14, 2);
    pl.position.copy(obj.position);
    rig.add(pl);
  });
  scene.add(rig);
}

export function buildNeonServerNecropolis(g, backdrop, y) {
  const aisle = backdrop.at(0, -28);
  const root = new THREE.Group();
  root.name = 'NeonServerNecropolis';
  g.add(root);

  // Layer 0: mirror-dark corridor floor
  const floor = add(
    root,
    geo.plane(360, 130, 32, 12),
    reflectiveFloorMat(),
    aisle.x, y + 0.02, aisle.z,
    'NecropolisFloor',
    { rotX: -Math.PI / 2, receiveShadow: true },
  );
  floor.userData.animateWater = true;

  // Subtle floor grid lines (cyan/magenta cross-hatch reflection guides)
  for (let gx = 0; gx < 36; gx++) {
    const lx = aisle.x - 170 + gx * 10;
    const isCyan = gx % 2 === 0;
    add(
      root,
      geo.box(8, 0.02, 0.06),
      neonMat(isCyan ? CYAN_SOFT : MAGENTA_SOFT, 0.18),
      lx, y + 0.06, aisle.z,
      `FloorGridX${gx}`,
    );
  }

  // Layer 1: flanking server rack rows (corridor walls)
  const rnd = seededRnd(44);
  for (let row = 0; row < 14; row++) {
    const zOff = -12 - row * 12;
    const hL = 18 + Math.floor(rnd() * 8);
    const hR = 20 + Math.floor(rnd() * 6);
    const lp = backdrop.at(-21, zOff);
    const rp = backdrop.at(21, zOff);
    buildServerRack(root, lp.x, y + 1, lp.z, hL, Math.PI / 2, `RackL${row}`, { hero: row === 2 });
    buildServerRack(root, rp.x, y + 1, rp.z, hR, -Math.PI / 2, `RackR${row}`);
  }

  // Layer 2: distant rack silhouettes (depth)
  for (let d = 0; d < 8; d++) {
    const p = backdrop.at(-26 + (d % 2) * 52, -130 - d * 16);
    const h = 14 + (d % 3) * 4;
    add(root, geo.box(3, h, 2), mat(STEEL, { metalness: 0.85, transparent: true, opacity: 0.35 - d * 0.03 }), p.x, y + h / 2, p.z, `FarRack${d}`);
  }

  // Layer 3: hero data ribbon bundles weaving through aisle
  weaveDataCables(root, backdrop, y, aisle.x, aisle.z);

  // Layer 4: overhead cable bundles + holo pylons
  for (let i = 0; i < 7; i++) {
    const p = backdrop.at(-8 + (i % 3) * 8, -20 - i * 18);
    add(root, geo.box(0.2, 16, 0.2), neonMat(CYAN_SOFT, 0.45), p.x, y + 10, p.z, `DataPylon${i}`);
    const ring = add(root, geo.torus(2.8, 0.08, 6, 6), neonMat(i % 2 ? MAGENTA : CYAN, 0.78), p.x, y + 18, p.z, `DataRing${i}`, { rotX: Math.PI / 2 });
    ring.userData.spinRing = 0.4 + i * 0.05;
  }

  // Layer 5: holo terminal strip (background HUD boards)
  for (let t = 0; t < 5; t++) {
    const tp = backdrop.at(-32 + t * 16, -8);
    add(root, geo.box(3.2, 2.4, 0.1), mat(STEEL, { metalness: 0.8 }), tp.x, y + 8, tp.z, `HoloScreen${t}`);
    add(
      root,
      geo.plane(3, 2.1),
      neonMat(t % 2 ? CYAN_SOFT : MAGENTA_SOFT, 0.62),
      tp.x, y + 8.2, tp.z + 0.12,
      `HoloTerminal${t}`,
    );
  }

  // Layer 6: atmospheric haze catching neon (low opacity, high elevation)
  const haze = add(
    root,
    geo.plane(340, 90),
    mat(0x06b6d4, { transparent: true, opacity: 0.06, depthWrite: false }),
    aisle.x, y + 16, aisle.z - 50,
    'NecropolisHaze',
    { rotX: -Math.PI / 2 },
  );
  haze.material.blending = THREE.AdditiveBlending;
  const hazeMag = add(
    root,
    geo.plane(280, 70),
    mat(0xec4899, { transparent: true, opacity: 0.04, depthWrite: false }),
    aisle.x, y + 12, aisle.z - 30,
    'NecropolisHazeMag',
    { rotX: -Math.PI / 2 },
  );
  hazeMag.material.blending = THREE.AdditiveBlending;

  // Floating holo bits (reference: small circular holographic debris)
  instancedMesh(
    root,
    new THREE.TorusGeometry(0.35, 0.04, 6, 12),
    neonMat(CYAN_SOFT, 0.55),
    24,
    (dummy, i) => {
      const p = backdrop.at((i % 5 - 2) * 6, -10 - (i % 8) * 11);
      dummy.position.set(p.x, y + 6 + (i % 4) * 2.5, p.z);
      dummy.rotation.set(Math.PI / 2, i * 0.4, 0);
      dummy.scale.setScalar(0.8 + (i % 3) * 0.3);
    },
    'NecropolisHoloBits',
  );

  root.userData.premiumEnvironment = 'neon_server_necropolis';
  root.userData.artDirected = true;
  return root;
}
