# CodeRacer Ship Report — v46-ship-pass

**Build:** `2026-08-16-v46-ship-pass`  
**Date:** 2026-08-16

## Global fixes (all 10 tracks)

| Check | Status | Notes |
|-------|--------|-------|
| Orange road planks removed | PASS | `installMK8PlayDressing` skips slabs + moss curbs on cup IDs |
| Mario Kart kerbs only at edges | PASS | `MarioKartTrackBuilder` kerbs; no duplicate MK8 moss blocks on cup |
| Lane markings + edge glow | PASS | Twin gold or dashed center + edge rails (medium/high) |
| Toolbar two-row layout | PASS | Tracks row + controls row; floating Simulate hidden |
| Cup starters without "Keep driving" | PASS | `buildPremiumTrackScript` = start → speed → boost → sections |
| Section block durations | PASS | Longer curve/straight durations for visible motion |
| glTF assets bundled | PASS | Kenney `.glb` in `public/assets/tracks/<id>/` |
| Distinct minimap splines | PASS | Figure-8, crescent, switchbacks, etc. in CodeRacerSplines.js |

## Per-track checklist

| Track | Planks | Themed scenery recipe | Unique spline | Code sections |
|-------|--------|----------------------|---------------|---------------|
| sunset_cove_01 | PASS | palms, huts, lighthouse | Crescent | Bay / Palm sections |
| candy_carnival_01 | PASS | tents, ferris, lollipops | Figure-8 | Midway / Coaster sections |
| neon_metro_01 | PASS | skyscrapers, neon pillars | Stadium rect | Tunnel / Plaza sections |
| cloud_citadel_01 | PASS | castle towers, cloud vista | Floating loop | Bridge / Tower sections |
| jungle_ruins_01 | PASS | jungle trees, temple | Tight weave | Temple / Vine sections |
| frost_peak_01 | PASS | pines, ski lodge | Switchbacks | Alpine / Ice sections |
| lava_foundry_01 | PASS | forge props, lava vista | Zigzag channel | Forge / Crucible sections |
| star_station_01 | PASS | habitat domes, station | Teardrop oval | Dock / Ring sections |
| fairy_glen_01 | PASS | daisies, toadstools | Inward spiral | Garden / Glen sections |
| thunder_ridge_01 | PASS | windmill, barn, pines | Hairpin zigzag | Ridge / Storm sections |

## Verify locally

```bash
npm run dev
# Hard refresh https://bytebuddies.technology/go.html
# Confirm window.__BYTEBUDDIES_BUILD === '2026-08-16-v46-ship-pass'
```

Console on track load should show `[TrackWorld] <id> scenery-populated props: N` (target N > 20 on medium+).

## Known limits

- Low graphics tier (🐢): fewer props but no road overlays; tap ✨ to raise quality on desktop.
- glTF enriches async (~1–2s after load); primitives show first.
