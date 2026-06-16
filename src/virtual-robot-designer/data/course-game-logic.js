/**
 * course-game-logic.js — Per-course game rules, hints, and robot-primary catalogs
 * Ensures each robot gets missions that require real logic (not straight-line only).
 */

/** Primary course order per robot type (best game-design fit first) */
export const ROBOT_PRIMARY_COURSES = {
  rover:      ['fox_battery_chase', 'rover_delivery', 'rover_transit', 'rover_survey', 'cargo', 'checkpoint', 'city_delivery', 'museum_heist', 'obstacle'],
  spider:     ['spider_rescue', 'spider_pipeline', 'spider_ruins', 'jump_world', 'crystal_logic_dungeon', 'maze', 'pressure_path', 'deep_cave'],
  drone:      ['drone_canyon', 'drone_rooftop', 'drone_survey', 'sky_racers', 'canyon_flight_course', 'storm_cloud_chase', 'coastal_rescue'],
  jet:        ['jet_stunt', 'jet_supersonic', 'jet_circuit', 'sky_racers', 'volcanic_flythrough', 'storm_cloud_chase'],
  hover:      ['sky_racers', 'neon_race', 'drift_king', 'rooftop_delivery', 'drone_rooftop', 'neon_chase'],
  racedrone:  ['sky_racers', 'neon_race', 'drone_league', 'storm_cloud_chase', 'cloud_race'],
  tank:       ['tank_demolition', 'tank_siege', 'tank_mountain', 'robo_defense', 'volcano_run', 'warzone', 'tank_rubble'],
  humanoid:   ['jump_world', 'human_stairwell', 'human_assembly', 'idol_heist', 'pressure_path', 'shadow_escape', 'temple_run'],
  factory:    ['arm_sort', 'arm_surgery', 'auto_factory', 'factory_rush', 'quality_gate', 'master_manipulator_l1'],
  factorybot: ['factory_rush', 'quality_gate', 'arm_sort', 'crane_challenge'],
  underwater: ['coral_reef', 'deep_trench', 'kelp_forest', 'seafloor_scan', 'arctic_dive', 'ocean_race'],
  medbot:     ['triage_run', 'hospital_nav', 'precision_delivery_l1', 'emergency_rescue', 'med_delivery', 'snow_rescue'],
  firebot:    ['blaze_run', 'rescue_extract', 'emergency_rescue', 'fire_maze', 'volcano_run'],
  security:   ['shadow_escape', 'stealth', 'smart_patrol', 'museum_heist', 'cyber_city'],
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
    winCondition: 'Navigate around obstacles — zero collisions',
    codeHint: 'IF obstacle ahead → TURN → MOVE → repeat. Don\'t just drive straight!',
    requiredMechanics: ['obstacle_ahead', 'if_then', 'turn'],
    minBlocks: 4,
    objectives: ['Avoid all obstacles', 'Reach finish zone', 'Minimize collisions'],
  },
  maze: {
    gameType: 'pathfinding',
    winCondition: 'Find exit through maze dead-ends',
    codeHint: 'IF wall left → TURN right. IF wall ahead → TURN. Track turns with REPEAT.',
    requiredMechanics: ['obstacle_ahead', 'if_then', 'turn', 'repeat'],
    minBlocks: 5,
    objectives: ['Navigate dead-ends', 'Find the exit', 'Efficient path'],
  },
  checkpoint: {
    gameType: 'sequence',
    winCondition: 'Hit every checkpoint in order',
    codeHint: 'After each checkpoint: TURN toward next glow → MOVE. Use IF to confirm arrival.',
    requiredMechanics: ['turn', 'repeat', 'if_then'],
    minBlocks: 5,
    objectives: ['Hit checkpoints in order', 'No skipped gates', 'Beat timer'],
  },
  cargo: {
    gameType: 'delivery',
    winCondition: 'Pick up and deliver all crates',
    codeHint: 'Move to crate → collect → navigate to shrine → REPEAT for each crate.',
    requiredMechanics: ['repeat', 'turn', 'if_then'],
    minBlocks: 5,
    objectives: ['Collect all crates', 'Deliver to shrine', 'No drops'],
  },
  stealth: {
    gameType: 'stealth',
    winCondition: 'Reach goal with zero detections',
    codeHint: 'WAIT for sensor sweep → SET SPEED low → sprint through gap → STOP if detected.',
    requiredMechanics: ['wait', 'set_speed', 'stop', 'if_then'],
    minBlocks: 6,
    objectives: ['Avoid sensor towers', 'Time your dashes', 'Reach shrine unseen'],
  },
  line_follow: {
    gameType: 'line_follow',
    winCondition: 'Follow the glowing line without leaving track',
    codeHint: 'IF off line → TURN toward line. Never just MOVE forward blindly!',
    requiredMechanics: ['line_below', 'if_then', 'turn'],
    minBlocks: 4,
    objectives: ['Stay on line', 'Handle curves', 'Complete loop'],
  },
  precision: {
    gameType: 'precision',
    winCondition: 'Park in every target circle accurately',
    codeHint: 'Slow approach: SET SPEED 25% → MOVE → STOP when in zone → WAIT.',
    requiredMechanics: ['set_speed', 'stop', 'wait', 'repeat'],
    minBlocks: 5,
    objectives: ['Hit all target zones', 'Center parking bonus', 'Precision over speed'],
  },
  neon_chase: {
    gameType: 'chase',
    winCondition: 'Catch the runaway bot before exit',
    codeHint: 'SET SPEED max on straights → TURN at intercept points → IF bot ahead → boost.',
    requiredMechanics: ['set_speed', 'turn', 'if_then', 'boost'],
    minBlocks: 6,
    objectives: ['Intercept target bot', 'Cut corners smartly', 'Catch before exit'],
  },
  idol_heist: {
    gameType: 'heist',
    winCondition: 'Grab idol and escape temple traps',
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
};

export function exclusiveKeyForRobot(robotType) {
  if (robotType === 'factory') return 'arm';
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

export function enrichCourseWithGameLogic(course) {
  if (!course) return course;
  const logic = getGameLogicForCourse(course.id);
  if (!logic) return course;
  return {
    ...course,
    gameType: logic.gameType,
    winCondition: logic.winCondition,
    codeHint: logic.codeHint || course.codeHint,
    requiredMechanics: logic.requiredMechanics,
    minBlocks: logic.minBlocks,
    gameObjectives: logic.objectives,
  };
}

export function filterCoursesForRobot(courses, robotType, recKeys = []) {
  const exKey = exclusiveKeyForRobot(robotType);
  const primary = ROBOT_PRIMARY_COURSES[robotType] || [];
  const AERIAL = ['drone', 'jet', 'hover', 'racedrone'];
  const SUB = ['underwater', 'submarine'];
  const group = AERIAL.includes(robotType) ? 'aerial'
    : SUB.includes(robotType) ? 'underwater'
    : ['spider', 'humanoid'].includes(robotType) ? 'walker'
    : 'wheeled';

  const filtered = courses.filter((c) => {
    if (c.exclusive && c.exclusive !== exKey) return false;
    if (group === 'aerial' && !c.rec?.some((r) => AERIAL.includes(r)) && !c.exclusive) {
      if (!c.rec?.some((r) => recKeys.includes(r))) return false;
    }
    if (group === 'underwater' && !c.rec?.some((r) => SUB.includes(r)) && !c.exclusive) {
      if (!c.rec?.some((r) => recKeys.includes(r))) return false;
    }
    if (group === 'walker' && c.rec?.every((r) => AERIAL.includes(r))) return false;
    if (group === 'wheeled' && c.rec?.every((r) => [...AERIAL, ...SUB].includes(r))) return false;
    if (recKeys.length && !c.exclusive && !c.isGameMission && !c.isFlagship) {
      if (!c.rec?.some((r) => recKeys.includes(r))) return false;
    }
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
      const aLogic = COURSE_GAME_LOGIC[a.id] ? 1 : 0;
      const bLogic = COURSE_GAME_LOGIC[b.id] ? 1 : 0;
      return bLogic - aLogic;
    });
}

export function getDefaultCourseForRobot(courses, robotType, recKeys = []) {
  const fit = filterCoursesForRobot(courses, robotType, recKeys);
  return fit[0] || courses[0];
}
