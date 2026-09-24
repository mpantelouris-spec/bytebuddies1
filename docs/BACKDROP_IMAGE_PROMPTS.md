# Track Backdrop Image Prompts

Replace placeholders in `public/assets/backgrounds/tracks/` with 1920×1080 PNG concept art.

Base prompt (append track description):

> Wide 16:9 kart racing game environment concept art, third-person chase camera view from behind karts at start line, [TRACK DESCRIPTION], polished arcade racing game style original IP kid-friendly ages 6-11, highly detailed painted illustration NOT 3D render NOT low poly, checkered start line on road, checkpoint arch ahead, rich environment filling frame

## Per-track descriptions

| File | Description |
|------|-------------|
| `sunset_coast_reference.png` | Golden sunset ocean coast, palm silhouettes, coral arch, beach race atmosphere |
| `crystal_cavern_reference.png` | Dark bioluminescent cave, giant crystals, bridge, waterfall, minecart, cyan CHECKPOINT arch |
| `sky_garden_reference.png` | Floating islands, giant pink flower, treehouse SKY EXPLORERS sign, clouds below, gold rails |
| `volcanic_inferno_reference.png` | Volcano caldera, lava rivers, basalt cliffs, orange smoky sky |
| `cyber_city_reference.png` | Neon night city, rain, skyscrapers, holographic CYBER GP billboard, wet magenta/cyan streets |
| `frost_peak_reference.png` | Snowy mountains, ski lodge, frozen lake, ice castle, gentle snowfall |
| `ancient_ruins_reference.png` | Jungle temple gate, gold jaguar carving, waterfall, stone pillars, fireflies |
| `stardust_galaxy_reference.png` | Nebula, asteroids, planets, starfield, neon ring gate, alien spectators |
| `meadow_valley_reference.png` | Red barn, windmill, wildflower fields, rolling green hills, blue sky |
| `shadow_metro_reference.png` | Subway platform, METRO GP neon, graffiti tunnel, fluorescent lights, steam |

Run `node scripts/generate-track-backdrop-placeholders.mjs` to copy interim art until finals are ready.
