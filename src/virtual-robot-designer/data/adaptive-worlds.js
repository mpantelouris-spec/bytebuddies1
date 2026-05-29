/**
 * Adaptive Robot Worlds — full configuration for every robot profile.
 *
 * Each profile defines:
 *  environments  — unlockable arenas with theme data
 *  missions      — objectives that use this robot's unique skills
 *  codingBlocks  — Blockly-style blocks only this robot type can use
 *  specialFeatures — physics / visual features that make it feel unique
 *  physicsProfile  — numeric tuning fed to the simulator
 *  recommendation  — smart banner shown to the child
 */

export const ADAPTIVE_WORLDS = {
  /* ─────────────────────────────────────────────
     GROUND ROVER / WHEELED
  ───────────────────────────────────────────── */
  wheeled: {
    recommendation: {
      headline: 'This robot was built for ground adventures!',
      detail: 'Perfect for obstacle courses, delivery runs & line following.',
      badge: '🏎️ Ground Rover',
      color: '#1e90ff',
    },
    environments: [
      { id: 'obstacles',    label: 'Obstacle Park',      icon: '🚧', desc: 'Dodge cones & barriers',            color: '#ff6b6b', unlocked: true  },
      { id: 'linefollow',   label: 'City Routes',        icon: '🏙️', desc: 'Follow glowing city roads',         color: '#00c853', unlocked: true  },
      { id: 'delivery',     label: 'STEM Playground',    icon: '🎯', desc: 'Deliver packages to target zones',   color: '#14b8a6', unlocked: true  },
      { id: 'square',       label: 'Race Circuit',       icon: '🏁', desc: 'Speed around the track loop',        color: '#f59e0b', unlocked: true  },
      { id: 'maze',         label: 'Maze Arena',         icon: '🧩', desc: 'Solve the wall maze',               color: '#8b5cf6', unlocked: true  },
      { id: 'open',         label: 'Warehouse Paths',    icon: '🏭', desc: 'Free drive & experiment',           color: '#64748b', unlocked: true  },
    ],
    missions: [
      { id: 'avoid',     label: 'Obstacle Avoidance',    icon: '🚧', desc: 'Navigate without touching any barrier',        difficulty: 1 },
      { id: 'race',      label: 'Timed Race',            icon: '⏱️', desc: 'Complete the circuit as fast as possible',      difficulty: 2 },
      { id: 'deliver',   label: 'Package Delivery',      icon: '📦', desc: 'Pick up and drop items at target zones',        difficulty: 2 },
      { id: 'checkpoint',label: 'Checkpoint Navigation', icon: '📍', desc: 'Hit all glowing checkpoints in order',         difficulty: 3 },
      { id: 'linefollow',label: 'Line Following',        icon: '〰️', desc: 'Stay on the glowing path to the finish',       difficulty: 1 },
      { id: 'maze',      label: 'Maze Solving',          icon: '🧩', desc: 'Find the exit using sensors and code',         difficulty: 3 },
    ],
    codingBlocks: [
      { id: 'drive_fwd',     label: 'Drive Forward',       icon: '⬆️',  color: '#1e90ff', category: 'move'   },
      { id: 'drive_rev',     label: 'Reverse',             icon: '⬇️',  color: '#1e90ff', category: 'move'   },
      { id: 'steer_left',    label: 'Steer Left',          icon: '↩️',  color: '#1e90ff', category: 'move'   },
      { id: 'steer_right',   label: 'Steer Right',         icon: '↪️',  color: '#1e90ff', category: 'move'   },
      { id: 'set_speed',     label: 'Adjust Speed',        icon: '⚡',  color: '#f59e0b', category: 'move'   },
      { id: 'follow_line',   label: 'Follow Line',         icon: '〰️',  color: '#00c853', category: 'smart'  },
      { id: 'avoid_obstacle',label: 'Avoid Obstacle',      icon: '🚧',  color: '#ef4444', category: 'smart'  },
      { id: 'nav_checkpoint',label: 'Navigate Checkpoint', icon: '📍',  color: '#8b5cf6', category: 'smart'  },
      { id: 'detect_wall',   label: 'Detect Wall',         icon: '🔦',  color: '#f97316', category: 'sense'  },
    ],
    specialFeatures: [
      { icon: '⚙️',  label: 'Wheel Physics',      desc: 'Realistic traction & grip simulation'        },
      { icon: '🏔️',  label: 'Terrain Handling',   desc: 'Bumps and slopes affect your speed'           },
      { icon: '🚀',  label: 'Acceleration',        desc: 'Speed ramps up and down realistically'        },
      { icon: '🔩',  label: 'Suspension Movement', desc: 'Wheels bob over obstacles'                    },
    ],
    physicsProfile: { speedMax: 8, turnRate: 1.8, grip: 0.9, gravityScale: 1.0, isFlying: false },
  },

  /* ─────────────────────────────────────────────
     TANK / TRACKED
  ───────────────────────────────────────────── */
  tank: {
    recommendation: {
      headline: 'This tank crushes rough terrain!',
      detail: 'Built for ramps, rocky paths & pushing heavy cargo.',
      badge: '🚜 Heavy Crawler',
      color: '#78716c',
    },
    environments: [
      { id: 'rough_terrain', label: 'Rocky Terrain',       icon: '🪨', desc: 'Cross unstable rocky ground',       color: '#78716c', unlocked: true  },
      { id: 'ramp',          label: 'Construction Zone',   icon: '🏗️', desc: 'Climb ramps through the site',      color: '#f97316', unlocked: true  },
      { id: 'collect',       label: 'Mountain Course',     icon: '⛰️', desc: 'Haul cargo up steep slopes',        color: '#84cc16', unlocked: true  },
      { id: 'delivery',      label: 'Industrial Site',     icon: '🏭', desc: 'Transport equipment between zones',  color: '#a16207', unlocked: true  },
    ],
    missions: [
      { id: 'cargo',   label: 'Move Heavy Cargo',   icon: '📦', desc: 'Push crates to the loading dock',         difficulty: 2 },
      { id: 'climb',   label: 'Climb Steep Ramps',  icon: '⛰️', desc: 'Reach the top of every ramp',            difficulty: 3 },
      { id: 'clear',   label: 'Clear Obstacles',    icon: '💥', desc: 'Push all barriers out of the path',       difficulty: 2 },
      { id: 'transport',label:'Transport Equipment',icon: '🚛', desc: 'Deliver heavy equipment to target',       difficulty: 2 },
    ],
    codingBlocks: [
      { id: 'tank_left',   label: 'Tank Steer Left',   icon: '↩️',  color: '#78716c', category: 'move'  },
      { id: 'tank_right',  label: 'Tank Steer Right',  icon: '↪️',  color: '#78716c', category: 'move'  },
      { id: 'traction',    label: 'Traction Mode',     icon: '🔒',  color: '#f97316', category: 'move'  },
      { id: 'rotate_spot', label: 'Rotate In Place',   icon: '🔄',  color: '#a16207', category: 'move'  },
      { id: 'heavy_push',  label: 'Heavy Push',        icon: '💪',  color: '#ef4444', category: 'action'},
      { id: 'climb_assist',label: 'Climb Assist',      icon: '⛰️',  color: '#84cc16', category: 'action'},
    ],
    specialFeatures: [
      { icon: '🔗',  label: 'Realistic Track Movement', desc: 'Individual track segments animate' },
      { icon: '💪',  label: 'Enhanced Terrain Grip',    desc: 'Tracks bite into rough surfaces'   },
      { icon: '⚖️',  label: 'Stability Mode',           desc: 'Wide base prevents tipping over'   },
    ],
    physicsProfile: { speedMax: 4, turnRate: 0.7, grip: 1.4, gravityScale: 1.2, isFlying: false },
  },

  /* ─────────────────────────────────────────────
     DRONE / AERIAL
  ───────────────────────────────────────────── */
  drone: {
    recommendation: {
      headline: 'This drone soars through aerial challenges!',
      detail: 'Fly through rings, avoid air obstacles & scan from above.',
      badge: '🚁 Flying Drone',
      color: '#0ea5e9',
    },
    environments: [
      { id: 'sky_rings',  label: 'Floating City',         icon: '🏙️', desc: 'Fly through neon city skies',        color: '#0ea5e9', unlocked: true  },
      { id: 'sky_maze',   label: 'Aerial Obstacle Zone',  icon: '🌩️', desc: 'Weave through sky barriers',          color: '#6366f1', unlocked: true  },
      { id: 'figure8',    label: 'Cloud Tunnels',         icon: '☁️', desc: 'Navigate cloud-filled passages',      color: '#38bdf8', unlocked: true  },
      { id: 'open',       label: 'Sky Challenge Arena',   icon: '🌐', desc: 'Free flight practice',               color: '#0284c7', unlocked: true  },
      { id: 'collect',    label: 'Hover Checkpoints',     icon: '💫', desc: 'Touch floating targets',             color: '#a78bfa', unlocked: true  },
      { id: 'delivery',   label: 'Wind Chambers',         icon: '💨', desc: 'Fight gusts to reach the pad',       color: '#7dd3fc', unlocked: true  },
    ],
    missions: [
      { id: 'race',    label: 'Aerial Racing',        icon: '🏁', desc: 'Speed through the sky course fastest',    difficulty: 2 },
      { id: 'rings',   label: 'Flying Through Rings', icon: '💫', desc: 'Fly through every floating ring',         difficulty: 2 },
      { id: 'scan',    label: 'Object Scanning',      icon: '📷', desc: 'Scan all marked zones from the air',     difficulty: 2 },
      { id: 'deliver', label: 'Airborne Delivery',    icon: '📦', desc: 'Drop packages at landing pads',          difficulty: 3 },
      { id: 'rescue',  label: 'Rescue Operation',     icon: '🆘', desc: 'Find and reach all rescue beacons',      difficulty: 3 },
    ],
    codingBlocks: [
      { id: 'take_off',    label: 'Take Off',         icon: '🚀',  color: '#0ea5e9', category: 'move'   },
      { id: 'land',        label: 'Land',             icon: '🛬',  color: '#0ea5e9', category: 'move'   },
      { id: 'hover',       label: 'Hover',            icon: '⏸️',  color: '#38bdf8', category: 'move'   },
      { id: 'rise',        label: 'Rise Up',          icon: '⬆️',  color: '#0ea5e9', category: 'move'   },
      { id: 'descend',     label: 'Descend',          icon: '⬇️',  color: '#0ea5e9', category: 'move'   },
      { id: 'stabilize',   label: 'Stabilize Flight', icon: '✈️',  color: '#6366f1', category: 'smart'  },
      { id: 'rotate_air',  label: 'Rotate Mid-Air',   icon: '🌀',  color: '#a78bfa', category: 'move'   },
      { id: 'scan_air',    label: 'Scan From Air',    icon: '🔭',  color: '#0284c7', category: 'sense'  },
      { id: 'altitude',    label: 'Altitude Control', icon: '📊',  color: '#7dd3fc', category: 'smart'  },
    ],
    specialFeatures: [
      { icon: '🌬️',  label: 'Aerial Physics',          desc: 'Lift, drag and wind affect your flight' },
      { icon: '🔄',  label: 'Propeller Animation',      desc: 'Rotors spin at realistic speed'         },
      { icon: '💨',  label: 'Wind Effects',             desc: 'Gusts push your drone off course'       },
      { icon: '🎥',  label: 'Dynamic Camera Tracking',  desc: 'Camera follows from cinematic angles'   },
    ],
    physicsProfile: { speedMax: 10, turnRate: 2.5, grip: 0, gravityScale: 0.15, isFlying: true },
  },

  /* ─────────────────────────────────────────────
     JET / PLANE
  ───────────────────────────────────────────── */
  jet: {
    recommendation: {
      headline: 'This jet is built for high-speed aerial racing!',
      detail: 'Canyon runs, sky loops & precision flight stunts.',
      badge: '✈️ Jet Flyer',
      color: '#f59e0b',
    },
    environments: [
      { id: 'figure8',   label: 'Flight Courses',     icon: '✈️', desc: 'Full speed flight course',            color: '#f59e0b', unlocked: true  },
      { id: 'sky_maze',  label: 'Canyon Fly-Through', icon: '🏔️', desc: 'Weave through canyon walls',          color: '#a16207', unlocked: true  },
      { id: 'sky_rings', label: 'Sky Race Tracks',    icon: '🏁', desc: 'Lap the aerial circuit',              color: '#ef4444', unlocked: true  },
      { id: 'open',      label: 'Stunt Arena',        icon: '🌀', desc: 'Aerial stunts in open sky',           color: '#6366f1', unlocked: true  },
    ],
    missions: [
      { id: 'flight_path',label: 'Complete Flight Path',  icon: '🗺️', desc: 'Follow the marked sky route',       difficulty: 1 },
      { id: 'precision',  label: 'Precision Flying',      icon: '🎯', desc: 'Thread through narrow gaps',        difficulty: 3 },
      { id: 'stunts',     label: 'Aerial Stunts',         icon: '🌀', desc: 'Perform rolls and loops',           difficulty: 3 },
      { id: 'race',       label: 'Checkpoint Race',       icon: '🏁', desc: 'Fastest time through all gates',    difficulty: 2 },
      { id: 'land',       label: 'Controlled Landing',    icon: '🛬', desc: 'Land precisely on the runway',      difficulty: 2 },
    ],
    codingBlocks: [
      { id: 'thrust',      label: 'Increase Thrust',   icon: '🔥',  color: '#f59e0b', category: 'move'  },
      { id: 'glide',       label: 'Glide',             icon: '〰️',  color: '#0ea5e9', category: 'move'  },
      { id: 'pitch',       label: 'Pitch Control',     icon: '↗️',  color: '#f97316', category: 'move'  },
      { id: 'roll',        label: 'Roll Control',      icon: '🌀',  color: '#a78bfa', category: 'move'  },
      { id: 'autopilot',   label: 'Autopilot',         icon: '🤖',  color: '#22d3ee', category: 'smart' },
      { id: 'stabilize_ac',label: 'Stabilize Aircraft',icon: '✈️',  color: '#6366f1', category: 'smart' },
      { id: 'boost',       label: 'Boost Speed',       icon: '⚡',  color: '#ef4444', category: 'action'},
    ],
    specialFeatures: [
      { icon: '🌬️',  label: 'Aerodynamic Movement', desc: 'Banking turns feel realistic'   },
      { icon: '💨',  label: 'Speed Trails',          desc: 'Visual afterburner effect'       },
      { icon: '↩️',  label: 'Realistic Turning Arcs',desc: 'Wide, sweeping jet turns'        },
    ],
    physicsProfile: { speedMax: 18, turnRate: 1.2, grip: 0, gravityScale: 0.08, isFlying: true },
  },

  /* ─────────────────────────────────────────────
     HELICOPTER
  ───────────────────────────────────────────── */
  helicopter: {
    recommendation: {
      headline: 'This helicopter excels at hover rescues!',
      detail: 'Precision hovering, cargo pickup & rooftop landings.',
      badge: '🚁 Helicopter',
      color: '#f97316',
    },
    environments: [
      { id: 'sky_rings',  label: 'Rescue Zones',           icon: '🆘', desc: 'Find stranded bots to rescue',       color: '#ef4444', unlocked: true  },
      { id: 'collect',    label: 'Rooftop Landing Areas',  icon: '🏢', desc: 'Land on precise rooftop pads',       color: '#f97316', unlocked: true  },
      { id: 'ramp',       label: 'Mountainous Regions',    icon: '⛰️', desc: 'Hover through mountain terrain',     color: '#84cc16', unlocked: true  },
      { id: 'delivery',   label: 'Cargo Lift Arena',       icon: '📦', desc: 'Lift and transport heavy cargo',     color: '#a16207', unlocked: true  },
    ],
    missions: [
      { id: 'rescue',    label: 'Rescue Stranded Bots',  icon: '🆘', desc: 'Find and lift every rescue beacon', difficulty: 2 },
      { id: 'supply',    label: 'Carry Supplies',         icon: '📦', desc: 'Hover supplies across the map',    difficulty: 2 },
      { id: 'hover_prec',label: 'Hover Precision Task',   icon: '🎯', desc: 'Hold position over each target',   difficulty: 3 },
      { id: 'transport', label: 'Emergency Transport',    icon: '🚨', desc: 'Urgent delivery in time limit',    difficulty: 3 },
    ],
    codingBlocks: [
      { id: 'stab_hover', label: 'Stabilize Hover', icon: '⚖️',  color: '#f97316', category: 'move'  },
      { id: 'raise_alt',  label: 'Raise Altitude',  icon: '⬆️',  color: '#ef4444', category: 'move'  },
      { id: 'lower_cable',label: 'Lower Cargo Cable',icon: '⛓️', color: '#a16207', category: 'action'},
      { id: 'emrg_land',  label: 'Emergency Landing',icon: '🛬',  color: '#84cc16', category: 'action'},
      { id: 'hover',      label: 'Hover',            icon: '⏸️',  color: '#38bdf8', category: 'move'  },
    ],
    specialFeatures: [
      { icon: '🌬️',  label: 'Rotor Downwash',     desc: 'Air pushes objects below the helicopter' },
      { icon: '⚖️',  label: 'Precision Hovering', desc: 'Fine control over height and drift'       },
      { icon: '⛓️',  label: 'Cable Physics',      desc: 'Cargo swings realistically on cable'      },
    ],
    physicsProfile: { speedMax: 6, turnRate: 1.5, grip: 0, gravityScale: 0.12, isFlying: true },
  },

  /* ─────────────────────────────────────────────
     SPIDER / WALKING ROBOT
  ───────────────────────────────────────────── */
  spider: {
    recommendation: {
      headline: 'This walker scales walls and crosses rough terrain!',
      detail: 'Climb towers, leap gaps & explore cave systems.',
      badge: '🕷️ Spider Bot',
      color: '#10b981',
    },
    environments: [
      { id: 'terrain_climb', label: 'Cave Systems',       icon: '🕳️', desc: 'Explore dark, winding caves',         color: '#78716c', unlocked: true  },
      { id: 'ramp',          label: 'Jungle Terrain',     icon: '🌿', desc: 'Cross tangled jungle obstacles',       color: '#22c55e', unlocked: true  },
      { id: 'maze',          label: 'Climbing Towers',    icon: '🗼', desc: 'Scale vertical tower walls',           color: '#f97316', unlocked: true  },
      { id: 'rough_terrain', label: 'Rocky Pathways',     icon: '🪨', desc: 'Navigate unstable rock fields',        color: '#a16207', unlocked: true  },
      { id: 'collect',       label: 'Vertical Challenges',icon: '🧗', desc: 'Reach impossible-looking heights',     color: '#10b981', unlocked: true  },
    ],
    missions: [
      { id: 'wall_climb', label: 'Wall Climbing',         icon: '🧗', desc: 'Scale the vertical wall to the top',     difficulty: 3 },
      { id: 'traversal',  label: 'Terrain Traversal',     icon: '🌿', desc: 'Cross rocky and unstable ground',        difficulty: 2 },
      { id: 'crossing',   label: 'Unstable Ground',       icon: '💣', desc: 'Avoid sinking tiles and gaps',           difficulty: 3 },
      { id: 'explore',    label: 'Exploration Mission',   icon: '🔍', desc: 'Map all hidden areas of the cave',       difficulty: 2 },
    ],
    codingBlocks: [
      { id: 'climb_wall',   label: 'Climb Wall',        icon: '🧗',  color: '#10b981', category: 'move'  },
      { id: 'stab_legs',    label: 'Stabilize Legs',    icon: '⚖️',  color: '#78716c', category: 'move'  },
      { id: 'crouch',       label: 'Crouch',            icon: '⬇️',  color: '#a16207', category: 'move'  },
      { id: 'leap',         label: 'Leap',              icon: '🦘',  color: '#22c55e', category: 'move'  },
      { id: 'terrain_scan', label: 'Terrain Scan',      icon: '🔍',  color: '#f97316', category: 'sense' },
    ],
    specialFeatures: [
      { icon: '🦿',  label: 'Adaptive Walking',    desc: 'Each leg moves independently for grip' },
      { icon: '🧗',  label: 'Wall Grip',           desc: 'Sticky feet can cling to vertical walls'},
      { icon: '🌐',  label: 'Terrain Awareness',   desc: 'Robot senses ground type and adjusts'  },
    ],
    physicsProfile: { speedMax: 4, turnRate: 1.2, grip: 2.0, gravityScale: 0.6, isFlying: false },
  },

  /* ─────────────────────────────────────────────
     HUMANOID
  ───────────────────────────────────────────── */
  humanoid: {
    recommendation: {
      headline: 'This humanoid trains on balance and agility!',
      detail: 'Balance beams, carry tasks & interactive challenges.',
      badge: '🤖 Humanoid',
      color: '#a855f7',
    },
    environments: [
      { id: 'balance_beam', label: 'Robotics Academy',    icon: '🏫', desc: 'School gym challenges',              color: '#a855f7', unlocked: true  },
      { id: 'terrain_climb',label: 'Balance Arenas',      icon: '⚖️', desc: 'Tightrope & balance beam courses',   color: '#8b5cf6', unlocked: true  },
      { id: 'maze',         label: 'Training Facilities', icon: '🏋️', desc: 'Agility training obstacles',         color: '#7c3aed', unlocked: true  },
      { id: 'open',         label: 'Futuristic Classroom',icon: '🔭', desc: 'Interactive classroom puzzles',       color: '#6d28d9', unlocked: true  },
    ],
    missions: [
      { id: 'carry',    label: 'Object Carrying',     icon: '📦', desc: 'Pick up and carry items to the shelf',  difficulty: 2 },
      { id: 'interact', label: 'Interaction Puzzles', icon: '🔑', desc: 'Press buttons and open doors',          difficulty: 2 },
      { id: 'balance',  label: 'Balance Challenges',  icon: '⚖️', desc: 'Cross balance beams without falling',  difficulty: 3 },
      { id: 'training', label: 'Movement Training',   icon: '🏋️', desc: 'Complete the movement obstacle course',difficulty: 2 },
    ],
    codingBlocks: [
      { id: 'walk',          label: 'Walk',           icon: '🚶',  color: '#a855f7', category: 'move'   },
      { id: 'crouch_h',      label: 'Crouch',         icon: '⬇️',  color: '#8b5cf6', category: 'move'   },
      { id: 'wave',          label: 'Wave',           icon: '👋',  color: '#c084fc', category: 'action' },
      { id: 'interact_h',    label: 'Interact',       icon: '🤝',  color: '#7c3aed', category: 'action' },
      { id: 'carry_object',  label: 'Carry Object',   icon: '💼',  color: '#9333ea', category: 'action' },
      { id: 'balance_mode',  label: 'Balance Mode',   icon: '⚖️',  color: '#a78bfa', category: 'smart'  },
    ],
    specialFeatures: [
      { icon: '🦿',  label: 'Bipedal Walking',   desc: 'Two-legged walking with balance physics' },
      { icon: '⚖️',  label: 'Balance System',    desc: 'Will fall over if not balanced correctly' },
      { icon: '🤲',  label: 'Arm Interaction',   desc: 'Hands can grab and interact with objects' },
    ],
    physicsProfile: { speedMax: 3, turnRate: 1.0, grip: 0.8, gravityScale: 1.0, isFlying: false },
  },

  /* ─────────────────────────────────────────────
     ROBOT ARM / FACTORY
  ───────────────────────────────────────────── */
  arm: {
    recommendation: {
      headline: 'This arm robot rules the factory floor!',
      detail: 'Sorting, stacking, assembly & precision grabs.',
      badge: '🦾 Robot Arm',
      color: '#0ea5e9',
    },
    environments: [
      { id: 'factory_sort', label: 'Automated Factory',  icon: '🏭', desc: 'Conveyor belt sorting facility',      color: '#0ea5e9', unlocked: true  },
      { id: 'collect',      label: 'Conveyor Systems',   icon: '⚙️', desc: 'Keep items moving on conveyors',     color: '#64748b', unlocked: true  },
      { id: 'delivery',     label: 'Assembly Lab',       icon: '🔬', desc: 'Precise robotics assembly tasks',     color: '#22d3ee', unlocked: true  },
      { id: 'open',         label: 'Sorting Station',    icon: '📦', desc: 'Sort items by color and type',       color: '#06b6d4', unlocked: true  },
    ],
    missions: [
      { id: 'pick_place', label: 'Pick-and-Place',    icon: '🤏', desc: 'Move each item to the correct zone',    difficulty: 1 },
      { id: 'sort',       label: 'Object Sorting',    icon: '🎨', desc: 'Sort by color, size or shape',          difficulty: 2 },
      { id: 'stack',      label: 'Cargo Stacking',    icon: '📦', desc: 'Build a perfect tower of crates',       difficulty: 3 },
      { id: 'assembly',   label: 'Assembly Line',     icon: '⚙️', desc: 'Assemble products in the right order', difficulty: 3 },
    ],
    codingBlocks: [
      { id: 'rotate_arm',  label: 'Rotate Arm',       icon: '🔄',  color: '#0ea5e9', category: 'move'   },
      { id: 'move_pos',    label: 'Move To Position', icon: '📍',  color: '#22d3ee', category: 'move'   },
      { id: 'grab',        label: 'Grab Object',      icon: '🤏',  color: '#06b6d4', category: 'action' },
      { id: 'release',     label: 'Release Object',   icon: '✋',  color: '#0284c7', category: 'action' },
      { id: 'stack_item',  label: 'Stack Item',       icon: '📦',  color: '#64748b', category: 'action' },
      { id: 'precision',   label: 'Precision Mode',   icon: '🎯',  color: '#38bdf8', category: 'smart'  },
    ],
    specialFeatures: [
      { icon: '🦾',  label: 'Articulated Arm',     desc: 'Each joint moves independently'          },
      { icon: '🤏',  label: 'Grabbing Mechanics',  desc: 'Grip tightness affects what you can hold' },
      { icon: '⚙️',  label: 'Conveyor Interaction',desc: 'Items slide on belts for you to catch'    },
    ],
    physicsProfile: { speedMax: 1, turnRate: 2.5, grip: 0, gravityScale: 1.0, isFlying: false },
  },

  /* ─────────────────────────────────────────────
     UNDERWATER / SUBMARINE
  ───────────────────────────────────────────── */
  submarine: {
    recommendation: {
      headline: 'This bot explores underwater worlds!',
      detail: 'Reef samples, cave mapping & buoyancy missions.',
      badge: '🐟 Sub Bot',
      color: '#06b6d4',
    },
    environments: [
      { id: 'underwater_reef',label: 'Deep Sea Labs',    icon: '🔬', desc: 'Underwater research facility',        color: '#06b6d4', unlocked: true  },
      { id: 'underwater_cave',label: 'Coral Reefs',      icon: '🐠', desc: 'Explore colourful reef life',         color: '#0891b2', unlocked: true  },
      { id: 'open',           label: 'Underwater Caves', icon: '🕳️', desc: 'Tight cave tunnels under the sea',    color: '#0e7490', unlocked: true  },
      { id: 'collect',        label: 'Ocean Trenches',   icon: '🌊', desc: 'Explore the deepest trenches',        color: '#0c4a6e', unlocked: true  },
    ],
    missions: [
      { id: 'collect_s',label: 'Collect Samples',      icon: '🧪', desc: 'Grab glowing mineral samples',         difficulty: 1 },
      { id: 'map',      label: 'Map Terrain',          icon: '🗺️', desc: 'Sonar-scan the entire cave system',     difficulty: 3 },
      { id: 'hazard',   label: 'Avoid Sea Hazards',    icon: '🦑', desc: 'Dodge jellyfish and currents',          difficulty: 2 },
      { id: 'repair',   label: 'Repair Station',       icon: '🔧', desc: 'Reach and fix broken underwater pipes', difficulty: 3 },
    ],
    codingBlocks: [
      { id: 'dive',     label: 'Dive',              icon: '⬇️',  color: '#06b6d4', category: 'move'  },
      { id: 'ascend_s', label: 'Ascend',            icon: '⬆️',  color: '#38bdf8', category: 'move'  },
      { id: 'sonar',    label: 'Sonar Scan',        icon: '📡',  color: '#0891b2', category: 'sense' },
      { id: 'stab_sub', label: 'Stabilize Underwater',icon: '⚖️',color: '#0e7490', category: 'smart' },
      { id: 'collect_s',label: 'Collect Sample',    icon: '🧪',  color: '#22d3ee', category: 'action'},
    ],
    specialFeatures: [
      { icon: '🌊',  label: 'Buoyancy Physics',   desc: 'Water pressure and currents push your bot'  },
      { icon: '💡',  label: 'Underwater Lighting', desc: 'Limited visibility — use your lights!'      },
      { icon: '🌀',  label: 'Aquatic Movement',    desc: 'Smooth, flowing underwater motion effects'  },
    ],
    physicsProfile: { speedMax: 4, turnRate: 0.9, grip: 0, gravityScale: 0.4, isFlying: false, underwater: true },
  },

  /* ─────────────────────────────────────────────
     HOVER BOT
  ───────────────────────────────────────────── */
  hover: {
    recommendation: {
      headline: 'This hover bot glides over floating platforms!',
      detail: 'Cross energy bridges & drift through neon cities.',
      badge: '🛸 Hover Bot',
      color: '#c026d3',
    },
    environments: [
      { id: 'hover_course', label: 'Anti-Gravity Arena',    icon: '🛸', desc: 'Platforms floating in space',        color: '#c026d3', unlocked: true  },
      { id: 'figure8',      label: 'Floating City',         icon: '🏙️', desc: 'Neon city above the clouds',         color: '#a21caf', unlocked: true  },
      { id: 'sky_rings',    label: 'Energy Bridge World',   icon: '⚡', desc: 'Race across glowing energy bridges', color: '#d946ef', unlocked: true  },
      { id: 'open',         label: 'Levitating Platforms',  icon: '🔮', desc: 'Free hover on moving platforms',     color: '#7e22ce', unlocked: true  },
    ],
    missions: [
      { id: 'nav',     label: 'Hover Navigation',      icon: '🗺️', desc: 'Navigate floating platform maze',       difficulty: 2 },
      { id: 'race_h',  label: 'Floating Obstacle Race', icon: '🏁', desc: 'Dodge and race across gap platforms',   difficulty: 3 },
      { id: 'plat',    label: 'Moving Platform Cross',  icon: '🔮', desc: 'Time your hops across moving pads',    difficulty: 3 },
    ],
    codingBlocks: [
      { id: 'hover_stab', label: 'Hover Stabilize',   icon: '⚖️',  color: '#c026d3', category: 'move'  },
      { id: 'float_up',   label: 'Float Upward',       icon: '⬆️',  color: '#a21caf', category: 'move'  },
      { id: 'drift',      label: 'Lateral Drift',      icon: '↔️',  color: '#d946ef', category: 'move'  },
      { id: 'anti_grav',  label: 'Anti-Gravity Boost', icon: '🚀',  color: '#7e22ce', category: 'action'},
    ],
    specialFeatures: [
      { icon: '🌌',  label: 'Anti-Gravity Zone',   desc: 'Different gravity rules in this world'  },
      { icon: '💫',  label: 'Platform Drift',       desc: 'Platforms slowly drift and shift'        },
      { icon: '⚡',  label: 'Energy Bridges',       desc: 'Glow lines show safe hover paths'        },
    ],
    physicsProfile: { speedMax: 7, turnRate: 2.0, grip: 0, gravityScale: 0.3, isFlying: true },
  },

  /* ─────────────────────────────────────────────
     DRILL / MINING BOT
  ───────────────────────────────────────────── */
  drill: {
    recommendation: {
      headline: 'This drill bot tunnels underground!',
      detail: 'Drill walls, collect minerals & avoid cave-ins.',
      badge: '⛏️ Drill Bot',
      color: '#a16207',
    },
    environments: [
      { id: 'mining_tunnel', label: 'Underground Caverns', icon: '🕳️', desc: 'Drill through rocky caverns',        color: '#a16207', unlocked: true  },
      { id: 'rough_terrain', label: 'Mining Tunnels',      icon: '⛏️', desc: 'Carved tunnels full of crystal ore', color: '#92400e', unlocked: true  },
      { id: 'collect',       label: 'Crystal Caves',       icon: '💎', desc: 'Hunt glowing crystals underground',  color: '#d97706', unlocked: true  },
    ],
    missions: [
      { id: 'drill_path', label: 'Drill Pathways',    icon: '🔩', desc: 'Create a path through solid rock walls',  difficulty: 2 },
      { id: 'minerals',   label: 'Gather Minerals',   icon: '💎', desc: 'Collect all glowing mineral nodes',       difficulty: 2 },
      { id: 'clear_rock', label: 'Clear Rock Barriers',icon:'💣', desc: 'Destroy all barriers blocking the exit',  difficulty: 3 },
    ],
    codingBlocks: [
      { id: 'drill_on',   label: 'Activate Drill',  icon: '⛏️',  color: '#a16207', category: 'action' },
      { id: 'tunnel_fwd', label: 'Tunnel Forward',  icon: '⬆️',  color: '#92400e', category: 'move'   },
      { id: 'scan_min',   label: 'Scan Minerals',   icon: '💎',  color: '#d97706', category: 'sense'  },
    ],
    specialFeatures: [
      { icon: '⛏️',  label: 'Drilling Mechanic',  desc: 'Spin speed determines what you can break'  },
      { icon: '💥',  label: 'Breakable Walls',    desc: 'Rock walls shatter with enough drill power' },
      { icon: '💡',  label: 'Dark Caves',         desc: 'Headlights needed to see ahead'             },
    ],
    physicsProfile: { speedMax: 3, turnRate: 0.8, grip: 1.2, gravityScale: 1.0, isFlying: false },
  },

  /* ─────────────────────────────────────────────
     LEGO / BLOCK BUILDER
  ───────────────────────────────────────────── */
  lego: {
    recommendation: {
      headline: 'Your block invention gets a creative sandbox!',
      detail: 'Block parks, cargo puzzles & build challenges.',
      badge: '🧱 Block Bot',
      color: '#f97316',
    },
    environments: [
      { id: 'lego_park', label: 'Giant LEGO City',   icon: '🏙️', desc: 'City built from giant blocks',            color: '#f97316', unlocked: true  },
      { id: 'open',      label: 'Creative Sandbox',  icon: '🎨', desc: 'Build and explore freely',               color: '#fb923c', unlocked: true  },
      { id: 'delivery',  label: 'Block Engineering Park',icon:'⚙️',desc: 'STEM building challenges',             color: '#ea580c', unlocked: true  },
    ],
    missions: [
      { id: 'bridge',    label: 'Bridge Building',    icon: '🌉', desc: 'Place blocks to create a bridge',       difficulty: 2 },
      { id: 'transport', label: 'Block Transport',    icon: '📦', desc: 'Move big blocks to the build zone',     difficulty: 1 },
      { id: 'structure', label: 'Structure Puzzles',  icon: '🧩', desc: 'Figure out the correct build order',    difficulty: 3 },
      { id: 'creative',  label: 'Creative Engineering',icon:'💡', desc: 'Freestyle build using all blocks',       difficulty: 1 },
    ],
    codingBlocks: [
      { id: 'attach',    label: 'Attach Block',   icon: '🔗',  color: '#f97316', category: 'action' },
      { id: 'rotate_b',  label: 'Rotate Block',   icon: '🔄',  color: '#fb923c', category: 'action' },
      { id: 'stack_s',   label: 'Stack Structure',icon: '📦',  color: '#ea580c', category: 'action' },
      { id: 'build_plat',label: 'Build Platform', icon: '🏗️',  color: '#c2410c', category: 'action' },
    ],
    specialFeatures: [
      { icon: '🧱',  label: 'Block Snapping',     desc: 'Blocks lock together with satisfying snap' },
      { icon: '🌈',  label: 'Colour Palette',     desc: 'Paint any block any colour you like'        },
      { icon: '🏗️',  label: 'Physics Building',  desc: 'Towers fall if not balanced correctly'       },
    ],
    physicsProfile: { speedMax: 5, turnRate: 1.5, grip: 0.8, gravityScale: 1.0, isFlying: false },
  },

  /* ─────────────────────────────────────────────
     MECH / GIANT
  ───────────────────────────────────────────── */
  mech: {
    recommendation: {
      headline: 'This mech handles industrial-strength tasks!',
      detail: 'Heavy cargo, construction sites & power modes.',
      badge: '🦾 Mech Bot',
      color: '#6b7280',
    },
    environments: [
      { id: 'ramp',     label: 'Heavy Lift Zone',   icon: '🏗️', desc: 'Crane and heavy construction',           color: '#6b7280', unlocked: true  },
      { id: 'delivery', label: 'Industrial Site',   icon: '🏭', desc: 'Big machinery environment',              color: '#4b5563', unlocked: true  },
      { id: 'collect',  label: 'Cargo Depot',       icon: '📦', desc: 'Vast cargo storage & sorting',           color: '#374151', unlocked: true  },
    ],
    missions: [
      { id: 'heavy_lift', label: 'Heavy Lifting',    icon: '💪', desc: 'Lift and place oversized cargo',          difficulty: 2 },
      { id: 'construct',  label: 'Construction Task',icon: '🏗️', desc: 'Build the structure in the right order', difficulty: 3 },
      { id: 'power_mode', label: 'Power Mode Run',   icon: '⚡', desc: 'Use max power to clear obstacles fast',   difficulty: 2 },
    ],
    codingBlocks: [
      { id: 'power_up',  label: 'Power Up',         icon: '⚡',  color: '#6b7280', category: 'action' },
      { id: 'heavy_lift',label: 'Heavy Lift',       icon: '💪',  color: '#4b5563', category: 'action' },
      { id: 'stomp',     label: 'Stomp Ground',     icon: '💥',  color: '#374151', category: 'action' },
      { id: 'tank_left', label: 'Tank Steer Left',  icon: '↩️',  color: '#6b7280', category: 'move'   },
      { id: 'tank_right',label: 'Tank Steer Right', icon: '↪️',  color: '#6b7280', category: 'move'   },
    ],
    specialFeatures: [
      { icon: '⚖️',  label: 'Massive Weight',     desc: 'Ground shakes when mech walks'           },
      { icon: '💥',  label: 'Stomp Blast',        desc: 'Stomp the ground to clear nearby items'  },
      { icon: '🔋',  label: 'Power Reserve',      desc: 'Power modes drain battery quickly'        },
    ],
    physicsProfile: { speedMax: 3, turnRate: 0.6, grip: 1.8, gravityScale: 1.3, isFlying: false },
  },

  /* ─────────────────────────────────────────────
     BATTLE BOT
  ───────────────────────────────────────────── */
  battle: {
    recommendation: {
      headline: 'This battle bot dodges and strikes!',
      detail: 'Arena dodge, target practice & stealth courses.',
      badge: '⚔️ Battle Bot',
      color: '#ef4444',
    },
    environments: [
      { id: 'obstacles', label: 'Battle Training Arena', icon: '⚔️', desc: 'Dodge attacks in the arena',          color: '#ef4444', unlocked: true  },
      { id: 'open',      label: 'Stealth Arena',         icon: '🥷', desc: 'Move through undetected',             color: '#7c3aed', unlocked: true  },
      { id: 'ai_patrol', label: 'Target Zone',           icon: '🎯', desc: 'Hit all targets before time runs out',color: '#dc2626', unlocked: true  },
      { id: 'maze',      label: 'Combat Maze',           icon: '🧩', desc: 'Navigate hazardous maze traps',       color: '#b91c1c', unlocked: true  },
    ],
    missions: [
      { id: 'dodge',   label: 'Dodge All Attacks',  icon: '🥊', desc: 'Survive 30 seconds without being hit', difficulty: 3 },
      { id: 'target',  label: 'Target Practice',    icon: '🎯', desc: 'Destroy all marked targets',           difficulty: 2 },
      { id: 'stealth', label: 'Stealth Course',      icon: '🥷', desc: 'Pass through without triggering alarms',difficulty: 3 },
      { id: 'race_b',  label: 'Escape Race',         icon: '🏃', desc: 'Outrun the pursuit bots to the exit',  difficulty: 2 },
    ],
    codingBlocks: [
      { id: 'dodge',   label: 'Dodge',           icon: '🤸',  color: '#ef4444', category: 'action' },
      { id: 'strike',  label: 'Strike',          icon: '⚔️',  color: '#dc2626', category: 'action' },
      { id: 'stealth', label: 'Stealth Mode',    icon: '🥷',  color: '#7c3aed', category: 'smart'  },
      { id: 'boost_b', label: 'Boost Speed',     icon: '⚡',  color: '#f97316', category: 'action' },
      { id: 'scan_b',  label: 'Scan for Threats',icon: '🔦',  color: '#b91c1c', category: 'sense'  },
    ],
    specialFeatures: [
      { icon: '🛡️',  label: 'Evasion Physics',  desc: 'Sharp dodges and quick direction changes' },
      { icon: '🎯',  label: 'Target System',    desc: 'Lock on and track moving targets'         },
      { icon: '🥷',  label: 'Stealth Cloak',    desc: 'Turn nearly invisible for 3 seconds'      },
    ],
    physicsProfile: { speedMax: 9, turnRate: 3.0, grip: 0.7, gravityScale: 1.0, isFlying: false },
  },

  /* ─────────────────────────────────────────────
     AI COMPANION
  ───────────────────────────────────────────── */
  companion: {
    recommendation: {
      headline: 'Your AI companion learns as it explores!',
      detail: 'Detect targets, patrol areas & smart navigation.',
      badge: '💙 AI Companion',
      color: '#8b5cf6',
    },
    environments: [
      { id: 'ai_patrol',    label: 'AI Testing Lab',      icon: '🧠', desc: 'Smart test environment for AI',      color: '#8b5cf6', unlocked: true  },
      { id: 'maze',         label: 'Autonomous Nav Zone',  icon: '🤖', desc: 'Self-navigate complex paths',        color: '#7c3aed', unlocked: true  },
      { id: 'obstacles',    label: 'Object Recognition Lab',icon:'📷',desc: 'Identify and react to objects',      color: '#a78bfa', unlocked: true  },
      { id: 'open',         label: 'Stealth Arena',        icon: '🕵️', desc: 'AI-powered patrol course',           color: '#6d28d9', unlocked: true  },
    ],
    missions: [
      { id: 'detect',  label: 'Detect Targets',      icon: '🔍', desc: 'Find and tag all hidden targets',       difficulty: 2 },
      { id: 'follow',  label: 'Follow Target',        icon: '👣', desc: 'Track and follow a moving object',      difficulty: 2 },
      { id: 'identify',label: 'Identify Objects',     icon: '📷', desc: 'Recognise 5 different object types',   difficulty: 2 },
      { id: 'patrol',  label: 'Patrol Route',         icon: '🚶', desc: 'Guard the area on your patrol loop',    difficulty: 1 },
      { id: 'avoid',   label: 'Avoid Moving Hazards', icon: '💣', desc: 'AI dodge random-moving obstacles',      difficulty: 3 },
    ],
    codingBlocks: [
      { id: 'detect_obj', label: 'Detect Object',    icon: '🔍',  color: '#8b5cf6', category: 'sense'  },
      { id: 'follow_tgt', label: 'Follow Target',    icon: '👣',  color: '#7c3aed', category: 'smart'  },
      { id: 'id_color',   label: 'Identify Color',   icon: '🌈',  color: '#a78bfa', category: 'sense'  },
      { id: 'patrol',     label: 'Patrol Area',      icon: '🚶',  color: '#6d28d9', category: 'smart'  },
      { id: 'auto_avoid', label: 'Autonomous Avoid', icon: '🤖',  color: '#4c1d95', category: 'smart'  },
    ],
    specialFeatures: [
      { icon: '🧠',  label: 'AI Vision',        desc: 'Camera automatically recognises objects'      },
      { icon: '🗺️',  label: 'Auto-Navigation',  desc: 'Pathfinds around obstacles by itself'         },
      { icon: '💬',  label: 'Learning Mode',    desc: 'Robot improves each time it tries a mission'  },
    ],
    physicsProfile: { speedMax: 6, turnRate: 2.0, grip: 0.9, gravityScale: 1.0, isFlying: false },
  },

  /* ─────────────────────────────────────────────
     INVENTOR (default / mixed)
  ───────────────────────────────────────────── */
  inventor: {
    recommendation: {
      headline: 'Keep inventing — each part unlocks new missions!',
      detail: 'Add movement, sensors & tools to unlock specialized arenas.',
      badge: '💡 Custom Invention',
      color: '#64748b',
    },
    environments: [
      { id: 'open',      label: 'Invention Test Pad',  icon: '🔬', desc: 'Try out your creation here',         color: '#64748b', unlocked: true },
      { id: 'obstacles', label: 'Basic Obstacle Course',icon: '🚧', desc: 'First challenge to try',             color: '#1e90ff', unlocked: true },
    ],
    missions: [
      { id: 'explore', label: 'Explore Freely',    icon: '🌐', desc: 'Drive around and get a feel for your bot', difficulty: 1 },
      { id: 'invent',  label: 'Invention Challenge',icon: '💡', desc: 'Complete the test pad objectives',        difficulty: 2 },
    ],
    codingBlocks: [
      { id: 'drive_fwd', label: 'Drive Forward', icon: '⬆️',  color: '#1e90ff', category: 'move' },
      { id: 'steer_left',label: 'Steer Left',    icon: '↩️',  color: '#1e90ff', category: 'move' },
      { id: 'steer_right',label:'Steer Right',   icon: '↪️',  color: '#1e90ff', category: 'move' },
      { id: 'set_speed', label: 'Adjust Speed',  icon: '⚡',  color: '#f59e0b', category: 'move' },
    ],
    specialFeatures: [
      { icon: '💡',  label: 'Part Unlocks',  desc: 'Add parts to discover new arenas & blocks' },
    ],
    physicsProfile: { speedMax: 5, turnRate: 1.5, grip: 0.9, gravityScale: 1.0, isFlying: false },
  },
};

/** Returns world config for a given profile id, falls back to inventor. */
export function getAdaptiveWorld(profileId) {
  return ADAPTIVE_WORLDS[profileId] || ADAPTIVE_WORLDS.inventor;
}

/** Category labels for coding blocks */
export const BLOCK_CATEGORY_LABELS = {
  move:   { label: 'Move',    icon: '⚙️',  color: '#1e90ff' },
  action: { label: 'Action',  icon: '🦾',  color: '#f97316' },
  sense:  { label: 'Sense',   icon: '👁',  color: '#8b5cf6' },
  smart:  { label: 'Smart',   icon: '🧠',  color: '#22d3ee' },
};
