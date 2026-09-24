/**
 * MissionArenaBuilder.js — Per-mission 3D setup (collectibles, obstacles, goals, waypoints)
 * Applied after base arena theme is built.
 */
import * as THREE from 'three';
import { buildCoin, animateCollectible } from '../racing/GameWorldBuilder.js';
import { buildMissionRouteFromSetup } from './ArenaBuilderCore.js';

const COLLECTIBLE_COLORS = {
  energy_crystal: 0x00e5ff,
  pearl: 0xffffff,
  treasure_chest: 0xffd700,
  treasure: 0xffd700,
  waste_container: 0x44ff44,
  super_neutraliser: 0x88ff00,
  ancient_coin: 0xffd700,
  artefact: 0xcc88ff,
  tablet: 0xffaa44,
  package: 0xf59e0b,
  data_chip: 0x00ff88,
  power_cell: 0x00d9ff,
  ice_fragment: 0xaaddff,
  letter: 0xffffff,
  beacon: 0x4499ff,
  supply_pack: 0xff4444,
  supply_crate: 0x88ccff,
  sample: 0x88ff44,
  rock_sample: 0x888888,
  fossil: 0xd4a574,
  sacred_gem: 0xff44cc,
  power_core: 0xff6600,
  magma_crystal: 0xff4400,
  bolt: 0xaaaaaa,
  solar_cell: 0xffdd00,
  star_token: 0xfbbf24,
  crystal: 0x06b6d4,
  default: 0x00e5ff,
};

const ARTEFACT_COLORS = {
  purple: 0xaa44ff, red: 0xff4444, orange: 0xff8800,
  yellow: 0xffdd00, green: 0x44ff44, blue: 0x4488ff,
};

const OBSTACLE_COLORS = {
  coral: 0xff6b9d,
  jellyfish: 0xff88ff,
  debris: 0x665544,
  boulder: 0x888888,
  spike_trap: 0xff2200,
  sentinel: 0xff4400,
  drone_patrol: 0xff0044,
  electric_fence: 0x00ff00,
  laser: 0xff0000,
  glitch_bot: 0xff00ff,
  polar_bear: 0xffffff,
  vine: 0x228833,
  guardian: 0xff6600,
  falling_rock: 0x886644,
  pillar: 0x9e8060,
  rubble: 0x8d7055,
  sand_pillar: 0xc4a574,
  default: 0xff4444,
};

function _mover(scene, fn) {
  (scene.userData.movers = scene.userData.movers || []).push({ update: fn });
}

function _regCollectible(scene, mesh, x, y, z, value = 10, radius = 0.9, meta = {}) {
  (scene.userData.collectibles = scene.userData.collectibles || []).push({
    mesh, pos: { x, y, z }, radius, value, collected: false, ...meta,
  });
}

function _regObstacle(scene, mesh, radius = 1.1, check3d = false, meta = {}) {
  const obs = { mesh, radius, check3d, ...meta };
  (scene.userData.obstacles = scene.userData.obstacles || []).push(obs);
  return obs;
}

function _makeCollectibleMesh(type, color, item = {}) {
  const col = color || COLLECTIBLE_COLORS[type] || COLLECTIBLE_COLORS.default;
  if (type === 'artefact') {
    const g = new THREE.Group();
    const jar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.35, 0.7, 8),
      new THREE.MeshStandardMaterial({
        color: item.color ? (ARTEFACT_COLORS[item.color] || col) : col,
        emissive: item.color ? (ARTEFACT_COLORS[item.color] || col) : col,
        emissiveIntensity: 0.5,
      }),
    );
    jar.position.y = 0.45;
    g.add(jar);
    const lid = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.28, 0.12, 8),
      new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.6, roughness: 0.3 }),
    );
    lid.position.y = 0.82;
    g.add(lid);
    return g;
  }
  if (type === 'tablet') {
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.7, 0.08),
      new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.45, roughness: 0.8 }),
    );
    m.position.y = 0.45;
    return m;
  }
  if (type === 'treasure_chest' || type === 'treasure' || type === 'package' || type === 'supply_pack') {
    const g = new THREE.Group();
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.5, 0.5),
      new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.4 }),
    );
    box.position.y = 0.35;
    g.add(box);
    return g;
  }
  if (type === 'pearl' || type === 'beacon') {
    const m = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 12, 12),
      new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.8 }),
    );
    m.position.y = 0.5;
    return m;
  }
  const coin = buildCoin(0.9);
  coin.traverse((c) => {
    if (c.isMesh && c.material) {
      c.material = c.material.clone();
      c.material.color.setHex(col);
      c.material.emissive?.setHex(col);
      c.material.emissiveIntensity = item.hidden || item.buried ? 0.25 : 0.6;
      if (item.hidden || item.buried) c.material.transparent = true, c.material.opacity = 0.55;
    }
  });
  return coin;
}

function _buildSandMound(scene, x, z) {
  const mound = new THREE.Mesh(
    new THREE.ConeGeometry(0.7, 0.35, 8),
    new THREE.MeshStandardMaterial({ color: 0xd4a553, roughness: 0.95 }),
  );
  mound.position.set(x, 0.12, z);
  scene.add(mound);
}

function _buildGoalBeacon(scene, setup) {
  if (!setup?.goal) return;
  const { x, z, label, colors } = setup.goal;
  const col1 = colors?.[0] ?? 0xffd700;
  // Tighter goal zone: robot must code precisely to reach the goal.
  // Children must actually aim their code — not just get "near" the beacon.
  scene.userData.finishZone = { x, z, radius: setup.goal.radius || 2.0, y3d: 0 };

  const beamMat = new THREE.MeshBasicMaterial({
    color: col1, transparent: true, opacity: 0.15, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 1.8, 14, 16, 1, true), beamMat);
  beam.position.set(x, 7, z);
  scene.add(beam);

  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 16, 16),
    new THREE.MeshStandardMaterial({ color: col1, emissive: col1, emissiveIntensity: 1.3 }),
  );
  orb.position.set(x, 1.5, z);
  scene.add(orb);

  const pl = new THREE.PointLight(col1, 3, 16);
  pl.position.set(x, 2, z);
  scene.add(pl);

  if (label) {
    const cnv = document.createElement('canvas');
    cnv.width = 400; cnv.height = 80;
    const ctx = cnv.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.roundRect(4, 4, 392, 72, 10);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px system-ui,sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, 200, 48);
    const lbl = new THREE.Mesh(
      new THREE.PlaneGeometry(4, 0.8),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cnv), transparent: true, depthWrite: false }),
    );
    lbl.position.set(x, 3.5, z);
    scene.add(lbl);
  }

  _mover(scene, (t) => {
    orb.scale.setScalar(0.9 + Math.sin(t * 3) * 0.1);
    pl.intensity = 2.5 + Math.sin(t * 2.5) * 0.7;
    beamMat.opacity = 0.1 + Math.sin(t * 1.6) * 0.06;
  });
}

function _buildCollectibles(scene, items = []) {
  items.forEach((item, i) => {
    const mesh = _makeCollectibleMesh(item.type, item.color, item);
    const y = item.y ?? (item.buried || item.hidden ? 0.35 : 0.7);
    mesh.position.set(item.x, y, item.z);
    scene.add(mesh);
    if (item.buried || item.hidden) _buildSandMound(scene, item.x, item.z);
    animateCollectible(mesh, i * 0.7);
    _regCollectible(scene, mesh, item.x, y, item.z, item.value || 12, item.radius || 0.95, {
      type: item.type, order: item.order, number: item.number, hidden: item.hidden, color: item.color,
    });
    if (item.order != null) {
      const cnv = document.createElement('canvas');
      cnv.width = 64; cnv.height = 64;
      const ctx = cnv.getContext('2d');
      ctx.fillStyle = '#ffdd00';
      ctx.beginPath(); ctx.arc(32, 32, 28, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#000';
      ctx.font = 'bold 36px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(item.order), 32, 34);
      const badge = new THREE.Mesh(
        new THREE.PlaneGeometry(0.5, 0.5),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cnv), transparent: true, depthWrite: false }),
      );
      badge.position.set(item.x, y + 1.2, item.z);
      scene.add(badge);
    }
  });
}

function _buildSpikeTrap(scene, obs, i) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 0.12, 1.4),
    new THREE.MeshStandardMaterial({ color: 0x5a4030, roughness: 0.9 }),
  );
  base.position.y = 0.06;
  g.add(base);
  const spikes = [];
  for (let s = 0; s < 4; s++) {
    const spike = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, 0.9, 4),
      new THREE.MeshStandardMaterial({ color: 0xff2200, emissive: 0xff1100, emissiveIntensity: 0.4, metalness: 0.5 }),
    );
    spike.position.set((s % 2) * 0.5 - 0.25, 0.5, Math.floor(s / 2) * 0.5 - 0.25);
    g.add(spike);
    spikes.push(spike);
  }
  g.position.set(obs.x, 0, obs.z);
  scene.add(g);
  const phase = obs.phase ?? i * 1.1;
  const period = obs.period ?? 2.4;
  _mover(scene, (t) => {
    const up = Math.sin((t + phase) * (Math.PI * 2 / period)) > 0.15;
    spikes.forEach((sp) => { sp.position.y = up ? 0.5 : -0.3; });
    g.userData.spikesUp = up;
  });
  _regObstacle(scene, g, obs.radius || 1.0, false, { type: 'spike_trap', damaging: true, animated: true });
}

function _buildSentinel(scene, obs, i) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 1.6, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x8b4513, emissive: 0xff4400, emissiveIntensity: 0.3, metalness: 0.4 }),
  );
  body.position.y = 1.0;
  g.add(body);
  const eye = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 8, 8),
    new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 1.2 }),
  );
  eye.position.set(0, 1.4, 0.45);
  g.add(eye);
  const baseX = obs.x ?? 0;
  const baseZ = obs.z ?? -15;
  const radius = obs.patrolRadius ?? 5;
  const speed = obs.speed ?? 0.7;
  g.position.set(baseX, 0, baseZ);
  scene.add(g);
  _mover(scene, (t) => {
    g.position.x = baseX + Math.sin(t * speed + i) * radius;
    g.position.z = baseZ + Math.cos(t * speed * 0.8 + i) * (radius * 0.6);
    g.rotation.y = Math.atan2(
      Math.cos(t * speed * 0.8 + i),
      Math.cos(t * speed + i),
    );
    eye.material.emissiveIntensity = 1.0 + Math.sin(t * 4) * 0.3;
  });
  _regObstacle(scene, g, obs.radius || 1.4, false, { type: 'sentinel', damaging: true });
}

function _buildObstacles(scene, items = []) {
  items.forEach((obs, i) => {
    if (obs.type === 'current') {
      _regObstacle(scene, { position: { x: obs.x, y: 0, z: obs.z } }, obs.radius || 2, false, {
        type: 'current', damaging: false, forceX: obs.forceX ?? 0, forceZ: obs.forceZ ?? 0,
      });
      return;
    }
    if (obs.type === 'spike_trap') { _buildSpikeTrap(scene, obs, i); return; }
    if (obs.type === 'sentinel') { _buildSentinel(scene, obs, i); return; }
    if (obs.type === 'electric_fence') {
      const g = new THREE.Group();
      const beam = new THREE.Mesh(
        new THREE.PlaneGeometry(obs.width ?? 3, 0.15),
        new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00ff00, emissiveIntensity: 0.9, transparent: true, opacity: 0.75, side: THREE.DoubleSide }),
      );
      beam.position.y = 0.5;
      g.add(beam);
      g.position.set(obs.x, 0, obs.z);
      scene.add(g);
      _mover(scene, (t) => { beam.material.opacity = 0.45 + Math.sin(t * 4 + i) * 0.3; });
      _regObstacle(scene, g, obs.radius || 1.3, false, { type: 'electric_fence', damaging: true });
      return;
    }
    if (obs.type === 'laser') {
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(obs.width ?? 4, 0.12, 0.12),
        new THREE.MeshStandardMaterial({ color: 0xff0000, emissive: 0xff0000, emissiveIntensity: 1.0 }),
      );
      bar.position.set(obs.x, 0.6, obs.z);
      scene.add(bar);
      _mover(scene, (t) => { bar.rotation.y = t * 1.2 + i; });
      _regObstacle(scene, bar, obs.radius || 1.2, false, { type: 'laser', damaging: true });
      return;
    }
    if (obs.type === 'drone_patrol') {
      const drone = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.3, 0.8),
        new THREE.MeshStandardMaterial({ color: 0xff0044, emissive: 0xff0044, emissiveIntensity: 0.6 }),
      );
      const baseX = obs.x ?? 0;
      const baseZ = obs.z ?? -10;
      drone.position.set(baseX, 1.5, baseZ);
      scene.add(drone);
      _mover(scene, (t) => {
        drone.position.x = baseX + Math.sin(t * (obs.speed ?? 0.9) + i) * (obs.range ?? 4);
        drone.position.z = baseZ + Math.cos(t * (obs.speed ?? 0.7) + i) * 2;
      });
      _regObstacle(scene, drone, obs.radius || 1.0, true, { type: 'drone_patrol', damaging: true });
      return;
    }

    const col = OBSTACLE_COLORS[obs.type] || OBSTACLE_COLORS.default;
    let mesh;
    if (obs.type === 'jellyfish') {
      mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.9, 10, 8),
        new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.6, transparent: true, opacity: 0.85 }),
      );
      mesh.position.set(obs.x, obs.y ?? 2.2, obs.z);
      _mover(scene, (t) => { mesh.position.y = (obs.y ?? 2.2) + Math.sin(t * 1.2 + i) * 0.4; });
    } else if (obs.type === 'boulder' || obs.type === 'falling_rock') {
      mesh = new THREE.Mesh(
        new THREE.DodecahedronGeometry(obs.size ?? 0.9, 0),
        new THREE.MeshStandardMaterial({ color: col, roughness: 0.9 }),
      );
      mesh.position.set(obs.x, 0.6, obs.z);
      const range = obs.range ?? 3;
      const spd = obs.speed ?? 0.8;
      _mover(scene, (t) => { mesh.position.x = obs.x + Math.sin(t * spd + i * 2) * range; });
    } else if (obs.type === 'pillar' || obs.type === 'sand_pillar') {
      mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.45, 2.2, 6),
        new THREE.MeshStandardMaterial({ color: col, roughness: 0.95 }),
      );
      mesh.position.set(obs.x, 1.1, obs.z);
    } else if (obs.type === 'rubble' || obs.type === 'obstacle') {
      mesh = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.7, 0),
        new THREE.MeshStandardMaterial({ color: col, roughness: 0.95 }),
      );
      mesh.position.set(obs.x, 0.5, obs.z);
    } else if (obs.type === 'coral' || obs.type === 'debris' || obs.type === 'vine') {
      mesh = new THREE.Mesh(
        new THREE.ConeGeometry(0.6, 1.4, 6),
        new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.2 }),
      );
      mesh.position.set(obs.x, 0.7, obs.z);
    } else {
      mesh = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 1.2, 1.2),
        new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.35 }),
      );
      mesh.position.set(obs.x, obs.y ?? 0.6, obs.z);
    }
    scene.add(mesh);
    const damaging = obs.damaging !== false && obs.type !== 'pillar';
    _regObstacle(scene, mesh, obs.radius || 1.1, false, { type: obs.type, damaging });
  });
}

function _buildWaypoints(scene, waypoints = []) {
  scene.userData.missionWaypoints = waypoints;
  waypoints.forEach((wp) => {
    const col = 0xffdd00;
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.7, 0.08, 8, 24),
      new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.9 }),
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.set(wp.x, 0.15, wp.z);
    scene.add(ring);
    const labelText = wp.label || (wp.num != null ? String(wp.num) : '?');
    if (wp.num != null || wp.label) {
      const cnv = document.createElement('canvas');
      cnv.width = 160; cnv.height = 80;
      const ctx = cnv.getContext('2d');
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.roundRect(4, 4, 152, 72, 8);
      ctx.fill();
      ctx.fillStyle = '#ffdd00';
      ctx.font = 'bold 22px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labelText, 80, 40);
      const badge = new THREE.Mesh(
        new THREE.PlaneGeometry(1.4, 0.7),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cnv), transparent: true, depthWrite: false }),
      );
      badge.rotation.x = -Math.PI / 2;
      badge.position.set(wp.x, 0.35, wp.z);
      scene.add(badge);
    }
    if (wp.num != null) {
      const numCnv = document.createElement('canvas');
      numCnv.width = 64; numCnv.height = 64;
      const nctx = numCnv.getContext('2d');
      nctx.fillStyle = '#ffdd00';
      nctx.beginPath(); nctx.arc(32, 32, 28, 0, Math.PI * 2); nctx.fill();
      nctx.fillStyle = '#000';
      nctx.font = 'bold 36px system-ui';
      nctx.textAlign = 'center';
      nctx.textBaseline = 'middle';
      nctx.fillText(String(wp.num), 32, 34);
      const numBadge = new THREE.Mesh(
        new THREE.PlaneGeometry(0.55, 0.55),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(numCnv), transparent: true, depthWrite: false }),
      );
      numBadge.position.set(wp.x, 1.1, wp.z);
      scene.add(numBadge);
    }
    _mover(scene, (t) => { ring.position.y = 0.15 + Math.sin(t * 2 + wp.z) * 0.08; });
  });
}

function _buildColorZones(scene, zones = []) {
  zones.forEach((z) => {
    const colorMap = { red: 0xff4444, blue: 0x4488ff, yellow: 0xffdd00, green: 0x44ff44, purple: 0xaa44ff, orange: 0xff8800 };
    const col = colorMap[z.color] || 0xffffff;
    const x = z.x ?? 0;
    const zz = z.z ?? -10;
    const flag = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 1.8, 0.15),
      new THREE.MeshStandardMaterial({ color: 0x888888 }),
    );
    flag.position.set(x, 0.9, zz);
    scene.add(flag);
    const cloth = new THREE.Mesh(
      new THREE.PlaneGeometry(0.9, 0.6),
      new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.4, side: THREE.DoubleSide }),
    );
    cloth.position.set(x + 0.5, 1.3, zz);
    scene.add(cloth);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(1.2, 1.5, 24),
      new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.35, side: THREE.DoubleSide }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(x, 0.05, zz);
    scene.add(ring);
    if (z.order != null) {
      const cnv = document.createElement('canvas');
      cnv.width = 48; cnv.height = 48;
      const ctx = cnv.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 28px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(z.order), 24, 26);
      const ord = new THREE.Mesh(
        new THREE.PlaneGeometry(0.4, 0.4),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cnv), transparent: true, depthWrite: false }),
      );
      ord.position.set(x, 2.2, zz);
      scene.add(ord);
    }
  });
}

function _buildTent(scene, x, z, label, color = 0xd4a553) {
  const g = new THREE.Group();
  [-0.8, 0.8].forEach((px) => {
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 2.2, 6),
      new THREE.MeshStandardMaterial({ color: 0x8b6914 }),
    );
    pole.position.set(px, 1.1, 0);
    g.add(pole);
  });
  const canvas = new THREE.Mesh(
    new THREE.ConeGeometry(1.6, 1.4, 4),
    new THREE.MeshStandardMaterial({ color, roughness: 0.85, side: THREE.DoubleSide }),
  );
  canvas.position.y = 1.6;
  canvas.rotation.y = Math.PI / 4;
  g.add(canvas);
  g.position.set(x, 0, z);
  scene.add(g);
  if (label) {
    const cnv = document.createElement('canvas');
    cnv.width = 200; cnv.height = 48;
    const ctx = cnv.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.roundRect(2, 2, 196, 44, 6);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 100, 24);
    const lbl = new THREE.Mesh(
      new THREE.PlaneGeometry(2.2, 0.55),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cnv), transparent: true, depthWrite: false }),
    );
    lbl.position.set(x, 3.2, z);
    scene.add(lbl);
  }
}

function _buildDuneMarker(scene, x, z, label) {
  const dune = new THREE.Mesh(
    new THREE.SphereGeometry(1.2, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0xe8c878, roughness: 0.95 }),
  );
  dune.scale.set(1.4, 0.5, 1.0);
  dune.position.set(x, 0.15, z);
  scene.add(dune);
  const post = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 1.4, 6),
    new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffd700, emissiveIntensity: 0.3 }),
  );
  post.position.set(x, 0.9, z);
  scene.add(post);
  if (label) {
    const cnv = document.createElement('canvas');
    cnv.width = 120; cnv.height = 40;
    const ctx = cnv.getContext('2d');
    ctx.fillStyle = '#ff8f00';
    ctx.font = 'bold 16px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(label, 60, 26);
    const lbl = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 0.4),
      new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cnv), transparent: true, depthWrite: false }),
    );
    lbl.position.set(x, 1.8, z);
    scene.add(lbl);
  }
}

function _buildMissionProps(scene, props = [], setup = {}) {
  if (!props?.length) return;
  const goal = setup.goal || {};

  props.forEach((prop) => {
    if (prop === 'dune_markers' || prop === 'dunes') {
      [
        { x: -2, z: -5, label: 'Dune 1' },
        { x: 1.5, z: -11, label: 'Dune 2' },
        { x: -1, z: -17, label: 'Dune 3' },
      ].forEach((d) => _buildDuneMarker(scene, d.x, d.z, d.label));
    }
    if (prop === 'ruin_pillars' || prop === 'pillars') {
      [[-4, -7], [4, -13], [-3.5, -19], [3.5, -25]].forEach(([x, z]) => {
        const p = new THREE.Mesh(
          new THREE.CylinderGeometry(0.4, 0.5, 2.8, 6),
          new THREE.MeshStandardMaterial({ color: 0x9e8060, roughness: 0.95 }),
        );
        p.position.set(x, 1.4, z);
        scene.add(p);
      });
    }
    if (prop === 'tent') {
      _buildTent(scene, goal.x ?? 0, (goal.z ?? 4) - 1.5, 'MUSEUM TENT', 0xc4956a);
    }
    if (prop === 'camps') {
      _buildTent(scene, -6, -8, 'Camp A', 0xd4a553);
      _buildTent(scene, 6, -16, 'Camp B', 0xc49050);
      _buildTent(scene, -5, -24, 'Camp C', 0xb88040);
      _buildTent(scene, goal.x ?? 0, goal.z ?? 4, 'RELAY BASE', 0xffd700);
    }
    if (prop === 'sandstorm') {
      if (scene.fog) scene.fog.density = 0.028;
      _ambientSandBurst(scene);
    }
    if (prop === 'spikes') {
      [[-3, -6], [3, -6], [-3, -12], [3, -12]].forEach(([x, z]) => {
        const tile = new THREE.Mesh(
          new THREE.BoxGeometry(1.8, 0.05, 1.8),
          new THREE.MeshStandardMaterial({ color: 0x5a4030 }),
        );
        tile.position.set(x, 0.02, z);
        scene.add(tile);
      });
    }
    if (prop === 'sentinel') {
      const pedestal = new THREE.Mesh(
        new THREE.CylinderGeometry(1.8, 2.2, 0.5, 8),
        new THREE.MeshStandardMaterial({ color: 0x6b5030, roughness: 0.9 }),
      );
      pedestal.position.set(0, 0.25, -15);
      scene.add(pedestal);
    }
    if (prop === 'tomb') {
      const arch = new THREE.Mesh(
        new THREE.BoxGeometry(4, 3, 0.6),
        new THREE.MeshStandardMaterial({ color: 0x7a6048, roughness: 0.95 }),
      );
      arch.position.set(goal.x ?? 0, 1.5, (goal.z ?? -30) - 1);
      scene.add(arch);
    }
  });
}

function _ambientSandBurst(scene) {
  const count = 120;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 20;
    pos[i * 3 + 1] = Math.random() * 4;
    pos[i * 3 + 2] = -Math.random() * 35;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ color: 0xd4a030, size: 0.12, transparent: true, opacity: 0.5 });
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);
  _mover(scene, (t) => {
    const arr = geo.attributes.position.array;
    for (let i = 0; i < count; i++) {
      arr[i * 3] += Math.sin(t + i) * 0.02;
      arr[i * 3 + 1] = (arr[i * 3 + 1] + 0.04) % 5;
    }
    geo.attributes.position.needsUpdate = true;
  });
}

function _applyAtmosphere(scene, atmosphere) {
  if (!atmosphere) return;
  if (atmosphere.fogDensity != null && scene.fog) {
    scene.fog.density = atmosphere.fogDensity;
  }
  if (atmosphere.particleColor) {
    _ambientSandBurst(scene);
  }
}

/** Apply mission-specific arena layout on top of base theme */
export function applyMissionArenaSetup(scene, setup, challenge) {
  if (!setup) return;

  scene.userData.collectibles = [];
  scene.userData.obstacles = [];
  scene.userData.missionId = challenge?.robotMissionId || challenge?.id;
  scene.userData.missionSetup = setup;
  scene.userData.missionPrimary = challenge?.primaryObjective;
  scene.userData.missionTimeLimit = challenge?.timeLimit;

  _applyAtmosphere(scene, setup.atmosphere);
  _buildGoalBeacon(scene, setup);
  _buildCollectibles(scene, setup.collectibles);
  _buildObstacles(scene, setup.obstacles);
  _buildWaypoints(scene, setup.waypoints);
  _buildColorZones(scene, setup.zones);
  _buildMissionProps(scene, setup.props, setup);

  if (challenge?.primaryObjective?.target) {
    scene.userData.missionCollectTarget = challenge.primaryObjective.target;
  }

  buildMissionRouteFromSetup(scene, setup, challenge);
}

export function buildMissionArena(scene, challenge) {
  const setup = challenge?.arenaSetup;
  if (!setup) return;
  applyMissionArenaSetup(scene, setup, challenge);
}
