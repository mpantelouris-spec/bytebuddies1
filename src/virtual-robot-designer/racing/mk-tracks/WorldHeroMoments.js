/**
 * WorldHeroMoments.js — Oversized cinematic set pieces visible from the chase camera.
 * Placed at cinematic beat points along each circuit.
 */
import * as THREE from 'three';
import { pbrMat } from './BiomeAAAKit.js';
import { placeAtTrack } from '../GameWorldBuilder.js';

function arch(span, height, color, emissive = 0) {
  const g = new THREE.Group();
  const mat = pbrMat(color, { roughness: 0.6, emissive, emi: emissive ? 0.6 : 0 });
  const pillar = (x) => {
    const p = new THREE.Mesh(new THREE.BoxGeometry(2.5, height, 2.5), mat);
    p.position.set(x, height / 2, 0);
    g.add(p);
  };
  pillar(-span / 2);
  pillar(span / 2);
  const top = new THREE.Mesh(new THREE.BoxGeometry(span + 3, 3, 3), mat);
  top.position.y = height;
  g.add(top);
  return g;
}

const HERO_BUILDERS = {
  desert_dunes_01: (i) => {
    const g = arch(22 + (i % 2) * 8, 14 + (i % 3) * 4, 0xc4a882);
    const beacon = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 2, 6, 8), pbrMat(0xffaa44, { emissive: 0xff8800, emi: 1.2 }));
    beacon.position.set(0, 20, 0);
    g.add(beacon);
    return g;
  },
  crystal_palace_01: (i) => {
    const g = new THREE.Group();
    for (let c = 0; c < 5; c++) {
      const spire = new THREE.Mesh(new THREE.ConeGeometry(2 + c * 0.5, 12 + c * 4, 6), pbrMat(0x00ffff, { emissive: 0x00ccff, emi: 0.9, transmission: 0.2 }));
      spire.position.set((c - 2) * 4, 6 + c * 2, 0);
      g.add(spire);
    }
    return g;
  },
  sky_island_01: (i) => {
    const g = new THREE.Group();
    const temple = new THREE.Mesh(new THREE.BoxGeometry(10, 8, 10), pbrMat(0xf5f0e8, { roughness: 0.4 }));
    temple.position.y = 4;
    g.add(temple);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(8, 6, 4), pbrMat(0xffd700, { emissive: 0xffaa00, emi: 0.4 }));
    roof.position.y = 11;
    roof.rotation.y = Math.PI / 4;
    g.add(roof);
    return g;
  },
  volcano_canyon_01: (i) => {
    const g = new THREE.Group();
    const fall = new THREE.Mesh(new THREE.BoxGeometry(6, 16, 1), pbrMat(0xff4400, { emissive: 0xff2200, emi: 1.0 }));
    fall.position.set(0, 8, 0);
    g.add(fall);
    const rocks = new THREE.Mesh(new THREE.DodecahedronGeometry(5, 0), pbrMat(0x3a2a22, { roughness: 0.9 }));
    rocks.position.set(8, 2.5, 0);
    g.add(rocks);
    return g;
  },
  cyber_boulevard_01: (i) => {
    const g = new THREE.Group();
    const col = [0xff00ff, 0x00ffff][i % 2];
    const tower = new THREE.Mesh(new THREE.BoxGeometry(6, 28 + (i % 3) * 6, 6), pbrMat(0x1a1a2a, { emissive: col, emi: 0.5 }));
    tower.position.y = 14;
    g.add(tower);
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(12, 4), pbrMat(col, { emissive: col, emi: 1.0, side: THREE.DoubleSide }));
    sign.position.set(0, 22, 3.2);
    g.add(sign);
    return g;
  },
  ice_cavern_01: (i) => {
    const g = new THREE.Group();
    const castle = new THREE.Mesh(new THREE.BoxGeometry(14, 12, 10), pbrMat(0xddeeff, { roughness: 0.3, emissive: 0xaaccff, emi: 0.2 }));
    castle.position.y = 6;
    g.add(castle);
    for (let t = 0; t < 4; t++) {
      const spire = new THREE.Mesh(new THREE.ConeGeometry(2, 8, 4), pbrMat(0xffffff, { emissive: 0xccddff, emi: 0.3 }));
      spire.position.set(-5 + t * 3.5, 16, 0);
      g.add(spire);
    }
    return g;
  },
  underwater_temple_01: (i) => {
    const g = new THREE.Group();
    const pyramid = new THREE.Mesh(new THREE.ConeGeometry(10, 18, 4), pbrMat(0x8b7355, { roughness: 0.8 }));
    pyramid.position.y = 9;
    pyramid.rotation.y = Math.PI / 4;
    g.add(pyramid);
    const face = new THREE.Mesh(new THREE.BoxGeometry(8, 10, 2), pbrMat(0x7a6348));
    face.position.set(0, 8, 6);
    g.add(face);
    return g;
  },
  moonlight_cavern_01: (i) => {
    const g = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.TorusGeometry(8, 0.4, 8, 32), pbrMat(0xaa88ff, { emissive: 0x8844ff, emi: 0.8, transparent: true, opacity: 0.8 }));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 10;
    g.add(ring);
    const planet = new THREE.Mesh(new THREE.SphereGeometry(5, 16, 12), pbrMat(0x4466aa, { emissive: 0x2244aa, emi: 0.3 }));
    planet.position.set(0, 10, 0);
    g.add(planet);
    return g;
  },
  forest_maze_01: (i) => {
    const g = new THREE.Group();
    const mill = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(3, 4, 6, 8), pbrMat(0xd4c4a8));
    base.position.y = 3;
    mill.add(base);
    const blades = new THREE.Mesh(new THREE.BoxGeometry(14, 0.5, 1.5), pbrMat(0xffffff));
    blades.position.y = 8;
    blades.userData.spin = true;
    mill.add(blades);
    g.add(mill);
    return g;
  },
  cyber_boulevard_01: (i) => {
    const g = new THREE.Group();
    const tunnel = arch(18, 12, 0x444444, 0xffff44);
    g.add(tunnel);
    const steam = new THREE.Mesh(new THREE.SphereGeometry(3, 8, 6), pbrMat(0xcccccc, { transparent: true, opacity: 0.4 }));
    steam.position.set(0, 2, 4);
    steam.userData.pulse = true;
    g.add(steam);
    return g;
  },
};

export function buildHeroMoment(arenaType, beatIndex) {
  const fn = HERO_BUILDERS[arenaType] || HERO_BUILDERS.desert_dunes_01;
  return fn(beatIndex);
}

/** Place oversized hero set pieces at cinematic beat points — always visible from chase cam. */
export function placeHeroMoments(world, curve, arenaType, beats, hw) {
  if (!beats?.length) return;
  const group = new THREE.Group();
  group.name = 'hero-moments';
  beats.forEach((beat, i) => {
    const side = i % 2 === 0 ? 1 : -1;
    const lateral = hw + 10 + (i % 3) * 3;
    const { pos, frame } = placeAtTrack(curve, beat.t, side * lateral, 0);
    const hero = buildHeroMoment(arenaType, i);
    hero.position.copy(pos);
    hero.position.y = 0.15;
    hero.rotation.y = (frame.rot ?? 0) + (side < 0 ? Math.PI : 0);
    hero.name = `hero-${beat.type}-${i}`;
    hero.userData.cinematicBeat = beat;
    group.add(hero);

    // Tall glowing marker pole — unmistakable from any angle
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.2, 8, 6),
      pbrMat(0xffffff, { emissive: 0xffaa44, emi: 0.8 }),
    );
    pole.position.set(pos.x + side * 2, 4, pos.z);
    group.add(pole);
  });
  world.add(group);
}
