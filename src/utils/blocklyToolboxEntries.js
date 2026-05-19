import { SIDEBAR_TO_TYPE, shortTypeToBlocklyType } from './blocks';
import { extensionBlocklyForShort } from './extensionBlockMaps';

/** Blockly block types we define with full fields (use in flyout instead of stubs). */
/** Prefer Scratch-style Blockly blocks (with number fields) over bb_lib_* stubs. */
/** Game short type → Scratch Blockly type (with inputs). */
export const SHORT_TO_SCRATCH_BLOCKLY = {
  'sprite-say': 'looks_sayforsecs',
  'looks-say': 'looks_say',
  'sprite-think': 'looks_thinkforsecs',
  'looks-think': 'looks_think',
  'looks-costume': 'looks_costumename',
  'looks-next-costume': 'looks_nextcostume',
  'looks-backdrop': 'looks_backdropname',
  'looks-next-backdrop': 'looks_nextbackdrop',
  'looks-change-size': 'looks_changeSizeBy',
  'sprite-setsize': 'looks_setSizeTo',
  'looks-change-effect': 'looks_changeEffectBy',
  'looks-set-effect': 'looks_setEffectTo',
  'looks-clear-effects': 'looks_clearEffects',
  'sprite-show': 'looks_show',
  'sprite-hide': 'looks_hide',
  'looks-front': 'looks_gotofrontback',
  'looks-back': 'looks_gotofrontback',
  'looks-forward-layers': 'looks_goforwardbackwardlayers',
  'looks-goto-layer': 'looks_gotofrontback',
  'looks-layer-step': 'looks_goforwardbackwardlayers',
  'looks-grow': 'looks_changeSizeBy',
  'looks-shrink': 'looks_changeSizeBy',
  'looks-costume-reporter': 'looks_costumenumbername',
  'looks-backdrop-reporter': 'looks_backdropnumbername',
  'sprite-size-reporter': 'looks_size',
  'sound-play': 'sound_play',
  'sound-play-until-done': 'sound_playuntildone',
  'sound-stop': 'sound_stopallsounds',
  'sound-change-effect': 'sound_changeeffectby',
  'sound-set-effect': 'sound_seteffectto',
  'sound-clear-effects': 'sound_cleareffects',
  'sound-set-volume': 'sound_setvolumeto',
  'sound-get-volume': 'sound_volume',
  'control-wait': 'control_wait',
  'loop-repeat': 'control_repeat',
  'loop-forever': 'control_forever',
  'logic-if': 'control_if',
  'logic-if-else': 'control_if_else',
  'control-wait-until': 'control_waituntil',
  'control-repeat-until': 'control_repeatuntil',
  'control-stop': 'control_stop',
  'event-clone': 'control_start_as_clone',
  'control-create-clone': 'control_create_clone',
  'control-delete-clone': 'control_delete_this_clone',
  'math-add': 'operator_add',
  'math-mult': 'operator_multiply',
  'math-random': 'operator_random',
  'math-round': 'operator_round',
  'math-modulo': 'operator_mod',
  'logic-compare': 'operator_compare',
  'logic-and': 'operator_and',
  'logic-or': 'operator_or',
  'logic-not': 'operator_not',
  'text-join': 'operator_join',
  'text-length': 'operator_length',
  'text-letter': 'operator_letterof',
  'text-contains': 'operator_contains',
  'sense-touching': 'sensing_touchingobject',
  'sense-touching-color': 'sensing_touchingcolor',
  'sense-color-touching-color': 'sensing_coloristouchingcolor',
  'sense-distance': 'sensing_distanceto',
  'action-ask': 'sensing_askandwait',
  'sense-answer': 'sensing_answer',
  'sense-key': 'sensing_keypressed',
  'sense-mouse-down': 'sensing_mousedown',
  'sense-mouse-x': 'sensing_mousex',
  'sense-mouse-y': 'sensing_mousey',
  'sense-set-drag-mode': 'sensing_setdragmode',
  'sense-loudness': 'sensing_loudness',
  'sense-timer': 'sensing_timer',
  'sense-reset-timer': 'sensing_resettimer',
  'sense-of': 'sensing_of',
  'sense-current': 'sensing_current',
  'sense-days-since-2000': 'sensing_dayssince2000',
  'sense-username': 'sensing_username',
  // Motion (palette labels → Scratch Blockly with number/dropdown fields)
  'sprite-move': 'motion_movesteps',
  'sprite-turn': 'motion_turnright',
  'sprite-turn-right': 'motion_turnright',
  'sprite-turn-left': 'motion_turnleft',
  'sprite-goto': 'motion_gotoxy',
  'sprite-goto-sprite': 'motion_goto',
  'sprite-goto-random-position': 'motion_goto',
  'sprite-goto-mouse-pointer': 'motion_goto',
  'sprite-glide': 'motion_glideto',
  'motion-glide-to-sprite': 'motion_glide',
  'motion-glide-to-random-position': 'motion_glide',
  'motion-glide-to-mouse-pointer': 'motion_glide',
  'sprite-changex': 'motion_changex',
  'sprite-changey': 'motion_changey',
  'sprite-setx': 'motion_setx',
  'sprite-sety': 'motion_sety',
  'sprite-point-dir': 'motion_pointindirection',
  'sprite-point-towards': 'motion_pointtowards',
  'motion-point': 'motion_pointtowards',
  'sprite-if-bounce': 'motion_ifonedgebounce',
  'sprite-rotation-style': 'motion_setrotationstyle',
  'sprite-x-reporter': 'motion_xposition',
  'sprite-y-reporter': 'motion_yposition',
  'sprite-direction-reporter': 'motion_direction',
  // Events
  'event-start': 'event_whenflagclicked',
  'event-keypress': 'event_whenkeypressed',
  'event-click': 'event_whenthisspriteclicked',
  'event-backdropswitch': 'event_whenbackdropswitchesto',
  'event-loudness': 'event_whengreaterthan',
  'event-message': 'event_whenreceivemessage',
  'event-broadcast': 'event_broadcast',
  'event-broadcast-wait': 'event_broadcastandwait',
  // Variables & lists
  'var-set': 'data_setvariableto',
  'var-change': 'data_changevariableby',
  'var-show': 'data_showvariable',
  'list-add': 'bb_list_add',
  'list-delete': 'data_deleteoflist',
  'list-delete-all': 'data_deletealloflist',
  'list-insert': 'data_insertatlist',
  'list-replace': 'data_replaceitemoflist',
  'list-item': 'data_itemoflist',
  'list-index': 'data_itemnumoflist',
  'list-length': 'data_lengthoflist',
  'list-contains': 'data_listcontainsitem',
  'list-show': 'data_showlist',
  'list-hide': 'data_hidelist',
  'var-hide': 'data_hidevariable',
  'var-set': 'bb_var_set',
  'var-change': 'bb_var_change',
  'var-show': 'data_showvariable',
  'func-define': 'bb_func_define',
  'func-call': 'bb_func_call',
  'math-subtract': 'operator_add',
  'math-divide': 'operator_multiply',
  'logic-if-else': 'control_if_else',
};

/** Default Blockly fields when inserting from the block library. */
export const SCRATCH_BLOCK_DEFAULT_FIELDS = {
  operator_add: { NUM1: 1, OP: 'add', NUM2: 1 },
  operator_multiply: { NUM1: 2, OP: 'multiply', NUM2: 3 },
  operator_random: { FROM: 1, TO: 100 },
  operator_gt: { OPERAND1: 0, OPERAND2: 0 },
  operator_lt: { OPERAND1: 0, OPERAND2: 0 },
  operator_equals: { OPERAND1: 0, OPERAND2: 0 },
  operator_compare: { OPERAND1: 0, OPERATOR: 'gt', OPERAND2: 0 },
  operator_and: { OPERAND1: 'TRUE', OPERATOR: 'and', OPERAND2: 'TRUE' },
  operator_or: { OPERAND1: 'TRUE', OPERAND2: 'TRUE' },
  operator_not: { OPERAND: 'FALSE' },
  operator_join: { STRING1: 'hello', STRING2: 'world' },
  operator_length: { STRING: 'hello' },
  operator_letterof: { LETTER: 1, STRING: 'text' },
  operator_contains: { STRING1: 'hello', STRING2: 'll' },
  operator_mod: { NUM1: 0, NUM2: 1 },
  operator_round: { OP: 'round', NUM: 0 },
  operator_mathop: { OPERATOR: 'abs', NUM: 0 },
  looks_gotofrontback: { LAYER: 'front' },
  looks_goforwardbackwardlayers: { DIRECTION: 'forward', NUM: 1 },
  looks_changeEffectBy: { EFFECT: 'color', CHANGE: 25 },
  looks_setEffectTo: { EFFECT: 'color', VALUE: 0 },
  looks_changeSizeBy: { CHANGE: 10 },
  looks_setSizeTo: { SIZE: 100 },
  looks_costumename: { COSTUME: 'costume1' },
  looks_backdropname: { BACKDROP: 'Sky' },
  event_whenbackdropswitchesto: { BACKDROP: 'Sky' },
  looks_costumenumbername: { NUMBER_NAME: 'number' },
  looks_backdropnumbername: { NUMBER_NAME: 'number' },
  sound_play: { SOUND: 'pop' },
  sound_playuntildone: { SOUND: 'pop' },
  sound_changeeffectby: { EFFECT: 'pitch', VALUE: 10 },
  sound_seteffectto: { EFFECT: 'pitch', VALUE: 0 },
  sound_setvolumeto: { VOLUME: 100 },
  control_wait: { DURATION: 1 },
  control_repeat: { TIMES: 10 },
  control_stop: { STOP_OPTION: 'all' },
  control_create_clone: { CLONE_OPTION: 'myself' },
  sensing_touchingobject: { OBJECT: 'mouse' },
  sensing_touchingcolor: { COLOR: '#4a4a4a' },
  sensing_coloristouchingcolor: { COLOR: '#8b4513', COLOR2: '#ff69b4' },
  sensing_distanceto: { OBJECT: 'mouse' },
  sensing_askandwait: { QUESTION: "What's your name?" },
  sensing_keypressed: { KEY: 'space' },
  sensing_setdragmode: { DRAG_MODE: 'draggable' },
  sensing_of: { PROPERTY: 'backdrop', OBJECT: 'Stage' },
  sensing_current: { CURRENTMENU: 'year' },
  motion_movesteps: { STEPS: 10 },
  motion_turnright: { DEGREES: 15 },
  motion_turnleft: { DEGREES: 15 },
  motion_gotoxy: { X: 0, Y: 0 },
  motion_goto: { TARGET: 'random' },
  motion_glide: { SECS: 1, TARGET: 'random' },
  motion_glideto: { SECS: 1, X: 0, Y: 0 },
  motion_pointindirection: { DIRECTION: 90 },
  motion_pointtowards: { TARGET: 'mouse' },
  motion_changex: { DX: 10 },
  motion_changey: { DY: 10 },
  motion_setx: { X: 0 },
  motion_sety: { Y: 0 },
  motion_setrotationstyle: { STYLE: 'allaround' },
  event_whenkeypressed: { KEY: 'space' },
  event_whenreceivemessage: { MESSAGE: 'message1' },
  event_broadcast: { MESSAGE: 'message1' },
  event_broadcastandwait: { MESSAGE: 'message1' },
  event_whengreaterthan: { CONDITION: 'loudness', VALUE: 10 },
  data_setvariableto: { VARIABLE: 'my variable', VALUE: 0 },
  data_changevariableby: { VARIABLE: 'my variable', VALUE: 1 },
  bb_var_set: { NAME: 'myVar', VALUE: '0' },
  bb_var_change: { NAME: 'myVar', AMOUNT: 1 },
  bb_list_add: { ITEM: 'thing', LIST: 'myList' },
  bb_func_define: { NAME: 'my block' },
  bb_func_call: { NAME: 'my block' },
  looks_sayforsecs: { MESSAGE: 'Hello!', SECS: 2 },
  looks_thinkforsecs: { MESSAGE: 'Hmm...', SECS: 2 },
  looks_say: { MESSAGE: 'Hello!' },
  looks_think: { MESSAGE: 'Hmm...' },
};

export const BB_ALIAS_TO_SCRATCH_MOTION = {
  bb_sprite_move: 'motion_movesteps',
  bb_sprite_turn_right: 'motion_turnright',
  bb_sprite_turn_left: 'motion_turnleft',
  bb_sprite_goto: 'motion_gotoxy',
  bb_sprite_changex: 'motion_changex',
  bb_sprite_changey: 'motion_changey',
  bb_sprite_setx: 'motion_setx',
  bb_sprite_sety: 'motion_sety',
  bb_sprite_point_dir: 'motion_pointindirection',
  bb_sprite_point_towards: 'motion_pointtowards',
  bb_sprite_if_bounce: 'motion_ifonedgebounce',
  bb_sprite_rotation_style: 'motion_setrotationstyle',
  bb_sprite_goto_random: 'motion_goto',
  bb_sprite_goto_mouse: 'motion_goto',
  bb_motion_changex: 'motion_changex',
  bb_motion_changey: 'motion_changey',
  bb_motion_setx: 'motion_setx',
  bb_motion_sety: 'motion_sety',
  bb_motion_point_dir: 'motion_pointindirection',
  bb_motion_point_towards: 'motion_pointtowards',
  bb_motion_if_bounce: 'motion_ifonedgebounce',
  bb_motion_set_rotation_style: 'motion_setrotationstyle',
};

export const BB_FULLY_IMPLEMENTED = new Set([
  // Event blocks
  'bb_event_start', 'bb_event_keypress', 'event_broadcast', 'event_broadcastandwait',
  'event_whenbroadcastreceived', 'event_whenflagclicked', 'event_whenkeypressed',
  'event_whenthisspriteclicked', 'event_whenbackdropswitchesto', 'event_whengreaterthan',
  'event_whenreceivemessage',

  // Motion blocks
  'motion_movesteps', 'motion_turnright', 'motion_turnleft', 'motion_goto',
  'motion_gotoxy', 'motion_glide', 'motion_glideto', 'motion_pointindirection',
  'motion_pointtowards', 'motion_changex', 'motion_setx', 'motion_changey',
  'motion_sety', 'motion_ifonedgebounce', 'motion_setrotationstyle',
  'motion_xposition', 'motion_yposition', 'motion_direction',
  'bb_motion_glide', 'bb_motion_jump', 'bb_motion_setx', 'bb_motion_sety',
  'bb_motion_rotation', 'bb_motion_change_angle', 'bb_motion_speed',

  // Looks blocks
  'looks_sayforsecs', 'looks_say', 'looks_think', 'looks_thinkforsecs',
  'looks_show', 'looks_hide', 'looks_switchcostume', 'looks_nextcostume',
  'looks_costumenumbername', 'looks_costumename', 'looks_nextbackdrop',
  'looks_backdropnumbername', 'looks_backdropname', 'looks_changeEffectBy',
  'looks_setEffectTo', 'looks_clearEffects', 'looks_changeSizeBy', 'looks_setSizeTo',
  'looks_size', 'looks_goforwardbackwardlayers', 'looks_gotofrontback',
  'bb_looks_grow', 'bb_looks_shrink', 'bb_looks_costume', 'bb_looks_next_costume',
  'bb_looks_color_effect', 'bb_looks_ghost_effect', 'bb_looks_clear_effects',
  'bb_looks_front', 'bb_looks_back', 'bb_looks_think',

  // Sound blocks
  'sound_play', 'sound_playuntildone', 'sound_stopallsounds', 'sound_changeeffectby',
  'sound_seteffectto', 'sound_cleareffects', 'sound_changevolumeby', 'sound_setvolumeto',
  'sound_volume', 'bb_sound_play', 'bb_sound_stop', 'bb_sound_volume',

  // Control blocks
  'control_forever', 'control_repeat', 'control_if', 'control_if_else',
  'control_repeatuntil', 'control_waituntil', 'control_wait', 'control_stop',
  'control_start_as_clone', 'control_create_clone', 'control_delete_this_clone',
  'bb_control_wait', 'bb_loop_forever', 'bb_loop_repeat', 'bb_logic_if',

  // Sensing blocks
  'sensing_touchingobject', 'sensing_touchingcolor', 'sensing_coloristouchingcolor',
  'sensing_distanceto', 'sensing_askandwait', 'sensing_ask', 'sensing_answer',
  'sensing_keypressed', 'sensing_mousedown', 'sensing_mousex', 'sensing_mousey',
  'sensing_setdragmode', 'sensing_loudness', 'sensing_timer', 'sensing_resettimer',
  'sensing_current', 'sensing_dayssince2000', 'sensing_username', 'sensing_of',
  'bb_sense_timer',

  // Operators blocks
  'operator_add', 'operator_subtract', 'operator_multiply', 'operator_divide',
  'operator_random', 'operator_gt', 'operator_lt', 'operator_equals',
  'operator_and', 'operator_or', 'operator_not', 'operator_join',
  'operator_letterof', 'operator_length', 'operator_contains', 'operator_mod',
  'operator_round', 'operator_mathop', 'operator_compare',
  'bb_math_add', 'bb_math_mult', 'bb_math_random', 'bb_math_round',

  // Variables blocks
  'data_setvariableto', 'data_changevariableby', 'data_showvariable', 'data_hidevariable',
  'data_variable', 'bb_var_create', 'bb_var_set', 'bb_var_change',

  // Lists blocks
  'data_addtolist', 'data_deletealloflist', 'data_deleteoflist', 'data_insertatlist',
  'data_itemoflist', 'data_itemnumoflist', 'data_lengthoflist', 'data_listcontainsitem',
  'data_replaceitemoflist', 'data_showlist',
  'bb_list_create', 'bb_list_add', 'bb_list_get',
  'bb_func_define', 'bb_func_call', 'bb_var_set', 'bb_var_change',

  // Face Detection blocks
  'face_turn_video_on', 'face_turn_video_off', 'face_show_bounding', 'face_hide_bounding',
  'face_set_threshold', 'face_analyse_camera', 'face_analyse_stage', 'face_number_of',
  'face_visible', 'face_expression', 'face_x', 'face_y', 'face_size', 'face_happy',

  // Object Detection blocks
  'object_turn_video_on', 'object_turn_video_off', 'object_show_bounding', 'object_hide_bounding',
  'object_set_threshold', 'object_analyse_camera', 'object_analyse_stage', 'object_number_of',
  'object_class_of', 'object_person_detected', 'object_person_count',

  // Human Body Detection blocks
  'bb_body_video_on', 'bb_body_show_detections', 'bb_body_analyse', 'bb_body_get_count',
  'bb_body_x_position', 'bb_body_y_position', 'bb_body_is_detected',
  'bb_hand_analyze', 'bb_hand_detected', 'bb_hand_position_x',

  // Speech & TTS blocks
  'speech_listen', 'speech_last_heard', 'tts_speak', 'bb_tts_speak',

  // Translate & OCR blocks
  'translate_text', 'translate_result', 'ocr_scan', 'ocr_recognized_text',

  // Image/Pose/Audio Classifier blocks
  'ic_turn_camera_on', 'ic_analyse_frame', 'ic_top_class', 'ic_confidence',
  'pc_turn_camera_on', 'pc_turn_camera_off', 'pc_capture_pose', 'pc_pose_name', 'pc_pose_confidence',
  'ac_classify', 'ac_sound_label',

  // Text Classifier blocks
  'tc_add_training', 'tc_classify', 'tc_prediction_label', 'tc_prediction_confidence',

  // Chat & NLP blocks
  'chat_ask', 'nlp_analyse_sentiment', 'nlp_sentiment_value', 'nlp_is_positive',

  // Music blocks
  'bb_music_drum', 'bb_music_rest', 'bb_music_note', 'bb_music_instrument',
  'bb_music_tempo', 'bb_music_tempo_change', 'bb_music_get_tempo',

  // Physics blocks
  'bb_physics_velocity', 'bb_physics_gravity', 'bb_physics_jump',
  'bb_physics_allow_double_jump', 'bb_physics_friction', 'bb_physics_push',
  'bb_physics_bounce',

  // Game blocks
  'bb_game_score_add', 'bb_game_score_set', 'bb_game_set_lives',

  // Robot blocks
  'bb_robot_generic', 'bb_robot_show_text', 'bb_robot_show_number', 'bb_robot_show_icon',
  'bb_robot_led_color', 'bb_robot_led_rgb', 'bb_robot_led_brightness', 'bb_robot_buzz',
  'bb_robot_play_note', 'bb_robot_play_melody', 'bb_robot_if_dist',

  // Action blocks
  'bb_action_print', 'bb_action_alert', 'bb_sprite_say', 'bb_sprite_setsize',
  'bb_sprite_show', 'bb_sprite_hide',
]);

/** bb_* types we ship in blocklySetup (no Blockly import — keeps Vite HMR stable). */
export function isRegisteredBbBlockType(bb) {
  if (!bb || typeof bb !== 'string') return false;
  if (BB_FULLY_IMPLEMENTED.has(bb)) return true;
  return /^bb_(sprite|motion|looks|sound|var|list|func|control|loop|logic|sense|action|game|physics|music|robot|event|body|hand|tts)_/.test(bb)
    || /^(face|object|speech|translate|ocr|ic|pc|ac|tc|nlp|chat)_/.test(bb);
}

const C_SHORT = new Set(['loop-repeat', 'loop-forever', 'loop-while', 'loop-foreach', 'logic-if', 'control-repeat-until']);

const BOOLEAN_SHORT = new Set([
  'logic-bool',
  'logic-and',
  'logic-or',
  'logic-not',
  'logic-compare',
  'text-contains',
  'list-contains',
  'sense-touching',
  'sense-touching-sprite',
  'sense-touching-color',
  'sense-color-touching-color',
  'sense-key',
  'sense-mouse-down',
]);

/** Looks reporter blocks belong in value sockets, not standalone stacks. */
export const LOOKS_REPORTER_GAME_TYPES = new Set([
  'looks-costume-reporter',
  'looks-backdrop-reporter',
  'sprite-size-reporter',
]);

/** List reporter blocks belong in value sockets, not standalone stacks. */
export const LIST_REPORTER_GAME_TYPES = new Set([
  'list-item',
  'list-index',
  'list-length',
]);

const REPORTER_SHORT = new Set([
  'sense-mouse-x',
  'sense-mouse-y',
  'sense-distance',
  'sense-timer',
  'sense-loudness',
  'sense-answer',
  'sense-of',
  'sense-current',
  'sense-days-since-2000',
  'sense-username',
  'math-add',
  'math-subtract',
  'math-mult',
  'math-divide',
  'math-modulo',
  'math-random',
  'math-round',
  'text-join',
  'text-length',
  'text-letter',
  'looks-costume-reporter',
  'looks-backdrop-reporter',
  'sprite-size-reporter',
  'sound-get-volume',
  'list-item',
  'list-index',
  'list-length',
]);

/** Game Builder runtime type → Blockly block type for workspace restore. */
export function gameTypeToBlocklyType(gameType) {
  const t = String(gameType || '');
  if (SHORT_TO_SCRATCH_BLOCKLY[t]) return SHORT_TO_SCRATCH_BLOCKLY[t];
  if (t === 'event-start') return 'event_whenflagclicked';
  if (t === 'event-keypress') return 'event_whenkeypressed';
  if (t === 'event-click') return 'event_whenthisspriteclicked';
  const bb = shortTypeToBlocklyType(t);
  if (bb) return bb;
  return t;
}

/** Resolve library short type to a Blockly block type with proper inputs. */
export function scratchBlocklyTypeForShort(short) {
  if (!short) return null;
  if (SHORT_TO_SCRATCH_BLOCKLY[short]) return SHORT_TO_SCRATCH_BLOCKLY[short];
  const ext = extensionBlocklyForShort(short);
  if (ext) return ext;
  const bb = shortTypeToBlocklyType(short);
  if (bb && BB_ALIAS_TO_SCRATCH_MOTION[bb]) return BB_ALIAS_TO_SCRATCH_MOTION[bb];
  if (bb && isRegisteredBbBlockType(bb)) return bb;
  return null;
}

/** Prefer a real Blockly type from a palette short type (never unregistered bb_* stubs). */
export function blocklyTypeFromShort(short) {
  if (!short) return null;
  return scratchBlocklyTypeForShort(short) || null;
}

export function inferLibShapeFromLabel(label) {
  const short = SIDEBAR_TO_TYPE[String(label || '').trim().toLowerCase()];
  if (!short) return 'stack';
  if (short.startsWith('event-')) return 'hat';
  if (C_SHORT.has(short)) return 'c';
  if (BOOLEAN_SHORT.has(short)) return 'boolean';
  if (REPORTER_SHORT.has(short)) return 'reporter';
  return 'stack';
}

/**
 * One toolbox JSON block for a library label.
 * Uses real bb_* blocks when implemented; otherwise shape-specific stubs (colour from label → category).
 */
const LIBRARY_OPERATOR_BLOCK_OVERRIDES = {
  subtract: { type: 'operator_add', fields: { OP: 'subtract' } },
  multiply: { type: 'operator_multiply', fields: { OP: 'multiply' } },
  divide: { type: 'operator_multiply', fields: { OP: 'divide' } },
  'greater than': { type: 'operator_gt' },
  'less than': { type: 'operator_lt' },
  equals: { type: 'operator_equals' },
  or: { type: 'operator_or' },
  not: { type: 'operator_not' },
  mod: { type: 'operator_mod' },
  'math operation of': { type: 'operator_mathop', fields: { OPERATOR: 'abs' } },
};

/** True when a Blockly type is a library placeholder, not a real block implementation. */
export function isLibraryStubBlocklyType(type) {
  const t = String(type || '').trim();
  return !t || t === 'bb_generic_stack' || t.startsWith('bb_lib_');
}

/** Extra field defaults based on the human-readable palette label. */
export function libraryLabelFieldOverrides(blockLabel, blockType, shortType) {
  const key = String(blockLabel || '').trim().toLowerCase();
  const fields = {};
  if (blockType === 'motion_goto' || blockType === 'motion_glide') {
    if (key.includes('random')) fields.TARGET = 'random';
    else if (key.includes('mouse')) fields.TARGET = 'mouse';
    else if (shortType === 'sprite-goto-sprite' || shortType === 'motion-glide-to-sprite' || key === 'go to' || key === 'glide secs to') {
      fields.TARGET = 'sprite';
    }
  }
  if (blockType === 'motion_glideto' && (key.includes('x,y') || key.includes('x:') || key === 'glide secs to x,y')) {
    fields.SECS = 1;
    fields.X = 0;
    fields.Y = 0;
  }
  if (blockType === 'event_whengreaterthan' && key.includes('greater')) {
    fields.CONDITION = key.includes('timer') ? 'timer' : 'loudness';
  }
  if (blockType === 'looks_gotofrontback') {
    fields.LAYER = (key.includes('back') && !key.includes('front')) ? 'back' : 'front';
  }
  if (blockType === 'looks_goforwardbackwardlayers') {
    fields.DIRECTION = key.includes('backward') ? 'backward' : 'forward';
    fields.NUM = 1;
  }
  if (blockType === 'looks_changeEffectBy' || blockType === 'looks_setEffectTo') {
    fields.EFFECT = key.includes('ghost') ? 'ghost' : 'color';
    if (blockType === 'looks_changeEffectBy') fields.CHANGE = 25;
    if (blockType === 'looks_setEffectTo') fields.VALUE = 0;
  }
  if (blockType === 'looks_sayforsecs' || blockType === 'looks_thinkforsecs') {
    if (key.includes('think')) fields.MESSAGE = 'Hmm...';
    else fields.MESSAGE = 'Hello!';
    fields.SECS = 2;
  }
  if (blockType === 'looks_say') fields.MESSAGE = 'Hello!';
  if (blockType === 'looks_think') fields.MESSAGE = 'Hmm...';
  return fields;
}

/** Resolve the Blockly type to create for a palette label (ignores stub types from drag payloads). */
export function resolveBlocklyTypeForLibraryLabel(blockLabel, preferredType = null) {
  const preferred = String(preferredType || '').trim();
  const key = String(blockLabel || '').trim().toLowerCase();
  const short = SIDEBAR_TO_TYPE[key];
  const fromShort = blocklyTypeFromShort(short);
  if (!isLibraryStubBlocklyType(preferred) && preferred) return preferred;
  const json = toolboxBlockJsonForLibraryEntry(blockLabel);
  const fromJson = json?.type;
  if (!isLibraryStubBlocklyType(fromJson) && fromJson) return fromJson;
  return fromShort || fromJson || null;
}

export function toolboxBlockJsonForLibraryEntry(blockLabel) {
  const key = String(blockLabel || '').trim().toLowerCase();
  const operatorOverride = LIBRARY_OPERATOR_BLOCK_OVERRIDES[key];
  if (operatorOverride) {
    const fields = operatorOverride.fields || {};
    return Object.keys(fields).length
      ? { kind: 'block', type: operatorOverride.type, fields }
      : { kind: 'block', type: operatorOverride.type };
  }
  const short = SIDEBAR_TO_TYPE[key];
  const scratchType = scratchBlocklyTypeForShort(short);
  if (scratchType) {
    const fields = {
      ...(SCRATCH_BLOCK_DEFAULT_FIELDS[scratchType] || {}),
      ...libraryLabelFieldOverrides(blockLabel, scratchType, short),
    };
    if (scratchType === 'looks_gotofrontback' && !fields.LAYER) {
      if (short === 'looks-back') fields.LAYER = 'back';
      else fields.LAYER = 'front';
    }
    if (scratchType === 'operator_add' && short === 'math-add' && key === 'subtract') fields.OP = 'subtract';
    if (scratchType === 'operator_multiply' && key === 'divide') fields.OP = 'divide';
    if (scratchType === 'operator_compare') {
      if (key === 'greater than') fields.OPERATOR = 'gt';
      else if (key === 'less than') fields.OPERATOR = 'lt';
      else if (key === 'equals') fields.OPERATOR = 'eq';
    }
    return Object.keys(fields).length
      ? { kind: 'block', type: scratchType, fields }
      : { kind: 'block', type: scratchType };
  }
  const bb = short ? shortTypeToBlocklyType(short) : null;
  if (bb && BB_ALIAS_TO_SCRATCH_MOTION[bb]) {
    return { kind: 'block', type: BB_ALIAS_TO_SCRATCH_MOTION[bb] };
  }
  if (bb && BB_FULLY_IMPLEMENTED.has(bb)) {
    return { kind: 'block', type: bb };
  }
  if (bb && isRegisteredBbBlockType(bb)) {
    return { kind: 'block', type: bb };
  }
  const shape = inferLibShapeFromLabel(blockLabel);
  const type =
    shape === 'hat'
      ? 'bb_lib_hat'
      : shape === 'c'
        ? 'bb_lib_c'
        : shape === 'boolean'
          ? 'bb_lib_boolean'
          : shape === 'reporter'
            ? 'bb_lib_reporter'
            : 'bb_lib_stack';
  return {
    kind: 'block',
    type,
    fields: { BLOCK_NAME: String(blockLabel) },
  };
}
