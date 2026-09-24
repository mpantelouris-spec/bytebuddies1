/**
 * SecurityBot campaign — 30 missions across 4 zones
 * Zones: City Mall, Tech Facility, City Rooftop, Arctic Vault
 */

function m(cfg) {
  return {
    robot: 'securitybot',
    rec: ['security'],
    genre: 'adventure',
    ...cfg,
    subObjectives: cfg.subObjectives || [],
  };
}

export const SECURITYBOT_ZONES = [
  { id: 'sb_zone_mall',    name: 'City Mall',       subtitle: 'Shopping Centre Patrol',  icon: '🏬', color: '#a855f7', arenaBase: 'neon_city' },
  { id: 'sb_zone_tech',    name: 'Tech Facility',   subtitle: 'High-Security Complex',   icon: '🔒', color: '#3b82f6', arenaBase: 'warehouse_sort' },
  { id: 'sb_zone_rooftop', name: 'City Rooftop',    subtitle: 'Neon Night Operations',   icon: '🌃', color: '#ec4899', arenaBase: 'neon_city' },
  { id: 'sb_zone_vault',   name: 'Arctic Vault',    subtitle: 'Frozen Fortress',         icon: '❄️', color: '#93c5fd', arenaBase: 'arctic_station' },
];

export const SECURITYBOT_MISSIONS = [
  // ── ZONE 1: CITY MALL ────────────────────────────────────────────────────
  m({
    id: 'sc_1', code: 'SC-1', zoneId: 'sb_zone_mall', zoneNum: 1,
    name: 'First Patrol', missionType: 'MG', difficulty: 1,
    icon: '👮', color: '#a855f7', arenaType: 'neon_city', totalDist: 28, timeLimit: 90, estMinutes: 5,
    story: 'Security Bot\'s first night on duty! The shopping centre needs its three zones patrolled once each before closing time. Stay on the marked patrol path and scan each zone to confirm all is clear.',
    primaryObjective: { id: 'patrol_zones', text: 'Complete a patrol scan of all 3 zones', type: 'visit_waypoints', target: 3 },
    subObjectives: [
      { id: 'in_order', text: 'Visit zones in order 1→2→3', bonusXP: 75, type: 'visit_waypoints' },
      { id: 'time', text: 'Complete the full patrol in under 90 seconds', bonusXP: 50, type: 'time_limit', limitSeconds: 90 },
      { id: 'no_collision', text: 'Stay on the patrol path — no wall contacts', bonusXP: 50 },
    ],
    teaches: ['MOVE FORWARD', 'REPEAT loop', 'basic patrol route'],
    codingConcept: 'Use REPEAT 3 to patrol each zone once automatically!',
    failTip: 'Try REPEAT 3 with your patrol move inside — visit every zone in one loop!',
    failTips: { timeout: 'Use REPEAT 3 with your patrol movement inside!', collision: 'Slow down near corners — use smaller TURN angles!', generic: 'Use REPEAT 3 to patrol each zone once automatically!' },
    xpBase: 100, winText: 'MALL SECURED! ✓',
    arenaSetup: {
      goal: { x: 0, z: 4, label: 'SECURITY HQ', colors: [0xa855f7, 0xffffff] },
      waypoints: [
        { x: -5, z: -6, num: 1, label: 'ZONE A' },
        { x: 4, z: -14, num: 2, label: 'ZONE B' },
        { x: -3, z: -22, num: 3, label: 'ZONE C' },
      ],
      collectibles: [],
      obstacles: [
        { type: 'barrier', x: -2, z: -2 }, { type: 'barrier', x: 2, z: -10 },
        { type: 'barrier', x: -2, z: -18 },
      ],
      props: ['security_camera', 'barrier'],
    },
  }),

  m({
    id: 'sc_2', code: 'SC-2', zoneId: 'sb_zone_mall', zoneNum: 2,
    name: 'Intruder Alert', missionType: 'SV', difficulty: 1,
    icon: '🚨', color: '#a855f7', arenaType: 'neon_city', totalDist: 30, timeLimit: 60, estMinutes: 6,
    story: 'The alarm has sounded! An intruder is moving through the mall. Security Bot must intercept them before they reach the server room. The intruder moves in predictable patterns — cut them off!',
    primaryObjective: { id: 'intercept', text: 'Intercept the intruder before they reach the server room', type: 'reach_goal' },
    subObjectives: [
      { id: 'early', text: 'Intercept before the intruder covers 50% of their route', bonusXP: 100 },
      { id: 'no_false', text: 'Zero false alarms — only block the actual intruder', bonusXP: 75 },
      { id: 'time', text: 'Complete in under 60 seconds', bonusXP: 50, type: 'time_limit', limitSeconds: 60 },
    ],
    teaches: ['IF sensor THEN change route', 'responding to events'],
    codingConcept: 'IF you detect the intruder on the LEFT sensor, TURN LEFT to intercept!',
    failTip: 'Watch the intruder path — position yourself to block their route, not chase them!',
    failTips: { timeout: 'Move toward the interception point BEFORE the intruder gets there!', collision: 'You blocked the wrong target — use the sensor to confirm first!', generic: 'IF sensor detects intruder THEN turn toward them — cut them off!' },
    xpBase: 120, winText: 'INTRUDER STOPPED! ✓',
    arenaSetup: {
      goal: { x: 0, z: -26, label: 'SERVER ROOM', colors: [0xa855f7, 0xff4444] },
      collectibles: [],
      obstacles: [
        { type: 'sentinel', x: 3, z: -10, patrolRadius: 4, radius: 1.5 },
        { type: 'barrier', x: -3, z: -6 }, { type: 'barrier', x: 3, z: -18 },
      ],
      props: ['security_camera', 'alarm_light'],
    },
  }),

  m({
    id: 'sc_3', code: 'SC-3', zoneId: 'sb_zone_mall', zoneNum: 3,
    name: 'Evidence Collection', missionType: 'CD', difficulty: 2,
    icon: '🔍', color: '#a855f7', arenaType: 'neon_city', totalDist: 32, timeLimit: 120, estMinutes: 8,
    story: 'After last night\'s break-in, Security Bot must collect all 6 pieces of evidence scattered across the crime scene. Each item must be retrieved without disturbing the surrounding area — careful movement only.',
    primaryObjective: { id: 'collect_evidence', text: 'Collect all 6 evidence items', type: 'collect_count', target: 6 },
    subObjectives: [
      { id: 'no_disturb', text: 'Zero obstacle contacts — disturbing the scene contaminates evidence', bonusXP: 100 },
      { id: 'time', text: 'Collect all 6 in under 2 minutes', bonusXP: 75, type: 'time_limit', limitSeconds: 120 },
      { id: 'order', text: 'Collect evidence in numbered order 1→6', bonusXP: 50, type: 'ordered_collect' },
    ],
    teaches: ['Multi-step collection routes', 'ordered navigation'],
    codingConcept: 'Plan the most efficient route through all 6 items before coding!',
    failTip: 'Draw the evidence locations on paper first — then code the shortest path!',
    failTips: { collision: 'Slow down near evidence items — use SET SPEED 30 for precise moves!', timeout: 'Plan your route: collect nearest items first to save time!', generic: 'Plan the most efficient route through all 6 items before coding!' },
    xpBase: 150, winText: 'EVIDENCE SECURED! ✓',
    arenaSetup: {
      goal: { x: 0, z: 4, label: 'EVIDENCE LOCKER', colors: [0xa855f7, 0xffd700] },
      collectibles: [
        { x: -4, z: -2, type: 'evidence_bag', order: 1 }, { x: 4, z: -6, type: 'evidence_bag', order: 2 },
        { x: -5, z: -11, type: 'evidence_bag', order: 3 }, { x: 3, z: -15, type: 'evidence_bag', order: 4 },
        { x: -3, z: -20, type: 'evidence_bag', order: 5 }, { x: 5, z: -24, type: 'evidence_bag', order: 6 },
      ],
      obstacles: [
        { type: 'barrier', x: -1, z: -4 }, { type: 'barrier', x: 1, z: -9 },
        { type: 'barrier', x: -1, z: -13 }, { type: 'barrier', x: 1, z: -18 },
        { type: 'barrier', x: -1, z: -22 },
      ],
      props: ['crime_tape', 'evidence_marker'],
    },
  }),

  m({
    id: 'sc_4', code: 'SC-4', zoneId: 'sb_zone_mall', zoneNum: 4,
    name: 'Camera Network Check', missionType: 'MG', difficulty: 2,
    icon: '📹', color: '#a855f7', arenaType: 'neon_city', totalDist: 34, timeLimit: 90, estMinutes: 9,
    story: 'The security camera network needs a full inspection! Security Bot must drive to each of 5 camera stations, park precisely underneath each one, and trigger the test scan. The cameras only scan if the robot is close enough.',
    primaryObjective: { id: 'check_cameras', text: 'Trigger the test scan at all 5 camera stations', type: 'visit_waypoints', target: 5 },
    subObjectives: [
      { id: 'precise', text: 'Park within 1 unit of each camera station centre', bonusXP: 100 },
      { id: 'time', text: 'Complete the full check in under 90 seconds', bonusXP: 75, type: 'time_limit', limitSeconds: 90 },
      { id: 'return', text: 'Return to Security HQ after completing all checks', bonusXP: 50 },
    ],
    teaches: ['STOP block for precision positioning', 'exact distance movement'],
    codingConcept: 'Count your steps carefully — MOVE FORWARD 3 stops exactly 3 units from the wall!',
    failTip: 'Use exact move distances to park under each camera — MOVE FORWARD 4 then STOP!',
    failTips: { generic: 'Use exact move distances to park under each camera — MOVE FORWARD 4 then STOP!', timeout: 'Plan direct routes between cameras — shortest path first!' },
    xpBase: 150, winText: 'CAMERA NETWORK VERIFIED! ✓',
    arenaSetup: {
      goal: { x: 0, z: 4, label: 'SECURITY HQ', colors: [0xa855f7, 0x3b82f6] },
      waypoints: [
        { x: -5, z: -3, num: 1, label: 'CAM 1' }, { x: 5, z: -8, num: 2, label: 'CAM 2' },
        { x: -4, z: -14, num: 3, label: 'CAM 3' }, { x: 4, z: -19, num: 4, label: 'CAM 4' },
        { x: 0, z: -26, num: 5, label: 'CAM 5' },
      ],
      collectibles: [],
      obstacles: [
        { type: 'barrier', x: 0, z: -5 }, { type: 'barrier', x: -1, z: -11 },
        { type: 'barrier', x: 1, z: -16 }, { type: 'barrier', x: 0, z: -22 },
      ],
      props: ['security_camera', 'cctv_pole'],
    },
  }),

  m({
    id: 'sc_5', code: 'SC-5', zoneId: 'sb_zone_mall', zoneNum: 5,
    name: 'Crowd Control', missionType: 'SV', difficulty: 2,
    icon: '🚦', color: '#a855f7', arenaType: 'neon_city', totalDist: 36, timeLimit: 120, estMinutes: 10,
    story: 'A flash sale has drawn massive crowds to the mall! Security Bot must navigate through the crowd to reach the emergency exit and clear the path. Crowds are represented by moving obstacles — don\'t push anyone!',
    primaryObjective: { id: 'reach_exit', text: 'Reach the emergency exit without pushing any crowd members', type: 'reach_goal' },
    subObjectives: [
      { id: 'zero_push', text: 'Zero contact with any crowd member', bonusXP: 150 },
      { id: 'time', text: 'Clear the path in under 2 minutes', bonusXP: 75, type: 'time_limit', limitSeconds: 120 },
      { id: 'sensor', text: 'Use a sensor block to detect crowd movement', bonusXP: 75, type: 'block_used', blockId: 'when_sensor' },
    ],
    teaches: ['WAIT blocks for timing', 'IF sensor THEN stop/go'],
    codingConcept: 'IF the path is blocked THEN WAIT — patience is a security skill!',
    failTip: 'Use WAIT to pause between moves — the crowd gaps will open if you wait!',
    failTips: { collision: 'WAIT 1 second before each move — the crowd shifts constantly!', timeout: 'Find the gaps in the crowd and move quickly through them!', generic: 'IF the path is blocked THEN WAIT — patience is a security skill!' },
    xpBase: 175, winText: 'EXIT CLEARED! ✓',
    arenaSetup: {
      goal: { x: 0, z: -28, label: 'EMERGENCY EXIT', colors: [0xff4444, 0xa855f7] },
      collectibles: [],
      obstacles: [
        { type: 'boulder', x: -3, z: -5, range: 2, speed: 0.3 }, { type: 'boulder', x: 4, z: -9, range: 2, speed: 0.25 },
        { type: 'boulder', x: -4, z: -14, range: 2, speed: 0.35 }, { type: 'boulder', x: 3, z: -19, range: 2, speed: 0.2 },
        { type: 'boulder', x: -2, z: -23, range: 2, speed: 0.3 },
      ],
      props: ['crowd_barrier', 'arrow_sign'],
    },
  }),

  m({
    id: 'sc_6', code: 'SC-6', zoneId: 'sb_zone_mall', zoneNum: 6,
    name: 'Lost Child Finder', missionType: 'CD', difficulty: 3,
    icon: '👶', color: '#a855f7', arenaType: 'neon_city', totalDist: 38, timeLimit: 120, estMinutes: 11,
    story: 'A child has gone missing in the mall! Security Bot must search 4 possible locations using the life-detect sensor, find the child, and escort them safely back to the customer services desk.',
    primaryObjective: { id: 'find_and_return', text: 'Find the lost child and escort them to customer services', type: 'collect_and_reach' },
    subObjectives: [
      { id: 'sensor_scan', text: 'Use sensor to scan all 4 search areas', bonusXP: 100, type: 'block_used', blockId: 'when_sensor' },
      { id: 'time', text: 'Complete the rescue in under 2 minutes', bonusXP: 75, type: 'time_limit', limitSeconds: 120 },
      { id: 'no_panic', text: 'Move gently — SET SPEED 40 maximum near the child', bonusXP: 50 },
    ],
    teaches: ['Sensor-guided search', 'gentle speed control', 'COLLECT then RETURN'],
    codingConcept: 'Search areas one by one — when sensor detects the child, STOP and collect!',
    failTip: 'Search each area methodically — drive to each zone and WAIT 1 second for the sensor to respond!',
    failTips: { timeout: 'Visit all search areas in order — don\'t waste time backtracking!', generic: 'Search areas one by one — when sensor detects the child, STOP and collect!' },
    xpBase: 200, winText: 'CHILD FOUND! ✓',
    arenaSetup: {
      goal: { x: 0, z: 4, label: 'CUSTOMER SERVICES', colors: [0xa855f7, 0x22c55e] },
      collectibles: [{ x: 5, z: -20, type: 'person', hidden: true }],
      waypoints: [
        { x: -5, z: -8, num: 1, label: 'TOY SHOP' }, { x: 5, z: -14, num: 2, label: 'FOOD COURT' },
        { x: -4, z: -20, num: 3, label: 'GAME ZONE' }, { x: 4, z: -26, num: 4, label: 'CAR PARK' },
      ],
      obstacles: [
        { type: 'barrier', x: -1, z: -5 }, { type: 'barrier', x: 2, z: -11 },
        { type: 'barrier', x: -2, z: -17 }, { type: 'barrier', x: 1, z: -23 },
      ],
      props: ['shop_sign', 'bench'],
    },
  }),

  m({
    id: 'sc_7', code: 'SC-7', zoneId: 'sb_zone_mall', zoneNum: 7,
    name: 'Shoplifter Pursuit', missionType: 'SV', difficulty: 3,
    icon: '🏃', color: '#a855f7', arenaType: 'neon_city', totalDist: 40, timeLimit: 90, estMinutes: 12,
    story: 'A shoplifter is making a run for it through the mall! Security Bot must chase them down and block their path to the exit before they escape. The shoplifter is fast — Security Bot needs to take a shortcut!',
    primaryObjective: { id: 'block_exit', text: 'Reach the exit before the shoplifter and block the path', type: 'reach_goal' },
    subObjectives: [
      { id: 'shortcut', text: 'Use the shortcut path (cut through Zone B)', bonusXP: 125 },
      { id: 'speed', text: 'Arrive at the exit with at least 15 seconds to spare', bonusXP: 100 },
      { id: 'alert', text: 'Trigger the ALERT mode before blocking the exit', bonusXP: 75, type: 'block_used', blockId: 'robot_alert' },
    ],
    teaches: ['Speed optimisation', 'ALERT block', 'route planning under time pressure'],
    codingConcept: 'The shortcut through Zone B saves 8 seconds — plan for it!',
    failTip: 'Take the shortcut through Zone B — turn LEFT at the fountain and cut through!',
    failTips: { timeout: 'Use SET SPEED 100 and take the shortcut through Zone B!', generic: 'The shortcut through Zone B saves 8 seconds — plan for it!' },
    xpBase: 200, winText: 'SHOPLIFTER BLOCKED! ✓',
    arenaSetup: {
      goal: { x: 0, z: -28, label: 'MALL EXIT', colors: [0xa855f7, 0xff4444] },
      collectibles: [],
      obstacles: [
        { type: 'sentinel', x: 4, z: -12, patrolRadius: 3, radius: 1.5 },
        { type: 'barrier', x: -1, z: -5 }, { type: 'barrier', x: 2, z: -18 },
      ],
      props: ['fountain', 'arrow_sign'],
    },
  }),

  m({
    id: 'sc_8', code: 'SC-8', zoneId: 'sb_zone_mall', zoneNum: 8,
    name: 'End of Shift Report', missionType: 'MG', difficulty: 3,
    icon: '📋', color: '#a855f7', arenaType: 'neon_city', totalDist: 42, timeLimit: 150, estMinutes: 14,
    story: 'Security Bot\'s first full shift is nearly over! Complete the end-of-shift checklist: patrol all 4 zones, collect 3 incident reports, and return all items to HQ. Multi-tasking is a key security skill.',
    primaryObjective: { id: 'complete_checklist', text: 'Complete all end-of-shift tasks: patrol 4 zones and collect 3 reports', type: 'collect_and_reach' },
    subObjectives: [
      { id: 'all_zones', text: 'Patrol all 4 zones in correct order', bonusXP: 125, type: 'visit_waypoints' },
      { id: 'reports', text: 'Collect all 3 incident reports', bonusXP: 100, type: 'collect_count', target: 3 },
      { id: 'time', text: 'Complete the shift in under 2.5 minutes', bonusXP: 75, type: 'time_limit', limitSeconds: 150 },
    ],
    teaches: ['Combined collect + navigation', 'efficient multi-task routes'],
    codingConcept: 'Combine collection and patrol — pick up reports WHILE doing your patrol route!',
    failTip: 'Collect incident reports as you patrol each zone — two tasks at once saves time!',
    failTips: { timeout: 'Collect reports while patrolling — don\'t do separate trips!', generic: 'Combine collection and patrol — pick up reports WHILE doing your patrol route!' },
    xpBase: 225, winText: 'SHIFT COMPLETE! ✓',
    arenaSetup: {
      goal: { x: 0, z: 4, label: 'SECURITY HQ', colors: [0xa855f7, 0xffd700] },
      collectibles: [
        { x: -4, z: -8, type: 'report' }, { x: 4, z: -16, type: 'report' }, { x: -3, z: -24, type: 'report' },
      ],
      waypoints: [
        { x: -5, z: -6, num: 1, label: 'ZONE A' }, { x: 5, z: -12, num: 2, label: 'ZONE B' },
        { x: -4, z: -18, num: 3, label: 'ZONE C' }, { x: 3, z: -26, num: 4, label: 'ZONE D' },
      ],
      obstacles: [
        { type: 'barrier', x: -1, z: -3 }, { type: 'barrier', x: 1, z: -10 }, { type: 'barrier', x: -1, z: -21 },
      ],
      props: ['security_camera', 'barrier', 'cctv_pole'],
    },
  }),

  // ── ZONE 2: TECH FACILITY ────────────────────────────────────────────────
  m({
    id: 'sc_9', code: 'SC-9', zoneId: 'sb_zone_tech', zoneNum: 1,
    name: 'Airlock Clearance', missionType: 'SV', difficulty: 3,
    icon: '🚪', color: '#3b82f6', arenaType: 'warehouse_sort', totalDist: 34, timeLimit: 90, estMinutes: 11,
    story: 'The tech facility has a security airlock that cycles every 30 seconds. Security Bot must time its movements to pass through each airlock chamber before it locks. Timing is everything in high-security facilities.',
    primaryObjective: { id: 'pass_airlocks', text: 'Pass through all 3 airlock chambers without getting locked in', type: 'reach_goal' },
    subObjectives: [
      { id: 'no_stuck', text: 'Never get stuck in a chamber — always exit before lock-down', bonusXP: 150 },
      { id: 'time', text: 'Complete all 3 airlocks in under 90 seconds', bonusXP: 100, type: 'time_limit', limitSeconds: 90 },
      { id: 'wait', text: 'Use WAIT blocks to time entry through each chamber', bonusXP: 75, type: 'block_used', blockId: 'robot_wait' },
    ],
    teaches: ['WAIT blocks for timed entry', 'pattern recognition in obstacles'],
    codingConcept: 'Count the timing: WAIT 2 → MOVE FORWARD 6 → WAIT for next cycle!',
    failTip: 'Each airlock opens for 3 seconds — use WAIT then MOVE FORWARD quickly!',
    failTips: { timeout: 'Move faster through each chamber — MOVE FORWARD 8 to clear it in one go!', collision: 'You got locked in — use shorter WAIT times to enter earlier!', generic: 'Each airlock opens for 3 seconds — use WAIT then MOVE FORWARD quickly!' },
    xpBase: 225, winText: 'AIRLOCKS CLEARED! ✓',
    arenaSetup: {
      goal: { x: 0, z: -28, label: 'FACILITY INTERIOR', colors: [0x3b82f6, 0xa855f7] },
      collectibles: [],
      obstacles: [
        { type: 'spike', x: 0, z: -8, phase: 0, period: 3 },
        { type: 'spike', x: 0, z: -16, phase: 1.5, period: 3 },
        { type: 'spike', x: 0, z: -24, phase: 0.5, period: 3 },
      ],
      props: ['metal_door', 'warning_light'],
    },
  }),

  m({
    id: 'sc_10', code: 'SC-10', zoneId: 'sb_zone_tech', zoneNum: 2,
    name: 'Server Room Patrol', missionType: 'MG', difficulty: 3,
    icon: '💻', color: '#3b82f6', arenaType: 'warehouse_sort', totalDist: 36, timeLimit: 120, estMinutes: 12,
    story: 'The server room holds thousands of critical files. Security Bot must patrol between the server racks, scan each rack for heat anomalies, and report any issues. The racks are close together — precision navigation required.',
    primaryObjective: { id: 'scan_racks', text: 'Scan all 6 server racks for heat anomalies', type: 'visit_waypoints', target: 6 },
    subObjectives: [
      { id: 'no_touch', text: 'Zero rack contacts — server hardware is fragile', bonusXP: 150 },
      { id: 'order', text: 'Scan racks in correct order (1→6 on the map)', bonusXP: 75 },
      { id: 'time', text: 'Complete the scan in under 2 minutes', bonusXP: 75, type: 'time_limit', limitSeconds: 120 },
    ],
    teaches: ['Precise narrow-gap navigation', 'SET SPEED for tight spaces'],
    codingConcept: 'Slow down in tight spaces — SET SPEED 20 between the racks!',
    failTip: 'Use SET SPEED 20 in the rack corridors — too fast and you clip the hardware!',
    failTips: { collision: 'Reduce speed between racks — SET SPEED 20 in the server corridors!', timeout: 'Plan the shortest route through the racks — don\'t backtrack!', generic: 'Slow down in tight spaces — SET SPEED 20 between the racks!' },
    xpBase: 225, winText: 'SERVER ROOM SECURE! ✓',
    arenaSetup: {
      goal: { x: 0, z: 4, label: 'EXIT', colors: [0x3b82f6, 0x22c55e] },
      waypoints: [
        { x: -4, z: -4, num: 1, label: 'RACK 1' }, { x: 4, z: -4, num: 2, label: 'RACK 2' },
        { x: -4, z: -12, num: 3, label: 'RACK 3' }, { x: 4, z: -12, num: 4, label: 'RACK 4' },
        { x: -4, z: -20, num: 5, label: 'RACK 5' }, { x: 4, z: -20, num: 6, label: 'RACK 6' },
      ],
      collectibles: [],
      obstacles: [
        { type: 'barrier', x: 0, z: -2 }, { type: 'barrier', x: 0, z: -8 },
        { type: 'barrier', x: 0, z: -16 }, { type: 'barrier', x: 0, z: -24 },
      ],
      props: ['server_rack', 'status_light'],
    },
  }),

  m({
    id: 'sc_11', code: 'SC-11', zoneId: 'sb_zone_tech', zoneNum: 3,
    name: 'Laser Grid Gauntlet', missionType: 'SV', difficulty: 4,
    icon: '🔴', color: '#3b82f6', arenaType: 'warehouse_sort', totalDist: 38, timeLimit: 120, estMinutes: 14,
    story: 'The facility\'s laser security grid has been activated! Infrared beams cross the corridor in complex patterns. Security Bot must weave through the laser grid without triggering any alarms. Each laser has its own timing cycle.',
    primaryObjective: { id: 'cross_grid', text: 'Cross the laser grid and reach the control room', type: 'reach_goal' },
    subObjectives: [
      { id: 'zero_triggers', text: 'Zero laser triggers — not a single alarm', bonusXP: 200 },
      { id: 'time', text: 'Complete in under 2 minutes', bonusXP: 100, type: 'time_limit', limitSeconds: 120 },
      { id: 'sensor', text: 'Use sensor to detect laser timing before moving', bonusXP: 100, type: 'block_used', blockId: 'when_sensor' },
    ],
    teaches: ['Timed movement through patterns', 'WAIT + MOVE precision'],
    codingConcept: 'Watch the pattern: WAIT until the laser sweeps past THEN MOVE FORWARD quickly!',
    failTip: 'Each laser sweeps on a 2-second cycle — WAIT 1 second before moving each time!',
    failTips: { collision: 'You triggered a laser — wait longer before each move!', timeout: 'Move through each gap quickly once you start — don\'t pause mid-gap!', generic: 'Watch the pattern: WAIT until the laser sweeps past THEN MOVE FORWARD quickly!' },
    xpBase: 250, winText: 'LASER GRID CLEARED! ✓',
    arenaSetup: {
      goal: { x: 0, z: -28, label: 'CONTROL ROOM', colors: [0x3b82f6, 0xff4444] },
      collectibles: [],
      obstacles: [
        { type: 'spike', x: -2, z: -7, phase: 0, period: 2 }, { type: 'spike', x: 2, z: -7, phase: 1, period: 2 },
        { type: 'spike', x: -3, z: -14, phase: 0.5, period: 2 }, { type: 'spike', x: 3, z: -14, phase: 1.5, period: 2 },
        { type: 'spike', x: -2, z: -21, phase: 0, period: 2 }, { type: 'spike', x: 2, z: -21, phase: 1, period: 2 },
      ],
      props: ['laser_emitter', 'warning_light'],
    },
  }),

  m({
    id: 'sc_12', code: 'SC-12', zoneId: 'sb_zone_tech', zoneNum: 4,
    name: 'Data Recovery', missionType: 'CD', difficulty: 4,
    icon: '💾', color: '#3b82f6', arenaType: 'warehouse_sort', totalDist: 40, timeLimit: 150, estMinutes: 15,
    story: 'Critical data drives have been misplaced during a facility lockdown! Security Bot must locate all 5 data drives in different rooms, collect them, and return them to the data vault before the emergency lockdown ends.',
    primaryObjective: { id: 'recover_drives', text: 'Collect all 5 data drives and return them to the data vault', type: 'collect_and_reach' },
    subObjectives: [
      { id: 'all_5', text: 'Collect all 5 drives — none can be left behind', bonusXP: 150, type: 'collect_count', target: 5 },
      { id: 'time', text: 'Complete before lockdown ends (2.5 minutes)', bonusXP: 125, type: 'time_limit', limitSeconds: 150 },
      { id: 'no_contact', text: 'Avoid all security barriers while collecting', bonusXP: 75 },
    ],
    teaches: ['Efficient multi-item collection routes', 'plan before coding'],
    codingConcept: 'Visit the closest drive first, then the next closest — minimise backtracking!',
    failTip: 'Map out all 5 drive locations before coding — plan the shortest path through them!',
    failTips: { timeout: 'Start with the closest drive and work outward to save time!', collision: 'Slow down near barriers — use SET SPEED 30 in tight areas!', generic: 'Visit the closest drive first, then the next closest — minimise backtracking!' },
    xpBase: 275, winText: 'DATA RECOVERED! ✓',
    arenaSetup: {
      goal: { x: 0, z: 4, label: 'DATA VAULT', colors: [0x3b82f6, 0xffd700] },
      collectibles: [
        { x: -5, z: -6, type: 'data_drive' }, { x: 5, z: -10, type: 'data_drive' },
        { x: -4, z: -16, type: 'data_drive' }, { x: 4, z: -21, type: 'data_drive' },
        { x: 0, z: -27, type: 'data_drive' },
      ],
      obstacles: [
        { type: 'barrier', x: -1, z: -3 }, { type: 'barrier', x: 1, z: -8 },
        { type: 'barrier', x: -2, z: -13 }, { type: 'barrier', x: 2, z: -18 },
        { type: 'barrier', x: -1, z: -24 },
      ],
      props: ['server_rack', 'security_door'],
    },
  }),

  m({
    id: 'sc_13', code: 'SC-13', zoneId: 'sb_zone_tech', zoneNum: 5,
    name: 'Intruder Network', missionType: 'SV', difficulty: 4,
    icon: '🕵️', color: '#3b82f6', arenaType: 'warehouse_sort', totalDist: 42, timeLimit: 120, estMinutes: 15,
    story: 'Multiple intruders have entered the facility simultaneously! Security Bot must intercept 3 different intruders at 3 different locations — but it can only be in one place at a time. Prioritise the one closest to the server room!',
    primaryObjective: { id: 'intercept_all', text: 'Block all 3 intruders before they reach their targets', type: 'visit_waypoints', target: 3 },
    subObjectives: [
      { id: 'priority', text: 'Intercept the highest-priority intruder first (closest to server room)', bonusXP: 150 },
      { id: 'all_blocked', text: 'Successfully block all 3 — none escape', bonusXP: 125 },
      { id: 'time', text: 'Complete in under 2 minutes', bonusXP: 75, type: 'time_limit', limitSeconds: 120 },
    ],
    teaches: ['Priority-based decision making', 'efficient multi-target routing'],
    codingConcept: 'Intercept the most dangerous intruder first — the one closest to the server room!',
    failTip: 'Go to Intercept Point 3 first (closest to server room), then 2, then 1!',
    failTips: { timeout: 'Move quickly between intercept points — use SET SPEED 80!', generic: 'Intercept the most dangerous intruder first — the one closest to the server room!' },
    xpBase: 275, winText: 'ALL INTRUDERS BLOCKED! ✓',
    arenaSetup: {
      goal: { x: 0, z: 4, label: 'SECURITY HQ', colors: [0x3b82f6, 0xa855f7] },
      waypoints: [
        { x: -5, z: -8, num: 1, label: 'INTERCEPT 1' },
        { x: 5, z: -15, num: 2, label: 'INTERCEPT 2' },
        { x: 0, z: -24, num: 3, label: 'INTERCEPT 3' },
      ],
      collectibles: [],
      obstacles: [
        { type: 'sentinel', x: -5, z: -8, patrolRadius: 2, radius: 1.5 },
        { type: 'sentinel', x: 5, z: -15, patrolRadius: 2, radius: 1.5 },
        { type: 'sentinel', x: 0, z: -24, patrolRadius: 2, radius: 1.5 },
      ],
      props: ['warning_light', 'security_door'],
    },
  }),

  m({
    id: 'sc_14', code: 'SC-14', zoneId: 'sb_zone_tech', zoneNum: 6,
    name: 'VIP Protection', missionType: 'SV', difficulty: 4,
    icon: '🎖️', color: '#3b82f6', arenaType: 'warehouse_sort', totalDist: 44, timeLimit: 150, estMinutes: 16,
    story: 'A VIP visitor is touring the tech facility! Security Bot must escort them through the facility while continuously patrolling the surroundings for threats. The VIP moves forward at a fixed pace — Security Bot must keep up while checking for dangers.',
    primaryObjective: { id: 'escort_vip', text: 'Escort the VIP safely from the entrance to the exit', type: 'relay' },
    subObjectives: [
      { id: 'no_threats', text: 'Intercept all 3 threat alerts before they reach the VIP', bonusXP: 175 },
      { id: 'stay_close', text: 'Never fall more than 3 units behind the VIP', bonusXP: 100 },
      { id: 'time', text: 'Complete the escort in under 2.5 minutes', bonusXP: 75, type: 'time_limit', limitSeconds: 150 },
    ],
    teaches: ['Follow-and-guard logic', 'REPEAT loop for continuous patrol'],
    codingConcept: 'Use REPEAT: move with VIP, check side sensor, intercept if needed, move again!',
    failTip: 'Keep pace with the VIP — match their speed with SET SPEED 40 on straight sections!',
    failTips: { timeout: 'Don\'t investigate too far — stay within 3 units of the VIP at all times!', generic: 'Use REPEAT: move with VIP, check side sensor, intercept if needed, move again!' },
    xpBase: 300, winText: 'VIP ESCORTED SAFELY! ✓',
    arenaSetup: {
      goal: { x: 0, z: -28, label: 'EXIT', colors: [0x3b82f6, 0xffd700] },
      collectibles: [],
      obstacles: [
        { type: 'sentinel', x: -4, z: -8, patrolRadius: 3, radius: 1.5 },
        { type: 'sentinel', x: 4, z: -16, patrolRadius: 3, radius: 1.5 },
        { type: 'sentinel', x: -3, z: -24, patrolRadius: 3, radius: 1.5 },
      ],
      props: ['warning_light', 'arrow_sign'],
    },
  }),

  m({
    id: 'sc_15', code: 'SC-15', zoneId: 'sb_zone_tech', zoneNum: 7,
    name: 'Breach and Contain', missionType: 'SV', difficulty: 4,
    icon: '🔴', color: '#3b82f6', arenaType: 'warehouse_sort', totalDist: 46, timeLimit: 150, estMinutes: 17,
    story: 'A security breach has been detected! Unknown personnel have accessed Sector 7. Security Bot must lock down the sector by reaching all 4 control terminals and activating the lockdown code at each one — before the intruders can disable them.',
    primaryObjective: { id: 'lockdown', text: 'Activate lockdown at all 4 control terminals', type: 'visit_waypoints', target: 4 },
    subObjectives: [
      { id: 'speed', text: 'Reach all 4 terminals in under 2 minutes', bonusXP: 175, type: 'time_limit', limitSeconds: 120 },
      { id: 'precision', text: 'Activate each terminal precisely (within 1 unit)', bonusXP: 125 },
      { id: 'avoid', text: 'Avoid the 2 roaming intruder patrols', bonusXP: 100 },
    ],
    teaches: ['Speed + precision combination', 'planning routes around moving obstacles'],
    codingConcept: 'Time your moves to avoid the intruder patrols — use WAIT to let them pass!',
    failTip: 'Check which terminal is closest first — always hit the nearest one to save time!',
    failTips: { timeout: 'Hit the nearest terminal first then work outward — save the far ones for last!', collision: 'You walked into a patrol — use WAIT to let it pass before moving!', generic: 'Time your moves to avoid the intruder patrols — use WAIT to let them pass!' },
    xpBase: 325, winText: 'SECTOR LOCKED DOWN! ✓',
    arenaSetup: {
      goal: { x: 0, z: 4, label: 'COMMAND POST', colors: [0xff4444, 0x3b82f6] },
      waypoints: [
        { x: -5, z: -6, num: 1, label: 'TERMINAL A' }, { x: 5, z: -11, num: 2, label: 'TERMINAL B' },
        { x: -4, z: -17, num: 3, label: 'TERMINAL C' }, { x: 4, z: -24, num: 4, label: 'TERMINAL D' },
      ],
      collectibles: [],
      obstacles: [
        { type: 'sentinel', x: 0, z: -9, patrolRadius: 4, radius: 1.5 },
        { type: 'sentinel', x: 0, z: -21, patrolRadius: 4, radius: 1.5 },
      ],
      props: ['control_terminal', 'warning_light'],
    },
  }),

  // ── ZONE 3: CITY ROOFTOP ────────────────────────────────────────────────
  m({
    id: 'sc_16', code: 'SC-16', zoneId: 'sb_zone_rooftop', zoneNum: 1,
    name: 'Rooftop Night Patrol', missionType: 'MG', difficulty: 3,
    icon: '🌃', color: '#ec4899', arenaType: 'neon_city', totalDist: 36, timeLimit: 120, estMinutes: 12,
    story: 'The neon-lit city rooftops are Security Bot\'s new assignment! Patrol the perimeter path, check all 5 security checkpoints, and mark the patrol log. The rooftop has edges — one wrong turn sends Security Bot over the side!',
    primaryObjective: { id: 'rooftop_patrol', text: 'Complete the rooftop patrol circuit and check all 5 points', type: 'visit_waypoints', target: 5 },
    subObjectives: [
      { id: 'no_edge', text: 'Stay on the patrol path — no near-edge approaches', bonusXP: 150 },
      { id: 'loop', text: 'Complete 2 full patrol circuits', bonusXP: 125 },
      { id: 'time', text: 'Complete both circuits in under 2 minutes', bonusXP: 75, type: 'time_limit', limitSeconds: 120 },
    ],
    teaches: ['REPEAT for lap-based routes', 'edge awareness navigation'],
    codingConcept: 'Use REPEAT 2 to do the full circuit twice — patrol loop!',
    failTip: 'Stay away from the outer edge — keep your turns at least 2 units from the barriers!',
    failTips: { collision: 'You approached the edge — reduce speed and increase turn angles on corners!', timeout: 'Use REPEAT 2 for both circuits — write the patrol once and repeat it!', generic: 'Use REPEAT 2 to do the full circuit twice — patrol loop!' },
    xpBase: 250, winText: 'ROOFTOP SECURED! ✓',
    arenaSetup: {
      goal: { x: 0, z: 4, label: 'PATROL START', colors: [0xec4899, 0xa855f7] },
      waypoints: [
        { x: -5, z: -5, num: 1, label: 'CHECKPOINT 1' }, { x: 5, z: -10, num: 2, label: 'CHECKPOINT 2' },
        { x: -4, z: -16, num: 3, label: 'CHECKPOINT 3' }, { x: 4, z: -22, num: 4, label: 'CHECKPOINT 4' },
        { x: 0, z: -28, num: 5, label: 'CHECKPOINT 5' },
      ],
      collectibles: [],
      obstacles: [
        { type: 'barrier', x: -7, z: -10, damaging: true }, { type: 'barrier', x: 7, z: -15, damaging: true },
        { type: 'barrier', x: -7, z: -22, damaging: true }, { type: 'barrier', x: 7, z: -26, damaging: true },
      ],
      props: ['neon_sign', 'rooftop_ac', 'city_light'],
    },
  }),

  m({
    id: 'sc_17', code: 'SC-17', zoneId: 'sb_zone_rooftop', zoneNum: 2,
    name: 'Drone Surveillance', missionType: 'CD', difficulty: 4,
    icon: '🚁', color: '#ec4899', arenaType: 'neon_city', totalDist: 38, timeLimit: 120, estMinutes: 14,
    story: 'Rogue surveillance drones have appeared over the rooftops! Security Bot must collect the 4 signal jammers placed around the rooftop and deploy them at the designated blocking points to shut down the illegal drones.',
    primaryObjective: { id: 'jam_drones', text: 'Collect 4 signal jammers and deploy them at the 4 blocking points', type: 'collect_and_reach' },
    subObjectives: [
      { id: 'collect_first', text: 'Collect all 4 jammers before deploying any', bonusXP: 125 },
      { id: 'deploy_order', text: 'Deploy at points in order: North, East, South, West', bonusXP: 100 },
      { id: 'time', text: 'Complete in under 2 minutes', bonusXP: 75, type: 'time_limit', limitSeconds: 120 },
    ],
    teaches: ['Collect-then-deploy strategy', 'ordered multi-point delivery'],
    codingConcept: 'Collect ALL jammers first, then visit each deploy point in order!',
    failTip: 'Pick up all 4 jammers first — then deploy them all in one efficient circuit!',
    failTips: { timeout: 'Collect all 4 jammers in one loop, then deploy in one loop — two separate phases!', generic: 'Collect ALL jammers first, then visit each deploy point in order!' },
    xpBase: 275, winText: 'DRONES JAMMED! ✓',
    arenaSetup: {
      goal: { x: 0, z: 4, label: 'SECURITY HQ', colors: [0xec4899, 0x3b82f6] },
      collectibles: [
        { x: -4, z: -6, type: 'signal_jammer' }, { x: 4, z: -10, type: 'signal_jammer' },
        { x: -3, z: -18, type: 'signal_jammer' }, { x: 3, z: -23, type: 'signal_jammer' },
      ],
      waypoints: [
        { x: 0, z: -8, num: 1, label: 'NORTH' }, { x: 5, z: -14, num: 2, label: 'EAST' },
        { x: 0, z: -20, num: 3, label: 'SOUTH' }, { x: -5, z: -14, num: 4, label: 'WEST' },
      ],
      obstacles: [
        { type: 'sentinel', x: -3, z: -2, patrolRadius: 2, radius: 1.2 },
        { type: 'sentinel', x: 3, z: -2, patrolRadius: 2, radius: 1.2 },
      ],
      props: ['rooftop_ac', 'signal_tower'],
    },
  }),

  m({
    id: 'sc_18', code: 'SC-18', zoneId: 'sb_zone_rooftop', zoneNum: 3,
    name: 'Pursuit Across the Skyline', missionType: 'SV', difficulty: 4,
    icon: '🏃', color: '#ec4899', arenaType: 'neon_city', totalDist: 44, timeLimit: 90, estMinutes: 15,
    story: 'A suspect has escaped across the rooftops! Security Bot must chase them across 3 connecting buildings. Each building roof has different obstacles. Jump between buildings via the bridges and close the gap!',
    primaryObjective: { id: 'cross_buildings', text: 'Cross all 3 rooftops and corner the suspect at the final building', type: 'reach_goal' },
    subObjectives: [
      { id: 'no_fall', text: 'Don\'t fall off any rooftop — zero edge contacts', bonusXP: 175 },
      { id: 'fast', text: 'Complete the pursuit in under 90 seconds', bonusXP: 150, type: 'time_limit', limitSeconds: 90 },
      { id: 'shortcut', text: 'Use the Bridge 2 shortcut to gain ground', bonusXP: 100 },
    ],
    teaches: ['Multi-section route planning', 'speed vs precision trade-offs'],
    codingConcept: 'The direct path between rooftops is faster — plan the shortest safe route!',
    failTip: 'Take Bridge 2 on the left side — it\'s shorter than Bridge 1 by 4 seconds!',
    failTips: { collision: 'You fell — slow down near rooftop edges, use SET SPEED 40 near barriers!', timeout: 'Use the Bridge 2 shortcut — turn LEFT at the second AC unit!', generic: 'The direct path between rooftops is faster — plan the shortest safe route!' },
    xpBase: 300, winText: 'SUSPECT CORNERED! ✓',
    arenaSetup: {
      goal: { x: 0, z: -30, label: 'ROOFTOP 3', colors: [0xec4899, 0xff4444] },
      collectibles: [],
      obstacles: [
        { type: 'barrier', x: -6, z: -8, damaging: true }, { type: 'barrier', x: 6, z: -8, damaging: true },
        { type: 'barrier', x: -6, z: -18, damaging: true }, { type: 'barrier', x: 6, z: -18, damaging: true },
        { type: 'barrier', x: -4, z: -14 }, { type: 'barrier', x: 4, z: -25 },
      ],
      props: ['neon_sign', 'rooftop_ac', 'bridge_plank'],
    },
  }),

  m({
    id: 'sc_19', code: 'SC-19', zoneId: 'sb_zone_rooftop', zoneNum: 4,
    name: 'Aerial Threat Response', missionType: 'SV', difficulty: 5,
    icon: '🎯', color: '#ec4899', arenaType: 'neon_city', totalDist: 46, timeLimit: 120, estMinutes: 16,
    story: 'Laser targeting drones are sweeping the rooftop! Security Bot must collect 4 EMP grenades and deploy them at the 4 drone transponders — but must stay out of the laser sweep zones while doing it.',
    primaryObjective: { id: 'emp_drones', text: 'Deploy EMP grenades at all 4 drone transponders', type: 'collect_and_reach' },
    subObjectives: [
      { id: 'zero_laser', text: 'Never enter a laser sweep zone — zero detections', bonusXP: 200 },
      { id: 'all_emp', text: 'Deploy all 4 EMPs successfully', bonusXP: 150, type: 'collect_count', target: 4 },
      { id: 'time', text: 'Complete in under 2 minutes', bonusXP: 75, type: 'time_limit', limitSeconds: 120 },
    ],
    teaches: ['Sensor-guided evasion while collecting', 'complex multi-objective programs'],
    codingConcept: 'Use IF laser sensor active THEN WAIT — only move in the safe windows!',
    failTip: 'When the laser sweeps, STOP and WAIT. Move only during the 2-second gap between sweeps!',
    failTips: { collision: 'You entered a laser zone — WAIT longer before each movement!', timeout: 'Move faster in the safe windows — plan your route to each transponder in advance!', generic: 'Use IF laser sensor active THEN WAIT — only move in the safe windows!' },
    xpBase: 325, winText: 'DRONES NEUTRALISED! ✓',
    arenaSetup: {
      goal: { x: 0, z: 4, label: 'SECURE ZONE', colors: [0xec4899, 0xffd700] },
      collectibles: [
        { x: -4, z: -5, type: 'emp_grenade' }, { x: 4, z: -11, type: 'emp_grenade' },
        { x: -3, z: -18, type: 'emp_grenade' }, { x: 3, z: -24, type: 'emp_grenade' },
      ],
      waypoints: [
        { x: 0, z: -7, num: 1, label: 'TRANSPONDER 1' }, { x: 5, z: -14, num: 2, label: 'TRANSPONDER 2' },
        { x: 0, z: -21, num: 3, label: 'TRANSPONDER 3' }, { x: -5, z: -27, num: 4, label: 'TRANSPONDER 4' },
      ],
      obstacles: [
        { type: 'spike', x: 0, z: -9, phase: 0, period: 2.5 }, { type: 'spike', x: 0, z: -17, phase: 1.25, period: 2.5 },
        { type: 'spike', x: 0, z: -25, phase: 0, period: 2.5 },
      ],
      props: ['drone_transponder', 'laser_emitter', 'warning_light'],
    },
  }),

  m({
    id: 'sc_20', code: 'SC-20', zoneId: 'sb_zone_rooftop', zoneNum: 5,
    name: 'Command Override', missionType: 'MG', difficulty: 5,
    icon: '📡', color: '#ec4899', arenaType: 'neon_city', totalDist: 48, timeLimit: 150, estMinutes: 17,
    story: 'The central command system has been hacked! Security Bot must physically access 6 network hubs scattered across the rooftop campus and restore manual override at each one. Multiple threat patrols are active — use variables to track which hubs are secured.',
    primaryObjective: { id: 'restore_hubs', text: 'Restore manual override at all 6 network hubs', type: 'visit_waypoints', target: 6 },
    subObjectives: [
      { id: 'avoid_patrols', text: 'Avoid all 3 threat patrol routes — zero intercepts', bonusXP: 200 },
      { id: 'track_progress', text: 'Use a variable to count hubs secured', bonusXP: 150, type: 'block_used', blockId: 'robot_var_set' },
      { id: 'time', text: 'Complete all 6 overrides in under 2.5 minutes', bonusXP: 100, type: 'time_limit', limitSeconds: 150 },
    ],
    teaches: ['Variables for tracking state', 'avoiding moving obstacles at scale'],
    codingConcept: 'Use a VARIABLE to count secured hubs — when it reaches 6, head back to HQ!',
    failTip: 'Set a variable HUBS = 0, then HUBS = HUBS + 1 each time you secure one!',
    failTips: { timeout: 'Plan the route through all 6 hubs first — shortest connecting path!', collision: 'You walked into a patrol — use WAIT to time your movements between patrol cycles!', generic: 'Use a VARIABLE to count secured hubs — when it reaches 6, head back to HQ!' },
    xpBase: 350, winText: 'COMMAND RESTORED! ✓',
    arenaSetup: {
      goal: { x: 0, z: 4, label: 'COMMAND CENTRE', colors: [0xec4899, 0x3b82f6] },
      waypoints: [
        { x: -5, z: -5, num: 1, label: 'HUB 1' }, { x: 5, z: -10, num: 2, label: 'HUB 2' },
        { x: -4, z: -14, num: 3, label: 'HUB 3' }, { x: 4, z: -19, num: 4, label: 'HUB 4' },
        { x: -3, z: -24, num: 5, label: 'HUB 5' }, { x: 3, z: -28, num: 6, label: 'HUB 6' },
      ],
      collectibles: [],
      obstacles: [
        { type: 'sentinel', x: 0, z: -8, patrolRadius: 4, radius: 1.5 },
        { type: 'sentinel', x: 0, z: -17, patrolRadius: 4, radius: 1.5 },
        { type: 'sentinel', x: 0, z: -26, patrolRadius: 4, radius: 1.5 },
      ],
      props: ['signal_tower', 'neon_sign', 'network_hub'],
    },
  }),

  // ── ZONE 4: ARCTIC VAULT ─────────────────────────────────────────────────
  m({
    id: 'sc_21', code: 'SC-21', zoneId: 'sb_zone_vault', zoneNum: 1,
    name: 'Frozen Perimeter', missionType: 'MG', difficulty: 4,
    icon: '❄️', color: '#93c5fd', arenaType: 'arctic_station', totalDist: 38, timeLimit: 120, estMinutes: 14,
    story: 'The Arctic Vault is the most secure facility on the planet — and Security Bot has just arrived for its assignment! The perimeter is 4km of frozen terrain. Patrol all 5 perimeter checkpoints in sub-zero conditions. Ice means slower turning!',
    primaryObjective: { id: 'perimeter_patrol', text: 'Complete the full Arctic perimeter patrol and check all 5 points', type: 'visit_waypoints', target: 5 },
    subObjectives: [
      { id: 'ice', text: 'Complete the full patrol without slipping on ice (no sudden turns)', bonusXP: 150 },
      { id: 'repeat', text: 'Use a REPEAT loop for the patrol circuit', bonusXP: 125, type: 'block_used', blockId: 'robot_repeat' },
      { id: 'time', text: 'Complete the patrol in under 2 minutes', bonusXP: 75, type: 'time_limit', limitSeconds: 120 },
    ],
    teaches: ['REPEAT for patrol loops', 'speed management on slippery surfaces'],
    codingConcept: 'Turn SLOWLY on ice — use smaller angle turns like TURN LEFT 45!',
    failTip: 'Reduce your turn angles in the ice zones — TURN LEFT 30 instead of 90 prevents slipping!',
    failTips: { collision: 'Slow down before turning on ice — SET SPEED 20 then TURN!', timeout: 'Use REPEAT 5 with your patrol segment inside!', generic: 'Turn SLOWLY on ice — use smaller angle turns like TURN LEFT 45!' },
    xpBase: 300, winText: 'PERIMETER SECURED! ✓',
    arenaSetup: {
      goal: { x: 0, z: 4, label: 'ARCTIC BASE', colors: [0x93c5fd, 0xffffff] },
      waypoints: [
        { x: -5, z: -5, num: 1, label: 'CHECKPOINT 1' }, { x: 5, z: -9, num: 2, label: 'CHECKPOINT 2' },
        { x: -4, z: -14, num: 3, label: 'CHECKPOINT 3' }, { x: 4, z: -20, num: 4, label: 'CHECKPOINT 4' },
        { x: 0, z: -26, num: 5, label: 'CHECKPOINT 5' },
      ],
      collectibles: [],
      obstacles: [
        { type: 'current', x: -2, z: -7, forceX: 0.2 }, { type: 'current', x: 2, z: -12, forceX: -0.2 },
        { type: 'current', x: -1, z: -18, forceX: 0.2 }, { type: 'current', x: 1, z: -24, forceX: -0.2 },
      ],
      props: ['snow_drift', 'ice_patch', 'fence_post'],
    },
  }),

  m({
    id: 'sc_22', code: 'SC-22', zoneId: 'sb_zone_vault', zoneNum: 2,
    name: 'Vault Breach Response', missionType: 'SV', difficulty: 4,
    icon: '🔐', color: '#93c5fd', arenaType: 'arctic_station', totalDist: 40, timeLimit: 120, estMinutes: 15,
    story: 'Emergency! The vault has been breached! Security Bot must reach the vault door, collect the emergency override key from 3 scattered locations, and seal the vault before the extraction team escapes with the cargo.',
    primaryObjective: { id: 'seal_vault', text: 'Collect all 3 override key fragments and seal the vault door', type: 'collect_and_reach' },
    subObjectives: [
      { id: 'fast', text: 'Seal the vault in under 2 minutes', bonusXP: 175, type: 'time_limit', limitSeconds: 120 },
      { id: 'fragments', text: 'Collect all 3 key fragments', bonusXP: 125, type: 'collect_count', target: 3 },
      { id: 'no_ice', text: 'Don\'t slide off the ice platforms — zero falls', bonusXP: 100 },
    ],
    teaches: ['Collect then deliver under extreme time pressure', 'IF-THEN with sensor for ice detection'],
    codingConcept: 'Collect all 3 fragments first — don\'t return to the vault until you have all 3!',
    failTip: 'The key fragments are marked with blue lights — collect all 3 THEN go to the vault door!',
    failTips: { timeout: 'Move at full speed to collect fragments — slow only on ice patches!', collision: 'You slid on ice — reduce speed before reaching ice patches with SET SPEED 25!', generic: 'Collect all 3 fragments first — don\'t return to the vault until you have all 3!' },
    xpBase: 325, winText: 'VAULT SEALED! ✓',
    arenaSetup: {
      goal: { x: 0, z: -28, label: 'VAULT DOOR', colors: [0x93c5fd, 0xffd700] },
      collectibles: [
        { x: -5, z: -8, type: 'key_fragment' }, { x: 5, z: -14, type: 'key_fragment' }, { x: -3, z: -22, type: 'key_fragment' },
      ],
      obstacles: [
        { type: 'current', x: -1, z: -5, forceX: 0.3 }, { type: 'current', x: 1, z: -11, forceX: -0.3 },
        { type: 'current', x: -1, z: -17, forceX: 0.25 }, { type: 'current', x: 1, z: -24, forceX: -0.25 },
      ],
      props: ['ice_patch', 'snow_drift', 'security_door'],
    },
  }),

  m({
    id: 'sc_23', code: 'SC-23', zoneId: 'sb_zone_vault', zoneNum: 3,
    name: 'Blizzard Patrol', missionType: 'SV', difficulty: 5,
    icon: '🌨️', color: '#93c5fd', arenaType: 'arctic_station', totalDist: 42, timeLimit: 150, estMinutes: 16,
    story: 'A blizzard has hit the Arctic Vault! Visibility is near zero. Security Bot must complete the emergency patrol using only its sensors — the visual path markers are buried under snow. Trust your sensor readings!',
    primaryObjective: { id: 'blizzard_patrol', text: 'Complete the emergency patrol using sensor guidance only', type: 'visit_waypoints', target: 4 },
    subObjectives: [
      { id: 'sensors_only', text: 'Use IF sensor THEN turn — no fixed-angle turns at all', bonusXP: 200, type: 'block_used', blockId: 'when_sensor' },
      { id: 'no_collision', text: 'Zero collisions with hidden obstacles under the snow', bonusXP: 150 },
      { id: 'time', text: 'Complete the patrol in under 2.5 minutes', bonusXP: 75, type: 'time_limit', limitSeconds: 150 },
    ],
    teaches: ['Fully sensor-driven navigation', 'IF-THEN decision trees'],
    codingConcept: 'Use WHEN SENSOR LEFT TRIGGERED THEN TURN RIGHT — let the sensors guide you!',
    failTip: 'In zero visibility, sensors are everything — add IF sensor blocked THEN turn away logic!',
    failTips: { collision: 'You hit a hidden obstacle — use sensors BEFORE moving, not after!', timeout: 'Move faster between sensor checks — MOVE FORWARD 3 between each scan!', generic: 'Use WHEN SENSOR LEFT TRIGGERED THEN TURN RIGHT — let the sensors guide you!' },
    xpBase: 350, winText: 'BLIZZARD PATROL COMPLETE! ✓',
    arenaSetup: {
      goal: { x: 0, z: 4, label: 'ARCTIC BASE', colors: [0x93c5fd, 0xa855f7] },
      waypoints: [
        { x: -5, z: -7, num: 1, label: 'CHECKPOINT 1' }, { x: 5, z: -14, num: 2, label: 'CHECKPOINT 2' },
        { x: -4, z: -21, num: 3, label: 'CHECKPOINT 3' }, { x: 0, z: -28, num: 4, label: 'CHECKPOINT 4' },
      ],
      collectibles: [],
      obstacles: [
        { type: 'barrier', x: -2, z: -4, buried: true }, { type: 'barrier', x: 3, z: -10, buried: true },
        { type: 'barrier', x: -3, z: -17, buried: true }, { type: 'barrier', x: 2, z: -24, buried: true },
        { type: 'current', x: 0, z: -11, forceX: 0.3 }, { type: 'current', x: 0, z: -20, forceX: -0.3 },
      ],
      atmosphere: { fogDensity: 0.06 },
      props: ['snow_drift', 'blizzard_effect'],
    },
  }),

  m({
    id: 'sc_24', code: 'SC-24', zoneId: 'sb_zone_vault', zoneNum: 4,
    name: 'Multi-Zone Lockdown', missionType: 'SV', difficulty: 5,
    icon: '🔒', color: '#93c5fd', arenaType: 'arctic_station', totalDist: 44, timeLimit: 150, estMinutes: 17,
    story: 'The Arctic Vault is under coordinated attack from multiple directions! Security Bot must seal 5 entry points across the facility in sequence — each one getting harder to reach as the attack intensifies. Use variables to track progress.',
    primaryObjective: { id: 'seal_entries', text: 'Seal all 5 entry points before the attackers break through', type: 'visit_waypoints', target: 5 },
    subObjectives: [
      { id: 'sequence', text: 'Seal them in order of threat level (farthest first)', bonusXP: 200 },
      { id: 'variable', text: 'Use a variable to count sealed entries', bonusXP: 150, type: 'block_used', blockId: 'robot_var_set' },
      { id: 'time', text: 'Complete in under 2.5 minutes', bonusXP: 100, type: 'time_limit', limitSeconds: 150 },
    ],
    teaches: ['Variables for progress tracking', 'sequenced multi-objective completion'],
    codingConcept: 'SEALED = 0. Visit farthest entry first. Add 1 to SEALED each time. IF SEALED = 5 THEN return!',
    failTip: 'Start with the farthest entry point (bottom) and work your way back to the nearest — it\'s faster overall!',
    failTips: { timeout: 'Start at the farthest point and work back — saves backtracking time!', generic: 'SEALED = 0. Visit farthest entry first. Add 1 to SEALED each time. IF SEALED = 5 THEN return!' },
    xpBase: 375, winText: 'VAULT DEFENDED! ✓',
    arenaSetup: {
      goal: { x: 0, z: 4, label: 'COMMAND POST', colors: [0x93c5fd, 0xff4444] },
      waypoints: [
        { x: -4, z: -6, num: 1, label: 'ENTRY 1' }, { x: 4, z: -11, num: 2, label: 'ENTRY 2' },
        { x: -3, z: -17, num: 3, label: 'ENTRY 3' }, { x: 3, z: -23, num: 4, label: 'ENTRY 4' },
        { x: 0, z: -29, num: 5, label: 'ENTRY 5' },
      ],
      collectibles: [],
      obstacles: [
        { type: 'sentinel', x: -4, z: -9, patrolRadius: 2, radius: 1.2 },
        { type: 'sentinel', x: 4, z: -14, patrolRadius: 2, radius: 1.2 },
        { type: 'sentinel', x: -2, z: -20, patrolRadius: 2, radius: 1.2 },
        { type: 'current', x: 1, z: -26, forceX: -0.3 },
      ],
      atmosphere: { fogDensity: 0.03 },
      props: ['fence_post', 'security_door', 'snow_drift'],
    },
  }),

  m({
    id: 'sc_25', code: 'SC-25', zoneId: 'sb_zone_vault', zoneNum: 5,
    name: 'Deep Freeze Recovery', missionType: 'CD', difficulty: 5,
    icon: '🧊', color: '#93c5fd', arenaType: 'arctic_station', totalDist: 46, timeLimit: 150, estMinutes: 18,
    story: 'Sub-zero temperatures have frozen the security network nodes across the vault! Security Bot must warm up and reactivate 6 frozen nodes scattered across the facility. Each node requires a 2-second warm-up blast before it can restart.',
    primaryObjective: { id: 'reactivate_nodes', text: 'Reactivate all 6 frozen network nodes', type: 'visit_waypoints', target: 6 },
    subObjectives: [
      { id: 'warmup', text: 'Use WAIT 2 at each node to complete the warm-up', bonusXP: 175, type: 'block_used', blockId: 'robot_wait' },
      { id: 'all_nodes', text: 'Reactivate all 6 — zero nodes skipped', bonusXP: 150 },
      { id: 'time', text: 'Complete in under 2.5 minutes', bonusXP: 100, type: 'time_limit', limitSeconds: 150 },
    ],
    teaches: ['WAIT for action timing', 'multi-point visit with actions at each'],
    codingConcept: 'MOVE to node → WAIT 2 seconds → activate → MOVE to next!',
    failTip: 'Add WAIT 2 at each node — skipping the warm-up leaves the node frozen!',
    failTips: { timeout: 'Plan the shortest path through all 6 nodes — visit nearest ones first!', generic: 'MOVE to node → WAIT 2 seconds → activate → MOVE to next!' },
    xpBase: 375, winText: 'NETWORK RESTORED! ✓',
    arenaSetup: {
      goal: { x: 0, z: 4, label: 'CENTRAL COMMAND', colors: [0x93c5fd, 0x22c55e] },
      waypoints: [
        { x: -5, z: -5, num: 1, label: 'NODE 1' }, { x: 5, z: -9, num: 2, label: 'NODE 2' },
        { x: -4, z: -13, num: 3, label: 'NODE 3' }, { x: 4, z: -18, num: 4, label: 'NODE 4' },
        { x: -3, z: -23, num: 5, label: 'NODE 5' }, { x: 2, z: -28, num: 6, label: 'NODE 6' },
      ],
      collectibles: [],
      obstacles: [
        { type: 'current', x: 0, z: -7, forceX: 0.2 }, { type: 'current', x: 0, z: -15, forceX: -0.2 },
        { type: 'current', x: 0, z: -21, forceX: 0.2 }, { type: 'current', x: 0, z: -26, forceX: -0.2 },
      ],
      props: ['ice_patch', 'network_node', 'snow_drift'],
    },
  }),

  m({
    id: 'sc_26', code: 'SC-26', zoneId: 'sb_zone_vault', zoneNum: 6,
    name: 'Arctic Standoff', missionType: 'SV', difficulty: 5,
    icon: '🎯', color: '#93c5fd', arenaType: 'arctic_station', totalDist: 48, timeLimit: 180, estMinutes: 19,
    story: 'The Arctic Vault is under siege! Security Bot must hold 3 defensive positions in rotation — moving between them every 30 seconds to maintain coverage. If any position is left undefended for more than 5 seconds, the vault is breached.',
    primaryObjective: { id: 'hold_positions', text: 'Hold all 3 defensive positions and repel the siege for 2 minutes', type: 'lap_count' },
    subObjectives: [
      { id: 'no_breach', text: 'No position undefended for more than 5 seconds', bonusXP: 200 },
      { id: 'loop', text: 'Use a REPEAT loop to cycle between positions continuously', bonusXP: 175, type: 'block_used', blockId: 'robot_repeat' },
      { id: 'time', text: 'Survive all 3 minutes of the siege', bonusXP: 125, type: 'time_limit', limitSeconds: 180 },
    ],
    teaches: ['REPEAT for continuous cycles', 'timed position rotation'],
    codingConcept: 'REPEAT: move to Position 1 → WAIT 10 → Position 2 → WAIT 10 → Position 3 → WAIT 10!',
    failTip: 'Each position needs at least 10 seconds of coverage — use WAIT 10 at each one!',
    failTips: { timeout: 'Cycle faster — MOVE FORWARD between positions at maximum speed!', generic: 'REPEAT: move to Position 1 → WAIT 10 → Position 2 → WAIT 10 → Position 3 → WAIT 10!' },
    xpBase: 400, winText: 'SIEGE REPELLED! ✓',
    arenaSetup: {
      goal: { x: 0, z: 4, label: 'SECURE BASE', colors: [0x93c5fd, 0xff4444] },
      waypoints: [
        { x: -5, z: -8, num: 1, label: 'POSITION 1' },
        { x: 5, z: -18, num: 2, label: 'POSITION 2' },
        { x: -3, z: -26, num: 3, label: 'POSITION 3' },
      ],
      collectibles: [],
      obstacles: [
        { type: 'sentinel', x: 0, z: -13, patrolRadius: 5, radius: 1.5 },
        { type: 'sentinel', x: 4, z: -22, patrolRadius: 4, radius: 1.5 },
        { type: 'current', x: -2, z: -10, forceX: 0.3 }, { type: 'current', x: 2, z: -22, forceX: -0.3 },
      ],
      atmosphere: { fogDensity: 0.025 },
      props: ['snow_drift', 'fence_post', 'ice_patch'],
    },
  }),

  m({
    id: 'sc_27', code: 'SC-27', zoneId: 'sb_zone_vault', zoneNum: 7,
    name: 'Cryo Corridor Extraction', missionType: 'CD', difficulty: 5,
    icon: '💎', color: '#93c5fd', arenaType: 'arctic_station', totalDist: 50, timeLimit: 180, estMinutes: 20,
    story: 'The cryo-stored research capsules must be extracted before the facility powers down! Security Bot has 3 minutes to collect all 7 capsules from the frozen storage corridors and bring them to the extraction pod — navigating around security laser grids.',
    primaryObjective: { id: 'extract_capsules', text: 'Collect all 7 cryo capsules and return them to the extraction pod', type: 'collect_and_reach' },
    subObjectives: [
      { id: 'all_7', text: 'Collect all 7 — none left behind', bonusXP: 200, type: 'collect_count', target: 7 },
      { id: 'no_laser', text: 'Zero laser grid triggers', bonusXP: 175 },
      { id: 'time', text: 'Complete the extraction in under 3 minutes', bonusXP: 100, type: 'time_limit', limitSeconds: 180 },
    ],
    teaches: ['Large-scale collection under time + hazard pressure', 'full program planning'],
    codingConcept: 'Plan the route through all 7 capsules FIRST — then code it in one efficient program!',
    failTip: 'Draw all 7 capsule positions on paper and plan the shortest circuit before coding!',
    failTips: { timeout: 'Collect in a circuit — never backtrack!', collision: 'The laser grid triggers when you move too fast — SET SPEED 40 near laser zones!', generic: 'Plan the route through all 7 capsules FIRST — then code it in one efficient program!' },
    xpBase: 425, winText: 'EXTRACTION COMPLETE! ✓',
    arenaSetup: {
      goal: { x: 0, z: 4, label: 'EXTRACTION POD', colors: [0x93c5fd, 0x3b82f6] },
      collectibles: [
        { x: -5, z: -5, type: 'cryo_capsule' }, { x: 5, z: -9, type: 'cryo_capsule' },
        { x: -4, z: -13, type: 'cryo_capsule' }, { x: 4, z: -17, type: 'cryo_capsule' },
        { x: -3, z: -21, type: 'cryo_capsule' }, { x: 3, z: -25, type: 'cryo_capsule' },
        { x: 0, z: -29, type: 'cryo_capsule' },
      ],
      obstacles: [
        { type: 'spike', x: 0, z: -7, phase: 0, period: 2 }, { type: 'spike', x: 0, z: -15, phase: 1, period: 2 },
        { type: 'spike', x: 0, z: -23, phase: 0, period: 2 },
        { type: 'current', x: -2, z: -11, forceX: 0.2 }, { type: 'current', x: 2, z: -19, forceX: -0.2 },
      ],
      atmosphere: { fogDensity: 0.02 },
      props: ['cryo_storage', 'laser_emitter', 'ice_patch'],
    },
  }),

  m({
    id: 'sc_28', code: 'SC-28', zoneId: 'sb_zone_vault', zoneNum: 8,
    name: 'Arctic Incident: Phase 1', missionType: 'SV', difficulty: 5,
    icon: '🔴', color: '#93c5fd', arenaType: 'arctic_station', totalDist: 50, timeLimit: 180, estMinutes: 20,
    story: 'MAJOR INCIDENT! The Arctic Vault is under simultaneous attack across all sectors! Phase 1: Security Bot must secure the 4 primary access corridors before the attackers can establish entry routes. Every second counts.',
    primaryObjective: { id: 'secure_corridors', text: 'Secure all 4 primary access corridors', type: 'visit_waypoints', target: 4 },
    subObjectives: [
      { id: 'speed', text: 'Secure all 4 in under 2 minutes', bonusXP: 200, type: 'time_limit', limitSeconds: 120 },
      { id: 'no_threats', text: 'Avoid all attacker patrols while securing', bonusXP: 175 },
      { id: 'variable', text: 'Use a variable to track secured corridors', bonusXP: 125, type: 'block_used', blockId: 'robot_var_set' },
    ],
    teaches: ['Speed + precision + variable tracking combined', 'large-scale program design'],
    codingConcept: 'SECURED = 0. Move to each corridor → secure → SECURED + 1. IF SECURED = 4 → return to base!',
    failTip: 'Write the program in phases: Plan → Move fast → Secure each → Track with variable → Return!',
    failTips: { timeout: 'Max speed between corridors — use SET SPEED 100 on straight sections!', generic: 'SECURED = 0. Move to each corridor → secure → SECURED + 1. IF SECURED = 4 → return to base!' },
    xpBase: 450, winText: 'PHASE 1 COMPLETE! ✓',
    arenaSetup: {
      goal: { x: 0, z: 4, label: 'COMMAND POST', colors: [0xff4444, 0x93c5fd] },
      waypoints: [
        { x: -5, z: -7, num: 1, label: 'CORRIDOR A' }, { x: 5, z: -13, num: 2, label: 'CORRIDOR B' },
        { x: -4, z: -20, num: 3, label: 'CORRIDOR C' }, { x: 4, z: -27, num: 4, label: 'CORRIDOR D' },
      ],
      collectibles: [],
      obstacles: [
        { type: 'sentinel', x: 0, z: -10, patrolRadius: 4, radius: 1.5 },
        { type: 'sentinel', x: 0, z: -17, patrolRadius: 4, radius: 1.5 },
        { type: 'sentinel', x: 0, z: -24, patrolRadius: 4, radius: 1.5 },
        { type: 'current', x: -2, z: -16, forceX: 0.3 },
      ],
      atmosphere: { fogDensity: 0.02 },
      props: ['security_door', 'snow_drift', 'warning_light'],
    },
  }),

  m({
    id: 'sc_29', code: 'SC-29', zoneId: 'sb_zone_vault', zoneNum: 9,
    name: 'Arctic Incident: Phase 2', missionType: 'CD', difficulty: 5,
    icon: '🟡', color: '#93c5fd', arenaType: 'arctic_station', totalDist: 52, timeLimit: 180, estMinutes: 21,
    story: 'Phase 2! The attackers have breached the outer perimeter and are heading for the vault core. Security Bot must recover the 5 emergency response packs from deep in the facility and bring them to the 3 defence positions simultaneously.',
    primaryObjective: { id: 'distribute_packs', text: 'Collect 5 response packs and deliver to all 3 defence positions', type: 'multi_leg' },
    subObjectives: [
      { id: 'all_packs', text: 'Collect all 5 packs — none left behind', bonusXP: 200, type: 'collect_count', target: 5 },
      { id: 'all_positions', text: 'Deliver to all 3 defence positions', bonusXP: 175, type: 'visit_waypoints' },
      { id: 'time', text: 'Complete Phase 2 in under 3 minutes', bonusXP: 100, type: 'time_limit', limitSeconds: 180 },
    ],
    teaches: ['Multi-leg delivery (collect + distribute)', 'functions for reusable movement code'],
    codingConcept: 'Use a FUNCTION for "go to next waypoint" — call it 8 times to visit all locations!',
    failTip: 'Write a function for your movement sequence — you\'ll call it many times in this mission!',
    failTips: { timeout: 'Collect all packs first in one sweep, then distribute them all — two phases!', generic: 'Use a FUNCTION for "go to next waypoint" — call it 8 times to visit all locations!' },
    xpBase: 475, winText: 'PHASE 2 COMPLETE! ✓',
    arenaSetup: {
      goal: { x: 0, z: 4, label: 'COMMAND POST', colors: [0xffd700, 0x93c5fd] },
      collectibles: [
        { x: -5, z: -6, type: 'response_pack' }, { x: 5, z: -10, type: 'response_pack' },
        { x: -4, z: -15, type: 'response_pack' }, { x: 4, z: -21, type: 'response_pack' },
        { x: 0, z: -26, type: 'response_pack' },
      ],
      waypoints: [
        { x: -5, z: -11, num: 1, label: 'DEFENCE 1' },
        { x: 5, z: -18, num: 2, label: 'DEFENCE 2' },
        { x: 0, z: -28, num: 3, label: 'DEFENCE 3' },
      ],
      obstacles: [
        { type: 'sentinel', x: 0, z: -13, patrolRadius: 3, radius: 1.5 },
        { type: 'sentinel', x: 0, z: -22, patrolRadius: 3, radius: 1.5 },
        { type: 'current', x: -2, z: -8, forceX: 0.25 }, { type: 'current', x: 2, z: -18, forceX: -0.25 },
      ],
      atmosphere: { fogDensity: 0.025 },
      props: ['snow_drift', 'security_door', 'defence_turret'],
    },
  }),

  m({
    id: 'sc_30', code: 'SC-30', zoneId: 'sb_zone_vault', zoneNum: 10,
    name: 'Arctic Incident: Full Lockdown', missionType: 'SV', difficulty: 5,
    icon: '🏆', color: '#93c5fd', arenaType: 'arctic_station', totalDist: 54, timeLimit: 240, estMinutes: 22,
    story: 'FINAL PHASE — Full facility lockdown! Security Bot must: seal the 3 breach points, collect 4 critical files from compromised zones, and reach the emergency extraction point — all within 4 minutes while navigating an active threat field. This is what Security Bot was built for.',
    primaryObjective: { id: 'full_lockdown', text: 'Complete all lockdown objectives: seal 3 breaches, collect 4 files, reach extraction', type: 'multi_leg' },
    subObjectives: [
      { id: 'all_sealed', text: 'Seal all 3 breach points', bonusXP: 200 },
      { id: 'all_files', text: 'Recover all 4 critical files', bonusXP: 175, type: 'collect_count', target: 4 },
      { id: 'under_4min', text: 'Complete in under 4 minutes', bonusXP: 150, type: 'time_limit', limitSeconds: 240 },
    ],
    teaches: ['Full complexity programs', 'sequenced multi-objective missions', 'functions + variables combined'],
    codingConcept: 'Split the program into phases: Phase 1 — seal breaches. Phase 2 — collect files. Phase 3 — reach extraction!',
    failTip: 'Write 3 separate FUNCTIONS: sealBreaches(), collectFiles(), reachExtraction() — then call them in order!',
    failTips: { timeout: 'Phase 1 first (sealing is fastest), then files, then extraction — in that order!', generic: 'Split the program into phases: Phase 1 — seal breaches. Phase 2 — collect files. Phase 3 — reach extraction!' },
    xpBase: 500, winText: '🏆 ARCTIC VAULT DEFENDED! ALL OBJECTIVES COMPLETE! ✓',
    arenaSetup: {
      goal: { x: 0, z: -32, label: 'EXTRACTION POINT', colors: [0xffd700, 0x93c5fd] },
      collectibles: [
        { x: -5, z: -9, type: 'critical_file' }, { x: 5, z: -15, type: 'critical_file' },
        { x: -4, z: -22, type: 'critical_file' }, { x: 4, z: -28, type: 'critical_file' },
      ],
      waypoints: [
        { x: -4, z: -6, num: 1, label: 'BREACH 1' },
        { x: 4, z: -13, num: 2, label: 'BREACH 2' },
        { x: -3, z: -19, num: 3, label: 'BREACH 3' },
      ],
      obstacles: [
        { type: 'sentinel', x: 0, z: -8, patrolRadius: 3, radius: 1.5 },
        { type: 'sentinel', x: 0, z: -16, patrolRadius: 3, radius: 1.5 },
        { type: 'sentinel', x: 0, z: -24, patrolRadius: 3, radius: 1.5 },
        { type: 'spike', x: -2, z: -12, phase: 0, period: 2.5 }, { type: 'spike', x: 2, z: -20, phase: 1.25, period: 2.5 },
        { type: 'current', x: -1, z: -10, forceX: 0.25 }, { type: 'current', x: 1, z: -25, forceX: -0.25 },
      ],
      atmosphere: { fogDensity: 0.03 },
      props: ['security_door', 'snow_drift', 'warning_light', 'extraction_pod'],
    },
  }),
];
