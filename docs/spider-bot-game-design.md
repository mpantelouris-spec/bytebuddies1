# Spider Bot — Game Mode Design

**ByteBuddies Robot Studio · 10-arena climbing adventure · ages 7–11**

> Shrink down, stick to anything, and code your way through ten impossible worlds.

Spider Bot is a 3D platform-adventure where children steer **Byte**, a small wall-climbing robot spider, through ten hand-built arenas. Tone and feel target *Astro Bot*, *Super Mario Odyssey* and *It Takes Two*: bright, toy-like, tactile, generous with secrets, and never punishing. It is explicitly **not** voxel (Minecraft) or user-generated-looking (Roblox), and **not** realistic.

Every arena introduces one new movement mechanic and one new programming idea, and the two are designed to reinforce each other. The player explores freely with direct controls, and meets **Code Gates**: puzzles that can only be solved by programming Byte with blocks.

---

## Contents

1. [Design pillars](#1-design-pillars)
2. [Byte the spider: moveset](#2-byte-the-spider-moveset)
3. [How coding fits the play](#3-how-coding-fits-the-play)
4. [Arena structure (every arena)](#4-arena-structure-every-arena)
5. [Campaign overview](#5-campaign-overview)
6. Arenas 1–10 (sections [6](#6-arena-1--the-giant-garden)–[15](#15-arena-10--the-clockwork-castle))
7. [Art direction](#16-art-direction)
8. [Technical plan (Three.js / WebGPU)](#17-technical-plan-threejs--webgpu)
9. [Camera, audio, feel](#18-camera-audio-feel)
10. [Accessibility and child safety](#19-accessibility-and-child-safety)
11. [Fit with the existing codebase](#20-fit-with-the-existing-codebase)
12. [Production plan](#21-production-plan)

---

## 1. Design pillars

| Pillar | What it means in practice |
|---|---|
| **Stick to anything** | Any surface marked *climbable* (bark, stone, fabric, metal grates) can be walked on at any angle. Climbing is the joy, not a chore. |
| **Every arena teaches one new thing** | One headline mechanic plus one programming concept per arena, introduced safely, then tested, then combined. |
| **Code is a superpower, not homework** | Coding lets Byte do things hands can't: perfect timing, repeating, reacting to sensors. Code Gates feel like casting a spell. |
| **Toy-box spectacle** | Giant-scale worlds seen from an insect's view. Every arena has a "wow" reveal in its intro and a bigger one at its finale. |
| **Kind failure** | No lives, no game over. Falling respawns at the last web-anchor within 1.5 s. Bosses have no damage race: they are puzzles. |
| **Secrets reward curiosity** | Every arena hides collectibles and a shortcut, discoverable by thinking like a spider (look up, go under, climb the back). |

---

## 2. Byte the spider: moveset

Byte's full kit is unlocked gradually (see [Campaign overview](#5-campaign-overview)). Controls are shown for keyboard; gamepad and touch mappings are in §19.

| Move | Input | Unlocked | Behaviour |
|---|---|---|---|
| **Walk** | WASD / left stick | Arena 1 | Camera-relative, ~4 m/s at world scale. Legs use procedural IK so they plant on uneven ground. |
| **Wall climb** | Walk into a climbable surface | Arena 1 | Byte smoothly rotates onto the surface (≤0.25 s blend) and gravity becomes "into the surface". |
| **Jump / Hop** | Space | Arena 1 | Short hop; on a wall it pushes off along the surface normal. |
| **Web Swing** | Hold Web (E) near a glowing anchor | Arena 1 (intro), mastered Arena 4 | Pendulum swing on a rope. Release at the peak for distance. Anchors glow when in range. |
| **Web Bridge** | Web (E) on two bridge posts | Arena 2 | Spins a silk bridge between two posts. It lasts 12 s, then fades (the timer is shown as sparkles). |
| **Ceiling crawl** | Climb from a wall onto an overhang | Arena 3 | Same as wall climb, upside down. The camera flips smoothly and never rolls more than 30°. |
| **Tunnel crawl** | Walk into a tunnel mouth | Arena 5 | Legs tuck in and the camera drops to a tight follow. Tunnels are one-way-readable and always lit. |
| **Web Pull** | Web (E) on a lever or crate | Arena 6 | Tethers to an object and pulls it towards Byte (switches, crates, drawbridges). |
| **Web Tow** | Web (E) on a trapped robot | Arena 7 | Tethers a rescued robot, which follows Byte until it reaches a rescue pad. |
| **Web Glide** | Hold Jump in the air | Arena 8 | A silk parachute that rides wind currents (visible as streaks). |
| **Glow Web** | Web (E) between two crystals | Arena 9 | A web that carries power. Links crystals to generators to light dark areas. |
| **Time Sync** | Automatic in Arena 10 | Arena 10 | Moving scenery pauses for 1 beat when Byte lands on it (assist, can be turned off). |

**Safety rules for the moveset:**
- Web anchors, bridge posts and levers always use the same **gold ring** visual, so children learn one symbol.
- Climbable surfaces have a subtle **silk sheen**; non-climbable ones (glass, ice, wet tiles, hot pans) are visibly glossy or steaming.
- Byte can never fall out of the world. Kill volumes are replaced by **catch nets** that bounce Byte back to the last anchor.

---

## 3. How coding fits the play

Children control Byte directly to explore. **Code Gates** are glowing hexagon pads with a floating block icon. Stepping on one opens the block editor (the existing Blockly workspace) with a pre-built starter program and a clear goal. Pressing ▶ runs the program on Byte while the camera frames the puzzle.

**Three kinds of Code Gate:**
1. **Path puzzle:** program Byte's route across a hazard, e.g. *step, step, climb, swing*.
2. **Machine puzzle:** program the world instead of Byte, e.g. *when switch pressed → open gate*.
3. **Helper puzzle:** program a rescued robot, e.g. a loop that makes a lift robot go up and down.

**Scaffolding per gate:**
- **Easy:** starter blocks are already placed; the child fixes one wrong block.
- **Medium:** the child picks from 4–6 highlighted blocks.
- **Expert:** a free workspace, with the minimum block count shown as a ★ target.

**Stars:** every gate awards 1–3 ★. One ★ for solving it, two for using fewer blocks than the target, three for also using the arena's new concept (for example using a Repeat instead of copying blocks). Stars are never required to progress.

**New blocks introduced by Spider Bot** (added to the existing walker category):

| Block | Concept | Arena |
|---|---|---|
| `climb up/down/left/right [n]` | Movement | 1 |
| `when I touch [leaf ▾]` | Events | 1 |
| `shoot web to [anchor ▾]`, `swing` | Sequence | 1 |
| `repeat [n]` *(existing)*, `define function [name]` | Loops, Functions | 2 |
| `spin bridge to [post ▾]` | Functions | 2 |
| `set [variable] to`, `change [variable] by` *(existing)*, `if [condition] then` | Variables, Conditions | 3 |
| `wait [n] seconds`, `every [n] seconds do` | Timers | 4 |
| `sense [heat / water / steam ▾] ahead?` | Sensors | 5 |
| `if … and/or … then` | Multiple conditions | 6 |
| `set [machine] state to [on/off/fixed ▾]`, `when state changes` | State | 7 |
| `wind direction`, `find path to [island ▾]` | Pathfinding | 8 |
| `power of [crystal ▾]`, nested `if` | Nested logic, power systems | 9 |
| `when [spider king ▾] does [attack ▾]`, `behaviour [name]` | AI behaviour | 10 |

---

## 4. Arena structure (every arena)

Each arena follows the same ten beats, so children always know where they are in a level:

| # | Beat | Purpose | Typical length |
|---|---|---|---|
| 1 | **Intro cinematic** | 15–25 s fly-through showing the goal and the "wow" landmark. Skippable after first view. | 20 s |
| 2 | **Safe tutorial area** | A walled, no-fail space that teaches the new mechanic with 3 bite-size steps and on-screen prompts. | 1–2 min |
| 3 | **Main objective** | The arena's core challenge, split into 3 checkpointed zones. | 5–15 min |
| 4 | **Optional side objectives** | 2–3 small tasks (rescues, deliveries, challenges). | 2–5 min |
| 5 | **Hidden collectibles** | 5 **Golden Bytes** (big secrets) plus 100 **Byte Crystals** (breadcrumbs). | — |
| 6 | **Secret shortcut** | A route that skips a zone, found by thinking like a spider (under, behind, above). | — |
| 7 | **Mini boss** | A puzzle-boss that tests the new mechanic plus the new code concept. No health bar for Byte. | 2–4 min |
| 8 | **Final objective** | A short spectacular sequence (escape, ascent, reveal). | 1–2 min |
| 9 | **Celebration area** | Rescued robots cheer, confetti, a photo-mode moment, results card (★, crystals, time). | 30 s |
| 10 | **Unlock reward** | A new cosmetic, move or hub decoration, plus the next arena. | — |

**Collectible totals across the campaign:** 1,000 Byte Crystals, 50 Golden Bytes, 30 rescued robots, 10 cosmetic unlocks.

---

## 5. Campaign overview

| # | Arena | New mechanic | Programming concept | Play area* | Target time |
|---|---|---|---|---|---|
| 1 | The Giant Garden | Wall climb + first web swing | Movement, Events, Sequences | 60 × 60 × 25 m | 8–10 min |
| 2 | Treehouse Kingdom | Web Bridge | Loops, Functions, Repeat | 70 × 70 × 55 m | 10–12 min |
| 3 | The Toy Room | Ceiling crawl + moving platforms | Variables, Events, Conditions | 90 × 80 × 35 m | 12–14 min |
| 4 | The Sweet Factory | Web Swing mastery (timing) | Timers, Events, Loops | 100 × 90 × 40 m | 13–15 min |
| 5 | The Giant Kitchen | Tunnel crawl + sensor scan | Sensors, Conditions, Timing | 110 × 100 × 45 m | 14–16 min |
| 6 | The Ancient Temple | Web Pull | Functions, Logic, Multiple conditions | 130 × 110 × 60 m | 15–18 min |
| 7 | The Robot Factory | Web Tow (rescue) | State changes, Variables, Functions | 140 × 130 × 55 m | 16–19 min |
| 8 | Sky Islands | Web Glide on wind | Wind direction, Variables, Pathfinding | 180 × 180 × 90 m | 18–20 min |
| 9 | Crystal Caverns | Glow Web (carry power) | Power systems, Variables, Functions, Nested logic | 160 × 150 × 70 m | 18–22 min |
| 10 | The Clockwork Castle | Time Sync (everything moves) | Everything, plus AI behaviour | 200 × 200 × 120 m | 25–30 min |

\*Play area in Byte-scale metres (Byte is ~0.4 m long in these units). Each arena is larger than the previous one in footprint, height or both.

**Hub: the Web Workshop.** A cosy attic between arenas where Byte's rescued robots live, cosmetics are shown off and arenas are selected on a giant globe. Rescued robots from each arena move in and add decorations.

---

## 6. Arena 1 — The Giant Garden

**Visual identity:** Byte has shrunk to insect size in a sunny back garden. Grass blades are a forest, daisies tower like buildings, a dew drop is a pond and tree roots are tunnels. Warm, soft, early-summer light.

**Palette:** fresh greens `#5cc85a`, buttercup yellow `#ffd23f`, sky blue `#7dd3fc`, blossom pink `#ff9ec7`, soft cream highlights.

**Landmark:** the **Queen Spider's Web**, a huge silver web strung between two sunflowers, glittering with dew, visible from everywhere.

**Ambient life:** slow ladybirds on leaves (moving platforms later), bees drifting between flowers, butterflies that land and take off.

**New mechanic:** wall climb (primary) and a guided first web swing.
**Programming:** Movement, Events, Sequences.

| Beat | Content |
|---|---|
| Intro cinematic | The camera shrinks with Byte from a normal garden view down to grass level. The Queen Spider's web glints in the distance. A worried bee explains the Queen is stuck. |
| Safe tutorial | **Pebble Patch.** 1) walk to a daisy; 2) walk straight into a pebble wall and discover you stick; 3) climb over the pebble onto a leaf. Prompt: *"Spiders stick to anything with texture!"* |
| Main objective | Reach the Queen's web. **Zone A** Grass Forest (climb stems, cross drooping leaves). **Zone B** Dewdrop Pond (first web swing over the puddle using 3 anchors). **Zone C** Sunflower Ascent (climb a stem spiral to the web). |
| Side objectives | Carry 3 seeds back to the ant queen · help a ladybird off its back (Code Gate: `when I touch ladybird → push`) · light 5 glow-worm lanterns. |
| Collectibles | Golden Bytes: inside a hollow acorn, under a snail shell, on the underside of a big leaf, behind the watering can, on top of the tallest dandelion. |
| Secret shortcut | A **root tunnel** under the stepping stones skips Zone B. Hinted by a trail of crystals disappearing into the soil. |
| Mini boss | **Grumble the Garden Gnome's Hose.** A hose sprays across the pond in a fixed pattern. Code Gate: write a 5-block sequence that times Byte's path across the leaves between sprays. |
| Final objective | Cut the Queen free by climbing her web and touching 3 tangled knots in order (sequence). |
| Celebration | The Queen spins a rainbow web. Bees, ladybirds and butterflies dance. |
| Unlock | **Dewdrop Visor** cosmetic, plus the Web Workshop hub. |

**Code Gates in this arena:**
- *Stepping Stones:* `move forward 2 · turn right · move forward 3` (fix one wrong turn).
- *Leaf Lift:* `when I touch [big leaf] → climb up 4`.
- *Pond Hop:* `shoot web to [anchor 1] · swing · shoot web to [anchor 2] · swing`.

---

## 7. Arena 2 — Treehouse Kingdom

**Visual identity:** a whole village of treehouses high in an ancient oak forest at golden hour. Rope bridges, lanterns, bird nests, a windmill-powered tree elevator. Everything is vertical, with long drops into soft mist far below.

**Palette:** warm oak browns `#8a5a2a`, moss green `#6fbf5a`, lantern amber `#ffb347`, sunset peach `#ffd8b0`, sky lilac.

**Landmark:** the **Crown House**, a treehouse castle at the very top with a spinning windmill.

**New mechanic:** Web Bridge (spin temporary bridges between posts).
**Programming:** Loops, Functions, Repeat.

| Beat | Content |
|---|---|
| Intro cinematic | The camera swoops up the trunk past houses and a broken bridge to the Crown House. A baby bird tumbles out of its nest onto a branch. |
| Safe tutorial | **Nursery Branch.** Spin one bridge across a small gap, then chain two. Prompt: *"Bridges fade, so keep moving!"* |
| Main objective | Reach the Crown House. **Zone A** Lantern Walk (repair 3 rope bridges). **Zone B** Tree Elevator (Code Gate: loop the elevator). **Zone C** Windmill Heights (bridges between moving windmill sails). |
| Side objectives | Return 3 baby birds to nests (Web Tow preview, scripted) · collect 10 wooden gears for the elevator · ring the 4 wind chimes in order. |
| Collectibles | Golden Bytes: inside a birdhouse, under a bridge plank, in the owl's hollow, on the windmill hub, in a lantern at the forest floor. |
| Secret shortcut | Climb the *back* of the main trunk (in shadow, marked by moss arrows) to skip Zone B. |
| Mini boss | **Mister Magpie.** He steals gears and hops between perches in a repeating pattern. Code Gate: define a function `catch` (web, pull) and use `repeat 3 [catch]` to recover the gears. |
| Final objective | Rebuild the Crown House bridge with a function called 3 times as the wind picks up. |
| Celebration | Lanterns light up the whole village and the birds sing. |
| Unlock | **Acorn Helmet** cosmetic, plus bridges lasting 50% longer in Free Play. |

**Code Gates:** repeat a bridge-building pattern (`repeat 4 [spin bridge · walk]`), loop the elevator (`forever [up · wait · down · wait]`), and a function `hop gap` reused 3 times.

---

## 8. Arena 3 — The Toy Room

**Visual identity:** a gigantic child's bedroom at night-light time. Brick castles, a toy train looping the floor, stacks of books like cliffs, pillows as mountains, a blanket cave, glow-in-the-dark stars on the ceiling. Colourful, playful, slightly magical.

**Palette:** primary red `#e8262c`, toy blue `#2f6fdc`, sunny yellow `#ffd23f`, night-light purple `#6b4bd8`, star glow `#fff6c2`.

**Landmark:** the **Bookshelf Mountain** with a glowing star mobile hanging above it.

**New mechanic:** Ceiling crawl, plus riding moving platforms (toy trains, RC cars).
**Programming:** Variables, Events, Conditions.

| Beat | Content |
|---|---|
| Intro cinematic | A toy robot's lost battery rolls under the bed. The camera follows the train around the room, up the bookshelf to the star mobile. |
| Safe tutorial | **Under the Desk.** Climb a desk leg, walk onto the underside of the desk and cross it upside down. Prompt: *"Upside down is still the right way up for a spider!"* |
| Main objective | Collect 5 lost toy parts to fix Robo-Buddy. **Zone A** Train Line (ride and hop off at stations). **Zone B** Blanket Caves (ceiling crawl inside a fabric cave). **Zone C** Bookshelf Mountain (climb book spines). |
| Side objectives | Race an RC car · build a brick tower to reach a shelf (count variable) · wake 5 sleeping toys. |
| Collectibles | Golden Bytes: in the toy chest, inside a board-game box, on the ceiling star, behind the radiator, on the train's chimney. |
| Secret shortcut | The **heating vent** under the window links the floor to the bookshelf. |
| Mini boss | **Robo-Vac 3000.** A robot vacuum sweeps the floor, changing route when it bumps things. Code Gate: `if vacuum is near then climb up else walk forward`, with a variable counting its laps. |
| Final objective | Crawl across the ceiling to the star mobile and plug the battery into Robo-Buddy as the night-light flickers. |
| Celebration | All the toys come alive and parade on the train. |
| Unlock | **Toy Crown** cosmetic, plus a toy train in the hub. |

**Code Gates:** a `toys found` variable that opens a gate at 5; `when train arrives → jump on`; `if light is on then wait else crawl`.

---

## 9. Arena 4 — The Sweet Factory

**Visual identity:** a magical candy factory. Chocolate rivers, cookie conveyor belts, marshmallow trampolines, candy-cane bridges, chocolate waterfalls and a lollipop forest. Glossy, sugary and bouncy.

**Palette:** chocolate `#6b3e26`, strawberry pink `#ff6fb5`, mint `#7fe3c1`, caramel `#e8a13a`, cream `#fff4e0`.

**Landmark:** the **Gobstopper Tower**, a rotating candy machine as tall as a lighthouse.

**New mechanic:** Web Swing mastery. Timed swings between moving anchors over conveyors.
**Programming:** Timers, Events, Loops.

| Beat | Content |
|---|---|
| Intro cinematic | The factory hums to life. A machine jams, and chocolate starts to rise in the vats. |
| Safe tutorial | **Sprinkle Room.** Swing between 3 slowly moving anchors. A visible beat counter teaches the rhythm. |
| Main objective | Repair 3 chocolate machines. **Zone A** Cookie Conveyors (belts that change direction on a timer). **Zone B** Marshmallow Bounce (trampolines plus swings). **Zone C** Chocolate Falls (swing across falling chocolate). |
| Side objectives | Sort 10 sweets into colour bins · a wrapper-catching timed mini-game · find the golden ticket. |
| Collectibles | Golden Bytes: inside a gumball machine, behind the chocolate waterfall, on top of the lollipop forest, under the conveyor, in a wrapper bin. |
| Secret shortcut | A **candy-cane pipe** slide from Zone A to Zone C. |
| Mini boss | **The Gummy Golem.** It stomps in a repeating rhythm and jelly waves roll out. Code Gate: `every 2 seconds do [jump]` synced to the waves, then `wait` for the opening. |
| Final objective | Escape as chocolate floods the factory floor, with swings racing up the Gobstopper Tower (a visible timer, generous). |
| Celebration | Fireworks of sprinkles, and the machines make a giant cake. |
| Unlock | **Candy Stripe** paint job. |

**Code Gates:** `every 3 seconds do` to flip a conveyor; `wait 2 · swing` to time a gap; `repeat until chocolate is full [pump]`.

---

## 10. Arena 5 — The Giant Kitchen

**Visual identity:** a huge modern kitchen. Plates are platforms, cupboards are towers, the fridge is a mountain, running taps are rivers. Clean whites and steel with bright produce colours. Gentle steam and water caustics.

**Palette:** clean white `#f6f8fb`, brushed steel `#b8c2cc`, tomato red `#e84a3a`, lemon `#ffe14d`, herb green `#4caf50`, water teal `#4ac7d9`.

**Landmark:** the **Cookie Jar**, glowing on top of the fridge.

**New mechanic:** Tunnel crawl (under the sink, through pipes and drawers) plus **sensor scan**: Byte's eye reveals hot, wet or steamy surfaces as a colour overlay.
**Programming:** Sensors, Conditions, Timing.

| Beat | Content |
|---|---|
| Intro cinematic | A tap is left running and the sink starts to overflow. The camera pans up the fridge to the cookie jar. |
| Safe tutorial | **Spice Rack.** Crawl through a pepper-grinder tunnel, then scan three pans (one is hot). Prompt: *"Scan before you step!"* |
| Main objective | Turn off 3 leaking taps and reach the cookie jar. **Zone A** Sink Canyon (crawl through the drain pipes). **Zone B** Stove Top (hot and cold pans switch). **Zone C** Fridge Face (climb the magnet ladder). |
| Side objectives | Rescue a trapped kitchen robot from a drawer · stack 5 cups · find the missing lid. |
| Collectibles | Golden Bytes: in the toaster, under a pan, behind the kettle, in the ice tray, on the extractor hood. |
| Secret shortcut | The **dishwasher pipe** leads straight to the fridge. |
| Mini boss | **Sir Kettle.** It boils and steams in bursts. Code Gate: `if sense steam ahead then wait else move forward`. |
| Final objective | Climb the fridge as the ice-maker drops cubes, using sensors to pick safe moments. |
| Celebration | Cookies for everyone, and the rescued robot makes a pancake stack. |
| Unlock | **Chef's Hat** cosmetic, plus the Sensor Scan in Free Play. |

**Code Gates:** `if sense heat ahead then turn`; `when water level > 3 then close tap`; a timing gate using `wait until pan is cool`.

---

## 11. Arena 6 — The Ancient Temple

**Visual identity:** a lost jungle civilisation. Massive stone ruins, waterfalls, vines, giant statues and hidden chambers, all mossy stone and turquoise water with shafts of green light.

**Palette:** mossy stone `#8a8f7a`, jade `#2fb58a`, gold `#e3b341`, waterfall aqua `#7fe0f0`, deep jungle `#1f5b3a`.

**Landmark:** the **Sun Idol**, a giant statue whose eyes light up as switches are activated.

**New mechanic:** Web Pull (tether levers, crates and doors).
**Programming:** Functions, Logic, Multiple conditions.

| Beat | Content |
|---|---|
| Intro cinematic | Vines part to reveal the temple. The Sun Idol's eyes are dark, and a stone door is sealed. |
| Safe tutorial | **Courtyard.** Pull a lever, pull a crate onto a switch, pull a vine curtain open. |
| Main objective | Light the Sun Idol's 3 eyes. **Zone A** Waterfall Hall. **Zone B** Pressure-plate Maze (two plates must be pressed at once: crate plus Byte). **Zone C** Statue Garden (rotate statues to face the sun). |
| Side objectives | Decode a picture-glyph message · rescue an explorer robot · restore 3 fountains. |
| Collectibles | Golden Bytes: behind the waterfall, in a statue's mouth, under a collapsing bridge, in the hidden chamber, on the idol's crown. |
| Secret shortcut | Climb **inside the hollow statue** to skip Zone B. |
| Mini boss | **The Stone Guardian.** It opens its shield only when two torches are lit *and* the gong has rung. Code Gate: `if torch A and torch B are lit and gong rang then pull shield`. |
| Final objective | Escape the collapsing ruins with a web-pull chase down the waterfall stairs. |
| Celebration | The temple glows gold, and treasure fountains shower crystals. |
| Unlock | **Explorer Hat** cosmetic, plus Web Pull in Free Play. |

**Code Gates:** a function `open door` (pull, walk, pull); `if plate 1 and plate 2 then open`; `if torch or sun then light`.

---

## 12. Arena 7 — The Robot Factory

**Visual identity:** a huge, friendly robot production facility. Conveyor belts, mechanical arms, assembly lines, cooling fans, laser scanners, ceiling pipes and vent shafts. Industrial but cheerful, with safety-yellow and teal accents.

**Palette:** safety yellow `#ffc21a`, steel blue `#4a6a8a`, factory teal `#1fb5a8`, warning orange `#ff7a1a`, neon cyan `#5ee0ff`.

**Landmark:** the **Master Assembler**, a giant robot arm in the middle of the factory floor.

**New mechanic:** Web Tow (tether broken robots and tow them to repair pads) plus crawling on ceiling pipes.
**Programming:** State changes, Variables, Functions.

| Beat | Content |
|---|---|
| Intro cinematic | Sirens flash and robots stumble. The Master Assembler has glitched and is building things wrong. |
| Safe tutorial | **Repair Bay.** Tow one robot onto a pad and watch its state change from `broken` to `fixed`. |
| Main objective | Repair 5 robots and reboot the factory. **Zone A** Assembly Lines. **Zone B** Laser Scanner Hall (scanners have on, off and warning states). **Zone C** Vent Shafts to the control room. |
| Side objectives | Sort parts by colour · repaint 3 robots · find the lost factory cat-bot. |
| Collectibles | Golden Bytes: in a parts crate, on a crane hook, inside a fan housing, in the vent maze, on the Assembler's shoulder. |
| Secret shortcut | Ride the **parts crane** from Zone A to Zone C. |
| Mini boss | **Glitch Arm.** It cycles between states: `sweep` → `grab` → `rest`. Code Gate: `when arm state = rest then move`, with a counter variable. |
| Final objective | Escape the overload sequence along the ceiling pipes as the lights cascade red then green. |
| Celebration | The repaired robots form a conga line and the Assembler builds Byte a trophy. |
| Unlock | **Robo-Wrench** cosmetic, plus a factory robot in the hub. |

**Code Gates:** `set scanner state to off`; `when state changes to fixed then change robots fixed by 1`; a function `repair` (tow, place, press).

---

## 13. Arena 8 — Sky Islands

**Visual identity:** floating islands in a bright sky, connected by giant webs. Waterfalls pour off the edges into the clouds, windmills turn, gentle **sky whales** drift by, and rainbow bridges link ancient floating ruins. Airy, wide open and breathtaking.

**Palette:** sky cyan `#8fd8ff`, cloud white `#ffffff`, grass lime `#7ad957`, rainbow accents, ruin sandstone `#e8dcc4`, sunset gold on the horizon.

**Landmark:** the **Great Wind Engine** on the highest island, with a sky whale circling it.

**New mechanic:** Web Glide, riding visible wind currents between islands.
**Programming:** Wind direction, Variables, Pathfinding.

| Beat | Content |
|---|---|
| Intro cinematic | A sky whale swims past the camera. The Wind Engine sputters, and islands begin to drift apart. |
| Safe tutorial | **Nest Island.** Glide off a ledge, catch an updraft, land on a cloud pad. |
| Main objective | Repair 3 wind generators. **Zone A** Waterfall Isles. **Zone B** Rainbow Bridges (bridges appear when generators spin). **Zone C** Storm Front (gusts change direction). |
| Side objectives | Ride the sky whale's back · deliver mail to 4 islands · catch 10 floating seeds. |
| Collectibles | Golden Bytes: under an island's rocky base, behind a waterfall, on the whale's fin, in a floating ruin, at the top of the Wind Engine. |
| Secret shortcut | A **hidden updraft** column behind the first waterfall rockets Byte to Zone C. |
| Mini boss | **The Storm Kite.** A giant kite blows gusts in rotating directions. Code Gate: `if wind direction = left then glide right`, with a variable storing the last gust. |
| Final objective | Climb the Wind Engine as it restarts and glide down through all three rainbow bridges. |
| Celebration | Rainbows fill the sky and the whales sing. |
| Unlock | **Cloud Cape** cosmetic, plus Web Glide in Free Play. |

**Code Gates:** `find path to [island]` (children arrange path steps on a grid map); `set heading to wind direction`; `if gust then hold web`.

---

## 14. Arena 9 — Crystal Caverns

**Visual identity:** glowing underground caves. Blue and purple crystals, still underground lakes that mirror the ceiling, crystal bridges, bioluminescent plants and old mining carts. Dark, magical and calm, lit by the crystals themselves.

**Palette:** deep navy `#0b1230`, crystal blue `#3fa7ff`, amethyst `#a855f7`, bioluminescent teal `#2fe0c8`, warm lantern amber accents.

**Landmark:** the **Heart Crystal**, a giant dim crystal in the central cavern that lights the whole cave when powered.

**New mechanic:** Glow Web, a web that carries power. Link charged crystals to generators to light paths and reveal hidden routes.
**Programming:** Power systems, Variables, Functions, Nested logic.

| Beat | Content |
|---|---|
| Intro cinematic | The mine lights fail. Miners' lamps flicker and the Heart Crystal is dark. |
| Safe tutorial | **Lamp Room.** Link one crystal to one lamp, then chain two crystals to reach a far lamp. |
| Main objective | Recharge 3 crystal generators. **Zone A** Mirror Lake (crystal bridges). **Zone B** Mine Rails (ride carts). **Zone C** Dark Galleries (only lit where webs carry power). |
| Side objectives | Rescue 3 trapped miners · map the cave (visit 6 viewpoints) · grow 5 glow-mushrooms. |
| Collectibles | Golden Bytes: under the lake, inside a geode, on the mine lift, behind a crystal curtain, in the Heart Crystal's core. |
| Secret shortcut | An **old mine shaft** reachable only by ceiling crawl. |
| Mini boss | **The Shadow Moth.** It drains light from nearby crystals. Code Gate: `if power of crystal < 3 then (if moth nearby then hide else recharge)`. |
| Final objective | Power the Heart Crystal by linking every generator, as the cave lights up in a wave. |
| Celebration | The whole cavern sparkles and the miners sing. |
| Unlock | **Crystal Legs** cosmetic, plus the Glow Web in Free Play. |

**Code Gates:** a `power` variable shared by crystals; a function `link (crystal, lamp)`; nested `if` for choosing which crystal to charge.

---

## 15. Arena 10 — The Clockwork Castle

**Visual identity:** the grand finale. A giant mechanical castle where *everything moves*: massive gears, clock towers, swinging pendulums, sliding walls, rotating bridges, steam engines and chains. Bronze and brass under a stormy violet sky, lit by warm clock-face glows.

**Palette:** brass `#c8963e`, bronze `#8a5a2a`, steel `#6a7a8a`, clock-face ivory `#f4ecd8`, steam white, royal violet sky `#3a2a6a`.

**Landmark:** the **Great Clock Tower**, whose clock hands are bridges that sweep around the face.

**New mechanic:** Time Sync. The whole arena runs on the castle's clock, and every mechanic from arenas 1–9 is combined.
**Programming:** Every concept so far, plus **AI behaviour** (designing how the boss's helpers act).

| Beat | Content |
|---|---|
| Intro cinematic | The camera sweeps through spinning gears to the throne room. The **Mechanical Spider King** wakes and the castle shudders into motion. |
| Safe tutorial | **Gatehouse Gears.** A short refresher that chains climb, swing, bridge and glide, with one-line prompts. |
| Main objective | Repair the giant clock, then climb the tower. **Zone A** Gear Courtyard (walls slide on the clock). **Zone B** Pendulum Hall (swing between pendulums). **Zone C** Steam Engine Room (glow-webs power the engines). **Zone D** Clock Face (ride the rotating hands). |
| Side objectives | Rescue the 10 clockwork knights · tune the 5 chime bells · race the clock (time trial). |
| Collectibles | Golden Bytes: inside the cuckoo, behind the pendulum, on the moving chain, in the engine firebox, at the tip of the minute hand. |
| Secret shortcut | Ride the **counterweight chain** from Zone A straight to Zone D. |
| Mini boss | **The Pendulum Knights** (mid-arena): two knights that mirror each other's moves. Code Gate: a loop with a condition to slip between them. |
| Final boss | **The Mechanical Spider King.** A three-phase puzzle battle: 1) climb his legs while they move in a pattern (sequences, loops); 2) reprogram his helper drones' behaviour (`when drone sees Byte then return to base`); 3) power down his core by linking glow-webs in the right order under a timer (functions, variables, timers). |
| Final objective | Escape as the castle "comes alive": a full-mechanic finale run down the tower, finishing with a glide through the clock face. |
| Celebration | Every rescued robot from all ten arenas appears in a grand parade, and the Queen Spider crowns Byte. |
| Unlock | **Golden Byte crown**, the true ending, and **Free Play Castle** mode. |

**Code Gates:** behaviour design (`when [drone] sees Byte → [return/help/wait]`), a timer plus variable to track the clock, and functions combining earlier moves.

---

## 16. Art direction

**Style:** stylised, rounded, toy-like forms with clean silhouettes and chunky bevels. Soft but directional light, warm rim light on characters, saturated but not neon colours. Think **Astro Bot's plastic-toy charm** and **Mario Odyssey's bold readable shapes**, with **It Takes Two's giant-scale everyday objects**.

**Rules:**
- **One dominant hue per arena**, with a complementary accent, so no two arenas ever read the same (see palettes above).
- **Scale storytelling:** use familiar objects (buttons, cups, books) to sell Byte's tiny size.
- **Shape language:** round for friendly (gardens, toys), angular for challenge (temple, factory), rhythmic for mechanical (castle).
- **Readable gameplay colours:** climbable surfaces have a silk sheen, hazards are red/orange with a pulse, anchors and levers are gold rings, and collectibles are cyan crystals.
- **Byte:** chunky round body, big expressive eye screen, 8 springy legs, and a colour-swappable shell for cosmetics. The screen shows emotions (happy, surprised, determined).

---

## 17. Technical plan (Three.js / WebGPU)

**Renderer:**
- WebGL2 baseline with a WebGPU path (Three.js `WebGPURenderer`) where supported.
- ACES tone mapping, sRGB output, and one directional sun with cascaded shadows (2 cascades) for Byte and nearby props only.

**Lighting:** baked lightmaps (Blender Cycles bake, packed into the second UV channel) for static environments, plus light probes for dynamic objects. Emissive elements (crystals, lanterns) use bloom via a single post pass.

**Assets:**
- glTF 2.0 with Draco (or meshopt) geometry compression and KTX2/Basis textures.
- Stylised PBR: albedo plus a packed ORM texture (occlusion, roughness, metalness), with 2K atlases per arena.
- Modular kits (walls, floors, trims) snapped on a 1 m grid.

**Foliage and repetition:** `InstancedMesh` for grass, flowers, crystals, gears and bolts, with per-instance colour variation and a vertex-shader wind sway. Target ≤ 30 instanced batches per arena.

**Performance budget** (per camera view, mid-range laptop at 60 fps and 1080p):

| Resource | Budget |
|---|---|
| Draw calls | ≤ 250 |
| Visible triangles | ≤ 1.2 M |
| Texture memory | ≤ 350 MB (KTX2) |
| Shadow-casting lights | 1 |
| Post passes | 1 (bloom plus colour grade combined) |

**Streaming:** each arena is split into 3–4 zones loaded ahead of the player, and far zones use low-detail stand-ins (LOD2 impostors).

**Climbing system (no heavy physics needed):**
- A capsule controller casts 5 short rays (down, forward, and 3 around the body) against a **climb collision mesh** (a simplified, low-poly version of the level).
- Byte's up-vector slerps towards the averaged surface normal, and gravity is applied along the negative up-vector.
- Legs use two-bone IK towards raycast foot targets, with a step when a foot drifts more than 0.35 body lengths.

**Webs:**
- Swing: pendulum constraint (Verlet, 12-segment rope for visuals).
- Bridge: a spline between posts, rendered as an extruded tube with a silk shader, and given a temporary collider.
- Pull, Tow and Glow: rope constraints with a spring limit.
- Wind (Arena 8): a 3D flow-field texture sampled by the glide controller.

**Moving worlds (Arenas 4, 7, 10):** all moving platforms run on a shared **level clock** (beats per minute per arena), so code timers, animations and music stay in sync. The same clock drives the Time Sync assist.

**Cinematics:** camera splines authored as glTF animation tracks. Intros are skippable and cached as seen.

**Save data:** per-arena progress (★, crystals, Golden Bytes, rescued robots, cosmetics) saved via the existing `GameProgress` service, plus cloud sync where the user is signed in.

---

## 18. Camera, audio, feel

**Camera:**
- A third-person follow with gentle auto-framing towards goals.
- On walls it keeps the world up where possible; on ceilings it limits roll to 30° to avoid motion sickness.
- Tunnels switch to a close follow.
- Code Gate runs use a wide "puzzle cam".

**Feel:**
- Squash and stretch on landings, dust puffs, silk sparkles on web shots and a leg-patter sound on every step.
- Coyote time (0.15 s) and jump buffering (0.12 s).
- Swing release is forgiving: the arc is predicted with a faint dotted line.

**Audio:**
- An adaptive score per arena: garden strings and woodwinds, treehouse folk, toy-box glockenspiel, sweet-factory swing, kitchen percussion made from utensils, temple marimba, factory electro, sky choir, crystal pads, castle orchestra with a ticking clock.
- Code Gate runs play a musical "success phrase" per block executed.

---

## 19. Accessibility and child safety

- **Assist mode:** longer bridge time, slower hazards, a stronger Time Sync assist and a highlighted path.
- **Controls:** remappable keyboard; gamepad support; on tablets, touch controls with a virtual stick and a big Web button.
- **Readability:** a colour-blind-safe hazard palette (shape plus colour), subtitles for all voice lines and icon-first prompts for pre-readers.
- **Comfort:** a reduced-motion option (fewer camera sweeps, no screen shake).
- **No combat violence:** bosses are "calmed", "repaired" or "freed", never destroyed. There are no timers with failure consequences, only a gentle retry.
- **Privacy:** no chat, no user-generated content sharing and no data collection beyond the existing ByteBuddies progress save.

---

## 20. Fit with the existing codebase

What Spider Bot can build on today:

| Need | Existing piece |
|---|---|
| Spider robot model | `buildSpider()` in `src/virtual-robot-designer/services/studio-robot-builder.js`. Needs a new hero model (see Byte above), but the leg rig pattern can be reused. |
| Block coding | Blockly workspace and walker blocks in `studio/LiveLabPage.jsx` (`robot_step_forward`, `robot_spider_crawl`, `robot_leap`, `robot_stabilize_legs`). |
| Arena list and names | `ROBOT_ARENA_SETS.spider` in `data/robot-arena-sets.js` (currently 10 web/ruins arenas; to be replaced by the 10 arenas in this document). |
| Theme recipes and props | `studio/mission-world/themes/recipes/spider.js` and the `spiderWeb` prop. Useful as greybox placeholders only. |
| Progress and XP | `services/game-progress.js` (`GameProgress`). |
| Physics | `cannon-es` is vendored (`public/robot-studio/vendor`), but the climb controller above does not need a physics engine. |

**What is new** (and larger than the current mission engine supports):
- The climb controller and web systems.
- Zone streaming.
- Baked-lighting asset pipeline.
- Cinematics.
- Hub.
- Level clock.
- Code Gate runner that pauses free play and runs blocks on Byte.

**Recommendation:** build Spider Bot as its **own game module** (e.g. `src/virtual-robot-designer/spider-bot/`) that reuses the Blockly workspace and progress services, rather than extending the general mission arena system, which is built for flat, route-following missions.

---

## 21. Production plan

| Phase | Scope | Exit criteria |
|---|---|---|
| **0. Prototype** | Greybox Arena 1 tutorial: climb controller, camera, one web swing, one Code Gate. | A child can climb a pebble, swing a gap and solve a gate. Holds 60 fps. |
| **1. Vertical slice** | Arena 1 complete with final art: all 10 beats, audio and save. | Playtest with 5+ children: they finish it unaided in ≤ 15 min and ask to play again. |
| **2. Core kit** | Web Bridge, ceiling crawl, moving platforms, level clock; Arenas 2–3. | Each new mechanic is taught in its tutorial without adult help. |
| **3. Content build** | Arenas 4–7, plus the hub. | Performance budget met on the target laptop in every zone. |
| **4. Advanced systems** | Glide and wind, glow-web power; Arenas 8–9. | Pathfinding and nested-logic gates are solvable by 9-year-olds in playtests. |
| **5. Finale** | Arena 10, the Spider King and the grand parade. | The full campaign completes in 2.5–3.5 hours. |
| **6. Polish** | Accessibility, localisation and QA. | No blocker bugs; assist mode is verified. |

**Art sourcing:** the stylised PBR assets this design calls for (giant flowers, toy-room props, candy machines, clockwork gears) are a significant art job. They could come from a stylised asset store pack per theme, commissioned 3D art, or an in-house artist working to the palettes above. The free CC0 kits already in the project (Kenney) suit greybox and background filler, not hero pieces.
