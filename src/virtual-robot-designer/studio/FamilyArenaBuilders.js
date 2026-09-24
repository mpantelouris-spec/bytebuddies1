/**
 * FamilyArenaBuilders — Visual bible Part 1 (martian, underwater, industrial, sky, cyber, spider, sandbox)
 */
import * as THREE from 'three';
import {
  initFamilyScene, makeSkyGradient, arenaMover, finishChassisOrGoal,
  emberParticles, snowParticles, bubbleParticles, dustParticles,
  regolithMat, concreteFactoryMat, goalMarker, emergencyLights,
} from './ArenaBuilderCore.js';
import { addWarehouseShelf } from './ArenaSceneryKit.js';
import { buildAerialWorld } from './aerial-world/AerialWorldKit.js';

// ─── MARTIAN / RED PLANET (1A) ─────────────────────────────────────────────
export function buildMartianPlanetArena(scene, challenge) {
  initFamilyScene(scene, [0.85, 0.8, 1.0, 0xffa060]);
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, '#5a2010');
  g.addColorStop(0.45, '#c87840');
  g.addColorStop(0.75, '#e8a060');
  g.addColorStop(1, '#8b4513');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  ctx.fillStyle = '#ddd8cc';
  ctx.beginPath();
  ctx.arc(380, 120, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(420, 95, 12, 0, Math.PI * 2);
  ctx.fill();
  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = tex;
  scene.fog = new THREE.Fog(0x8a3820, 35, 85);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), regolithMat());
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  for (let i = 0; i < 18; i++) {
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(1.2 + Math.random() * 1.8, 0),
      new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.95 }),
    );
    const angle = (i / 18) * Math.PI * 2;
    const r = 8 + Math.random() * 22;
    rock.position.set(Math.cos(angle) * r, 0.5 + Math.random() * 0.8, Math.sin(angle) * r - 14);
    rock.castShadow = true;
    scene.add(rock);
  }

  [[-15, -10], [12, 8], [-8, 18], [20, -15]].forEach(([x, z]) => {
    const rock = new THREE.Mesh(
      new THREE.DodecahedronGeometry(1.2 + Math.random() * 1.5, 0),
      new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.95 }),
    );
    rock.position.set(x, 0.6, z);
    rock.castShadow = true;
    scene.add(rock);
  });

  [[-10, 5], [8, -12], [-18, -8]].forEach(([x, z]) => {
    const flag = new THREE.Group();
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 2.5, 6),
      new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.6 }),
    );
    pole.position.y = 1.25;
    flag.add(pole);
    const banner = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 0.7),
      new THREE.MeshStandardMaterial({ color: 0x1e40af, emissive: 0x1e40af, emissiveIntensity: 0.2 }),
    );
    banner.position.set(0.6, 2, 0);
    flag.add(banner);
    flag.position.set(x, 0, z);
    scene.add(flag);
  });

  [[6, -6], [-14, 12]].forEach(([x, z]) => {
    const panel = new THREE.Group();
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 0.1, 1.8),
      new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.5 }),
    );
    base.position.y = 0.5;
    panel.add(base);
    const wing = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.04, 1.5),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7, emissive: 0x0ea5e9, emissiveIntensity: 0.15 }),
    );
    wing.position.set(0, 0.9, 0);
    wing.rotation.x = -0.4;
    panel.add(wing);
    panel.position.set(x, 0, z);
    scene.add(panel);
  });

  [[0, -8], [-12, 4], [14, -18]].forEach(([x, z]) => {
    const beacon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.2, 1.8, 6),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xf59e0b, emissiveIntensity: 0.9 }),
    );
    beacon.position.set(x, 0.9, z);
    scene.add(beacon);
  });

  dustParticles(scene, 280, 0xc87840);
  scene.add(new THREE.AmbientLight(0x6a3018, 0.55));
  const sun = new THREE.DirectionalLight(0xffa060, 1.1);
  sun.position.set(-12, 18, 8);
  sun.castShadow = true;
  scene.add(sun);

  finishChassisOrGoal(scene, challenge, {
    path: 0xc1440e, glow: 0xf4a460, goal: 0x22c55e, goalLabel: 'SUMMIT FLAG',
  }, -30, 'SUMMIT FLAG');
}

// ─── UNDERWATER (1C) ───────────────────────────────────────────────────────
function _underwaterBase(scene, skyTop, skyBot, fogCol, floorCol) {
  makeSkyGradient(scene, [[0, skyTop], [0.5, skyBot], [1, '#041828']]);
  scene.fog = new THREE.Fog(fogCol, 20, 55);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(90, 90),
    new THREE.MeshStandardMaterial({ color: floorCol, roughness: 0.95 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  scene.add(new THREE.AmbientLight(0x0c4a6e, 0.65));
  const sun = new THREE.DirectionalLight(0x7dd3fc, 0.5);
  sun.position.set(5, 20, 10);
  scene.add(sun);
  bubbleParticles(scene, 180, 0x7dd3fc);
}

export function buildCoralReefArena(scene, challenge) {
  initFamilyScene(scene, [0.7, 0.65, 0.55]);
  _underwaterBase(scene, '#0d9488', '#22d3ee', 0x0c4a6e, 0xd4a574);
  const coralCols = [0xf472b6, 0xfb923c, 0xa855f7, 0x22d3ee];
  for (let i = 0; i < 14; i++) {
    const x = (Math.random() - 0.5) * 36;
    const z = -Math.random() * 32;
    if (Math.abs(x) < 4) continue;
    const col = coralCols[i % coralCols.length];
    const coral = new THREE.Mesh(
      new THREE.ConeGeometry(0.5 + Math.random() * 0.6, 1.5 + Math.random() * 2, 6),
      new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.35, roughness: 0.7 }),
    );
    coral.position.set(x, 0.75, z);
    scene.add(coral);
  }
  finishChassisOrGoal(scene, challenge, {
    path: 0x0d9488, glow: 0x22d3ee, goal: 0x22d3ee, goalLabel: 'REEF SURVEY',
  }, -28, 'REEF SURVEY');
}

export function buildDeepTrenchArena(scene, challenge) {
  initFamilyScene(scene, [0.35, 0.3, 0.4]);
  _underwaterBase(scene, '#021a30', '#041828', 0x021a28, 0x1a2838);
  [-12, 12].forEach((wx) => {
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 12, 70),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.98 }),
    );
    wall.position.set(wx, 6, -18);
    scene.add(wall);
  });
  const spot = new THREE.SpotLight(0xffffff, 2.5, 40, 0.4, 0.6);
  spot.position.set(0, 8, 5);
  spot.target.position.set(0, 0, -20);
  scene.add(spot, spot.target);
  finishChassisOrGoal(scene, challenge, {
    path: 0x0891b2, glow: 0x06b6d4, goal: 0x38bdf8, goalLabel: 'TRENCH EXIT',
  }, -32, 'TRENCH EXIT');
}

export function buildKelpForestArena(scene, challenge) {
  initFamilyScene(scene, [0.55, 0.5, 0.45]);
  _underwaterBase(scene, '#0d9488', '#134e4a', 0x0c4a6e, 0xc4a574);
  for (let i = 0; i < 22; i++) {
    const x = (Math.random() - 0.5) * 38;
    const z = -Math.random() * 34;
    if (Math.abs(x) < 3) continue;
    const h = 3 + Math.random() * 5;
    const kelp = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.15, h, 5),
      new THREE.MeshStandardMaterial({ color: 0x15803d, emissive: 0x22c55e, emissiveIntensity: 0.15, roughness: 0.85 }),
    );
    kelp.position.set(x, h / 2, z);
    kelp.rotation.z = (Math.random() - 0.5) * 0.2;
    scene.add(kelp);
    const ph = Math.random() * Math.PI;
    arenaMover(scene, (t) => { kelp.rotation.z = Math.sin(t * 0.8 + ph) * 0.15; });
  }
  finishChassisOrGoal(scene, challenge, {
    path: 0x22c55e, glow: 0x4ade80, goal: 0x22d3ee, goalLabel: 'KELP CLEARING',
  }, -30, 'KELP CLEARING');
}

export function buildBioluminescentArena(scene, challenge) {
  initFamilyScene(scene, [0.4, 0.35, 0.45]);
  makeSkyGradient(scene, [[0, '#020810'], [0.5, '#0a1830'], [1, '#000510']]);
  scene.fog = new THREE.FogExp2(0x041828, 0.035);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(90, 90),
    new THREE.MeshStandardMaterial({ color: 0x0a1628, roughness: 0.98 }),
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);
  for (let i = 0; i < 16; i++) {
    const x = (Math.random() - 0.5) * 35;
    const z = -Math.random() * 30;
    const orb = new THREE.Mesh(
      new THREE.SphereGeometry(0.2 + Math.random() * 0.25, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x06b6d4, emissiveIntensity: 1.2 }),
    );
    orb.position.set(x, 0.5 + Math.random() * 2, z);
    scene.add(orb);
    arenaMover(scene, (t) => { orb.position.y += Math.sin(t * 2 + i) * 0.002; });
  }
  bubbleParticles(scene, 120, 0x22d3ee);
  scene.add(new THREE.AmbientLight(0x0c4a6e, 0.35));
  finishChassisOrGoal(scene, challenge, {
    path: 0x06b6d4, glow: 0x22d3ee, goal: 0xa855f7, goalLabel: 'GLOW GROTTO',
  }, -28, 'GLOW GROTTO');
}

export function buildShipwreckArena(scene, challenge) {
  initFamilyScene(scene, [0.45, 0.4, 0.35]);
  _underwaterBase(scene, '#0c4a6e', '#164e63', 0x0c4a6e, 0x8a7055);
  const hullMat = new THREE.MeshStandardMaterial({ color: 0x5c4030, roughness: 0.95 });
  for (let i = 0; i < 6; i++) {
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.5, 0.3), hullMat);
    rib.position.set(-2 + i * 0.8, 1.2, -12);
    rib.rotation.z = 0.15;
    scene.add(rib);
  }
  const chest = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.6, 0.5),
    new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xfbbf24, emissiveIntensity: 0.6 }),
  );
  chest.position.set(2, 0.4, -18);
  scene.add(chest);
  finishChassisOrGoal(scene, challenge, {
    path: 0xeab308, glow: 0xfbbf24, goal: 0xffd700, goalLabel: 'WRECK EXIT',
  }, -30, 'WRECK EXIT');
}

// ─── INDUSTRIAL (1B) ───────────────────────────────────────────────────────
export function buildFactoryFloorArena(scene, challenge) {
  initFamilyScene(scene, [0.55, 0.5, 0.65]);
  makeSkyGradient(scene, [[0, '#1a1a28'], [0.5, '#2a2a38'], [1, '#141420']]);
  scene.fog = new THREE.Fog(0x2a2a38, 30, 75);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), concreteFactoryMat());
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  for (let z = 4; z > -40; z -= 10) {
    const strip = new THREE.Mesh(
      new THREE.PlaneGeometry(0.35, 8),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xfbbf24, emissiveIntensity: 0.8 }),
    );
    strip.rotation.x = -Math.PI / 2;
    strip.position.set(0, 0.02, z);
    scene.add(strip);
  }

  [[-10, -8], [10, -20]].forEach(([x, z]) => {
    const conv = new THREE.Group();
    const belt = new THREE.Mesh(
      new THREE.BoxGeometry(6, 0.15, 2),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.4 }),
    );
    belt.position.y = 0.5;
    conv.add(belt);
    const roller = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.25, 2.2, 8),
      new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.6 }),
    );
    roller.rotation.z = Math.PI / 2;
    roller.position.set(-2.8, 0.5, 0);
    conv.add(roller);
    conv.position.set(x, 0, z);
    scene.add(conv);
    arenaMover(scene, (t) => { roller.rotation.x = t * 2; });
  });

  [[-14, 0], [14, -14]].forEach(([x, z]) => {
    addWarehouseShelf(scene, x, z);
  });

  [[-14, 0], [14, -14]].forEach(([x, z]) => {
    const stack = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 1.2, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x1e293b }),
    );
    stack.position.set(x, 0.6, z);
    scene.add(stack);
    const green = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 1 }),
    );
    green.position.set(x, 1.3, z);
    scene.add(green);
  });

  scene.add(new THREE.AmbientLight(0x2a2a38, 0.55));
  for (let z = 0; z > -36; z -= 12) {
    const tube = new THREE.PointLight(0xfff4dd, 0.8, 14);
    tube.position.set(0, 4, z);
    scene.add(tube);
  }
  const sun = new THREE.DirectionalLight(0xffeedd, 0.5);
  sun.position.set(5, 12, 8);
  sun.castShadow = true;
  scene.add(sun);

  finishChassisOrGoal(scene, challenge, {
    path: 0xfbbf24, glow: 0x3b82f6, goal: 0x22c55e, goalLabel: 'FACTORY EXIT',
  }, -32, 'FACTORY EXIT');
}

export function buildWarehouseScenery(scene) {
  initFamilyScene(scene, [0.5, 0.45, 0.5]);
  makeSkyGradient(scene, [[0, '#1a2030'], [1, '#2a3040']]);
  scene.fog = new THREE.Fog(0x2a3040, 28, 70);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(90, 90),
    new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.92 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  [-12, 12].forEach((sx) => {
    const rackMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.3, roughness: 0.55 });
    // Open rack frames read as warehouse shelving; the previous solid
    // 50-metre slab flattened the scene into two grey walls.
    for (let row = 0; row < 4; row++) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.14, 48), rackMat);
      beam.position.set(sx, 0.65 + row * 1.2, -18);
      beam.castShadow = true;
      scene.add(beam);
    }
    for (let z = 5; z >= -41; z -= 8) {
      [-1.75, 1.75].forEach((dx) => {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.16, 5.2, 0.16), rackMat);
        post.position.set(sx + dx, 2.6, z);
        post.castShadow = true;
        scene.add(post);
      });
    }
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 6; col++) {
        const box = new THREE.Mesh(
          new THREE.BoxGeometry(1.25 + (col % 2) * 0.25, 0.72 + (row % 2) * 0.18, 1.35),
          new THREE.MeshStandardMaterial({
            color: (col + row) % 3 === 0 ? 0x2563eb : ((col + row) % 3 === 1 ? 0xd97706 : 0x16a34a),
            roughness: 0.85,
          }),
        );
        box.position.set(sx + (col % 2 ? -0.85 : 0.85), 1.05 + row * 1.2, 1 - col * 7.5);
        box.rotation.y = (col % 3 - 1) * 0.08;
        box.castShadow = true;
        scene.add(box);
      }
    }
  });

  const fork = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.3, 2),
    new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xf59e0b, emissiveIntensity: 0.3 }),
  );
  fork.position.set(4, 0.4, -6);
  scene.add(fork);

  scene.add(new THREE.AmbientLight(0x3a4050, 0.6));
  const sun = new THREE.DirectionalLight(0xffffff, 0.55);
  sun.position.set(5, 12, 8);
  sun.castShadow = true;
  scene.add(sun);
  for (let z = 0; z > -36; z -= 10) {
    const tube = new THREE.PointLight(0xfff4dd, 0.42, 16);
    tube.position.set(0, 5, z);
    scene.add(tube);
  }
}

export function buildWarehouseArena(scene, challenge) {
  buildWarehouseScenery(scene);
  finishChassisOrGoal(scene, challenge, {
    path: 0x94a3b8, glow: 0x64748b, goal: 0x22c55e, goalLabel: 'LOADING BAY',
  }, -34, 'LOADING BAY');
}

export function buildUndergroundMineArena(scene, challenge) {
  initFamilyScene(scene, [0.35, 0.3, 0.4]);
  makeSkyGradient(scene, [[0, '#050308'], [1, '#120818']]);
  scene.fog = new THREE.FogExp2(0x180818, 0.038);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(90, 90),
    new THREE.MeshStandardMaterial({ color: 0x2a1810, roughness: 0.98 }),
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  for (let z = 2; z > -38; z -= 8) {
    const brace = new THREE.Mesh(
      new THREE.BoxGeometry(8, 0.3, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 }),
    );
    brace.position.set(0, 2.8, z);
    scene.add(brace);
    [-3.8, 3.8].forEach((x) => {
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.15, 2.8, 6),
        new THREE.MeshStandardMaterial({ color: 0x92400e }),
      );
      post.position.set(x, 1.4, z);
      scene.add(post);
    });
  }

  for (let z = -4; z > -32; z -= 6) {
    [-1, 1].forEach((rx) => {
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.08, 5),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7 }),
      );
      rail.position.set(rx, 0.05, z);
      scene.add(rail);
    });
  }

  [[-6, -10], [5, -22]].forEach(([x, z]) => {
    const crystal = new THREE.Mesh(
      new THREE.ConeGeometry(0.4, 1.2, 5),
      new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0x7c3aed, emissiveIntensity: 0.8 }),
    );
    crystal.position.set(x, 0.6, z);
    scene.add(crystal);
  });

  scene.add(new THREE.AmbientLight(0x1a0818, 0.35));
  [[-8, -6], [0, -18], [8, -28]].forEach(([x, z]) => {
    const lamp = new THREE.PointLight(0xffaa44, 1.2, 12);
    lamp.position.set(x, 2, z);
    scene.add(lamp);
  });

  finishChassisOrGoal(scene, challenge, {
    path: 0x8855ff, glow: 0xa855f7, goal: 0xffaa44, goalLabel: 'MINE EXIT',
  }, -36, 'MINE EXIT');
}

// ─── SKY AERIAL (1E) — AerialWorldKit ─────────────────────────────────────
export function buildFlightRingsArena(scene, challenge) {
  const arenaType = challenge?.arenaType || scene.userData?.arenaType || 'drone_canyon';
  if (buildAerialWorld(scene, { ...challenge, arenaType })) return;
  console.warn('[FlightRings] aerial build failed, using minimal fallback', arenaType);
}

// ─── CYBER NINJA (1G) ──────────────────────────────────────────────────────
export function buildMuseumHeistArena(scene, challenge) {
  initFamilyScene(scene, [0.25, 0.22, 0.3]);
  makeSkyGradient(scene, [[0, '#0f172a'], [0.5, '#1e293b'], [1, '#0f172a']]);
  scene.fog = new THREE.Fog(0x0f172a, 25, 65);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(70, 70),
    new THREE.MeshStandardMaterial({ color: 0xe8e8f0, roughness: 0.35, metalness: 0.15 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  [-8, 8].forEach((x) => {
    const case_ = new THREE.Mesh(
      new THREE.BoxGeometry(2, 1.2, 1),
      new THREE.MeshStandardMaterial({ color: 0x334155, transparent: true, opacity: 0.6, metalness: 0.5 }),
    );
    case_.position.set(x, 0.6, -10);
    scene.add(case_);
  });

  for (let i = 0; i < 6; i++) {
    const z = -4 - i * 4;
    const laser = new THREE.Mesh(
      new THREE.BoxGeometry(14, 0.04, 0.04),
      new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xff0000, emissiveIntensity: 1.2 }),
    );
    laser.position.set(0, 0.8 + (i % 2) * 0.3, z);
    scene.add(laser);
    arenaMover(scene, (t) => {
      laser.material.emissiveIntensity = 0.7 + Math.sin(t * 4 + i) * 0.5;
    });
  }

  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(3, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xddd6fe, emissive: 0xc4b5fd, emissiveIntensity: 0.4 }),
  );
  moon.position.set(15, 18, -25);
  scene.add(moon);

  const terminal = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1.2, 0.4),
    new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 0.9 }),
  );
  terminal.position.set(0, 0.8, -28);
  scene.add(terminal);

  scene.add(new THREE.AmbientLight(0x1e293b, 0.45));
  const plPink = new THREE.PointLight(0xec4899, 0.8, 20);
  plPink.position.set(-6, 3, -8);
  scene.add(plPink);
  const plCyan = new THREE.PointLight(0x06b6d4, 0.7, 18);
  plCyan.position.set(6, 3, -16);
  scene.add(plCyan);

  finishChassisOrGoal(scene, challenge, {
    path: 0xec4899, glow: 0x06b6d4, goal: 0x22c55e, goalLabel: 'VAULT TERMINAL',
  }, -30, 'VAULT TERMINAL');
}

// ─── SPIDER CLIMBER (1H) ───────────────────────────────────────────────────
export function buildSpiderRescueArena(scene, challenge) {
  initFamilyScene(scene, [0.45, 0.4, 0.35]);
  makeSkyGradient(scene, [[0, '#111827'], [0.5, '#1f2937'], [1, '#111827']]);
  scene.fog = new THREE.FogExp2(0x111827, 0.028);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 1 }),
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const shaftMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.85, metalness: 0.35 });
  for (let i = 0; i < 8; i++) {
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.65, 8, 10), shaftMat);
    pipe.position.set((Math.random() - 0.5) * 20, 4, -8 - i * 4);
    scene.add(pipe);
  }

  const webMat = new THREE.MeshStandardMaterial({
    color: 0xffffff, emissive: 0xe2e8f0, emissiveIntensity: 0.25, transparent: true, opacity: 0.35,
  });
  const web = new THREE.Mesh(new THREE.PlaneGeometry(12, 16), webMat);
  web.position.set(0, 6, -20);
  scene.add(web);

  [[-6, -8], [5, -16], [0, -24]].forEach(([x, z]) => {
    const light = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 0.1, 8),
      new THREE.MeshStandardMaterial({ color: 0xff4400, emissive: 0xff4400, emissiveIntensity: 1 }),
    );
    light.position.set(x, 0.1, z);
    scene.add(light);
    const pl = new THREE.PointLight(0xff4400, 1.2, 8);
    pl.position.set(x, 1, z);
    scene.add(pl);
  });

  scene.add(new THREE.AmbientLight(0x334455, 0.45));
  emergencyLights(scene, [[-10, 6, 0], [10, 6, 0]]);

  finishChassisOrGoal(scene, challenge, {
    path: 0x10b981, glow: 0x34d399, goal: 0x22c55e, goalLabel: 'SHAFT TOP',
  }, -28, 'SHAFT TOP');
}

export function buildTempleClimbArena(scene, challenge) {
  initFamilyScene(scene, [0.6, 0.55, 0.5]);
  makeSkyGradient(scene, [[0, '#1a4020'], [0.5, '#3a6830'], [1, '#0a1808']]);
  scene.fog = new THREE.FogExp2(0x142810, 0.022);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(70, 70),
    new THREE.MeshStandardMaterial({ color: 0x8a7060, roughness: 0.92 }),
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  for (let i = 0; i < 10; i++) {
    const block = new THREE.Mesh(
      new THREE.BoxGeometry(2 + Math.random(), 0.8, 2 + Math.random()),
      new THREE.MeshStandardMaterial({ color: 0x9e8060, roughness: 0.88 }),
    );
    block.position.set((Math.random() - 0.5) * 24, 0.4, -6 - i * 3);
    scene.add(block);
  }

  for (let i = 0; i < 6; i++) {
    const vine = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.08, 3 + Math.random() * 2, 5),
      new THREE.MeshStandardMaterial({ color: 0x228833, roughness: 0.9 }),
    );
    vine.position.set(-10 + i * 4, 2, -12 - i * 2);
    vine.rotation.z = 0.3;
    scene.add(vine);
  }

  [[-8, -10], [6, -22]].forEach(([x, z]) => {
    const torch = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.6, 6),
      new THREE.MeshStandardMaterial({ color: 0x5c4030 }),
    );
    torch.position.set(x, 1.2, z);
    scene.add(torch);
    const flame = new THREE.PointLight(0xff8800, 1, 8);
    flame.position.set(x, 1.5, z);
    scene.add(flame);
  });

  scene.add(new THREE.AmbientLight(0x1a3010, 0.5));
  scene.add(new THREE.DirectionalLight(0xff8f00, 0.7));

  finishChassisOrGoal(scene, challenge, {
    path: 0xfbbf24, glow: 0xff8800, goal: 0xffd700, goalLabel: 'TEMPLE GATE',
  }, -30, 'TEMPLE GATE');
}

// ─── SANDBOX LAB (1K) ──────────────────────────────────────────────────────
export function buildSandboxLabArena(scene, challenge) {
  initFamilyScene(scene, [1.0, 0.95, 0.85]);
  makeSkyGradient(scene, [[0, '#f8fafc'], [1, '#e2e8f0']]);
  scene.fog = new THREE.Fog(0xe8ecf0, 40, 90);

  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(0, 0, 128, 128);
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 128; i += 16) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 128);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(128, i);
    ctx.stroke();
  }
  const gridTex = new THREE.CanvasTexture(c);
  gridTex.wrapS = gridTex.wrapT = THREE.RepeatWrapping;
  gridTex.repeat.set(12, 12);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 80),
    new THREE.MeshStandardMaterial({ map: gridTex, color: 0xffffff, roughness: 0.9 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const zoneCols = [0xef4444, 0x3b82f6, 0x22c55e, 0xfbbf24];
  zoneCols.forEach((col, i) => {
    const zone = new THREE.Mesh(
      new THREE.PlaneGeometry(4, 4),
      new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.25, transparent: true, opacity: 0.35 }),
    );
    zone.rotation.x = -Math.PI / 2;
    zone.position.set(-12 + i * 8, 0.01, -8);
    scene.add(zone);
  });

  [[-6, -18], [6, -26]].forEach(([x, z], i) => {
    const flag = new THREE.Group();
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 2, 6),
      new THREE.MeshStandardMaterial({ color: 0x64748b }),
    );
    pole.position.y = 1;
    flag.add(pole);
    const banner = new THREE.Mesh(
      new THREE.PlaneGeometry(0.8, 0.5),
      new THREE.MeshStandardMaterial({ color: zoneCols[i % 4], emissive: zoneCols[i % 4], emissiveIntensity: 0.5 }),
    );
    banner.position.set(0.4, 1.6, 0);
    flag.add(banner);
    flag.position.set(x, 0, z);
    scene.add(flag);
  });

  [-20, 20].forEach((x) => {
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 3, 60),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0 }),
    );
    wall.position.set(x, 1.5, -18);
    scene.add(wall);
  });

  scene.add(new THREE.AmbientLight(0xffffff, 0.85));
  scene.add(new THREE.DirectionalLight(0xffffff, 0.6));

  finishChassisOrGoal(scene, challenge, {
    path: 0x94a3b8, glow: 0x64748b, goal: 0x3b82f6, goalLabel: 'TEST COMPLETE',
  }, -32, 'TEST COMPLETE');
}

// ─── CYBER / NEON CITY (1G extended) ───────────────────────────────────────
export function buildCyberCityArena(scene, challenge) {
  initFamilyScene(scene, [0.35, 0.3, 0.4]);
  makeSkyGradient(scene, [[0, '#0a0a18'], [0.4, '#1a1040'], [0.7, '#0f172a'], [1, '#020617']]);
  scene.fog = new THREE.Fog(0x0f172a, 28, 70);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(90, 90),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85, metalness: 0.25 }),
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  for (let z = 6; z > -42; z -= 8) {
    const strip = new THREE.Mesh(
      new THREE.PlaneGeometry(0.25, 6),
      new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 1.1 }),
    );
    strip.rotation.x = -Math.PI / 2;
    strip.position.set(0, 0.02, z);
    scene.add(strip);
  }

  [-14, 14].forEach((bx) => {
    for (let i = 0; i < 5; i++) {
      const h = 6 + Math.random() * 14;
      const bld = new THREE.Mesh(
        new THREE.BoxGeometry(4 + Math.random() * 3, h, 4 + Math.random() * 2),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 }),
      );
      bld.position.set(bx + (Math.random() - 0.5) * 4, h / 2, -6 - i * 7);
      scene.add(bld);
      const win = new THREE.Mesh(
        new THREE.PlaneGeometry(1.2, 0.8),
        new THREE.MeshStandardMaterial({
          color: 0xec4899, emissive: 0xec4899, emissiveIntensity: 0.7, transparent: true, opacity: 0.85,
        }),
      );
      win.position.set(bld.position.x, h * 0.6, bld.position.z + 2);
      scene.add(win);
    }
  });

  [[-6, -10], [5, -22], [0, -32]].forEach(([x, z], i) => {
    const sign = new THREE.Mesh(
      new THREE.BoxGeometry(3, 1.2, 0.15),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xfbbf24, emissiveIntensity: 1 }),
    );
    sign.position.set(x, 3, z);
    scene.add(sign);
    const pl = new THREE.PointLight(i % 2 === 0 ? 0x06b6d4 : 0xec4899, 1.2, 14);
    pl.position.set(x, 2, z);
    scene.add(pl);
  });

  scene.add(new THREE.AmbientLight(0x1e293b, 0.45));
  finishChassisOrGoal(scene, challenge, {
    path: 0x06b6d4, glow: 0xec4899, goal: 0xfbbf24, goalLabel: 'NEON GATE',
  }, -36, 'NEON GATE');
}

export function buildShadowEscapeArena(scene, challenge) {
  initFamilyScene(scene, [0.2, 0.18, 0.22]);
  makeSkyGradient(scene, [[0, '#020617'], [0.5, '#0f172a'], [1, '#000000']]);
  scene.fog = new THREE.FogExp2(0x020617, 0.04);

  const roof = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 80),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.95 }),
  );
  roof.rotation.x = -Math.PI / 2;
  roof.position.y = 0.02;
  scene.add(roof);

  for (let i = 0; i < 12; i++) {
    const ledge = new THREE.Mesh(
      new THREE.BoxGeometry(3 + Math.random() * 4, 0.4, 2),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 }),
    );
    ledge.position.set((Math.random() - 0.5) * 28, 0.2, -4 - i * 3);
    scene.add(ledge);
  }

  [[-8, -14], [7, -26]].forEach(([x, z]) => {
    const vent = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 0.3, 8),
      new THREE.MeshStandardMaterial({ color: 0x64748b, emissive: 0x94a3b8, emissiveIntensity: 0.4 }),
    );
    vent.position.set(x, 0.2, z);
    scene.add(vent);
    const steam = new THREE.PointLight(0x94a3b8, 0.6, 6);
    steam.position.set(x, 1, z);
    scene.add(steam);
  });

  scene.add(new THREE.AmbientLight(0x0f172a, 0.35));
  const moon = new THREE.DirectionalLight(0x94a3b8, 0.25);
  moon.position.set(10, 15, -5);
  scene.add(moon);

  finishChassisOrGoal(scene, challenge, {
    path: 0x475569, glow: 0x64748b, goal: 0x22d3ee, goalLabel: 'ROOFTOP EXIT',
  }, -34, 'ROOFTOP EXIT');
}

// ─── DESERT RALLY (1A desert) ──────────────────────────────────────────────
export function buildDesertRallyArena(scene, challenge) {
  initFamilyScene(scene, [0.9, 0.85, 0.75]);
  makeSkyGradient(scene, [[0, '#fbbf24'], [0.45, '#f59e0b'], [0.75, '#d97706'], [1, '#92400e']]);
  scene.fog = new THREE.Fog(0xd4a050, 35, 80);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshStandardMaterial({ color: 0xe8b060, roughness: 0.98 }),
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  for (let i = 0; i < 10; i++) {
    const dune = new THREE.Mesh(
      new THREE.SphereGeometry(2 + Math.random() * 3, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0xd4a050, roughness: 0.95 }),
    );
    dune.position.set((Math.random() - 0.5) * 40, 0, -Math.random() * 35);
    scene.add(dune);
  }

  [[-12, -8], [10, -18], [-6, -28]].forEach(([x, z]) => {
    const arch = new THREE.Group();
    const col = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.5, 3, 6),
      new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.9 }),
    );
    col.position.set(-1.5, 1.5, 0);
    arch.add(col);
    const col2 = col.clone();
    col2.position.x = 1.5;
    arch.add(col2);
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(3.5, 0.5, 0.8),
      new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.9 }),
    );
    top.position.y = 3;
    arch.add(top);
    arch.position.set(x, 0, z);
    scene.add(arch);
  });

  dustParticles(scene, 220, 0xd4a050);
  scene.add(new THREE.AmbientLight(0xfbbf24, 0.45));
  const sun = new THREE.DirectionalLight(0xfff0c0, 1.2);
  sun.position.set(8, 20, 6);
  scene.add(sun);

  finishChassisOrGoal(scene, challenge, {
    path: 0xd97706, glow: 0xfbbf24, goal: 0x22c55e, goalLabel: 'OASIS FLAG',
  }, -32, 'OASIS FLAG');
}

// ─── WARP / COSMIC (1F hybrid) ─────────────────────────────────────────────
export function buildWarpGateArena(scene, challenge) {
  initFamilyScene(scene, [0.5, 0.45, 0.55]);
  makeSkyGradient(scene, [[0, '#020617'], [0.35, '#1e1b4b'], [0.65, '#4c1d95'], [1, '#020617']]);
  scene.fog = new THREE.FogExp2(0x1e1b4b, 0.018);

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(90, 90),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9, metalness: 0.3 }),
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  for (let i = 0; i < 40; i++) {
    const star = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 4, 4),
      new THREE.MeshBasicMaterial({ color: 0xffffff }),
    );
    star.position.set((Math.random() - 0.5) * 60, 8 + Math.random() * 20, -Math.random() * 50);
    scene.add(star);
  }

  for (let i = 0; i < 4; i++) {
    const gate = new THREE.Mesh(
      new THREE.TorusGeometry(3.5, 0.18, 10, 32),
      new THREE.MeshStandardMaterial({
        color: 0xa855f7, emissive: 0x7c3aed, emissiveIntensity: 1.5, metalness: 0.8,
      }),
    );
    gate.position.set((i % 2) * 10 - 5, 3 + i * 0.5, -8 - i * 8);
    gate.rotation.y = Math.PI / 2;
    scene.add(gate);
    arenaMover(scene, (t) => { gate.rotation.z = t * 0.6 + i; });
    const pl = new THREE.PointLight(0xa855f7, 1.5, 16);
    pl.position.copy(gate.position);
    scene.add(pl);
  }

  const tunnel = new THREE.Mesh(
    new THREE.CylinderGeometry(4, 4, 24, 16, 1, true),
    new THREE.MeshStandardMaterial({
      color: 0x06b6d4, emissive: 0x06b6d4, emissiveIntensity: 0.35,
      transparent: true, opacity: 0.25, side: THREE.DoubleSide,
    }),
  );
  tunnel.rotation.x = Math.PI / 2;
  tunnel.position.set(0, 2, -22);
  scene.add(tunnel);

  scene.add(new THREE.AmbientLight(0x1e1b4b, 0.5));
  finishChassisOrGoal(scene, challenge, {
    path: 0x7c3aed, glow: 0x06b6d4, goal: 0xa855f7, goalLabel: 'WARP CORE',
  }, -38, 'WARP CORE');
}

// ─── UNDERWATER variants (1C extended) ─────────────────────────────────────
export function buildAtlantisArena(scene, challenge) {
  initFamilyScene(scene, [0.55, 0.5, 0.45]);
  _underwaterBase(scene, '#0e7490', '#22d3ee', 0x0c4a6e, 0xc4a574);
  for (let i = 0; i < 6; i++) {
    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.8, 4 + Math.random() * 2, 8),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, emissive: 0x22d3ee, emissiveIntensity: 0.2, roughness: 0.6 }),
    );
    pillar.position.set(-8 + i * 3, 2, -10 - i * 2);
    scene.add(pillar);
  }
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(5, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({
      color: 0x22d3ee, emissive: 0x06b6d4, emissiveIntensity: 0.25, transparent: true, opacity: 0.35,
    }),
  );
  dome.position.set(0, 0, -24);
  scene.add(dome);
  finishChassisOrGoal(scene, challenge, {
    path: 0x0891b2, glow: 0x22d3ee, goal: 0xfbbf24, goalLabel: 'ATLANTIS THRONE',
  }, -32, 'ATLANTIS THRONE');
}

export function buildTsunamiArena(scene, challenge) {
  initFamilyScene(scene, [0.65, 0.6, 0.55]);
  makeSkyGradient(scene, [[0, '#1e3a5f'], [0.4, '#0c4a6e'], [0.7, '#164e63'], [1, '#041828']]);
  scene.fog = new THREE.Fog(0x0c4a6e, 25, 60);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(90, 90),
    new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.4, metalness: 0.15 }),
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);
  for (let i = 0; i < 5; i++) {
    const wave = new THREE.Mesh(
      new THREE.BoxGeometry(40, 1.2 + i * 0.3, 3),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0ea5e9, emissiveIntensity: 0.3, transparent: true, opacity: 0.6 }),
    );
    wave.position.set(0, 0.6, -6 - i * 6);
    scene.add(wave);
    const ph = i * 1.2;
    arenaMover(scene, (t) => { wave.position.y = 0.5 + Math.sin(t * 1.5 + ph) * 0.4; });
  }
  bubbleParticles(scene, 200, 0x7dd3fc);
  scene.add(new THREE.AmbientLight(0x0c4a6e, 0.55));
  finishChassisOrGoal(scene, challenge, {
    path: 0x0ea5e9, glow: 0x38bdf8, goal: 0x22d3ee, goalLabel: 'SAFE HARBOR',
  }, -30, 'SAFE HARBOR');
}

export function buildMarianaArena(scene, challenge) {
  initFamilyScene(scene, [0.25, 0.22, 0.28]);
  makeSkyGradient(scene, [[0, '#000510'], [0.5, '#020810'], [1, '#000000']]);
  scene.fog = new THREE.FogExp2(0x000510, 0.045);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(90, 90),
    new THREE.MeshStandardMaterial({ color: 0x0a0f18, roughness: 0.99 }),
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);
  for (let i = 0; i < 8; i++) {
    const crevice = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 8, 12),
      new THREE.MeshStandardMaterial({ color: 0x020617, roughness: 1 }),
    );
    crevice.position.set((Math.random() - 0.5) * 30, 4, -8 - i * 4);
    crevice.rotation.z = (Math.random() - 0.5) * 0.15;
    scene.add(crevice);
  }
  const probe = new THREE.PointLight(0xffffff, 2, 18);
  probe.position.set(0, 6, -5);
  scene.add(probe);
  scene.add(new THREE.AmbientLight(0x0f172a, 0.2));
  finishChassisOrGoal(scene, challenge, {
    path: 0x1e293b, glow: 0x475569, goal: 0x38bdf8, goalLabel: 'ABYSS MARKER',
  }, -34, 'ABYSS MARKER');
}

export function buildHydrothermalArena(scene, challenge) {
  initFamilyScene(scene, [0.45, 0.4, 0.38]);
  _underwaterBase(scene, '#134e4a', '#0f766e', 0x0c4a6e, 0x4a5568);
  for (let i = 0; i < 8; i++) {
    const vent = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.7, 1.5, 8),
      new THREE.MeshStandardMaterial({ color: 0x57534e, roughness: 0.95 }),
    );
    vent.position.set((Math.random() - 0.5) * 28, 0.75, -6 - i * 3.5);
    scene.add(vent);
    const plume = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.8, 3, 6, 1, true),
      new THREE.MeshStandardMaterial({
        color: 0xfbbf24, emissive: 0xf59e0b, emissiveIntensity: 0.6, transparent: true, opacity: 0.35,
      }),
    );
    plume.position.set(vent.position.x, 2.5, vent.position.z);
    scene.add(plume);
    arenaMover(scene, (t) => {
      plume.scale.y = 0.8 + Math.sin(t * 2 + i) * 0.3;
      plume.material.opacity = 0.25 + Math.sin(t * 3 + i) * 0.1;
    });
  }
  emberParticles(scene, 80, 0xfbbf24);
  finishChassisOrGoal(scene, challenge, {
    path: 0x0d9488, glow: 0xfbbf24, goal: 0x22d3ee, goalLabel: 'VENT FIELD',
  }, -30, 'VENT FIELD');
}

export function buildArcticDiveArena(scene, challenge) {
  initFamilyScene(scene, [0.7, 0.65, 0.6]);
  _underwaterBase(scene, '#0c4a6e', '#e0f2fe', 0xb8d4e8, 0xd8e8f0);
  for (let i = 0; i < 10; i++) {
    const berg = new THREE.Mesh(
      new THREE.ConeGeometry(1.5 + Math.random(), 3 + Math.random() * 2, 6),
      new THREE.MeshStandardMaterial({ color: 0xe0f2fe, emissive: 0x7dd3fc, emissiveIntensity: 0.15, roughness: 0.5 }),
    );
    berg.position.set((Math.random() - 0.5) * 32, 1.5, -Math.random() * 30);
    scene.add(berg);
  }
  snowParticles(scene, 120, 0xe0f2fe);
  finishChassisOrGoal(scene, challenge, {
    path: 0x7dd3fc, glow: 0xe0f2fe, goal: 0x38bdf8, goalLabel: 'ICE SHELF',
  }, -28, 'ICE SHELF');
}

export function buildSubCanyonArena(scene, challenge) {
  initFamilyScene(scene, [0.4, 0.38, 0.35]);
  _underwaterBase(scene, '#164e63', '#0c4a6e', 0x0c4a6e, 0x6b7280);
  [-10, 10].forEach((wx) => {
    const cliff = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 14, 60),
      new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.95 }),
    );
    cliff.position.set(wx, 7, -18);
    scene.add(cliff);
  });
  finishChassisOrGoal(scene, challenge, {
    path: 0x475569, glow: 0x64748b, goal: 0x22d3ee, goalLabel: 'CANYON END',
  }, -32, 'CANYON END');
}

export function buildOceanCurrentArena(scene, challenge) {
  initFamilyScene(scene, [0.55, 0.5, 0.48]);
  _underwaterBase(scene, '#0369a1', '#0ea5e9', 0x0c4a6e, 0x1e40af);
  for (let i = 0; i < 6; i++) {
    const stream = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 20),
      new THREE.MeshStandardMaterial({
        color: 0x38bdf8, emissive: 0x0ea5e9, emissiveIntensity: 0.35, transparent: true, opacity: 0.25, side: THREE.DoubleSide,
      }),
    );
    stream.rotation.x = -Math.PI / 2;
    stream.rotation.z = 0.2;
    stream.position.set((i % 2) * 8 - 4, 0.15, -8 - i * 5);
    scene.add(stream);
    arenaMover(scene, (t) => { stream.position.z -= 0.02; if (stream.position.z < -35) stream.position.z = -8; });
  }
  finishChassisOrGoal(scene, challenge, {
    path: 0x0ea5e9, glow: 0x38bdf8, goal: 0x22d3ee, goalLabel: 'CURRENT OUT',
  }, -30, 'CURRENT OUT');
}
