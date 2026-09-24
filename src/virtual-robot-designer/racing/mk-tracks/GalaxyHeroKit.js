/**
 * GalaxyHeroKit.js — Track 8: Stardust Galaxy Drift (cosmic surreal).
 */
import * as THREE from 'three';
import { placeAtTrack } from '../GameWorldBuilder.js';
import { pbrMat } from './BiomeAAAKit.js';
import { buildWideCheckeredStart } from './SunsetCoastHeroKit.js';
import { buildCheckpointArch, placeCheckpointArches, placeBoostPads } from './BiomeHeroShared.js';
import { getTrackStandard } from './CodeRacerTrackStandards.js';

export { buildWideCheckeredStart };

export function buildNeonRingGate(radius = 6) {
  const g = new THREE.Group();
  g.name = 'neon-ring-gate';
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(radius, 0.35, 12, 48),
    pbrMat(0x8a2be2, { emissive: 0x8a2be2, emi: 3.0, metalness: 0.5 }),
  );
  ring.rotation.x = Math.PI / 2;
  g.add(ring);
  g.add(new THREE.PointLight(0x8a2be2, 4, 30));
  g.userData.pulse = true;
  g.userData.glowMat = ring.material;
  return g;
}

export function buildAsteroidPlatform(r = 5, variant = 0) {
  const g = new THREE.Group();
  const shapes = [
    () => new THREE.DodecahedronGeometry(r, 1),
    () => new THREE.IcosahedronGeometry(r, 0),
    () => new THREE.SphereGeometry(r, 10, 8),
  ];
  const rock = new THREE.Mesh(
    shapes[variant % 3](),
    pbrMat(0x4a3a5a, { roughness: 0.85, metalness: 0.2 }),
  );
  rock.scale.set(1.2, 0.6, 1);
  g.add(rock);
  return g;
}

export function buildAlienSpectatorBooth() {
  const g = new THREE.Group();
  g.name = 'alien-spectator-booth';
  const booth = new THREE.Mesh(
    new THREE.BoxGeometry(3, 2.5, 2),
    pbrMat(0x334466, { metalness: 0.4, roughness: 0.5 }),
  );
  booth.position.y = 1.25;
  g.add(booth);
  const awning = new THREE.Mesh(
    new THREE.BoxGeometry(3.4, 0.15, 2.4),
    pbrMat(0x8a2be2, { emissive: 0x6a1bc2, emi: 0.5 }),
  );
  awning.position.y = 2.6;
  g.add(awning);
  const alien = buildAlienSpectator();
  alien.position.set(0, 0, 0.3);
  g.add(alien);
  const flagPole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.04, 2, 6),
    pbrMat(0xaaaaaa, { metalness: 0.7 }),
  );
  flagPole.position.set(1.2, 2, 0);
  g.add(flagPole);
  const boothFlag = new THREE.Mesh(
    new THREE.PlaneGeometry(0.8, 0.5),
    pbrMat(0x00ffaa, { emissive: 0x00ffaa, emi: 0.6 }),
  );
  boothFlag.position.set(1.6, 2.5, 0);
  g.add(boothFlag);
  return g;
}

export function buildCosmicObservatory() {
  const g = new THREE.Group();
  g.name = 'cosmic-observatory';
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(5, 6, 1.2, 16),
    pbrMat(0x3a3a5a, { metalness: 0.5, roughness: 0.4 }),
  );
  base.position.y = 0.6;
  g.add(base);
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(4.5, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    pbrMat(0x6688cc, { emissive: 0x4466aa, emi: 0.25, metalness: 0.6, transparent: true, opacity: 0.85 }),
  );
  dome.position.y = 1.2;
  g.add(dome);
  const telescope = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.5, 6, 8),
    pbrMat(0xcccccc, { metalness: 0.8 }),
  );
  telescope.rotation.z = Math.PI / 2.8;
  telescope.position.set(0, 3.5, 2);
  g.add(telescope);
  g.add(new THREE.PointLight(0x88aaff, 2, 20).translateY(3));
  return g;
}

export function buildAlienSpectator() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.4, 0.8, 4, 8), pbrMat(0x00ff88, { emissive: 0x00ff88, emi: 0.4 }));
  body.position.y = 1;
  g.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 10), pbrMat(0x88ffcc, { emissive: 0x44ffaa, emi: 0.5 }));
  head.position.y = 1.8;
  g.add(head);
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.4), pbrMat(0xff69b4, { emissive: 0xff69b4, emi: 0.6 }));
  flag.position.set(0.5, 1.5, 0);
  g.add(flag);
  return g;
}

export function buildStartHeroSet(curve, hw, finishT = 0) {
  const g = new THREE.Group();
  const ring = buildNeonRingGate(6);
  const { pos: rp, frame: rf } = placeAtTrack(curve, finishT + 0.05, 0, 0);
  ring.position.copy(rp);
  ring.rotation.y = rf.rot ?? 0;
  g.add(ring);

  const asteroid = buildAsteroidPlatform(6);
  const { pos: ap } = placeAtTrack(curve, finishT + 0.01, -(hw + 8), 0);
  asteroid.position.copy(ap);
  asteroid.position.y = -1;
  g.add(asteroid);
  return g;
}

export function placeGalaxyScenery(world, curve, hw, bounds) {
  // Neon ring gate at start (scenery complement to start hero set)
  const startGate = buildNeonRingGate(7);
  const { pos: sgPos, frame: sgFrame } = placeAtTrack(curve, 0.02, 0, 0);
  startGate.position.copy(sgPos);
  startGate.rotation.y = sgFrame.rot ?? 0;
  world.add(startGate);

  // 9 asteroid platforms — varied dodecahedrons, icosahedrons, and spheres
  for (let i = 0; i < 9; i++) {
    const ast = buildAsteroidPlatform(2 + (i % 4) * 1.5, i);
    const t = 0.08 + (i / 9) * 0.84;
    const { pos } = placeAtTrack(curve, t, (i % 2 ? 1 : -1) * (hw + 12 + i), 0);
    ast.position.copy(pos);
    ast.position.y = -2 - (i % 3);
    world.add(ast);
  }

  // Nebula tunnel fog volume at t=0.4
  for (let i = 0; i < 12; i++) {
    const t = 0.36 + (i / 11) * 0.08;
    const fogVol = new THREE.Mesh(
      new THREE.BoxGeometry(hw * 2.5, 6, 4),
      new THREE.MeshBasicMaterial({
        color: i % 2 ? 0x8a2be2 : 0xff69b4,
        transparent: true,
        opacity: 0.12,
        fog: false,
        depthWrite: false,
      }),
    );
    const { pos, frame } = placeAtTrack(curve, t, 0, 0);
    fogVol.position.copy(pos);
    fogVol.position.y = 3;
    fogVol.rotation.y = frame.rot ?? 0;
    fogVol.userData.nebulaFog = true;
    fogVol.userData.fogPhase = i * 0.5;
    world.add(fogVol);
  }

  // Alien spectators + 3 cute spectator booths
  for (let i = 0; i < 6; i++) {
    const alien = buildAlienSpectator();
    const { pos, frame } = placeAtTrack(curve, 0.1 + i * 0.12, hw + 8, 0);
    alien.position.copy(pos);
    alien.rotation.y = frame.rot ?? 0;
    world.add(alien);
  }
  [0.22, 0.5, 0.82].forEach((t, i) => {
    const booth = buildAlienSpectatorBooth();
    const side = i % 2 ? 1 : -1;
    const { pos, frame } = placeAtTrack(curve, t, side * (hw + 10), 0);
    booth.position.copy(pos);
    booth.rotation.y = (frame.rot ?? 0) + (side < 0 ? Math.PI : 0);
    world.add(booth);
  });

  // Ringed gas giant — far background
  const planet = new THREE.Mesh(new THREE.SphereGeometry(22, 28, 24), pbrMat(0x6644aa, { emissive: 0x442266, emi: 0.15 }));
  planet.position.set(bounds.cx + 80, 20, bounds.cz - 55);
  world.add(planet);
  const planetRing = new THREE.Mesh(
    new THREE.TorusGeometry(30, 2.5, 8, 56),
    pbrMat(0xccaaee, { emissive: 0xaa88cc, emi: 0.2, transparent: true, opacity: 0.7 }),
  );
  planetRing.rotation.x = Math.PI / 2.5;
  planetRing.position.copy(planet.position);
  world.add(planetRing);

  // Mini moon — 8 m diameter at t=0.72
  const moon = new THREE.Mesh(new THREE.SphereGeometry(4, 18, 16), pbrMat(0xcccccc, { roughness: 0.9 }));
  const { pos: mp } = placeAtTrack(curve, 0.72, hw + 15, 0);
  moon.position.copy(mp);
  moon.position.y = 8;
  world.add(moon);
  const moonCrater = new THREE.Mesh(
    new THREE.SphereGeometry(0.8, 8, 8),
    pbrMat(0x999999, { roughness: 1 }),
  );
  moonCrater.position.copy(mp);
  moonCrater.position.y = 8.5;
  moonCrater.position.x += 1.5;
  world.add(moonCrater);

  // Cosmic observatory dome
  const observatory = buildCosmicObservatory();
  const { pos: op, frame: of } = placeAtTrack(curve, 0.68, -(hw + 18), 0);
  observatory.position.copy(op);
  observatory.rotation.y = of.rot ?? 0;
  world.add(observatory);
}

export function buildEmissiveGrooves(curve, hw) {
  const g = new THREE.Group();
  const grooveMat = pbrMat(0xffffff, { emissive: 0xffffff, emi: 2.5, metalness: 0.6 });
  const offsets = [-hw * 0.4, hw * 0.4];
  for (let i = 0; i < 65; i++) {
    const t = i / 65;
    offsets.forEach((off) => {
      const { pos, frame } = placeAtTrack(curve, t, off, 0.06);
      const groove = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.04, 2), grooveMat);
      groove.position.copy(pos);
      groove.rotation.y = frame.rot ?? 0;
      g.add(groove);
    });
  }
  return g;
}

export function placeGalaxyCheckpoints(world, curve, hw) {
  const std = getTrackStandard('moonlight_cavern_01');
  placeCheckpointArches(world, curve, hw, std.checkpointTs, std.checkpointColors);
  placeBoostPads(world, curve, std.boostTs);
}

export function animateGalaxy(world, time) {
  world.traverse((o) => {
    if (o.userData?.pulse && o.userData?.glowMat) {
      o.userData.glowMat.emissiveIntensity = 2.5 + Math.sin(time * 2.5) * 0.8;
    }
    if (o.userData?.nebulaFog && o.material) {
      const phase = o.userData.fogPhase ?? 0;
      o.material.opacity = 0.08 + Math.sin(time * 1.2 + phase) * 0.06;
    }
  });
}
