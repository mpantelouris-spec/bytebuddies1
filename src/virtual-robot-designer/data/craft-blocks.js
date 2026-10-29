/**
 * Block Crafter — coding blocks, compiler and runtime.
 *
 * Minecraft-style blocks: walk, turn, jump, mine, place, pillar up, pick a
 * hotbar item, craft and smelt, plus sensors ("block ahead is…", "I have…"),
 * loops, if/else, variables and events. The panel is a flat list: a loop or
 * "if" owns the blocks below it until an "End" block; "Else" switches an open
 * "if" to its other branch. Every event runs as its own thread (a generator)
 * that waits for each action to finish, so programs play out step by step.
 */
import { playBeepSound, playScoreSound, playCollisionSound, playWinSound } from '../studio/flappy-bird-audio.js';

export function isCraftCourse(courseKey, arenaType, chassisId = '') {
  const id = typeof courseKey === 'string' ? courseKey.split(':')[0] : '';
  // Expanded modes use IDs like `tier_blockbot_11_...`, while the original
  // Block Crafter modes start with `blockbot_`.
  return arenaType === 'block_craft' || chassisId === 'blockbot' || /(^|_)blockbot_/.test(id);
}

const BLOCK_CHOICES = [
  ['air (nothing)', 'air'], ['a gap (air, lava or water)', 'gap'], ['any ore', 'ore'], ['log (tree)', 'log'], ['leaves', 'leaves'], ['grass', 'grass'], ['dirt', 'dirt'],
  ['stone', 'stone'], ['cobblestone', 'cobblestone'], ['sand', 'sand'], ['sandstone', 'sandstone'], ['snow', 'snow'],
  ['coal ore', 'coal_ore'], ['iron ore', 'iron_ore'], ['diamond ore', 'diamond_ore'], ['lava', 'lava'], ['water', 'water'],
  ['glowstone', 'glowstone'], ['gold block', 'gold_block'], ['bedrock', 'bedrock'], ['obsidian', 'obsidian'],
];
const ITEM_CHOICES = [
  ['log', 'log'], ['planks', 'planks'], ['stick', 'stick'], ['cobblestone', 'cobblestone'], ['dirt', 'dirt'], ['sand', 'sand'],
  ['coal', 'coal'], ['raw iron', 'raw_iron'], ['iron ingot', 'iron_ingot'], ['diamond', 'diamond'],
  ['crafting table', 'crafting_table'], ['furnace', 'furnace'], ['glowstone', 'glowstone'], ['snow', 'snow'], ['netherrack', 'netherrack'],
  ['wooden pickaxe', 'wooden_pickaxe'], ['stone pickaxe', 'stone_pickaxe'], ['iron pickaxe', 'iron_pickaxe'], ['sapling', 'sapling'],
];
const PLACE_CHOICES = [['cobblestone', 'cobblestone'], ['planks', 'planks'], ['dirt', 'dirt'], ['log', 'log'], ['sand', 'sand'], ['sandstone', 'sandstone'], ['snow', 'snow'], ['glowstone', 'glowstone'], ['netherrack', 'netherrack'], ['crafting table', 'crafting_table'], ['furnace', 'furnace']];
const RECIPE_CHOICES = [
  ['4 planks (1 log)', 'planks'], ['4 sticks (2 planks)', 'sticks'], ['crafting table (4 planks)', 'crafting_table'],
  ['wooden pickaxe', 'wooden_pickaxe'], ['stone pickaxe', 'stone_pickaxe'], ['furnace (8 cobblestone)', 'furnace'],
  ['iron pickaxe', 'iron_pickaxe'], ['diamond pickaxe', 'diamond_pickaxe'],
];
const conditionParams = (a = 'ahead', b = 'log', n = 1, op = 'is') => [
  { key: 'a', type: 'dropdown', label: '', def: a, options: [['block ahead', 'ahead'], ['ground ahead', 'ahead_down'], ['block below me', 'below'], ['block above me', 'above'], ['how many I have of', 'have']] },
  { key: 'op', type: 'dropdown', label: '', def: op, options: [['is', 'is'], ['is not', 'not'], ['≥ (at least)', 'ge'], ['< (fewer than)', 'lt']] },
  { key: 'b', type: 'dropdown', label: '', def: b, options: [...BLOCK_CHOICES, ...ITEM_CHOICES.filter(([, v]) => !BLOCK_CHOICES.some(([, w]) => w === v))] },
  { key: 'n', label: '', def: n },
];

export const CRAFT_STARTER_SCRIPT = [
  { id: 'when_start', label: 'When START clicked', icon: '▶️', catKey: 'Events', paramValues: {} },
  { id: 'walk', label: 'Walk forward', icon: '🚶', catKey: 'Movement', paramValues: { steps: 2 } },
  { id: 'mine_ahead', label: 'Mine block ahead', icon: '⛏️', catKey: 'Mining', paramValues: {} },
];

export const CRAFT_BLOCK_LIBRARY = {
  Events: {
    label: 'Events', color: '#ef4444', icon: '⚡',
    blocks: [
      { id: 'when_start', label: 'When START clicked', icon: '▶️' },
      { id: 'when_key', label: 'When key pressed', icon: '⌨️', params: [{ key: 'key', type: 'dropdown', label: '', def: 'space', options: [['space', 'space'], ['up arrow', 'up'], ['down arrow', 'down'], ['left arrow', 'left'], ['right arrow', 'right']] }] },
      { id: 'when_timer', label: 'When timer reaches', icon: '⏱️', params: [{ key: 'seconds', label: 's', def: 5 }] },
      { id: 'when_block_mined', label: 'When a block is mined', icon: '⛏️' },
      { id: 'when_block_placed', label: 'When a block is placed', icon: '🧱' },
      { id: 'when_crafted', label: 'When I craft something', icon: '🛠️' },
      { id: 'when_respawn', label: 'When I respawn', icon: '💫' },
      { id: 'when_goal', label: 'When goal complete', icon: '🏆' },
    ],
  },
  Movement: {
    label: 'Movement', color: '#3b82f6', icon: '🚶',
    blocks: [
      { id: 'walk', label: 'Walk forward', icon: '🚶', params: [{ key: 'steps', label: '', def: 1 }] },
      { id: 'walk_back', label: 'Walk backward', icon: '🔙', params: [{ key: 'steps', label: '', def: 1 }] },
      { id: 'walk_until', label: 'Walk forward until', icon: '🚶', params: conditionParams('ahead', 'log') },
      { id: 'turn_left', label: 'Turn left', icon: '↺' },
      { id: 'turn_right', label: 'Turn right', icon: '↻' },
      { id: 'turn_around', label: 'Turn around', icon: '🔄' },
      { id: 'jump', label: 'Jump', icon: '⤴️' },
    ],
  },
  Mining: {
    label: 'Mining', color: '#78716c', icon: '⛏️',
    blocks: [
      { id: 'mine_ahead', label: 'Mine block ahead', icon: '⛏️' },
      { id: 'mine_up', label: 'Mine block above', icon: '⬆️' },
      { id: 'mine_down', label: 'Dig down', icon: '⬇️' },
      { id: 'dig_tunnel', label: 'Dig tunnel', icon: '🕳️', params: [{ key: 'steps', label: '', def: 3 }] },
      { id: 'chop_tree', label: 'Chop whole tree', icon: '🪓' },
      { id: 'chop_all', label: 'Chop all trees', icon: '🌲' },
    ],
  },
  Building: {
    label: 'Building', color: '#b45309', icon: '🧱',
    blocks: [
      { id: 'select_item', label: 'Hold block', icon: '✋', params: [{ key: 'item', type: 'dropdown', label: '', def: 'cobblestone', options: PLACE_CHOICES }] },
      { id: 'place_ahead', label: 'Place block ahead', icon: '🧱' },
      { id: 'pillar_up', label: 'Pillar up (place below me)', icon: '🗼' },
      { id: 'build_bridge', label: 'Build bridge', icon: '🌉', params: [{ key: 'steps', label: '', def: 3 }] },
      { id: 'build_house', label: 'Build a house', icon: '🏠' },
      { id: 'build_tower', label: 'Build a tower', icon: '🗼', params: [{ key: 'height', label: 'high', def: 5 }] },
      { id: 'plant_tree', label: 'Plant a tree', icon: '🌱' },
    ],
  },
  Crafting: {
    label: 'Crafting', color: '#a16207', icon: '🛠️',
    blocks: [
      { id: 'craft', label: 'Craft', icon: '🛠️', params: [{ key: 'recipe', type: 'dropdown', label: '', def: 'planks', options: RECIPE_CHOICES }] },
      { id: 'smelt_iron', label: 'Smelt iron (furnace)', icon: '🔥' },
    ],
  },
  Sensors: {
    label: 'Sensors', color: '#10b981', icon: '👁',
    blocks: [
      { id: 'say_ahead', label: 'Say what\'s ahead', icon: '👀' },
      { id: 'say_below', label: 'Say what\'s below', icon: '⬇️' },
      { id: 'say_above', label: 'Say what\'s above', icon: '⬆️' },
      { id: 'say_position', label: 'Say my position', icon: '📍' },
      { id: 'say_count', label: 'Say how many I have', icon: '🎒', params: [{ key: 'item', type: 'dropdown', label: '', def: 'log', options: ITEM_CHOICES }] },
    ],
  },
  Logic: {
    label: 'Logic', color: '#8b5cf6', icon: '🧠',
    blocks: [
      { id: 'if_then', label: 'If', icon: '❓', params: conditionParams() },
      { id: 'else', label: 'Else', icon: '↔️' },
      { id: 'end', label: 'End if / loop', icon: '⏹' },
    ],
  },
  Loops: {
    label: 'Loops', color: '#f59e0b', icon: '🔁',
    blocks: [
      { id: 'repeat', label: 'Repeat', icon: '🔁', params: [{ key: 'times', label: '×', def: 3 }] },
      { id: 'repeat_until_goal', label: 'Repeat until goal complete', icon: '🔂' },
      { id: 'repeat_while', label: 'Repeat while', icon: '🔄', params: conditionParams('ahead', 'air') },
      { id: 'repeat_until', label: 'Repeat until', icon: '🔂', params: conditionParams('have', 'log', 3, 'ge') },
      { id: 'forever', label: 'Forever loop', icon: '∞' },
      { id: 'end', label: 'End loop / if', icon: '⏹' },
      { id: 'wait', label: 'Wait', icon: '⏸️', params: [{ key: 'seconds', label: 's', def: 1 }] },
      { id: 'wait_until', label: 'Wait until', icon: '⏳', params: conditionParams('ahead', 'air') },
      { id: 'break_loop', label: 'Break out of loop', icon: '↩️' },
    ],
  },
  Variables: {
    label: 'Variables', color: '#06b6d4', icon: '📦',
    blocks: [
      { id: 'set_var', label: 'Set variable to', icon: '=', params: [{ key: 'name', label: '', def: 'myVar' }, { key: 'value', label: '', def: 0 }] },
      { id: 'change_var', label: 'Change variable by', icon: '+', params: [{ key: 'name', label: '', def: 'myVar' }, { key: 'value', label: '', def: 1 }] },
      { id: 'say_var', label: 'Say variable', icon: '💬', params: [{ key: 'name', label: '', def: 'myVar' }] },
    ],
  },
  GameControl: {
    label: 'Game Control', color: '#ec4899', icon: '🎮',
    blocks: [
      { id: 'say', label: 'Say message', icon: '💬', params: [{ key: 'text', label: '', def: 'Hello!' }] },
      { id: 'play_sound', label: 'Play sound', icon: '🔊', params: [{ key: 'sound', type: 'dropdown', label: '', def: 'pop', options: [['pop', 'pop'], ['ding', 'ding'], ['bonk', 'bonk'], ['win', 'win']] }] },
      { id: 'restart', label: 'Restart world', icon: '🔄' },
    ],
  },
};

// ─── Compiler ───────────────────────────────────────────────────────────────
const cond = (pv = {}) => ({ where: pv.a || 'ahead', op: pv.op || (pv.a === 'have' ? 'ge' : 'is'), what: pv.b || 'air', n: Number(pv.n ?? 1) || 1 });

function compileBlock(b) {
  const pv = b.paramValues || {};
  const id = b._uid || b.id;
  const n = (k, d) => Math.max(1, Math.min(50, Number(pv[k] ?? d) || d));
  switch (b.id) {
    case 'walk': return { op: 'act', act: ['walk', n('steps', 1)], id };
    case 'walk_back': return { op: 'act', act: ['walk_back', n('steps', 1)], id };
    case 'walk_until': return { op: 'until', cond: cond(pv), body: [{ op: 'act', act: ['walk', 1], id }], id };
    // The tree in front, or the nearest tree it can walk to: every log and its leaves
    case 'chop_tree': return { op: 'act', act: ['chop_tree'], id };
    // Keep chopping until there are no trees left
    case 'chop_all': return { op: 'until', cond: { where: 'trees', op: 'is', what: 'none', n: 1 }, body: [{ op: 'act', act: ['chop_tree'], id }], id };
    case 'build_house': return { op: 'act', act: ['build_house'], id };
    case 'build_tower': return { op: 'act', act: ['build_tower', Math.max(2, Math.min(12, Number(pv.height ?? 5) || 5))], id };
    case 'plant_tree': return { op: 'act', act: ['plant_tree'], id };
    case 'turn_left': return { op: 'act', act: ['turn', 1], id };
    case 'turn_right': return { op: 'act', act: ['turn', -1], id };
    case 'turn_around': return { op: 'act', act: ['turn', 2], id };
    case 'jump': return { op: 'act', act: ['jump'], id };
    case 'mine_ahead': return { op: 'act', act: ['mine', 'ahead'], id };
    case 'mine_up': return { op: 'act', act: ['mine', 'up'], id };
    case 'mine_down': return { op: 'act', act: ['mine', 'down'], id };
    case 'dig_tunnel': return { op: 'repeat', times: n('steps', 3), body: [{ op: 'act', act: ['mine', 'ahead'], id }, { op: 'act', act: ['walk', 1], id }], id };
    case 'select_item': return { op: 'act', act: ['select', pv.item || 'cobblestone'], id };
    case 'place_ahead': return { op: 'act', act: ['place', 'ahead'], id };
    case 'pillar_up': return { op: 'act', act: ['place', 'down'], id };
    case 'build_bridge': return { op: 'repeat', times: n('steps', 3), body: [{ op: 'act', act: ['place', 'ahead'], id }, { op: 'act', act: ['walk', 1], id }], id };
    case 'craft': return { op: 'act', act: ['craft', pv.recipe || 'planks'], id };
    case 'smelt_iron': return { op: 'act', act: ['craft', 'iron_ingot'], id };
    case 'say_ahead': return { op: 'say_block', where: 'ahead', id };
    case 'say_below': return { op: 'say_block', where: 'below', id };
    case 'say_above': return { op: 'say_block', where: 'above', id };
    case 'say_position': return { op: 'say_position', id };
    case 'say_count': return { op: 'say_count', item: pv.item || 'log', id };
    case 'wait': return { op: 'wait', seconds: Math.max(0, Number(pv.seconds ?? 1)), id };
    case 'wait_until': return { op: 'wait_until', cond: cond(pv), id };
    case 'break_loop': return { op: 'break', id };
    case 'set_var': return { op: 'var_set', name: String(pv.name || 'myVar'), value: Number(pv.value) || 0, id };
    case 'change_var': return { op: 'var_change', name: String(pv.name || 'myVar'), delta: Number(pv.value ?? 1) || 0, id };
    case 'say_var': return { op: 'say_var', name: String(pv.name || 'myVar'), id };
    case 'say': return { op: 'act', act: ['say', String(pv.text ?? 'Hello!')], id };
    case 'play_sound': return { op: 'sound', sound: pv.sound || 'pop', id };
    case 'restart': return { op: 'restart', id };
    default: return null;
  }
}

const HATS = {
  when_start: 'start', when_spacebar: 'key:space', when_timer: 'timer', when_key: 'key',
  when_block_mined: 'block_mined', when_block_placed: 'block_placed', when_crafted: 'crafted',
  when_respawn: 'respawn', when_goal: 'goal',
};

function compileSection(blocks) {
  const root = [];
  const stack = [{ list: root, kind: 'root' }];
  const top = () => stack[stack.length - 1];
  for (const b of blocks) {
    const id = b._uid || b.id;
    const pv = b.paramValues || {};
    if (['repeat', 'forever', 'repeat_until_goal', 'repeat_while', 'repeat_until'].includes(b.id)) {
      while (top().kind === 'loop') stack.pop(); // a loop after an open loop is its sibling
      const node = b.id === 'repeat' ? { op: 'repeat', times: Math.max(1, Math.min(100, Number(pv.times) || 3)), body: [], id }
        : b.id === 'forever' ? { op: 'forever', body: [], id }
          : b.id === 'repeat_while' ? { op: 'while', cond: cond(pv), body: [], id }
            : b.id === 'repeat_until' ? { op: 'until', cond: cond(pv), body: [], id }
            : { op: 'until_goal', body: [], id };
      top().list.push(node);
      stack.push({ list: node.body, kind: 'loop', node });
      continue;
    }
    if (b.id === 'if_then') {
      const node = { op: 'if', cond: cond(pv), body: [], elseBody: [], id };
      top().list.push(node);
      stack.push({ list: node.body, kind: 'if', node });
      continue;
    }
    if (b.id === 'else') {
      const frame = [...stack].reverse().find((f) => f.kind === 'if');
      if (frame) { while (top() !== frame) stack.pop(); frame.list = frame.node.elseBody; }
      continue;
    }
    if (b.id === 'end') { if (stack.length > 1) stack.pop(); continue; }
    const s = compileBlock(b);
    if (s) top().list.push(s);
  }
  return root;
}

export function compileCraftScript(script) {
  const program = { handlers: {}, timers: [], keys: [] };
  const sections = [{ event: 'start', blocks: [] }];
  for (const b of script || []) {
    if (HATS[b.id]) {
      const pv = b.paramValues || {};
      let event = HATS[b.id];
      if (event === 'key') event = `key:${pv.key || 'space'}`;
      if (event === 'timer') event = `timer:${Math.max(0, Number(pv.seconds ?? 5))}`;
      sections.push({ event, blocks: [] });
      continue;
    }
    sections[sections.length - 1].blocks.push(b);
  }
  for (const sec of sections) {
    const stmts = compileSection(sec.blocks);
    if (!stmts.length) continue;
    if (sec.event.startsWith('timer:')) program.timers.push({ seconds: Number(sec.event.slice(6)), stmts });
    else if (sec.event.startsWith('key:')) program.keys.push({ key: sec.event.slice(4), stmts });
    else (program.handlers[sec.event] ||= []).push(...stmts);
  }
  return program;
}

export function craftProgramHasContent(p) {
  return !!p && (p.timers?.length || p.keys?.length || Object.values(p.handlers || {}).some((h) => h?.length));
}

// ─── Runtime ────────────────────────────────────────────────────────────────
const BREAK = Symbol('break');
const KEY_CODES = { space: 'Space', up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };

export class CraftBlockRuntime {
  constructor(scene, onBlockActive) {
    this.scene = scene;
    this.onBlockActive = onBlockActive;
    this.load(null);
    scene.userData.craft?.onEvent((type) => {
      if (this.running) this.spawn(this.program.handlers[type]);
    });
  }

  get craft() { return this.scene.userData.craft; }

  load(program) {
    this.program = program || { handlers: {}, timers: [], keys: [] };
    this.threads = [];
    this.vars = {};
    this.clock = 0;
    this.timersFired = new Set();
    this.running = false;
    this._idx = 0;
    this.detachKeys();
  }

  hasKeyHandlers() { return this.program.keys.length > 0; }

  start() {
    this.running = true;
    if (this.program.keys.length && typeof window !== 'undefined') {
      this._onKey = (e) => {
        if (!this.scene.userData.craftSimActive) return;
        const hits = this.program.keys.filter((k) => KEY_CODES[k.key] === e.code);
        if (!hits.length) return;
        e.preventDefault();
        hits.forEach((k) => this.spawn(k.stmts));
      };
      window.addEventListener('keydown', this._onKey);
    }
    this.spawn(this.program.handlers.start);
  }

  detachKeys() {
    if (this._onKey) window.removeEventListener('keydown', this._onKey);
    this._onKey = null;
  }

  test(c) {
    if (!c) return false;
    if (c.where === 'have') {
      const have = this.craft.count(c.what);
      return c.op === 'lt' || c.op === 'not' ? have < c.n : have >= c.n;
    }
    const hit = this.craft.is(c.where, c.what);
    return c.op === 'not' || c.op === 'lt' ? !hit : hit;
  }

  highlight(id, label) { if (id) this.onBlockActive?.(this._idx++, label || '', id); }

  * act(stmt) {
    while (this.craft.busy()) yield 0; // one action at a time, whichever script asks
    this.highlight(stmt.id, stmt.act[0]);
    const d = this.craft.act(...stmt.act);
    yield d;
  }

  * run(stmts, depth = 0) {
    if (!stmts || depth > 40) return undefined;
    for (const s of stmts) {
      switch (s.op) {
        case 'act': yield* this.act(s); break;
        case 'break': this.highlight(s.id, 'break'); return BREAK;
        case 'wait': this.highlight(s.id, 'wait'); yield s.seconds; break;
        case 'wait_until':
          this.highlight(s.id, 'wait until');
          for (let g = 0; !this.test(s.cond) && g < 36000; g++) yield 0;
          break;
        case 'if':
          this.highlight(s.id, 'if');
          if ((yield* this.run(this.test(s.cond) ? s.body : s.elseBody, depth + 1)) === BREAK) return BREAK;
          break;
        case 'repeat':
          for (let i = 0; i < s.times; i++) if ((yield* this.run(s.body, depth + 1)) === BREAK) break;
          break;
        case 'while':
          for (let g = 0; this.test(s.cond) && g < 2000; g++) {
            if ((yield* this.run(s.body, depth + 1)) === BREAK) break;
            yield 0;
          }
          break;
        case 'until':
          for (let g = 0; !this.test(s.cond) && g < 2000; g++) {
            if ((yield* this.run(s.body, depth + 1)) === BREAK) break;
            yield 0;
          }
          break;
        case 'seq':
          if ((yield* this.run(s.body, depth + 1)) === BREAK) return BREAK;
          break;
        case 'say_position': {
          this.highlight(s.id, 'position');
          const st = this.craft.state();
          const dirs = ['south', 'east', 'north', 'west'];
          this.craft.say(`I'm at x ${st.x}, y ${st.y}, z ${st.z}, facing ${dirs[st.dir]}`);
          yield 0.4;
          break;
        }
        case 'until_goal':
          for (let g = 0; !this.craft.goalDone() && g < 5000; g++) {
            if ((yield* this.run(s.body, depth + 1)) === BREAK) break;
            yield 0;
          }
          break;
        case 'forever':
          for (;;) {
            if ((yield* this.run(s.body, depth + 1)) === BREAK) break;
            yield 0;
          }
          break;
        case 'say_block': {
          this.highlight(s.id, 'look');
          const t = this.craft.blockAt(s.where);
          this.craft.say(`${s.where === 'below' ? 'Below me' : s.where === 'above' ? 'Above me' : 'Ahead'}: ${t.replace(/_/g, ' ')}`);
          yield 0.4;
          break;
        }
        case 'say_count':
          this.highlight(s.id, 'count');
          this.craft.say(`I have ${this.craft.count(s.item)} ${s.item.replace(/_/g, ' ')}`);
          yield 0.4;
          break;
        case 'var_set': this.highlight(s.id, 'set'); this.vars[s.name] = s.value; break;
        case 'var_change': this.highlight(s.id, 'change'); this.vars[s.name] = (Number(this.vars[s.name]) || 0) + s.delta; break;
        case 'say_var': this.highlight(s.id, 'say'); this.craft.say(`${s.name} = ${Number(this.vars[s.name]) || 0}`); yield 0.4; break;
        case 'sound':
          this.highlight(s.id, 'sound');
          ({ pop: playBeepSound, ding: playScoreSound, bonk: playCollisionSound, win: playWinSound }[s.sound] || playBeepSound)();
          break;
        case 'restart':
          this.highlight(s.id, 'restart');
          this.craft.reset();
          yield 0.2;
          break;
        default: break;
      }
    }
    return undefined;
  }

  spawn(stmts) {
    if (!stmts?.length || this.threads.length >= 30) return;
    this.threads.push({ gen: this.run(stmts), wakeAt: -1 });
  }

  tick(dt) {
    if (!this.running) return;
    this.clock += Math.min(0.1, dt || 0);
    this.program.timers.forEach((t, i) => {
      if (!this.timersFired.has(i) && this.clock >= t.seconds) { this.timersFired.add(i); this.spawn(t.stmts); }
    });
    for (let i = 0; i < this.threads.length; i++) {
      const th = this.threads[i];
      if (th.wakeAt > this.clock) continue;
      const r = th.gen.next();
      if (r.done) { this.threads.splice(i, 1); i--; continue; }
      th.wakeAt = this.clock + Math.max(0, Number(r.value) || 0) + (r.value ? 0 : 1e-6);
    }
  }
}
