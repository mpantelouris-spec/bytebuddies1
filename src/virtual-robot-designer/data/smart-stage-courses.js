/**
 * Robot-specific Test Arena courses — 100+ courses across 5 robot types.
 * 4 tiers per robot: Beginner (T1) → Intermediate (T2) → Advanced (T3) → Expert (T4)
 */
export const SMART_STAGE_COURSES = [
  // ═══════════════════════════════════════════════════════════
  // ROVER X1 — ROBOT-EXCLUSIVE COURSES (flat/road/grid only)
  // ═══════════════════════════════════════════════════════════
  { id: 'rover_transit',  profileIds: ['wheeled'],          recommended: true,  mission: '🚇 TRANSIT LINE: Follow the glowing cyan track through the underground cargo tunnel at speed!' },
  { id: 'rover_delivery', profileIds: ['wheeled','inventor'],recommended: true,  mission: '🏙️ CITY DELIVERY: Navigate city blocks, obey traffic lights, and hit every drop zone!' },
  { id: 'rover_survey',   profileIds: ['wheeled'],          recommended: true,  mission: '📡 TERRAIN SURVEY: Drive precisely to every survey marker and hold position for a scan!' },

  // ═══════════════════════════════════════════════════════════
  // SPIDER BOT — ROBOT-EXCLUSIVE COURSES (climbing/rough terrain)
  // ═══════════════════════════════════════════════════════════
  { id: 'spider_pipeline', profileIds: ['spider'],          recommended: true,  mission: '🔧 PIPELINE INSPECT: Crawl the industrial pipe interior and tag every fault marker!' },
  { id: 'spider_ruins',    profileIds: ['spider'],          recommended: true,  mission: '🏛️ RUIN CRAWLER: Climb over collapsed temple rubble to reach the signal beacon!' },
  { id: 'spider_rescue',   profileIds: ['spider'],          recommended: true,  mission: '🆘 URBAN SEARCH: Find survivors across multiple collapsed building floors!' },

  // ═══════════════════════════════════════════════════════════
  // DRONE — ROBOT-EXCLUSIVE COURSES (aerial only)
  // ═══════════════════════════════════════════════════════════
  { id: 'drone_canyon',    profileIds: ['drone','racedrone','jet'], recommended: true,  mission: '🏜️ CANYON FLIGHT: Thread through the red-rock canyon corridor without hitting the walls!' },
  { id: 'drone_rooftop',   profileIds: ['drone','racedrone','jet'], recommended: true,  mission: '🏢 ROOFTOP DELIVERY: Drop packages to exact rooftop pads across the city skyline!' },
  { id: 'drone_survey',    profileIds: ['drone','racedrone','helicopter'], recommended: true, mission: '📷 SURVEY GRID: Photograph every marker across the countryside before sunset!' },

  // ═══════════════════════════════════════════════════════════
  // TANK — ROBOT-EXCLUSIVE COURSES (pushing/rough terrain)
  // ═══════════════════════════════════════════════════════════
  { id: 'tank_demolition', profileIds: ['tank','mech'],     recommended: true,  mission: '💣 DEMOLITION YARD: Push every debris chunk into the dump zones using full tank power!' },
  { id: 'tank_mountain',   profileIds: ['tank'],            recommended: true,  mission: '⛰️ MOUNTAIN ASSAULT: Climb the rocky switchback to the summit relay station!' },

  // ═══════════════════════════════════════════════════════════
  // HUMANOID — ROBOT-EXCLUSIVE COURSES (bipedal/two-hand)
  // ═══════════════════════════════════════════════════════════
  { id: 'human_assembly',  profileIds: ['humanoid'],        recommended: true,  mission: '🏭 ASSEMBLY LINE: Use both hands to pick, place, and assemble parts on the conveyor!' },
  { id: 'human_stairwell', profileIds: ['humanoid'],        recommended: true,  mission: '🪜 STAIRWELL ASCENT: Climb 6 floors and activate every emergency panel!' },

  // ═══════════════════════════════════════════════════════════
  // ROBOT ARM — ROBOT-EXCLUSIVE COURSES (stationary precision)
  // ═══════════════════════════════════════════════════════════
  { id: 'arm_surgery',     profileIds: ['arm'],             recommended: true,  mission: '🔬 MICRO SURGERY: Repair every fault on the circuit board without touching components!' },
  { id: 'arm_sort',        profileIds: ['arm'],             recommended: true,  mission: '📦 WAREHOUSE SORT: Sort every item by type and destination before the belt clears!' },

  /* ── Legacy / generic courses ── */
  { id: 'obstacles', profileIds: ['wheeled', 'inventor', 'battle', 'companion'], recommended: true, mission: 'Avoid obstacles and reach the finish' },
  { id: 'linefollow', profileIds: ['wheeled', 'inventor'], recommended: true, mission: 'Follow the glowing path' },
  { id: 'delivery', profileIds: ['wheeled', 'inventor', 'mech'], recommended: true, mission: 'Deliver cargo between zones' },
  { id: 'square', profileIds: ['wheeled', 'battle'], recommended: false, mission: 'Race around the track loop' },
  { id: 'open', profileIds: ['wheeled', 'inventor', 'companion', 'drone', 'helicopter', 'lego', 'submarine'], recommended: false, mission: 'Free drive & experiment' },
  { id: 'ramp', profileIds: ['tank', 'mech'], recommended: true, mission: 'Climb ramps and rough terrain' },
  { id: 'rough_terrain', profileIds: ['tank'], recommended: true, mission: 'Cross rocky construction site' },
  { id: 'collect', profileIds: ['tank', 'mech', 'arm', 'drill'], recommended: false, mission: 'Rescue heavy cargo crates' },
  { id: 'sky_rings', profileIds: ['drone', 'jet', 'helicopter'], recommended: true, mission: 'Fly through aerial rings' },
  { id: 'sky_maze', profileIds: ['drone', 'jet'], recommended: true, mission: 'Navigate the sky obstacle field' },
  { id: 'figure8', profileIds: ['jet', 'drone', 'hover'], recommended: true, mission: 'Complete the aerial race circuit' },
  { id: 'terrain_climb', profileIds: ['spider', 'humanoid'], recommended: true, mission: 'Climb towers and cross gaps' },
  { id: 'maze', profileIds: ['spider', 'humanoid', 'companion'], recommended: true, mission: 'Explore the cave maze' },
  { id: 'balance_beam', profileIds: ['humanoid'], recommended: true, mission: 'Walk the balance course' },
  { id: 'factory_sort', profileIds: ['arm'], recommended: true, mission: 'Sort boxes by color on the line' },
  { id: 'underwater_reef', profileIds: ['submarine'], recommended: true, mission: 'Collect reef samples' },
  { id: 'underwater_cave', profileIds: ['submarine'], recommended: true, mission: 'Map the underwater cave' },
  { id: 'hover_course', profileIds: ['hover'], recommended: true, mission: 'Cross floating energy bridges' },
  { id: 'mining_tunnel', profileIds: ['drill'], recommended: true, mission: 'Drill through tunnel walls' },
  { id: 'lego_park', profileIds: ['lego'], recommended: true, mission: 'Complete the block obstacle park' },
  { id: 'ai_patrol', profileIds: ['companion', 'battle'], recommended: true, mission: 'Patrol and detect targets' },
  { id: 'checkpoint', profileIds: ['wheeled','inventor','battle','companion','tank','mech','spider','humanoid','drone','jet','helicopter','hover','submarine','drill','lego','arm'], recommended: true,  mission: 'Pass through all checkpoint portals' },
  { id: 'targets',    profileIds: ['wheeled','inventor','battle','companion','tank','mech','spider','humanoid','drone','jet','helicopter','hover','submarine','drill','lego','arm'], recommended: true,  mission: 'Reach every glowing target' },
  { id: 'speedrun',   profileIds: ['wheeled','inventor','battle','companion','tank','mech','spider','humanoid','drone','jet','helicopter','hover','submarine','drill','lego','arm'], recommended: false, mission: 'Sprint to the finish as fast as possible' },
  { id: 'dodge_easy',   profileIds: ['wheeled','inventor','battle','companion','tank','mech','spider','humanoid','hover','drill','lego','arm','submarine'], recommended: true,  mission: 'Dodge 3 rolling balls and reach the finish!' },
  { id: 'dodge_medium', profileIds: ['wheeled','inventor','battle','companion','tank','mech','spider','humanoid','hover','drill','lego','arm'], recommended: true,  mission: 'Time your moves to slip through spinning laser barriers' },
  { id: 'dodge_hard',   profileIds: ['wheeled','inventor','battle','companion','tank','mech','spider','humanoid','hover','drill','lego','arm'], recommended: false, mission: 'Navigate an asteroid field without getting hit!' },
  { id: 'escape_easy',   profileIds: ['wheeled','inventor','battle','companion','tank','mech','spider','humanoid','hover','drill','lego','arm'], recommended: true,  mission: 'Sprint down the corridor before the crushing wall catches you!' },
  { id: 'escape_medium', profileIds: ['wheeled','inventor','battle','companion','tank','mech','spider','humanoid','hover','drill','lego','arm'], recommended: true,  mission: 'Outmaneuver 3 hunting robots and reach safety' },
  { id: 'escape_hard',   profileIds: ['wheeled','inventor','battle','companion','tank','mech','spider','humanoid','hover','drill','lego','arm'], recommended: false, mission: 'Survive the swarm and reach the bunker!' },
  { id: 'collect_easy',   profileIds: ['wheeled','inventor','tank','mech','spider','humanoid','arm','drill','lego'], recommended: true,  mission: 'Grab all 3 glowing cubes and deliver them to the green zone' },
  { id: 'collect_medium', profileIds: ['wheeled','inventor','tank','mech','spider','humanoid','arm','drill'], recommended: true,  mission: 'Collect 5 objects — careful, some are fragile or heavy!' },
  { id: 'collect_hard',   profileIds: ['wheeled','inventor','tank','mech','arm','drill'], recommended: false, mission: 'Precision logistics: retrieve all items through tight passages' },
  { id: 'flight_easy',   profileIds: ['drone','jet','helicopter'], recommended: true,  mission: 'Fly through 5 golden rings — feel the rush!' },
  { id: 'flight_medium', profileIds: ['drone','jet','helicopter'], recommended: true,  mission: 'Aerial acrobatics: 8 rings at all angles and heights' },
  { id: 'flight_hard',   profileIds: ['drone','jet'],              recommended: false, mission: 'Space Slalom: 15 gates through a cosmic obstacle course' },

  // ═══════════════════════════════════════════════════════════
  // EXPLORER SPIDER — 20 SIGNATURE COURSES
  // ═══════════════════════════════════════════════════════════
  // T1: Beginner
  { id: 'spider_temple',   profileIds: ['spider','humanoid'], recommended: true,  mission: '🏛️ TEMPLE ENTRANCE: Begin your jungle exploration — dodge traps & collect artifacts!' },
  { id: 'spider_bridges',  profileIds: ['spider','humanoid'], recommended: true,  mission: '🌉 STONE BRIDGES: Cross precarious stone bridges over the jungle gorge!' },
  { id: 'spider_vine',     profileIds: ['spider'],            recommended: true,  mission: '🌿 VINE CLIMB: Scale a massive tree using timed jumps between swinging vines!' },
  { id: 'spider_maze',     profileIds: ['spider','humanoid'], recommended: false, mission: '🧩 JUNGLE MAZE: Use camera vision to navigate the dense vine labyrinth!' },
  { id: 'spider_guardian', profileIds: ['spider'],            recommended: false, mission: '⚔️ GUARDIAN BATTLE: Defeat the ancient temple guardian in epic combat!' },
  // T2: Intermediate
  { id: 'spider_interior', profileIds: ['spider','humanoid'], recommended: true,  mission: '🕯️ TEMPLE INTERIOR: Solve pressure plate puzzles deep in the ancient chambers!' },
  { id: 'spider_river',    profileIds: ['spider'],            recommended: true,  mission: '🌊 RIVER CROSSING: Battle wild currents, jump floating logs & collect water gems!' },
  { id: 'spider_web',      profileIds: ['spider'],            recommended: true,  mission: '🕸️ WEB GAUNTLET: Navigate the neon web city — collect 5 crystals & evade enemies!' },
  { id: 'spider_forest',   profileIds: ['spider','humanoid'], recommended: false, mission: '🌑 WHISPERING FOREST: Use sound-based navigation to survive the enchanted dark forest!' },
  { id: 'spider_race',     profileIds: ['spider'],            recommended: false, mission: '🏁 ANCIENT RACE: Race 3 AI spiders through ancient ruins — item strategy wins!' },
  { id: 'spider_web_city', profileIds: ['spider'],            recommended: false, mission: '🕷️ WEB CITY: 3D platforming through a giant spider-web city — swing, run, collect!' },
  { id: 'spider_cave',     profileIds: ['spider','humanoid'], recommended: false, mission: '🦇 DEEP CAVE: Bioluminescent cave expedition — climb, swim & awaken the ancient spider!' },
  { id: 'spider_warzone',  profileIds: ['spider'],            recommended: false, mission: '💥 WAR ZONE: Navigate 20+ rival spiders in a faction battlefield — survive or fight!' },
  // T3: Advanced
  { id: 'spider_elemental',  profileIds: ['spider'],          recommended: false, mission: '🌋 ELEMENTAL CHAMBERS: Survive fire, ice, wind & water in 4 deadly chambers!' },
  { id: 'spider_labyrinth',  profileIds: ['spider'],          recommended: false, mission: '👁️ SHADOW LABYRINTH: Dark, shifting maze with shadow creatures — reality distorts!' },
  { id: 'spider_ruin_race',  profileIds: ['spider'],          recommended: false, mission: '🏆 RUIN RACE: High-speed race + combat against 3 elite AI spiders through ruins!' },
  { id: 'spider_trials',     profileIds: ['spider'],          recommended: false, mission: '🥇 SPIDER TRIALS: 5 skill tests (climb, combat, race, navigate, puzzle) + final boss!' },
  // T4: Expert
  { id: 'spider_infinite',   profileIds: ['spider'],          recommended: false, mission: '♾️ INFINITE TEMPLE: 10 escalating waves — stronger enemies every round. Survive all!' },
  { id: 'spider_hunt',       profileIds: ['spider'],          recommended: false, mission: '👑 LEGENDARY HUNT: Track & defeat 5 legendary spiders across the world zones!' },
  { id: 'spider_gauntlet',   profileIds: ['spider'],          recommended: false, mission: '💀 ULTIMATE GAUNTLET: Every environment + 3 super bosses — the ultimate test! 10,000pts!' },

  // ═══════════════════════════════════════════════════════════
  // RACER DRONE — 20 SIGNATURE COURSES
  // ═══════════════════════════════════════════════════════════
  // T1: Beginner
  { id: 'drone_academy',      profileIds: ['drone','racedrone','jet','helicopter'], recommended: true,  mission: '🎓 SKY ACADEMY: Learn to fly — pass 10 rings at the aerial training academy!' },
  { id: 'drone_cloud_race',   profileIds: ['drone','racedrone','jet','helicopter'], recommended: true,  mission: '☁️ CLOUD RACE: Race through cloud formations against 3 AI drones!' },
  { id: 'drone_gates',        profileIds: ['drone','racedrone','jet'],              recommended: true,  mission: '🎯 PRECISION GATES: Thread 20 progressively narrower gates — center = 2x points!' },
  { id: 'drone_wind',         profileIds: ['drone','racedrone','jet','helicopter'], recommended: false, mission: '🌪️ WIND CHALLENGE: Navigate fierce wind currents & turbulence zones!' },
  { id: 'drone_gauntlet_easy',profileIds: ['drone','racedrone','jet'],              recommended: false, mission: '⚡ FIRST GAUNTLET: Racing + obstacles + items — your first combined challenge!' },
  // T2: Intermediate
  { id: 'drone_neoncity',     profileIds: ['drone','racedrone','jet'],              recommended: true,  mission: '🌆 NEON CITY FLIGHT: Weave between skyscrapers at maximum speed — no crashes!' },
  { id: 'drone_mountain',     profileIds: ['drone','racedrone','jet','helicopter'], recommended: true,  mission: '⛰️ MOUNTAIN FLIGHT: Use updrafts to conquer treacherous mountain terrain!' },
  { id: 'drone_asteroid',     profileIds: ['drone','racedrone','jet'],              recommended: false, mission: '🌑 ASTEROID RACE: High-speed race through asteroid field against 3 elite drones!' },
  { id: 'drone_storm',        profileIds: ['drone','racedrone','jet'],              recommended: false, mission: '⛈️ STORM CHASE: Fly into thunderstorms — dodge lightning & collect energy orbs!' },
  { id: 'drone_speed_trials', profileIds: ['drone','racedrone','jet'],              recommended: false, mission: '🏎️ SPEED TRIALS: Test maximum velocity — pass speed gates or get disqualified!' },
  { id: 'drone_skyrace',      profileIds: ['drone','racedrone','jet','helicopter'], recommended: false, mission: '🏆 SKY CHAMPIONSHIP: 10 rings — fastest time wins the championship!' },
  { id: 'drone_slalom',       profileIds: ['drone','racedrone','jet'],              recommended: false, mission: '🚀 SPACE SLALOM: 16 tight gates through the asteroid field — extreme precision!' },
  { id: 'drone_battle',       profileIds: ['drone','racedrone','jet'],              recommended: false, mission: '💥 DRONE BATTLE: Aerial combat against 5 enemy drones — evade & outmaneuver!' },
  // T3: Advanced
  { id: 'drone_volcano',      profileIds: ['drone','racedrone','jet'],              recommended: false, mission: '🌋 VOLCANO FLIGHT: Race through volcanic ash clouds & dodge lava eruptions!' },
  { id: 'drone_deep_space',   profileIds: ['drone','racedrone','jet'],              recommended: false, mission: '🌌 DEEP SPACE: Navigate wormholes, gravity wells & space debris at light speed!' },
  { id: 'drone_world_tour',   profileIds: ['drone','racedrone','jet','helicopter'], recommended: false, mission: '🌍 WORLD TOUR: Race across 4 world zones — Arctic, Desert, Ocean, City!' },
  { id: 'drone_elite',        profileIds: ['drone','racedrone','jet'],              recommended: false, mission: '👑 ELITE CHAMPIONSHIP: Full skill test — 5 events, 1 champion. Can you dominate?' },
  // T4: Expert
  { id: 'drone_infinite_race',profileIds: ['drone','racedrone','jet'],              recommended: false, mission: '♾️ INFINITE RACE: Escalating circuits — each lap faster, tighter, more dangerous!' },
  { id: 'drone_legend',       profileIds: ['drone','racedrone','jet'],              recommended: false, mission: '⭐ LEGEND CIRCUIT: 5 legendary AI drone pilots — defeat them all to become legend!' },
  { id: 'drone_ultimate',     profileIds: ['drone','racedrone','jet'],              recommended: false, mission: '💎 ULTIMATE FLIGHT: Every mechanic combined — 3 boss races, max score 10,000pts!' },

  // ═══════════════════════════════════════════════════════════
  // HEAVY ROBOT — 20 SIGNATURE COURSES
  // ═══════════════════════════════════════════════════════════
  // T1: Beginner
  { id: 'heavy_basics',    profileIds: ['mech','tank','arm'], recommended: true,  mission: '🔧 TRAINING YARD: Learn heavy robot controls — lift, push & navigate the basics!' },
  { id: 'heavy_lifting',   profileIds: ['mech','tank','arm'], recommended: true,  mission: '💪 LIFTING CHALLENGE: Stack all 5 cargo crates in the right zones — precision lifting!' },
  { id: 'heavy_drill_run', profileIds: ['mech','tank','arm'], recommended: true,  mission: '⛏️ DRILL RUN: Power through breakable walls using LIDAR to find the fastest path!' },
  { id: 'heavy_cargo',     profileIds: ['mech','tank','arm'], recommended: false, mission: '📦 CARGO MISSION: Deliver fragile packages across the depot without breaking them!' },
  { id: 'heavy_clear',     profileIds: ['mech','tank'],       recommended: false, mission: '🚧 OBSTACLE CLEAR: Push debris out of the road to open the path — use full power!' },
  // T2: Intermediate
  { id: 'heavy_warehouse',    profileIds: ['mech','tank','arm'], recommended: true,  mission: '🏭 WAREHOUSE RUN: Deliver all 5 crates to correct zones — logistics mastery!' },
  { id: 'heavy_mining',       profileIds: ['mech','tank','arm'], recommended: true,  mission: '⛏️ MINING OPERATION: Use LIDAR to scan veins, drill ore & collect rare crystals!' },
  { id: 'heavy_bridge',       profileIds: ['mech','tank'],       recommended: false, mission: '🌉 BRIDGE BUILD: Carry steel beams across the site & construct the bridge sections!' },
  { id: 'heavy_urban',        profileIds: ['mech','tank','arm'], recommended: false, mission: '🏙️ URBAN MISSION: Navigate city streets, clear wreckage & reach all 5 objectives!' },
  { id: 'heavy_salvage',      profileIds: ['mech','arm'],        recommended: false, mission: '🔍 SALVAGE OPS: LIDAR-scan the debris field & extract all 8 valuable components!' },
  { id: 'heavy_construction', profileIds: ['mech','tank','arm'], recommended: false, mission: '🏗️ CONSTRUCTION SITE: Move materials & solve site puzzles to build the structure!' },
  { id: 'heavy_megabuild',    profileIds: ['mech','tank'],       recommended: false, mission: '🏢 MEGA BUILD: Multi-floor steel skeleton + tower crane — the ultimate build!' },
  { id: 'heavy_demolition',   profileIds: ['mech','tank'],       recommended: false, mission: '💣 DEMOLITION DAY: Systematically demolish all marked structures — precision wrecking!' },
  // T3: Advanced
  { id: 'heavy_disaster',    profileIds: ['mech','tank','arm'], recommended: false, mission: '🆘 DISASTER RESPONSE: Earthquake zone — rescue all 8 survivors under time pressure!' },
  { id: 'heavy_deep_mine',   profileIds: ['mech','arm'],        recommended: false, mission: '💎 DEEP MINE: 300m underground — scan, drill & extract legendary mineral deposits!' },
  { id: 'heavy_world_build', profileIds: ['mech','tank','arm'], recommended: false, mission: '🌍 WORLD BUILD: 5-zone mega project — dam, bridge, tower, road & power plant!' },
  { id: 'heavy_boss',        profileIds: ['mech','tank'],       recommended: false, mission: '🤖 BOSS MACHINE: Face the ultimate heavy machinery boss — outmaneuver & defeat it!' },
  // T4: Expert
  { id: 'heavy_infinite',    profileIds: ['mech','tank','arm'], recommended: false, mission: '♾️ INFINITE SITE: Endless construction waves — each level bigger, heavier, faster!' },
  { id: 'heavy_legendary',   profileIds: ['mech','tank'],       recommended: false, mission: '👑 LEGENDARY OPS: 5 legendary boss machines — defeat each to claim their power!' },
  { id: 'heavy_ultimate',    profileIds: ['mech','tank','arm'], recommended: false, mission: '💀 ULTIMATE HEAVY: All 5 mission types combined — 3 mega bosses, max 10,000pts!' },

  // ═══════════════════════════════════════════════════════════
  // NINJA DRONE — 20 SIGNATURE COURSES
  // ═══════════════════════════════════════════════════════════
  // T1: Beginner
  { id: 'ninja_training',    profileIds: ['drone','racedrone'], recommended: true,  mission: '🥷 NINJA TRAINING: Learn stealth flight, laser targeting & thermal vision basics!' },
  { id: 'ninja_stealth',     profileIds: ['drone','racedrone'], recommended: true,  mission: '👁️ STEALTH INTRO: Sneak through 5 guard zones without being detected!' },
  { id: 'ninja_target',      profileIds: ['drone','racedrone'], recommended: true,  mission: '🎯 TARGET PRACTICE: Precision laser shots — hit 10 targets with perfect accuracy!' },
  { id: 'ninja_infiltrate',  profileIds: ['drone','racedrone'], recommended: false, mission: '🔐 INFILTRATION: Bypass the security system & reach the target without alarms!' },
  { id: 'ninja_escape',      profileIds: ['drone','racedrone'], recommended: false, mission: '💨 NINJA ESCAPE: Mission complete — now escape through the alerted enemy base!' },
  // T2: Intermediate
  { id: 'ninja_city_strike', profileIds: ['drone','racedrone'], recommended: true,  mission: '🏙️ CITY STRIKE: Urban combat mission — neutralize 8 targets across the rooftops!' },
  { id: 'ninja_heat_scan',   profileIds: ['drone','racedrone'], recommended: true,  mission: '🔴 HEAT SCAN OPS: Use thermal imaging to find hidden enemies through walls!' },
  { id: 'ninja_laser_maze',  profileIds: ['drone','racedrone'], recommended: false, mission: '⚡ LASER MAZE: Navigate active laser security grid — one touch = mission failed!' },
  { id: 'ninja_night_ops',   profileIds: ['drone','racedrone'], recommended: false, mission: '🌙 NIGHT OPS: Full darkness + enemy searchlights — stealth is your only weapon!' },
  { id: 'ninja_assassin',    profileIds: ['drone','racedrone'], recommended: false, mission: '🗡️ ASSASSIN RUN: Eliminate the 3 high-value targets before the timer expires!' },
  { id: 'ninja_fortress',    profileIds: ['drone','racedrone'], recommended: false, mission: '🏰 FORTRESS RAID: Breach the enemy fortress — 5 gates, 20 guards, 1 objective!' },
  { id: 'ninja_dogfight',    profileIds: ['drone','racedrone'], recommended: false, mission: '✈️ DOGFIGHT: Aerial combat against 5 enemy fighter drones — outwit & outlast!' },
  { id: 'ninja_base_raid',   profileIds: ['drone','racedrone'], recommended: false, mission: '💥 BASE RAID: Full assault on the enemy command base — destroy all 6 systems!' },
  // T3: Advanced
  { id: 'ninja_shadow_war',    profileIds: ['drone','racedrone'], recommended: false, mission: '👥 SHADOW WAR: Coordinate a 3-phase stealth/combat/extraction mega-mission!' },
  { id: 'ninja_elite_ops',     profileIds: ['drone','racedrone'], recommended: false, mission: '🎖️ ELITE OPS: 5 simultaneous objectives — only the best ninja drones succeed!' },
  { id: 'ninja_black_site',    profileIds: ['drone','racedrone'], recommended: false, mission: '⬛ BLACK SITE: Classified mission — maximum security, maximum danger!' },
  { id: 'ninja_super_stealth', profileIds: ['drone','racedrone'], recommended: false, mission: '👻 GHOST RUN: Complete the entire base raid leaving ZERO evidence! Perfect score only!' },
  // T4: Expert
  { id: 'ninja_infinite_war',  profileIds: ['drone','racedrone'], recommended: false, mission: '♾️ INFINITE WAR: Endless combat waves — enemies adapt to your tactics every round!' },
  { id: 'ninja_legendary',     profileIds: ['drone','racedrone'], recommended: false, mission: '👑 LEGENDARY NINJA: Hunt & defeat 5 legendary enemy commanders around the world!' },
  { id: 'ninja_ultimate',      profileIds: ['drone','racedrone'], recommended: false, mission: '💀 ULTIMATE NINJA: All skills + 3 super boss battles — max 10,000pts, zero mercy!' },

  // ═══════════════════════════════════════════════════════════
  // HUMANOID ROBOT — 20 SIGNATURE COURSES
  // ═══════════════════════════════════════════════════════════
  // T1: Beginner
  { id: 'human_basics',       profileIds: ['humanoid'], recommended: true,  mission: '🚶 BASICS TRAINING: Walk, jump, grab — learn all humanoid robot fundamentals!' },
  { id: 'human_combat_intro', profileIds: ['humanoid'], recommended: true,  mission: '🥊 COMBAT INTRO: Learn punch, dodge & kick — defeat 3 training dummies!' },
  { id: 'human_platform',     profileIds: ['humanoid'], recommended: true,  mission: '🏗️ PLATFORM JUMP: Precise platforming challenge — jump gaps, collect 50 coins!' },
  { id: 'human_shield',       profileIds: ['humanoid'], recommended: false, mission: '🛡️ SHIELD TRAINING: Block incoming attacks — master the perfect parry timing!' },
  { id: 'human_first_boss',   profileIds: ['humanoid'], recommended: false, mission: '⚔️ FIRST BOSS: Face the training arena champion — dodge attacks & fight back!' },
  // T2: Intermediate
  { id: 'human_arena',        profileIds: ['humanoid'], recommended: true,  mission: '🏟️ ARENA COMBAT: Battle 5 waves of opponents in the main arena — fight for glory!' },
  { id: 'human_jungle',       profileIds: ['humanoid'], recommended: true,  mission: '🌿 JUNGLE MISSION: Navigate jungle terrain while battling enemies and collecting relics!' },
  { id: 'human_city',         profileIds: ['humanoid'], recommended: false, mission: '🏙️ CITY COMBAT: Urban warfare — rooftop jumps, enemy squads, civilian protection!' },
  { id: 'human_dodge',        profileIds: ['humanoid'], recommended: false, mission: '⚡ DODGE MASTER: Avoid 50+ projectiles while collecting power-ups — reflex test!' },
  { id: 'human_weapons',      profileIds: ['humanoid'], recommended: false, mission: '🗡️ WEAPONS TRIAL: Master sword, shield, bow & gun — pass all 4 weapon challenges!' },
  { id: 'human_tournament',   profileIds: ['humanoid'], recommended: false, mission: '🏆 TOURNAMENT: 8-robot tournament bracket — win every fight to claim the trophy!' },
  { id: 'human_army',         profileIds: ['humanoid'], recommended: false, mission: '⚔️ ARMY ASSAULT: 20-enemy squad attacks — use all combat skills to survive!' },
  { id: 'human_ruins',        profileIds: ['humanoid'], recommended: false, mission: '🏛️ ANCIENT RUINS: Explore, fight & puzzle-solve through mysterious ancient ruins!' },
  // T3: Advanced
  { id: 'human_elemental',    profileIds: ['humanoid'], recommended: false, mission: '🌋 ELEMENTAL WARRIOR: Fight elemental champions — Fire, Ice, Lightning & Earth!' },
  { id: 'human_shadow',       profileIds: ['humanoid'], recommended: false, mission: '👥 SHADOW DUEL: Fight your shadow clone — predict moves, counter perfectly!' },
  { id: 'human_championship', profileIds: ['humanoid'], recommended: false, mission: '🥇 WORLD CHAMPIONSHIP: 5-event competition — fastest, strongest, most skillful wins!' },
  { id: 'human_warrior',      profileIds: ['humanoid'], recommended: false, mission: '⚔️ WARRIOR TRIALS: Prove elite status — 5 ancient trials + legendary guardian boss!' },
  // T4: Expert
  { id: 'human_infinite',     profileIds: ['humanoid'], recommended: false, mission: '♾️ INFINITE ARENA: Endless combat waves — enemies evolve & multiply each round!' },
  { id: 'human_legend',       profileIds: ['humanoid'], recommended: false, mission: '👑 LEGEND HUNT: Track & defeat 5 legendary humanoid warriors across world zones!' },
  { id: 'human_ultimate',     profileIds: ['humanoid'], recommended: false, mission: '💀 ULTIMATE HUMANOID: Every skill + 3 god-tier bosses — max 10,000pts, true mastery!' },
];

/** Display metadata for every course id. */
export const COURSE_DISPLAY = {
  // ── ROVER X1 exclusive courses ────────────────────────────────────────────
  rover_transit:  { label: 'Transit Line',       icon: '🚇', desc: 'Follow the cyan track through the sci-fi tunnel', color: '#00e5ff', tier: 1 },
  rover_delivery: { label: 'City Delivery Grid', icon: '🏙️', desc: 'Navigate streets and hit every drop zone',         color: '#22c55e', tier: 1 },
  rover_survey:   { label: 'Terrain Survey',     icon: '📡', desc: 'Reach every survey marker with precision',         color: '#fbbf24', tier: 2 },

  // ── SPIDER BOT exclusive courses ──────────────────────────────────────────
  spider_pipeline: { label: 'Pipeline Inspection', icon: '🔧', desc: 'Crawl inside a pipe and tag every fault',        color: '#ff3333', tier: 1 },
  spider_ruins:    { label: 'Ruin Crawler',         icon: '🏛️', desc: 'Climb collapsed temple rubble to the beacon',   color: '#d97706', tier: 2 },
  spider_rescue:   { label: 'Urban Search & Rescue',icon: '🆘', desc: 'Find survivors across collapsed building floors',color: '#3b82f6', tier: 2 },

  // ── DRONE exclusive courses ───────────────────────────────────────────────
  drone_canyon:   { label: 'Canyon Flight',       icon: '🏜️', desc: 'Thread the red-rock canyon at altitude',          color: '#e8a060', tier: 1 },
  drone_rooftop:  { label: 'Rooftop Delivery',    icon: '🏢', desc: 'Drop packages to exact rooftop pads',            color: '#38bdf8', tier: 2 },
  drone_survey:   { label: 'Countryside Survey',  icon: '📷', desc: 'Photograph every ground marker before sunset',    color: '#22c55e', tier: 1 },

  // ── TANK exclusive courses ────────────────────────────────────────────────
  tank_demolition:{ label: 'Demolition Yard',     icon: '💣', desc: 'Bulldoze every debris chunk into dump zones',    color: '#f97316', tier: 1 },
  tank_mountain:  { label: 'Mountain Assault',    icon: '⛰️', desc: 'Track-climb the rocky switchback to the summit', color: '#78716c', tier: 2 },

  // ── HUMANOID exclusive courses ────────────────────────────────────────────
  human_assembly: { label: 'Assembly Line',       icon: '🏭', desc: 'Two-hand pick, place, and assemble parts',        color: '#a855f7', tier: 1 },
  human_stairwell:{ label: 'Stairwell Ascent',    icon: '🪜', desc: 'Climb 6 floors and hit every emergency panel',   color: '#ef4444', tier: 1 },

  // ── ROBOT ARM exclusive courses ───────────────────────────────────────────
  arm_surgery:    { label: 'Micro Surgery',        icon: '🔬', desc: 'Repair circuit board faults with fine precision',color: '#00ff88', tier: 1 },
  arm_sort:       { label: 'Warehouse Sort',       icon: '📦', desc: 'Sort belt items to correct destinations',        color: '#06b6d4', tier: 1 },

  // Legacy
  open:           { label: 'Open Field',       icon: '🌐', desc: 'Free drive & experiment',              color: '#1e90ff' },
  obstacles:      { label: 'Obstacle Course',  icon: '🚧', desc: 'Dodge & navigate safely',              color: '#ff6b6b' },
  linefollow:     { label: 'Line Follow',      icon: '〰️', desc: 'Follow the glowing path',              color: '#00c853' },
  maze:           { label: 'Maze',             icon: '🧩', desc: 'Solve the wall puzzle',                color: '#8b5cf6' },
  square:         { label: 'Race Track',       icon: '🏁', desc: 'Speed around the loop',                color: '#f59e0b' },
  figure8:        { label: 'Figure 8',         icon: '∞',  desc: 'Crossing challenge',                   color: '#00d9ff' },
  ramp:           { label: 'Ramp Course',      icon: '⛰️', desc: 'Climb & physics test',                 color: '#f97316' },
  collect:        { label: 'Object Pickup',    icon: '📦', desc: 'Grab glowing targets',                 color: '#ec4899' },
  delivery:       { label: 'Delivery Run',     icon: '🎯', desc: 'Move between zones',                   color: '#14b8a6' },
  rough_terrain:  { label: 'Rough Terrain',    icon: '🪨', desc: 'Rocky construction zone',              color: '#78716c' },
  sky_rings:      { label: 'Sky Rings',        icon: '💫', desc: 'Fly through floating rings',           color: '#0ea5e9' },
  sky_maze:       { label: 'Sky Maze',         icon: '🌩️', desc: 'Aerial obstacle field',               color: '#6366f1' },
  terrain_climb:  { label: 'Terrain Climb',    icon: '🧗', desc: 'Vertical climbing challenge',          color: '#10b981' },
  balance_beam:   { label: 'Balance Course',   icon: '⚖️', desc: 'Walk the balance beams',              color: '#a855f7' },
  factory_sort:   { label: 'Sorting Line',     icon: '🏭', desc: 'Factory color sort',                  color: '#0ea5e9' },
  underwater_reef:{ label: 'Coral Reef',       icon: '🐠', desc: 'Underwater sample hunt',              color: '#06b6d4' },
  underwater_cave:{ label: 'Deep Cave',        icon: '🌊', desc: 'Sonar through caves',                 color: '#0284c7' },
  hover_course:   { label: 'Hover Bridges',    icon: '🛸', desc: 'Cross floating platforms',            color: '#c026d3' },
  mining_tunnel:  { label: 'Mining Tunnel',    icon: '⛏️', desc: 'Drill and collect ore',               color: '#a16207' },
  lego_park:      { label: 'LEGO Park',        icon: '🧱', desc: 'Block obstacle adventure',            color: '#f97316' },
  ai_patrol:      { label: 'AI Patrol',        icon: '🧠', desc: 'Smart target detection',              color: '#8b5cf6' },
  checkpoint:     { label: 'Checkpoint Run',   icon: '⭕', desc: 'Pass through every portal in order',  color: '#14b8a6' },
  targets:        { label: 'Target Hunt',      icon: '🎯', desc: 'Reach every glowing target marker',   color: '#ec4899' },
  speedrun:       { label: 'Speed Run',        icon: '⚡', desc: 'Beat the clock to the finish line',   color: '#f59e0b' },
  dodge_easy:     { label: 'Rolling Balls',    icon: '🔴', desc: 'Dodge 3 rolling balls to the finish', color: '#ef4444' },
  dodge_medium:   { label: 'Laser Maze',       icon: '⚡', desc: 'Slip through spinning laser barriers', color: '#22d3ee' },
  dodge_hard:     { label: 'Asteroid Field',   icon: '☄️', desc: 'Navigate chaos in the asteroid belt', color: '#6366f1' },
  escape_easy:    { label: 'Crushing Wall',    icon: '🧱', desc: 'Sprint before the wall catches you',  color: '#f97316' },
  escape_medium:  { label: 'Hunters',          icon: '🔮', desc: 'Outmaneuver 3 pursuing robots',       color: '#8b5cf6' },
  escape_hard:    { label: 'Swarm',            icon: '🚁', desc: 'Survive 10 swarming attack drones',   color: '#dc2626' },
  collect_easy:   { label: 'Simple Grab',      icon: '📦', desc: 'Grab 3 glowing cubes and deliver',    color: '#22c55e' },
  collect_medium: { label: 'Careful Carrying', icon: '🔮', desc: 'Collect 5 objects — some fragile!',   color: '#a855f7' },
  collect_hard:   { label: 'Precision Logist.',icon: '🏭', desc: 'All 10 items through tight passages', color: '#0ea5e9' },
  flight_easy:    { label: 'Ring Rush',        icon: '💛', desc: 'Fly through 5 golden rings',          color: '#f59e0b' },
  flight_medium:  { label: 'Aerial Acrobatics',icon: '🌀', desc: 'Hit 8 rings at wild heights/angles',  color: '#06b6d4' },
  flight_hard:    { label: 'Space Slalom',     icon: '🌌', desc: '15 gates through the cosmic course',  color: '#818cf8' },

  // ── EXPLORER SPIDER — 20 courses ────────────────────────────────────────────
  spider_temple:   { label: 'Temple Entrance',  icon: '🏛️', desc: 'T1 • Ancient traps & artifacts',          color: '#d97706', tier: 1 },
  spider_bridges:  { label: 'Stone Bridges',    icon: '🌉', desc: 'T1 • Cross gorge bridges without falling', color: '#92400e', tier: 1 },
  spider_vine:     { label: 'Vine Climb',       icon: '🌿', desc: 'T1 • Scale the giant tree via vines',      color: '#15803d', tier: 1 },
  spider_maze:     { label: 'Jungle Maze',      icon: '🧩', desc: 'T1 • Camera-vision maze navigation',       color: '#047857', tier: 1 },
  spider_guardian: { label: 'Guardian Battle',  icon: '⚔️', desc: 'T1 • Defeat the temple guardian!',         color: '#b45309', tier: 1 },
  spider_interior: { label: 'Temple Interior',  icon: '🕯️', desc: 'T2 • Pressure plates & puzzle chambers',   color: '#7c3aed', tier: 2 },
  spider_river:    { label: 'River Crossing',   icon: '🌊', desc: 'T2 • Wild currents & floating logs',        color: '#0891b2', tier: 2 },
  spider_web:      { label: 'Web Gauntlet',     icon: '🕸️', desc: 'T2 • Neon webs, crystals & enemies',       color: '#6d28d9', tier: 2 },
  spider_forest:   { label: 'Whispering Forest',icon: '🌑', desc: 'T2 • Sound-based dark forest nav',          color: '#065f46', tier: 2 },
  spider_race:     { label: 'Ancient Race',     icon: '🏁', desc: 'T2 • Race 3 AI spiders through ruins',      color: '#b45309', tier: 2 },
  spider_web_city: { label: 'Web City',         icon: '🕷️', desc: 'T2 • 3D web platforming & swing',           color: '#4c1d95', tier: 2 },
  spider_cave:     { label: 'Deep Cave',        icon: '🦇', desc: 'T2 • Bioluminescent cave expedition',        color: '#164e63', tier: 2 },
  spider_warzone:  { label: 'War Zone',         icon: '💥', desc: 'T2 • 20+ rivals in faction battlefield',    color: '#7f1d1d', tier: 2 },
  spider_elemental:{ label: 'Elemental Chambers',icon:'🌋', desc: 'T3 • Fire, ice, wind & water chambers',     color: '#dc2626', tier: 3 },
  spider_labyrinth:{ label: 'Shadow Labyrinth', icon: '👁️', desc: 'T3 • Shifting dark maze + shadow boss',     color: '#1e1b4b', tier: 3 },
  spider_ruin_race:{ label: 'Ruin Race',        icon: '🏆', desc: 'T3 • Speed + combat race through ruins',    color: '#78350f', tier: 3 },
  spider_trials:   { label: 'Spider Trials',    icon: '🥇', desc: 'T3 • 5 skill trials + final guardian',      color: '#5b21b6', tier: 3 },
  spider_infinite: { label: 'Infinite Temple',  icon: '♾️', desc: 'T4 • 10 escalating enemy waves',            color: '#991b1b', tier: 4 },
  spider_hunt:     { label: 'Legendary Hunt',   icon: '👑', desc: 'T4 • Track & defeat 5 legendary spiders',   color: '#a16207', tier: 4 },
  spider_gauntlet: { label: 'Ultimate Gauntlet',icon: '💀', desc: 'T4 • Everything + 3 super bosses!',          color: '#18181b', tier: 4 },

  // ── RACER DRONE — 20 courses ─────────────────────────────────────────────────
  drone_academy:      { label: 'Sky Academy',      icon: '🎓', desc: 'T1 • Learn to fly through 10 rings',       color: '#38bdf8', tier: 1 },
  drone_cloud_race:   { label: 'Cloud Race',       icon: '☁️', desc: 'T1 • Race through cloud formations',       color: '#93c5fd', tier: 1 },
  drone_gates:        { label: 'Precision Gates',  icon: '🎯', desc: 'T1 • 20 narrowing gates — center = 2x',   color: '#3b82f6', tier: 1 },
  drone_wind:         { label: 'Wind Challenge',   icon: '🌪️', desc: 'T1 • Navigate fierce wind currents',       color: '#06b6d4', tier: 1 },
  drone_gauntlet_easy:{ label: 'First Gauntlet',   icon: '⚡', desc: 'T1 • Racing + obstacles combined',         color: '#0ea5e9', tier: 1 },
  drone_neoncity:     { label: 'Neon City Flight', icon: '🌆', desc: 'T2 • Cyberpunk urban obstacle dash',        color: '#c026d3', tier: 2 },
  drone_mountain:     { label: 'Mountain Flight',  icon: '⛰️', desc: 'T2 • Updrafts over treacherous peaks',      color: '#475569', tier: 2 },
  drone_asteroid:     { label: 'Asteroid Race',    icon: '🌑', desc: 'T2 • High-speed field race vs 3 drones',   color: '#374151', tier: 2 },
  drone_storm:        { label: 'Storm Chase',      icon: '⛈️', desc: 'T2 • Lightning dodge + energy collection',  color: '#1e3a8a', tier: 2 },
  drone_speed_trials: { label: 'Speed Trials',     icon: '🏎️', desc: 'T2 • Max velocity gate challenge',          color: '#7c3aed', tier: 2 },
  drone_skyrace:      { label: 'Sky Championship', icon: '🏆', desc: 'T2 • 10 rings — fastest time wins!',        color: '#0ea5e9', tier: 2 },
  drone_slalom:       { label: 'Space Slalom',     icon: '🚀', desc: 'T2 • 16 tight asteroid field gates',        color: '#6366f1', tier: 2 },
  drone_battle:       { label: 'Drone Battle',     icon: '💥', desc: 'T2 • Aerial combat vs 5 enemy drones',     color: '#dc2626', tier: 2 },
  drone_volcano:      { label: 'Volcano Flight',   icon: '🌋', desc: 'T3 • Race through volcanic ash & lava',     color: '#ea580c', tier: 3 },
  drone_deep_space:   { label: 'Deep Space',       icon: '🌌', desc: 'T3 • Wormholes, gravity wells & debris',    color: '#312e81', tier: 3 },
  drone_world_tour:   { label: 'World Tour',       icon: '🌍', desc: 'T3 • 4 world zones: Arctic→Desert→Ocean→City', color: '#065f46', tier: 3 },
  drone_elite:        { label: 'Elite Championship',icon:'👑', desc: 'T3 • 5-event skill test, 1 champion',       color: '#92400e', tier: 3 },
  drone_infinite_race:{ label: 'Infinite Race',    icon: '♾️', desc: 'T4 • Each lap faster & more dangerous',     color: '#1e1b4b', tier: 4 },
  drone_legend:       { label: 'Legend Circuit',   icon: '⭐', desc: 'T4 • Defeat 5 legendary AI pilots',         color: '#a16207', tier: 4 },
  drone_ultimate:     { label: 'Ultimate Flight',  icon: '💎', desc: 'T4 • Everything + 3 boss races, 10,000pts', color: '#18181b', tier: 4 },

  // ── HEAVY ROBOT — 20 courses ──────────────────────────────────────────────────
  heavy_basics:     { label: 'Training Yard',   icon: '🔧', desc: 'T1 • Heavy robot fundamentals',              color: '#78716c', tier: 1 },
  heavy_lifting:    { label: 'Lifting Challenge',icon:'💪', desc: 'T1 • Stack 5 crates precisely',               color: '#57534e', tier: 1 },
  heavy_drill_run:  { label: 'Drill Run',       icon: '⛏️', desc: 'T1 • LIDAR + drill through breakable walls',  color: '#a16207', tier: 1 },
  heavy_cargo:      { label: 'Cargo Mission',   icon: '📦', desc: 'T1 • Deliver fragile packages safely',        color: '#f59e0b', tier: 1 },
  heavy_clear:      { label: 'Obstacle Clear',  icon: '🚧', desc: 'T1 • Push all debris out of the road!',       color: '#d97706', tier: 1 },
  heavy_warehouse:  { label: 'Warehouse Run',   icon: '🏭', desc: 'T2 • Deliver all crates to correct zones',    color: '#f59e0b', tier: 2 },
  heavy_mining:     { label: 'Mining Operation',icon: '⛏️', desc: 'T2 • LIDAR scan → drill → collect crystals',  color: '#78350f', tier: 2 },
  heavy_bridge:     { label: 'Bridge Build',    icon: '🌉', desc: 'T2 • Carry beams & build bridge sections',    color: '#374151', tier: 2 },
  heavy_urban:      { label: 'Urban Mission',   icon: '🏙️', desc: 'T2 • City streets, wreckage & objectives',    color: '#1e293b', tier: 2 },
  heavy_salvage:    { label: 'Salvage Ops',     icon: '🔍', desc: 'T2 • LIDAR scan debris & extract components', color: '#0f766e', tier: 2 },
  heavy_construction:{ label:'Construction Site',icon:'🏗️', desc: 'T2 • Build site puzzles & logistics',         color: '#78716c', tier: 2 },
  heavy_megabuild:  { label: 'Mega Build',      icon: '🏢', desc: 'T2 • Multi-floor steel + tower crane!',       color: '#f97316', tier: 2 },
  heavy_demolition: { label: 'Demolition Day',  icon: '💣', desc: 'T2 • Systematically demolish marked buildings',color: '#dc2626', tier: 2 },
  heavy_disaster:   { label: 'Disaster Response',icon:'🆘', desc: 'T3 • Earthquake rescue — save 8 survivors!',  color: '#b91c1c', tier: 3 },
  heavy_deep_mine:  { label: 'Deep Mine',       icon: '💎', desc: 'T3 • 300m underground legendary deposits',    color: '#1e3a8a', tier: 3 },
  heavy_world_build:{ label: 'World Build',     icon: '🌍', desc: 'T3 • 5-zone mega project: dam/bridge/tower',  color: '#14532d', tier: 3 },
  heavy_boss:       { label: 'Boss Machine',    icon: '🤖', desc: 'T3 • Ultimate heavy machinery boss fight!',   color: '#4c1d95', tier: 3 },
  heavy_infinite:   { label: 'Infinite Site',   icon: '♾️', desc: 'T4 • Endless construction waves, escalating', color: '#1e1b4b', tier: 4 },
  heavy_legendary:  { label: 'Legendary Ops',   icon: '👑', desc: 'T4 • Defeat 5 legendary boss machines',       color: '#78350f', tier: 4 },
  heavy_ultimate:   { label: 'Ultimate Heavy',  icon: '💀', desc: 'T4 • All types + 3 mega bosses, 10,000pts!',  color: '#0a0a0a', tier: 4 },

  // ── NINJA DRONE — 20 courses ──────────────────────────────────────────────────
  ninja_training:    { label: 'Ninja Training',   icon: '🥷', desc: 'T1 • Stealth flight & targeting basics',     color: '#334155', tier: 1 },
  ninja_stealth:     { label: 'Stealth Intro',    icon: '👁️', desc: 'T1 • Sneak through 5 guard zones',           color: '#1e293b', tier: 1 },
  ninja_target:      { label: 'Target Practice',  icon: '🎯', desc: 'T1 • Precision laser shots, 10 targets',     color: '#475569', tier: 1 },
  ninja_infiltrate:  { label: 'Infiltration',     icon: '🔐', desc: 'T1 • Bypass security without alarms',        color: '#0f172a', tier: 1 },
  ninja_escape:      { label: 'Ninja Escape',     icon: '💨', desc: 'T1 • Escape the alerted enemy base!',         color: '#1e3a8a', tier: 1 },
  ninja_city_strike: { label: 'City Strike',      icon: '🏙️', desc: 'T2 • Urban combat — 8 rooftop targets',      color: '#1d4ed8', tier: 2 },
  ninja_heat_scan:   { label: 'Heat Scan Ops',    icon: '🔴', desc: 'T2 • Thermal vision through walls',           color: '#b91c1c', tier: 2 },
  ninja_laser_maze:  { label: 'Laser Maze',       icon: '⚡', desc: 'T2 • Active laser grid — one touch = fail!',  color: '#0891b2', tier: 2 },
  ninja_night_ops:   { label: 'Night Ops',        icon: '🌙', desc: 'T2 • Full darkness + enemy searchlights',     color: '#020617', tier: 2 },
  ninja_assassin:    { label: 'Assassin Run',     icon: '🗡️', desc: 'T2 • Eliminate 3 HVTs before timer expires', color: '#7f1d1d', tier: 2 },
  ninja_fortress:    { label: 'Fortress Raid',    icon: '🏰', desc: 'T2 • 5 gates, 20 guards, 1 objective',       color: '#312e81', tier: 2 },
  ninja_dogfight:    { label: 'Dogfight',         icon: '✈️', desc: 'T2 • Aerial combat vs 5 fighter drones',     color: '#0369a1', tier: 2 },
  ninja_base_raid:   { label: 'Base Raid',        icon: '💥', desc: 'T2 • Full assault — destroy 6 systems',      color: '#dc2626', tier: 2 },
  ninja_shadow_war:  { label: 'Shadow War',       icon: '👥', desc: 'T3 • 3-phase stealth/combat/extraction',     color: '#1e1b4b', tier: 3 },
  ninja_elite_ops:   { label: 'Elite Ops',        icon: '🎖️', desc: 'T3 • 5 simultaneous objectives — all at once!',color: '#312e81',tier: 3 },
  ninja_black_site:  { label: 'Black Site',       icon: '⬛', desc: 'T3 • Maximum security classified mission',   color: '#09090b', tier: 3 },
  ninja_super_stealth:{ label:'Ghost Run',        icon: '👻', desc: 'T3 • Zero evidence — perfect stealth only!',  color: '#1e1b4b', tier: 3 },
  ninja_infinite_war:{ label: 'Infinite War',     icon: '♾️', desc: 'T4 • Endless waves, enemies adapt to you',    color: '#0f172a', tier: 4 },
  ninja_legendary:   { label: 'Legendary Ninja',  icon: '👑', desc: 'T4 • Hunt 5 legendary commanders worldwide', color: '#78350f', tier: 4 },
  ninja_ultimate:    { label: 'Ultimate Ninja',   icon: '💀', desc: 'T4 • All skills + 3 super bosses, 10,000pts',color: '#020617', tier: 4 },

  // ── HUMANOID — 20 courses ─────────────────────────────────────────────────────
  human_basics:       { label: 'Basics Training',   icon: '🚶', desc: 'T1 • Walk, jump, grab fundamentals',        color: '#64748b', tier: 1 },
  human_combat_intro: { label: 'Combat Intro',      icon: '🥊', desc: 'T1 • Punch, dodge & kick 3 dummies',       color: '#dc2626', tier: 1 },
  human_platform:     { label: 'Platform Jump',     icon: '🏗️', desc: 'T1 • Precise platforming, 50 coins',        color: '#2563eb', tier: 1 },
  human_shield:       { label: 'Shield Training',   icon: '🛡️', desc: 'T1 • Master the perfect parry timing',     color: '#0891b2', tier: 1 },
  human_first_boss:   { label: 'First Boss',        icon: '⚔️', desc: 'T1 • Defeat the arena champion!',           color: '#7c3aed', tier: 1 },
  human_arena:        { label: 'Arena Combat',      icon: '🏟️', desc: 'T2 • 5 waves of opponents in the arena',   color: '#dc2626', tier: 2 },
  human_jungle:       { label: 'Jungle Mission',    icon: '🌿', desc: 'T2 • Navigate jungle + collect relics',     color: '#15803d', tier: 2 },
  human_city:         { label: 'City Combat',       icon: '🏙️', desc: 'T2 • Rooftop jumps + enemy squads',         color: '#1d4ed8', tier: 2 },
  human_dodge:        { label: 'Dodge Master',      icon: '⚡', desc: 'T2 • Dodge 50+ projectiles, collect boosts', color: '#f59e0b', tier: 2 },
  human_weapons:      { label: 'Weapons Trial',     icon: '🗡️', desc: 'T2 • Sword, shield, bow & gun mastery',    color: '#b91c1c', tier: 2 },
  human_tournament:   { label: 'Tournament',        icon: '🏆', desc: 'T2 • 8-robot bracket — win every fight!',   color: '#d97706', tier: 2 },
  human_army:         { label: 'Army Assault',      icon: '⚔️', desc: 'T2 • Survive 20-enemy squad attack',        color: '#7f1d1d', tier: 2 },
  human_ruins:        { label: 'Ancient Ruins',     icon: '🏛️', desc: 'T2 • Explore, fight & puzzle-solve ruins',  color: '#78350f', tier: 2 },
  human_elemental:    { label: 'Elemental Warrior', icon: '🌋', desc: 'T3 • Fire, Ice, Lightning & Earth champions', color: '#dc2626',tier: 3 },
  human_shadow:       { label: 'Shadow Duel',       icon: '👥', desc: 'T3 • Fight your own shadow clone!',          color: '#1e1b4b', tier: 3 },
  human_championship: { label: 'World Championship',icon: '🥇', desc: 'T3 • 5-event competition — most skillful wins!', color: '#a16207',tier: 3 },
  human_warrior:      { label: 'Warrior Trials',    icon: '⚔️', desc: 'T3 • 5 ancient trials + legendary guardian', color: '#5b21b6',tier: 3 },
  human_infinite:     { label: 'Infinite Arena',    icon: '♾️', desc: 'T4 • Endless waves — enemies evolve each round!', color: '#7f1d1d',tier: 4 },
  human_legend:       { label: 'Legend Hunt',       icon: '👑', desc: 'T4 • Defeat 5 legendary humanoid warriors',  color: '#78350f', tier: 4 },
  human_ultimate:     { label: 'Ultimate Humanoid', icon: '💀', desc: 'T4 • All skills + 3 god-tier bosses, 10,000pts!', color: '#18181b',tier: 4 },
};

export function getCourseDisplay(id) {
  return COURSE_DISPLAY[id] || COURSE_DISPLAY.open;
}

export function getCoursesForProfile(profileId) {
  const matched = SMART_STAGE_COURSES.filter((c) => c.profileIds.includes(profileId));
  const seen = new Set();
  const courses = [];
  for (const entry of matched) {
    if (seen.has(entry.id)) continue;
    seen.add(entry.id);
    const meta = getCourseDisplay(entry.id);
    courses.push({
      id: entry.id,
      label: meta.label,
      icon: meta.icon,
      desc: meta.desc,
      color: meta.color,
      mission: entry.mission,
      recommended: entry.recommended,
      tier: meta.tier || 0,
    });
  }
  if (!courses.length) {
    return ['open', 'obstacles'].map((id) => {
      const meta = getCourseDisplay(id);
      return { id, ...meta, mission: id === 'open' ? 'Explore freely' : 'Try the obstacle course', recommended: true };
    });
  }
  // Sort: recommended first, then by tier, then alpha
  const recommended = courses.filter((c) => c.recommended);
  const other = courses.filter((c) => !c.recommended).sort((a,b) => (a.tier||0)-(b.tier||0));
  return [...recommended, ...other];
}
