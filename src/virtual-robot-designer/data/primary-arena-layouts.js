// Shared by the mission cards and 3D world. Coordinates are route-relative.
const ROUTES = [
  [[0,0],[0,.3],[.55,.3],[.55,.7],[0,1]],
  [[0,0],[-.6,.22],[.6,.48],[-.6,.74],[0,1]],
  [[0,0],[.7,.2],[.7,.55],[.3,.82],[0,1]],
  [[0,0],[0,.25],[-.7,.25],[-.7,.65],[0,.65],[0,1]],
  [[0,0],[.25,.2],[.25,.4],[-.25,.6],[-.25,.8],[0,1]],
  [[0,0],[-.65,.15],[-.65,.4],[.65,.4],[.65,.8],[0,1]],
  [[0,0],[.6,.2],[-.3,.45],[.65,.68],[0,1]],
  [[0,0],[.7,.15],[.7,.8],[-.5,.8],[-.5,.95],[0,1]],
  [[0,0],[-.7,.2],[.7,.42],[-.7,.65],[.35,.86],[0,1]],
  [[0,0],[.65,.12],[-.65,.3],[.65,.5],[-.65,.7],[.4,.88],[0,1]],
];

const recipes = {
  garden_maze: ['greenhouse','hedge','flower'], classroom_delivery: ['desk','shelf','books'],
  beach_cleanup: ['umbrella','shell','bin'], toy_city_traffic: ['shop','traffic','crossing'],
  playground_bridge: ['bridge','hoop','cone'], solar_farm: ['solar','solar','beacon'],
  mountain_tunnel: ['tunnel','pine','crystal'], museum_night: ['exhibit','frame','planet'],
  moon_crater_path: ['dome','crater','satellite'], robot_rally: ['arch','flag','ramp'],
  cloud_ring_school: ['hoop','cloud','beacon'], balloon_delivery: ['balloon','parcel','cloud'],
  rainbow_tunnel: ['tunnel','hoop','flag'], floating_islands: ['island','pine','cloud'],
  mountain_rescue: ['cabin','pine','flag'], photo_safari: ['tree','camera','flower'],
  wind_tunnel_lab: ['fan','hoop','beacon'], festival_lights: ['lantern','stage','hoop'],
  space_dock: ['satellite','dome','beacon'], sky_academy: ['arch','balloon','island'],
  balance_gym: ['beam','mat','cone'], dance_stage: ['stage','bell','tile'],
  toy_workshop: ['desk','teddy','shelf'], stepping_river: ['stone','reeds','bridge'],
  pose_mirror: ['frame','mat','tile'], sports_day: ['hurdle','flag','cone'],
  teddy_rescue: ['teddy','mat','cube'], wind_balance_bridge: ['bridge','fan','flag'],
  talent_show: ['stage','lantern','bell'], walker_champion: ['arch','beam','hurdle'],
  coral_reef_survey: ['coral','fish','shell'], kelp_forest_maze: ['kelp','stone','fish'],
  turtle_rescue: ['turtle','hoop','coral'], shipwreck_mapping: ['boat','parcel','beacon'],
  glowing_cave: ['tunnel','crystal','beacon'], current_tunnel: ['hoop','reeds','fish'],
  sonar_treasure: ['chest','tile','shell'], ocean_cleanup: ['bin','coral','parcel'],
  thermal_vent_lab: ['vent','beacon','crystal'], ocean_explorer: ['arch','coral','boat'],
  color_cube_sorter: ['tray','cube','desk'], block_tower: ['tower','cube','tile'],
  art_drawing: ['canvas','pencil','desk'], recycling_sorter: ['bin','parcel','shelf'],
  cake_decorating: ['cake','desk','tray'], music_bells: ['bell','stage','tile'],
  garden_seed_tray: ['tray','flower','greenhouse'], marble_mover: ['tray','marble','cube'],
  toy_assembly: ['car','shelf','desk'], maker_finale: ['tower','canvas','cake'],
};

// Theme words also cover helper, sport, creative and custom robot chapters.
const THEMES = [
  [/clinic|teddy|rescue_teddy/, ['teddy','desk','mat']],
  [/handwash|sink/, ['sink','shelf','tile']],
  [/medicine|supply/, ['shelf','parcel','tray']],
  [/park/, ['tree','bench','flower']],
  [/alarm|button/, ['button','beacon','tile']],
  [/hydrant/, ['hydrant','hoop','cone']],
  [/smoke|safety/, ['arch','beacon','mat']],
  [/magic|color|colour/, ['paint','tile','desk']],
  [/shadow|mirror/, ['frame','lantern','tile']],
  [/crystal/, ['crystal','tree','flower']],
  [/music/, ['bell','tile','stage']],
  [/shape/, ['canvas','cube','pencil']],
  [/lantern/, ['lantern','tree','stone']],
  [/door/, ['door','button','tile']],
  [/bridge/, ['bridge','beacon','crystal']],
  [/parade|creator/, ['flag','stage','lantern']],
  [/dribble/, ['goal','cone','ball']],
  [/passing/, ['goal','flag','ball']],
  [/goal|penalty|keeper/, ['goal','target','ball']],
  [/kick/, ['goal','mat','ball']],
  [/pitch|street|one|1v1/, ['shop','goal','ball']],
  [/cup|final/, ['arch','goal','flag']],
];

export function getArenaBlueprint(arena) {
  const mode = Math.max(1, Math.min(10, Math.floor(Number(arena.mode) || 1)));
  const props = recipes[arena.id] || THEMES.find(([re]) => re.test(arena.id))?.[1] || ['tile','beacon','cube'];
  return {
    id: arena.id,
    route: ROUTES[mode - 1].map(([x,z]) => [x,z]),
    props: [...props],
    // Deliberate arrangements: classroom rows, beach arc, galleries, switchbacks.
    placements: Array.from({length: 8}, (_, i) => ({
      t: .08 + i * .115,
      side: i % 2 ? 1 : -1,
      offset: 8 + (mode % 3) + (i % 3) * 2,
      prop: props[i % props.length],
    })),
  };
}
