/**
 * mega-mode-spec-data.mjs — Authoritative VISUAL/GAMEPLAY overrides from the 350-mode mega spec.
 * Covers Rover, Scout, Crawler, and Tank chassis modes (40 modes).
 * Import MEGA_MODE_SPEC_OVERRIDES in generate-game-mode-specs.mjs or studio UI.
 */

export const MEGA_MODE_SPEC_OVERRIDES = {
  "rover_rover_obstacle_course": {
    modeName: "Rainbow Road Cruise",
    visualDescription: `Flat, bright rainbow-colored track (red→orange→yellow→green→blue→indigo→violet) extending 300m into distance. Shiny metallic track surface like ice skating rink. Cyan glowing rails on both sides. Checkered start line (black/white squares) in foreground. Checkered finish line at horizon. Dark space background with twinkling stars. Professional dramatic lighting: bright white key light from above, soft cyan fill light from side. Track glows with emissive rainbow colors. Camera positioned 8m behind rover, 3m above, looking forward. Speed blur effects as rover accelerates.`,
    gameplayDescription: `Drive forward on flat track from start to finish (300m) as fast as possible. Objective: reach finish line. Controls: arrow keys. No obstacles. Time measured but no limit. Success: cross finish line.`,
    mechanics: {
      primary: `Simple acceleration`,
      secondary: `steering, speed measurement`,
      teaches: `Sequential code execution, distance/time relationships, basic vehicle control.`,
    },
    quickInfo: {
      timeEstimate: "2-5 minutes",
      stars: {
        one: `finish`,
        two: `sub-2:30`,
        three: `sub-2:00`,
      },
    },
  },
  "rover_balanced_sprint": {
    modeName: "Balanced Sprint - Rainbow Road with Curves",
    visualDescription: `Same rainbow track but now with 3 gentle S-curves. Yellow arrow signs appear 20m before each turn showing direction. Cyan rails are prominent - hitting them triggers red particles and collision effect. Finish line is elaborate with celebration animation. Speed indicator HUD is prominent. Turn warning glows on screen before curves. Track still shows all 7 rainbow colors.`,
    gameplayDescription: `Drive 250m maintaining CONSISTENT speed (not accelerating/decelerating). Speed must stay constant throughout. Objective: reach finish without hitting rails too much. Challenge: managing variable speed. Time limit: 90 seconds. Success: finish without excessive crashes.`,
    mechanics: {
      primary: `Speed maintenance`,
      secondary: `collision detection with rails, penalty system`,
      teaches: `Variable control, maintaining constant values in code, loop timing.`,
    },
    quickInfo: {
      timeEstimate: "3-8 minutes",
      stars: {
        one: `complete`,
        two: `sub-2:00`,
        three: `perfect speed consistency + clean run`,
      },
    },
  },
  "rover_cargo_delivery_relay": {
    modeName: "Cargo Delivery Relay",
    visualDescription: `Rainbow track with 3 glowing delivery zones marked with circles. Zone 1 (RED, 50m): cargo box sits glowing. Zone 2 (YELLOW, 150m): delivery spot marked. Zone 3 (VIOLET, 250m): second delivery spot. Rover reaches Zone 1, cargo automatically attaches (visual cable attachment). Cargo box now follows rover (heavier, slower response). Particle effects show friction. Zones glow different colors. Finish line after Zone 3.`,
    gameplayDescription: `Pick up cargo at Zone 1, deliver to Zone 2, pick up again, deliver to Zone 3, reach finish. Objective: both deliveries successful without damage. Carrying cargo slows rover and reduces turning response. Hitting walls while carrying damages cargo (red damage indicator). Controls: arrow keys. Time limit: 120 seconds. Success: both deliveries completed.`,
    mechanics: {
      primary: `Waypoint navigation`,
      secondary: `cargo attachment/detachment, weight-based physics, damage tracking`,
      teaches: `Sequential multi-step objectives, waypoint navigation, conditional logic (if at zone, perform action).`,
    },
    quickInfo: {
      timeEstimate: "3-8 minutes",
      stars: {
        one: `complete`,
        two: `fast`,
        three: `perfect deliveries + sub-2:00`,
      },
    },
  },
  "rover_precision_parking_trial": {
    modeName: "Precision Parking Trial",
    visualDescription: `Rainbow track leads to parking lot at 200m mark. Track ends. Parking lot visible: asphalt surface with 3 spaces (RED, YELLOW, BLUE). Player's target: YELLOW space (narrow, 5.2m wide, rover is 2.5m wide). Glowing lines mark space boundaries. Tolerance circle (bright green) shows acceptable parking zone (±30cm from center). Camera switches to overhead view (top-down 2D). Rover appears as colored rectangle from above. Parking space glows green when perfectly centered, yellow when close, red when misaligned.`,
    gameplayDescription: `Park rover centered in YELLOW space. Drive up to space, carefully position rover perfectly in center. Challenge: space is narrow (only 1.35m on each side). Objective: stop within 30cm of center. Controls: arrow keys (fine, precise control). Time limit: 150 seconds. Success: park within tolerance.`,
    mechanics: {
      primary: `Precise positioning`,
      secondary: `overhead perspective navigation, distance measurement, tolerance detection`,
      teaches: `Coordinate-based positioning (X, Y, Z), sensor feedback loops, fine-tuning control code.`,
    },
    quickInfo: {
      timeEstimate: "3-10 minutes",
      stars: {
        one: `within 30cm`,
        two: `within 15cm`,
        three: `perfect within 5cm`,
      },
    },
  },
  "rover_reverse_driving_challenge": {
    modeName: "Reverse Driving Challenge",
    visualDescription: `Rainbow track but camera switches to rear-view perspective. Track recedes into distance behind rover. Violet colors appear closest (reversed visual order). Perspective is disorienting. Finish line (originally start) now appears behind rover. START line now appears ahead (reversed). HUD shows "REVERSE MODE" in bold. Backup camera feed appears in corner. Speed indicator shows negative velocity. Dust particles spray backward.`,
    gameplayDescription: `Drive ENTIRE 300m course in REVERSE without hitting rails. Objective: reach finish line (originally start line) driving backward. Challenge: disorienting camera angle and reversed controls. Up arrow now means move backward, down means forward. Time limit: 180 seconds. Success: reach finish driving backward.`,
    mechanics: {
      primary: `Reverse movement`,
      secondary: `reversed steering feel, rear-view camera, backup sensors`,
      teaches: `Negative vectors, camera perspective changes, inverse control mapping, real-world backup systems.`,
    },
    quickInfo: {
      timeEstimate: "4-10 minutes",
      stars: {
        one: `complete`,
        two: `sub-150sec`,
        three: `sub-120sec + no wall hits`,
      },
    },
  },
  "rover_slalom_weave": {
    modeName: "Slalom Weave",
    visualDescription: `Rainbow track with 10 slalom gates placed alternately left/right down 250m course. Each gate: two tall colored markers (red/blue) 3m apart. Gate counter on HUD shows "3/10 - GATES PASSED". Yellow arrows point toward upcoming gates. Passing through gate triggers visual glow and "ding" sound. Missing gate: gate flashes red. Speed emphasized - can travel quickly. Final gate leads to checkered finish line.`,
    gameplayDescription: `Pass through all 10 gates in sequence as fast as possible. Objective: navigate through gate centers (between markers). Challenge: precise steering at speed. Controls: arrow keys. Hitting markers causes 5-second penalty and gate must be re-passed. Time limit: 120 seconds. Success: complete all 10 gates.`,
    mechanics: {
      primary: `Gate detection`,
      secondary: `slalom navigation, speed maintenance while steering, penalty system`,
      teaches: `Pattern recognition, loop-based programming (repeat pattern), timing and rhythm.`,
    },
    quickInfo: {
      timeEstimate: "4-12 minutes",
      stars: {
        one: `complete`,
        two: `sub-110sec`,
        three: `sub-90sec + zero missed gates`,
      },
    },
  },
  "rover_fuel_efficiency_cruise": {
    modeName: "Fuel Efficiency Cruise",
    visualDescription: `Rainbow track extends 400m (longer). Fuel stations marked at 0m, 100m, 200m, 300m, 400m: large glowing blue boxes with pump symbol on track side. Fuel gauge top-left HUD: horizontal bar GREEN (75-100%), YELLOW (25-75%), RED (below 25%). Gauge animates draining as rover moves (faster speeds drain faster). Environmental signs: "FUEL STATION 100M AHEAD". When reaching station, visual pump animation and refuel sound. If fuel runs out, rover slows dramatically, alarm sound plays. Track remains rainbow.`,
    gameplayDescription: `Drive 400m managing limited fuel. Objective: reach finish without running out of fuel. Strategy: balance speed (burns fuel) vs time efficiency. Faster = more refuel stops. Slower = fewer stops but longer time. Controls: arrow keys. Time limit: 300 seconds. If fuel reaches zero before station, rover becomes nearly unplayable (slow). Success: finish with remaining fuel.`,
    mechanics: {
      primary: `Fuel consumption system`,
      secondary: `fuel gauge tracking, fuel station refuel, efficiency calculation`,
      teaches: `Variable management, optimization, resource management, conditional logic (if low on fuel, seek station).`,
    },
    quickInfo: {
      timeEstimate: "5-15 minutes",
      stars: {
        one: `complete`,
        two: `25%+ fuel remaining`,
        three: `optimal efficiency + sub-250sec`,
      },
    },
  },
  "rover_tow_truck_pull": {
    modeName: "Tow Truck Pull",
    visualDescription: `Rainbow track, at 100m mark: large disabled truck (gray/blue semi, realistic appearance) on roadside. Towing rope visible connecting rover's rear to truck's front bumper. Rope is taut cable. When rover moves, truck lags behind (rope tension visible). Rope shows danger (flashing red) if tension high. If pushed too far, rope snaps (game over). Dropoff zone 50m ahead: yellow/black striped parking area. HUD shows: Tow Status (Towing/Arrived), Rope Tension (percentage), Dropoff Distance. Camera adjusted to show both vehicles.`,
    gameplayDescription: `Tow truck 50m to dropoff zone without rope snapping. Objective: pull truck carefully to marked area. Challenge: towing reduces speed by 50%, reduces turning radius significantly. Rover moves slower and heavier when towing. Sudden turns or acceleration snap rope. Controls: arrow keys (restricted by load). Time limit: 120 seconds. Success: position truck in dropoff zone.`,
    mechanics: {
      primary: `Towing physics`,
      secondary: `reduced speed/turning when loaded, rope tension tracking, weight distribution`,
      teaches: `Physics simulation (mass affects movement), load management, careful control, real-world towing systems.`,
    },
    quickInfo: {
      timeEstimate: "4-10 minutes",
      stars: {
        one: `complete`,
        two: `smooth tow (no rope tension spikes)`,
        three: `perfect alignment in zone + smooth tow`,
      },
    },
  },
  "rover_stop_and_go_traffic_drill": {
    modeName: "Stop-and-Go Traffic Drill",
    visualDescription: `Rainbow track intersected by 5 traffic light signals every 50m on 250m course. Each light: tall pole with red/green light (very large, visible). Cycle: 3sec RED (light glows red, transparent red barrier blocks track), 3sec GREEN (light glows green, barrier disappears). When RED, barrier blocks track visually. Rover starts before first light. HUD: "TRAFFIC LIGHT STATUS" with visual indicator, "REACTION TIME" display. Passing RED: collision with barrier, rover bounces back, loses 5 seconds. Passing GREEN: green checkmark appears, "ding" sound. Ambient traffic sounds play.`,
    gameplayDescription: `Pass 5 traffic lights only when GREEN. Objective: pass all 5 on green without hitting red barriers. Challenge: timing and acceleration. Accelerate to hit green phases, or brake to wait for green. Time limit: 60 seconds (must be quick). Success: pass all 5 lights without red collisions.`,
    mechanics: {
      primary: `Traffic light state management`,
      secondary: `barrier collision detection, reaction time measurement, acceleration timing`,
      teaches: `Timing and synchronization, conditional statements (if green pass, if red wait), state machines, real-world traffic rules.`,
    },
    quickInfo: {
      timeEstimate: "3-8 minutes",
      stars: {
        one: `all lights passed`,
        two: `zero red hits`,
        three: `perfect timing all 5 + sub-50sec`,
      },
    },
  },
  "rover_rover_grand_tour": {
    modeName: "Rover Grand Tour",
    visualDescription: `Massive 500m mega-track combining ALL elements: straight rainbow sections (100m), curved sections (60m), parking area with space (40m), fuel stations (at 100m, 300m), traffic lights (3 at 200m, 300m, 400m), towing point (truck at 350m, drag 30m), cargo zones (150m, 400m). Environment transitions: starts in space with stars, transitions to cityscape (buildings visible), parking lot area, industrial zone, back to space. Finish line is grand: large checkered pattern, "WELCOME TO FINISH" banner, confetti on crossing. HUD: multi-objective tracker (Straight X/2, Cargo X/2, Refuel X/2, Traffic X/3, Towing X/1, Parking X/1). Camera shows impressive track layout cinematically at major checkpoints.`,
    gameplayDescription: `Complete ultimate journey using ALL Rover skills. Objectives in sequence: drive 100m on normal track, reach Cargo Zone 1 (auto-pickup), deliver to Zone 1A (auto-dropoff), continue to Refuel Station (auto-refuel), navigate through 3 traffic lights (time green), pass through 5 slalom gates, reach towing point, tow truck 30m to parking area, attempt precision parking in marked space, final 50m sprint to finish. Controls: arrow keys throughout entire journey. Time limit: 300 seconds (5 minutes). Success: complete all segments.`,
    mechanics: {
      primary: `All Rover mechanics combined`,
      secondary: `multi-objective tracking, segment-specific challenges, cumulative difficulty`,
      teaches: `Integrating all programming concepts, complex multi-step program design, real-world autonomous vehicle scenarios.`,
    },
    quickInfo: {
      timeEstimate: "10-30 minutes",
      stars: {
        one: `complete`,
        two: `complete + no errors`,
        three: `perfect execution all segments + sub-270sec + zero damage`,
      },
    },
  },
  "scout_high_speed_recon_sprint": {
    modeName: "High-Speed Recon Sprint",
    visualDescription: `Shorter rainbow road (150m) emphasizing RED at start for urgency. Completely flat, obstacle-free track. Speed emphasis: motion blur on screen as rover accelerates, speed lines emanate backward from rover, dust trail follows. HUD: LARGE speed indicator prominently displaying speed in km/h with target max speed marked. Speedometer is main focus. Checkpoint markers at 50m, 100m show progress. Finish line: extra-large checkered pattern, celebratory. Crossing triggers: fireworks, lights, triumphant music. Camera: tight behind-rover position emphasizing speed. Background blurs at high speed. Visual effects make speed feel visceral and exciting.`,
    gameplayDescription: `Pure speed challenge: drive as fast as possible down 150m straight track. Objective: cover distance in minimum time. No obstacles, no steering complexity, just maximum acceleration. Controls: Up arrow for acceleration (push to max immediately), Down arrow can brake if needed (reduces score). Time limit: None, but time measured. Challenge: reach maximum speed and maintain. Success: complete 150m and time recorded.`,
    mechanics: {
      primary: `Acceleration system`,
      secondary: `speed measurement, maximum velocity physics, time tracking, speedometer display`,
      teaches: `Understanding velocity/speed concept, acceleration vs velocity, measurement systems, optimization.`,
    },
    quickInfo: {
      timeEstimate: "2-5 minutes",
      stars: {
        one: `complete`,
        two: `under 20sec`,
        three: `under 15sec`,
      },
    },
  },
  "scout_speed_trap_blitz": {
    modeName: "Speed Trap Blitz",
    visualDescription: `Rainbow track with radar speed gun apparatus at 75m mark. Rover starts at 0m. Radar gun: large device positioned 20m ahead of rover path, pointing perpendicular to track. Large digital readout board above radar displays current speed in large numbers, updating real-time. Rover approaches radar at maximum speed. When rover passes through radar zone (marked with blue laser line across track), speed is captured. HUD displays "RADAR SPEED READING: 145 km/h" after passing. Speedometer in HUD shows speed building as rover accelerates toward radar. Radar beam visual: bright blue line crossing track. After passing: large number displays recorded speed ("RECORD: 145 km/h").`,
    gameplayDescription: `Maximize speed through radar checkpoint. Drive to radar gun and pass through at absolute maximum speed. Objective: record highest speed reading. Controls: full acceleration up arrow to build speed toward radar. Time limit: None, single run. Challenge: time acceleration to hit maximum speed at radar zone. Success: pass through radar (any speed).`,
    mechanics: {
      primary: `Speed checkpoint detection`,
      secondary: `radar gun simulation, peak speed recording, acceleration buildup, speed display`,
      teaches: `Speed measurement, checkpoints and sensors, peak performance calculation.`,
    },
    quickInfo: {
      timeEstimate: "2-4 minutes",
      stars: {
        one: `80+ km/h`,
        two: `120+ km/h`,
        three: `150+ km/h (challenging for Scout)`,
      },
    },
  },
  "scout_rapid_target_spotting": {
    modeName: "Rapid Target Spotting",
    visualDescription: `Rainbow track with 5 hidden target markers scattered along 200m course. Targets: glowing circles (different colors: red, blue, green, yellow, purple) placed at varying distances from track (some on track, some 5m to side). Each target has unique marker symbol. Rover must spot and drive to each target. Overhead map in HUD shows track and target locations as dots. Timer counts down from 120 seconds. As targets found, they disappear, next target location hints appear. Visual effect: bright flash when rover reaches each target. Rainbow track continues throughout. Camera stays behind rover but HUD focuses on map and target counter (X/5 TARGETS FOUND).`,
    gameplayDescription: `Find and reach 5 target markers before 120-second timer expires. Objective: locate targets using map and reach all 5. Controls: arrow keys to drive to targets. Challenge: navigation and time management - find all quickly. Success: reach all 5 targets before timer.`,
    mechanics: {
      primary: `Target detection system`,
      secondary: `navigation challenge, overhead map display, timer countdown, target counter`,
      teaches: `Navigation and pathfinding, sensor interpretation, time pressure decision-making.`,
    },
    quickInfo: {
      timeEstimate: "3-8 minutes",
      stars: {
        one: `complete`,
        two: `sub-100sec`,
        three: `sub-80sec + no wrong turns`,
      },
    },
  },
  "scout_shortcut_navigator": {
    modeName: "Shortcut Navigator",
    visualDescription: `Rainbow track with obvious main path and visible shortcut branching at 100m mark. Main path continues right (smooth rainbow track, 250m total). Shortcut goes left through rough terrain (muddy, bumpy, obstacles, looks challenging). Shortcut is shorter (150m total vs 250m main) but harder terrain. Visual contrast: smooth rainbow vs rough shortcut. Track signs: "HIGH-SPEED SHORTCUT" vs "STANDARD ROUTE". HUD shows alternative route timer if shortcut taken. Rough terrain shows rough textures, mud splashes, rocks.`,
    gameplayDescription: `Choose and navigate faster route to finish. At 100m mark, decide: continue smooth main route (guaranteed 3 minutes) or risky shortcut (2 minutes if successful). Objective: reach finish in minimum time. Controls: arrow keys direct rover to route choice. Time limit: 180 seconds. Success: complete either route under time.`,
    mechanics: {
      primary: `Route branching`,
      secondary: `terrain difficulty variations, risk vs reward, alternative path detection, time calculation`,
      teaches: `Optimization, risk assessment, route planning and algorithms, performance calculation.`,
    },
    quickInfo: {
      timeEstimate: "3-8 minutes",
      stars: {
        one: `any complete`,
        two: `shortcut + sub-120sec`,
        three: `shortcut + sub-90sec + minimal roughness damage`,
      },
    },
  },
  "scout_radar_beacon_chase": {
    modeName: "Radar Beacon Chase",
    visualDescription: `Rainbow track where finish line is NOT fixed - moving radar beacon (glowing cyan sphere) moves along and around track. Beacon follows predetermined path intersecting track at various points. HUD displays "BEACON POSITION: 150M AHEAD, 5 METERS LEFT" with vector pointing to beacon. Rover must catch and reach beacon position. Beacon moves at constant speed (faster than normal rover, slower than scout top speed). Visual trail follows beacon (blue particle trail). Radar ping sound plays periodically indicating beacon presence. If rover reaches beacon position, it "captures" beacon, new beacon spawns at different location. Multiple beacons captured in sequence (capture 5 to win).`,
    gameplayDescription: `Chase and capture moving radar beacons. Objective: reach beacon location before it moves away. Beacons appear and navigate around track, giving position updates via HUD. Must chase and "tag" beacon by reaching exact position. Challenge: beacon moves dynamically, requiring prediction and fast response. Controls: arrow keys to chase beacon. Time limit: 180 seconds to capture 5 beacons. Success: capture all 5 before timer.`,
    mechanics: {
      primary: `Beacon movement system`,
      secondary: `position tracking, capture detection, multiple target system, prediction mechanics`,
      teaches: `Prediction algorithms, dynamic object tracking, vector-based navigation.`,
    },
    quickInfo: {
      timeEstimate: "4-10 minutes",
      stars: {
        one: `3+ captures`,
        two: `4+ captures`,
        three: `all 5 + sub-150sec`,
      },
    },
  },
  "scout_fast_turn_drift": {
    modeName: "Fast-Turn Drift",
    visualDescription: `Rainbow track with 8 sharp 90-degree turns (tight corners). Track narrower (3m wide vs normal 5m), requiring precise turning at speed. Each turn banked slightly (road tilts into turn) emphasizing drifting feel. Turn markers show ideal racing line (white dashed line through corner). Drifting visually prominent: at high speed turns, visible "drift trail" (tire mark effect), rear wheels slide visibly. Drift angle indicator in HUD shows lean angle during turns. Smooth drifts (clean racing line) trigger visual effects (blue particles, satisfying sound). Poor turns show red warning. Speed through turn calculated as efficiency score. Each turn has difficulty rating (TURN 1: EASY, TURN 3: DIFFICULT, etc).`,
    gameplayDescription: `Execute fast, smooth turns through 8 consecutive corners. Objective: navigate all turns while maintaining high speed and clean drifting. Challenge: balance speed with control - too fast causes crash, too slow loses points. Controls: arrow keys emphasizing smooth turning inputs. Time limit: 120 seconds. Drift mechanic: turning at high speed creates visible drift (visual feedback for good technique). Success: complete all 8 turns staying on track.`,
    mechanics: {
      primary: `High-speed turning physics`,
      secondary: `drift mechanics (visible side-slip), banking system, turn difficulty scaling, drift quality measurement`,
      teaches: `Vector-based turning, curved motion physics, real-world racing techniques, smooth control importance.`,
    },
    quickInfo: {
      timeEstimate: "4-10 minutes",
      stars: {
        one: `complete`,
        two: `smooth drifts on 6+ turns`,
        three: `perfect drift all 8 turns + sub-100sec`,
      },
    },
  },
  "scout_outrun_the_timer": {
    modeName: "Outrun the Timer",
    visualDescription: `Rainbow track that gets progressively more dangerous as time passes. Track starts normal at 0 seconds. At 10-second mark, first obstacle appears (laser barrier blocks track at 100m, warning glow then appears). Obstacles continue appearing: 20sec (laser at 150m), 30sec (laser at 200m), etc. Obstacles appear gradually, forcing rover to outrun spreading obstacles. Visual effect: obstacles glow red before appearing (warning). Track behind rover shows obstacles deploying. HUD displays LARGE countdown timer: "50 SECONDS REMAINING" - creates urgency. Rover must reach finish before obstacles block entire track. Speed emphasized. Music tempo increases as obstacles approach. Visual effect: glowing red wall of obstacles advancing.`,
    gameplayDescription: `Drive faster than obstacles advancing behind. Objective: reach finish line before obstacles cut off escape. Obstacles deploy progressively along 300m track. Challenge: must constantly accelerate to stay ahead of advancing danger. Controls: full acceleration needed throughout. Time limit: 120 seconds (obstacles continue deploying). Success: reach finish before final obstacle deploys.`,
    mechanics: {
      primary: `Progressive obstacle deployment`,
      secondary: `time-based difficulty scaling, minimum speed requirement, advancing danger system`,
      teaches: `Real-time performance pressure, acceleration and speed limits, survival algorithms.`,
    },
    quickInfo: {
      timeEstimate: "3-8 minutes",
      stars: {
        one: `reach finish`,
        two: `with 20+ sec time buffer`,
        three: `sub-90sec + large time margin`,
      },
    },
  },
  "scout_scout_patrol_relay": {
    modeName: "Scout Patrol Relay",
    visualDescription: `Two scout rovers visible on track: Player's rover (blue) and partner rover (cyan). Start together at start line. Track is 200m with 2 handoff zones (100m and 200m marks). Handoff zones marked with glowing circles on track. At first handoff (100m), player rover passes "speed baton" (visual indicator) to partner rover. Partner then drives to 200m. Player rover catches partner's handoff, sprints final stretch to finish. Visual effect: when handoff occurs, visual "baton" transfers between rovers (they touch briefly). Both rovers' positions shown in HUD. Speed of both displayed. Teamwork visual: close proximity needed for handoff (within 2m).`,
    gameplayDescription: `Relay race with partner rover - each covers portion of track at full speed. Objective: complete team race faster than target time. Handoff mechanic: when partner reaches handoff zone, player must be close (within 2m) to receive baton. Challenge: timing handoffs, maintaining speed through transitions. Controls: arrow keys throughout entire relay. Time limit: 150 seconds total for both combined. Success: complete relay under time, both handoffs successful.`,
    mechanics: {
      primary: `Multiplayer/partner system`,
      secondary: `handoff detection (proximity-based), baton transfer, team speed calculation, coordination requirements`,
      teaches: `Handoff/transfer mechanics, team coordination algorithms, timing and synchronization.`,
    },
    quickInfo: {
      timeEstimate: "4-10 minutes",
      stars: {
        one: `relay complete`,
        two: `smooth handoffs (both successful)`,
        three: `perfect handoffs + sub-130sec`,
      },
    },
  },
  "scout_dynamic_obstacle_dodge": {
    modeName: "Dynamic Obstacle Dodge",
    visualDescription: `Rainbow track with boulders/obstacles that "fall" from above at intervals. Obstacles appear as large rocks descending from sky (animation of falling). Danger zones marked with warning circles on track showing where obstacles land. Obstacles land with impact effect (screen shake, dust cloud, sound). Rover must steer around landing zones. Track is 250m with obstacles every 30m (8 total). Falling sequence: obstacle appears 2sec before landing (visual warning), lands on track (blocks 2m diameter area), stays 3sec, disappears. If rover at landing zone, collision (crash animation). HUD shows "AVOID OBSTACLES - 8 INCOMING". Minimap shows upcoming landing zones. Speed maintained for challenge.`,
    gameplayDescription: `Navigate around falling obstacles at high speed. Objective: reach finish without hitting obstacles. Challenge: dodge while maintaining speed. Timing: obstacles land predictably but require quick dodging. Controls: arrow keys (primarily left/right for dodging). Time limit: 100 seconds (quick passage). Success: reach finish without collisions.`,
    mechanics: {
      primary: `Falling obstacle system`,
      secondary: `collision detection, warning system, dodge mechanics, high-speed navigation`,
      teaches: `Prediction and timing, collision avoidance algorithms, spatial reasoning at speed.`,
    },
    quickInfo: {
      timeEstimate: "3-8 minutes",
      stars: {
        one: `complete`,
        two: `dodge 6+/8 perfectly`,
        three: `perfect all 8 + sub-90sec`,
      },
    },
  },
  "scout_apex_speed_champion": {
    modeName: "Apex Speed Champion",
    visualDescription: `Championship-level speed event. Track is 300m pristine rainbow road, flanked by grandstands (spectator areas on sides). Overhead banner: "APEX SPEED CHAMPIONSHIP". Massive finish line portal (tall, impressive structure framing finish). Speed records displayed on giant boards around track (previous records shown). Rover positioned at start line. Spotlight illuminates rover (dramatic lighting). Crowd noise audible (cheering at checkpoints). Speed records update real-time on billboards. Final finish: MASSIVE celebration (fireworks, lights, crowd roar, trophy appears). Camera pulls back to show dramatic finish. Music epic and triumphant. Visual quality highest - feels like major event.`,
    gameplayDescription: `Achieve fastest possible time over 300m to win championship. Objective: beat existing speed records and set new world record. Challenge: achieve theoretical maximum performance. All-out acceleration start to finish. Controls: full acceleration entire way (up arrow held). Time limit: 180 seconds of measuring (time recorded automatically). Success: finish recorded.`,
    mechanics: {
      primary: `Championship event`,
      secondary: `speed record tracking, record comparison system, maximum performance measurement, victory condition`,
      teaches: `Performance optimization, record-breaking concepts, maximum capability, competition mechanics.`,
    },
    quickInfo: {
      timeEstimate: "3-8 minutes",
      stars: {
        one: `complete`,
        two: `under 25sec`,
        three: `under 20sec (extremely challenging)`,
      },
    },
  },
  "crawler_rocky_mountain_climb": {
    modeName: "Rocky Mountain Climb",
    visualDescription: `Mountainous terrain with winding uphill path. Crawler starts at base (elevation 0m). Path winds up mountain with increasing steepness. Terrain: rocky, brown/gray rocks visible, sparse vegetation. Incline gets steeper: 5 degrees at start, 15 degrees at midpoint, 25 degrees near peak. Mountain peak visible in distance (white snow cap). Sky shows mountain vista. Camera positioned behind crawler angled to show uphill slope ahead. Path width narrows as climbs higher. Checkpoints marked at elevation intervals: Base (0m), Midpoint (500m), Peak (1000m). Visual indicators show elevation gain. At peak, panoramic view of landscape visible. Crawler treads visible gripping rocky terrain.`,
    gameplayDescription: `Climb mountain from base to peak (1000m elevation gain). Objective: reach mountain peak. Challenge: maintains grip on steep inclines, power management needed. As steepness increases, speed must decrease to maintain traction. Too fast on steep = slip/slide backward. Controls: arrow keys (up accelerates climbing, down is brake). Time limit: 180 seconds. Success: reach peak.`,
    mechanics: {
      primary: `Incline physics`,
      secondary: `traction system, power/torque distribution, grip detection, slipping system`,
      teaches: `Physics of inclined planes, force management, conservation of momentum on slopes.`,
    },
    quickInfo: {
      timeEstimate: "5-12 minutes",
      stars: {
        one: `reach peak`,
        two: `sub-150sec`,
        three: `sub-120sec + no slips`,
      },
    },
  },
  "crawler_mud_puddle_traction_test": {
    modeName: "Mud Puddle Traction Test",
    visualDescription: `Swampy terrain filled with mud, water, rocks. Multiple large mud puddles (brown, murky water) scattered across 200m track. Puddles vary in depth: shallow (0.5m), medium (1m), deep (1.5m). Crawler can ford puddles but speed reduced in mud (drag simulation). Rocks protrude from mud (navigation obstacles). Terrain is slippery - losing traction visible (wheels spinning, mud spray). Crawler's treads must grip through mud. Camera shows side view emphasizing traction challenge. Mud clings to Crawler (visual mud caking on chassis). Swampy vegetation visible. Water splashes as Crawler crosses. Success counter shows "PUDDLES CROSSED: 5/8".`,
    gameplayDescription: `Navigate through 8 mud puddles without getting stuck. Objective: cross all puddles and reach other side of swamp. Challenge: mud reduces speed significantly, requires careful power management to avoid bogging down. Too slow = stuck. Too fast without traction = spinout. Controls: arrow keys (requires balanced acceleration). Time limit: 120 seconds. Success: cross all 8 puddles.`,
    mechanics: {
      primary: `Mud drag system`,
      secondary: `traction reduction, spinout detection, terrain friction variation, stuck detection`,
      teaches: `Terrain analysis, traction management, force application in different conditions.`,
    },
    quickInfo: {
      timeEstimate: "4-10 minutes",
      stars: {
        one: `cross all`,
        two: `sub-100sec`,
        three: `sub-80sec + minimal slipping`,
      },
    },
  },
  "crawler_log_bridge_crossing": {
    modeName: "Log Bridge Crossing",
    visualDescription: `Dense forest with stream crossing. Path leads to a log bridge (large fallen tree) spanning stream. Log is narrow (1m diameter, 15m long). Stream below is 5m deep (visible water). Bridge is stable but narrow - any deviation falls into stream (game over). Camera shows side view of log and stream. Log has bark texture visible. Stream water moves (current visible). Far side of stream shows exit point. Crawler must walk across log carefully. HUD shows "BALANCE: 50%" as alignment indicator. Any lean to side shows % deviation.`,
    gameplayDescription: `Cross narrow log bridge over stream without falling. Objective: reach other side of stream via log. Challenge: log is only 1m wide, Crawler is 2m long - requires balance and precise steering. Must stay perfectly centered on log. Deviation causes fall into stream (restart). Controls: arrow keys (primarily forward/left-right for balance). Time limit: 90 seconds. Success: reach other side.`,
    mechanics: {
      primary: `Balance system`,
      secondary: `narrow path detection, fall detection, precision steering, real-time alignment tracking`,
      teaches: `Balance and precision control, constraint-based navigation, careful movement.`,
    },
    quickInfo: {
      timeEstimate: "3-8 minutes",
      stars: {
        one: `cross`,
        two: `perfect balance throughout`,
        three: `sub-80sec + perfect center maintenance`,
      },
    },
  },
  "crawler_boulder_field_crawl": {
    modeName: "Boulder Field Crawl",
    visualDescription: `Rocky field scattered with large boulders (2-3m diameter each). 15 boulders placed across 250m track in challenging pattern requiring navigation around/between them. Boulders are dark gray, weathered appearance. Terrain is loose gravel. Crawler must navigate through boulder field without hitting them. Collisions cause Crawler to bounce back. Visual effect: dust clouds when hitting boulders. Camera maintains behind-crawler view. Boulders cast shadows. Difficulty increases as progresses (boulders closer together at end). Exit point at far end clearly marked.`,
    gameplayDescription: `Navigate through boulder field to exit point. Objective: weave through boulders reaching exit without excessive collisions. Challenge: tight spaces require precise steering. Boulders placed in maze-like pattern. Controls: arrow keys (sharp turning required). Time limit: 120 seconds. Success: reach exit.`,
    mechanics: {
      primary: `Boulder collision detection`,
      secondary: `bouncing physics, tight navigation, obstacle avoidance, path detection`,
      teaches: `Spatial navigation, obstacle avoidance, path planning, precise turning.`,
    },
    quickInfo: {
      timeEstimate: "4-10 minutes",
      stars: {
        one: `reach exit`,
        two: `minimal collisions (2 or fewer)`,
        three: `zero collisions + sub-100sec`,
      },
    },
  },
  "crawler_trench_explorer": {
    modeName: "Trench Explorer",
    visualDescription: `Deep ravine/trench cutting through terrain. Crawler descends into trench (steep sides), floor is 30m below rim. Walls are nearly vertical, rough rocky texture. Floor is narrow (5m wide). Path down: switchback trail (zigzag down walls). Crawler must carefully navigate switchbacks without tumbling. Danger: falling sideways off narrow trail = tumble into ravine. Camera positioned to show depth danger. Shadows emphasize depth. At trench bottom, path leads forward. Echo sounds when in trench. Atmosphere is ominous/exploratory. Exit path leads up other side (climb back out).`,
    gameplayDescription: `Descend into trench and traverse to opposite side. Objective: navigate switchbacks, cross trench floor, climb out other side. Challenge: very narrow switchback paths at steep angles. Must drive carefully on switchbacks (too fast = tip/tumble). Controls: arrow keys (careful acceleration on slopes). Time limit: 150 seconds. Success: reach opposite rim.`,
    mechanics: {
      primary: `Steep incline system`,
      secondary: `switchback detection, tumble physics, tip-over detection, gravity simulation`,
      teaches: `Path planning in 3D space, gravity effects, careful maneuvering on slopes.`,
    },
    quickInfo: {
      timeEstimate: "5-12 minutes",
      stars: {
        one: `reach opposite side`,
        two: `no tumbles`,
        three: `sub-120sec + no tumbles + perfect switchback navigation`,
      },
    },
  },
  "crawler_sand_dune_drift": {
    modeName: "Sand Dune Drift",
    visualDescription: `Desert landscape with large sand dunes. Crawler navigates through dune field (500m total distance). Dunes: large (20-30m high), varying slopes. Sand is light tan color, sparkles in sunlight. Wind effects visible (sand swirls, particles in air). Dunes provide no hard surface - sand is soft, shifting (visual sand particle effects). Crawler's treads sink into sand (creating tracks visible behind). Moving through sand slows Crawler significantly. Camera positioned to emphasize scale of dunes. Sky is bright desert blue. Sand dunes cast long shadows.`,
    gameplayDescription: `Navigate through sand dune field to exit. Objective: cross dune field reaching finish point. Challenge: sand reduces traction and speed. Dunes have steep slopes (climbing difficult). Soft sand slows progress. Must maintain momentum to climb dunes (go too slow = sink and stop). Controls: arrow keys (momentum management critical). Time limit: 180 seconds. Success: reach exit on far side.`,
    mechanics: {
      primary: `Sand resistance system`,
      secondary: `soft terrain drag, momentum conservation, sinking detection, power distribution on slopes`,
      teaches: `Momentum management, terrain resistance analysis, strategic acceleration.`,
    },
    quickInfo: {
      timeEstimate: "5-12 minutes",
      stars: {
        one: `complete`,
        two: `sub-150sec`,
        three: `sub-120sec + minimal stuck points`,
      },
    },
  },
  "crawler_earthquake_hazard_trial": {
    modeName: "Earthquake Hazard Trial",
    visualDescription: `Flat terrain that becomes unstable. Earthquake starts at 10-second mark. Ground shakes (visual screen tremor), cracks appear in terrain (dark lines spreading across ground). Sections of terrain tilt/shift (geometry changes angle). Large chasm opens (previously connected terrain now separated by gap). Crawler must navigate around newly formed obstacles. Visual effect: debris falls, dust clouds from quakes. Tremors continue throughout (periodic screen shake). Terrain becomes increasingly unstable. Original path may be blocked, requiring alternative routes. Damage visible on terrain (broken surfaces). Camera shakes with earthquake intensity.`,
    gameplayDescription: `Navigate unstable earthquake terrain reaching finish before major damage. Objective: adapt to changing terrain, find new paths around chasm/cracks. Challenge: terrain changes during race, requiring real-time adaptation. Controls: arrow keys (constant path adjustment). Time limit: 120 seconds. Success: reach finish despite terrain changes.`,
    mechanics: {
      primary: `Dynamic terrain system`,
      secondary: `earthquake simulation, chasm generation, real-time path changes, adaptation requirement`,
      teaches: `Adaptive navigation, real-time decision-making, flexibility in programming.`,
    },
    quickInfo: {
      timeEstimate: "4-10 minutes",
      stars: {
        one: `complete`,
        two: `sub-100sec`,
        three: `sub-80sec + minimal fall-ins`,
      },
    },
  },
  "crawler_heavy_incline_hold": {
    modeName: "Heavy Incline Hold",
    visualDescription: `Massive steep slope (30-degree incline constant for 200m). Crawler positioned at bottom facing uphill. Slope is solid (rock/gravel), stable surface. Incline is relentless - no flat sections. Landscape: barren, rocky, sparse vegetation. Sky emphasizes steepness (camera angled shows horizon far above). Crawler's climb progress visible: elevation markers show climb (100m, 200m, 300m elevation). At steep incline, holding position is challenge - gravity pulls downward. Crawler treads must grip to prevent sliding backward. Visual: Crawler appears to strain climbing slope.`,
    gameplayDescription: `Climb relentless 30-degree slope (200m distance, ~100m elevation gain). Objective: reach top without sliding backward. Challenge: gravity constantly pulls backward. Insufficient power = slide downward. Must maintain forward momentum. Controls: arrow keys (constant acceleration needed). Time limit: 180 seconds. Success: reach top.`,
    mechanics: {
      primary: `Gravity simulation`,
      secondary: `steepness compensation, power/torque requirement, backward slide detection, continuous climb`,
      teaches: `Force required to overcome gravity, power requirements, sustained effort concept.`,
    },
    quickInfo: {
      timeEstimate: "5-12 minutes",
      stars: {
        one: `reach top`,
        two: `sub-150sec`,
        three: `sub-120sec + no backward sliding`,
      },
    },
  },
  "crawler_wilderness_search_patrol": {
    modeName: "Wilderness Search Patrol",
    visualDescription: `Large wilderness area (400m circuit). Crawler starts at patrol base. Route loops through different terrain types: forest (trees visible), cleared areas, stream crossings, rocky outcrops. Patrol objective: investigate 6 checkpoints scattered along circuit (marked with glowing markers). Each checkpoint: marked with flag, must reach exact position. Terrain varies making route challenging. Natural obstacles: fallen trees, natural obstacles (rocks, steep slopes). Helicopter searchlight visible in sky (creates dramatic lighting). Wildlife sounds (birds, insects). Atmosphere: exploration, search and rescue. Route shows on HUD map.`,
    gameplayDescription: `Complete patrol circuit hitting all 6 checkpoints. Objective: reach each checkpoint in sequence and complete circuit. Challenge: diverse terrain requires different driving styles. Controls: arrow keys. Checkpoints marked on HUD map. Time limit: 300 seconds (5 minutes for full circuit). Success: visit all 6 checkpoints and return to base.`,
    mechanics: {
      primary: `Waypoint system`,
      secondary: `patrol circuit navigation, checkpoint detection, diverse terrain challenges, route tracking`,
      teaches: `Route planning, navigation with multiple waypoints, efficiency optimization.`,
    },
    quickInfo: {
      timeEstimate: "8-15 minutes",
      stars: {
        one: `complete circuit`,
        two: `all checkpoints + sub-250sec`,
        three: `perfect route + sub-220sec + no crashes`,
      },
    },
  },
  "crawler_all_terrain_master": {
    modeName: "All-Terrain Master",
    visualDescription: `Mega-course combining ALL terrain challenges: mountain climb (100m), mud puddles (50m), log bridge crossing (20m), boulder field (60m), trench (40m), sand dunes (80m), earthquake zone (50m), steep slope (100m). Each section transitions smoothly. Landscape is massive and impressive. Progress shown on master map in HUD. Terrain difficulty escalates through course. Final section is hybrid challenge (multiple terrain types simultaneously). Visual quality is impressive: detailed terrain, dynamic effects, cinematic views at major transitions. Finish line is celebratory.`,
    gameplayDescription: `Complete ultimate all-terrain course mastering all terrain types. Objectives: climb mountain, cross mud, navigate log bridge, weave boulders, traverse trench, navigate dunes, survive earthquake, climb incline, finish. Controls: arrow keys throughout (adaptation to each terrain). Time limit: 600 seconds (10 minutes). Success: complete entire course.`,
    mechanics: {
      primary: `All Crawler mechanics`,
      secondary: `terrain transitions, cumulative difficulty, final hybrid challenge`,
      teaches: `Mastery of all terrain mechanics, adaptation to varied conditions.`,
    },
    quickInfo: {
      timeEstimate: "15-30 minutes",
      stars: {
        one: `complete`,
        two: `complete sub-500sec`,
        three: `perfect execution all sections + sub-450sec`,
      },
    },
  },
  "tank_fortress_core_defense": {
    modeName: "Fortress Core Defense",
    visualDescription: `Military fortress (large compound) shown from above. Tank positioned at entrance. Objective: defend fortress from attackers. Enemy tanks approach from 4 directions (visible on HUD radar). Tank must position itself to intercept attackers. Fortress walls visible, guard towers at corners. Defensive positions marked (good firing angles). Enemy tanks appear as red dots on radar approaching. HUD displays: Fortress Integrity (health %), Enemy Count, Current Threat Level. Tank cannon visible aiming. Explosions visible when engaging enemies. Fortress takes damage if enemies reach walls (visual damage to walls).`,
    gameplayDescription: `Defend fortress for 120 seconds against wave of enemies. Objective: eliminate approaching enemy tanks before reaching fortress. Challenge: multiple simultaneous threats from different directions. Tank slow movement requires strategy - can't defend all sides equally. Must choose priorities. Controls: arrow keys for movement, various keys for cannon fire. Waves of enemies progressively stronger. Success: survive 120 seconds without fortress being destroyed.`,
    mechanics: {
      primary: `Base defense system`,
      secondary: `enemy wave spawning, threat prioritization, cannon targeting, fortress health, damage system`,
      teaches: `Strategic positioning, threat assessment, multi-tasking under pressure.`,
    },
    quickInfo: {
      timeEstimate: "5-12 minutes",
      stars: {
        one: `defend 120sec`,
        two: `no fortress damage`,
        three: `100% enemy elimination + fortress pristine`,
      },
    },
  },
  "tank_heavy_mortar_cannon": {
    modeName: "Heavy Mortar Cannon",
    visualDescription: `Tank positioned in elevated terrain (canyon rim overlooking valley). Enemy positions visible in distant valley (10 buildings/bunkers scattered 500m+ away). Tank's mortar cannon is primary weapon. HUD shows: target crosshair, distance to target (in meters), cannon angle adjustment. Player must calculate angle and distance to hit targets. Mortar fires arc trajectory (visible path prediction line). Explosions erupt at target locations (large blast effects, particles). Each hit registers on HUD. Targets visible as glowing red markers. Terrain between tank and targets: rough, canyon walls, obstacles don't block mortar fire (arc goes over).`,
    gameplayDescription: `Hit all 10 enemy targets using mortar cannon. Objective: use artillery to eliminate distant targets. Challenge: must calculate correct angle and distance. Mortar physics: wind affects trajectory slightly, distance affects aim angle. Controls: adjust angle (up/down arrows), adjust power (left/right arrow), fire (spacebar). Time limit: 180 seconds. Success: hit all 10 targets.`,
    mechanics: {
      primary: `Artillery physics`,
      secondary: `trajectory calculation, wind simulation, distance compensation, aiming system`,
      teaches: `Physics of projectile motion, distance/angle relationships, artillery tactics.`,
    },
    quickInfo: {
      timeEstimate: "5-12 minutes",
      stars: {
        one: `8+ hits`,
        two: `all 10 hits`,
        three: `all 10 + perfect accuracy (no wasted shots)`,
      },
    },
  },
  "tank_bumper_car_sumo": {
    modeName: "Bumper Car Sumo",
    visualDescription: `Arena (flat arena, 200m diameter). Two tanks: player (blue) and enemy (red). Both visible in arena from above view (camera shows entire arena). Objective: push enemy tank outside arena boundary (circular perimeter marked with glowing line). Tanks collide (physical impact). Larger/heavier tank (player's) has advantage. Collision effects: both tanks rock backward from impact. Health bars shown for both tanks. Arena boundary clearly marked. Audience visible around arena edges (spectators cheering/booing). Score tracker: "YOUR POSITION: CENTER, ENEMY POSITION: EDGE".`,
    gameplayDescription: `Use tank to push enemy tank out of arena. Objective: force enemy beyond boundary. Challenge: enemy tank resists being pushed, tries to push player instead. Tank-on-tank collision: weight and speed matter. Controls: arrow keys (drive toward enemy, build momentum, crash into enemy). Time limit: 180 seconds. Success: push enemy outside boundary.`,
    mechanics: {
      primary: `Physics-based collision`,
      secondary: `arena boundary detection, pushing mechanics, weight/momentum simulation`,
      teaches: `Physics of collision and momentum, force application, combat tactics.`,
    },
    quickInfo: {
      timeEstimate: "4-10 minutes",
      stars: {
        one: `force out`,
        two: `force out within 60sec`,
        three: `minimal damage taken + force out sub-60sec`,
      },
    },
  },
  "tank_minefield_clearance": {
    modeName: "Minefield Clearance",
    visualDescription: `Flat terrain with 20 mines scattered across 300m course. Mines appear as small metallic spheres (dark gray, slightly buried). Minimap shows all mine locations (red dots). Tank must navigate carefully avoiding all mines (any mine hit = explosion, immediate failure). Path width narrowed by mine placement (clever positioning creates "safe corridor"). Terrain: sandy, flat. Camera shows birds-eye view emphasizing mine field visibility. Safe path is narrow and winding. Explosion effects would be dramatic if hit (debris, fire).`,
    gameplayDescription: `Navigate through minefield avoiding all 20 mines. Objective: reach exit without hitting any mines. Challenge: path is narrow and winding, requires precise steering. Mines are stationary (no movement). Controls: arrow keys (careful steering). Time limit: 150 seconds. Success: exit minefield without hitting any mine.`,
    mechanics: {
      primary: `Mine detection`,
      secondary: `collision triggering, explosion effect, safe path existence, precision navigation`,
      teaches: `Careful route planning, hazard avoidance, precision under pressure.`,
    },
    quickInfo: {
      timeEstimate: "4-10 minutes",
      stars: {
        one: `exit intact`,
        two: `exit + sub-120sec`,
        three: `perfect navigation + sub-100sec + no mine touches`,
      },
    },
  },
  "tank_shield_wall_endurance": {
    modeName: "Shield Wall Endurance",
    visualDescription: `Tank positioned in defensive stance. Enemy artillery barrage begins (shells rain down). Tank raises heavy armor shield (visual shield deployed). Shells impact shield, creating impact effects (explosions, particles). Shield absorbs damage but has limited durability. Durability bar shown in HUD (decreases with each hit). Tank must maintain shield position while enemy bombardment continues. Explosions visible around tank (near misses). Shield glows red when taking damage. Intense bombardment creates atmospheric effect (sound, screen shake). Visual: tank looks small compared to massive incoming fire.`,
    gameplayDescription: `Survive 120-second artillery bombardment. Objective: maintain shield until bombardment ends. Challenge: shield loses durability progressively. Must monitor shield health. If shield breaks, tank takes direct damage. Controls: maintain position (arrow keys), can move but moving strains shield. Time limit: 120 seconds. Success: survive full bombardment.`,
    mechanics: {
      primary: `Shield durability system`,
      secondary: `damage absorption, durability degradation, incoming fire simulation`,
      teaches: `Resource management under pressure, endurance testing, damage resistance concepts.`,
    },
    quickInfo: {
      timeEstimate: "3-8 minutes",
      stars: {
        one: `survive`,
        two: `shield durability 25%+ remaining`,
        three: `shield 50%+ remaining + zero damage to tank`,
      },
    },
  },
  "tank_goliath_tank_duel": {
    modeName: "Goliath Tank Duel",
    visualDescription: `Two tanks: player (blue heavy tank) vs enemy (red heavy tank). Arena: flat ground (100m diameter). Both tanks visible, heavily armored, impressive scale. Each has health bar (top of screen). Weapons: cannon and machine gun. Engagement: tanks face off, both trying to win. Enemy tank AI: attacks aggressively, fires cannon, tries to maneuver for advantage. Explosions visible when weapons hit. Dust clouds from impacts and movement. Dramatic lighting emphasizing intensity. Score: damage dealt vs taken.`,
    gameplayDescription: `Defeat enemy tank in one-on-one combat. Objective: reduce enemy health to zero before your health depleted. Challenge: both tanks heavily armed, match lasts while both survive. Controls: arrow keys for movement, various keys for weapons (cannon for heavy damage, machine gun for sustained fire). Time limit: 300 seconds (5 minutes maximum). Success: enemy health depleted to zero.`,
    mechanics: {
      primary: `Combat system`,
      secondary: `cannon and machine gun mechanics, health tracking, enemy AI`,
      teaches: `Combat tactics, resource management (ammo), health management.`,
    },
    quickInfo: {
      timeEstimate: "5-15 minutes",
      stars: {
        one: `win`,
        two: `win quickly (sub-180sec)`,
        three: `win + minimal damage taken + sub-120sec`,
      },
    },
  },
  "tank_battery_payload_escort": {
    modeName: "Battery Payload Escort",
    visualDescription: `Tank starts with large battery/power cell loaded on chassis (visual: large glowing cylinder mounted on tank top). Mission: escort battery to destination (200m away) without losing it. Enemy drone aircraft try to destroy battery (visible in sky). Battery is vulnerable to air attack. Tank must avoid aerial attacks. HUD shows: Battery Integrity (health %), Destination Distance, Incoming Threats. As tank moves toward destination, enemy drones approach (on radar and visible in sky). Drones fire at battery (visual laser fire from sky). Battery loses health when hit. Tank can fire defensive weapons (trying to hit drones).`,
    gameplayDescription: `Escort battery to destination without being destroyed. Objective: keep battery alive while reaching destination. Challenge: drones attack from above while tank moves. Tank slow movement makes protecting battery difficult. Controls: arrow keys for movement, weapons fire for defense. Time limit: 180 seconds. Success: reach destination with battery intact.`,
    mechanics: {
      primary: `Escort mechanic`,
      secondary: `aerial threat system, defense against air attack, battery health tracking`,
      teaches: `Protection mechanics, multitasking (movement + defense), prioritization.`,
    },
    quickInfo: {
      timeEstimate: "5-12 minutes",
      stars: {
        one: `reach destination + battery alive`,
        two: `75%+ battery health`,
        three: `100% battery health + sub-150sec`,
      },
    },
  },
  "tank_concrete_bunker_breaker": {
    modeName: "Concrete Bunker Breaker",
    visualDescription: `Landscape with series of concrete bunkers (fortified enemy positions). Tank must approach each bunker and breach it. Bunkers have reinforced concrete walls, gun emplacements visible. Tank uses heavy weapons to destroy bunker defenses. Visual: explosions gradually destroying bunker (wall cracks, debris falls). Multiple bunkers in sequence (5 total). Terrain: open ground between bunkers. Each bunker increasingly fortified. Final bunker heavily armored. Destruction effects impressive and satisfying.`,
    gameplayDescription: `Destroy all 5 bunkers using tank firepower. Objective: reduce each bunker to rubble. Challenge: bunkers return fire (turrets engage tank). Tank must take fire while approaching and engaging. Health management: tank health decreases from taking fire. Weapon heat: continuous fire heats weapons, must cool between salvos. Controls: arrow keys for movement/positioning, weapons fire keys. Time limit: 300 seconds. Success: destroy all 5 bunkers.`,
    mechanics: {
      primary: `Destructible bunker system`,
      secondary: `fortification destruction, weapon heat management, defensive fire from bunkers`,
      teaches: `Tactical approach to fortified positions, resource management (weapon heat), positioning for advantage.`,
    },
    quickInfo: {
      timeEstimate: "8-15 minutes",
      stars: {
        one: `destroy all`,
        two: `destroy all + sub-250sec`,
        three: `minimal damage + destroy all + sub-220sec`,
      },
    },
  },
  "tank_thermal_cooling_management": {
    modeName: "Thermal Cooling Management",
    visualDescription: `Desert environment (hot, visible heat shimmer effects). Tank is heavily armored (absorbs heat). Thermal gauge displayed in HUD: GREEN (cool), YELLOW (warm), RED (overheating). Surrounding environment shows extreme heat (visual distortion, heat waves). Tank operation generates internal heat (weapons fire, movement). As tank operates, thermal gauge increases. If gauge enters RED, tank begins taking damage from overheating. Tank must reach cooling stations (large water tanks visible in landscape) to reduce thermal load (automatic when reaching station). Challenge: must reach multiple cooling stations throughout mission while staying under temperature limit. If temperature reaches critical, tank automatically shuts down (mission failed).`,
    gameplayDescription: `Complete 300m course while managing thermal load. Objective: reach finish without overheat shutdown. Challenge: 3 cooling stations spaced 100m apart. Between stations, thermal load increases from normal operation. Must reach each station before overheating. Controls: arrow keys for movement. Time limit: 180 seconds. Success: reach finish with operational status.`,
    mechanics: {
      primary: `Thermal system`,
      secondary: `gauge management, cooling stations trigger, overheat shutdown, heat generation from operations`,
      teaches: `Resource management, threshold management, finding services/stations under pressure.`,
    },
    quickInfo: {
      timeEstimate: "5-12 minutes",
      stars: {
        one: `reach finish`,
        two: `reach finish + sub-150sec`,
        three: `reach finish + minimal cooling station stops + sub-120sec + never entered RED zone`,
      },
    },
  },
  "tank_8_tank_battle_royale": {
    modeName: "8-Tank Battle Royale",
    visualDescription: `Large battlefield (400m diameter arena). 8 tanks total: player (blue) + 7 enemies (red). All visible on battlefield with camera zoomed to show multiple tanks. Tanks spawn at different positions around arena. Minimap shows all tank positions (blue for player, red for enemies). Battle is chaotic: multiple tanks engaging simultaneously. Explosions across battlefield. Smoke and dust from impacts. Intensity increases as tanks are eliminated (survivors engage each other). Final tank standing wins. Dramatic lighting, epic music.`,
    gameplayDescription: `Survive battle royale with 7 enemy tanks. Objective: be last tank standing (eliminate all enemies or be last survivor). Challenge: 7 simultaneous threats, constant incoming fire, complex navigation. Strategic: must choose engagement priorities. Controls: arrow keys for movement, weapons keys for attack. Time limit: 600 seconds (10 minutes maximum). Success: survive battle (last tank remaining).`,
    mechanics: {
      primary: `Battle royale system`,
      secondary: `multiple enemy AI, simultaneous combat, elimination tracking, victory detection`,
      teaches: `Complex combat tactics, threat prioritization, survival under extreme pressure.`,
    },
    quickInfo: {
      timeEstimate: "10-30 minutes",
      stars: {
        one: `survive`,
        two: `survive + eliminate 5+ enemies yourself`,
        three: `eliminate 6+/7 enemies + sub-300sec + minimal damage`,
      },
    },
  },
};
