# CodeRacer Track Graphics Report — v47-graphics-pass

**Build:** `2026-08-16-v47-graphics-pass`  
**Date:** 2026-08-16  
**Method:** Code + asset pipeline audit; browser playtest still required per track.

## Root fixes in this pass

| Issue | Fix |
|-------|-----|
| Ocean hidden under 160m tan disc | Coastal sand pad + ocean offset toward horizon (`bounds.cz - 82`) |
| glTF loaded before road (bad snap) | Cup tracks defer `enrichTrackWorldGltf` until after road mesh in `RacingCourse.js` |
| Primitive boxes stacked with glTF | Bundled tracks skip primitive buildings/scatter; Kenney glTF only |
| Orange road slabs | `buildStoneSlabRoadOverlay` removed from all `installMK8PlayDressing` paths |
| Flat dark sky | Sky dome horizon color drives `scene.background` |
| Low tier empty worlds | Low tier: 18 scatter/side, 0.78 propMult, min 28 glTF instances |
| Sunset duplicate ocean at center | Removed from `TrackPropScatter` SCATTER_CONFIG |

## glTF assets

- **60 Kenney CC0 `.glb` files** present under `public/assets/tracks/<track_id>/`
- Production serves them (e.g. `palm_tree.glb` HTTP 200)
- Installer: `node scripts/install-kenney-track-assets.mjs` (if packs missing)

## Per-track status (honest)

| Track | Vista | glTF | Density target (25+) | Child "wow" test |
|-------|-------|------|------------------------|------------------|
| sunset_cove_01 | Ocean offset + island/palms | Yes | Expected PASS after glTF enrich | **Needs browser verify** |
| candy_carnival_01 | Midway vista ferris/tents | Yes | Expected PASS | **Needs browser verify** |
| neon_metro_01 | City skyline | Yes | Expected PASS | **Needs browser verify** |
| cloud_citadel_01 | Cloud sea + island pad | Yes | Expected PASS | **Needs browser verify** |
| jungle_ruins_01 | Jungle density | Yes | Expected PASS | **Needs browser verify** |
| frost_peak_01 | Snow pines | Yes | Expected PASS | **Needs browser verify** |
| lava_foundry_01 | Lava river vista | Yes | Expected PASS | **Needs browser verify** |
| star_station_01 | Earth sphere | Yes | Expected PASS | **Needs browser verify** |
| fairy_glen_01 | Fairy scatter | Yes | Expected PASS | **Needs browser verify** |
| thunder_ridge_01 | Windmill/barn | Yes | Expected PASS | **Needs browser verify** |

## Console checks (DevTools)

After loading a cup track, expect:

```
[TrackWorld] sunset_cove_01 { mode: 'await-gltf', ... }
[TrackGltf] sunset_cove_01 { scatter: N, buildings: M, totalProps: >=25, ok: true }
```

## Still not in this pass

- Full browser screenshot QA for all 10 tracks
- Workspace starter script when opening via legacy `rover_rover_obstacle_course` URL (use `#studio?track=sunset_cove_01` + car chassis)
- Custom lighthouse glTF (uses `checkpoint_arch.glb` as coastal arch landmark)

## Verify locally

```bash
npm run build
# Hard refresh or /go.html?v=47
# Open: #studio?track=sunset_cove_01
```
