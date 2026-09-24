# Kenney CC0 Track Assets

3D models for CodeRacer tracks (CC0 — Kenney.nl).

## Install

1. Download **Nature Kit (2.1)** from [OpenGameArt](https://opengameart.org/content/nature-kit) → `/tmp/kenney-nature.zip`
2. Extract to `/tmp/kenney-extract`
3. Download **City Kit Commercial** from [OpenGameArt](https://opengameart.org/content/city-kit-commercial) → `/tmp/kenney-city.zip`
4. Extract to `/tmp/kenney-city`
5. Run:

```bash
node scripts/install-kenney-track-assets.mjs
```

This copies GLB files into `public/assets/tracks/<track_id>/` and updates `bundled-tracks-data.js`.

## License

Creative Commons CC0 — Kenney.nl. See `public/assets/tracks/KENNEY_CC0_LICENSE.txt`.
