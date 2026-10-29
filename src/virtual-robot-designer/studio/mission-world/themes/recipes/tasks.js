/**
 * What stands on each checkpoint of a ground mission, and what happens when the robot reaches it.
 * done: collect (picked up) · out (fire goes out) · check (ticked off) · grow (plant/flag springs up) · deliver (item lands at the station).
 * station: a building or object beside the checkpoint that the task is for. trail: keep the path visible.
 */
const T = (p, done = 'collect', extra = {}) => ({ p, done, ...extra });
const deliver = (p, station, extra = {}) => T(p, 'deliver', { station, ...extra });
const check = (p, extra = {}) => T(p, 'check', extra);

export const MISSION_TASKS = {
  // ─── Spider Bot: crawl the path and do one clear job at each marker ─
  giant_garden: T('ladybird', 'collect', { s: 1.1 }),
  treehouse_kingdom: T('eggNest', 'collect', { s: 0.9 }),
  toy_room: T('teddy', 'collect', { s: 0.85 }),
  sweet_factory: T('cupcake', 'collect', { s: 0.9 }),
  giant_kitchen: check('alarmButton', { s: 0.9, station: { p: 'sink', s: 0.7 } }),
  ancient_temple: check('alarmButton', { s: 0.95 }),
  robot_factory_climb: deliver('toyBlocks', { p: 'workbench', s: 0.75 }, { s: 0.7 }),
  sky_islands_web: check('lantern', { s: 0.9 }),
  crystal_caverns: T('crystal', 'collect', { s: 0.6, o: { color: 0x7ad9ff } }),
  clockwork_castle: T('gear', 'collect', { s: 0.85 }),

  // ─── Crawler ──────────────────────────────────────────────────────
  jungle_trail: T('treasureChest', 'check', { s: 0.7 }),
  muddy_marsh: T('flag', 'grow', { o: { color: 0xf97316 }, trail: true }),
  rocky_canyon: T('vial', 'collect', { o: { color: 0xf97316 } }),
  sand_dunes: T('shell'),
  snowy_peaks: T('flag', 'grow', { o: { color: 0xef4444 }, trail: true }),
  volcano_ridge: T('vial', 'collect', { o: { color: 0xff5a1a }, trail: true }),
  crystal_cave: T('crystal', 'collect', { s: 0.6 }),
  dino_valley: T('bone'),
  autumn_forest: T('acorn'),
  mars_expedition: T('vial', 'collect', { o: { color: 0xff8a3a } }),

  // ─── Farm Bot ─────────────────────────────────────────────────────
  carrot_patch: T('carrot'),
  barn_delivery: deliver('hayBale', { p: 'barn', s: 0.45 }, { s: 0.6 }),
  egg_collection: T('eggNest'),
  apple_orchard: T('appleBasket'),
  pumpkin_patch: T('pumpkin', 'collect', { s: 1.1 }),
  greenhouse_water: T('sprout', 'grow'),
  wheat_harvest: T('hayBale', 'collect', { s: 0.6 }),
  sheep_meadow: check('sheep'),
  sunflower_farm: check('sunflower', { s: 0.8 }),
  farm_fair: T('appleBasket', 'collect', { o: { color: 0xffa82a } }),

  // ─── Mining Bot ───────────────────────────────────────────────────
  mine_entrance: T('mineLamp', 'check', { s: 0.8 }),
  minecart_rails: deliver('oreRock', { p: 'minecart', s: 0.9 }, { s: 0.5, trail: true }),
  gold_vein: T('goldPile', 'collect', { s: 0.7 }),
  gem_cavern: T('crystal', 'collect', { s: 0.55 }),
  underground_lake: T('mineLamp', 'check', { s: 0.8 }),
  lava_tunnel: T('oreRock', 'collect', { s: 0.6 }),
  rock_quarry: deliver('oreRock', { p: 'dumpTruck', s: 0.5 }, { s: 0.5 }),
  fossil_dig: T('bone'),
  deep_drill: check('drill', { s: 0.5 }),
  diamond_finale: T('crystal', 'collect', { s: 0.7, o: { color: 0xdff4ff } }),

  // ─── Space Rover ──────────────────────────────────────────────────
  moon_landing: T('planetFlag', 'grow', { s: 0.8 }),
  mars_base: deliver('parcel', { p: 'dome', s: 0.35 }),
  ice_planet: T('vial', 'collect', { o: { color: 0x5ce1ff } }),
  asteroid_hop: T('moonRock', 'collect', { s: 0.8 }),
  alien_jungle: check('scanPost', { o: { color: 0x7fff6a } }),
  crystal_planet: T('vial', 'collect', { o: { color: 0xff5dd0 } }),
  launch_pad: check('scanPost', { o: { color: 0xf97316 } }),
  ring_planet: T('moonRock', 'collect', { s: 0.8 }),
  space_hangar: deliver('parcel', { p: 'shelves', s: 0.6 }, { o: { color: 0xd8dde4 } }),
  galaxy_finale: T('planetFlag', 'grow', { s: 0.8 }),

  // ─── Heavy Rover ──────────────────────────────────────────────────
  construction_site: deliver('bricks', { p: 'girders', s: 0.35 }),
  dump_truck_run: deliver('oreRock', { p: 'dumpTruck', s: 0.5 }, { s: 0.5, o: { color: 0xe8c878 } }),
  bridge_builder: deliver('girders', { p: 'crane', s: 0.3 }, { s: 0.35 }),
  demolition_yard: T('toyBlocks', 'collect', { s: 0.8 }),
  road_works: check('cone', { s: 1.2, trail: true }),
  logging_camp: deliver('logPile', { p: 'cabin', s: 0.5 }, { s: 0.45 }),
  snow_plough: T('rock', 'collect', { s: 0.5, o: { color: 0xf0f6ff } }),
  shipping_port: deliver('parcel', { p: 'container', s: 0.4 }, { s: 1.1 }),
  dam_repair: deliver('rock', { p: 'barrier', s: 0.8 }, { s: 0.5 }),
  mega_build: deliver('bricks', { p: 'crane', s: 0.3 }),

  // ─── Quiet Rover ──────────────────────────────────────────────────
  moonlit_garden: T('key'),
  owl_woods: T('acorn'),
  whisper_library: T('books', 'collect', { s: 0.8 }),
  laser_museum: T('key', 'collect', { o: { color: 0xffe45a } }),
  silent_snowfall: T('key', 'collect', { o: { color: 0x9ad8ff } }),
  foggy_marsh: check('lantern', { s: 0.8 }),
  midnight_toyshop: T('teddy', 'collect', { s: 0.8 }),
  desert_stars: T('giantStar', 'collect', { s: 0.3, trail: true }),
  sleepy_town: deliver('parcel', { p: 'mailbox', s: 1 }, { s: 0.45, o: { color: 0xffffff, tape: 0xe8322a } }),
  treasure_vault: T('key'),

  // ─── Safety Patrol ────────────────────────────────────────────────
  school_patrol: check('trafficLight', { s: 0.6 }),
  road_crossing: check('trafficLight', { s: 0.6 }),
  park_patrol: check('bench', { s: 0.8 }),
  shopping_street: check('signpost', { s: 0.8 }),
  night_watch: check('lamp', { s: 0.7 }),
  beach_patrol: check('lifebuoy'),
  airport_check: check('suitcase'),
  bank_vault: check('alarmButton', { s: 0.8 }),
  stadium_patrol: check('flag', { o: { color: 0x3a7ae8 } }),
  city_hero: check('trafficLight', { s: 0.6 }),

  // ─── Fire Fighter ─────────────────────────────────────────────────
  forest_fire: T('fire', 'out'),
  kitchen_fire: T('fire', 'out', { s: 0.8 }),
  campfire_safety: T('fire', 'out'),
  factory_fire: T('hotPipe', 'out'),
  treetop_teddy: T('teddy', 'collect', { s: 0.8 }),
  volcano_watch: check('barrier', { s: 0.6 }),
  fire_parade: check('flag', { o: { color: 0xef4444 } }),
  alarm_button_route: check('alarmButton', { s: 0.8 }),
  hydrant_match: check('hydrant', { s: 0.9 }),
  smoke_free_maze: check('exitSign', { s: 0.8 }),

  // ─── Med Bot / helpers ────────────────────────────────────────────
  teddy_clinic: deliver('firstAid', { p: 'clinicBed', s: 0.7 }, { s: 0.7 }),
  medicine_color_sort: deliver('vial', { p: 'medShelf', s: 0.6 }),
  handwashing_helper: check('sink', { s: 0.8 }),
  park_helper: T('teddy', 'collect', { s: 0.8 }),
  ambulance_bay: check('ambulance', { s: 0.45 }),
  supply_shelf: T('firstAid', 'collect', { s: 0.8 }),
  rescue_teddy_path: T('teddy', 'collect', { s: 0.8 }),
  farm_vet: check('cow', { s: 0.7 }),
  space_medic: deliver('firstAid', { p: 'clinicBed', s: 0.7 }, { s: 0.7 }),
  safety_hero_finale: deliver('firstAid', { p: 'clinicBed', s: 0.7 }, { s: 0.7 }),

  // ─── Shared ground set ────────────────────────────────────────────
  garden_maze: T('sunflower', 'check', { s: 0.7 }),
  classroom_delivery: deliver('parcel', { p: 'desk', s: 0.8 }, { s: 0.6 }),
  beach_cleanup: T('litter'),
  toy_city_traffic: check('trafficLight', { s: 0.6 }),
  playground_bridge: T('giantStar', 'collect', { s: 0.3 }),
  solar_farm: check('solarPanel', { s: 0.6 }),
  mountain_tunnel: T('oreRock', 'collect', { s: 0.5 }),
  museum_night: T('key'),
  moon_crater_path: T('moonRock', 'collect', { s: 0.8 }),

  // ─── Walkers ──────────────────────────────────────────────────────
  balance_gym: T('giantStar', 'collect', { s: 0.3 }),
  dance_stage: check('musicNote', { s: 0.5 }),
  toy_workshop: deliver('toyBlocks', { p: 'workbench', s: 0.8 }, { s: 0.6 }),
  stepping_river: T('shell'),
  pose_mirror: check('mirror', { s: 0.6 }),
  sports_day: check('hurdle', { s: 0.8 }),
  teddy_rescue: T('teddy', 'collect', { s: 0.8 }),
  wind_balance_bridge: T('giantStar', 'collect', { s: 0.3 }),
  talent_show: check('spotlight', { s: 0.6 }),
  walker_champion: T('trophy', 'collect', { s: 0.6 }),

  // ─── Robot arm ────────────────────────────────────────────────────
  color_cube_sorter: deliver('toyBlocks', { p: 'colorTrays', s: 0.8 }, { s: 0.5 }),
  block_tower: T('toyBlocks', 'collect', { s: 0.7 }),
  art_drawing: check('easel', { s: 0.6 }),
  recycling_sorter: T('litter'),
  cake_decorating: check('cupcake', { s: 0.8 }),
  music_bells: check('bells', { s: 0.7 }),
  garden_seed_tray: T('sprout', 'grow'),
  marble_mover: T('marbles', 'collect', { s: 0.8 }),
  toy_assembly: check('toyCar', { s: 0.8 }),
  maker_finale: T('trophy', 'collect', { s: 0.6 }),

  // ─── Creative ─────────────────────────────────────────────────────
  color_magic_lab: check('paintPots', { s: 0.8 }),
  shadow_puzzle: T('crystal', 'collect', { s: 0.5 }),
  crystal_garden: T('crystalFlower', 'collect', { s: 0.8 }),
  music_tile_path: check('musicNote', { s: 0.5 }),
  shape_builder: T('shapes', 'collect', { s: 0.6 }),
  lantern_trail: check('paperLantern', { s: 0.8 }),
  puzzle_door_hall: T('key'),
  glow_bridge: T('giantStar', 'collect', { s: 0.3 }),
  festival_parade: check('balloons', { s: 0.6 }),
  creator_finale: T('giantStar', 'collect', { s: 0.35 }),

  // ─── Custom bot school mat ────────────────────────────────────────
  lab_mat: T('giantStar', 'collect', { s: 0.3 }),
  tape_path: T('giantStar', 'collect', { s: 0.3, trail: true }),
  colour_zones: T('toyBlocks', 'collect', { s: 0.6 }),
  loop_square: check('cone', { s: 1.2 }),
  sensor_stop: check('cone', { s: 1.2 }),
  wait_lights: check('trafficLight', { s: 0.6 }),
  if_fork: check('signpost', { s: 0.8 }),
  moving_gate: T('key'),
  pattern_mat: T('shapes', 'collect', { s: 0.6 }),
  custom_cup: T('trophy', 'collect', { s: 0.6 }),

  // ─── Underwater ───────────────────────────────────────────────────
  coral_reef_survey: check('starfish', { s: 1.2 }),
  kelp_forest_maze: T('shell'),
  turtle_rescue: check('turtle', { s: 0.7 }),
  shipwreck_mapping: T('treasureChest', 'check', { s: 0.6 }),
  glowing_cave: T('crystal', 'collect', { s: 0.5 }),
  current_tunnel: T('shell'),
  sonar_treasure: T('treasureChest', 'collect', { s: 0.6 }),
  ocean_cleanup: T('litter'),
  thermal_vent_lab: T('vial', 'collect', { o: { color: 0xff8a3a } }),
  ocean_explorer: T('treasureChest', 'collect', { s: 0.6 }),

  // ─── Sport (Sport Striker, Power Bot, Mega Mech) ──────────────────
  warmup_gym: T('dumbbell'),
  punch_bag_hall: check('punchBag', { s: 0.8 }),
  obstacle_park: T('flag', 'grow', { o: { color: 0xf97316 }, trail: true }),
  relay_race: T('baton', 'collect', { trail: true }),
  hoop_court: deliver('ball', { p: 'hoop', s: 0.8 }, { o: { kind: 'basket' } }),
  football_park: deliver('ball', { p: 'goal', s: 0.4 }),
  skipping_playground: T('skippingRope'),
  beach_games: T('ball', 'collect', { o: { kind: 'beach' } }),
  winter_games: T('flag', 'grow', { o: { color: 0x3fa7ff }, trail: true }),
  champions_finale: T('medal'),
};
