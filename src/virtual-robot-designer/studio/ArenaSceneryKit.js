/**
 * ArenaSceneryKit — Rich procedural props + route dressing for non-racing / non-football arenas.
 * Kid-readable silhouettes, emissive goals, horizon depth — not grey void + boxes.
 */
import * as THREE from 'three';
import { arenaMover } from './ArenaBuilderCore.js';

function mat(col, emissive = 0, ei = 0, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color: col,
    emissive: emissive || col,
    emissiveIntensity: ei,
    roughness: opts.roughness ?? 0.85,
    metalness: opts.metalness ?? 0.1,
    ...opts,
  });
}

/** Billboard sign with mission text — readable at tablet distance */
export function addMissionSign(scene, x, y, z, title, subtitle, accent = 0x38bdf8) {
  const cnv = document.createElement('canvas');
  cnv.width = 512;
  cnv.height = 192;
  const ctx = cnv.getContext('2d');
  ctx.fillStyle = 'rgba(15,23,42,0.92)';
  ctx.roundRect(8, 8, 496, 176, 14);
  ctx.fill();
  ctx.strokeStyle = `#${accent.toString(16).padStart(6, '0')}`;
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 26px system-ui,sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title.slice(0, 28), 256, 52);
  ctx.font = '18px system-ui,sans-serif';
  ctx.fillStyle = '#cbd5e1';
  const words = (subtitle || '').slice(0, 72);
  ctx.fillText(words, 256, 92);
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 16px system-ui,sans-serif';
  ctx.fillText('▶ PRESS SIMULATE', 256, 148);
  const tex = new THREE.CanvasTexture(cnv);
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(5.5, 2.1),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }),
  );
  sign.position.set(x, y, z);
  scene.add(sign);
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.1, y, 6),
    mat(0x64748b, 0, 0, { metalness: 0.5 }),
  );
  pole.position.set(x, y / 2, z);
  scene.add(pole);
  return sign;
}

export function addConveyor(scene, x, z, len = 6) {
  const g = new THREE.Group();
  const belt = new THREE.Mesh(new THREE.BoxGeometry(len, 0.18, 1.8), mat(0x1e293b, 0, 0, { metalness: 0.45 }));
  belt.position.y = 0.55;
  g.add(belt);
  for (let i = -len / 2 + 0.5; i < len / 2; i += 1.2) {
    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.02, 1.6),
      mat(0xfbbf24, 0xfbbf24, 0.35),
    );
    stripe.position.set(i, 0.66, 0);
    g.add(stripe);
  }
  const roller = new THREE.Mesh(
    new THREE.CylinderGeometry(0.28, 0.28, 2, 10),
    mat(0x64748b, 0, 0, { metalness: 0.65 }),
  );
  roller.rotation.z = Math.PI / 2;
  roller.position.set(-len / 2 + 0.3, 0.55, 0);
  g.add(roller);
  g.position.set(x, 0, z);
  scene.add(g);
  arenaMover(scene, (t) => { roller.rotation.x = t * 2.5; });
  return g;
}

export function addCoralCluster(scene, x, z) {
  const g = new THREE.Group();
  const colors = [0xf472b6, 0x22d3ee, 0xa855f7, 0xfb7185];
  for (let i = 0; i < 5; i++) {
    const h = 0.6 + Math.random() * 1.4;
    const branch = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.18, h, 6),
      mat(colors[i % colors.length], colors[i % colors.length], 0.35),
    );
    branch.position.set((Math.random() - 0.5) * 1.2, h / 2, (Math.random() - 0.5) * 1.2);
    branch.rotation.z = (Math.random() - 0.5) * 0.4;
    g.add(branch);
  }
  g.position.set(x, 0, z);
  scene.add(g);
}

export function addCrystalFormation(scene, x, z, col = 0xa855f7) {
  for (let i = 0; i < 4; i++) {
    const h = 1 + Math.random() * 2.2;
    const cry = new THREE.Mesh(
      new THREE.ConeGeometry(0.25 + Math.random() * 0.2, h, 5),
      mat(col, col, 0.55, { roughness: 0.3 }),
    );
    cry.position.set(x + (Math.random() - 0.5) * 1.5, h / 2, z + (Math.random() - 0.5) * 1.5);
    cry.rotation.y = Math.random() * Math.PI;
    scene.add(cry);
  }
}

export function addTree(scene, x, z, scale = 1) {
  const h = (3.5 + Math.random() * 3) * scale;
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22 * scale, 0.35 * scale, h, 7),
    mat(0x5c4030),
  );
  trunk.position.set(x, h / 2, z);
  trunk.castShadow = true;
  scene.add(trunk);
  const crown = new THREE.Mesh(
    new THREE.SphereGeometry((1.6 + Math.random()) * scale, 8, 6),
    mat(0x2d8a3e, 0x22c55e, 0.08),
  );
  crown.position.set(x, h + 1.1 * scale, z);
  scene.add(crown);
}

export function addMartianRock(scene, x, z) {
  const rock = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.8 + Math.random() * 1.2, 0),
    mat(0x8b4513, 0, 0),
  );
  rock.position.set(x, 0.5, z);
  rock.rotation.set(Math.random(), Math.random(), Math.random());
  rock.castShadow = true;
  scene.add(rock);
}

export function addNeonRingGate(scene, x, y, z, col = 0x06b6d4) {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.4, 0.18, 10, 28),
    mat(col, col, 1.1, { roughness: 0.35 }),
  );
  ring.position.set(x, y, z);
  scene.add(ring);
  arenaMover(scene, (t) => {
    ring.material.emissiveIntensity = 0.8 + Math.sin(t * 3) * 0.35;
    ring.rotation.y = t * 0.2;
  });
}

export function addWarehouseShelf(scene, x, z) {
  const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.45, 4.5, 8), mat(0x64748b, 0, 0, { metalness: 0.35 }));
  shelf.position.set(x, 2.25, z);
  scene.add(shelf);
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 2; col++) {
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(1.1, 0.75, 0.9),
        mat([0xd97706, 0x3b82f6, 0x22c55e][(row + col) % 3]),
      );
      box.position.set(x + (col - 0.5) * 1.3, 0.6 + row * 1.2, z - 2 + row * 1.5);
      box.castShadow = true;
      scene.add(box);
    }
  }
}

export function addLaserGridPair(scene, x, z, span = 4) {
  for (let i = 0; i < 5; i++) {
    const beam = new THREE.Mesh(
      new THREE.BoxGeometry(span, 0.04, 0.04),
      mat(0xef4444, 0xff0000, 1.2),
    );
    beam.position.set(x, 0.6 + i * 0.35, z);
    scene.add(beam);
    arenaMover(scene, (t) => {
      beam.material.emissiveIntensity = 0.7 + Math.sin(t * 4 + i) * 0.4;
    });
  }
}

export function addHorizonSilhouette(scene, family) {
  const g = new THREE.Group();
  g.name = 'HorizonSilhouette';
  const configs = {
    martian: { col: 0x5c2810, count: 12, h: [3, 8], w: [2, 5], y: 0 },
    martian_dirt: { col: 0x5c2810, count: 8, h: [4, 10], w: [3, 6], y: 0 },
    lunar_grey: { col: 0x374151, count: 6, h: [2, 5], w: [2, 4], y: 0 },
    mine_tunnel: { col: 0x292524, count: 6, h: [8, 14], w: [2, 4], y: 0 },
    asphalt_lot: { col: 0x1e293b, count: 8, h: [5, 12], w: [2, 5], y: 0 },
    farm_field: { col: 0x166534, count: 6, h: [3, 7], w: [2, 5], y: 0 },
    factory_floor: { col: 0x334155, count: 8, h: [8, 16], w: [3, 6], y: 0 },
    lab_grid: { col: 0xcbd5e1, count: 4, h: [3, 6], w: [2, 4], y: 0 },
    stud_mat: { col: 0xfbbf24, count: 5, h: [4, 8], w: [2, 4], y: 0 },
    gym_mats: { col: 0x6366f1, count: 4, h: [4, 8], w: [2, 4], y: 0 },
    scrap_yard: { col: 0x44403c, count: 8, h: [6, 14], w: [2, 6], y: 0 },
    climb_shaft: { col: 0x292524, count: 6, h: [10, 20], w: [1, 3], y: 0 },
    rooftop_tar: { col: 0x0f172a, count: 12, h: [8, 22], w: [2, 5], y: 0 },
    temple_tiles: { col: 0x7f1d1d, count: 4, h: [6, 12], w: [2, 4], y: 0 },
    sandy_seabed: { col: 0x0e7490, count: 6, h: [3, 8], w: [2, 4], y: -1 },
    abyss_rock: { col: 0x0f172a, count: 6, h: [6, 14], w: [2, 4], y: -1 },
    rubble_street: { col: 0x292524, count: 8, h: [5, 14], w: [2, 6], y: 0 },
    hospital_tile: { col: 0x94a3b8, count: 4, h: [4, 8], w: [2, 4], y: 0 },
    wet_street: { col: 0x1f2937, count: 10, h: [8, 18], w: [2, 5], y: 0 },
    desert_sand: { col: 0x92400e, count: 6, h: [3, 8], w: [3, 6], y: 0 },
    industrial: { col: 0x1e293b, count: 10, h: [6, 14], w: [3, 7], y: 0 },
    underwater: { col: 0x0c4a6e, count: 8, h: [4, 10], w: [2, 4], y: -1 },
    emergency: { col: 0x292524, count: 8, h: [5, 12], w: [2, 6], y: 0 },
    sky_aerial: { col: 0x1e3a5f, count: 14, h: [8, 22], w: [2, 5], y: 0 },
    cyber_ninja: { col: 0x0f172a, count: 16, h: [10, 24], w: [2, 4], y: 0 },
    spider_climber: { col: 0x292524, count: 6, h: [8, 16], w: [1, 3], y: 0 },
    sandbox: { col: 0xcbd5e1, count: 4, h: [2, 4], w: [2, 4], y: 0 },
  };
  const cfg = configs[family] || configs.industrial;
  for (let i = 0; i < cfg.count; i++) {
    const h = cfg.h[0] + Math.random() * (cfg.h[1] - cfg.h[0]);
    const w = cfg.w[0] + Math.random() * (cfg.w[1] - cfg.w[0]);
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 1.2), mat(cfg.col));
    const angle = (i / cfg.count) * Math.PI * 2;
    const r = 38 + Math.random() * 8;
    b.position.set(Math.cos(angle) * r, h / 2 + cfg.y, Math.sin(angle) * r - 18);
    b.lookAt(0, h / 2, 0);
    g.add(b);
    if (family === 'cyber_ninja' && i % 2 === 0) {
      const sign = new THREE.Mesh(
        new THREE.PlaneGeometry(w * 0.8, 0.5),
        mat(i % 4 ? 0xec4899 : 0x06b6d4, i % 4 ? 0xec4899 : 0x06b6d4, 0.9),
      );
      sign.position.set(b.position.x, h * 0.7, b.position.z);
      sign.lookAt(0, h * 0.7, 4);
      g.add(sign);
    }
  }
  scene.add(g);
}

/** Place readable scenery along both sides of a chassis route curve */
export function dressRouteCorridor(scene, curve, family = 'industrial') {
  if (!curve) return;
  // Kid-clarity missions use one landmark + simple path — corridor scatter reads as clutter.
  if (scene.userData.kidClarity || scene.userData.skipMissionScatter) return;
  const placements = {
    martian: (x, z, t) => {
      if (t % 0.22 < 0.11) addMartianRock(scene, x, z);
      else if (Math.abs(x) > 5) {
        const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.5), mat(0x1e40af, 0x3b82f6, 0.2));
        flag.position.set(x, 1.8, z);
        scene.add(flag);
      }
    },
    industrial: (x, z, t) => {
      if (t % 0.28 < 0.08 && Math.abs(x) > 6) addConveyor(scene, x, z, 4);
      else if (t % 0.2 < 0.05) {
        const light = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), mat(0xfbbf24, 0xfbbf24, 1));
        light.position.set(x, 3.2, z);
        scene.add(light);
      }
    },
    underwater: (x, z) => {
      if (Math.random() > 0.5) addCoralCluster(scene, x, z);
      else addCrystalFormation(scene, x, z, 0x22d3ee);
    },
    emergency: (x, z, t) => {
      if (t % 0.25 < 0.08) {
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.7, 6), mat(0xf97316, 0xf97316, 0.4));
        cone.position.set(x, 0.35, z);
        scene.add(cone);
      }
    },
    sky_aerial: (x, z, t) => {
      if (t % 0.18 < 0.06) addNeonRingGate(scene, x, 3.5 + (t % 0.1) * 20, z);
    },
    cyber_ninja: (x, z, t) => {
      if (t % 0.3 < 0.05 && Math.abs(x) < 8) addLaserGridPair(scene, x, z, 3);
    },
    spider_climber: (x, z) => {
      const pipe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 5, 8),
        mat(0x78716c, 0, 0, { metalness: 0.5 }),
      );
      pipe.position.set(x, 2.5, z);
      scene.add(pipe);
    },
    sandbox: (x, z, t) => {
      const tile = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.08, 1.2),
        mat([0xef4444, 0x3b82f6, 0x22c55e, 0xfbbf24][Math.floor(t * 20) % 4], 0, 0),
      );
      tile.position.set(x, 0.04, z);
      scene.add(tile);
    },
  };
  const place = placements[family] || placements.industrial;
  const steps = 40;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const p = curve.getPoint(t);
    const tan = curve.getTangent(t).normalize();
    const perpX = -tan.z;
    const perpZ = tan.x;
    [-7.5, -5.5, 5.5, 7.5].forEach((side, si) => {
      const x = p.x + perpX * side;
      const z = p.z + perpZ * side;
      if (Math.abs(x) < 2.2 && z > 2) return;
      place(x, z, t + si * 0.03);
    });
  }
  addHorizonSilhouette(scene, family);
}

/** Brown murky mud pool — crawler swamp modes */
export function addMudPuddle(scene, x, z, radius = 1.4) {
  const pool = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius * 1.05, 0.08, 14),
    mat(0x5c4030, 0x3d2817, 0.15, { roughness: 0.95 }),
  );
  pool.position.set(x, 0.04, z);
  scene.add(pool);
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(radius, 0.12, 6, 20),
    mat(0x6b4423, 0, 0, { roughness: 1 }),
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.set(x, 0.06, z);
  scene.add(rim);
  arenaMover(scene, (t) => {
    pool.material.emissiveIntensity = 0.1 + Math.sin(t * 1.5 + x) * 0.05;
  });
}

/** Narrow log bridge over stream — crawler mode 3 */
export function addLogBridge(scene, x, z, len = 12) {
  const log = new THREE.Mesh(
    new THREE.CylinderGeometry(0.45, 0.5, len, 10),
    mat(0x5c4030, 0, 0, { roughness: 0.95 }),
  );
  log.rotation.z = Math.PI / 2;
  log.position.set(x, 0.55, z);
  log.castShadow = true;
  scene.add(log);
  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(len + 4, 6),
    mat(0x0ea5e9, 0x06b6d4, 0.25, { transparent: true, opacity: 0.55 }),
  );
  water.rotation.x = -Math.PI / 2;
  water.position.set(x, -0.15, z);
  scene.add(water);
  arenaMover(scene, (t) => {
    water.material.emissiveIntensity = 0.2 + Math.sin(t * 2) * 0.1;
  });
}

export function addDeliveryZone(scene, x, z, col = 0xef4444, label = '') {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(1.1, 1.45, 20),
    mat(col, col, 0.7, { transparent: true, opacity: 0.55, side: THREE.DoubleSide }),
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(x, 0.06, z);
  scene.add(ring);
  const crate = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.9, 0.9),
    mat(col, col, 0.45),
  );
  crate.position.set(x, 0.55, z);
  crate.castShadow = true;
  scene.add(crate);
  if (label) {
    const cnv = document.createElement('canvas');
    cnv.width = 200;
    cnv.height = 48;
    const ctx = cnv.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0.7)';
    ctx.roundRect(4, 4, 192, 40, 8);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(label.slice(0, 16), 100, 28);
    const lbl = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 0.5),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cnv), transparent: true, depthWrite: false }),
    );
    lbl.position.set(x, 2, z);
    scene.add(lbl);
  }
  arenaMover(scene, (t) => {
    ring.material.emissiveIntensity = 0.5 + Math.sin(t * 3 + z) * 0.35;
  });
}

export function addFuelStation(scene, x, z) {
  const pump = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 1.4, 0.5),
    mat(0x1e40af, 0x3b82f6, 0.35),
  );
  pump.position.set(x, 0.7, z);
  scene.add(pump);
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(1.2, 0.5),
    mat(0x22c55e, 0x22c55e, 0.8),
  );
  sign.position.set(x, 1.6, z + 0.3);
  scene.add(sign);
  const pl = new THREE.PointLight(0x3b82f6, 0.6, 6);
  pl.position.set(x, 1.5, z);
  scene.add(pl);
}

export function addTrafficLight(scene, x, z) {
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.1, 3.2, 6),
    mat(0x64748b, 0, 0, { metalness: 0.4 }),
  );
  pole.position.set(x, 1.6, z);
  scene.add(pole);
  const lights = [
    new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), mat(0xef4444, 0xff0000, 1)),
    new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), mat(0x22c55e, 0x22c55e, 0.2)),
  ];
  lights[0].position.set(x, 2.6, z + 0.15);
  lights[1].position.set(x, 2.1, z + 0.15);
  scene.add(lights[0], lights[1]);
  const barrier = new THREE.Mesh(
    new THREE.BoxGeometry(4.5, 0.15, 0.15),
    mat(0xef4444, 0xff0000, 0.9),
  );
  barrier.position.set(x, 0.8, z - 1);
  scene.add(barrier);
  arenaMover(scene, (t) => {
    const red = Math.sin(t * 0.8) > 0;
    lights[0].material.emissiveIntensity = red ? 1.2 : 0.15;
    lights[1].material.emissiveIntensity = red ? 0.15 : 1.1;
    barrier.visible = red;
  });
}

export function addSlalomGate(scene, x, z, colL = 0xef4444, colR = 0x3b82f6) {
  [-1.5, 1.5].forEach((ox, i) => {
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.12, 2.2, 6),
      mat(i === 0 ? colL : colR, i === 0 ? colL : colR, 0.7),
    );
    post.position.set(x + ox, 1.1, z);
    scene.add(post);
  });
  const banner = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 0.35),
    mat(0xfbbf24, 0xfbbf24, 0.5, { transparent: true, opacity: 0.85, side: THREE.DoubleSide }),
  );
  banner.position.set(x, 2.3, z);
  scene.add(banner);
}

export function addBoulder(scene, x, z, size = 0.9) {
  const rock = new THREE.Mesh(
    new THREE.DodecahedronGeometry(size, 0),
    mat(0x57534e, 0, 0, { roughness: 0.95 }),
  );
  rock.position.set(x, size * 0.55, z);
  rock.rotation.set(Math.random(), Math.random(), Math.random());
  rock.castShadow = true;
  scene.add(rock);
}

export function addRainbowRail(scene, x, z, col) {
  const rail = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 1.2, 4),
    mat(col, col, 0.85),
  );
  rail.position.set(x, 0.6, z);
  scene.add(rail);
}

export function addGrandstand(scene, x, z) {
  const stand = new THREE.Mesh(
    new THREE.BoxGeometry(6, 3, 2),
    mat(0x1e293b, 0, 0, { roughness: 0.9 }),
  );
  stand.position.set(x, 1.5, z);
  scene.add(stand);
  for (let row = 0; row < 4; row++) {
    for (let seat = 0; seat < 8; seat++) {
      const dot = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 4, 4),
        mat([0xef4444, 0x3b82f6, 0xfbbf24, 0x22c55e][seat % 4], 0, 0),
      );
      dot.position.set(x - 2.5 + seat * 0.7, 0.8 + row * 0.5, z - 0.5 + row * 0.15);
      scene.add(dot);
    }
  }
}

export function addParkingBay(scene, x, z, col = 0xfbbf24) {
  const bay = new THREE.Mesh(
    new THREE.PlaneGeometry(2.8, 5),
    mat(col, col, 0.25, { transparent: true, opacity: 0.4 }),
  );
  bay.rotation.x = -Math.PI / 2;
  bay.position.set(x, 0.03, z);
  scene.add(bay);
  [-1.2, 1.2].forEach((ox) => {
    const line = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.02, 5),
      mat(col, col, 0.6),
    );
    line.position.set(x + ox, 0.05, z);
    scene.add(line);
  });
}

export function addMountainPeak(scene, x, z) {
  const peak = new THREE.Mesh(
    new THREE.ConeGeometry(4, 8, 6),
    mat(0x64748b, 0, 0, { roughness: 0.95 }),
  );
  peak.position.set(x, 4, z);
  scene.add(peak);
  const snow = new THREE.Mesh(
    new THREE.ConeGeometry(2.2, 2.5, 6),
    mat(0xf8fafc, 0xe2e8f0, 0.1),
  );
  snow.position.set(x, 7.2, z);
  scene.add(snow);
}

export function addTargetMarker(scene, x, z, col = 0xec4899) {
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.9, 0.1, 8, 20),
    mat(col, col, 1.1),
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.set(x, 0.9, z);
  scene.add(ring);
  arenaMover(scene, (t) => {
    ring.rotation.z = t * 1.5;
    ring.material.emissiveIntensity = 0.7 + Math.sin(t * 4) * 0.35;
  });
}

export function addTowTruck(scene, x, z) {
  const cab = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 1.2, 1.2),
    mat(0x64748b, 0, 0, { metalness: 0.5 }),
  );
  cab.position.set(x, 0.7, z);
  scene.add(cab);
  const trailer = new THREE.Mesh(
    new THREE.BoxGeometry(3.5, 1.4, 1.6),
    mat(0x475569, 0, 0, { metalness: 0.4 }),
  );
  trailer.position.set(x - 2.5, 0.75, z);
  scene.add(trailer);
  const rope = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 1.2, 6),
    mat(0x1e293b, 0, 0, { metalness: 0.6 }),
  );
  rope.rotation.z = Math.PI / 2;
  rope.position.set(x - 1.2, 0.5, z);
  scene.add(rope);
}

/** NASA comm dish — martian prop kit */
export function addCommDish(scene, x, z) {
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 0.5, 8), mat(0x64748b, 0, 0, { metalness: 0.5 }));
  base.position.set(x, 0.25, z);
  scene.add(base);
  const dish = new THREE.Mesh(new THREE.SphereGeometry(0.9, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat(0xcbd5e1, 0x38bdf8, 0.15, { metalness: 0.6 }));
  dish.rotation.x = -0.35;
  dish.position.set(x, 1.1, z);
  scene.add(dish);
}

/** Industrial LED stack light (green/red) */
export function addLedStackLight(scene, x, z) {
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 2.2, 6), mat(0x475569));
  pole.position.set(x, 1.1, z);
  scene.add(pole);
  const green = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), mat(0x22c55e, 0x22c55e, 1.1));
  green.position.set(x, 2.1, z);
  scene.add(green);
  const red = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), mat(0xef4444, 0xef4444, 0.2));
  red.position.set(x, 1.7, z);
  scene.add(red);
  arenaMover(scene, (t) => {
    green.material.emissiveIntensity = 0.8 + Math.sin(t * 3) * 0.4;
    red.material.emissiveIntensity = 0.15 + Math.sin(t * 5 + 1) * 0.1;
  });
}

/** Hospital gurney — emergency prop kit */
export function addHospitalGurney(scene, x, z) {
  const bed = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.35, 1), mat(0xe2e8f0, 0x06b6d4, 0.08));
  bed.position.set(x, 0.5, z);
  scene.add(bed);
  const rail = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.08, 0.08), mat(0x94a3b8));
  rail.position.set(x, 0.75, z + 0.45);
  scene.add(rail);
}

/** Fire hydrant checkpoint marker */
export function addFireHydrant(scene, x, z) {
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 1, 8), mat(0xdc2626, 0xef4444, 0.35));
  body.position.set(x, 0.5, z);
  scene.add(body);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.15, 8), mat(0x1e293b));
  cap.position.set(x, 1.05, z);
  scene.add(cap);
}

/** Rooftop helipad H marking */
export function addHelipad(scene, x, z) {
  const pad = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.1, 16), mat(0x374151, 0xfbbf24, 0.12));
  pad.position.set(x, 0.05, z);
  scene.add(pad);
  const h = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.9), mat(0xfbbf24, 0xfbbf24, 0.5));
  h.rotation.x = -Math.PI / 2;
  h.position.set(x, 0.12, z);
  scene.add(h);
}

/** Neon warp tunnel segment — hybrid sky race */
export function addWarpTunnel(scene, x, z, col = 0xa855f7) {
  const tube = new THREE.Mesh(
    new THREE.TorusGeometry(2.4, 0.18, 8, 24),
    mat(col, col, 1.2, { transparent: true, opacity: 0.75 }),
  );
  tube.rotation.y = Math.PI / 2;
  tube.position.set(x, 2.2, z);
  scene.add(tube);
  arenaMover(scene, (t) => {
    tube.material.emissiveIntensity = 0.9 + Math.sin(t * 4) * 0.35;
    tube.rotation.z = t * 0.6;
  });
}

/** Security camera + spotlight cone — cyber ninja */
export function addSecurityCamera(scene, x, z) {
  const cam = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, 0.5), mat(0x1e293b, 0x06b6d4, 0.4));
  cam.position.set(x, 3.2, z);
  scene.add(cam);
  const lens = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), mat(0xec4899, 0xec4899, 1));
  lens.position.set(x, 3.15, z + 0.28);
  scene.add(lens);
  arenaMover(scene, (t) => {
    cam.rotation.y = Math.sin(t * 0.7) * 0.45;
  });
}
