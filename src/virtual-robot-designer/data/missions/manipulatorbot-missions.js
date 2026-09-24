/** ManipulatorBot — 30 missions (Reef Lab, Desert Excavation, Volcano Mining, Space Maintenance) */
function m(cfg) { return { robot: 'manipulatorbot', rec: ['factory', 'factorybot'], genre: 'simulation', subObjectives: cfg.subObjectives || [], failTips: cfg.failTips || { generic: cfg.failTip }, ...cfg }; }
const def = (label, z = -20) => ({ goal: { x: 0, z, label, colors: [0x06b6d4, 0xfbbf24] }, collectibles: [], obstacles: [], props: [] });

export const MANIPULATORBOT_ZONES = [
  { id: 'mnp_zone_reef',   name: 'Robot Reef Lab',      subtitle: 'Deep Sea Science',  icon: '🔬', color: '#06b6d4', arenaBase: 'robot_reef' },
  { id: 'mnp_zone_desert', name: 'Desert Excavation',   subtitle: 'Ancient Dig Site',  icon: '🏺', color: '#f59e0b', arenaBase: 'desert_rally' },
  { id: 'mnp_zone_volcano',name: 'Volcano Mining',      subtitle: 'Magma Samples',     icon: '🌋', color: '#ef4444', arenaBase: 'volcanic_climb' },
  { id: 'mnp_zone_space',  name: 'Space Maintenance',   subtitle: 'Station Repair',    icon: '🛸', color: '#6366f1', arenaBase: 'space_eva' },
];

export const MANIPULATORBOT_MISSIONS = [
  m({ id: 'mnp_1', code: 'MNP-1', zoneId: 'mnp_zone_reef', zoneNum: 1, name: 'First Grab', missionType: 'MG', difficulty: 1, icon: '🦾', color: '#06b6d4', arenaType: 'warehouse_sort', totalDist: 12, timeLimit: 20, estMinutes: 4,
    story: "ManipulatorBot's first test! A single energy crystal sits in front of the arm. Practice: extend, close, retract, place in the storage box.",
    primaryObjective: { id: 'grab', text: 'Pick up the crystal and place it in the storage box', type: 'collect_and_reach', target: 1 },
    subObjectives: [{ id: 'sequence', text: 'Complete the grab in a single code sequence', bonusXP: 100 }, { id: 'precision', text: 'Place precisely in the box center', bonusXP: 75 }, { id: 'time', text: 'Complete in under 20 seconds', bonusXP: 50, type: 'time_limit', limitSeconds: 20 }],
    teaches: ['EXTEND ARM', 'CLOSE GRIPPER', 'RETRACT ARM'], codingConcept: 'Extend → Grab → Retract → Place — in that order always!', failTip: 'Extend → Grab → Retract → Place — in that order always!', xpBase: 100, winText: 'FIRST GRAB! ✓',
    arenaSetup: { ...def('STORAGE BOX', -8), collectibles: [{ x: 0, z: 2, type: 'energy_crystal' }] },
  }),
  m({ id: 'mnp_2', code: 'MNP-2', zoneId: 'mnp_zone_reef', zoneNum: 2, name: 'Crystal Sort', missionType: 'CD', difficulty: 2, icon: '🎨', color: '#06b6d4', arenaType: 'arm_sort', totalDist: 16, timeLimit: 120, estMinutes: 8,
    story: '6 crystals of 3 colours need sorting into colour-coded storage bins!',
    primaryObjective: { id: 'sort_6', text: 'Sort all 6 crystals into the correct colour bins', type: 'color_delivery', target: 6 },
    subObjectives: [{ id: 'perfect', text: 'Perfect colour sorting', bonusXP: 150 }, { id: 'zero_wrong', text: 'Zero wrong bins', bonusXP: 100 }, { id: 'time', text: 'Complete in under 2 minutes', bonusXP: 75, type: 'time_limit', limitSeconds: 120 }],
    teaches: ['IF/THEN with colour sensor'], codingConcept: 'IF colour sensor = blue THEN put in blue bin!', failTip: 'IF colour sensor = blue THEN put in blue bin!', xpBase: 150, winText: 'CRYSTALS SORTED! ✓',
    arenaSetup: { ...def('SORTING STATION', -12), collectibles: Array.from({ length: 6 }, (_, i) => ({ x: -3 + (i % 3) * 3, z: 0, type: 'crystal' })) },
  }),
  m({ id: 'mnp_3', code: 'MNP-3', zoneId: 'mnp_zone_reef', zoneNum: 3, name: 'Stacking Challenge', missionType: 'MG', difficulty: 3, icon: '📚', color: '#06b6d4', arenaType: 'arm_sort', totalDist: 14, timeLimit: 180, estMinutes: 10,
    story: 'Stack 4 sample containers in a precise tower for the centrifuge machine! Wonky stacks fall over.',
    primaryObjective: { id: 'stack_4', text: 'Stack all 4 containers in a stable tower', type: 'stack_count', target: 4 },
    subObjectives: [{ id: 'align', text: 'Perfect alignment on all 4', bonusXP: 200 }, { id: 'no_collapse', text: 'No stack collapses', bonusXP: 150 }, { id: 'time', text: 'Complete in under 3 minutes', bonusXP: 100, type: 'time_limit', limitSeconds: 180 }],
    teaches: ['RAISE ARM', 'precision stacking'], codingConcept: 'RAISE ARM 1 before each stack to place it on top!', failTip: 'RAISE ARM 1 before each stack to place it on top!', xpBase: 200, winText: 'TOWER BUILT! ✓', arenaSetup: def('CENTRIFUGE', -10),
  }),
  ...[4,5,6,7,8].map((n, i) => {
    const names = ['Fragile Specimen Collection', 'Multi-Arm Rotation Delivery', 'Timed Lab Supply Delivery', 'Debris Deflection Survival', 'Lab Champion'];
    const objectives = [
      'Collect all 4 fragile reef specimens without breaking any',
      'Rotate the arm and deliver samples to 3 lab stations',
      'Deliver lab supplies to every workstation before the timer runs out',
      'Deflect debris away from the lab equipment and survive',
      'Complete all 3 lab championship tasks',
    ];
    return m({ id: `mnp_${n}`, code: `MNP-${n}`, zoneId: 'mnp_zone_reef', zoneNum: n, name: names[i], missionType: ['CD','CD','CD','SV','MG'][i], difficulty: 2 + i, icon: '🔬', color: '#06b6d4', arenaType: 'warehouse_sort', totalDist: 14 + i * 2, timeLimit: 120 + i * 30, estMinutes: 8 + i * 2,
      story: `Reef lab mission: ${names[i]}. Use the manipulator arm with precision.`,
      primaryObjective: { id: `p_${n}`, text: objectives[i], type: i === 4 ? 'multi_leg' : 'collect_count', target: i === 4 ? 3 : 3 + i },
      subObjectives: [{ id: 'precision', text: 'Perfect arm precision', bonusXP: 125 + i * 25 }, { id: 'gripper', text: 'Use gripper blocks correctly', bonusXP: 100 + i * 20, type: 'block_used', blockId: 'close_gripper' }, { id: 'time', text: 'On time', bonusXP: 75 + i * 15, type: 'time_limit', limitSeconds: 120 + i * 30 }],
      teaches: ['Arm control'], codingConcept: 'EXTEND → CLOSE GRIPPER → RETRACT → OPEN GRIPPER!', failTip: 'EXTEND → CLOSE GRIPPER → RETRACT → OPEN GRIPPER!', xpBase: 150 + i * 40, winText: `${names[i].toUpperCase()}! ✓`, arenaSetup: def('LAB GOAL', -12 - i * 2),
    });
  }),
  ...[9,10,11,12,13,14,15,16].map((n, i) => {
    const names = ['Sand Excavation', 'Artefact Sort by Age', 'Stack for Transport', 'Delicate Pot Recovery', 'Multi-Site Dig Relay', 'Sandstorm Arm Shield', 'Museum Delivery Run', 'Excavation Champion'];
    const objectives = [
      'Excavate and collect 4 buried sand artefacts',
      'Sort 5 artefacts into age-coded storage bins',
      'Stack 4 crates for transport to the dig truck',
      'Recover the delicate pot without cracking it',
      'Complete the 3-site dig relay deliveries',
      'Shield the arm through the sandstorm and grab samples',
      'Deliver all museum artefacts to the exhibition tent',
      'Complete all 3 excavation championship legs',
    ];
    return m({ id: `mnp_${n}`, code: `MNP-${n}`, zoneId: 'mnp_zone_desert', zoneNum: i + 1, name: names[i], missionType: i % 2 === 0 ? 'CD' : 'MG', difficulty: Math.min(5, 2 + Math.floor(i / 2)), icon: '🏺', color: '#f59e0b', arenaType: 'desert_rally', totalDist: 16 + i, timeLimit: 120 + i * 15, estMinutes: 8 + i,
      story: `Desert excavation: ${names[i]}. Dig, sort, and deliver ancient artefacts.`,
      primaryObjective: { id: `p_${n}`, text: objectives[i], type: i === 7 ? 'multi_leg' : 'collect_count', target: i === 7 ? 3 : 4 + Math.floor(i / 2) },
      subObjectives: [{ id: 'sort', text: 'Correct sorting order', bonusXP: 125 + i * 15 }, { id: 'fragile', text: "Don't damage fragile items", bonusXP: 100 + i * 10 }, { id: 'time', text: 'On time', bonusXP: 75 + i * 10, type: 'time_limit', limitSeconds: 120 + i * 15 }],
      teaches: ['Excavation arm work'], codingConcept: 'Gentle grip for fragile artefacts — CLOSE GRIPPER softly!', failTip: 'Gentle grip for fragile artefacts!', xpBase: 150 + i * 25, winText: `${names[i].toUpperCase()}! ✓`, arenaSetup: def('MUSEUM TENT', -14 - i),
    });
  }),
  ...[17,18,19,20,21,22,23].map((n, i) => {
    const names = ['Wall Crystal Mining', 'Heat Sample Sorting', 'Magma Specimen Delivery', 'Geyser Zone Collection', 'Volcanic Stack Relay', 'Eruption Evacuation Grab', 'Mining Champion'];
    const objectives = [
      'Mine 5 wall crystals from the volcanic face',
      'Sort 6 heat samples into temperature-coded bins',
      'Deliver magma specimens to the analysis lab',
      'Collect samples from the geyser zone before they cool',
      'Stack and relay volcanic crates through 3 stations',
      'Grab critical samples during eruption evacuation',
      'Complete all 3 volcanic mining championship legs',
    ];
    return m({ id: `mnp_${n}`, code: `MNP-${n}`, zoneId: 'mnp_zone_volcano', zoneNum: i + 1, name: names[i], missionType: ['CD','CD','CD','SV','CD','SV','MG'][i], difficulty: Math.min(5, 3 + Math.floor(i / 2)), icon: '🌋', color: '#ef4444', arenaType: 'factory_floor', totalDist: 16 + i, timeLimit: 120 + i * 20, estMinutes: 9 + i,
      story: `Volcano mining: ${names[i]}. Mine crystals and sort lava specimens by heat signature.`,
      primaryObjective: { id: `p_${n}`, text: objectives[i], type: i === 6 ? 'multi_leg' : 'collect_count', target: i === 6 ? 3 : 5 + Math.floor(i / 2) },
      subObjectives: [{ id: 'heat', text: 'Sort by heat signature', bonusXP: 150 + i * 20 }, { id: 'speed', text: 'Fast arm movements on hot zones', bonusXP: 125 + i * 15 }, { id: 'time', text: 'Before heat timer', bonusXP: 100 + i * 10, type: 'time_limit', limitSeconds: 120 + i * 20 }],
      teaches: ['Heat-zone mining'], codingConcept: 'Work fast — heat damages the arm over time!', failTip: 'Work fast — heat damages the arm over time!', xpBase: 175 + i * 30, winText: `${names[i].toUpperCase()}! ✓`, arenaSetup: def('MINE EXIT', -14 - i),
    });
  }),
  ...[24,25,26,27,28,29,30].map((n, i) => {
    const names = ['Panel Repair Precision', 'Data Module Sorting', 'Antenna Assembly', 'Solar Cell Replacement', 'Airlock Module Delivery', 'Hull Patch Relay', 'Maintenance Champion'];
    const objectives = [
      'Repair the damaged station panel with millimeter precision',
      'Sort 6 data modules into the correct rack slots',
      'Assemble the antenna from 4 component pieces',
      'Replace all 5 solar cells on the station array',
      'Deliver the airlock module to the docking bay',
      'Patch the hull breach and relay repair parts',
      'Complete all 3 maintenance championship legs',
    ];
    return m({ id: `mnp_${n}`, code: `MNP-${n}`, zoneId: 'mnp_zone_space', zoneNum: i + 1, name: names[i], missionType: i < 5 ? 'CD' : 'MG', difficulty: Math.min(5, 3 + Math.floor(i / 2)), icon: '🛸', color: '#6366f1', arenaType: 'space_eva', totalDist: 14 + i, timeLimit: 120 + i * 25, estMinutes: 10 + i,
      story: `Space station maintenance: ${names[i]}. Repair panels and assemble components with precision arm moves.`,
      primaryObjective: { id: `p_${n}`, text: objectives[i], type: n === 26 ? 'stack_count' : i === 6 ? 'multi_leg' : 'collect_count', target: n === 26 ? 4 : i === 6 ? 3 : 4 + Math.floor(i / 2) },
      subObjectives: [{ id: 'precision', text: 'Millimeter precision placement', bonusXP: 175 + i * 25 }, { id: 'rotate', text: 'Use ROTATE ARM for alignment', bonusXP: 150 + i * 20, type: 'block_used', blockId: 'rotate_arm' }, { id: 'time', text: 'On schedule', bonusXP: 125 + i * 15, type: 'time_limit', limitSeconds: 120 + i * 25 }],
      teaches: ['Space maintenance'], codingConcept: 'ROTATE ARM to align components before placing!', failTip: 'ROTATE ARM to align components before placing!', xpBase: 200 + i * 35, winText: `${names[i].toUpperCase()}! ✓`, arenaSetup: def('STATION COMPLETE', -12 - i),
    });
  }),
];
