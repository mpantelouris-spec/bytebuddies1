/**
 * AerialGroundVistaKit — far vista floors (never empty grey void below route).
 */
import * as THREE from 'three';
import { rockSandstoneMat, rockDarkMat, concreteRoofMat, glassWindowMat, cloudPuffMat, safetyYellowMat } from './AerialMaterials.js';
import { arenaMover } from '../ArenaBuilderCore.js';

function vistaGroup(scene, name) {
  const g = new THREE.Group();
  g.name = name;
  scene.add(g);
  return g;
}

export function buildAerialVista(scene, curve, recipe) {
  const vista = recipe.vista || { type: 'canyon_floor', y: -42 };
  const len = recipe.spline?.length || 180;
  const builders = {
    canyon_floor: buildCanyonFloor,
    farmland_grid: buildFarmlandGrid,
    cloud_sea: buildCloudSea,
    city_grid: buildCityGrid,
    coastline: buildCoastline,
    mountain_pass: buildMountainPass,
    ocean_churn: buildOceanChurn,
    planet_curve: buildPlanetCurve,
    launch_pad: buildLaunchPad,
  };
  const fn = builders[vista.type] || buildCanyonFloor;
  fn(scene, curve, vista, len);
}

function buildCanyonFloor(scene, curve, vista, len) {
  const y = vista.y ?? -42;
  const g = vistaGroup(scene, 'aerial-vista-canyon');
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(len + 120, 80), rockDarkMat());
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, y, -len / 2);
  g.add(floor);
  const river = new THREE.Mesh(
    new THREE.PlaneGeometry(len + 120, 12),
    new THREE.MeshStandardMaterial({ color: 0x5c4030, roughness: 0.95 }),
  );
  river.rotation.x = -Math.PI / 2;
  river.position.set(-8, y + 0.05, -len / 2);
  g.add(river);

  const inner = vista.wallInner ?? 18;
  const wallCount = vista.narrow ? 18 : 24;
  for (let i = 0; i < wallCount; i++) {
    const t = i / wallCount;
    const p = curve?.getPoint?.(t) || new THREE.Vector3(0, 16, -t * len);
    const side = i % 2 === 0 ? -1 : 1;
    const wallDist = vista.narrow ? 10 + Math.sin(t * Math.PI) * 2 : inner - t * 6;
    const spire = new THREE.Group();
    const h = 25 + Math.random() * 20;
    for (let b = 0; b < 3; b++) {
      const block = new THREE.Mesh(
        new THREE.BoxGeometry(2 + Math.random() * 3, 4 + Math.random() * 5, 2 + Math.random() * 2),
        rockSandstoneMat(),
      );
      block.position.y = b * 5;
      spire.add(block);
    }
    spire.position.set(p.x + side * wallDist, y + h / 2, p.z);
    g.add(spire);
  }
  for (let i = 0; i < 40; i++) {
    const rock = new THREE.Mesh(
      new THREE.SphereGeometry(0.8 + Math.random() * 1.4, 8, 6),
      rockSandstoneMat(),
    );
    const t = Math.random();
    const p = curve?.getPoint?.(t) || new THREE.Vector3(0, 0, -t * len);
    rock.position.set(p.x + (Math.random() - 0.5) * 30, y + 0.3, p.z + (Math.random() - 0.5) * 20);
    g.add(rock);
  }
}

function buildFarmlandGrid(scene, curve, vista, len) {
  const y = vista.y ?? -58;
  const g = vistaGroup(scene, 'aerial-vista-farm');
  const fields = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 500),
    new THREE.MeshStandardMaterial({ color: 0x3d6b35, roughness: 0.95 }),
  );
  fields.rotation.x = -Math.PI / 2;
  fields.position.set(0, y, -len / 2);
  g.add(fields);
  [-30, 30].forEach((rx) => {
    const road = new THREE.Mesh(
      new THREE.PlaneGeometry(500, 6),
      new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.9 }),
    );
    road.rotation.x = -Math.PI / 2;
    road.position.set(rx, y + 0.1, -len / 2);
    g.add(road);
  });
  const barn = new THREE.Mesh(new THREE.BoxGeometry(12, 8, 20), new THREE.MeshStandardMaterial({ color: 0x8b4513 }));
  barn.position.set(-40, y + 4, -80);
  g.add(barn);
  const silo = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 14, 10), new THREE.MeshStandardMaterial({ color: 0x9ca3af }));
  silo.position.set(-48, y + 7, -75);
  g.add(silo);
}

function buildCloudSea(scene, curve, vista, len) {
  const y = vista.y ?? -48;
  const g = vistaGroup(scene, 'aerial-vista-cloud-sea');
  [0, -3, -6].forEach((off, i) => {
    const layer = new THREE.Mesh(
      new THREE.PlaneGeometry(600, 600),
      new THREE.MeshBasicMaterial({
        color: i === 0 ? 0xe8f4ff : i === 1 ? 0xdbeafe : 0xbfdbfe,
        transparent: true, opacity: 0.9 - i * 0.2, depthWrite: false,
      }),
    );
    layer.rotation.x = -Math.PI / 2;
    layer.position.set(0, y + off, -len / 2);
    g.add(layer);
  });
  for (let i = 0; i < 12; i++) {
    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(4 + Math.random() * 4, 5 + Math.random() * 3, 6 + Math.random() * 8, 10),
      cloudPuffMat(0.5),
    );
    pillar.position.set((Math.random() - 0.5) * 100, y + 4, -Math.random() * len);
    g.add(pillar);
  }
}

function buildCityGrid(scene, curve, vista, len) {
  const y = vista.y ?? -38;
  const g = vistaGroup(scene, 'aerial-vista-city');
  for (let bx = -5; bx <= 5; bx++) {
    for (let bz = 0; bz < 8; bz++) {
      const w = 8 + Math.random() * 6;
      const d = 8 + Math.random() * 6;
      const h = 12 + Math.random() * 16;
      const bld = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), concreteRoofMat());
      bld.position.set(bx * 18, y + h / 2, -bz * 22 - 20);
      g.add(bld);
      for (let row = 0; row < Math.floor(h / 3); row++) {
        for (let col = 0; col < 2; col++) {
          if (Math.random() > 0.3) {
            const win = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.5), glassWindowMat());
            win.position.set(bx * 18 + (col - 0.5) * 3, y + row * 3 + 2, -bz * 22 - 20 + d / 2 + 0.05);
            g.add(win);
          }
        }
      }
    }
  }
}

function buildCoastline(scene, curve, vista, len) {
  const y = vista.y ?? -44;
  const g = vistaGroup(scene, 'aerial-vista-coast');
  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(600, 400),
    new THREE.MeshStandardMaterial({ color: 0x0e7490, roughness: 0.3, metalness: 0.15 }),
  );
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, y, -len / 2);
  g.add(water);
  const beach = new THREE.Mesh(
    new THREE.PlaneGeometry(600, 25),
    new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.95 }),
  );
  beach.rotation.x = -Math.PI / 2;
  beach.position.set(0, y + 0.1, -len / 2 + 80);
  g.add(beach);
  for (let i = 0; i < 12; i++) {
    const cliff = new THREE.Mesh(
      new THREE.BoxGeometry(8 + Math.random() * 12, 8 + Math.random() * 8, 6),
      rockSandstoneMat(),
    );
    cliff.position.set(-80 + i * 14, y + 6, -len / 2 + 60 + Math.random() * 20);
    g.add(cliff);
  }
}

function buildMountainPass(scene, curve, vista, len) {
  const y = vista.y ?? -50;
  const g = vistaGroup(scene, 'aerial-vista-mountain');
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 400),
    new THREE.MeshStandardMaterial({ color: 0x2d5a27, roughness: 0.95 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, y, -len / 2);
  g.add(ground);
  const river = new THREE.Mesh(
    new THREE.PlaneGeometry(300, 8),
    new THREE.MeshStandardMaterial({ color: 0x1e40af, roughness: 0.4 }),
  );
  river.rotation.x = -Math.PI / 2;
  river.position.set(0, y + 0.2, -len / 2);
  g.add(river);
  for (let i = 0; i < 20; i++) {
    const pine = new THREE.Mesh(new THREE.ConeGeometry(1.5, 4, 6), new THREE.MeshStandardMaterial({ color: 0x1a472a }));
    pine.position.set((Math.random() - 0.5) * 80, y + 2, -Math.random() * len);
    g.add(pine);
  }
}

function buildOceanChurn(scene, curve, vista, len) {
  const y = vista.y ?? -46;
  const g = vistaGroup(scene, 'aerial-vista-ocean');
  const ocean = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 500),
    new THREE.MeshStandardMaterial({ color: 0x1e3a5f, roughness: 0.35, metalness: 0.2 }),
  );
  ocean.rotation.x = -Math.PI / 2;
  ocean.position.set(0, y, -len / 2);
  g.add(ocean);
  arenaMover(scene, (t) => {
    ocean.position.y = y + Math.sin(t * 0.5) * 0.15;
  });
}

function buildPlanetCurve(scene, curve, vista, len) {
  const y = vista.y ?? -55;
  const g = vistaGroup(scene, 'aerial-vista-planet');
  const cnv = document.createElement('canvas');
  cnv.width = 512;
  cnv.height = 256;
  const ctx = cnv.getContext('2d');
  ctx.fillStyle = '#1e40af';
  ctx.fillRect(0, 0, 512, 256);
  ctx.fillStyle = '#22c55e';
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.arc(80 + i * 55, 100 + Math.sin(i) * 30, 40 + Math.random() * 20, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(cnv);
  const planet = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 80),
    new THREE.MeshBasicMaterial({ map: tex }),
  );
  planet.rotation.x = -0.35;
  planet.position.set(0, y, -len / 2);
  g.add(planet);
  const rim = new THREE.Mesh(
    new THREE.PlaneGeometry(420, 6),
    new THREE.MeshBasicMaterial({ color: 0x4fc3f7, transparent: true, opacity: 0.25, depthWrite: false }),
  );
  rim.rotation.x = -0.35;
  rim.position.set(0, y + 8, -len / 2);
  g.add(rim);
}

function buildLaunchPad(scene, curve, vista, len) {
  const y = vista.y ?? 0;
  const g = vistaGroup(scene, 'aerial-vista-pad');
  const pad = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 80),
    new THREE.MeshStandardMaterial({ color: 0x4b5563, roughness: 0.85 }),
  );
  pad.rotation.x = -Math.PI / 2;
  pad.position.set(0, y, 0);
  g.add(pad);
  const stripe = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 4),
    safetyYellowMat(),
  );
  stripe.rotation.x = -Math.PI / 2;
  stripe.position.set(0, y + 0.05, 0);
  g.add(stripe);
}
