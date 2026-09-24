/**
 * Primary-school Robot Studio — 8 arena sets × 10 missions (Arena Bible).
 * Each mode has its own place, palette, floor, skill, and child-facing objective.
 */
const hex = (h) => Number.parseInt(String(h).replace('#', ''), 16);

/** Per-mode teaching labels aligned to the Arena Bible progression. */
export const ARENA_TEACH = [
  { difficulty: 'Tutorial', skill: 'Sequence', tryThis: 'Add one movement block, then press Simulate.' },
  { difficulty: 'Easy', skill: 'Ordered steps', tryThis: 'Do step one, then step two, then step three.' },
  { difficulty: 'Easy', skill: 'Loops', tryThis: 'Use Repeat to do the same move more than once.' },
  { difficulty: 'Medium', skill: 'Conditions', tryThis: 'Use If or a sensor so the robot chooses what to do.' },
  { difficulty: 'Medium', skill: 'Speed & timing', tryThis: 'Add Wait or go slower on tricky parts.' },
  { difficulty: 'Medium', skill: 'Repeated actions', tryThis: 'Use Repeat to visit every checkpoint.' },
  { difficulty: 'Hard', skill: 'Obstacle sensing', tryThis: 'Use a sensor block to look ahead.' },
  { difficulty: 'Hard', skill: 'Precision', tryThis: 'Move carefully — small steps work best.' },
  { difficulty: 'Hard', skill: 'Scanning', tryThis: 'Use sensors or variables to find targets.' },
  { difficulty: 'Expert', skill: 'Capstone', tryThis: 'Combine moves, loops, and If blocks you learned!' },
];

function teach(i, row) {
  const t = ARENA_TEACH[i] || ARENA_TEACH[9];
  return {
    difficulty: row.difficulty || t.difficulty,
    skill: row.skill || t.skill,
    tryThis: row.tryThis || t.tryThis,
  };
}

function A(list) {
  return list.map((row, i) => {
    const t = teach(i, row);
    return {
      mode: i + 1,
      id: row.id,
      title: row.title,
      emoji: row.emoji,
      objective: row.objective,
      landmark: row.landmark,
      floorKind: row.floorKind,
      sky: hex(row.sky),
      ground: hex(row.ground),
      fog: hex(row.fog),
      gradient: row.gradient,
      difficulty: t.difficulty,
      skill: t.skill,
      tryThis: t.tryThis,
      estMinutes: [3, 4, 4, 5, 5, 6, 6, 7, 7, 8][i],
      sceneTheme: row.sceneTheme || row.id,
    };
  });
}

/** Set 1 — Ground robots (Rover, Scout, Crawler, Farm, Safety Patrol, Mining, Space, LEGO, Heavy, Quiet). */
export const SET_GROUND = A([
  { id: 'garden_maze', title: 'Garden Maze', emoji: '🌻', objective: 'Follow the flower path to the flower station.', landmark: 'Sunflower arch', floorKind: 'farm_field', sky: '#87ceeb', ground: '#86efac', fog: '#bbf7d0', gradient: 'linear-gradient(135deg,#86efac,#22c55e)', skill: 'Sequence & turns' },
  { id: 'classroom_delivery', title: 'Classroom Delivery', emoji: '📚', objective: 'Carry the supply box to three marked tables.', landmark: 'Teacher desk', floorKind: 'lab_grid', sky: '#fef3c7', ground: '#fde68a', fog: '#fef9c3', gradient: 'linear-gradient(135deg,#fde68a,#f59e0b)', skill: 'Checkpoints' },
  { id: 'beach_cleanup', title: 'Beach Clean-Up', emoji: '🏖️', objective: 'Collect bottles and drop them in sorting bins.', landmark: 'Recycling bins', floorKind: 'sandy_seabed', sky: '#7dd3fc', ground: '#fde68a', fog: '#bae6fd', gradient: 'linear-gradient(135deg,#38bdf8,#fde68a)', skill: 'Loops & collection' },
  { id: 'toy_city_traffic', title: 'Toy City Traffic', emoji: '🏙️', objective: 'Follow road rules and stop at traffic lights.', landmark: 'Traffic light', floorKind: 'city_plaza', sky: '#87ceeb', ground: '#e2e8f0', fog: '#bae6fd', gradient: 'linear-gradient(135deg,#38bdf8,#a855f7)', skill: 'Conditions & sensors' },
  { id: 'playground_bridge', title: 'Playground Bridge', emoji: '🛝', objective: 'Cross ramps and bridges without falling off.', landmark: 'Rainbow bridge', floorKind: 'stud_mat', sky: '#bfdbfe', ground: '#fbbf24', fog: '#dbeafe', gradient: 'linear-gradient(135deg,#60a5fa,#fbbf24)', skill: 'Speed & timing' },
  { id: 'solar_farm', title: 'Solar Farm Inspection', emoji: '☀️', objective: 'Visit each solar panel in order.', landmark: 'Solar row', floorKind: 'desert_sand', sky: '#38bdf8', ground: '#fcd34d', fog: '#fde68a', gradient: 'linear-gradient(135deg,#38bdf8,#fbbf24)', skill: 'Loops' },
  { id: 'mountain_tunnel', title: 'Mountain Tunnel', emoji: '⛰️', objective: 'Avoid rocks and reach the cave exit.', landmark: 'Tunnel exit', floorKind: 'mine_tunnel', sky: '#93c5fd', ground: '#78716c', fog: '#cbd5e1', gradient: 'linear-gradient(135deg,#64748b,#93c5fd)', skill: 'Obstacle detection' },
  { id: 'museum_night', title: 'Museum Night Route', emoji: '🦕', objective: 'Deliver a lost item without bumping exhibits.', landmark: 'Dino exhibit', floorKind: 'temple_tiles', sky: '#1e3a5f', ground: '#78716c', fog: '#334155', gradient: 'linear-gradient(135deg,#1e3a5f,#fbbf24)', skill: 'Precision movement' },
  { id: 'moon_crater_path', title: 'Moon Crater Path', emoji: '🌕', objective: 'Map moon samples at each beacon.', landmark: 'Moon dome', floorKind: 'lunar_grey', sky: '#0f172a', ground: '#94a3b8', fog: '#64748b', gradient: 'linear-gradient(135deg,#0f172a,#94a3b8)', skill: 'Sensor scanning' },
  { id: 'robot_rally', title: 'Robot Rally Finale', emoji: '🏁', objective: 'Hit every checkpoint and finish at the trophy arch.', landmark: 'Trophy arch', floorKind: 'asphalt_lot', sky: '#fef08a', ground: '#64748b', fog: '#fde68a', gradient: 'linear-gradient(135deg,#fbbf24,#ef4444)', skill: 'Combine skills' },
]);

/** Set 2 — Aerial robots. */
export const SET_AERIAL = A([
  { id: 'cloud_ring_school', title: 'Cloud Ring School', emoji: '☁️', objective: 'Fly through the wide fluffy rings.', landmark: 'Cloud ring', floorKind: 'open_sky', sky: '#7dd3fc', ground: '#e0f2fe', fog: '#bae6fd', gradient: 'linear-gradient(135deg,#38bdf8,#ffffff)', skill: 'Basic flight' },
  { id: 'balloon_delivery', title: 'Balloon Delivery', emoji: '🎈', objective: 'Deliver parcels to balloon stations.', landmark: 'Balloon basket', floorKind: 'open_sky', sky: '#fda4af', ground: '#fecdd3', fog: '#fecdd3', gradient: 'linear-gradient(135deg,#fb7185,#38bdf8)', skill: 'Sequencing' },
  { id: 'rainbow_tunnel', title: 'Rainbow Tunnel', emoji: '🌈', objective: 'Pass through color gates in order.', landmark: 'Rainbow tube', floorKind: 'open_sky', sky: '#c4b5fd', ground: '#a78bfa', fog: '#ddd6fe', gradient: 'linear-gradient(135deg,#8b5cf6,#22d3ee)', skill: 'Ordered logic' },
  { id: 'floating_islands', title: 'Floating Islands', emoji: '🏝️', objective: 'Land on each safe island pad.', landmark: 'Sky island', floorKind: 'open_sky', sky: '#67e8f9', ground: '#86efac', fog: '#a5f3fc', gradient: 'linear-gradient(135deg,#22d3ee,#4ade80)', skill: 'Altitude control' },
  { id: 'mountain_rescue', title: 'Mountain Rescue Route', emoji: '🏔️', objective: 'Drop a supply box at the marked cabin.', landmark: 'Rescue cabin', floorKind: 'open_sky', sky: '#e0f2fe', ground: '#f8fafc', fog: '#bae6fd', gradient: 'linear-gradient(135deg,#7dd3fc,#ffffff)', skill: 'Precision & timing' },
  { id: 'photo_safari', title: 'Photo Safari', emoji: '📸', objective: 'Pause at camera icons to take photos.', landmark: 'Camera icon', floorKind: 'open_sky', sky: '#fde68a', ground: '#fef08a', fog: '#fef9c3', gradient: 'linear-gradient(135deg,#facc15,#38bdf8)', skill: 'Wait & events' },
  { id: 'wind_tunnel_lab', title: 'Wind Tunnel Lab', emoji: '💨', objective: 'Adjust when the wind arrows change.', landmark: 'Wind sock', floorKind: 'open_sky', sky: '#bae6fd', ground: '#e0f2fe', fog: '#e0f2fe', gradient: 'linear-gradient(135deg,#0ea5e9,#67e8f9)', skill: 'Conditions' },
  { id: 'festival_lights', title: 'Festival Light Show', emoji: '🎆', objective: 'Light up targets in sequence.', landmark: 'Lantern ring', floorKind: 'open_sky', sky: '#1e1b4b', ground: '#312e81', fog: '#4c1d95', gradient: 'linear-gradient(135deg,#7c3aed,#fbbf24)', skill: 'State & variables' },
  { id: 'space_dock', title: 'Space Dock Approach', emoji: '🛸', objective: 'Dock slowly at the friendly station.', landmark: 'Dock ring', floorKind: 'open_sky', sky: '#0f172a', ground: '#334155', fog: '#1e293b', gradient: 'linear-gradient(135deg,#0f172a,#22d3ee)', skill: 'Speed control' },
  { id: 'sky_academy', title: 'Sky Academy Finale', emoji: '🎓', objective: 'Rings, hover pads, and a final landing.', landmark: 'Academy banner', floorKind: 'open_sky', sky: '#fde68a', ground: '#fef3c7', fog: '#fef08a', gradient: 'linear-gradient(135deg,#f59e0b,#38bdf8)', skill: 'Combine flight skills' },
]);

/** Set 3 — Walkers & humanoids. */
export const SET_WALKER = A([
  { id: 'balance_gym', title: 'Balance Gym', emoji: '🤸', objective: 'Walk across the wide balance beam.', landmark: 'Balance beam', floorKind: 'gym_mats', sky: '#e0e7ff', ground: '#c7d2fe', fog: '#c7d2fe', gradient: 'linear-gradient(135deg,#818cf8,#22d3ee)', skill: 'Step movement' },
  { id: 'dance_stage', title: 'Dance Stage', emoji: '💃', objective: 'Copy the simple dance pattern on the tiles.', landmark: 'Disco floor', floorKind: 'stud_mat', sky: '#c4b5fd', ground: '#a78bfa', fog: '#ddd6fe', gradient: 'linear-gradient(135deg,#8b5cf6,#f472b6)', skill: 'Sequences' },
  { id: 'toy_workshop', title: 'Toy Workshop', emoji: '🧸', objective: 'Carry a toy part to the assembly table.', landmark: 'Toy table', floorKind: 'lab_grid', sky: '#fef3c7', ground: '#fde68a', fog: '#fef9c3', gradient: 'linear-gradient(135deg,#f59e0b,#22c55e)', skill: 'Pick-up & move' },
  { id: 'stepping_river', title: 'Stepping-Stone River', emoji: '🪨', objective: 'Step from stone to stone across the river.', landmark: 'River stones', floorKind: 'sandy_seabed', sky: '#67e8f9', ground: '#f5d58a', fog: '#a5f3fc', gradient: 'linear-gradient(135deg,#06b6d4,#84cc16)', skill: 'Timing' },
  { id: 'pose_mirror', title: 'Pose Mirror Studio', emoji: '🪞', objective: 'Match the pose at each mirror station.', landmark: 'Pose mirror', floorKind: 'gym_mats', sky: '#fbcfe8', ground: '#f9a8d4', fog: '#fce7f3', gradient: 'linear-gradient(135deg,#ec4899,#a855f7)', skill: 'Events' },
  { id: 'sports_day', title: 'Sports Day Track', emoji: '🏃', objective: 'Walk, jump, and balance through stations.', landmark: 'Sports cone', floorKind: 'gym_mats', sky: '#86efac', ground: '#4ade80', fog: '#bbf7d0', gradient: 'linear-gradient(135deg,#22c55e,#38bdf8)', skill: 'Mixed actions' },
  { id: 'teddy_rescue', title: 'Teddy Rescue Path', emoji: '🧸', objective: 'Bring the teddy to the safe zone.', landmark: 'Safe mat', floorKind: 'gym_mats', sky: '#fecdd3', ground: '#fda4af', fog: '#ffe4e6', gradient: 'linear-gradient(135deg,#fb7185,#22c55e)', skill: 'Path planning' },
  { id: 'wind_balance_bridge', title: 'Wind Balance Bridge', emoji: '💨', objective: 'Stay centered while walking the bridge.', landmark: 'Wind fan', floorKind: 'gym_mats', sky: '#bae6fd', ground: '#7dd3fc', fog: '#e0f2fe', gradient: 'linear-gradient(135deg,#38bdf8,#a5f3fc)', skill: 'Sensor feedback' },
  { id: 'talent_show', title: 'Robot Talent Show', emoji: '🎭', objective: 'Perform a five-step stage routine.', landmark: 'Stage lights', floorKind: 'gym_mats', sky: '#f9a8d4', ground: '#c084fc', fog: '#fbcfe8', gradient: 'linear-gradient(135deg,#ec4899,#fbbf24)', skill: 'Functions' },
  { id: 'walker_champion', title: 'Walker Champion Course', emoji: '🏆', objective: 'Beams, steps, poses, and a finish bow.', landmark: 'Champion stage', floorKind: 'gym_mats', sky: '#fde68a', ground: '#c4b5fd', fog: '#fef08a', gradient: 'linear-gradient(135deg,#f59e0b,#8b5cf6)', skill: 'Combine walker skills' },
]);

/** Set 4 — Underwater. */
export const SET_UNDERWATER = A([
  { id: 'coral_reef_survey', title: 'Coral Reef Survey', emoji: '🪸', objective: 'Scan friendly sea life at each marker.', landmark: 'Coral arch', floorKind: 'sandy_seabed', sky: '#67e8f9', ground: '#f5d58a', fog: '#5eead4', gradient: 'linear-gradient(135deg,#22d3ee,#f472b6)', skill: 'Movement & scanning' },
  { id: 'kelp_forest_maze', title: 'Kelp Forest Maze', emoji: '🌿', objective: 'Navigate without touching the kelp.', landmark: 'Kelp tower', floorKind: 'sandy_seabed', sky: '#6ee7b7', ground: '#365314', fog: '#a7f3d0', gradient: 'linear-gradient(135deg,#059669,#22d3ee)', skill: 'Path planning' },
  { id: 'turtle_rescue', title: 'Turtle Rescue Route', emoji: '🐢', objective: 'Guide the turtle to the safe reef.', landmark: 'Turtle friend', floorKind: 'sandy_seabed', sky: '#5eead4', ground: '#fde68a', fog: '#99f6e4', gradient: 'linear-gradient(135deg,#14b8a6,#fbbf24)', skill: 'Following & timing' },
  { id: 'shipwreck_mapping', title: 'Shipwreck Mapping', emoji: '⚓', objective: 'Scan rooms on the friendly wreck.', landmark: 'Map point', floorKind: 'sandy_seabed', sky: '#7dd3fc', ground: '#92400e', fog: '#bae6fd', gradient: 'linear-gradient(135deg,#0ea5e9,#b45309)', skill: 'Loops' },
  { id: 'glowing_cave', title: 'Glowing Cave', emoji: '✨', objective: 'Follow the light clues through the cave.', landmark: 'Glow crystal', floorKind: 'abyss_rock', sky: '#0e7490', ground: '#164e63', fog: '#155e75', gradient: 'linear-gradient(135deg,#0e7490,#22d3ee)', skill: 'Sensors' },
  { id: 'current_tunnel', title: 'Current Tunnel', emoji: '🌀', objective: 'Adjust buoyancy with the current arrows.', landmark: 'Current rings', floorKind: 'sandy_seabed', sky: '#38bdf8', ground: '#0369a1', fog: '#7dd3fc', gradient: 'linear-gradient(135deg,#0284c7,#67e8f9)', skill: 'Conditions' },
  { id: 'sonar_treasure', title: 'Sonar Treasure Grid', emoji: '📡', objective: 'Find hidden items with sonar pings.', landmark: 'Treasure chest', floorKind: 'sandy_seabed', sky: '#fde68a', ground: '#f5d58a', fog: '#fef08a', gradient: 'linear-gradient(135deg,#f59e0b,#22d3ee)', skill: 'Searching' },
  { id: 'ocean_cleanup', title: 'Ocean Clean-Up Zone', emoji: '♻️', objective: 'Collect litter into sorting baskets.', landmark: 'Recycle basket', floorKind: 'sandy_seabed', sky: '#86efac', ground: '#22c55e', fog: '#bbf7d0', gradient: 'linear-gradient(135deg,#22c55e,#0ea5e9)', skill: 'Repeat-until' },
  { id: 'thermal_vent_lab', title: 'Thermal Vent Lab', emoji: '♨️', objective: 'Collect samples without overheating.', landmark: 'Sample tube', floorKind: 'abyss_rock', sky: '#fb923c', ground: '#9a3412', fog: '#fdba74', gradient: 'linear-gradient(135deg,#ea580c,#22d3ee)', skill: 'If-statements' },
  { id: 'ocean_explorer', title: 'Ocean Explorer Finale', emoji: '🏅', objective: 'Reef, cave, current, and clean-up combined.', landmark: 'Explorer star', floorKind: 'sandy_seabed', sky: '#67e8f9', ground: '#f5d58a', fog: '#5eead4', gradient: 'linear-gradient(135deg,#06b6d4,#fbbf24)', skill: 'Combine underwater skills' },
]);

/** Set 5 — Robot arm & factory. */
export const SET_ARM = A([
  { id: 'color_cube_sorter', title: 'Color Cube Sorter', emoji: '🟥', objective: 'Move cubes into matching color trays.', landmark: 'Color trays', floorKind: 'lab_grid', sky: '#e0f2fe', ground: '#f1f5f9', fog: '#e2e8f0', gradient: 'linear-gradient(135deg,#ef4444,#3b82f6)', skill: 'Grip & release' },
  { id: 'block_tower', title: 'Block Tower Build', emoji: '🧱', objective: 'Stack blocks into the tower outline.', landmark: 'Tower outline', floorKind: 'lab_grid', sky: '#fef3c7', ground: '#fde68a', fog: '#fef9c3', gradient: 'linear-gradient(135deg,#f59e0b,#22c55e)', skill: 'Order & precision' },
  { id: 'art_drawing', title: 'Art Drawing Table', emoji: '✏️', objective: 'Trace the dotted star shape.', landmark: 'Star canvas', floorKind: 'lab_grid', sky: '#fce7f3', ground: '#fbcfe8', fog: '#fce7f3', gradient: 'linear-gradient(135deg,#ec4899,#a855f7)', skill: 'Coordinates' },
  { id: 'recycling_sorter', title: 'Recycling Sorter', emoji: '♻️', objective: 'Sort paper, plastic, and metal.', landmark: 'Recycle bins', floorKind: 'lab_grid', sky: '#dcfce7', ground: '#bbf7d0', fog: '#f0fdf4', gradient: 'linear-gradient(135deg,#22c55e,#0ea5e9)', skill: 'Conditions' },
  { id: 'cake_decorating', title: 'Cake Decorating', emoji: '🧁', objective: 'Place icing dots in a pattern.', landmark: 'Cupcake tray', floorKind: 'lab_grid', sky: '#fecdd3', ground: '#fda4af', fog: '#ffe4e6', gradient: 'linear-gradient(135deg,#fb7185,#fbbf24)', skill: 'Loops' },
  { id: 'music_bells', title: 'Music Bell Station', emoji: '🔔', objective: 'Tap bells in the melody order.', landmark: 'Bell row', floorKind: 'lab_grid', sky: '#fef9c3', ground: '#fde68a', fog: '#fefce8', gradient: 'linear-gradient(135deg,#eab308,#ec4899)', skill: 'Timing' },
  { id: 'garden_seed_tray', title: 'Garden Seed Tray', emoji: '🌱', objective: 'Drop seeds in the labeled squares.', landmark: 'Seed tray', floorKind: 'farm_field', sky: '#bbf7d0', ground: '#86efac', fog: '#dcfce7', gradient: 'linear-gradient(135deg,#22c55e,#84cc16)', skill: 'Grid logic' },
  { id: 'marble_mover', title: 'Marble Mover', emoji: '⚪', objective: 'Move marbles through the table maze.', landmark: 'Marble maze', floorKind: 'lab_grid', sky: '#e0e7ff', ground: '#c7d2fe', fog: '#eef2ff', gradient: 'linear-gradient(135deg,#6366f1,#22d3ee)', skill: 'Planning' },
  { id: 'toy_assembly', title: 'Toy Assembly Line', emoji: '🚗', objective: 'Add wheels and a sticker to the toy car.', landmark: 'Toy car', floorKind: 'factory_floor', sky: '#dbeafe', ground: '#94a3b8', fog: '#eff6ff', gradient: 'linear-gradient(135deg,#3b82f6,#22c55e)', skill: 'Functions' },
  { id: 'maker_finale', title: 'Maker Finale', emoji: '🏅', objective: 'Sort, stack, draw, and assemble the prize toy.', landmark: 'Maker trophy', floorKind: 'lab_grid', sky: '#fce7f3', ground: '#fbcfe8', fog: '#fdf2f8', gradient: 'linear-gradient(135deg,#ec4899,#fbbf24)', skill: 'Combine maker skills' },
]);

/** Set 6 — Sport / football. */
export const SET_SPORT = A([
  { id: 'training_dribble', title: 'Training Dribble', emoji: '⚽', objective: 'Dribble through the cones to the goal.', landmark: 'Training cone', floorKind: 'gym_mats', sky: '#86efac', ground: '#22c55e', fog: '#bbf7d0', gradient: 'linear-gradient(135deg,#16a34a,#fbbf24)', skill: 'Basic movement' },
  { id: 'passing_practice', title: 'Passing Practice', emoji: '🔁', objective: 'Pass to friendly teammates.', landmark: 'Pass lane', floorKind: 'gym_mats', sky: '#93c5fd', ground: '#3b82f6', fog: '#bfdbfe', gradient: 'linear-gradient(135deg,#2563eb,#22c55e)', skill: 'Timing' },
  { id: 'open_goal', title: 'Open Goal Shooting', emoji: '🥅', objective: 'Line up and shoot into the big goal.', landmark: 'Open goal', floorKind: 'gym_mats', sky: '#fde68a', ground: '#facc15', fog: '#fef08a', gradient: 'linear-gradient(135deg,#eab308,#22c55e)', skill: 'Direction & power' },
  { id: 'friendly_1v1', title: 'Friendly One-on-One', emoji: '🤝', objective: 'Chase, turn, and shoot kindly.', landmark: 'Mini pitch', floorKind: 'gym_mats', sky: '#bbf7d0', ground: '#4ade80', fog: '#dcfce7', gradient: 'linear-gradient(135deg,#22c55e,#0ea5e9)', skill: 'Conditions' },
  { id: 'penalty_practice', title: 'Penalty Practice', emoji: '🎯', objective: 'Score from the penalty spot.', landmark: 'Penalty spot', floorKind: 'gym_mats', sky: '#fecdd3', ground: '#fda4af', fog: '#ffe4e6', gradient: 'linear-gradient(135deg,#fb7185,#22c55e)', skill: 'Aim & timing' },
  { id: 'free_kick_curve', title: 'Free Kick Curve', emoji: '🌙', objective: 'Curve the shot around the soft wall.', landmark: 'Foam wall', floorKind: 'gym_mats', sky: '#c4b5fd', ground: '#a78bfa', fog: '#ddd6fe', gradient: 'linear-gradient(135deg,#8b5cf6,#22c55e)', skill: 'Variables' },
  { id: 'team_passing', title: 'Team Passing', emoji: '👥', objective: 'Make three passes, then shoot.', landmark: 'Team circle', floorKind: 'gym_mats', sky: '#67e8f9', ground: '#22d3ee', fog: '#a5f3fc', gradient: 'linear-gradient(135deg,#06b6d4,#22c55e)', skill: 'Collaboration' },
  { id: 'street_mini_pitch', title: 'Street Mini-Pitch', emoji: '🏙️', objective: 'Use walls for bounce angles.', landmark: 'Street goal', floorKind: 'city_plaza', sky: '#fdba74', ground: '#fb923c', fog: '#fed7aa', gradient: 'linear-gradient(135deg,#f97316,#22c55e)', skill: 'Angles' },
  { id: 'cup_final', title: 'Cup Final', emoji: '🏆', objective: 'Play the bright friendly cup final.', landmark: 'Cup trophy', floorKind: 'gym_mats', sky: '#fde68a', ground: '#f59e0b', fog: '#fef08a', gradient: 'linear-gradient(135deg,#f59e0b,#16a34a)', skill: 'Strategy' },
  { id: 'goalkeeper_hero', title: 'Goalkeeper Hero', emoji: '🧤', objective: 'Block gentle shots left and right.', landmark: 'Keeper gloves', floorKind: 'gym_mats', sky: '#e0e7ff', ground: '#818cf8', fog: '#eef2ff', gradient: 'linear-gradient(135deg,#6366f1,#22c55e)', skill: 'Reaction & sensors' },
]);

/** Set 7 — Safety & helper robots. */
export const SET_SAFETY = A([
  { id: 'teddy_clinic', title: 'Teddy Clinic', emoji: '🧸', objective: 'Deliver plasters and water to teddy bears.', landmark: 'Clinic bed', floorKind: 'hospital_tile', sky: '#f8fafc', ground: '#e2e8f0', fog: '#f1f5f9', gradient: 'linear-gradient(135deg,#0ea5e9,#ffffff)', skill: 'Delivery sequence' },
  { id: 'handwashing_helper', title: 'Handwashing Helper', emoji: '🧼', objective: 'Soap, scrub, towel — in order.', landmark: 'Sink station', floorKind: 'hospital_tile', sky: '#a5f3fc', ground: '#67e8f9', fog: '#cffafe', gradient: 'linear-gradient(135deg,#06b6d4,#22c55e)', skill: 'Ordered steps' },
  { id: 'medicine_color_sort', title: 'Medicine Color Sort', emoji: '💊', objective: 'Match pretend bottles to shelves.', landmark: 'Color shelves', floorKind: 'hospital_tile', sky: '#dbeafe', ground: '#bfdbfe', fog: '#eff6ff', gradient: 'linear-gradient(135deg,#3b82f6,#22c55e)', skill: 'Conditions' },
  { id: 'park_helper', title: 'Park Helper', emoji: '🌳', objective: 'Return lost toys to the right bench.', landmark: 'Park bench', floorKind: 'farm_field', sky: '#86efac', ground: '#4ade80', fog: '#bbf7d0', gradient: 'linear-gradient(135deg,#22c55e,#38bdf8)', skill: 'Scanning' },
  { id: 'alarm_button_route', title: 'Alarm Button Route', emoji: '🔔', objective: 'Press the big buttons in order.', landmark: 'Alarm button', floorKind: 'lab_grid', sky: '#fde68a', ground: '#facc15', fog: '#fef08a', gradient: 'linear-gradient(135deg,#eab308,#ef4444)', skill: 'Events' },
  { id: 'hydrant_match', title: 'Hydrant Match', emoji: '🚰', objective: 'Match colored hydrants to targets.', landmark: 'Toy hydrant', floorKind: 'city_plaza', sky: '#fecdd3', ground: '#ef4444', fog: '#fee2e2', gradient: 'linear-gradient(135deg,#dc2626,#0ea5e9)', skill: 'Matching' },
  { id: 'smoke_free_maze', title: 'Smoke-Free Maze', emoji: '🌫️', objective: 'Follow glowing exit arrows safely.', landmark: 'Exit arrows', floorKind: 'lab_grid', sky: '#e0e7ff', ground: '#c7d2fe', fog: '#eef2ff', gradient: 'linear-gradient(135deg,#6366f1,#22c55e)', skill: 'Sensors' },
  { id: 'supply_shelf', title: 'Supply Shelf Delivery', emoji: '📦', objective: 'Deliver supplies to labeled pads.', landmark: 'Supply shelf', floorKind: 'lab_grid', sky: '#fef3c7', ground: '#fde68a', fog: '#fefce8', gradient: 'linear-gradient(135deg,#f59e0b,#0ea5e9)', skill: 'Loops' },
  { id: 'rescue_teddy_path', title: 'Rescue Teddy Path', emoji: '🧸', objective: 'Move the teddy to the safe mat.', landmark: 'Safe mat', floorKind: 'gym_mats', sky: '#fecdd3', ground: '#fda4af', fog: '#ffe4e6', gradient: 'linear-gradient(135deg,#fb7185,#22c55e)', skill: 'Path planning' },
  { id: 'safety_hero_finale', title: 'Safety Hero Finale', emoji: '🏅', objective: 'Deliver, sort, buttons, and safe paths combined.', landmark: 'Hero badge', floorKind: 'hospital_tile', sky: '#e0f2fe', ground: '#bae6fd', fog: '#f0f9ff', gradient: 'linear-gradient(135deg,#0ea5e9,#22c55e)', skill: 'Combined helper logic' },
]);

/** Set 8 — Creative & fantasy. */
export const SET_CREATIVE = A([
  { id: 'color_magic_lab', title: 'Color Magic Lab', emoji: '🎨', objective: 'Activate paint colors in order.', landmark: 'Paint pots', floorKind: 'lab_grid', sky: '#c4b5fd', ground: '#a78bfa', fog: '#ddd6fe', gradient: 'linear-gradient(135deg,#8b5cf6,#f472b6)', skill: 'Sequencing' },
  { id: 'shadow_puzzle', title: 'Shadow Puzzle Room', emoji: '🌓', objective: 'Follow safe shadow paths.', landmark: 'Light mirror', floorKind: 'temple_tiles', sky: '#312e81', ground: '#1e1b4b', fog: '#4338ca', gradient: 'linear-gradient(135deg,#4c1d95,#22d3ee)', skill: 'Conditions' },
  { id: 'crystal_garden', title: 'Crystal Garden', emoji: '💎', objective: 'Visit every glowing stepping pad.', landmark: 'Crystal flower', floorKind: 'farm_field', sky: '#fbcfe8', ground: '#f9a8d4', fog: '#fce7f3', gradient: 'linear-gradient(135deg,#ec4899,#22d3ee)', skill: 'Loops' },
  { id: 'music_tile_path', title: 'Music Tile Path', emoji: '🎵', objective: 'Cross tiles that play notes.', landmark: 'Music tile', floorKind: 'stud_mat', sky: '#fde047', ground: '#facc15', fog: '#fef08a', gradient: 'linear-gradient(135deg,#eab308,#ec4899)', skill: 'Patterns' },
  { id: 'shape_builder', title: 'Shape Builder', emoji: '⭐', objective: 'Draw a square, triangle, and star.', landmark: 'Shape mat', floorKind: 'lab_grid', sky: '#dbeafe', ground: '#93c5fd', fog: '#eff6ff', gradient: 'linear-gradient(135deg,#3b82f6,#22c55e)', skill: 'Geometry' },
  { id: 'lantern_trail', title: 'Lantern Trail', emoji: '🏮', objective: 'Light lanterns as you visit them.', landmark: 'Paper lantern', floorKind: 'temple_tiles', sky: '#1e1b4b', ground: '#44403c', fog: '#7c2d12', gradient: 'linear-gradient(135deg,#9a3412,#fbbf24)', skill: 'Events' },
  { id: 'puzzle_door_hall', title: 'Puzzle Door Hall', emoji: '🚪', objective: 'Open doors with code patterns.', landmark: 'Puzzle door', floorKind: 'temple_tiles', sky: '#c4b5fd', ground: '#a78bfa', fog: '#ddd6fe', gradient: 'linear-gradient(135deg,#8b5cf6,#22c55e)', skill: 'Functions' },
  { id: 'glow_bridge', title: 'Glow Bridge', emoji: '🌉', objective: 'Activate checkpoints to build the bridge.', landmark: 'Glow bridge', floorKind: 'open_sky', sky: '#67e8f9', ground: '#22d3ee', fog: '#a5f3fc', gradient: 'linear-gradient(135deg,#06b6d4,#a855f7)', skill: 'Step-by-step logic' },
  { id: 'festival_parade', title: 'Festival Parade', emoji: '🎉', objective: 'Follow the rhythm along the parade route.', landmark: 'Parade banner', floorKind: 'city_plaza', sky: '#f9a8d4', ground: '#fbcfe8', fog: '#fce7f3', gradient: 'linear-gradient(135deg,#ec4899,#fbbf24)', skill: 'Timing' },
  { id: 'creator_finale', title: 'Creator Finale', emoji: '🌟', objective: 'Color, music, shapes, and puzzle doors combined.', landmark: 'Creator star', floorKind: 'lab_grid', sky: '#fce7f3', ground: '#f9a8d4', fog: '#fdf2f8', gradient: 'linear-gradient(135deg,#ec4899,#fbbf24)', skill: 'Combine creative skills' },
]);

/** Sling-B flappy scroll missions (Set 2 aerial variant). */
export const SET_FLAPPY = A([
  { id: 'nest_start', title: 'Nest Start', emoji: '🪺', objective: 'Flap to the next nest.', landmark: 'Nest', floorKind: 'flappy_scroll', sky: '#87ceeb', ground: '#22c55e', fog: '#bae6fd', gradient: 'linear-gradient(135deg,#38bdf8,#22c55e)' },
  { id: 'pipe_gaps', title: 'Friendly Pipes', emoji: '🟢', objective: 'Fly through the pipe gaps.', landmark: 'Green pipe', floorKind: 'flappy_scroll', sky: '#7dd3fc', ground: '#16a34a', fog: '#bae6fd', gradient: 'linear-gradient(135deg,#0ea5e9,#22c55e)' },
  { id: 'cloud_bounce', title: 'Cloud Bounce', emoji: '☁️', objective: 'Bounce on fluffy clouds.', landmark: 'Bounce cloud', floorKind: 'flappy_scroll', sky: '#e0f2fe', ground: '#86efac', fog: '#f0f9ff', gradient: 'linear-gradient(135deg,#7dd3fc,#ffffff)' },
  { id: 'berry_pick', title: 'Berry Pick', emoji: '🍓', objective: 'Peck berries in the air.', landmark: 'Berry', floorKind: 'flappy_scroll', sky: '#fecdd3', ground: '#fb7185', fog: '#ffe4e6', gradient: 'linear-gradient(135deg,#fb7185,#22c55e)' },
  { id: 'wind_glide', title: 'Wind Glide', emoji: '💨', objective: 'Glide when the wind is kind.', landmark: 'Wind leaf', floorKind: 'flappy_scroll', sky: '#bbf7d0', ground: '#4ade80', fog: '#dcfce7', gradient: 'linear-gradient(135deg,#22c55e,#38bdf8)' },
  { id: 'rainbow_arc', title: 'Rainbow Arc', emoji: '🌈', objective: 'Follow the rainbow arc.', landmark: 'Rainbow', floorKind: 'flappy_scroll', sky: '#c4b5fd', ground: '#a78bfa', fog: '#ddd6fe', gradient: 'linear-gradient(135deg,#8b5cf6,#22c55e)' },
  { id: 'firefly_night', title: 'Firefly Night', emoji: '✨', objective: 'Chase friendly fireflies.', landmark: 'Firefly', floorKind: 'flappy_scroll', sky: '#1e1b4b', ground: '#365314', fog: '#312e81', gradient: 'linear-gradient(135deg,#312e81,#fbbf24)' },
  { id: 'mountain_flap', title: 'Mountain Flap', emoji: '⛰️', objective: 'Flap over the green hills.', landmark: 'Hill', floorKind: 'flappy_scroll', sky: '#fdba74', ground: '#84cc16', fog: '#fed7aa', gradient: 'linear-gradient(135deg,#f97316,#22c55e)' },
  { id: 'storm_safe', title: 'Safe Storm', emoji: '☂️', objective: 'Hide under the umbrellas.', landmark: 'Umbrella', floorKind: 'flappy_scroll', sky: '#64748b', ground: '#334155', fog: '#94a3b8', gradient: 'linear-gradient(135deg,#475569,#22d3ee)' },
  { id: 'flappy_finale', title: 'Sling-B Finale', emoji: '🏆', objective: 'Flap home to the golden nest.', landmark: 'Golden nest', floorKind: 'flappy_scroll', sky: '#fde68a', ground: '#ca8a04', fog: '#fef08a', gradient: 'linear-gradient(135deg,#f59e0b,#22c55e)' },
]);

/** Custom bot tutorial mat. */
export const SET_CUSTOM = A([
  { id: 'lab_mat', title: 'School Robotics Mat', emoji: '🔬', objective: 'Drive to the first star pad.', landmark: 'Star pad', floorKind: 'lab_grid', sky: '#e0f2fe', ground: '#f8fafc', fog: '#e0f2fe', gradient: 'linear-gradient(135deg,#38bdf8,#22c55e)' },
  { id: 'tape_path', title: 'Tape Path', emoji: '📏', objective: 'Follow the tape line.', landmark: 'Tape line', floorKind: 'lab_grid', sky: '#fef3c7', ground: '#fde68a', fog: '#fef9c3', gradient: 'linear-gradient(135deg,#f59e0b,#3b82f6)' },
  { id: 'colour_zones', title: 'Colour Zones', emoji: '🎨', objective: 'Visit red, blue, then green zones.', landmark: 'Colour tiles', floorKind: 'stud_mat', sky: '#fce7f3', ground: '#fbcfe8', fog: '#fdf2f8', gradient: 'linear-gradient(135deg,#ec4899,#22c55e)' },
  { id: 'loop_square', title: 'Loop Square', emoji: '⬜', objective: 'Drive a square using Repeat.', landmark: 'Square tape', floorKind: 'lab_grid', sky: '#dbeafe', ground: '#bfdbfe', fog: '#eff6ff', gradient: 'linear-gradient(135deg,#3b82f6,#22c55e)' },
  { id: 'sensor_stop', title: 'Sensor Stop', emoji: '🛑', objective: 'Stop before the soft wall.', landmark: 'Soft wall', floorKind: 'lab_grid', sky: '#fecdd3', ground: '#fda4af', fog: '#fff1f2', gradient: 'linear-gradient(135deg,#fb7185,#64748b)' },
  { id: 'wait_lights', title: 'Wait for Lights', emoji: '🚦', objective: 'Wait for green, then go.', landmark: 'Traffic light', floorKind: 'city_plaza', sky: '#dcfce7', ground: '#bbf7d0', fog: '#f0fdf4', gradient: 'linear-gradient(135deg,#22c55e,#eab308)' },
  { id: 'if_fork', title: 'If Fork Road', emoji: '🔀', objective: 'Choose left or right with If.', landmark: 'Fork sign', floorKind: 'lab_grid', sky: '#e0e7ff', ground: '#c7d2fe', fog: '#eef2ff', gradient: 'linear-gradient(135deg,#6366f1,#22c55e)' },
  { id: 'moving_gate', title: 'Moving Gate', emoji: '🚪', objective: 'Wait for the gate to open.', landmark: 'Moving gate', floorKind: 'lab_grid', sky: '#fde68a', ground: '#facc15', fog: '#fefce8', gradient: 'linear-gradient(135deg,#eab308,#3b82f6)' },
  { id: 'pattern_mat', title: 'Pattern Mat', emoji: '🧩', objective: 'Copy the pattern on the mat.', landmark: 'Pattern card', floorKind: 'stud_mat', sky: '#dcfce7', ground: '#86efac', fog: '#f0fdf4', gradient: 'linear-gradient(135deg,#22c55e,#a855f7)' },
  { id: 'custom_cup', title: 'Custom Bot Cup', emoji: '🏆', objective: 'Use every skill on the school mat.', landmark: 'School cup', floorKind: 'lab_grid', sky: '#fce7f3', ground: '#f9a8d4', fog: '#fdf2f8', gradient: 'linear-gradient(135deg,#ec4899,#fbbf24)' },
]);

const SETS = {
  ground: SET_GROUND,
  aerial: SET_AERIAL,
  walker: SET_WALKER,
  underwater: SET_UNDERWATER,
  arm: SET_ARM,
  sport: SET_SPORT,
  safety: SET_SAFETY,
  creative: SET_CREATIVE,
  flappy: SET_FLAPPY,
  custom: SET_CUSTOM,
};

/** Slight palette shift so two robots sharing a set still feel unique in cards. */
function tintArenaRow(row, seed = 0) {
  const bump = (hexVal, delta) => {
    const r = (hexVal >> 16) & 255;
    const g = (hexVal >> 8) & 255;
    const b = hexVal & 255;
    const clamp = (v) => Math.max(0, Math.min(255, v + delta));
    return (clamp(r) << 16) | (clamp(g) << 8) | clamp(b);
  };
  const d = (seed % 5) * 3 - 6;
  return {
    ...row,
    sky: bump(row.sky, d),
    ground: bump(row.ground, -d),
    fog: bump(row.fog, d >> 1),
  };
}

function cloneSetForChassis(setRows, chassisId) {
  const seed = [...chassisId].reduce((a, c) => a + c.charCodeAt(0), 0);
  return setRows.map((row, i) => tintArenaRow(row, seed + i * 7));
}

const CHASSIS_SET_KEY = {
  rover: 'ground', scout: 'ground', crawler: 'ground', farmbot: 'ground',
  securitybot: 'safety', miningbot: 'ground', spacerover: 'ground',
  legobot: 'creative', tank: 'ground', stealth: 'creative',
  drone: 'aerial', racedrone: 'aerial', helicopter: 'aerial',
  hoverbot: 'aerial', hoverracer: 'aerial', jetplane: 'aerial',
  steathjet: 'aerial', aerobat: 'aerial',
  rescuedrone: 'safety',
  spider: 'walker', droid: 'walker', mech: 'walker', ninja: 'creative',
  berserker: 'walker', battlebot: 'walker', striker: 'walker',
  blaster: 'creative',
  submarine: 'underwater', deepseabot: 'underwater',
  robotarm: 'arm', factorybot: 'arm',
  footballbot: 'sport',
  medbot: 'safety', firebot: 'safety',
  birdbot: 'flappy',
  custom: 'custom',
};

export function buildPrimaryStudioArenas() {
  const out = {};
  for (const [chassisId, setKey] of Object.entries(CHASSIS_SET_KEY)) {
    const base = SETS[setKey];
    if (!base) continue;
    out[chassisId] = cloneSetForChassis(base, chassisId);
  }
  return out;
}

export const PRIMARY_STUDIO_ARENAS = buildPrimaryStudioArenas();
