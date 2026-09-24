/**
 * game-missions.js — Full game-creation mission catalog
 *
 * Each mission = a complete miniature game (10 zones: 9 build + 1 remix)
 * NOT short coding exercises — players build playable game systems.
 */

export const GAME_GENRES = {
  racing:      { id: 'racing',      label: 'Racing Game',        icon: '🏎️', color: '#ff0080' },
  adventure:   { id: 'adventure',   label: 'Adventure',          icon: '🗺️', color: '#22c55e' },
  puzzle:      { id: 'puzzle',      label: 'Puzzle Game',        icon: '🧩', color: '#a855f7' },
  defense:     { id: 'defense',     label: 'Tower Defense',      icon: '🛡️', color: '#ef4444' },
  platformer:  { id: 'platformer',  label: 'Platformer',         icon: '🍄', color: '#f97316' },
  stealth:     { id: 'stealth',     label: 'Stealth Escape',     icon: '👁', color: '#64748b' },
  simulation:  { id: 'simulation',  label: 'Simulation',         icon: '⚙️', color: '#3b82f6' },
};

export const ZONE_PHASES = {
  intro:           { label: 'Story Intro',       icon: '📖' },
  first_system:    { label: 'First System',      icon: '🔧' },
  interaction:     { label: 'Interaction',       icon: '👆' },
  expansion:       { label: 'System Expansion',  icon: '📈' },
  mini_challenge:  { label: 'Mini Challenge',    icon: '⚡' },
  new_mechanic:    { label: 'New Mechanic',      icon: '🆕' },
  complex_system:  { label: 'Complex System',    icon: '🔗' },
  advanced:        { label: 'Advanced Challenge',icon: '🎯' },
  boss:            { label: 'Boss System',       icon: '👑' },
  create:          { label: 'Create Your Game',  icon: '🎨' },
};

/** Zone template factory */
function z(num, phase, name, story, mechanic, systems = [], blocks = [], sandbox = false) {
  return {
    num,
    phase,
    name,
    story,
    mechanic,
    systemsIntroduced: systems,
    suggestedBlocks: blocks,
    codingRequired: phase !== 'intro' && !sandbox,
    isSandbox: sandbox,
    phaseMeta: ZONE_PHASES[phase] || ZONE_PHASES.intro,
  };
}

export const GAME_MISSIONS = [
  // ─────────────────────────────────────────────────────────────────────────
  // ADVENTURE — Fox Battery Chase
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'fox_battery_chase',
    name: 'Fox Battery Chase',
    tagline: 'Rebuild the forest power system',
    genre: 'adventure',
    icon: '🦊',
    color: '#4ade80',
    arenaType: 'jungle',
    estMinutes: 23,
    totalDist: 56,
    timeLimit: 1380,
    isFoxChase: true,
    rec: ['rover', 'tank', 'spider', 'humanoid'],
    finalOutcome: 'A full adventure game with triggers, gates, variables & a fox chase finale',
    systemsBuilt: ['movement', 'triggers', 'gates', 'variables', 'timers', 'events', 'branching_paths'],
    medals: {
      bronze: { label: 'Reach the Power Shrine', check: (s) => (s.progress || 0) >= 100 },
      silver: { label: 'Collect 5 forest items', target: 5, check: (s) => (s.collected || 0) >= 5 },
      gold: { label: 'Finish in under 10 minutes', target: 600, check: (s) => (s.progress || 0) >= 100 && (s.time || Infinity) < 600 },
    },
    zones: [
      z(1, 'intro', 'Forest Awakens', 'A fox stole the magical battery powering the forest. You must rebuild the system zone by zone.', 'Watch the world — no coding yet. Explore the meadow entrance.', [], []),
      z(2, 'first_system', 'First Movement', 'Your robot needs to move! Build the core locomotion system.', 'WHEN START → MOVE → TURN LEFT at the log (cars drive AROUND obstacles, not over them!)', ['movement'], ['robot_when_start', 'robot_move_forward', 'robot_turn_left']),
      z(3, 'interaction', 'Paw Print Triggers', 'Glowing paw prints react when your robot passes over them.', 'Use sensors or move blocks to trigger paw prints — cause & effect!', ['movement', 'triggers'], ['robot_move_forward', 'robot_obstacle_ahead']),
      z(4, 'expansion', 'River Gate System', 'Combine movement + events to open the root gate at the river.', 'Add an IF block: when near gate → open path. Two systems working together.', ['movement', 'triggers', 'gates'], ['robot_if', 'robot_move_forward']),
      z(5, 'mini_challenge', 'Falling Log Logic', 'Logs fall on a timer — build avoidance logic.', 'Combine movement + wait + turn to dodge falling hazards.', ['movement', 'triggers', 'gates', 'timing'], ['robot_wait', 'robot_turn_left']),
      z(6, 'new_mechanic', 'Battery Variable', 'Introduce a BATTERY ENERGY variable that drains as you move.', 'Create a variable, decrement on move, recharge at energy pads.', ['movement', 'triggers', 'variables'], ['robot_set_variable', 'robot_move_forward']),
      z(7, 'complex_system', 'Power Restoration', 'Restore partial power — combine variables, triggers & movement.', 'Chain: move → trigger pad → add energy → open next zone gate.', ['movement', 'triggers', 'variables', 'gates'], ['robot_if', 'robot_set_variable']),
      z(8, 'advanced', 'Path Choice Puzzle', 'Three paths — only one leads forward. Build branching logic.', 'Use IF/ELSE to choose paths based on sensor readings.', ['movement', 'variables', 'branching'], ['robot_if', 'robot_else']),
      z(9, 'boss', 'Fox Chase Sequence', 'The fox runs! Build a timed chase system to catch it before the shrine locks.', 'Combine loops, speed control, and timer blocks for the finale.', ['movement', 'variables', 'timers', 'loops'], ['robot_repeat', 'robot_set_speed']),
      z(10, 'create', 'Create Your Forest Game', 'YOU are the designer now. Remix everything!', 'Redesign paths, add obstacles, change rules, place new triggers. Build YOUR version of the forest escape game.', ['movement', 'triggers', 'variables', 'gates', 'timers', 'events'], [], true),
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // RACING — Sunny Circuit (beginner wheeled)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'sunny_circuit',
    name: 'Candy Kingdom Grand Prix',
    tagline: 'Beginner adventure through cookie villages, chocolate rivers, and donut tunnels!',
    genre: 'racing',
    icon: '🍭',
    color: '#ff88cc',
    arenaType: 'sunny_circuit',
    estMinutes: 12,
    totalDist: 30,
    timeLimit: 600,
    laps: 1,
    checkpoints: 4,
    rec: ['rover', 'tank'],
    finalOutcome: 'A cheerful oval circuit with guardrails, 4 checkpoint gates, and boost pads',
    systemsBuilt: ['movement', 'turning', 'checkpoints', 'boosts'],
    medals: {
      bronze: { label: 'Finish the race', check: (s) => !!s.raceWon },
      silver: { label: 'Finish in under 45 seconds', target: 45, check: (s) => !!s.raceWon && (s.raceTotalTime || Infinity) < 45 },
      gold: { label: 'Finish in under 35 seconds', target: 35, check: (s) => !!s.raceWon && (s.raceTotalTime || Infinity) < 35 },
    },
    objectives: [
      { id: 'finish',      icon: '🏁', label: 'Finish the race',         target: 1, get: (s) => s.raceWon ? 1 : 0 },
      { id: 'checkpoints', icon: '🎯', label: 'Pass all 4 gates',        target: 4, get: (s) => Math.min(s.raceTotalCheckpoints ?? 0, 4) },
      { id: 'boosts',      icon: '⚡', label: 'Hit 4 boost pads',        target: 4, get: (s) => Math.min(s.raceBoostPadsHit ?? 0, 4) },
      { id: 'stars',       icon: '⭐', label: 'Collect 3 stars',         target: 3, get: (s) => Math.min(s.raceStarsCollected ?? 0, 3) },
    ],
    zones: [
      z(1, 'intro', 'Starting Grid', 'The sun shines over a wide red track. Full guardrails keep you safe — your first race starts here!', 'Walk the oval — notice the chicanes and boost pads before you code.', [], []),
      z(2, 'first_system', 'First Move', 'Race cars need a start routine. Build yours: move forward off the grid.', 'WHEN START → MOVE FORWARD. Simple and fast!', ['movement'], ['robot_when_start', 'robot_move_forward']),
      z(3, 'interaction', 'Checkpoint Gates', 'Green arches mark checkpoints. Drive through all 4 in order to finish!', 'MOVE through each gate, then TURN toward the next.', ['movement', 'checkpoints'], ['robot_move_forward', 'robot_turn_left', 'robot_turn_right']),
      z(4, 'expansion', 'Chicane Corner', 'The S-curve needs a precise turn. Slow down, turn, then speed up.', 'TURN LEFT then TURN RIGHT through the chicane.', ['movement', 'turning'], ['robot_turn_left', 'robot_turn_right']),
      z(5, 'mini_challenge', 'Boost Pads', 'Yellow boost pads give a speed burst — drive over them on the straights!', 'MOVE FORWARD over every boost pad you see.', ['movement', 'boosts'], ['robot_move_forward', 'robot_boost']),
      z(6, 'new_mechanic', 'Flower Bridge', 'The track crosses a flower bridge — keep moving and don\'t drift wide!', 'Stay on the racing line through the bridge section.', ['movement', 'turning'], ['robot_move_forward', 'robot_turn_left']),
      z(7, 'complex_system', 'Full Lap', 'Combine MOVE and TURN for one complete lap through all 4 gates.', 'One program that drives the entire oval.', ['movement', 'checkpoints', 'turning'], ['robot_move_forward', 'robot_turn_left', 'robot_repeat']),
      z(8, 'advanced', 'Speed Run', 'Beat 45 seconds! Use boost pads and tight turns.', 'Optimize your path — every second counts.', ['movement', 'boosts', 'timers'], ['robot_set_speed', 'robot_boost']),
      z(9, 'boss', 'Sunny Circuit Finish', 'Complete 1 lap, all 4 checkpoints, cross the checkered line!', 'Full lap program from grid to finish.', ['checkpoints', 'scoring'], ['robot_move_forward', 'robot_turn_left']),
      z(10, 'create', 'Design Your Sunny Track', 'Remix the circuit — add more laps or move the boost pads!', 'Change the rules and build your own sunny race.', ['movement', 'checkpoints', 'boosts'], [], true),
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // RACING — Rainbow Road (expert wheeled)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'street_grand_prix',
    name: 'Rainbow Road',
    tagline: 'Expert 3-lap space race on a glowing rainbow ribbon — 8 checkpoints, no barriers, don\'t fall!',
    genre: 'racing',
    icon: '🌈',
    color: '#cc44ff',
    arenaType: 'rainbow_road',
    estMinutes: 22,
    totalDist: 50,
    timeLimit: 1080,
    laps: 3,
    checkpoints: 8,
    rec: ['rover', 'tank'],
    finalOutcome: 'A full 3-lap racing circuit — checkpoint gates, lap counter, boost pads & lap timing',
    systemsBuilt: ['movement', 'speed_control', 'turning', 'checkpoints', 'laps', 'scoring', 'boosts'],
    medals: {
      bronze: { label: 'Finish the race', check: (s) => !!s.raceWon },
      silver: { label: 'Collect 10 stars', target: 10, check: (s) => (s.raceStarsCollected || 0) >= 10 },
      gold: { label: 'Finish in under 90 seconds', target: 90, check: (s) => !!s.raceWon && (s.raceTotalTime || Infinity) < 90 },
    },
    objectives: [
      { id: 'finish',      icon: '🏁', label: 'Complete all 3 laps',     target: 1, get: (s) => s.raceWon ? 1 : 0 },
      { id: 'checkpoints', icon: '🎯', label: 'Pass 8 checkpoint gates',  target: 8, get: (s) => Math.min(s.raceTotalCheckpoints ?? 0, 8) },
      { id: 'boosts',      icon: '⚡', label: 'Hit 6 boost pads',         target: 6, get: (s) => Math.min(s.raceBoostPadsHit ?? 0, 6) },
      { id: 'stars',       icon: '⭐', label: 'Collect 5 stars',          target: 5, get: (s) => Math.min(s.raceStarsCollected ?? 0, 5) },
    ],
    zones: [
      z(1, 'intro', 'Starting Grid', 'The rainbow ribbon stretches into space. Your car sits on the grid — three laps, eight checkpoint gates per lap, boost pads on straights. One wrong turn and you fall into the void.', 'Study the spiral, bridge, and hairpins before you code.', [], []),
      z(2, 'first_system', 'Ignition Sequence', 'Race cars don\'t just go — they launch. Build your start routine: speed, then drive.', 'WHEN START → SET SPEED 70% → MOVE FORWARD off the grid. Feel the wheels grip!', ['movement', 'speed_control'], ['robot_when_start', 'robot_set_speed', 'robot_move_forward']),
      z(3, 'interaction', 'Checkpoint Gates', 'Each glowing green arch is a checkpoint. Drive through them in order — miss one and the lap doesn\'t count!', 'MOVE through the first gate arch, then TURN toward the next. Gates flash when you pass.', ['movement', 'checkpoints'], ['robot_move_forward', 'robot_turn_left', 'robot_turn_right']),
      z(4, 'expansion', 'Racing Line', 'The yellow line marks the ideal path. Follow it through corners for the fastest lap.', 'TURN to follow the painted line — slow before corners, accelerate on exit.', ['movement', 'turning', 'checkpoints'], ['robot_turn_left', 'robot_turn_right', 'robot_move_forward']),
      z(5, 'mini_challenge', 'Boost Straight', 'Cyan boost pads on corner exits give a speed burst — but you must slow before the hairpin!', 'SET SPEED 100% on the straight, then SET SPEED 40% + TURN before the corner.', ['speed_control', 'turning', 'boosts'], ['robot_set_speed', 'robot_boost', 'robot_brake']),
      z(6, 'new_mechanic', 'Lap Counter', 'Introduce a LAP variable. The race is 3 laps — track how many times you cross the start line.', 'Use REPEAT 3 with your lap routine inside, or increment a variable each finish-line crossing.', ['laps', 'variables', 'loops'], ['robot_repeat', 'robot_var_set', 'robot_var_change']),
      z(7, 'complex_system', 'Kerb Awareness', 'Red-and-white kerbs mark track edges. IF you drift wide → TURN back toward the racing line.', 'IF obstacle ahead → TURN away. Tank bots can use TANK STEER for tight corners!', ['obstacle_avoid', 'if_then', 'turning'], ['robot_if_then', 'robot_obstacle_ahead', 'robot_tank_steer']),
      z(8, 'advanced', 'Championship Lap', 'Combine everything: speed control, gates, racing line, boosts, and lap counting in one clean run.', 'One program that does a full lap — then REPEAT it 3 times with lap scoring.', ['laps', 'checkpoints', 'scoring', 'boosts'], ['robot_repeat', 'robot_set_speed', 'robot_navigate_checkpoint']),
      z(9, 'boss', 'Rainbow Road Finale', 'Three laps. All 8 checkpoints each lap. Don\'t fall off. Beat 90 seconds!', 'Full race program: 3 laps × 8 gates + boost pads on every straight.', ['laps', 'timers', 'scoring', 'checkpoints'], ['robot_repeat', 'robot_set_speed', 'robot_boost']),
      z(10, 'create', 'Design Your Circuit', 'YOU are the race director! Change lap count, move boost pads, set your own time target.', 'Remix the circuit — more laps, tighter lines, or time-attack mode.', ['movement', 'speed_control', 'checkpoints', 'laps', 'scoring', 'boosts'], [], true),
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // RACING — Dragon Skyway (intermediate wheeled fantasy)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'dragon_skyway',
    name: 'Dragon Skyway',
    tagline: 'Intermediate 2-lap fantasy race through a floating kingdom — 6 checkpoints, don\'t fall off!',
    genre: 'racing',
    icon: '🐉',
    color: '#ff8866',
    arenaType: 'dragon_skyway',
    estMinutes: 16,
    totalDist: 36,
    timeLimit: 720,
    laps: 2,
    checkpoints: 6,
    rec: ['rover', 'tank'],
    finalOutcome: 'A full 2-lap floating-kingdom circuit — checkpoint gates, lap counter, boost pads & lap timing',
    systemsBuilt: ['movement', 'speed_control', 'turning', 'checkpoints', 'laps', 'scoring', 'boosts'],
    medals: {
      bronze: { label: 'Finish the race', check: (s) => !!s.raceWon },
      silver: { label: 'Finish in under 75 seconds', target: 75, check: (s) => !!s.raceWon && (s.raceTotalTime || Infinity) < 75 },
      gold: { label: 'Finish in under 60 seconds', target: 60, check: (s) => !!s.raceWon && (s.raceTotalTime || Infinity) < 60 },
    },
    objectives: [
      { id: 'finish',      icon: '🏁', label: 'Complete 2 laps',         target: 1, get: (s) => s.raceWon ? 1 : 0 },
      { id: 'checkpoints', icon: '🎯', label: 'Pass 6 checkpoint gates',  target: 6, get: (s) => Math.min(s.raceTotalCheckpoints ?? 0, 6) },
      { id: 'boosts',      icon: '⚡', label: 'Hit 5 boost pads',         target: 5, get: (s) => Math.min(s.raceBoostPadsHit ?? 0, 5) },
      { id: 'stars',       icon: '⭐', label: 'Collect 3 stars',          target: 3, get: (s) => Math.min(s.raceStarsCollected ?? 0, 3) },
    ],
    zones: [
      z(1, 'intro', 'Cloud Launch', 'The floating kingdom stretches into the clouds. Your car sits on the skyway road — two laps, six checkpoint gates, dragons watching from above.', 'Study the floating loop and the castle bends before you code.', [], []),
      z(2, 'first_system', 'Ignition Sequence', 'Race cars don\'t just go — they launch. Build your start routine: speed, then drive.', 'WHEN START → SET SPEED 60% → MOVE FORWARD off the grid. Watch the clouds below!', ['movement', 'speed_control'], ['robot_when_start', 'robot_set_speed', 'robot_move_forward']),
      z(3, 'interaction', 'Checkpoint Gates', 'Each glowing arch is a checkpoint. Drive through them in order — miss one and the lap doesn\'t count!', 'MOVE through the first gate arch, then TURN toward the next. Gates flash when you pass.', ['movement', 'checkpoints'], ['robot_move_forward', 'robot_turn_left', 'robot_turn_right']),
      z(4, 'expansion', 'Skyway Line', 'The safe line winds past dragon nests and crystal trees. Follow it through corners for the fastest lap.', 'TURN to follow the safe line — slow before corners, accelerate on exit.', ['movement', 'turning', 'checkpoints'], ['robot_turn_left', 'robot_turn_right', 'robot_move_forward']),
      z(5, 'mini_challenge', 'Waterfall Straight', 'Rainbow waterfall boost pads on the straights give a speed burst — but you must slow before the hairpin!', 'SET SPEED 100% on the straight, then SET SPEED 40% + TURN before the corner.', ['speed_control', 'turning', 'boosts'], ['robot_set_speed', 'robot_boost', 'robot_brake']),
      z(6, 'new_mechanic', 'Lap Counter', 'Introduce a LAP variable. The race is 2 laps — track how many times you cross the start line.', 'Use REPEAT 2 with your lap routine inside, or increment a variable each finish-line crossing.', ['laps', 'variables', 'loops'], ['robot_repeat', 'robot_var_set', 'robot_var_change']),
      z(7, 'complex_system', 'Cloud Awareness', 'Fall off the floating road and you tumble into the clouds below. IF you drift wide → TURN back toward the safe line.', 'IF obstacle ahead → TURN away. Tank bots can use TANK STEER for tight corners!', ['obstacle_avoid', 'if_then', 'turning'], ['robot_if_then', 'robot_obstacle_ahead', 'robot_tank_steer']),
      z(8, 'advanced', 'Dragon\'s Pass', 'Combine everything: speed control, gates, the safe line, and lap counting in one clean run.', 'One program that does a full lap — then REPEAT it 2 times with lap scoring.', ['laps', 'checkpoints', 'scoring', 'boosts'], ['robot_repeat', 'robot_set_speed', 'robot_navigate_checkpoint']),
      z(9, 'boss', 'Skyway Finale', 'Two laps. All 6 checkpoints each lap. Don\'t fall off. Beat 75 seconds!', 'Full race program: 2 laps × 6 gates + boost pads on every straight.', ['laps', 'timers', 'scoring', 'checkpoints'], ['robot_repeat', 'robot_set_speed', 'robot_boost']),
      z(10, 'create', 'Design Your Kingdom', 'YOU are the race director! Change lap count, move boost pads, set your own time target.', 'Remix the circuit — more laps, tighter lines, or time-attack mode.', ['movement', 'speed_control', 'checkpoints', 'laps', 'scoring', 'boosts'], [], true),
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // RACING — Volcano Drift (intermediate wheeled)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'volcano_drift',
    name: 'Volcano Drift',
    tagline: 'Intermediate 2-lap crater race — 6 checkpoints, lava pools, obsidian spires, fire geysers!',
    genre: 'racing',
    icon: '🌋',
    color: '#ff5500',
    arenaType: 'volcano_drift',
    estMinutes: 16,
    totalDist: 36,
    timeLimit: 720,
    laps: 2,
    checkpoints: 6,
    rec: ['rover', 'tank'],
    finalOutcome: 'A full 2-lap crater circuit — checkpoint gates, lap counter, power-ups, boost pads & lap timing',
    systemsBuilt: ['movement', 'speed_control', 'turning', 'checkpoints', 'laps', 'scoring', 'boosts', 'powerups'],
    medals: {
      bronze: { label: 'Finish the race', check: (s) => !!s.raceWon },
      silver: { label: 'Collect 8 stars', target: 8, check: (s) => (s.raceStarsCollected || 0) >= 8 },
      gold: { label: 'Finish in under 60 seconds', target: 60, check: (s) => !!s.raceWon && (s.raceTotalTime || Infinity) < 60 },
    },
    objectives: [
      { id: 'finish',      icon: '🏁', label: 'Complete 2 laps',         target: 1, get: (s) => s.raceWon ? 1 : 0 },
      { id: 'checkpoints', icon: '🎯', label: 'Pass 6 checkpoint gates',  target: 6, get: (s) => Math.min(s.raceTotalCheckpoints ?? 0, 6) },
      { id: 'boosts',      icon: '⚡', label: 'Hit 5 boost pads',         target: 5, get: (s) => Math.min(s.raceBoostPadsHit ?? 0, 5) },
      { id: 'stars',       icon: '⭐', label: 'Collect 5 stars',          target: 5, get: (s) => Math.min(s.raceStarsCollected ?? 0, 5) },
    ],
    zones: [
      z(1, 'intro', 'Crater Pass', 'The volcano rumbles overhead. Your car sits on the crater road — two laps, six checkpoint gates, lava pools on the inside of every turn.', 'Study the crater loop and the obsidian gate before you code.', [], []),
      z(2, 'first_system', 'Ignition Sequence', 'Race cars don\'t just go — they launch. Build your start routine: speed, then drive.', 'WHEN START → SET SPEED 65% → MOVE FORWARD off the grid. Feel the heat!', ['movement', 'speed_control'], ['robot_when_start', 'robot_set_speed', 'robot_move_forward']),
      z(3, 'interaction', 'Checkpoint Gates', 'Each glowing arch is a checkpoint. Drive through them in order — miss one and the lap doesn\'t count!', 'MOVE through the first gate arch, then TURN toward the next. Gates flash when you pass.', ['movement', 'checkpoints'], ['robot_move_forward', 'robot_turn_left', 'robot_turn_right']),
      z(4, 'expansion', 'Crater Line', 'The safe line snakes around the rim, away from the lava pools. Follow it through corners for the fastest lap.', 'TURN to follow the safe line — slow before corners, accelerate on exit.', ['movement', 'turning', 'checkpoints'], ['robot_turn_left', 'robot_turn_right', 'robot_move_forward']),
      z(5, 'mini_challenge', 'Geyser Straight', 'Fire geysers erupt on the straights — boost pads give you a speed burst, but slow before the hairpin!', 'SET SPEED 100% on the straight, then SET SPEED 40% + TURN before the corner.', ['speed_control', 'turning', 'boosts'], ['robot_set_speed', 'robot_boost', 'robot_brake']),
      z(6, 'new_mechanic', 'Lap Counter', 'Introduce a LAP variable. The race is 2 laps — track how many times you cross the start line.', 'Use REPEAT 2 with your lap routine inside, or increment a variable each finish-line crossing.', ['laps', 'variables', 'loops'], ['robot_repeat', 'robot_var_set', 'robot_var_change']),
      z(7, 'complex_system', 'Magma Awareness', 'Glowing lava marks the crater edge. IF you drift wide → TURN back toward the safe line.', 'IF obstacle ahead → TURN away. Tank bots can use TANK STEER for tight corners!', ['obstacle_avoid', 'if_then', 'turning'], ['robot_if_then', 'robot_obstacle_ahead', 'robot_tank_steer']),
      z(8, 'advanced', 'Power-Up Pass', 'Combine everything: speed control, gates, the safe line, boosts, and grab a shield or star power-up along the way.', 'One program that does a full lap — then REPEAT it 2 times with lap scoring.', ['laps', 'checkpoints', 'scoring', 'boosts', 'powerups'], ['robot_repeat', 'robot_set_speed', 'robot_navigate_checkpoint']),
      z(9, 'boss', 'Eruption Finale', 'Two laps. All 6 checkpoints each lap. Don\'t fall in the lava. Beat 60 seconds!', 'Full race program: 2 laps × 6 gates + boost pads on every straight.', ['laps', 'timers', 'scoring', 'checkpoints'], ['robot_repeat', 'robot_set_speed', 'robot_boost']),
      z(10, 'create', 'Design Your Crater', 'YOU are the race director! Change lap count, move boost pads, set your own time target.', 'Remix the circuit — more laps, tighter lines, or time-attack mode.', ['movement', 'speed_control', 'checkpoints', 'laps', 'scoring', 'boosts'], [], true),
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // RACING — Sky Racers (hover / aerial)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'sky_racers',
    name: 'Sky Racers',
    tagline: 'Build your own racing game',
    genre: 'racing',
    icon: '🏎️',
    color: '#ff0080',
    arenaType: 'neon_race',
    estMinutes: 20,
    totalDist: 50,
    timeLimit: 900,
    rec: ['hover', 'racedrone', 'drone', 'jet', 'aerial'],
    finalOutcome: 'A playable race game with laps, checkpoints, boosts & coin scoring',
    systemsBuilt: ['movement', 'speed_control', 'checkpoints', 'laps', 'timers', 'scoring'],
    medals: {
      bronze: { label: 'Complete the circuit', check: (s) => (s.progress || 0) >= 100 },
      silver: { label: 'Finish in under 8 minutes', target: 480, check: (s) => (s.progress || 0) >= 100 && (s.time || Infinity) < 480 },
      gold: { label: 'Finish in under 6 minutes', target: 360, check: (s) => (s.progress || 0) >= 100 && (s.time || Infinity) < 360 },
    },
    zones: [
      z(1, 'intro', 'Starting Grid', 'Welcome to the Neon Racing Championship. Tonight you BUILD the race, not just drive it.', 'Explore the track layout — study the racing line.', [], []),
      z(2, 'first_system', 'Acceleration Engine', 'Every racing game starts with speed control.', 'WHEN START → SET SPEED → MOVE FORWARD. Your acceleration system.', ['movement', 'speed_control'], ['robot_when_start', 'robot_set_speed', 'robot_move_forward']),
      z(3, 'interaction', 'Checkpoint Triggers', 'Checkpoints register when you cross them.', 'Drive through glowing gates — each one fires an event.', ['movement', 'speed_control', 'checkpoints'], ['robot_move_forward']),
      z(4, 'expansion', 'Boost Pad System', 'Hit boost pads for speed bursts — combine speed + movement.', 'SET SPEED high on straights, lower in turns.', ['movement', 'speed_control', 'checkpoints', 'boosts'], ['robot_set_speed', 'robot_if']),
      z(5, 'mini_challenge', 'Hairpin Turn', 'Build smooth turning without crashing.', 'TURN blocks + speed reduction before corners.', ['movement', 'speed_control', 'turning'], ['robot_turn_left', 'robot_set_speed']),
      z(6, 'new_mechanic', 'Lap Counter', 'Introduce a LAP variable — count how many times you complete the circuit.', 'Use variables + loops to track laps.', ['speed_control', 'checkpoints', 'variables', 'laps'], ['robot_set_variable', 'robot_repeat']),
      z(7, 'complex_system', 'Coin Scoring', 'Collect coins for points — build a scoring system.', 'Combine movement + collection events + score variable.', ['checkpoints', 'variables', 'scoring'], ['robot_set_variable']),
      z(8, 'advanced', 'Drift Zone', 'Master the drift hairpin — multiple solutions possible.', 'Experiment with speed curves and turn timing.', ['speed_control', 'turning', 'scoring'], ['robot_set_speed', 'robot_turn_right']),
      z(9, 'boss', 'Championship Lap', 'Beat the clock on a full circuit — all systems combined.', 'Laps + checkpoints + boosts + scoring in one run.', ['laps', 'timers', 'scoring', 'boosts'], ['robot_repeat', 'robot_set_speed']),
      z(10, 'create', 'Design Your Race', 'Build your custom race course logic!', 'Add hazards, redesign boost placement, change lap count, create your own rules.', ['movement', 'speed_control', 'checkpoints', 'laps', 'scoring', 'boosts'], [], true),
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PUZZLE — Crystal Logic Dungeon
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'crystal_logic_dungeon',
    name: 'Crystal Logic Dungeon',
    tagline: 'Build a puzzle dungeon from logic gates',
    genre: 'puzzle',
    icon: '💎',
    color: '#a855f7',
    arenaType: 'cavern',
    estMinutes: 22,
    totalDist: 48,
    timeLimit: 1320,
    rec: ['spider', 'humanoid', 'rover'],
    finalOutcome: 'A fully functional puzzle dungeon with doors, switches & color matching',
    systemsBuilt: ['movement', 'switches', 'doors', 'if_else', 'state', 'sequences'],
    medals: {
      bronze: { label: 'Reach the dungeon throne', check: (s) => (s.progress || 0) >= 100 },
      silver: { label: 'Collect 5 crystals', target: 5, check: (s) => (s.collected || 0) >= 5 },
      gold: { label: 'Finish in under 9 minutes', target: 540, check: (s) => (s.progress || 0) >= 100 && (s.time || Infinity) < 540 },
    },
    zones: [
      z(1, 'intro', 'Dungeon Entrance', 'Ancient crystals guard a logic dungeon. You will BUILD the puzzle systems that open each chamber.', 'Walk the entrance — observe the crystal colors and door positions.', [], []),
      z(2, 'first_system', 'Basic Movement', 'Navigate stone corridors with code.', 'WHEN START → MOVE blocks to explore.', ['movement'], ['robot_when_start', 'robot_move_forward']),
      z(3, 'interaction', 'Crystal Switches', 'Step on crystals to activate switches — first cause & effect.', 'Move onto glowing pads to trigger door events.', ['movement', 'switches'], ['robot_move_forward']),
      z(4, 'expansion', 'Door Logic', 'Combine switch triggers with IF blocks to open doors.', 'IF switch active → move through door.', ['movement', 'switches', 'doors'], ['robot_if', 'robot_move_forward']),
      z(5, 'mini_challenge', 'Color Match Puzzle', 'Match crystal colors to open the correct door.', 'Use IF/ELSE with color detection logic.', ['switches', 'doors', 'if_else'], ['robot_if', 'robot_else']),
      z(6, 'new_mechanic', 'State Variables', 'Track which switches are ON with a state variable.', 'Create SWITCH_STATE variable — update on trigger.', ['switches', 'variables', 'state'], ['robot_set_variable']),
      z(7, 'complex_system', 'Sequence Puzzle', 'Activate switches in the correct ORDER.', 'Build a sequence checker with variables + IF blocks.', ['state', 'sequences', 'doors'], ['robot_if', 'robot_set_variable']),
      z(8, 'advanced', 'Multi-Door Maze', 'Three doors, one path — logic determines the route.', 'Combine all previous systems — multiple solutions exist.', ['state', 'sequences', 'if_else'], ['robot_if', 'robot_else']),
      z(9, 'boss', 'Crystal Chamber Boss', 'Final chamber — all logic gates must align to reach the throne.', 'Full logic chain: switches → state → sequence → door → exit.', ['state', 'sequences', 'doors', 'if_else'], ['robot_if', 'robot_repeat']),
      z(10, 'create', 'Design Your Puzzle Room', 'Create your own puzzle dungeon!', 'Place switches, design sequences, set door rules, remix difficulty.', ['switches', 'doors', 'state', 'sequences', 'if_else'], [], true),
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DEFENSE — Robo Defense
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'robo_defense',
    name: 'Robo Defense',
    tagline: 'Build a tower defense game',
    genre: 'defense',
    icon: '🛡️',
    color: '#ef4444',
    arenaType: 'combat',
    estMinutes: 20,
    totalDist: 40,
    timeLimit: 1200,
    rec: ['tank', 'security', 'factory'],
    finalOutcome: 'Tower defense with enemy waves, pathing & trigger towers',
    systemsBuilt: ['movement', 'detection', 'triggers', 'waves', 'timers'],
    medals: {
      bronze: { label: 'Survive all enemy waves', check: (s) => (s.progress || 0) >= 100 },
      silver: { label: 'Take zero hits', check: (s) => (s.progress || 0) >= 100 && (s.collisions || 0) === 0 },
      gold: { label: 'Clear the grid in under 8 minutes', target: 480, check: (s) => (s.progress || 0) >= 100 && (s.time || Infinity) < 480 },
    },
    zones: [
      z(1, 'intro', 'Defense Grid Online', 'Enemy bots approach from the north. You will BUILD the defense systems.', 'Survey the arena — note enemy spawn points and your base.', [], []),
      z(2, 'first_system', 'Patrol Movement', 'Build a patrol route for your defense bot.', 'WHEN START → PATROL or MOVE blocks.', ['movement', 'patrol'], ['robot_when_start', 'robot_patrol_area']),
      z(3, 'interaction', 'Detection Zones', 'Scan zones trigger when enemies enter range.', 'Use SCAN or OBSTACLE AHEAD to detect threats.', ['movement', 'detection'], ['robot_scan', 'robot_obstacle_ahead']),
      z(4, 'expansion', 'Attack Triggers', 'When enemy detected → fire response.', 'IF enemy detected → TURN + MOVE toward threat.', ['detection', 'triggers'], ['robot_if', 'robot_turn_left']),
      z(5, 'mini_challenge', 'First Wave', 'Survive wave 1 — combine patrol + detection + response.', 'Build a loop: patrol → scan → respond.', ['detection', 'triggers', 'loops'], ['robot_repeat', 'robot_if']),
      z(6, 'new_mechanic', 'Wave Timer', 'Enemies spawn on a timer — build wave system.', 'Use WAIT + variables to count waves.', ['waves', 'timers', 'variables'], ['robot_wait', 'robot_set_variable']),
      z(7, 'complex_system', 'Multi-Tower Logic', 'Two defense positions — switch between them.', 'IF wave > 3 → move to position B.', ['waves', 'triggers', 'if_else'], ['robot_if', 'robot_move_forward']),
      z(8, 'advanced', 'Pathing Puzzle', 'Enemies take different paths — adapt your logic.', 'Multiple IF branches for different enemy routes.', ['detection', 'if_else', 'pathing'], ['robot_if', 'robot_else']),
      z(9, 'boss', 'Boss Wave', 'Massive final wave — all defense systems required.', 'Full loop: detect → respond → count wave → adapt.', ['waves', 'detection', 'triggers', 'loops'], ['robot_repeat', 'robot_if']),
      z(10, 'create', 'Design Your Defense', 'Create your own tower defense rules!', 'Change wave timing, add towers, modify enemy paths.', ['waves', 'detection', 'triggers', 'timers'], [], true),
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PLATFORMER — Jump World
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'jump_world',
    name: 'Jump World',
    tagline: 'Build a Mario-style platformer',
    genre: 'platformer',
    icon: '🍄',
    color: '#f97316',
    arenaType: 'temple',
    estMinutes: 18,
    totalDist: 42,
    timeLimit: 1080,
    rec: ['humanoid', 'spider', 'rover'],
    finalOutcome: 'Platformer with jump pads, moving platforms, hazards & collectibles',
    systemsBuilt: ['movement', 'jumping', 'platforms', 'hazards', 'collectibles'],
    medals: {
      bronze: { label: 'Reach the final platform', check: (s) => (s.progress || 0) >= 100 },
      silver: { label: 'Collect 5 platform items', target: 5, check: (s) => (s.collected || 0) >= 5 },
      gold: { label: 'Finish in under 9 minutes', target: 540, check: (s) => (s.progress || 0) >= 100 && (s.time || Infinity) < 540 },
    },
    zones: [
      z(1, 'intro', 'Platform Kingdom', 'Welcome to Jump World — you will BUILD the platformer mechanics!', 'Explore the first platform — see jump pads and gaps.', [], []),
      z(2, 'first_system', 'Walk & Jump', 'Core platformer movement: walk + jump.', 'MOVE FORWARD + JUMP blocks = platformer engine.', ['movement', 'jumping'], ['robot_move_forward', 'robot_jump']),
      z(3, 'interaction', 'Jump Pad Triggers', 'Jump pads launch you higher — trigger on contact.', 'Move onto pads → jump at the right moment.', ['movement', 'jumping', 'platforms'], ['robot_jump', 'robot_move_forward']),
      z(4, 'expansion', 'Gap Crossing', 'Combine walk + jump + timing to cross gaps.', 'WAIT before jump for precise landings.', ['jumping', 'platforms', 'timing'], ['robot_jump', 'robot_wait']),
      z(5, 'mini_challenge', 'Spike Hazard', 'Avoid spikes — build hazard detection logic.', 'IF obstacle ahead → jump or turn.', ['jumping', 'hazards'], ['robot_obstacle_ahead', 'robot_jump']),
      z(6, 'new_mechanic', 'Coin Collectibles', 'Collect coins mid-jump — scoring system.', 'Track COINS variable, increment on collection.', ['collectibles', 'variables'], ['robot_set_variable']),
      z(7, 'complex_system', 'Moving Platforms', 'Time your jumps to moving platform rhythm.', 'WAIT for platform → jump → move.', ['platforms', 'timing', 'jumping'], ['robot_wait', 'robot_jump']),
      z(8, 'advanced', 'Multi-Level Climb', 'Three platform tiers — chain jumps together.', 'Sequence: jump → move → wait → jump again.', ['platforms', 'jumping', 'sequences'], ['robot_jump', 'robot_repeat']),
      z(9, 'boss', 'Flagpole Finish', 'Reach the top flag — full platformer run.', 'All mechanics combined in one vertical climb.', ['jumping', 'platforms', 'hazards', 'collectibles'], ['robot_jump', 'robot_repeat']),
      z(10, 'create', 'Build Your Level', 'Design your own platformer stage!', 'Add platforms, spikes, coins, change jump height rules.', ['jumping', 'platforms', 'hazards', 'collectibles'], [], true),
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // STEALTH — Shadow Escape
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'shadow_escape',
    name: 'Shadow Escape',
    tagline: 'Build a stealth escape game',
    genre: 'stealth',
    icon: '👁',
    color: '#64748b',
    arenaType: 'neon_city',
    estMinutes: 20,
    totalDist: 38,
    timeLimit: 1200,
    rec: ['security', 'spider', 'humanoid'],
    finalOutcome: 'Stealth game with detection zones, alarms & patrol logic',
    systemsBuilt: ['movement', 'detection_zones', 'alarms', 'patrol', 'visibility'],
    medals: {
      bronze: { label: 'Escape undetected', check: (s) => (s.progress || 0) >= 100 },
      silver: { label: 'Trigger zero alarms', check: (s) => (s.progress || 0) >= 100 && (s.collisions || 0) === 0 },
      gold: { label: 'Escape in under 10 minutes', target: 600, check: (s) => (s.progress || 0) >= 100 && (s.time || Infinity) < 600 },
    },
    zones: [
      z(1, 'intro', 'Shadow Protocol', 'Infiltrate the facility without triggering alarms. You BUILD the stealth systems.', 'Observe patrol routes and sensor beam patterns.', [], []),
      z(2, 'first_system', 'Silent Movement', 'Slow, careful movement is your stealth engine.', 'SET SPEED low → MOVE FORWARD quietly.', ['movement', 'speed_control'], ['robot_set_speed', 'robot_move_forward']),
      z(3, 'interaction', 'Detection Beams', 'Red beams trigger alarms — learn their pattern.', 'Watch beam sweep — move when clear.', ['movement', 'detection_zones'], ['robot_wait', 'robot_move_forward']),
      z(4, 'expansion', 'Alarm System', 'IF detected → stop and hide. Build alarm response.', 'IF obstacle/sensor → STOP + WAIT.', ['detection_zones', 'alarms'], ['robot_if', 'robot_stop']),
      z(5, 'mini_challenge', 'Patrol Timing', 'Guards patrol — move between their cycles.', 'WAIT for patrol gap → sprint through.', ['patrol', 'timing'], ['robot_wait', 'robot_set_speed']),
      z(6, 'new_mechanic', 'Visibility Variable', 'Track DETECTED state — am I seen or hidden?', 'Set DETECTED = 0 when safe, 1 when caught.', ['visibility', 'variables'], ['robot_set_variable']),
      z(7, 'complex_system', 'Multi-Zone Infiltration', 'Three security zones — different rules each.', 'Adapt speed and wait timing per zone.', ['detection_zones', 'patrol', 'variables'], ['robot_if', 'robot_set_speed']),
      z(8, 'advanced', 'Camera Dodge', 'Cameras rotate — find the blind spot.', 'Multiple solutions: wait, alternate route, or speed burst.', ['detection_zones', 'patrol'], ['robot_wait', 'robot_turn_left']),
      z(9, 'boss', 'Final Escape', 'Reach the exit undetected — full stealth run.', 'All systems: speed, detection, alarms, patrol timing.', ['detection_zones', 'alarms', 'patrol', 'visibility'], ['robot_if', 'robot_repeat']),
      z(10, 'create', 'Design Your Heist', 'Create your own stealth mission!', 'Add guards, change detection zones, modify alarm rules.', ['detection_zones', 'alarms', 'patrol', 'visibility'], [], true),
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SIMULATION — Auto Factory
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'auto_factory',
    name: 'Auto Factory',
    tagline: 'Build an automation simulation',
    genre: 'simulation',
    icon: '⚙️',
    color: '#3b82f6',
    arenaType: 'warehouse_sort',
    estMinutes: 22,
    totalDist: 36,
    timeLimit: 1320,
    rec: ['factory', 'factorybot'],
    finalOutcome: 'Idle/sim game with production chains, timers & resource loops',
    systemsBuilt: ['movement', 'timers', 'production', 'sorting', 'resource_loops'],
    medals: {
      bronze: { label: 'Complete the production line', check: (s) => (s.progress || 0) >= 100 },
      silver: { label: 'Sort 5 items correctly', target: 5, check: (s) => (s.collected || 0) >= 5 },
      gold: { label: 'Finish in under 11 minutes', target: 660, check: (s) => (s.progress || 0) >= 100 && (s.time || Infinity) < 660 },
    },
    zones: [
      z(1, 'intro', 'Factory Floor', 'Welcome to Auto Factory — you will BUILD the production systems.', 'Watch conveyor belts and sorting bins in action.', [], []),
      z(2, 'first_system', 'Conveyor Movement', 'Move items along the production line.', 'WHEN START → MOVE to first station.', ['movement', 'production'], ['robot_when_start', 'robot_move_forward']),
      z(3, 'interaction', 'Pickup Trigger', 'Grab items from the conveyor belt.', 'Move to item → GRAB → carry to bin.', ['production', 'triggers'], ['robot_move_forward']),
      z(4, 'expansion', 'Sort by Color', 'Combine movement + color logic to sort items.', 'IF red item → go to red bin.', ['sorting', 'if_else'], ['robot_if', 'robot_turn_left']),
      z(5, 'mini_challenge', 'Throughput Timer', 'Sort 3 items before the belt moves on.', 'Speed + accuracy under time pressure.', ['sorting', 'timers'], ['robot_set_speed']),
      z(6, 'new_mechanic', 'Resource Counter', 'Track ITEMS_SORTED variable.', 'Increment counter on each successful sort.', ['resource_loops', 'variables'], ['robot_set_variable']),
      z(7, 'complex_system', 'Production Chain', 'Three stations — build a full pipeline.', 'Move → grab → sort → return → repeat.', ['production', 'sorting', 'loops'], ['robot_repeat']),
      z(8, 'advanced', 'Efficiency Challenge', 'Maximize throughput — experiment with routes.', 'Multiple valid production chains.', ['production', 'resource_loops'], ['robot_repeat', 'robot_if']),
      z(9, 'boss', 'Factory Championship', 'Sort everything before shutdown — full automation.', 'Complete production loop under deadline.', ['production', 'sorting', 'timers', 'resource_loops'], ['robot_repeat', 'robot_set_variable']),
      z(10, 'create', 'Design Your Factory', 'Build your own automation sim!', 'Change belt speed, add stations, modify sort rules.', ['production', 'sorting', 'timers', 'resource_loops'], [], true),
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // RESCUE — MedBay Emergency (MedBot)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'medbay_emergency',
    name: 'MedBay Emergency',
    tagline: 'Build a hospital triage rescue game',
    genre: 'simulation',
    icon: '🏥',
    color: '#ef4444',
    arenaType: 'medbot_triage',
    estMinutes: 20,
    totalDist: 34,
    timeLimit: 1200,
    rec: ['medbot', 'hospital'],
    finalOutcome: 'Triage sim with patient priority, supply delivery & timed rescues',
    systemsBuilt: ['movement', 'priority_logic', 'timers', 'delivery', 'variables'],
    medals: {
      bronze: { label: 'Complete the triage rescue', check: (s) => (s.progress || 0) >= 100 },
      silver: { label: 'Deliver 5 supplies', target: 5, check: (s) => (s.collected || 0) >= 5 },
      gold: { label: 'Finish in under 10 minutes', target: 600, check: (s) => (s.progress || 0) >= 100 && (s.time || Infinity) < 600 },
    },
    zones: [
      z(1, 'intro', 'Code Blue', 'Patients need help across the ward — you BUILD the triage routing system.', 'Walk the corridors and note red, yellow, and green bays.', [], []),
      z(2, 'first_system', 'Ward Navigation', 'Move carefully through tight hospital corridors.', 'WHEN START → MOVE at low speed → STOP at each bay.', ['movement'], ['robot_when_start', 'robot_move_forward', 'robot_stop']),
      z(3, 'interaction', 'Patient Markers', 'Reach glowing patient markers to register a rescue.', 'Move to marker → WAIT 1s (scan vitals).', ['movement', 'delivery'], ['robot_move_forward', 'robot_wait']),
      z(4, 'expansion', 'Priority Routing', 'Red patients first — build IF priority logic.', 'IF red marker → go there first, ELSE yellow.', ['priority_logic', 'if_else'], ['robot_if', 'robot_turn_left']),
      z(5, 'mini_challenge', 'Supply Run', 'Deliver med kits to three bays before timer ends.', 'GRAB supply → MOVE to bay → WAIT → repeat.', ['delivery', 'timers'], ['robot_repeat', 'robot_wait']),
      z(6, 'new_mechanic', 'Patients Saved Counter', 'Track PATIENTS variable — increment on each rescue.', 'Set variable on each successful delivery.', ['variables', 'priority_logic'], ['robot_set_variable']),
      z(7, 'complex_system', 'Multi-Wing Triage', 'Three wings — route by priority and distance.', 'Combine IF blocks with shortest-path moves.', ['priority_logic', 'delivery'], ['robot_if', 'robot_repeat']),
      z(8, 'advanced', 'Obstacle Avoidance', 'Avoid rolling equipment in crowded halls.', 'IF obstacle → TURN → alternate route.', ['movement', 'if_then'], ['robot_obstacle_ahead', 'robot_turn_right']),
      z(9, 'boss', 'Mass Casualty Event', 'Six patients, one timer — full triage system.', 'Priority sort + delivery + counter — all systems go.', ['priority_logic', 'timers', 'variables'], ['robot_if', 'robot_repeat']),
      z(10, 'create', 'Design Your ER', 'Remix ward layout, patient rules, and timer pressure!', 'Change bay colors, add obstacles, tune difficulty.', ['priority_logic', 'delivery', 'timers'], [], true),
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // RESCUE — Blaze Protocol (FireBot)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'blaze_protocol',
    name: 'Blaze Protocol',
    tagline: 'Build a firefighting rescue game',
    genre: 'defense',
    icon: '🔥',
    color: '#f97316',
    arenaType: 'firebot_blaze',
    estMinutes: 21,
    totalDist: 36,
    timeLimit: 1260,
    rec: ['firebot', 'fire', 'rescue'],
    finalOutcome: 'Fire response game with blaze zones, survivor extraction & hose timing',
    systemsBuilt: ['movement', 'hazards', 'rescue', 'timers', 'patrol'],
    medals: {
      bronze: { label: 'Complete the rescue', check: (s) => (s.progress || 0) >= 100 },
      silver: { label: 'Avoid all hazards', check: (s) => (s.progress || 0) >= 100 && (s.collisions || 0) === 0 },
      gold: { label: 'Finish in under 10 minutes', target: 600, check: (s) => (s.progress || 0) >= 100 && (s.time || Infinity) < 600 },
    },
    zones: [
      z(1, 'intro', 'Station Alarm', 'Multiple blazes reported — you BUILD the response protocol.', 'Survey fire zones (orange) and survivor markers (blue).', [], []),
      z(2, 'first_system', 'Deploy to Scene', 'Heavy tank movement through debris fields.', 'WHEN START → POWER MODE → MOVE toward nearest blaze.', ['movement', 'patrol'], ['robot_when_start', 'robot_power_mode', 'robot_move_forward']),
      z(3, 'interaction', 'Blaze Suppression', 'Hold position at each fire zone to suppress.', 'MOVE to blaze → STOP → WAIT 2s (hose spray).', ['hazards', 'timers'], ['robot_stop', 'robot_wait']),
      z(4, 'expansion', 'Survivor Extraction', 'After suppressing fire, route to survivor marker.', 'IF blaze cleared → MOVE to survivor → WAIT.', ['rescue', 'if_then'], ['robot_if', 'robot_move_forward']),
      z(5, 'mini_challenge', 'Three-Alarm Fire', 'Hit three blaze zones in order before spread timer.', 'REPEAT: move → suppress → next zone.', ['hazards', 'timers'], ['robot_repeat', 'robot_wait']),
      z(6, 'new_mechanic', 'Survivors Rescued', 'Track RESCUED variable for each extraction.', 'Increment on each survivor reached.', ['variables', 'rescue'], ['robot_set_variable']),
      z(7, 'complex_system', 'Hazard Avoidance', 'Burning debris blocks paths — find alternate routes.', 'IF obstacle → TURN → try alternate corridor.', ['hazards', 'if_else'], ['robot_obstacle_ahead', 'robot_turn_left']),
      z(8, 'advanced', 'Multi-Building Response', 'Two structures — prioritize by survivor count.', 'IF closer survivor → route there first.', ['rescue', 'priority_logic'], ['robot_if', 'robot_repeat']),
      z(9, 'boss', 'Inferno Finale', 'Full building — suppress all blazes and extract everyone.', 'Patrol + suppress + rescue loop under hard timer.', ['hazards', 'rescue', 'timers'], ['robot_repeat', 'robot_if']),
      z(10, 'create', 'Design Your Fire Mission', 'Add blaze zones, change survivor count, remix routes!', 'Tune timer, add obstacles, create your own rules.', ['hazards', 'rescue', 'patrol'], [], true),
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // EXPLORATION — Reef Guardian (Underwater)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'reef_guardian',
    name: 'Reef Guardian',
    tagline: 'Build an underwater reef restoration game',
    genre: 'adventure',
    icon: '🐠',
    color: '#06b6d4',
    arenaType: 'robot_reef',
    estMinutes: 22,
    totalDist: 40,
    timeLimit: 1320,
    rec: ['underwater', 'submarine', 'ocean'],
    finalOutcome: 'Reef sim with fish guidance, pollution cleanup & sonar mapping',
    systemsBuilt: ['movement', 'sonar', 'triggers', 'variables', 'loops'],
    medals: {
      bronze: { label: 'Restore the reef crown', check: (s) => (s.progress || 0) >= 100 },
      silver: { label: 'Collect 5 reef items', target: 5, check: (s) => (s.collected || 0) >= 5 },
      gold: { label: 'Finish in under 11 minutes', target: 660, check: (s) => (s.progress || 0) >= 100 && (s.time || Infinity) < 660 },
    },
    zones: [
      z(1, 'intro', 'Reef in Peril', 'Pollution broke the reef navigation lights — you BUILD the restoration systems.', 'Swim the reef entrance and observe color-coded fish schools.', [], []),
      z(2, 'first_system', 'Sub Navigation', 'Core underwater movement through coral arches.', 'WHEN START → MOVE → DIVE to follow the reef floor path.', ['movement'], ['robot_when_start', 'robot_move_forward', 'robot_dive']),
      z(3, 'interaction', 'Sonar Tags', 'Ping sonar at each reef marker to map the zone.', 'At marker → SCAN → WAIT for sonar pulse.', ['sonar', 'triggers'], ['robot_sonar_scan', 'robot_wait']),
      z(4, 'expansion', 'Fish Guidance', 'Guide fish schools through restored color gates.', 'IF fish detected → MOVE toward matching gate color.', ['triggers', 'if_then'], ['robot_if', 'robot_move_forward']),
      z(5, 'mini_challenge', 'Pollution Cleanup', 'Visit three sensor pods to clear pollution alerts.', 'MOVE to pod → WAIT 2s (clean) → next pod.', ['triggers', 'timers'], ['robot_repeat', 'robot_wait']),
      z(6, 'new_mechanic', 'Reef Health Variable', 'Track REEF_HEALTH — increment as you restore zones.', 'Add energy at each restored pod.', ['variables'], ['robot_set_variable']),
      z(7, 'complex_system', 'Current Navigation', 'Strong currents push you off course — compensate.', 'TURN into current → ASCEND over kelp → MOVE.', ['movement', 'loops'], ['robot_turn_left', 'robot_ascend_water']),
      z(8, 'advanced', 'Deep Cave Branch', 'Optional cave — sonar reveals the safe path.', 'SCAN before entering → IF clear → DIVE deeper.', ['sonar', 'if_else'], ['robot_sonar', 'robot_if']),
      z(9, 'boss', 'Reef Crown Restoration', 'Restore the central reef crown before tides shift.', 'All systems: navigate, clean, guide fish, track health.', ['variables', 'sonar', 'triggers'], ['robot_repeat', 'robot_set_variable']),
      z(10, 'create', 'Design Your Reef', 'Place fish schools, pollution pods, and coral gates!', 'Remix paths, change health rules, add hazards.', ['movement', 'sonar', 'variables'], [], true),
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  // RESCUE — Sky Rescue Wings (Drone)
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: 'sky_rescue_wings',
    name: 'Sky Rescue Wings',
    tagline: 'Build an aerial search-and-rescue game',
    genre: 'adventure',
    icon: '🚁',
    color: '#38bdf8',
    arenaType: 'coastal_rescue',
    estMinutes: 19,
    totalDist: 38,
    timeLimit: 1140,
    rec: ['drone', 'aerial', 'rescue', 'jet', 'hover', 'racedrone'],
    finalOutcome: 'Aerial SAR with scan patterns, drop zones & wind compensation',
    systemsBuilt: ['movement', 'aerial_scan', 'delivery', 'timers', 'loops'],
    medals: {
      bronze: { label: 'Complete the rescue', check: (s) => (s.progress || 0) >= 100 },
      silver: { label: 'Find 5 survivors', target: 5, check: (s) => (s.collected || 0) >= 5 },
      gold: { label: 'Finish in under 10 minutes', target: 600, check: (s) => (s.progress || 0) >= 100 && (s.time || Infinity) < 600 },
    },
    zones: [
      z(1, 'intro', 'Mayday Signal', 'A vessel is in distress off the coast — you BUILD the aerial rescue protocol.', 'Fly the coastline and spot orange distress beacons.', [], []),
      z(2, 'first_system', 'Takeoff & Hover', 'Launch and stabilize before scanning.', 'WHEN START → TAKEOFF → HOVER → AERIAL SCAN.', ['movement', 'aerial_scan'], ['robot_when_start', 'robot_takeoff', 'robot_aerial_scan']),
      z(3, 'interaction', 'Distress Beacons', 'Fly over beacons to register survivors.', 'FLY to beacon → HOVER 1s → mark found.', ['aerial_scan', 'triggers'], ['robot_fly_up', 'robot_hover']),
      z(4, 'expansion', 'Life Ring Drop', 'Deliver supplies to marked drop zones.', 'FLY to zone → DESCEND → WAIT (drop) → ASCEND.', ['delivery', 'movement'], ['robot_fly_down', 'robot_wait']),
      z(5, 'mini_challenge', 'Grid Search', 'Scan a 3×3 grid pattern for hidden survivors.', 'REPEAT: fly forward → scan → turn → next row.', ['aerial_scan', 'loops'], ['robot_repeat', 'robot_aerial_scan']),
      z(6, 'new_mechanic', 'Found Counter', 'Track FOUND variable for each survivor located.', 'Increment when beacon triggered.', ['variables'], ['robot_set_variable']),
      z(7, 'complex_system', 'Wind Compensation', 'Crosswind pushes you — adjust heading mid-flight.', 'TURN into wind before moving to drop zone.', ['movement', 'if_then'], ['robot_turn_left', 'robot_fly_forward']),
      z(8, 'advanced', 'Multi-Site Rescue', 'Three distress sites — prioritize closest first.', 'IF beacon distance → route to nearest.', ['delivery', 'if_else'], ['robot_if', 'robot_repeat']),
      z(9, 'boss', 'Storm Rescue Finale', 'Rescue all survivors before the storm wall arrives.', 'Full SAR loop: scan, find, drop, count — under timer.', ['aerial_scan', 'delivery', 'timers'], ['robot_repeat', 'robot_aerial_scan']),
      z(10, 'create', 'Design Your SAR Mission', 'Add beacons, change storm speed, remix drop zones!', 'Tune difficulty and create your own rescue rules.', ['aerial_scan', 'delivery', 'loops'], [], true),
    ],
  },
];

/** Lookup mission by id or challenge object */
export function getGameMission(idOrChallenge) {
  const id = typeof idOrChallenge === 'object'
    ? (idOrChallenge.missionId || idOrChallenge.id)
    : idOrChallenge;
  return GAME_MISSIONS.find((m) => m.id === id) || null;
}

/** Missions grouped by genre for level select */
export function getMissionsByGenre() {
  return Object.values(GAME_GENRES).map((genre) => ({
    genre,
    missions: GAME_MISSIONS.filter((m) => m.genre === genre.id),
  })).filter((g) => g.missions.length > 0);
}

/** Convert mission to course-compatible object for LiveLab */
export function missionToCourse(mission) {
  return {
    id: mission.id,
    missionId: mission.id,
    isGameMission: true,
    cat: `mission_${mission.genre}`,
    icon: mission.icon,
    name: mission.name,
    desc: mission.tagline,
    arenaType: mission.arenaType,
    color: mission.color,
    obstacles: 0,
    totalDist: mission.totalDist,
    estMinutes: mission.estMinutes,
    timeLimit: mission.timeLimit,
    laps: mission.laps,
    checkpoints: mission.checkpoints,
    isFoxChase: mission.isFoxChase || false,
    rec: mission.rec,
    genre: mission.genre,
    systemsBuilt: mission.systemsBuilt,
    finalOutcome: mission.finalOutcome,
    zoneCount: 10,
    zones: 10,
    medals: mission.medals,
  };
}

/** Story/objectives for mission UI */
export function getMissionStory(mission, zoneNum = 1) {
  if (!mission) return null;
  const zone = mission.zones.find((z) => z.num === zoneNum) || mission.zones[0];
  const genre = GAME_GENRES[mission.genre];
  return {
    emoji: mission.icon,
    genre: genre?.label || mission.genre,
    genreIcon: genre?.icon,
    story: zone?.story || mission.tagline,
    mechanic: zone?.mechanic,
    objectives: [
      zone?.mechanic,
      `Build: ${(zone?.systemsIntroduced || []).join(', ') || 'core systems'}`,
      mission.finalOutcome,
    ].filter(Boolean),
    tip: zone?.suggestedBlocks?.length
      ? `Try blocks: ${zone.suggestedBlocks.map((b) => b.replace('robot_', '')).join(', ')}`
      : (zone?.phase === 'intro' ? 'Explore the world first — coding starts in Zone 2!' : 'Experiment — there are multiple solutions!'),
    collectibles: mission.systemsBuilt?.join(' · '),
    zone,
    phase: zone?.phaseMeta,
  };
}

/** All systems unlocked up to zone N */
export function getUnlockedSystems(mission, zoneNum) {
  if (!mission) return [];
  const systems = new Set();
  mission.zones.filter((z) => z.num <= zoneNum).forEach((z) => {
    (z.systemsIntroduced || []).forEach((s) => systems.add(s));
  });
  return [...systems];
}

/** Designer XP for entering/completing a zone */
export function calcZoneDesignerXp(mission, zoneNum, meta = {}) {
  const zone = mission?.zones.find((z) => z.num === zoneNum);
  if (!zone) return 0;
  const base = zone.isSandbox ? 100 : 15 + zoneNum * 8;
  const systemBonus = (zone.systemsIntroduced?.length || 0) * 10;
  const experimentBonus = meta.experimented ? 25 : 0;
  return base + systemBonus + experimentBonus;
}

/** Total mission catalog as courses (for ALL_COURSES merge) */
export function expandGameMissionsAsCourses() {
  return GAME_MISSIONS.map(missionToCourse);
}

export const MISSION_GENRE_SECTIONS = Object.fromEntries(
  Object.values(GAME_GENRES).map((g) => [
    `mission_${g.id}`,
    { label: g.label, icon: g.icon, blurb: 'Full game creation experience', color: g.color },
  ])
);
