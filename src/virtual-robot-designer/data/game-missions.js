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
  // RACING — Sky Racers
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
    rec: ['hover', 'racedrone', 'drone', 'jet'],
    finalOutcome: 'A playable race game with laps, checkpoints, boosts & coin scoring',
    systemsBuilt: ['movement', 'speed_control', 'checkpoints', 'laps', 'timers', 'scoring'],
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
    isFoxChase: mission.isFoxChase || false,
    rec: mission.rec,
    genre: mission.genre,
    systemsBuilt: mission.systemsBuilt,
    finalOutcome: mission.finalOutcome,
    zoneCount: 10,
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
