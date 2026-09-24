# 🏎️ ByteBuddies Racing Tracks — Master Specification
## Premium Mario Kart–Inspired Circuit Design for Primary School Computer Science

**Document Version:** 1.0  
**Date:** August 2024  
**Target Quality:** High (500K–800K triangles, 256MB textures, 60fps @ 1080p)  
**Platform:** Web (Three.js + React Three Fiber)  

---

## 📋 PROJECT OVERVIEW

### Vision
Transform ByteBuddies robot studio into a polished, kid-friendly Mario Kart–inspired racing world with 10 completely unique tracks. Students will program robot karts using visual block code while navigating vibrant, distinct biomes with clear landmarks and engaging hazards.

### Core Design Tenets
✅ **Readable** — Crystal-clear track, turns, checkpoints, hazards  
✅ **Navigable** — Distinct landmarks for spatial learning  
✅ **Performant** — 60fps @ 1080p on school hardware (LOD fallbacks)  
✅ **Age-Appropriate** — Vibrant & dramatic, never scary or gory  
✅ **Consistent** — Unified visual language across all tracks  

---

## 🎨 GLOBAL ART DIRECTION

### Visual Style
- **Genre:** Arcade kart racer (Mario Kart 8 Deluxe, Sonic & All-Stars Racing, CTR inspiration)
- **Tone:** Colorful, playful, cinematic, energetic (ages 6–11)
- **Geometry:** High-poly near camera; simplified LOD beyond 80m
- **Silhouettes:** Every turn, jump, landmark reads clearly at gameplay distance
- **Stylization:** Exaggerated proportions (big trees, bold colors, chunky props) — not photorealistic

### Global Kart Specifications
```
Physical Dimensions:
  Length:        1.8m
  Width:         1.0m
  Height:        0.9m
  Track Width:   8m (2-lane feel, single-player)
  
Materials:
  Body:          Glossy painted metal
  Tires:         Realistic rubber
  Accents:       Glowing LED lights
  
Visual Features:
  ✓ Suspension bounce
  ✓ Tire spin animation
  ✓ Exhaust/boost particles
  ✓ Turn tilt
  ✓ Flat color zones for future skin swaps
```

### Track Construction Standards (ALL TRACKS)

| Element | Specification |
|---------|--------------|
| **Length** | 400–700m per lap |
| **Width** | 8m drivable + 1m curbs each side |
| **Lanes** | Center dashed line + edge solid lines |
| **Start/Finish** | 10m checkered strip, overhead gantry arch |
| **Checkpoints** | 3–5 per lap, glowing archways (2.5m tall), unique color |
| **Barriers** | Low walls/rails, biome-matched, never fully opaque |
| **Elevation** | ≥2 height changes (hill, bridge, tunnel, ramp) |
| **Shortcuts** | 1 risky shortcut per track (narrower, hazard-adjacent) |
| **Hazards** | 1–2 biome-themed (water, lava, ice, steam) — clearly telegraphed |
| **Boost Pads** | 2–3 arrow-lit strips with particle trails |
| **Item Zones** | 2 floating ?-block-style pickups (kid-friendly, not combat) |
| **Landmarks** | ≥3 unique, visible from multiple sections |

### Camera (LOCKED FOR ALL TRACKS)
```
Position:    8m behind kart, 3m above ground
Angle:       22° downward pitch
FOV:         60°
Composition: Track dominates 55% of frame; sky/environment 45%
Behavior:    Smooth lag follow (0.15s), lateral offset 0.5m on turns, 
             subtle shake on boost/landing
Clipping:    Near 0.3m | Far 2000m
```

---

## 🎯 RENDERING PIPELINE (PBR Master Standard)

### Material Foundation
```javascript
Albedo:      4K textures
Normal:      4K textures (high detail)
Roughness:   4K textures (wet/dry/worn variation)
AO:          2K textures
Height:      Displacement maps where applicable
Metallic:    PBR metallic workflow
Specular:    Specular-Gloss for organics
```

### Terrain Layering System (Mandatory)
1. **Base Mesh** → Macro topology
2. **Displacement Map** → Meso detail (±0.3m)
3. **Micro-Normal Tiling** → Fine grain texture
4. **Roughness Variation Mask** → Wet/dry/worn zones
5. **Decal Overlays** → Cracks, moss, stains, lane wear

### Lighting Rig (Per-Scene Standard)
```
1× Directional Key Light      — Sun/moon/neon source (shadow-casting)
1× Fill Light                 — Sky/ambient hemisphere
1× Rim Light                  — Edge separation (kart + track borders)
1× Bounce Light               — Terrain color bleeding
Volumetric Fog                — Density 0.002–0.08 (biome-dependent)
God-Rays/Light Shafts         — Where applicable
Bloom                         — Threshold 1.1, intensity 0.3–0.8
Atmospheric Scattering        — Sky color bleeds into distance
```

### Shadow System
```
Cascaded Shadow Maps:   4 cascades
Soft Penumbra:         PCSS or equivalent
Contact Shadows:       At tire/curb intersections
```

### Advanced Shaders (By Material Type)

**Water:**
- Refraction (IOR 1.33)
- SSR reflections
- Caustic projection
- Gerstner wave displacement

**Lava:**
- Emissive base + flow map animation
- Heat distortion post-pass
- Particle embers (rise effect)

**Ice:**
- Sub-Surface Scattering (SSS)
- Transparency overlay
- Frosted normal blend
- Crack decals

**Foliage:**
- SSS on leaves
- GPU wind sway (0.3–1.2 speed)
- Alpha-to-coverage

**Clouds:**
- Volumetric raymarching OR baked 3D textures
- Density noise
- Light penetration

### Particle System (GPU-Instanced)
```
Max Visible:        5000
Distance Culling:   Beyond 100m
Biome-Specific:     Each track has unique particle recipes
Types:              Dust, mist, embers, sparks, leaves, snowflakes, rain
```

### Post-Processing Stack
```
Tone Mapping:       ACES
Color Grading:      Per-biome LUT
Chromatic Aberration: Subtle (0.002)
Film Grain:         0.05–0.12
Vignette:           0.15
Motion Blur:        Camera + particles only (not UI)
Lens Flare:         Anamorphic streaks on bright sources
SSAO:               Radius 0.5m, intensity 0.6
DoF:                Disabled in gameplay (enabled for showcase renders)
```

### UI Integration
```
HUD Panels:         Semi-transparent dark glass (#000000 @ 40%)
                    Rounded corners, soft glow borders
                    Biome accent color rim lights
Speedometer:        Analog dial with biome-colored rim light
Mission Panel:      Icon-based objectives with checkmark animations
Lap Timer:          Large, legible numerals (≥24px equivalent)
Checkpoints:        Full-screen flash + sound cue zone
Visual Hierarchy:   Post-processing NEVER obscures HUD readability
```

---

## 🏗️ TRACK-SPECIFIC IMPLEMENTATIONS

### TRACK 1 — SUNSET COAST CIRCUIT
**Codename:** `tropical_coast_01`  
**Difficulty:** ★☆☆☆☆  
**Laps:** 2  
**Biome:** Tropical coastline at golden hour

#### Color Palette
```
Primary:     Coral Orange (#FF7F50)
Secondary:   Sunset Pink (#FF6B9D)
Water:       Ocean Teal (#00CED1)
Sand:        Gold (#F4D03F)
Foliage:     Palm Green (#2ECC71)
```

#### Lighting
```
Key Light:   3200K warm (sun at horizon)
Fill Light:  5500K cool (ocean reflection)
Intensity:   Key 1.2, Fill 0.4
Shadow:      Long, golden-hour shadows
```

#### Track Layout
```
Section 1: Start on wooden pier → gentle right curve
           Asset: Wooden pier with pilings, ropes
           
Section 2: Coastal straight with ocean left, palms right
           Asset: Palm clusters (15×), distance island silhouettes
           Hazard: Optional — water splash zone on left edge
           
Section 3: Hairpin around coral rock formation
           Landmark: Giant coral arch (hero asset)
           Asset: Smaller coral rocks, sea grass
           
Section 4: Bridge over tidal pool → shortcut through shallow water
           Asset: Stone bridge, railing
           Hazard: Water shortcut slows kart 20%
           
Section 5: Dune jump (2m airtime) → finish straight
           Asset: Sand dune, grass tufts
```

#### Road Specifications
```
Surface:    Coral-orange asphalt (#FF7F50)
Normal Map: Micro-crack detail
Wet Zones:  Roughness 0.1, reflective patches
Lane Paint: White with edge wear decals
```

#### Environment Details
```
Vegetation:
  ✓ 12× palm trees (SSS fronds, wind animation)
  ✓ 3× beach umbrellas
  ✓ 2× wooden boats
  ✓ Coral reef visible through 0.5m shallow water (caustics)
  
Sky:
  ✓ Orange-pink gradient (#FF8C42 → #FF69B4 → #87CEEB)
  ✓ 3 volumetric cumulus clouds with golden edges
  
Particles:
  ✓ Sea mist (density 0.3)
  ✓ Sand grains on curves
  ✓ Warm haze
  ✓ 4 seagulls (motion-blurred loops)
```

#### Storytelling
Abandoned surf shack near checkpoint 2 with "BEACH RACE" sign — suggests friendly local competition.

#### Performance Budget
```
Triangles:     500K–600K
Textures:      200MB
Particles:     3000
Target FPS:    60 @ 1080p
LOD Fallback:  200K triangles, 100MB, 1000 particles
```

---

### TRACK 2 — CRYSTAL CAVERN RUN
**Codename:** `crystal_cave_01`  
**Difficulty:** ★★☆☆☆  
**Laps:** 2  
**Biome:** Underground bioluminescent crystal cave

#### Color Palette
```
Primary:     Obsidian Black (#0B0B0B)
Accent:      Neon Cyan (#00FFFF)
Secondary:   Deep Purple (#4B0082)
Highlight:   Crystal White (#E8F8FF)
```

#### Lighting
```
Key Light:   6500K cool bioluminescent (no natural sun)
Fill Light:  Purple ambient
Intensity:   Key 0.8, Fill 0.3
Emissives:   Crystals glow 1.5–2.5 intensity
```

#### Track Layout
```
Section 1: Start in grand crystal cathedral
           Landmark: 30m quartz pillar (hero asset)
           Asset: Crystal formations, mineral deposits
           
Section 2: Narrow tunnel with glowing crystal walls
           Asset: Crystalline tunnel (rim-lit walls)
           Hazard: Walls glow threateningly but aren't harmful
           
Section 3: Underground lake crossing
           Asset: Glass bridge with reflections below
           Hazard: Reflective puddles suggest water hazard
           
Section 4: Crystal maze hairpin
           Asset: Refracted light creates rainbow caustics
           Landmark: Maze of crystal walls (teaches navigation)
           
Section 5: Ascending spiral ramp → finish in glowing amphitheater
           Asset: Spiral track, cave ceiling with embedded stars
```

#### Road Specifications
```
Surface:    Obsidian asphalt (#0B0B0B)
Finish:     Glossy wet-stone (roughness 0.05)
Lane Paint: Neon cyan (#00FFFF) with 2m emissive glow
```

#### Environment Details
```
Props:
  ✓ 8× giant quartz pillars (refraction shader)
  ✓ 40× stalactites/stalagmites (procedural placement)
  ✓ 2× underground pools (reflective, ripple sim)
  ✓ Crystalline clusters at path edges
  
Sky:
  ✓ No sky — ceiling rock with embedded glowing crystals
  ✓ Simulates star field with bioluminescent glow
  
Particles:
  ✓ Sparkles (random twinkle)
  ✓ Cave dust motes in light beams
  ✓ Refracted light shards
```

#### Storytelling
Ancient mining cart rusted at checkpoint 3 — "CRYSTAL MINERS CLUB" graffiti in glowing paint.

#### Performance Budget
```
Triangles:     550K–650K
Textures:      220MB
Particles:     2500
Target FPS:    60 @ 1080p
LOD Fallback:  220K triangles, 110MB, 1000 particles
```

---

### TRACK 3 — SKY GARDEN ASCENT
**Codename:** `sky_garden_01`  
**Difficulty:** ★★☆☆☆  
**Laps:** 2  
**Biome:** Floating islands above volumetric cloud sea

#### Color Palette
```
Primary:     Pale Jade (#00FA9A)
Secondary:   Gold (#FFD700)
Accent:      Cloud White (#F8F8FF)
Sky:         Light Blue (#87CEFA)
Highlight:   Flower Pink (#FF69B4)
```

#### Lighting
```
Key Light:   5600K bright daylight
Fill Light:  Sky hemisphere
Intensity:   Key 1.3, Fill 0.5
Bloom:       Strong on gold elements
```

#### Track Layout
```
Section 1: Start on main garden island
           Landmark: 15m giant flower (hero asset, pink/yellow)
           Asset: Flower beds, green terrain
           
Section 2: Rope bridge crossing
           Asset: 40m rope bridge (sag physics, 2m sway)
           Hazard: Visual drama (looks dangerous, is safe)
           
Section 3: Waterfall edge curve
           Asset: Water plunges into clouds below
           Landmark: Waterfall (mist spray, caustics)
           
Section 4: Lower island loop through mushroom grove
           Asset: Oversized mushrooms (white + red spots)
           
Section 5: Ramp launch back to start island
           Asset: 3m airtime ramp
           Hazard: Cloud puff on landing (visual feedback)
```

#### Road Specifications
```
Surface:    Pale jade asphalt (#00FA9A)
Finish:     Polished marble (roughness 0.15)
Lane Paint: Gold metallic (#FFD700)
```

#### Environment Details
```
Vegetation:
  ✓ 6× giant flowers (petal SSS, wind sway)
  ✓ 3× rope bridges
  ✓ Dense cloud layer @ Y=0 (volumetric)
  ✓ 2× windmill towers (rotating blades)
  
Sky:
  ✓ Bright azure (#4FC3F7)
  ✓ 5 fluffy volumetric clouds (below track level)
  
Particles:
  ✓ Cherry blossom petals (falling)
  ✓ Waterfall mist
  ✓ Light bloom on gold surfaces
```

#### Storytelling
Tiny treehouse with telescope pointing at other islands — "SKY EXPLORERS" banner.

#### Performance Budget
```
Triangles:     520K–620K
Textures:      210MB
Particles:     3500
Target FPS:    60 @ 1080p
LOD Fallback:  210K triangles, 105MB, 1200 particles
```

---

### TRACK 4 — VOLCANIC INFERNO PASS
**Codename:** `volcano_01`  
**Difficulty:** ★★★☆☆  
**Laps:** 2  
**Biome:** Active volcanic canyon (stylized cartoon heat)

⚠️ *Age-appropriate: dramatic but not scary — no skulls, no screaming faces*

#### Color Palette
```
Primary:     Charcoal (#2F2F2F)
Lava:        Orange (#FF4500)
Accent:      Ember Yellow (#FFD700)
Secondary:   Ash Gray (#708090)
Highlight:   Sulfur Green (#9ACD32)
```

#### Lighting
```
Key Light:   2800K lava key (warm, deep)
Fill Light:  2000K deep shadow fill
Intensity:   Key 1.0, Fill 0.2
Emissives:   Lava 2.0–3.0, cracks pulse 0.8Hz
```

#### Track Layout
```
Section 1: Start near dormant volcano base
           Landmark: Smoking caldera in background
           Asset: Volcano cone, dormant vents
           
Section 2: Lava-edge straight
           Hazard: 1m safety barrier (lava never touches track)
           Asset: Heat shimmer post-effect (20% visibility reduction)
           
Section 3: Basalt bridge over magma flow
           Asset: Stone bridge, glow reflects on kart underside
           
Section 4: Ash cloud tunnel
           Hazard: Reduced visibility (20%), clears after 3s
           Asset: Volcanic ash particle cloud
           
Section 5: Downhill sprint to checkered finish
           Asset: Eruption fireworks (particles only, no damage)
           Celebration: Victory eruption animation
```

#### Road Specifications
```
Surface:    Charcoal asphalt (#2F2F2F)
Special:    Emissive lava cracks (pulsing 0.8Hz)
Lane Paint: Orange (#FF4500)
```

#### Environment Details
```
Terrain:
  ✓ Basalt columns (procedural placement)
  ✓ Cracked earth displacement (0.1m depth)
  ✓ Magma pools (fluid sim, non-drivable)
  ✓ Obsidian spires
  
Props:
  ✓ 2× lava waterfalls (fluid dynamics)
  ✓ 6× glowing magma vents
  
Sky:
  ✓ Dark amber (#8B4513)
  ✓ Ash clouds
  ✓ Distant lightning (decorative, no strikes on track)
  
Particles:
  ✓ Ash fall (gentle)
  ✓ Ember rise
  ✓ Heat wave distortion
```

#### Storytelling
Volcanologist research station with "HEAT ZONE — RACE SAFE!" sign and thermometer prop.

#### Performance Budget
```
Triangles:     600K–750K (higher for lava FX)
Textures:      230MB
Particles:     4500
Target FPS:    60 @ 1080p
LOD Fallback:  240K triangles, 120MB, 1500 particles
```

---

### TRACK 5 — CYBER CITY CIRCUIT
**Codename:** `cyber_city_01`  
**Difficulty:** ★★★☆☆  
**Laps:** 3  
**Biome:** Futuristic neon metropolis at night

#### Color Palette
```
Primary:     Deep Navy (#001F3F)
Accent:      Magenta (#FF00FF)
Secondary:   Electric Blue (#00BFFF)
Metal:       Chrome Silver (#C0C0C0)
Highlight:   Holo Green (#39FF14)
```

#### Lighting
```
Key Light:   Neon sources (no natural sun)
Fill Light:  City ambient
Intensity:   Key 0.9, Fill 0.4
Emissives:   Neon 1.5–2.5, billboards 0.8–1.2
```

#### Track Layout
```
Section 1: Start on rain-slick main street
           Landmark: Holographic "CYBER GP" billboard (animated)
           Asset: Building facades, street level
           
Section 2: Neon tunnel
           Asset: Pulsing wall lights sync to 120 BPM
           Hazard: Reduced visibility (visual rhythm challenge)
           
Section 3: Elevated highway curve
           Asset: Kart elevated 20m over city skyline
           Landmark: City skyline visible below
           
Section 4: Alley shortcut
           Hazard: Narrower (6m), steam vents
           Asset: Fire escape buildings, neon signs
           
Section 5: Plaza fountain roundabout → finish straight
           Asset: Neon fountain, plaza level
```

#### Road Specifications
```
Surface:    Deep navy asphalt (#001F3F)
Finish:     Wet reflective (roughness 0.02)
Lane Paint: Magenta LED embedded (#FF00FF)
```

#### Environment Details
```
Buildings:
  ✓ 10× skyscrapers with window lights (flickering pattern)
  ✓ 5× holographic billboards (animated)
  ✓ Background flying cars (non-interactive)
  ✓ 2× neon arch tunnels
  
Sky:
  ✓ Dark purple-black (#0D0221)
  ✓ No stars — city glow replaces sky
  ✓ Neon light reflections in sky
  
Particles:
  ✓ Rain droplets
  ✓ Neon sparks from grates
  ✓ Steam vapor from vents
```

#### Storytelling
Robot repair shop with mascot poster: "CODE YOUR RIDE!" — hints at student customization.

#### Performance Budget
```
Triangles:     700K–800K (higher for buildings)
Textures:      250MB
Particles:     3000
Target FPS:    60 @ 1080p (may dip to 45fps in urban sections)
LOD Fallback:  280K triangles, 130MB, 1000 particles
```

---

### TRACK 6 — FROST PEAK RALLY
**Codename:** `frost_peak_01`  
**Difficulty:** ★★★☆☆  
**Laps:** 2  
**Biome:** Frozen alpine mountain pass

#### Color Palette
```
Primary:     Ice Blue (#5DADE2)
Secondary:   Snow White (#FFFAFA)
Metal:       Silver (#C0C0C0)
Foliage:     Pine Green (#1B4D3E)
Accent:      Sunset Lavender (#B8A9C9)
```

#### Lighting
```
Key Light:   7500K cold daylight
Fill Light:  Blue shadow fill
Intensity:   Key 1.2, Fill 0.4
Shadow:      Crisp, cool-toned shadows
```

#### Track Layout
```
Section 1: Start at ski lodge
           Landmark: Wooden lodge with flag
           Asset: Alpine buildings, ski racks
           
Section 2: Forest slalom
           Asset: Procedural snow pine placement
           Hazard: Dense forest (navigation challenge)
           
Section 3: Frozen lake straight
           Hazard: Ice patch — friction reduced 30%
           Asset: Spark particles on slippery sections
           
Section 4: Cliffside curve with icicle overhang
           Landmark: Hanging icicles (visual drama)
           Asset: Cliff face with ice formations
           
Section 5: Downhill finish with snow jump
           Asset: Ramp launch
```

#### Road Specifications
```
Surface:    Ice-blue asphalt (#5DADE2)
Finish:     Frosted semi-transparent (opacity 0.85)
Lane Paint: Silver (#C0C0C0)
```

#### Environment Details
```
Vegetation:
  ✓ 15× snow pines (individual needle cards, wind sway)
  ✓ 20× icicles (refraction shader, length variation)
  ✓ 3× alpine rock outcrops
  ✓ 1× frozen waterfall
  
Sky:
  ✓ Pale winter blue (#B0C4DE)
  ✓ Wispy cirrus clouds
  
Particles:
  ✓ Snowflakes (variable size, natural fall)
  ✓ Ice chips on turns
  ✓ Breath vapor puffs (kart exhaust hint)
```

#### Storytelling
Snowman builder NPC area with "WINTER CUP" trophy display.

#### Performance Budget
```
Triangles:     520K–620K
Textures:      200MB
Particles:     2000
Target FPS:    60 @ 1080p
LOD Fallback:  200K triangles, 100MB, 800 particles
```

---

### TRACK 7 — ANCIENT RUINS RACEWAY
**Codename:** `jungle_ruins_01`  
**Difficulty:** ★★★★☆  
**Laps:** 2  
**Biome:** Dense jungle with ancient temple ruins

#### Color Palette
```
Primary:     Moss Green (#556B2F)
Accent:      Gold (#FFD700)
Stone:       Gray (#808080)
Jungle:      Emerald (#228B22)
Water:       Turquoise (#40E0D0)
```

#### Lighting
```
Key Light:   5000K dappled warm sunlight
Fill Light:  Green canopy ambient
Intensity:   Key 1.0, Fill 0.3
Dappling:    Light shafts through canopy
```

#### Track Layout
```
Section 1: Start at temple gate
           Landmark: 20m stone arch with gold inlay
           Asset: Temple entrance, stone tiles
           
Section 2: Courtyard straight with broken pillars
           Asset: Fallen columns (ramps over)
           
Section 3: Jungle tunnel
           Hazard: Canopy darkness (reduced visibility)
           Asset: Firefly particles navigate path
           
Section 4: Waterfall crossing
           Asset: Stone bridge, mist spray
           Landmark: Waterfall (visual anchor)
           
Section 5: Temple inner loop with gold boost pad
           Asset: Gold tile floor (metallic sheen)
```

#### Road Specifications
```
Surface:    Mossy stone (#556B2F)
Finish:     Rough, uneven (displacement 0.1m)
Lane Paint: Gold carved (#FFD700) with metallic wear
```

#### Environment Details
```
Props:
  ✓ 4× stone statues (jaguar, parrot, turtle, monkey)
  ✓ 2× waterfalls
  ✓ 30× dense foliage clusters (procedural)
  ✓ 1× collapsed pillar (ramp-over obstacle)
  
Sky:
  ✓ Green-tinted canopy gaps
  ✓ Golden sun shafts through leaves
  
Particles:
  ✓ Falling leaves (seasonal)
  ✓ Humidity mist
  ✓ Firefly insects (glow 0.5m)
```

#### Storytelling
Archaeologist camp with coded message on stone tablet: "RACE THE RUINS" in pictographs (learning hint).

#### Performance Budget
```
Triangles:     650K–800K (higher for foliage)
Textures:      240MB
Particles:     4000
Target FPS:    60 @ 1080p
LOD Fallback:  260K triangles, 125MB, 1500 particles
```

---

### TRACK 8 — STARDUST GALAXY DRIFT
**Codename:** `galaxy_drift_01`  
**Difficulty:** ★★★★☆  
**Laps:** 2  
**Biome:** Asteroid belt in deep space with nebula backdrop

#### Color Palette
```
Primary:     Metallic Violet (#8A2BE2)
Secondary:   Cosmic Blue (#1E90FF)
Accent:      Star White (#FFFFFF)
Nebula:      Pink (#FF1493)
Rock:        Asteroid Gray (#696969)
```

#### Lighting
```
Key Light:   Star rim light (no temperature — point source)
Fill Light:  Nebula ambient glow
Intensity:   Key 0.8, Fill 0.4
Emissives:   Stars 1.0–1.5, nebula 0.5–0.8
```

#### Track Layout
```
Section 1: Start on main asteroid platform
           Landmark: Neon ring gate (glowing structure)
           Asset: Large asteroid base
           
Section 2: Jump gap between asteroids
           Asset: 5m gap, star particle trail
           Hazard: Visual drama (safe to jump)
           
Section 3: Nebula tunnel
           Hazard: Purple fog reduces visibility
           Asset: Volumetric nebula cloud
           
Section 4: Spiral around small moon
           Asset: Low gravity feel — jump height +20%
           Landmark: Moon rises above track
           
Section 5: Final straight through stardust field
           Asset: Floating stardust particles
```

#### Road Specifications
```
Surface:    Metallic violet (#8A2BE2)
Finish:     Reflective PBR (metallic 0.8)
Lane Paint: Glowing white (emissive)
```

#### Environment Details
```
Props:
  ✓ 6× asteroids (varied sizes, detailed rock normals)
  ✓ 2× distant planets (atmospheric rim glow)
  ✓ 1× nebula cloud wall (volumetric raymarched)
  ✓ Space station wreckage (background)
  
Sky:
  ✓ Deep space black (#000010)
  ✓ 10,000 star points
  ✓ Milky nebula band
  
Particles:
  ✓ Stardust swirl
  ✓ Comet streaks (periodic)
  ✓ Cosmic dust on boost pads
```

#### Storytelling
Friendly alien spectator stands with waving flags — cute, non-threatening aliens (encouragement theme).

#### Performance Budget
```
Triangles:     450K–550K (fewer ground assets)
Textures:      180MB
Particles:     3500
Target FPS:    60 @ 1080p
LOD Fallback:  180K triangles, 90MB, 1200 particles
```

---

### TRACK 9 — MEADOW VALLEY SPRINT
**Codename:** `meadow_valley_01`  
**Difficulty:** ★☆☆☆☆  
**Laps:** 2  
**Biome:** Rolling countryside farmland (ideal starter track)

#### Color Palette
```
Primary:     Tan Gravel (#D4A574)
Secondary:   Grass Green (#7CFC00)
Accent:      Barn Red (#B22222)
Sky:         Sky Blue (#87CEEB)
Highlight:   Flower Yellow (#FFD700)
```

#### Lighting
```
Key Light:   5500K soft midday sun
Fill Light:  Sky hemisphere
Intensity:   Key 1.2, Fill 0.5
Shadow:      Soft, diffuse midday shadows
```

#### Track Layout
```
Section 1: Start near red barn
           Landmark: Windmill on hill
           Asset: Red barn buildings, silo
           
Section 2: Long straight through wildflower field
           Asset: Flower beds (procedural variety)
           
Section 3: Gentle hill climb
           Asset: Hay bale barriers (low obstacles)
           
Section 4: Creek crossing
           Asset: Small wooden bridge
           
Section 5: Downhill finish past grazing sheep
           Asset: Sheep (decorative, non-blocking)
```

#### Road Specifications
```
Surface:    Tan gravel (#D4A574)
Finish:     Granular normal map
Lane Paint: Worn white markings with dirt overlay
```

#### Environment Details
```
Props:
  ✓ 2× red barns
  ✓ 3× wooden fences
  ✓ 1× windmill (rotating blades)
  ✓ 5× hay bales
  ✓ 4× grazing sheep
  ✓ 2× tractor props (parked)
  
Sky:
  ✓ Clear blue (#87CEEB)
  ✓ 4 puffy white clouds
  
Particles:
  ✓ Dust puffs on gravel
  ✓ Pollen drift
  ✓ Dandelion seeds
```

#### Storytelling
Farmer's market stand with "VALLEY GRAND PRIX" hand-painted sign — community race vibe.

#### Performance Budget
```
Triangles:     300K–400K (simplest track)
Textures:      150MB
Particles:     1500
Target FPS:    60 @ 1080p
LOD Fallback:  120K triangles, 75MB, 600 particles
```

---

### TRACK 10 — SHADOW METRO UNDERPASS
**Codename:** `metro_underpass_01`  
**Difficulty:** ★★★★☆  
**Laps:** 3  
**Biome:** Underground subway tunnel network

#### Color Palette
```
Primary:     Matte Black (#111111)
Hazard:      Yellow (#FFFF00)
Structure:   Concrete Gray (#A9A9A9)
Accent:      Neon Red (#FF0000)
Rust:        Orange (#CD853F)
```

#### Lighting
```
Key Light:   4000K harsh fluorescent
Fill Light:  Tungsten accents
Intensity:   Key 1.0, Fill 0.3
Flicker:     Lights flicker in rhythm (hazard marker)
```

#### Track Layout
```
Section 1: Start at station platform
           Landmark: "METRO GP" neon sign
           Asset: Platform tile, ticket booth
           
Section 2: Long tunnel straight
           Hazard: Flickering lights (rhythm hazard)
           Asset: Fluorescent tube lights (flicker animation)
           
Section 3: Split junction
           Main route vs. maintenance shortcut
           Asset: Tunnel split, signage
           
Section 4: Platform jump
           Asset: Ramp off station edge (3m airtime)
           
Section 5: Final tunnel sprint with steam vents
           Asset: Steam puffs, surface exit finish
```

#### Road Specifications
```
Surface:    Matte black asphalt (#111111)
Finish:     Wet patches
Lane Paint: Glowing hazard stripes (#FFFF00, emissive)
```

#### Environment Details
```
Props:
  ✓ Graffiti murals (kid-friendly street art)
  ✓ 8× fluorescent tube lights (flicker 3–5 Hz)
  ✓ 4× steam vents
  ✓ 2× abandoned train cars (decorative)
  ✓ Metro map poster
  
Sky:
  ✓ No sky — concrete ceiling
  ✓ Recessed lighting panels
  
Particles:
  ✓ Steam puffs (volumetric)
  ✓ Water droplets from ceiling
  ✓ Electric sparks from junction box
```

#### Storytelling
Transit worker break room visible through window: "NEXT TRAIN: RACE CAR" departure board — playful sign.

#### Performance Budget
```
Triangles:     600K–750K (higher for tunnel geometry)
Textures:      220MB
Particles:     3000
Target FPS:    60 @ 1080p
LOD Fallback:  240K triangles, 110MB, 1000 particles
```

---

## 📊 PERFORMANCE TARGETS

### Target Hardware
**Primary:** School laptops/tablets (2018–2022 GPUs)  
**Secondary:** Home computers (4–8GB VRAM)  
**Connection:** 10–50 Mbps broadband

### Quality Tiers

| Tier | Triangles | Textures | Particles | Target FPS | Hardware |
|------|-----------|----------|-----------|-----------|----------|
| **High** | 500K–800K | 256MB | 5000 | 60fps @ 1080p | Desktop/Tablet |
| **Medium** | 200K–400K | 128MB | 2000 | 60fps @ 720p | Laptop |
| **Low** | 80K–150K | 64MB | 500 | 30fps @ 480p | Old Tablet |

### Optimization Strategies

**LOD System:**
- ✓ Geometry LOD every 50m (hero → medium → low)
- ✓ Texture resolution scaling (4K → 2K → 1K)
- ✓ Particle count culling beyond 100m

**Memory Management:**
- ✓ Streaming track sections (load/unload within 200m)
- ✓ Texture atlasing (reduce draw calls)
- ✓ Instanced rendering for repetitive props

**Rendering Optimization:**
- ✓ Frustum culling (aggressive)
- ✓ Occlusion culling in tunnel sections
- ✓ Simplified shadow maps in low quality
- ✓ Reduced particle count on frame drops

---

## 🎬 VISUAL SHOWCASE ASSETS (OUTPUT REQUIREMENTS)

For each track, deliver:

### 1. Hero Screenshot
- **Resolution:** 1920×1080
- **Camera:** Start/Finish line, full biome visible
- **Conditions:** Optimal lighting, all visual effects enabled
- **Purpose:** Marketing, course selection screen

### 2. Track Map (Top-Down)
- **Style:** Clean, color-coded sections
- **Content:** 
  - Checkpoint positions (numbered 1–5)
  - Hazard zones (orange outline)
  - Shortcut route (dashed line)
  - Elevation contours (light gray)
- **Resolution:** 1024×1024

### 3. Gameplay Angles (3 Screenshots)
- **Straight Section** — Road ahead, typical driving view
- **Curve Section** — Camera banking, turn radius visible
- **Jump/Elevation** — Airtime, landing zone visible

### 4. Material Palette Sheet
- **8–12 swatches** with hex codes
- **Formats:**
  - Albedo color
  - Roughness value
  - Metallic value
  - Emissive intensity
- **Example:**
  ```
  Surface: Coral Asphalt
  Albedo:  #FF7F50
  Rough:   0.35
  Metallic: 0.0
  Emissive: None
  ```

### 5. Lighting Diagram
- **Top-down view** with light positions
- **Annotations:**
  - Key Light direction + intensity + color temp
  - Fill Light direction + intensity
  - Rim Light target (edges)
  - Shadows (cascade ranges)

### 6. Landmark Callout Sheet
- **3 labeled landmarks** per track
- **Photo + description:**
  - Landmark name
  - Narrative purpose
  - Navigation hint for students
  - Visual style reference

### 7. LOD Comparison
- **3 renders of same view:**
  - High quality (500K+ tri)
  - Medium (200K–400K tri)
  - Low (80K–150K tri)
- **Annotations:** Triangle count, texture memory, FPS estimate

### 8. Performance Budget Spreadsheet
- **Per-track metrics:**
  - Triangle count (by category: terrain, props, foliage)
  - Texture memory (4K, 2K, 1K breakdown)
  - Particle count by type
  - Draw call count
  - Estimated FPS @ 1080p
  - Optimization techniques applied

---

## 🔧 IMPLEMENTATION CHECKLIST

### Phase 1: Track Geometry & Navigation
- [ ] Generate terrain base mesh (macro topology)
- [ ] Place track curves (450–600m path)
- [ ] Add elevation changes (min 2 per track)
- [ ] Create checkpoint arch positions
- [ ] Blockout hazard zones

### Phase 2: Materials & Surfaces
- [ ] Texture road surface (4K albedo + normal + roughness)
- [ ] Apply lane markings (painted, worn)
- [ ] Terrain layering (displacement + micro-normals)
- [ ] Curb/barrier materials
- [ ] Special surfaces (ice, lava, water)

### Phase 3: Environment & Landmarks
- [ ] Place 3+ hero landmarks
- [ ] Add biome-specific props (trees, buildings, etc.)
- [ ] Create sky backdrop (clouds, gradients, stars)
- [ ] Position background elements

### Phase 4: Lighting & Shaders
- [ ] Set up 4-light rig (key, fill, rim, bounce)
- [ ] Configure shadow cascades
- [ ] Apply post-processing (bloom, color grading, tone mapping)
- [ ] Special shaders (water, lava, crystals)

### Phase 5: Particles & FX
- [ ] Biome-specific particle recipes
- [ ] Wind animation
- [ ] Weather effects
- [ ] Boost/landing feedback

### Phase 6: UI & HUD Integration
- [ ] Checkpoint notifications (flash + sound)
- [ ] Speed/lap timer readability
- [ ] Biome-themed UI colors
- [ ] Post-processing mask (never obscures HUD)

### Phase 7: Performance Optimization
- [ ] Implement LOD system (3 tiers)
- [ ] Texture atlasing
- [ ] Draw call reduction
- [ ] Particle culling
- [ ] Memory profiling

### Phase 8: Testing & Validation
- [ ] Frame rate testing (target 60fps)
- [ ] Memory footprint analysis
- [ ] Visual consistency across tracks
- [ ] Age-appropriateness review
- [ ] Landmark navigation clarity

---

## 📝 QUICK REFERENCE: KEY NUMBERS

```
Global Constants:
  Kart Length:           1.8m
  Track Width:           8m
  Camera Distance:       8m (behind kart)
  Camera Height:         3m
  Camera Pitch:          22° downward
  Camera FOV:            60°
  
Per-Track:
  Lap Length:            400–700m
  Checkpoints:           3–5
  Hazards:               1–2
  Landmarks:             ≥3
  Shortcuts:             1 (risky)
  
Performance:
  High Quality:          500K–800K triangles, 60fps
  Medium Quality:        200K–400K triangles, 60fps
  Low Quality:           80K–150K triangles, 30fps
  Max Particles Visible: 5000 (culled beyond 100m)
```

---

## 📄 Document History
- **v1.0** (Aug 2024) — Master specification created with 10 complete track specifications
- **Next:** Material palette sheets, lighting diagrams, landmark callouts

---

**For implementation questions, refer to the track-specific sections above and cross-reference with:**
- `src/virtual-robot-designer/racing/mk-tracks/` — Existing track builders
- `src/virtual-robot-designer/racing/worlds/` — World configurations
- `RacingTrackSystem.js` — Track management API
