/**
 * AerialHeroKit — start landmarks per course recipe.
 */
import * as THREE from 'three';
import { rockSandstoneMat, safetyYellowMat, cloudPuffMat } from './AerialMaterials.js';
import { buildNeonCheckpointArch } from '../../racing/mk-tracks/SunsetCoastHeroKit.js';
import { arenaMover } from '../ArenaBuilderCore.js';
import { buildFloatingCitadelIsland } from './AerialIslandKit.js';

function canvasRoundRect(ctx, x, y, w, h, r) {
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function placeAerialHero(scene, curve, recipe) {
  const hero = recipe.hero;
  if (!hero || !curve) return;
  const t = hero.t ?? 0.08;
  const p = curve.getPoint(t);
  const g = new THREE.Group();
  g.name = 'AerialHero';
  scene.add(g);

  switch (hero.type) {
    case 'sky_academy_arch':
      buildSkyAcademyArch(g, p);
      break;
    case 'altimeter_billboard':
      buildAltimeterBillboard(scene, p);
      break;
    case 'canyon_citadel':
      buildCanyonCitadel(scene, g, p);
      break;
    case 'cloud_whale':
      buildCloudWhale(scene, g, p);
      break;
    case 'lighthouse':
      buildLighthouse(scene, g, p);
      break;
    case 'wind_turbines':
      buildWindTurbines(scene, g, p);
      break;
    case 'warp_cathedral':
      buildWarpCathedral(scene, g, p);
      break;
    case 'supercell_wall':
      buildSupercellWall(g, p);
      break;
    case 'orbital_station':
      buildOrbitalStation(g, p);
      break;
    case 'skyline_tower':
      buildSkylineTower(g, p);
      break;
    case 'eye_stunt_ring':
      break; // handled in ring kit
    default:
      buildSkyAcademyArch(g, p);
  }
}

function buildCanyonCitadel(scene, g, p) {
  const scale = 1.12;
  const citadel = buildFloatingCitadelIsland(scale);
  citadel.position.set(p.x + 34, p.y - 14 - 38 * scale, p.z - 4);
  citadel.rotation.y = -0.45;
  g.add(citadel);

  const beaconMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0ea5e9,
    emissiveIntensity: 0.7,
    metalness: 0.2,
    roughness: 0.3,
  });
  const beacon = new THREE.Mesh(new THREE.TorusGeometry(4.8, 0.12, 10, 48), beaconMat);
  beacon.position.set(p.x + 34, p.y + 1.5, p.z - 4);
  beacon.rotation.x = Math.PI / 2;
  g.add(beacon);
  const light = new THREE.PointLight(0x38bdf8, 0.65, 24);
  light.position.copy(beacon.position);
  g.add(light);
  arenaMover(scene, (time) => {
    beacon.rotation.z = time * 0.16;
    beaconMat.emissiveIntensity = 0.58 + Math.sin(time * 1.4) * 0.12;
  });
}

function buildSkyAcademyArch(g, p) {
  const arch = buildNeonCheckpointArch(5.5, 0x00d4ff);
  arch.scale.setScalar(1.15);
  arch.position.set(p.x, p.y - 1, p.z);
  g.add(arch);

  const cnv = document.createElement('canvas');
  cnv.width = 512;
  cnv.height = 96;
  const ctx = cnv.getContext('2d');
  ctx.fillStyle = '#fff';
  canvasRoundRect(ctx, 4, 4, 504, 88, 8);
  ctx.fill();
  ctx.fillStyle = '#1e3a5f';
  ctx.font = 'bold 42px system-ui,sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SKY ACADEMY', 256, 58);
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(6, 1.0),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cnv), transparent: true, depthWrite: false }),
  );
  sign.position.set(p.x, p.y + 14, p.z);
  g.add(sign);
  [-6, 6].forEach((ox) => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 4, 6), safetyYellowMat());
    pole.position.set(p.x + ox, p.y + 2, p.z);
    g.add(pole);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.7), safetyYellowMat());
    flag.position.set(p.x + ox + 0.6, p.y + 3.5, p.z);
    g.add(flag);
  });
}

function buildAltimeterBillboard(scene, p) {
  const cnv = document.createElement('canvas');
  cnv.width = 512;
  cnv.height = 256;
  const ctx = cnv.getContext('2d');
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, 512, 256);
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(0, 90, 512, 100);
  ctx.fillStyle = '#22c55e';
  ctx.font = 'bold 48px system-ui,sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('HOLD GREEN', 256, 150);
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 4),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cnv), transparent: true, depthWrite: false }),
  );
  sign.position.set(p.x - 6, p.y, p.z);
  scene.add(sign);
}

function buildCloudWhale(scene, g, p) {
  const sizes = [12, 9, 8, 6];
  sizes.forEach((s, i) => {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(s, 12, 10), cloudPuffMat(0.7));
    puff.position.set(i * 8, Math.sin(i) * 2, 0);
    g.add(puff);
  });
  g.position.set(p.x + 25, p.y + 8, p.z);
  arenaMover(scene, (t) => {
    g.position.y = p.y + 8 + Math.sin(t * 0.6) * 0.4;
  });
}

function buildLighthouse(scene, g, p) {
  const tower = new THREE.Mesh(
    new THREE.CylinderGeometry(2.5, 2.8, 22, 12),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 }),
  );
  tower.position.set(p.x + 30, p.y - 10, p.z);
  g.add(tower);
  const band = new THREE.Mesh(
    new THREE.CylinderGeometry(2.6, 2.6, 4, 12),
    new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.3 }),
  );
  band.position.set(p.x + 30, p.y + 2, p.z);
  g.add(band);
  const light = new THREE.PointLight(0xfbbf24, 1.5, 30);
  light.position.set(p.x + 30, p.y + 8, p.z);
  g.add(light);
  arenaMover(scene, (t) => {
    light.intensity = 1.0 + Math.sin(t * 2) * 0.5;
  });
}

function buildWindTurbines(scene, g, p) {
  for (let i = 0; i < 3; i++) {
    const hub = new THREE.Group();
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.8, 28, 8),
      new THREE.MeshStandardMaterial({ color: 0x9ca3af, metalness: 0.4 }),
    );
    pole.position.y = 14;
    hub.add(pole);
    const bladeHub = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 10, 10),
      new THREE.MeshStandardMaterial({ color: 0xe5e7eb }),
    );
    bladeHub.position.y = 28;
    hub.add(bladeHub);
    for (let b = 0; b < 3; b++) {
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(14, 0.15, 1.2),
        new THREE.MeshStandardMaterial({ color: 0xe5e7eb }),
      );
      blade.position.y = 28;
      blade.rotation.z = (b / 3) * Math.PI * 2;
      blade.position.x = Math.cos(blade.rotation.z) * 7;
      blade.position.z = Math.sin(blade.rotation.z) * 7;
      hub.add(blade);
    }
    hub.position.set(p.x - 30 + i * 30, p.y - 14, p.z);
    hub.userData.spin = i * 0.3;
    g.add(hub);
    arenaMover(scene, (t) => {
      bladeHub.rotation.y = t * 0.8 + hub.userData.spin;
    });
  }
}

function buildSupercellWall(g, p) {
  const wall = new THREE.Group();
  wall.name = 'supercell-wall';
  for (let i = 0; i < 8; i++) {
    const puff = new THREE.Mesh(
      new THREE.SphereGeometry(8 + (i % 3) * 3, 12, 10),
      new THREE.MeshBasicMaterial({
        color: 0x4a5568, transparent: true, opacity: 0.55, depthWrite: false, fog: false,
      }),
    );
    puff.position.set((i % 4) * 6 - 9, (i % 3) * 4, (i % 2) * 5);
    wall.add(puff);
  }
  wall.position.set(p.x + 35, p.y + 4, p.z);
  g.add(wall);
  const lightning = new THREE.PointLight(0x87ceeb, 2.5, 60);
  lightning.position.copy(wall.position);
  g.add(lightning);
}

function buildOrbitalStation(g, p) {
  const station = new THREE.Group();
  station.name = 'orbital-station';
  const core = new THREE.Mesh(
    new THREE.CylinderGeometry(6, 6, 4, 16),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6, roughness: 0.35 }),
  );
  core.rotation.x = Math.PI / 2;
  station.add(core);
  for (let i = 0; i < 4; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(10 + i * 2, 0.25, 8, 32),
      new THREE.MeshStandardMaterial({
        color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 1.6, metalness: 0.7,
      }),
    );
    ring.rotation.x = Math.PI / 2;
    station.add(ring);
  }
  const dock = new THREE.Mesh(
    new THREE.BoxGeometry(3, 1.5, 8),
    new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 0.8 }),
  );
  dock.position.set(0, 0, 12);
  station.add(dock);
  station.position.copy(p);
  g.add(station);
}

function buildSkylineTower(g, p) {
  const cluster = new THREE.Group();
  cluster.name = 'skyline-tower-cluster';
  [[0, 32, 0, 8], [-12, 24, -8, 6], [14, 28, 6, 7], [-8, 18, 10, 5]].forEach(([x, h, z, w]) => {
    const bld = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, w),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.35, roughness: 0.55 }),
    );
    bld.position.set(x, h * 0.5 - 18, z);
    cluster.add(bld);
    for (let f = 0; f < Math.floor(h / 3); f++) {
      for (let col = 0; col < 2; col++) {
        const win = new THREE.Mesh(
          new THREE.PlaneGeometry(0.4, 0.5),
          new THREE.MeshBasicMaterial({
            color: 0xffee88, transparent: true, opacity: Math.random() > 0.4 ? 0.85 : 0.1,
          }),
        );
        win.position.set(x + w * 0.5 + 0.01, -18 + f * 3 + 1.5, z + col * 0.6);
        cluster.add(win);
      }
    }
  });
  cluster.position.set(p.x + 40, p.y - 8, p.z);
  g.add(cluster);
}

function buildWarpCathedral(scene, g, p) {
  [8, 6, 4].forEach((r, i) => {
    const col = i === 0 ? 0xa855f7 : i === 1 ? 0x06b6d4 : 0xec4899;
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(r, 0.35, 12, 48),
      new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 1.8, metalness: 0.85 }),
    );
    ring.position.copy(p);
    ring.rotation.x = Math.PI / 2;
    ring.userData.spinDir = i % 2 === 0 ? 1 : -1;
    g.add(ring);
    arenaMover(scene, (t) => {
      ring.rotation.z = t * 0.4 * ring.userData.spinDir;
    });
  });
}
