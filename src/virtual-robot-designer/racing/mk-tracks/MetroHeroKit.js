/**
 * MetroHeroKit.js — Track 10: Shadow Metro Underpass (underground subway).
 */
import * as THREE from 'three';
import { placeAtTrack } from '../GameWorldBuilder.js';
import { pbrMat } from './BiomeAAAKit.js';
import { buildWideCheckeredStart } from './SunsetCoastHeroKit.js';
import { buildCheckpointArch, placeCheckpointArches, placeBoostPads, makeSignTexture } from './BiomeHeroShared.js';
import { getTrackStandard } from './CodeRacerTrackStandards.js';

export { buildWideCheckeredStart };

export function buildMetroNeonSign() {
  const g = new THREE.Group();
  g.name = 'metro-gp-sign';
  const back = new THREE.Mesh(new THREE.BoxGeometry(8, 2.5, 0.3), pbrMat(0x222222, { metalness: 0.5 }));
  back.position.y = 4;
  g.add(back);
  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(7.5, 2),
    new THREE.MeshBasicMaterial({ map: makeSignTexture('METRO GP', { fg: '#ffff00', bg: '#1a0000', fontSize: 48 }), fog: false }),
  );
  sign.position.set(0, 4, 0.2);
  g.add(sign);
  g.add(new THREE.PointLight(0xffff00, 2.5, 18).translateY(4));
  return g;
}

export function buildFluorescentLight() {
  const g = new THREE.Group();
  const tube = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 0.12, 0.12),
    pbrMat(0xffffee, { emissive: 0xffffcc, emi: 1.2, roughness: 0.2 }),
  );
  g.add(tube);
  const fixture = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.2, 0.25), pbrMat(0x888888, { metalness: 0.6 }));
  fixture.position.y = 0.15;
  g.add(fixture);
  g.userData.flicker = true;
  return g;
}

export function buildGraffitiWall(width = 8) {
  const g = new THREE.Group();
  const wall = new THREE.Mesh(new THREE.BoxGeometry(width, 4, 0.3), pbrMat(0x555555, { roughness: 0.95 }));
  wall.position.y = 2;
  g.add(wall);
  const colors = [0xff4444, 0x44ff44, 0x4444ff, 0xffff44, 0xff44ff, 0x44ffff];
  for (let i = 0; i < 6; i++) {
    const art = new THREE.Mesh(
      new THREE.PlaneGeometry(1.2, 1.2),
      pbrMat(colors[i], { emissive: colors[i], emi: 0.3 }),
    );
    art.position.set(-width / 2 + 1 + i * 1.3, 1.5 + (i % 2), 0.2);
    g.add(art);
  }
  return g;
}

export function buildAbandonedTrain() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(12, 3.5, 2.8), pbrMat(0x444444, { roughness: 0.85 }));
  body.position.y = 2;
  g.add(body);
  for (let i = 0; i < 4; i++) {
    const win = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.2), pbrMat(0x222233, { emissive: 0x111122, emi: 0.2 }));
    win.position.set(-4 + i * 2.5, 2.5, 1.45);
    g.add(win);
  }
  return g;
}

export function buildMetroCeiling(bounds) {
  const g = new THREE.Group();
  g.name = 'metro-ceiling';
  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(bounds.spanX + 60, bounds.spanZ + 60),
    pbrMat(0x333333, { roughness: 0.95 }),
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(bounds.cx, 12, bounds.cz);
  g.add(ceiling);
  // Pipe bundles
  for (let i = 0; i < 8; i++) {
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, bounds.spanX * 0.8, 8), pbrMat(0x666666, { metalness: 0.5 }));
    pipe.rotation.z = Math.PI / 2;
    pipe.position.set(bounds.cx, 10.5 - i * 0.5, bounds.cz + (i - 4) * 8);
    g.add(pipe);
  }
  return g;
}

export function buildStartHeroSet(curve, hw, finishT = 0) {
  const g = new THREE.Group();
  const sign = buildMetroNeonSign();
  const { pos: sp, frame: sf } = placeAtTrack(curve, finishT + 0.02, 0, 0);
  sign.position.copy(sp);
  sign.rotation.y = sf.rot ?? 0;
  g.add(sign);

  const arch = buildCheckpointArch(hw, 0xffff00, { stone: false });
  const { pos: ap, frame: af } = placeAtTrack(curve, finishT + 0.045, 0, 0);
  arch.position.copy(ap);
  arch.rotation.y = af.rot ?? 0;
  g.add(arch);
  return g;
}

export function placeMetroScenery(world, curve, hw, bounds) {
  // Fluorescent lights — 48 total along track
  for (let i = 0; i < 48; i++) {
    const light = buildFluorescentLight();
    const t = 0.02 + (i / 48) * 0.96;
    const { pos, frame } = placeAtTrack(curve, t, 0, 0);
    light.position.copy(pos);
    light.position.y = 10;
    light.rotation.y = frame.rot ?? 0;
    light.userData.flickerPhase = i * 0.7;
    world.add(light);
  }

  // Modular tunnel wall segments — concrete boxes on both sides (~24 segments)
  for (let i = 0; i < 24; i++) {
    const t = 0.04 + (i / 24) * 0.92;
    [-1, 1].forEach((side) => {
      const segment = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 5, 4),
        pbrMat(0x4a4a4a, { roughness: 0.92 }),
      );
      const { pos, frame } = placeAtTrack(curve, t, side * (hw + 4.5), 0);
      segment.position.copy(pos);
      segment.position.y = 2.5;
      segment.rotation.y = frame.rot ?? 0;
      world.add(segment);

      const trim = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.2, 4.2),
        pbrMat(0x666655, { metalness: 0.4 }),
      );
      trim.position.copy(pos);
      trim.position.y = 5.1;
      trim.rotation.y = frame.rot ?? 0;
      world.add(trim);
    });
  }

  // Graffiti gallery + 5 more walls at different t
  const graffitiTs = [0.3, 0.12, 0.45, 0.58, 0.72, 0.85];
  graffitiTs.forEach((t, i) => {
    const graffiti = buildGraffitiWall(8 + (i % 3) * 2);
    const side = i % 2 ? 1 : -1;
    const { pos, frame } = placeAtTrack(curve, t, side * (hw + 6), 0);
    graffiti.position.copy(pos);
    graffiti.rotation.y = frame.rot ?? 0;
    world.add(graffiti);
  });

  // Platform edge tiles at start / finish area
  for (let i = 0; i < 10; i++) {
    const t = 0.01 + i * 0.006;
    [-1, 1].forEach((side) => {
      const tile = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.06, 1.2),
        pbrMat(i % 2 ? 0xffff00 : 0x333333, { emissive: i % 2 ? 0xffff00 : 0x000000, emi: i % 2 ? 0.4 : 0 }),
      );
      const { pos, frame } = placeAtTrack(curve, t, side * (hw + 0.6), 0);
      tile.position.copy(pos);
      tile.position.y = 0.08;
      tile.rotation.y = frame.rot ?? 0;
      world.add(tile);
    });
  }

  // Jump ramp at t=0.48 — 12° incline
  const rampAngle = (12 * Math.PI) / 180;
  const ramp = new THREE.Mesh(
    new THREE.BoxGeometry(hw * 1.6, 0.4, 8),
    pbrMat(0x555555, { roughness: 0.85 }),
  );
  const { pos: rp, frame: rf } = placeAtTrack(curve, 0.48, 0, 0);
  ramp.position.copy(rp);
  ramp.position.y = 0.4;
  ramp.rotation.y = rf.rot ?? 0;
  ramp.rotation.x = -rampAngle;
  world.add(ramp);
  const rampStripe = new THREE.Mesh(
    new THREE.BoxGeometry(hw * 1.4, 0.05, 0.6),
    pbrMat(0xffff00, { emissive: 0xffff00, emi: 1.5 }),
  );
  rampStripe.position.copy(rp);
  rampStripe.position.y = 1.2;
  rampStripe.rotation.copy(ramp.rotation);
  world.add(rampStripe);

  // Metro map poster "YOU ARE HERE"
  const mapPoster = new THREE.Mesh(
    new THREE.PlaneGeometry(2.5, 3),
    new THREE.MeshBasicMaterial({
      map: makeSignTexture('YOU ARE HERE', { fg: '#ff4444', bg: '#eeeeee', fontSize: 32 }),
      fog: false,
    }),
  );
  const { pos: mp, frame: mf } = placeAtTrack(curve, 0.08, -(hw + 4), 0);
  mapPoster.position.copy(mp);
  mapPoster.position.y = 3.5;
  mapPoster.rotation.y = mf.rot ?? 0;
  world.add(mapPoster);

  // Maintenance pipes overhead along track
  for (let i = 0; i < 20; i++) {
    const t = 0.05 + (i / 20) * 0.9;
    const pipe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, hw * 2.2, 8),
      pbrMat(0x777766, { metalness: 0.55, roughness: 0.45 }),
    );
    const { pos, frame } = placeAtTrack(curve, t, 0, 0);
    pipe.position.copy(pos);
    pipe.position.y = 9.2 + (i % 3) * 0.35;
    pipe.rotation.z = Math.PI / 2;
    pipe.rotation.y = frame.rot ?? 0;
    world.add(pipe);

    if (i % 4 === 0) {
      const joint = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 8, 8),
        pbrMat(0x888877, { metalness: 0.6 }),
      );
      joint.position.copy(pos);
      joint.position.y = 9.2;
      world.add(joint);
    }
  }

  // Abandoned train
  const train = buildAbandonedTrain();
  const { pos: tp, frame: tf } = placeAtTrack(curve, 0.35, hw + 10, 0);
  train.position.copy(tp);
  train.rotation.y = tf.rot ?? 0;
  world.add(train);

  // Departure board
  const board = new THREE.Mesh(
    new THREE.PlaneGeometry(3, 1.5),
    new THREE.MeshBasicMaterial({ map: makeSignTexture('NEXT TRAIN: RACE CAR', { fg: '#ffff00', bg: '#111111', fontSize: 28 }), fog: false }),
  );
  const { pos: bp, frame: bf } = placeAtTrack(curve, 0.6, -(hw + 5), 0);
  board.position.copy(bp);
  board.position.y = 3;
  board.rotation.y = bf.rot ?? 0;
  world.add(board);

  // Steam vents
  [0.35, 0.7].forEach((t) => {
    const steam = new THREE.Mesh(
      new THREE.SphereGeometry(1.5, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3, fog: false }),
    );
    const { pos } = placeAtTrack(curve, t, hw + 4, 0);
    steam.position.copy(pos);
    steam.position.y = 1.5;
    steam.userData.steam = true;
    world.add(steam);
  });
}

export function buildHazardStripes(curve, hw) {
  const g = new THREE.Group();
  const stripeMat = pbrMat(0xffff00, { emissive: 0xffff00, emi: 2.0 });
  for (let i = 0; i < 50; i++) {
    const t = i / 50;
    const { pos, frame } = placeAtTrack(curve, t, 0, 0.07);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(hw * 1.8, 0.04, 0.4), stripeMat);
    stripe.position.copy(pos);
    stripe.rotation.y = frame.rot ?? 0;
    if (i % 2) stripe.scale.z = 0.5;
    g.add(stripe);
  }
  return g;
}

export function placeMetroCheckpoints(world, curve, hw) {
  const std = getTrackStandard('cyber_boulevard_01');
  placeCheckpointArches(world, curve, hw, std.checkpointTs, std.checkpointColors);
  placeBoostPads(world, curve, std.boostTs);
}

export function animateMetro(world, time) {
  world.traverse((o) => {
    if (o.userData?.flicker) {
      const phase = o.userData.flickerPhase ?? 0;
      o.children[0].material.emissiveIntensity = Math.random() > 0.15 ? 1.2 : 0.3;
    }
    if (o.userData?.steam) {
      o.position.y = 1.5 + Math.sin(time * 2 + o.id) * 0.4;
      o.material.opacity = 0.2 + Math.sin(time * 3) * 0.1;
    }
  });
}
