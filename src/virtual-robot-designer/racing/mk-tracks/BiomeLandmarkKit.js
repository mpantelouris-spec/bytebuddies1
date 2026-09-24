/**
 * BiomeLandmarkKit.js — Handcrafted landmarks, bridges, tunnels, and storytelling props
 * for each Mario-Kart-inspired biome circuit.
 */
import * as THREE from 'three';
import { placeAtTrack } from '../GameWorldBuilder.js';
import { pbrMat } from './BiomeAAAKit.js';

export function placeLandmark(world, curve, t, lateral, y, builder, rotOffset = 0) {
  const { pos, frame } = placeAtTrack(curve, t, lateral, y);
  const g = builder();
  g.position.copy(pos);
  g.position.y += y;
  g.rotation.y = (frame.rot ?? 0) + rotOffset;
  world.add(g);
  return g;
}

// ── TRACK 1: Sunset Coast ───────────────────────────────────────────────────

export function buildLighthouse() {
  const g = new THREE.Group();
  g.name = 'landmark-lighthouse';
  const base = new THREE.Mesh(new THREE.CylinderGeometry(3.5, 4.5, 8, 12), pbrMat(0xeeeeee, { roughness: 0.7 }));
  base.position.y = 4;
  g.add(base);
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 3, 14, 10), pbrMat(0xffffff, { roughness: 0.55 }));
  tower.position.y = 15;
  g.add(tower);
  const lamp = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 2.5, 12), pbrMat(0xffdd88, { emissive: 0xffaa44, emi: 1.2 }));
  lamp.position.y = 23;
  g.add(lamp);
  const light = new THREE.PointLight(0xffaa44, 6, 45, 1.4);
  light.position.y = 23;
  g.add(light);
  return g;
}

export function buildSeaArch(span = 24) {
  const g = new THREE.Group();
  const rock = pbrMat(0xc4a882, { roughness: 0.88 });
  const left = new THREE.Mesh(new THREE.BoxGeometry(6, 18, 8), rock);
  left.position.set(-span / 2, 9, 0);
  g.add(left);
  const right = left.clone();
  right.position.x = span / 2;
  g.add(right);
  const top = new THREE.Mesh(new THREE.BoxGeometry(span + 4, 5, 10), rock);
  top.position.y = 20;
  g.add(top);
  return g;
}

export function buildShipwreck() {
  const g = new THREE.Group();
  const hull = new THREE.Mesh(new THREE.BoxGeometry(14, 3, 5), pbrMat(0x5a4030, { roughness: 0.9 }));
  hull.rotation.z = 0.35;
  hull.position.y = 1.2;
  g.add(hull);
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 9, 6), pbrMat(0x4a3020));
  mast.position.set(2, 5, 0);
  mast.rotation.z = 0.5;
  g.add(mast);
  const sail = new THREE.Mesh(new THREE.PlaneGeometry(5, 7), pbrMat(0xddddcc, { roughness: 0.95, transparent: true, opacity: 0.7 }));
  sail.position.set(2, 6, 0.5);
  sail.rotation.y = 0.4;
  g.add(sail);
  return g;
}

export function buildPirateFortress() {
  const g = new THREE.Group();
  const wall = new THREE.Mesh(new THREE.BoxGeometry(16, 6, 3), pbrMat(0x8b7355, { roughness: 0.85 }));
  wall.position.y = 3;
  g.add(wall);
  for (let i = 0; i < 4; i++) {
    const cren = new THREE.Mesh(new THREE.BoxGeometry(2, 1.5, 2), pbrMat(0x7a6348));
    cren.position.set(-6 + i * 4, 6.5, 0);
    g.add(cren);
  }
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(3, 2), pbrMat(0xcc2222, { emissive: 0x880000, emi: 0.2 }));
  flag.position.set(0, 9, 1.6);
  g.add(flag);
  return g;
}

export function buildSuspensionBridge(curve, t, halfWidth) {
  const g = new THREE.Group();
  const { pos, frame } = placeAtTrack(curve, t, 0, 0);
  const rot = frame.rot ?? 0;
  const span = halfWidth * 5;
  const deck = new THREE.Mesh(new THREE.BoxGeometry(span, 0.35, 4), pbrMat(0x8b6914, { roughness: 0.8 }));
  deck.position.y = 2.5;
  g.add(deck);
  for (const side of [-1, 1]) {
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 12, 6), pbrMat(0x888888, { metalness: 0.7 }));
    cable.position.set(side * span * 0.4, 8, 0);
    cable.rotation.z = side * 0.15;
    g.add(cable);
    const tower = new THREE.Mesh(new THREE.BoxGeometry(0.5, 10, 0.5), pbrMat(0x666666, { metalness: 0.6 }));
    tower.position.set(side * span * 0.45, 5, 0);
    g.add(tower);
  }
  g.position.copy(pos);
  g.rotation.y = rot;
  return g;
}

export function buildDolphinLeap(x, z) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(1.2, 10, 8), pbrMat(0x6699cc, { roughness: 0.4 }));
  body.scale.set(2, 0.7, 0.9);
  body.rotation.z = -0.8;
  g.add(body);
  g.position.set(x, 1.5, z);
  g.userData.bobPhase = Math.random() * 10;
  return g;
}

// ── TRACK 2: Crystal Cavern ─────────────────────────────────────────────────

export function buildCrystalCathedral() {
  const g = new THREE.Group();
  for (let i = 0; i < 8; i++) {
    const h = 18 + (i % 3) * 6;
    const shard = new THREE.Mesh(
      new THREE.ConeGeometry(2 + (i % 2), h, 6),
      pbrMat(0x88ddff, { emissive: 0x00ccff, emi: 0.7, roughness: 0.15, metalness: 0.4, transmission: 0.3 }),
    );
    const angle = (i / 8) * Math.PI * 2;
    shard.position.set(Math.cos(angle) * 10, h / 2, Math.sin(angle) * 10);
    g.add(shard);
  }
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(12, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    pbrMat(0x446688, { emissive: 0x0088aa, emi: 0.4, transparent: true, opacity: 0.85 }),
  );
  dome.position.y = 8;
  g.add(dome);
  return g;
}

export function buildGiantGeode(radius = 14) {
  const g = new THREE.Group();
  const shell = new THREE.Mesh(
    new THREE.SphereGeometry(radius, 16, 12, 0, Math.PI),
    pbrMat(0x553366, { roughness: 0.9 }),
  );
  shell.rotation.x = Math.PI;
  g.add(shell);
  for (let i = 0; i < 40; i++) {
    const crystal = new THREE.Mesh(
      new THREE.ConeGeometry(0.4 + Math.random() * 0.6, 2 + Math.random() * 3, 5),
      pbrMat(0xaa88ff, { emissive: 0x8844ff, emi: 0.8 }),
    );
    const a = Math.random() * Math.PI;
    const b = Math.random() * Math.PI;
    crystal.position.set(Math.sin(a) * Math.cos(b) * radius * 0.7, Math.abs(Math.sin(b)) * radius * 0.5, Math.cos(a) * Math.cos(b) * radius * 0.7);
    crystal.rotation.set(Math.random(), Math.random(), Math.random());
    g.add(crystal);
  }
  return g;
}

export function buildCrystalBridge(length = 20) {
  const g = new THREE.Group();
  const deck = new THREE.Mesh(new THREE.BoxGeometry(length, 0.4, 3), pbrMat(0x88ccff, { emissive: 0x00aaff, emi: 0.5, transmission: 0.4 }));
  deck.position.y = 4;
  g.add(deck);
  for (let i = 0; i < 6; i++) {
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.8, 4, 6), pbrMat(0x00ffff, { emissive: 0x00ccff, emi: 0.6 }));
    pillar.position.set(-length / 2 + (i / 5) * length, 2, 0);
    g.add(pillar);
  }
  return g;
}

export function buildMiningRig() {
  const g = new THREE.Group();
  const frame = new THREE.Mesh(new THREE.BoxGeometry(8, 6, 4), pbrMat(0x555566, { metalness: 0.6, roughness: 0.5 }));
  frame.position.y = 3;
  g.add(frame);
  const drill = new THREE.Mesh(new THREE.ConeGeometry(1, 4, 8), pbrMat(0x888899, { metalness: 0.8 }));
  drill.rotation.x = Math.PI;
  drill.position.set(0, 1, 2);
  g.add(drill);
  return g;
}

// ── TRACK 3: Sky Garden ─────────────────────────────────────────────────────

export function buildSkyTemple() {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(14, 3, 14), pbrMat(0xe8e0d0, { roughness: 0.6 }));
  base.position.y = 1.5;
  g.add(base);
  const columns = 6;
  for (let i = 0; i < columns; i++) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.8, 10, 10), pbrMat(0xf5f0e8, { roughness: 0.5 }));
    const angle = (i / columns) * Math.PI * 2;
    col.position.set(Math.cos(angle) * 5, 8, Math.sin(angle) * 5);
    g.add(col);
  }
  const roof = new THREE.Mesh(new THREE.ConeGeometry(9, 5, 8), pbrMat(0xffd700, { metalness: 0.5, roughness: 0.3, emissive: 0xffaa00, emi: 0.3 }));
  roof.position.y = 15;
  g.add(roof);
  return g;
}

export function buildRainbowBridge(length = 22) {
  const g = new THREE.Group();
  const colors = [0xff0000, 0xff8800, 0xffff00, 0x00ff00, 0x0088ff, 0x8800ff];
  colors.forEach((c, i) => {
    const seg = new THREE.Mesh(
      new THREE.BoxGeometry(length / colors.length, 0.3, 3),
      pbrMat(c, { emissive: c, emi: 0.4, roughness: 0.3 }),
    );
    seg.position.set(-length / 2 + (i + 0.5) * (length / colors.length), 5 + Math.sin(i) * 0.5, 0);
    g.add(seg);
  });
  return g;
}

export function buildSkyObservatory() {
  const g = new THREE.Group();
  const dome = new THREE.Mesh(new THREE.SphereGeometry(5, 16, 12), pbrMat(0xccccff, { metalness: 0.7, roughness: 0.2, emissive: 0x8888ff, emi: 0.3 }));
  dome.position.y = 8;
  g.add(dome);
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 2, 8, 10), pbrMat(0xdddddd));
  pillar.position.y = 4;
  g.add(pillar);
  return g;
}

export function buildFloatingIsland(radius = 8) {
  const g = new THREE.Group();
  const island = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 1.3, 4, 14), pbrMat(0x4a8a3a, { roughness: 0.85 }));
  island.position.y = -2;
  g.add(island);
  const grass = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.95, radius, 0.5, 14), pbrMat(0x5a9e3a));
  g.add(grass);
  return g;
}

// ── TRACK 4: Volcanic Inferno ───────────────────────────────────────────────

export function buildVolcanicTemple() {
  const g = new THREE.Group();
  const pyramid = new THREE.Mesh(new THREE.ConeGeometry(10, 16, 4), pbrMat(0x3a2a22, { roughness: 0.9 }));
  pyramid.position.y = 8;
  pyramid.rotation.y = Math.PI / 4;
  g.add(pyramid);
  const lavaDoor = new THREE.Mesh(new THREE.PlaneGeometry(4, 6), pbrMat(0xff4400, { emissive: 0xff2200, emi: 1.2 }));
  lavaDoor.position.set(0, 4, 5.5);
  g.add(lavaDoor);
  return g;
}

export function buildLavaWaterfall() {
  const g = new THREE.Group();
  const fall = new THREE.Mesh(
    new THREE.PlaneGeometry(6, 18),
    pbrMat(0xff6600, { emissive: 0xff3300, emi: 1.5, transparent: true, opacity: 0.9 }),
  );
  fall.position.y = 9;
  g.add(fall);
  const pool = new THREE.Mesh(new THREE.CircleGeometry(5, 16), pbrMat(0xff2200, { emissive: 0xff0000, emi: 1.0 }));
  pool.rotation.x = -Math.PI / 2;
  pool.position.y = 0.1;
  g.add(pool);
  const light = new THREE.PointLight(0xff4400, 8, 25, 1.5);
  light.position.y = 3;
  g.add(light);
  return g;
}

export function buildObsidianArch(span = 18) {
  const g = new THREE.Group();
  const mat = pbrMat(0x1a1a22, { roughness: 0.3, metalness: 0.6, emissive: 0xff4400, emi: 0.25 });
  [-1, 1].forEach((s) => {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(3, 14, 3), mat);
    pillar.position.set(s * span / 2, 7, 0);
    g.add(pillar);
  });
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(span + 4, 2.5, 3.5), mat);
  lintel.position.y = 14;
  g.add(lintel);
  return g;
}

export function buildMagmaGeyser() {
  const g = new THREE.Group();
  const vent = new THREE.Mesh(new THREE.CylinderGeometry(2, 3, 1.5, 10), pbrMat(0x333333, { roughness: 0.9 }));
  vent.position.y = 0.75;
  g.add(vent);
  const plume = new THREE.Mesh(
    new THREE.ConeGeometry(2.5, 8, 8),
    pbrMat(0xff6600, { emissive: 0xff3300, emi: 1.0, transparent: true, opacity: 0.7 }),
  );
  plume.position.y = 5;
  g.add(plume);
  g.userData.pulse = Math.random() * 10;
  return g;
}

export function buildEruptingCrater() {
  const g = new THREE.Group();
  const rim = new THREE.Mesh(new THREE.TorusGeometry(16, 3, 8, 24), pbrMat(0x4a3020, { roughness: 0.95 }));
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 2;
  g.add(rim);
  const glow = new THREE.Mesh(new THREE.CircleGeometry(14, 24), pbrMat(0xff4400, { emissive: 0xff2200, emi: 1.5 }));
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = 0.5;
  g.add(glow);
  const light = new THREE.PointLight(0xff5500, 12, 60, 1.2);
  light.position.y = 5;
  g.add(light);
  return g;
}

// ── TRACK 5: Cyber City ─────────────────────────────────────────────────────

export function buildHologramDragon() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.TorusKnotGeometry(3, 0.8, 64, 8, 2, 3), pbrMat(0x00ffff, { emissive: 0x00ffff, emi: 1.2, transparent: true, opacity: 0.75 }));
  body.position.y = 12;
  g.add(body);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(12, 4), pbrMat(0xff00ff, { emissive: 0xff00ff, emi: 0.9 }));
  sign.position.set(0, 20, 0);
  g.add(sign);
  return g;
}

export function buildMaglevTrack(length = 30) {
  const g = new THREE.Group();
  const rail = new THREE.Mesh(new THREE.BoxGeometry(length, 0.3, 1.2), pbrMat(0x444455, { metalness: 0.8 }));
  rail.position.y = 8;
  g.add(rail);
  const train = new THREE.Mesh(new THREE.BoxGeometry(8, 2.5, 2), pbrMat(0x00ffff, { emissive: 0x00aaff, emi: 0.6, metalness: 0.7 }));
  train.position.set(0, 9.5, 0);
  train.userData.drift = 0.5;
  g.add(train);
  return g;
}

export function buildNeonTunnelSegment(length = 14) {
  const g = new THREE.Group();
  const arch = new THREE.Mesh(new THREE.TorusGeometry(length / 2, 0.4, 8, 16, Math.PI), pbrMat(0xff00ff, { emissive: 0xff00ff, emi: 1.0 }));
  arch.rotation.z = Math.PI / 2;
  arch.position.y = 5;
  g.add(arch);
  for (let i = 0; i < 8; i++) {
    const strip = new THREE.Mesh(new THREE.BoxGeometry(length, 0.15, 0.3), pbrMat(i % 2 ? 0xff00ff : 0x00ffff, { emissive: i % 2 ? 0xff00ff : 0x00ffff, emi: 1.2 }));
    strip.position.set(0, 1 + i * 0.8, -2.5);
    g.add(strip);
  }
  return g;
}

export function buildDigitalWaterfall() {
  const g = new THREE.Group();
  for (let i = 0; i < 12; i++) {
    const stream = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 16, 0.3),
      pbrMat(0x00ffff, { emissive: 0x00ffff, emi: 0.9, transparent: true, opacity: 0.8 }),
    );
    stream.position.set((i - 6) * 0.8, 8, 0);
    g.add(stream);
  }
  return g;
}

// ── TRACK 6: Frost Peak ─────────────────────────────────────────────────────

export function buildIceCastle() {
  const g = new THREE.Group();
  const keep = new THREE.Mesh(new THREE.BoxGeometry(12, 14, 12), pbrMat(0xd0e8f8, { roughness: 0.2, metalness: 0.1, transmission: 0.2 }));
  keep.position.y = 7;
  g.add(keep);
  for (let i = 0; i < 4; i++) {
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(2, 2.5, 20, 8), pbrMat(0xe8f4ff, { roughness: 0.15 }));
    const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
    tower.position.set(Math.cos(angle) * 8, 10, Math.sin(angle) * 8);
    g.add(tower);
    const spire = new THREE.Mesh(new THREE.ConeGeometry(1.5, 5, 6), pbrMat(0xffffff, { emissive: 0xaaccff, emi: 0.3 }));
    spire.position.set(tower.position.x, 22, tower.position.z);
    g.add(spire);
  }
  return g;
}

export function buildFrozenWaterfall() {
  const g = new THREE.Group();
  const ice = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 20),
    pbrMat(0xccddff, { roughness: 0.05, metalness: 0.2, transmission: 0.5, emissive: 0x88bbee, emi: 0.2 }),
  );
  ice.position.y = 10;
  g.add(ice);
  return g;
}

export function buildSnowBridge(length = 18) {
  const g = new THREE.Group();
  const deck = new THREE.Mesh(new THREE.BoxGeometry(length, 0.5, 3), pbrMat(0xf0f8ff, { roughness: 0.9 }));
  deck.position.y = 6;
  g.add(deck);
  [-1, 1].forEach((s) => {
    const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 10, 4), pbrMat(0xcccccc));
    cable.position.set(s * length * 0.35, 11, 0);
    g.add(cable);
  });
  return g;
}

export function buildAuroraBackdrop(bounds) {
  const g = new THREE.Group();
  const colors = [0x44ff88, 0x8844ff, 0x44aaff];
  colors.forEach((c, i) => {
    const band = new THREE.Mesh(
      new THREE.PlaneGeometry(bounds.spanX * 0.8, 25),
      new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }),
    );
    band.position.set(bounds.cx, 45 + i * 8, bounds.cz - bounds.spanZ * 0.4);
    band.rotation.x = -0.4;
    g.add(band);
  });
  return g;
}

// ── TRACK 7: Ancient Ruins ──────────────────────────────────────────────────

export function buildJunglePyramid() {
  const g = new THREE.Group();
  const steps = 5;
  for (let i = 0; i < steps; i++) {
    const sz = 16 - i * 2.5;
    const step = new THREE.Mesh(new THREE.BoxGeometry(sz, 2.5, sz), pbrMat(0x8b7355, { roughness: 0.85 }));
    step.position.y = 1.25 + i * 2.5;
    g.add(step);
  }
  const temple = new THREE.Mesh(new THREE.BoxGeometry(4, 6, 4), pbrMat(0x6a5a40));
  temple.position.y = steps * 2.5 + 3;
  g.add(temple);
  return g;
}

export function buildTempleGate() {
  const g = new THREE.Group();
  [-1, 1].forEach((s) => {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(2.5, 12, 2.5), pbrMat(0x9a8a70, { roughness: 0.8 }));
    pillar.position.set(s * 5, 6, 0);
    g.add(pillar);
  });
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(12, 2, 3), pbrMat(0x8a7a60));
  lintel.position.y = 12;
  g.add(lintel);
  return g;
}

export function buildRopeBridge(length = 16) {
  const g = new THREE.Group();
  const planks = Math.floor(length / 1.2);
  for (let i = 0; i < planks; i++) {
    const plank = new THREE.Mesh(new THREE.BoxGeometry(1, 0.15, 2.5), pbrMat(0x8b6914, { roughness: 0.9 }));
    plank.position.set(-length / 2 + i * 1.2, 5, 0);
    g.add(plank);
  }
  [-1, 1].forEach((s) => {
    const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, length, 4), pbrMat(0x8b7355));
    rope.rotation.z = Math.PI / 2;
    rope.position.set(0, 5.8, s * 1);
    g.add(rope);
  });
  return g;
}

export function buildStoneFaceCliff() {
  const g = new THREE.Group();
  const face = new THREE.Mesh(new THREE.BoxGeometry(12, 16, 2), pbrMat(0x7a6a50, { roughness: 0.9 }));
  face.position.y = 8;
  g.add(face);
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 8), pbrMat(0x4a4030));
  eyeL.position.set(-2.5, 10, 1.2);
  g.add(eyeL);
  const eyeR = eyeL.clone();
  eyeR.position.x = 2.5;
  g.add(eyeR);
  return g;
}

// ── TRACK 8: Stardust Galaxy ────────────────────────────────────────────────

export function buildAlienRuins() {
  const g = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const arch = new THREE.Mesh(
      new THREE.TorusGeometry(4 + i, 0.5, 6, 12, Math.PI),
      pbrMat(0xaa88ff, { emissive: 0x6644cc, emi: 0.6, metalness: 0.5 }),
    );
    arch.rotation.x = Math.PI / 2;
    arch.position.set((i - 2) * 4, 3 + i * 2, 0);
    g.add(arch);
  }
  return g;
}

export function buildCosmicObservatory() {
  const g = new THREE.Group();
  const dish = new THREE.Mesh(new THREE.SphereGeometry(6, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), pbrMat(0xccccff, { metalness: 0.8, roughness: 0.2 }));
  dish.rotation.x = Math.PI;
  dish.position.y = 10;
  g.add(dish);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(2, 3, 8, 10), pbrMat(0x666688, { metalness: 0.7 }));
  base.position.y = 4;
  g.add(base);
  return g;
}

export function buildCrystalSpaceBridge(length = 20) {
  const g = new THREE.Group();
  const deck = new THREE.Mesh(
    new THREE.BoxGeometry(length, 0.25, 2.5),
    pbrMat(0xaa88ff, { emissive: 0x8844ff, emi: 0.7, transparent: true, opacity: 0.85, transmission: 0.3 }),
  );
  deck.position.y = 6;
  g.add(deck);
  return g;
}

// ── TRACK 9: Meadow Valley ──────────────────────────────────────────────────

export function buildCoveredBridge() {
  const g = new THREE.Group();
  const deck = new THREE.Mesh(new THREE.BoxGeometry(14, 0.3, 4), pbrMat(0x8b6914));
  deck.position.y = 2;
  g.add(deck);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(14, 0.4, 5), pbrMat(0x8b2020, { roughness: 0.85 }));
  roof.position.y = 5.5;
  g.add(roof);
  [-1, 1].forEach((s) => {
    const wall = new THREE.Mesh(new THREE.BoxGeometry(14, 4, 0.3), pbrMat(0xffffff));
    wall.position.set(0, 3.5, s * 2);
    g.add(wall);
  });
  return g;
}

export function buildCastleRuins() {
  const g = new THREE.Group();
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(3, 4, 12, 10), pbrMat(0x999999, { roughness: 0.9 }));
  tower.position.set(-4, 6, 0);
  g.add(tower);
  const broken = new THREE.Mesh(new THREE.BoxGeometry(6, 8, 5), pbrMat(0x888888));
  broken.position.set(4, 4, 0);
  broken.rotation.z = 0.1;
  g.add(broken);
  return g;
}

export function buildLavenderField(width = 20) {
  const g = new THREE.Group();
  for (let i = 0; i < 80; i++) {
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.8 + Math.random() * 0.4, 3), pbrMat(0x9966cc, { emissive: 0x7744aa, emi: 0.15 }));
    stem.position.set((Math.random() - 0.5) * width, 0.4, (Math.random() - 0.5) * width * 0.6);
    g.add(stem);
  }
  return g;
}

export function buildSunflowerPatch() {
  const g = new THREE.Group();
  for (let i = 0; i < 15; i++) {
    const flower = new THREE.Group();
    const center = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.15, 8), pbrMat(0x4a3010));
    center.position.y = 1.2;
    flower.add(center);
    for (let p = 0; p < 8; p++) {
      const petal = new THREE.Mesh(new THREE.SphereGeometry(0.25, 6, 6), pbrMat(0xffcc00, { emissive: 0xffaa00, emi: 0.2 }));
      const a = (p / 8) * Math.PI * 2;
      petal.position.set(Math.cos(a) * 0.5, 1.2, Math.sin(a) * 0.5);
      flower.add(petal);
    }
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 1.2, 4), pbrMat(0x3a7a2a));
    stem.position.y = 0.6;
    flower.add(stem);
    flower.position.set((Math.random() - 0.5) * 12, 0, (Math.random() - 0.5) * 12);
    g.add(flower);
  }
  return g;
}

// ── TRACK 10: Shadow Metro ──────────────────────────────────────────────────

export function buildDerelictStation() {
  const g = new THREE.Group();
  const platform = new THREE.Mesh(new THREE.BoxGeometry(20, 0.5, 8), pbrMat(0x555555, { roughness: 0.9 }));
  platform.position.y = 0.25;
  g.add(platform);
  const columns = 4;
  for (let i = 0; i < columns; i++) {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 6, 8), pbrMat(0x666666));
    col.position.set(-8 + i * 5.5, 3.5, -3);
    g.add(col);
  }
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(8, 2), pbrMat(0xffff00, { emissive: 0xffff00, emi: 0.5 }));
  sign.position.set(0, 5, -3.5);
  g.add(sign);
  return g;
}

export function buildFloodedTunnel() {
  const g = new THREE.Group();
  const water = new THREE.Mesh(new THREE.BoxGeometry(12, 0.4, 6), pbrMat(0x224466, { roughness: 0.1, metalness: 0.5, transparent: true, opacity: 0.8 }));
  water.position.y = 0.2;
  g.add(water);
  const arch = new THREE.Mesh(new THREE.TorusGeometry(6, 0.5, 6, 12, Math.PI), pbrMat(0x444444));
  arch.rotation.z = Math.PI / 2;
  arch.position.y = 5;
  g.add(arch);
  return g;
}

export function buildSubwayTrain() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(14, 3.5, 2.8), pbrMat(0x888888, { metalness: 0.6, roughness: 0.5 }));
  body.position.y = 1.8;
  g.add(body);
  for (let i = 0; i < 5; i++) {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.2), pbrMat(0x88ccff, { emissive: 0x446688, emi: 0.3 }));
    win.position.set(-5 + i * 2.5, 2.2, 1.45);
    g.add(win);
  }
  return g;
}

export function buildVentilationFan(radius = 4) {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.3, 8, 24), pbrMat(0x666666, { metalness: 0.7 }));
  g.add(ring);
  const blades = new THREE.Group();
  for (let i = 0; i < 6; i++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(radius * 1.6, 0.15, 0.6), pbrMat(0x888888, { metalness: 0.6 }));
    blade.rotation.z = (i / 6) * Math.PI * 2;
    blades.add(blade);
  }
  blades.userData.spin = true;
  g.add(blades);
  return g;
}

export function buildGraffitiTrainCar() {
  const g = buildSubwayTrain();
  const graffiti = new THREE.Mesh(new THREE.PlaneGeometry(10, 2.5), pbrMat(0xff00ff, { emissive: 0xff00ff, emi: 0.4 }));
  graffiti.position.set(0, 2.5, 1.5);
  g.add(graffiti);
  return g;
}

// ── Shared infrastructure ───────────────────────────────────────────────────

export function buildTrackTunnel(curve, t, halfWidth, style = 'stone') {
  const g = new THREE.Group();
  const { pos, frame } = placeAtTrack(curve, t, 0, 0);
  const rot = frame.rot ?? 0;
  const colors = { stone: 0x666666, crystal: 0x224466, neon: 0x110022, metro: 0x333333 };
  const col = colors[style] || 0x555555;
  const arch = new THREE.Mesh(
    new THREE.TorusGeometry(halfWidth + 3, 0.6, 8, 16, Math.PI),
    pbrMat(col, style === 'neon' ? { emissive: 0xff00ff, emi: 0.6 } : {}),
  );
  arch.rotation.z = Math.PI / 2;
  arch.position.y = halfWidth + 2;
  g.add(arch);
  g.position.copy(pos);
  g.rotation.y = rot;
  return g;
}

export function scatterWildlife(world, bounds, type, count = 6) {
  for (let i = 0; i < count; i++) {
    let creature;
    if (type === 'dolphin') creature = buildDolphinLeap(0, 0);
    else if (type === 'bird') {
      creature = new THREE.Group();
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.3, 6, 6), pbrMat(0xffffff));
      creature.add(body);
      creature.userData.drift = 0.3 + Math.random() * 0.3;
    } else if (type === 'butterfly') {
      creature = new THREE.Mesh(new THREE.SphereGeometry(0.15, 4, 4), pbrMat(0xff88cc, { emissive: 0xff66aa, emi: 0.3 }));
      creature.userData.drift = 0.8;
    } else continue;
    creature.position.set(
      bounds.cx + (Math.random() - 0.5) * bounds.spanX * 0.8,
      type === 'dolphin' ? 0 : 3 + Math.random() * 8,
      bounds.cz + (Math.random() - 0.5) * bounds.spanZ * 0.8,
    );
    creature.userData.grazePhase = i;
    world.add(creature);
  }
}
