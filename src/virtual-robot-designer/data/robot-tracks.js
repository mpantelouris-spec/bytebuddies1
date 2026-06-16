/**
 * robot-tracks.js — STEM Tracks + Classic Course Library
 * 12 tracks × 10 levels (120 challenges) + 60 bonus classic courses
 */

export const LEVELS_PER_TRACK = 10;
export const TRACK_BADGES = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master', 'elite', 'legend', 'champion', 'grandmaster'];

export const COURSE_LENGTHS = {
  short:  { label: 'Short',  icon: '🏃', minDist: 0,  maxDist: 28, color: '#22c55e' },
  medium: { label: 'Medium', icon: '🚶', minDist: 28, maxDist: 45, color: '#f59e0b' },
  long:   { label: 'Long',   icon: '🥾', minDist: 45, maxDist: 65, color: '#ef4444' },
  epic:   { label: 'Epic',   icon: '🏔️', minDist: 65, maxDist: 999, color: '#8b5cf6' },
};

export const TRACK_CATEGORIES = {
  ground:   { label: 'Ground',   icon: '🏁', color: '#22c55e' },
  factory:  { label: 'Factory',  icon: '🏭', color: '#8b5cf6' },
  aerial:   { label: 'Aerial',   icon: '🚁', color: '#0ea5e9' },
  advanced: { label: 'Advanced', icon: '🧠', color: '#a855f7' },
  extreme:  { label: 'Extreme',  icon: '🔥', color: '#ef4444' },
};

function courseLength(totalDist) {
  if (totalDist >= 65) return 'epic';
  if (totalDist >= 45) return 'long';
  if (totalDist >= 28) return 'medium';
  return 'short';
}

function lvl(track, level, name, desc, learn, success, extra = {}) {
  const totalDist = extra.totalDist ?? Math.round(14 + level * 7 + (track.distBonus || 0));
  const obstacles = extra.obstacles ?? Math.min(20, Math.round(2 + level * 1.6));
  const checkpoints = extra.checkpoints ?? Math.max(2, Math.floor(totalDist / 8));
  const timeLimit = extra.timeLimit ?? (level === LEVELS_PER_TRACK ? 0 : Math.round(totalDist * 5 + level * 15));
  const len = courseLength(totalDist);
  return {
    id: `${track.id}_l${level}`,
    trackId: track.id,
    level,
    name,
    desc,
    learn,
    successCriteria: success,
    timeLimit,
    difficulty: Math.min(5, Math.ceil(level / 2)),
    xpReward: 80 + level * 35 + (track.xpBonus || 0),
    basePoints: 100 + level * 120,
    badge: TRACK_BADGES[level - 1],
    obstacles,
    totalDist,
    checkpoints,
    laps: extra.laps || (track.id === 'speed_challenge' && level >= 6 ? 2 : 1),
    length: len,
    lengthLabel: COURSE_LENGTHS[len].label,
    estMinutes: Math.ceil(totalDist / 12),
    arenaType: extra.arenaType || track.arenaType,
    color: extra.color || track.color,
    cat: track.cat,
    icon: extra.icon || track.icon,
    codeHint: extra.codeHint,
    rec: extra.rec || track.rec,
    category: track.category,
  };
}

function buildTrackLevels(track, levelDefs) {
  return levelDefs.map((def, i) => lvl(track, i + 1, def[0], def[1], def[2], def[3], def[4] || {}));
}

const TRACK_DEFS = [
  {
    id: 'line_following', name: 'Line Following', icon: '〰️', color: '#10b981',
    category: 'ground', arenaType: 'line_follow', cat: 'line_follow', distBonus: 0, xpBonus: 0,
    desc: 'Master color sensors, IF/THEN logic, proportional control, and PID algorithms on increasingly long tracks.',
    skills: ['Sensor Calibration', 'Conditional Logic', 'Proportional Control', 'PID Tuning', 'Multi-Sensor'],
    recommendedWeek: 1, rec: ['rover', 'humanoid'],
    levels: [
      ['Straight Line Sprint', 'Follow a straight black line — 18 metres.', 'Color sensor basics', 'Stay on line entire distance', {}],
      ['Gentle Curves', 'Navigate smooth curves without wobbling — 25 m.', 'Proportional steering', 'Smooth tracking, minimal sway', { totalDist: 25 }],
      ['S-Curves', 'Handle alternating left-right curves — 32 m.', 'Error correction', 'No line loss on S-bends', { totalDist: 32 }],
      ['Sharp 90° Corners', 'Tight corners at moderate speed — 38 m.', 'Fast response turns', 'All corners without losing line', { totalDist: 38 }],
      ['Dual-Sensor Line', 'Two sensors for precise edge tracking — 44 m.', 'Dual sensor logic', 'Centered on line throughout', { totalDist: 44 }],
      ['Multi-Color Junction', 'Choose correct path at color splits — 50 m.', 'Color branching IF/ELSE', 'Correct path chosen and completed', { totalDist: 50 }],
      ['Speed Line Follow', 'Fast line follow with control — 55 m.', 'Speed + accuracy balance', 'Complete under time limit', { totalDist: 55, arenaType: 'line_follow' }],
      ['Figure-8 Circuit', 'Two loops, crossing center — 60 m.', 'Complex path memory', 'Full figure-8 without exit', { totalDist: 60, laps: 2 }],
      ['Night Line (Low Contrast)', 'Faint grey line on dark floor — 68 m.', 'Threshold calibration', 'Track faint line successfully', { totalDist: 68 }],
      ['Grand Prix Line', 'Full championship circuit — 80 m, best time wins.', 'Full PID optimization', 'Fastest clean run', { totalDist: 80, timeLimit: 0, icon: '🏆' }],
    ],
  },
  {
    id: 'obstacle_avoidance', name: 'Obstacle Avoidance', icon: '🚧', color: '#22c55e',
    category: 'ground', arenaType: 'ground', cat: 'ground', distBonus: 2,
    desc: 'Distance sensors, reactive steering, path planning, and high-speed navigation through dense obstacle fields.',
    skills: ['Threat Detection', 'Reactive Steering', 'Path Planning', 'Prediction', 'High-Speed Nav'],
    recommendedWeek: 2, rec: ['rover', 'tank', 'humanoid'],
    levels: [
      ['Stop Before Hit', 'Detect obstacle and stop safely — 15 m.', 'Distance sensor', 'Stop within 15 cm', { totalDist: 15, obstacles: 1 }],
      ['Go Around', 'Single obstacle, reach goal — 22 m.', 'Turn decision logic', 'Reach goal, zero hits', { totalDist: 22, obstacles: 3 }],
      ['Cone Slalom', 'Weave through 6 cones — 30 m.', 'Alternating turns', 'All cones passed cleanly', { totalDist: 30, obstacles: 6 }],
      ['Obstacle Field', '10 obstacles, find opening — 38 m.', 'Scan and steer', 'Zero collisions', { totalDist: 38, obstacles: 10 }],
      ['Narrow Corridor', 'Tight walls, precise steering — 42 m.', 'Fine motor control', 'No wall contact', { totalDist: 42, obstacles: 8 }],
      ['Moving Obstacles', 'Dodge moving hazards — 48 m.', 'Dynamic prediction', 'Avoid all movers', { totalDist: 48, arenaType: 'dodge_balls', obstacles: 12 }],
      ['Multi-Route Maze', 'Choose best path through field — 52 m.', 'Route comparison', 'Optimal route, no hits', { totalDist: 52, obstacles: 14 }],
      ['Laser Grid', 'Thread through laser barriers — 58 m.', 'Precision timing', 'Zero laser triggers', { totalDist: 58, arenaType: 'dodge_lasers', obstacles: 10 }],
      ['Chaos Arena', 'Random obstacle spawns — 65 m.', 'Adaptive reactions', 'Survive to finish', { totalDist: 65, arenaType: 'dodge_balls', obstacles: 16 }],
      ['Master Navigator', 'Epic 75 m obstacle gauntlet.', 'Full autonomy', 'Zero collisions, best time', { totalDist: 75, obstacles: 18, timeLimit: 0, icon: '🏆' }],
    ],
  },
  {
    id: 'pick_place', name: 'Pick & Place', icon: '🦾', color: '#8b5cf6',
    category: 'factory', arenaType: 'factory', cat: 'factory',
    desc: 'Gripper control, color sorting, stacking, pattern matching, and warehouse efficiency on long factory floors.',
    skills: ['Gripper Control', 'Color Sort', 'Stacking', 'Coordinates', 'Efficiency'],
    recommendedWeek: 3, rec: ['factory', 'humanoid', 'rover'],
    levels: [
      ['First Pickup', 'One cube to bin — 20 m floor.', 'Open/close gripper', 'Cube in bin, no drop', { totalDist: 20, codeHint: 'Move → open → close → deliver → release' }],
      ['Two-Object Run', 'Pick and place two items — 26 m.', 'Repeat pickup cycle', 'Both objects placed', { totalDist: 26, obstacles: 4 }],
      ['Color Sort (3 bins)', 'Red, blue, green sorting — 32 m.', 'Color IF/ELSE', 'All sorted correctly', { totalDist: 32, obstacles: 5 }],
      ['Conveyor Pickup', 'Grab from moving belt — 36 m.', 'Timing coordination', '3 items from belt', { totalDist: 36, obstacles: 6 }],
      ['Stack Builder', 'Stack 4 blocks stable — 40 m.', 'Height adjustment', 'Stack stands 10 s', { totalDist: 40 }],
      ['Pattern Match', 'Recreate reference layout — 46 m.', 'Spatial coordinates', 'Exact pattern match', { totalDist: 46, obstacles: 7 }],
      ['Multi-Station', '5 pickup/drop stations — 52 m.', 'Route planning', 'All stations complete', { totalDist: 52, checkpoints: 5 }],
      ['Fragile Cargo', 'Delicate items, slow grip — 58 m.', 'Pressure control', 'Zero drops or breaks', { totalDist: 58 }],
      ['Factory Sprint', 'Full line, max speed — 64 m.', 'Optimized paths', 'All tasks under time', { totalDist: 64, obstacles: 8 }],
      ['Mega Warehouse', 'Epic 72 m pick-place marathon.', 'Full automation', '100% accuracy', { totalDist: 72, timeLimit: 0, icon: '🏆' }],
    ],
  },
  {
    id: 'speed_challenge', name: 'Speed Challenge', icon: '⚡', color: '#f59e0b',
    category: 'ground', arenaType: 'ground', cat: 'ground', distBonus: 4,
    desc: 'Acceleration, braking, racing lines, and full-speed circuits — courses get longer every level.',
    skills: ['Max Speed', 'Acceleration', 'Braking', 'Racing Lines', 'Full Circuit'],
    recommendedWeek: 4, rec: ['rover', 'race', 'hover'],
    levels: [
      ['100 Metre Dash', 'Straight sprint — 25 m track.', 'Motor max speed', 'Cross finish line', { totalDist: 25, obstacles: 0 }],
      ['Corner Speed', 'Two turns at speed — 30 m.', 'Turn without slide', 'Clean turns', { totalDist: 30 }],
      ['Line Speed Run', 'Fast line follow — 35 m.', 'Speed + sensor', 'Stay on line', { totalDist: 35, arenaType: 'line_follow' }],
      ['Acceleration Test', '0 to max in shortest distance — 32 m.', 'Ramp acceleration', 'Smooth speed curve', { totalDist: 32 }],
      ['Brake Zone', 'Full speed to precise stop — 28 m.', 'Deceleration', 'Stop in target zone', { totalDist: 28 }],
      ['Double Lap', 'Two laps, race circuit — 48 m.', 'Lap counting', '2 laps complete', { totalDist: 48, laps: 2, arenaType: 'neon_race' }],
      ['Slalom Speed', 'Fast cone weave — 52 m.', 'Quick reactions', 'No cone hits', { totalDist: 52, obstacles: 10 }],
      ['Night Race', 'Dim track, high speed — 58 m.', 'Low-light driving', 'Finish clean', { totalDist: 58, arenaType: 'neon_race' }],
      ['Triple Lap GP', 'Three-lap grand prix — 66 m.', 'Endurance speed', '3 laps, best time', { totalDist: 66, laps: 3, arenaType: 'neon_race' }],
      ['Ultimate Speedway', 'Epic 85 m championship race.', 'Peak performance', 'Fastest clean lap', { totalDist: 85, laps: 2, timeLimit: 0, arenaType: 'neon_race', icon: '🏆' }],
    ],
  },
  {
    id: 'rescue_mission', name: 'Rescue Mission', icon: '🚑', color: '#ef4444',
    category: 'ground', arenaType: 'ground', cat: 'ground',
    desc: 'Search zones, survivor pickup, hazard navigation, and multi-stop rescue operations.',
    skills: ['Search Patterns', 'Rescue Grab', 'Hazard Nav', 'Multi-Stop', 'Emergency Response'],
    recommendedWeek: 5, rec: ['rover', 'humanoid', 'medbot'],
    levels: [
      ['Locate Survivor', 'Find one marker — 24 m.', 'Scanning', 'Reach survivor zone', { totalDist: 24 }],
      ['Rescue & Return', 'Grab and return to base — 30 m.', 'Grab + return home', 'Deliver to base', { totalDist: 30, arenaType: 'collect_easy' }],
      ['Two-Zone Rescue', 'Two survivors, two zones — 36 m.', 'Multi-stop plan', 'Both rescued', { totalDist: 36, checkpoints: 2 }],
      ['Hazard Zone', 'Rescue through obstacles — 42 m.', 'Avoid + rescue', 'Zero hits, 1 rescue', { totalDist: 42, obstacles: 8 }],
      ['Triple Rescue', 'Three zones in order — 48 m.', 'Ordered navigation', 'All 3 survivors', { totalDist: 48, arenaType: 'collect_medium', checkpoints: 3 }],
      ['Fire Zone', 'Hot hazard rescue — 54 m.', 'Risk assessment', 'Rescue without collision', { totalDist: 54, obstacles: 10 }],
      ['Medical Run', '4 stops, medical supplies — 58 m.', 'Priority routing', 'All stops visited', { totalDist: 58, checkpoints: 4 }],
      ['Disaster Response', '6 scattered survivors — 64 m.', 'Full area search', 'All survivors found', { totalDist: 64, arenaType: 'collect_hard', checkpoints: 6 }],
      ['Night Rescue', 'Low visibility search — 70 m.', 'Sensor reliance', 'Complete in time', { totalDist: 70 }],
      ['Epic Evacuation', 'Full city evacuation — 78 m.', 'Mission command', 'All objectives met', { totalDist: 78, timeLimit: 0, icon: '🏆' }],
    ],
  },
  {
    id: 'maze_explorer', name: 'Maze Explorer', icon: '🌀', color: '#a855f7',
    category: 'ground', arenaType: 'ground', cat: 'ground',
    desc: 'Wall following, dead ends, checkpoints, dark mazes, and epic labyrinth escapes.',
    skills: ['Wall Follow', 'Backtrack', 'Mapping', 'Checkpoints', 'Speed Escape'],
    recommendedWeek: 5, rec: ['rover', 'spider', 'humanoid'],
    levels: [
      ['Simple Maze', 'Basic L-shaped maze — 22 m.', 'Wall following', 'Reach exit', { totalDist: 22, obstacles: 6 }],
      ['Dead End Alley', 'Backtrack when stuck — 28 m.', 'Dead-end detection', 'Exit without infinite loop', { totalDist: 28, obstacles: 10 }],
      ['Checkpoint Maze', '3 checkpoints then exit — 34 m.', 'Ordered waypoints', 'All CPs + exit', { totalDist: 34, checkpoints: 3, obstacles: 12 }],
      ['Multi-Path', 'Choose shortest route — 40 m.', 'Path comparison', 'Optimal path taken', { totalDist: 40, obstacles: 14 }],
      ['Dark Maze', 'Limited sensor range — 46 m.', 'Memory navigation', 'Exit with ≤2 hits', { totalDist: 46, obstacles: 16 }],
      ['Moving Walls', 'Shifting maze sections — 50 m.', 'Dynamic adaptation', 'Reach exit', { totalDist: 50, obstacles: 14 }],
      ['Double Checkpoint', '6 checkpoints, strict order — 56 m.', 'Sequence logic', 'All CPs in order', { totalDist: 56, checkpoints: 6 }],
      ['Crystal Labyrinth', 'Complex cavern maze — 62 m.', 'Advanced mapping', 'Clean escape', { totalDist: 62, arenaType: 'cavern', obstacles: 18 }],
      ['Speed Maze', 'Race through maze — 68 m.', 'Fast wall follow', 'Best time exit', { totalDist: 68 }],
      ['Mega Labyrinth', 'Epic 80 m mega-maze.', 'Master navigation', 'Fastest full clear', { totalDist: 80, obstacles: 20, timeLimit: 0, icon: '🏆' }],
    ],
  },
  {
    id: 'precision_delivery', name: 'Precision Delivery', icon: '🎯', color: '#ec4899',
    category: 'factory', arenaType: 'factory', cat: 'factory',
    desc: 'Target zones, multi-drop routes, narrow corridors, and perfect accuracy under pressure.',
    skills: ['Zone Targeting', 'Multi-Drop', 'Corridor Nav', 'Moving Targets', 'Perfect Run'],
    recommendedWeek: 6, rec: ['rover', 'factory', 'humanoid'],
    levels: [
      ['Single Target', 'Park in one zone — 18 m.', 'Precise stop', 'Fully inside zone', { totalDist: 18 }],
      ['Two-Drop Route', 'Two zones in sequence — 26 m.', 'Sequential delivery', 'Both zones hit', { totalDist: 26, checkpoints: 2 }],
      ['Three-Stop Delivery', 'Three payload drops — 34 m.', 'Route efficiency', 'All drops accurate', { totalDist: 34, checkpoints: 3 }],
      ['Narrow Corridor', 'Tight passage delivery — 40 m.', 'Fine steering', 'No wall hits', { totalDist: 40, obstacles: 6 }],
      ['Timed Drops', '4 zones under clock — 46 m.', 'Speed + accuracy', 'All zones in time', { totalDist: 46, checkpoints: 4 }],
      ['Reverse Parking', 'Back into target zones — 50 m.', 'Reverse control', '3 reverse parks', { totalDist: 50 }],
      ['Moving Targets', 'Shifting drop zones — 56 m.', 'Tracking + timing', 'All moving hits', { totalDist: 56 }],
      ['Warehouse Route', '6-stop warehouse run — 62 m.', 'Logistics planning', 'All stops perfect', { totalDist: 62, checkpoints: 6, arenaType: 'warehouse' }],
      ['Zero Miss', '5 zones, zero tolerance — 68 m.', 'Pixel precision', '100% accuracy', { totalDist: 68 }],
      ['Grand Delivery', 'Epic 76 m precision marathon.', 'Master courier', 'Perfect + fast', { totalDist: 76, timeLimit: 0, icon: '🏆' }],
    ],
  },
  {
    id: 'robot_soccer', name: 'Robot Soccer', icon: '⚽', color: '#3b82f6',
    category: 'ground', arenaType: 'combat', cat: 'combat',
    desc: 'Ball chase, scoring, defense drills, full matches, and championship tournaments.',
    skills: ['Ball Track', 'Shooting', 'Defense', 'Strategy', 'Championship'],
    recommendedWeek: 6, rec: ['rover', 'humanoid'],
    levels: [
      ['Ball Chase', 'Reach the ball — 20 m pitch.', 'Object pursuit', 'Touch ball', { totalDist: 20 }],
      ['First Goal', 'Score one goal — 24 m.', 'Aim and push', '1 goal scored', { totalDist: 24 }],
      ['Pass & Shoot', 'Pass then score — 28 m.', 'Team play basics', 'Assist + goal', { totalDist: 28 }],
      ['Defense Drill', 'Block for 60 seconds — 30 m.', 'Zone defense', 'No goals conceded', { totalDist: 30 }],
      ['Half Match', '5-minute half — 36 m.', 'Offense/defense', 'Win half', { totalDist: 36 }],
      ['Penalty Shootout', '3 penalty attempts — 32 m.', 'Precision kick', '2/3 scored', { totalDist: 32 }],
      ['Full Match', 'Complete match — 44 m.', 'Full strategy', 'Win match', { totalDist: 44 }],
      ['Tournament QF', 'Quarter-final — 48 m.', 'Pressure play', 'Advance', { totalDist: 48 }],
      ['Tournament Final', 'Final match — 54 m.', 'Championship nerves', 'Win trophy', { totalDist: 54 }],
      ['World Cup', 'Epic 60 m championship.', 'Legend status', 'Champion', { totalDist: 60, timeLimit: 0, icon: '🏆' }],
    ],
  },
  {
    id: 'drone_pilot', name: 'Drone Pilot', icon: '🚁', color: '#0ea5e9',
    category: 'aerial', arenaType: 'sky', cat: 'air', distBonus: 3,
    desc: 'Sky rings, cloud tunnels, aerial races, storm flying, and long-distance drone missions.',
    skills: ['Takeoff/Land', 'Ring Navigation', 'Altitude Hold', 'Storm Fly', 'Long Range'],
    recommendedWeek: 7, rec: ['drone', 'hover', 'jet'],
    levels: [
      ['First Flight', 'Take off and land — 22 m aerial.', 'Basic flight', 'Safe landing', { totalDist: 22 }],
      ['Ring Gate 1', 'Fly through 3 rings — 28 m.', 'Ring alignment', 'All rings passed', { totalDist: 28 }],
      ['Cloud Tunnel', 'Navigate cloud maze — 34 m.', '3D navigation', 'Tunnel exit reached', { totalDist: 34 }],
      ['Sky Slalom', '6 aerial gates — 40 m.', 'Quick turns', 'Clean slalom', { totalDist: 40 }],
      ['Delivery Drop', 'Drop cargo on pad — 44 m.', 'Precision drop', 'Cargo on target', { totalDist: 44 }],
      ['Storm Fly', 'Wind storm course — 50 m.', 'Stability control', 'Finish in storm', { totalDist: 50, arenaType: 'sky' }],
      ['Rescue Hover', 'Rescue at altitude — 54 m.', 'Hover + grab', 'Rescue complete', { totalDist: 54 }],
      ['Mountain Fly', 'Canyon and peaks — 60 m.', 'Terrain following', 'Full route', { totalDist: 60, arenaType: 'jet' }],
      ['Night Flight', 'Dark sky course — 66 m.', 'Instrument fly', 'All rings at night', { totalDist: 66 }],
      ['Transcontinental', 'Epic 75 m aerial epic.', 'Ace pilot', 'Best time', { totalDist: 75, timeLimit: 0, icon: '🏆' }],
    ],
  },
  {
    id: 'underwater_ops', name: 'Underwater Ops', icon: '🌊', color: '#06b6d4',
    category: 'aerial', arenaType: 'underwater', cat: 'underwater',
    desc: 'Coral reefs, deep trenches, cave dives, pipe repairs, and ocean rescue missions.',
    skills: ['Buoyancy', 'Sonar Nav', 'Cave Dive', 'Repair', 'Deep Rescue'],
    recommendedWeek: 7, rec: ['underwater', 'submarine'],
    levels: [
      ['Shallow Reef', 'Explore coral — 24 m.', 'Basic sub control', 'Reach reef marker', { totalDist: 24 }],
      ['Fish Survey', 'Count 5 species zones — 30 m.', 'Observation stops', 'All zones visited', { totalDist: 30, checkpoints: 5 }],
      ['Cave Entry', 'First cave dive — 36 m.', 'Wall follow underwater', 'Cave exit found', { totalDist: 36 }],
      ['Pipe Repair 1', 'Fix one pipe joint — 40 m.', 'Tool arm use', 'Repair confirmed', { totalDist: 40 }],
      ['Deep Descent', 'Dive to trench — 46 m.', 'Pressure management', 'Reach depth marker', { totalDist: 46 }],
      ['Shark Alley', 'Navigate wildlife — 50 m.', 'Avoidance underwater', 'Zero contacts', { totalDist: 50, obstacles: 8 }],
      ['Multi-Pipe Repair', '3 repair stations — 56 m.', 'Multi-stop repair', 'All pipes fixed', { totalDist: 56, checkpoints: 3 }],
      ['Dark Cave', 'No visibility cave — 62 m.', 'Sonar navigation', 'Exit found', { totalDist: 62, obstacles: 12 }],
      ['Ocean Rescue', 'Rescue diver — 68 m.', 'Search and rescue', 'Survivor saved', { totalDist: 68 }],
      ['Mariana Run', 'Epic 78 m deep ocean.', 'Ocean master', 'Full mission', { totalDist: 78, timeLimit: 0, icon: '🏆' }],
    ],
  },
  {
    id: 'space_rover', name: 'Space Rover', icon: '🌕', color: '#94a3b8',
    category: 'advanced', arenaType: 'space', cat: 'space',
    desc: 'Moon rovers, Mars terrain, asteroid mining, zero-G courses, and station repairs.',
    skills: ['Low-G Drive', 'Terrain Scan', 'Mining', 'Zero-G', 'Station Repair'],
    recommendedWeek: 8, rec: ['rover', 'space', 'mining'],
    levels: [
      ['Moon Landing', 'Drive from lander — 26 m.', 'Low gravity drive', 'Reach flag', { totalDist: 26 }],
      ['Crater Rim', 'Circle crater edge — 32 m.', 'Slope navigation', 'Full rim circuit', { totalDist: 32 }],
      ['Rock Sample', 'Collect 3 samples — 38 m.', 'Sample arm', '3 samples bagged', { totalDist: 38, checkpoints: 3 }],
      ['Mars Ridge', 'Climb ridge line — 44 m.', 'Rough terrain', 'Summit reached', { totalDist: 44, arenaType: 'rough' }],
      ['Dust Storm', 'Navigate storm — 48 m.', 'Sensor reliance', 'Base reached', { totalDist: 48 }],
      ['Asteroid Hop', 'Jump between rocks — 52 m.', 'Precision hops', 'All rocks crossed', { totalDist: 52 }],
      ['Mining Run', 'Mine 4 nodes — 58 m.', 'Drill + collect', 'All nodes mined', { totalDist: 58, checkpoints: 4 }],
      ['Zero-G Course', 'Float through gates — 62 m.', 'Zero-G thrust', 'All gates', { totalDist: 62, arenaType: 'zero_g' }],
      ['Station Repair', 'Fix 3 modules — 68 m.', 'EVA repair', 'All modules green', { totalDist: 68, checkpoints: 3 }],
      ['Galaxy Trek', 'Epic 82 m space odyssey.', 'Space legend', 'Mission complete', { totalDist: 82, timeLimit: 0, icon: '🏆' }],
    ],
  },
  {
    id: 'warehouse_logistics', name: 'Warehouse Logistics', icon: '📦', color: '#d97706',
    category: 'factory', arenaType: 'warehouse', cat: 'factory',
    desc: 'Conveyor sorting, inventory runs, forklift precision, and mega-warehouse automation.',
    skills: ['Conveyor Sort', 'Inventory', 'Forklift', 'Route Optimize', 'Mega Warehouse'],
    recommendedWeek: 8, rec: ['factory', 'tank', 'rover'],
    levels: [
      ['Shelf Run A', 'Navigate aisle A — 28 m.', 'Warehouse driving', 'End of aisle', { totalDist: 28, arenaType: 'warehouse' }],
      ['Barcode Scan', 'Scan 4 shelf codes — 34 m.', 'Scan + log', 'All barcodes scanned', { totalDist: 34, checkpoints: 4 }],
      ['Conveyor Sort', 'Sort 6 items — 40 m.', 'Color sort logic', 'All sorted', { totalDist: 40, arenaType: 'factory' }],
      ['Forklift Pick', 'Lift and move pallet — 44 m.', 'Lift control', 'Pallet delivered', { totalDist: 44 }],
      ['Cross-Aisle', 'Cross 4 aisles — 50 m.', 'Intersection rules', 'Zero collisions', { totalDist: 50, obstacles: 8 }],
      ['Inventory Count', '8 bin checks — 54 m.', 'Systematic search', 'All bins checked', { totalDist: 54, checkpoints: 8 }],
      ['Rush Order', 'Priority package — 58 m.', 'Express routing', 'Delivered on time', { totalDist: 58 }],
      ['Night Shift', 'Dim warehouse run — 64 m.', 'Low-light nav', 'Shift complete', { totalDist: 64, arenaType: 'warehouse' }],
      ['Mega Sort', '12-item mega sort — 70 m.', 'Full automation', '100% accuracy', { totalDist: 70 }],
      ['Logistics King', 'Epic 80 m warehouse marathon.', 'Supply chain master', 'Perfect run', { totalDist: 80, timeLimit: 0, icon: '🏆' }],
    ],
  },
];

export const ROBOT_TRACKS = TRACK_DEFS.map(t => ({
  ...t,
  levels: buildTrackLevels(t, t.levels),
}));

/** 60 bonus classic-style courses (longer variants) */
const BONUS_TEMPLATES = [
  { id: 'mega_obstacle', name: 'Mega Obstacle Gauntlet', icon: '🏁', arenaType: 'ground', color: '#22c55e', cat: 'ground', totalDist: 55, obstacles: 16, desc: '55 m ground course packed with obstacles.' },
  { id: 'ultra_line', name: 'Ultra Line Marathon', icon: '〰️', arenaType: 'line_follow', color: '#10b981', cat: 'line_follow', totalDist: 70, obstacles: 4, desc: '70 m continuous line following challenge.' },
  { id: 'sky_marathon', name: 'Sky Marathon', icon: '💫', arenaType: 'sky', color: '#0ea5e9', cat: 'air', totalDist: 60, obstacles: 12, desc: 'Long aerial ring course through the clouds.' },
  { id: 'factory_epic', name: 'Factory Epic Shift', icon: '🏭', arenaType: 'factory', color: '#8b5cf6', cat: 'factory', totalDist: 58, obstacles: 10, desc: 'Full factory floor automation run.' },
  { id: 'rough_epic', name: 'Rough Terrain Epic', icon: '🪨', arenaType: 'rough', color: '#78716c', cat: 'heavy', totalDist: 65, obstacles: 18, desc: 'Epic rocky terrain endurance course.' },
  { id: 'jet_epic', name: 'Jet Canyon Epic', icon: '✈️', arenaType: 'jet', color: '#f59e0b', cat: 'jet', totalDist: 72, obstacles: 8, desc: 'High-speed canyon flight marathon.' },
  { id: 'hover_epic', name: 'Neon City Epic', icon: '🌆', arenaType: 'hover', color: '#0ea5e9', cat: 'hover', totalDist: 68, obstacles: 14, desc: 'Navigate the entire neon city grid.' },
  { id: 'underwater_epic', name: 'Deep Ocean Epic', icon: '🐠', arenaType: 'underwater', color: '#06b6d4', cat: 'underwater', totalDist: 74, obstacles: 12, desc: 'Full deep-sea exploration mission.' },
  { id: 'space_epic', name: 'Mars Marathon', icon: '🔴', arenaType: 'space', color: '#ef4444', cat: 'space', totalDist: 78, obstacles: 14, desc: 'Cross the Martian surface end to end.' },
  { id: 'combat_epic', name: 'Battle Arena Epic', icon: '⚔️', arenaType: 'combat', color: '#ef4444', cat: 'combat', totalDist: 52, obstacles: 10, desc: 'Extended combat arena survival.' },
  { id: 'collect_epic', name: 'Treasure Hunt Epic', icon: '💎', arenaType: 'collect_hard', color: '#fbbf24', cat: 'ground', totalDist: 62, obstacles: 8, desc: 'Collect all treasures across the map.' },
  { id: 'dodge_epic', name: 'Asteroid Storm Epic', icon: '☄️', arenaType: 'dodge_asteroids', color: '#f97316', cat: 'air', totalDist: 58, obstacles: 20, desc: 'Survive the longest asteroid storm.' },
  { id: 'maze_epic', name: 'Labyrinth Epic', icon: '🌀', arenaType: 'ground', color: '#8b5cf6', cat: 'ground', totalDist: 70, obstacles: 22, desc: 'The biggest maze in the studio.' },
  { id: 'terrain_epic', name: 'Jungle Epic Trek', icon: '🌿', arenaType: 'terrain', color: '#16a34a', cat: 'terrain', totalDist: 66, obstacles: 16, desc: 'Cross the entire jungle biome.' },
  { id: 'lego_epic', name: 'LEGO World Epic', icon: '🧱', arenaType: 'lego', color: '#ef4444', cat: 'lego', totalDist: 54, obstacles: 12, desc: 'Explore the giant LEGO world.' },
];

function expandBonus(base, variant) {
  const mult = 1 + variant * 0.15;
  const totalDist = Math.round(base.totalDist * mult);
  return {
    id: `${base.id}_v${variant + 1}`,
    trackId: 'bonus',
    level: variant + 1,
    name: `${base.name}${variant > 0 ? ` · Run ${variant + 1}` : ''}`,
    desc: base.desc,
    learn: 'Advanced course mastery',
    successCriteria: 'Complete the full course',
    timeLimit: Math.round(totalDist * 6),
    difficulty: Math.min(5, 2 + variant),
    xpReward: 150 + variant * 50,
    basePoints: 300 + variant * 100,
    obstacles: Math.min(24, base.obstacles + variant * 2),
    totalDist,
    checkpoints: Math.floor(totalDist / 10),
    length: courseLength(totalDist),
    lengthLabel: COURSE_LENGTHS[courseLength(totalDist)].label,
    estMinutes: Math.ceil(totalDist / 10),
    arenaType: base.arenaType,
    color: base.color,
    cat: base.cat,
    icon: base.icon,
    isBonus: true,
    category: 'extreme',
    rec: ['rover', 'drone', 'humanoid'],
  };
}

export const BONUS_COURSES = BONUS_TEMPLATES.flatMap(b => [0, 1, 2, 3].map(v => expandBonus(b, v)));

export const ALL_TRACK_LEVELS = ROBOT_TRACKS.flatMap(t =>
  t.levels.map(l => ({ ...l, trackName: t.name, trackIcon: t.icon, trackColor: t.color }))
);

export const ALL_COURSES_CATALOG = [...ALL_TRACK_LEVELS, ...BONUS_COURSES];

export function getTrack(trackId) {
  return ROBOT_TRACKS.find(t => t.id === trackId) || null;
}

export function getTrackLevel(trackId, level) {
  const track = getTrack(trackId);
  return track?.levels.find(l => l.level === level) || null;
}

export function getTrackLevelById(levelId) {
  return ALL_COURSES_CATALOG.find(l => l.id === levelId) || null;
}

export function trackLevelToCourse(level) {
  if (!level) return null;
  return {
    id: level.id,
    cat: level.cat || level.trackId,
    icon: level.icon || level.trackIcon || '🤖',
    name: level.name,
    desc: level.desc,
    arenaType: level.arenaType,
    color: level.color || level.trackColor,
    obstacles: level.obstacles ?? 6,
    totalDist: level.totalDist ?? 30,
    checkpoints: level.checkpoints ?? 3,
    laps: level.laps ?? 1,
    rec: level.rec || ['rover', 'humanoid'],
    trackId: level.trackId,
    trackLevel: level.level,
    timeLimit: level.timeLimit,
    xpReward: level.xpReward,
    basePoints: level.basePoints,
    successCriteria: level.successCriteria,
    learn: level.learn,
    codeHint: level.codeHint,
    length: level.length,
    lengthLabel: level.lengthLabel,
    estMinutes: level.estMinutes,
    isTrackLevel: !level.isBonus,
    isBonus: level.isBonus || false,
  };
}

export function calcTrackScore(level, stats) {
  const time = stats.time || 0;
  const collisions = stats.collisions || 0;
  const base = level.basePoints || 100;
  const distFactor = (level.totalDist || 30) / 30;
  const timeBonus = level.timeLimit > 0
    ? Math.max(0, Math.floor((level.timeLimit - time) * 2))
    : Math.max(0, Math.floor((90 / distFactor) - time));
  const collPen = collisions * 25;
  const perfectBonus = collisions === 0 ? Math.floor(base * 0.25) : 0;
  const accuracyBonus = stats.progress >= 99 ? Math.floor(base * 0.15) : 0;
  return Math.max(10, Math.floor(base + timeBonus + perfectBonus + accuracyBonus - collPen));
}

export function calcTrackXp(level, stats) {
  let xp = level.xpReward || 100;
  if (!stats.collisions) xp += 50;
  if (stats.progress >= 99) xp += 25;
  if ((level.totalDist || 0) >= 60) xp += 30;
  return xp;
}

export const ACHIEVEMENT_BADGES = [
  { id: 'first_track', name: 'First Course Complete', icon: '🎖️', desc: 'Complete any course' },
  { id: 'line_master', name: 'Line Master', icon: '〰️', desc: 'Complete all Line Following levels' },
  { id: 'pick_pro', name: 'Pick & Place Pro', icon: '🦾', desc: 'Complete all Pick & Place levels' },
  { id: 'obstacle_ace', name: 'Obstacle Ace', icon: '🚧', desc: 'Complete all Obstacle Avoidance levels' },
  { id: 'speed_demon', name: 'Speed Demon', icon: '⚡', desc: 'Complete all Speed Challenge levels' },
  { id: 'drone_ace', name: 'Drone Ace', icon: '🚁', desc: 'Complete all Drone Pilot levels' },
  { id: 'track_explorer', name: 'Track Explorer', icon: '🗺️', desc: 'Complete levels in 6+ tracks' },
  { id: 'marathon_runner', name: 'Marathon Runner', icon: '🏔️', desc: 'Complete an epic 70m+ course' },
  { id: 'perfect_run', name: 'Perfect Run', icon: '🌟', desc: 'Finish with zero collisions' },
  { id: 'centurion', name: 'Centurion', icon: '💯', desc: 'Complete 100 courses' },
  { id: 'ten_thousand', name: '10,000 Points', icon: '💎', desc: 'Earn 10,000 track points total' },
];
