# COMPOSER 2.5 — CAR ROBOT RACING TRACKS (10 MODES) · FULL AGENT PROMPT

> **Visual target:** “ByteBuddies: Car Robot Racing Tracks” mockup — 10 distinct, vibrant,
> Mario-Kart–quality 3D worlds (beach, cyber city, desert, forest, ice, space, volcano,
> jungle ruins, rainbow road, neon finale stadium). Kid-friendly UI; premium scenery on track.

**Repo root:** `bytebuddies1-claude-bold-dewdney-73f401/`

---

# COPY-PASTE — GIVE THE AGENT THE ENTIRE BLOCK BELOW

```
═══════════════════════════════════════════════════════════════════════════════
COMPOSER 2.5 — BYTEBUDDIES: 10 CAR RACING TRACKS (ROVER / SCOUT MODES 1–10)
═══════════════════════════════════════════════════════════════════════════════

ROLE: Senior Three.js environment artist + gameplay engineer. Ship 10 unique,
screenshot-quality kart worlds in the browser. Each mode must be instantly
recognizable by SILHOUETTE and PALETTE — not the same oval with a color filter.

REFERENCE (match this bar):
- Sunny Shores: tropical beach, lighthouse, palms, wooden boardwalk track, turquoise sea
- City Circuit: glass skyscrapers, palm-lined asphalt, purple/yellow track arrows, cones
- Desert Dunes: orange dunes, mesas, cacti, stone bridges over canyons
- Forest Trail: pines, waterfalls, wooden bridge over stream
- Ice Valley: glaciers, snow peaks, penguins, neon-blue ice arches on track
- Space Station: starfield, planets, glowing neon track, metal rings
- Volcano Run: lava rivers, erupting volcano, dark sky, stone over lava
- Jungle Ruins: mist, vines, moss stone ruins, waterfalls
- Rainbow Road: rainbow-striped floating road, clouds, hot air balloons, cyan sky
- Final Challenge: night stadium, purple/blue neon, grandstands, giant FINISH gate

NON-NEGOTIABLE:
- No flat pink KidClarity sandbox for Rover/Scout modes 1–10.
- No grey untextured boxes as “buildings.” Use PBR (MeshPhysicalMaterial), emissive
  accents, skydomes, fog, and hero props OFF the road corridor.
- Collectible gold coins on track; kerbs/guardrails readable at chase cam.
- 60fps target @ 1080p medium tier after LOD; document perf choices.

═══════════════════════════════════════════════════════════════════════════════
A. MODE → ARENA ID (ALREADY WIRED — DO NOT BREAK)
═══════════════════════════════════════════════════════════════════════════════

Rover & Scout Primary Studio modes map via getMKTrackForCarMode():

  Mode 1  → sunset_cove_01     display: Sunny Shores
  Mode 2  → neon_metro_01      display: City Circuit
  Mode 3  → dry_dry_desert     display: Desert Dunes
  Mode 4  → fairy_glen_01      display: Forest Trail
  Mode 5  → frost_peak_01      display: Ice Valley
  Mode 6  → star_station_01    display: Space Station
  Mode 7  → lava_foundry_01    display: Volcano Run
  Mode 8  → jungle_ruins_01    display: Jungle Ruins
  Mode 9  → rainbow_road       display: Rainbow Road (CLASSIC_RAINBOW_TRACK)
  Mode 10 → thunder_ridge_01     display: Final Challenge

Files:
  src/virtual-robot-designer/racing/mk-tracks/MKTrackRegistry.js
    → CAR_MODE_ARENA_IDS, CAR_MODE_TRACK_LABELS, getMKTrackForCarMode()
  src/virtual-robot-designer/data/car-racing-tracks.js
    → applyCarRacingArena(), isCarRacingArenaType()
  src/virtual-robot-designer/data/primary-robot-studio.js
    → applyPrimaryStudioMeta() merges kid objectives + kart arenaType
  src/virtual-robot-designer/studio/LiveLabPage.jsx
    → primaryStudioRacing → buildMKTrackArena(scene, mkArena)

VERIFY WIRING BEFORE ART PASS:
  node --input-type=module -e "
  import { applyPrimaryStudioMeta } from './src/virtual-robot-designer/data/primary-robot-studio.js';
  const m = applyPrimaryStudioMeta({ chassisId:'rover', modeIndex:1, isChassisMode:true });
  console.log(m.name, m.arenaType, m.genre);
  "
  Expect: Sunny Shores sunset_cove_01 racing

═══════════════════════════════════════════════════════════════════════════════
B. BUILD PIPELINE (WHERE SCENERY ACTUALLY RUNS)
═══════════════════════════════════════════════════════════════════════════════

Entry: buildMKTrackArena(scene, arenaType)
  → src/virtual-robot-designer/racing/RacingCourse.js

Themed world:
  → buildMKThemedWorld / BiomeAAAWorlds / *HeroKit.js per biome
  → RealGameTrackKit.js calls installCupReferenceQuality() for cup-grade backdrops

KEY FILES TO UPGRADE (priority order):

1) CUP-GRADE COMPOSITIONS (first-frame hero scenery per track id)
   src/virtual-robot-designer/racing/mk-tracks/CupReferenceQualityKit.js
     → THEMES per arenaType, installCupReferenceQuality(), animateCupReferenceQuality()
     → Extend THEMES + builders for: dry_dry_desert, thunder_ridge_01 finale stadium
     → Push sunset_cove / neon_metro / fairy_glen closer to reference mockup density

2) PER-BIOME HERO KITS (large landmarks beside spline)
   src/virtual-robot-designer/racing/mk-tracks/SunsetCoveHeroKit.js
   src/virtual-robot-designer/racing/mk-tracks/MetroHeroKit.js
   src/virtual-robot-designer/racing/mk-tracks/MeadowHeroKit.js (forest/glen)
   src/virtual-robot-designer/racing/mk-tracks/FrostPeakHeroKit.js
   src/virtual-robot-designer/racing/mk-tracks/GalaxyHeroKit.js (space)
   src/virtual-robot-designer/racing/mk-tracks/VolcanoHeroKit.js
   src/virtual-robot-designer/racing/mk-tracks/RuinsHeroKit.js
   src/virtual-robot-designer/racing/mk-tracks/BiomeAAAWorlds.js

3) SKY + FOG + POST
   src/virtual-robot-designer/racing/mk-tracks/TrackSkyKit.js
   src/virtual-robot-designer/racing/mk-tracks/BiomeAAAVisualSpec.js
   src/virtual-robot-designer/racing/mk-tracks/BiomeCinematicPipeline.js
   src/virtual-robot-designer/racing/mk-tracks/BiomeAAAKit.js (pbrMat, buildAtmosphereSky)

4) ROAD / KERBS / COINS
   src/virtual-robot-designer/racing/mk-tracks/PBRMaterialKit.js
   src/virtual-robot-designer/racing/mk-tracks/BiomeAAARoadTextures.js
   src/virtual-robot-designer/racing/mk-tracks/TrackPlayLayerKit.js (coins, boosts)
   src/virtual-robot-designer/racing/mk-tracks/TrackFeaturesKit.js

5) SPLINES (only tweak if track layout blocks hero placement)
   src/virtual-robot-designer/racing/mk-tracks/CodeRacerSplines.js
   src/virtual-robot-designer/racing/mk-tracks/BiomeTrackRegistry.js

Live Lab must treat kart tracks as biome (_isBiomeTrackEarly + isCarRacingArenaType).
Console on load: [LiveLab] Primary studio kart track <arenaId> <label>

═══════════════════════════════════════════════════════════════════════════════
C. PER-TRACK ART DIRECTION (IMPLEMENT IN CODE)
═══════════════════════════════════════════════════════════════════════════════

For EACH mode, deliver at minimum:
- 1 HERO landmark (40–120m from track, readable at spawn): lighthouse, skyscraper cluster,
  desert mesa, waterfall bridge, glacier arch, habitat dome, volcano cone, temple gate,
  rainbow arch, stadium FINISH sign
- 1 MIDGROUND layer (instanced props, 8–24 pieces): palms, cacti, pines, ice spikes, etc.
- 1 SKY treatment: gradient skydome or buildAtmosphereSky; fog color matches palette
- Road: PBR albedo + roughness map OR procedural variation; kerbs red/white or themed
- 12–20 collectible coins along spline; emissive gold, not flat yellow planes

sunset_cove_01 (Sunny Shores):
  Sky: #87CEEB → #FFE4B5 horizon. Water plane emissive cyan edge. Palm clusters left/right.
  Hero: lighthouse + pier at t≈0.15. Sand warm #F4D03F.

neon_metro_01 (City Circuit):
  Sky: dusk purple #1a1035. Wet asphalt reflectivity. Hero: 3 glass towers + neon signs.
  Magenta/cyan emissive windows (toneMapped off on emissive).

dry_dry_desert (Desert Dunes):
  Sky: orange haze #E8A050. Rolling dunes (displaced planes or stacked cones). Cacti instances.
  Hero: mesa + wooden canyon bridge over dry wash.

fairy_glen_01 (Forest Trail):
  Sky: soft green-blue. Hero: waterfall + wooden bridge over stream. Dense pine billboards or low-poly trees.

frost_peak_01 (Ice Valley):
  Sky: pale blue #B8D9F0. Hero: glacier wall + ski lift silhouette. Track ice material high clearcoat.
  Neon blue torus gates optional.

star_station_01 (Space Station):
  Sky: #020617 stars (particle or sphere map). Earth dome in distance. Glass floor sections near track.
  Emissive runway strips.

lava_foundry_01 (Volcano Run):
  Sky: dark red-black. Lava planes emissive #FF4500 animated (sin time). Hero: volcano cone + glow.

jungle_ruins_01 (Jungle Ruins):
  Mist volumetric layer low opacity. Moss stone blocks, vine planes. Hero: temple arch + idol silhouette.

rainbow_road (mode 9):
  Rainbow UV-striped road shader or segmented color planes. Cloud layers below track. Balloons in far field.

thunder_ridge_01 (Final Challenge):
  Night stadium: grandstand boxes, flood lights, purple rim light. Giant FINISH gate at start/finish.
  Lightning flash in animateCupReferenceQuality (brief emissive pulse).

═══════════════════════════════════════════════════════════════════════════════
D. MATERIAL & RENDER RULES
═══════════════════════════════════════════════════════════════════════════════

- Use pbrMat() from BiomeAAAKit.js — metalness/roughness/normal where possible
- scene.environment from CanvasTexture gradient (bindAerialEnvironment pattern) OR PMREM
- scene.userData.raceVisual: bloom 0.28–0.42, threshold 0.82–0.88 for neon tracks
- ACESFilmicToneMapping, exposure 1.1–1.25 on biome tracks
- Props: frustumCulled true; merge static meshes where >30 identical pieces
- Keep hero roots OUTSIDE road corridor ± (trackWidth + 6m) — use sampleTrackFrame / curve

═══════════════════════════════════════════════════════════════════════════════
E. ACCEPTANCE TESTS (RUN BEFORE DONE)
═══════════════════════════════════════════════════════════════════════════════

[ ] Rover mode 1 in Live Lab: NOT KidClarityBase / NOT pink open_sky floor
[ ] Console: [LiveLab] Primary studio kart track sunset_cove_01
[ ] scene.userData.biomeAAA or raceMode active; chase camera follows spline
[ ] Modes 1–10: arenaType changes per CAR_MODE_ARENA_IDS table
[ ] Each mode: ≥1 named hero mesh group in scene (grep userData.artDirected or kit root name)
[ ] Coins visible; minimap shows circuit
[ ] No WebGL black screen on aerial-style post — kart uses biome composer path when tier ≠ low
[ ] Headless smoke (optional):
    import buildMKTrackArena from RacingCourse.js + THREE.Scene per arena id

DO NOT:
- Revert Primary Studio flyers or cars to sandbox arenaType
- Add new npm deps without approval
- Replace all 10 tracks with one shared prefab + tint

DELIVERABLE: Focused diffs in CupReferenceQualityKit + relevant *HeroKit.js files,
sky/fog tuning, and any missing desert/stadium builders. Short changelog listing
what each mode gained visually.
═══════════════════════════════════════════════════════════════════════════════
END PROMPT
```

---

## Quick link (same repo)

| Item | Path |
|------|------|
| Mode map | `racing/mk-tracks/MKTrackRegistry.js` |
| Primary Studio + kart meta | `data/primary-robot-studio.js` |
| Live Lab routing | `studio/LiveLabPage.jsx` (`primaryStudioRacing`) |
| Cup scenery | `racing/mk-tracks/CupReferenceQualityKit.js` |
