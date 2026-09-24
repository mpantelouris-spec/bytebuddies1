/**
 * SkyGardenHeroKit.js — Track 3: Sky Garden Ascent (floating islands, giant flower, gold rails).
 */
import * as THREE from 'three';
import { placeAtTrack } from '../GameWorldBuilder.js';
import { pbrMat } from './BiomeAAAKit.js';
import { buildWideCheckeredStart } from './SunsetCoastHeroKit.js';
import { buildCheckpointArch, placeCheckpointArches, placeBoostPads, makePlaqueTexture } from './BiomeHeroShared.js';
import { getTrackStandard } from './CodeRacerTrackStandards.js';

export { buildWideCheckeredStart };

function glowMat(color, emi = 2.0) {
  return pbrMat(color, { emissive: color, emi, roughness: 0.2, metalness: 0.15 });
}

export function buildGiantFlower(petalColor = 0xff69b4, scale = 1, centerColor = 0xffd700) {
  const g = new THREE.Group();
  g.name = 'hero-giant-flower';
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.6 * scale, 0.9 * scale, 12 * scale, 10),
    pbrMat(0x2d8f4e, { roughness: 0.8 }),
  );
  stem.position.y = 6 * scale;
  g.add(stem);
  for (let i = 0; i < 8; i++) {
    const petal = new THREE.Mesh(
      new THREE.SphereGeometry(3.5 * scale, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2),
      glowMat(petalColor, 1.2),
    );
    const a = (i / 8) * Math.PI * 2;
    petal.position.set(Math.cos(a) * 4 * scale, 12 * scale, Math.sin(a) * 4 * scale);
    petal.rotation.y = a;
    petal.scale.set(1.2, 0.5, 1.2);
    g.add(petal);
  }
  const center = new THREE.Mesh(
    new THREE.SphereGeometry(2.2 * scale, 14, 12),
    glowMat(centerColor, 3.5),
  );
  center.position.y = 12 * scale;
  g.add(center);
  g.add(new THREE.PointLight(centerColor, 4, 40).translateY(12 * scale));
  return g;
}

export function buildGiantPinkFlower(scale = 1) {
  return buildGiantFlower(0xff69b4, scale);
}

export function buildFloatingIslandDetailed(radius = 8) {
  const g = new THREE.Group();
  g.name = 'floating-island';
  const top = new THREE.Mesh(
    new THREE.CylinderGeometry(radius, radius * 1.15, 3, 14),
    pbrMat(0x4a8a3a, { roughness: 0.82 }),
  );
  top.position.y = 0;
  g.add(top);
  const grass = new THREE.Mesh(
    new THREE.CylinderGeometry(radius * 0.92, radius, 0.6, 14),
    pbrMat(0x5a9e3a, { roughness: 0.88 }),
  );
  grass.position.y = 1.5;
  g.add(grass);
  const underside = new THREE.Mesh(
    new THREE.ConeGeometry(radius * 0.85, 6, 12),
    pbrMat(0x6b5a4a, { roughness: 0.95 }),
  );
  underside.rotation.x = Math.PI;
  underside.position.y = -4.5;
  g.add(underside);
  for (let v = 0; v < 5; v++) {
    const vine = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.12, 4 + (v % 2) * 2, 6),
      pbrMat(0x2d6a2e, { roughness: 0.9 }),
    );
    const a = (v / 5) * Math.PI * 2;
    vine.position.set(Math.cos(a) * radius * 0.7, -2.5, Math.sin(a) * radius * 0.7);
    vine.rotation.x = 0.25 + (v % 3) * 0.1;
    vine.rotation.z = Math.cos(a) * 0.2;
    g.add(vine);
  }
  return g;
}

export function buildTinyCastle() {
  const g = new THREE.Group();
  g.name = 'tiny-castle';
  const wallMat = pbrMat(0xd4c4a8, { roughness: 0.88 });
  const roofMat = pbrMat(0x4a6fa5, { roughness: 0.75 });
  const keep = new THREE.Mesh(new THREE.BoxGeometry(3, 4, 3), wallMat);
  keep.position.y = 2;
  g.add(keep);
  const keepRoof = new THREE.Mesh(new THREE.ConeGeometry(2.2, 2, 4), roofMat);
  keepRoof.position.y = 5;
  keepRoof.rotation.y = Math.PI / 4;
  g.add(keepRoof);
  [-1.8, 1.8].forEach((x) => {
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 5, 8), wallMat);
    tower.position.set(x, 2.5, 1.6);
    g.add(tower);
    const tRoof = new THREE.Mesh(new THREE.ConeGeometry(0.9, 1.5, 8), roofMat);
    tRoof.position.set(x, 5.5, 1.6);
    g.add(tRoof);
  });
  const flag = new THREE.Mesh(
    new THREE.PlaneGeometry(1.2, 0.7),
    new THREE.MeshBasicMaterial({ color: 0xff69b4, fog: false, side: THREE.DoubleSide }),
  );
  flag.position.set(0.6, 6.2, 0);
  g.add(flag);
  return g;
}

export function buildCloudRamp() {
  const g = new THREE.Group();
  g.name = 'cloud-ramp';
  const cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.82, fog: false });
  for (let i = 0; i < 5; i++) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(3 + i * 0.4, 10, 8), cloudMat);
    puff.position.set(i * 2.8 - 5.6, i * 0.9, (i % 2) * 0.6 - 0.3);
    puff.scale.set(1.6, 0.7 + i * 0.08, 1.3);
    g.add(puff);
  }
  const ramp = new THREE.Mesh(new THREE.BoxGeometry(14, 0.5, 5), cloudMat);
  ramp.position.set(0, 2.5, 0);
  ramp.rotation.x = -0.28;
  g.add(ramp);
  return g;
}

export function buildMushroomGrove() {
  const g = new THREE.Group();
  const caps = [0x9b59b6, 0xff4444, 0x3498db, 0xff69b4, 0x2ecc71];
  caps.forEach((col, i) => {
    const h = 2.5 + (i % 3) * 1.5;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.55, h, 8), pbrMat(0xf5f0e8));
    stem.position.set((i - 2) * 2.2, h / 2, (i % 2) * 1.5);
    g.add(stem);
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(1.2 + (i % 2) * 0.4, 10, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      glowMat(col, 1.8),
    );
    cap.position.set(stem.position.x, h + 0.3, stem.position.z);
    cap.scale.set(1.3, 0.7, 1.3);
    g.add(cap);
  });
  return g;
}

export function buildTreehouseBanner() {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.2, 6, 10), pbrMat(0x6b4423));
  trunk.position.y = 3;
  g.add(trunk);
  const house = new THREE.Mesh(new THREE.BoxGeometry(5, 3.5, 4), pbrMat(0x8b6914, { roughness: 0.85 }));
  house.position.y = 7;
  g.add(house);
  const banner = new THREE.Mesh(
    new THREE.PlaneGeometry(4.5, 1.2),
    new THREE.MeshBasicMaterial({ map: makePlaqueTexture('SKY EXPLORERS'), fog: false }),
  );
  banner.position.set(0, 9.2, 2.2);
  g.add(banner);
  const ladder = new THREE.Mesh(new THREE.BoxGeometry(0.15, 5, 0.15), pbrMat(0x8b6914));
  ladder.position.set(2.5, 4, 1.8);
  g.add(ladder);
  return g;
}

export function buildRopeBridge(span = 35) {
  const g = new THREE.Group();
  const ropeMat = pbrMat(0xc4a574, { roughness: 0.9 });
  [-span / 2, span / 2].forEach((x) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 8, 8), ropeMat);
    post.position.set(x, 4, 0);
    g.add(post);
  });
  const deck = new THREE.Mesh(new THREE.BoxGeometry(span, 0.35, 2.5), pbrMat(0x8b6914, { roughness: 0.88 }));
  deck.position.y = 3.5;
  g.add(deck);
  for (let i = 0; i < 12; i++) {
    const rx = -span / 2 + (i / 11) * span;
    const sag = Math.sin((i / 11) * Math.PI) * 1.2;
    const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2, 4), ropeMat);
    rope.position.set(rx, 6 - sag, 1.2);
    rope.rotation.z = Math.PI / 2;
    g.add(rope);
  }
  return g;
}

export function buildCloudLayerBelow(bounds) {
  const g = new THREE.Group();
  g.name = 'cloud-layer-below';
  for (let i = 0; i < 10; i++) {
    const cloud = new THREE.Mesh(
      new THREE.SphereGeometry(6 + (i % 3) * 2, 8, 6),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.38, fog: false }),
    );
    cloud.position.set(
      bounds.cx + (Math.sin(i * 2.1) * 0.5) * bounds.spanX * 0.85,
      -32 - (i % 3) * 5,
      bounds.cz + (Math.cos(i * 1.7) * 0.5) * bounds.spanZ * 0.85,
    );
    cloud.scale.set(1.6, 0.45, 1.4);
    g.add(cloud);
  }
  return g;
}

export function buildGoldRails(curve, hw, lengthT = 1) {
  const g = new THREE.Group();
  g.name = 'gold-rails';
  const railMat = pbrMat(0xffd700, { metalness: 0.85, roughness: 0.18, emissive: 0xffd700, emi: 0.35 });
  const steps = 80;
  [-hw * 0.35, hw * 0.35].forEach((off) => {
    for (let i = 0; i < steps; i++) {
      const t = (i / steps) * lengthT;
      const { pos, frame } = placeAtTrack(curve, t, off, 0.12);
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.14, 2.2), railMat);
      rail.position.copy(pos);
      rail.rotation.y = frame.rot ?? 0;
      g.add(rail);
    }
  });
  return g;
}

export function buildStartHeroSet(curve, hw, finishT = 0) {
  const g = new THREE.Group();
  g.name = 'sky-start-hero';
  const flower = buildGiantPinkFlower(1.1);
  const { pos: fp, frame: ff } = placeAtTrack(curve, finishT + 0.01, -(hw + 12), 0);
  flower.position.copy(fp);
  flower.rotation.y = (ff.rot ?? 0) + 0.2;
  g.add(flower);

  const mushrooms = buildMushroomGrove();
  const { pos: mp } = placeAtTrack(curve, finishT + 0.02, hw + 8, 0);
  mushrooms.position.copy(mp);
  g.add(mushrooms);

  const arch = buildCheckpointArch(hw, 0x00fa9a, { plaque: 'CLOUD KINGDOM' });
  const { pos: ap, frame: af } = placeAtTrack(curve, finishT + 0.045, 0, 0);
  arch.position.copy(ap);
  arch.rotation.y = af.rot ?? 0;
  g.add(arch);

  const bridge = buildRopeBridge(38);
  const { pos: bp, frame: bf } = placeAtTrack(curve, finishT + 0.14, 0, 0);
  bridge.position.copy(bp);
  bridge.rotation.y = bf.rot ?? 0;
  g.add(bridge);
  return g;
}

export function placeSkyGardenScenery(world, curve, hw, bounds) {
  const treehouse = buildTreehouseBanner();
  const { pos: tp, frame: tf } = placeAtTrack(curve, 0.35, hw + 10, 0);
  treehouse.position.copy(tp);
  treehouse.rotation.y = (tf.rot ?? 0) + Math.PI;
  world.add(treehouse);

  // Eight giant flowers along the track — varied colors and scales
  const flowerSpecs = [
    { t: 0.08, side: -1, color: 0xff69b4, scale: 0.75 },
    { t: 0.16, side: 1, color: 0xda70d6, scale: 0.9 },
    { t: 0.24, side: -1, color: 0xffd700, scale: 0.65, center: 0xff8c00 },
    { t: 0.38, side: 1, color: 0xff6347, scale: 0.85 },
    { t: 0.48, side: -1, color: 0x6495ed, scale: 0.7, center: 0x87ceeb },
    { t: 0.58, side: 1, color: 0xff1493, scale: 1.0 },
    { t: 0.72, side: -1, color: 0xffa07a, scale: 0.8 },
    { t: 0.84, side: 1, color: 0xee82ee, scale: 0.95 },
  ];
  flowerSpecs.forEach(({ t, side, color, scale, center }) => {
    const flower = buildGiantFlower(color, scale, center ?? 0xffd700);
    const { pos, frame } = placeAtTrack(curve, t, side * (hw + 9), 0);
    flower.position.copy(pos);
    flower.rotation.y = (frame.rot ?? 0) + side * 0.15;
    world.add(flower);
  });

  // Windmill background — blades spin via userData.blade
  const windmill = new THREE.Group();
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.4, 10, 10), pbrMat(0xf5f0e8));
  tower.position.y = 5;
  windmill.add(tower);
  const hub = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), pbrMat(0x888888, { metalness: 0.5 }));
  hub.position.y = 10.5;
  windmill.add(hub);
  for (let b = 0; b < 4; b++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.2, 5, 0.08), pbrMat(0xffffff));
    blade.position.set(0, 10.5, 2.5);
    blade.rotation.y = (b / 4) * Math.PI * 2;
    blade.userData.blade = true;
    windmill.add(blade);
  }
  windmill.position.set(bounds.cx + bounds.spanX * 0.35, 0, bounds.cz - bounds.spanZ * 0.3);
  windmill.userData.spin = true;
  world.add(windmill);

  // Rainbow arc
  const rainbow = new THREE.Mesh(
    new THREE.TorusGeometry(45, 1.2, 8, 48, Math.PI),
    new THREE.MeshBasicMaterial({ color: 0xff69b4, transparent: true, opacity: 0.35, fog: false }),
  );
  rainbow.rotation.x = Math.PI / 2;
  rainbow.rotation.z = -Math.PI / 4;
  rainbow.position.set(bounds.cx + 30, 25, bounds.cz - 20);
  world.add(rainbow);

  // Floating islands with visible undersides and hanging vines
  const islandRadii = [7, 9, 6.5, 8.5];
  for (let i = 0; i < 4; i++) {
    const island = buildFloatingIslandDetailed(islandRadii[i]);
    const angle = (i / 4) * Math.PI * 2 + 0.3;
    island.position.set(bounds.cx + Math.cos(angle) * 50, -5, bounds.cz + Math.sin(angle) * 50);
    world.add(island);
    if (i === 2) {
      const castle = buildTinyCastle();
      castle.position.copy(island.position);
      castle.position.y += 2;
      castle.scale.set(1.4, 1.4, 1.4);
      world.add(castle);
    }
  }

  // Cloud ramp launch near finish
  const cloudRamp = buildCloudRamp();
  const { pos: crPos, frame: crF } = placeAtTrack(curve, 0.93, 0, 0);
  cloudRamp.position.copy(crPos);
  cloudRamp.position.y += 1.5;
  cloudRamp.rotation.y = crF.rot ?? 0;
  world.add(cloudRamp);

  // Waterfalls with mist spheres
  [0.25, 0.5, 0.75].forEach((t) => {
    const { pos } = placeAtTrack(curve, t, hw + 6, 0);
    const fall = new THREE.Mesh(
      new THREE.PlaneGeometry(3, 14),
      new THREE.MeshBasicMaterial({ color: 0xaaddff, transparent: true, opacity: 0.6, fog: false }),
    );
    fall.position.set(pos.x, 7, pos.z);
    world.add(fall);
    for (let m = 0; m < 8; m++) {
      const mist = new THREE.Mesh(
        new THREE.SphereGeometry(0.6 + (m % 3) * 0.3, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xccddff, transparent: true, opacity: 0.35, fog: false }),
      );
      mist.position.set(
        pos.x + (m % 4 - 1.5) * 1.2,
        1.5 + (m % 3) * 1.8,
        pos.z + (Math.floor(m / 4) - 0.5) * 2,
      );
      mist.scale.set(1.4, 0.8, 1.4);
      world.add(mist);
    }
  });
}

export function placeSkyCheckpoints(world, curve, hw) {
  const std = getTrackStandard('sky_island_01');
  placeCheckpointArches(world, curve, hw, std.checkpointTs, std.checkpointColors);
  placeBoostPads(world, curve, std.boostTs);
}

export function animateSkyGarden(world, time) {
  world.traverse((o) => {
    if (o.userData?.blade) o.rotation.y += 0.02;
    if (o.userData?.spin && o.parent?.userData?.spin) {
      o.children.forEach((c) => { if (c.userData?.blade) c.rotation.y += 0.03; });
    }
  });
}
