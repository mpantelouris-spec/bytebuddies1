/**
 * TrackHeroPlacements.js — Hero landmarks per track spec.
 */
import * as THREE from 'three';
import { placeAtTrack } from '../GameWorldBuilder.js';
import { getTrackStandard } from './CodeRacerTrackStandards.js';
import { buildCheckpointArch } from './BiomeHeroShared.js';
import { pbrMat } from './BiomeAAAKit.js';
import {
  buildFerrisWheel, buildGear, buildToadstool, buildWindmill,
} from './TrackPropBuilders.js';
import { buildTitleBillboard } from './PremiumTrackKit.js';

function buildHibiscusArch(hw) {
  const g = new THREE.Group();
  g.name = 'hero-hibiscus-arch';
  const archW = hw * 2.2;
  const pink = pbrMat(0xff69b4, { emissive: 0xff1493, emi: 0.8, roughness: 0.2 });
  const green = pbrMat(0x2e8b2e, { emissive: 0x1a6b1a, emi: 0.2 });
  [-archW / 2, archW / 2].forEach((x) => {
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.4, 8, 6), green);
    stem.position.set(x, 4, 0);
    g.add(stem);
  });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI;
    const petal = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 6), pink);
    petal.position.set(Math.cos(a) * archW / 2, 9 + Math.sin(a) * 2, Math.sin(a) * 0.5);
    petal.scale.set(1.8, 0.5, 1.2);
    g.add(petal);
  }
  const center = new THREE.Mesh(new THREE.SphereGeometry(1.5, 8, 8), pbrMat(0xffd700, { emissive: 0xffd700, emi: 0.6 }));
  center.position.y = 10;
  g.add(center);
  return g;
}

function buildTicketBoothArch(hw) {
  const g = new THREE.Group();
  g.name = 'hero-ticket-arch';
  const arch = buildCheckpointArch(hw, 0xff69b4, { sign: 'CARNIVAL', stone: false });
  g.add(arch);
  const bill = buildTitleBillboard('CARNIVAL', 0xff69b4, 0xffd700, 14, 3.5);
  bill.position.set(0, 7, 0.5);
  g.add(bill);
  return g;
}

function buildDepartureArch(hw) {
  return buildCheckpointArch(hw, 0x00ffff, { sign: 'DEPARTURES', plaque: 'METRO', stone: true });
}

function buildCastleGateArch(hw) {
  const g = new THREE.Group();
  g.name = 'hero-castle-gate';
  const archW = hw * 2.4;
  const stone = pbrMat(0x9a9aaa, { roughness: 0.85 });
  [-archW / 2, archW / 2].forEach((x) => {
    const tower = new THREE.Mesh(new THREE.BoxGeometry(2.5, 10, 2.5), stone);
    tower.position.set(x, 5, 0);
    g.add(tower);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(2, 2.5, 4), pbrMat(0x4169e1, { emissive: 0x2244aa, emi: 0.2 }));
    roof.position.set(x, 11.5, 0);
    roof.rotation.y = Math.PI / 4;
    g.add(roof);
  });
  const gate = new THREE.Mesh(new THREE.BoxGeometry(archW, 1.2, 0.8), pbrMat(0xffd700, { metalness: 0.7, emissive: 0xffd700, emi: 0.3 }));
  gate.position.y = 6;
  g.add(gate);
  const arch = buildCheckpointArch(hw, 0xffd700, { sign: 'CITADEL', stone: true });
  arch.position.y = 0;
  g.add(arch);
  return g;
}

function buildRuneArch(hw) {
  return buildCheckpointArch(hw, 0x7cfc00, { sign: 'TEMPLE', plaque: 'RUNES', stone: true });
}

function buildIceBridge(hw) {
  const g = new THREE.Group();
  g.name = 'hero-ice-bridge';
  const ice = pbrMat(0xb8ddf0, { emissive: 0x88ccff, emi: 0.35, transmission: 0.5, transparent: true, opacity: 0.85 });
  const deck = new THREE.Mesh(new THREE.BoxGeometry(hw * 2.5, 0.4, 16), ice);
  deck.position.y = 0.2;
  g.add(deck);
  for (let i = 0; i < 6; i++) {
    const icicle = new THREE.Mesh(new THREE.ConeGeometry(0.25, 2, 4), ice);
    icicle.position.set(-hw + i * (hw * 2 / 5), -1, (i % 2 ? 7 : -7));
    icicle.rotation.x = Math.PI;
    g.add(icicle);
  }
  return g;
}

function buildGearArch(hw) {
  const g = new THREE.Group();
  g.name = 'hero-gear-arch';
  const gearL = buildGear(1.2);
  gearL.position.set(-hw - 1, 6, 0);
  g.add(gearL);
  const gearR = buildGear(1.0);
  gearR.position.set(hw + 1, 7, 0);
  g.add(gearR);
  const arch = buildCheckpointArch(hw, 0xff4500, { sign: 'FORGE', stone: true });
  g.add(arch);
  return g;
}

function buildAirlockArch(hw) {
  const g = new THREE.Group();
  g.name = 'hero-airlock-arch';
  const arch = buildCheckpointArch(hw, 0x00ffff, { sign: 'AIRLOCK', plaque: 'EARTH VIEW', stone: false });
  g.add(arch);
  const window = new THREE.Mesh(
    new THREE.PlaneGeometry(8, 5),
    pbrMat(0x2266aa, { emissive: 0x114488, emi: 0.3, transparent: true, opacity: 0.8 }),
  );
  window.position.set(0, 5, -3);
  g.add(window);
  return g;
}

function buildToadstoolArch(hw) {
  const g = new THREE.Group();
  g.name = 'hero-toadstool-arch';
  const left = buildToadstool(1.8);
  left.position.set(-hw - 1.5, 0, 0);
  g.add(left);
  const right = buildToadstool(1.8);
  right.position.set(hw + 1.5, 0, 0);
  g.add(right);
  const arch = buildCheckpointArch(hw, 0x7cfc00, { sign: 'FAIRY GLEN', stone: false });
  arch.position.y = 1;
  g.add(arch);
  return g;
}

function buildWindmillHero() {
  const g = buildWindmill(1.1);
  g.name = 'hero-windmill';
  return g;
}

const HERO_BUILDERS = {
  sunset_cove_01: (hw) => buildHibiscusArch(hw),
  candy_carnival_01: (hw) => buildTicketBoothArch(hw),
  neon_metro_01: (hw) => buildDepartureArch(hw),
  cloud_citadel_01: (hw) => buildCastleGateArch(hw),
  jungle_ruins_01: (hw) => buildRuneArch(hw),
  frost_peak_01: (hw) => buildIceBridge(hw),
  lava_foundry_01: (hw) => buildGearArch(hw),
  star_station_01: (hw) => buildAirlockArch(hw),
  fairy_glen_01: (hw) => buildToadstoolArch(hw),
  thunder_ridge_01: () => buildWindmillHero(),
};

export function placeHeroLandmarks(world, curve, hw, arenaType, finishT) {
  const std = getTrackStandard(arenaType);
  const heroT = std?.heroT ?? 0.45;
  const builder = HERO_BUILDERS[arenaType];
  if (!builder) return;

  const hero = builder(hw);
  // Cup tracks: hero arches off the road — never span the centerline / crossover.
  const vistaLateral = {
    sunset_cove_01: hw + 26,
    candy_carnival_01: hw + 24,
  }[arenaType] ?? 0;
  const { pos, frame } = placeAtTrack(curve, heroT, vistaLateral, 0);
  hero.position.copy(pos);
  hero.rotation.y = (frame.rot ?? 0) + (vistaLateral ? Math.PI / 2 : 0);
  hero.userData.groundSnap = true;
  hero.userData.groundSnapOffset = 0;
  world.add(hero);
}

export function animateHeroLandmarks(world, time) {
  world.traverse((obj) => {
    if (obj.name === 'hero-windmill' || obj.name === 'prop-windmill') {
      const blades = obj.getObjectByName('windmill-blades');
      if (blades) blades.rotation.z = time * 0.6;
    }
    if (obj.name === 'hero-gear-arch') {
      obj.children.forEach((c) => {
        if (c.name === 'prop-gear') c.rotation.z = time * 0.4;
      });
    }
  });
}
