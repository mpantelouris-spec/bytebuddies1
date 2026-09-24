/**
 * GameDevWorldKit.js — Real-time 3D world accents (no PNG backdrops, no primitive forests).
 * Sky dome + terrain + lighting come from BiomeAAAKit / TrackHeroWorldKit.
 * This adds only lightweight per-biome atmosphere: distant water, particles, one focal mesh.
 */
import * as THREE from 'three';
import {
  buildAAAParticles,
  buildWaterSurface,
  buildGodRays,
} from './BiomeAAAKit.js';
import { buildGiantCrystalCluster } from './CrystalCavernHeroKit.js';
import { buildNeonRingGate } from './GalaxyHeroKit.js';

const PARTICLE_PRESETS = {
  desert_dunes_01: ['mist'],
  crystal_palace_01: ['sparkles'],
  sky_island_01: ['petals'],
  volcano_canyon_01: ['embers'],
  cyber_boulevard_01: ['rain'],
  ice_cavern_01: ['snow'],
  underwater_temple_01: ['insects'],
  moonlight_cavern_01: ['stardust'],
  forest_maze_01: ['pollen'],
  cyber_boulevard_01: ['steam'],
};

/** Distant scenery + particles — never blocks the start-line camera. */
export function installGameDevWorldAccents(world, scene, bounds, arenaType, spec) {
  const particles = PARTICLE_PRESETS[arenaType];
  if (particles?.length) {
    buildAAAParticles(world, particles, bounds, 0.18);
  }

  if (arenaType === 'desert_dunes_01') {
    world.add(buildWaterSurface(bounds, {
      width: 420,
      depth: 420,
      position: new THREE.Vector3(bounds.cx + 70, -1.2, bounds.cz),
    }));
    world.add(buildGodRays(bounds, 0xffcc88, 3));
  }

  if (arenaType === 'crystal_palace_01') {
    const crystal = buildGiantCrystalCluster(1.1);
    crystal.position.set(bounds.cx + bounds.spanX * 0.45, 0, bounds.cz - bounds.spanZ * 0.35);
    world.add(crystal);
  }

  if (arenaType === 'sky_island_01') {
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xf8f8ff,
      transparent: true,
      opacity: 0.35,
      roughness: 1,
      depthWrite: false,
      emissive: 0xe8f4ff,
      emissiveIntensity: 0.08,
    });
    for (let i = 0; i < 5; i++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(12 + i * 2, 8, 6), cloudMat);
      puff.position.set(
        bounds.cx + (i - 2) * 35,
        -28 - i * 4,
        bounds.cz + bounds.spanZ * 0.4,
      );
      puff.scale.set(2.2, 0.5, 1.8);
      world.add(puff);
    }
  }

  if (arenaType === 'moonlight_cavern_01') {
    const ring = buildNeonRingGate(22);
    ring.position.set(bounds.cx, 12, bounds.cz - bounds.spanZ * 0.55);
    world.add(ring);
  }
}
