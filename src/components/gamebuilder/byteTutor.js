/**
 * Byte — the Game Builder's coding buddy.
 *
 * Reads a child's real scripts (Blockly XML), explains them back in plain words and spots
 * common beginner bugs. It coaches with questions and nudges, never by writing the code:
 * each tip has a ladder — a question first, then a bigger hint, then where to look.
 * Everything runs in the browser; no code or child data leaves the device.
 */

/* ─── Parse Blockly XML into script trees ─── */

function parseBlock(el) {
  if (!el || (el.tagName !== 'block' && el.tagName !== 'shadow')) return null;
  const node = { type: el.getAttribute('type'), fields: {}, inputs: {}, stacks: {} };
  for (const child of el.children) {
    const name = child.getAttribute('name');
    if (child.tagName === 'field') node.fields[name] = child.textContent;
    else if (child.tagName === 'value') {
      // a real block wins over the shadow (the number typed into the slot)
      const b = [...child.children].find((c) => c.tagName === 'block') || [...child.children].find((c) => c.tagName === 'shadow');
      if (b) node.inputs[name] = parseBlock(b);
    } else if (child.tagName === 'statement') {
      const b = [...child.children].find((c) => c.tagName === 'block');
      node.stacks[name] = b ? parseChain(b) : [];
    }
  }
  return node;
}

function parseChain(el) {
  const out = [];
  let cur = el;
  while (cur) {
    const node = parseBlock(cur);
    if (node) out.push(node);
    const next = [...cur.children].find((c) => c.tagName === 'next');
    cur = next ? [...next.children].find((c) => c.tagName === 'block') : null;
  }
  return out;
}

/** Top-level scripts of a workspace: [[block, block, …], …] */
export function parseScripts(xml) {
  if (!xml || typeof DOMParser === 'undefined') return [];
  try {
    const doc = new DOMParser().parseFromString(String(xml), 'text/xml');
    const root = doc.documentElement;
    if (!root || root.getElementsByTagName('parsererror').length) return [];
    return [...root.children].filter((c) => c.tagName === 'block').map(parseChain);
  } catch {
    return [];
  }
}

/** Every block in a script, depth first, with how many loops/ifs it sits inside. */
function walk(blocks, visit, ctx = { loops: [], ifs: 0 }) {
  blocks.forEach((b) => {
    visit(b, ctx);
    Object.values(b.inputs).forEach((inp) => walk([inp], visit, ctx));
    const loopy = LOOPS.has(b.type);
    Object.values(b.stacks).forEach((stack) => walk(stack, visit, {
      loops: loopy ? [...ctx.loops, b.type] : ctx.loops,
      ifs: ctx.ifs + (IFS.has(b.type) ? 1 : 0),
    }));
  });
}

const all = (scripts) => {
  const out = [];
  scripts.forEach((s) => walk(s, (b, ctx) => out.push({ b, ctx, script: s })));
  return out;
};

/* ─── Block families ─── */

const HATS = new Set(['event_whenflagclicked', 'event_whenkeypressed', 'event_whenthisspriteclicked',
  'event_whenbroadcastreceived', 'event_whenreceivemessage', 'control_start_as_clone', 'event_whenbackdropswitchesto',
  'bb_event_start', 'bb_event_keypress', 'bb_game_when_level']);
const LOOPS = new Set(['control_forever', 'control_repeat', 'control_repeatuntil', 'bb_loop_forever', 'bb_loop_repeat']);
const IFS = new Set(['control_if', 'control_if_else', 'bb_logic_if']);
const MOVES = new Set(['motion_movesteps', 'motion_changex', 'motion_changey', 'motion_turnright', 'motion_turnleft',
  'motion_glide', 'motion_glideto', 'motion_setx', 'motion_sety', 'motion_gotoxy', 'motion_goto']);
const STEP_MOVES = new Set(['motion_movesteps', 'motion_changex', 'motion_changey', 'motion_turnright', 'motion_turnleft']);
const RECEIVE = new Set(['event_whenbroadcastreceived', 'event_whenreceivemessage']);
const firstField = (b) => Object.values(b.fields)[0] || '';
const keyOf = (b) => String(b.fields.KEY || b.fields.KEY_OPTION || firstField(b) || 'space').toLowerCase();
const varOf = (b) => String(b.fields.VARIABLE || b.fields.NAME || firstField(b) || '').trim();
const msgOf = (b) => String(b.fields.MESSAGE || b.fields.BROADCAST_OPTION || firstField(b) || '').trim().toLowerCase();
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : null);

/* ─── Plain-language reading of a script ─── */

const KEY_NAMES = { space: 'SPACE', up: '↑', down: '↓', left: '←', right: '→', 'up arrow': '↑', 'down arrow': '↓', 'left arrow': '←', 'right arrow': '→' };

function say(b) {
  const f = b.fields;
  const v = (k, d = '?') => (b.inputs[`${k}_SLOT`] ? reporter(b.inputs[`${k}_SLOT`]) : (f[k] ?? d));
  switch (b.type) {
    case 'event_whenflagclicked': return 'When ▶ is clicked';
    case 'event_whenkeypressed': return `When the ${KEY_NAMES[keyOf(b)] || keyOf(b)} key is pressed`;
    case 'event_whenthisspriteclicked': return 'When this sprite is clicked';
    case 'event_whenbroadcastreceived': case 'event_whenreceivemessage': return `When the message "${msgOf(b)}" arrives`;
    case 'control_start_as_clone': return 'When a new clone appears';
    case 'motion_movesteps': return `move ${v('STEPS')} steps`;
    case 'motion_changex': return `move sideways by ${v('DX')}`;
    case 'motion_changey': return `move up/down by ${v('DY')}`;
    case 'motion_setx': return `jump to x = ${v('X')}`;
    case 'motion_sety': return `jump to y = ${v('Y')}`;
    case 'motion_gotoxy': return `go to x: ${v('X')}, y: ${v('Y')}`;
    case 'motion_goto': return `go to ${f.TARGET === 'random' ? 'a random spot' : f.TARGET || 'somewhere'}`;
    case 'motion_glideto': return `glide to x: ${f.X}, y: ${f.Y}`;
    case 'motion_turnright': return `turn right ${v('DEGREES')}°`;
    case 'motion_turnleft': return `turn left ${v('DEGREES')}°`;
    case 'motion_pointindirection': return `point in direction ${v('DIRECTION')}`;
    case 'motion_pointtowards': return `point towards ${f.TARGET || f.TOWARDS || 'something'}`;
    case 'motion_ifonedgebounce': return 'bounce if it touches the edge';
    case 'looks_say': return `say "${v('MESSAGE')}"`;
    case 'looks_sayforsecs': return `say "${v('MESSAGE')}" for ${v('SECS')} seconds`;
    case 'looks_show': return 'appear';
    case 'looks_hide': return 'disappear';
    case 'looks_nextcostume': return 'change to the next costume';
    case 'control_wait': return `wait ${v('DURATION')} seconds`;
    case 'control_forever': return 'repeat forever';
    case 'control_repeat': return `repeat ${v('TIMES')} times`;
    case 'control_repeatuntil': return `repeat until ${cond(b)}`;
    case 'control_waituntil': return `wait until ${cond(b)}`;
    case 'control_if': return `if ${cond(b)}`;
    case 'control_if_else': return `if ${cond(b)} (otherwise…)`;
    case 'control_create_clone': return `make a clone of ${f.CLONE_OPTION === 'myself' || !f.CLONE_OPTION ? 'itself' : f.CLONE_OPTION}`;
    case 'control_delete_this_clone': return 'delete this clone';
    case 'control_stop': return 'stop everything';
    case 'data_setvariableto': return `set ${varOf(b)} to ${b.inputs.VALUE ? reporter(b.inputs.VALUE) : '?'}`;
    case 'data_changevariableby': return `change ${varOf(b)} by ${b.inputs.VALUE ? reporter(b.inputs.VALUE) : '?'}`;
    case 'sensing_askandwait': return `ask "${f.QUESTION}" and wait for an answer`;
    case 'event_broadcast': return `send the message "${msgOf(b)}"`;
    case 'bb_game_score_add': return `add ${f.AMOUNT} to the score`;
    case 'bb_game_score_set': return `set the score to ${f.VALUE}`;
    case 'bb_game_set_lives': return `set lives to ${f.VALUE}`;
    case 'bb_game_lose_life': return 'lose a life';
    case 'bb_game_win': return 'win the game';
    case 'bb_game_over': return 'end the game (game over)';
    case 'bb_game_when_level': return `When level ${f.LEVEL || 1} starts`;
    case 'bb_game_next_level': return 'go to the next level';
    case 'bb_game_goto_level': return `go to level ${v('LEVEL')}`;
    case 'bb_physics_jump': return 'jump';
    case 'bb_physics_gravity': return 'turn on gravity';
    case 'bb_pen_down': return 'put the pen down (start drawing)';
    case 'bb_pen_up': return 'lift the pen (stop drawing)';
    default: return b.type.replace(/^(bb_|motion_|looks_|control_|sensing_|data_|event_|sound_|operator_)/, '').replace(/_/g, ' ');
  }
}

function reporter(b) {
  if (!b) return '?';
  const f = b.fields;
  switch (b.type) {
    case 'math_number': case 'text': return f.NUM ?? f.TEXT ?? '?';
    case 'data_variable': return `(${varOf(b)})`;
    case 'motion_xposition': return '(x position)';
    case 'motion_yposition': return '(y position)';
    case 'motion_direction': return '(direction)';
    case 'sensing_mousex': return '(mouse x)';
    case 'sensing_mousey': return '(mouse y)';
    case 'sensing_answer': return '(answer)';
    case 'sensing_timer': return '(timer)';
    case 'bb_game_level': return '(level)';
    case 'bb_game_score': return '(score)';
    case 'bb_game_lives': return '(lives)';
    case 'operator_random': return `a random number from ${f.FROM} to ${f.TO}`;
    case 'operator_add': return `${side(b, 'NUM1')} ${f.OP === 'subtract' ? '−' : '+'} ${side(b, 'NUM2')}`;
    default: return cond(b);
  }
}
const side = (b, k) => (b.inputs[`${k}_SLOT`] ? reporter(b.inputs[`${k}_SLOT`]) : b.fields[k]);

function cond(b) {
  const c = b.inputs.CONDITION || (b.type.startsWith('sensing_') || b.type.startsWith('operator_') ? b : null);
  if (!c) return '(nothing yet)';
  const f = c.fields;
  switch (c.type) {
    case 'sensing_touchingobject': return `it touches ${/mouse/i.test(f.OBJECT || '') ? 'the mouse pointer' : /edge/i.test(f.OBJECT || '') ? 'the edge' : f.OBJECT || 'something'}`;
    case 'sensing_keypressed': return `the ${KEY_NAMES[keyOf(c)] || keyOf(c)} key is held down`;
    case 'sensing_mousedown': return 'the mouse is pressed';
    case 'operator_gt': return `${side(c, 'OPERAND1')} > ${side(c, 'OPERAND2')}`;
    case 'operator_lt': return `${side(c, 'OPERAND1')} < ${side(c, 'OPERAND2')}`;
    case 'operator_equals': return `${side(c, 'OPERAND1')} = ${side(c, 'OPERAND2')}`;
    case 'operator_and': return 'both things are true';
    case 'operator_or': return 'either thing is true';
    case 'operator_not': return 'something is NOT true';
    default: return c.type.replace(/^(sensing_|operator_)/, '').replace(/_/g, ' ');
  }
}

/** One readable line per block, indented by nesting. */
export function readScript(script) {
  const lines = [];
  const go = (blocks, depth) => blocks.forEach((b) => {
    lines.push({ depth, text: say(b), hat: HATS.has(b.type) });
    if (b.stacks.SUBSTACK) go(b.stacks.SUBSTACK, depth + 1);
    if (b.stacks.SUBSTACK2) { lines.push({ depth, text: 'otherwise:' }); go(b.stacks.SUBSTACK2, depth + 1); }
  });
  go(script, 0);
  return lines;
}

/* ─── Bug spotting: each tip is a ladder of nudges, never the answer ─── */

/**
 * @param {object} p
 * @param {object} p.sprite        the selected sprite { name, blocklyXml }
 * @param {object[]} p.sprites     every sprite in the project
 * @returns {Array<{ id, kind: 'bug'|'idea', title, steps: string[] }>}  bugs first, then ideas
 */
export function findTips({ sprite, sprites = [] }) {
  const tips = [];
  const scripts = parseScripts(sprite?.blocklyXml);
  const names = new Set(sprites.map((s) => s.name));
  const everything = sprites.flatMap((s) => all(parseScripts(s.blocklyXml)).map((x) => ({ ...x, owner: s.name })));
  const mine = all(scripts);
  const add = (id, title, ...steps) => { if (!tips.some((t) => t.id === id)) tips.push({ id, kind: 'bug', title, steps }); };
  const idea = (id, title, ...steps) => { if (!tips.some((t) => t.id === id)) tips.push({ id, kind: 'idea', title, steps }); };

  if (!scripts.length) {
    add('empty', 'This sprite has no code yet',
      'What do you want this sprite to do when the game starts?',
      'Every script needs a starting block. Look in Events for one that starts with "when".',
      'Try "when ▶ clicked", then snap a Motion block underneath it.');
    return tips;
  }

  // Loose blocks with no "when …" hat never run
  scripts.forEach((s) => {
    if (s.length && !HATS.has(s[0].type)) {
      add('no-hat', `"${say(s[0])}" isn't attached to a start block`,
        'How will the computer know WHEN to run these blocks?',
        'Blocks only run when they are joined under a yellow "when …" block from Events.',
        `Drag the "${say(s[0])}" stack up until it clicks under a "when" block.`);
    }
  });

  // Movement that happens once instead of every frame
  scripts.forEach((s) => {
    if (s[0]?.type !== 'event_whenflagclicked') return;
    // A planned route of big moves is fine; one tiny move looks like "nothing happened"
    const topMoves = s.filter((b) => STEP_MOVES.has(b.type));
    const tiny = topMoves.length && topMoves.every((b) => Math.abs(num(firstField(b)) ?? 99) <= 20);
    const hasLoop = s.some((b) => LOOPS.has(b.type));
    if (tiny && !hasLoop) {
      add('moves-once', 'Your sprite moves once, then stops',
        'Watch closely when you press ▶ — does it keep moving, or move just one tiny bit?',
        'A block runs once unless something tells it to repeat. Which Control block repeats things?',
        `Put "${say(topMoves[0])}" inside a "forever" loop.`);
    }
  });

  // Key / touching checks that only happen once
  scripts.forEach((s) => {
    s.forEach((b) => {
      if (!IFS.has(b.type)) return;
      const c = b.inputs.CONDITION;
      if (!c || !['sensing_keypressed', 'sensing_touchingobject', 'sensing_mousedown'].includes(c.type)) return;
      add('if-once', `"if ${cond(b)}" is only checked once`,
        'How many times does the computer look at this "if" — once, or all the time?',
        'An "if" outside a loop checks one time, right when the script starts. Usually the key isn\'t pressed at that exact moment!',
        'Wrap the "if" in a "forever" loop so it keeps checking.');
    });
  });

  // Empty if / loop
  mine.forEach(({ b }) => {
    if ((IFS.has(b.type) || LOOPS.has(b.type)) && !(b.stacks.SUBSTACK || []).length) {
      add(`empty-${b.type}`, `Your "${say(b)}" block is empty`,
        'What should happen inside this block?',
        'Blocks that go INSIDE the mouth of a C-shaped block are the ones it repeats or checks for.',
        'Drag an action block into the gap of the C shape.');
    }
    if (IFS.has(b.type) && !b.inputs.CONDITION) {
      add('if-no-cond', 'An "if" block has nothing in its hexagon slot',
        'If… what? What is the question the sprite is asking?',
        'The pointy hexagon space needs a true/false block, like "touching …?" or "key … pressed?" from Sensing.',
        'Drop a green or blue hexagon block into the "if".');
    }
  });

  // touching a sprite that does not exist
  mine.forEach(({ b }) => {
    if (b.type !== 'sensing_touchingobject') return;
    const t = b.fields.OBJECT;
    if (t && !/^_?(edge|mouse|mouse-pointer|mouse pointer)_?$/i.test(t) && names.size && !names.has(t)) {
      add('touch-missing', `"touching ${t}?" — there's no sprite called ${t}`,
        `Look at your sprite list. Is there one called "${t}"?`,
        'The name in the dropdown has to match a sprite exactly.',
        'Click the dropdown on the "touching" block and choose one of your sprites.');
    }
  });

  // variable changed/used but never set
  const setVars = new Set(everything.filter(({ b }) => b.type === 'data_setvariableto').map(({ b }) => varOf(b)));
  mine.forEach(({ b }) => {
    if (b.type !== 'data_changevariableby') return;
    const v = varOf(b);
    if (v && !setVars.has(v)) {
      add(`var-${v}`, `"${v}" changes, but never gets a starting value`,
        `What number is "${v}" when the game starts? What about the second time you play?`,
        'Without a starting value, the variable keeps whatever it had last game.',
        `Add "set ${v} to …" near the top of a "when ▶ clicked" script.`);
    }
  });

  // clones that do nothing / cloning in a fast loop
  const makesClones = mine.some(({ b }) => b.type === 'control_create_clone' && (!b.fields.CLONE_OPTION || b.fields.CLONE_OPTION === 'myself'));
  const cloneHat = scripts.some((s) => s[0]?.type === 'control_start_as_clone');
  if (makesClones && !cloneHat) {
    add('clone-idle', 'Clones are made, but they don\'t have anything to do',
      'What should each new clone do after it appears?',
      'Clones run the scripts that start with "when I start as a clone".',
      'Add a "when I start as a clone" script that moves or shows the clone.');
  }
  mine.forEach(({ b, script, ctx }) => {
    if (b.type !== 'control_create_clone' || !ctx.loops.includes('control_forever')) return;
    const loop = script.find((x) => x.type === 'control_forever');
    const hasWait = loop && JSON.stringify(loop).includes('control_wait');
    if (!hasWait) {
      add('clone-flood', 'This makes a new clone every single frame',
        'How many clones do you think appear in one second?',
        'A forever loop runs about 60 times a second — that\'s a lot of clones! The game will slow down.',
        'Put a "wait" block in the forever loop, after "create clone".');
    }
  });
  // Clones copy "when key pressed" — every clone fires again (the space-shooter trap)
  const keyClones = scripts.some((s) => s[0]?.type === 'event_whenkeypressed'
    && s.some((b) => b.type === 'control_create_clone' && (!b.fields.CLONE_OPTION || b.fields.CLONE_OPTION === 'myself')));
  if (keyClones) {
    add('key-clone', 'Careful: clones hear key presses too',
      'When you press the key, will only the original make a clone — or will every clone already on screen make one as well?',
      'Every clone runs "when key pressed" scripts, so the number of clones doubles with each press.',
      'Make a different sprite (like the player) "create clone of" this sprite instead of "myself".');
  }

  // hide with no show
  const hides = mine.some(({ b }) => b.type === 'looks_hide');
  const shows = mine.some(({ b }) => b.type === 'looks_show');
  const busy = mine.some(({ b }) => MOVES.has(b.type) || b.type === 'control_create_clone');
  if (hides && !shows && busy) {
    add('hidden', 'Your sprite hides, but never shows again',
      'Can you see the sprite while the game is running?',
      'Once a sprite hides, it stays hidden until a "show" block runs.',
      'Add "show" where the sprite should appear again (often in "when I start as a clone").');
  }

  // messages nobody hears / hats nobody sends
  const sent = new Set(everything.filter(({ b }) => b.type === 'event_broadcast' || b.type === 'event_broadcastandwait').map(({ b }) => msgOf(b)));
  const heard = new Set(everything.filter(({ b }) => RECEIVE.has(b.type)).map(({ b }) => msgOf(b)));
  mine.forEach(({ b }) => {
    if ((b.type === 'event_broadcast' || b.type === 'event_broadcastandwait') && msgOf(b) && !heard.has(msgOf(b))) {
      add(`unheard-${msgOf(b)}`, `Nobody is listening for "${msgOf(b)}"`,
        'Which sprite should react when this message is sent?',
        'A message only does something if a sprite has "when I receive" for it.',
        `Give a sprite a "when I receive ${msgOf(b)}" script.`);
    }
    if (RECEIVE.has(b.type) && msgOf(b) && !sent.has(msgOf(b))) {
      add(`unsent-${msgOf(b)}`, `"when I receive ${msgOf(b)}" never runs`,
        'Which block sends this message?',
        'This script waits for a message that no sprite ever broadcasts.',
        `Add "broadcast ${msgOf(b)}" where it should happen.`);
    }
  });

  // ask without using the answer
  if (mine.some(({ b }) => b.type === 'sensing_askandwait') && !mine.some(({ b }) => b.type === 'sensing_answer')) {
    add('ask-unused', 'You ask a question but never look at the answer',
      'After the player types something, what should happen?',
      'The "answer" block (Sensing) holds what the player typed.',
      'Use "if answer = …" to check what they typed.');
  }

  // go to somewhere off the stage
  mine.forEach(({ b }) => {
    if (b.type !== 'motion_gotoxy') return;
    const x = num(b.fields.X); const y = num(b.fields.Y);
    if ((x !== null && Math.abs(x) > 240) || (y !== null && Math.abs(y) > 180)) {
      add('offstage', `go to x: ${b.fields.X} y: ${b.fields.Y} is off the stage`,
        'Where is the edge of the stage?',
        'The stage goes from x −240 to 240 and y −180 to 180. The middle is 0, 0.',
        'Pick numbers inside those limits.');
    }
  });

  // game with lives but nothing ever loses one
  const setsLives = everything.some(({ b }) => b.type === 'bb_game_set_lives');
  const losesLives = everything.some(({ b }) => b.type === 'bb_game_lose_life');
  if (setsLives && !losesLives && sprite?.name && mine.some(({ b }) => b.type === 'bb_game_set_lives')) {
    idea('lives-unused', 'Idea: make something dangerous',
      'What should be dangerous in your game?',
      'Lives only go down when a "lose a life" block runs.',
      'Use "if touching (enemy)?" → "lose a life".');
  }

  return [...tips.filter((t) => t.kind === 'bug'), ...tips.filter((t) => t.kind === 'idea')];
}

/* ─── "How do I…?" questions ─── */

const TOPICS = [
  { k: /chase|follow me|hunt|enemy|enemies|baddie|ghost/, a: 'To make an enemy chase the player, give the enemy a forever loop with "point towards (Player)" and then "move 2 steps". A bigger number makes it faster — and "if touching Player?" lets it catch you!' },
  { k: /timer|countdown|clock|seconds|time limit/, a: 'Make a variable called "time" and set it to 30 when ▶ is clicked. Then repeat 30 times: wait 1 second, change time by −1. After the repeat, it\'s game over!' },
  { k: /level|stage|scene|world/, a: 'Use the Levels bar under the stage: "+ Add level" gives each level its own backdrop, and you drag sprites to where they start in that level. In code, "next level" moves on (after the last level you win), and "when level 2 starts" runs code for that level.' },
  { k: /faster|speed up|harder/, a: 'Use a variable for speed, like "speed". Move by (speed) instead of a fixed number, and "change speed by 1" each time the player scores — the game gets harder as you play.' },
  { k: /health|hearts|lives/, a: 'The Game blocks have "set lives to 3" and "lose a life". Put "lose a life" inside "if touching (enemy)?" — the game ends when lives reach 0.' },
  { k: /disappear|vanish|invisible|appear/, a: '"hide" makes a sprite disappear and "show" brings it back. Hide things at the start, then show them when they should appear.' },
  { k: /mouse|click|drag/, a: '"go to (mouse-pointer)" inside a forever loop makes a sprite follow the mouse. "when this sprite clicked" runs code when it is clicked.' },
  { k: /spin|rotate|turn/, a: '"turn ↻ 15 degrees" inside a forever loop makes a sprite spin. "point in direction 90" makes it face right again.' },
  { k: /jump|hop/, a: 'To jump, a sprite needs to go up, then come back down. Try "change y by 20" in a short repeat, then "change y by −20" — or turn on gravity in the Game blocks and use "jump".' },
  { k: /gravity|fall/, a: 'Gravity is just "keep moving down a little more each time". Use a variable for speed: every frame, change speed by −1 and change y by speed. A jump sets speed to a big number.' },
  { k: /move|walk|arrow|key|control/, a: 'Use "forever" with "if key → pressed?" inside, then "change x by 5". Do one "if" for each arrow key. The forever loop keeps checking the keys all the time.' },
  { k: /score|point/, a: 'Use the Game block "set score to 0" when ▶ is clicked, then "change score by 1" whenever something good happens (like "if touching Coin?").' },
  { k: /clone|copy|many|lots/, a: 'Clones are copies made while the game runs. "create clone of myself" makes one, and "when I start as a clone" tells each copy what to do. Remember to delete clones you no longer need!' },
  { k: /random/, a: 'Green Operators has "pick random 1 to 10". Drop it into a number slot — for example "go to x: (pick random −200 to 200)" puts the sprite somewhere different each time.' },
  { k: /variable|remember|count/, a: 'A variable is a labelled box that remembers a number. Make one in Variables, set it at the start, and use "change … by" to add to it.' },
  { k: /bounce|edge|wall/, a: '"if on edge, bounce" in Motion makes a moving sprite turn round at the stage edge. For walls you made, use "if touching Wall?" then move back.' },
  { k: /touch|hit|collide|crash/, a: 'Use "if touching (sprite)?" inside a forever loop so it keeps checking. Put what should happen — lose a life, add score — inside the "if".' },
  { k: /win|end|finish|lose|game over/, a: 'The Game blocks have "win" and "game over". Put them inside an "if": for example "if score = 10 then win".' },
  { k: /loop|repeat|again/, a: '"repeat 10" does something 10 times, "forever" never stops, and "repeat until" stops when something becomes true.' },
  { k: /costume|animat|look/, a: 'For animation, use "next costume" then "wait 0.2 seconds" inside a forever loop. You can draw your own costumes in the Costumes tab.' },
  { k: /sound|music|noise/, a: 'Sound blocks play noises. "start sound" plays while the script carries on; "play sound until done" waits for it to finish.' },
  { k: /message|broadcast|tell/, a: 'Sprites talk with messages: one sprite uses "broadcast (go)", and others react with "when I receive (go)".' },
  { k: /ask|question|answer|type/, a: '"ask … and wait" shows a box for the player to type in. The "answer" block holds what they typed, so you can check it with "if answer = …".' },
];

export function answerQuestion(text) {
  const q = String(text || '').toLowerCase();
  const hit = TOPICS.find((t) => t.k.test(q));
  return hit ? hit.a : 'Good question! Try telling me what you want your sprite to DO — like "jump", "keep score", "move with the arrow keys" or "make lots of enemies".';
}

export const QUICK_QUESTIONS = ['How do I make it move?', 'How do I make it jump?', 'How do I keep score?', 'How do I make lots of enemies?', 'How do I win the game?'];
