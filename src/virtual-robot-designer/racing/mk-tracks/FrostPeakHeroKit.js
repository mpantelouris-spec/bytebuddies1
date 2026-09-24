/**
 * FrostPeakHeroKit.js — Track 6: Frost Peak Rally (alpine winter).
 */
import * as THREE from 'three';
import { placeAtTrack } from '../GameWorldBuilder.js';
import { pbrMat } from './BiomeAAAKit.js';
import { buildWideCheckeredStart } from './SunsetCoastHeroKit.js';
import { buildCheckpointArch, placeCheckpointArches, placeBoostPads, makePlaqueTexture } from './BiomeHeroShared.js';
import { getTrackStandard } from './CodeRacerTrackStandards.js';

export { buildWideCheckeredStart };

export function buildSkiLodge() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(8, 5, 6), pbrMat(0x8b6914, { roughness: 0.88 }));
  body.position.y = 2.5;
  g.add(body);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(6, 2.5, 4), pbrMat(0xf0f8ff, { roughness: 0.95 }));
  roof.position.y = 5.5;
  roof.rotation.y = Math.PI / 4;
  g.add(roof);
  const flag = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 1.2),
    new THREE.MeshBasicMaterial({ map: makePlaqueTexture('FROST CUP'), fog: false }),
  );
  flag.position.set(0, 6.5, 0);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3, 6), pbrMat(0x888888));
  pole.position.set(0, 5, 3.2);
  g.add(pole);
  g.add(flag);
  return g;
}

export function buildSnowPine(scale = 1) {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2 * scale, 0.3 * scale, 1.5 * scale, 6), pbrMat(0x4a3520));
  trunk.position.y = 0.75 * scale;
  g.add(trunk);
  for (let i = 0; i < 3; i++) {
    const layer = new THREE.Mesh(
      new THREE.ConeGeometry((1.8 - i * 0.4) * scale, (2.2 - i * 0.3) * scale, 8),
      pbrMat(0x1a5c2a, { roughness: 0.85 }),
    );
    layer.position.y = (1.5 + i * 1.4) * scale;
    g.add(layer);
    const snow = new THREE.Mesh(
      new THREE.ConeGeometry((1.9 - i * 0.4) * scale, 0.4 * scale, 8),
      pbrMat(0xf0f8ff, { roughness: 0.95 }),
    );
    snow.position.y = layer.position.y + 0.8 * scale;
    g.add(snow);
  }
  return g;
}

export function buildSnowman() {
  const g = new THREE.Group();
  [0.8, 0.6, 0.45].forEach((r, i) => {
    const ball = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 10), pbrMat(0xf5f5f5, { roughness: 0.95 }));
    ball.position.y = 0.8 + i * 1.2;
    g.add(ball);
  });
  return g;
}

export function buildStartHeroSet(curve, hw, finishT = 0) {
  const g = new THREE.Group();
  const lodge = buildSkiLodge();
  const { pos: lp } = placeAtTrack(curve, finishT + 0.01, -(hw + 10), 0);
  lodge.position.copy(lp);
  g.add(lodge);

  const arch = buildCheckpointArch(hw, 0x5dade2, { plaque: 'FROST PEAK' });
  const { pos: ap, frame: af } = placeAtTrack(curve, finishT + 0.045, 0, 0);
  arch.position.copy(ap);
  arch.rotation.y = af.rot ?? 0;
  g.add(arch);

  // Frozen lake vista ahead
  const lake = new THREE.Mesh(
    new THREE.PlaneGeometry(40, 20),
    pbrMat(0x88ccee, { roughness: 0.05, metalness: 0.4, emissive: 0xaaddff, emi: 0.15 }),
  );
  lake.rotation.x = -Math.PI / 2;
  const { pos: lk, frame: lf } = placeAtTrack(curve, finishT + 0.15, 0, -0.3);
  lake.position.copy(lk);
  lake.rotation.z = lf.rot ?? 0;
  g.add(lake);
  return g;
}

export function placeFrostScenery(world, curve, hw, bounds) {
  // 28 snow pines
  for (let i = 0; i < 28; i++) {
    const tree = buildSnowPine(0.9 + (i % 3) * 0.2);
    const t = 0.04 + (i / 28) * 0.92;
    const side = i % 2 ? 1 : -1;
    const { pos, frame } = placeAtTrack(curve, t, side * (hw + 5 + (i % 4)), 0);
    tree.position.copy(pos);
    tree.rotation.y = frame.rot ?? 0;
    world.add(tree);
  }

  // Snowmen at checkpoints
  [0.35, 0.58].forEach((t, i) => {
    const snowman = buildSnowman();
    const side = i % 2 ? 1 : -1;
    const { pos } = placeAtTrack(curve, t, side * (hw + 6), 0);
    snowman.position.copy(pos);
    world.add(snowman);
  });

  // Ice castle background with frozen waterfall
  const castle = new THREE.Group();
  for (let t = 0; t < 3; t++) {
    const tower = new THREE.Mesh(
      new THREE.CylinderGeometry(2, 2.5, 10 + t * 3, 8),
      pbrMat(0xaaddff, { emissive: 0x88ccee, emi: 0.2, roughness: 0.2 }),
    );
    tower.position.set((t - 1) * 8, 5, 0);
    castle.add(tower);
  }
  const frozenFall = new THREE.Mesh(
    new THREE.PlaneGeometry(7, 18),
    pbrMat(0xaaddff, { emissive: 0x88ccee, emi: 0.4, roughness: 0.08, metalness: 0.35, transparent: true, opacity: 0.88 }),
  );
  frozenFall.position.set(10, 9, -2);
  castle.add(frozenFall);
  castle.position.set(bounds.cx + 40, 0, bounds.cz - 30);
  world.add(castle);

  // Snow bridge arch at t=0.5
  const snowBridge = new THREE.Group();
  const snowMat = pbrMat(0xf0f8ff, { roughness: 0.92 });
  const bridgeDeck = new THREE.Mesh(new THREE.BoxGeometry(22, 0.5, 4), snowMat);
  bridgeDeck.position.y = 3.5;
  snowBridge.add(bridgeDeck);
  [-9, 9].forEach((x) => {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 7, 1.2), snowMat);
    pillar.position.set(x, 3.5, 0);
    snowBridge.add(pillar);
  });
  const bridgeArch = new THREE.Mesh(new THREE.TorusGeometry(5, 0.4, 8, 16, Math.PI), snowMat);
  bridgeArch.position.set(0, 7, 0);
  bridgeArch.rotation.z = Math.PI;
  snowBridge.add(bridgeArch);
  const { pos: sbPos, frame: sbF } = placeAtTrack(curve, 0.5, 0, 0);
  snowBridge.position.copy(sbPos);
  snowBridge.rotation.y = sbF.rot ?? 0;
  world.add(snowBridge);

  // WINTER CUP trophy display at t=0.55
  const trophy = new THREE.Group();
  const cup = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.8, 1.2, 12),
    pbrMat(0xffd700, { metalness: 0.8, roughness: 0.2, emissive: 0xffaa00, emi: 0.35 }),
  );
  cup.position.y = 1.8;
  trophy.add(cup);
  const trophyBase = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1, 0.3, 12), pbrMat(0x8b7355, { roughness: 0.7 }));
  trophyBase.position.y = 1.1;
  trophy.add(trophyBase);
  const plaque = new THREE.Mesh(
    new THREE.PlaneGeometry(2.5, 0.8),
    new THREE.MeshBasicMaterial({ map: makePlaqueTexture('WINTER CUP', 'CHAMPIONS'), fog: false }),
  );
  plaque.position.set(0, 2.8, 0.6);
  trophy.add(plaque);
  const { pos: trPos, frame: trF } = placeAtTrack(curve, 0.55, -(hw + 5), 0);
  trophy.position.copy(trPos);
  trophy.rotation.y = trF.rot ?? 0;
  world.add(trophy);

  // 60 icicles hanging along cliff edges
  for (let i = 0; i < 60; i++) {
    const icicle = new THREE.Mesh(
      new THREE.ConeGeometry(0.1 + (i % 3) * 0.04, 0.8 + (i % 5) * 0.35, 5),
      pbrMat(0xccddff, { emissive: 0xaaccff, emi: 0.3 }),
    );
    icicle.rotation.x = Math.PI;
    const side = i % 2 ? 1 : -1;
    const { pos } = placeAtTrack(curve, 0.06 + (i / 60) * 0.88, side * (hw + 3 + (i % 4)), 0);
    icicle.position.copy(pos);
    icicle.position.y = 4 + (i % 4);
    world.add(icicle);
  }
}

export function placeFrostCheckpoints(world, curve, hw) {
  const std = getTrackStandard('ice_cavern_01');
  placeCheckpointArches(world, curve, hw, std.checkpointTs, std.checkpointColors);
  placeBoostPads(world, curve, std.boostTs);
}

export function animateFrost(world, time) {
  // subtle snow drift handled by particles in BiomeAAAKit
}
