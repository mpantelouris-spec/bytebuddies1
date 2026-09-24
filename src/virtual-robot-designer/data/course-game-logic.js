/**
 * course-game-logic.js — Per-course game rules, hints, and robot-primary catalogs
 * Ensures each robot gets missions that require real logic (not straight-line only).
 */
import { getCampaignKeyForRobotType } from './robot-mission-campaign.js';
import { THEMED_COURSE_OBJECTIVES } from './course-objectives-pack.js';
import { buildChassisModeGameLogic } from './chassis-game-logic.js';
import { isRaceCourse } from './racing-starter-script.js';
import { getMKTrack } from '../racing/mk-tracks/MKTrackRegistry.js';

/** Recommended course keywords per robot type (used for filtering + level select) */
export const ROBOT_REC_KEYS = {
  rover:      ['rover', 'scout', 'crawler', 'race', 'delivery', 'humanoid'],
  tank:       ['tank', 'mining', 'bulldozer', 'heavy', 'firebot'],
  drone:      ['drone', 'aerial', 'rescue', 'hover'],
  racedrone:  ['racedrone', 'race', 'aerial', 'drone'],
  jet:        ['jet', 'aerial', 'stunt', 'race'],
  hover:      ['hover', 'race', 'aerial', 'drone'],
  spider:     ['spider', 'climbing', 'walker', 'humanoid'],
  humanoid:   ['humanoid', 'walker', 'temple', 'spider'],
  factory:    ['factory', 'arm', 'assembly', 'crane'],
  factorybot: ['factorybot', 'factory', 'assembly', 'crane'],
  underwater: ['underwater', 'submarine', 'ocean'],
  medbot:     ['medbot', 'hospital', 'rescue'],
  firebot:    ['firebot', 'fire', 'rescue', 'tank'],
  security:   ['security', 'stealth', 'patrol'],
  birdbot:    ['birdbot'],
  striker:    ['striker', 'fighter', 'combat'],
  footballbot: ['footballbot', 'football', 'striker'],
  blaster:    ['blaster', 'fighter', 'combat'],
  ninja:      ['ninja', 'fighter', 'combat'],
  berserker:  ['berserker', 'fighter', 'combat'],
  miningbot:  ['miningbot', 'mining', 'tank', 'bulldozer', 'heavy'],
};

/** Primary course order per robot type (best game-design fit first) — each robot gets 10 featured modes */
export const ROBOT_PRIMARY_COURSES = {
  rover:      ['street_grand_prix', 'sunny_circuit', 'dragon_skyway', 'volcano_drift', 'fox_battery_chase', 'rover_delivery', 'rover_transit', 'rover_survey', 'power_garden', 'cargo'],
  spider:     ['spider_rescue', 'spider_pipeline', 'spider_ruins', 'crystal_caverns', 'jump_world', 'crystal_logic_dungeon', 'maze', 'deep_cave', 'pipeline_crawl', 'collapsed_building'],
  drone:      ['sky_rescue_wings', 'drone_canyon', 'drone_rooftop', 'coastal_rescue', 'sky_island', 'drone_survey', 'canyon_flight_course', 'storm_cloud_chase', 'drone_racing_league', 'warp_gate_champ'],
  jet:        ['jet_stunt', 'jet_supersonic', 'jet_circuit', 'volcanic_flythrough', 'storm_cloud_chase', 'warp_gate_champ', 'sky_racers', 'canyon_flight_course', 'cloud_race', 'typhoon_escape'],
  hover:      ['sky_racers', 'neon_race', 'drift_king', 'rooftop_delivery', 'neon_chase', 'turbo_league', 'drone_racing_league', 'storm_cloud_chase', 'warp_gate_champ', 'city_skyline_race'],
  racedrone:  ['drone_racing_league', 'sky_racers', 'neon_race', 'storm_cloud_chase', 'cloud_race', 'warp_gate_champ', 'volcanic_flythrough', 'desert_air_race', 'typhoon_escape', 'city_skyline_race'],
  tank:       ['fight_training', 'fight_sparring', 'fight_championship', 'fight_tournament', 'fight_boss', 'tank_demolition', 'tank_siege', 'tank_mountain', 'volcano_run', 'underground_mine'],
  humanoid:   ['jump_world', 'human_stairwell', 'human_assembly', 'idol_heist', 'pressure_path', 'temple_run', 'guardian_fight', 'urban_obstacle', 'hospital_emergency', 'shadow_escape'],
  factory:    ['arm_sort', 'arm_surgery', 'auto_factory', 'master_manipulator_l1', 'factory_rush', 'quality_gate', 'crane_challenge', 'factory_floor_walk', 'factory_paint_line', 'factory_supply_run'],
  factorybot: ['auto_factory', 'factory_rush', 'quality_gate', 'crane_challenge', 'arm_sort', 'factory_floor_walk', 'arm_surgery', 'master_manipulator_l1', 'factory_paint_line', 'factory_supply_run'],
  underwater: ['reef_guardian', 'robot_reef', 'coral_reef', 'coral_reef_survey', 'deep_trench', 'deep_trench_course', 'kelp_forest', 'seafloor_scan', 'ocean_race', 'shipwreck_explore'],
  medbot:     ['medbay_emergency', 'triage_run', 'hospital_nav', 'med_delivery', 'hospital_emergency', 'snow_rescue', 'emergency_rescue', 'med_evac_drill', 'power_garden', 'city_delivery'],
  firebot:    ['blaze_protocol', 'blaze_run', 'rescue_extract', 'fire_maze', 'volcano_run', 'warzone', 'lava_canyon', 'emergency_rescue', 'fire_checkpoint_drill', 'snow_rescue'],
  security:   ['shadow_escape', 'museum_heist', 'smart_patrol', 'stealth', 'cyber_city', 'robo_defense', 'night_patrol', 'military_infiltration', 'security_perimeter', 'security_vault'],
  birdbot:    ['flappy_bird', 'robo_wrecker', 'birdbot_pipes', 'birdbot_rings', 'birdbot_storm', 'birdbot_night', 'birdbot_canyon', 'birdbot_reef', 'birdbot_volcano', 'birdbot_forest'],
  striker:    ['fight_training', 'fight_sparring', 'fight_championship', 'fight_tournament', 'fight_boss', 'fight_survival', 'fight_strategies', 'fight_speed_rumble', 'fight_iron_wall', 'fight_final_gauntlet'],
  footballbot: ['football_fifa', 'football_cup_final', 'football_championship', 'football_skills', 'football_training', 'football_penalties', 'football_free_kick', 'football_arcade', 'football_street', 'football_keeper'],
  blaster:    ['fight_training', 'fight_strategies', 'fight_sparring', 'fight_speed_rumble', 'fight_tournament', 'fight_boss', 'fight_survival', 'fight_championship', 'fight_iron_wall', 'fight_final_gauntlet'],
  ninja:      ['fight_training', 'fight_speed_rumble', 'fight_sparring', 'fight_survival', 'fight_strategies', 'fight_tournament', 'fight_championship', 'fight_boss', 'fight_iron_wall', 'fight_final_gauntlet'],
  berserker:  ['fight_training', 'fight_boss', 'fight_iron_wall', 'fight_tournament', 'fight_survival', 'fight_sparring', 'fight_final_gauntlet', 'fight_championship', 'fight_strategies', 'fight_speed_rumble'],
  miningbot:  ['mining_quarry_run', 'mining_ore_haul', 'mining_tunnel_dig', 'mining_crystal_vein', 'mining_rubble_clear', 'mining_deep_shaft', 'mining_cart_dash', 'mining_blast_zone', 'mining_gem_rush', 'mining_night_shift'],
};

/** Game logic metadata keyed by course id */
export const COURSE_GAME_LOGIC = {
  fox_battery_chase: {
    gameType: 'adventure',
    winCondition: 'Drive the S-curve path — TURN around obstacles (cars cannot jump!)',
    codeHint: 'Log on the right? → TURN LEFT → MOVE. Follow the blue arrows on the ground!',
    requiredMechanics: ['turn', 'move', 'if_then', 'repeat'],
    minBlocks: 4,
    objectives: ['Turn around lane obstacles', 'Follow the green path', 'Reach the Power Shrine'],
  },
  street_grand_prix: {
    gameType: 'racing',
    winCondition: 'Complete 3 laps on Rainbow Road — pass all 8 checkpoint gates each lap without falling into space!',
    codeHint: 'WHEN START → SET SPEED 70% → REPEAT 3 laps. Slow before hairpins — one wrong turn and you fall off the rainbow!',
    requiredMechanics: ['set_speed', 'turn', 'repeat', 'move', 'boost'],
    minBlocks: 6,
    objectives: [
      'Complete lap 1 through all 8 checkpoints',
      'Complete lap 2 through all 8 checkpoints',
      'Complete lap 3 and cross the checkered finish line',
      'Bonus: beat 90 seconds total time',
    ],
  },
  sunny_circuit: {
    gameType: 'racing',
    winCondition: 'Complete 1 lap through Candy Kingdom — pass all 4 checkpoint gates and collect stars!',
    codeHint: 'WHEN START → MOVE FORWARD → TURN at each corner. Grab every coin and star!',
    requiredMechanics: ['move', 'turn', 'repeat'],
    minBlocks: 4,
    objectives: ['Pass all 4 checkpoint gates', 'Collect bonus stars', 'Cross the sugar rush finish line', 'Bonus: beat 45 seconds'],
  },
  flappy_bird: {
    gameType: 'action',
    winCondition: 'Flap through pipe gaps and beat your high score!',
    codeHint: 'Add "When spacebar clicked" then "Flap!" underneath — press Simulate, then hit SPACE to fly!',
    requiredMechanics: ['flap', 'spacebar'],
    minBlocks: 2,
    objectives: ['Press SPACE to flap and fly', 'Pass 5 pipe gaps', 'Beat your high score'],
  },
  fight_training: {
    gameType: 'combat',
    winCondition: 'Land 5 attacks on the training dummy',
    codeHint: 'When START → Light Punch (repeat). Add Block for later courses!',
    requiredMechanics: ['light_punch', 'block', 'when_start'],
    minBlocks: 2,
    objectives: ['Land 5 hits on the dummy', 'Learn attack blocks', 'Try Block in Sparring next'],
  },
  fight_sparring: {
    gameType: 'combat',
    winCondition: 'Defeat the AI fighter before time runs out',
    codeHint: 'If enemy close → attack. If under attack → dodge or block!',
    requiredMechanics: ['attack', 'block', 'dodge', 'if_enemy_close'],
    minBlocks: 4,
    objectives: ['Reduce enemy HP to 0', 'Use defense blocks', 'Win within 3 minutes'],
  },
  football_training: {
    gameType: 'football',
    winCondition: 'Score 3 goals using Football blocks',
    codeHint: 'Try: When START → Forever → Chase ball → If ball close then Shoot!',
    requiredMechanics: ['chase_ball', 'shoot', 'if_ball_close'],
    minBlocks: 3,
    objectives: ['Chase the ball', 'Score 3 goals', 'Complete under time limit'],
  },
  football_fifa: {
    gameType: 'football',
    winCondition: 'Win the 3v3 match — first to 3 goals beats the blue team',
    codeHint: 'When START → Forever → Chase ball → If in shooting range then Shoot! Teammates pass and support.',
    requiredMechanics: ['chase_ball', 'shoot', 'pass', 'if_ball_close'],
    minBlocks: 4,
    objectives: ['Score 3 goals with your team', 'Beat the AI blue team', 'Use passes and shots'],
  },
  football_skills: {
    gameType: 'football',
    winCondition: 'Beat the AI opponent — first to 3 goals wins',
    objectives: ['Score 3 goals', 'Use passes and shots', 'Win the 1v1 match'],
  },
  football_championship: {
    gameType: 'football',
    winCondition: 'Win the championship — score 5 goals',
    objectives: ['Score 5 goals', 'Beat hard AI', 'Win the match'],
  },
  football_penalties: {
    gameType: 'football',
    winCondition: 'Score 5 penalty goals past the AI keeper',
    objectives: ['Score 5 penalties', 'Aim and power up each shot', 'Beat the keeper'],
  },
  football_free_kick: {
    gameType: 'football',
    winCondition: 'Score 3 free kick goals over the wall',
    objectives: ['Score 3 free kicks', 'Curve shots into the corner', 'Beat the wall'],
  },
  football_arcade: {
    gameType: 'football',
    winCondition: 'Score first goal in 60 seconds',
    objectives: ['Score first', 'Beat the clock', 'Win the arcade match'],
  },
  football_street: {
    gameType: 'football',
    winCondition: 'Score 2 goals in the street match',
    objectives: ['Score 2 goals', 'Beat street AI', 'Use dribble and shoot'],
  },
  football_cup_final: {
    gameType: 'football',
    winCondition: 'Win the World Cup final — 5 goals in 3v3',
    objectives: ['Score 5 goals with your team', 'Beat elite AI', 'Win the cup'],
  },
  football_keeper: {
    gameType: 'football',
    winCondition: 'Block 5 shots — keep a clean sheet',
    objectives: ['Make 5 saves', 'Concede zero goals', 'Use goalkeeper blocks'],
  },
  fight_speed_rumble: {
    gameType: 'combat',
    winCondition: 'Defeat the speedy opponent in 90 seconds',
    objectives: ['Land fast combos', 'Beat the ninja opponent', 'Win before time runs out'],
  },
  fight_iron_wall: {
    gameType: 'combat',
    winCondition: 'Break through the tank brawler\'s guard',
    objectives: ['Block heavy attacks', 'Counter with power hits', 'Defeat the tank'],
  },
  fight_final_gauntlet: {
    gameType: 'combat',
    winCondition: 'Win all 4 gauntlet rounds',
    objectives: ['Beat ninja round', 'Beat blaster round', 'Beat berserker and boss'],
  },
  dragon_skyway: {
    gameType: 'racing',
    winCondition: 'Complete 2 laps through the floating fantasy kingdom — pass all 6 checkpoint gates!',
    codeHint: 'WHEN START → SET SPEED 60% → navigate past dragons and waterfalls. Watch the sky!',
    requiredMechanics: ['move', 'turn', 'set_speed', 'repeat'],
    minBlocks: 5,
    objectives: ['Complete lap 1 through all 6 gates', 'Complete lap 2', 'Collect sky stars', 'Bonus: beat 75 seconds'],
  },
  volcano_drift: {
    gameType: 'racing',
    winCondition: 'Complete 2 laps around the crater — pass all 6 checkpoint gates each lap, don\'t fall in the lava!',
    codeHint: 'WHEN START → SET SPEED 65% → navigate past lava pools and obsidian spires!',
    requiredMechanics: ['move', 'turn', 'set_speed', 'repeat'],
    minBlocks: 5,
    objectives: ['Complete lap 1 through all 6 gates', 'Complete lap 2', 'Collect bonus stars', 'Bonus: beat 60 seconds'],
  },
  sky_racers: {
    gameType: 'racing',
    winCondition: 'Complete laps — hit checkpoints, use boosts, beat lap timer',
    codeHint: 'SET SPEED low before turns, high on straights. Use REPEAT for lap count.',
    requiredMechanics: ['set_speed', 'turn', 'repeat', 'variables'],
    minBlocks: 6,
    objectives: ['Hit every checkpoint gate', 'Use boost pads on straights', 'Track laps with a variable'],
  },
  crystal_logic_dungeon: {
    gameType: 'puzzle',
    winCondition: 'Activate switches in order — IF/ELSE opens correct doors',
    codeHint: 'IF on switch color → move through matching door. Track state with a variable.',
    requiredMechanics: ['if_then', 'if_else', 'variables', 'wait'],
    minBlocks: 5,
    objectives: ['Step on crystal switches', 'Match colors to doors', 'Solve the sequence puzzle'],
  },
  robo_defense: {
    gameType: 'defense',
    winCondition: 'Patrol + scan + respond to enemy waves',
    codeHint: 'REPEAT: patrol → IF enemy detected → turn toward threat → move.',
    requiredMechanics: ['repeat', 'if_then', 'scan', 'patrol'],
    minBlocks: 6,
    objectives: ['Detect incoming waves', 'Respond with patrol logic', 'Survive all waves'],
  },
  jump_world: {
    gameType: 'platformer',
    winCondition: 'Jump gaps, hit jump pads, reach flagpole',
    codeHint: 'MOVE → WAIT at gap → JUMP → repeat. Slow before each platform.',
    requiredMechanics: ['jump', 'wait', 'move', 'if_then'],
    minBlocks: 5,
    objectives: ['Cross gaps with JUMP', 'Time jump pads correctly', 'Reach the top flag'],
  },
  shadow_escape: {
    gameType: 'stealth',
    winCondition: 'Reach exit with zero detections',
    codeHint: 'SET SPEED 30% → WAIT for patrol gap → sprint → STOP if sensor triggers.',
    requiredMechanics: ['set_speed', 'wait', 'stop', 'if_then'],
    minBlocks: 6,
    objectives: ['Avoid detection beams', 'Wait for patrol cycles', 'Reach exit undetected'],
  },
  auto_factory: {
    gameType: 'simulation',
    winCondition: 'Sort all belt items to correct bins before timer',
    codeHint: 'REPEAT: move to item → IF color red → turn to red bin → deliver.',
    requiredMechanics: ['repeat', 'if_then', 'if_color', 'move'],
    minBlocks: 6,
    objectives: ['Sort by color', 'Keep up with conveyor', 'Zero mis-sorts'],
  },
  emergency_rescue: {
    gameType: 'rescue',
    winCondition: 'Rescue all survivors + deliver supplies — avoid hazard zones',
    codeHint: 'Navigate to blue markers first, then green supply caches. IF hazard → TURN away.',
    requiredMechanics: ['if_then', 'scan', 'navigate', 'repeat'],
    minBlocks: 7,
    objectives: ['Locate survivors', 'Deliver supply crates', 'Avoid red hazard zones'],
  },
  rover_transit: {
    gameType: 'line_follow',
    winCondition: 'Stay on cyan track through curves — minimize deviation',
    codeHint: 'IF off line → TURN toward line. SET SPEED 70% on curves, 100% on straights.',
    requiredMechanics: ['line_below', 'if_then', 'turn', 'set_speed'],
    minBlocks: 5,
    objectives: ['Follow the neon track', 'Handle S-curves without leaving line', 'Beat station timer'],
  },
  rover_delivery: {
    gameType: 'delivery',
    winCondition: 'Hit all drop zones in order — obey traffic signals',
    codeHint: 'At each intersection: IF red → WAIT 2s → IF green → TURN toward drop zone → MOVE.',
    requiredMechanics: ['if_then', 'wait', 'turn', 'repeat'],
    minBlocks: 6,
    objectives: ['Deliver to 4 drop zones in order', 'Stop at red lights', 'Zero missed deliveries'],
  },
  rover_survey: {
    gameType: 'precision',
    winCondition: 'Hold position at each survey marker for a scan',
    codeHint: 'MOVE to marker → STOP → WAIT 2s (scan) → repeat for next marker.',
    requiredMechanics: ['move', 'stop', 'wait', 'repeat'],
    minBlocks: 5,
    objectives: ['Reach every survey marker', 'Hold still during scan', 'Complete the grid'],
  },
  spider_pipeline: {
    gameType: 'inspection',
    winCondition: 'Tag every fault marker on pipe walls',
    codeHint: 'IF distance < 30cm on left → TURN left → SCAN → repeat along pipe.',
    requiredMechanics: ['if_distance', 'turn', 'scan', 'repeat'],
    minBlocks: 5,
    objectives: ['Tag all fault markers', 'Navigate tight pipe bends', 'Zero missed tags'],
  },
  spider_ruins: {
    gameType: 'climb',
    winCondition: 'Climb rubble stacks to reach beacon',
    codeHint: 'CLIMB obstacle → STEP forward → IF blocked → TURN → find path up.',
    requiredMechanics: ['climb', 'step_forward', 'if_then', 'turn'],
    minBlocks: 6,
    objectives: ['Scale collapsed rubble', 'Find climbable paths', 'Reach signal beacon'],
  },
  spider_rescue: {
    gameType: 'rescue',
    winCondition: 'Locate survivors on 3 floors',
    codeHint: 'Search each floor: REPEAT scan → IF survivor found → navigate to exit stairs.',
    requiredMechanics: ['scan', 'if_then', 'repeat', 'climb'],
    minBlocks: 7,
    objectives: ['Search all floors', 'Locate 3 survivors', 'Guide to safe zone'],
  },
  drone_canyon: {
    gameType: 'flight',
    winCondition: 'Thread canyon without wall collisions',
    codeHint: 'IF obstacle left → BANK RIGHT. IF obstacle right → BANK LEFT. FLY UP over rocks.',
    requiredMechanics: ['obstacle_ahead', 'if_then', 'bank_left', 'bank_right', 'fly_up'],
    minBlocks: 6,
    objectives: ['Avoid canyon walls', 'Thread narrow passages', 'Reach canyon exit'],
  },
  drone_rooftop: {
    gameType: 'delivery',
    winCondition: 'Drop packages on exact rooftop pads',
    codeHint: 'FLY to pad → HOVER → descend → deliver → FLY UP to next building.',
    requiredMechanics: ['fly_up', 'fly_down', 'hover_hold', 'repeat'],
    minBlocks: 6,
    objectives: ['Hit all rooftop pads', 'Hover for precision drop', 'Avoid building edges'],
  },
  drone_survey: {
    gameType: 'survey',
    winCondition: 'Photograph all ground markers before sunset',
    codeHint: 'Patrol grid: FLY to marker → HOVER 1s → TURN 90° → next row.',
    requiredMechanics: ['patrol_area', 'hover_hold', 'turn', 'repeat'],
    minBlocks: 5,
    objectives: ['Photograph all markers', 'Complete grid pattern', 'Beat sunset timer'],
  },
  tank_demolition: {
    gameType: 'demolition',
    winCondition: 'Push all debris into dump zones',
    codeHint: 'IF debris ahead → MOVE forward (push) → IF at dump zone → TURN to next pile.',
    requiredMechanics: ['move', 'if_then', 'turn', 'repeat'],
    minBlocks: 5,
    objectives: ['Push debris to dump zones', 'Clear all 6 piles', 'Use full tank power'],
  },
  tank_mountain: {
    gameType: 'terrain',
    winCondition: 'Climb switchback trail to summit relay',
    codeHint: 'On steep grade: SET SPEED 40% → MOVE → IF stuck → TURN at switchback.',
    requiredMechanics: ['set_speed', 'if_then', 'turn', 'move'],
    minBlocks: 6,
    objectives: ['Navigate switchbacks', 'Maintain traction on slopes', 'Reach summit relay'],
  },
  tank_siege: {
    gameType: 'combat',
    winCondition: 'Disable all defense turrets and breach wall',
    codeHint: 'IF turret detected → STOP → aim → MOVE to cover → repeat for each turret.',
    requiredMechanics: ['if_then', 'stop', 'scan', 'repeat'],
    minBlocks: 7,
    objectives: ['Disable 4 turrets', 'Use cover between advances', 'Breach inner wall'],
  },
  human_assembly: {
    gameType: 'manipulation',
    winCondition: 'Assemble 4 parts on conveyor in order',
    codeHint: 'Pick → IF part type A → place slot A → IF type B → place slot B.',
    requiredMechanics: ['if_then', 'if_else', 'wait', 'repeat'],
    minBlocks: 6,
    objectives: ['Pick each part', 'Sort to correct slot', 'Complete assembly line'],
  },
  human_stairwell: {
    gameType: 'climb',
    winCondition: 'Activate control panel on each of 6 floors',
    codeHint: 'STEP up stairs → IF panel found → activate → repeat per floor.',
    requiredMechanics: ['step_forward', 'if_then', 'repeat', 'wait'],
    minBlocks: 6,
    objectives: ['Climb 6 floors', 'Activate every panel', 'Beat emergency timer'],
  },
  arm_sort: {
    gameType: 'sorting',
    winCondition: 'Sort every belt item to correct destination bin',
    codeHint: 'IF color red → bin left. IF blue → bin right. REPEAT until belt empty.',
    requiredMechanics: ['if_color', 'if_then', 'if_else', 'repeat'],
    minBlocks: 5,
    objectives: ['Sort by color', 'Match item to bin', 'Zero mis-sorts'],
  },
  arm_surgery: {
    gameType: 'precision',
    winCondition: 'Repair every circuit fault without misses',
    codeHint: 'Move to fault → WAIT (steady) → repair → IF next fault → repeat.',
    requiredMechanics: ['move', 'wait', 'if_then', 'repeat'],
    minBlocks: 5,
    objectives: ['Repair all faults', 'Hold steady during repair', '100% accuracy'],
  },
  coral_reef: {
    gameType: 'exploration',
    winCondition: 'Tag all glowing sea life without touching coral',
    codeHint: 'IF obstacle → DIVE or SURFACE to avoid. SONAR PING to find tags.',
    requiredMechanics: ['sonar_ping', 'if_then', 'dive_deep', 'surface'],
    minBlocks: 6,
    objectives: ['Tag 8 sea creatures', 'Avoid coral collisions', 'Map the reef'],
  },
  deep_trench: {
    gameType: 'exploration',
    winCondition: 'Reach shipwreck at trench bottom',
    codeHint: 'Monitor DEPTH sensor — DIVE gradually. IF pressure high → slow descent.',
    requiredMechanics: ['depth_sensor', 'if_then', 'dive_deep', 'wait'],
    minBlocks: 6,
    objectives: ['Descend safely', 'Manage pressure', 'Find the wreck'],
  },
  jet_stunt: {
    gameType: 'stunt',
    winCondition: 'Fly through all rings and hit score pad',
    codeHint: 'BANK into each ring → ROLL through gate → DIVE under pylon → repeat.',
    requiredMechanics: ['bank_left', 'bank_right', 'roll', 'dive'],
    minBlocks: 7,
    objectives: ['Thread all pylons', 'Hit every ring', 'Land on score pad'],
  },
  jet_supersonic: {
    gameType: 'speed',
    winCondition: 'Pass every speed gate before fuel runs out',
    codeHint: 'Full throttle on straights → DIVE through gates → BRAKE before turns.',
    requiredMechanics: ['set_speed', 'dive', 'boost', 'repeat'],
    minBlocks: 5,
    objectives: ['Hit all speed gates', 'Manage fuel', 'Beat time record'],
  },
  triage_run: {
    gameType: 'medical',
    winCondition: 'Reach and treat all injured units in time',
    codeHint: 'IF injured detected → navigate to unit → WAIT (treat) → next patient.',
    requiredMechanics: ['if_then', 'wait', 'scan', 'repeat'],
    minBlocks: 6,
    objectives: ['Find all patients', 'Deliver first aid', 'Beat triage timer'],
  },
  hospital_nav: {
    gameType: 'delivery',
    winCondition: 'Deliver meds to 6 rooms — avoid patient zones',
    codeHint: 'IF patient zone ahead → TURN → alternate corridor. Deliver → REPEAT.',
    requiredMechanics: ['if_then', 'turn', 'wait', 'repeat'],
    minBlocks: 6,
    objectives: ['Deliver to all rooms', 'Avoid patient areas', 'Zero collisions'],
  },
  blaze_run: {
    gameType: 'firefight',
    winCondition: 'Suppress 3 fire zones before they spread',
    codeHint: 'Navigate to blaze → STOP → suppress → IF fire spread → redirect route.',
    requiredMechanics: ['if_then', 'stop', 'scan', 'repeat'],
    minBlocks: 6,
    objectives: ['Reach all fire zones', 'Suppress each blaze', 'Prevent spread'],
  },
  rescue_extract: {
    gameType: 'rescue',
    winCondition: 'Extract all survivors from burning building',
    codeHint: 'IF fire ahead → alternate route. Locate survivor → guide to exit → REPEAT.',
    requiredMechanics: ['if_then', 'turn', 'scan', 'repeat'],
    minBlocks: 7,
    objectives: ['Breach burning corridors', 'Find survivors', 'Guide to safety'],
  },
  obstacle: {
    gameType: 'navigation',
    winCondition: 'Weave through the forest logs, roots and stone walls to reach the Power Shrine',
    codeHint: 'IF obstacle ahead → TURN → MOVE → repeat. Don\'t just drive straight!',
    requiredMechanics: ['obstacle_ahead', 'if_then', 'turn'],
    minBlocks: 4,
    objectives: ['Avoid all obstacles', 'Reach finish zone', 'Minimize collisions'],
  },
  maze: {
    gameType: 'pathfinding',
    winCondition: 'Map every hedge turn and find the one true path out of the maze',
    codeHint: 'IF wall left → TURN right. IF wall ahead → TURN. Track turns with REPEAT.',
    requiredMechanics: ['obstacle_ahead', 'if_then', 'turn', 'repeat'],
    minBlocks: 5,
    objectives: ['Navigate dead-ends', 'Find the exit', 'Efficient path'],
  },
  checkpoint: {
    gameType: 'sequence',
    winCondition: 'Tag every glowing checkpoint flag in the right order to clear the run',
    codeHint: 'After each checkpoint: TURN toward next glow → MOVE. Use IF to confirm arrival.',
    requiredMechanics: ['turn', 'repeat', 'if_then'],
    minBlocks: 5,
    objectives: ['Hit checkpoints in order', 'No skipped gates', 'Beat timer'],
  },
  cargo: {
    gameType: 'delivery',
    winCondition: 'Collect the scattered supply crates and deliver them to the Power Shrine',
    codeHint: 'Move to crate → collect → navigate to shrine → REPEAT for each crate.',
    requiredMechanics: ['repeat', 'turn', 'if_then'],
    minBlocks: 5,
    objectives: ['Collect all crates', 'Deliver to shrine', 'No drops'],
  },
  stealth: {
    gameType: 'stealth',
    winCondition: 'Slip past every searchlight sweep and reach the goal completely unseen',
    codeHint: 'WAIT for sensor sweep → SET SPEED low → sprint through gap → STOP if detected.',
    requiredMechanics: ['wait', 'set_speed', 'stop', 'if_then'],
    minBlocks: 6,
    objectives: ['Avoid sensor towers', 'Time your dashes', 'Reach shrine unseen'],
  },
  line_follow: {
    gameType: 'line_follow',
    winCondition: 'Stay locked onto the glowing line through every twist of the track',
    codeHint: 'IF off line → TURN toward line. Never just MOVE forward blindly!',
    requiredMechanics: ['line_below', 'if_then', 'turn'],
    minBlocks: 4,
    objectives: ['Stay on line', 'Handle curves', 'Complete loop'],
  },
  precision: {
    gameType: 'precision',
    winCondition: 'Roll to a stop dead-center in every target ring on the floor',
    codeHint: 'Slow approach: SET SPEED 25% → MOVE → STOP when in zone → WAIT.',
    requiredMechanics: ['set_speed', 'stop', 'wait', 'repeat'],
    minBlocks: 5,
    objectives: ['Hit all target zones', 'Center parking bonus', 'Precision over speed'],
  },
  neon_chase: {
    gameType: 'chase',
    winCondition: 'Run down the runaway bot through the neon district before it reaches the exit',
    codeHint: 'SET SPEED max on straights → TURN at intercept points → IF bot ahead → boost.',
    requiredMechanics: ['set_speed', 'turn', 'if_then', 'boost'],
    minBlocks: 6,
    objectives: ['Intercept target bot', 'Cut corners smartly', 'Catch before exit'],
  },
  idol_heist: {
    gameType: 'heist',
    winCondition: 'Grab the golden idol and sprint for the exit before the trap alarms trigger',
    codeHint: 'Navigate traps with WAIT timing → grab idol → SET SPEED max for escape.',
    requiredMechanics: ['wait', 'if_then', 'set_speed', 'turn'],
    minBlocks: 7,
    objectives: ['Avoid trap rhythm', 'Grab the idol', 'Escape in time'],
  },
  museum_heist: {
    gameType: 'stealth',
    winCondition: 'Cross laser grid without triggering alarms',
    codeHint: 'IF laser detected → WAIT for off cycle → MOVE through gap → TURN at corners.',
    requiredMechanics: ['if_then', 'wait', 'turn', 'obstacle_ahead'],
    minBlocks: 6,
    objectives: ['Dodge laser grids', 'Reach vault', 'Zero alarms'],
  },
  city_delivery: {
    gameType: 'delivery',
    winCondition: 'Hit all neon drop zones in the rain-soaked grid',
    codeHint: 'Grid navigation: TURN at each block → deliver → IF red light WAIT.',
    requiredMechanics: ['turn', 'wait', 'repeat', 'if_then'],
    minBlocks: 6,
    objectives: ['All drop zones', 'Navigate city grid', 'Obey signals'],
  },
  line_following_champion_l1: {
    gameType: 'line_follow',
    winCondition: 'Track the cyan line with correction turns',
    codeHint: 'IF line not detected → TURN toward last known direction. Adjust on curves.',
    requiredMechanics: ['line_below', 'if_then', 'turn', 'set_speed'],
    minBlocks: 4,
    objectives: ['Stay centered on track', 'Handle straight tunnel', 'Beat time target'],
  },
  obstacle_navigator_l1: {
    gameType: 'avoidance',
    winCondition: 'Navigate around trees to research station',
    codeHint: 'IF obstacle ahead → TURN left or right → MOVE → repeat. Scan before each segment.',
    requiredMechanics: ['obstacle_ahead', 'if_then', 'turn', 'scan'],
    minBlocks: 5,
    objectives: ['Avoid all trees', 'Reach station', 'Zero collisions'],
  },
  master_manipulator_l1: {
    gameType: 'sorting',
    winCondition: 'Pick cube and place in matching color bin',
    codeHint: 'Move to item → IF color match → carry to bin → release.',
    requiredMechanics: ['if_color', 'if_then', 'move', 'wait'],
    minBlocks: 5,
    objectives: ['Pick correct item', 'Match bin color', 'Successful placement'],
  },
  precision_delivery_l1: {
    gameType: 'delivery',
    winCondition: 'Deliver supply to marked bay within ±5cm',
    codeHint: 'SET SPEED 30% near bay → STOP → fine MOVE → confirm delivery.',
    requiredMechanics: ['set_speed', 'stop', 'move', 'wait'],
    minBlocks: 5,
    objectives: ['Reach delivery bay', 'Precision stop', 'On-time delivery'],
  },
  velocity_champion_l1: {
    gameType: 'racing',
    winCondition: 'Complete the lap with speed control — brake before turns',
    codeHint: 'SET SPEED high on straights, low before corners. TURN smoothly — no straight-line only!',
    requiredMechanics: ['set_speed', 'turn', 'repeat'],
    minBlocks: 5,
    objectives: ['Hit checkpoint gates', 'Brake before hairpins', 'Beat lap timer'],
  },
  emergency_rescue_l1: {
    gameType: 'rescue',
    winCondition: 'Locate survivors and deliver supplies — avoid hazard zones',
    codeHint: 'IF hazard ahead → TURN away. Scan for blue survivor markers first.',
    requiredMechanics: ['if_then', 'scan', 'turn', 'repeat'],
    minBlocks: 6,
    objectives: ['Find all survivors', 'Deliver supply crates', 'Avoid red zones'],
  },
  maze_master_l1: {
    gameType: 'pathfinding',
    winCondition: 'Navigate temple maze dead-ends to reach the idol',
    codeHint: 'IF wall ahead → TURN. IF dead end → backtrack with REPEAT logic.',
    requiredMechanics: ['obstacle_ahead', 'if_then', 'turn', 'repeat'],
    minBlocks: 5,
    objectives: ['Find correct path', 'Avoid trap tiles', 'Reach inner chamber'],
  },
  soccer_striker_l1: {
    gameType: 'sports',
    winCondition: 'Score goals by navigating to ball and aiming at net',
    codeHint: 'Move to ball → IF ball detected → push toward goal → IF defender → TURN.',
    requiredMechanics: ['if_then', 'turn', 'scan', 'repeat'],
    minBlocks: 6,
    objectives: ['Reach the ball', 'Score 3 goals', 'Avoid defenders'],
  },
  medbay_emergency: {
    gameType: 'triage',
    winCondition: 'Rescue patients by priority — red first, then yellow, then green',
    codeHint: 'IF red marker → route there first. STOP at bay → WAIT (vitals scan) → increment counter.',
    requiredMechanics: ['if_then', 'wait', 'move', 'variables'],
    minBlocks: 6,
    objectives: ['Triage by priority color', 'Deliver med kits', 'Rescue all patients in time'],
  },
  blaze_protocol: {
    gameType: 'fire_rescue',
    winCondition: 'Suppress blaze zones then extract survivors before spread timer',
    codeHint: 'POWER MODE → MOVE to blaze → STOP → WAIT (hose) → route to survivor marker.',
    requiredMechanics: ['power_mode', 'wait', 'if_then', 'repeat'],
    minBlocks: 6,
    objectives: ['Suppress all fire zones', 'Extract every survivor', 'Avoid burning debris'],
  },
  reef_guardian: {
    gameType: 'exploration',
    winCondition: 'Restore reef health — sonar tags, fish guidance & pollution cleanup',
    codeHint: 'DIVE along reef → SCAN at markers → IF fish school → guide through color gate.',
    requiredMechanics: ['sonar', 'dive', 'if_then', 'variables'],
    minBlocks: 6,
    objectives: ['Map all sonar markers', 'Guide fish schools home', 'Restore reef crown'],
  },
  sky_rescue_wings: {
    gameType: 'search_rescue',
    winCondition: 'Grid-search coastline, locate beacons, drop life rings',
    codeHint: 'TAKEOFF → AERIAL SCAN → FLY to beacon → HOVER → drop at zone.',
    requiredMechanics: ['takeoff', 'aerial_scan', 'fly', 'repeat'],
    minBlocks: 6,
    objectives: ['Scan distress grid', 'Mark all survivors', 'Drop supplies before storm'],
  },
  robot_reef: {
    gameType: 'exploration',
    winCondition: 'Guide fish schools and restore reef navigation lights',
    codeHint: 'DIVE through coral → SCAN pollution pods → WAIT to clean each sensor.',
    requiredMechanics: ['dive', 'scan', 'wait', 'repeat'],
    minBlocks: 5,
    objectives: ['Clean pollution sensors', 'Guide fish through gates', 'Restore reef lights'],
  },
  power_garden: {
    gameType: 'adventure',
    winCondition: 'Recharge energy crystals and repair sprinklers across the garden',
    codeHint: 'MOVE to sunflower → IF sensor triggered → WAIT at crystal → repeat for each zone.',
    requiredMechanics: ['move', 'if_then', 'wait', 'repeat'],
    minBlocks: 5,
    objectives: ['Repair broken sprinklers', 'Recharge all crystals', 'Restore garden power'],
  },
  crystal_caverns: {
    gameType: 'exploration',
    winCondition: 'Recharge dimming crystal clusters before the underground city goes dark',
    codeHint: 'Navigate glowing tunnels → collect energy orbs → WAIT at each crystal cluster.',
    requiredMechanics: ['move', 'if_then', 'wait', 'repeat'],
    minBlocks: 5,
    objectives: ['Reach the Gemstone Throne', 'Recharge every crystal cluster', 'Complete all 10 cavern zones'],
  },
  sky_island: {
    gameType: 'delivery',
    winCondition: 'Repair bridges, restart windmills, and deliver cargo before sunset',
    codeHint: 'FLY to each island → HOVER at drop pad → deliver → REPEAT until all packages sent.',
    requiredMechanics: ['fly_up', 'hover_hold', 'repeat', 'if_then'],
    minBlocks: 6,
    objectives: ['Repair broken rope bridges', 'Restart all island windmills', 'Deliver every supply crate before sunset'],
  },
  fire_maze: {
    gameType: 'rescue',
    winCondition: 'Navigate smoke-filled floors and reach the rooftop helipad',
    codeHint: 'IF fire ahead → alternate route → STEP up stairs → repeat per floor.',
    requiredMechanics: ['if_then', 'step_forward', 'turn', 'repeat'],
    minBlocks: 6,
    objectives: ['Navigate every floor', 'Avoid fire and falling debris', 'Reach the rooftop exit'],
  },
  med_delivery: {
    gameType: 'delivery',
    winCondition: 'Deliver all 6 prescriptions to the correct patient rooms',
    codeHint: 'Match prescription colour to room → deliver → IF corridor blocked TURN.',
    requiredMechanics: ['if_then', 'turn', 'wait', 'repeat'],
    minBlocks: 5,
    objectives: ['Collect all 6 prescriptions', 'Deliver to correct rooms', 'Zero staff collisions'],
  },
  neon_race: {
    gameType: 'racing',
    winCondition: 'Race from the starting grid through every circuit zone to the grandstand finish line',
    codeHint: 'SET SPEED high on straights — slow for the tunnel chicane. Hit boost pads in Zone 2!',
    requiredMechanics: ['set_speed', 'turn', 'boost', 'repeat'],
    minBlocks: 5,
    objectives: ['Clear every circuit zone and cross the finish line', 'Hit all boost pads in the tunnel chicane', 'Beat the 4-minute race timer'],
  },
  neon_chase: {
    gameType: 'racing',
    winCondition: 'Chase the runaway cargo bot through the neon city and intercept it before the exit gate',
    codeHint: 'SET SPEED max on straights — cut inside the drift hairpin to close the gap!',
    requiredMechanics: ['set_speed', 'turn', 'boost'],
    minBlocks: 5,
    objectives: ['Catch the runaway bot before the exit gate', 'Stay on the chase route — no shortcuts', 'Complete the pursuit under 4 minutes'],
  },
  drift_king: {
    gameType: 'racing',
    winCondition: 'Master drift lines through every corner — style points multiply your score',
    codeHint: 'Enter turns wide, hit the apex, exit with throttle — REPEAT for each hairpin!',
    requiredMechanics: ['set_speed', 'turn', 'curve_left', 'curve_right'],
    minBlocks: 6,
    objectives: ['Complete the full drift circuit', 'Score 10+ perfect drift entries', 'Cross the finish with top style rating'],
  },
  turbo_league: {
    gameType: 'racing',
    winCondition: 'First bot across the finish wins — use boost pads and scanner lanes to your advantage',
    codeHint: 'Boost corridor in Zone 7 gives the biggest speed gain — save battery for the final sprint!',
    requiredMechanics: ['set_speed', 'boost', 'turn', 'repeat'],
    minBlocks: 5,
    objectives: ['Cross the finish line first', 'Activate 3+ boost pads on the circuit', 'Complete the league race under 3 minutes'],
  },
  run_medium: {
    gameType: 'racing',
    winCondition: 'Choose the fastest of three routes through the neon circuit and beat the world record',
    codeHint: 'Middle route looks longer but has fewer turns — time each split with a variable!',
    requiredMechanics: ['set_speed', 'turn', 'variables', 'if_then'],
    minBlocks: 6,
    objectives: ['Complete the circuit under 3 minutes', 'Test all 3 route options', 'Beat the checkpoint world record'],
  },
  ...THEMED_COURSE_OBJECTIVES,
};

export function exclusiveKeyForRobot(robotType) {
  if (robotType === 'factory') return 'arm';
  if (['medbot', 'firebot', 'security', 'birdbot', 'jet', 'underwater'].includes(robotType)) return robotType;
  return robotType;
}

/** Resolve logic for flat course id or flagship level id (falls back to program L1) */
export function getGameLogicForCourse(courseId) {
  if (!courseId) return null;
  if (COURSE_GAME_LOGIC[courseId]) return COURSE_GAME_LOGIC[courseId];
  const m = courseId.match(/^(.+)_l\d+$/);
  if (m && COURSE_GAME_LOGIC[`${m[1]}_l1`]) return COURSE_GAME_LOGIC[`${m[1]}_l1`];
  return null;
}

/** Racing lap objectives for MK-linked chassis modes (overrides stale parking/cargo text). */
function getMkRacingObjectives(course) {
  if (!course || course.genre !== 'racing') return null;
  if (!course.raceTrackLabel && !course.mkTier) return null;
  const laps = course.laps ?? 2;
  const target = course.targetTime ?? (course.timeLimit ? course.timeLimit - 120 : 180);
  return [
    `Complete ${laps} lap(s)`,
    'Pass all checkpoints',
    `Finish under ${target}s`,
  ];
}

export function enrichCourseWithGameLogic(course) {
  if (!course) return course;
  const logic = getGameLogicForCourse(course.id) || buildChassisModeGameLogic(course);
  if (!logic) return course;
  const mkObjectives = getMkRacingObjectives(course);
  const fromMkCourse = course.objectives?.length && typeof course.objectives[0] === 'object'
    ? course.objectives.map((o) => o.label).filter(Boolean)
    : null;
  const racingObjectives = mkObjectives || (course.gameObjectives?.length ? course.gameObjectives : fromMkCourse);
  const keepRacingObjectives = Boolean(racingObjectives?.length && (mkObjectives || course.raceTrackLabel || course.mkTier));
  return {
    ...course,
    gameType: logic.gameType,
    winCondition: keepRacingObjectives
      ? racingObjectives[0]
      : logic.winCondition,
    codeHint: logic.codeHint || course.codeHint,
    requiredMechanics: logic.requiredMechanics,
    minBlocks: logic.minBlocks,
    gameObjectives: keepRacingObjectives ? racingObjectives : logic.objectives,
    starRequirements: logic.starRequirements || course.starRequirements,
    difficulty: logic.difficulty || course.difficulty,
    modeType: logic.modeType || course.modeType,
    estMinutes: logic.estMinutes || course.estMinutes,
    programmingConcepts: logic.programmingConcepts || course.programmingConcepts,
    rewardBadge: logic.rewardBadge || course.rewardBadge,
    isChassisMode: course.mkTier
      ? false
      : (course.isChassisMode ?? Boolean(buildChassisModeGameLogic(course))),
  };
}

/** Resolve display objectives for any course (catalog, campaign, game mission). */
export function resolveCourseObjectives(course, storyOverlay = {}) {
  if (!course) return [];
  if (course.isRobotMission && course.primaryObjective?.text) {
    return [
      course.primaryObjective.text,
      ...(course.subObjectives || []).map((s) => s.text),
    ].filter(Boolean);
  }
  if (course.gameObjectives?.length) return course.gameObjectives;
  const logic = getGameLogicForCourse(course.id) || buildChassisModeGameLogic(course);
  if (logic?.objectives?.length) return logic.objectives;
  if (course.starRequirements) {
    return [
      course.winCondition || course.desc,
      course.starRequirements.two,
      course.starRequirements.three,
    ].filter(Boolean);
  }
  if (storyOverlay.objectives?.length) return storyOverlay.objectives;
  if (course.desc) {
    return [
      course.winCondition || `Complete the mission: ${course.name}`,
      'Reach the goal zone',
      'Bonus: beat the time target',
    ];
  }
  return [];
}

/** Total zone count for progress tracking */
export function getCourseZoneCount(challenge) {
  if (!challenge) return 5;
  const racingArena = challenge?.arenaType || getMKTrack(challenge?.linkedRaceCourse)?.arenaType;
  if (racingArena !== 'sandbox' && racingArena !== 'flight_rings' && (challenge?.genre === 'racing' || challenge?.cat === 'racing' || isRaceCourse(challenge?.id, racingArena))) {
    const mkTrack = getMKTrack(racingArena || challenge?.linkedRaceCourse);
    return mkTrack?.laps || challenge?.campusMode?.laps || 2;
  }
  if (challenge.zones) return challenge.zones;
  if (challenge.isFoxChase) return 9;
  return Math.max(1, Math.ceil((challenge.totalDist || 30) / 5));
}

/** Primary mission progress for the in-game Mission panel */
export function deriveMissionProgress(challenge, stats = {}, zoneInfo = {}) {
  if (challenge?.arenaBible && challenge?.arenaType === 'sandbox') {
    const target = stats.missionCheckpointsTotal || challenge.checkpoints || 3;
    const current = Math.min(target, stats.missionCheckpoint || 0);
    return {current, target, label:'checkpoints', pct:Math.min(100, current / target * 100)};
  }
  const totalZones = getCourseZoneCount(challenge);
  const zoneNum = zoneInfo?.num || 0;
  const zonesDone = zoneNum > 0 ? Math.max(0, zoneNum - 1) : Math.floor(((stats.progress || 0) / 100) * totalZones);
  const po = challenge?.primaryObjective;

  if (challenge?.isRobotMission && po?.target) {
    if (['collect_count', 'color_delivery', 'numbered_delivery', 'collect_and_reach'].includes(po.type)) {
      const current = stats.collected || 0;
      const target = po.target;
      return { current, target, label: 'collected', pct: Math.min(100, (current / target) * 100) };
    }
    if (po.type === 'visit_waypoints') {
      const current = zonesDone;
      const target = po.target;
      return { current, target, label: 'checkpoints', pct: Math.min(100, (current / target) * 100) };
    }
    if (po.type === 'stack_count') {
      const current = stats.stacked || stats.collected || 0;
      const target = po.target;
      return { current, target, label: 'stacked', pct: Math.min(100, (current / target) * 100) };
    }
    const pct = Math.round(stats.progress || 0);
    return { current: pct, target: 100, label: 'complete', pct };
  }

  if (challenge?.arenaType === 'robot_fight' || challenge?.genre === 'combat' || challenge?.cat === 'combat') {
    const hits = stats.trainingHits ?? 0;
    const goal = stats.trainingGoal ?? challenge?.fightMode === 'training' ? 5 : null;
    if (goal != null) return { current: hits, target: goal, label: 'hits', pct: Math.min(100, (hits / goal) * 100) };
    const pct = Math.round(stats.progress || 0);
    return { current: pct, target: 100, label: 'complete', pct };
  }

  if (challenge?.arenaType === 'robot_football' || challenge?.genre === 'football' || challenge?.cat === 'football') {
    const goals = stats.playerGoals ?? stats.trainingGoals ?? 0;
    const target = challenge?.missionTarget ?? challenge?.goalsToWin ?? 3;
    return { current: goals, target, label: 'goals', pct: Math.min(100, (goals / target) * 100) };
  }

  const racingArena = challenge?.arenaType || getMKTrack(challenge?.linkedRaceCourse)?.arenaType;
  const isRacingMission = racingArena !== 'sandbox'
    && racingArena !== 'flight_rings'
    && (challenge?.cat === 'race'
    || challenge?.genre === 'racing'
    || challenge?.cat === 'racing'
    || stats.raceMode
    || isRaceCourse(challenge?.id, racingArena));

  if (isRacingMission) {
    const mkTrack = getMKTrack(racingArena || challenge?.linkedRaceCourse);
    const laps = stats.raceLap || 1;
    const totalLaps = stats.raceTotalLaps || mkTrack?.laps || challenge?.campusMode?.laps || 2;
    const cps = stats.raceCheckpoint || 0;
    const cpsTotal = stats.raceCheckpointsTotal || mkTrack?.checkpointTs?.length || challenge?.checkpoints || 5;
    if (totalLaps > 1) {
      const pct = Math.min(100, ((laps - 1) / totalLaps) * 100 + (cps / Math.max(1, cpsTotal)) * (100 / totalLaps));
      return { current: laps, target: totalLaps, label: 'laps', pct };
    }
    return {
      current: cps,
      target: cpsTotal,
      label: 'checkpoints',
      pct: Math.min(100, (cps / Math.max(1, cpsTotal)) * 100),
    };
  }

  if (po?.target && ['collect_count', 'numbered_delivery'].includes(po.type)) {
    const current = stats.collected || 0;
    return { current, target: po.target, label: 'collected', pct: Math.min(100, (current / po.target) * 100) };
  }

  if ((stats.progress || 0) > 0) {
    const pct = Math.round(stats.progress);
    return { current: pct, target: 100, label: 'complete', pct };
  }

  const target = challenge?.collectTarget || challenge?.starTarget || 25;
  const current = stats.collected || 0;
  return { current, target, label: 'items', pct: Math.min(100, (current / target) * 100) };
}

/** Check whether a bonus/sub-objective line is satisfied */
export function isSubObjectiveMet(text, { stats = {}, zoneInfo = {}, challenge = {}, totalZones = 5, zonesDone = 0 }) {
  if (!text || typeof text !== 'string') return false;
  const lower = text.toLowerCase();
  if (stats.progress >= 100) return true;
  if (/\d+\+?\s*(coin|item|star|token|container|firefly|gem)/.test(lower)) {
    const n = parseInt(text.match(/(\d+)/)?.[1] || '0', 10);
    return n > 0 && (stats.collected || 0) >= n;
  }
  if (lower.includes('under') && lower.includes('minute')) {
    const mins = parseInt(text.match(/(\d+)\s*minute/)?.[1] || '0', 10);
    return mins > 0 && stats.time > 0 && stats.time <= mins * 60;
  }
  if (lower.includes('beat') && (lower.includes('time') || lower.includes('timer') || lower.includes('record'))) {
    return stats.progress >= 100;
  }
  if (lower.includes('zone') || lower.includes('circuit') || lower.includes('checkpoint') || lower.includes('clear')) {
    return zonesDone >= Math.max(1, Math.floor(totalZones * 0.6));
  }
  if (lower.includes('boost pad')) {
    return (stats.boostsUsed || stats.collected || 0) >= 3;
  }
  if (lower.includes('drift')) {
    return (stats.perfectDrifts || 0) >= 10;
  }
  if (lower.includes('catch') || lower.includes('intercept')) {
    return zonesDone >= totalZones - 1;
  }
  return false;
}

function courseMatchesRobot(c, robotType, recKeys, exKey) {
  if (c.exclusive) return c.exclusive === exKey;
  const keys = new Set([robotType, ...(recKeys.length ? recKeys : ROBOT_REC_KEYS[robotType] || [])]);
  return c.rec?.some((r) => keys.has(r)) ?? false;
}

export function filterCoursesForRobot(courses, robotType, recKeys = []) {
  const exKey = exclusiveKeyForRobot(robotType);
  const primary = ROBOT_PRIMARY_COURSES[robotType] || [];
  const effectiveRec = recKeys.length ? recKeys : (ROBOT_REC_KEYS[robotType] || []);
  const AERIAL = ['drone', 'jet', 'hover', 'racedrone', 'aerial'];
  const SUB = ['underwater', 'submarine', 'ocean'];
  const group = robotType === 'birdbot' ? 'birdbot'
    : AERIAL.includes(robotType) || robotType === 'jet' ? 'aerial'
    : SUB.includes(robotType) || robotType === 'underwater' ? 'underwater'
    : ['spider', 'humanoid'].includes(robotType) ? 'walker'
    : 'wheeled';

  const campaignKey = getCampaignKeyForRobotType(robotType);

  const filtered = courses.filter((c) => {
    // Campaign missions belong only to that robot's year-long story — never via shared rec tags
    if (c.isRobotMission) {
      return !!campaignKey && c.cat === `campaign_${campaignKey}`;
    }
    if (c.exclusive && c.exclusive !== exKey) return false;
    if (group === 'birdbot' && c.rec?.length && !c.rec.includes('birdbot') && c.exclusive !== 'birdbot') return false;
    if (group === 'walker' && c.rec?.length && c.rec.every((r) => AERIAL.includes(r))) return false;
    if (group === 'wheeled' && c.rec?.length && c.rec.every((r) => [...AERIAL, ...SUB].includes(r))) return false;
    if (group === 'aerial' && c.rec?.length && c.rec.every((r) => SUB.includes(r))) return false;
    if (group === 'underwater' && c.rec?.length && c.rec.every((r) => AERIAL.includes(r))) return false;
    if (!courseMatchesRobot(c, robotType, effectiveRec, exKey)) return false;
    return true;
  });

  return filtered
    .map((c) => enrichCourseWithGameLogic(c))
    .sort((a, b) => {
      const ap = primary.indexOf(a.id);
      const bp = primary.indexOf(b.id);
      if (ap >= 0 && bp >= 0) return ap - bp;
      if (ap >= 0) return -1;
      if (bp >= 0) return 1;
      if (a.exclusive && !b.exclusive) return -1;
      if (b.exclusive && !a.exclusive) return 1;
      if (a.isGameMission && !b.isGameMission) return -1;
      if (b.isGameMission && !a.isGameMission) return 1;
      if (a.isRobotMission && !b.isRobotMission) return -1;
      if (b.isRobotMission && !a.isRobotMission) return 1;
      const aLogic = COURSE_GAME_LOGIC[a.id] ? 1 : 0;
      const bLogic = COURSE_GAME_LOGIC[b.id] ? 1 : 0;
      return bLogic - aLogic;
    });
}

export function getDefaultCourseForRobot(courses, robotType, recKeys = []) {
  const fit = filterCoursesForRobot(courses, robotType, recKeys);
  return fit[0] || courses[0];
}

/** Hero-row featured missions — racing & game-build showcases for the mission picker */
export function pickFeaturedCourses(courses, robotType, limit = 6) {
  const primary = ROBOT_PRIMARY_COURSES[robotType] || [];
  const seen = new Set();
  const picked = [];
  const isShowcase = (c) => c && !c.isRobotMission && (c.isGameMission || c.genre === 'racing' || c.genre === 'combat' || c.genre === 'football' || c.cat === 'combat' || c.cat === 'football');
  const add = (c) => {
    if (!isShowcase(c) || seen.has(c.id)) return;
    seen.add(c.id);
    picked.push(c);
  };
  for (const id of primary) {
    add(courses.find((c) => c.id === id));
    if (picked.length >= limit) return picked;
  }
  for (const c of courses) {
    add(c);
    if (picked.length >= limit) break;
  }
  return picked;
}
