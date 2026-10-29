/**
 * Ground missions 11–50 for the Humanoid, Spider Bot and LEGO Bot. They play
 * exactly like the original ten: the robot walks a route through one of its
 * themed worlds and uses an action block at each marker. Harder tiers mean
 * longer routes, more corners and more markers. Routes are checked so corners
 * never fold back on themselves and markers stay well apart.
 *
 * Route points use the same units as data/primary-arena-layouts.js:
 * x across (×10 world units), z along the route (0 = start, 1 = finish).
 */
import { rng, writeData, TIERS } from './common.mjs';

// [name, theme world (original mode 1–10), action or null, goal — {n} = marker count]
const PLANS = {
  droid: [
    ['Beam Walk Basics', 1, null, 'Walk the beam and stop on all {n} gym mats.'],
    ['First Dance Steps', 2, 'light_up', 'Light up {n} dance tiles in a row.'],
    ['Toy Box Tidy', 3, 'pick_up', 'Pick up {n} toy parts from the workshop floor.'],
    ['Stepping Stones', 4, null, 'Step on all {n} river stones to cross.'],
    ['Mirror Wave', 5, 'scan_here', 'Copy the pose at {n} mirror stations.'],
    ['Cone Dash', 6, null, 'Run past {n} sports cones to the finish.'],
    ['Teddy Pick-Up', 7, 'pick_up', 'Pick up {n} teddies and bring them home.'],
    ['Breezy Bridge', 8, null, 'Cross the bridge, touching all {n} safe spots.'],
    ['Stage Spotlights', 9, 'light_up', 'Light up {n} stage spotlights.'],
    ['Champion Warm-Up', 10, null, 'Visit all {n} warm-up stations.'],
    ['Zigzag Beam', 1, null, 'Follow the zigzag beam through {n} checkpoints.'],
    ['Disco Pattern', 2, 'light_up', 'Light the {n} disco tiles along the pattern.'],
    ['Workshop Delivery', 3, 'drop_off', 'Drop off parts at {n} workbenches.'],
    ['River Crossing Relay', 4, null, 'Cross the river by {n} stones that bend left and right.'],
    ['Pose Parade', 5, 'scan_here', 'Match the pose at {n} mirrors around the studio.'],
    ['Hurdle Track', 6, 'push_object', 'Push {n} hurdles out of the lane.'],
    ['Nursery Rescue', 7, 'pick_up', 'Rescue {n} teddies from around the nursery.'],
    ['Gusty Crossing', 8, 'press_alarm', 'Press {n} fan switches to calm the wind.'],
    ['Talent Show Tour', 9, 'light_up', 'Light up {n} stage lights in order.'],
    ['Champion Circuit', 10, 'scan_here', 'Check in at {n} champion stations.'],
    ['Balance Gauntlet', 1, null, 'Walk the long, winding beam through {n} checkpoints.'],
    ['Dance Battle Path', 2, 'light_up', 'Light {n} tiles across the whole dance floor.'],
    ['Toy Factory Line', 3, 'drop_off', 'Drop parts at {n} stations on the toy line.'],
    ['Waterfall Stones', 4, null, 'Cross {n} stones above the waterfall.'],
    ['Mirror Maze', 5, 'scan_here', 'Find and match {n} mirrors in the maze.'],
    ['Sports Day Relay', 6, 'pick_up', 'Pick up {n} relay batons around the track.'],
    ['Big Teddy Rescue', 7, 'pick_up', 'Rescue {n} teddies from all over the room.'],
    ['Storm Bridge', 8, 'press_alarm', 'Press {n} switches to stop the storm fans.'],
    ['Grand Rehearsal', 9, 'light_up', 'Light {n} lights for the big rehearsal.'],
    ['Champion Trials', 10, 'push_object', 'Push {n} trial blocks onto their marks.'],
    ['Olympic Beam', 1, null, 'Master the longest beam course: {n} checkpoints.'],
    ['Dance Marathon', 2, 'light_up', 'Light {n} tiles on the marathon route.'],
    ['Toy Assembly Rush', 3, 'drop_off', 'Deliver parts to {n} assembly stations.'],
    ['River Delta Crossing', 4, null, 'Cross the delta on {n} stepping stones.'],
    ['Mirror Grand Tour', 5, 'scan_here', 'Match the pose at {n} mirrors on the grand tour.'],
    ['Decathlon', 6, 'push_object', 'Clear {n} obstacles on the decathlon track.'],
    ['Teddy Rescue Mission', 7, 'pick_up', 'Rescue all {n} teddies on the longest route.'],
    ['Hurricane Bridge', 8, 'press_alarm', 'Press {n} storm switches across the bridge.'],
    ['Showstopper', 9, 'light_up', 'Light {n} lights for the showstopper finale.'],
    ['Humanoid Grand Champion', 10, 'scan_here', 'Win the title: check in at {n} champion stations.'],
  ],
  spider: [
    ['Leafy Leg Stretch', 1, null, 'Crawl past {n} garden leaves.'],
    ['Treehouse Ladder', 2, null, 'Climb to {n} treehouse platforms.'],
    ['Toy Room Tiptoe', 3, 'pick_up', 'Pick up {n} lost marbles.'],
    ['Candy Conveyor', 4, 'scan_here', 'Scan {n} sweets on the conveyor.'],
    ['Kitchen Counter Crawl', 5, null, 'Cross the counter past {n} crumbs.'],
    ['Temple Steps', 6, 'press_alarm', 'Press {n} temple buttons.'],
    ['Factory Pipes', 7, null, 'Crawl along {n} factory pipes.'],
    ['Island Web Hop', 8, null, 'Hop across {n} web strands.'],
    ['Crystal Glow', 9, 'light_up', 'Light up {n} crystals in the cave.'],
    ['Clock Tower Tick', 10, null, 'Visit {n} clock gears.'],
    ['Flower Bed Weave', 1, 'pick_up', 'Collect pollen from {n} flowers.'],
    ['Treehouse Bridges', 2, null, 'Cross {n} rope bridges between the trees.'],
    ['Block Tower Climb', 3, 'pick_up', 'Pick up {n} toy blocks from the tower.'],
    ['Lollipop Lane', 4, 'scan_here', 'Scan {n} lollipops for the sweet count.'],
    ['Sink Splash Path', 5, 'press_alarm', 'Turn off {n} dripping taps.'],
    ['Temple Torches', 6, 'light_up', 'Light {n} temple torches.'],
    ['Robot Factory Patrol', 7, 'scan_here', 'Scan {n} machines on patrol.'],
    ['Floating Web Garden', 8, 'pick_up', 'Collect {n} dewdrops from the webs.'],
    ['Crystal Cave Survey', 9, 'scan_here', 'Survey {n} crystals.'],
    ['Castle Cog Run', 10, 'press_alarm', 'Press {n} castle levers.'],
    ['Giant Garden Trek', 1, 'pick_up', 'Collect seeds from {n} giant plants.'],
    ['Canopy Highway', 2, null, 'Race across {n} canopy branches.'],
    ['Toy Room Rescue', 3, 'pick_up', 'Rescue {n} toys from under the bed.'],
    ['Sweet Factory Shift', 4, 'scan_here', 'Quality-check {n} sweet machines.'],
    ['Kitchen Expedition', 5, 'pick_up', 'Gather {n} crumbs across the kitchen.'],
    ['Lost Temple Path', 6, 'press_alarm', 'Open {n} temple doors.'],
    ['Factory Night Shift', 7, 'light_up', 'Switch on {n} factory lamps.'],
    ['Sky Island Silk Road', 8, null, 'Cross {n} web bridges between islands.'],
    ['Deep Crystal Caverns', 9, 'light_up', 'Light {n} crystals in the deep caves.'],
    ['Castle Clockwork', 10, 'press_alarm', 'Wind {n} castle clocks.'],
    ['Garden Grand Tour', 1, 'pick_up', 'Collect pollen from {n} flowers on the grand tour.'],
    ['Treetop Kingdom Quest', 2, 'scan_here', 'Visit {n} treehouse homes.'],
    ['Toy Room Marathon', 3, 'pick_up', 'Tidy {n} toys on the longest crawl.'],
    ['Sweet Factory Final', 4, 'scan_here', 'Inspect {n} sweet stations.'],
    ['Kitchen Mega Crawl', 5, 'press_alarm', 'Switch off {n} kitchen gadgets.'],
    ['Temple of Webs', 6, 'light_up', 'Light {n} torches deep in the temple.'],
    ['Factory Master Patrol', 7, 'scan_here', 'Inspect {n} machines on the master patrol.'],
    ['Island Chain Crossing', 8, 'pick_up', 'Collect {n} dewdrops across the island chain.'],
    ['Crystal Kingdom', 9, 'light_up', 'Light {n} crystals across the kingdom.'],
    ['Spider Bot Grand Finale', 10, 'press_alarm', 'Ring {n} castle bells for the finale.'],
  ],
  legobot: [
    ['Colour Mix Start', 1, 'scan_here', 'Scan {n} colour pads.'],
    ['Shadow Shapes', 2, null, 'Stand on {n} shadow shapes.'],
    ['Crystal Sprouts', 3, 'pick_up', 'Pick up {n} crystal seeds.'],
    ['Tile Tune', 4, 'press_alarm', 'Press {n} music tiles.'],
    ['Shape Sorter', 5, 'drop_off', 'Drop {n} shapes in their spots.'],
    ['Lantern Lane', 6, 'light_up', 'Light {n} lanterns.'],
    ['Door Puzzle', 7, 'press_alarm', 'Press {n} door buttons.'],
    ['Glow Path', 8, 'light_up', 'Light {n} glow bricks.'],
    ['Parade Practice', 9, null, 'Drive past {n} parade flags.'],
    ['Creator Showcase', 10, 'scan_here', 'Scan {n} creations.'],
    ['Paint Lab Route', 1, 'scan_here', 'Scan {n} paint pots in the lab.'],
    ['Shadow Gallery', 2, 'light_up', 'Light {n} shadow lamps.'],
    ['Crystal Garden Rows', 3, 'pick_up', 'Pick {n} crystals from the rows.'],
    ['Music Tile Melody', 4, 'press_alarm', 'Play {n} tiles of the melody.'],
    ['Shape Builder Bay', 5, 'drop_off', 'Deliver {n} bricks to the builders.'],
    ['Lantern Night Walk', 6, 'light_up', 'Light {n} lanterns on the night walk.'],
    ['Puzzle Hall', 7, 'press_alarm', 'Solve {n} door puzzles.'],
    ['Glow Bridge Crossing', 8, 'light_up', 'Light {n} bricks on the bridge.'],
    ['Festival Float', 9, 'pick_up', 'Collect {n} festival flags.'],
    ['Creator Corner', 10, 'drop_off', 'Drop off {n} brick kits.'],
    ['Rainbow Lab', 1, 'scan_here', 'Scan {n} rainbow pads in order.'],
    ['Shadow Puzzle Tower', 2, 'light_up', 'Light {n} lamps to solve the shadows.'],
    ['Crystal Harvest', 3, 'pick_up', 'Harvest {n} crystals.'],
    ['Music Tile Song', 4, 'press_alarm', 'Play a {n}-tile song.'],
    ['Shape Factory', 5, 'drop_off', 'Deliver {n} shapes across the factory.'],
    ['Lantern Festival Walk', 6, 'light_up', 'Light {n} festival lanterns.'],
    ['Door Maze', 7, 'press_alarm', 'Open {n} doors in the maze.'],
    ['Glow Bridge Night', 8, 'light_up', 'Light {n} bricks at night.'],
    ['Parade Route', 9, 'pick_up', 'Collect {n} parade flags on the long route.'],
    ['Creator Workshop', 10, 'drop_off', 'Deliver {n} brick kits to the workshop.'],
    ['Colour Lab Marathon', 1, 'scan_here', 'Scan {n} colour pads across the lab.'],
    ['Shadow Grand Puzzle', 2, 'light_up', 'Light {n} lamps for the grand puzzle.'],
    ['Crystal Forest', 3, 'pick_up', 'Collect {n} crystals in the forest.'],
    ['Music Tile Symphony', 4, 'press_alarm', 'Play a {n}-tile symphony.'],
    ['Mega Shape Build', 5, 'drop_off', 'Deliver {n} shapes for the mega build.'],
    ['Lantern Kingdom', 6, 'light_up', 'Light {n} lanterns across the kingdom.'],
    ['Hall of Puzzles', 7, 'press_alarm', 'Solve {n} puzzles in the hall.'],
    ['Glow Bridge Grand Crossing', 8, 'light_up', 'Light {n} bricks on the grand crossing.'],
    ['Grand Parade', 9, 'pick_up', 'Collect {n} flags for the grand parade.'],
    ['LEGO Bot Grand Finale', 10, 'scan_here', 'Scan {n} masterpieces in the finale.'],
  ],
};

// Per tier: route corners, route length (world units), markers
const TIER_SHAPE = [
  { corners: [1, 2], dist: [28, 34], markers: [2, 3] },
  { corners: [3, 4], dist: [38, 44], markers: [3, 4] },
  { corners: [5, 6], dist: [48, 56], markers: [4, 5] },
  { corners: [7, 9], dist: [60, 70], markers: [5, 6] },
];

function makeRoute(r, corners) {
  // Lanes across the arena; each corner moves to a different lane
  const lanes = [-0.7, -0.35, 0, 0.35, 0.7];
  const pts = [[0, 0], [0, 0.08]];
  let x = 0;
  for (let i = 1; i <= corners; i++) {
    const z = 0.08 + (0.84 * i) / (corners + 1);
    let nx;
    do { nx = r.pick(lanes); } while (Math.abs(nx - x) < 0.3);
    pts.push([x, z], [nx, z + 0.02]);
    x = nx;
  }
  pts.push([x, 0.94], [0, 1]);
  // Drop repeated points
  return pts.filter((p, i) => i === 0 || p[0] !== pts[i - 1][0] || p[1] !== pts[i - 1][1]).map(([a, b]) => [Math.round(a * 100) / 100, Math.round(b * 100) / 100]);
}

function routeLength(route, dist) {
  let L = 0;
  for (let i = 1; i < route.length; i++) L += Math.hypot((route[i][0] - route[i - 1][0]) * 10, (route[i][1] - route[i - 1][1]) * dist);
  return L;
}

export function buildGround() {
  const out = {}; const report = [];
  for (const [chassisId, plans] of Object.entries(PLANS)) {
    const seen = new Set();
    out[chassisId] = plans.map(([name, baseMode, action, goal], i) => {
      const tierIndex = Math.floor(i / 10); const slot = i % 10; const shape = TIER_SHAPE[tierIndex];
      const corners = shape.corners[0] + Math.round((shape.corners[1] - shape.corners[0]) * (slot / 9));
      const dist = Math.round(shape.dist[0] + (shape.dist[1] - shape.dist[0]) * (slot / 9));
      const markers = shape.markers[0] + (slot >= 5 ? 1 : 0);
      for (let attempt = 0; attempt < 500; attempt++) {
        const route = makeRoute(rng(`ground:${chassisId}:${i}:${attempt}`), corners);
        const key = JSON.stringify([route, baseMode]);
        if (seen.has(key)) continue;
        seen.add(key);
        return {
          mode: 11 + i, name, tier: TIERS[tierIndex], baseMode, action, markers, dist, route,
          goal: (markers === 2 ? goal.replace('all {n}', 'both').replace('{n}', 'two') : goal.replace('{n}', markers)), length: Math.round(routeLength(route, dist)),
        };
      }
      throw new Error(`No route for ${name}`);
    });
    report.push(`${chassisId}: ${out[chassisId].map((l) => `${l.mode}:${l.length}m/${l.markers}`).join(' ')}`);
  }
  const size = writeData('ground-tiers.js', 'Ground missions for modes 11–50 (Humanoid, Spider Bot, LEGO Bot).\nPlayed like the original ten: a route through a themed world with action markers.', { GROUND_TIER_LEVELS: out });
  return { report, size };
}

if (process.argv[1]?.endsWith('build-ground.mjs')) {
  const { report, size } = buildGround();
  console.log(report.join('\n'), '\nbytes', size);
}
