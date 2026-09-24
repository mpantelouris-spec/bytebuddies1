# BYTEBUDDIES — ARENA VISUAL BIBLE v2
## Mission-first · 32 Robots × 10 Modes + 10 Custom Sandbox Missions

> **This replaces the old visual bible Part 3 template text.**
> **Source:** `game-mode-specifications.js` + `chassis-mode-catalog.js` + Part 0–2 art direction.
> **Excluded:** rover, scout, footballbot
> **Scope:** 320 named-robot arena missions + 10 Custom sandbox missions = 330 total.

---

# PART 0 — MASTER ART DIRECTION

**Audience:** Primary school children ages 6–11 on iPad/tablet landscape.
**Style:** Bright, chunky, readable 3D — NOT grey realism. Think LEGO meets Pixar meets educational game.
**Never use:** Kart rainbow tracks (rover/scout only), football pitches, flat grey void floors, ant-sized characters on huge empty planes.
**Always include:** Clear sky/ceiling, readable ground material, 2–3 hero props, emissive goal markers, soft shadows, particle feedback on success/collision.
**HUD (all modes):** Top bar mission name + timer; bottom-left optional minimap; star tier targets on pause screen; big friendly fonts.
**Camera:** Match robot family (see each section). Never static top-down unless parking puzzle mode.
**Lighting:** Key light + colored fill per environment family. Emissive interactables glow so kids see what to touch.

---

# PART 1 — ENVIRONMENT FAMILY VISUAL BIBLES

Each family shares skybox, ground shader, fog colour, and prop kit. Individual modes swap hero set dressing.

## 1A. MARTIAN / RED PLANET (`martian`) — Crawler, Space Rover
- **Sky:** Dusty salmon-pink horizon, twin moons, thin atmosphere haze, distant rust mesas.
- **Ground:** Red iron-oxide regolith, rocky scatter, tire/tread marks, subtle sparkle minerals.
- **Palette:** `#c1440e` rust, `#8b4513` rock, `#f4a460` sand highlights, `#1a1a2e` shadow.
- **Fog:** Warm orange distance fade at 80m.
- **Props kit:** NASA-style flags, solar panels, comm dishes, sample crates, rover charging pads, warning beacons.
- **Particles:** Dust puffs on movement, spark hits on rock contact.
- **Camera:** `rover_wide` — 8m behind, 4m up, slight dutch on steep slopes.

## 1B. INDUSTRIAL / FACTORY (`industrial`) — Farm, Security, Mining, Factory, Robot Arm, LEGO Bot, Droid
- **Sky:** Indoor arena OR smoggy city dusk visible through high windows.
- **Ground:** Yellow safety lines on dark concrete `#374151`, oil stains, grated drains.
- **Palette:** Safety yellow `#fbbf24`, steel `#64748b`, hazard orange `#f97316`, conveyor blue `#3b82f6`.
- **Lighting:** Overhead fluorescent strips + warm spot pools on work zones.
- **Props kit:** Conveyors, pallets, cardboard boxes, robotic arms (background), warning signs, barcode scanners, LED stack lights (green/red).
- **Particles:** Sparks on metal, steam puffs, cardboard dust on impacts.
- **Camera:** `factory_overview` — 10m back elevated 30°, or close for robot arm modes.

## 1C. UNDERWATER (`underwater`) — Sub Drone, Deep Sea Bot
- **Sky:** Deep blue gradient to black abyss; god-rays from surface caustics dancing on floor.
- **Ground:** Sandy seabed, coral, kelp strands, rock outcrops.
- **Palette:** Teal `#0d9488`, bioluminescent cyan `#22d3ee`, coral pink `#f472b6`, dark navy `#0c4a6e`.
- **Fog:** Underwater murk — visibility 25m, silhouettes beyond.
- **Props kit:** Shipwreck ribs, treasure chests, bubble columns, jellyfish (ambient), pipeline tubes, research buoys.
- **Particles:** Rising bubbles from bot thrusters, silt clouds when bot touches floor.
- **Camera:** `underwater_follow` — slightly below and behind, slow bob on bot.

## 1D. EMERGENCY / RESCUE (`emergency`) — Fire Bot, Med Bot, Rescue Drone
- **Sky:** Smoke-filled urban sky (orange-grey) OR clean hospital interior ceiling OR blizzard whiteout.
- **Ground:** Wet asphalt with reflective puddles, OR hospital linoleum, OR snow-packed street.
- **Palette:** Emergency red `#dc2626`, ambulance white, fire orange `#ea580c`, hospital cyan `#06b6d4`.
- **Lighting:** Flashing red/blue emergency lights (rotating), fire glow as key light in blaze modes.
- **Props kit:** Fire trucks, hydrants, burning debris, hospital beds, gurneys, IV stands, hazard tape, flood barriers.
- **Particles:** Smoke columns, embers, water spray, snow flakes, heart-monitor HUD overlay in med modes.
- **Camera:** `chase_close` — urgent handheld feel, slight shake on impacts.

## 1E. SKY AERIAL (`sky_aerial`) — Drone, Helicopter, Jet, Stealth Jet, Aero Stunt, Hover Bot
- **Sky:** Dramatic clouds — golden hour OR storm purple OR starfield at high altitude.
- **Ground:** Far below — canyons, city rooftops, ocean, cloud tops (no hard floor in flight modes — invisible kill plane at -50m).
- **Palette:** Sky blue `#38bdf8`, cloud white, sunset gold `#fbbf24`, warning red on ring gates.
- **Props kit:** Floating ring gates (neon torus), pylon flags, rooftop helipads (H marking), aircraft carrier deck, cloud platforms.
- **Particles:** Contrails, rotor wash dust (when low), ring pass sparkles.
- **Camera:** `aerial_chase` — behind and above, banks with turns, FOV widens above 80% speed.

## 1F. HYBRID SKY RACE (`hybrid_race_sky`) — Racing Drone, Hover Racer
- Same as sky_aerial but denser gate courses, neon speed strips, warp tunnels (purple mesh tubes), more motion blur.
- **Extra props:** Speed boost pads (glowing cyan), ghost replay translucent drone, elimination zone red barriers.

## 1G. CYBER NINJA / STEALTH (`cyber_ninja`) — Stealth Bot, Ninja (infiltration modes)
- **Sky:** Night city — neon skyline silhouettes, moon, rain optional.
- **Ground:** Rooftop tar, museum marble, laser-grid floor tiles.
- **Palette:** Neon pink `#ec4899`, cyber blue `#06b6d4`, shadow black `#0f172a`, laser red `#ef4444`.
- **Lighting:** Rim neon on edges, laser beams as emissive lines, guard spotlights (cones).
- **Props kit:** Laser grids, security cameras, guard NPC silhouettes, hack terminals (glowing screens), smoke vents.
- **Particles:** Rain ripples, cloak shimmer when hidden, spark on laser touch.
- **Camera:** `stealth_follow` — low angle, tight, cinematic.

## 1H. SPIDER CLIMBER (`spider_climber`) — Spider Bot
- **Sky:** Cave ceiling OR building shaft OR jungle canopy gap.
- **Ground/Walls:** Vertical surfaces dominate — brick, pipe, vine-covered stone, web strands.
- **Palette:** Moss green, rust pipe brown, web silver-white emissive.
- **Props kit:** Pipes, girders, web nets, ceiling hooks, glowing fungus, collapsed concrete slabs.
- **Camera:** `climber_follow` — tracks wall-climb, can rotate 90° to show ceiling walk.

## 1I. BOXING MECH / COMBAT (`boxing_mech`) — Striker, Battlebot, Blaster, Ninja (duel), Berserker, Tank duels, Mech duels
- **Arena core:** Elevated 3D ring platform floating above void OR stadium bowl.
- **Ring floor:** Canvas `#e5e7eb` or themed (see ring skins below).
- **Ropes:** Three levels of thick coloured ropes, corner posts padded.
- **Lighting:** Stadium spotlights from four corners, rim light on fighters so they pop.
- **HUD:** Health bars top, combo counter, round timer.
- **Particles:** Hit sparks, block shields, spell elements (blaster), rage aura (berserker).

### Combat Ring Skins (rotate across 10 modes per fighter):
1. **Classic Colosseum** — stone walls, sand floor, torch braziers.
2. **Neon Cyber Ring** — black floor, pink/blue neon ropes, hologram crowd.
3. **Rooftop Night** — city skyline backdrop, wind, helicopter searchlight.
4. **Lava Pit** — obsidian ring, orange glow cracks below, heat shimmer.
5. **Ice Arena** — pale blue floor, frost breath particles, aurora sky.
6. **Warehouse Brawl** — wooden crates around ring, industrial lamps.
7. **Space Station Ring** — metal grating, Earth visible through dome window.
8. **Jungle Pit** — vine-wrapped posts, tribal drums ambient, fireflies.
9. **Championship Gold** — gold trim ropes, massive Jumbotron, confetti cannons.
10. **Boss Throne Room** — dark arena, single spotlight, oversized boss silhouette.

## 1J. FLAPPY (`flappy`) — Birdbot / Sling-B
- **Style:** Side-scrolling 2.5D — colourful cartoon sky, parallax hills/clouds.
- **Birdbot model:** Round red bird body, yellow beak, cartoony eyes, optional slingshot band on launcher modes.
- **Props:** Green pipe pairs (Mario-style but original shape), slingshot cradle, brick fortresses, balloons, nest target rings.
- **Palette:** Bright primary colours — sky `#87ceeb`, pipe `#22c55e`, bird `#ef4444`.
- **Camera:** Fixed side scroll, bird centered left-third of screen.

## 1K. SANDBOX (`custom`) — Custom Robot
- **Style:** Clean white/grey test lab with coloured zone tiles — looks like a school robotics mat.
- **Props:** Modular walls, checkpoint flags, coloured targets, line-follow tape paths.

---

# PART 2 — ROBOT MODEL VISUAL IDENTITY (HOW EACH ROBOT LOOKS IN 3D)

| ID | Name | Body Look | Colour | Scale | Signature Detail |
|----|------|-----------|--------|-------|------------------|
| crawler | Crawler | Low wide 6-wheel rover | Green `#00C851` | 1.4× | Chunky treads, roll cage |
| tank | Tank | Boxy tracked hull, turret | Dark grey `#2C3E50` | 1.6× | Cannon barrel, armour plates |
| stealth | Stealth | Sleek angular rover | Black + cyan trim | 1.3× | Cloak shimmer panels |
| miningbot | Mining Bot | Heavy drill front | Brown/gold `#78350f` | 1.7× | Spinning drill head, ore hopper |
| securitybot | Security Bot | Police rover, light bar | Blue `#1e40af` | 1.35× | Flashing siren, badge decal |
| farmbot | Farm Bot | Tractor-style rover | Lime green `#65a30d` | 1.4× | Crop sensor mast, trailer hitch |
| spider | Spider Bot | 8 legs, low body | Emerald `#10b981` | 1.2× | LED eyes, joint pistons |
| droid | Humanoid | Biped android | Purple `#9B59B6` | 1.45× | Chest panel, articulated hands |
| mech | Mech Walker | Two-leg heavy mech | Red `#dc2626` | 1.8× | Hydraulic legs, shoulder pads |
| drone | Drone | Quadcopter | Cyan `#06b6d4` | 1.0× | 4 rotors, camera gimbal |
| racedrone | Racing Drone | Sleek FPV quad | Amber `#f59e0b` | 0.9× | Neon stripe, tilted rotors |
| rescuedrone | Rescue Drone | Quad + med kit | Red/white | 1.0× | Cross emblem, spotlight |
| helicopter | Helicopter | Chinook-style | Purple `#7c3aed` | 1.5× | Main + tail rotor, winch cable |
| hoverbot | Hover Bot | Disc hovercraft | Violet `#8b5cf6` | 1.2× | Glow ring underside |
| hoverracer | Hover Racer | Low hover pod | Pink `#ec4899` | 1.1× | Plasma exhaust trails |
| submarine | Sub Drone | Small yellow sub | Yellow `#eab308` | 1.3× | Bubble window, side propellers |
| deepseabot | Deep Sea Bot | Armoured sub | Dark teal `#164e63` | 1.6× | Headlight beams, claw arm |
| robotarm | Robot Arm | Orange 6-axis arm | Pink/orange `#ec4899` | Fixed base | Gripper claw, joint LEDs |
| factorybot | Factory Bot | AGV flatbed | Orange `#f97316` | 1.4× | Conveyor top, warning stripes |
| spacerover | Space Rover | NASA-style 6-wheel | Silver/grey | 1.4× | Satellite dish, sample arm |
| legobot | LEGO Bot | Blocky plastic bricks | Yellow/red | 1.3× | Visible studs, block joints |
| battlebot | Battle Mech | Heavy combat mech | Dark grey/red | 1.9× | Shoulder cannons, energy core glow |
| striker | Boxing Striker | Humanoid boxer | Orange `#f97316` | 1.5× | Boxing gloves, mouth guard |
| blaster | Elemental Blaster | Robe mage bot | Purple `#7c3aed` | 1.45× | Staff, floating rune orbs |
| ninja | Shadow Ninja | Slim fighter | Dark slate | 1.4× | Katana, mask, smoke pouch |
| berserker | Berserker | Bulky rage fighter | Red `#dc2626` | 1.7× | Hammer, rage glow eyes |
| medbot | Med Bot | Hospital rover | Sky blue `#0ea5e9` | 1.35× | Red cross, stretcher rack |
| firebot | Fire Fighter | Fire truck rover | Red `#dc2626` | 1.5× | Ladder, water cannon nozzle |
| jetplane | Jet Fighter | F-18 style | Blue `#1e40af` | 1.4× | Afterburner glow |
| steathjet | Stealth Jet | Angular B-2 style | Black | 1.4× | Minimal lights, vortex trails |
| aerobat | Aero Stunt | Prop stunt plane | Red/yellow | 1.2× | Smoke canisters on wings |
| birdbot | Sling-B | Round bird + wheels | Red `#e52222` | 1.0× | Slingshot mount in launcher modes |
| custom | Custom | User-built from parts | User colours | varies | Whatever user built |

---

---


# HOW TO READ EACH MISSION (PART 3)

1. **PRIMARY OBJECTIVE** — what Blockly code must achieve
2. **FAIL / RESTART** — what sends player back
3. **STARS** — three-tier challenge (most modes)
4. **ON-SCREEN HUD** — counters/bars kid sees while playing
5. **WHAT IT LOOKS LIKE** — art direction pulled from game specs
6. **INTERACT IN WORLD** — triggers, zones, enemies tied to objective

Press **▶ Simulate** to run blocks. Arrow keys = manual test.

---

# PART 3 — ALL MISSIONS

## CRAWLER 🌿 — Martian / Red Planet

### Mode 1 — Rocky Mountain Climb

> **Climb Martian rock steps where wheels would spin out.**

| | |
|---|---|
| **Difficulty** | Tutorial · Exploration |
| **Environment** | Red Planet Base (`martian`) |
| **Arena type** | `alien_planet` |

**PRIMARY OBJECTIVE**  
reach mountain peak.

**WIN CONDITION**  
reach peak.
**FAIL / RESTART**  
timer runs out → respawn or restart.

**TIME**  
180 seconds

**STARS**  
- ⭐ **reach peak**  
- ⭐⭐ **sub-150sec**  
- ⭐⭐⭐ **sub-120sec + no slips**

**CODE TO LEARN**  
sequential blocks, variables — *Physics of inclined planes, force management, conservation of momentum on slopes.*

**ROBOT EDGE**  
Maintains grip where wheeled bots spin out

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Elevation / depth gauge
- Speed readout
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  
Mountainous terrain with winding uphill path. Crawler starts at base (elevation 0m). Path winds up mountain with increasing steepness. Terrain: rocky, brown/gray rocks visible, sparse vegetation. Incline gets steeper: 5 degrees at start, 15 degrees at midpoint, 25 degrees near peak. Mountain peak visible in distance (white snow cap). Sky shows mountain vista. Camera positioned behind crawler angled to show uphill slope ahead. Path width narrows as climbs higher. Checkpoints marked at elevation intervals: Base (0m), Midpoint (500m), Peak (1000m). Visual indicators show elevation gain. At pea…

**INTERACT IN WORLD**  
Physics of inclined planes, force management, conservation of momentum on slopes.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 2 — Mud Puddle Traction Test

> **Cross slippery red dust basins without losing traction.**

| | |
|---|---|
| **Difficulty** | Easy · Science |
| **Environment** | Red Planet Base (`martian`) |
| **Arena type** | `desert_rally` |

**PRIMARY OBJECTIVE**  
cross all puddles and reach other side of swamp.

**WIN CONDITION**  
cross all 8 puddles.
**FAIL / RESTART**  
timer runs out, get stuck → respawn or restart.

**TIME**  
120 seconds

**STARS**  
- ⭐ **cross all**  
- ⭐⭐ **sub-100sec**  
- ⭐⭐⭐ **sub-80sec + minimal slipping**

**CODE TO LEARN**  
variables, loops — *Terrain analysis, traction management, force application in different conditions.*

**ROBOT EDGE**  
Maintains grip where wheeled bots spin out

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Speed readout
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  
Swampy terrain filled with mud, water, rocks. Multiple large mud puddles (brown, murky water) scattered across 200m track. Puddles vary in depth: shallow (0.5m), medium (1m), deep (1.5m). Crawler can ford puddles but speed reduced in mud (drag simulation). Rocks protrude from mud (navigation obstacles). Terrain is slippery - losing traction visible (wheels spinning, mud spray). Crawler's treads must grip through mud. Camera shows side view emphasizing traction challenge. Mud clings to Crawler (visual mud caking on chassis). Swampy vegetation visible. Water splashes as Crawler crosses. Succe…

**INTERACT IN WORLD**  
Terrain analysis, traction management, force application in different conditions.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 3 — Log Bridge Crossing

> **Crawl a narrow bridge over a crater gap — don't fall.**

| | |
|---|---|
| **Difficulty** | Easy · Construction |
| **Environment** | Red Planet Base (`martian`) |
| **Arena type** | `space_corridor` |

**PRIMARY OBJECTIVE**  
reach other side of stream via log.

**WIN CONDITION**  
reach other side.
**FAIL / RESTART**  
timer runs out, fall off track/platform, fail critical timing → respawn or restart.

**TIME**  
90 seconds

**STARS**  
- ⭐ **cross**  
- ⭐⭐ **perfect balance throughout**  
- ⭐⭐⭐ **sub-80sec + perfect center maintenance**

**CODE TO LEARN**  
loops, if/else — *Balance and precision control, constraint-based navigation, careful movement.*

**ROBOT EDGE**  
Maintains grip where wheeled bots spin out

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  
Dense forest with stream crossing. Path leads to a log bridge (large fallen tree) spanning stream. Log is narrow (1m diameter, 15m long). Stream below is 5m deep (visible water). Bridge is stable but narrow - any deviation falls into stream (game over). Camera shows side view of log and stream. Log has bark texture visible. Stream water moves (current visible). Far side of stream shows exit point. Crawler must walk across log carefully. HUD shows "BALANCE: 50%" as alignment indicator. Any lean to side shows % deviation.

**INTERACT IN WORLD**  
Balance and precision control, constraint-based navigation, careful movement.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 4 — Boulder Field Crawl

> **Pick a path through scattered boulders to the drill site.**

| | |
|---|---|
| **Difficulty** | Medium · Navigation |
| **Environment** | Red Planet Base (`martian`) |
| **Arena type** | `lava_canyon` |

**PRIMARY OBJECTIVE**  
weave through boulders reaching exit without excessive collisions.

**WIN CONDITION**  
reach exit.
**FAIL / RESTART**  
timer runs out → respawn or restart.

**TIME**  
120 seconds

**STARS**  
- ⭐ **reach exit**  
- ⭐⭐ **minimal collisions (2 or fewer)**  
- ⭐⭐⭐ **zero collisions + sub-100sec**

**CODE TO LEARN**  
if/else, sensors — *Spatial navigation, obstacle avoidance, path planning, precise turning.*

**ROBOT EDGE**  
Maintains grip where wheeled bots spin out

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  
Rocky field scattered with large boulders (2-3m diameter each). 15 boulders placed across 250m track in challenging pattern requiring navigation around/between them. Boulders are dark gray, weathered appearance. Terrain is loose gravel. Crawler must navigate through boulder field without hitting them. Collisions cause Crawler to bounce back. Visual effect: dust clouds when hitting boulders. Camera maintains behind-crawler view. Boulders cast shadows. Difficulty increases as progresses (boulders closer together at end). Exit point at far end clearly marked.

**INTERACT IN WORLD**  
Spatial navigation, obstacle avoidance, path planning, precise turning.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 5 — Trench Explorer

> **Descend into a mining trench and return with soil samples.**

| | |
|---|---|
| **Difficulty** | Medium · Survival |
| **Environment** | Red Planet Base (`martian`) |
| **Arena type** | `alien_planet` |

**PRIMARY OBJECTIVE**  
navigate switchbacks, cross trench floor, climb out other side.

**WIN CONDITION**  
reach opposite rim.
**FAIL / RESTART**  
timer runs out → respawn or restart.

**TIME**  
150 seconds

**STARS**  
- ⭐ **reach opposite side**  
- ⭐⭐ **no tumbles**  
- ⭐⭐⭐ **sub-120sec + no tumbles + perfect switchback navigation**

**CODE TO LEARN**  
sensors, events — *Path planning in 3D space, gravity effects, careful maneuvering on slopes.*

**ROBOT EDGE**  
Maintains grip where wheeled bots spin out

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  
Deep ravine/trench cutting through terrain. Crawler descends into trench (steep sides), floor is 30m below rim. Walls are nearly vertical, rough rocky texture. Floor is narrow (5m wide). Path down: switchback trail (zigzag down walls). Crawler must carefully navigate switchbacks without tumbling. Danger: falling sideways off narrow trail = tumble into ravine. Camera positioned to show depth danger. Shadows emphasize depth. At trench bottom, path leads forward. Echo sounds when in trench. Atmosphere is ominous/exploratory. Exit path leads up other side (climb back out).

**INTERACT IN WORLD**  
Path planning in 3D space, gravity effects, careful maneuvering on slopes.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 6 — Sand Dune Drift

> **Traverse shifting dunes on low-gravity Mars.**

| | |
|---|---|
| **Difficulty** | Medium · Construction |
| **Environment** | Red Planet Base (`martian`) |
| **Arena type** | `rough` |

**PRIMARY OBJECTIVE**  
cross dune field reaching finish point.

**WIN CONDITION**  
reach exit on far side.
**FAIL / RESTART**  
timer runs out → respawn or restart.

**TIME**  
180 seconds

**STARS**  
- ⭐ **complete**  
- ⭐⭐ **sub-150sec**  
- ⭐⭐⭐ **sub-120sec + minimal stuck points**

**CODE TO LEARN**  
events, functions — *Momentum management, terrain resistance analysis, strategic acceleration.*

**ROBOT EDGE**  
Maintains grip where wheeled bots spin out

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Speed readout
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  
Desert landscape with large sand dunes. Crawler navigates through dune field (500m total distance). Dunes: large (20-30m high), varying slopes. Sand is light tan color, sparkles in sunlight. Wind effects visible (sand swirls, particles in air). Dunes provide no hard surface - sand is soft, shifting (visual sand particle effects). Crawler's treads sink into sand (creating tracks visible behind). Moving through sand slows Crawler significantly. Camera positioned to emphasize scale of dunes. Sky is bright desert blue. Sand dunes cast long shadows.

**INTERACT IN WORLD**  
Momentum management, terrain resistance analysis, strategic acceleration.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 7 — Earthquake Hazard Trial

> **Cross ground that shakes — pause when sensors detect tremors.**

| | |
|---|---|
| **Difficulty** | Hard · Exploration |
| **Environment** | Red Planet Base (`martian`) |
| **Arena type** | `space_orbit` |

**PRIMARY OBJECTIVE**  
adapt to changing terrain, find new paths around chasm/cracks.

**WIN CONDITION**  
reach finish despite terrain changes.
**FAIL / RESTART**  
timer runs out, too much damage → respawn or restart.

**TIME**  
120 seconds

**STARS**  
- ⭐ **complete**  
- ⭐⭐ **sub-100sec**  
- ⭐⭐⭐ **sub-80sec + minimal fall-ins**

**CODE TO LEARN**  
functions, state machines — *Adaptive navigation, real-time decision-making, flexibility in programming.*

**ROBOT EDGE**  
Maintains grip where wheeled bots spin out

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Health / armor bar
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  
Flat terrain that becomes unstable. Earthquake starts at 10-second mark. Ground shakes (visual screen tremor), cracks appear in terrain (dark lines spreading across ground). Sections of terrain tilt/shift (geometry changes angle). Large chasm opens (previously connected terrain now separated by gap). Crawler must navigate around newly formed obstacles. Visual effect: debris falls, dust clouds from quakes. Tremors continue throughout (periodic screen shake). Terrain becomes increasingly unstable. Original path may be blocked, requiring alternative routes. Damage visible on terrain (broken su…

**INTERACT IN WORLD**  
Adaptive navigation, real-time decision-making, flexibility in programming.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 8 — Heavy Incline Hold

> **Stop and hold position on a 40° slope without sliding back.**

| | |
|---|---|
| **Difficulty** | Hard · Communication |
| **Environment** | Red Planet Base (`martian`) |
| **Arena type** | `desert_rally` |

**PRIMARY OBJECTIVE**  
reach top without sliding backward.

**WIN CONDITION**  
reach top.
**FAIL / RESTART**  
timer runs out → respawn or restart.

**TIME**  
180 seconds

**STARS**  
- ⭐ **reach top**  
- ⭐⭐ **sub-150sec**  
- ⭐⭐⭐ **sub-120sec + no backward sliding**

**CODE TO LEARN**  
state machines, timing — *Force required to overcome gravity, power requirements, sustained effort concept.*

**ROBOT EDGE**  
Maintains grip where wheeled bots spin out

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Elevation / depth gauge
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  
Massive steep slope (30-degree incline constant for 200m). Crawler positioned at bottom facing uphill. Slope is solid (rock/gravel), stable surface. Incline is relentless - no flat sections. Landscape: barren, rocky, sparse vegetation. Sky emphasizes steepness (camera angled shows horizon far above). Crawler's climb progress visible: elevation markers show climb (100m, 200m, 300m elevation). At steep incline, holding position is challenge - gravity pulls downward. Crawler treads must grip to prevent sliding backward. Visual: Crawler appears to strain climbing slope.

**INTERACT IN WORLD**  
Force required to overcome gravity, power requirements, sustained effort concept.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 9 — Wilderness Search Patrol

> **Scan 6 anomaly markers across the crater rim.**

| | |
|---|---|
| **Difficulty** | Hard · Strategy |
| **Environment** | Red Planet Base (`martian`) |
| **Arena type** | `crystal_caverns` |

**PRIMARY OBJECTIVE**  
reach each checkpoint in sequence and complete circuit.

**WIN CONDITION**  
visit all 6 checkpoints and return to base.
**FAIL / RESTART**  
timer runs out → respawn or restart.

**TIME**  
300 seconds (5 minutes for full circuit)

**STARS**  
- ⭐ **complete circuit**  
- ⭐⭐ **all checkpoints + sub-250sec**  
- ⭐⭐⭐ **perfect route + sub-220sec + no crashes**

**CODE TO LEARN**  
timing, optimization — *Route planning, navigation with multiple waypoints, efficiency optimization.*

**ROBOT EDGE**  
Maintains grip where wheeled bots spin out

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  
Large wilderness area (400m circuit). Crawler starts at patrol base. Route loops through different terrain types: forest (trees visible), cleared areas, stream crossings, rocky outcrops. Patrol objective: investigate 6 checkpoints scattered along circuit (marked with glowing markers). Each checkpoint: marked with flag, must reach exact position. Terrain varies making route challenging. Natural obstacles: fallen trees, natural obstacles (rocks, steep slopes). Helicopter searchlight visible in sky (creates dramatic lighting). Wildlife sounds (birds, insects). Atmosphere: exploration, search a…

**INTERACT IN WORLD**  
Route planning, navigation with multiple waypoints, efficiency optimization.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 10 — All-Terrain Master (CAPSTONE)

> **Capstone: full Martian circuit with every hazard type.**

| | |
|---|---|
| **Difficulty** | Expert · Hybrid |
| **Environment** | Red Planet Base (`martian`) |
| **Arena type** | `warp_gate` |

**PRIMARY OBJECTIVE**  
Complete ultimate all-terrain course mastering all terrain types.

**WIN CONDITION**  
complete entire course.
**FAIL / RESTART**  
timer runs out → respawn or restart.

**TIME**  
600 seconds (10 minutes)

**STARS**  
- ⭐ **complete**  
- ⭐⭐ **complete sub-500sec**  
- ⭐⭐⭐ **perfect execution all sections + sub-450sec**

**CODE TO LEARN**  
optimization, sequential blocks — *Mastery of all terrain mechanics, adaptation to varied conditions.*

**ROBOT EDGE**  
Maintains grip where wheeled bots spin out

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  
Mega-course combining ALL terrain challenges: mountain climb (100m), mud puddles (50m), log bridge crossing (20m), boulder field (60m), trench (40m), sand dunes (80m), earthquake zone (50m), steep slope (100m). Each section transitions smoothly. Landscape is massive and impressive. Progress shown on master map in HUD. Terrain difficulty escalates through course. Final section is hybrid challenge (multiple terrain types simultaneously). Visual quality is impressive: detailed terrain, dynamic effects, cinematic views at major transitions. Finish line is celebratory.

**INTERACT IN WORLD**  
Mastery of all terrain mechanics, adaptation to varied conditions.

**WIN MOMENT**  
Goal marker flashes green + star popup; mastery badge + confetti.


---

## TANK 🛡️ — Industrial + Combat

### Mode 1 — Fortress Core Defense

> **Defend the central core from 3 waves of training drones.**

| | |
|---|---|
| **Difficulty** | Tutorial · Combat |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
eliminate approaching enemy tanks before reaching fortress.

**WIN CONDITION**  
survive 120 seconds without fortress being destroyed.
**FAIL / RESTART**  
Miss objective or hit fail trigger → respawn.

**TIME**  
~3 min (soft target)

**STARS**  
- ⭐ **defend 120sec**  
- ⭐⭐ **no fortress damage**  
- ⭐⭐⭐ **100% enemy elimination + fortress pristine**

**CODE TO LEARN**  
sequential blocks, variables — *Strategic positioning, threat assessment, multi-tasking under pressure.*

**ROBOT EDGE**  
Absorbs hits while pushing objectives

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  
Military fortress (large compound) shown from above. Tank positioned at entrance. Objective: defend fortress from attackers. Enemy tanks approach from 4 directions (visible on HUD radar). Tank must position itself to intercept attackers. Fortress walls visible, guard towers at corners. Defensive positions marked (good firing angles). Enemy tanks appear as red dots on radar approaching. HUD displays: Fortress Integrity (health %), Enemy Count, Current Threat Level. Tank cannon visible aiming. Explosions visible when engaging enemies. Fortress takes damage if enemies reach walls (visual damag…

**INTERACT IN WORLD**  
Strategic positioning, threat assessment, multi-tasking under pressure.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 2 — Heavy Mortar Cannon

> **Launch arcing shots over walls to hit distant targets.**

| | |
|---|---|
| **Difficulty** | Easy · Combat |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
use artillery to eliminate distant targets.

**WIN CONDITION**  
hit all 10 targets.
**FAIL / RESTART**  
timer runs out → respawn or restart.

**TIME**  
180 seconds

**STARS**  
- ⭐ **8+ hits**  
- ⭐⭐ **all 10 hits**  
- ⭐⭐⭐ **all 10 + perfect accuracy (no wasted shots)**

**CODE TO LEARN**  
variables, loops — *Physics of projectile motion, distance/angle relationships, artillery tactics.*

**ROBOT EDGE**  
Absorbs hits while pushing objectives

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  
Tank positioned in elevated terrain (canyon rim overlooking valley). Enemy positions visible in distant valley (10 buildings/bunkers scattered 500m+ away). Tank's mortar cannon is primary weapon. HUD shows: target crosshair, distance to target (in meters), cannon angle adjustment. Player must calculate angle and distance to hit targets. Mortar fires arc trajectory (visible path prediction line). Explosions erupt at target locations (large blast effects, particles). Each hit registers on HUD. Targets visible as glowing red markers. Terrain between tank and targets: rough, canyon walls, obsta…

**INTERACT IN WORLD**  
Physics of projectile motion, distance/angle relationships, artillery tactics.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 3 — Bumper Car Sumo

> **Push the rival tank out of the elevated ring.**

| | |
|---|---|
| **Difficulty** | Easy · Combat |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
force enemy beyond boundary.

**WIN CONDITION**  
push enemy outside boundary.
**FAIL / RESTART**  
timer runs out → respawn or restart.

**TIME**  
180 seconds

**STARS**  
- ⭐ **force out**  
- ⭐⭐ **force out within 60sec**  
- ⭐⭐⭐ **minimal damage taken + force out sub-60sec**

**CODE TO LEARN**  
loops, if/else — *Physics of collision and momentum, force application, combat tactics.*

**ROBOT EDGE**  
Absorbs hits while pushing objectives

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Speed readout
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  
Arena (flat arena, 200m diameter). Two tanks: player (blue) and enemy (red). Both visible in arena from above view (camera shows entire arena). Objective: push enemy tank outside arena boundary (circular perimeter marked with glowing line). Tanks collide (physical impact). Larger/heavier tank (player's) has advantage. Collision effects: both tanks rock backward from impact. Health bars shown for both tanks. Arena boundary clearly marked. Audience visible around arena edges (spectators cheering/booing). Score tracker: "YOUR POSITION: CENTER, ENEMY POSITION: EDGE".

**INTERACT IN WORLD**  
Physics of collision and momentum, force application, combat tactics.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 4 — Minefield Clearance

> **Mark safe path through mines — one hit resets the lane.**

| | |
|---|---|
| **Difficulty** | Medium · Combat |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
reach exit without hitting any mines.

**WIN CONDITION**  
exit minefield without hitting any mine.
**FAIL / RESTART**  
timer runs out → respawn or restart.

**TIME**  
150 seconds

**STARS**  
- ⭐ **exit intact**  
- ⭐⭐ **exit + sub-120sec**  
- ⭐⭐⭐ **perfect navigation + sub-100sec + no mine touches**

**CODE TO LEARN**  
if/else, sensors — *Careful route planning, hazard avoidance, precision under pressure.*

**ROBOT EDGE**  
Absorbs hits while pushing objectives

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  
Flat terrain with 20 mines scattered across 300m course. Mines appear as small metallic spheres (dark gray, slightly buried). Minimap shows all mine locations (red dots). Tank must navigate carefully avoiding all mines (any mine hit = explosion, immediate failure). Path width narrowed by mine placement (clever positioning creates "safe corridor"). Terrain: sandy, flat. Camera shows birds-eye view emphasizing mine field visibility. Safe path is narrow and winding. Explosion effects would be dramatic if hit (debris, fire).

**INTERACT IN WORLD**  
Careful route planning, hazard avoidance, precision under pressure.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 5 — Shield Wall Endurance

> **Hold block stance while under fire for 60 seconds.**

| | |
|---|---|
| **Difficulty** | Medium · Survival |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
maintain shield until bombardment ends.

**WIN CONDITION**  
survive full bombardment.
**FAIL / RESTART**  
timer runs out, too much damage → respawn or restart.

**TIME**  
120 seconds

**STARS**  
- ⭐ **survive**  
- ⭐⭐ **shield durability 25%+ remaining**  
- ⭐⭐⭐ **shield 50%+ remaining + zero damage to tank**

**CODE TO LEARN**  
sensors, events — *Resource management under pressure, endurance testing, damage resistance concepts.*

**ROBOT EDGE**  
Absorbs hits while pushing objectives

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Health / armor bar
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  
Tank positioned in defensive stance. Enemy artillery barrage begins (shells rain down). Tank raises heavy armor shield (visual shield deployed). Shells impact shield, creating impact effects (explosions, particles). Shield absorbs damage but has limited durability. Durability bar shown in HUD (decreases with each hit). Tank must maintain shield position while enemy bombardment continues. Explosions visible around tank (near misses). Shield glows red when taking damage. Intense bombardment creates atmospheric effect (sound, screen shake). Visual: tank looks small compared to massive incoming…

**INTERACT IN WORLD**  
Resource management under pressure, endurance testing, damage resistance concepts.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 6 — Goliath Tank Duel

> **1v1 heavy armor fight in the mech colosseum.**

| | |
|---|---|
| **Difficulty** | Medium · Combat |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
reduce enemy health to zero before your health depleted.

**WIN CONDITION**  
enemy health depleted to zero.
**FAIL / RESTART**  
timer runs out, too much damage → respawn or restart.

**TIME**  
300 seconds (5 minutes maximum)

**STARS**  
- ⭐ **win**  
- ⭐⭐ **win quickly (sub-180sec)**  
- ⭐⭐⭐ **win + minimal damage taken + sub-120sec**

**CODE TO LEARN**  
events, functions — *Combat tactics, resource management (ammo), health management.*

**ROBOT EDGE**  
Absorbs hits while pushing objectives

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Health / armor bar
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  
Two tanks: player (blue heavy tank) vs enemy (red heavy tank). Arena: flat ground (100m diameter). Both tanks visible, heavily armored, impressive scale. Each has health bar (top of screen). Weapons: cannon and machine gun. Engagement: tanks face off, both trying to win. Enemy tank AI: attacks aggressively, fires cannon, tries to maneuver for advantage. Explosions visible when weapons hit. Dust clouds from impacts and movement. Dramatic lighting emphasizing intensity. Score: damage dealt vs taken.

**INTERACT IN WORLD**  
Combat tactics, resource management (ammo), health management.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 7 — Battery Payload Escort

> **Escort the power cell through combat alleyways.**

| | |
|---|---|
| **Difficulty** | Hard · Combat |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
keep battery alive while reaching destination.

**WIN CONDITION**  
reach destination with battery intact.
**FAIL / RESTART**  
timer runs out → respawn or restart.

**TIME**  
180 seconds

**STARS**  
- ⭐ **reach destination + battery alive**  
- ⭐⭐ **75%+ battery health**  
- ⭐⭐⭐ **100% battery health + sub-150sec**

**CODE TO LEARN**  
functions, state machines — *Protection mechanics, multitasking (movement + defense), prioritization.*

**ROBOT EDGE**  
Absorbs hits while pushing objectives

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  
Tank starts with large battery/power cell loaded on chassis (visual: large glowing cylinder mounted on tank top). Mission: escort battery to destination (200m away) without losing it. Enemy drone aircraft try to destroy battery (visible in sky). Battery is vulnerable to air attack. Tank must avoid aerial attacks. HUD shows: Battery Integrity (health %), Destination Distance, Incoming Threats. As tank moves toward destination, enemy drones approach (on radar and visible in sky). Drones fire at battery (visual laser fire from sky). Battery loses health when hit. Tank can fire defensive weapon…

**INTERACT IN WORLD**  
Protection mechanics, multitasking (movement + defense), prioritization.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 8 — Concrete Bunker Breaker

> **Smash destructible barriers to reach the objective.**

| | |
|---|---|
| **Difficulty** | Hard · Challenge |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
reduce each bunker to rubble.

**WIN CONDITION**  
destroy all 5 bunkers.
**FAIL / RESTART**  
timer runs out → respawn or restart.

**TIME**  
300 seconds

**STARS**  
- ⭐ **destroy all**  
- ⭐⭐ **destroy all + sub-250sec**  
- ⭐⭐⭐ **minimal damage + destroy all + sub-220sec**

**CODE TO LEARN**  
state machines, timing — *Tactical approach to fortified positions, resource management (weapon heat), positioning for advantage.*

**ROBOT EDGE**  
Absorbs hits while pushing objectives

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Health / armor bar
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  
Landscape with series of concrete bunkers (fortified enemy positions). Tank must approach each bunker and breach it. Bunkers have reinforced concrete walls, gun emplacements visible. Tank uses heavy weapons to destroy bunker defenses. Visual: explosions gradually destroying bunker (wall cracks, debris falls). Multiple bunkers in sequence (5 total). Terrain: open ground between bunkers. Each bunker increasingly fortified. Final bunker heavily armored. Destruction effects impressive and satisfying.

**INTERACT IN WORLD**  
Tactical approach to fortified positions, resource management (weapon heat), positioning for advantage.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 9 — Thermal Cooling Management

> **Vent heat before overheat shuts down weapons.**

| | |
|---|---|
| **Difficulty** | Hard · Escort |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
reach finish without overheat shutdown.

**WIN CONDITION**  
reach finish with operational status.
**FAIL / RESTART**  
timer runs out → respawn or restart.

**TIME**  
180 seconds

**STARS**  
- ⭐ **reach finish**  
- ⭐⭐ **reach finish + sub-150sec**  
- ⭐⭐⭐ **reach finish + minimal cooling station stops + sub-120sec + never entered RED zone**

**CODE TO LEARN**  
timing, optimization — *Resource management, threshold management, finding services/stations under pressure.*

**ROBOT EDGE**  
Absorbs hits while pushing objectives

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  
Desert environment (hot, visible heat shimmer effects). Tank is heavily armored (absorbs heat). Thermal gauge displayed in HUD: GREEN (cool), YELLOW (warm), RED (overheating). Surrounding environment shows extreme heat (visual distortion, heat waves). Tank operation generates internal heat (weapons fire, movement). As tank operates, thermal gauge increases. If gauge enters RED, tank begins taking damage from overheating. Tank must reach cooling stations (large water tanks visible in landscape) to reduce thermal load (automatic when reaching station). Challenge: must reach multiple cooling s…

**INTERACT IN WORLD**  
Resource management, threshold management, finding services/stations under pressure.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 10 — 8-Tank Battle Royale (CAPSTONE)

> **Last tank standing in the shrinking arena.**

| | |
|---|---|
| **Difficulty** | Expert · Combat |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
be last tank standing (eliminate all enemies or be last survivor).

**WIN CONDITION**  
survive battle (last tank remaining).
**FAIL / RESTART**  
timer runs out → respawn or restart.

**TIME**  
600 seconds (10 minutes maximum)

**STARS**  
- ⭐ **survive**  
- ⭐⭐ **survive + eliminate 5+ enemies yourself**  
- ⭐⭐⭐ **eliminate 6+/7 enemies + sub-300sec + minimal damage**

**CODE TO LEARN**  
optimization, sequential blocks — *Complex combat tactics, threat prioritization, survival under extreme pressure.*

**ROBOT EDGE**  
Absorbs hits while pushing objectives

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  
Large battlefield (400m diameter arena). 8 tanks total: player (blue) + 7 enemies (red). All visible on battlefield with camera zoomed to show multiple tanks. Tanks spawn at different positions around arena. Minimap shows all tank positions (blue for player, red for enemies). Battle is chaotic: multiple tanks engaging simultaneously. Explosions across battlefield. Smoke and dust from impacts. Intensity increases as tanks are eliminated (survivors engage each other). Final tank standing wins. Dramatic lighting, epic music.

**INTERACT IN WORLD**  
Complex combat tactics, threat prioritization, survival under extreme pressure.

**WIN MOMENT**  
Goal marker flashes green + star popup; mastery badge + confetti.


---

## STEALTH 🌑 — Cyber Ninja Night City

### Mode 1 — Laser Grid Infiltration

> **Cross the museum vault without tripping laser beams.**

| | |
|---|---|
| **Difficulty** | Tutorial · Stealth |
| **Environment** | Moonlit Rooftop & Lasers (`cyber_ninja`) |
| **Arena type** | `museum_heist` |

**PRIMARY OBJECTIVE**  
Cross the museum vault without tripping laser beams..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~3 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sequential blocks, variables — *Mode 1 teaches sequential blocks before harder modes stack concepts.*

**ROBOT EDGE**  
Slips past patrols when speed bots fail

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Laser Grid Infiltration: Cross the museum vault without tripping laser beams.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 2 — Cloaking Device Trial

> **Reach the exit while cloaked — movement breaks stealth.**

| | |
|---|---|
| **Difficulty** | Easy · Stealth |
| **Environment** | Moonlit Rooftop & Lasers (`cyber_ninja`) |
| **Arena type** | `shadow_escape` |

**PRIMARY OBJECTIVE**  
Reach the exit while cloaked — movement breaks stealth..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~5 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
variables, loops — *Mode 2 teaches variables before harder modes stack concepts.*

**ROBOT EDGE**  
Slips past patrols when speed bots fail

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Cloaking Device Trial: Reach the exit while cloaked — movement breaks stealth.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 3 — Silent Footsteps

> **Pass sleeping guards — noise meter must stay green.**

| | |
|---|---|
| **Difficulty** | Easy · Stealth |
| **Environment** | Moonlit Rooftop & Lasers (`cyber_ninja`) |
| **Arena type** | `cyber_city` |

**PRIMARY OBJECTIVE**  
Pass sleeping guards — noise meter must stay green..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~6 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
loops, if/else — *Mode 3 teaches loops before harder modes stack concepts.*

**ROBOT EDGE**  
Slips past patrols when speed bots fail

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Silent Footsteps: Pass sleeping guards — noise meter must stay green.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 4 — Shadow Dash

> **Dash between shadow zones before searchlights sweep back.**

| | |
|---|---|
| **Difficulty** | Medium · Patrol |
| **Environment** | Moonlit Rooftop & Lasers (`cyber_ninja`) |
| **Arena type** | `night_patrol` |

**PRIMARY OBJECTIVE**  
Dash between shadow zones before searchlights sweep back..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
if/else, sensors — *Mode 4 teaches if/else before harder modes stack concepts.*

**ROBOT EDGE**  
Slips past patrols when speed bots fail

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Shadow Dash: Dash between shadow zones before searchlights sweep back.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 5 — Night Vision Target Tag

> **Tag 5 targets in darkness using NV sensors.**

| | |
|---|---|
| **Difficulty** | Medium · Stealth |
| **Environment** | Moonlit Rooftop & Lasers (`cyber_ninja`) |
| **Arena type** | `shadow_escape` |

**PRIMARY OBJECTIVE**  
Tag 5 targets in darkness using NV sensors..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sensors, events — *Mode 5 teaches sensors before harder modes stack concepts.*

**ROBOT EDGE**  
Slips past patrols when speed bots fail

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Night Vision Target Tag: Tag 5 targets in darkness using NV sensors.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 6 — Guard Bypass

> **Time patrol routes and slip through blind spots.**

| | |
|---|---|
| **Difficulty** | Medium · Infiltration |
| **Environment** | Moonlit Rooftop & Lasers (`cyber_ninja`) |
| **Arena type** | `museum_heist` |

**PRIMARY OBJECTIVE**  
Time patrol routes and slip through blind spots..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
events, functions — *Mode 6 teaches events before harder modes stack concepts.*

**ROBOT EDGE**  
Slips past patrols when speed bots fail

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Guard Bypass: Time patrol routes and slip through blind spots.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 7 — Hack Security Terminal

> **Hold position at terminal for 10s to hack the door.**

| | |
|---|---|
| **Difficulty** | Hard · Stealth |
| **Environment** | Moonlit Rooftop & Lasers (`cyber_ninja`) |
| **Arena type** | `cyber_city` |

**PRIMARY OBJECTIVE**  
Hold position at terminal for 10s to hack the door..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
functions, state machines — *Mode 7 teaches functions before harder modes stack concepts.*

**ROBOT EDGE**  
Slips past patrols when speed bots fail

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Hack Security Terminal: Hold position at terminal for 10s to hack the door.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 8 — Ghost Recon Sweep

> **Map the rooftop without raising any alarms.**

| | |
|---|---|
| **Difficulty** | Hard · Patrol |
| **Environment** | Moonlit Rooftop & Lasers (`cyber_ninja`) |
| **Arena type** | `night_patrol` |

**PRIMARY OBJECTIVE**  
Map the rooftop without raising any alarms..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
state machines, timing — *Mode 8 teaches state machines before harder modes stack concepts.*

**ROBOT EDGE**  
Slips past patrols when speed bots fail

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Ghost Recon Sweep: Map the rooftop without raising any alarms.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 9 — Distraction Flare Deploy

> **Deploy flare to pull guards, then sneak past.**

| | |
|---|---|
| **Difficulty** | Hard · Escape |
| **Environment** | Moonlit Rooftop & Lasers (`cyber_ninja`) |
| **Arena type** | `escape_wall` |

**PRIMARY OBJECTIVE**  
Deploy flare to pull guards, then sneak past..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
timing, optimization — *Mode 9 teaches timing before harder modes stack concepts.*

**ROBOT EDGE**  
Slips past patrols when speed bots fail

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Distraction Flare Deploy: Deploy flare to pull guards, then sneak past.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 10 — Dark Ops Mastermind (CAPSTONE)

> **Full heist: lasers, guards, hack, extract — zero alarms.**

| | |
|---|---|
| **Difficulty** | Expert · Mastery |
| **Environment** | Moonlit Rooftop & Lasers (`cyber_ninja`) |
| **Arena type** | `jump_world` |

**PRIMARY OBJECTIVE**  
Full heist: lasers, guards, hack, extract — zero alarms..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~15 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
optimization, sequential blocks — *Mode 10 teaches optimization before harder modes stack concepts.*

**ROBOT EDGE**  
Slips past patrols when speed bots fail

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Dark Ops Mastermind: Full heist: lasers, guards, hack, extract — zero alarms.

**WIN MOMENT**  
Goal marker flashes green + star popup; mastery badge + confetti.


---

## MINING BOT ⛏️ — Industrial / Underground

### Mode 1 — Crystal Ore Extraction

> **Drill 8 crystal nodes in the factory quarry zone.**

| | |
|---|---|
| **Difficulty** | Tutorial · Simulation |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `auto_factory` |

**PRIMARY OBJECTIVE**  
Drill 8 crystal nodes in the factory quarry zone..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~3 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sequential blocks, variables — *Mode 1 teaches sequential blocks before harder modes stack concepts.*

**ROBOT EDGE**  
Hauls heavy loads through unstable tunnels

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Crystal Ore Extraction: Drill 8 crystal nodes in the factory quarry zone.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 2 — Tunnel Digger Sprint

> **Dig through the underground mine to the exit shaft.**

| | |
|---|---|
| **Difficulty** | Easy · Logistics |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `factory_floor` |

**PRIMARY OBJECTIVE**  
Dig through the underground mine to the exit shaft..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~5 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
variables, loops — *Mode 2 teaches variables before harder modes stack concepts.*

**ROBOT EDGE**  
Hauls heavy loads through unstable tunnels

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Tunnel Digger Sprint: Dig through the underground mine to the exit shaft.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 3 — Heavy Load Haul

> **Haul ore cart from pit to smelter without tipping.**

| | |
|---|---|
| **Difficulty** | Easy · Quality |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `warehouse` |

**PRIMARY OBJECTIVE**  
Haul ore cart from pit to smelter without tipping..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~6 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
loops, if/else — *Mode 3 teaches loops before harder modes stack concepts.*

**ROBOT EDGE**  
Hauls heavy loads through unstable tunnels

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Heavy Load Haul: Haul ore cart from pit to smelter without tipping.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 4 — Shaft Seismic Scan

> **Scan walls for weak points before drilling forward.**

| | |
|---|---|
| **Difficulty** | Medium · Synchronization |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `underground_mine` |

**PRIMARY OBJECTIVE**  
Scan walls for weak points before drilling forward..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
if/else, sensors — *Mode 4 teaches if/else before harder modes stack concepts.*

**ROBOT EDGE**  
Hauls heavy loads through unstable tunnels

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Shaft Seismic Scan: Scan walls for weak points before drilling forward.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 5 — Cave-In Escape

> **Outrun collapsing tunnel — reach safety before timer ends.**

| | |
|---|---|
| **Difficulty** | Medium · Industrial |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `power_garden` |

**PRIMARY OBJECTIVE**  
Outrun collapsing tunnel — reach safety before timer ends..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sensors, events — *Mode 5 teaches sensors before harder modes stack concepts.*

**ROBOT EDGE**  
Hauls heavy loads through unstable tunnels

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Cave-In Escape: Outrun collapsing tunnel — reach safety before timer ends.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 6 — Diamond Vein Crusher

> **Break reinforced vein with timed hammer strikes.**

| | |
|---|---|
| **Difficulty** | Medium · Navigation |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `pipeline_crawl` |

**PRIMARY OBJECTIVE**  
Break reinforced vein with timed hammer strikes..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
events, functions — *Mode 6 teaches events before harder modes stack concepts.*

**ROBOT EDGE**  
Hauls heavy loads through unstable tunnels

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Diamond Vein Crusher: Break reinforced vein with timed hammer strikes.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 7 — Geothermal Vent Bypass

> **Route around steam vents using temperature sensors.**

| | |
|---|---|
| **Difficulty** | Hard · Hazard |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `urban_obstacle` |

**PRIMARY OBJECTIVE**  
Route around steam vents using temperature sensors..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
functions, state machines — *Mode 7 teaches functions before harder modes stack concepts.*

**ROBOT EDGE**  
Hauls heavy loads through unstable tunnels

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Geothermal Vent Bypass: Route around steam vents using temperature sensors.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 8 — Ore Sorting Deposit

> **Deliver red vs blue ore to correct hoppers.**

| | |
|---|---|
| **Difficulty** | Hard · Emergency |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `factory_floor` |

**PRIMARY OBJECTIVE**  
Deliver red vs blue ore to correct hoppers..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
state machines, timing — *Mode 8 teaches state machines before harder modes stack concepts.*

**ROBOT EDGE**  
Hauls heavy loads through unstable tunnels

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Ore Sorting Deposit: Deliver red vs blue ore to correct hoppers.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 9 — Explosive Charge Plant

> **Place charges, retreat, detonate — clear the rubble.**

| | |
|---|---|
| **Difficulty** | Hard · Packaging |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `auto_factory` |

**PRIMARY OBJECTIVE**  
Place charges, retreat, detonate — clear the rubble..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
timing, optimization — *Mode 9 teaches timing before harder modes stack concepts.*

**ROBOT EDGE**  
Hauls heavy loads through unstable tunnels

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Explosive Charge Plant: Place charges, retreat, detonate — clear the rubble.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 10 — Deep Earth Master (CAPSTONE)

> **Full shift: extract, haul, sort, escape cave-in.**

| | |
|---|---|
| **Difficulty** | Expert · Mastery |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `colosseum` |

**PRIMARY OBJECTIVE**  
Full shift: extract, haul, sort, escape cave-in..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~15 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
optimization, sequential blocks — *Mode 10 teaches optimization before harder modes stack concepts.*

**ROBOT EDGE**  
Hauls heavy loads through unstable tunnels

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Deep Earth Master: Full shift: extract, haul, sort, escape cave-in.

**WIN MOMENT**  
Goal marker flashes green + star popup; mastery badge + confetti.


---

## SECURITY BOT 👮 — Industrial / Urban

### Mode 1 — Perimeter Patrol Circuit

> **Follow the glowing patrol route — hit every checkpoint.**

| | |
|---|---|
| **Difficulty** | Tutorial · Simulation |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `auto_factory` |

**PRIMARY OBJECTIVE**  
Follow the glowing patrol route — hit every checkpoint..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~3 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sequential blocks, variables — *Mode 1 teaches sequential blocks before harder modes stack concepts.*

**ROBOT EDGE**  
Relentless circuit coverage

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Perimeter Patrol Circuit: Follow the glowing patrol route — hit every checkpoint.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 2 — Intruder Alert Chase

> **Pursue the fleeing bot and tag it within 90 seconds.**

| | |
|---|---|
| **Difficulty** | Easy · Logistics |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `factory_floor` |

**PRIMARY OBJECTIVE**  
Pursue the fleeing bot and tag it within 90 seconds..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~5 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
variables, loops — *Mode 2 teaches variables before harder modes stack concepts.*

**ROBOT EDGE**  
Relentless circuit coverage

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Intruder Alert Chase: Pursue the fleeing bot and tag it within 90 seconds.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 3 — Night Sentry Watch

> **Scan sectors with spotlight — report anomalies.**

| | |
|---|---|
| **Difficulty** | Easy · Quality |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `warehouse` |

**PRIMARY OBJECTIVE**  
Scan sectors with spotlight — report anomalies..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~6 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
loops, if/else — *Mode 3 teaches loops before harder modes stack concepts.*

**ROBOT EDGE**  
Relentless circuit coverage

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Night Sentry Watch: Scan sectors with spotlight — report anomalies.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 4 — Access Card Verification

> **Stop at 4 gates and verify RFID codes.**

| | |
|---|---|
| **Difficulty** | Medium · Synchronization |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `underground_mine` |

**PRIMARY OBJECTIVE**  
Stop at 4 gates and verify RFID codes..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
if/else, sensors — *Mode 4 teaches if/else before harder modes stack concepts.*

**ROBOT EDGE**  
Relentless circuit coverage

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Access Card Verification: Stop at 4 gates and verify RFID codes.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 5 — Flashlight Searchlight

> **Find hidden intruders in the warehouse dark zones.**

| | |
|---|---|
| **Difficulty** | Medium · Industrial |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `power_garden` |

**PRIMARY OBJECTIVE**  
Find hidden intruders in the warehouse dark zones..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sensors, events — *Mode 5 teaches sensors before harder modes stack concepts.*

**ROBOT EDGE**  
Relentless circuit coverage

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Flashlight Searchlight: Find hidden intruders in the warehouse dark zones.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 6 — Crowd Control Barrier

> **Deploy barriers to redirect traffic flow safely.**

| | |
|---|---|
| **Difficulty** | Medium · Navigation |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `pipeline_crawl` |

**PRIMARY OBJECTIVE**  
Deploy barriers to redirect traffic flow safely..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
events, functions — *Mode 6 teaches events before harder modes stack concepts.*

**ROBOT EDGE**  
Relentless circuit coverage

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Crowd Control Barrier: Deploy barriers to redirect traffic flow safely.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 7 — Alarm Code Response

> **Enter correct code sequence at the alarm panel.**

| | |
|---|---|
| **Difficulty** | Hard · Hazard |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `urban_obstacle` |

**PRIMARY OBJECTIVE**  
Enter correct code sequence at the alarm panel..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
functions, state machines — *Mode 7 teaches functions before harder modes stack concepts.*

**ROBOT EDGE**  
Relentless circuit coverage

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Alarm Code Response: Enter correct code sequence at the alarm panel.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 8 — CCTV Blind Spot Sweep

> **Cover every camera blind spot on the map.**

| | |
|---|---|
| **Difficulty** | Hard · Emergency |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `factory_floor` |

**PRIMARY OBJECTIVE**  
Cover every camera blind spot on the map..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
state machines, timing — *Mode 8 teaches state machines before harder modes stack concepts.*

**ROBOT EDGE**  
Relentless circuit coverage

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
CCTV Blind Spot Sweep: Cover every camera blind spot on the map.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 9 — Vault Lock Protection

> **Defend vault door during 2-minute breach attempt.**

| | |
|---|---|
| **Difficulty** | Hard · Packaging |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `auto_factory` |

**PRIMARY OBJECTIVE**  
Defend vault door during 2-minute breach attempt..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
timing, optimization — *Mode 9 teaches timing before harder modes stack concepts.*

**ROBOT EDGE**  
Relentless circuit coverage

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Vault Lock Protection: Defend vault door during 2-minute breach attempt.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 10 — Chief Security Officer (CAPSTONE)

> **Capstone patrol: chase, verify, defend vault.**

| | |
|---|---|
| **Difficulty** | Expert · Mastery |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `colosseum` |

**PRIMARY OBJECTIVE**  
Capstone patrol: chase, verify, defend vault..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~15 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
optimization, sequential blocks — *Mode 10 teaches optimization before harder modes stack concepts.*

**ROBOT EDGE**  
Relentless circuit coverage

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Chief Security Officer: Capstone patrol: chase, verify, defend vault.

**WIN MOMENT**  
Goal marker flashes green + star popup; mastery badge + confetti.


---

## FARM BOT 🌾 — Power Garden / Farm

### Mode 1 — Crop Planting Row

> **Plant seeds in 6 straight rows using repeat loops.**

| | |
|---|---|
| **Difficulty** | Tutorial · Simulation |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `auto_factory` |

**PRIMARY OBJECTIVE**  
Plant seeds in 6 straight rows using repeat loops..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~3 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sequential blocks, variables — *Mode 1 teaches sequential blocks before harder modes stack concepts.*

**ROBOT EDGE**  
Repeats long field patterns flawlessly

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Crop Planting Row: Plant seeds in 6 straight rows using repeat loops.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 2 — Automated Watering Route

> **Water every dry patch along the field circuit.**

| | |
|---|---|
| **Difficulty** | Easy · Logistics |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `factory_floor` |

**PRIMARY OBJECTIVE**  
Water every dry patch along the field circuit..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~5 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
variables, loops — *Mode 2 teaches variables before harder modes stack concepts.*

**ROBOT EDGE**  
Repeats long field patterns flawlessly

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Automated Watering Route: Water every dry patch along the field circuit.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 3 — Weed Eradication Blitz

> **Tag all weeds without damaging crops.**

| | |
|---|---|
| **Difficulty** | Easy · Quality |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `warehouse` |

**PRIMARY OBJECTIVE**  
Tag all weeds without damaging crops..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~6 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
loops, if/else — *Mode 3 teaches loops before harder modes stack concepts.*

**ROBOT EDGE**  
Repeats long field patterns flawlessly

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Weed Eradication Blitz: Tag all weeds without damaging crops.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 4 — Apple Orchard Harvester

> **Collect apples from 10 trees in order.**

| | |
|---|---|
| **Difficulty** | Medium · Synchronization |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `underground_mine` |

**PRIMARY OBJECTIVE**  
Collect apples from 10 trees in order..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
if/else, sensors — *Mode 4 teaches if/else before harder modes stack concepts.*

**ROBOT EDGE**  
Repeats long field patterns flawlessly

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Apple Orchard Harvester: Collect apples from 10 trees in order.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 5 — Field Plowing Pattern

> **Drive a zigzag plow pattern across the field.**

| | |
|---|---|
| **Difficulty** | Medium · Industrial |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `power_garden` |

**PRIMARY OBJECTIVE**  
Drive a zigzag plow pattern across the field..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sensors, events — *Mode 5 teaches sensors before harder modes stack concepts.*

**ROBOT EDGE**  
Repeats long field patterns flawlessly

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Field Plowing Pattern: Drive a zigzag plow pattern across the field.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 6 — Wheat Harvesting Haul

> **Harvest and deliver grain to the silo.**

| | |
|---|---|
| **Difficulty** | Medium · Navigation |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `pipeline_crawl` |

**PRIMARY OBJECTIVE**  
Harvest and deliver grain to the silo..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
events, functions — *Mode 6 teaches events before harder modes stack concepts.*

**ROBOT EDGE**  
Repeats long field patterns flawlessly

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Wheat Harvesting Haul: Harvest and deliver grain to the silo.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 7 — Pest Control Patrol

> **Spray pest zones when sensor detects infestation.**

| | |
|---|---|
| **Difficulty** | Hard · Hazard |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `urban_obstacle` |

**PRIMARY OBJECTIVE**  
Spray pest zones when sensor detects infestation..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
functions, state machines — *Mode 7 teaches functions before harder modes stack concepts.*

**ROBOT EDGE**  
Repeats long field patterns flawlessly

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Pest Control Patrol: Spray pest zones when sensor detects infestation.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 8 — Soil Moisture Sensor Sweep

> **Map moisture levels at 8 survey points.**

| | |
|---|---|
| **Difficulty** | Hard · Emergency |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `factory_floor` |

**PRIMARY OBJECTIVE**  
Map moisture levels at 8 survey points..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
state machines, timing — *Mode 8 teaches state machines before harder modes stack concepts.*

**ROBOT EDGE**  
Repeats long field patterns flawlessly

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Soil Moisture Sensor Sweep: Map moisture levels at 8 survey points.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 9 — Greenhouse Climate Control

> **Adjust vents to keep temperature in green zone.**

| | |
|---|---|
| **Difficulty** | Hard · Packaging |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `auto_factory` |

**PRIMARY OBJECTIVE**  
Adjust vents to keep temperature in green zone..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
timing, optimization — *Mode 9 teaches timing before harder modes stack concepts.*

**ROBOT EDGE**  
Repeats long field patterns flawlessly

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Greenhouse Climate Control: Adjust vents to keep temperature in green zone.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 10 — Golden Harvest Master (CAPSTONE)

> **Full farm day: plant, water, harvest, deliver.**

| | |
|---|---|
| **Difficulty** | Expert · Mastery |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `colosseum` |

**PRIMARY OBJECTIVE**  
Full farm day: plant, water, harvest, deliver..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~15 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
optimization, sequential blocks — *Mode 10 teaches optimization before harder modes stack concepts.*

**ROBOT EDGE**  
Repeats long field patterns flawlessly

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Golden Harvest Master: Full farm day: plant, water, harvest, deliver.

**WIN MOMENT**  
Goal marker flashes green + star popup; mastery badge + confetti.


---

## SPIDER BOT 🕷️ — Spider Climber

### Mode 1 — Web Climbing Ascent

> **Climb the vertical mesh wall to the rooftop exit.**

| | |
|---|---|
| **Difficulty** | Tutorial · Climb |
| **Environment** | Vertical Web & Ruins (`spider_climber`) |
| **Arena type** | `spider_rescue` |

**PRIMARY OBJECTIVE**  
Climb the vertical mesh wall to the rooftop exit..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~3 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sequential blocks, variables — *Mode 1 teaches sequential blocks before harder modes stack concepts.*

**ROBOT EDGE**  
Traverses vertical mesh others cannot

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Web Climbing Ascent: Climb the vertical mesh wall to the rooftop exit.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 2 — Multi-Leg Stability Test

> **Cross stepping stones without a leg touching void.**

| | |
|---|---|
| **Difficulty** | Easy · Balance |
| **Environment** | Vertical Web & Ruins (`spider_climber`) |
| **Arena type** | `spider_pipeline` |

**PRIMARY OBJECTIVE**  
Cross stepping stones without a leg touching void..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~5 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
variables, loops — *Mode 2 teaches variables before harder modes stack concepts.*

**ROBOT EDGE**  
Traverses vertical mesh others cannot

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Multi-Leg Stability Test: Cross stepping stones without a leg touching void.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 3 — Ceiling Crawl Infiltration

> **Traverse upside-down along ceiling rails.**

| | |
|---|---|
| **Difficulty** | Easy · Infiltration |
| **Environment** | Vertical Web & Ruins (`spider_climber`) |
| **Arena type** | `pipeline_crawl` |

**PRIMARY OBJECTIVE**  
Traverse upside-down along ceiling rails..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~6 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
loops, if/else — *Mode 3 teaches loops before harder modes stack concepts.*

**ROBOT EDGE**  
Traverses vertical mesh others cannot

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Ceiling Crawl Infiltration: Traverse upside-down along ceiling rails.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 4 — Web Trap Deploy

> **Spin barriers to trap moving targets in the ruins.**

| | |
|---|---|
| **Difficulty** | Medium · Trap |
| **Environment** | Vertical Web & Ruins (`spider_climber`) |
| **Arena type** | `temple_climb` |

**PRIMARY OBJECTIVE**  
Spin barriers to trap moving targets in the ruins..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
if/else, sensors — *Mode 4 teaches if/else before harder modes stack concepts.*

**ROBOT EDGE**  
Traverses vertical mesh others cannot

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Web Trap Deploy: Spin barriers to trap moving targets in the ruins.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 5 — Creepy Crawly Slalom

> **Weave through tight pillars in the temple climb.**

| | |
|---|---|
| **Difficulty** | Medium · Navigation |
| **Environment** | Vertical Web & Ruins (`spider_climber`) |
| **Arena type** | `collapsed_building` |

**PRIMARY OBJECTIVE**  
Weave through tight pillars in the temple climb..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sensors, events — *Mode 5 teaches sensors before harder modes stack concepts.*

**ROBOT EDGE**  
Traverses vertical mesh others cannot

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Creepy Crawly Slalom: Weave through tight pillars in the temple climb.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 6 — High-Step Hazard Jump

> **Step over pipe obstacles with leg lift blocks.**

| | |
|---|---|
| **Difficulty** | Medium · Jump |
| **Environment** | Vertical Web & Ruins (`spider_climber`) |
| **Arena type** | `crystal_caverns` |

**PRIMARY OBJECTIVE**  
Step over pipe obstacles with leg lift blocks..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
events, functions — *Mode 6 teaches events before harder modes stack concepts.*

**ROBOT EDGE**  
Traverses vertical mesh others cannot

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
High-Step Hazard Jump: Step over pipe obstacles with leg lift blocks.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 7 — Vibration Sensor Detect

> **Locate hidden movement using floor vibration data.**

| | |
|---|---|
| **Difficulty** | Hard · Sensor |
| **Environment** | Vertical Web & Ruins (`spider_climber`) |
| **Arena type** | `jump_world` |

**PRIMARY OBJECTIVE**  
Locate hidden movement using floor vibration data..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
functions, state machines — *Mode 7 teaches functions before harder modes stack concepts.*

**ROBOT EDGE**  
Traverses vertical mesh others cannot

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Vibration Sensor Detect: Locate hidden movement using floor vibration data.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 8 — Arachnid Speed Dash

> **Skitter sideways at top speed through the pipeline.**

| | |
|---|---|
| **Difficulty** | Hard · Race |
| **Environment** | Vertical Web & Ruins (`spider_climber`) |
| **Arena type** | `deep_cave` |

**PRIMARY OBJECTIVE**  
Skitter sideways at top speed through the pipeline..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
state machines, timing — *Mode 8 teaches state machines before harder modes stack concepts.*

**ROBOT EDGE**  
Traverses vertical mesh others cannot

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Speed readout
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Arachnid Speed Dash: Skitter sideways at top speed through the pipeline.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 9 — Inverse Kinematics Gait

> **Adjust leg heights for extreme slope angles.**

| | |
|---|---|
| **Difficulty** | Hard · Kinematics |
| **Environment** | Vertical Web & Ruins (`spider_climber`) |
| **Arena type** | `colosseum` |

**PRIMARY OBJECTIVE**  
Adjust leg heights for extreme slope angles..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
timing, optimization — *Mode 9 teaches timing before harder modes stack concepts.*

**ROBOT EDGE**  
Traverses vertical mesh others cannot

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Inverse Kinematics Gait: Adjust leg heights for extreme slope angles.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 10 — Spider Queen Showdown (CAPSTONE)

> **Scale the colossal tower and defeat the boss gate.**

| | |
|---|---|
| **Difficulty** | Expert · Boss |
| **Environment** | Vertical Web & Ruins (`spider_climber`) |
| **Arena type** | `temple_climb` |

**PRIMARY OBJECTIVE**  
Scale the colossal tower and defeat the boss gate..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~15 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
optimization, sequential blocks — *Mode 10 teaches optimization before harder modes stack concepts.*

**ROBOT EDGE**  
Traverses vertical mesh others cannot

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Spider Queen Showdown: Scale the colossal tower and defeat the boss gate.

**WIN MOMENT**  
Goal marker flashes green + star popup; mastery badge + confetti.


---

## HUMANOID DROID 🤖 — Industrial Factory

### Mode 1 — Bipedal Balance Sprint

> **Sprint without falling — balance meter must stay centered.**

| | |
|---|---|
| **Difficulty** | Tutorial · Simulation |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `auto_factory` |

**PRIMARY OBJECTIVE**  
Sprint without falling — balance meter must stay centered..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~3 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sequential blocks, variables — *Mode 1 teaches sequential blocks before harder modes stack concepts.*

**ROBOT EDGE**  
Navigates stairs and doors built for people

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Bipedal Balance Sprint: Sprint without falling — balance meter must stay centered.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 2 — Staircase Climb

> **Climb 20 steps to the factory mezzanine.**

| | |
|---|---|
| **Difficulty** | Easy · Logistics |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `factory_floor` |

**PRIMARY OBJECTIVE**  
Climb 20 steps to the factory mezzanine..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~5 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
variables, loops — *Mode 2 teaches variables before harder modes stack concepts.*

**ROBOT EDGE**  
Navigates stairs and doors built for people

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Staircase Climb: Climb 20 steps to the factory mezzanine.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 3 — Object Pick and Place

> **Grab crate from belt A and place on belt B.**

| | |
|---|---|
| **Difficulty** | Easy · Quality |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `warehouse` |

**PRIMARY OBJECTIVE**  
Grab crate from belt A and place on belt B..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~6 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
loops, if/else — *Mode 3 teaches loops before harder modes stack concepts.*

**ROBOT EDGE**  
Navigates stairs and doors built for people

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Object Pick and Place: Grab crate from belt A and place on belt B.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 4 — Human Gesture Mimic

> **Copy the instructor pose at each mirror station.**

| | |
|---|---|
| **Difficulty** | Medium · Synchronization |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `underground_mine` |

**PRIMARY OBJECTIVE**  
Copy the instructor pose at each mirror station..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
if/else, sensors — *Mode 4 teaches if/else before harder modes stack concepts.*

**ROBOT EDGE**  
Navigates stairs and doors built for people

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Human Gesture Mimic: Copy the instructor pose at each mirror station.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 5 — Obstacle Hurdle Jump

> **Jump over 8 hurdles on the assembly floor.**

| | |
|---|---|
| **Difficulty** | Medium · Industrial |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `power_garden` |

**PRIMARY OBJECTIVE**  
Jump over 8 hurdles on the assembly floor..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sensors, events — *Mode 5 teaches sensors before harder modes stack concepts.*

**ROBOT EDGE**  
Navigates stairs and doors built for people

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Obstacle Hurdle Jump: Jump over 8 hurdles on the assembly floor.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 6 — Balance Beam Walk

> **Cross narrow beam over the conveyor gap.**

| | |
|---|---|
| **Difficulty** | Medium · Navigation |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `pipeline_crawl` |

**PRIMARY OBJECTIVE**  
Cross narrow beam over the conveyor gap..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
events, functions — *Mode 6 teaches events before harder modes stack concepts.*

**ROBOT EDGE**  
Navigates stairs and doors built for people

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Balance Beam Walk: Cross narrow beam over the conveyor gap.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 7 — Door Handle Turn

> **Rotate handle and push door — enter next room.**

| | |
|---|---|
| **Difficulty** | Hard · Hazard |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `urban_obstacle` |

**PRIMARY OBJECTIVE**  
Rotate handle and push door — enter next room..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
functions, state machines — *Mode 7 teaches functions before harder modes stack concepts.*

**ROBOT EDGE**  
Navigates stairs and doors built for people

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Door Handle Turn: Rotate handle and push door — enter next room.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 8 — Push Recovery Test

> **Recover from shove without falling over.**

| | |
|---|---|
| **Difficulty** | Hard · Emergency |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `factory_floor` |

**PRIMARY OBJECTIVE**  
Recover from shove without falling over..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
state machines, timing — *Mode 8 teaches state machines before harder modes stack concepts.*

**ROBOT EDGE**  
Navigates stairs and doors built for people

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Push Recovery Test: Recover from shove without falling over.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 9 — Dance Choreography

> **Execute 6-move dance sequence in order.**

| | |
|---|---|
| **Difficulty** | Hard · Packaging |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `auto_factory` |

**PRIMARY OBJECTIVE**  
Execute 6-move dance sequence in order..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
timing, optimization — *Mode 9 teaches timing before harder modes stack concepts.*

**ROBOT EDGE**  
Navigates stairs and doors built for people

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Dance Choreography: Execute 6-move dance sequence in order.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 10 — Humanoid Olympics (CAPSTONE)

> **Capstone: stairs, carry, jump, balance finale.**

| | |
|---|---|
| **Difficulty** | Expert · Mastery |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `colosseum` |

**PRIMARY OBJECTIVE**  
Capstone: stairs, carry, jump, balance finale..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~15 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
optimization, sequential blocks — *Mode 10 teaches optimization before harder modes stack concepts.*

**ROBOT EDGE**  
Navigates stairs and doors built for people

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Humanoid Olympics: Capstone: stairs, carry, jump, balance finale.

**WIN MOMENT**  
Goal marker flashes green + star popup; mastery badge + confetti.


---

## MECH WALKER 🦾 — Industrial + Combat

### Mode 1 — Heavy Stomp Siege

> **Stomp through destructible barricades to the gate.**

| | |
|---|---|
| **Difficulty** | Tutorial · Combat |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Stomp through destructible barricades to the gate..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~3 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sequential blocks, variables — *Mode 1 teaches sequential blocks before harder modes stack concepts.*

**ROBOT EDGE**  
Combines walker agility with tank mass

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Heavy Stomp Siege: Stomp through destructible barricades to the gate.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 2 — Dual Arm Loader

> **Lift two crates simultaneously onto the scaffold.**

| | |
|---|---|
| **Difficulty** | Easy · Combat |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Lift two crates simultaneously onto the scaffold..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~5 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
variables, loops — *Mode 2 teaches variables before harder modes stack concepts.*

**ROBOT EDGE**  
Combines walker agility with tank mass

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Dual Arm Loader: Lift two crates simultaneously onto the scaffold.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 3 — Mech Titan Stride

> **Walk the colosseum without falling off the platform.**

| | |
|---|---|
| **Difficulty** | Easy · Combat |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Walk the colosseum without falling off the platform..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~6 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
loops, if/else — *Mode 3 teaches loops before harder modes stack concepts.*

**ROBOT EDGE**  
Combines walker agility with tank mass

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Mech Titan Stride: Walk the colosseum without falling off the platform.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 4 — Hydraulic Press Smash

> **Time smash attacks on glowing weak points.**

| | |
|---|---|
| **Difficulty** | Medium · Combat |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Time smash attacks on glowing weak points..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
if/else, sensors — *Mode 4 teaches if/else before harder modes stack concepts.*

**ROBOT EDGE**  
Combines walker agility with tank mass

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Hydraulic Press Smash: Time smash attacks on glowing weak points.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 5 — Overheat Thermal Venting

> **Vent before heat bar maxes during combat.**

| | |
|---|---|
| **Difficulty** | Medium · Survival |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Vent before heat bar maxes during combat..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sensors, events — *Mode 5 teaches sensors before harder modes stack concepts.*

**ROBOT EDGE**  
Combines walker agility with tank mass

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Overheat Thermal Venting: Vent before heat bar maxes during combat.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 6 — Seismic Ground Slam

> **Slam ground to break floor locks in the arena.**

| | |
|---|---|
| **Difficulty** | Medium · Combat |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Slam ground to break floor locks in the arena..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
events, functions — *Mode 6 teaches events before harder modes stack concepts.*

**ROBOT EDGE**  
Combines walker agility with tank mass

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Seismic Ground Slam: Slam ground to break floor locks in the arena.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 7 — Cargo Scaffold Lift

> **Stack girders on the construction lift.**

| | |
|---|---|
| **Difficulty** | Hard · Combat |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Stack girders on the construction lift..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
functions, state machines — *Mode 7 teaches functions before harder modes stack concepts.*

**ROBOT EDGE**  
Combines walker agility with tank mass

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Cargo Scaffold Lift: Stack girders on the construction lift.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 8 — Mech Walker Patrol

> **Patrol industrial yard — stomp intruder bots.**

| | |
|---|---|
| **Difficulty** | Hard · Challenge |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Patrol industrial yard — stomp intruder bots..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
state machines, timing — *Mode 8 teaches state machines before harder modes stack concepts.*

**ROBOT EDGE**  
Combines walker agility with tank mass

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Mech Walker Patrol: Patrol industrial yard — stomp intruder bots.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 9 — Armor Hull Stress Test

> **Survive sustained fire without hull breach.**

| | |
|---|---|
| **Difficulty** | Hard · Escort |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Survive sustained fire without hull breach..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
timing, optimization — *Mode 9 teaches timing before harder modes stack concepts.*

**ROBOT EDGE**  
Combines walker agility with tank mass

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Armor Hull Stress Test: Survive sustained fire without hull breach.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 10 — Colossus Mech Duel (CAPSTONE)

> **Boss fight in the elevated steel cage.**

| | |
|---|---|
| **Difficulty** | Expert · Combat |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Boss fight in the elevated steel cage..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~15 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
optimization, sequential blocks — *Mode 10 teaches optimization before harder modes stack concepts.*

**ROBOT EDGE**  
Combines walker agility with tank mass

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Colossus Mech Duel: Boss fight in the elevated steel cage.

**WIN MOMENT**  
Goal marker flashes green + star popup; mastery badge + confetti.


---

## DRONE 🚁 — Sky Aerial

### Mode 1 — Aerial Ring Slalom

> **Fly through 12 glowing rings in order.**

| | |
|---|---|
| **Difficulty** | Tutorial · Navigation |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `drone_canyon` |

**PRIMARY OBJECTIVE**  
Fly through 12 glowing rings in order..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~3 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sequential blocks, variables — *Mode 1 teaches sequential blocks before harder modes stack concepts.*

**ROBOT EDGE**  
3D movement through sky courses

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Aerial Ring Slalom: Fly through 12 glowing rings in order.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 2 — Hover Altitude Lock

> **Hold exact altitude through the canyon corridor.**

| | |
|---|---|
| **Difficulty** | Easy · Challenge |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `canyon_flight` |

**PRIMARY OBJECTIVE**  
Hold exact altitude through the canyon corridor..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~5 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
variables, loops — *Mode 2 teaches variables before harder modes stack concepts.*

**ROBOT EDGE**  
3D movement through sky courses

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Hover Altitude Lock: Hold exact altitude through the canyon corridor.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 3 — Aerial Target Dive

> **Dive-bomb 5 targets then pull up before ground.**

| | |
|---|---|
| **Difficulty** | Easy · Combat |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `storm_cloud` |

**PRIMARY OBJECTIVE**  
Dive-bomb 5 targets then pull up before ground..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~6 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
loops, if/else — *Mode 3 teaches loops before harder modes stack concepts.*

**ROBOT EDGE**  
3D movement through sky courses

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Aerial Target Dive: Dive-bomb 5 targets then pull up before ground.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 4 — Quadcopter Swarm Patrol

> **Patrol 4 sky sectors with waypoint loops.**

| | |
|---|---|
| **Difficulty** | Medium · Patrol |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `cloud_race` |

**PRIMARY OBJECTIVE**  
Patrol 4 sky sectors with waypoint loops..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
if/else, sensors — *Mode 4 teaches if/else before harder modes stack concepts.*

**ROBOT EDGE**  
3D movement through sky courses

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Quadcopter Swarm Patrol: Patrol 4 sky sectors with waypoint loops.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 5 — Vertical Ascent Sprint

> **Race straight up the tower to the landing pad.**

| | |
|---|---|
| **Difficulty** | Medium · Race |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `space_orbit` |

**PRIMARY OBJECTIVE**  
Race straight up the tower to the landing pad..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sensors, events — *Mode 5 teaches sensors before harder modes stack concepts.*

**ROBOT EDGE**  
3D movement through sky courses

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Vertical Ascent Sprint: Race straight up the tower to the landing pad.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 6 — Package Drop Precision

> **Drop supply crate on the rooftop X marker.**

| | |
|---|---|
| **Difficulty** | Medium · Delivery |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `flight_rings` |

**PRIMARY OBJECTIVE**  
Drop supply crate on the rooftop X marker..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
events, functions — *Mode 6 teaches events before harder modes stack concepts.*

**ROBOT EDGE**  
3D movement through sky courses

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Package Drop Precision: Drop supply crate on the rooftop X marker.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 7 — Aerial Photography Sweep

> **Hover over 6 photo waypoints steadily.**

| | |
|---|---|
| **Difficulty** | Hard · Exploration |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `jet_stunt` |

**PRIMARY OBJECTIVE**  
Hover over 6 photo waypoints steadily..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
functions, state machines — *Mode 7 teaches functions before harder modes stack concepts.*

**ROBOT EDGE**  
3D movement through sky courses

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Aerial Photography Sweep: Hover over 6 photo waypoints steadily.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 8 — Wind Tunnel Navigation

> **Fight crosswinds without leaving the corridor.**

| | |
|---|---|
| **Difficulty** | Hard · Survival |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `rooftop_delivery` |

**PRIMARY OBJECTIVE**  
Fight crosswinds without leaving the corridor..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
state machines, timing — *Mode 8 teaches state machines before harder modes stack concepts.*

**ROBOT EDGE**  
3D movement through sky courses

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Wind Tunnel Navigation: Fight crosswinds without leaving the corridor.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 9 — Propeller Flip Stunt

> **Execute flip through the stunt ring.**

| | |
|---|---|
| **Difficulty** | Hard · Stunt |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `typhoon` |

**PRIMARY OBJECTIVE**  
Execute flip through the stunt ring..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
timing, optimization — *Mode 9 teaches timing before harder modes stack concepts.*

**ROBOT EDGE**  
3D movement through sky courses

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Propeller Flip Stunt: Execute flip through the stunt ring.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 10 — Sky Ace Master (CAPSTONE)

> **Capstone: rings, dive, drop, stunt combo course.**

| | |
|---|---|
| **Difficulty** | Expert · Hybrid |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `warp_gate` |

**PRIMARY OBJECTIVE**  
Capstone: rings, dive, drop, stunt combo course..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~15 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
optimization, sequential blocks — *Mode 10 teaches optimization before harder modes stack concepts.*

**ROBOT EDGE**  
3D movement through sky courses

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Combo counter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Sky Ace Master: Capstone: rings, dive, drop, stunt combo course.

**WIN MOMENT**  
Goal marker flashes green + star popup; mastery badge + confetti.


---

## RACING DRONE 🏎️ — Hybrid Sky Race

### Mode 1 — FPV Drone Racing Circuit

> **Rainbow Road ribbon race from FPV chase cam.**

| | |
|---|---|
| **Difficulty** | Tutorial · Race |
| **Environment** | Sky & Neon Circuit (`hybrid_race_sky`) |
| **Arena type** | `rainbow_road` |

**PRIMARY OBJECTIVE**  
Rainbow Road ribbon race from FPV chase cam..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~3 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sequential blocks, variables — *Mode 1 teaches sequential blocks before harder modes stack concepts.*

**ROBOT EDGE**  
Hybrid sky + Rainbow Road circuits

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Speed readout
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  
The active circuit is Rainbow Road: a Mario Kart–quality 3D ribbon track with glossy glass tiles, neon guardrails, checkpoint arches, and boost pads. Stars and nebula skies frame the course.

**INTERACT IN WORLD**  
FPV Drone Racing Circuit: Rainbow Road ribbon race from FPV chase cam.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 2 — Tunnel Turbo Dash

> **Burst through neon tunnel on Dragon Skyway.**

| | |
|---|---|
| **Difficulty** | Easy · Navigation |
| **Environment** | Sky & Neon Circuit (`hybrid_race_sky`) |
| **Arena type** | `drone_canyon` |

**PRIMARY OBJECTIVE**  
Burst through neon tunnel on Dragon Skyway..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~5 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
variables, loops — *Mode 2 teaches variables before harder modes stack concepts.*

**ROBOT EDGE**  
Hybrid sky + Rainbow Road circuits

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Speed readout
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Tunnel Turbo Dash: Burst through neon tunnel on Dragon Skyway.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 3 — Gate Proximity Drift

> **Clip gate edges for drift bonus points.**

| | |
|---|---|
| **Difficulty** | Easy · Race |
| **Environment** | Sky & Neon Circuit (`hybrid_race_sky`) |
| **Arena type** | `sunny_circuit` |

**PRIMARY OBJECTIVE**  
Clip gate edges for drift bonus points..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~6 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
loops, if/else — *Mode 3 teaches loops before harder modes stack concepts.*

**ROBOT EDGE**  
Hybrid sky + Rainbow Road circuits

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Speed readout
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  
The active circuit is Candy Kingdom: a Mario Kart–quality 3D ribbon track with glossy glass tiles, neon guardrails, checkpoint arches, and boost pads. Stars and nebula skies frame the course.

**INTERACT IN WORLD**  
Gate Proximity Drift: Clip gate edges for drift bonus points.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 4 — Speed Trap Sky Burst

> **Hit 6 speed traps on the cloud race line.**

| | |
|---|---|
| **Difficulty** | Medium · Navigation |
| **Environment** | Sky & Neon Circuit (`hybrid_race_sky`) |
| **Arena type** | `cloud_race` |

**PRIMARY OBJECTIVE**  
Hit 6 speed traps on the cloud race line..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
if/else, sensors — *Mode 4 teaches if/else before harder modes stack concepts.*

**ROBOT EDGE**  
Hybrid sky + Rainbow Road circuits

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Speed readout
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Speed Trap Sky Burst: Hit 6 speed traps on the cloud race line.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 5 — High-Speed Slalom

> **Slalom floating rings at max throttle.**

| | |
|---|---|
| **Difficulty** | Medium · Race |
| **Environment** | Sky & Neon Circuit (`hybrid_race_sky`) |
| **Arena type** | `dragon_skyway` |

**PRIMARY OBJECTIVE**  
Slalom floating rings at max throttle..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sensors, events — *Mode 5 teaches sensors before harder modes stack concepts.*

**ROBOT EDGE**  
Hybrid sky + Rainbow Road circuits

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Speed readout
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  
The active circuit is Dragon Skyway: a Mario Kart–quality 3D ribbon track with glossy glass tiles, neon guardrails, checkpoint arches, and boost pads. Stars and nebula skies frame the course.

**INTERACT IN WORLD**  
High-Speed Slalom: Slalom floating rings at max throttle.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 6 — Battery Drain Time Attack

> **Finish before battery hits zero.**

| | |
|---|---|
| **Difficulty** | Medium · Navigation |
| **Environment** | Sky & Neon Circuit (`hybrid_race_sky`) |
| **Arena type** | `flight_rings` |

**PRIMARY OBJECTIVE**  
Finish before battery hits zero..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
events, functions — *Mode 6 teaches events before harder modes stack concepts.*

**ROBOT EDGE**  
Hybrid sky + Rainbow Road circuits

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Speed readout
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Battery Drain Time Attack: Finish before battery hits zero.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 7 — Acrobatic Barrel Roll

> **Roll through the storm cloud gate.**

| | |
|---|---|
| **Difficulty** | Hard · Race |
| **Environment** | Sky & Neon Circuit (`hybrid_race_sky`) |
| **Arena type** | `volcano_drift` |

**PRIMARY OBJECTIVE**  
Roll through the storm cloud gate..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
functions, state machines — *Mode 7 teaches functions before harder modes stack concepts.*

**ROBOT EDGE**  
Hybrid sky + Rainbow Road circuits

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Speed readout
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  
The active circuit is Volcano Drift: a Mario Kart–quality 3D ribbon track with glossy glass tiles, neon guardrails, checkpoint arches, and boost pads. Stars and nebula skies frame the course.

**INTERACT IN WORLD**  
Acrobatic Barrel Roll: Roll through the storm cloud gate.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 8 — Ghost Drone Race

> **Beat your ghost lap on Volcano Drift.**

| | |
|---|---|
| **Difficulty** | Hard · Survival |
| **Environment** | Sky & Neon Circuit (`hybrid_race_sky`) |
| **Arena type** | `storm_cloud` |

**PRIMARY OBJECTIVE**  
Beat your ghost lap on Volcano Drift..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
state machines, timing — *Mode 8 teaches state machines before harder modes stack concepts.*

**ROBOT EDGE**  
Hybrid sky + Rainbow Road circuits

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Speed readout
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Ghost Drone Race: Beat your ghost lap on Volcano Drift.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 9 — Low-Altitude Lawn Mower

> **Skim rooftop delivery route at 2m altitude.**

| | |
|---|---|
| **Difficulty** | Hard · Race |
| **Environment** | Sky & Neon Circuit (`hybrid_race_sky`) |
| **Arena type** | `street_grand_prix` |

**PRIMARY OBJECTIVE**  
Skim rooftop delivery route at 2m altitude..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
timing, optimization — *Mode 9 teaches timing before harder modes stack concepts.*

**ROBOT EDGE**  
Hybrid sky + Rainbow Road circuits

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Speed readout
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  
The active circuit is Rainbow Road Grand Prix: a Mario Kart–quality 3D ribbon track with glossy glass tiles, neon guardrails, checkpoint arches, and boost pads. Stars and nebula skies frame the course.

**INTERACT IN WORLD**  
Low-Altitude Lawn Mower: Skim rooftop delivery route at 2m altitude.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 10 — Grand Sky Prix Champion (CAPSTONE)

> **Final: hybrid sky + Rainbow Road championship.**

| | |
|---|---|
| **Difficulty** | Expert · Hybrid |
| **Environment** | Sky & Neon Circuit (`hybrid_race_sky`) |
| **Arena type** | `warp_gate` |

**PRIMARY OBJECTIVE**  
Final: hybrid sky + Rainbow Road championship..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~15 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
optimization, sequential blocks — *Mode 10 teaches optimization before harder modes stack concepts.*

**ROBOT EDGE**  
Hybrid sky + Rainbow Road circuits

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Speed readout
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Grand Sky Prix Champion: Final: hybrid sky + Rainbow Road championship.

**WIN MOMENT**  
Goal marker flashes green + star popup; mastery badge + confetti.


---

## RESCUE DRONE 🚑 — Emergency + Sky

### Mode 1 — Disaster Zone Search

> **Scan rubble for 5 survivor heat signatures.**

| | |
|---|---|
| **Difficulty** | Tutorial · Rescue |
| **Environment** | Burning City District (`emergency`) |
| **Arena type** | `firebot_blaze` |

**PRIMARY OBJECTIVE**  
Scan rubble for 5 survivor heat signatures..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~3 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sequential blocks, variables — *Mode 1 teaches sequential blocks before harder modes stack concepts.*

**ROBOT EDGE**  
Reaches disaster zones ground bots cannot

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Disaster Zone Search: Scan rubble for 5 survivor heat signatures.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 2 — Emergency First Aid Drop

> **Drop medkits on survivors in burning district.**

| | |
|---|---|
| **Difficulty** | Easy · Rescue |
| **Environment** | Burning City District (`emergency`) |
| **Arena type** | `hospital_walk` |

**PRIMARY OBJECTIVE**  
Drop medkits on survivors in burning district..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~5 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
variables, loops — *Mode 2 teaches variables before harder modes stack concepts.*

**ROBOT EDGE**  
Reaches disaster zones ground bots cannot

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Emergency First Aid Drop: Drop medkits on survivors in burning district.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 3 — Flood Zone Evacuation Tag

> **Tag evacuees on rooftops in flooded city.**

| | |
|---|---|
| **Difficulty** | Easy · Navigation |
| **Environment** | Burning City District (`emergency`) |
| **Arena type** | `snow_rescue` |

**PRIMARY OBJECTIVE**  
Tag evacuees on rooftops in flooded city..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~6 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
loops, if/else — *Mode 3 teaches loops before harder modes stack concepts.*

**ROBOT EDGE**  
Reaches disaster zones ground bots cannot

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Flood Zone Evacuation Tag: Tag evacuees on rooftops in flooded city.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 4 — Thermal Heat Signature Spotting

> **Find hidden victims using thermal cam.**

| | |
|---|---|
| **Difficulty** | Medium · Challenge |
| **Environment** | Burning City District (`emergency`) |
| **Arena type** | `firebot_blaze` |

**PRIMARY OBJECTIVE**  
Find hidden victims using thermal cam..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
if/else, sensors — *Mode 4 teaches if/else before harder modes stack concepts.*

**ROBOT EDGE**  
Reaches disaster zones ground bots cannot

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Thermal Heat Signature Spotting: Find hidden victims using thermal cam.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 5 — Avalanche Beacon Sweep

> **Locate beacons under snow_rescue terrain.**

| | |
|---|---|
| **Difficulty** | Medium · Climb |
| **Environment** | Burning City District (`emergency`) |
| **Arena type** | `hospital_walk` |

**PRIMARY OBJECTIVE**  
Locate beacons under snow_rescue terrain..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sensors, events — *Mode 5 teaches sensors before harder modes stack concepts.*

**ROBOT EDGE**  
Reaches disaster zones ground bots cannot

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Avalanche Beacon Sweep: Locate beacons under snow_rescue terrain.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 6 — Rope Lifeline Deploy

> **Deploy rope to stranded bot on cliff edge.**

| | |
|---|---|
| **Difficulty** | Medium · Strategy |
| **Environment** | Burning City District (`emergency`) |
| **Arena type** | `snow_rescue` |

**PRIMARY OBJECTIVE**  
Deploy rope to stranded bot on cliff edge..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
events, functions — *Mode 6 teaches events before harder modes stack concepts.*

**ROBOT EDGE**  
Reaches disaster zones ground bots cannot

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Rope Lifeline Deploy: Deploy rope to stranded bot on cliff edge.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 7 — Hurricane Wind Rescue

> **Hover stable in typhoon corridor to rescue.**

| | |
|---|---|
| **Difficulty** | Hard · Crisis |
| **Environment** | Burning City District (`emergency`) |
| **Arena type** | `lava_canyon` |

**PRIMARY OBJECTIVE**  
Hover stable in typhoon corridor to rescue..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
functions, state machines — *Mode 7 teaches functions before harder modes stack concepts.*

**ROBOT EDGE**  
Reaches disaster zones ground bots cannot

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Hurricane Wind Rescue: Hover stable in typhoon corridor to rescue.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 8 — Night Searchlight Recon

> **Light and find targets in dark hospital zone.**

| | |
|---|---|
| **Difficulty** | Hard · Race |
| **Environment** | Burning City District (`emergency`) |
| **Arena type** | `cyber_city` |

**PRIMARY OBJECTIVE**  
Light and find targets in dark hospital zone..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
state machines, timing — *Mode 8 teaches state machines before harder modes stack concepts.*

**ROBOT EDGE**  
Reaches disaster zones ground bots cannot

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Night Searchlight Recon: Light and find targets in dark hospital zone.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 9 — Hazardous Gas Sampling

> **Collect air samples without entering red zones.**

| | |
|---|---|
| **Difficulty** | Hard · Defense |
| **Environment** | Burning City District (`emergency`) |
| **Arena type** | `snow_rescue` |

**PRIMARY OBJECTIVE**  
Collect air samples without entering red zones..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
timing, optimization — *Mode 9 teaches timing before harder modes stack concepts.*

**ROBOT EDGE**  
Reaches disaster zones ground bots cannot

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Hazardous Gas Sampling: Collect air samples without entering red zones.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 10 — Hero Rescue Medal (CAPSTONE)

> **Capstone multi-victim rescue mission.**

| | |
|---|---|
| **Difficulty** | Expert · Hybrid |
| **Environment** | Burning City District (`emergency`) |
| **Arena type** | `firebot_blaze` |

**PRIMARY OBJECTIVE**  
Capstone multi-victim rescue mission..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~15 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
optimization, sequential blocks — *Mode 10 teaches optimization before harder modes stack concepts.*

**ROBOT EDGE**  
Reaches disaster zones ground bots cannot

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Hero Rescue Medal: Capstone multi-victim rescue mission.

**WIN MOMENT**  
Goal marker flashes green + star popup; mastery badge + confetti.


---

## HELICOPTER 🚁 — Sky Aerial Heavy

### Mode 1 — Heavy Cargo Airlift

> **Lift crate from pad A to oil rig landing zone.**

| | |
|---|---|
| **Difficulty** | Tutorial · Navigation |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `drone_canyon` |

**PRIMARY OBJECTIVE**  
Lift crate from pad A to oil rig landing zone..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~3 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sequential blocks, variables — *Mode 1 teaches sequential blocks before harder modes stack concepts.*

**ROBOT EDGE**  
Places heavy payloads on rooftops

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Heavy Cargo Airlift: Lift crate from pad A to oil rig landing zone.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 2 — Offshore Oil Rig Landing

> **Land on moving platform in crosswind.**

| | |
|---|---|
| **Difficulty** | Easy · Challenge |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `canyon_flight` |

**PRIMARY OBJECTIVE**  
Land on moving platform in crosswind..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~5 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
variables, loops — *Mode 2 teaches variables before harder modes stack concepts.*

**ROBOT EDGE**  
Places heavy payloads on rooftops

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Offshore Oil Rig Landing: Land on moving platform in crosswind.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 3 — Water Bucket Fire Suppression

> **Fill bucket and dump on firebot_blaze targets.**

| | |
|---|---|
| **Difficulty** | Easy · Combat |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `storm_cloud` |

**PRIMARY OBJECTIVE**  
Fill bucket and dump on firebot_blaze targets..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~6 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
loops, if/else — *Mode 3 teaches loops before harder modes stack concepts.*

**ROBOT EDGE**  
Places heavy payloads on rooftops

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Water Bucket Fire Suppression: Fill bucket and dump on firebot_blaze targets.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 4 — Mountain Top Insertion

> **Insert team at summit waypoint in canyon flight.**

| | |
|---|---|
| **Difficulty** | Medium · Patrol |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `cloud_race` |

**PRIMARY OBJECTIVE**  
Insert team at summit waypoint in canyon flight..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
if/else, sensors — *Mode 4 teaches if/else before harder modes stack concepts.*

**ROBOT EDGE**  
Places heavy payloads on rooftops

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Mountain Top Insertion: Insert team at summit waypoint in canyon flight.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 5 — Rotor Pitch Control

> **Hold hover while pitch meter stays in green.**

| | |
|---|---|
| **Difficulty** | Medium · Race |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `space_orbit` |

**PRIMARY OBJECTIVE**  
Hold hover while pitch meter stays in green..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sensors, events — *Mode 5 teaches sensors before harder modes stack concepts.*

**ROBOT EDGE**  
Places heavy payloads on rooftops

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Rotor Pitch Control: Hold hover while pitch meter stays in green.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 6 — Construction Girder Placement

> **Place steel beam on marked hooks.**

| | |
|---|---|
| **Difficulty** | Medium · Delivery |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `flight_rings` |

**PRIMARY OBJECTIVE**  
Place steel beam on marked hooks..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
events, functions — *Mode 6 teaches events before harder modes stack concepts.*

**ROBOT EDGE**  
Places heavy payloads on rooftops

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Construction Girder Placement: Place steel beam on marked hooks.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 7 — Long Haul Fuel Flight

> **Reach distant pad before fuel runs out.**

| | |
|---|---|
| **Difficulty** | Hard · Exploration |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `jet_stunt` |

**PRIMARY OBJECTIVE**  
Reach distant pad before fuel runs out..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
functions, state machines — *Mode 7 teaches functions before harder modes stack concepts.*

**ROBOT EDGE**  
Places heavy payloads on rooftops

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Fuel gauge
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Long Haul Fuel Flight: Reach distant pad before fuel runs out.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 8 — Emergency Medevac Transport

> **Pick up patient from hospital_walk zone.**

| | |
|---|---|
| **Difficulty** | Hard · Survival |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `rooftop_delivery` |

**PRIMARY OBJECTIVE**  
Pick up patient from hospital_walk zone..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
state machines, timing — *Mode 8 teaches state machines before harder modes stack concepts.*

**ROBOT EDGE**  
Places heavy payloads on rooftops

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Emergency Medevac Transport: Pick up patient from hospital_walk zone.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 9 — Vehicle Recovery Winch

> **Winch stranded rover from crater.**

| | |
|---|---|
| **Difficulty** | Hard · Stunt |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `typhoon` |

**PRIMARY OBJECTIVE**  
Winch stranded rover from crater..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
timing, optimization — *Mode 9 teaches timing before harder modes stack concepts.*

**ROBOT EDGE**  
Places heavy payloads on rooftops

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Vehicle Recovery Winch: Winch stranded rover from crater.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 10 — Sky Crane Master (CAPSTONE)

> **Capstone lift + land + medevac chain.**

| | |
|---|---|
| **Difficulty** | Expert · Hybrid |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `warp_gate` |

**PRIMARY OBJECTIVE**  
Capstone lift + land + medevac chain..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~15 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
optimization, sequential blocks — *Mode 10 teaches optimization before harder modes stack concepts.*

**ROBOT EDGE**  
Places heavy payloads on rooftops

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Sky Crane Master: Capstone lift + land + medevac chain.

**WIN MOMENT**  
Goal marker flashes green + star popup; mastery badge + confetti.


---

## HOVER BOT 🛸 — Anti-Gravity Sci-Fi

### Mode 1 — Anti-Gravity Glide

> **Glide frictionless across the sky arena gap.**

| | |
|---|---|
| **Difficulty** | Tutorial · Navigation |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `drone_canyon` |

**PRIMARY OBJECTIVE**  
Glide frictionless across the sky arena gap..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~3 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sequential blocks, variables — *Mode 1 teaches sequential blocks before harder modes stack concepts.*

**ROBOT EDGE**  
Smooth traversal over gaps

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Anti-Gravity Glide: Glide frictionless across the sky arena gap.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 2 — Repulsor Field Push

> **Push debris blocks off the hover lane.**

| | |
|---|---|
| **Difficulty** | Easy · Challenge |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `canyon_flight` |

**PRIMARY OBJECTIVE**  
Push debris blocks off the hover lane..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~5 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
variables, loops — *Mode 2 teaches variables before harder modes stack concepts.*

**ROBOT EDGE**  
Smooth traversal over gaps

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Repulsor Field Push: Push debris blocks off the hover lane.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 3 — Magnet Rail Hover

> **Lock onto mag-rail and follow the circuit.**

| | |
|---|---|
| **Difficulty** | Easy · Combat |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `storm_cloud` |

**PRIMARY OBJECTIVE**  
Lock onto mag-rail and follow the circuit..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~6 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
loops, if/else — *Mode 3 teaches loops before harder modes stack concepts.*

**ROBOT EDGE**  
Smooth traversal over gaps

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Magnet Rail Hover: Lock onto mag-rail and follow the circuit.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 4 — Zero-G Physics Room

> **Navigate zero_g chamber without touching walls.**

| | |
|---|---|
| **Difficulty** | Medium · Patrol |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `cloud_race` |

**PRIMARY OBJECTIVE**  
Navigate zero_g chamber without touching walls..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
if/else, sensors — *Mode 4 teaches if/else before harder modes stack concepts.*

**ROBOT EDGE**  
Smooth traversal over gaps

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Zero-G Physics Room: Navigate zero_g chamber without touching walls.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 5 — Hover Height Calibration

> **Hold 3 different altitudes at markers.**

| | |
|---|---|
| **Difficulty** | Medium · Race |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `space_orbit` |

**PRIMARY OBJECTIVE**  
Hold 3 different altitudes at markers..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sensors, events — *Mode 5 teaches sensors before harder modes stack concepts.*

**ROBOT EDGE**  
Smooth traversal over gaps

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Hover Height Calibration: Hold 3 different altitudes at markers.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 6 — Smooth Banked Glide

> **Bank through cloud race turns smoothly.**

| | |
|---|---|
| **Difficulty** | Medium · Delivery |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `flight_rings` |

**PRIMARY OBJECTIVE**  
Bank through cloud race turns smoothly..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
events, functions — *Mode 6 teaches events before harder modes stack concepts.*

**ROBOT EDGE**  
Smooth traversal over gaps

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Smooth Banked Glide: Bank through cloud race turns smoothly.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 7 — Energy Shield Bounce

> **Bounce off shields to reach high platforms.**

| | |
|---|---|
| **Difficulty** | Hard · Exploration |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `jet_stunt` |

**PRIMARY OBJECTIVE**  
Bounce off shields to reach high platforms..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
functions, state machines — *Mode 7 teaches functions before harder modes stack concepts.*

**ROBOT EDGE**  
Smooth traversal over gaps

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Energy Shield Bounce: Bounce off shields to reach high platforms.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 8 — Plasma Thruster Boost

> **Chain boost pads on drone canyon course.**

| | |
|---|---|
| **Difficulty** | Hard · Survival |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `rooftop_delivery` |

**PRIMARY OBJECTIVE**  
Chain boost pads on drone canyon course..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
state machines, timing — *Mode 8 teaches state machines before harder modes stack concepts.*

**ROBOT EDGE**  
Smooth traversal over gaps

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Plasma Thruster Boost: Chain boost pads on drone canyon course.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 9 — Chasm Crossing Glide

> **Cross widest gap on single battery charge.**

| | |
|---|---|
| **Difficulty** | Hard · Stunt |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `typhoon` |

**PRIMARY OBJECTIVE**  
Cross widest gap on single battery charge..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
timing, optimization — *Mode 9 teaches timing before harder modes stack concepts.*

**ROBOT EDGE**  
Smooth traversal over gaps

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Chasm Crossing Glide: Cross widest gap on single battery charge.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 10 — Anti-Gravity Master (CAPSTONE)

> **Capstone glide + boost + precision landing.**

| | |
|---|---|
| **Difficulty** | Expert · Hybrid |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `warp_gate` |

**PRIMARY OBJECTIVE**  
Capstone glide + boost + precision landing..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~15 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
optimization, sequential blocks — *Mode 10 teaches optimization before harder modes stack concepts.*

**ROBOT EDGE**  
Smooth traversal over gaps

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Anti-Gravity Master: Capstone glide + boost + precision landing.

**WIN MOMENT**  
Goal marker flashes green + star popup; mastery badge + confetti.


---

## HOVER RACER 🏁 — Neon Sky Speedway

### Mode 1 — Quantum Speedway Grand Prix

> **Rainbow Road lap 1 — plasma hover tires.**

| | |
|---|---|
| **Difficulty** | Tutorial · Race |
| **Environment** | Sky & Neon Circuit (`hybrid_race_sky`) |
| **Arena type** | `rainbow_road` |

**PRIMARY OBJECTIVE**  
Rainbow Road lap 1 — plasma hover tires..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~3 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sequential blocks, variables — *Mode 1 teaches sequential blocks before harder modes stack concepts.*

**ROBOT EDGE**  
Quantum speedway + sky hybrid tracks

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  
The active circuit is Rainbow Road: a Mario Kart–quality 3D ribbon track with glossy glass tiles, neon guardrails, checkpoint arches, and boost pads. Stars and nebula skies frame the course.

**INTERACT IN WORLD**  
Quantum Speedway Grand Prix: Rainbow Road lap 1 — plasma hover tires.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 2 — Mach 1 Speed Test

> **Break speed record on sunny_circuit straight.**

| | |
|---|---|
| **Difficulty** | Easy · Navigation |
| **Environment** | Sky & Neon Circuit (`hybrid_race_sky`) |
| **Arena type** | `drone_canyon` |

**PRIMARY OBJECTIVE**  
Break speed record on sunny_circuit straight..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~5 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
variables, loops — *Mode 2 teaches variables before harder modes stack concepts.*

**ROBOT EDGE**  
Quantum speedway + sky hybrid tracks

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Speed readout
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Mach 1 Speed Test: Break speed record on sunny_circuit straight.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 3 — Plasma Drift Cornering

> **Drift every corner on Dragon Skyway.**

| | |
|---|---|
| **Difficulty** | Easy · Race |
| **Environment** | Sky & Neon Circuit (`hybrid_race_sky`) |
| **Arena type** | `sunny_circuit` |

**PRIMARY OBJECTIVE**  
Drift every corner on Dragon Skyway..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~6 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
loops, if/else — *Mode 3 teaches loops before harder modes stack concepts.*

**ROBOT EDGE**  
Quantum speedway + sky hybrid tracks

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  
The active circuit is Candy Kingdom: a Mario Kart–quality 3D ribbon track with glossy glass tiles, neon guardrails, checkpoint arches, and boost pads. Stars and nebula skies frame the course.

**INTERACT IN WORLD**  
Plasma Drift Cornering: Drift every corner on Dragon Skyway.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 4 — Energy Pad Recharge

> **Hit all recharge pads before battery empty.**

| | |
|---|---|
| **Difficulty** | Medium · Navigation |
| **Environment** | Sky & Neon Circuit (`hybrid_race_sky`) |
| **Arena type** | `cloud_race` |

**PRIMARY OBJECTIVE**  
Hit all recharge pads before battery empty..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
if/else, sensors — *Mode 4 teaches if/else before harder modes stack concepts.*

**ROBOT EDGE**  
Quantum speedway + sky hybrid tracks

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Energy Pad Recharge: Hit all recharge pads before battery empty.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 5 — Sonic Boom Slalom

> **Slalom rings in storm_cloud corridor.**

| | |
|---|---|
| **Difficulty** | Medium · Race |
| **Environment** | Sky & Neon Circuit (`hybrid_race_sky`) |
| **Arena type** | `dragon_skyway` |

**PRIMARY OBJECTIVE**  
Slalom rings in storm_cloud corridor..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sensors, events — *Mode 5 teaches sensors before harder modes stack concepts.*

**ROBOT EDGE**  
Quantum speedway + sky hybrid tracks

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  
The active circuit is Dragon Skyway: a Mario Kart–quality 3D ribbon track with glossy glass tiles, neon guardrails, checkpoint arches, and boost pads. Stars and nebula skies frame the course.

**INTERACT IN WORLD**  
Sonic Boom Slalom: Slalom rings in storm_cloud corridor.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 6 — Elimination Hover Sprint

> **Stay ahead as last-place gates close.**

| | |
|---|---|
| **Difficulty** | Medium · Navigation |
| **Environment** | Sky & Neon Circuit (`hybrid_race_sky`) |
| **Arena type** | `flight_rings` |

**PRIMARY OBJECTIVE**  
Stay ahead as last-place gates close..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
events, functions — *Mode 6 teaches events before harder modes stack concepts.*

**ROBOT EDGE**  
Quantum speedway + sky hybrid tracks

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Elimination Hover Sprint: Stay ahead as last-place gates close.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 7 — Warp Tunnel Burst

> **Navigate warp_gate tunnel at max speed.**

| | |
|---|---|
| **Difficulty** | Hard · Race |
| **Environment** | Sky & Neon Circuit (`hybrid_race_sky`) |
| **Arena type** | `volcano_drift` |

**PRIMARY OBJECTIVE**  
Navigate warp_gate tunnel at max speed..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
functions, state machines — *Mode 7 teaches functions before harder modes stack concepts.*

**ROBOT EDGE**  
Quantum speedway + sky hybrid tracks

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Speed readout
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  
The active circuit is Volcano Drift: a Mario Kart–quality 3D ribbon track with glossy glass tiles, neon guardrails, checkpoint arches, and boost pads. Stars and nebula skies frame the course.

**INTERACT IN WORLD**  
Warp Tunnel Burst: Navigate warp_gate tunnel at max speed.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 8 — Mag-Strip Inversion

> **Complete inverted mag-strip section upside-down.**

| | |
|---|---|
| **Difficulty** | Hard · Survival |
| **Environment** | Sky & Neon Circuit (`hybrid_race_sky`) |
| **Arena type** | `storm_cloud` |

**PRIMARY OBJECTIVE**  
Complete inverted mag-strip section upside-down..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
state machines, timing — *Mode 8 teaches state machines before harder modes stack concepts.*

**ROBOT EDGE**  
Quantum speedway + sky hybrid tracks

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Mag-Strip Inversion: Complete inverted mag-strip section upside-down.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 9 — Turbo Slipstream Chase

> **Draft behind ghost racer then overtake.**

| | |
|---|---|
| **Difficulty** | Hard · Race |
| **Environment** | Sky & Neon Circuit (`hybrid_race_sky`) |
| **Arena type** | `street_grand_prix` |

**PRIMARY OBJECTIVE**  
Draft behind ghost racer then overtake..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
timing, optimization — *Mode 9 teaches timing before harder modes stack concepts.*

**ROBOT EDGE**  
Quantum speedway + sky hybrid tracks

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  
The active circuit is Rainbow Road Grand Prix: a Mario Kart–quality 3D ribbon track with glossy glass tiles, neon guardrails, checkpoint arches, and boost pads. Stars and nebula skies frame the course.

**INTERACT IN WORLD**  
Turbo Slipstream Chase: Draft behind ghost racer then overtake.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 10 — Galactic Turbo Champion (CAPSTONE)

> **Championship on street_grand_prix finale.**

| | |
|---|---|
| **Difficulty** | Expert · Hybrid |
| **Environment** | Sky & Neon Circuit (`hybrid_race_sky`) |
| **Arena type** | `warp_gate` |

**PRIMARY OBJECTIVE**  
Championship on street_grand_prix finale..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~15 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
optimization, sequential blocks — *Mode 10 teaches optimization before harder modes stack concepts.*

**ROBOT EDGE**  
Quantum speedway + sky hybrid tracks

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Galactic Turbo Champion: Championship on street_grand_prix finale.

**WIN MOMENT**  
Goal marker flashes green + star popup; mastery badge + confetti.


---

## SUB DRONE 🌊 — Underwater

### Mode 1 — Coral Reef Survey

> **Scan 10 marine species in the coral_reef.**

| | |
|---|---|
| **Difficulty** | Tutorial · Exploration |
| **Environment** | Abyssal Ocean Trench (`underwater`) |
| **Arena type** | `coral_reef` |

**PRIMARY OBJECTIVE**  
Scan 10 marine species in the coral_reef..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~3 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sequential blocks, variables — *Mode 1 teaches sequential blocks before harder modes stack concepts.*

**ROBOT EDGE**  
Stable in currents with depth control

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Coral Reef Survey: Scan 10 marine species in the coral_reef.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 2 — Deep Trench Navigation

> **Navigate deep_trench without crushing pressure.**

| | |
|---|---|
| **Difficulty** | Easy · Navigation |
| **Environment** | Abyssal Ocean Trench (`underwater`) |
| **Arena type** | `deep_trench` |

**PRIMARY OBJECTIVE**  
Navigate deep_trench without crushing pressure..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~5 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
variables, loops — *Mode 2 teaches variables before harder modes stack concepts.*

**ROBOT EDGE**  
Stable in currents with depth control

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Deep Trench Navigation: Navigate deep_trench without crushing pressure.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 3 — Submarine Buoyancy Control

> **Trim buoyancy to hold depth at markers.**

| | |
|---|---|
| **Difficulty** | Easy · Challenge |
| **Environment** | Abyssal Ocean Trench (`underwater`) |
| **Arena type** | `kelp_forest` |

**PRIMARY OBJECTIVE**  
Trim buoyancy to hold depth at markers..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~6 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
loops, if/else — *Mode 3 teaches loops before harder modes stack concepts.*

**ROBOT EDGE**  
Stable in currents with depth control

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Submarine Buoyancy Control: Trim buoyancy to hold depth at markers.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 4 — Sunken Shipwreck Explore

> **Explore shipwreck and tag 5 artifacts.**

| | |
|---|---|
| **Difficulty** | Medium · Exploration |
| **Environment** | Abyssal Ocean Trench (`underwater`) |
| **Arena type** | `robot_reef` |

**PRIMARY OBJECTIVE**  
Explore shipwreck and tag 5 artifacts..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
if/else, sensors — *Mode 4 teaches if/else before harder modes stack concepts.*

**ROBOT EDGE**  
Stable in currents with depth control

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Sunken Shipwreck Explore: Explore shipwreck and tag 5 artifacts.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 5 — Hydro-Current Survival

> **Ride currents through kelp_forest maze.**

| | |
|---|---|
| **Difficulty** | Medium · Survival |
| **Environment** | Abyssal Ocean Trench (`underwater`) |
| **Arena type** | `atlantis` |

**PRIMARY OBJECTIVE**  
Ride currents through kelp_forest maze..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sensors, events — *Mode 5 teaches sensors before harder modes stack concepts.*

**ROBOT EDGE**  
Stable in currents with depth control

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Hydro-Current Survival: Ride currents through kelp_forest maze.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 6 — Underwater Sonar Mapping

> **Map seafloor_scan grid completely.**

| | |
|---|---|
| **Difficulty** | Medium · Puzzle |
| **Environment** | Abyssal Ocean Trench (`underwater`) |
| **Arena type** | `mariana` |

**PRIMARY OBJECTIVE**  
Map seafloor_scan grid completely..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
events, functions — *Mode 6 teaches events before harder modes stack concepts.*

**ROBOT EDGE**  
Stable in currents with depth control

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Underwater Sonar Mapping: Map seafloor_scan grid completely.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 7 — Marine Trash Collection

> **Collect 12 trash items from robot_reef.**

| | |
|---|---|
| **Difficulty** | Hard · Collection |
| **Environment** | Abyssal Ocean Trench (`underwater`) |
| **Arena type** | `shipwreck` |

**PRIMARY OBJECTIVE**  
Collect 12 trash items from robot_reef..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
functions, state machines — *Mode 7 teaches functions before harder modes stack concepts.*

**ROBOT EDGE**  
Stable in currents with depth control

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Marine Trash Collection: Collect 12 trash items from robot_reef.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 8 — Bioluminescent Trail Follow

> **Follow bioluminescent path in darkness.**

| | |
|---|---|
| **Difficulty** | Hard · Navigation |
| **Environment** | Abyssal Ocean Trench (`underwater`) |
| **Arena type** | `bioluminescent` |

**PRIMARY OBJECTIVE**  
Follow bioluminescent path in darkness..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
state machines, timing — *Mode 8 teaches state machines before harder modes stack concepts.*

**ROBOT EDGE**  
Stable in currents with depth control

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Bioluminescent Trail Follow: Follow bioluminescent path in darkness.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 9 — Thermal Vent Sample

> **Grab sample near vent without overheating hull.**

| | |
|---|---|
| **Difficulty** | Hard · Science |
| **Environment** | Abyssal Ocean Trench (`underwater`) |
| **Arena type** | `pirate_wreck` |

**PRIMARY OBJECTIVE**  
Grab sample near vent without overheating hull..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
timing, optimization — *Mode 9 teaches timing before harder modes stack concepts.*

**ROBOT EDGE**  
Stable in currents with depth control

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Thermal Vent Sample: Grab sample near vent without overheating hull.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 10 — Ocean Floor Master (CAPSTONE)

> **Capstone reef + trench + wreck expedition.**

| | |
|---|---|
| **Difficulty** | Expert · Hybrid |
| **Environment** | Abyssal Ocean Trench (`underwater`) |
| **Arena type** | `seafloor_scan` |

**PRIMARY OBJECTIVE**  
Capstone reef + trench + wreck expedition..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~15 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
optimization, sequential blocks — *Mode 10 teaches optimization before harder modes stack concepts.*

**ROBOT EDGE**  
Stable in currents with depth control

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Ocean Floor Master: Capstone reef + trench + wreck expedition.

**WIN MOMENT**  
Goal marker flashes green + star popup; mastery badge + confetti.


---

## DEEP SEA BOT 🐙 — Underwater Abyss

### Mode 1 — Abyssal Zone Pressure Test

> **Descend mariana trench within hull limits.**

| | |
|---|---|
| **Difficulty** | Tutorial · Exploration |
| **Environment** | Abyssal Ocean Trench (`underwater`) |
| **Arena type** | `coral_reef` |

**PRIMARY OBJECTIVE**  
Descend mariana trench within hull limits..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~3 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sequential blocks, variables — *Mode 1 teaches sequential blocks before harder modes stack concepts.*

**ROBOT EDGE**  
Operates in crushing deep trenches

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Abyssal Zone Pressure Test: Descend mariana trench within hull limits.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 2 — Giant Squid Evasion

> **Evade squid in atlantis ruins corridor.**

| | |
|---|---|
| **Difficulty** | Easy · Navigation |
| **Environment** | Abyssal Ocean Trench (`underwater`) |
| **Arena type** | `deep_trench` |

**PRIMARY OBJECTIVE**  
Evade squid in atlantis ruins corridor..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~5 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
variables, loops — *Mode 2 teaches variables before harder modes stack concepts.*

**ROBOT EDGE**  
Operates in crushing deep trenches

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Giant Squid Evasion: Evade squid in atlantis ruins corridor.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 3 — Seafloor Ore Mining

> **Mine 8 nodes on abyssal plain.**

| | |
|---|---|
| **Difficulty** | Easy · Challenge |
| **Environment** | Abyssal Ocean Trench (`underwater`) |
| **Arena type** | `kelp_forest` |

**PRIMARY OBJECTIVE**  
Mine 8 nodes on abyssal plain..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~6 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
loops, if/else — *Mode 3 teaches loops before harder modes stack concepts.*

**ROBOT EDGE**  
Operates in crushing deep trenches

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Seafloor Ore Mining: Mine 8 nodes on abyssal plain.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 4 — Deep Sea Trench Rescue

> **Rescue trapped bot in trench cage.**

| | |
|---|---|
| **Difficulty** | Medium · Exploration |
| **Environment** | Abyssal Ocean Trench (`underwater`) |
| **Arena type** | `robot_reef` |

**PRIMARY OBJECTIVE**  
Rescue trapped bot in trench cage..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
if/else, sensors — *Mode 4 teaches if/else before harder modes stack concepts.*

**ROBOT EDGE**  
Operates in crushing deep trenches

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Deep Sea Trench Rescue: Rescue trapped bot in trench cage.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 5 — Hydrothermal Smoker Exploration

> **Circle smokers without hull damage.**

| | |
|---|---|
| **Difficulty** | Medium · Survival |
| **Environment** | Abyssal Ocean Trench (`underwater`) |
| **Arena type** | `atlantis` |

**PRIMARY OBJECTIVE**  
Circle smokers without hull damage..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sensors, events — *Mode 5 teaches sensors before harder modes stack concepts.*

**ROBOT EDGE**  
Operates in crushing deep trenches

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Hydrothermal Smoker Exploration: Circle smokers without hull damage.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 6 — Sub-Surface Headlight Search

> **Find relics using headlights only.**

| | |
|---|---|
| **Difficulty** | Medium · Puzzle |
| **Environment** | Abyssal Ocean Trench (`underwater`) |
| **Arena type** | `mariana` |

**PRIMARY OBJECTIVE**  
Find relics using headlights only..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
events, functions — *Mode 6 teaches events before harder modes stack concepts.*

**ROBOT EDGE**  
Operates in crushing deep trenches

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Sub-Surface Headlight Search: Find relics using headlights only.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 7 — Ancient Ruin Artifact Grab

> **Retrieve artifact from pirate_wreck.**

| | |
|---|---|
| **Difficulty** | Hard · Collection |
| **Environment** | Abyssal Ocean Trench (`underwater`) |
| **Arena type** | `shipwreck` |

**PRIMARY OBJECTIVE**  
Retrieve artifact from pirate_wreck..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
functions, state machines — *Mode 7 teaches functions before harder modes stack concepts.*

**ROBOT EDGE**  
Operates in crushing deep trenches

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Ancient Ruin Artifact Grab: Retrieve artifact from pirate_wreck.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 8 — Submarine Pipeline Sealer

> **Seal 4 pipeline cracks underwater.**

| | |
|---|---|
| **Difficulty** | Hard · Navigation |
| **Environment** | Abyssal Ocean Trench (`underwater`) |
| **Arena type** | `bioluminescent` |

**PRIMARY OBJECTIVE**  
Seal 4 pipeline cracks underwater..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
state machines, timing — *Mode 8 teaches state machines before harder modes stack concepts.*

**ROBOT EDGE**  
Operates in crushing deep trenches

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Submarine Pipeline Sealer: Seal 4 pipeline cracks underwater.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 9 — Deep Sea Anglerfish Lure

> **Avoid lures while crossing dark zone.**

| | |
|---|---|
| **Difficulty** | Hard · Science |
| **Environment** | Abyssal Ocean Trench (`underwater`) |
| **Arena type** | `pirate_wreck` |

**PRIMARY OBJECTIVE**  
Avoid lures while crossing dark zone..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
timing, optimization — *Mode 9 teaches timing before harder modes stack concepts.*

**ROBOT EDGE**  
Operates in crushing deep trenches

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Deep Sea Anglerfish Lure: Avoid lures while crossing dark zone.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 10 — Master of the Abyss (CAPSTONE)

> **Capstone abyss run: mine, rescue, seal.**

| | |
|---|---|
| **Difficulty** | Expert · Hybrid |
| **Environment** | Abyssal Ocean Trench (`underwater`) |
| **Arena type** | `seafloor_scan` |

**PRIMARY OBJECTIVE**  
Capstone abyss run: mine, rescue, seal..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~15 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
optimization, sequential blocks — *Mode 10 teaches optimization before harder modes stack concepts.*

**ROBOT EDGE**  
Operates in crushing deep trenches

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Master of the Abyss: Capstone abyss run: mine, rescue, seal.

**WIN MOMENT**  
Goal marker flashes green + star popup; mastery badge + confetti.


---

## ROBOT ARM 🦿 — Industrial Workbench

### Mode 1 — Micro-Chip Soldering

> **Place solder on 6 micro pads in factory zone.**

| | |
|---|---|
| **Difficulty** | Tutorial · Simulation |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `auto_factory` |

**PRIMARY OBJECTIVE**  
Place solder on 6 micro pads in factory zone..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~3 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sequential blocks, variables — *Mode 1 teaches sequential blocks before harder modes stack concepts.*

**ROBOT EDGE**  
Micro tasks impossible for mobile bots

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Micro-Chip Soldering: Place solder on 6 micro pads in factory zone.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 2 — Precision Pick-and-Place

> **Move chips from feeder to PCB slots.**

| | |
|---|---|
| **Difficulty** | Easy · Logistics |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `factory_floor` |

**PRIMARY OBJECTIVE**  
Move chips from feeder to PCB slots..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~5 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
variables, loops — *Mode 2 teaches variables before harder modes stack concepts.*

**ROBOT EDGE**  
Micro tasks impossible for mobile bots

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Precision Pick-and-Place: Move chips from feeder to PCB slots.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 3 — Rubik's Cube Solver

> **Execute scripted twist sequence on cube.**

| | |
|---|---|
| **Difficulty** | Easy · Quality |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `warehouse` |

**PRIMARY OBJECTIVE**  
Execute scripted twist sequence on cube..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~6 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
loops, if/else — *Mode 3 teaches loops before harder modes stack concepts.*

**ROBOT EDGE**  
Micro tasks impossible for mobile bots

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Rubik's Cube Solver: Execute scripted twist sequence on cube.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 4 — High-Precision Drawing

> **Trace the pattern on the drawing pad.**

| | |
|---|---|
| **Difficulty** | Medium · Synchronization |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `underground_mine` |

**PRIMARY OBJECTIVE**  
Trace the pattern on the drawing pad..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
if/else, sensors — *Mode 4 teaches if/else before harder modes stack concepts.*

**ROBOT EDGE**  
Micro tasks impossible for mobile bots

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
High-Precision Drawing: Trace the pattern on the drawing pad.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 5 — Surgical Threading

> **Thread needle through 4 eye loops.**

| | |
|---|---|
| **Difficulty** | Medium · Industrial |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `power_garden` |

**PRIMARY OBJECTIVE**  
Thread needle through 4 eye loops..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sensors, events — *Mode 5 teaches sensors before harder modes stack concepts.*

**ROBOT EDGE**  
Micro tasks impossible for mobile bots

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Surgical Threading: Thread needle through 4 eye loops.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 6 — Stack the Blocks

> **Stack 8 blocks without toppling tower.**

| | |
|---|---|
| **Difficulty** | Medium · Navigation |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `pipeline_crawl` |

**PRIMARY OBJECTIVE**  
Stack 8 blocks without toppling tower..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
events, functions — *Mode 6 teaches events before harder modes stack concepts.*

**ROBOT EDGE**  
Micro tasks impossible for mobile bots

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Stack the Blocks: Stack 8 blocks without toppling tower.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 7 — Conveyor Belt Sorting

> **Sort red/blue parts on moving belt.**

| | |
|---|---|
| **Difficulty** | Hard · Hazard |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `urban_obstacle` |

**PRIMARY OBJECTIVE**  
Sort red/blue parts on moving belt..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
functions, state machines — *Mode 7 teaches functions before harder modes stack concepts.*

**ROBOT EDGE**  
Micro tasks impossible for mobile bots

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Conveyor Belt Sorting: Sort red/blue parts on moving belt.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 8 — Glassware Pouring Test

> **Pour liquid to line without spilling.**

| | |
|---|---|
| **Difficulty** | Hard · Emergency |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `factory_floor` |

**PRIMARY OBJECTIVE**  
Pour liquid to line without spilling..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
state machines, timing — *Mode 8 teaches state machines before harder modes stack concepts.*

**ROBOT EDGE**  
Micro tasks impossible for mobile bots

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Glassware Pouring Test: Pour liquid to line without spilling.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 9 — Chess Piece Master

> **Move pieces to checkmate puzzle positions.**

| | |
|---|---|
| **Difficulty** | Hard · Packaging |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `auto_factory` |

**PRIMARY OBJECTIVE**  
Move pieces to checkmate puzzle positions..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
timing, optimization — *Mode 9 teaches timing before harder modes stack concepts.*

**ROBOT EDGE**  
Micro tasks impossible for mobile bots

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Chess Piece Master: Move pieces to checkmate puzzle positions.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 10 — Surgical Precision Master (CAPSTONE)

> **Capstone: pick, place, pour, stack chain.**

| | |
|---|---|
| **Difficulty** | Expert · Mastery |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `colosseum` |

**PRIMARY OBJECTIVE**  
Capstone: pick, place, pour, stack chain..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~15 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
optimization, sequential blocks — *Mode 10 teaches optimization before harder modes stack concepts.*

**ROBOT EDGE**  
Micro tasks impossible for mobile bots

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Surgical Precision Master: Capstone: pick, place, pour, stack chain.

**WIN MOMENT**  
Goal marker flashes green + star popup; mastery badge + confetti.


---

## FACTORY BOT 🏭 — Industrial AGV

### Mode 1 — Assembly Line Production

> **Assemble 10 units on the factory_floor line.**

| | |
|---|---|
| **Difficulty** | Tutorial · Simulation |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `auto_factory` |

**PRIMARY OBJECTIVE**  
Assemble 10 units on the factory_floor line..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~3 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sequential blocks, variables — *Mode 1 teaches sequential blocks before harder modes stack concepts.*

**ROBOT EDGE**  
Keeps pace with factory timing

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Assembly Line Production: Assemble 10 units on the factory_floor line.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 2 — Box Stacking Warehouse

> **Stack boxes in warehouse to height target.**

| | |
|---|---|
| **Difficulty** | Easy · Logistics |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `factory_floor` |

**PRIMARY OBJECTIVE**  
Stack boxes in warehouse to height target..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~5 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
variables, loops — *Mode 2 teaches variables before harder modes stack concepts.*

**ROBOT EDGE**  
Keeps pace with factory timing

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Box Stacking Warehouse: Stack boxes in warehouse to height target.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 3 — Quality Control Inspection

> **Reject defective parts at QC gate.**

| | |
|---|---|
| **Difficulty** | Easy · Quality |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `warehouse` |

**PRIMARY OBJECTIVE**  
Reject defective parts at QC gate..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~6 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
loops, if/else — *Mode 3 teaches loops before harder modes stack concepts.*

**ROBOT EDGE**  
Keeps pace with factory timing

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Quality Control Inspection: Reject defective parts at QC gate.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 4 — Robot Arm Synchronization

> **Sync with second arm — no collisions.**

| | |
|---|---|
| **Difficulty** | Medium · Synchronization |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `underground_mine` |

**PRIMARY OBJECTIVE**  
Sync with second arm — no collisions..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
if/else, sensors — *Mode 4 teaches if/else before harder modes stack concepts.*

**ROBOT EDGE**  
Keeps pace with factory timing

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Robot Arm Synchronization: Sync with second arm — no collisions.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 5 — Industrial Stamping Press

> **Time stamp presses on conveyor items.**

| | |
|---|---|
| **Difficulty** | Medium · Industrial |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `power_garden` |

**PRIMARY OBJECTIVE**  
Time stamp presses on conveyor items..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sensors, events — *Mode 5 teaches sensors before harder modes stack concepts.*

**ROBOT EDGE**  
Keeps pace with factory timing

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Industrial Stamping Press: Time stamp presses on conveyor items.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 6 — Automated Guided Vehicle Route

> **Follow AGV path through plant.**

| | |
|---|---|
| **Difficulty** | Medium · Navigation |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `pipeline_crawl` |

**PRIMARY OBJECTIVE**  
Follow AGV path through plant..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
events, functions — *Mode 6 teaches events before harder modes stack concepts.*

**ROBOT EDGE**  
Keeps pace with factory timing

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Automated Guided Vehicle Route: Follow AGV path through plant.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 7 — Hazardous Material Handling

> **Move hazmat crate without breach.**

| | |
|---|---|
| **Difficulty** | Hard · Hazard |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `urban_obstacle` |

**PRIMARY OBJECTIVE**  
Move hazmat crate without breach..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
functions, state machines — *Mode 7 teaches functions before harder modes stack concepts.*

**ROBOT EDGE**  
Keeps pace with factory timing

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Hazardous Material Handling: Move hazmat crate without breach.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 8 — Factory Emergency Shutdown

> **Hit E-stop sequence in correct order.**

| | |
|---|---|
| **Difficulty** | Hard · Emergency |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `factory_floor` |

**PRIMARY OBJECTIVE**  
Hit E-stop sequence in correct order..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
state machines, timing — *Mode 8 teaches state machines before harder modes stack concepts.*

**ROBOT EDGE**  
Keeps pace with factory timing

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Factory Emergency Shutdown: Hit E-stop sequence in correct order.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 9 — Packaging Machine Wrap

> **Wrap 8 packages before belt overflow.**

| | |
|---|---|
| **Difficulty** | Hard · Packaging |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `auto_factory` |

**PRIMARY OBJECTIVE**  
Wrap 8 packages before belt overflow..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
timing, optimization — *Mode 9 teaches timing before harder modes stack concepts.*

**ROBOT EDGE**  
Keeps pace with factory timing

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Packaging Machine Wrap: Wrap 8 packages before belt overflow.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 10 — Industry 4.0 Efficiency (CAPSTONE)

> **Capstone shift: build, QC, ship, zero defects.**

| | |
|---|---|
| **Difficulty** | Expert · Mastery |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `colosseum` |

**PRIMARY OBJECTIVE**  
Capstone shift: build, QC, ship, zero defects..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~15 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
optimization, sequential blocks — *Mode 10 teaches optimization before harder modes stack concepts.*

**ROBOT EDGE**  
Keeps pace with factory timing

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Industry 4.0 Efficiency: Capstone shift: build, QC, ship, zero defects.

**WIN MOMENT**  
Goal marker flashes green + star popup; mastery badge + confetti.


---

## SPACE ROVER 🚀 — Martian Exploration

### Mode 1 — Lunar Surface Exploration

> **Drive alien_planet rim and tag 6 landmarks.**

| | |
|---|---|
| **Difficulty** | Tutorial · Exploration |
| **Environment** | Red Planet Base (`martian`) |
| **Arena type** | `alien_planet` |

**PRIMARY OBJECTIVE**  
Drive alien_planet rim and tag 6 landmarks..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~3 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sequential blocks, variables — *Mode 1 teaches sequential blocks before harder modes stack concepts.*

**ROBOT EDGE**  
Martian dust and crater rims

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Lunar Surface Exploration: Drive alien_planet rim and tag 6 landmarks.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 2 — Martian Soil Sample Drill

> **Drill 5 sample cores in desert_rally zone.**

| | |
|---|---|
| **Difficulty** | Easy · Science |
| **Environment** | Red Planet Base (`martian`) |
| **Arena type** | `desert_rally` |

**PRIMARY OBJECTIVE**  
Drill 5 sample cores in desert_rally zone..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~5 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
variables, loops — *Mode 2 teaches variables before harder modes stack concepts.*

**ROBOT EDGE**  
Martian dust and crater rims

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Martian Soil Sample Drill: Drill 5 sample cores in desert_rally zone.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 3 — Solar Panel Deployment

> **Deploy panels at 4 station markers.**

| | |
|---|---|
| **Difficulty** | Easy · Construction |
| **Environment** | Red Planet Base (`martian`) |
| **Arena type** | `space_corridor` |

**PRIMARY OBJECTIVE**  
Deploy panels at 4 station markers..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~6 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
loops, if/else — *Mode 3 teaches loops before harder modes stack concepts.*

**ROBOT EDGE**  
Martian dust and crater rims

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Solar Panel Deployment: Deploy panels at 4 station markers.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 4 — Crater Rim Traverse

> **Circle crater on rough terrain without flip.**

| | |
|---|---|
| **Difficulty** | Medium · Navigation |
| **Environment** | Red Planet Base (`martian`) |
| **Arena type** | `lava_canyon` |

**PRIMARY OBJECTIVE**  
Circle crater on rough terrain without flip..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
if/else, sensors — *Mode 4 teaches if/else before harder modes stack concepts.*

**ROBOT EDGE**  
Martian dust and crater rims

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Crater Rim Traverse: Circle crater on rough terrain without flip.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 5 — Dust Storm Navigation

> **Navigate during reduced visibility storm.**

| | |
|---|---|
| **Difficulty** | Medium · Survival |
| **Environment** | Red Planet Base (`martian`) |
| **Arena type** | `alien_planet` |

**PRIMARY OBJECTIVE**  
Navigate during reduced visibility storm..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sensors, events — *Mode 5 teaches sensors before harder modes stack concepts.*

**ROBOT EDGE**  
Martian dust and crater rims

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Dust Storm Navigation: Navigate during reduced visibility storm.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 6 — Moon Base Construction

> **Deliver bricks to base construction pads.**

| | |
|---|---|
| **Difficulty** | Medium · Construction |
| **Environment** | Red Planet Base (`martian`) |
| **Arena type** | `rough` |

**PRIMARY OBJECTIVE**  
Deliver bricks to base construction pads..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
events, functions — *Mode 6 teaches events before harder modes stack concepts.*

**ROBOT EDGE**  
Martian dust and crater rims

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Moon Base Construction: Deliver bricks to base construction pads.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 7 — Alien Fossil Discovery

> **Scan fossils in lava_canyon dig site.**

| | |
|---|---|
| **Difficulty** | Hard · Exploration |
| **Environment** | Red Planet Base (`martian`) |
| **Arena type** | `space_orbit` |

**PRIMARY OBJECTIVE**  
Scan fossils in lava_canyon dig site..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
functions, state machines — *Mode 7 teaches functions before harder modes stack concepts.*

**ROBOT EDGE**  
Martian dust and crater rims

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Alien Fossil Discovery: Scan fossils in lava_canyon dig site.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 8 — Space Communication Array

> **Align rover with comm dish at space_corridor.**

| | |
|---|---|
| **Difficulty** | Hard · Communication |
| **Environment** | Red Planet Base (`martian`) |
| **Arena type** | `desert_rally` |

**PRIMARY OBJECTIVE**  
Align rover with comm dish at space_corridor..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
state machines, timing — *Mode 8 teaches state machines before harder modes stack concepts.*

**ROBOT EDGE**  
Martian dust and crater rims

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Space Communication Array: Align rover with comm dish at space_corridor.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 9 — Rover Battery Conservation

> **Complete route using minimum energy.**

| | |
|---|---|
| **Difficulty** | Hard · Strategy |
| **Environment** | Red Planet Base (`martian`) |
| **Arena type** | `crystal_caverns` |

**PRIMARY OBJECTIVE**  
Complete route using minimum energy..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
timing, optimization — *Mode 9 teaches timing before harder modes stack concepts.*

**ROBOT EDGE**  
Martian dust and crater rims

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Rover Battery Conservation: Complete route using minimum energy.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 10 — Interplanetary Pioneer (CAPSTONE)

> **Capstone Mars mission: drill, build, return.**

| | |
|---|---|
| **Difficulty** | Expert · Hybrid |
| **Environment** | Red Planet Base (`martian`) |
| **Arena type** | `warp_gate` |

**PRIMARY OBJECTIVE**  
Capstone Mars mission: drill, build, return..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~15 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
optimization, sequential blocks — *Mode 10 teaches optimization before harder modes stack concepts.*

**ROBOT EDGE**  
Martian dust and crater rims

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Interplanetary Pioneer: Capstone Mars mission: drill, build, return.

**WIN MOMENT**  
Goal marker flashes green + star popup; mastery badge + confetti.


---

## LEGO BOT 🧱 — Play / Builder

### Mode 1 — Brick Stacking Tower

> **Stack bricks to target height in factory yard.**

| | |
|---|---|
| **Difficulty** | Tutorial · Simulation |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `auto_factory` |

**PRIMARY OBJECTIVE**  
Stack bricks to target height in factory yard..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~3 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sequential blocks, variables — *Mode 1 teaches sequential blocks before harder modes stack concepts.*

**ROBOT EDGE**  
Builds structures block by block

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Brick Stacking Tower: Stack bricks to target height in factory yard.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 2 — Pattern Brick Matching

> **Match the pattern shown on the blueprint.**

| | |
|---|---|
| **Difficulty** | Easy · Logistics |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `factory_floor` |

**PRIMARY OBJECTIVE**  
Match the pattern shown on the blueprint..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~5 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
variables, loops — *Mode 2 teaches variables before harder modes stack concepts.*

**ROBOT EDGE**  
Builds structures block by block

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Pattern Brick Matching: Match the pattern shown on the blueprint.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 3 — LEGO Bridge Construction

> **Span gap with bridge of correct length.**

| | |
|---|---|
| **Difficulty** | Easy · Quality |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `warehouse` |

**PRIMARY OBJECTIVE**  
Span gap with bridge of correct length..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~6 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
loops, if/else — *Mode 3 teaches loops before harder modes stack concepts.*

**ROBOT EDGE**  
Builds structures block by block

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
LEGO Bridge Construction: Span gap with bridge of correct length.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 4 — Gear Mechanism Assembly

> **Insert gears so mechanism spins freely.**

| | |
|---|---|
| **Difficulty** | Medium · Synchronization |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `underground_mine` |

**PRIMARY OBJECTIVE**  
Insert gears so mechanism spins freely..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
if/else, sensors — *Mode 4 teaches if/else before harder modes stack concepts.*

**ROBOT EDGE**  
Builds structures block by block

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Gear Mechanism Assembly: Insert gears so mechanism spins freely.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 5 — Brick Sorting Hopper

> **Sort colors into correct hoppers.**

| | |
|---|---|
| **Difficulty** | Medium · Industrial |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `power_garden` |

**PRIMARY OBJECTIVE**  
Sort colors into correct hoppers..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sensors, events — *Mode 5 teaches sensors before harder modes stack concepts.*

**ROBOT EDGE**  
Builds structures block by block

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Brick Sorting Hopper: Sort colors into correct hoppers.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 6 — LEGO Vehicle Crafting

> **Build drivable mini vehicle on pad.**

| | |
|---|---|
| **Difficulty** | Medium · Navigation |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `pipeline_crawl` |

**PRIMARY OBJECTIVE**  
Build drivable mini vehicle on pad..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
events, functions — *Mode 6 teaches events before harder modes stack concepts.*

**ROBOT EDGE**  
Builds structures block by block

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
LEGO Vehicle Crafting: Build drivable mini vehicle on pad.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 7 — Wall Building Challenge

> **Build wall to cover breach in warehouse.**

| | |
|---|---|
| **Difficulty** | Hard · Hazard |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `urban_obstacle` |

**PRIMARY OBJECTIVE**  
Build wall to cover breach in warehouse..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
functions, state machines — *Mode 7 teaches functions before harder modes stack concepts.*

**ROBOT EDGE**  
Builds structures block by block

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Wall Building Challenge: Build wall to cover breach in warehouse.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 8 — Brick Demolition Smash

> **Clear rubble blocks from the lane.**

| | |
|---|---|
| **Difficulty** | Hard · Emergency |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `factory_floor` |

**PRIMARY OBJECTIVE**  
Clear rubble blocks from the lane..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
state machines, timing — *Mode 8 teaches state machines before harder modes stack concepts.*

**ROBOT EDGE**  
Builds structures block by block

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Brick Demolition Smash: Clear rubble blocks from the lane.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 9 — Robotic Crane Latch

> **Latch and lift beam with crane attachment.**

| | |
|---|---|
| **Difficulty** | Hard · Packaging |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `auto_factory` |

**PRIMARY OBJECTIVE**  
Latch and lift beam with crane attachment..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
timing, optimization — *Mode 9 teaches timing before harder modes stack concepts.*

**ROBOT EDGE**  
Builds structures block by block

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Robotic Crane Latch: Latch and lift beam with crane attachment.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 10 — Master Builder Grand Prize (CAPSTONE)

> **Capstone build: bridge, wall, vehicle.**

| | |
|---|---|
| **Difficulty** | Expert · Mastery |
| **Environment** | Automated Assembly Yard (`industrial`) |
| **Arena type** | `colosseum` |

**PRIMARY OBJECTIVE**  
Capstone build: bridge, wall, vehicle..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~15 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
optimization, sequential blocks — *Mode 10 teaches optimization before harder modes stack concepts.*

**ROBOT EDGE**  
Builds structures block by block

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Master Builder Grand Prize: Capstone build: bridge, wall, vehicle.

**WIN MOMENT**  
Goal marker flashes green + star popup; mastery badge + confetti.


---

## BATTLE MECH ⚔️ — Combat Ring

### Mode 1 — Mech Combat Duel

> **Defeat training mech in robot_fight ring.**

| | |
|---|---|
| **Difficulty** | Tutorial · Combat |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Defeat training mech in robot_fight ring..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~3 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sequential blocks, variables — *Mode 1 teaches sequential blocks before harder modes stack concepts.*

**ROBOT EDGE**  
Dominates destructible arenas

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Mech Combat Duel: Defeat training mech in robot_fight ring.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 2 — Laser Cannon Target Range

> **Destroy 10 targets with laser volleys.**

| | |
|---|---|
| **Difficulty** | Easy · Combat |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Destroy 10 targets with laser volleys..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~5 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
variables, loops — *Mode 2 teaches variables before harder modes stack concepts.*

**ROBOT EDGE**  
Dominates destructible arenas

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Laser Cannon Target Range: Destroy 10 targets with laser volleys.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 3 — Missile Barrage Salvo

> **Fire salvo at moving aerial drones.**

| | |
|---|---|
| **Difficulty** | Easy · Combat |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Fire salvo at moving aerial drones..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~6 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
loops, if/else — *Mode 3 teaches loops before harder modes stack concepts.*

**ROBOT EDGE**  
Dominates destructible arenas

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Missile Barrage Salvo: Fire salvo at moving aerial drones.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 4 — Energy Shield Defense

> **Block attacks until shield recharges.**

| | |
|---|---|
| **Difficulty** | Medium · Combat |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Block attacks until shield recharges..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
if/else, sensors — *Mode 4 teaches if/else before harder modes stack concepts.*

**ROBOT EDGE**  
Dominates destructible arenas

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Energy Shield Defense: Block attacks until shield recharges.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 5 — Arena Mech Survival

> **Survive 3 waves in colosseum.**

| | |
|---|---|
| **Difficulty** | Medium · Survival |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Survive 3 waves in colosseum..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sensors, events — *Mode 5 teaches sensors before harder modes stack concepts.*

**ROBOT EDGE**  
Dominates destructible arenas

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Arena Mech Survival: Survive 3 waves in colosseum.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 6 — Destructible Arena Smash

> **Break arena walls to corner opponent.**

| | |
|---|---|
| **Difficulty** | Medium · Combat |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Break arena walls to corner opponent..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
events, functions — *Mode 6 teaches events before harder modes stack concepts.*

**ROBOT EDGE**  
Dominates destructible arenas

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Destructible Arena Smash: Break arena walls to corner opponent.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 7 — Jump Jet Slam

> **Jet slam attack on armored target.**

| | |
|---|---|
| **Difficulty** | Hard · Combat |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Jet slam attack on armored target..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
functions, state machines — *Mode 7 teaches functions before harder modes stack concepts.*

**ROBOT EDGE**  
Dominates destructible arenas

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Jump Jet Slam: Jet slam attack on armored target.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 8 — Power Core Overdrive

> **Overdrive without meltdown — win duel.**

| | |
|---|---|
| **Difficulty** | Hard · Challenge |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Overdrive without meltdown — win duel..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
state machines, timing — *Mode 8 teaches state machines before harder modes stack concepts.*

**ROBOT EDGE**  
Dominates destructible arenas

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Power Core Overdrive: Overdrive without meltdown — win duel.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 9 — Heavy Mech Escort

> **Escort convoy through combat zone.**

| | |
|---|---|
| **Difficulty** | Hard · Escort |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Escort convoy through combat zone..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
timing, optimization — *Mode 9 teaches timing before harder modes stack concepts.*

**ROBOT EDGE**  
Dominates destructible arenas

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Heavy Mech Escort: Escort convoy through combat zone.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 10 — Apex Mech Champion (CAPSTONE)

> **Boss championship fight — best of 3 rounds.**

| | |
|---|---|
| **Difficulty** | Expert · Combat |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Boss championship fight — best of 3 rounds..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~15 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
optimization, sequential blocks — *Mode 10 teaches optimization before harder modes stack concepts.*

**ROBOT EDGE**  
Dominates destructible arenas

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Apex Mech Champion: Boss championship fight — best of 3 rounds.

**WIN MOMENT**  
Goal marker flashes green + star popup; mastery badge + confetti.


---

## BOXING STRIKER 🥊 — Combat Ring

### Mode 1 — 1v1 Ring Duel

> **Knockout opponent in boxing ring.**

| | |
|---|---|
| **Difficulty** | Tutorial · Combat |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Knockout opponent in boxing ring..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~3 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sequential blocks, variables — *Mode 1 teaches sequential blocks before harder modes stack concepts.*

**ROBOT EDGE**  
Ring control and knockout timing

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
1v1 Ring Duel: Knockout opponent in boxing ring.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 2 — Punching Dummy Speed Trial

> **Land 20 punches in 30 seconds.**

| | |
|---|---|
| **Difficulty** | Easy · Combat |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Land 20 punches in 30 seconds..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~5 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
variables, loops — *Mode 2 teaches variables before harder modes stack concepts.*

**ROBOT EDGE**  
Ring control and knockout timing

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Punching Dummy Speed Trial: Land 20 punches in 30 seconds.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 3 — Heavyweight Boss Showdown

> **Beat boss with block-and-counter.**

| | |
|---|---|
| **Difficulty** | Easy · Combat |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Beat boss with block-and-counter..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~6 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
loops, if/else — *Mode 3 teaches loops before harder modes stack concepts.*

**ROBOT EDGE**  
Ring control and knockout timing

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Heavyweight Boss Showdown: Beat boss with block-and-counter.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 4 — Speed Bag Rhythm Test

> **Match rhythm combo on speed bag.**

| | |
|---|---|
| **Difficulty** | Medium · Combat |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Match rhythm combo on speed bag..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
if/else, sensors — *Mode 4 teaches if/else before harder modes stack concepts.*

**ROBOT EDGE**  
Ring control and knockout timing

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Combo counter
- Speed readout
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Speed Bag Rhythm Test: Match rhythm combo on speed bag.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 5 — Knockout Speedrun

> **KO within 60 seconds.**

| | |
|---|---|
| **Difficulty** | Medium · Survival |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
KO within 60 seconds..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sensors, events — *Mode 5 teaches sensors before harder modes stack concepts.*

**ROBOT EDGE**  
Ring control and knockout timing

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Knockout Speedrun: KO within 60 seconds.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 6 — Block and Counter Punch

> **Block 5 hits then counter for KO.**

| | |
|---|---|
| **Difficulty** | Medium · Combat |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Block 5 hits then counter for KO..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
events, functions — *Mode 6 teaches events before harder modes stack concepts.*

**ROBOT EDGE**  
Ring control and knockout timing

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Block and Counter Punch: Block 5 hits then counter for KO.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 7 — 10-Strike Combo Streak

> **Land 10-hit combo without missing.**

| | |
|---|---|
| **Difficulty** | Hard · Combat |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Land 10-hit combo without missing..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
functions, state machines — *Mode 7 teaches functions before harder modes stack concepts.*

**ROBOT EDGE**  
Ring control and knockout timing

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Combo counter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
10-Strike Combo Streak: Land 10-hit combo without missing.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 8 — Tag Team Boxing Rumble

> **Tag partner and win 2v2 round.**

| | |
|---|---|
| **Difficulty** | Hard · Challenge |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Tag partner and win 2v2 round..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
state machines, timing — *Mode 8 teaches state machines before harder modes stack concepts.*

**ROBOT EDGE**  
Ring control and knockout timing

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Tag Team Boxing Rumble: Tag partner and win 2v2 round.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 9 — Iron Guard Survival

> **Survive 90s against rush attacks.**

| | |
|---|---|
| **Difficulty** | Hard · Escort |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Survive 90s against rush attacks..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
timing, optimization — *Mode 9 teaches timing before harder modes stack concepts.*

**ROBOT EDGE**  
Ring control and knockout timing

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Iron Guard Survival: Survive 90s against rush attacks.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 10 — Ring Out Knockdown (CAPSTONE)

> **Ring-out opponent off platform edge.**

| | |
|---|---|
| **Difficulty** | Expert · Combat |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Ring-out opponent off platform edge..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~15 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
optimization, sequential blocks — *Mode 10 teaches optimization before harder modes stack concepts.*

**ROBOT EDGE**  
Ring control and knockout timing

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Ring Out Knockdown: Ring-out opponent off platform edge.

**WIN MOMENT**  
Goal marker flashes green + star popup; mastery badge + confetti.


---

## ELEMENTAL BLASTER ✨ — Combat Magic

### Mode 1 — Fireball Blast Trial

> **Ignite 8 torches with fireballs.**

| | |
|---|---|
| **Difficulty** | Tutorial · Combat |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Ignite 8 torches with fireballs..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~3 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sequential blocks, variables — *Mode 1 teaches sequential blocks before harder modes stack concepts.*

**ROBOT EDGE**  
Element combos in combat arenas

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Fireball Blast Trial: Ignite 8 torches with fireballs.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 2 — Ice Beam Freeze

> **Freeze water elementals before they reach you.**

| | |
|---|---|
| **Difficulty** | Easy · Combat |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Freeze water elementals before they reach you..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~5 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
variables, loops — *Mode 2 teaches variables before harder modes stack concepts.*

**ROBOT EDGE**  
Element combos in combat arenas

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Ice Beam Freeze: Freeze water elementals before they reach you.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 3 — Lightning Chain Reaction

> **Chain lightning through 5 bots.**

| | |
|---|---|
| **Difficulty** | Easy · Combat |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Chain lightning through 5 bots..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~6 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
loops, if/else — *Mode 3 teaches loops before harder modes stack concepts.*

**ROBOT EDGE**  
Element combos in combat arenas

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Lightning Chain Reaction: Chain lightning through 5 bots.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 4 — Arcane Shield Ward

> **Block 10 magic projectiles.**

| | |
|---|---|
| **Difficulty** | Medium · Combat |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Block 10 magic projectiles..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
if/else, sensors — *Mode 4 teaches if/else before harder modes stack concepts.*

**ROBOT EDGE**  
Element combos in combat arenas

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Arcane Shield Ward: Block 10 magic projectiles.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 5 — Mana Crystal Harvest

> **Collect crystals to power spells.**

| | |
|---|---|
| **Difficulty** | Medium · Survival |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Collect crystals to power spells..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sensors, events — *Mode 5 teaches sensors before harder modes stack concepts.*

**ROBOT EDGE**  
Element combos in combat arenas

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Mana Crystal Harvest: Collect crystals to power spells.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 6 — Elemental Combination

> **Combine fire + ice for steam blast puzzle.**

| | |
|---|---|
| **Difficulty** | Medium · Combat |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Combine fire + ice for steam blast puzzle..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
events, functions — *Mode 6 teaches events before harder modes stack concepts.*

**ROBOT EDGE**  
Element combos in combat arenas

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Elemental Combination: Combine fire + ice for steam blast puzzle.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 7 — Spell Casting Speedrun

> **Cast 5 spells in correct order fast.**

| | |
|---|---|
| **Difficulty** | Hard · Combat |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Cast 5 spells in correct order fast..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
functions, state machines — *Mode 7 teaches functions before harder modes stack concepts.*

**ROBOT EDGE**  
Element combos in combat arenas

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Spell Casting Speedrun: Cast 5 spells in correct order fast.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 8 — Telekinesis Object Move

> **Move boulders onto pressure plates.**

| | |
|---|---|
| **Difficulty** | Hard · Challenge |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Move boulders onto pressure plates..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
state machines, timing — *Mode 8 teaches state machines before harder modes stack concepts.*

**ROBOT EDGE**  
Element combos in combat arenas

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Telekinesis Object Move: Move boulders onto pressure plates.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 9 — Elemental Wave Survival

> **Survive 4 elemental attack waves.**

| | |
|---|---|
| **Difficulty** | Hard · Escort |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Survive 4 elemental attack waves..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
timing, optimization — *Mode 9 teaches timing before harder modes stack concepts.*

**ROBOT EDGE**  
Element combos in combat arenas

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Elemental Wave Survival: Survive 4 elemental attack waves.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 10 — Archmage Boss Showdown (CAPSTONE)

> **Defeat Ancient Elemental Lord.**

| | |
|---|---|
| **Difficulty** | Expert · Combat |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Defeat Ancient Elemental Lord..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~15 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
optimization, sequential blocks — *Mode 10 teaches optimization before harder modes stack concepts.*

**ROBOT EDGE**  
Element combos in combat arenas

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Archmage Boss Showdown: Defeat Ancient Elemental Lord.

**WIN MOMENT**  
Goal marker flashes green + star popup; mastery badge + confetti.


---

## SHADOW NINJA 🥷 — Cyber + Combat

### Mode 1 — Laser Grid Infiltration

> **Cross shadow_escape grid undetected.**

| | |
|---|---|
| **Difficulty** | Tutorial · Stealth |
| **Environment** | Moonlit Rooftop & Lasers (`cyber_ninja`) |
| **Arena type** | `museum_heist` |

**PRIMARY OBJECTIVE**  
Cross shadow_escape grid undetected..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~3 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sequential blocks, variables — *Mode 1 teaches sequential blocks before harder modes stack concepts.*

**ROBOT EDGE**  
Laser grid infiltration

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Laser Grid Infiltration: Cross shadow_escape grid undetected.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 2 — Shuriken Target Accuracy

> **Hit 10 targets with shuriken.**

| | |
|---|---|
| **Difficulty** | Easy · Stealth |
| **Environment** | Moonlit Rooftop & Lasers (`cyber_ninja`) |
| **Arena type** | `shadow_escape` |

**PRIMARY OBJECTIVE**  
Hit 10 targets with shuriken..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~5 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
variables, loops — *Mode 2 teaches variables before harder modes stack concepts.*

**ROBOT EDGE**  
Laser grid infiltration

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Shuriken Target Accuracy: Hit 10 targets with shuriken.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 3 — Shadow Clone Duel

> **Defeat shadow clone in mirror match.**

| | |
|---|---|
| **Difficulty** | Easy · Stealth |
| **Environment** | Moonlit Rooftop & Lasers (`cyber_ninja`) |
| **Arena type** | `cyber_city` |

**PRIMARY OBJECTIVE**  
Defeat shadow clone in mirror match..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~6 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
loops, if/else — *Mode 3 teaches loops before harder modes stack concepts.*

**ROBOT EDGE**  
Laser grid infiltration

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Shadow Clone Duel: Defeat shadow clone in mirror match.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 4 — Wall Jump Tower Parkour

> **Wall-jump climb the tower.**

| | |
|---|---|
| **Difficulty** | Medium · Patrol |
| **Environment** | Moonlit Rooftop & Lasers (`cyber_ninja`) |
| **Arena type** | `night_patrol` |

**PRIMARY OBJECTIVE**  
Wall-jump climb the tower..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
if/else, sensors — *Mode 4 teaches if/else before harder modes stack concepts.*

**ROBOT EDGE**  
Laser grid infiltration

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Wall Jump Tower Parkour: Wall-jump climb the tower.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 5 — Speed Dash Assassination

> **Dash to target before alarm triggers.**

| | |
|---|---|
| **Difficulty** | Medium · Stealth |
| **Environment** | Moonlit Rooftop & Lasers (`cyber_ninja`) |
| **Arena type** | `shadow_escape` |

**PRIMARY OBJECTIVE**  
Dash to target before alarm triggers..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sensors, events — *Mode 5 teaches sensors before harder modes stack concepts.*

**ROBOT EDGE**  
Laser grid infiltration

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Speed Dash Assassination: Dash to target before alarm triggers.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 6 — Smoke Bomb Maze Escape

> **Escape maze after smoke deploy.**

| | |
|---|---|
| **Difficulty** | Medium · Infiltration |
| **Environment** | Moonlit Rooftop & Lasers (`cyber_ninja`) |
| **Arena type** | `museum_heist` |

**PRIMARY OBJECTIVE**  
Escape maze after smoke deploy..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
events, functions — *Mode 6 teaches events before harder modes stack concepts.*

**ROBOT EDGE**  
Laser grid infiltration

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Smoke Bomb Maze Escape: Escape maze after smoke deploy.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 7 — Parry & Katana Counter

> **Parry 5 strikes then counter.**

| | |
|---|---|
| **Difficulty** | Hard · Stealth |
| **Environment** | Moonlit Rooftop & Lasers (`cyber_ninja`) |
| **Arena type** | `cyber_city` |

**PRIMARY OBJECTIVE**  
Parry 5 strikes then counter..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
functions, state machines — *Mode 7 teaches functions before harder modes stack concepts.*

**ROBOT EDGE**  
Laser grid infiltration

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Parry & Katana Counter: Parry 5 strikes then counter.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 8 — Silent Footsteps Trial

> **Complete route with zero noise.**

| | |
|---|---|
| **Difficulty** | Hard · Patrol |
| **Environment** | Moonlit Rooftop & Lasers (`cyber_ninja`) |
| **Arena type** | `night_patrol` |

**PRIMARY OBJECTIVE**  
Complete route with zero noise..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
state machines, timing — *Mode 8 teaches state machines before harder modes stack concepts.*

**ROBOT EDGE**  
Laser grid infiltration

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Silent Footsteps Trial: Complete route with zero noise.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 9 — Rooftop Night Sprint

> **Sprint rooftops in night_patrol city.**

| | |
|---|---|
| **Difficulty** | Hard · Escape |
| **Environment** | Moonlit Rooftop & Lasers (`cyber_ninja`) |
| **Arena type** | `escape_wall` |

**PRIMARY OBJECTIVE**  
Sprint rooftops in night_patrol city..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
timing, optimization — *Mode 9 teaches timing before harder modes stack concepts.*

**ROBOT EDGE**  
Laser grid infiltration

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Rooftop Night Sprint: Sprint rooftops in night_patrol city.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 10 — Sensei Boss Showdown (CAPSTONE)

> **Defeat sensei in final duel.**

| | |
|---|---|
| **Difficulty** | Expert · Mastery |
| **Environment** | Moonlit Rooftop & Lasers (`cyber_ninja`) |
| **Arena type** | `jump_world` |

**PRIMARY OBJECTIVE**  
Defeat sensei in final duel..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~15 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
optimization, sequential blocks — *Mode 10 teaches optimization before harder modes stack concepts.*

**ROBOT EDGE**  
Laser grid infiltration

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Sensei Boss Showdown: Defeat sensei in final duel.

**WIN MOMENT**  
Goal marker flashes green + star popup; mastery badge + confetti.


---

## BERSERKER 💢 — Combat Heavy

### Mode 1 — Rage Gauge Breakout

> **Fill rage meter and unleash burst.**

| | |
|---|---|
| **Difficulty** | Tutorial · Combat |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Fill rage meter and unleash burst..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~3 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sequential blocks, variables — *Mode 1 teaches sequential blocks before harder modes stack concepts.*

**ROBOT EDGE**  
Damage scales with aggression

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Rage Gauge Breakout: Fill rage meter and unleash burst.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 2 — Destructible Wall Crush

> **Smash through 6 walls to target.**

| | |
|---|---|
| **Difficulty** | Easy · Combat |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Smash through 6 walls to target..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~5 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
variables, loops — *Mode 2 teaches variables before harder modes stack concepts.*

**ROBOT EDGE**  
Damage scales with aggression

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Destructible Wall Crush: Smash through 6 walls to target.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 3 — Ground Pound Shockwave

> **Pound to stun surrounding enemies.**

| | |
|---|---|
| **Difficulty** | Easy · Combat |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Pound to stun surrounding enemies..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~6 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
loops, if/else — *Mode 3 teaches loops before harder modes stack concepts.*

**ROBOT EDGE**  
Damage scales with aggression

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Ground Pound Shockwave: Pound to stun surrounding enemies.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 4 — Unstoppable Charge

> **Charge through line of defenders.**

| | |
|---|---|
| **Difficulty** | Medium · Combat |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Charge through line of defenders..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
if/else, sensors — *Mode 4 teaches if/else before harder modes stack concepts.*

**ROBOT EDGE**  
Damage scales with aggression

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Unstoppable Charge: Charge through line of defenders.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 5 — Berserker Overdrive

> **Win fight while in overdrive mode.**

| | |
|---|---|
| **Difficulty** | Medium · Survival |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Win fight while in overdrive mode..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sensors, events — *Mode 5 teaches sensors before harder modes stack concepts.*

**ROBOT EDGE**  
Damage scales with aggression

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Berserker Overdrive: Win fight while in overdrive mode.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 6 — Heavy Hammer Slam

> **Slam hammer on weak-point markers.**

| | |
|---|---|
| **Difficulty** | Medium · Combat |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Slam hammer on weak-point markers..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
events, functions — *Mode 6 teaches events before harder modes stack concepts.*

**ROBOT EDGE**  
Damage scales with aggression

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Heavy Hammer Slam: Slam hammer on weak-point markers.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 7 — Brawler Pit Survival

> **Survive pit brawl for 2 minutes.**

| | |
|---|---|
| **Difficulty** | Hard · Combat |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Survive pit brawl for 2 minutes..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
functions, state machines — *Mode 7 teaches functions before harder modes stack concepts.*

**ROBOT EDGE**  
Damage scales with aggression

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Brawler Pit Survival: Survive pit brawl for 2 minutes.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 8 — Shield Crusher Strike

> **Break enemy shield with charged hit.**

| | |
|---|---|
| **Difficulty** | Hard · Challenge |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Break enemy shield with charged hit..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
state machines, timing — *Mode 8 teaches state machines before harder modes stack concepts.*

**ROBOT EDGE**  
Damage scales with aggression

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Shield Crusher Strike: Break enemy shield with charged hit.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 9 — Lava Arena Brawl

> **Win fight on volcano_drift arena edge.**

| | |
|---|---|
| **Difficulty** | Hard · Escort |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Win fight on volcano_drift arena edge..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
timing, optimization — *Mode 9 teaches timing before harder modes stack concepts.*

**ROBOT EDGE**  
Damage scales with aggression

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Lava Arena Brawl: Win fight on volcano_drift arena edge.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 10 — Titan Rage Boss Duel (CAPSTONE)

> **Defeat titan boss in final rage duel.**

| | |
|---|---|
| **Difficulty** | Expert · Combat |
| **Environment** | Elevated 3D Ring & Colosseum (`boxing_mech`) |
| **Arena type** | `robot_fight` |

**PRIMARY OBJECTIVE**  
Defeat titan boss in final rage duel..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~15 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
optimization, sequential blocks — *Mode 10 teaches optimization before harder modes stack concepts.*

**ROBOT EDGE**  
Damage scales with aggression

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Titan Rage Boss Duel: Defeat titan boss in final rage duel.

**WIN MOMENT**  
Goal marker flashes green + star popup; mastery badge + confetti.


---

## MED BOT 🏥 — Emergency Hospital

### Mode 1 — Emergency Triage Response

> **Reach patient in 15s in hospital_walk.**

| | |
|---|---|
| **Difficulty** | Tutorial · Rescue |
| **Environment** | Burning City District (`emergency`) |
| **Arena type** | `firebot_blaze` |

**PRIMARY OBJECTIVE**  
Reach patient in 15s in hospital_walk..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~3 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sequential blocks, variables — *Mode 1 teaches sequential blocks before harder modes stack concepts.*

**ROBOT EDGE**  
Hospital corridor sprint saves

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Emergency Triage Response: Reach patient in 15s in hospital_walk.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 2 — Defibrillator Shock Recharge

> **Time shock pulse to restart heart.**

| | |
|---|---|
| **Difficulty** | Easy · Rescue |
| **Environment** | Burning City District (`emergency`) |
| **Arena type** | `hospital_walk` |

**PRIMARY OBJECTIVE**  
Time shock pulse to restart heart..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~5 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
variables, loops — *Mode 2 teaches variables before harder modes stack concepts.*

**ROBOT EDGE**  
Hospital corridor sprint saves

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Defibrillator Shock Recharge: Time shock pulse to restart heart.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 3 — Bandage Wrap Precision

> **Bandage 3 limbs on wounded bot.**

| | |
|---|---|
| **Difficulty** | Easy · Navigation |
| **Environment** | Burning City District (`emergency`) |
| **Arena type** | `snow_rescue` |

**PRIMARY OBJECTIVE**  
Bandage 3 limbs on wounded bot..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~6 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
loops, if/else — *Mode 3 teaches loops before harder modes stack concepts.*

**ROBOT EDGE**  
Hospital corridor sprint saves

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Bandage Wrap Precision: Bandage 3 limbs on wounded bot.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 4 — Antidote Medicine Mix

> **Mix correct chemical doses at station.**

| | |
|---|---|
| **Difficulty** | Medium · Challenge |
| **Environment** | Burning City District (`emergency`) |
| **Arena type** | `firebot_blaze` |

**PRIMARY OBJECTIVE**  
Mix correct chemical doses at station..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
if/else, sensors — *Mode 4 teaches if/else before harder modes stack concepts.*

**ROBOT EDGE**  
Hospital corridor sprint saves

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Antidote Medicine Mix: Mix correct chemical doses at station.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 5 — Hospital Corridor Dash

> **Transport stretcher without jostling.**

| | |
|---|---|
| **Difficulty** | Medium · Climb |
| **Environment** | Burning City District (`emergency`) |
| **Arena type** | `hospital_walk` |

**PRIMARY OBJECTIVE**  
Transport stretcher without jostling..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sensors, events — *Mode 5 teaches sensors before harder modes stack concepts.*

**ROBOT EDGE**  
Hospital corridor sprint saves

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Hospital Corridor Dash: Transport stretcher without jostling.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 6 — Vital Signs Monitor

> **Read temp, pulse, oxygen at bedside.**

| | |
|---|---|
| **Difficulty** | Medium · Strategy |
| **Environment** | Burning City District (`emergency`) |
| **Arena type** | `snow_rescue` |

**PRIMARY OBJECTIVE**  
Read temp, pulse, oxygen at bedside..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
events, functions — *Mode 6 teaches events before harder modes stack concepts.*

**ROBOT EDGE**  
Hospital corridor sprint saves

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Vital Signs Monitor: Read temp, pulse, oxygen at bedside.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 7 — Quarantine Zone Containment

> **Isolate infected bots safely.**

| | |
|---|---|
| **Difficulty** | Hard · Crisis |
| **Environment** | Burning City District (`emergency`) |
| **Arena type** | `lava_canyon` |

**PRIMARY OBJECTIVE**  
Isolate infected bots safely..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
functions, state machines — *Mode 7 teaches functions before harder modes stack concepts.*

**ROBOT EDGE**  
Hospital corridor sprint saves

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Quarantine Zone Containment: Isolate infected bots safely.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 8 — Surgical Laser Precision

> **Remove splinter with laser arm.**

| | |
|---|---|
| **Difficulty** | Hard · Race |
| **Environment** | Burning City District (`emergency`) |
| **Arena type** | `cyber_city` |

**PRIMARY OBJECTIVE**  
Remove splinter with laser arm..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
state machines, timing — *Mode 8 teaches state machines before harder modes stack concepts.*

**ROBOT EDGE**  
Hospital corridor sprint saves

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Surgical Laser Precision: Remove splinter with laser arm.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 9 — Medical Supply Helicopter Drop

> **Catch dropped medicine crates.**

| | |
|---|---|
| **Difficulty** | Hard · Defense |
| **Environment** | Burning City District (`emergency`) |
| **Arena type** | `snow_rescue` |

**PRIMARY OBJECTIVE**  
Catch dropped medicine crates..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
timing, optimization — *Mode 9 teaches timing before harder modes stack concepts.*

**ROBOT EDGE**  
Hospital corridor sprint saves

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Medical Supply Helicopter Drop: Catch dropped medicine crates.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 10 — Chief Medical Officer (CAPSTONE)

> **Save 10 patients in ER capstone.**

| | |
|---|---|
| **Difficulty** | Expert · Hybrid |
| **Environment** | Burning City District (`emergency`) |
| **Arena type** | `firebot_blaze` |

**PRIMARY OBJECTIVE**  
Save 10 patients in ER capstone..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~15 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
optimization, sequential blocks — *Mode 10 teaches optimization before harder modes stack concepts.*

**ROBOT EDGE**  
Hospital corridor sprint saves

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Chief Medical Officer: Save 10 patients in ER capstone.

**WIN MOMENT**  
Goal marker flashes green + star popup; mastery badge + confetti.


---

## FIRE FIGHTER 🔥 — Emergency Fire

### Mode 1 — Water Cannon Blaze Extinguish

> **Extinguish 5 fires in firebot_blaze zone.**

| | |
|---|---|
| **Difficulty** | Tutorial · Rescue |
| **Environment** | Burning City District (`emergency`) |
| **Arena type** | `firebot_blaze` |

**PRIMARY OBJECTIVE**  
Extinguish 5 fires in firebot_blaze zone..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~3 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sequential blocks, variables — *Mode 1 teaches sequential blocks before harder modes stack concepts.*

**ROBOT EDGE**  
Burning city district specialist

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Water Cannon Blaze Extinguish: Extinguish 5 fires in firebot_blaze zone.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 2 — Smoke Rescue Dash

> **Evacuate 3 bots from smoke-filled building.**

| | |
|---|---|
| **Difficulty** | Easy · Rescue |
| **Environment** | Burning City District (`emergency`) |
| **Arena type** | `hospital_walk` |

**PRIMARY OBJECTIVE**  
Evacuate 3 bots from smoke-filled building..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~5 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
variables, loops — *Mode 2 teaches variables before harder modes stack concepts.*

**ROBOT EDGE**  
Burning city district specialist

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Smoke Rescue Dash: Evacuate 3 bots from smoke-filled building.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 3 — Fire Hydrant Hookup

> **Connect hose to 3 hydrants in order.**

| | |
|---|---|
| **Difficulty** | Easy · Navigation |
| **Environment** | Burning City District (`emergency`) |
| **Arena type** | `snow_rescue` |

**PRIMARY OBJECTIVE**  
Connect hose to 3 hydrants in order..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~6 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
loops, if/else — *Mode 3 teaches loops before harder modes stack concepts.*

**ROBOT EDGE**  
Burning city district specialist

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Fire Hydrant Hookup: Connect hose to 3 hydrants in order.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 4 — Chemical Fire Suppression

> **Deploy foam on oil blaze safely.**

| | |
|---|---|
| **Difficulty** | Medium · Challenge |
| **Environment** | Burning City District (`emergency`) |
| **Arena type** | `firebot_blaze` |

**PRIMARY OBJECTIVE**  
Deploy foam on oil blaze safely..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
if/else, sensors — *Mode 4 teaches if/else before harder modes stack concepts.*

**ROBOT EDGE**  
Burning city district specialist

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Chemical Fire Suppression: Deploy foam on oil blaze safely.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 5 — Burning Tower Ladder Climb

> **Extend ladder to top floor window.**

| | |
|---|---|
| **Difficulty** | Medium · Climb |
| **Environment** | Burning City District (`emergency`) |
| **Arena type** | `hospital_walk` |

**PRIMARY OBJECTIVE**  
Extend ladder to top floor window..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sensors, events — *Mode 5 teaches sensors before harder modes stack concepts.*

**ROBOT EDGE**  
Burning city district specialist

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Burning Tower Ladder Climb: Extend ladder to top floor window.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 6 — Wildfire Perimeter Trench

> **Carve firebreak before spread reaches town.**

| | |
|---|---|
| **Difficulty** | Medium · Strategy |
| **Environment** | Burning City District (`emergency`) |
| **Arena type** | `snow_rescue` |

**PRIMARY OBJECTIVE**  
Carve firebreak before spread reaches town..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
events, functions — *Mode 6 teaches events before harder modes stack concepts.*

**ROBOT EDGE**  
Burning city district specialist

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Wildfire Perimeter Trench: Carve firebreak before spread reaches town.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 7 — Gas Explosion Response

> **Cool overheating gas tanks before blast.**

| | |
|---|---|
| **Difficulty** | Hard · Crisis |
| **Environment** | Burning City District (`emergency`) |
| **Arena type** | `lava_canyon` |

**PRIMARY OBJECTIVE**  
Cool overheating gas tanks before blast..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
functions, state machines — *Mode 7 teaches functions before harder modes stack concepts.*

**ROBOT EDGE**  
Burning city district specialist

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Gas Explosion Response: Cool overheating gas tanks before blast.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 8 — Emergency Siren Rush

> **Drive engine to scene under time limit.**

| | |
|---|---|
| **Difficulty** | Hard · Race |
| **Environment** | Burning City District (`emergency`) |
| **Arena type** | `cyber_city` |

**PRIMARY OBJECTIVE**  
Drive engine to scene under time limit..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
state machines, timing — *Mode 8 teaches state machines before harder modes stack concepts.*

**ROBOT EDGE**  
Burning city district specialist

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Emergency Siren Rush: Drive engine to scene under time limit.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 9 — Flashover Prevention

> **Vent hot gases before room flashes over.**

| | |
|---|---|
| **Difficulty** | Hard · Defense |
| **Environment** | Burning City District (`emergency`) |
| **Arena type** | `snow_rescue` |

**PRIMARY OBJECTIVE**  
Vent hot gases before room flashes over..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
timing, optimization — *Mode 9 teaches timing before harder modes stack concepts.*

**ROBOT EDGE**  
Burning city district specialist

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Flashover Prevention: Vent hot gases before room flashes over.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 10 — Chief Fire Officer Medal (CAPSTONE)

> **Capstone multi-blaze city mission.**

| | |
|---|---|
| **Difficulty** | Expert · Hybrid |
| **Environment** | Burning City District (`emergency`) |
| **Arena type** | `firebot_blaze` |

**PRIMARY OBJECTIVE**  
Capstone multi-blaze city mission..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~15 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
optimization, sequential blocks — *Mode 10 teaches optimization before harder modes stack concepts.*

**ROBOT EDGE**  
Burning city district specialist

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Chief Fire Officer Medal: Capstone multi-blaze city mission.

**WIN MOMENT**  
Goal marker flashes green + star popup; mastery badge + confetti.


---

## JET FIGHTER ✈️ — Sky Military

### Mode 1 — Supersonic Dogfight

> **Outmaneuver enemy jet in canyon_flight.**

| | |
|---|---|
| **Difficulty** | Tutorial · Navigation |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `drone_canyon` |

**PRIMARY OBJECTIVE**  
Outmaneuver enemy jet in canyon_flight..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~3 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sequential blocks, variables — *Mode 1 teaches sequential blocks before harder modes stack concepts.*

**ROBOT EDGE**  
Dogfight in sky canyons

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Supersonic Dogfight: Outmaneuver enemy jet in canyon_flight.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 2 — Precision Air Strike

> **Hit ground targets without collateral.**

| | |
|---|---|
| **Difficulty** | Easy · Challenge |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `canyon_flight` |

**PRIMARY OBJECTIVE**  
Hit ground targets without collateral..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~5 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
variables, loops — *Mode 2 teaches variables before harder modes stack concepts.*

**ROBOT EDGE**  
Dogfight in sky canyons

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Precision Air Strike: Hit ground targets without collateral.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 3 — Aircraft Carrier Touch-and-Go

> **Land and launch on carrier deck.**

| | |
|---|---|
| **Difficulty** | Easy · Combat |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `storm_cloud` |

**PRIMARY OBJECTIVE**  
Land and launch on carrier deck..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~6 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
loops, if/else — *Mode 3 teaches loops before harder modes stack concepts.*

**ROBOT EDGE**  
Dogfight in sky canyons

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Aircraft Carrier Touch-and-Go: Land and launch on carrier deck.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 4 — Mach 2 Speed Trap

> **Break Mach 2 through speed trap gates.**

| | |
|---|---|
| **Difficulty** | Medium · Patrol |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `cloud_race` |

**PRIMARY OBJECTIVE**  
Break Mach 2 through speed trap gates..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
if/else, sensors — *Mode 4 teaches if/else before harder modes stack concepts.*

**ROBOT EDGE**  
Dogfight in sky canyons

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Speed readout
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Mach 2 Speed Trap: Break Mach 2 through speed trap gates.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 5 — Radar Evasion Stealth Flight

> **Cross zone without radar lock.**

| | |
|---|---|
| **Difficulty** | Medium · Race |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `space_orbit` |

**PRIMARY OBJECTIVE**  
Cross zone without radar lock..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sensors, events — *Mode 5 teaches sensors before harder modes stack concepts.*

**ROBOT EDGE**  
Dogfight in sky canyons

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Radar Evasion Stealth Flight: Cross zone without radar lock.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 6 — Missile Jammer Countermeasures

> **Jam incoming missiles during run.**

| | |
|---|---|
| **Difficulty** | Medium · Delivery |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `flight_rings` |

**PRIMARY OBJECTIVE**  
Jam incoming missiles during run..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
events, functions — *Mode 6 teaches events before harder modes stack concepts.*

**ROBOT EDGE**  
Dogfight in sky canyons

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Missile Jammer Countermeasures: Jam incoming missiles during run.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 7 — Mid-Air Tanker Refuel

> **Dock with tanker mid-flight.**

| | |
|---|---|
| **Difficulty** | Hard · Exploration |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `jet_stunt` |

**PRIMARY OBJECTIVE**  
Dock with tanker mid-flight..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
functions, state machines — *Mode 7 teaches functions before harder modes stack concepts.*

**ROBOT EDGE**  
Dogfight in sky canyons

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Mid-Air Tanker Refuel: Dock with tanker mid-flight.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 8 — Canyon Run Precision

> **Thread canyon at minimum altitude.**

| | |
|---|---|
| **Difficulty** | Hard · Survival |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `rooftop_delivery` |

**PRIMARY OBJECTIVE**  
Thread canyon at minimum altitude..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
state machines, timing — *Mode 8 teaches state machines before harder modes stack concepts.*

**ROBOT EDGE**  
Dogfight in sky canyons

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Canyon Run Precision: Thread canyon at minimum altitude.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 9 — Escort Transport Jet

> **Escort cargo plane through typhoon.**

| | |
|---|---|
| **Difficulty** | Hard · Stunt |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `typhoon` |

**PRIMARY OBJECTIVE**  
Escort cargo plane through typhoon..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
timing, optimization — *Mode 9 teaches timing before harder modes stack concepts.*

**ROBOT EDGE**  
Dogfight in sky canyons

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Escort Transport Jet: Escort cargo plane through typhoon.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 10 — Top Gun Ace Fighter (CAPSTONE)

> **Capstone dogfight + strike + carrier landing.**

| | |
|---|---|
| **Difficulty** | Expert · Hybrid |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `warp_gate` |

**PRIMARY OBJECTIVE**  
Capstone dogfight + strike + carrier landing..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~15 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
optimization, sequential blocks — *Mode 10 teaches optimization before harder modes stack concepts.*

**ROBOT EDGE**  
Dogfight in sky canyons

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Top Gun Ace Fighter: Capstone dogfight + strike + carrier landing.

**WIN MOMENT**  
Goal marker flashes green + star popup; mastery badge + confetti.


---

## STEALTH JET 🌑 — Sky Stealth

### Mode 1 — Radar Dome Infiltration

> **Penetrate radar dome undetected.**

| | |
|---|---|
| **Difficulty** | Tutorial · Navigation |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `drone_canyon` |

**PRIMARY OBJECTIVE**  
Penetrate radar dome undetected..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~3 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sequential blocks, variables — *Mode 1 teaches sequential blocks before harder modes stack concepts.*

**ROBOT EDGE**  
Invisible approach runs

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Radar Dome Infiltration: Penetrate radar dome undetected.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 2 — Night Bombing Raid

> **Hit targets on night_patrol map.**

| | |
|---|---|
| **Difficulty** | Easy · Challenge |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `canyon_flight` |

**PRIMARY OBJECTIVE**  
Hit targets on night_patrol map..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~5 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
variables, loops — *Mode 2 teaches variables before harder modes stack concepts.*

**ROBOT EDGE**  
Invisible approach runs

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Night Bombing Raid: Hit targets on night_patrol map.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 3 — Thermal Signature Suppression

> **Stay cold on thermal sensors.**

| | |
|---|---|
| **Difficulty** | Easy · Combat |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `storm_cloud` |

**PRIMARY OBJECTIVE**  
Stay cold on thermal sensors..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~6 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
loops, if/else — *Mode 3 teaches loops before harder modes stack concepts.*

**ROBOT EDGE**  
Invisible approach runs

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Thermal Signature Suppression: Stay cold on thermal sensors.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 4 — Shadow Formation Flight

> **Fly formation without breaking stealth.**

| | |
|---|---|
| **Difficulty** | Medium · Patrol |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `cloud_race` |

**PRIMARY OBJECTIVE**  
Fly formation without breaking stealth..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
if/else, sensors — *Mode 4 teaches if/else before harder modes stack concepts.*

**ROBOT EDGE**  
Invisible approach runs

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Shadow Formation Flight: Fly formation without breaking stealth.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 5 — Electronic Warfare Jamming

> **Jam enemy comms at waypoint.**

| | |
|---|---|
| **Difficulty** | Medium · Race |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `space_orbit` |

**PRIMARY OBJECTIVE**  
Jam enemy comms at waypoint..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sensors, events — *Mode 5 teaches sensors before harder modes stack concepts.*

**ROBOT EDGE**  
Invisible approach runs

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Electronic Warfare Jamming: Jam enemy comms at waypoint.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 6 — High-Altitude Recon Photo

> **Photograph 6 targets from altitude.**

| | |
|---|---|
| **Difficulty** | Medium · Delivery |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `flight_rings` |

**PRIMARY OBJECTIVE**  
Photograph 6 targets from altitude..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
events, functions — *Mode 6 teaches events before harder modes stack concepts.*

**ROBOT EDGE**  
Invisible approach runs

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
High-Altitude Recon Photo: Photograph 6 targets from altitude.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 7 — Silent Glide Approach

> **Glide in with engines off.**

| | |
|---|---|
| **Difficulty** | Hard · Exploration |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `jet_stunt` |

**PRIMARY OBJECTIVE**  
Glide in with engines off..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
functions, state machines — *Mode 7 teaches functions before harder modes stack concepts.*

**ROBOT EDGE**  
Invisible approach runs

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Silent Glide Approach: Glide in with engines off.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 8 — Precision Missile Sniping

> **Single missile per target — no misses.**

| | |
|---|---|
| **Difficulty** | Hard · Survival |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `rooftop_delivery` |

**PRIMARY OBJECTIVE**  
Single missile per target — no misses..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
state machines, timing — *Mode 8 teaches state machines before harder modes stack concepts.*

**ROBOT EDGE**  
Invisible approach runs

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Precision Missile Sniping: Single missile per target — no misses.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 9 — EMP Bomb Drop

> **EMP drop disables grid then escape.**

| | |
|---|---|
| **Difficulty** | Hard · Stunt |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `typhoon` |

**PRIMARY OBJECTIVE**  
EMP drop disables grid then escape..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
timing, optimization — *Mode 9 teaches timing before harder modes stack concepts.*

**ROBOT EDGE**  
Invisible approach runs

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
EMP Bomb Drop: EMP drop disables grid then escape.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 10 — Ghost Jet Master (CAPSTONE)

> **Capstone stealth strike mission.**

| | |
|---|---|
| **Difficulty** | Expert · Hybrid |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `warp_gate` |

**PRIMARY OBJECTIVE**  
Capstone stealth strike mission..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~15 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
optimization, sequential blocks — *Mode 10 teaches optimization before harder modes stack concepts.*

**ROBOT EDGE**  
Invisible approach runs

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Ghost Jet Master: Capstone stealth strike mission.

**WIN MOMENT**  
Goal marker flashes green + star popup; mastery badge + confetti.


---

## AERO STUNT 💫 — Sky Aerobatic

### Mode 1 — Smoke Trail Loop-de-Loop

> **Complete loop leaving smoke trail.**

| | |
|---|---|
| **Difficulty** | Tutorial · Navigation |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `drone_canyon` |

**PRIMARY OBJECTIVE**  
Complete loop leaving smoke trail..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~3 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sequential blocks, variables — *Mode 1 teaches sequential blocks before harder modes stack concepts.*

**ROBOT EDGE**  
Air-show pylon precision

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Smoke Trail Loop-de-Loop: Complete loop leaving smoke trail.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 2 — Barrel Roll Speed Slalom

> **Barrel roll between slalom pylons.**

| | |
|---|---|
| **Difficulty** | Easy · Challenge |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `canyon_flight` |

**PRIMARY OBJECTIVE**  
Barrel roll between slalom pylons..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~5 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
variables, loops — *Mode 2 teaches variables before harder modes stack concepts.*

**ROBOT EDGE**  
Air-show pylon precision

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Barrel Roll Speed Slalom: Barrel roll between slalom pylons.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 3 — Knife-Edge Flying

> **Hold knife-edge through gate sequence.**

| | |
|---|---|
| **Difficulty** | Easy · Combat |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `storm_cloud` |

**PRIMARY OBJECTIVE**  
Hold knife-edge through gate sequence..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~6 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
loops, if/else — *Mode 3 teaches loops before harder modes stack concepts.*

**ROBOT EDGE**  
Air-show pylon precision

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Knife-Edge Flying: Hold knife-edge through gate sequence.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 4 — Air Show Formation Dance

> **Mirror lead plane through formation.**

| | |
|---|---|
| **Difficulty** | Medium · Patrol |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `cloud_race` |

**PRIMARY OBJECTIVE**  
Mirror lead plane through formation..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
if/else, sensors — *Mode 4 teaches if/else before harder modes stack concepts.*

**ROBOT EDGE**  
Air-show pylon precision

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Air Show Formation Dance: Mirror lead plane through formation.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 5 — Touch-and-Go Ribbon Snip

> **Clip ribbon with wing on low pass.**

| | |
|---|---|
| **Difficulty** | Medium · Race |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `space_orbit` |

**PRIMARY OBJECTIVE**  
Clip ribbon with wing on low pass..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sensors, events — *Mode 5 teaches sensors before harder modes stack concepts.*

**ROBOT EDGE**  
Air-show pylon precision

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Touch-and-Go Ribbon Snip: Clip ribbon with wing on low pass.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 6 — Inverted Flying Sprint

> **Inverted flight through cloud_race section.**

| | |
|---|---|
| **Difficulty** | Medium · Delivery |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `flight_rings` |

**PRIMARY OBJECTIVE**  
Inverted flight through cloud_race section..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
events, functions — *Mode 6 teaches events before harder modes stack concepts.*

**ROBOT EDGE**  
Air-show pylon precision

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Inverted Flying Sprint: Inverted flight through cloud_race section.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 7 — Hammerhead Turn Stunt

> **Hammerhead at stunt checkpoint.**

| | |
|---|---|
| **Difficulty** | Hard · Exploration |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `jet_stunt` |

**PRIMARY OBJECTIVE**  
Hammerhead at stunt checkpoint..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
functions, state machines — *Mode 7 teaches functions before harder modes stack concepts.*

**ROBOT EDGE**  
Air-show pylon precision

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Hammerhead Turn Stunt: Hammerhead at stunt checkpoint.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 8 — Pyrotechnic Night Flight

> **Fly fireworks display path.**

| | |
|---|---|
| **Difficulty** | Hard · Survival |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `rooftop_delivery` |

**PRIMARY OBJECTIVE**  
Fly fireworks display path..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
state machines, timing — *Mode 8 teaches state machines before harder modes stack concepts.*

**ROBOT EDGE**  
Air-show pylon precision

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Pyrotechnic Night Flight: Fly fireworks display path.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 9 — Pylon Slalom Time Attack

> **Best time through pylon course.**

| | |
|---|---|
| **Difficulty** | Hard · Stunt |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `typhoon` |

**PRIMARY OBJECTIVE**  
Best time through pylon course..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
timing, optimization — *Mode 9 teaches timing before harder modes stack concepts.*

**ROBOT EDGE**  
Air-show pylon precision

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Pylon Slalom Time Attack: Best time through pylon course.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 10 — Red Bull Air Race Champion (CAPSTONE)

> **Capstone aerobatic championship.**

| | |
|---|---|
| **Difficulty** | Expert · Hybrid |
| **Environment** | High-Altitude Sky Arena (`sky_aerial`) |
| **Arena type** | `warp_gate` |

**PRIMARY OBJECTIVE**  
Capstone aerobatic championship..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~15 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
optimization, sequential blocks — *Mode 10 teaches optimization before harder modes stack concepts.*

**ROBOT EDGE**  
Air-show pylon precision

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Red Bull Air Race Champion: Capstone aerobatic championship.

**WIN MOMENT**  
Goal marker flashes green + star popup; mastery badge + confetti.


---

## SLING-B / BIRDBOT 🐦 — Flappy 2.5D

### Mode 1 — Flappy Pipe Navigator

> **Flap through 10 pipe gaps on flappy_bird course.**

| | |
|---|---|
| **Difficulty** | Tutorial · Action |
| **Environment** | Flappy Sky Canopy (`flappy`) |
| **Arena type** | `flappy_bird` |

**PRIMARY OBJECTIVE**  
Flap through 10 pipe gaps on flappy_bird course..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~3 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sequential blocks, variables — *Mode 1 teaches sequential blocks before harder modes stack concepts.*

**ROBOT EDGE**  
2.5D pipe corridor mastery

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Flappy Pipe Navigator: Flap through 10 pipe gaps on flappy_bird course.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 2 — Slingshot Target Launch

> **Catapult launch to hit distant target.**

| | |
|---|---|
| **Difficulty** | Easy · Challenge |
| **Environment** | Flappy Sky Canopy (`flappy`) |
| **Arena type** | `flappy_bird` |

**PRIMARY OBJECTIVE**  
Catapult launch to hit distant target..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~5 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
variables, loops — *Mode 2 teaches variables before harder modes stack concepts.*

**ROBOT EDGE**  
2.5D pipe corridor mastery

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Slingshot Target Launch: Catapult launch to hit distant target.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 3 — Endless Flappy Runner

> **Survive endless pipes — beat high score.**

| | |
|---|---|
| **Difficulty** | Easy · Endurance |
| **Environment** | Flappy Sky Canopy (`flappy`) |
| **Arena type** | `flappy_bird` |

**PRIMARY OBJECTIVE**  
Survive endless pipes — beat high score..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~6 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
loops, if/else — *Mode 3 teaches loops before harder modes stack concepts.*

**ROBOT EDGE**  
2.5D pipe corridor mastery

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Score / target counter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Endless Flappy Runner: Survive endless pipes — beat high score.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 4 — Golden Egg Rescue

> **Grab egg and land in nest zone.**

| | |
|---|---|
| **Difficulty** | Medium · Rescue |
| **Environment** | Flappy Sky Canopy (`flappy`) |
| **Arena type** | `flappy_bird` |

**PRIMARY OBJECTIVE**  
Grab egg and land in nest zone..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
if/else, sensors — *Mode 4 teaches if/else before harder modes stack concepts.*

**ROBOT EDGE**  
2.5D pipe corridor mastery

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Golden Egg Rescue: Grab egg and land in nest zone.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 5 — Wind Gust Glide

> **Ride gusts without crashing into pipes.**

| | |
|---|---|
| **Difficulty** | Medium · Navigation |
| **Environment** | Flappy Sky Canopy (`flappy`) |
| **Arena type** | `flappy_bird` |

**PRIMARY OBJECTIVE**  
Ride gusts without crashing into pipes..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sensors, events — *Mode 5 teaches sensors before harder modes stack concepts.*

**ROBOT EDGE**  
2.5D pipe corridor mastery

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Wind Gust Glide: Ride gusts without crashing into pipes.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 6 — Gravity Flip Flappy

> **Survive section with flipped gravity.**

| | |
|---|---|
| **Difficulty** | Medium · Puzzle |
| **Environment** | Flappy Sky Canopy (`flappy`) |
| **Arena type** | `flappy_bird` |

**PRIMARY OBJECTIVE**  
Survive section with flipped gravity..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
events, functions — *Mode 6 teaches events before harder modes stack concepts.*

**ROBOT EDGE**  
2.5D pipe corridor mastery

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Gravity Flip Flappy: Survive section with flipped gravity.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 7 — Precision Nest Landing

> **Land precisely in small nest.**

| | |
|---|---|
| **Difficulty** | Hard · Precision |
| **Environment** | Flappy Sky Canopy (`flappy`) |
| **Arena type** | `flappy_bird` |

**PRIMARY OBJECTIVE**  
Land precisely in small nest..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
functions, state machines — *Mode 7 teaches functions before harder modes stack concepts.*

**ROBOT EDGE**  
2.5D pipe corridor mastery

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Precision Nest Landing: Land precisely in small nest.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 8 — Balloon Pop Frenzy

> **Pop 15 balloons while flapping.**

| | |
|---|---|
| **Difficulty** | Hard · Collection |
| **Environment** | Flappy Sky Canopy (`flappy`) |
| **Arena type** | `flappy_bird` |

**PRIMARY OBJECTIVE**  
Pop 15 balloons while flapping..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
state machines, timing — *Mode 8 teaches state machines before harder modes stack concepts.*

**ROBOT EDGE**  
2.5D pipe corridor mastery

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Balloon Pop Frenzy: Pop 15 balloons while flapping.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 9 — Fortress Brick Demolition

> **Break brick wall with dive attack.**

| | |
|---|---|
| **Difficulty** | Hard · Combat |
| **Environment** | Flappy Sky Canopy (`flappy`) |
| **Arena type** | `flappy_bird` |

**PRIMARY OBJECTIVE**  
Break brick wall with dive attack..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
timing, optimization — *Mode 9 teaches timing before harder modes stack concepts.*

**ROBOT EDGE**  
2.5D pipe corridor mastery

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Fortress Brick Demolition: Break brick wall with dive attack.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 10 — Flappy Bird Master 100 (CAPSTONE)

> **Score 100 points — capstone flappy run.**

| | |
|---|---|
| **Difficulty** | Expert · Mastery |
| **Environment** | Flappy Sky Canopy (`flappy`) |
| **Arena type** | `flappy_bird` |

**PRIMARY OBJECTIVE**  
Score 100 points — capstone flappy run..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~15 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
optimization, sequential blocks — *Mode 10 teaches optimization before harder modes stack concepts.*

**ROBOT EDGE**  
2.5D pipe corridor mastery

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Score / target counter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Flappy Bird Master 100: Score 100 points — capstone flappy run.

**WIN MOMENT**  
Goal marker flashes green + star popup; mastery badge + confetti.


---

## CUSTOM ✨ — Sandbox Lab

### Mode 1 — Custom Test Drive

> **Test motors and wheels on open sandbox track.**

| | |
|---|---|
| **Difficulty** | Tutorial · Challenge |
| **Environment** | Custom Test Lab (`sandbox`) |
| **Arena type** | `auto_factory` |

**PRIMARY OBJECTIVE**  
Test motors and wheels on open sandbox track..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~3 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sequential blocks, variables — *Mode 1 teaches sequential blocks before harder modes stack concepts.*

**ROBOT EDGE**  
Test any block combination

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Custom Test Drive: Test motors and wheels on open sandbox track.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 2 — Custom Obstacle Course

> **Navigate user-placed obstacles.**

| | |
|---|---|
| **Difficulty** | Easy · Navigation |
| **Environment** | Custom Test Lab (`sandbox`) |
| **Arena type** | `checkpoint` |

**PRIMARY OBJECTIVE**  
Navigate user-placed obstacles..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~5 min (soft target)

**STARS**  
- ⭐ **Complete the objective**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
variables, loops — *Mode 2 teaches variables before harder modes stack concepts.*

**ROBOT EDGE**  
Test any block combination

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Complete the objective | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Custom Obstacle Course: Navigate user-placed obstacles.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 3 — Custom Sensor Calibration

> **Calibrate light, sonar, or IR sensors.**

| | |
|---|---|
| **Difficulty** | Easy · Calibration |
| **Environment** | Custom Test Lab (`sandbox`) |
| **Arena type** | `targets` |

**PRIMARY OBJECTIVE**  
Calibrate light, sonar, or IR sensors..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~6 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
loops, if/else — *Mode 3 teaches loops before harder modes stack concepts.*

**ROBOT EDGE**  
Test any block combination

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Custom Sensor Calibration: Calibrate light, sonar, or IR sensors.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 4 — Custom Block Sandbox

> **Freeplay all Blockly robot blocks.**

| | |
|---|---|
| **Difficulty** | Medium · Sandbox |
| **Environment** | Custom Test Lab (`sandbox`) |
| **Arena type** | `delivery` |

**PRIMARY OBJECTIVE**  
Freeplay all Blockly robot blocks..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
if/else, sensors — *Mode 4 teaches if/else before harder modes stack concepts.*

**ROBOT EDGE**  
Test any block combination

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Custom Block Sandbox: Freeplay all Blockly robot blocks.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 5 — Speed & Power Tuning

> **Tune torque and acceleration constants.**

| | |
|---|---|
| **Difficulty** | Medium · Tuning |
| **Environment** | Custom Test Lab (`sandbox`) |
| **Arena type** | `line_follow` |

**PRIMARY OBJECTIVE**  
Tune torque and acceleration constants..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~8 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Hit all checkpoints**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
sensors, events — *Mode 5 teaches sensors before harder modes stack concepts.*

**ROBOT EDGE**  
Test any block combination

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Hit all checkpoints | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Speed & Power Tuning: Tune torque and acceleration constants.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 6 — Custom Attachment Trial

> **Test arm, kicker, or shield attachment.**

| | |
|---|---|
| **Difficulty** | Medium · Attachment |
| **Environment** | Custom Test Lab (`sandbox`) |
| **Arena type** | `dodge_easy` |

**PRIMARY OBJECTIVE**  
Test arm, kicker, or shield attachment..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
events, functions — *Mode 6 teaches events before harder modes stack concepts.*

**ROBOT EDGE**  
Test any block combination

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Custom Attachment Trial: Test arm, kicker, or shield attachment.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 7 — Custom AI Logic Trainer

> **Train behavior tree on test bots.**

| | |
|---|---|
| **Difficulty** | Hard · AI |
| **Environment** | Custom Test Lab (`sandbox`) |
| **Arena type** | `power_garden` |

**PRIMARY OBJECTIVE**  
Train behavior tree on test bots..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~10 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
functions, state machines — *Mode 7 teaches functions before harder modes stack concepts.*

**ROBOT EDGE**  
Test any block combination

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Custom AI Logic Trainer: Train behavior tree on test bots.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 8 — Community Challenge Track

> **Play community-published track.**

| | |
|---|---|
| **Difficulty** | Hard · Community |
| **Environment** | Custom Test Lab (`sandbox`) |
| **Arena type** | `urban_obstacle` |

**PRIMARY OBJECTIVE**  
Play community-published track..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Clean run — no penalties**

**CODE TO LEARN**  
state machines, timing — *Mode 8 teaches state machines before harder modes stack concepts.*

**ROBOT EDGE**  
Test any block combination

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Clean run — no penalties

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Community Challenge Track: Play community-published track.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 9 — Custom Robot Duel

> **Fight preset bot with your build.**

| | |
|---|---|
| **Difficulty** | Hard · Duel |
| **Environment** | Custom Test Lab (`sandbox`) |
| **Arena type** | `crystal_caverns` |

**PRIMARY OBJECTIVE**  
Fight preset bot with your build..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~12 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
timing, optimization — *Mode 9 teaches timing before harder modes stack concepts.*

**ROBOT EDGE**  
Test any block combination

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Custom Robot Duel: Fight preset bot with your build.

**WIN MOMENT**  
Goal marker flashes green + star popup; unlocks next mode.


### Mode 10 — Custom Master Showcase (CAPSTONE)

> **Present final robot in showcase arena.**

| | |
|---|---|
| **Difficulty** | Expert · Showcase |
| **Environment** | Custom Test Lab (`sandbox`) |
| **Arena type** | `warehouse` |

**PRIMARY OBJECTIVE**  
Present final robot in showcase arena..

**FAIL / RESTART**  
respawn or restart if you fall off track, take too much damage, trigger alarms, or miss critical objectives.

**TIME**  
~15 min (soft target)

**STARS**  
- ⭐ **Finish the mission**  
- ⭐⭐ **Beat the time target**  
- ⭐⭐⭐ **Perfect mastery run**

**CODE TO LEARN**  
optimization, sequential blocks — *Mode 10 teaches optimization before harder modes stack concepts.*

**ROBOT EDGE**  
Test any block combination

**ON-SCREEN HUD**  
- Mission title + timer (top bar)
- Checkpoint progress (e.g. 3/8)
- Health / armor bar
- Alarm status / detection meter
- Minimap (bottom-left)
- Star tiers: ⭐ Finish the mission | ⭐⭐ Beat the time target | ⭐⭐⭐ Perfect mastery run

**WHAT IT LOOKS LIKE**  


**INTERACT IN WORLD**  
Custom Master Showcase: Present final robot in showcase arena.

**WIN MOMENT**  
Goal marker flashes green + star popup; mastery badge + confetti.


---


**Total missions documented: 330**

# PART 4 — IMPLEMENTATION CHECKLIST

| Step | File | Action |
|------|------|--------|
| Route arenaType | `AdventureArenaBuilder.js` `PREMIUM_BUILDERS` | Map string → builder |
| Build scenery | `FamilyArenaBuilders.js` / `PremiumArenas.js` | Sky, fog, terrain, hero props |
| Mode props | `ArenaModeDressing.js` + `ArenaSceneryKit.js` | Per-mode-index landmarks |
| Mission layer | `MissionArenaBuilder.js` | Collectibles, obstacles from `arenaSetup` |
| Objective HUD | `MissionPresentation.js` | Banner text from `gameplayDescription` |
| Atmosphere | `sim-visual-polish.js` | Particles + horizon even when `customSky` |

**Acceptance:** Kid sees objective banner, 3 star targets, themed scenery (not grey void), green goal marker.

---

# END