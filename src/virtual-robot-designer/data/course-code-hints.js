/**
 * course-code-hints.js — Per-course, per-robot coding hints derived from course logic.
 */
import { getGameLogicForCourse, resolveCourseObjectives } from './course-game-logic.js';
import { buildChassisModeGameLogic } from './chassis-game-logic.js';
import { FOOTBALL_ROLE_STARTERS } from './football-blocks.js';
import { FIGHTING_STARTER_SCRIPT } from './fighting-blocks.js';
import { FLAPPY_STARTER_SCRIPT } from './flappy-bird-blocks.js';
import { FOOTBALL_STARTER_SCRIPT } from './football-blocks.js';
import { RACE_STARTER_SCRIPT, getRaceTrackGuideScript, CUP_TRACK_SCRIPTS, CUP_OPEN_STARTER } from './racing-starter-script.js';
import { UNIVERSAL_EVENTS_CATEGORY } from './universal-event-blocks.js';

/** What each common block does — shown in the hints panel. */
export const BLOCK_CODE_EXPLAIN = {
  when_start: 'Runs once when you press ▶ Simulate.',
  when_spacebar: 'Runs every time you press SPACE during the simulation.',
  forever: 'Repeats for the whole match or level — put your main logic inside this loop.',
  repeat: 'Runs the blocks inside it a set number of times.',
  wait: 'Pauses the robot for a moment (useful for timing and factories).',
  if_then: 'Only runs the next blocks when the condition is true.',
  if_else: 'Chooses between two paths depending on a sensor or condition.',
  if_ball_close: 'Checks if the ball is near your player.',
  if_ball_far: 'Checks if the ball is far away — hold position or pass upfield.',
  if_have_ball: 'Checks if your player is touching the ball.',
  if_shooting_range: 'Checks if you are close enough to the goal to shoot.',
  if_enemy_close: 'Checks if the opponent is near — time to attack or dodge.',
  if_enemy_far: 'Checks if the opponent is far — advance toward them.',
  if_under_attack: 'Checks if the rival is hitting you — time to block or dodge.',
  if_health_low: 'Checks if your health is low — retreat or defend.',
  chase_ball: 'Runs your player toward the ball.',
  face_ball: 'Turns to look at the ball without moving.',
  move_to_position: 'Walks to a spot on the pitch (X and Z coordinates).',
  short_pass: 'Passes the ball to a nearby teammate.',
  long_pass: 'Sends a longer pass up the field to open space.',
  shoot: 'Kicks the ball toward the goal.',
  lob_pass: 'Lobs the ball over defenders.',
  dribble: 'Runs with the ball toward the opponent goal.',
  clear_ball: 'Boots the ball away from your goal (defender move).',
  guard_goal: 'Stays between the ball and your goal.',
  dive_save: 'Goalkeeper dive to block a shot.',
  celebrate: 'Victory animation after a goal.',
  catch_ball: 'Traps or catches the ball when close.',
  flap: 'Makes BirdBot jump upward — tap SPACE or use this block.',
  move_forward: 'Drives forward in the direction the robot is facing.',
  move_forward_continuous: 'Keeps driving forward without stopping.',
  turn_left: 'Turns the robot left (good for corners and obstacles).',
  turn_right: 'Turns the robot right.',
  curve_left: 'Smooth left turn along the track.',
  curve_right: 'Smooth right turn along the track.',
  set_speed: 'Sets how fast the robot moves — slow for turns, fast on straights.',
  boost: 'Short speed burst — great on racing straights.',
  light_punch: 'A quick attack in fighting mode.',
  light_kick: 'A fast kick attack.',
  jab: 'A quick jab punch — fast and safe opener.',
  cross: 'A straight punch with power — good follow-up.',
  hook: 'Curved punch that catches dodging rivals.',
  uppercut: 'Upward punch — strong when enemy is close.',
  roundhouse: 'Spinning kick with wide reach.',
  heavy_kick: 'Slow but powerful kick — use when rival is stunned.',
  block: 'Blocks incoming attacks from the opponent.',
  dodge: 'Sidestep to avoid a hit.',
  advance_step: 'Steps toward the opponent to close distance.',
  retreat_step: 'Steps back to create space and recover.',
  heavy_punch: 'A powerful but slower punch.',
  defend: 'Defensive stance — reduces damage taken.',
  use_special: 'Triggers your robot\'s special ability.',
  combo_3hit: 'Chains Jab → Cross → Hook in one combo.',
  parry: 'Deflects an attack and opens a counter window.',
  check_distance: 'Reads how far the enemy is — branch with IF blocks.',
  fly_up: 'Rises into the air — essential for drones and jets.',
  fly_down: 'Descends to a lower altitude.',
  hover_hold: 'Holds position in the air for a set time.',
  bank_left: 'Banks left while flying — smooth aerial turns.',
  bank_right: 'Banks right while flying.',
  step_forward: 'Takes a walking step — humanoids and spiders use this.',
  jump: 'Jumps over gaps or low obstacles.',
  dive_deep: 'Dives deeper underwater.',
  surface: 'Rises toward the water surface.',
  brake: 'Stops movement immediately.',
  attack_light: 'A quick ranged or melee attack.',
  detect_enemy: 'Scans for nearby threats.',
  // Movement extras
  move_backward: 'Drives backward — useful for repositioning or retreating.',
  stop: 'Stops all movement immediately.',
  spin: 'Spins the robot in place by a set number of degrees.',
  orbit: 'Circles around a target point multiple times.',
  follow_track_on: 'Lets the robot auto-follow the racing track line.',
  follow_track_off: 'Turns off automatic track following.',
  turn_corner_left: 'Sharp left corner turn — common on cup tracks.',
  turn_corner_right: 'Sharp right corner turn — common on cup tracks.',
  zigzag: 'Zigzag pattern — good for obstacle courses.',
  circle: 'Drives a circle — left or right.',
  u_turn: 'Turns 180° to face the opposite direction.',
  move_forward_until: 'Keeps moving until a wall, item, goal, or sensor condition hits.',
  turn_until_facing: 'Turns until facing the goal, item, or compass direction.',
  rotate_to_heading: 'Rotates to an exact compass heading in degrees.',
  move_forward_units: 'Moves a precise distance in world units.',
  dive: 'Dives downward — aerial robots and BirdBot.',
  roll: 'Rolls/spins while flying.',
  climb: 'Climbs over an obstacle — walkers only.',
  crouch: 'Crouches down — lowers profile for tight spaces.',
  sonar_ping: 'Sends a sonar pulse to detect objects underwater.',
  float_up: 'Floats upward gently — BirdBot glide control.',
  // Loops
  wait_until: 'Pauses until the current action finishes.',
  repeat_until: 'Repeats until game over or a condition is met.',
  break_loop: 'Exits the current loop early.',
  // Sensors
  obstacle_ahead: 'Checks if something is directly in front.',
  line_below: 'Checks if the robot is on the track line.',
  if_color: 'Checks if a specific color is detected by sensors.',
  if_distance: 'Checks if distance to an object is less than a value.',
  scan: 'Scans the area in a full 360° sweep.',
  detect_item: 'Checks for nearby collectible items.',
  battery_low: 'Checks if battery is running low.',
  see_object: 'Checks if an object is visible ahead.',
  read_altitude: 'Reads current flying altitude.',
  wind_speed: 'Checks if wind is too strong for safe flight.',
  depth_sensor: 'Reads current underwater depth.',
  pressure: 'Checks if water pressure is dangerously high.',
  // Variables & functions
  set_var: 'Sets a variable to a number you can reuse in logic.',
  change_var: 'Adds or subtracts from a stored variable.',
  define_func: 'Defines a reusable block group you can call later.',
  call_func: 'Runs your custom function block.',
  create_var: 'Creates a new variable to store values.',
  get_var: 'Reads a variable value for comparisons.',
  // Lights & sound
  led_on: 'Turns the robot LED on (often blue).',
  led_off: 'Turns the robot LED off.',
  led_blink: 'Flashes the LED a set number of times.',
  play_sound: 'Plays a beep or game sound.',
  alarm_sound: 'Plays an alarm sound — great for alerts.',
  // Football extras
  check_ball_distance: 'Reads how far the ball is from your player.',
  check_goal_distance: 'Reads how far you are from the goal.',
  when_get_ball: 'Runs when your player gains possession.',
  when_goal_scored: 'Runs when your team scores a goal.',
  when_concede: 'Runs when the opponent scores.',
  when_match_start: 'Runs once when the match kicks off.',
  when_match_end: 'Runs when the match finishes.',
  when_out_bounds: 'Runs when the ball goes out of play.',
  // Fighting extras
  attack: 'Basic attack — damage depends on your fighter type.',
  attack_heavy: 'Slow, powerful attack with high damage.',
  sweep: 'Low sweep kick that can knock the rival down.',
  high_guard: 'Blocks high attacks — head and shoulders.',
  mid_guard: 'Blocks mid-level punches and kicks.',
  low_guard: 'Blocks low kicks and sweeps.',
  detect_attack: 'Senses an incoming rival attack.',
  check_health: 'Reads your health percentage.',
  check_enemy_health: 'Reads the rival\'s health percentage.',
  move_toward_enemy: 'Steps closer to the opponent.',
  move_away_enemy: 'Steps away from the opponent.',
  strafe_left: 'Sidesteps left while facing the rival.',
  strafe_right: 'Sidesteps right while facing the rival.',
  rage_mode: 'Activates rage mode — boosted striker damage.',
  slam: 'Overhead slam — heavy tank attack.',
  shield_bash: 'Bashes with shield — stuns nearby rivals.',
  grab_throw: 'Grabs and throws the rival.',
  fortify: 'Fortifies defenses — tank armor boost.',
  stomp: 'Ground stomp — damages nearby rivals.',
  charge: 'Charges forward with heavy impact.',
  last_stand: 'Last stand — tank survival ability.',
  fire_blast: 'Fires a blast of flame at the rival.',
  ice_beam: 'Fires a freezing ice beam.',
  lightning_strike: 'Lightning strike — blaster ranged attack.',
  explosion: 'Explosive blast with area damage.',
  prismatic_shield: 'Prismatic energy shield — blocks attacks.',
  teleport: 'Teleports to a new position instantly.',
  elemental_fusion: 'Combines elements for a fusion attack.',
  swift_strike: 'Fast ninja strike — low damage, high speed.',
  shuriken_throw: 'Throws shuriken at the rival.',
  backstab: 'Backstab — bonus damage from behind.',
  blade_flurry: 'Rapid blade combo attack.',
  smoke_bomb: 'Smoke bomb — obscures vision and escapes.',
  shadow_clone: 'Creates a shadow clone decoy.',
  shadow_assassination: 'Shadow assassination — ninja finisher.',
  furious_blow: 'Furious berserker punch combo.',
  earthquake_smash: 'Ground smash — area damage around you.',
  whirlwind: 'Spinning attack hitting all nearby.',
  berserker_roar: 'Roar that buffs attack power.',
  rage_shield: 'Rage shield — absorbs damage while raging.',
  revenge_blow: 'Counter-attack after taking damage.',
  uncontrollable_rage: 'Uncontrollable rage — massive damage burst.',
  // Flappy extras
  set_flap_strength: 'Sets how strong each flap is.',
  set_gravity_strength: 'Sets how fast BirdBot falls.',
  set_scroll_speed: 'Sets how fast pipes scroll toward you.',
  freeze_bird: 'Freezes BirdBot in place temporarily.',
  move_up: 'Moves BirdBot up by a set amount.',
  move_down: 'Moves BirdBot down by a set amount.',
  set_bird_height: 'Sets BirdBot to an exact height.',
  distance_to_pipe: 'Reads distance to the next pipe gap.',
  bird_height: 'Reads BirdBot\'s current height.',
  gap_center_height: 'Reads the center height of the next gap.',
  is_falling: 'Checks if BirdBot is falling downward.',
  num_pipe_dist: 'Pipe distance as a number for comparisons.',
  num_bird_height: 'Bird height as a number for comparisons.',
  num_gap_center: 'Gap center height as a number for comparisons.',
  is_falling_bool: 'True/false value — is BirdBot falling?',
  if_gt: 'If first value is greater than second value.',
  if_lt: 'If first value is less than second value.',
  if_eq: 'If two values are equal.',
  read_score: 'Reads the current game score.',
  read_high_score: 'Reads your best high score.',
  num_score: 'Score as a number for comparisons.',
  num_high_score: 'High score as a number for comparisons.',
  show_score: 'Shows the score on screen.',
  restart_game: 'Restarts the Flappy game from the beginning.',
  pause: 'Pauses the game for a set time.',
  show_message: 'Shows a message on screen.',
  // Racing sensors
  race_speed: 'Reads current race speed in km/h.',
  race_dist_left_rail: 'Distance to the left track rail.',
  race_dist_right_rail: 'Distance to the right track rail.',
  race_on_track: 'Checks if you are still on the track.',
  race_current_lap: 'Reads which lap you are on.',
  // Universal events
  when_key: 'Runs when a chosen key is pressed (arrows or space).',
  when_zone: 'Runs when your robot enters a mission zone.',
  when_collect: 'Runs when you collect an item.',
  when_collision: 'Runs when the robot hits something.',
  when_sensor: 'Runs when a sensor triggers.',
  when_timer: 'Runs when the timer reaches a set time.',
  when_battery: 'Runs when battery drops below a percentage.',
  when_checkpoint: 'Runs when you pass a checkpoint.',
  when_lap: 'Runs when you complete a lap.',
  when_race_won: 'Runs when you win the race.',
  when_goal: 'Runs when you reach the goal.',
  when_gap_passed: 'Runs when BirdBot passes a pipe gap.',
  when_game_over: 'Runs when the game ends.',
};

/** Fallback explanation when a block is not in BLOCK_CODE_EXPLAIN. */
export function explainBlock(block) {
  if (!block) return '';
  if (BLOCK_CODE_EXPLAIN[block.id]) return BLOCK_CODE_EXPLAIN[block.id];
  const label = block.label || block.id?.replace(/_/g, ' ') || 'block';
  if (block.id?.startsWith('if_') || block.id?.startsWith('is_')) {
    return `Checks "${label}" — branch with IF blocks when true.`;
  }
  if (block.id?.startsWith('when_')) {
    return `Runs when ${label.replace(/^When /i, '')}.`;
  }
  if (block.id?.startsWith('check_') || block.id?.startsWith('read_') || block.id?.startsWith('num_')) {
    return `Reads ${label.toLowerCase()} for logic or comparisons.`;
  }
  return `Runs "${label}" during the simulation.`;
}

/** Mirror CustomCodePanel palette filter — every block available in the coding panel. */
export function filterBlockLibraryForPalette(blockLibrary, paletteRobotGroup, paletteRobotType) {
  const cats = Object.entries(blockLibrary || {}).map(([key, cat]) => ({
    key,
    ...cat,
    blocks: (cat.blocks || []).filter((b) => {
      const groupOk = key === 'Events' || !b.robotGroups
        || b.robotGroups.includes(paletteRobotGroup)
        || b.robotGroups.includes(paletteRobotType);
      return groupOk;
    }),
  })).filter((c) => c.blocks.length > 0);

  const eventsCat = cats.find((c) => c.key === 'Events');
  if (!eventsCat || eventsCat.blocks.length !== UNIVERSAL_EVENTS_CATEGORY.blocks.length) {
    const merged = cats.filter((c) => c.key !== 'Events');
    merged.unshift({ key: 'Events', ...UNIVERSAL_EVENTS_CATEGORY });
    return merged;
  }
  return cats;
}

/** Group palette blocks by category with explanations for the hints panel. */
export function buildPaletteBlockGroups(categories) {
  return (categories || []).map((cat) => ({
    key: cat.key,
    label: cat.label || cat.name || cat.key,
    icon: cat.icon,
    color: cat.color,
    blocks: (cat.blocks || []).map((b) => ({
      id: b.id,
      label: b.label,
      icon: b.icon,
      explain: explainBlock(b),
    })),
  }));
}

const mk = (id, label, paramValues = {}) => ({ id, label, paramValues });

function getRobotGroup(robotType) {
  if (['drone', 'jet', 'hover', 'racedrone'].includes(robotType)) return 'aerial';
  if (['spider', 'humanoid'].includes(robotType)) return 'walker';
  if (robotType === 'underwater') return 'underwater';
  if (['factory', 'factorybot'].includes(robotType)) return 'arm';
  if (robotType === 'birdbot') return 'birdbot';
  if (['striker', 'blaster', 'ninja', 'berserker'].includes(robotType)) return 'fighter';
  if (['footballbot', 'football'].includes(robotType)) return 'footballbot';
  return 'wheeled';
}

const ROBOT_MOVE = {
  rover: mk('move_forward', 'Move forward', { steps: 3 }),
  tank: mk('move_forward', 'Move forward', { steps: 2 }),
  drone: mk('fly_up', 'Fly up', { height: 4 }),
  jet: mk('fly_up', 'Fly up', { height: 6 }),
  hover: mk('hover_hold', 'Hover for', { seconds: 2 }),
  racedrone: mk('fly_up', 'Fly up', { height: 4 }),
  spider: mk('step_forward', 'Step forward', { steps: 3 }),
  humanoid: mk('step_forward', 'Step forward', { steps: 3 }),
  underwater: mk('move_forward', 'Move forward', { steps: 3 }),
  factory: mk('move_forward', 'Move forward', { steps: 2 }),
  factorybot: mk('move_forward', 'Move forward', { steps: 2 }),
  medbot: mk('move_forward', 'Move forward', { steps: 3 }),
  firebot: mk('move_forward', 'Move forward', { steps: 3 }),
  security: mk('move_forward', 'Move forward', { steps: 3 }),
  miningbot: mk('move_forward', 'Move forward', { steps: 2 }),
  birdbot: mk('flap', 'Flap!'),
  striker: mk('jab', 'Jab'),
  blaster: mk('attack_light', 'Light attack'),
  ninja: mk('jab', 'Jab'),
  berserker: mk('heavy_punch', 'Heavy punch'),
  footballbot: mk('chase_ball', 'Chase ball'),
};

const ROBOT_TURN = {
  rover: mk('turn_left', 'Turn left', { degrees: 90 }),
  tank: mk('turn_corner_left', 'Turn corner left'),
  drone: mk('bank_left', 'Bank left', { degrees: 30 }),
  jet: mk('bank_left', 'Bank left', { degrees: 45 }),
  hover: mk('bank_left', 'Bank left', { degrees: 25 }),
  racedrone: mk('bank_left', 'Bank left', { degrees: 35 }),
  spider: mk('turn_left', 'Turn left', { degrees: 45 }),
  humanoid: mk('turn_left', 'Turn left', { degrees: 90 }),
  underwater: mk('turn_left', 'Turn left', { degrees: 45 }),
  birdbot: mk('flap', 'Flap to steer'),
};

const RELATED_ACTION = {
  if_ball_close: 'chase_ball',
  if_ball_far: 'long_pass',
  if_have_ball: 'dribble',
  if_shooting_range: 'shoot',
  if_enemy_close: 'jab',
  if_enemy_far: 'advance_step',
  if_under_attack: 'block',
  if_health_low: 'retreat_step',
  if_then: 'turn_left',
  if_else: 'move_forward',
  line_below: 'turn_left',
  if_color: 'turn_right',
};

const CONCEPT_TO_MECHANICS = {
  'sequential blocks': ['move_forward', 'turn_left', 'wait'],
  variables: ['set_speed', 'repeat'],
  loops: ['repeat', 'forever', 'move_forward'],
  'if/else': ['if_then', 'if_else', 'turn_left'],
  sensors: ['if_then', 'wait'],
  events: ['when_start', 'forever'],
  functions: ['repeat', 'custom_blocks'],
  'state machines': ['if_then', 'variables'],
  timing: ['wait', 'set_speed'],
  optimization: ['repeat', 'set_speed'],
};

const HINT_PHRASE_TO_MECHANIC = [
  ['when spacebar', 'spacebar'],
  ['when start', 'when_start'],
  ['set speed', 'set_speed'],
  ['move forward', 'move_forward'],
  ['turn left', 'turn_left'],
  ['turn right', 'turn_right'],
  ['chase ball', 'chase_ball'],
  ['short pass', 'short_pass'],
  ['long pass', 'long_pass'],
  ['shooting range', 'if_shooting_range'],
  ['have the ball', 'if_have_ball'],
  ['ball close', 'if_ball_close'],
  ['ball far', 'if_ball_far'],
  ['light punch', 'light_punch'],
  ['light kick', 'light_kick'],
  ['under attack', 'if_under_attack'],
  ['enemy close', 'if_enemy_close'],
  ['enemy far', 'if_enemy_far'],
  ['guard goal', 'guard_goal'],
  ['dive save', 'dive_save'],
  ['clear ball', 'clear_ball'],
  ['move to position', 'move_to_position'],
  ['forever', 'forever'],
  ['repeat', 'repeat'],
  ['boost', 'boost'],
  ['shoot', 'shoot'],
  ['dribble', 'dribble'],
  ['flap', 'flap'],
  ['block', 'block'],
  ['dodge', 'dodge'],
  ['wait', 'wait'],
  ['jump', 'jump'],
  ['patrol', 'patrol'],
  ['if/else', 'if_else'],
  ['repeat 3', 'repeat'],
  ['repeat 2', 'repeat'],
  ['repeat 5', 'repeat'],
  ['move', 'move_forward'],
  ['turn', 'turn_left'],
  ['stop', 'stop'],
  ['line', 'line_below'],
  ['sensor', 'if_then'],
  ['lob pass', 'lob_pass'],
  ['curve', 'lob_pass'],
  ['penalty', 'shoot'],
  ['save', 'dive_save'],
  ['keeper', 'guard_goal'],
  ['parry', 'parry'],
  ['combo', 'combo_3hit'],
  ['special', 'use_special'],
  ['heavy', 'heavy_kick'],
  ['stamina', 'defend'],
  ['lap', 'repeat'],
  ['checkpoint', 'move_forward'],
];

const ZONE_BLOCK_MAP = {
  robot_move_forward: 'move_forward',
  robot_turn_left: 'turn_left',
  robot_turn_right: 'turn_right',
  robot_repeat: 'repeat',
  robot_wait: 'wait',
  robot_jump: 'jump',
  robot_set_variable: 'set_speed',
  robot_var_set: 'set_speed',
  robot_var_change: 'set_speed',
};

const SIMPLE_FOOTBALL_ROLE = {
  defender: [mk('guard_goal', 'Guard goal')],
  striker: [mk('chase_ball', 'Chase ball')],
  midfielder: [mk('chase_ball', 'Chase ball')],
};

const EXPERT_FOOTBALL_ROLE = {
  striker: [
    mk('forever', 'Forever (match loop)'),
    mk('if_shooting_range', 'If in shooting range then'),
    mk('shoot', 'Shoot'),
    mk('celebrate', 'Celebrate goal'),
    mk('if_have_ball', 'If I have the ball then'),
    mk('dribble', 'Dribble toward goal'),
    mk('if_ball_far', 'If ball is far then'),
    mk('long_pass', 'Long pass upfield'),
    mk('if_ball_close', 'If ball is close then'),
    mk('chase_ball', 'Chase ball'),
    mk('move_to_position', 'Move to attack spot', { x: 8, z: 0 }),
    mk('face_ball', 'Face ball'),
    mk('if_have_ball', 'If I have the ball again then'),
    mk('short_pass', 'Short pass to teammate'),
    mk('wait', 'Wait', { seconds: 0.3 }),
    mk('chase_ball', 'Chase loose ball'),
    mk('if_shooting_range', 'If shooting range again then'),
    mk('shoot', 'Shoot on sight'),
    mk('dribble', 'Dribble if blocked'),
  ],
  defender: [
    mk('forever', 'Forever (match loop)'),
    mk('if_ball_close', 'If ball is close then'),
    mk('clear_ball', 'Clear ball'),
    mk('dive_save', 'Dive save'),
    mk('if_have_ball', 'If I have the ball then'),
    mk('short_pass', 'Short pass to midfielder'),
    mk('if_ball_far', 'If ball is far then'),
    mk('guard_goal', 'Guard goal'),
    mk('move_to_position', 'Hold defensive line', { x: -12, z: 0 }),
    mk('face_ball', 'Face ball'),
    mk('if_shooting_range', 'If rival in shooting range then'),
    mk('clear_ball', 'Emergency clear'),
    mk('guard_goal', 'Guard goal'),
    mk('if_ball_close', 'If ball returns then'),
    mk('dive_save', 'Second dive save'),
    mk('wait', 'Wait', { seconds: 0.2 }),
    mk('move_to_position', 'Reset position', { x: -10, z: 0 }),
  ],
  midfielder: [
    mk('forever', 'Forever (match loop)'),
    mk('if_have_ball', 'If I have the ball then'),
    mk('short_pass', 'Short pass'),
    mk('if_ball_close', 'If ball is close then'),
    mk('chase_ball', 'Chase ball'),
    mk('if_ball_far', 'If ball is far then'),
    mk('move_to_position', 'Shift left channel', { x: -5, z: 6 }),
    mk('long_pass', 'Long pass to striker'),
    mk('move_to_position', 'Shift right channel', { x: -5, z: -6 }),
    mk('face_ball', 'Face ball'),
    mk('short_pass', 'Link pass'),
    mk('lob_pass', 'Lob over defense'),
    mk('if_have_ball', 'If regain possession then'),
    mk('short_pass', 'One-touch pass'),
    mk('chase_ball', 'Support the attack'),
    mk('wait', 'Wait', { seconds: 0.25 }),
    mk('move_to_position', 'Hold midfield', { x: -5, z: 0 }),
    mk('face_ball', 'Face play'),
  ],
};

const EXPERT_FIGHTING = [
  mk('forever', 'Forever (fight loop)'),
  mk('if_under_attack', 'If under attack then'),
  mk('block', 'Block'),
  mk('dodge', 'Dodge'),
  mk('parry', 'Parry'),
  mk('if_health_low', 'If health low then'),
  mk('retreat_step', 'Retreat step'),
  mk('defend', 'Defend stance'),
  mk('if_enemy_far', 'If enemy far then'),
  mk('advance_step', 'Advance step'),
  mk('advance_step', 'Advance step again'),
  mk('check_distance', 'Check distance'),
  mk('if_enemy_close', 'If enemy close then'),
  mk('jab', 'Jab'),
  mk('cross', 'Cross'),
  mk('hook', 'Hook'),
  mk('roundhouse', 'Roundhouse Kick'),
  mk('if_under_attack', 'If under attack then'),
  mk('block', 'Block'),
  mk('if_enemy_close', 'If enemy close then'),
  mk('heavy_kick', 'Heavy Kick'),
  mk('use_special', 'Use special ability'),
  mk('wait', 'Wait', { seconds: 0.4 }),
  mk('combo_3hit', 'Jab → Cross → Hook'),
];

const FOOTBALL_COURSE_EXPERT = {
  football_training: [
    mk('forever', 'Forever (training loop)'),
    mk('chase_ball', 'Chase ball'),
    mk('if_ball_close', 'If ball is close then'),
    mk('face_ball', 'Face ball'),
    mk('if_have_ball', 'If I have the ball then'),
    mk('dribble', 'Dribble'),
    mk('if_shooting_range', 'If in shooting range then'),
    mk('shoot', 'Shoot'),
    mk('wait', 'Wait', { seconds: 0.3 }),
    mk('chase_ball', 'Chase again'),
    mk('if_ball_close', 'If close again then'),
    mk('shoot', 'Shoot again'),
  ],
  football_skills: [
    mk('forever', 'Forever (skills loop)'),
    mk('chase_ball', 'Chase ball'),
    mk('if_have_ball', 'If I have the ball then'),
    mk('dribble', 'Dribble'),
    mk('short_pass', 'Short pass'),
    mk('if_ball_far', 'If ball is far then'),
    mk('long_pass', 'Long pass'),
    mk('if_shooting_range', 'If in shooting range then'),
    mk('shoot', 'Shoot'),
    mk('celebrate', 'Celebrate'),
    mk('move_to_position', 'Move to spot', { x: 5, z: 0 }),
    mk('face_ball', 'Face ball'),
  ],
  football_penalties: [
    mk('forever', 'Forever (penalty loop)'),
    mk('repeat', 'Repeat 5 penalties', { times: 5 }),
    mk('if_shooting_range', 'If in shooting range then'),
    mk('shoot', 'Penalty shot'),
    mk('wait', 'Wait', { seconds: 0.4 }),
    mk('celebrate', 'Celebrate'),
    mk('move_to_position', 'Reset spot', { x: 0, z: -8 }),
    mk('face_ball', 'Face goal'),
  ],
  football_free_kick: [
    mk('forever', 'Forever (free kick loop)'),
    mk('move_to_position', 'Stand at ball', { x: 0, z: -6 }),
    mk('lob_pass', 'Lob over the wall'),
    mk('wait', 'Wait', { seconds: 0.5 }),
    mk('if_shooting_range', 'If in shooting range then'),
    mk('shoot', 'Curve into corner'),
    mk('celebrate', 'Celebrate'),
  ],
  football_keeper: [
    mk('forever', 'Forever (keeper loop)'),
    mk('guard_goal', 'Guard goal'),
    mk('if_ball_close', 'If ball is close then'),
    mk('dive_save', 'Dive save'),
    mk('if_shooting_range', 'If shot incoming then'),
    mk('clear_ball', 'Clear ball'),
    mk('face_ball', 'Face ball'),
    mk('move_to_position', 'Hold line', { x: -14, z: 0 }),
    mk('if_ball_close', 'If rebound then'),
    mk('dive_save', 'Second save'),
    mk('guard_goal', 'Guard again'),
  ],
  football_arcade: [
    mk('forever', 'Forever (speed match)'),
    mk('chase_ball', 'Chase ball'),
    mk('if_have_ball', 'If I have the ball then'),
    mk('dribble', 'Dribble fast'),
    mk('if_shooting_range', 'If in shooting range then'),
    mk('shoot', 'Shoot fast'),
    mk('chase_ball', 'Chase loose ball'),
    mk('shoot', 'Shoot again'),
  ],
  football_street: [
    mk('forever', 'Forever (street match)'),
    mk('chase_ball', 'Chase ball'),
    mk('if_have_ball', 'If I have the ball then'),
    mk('dribble', 'Dribble past defender'),
    mk('if_ball_close', 'If defender close then'),
    mk('dribble', 'Skill move'),
    mk('if_shooting_range', 'If in shooting range then'),
    mk('shoot', 'Shoot'),
    mk('celebrate', 'Celebrate'),
  ],
  football_championship: EXPERT_FOOTBALL_ROLE.striker,
  football_cup_final: EXPERT_FOOTBALL_ROLE.striker,
};

const FIGHTING_COURSE_EXPERT = {
  fight_training: [
    mk('forever', 'Forever (training loop)'),
    mk('repeat', 'Repeat 5 hits', { times: 5 }),
    mk('jab', 'Jab'),
    mk('cross', 'Cross'),
    mk('if_under_attack', 'If under attack then'),
    mk('block', 'Block'),
    mk('dodge', 'Dodge'),
    mk('repeat', 'Repeat combo', { times: 3 }),
    mk('hook', 'Hook'),
    mk('if_enemy_close', 'If enemy close then'),
    mk('light_kick', 'Light Kick'),
  ],
  fight_sparring: [
    mk('forever', 'Forever (fight loop)'),
    mk('check_distance', 'Check distance'),
    mk('if_enemy_far', 'If enemy far then'),
    mk('advance_step', 'Advance step'),
    mk('advance_step', 'Close distance'),
    mk('if_enemy_close', 'If enemy close then'),
    mk('jab', 'Jab'),
    mk('cross', 'Cross'),
    mk('hook', 'Hook'),
    mk('if_under_attack', 'If under attack then'),
    mk('block', 'Block'),
    mk('dodge', 'Dodge'),
    mk('if_enemy_close', 'If still close then'),
    mk('roundhouse', 'Roundhouse Kick'),
  ],
  fight_championship: [
    mk('forever', 'Forever (bout loop)'),
    mk('if_under_attack', 'If under attack then'),
    mk('block', 'Block — save stamina'),
    mk('defend', 'Defend stance'),
    mk('wait', 'Wait', { seconds: 0.5 }),
    mk('if_enemy_close', 'If enemy close then'),
    mk('jab', 'Jab'),
    mk('cross', 'Cross'),
    mk('hook', 'Hook'),
    mk('if_under_attack', 'If rival counters then'),
    mk('dodge', 'Dodge'),
    mk('if_enemy_close', 'If close again then'),
    mk('heavy_kick', 'Heavy Kick — round 3'),
    mk('use_special', 'Special finisher'),
  ],
  fight_boss: [
    mk('forever', 'Forever (boss fight)'),
    mk('if_under_attack', 'If under attack then'),
    mk('block', 'Block'),
    mk('parry', 'Parry'),
    mk('dodge', 'Dodge'),
    mk('if_health_low', 'If health low then'),
    mk('retreat_step', 'Retreat'),
    mk('defend', 'Defend'),
    mk('if_enemy_far', 'If boss far then'),
    mk('advance_step', 'Advance'),
    mk('if_enemy_close', 'If boss close then'),
    mk('combo_3hit', 'Jab → Cross → Hook'),
    mk('use_special', 'Use special'),
    mk('heavy_kick', 'Heavy Kick'),
    mk('if_under_attack', 'If boss winds up then'),
    mk('block', 'Block big hit'),
    mk('roundhouse', 'Roundhouse finisher'),
  ],
  fight_survival: [
    mk('forever', 'Forever (survival loop)'),
    mk('if_under_attack', 'If under attack then'),
    mk('block', 'Block'),
    mk('if_enemy_close', 'If enemy close then'),
    mk('jab', 'Jab'),
    mk('if_health_low', 'If health low then'),
    mk('retreat_step', 'Retreat'),
    mk('defend', 'Defend'),
    mk('advance_step', 'Advance when safe'),
  ],
  fight_final_gauntlet: EXPERT_FIGHTING,
};

const ROBOT_CODE_TIPS = {
  rover: 'Ground robots use Move and Turn blocks. Follow the path — cars cannot jump!',
  tank: 'Heavy bots need wide turns. Use repeat loops for patrol routes.',
  drone: 'Flying bots use altitude blocks — watch height on aerial courses.',
  racedrone: 'Racing drones need smooth turns and boost pads on straights.',
  jet: 'Jets are fastest on straights — lower speed before sharp turns.',
  hover: 'Hover bots strafe and boost — balance speed with control.',
  spider: 'Climbing bots use jump and grip — time your moves on vertical tracks.',
  humanoid: 'Walkers use step blocks — sequence moves for temple and stair missions.',
  factory: 'Factory arms need precise timing — use WAIT between pick and place.',
  factorybot: 'Sync with conveyor belts using loops and wait blocks.',
  underwater: 'Submarines move in 3D — watch depth sensors on reef courses.',
  medbot: 'Route to patients first — IF blocks help pick the safest path.',
  firebot: 'Navigate hazards with sensors — branch with IF when fire is detected.',
  security: 'Patrol loops plus IF enemy detected — stealth uses WAIT in shadows.',
  birdbot: 'Press Simulate, then SPACE to flap. Keep a steady rhythm!',
  striker: 'When START → attack blocks. Add Block when the rival winds up.',
  footballbot: 'Each role tab is a different player — Simulate runs all three scripts.',
  blaster: 'Mix ranged attacks with IF enemy close for combos.',
  ninja: 'Speed combos — dodge then counter when the enemy misses.',
  berserker: 'Heavy hits break guards — chain power attacks after blocks.',
  miningbot: 'Repeat dig-and-haul loops — watch battery on long hauls.',
};

const GAME_TYPE_TIPS = {
  racing: 'Hit every checkpoint gate. Use SET SPEED before corners, BOOST on straights.',
  combat: 'Chain attacks in a Forever loop. Block or dodge when the rival attacks.',
  football: 'Forever loop: chase → if have ball → pass or shoot. Defenders guard the goal.',
  flappy: 'When spacebar → Flap. Small taps beat holding flap too long.',
  puzzle: 'Use IF/ELSE with sensors — match colors, switches, or door states.',
  platformer: 'Jump gaps with timing — repeat move + jump sequences.',
  defense: 'Patrol in a loop, then IF enemy detected → respond.',
  adventure: 'Read sensors and branch — do not only move forward in a straight line.',
  mission: 'Break the goal into steps: sequence first, then add loops and sensors.',
  line_follow: 'IF off line → TURN toward line. Slow before curves, fast on straights.',
  stealth: 'WAIT in shadow zones — sprint only when patrol gaps open.',
  aerial: 'Hover steady, then burst through ring gates.',
  exploration: 'Visit checkpoints in order — REPEAT for long routes.',
  rescue: 'Route to victims first — IF blocks pick the safest path.',
  simulation: 'Sync with conveyor timing — loops keep factory rhythm steady.',
};

function pickBlockForMechanic(mechanic, robotType) {
  const rt = robotType || 'rover';
  const group = getRobotGroup(rt);

  const direct = {
    when_start: mk('when_start', 'When START clicked'),
    spacebar: mk('when_spacebar', 'When spacebar clicked'),
    when_spacebar: mk('when_spacebar', 'When spacebar clicked'),
    forever: mk('forever', 'Forever (main loop)'),
    repeat: mk('repeat', 'Repeat', { times: 3 }),
    wait: mk('wait', 'Wait', { seconds: 0.5 }),
    if_then: mk('if_then', 'If condition then'),
    if_else: mk('if_else', 'If / else'),
    set_speed: mk('set_speed', 'Set speed', { speed: 60 }),
    boost: mk('boost', 'Boost', { seconds: 1.2 }),
    move_forward: ROBOT_MOVE[rt] || ROBOT_MOVE.rover,
    move: ROBOT_MOVE[rt] || ROBOT_MOVE.rover,
    turn_left: ROBOT_TURN[rt] || mk('turn_left', 'Turn left', { degrees: 90 }),
    turn_right: mk('turn_right', 'Turn right', { degrees: 90 }),
    turn: ROBOT_TURN[rt] || mk('turn_left', 'Turn left', { degrees: 90 }),
    chase_ball: mk('chase_ball', 'Chase ball'),
    shoot: mk('shoot', 'Shoot'),
    pass: mk('short_pass', 'Short pass'),
    short_pass: mk('short_pass', 'Short pass'),
    long_pass: mk('long_pass', 'Long pass'),
    dribble: mk('dribble', 'Dribble toward goal'),
    guard_goal: mk('guard_goal', 'Guard goal'),
    clear_ball: mk('clear_ball', 'Clear ball'),
    dive_save: mk('dive_save', 'Dive save'),
    celebrate: mk('celebrate', 'Celebrate'),
    face_ball: mk('face_ball', 'Face ball'),
    move_to_position: mk('move_to_position', 'Move to position', { x: 0, z: 0 }),
    flap: mk('flap', 'Flap!'),
    light_punch: mk('jab', 'Jab'),
    light_kick: mk('light_kick', 'Light Kick'),
    jab: mk('jab', 'Jab'),
    cross: mk('cross', 'Cross'),
    hook: mk('hook', 'Hook'),
    block: mk('block', 'Block'),
    dodge: mk('dodge', 'Dodge'),
    advance_step: mk('advance_step', 'Advance step'),
    retreat_step: mk('retreat_step', 'Retreat step'),
    defend: mk('defend', 'Defend stance'),
    attack: group === 'fighter' ? mk('jab', 'Jab') : mk('attack_light', 'Attack'),
    patrol: mk('repeat', 'Patrol loop', { times: 4 }),
    scan: mk('detect_enemy', 'Detect enemy'),
    navigate: ROBOT_MOVE[rt] || ROBOT_MOVE.rover,
    jump: mk('jump', 'Jump'),
    stop: mk('brake', 'Brake'),
    variables: mk('set_speed', 'Set speed', { speed: 50 }),
    sensors: mk('if_then', 'If sensor triggered then'),
    if_color: mk('if_then', 'If color matches then'),
    custom_blocks: mk('repeat', 'Repeat', { times: 3 }),
    distance_sensor: mk('if_then', 'If obstacle close then'),
    when_sensor: mk('if_then', 'If sensor triggered then'),
    line_below: mk('if_then', 'If line not detected then'),
    if_ball_close: mk('if_ball_close', 'If ball is close then'),
    if_ball_far: mk('if_ball_far', 'If ball is far then'),
    if_have_ball: mk('if_have_ball', 'If I have the ball then'),
    if_shooting_range: mk('if_shooting_range', 'If in shooting range then'),
    if_enemy_close: mk('if_enemy_close', 'If enemy close then'),
    if_enemy_far: mk('if_enemy_far', 'If enemy far then'),
    if_under_attack: mk('if_under_attack', 'If under attack then'),
    if_health_low: mk('if_health_low', 'If health low then'),
  };

  if (direct[mechanic]) return { ...direct[mechanic] };
  if (BLOCK_CODE_EXPLAIN[mechanic]) return mk(mechanic, mechanic.replace(/_/g, ' '));
  return mk(mechanic, mechanic.replace(/_/g, ' '));
}

function parseCodeHintToBlocks(codeHint, robotType) {
  if (!codeHint) return [];
  const parts = codeHint.split(/→|->|—|,/).map((s) => s.trim().toLowerCase());
  const blocks = [];
  const seen = new Set();

  for (const part of parts) {
    for (const [phrase, mechanic] of HINT_PHRASE_TO_MECHANIC) {
      if (part.includes(phrase)) {
        const block = pickBlockForMechanic(mechanic, robotType);
        if (!seen.has(block.id)) {
          seen.add(block.id);
          blocks.push(block);
        }
        break;
      }
    }
  }
  return blocks;
}

function blocksFromZoneSuggestions(course, robotType) {
  if (!course?.zones?.length) return [];
  const ids = [...new Set(
    course.zones.flatMap((z) => (z.suggestedBlocks || []).map((b) => ZONE_BLOCK_MAP[b] || b.replace('robot_', ''))),
  )];
  return ids.map((id) => pickBlockForMechanic(id, robotType));
}

function interleaveMechanics(mechanics, robotType) {
  const blocks = [];
  const seen = new Set();
  const add = (block) => {
    if (!block || seen.has(`${block.id}:${block.label}`)) return;
    seen.add(`${block.id}:${block.label}`);
    blocks.push(block);
  };

  const ifMechs = mechanics.filter((m) => m.startsWith('if') || m.includes('if_'));
  const actMechs = mechanics.filter((m) => !m.startsWith('if') && !['when_start', 'spacebar', 'when_spacebar'].includes(m));

  for (const m of ifMechs) {
    add(pickBlockForMechanic(m, robotType));
    const follow = RELATED_ACTION[m];
    if (follow) add(pickBlockForMechanic(follow, robotType));
  }
  for (const m of actMechs) {
    add(pickBlockForMechanic(m, robotType));
  }
  return blocks;
}

function cloneScript(script) {
  return (script || []).map((b) => ({
    id: b.id,
    label: b.label,
    icon: b.icon,
    paramValues: { ...(b.paramValues || {}) },
  }));
}

function stripEventHat(script) {
  return (script || []).filter((b) => b.id !== 'when_start' && b.id !== 'when_spacebar');
}

function wrapWithEvent(script, eventId = 'when_start') {
  if (!script?.length) return [];
  if (script[0]?.id === 'when_spacebar' || script[0]?.id === 'when_start') return cloneScript(script);
  return [pickBlockForMechanic(eventId === 'when_spacebar' ? 'spacebar' : 'when_start', 'rover'), ...cloneScript(script)];
}

function buildSimpleFromScript(expert, eventBlock, maxBody = 3) {
  const body = stripEventHat(expert);
  if (eventBlock === 'when_spacebar') {
    return expert.length <= 2 ? cloneScript(expert) : cloneScript([expert[0], ...body.slice(0, 2)]);
  }
  return wrapWithEvent(body.slice(0, maxBody), eventBlock);
}

function buildProFromScript(expert, ratio = 0.48) {
  if (!expert?.length) return [];
  const eventIdx = expert[0]?.id === 'when_start' || expert[0]?.id === 'when_spacebar' ? 1 : 0;
  let mid = Math.max(eventIdx + 3, Math.ceil(expert.length * ratio));
  if (expert.length >= 4 && mid >= expert.length) mid = expert.length - 1;
  return cloneScript(expert.slice(0, mid));
}

function getTierLabels(gameType, cupManual = false) {
  if (cupManual) {
    return {
      advanced: 'Pro — half the lap bends',
      expert: 'Expert — full lap with boosts & speed',
    };
  }
  switch (gameType) {
    case 'racing':
      return { advanced: 'Pro — half the lap', expert: 'Expert — complex full lap script' };
    case 'combat':
      return { advanced: 'Pro — loops & combos', expert: 'Expert — full fight AI' };
    case 'football':
      return { advanced: 'Pro — match logic', expert: 'Expert — full player script' };
    case 'action':
      return { advanced: 'Pro — auto-flap loop', expert: 'Expert — rhythm fly script' };
    case 'line_follow':
      return { advanced: 'Pro — sensor branches', expert: 'Expert — full line-follow script' };
    default:
      return { advanced: 'Pro — loops & IF blocks', expert: 'Expert — complete solution' };
  }
}

function buildZoneHints(course, robotType, eventBlock = 'when_start') {
  if (!course?.zones?.length) return [];
  return course.zones.map((zone, i) => {
    const rawBlocks = [];
    for (const sb of zone.suggestedBlocks || []) {
      const id = ZONE_BLOCK_MAP[sb] || sb.replace('robot_', '');
      rawBlocks.push(pickBlockForMechanic(id, robotType));
    }
    for (const b of parseCodeHintToBlocks(zone.mechanic, robotType)) rawBlocks.push(b);
    const script = wrapWithEvent(rawBlocks.slice(0, 8), eventBlock);
    const steps = describeStarterScript(script, eventBlock);
    const blockTip = (zone.suggestedBlocks || []).map((b) => b.replace('robot_', '')).join(', ');
    return {
      num: zone.num || i + 1,
      name: zone.name || zone.story?.split('.')[0] || `Zone ${zone.num || i + 1}`,
      mechanic: zone.mechanic,
      tip: blockTip || zone.phaseMeta?.label,
      steps,
    };
  }).filter((z) => z.steps.length > 0 || z.mechanic);
}

function buildScriptsFromCourse(course, logic, robotType) {
  const mechanics = [
    ...(logic?.requiredMechanics || course.requiredMechanics || []),
    ...(course.programmingConcepts || logic?.programmingConcepts || []).flatMap((c) => CONCEPT_TO_MECHANICS[c] || []),
  ];
  const zoneBlocks = blocksFromZoneSuggestions(course, robotType);
  const uniqueMechs = [...new Set(mechanics)];

  const simple = interleaveMechanics(uniqueMechs.slice(0, 3), robotType);
  if (simple.length < 2) {
    simple.push(ROBOT_MOVE[robotType] || ROBOT_MOVE.rover);
  }

  const advanced = [
    mk('forever', 'Forever (main loop)'),
    ...interleaveMechanics(uniqueMechs, robotType),
  ];

  const expert = [
    mk('forever', 'Forever (main loop)'),
    ...interleaveMechanics(uniqueMechs, robotType),
    ...zoneBlocks,
    mk('wait', 'Wait', { seconds: 0.3 }),
    ...interleaveMechanics(uniqueMechs.slice(0, 4), robotType),
  ];

  return { simple, advanced, expert };
}

function buildExpertFromAllZones(course, robotType) {
  if (!course?.zones?.length) return [];
  const blocks = [];
  const seen = new Set();
  const add = (block) => {
    if (!block || seen.has(`${block.id}:${block.label}`)) return;
    seen.add(`${block.id}:${block.label}`);
    blocks.push(block);
  };

  for (const zone of course.zones) {
    for (const sb of zone.suggestedBlocks || []) {
      const id = ZONE_BLOCK_MAP[sb] || sb.replace('robot_', '');
      add(pickBlockForMechanic(id, robotType));
    }
    for (const b of parseCodeHintToBlocks(zone.mechanic, robotType)) add(b);
  }
  return blocks;
}

function detectLapCount(course, logic) {
  const text = `${course.winCondition || ''} ${course.codeHint || ''} ${logic?.codeHint || ''}`.toLowerCase();
  if (text.includes('3 lap')) return 3;
  if (text.includes('2 lap')) return 2;
  return 1;
}

/** Expand a lap guide into a long, realistic racing program. */
function buildRacingExpertScript(fullLap, course, logic) {
  const body = cloneScript(stripEventHat(fullLap));
  const laps = detectLapCount(course, logic);
  const out = [
    mk('set_speed', 'Set speed 65%', { speed: 65 }),
    mk('boost', 'Boost off the line', { seconds: 1.2 }),
    mk('move_forward_continuous', 'Keep driving'),
  ];

  if (laps > 1) {
    out.push(mk('repeat', `Repeat ${laps} laps`, { times: laps }));
  }

  for (const block of body) {
    const deg = block.paramValues?.degrees;
    if ((block.id === 'curve_left' || block.id === 'curve_right') && deg >= 45) {
      out.push(mk('set_speed', 'Slow for corner', { speed: 42 }));
    }
    out.push({ ...block });
    if (block.id === 'move_forward' && (block.paramValues?.steps ?? 0) >= 6) {
      out.push(mk('boost', 'Boost on straight', { seconds: 1.0 }));
    }
  }

  out.push(mk('set_speed', 'Sprint finish 80%', { speed: 80 }));
  out.push(mk('boost', 'Final straight boost', { seconds: 1.3 }));

  const hat = fullLap[0]?.id === 'when_start'
    ? fullLap[0]
    : mk('when_start', 'When race starts');
  return [hat, ...out];
}

/** Pad expert scripts with extra mechanics, waits, and IF branches until suitably complex. */
function enrichExpertScript(base, course, logic, robotType, opts) {
  if (!base?.length) return base;

  const eventBlock = base[0]?.id === 'when_spacebar' ? 'when_spacebar' : 'when_start';
  let body = cloneScript(stripEventHat(base));
  const minBlocks = opts.isRacing ? 16 : opts.isFighting ? 14 : opts.isFootball ? 12 : 10;

  if (body.length >= minBlocks + 4) {
    return cloneScript(base);
  }

  const mechanics = [
    ...(logic?.requiredMechanics || course.requiredMechanics || []),
    ...(course.programmingConcepts || logic?.programmingConcepts || []).flatMap((c) => CONCEPT_TO_MECHANICS[c] || []),
  ];
  const parsed = parseCodeHintToBlocks(course.codeHint || logic?.codeHint, robotType);
  const zoneBlocks = buildExpertFromAllZones(course, robotType);

  const extras = [
    ...interleaveMechanics([...new Set(mechanics)], robotType),
    ...parsed,
    ...zoneBlocks,
    mk('wait', 'Wait', { seconds: 0.25 }),
    ...interleaveMechanics(mechanics, robotType),
    mk('wait', 'Wait', { seconds: 0.15 }),
  ];

  const seen = new Set(body.map((b) => `${b.id}:${b.label}`));
  for (const block of extras) {
    const key = `${block.id}:${block.label}`;
    if (!seen.has(key)) {
      seen.add(key);
      body.push({ ...block });
    }
    if (body.length >= minBlocks + 6) break;
  }

  if (!opts.isRacing && !opts.isFlappy && !body.some((b) => b.id === 'forever')) {
    body = [mk('forever', 'Forever (main loop)'), ...body];
  }

  if (eventBlock === 'when_spacebar') {
    return cloneScript([base[0], ...body]);
  }
  return wrapWithEvent(body, 'when_start');
}

/** Full solved script for Expert tier — uses course-specific guides, never a short workspace stub. */
function resolveFullExpertScript(course, logic, robotType, opts) {
  const {
    arenaType = '',
    starterScript,
    multiRobotFootball,
    activeFootballRole,
    isFlappy,
    isFighting,
    isFootball,
    isRacing,
  } = opts;

  const courseKey = course.id || '';
  const arena = arenaType || course.arenaType || '';

  if (multiRobotFootball && activeFootballRole) {
    return enrichExpertScript(
      wrapWithEvent(EXPERT_FOOTBALL_ROLE[activeFootballRole] || EXPERT_FOOTBALL_ROLE.striker),
      course, logic, robotType, opts,
    );
  }

  if (isRacing) {
    const fullLap = getRaceTrackGuideScript(arena, courseKey);
    if (fullLap?.length >= 4) {
      const base = buildRacingExpertScript(fullLap, course, logic);
      return enrichExpertScript(base, course, logic, robotType, opts);
    }
  }

  if (isFighting) {
    const courseScript = FIGHTING_COURSE_EXPERT[courseKey];
    const base = courseScript
      ? wrapWithEvent(courseScript)
      : wrapWithEvent([
        ...cloneScript(stripEventHat(FIGHTING_STARTER_SCRIPT)),
        ...parseCodeHintToBlocks(course.codeHint || logic?.codeHint, robotType),
        ...interleaveMechanics(logic?.requiredMechanics || [], robotType),
        mk('combo_3hit', 'Jab → Cross → Hook'),
        mk('use_special', 'Use special'),
      ]);
    return enrichExpertScript(base, course, logic, robotType, opts);
  }

  if (isFootball) {
    const courseScript = FOOTBALL_COURSE_EXPERT[courseKey];
    const base = courseScript
      ? wrapWithEvent(cloneScript(courseScript))
      : wrapWithEvent([
        mk('forever', 'Forever (match loop)'),
        ...parseCodeHintToBlocks(course.codeHint || logic?.codeHint, robotType),
        ...interleaveMechanics(logic?.requiredMechanics || [], robotType),
        ...cloneScript(stripEventHat(FOOTBALL_STARTER_SCRIPT)),
      ]);
    return enrichExpertScript(base, course, logic, robotType, opts);
  }

  if (isFlappy) {
    return enrichExpertScript(cloneScript([
      mk('when_spacebar', 'When spacebar clicked'),
      mk('forever', 'Forever (auto-fly loop)'),
      mk('flap', 'Flap!'),
      mk('wait', 'Wait', { seconds: 0.12 }),
      mk('flap', 'Flap again'),
      mk('wait', 'Wait', { seconds: 0.18 }),
      mk('flap', 'Flap (rhythm)'),
      mk('wait', 'Wait', { seconds: 0.15 }),
      mk('flap', 'Flap through gap'),
      mk('wait', 'Wait', { seconds: 0.2 }),
      mk('flap', 'Flap hold'),
    ]), course, logic, robotType, opts);
  }

  const zoneBlocks = buildExpertFromAllZones(course, robotType);
  if (zoneBlocks.length >= 5) {
    return enrichExpertScript(
      wrapWithEvent([mk('forever', 'Forever (mission loop)'), ...zoneBlocks]),
      course, logic, robotType, opts,
    );
  }

  const body = stripEventHat(starterScript || []);
  if (body.length >= 8) {
    return enrichExpertScript(cloneScript(starterScript), course, logic, robotType, opts);
  }

  const parsedHint = parseCodeHintToBlocks(course.codeHint || logic?.codeHint, robotType);
  const mechanics = [
    ...(logic?.requiredMechanics || course.requiredMechanics || []),
    ...(course.programmingConcepts || logic?.programmingConcepts || []).flatMap((c) => CONCEPT_TO_MECHANICS[c] || []),
  ];
  const uniqueMechs = [...new Set(mechanics)];

  return enrichExpertScript(wrapWithEvent([
    mk('forever', 'Forever (main loop)'),
    ...parsedHint,
    ...interleaveMechanics(uniqueMechs, robotType),
    ...zoneBlocks,
    mk('if_then', 'If sensor triggered then'),
    mk('wait', 'Wait', { seconds: 0.3 }),
    ...interleaveMechanics(uniqueMechs, robotType),
    mk('repeat', 'Repeat patrol', { times: 3 }),
    mk('wait', 'Wait', { seconds: 0.2 }),
  ]), course, logic, robotType, opts);
}

function isCupSectionBlock(block) {
  return ['move_forward', 'curve_left', 'curve_right', 'turn_corner_left', 'turn_corner_right'].includes(block?.id);
}

/** Easy → pro → expert scripts for cup tracks where students code each bend manually. */
function resolveCupManualTiers(course, logic, arena, courseKey) {
  const fullLap = getRaceTrackGuideScript(arena, courseKey);
  if (!fullLap?.length) return null;

  const body = stripEventHat(fullLap);
  const sections = body.filter(isCupSectionBlock);
  if (!sections.length) return null;

  const openStarter = stripEventHat(CUP_OPEN_STARTER);
  const simpleBody = [
    ...openStarter,
    sections[0],
  ].filter(Boolean);

  const half = Math.max(2, Math.ceil(sections.length / 2));
  const proBody = [
    mk('set_speed', 'Set speed', { speed: 60 }),
    ...sections.slice(0, half),
  ];

  const expert = buildRacingExpertScript(fullLap, course, logic);

  return {
    simple: wrapWithEvent(simpleBody),
    advanced: wrapWithEvent(proBody),
    expert,
    eventBlock: 'when_start',
  };
}

function resolveScriptTiers(course, logic, robotType, opts) {
  const {
    multiRobotFootball,
    activeFootballRole,
    starterScript,
    arenaType = '',
    isRacing = false,
  } = opts;

  const courseKey = course.id || '';
  const arena = arenaType || course.arenaType || '';

  if (isRacing && isCupManualTrack(arena, courseKey)) {
    const cupTiers = resolveCupManualTiers(course, logic, arena, courseKey);
    if (cupTiers) return cupTiers;
  }

  const expert = resolveFullExpertScript(course, logic, robotType, opts);
  const eventBlock = expert[0]?.id === 'when_spacebar' ? 'when_spacebar' : 'when_start';
  const parsedHint = parseCodeHintToBlocks(course.codeHint || logic?.codeHint, robotType);

  if (multiRobotFootball && activeFootballRole) {
    return {
      simple: buildSimpleFromScript(expert, eventBlock, 2),
      advanced: cloneScript(FOOTBALL_ROLE_STARTERS[activeFootballRole] || FOOTBALL_STARTER_SCRIPT),
      expert,
      eventBlock,
    };
  }

  let simple = parsedHint.length >= 2
    ? buildSimpleFromScript(wrapWithEvent(parsedHint, eventBlock), eventBlock, 3)
    : buildSimpleFromScript(expert, eventBlock, 3);

  if (stripEventHat(simple).length < 2) {
    simple = buildSimpleFromScript(expert, eventBlock, 3);
  }

  let advanced;
  if (isFightingCourseScript(course, opts)) {
    advanced = cloneScript(FIGHTING_STARTER_SCRIPT);
  } else if (stripEventHat(starterScript || []).length > 4) {
    advanced = buildProFromScript(expert, 0.5);
  } else {
    advanced = buildProFromScript(expert, 0.52);
  }

  if (stripEventHat(advanced).length < 3) {
    advanced = buildProFromScript(expert, 0.45);
  }

  return { simple, advanced, expert, eventBlock };
}

function isFightingCourseScript(course, opts) {
  return opts.isFighting && FIGHTING_STARTER_SCRIPT?.length > 0;
}

function buildRobotCourseTip(course, logic, robotType, gameType) {
  const base = ROBOT_CODE_TIPS[robotType] || ROBOT_CODE_TIPS.rover;
  const group = getRobotGroup(robotType);
  const tips = [];

  if (course.chassisId && course.chassisId !== robotType) {
    tips.push(`Designed for ${course.chassisId} — your ${robotType} uses ${group} blocks here.`);
  }
  if (gameType === 'aerial' && group === 'wheeled') {
    tips.push('Aerial course — drones/jets handle altitude better than ground bots.');
  }
  if (gameType === 'line_follow' && group === 'aerial') {
    tips.push('Line follow needs ground sensors — try a rover or tank.');
  }
  if ((logic?.requiredMechanics || []).includes('flap') && robotType !== 'birdbot') {
    tips.push('This course teaches FLAP — BirdBot is the best match.');
  }
  if (course.codingConcept) {
    tips.push(course.codingConcept);
  }
  if (course.zones?.length) {
    const zoneBlocks = [...new Set(course.zones.flatMap((z) => (z.suggestedBlocks || []).map((b) => b.replace('robot_', ''))))];
    if (zoneBlocks.length) tips.push(`Zones use: ${zoneBlocks.slice(0, 5).join(', ')}.`);
  }
  const lastZone = course.zones?.[course.zones.length - 1];
  if (lastZone?.mechanic) {
    tips.push(`Final zone: ${lastZone.mechanic}`);
  }

  return tips.length ? `${base} ${tips.join(' ')}` : base;
}

function isCupManualTrack(arenaType, courseKey) {
  return !!(CUP_TRACK_SCRIPTS[arenaType] || CUP_TRACK_SCRIPTS[courseKey]);
}

export { isCupManualTrack };

function describeRacingBlock(block) {
  const p = block.paramValues || {};
  const id = block.id;
  if (id === 'set_speed') return `Set speed to ${p.speed ?? 60}% — use ~45% before hairpins`;
  if (id === 'boost') return `Boost for ${p.seconds ?? 1}s on the straight after the corner`;
  if (id === 'move_forward') return `Move forward ${p.steps ?? 3} steps down the straight`;
  if (id === 'curve_left') return `Curve left ${p.degrees ?? 45}° over ${p.steps ?? 6} steps — follow the minimap bend`;
  if (id === 'curve_right') return `Curve right ${p.degrees ?? 45}° over ${p.steps ?? 6} steps — follow the minimap bend`;
  if (id === 'turn_corner_left') return 'Turn corner left — sharp 90° left';
  if (id === 'turn_corner_right') return 'Turn corner right — sharp 90° right';
  return block.label || id.replace(/_/g, ' ');
}

/** Per-section coding guide for cup tracks — manual curve/corner blocks. */
export function buildRacingSectionHints(arenaType, courseKey) {
  const guide = getRaceTrackGuideScript(arenaType, courseKey);
  const body = stripEventHat(guide).filter((b) => b.id !== 'move_forward_continuous');
  if (!body.length) return [];
  return body.map((block, i) => ({
    num: i + 1,
    name: block.label || `Section ${i + 1}`,
    blockId: block.id,
    instruction: describeRacingBlock(block),
    explain: BLOCK_CODE_EXPLAIN[block.id] || `Add "${block.label}" from the Racing or Track tab.`,
    paramValues: { ...(block.paramValues || {}) },
  }));
}

function buildTierNote(tier, course, logic, gameType) {
  const name = course.shortName || course.name || 'this mission';
  const mechanics = (logic?.requiredMechanics || []).slice(0, 4).map((m) => m.replace(/_/g, ' ')).join(', ');
  const concepts = (logic?.programmingConcepts || course.programmingConcepts || []).slice(0, 2).join(' + ');

  if (tier === 'simple') {
    if (gameType === 'racing' && isCupManualTrack(course.arenaType, course.id)) {
      return `${name}: set speed, keep driving, then add the first straight or curve from the minimap.`;
    }
    return mechanics
      ? `${name}: start with ${mechanics}.`
      : `Learn the basics for ${name} first.`;
  }
  if (tier === 'advanced') {
    if (gameType === 'racing' && isCupManualTrack(course.arenaType, course.id)) {
      return `${name}: code the first half of the lap — each minimap bend gets a Move forward or Curve block.`;
    }
    const hint = (course.codeHint || logic?.codeHint || '').split(/[.!]/)[0];
    return hint || `${name}: add Forever loops and IF blocks (${mechanics}).`;
  }
  if (tier === 'expert') {
    if (gameType === 'racing') {
      if (isCupManualTrack(course.arenaType, course.id)) {
        return `${name} — full lap: every bend, speed changes before hairpins, boosts on straights.`;
      }
      return `${name} — full complex lap: speed changes, boosts, corners, and lap repeats.`;
    }
    if (gameType === 'combat') return `${name} — deep fight AI: block, dodge, combos, specials, and health logic.`;
    if (gameType === 'football') return `${name} — advanced match script with passes, positioning, and multiple IF branches.`;
    if (gameType === 'action') return `${name} — steady flap rhythm to fly through obstacles.`;
    return concepts
      ? `${name} expert — combines ${concepts} with full ${gameType} logic.`
      : `${name} expert — every block needed to beat this course.`;
  }
  return concepts
    ? `${name} expert — combines ${concepts} with full ${gameType} logic.`
    : `${name} expert — long script with every mechanic for this course.`;
}

const LOOP_IDS = new Set(['forever', 'repeat']);
const IF_PREFIX = /^if_/;

function isIfBlock(id) {
  return IF_PREFIX.test(id) || id === 'if_then' || id === 'if_else';
}

function formatBlockLabel(block) {
  let label = block.label || block.id;
  const p = block.paramValues || {};
  if (block.id === 'set_speed' && p.speed != null) label += ` (${p.speed}%)`;
  if (block.id === 'boost' && p.seconds != null) label += ` (${p.seconds}s)`;
  if (block.id === 'move_forward' && p.steps != null) label += ` (${p.steps} steps)`;
  if ((block.id === 'curve_left' || block.id === 'curve_right') && p.degrees != null) {
    label += ` (${p.degrees}°, ${p.steps ?? '?'} steps)`;
  }
  if (block.id === 'move_to_position' && (p.x != null || p.z != null)) {
    label += ` (X=${p.x ?? 0}, Z=${p.z ?? 0})`;
  }
  if (block.id === 'wait' && p.seconds != null) label += ` (${p.seconds}s)`;
  if (block.id === 'repeat' && p.times != null) label += ` (${p.times}×)`;
  return label;
}

function describeStarterScript(script = [], eventBlock = 'when_start') {
  if (!script?.length) return [];
  let depth = 0;
  let loopDepth = 0;
  const steps = [];

  for (const block of script) {
    if (block.id === 'when_start' || block.id === 'when_spacebar') continue;

    const isLoop = LOOP_IDS.has(block.id);
    const isIf = isIfBlock(block.id);

    if (isLoop) {
      steps.push({
        label: formatBlockLabel(block),
        explain: BLOCK_CODE_EXPLAIN[block.id] || `Runs "${block.label || block.id}" during the simulation.`,
        indent: depth,
        kind: 'loop',
      });
      loopDepth = depth + 1;
      depth = loopDepth;
      continue;
    }

    if (isIf) {
      if (depth > loopDepth) depth = loopDepth;
      steps.push({
        label: formatBlockLabel(block),
        explain: BLOCK_CODE_EXPLAIN[block.id] || `Branch when "${block.label || block.id}" is true.`,
        indent: depth,
        kind: 'condition',
      });
      depth += 1;
      continue;
    }

    steps.push({
      label: formatBlockLabel(block),
      explain: BLOCK_CODE_EXPLAIN[block.id] || `Runs "${block.label || block.id}" during the simulation.`,
      indent: depth,
      kind: 'action',
    });
    if (depth > loopDepth) depth -= 1;
  }

  return steps;
}

/**
 * Build hint bundle for the code panel — derived from each course + robot.
 */
export function resolveCourseCodeHints(course, options = {}) {
  if (!course) return null;

  const {
    robotType = 'rover',
    arenaType = '',
    multiRobotFootball = false,
    activeFootballRole = 'striker',
    isFlappy = false,
    isFighting = false,
    isFootball = false,
    isRacing = false,
    starterScript = null,
  } = options;

  const logic = getGameLogicForCourse(course.id) || buildChassisModeGameLogic(course);
  const objectives = resolveCourseObjectives(course);
  const gameType = course.gameType || logic?.gameType || 'mission';
  const courseArena = arenaType || course.arenaType || '';
  const courseMerged = { ...course, arenaType: courseArena };

  const scriptOpts = {
    arenaType,
    multiRobotFootball,
    activeFootballRole,
    isFlappy,
    isFighting,
    isFootball,
    isRacing,
    starterScript,
  };

  const tiers = resolveScriptTiers(courseMerged, logic, robotType, scriptOpts);
  const eventBlock = tiers.eventBlock || 'when_start';
  const eventLabel = eventBlock === 'when_spacebar' ? 'When spacebar clicked' : 'When START clicked';

  const simpleSteps = describeStarterScript(tiers.simple, eventBlock);
  const advancedSteps = describeStarterScript(tiers.advanced, eventBlock);
  const expertSteps = describeStarterScript(tiers.expert, eventBlock);

  const mechanics = (logic?.requiredMechanics || course.requiredMechanics || [])
    .map((id) => {
      const block = pickBlockForMechanic(id, robotType);
      return {
        id: block.id,
        label: block.label || id.replace(/_/g, ' '),
        explain: BLOCK_CODE_EXPLAIN[block.id] || BLOCK_CODE_EXPLAIN[id],
      };
    })
    .filter((m) => m.explain);

  const concepts = course.programmingConcepts || logic?.programmingConcepts || [];
  const cupManual = isRacing && isCupManualTrack(courseArena, courseMerged.id || '');
  const tierLabels = getTierLabels(gameType, cupManual);
  const racingSections = isRacing ? buildRacingSectionHints(courseArena, courseMerged.id || '') : [];
  const codeHint = cupManual
    ? 'Tap Code hints above — Easy starts with Set speed + Keep driving; Pro adds half the bends; Expert shows the full lap with boosts and speed changes. Pick blocks from Track and Racing tabs.'
    : (courseMerged.codeHint || logic?.codeHint || GAME_TYPE_TIPS[gameType] || GAME_TYPE_TIPS.mission);
  const zoneHints = buildZoneHints(courseMerged, robotType, eventBlock);

  return {
    courseName: courseMerged.shortName || courseMerged.name || 'Mission',
    gameType,
    winCondition: courseMerged.winCondition || logic?.winCondition || courseMerged.desc,
    codeHint,
    objectives: objectives.slice(0, 5),
    simpleSteps,
    advancedSteps,
    expertSteps,
    eventBlock,
    eventLabel,
    tierLabels,
    zoneHints,
    racingSections,
    racingManual: cupManual,
    expertBlockCount: expertSteps.length + 1,
    simpleNote: buildTierNote('simple', courseMerged, logic, gameType),
    advancedNote: buildTierNote('advanced', courseMerged, logic, gameType),
    expertNote: buildTierNote('expert', courseMerged, logic, gameType),
    hasAdvanced: advancedSteps.length > 0 && expertSteps.length > advancedSteps.length,
    hasExpert: expertSteps.length >= 3,
    tierScripts: {
      simple: cloneScript(tiers.simple),
      advanced: cloneScript(tiers.advanced),
      expert: cloneScript(tiers.expert),
    },
    keyBlocks: mechanics.slice(0, 6),
    programmingConcepts: concepts.slice(0, 4),
    robotTip: buildRobotCourseTip(courseMerged, logic, robotType, gameType),
    minBlocks: logic?.minBlocks,
  };
}
