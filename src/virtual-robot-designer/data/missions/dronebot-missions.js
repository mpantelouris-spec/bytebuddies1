/** DroneBot — 30 missions (Sky Island, Space Station, Jungle Aerial, Cloud City) */
function m(cfg) { return { robot: 'dronebot', rec: ['drone', 'hover', 'racedrone', 'jet'], genre: 'adventure', subObjectives: cfg.subObjectives || [], failTips: cfg.failTips || { generic: cfg.failTip }, ...cfg }; }
const def = (label, z = -26) => ({ goal: { x: 0, z, label, colors: [0x00d9ff, 0xfbbf24] }, collectibles: [], obstacles: [], props: [] });

export const DRONEBOT_ZONES = [
  { id: 'db_zone_sky',    name: 'Sky Island Delivery', subtitle: 'High Altitude',    icon: '🏝️', color: '#38bdf8', arenaBase: 'sky_island' },
  { id: 'db_zone_space',  name: 'Space Station',       subtitle: 'Zero G Patrol',    icon: '🛰️', color: '#818cf8', arenaBase: 'space_corridor' },
  { id: 'db_zone_jungle', name: 'Jungle Temple Aerial',subtitle: 'Above the Canopy', icon: '🌴', color: '#22c55e', arenaBase: 'rainforest_canopy' },
  { id: 'db_zone_cloud',  name: 'Cloud City',          subtitle: 'Above the Clouds', icon: '☁️', color: '#e0e7ff', arenaBase: 'cloud_race' },
];

export const DRONEBOT_MISSIONS = [
  m({ id: 'db_1', code: 'DB-1', zoneId: 'db_zone_sky', zoneNum: 1, name: 'First Flight', missionType: 'CD', difficulty: 1, icon: '🚁', color: '#38bdf8', arenaType: 'sky_island', totalDist: 20, timeLimit: 30, estMinutes: 5,
    story: 'DroneBot\'s first mission! Fly the package to the next island — heights are unforgiving if you lose control!',
    primaryObjective: { id: 'deliver', text: 'Fly the package to the delivery island', type: 'reach_goal' },
    subObjectives: [{ id: 'no_drop', text: "Don't drop package", bonusXP: 75 }, { id: 'precision', text: 'Land precisely on the landing pad (within 1 unit)', bonusXP: 75 }, { id: 'time', text: 'Complete in under 30 seconds', bonusXP: 75, type: 'time_limit', limitSeconds: 30 }],
    teaches: ['HOVER', 'MOVE in air'], codingConcept: 'HOVER keeps you up — MOVE FORWARD flies you forward!', failTip: 'Start with HOVER, then MOVE FORWARD toward the island!', xpBase: 100, winText: 'FIRST FLIGHT! ✓', arenaSetup: def('LANDING PAD', -22),
  }),
  m({ id: 'db_2', code: 'DB-2', zoneId: 'db_zone_sky', zoneNum: 2, name: 'Multi-Island Hop', missionType: 'CD', difficulty: 2, icon: '📦', color: '#38bdf8', arenaType: 'sky_island', totalDist: 28, timeLimit: 90, estMinutes: 8,
    story: 'ByteBot Air Mail serves 4 islands! Hop between each, dropping one parcel on each before returning to base.',
    primaryObjective: { id: 'islands_4', text: 'Deliver one parcel to each of the 4 islands', type: 'visit_waypoints', target: 4 },
    subObjectives: [{ id: 'order', text: 'Correct island order', bonusXP: 125 }, { id: 'precision', text: 'Precise landing each time', bonusXP: 100 }, { id: 'time', text: 'Complete in under 90 seconds', bonusXP: 75, type: 'time_limit', limitSeconds: 90 }],
    teaches: ['Waypoint navigation'], codingConcept: 'Visit islands in order — plan your route first!', failTip: 'Visit islands in order — plan your route first!', xpBase: 150, winText: 'ALL PARCELS DELIVERED! ✓', arenaSetup: { ...def('BASE', 4), waypoints: [{ x: -6, z: -8, num: 1 }, { x: 6, z: -14, num: 2 }, { x: -5, z: -20, num: 3 }, { x: 5, z: -26, num: 4 }] },
  }),
  m({ id: 'db_3', code: 'DB-3', zoneId: 'db_zone_sky', zoneNum: 3, name: 'Wind Gust Survival', missionType: 'SV', difficulty: 3, icon: '💨', color: '#38bdf8', arenaType: 'storm_cloud', totalDist: 32, timeLimit: 120, estMinutes: 11,
    story: 'Crosswinds push DroneBot off course! Use sensor blocks to detect drift and apply correction thrust.',
    primaryObjective: { id: 'wind_zones', text: 'Fly through 5 wind zones and reach the destination', type: 'reach_goal' },
    subObjectives: [{ id: 'corridor', text: "Stay within the flight corridor (don't drift more than 2 units)", bonusXP: 175 }, { id: 'sensor_loop', text: 'Use a correction sensor loop', bonusXP: 175, type: 'block_used', blockId: 'when_sensor' }, { id: 'time', text: 'Complete in under 2 minutes', bonusXP: 100, type: 'time_limit', limitSeconds: 120 }],
    teaches: ['Sensor correction'], codingConcept: 'Sensors detect drift — correct with small turns!', failTip: 'WHEN sensor triggers → bank into the wind!', xpBase: 200, winText: 'WINDS CONQUERED! ✓', arenaSetup: def('DESTINATION', -30),
  }),
  m({ id: 'db_4', code: 'DB-4', zoneId: 'db_zone_sky', zoneNum: 4, name: 'Altitude Precision Drop', missionType: 'CD', difficulty: 3, icon: '🎯', color: '#38bdf8', arenaType: 'sky_island', totalDist: 30, timeLimit: 120, estMinutes: 11,
    story: 'Packages must be dropped from exact altitudes onto tiny landing pads on each island tier.',
    primaryObjective: { id: 'drops_5', text: 'Deliver 5 packages to altitude-matched landing pads', type: 'numbered_delivery', target: 5 },
    subObjectives: [{ id: 'precision', text: 'All 5 precise altitude drops', bonusXP: 175 }, { id: 'fly_up', text: 'Use FLY UP and FLY DOWN blocks', bonusXP: 150, type: 'block_used', blockId: 'fly_up' }, { id: 'time', text: 'Complete in under 2 minutes', bonusXP: 100, type: 'time_limit', limitSeconds: 120 }],
    teaches: ['Altitude control'], codingConcept: 'FLY UP to the right height before dropping!', failTip: 'FLY UP to the right height before dropping!', xpBase: 200, winText: 'PRECISION DROPS! ✓', arenaSetup: def('SKY DEPOT', 4),
  }),
  m({ id: 'db_5', code: 'DB-5', zoneId: 'db_zone_sky', zoneNum: 5, name: 'Sky Circuit Sprint', missionType: 'MG', difficulty: 3, icon: '🏁', color: '#38bdf8', arenaType: 'flight_rings', totalDist: 34, timeLimit: 90, estMinutes: 12,
    story: 'Fly the sky circuit through 8 floating rings as fast as possible!',
    primaryObjective: { id: 'rings_8', text: 'Pass through all 8 sky rings in order', type: 'visit_waypoints', target: 8 },
    subObjectives: [{ id: 'clean', text: 'Pass all rings without missing one', bonusXP: 150 }, { id: 'repeat', text: 'Use REPEAT for the ring pattern', bonusXP: 125, type: 'block_used', blockId: 'repeat' }, { id: 'time', text: 'Beat 60 seconds', bonusXP: 100, type: 'time_limit', limitSeconds: 60 }],
    teaches: ['Aerial circuits'], codingConcept: 'REPEAT the ring-passing pattern!', failTip: 'REPEAT the ring-passing pattern!', xpBase: 200, winText: 'CIRCUIT COMPLETE! ✓', arenaSetup: def('FINISH GATE', -28),
  }),
  m({ id: 'db_6', code: 'DB-6', zoneId: 'db_zone_sky', zoneNum: 6, name: 'Storm Rescue Delivery', missionType: 'CD', difficulty: 4, icon: '⛈️', color: '#38bdf8', arenaType: 'storm_cloud', totalDist: 36, timeLimit: 150, estMinutes: 14,
    story: 'A storm trapped hikers on a remote island! Deliver medical supplies through the storm corridor.',
    primaryObjective: { id: 'rescue', text: 'Deliver medical supplies to the stranded hikers', type: 'collect_and_reach', target: 1 },
    subObjectives: [{ id: 'no_crash', text: 'No storm collision', bonusXP: 200 }, { id: 'hover', text: 'Use HOVER to stabilize in wind', bonusXP: 175, type: 'block_used', blockId: 'hover_hold' }, { id: 'time', text: 'Rescue in under 2.5 minutes', bonusXP: 125, type: 'time_limit', limitSeconds: 150 }],
    teaches: ['Storm flight'], codingConcept: 'HOVER to stabilize before each storm gap!', failTip: 'HOVER to stabilize before each storm gap!', xpBase: 250, winText: 'RESCUE COMPLETE! ✓', arenaSetup: def('HIKER CAMP', -32),
  }),
  m({ id: 'db_7', code: 'DB-7', zoneId: 'db_zone_sky', zoneNum: 7, name: 'Multi-Altitude Relay', missionType: 'CD', difficulty: 4, icon: '🔄', color: '#38bdf8', arenaType: 'sky_island', totalDist: 38, timeLimit: 180, estMinutes: 16,
    story: 'Relay packages between 3 altitude tiers — low, mid, and high islands!',
    primaryObjective: { id: 'relay_3', text: 'Complete 3 altitude-tier delivery legs', type: 'relay', target: 3 },
    subObjectives: [{ id: 'all_legs', text: 'All 3 legs complete', bonusXP: 200 }, { id: 'altitude', text: 'Use FLY UP/DOWN for each tier', bonusXP: 175 }, { id: 'time', text: 'Under 3 minutes', bonusXP: 150, type: 'time_limit', limitSeconds: 180 }],
    teaches: ['3D navigation'], codingConcept: 'Each island tier needs a different altitude!', failTip: 'Each island tier needs a different altitude!', xpBase: 300, winText: 'RELAY COMPLETE! ✓', arenaSetup: def('SKY BASE', 4),
  }),
  m({ id: 'db_8', code: 'DB-8', zoneId: 'db_zone_sky', zoneNum: 8, name: 'Sky Island Champion', missionType: 'MG', difficulty: 5, icon: '🏆', color: '#38bdf8', arenaType: 'sky_island', totalDist: 42, timeLimit: 240, estMinutes: 20,
    story: 'The Sky Island Delivery Championship — circuit, storm rescue, and altitude relay in one epic run!',
    primaryObjective: { id: 'champion', text: 'Complete all 3 sky island championship legs', type: 'multi_leg', target: 3 },
    subObjectives: [{ id: 'gold', text: 'Gold on all 3 legs', bonusXP: 350 }, { id: 'zero_fails', text: 'Zero fails', bonusXP: 300 }, { id: 'mastery', text: 'Use HOVER, FLY UP, and REPEAT', bonusXP: 250 }],
    teaches: ['Sky mastery'], codingConcept: 'Sky Island Champion — every flight skill!', failTip: 'Sky Island Champion — every flight skill!', xpBase: 450, winText: 'SKY ISLAND CHAMPION! ✓', arenaSetup: def('CHAMPION PAD', -34),
  }),
  // Space Station DB-9 to DB-16
  ...[9,10,11,12,13,14,15,16].map((n, i) => {
    const names = ['Data Orb Patrol', 'Laser Corridor Survival', 'Data Orb Collection Relay', 'Emergency Power Cell Delivery', 'Debris Field Survival', 'Airlock Timing Challenge', 'Docking Bay Precision Landing', 'Station Commander'];
    const objectives = [
      'Patrol all 6 data orb checkpoints in order',
      'Survive the laser corridor without touching a beam',
      'Collect and relay 4 data orbs to the uplink terminal',
      'Deliver the emergency power cell to the failing module',
      'Navigate the debris field and reach the safe corridor',
      'Time your moves through the airlock cycling sequence',
      'Land precisely on the docking bay pad within 1 unit',
      'Complete all 3 station commander legs',
    ];
    const types = ['MG','SV','CD','CD','SV','MG','CD','MG'];
    return m({ id: `db_${n}`, code: `DB-${n}`, zoneId: 'db_zone_space', zoneNum: i + 1, name: names[i], missionType: types[i], difficulty: Math.min(5, 1 + Math.floor(i / 2) + (i > 5 ? 1 : 0)), icon: '🛰️', color: '#818cf8', arenaType: 'space_corridor', totalDist: 26 + i * 2, timeLimit: 90 + i * 15, estMinutes: 6 + i * 2,
      story: `Zero-G patrol mission ${n}: ${names[i]}. Navigate the space station interior using aerial drone skills.`,
      primaryObjective: { id: `primary_${n}`, text: objectives[i], type: i === 7 ? 'multi_leg' : 'reach_goal', target: i === 7 ? 3 : undefined },
      subObjectives: [{ id: 'bonus_1', text: 'No collisions in the corridor', bonusXP: 100 + i * 15 }, { id: 'bonus_2', text: 'Use sensor blocks', bonusXP: 75 + i * 10, type: 'block_used', blockId: 'when_sensor' }, { id: 'time', text: `Complete on time`, bonusXP: 50 + i * 10, type: 'time_limit', limitSeconds: 90 + i * 15 }],
      teaches: ['Zero-G flight'], codingConcept: 'HOVER in zero-G — small moves, big precision!', failTip: 'HOVER in zero-G — small moves, big precision!', xpBase: 100 + i * 25, winText: `${names[i].toUpperCase()} COMPLETE! ✓`, arenaSetup: def('STATION GOAL', -24 - i * 2),
    });
  }),
  // Jungle Aerial DB-17 to DB-23
  ...[17,18,19,20,21,22,23].map((n, i) => {
    const names = ['Canopy Navigation', 'Firefly Collection', 'Temple Flythrough Gem Run', 'Falling Tree Survival', 'Aerial Pressure Plate Delivery', 'Storm Survival Above Canopy', 'Jungle Air Champion'];
    const objectives = [
      'Fly through the canopy corridor to the temple spire',
      'Collect all 8 fireflies hovering above the treetops',
      'Grab every gem while flying through the temple gates',
      'Dodge falling trees and reach the extraction point',
      'Activate all 4 pressure plates with aerial deliveries',
      'Survive the storm gusts and reach the landing zone',
      'Complete all 3 jungle air championship legs',
    ];
    return m({ id: `db_${n}`, code: `DB-${n}`, zoneId: 'db_zone_jungle', zoneNum: i + 1, name: names[i], missionType: i % 3 === 0 ? 'CD' : i % 3 === 1 ? 'MG' : 'SV', difficulty: Math.min(5, 2 + Math.floor(i / 2)), icon: '🌴', color: '#22c55e', arenaType: 'rainforest_canopy', totalDist: 28 + i * 2, timeLimit: 100 + i * 15, estMinutes: 8 + i * 2,
      story: `Above the jungle canopy: ${names[i]}. Fly between treetops and temple spires.`,
      primaryObjective: { id: `primary_${n}`, text: objectives[i], type: i === 1 ? 'collect_count' : i === 6 ? 'multi_leg' : 'reach_goal', target: i === 1 ? 8 : i === 6 ? 3 : undefined },
      subObjectives: [{ id: 'no_crash', text: "Don't hit trees", bonusXP: 125 + i * 15 }, { id: 'collect', text: 'Collect all mission items', bonusXP: 100 + i * 10 }, { id: 'time', text: 'Beat the timer', bonusXP: 75 + i * 10, type: 'time_limit', limitSeconds: 100 + i * 15 }],
      teaches: ['Canopy flight'], codingConcept: 'Bank left/right to weave through the canopy!', failTip: 'Bank left/right to weave through the canopy!', xpBase: 150 + i * 25, winText: `${names[i].toUpperCase()}! ✓`, arenaSetup: def('CANOPY GOAL', -26 - i * 2),
    });
  }),
  // Cloud City DB-24 to DB-30
  ...[24,25,26,27,28,29,30].map((n, i) => {
    const names = ['Cloud Platform Hopping', 'Lightning Dodge Survival', 'Star Token Collection', 'Moving Cloud Platform Delivery', 'Rainbow Bridge Circuit', 'Golden Gate Approach', 'Cloud City Champion'];
    const objectives = [
      'Hop across 5 cloud platforms to the finish gate',
      'Dodge lightning strikes for 60 seconds and survive',
      'Collect all 10 star tokens across the cloud platforms',
      'Deliver packages to 3 moving cloud platforms',
      'Pass through all 8 rainbow bridge rings in order',
      'Thread through the golden gate without falling',
      'Complete all 3 cloud city championship legs',
    ];
    return m({ id: `db_${n}`, code: `DB-${n}`, zoneId: 'db_zone_cloud', zoneNum: i + 1, name: names[i], missionType: ['CD','SV','CD','CD','MG','SV','MG'][i], difficulty: Math.min(5, 2 + Math.floor(i / 2) + (i > 4 ? 1 : 0)), icon: '☁️', color: '#e0e7ff', arenaType: 'cloud_race', totalDist: 28 + i * 2, timeLimit: 100 + i * 20, estMinutes: 8 + i * 2,
      story: `Cloud City mission: ${names[i]}. Navigate floating platforms above the clouds.`,
      primaryObjective: { id: `primary_${n}`, text: objectives[i], type: i === 2 ? 'collect_count' : i === 6 ? 'multi_leg' : 'reach_goal', target: i === 2 ? 10 : i === 6 ? 3 : undefined },
      subObjectives: [{ id: 'no_fall', text: "Don't fall off cloud platforms", bonusXP: 125 + i * 20 }, { id: 'precision', text: 'Precise landings on each platform', bonusXP: 100 + i * 15 }, { id: 'time', text: 'Beat the timer', bonusXP: 75 + i * 10, type: 'time_limit', limitSeconds: 100 + i * 20 }],
      teaches: ['Cloud navigation'], codingConcept: 'HOVER before each platform landing!', failTip: 'HOVER before each platform landing!', xpBase: 150 + i * 30, winText: `${names[i].toUpperCase()}! ✓`, arenaSetup: def('CLOUD GATE', -26 - i * 2),
    });
  }),
];
