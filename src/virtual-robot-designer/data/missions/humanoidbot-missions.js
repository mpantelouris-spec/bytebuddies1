/** HumanoidBot — 30 missions (Cloud City, Jungle Temple, City Rooftop, Arctic Tundra) */
function m(cfg) { return { robot: 'humanoidbot', rec: ['humanoid', 'spider'], genre: 'platformer', subObjectives: cfg.subObjectives || [], failTips: cfg.failTips || { generic: cfg.failTip }, ...cfg }; }
const def = (label, z = -24) => ({ goal: { x: 0, z, label, colors: [0xa78bfa, 0xf472b6] }, collectibles: [], obstacles: [], props: [] });

export const HUMANOIDBOT_ZONES = [
  { id: 'hb_zone_cloud',   name: 'Cloud City Platforms', subtitle: 'Robo Athlete',      icon: '☁️', color: '#a78bfa', arenaBase: 'sky_garden' },
  { id: 'hb_zone_jungle',  name: 'Jungle Temple Traverse',subtitle: 'Vine & Mud',      icon: '🌿', color: '#22c55e', arenaBase: 'temple_ext' },
  { id: 'hb_zone_rooftop', name: 'City Rooftop Parkour', subtitle: 'Urban Athlete',    icon: '🌃', color: '#f472b6', arenaBase: 'rooftop_delivery' },
  { id: 'hb_zone_arctic',  name: 'Arctic Expedition',    subtitle: 'Ice & Balance',    icon: '❄️', color: '#93c5fd', arenaBase: 'arctic_station' },
];

export const HUMANOIDBOT_MISSIONS = [
  m({ id: 'hb_1', code: 'HB-1', zoneId: 'hb_zone_cloud', zoneNum: 1, name: 'First Steps', missionType: 'MG', difficulty: 1, icon: '👣', color: '#a78bfa', arenaType: 'sky_garden', totalDist: 18, timeLimit: 90, estMinutes: 5,
    story: 'HumanoidBot activated in Cloud City! Walk from the starting platform to the Welcome Hall without falling off.',
    primaryObjective: { id: 'walk', text: 'Walk from start to Welcome Hall', type: 'reach_goal' },
    subObjectives: [{ id: 'no_fall', text: "Don't fall off any platform", bonusXP: 75 }, { id: 'upright', text: 'Arrive standing upright', bonusXP: 75 }, { id: 'balance', text: 'Use BALANCE block on narrow sections', bonusXP: 75, type: 'block_used', blockId: 'balance' }],
    teaches: ['WALK FORWARD', 'BALANCE'], codingConcept: 'WALK is slower but safer — BALANCE helps on thin paths!', failTip: 'Use BALANCE on the narrow cloud bridge sections!', xpBase: 100, winText: 'FIRST STEPS! ✓', arenaSetup: def('WELCOME HALL', -20),
  }),
  m({ id: 'hb_2', code: 'HB-2', zoneId: 'hb_zone_cloud', zoneNum: 2, name: 'Star Token Sprint', missionType: 'CD', difficulty: 2, icon: '⭐', color: '#a78bfa', arenaType: 'sky_garden', totalDist: 24, timeLimit: 90, estMinutes: 8,
    story: '8 star tokens scattered across cloud platforms! Run on straights, walk on corners — or slide off the edge!',
    primaryObjective: { id: 'tokens_8', text: 'Collect all 8 star tokens', type: 'collect_count', target: 8 },
    subObjectives: [{ id: 'all_8', text: 'Collect all 8', bonusXP: 125 }, { id: 'run_walk', text: 'Use RUN on straights and WALK on corners', bonusXP: 125 }, { id: 'time', text: 'Complete in under 90 seconds', bonusXP: 100, type: 'time_limit', limitSeconds: 90 }],
    teaches: ['RUN vs WALK'], codingConcept: 'Switch between RUN and WALK depending on the path shape!', failTip: 'RUN on straights, WALK on corners!', xpBase: 150, winText: 'ALL TOKENS! ✓',
    arenaSetup: { ...def('FINISH PLATFORM', -26), collectibles: Array.from({ length: 8 }, (_, i) => ({ x: -4 + (i % 4) * 2.5, z: -2 - Math.floor(i / 4) * 10, type: 'star_token' })) },
  }),
  m({ id: 'hb_3', code: 'HB-3', zoneId: 'hb_zone_cloud', zoneNum: 3, name: 'Platform Jump Challenge', missionType: 'MG', difficulty: 3, icon: '🦘', color: '#a78bfa', arenaType: 'sky_garden', totalDist: 22, timeLimit: 60, estMinutes: 9,
    story: 'The City Games jumping competition! Leap across 5 gaps — each wider than the last.',
    primaryObjective: { id: 'jumps_5', text: 'Successfully jump all 5 platform gaps', type: 'visit_waypoints', target: 5 },
    subObjectives: [{ id: 'all_5', text: 'Land all 5 jumps', bonusXP: 175 }, { id: 'precision', text: 'Land on center of each platform', bonusXP: 150 }, { id: 'time', text: 'Complete in under 60 seconds', bonusXP: 100, type: 'time_limit', limitSeconds: 60 }],
    teaches: ['JUMP FORWARD'], codingConcept: 'JUMP FORWARD 3 covers 3 units — measure the gap first!', failTip: 'JUMP FORWARD 3 covers 3 units — measure the gap first!', xpBase: 200, winText: 'JUMP CHAMPION! ✓', arenaSetup: def('FINISH LINE', -24),
  }),
  ...[4,5,6,7,8].map((n, i) => {
    const names = ['Low Crawl Under Clouds', 'Trophy Delivery Run', 'Lightning Dodge Jump', 'Sports Day Mini-Game', 'Cloud City Champion'];
    const objectives = [
      'Crouch under low cloud bridges and reach the exit',
      'Deliver the trophy to the podium without falling',
      'Jump through lightning gaps without getting hit',
      'Complete all 3 sports day mini-game stations',
      'Complete all 3 cloud city championship legs',
    ];
    return m({ id: `hb_${n}`, code: `HB-${n}`, zoneId: 'hb_zone_cloud', zoneNum: n, name: names[i], missionType: ['MG','CD','SV','MG','MG'][i], difficulty: 2 + i, icon: '☁️', color: '#a78bfa', arenaType: 'sky_garden', totalDist: 20 + i * 2, timeLimit: 90 + i * 20, estMinutes: 7 + i * 2,
      story: `Cloud City athletics: ${names[i]}. Walk, run, jump, and balance across the platforms.`,
      primaryObjective: { id: `p_${n}`, text: objectives[i], type: i === 4 ? 'multi_leg' : i === 3 ? 'visit_waypoints' : 'reach_goal', target: i === 4 || i === 3 ? 3 : undefined },
      subObjectives: [{ id: 'no_fall', text: "Don't fall", bonusXP: 100 + i * 25 }, { id: 'technique', text: 'Use correct movement blocks', bonusXP: 100 + i * 20, type: 'block_used', blockId: i === 4 ? 'crouch' : 'jump' }, { id: 'time', text: 'On time', bonusXP: 75 + i * 15, type: 'time_limit', limitSeconds: 90 + i * 20 }],
      teaches: ['Bipedal movement'], codingConcept: 'BALANCE + WALK on narrow paths, RUN on wide ones!', failTip: 'BALANCE + WALK on narrow paths!', xpBase: 150 + i * 40, winText: `${names[i].toUpperCase()}! ✓`, arenaSetup: def('CLOUD GOAL', -22 - i * 2),
    });
  }),
  ...[9,10,11,12,13,14,15,16].map((n, i) => {
    const names = ['Vine Jump Sequence', 'Mud Walk Slowdown', 'Fallen Tree Leap', 'Crouch Through Temple', 'Gem Collection Climb', 'Trap Dodge Traverse', 'Idol Delivery', 'Temple Traverse Champion'];
    const objectives = [
      'Complete the 5 vine jumps in sequence',
      'Cross the mud zone without slipping off the path',
      'Leap over the fallen tree and reach the trail',
      'Crouch through the low temple passage to the altar',
      'Collect all 6 gems on the temple climb',
      'Dodge all traps and reach the inner chamber',
      'Deliver the golden idol to the temple gate',
      'Complete all 3 temple traverse championship legs',
    ];
    return m({ id: `hb_${n}`, code: `HB-${n}`, zoneId: 'hb_zone_jungle', zoneNum: i + 1, name: names[i], missionType: i % 3 === 0 ? 'MG' : i % 3 === 1 ? 'CD' : 'SV', difficulty: Math.min(5, 2 + Math.floor(i / 2)), icon: '🌿', color: '#22c55e', arenaType: 'temple_ext', totalDist: 22 + i, timeLimit: 100 + i * 15, estMinutes: 8 + i,
      story: `Jungle temple: ${names[i]}. Vine jumps, mud walking, and temple passages.`,
      primaryObjective: { id: `p_${n}`, text: objectives[i], type: i === 0 ? 'visit_waypoints' : i === 4 ? 'collect_count' : i === 7 ? 'multi_leg' : 'reach_goal', target: i === 0 ? 5 : i === 4 ? 6 : i === 7 ? 3 : undefined },
      subObjectives: [{ id: 'jump', text: 'Use JUMP where needed', bonusXP: 125 + i * 15, type: 'block_used', blockId: 'jump' }, { id: 'crouch', text: 'Use CROUCH in low passages', bonusXP: 100 + i * 10, type: 'block_used', blockId: 'crouch' }, { id: 'time', text: 'On time', bonusXP: 75 + i * 10, type: 'time_limit', limitSeconds: 100 + i * 15 }],
      teaches: ['Jungle traverse'], codingConcept: 'CROUCH under vines, JUMP over mud!', failTip: 'CROUCH under vines, JUMP over mud!', xpBase: 150 + i * 25, winText: `${names[i].toUpperCase()}! ✓`, arenaSetup: def('TEMPLE GOAL', -24 - i),
    });
  }),
  ...[17,18,19,20,21,22,23].map((n, i) => {
    const names = ['Rooftop Parkour Run', 'Vent Fan Crouch', 'Football Kick Goals', 'Rooftop Chase Delivery', 'Gap Jump Buildings', 'Fan Dodge Sprint', 'Parkour Champion'];
    const objectives = [
      'Parkour across 4 rooftops to the finish ledge',
      'Crouch under vent fans and reach the next building',
      'Kick 3 footballs into the rooftop goals',
      'Chase and deliver the package across rooftops',
      'Jump the gap between 5 buildings in sequence',
      'Sprint through fan zones without getting blown off',
      'Complete all 3 parkour championship legs',
    ];
    return m({ id: `hb_${n}`, code: `HB-${n}`, zoneId: 'hb_zone_rooftop', zoneNum: i + 1, name: names[i], missionType: i === 3 ? 'MG' : i % 2 === 0 ? 'CD' : 'SV', difficulty: Math.min(5, 3 + Math.floor(i / 2)), icon: '🌃', color: '#f472b6', arenaType: 'rooftop_delivery', totalDist: 24 + i, timeLimit: 100 + i * 20, estMinutes: 9 + i,
      story: `City rooftop parkour: ${names[i]}. Run-jump between buildings, crouch under vents, kick footballs into goals.`,
      primaryObjective: { id: `p_${n}`, text: objectives[i], type: i === 3 ? 'collect_count' : i === 4 ? 'visit_waypoints' : i === 6 ? 'multi_leg' : 'reach_goal', target: i === 3 ? 3 : i === 4 ? 5 : i === 6 ? 3 : undefined },
      subObjectives: [{ id: 'run_jump', text: 'Combine RUN and JUMP', bonusXP: 150 + i * 20 }, { id: 'kick', text: 'Use KICK for football goals', bonusXP: 125 + i * 15, type: 'block_used', blockId: 'kick' }, { id: 'time', text: 'On time', bonusXP: 100 + i * 10, type: 'time_limit', limitSeconds: 100 + i * 20 }],
      teaches: ['Parkour'], codingConcept: 'RUN → JUMP FORWARD to leap between rooftops!', failTip: 'RUN → JUMP FORWARD to leap between rooftops!', xpBase: 175 + i * 30, winText: `${names[i].toUpperCase()}! ✓`, arenaSetup: def('ROOFTOP GOAL', -26 - i),
    });
  }),
  ...[24,25,26,27,28,29,30].map((n, i) => {
    const names = ['Ice Floe Balance', 'Crevasse Jump', 'Blizzard Run to Shelter', 'Ice Fragment Collect', 'Polar Balance Course', 'Frost Sprint Relay', 'Arctic Expedition Champion'];
    const objectives = [
      'Balance across 4 ice floes to the research hut',
      'Jump the crevasse and land on the far ice shelf',
      'Run through the blizzard to the emergency shelter',
      'Collect all 6 ice fragments before they melt',
      'Complete the polar balance course without falling',
      'Sprint the frost relay through 3 checkpoint stations',
      'Complete all 3 arctic expedition championship legs',
    ];
    return m({ id: `hb_${n}`, code: `HB-${n}`, zoneId: 'hb_zone_arctic', zoneNum: i + 1, name: names[i], missionType: i % 2 === 0 ? 'SV' : 'CD', difficulty: Math.min(5, 3 + Math.floor(i / 2)), icon: '❄️', color: '#93c5fd', arenaType: 'arctic_station', totalDist: 22 + i, timeLimit: 100 + i * 25, estMinutes: 9 + i,
      story: `Arctic expedition: ${names[i]}. Balance on ice floes, jump crevasses, collect fragments in blizzards.`,
      primaryObjective: { id: `p_${n}`, text: objectives[i], type: i === 3 ? 'collect_count' : i === 5 ? 'relay' : i === 6 ? 'multi_leg' : 'reach_goal', target: i === 3 ? 6 : i === 5 ? 3 : i === 6 ? 3 : undefined },
      subObjectives: [{ id: 'balance', text: 'Use BALANCE on ice', bonusXP: 150 + i * 25, type: 'block_used', blockId: 'balance' }, { id: 'jump', text: 'JUMP over crevasses', bonusXP: 125 + i * 20, type: 'block_used', blockId: 'jump' }, { id: 'time', text: 'Before frost timer', bonusXP: 100 + i * 15, type: 'time_limit', limitSeconds: 100 + i * 25 }],
      teaches: ['Arctic bipedal'], codingConcept: 'BALANCE on ice — RUN only on solid ground!', failTip: 'BALANCE on ice — RUN only on solid ground!', xpBase: 175 + i * 35, winText: `${names[i].toUpperCase()}! ✓`, arenaSetup: def('ARCTIC GOAL', -28 - i),
    });
  }),
];
