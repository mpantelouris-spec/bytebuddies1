# 🎨 Material Palette Specifications — All 10 Tracks

## TRACK 1: SUNSET COAST CIRCUIT

### Road Surface — Coral Asphalt
```
Name:           Coral Asphalt (Primary Road)
Albedo Color:   #FF7F50 (Coral Orange)
Roughness:      0.35 (mid-range, slightly reflective)
Metallic:       0.0 (non-metallic)
Normal Map:     Micro-crack pattern (4K)
Height Map:     Subtle wear (±0.02m)
Emissive:       None
Use:            Main track surface (all sections)
```

### Road Surface — Wet Patches (Dynamic)
```
Name:           Wet Asphalt (Coastal sections)
Albedo:         #FF7F50 (same, darkened by wetness)
Roughness:      0.1 (very reflective)
Metallic:       0.05
Normal Map:     Puddle ripples
Emissive:       None
Use:            Sections 2 & 4 (near water)
Animation:      Ripple displacement over time
```

### Lane Markings
```
Name:           Road Paint (White Edge Lines)
Albedo:         #F5F5F0 (Off-white)
Roughness:      0.55 (painted finish)
Metallic:       0.1 (slight paint sheen)
Normal Map:     Very subtle (aged paint)
Height Map:     Wear texture (paint chipping)
Emissive:       None
Use:            Edge lanes, center dashes
Decals:         Dirt overlay, tire marks
```

### Sand Terrain
```
Name:           Beach Sand
Albedo:         #F4D03F (Gold)
Roughness:      0.8 (very rough, sand texture)
Metallic:       0.0
Normal Map:     Sand grain details (4K tiling)
Height Map:     Dune displacement (±0.3m)
Emissive:       None
Use:            Off-road sections, dunes
Particle:       Sand puff on skids
```

### Water Surface
```
Name:           Ocean Water
Albedo:         #00CED1 (Teal) — mostly ignored (transparent)
Roughness:      0.1 (smooth wave peaks)
Metallic:       0.0
Transparency:   0.7 (translucent)
IOR:            1.33 (water refraction)
Normal Map:     Gerstner waves (scrolling)
Displacement:   Wave height (±0.1m)
Emissive:       None
Special:        SSR reflections, caustic projection
Use:            Tidal pool (Section 4)
```

### Coral Formation (Landmark)
```
Name:           Coral Rock
Albedo:         #FF6B9D (Salmon Pink)
Roughness:      0.65
Metallic:       0.0
Normal Map:     Rough organic form
Height Map:     Surface pitting (±0.05m)
Emissive:       None
Use:            Giant coral arch (Section 3)
Vertex Color:   Tint variation for visual interest
```

### Wooden Pier
```
Name:           Weathered Wood
Albedo:         #8B4513 (Wood Brown)
Roughness:      0.6 (aged wood)
Metallic:       0.0
Normal Map:     Wood grain (4K)
Height Map:     Weathering, splinters (±0.03m)
Emissive:       None
Use:            Pier structure (Section 1)
Decals:         Moss, water stains
```

### Palm Tree Foliage
```
Name:           Palm Fronds
Albedo:         #2ECC71 (Palm Green)
Roughness:      0.7 (matte leaf)
Metallic:       0.0
Transparency:   0.3 (alpha-to-coverage)
Normal Map:     Leaf detail
SSS Thickness:  0.8 (strong subsurface scattering)
Use:            Foliage clusters (Section 2)
Animation:      GPU wind sway (0.5–1.0 speed)
```

### Sky & Atmosphere
```
Name:           Sunset Sky
Gradient:       #FF8C42 → #FF69B4 → #87CEEB (low to high)
Ambient Color:  #FFB366 (warm ambient)
Emissive:       Clouds glow 0.6–0.8 intensity
Use:            Background + ambient light source
Special:        Atmospheric scattering (distance haze)
```

---

## TRACK 2: CRYSTAL CAVERN RUN

### Road Surface — Obsidian Asphalt
```
Name:           Wet Obsidian
Albedo:         #0B0B0B (Deep Black)
Roughness:      0.05 (highly reflective)
Metallic:       0.1
Normal Map:     Smooth stone grain (4K)
Height Map:     Minimal (worn smooth)
Emissive:       None
Use:            Primary track surface
Special:        Extremely reflective (mirror-like)
```

### Lane Markings — Neon Cyan
```
Name:           Neon Cyan Paint
Albedo:         #00FFFF (Pure Cyan)
Roughness:      0.2
Metallic:       0.3
Emissive:       #00FFFF @ 2.5 intensity
Glow Falloff:   2m radius
Use:            Lane edges, center dashes
Animation:      Slight pulse (0.5Hz)
```

### Crystal Formations
```
Name:           Quartz Crystal
Albedo:         #E8F8FF (Crystal White)
Roughness:      0.1 (polished)
Metallic:       0.0
Transparency:   0.8 (semi-translucent)
IOR:            1.5 (glass refraction)
Normal Map:     Faceted crystal edges
Emissive:       #00FFFF @ 1.5 intensity (glow)
Use:            Giant pillars (Section 1), maze walls (Section 4)
Special:        SSR reflections, refractive light shards
```

### Stalactite/Stalagmite Stone
```
Name:           Cave Limestone
Albedo:         #696969 (Dim Gray)
Roughness:      0.8 (dull, porous)
Metallic:       0.0
Normal Map:     Rough limestone texture
Height Map:     Erosion detail (±0.1m)
Emissive:       None
Use:            Hanging/rising rock formations
Vertex Color:   Slight purple tint variation
```

### Underground Pool Water
```
Name:           Deep Cave Water
Albedo:         #1a3a4a (Deep Blue)
Roughness:      0.08 (smooth)
Metallic:       0.0
Transparency:   0.6
IOR:            1.33
Normal Map:     Subtle ripples
Emissive:       Faint cyan glow (0.2 intensity)
Use:            Reflective pools (Section 3)
Special:        SSR reflections (show cave ceiling)
```

### Cavern Ceiling (No Sky)
```
Name:           Cavern Rock
Albedo:         #0B0B0B (Black)
Roughness:      0.9 (very dark)
Metallic:       0.0
Emissive:       Crystal glow contributions
Use:            Ceiling geometry + background
Special:        Embedded crystal points = star field
```

---

## TRACK 3: SKY GARDEN ASCENT

### Road Surface — Pale Jade
```
Name:           Jade Garden Path
Albedo:         #00FA9A (Pale Jade)
Roughness:      0.3 (polished stone)
Metallic:       0.05
Normal Map:     Smooth marble grain
Height Map:     Minimal wear
Emissive:       None
Use:            Main track surface (all sections)
```

### Metallic Lane Paint — Gold
```
Name:           Gold Metallic Paint
Albedo:         #FFD700 (Gold)
Roughness:      0.15
Metallic:       0.8 (highly metallic)
Emissive:       #FFD700 @ 0.5 intensity
Use:            Lane markings, edge stripes
Shimmer:        Directional light catches paint
```

### Giant Flower Petals
```
Name:           Flower Petal (Pink)
Albedo:         #FF69B4 (Flower Pink)
Roughness:      0.6 (matte petal)
Metallic:       0.0
Transparency:   0.2 (slight translucency)
Normal Map:     Petal veins (subtle)
SSS Thickness:  1.0 (strong subsurface scattering)
Emissive:       None
Use:            Giant flower landmark (Section 1)
Animation:      Subtle sway (0.2 speed)
```

### Grass Terrain
```
Name:           Garden Grass
Albedo:         #00FA9A (Jade) — grass colored
Roughness:      0.7
Metallic:       0.0
Normal Map:     Grass blade details
Height Map:     Individual blade displacement (±0.02m)
Use:            Island surfaces (all sections)
Decals:         Wildflower patches
```

### Water (Waterfall & Mist)
```
Name:           Cascade Water
Albedo:         #F8F8FF (White/translucent)
Roughness:      0.05
Metallic:       0.0
Transparency:   0.7
Emissive:       Slight cyan glow (0.3 intensity)
Displacement:   Flowing animation
Use:            Waterfall (Section 3)
Particles:      Mist spray
```

### Rope Bridge Cables
```
Name:           Weathered Rope
Albedo:         #8B7355 (Rope Brown)
Roughness:      0.75
Metallic:       0.0
Normal Map:     Rope fiber detail
Height Map:     Rope weave (±0.01m)
Use:            Bridge structure (Section 2)
Physics:        Sag simulation
```

### Mushroom Props
```
Name:           Giant Mushroom Cap
Albedo:         #FFFFFF (White)
Roughness:      0.8 (matte)
Metallic:       0.0
Normal Map:     Bumpy surface
Use:            Mushroom grove (Section 4)
Tint:           Red spots (#FF0000) painted on
```

### Sky & Clouds
```
Name:           Sky Gradient
Gradient:       #4FC3F7 → #87CEEB (azure)
Ambient Color:  #B0E0E6 (bright blue)
Emissive:       Cloud highlights 0.6–0.8 intensity
Use:            Background + lighting
Special:        Volumetric cloud layer below track
```

---

## TRACK 4: VOLCANIC INFERNO PASS

### Road Surface — Charcoal Asphalt
```
Name:           Dark Lava Asphalt
Albedo:         #2F2F2F (Charcoal Black)
Roughness:      0.4 (slightly reflective)
Metallic:       0.05
Normal Map:     Cracked lava texture (4K)
Height Map:     Cracks pattern (±0.02m)
Emissive:       None (base)
Use:            Primary track surface
```

### Lava Cracks (Emissive Animation)
```
Name:           Lava Cracks
Albedo:         #0B0B0B (Deep black)
Roughness:      0.2
Metallic:       0.1
Emissive:       #FF4500 (Orange) @ 1.5–3.0 intensity
Animation:      Pulse 0.8Hz (breathes with heat)
Texture:        Flow map for directional glow
Use:            Embedded in road surface
```

### Lava Surface (Hazard)
```
Name:           Magma Flow
Albedo:         #FF4500 (Lava Orange)
Roughness:      0.1 (molten)
Metallic:       0.2
Transparency:   0.3 (semi-translucent)
Emissive:       #FF4500 @ 2.5–3.5 intensity
Normal Map:     Fluid dynamics texture (scrolling)
Displacement:   Wave animation (±0.1m)
Use:            Non-drivable magma pools (Section 2, 3)
Special:        Heat distortion post-effect, particle embers
```

### Basalt Rock
```
Name:           Basalt Stone
Albedo:         #1a1a1a (Very Dark Gray)
Roughness:      0.85 (dull, porous)
Metallic:       0.0
Normal Map:     Columnar basalt texture
Height Map:     Erosion detail (±0.05m)
Emissive:       None
Use:            Basalt bridge, columns (Sections 3, 1)
Vertex Color:   Slight orange tint from lava glow
```

### Ash Cloud Particles
```
Name:           Volcanic Ash
Particle Type:  Billboarded quads
Albedo:         #708090 (Ash Gray)
Opacity:        0.3–0.5
Lifespan:       3–5 seconds
Gravity:        Slow descent
Density:        Increases visibility reduction to 20%
Use:            Ash tunnel (Section 4)
Animation:      Wind sway, Perlin noise
```

### Volcano Cone (Background)
```
Name:           Volcano Peak
Albedo:         #3a3a3a (Dark Gray)
Roughness:      0.8
Metallic:       0.0
Emissive:       Crater glow #FF4500 @ 0.8 intensity
Smoke:          Volumetric smoke from peak
Use:            Landmark in background (Section 1)
```

### Sky & Atmosphere
```
Name:           Volcanic Sky
Albedo:         #8B4513 (Dark Amber)
Ambient Color:  #662200 (deep warm)
Fog Color:      #8B4513 (heat haze)
Fog Density:    0.04 (atmospheric)
Emissive:       Crater glow reflection in sky
Use:            Background + atmospheric lighting
Special:        Distant lightning (decorative)
```

---

## TRACK 5: CYBER CITY CIRCUIT

### Road Surface — Deep Navy Wet
```
Name:           Rain-Slick Cyber Asphalt
Albedo:         #001F3F (Deep Navy)
Roughness:      0.02 (highly reflective)
Metallic:       0.3
Normal Map:     Rain ripple map (scrolling, 4K)
Height Map:     Puddle simulation
Emissive:       None
Use:            Main street (Sections 1, 5)
Special:        SSR reflections show neon sky
```

### Hazard Lane Markings — Magenta LED
```
Name:           Embedded Magenta LEDs
Albedo:         #FF00FF (Magenta)
Roughness:      0.1
Metallic:       0.4
Emissive:       #FF00FF @ 2.0 intensity
Glow Falloff:   3m radius
Animation:      Pulse 2Hz (LED strobe)
Use:            Lane edge strips
```

### Neon Tunnel Walls
```
Name:           Neon Wall
Albedo:         #001F3F (Dark backing)
Roughness:      0.3
Metallic:       0.6 (reflective panel)
Emissive:       #00BFFF (Electric Blue) @ 1.5–2.0 intensity
Animation:      Flicker 5Hz (chaos)
Use:            Tunnel section (Section 2)
Decals:         Vertical stripe pattern
```

### Skyscraper Glass
```
Name:           Cyan Glass Windows
Albedo:         #001F3F (Night interior)
Roughness:      0.1
Metallic:       0.0
Transparency:   0.6
Emissive:       #00BFFF (Window glow) @ 0.5–1.0 intensity
Use:            Building window lights (background)
Animation:      Flickering on/off (random pattern)
Reflection:     SSR reflects neon
```

### Metal Framework (Buildings)
```
Name:           Chrome Steel
Albedo:         #C0C0C0 (Chrome)
Roughness:      0.15
Metallic:       0.9 (highly metallic)
Normal Map:     Fine metal brushing
Use:            Building structure, railings
Emissive:       Slight glow from nearby neon (0.2)
```

### Holographic Billboard
```
Name:           Hologram (Animated Texture)
Albedo:         #FF00FF (Magenta base)
Roughness:      0.2
Metallic:       0.5
Emissive:       #FF00FF @ 1.5 intensity
Texture:        Scrolling animation (text/graphics)
Use:            Landmark billboard (Section 1)
Opacity:        Flickers (hologram effect)
```

### Sky & City Glow
```
Name:           City Skyline at Night
Albedo:         #0D0221 (Deep Purple-Black)
Ambient Color:  #1a0033 (neon purple ambient)
Emissive:       Neon glow contributions from buildings
Fog Color:      #1a0033
Fog Density:    0.03 (light fog)
Use:            Background + ambient lighting
Special:        No stars — city glow replaces sky
```

---

## TRACK 6: FROST PEAK RALLY

### Road Surface — Ice Blue Asphalt
```
Name:           Frozen Alpine Road
Albedo:         #5DADE2 (Ice Blue)
Roughness:      0.2 (icy, somewhat slippery)
Metallic:       0.1
Transparency:   0.15 (frosty tint)
Normal Map:     Ice crystal pattern (4K)
Height Map:     Frost accumulation (±0.02m)
Emissive:       None
Use:            Primary track surface
```

### Ice Patch (Slippery Hazard)
```
Name:           Slippery Ice
Albedo:         #5DADE2 (lighter, more transparent)
Roughness:      0.05 (very slippery)
Metallic:       0.2
Transparency:   0.25 (more transparent)
Emissive:       Subtle cyan glow (0.2 intensity)
Use:            Frozen lake section (Section 3)
Particles:      Ice chip sparks on wheels
```

### Lane Markings — Silver
```
Name:           Silver Road Paint
Albedo:         #C0C0C0 (Silver)
Roughness:      0.25
Metallic:       0.7
Emissive:       None
Use:            Lane edges, center dashes
```

### Snow Terrain
```
Name:           Fresh Snow
Albedo:         #FFFAFA (Snow White)
Roughness:      0.9 (matte)
Metallic:       0.0
Normal Map:     Snow grain (subtle)
Height Map:     Snow accumulation (±0.1m)
Emissive:       None
Use:            Off-road surfaces, drifts
Shadows:        Receive shadows for depth
```

### Pine Tree Foliage
```
Name:           Snow-Laden Pine Needles
Albedo:         #1B4D3E (Dark Pine Green)
Roughness:      0.8
Metallic:       0.0
Transparency:   0.2 (alpha-to-coverage)
Normal Map:     Needle detail
Snow Overlay:   White texture with opacity (season effect)
Use:            Forest trees (Section 2)
Animation:      Gentle sway (0.3 speed)
```

### Icicle Structures
```
Name:           Translucent Ice
Albedo:         #E8F8FF (Crystal White)
Roughness:      0.05 (smooth)
Metallic:       0.1
Transparency:   0.8
IOR:            1.31 (ice refraction)
Normal Map:     Icicle facets
Emissive:       Faint cyan @ 0.3 intensity
Use:            Hanging icicles (Section 4), frozen waterfalls
Special:        SSR reflections, light refraction
```

### Rock/Alpine Stone
```
Name:           Alpine Granite
Albedo:         #808080 (Gray)
Roughness:      0.75
Metallic:       0.0
Normal Map:     Rock texture
Height Map:     Weathering (±0.05m)
Emissive:       None
Use:            Mountain faces, outcrops (Section 4)
Vertex Color:   Snow caps on peaks
```

### Ski Lodge Building
```
Name:           Wooden Lodge
Albedo:         #8B4513 (Warm Wood Brown)
Roughness:      0.6
Metallic:       0.0
Normal Map:     Wood grain
Emissive:       Warm glow from windows (0.4 intensity)
Use:            Lodge structure (Section 1)
```

### Sky & Atmosphere
```
Name:           Winter Sky
Gradient:       #B0C4DE (Pale Blue)
Ambient Color:  #D0E0F0 (bright white-blue)
Emissive:       Subtle cloud highlights
Fog Color:      #E0F0FF (light blue)
Fog Density:    0.02 (clear alpine air)
Use:            Background + lighting
Special:        Cirrus clouds (high altitude)
```

---

## TRACK 7: ANCIENT RUINS RACEWAY

### Road Surface — Mossy Stone
```
Name:           Temple Floor Stone
Albedo:         #556B2F (Olive Moss Green)
Roughness:      0.7 (weathered)
Metallic:       0.0
Normal Map:     Stone tile pattern (4K)
Height Map:     Moss growth + weathering (±0.03m)
Emissive:       None
Use:            Primary track surface
Decals:         Moss patches, dirt, age
```

### Gold Lane Paint (Carved)
```
Name:           Gold Stone Inlay
Albedo:         #FFD700 (Gold)
Roughness:      0.2 (polished)
Metallic:       0.8
Emissive:       #FFD700 @ 0.6 intensity
Wear:           Decal overlay (tarnish, dirt)
Use:            Lane markings, temple inlay
Glow:           Metallic shine from sun
```

### Stone Statue (Animal Theme)
```
Name:           Weathered Granite Statue
Albedo:         #808080 (Gray Stone)
Roughness:      0.8
Metallic:       0.0
Normal Map:     Carved stone detail
Height Map:     Erosion, cracks (±0.02m)
Emissive:       None
Decals:         Moss, lichen, age stains
Use:            4× statues (jaguar, parrot, turtle, monkey)
Color Variation: Slight tint per animal theme
```

### Waterfall & Water
```
Name:           Jungle Waterfall
Albedo:         #F0F8FF (Water white)
Transparency:   0.7
Emissive:       Slight cyan glow (0.2 intensity)
Displacement:   Flowing water animation
Normal Map:     Water turbulence
Use:            Waterfall stream, mist (Section 4)
Particles:      Mist spray
```

### Temple Arch (Landmark)
```
Name:           Stone Arch
Albedo:         #909090 (Stone Gray)
Roughness:      0.75
Metallic:       0.0
Inlay Color:    Gold (#FFD700) for decorative band
Inlay Metallic: 0.9
Use:            Giant 20m archway (Section 1)
Scale:          Hero asset, detailed carving
```

### Dense Foliage Clusters
```
Name:           Jungle Leaves
Albedo:         #228B22 (Forest Green)
Roughness:      0.7
Metallic:       0.0
Transparency:   0.3 (alpha-to-coverage)
Normal Map:     Leaf detail
SSS Thickness:  0.9 (strong light penetration)
Use:            Jungle vegetation (Section 3)
Animation:      Wind sway (0.4–0.8 speed)
Lighting:       Dappled sunlight through canopy
```

### Collapsed Pillar (Obstacle)
```
Name:           Ancient Pillar
Albedo:         #909090 (Stone)
Roughness:      0.8
Metallic:       0.0
Wear:           Heavy weathering decal overlay
Use:            Broken column ramp (Section 2)
Erosion:        Time-worn appearance
```

### Sky & Canopy
```
Name:           Jungle Sky
Albedo:         #228B22 (Canopy Green)
Ambient Color:  #556B2F (warm green ambient)
Emissive:       Sun shafts through canopy
Fog Color:      #8B9467 (green mist)
Fog Density:    0.04 (jungle humidity)
Use:            Dappled overhead lighting
Special:        Light shafts (crepuscular rays)
```

---

## TRACK 8: STARDUST GALAXY DRIFT

### Road Surface — Metallic Violet
```
Name:           Cosmic Asteroid Deck
Albedo:         #8A2BE2 (Metallic Violet)
Roughness:      0.1 (polished)
Metallic:       0.8 (highly reflective)
Normal Map:     Smooth metal finish (4K)
Emissive:       Faint violet (0.2 intensity)
Use:            Primary track surface (asteroid platform)
```

### Lane Markings — Glowing White
```
Name:           Emissive White Line
Albedo:         #FFFFFF (White)
Roughness:      0.1
Metallic:       0.3
Emissive:       #FFFFFF @ 2.0 intensity
Glow Falloff:   2.5m radius
Use:            Lane edges, center dashes
```

### Asteroid Rock
```
Name:           Space Rock
Albedo:         #696969 (Asteroid Gray)
Roughness:      0.85 (porous)
Metallic:       0.1
Normal Map:     Crater, pitting (4K)
Height Map:     Impact craters (±0.1m)
Emissive:       None
Use:            Floating asteroids (various sizes)
Vertex Color:   Slight purple tint from nebula
```

### Nebula Fog (Volumetric)
```
Name:           Nebula Cloud
Particle Type:  Volumetric raymarched
Albedo:         #FF1493 (Nebula Pink)
Opacity:        0.4–0.6
Density:        Increase visibility reduction to ~15%
Emissive:       #FF1493 @ 0.5 intensity
Use:            Nebula tunnel (Section 3)
Animation:      Slow drift (0.1 speed)
```

### Star Field (Background)
```
Name:           Star Points
Particle Type:  Instanced quads
Color:          #FFFFFF (White)
Emissive:       #FFFFFF @ 1.0 intensity
Count:          10,000+ stars
Scale:          Variable (0.5m–2m)
Use:            Space background
Animation:      Subtle twinkle (Perlin noise)
```

### Planet Sphere
```
Name:           Gas Giant
Albedo:         Gradient (multiple colors per planet)
Roughness:      0.3 (smooth atmosphere)
Metallic:       0.0
Transparency:   0.1 (atmospheric glow)
Emissive:       Rim glow (0.5–1.0 intensity)
Use:            Distant planets (background)
Scale:          Large (visible at distance)
```

### Moon Surface (Jump Target)
```
Name:           Moon Crater Surface
Albedo:         #C0C0C0 (Gray)
Roughness:      0.8 (porous regolith)
Metallic:       0.0
Normal Map:     Crater detail
Height Map:     Crater depression (±0.2m)
Emissive:       None (lit by star)
Use:            Small moon (Section 4)
```

### Space Station Wreckage
```
Name:           Metal Hull
Albedo:         #A9A9A9 (Dark Gray)
Roughness:      0.3
Metallic:       0.7
Emissive:       Faint glow (0.2 intensity)
Damage:         Torn panels, cracks
Use:            Background structure (section view)
```

### Sky & Cosmic Background
```
Name:           Deep Space
Albedo:         #000010 (Nearly Black)
Ambient Color:  #1a1a33 (very dark purple)
Emissive:       Star field + nebula glow
Fog:            None (vacuum)
Use:            Background + ambient lighting
Special:        Milky Way band texture
```

---

## TRACK 9: MEADOW VALLEY SPRINT

### Road Surface — Tan Gravel
```
Name:           Farm Gravel Path
Albedo:         #D4A574 (Tan)
Roughness:      0.6 (loose gravel)
Metallic:       0.0
Normal Map:     Gravel grain (4K tiling)
Height Map:     Loose rocks, ruts (±0.02m)
Emissive:       None
Use:            Primary track surface
```

### Lane Markings — Worn White
```
Name:           Faded Road Paint
Albedo:         #F5F5F0 (Off-white)
Roughness:      0.65
Metallic:       0.05
Normal Map:     Aged paint texture
Wear Decal:     Dirt overlay, tire marks
Use:            Edge lines, center dashes
```

### Grass Meadow
```
Name:           Grass Field
Albedo:         #7CFC00 (Grass Green)
Roughness:      0.8 (matte)
Metallic:       0.0
Normal Map:     Grass blade detail
Height Map:     Individual grass (±0.01m)
Use:            Off-road surfaces
Decals:         Wildflower patches, clover
```

### Wildflowers
```
Name:           Meadow Flowers
Albedo:         #FFD700 (Bright Yellow)
Roughness:      0.7
Metallic:       0.0
Transparency:   0.2 (alpha-to-coverage)
SSS Thickness:  0.8
Use:            Flower bed clusters (Section 2)
Color Variation: Add white, purple variants
```

### Red Barn Wood
```
Name:           Barn Siding
Albedo:         #B22222 (Barn Red)
Roughness:      0.7
Metallic:       0.0
Normal Map:     Wood plank texture
Height Map:     Weathering, knots (±0.02m)
Emissive:       Warm glow from interior (0.3 intensity)
Use:            Barn building (Section 1)
Decals:         Wear, fading, rust
```

### Hay Bales
```
Name:           Golden Hay
Albedo:         #F4D03F (Hay Yellow)
Roughness:      0.85
Metallic:       0.0
Normal Map:     Straw texture
Height Map:     Loose straw (±0.02m)
Use:            Barrier props (Section 3)
```

### Wooden Bridge
```
Name:           Creek Bridge
Albedo:         #8B4513 (Wood Brown)
Roughness:      0.6
Metallic:       0.0
Normal Map:     Wood grain
Use:            Small bridge crossing (Section 4)
Weathering:     Age, water stains
```

### Windmill
```
Name:           Windmill Structure
Albedo:         #B22222 (Red)
Roughness:      0.7
Metallic:       0.0
Blades:         Rotate animation (realistic speed)
Use:            Landmark on hill (Section 1)
```

### Sheep Wool
```
Name:           Wool (White)
Albedo:         #FFFAFA (Off-white)
Roughness:      0.9 (matte)
Metallic:       0.0
Normal Map:     Fuzzy wool texture
SSS Thickness:  0.6
Use:            Decorative sheep (Section 5)
```

### Sky & Clouds
```
Name:           Clear Sky
Gradient:       #87CEEB (Sky Blue)
Ambient Color:  #E0F6FF (bright)
Cloud Bases:    #FFFFFF
Cloud Shadows:  #B0D4E0
Fog:            None
Use:            Background + lighting
Special:        4× puffy clouds, soft shadows
```

---

## TRACK 10: SHADOW METRO UNDERPASS

### Road Surface — Matte Black Asphalt
```
Name:           Subway Platform
Albedo:         #111111 (Matte Black)
Roughness:      0.5
Metallic:       0.0
Normal Map:     Subtle wear texture (4K)
Height Map:     Minor wear (±0.01m)
Emissive:       None
Use:            Primary track surface
```

### Hazard Lane Stripes — Yellow
```
Name:           Hazard Paint
Albedo:         #FFFF00 (Bright Yellow)
Roughness:      0.35
Metallic:       0.1
Emissive:       #FFFF00 @ 1.5 intensity (safety glow)
Glow Falloff:   2m radius
Use:            Edge safety stripes
Animation:      Slight flicker (2Hz) for hazard feel
```

### Fluorescent Light Tubes
```
Name:           Fluorescent Lamp
Albedo:         #FFFFFF (White)
Roughness:      0.1 (polished glass)
Metallic:       0.3
Emissive:       #CCCCFF @ 2.0–2.5 intensity (cool white)
Animation:      Flicker 3–5Hz (aging bulbs)
Frame:          Metallic (#808080) @ 0.7 roughness
Use:            Light fixtures (8× per section)
Shadows:        Cast subtle geometric shadows
```

### Graffiti Mural
```
Name:           Street Art (Kid-Friendly)
Albedo:         Colorful multi-layered texture
Colors:         Bright street art palette
Roughness:      0.5 (aged spray paint)
Metallic:       0.0
Emissive:       None
Use:            Tunnel wall decals
Style:          Playful, age-appropriate (no harmful content)
```

### Concrete Tunnel Walls
```
Name:           Rough Concrete
Albedo:         #A9A9A9 (Concrete Gray)
Roughness:      0.9 (very rough)
Metallic:       0.0
Normal Map:     Concrete aggregate texture (4K)
Height Map:     Stains, cracks (±0.03m)
Emissive:       None
Use:            Tunnel structure, walls, ceiling
Decals:         Water stains, mold, graffiti
```

### Metal Pipe & Infrastructure
```
Name:           Steel Pipe
Albedo:         #808080 (Dark Gray)
Roughness:      0.4
Metallic:       0.8
Normal Map:     Pipe corrosion
Emissive:       None
Use:            Conduits, railings (background)
Rust Decal:     Orange (#CD853F) overlay
```

### Train Car Exterior
```
Name:           Weathered Metal Train
Albedo:         #696969 (Train Gray)
Roughness:      0.5
Metallic:       0.6
Graffiti:       Colorful decal overlay
Rust:           Orange trim (#CD853F)
Use:            Abandoned train cars (Section 5)
Windows:        Dark tinted glass
```

### Platform Edge Warning Line
```
Name:           Yellow Platform Edge
Albedo:         #FFFF00 (Bright Yellow)
Roughness:      0.4
Metallic:       0.2
Emissive:       #FFFF00 @ 1.0 intensity
Use:            Platform boundary marker
Stripe Pattern: Black/yellow painted line
```

### Station Clock Face
```
Name:           Digital Display / Analog Clock
Albedo:         Display texture
Emissive:       Green (#39FF14) @ 1.5 intensity (LED)
Use:            Background element (wayfinding)
Animation:      Time scrolls (or shows speed equivalent)
```

### Steam Vent Particle
```
Name:           Hot Steam
Particle Type:  Billboarded smoke
Color:          #CCCCCC (Light Gray)
Opacity:        0.6–0.8
Lifespan:       2–3 seconds
Turbulence:     Wind-driven
Use:            Steam vents (Sections 4, 5)
Density:        Creates visual hazard telegraph
```

### Sky (No Sky — Ceiling)
```
Name:           Concrete Ceiling
Albedo:         #555555 (Dark Gray)
Roughness:      0.95 (very dull)
Metallic:       0.0
Emissive:       Recessed lights contribute
Use:            Overhead geometry + background
Lighting:       Shadows from ceiling structure
```

---

## Material Quick-Reference Table

| Track | Primary Road | Lane Markings | Accent Element | Hazard Material |
|-------|----------|-----------|---------|------------|
| **1** | Coral (#FF7F50) | White (#F5F5F0) | Sand (#F4D03F) | Water (transparent) |
| **2** | Obsidian (#0B0B0B) | Neon Cyan (#00FFFF) | Crystal (#E8F8FF) | Crystal (refract) |
| **3** | Jade (#00FA9A) | Gold (#FFD700) | Flower (#FF69B4) | Water (waterfall) |
| **4** | Charcoal (#2F2F2F) | Orange (#FF4500) | Lava (#FF4500) | Lava (emissive) |
| **5** | Navy (#001F3F) | Magenta (#FF00FF) | Neon Blue (#00BFFF) | Fog (volumetric) |
| **6** | Ice Blue (#5DADE2) | Silver (#C0C0C0) | Icicle (#E8F8FF) | Ice (slippery) |
| **7** | Moss (#556B2F) | Gold (#FFD700) | Stone (#909090) | Foliage (dense) |
| **8** | Violet (#8A2BE2) | White (#FFFFFF) | Rock (#696969) | Nebula (fog) |
| **9** | Tan (#D4A574) | White (#F5F5F0) | Grass (#7CFC00) | None (easy) |
| **10** | Black (#111111) | Yellow (#FFFF00) | Concrete (#A9A9A9) | Steam (fog) |

---

**End of Material Palette Specifications**
