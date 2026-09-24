/**
 * VolcanoHeroKit.js — Track 4: Volcanic Inferno Pass (cartoon-safe lava canyon).
 */
import * as THREE from 'three';
import { placeAtTrack } from '../GameWorldBuilder.js';
import { pbrMat } from './BiomeAAAKit.js';
import { buildWideCheckeredStart } from './SunsetCoastHeroKit.js';
import { buildCheckpointArch, placeCheckpointArches, placeBoostPads, makePlaqueTexture } from './BiomeHeroShared.js';
import { getTrackStandard } from './CodeRacerTrackStandards.js';

export { buildWideCheckeredStart };

export function buildResearchHut() {
  const g = new THREE.Group();
  g.name = 'research-hut';
  const hut = new THREE.Mesh(new THREE.BoxGeometry(5, 3.5, 4), pbrMat(0xeeeeee, { roughness: 0.8 }));
  hut.position.y = 1.75;
  g.add(hut);
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(4.5, 1.2),
    new THREE.MeshBasicMaterial({ map: makePlaqueTexture('HEAT ZONE', 'RACE SAFE!'), fog: false }),
  );
  sign.position.set(0, 3.2, 2.1);
  g.add(sign);
  const therm = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 1.5, 8), pbrMat(0xff4444, { emissive: 0xff2200, emi: 0.5 }));
  therm.position.set(2, 1.5, 2);
  g.add(therm);
  return g;
}

export function buildLavaRiver(length = 40) {
  const g = new THREE.Group();
  const lava = new THREE.Mesh(
    new THREE.PlaneGeometry(length, 5),
    pbrMat(0xff4500, { emissive: 0xff2200, emi: 2.5, roughness: 0.3 }),
  );
  lava.rotation.x = -Math.PI / 2;
  lava.position.y = -0.5;
  g.add(lava);
  g.add(new THREE.PointLight(0xff4500, 3, 30).translateY(2));
  return g;
}

export function buildCalderaBackdrop() {
  const g = new THREE.Group();
  const cone = new THREE.Mesh(
    new THREE.ConeGeometry(25, 35, 16),
    pbrMat(0x3a2a22, { roughness: 0.92 }),
  );
  cone.position.y = 17;
  g.add(cone);
  const smoke = new THREE.Mesh(
    new THREE.SphereGeometry(8, 10, 10),
    new THREE.MeshBasicMaterial({ color: 0x888888, transparent: true, opacity: 0.35, fog: false }),
  );
  smoke.position.y = 38;
  smoke.scale.set(1.5, 2, 1.2);
  g.add(smoke);
  return g;
}

export function buildStartHeroSet(curve, hw, finishT = 0) {
  const g = new THREE.Group();
  const hut = buildResearchHut();
  const { pos: hp } = placeAtTrack(curve, finishT + 0.01, hw + 8, 0);
  hut.position.copy(hp);
  g.add(hut);

  const lava = buildLavaRiver(35);
  const { pos: lp, frame: lf } = placeAtTrack(curve, finishT + 0.05, -(hw + 6), 0);
  lava.position.copy(lp);
  lava.rotation.y = lf.rot ?? 0;
  g.add(lava);

  const arch = buildCheckpointArch(hw, 0xff4500, { plaque: 'VOLCANIC INFERNO' });
  const { pos: ap, frame: af } = placeAtTrack(curve, finishT + 0.045, 0, 0);
  arch.position.copy(ap);
  arch.rotation.y = af.rot ?? 0;
  g.add(arch);

  const caldera = buildCalderaBackdrop();
  const { pos: cp } = placeAtTrack(curve, finishT + 0.2, 0, 0);
  caldera.position.copy(cp);
  caldera.position.y += 5;
  g.add(caldera);
  return g;
}

export function placeVolcanoScenery(world, curve, hw, bounds) {
  // 24 basalt hexagonal columns along track sides
  for (let i = 0; i < 24; i++) {
    const col = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 1.1, 4 + (i % 4) * 2, 6),
      pbrMat(0x2a2a2a, { roughness: 0.9 }),
    );
    const { pos } = placeAtTrack(curve, 0.05 + (i / 24) * 0.9, (i % 2 ? 1 : -1) * (hw + 8 + (i % 3) * 2), 0);
    col.position.copy(pos);
    col.position.y = 2;
    world.add(col);
  }

  // 2 lava waterfalls — orange emissive cascades
  [0.12, 0.68].forEach((t, i) => {
    const fall = new THREE.Group();
    const cascade = new THREE.Mesh(
      new THREE.PlaneGeometry(4.5, 14),
      pbrMat(0xff5500, { emissive: 0xff2200, emi: 2.2, roughness: 0.3 }),
    );
    cascade.position.y = 7;
    fall.add(cascade);
    const ember = new THREE.PointLight(0xff4400, 2.5, 18);
    ember.position.y = 7;
    fall.add(ember);
    const side = i % 2 ? 1 : -1;
    const { pos, frame } = placeAtTrack(curve, t, side * (hw + 11), 0);
    fall.position.copy(pos);
    fall.rotation.y = (frame.rot ?? 0) + Math.PI / 2;
    cascade.userData.pulse = true;
    cascade.userData.glowMat = cascade.material;
    world.add(fall);
  });

  // 5 magma vents with ember PointLights
  [0.2, 0.4, 0.55, 0.7, 0.85].forEach((t, i) => {
    const vent = new THREE.Group();
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.5, 0.3, 8, 20),
      pbrMat(0xff4400, { emissive: 0xff2200, emi: 1.5 }),
    );
    ring.rotation.x = Math.PI / 2;
    vent.add(ring);
    const ember = new THREE.PointLight(0xff6600, 2.2, 14);
    ember.position.y = 1.2;
    vent.add(ember);
    const side = i % 2 ? 1 : -1;
    const { pos } = placeAtTrack(curve, t, side * (hw + 5), 0);
    vent.position.copy(pos);
    vent.position.y = 0.3;
    ring.userData.pulse = true;
    ring.userData.glowMat = ring.material;
    world.add(vent);
  });

  // Basalt bridge over magma at ~t=0.4
  const bridge = new THREE.Group();
  const deck = new THREE.Mesh(new THREE.BoxGeometry(28, 0.8, 5), pbrMat(0x2a2a2a, { emissive: 0xff4400, emi: 0.15 }));
  deck.position.y = 3;
  bridge.add(deck);
  [-12, 12].forEach((x) => {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.5, 6, 1.5), pbrMat(0x1a1a1a));
    pillar.position.set(x, 3, 0);
    bridge.add(pillar);
  });
  const magma = new THREE.Mesh(
    new THREE.PlaneGeometry(26, 4),
    pbrMat(0xff4500, { emissive: 0xff2200, emi: 1.8, roughness: 0.35 }),
  );
  magma.rotation.x = -Math.PI / 2;
  magma.position.y = -0.2;
  bridge.add(magma);
  const { pos: brPos, frame: brF } = placeAtTrack(curve, 0.4, 0, 0);
  bridge.position.copy(brPos);
  bridge.rotation.y = brF.rot ?? 0;
  world.add(bridge);

  // 8 obsidian glass spires — tall dark cones with slight emissive
  for (let i = 0; i < 8; i++) {
    const spire = new THREE.Mesh(
      new THREE.ConeGeometry(2, 12 + i * 2, 6),
      pbrMat(0x111122, { metalness: 0.6, roughness: 0.15, emissive: 0x331144, emi: 0.3 }),
    );
    spire.position.set(bounds.cx + (i - 4) * 12, 6, bounds.cz - bounds.spanZ * 0.4);
    world.add(spire);
  }
}

export function placeVolcanoCheckpoints(world, curve, hw) {
  const std = getTrackStandard('volcano_canyon_01');
  placeCheckpointArches(world, curve, hw, std.checkpointTs, std.checkpointColors);
  placeBoostPads(world, curve, std.boostTs);
}

export function buildLavaCrackLanes(curve, hw) {
  const g = new THREE.Group();
  const crackMat = pbrMat(0xff4500, { emissive: 0xff2200, emi: 1.8, roughness: 0.4 });
  for (let i = 0; i < 60; i++) {
    const t = (i / 60);
    const { pos, frame } = placeAtTrack(curve, t, 0, 0.06);
    const crack = new THREE.Mesh(new THREE.BoxGeometry(hw * 1.6, 0.04, 0.25), crackMat);
    crack.position.copy(pos);
    crack.rotation.y = frame.rot ?? 0;
    g.add(crack);
  }
  return g;
}

export function animateVolcano(world, time) {
  world.traverse((o) => {
    if (o.userData?.pulse && o.material?.emissiveIntensity != null) {
      o.material.emissiveIntensity = 1.2 + Math.sin(time * 5) * 0.6;
    }
  });
}
