/**
 * Game Modes — build Game Builder scripts as Blockly XML, in exactly the shape
 * the editor saves (field names, shadows), so a template opens like a project
 * a child made themselves.
 */

const XMLNS = 'xmlns="https://developers.google.com/blockly/xml"';
const NEXT = '{NEXT}';

const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const field = (name, value) => `<field name="${name}">${esc(value)}</field>`;
const num = (n) => `<shadow type="math_number"><field name="NUM">${esc(n)}</field></shadow>`;

/** A stack block; `{NEXT}` marks where the following block goes. */
const block = (type, inner = '') => `<block type="${type}">${inner}${NEXT}</block>`;

/** Chain stack blocks one under another. */
export function chain(...blocks) {
  return blocks.flat().filter(Boolean).reduceRight(
    (next, b) => b.replace(NEXT, next ? `<next>${next}</next>` : ''),
    '',
  );
}

const substack = (body) => `<statement name="SUBSTACK">${chain(...body)}</statement>`;
const condition = (cond) => (cond ? `<value name="CONDITION">${cond}</value>` : '');

/* ── Events ── */
export const whenFlag = () => block('event_whenflagclicked');
export const whenKey = (key) => block('event_whenkeypressed', field('KEY', key));
export const whenReceive = (msg) => block('event_whenreceivemessage', field('MESSAGE', msg));
export const broadcast = (msg) => block('event_broadcast', field('MESSAGE', msg));
export const whenCloned = () => block('control_start_as_clone');

/* ── Motion ── */
export const move = (steps) => block('motion_movesteps', field('STEPS', steps));
export const turnRight = (deg) => block('motion_turnright', `<value name="DEGREES">${num(deg)}</value>`);
export const turnLeft = (deg) => block('motion_turnleft', `<value name="DEGREES">${num(deg)}</value>`);
export const goTo = (x, y) => block('motion_gotoxy', field('X', x) + field('Y', y));
export const glideTo = (secs, x, y) => block('motion_glideto', field('SECS', secs) + field('X', x) + field('Y', y));
export const pointIn = (dir) => block('motion_pointindirection', field('DIRECTION', dir));
export const changeX = (dx) => block('motion_changex', field('DX', dx));
export const changeY = (dy) => block('motion_changey', field('DY', dy));
export const setX = (x) => block('motion_setx', field('X', x));
export const setY = (y) => block('motion_sety', field('Y', y));

/* ── Looks ── */
export const say = (text, secs = 2) => block('looks_sayforsecs', field('MESSAGE', text) + field('SECS', secs));
export const sayForever = (text) => block('looks_say', field('MESSAGE', text));
export const show = () => block('looks_show');
export const hide = () => block('looks_hide');

/* ── Control ── */
export const wait = (secs) => block('control_wait', field('DURATION', secs));
export const repeat = (times, ...body) => `<block type="control_repeat">${field('TIMES', times)}${substack(body)}${NEXT}</block>`;
export const forever = (...body) => `<block type="control_forever">${substack(body)}</block>`;
export const ifThen = (cond, ...body) => `<block type="control_if">${condition(cond)}${substack(body)}${NEXT}</block>`;
export const repeatUntil = (cond, ...body) => `<block type="control_repeatuntil">${condition(cond)}${substack(body)}${NEXT}</block>`;
export const waitUntil = (cond) => block('control_waituntil', condition(cond));
export const createClone = (of = 'myself') => block('control_create_clone', field('CLONE_OPTION', of));
export const deleteClone = () => `<block type="control_delete_this_clone"></block>`;
export const stopAll = () => `<block type="control_stop">${field('STOP_OPTION', 'all')}</block>`;

/* ── Sensing (boolean / reporter blocks, no {NEXT}) ── */
export const touching = (what) => `<block type="sensing_touchingobject">${field('OBJECT', what)}</block>`;
export const keyPressed = (key) => `<block type="sensing_keypressed">${field('KEY', key)}</block>`;
export const random = (from, to) => `<block type="operator_random">${field('FROM', from)}${field('TO', to)}</block>`;

/* ── Variables ── */
const varField = (name) => `<field name="VARIABLE" id="var-${esc(name)}">${esc(name)}</field>`;
const value = (v) => `<value name="VALUE">${typeof v === 'string' && v.startsWith('<block') ? v : num(v)}</value>`;
export const setVar = (name, v) => block('data_setvariableto', varField(name) + value(v));
export const changeVar = (name, v) => block('data_changevariableby', varField(name) + value(v));
export const getVar = (name) => `<block type="data_variable">${varField(name)}</block>`;

/* ── Game ── */
export const addScore = (n = 1) => block('bb_game_score_add', field('AMOUNT', n));
export const setScore = (n = 0) => block('bb_game_score_set', field('VALUE', n));
export const setLives = (n = 3) => block('bb_game_set_lives', field('VALUE', n));
export const gravity = (amount = 2400) => block('bb_physics_gravity', field('AMOUNT', amount));
export const jump = (power = 760) => block('bb_physics_jump', field('POWER', power));
export const doubleJump = (on = true) => block('bb_physics_allow_double_jump', field('ENABLE', on ? 'true' : 'false'));

/* ── Pen ── */
export const penDown = () => block('bb_pen_down');
export const penUp = () => block('bb_pen_up');
export const eraseAll = () => block('bb_pen_clear');
export const stamp = () => block('bb_pen_stamp');
export const penColor = (hex) => block('bb_pen_color', field('COLOR', hex));
export const changePenColor = (n) => block('bb_pen_change_color', field('AMOUNT', n));
export const penSize = (n) => block('bb_pen_size', field('SIZE', n));

/* ── Music ── */
export const tempo = (bpm) => block('bb_music_tempo', field('TEMPO', bpm));
export const instrument = (i) => block('bb_music_instrument', field('INSTRUMENT', i));
export const note = (n, beats = 0.5) => block('bb_music_note', field('NOTE', n) + field('BEATS', beats));
export const drum = (d, beats = 0.5) => block('bb_music_drum', field('DRUM', d) + field('BEATS', beats));
export const rest = (beats = 0.5) => block('bb_music_rest', field('BEATS', beats));
export const DRUMS = { snare: 0, kick: 1, tom: 2, cymbal: 3, hihat: 4, clap: 5 };

/** A script = a chain of blocks placed at (x, y) on the workspace. */
export function script(blocks, x = 24, y = 24) {
  return chain(...blocks).replace('<block ', `<block x="${x}" y="${y}" `);
}

/** Rough on-screen height of a script: stack blocks ~50px, each C-block mouth ~40px more. */
function scriptHeight(xml) {
  const stack = (xml.match(/<block type="[^"]+"/g) || [])
    .filter((t) => !/"(math_number|text|sensing_(?!askandwait)|operator_|motion_[xy]position|motion_direction|data_variable)/.test(t)).length;
  const mouths = (xml.match(/<statement name=/g) || []).length;
  return 30 + stack * 50 + mouths * 40; // +30 for the taller "when …" hat
}

/**
 * Workspace XML from one or more scripts (each made with `script`). Scripts are stacked
 * top to bottom with a gap, so they never land on top of each other in the editor.
 */
export function workspace(...scripts) {
  let y = 24;
  const placed = scripts.filter(Boolean).map((sc) => {
    const out = sc.replace(/^<block x="\d+" y="\d+"/, `<block x="24" y="${y}"`);
    y += scriptHeight(sc) + 56;
    return out;
  });
  return `<xml ${XMLNS}>${placed.join('')}</xml>`;
}

/* ── Win / lose ── */
export const win = () => block('bb_game_win');
export const gameOver = () => block('bb_game_over');
export const loseLife = () => block('bb_game_lose_life');

/* ── Plug a reporter into a number slot, e.g. changeYBy(getVar('speed')) ── */
export const changeXBy = (reporter) => block('motion_changex', field('DX', 0) + `<value name="DX_SLOT">${reporter}</value>`);
export const changeYBy = (reporter) => block('motion_changey', field('DY', 0) + `<value name="DY_SLOT">${reporter}</value>`);
export const moveBy = (reporter) => block('motion_movesteps', field('STEPS', 0) + `<value name="STEPS_SLOT">${reporter}</value>`);
export const whenClicked = () => block('event_whenthisspriteclicked');
export const changeTempo = (n) => block('bb_music_tempo_change', field('CHANGE', n));
/** go to a random x along the top (x from a reporter, fixed y) */
export const goToXBy = (reporter, y) => block('motion_gotoxy', field('X', 0) + field('Y', y) + `<value name="X_SLOT">${reporter}</value>`);

/* ── More blocks for the arcade modes ── */
/** Plug a reporter into a field's socket (`<FIELD>_SLOT`), keeping the field as the fallback value. */
const slotted = (fieldName, fallback, reporter) => field(fieldName, fallback) + (reporter ? `<value name="${fieldName}_SLOT">${reporter}</value>` : '');
const operand = (name, v) => (typeof v === 'string' && v.startsWith('<block') ? slotted(name, 0, v) : field(name, v));

export const bounce = () => block('motion_ifonedgebounce');
export const goToSprite = (name) => block('motion_goto', field('TARGET', name));
export const goToRandom = () => block('motion_goto', field('TARGET', 'random'));
export const pointTowards = (name) => block('motion_pointtowards', field('TARGET', name));
export const setXBy = (reporter) => block('motion_setx', slotted('X', 0, reporter));
export const setYBy = (reporter) => block('motion_sety', slotted('Y', 0, reporter));
export const pointBy = (reporter) => block('motion_pointindirection', slotted('DIRECTION', 90, reporter));
export const goToBy = (xRep, yRep) => block('motion_gotoxy', slotted('X', 0, xRep) + slotted('Y', 0, yRep));
export const glideBy = (secs, x, yRep) => block('motion_glideto', field('SECS', secs) + field('X', x) + slotted('Y', 0, yRep));
export const ifElse = (cond, thenBody, elseBody) => `<block type="control_if_else">${condition(cond)}${substack(thenBody)}<statement name="SUBSTACK2">${chain(...elseBody)}</statement>${NEXT}</block>`;
export const ask = (q) => block('sensing_askandwait', field('QUESTION', q));

/* reporters / booleans (no {NEXT}) */
export const answer = () => '<block type="sensing_answer"></block>';
export const mouseX = () => '<block type="sensing_mousex"></block>';
export const xPos = () => '<block type="motion_xposition"></block>';
export const yPos = () => '<block type="motion_yposition"></block>';
export const direction = () => '<block type="motion_direction"></block>';
export const timer = () => '<block type="sensing_timer"></block>';
export const score = () => '<block type="bb_game_score"></block>';
export const lives = () => '<block type="bb_game_lives"></block>';
export const equals = (a, b) => `<block type="operator_equals">${operand('OPERAND1', a)}${operand('OPERAND2', b)}</block>`;
export const gt = (a, b) => `<block type="operator_gt">${operand('OPERAND1', a)}${operand('OPERAND2', b)}</block>`;
export const lt = (a, b) => `<block type="operator_lt">${operand('OPERAND1', a)}${operand('OPERAND2', b)}</block>`;
/** a − b (either side may be a reporter) */
export const minus = (a, b) => `<block type="operator_add">${operand('NUM1', a)}${field('OP', 'subtract')}${operand('NUM2', b)}</block>`;
