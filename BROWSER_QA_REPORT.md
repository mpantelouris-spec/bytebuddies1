# CodeRacer cup tracks — browser QA report

**Build stamp:** `2026-08-17-v54-mega-scenery`  
**Live site:** https://bytebuddies.technology/  
**Verified:** `window.__BYTEBUDDIES_BUILD === '2026-08-17-v54-mega-scenery'`  
**Date:** 2026-08-17  
**Method:** Playwright Chrome, full page load per track (`#studio?track=<id>`), 1440×900 start-line chase camera.

Screenshots: `docs/cup-track-screenshots/<track_id>.png`

## What was broken (and the real fix)

Cup tabs and the 3D world kept snapping back to Sunset Cove even after scenery was restored. Two bugs stacked:

1. URL hash / `selectCourse` identity re-applied the first track.
2. A chassis-mode effect treated every cup id as “not a rover course” and **forced rover mode 1 (Sunset Cove)** after the correct world had already built.

Those are fixed. glTF is additive; primitive scenery always runs (no `gltf-only-clean`).

## Console prop counts (all ≥ 20 — PASS)

| Track | Tab | TrackWorld props | glTF (start / scatter / buildings) | Minimap section | Visual |
|-------|-----|------------------|--------------------------------------|-----------------|--------|
| sunset_cove_01 | Sunset Cove | 74 | 6 / 13 / 3 | Bay straight → Palm curve | **PASS** — orange sky, palms, pink huts, turquoise water, asphalt |
| candy_carnival_01 | Candy Carnival | 77 | 6 / 14 / 4 | Midway → Coaster dip | **PASS** — pink road, circus tents, lollipops, yellow arch |
| neon_metro_01 | Neon Metro | 70 | 5 / 13 / 5 | Tunnel run → Station corner | **PASS** — night city, magenta neon road, rain streaks |
| cloud_citadel_01 | Cloud Citadel | 71 | 4 / 10 / 3 | Castle gate → Rope bridge | **PASS** — blue sky, castle towers, green road |
| jungle_ruins_01 | Jungle Ruins | 70 | 4 / 12 / 2 | Temple gate → Pyramid hairpin | **PASS** — green ground, canopy trees, ruin blocks |
| frost_peak_01 | Frost Peak | 71 | 5 / 10 / 2 | Alpine start → Pine slalom | **PASS** — pale sky, snow pines, ice-blue road |
| lava_foundry_01 | Lava Foundry | 72 | 5 / 10 / 3 | Forge floor → Lava channel | **PASS** — dark industrial, lava glow horizon |
| star_station_01 | Star Station | 71 | 3 / 9 / 3 | Dock ring → Glass deck | **PASS** — space, cyan habitat domes, neon pillars |
| fairy_glen_01 | Fairy Glen | 74 | 5 / 11 / 2 | Garden gate → Flower tunnel | **PASS** — lime grass, trees, cottage-scale props |
| thunder_ridge_01 | Thunder Ridge | 72 | 5 / 10 / 3 | Ridge climb → Hairpin | **PASS with note** — red barn/windmill-scale blocks, storm-dark sky; chase camera sits very close to a tan plane (clip / framing) |

## Shared UI checks (all 10)

| Check | Result |
|-------|--------|
| Build stamp `2026-08-17-v54-mega-scenery` | PASS |
| Cup tabs not under Simulate | PASS — two-row toolbar |
| Minimap bottom-left with track name + section | PASS |
| Starter blocks match that track (no `move_forward_continuous`) | PASS |
| Asphalt/theme road, not orange plank overlay | PASS |
| Each track visually different at start line | PASS (Thunder Ridge camera is tight) |

## Remaining issues

- **Thunder Ridge start camera** is too close to a large ground plane; theme reads from minimap + red structures, but kids may not see the windmill/barn clearly until they move.
- **Lava Foundry** is dark at start (intentional underground vibe); coins/READY are visible, robot can be hard to pick out.
- glTF still loads after primitives (good). A few tracks logged glTF a second or two after first paint.

## How to verify in a browser

1. Hard refresh https://bytebuddies.technology/
2. Console: `window.__BYTEBUDDIES_BUILD`
3. Open Code + Simulate, click each cup tab — the world, minimap title, and Track blocks must all change.
4. Sunset Cove → Simulate should start on the already-visible world (no empty tan wait).
