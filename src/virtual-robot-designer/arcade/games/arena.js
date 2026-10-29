import { loadCreations, saveCreations } from '../../create/creationStore.js';
/**
 * Arena Quest — grid adventures built from tiles. Used by the 10 built-in
 * arenas AND by every arena a child designs in the Arena Maker.
 *
 * Map characters:
 *   #  wall        .  floor      S  start      F  finish flag
 *   G  gem         L  lava       K  key        D  locked door
 *   B  push crate  H  bug ↔      V  bug ↕      O  portal (pairs, in reading order)
 *   C  coin        J  bounce pad I  slippery ice   P  decoration (blocks the way, drawn from the theme)
 */

export const TILE_INFO = {
  '.': { name: 'Floor', emoji: '⬜' },
  '#': { name: 'Wall', emoji: '🧱' },
  S: { name: 'Start', emoji: '🤖' },
  F: { name: 'Flag', emoji: '🏁' },
  G: { name: 'Gem', emoji: '💎' },
  L: { name: 'Lava', emoji: '🔥' },
  K: { name: 'Key', emoji: '🔑' },
  D: { name: 'Door', emoji: '🚪' },
  B: { name: 'Crate', emoji: '📦' },
  H: { name: 'Bug ↔', emoji: '🐞' },
  V: { name: 'Bug ↕', emoji: '🐛' },
  O: { name: 'Portal', emoji: '🌀' },
  C: { name: 'Coin', emoji: '🪙' },
  J: { name: 'Bounce pad', emoji: '🟢' },
  I: { name: 'Ice', emoji: '🧊' },
  P: { name: 'Decoration', emoji: '🌳' },
};

/* Board styles: the colours of the tiles, walls and wall tops. */
const BOARD = {
  grass: { floorA: 0x9be07a, floorB: 0x8fd36a, wall: 0x4d7c0f, wallTop: 0x84cc16 },
  wood: { floorA: 0xe0b27a, floorB: 0xd29e63, wall: 0x8b5a2b, wallTop: 0xf3d3a3 },
  stone: { floorA: 0xd6d3d1, floorB: 0xc4c0bc, wall: 0x78716c, wallTop: 0xa8a29e },
  sand: { floorA: 0xfde68a, floorB: 0xf5d77a, wall: 0xc2884a, wallTop: 0xfcd34d },
  metal: { floorA: 0xcbd5e1, floorB: 0xb8c3d1, wall: 0x475569, wallTop: 0x22d3ee, glow: true },
  snow: { floorA: 0xf8fafc, floorB: 0xe2e8f0, wall: 0x93c5fd, wallTop: 0xffffff },
  candy: { floorA: 0xfbcfe8, floorB: 0xf9a8d4, wall: 0xec4899, wallTop: 0xffffff },
  seabed: { floorA: 0xfcd9a8, floorB: 0xf3c98f, wall: 0x0e7490, wallTop: 0x5eead4, glow: true },
  dirt: { floorA: 0xa8a29e, floorB: 0x8b8580, wall: 0x57534e, wallTop: 0xfbbf24 },
  lava: { floorA: 0x78716c, floorB: 0x57534e, wall: 0x292524, wallTop: 0x44403c },
  space: { floorA: 0x475569, floorB: 0x334155, wall: 0x1e293b, wallTop: 0x22d3ee, glow: true },
  stage: { floorA: 0x4338ca, floorB: 0x312e81, wall: 0x1e1b4b, wallTop: 0xf472b6, glow: true },
  tile: { floorA: 0xffffff, floorB: 0xe2e8f0, wall: 0x60a5fa, wallTop: 0xbfdbfe },
  crystal: { floorA: 0xede9fe, floorB: 0xddd6fe, wall: 0x7c3aed, wallTop: 0xf0abfc, glow: true },
};

/**
 * Arena themes. Each one dresses the arena with the same 3D world (sky, scenery,
 * props, weather) as a pre-built Robot Studio arena — `recipe` names that world.
 */
const T = (name, emoji, cat, recipe, board, props, sky) => ({ name, emoji, cat, recipe, ...BOARD[board], board, props, sky });
export const THEMES = {
  garden: T('Flower Garden', '🌻', 'Nature', 'garden_maze', 'grass', ['sunflower', 'bush', 'mushroom', 'flowers'], 0x9fd8ff),
  giantgarden: T('Giant Garden', '🌼', 'Nature', 'giant_garden', 'grass', ['giantDaisy', 'giantTulip', 'pebble', 'giantClover'], 0x9fd8ff),
  jungle: T('Jungle Temple', '🗿', 'Nature', 'temple_steps', 'stone', ['treePalm', 'rock', 'bush'], 0x9fd8ff),
  bamboo: T('Bamboo Forest', '🎋', 'Nature', 'bamboo_canopy', 'grass', ['bush', 'rock', 'mushroom'], 0xa7f3d0),
  forest: T('Pine Forest', '🌲', 'Nature', 'forest_path', 'grass', ['treePine', 'rock', 'mushroom'], 0x9fd8ff),
  mountain: T('Mountain Pass', '⛰️', 'Nature', 'mountain_tunnel', 'stone', ['rock', 'treePine', 'bush'], 0xbfdbfe),
  farm: T('Solar Farm', '☀️', 'Nature', 'solar_farm', 'grass', ['hayBale', 'pumpkin', 'solarPanel'], 0x9fd8ff),
  greenhouse: T('Greenhouse', '🪴', 'Nature', 'greenhouse_water', 'tile', ['plantPot', 'sprout', 'seedTray'], 0xdcfce7),
  classroom: T('Classroom', '📚', 'School & Town', 'classroom_delivery', 'wood', ['desk', 'books', 'globe', 'toyBlocks'], 0xfff4dc),
  library: T('Whisper Library', '📖', 'School & Town', 'whisper_library', 'wood', ['bookshelf', 'books', 'globe'], 0xfef3c7),
  museum: T('Museum at Night', '🦖', 'School & Town', 'museum_night', 'stone', ['dinoSkeleton', 'displayCase', 'pillar'], 0x1e1b4b),
  toycity: T('Toy City', '🚦', 'School & Town', 'toy_city_traffic', 'tile', ['trafficLight', 'cone', 'hydrant'], 0x9fd8ff),
  playground: T('Playground', '🛝', 'School & Town', 'playground_bridge', 'sand', ['slide', 'swings', 'bench'], 0x9fd8ff),
  cake: T('Cake Factory', '🎂', 'Fun', 'cake_decorating', 'candy', ['cupcake', 'cake'], 0xfff0f4),
  toyshop: T('Midnight Toyshop', '🧸', 'Fun', 'midnight_toyshop', 'wood', ['teddy', 'toyBlocks', 'toyCar'], 0x312e81),
  dance: T('Dance Stage', '🪩', 'Fun', 'dance_stage', 'stage', ['spotlight', 'bells'], 0x1a0b3a),
  festival: T('Festival Parade', '🎉', 'Fun', 'festival_parade', 'tile', ['balloons', 'stall', 'bunting'], 0x9fd8ff),
  music: T('Music Path', '🎵', 'Fun', 'music_tile_path', 'stage', ['musicNote', 'pianoKeys'], 0x312e81),
  crystalgarden: T('Crystal Garden', '💎', 'Fun', 'crystal_garden', 'crystal', ['crystal', 'crystalFlower'], 0xede9fe),
  lanterns: T('Lantern Trail', '🏮', 'Fun', 'lantern_trail', 'stone', ['lantern', 'paperLantern'], 0x1e1b4b),
  beach: T('Sunny Beach', '🏖️', 'Water', 'beach_cleanup', 'sand', ['umbrella', 'sandcastle', 'treePalm'], 0x9fd8ff),
  reef: T('Coral Reef', '🐠', 'Water', 'coral_reef_survey', 'seabed', ['coralBranch', 'coralBrain', 'starfish'], 0x1ab0e8),
  kelp: T('Kelp Forest', '🌿', 'Water', 'kelp_forest_maze', 'seabed', ['kelp', 'seaweed', 'shell'], 0x0e7490),
  shipwreck: T('Shipwreck', '🏴‍☠️', 'Water', 'shipwreck_mapping', 'seabed', ['treasureChest', 'anemone', 'shell'], 0x0e7490),
  glowcave: T('Glowing Cave', '✨', 'Water', 'glowing_cave', 'crystal', ['crystal', 'anemone'], 0x0f172a),
  moon: T('Moon Base', '🌙', 'Space', 'moon_crater_path', 'space', ['moonRock', 'dome', 'planetFlag'], 0x070b1c),
  hangar: T('Space Hangar', '🚀', 'Space', 'space_hangar', 'metal', ['rocket', 'satellite', 'dome'], 0x0b1024),
  mine: T('Gem Mine', '⛏️', 'Adventure', 'surface_mine', 'dirt', ['minecart', 'oreRock', 'mineLamp'], 0x9fd8ff),
  desert: T('Desert Ruins', '🏜️', 'Adventure', 'desert_ruins', 'sand', ['cactus', 'rock', 'barrel'], 0xfde68a),
  snow: T('Snowy Peaks', '❄️', 'Adventure', 'silent_snowfall', 'snow', ['treePine', 'iceSpike', 'rock'], 0xbfdbfe),
  lavacave: T('Lava Cavern', '🌋', 'Adventure', 'crimson_cavern', 'lava', ['rock', 'crystal', 'barrel'], 0x2a0a0a),
  skyislands: T('Sky Islands', '☁️', 'Adventure', 'sky_islands', 'grass', ['cloud', 'bush', 'rock'], 0xbae6fd),
  vault: T('Treasure Vault', '💰', 'Adventure', 'treasure_vault', 'stone', ['goldPile', 'treasureChest', 'pillar'], 0x1e1b4b),
  toyfactory: T('Toy Factory', '🏭', 'Factory', 'toy_factory', 'metal', ['conveyor', 'gear', 'crate'], 0xe2e8f0),
  paintshop: T('Paint Shop', '🎨', 'Factory', 'paint_shop', 'tile', ['paintPots', 'easel', 'crate'], 0xfef9c3),
  sports: T('Sports Hall', '🏀', 'Sport', 'hoop_court', 'wood', ['hoop', 'ball', 'goal'], 0xfff4dc),
};
/** Older arenas used these names. */
const THEME_ALIAS = { meadow: 'garden', space: 'hangar', candy: 'cake', lava: 'lavacave', ice: 'snow' };
export const themeFor = (id) => THEMES[id] || THEMES[THEME_ALIAS[id]] || THEMES.garden;
export const THEME_CATEGORIES = ['Nature', 'School & Town', 'Fun', 'Water', 'Space', 'Adventure', 'Factory', 'Sport'];

export const GOALS = {
  flag: 'Reach the flag',
  gems: 'Collect every gem',
  both: 'Collect every gem, then reach the flag',
  coins: 'Collect every coin',
};

const DX = [1, 0, -1, 0], DY = [0, 1, 0, -1];
const key = (x, y) => `${x},${y}`;

/* ─── Built-in arenas ─── */
export const BUILTIN_ARENAS = [
  { id: 'aq1', name: 'First steps', emoji: '🏁', theme: 'meadow', goal: 'flag', lives: 3, par: 2,
    hint: 'Repeat → Move forward until you reach the flag.',
    map: ['##########', '#S......F#', '##########'], starter: [['repeat', 0, { times: 3 }], ['move', 1]] },
  { id: 'aq2', name: 'Corner turn', emoji: '↪️', theme: 'meadow', goal: 'flag', lives: 3, par: 5,
    hint: 'Move along, turn right, keep going.',
    map: ['########', '#S....##', '#####.##', '#####.##', '#####F##', '########'] },
  { id: 'aq3', name: 'Gem garden', emoji: '💎', theme: 'candy', goal: 'gems', lives: 3, par: 4,
    hint: 'Forever → If wall ahead → Turn right. Then Move. Loop the garden!',
    map: ['#########', '#SGGGGGG#', '#G#####G#', '#G#####G#', '#GGGGGGG#', '#########'] },
  { id: 'aq4', name: 'Hedge maze', emoji: '🌿', theme: 'meadow', goal: 'flag', lives: 3, par: 8,
    hint: 'Left-hand rule: If wall on the left → (If wall ahead → turn right, Else → move). Else → turn left, move.',
    map: ['###########', '#S..#.....#', '##.##.###.#', '#..#..#...#', '#.##.##.###', '#....#...F#', '###########'] },
  { id: 'aq5', name: 'Lava leap', emoji: '🔥', theme: 'lava', goal: 'flag', lives: 3, par: 5,
    hint: 'If lava ahead → Jump! Else → Move.',
    map: ['############', '#S..L..L..F#', '############'] },
  { id: 'aq6', name: 'Locked door', emoji: '🔑', theme: 'lava', goal: 'flag', lives: 3, par: 8,
    hint: 'Grab the key first — doors open when you walk into them with a key.',
    map: ['##########', '#S...K...#', '########.#', '#F..D....#', '##########'] },
  { id: 'aq7', name: 'Crate push', emoji: '📦', theme: 'ice', goal: 'flag', lives: 3, par: 3,
    hint: 'Walk into a crate to push it. Push a crate into lava to make a bridge!',
    map: ['###########', '#S.B.L...F#', '###########'] },
  { id: 'aq8', name: 'Bug patrol', emoji: '🐞', theme: 'candy', goal: 'flag', lives: 3, par: 5,
    hint: 'Bugs cross your path. If bug ahead → Wait. Else → Move.',
    map: ['###########', '####.##.###', '####.##.###', '#S..V..V.F#', '####.##.###', '####.##.###', '###########'] },
  { id: 'aq9', name: 'Portal hop', emoji: '🌀', theme: 'space', goal: 'both', lives: 3, par: 6,
    hint: 'Portals beam you to the other portal. Grab every gem, then the flag.',
    map: ['###########', '#S.GG.O####', '###########', '#O.G.G..GF#', '###########'] },
  { id: 'aq10', name: 'Grand quest', emoji: '👑', theme: 'space', goal: 'both', lives: 3, par: 12,
    hint: 'Use everything: jump lava, grab the key, push the crate, collect all gems, finish at the flag.',
    map: ['#############', '#S.G.L.G..K.#', '###########.#', '#G..D.......#', '#.###########', '#..G..B.L..F#', '#############'] },
];

/* ─── Helpers ─── */
export function normaliseMap(map) {
  const w = Math.max(...map.map((r) => r.length));
  return map.map((r) => r.padEnd(w, '#'));
}

/** Quick "can it be finished?" check (ignores bugs; keys open doors, crates count as floor). */
/**
 * Can it be finished? `lab: true` uses the Robot Studio rules the Arena Maker plays with:
 * lava and crates block the way (drive round them), keys open doors.
 */
export function checkArena(arena, { lab = false } = {}) {
  const map = normaliseMap(arena.map);
  const H = map.length, W = map[0].length;
  const find = (ch) => { const out = []; map.forEach((r, y) => [...r].forEach((c, x) => { if (c === ch) out.push([x, y]); })); return out; };
  const starts = find('S'), flags = find('F'), gems = find('G'), coins = find('C');
  const problems = [];
  if (starts.length !== 1) problems.push(starts.length ? 'Only one Start please.' : 'Place a Start tile 🤖.');
  if ((arena.goal === 'flag' || arena.goal === 'both') && !flags.length) problems.push('Place a Flag 🏁 — that is the finish.');
  if ((arena.goal === 'gems' || arena.goal === 'both') && !gems.length) problems.push('Place at least one Gem 💎.');
  if (arena.goal === 'coins' && !coins.length) problems.push('Place at least one Coin 🪙.');
  if (!lab && find('O').length % 2) problems.push('Portals come in pairs 🌀🌀.');
  if (problems.length) return { ok: false, problems };
  // Flood fill, jumping over single lava tiles allowed, keys open doors.
  const portals = find('O');
  const pairOf = (x, y) => { const i = portals.findIndex(([px, py]) => px === x && py === y); return i < 0 ? null : portals[i ^ 1]; };
  const keys = find('K').length;
  const seen = new Set();
  const q = [starts[0]];
  seen.add(key(...starts[0]));
  const walk = (c) => c !== '#' && c !== 'P' && c !== 'L' && !(lab && c === 'B') && (c !== 'D' || keys > 0);
  while (q.length) {
    const [x, y] = q.shift();
    const push = (nx, ny) => { if (!seen.has(key(nx, ny))) { seen.add(key(nx, ny)); q.push([nx, ny]); } };
    for (let d = 0; d < 4; d++) {
      const nx = x + DX[d], ny = y + DY[d];
      const c = map[ny]?.[nx];
      if (c && walk(c)) { push(nx, ny); if (c === 'O' && !lab) { const p = pairOf(nx, ny); if (p) push(...p); } }
      if (lab) continue;
      if (c === 'L') { const jx = nx + DX[d], jy = ny + DY[d], j = map[jy]?.[jx]; if (j && walk(j)) push(jx, jy); }
      // Bounce pads throw the robot two squares on
      if (c === 'J') { const jx = nx + DX[d] * 2, jy = ny + DY[d] * 2, j = map[jy]?.[jx], m = map[ny + DY[d]]?.[nx + DX[d]]; if (j && walk(j) && m && m !== '#' && m !== 'P') push(jx, jy); }
    }
  }
  const need = [];
  if (arena.goal === 'gems' || arena.goal === 'both') gems.forEach(([x, y]) => { if (!seen.has(key(x, y))) need.push('gem'); });
  if (arena.goal === 'coins') coins.forEach(([x, y]) => { if (!seen.has(key(x, y))) need.push('coin'); });
  if ((arena.goal === 'flag' || arena.goal === 'both') && !flags.some(([x, y]) => seen.has(key(x, y)))) need.push('flag');
  if (need.length) return { ok: false, problems: [need.includes('flag') ? 'The flag can\'t be reached from the start.' : `Some ${need.includes('coin') ? 'coins' : 'gems'} can't be reached.`] };
  return { ok: true, problems: [] };
}

export function encodeArena(a) {
  const json = JSON.stringify({ n: a.name, e: a.emoji, t: a.theme, g: a.goal, l: a.lives, m: a.map, h: a.hint || '', tl: a.time || 0 });
  return btoa(unescape(encodeURIComponent(json))).replace(/=+$/, '');
}
export function decodeArena(code) {
  try {
    const j = JSON.parse(decodeURIComponent(escape(atob(String(code).trim()))));
    if (!Array.isArray(j.m)) return null;
    return { id: `shared-${Date.now()}`, name: j.n || 'Shared arena', emoji: j.e || '🏟️', theme: THEMES[j.t] || THEME_ALIAS[j.t] ? j.t : 'garden', goal: GOALS[j.g] ? j.g : 'flag', lives: j.l || 3, time: j.tl || 0, map: j.m.slice(0, 16).map((r) => String(r).slice(0, 20)), hint: j.h || '', custom: true };
  } catch { return null; }
}

const MY_KEY = 'bb-my-arenas';
/** Each pupil's own arenas (kept per account on this device). */
export function loadMyArenas() { return loadCreations(MY_KEY); }
export function saveMyArenas(list) { saveCreations(MY_KEY, list); }

/* ─── The game ─── */
const BLOCKS = {
  move: { label: 'Move forward', icon: '⬆️', color: '#3b82f6', cat: 'Move' },
  turn_left: { label: 'Turn left', icon: '↩️', color: '#0ea5e9', cat: 'Move' },
  turn_right: { label: 'Turn right', icon: '↪️', color: '#0ea5e9', cat: 'Move' },
  turn_around: { label: 'Turn around', icon: '🔄', color: '#0ea5e9', cat: 'Move' },
  jump: { label: 'Jump!', icon: '🦘', color: '#f97316', cat: 'Move' },
};
const CONDITIONS = [
  { id: 'wall_ahead', label: 'wall ahead' },
  { id: 'wall_left', label: 'wall on the left' },
  { id: 'wall_right', label: 'wall on the right' },
  { id: 'lava_ahead', label: 'lava ahead' },
  { id: 'gem_ahead', label: 'gem ahead' },
  { id: 'gem_left', label: 'gem to the left' },
  { id: 'gem_right', label: 'gem to the right' },
  { id: 'coin_ahead', label: 'coin ahead' },
  { id: 'coin_left', label: 'coin to the left' },
  { id: 'coin_right', label: 'coin to the right' },
  { id: 'on_ice', label: 'standing on ice' },
  { id: 'flag_ahead', label: 'flag ahead' },
  { id: 'bug_ahead', label: 'bug ahead' },
  { id: 'door_ahead', label: 'door ahead' },
  { id: 'crate_ahead', label: 'crate ahead' },
  { id: 'have_key', label: 'I have a key' },
  { id: 'all_gems', label: 'all gems collected' },
  { id: 'all_coins', label: 'all coins collected' },
];
const ALL_PALETTE = ['move', 'turn_left', 'turn_right', 'turn_around', 'jump', 'wait', 'forever', 'repeat', 'repeat_until', 'if', 'else'];

function arenaLevel(a) {
  return {
    title: a.name,
    goal: `${GOALS[a.goal] || GOALS.flag}.${a.desc ? ` ${a.desc}` : ''}`,
    hint: a.hint || 'Plan your route, then use sensors to make your robot smart!',
    par: a.par || 10,
    palette: ALL_PALETTE,
    starter: a.starter,
    arena: a,
  };
}

/** Build a playable game from a list of arenas (built-ins + the child's own). */
export function makeArenaGame(arenas = BUILTIN_ARENAS) {
  const levels = arenas.map(arenaLevel);
  return {
    id: 'arenaquest',
    title: 'Arena Quest',
    emoji: '🏟️',
    color: '#14b8a6',
    blurb: 'Tile adventures — and every arena you design in the Arena Maker!',
    conditions: CONDITIONS,
    blocks: BLOCKS,
    levels,

    init(levelIdx) {
      const a = levels[levelIdx].arena;
      const map = normaliseMap(a.map);
      const H = map.length, W = map[0].length;
      const w = {
        level: levelIdx, arena: a, W, H, t: 0,
        walls: new Set(), lava: new Set(), gems: new Set(), keys: new Set(), doors: new Set(), crates: new Set(), portals: [], flags: new Set(),
        coins: new Set(), pads: new Set(), ice: new Set(), props: new Set(), coinsTotal: 0, coinsGot: 0,
        bugs: [], p: { x: 1, y: 1, dir: 0, px: 1, py: 1 }, start: [1, 1], anim: 1, jumpT: 0,
        haveKeys: 0, gemsTotal: 0, gemsGot: 0, lives: a.lives || 3, theme: THEMES[a.theme] ? a.theme : (THEME_ALIAS[a.theme] || 'garden'), safeT: 0, bumps: 0, pops: [], cmd: null, result: null,
      };
      map.forEach((row, y) => [...row].forEach((c, x) => {
        const k = key(x, y);
        if (c === '#') w.walls.add(k);
        else if (c === 'P') { w.walls.add(k); w.props.add(k); }
        else if (c === 'C') w.coins.add(k);
        else if (c === 'J') w.pads.add(k);
        else if (c === 'I') w.ice.add(k);
        else if (c === 'L') w.lava.add(k);
        else if (c === 'G') w.gems.add(k);
        else if (c === 'K') w.keys.add(k);
        else if (c === 'D') w.doors.add(k);
        else if (c === 'B') w.crates.add(k);
        else if (c === 'F') w.flags.add(k);
        else if (c === 'O') w.portals.push([x, y]);
        else if (c === 'H' || c === 'V') w.bugs.push({ x, y, px: x, py: y, axis: c === 'H' ? 0 : 1, sign: 1, acc: 0, anim: 1 });
        else if (c === 'S') { w.start = [x, y]; w.p = { x, y, dir: 0, px: x, py: y }; }
      }));
      w.gemsTotal = w.gems.size;
      w.coinsTotal = w.coins.size;
      // Face the first open direction from the start
      const open = [0, 1, 2, 3].find((d) => !w.walls.has(key(w.p.x + DX[d], w.p.y + DY[d])) && inside(w, w.p.x + DX[d], w.p.y + DY[d]));
      if (open != null) w.p.dir = open;
      w.startDir = w.p.dir;
      return w;
    },

    start(w, action) {
      const c = { ...action, t: 0, dur: 0.06 };
      const p = w.p;
      if (action.type === 'turn_left') p.dir = (p.dir + 3) % 4;
      else if (action.type === 'turn_right') p.dir = (p.dir + 1) % 4;
      else if (action.type === 'turn_around') { p.dir = (p.dir + 2) % 4; c.dur = 0.09; }
      else if (action.type === 'move' || action.type === 'jump') {
        c.dur = action.type === 'jump' ? 0.32 : 0.2;
        stepRobot(w, action.type === 'jump' ? 2 : 1);
      } else c.dur = 0;
      w.cmd = c;
    },

    tick(w, dt) {
      if (w.result) return;
      w.t += dt;
      w.anim = Math.min(1, w.anim + dt / (w.jumpT > 0 ? 0.32 : 0.2));
      w.safeT = Math.max(0, w.safeT - dt);
      w.pops.forEach((q) => { q.life -= dt; });
      w.pops = w.pops.filter((q) => q.life > 0);
      for (const b of w.bugs) {
        b.anim = Math.min(1, b.anim + dt / 0.45);
        b.acc += dt;
        if (b.acc < 0.5) continue;
        b.acc -= 0.5;
        const dx = b.axis === 0 ? b.sign : 0, dy = b.axis === 1 ? b.sign : 0;
        // Bugs are polite: they turn back rather than walk into the robot.
        const free = (x, y) => bugCanEnter(w, x, y) && !(x === w.p.x && y === w.p.y);
        if (!free(b.x + dx, b.y + dy)) b.sign *= -1;
        const nx = b.x + (b.axis === 0 ? b.sign : 0), ny = b.y + (b.axis === 1 ? b.sign : 0);
        b.px = b.x; b.py = b.y;
        if (free(nx, ny)) { b.x = nx; b.y = ny; b.anim = 0; }
      }
      const c = w.cmd;
      if (c && !c.done) { c.t += dt; if (c.t >= c.dur) c.done = true; }
      if (w.t > (w.arena.time || 150)) w.result = { lose: true, msg: 'Time up! Try a shorter route.' };
      w.timeLeft = Math.max(0, (w.arena.time || 150) - w.t);
    },

    sense(w, cond) {
      const p = w.p;
      const ahead = [p.x + DX[p.dir], p.y + DY[p.dir]];
      const solid = (x, y) => !inside(w, x, y) || w.walls.has(key(x, y));
      const scan = (d, test) => { let x = p.x, y = p.y; for (let i = 0; i < 30; i++) { x += DX[d]; y += DY[d]; if (solid(x, y)) return false; if (test(x, y)) return true; } return false; };
      const gem = (x, y) => w.gems.has(key(x, y));
      const coin = (x, y) => w.coins.has(key(x, y));
      switch (cond) {
        case 'wall_ahead': return solid(...ahead) || (w.doors.has(key(...ahead)) && !w.haveKeys);
        case 'wall_left': { const d = (p.dir + 3) % 4; return solid(p.x + DX[d], p.y + DY[d]); }
        case 'wall_right': { const d = (p.dir + 1) % 4; return solid(p.x + DX[d], p.y + DY[d]); }
        case 'lava_ahead': return w.lava.has(key(...ahead));
        case 'gem_ahead': return scan(p.dir, gem);
        case 'gem_left': return scan((p.dir + 3) % 4, gem);
        case 'gem_right': return scan((p.dir + 1) % 4, gem);
        case 'coin_ahead': return scan(p.dir, coin);
        case 'coin_left': return scan((p.dir + 3) % 4, coin);
        case 'coin_right': return scan((p.dir + 1) % 4, coin);
        case 'on_ice': return w.ice.has(key(p.x, p.y));
        case 'all_coins': return w.coinsGot >= w.coinsTotal;
        case 'flag_ahead': return scan(p.dir, (x, y) => w.flags.has(key(x, y)));
        case 'bug_ahead': { let x = p.x, y = p.y; for (let i = 0; i < 3; i++) { x += DX[p.dir]; y += DY[p.dir]; if (solid(x, y)) return false; if (w.bugs.some((b) => b.x === x && b.y === y)) return true; } return false; }
        case 'door_ahead': return w.doors.has(key(...ahead));
        case 'crate_ahead': return w.crates.has(key(...ahead));
        case 'have_key': return w.haveKeys > 0;
        case 'all_gems': return w.gemsGot >= w.gemsTotal;
        default: return false;
      }
    },

    status(w) { return w.result; },
    end(w) { return w.result || { lose: true, msg: 'Your program stopped before the goal. Try a Forever loop!' }; },

    hud(w) {
      const out = [];
      if (w.gemsTotal) out.push({ icon: '💎', val: `${w.gemsGot}/${w.gemsTotal}`, lbl: 'Gems', color: '#67e8f9' });
      if (w.coinsTotal) out.push({ icon: '🪙', val: `${w.coinsGot}/${w.coinsTotal}`, lbl: 'Coins', color: '#fde047' });
      out.push({ icon: '❤️', val: `${w.lives}`, lbl: 'Lives', color: '#f87171' });
      if (w.arena.time) out.push({ icon: '⏱', val: `${Math.ceil(w.timeLeft ?? w.arena.time)}s`, lbl: 'Time', color: '#93c5fd' });
      else out.push({ icon: '🔑', val: `${w.haveKeys}`, lbl: 'Keys', color: '#fde047' });
      return out;
    },
    progress(w) {
      if (w.arena.goal === 'coins') return { current: w.coinsGot, target: w.coinsTotal, label: 'coins collected', pct: Math.round((w.coinsGot / Math.max(1, w.coinsTotal)) * 100) };
      if (w.arena.goal === 'flag') return { current: w.result?.win ? 1 : 0, target: 1, label: 'flag reached', pct: w.result?.win ? 100 : 0 };
      return { current: w.gemsGot, target: w.gemsTotal, label: 'gems collected', pct: Math.round((w.gemsGot / Math.max(1, w.gemsTotal)) * 100) };
    },
  };
}

function inside(w, x, y) { return x >= 0 && y >= 0 && x < w.W && y < w.H; }

function bugCanEnter(w, x, y) {
  const k = key(x, y);
  return inside(w, x, y) && !w.walls.has(k) && !w.lava.has(k) && !w.crates.has(k) && !w.doors.has(k);
}

function hurt(w, why) {
  if (w.safeT > 0) return;
  w.lives--;
  w.pops.push({ x: w.p.x, y: w.p.y, life: 1, kind: 'hurt' });
  if (w.lives <= 0) { w.result = { lose: true, msg: `${why} No lives left — try again!` }; return; }
  w.safeT = 1.5;
  w.p.x = w.start[0]; w.p.y = w.start[1]; w.p.px = w.p.x; w.p.py = w.p.y; w.p.dir = w.startDir; w.anim = 1;
}

function stepRobot(w, dist, depth = 0) {
  const p = w.p;
  const tx = p.x + DX[p.dir] * dist, ty = p.y + DY[p.dir] * dist;
  const tk = key(tx, ty);
  if (depth === 0) w.jumpT = dist > 1 ? 1 : 0;
  const bonk = () => { w.bumps++; w.pops.push({ x: p.x, y: p.y, life: 0.4, kind: 'bonk' }); if (w.bumps > 400) w.result = { lose: true, msg: 'Your robot keeps bumping into walls. Check "wall ahead"!' }; };
  if (!inside(w, tx, ty) || w.walls.has(tk)) return bonk();
  if (dist > 1) {
    const mid = key(p.x + DX[p.dir], p.y + DY[p.dir]);
    if (w.walls.has(mid) || w.doors.has(mid) || w.crates.has(mid)) return bonk();
  }
  if (w.doors.has(tk)) {
    if (!w.haveKeys) return bonk();
    w.haveKeys--; w.doors.delete(tk); w.pops.push({ x: tx, y: ty, life: 0.6, kind: 'door' });
  }
  if (w.crates.has(tk)) {
    if (dist > 1) return bonk();
    const bx = tx + DX[p.dir], by = ty + DY[p.dir], bk = key(bx, by);
    if (!inside(w, bx, by) || w.walls.has(bk) || w.crates.has(bk) || w.doors.has(bk) || w.gems.has(bk) || w.flags.has(bk) || w.coins.has(bk)) return bonk();
    w.crates.delete(tk);
    if (w.lava.has(bk)) { w.lava.delete(bk); w.pops.push({ x: bx, y: by, life: 0.6, kind: 'bridge' }); }
    else w.crates.add(bk);
  }
  if (depth === 0) { p.px = p.x; p.py = p.y; }
  p.x = tx; p.y = ty; w.anim = 0;
  land(w, depth);
}

/** Everything that happens when the robot arrives on a square. */
function land(w, depth) {
  const p = w.p;
  const k = key(p.x, p.y);
  if (w.lava.has(k)) { hurt(w, 'Ouch, lava!'); return; }
  if (w.gems.delete(k)) { w.gemsGot++; w.pops.push({ x: p.x, y: p.y, life: 0.6, kind: 'gem' }); }
  if (w.coins.delete(k)) { w.coinsGot++; w.pops.push({ x: p.x, y: p.y, life: 0.6, kind: 'coin' }); }
  if (w.keys.delete(k)) { w.haveKeys++; w.pops.push({ x: p.x, y: p.y, life: 0.6, kind: 'key' }); }
  const pi = w.portals.findIndex(([x, y]) => x === p.x && y === p.y);
  if (pi >= 0 && w.portals.length > 1 && depth < 6) {
    const [ox, oy] = w.portals[pi ^ 1] || w.portals[pi];
    p.x = ox; p.y = oy; p.px = ox; p.py = oy; w.anim = 1;
    w.pops.push({ x: ox, y: oy, life: 0.6, kind: 'portal' });
  }
  if (w.bugs.some((b) => b.x === p.x && b.y === p.y)) { hurt(w, 'A bug got your robot!'); return; }
  if (checkWin(w)) return;
  // Bounce pads launch the robot two squares forward
  if (w.pads.has(key(p.x, p.y)) && depth < 6) {
    w.pops.push({ x: p.x, y: p.y, life: 0.5, kind: 'pad' });
    w.jumpT = 1;
    const before = [p.x, p.y];
    stepRobot(w, 2, depth + 1);
    if (p.x === before[0] && p.y === before[1]) return;
    return;
  }
  // Ice: keep sliding until something stops you
  if (w.ice.has(key(p.x, p.y)) && depth < 30) {
    const nx = p.x + DX[p.dir], ny = p.y + DY[p.dir], nk = key(nx, ny);
    if (inside(w, nx, ny) && !w.walls.has(nk) && !w.crates.has(nk) && !(w.doors.has(nk) && !w.haveKeys)) stepRobot(w, 1, depth + 1);
  }
}

function checkWin(w) {
  const p = w.p;
  const allGems = w.gemsGot >= w.gemsTotal;
  const onFlag = w.flags.has(key(p.x, p.y));
  const g = w.arena.goal;
  if ((g === 'flag' && onFlag) || (g === 'gems' && allGems) || (g === 'both' && allGems && onFlag) || (g === 'coins' && w.coinsGot >= w.coinsTotal)) {
    w.result = { win: true, msg: g === 'gems' ? `All ${w.gemsTotal} gems collected!` : g === 'coins' ? `All ${w.coinsTotal} coins collected!` : `${w.arena.name} complete!` };
    return true;
  }
  if (g === 'both' && onFlag && !allGems) w.pops.push({ x: p.x, y: p.y, life: 1, kind: 'needgems' });
  return false;
}
