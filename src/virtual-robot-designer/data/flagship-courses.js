/**
 * flagship-courses.js — 8 distinct Robot Studio course programs (5 levels each)
 */

export const FLAGSHIP_PROGRAMS = [
  {
    id: 'line_following_champion',
    name: 'Line Following Champion',
    icon: '〰️',
    color: '#00d9ff',
    arenaType: 'transit_tunnel',
    cat: 'flagship_line',
    theme: 'Underground Light Rail',
    blurb: 'Master neon track navigation in a sci-fi transit tunnel',
    skills: ['Color sensors', 'PID tuning', 'Speed optimization'],
    rec: ['rover', 'humanoid', 'tank'],
    levels: [
      { level: 1, name: 'Straight & True', desc: 'Follow the cyan track — use line sensors to stay centered', totalDist: 30, obstacles: 0, timeLimit: 45, estMinutes: 2, wobble: 0, forks: false },
      { level: 2, name: 'Gentle Curves', desc: 'Smooth S-curves through the transit hub', totalDist: 38, obstacles: 2, timeLimit: 55, estMinutes: 3, wobble: 1.2, forks: false },
      { level: 3, name: 'Tight Serpentine', desc: 'React fast to sharp direction changes', totalDist: 45, obstacles: 4, timeLimit: 70, estMinutes: 4, wobble: 2.2, forks: false },
      { level: 4, name: 'Multi-Color Priority', desc: 'Follow the flashing indicator line', totalDist: 40, obstacles: 3, timeLimit: 80, estMinutes: 5, wobble: 1.8, forks: true },
      { level: 5, name: 'Speed Master', desc: 'Beat your best time on the championship straight', totalDist: 35, obstacles: 0, timeLimit: 25, estMinutes: 3, wobble: 0.3, forks: false },
    ],
    story: 'Train as a courier robot for the city underground rapid transit. Master precise line tracking through glowing neon tunnels.',
    tip: 'Use LINE_DETECT blocks — stay centered on the cyan glow!',
    objectives: ['Stay on the glowing track', 'Minimize deviation', 'Beat the time target'],
    collectibles: 'Speed markers · calibration beacons',
  },
  {
    id: 'master_manipulator',
    name: 'Master Manipulator',
    icon: '🦾',
    color: '#3b82f6',
    arenaType: 'warehouse_sort',
    cat: 'flagship_warehouse',
    theme: 'Automated Warehouse',
    blurb: 'Pick, sort, and place items on high-speed conveyor belts',
    skills: ['Gripper control', 'Color sorting', 'Placement accuracy'],
    rec: ['factory', 'humanoid', 'rover'],
    levels: [
      { level: 1, name: 'Simple Pickup', desc: 'Pick one cube and place in the matching bin', totalDist: 12, obstacles: 2, timeLimit: 90, estMinutes: 3 },
      { level: 2, name: 'Rapid Sorting', desc: 'Sort 3 colored items before the belt moves on', totalDist: 18, obstacles: 3, timeLimit: 120, estMinutes: 4 },
      { level: 3, name: 'Mixed Items', desc: 'Handle cubes, cylinders, and spheres by size', totalDist: 22, obstacles: 5, timeLimit: 150, estMinutes: 5 },
      { level: 4, name: 'High-Speed Sorting', desc: '8 items on a fast conveyor — no drops!', totalDist: 26, obstacles: 6, timeLimit: 150, estMinutes: 6 },
      { level: 5, name: 'Efficiency Championship', desc: 'Maximum throughput with perfect accuracy', totalDist: 28, obstacles: 8, timeLimit: 120, estMinutes: 5 },
    ],
    story: 'Manage a robotic arm in a high-speed warehouse. Pick items from conveyor belts and sort them into color-coded bins.',
    tip: 'Open gripper → move to item → close → carry to matching bin color.',
    objectives: ['Sort all items correctly', 'Zero drops', 'Beat the throughput timer'],
    collectibles: 'Sorted packages · efficiency bonuses',
  },
  {
    id: 'obstacle_navigator',
    name: 'Obstacle Navigator',
    icon: '🌴',
    color: '#22c55e',
    arenaType: 'jungle_expedition',
    cat: 'flagship_jungle',
    theme: 'Jungle Expedition',
    blurb: 'Navigate dense jungle terrain and avoid natural obstacles',
    skills: ['Distance sensors', 'Path planning', 'Collision avoidance'],
    rec: ['rover', 'spider', 'tank', 'humanoid'],
    levels: [
      { level: 1, name: 'Clear Path', desc: 'Navigate around 2 trees on a clear trail', totalDist: 20, obstacles: 4, timeLimit: 90, estMinutes: 3 },
      { level: 2, name: 'Tighter Spaces', desc: 'Thread through narrower jungle gaps', totalDist: 25, obstacles: 8, timeLimit: 100, estMinutes: 4 },
      { level: 3, name: 'Unknown Terrain', desc: 'Find the path through dense vegetation', totalDist: 30, obstacles: 12, timeLimit: 120, estMinutes: 5 },
      { level: 4, name: 'Dynamic Obstacles', desc: 'Avoid moving hazards in the jungle', totalDist: 28, obstacles: 14, timeLimit: 110, estMinutes: 5 },
      { level: 5, name: 'Speed Run', desc: 'Complete the jungle route in minimum time', totalDist: 32, obstacles: 10, timeLimit: 60, estMinutes: 4 },
    ],
    story: 'Your explorer robot cuts through dense jungle to reach the research station. Master real-time obstacle avoidance.',
    tip: 'Scan ahead with distance sensors — plan your turns early!',
    objectives: ['Reach the station', 'Avoid all trees and rocks', 'Minimize collisions'],
    collectibles: 'Research samples · trail markers',
  },
  {
    id: 'velocity_champion',
    name: 'Velocity Champion',
    icon: '🏎️',
    color: '#ff0080',
    arenaType: 'neon_race',
    cat: 'flagship_race',
    theme: 'Racing Circuit Championship',
    blurb: 'Maximize speed on a professional neon racing circuit',
    skills: ['Motor control', 'Smooth turning', 'Lap optimization'],
    rec: ['rover', 'hover', 'race', 'racedrone'],
    levels: [
      { level: 1, name: 'Speed Basics', desc: 'Build a speed system — SET SPEED + brake before the first turn', totalDist: 50, obstacles: 0, timeLimit: 40, estMinutes: 2 },
      { level: 2, name: 'Smooth Turns', desc: 'Figure-8 circuit with gentle banking', totalDist: 42, obstacles: 4, timeLimit: 50, estMinutes: 3 },
      { level: 3, name: 'Racing Circuit', desc: 'Full circuit with elevation and hairpins', totalDist: 48, obstacles: 6, timeLimit: 55, estMinutes: 4 },
      { level: 4, name: 'Acceleration Perfection', desc: 'Perfect your 0-to-max acceleration curve', totalDist: 60, obstacles: 2, timeLimit: 35, estMinutes: 3 },
      { level: 5, name: 'Championship Run', desc: 'Beat your personal best lap time', totalDist: 50, obstacles: 5, timeLimit: 30, estMinutes: 3 },
    ],
    story: 'Program a high-speed racer for the Robot Racing Championship. Break the lap record!',
    tip: 'Use SET_SPEED and smooth turns — brake before corners, accelerate on straights.',
    objectives: ['Complete the lap', 'Stay on the racing line', 'Beat the time target'],
    collectibles: 'Turbo pads · lap time bonuses',
  },
  {
    id: 'emergency_rescue',
    name: 'Emergency Rescue',
    icon: '🚨',
    color: '#ef4444',
    arenaType: 'disaster_zone',
    cat: 'flagship_rescue',
    theme: 'Disaster Zone Search & Rescue',
    blurb: 'Locate survivors and deliver supplies under pressure',
    skills: ['Multi-objective planning', 'Hazard avoidance', 'Sensor search'],
    rec: ['rover', 'humanoid', 'medbot', 'firebot'],
    levels: [
      { level: 1, name: 'Simple Rescue', desc: 'Find one survivor and guide to safety', totalDist: 22, obstacles: 6, timeLimit: 120, estMinutes: 4 },
      { level: 2, name: 'Multiple Survivors', desc: 'Locate 3 scattered survivors', totalDist: 30, obstacles: 10, timeLimit: 180, estMinutes: 5 },
      { level: 3, name: 'Supply Delivery', desc: 'Deliver supplies then rescue survivors', totalDist: 35, obstacles: 12, timeLimit: 240, estMinutes: 6 },
      { level: 4, name: 'Danger Navigation', desc: 'Avoid fire zones and unstable rubble', totalDist: 38, obstacles: 16, timeLimit: 300, estMinutes: 7 },
      { level: 5, name: 'Full Disaster Response', desc: 'Complete all rescue objectives under time pressure', totalDist: 45, obstacles: 18, timeLimit: 600, estMinutes: 10 },
    ],
    story: 'Operate a rescue robot in disaster zones. Locate survivors, deliver supplies, and evacuate to safety.',
    tip: 'Green zones are safe — red zones are hazards. Rescue blue markers first!',
    objectives: ['Rescue all survivors', 'Deliver supply caches', 'Avoid hazard zones'],
    collectibles: 'Survivor rescues · supply crates',
  },
  {
    id: 'soccer_striker',
    name: 'Soccer Striker',
    icon: '⚽',
    color: '#00aa00',
    arenaType: 'soccer_arena',
    cat: 'flagship_soccer',
    theme: 'Robot Soccer Championship',
    blurb: 'Score goals and outplay AI opponents on the pitch',
    skills: ['Ball tracking', 'Trajectory prediction', 'Strategy'],
    rec: ['rover', 'humanoid', 'tank'],
    levels: [
      { level: 1, name: 'Ball Control', desc: 'Push the ball 20m in a straight line', totalDist: 20, obstacles: 0, timeLimit: 60, estMinutes: 2 },
      { level: 2, name: 'Scoring Practice', desc: 'Score from 3 different angles', totalDist: 25, obstacles: 2, timeLimit: 90, estMinutes: 3 },
      { level: 3, name: '1v1 Soccer', desc: 'Beat a simple AI opponent 2-0', totalDist: 40, obstacles: 4, timeLimit: 120, estMinutes: 4 },
      { level: 4, name: 'Advanced AI', desc: 'Outsmart a blocking opponent', totalDist: 45, obstacles: 6, timeLimit: 180, estMinutes: 5 },
      { level: 5, name: 'Championship Match', desc: 'Win the Robot Soccer Cup!', totalDist: 50, obstacles: 8, timeLimit: 180, estMinutes: 5 },
    ],
    story: 'Compete in the Robot Soccer League. Master ball control and score the championship-winning goal!',
    tip: 'Push the orange ball toward the white goal frame — predict where it will roll.',
    objectives: ['Score goals', 'Control the ball', 'Beat the opponent'],
    collectibles: 'Goals scored · possession bonuses',
  },
  {
    id: 'maze_master',
    name: 'Maze Master',
    icon: '🏛️',
    color: '#9900ff',
    arenaType: 'temple_maze',
    cat: 'flagship_maze',
    theme: 'Ancient Temple Labyrinth',
    blurb: 'Navigate stone corridors and reach the central chamber',
    skills: ['Wall following', 'Spatial mapping', 'Pathfinding'],
    rec: ['rover', 'spider', 'humanoid'],
    levels: [
      { level: 1, name: 'Simple Maze', desc: '10×10 grid with a clear path to center', totalDist: 24, obstacles: 14, timeLimit: 120, estMinutes: 3 },
      { level: 2, name: 'Medium Maze', desc: '15×15 with dead-ends to avoid', totalDist: 30, obstacles: 22, timeLimit: 180, estMinutes: 4 },
      { level: 3, name: 'Complex Labyrinth', desc: '20×20 — strategy required', totalDist: 36, obstacles: 30, timeLimit: 240, estMinutes: 5 },
      { level: 4, name: 'Random Maze', desc: 'Procedurally generated layout each run', totalDist: 38, obstacles: 32, timeLimit: 240, estMinutes: 5 },
      { level: 5, name: 'Timed Escape', desc: 'Escape the labyrinth as fast as possible', totalDist: 40, obstacles: 28, timeLimit: 60, estMinutes: 4 },
    ],
    story: 'Navigate an ancient temple labyrinth. Find the glowing central chamber before time runs out.',
    tip: 'Use wall-following at intersections — map where you have been!',
    objectives: ['Reach the center chamber', 'Avoid dead-ends', 'Escape before time runs out'],
    collectibles: 'Temple glyphs · treasure markers',
  },
  {
    id: 'precision_delivery',
    name: 'Precision Delivery',
    icon: '🏥',
    color: '#0066cc',
    arenaType: 'hospital_corridor',
    cat: 'flagship_hospital',
    theme: 'Surgical Supply Delivery',
    blurb: 'Deliver supplies through tight hospital corridors',
    skills: ['Fine movement', 'Precision positioning', 'Collision avoidance'],
    rec: ['rover', 'medbot', 'factory', 'humanoid'],
    levels: [
      { level: 1, name: 'Simple Delivery', desc: 'One supply to one marked bay — 20m', totalDist: 20, obstacles: 4, timeLimit: 90, estMinutes: 3 },
      { level: 2, name: 'Multiple Deliveries', desc: '3 supplies to 3 different stations', totalDist: 35, obstacles: 8, timeLimit: 180, estMinutes: 4 },
      { level: 3, name: 'Narrow Passages', desc: 'Navigate tight corridors past equipment', totalDist: 40, obstacles: 14, timeLimit: 200, estMinutes: 5 },
      { level: 4, name: 'Time Pressure', desc: 'Faster deliveries — zero equipment contact', totalDist: 42, obstacles: 16, timeLimit: 150, estMinutes: 5 },
      { level: 5, name: 'Perfect Execution', desc: '5 deliveries — precision within ±5cm', totalDist: 48, obstacles: 18, timeLimit: 240, estMinutes: 6 },
    ],
    story: 'You are a precision delivery robot in a hospital supply system. Every centimeter counts.',
    tip: 'Move slowly in narrow corridors — green zones are delivery targets.',
    objectives: ['Deliver all supplies', 'Zero equipment collisions', 'Hit precision markers'],
    collectibles: 'Delivery confirmations · accuracy bonuses',
  },
];

/** Flatten programs into selectable course objects */
export function expandFlagshipCourses() {
  const out = [];
  FLAGSHIP_PROGRAMS.forEach((prog) => {
    prog.levels.forEach((lv) => {
      const id = `${prog.id}_l${lv.level}`;
      out.push({
        id,
        flagshipId: prog.id,
        flagshipLevel: lv.level,
        isFlagship: true,
        cat: prog.cat,
        icon: prog.icon,
        name: `${prog.name} — L${lv.level}`,
        shortName: lv.name,
        desc: lv.desc,
        arenaType: prog.arenaType,
        color: prog.color,
        obstacles: lv.obstacles ?? 4,
        totalDist: lv.totalDist,
        timeLimit: lv.timeLimit,
        estMinutes: lv.estMinutes,
        trackLevel: lv.level,
        wobble: lv.wobble,
        forks: lv.forks,
        checkpoints: Math.max(2, Math.floor((lv.totalDist || 20) / 12)),
        rec: prog.rec,
        programName: prog.name,
        theme: prog.theme,
        skills: prog.skills,
      });
    });
  });
  return out;
}

/** Story entries keyed by flat course id */
export function buildFlagshipStories() {
  const stories = {};
  FLAGSHIP_PROGRAMS.forEach((prog) => {
    prog.levels.forEach((lv) => {
      const id = `${prog.id}_l${lv.level}`;
      stories[id] = {
        emoji: prog.icon,
        story: `${prog.story} — Level ${lv.level}: ${lv.name}. ${lv.desc}`,
        objectives: [
          lv.desc,
          ...(prog.objectives || []).slice(0, 2),
        ],
        tip: prog.tip,
        collectibles: prog.collectibles,
        badges: ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'][lv.level - 1],
      };
    });
  });
  return stories;
}

export const FLAGSHIP_WORLD_SECTIONS = {
  flagship_line: { label: 'Line Following Champion', icon: '〰️', blurb: 'Underground neon transit tunnels', color: '#00d9ff' },
  flagship_warehouse: { label: 'Master Manipulator', icon: '🦾', blurb: 'High-speed warehouse sorting', color: '#3b82f6' },
  flagship_jungle: { label: 'Obstacle Navigator', icon: '🌴', blurb: 'Dense jungle expedition', color: '#22c55e' },
  flagship_race: { label: 'Velocity Champion', icon: '🏎️', blurb: 'Professional racing circuit', color: '#ff0080' },
  flagship_rescue: { label: 'Emergency Rescue', icon: '🚨', blurb: 'Disaster zone search & rescue', color: '#ef4444' },
  flagship_soccer: { label: 'Soccer Striker', icon: '⚽', blurb: 'Robot soccer championship', color: '#00aa00' },
  flagship_maze: { label: 'Maze Master', icon: '🏛️', blurb: 'Ancient temple labyrinth', color: '#9900ff' },
  flagship_hospital: { label: 'Precision Delivery', icon: '🏥', blurb: 'Hospital supply corridors', color: '#0066cc' },
};
