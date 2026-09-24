# CodeRacer Track QA Checklist

Verify each track (`rover` mode 1–10) before release.

| Track | ID | Check |
|-------|-----|-------|
| 1 Sunset Cove | `sunset_cove_01` | Crescent minimap · rover matches Build colours · coded blocks steer |
| 2 Candy Carnival | `candy_carnival_01` | Figure-8 minimap · no floating props · checkpoints fire |
| 3 Neon Metro | `neon_metro_01` | Stadium straights · rain particles · 30+ FPS medium |
| 4 Cloud Citadel | `cloud_citadel_01` | Elevated loop + bridge dip · guardrails |
| 5 Jungle Ruins | `jungle_ruins_01` | Tight weave · temple hero visible |
| 6 Frost Peak | `frost_peak_01` | Downhill (high start Y) · snow particles |
| 7 Lava Foundry | `lava_foundry_01` | Narrow 7m track · tight loop · no missing assets |
| 8 Star Station | `star_station_01` | Wide oval + long straight · cosmic sky |
| 9 Fairy Glen | `fairy_glen_01` | Inward spiral minimap · garden props |
| 10 Thunder Ridge | `thunder_ridge_01` | Hairpins + climb · 3 laps · lightning |

## Per-track checks

- [ ] No floating props (ground snap)
- [ ] No pink "Missing asset" markers
- [ ] Unique minimap shape vs other 9 tracks
- [ ] Rover mesh + colours match Build page (not kart glTF)
- [ ] `move_forward` drives by heading (not silent rail follow)
- [ ] Minimap visible · section names match Track blocks
- [ ] Checkpoints + lap notifications
- [ ] Coins/stars collectible
- [ ] 30+ FPS on medium tier Chromebook

## Coded steering test

1. Clear all blocks except **When START** + one **Bay straight** (or first section).
2. Simulate — kart moves forward in current heading only.
3. Without blocks — kart stays still + "Add blocks to drive!" hint.

## Build stamp

Record `window.__BYTEBUDDIES_BUILD` when QA passed.
