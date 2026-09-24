# Sunset Cove Visual Proof — v50-sunset-proof

**Build:** `2026-08-16-v50-sunset-proof`  
**Scope:** Sunset Cove only — other 9 tracks unchanged until this passes.

## Root bug fixed in v50

**Ocean was placed behind the start line** (`-tan` from finishT) while the chase camera looks **forward** (`+tan`). Result: tan sand disc + empty sky in frame.

**v50 fix:** Ocean repositioned **ahead + lateral** along track tangent at start (`+52 tan, -40 normal`), scaled 1.6×.

## Start-line targets (first camera frame)

| Target | v50 implementation |
|--------|-------------------|
| 4+ palms | 4 start heroes + track scatter |
| 2 beach huts | 2 start heroes at 2.2–2.3× scale |
| Lighthouse silhouette | `buildLighthouse` at 2.1×, closer (off 15) |
| Ocean horizon | Turquoise plane 520m, aligned to camera |
| Sunset sky | Stronger orange/gold sky dome + warm fog |
| No brown cylinders | Instanced scatter disabled (full groups only) |

## Console checks

```javascript
window.__BYTEBUDDIES_BUILD  // 2026-08-16-v50-sunset-proof
```

```
[TrackStartHero] sunset_cove_01 { placed: 10, finishT: ... }
[TrackWorld] sunset_cove_01 { props: 20+, ok: true }
[TrackGltf] sunset_cove_01 { start: 10, totalProps: 45+, ok: true }
```

## User verification (required before other tracks)

1. Hard refresh → `#studio?track=sunset_cove_01` + car chassis  
2. First frame: turquoise water, orange sky, palms/huts beside road  
3. Screenshot — kid test: "It's a beach!"

**Status:** Code fix deployed — **awaiting user screenshot approval**.
