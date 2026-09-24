/**
 * MeadowHeroKit.js — Track 9: Meadow Valley Sprint (beginner countryside).
 */
import * as THREE from 'three';
import { placeAtTrack } from '../GameWorldBuilder.js';
import { pbrMat } from './BiomeAAAKit.js';
import { buildWideCheckeredStart } from './SunsetCoastHeroKit.js';
import { buildCheckpointArch, placeCheckpointArches, placeBoostPads, makePlaqueTexture } from './BiomeHeroShared.js';
import { getTrackStandard } from './CodeRacerTrackStandards.js';

export { buildWideCheckeredStart };

export function buildRedBarnHero() {
  const g = new THREE.Group();
  g.name = 'hero-red-barn';
  const body = new THREE.Mesh(new THREE.BoxGeometry(10, 6, 8), pbrMat(0xb22222, { roughness: 0.88 }));
  body.position.y = 3;
  g.add(body);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(7.5, 3.5, 4), pbrMat(0x5c3317, { roughness: 0.9 }));
  roof.position.y = 7.5;
  roof.rotation.y = Math.PI / 4;
  g.add(roof);
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 2),
    new THREE.MeshBasicMaterial({ map: makePlaqueTexture('VALLEY GP'), fog: false }),
  );
  sign.position.set(0, 4.5, 4.1);
  g.add(sign);
  return g;
}

export function buildWindmillLandmark() {
  const g = new THREE.Group();
  const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.6, 12, 10), pbrMat(0xf5f0e8, { roughness: 0.85 }));
  tower.position.y = 6;
  g.add(tower);
  const hub = new THREE.Mesh(new THREE.SphereGeometry(0.6, 8, 8), pbrMat(0x666666, { metalness: 0.4 }));
  hub.position.y = 12.5;
  g.add(hub);
  for (let b = 0; b < 4; b++) {
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.25, 6, 0.1), pbrMat(0xffffff));
    blade.position.set(0, 12.5, 3);
    blade.rotation.y = (b / 4) * Math.PI * 2;
    blade.userData.blade = true;
    g.add(blade);
  }
  g.userData.spin = true;
  return g;
}

export function buildRustyTractor() {
  const g = new THREE.Group();
  g.name = 'rusty-tractor';
  const rustMat = pbrMat(0xb22222, { roughness: 0.92, metalness: 0.15 });
  const tireMat = pbrMat(0x1a1a1a, { roughness: 0.95 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.4, 3.5), rustMat);
  body.position.y = 1.4;
  g.add(body);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.6, 1.6), rustMat);
  cabin.position.set(0, 2.6, -0.3);
  g.add(cabin);
  const hood = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.8, 1.8), rustMat);
  hood.position.set(0, 1.8, 1.6);
  g.add(hood);
  const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.2, 6), pbrMat(0x444444, { metalness: 0.5 }));
  exhaust.position.set(0.8, 3.2, 1.2);
  g.add(exhaust);
  [[-1.1, 1.8, 1.2], [1.1, 1.8, 1.2], [-1.1, 0.7, -1.2], [1.1, 0.7, -1.2]].forEach(([x, y, z]) => {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.35, 10), tireMat);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(x, y, z);
    g.add(wheel);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.4, 6), pbrMat(0x888888, { metalness: 0.6 }));
    hub.rotation.z = Math.PI / 2;
    hub.position.set(x, y, z);
    g.add(hub);
  });
  return g;
}

export function buildMeadowHills(bounds) {
  const g = new THREE.Group();
  g.name = 'meadow-hills';
  const hillSpecs = [
    { x: -0.35, z: -0.25, r: 18, y: -3 },
    { x: 0.3, z: 0.2, r: 22, y: -4 },
    { x: -0.15, z: 0.35, r: 15, y: -2.5 },
    { x: 0.4, z: -0.3, r: 20, y: -3.5 },
    { x: 0, z: 0, r: 25, y: -5 },
  ];
  hillSpecs.forEach(({ x, z, r, y }, i) => {
    const hill = new THREE.Mesh(
      new THREE.SphereGeometry(r, 16, 12),
      pbrMat(i % 2 ? 0x4a8a3a : 0x5a9e4a, { roughness: 0.92 }),
    );
    hill.position.set(
      bounds.cx + x * bounds.spanX * 0.8,
      y,
      bounds.cz + z * bounds.spanZ * 0.8,
    );
    hill.scale.set(1.6, 0.45, 1.4);
    g.add(hill);
  });
  return g;
}

export function buildWildflowerCluster(count = 80, spreadX = 14, spreadZ = 10) {
  const g = new THREE.Group();
  g.name = 'wildflower-cluster';
  const colors = [0xffd700, 0xff69b4, 0x6495ed, 0xff6347, 0xda70d6, 0xffa500];
  for (let i = 0; i < count; i++) {
    const sx = ((i * 37) % 100 / 100 - 0.5) * spreadX;
    const sz = ((i * 53) % 100 / 100 - 0.5) * spreadZ;
    const stemH = 0.35 + (i % 5) * 0.08;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, stemH, 4), pbrMat(0x228b22));
    stem.position.set(sx, stemH / 2, sz);
    g.add(stem);
    const bloom = new THREE.Mesh(
      new THREE.SphereGeometry(0.1 + (i % 3) * 0.03, 6, 6),
      pbrMat(colors[i % colors.length], { emissive: colors[i % colors.length], emi: 0.2 }),
    );
    bloom.position.set(sx, stemH + 0.05, sz);
    g.add(bloom);
  }
  return g;
}

export function buildStartHeroSet(curve, hw, finishT = 0) {
  const g = new THREE.Group();
  g.name = 'meadow-start-hero';
  const barn = buildRedBarnHero();
  const { pos: bp, frame: bf } = placeAtTrack(curve, finishT + 0.01, -(hw + 11), 0);
  barn.position.copy(bp);
  barn.rotation.y = (bf.rot ?? 0) + 0.3;
  g.add(barn);

  const flowers = buildWildflowerField(30);
  const { pos: fp } = placeAtTrack(curve, finishT + 0.02, hw + 7, 0);
  flowers.position.copy(fp);
  g.add(flowers);

  const arch = buildCheckpointArch(hw, 0x7cb342, { plaque: 'VALLEY GP' });
  const { pos: ap, frame: af } = placeAtTrack(curve, finishT + 0.045, 0, 0);
  arch.position.copy(ap);
  arch.rotation.y = af.rot ?? 0;
  g.add(arch);
  return g;
}

export function buildWildflowerField(count = 40) {
  return buildWildflowerCluster(count, 12, 8);
}

export function placeMeadowScenery(world, curve, hw, bounds) {
  // Authored rolling green hills — half-buried smooth spheres
  const hills = buildMeadowHills(bounds);
  world.add(hills);

  const windmill = buildWindmillLandmark();
  const { pos: wp } = placeAtTrack(curve, 0.3, -(hw + 18), 0);
  windmill.position.copy(wp);
  world.add(windmill);

  // Second red barn
  const barn2 = buildRedBarnHero();
  const { pos: b2p, frame: b2f } = placeAtTrack(curve, 0.68, hw + 14, 0);
  barn2.position.copy(b2p);
  barn2.rotation.y = (b2f.rot ?? 0) - 0.4;
  world.add(barn2);

  // Two rusty red tractors
  [0.22, 0.62].forEach((t, i) => {
    const tractor = buildRustyTractor();
    const side = i ? 1 : -1;
    const { pos, frame } = placeAtTrack(curve, t, side * (hw + 7), 0);
    tractor.position.copy(pos);
    tractor.rotation.y = (frame.rot ?? 0) + side * 0.3;
    world.add(tractor);
  });

  // Three dense wildflower clusters along track
  [0.12, 0.45, 0.78].forEach((t, i) => {
    const cluster = buildWildflowerCluster(70 + i * 15, 16, 11);
    const side = i % 2 ? 1 : -1;
    const { pos } = placeAtTrack(curve, t, side * (hw + 5), 0);
    cluster.position.copy(pos);
    world.add(cluster);
  });

  // Hay bales
  for (let i = 0; i < 16; i++) {
    const hay = new THREE.Mesh(
      new THREE.CylinderGeometry(1.1, 1.1, 1.5, 10),
      pbrMat(0xd4a574, { roughness: 0.92 }),
    );
    hay.rotation.z = Math.PI / 2;
    const { pos } = placeAtTrack(curve, 0.15 + (i / 16) * 0.7, (i % 2 ? 1 : -1) * (hw + 5), 0);
    hay.position.copy(pos);
    hay.position.y = 0.75;
    world.add(hay);
  }

  // Creek bridge
  const bridge = new THREE.Group();
  const deck = new THREE.Mesh(new THREE.BoxGeometry(12, 0.4, 4), pbrMat(0x8b6914, { roughness: 0.88 }));
  deck.position.y = 0.5;
  bridge.add(deck);
  [-5, 5].forEach((x) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.4, 2, 0.4), pbrMat(0x6b4423));
    post.position.set(x, 1, 0);
    bridge.add(post);
  });
  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(14, 6),
    pbrMat(0x4a90c2, { roughness: 0.1, metalness: 0.3, emissive: 0x1166aa, emi: 0.1 }),
  );
  water.rotation.x = -Math.PI / 2;
  water.position.y = -0.3;
  bridge.add(water);
  const { pos: brPos, frame: brF } = placeAtTrack(curve, 0.55, 0, 0);
  bridge.position.copy(brPos);
  bridge.rotation.y = brF.rot ?? 0;
  world.add(bridge);

  // Sheep
  for (let i = 0; i < 6; i++) {
    const sheep = new THREE.Group();
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.7, 10, 8), pbrMat(0xf5f5f0, { roughness: 0.95 }));
    body.scale.set(1.2, 0.9, 1.4);
    body.position.y = 0.6;
    sheep.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), pbrMat(0xf5f5f0));
    head.position.set(0, 0.7, 0.8);
    sheep.add(head);
    const { pos: sp } = placeAtTrack(curve, 0.78 + i * 0.02, hw + 8 + i, 0);
    sheep.position.copy(sp);
    world.add(sheep);
  }

  // Market stand
  const stand = new THREE.Mesh(new THREE.BoxGeometry(3, 2.5, 2), pbrMat(0x8b6914));
  stand.position.y = 1.25;
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(3.5, 1),
    new THREE.MeshBasicMaterial({ map: makePlaqueTexture('VALLEY GRAND PRIX'), fog: false }),
  );
  sign.position.set(0, 2.8, 1.1);
  stand.add(sign);
  const { pos: stPos, frame: stF } = placeAtTrack(curve, 0.4, hw + 9, 0);
  stand.position.copy(stPos);
  stand.rotation.y = stF.rot ?? 0;
  world.add(stand);

  // Wooden fences along track
  for (let i = 0; i < 20; i++) {
    const t = 0.05 + (i / 20) * 0.9;
    const side = i % 2 ? 1 : -1;
    const { pos, frame } = placeAtTrack(curve, t, side * (hw + 3.5), 0);
    const fence = new THREE.Mesh(new THREE.BoxGeometry(2, 1.2, 0.15), pbrMat(0x8b6914, { roughness: 0.9 }));
    fence.position.copy(pos);
    fence.position.y = 0.6;
    fence.rotation.y = frame.rot ?? 0;
    world.add(fence);
  }
}

export function placeMeadowCheckpoints(world, curve, hw) {
  const std = getTrackStandard('forest_maze_01');
  placeCheckpointArches(world, curve, hw, std.checkpointTs, std.checkpointColors);
  placeBoostPads(world, curve, std.boostTs);
}

export function animateMeadow(world, time) {
  world.traverse((o) => {
    if (o.userData?.blade) o.rotation.y += 0.025;
  });
}
