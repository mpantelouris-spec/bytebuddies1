/**
 * MissionGltfScatter — Kenney glTF enrichment for mission routes (reuses TrackGltfScatter).
 */
import { enrichTrackWorldGltf } from '../../racing/mk-tracks/TrackGltfScatter.js';
import { initScenePerfBudget } from '../../racing/mk-tracks/TrackPerformanceKit.js';
import { getMissionFamilySpec } from './MissionFamilyVisualSpec.js';

/** Async glTF scatter along mission curve — primitives must already exist. */
export async function enrichMissionWorldGltf(scene, world, curve, environmentId) {
  if (!curve || !world) return 0;
  const spec = getMissionFamilySpec(environmentId);
  const trackId = spec.gltfTrack;
  // A mismatched asset pack is visually worse than primitives. Families with
  // bespoke dressing can explicitly opt out until a matching pack exists.
  if (!trackId) return 0;
  const perf = initScenePerfBudget(scene);
  const hw = 4;
  try {
    const placed = await enrichTrackWorldGltf(world, curve, hw, trackId, perf, scene, 0);
    console.log('[MissionWorld] glTF enriched', environmentId, trackId, { placed });
    scene.userData.sceneryPopulated = true;
    return placed;
  } catch (err) {
    console.warn('[MissionWorld] glTF enrich failed', environmentId, err);
    return 0;
  }
}
