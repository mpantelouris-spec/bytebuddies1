/**
 * RealGameTrackKit.js — Master orchestrator for 3D Mario Kart–quality worlds.
 */
import { getBiomeAAASpec } from './BiomeAAAVisualSpec.js';
import { getBiomeTrack } from './BiomeTrackRegistry.js';
import { scatterAAAGuardrails } from './BiomeAAAKit.js';
import { installTrackEnvironment } from './TrackEnvironmentKit.js';
import { installTrackSky, animateTrackSky } from './TrackSkyKit.js';
import { scatterTrackProps, animateScatteredProps } from './TrackPropScatter.js';
import { placeHeroLandmarks, animateHeroLandmarks } from './TrackHeroPlacements.js';
import { installTrackParticles, animateTrackParticles } from './TrackParticleKit.js';
import { installTrackPlayLayer, installTrackForeground } from './TrackPlayLayerKit.js';
import { animateCheckpointPulse } from './BiomeHeroShared.js';
import { buildTrackWorld, animateTrackWorld } from './TrackWorldBuilder.js';
import { enrichTrackWorldGltf } from './TrackGltfScatter.js';
import { probeTrackBundledAssets } from './TrackAssetManifest.js';
import { resnapMarkedProps } from './TrackGroundSnap.js';
import { initScenePerfBudget, scaledCount } from './TrackPerformanceKit.js';
import {
  installMK8PlayDressing,
  installMK8HeroLandmarks,
  animateMK8Quality,
} from './MK8TrackQualityKit.js';
import {
  installCupReferenceQuality,
  animateCupReferenceQuality,
} from './CupReferenceQualityKit.js';
import {
  buildCodeRacerCollectibles,
  tickCodeRacerCollectibles,
  placeSectionBillboards,
  placeStartMascot,
} from '../CodeRacerWorldKit.js';
import { getTrackStandard, isCupTrack } from './CodeRacerTrackStandards.js';

export function buildRealGameWorld(scene, curve, world, bounds, arenaType, finishT, opts = {}) {
  const track = getBiomeTrack(arenaType);
  const hw = opts.halfWidth || 4;
  const renderer = scene.userData._renderer || opts.renderer;
  const perf = initScenePerfBudget(scene);
  world.userData.trackPerfBudget = perf;
  scene.userData.trackRoadSegments = perf.roadSegments;

  const cup = isCupTrack(arenaType);  scene.userData.useReferenceBackdrop = false;
  scene.userData.trackLoading = false;
  scene.userData.sceneryPopulated = false;
  world.userData.sceneryPopulated = false;

  installTrackSky(scene, bounds, arenaType);
  try {
    installTrackEnvironment(scene, arenaType, renderer);
  } catch (err) {
    console.warn('[RealGameWorld] environment failed', arenaType, err);
  }
  // Cosmic Skyway ships its own full scenery kit; the generic station props clutter the view.
  const cosmic = arenaType === 'star_station_01';
  buildTrackWorld(world, curve, hw, bounds, arenaType, perf, scene, finishT);
  scene.userData.trackBounds = bounds;
  installMK8PlayDressing(world, curve, hw, arenaType, { qualityTier: perf.tier });
  if (cup && !cosmic) {
    installCupReferenceQuality(scene, world, curve, hw, bounds, arenaType, finishT);
  }

  if (!cosmic) {
    scatterTrackProps(world, curve, hw, bounds, arenaType, finishT, perf, scene);
    placeHeroLandmarks(world, curve, hw, arenaType, finishT);
    installMK8HeroLandmarks(world, curve, hw, bounds, arenaType, finishT);
  }

  const startGltfEnrich = () => {
    enrichTrackWorldGltf(world, curve, hw, arenaType, perf, scene, finishT)
      .then((n) => {
        console.log('[RealGameWorld] glTF enriched', arenaType, { placed: n });
        if (scene) resnapMarkedProps(scene, world);
      })
      .catch((err) => {
        console.warn('[RealGameWorld] glTF enrich failed', arenaType, err);
      });
  };

  if (cosmic) {
    world.userData.awaitGltfScenery = false;
  } else if (cup) {
    world.userData.deferGltfEnrich = true;
    world.userData.awaitGltfScenery = false;
    const later = typeof requestIdleCallback === 'function'
      ? (fn) => requestIdleCallback(fn, { timeout: 2200 })
      : (fn) => setTimeout(fn, 1600);
    later(() => {
      if (!world.parent) return;
      startGltfEnrich();
    });
  } else {
    probeTrackBundledAssets(arenaType).then((hasAssets) => {
      if (hasAssets) startGltfEnrich();
    });
  }

  if (perf?.particles) installTrackParticles(world, bounds, arenaType, perf);
  placeSectionBillboards(world, curve, hw, arenaType);

  const std = getTrackStandard(arenaType);
  if (std && !cup) {
    placeStartMascot(world, curve, finishT, std.accentColor ?? 0x44ccff);
  }

  buildCodeRacerCollectibles(scene, curve, {
    coinCount: scaledCount(cup ? 18 : 24, Math.min(perf.propMult ?? 1, 1)),
    finishT,
    halfWidth: hw,
  });

  if (track?.guardrails) {
    scatterAAAGuardrails(world, curve, hw, 0.12);
  }

  installTrackPlayLayer(world, curve, hw, arenaType, finishT);
  installTrackForeground(world, scene, curve, hw, bounds, arenaType, finishT);

  const spec = getBiomeAAASpec(arenaType);
  scene.userData.biomeAAA = true;
  scene.userData.raceVisual = {
    bloom: perf.bloom ? (spec.post?.bloom ?? 0.35) : 0,
    threshold: 0.85,
    radius: 0.35,
  };

  console.log('[RealGameWorld]', arenaType, {
    mode: cup ? '3d-cup-world' : 'themed-world-recipe+gltf-upgrade',
    tier: perf.tier,
    guardrails: track?.guardrails,
  });
}

export function animateRealGameWorld(scene, world, time) {
  animateTrackSky(scene, time);
  tickCodeRacerCollectibles(scene, time);
  animateScatteredProps(world, time);

  animateTrackWorld(world, time);
  animateHeroLandmarks(world, time);

  const perf = world.userData.trackPerfBudget || scene.userData.trackPerfBudget;
  if (perf?.particles) {
    animateTrackParticles(world, time);
  }

  animateCheckpointPulse(world, time);
  animateMK8Quality(world, time);
  animateCupReferenceQuality(world, time);

  if (scene.userData._trackLights?.key && scene.userData.biomeWorldBuilt === 'thunder_ridge_01') {
    const flash = scene.userData._thunderFlash ?? 0;
    if (time > flash) {
      scene.userData._thunderFlash = time + 4 + Math.random() * 4;
      scene.userData._trackLights.key.intensity = 2.5;
      if (scene.userData._trackLights.accent) scene.userData._trackLights.accent.intensity = 1.2;
    } else if (time > flash - 0.15) {
      scene.userData._trackLights.key.intensity = 0.7;
      if (scene.userData._trackLights.accent) scene.userData._trackLights.accent.intensity = 0.5;
    }
  }
}
