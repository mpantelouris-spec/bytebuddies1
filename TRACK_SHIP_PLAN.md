# CodeRacer Ship Pass Plan (v46)

## Root causes (user report)

1. **Orange planks** — `buildStoneSlabRoadOverlay()` placed box meshes on the drivable road on all cup tracks.
2. **Green pads** — hardcoded moss lips + chunky moss curbs duplicated Mario Kart kerbs.
3. **Code confusion** — `move_forward_continuous` in cup starters fought section-block steering.
4. **Toolbar overlap** — floating `.bb-vp-run-controls` duplicated toolbar Simulate button.
5. **Basic worlds** — primitives + glTF scatter need tier budgets; no slabs blocking view.

## Fix order

| Phase | Action |
|-------|--------|
| 1 | Disable stone slabs + moss curbs on all 10 cup tracks; keep lane lines + edge glow |
| 2 | Two-row toolbar only; hide floating run controls on coderacer viewport |
| 3 | Remove `move_forward_continuous` from cup starters; longer section block durations |
| 4 | Scenery via `populateTrackScenery` + glTF; distinct splines already in CodeRacerSplines.js |
| 5 | Default `detectQualityTier()` (low on phones); low tier still 14 scatter/side |

## Success criteria

- No boxes on road surface
- Simulate on row 2, track cup on row 1
- Simulate → section blocks visibly move/turn kart
- Build stamp `2026-08-16-v46-ship-pass`
