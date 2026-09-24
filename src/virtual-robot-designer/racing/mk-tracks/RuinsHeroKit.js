/**
 * RuinsHeroKit.js — Track 7: Ancient Ruins Raceway (jungle temple).
 */
import * as THREE from 'three';
import { placeAtTrack } from '../GameWorldBuilder.js';
import { pbrMat } from './BiomeAAAKit.js';
import { buildWideCheckeredStart } from './SunsetCoastHeroKit.js';
import { buildCheckpointArch, placeCheckpointArches, placeBoostPads, makePlaqueTexture } from './BiomeHeroShared.js';
import { getTrackStandard } from './CodeRacerTrackStandards.js';

export { buildWideCheckeredStart };

export function buildTempleGate() {
  const g = new THREE.Group();
  g.name = 'temple-gate';
  const mat = pbrMat(0x6b5a4a, { roughness: 0.9 });
  const goldMat = pbrMat(0xffd700, { metalness: 0.7, roughness: 0.35, emissive: 0xffd700, emi: 0.25 });
  [-8, 8].forEach((x) => {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(2.5, 14, 2.5), mat);
    pillar.position.set(x, 7, 0);
    g.add(pillar);
  });
  const lintel = new THREE.Mesh(new THREE.BoxGeometry(18, 2, 2.5), mat);
  lintel.position.y = 14;
  g.add(lintel);
  const jaguar = new THREE.Mesh(new THREE.PlaneGeometry(6, 2.2), new THREE.MeshBasicMaterial({
    map: makePlaqueTexture('JAGUAR GATE'), fog: false,
  }));
  jaguar.position.set(0, 14.2, 1.3);
  g.add(jaguar);
  const goldTrim = new THREE.Mesh(new THREE.TorusGeometry(7, 0.3, 8, 32, Math.PI), goldMat);
  goldTrim.rotation.x = Math.PI / 2;
  goldTrim.rotation.z = Math.PI;
  goldTrim.position.y = 10;
  g.add(goldTrim);
  return g;
}

export function buildAnimalStatue(animal = 'jaguar') {
  const stoneMat = pbrMat(0x8a7a6a, { roughness: 0.92, metalness: 0.1 });
  const accentColors = { jaguar: 0xffd700, parrot: 0xff4444, turtle: 0x5a8a5a, monkey: 0x9a7a5a };
  const accent = pbrMat(accentColors[animal] || 0xffd700, { metalness: 0.35, roughness: 0.6 });
  const g = new THREE.Group();
  g.name = `statue-${animal}`;

  if (animal === 'jaguar') {
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.2, 3.5), stoneMat);
    body.position.y = 1.4;
    g.add(body);
    const head = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.1, 1.6), stoneMat);
    head.position.set(0, 1.8, 2.2);
    g.add(head);
    const earL = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.5, 4), accent);
    earL.position.set(-0.5, 2.5, 2.4);
    g.add(earL);
    const earR = earL.clone();
    earR.position.x = 0.5;
    g.add(earR);
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), pbrMat(0x7cfc00, { emissive: 0x7cfc00, emi: 0.9 }));
    eyeL.position.set(-0.35, 2.0, 2.9);
    g.add(eyeL);
    const eyeR = eyeL.clone();
    eyeR.position.x = 0.35;
    g.add(eyeR);
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.25, 2.5, 6), stoneMat);
    tail.position.set(0, 1.6, -2.2);
    tail.rotation.x = -0.6;
    g.add(tail);
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.2, 0.8, 10), stoneMat);
    pedestal.position.y = 0.4;
    g.add(pedestal);
  } else if (animal === 'parrot') {
    const perch = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 3.5, 6), pbrMat(0x6b4423));
    perch.position.y = 1.75;
    g.add(perch);
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.9, 10, 8), stoneMat);
    body.scale.set(0.9, 1.3, 0.8);
    body.position.y = 2.8;
    g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.55, 8, 8), stoneMat);
    head.position.set(0, 3.6, 0.5);
    g.add(head);
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.6, 4), accent);
    beak.rotation.x = Math.PI / 2;
    beak.position.set(0, 3.5, 1.1);
    g.add(beak);
    const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.2, 0.8), accent);
    wingL.position.set(-0.7, 2.9, 0);
    wingL.rotation.z = 0.4;
    g.add(wingL);
    const wingR = wingL.clone();
    wingR.position.x = 0.7;
    wingR.rotation.z = -0.4;
    g.add(wingR);
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.8, 0.6, 10), stoneMat);
    pedestal.position.y = 0.3;
    g.add(pedestal);
  } else if (animal === 'turtle') {
    const shell = new THREE.Mesh(new THREE.SphereGeometry(1.4, 12, 10), stoneMat);
    shell.scale.set(1.3, 0.7, 1.5);
    shell.position.y = 1.5;
    g.add(shell);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 8), stoneMat);
    head.position.set(0, 1.2, 1.8);
    g.add(head);
    [[-1, 0.6], [1, 0.6], [-0.8, -1], [0.8, -1]].forEach(([x, z]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 0.6, 6), stoneMat);
      leg.position.set(x, 0.5, z);
      g.add(leg);
    });
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(2, 2.4, 0.7, 10), stoneMat);
    pedestal.position.y = 0.35;
    g.add(pedestal);
  } else {
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 1.8, 10), stoneMat);
    body.position.y = 1.6;
    g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.7, 10, 8), stoneMat);
    head.position.set(0, 2.4, 0.6);
    g.add(head);
    const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 2.2, 6), stoneMat);
    armL.position.set(-1.1, 1.8, 0.5);
    armL.rotation.z = 0.8;
    g.add(armL);
    const armR = armL.clone();
    armR.position.x = 1.1;
    armR.rotation.z = -0.8;
    g.add(armR);
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.1, 1.5, 6), stoneMat);
    tail.position.set(0, 0.8, -1);
    tail.rotation.x = -0.5;
    g.add(tail);
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 2, 0.7, 10), stoneMat);
    pedestal.position.y = 0.35;
    g.add(pedestal);
  }
  g.scale.setScalar(1.1);
  return g;
}

export function buildRuinsRopeBridge(span = 28) {
  const g = new THREE.Group();
  g.name = 'ruins-rope-bridge';
  const ropeMat = pbrMat(0x8b7355, { roughness: 0.92 });
  const plankMat = pbrMat(0x6b4423, { roughness: 0.88 });
  [-span / 2, span / 2].forEach((x) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 9, 8), ropeMat);
    post.position.set(x, 4.5, 0);
    g.add(post);
  });
  const deck = new THREE.Mesh(new THREE.BoxGeometry(span, 0.3, 2.2), plankMat);
  deck.position.y = 4;
  g.add(deck);
  for (let i = 0; i < 10; i++) {
    const rx = -span / 2 + (i / 9) * span;
    const sag = Math.sin((i / 9) * Math.PI) * 1.5;
    const rope = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.8, 4), ropeMat);
    rope.position.set(rx, 7.5 - sag, 1);
    rope.rotation.z = Math.PI / 2;
    g.add(rope);
  }
  return g;
}

export function buildArchaeologistCamp() {
  const g = new THREE.Group();
  g.name = 'archaeologist-camp';
  const tent = new THREE.Mesh(new THREE.ConeGeometry(2.5, 3, 4), pbrMat(0xc4a574, { roughness: 0.9 }));
  tent.position.set(-2, 1.5, 0);
  g.add(tent);
  const crate = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1, 1.2), pbrMat(0x8b6914));
  crate.position.set(2, 0.5, 1);
  g.add(crate);
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.2, 8), pbrMat(0x6b4423));
  barrel.position.set(2.5, 0.6, -0.8);
  g.add(barrel);
  const fire = new THREE.Mesh(
    new THREE.ConeGeometry(0.6, 1.2, 6),
    pbrMat(0xff6600, { emissive: 0xff4400, emi: 1.5 }),
  );
  fire.position.set(0, 0.6, 2);
  g.add(fire);
  g.add(new THREE.PointLight(0xff6600, 3, 12).translateX(0).translateY(1).translateZ(2));
  const tablet = new THREE.Mesh(
    new THREE.PlaneGeometry(3, 1.8),
    new THREE.MeshBasicMaterial({ map: makePlaqueTexture('RACE THE RUINS'), fog: false }),
  );
  tablet.position.set(0, 2.2, 3.2);
  g.add(tablet);
  const shovel = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.8, 0.1), pbrMat(0x888888, { metalness: 0.5 }));
  shovel.position.set(-3.5, 0.9, 1.5);
  shovel.rotation.z = 0.3;
  g.add(shovel);
  return g;
}

export function buildStartHeroSet(curve, hw, finishT = 0) {
  const g = new THREE.Group();
  const gate = buildTempleGate();
  const { pos: gp, frame: gf } = placeAtTrack(curve, finishT + 0.05, 0, 0);
  gate.position.copy(gp);
  gate.rotation.y = gf.rot ?? 0;
  g.add(gate);

  ['jaguar', 'parrot'].forEach((animal, i) => {
    const stat = buildAnimalStatue(animal);
    const { pos } = placeAtTrack(curve, finishT + 0.02, (i ? 1 : -1) * (hw + 6), 0);
    stat.position.copy(pos);
    g.add(stat);
  });
  return g;
}

export function placeRuinsScenery(world, curve, hw, bounds) {
  // Four stone animal statues at track corners (~3 m tall)
  const cornerAnimals = ['jaguar', 'parrot', 'turtle', 'monkey'];
  const cornerTs = [0.05, 0.3, 0.65, 0.9];
  cornerAnimals.forEach((animal, i) => {
    const stat = buildAnimalStatue(animal);
    const side = i % 2 ? 1 : -1;
    const { pos, frame } = placeAtTrack(curve, cornerTs[i], side * (hw + 10), 0);
    stat.position.copy(pos);
    stat.rotation.y = (frame.rot ?? 0) + Math.PI * 0.5 * side;
    world.add(stat);
  });

  // 14 broken pillars in courtyard section (t 0.18–0.42)
  for (let i = 0; i < 14; i++) {
    const h = 2 + (i % 4) * 1.2;
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.8, h, 8), pbrMat(0x6b5a4a, { roughness: 0.92 }));
    const courtT = 0.18 + (i / 13) * 0.24;
    const { pos, frame } = placeAtTrack(curve, courtT, (i % 2 ? 1 : -1) * (hw + 6 + (i % 3)), 0);
    pillar.position.copy(pos);
    pillar.position.y = h / 2;
    pillar.rotation.z = (i % 3) * 0.15;
    pillar.rotation.y = (frame.rot ?? 0) + (i % 5) * 0.08;
    world.add(pillar);
  }

  // Jungle canopy tunnel darkening at t ≈ 0.35
  const canopyGroup = new THREE.Group();
  canopyGroup.name = 'jungle-canopy-tunnel';
  for (let i = 0; i < 12; i++) {
    const leaf = new THREE.Mesh(
      new THREE.BoxGeometry(5 + (i % 3), 0.4, 4 + (i % 2)),
      pbrMat(0x1a4a1a, { roughness: 0.95 }),
    );
    const t = 0.28 + (i / 11) * 0.14;
    const { pos, frame } = placeAtTrack(curve, t, (i % 2 ? 1 : -1) * (hw + 2), 0);
    leaf.position.copy(pos);
    leaf.position.y = 9 + (i % 3) * 1.5;
    leaf.rotation.y = frame.rot ?? 0;
    leaf.rotation.x = -0.15;
    canopyGroup.add(leaf);
  }
  const overhead = new THREE.Mesh(
    new THREE.BoxGeometry(hw * 3.5, 0.5, 22),
    pbrMat(0x0d2b0d, { roughness: 0.98 }),
  );
  const { pos: canPos, frame: canF } = placeAtTrack(curve, 0.35, 0, 0);
  overhead.position.copy(canPos);
  overhead.position.y = 11;
  overhead.rotation.y = canF.rot ?? 0;
  canopyGroup.add(overhead);
  world.add(canopyGroup);

  // Firefly Points inside canopy tunnel
  const flyPositions = [];
  for (let i = 0; i < 60; i++) {
    const t = 0.3 + (i / 59) * 0.1;
    const { pos } = placeAtTrack(curve, t, (i % 2 ? 1 : -1) * (hw * 0.4 + (i % 5)), 0);
    flyPositions.push(pos.x, 2 + (i % 7) * 0.8, pos.z);
  }
  const flyGeo = new THREE.BufferGeometry();
  flyGeo.setAttribute('position', new THREE.Float32BufferAttribute(flyPositions, 3));
  const flyPoints = new THREE.Points(
    flyGeo,
    new THREE.PointsMaterial({ color: 0xffff88, size: 0.35, transparent: true, opacity: 0.9, fog: false }),
  );
  flyPoints.userData.fireflyPoints = true;
  flyPoints.userData.basePositions = flyPositions.slice();
  world.add(flyPoints);

  // Archaeologist camp with "RACE THE RUINS" tablet
  const camp = buildArchaeologistCamp();
  const { pos: cp, frame: cf } = placeAtTrack(curve, 0.35, hw + 11, 0);
  camp.position.copy(cp);
  camp.rotation.y = cf.rot ?? 0;
  world.add(camp);

  // Stone bridge over waterfall
  const bridge = new THREE.Group();
  bridge.name = 'stone-waterfall-bridge';
  const stoneMat = pbrMat(0x6b5a4a, { roughness: 0.9 });
  const deck = new THREE.Mesh(new THREE.BoxGeometry(20, 0.8, 5), stoneMat);
  deck.position.y = 3;
  bridge.add(deck);
  [-9, 9].forEach((x) => {
    const arch = new THREE.Mesh(new THREE.TorusGeometry(2.5, 0.5, 8, 12, Math.PI), stoneMat);
    arch.position.set(x, 1.5, 0);
    arch.rotation.y = Math.PI / 2;
    bridge.add(arch);
    const rail = new THREE.Mesh(new THREE.BoxGeometry(20, 0.4, 0.3), stoneMat);
    rail.position.set(0, 3.8, x > 0 ? 2.6 : -2.6);
    bridge.add(rail);
  });
  const fall = new THREE.Mesh(
    new THREE.PlaneGeometry(5, 14),
    new THREE.MeshBasicMaterial({ color: 0xaaddff, transparent: true, opacity: 0.65, fog: false }),
  );
  fall.position.set(0, 5, -4);
  bridge.add(fall);
  for (let m = 0; m < 6; m++) {
    const mist = new THREE.Mesh(
      new THREE.SphereGeometry(0.8, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xccddff, transparent: true, opacity: 0.3, fog: false }),
    );
    mist.position.set((m % 3 - 1) * 2, 1.2, -3.5);
    mist.scale.set(1.5, 0.7, 1.5);
    bridge.add(mist);
  }
  const { pos: brPos, frame: brF } = placeAtTrack(curve, 0.55, 0, 0);
  bridge.position.copy(brPos);
  bridge.rotation.y = brF.rot ?? 0;
  world.add(bridge);

  // Rope bridge shortcut
  const ropeBridge = buildRuinsRopeBridge(32);
  const { pos: rbPos, frame: rbF } = placeAtTrack(curve, 0.72, -(hw + 4), 0);
  ropeBridge.position.copy(rbPos);
  ropeBridge.rotation.y = (rbF.rot ?? 0) + Math.PI * 0.5;
  world.add(ropeBridge);

  // Dense foliage clusters — 45 fern/bush spheres
  for (let i = 0; i < 45; i++) {
    const isFern = i % 3 === 0;
    const bush = new THREE.Mesh(
      new THREE.SphereGeometry(0.7 + (i % 5) * 0.25, 8, 8),
      pbrMat(isFern ? 0x1e5a1e : 0x2d6a2e, { roughness: 0.9 }),
    );
    const t = 0.04 + ((i * 17) % 90) / 100;
    const side = i % 2 ? 1 : -1;
    const { pos } = placeAtTrack(curve, t, side * (hw + 3.5 + (i % 6) * 0.8), 0);
    bush.position.copy(pos);
    bush.position.y = 0.5 + (i % 4) * 0.15;
    bush.scale.set(1, isFern ? 1.4 : 0.7, 1);
    world.add(bush);
  }

  // Ambient fireflies across ruins
  for (let i = 0; i < 40; i++) {
    const fly = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 6, 6),
      pbrMat(0xffff88, { emissive: 0xffff44, emi: 2.0 }),
    );
    fly.position.set(
      bounds.cx + ((i * 13) % 100 / 100 - 0.5) * bounds.spanX * 0.7,
      1 + ((i * 7) % 10) * 0.4,
      bounds.cz + ((i * 11) % 100 / 100 - 0.5) * bounds.spanZ * 0.7,
    );
    fly.userData.firefly = true;
    fly.userData.phase = (i * 0.7) % (Math.PI * 2);
    world.add(fly);
  }
}

export function buildGoldLaneInlay(curve, hw) {
  const g = new THREE.Group();
  const goldMat = pbrMat(0xffd700, { metalness: 0.8, roughness: 0.35, emissive: 0xffd700, emi: 0.2 });
  for (let i = 0; i < 60; i++) {
    const t = i / 60;
    const { pos, frame } = placeAtTrack(curve, t, 0, 0.07);
    const strip = new THREE.Mesh(new THREE.BoxGeometry(hw * 0.3, 0.04, 1.8), goldMat);
    strip.position.copy(pos);
    strip.rotation.y = frame.rot ?? 0;
    g.add(strip);
  }
  return g;
}

export function placeRuinsCheckpoints(world, curve, hw) {
  const std = getTrackStandard('underwater_temple_01');
  placeCheckpointArches(world, curve, hw, std.checkpointTs, std.checkpointColors);
  placeBoostPads(world, curve, std.boostTs);
}

export function animateRuins(world, time) {
  world.traverse((o) => {
    if (o.userData?.firefly) {
      o.position.y += Math.sin(time * 2 + o.userData.phase) * 0.003;
      o.material.emissiveIntensity = 1.5 + Math.sin(time * 4 + o.userData.phase) * 0.8;
    }
    if (o.userData?.fireflyPoints && o.geometry?.attributes?.position) {
      const base = o.userData.basePositions;
      const pos = o.geometry.attributes.position.array;
      for (let i = 0; i < base.length; i += 3) {
        pos[i + 1] = base[i + 1] + Math.sin(time * 1.5 + i) * 0.4;
      }
      o.geometry.attributes.position.needsUpdate = true;
      o.material.opacity = 0.6 + Math.sin(time * 3) * 0.3;
    }
  });
}
