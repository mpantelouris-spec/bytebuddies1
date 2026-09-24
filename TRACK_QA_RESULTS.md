# CodeRacer Track QA Results

Build: `2026-08-12-v20-instanced-tracks-perf`

| # | Track | ID | Status | Notes |
|---|-------|-----|--------|-------|
| 1 | Sunset Cove | `sunset_cove_01` | PASS* | Instanced palms/huts; ocean vista; no missing-asset markers |
| 2 | Candy Carnival | `candy_carnival_01` | PASS* | Pink instanced tents; ferris wheel landmark |
| 3 | Neon Metro | `neon_metro_01` | PASS* | Stadium spline; instanced pillars; dark metro fog |
| 4 | Cloud Citadel | `cloud_citadel_01` | PASS* | Instanced towers; cloud sea vista |
| 5 | Jungle Ruins | `jungle_ruins_01` | PASS* | Green instanced trees; pyramid landmark |
| 6 | Frost Peak | `frost_peak_01` | PASS* | Blue pine cones; downhill spline |
| 7 | Lava Foundry | `lava_foundry_01` | PASS* | Orange gear torus; lava vista |
| 8 | Star Station | `star_station_01` | PASS* | Purple domes; earth vista |
| 9 | Fairy Glen | `fairy_glen_01` | PASS* | Pink daisies + red toadstools |
| 10 | Thunder Ridge | `thunder_ridge_01` | PASS* | Grey pines; windmill landmark |

\* Code/deploy verified; in-browser visual QA recommended after hard refresh.

## Fixes in v20

- **No glTF dependency** — all 10 tracks use `TrackInstancedProps` (InstancedMesh batches)
- **No pink missing-asset markers** — glTF path disabled until assets bundled
- **Lane strips** — single InstancedMesh per track (was 48+ boxes)
- **Default quality** — CodeRacer biome tracks start at `low` tier (first visit)
- **Medium tier** — no torch point lights, no animated water, fewer particles
- **Per-track ground disc** — tinted from `BiomeAAAVisualSpec` palette

## Manual checks

- [ ] Hard refresh → `window.__BYTEBUDDIES_BUILD` = v20 string
- [ ] Console: no `[TrackAssetLoader] Failed to load` spam
- [ ] Console: `[RealGameWorld] ... mode: 'instanced-primitives'`
- [ ] FPS log: draw calls &lt; 80 on medium tier
- [ ] Rover matches Build colours (not kart glTF)
- [ ] Coded blocks steer kart (no silent rail)

## Still open

- Kenney glTF bundles not committed (download URLs 404) — future upgrade path
- Hero landmarks still multi-mesh groups (1–3 per track only)
