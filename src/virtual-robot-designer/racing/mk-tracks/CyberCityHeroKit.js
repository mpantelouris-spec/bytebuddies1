/**
 * CyberCityHeroKit.js — Track 5: Cyber City Circuit (neon rain-soaked night).
 */
import * as THREE from 'three';
import { placeAtTrack } from '../GameWorldBuilder.js';
import { pbrMat } from './BiomeAAAKit.js';
import { buildWideCheckeredStart } from './SunsetCoastHeroKit.js';
import { buildCheckpointArch, placeCheckpointArches, placeBoostPads, makeSignTexture } from './BiomeHeroShared.js';
import { getTrackStandard } from './CodeRacerTrackStandards.js';

export { buildWideCheckeredStart };

export function buildHoloBillboard(text = 'CYBER GP') {
  const g = new THREE.Group();
  g.name = 'holo-billboard';
  const frame = new THREE.Mesh(new THREE.BoxGeometry(12, 6, 0.3), pbrMat(0x111133, { metalness: 0.7 }));
  frame.position.y = 5;
  g.add(frame);
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(11, 5),
    new THREE.MeshBasicMaterial({ map: makeSignTexture(text, { fg: '#ff00ff', bg: '#0a0020', fontSize: 52 }), fog: false }),
  );
  screen.position.set(0, 5, 0.2);
  g.add(screen);
  g.add(new THREE.PointLight(0xff00ff, 3, 25).translateY(5));
  return g;
}

export function buildSkyscraper(h = 28, accent = 0xff00ff) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(6, h, 6),
    pbrMat(0x0a1028, { metalness: 0.5, roughness: 0.3 }),
  );
  body.position.y = h / 2;
  g.add(body);
  for (let row = 0; row < Math.floor(h / 2); row++) {
    for (let col = 0; col < 3; col++) {
      if (Math.random() > 0.4) {
        const win = new THREE.Mesh(
          new THREE.PlaneGeometry(0.8, 1.2),
          pbrMat(Math.random() > 0.5 ? accent : 0x00ffff, { emissive: Math.random() > 0.5 ? accent : 0x00ffff, emi: 0.6 }),
        );
        win.position.set(-2 + col * 2, 1.5 + row * 2, 3.05);
        g.add(win);
      }
    }
  }
  return g;
}

export function buildStartHeroSet(curve, hw, finishT = 0) {
  const g = new THREE.Group();
  const billboard = buildHoloBillboard('CYBER GP');
  const { pos: bp, frame: bf } = placeAtTrack(curve, finishT + 0.08, 0, 0);
  billboard.position.copy(bp);
  billboard.rotation.y = bf.rot ?? 0;
  g.add(billboard);

  const arch = buildCheckpointArch(hw, 0xff00ff);
  const { pos: ap, frame: af } = placeAtTrack(curve, finishT + 0.045, 0, 0);
  arch.position.copy(ap);
  arch.rotation.y = af.rot ?? 0;
  g.add(arch);
  return g;
}

export function placeCyberScenery(world, curve, hw, bounds) {
  // 14 skyscrapers
  for (let i = 0; i < 14; i++) {
    const tower = buildSkyscraper(22 + (i % 5) * 6, i % 2 ? 0xff00ff : 0x00ffff);
    const t = 0.05 + (i / 14) * 0.9;
    const side = i % 2 ? 1 : -1;
    const { pos, frame } = placeAtTrack(curve, t, side * (hw + 14 + (i % 3) * 3), 0);
    tower.position.copy(pos);
    tower.rotation.y = (frame.rot ?? 0) + Math.PI;
    world.add(tower);
  }

  // Neon tunnel segment (~70 m) around t=0.4 — wall LED strips pulse magenta/cyan
  const tunnelStart = 0.34;
  const tunnelEnd = 0.46;
  const tunnelSamples = 28;
  for (let i = 0; i < tunnelSamples; i++) {
    const t = tunnelStart + (i / (tunnelSamples - 1)) * (tunnelEnd - tunnelStart);
    [-1, 1].forEach((side) => {
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 8, 3.2),
        pbrMat(0x0a0a1a, { metalness: 0.6, roughness: 0.35 }),
      );
      const { pos, frame } = placeAtTrack(curve, t, side * (hw + 5), 0);
      wall.position.copy(pos);
      wall.position.y = 4;
      wall.rotation.y = frame.rot ?? 0;
      world.add(wall);

      for (let strip = 0; strip < 4; strip++) {
        const color = strip % 2 ? 0xff00ff : 0x00ffff;
        const led = new THREE.Mesh(
          new THREE.BoxGeometry(0.12, 0.15, 2.4),
          pbrMat(color, { emissive: color, emi: 2.5, metalness: 0.3 }),
        );
        const { pos: lp, frame: lf } = placeAtTrack(curve, t, side * (hw + 4.7), 0);
        led.position.copy(lp);
        led.position.y = 1.2 + strip * 1.8;
        led.rotation.y = lf.rot ?? 0;
        led.userData.ledStrip = true;
        led.userData.ledPhase = i * 0.4 + strip;
        world.add(led);
      }
    });
  }

  // Elevated highway section — bridge deck 20 m up with glass barriers
  const highwayStart = 0.48;
  const highwayEnd = 0.58;
  for (let i = 0; i < 14; i++) {
    const t = highwayStart + (i / 13) * (highwayEnd - highwayStart);
    const deck = new THREE.Mesh(
      new THREE.BoxGeometry(hw * 2.4, 0.5, 5),
      pbrMat(0x1a1a2e, { metalness: 0.7, roughness: 0.25 }),
    );
    const { pos, frame } = placeAtTrack(curve, t, 0, 0);
    deck.position.copy(pos);
    deck.position.y = 20;
    deck.rotation.y = frame.rot ?? 0;
    world.add(deck);

    [-1, 1].forEach((side) => {
      const barrier = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 1.2, 5),
        pbrMat(0x88ccff, { metalness: 0.9, roughness: 0.05, transparent: true, opacity: 0.45 }),
      );
      const { pos: bp, frame: bf } = placeAtTrack(curve, t, side * hw * 1.1, 0);
      barrier.position.copy(bp);
      barrier.position.y = 20.85;
      barrier.rotation.y = bf.rot ?? 0;
      world.add(barrier);
    });

    if (i % 3 === 0) {
      const pillar = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 20, 0.8),
        pbrMat(0x222233, { metalness: 0.5 }),
      );
      const { pos: pp } = placeAtTrack(curve, t, hw + 3, 0);
      pillar.position.copy(pp);
      pillar.position.y = 10;
      world.add(pillar);
    }
  }

  // Alley shortcut walls (graffiti) at t=0.55
  [-1, 1].forEach((side) => {
    const alleyWall = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 5, 14),
      pbrMat(0x2a2a3a, { roughness: 0.95 }),
    );
    const { pos, frame } = placeAtTrack(curve, 0.55, side * (hw + 3), 0);
    alleyWall.position.copy(pos);
    alleyWall.position.y = 2.5;
    alleyWall.rotation.y = frame.rot ?? 0;
    world.add(alleyWall);

    const graffitiColors = [0xff00ff, 0x00ffff, 0xffff00, 0xff4488];
    graffitiColors.forEach((col, gi) => {
      const tag = new THREE.Mesh(
        new THREE.PlaneGeometry(2.5, 1.8),
        pbrMat(col, { emissive: col, emi: 0.5 }),
      );
      const { pos: gp, frame: gf } = placeAtTrack(curve, 0.55 + gi * 0.008, side * (hw + 2.7), 0);
      tag.position.copy(gp);
      tag.position.y = 1.5 + (gi % 2) * 1.2;
      tag.rotation.y = (gf.rot ?? 0) + (side > 0 ? 0 : Math.PI);
      world.add(tag);
    });
  });

  // Plaza fountain roundabout at t=0.78
  const fountain = new THREE.Group();
  fountain.name = 'plaza-fountain';
  const basin = new THREE.Mesh(
    new THREE.CylinderGeometry(6, 6.5, 0.6, 20),
    pbrMat(0x334455, { metalness: 0.6, roughness: 0.3 }),
  );
  basin.position.y = 0.3;
  fountain.add(basin);
  const water = new THREE.Mesh(
    new THREE.CylinderGeometry(5.2, 5.2, 0.15, 20),
    pbrMat(0x00aaff, { emissive: 0x0066cc, emi: 0.3, transparent: true, opacity: 0.7 }),
  );
  water.position.y = 0.55;
  fountain.add(water);
  const spout = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.5, 2.5, 8),
    pbrMat(0x888899, { metalness: 0.8 }),
  );
  spout.position.y = 1.5;
  fountain.add(spout);
  for (let a = 0; a < 8; a++) {
    const curb = new THREE.Mesh(
      new THREE.BoxGeometry(2, 0.35, 0.5),
      pbrMat(0x444455, { roughness: 0.8 }),
    );
    const angle = (a / 8) * Math.PI * 2;
    curb.position.set(Math.cos(angle) * 7, 0.2, Math.sin(angle) * 7);
    curb.rotation.y = angle;
    fountain.add(curb);
  }
  const { pos: fp, frame: ff } = placeAtTrack(curve, 0.78, 0, 0);
  fountain.position.copy(fp);
  fountain.rotation.y = ff.rot ?? 0;
  world.add(fountain);

  // 4 additional holographic billboards
  [
    { t: 0.18, side: hw + 10, text: 'NEON RUSH' },
    { t: 0.42, side: -(hw + 9), text: 'BYTE GP' },
    { t: 0.65, side: hw + 11, text: 'CYBER DRIFT' },
    { t: 0.88, side: -(hw + 8), text: 'FINISH LINE' },
  ].forEach(({ t, side, text }) => {
    const billboard = buildHoloBillboard(text);
    const { pos, frame } = placeAtTrack(curve, t, side, 0);
    billboard.position.copy(pos);
    billboard.rotation.y = (frame.rot ?? 0) + (side < 0 ? Math.PI : 0);
    world.add(billboard);
  });

  // Robot shop sign
  const shopSign = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 2),
    new THREE.MeshBasicMaterial({ map: makeSignTexture('CODE YOUR RIDE!', { fg: '#00ffff', bg: '#001030' }), fog: false }),
  );
  const { pos: sp, frame: sf } = placeAtTrack(curve, 0.62, hw + 8, 0);
  shopSign.position.copy(sp);
  shopSign.position.y += 3;
  shopSign.rotation.y = sf.rot ?? 0;
  world.add(shopSign);

  // 6 flying cars on elevated spline (animated in animateCyberCity)
  for (let i = 0; i < 6; i++) {
    const car = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.6, 4),
      pbrMat(i % 2 ? 0xff00ff : 0x00ffff, { emissive: i % 2 ? 0xff00ff : 0x00ffff, emi: 0.8, metalness: 0.6 }),
    );
    const baseT = 0.5 + (i / 6) * 0.08;
    const { pos, frame } = placeAtTrack(curve, baseT, (i % 2 ? 1 : -1) * hw * 0.6, 0);
    car.position.copy(pos);
    car.position.y = 22;
    car.rotation.y = frame.rot ?? 0;
    car.userData.flyingCar = true;
    car.userData.baseT = baseT;
    car.userData.laneSide = i % 2 ? 1 : -1;
    car.userData.carPhase = i * 1.7;
    car.userData.startPos = pos.clone();
    car.userData.startPos.y = 22;
    const rot = frame.rot ?? 0;
    car.userData.flyDir = new THREE.Vector3(Math.sin(rot), 0, Math.cos(rot));
    world.add(car);
  }

  // Steam vents
  [0.15, 0.35, 0.55, 0.75, 0.9, 0.48].forEach((t) => {
    const vent = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.6, 0.3, 8),
      pbrMat(0x333344, { metalness: 0.6 }),
    );
    const { pos } = placeAtTrack(curve, t, hw + 4, 0);
    vent.position.copy(pos);
    vent.position.y = 0.15;
    world.add(vent);
    const steam = new THREE.Mesh(
      new THREE.SphereGeometry(1.2, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25, fog: false }),
    );
    steam.position.copy(pos);
    steam.position.y = 1.5;
    steam.userData.steam = true;
    world.add(steam);
  });

  // Puddles
  for (let i = 0; i < 12; i++) {
    const puddle = new THREE.Mesh(
      new THREE.CircleGeometry(1.5 + Math.random(), 12),
      pbrMat(0x001f3f, { roughness: 0.02, metalness: 0.9, emissive: 0xff00ff, emi: 0.06 }),
    );
    puddle.rotation.x = -Math.PI / 2;
    const { pos } = placeAtTrack(curve, Math.random() * 0.9 + 0.05, (Math.random() - 0.5) * hw * 0.8, 0.02);
    puddle.position.copy(pos);
    world.add(puddle);
  }
}

export function buildNeonLaneStrips(curve, hw) {
  const g = new THREE.Group();
  const laneMat = pbrMat(0xff00ff, { emissive: 0xff00ff, emi: 3.5, roughness: 0.1 });
  const offsets = [-hw * 0.5, -hw * 0.17, hw * 0.17, hw * 0.5];
  for (let i = 0; i < 70; i++) {
    const t = i / 70;
    offsets.forEach((off) => {
      const { pos, frame } = placeAtTrack(curve, t, off, 0.08);
      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.05, 2), laneMat);
      strip.position.copy(pos);
      strip.rotation.y = frame.rot ?? 0;
      g.add(strip);
    });
  }
  return g;
}

export function placeCyberCheckpoints(world, curve, hw) {
  const std = getTrackStandard('cyber_boulevard_01');
  placeCheckpointArches(world, curve, hw, std.checkpointTs, std.checkpointColors);
  placeBoostPads(world, curve, std.boostTs);
}

export function animateCyberCity(world, time) {
  world.traverse((o) => {
    if (o.userData?.steam) {
      o.position.y = 1.5 + Math.sin(time * 2 + o.id) * 0.5;
      o.material.opacity = 0.15 + Math.sin(time * 3) * 0.1;
    }
    if (o.userData?.ledStrip && o.material) {
      const phase = o.userData.ledPhase ?? 0;
      o.material.emissiveIntensity = 1.5 + Math.sin(time * 4 + phase) * 1.2;
    }
    if (o.userData?.flyingCar && o.userData.startPos && o.userData.flyDir) {
      const phase = o.userData.carPhase ?? 0;
      const travel = ((Math.sin(time * 0.6 + phase) + 1) * 0.5) * 18;
      o.position.copy(o.userData.startPos).addScaledVector(o.userData.flyDir, travel);
      o.position.y = 22 + Math.sin(time * 1.5 + phase) * 0.4;
      o.rotation.z = Math.sin(time * 2 + phase) * 0.04;
    }
  });
}
