# COMPOSER 2.5 — UE5 PREMIUM ENVIRONMENTS · ULTRA-SPEC PROMPT
## Hyper-specific build order · exact numbers · exact files · exact acceptance tests

> **Use this when the shorter `composer-2.5-ue5-premium-environments-prompt.md` is not enough.**  
> **Repo root:** `bytebuddies1-claude-bold-dewdney-73f401/`  
> **Primary code:** `src/virtual-robot-designer/studio/aerial-world/`

---

# COPY-PASTE — GIVE COMPOSER 2.5 THE ENTIRE BLOCK BELOW

```
═══════════════════════════════════════════════════════════════════════════════
COMPOSER 2.5 — BYTEBUDDIES UE5 ENVIRONMENTS (ULTRA-SPEC BUILD ORDER)
═══════════════════════════════════════════════════════════════════════════════

ROLE: Senior graphics engineer. Deliver 10 flying vistas at UE5-tier fidelity in
the browser using Three.js (WebGPU first, WebGL2 fallback). You choose the BEST
implementation method per effect — document your choice in a short comment at the
top of each file you touch.

NON-NEGOTIABLE: Do not ship grey placeholder boxes. Every hero prop uses PBR +
emissive where specified. Every vista has a tuned post profile. 60fps @ 1080p on
integrated GPU after optimization.

═══════════════════════════════════════════════════════════════════════════════
A. EXACT REPOSITORY PATHS (EDIT THESE FILES)
═══════════════════════════════════════════════════════════════════════════════

GEOMETRY + VISTA BUILDS:
  src/virtual-robot-designer/studio/aerial-world/PremiumFlyingEnvironmentKit.js
    → buildGothicClockworkSpire
    → buildVenetianMidnightCanal
    → buildCyberneticAssemblyLine
    → buildNeonServerNecropolis
    → buildMonasticRuins
    → buildObsidianCitadel
    → buildQuantumReactorCore
    → buildBioluminescentTrench
    → buildVictorianGrandLibrary
    → buildLowOrbitStealthCarrier
    → installPremiumFlyingEnvironment(vista, ...)
    → animatePremiumEnvironments(scene, time)

POST + ATMOSPHERE + MATERIAL POLISH:
  src/virtual-robot-designer/studio/aerial-world/AerialUERenderKit.js
    → PREMIUM_RENDER_PROFILES (per vista id)
    → applyUE5AerialRenderProfile(scene, contract)
    → bindAerialEnvironment(scene, sky)
    → installUE5AerialAtmosphere(scene, bounds, sky, recipe, vista)
    → enhanceAerialMaterials(scene)
    → animateUE5AerialEffects(scene, time)

MATERIALS:
  src/virtual-robot-designer/studio/aerial-world/FlyingArenaMaterialKit.js
  src/virtual-robot-designer/racing/mk-tracks/BiomeAAAKit.js (pbrMat)

WIRING (must call premium install, not skip):
  src/virtual-robot-designer/studio/aerial-world/FlyingArenaKit.js
    → installFlyingVistaLayer — MUST call installPremiumFlyingEnvironment when
      contract.bible.aerialVista OR contract.mission.premiumVista is one of the
      10 ids below

  src/virtual-robot-designer/studio/aerial-world/AerialWorldKit.js
    → buildAerialWorld — after flyingContract resolved:
      applyUE5AerialRenderProfile(scene, flyingContract)
      installUE5AerialAtmosphere(scene, bounds, recipe.sky, recipe, vistaId)
      enhanceAerialMaterials(scene)

  src/virtual-robot-designer/studio/LiveLabPage.jsx
    → render loop MUST call:
      animatePremiumEnvironments(scene, elapsed)
      animateUE5AerialEffects(scene, elapsed)
    → renderer: ACESFilmicToneMapping, toneMappingExposure 1.0–1.12
    → OPTIONAL: WebGPURenderer via createPremiumRenderer() if you add it

CREATE IF NEEDED (WebGPU-only features):
  src/virtual-robot-designer/studio/aerial-world/AerialWebGPUKit.js
    → createPremiumRenderer(canvas)
    → installN8AOPass(renderer, scene, camera)  // or wire existing GTAO
    → createSSRWaterMaterial()                    // TSL when WebGPU
    → createAssemblyDebrisCompute(count)          // compute instancing

═══════════════════════════════════════════════════════════════════════════════
B. THE 10 VISTA IDS (STRING LITERALS — COPY EXACTLY)
═══════════════════════════════════════════════════════════════════════════════

1.  gothic_clockwork_spire
2.  venetian_midnight_canal
3.  cybernetic_assembly_line
4.  neon_server_necropolis
5.  monastic_ruins
6.  obsidian_citadel
7.  quantum_reactor_core
8.  bioluminescent_trench
9.  victorian_grand_library
10. low_orbit_stealth_carrier

Export array: PREMIUM_ENVIRONMENT_IDS in PremiumFlyingEnvironmentKit.js

═══════════════════════════════════════════════════════════════════════════════
C. GLOBAL RENDER CONSTANTS (APPLY TO ALL 10)
═══════════════════════════════════════════════════════════════════════════════

RENDERER (WebGL fallback — LiveLab today):
  antialias: true
  toneMapping: THREE.ACESFilmicToneMapping
  toneMappingExposure: 1.05 (1.0 for neon_server_necropolis only)
  shadowMap.enabled: true
  shadowMap.type: THREE.PCFSoftShadowMap
  outputColorSpace: THREE.SRGBColorSpace (if available)

DIRECTIONAL KEY LIGHT (flying arenas):
  color: 0xfff0e0
  intensity: 1.35 (0.65 for venetian_midnight_canal, neon_server_necropolis)
  position: (120, 180, 80) — adjust per vista
  castShadow: true
  shadow.mapSize: 2048×2048
  shadow.camera.near: 10, far: 400, bounds ±150

AMBIENT:
  color: 0x8899aa
  intensity: 0.35 (0.12 for neon + trench + necropolis night scenes)

scene.userData.raceVisual (LiveLab post composer reads this):
  bloom:        vista-specific (see section D)
  threshold:    vista-specific
  radius:       vista-specific
  grade.s:      saturation multiplier 1.05–1.30
  grade.c:      contrast 1.08–1.16
  grade.g:      RGB gain [r,g,b] per vista
  gtao:         { blendIntensity, radius, samples } — WebGL AO stand-in for N8AO

IBL:
  bindAerialEnvironment(scene, sky) → 256×128 canvas equirect gradient
  scene.environmentIntensity: 0.72 default, 1.05 canal, 1.15 carrier, 1.2 necropolis

FLIGHT CAMERA (do not change without reason):
  camBack: 9.2, camUp: 4.4, lookAhead: 16, lookHeight: 1.2, fov: 48

VISTA PLACEMENT RULE:
  All environment geometry is built relative to backdrop.at(sideOff, fwdOff)
  from FlyingArenaKit frameAlongCurve — flight path is the spline at y≈16–28.
  Hero props must appear within 15–45m lateral offset and 0–35m below flight Y
  so they fill 25–40% of screen width at chase cam.

═══════════════════════════════════════════════════════════════════════════════
D. PER-ENVIRONMENT ULTRA-SPEC (BUILD EXACTLY — THEN UPGRADE METHOD)
═══════════════════════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────────────────────
D1. gothic_clockwork_spire
──────────────────────────────────────────────────────────────────────────────
HERO TECH: N8AO (WebGPU) OR GTAO blendIntensity 0.72, radius 0.32, samples 8

POST PROFILE (AerialUERenderKit PREMIUM_RENDER_PROFILES):
  bloom: 0.28, threshold: 0.84, radius: 0.18
  grade: { s: 1.1, c: 1.12, g: [1.02, 0.98, 0.94] }
  clearcoatBoost: true

SKY STOPS:
  top: #1e293b, mid: #64748b, horizon: #fbbf24, fog: #78716c
  near: 100, far: 340
  installUE5AerialAtmosphere: buildVolumetricCloudLayer y=58, color 0xfff7ed, opacity 0.28

GEOMETRY MINIMUM (enlarge if smaller):
  • ClockSpireCore: CylinderGeometry(9, 12, 48, 12) — dark_steel metalness 0.82 roughness 0.38
  • SpireCap: ConeGeometry(10, 18, 12) — brass 0xb45309 emissive 0xfbbf24 emi 0.12
  • Gears: ≥14 instances, radius 3–7m, thickness 0.6m, 8 teeth each, userData.spinGear 0.15–0.5
  • FlyingButtresses: 6× Box(3, 28, 3) iron + ledge Box(5, 0.4, 8) brass
  • ClockRing: Torus(6, 0.25) at y+42, rotX π/2

MATERIAL RULE: Every brass gear gets clearcoat 0.4, metalness 0.72.

ACCEPTANCE TEST:
  [ ] Gear tooth crevice reads dark AO at 1080p screenshot
  [ ] Spire occupies ≥20% frame height when camera at t=0.15 on spline
  [ ] ≥3 gears visibly rotating in animatePremiumEnvironments

BEST METHOD ORDER: Try N8AO post → else GTAO in raceVisual → enhanceAerialMaterials clearcoat

──────────────────────────────────────────────────────────────────────────────
D2. venetian_midnight_canal
──────────────────────────────────────────────────────────────────────────────
HERO TECH: SSR (WebGPU TSL) OR MeshPhysicalMaterial clearcoat water + env map

POST:
  bloom: 0.22, threshold: 0.88, radius: 0.16
  grade: { s: 1.08, c: 1.1, g: [0.92, 0.96, 1.08] }
  envIntensity: 1.05

SKY: top #0c1929, mid #1e3a5f, horizon #334155, fog #0f172a, near 80, far 280
ATMOSPHERE: ue5-canal-mist volumetric layer y=8, color 0x1e293b opacity 0.22

WATER MESH (name MUST be 'CanalWaterSSR' for enhanceAerialMaterials hook):
  PlaneGeometry(340, 140, 32, 12)
  position: canal backdrop y-2, rotation.x = -π/2
  Material: color #0c1929, roughness 0.02, metalness 0.85, clearcoat 1.0,
            clearcoatRoughness 0.04, emissive #1e3a5f emi 0.08, opacity 0.92
  ANIMATION: vertex sin(time + x*0.1)*0.08 ripple in shader OR position.y wobble

PALAZZI: 10 buildings, width 12, depth 8, height 14–26 stepped
  WindowGlow: Box(2, 3, 0.15) emissive #fbbf24 emi 0.35 every building
BRIDGES: 4× stone deck 16×0.35×2.5 + lamp cylinder h=3
MOON: SphereGeometry(3) at backdrop (40, -10) y+38 emissive #e2e8f0 emi 0.25

ACCEPTANCE TEST:
  [ ] Window glow visible in water specular/reflection at camera pitch -15°
  [ ] Water not mirror-flat grey — must show highlight streak
  [ ] Scene reads "night" — exposure ≤1.05

BEST METHOD: Reflector.js if SSR too heavy; else PhysicalMaterial + scene.environment

──────────────────────────────────────────────────────────────────────────────
D3. cybernetic_assembly_line
──────────────────────────────────────────────────────────────────────────────
HERO TECH: WebGPU compute instancing OR InstancedMesh ≥500 debris pieces

POST:
  bloom: 0.26, threshold: 0.82, radius: 0.20
  grade: { s: 1.05, c: 1.08, g: [1.04, 0.98, 0.92] }
  gtao: blend 0.58, radius 0.24, samples 7

SKY: top #374151, mid #6b7280, horizon #9ca3af, fog #4b5563
ATMOSPHERE: ue5-factory-haze y=14, 0x78716c opacity 0.28

GEOMETRY:
  Floor: Plane 360×120 asphalt at y-1
  3 lanes × 5 conveyors: Box(22, 1.2, 3) painted_steel
  Per conveyor: robot arm base Cylinder(0.8, 0.8, 2) + arm Box(6, 0.35, 0.35)
  DEBRIS: InstancedMesh name 'AssemblyDebrisInstanced'
    MINIMUM count: 500 (upgrade from 120)
    BoxGeometry(0.4, 0.25, 0.35) rust material
    Spread: factory floor under spline, y 0–8m
  SPARKS: ≥24 emissive spheres OR Points count 400, color #fbbf24, size 0.15

COMPUTE PATH (if WebGPU):
  Storage buffer: float3 position, float3 velocity per instance
  Each frame: vy -= 9.8*dt; bounce on floorY; write back to instanceMatrix

ACCEPTANCE TEST:
  [ ] ≥500 debris instances drawn in one InstancedMesh (or compute equivalent)
  [ ] FPS ≥55 on M1 Air at 1080p with all debris visible
  [ ] Orange sparks visible on at least 3 conveyor stations

──────────────────────────────────────────────────────────────────────────────
D4. neon_server_necropolis
──────────────────────────────────────────────────────────────────────────────
HERO TECH: ACESFilmic + selective bloom (threshold 0.72, bloom 0.38)

POST (STRICT — do not use golden hour exposure):
  bloom: 0.38, threshold: 0.72, radius: 0.28
  grade: { s: 1.28, c: 1.14, g: [0.88, 1.02, 1.1] }
  renderer.toneMappingExposure: 1.0

SKY: top #0a0a0a, mid #0f172a, horizon #1e293b, fog #0a0a0f
ATMOSPHERE: ue5-neon-cyan-mist + ue5-neon-magenta-mist (dual layers)
bindAerialEnvironment envIntensity 1.2

GEOMETRY:
  Floor plane 340×130 color #0f172a at y+4
  Server grid: 6 rows × 4 cols
    Rack: Box(4, h, 2.5) h=10–14 dark_steel metalness 0.75
    Per rack: vertical DataStream strips — Box(3.2, 0.08, 0.08) emissive
      colors cycle #22c55e, #06b6d4, #a855f7 emi 0.85
  DataPylons: 8× post Box(0.25, 20, 0.25) green emissive + Torus(3) cyan ring

ANIMATION (animatePremiumEnvironments):
  DataStream emissiveIntensity = 0.6 + sin(time*4 + y)*0.35

ACCEPTANCE TEST:
  [ ] Data streams readable against #0f172a floor from 80m away
  [ ] Bloom halo tight around emissives — background stays near-black
  [ ] No warm sunset sky — fail if horizon is orange

──────────────────────────────────────────────────────────────────────────────
D5. monastic_ruins
──────────────────────────────────────────────────────────────────────────────
HERO TECH: 4K PBR maps (albedo + normal + roughness) on stone AND moss

POST:
  bloom: 0.20, threshold: 0.90, radius: 0.14
  grade: { s: 1.22, c: 1.06, g: [1.06, 1.04, 0.92] }
  gtao: blend 0.65, radius 0.26, samples 8

SKY: overcast top #94a3b8, horizon #cbd5e1, fog #e2e8f0
ATMOSPHERE: ue5-volumetric-clouds (soft, not storm)

GEOMETRY:
  CathedralNave: Box(80, 22, 40) stone roughness 0.9
  RoofMoss: Box(80, 4, 42) grass/moss roughness 0.92
  Columns: 5× Cylinder(1.2, 1.5, 28) + Ivy box(3, 8, 3) offset
  BellTower + moss cone cap
  RuinWall segments: 6× varied height stone + moss cap

TEXTURES (if missing, generate OR procedural):
  stone: load from public/assets if path exists matching *stone* *moss*
  normalScale: (1, 1) on stone; moss normal strength 0.6
  tiling: repeat 4×4 on nave walls

ACCEPTANCE TEST:
  [ ] Moss and stone distinguishable in greyscale screenshot
  [ ] Column base contact shadow visible (GTAO)
  [ ] No single flat green plane on roof — must have normal variation

──────────────────────────────────────────────────────────────────────────────
D6. obsidian_citadel
──────────────────────────────────────────────────────────────────────────────
HERO TECH: wet clearcoat + volumetric fog

POST:
  bloom: 0.24, threshold: 0.86, radius: 0.18
  grade: { s: 1.06, c: 1.16, g: [0.9, 0.94, 1.08] }
  clearcoatBoost: true, wetSurfaces: true

SKY: top #0f172a, mid #1e1b4b, horizon #312e81, fog #1e1b4b
ATMOSPHERE: ue5-storm-fog y=18, color 0x1e1b4b opacity 0.38
scene.fog: FogExp2 #1e1b4b density 0.0025

TOWERS: 5× obsidian MeshPhysicalMaterial
  color #0f172a, roughness 0.15, metalness 0.55, clearcoat 0.95,
  clearcoatRoughness 0.06, emissive #312e81 emi 0.06
  widths 14→6m stepped, heights 16–36m
StormFogLayer: Plane 300×80 opacity 0.35 at y+35

OPTIONAL: installAerialDifficulty rain: true when this vista active

ACCEPTANCE TEST:
  [ ] Specular streak on tower wet surface when key light moves
  [ ] Distant towers fade into fog (far tower contrast <40% near tower)
  [ ] enhanceAerialMaterials sets clearcoat ≥0.85 on obsidian meshes

──────────────────────────────────────────────────────────────────────────────
D7. quantum_reactor_core
──────────────────────────────────────────────────────────────────────────────
HERO TECH: TSL hex energy shader (WebGPU) OR emissive Physical + bloom 0.42

POST:
  bloom: 0.42, threshold: 0.68, radius: 0.30
  grade: { s: 1.30, c: 1.12, g: [0.96, 0.92, 1.14] }

SKY: interior black top #0a0a0a, minimal fog
bindAerialEnvironment dark gradient only

GEOMETRY:
  ReactorBase: Cylinder(16, 18, 6, 24) dark_steel
  HexRing: 4× Torus(r, 0.2, 6, 6) r=8,11,14,17 emissive #06b6d4 emi 0.85 rotX π/2
  HexCell: 12× Cylinder(1.8, 1.8, 0.35, 6) purple/cyan emi 0.95 on ring radius 14
  CorePlasma: Sphere(5) emissive #22d3ee emi 1.2 opacity 0.55
  ReactorPylon: 8× Cylinder(0.3, 0.4, 22) violet emissive

ANIMATION:
  HexRing + CorePlasma rotation.y = time * 0.35
  emissive pulse sin(time*2.5)

TSL TARGET (WebGPU):
  fresnel = pow(1.0 - dot(N, V), 3.0)
  emissiveColor = baseEmissive * (1.0 + fresnel * 2.0) * (0.75 + 0.25*sin(time*3))

ACCEPTANCE TEST:
  [ ] Core is brightest object in frame (bloom bloom)
  [ ] Hex edges show rim glow not flat fill
  [ ] Background near black — energy is only light source

──────────────────────────────────────────────────────────────────────────────
D8. bioluminescent_trench
──────────────────────────────────────────────────────────────────────────────
HERO TECH: WebGPU fluid/particulate shader OR 80+ instanced motes + emissive flora

POST:
  bloom: 0.30, threshold: 0.76, radius: 0.22
  grade: { s: 1.18, c: 1.10, g: [0.88, 1.04, 1.12] }

SKY: abyss #020617 — ambient intensity 0.12 MAX
ATMOSPHERE: ue5-storm-fog color #083344 opacity 0.38 (underwater haze)

GEOMETRY:
  TrenchFloor: Plane 360×140 #020617 opacity 0.95
  AbyssParticulates: InstancedMesh ≥80 spheres scale 0.6–2.0 color #22d3ee
  SeaFan: 16× thin cylinders h=4–7 emissive flora colors #22c55e #06b6d4 #a855f7
  BioOrb: sphere 0.8 emi 0.85 on fan tips
  ThermalVent: 5× cone emissive cyan opacity 0.4

ANIMATION:
  particulates slow drift: position += sin(time*0.2 + i)*0.002 per instance
  BioOrb emissive pulse

ACCEPTANCE TEST:
  [ ] Scene readable with NO directional sun — only bioluminescence
  [ ] Particulates visibly drift in screen recording 10s
  [ ] No peach/golden sky — fail if warm horizon visible

──────────────────────────────────────────────────────────────────────────────
D9. victorian_grand_library
──────────────────────────────────────────────────────────────────────────────
HERO TECH: GPU dust instancing (200+) + book stack contact AO

POST:
  bloom: 0.18, threshold: 0.92, radius: 0.12
  grade: { s: 1.14, c: 1.08, g: [1.08, 1.02, 0.94] }
  gtao: blend 0.68, radius 0.28, samples 8

SKY: warm interior top #78350f murky, horizon #d6d3d1, fog #a8a29e

GEOMETRY:
  LibraryHall: Box(120, 28, 60) stone
  WalnutCeiling: Box(118, 2, 58) #78350f
  BookStacks: 8 shelves Box(10, 18, 2) + 5 tier book boxes #991b1b subtle emissive
  Columns: 6× Cylinder(0.8, 1, 24)
  Chandelier: stem + 6 bulb spheres emissive #fbbf24 emi 0.7
  LibraryDustMotes: InstancedMesh count ≥200, spread (100, 22, 50), color #fff3c4

ACCEPTANCE TEST:
  [ ] Dust motes visible as points near chandelier
  [ ] Book tiers cast dark line between shelves (AO or baked shadow)
  [ ] Warm chandelier-only mood — no harsh sun disc

──────────────────────────────────────────────────────────────────────────────
D10. low_orbit_stealth_carrier
──────────────────────────────────────────────────────────────────────────────
HERO TECH: HDRI environment + high metalness drone hulls

POST:
  bloom: 0.22, threshold: 0.88, radius: 0.16
  grade: { s: 1.08, c: 1.10, g: [0.94, 0.98, 1.06] }
  envIntensity: 1.15

SKY: top #020617, mid #0f172a, horizon #1e40af (Earth glow)
bindAerialEnvironment + scene.environmentIntensity = 1.15

GEOMETRY (position from curve t=0.55):
  CarrierDeck: Box(100, 0.8, 55) painted_steel metalness 0.78 roughness 0.22
  HangarBackWall: Box(90, 14, 3) scratch dark_steel metalness 0.85 roughness 0.18
  StealthDrone ×3: Cylinder(1.4, 1.8, 2.8) + wing Box(5, 0.25, 1.4)
  CommandIsland: Box(18, 6, 8)
  EarthLimb: Plane 400×120 opacity 0.85 at y+45
  PlanetCurve: large sphere segment for horizon glow

NORMAL DETAIL: optional scratch normal map on HangarBackWall — procedural noise if no texture

ACCEPTANCE TEST:
  [ ] Drone hull shows moving specular when camera orbits 30°
  [ ] Earth limb visible at bottom of frame
  [ ] envMapIntensity ≥0.95 on metal after enhanceAerialMaterials

═══════════════════════════════════════════════════════════════════════════════
E. WIRING CHECKLIST (MUST COMPLETE — NO DEAD CODE)
═══════════════════════════════════════════════════════════════════════════════

[ ] installPremiumFlyingEnvironment called from installFlyingVistaLayer when
    vista id is one of the 10 PREMIUM_ENVIRONMENT_IDS

[ ] applyUE5AerialRenderProfile(scene, contract) called in buildAerialWorld
    when flyingContract is set

[ ] installUE5AerialAtmosphere(..., vistaId) called with matching vista string

[ ] enhanceAerialMaterials(scene) called once after environment build

[ ] animatePremiumEnvironments + animateUE5AerialEffects in LiveLab rAF loop

[ ] clearFlyingArenaLayers removes:
    'ue5-aerial-atmosphere', premium root groups, old vista meshes

[ ] scene.userData.aerialUE5 = true after profile applied

[ ] CanalWaterSSR mesh name preserved for water material hook

═══════════════════════════════════════════════════════════════════════════════
F. METHOD SELECTION — DECISION TREE (MANDATORY COMMENT IN PR)
═══════════════════════════════════════════════════════════════════════════════

For each hero technique, log in code:
  // RENDER_PATH: webgpu|webgl | EFFECT: n8ao|gtao|ssr|clearcoat|tsl|compute|instancing

1. navigator.gpu && WebGPURenderer.init() succeeds?
   YES → use WebGPU for SSR, N8AO, TSL, compute debris
   NO  → use WebGL column in section D

2. Screenshot A/B WebGPU vs WebGL within 5% visual parity?
   YES → ship WebGL if faster
   NO  → ship WebGPU for that vista only

3. FPS <55 after upgrade?
   Reduce: GTAO samples, debris count, cloud layers, shadow map 2048→1024
   Never: remove emissive rings, remove numbered gate sprites, flatten to grey

═══════════════════════════════════════════════════════════════════════════════
G. SUGGESTED MISSION MAPPING (90 FLYING — ASSIGN PREMIUM VISTAS)
═══════════════════════════════════════════════════════════════════════════════

Rotate premium vistas across modes so kids see UE5 quality often:

| Flyer mode slot | Suggested premiumVista (override bible for showcase) |
|-----------------|------------------------------------------------------|
| Mode 1          | gothic_clockwork_spire OR venetian_midnight_canal    |
| Mode 3 storm    | obsidian_citadel                                     |
| Mode 5 orbit    | quantum_reactor_core                                 |
| Mode 8 tunnel   | cybernetic_assembly_line                             |
| Mode 10 capstone| neon_server_necropolis OR low_orbit_stealth_carrier  |

Implement via FlyingMissionSpecs field premiumVista: 'venetian_midnight_canal'
OR contract.mission.premiumVista in getFlyingArenaContract merge.

Default bible aerialVista still applies when premiumVista null.

═══════════════════════════════════════════════════════════════════════════════
H. DELIVERABLES (WHAT YOU HAND BACK)
═══════════════════════════════════════════════════════════════════════════════

1. Updated PremiumFlyingEnvironmentKit.js + AerialUERenderKit.js (min)
2. Optional AerialWebGPUKit.js if WebGPU path added
3. Wiring in FlyingArenaKit.js + AerialWorldKit.js + LiveLabPage.jsx
4. Table: vista id → render path chosen → fps measured
5. 10 screenshots (one per vista) at 1920×1080 from chase camera t=0.2

SUCCESS: Independent viewer says all 10 look like "AAA web game / UE5 quality"
without knowing which used WebGPU vs WebGL.

END ULTRA-SPEC PROMPT.
```

---

# FILE LINK (OPEN & COPY)

**Path:**
```
/Users/michelle/Downloads/bytebuddies1-claude-intelligent-fermat-82adf8/Users/mishk/Downloads/bytebuddies1-claude-bold-dewdney-73f401 (1)/bytebuddies1-claude-bold-dewdney-73f401/docs/composer-2.5-ue5-environments-ULTRA-SPEC-PROMPT.md
```

**Related prompts:**
| Document | Purpose |
|----------|---------|
| `composer-2.5-ue5-premium-environments-prompt.md` | Shorter UE5 overview |
| `bytebuddies-flying-arena-QUALITY-PROMPT.md` | Ring/HUD gameplay quality |
| `bytebuddies-flying-arena-FULL-PROMPT.md` | 90 mission specs |

---

*Ultra-spec for Composer 2.5 · exact ids, numbers, hooks, acceptance tests*
