Asset pack README

Contents:
- palette.css — CSS tokens for colors used across assets
- characters/ — layered SVGs for characters (raya, lumi, nyx, puff) + thumbs + simple idle SVG
- backgrounds/ — layered SVGs for scenes (lab, fantasy_meadow, vault)
- metadata/ — joint maps and pivot points for rigging
- sprite_atlas.json — mapping of thumbnails/idle assets

Export guidelines:
- Keep master SVGs as source-of-truth with named layers (see naming convention below).
- Export raster PNG thumbs at 512px (full body) and @2x for retina using your pipeline (Sketch, Figma, or ImageMagick/Rasterize).
- To create a packed sprite sheet atlas from the SVGs, rasterize to PNG and use TexturePacker or an automated build step to produce atlas and JSON.

Usage examples:
- Inline SVG thumbnails directly in the UI for crisp scaling.
- Use `sprite_atlas.json` as a manifest for build-time rasterization.

Layer naming convention (top-level groups):
- shadow_ground
- body
- head
- arms
- legs
- accessories
- effects
- outline

Rigging tips:
- Use the provided joints JSON as origin points for Spine/DragonBones or custom puppet rigs.
- Use additive blending for glows and 'screen' for hologram layers.

Deployment note:
- Files live in `public/assets` so Vite copies them into `dist/` during build.
