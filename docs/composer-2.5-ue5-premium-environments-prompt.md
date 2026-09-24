# COMPOSER 2.5 — UE5-GRADE PREMIUM FLYING ENVIRONMENTS
## Build 10 browser environments that rival Unreal Engine 5 · Three.js WebGPU (2026 standard)

> **Audience:** Composer 2.5 (or any high-capability coding agent)  
> **Goal:** Upgrade 10 flying vistas from procedural stubs to **cinematic, UE5-comparable** quality in the browser  
> **Existing code:** `PremiumFlyingEnvironmentKit.js`, `AerialUERenderKit.js`, `FlyingArenaMaterialKit.js`  
> **Companion:** `docs/bytebuddies-flying-arena-QUALITY-PROMPT.md` (gameplay/HUD quality bar)

---

# COPY-PASTE PROMPT FOR COMPOSER 2.5

```
═══════════════════════════════════════════════════════════════════════════════
COMPOSER 2.5 — BYTEBUDDIES UE5 PREMIUM ENVIRONMENT BUILD
═══════════════════════════════════════════════════════════════════════════════

You are Composer 2.5 building 10 premium flying environments for ByteBuddies.
Target: browser-based visual fidelity that RIVALS Unreal Engine 5 — not "good
for WebGL" but genuinely cinematic, physically plausible, and readable at
flight speed on a 2026 laptop.

YOU MUST USE WHICHEVER METHOD PRODUCES THE BEST RESULT for each effect:
  • Three.js WebGPU renderer (preferred when available in r16x+)
  • Three.js Shading Language (TSL) node materials
  • WebGPU compute shaders for massive instancing / particles
  • WebGL2 fallbacks with MeshPhysicalMaterial + post stack when WebGPU unavailable
  • Existing repo kits (PremiumFlyingEnvironmentKit, AerialUERenderKit)
  • Procedural geometry + PBR when no asset exists
  • GLTF/HDRI from public/assets when bundled and higher fidelity

Do NOT blindly implement every technique in WebGPU if a polished WebGL fallback
already exists in the repo and looks identical in screenshots. Ship the best
visual outcome, document which path you used.

═══════════════════════════════════════════════════════════════════════════════
SECTION 0 — RENDERING STACK (UE5 IN THE BROWSER)
═══════════════════════════════════════════════════════════════════════════════

0.1 RENDERER SELECTION (pick best per session)
──────────────────────────────────────────────
PRIMARY (2026 target):
  import WebGPURenderer from 'three/webgpu'
  const renderer = new WebGPURenderer({ antialias: true })
  await renderer.init()
  Enable when: navigator.gpu available AND Three.js version supports it.

FALLBACK (current LiveLab stack):
  WebGLRenderer + ACESFilmicToneMapping + toneMappingExposure 1.0–1.15
  PCFSoftShadowMap, shadowMap.enabled = true
  Use when: WebGPU init fails or feature not yet wired in LiveLabPage.jsx

RULE: Abstract behind createPremiumRenderer(scene) that tries WebGPU first,
falls back to WebGL, sets scene.userData.renderBackend = 'webgpu'|'webgl'.

0.2 GLOBAL PBR PIPELINE (all 10 environments)
───────────────────────────────────────────────
• Physically Based Rendering on ALL hero surfaces:
  MeshPhysicalMaterial or flyingMat/pbrMat presets with:
    - map (albedo) when 4K textures available
    - normalMap (tangent-space, strength 0.8–1.2)
    - roughnessMap OR uniform roughness 0.08–0.92
    - metalnessMap OR uniform metalness 0.0–0.9
    - aoMap OR post-pass AO (N8AO/GTAO)
• ACES Filmic tone mapping on renderer (already in LiveLabPage.jsx)
• IBL: scene.environment = HDRI or canvas equirect from bindAerialEnvironment()
• scene.environmentIntensity: 0.72–1.15 per vista (see AerialUERenderKit profiles)

0.3 POST-PROCESSING LAYER (per-environment profiles)
────────────────────────────────────────────────────
Read/write via scene.userData.raceVisual (LiveLab composer reads this):

| Effect            | WebGPU path              | WebGL fallback (repo)        |
|-------------------|--------------------------|------------------------------|
| Ambient occlusion | N8AO pass                | GTAO (AerialUERenderKit)     |
| Bloom             | selective threshold bloom| raceVisual.bloom 0.18–0.42   |
| SSR water         | WebGPU SSR node          | clearcoat + env reflection   |
| Volumetric fog    | TSL fog volume / god-rays| buildVolumetricCloudLayer    |
| Color grade       | ACES + grade matrix      | raceVisual.grade {s,c,g}     |
| Depth of field    | bokeh pass (optional)    | fog density cheat            |

Apply per vista: applyUE5AerialRenderProfile(scene, contract) in AerialUERenderKit.js
Extend PREMIUM_RENDER_PROFILES — do not hardcode one global bloom.

0.4 PERFORMANCE BUDGET
──────────────────────
• Target: 60fps @ 1080p on M1 / Ryzen integrated GPU
• Instancing for: debris, dust, books, stars, particulates (≥100 instances)
• Compute for: assembly line debris physics ONLY when WebGPU + budget allows
• LOD: vista meshes >80m from path can drop to simplified silhouettes
• Texture: 4K only on hero surfaces within 60m; 1K elsewhere

0.5 INTEGRATION POINT
─────────────────────
Wire into flying pipeline:
  installFlyingVistaLayer → installPremiumFlyingEnvironment(vista, ...)
  animatePremiumEnvironments(scene, time) in render loop
  applyUE5AerialRenderProfile after contract resolves

Map 9 flyers + premium modes to PREMIUM_ENVIRONMENT_IDS (rotate or assign per mission).

═══════════════════════════════════════════════════════════════════════════════
SECTION 1 — THE 10 ENVIRONMENTS (BUILD SPEC + BEST METHOD)
═══════════════════════════════════════════════════════════════════════════════

For EACH environment below:
  1. Upgrade build* function in PremiumFlyingEnvironmentKit.js
  2. Tune PREMIUM_RENDER_PROFILES in AerialUERenderKit.js
  3. Add WebGPU-specific path ONLY if visibly better than WebGL fallback
  4. Screenshot QA against UE5 reference mood boards

──────────────────────────────────────────────────────────────────────────────
1. GOTHIC CLOCKWORK SPIRE
   id: gothic_clockwork_spire
──────────────────────────────────────────────────────────────────────────────
CONCEPT: Towering wrought-iron cathedral of interlocking mechanical gears,
buttresses, and brass clock rings — dark fantasy industrial.

HERO TECHNIQUE: Horizon-Based Ambient Occlusion (N8AO)
  • Deepens contact shadows where gear teeth meet housings, under buttresses,
    inside spire lattice — this is THE selling point of this vista.
  BEST METHOD:
    WebGPU: N8AO post-pass (three/examples/jsm/postprocessing or TSL AO node)
    WebGL:  GTAO via scene.userData.raceVisual.gtao (already in AerialUERenderKit)
            blendIntensity 0.72, radius 0.32, samples 8
  ALSO: clearcoatBoost on brass gears (metalness 0.72, clearcoat 0.4)

GEOMETRY (enlarge existing buildGothicClockworkSpire):
  • Central spire cylinder r=9–12, h=48m + brass cone cap 18m
  • 14+ interlocking gears (r=3–7m) with explicit teeth meshes
  • 6 flying buttresses, gargoyle ledges
  • Clock torus ring at mid-spire (animated spin via userData.spinGear)
  • Materials: dark_steel + brass emissive rim 0.12

LIGHTING: Single warm key from horizon (golden hour), cool fill from sky top.
  No flat ambient — AO must carry depth.

SKY: #1e293b top → #64748b mid → #fbbf24 horizon (overcast golden industrial)

QA: Screenshot gear tooth crevices — must read black/contact shadow, not grey mud.

──────────────────────────────────────────────────────────────────────────────
2. VENETIAN MIDNIGHT CANAL
   id: venetian_midnight_canal
──────────────────────────────────────────────────────────────────────────────
CONCEPT: Italian nocturnal course — dark rippling water mirrors gothic palazzi
and moonlight.

HERO TECHNIQUE: Screen Space Reflections (SSR)
  • Water must reflect building window lights and moon disc accurately.
  BEST METHOD:
    WebGPU: SSR node on water material (TSL reflectivity + roughness 0.02)
    WebGL:  MeshPhysicalMaterial on CanalWaterSSR mesh:
            clearcoat=1, clearcoatRoughness=0.04, metalness=0.85,
            roughness=0.02, envMapIntensity=1.05
            + bindAerialEnvironment() for reflection probe
    Optional: Reflector plane (three/examples/jsm/objects/Reflector) if SSR too heavy

GEOMETRY:
  • Water plane 340×140m, 32×12 segments (vertex ripple animation in shader)
  • 10 palazzo blocks h=14–26m, warm window glow strips (#fbbf24 emissive 0.35)
  • 4 stone bridges + lamp posts
  • Moon disc sphere r=3 at y+38

LIGHTING: Night — low ambient, warm windows only, cool moon fill.
  bloom 0.22, threshold 0.88 (subtle — not neon)

SKY: #0c1929 top → #1e3a5f mid → #334155 horizon, fog #0f172a

QA: Window lights visible in water reflection at 45° camera angle.

──────────────────────────────────────────────────────────────────────────────
3. ABANDONED CYBERNETIC ASSEMBLY LINE
   id: cybernetic_assembly_line
──────────────────────────────────────────────────────────────────────────────
CONCEPT: Sprawling decayed factory — conveyors, robot arms, thousands of
dynamic debris pieces and sparks without framerate collapse.

HERO TECHNIQUE: WebGPU compute passes for instanced bodies
  • Falling debris, spark particles, optional conveyor physics — all GPU.
  BEST METHOD:
    WebGPU: Compute shader updates InstancedMesh matrix buffer each frame
            (collision simple: floor plane + random bounce)
    WebGL:  Static InstancedMesh 120+ debris (existing) + CPU spark positions
            Upgrade to 500–2000 instances with THREE.InstancedMesh (no physics)
    Hybrid: GPU particles for sparks (Points + custom velocity attribute),
            instanced debris static until WebGPU path lands

GEOMETRY:
  • Factory floor 360×120m asphalt
  • 3 lanes × 5 conveyor segments, robot arm meshes
  • Instanced debris: BoxGeometry varied scale/rotation
  • 24+ emissive spark spheres (or GPU point cloud 500+)

LIGHTING: Industrial — overhead cool white + orange spark accents.
  gtao blend 0.58, bloom 0.26 on sparks only (threshold 0.82)

QA: 60fps with ≥500 visible debris pieces OR documented WebGPU compute path.

──────────────────────────────────────────────────────────────────────────────
4. NEON SERVER NECROPOLIS
   id: neon_server_necropolis
──────────────────────────────────────────────────────────────────────────────
CONCEPT: Cybersecurity labyrinth — rows of server racks, vertical data streams,
data pylons — glowing emerald/cyan/violet against deep slate void.

HERO TECHNIQUE: ACES Filmic tone mapping + selective bloom
  • Data streams must POP against #0f172a background without blowing out.
  BEST METHOD:
    renderer.toneMapping = ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0–1.08 (lower than golden vistas)
    raceVisual: bloom 0.38, threshold 0.72, radius 0.28
    Emissive rack LEDs: emissiveIntensity 0.85, animate pulse per-row
    Grade: { s: 1.28, c: 1.14, g: [0.88, 1.02, 1.1] } — teal push

GEOMETRY:
  • 6×4 server rack grid, h=10–14m
  • Per-rack vertical data stream strips (thin emissive boxes)
  • 8 data pylons + torus rings (spin animation)
  • Floor plane dark slate

LIGHTING: NO global warm key — self-lit scene. Ambient 0.05–0.1.

SKY: near-black #020617, minimal fog

QA: Data streams readable at distance; bloom halo tight, not mushy.

──────────────────────────────────────────────────────────────────────────────
5. OVERGROWN MONASTIC RUINS
   id: monastic_ruins
──────────────────────────────────────────────────────────────────────────────
CONCEPT: Ancient stone cathedral reclaimed by moss and ivy — bevelled masonry,
weathered columns, collapsed walls.

HERO TECHNIQUE: 4K PBR texture maps (Albedo, Normal, Roughness)
  • Moss vs stone must read as different materials under same lighting.
  BEST METHOD:
    WebGPU/WebGL: MeshStandardMaterial or Physical with:
      stone: map + normalMap + roughnessMap (4K if in public/assets)
      moss:  separate material, high roughness 0.92, green albedo #4a7c59
    Fallback: vertex color + normal perturbation via bump if no textures
    GTAO blend 0.65 for column contact shadows

GEOMETRY:
  • Cathedral nave 80×22×40m + moss roof cap
  • 5 columns + ivy boxes
  • Bell tower + moss cone cap
  • 6 ruin wall segments with moss tops

LIGHTING: Overcast soft — diffuse key, warm bounce from stone.
  bloom 0.20, high threshold 0.90

SKY: #94a3b8 overcast → #cbd5e1 horizon

QA: Moss normal detail visible at 10m; stone edges catch light on bevels.

──────────────────────────────────────────────────────────────────────────────
6. STORM-SWEPT OBSIDIAN CITADEL
   id: obsidian_citadel
──────────────────────────────────────────────────────────────────────────────
CONCEPT: Sleek dark-fantasy fortress — wet obsidian towers, heavy storm fog,
precision flight corridors.

HERO TECHNIQUE: Wet-surface clearcoat + volumetric fog
  • Towers look rain-slick; fog creates cinematic depth for manoeuvres.
  BEST METHOD:
    WebGPU: TSL clearcoat + sheen on obsidian MeshPhysicalMaterial
    WebGL:  clearcoat=0.95, clearcoatRoughness=0.06, metalness 0.55
            wetSurfaces: true in render profile
    Fog: buildVolumetricCloudLayer + StormFogLayer plane (opacity 0.35)
         + scene.fog exponential, color #1e1b4b, far 200
    Optional: rain particles via installAerialDifficulty

GEOMETRY:
  • 5 stepped obsidian towers (14→6m width, 16–36m height)
  • Citadel wall 90×50m
  • Storm fog layer plane at y+35

LIGHTING: Single lightning flash pulse (emissive spike every 8–12s optional)

QA: Tower surfaces show specular highlight streak; fog occludes distant towers.

──────────────────────────────────────────────────────────────────────────────
7. QUANTUM REACTOR CORE
   id: quantum_reactor_core
──────────────────────────────────────────────────────────────────────────────
CONCEPT: High-contrast futuristic interior — hexagonal energy fields, plasma
core, rotating reactor rings.

HERO TECHNIQUE: Three.js Shading Language (TSL) for energy fields
  • Hex cells and plasma core need animated fresnel + pulse, not flat emissive.
  BEST METHOD:
    WebGPU: TSL node material on hex meshes — sin(time) emissive, fresnel rim
    WebGL:  High emissive MeshPhysicalMaterial (emi 0.85–1.2) + bloom 0.42
            threshold 0.68 — acceptable fallback
    Animate: HexRing rotation, CorePlasma scale pulse

GEOMETRY:
  • Reactor base cylinder r=16–18
  • 4 torus hex rings at increasing height
  • 12 hexagonal cells in ring
  • Central plasma sphere r=5 transparent emissive
  • 8 reactor pylons

LIGHTING: Self-lit — minimal ambient. Bloom carries the scene.

QA: Hex field edges have fresnel glow; core reads as volumetric light source.

──────────────────────────────────────────────────────────────────────────────
8. BIOLUMINESCENT DEEP TRENCH
   id: bioluminescent_trench
──────────────────────────────────────────────────────────────────────────────
CONCEPT: Underwater abyss — thick currents, floating particulates, deep-sea
flora as only light source.

HERO TECHNIQUE: Custom WebGPU fluid / particulate shaders
  • Slow-moving current distortion + suspended particles in dark water.
  BEST METHOD:
    WebGPU: TSL noise displacement on trench floor + particle advection compute
    WebGL:  instancedSpheres 80+ particulates (existing)
            + sea fan cylinders + bio orbs (emissive pulse)
            + dark blue fog, low ambient
    Caustic fake: animated light dapple on trench floor (optional projector)

GEOMETRY:
  • Abyss floor plane 360×140 #020617
  • 16 sea fans + bio orbs (3 flora colors)
  • 5 thermal vents (transparent cones)

LIGHTING: ZERO sun — only bioluminescence (#22c55e, #06b6d4, #a855f7)

QA: Scene readable from flora glow alone; particulates drift slowly (animate).

──────────────────────────────────────────────────────────────────────────────
9. VICTORIAN GRAND LIBRARY
   id: victorian_grand_library
──────────────────────────────────────────────────────────────────────────────
CONCEPT: Massive dim archival hall — thousands of books, chandelier, dust
motes in light shafts.

HERO TECHNIQUE: GPU instancing for dust motes + contact shadows on books
  • 200+ dust particles + dense book geometry with AO in shelf crevices.
  BEST METHOD:
    WebGPU: InstancedMesh dust + N8AO on book stacks
    WebGL:  instancedSpheres 200 LibraryDustMotes (existing)
            + 8 book stacks × 5 tiers
            GTAO blend 0.68, radius 0.28

GEOMETRY:
  • Hall 120×28×60m walnut ceiling
  • 8 book stacks, 6 columns
  • Chandelier stem + 6 bulbs
  • Dust instancing across hall volume

LIGHTING: Warm chandelier key, cool shadow fill. bloom 0.18, threshold 0.92

QA: Dust motes visible in light cone; book spine rows cast contact shadow.

──────────────────────────────────────────────────────────────────────────────
10. LOW-ORBIT STEALTH CARRIER
    id: low_orbit_stealth_carrier
──────────────────────────────────────────────────────────────────────────────
CONCEPT: High-tech hangar in space — metallic drone surfaces, Earth limb,
microscopic scratch detail on hull.

HERO TECHNIQUE: HDRI environment maps for metallic sheen
  • Drones and deck must show realistic specular with micro-scratch variation.
  BEST METHOD:
    WebGPU/WebGL: RGBE HDR from public/assets OR bindAerialEnvironment()
                  envIntensity 1.15 (highest in profiles)
    Materials: painted_steel metalness 0.78, roughness 0.22
               scratch normal map on hangar walls (procedural or texture)
    Optional: PMREMGenerator from HDR for scene.environment

GEOMETRY:
  • Carrier deck 100×55m
  • Hangar back wall + rivet details
  • 3 stealth drone pedestals on deck
  • Command island
  • Earth limb plane + planet curve sphere (space backdrop)

LIGHTING: Hard rim from Earth glow, dark space ambient

QA: Drone hull shows moving specular highlight as camera orbits; stars visible.

═══════════════════════════════════════════════════════════════════════════════
SECTION 2 — METHOD DECISION MATRIX (COMPOSER 2.5 AUTONOMY)
═══════════════════════════════════════════════════════════════════════════════

When implementing ANY effect, run this decision tree:

1. Does repo already implement it acceptably?
   YES → Tune parameters, enlarge geometry, upgrade textures. STOP.
   NO  → Continue.

2. Is WebGPU available in target Three.js version + LiveLab renderer?
   YES → Implement WebGPU/TSL/compute path in new file:
         AerialWebGPUKit.js (create if needed)
   NO  → Implement WebGL fallback documented in AerialUERenderKit.

3. Will effect cost >2ms GPU on integrated graphics?
   YES → Reduce samples, use cheaper approximation (GTAO vs N8AO, env vs SSR)
   NO  → Ship full quality.

4. Is GLTF/HDRI in public/assets?
   YES → Use it for hero meshes/textures
   NO  → Procedural geometry + pbrMat presets from FlyingArenaMaterialKit

5. Does flying gameplay need 60fps?
   YES → Never block main thread with sync texture gen; async load HDRIs

DOCUMENT in code comments which path you chose and why.

═══════════════════════════════════════════════════════════════════════════════
SECTION 3 — FILE PLAN (WHERE TO WORK)
═══════════════════════════════════════════════════════════════════════════════

EXTEND (primary):
  src/virtual-robot-designer/studio/aerial-world/PremiumFlyingEnvironmentKit.js
    → Upgrade all 10 build* functions
    → installPremiumFlyingEnvironment switch
    → animatePremiumEnvironments

  src/virtual-robot-designer/studio/aerial-world/AerialUERenderKit.js
    → PREMIUM_RENDER_PROFILES per vista
    → applyUE5AerialRenderProfile
    → bindAerialEnvironment (HDRI)

  src/virtual-robot-designer/studio/aerial-world/FlyingArenaMaterialKit.js
    → PBR presets, normal maps, clearcoat helpers

CREATE (if WebGPU path needed):
  src/virtual-robot-designer/studio/aerial-world/AerialWebGPUKit.js
    → createPremiumRenderer()
    → N8AO pass, SSR water node, compute debris
    → TSL hex energy shader

WIRE:
  src/virtual-robot-designer/studio/aerial-world/FlyingArenaKit.js
    → installFlyingVistaLayer calls installPremiumFlyingEnvironment
  src/virtual-robot-designer/studio/LiveLabPage.jsx
    → render loop calls animatePremiumEnvironments
    → WebGPU renderer init with WebGL fallback

═══════════════════════════════════════════════════════════════════════════════
SECTION 4 — COMPOSER 2.5 WORKFLOW (DO IN ORDER)
═══════════════════════════════════════════════════════════════════════════════

PHASE 1 — Audit
  • Read PremiumFlyingEnvironmentKit.js + AerialUERenderKit.js
  • Screenshot all 10 vistas in browser at default camera
  • List gap vs UE5 reference for each

PHASE 2 — Renderer foundation
  • createPremiumRenderer with WebGPU try / WebGL fallback
  • Ensure ACESFilmic + environment IBL on all vistas

PHASE 3 — Per-environment upgrade (one at a time, 1→10)
  For each environment:
    a) Enlarge geometry to flight-readable scale
    b) Apply hero technique (N8AO, SSR, compute, TSL, etc.)
    c) Tune PREMIUM_RENDER_PROFILES
    d) Screenshot before/after
    e) Verify 60fps

PHASE 4 — Animation pass
  • animatePremiumEnvironments: gears, data streams, hex rings, dust, bio orbs

PHASE 5 — Integration
  • Map premium vistas to flying missions / robots
  • clearFlyingArenaLayers includes premium groups

PHASE 6 — QA matrix
  • 10 screenshots at golden hour + 10 at night/storm where applicable
  • Side-by-side with reference mood

═══════════════════════════════════════════════════════════════════════════════
SECTION 5 — SUCCESS CRITERIA
═══════════════════════════════════════════════════════════════════════════════

DONE when a neutral viewer says:
  "This looks like a UE5 environment streamed to the browser"
  for ALL 10 vistas — not just Neon Server or Quantum Reactor.

Technical checklist:
  □ WebGPU path attempted; WebGL fallback documented
  □ N8AO or GTAO visible on Gothic + Library + Monastic
  □ SSR or clearcoat reflections on Venetian canal
  □ 500+ instanced elements on Assembly Line without stutter (or compute path)
  □ Selective bloom on Neon Necropolis data streams
  □ 4K normal/roughness on Monastic stone (or convincing procedural)
  □ Clearcoat wet towers on Obsidian Citadel + volumetric fog
  □ TSL or high-bloom hex fields on Quantum Reactor
  □ Fluid/particulate motion on Bioluminescent Trench
  □ 200+ dust motes on Victorian Library
  □ HDRI metallic sheen on Low-Orbit Carrier drones
  □ 60fps on integrated GPU at 1080p
  □ animatePremiumEnvironments wired in render loop

Use the BEST method per effect. Quality of the final frame is the only metric.

ENVIRONMENT IDS (exact strings):
  gothic_clockwork_spire
  venetian_midnight_canal
  cybernetic_assembly_line
  neon_server_necropolis
  monastic_ruins
  obsidian_citadel
  quantum_reactor_core
  bioluminescent_trench
  victorian_grand_library
  low_orbit_stealth_carrier
```

---

# APPENDIX — ENVIRONMENT → HERO TECHNIQUE QUICK MAP

| # | Environment | ID | Hero technique | WebGL fallback in repo |
|---|-------------|-----|----------------|------------------------|
| 1 | Gothic Clockwork Spire | `gothic_clockwork_spire` | N8AO | GTAO 0.72 blend |
| 2 | Venetian Midnight Canal | `venetian_midnight_canal` | SSR | clearcoat water + env |
| 3 | Cybernetic Assembly Line | `cybernetic_assembly_line` | WebGPU compute | InstancedMesh 120+ |
| 4 | Neon Server Necropolis | `neon_server_necropolis` | ACES + selective bloom | bloom 0.38 thr 0.72 |
| 5 | Overgrown Monastic Ruins | `monastic_ruins` | 4K PBR maps | moss/stone pbrMat |
| 6 | Storm-Swept Obsidian Citadel | `obsidian_citadel` | clearcoat + vol fog | wetSurfaces profile |
| 7 | Quantum Reactor Core | `quantum_reactor_core` | TSL energy fields | emissive + bloom 0.42 |
| 8 | Bioluminescent Deep Trench | `bioluminescent_trench` | WebGPU fluid shader | instanced particulates |
| 9 | Victorian Grand Library | `victorian_grand_library` | GPU dust instancing | 200 dust motes |
| 10 | Low-Orbit Stealth Carrier | `low_orbit_stealth_carrier` | HDRI metallic | envIntensity 1.15 |

---

# APPENDIX — EXISTING CODE ENTRY POINTS

```javascript
// Build environment geometry
import { installPremiumFlyingEnvironment, animatePremiumEnvironments } from './PremiumFlyingEnvironmentKit.js';

// Apply post profile
import { applyUE5AerialRenderProfile, bindAerialEnvironment } from './AerialUERenderKit.js';

// In vista install:
installPremiumFlyingEnvironment(group, vistaId, backdrop, floorY, bounds, curve);

// In render loop:
animatePremiumEnvironments(scene, elapsedTime);

// After contract resolve:
applyUE5AerialRenderProfile(scene, flyingContract);
bindAerialEnvironment(scene, recipe.sky);
```

---

*Composer 2.5 · ByteBuddies UE5 premium environments · Three.js WebGPU 2026 · use best method per layer*
