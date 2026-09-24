/**
 * WorldDensityKit.js — Layered living-world builder.
 * Foreground / midground / skyline density + wildlife + cinematic beats.
 */
import * as THREE from 'three';
import { placeAtTrack } from '../GameWorldBuilder.js';
import { cornerPosition } from './mk-track-layout.js';
import { pbrMat } from './BiomeAAAKit.js';
import { buildProp } from './WorldPropFactory.js';
import {
  buildMountainSilhouette, buildCitySkyline, buildDistantForest, buildVolcanoSilhouette,
} from './WorldPropFactory.js';
import { getWorldRecipe } from './WorldDensityRecipes.js';
import { scatterWildlife } from './BiomeLandmarkKit.js';

let _seed = 1;
const nextSeed = () => _seed++;

function pick(pool, seed) {
  return pool[seed % pool.length];
}

function scatterAlongTrackLayer(world, curve, hw, recipe, layerDef) {
  const { pool, count, lateral, step = 0.04, layer } = layerDef;
  const [latMin, latMax] = lateral;
  const isMid = layer === 'midground';
  const isFg = layer === 'foreground';
  let placed = 0;
  let i = 0;
  for (let t = 0.03; t < 0.97 && placed < count; t += step) {
    const side = (i % 2 === 0) ? 1 : -1;
    const lat = hw + latMin + (nextSeed() % 100) / 100 * (latMax - latMin);
    const propType = pick(pool, nextSeed());
    const prop = buildProp(propType, nextSeed(), {});
    const { pos, frame } = placeAtTrack(curve, t, side * lat, 0);
    prop.position.copy(pos);
    prop.position.y = 0.15;
    if (isMid) prop.scale.multiplyScalar(2.2);
    else if (isFg && !['tire_mark', 'oil_stain', 'pebbles'].includes(propType)) prop.scale.multiplyScalar(1.6);
    prop.rotation.y = (frame.rot ?? 0) + (side < 0 ? Math.PI : 0) + (nextSeed() % 100) / 100 * 0.5;
    prop.name = `density-${layerDef.layer}-${propType}`;
    world.add(prop);
    placed++;
    i++;
  }
}

function buildSkyline(world, scene, bounds, skylineDefs, spec) {
  if (!skylineDefs?.length) return;
  const group = new THREE.Group();
  group.name = 'world-skyline';

  skylineDefs.forEach((def, idx) => {
    const positions = def.positions || ['n'];
    positions.forEach((corner) => {
      const seed = nextSeed();
      let silhouette;
      if (def.type === 'mountain') {
        silhouette = buildMountainSilhouette(90 + (seed % 40), 40 + (seed % 20), seed, def.color || 0x556677);
        silhouette.scale.set(1.8, 1.8, 1);
      } else if (def.type === 'city') {
        silhouette = buildCitySkyline(80 + (seed % 20), seed);
      } else if (def.type === 'forest') {
        silhouette = buildDistantForest(65 + (seed % 25), seed, def.color || 0x2a5a2a);
      } else if (def.type === 'volcano') {
        silhouette = buildVolcanoSilhouette(seed);
      } else if (def.type === 'ocean') {
        silhouette = new THREE.Mesh(
          new THREE.PlaneGeometry(bounds.spanX + 100, 50),
          pbrMat(0x1a6b9a, { roughness: 0.1, metalness: 0.4, emissive: 0x0a4466, emi: 0.15 }),
        );
        silhouette.rotation.x = -Math.PI / 2;
      } else if (def.type === 'cloud_ocean') {
        silhouette = new THREE.Mesh(
          new THREE.PlaneGeometry(bounds.spanX + 80, 60),
          pbrMat(0xffffff, { roughness: 1, transparent: true, opacity: 0.7 }),
        );
        silhouette.rotation.x = -Math.PI / 2;
        silhouette.position.y = -8;
      } else if (def.type === 'aurora' || def.type === 'nebula') {
        silhouette = new THREE.Mesh(
          new THREE.PlaneGeometry(bounds.spanX + 60, 20),
          pbrMat(def.type === 'aurora' ? 0x44ffaa : 0x8844ff, {
            emissive: def.type === 'aurora' ? 0x22cc88 : 0x6622cc, emi: 0.5,
            transparent: true, opacity: 0.35, side: THREE.DoubleSide,
          }),
        );
        silhouette.userData.pulse = true;
        silhouette.position.y = 35;
      } else {
        return;
      }

      if (corner === 'center') {
        silhouette.position.set(bounds.cx, silhouette.position.y || 0, bounds.cz - bounds.radius - 30);
      } else {
        const spot = cornerPosition(bounds, corner, 28 + (seed % 10));
        silhouette.position.set(spot.x, silhouette.position.y || 0, spot.z);
        if (def.type === 'mountain' || def.type === 'forest' || def.type === 'volcano' || def.type === 'city') {
          silhouette.position.y = 0;
        }
      }
      silhouette.rotation.y = (seed % 100) / 100 * 0.3;
      group.add(silhouette);
    });
  });

  world.add(group);
}

function spawnWildlife(world, bounds, types) {
  types?.forEach((type) => {
    if (type === 'sparkle' || type === 'ember' || type === 'snow' || type === 'comet' || type === 'spark' || type === 'drone') {
      spawnAmbientParticles(world, bounds, type);
    } else {
      scatterWildlife(world, bounds, type, 4 + (nextSeed() % 4));
    }
  });
}

function spawnAmbientParticles(world, bounds, type) {
  const colors = {
    sparkle: 0x00ffff, ember: 0xff4400, snow: 0xffffff,
    comet: 0xaaaaff, spark: 0xffff44, drone: 0x00ffff,
  };
  const col = colors[type] || 0xffffff;
  const count = type === 'snow' ? 40 : 20;
  for (let i = 0; i < count; i++) {
    const p = new THREE.Mesh(
      new THREE.SphereGeometry(0.06 + Math.random() * 0.1, 4, 4),
      pbrMat(col, { emissive: col, emi: 0.8, transparent: true, opacity: 0.7 }),
    );
    p.position.set(
      bounds.cx + (Math.random() - 0.5) * bounds.spanX * 0.8,
      1 + Math.random() * 15,
      bounds.cz + (Math.random() - 0.5) * bounds.spanZ * 0.8,
    );
    p.userData.ambientType = type;
    p.userData.baseX = p.position.x;
    p.userData.baseY = p.position.y;
    p.userData.baseZ = p.position.z;
    p.userData.phase = i * 0.7;
    world.add(p);
  }
}

function placeCinematicBeats(world, curve, beats) {
  if (!beats?.length) return;
  const beatGroup = new THREE.Group();
  beatGroup.name = 'cinematic-beats';
  beats.forEach((beat, i) => {
    const marker = new THREE.Group();
    const { pos, frame } = placeAtTrack(curve, beat.t, 0, 0);
    marker.position.copy(pos);
    marker.userData.beat = beat;
    marker.userData.beatIndex = i;
    // Subtle visual hint — glowing ring at beat point (visible from distance)
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(3, 0.06, 6, 20),
      pbrMat(0xffffff, { emissive: 0xffffff, emi: 0.3, transparent: true, opacity: 0.15 }),
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.5;
    ring.userData.beatRing = true;
    ring.userData.phase = i;
    marker.add(ring);
    beatGroup.add(marker);
  });
  world.userData.cinematicBeats = beats;
  world.add(beatGroup);
}

export function animateLivingWorld(world, time) {
  world.traverse((obj) => {
    if (obj.userData.wave) {
      obj.rotation.z = Math.sin(time * 3 + (obj.userData.phase || 0)) * 0.15;
    }
    if (obj.userData.flicker) {
      const flick = 0.7 + Math.sin(time * 8 + (obj.userData.phase || 0)) * 0.3;
      if (obj.children) {
        obj.children.forEach((c) => {
          if (c.isLight) c.intensity = flick * 0.8;
        });
      }
    }
    if (obj.userData.pulse) {
      obj.material.opacity = 0.2 + Math.sin(time * 0.8) * 0.12;
      if (obj.material.emissiveIntensity !== undefined) {
        obj.material.emissiveIntensity = 0.5 + Math.sin(time * 1.2) * 0.3;
      }
    }
    if (obj.userData.beatRing) {
      obj.material.opacity = 0.08 + Math.sin(time * 2 + (obj.userData.phase || 0)) * 0.06;
      obj.rotation.z = time * 0.3;
    }
    if (obj.userData.ambientType) {
      const t = obj.userData.ambientType;
      const ph = obj.userData.phase || 0;
      if (t === 'ember' || t === 'sparkle' || t === 'spark') {
        obj.position.y = obj.userData.baseY + Math.sin(time * 2 + ph) * 2;
        obj.position.x = obj.userData.baseX + Math.sin(time * 0.5 + ph) * 1.5;
      } else if (t === 'snow') {
        obj.position.y = obj.userData.baseY - ((time * 0.5 + ph) % 12);
        if (obj.position.y < 0) obj.position.y = obj.userData.baseY + 12;
      } else if (t === 'comet' || t === 'drone') {
        obj.position.x = obj.userData.baseX + Math.sin(time * 0.3 + ph) * 20;
        obj.position.z = obj.userData.baseZ + Math.cos(time * 0.2 + ph) * 10;
        obj.position.y = obj.userData.baseY + Math.sin(time * 0.4 + ph) * 3;
      }
    }
    if (obj.userData.grazePhase !== undefined) {
      obj.rotation.z = Math.sin(time * 1.5 + obj.userData.grazePhase) * 0.08;
    }
    if (obj.userData.spin) {
      obj.rotation.z += 0.01;
    }
  });
}

/**
 * Build layered living-world density for a biome circuit.
 */
export function buildLivingWorld(world, scene, curve, bounds, arenaType, { hw = 3.5, spec } = {}) {
  _seed = Math.floor((bounds.cx * 7 + bounds.cz * 13) % 10000) + 1;
  const recipe = getWorldRecipe(arenaType);

  world.userData.worldStory = recipe.story;
  world.userData.worldDensityVersion = 2;

  recipe.layers?.forEach((layerDef) => {
    scatterAlongTrackLayer(world, curve, hw, recipe, layerDef);
  });

  buildSkyline(world, scene, bounds, recipe.skyline, spec);
  spawnWildlife(world, bounds, recipe.wildlife);
  placeCinematicBeats(world, curve, recipe.beats);

  const prevTick = world.userData.animTick;
  world.userData.animTick = (time) => {
    prevTick?.(time);
    animateLivingWorld(world, time);
  };

  return { recipe, beatCount: recipe.beats?.length || 0 };
}

export function getWorldStory(arenaType) {
  return getWorldRecipe(arenaType).story;
}
