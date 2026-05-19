import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  BLOCK_DEFS,
  SIDEBAR_TO_TYPE,
  createBlockFromDrop,
  BlockContent,
  resolveBlocklyNodeType,
  blocklyTypeToGameType,
  BLOCKLY_TO_GAME_TYPE,
  readBlocklyFieldOrValue,
  shortTypeToBlocklyType,
} from '../utils/blocks';
import { saveSubmissionToFirestore } from '../firebase';
import { useUser } from '../contexts/UserContext';
import AppMode from '../utils/AppMode';
import ScratchStyleBlock from './ScratchStyleBlock';
import UnifiedBlocklyWorkspace from './UnifiedBlocklyWorkspace';
import { BLOCK_STACK_GAP, columnizeBlocks } from '../utils/blockStack';
import { snapCanvasStack } from '../utils/blockSnap';
import ExtensionsModal from './ExtensionsModal';
import { readEnabledExtensionIds, writeEnabledExtensionIds } from '../data/extensionsCatalog';
import FunctionRegistry from '../utils/functionRegistry';
import { getCategoryColorForBlockLabel } from '../data/blockLibraryCategories';
import { SHORT_TO_SCRATCH_BLOCKLY } from '../utils/blocklyToolboxEntries';
import { BB_ADD_SIDEBAR_BLOCK, BB_OPEN_EXTENSIONS } from '../utils/blockLibraryEvents';
import { initializeSpriteState } from '../utils/spritePhysics';
import { RASTER_SPRITE_LIBRARY } from '../data/rasterSpriteLibrary';
import {
  blocklyNodeToEvaluatorBlock,
  evaluateOperatorBlock,
  OPERATOR_GAME_TYPES,
} from '../utils/operatorsRuntime';
import { LOOKS_REPORTER_GAME_TYPES, LIST_REPORTER_GAME_TYPES } from '../utils/blocklyToolboxEntries';
import {
  listAdd,
  listDeleteAt,
  listDeleteAll,
  listInsertAt,
  listReplaceAt,
  listGetItem,
  listIndexOfValue,
  listLength,
  listContains,
  listBlocklyParam,
  evalListParam,
  evalListIndex,
  ensureList,
  normalizeListName,
  blocklyListNodeToEvaluatorBlock,
} from '../utils/listRuntime';
import {
  integratePlatformerSprite,
  getPlatformRects,
  DEFAULT_GRAVITY_PPS2,
  normalizeGravityPps2,
  normalizeJumpImpulse,
  applyJumpImpulse,
  createPhysicsState,
  isKeyJustPressed,
  isKeyHeld,
} from '../utils/gameBuilderPlatformer';
import { MAX_BLOCK_STEPS_PER_ANIMATION_FRAME } from '../utils/scratchVmMapping';
import { GameRuntime } from '../utils/gameRuntime';
import {
  runExtensionGame,
  readExtensionGame,
  updateTransparencyOpacity,
  monitorBodyDetectionBlockParams,
  analyseQrFromGameStage,
  getQrState,
  cleanupQrSidebarOverlay,
} from '../utils/extensionEngine';
import { executeCAMERABlock } from '../systems/camera';
import { webcamManager } from '../systems/GlobalWebcamManager';
import {
  executeSpriteMotion,
  evaluateMotionReporter,
  ensureSpriteMotionState,
  isMotionBlock,
  isMotionReporter,
  isRotationStyleBlockType,
  isSpriteMotionBusy,
  applyCanvasRotationStyle,
  getRotationStyle,
  syncPlayRotationStyle,
  setRotationStyle,
  applyRotationStyleBlock,
  readRotationStyleParam,
  setVelocityFromDirection,
} from '../utils/spriteMotion';
import {
  applyMotionFlagsFromChains,
  buildScriptChains,
  resetSpriteThreads,
  registerForeverThread,
  tickSpriteAnimations,
  stepGreenFlagChains,
  stepForeverThreads,
  initGreenFlagThreads,
  resyncSpriteThreadsOnBlockChange,
  startCloneHatThreads,
  stepCloneHatThreads,
} from '../utils/spriteScriptRunner';
import {
  collectLoopBody,
  getFlowContext,
  setWaitSeconds,
  setWaitUntilCondition,
  shouldResumeWaitUntil,
  stopAllScriptThreads,
  stopOtherScriptsOnSprite,
  stopThisScript,
} from '../utils/controlFlowRuntime';
import {
  LoudnessMonitor,
  getTimerSeconds,
  getCurrentDateTime,
  getDaysSince2000,
  evaluateSenseOf,
  objectFieldToTarget,
  isTouchingTarget,
  isTouchingSprite,
  isTouchingColor,
  isColorTouchingColor,
  distanceToTarget,
  normalizeSenseKeyName,
} from '../utils/sensingRuntime';
import {
  initSpriteLooks,
  switchCostume,
  nextCostume,
  costumeNumberReporter,
  backdropNumberReporter,
  nextBackdropIndex,
  changeSizeBy,
  setSizePercent,
  sizeReporter,
  changeEffect,
  setEffect,
  clearGraphicEffects,
  say,
  think,
  bubbleActive,
  goToFrontLayer,
  goToBackLayer,
  goLayers,
  buildEffectFilter,
  drawSpeechBubble,
  drawThoughtBubble,
  applyStageBackdrop,
  runLooksBlocksOnSprite,
} from '../utils/looksRuntime';
import {
  getSpriteSoundState,
  playSpriteSound,
  stopSpriteSounds,
  runSoundBlocksOnSprite,
  getSpriteVolumeReporter,
} from '../utils/soundRuntime';
import { ensureBlockSoundAudio } from '../utils/blockSounds';
import { STAGE_BACKDROP_NAMES } from '../data/stageLookOptions';

const STAGE_W = 480;
const STAGE_H = 360;
const DEFAULT_STAGE_BACKDROP = 'White';
const LEGACY_DEFAULT_BACKDROPS = new Set(['Space', 'Sky']);

function readInitialStageBackdrop() {
  try {
    const saved = localStorage.getItem('cv_gamebuilder_bg');
    if (!saved || LEGACY_DEFAULT_BACKDROPS.has(saved)) return DEFAULT_STAGE_BACKDROP;
    return saved;
  } catch {
    return DEFAULT_STAGE_BACKDROP;
  }
}
const BLOCK_LANE_X = 30;
const BLOCK_START_Y = 20;

function ListMonitorsOverlay({ monitors }) {
  const entries = Object.entries(monitors || {});
  if (!entries.length) return null;
  return (
    <div
      style={{
        position: 'absolute',
        top: 8,
        left: 8,
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        pointerEvents: 'none',
        maxHeight: 'calc(100% - 16px)',
        overflow: 'auto',
      }}
    >
      {entries.map(([name, items]) => (
        <div
          key={name}
          style={{
            minWidth: 120,
            maxWidth: 200,
            border: '2px solid #00bcd4',
            borderRadius: 8,
            padding: '6px 8px',
            background: 'rgba(0, 188, 212, 0.12)',
            color: '#fff',
            fontSize: 11,
            fontFamily: 'system-ui, sans-serif',
            boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 4, color: '#00bcd4' }}>{name}</div>
          <ol style={{ margin: 0, paddingLeft: 18, lineHeight: 1.35 }}>
            {(items || []).map((item, i) => (
              <li key={`${name}-${i}`} style={{ wordBreak: 'break-word' }}>
                {String(item)}
              </li>
            ))}
          </ol>
          {(!items || items.length === 0) && (
            <div style={{ opacity: 0.55, fontStyle: 'italic' }}>(empty)</div>
          )}
        </div>
      ))}
    </div>
  );
}

function AskPromptBar({ question, onSubmit }) {
  const [value, setValue] = useState('');
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(value);
      }}
      style={{
        position: 'absolute',
        bottom: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 25,
        display: 'flex',
        gap: 8,
        alignItems: 'center',
        background: 'rgba(0,0,0,0.85)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: 10,
        padding: '8px 12px',
        maxWidth: '92%',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      }}
    >
      <span style={{ color: '#fff', fontSize: 13, whiteSpace: 'nowrap' }}>{question}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        autoFocus
        style={{
          flex: 1,
          minWidth: 120,
          padding: '6px 10px',
          borderRadius: 6,
          border: '1px solid rgba(255,255,255,0.25)',
          background: '#1a1a2e',
          color: '#fff',
          fontSize: 13,
        }}
      />
      <button
        type="submit"
        style={{
          padding: '6px 14px',
          borderRadius: 6,
          border: 'none',
          background: '#00bcd4',
          color: '#fff',
          fontWeight: 600,
          cursor: 'pointer',
          fontSize: 13,
        }}
      >
        OK
      </button>
    </form>
  );
}

/** Map a Blockly condition value node (e.g. under if …) to a block shape evaluateCondition() understands. */
function conditionBlocklyNodeToEvaluatorBlock(node) {
  if (!node) return { type: 'logic-bool', params: { value: 'false' } };
  const blocklyType = resolveBlocklyNodeType(node) || node.type;
  const f = node.fields || {};

  const operatorBlock = blocklyNodeToEvaluatorBlock(node);
  if (operatorBlock) return operatorBlock;

  const listBlock = blocklyListNodeToEvaluatorBlock(node);
  if (listBlock) return listBlock;

  if (blocklyType === 'bb_sense_timer') {
    return { type: 'sense-timer', params: {} };
  }

  if (
    blocklyType === 'looks_size'
    || blocklyType === 'looks_costumenumbername'
    || blocklyType === 'looks_backdropnumbername'
  ) {
    const short = blocklyType === 'looks_size'
      ? 'sprite-size-reporter'
      : blocklyType === 'looks_costumenumbername'
        ? 'looks-costume-reporter'
        : 'looks-backdrop-reporter';
    return {
      type: short,
      params: { numberName: f.NUMBER_NAME ?? 'number' },
    };
  }

  if (blocklyType === 'bb_lib_boolean' || blocklyType === 'bb_lib_reporter') {
    const label = String(f.BLOCK_NAME || f.LABEL || '').trim().toLowerCase();
    if (label === 'true' || label === 'false') {
      return { type: 'logic-bool', params: { value: label } };
    }
    const short = SIDEBAR_TO_TYPE[label];
    if (!short) {
      return { type: 'logic-bool', params: { value: 'false' } };
    }
    switch (short) {
      case 'sense-touching':
        return { type: 'sense-touching', params: { target: f.TARGET || f.OBJECT || 'edge' } };
      case 'sense-touching-sprite':
        return { type: 'sense-touching-sprite', params: { sprite: f.SPRITE || f.sprite || 'any' } };
      case 'sense-touching-color':
        return { type: 'sense-touching-color', params: { color: f.COLOR || '#ff0000' } };
      case 'sense-color-touching-color':
        return {
          type: 'sense-color-touching-color',
          params: { color1: f.COLOR || '#ff0000', color2: f.COLOR2 || '#0000ff' },
        };
      case 'sense-key':
        return { type: 'sense-key', params: { key: String(f.KEY || 'space').toLowerCase() } };
      case 'sense-mouse-down':
        return { type: 'sense-mouse-down', params: {} };
      case 'sense-mouse-x':
        return { type: 'sense-mouse-x', params: {} };
      case 'sense-mouse-y':
        return { type: 'sense-mouse-y', params: {} };
      case 'sense-distance':
        return { type: 'sense-distance', params: { target: f.TARGET || 'mouse-pointer' } };
      case 'sense-timer':
        return { type: 'sense-timer', params: {} };
      case 'sense-loudness':
        return { type: 'sense-loudness', params: {} };
      case 'sense-answer':
        return { type: 'sense-answer', params: {} };
      case 'sense-of':
        return { type: 'sense-of', params: { property: f.PROPERTY || 'backdrop', object: f.OBJECT || 'Stage' } };
      case 'sense-current':
        return { type: 'sense-current', params: { unit: f.CURRENTMENU || 'year' } };
      case 'sense-days-since-2000':
        return { type: 'sense-days-since-2000', params: {} };
      case 'sense-username':
        return { type: 'sense-username', params: {} };
      case 'sense-touching-color':
        return { type: 'sense-touching-color', params: { color: f.COLOR || '#4a4a4a' } };
      case 'sense-color-touching-color':
        return {
          type: 'sense-color-touching-color',
          params: { color1: f.COLOR || '#8b4513', color2: f.COLOR2 || '#ff69b4' },
        };
      case 'sense-mouse-down':
        return { type: 'sense-mouse-down', params: {} };
      case 'sense-mouse-x':
        return { type: 'sense-mouse-x', params: {} };
      case 'sense-mouse-y':
        return { type: 'sense-mouse-y', params: {} };
      case 'sense-distance':
        return { type: 'sense-distance', params: { target: f.TARGET || 'mouse-pointer' } };
      case 'logic-bool':
        return { type: 'logic-bool', params: { value: String(f.VALUE ?? f.value ?? 'true').toLowerCase() } };
      case 'logic-compare':
        return {
          type: 'logic-compare',
          params: {
            left: f.LEFT ?? f.left ?? 0,
            op: f.OP || f.op || '=',
            right: f.RIGHT ?? f.right ?? 0,
          },
        };
      case 'logic-and':
      case 'logic-or':
        return {
          type: short,
          params: {
            op: short === 'logic-or' ? 'or' : (f.OP || 'and'),
            left: f.LEFT ?? 'true',
            right: f.RIGHT ?? 'true',
            left_type: 'logic-bool',
            right_type: 'logic-bool',
          },
        };
      case 'logic-not':
        return { type: 'logic-not', params: { value: String(f.VALUE ?? 'false').toLowerCase() } };
      case 'math-add':
      case 'math-mult':
      case 'math-random':
      case 'math-round':
      case 'math-modulo':
      case 'text-join':
      case 'text-length':
      case 'text-letter':
      case 'text-contains':
        return blocklyNodeToEvaluatorBlock({
          type: SHORT_TO_SCRATCH_BLOCKLY[short] || `operator_${short.replace(/-/g, '_')}`,
          fields: f,
          values: node.values,
        }) || { type: short, params: {} };
      default:
        return { type: 'logic-bool', params: { value: 'false' } };
    }
  }

  return { type: 'logic-bool', params: { value: 'false' } };
}

function normalizeSpriteBlocks(blocks) {
  return columnizeBlocks(blocks || [], {
    laneX: BLOCK_LANE_X,
    startY: BLOCK_START_Y,
    gap: BLOCK_STACK_GAP,
  });
}

function normalizeSpritesBlockStacks(sprites) {
  return (sprites || []).map((sprite) => ({
    ...sprite,
    blocks: normalizeSpriteBlocks(sprite.blocks),
  }));
}

function blocklyNodesToGameBlocks(nodes = []) {
  const mapType = {
    ...BLOCKLY_TO_GAME_TYPE,
    bb_event_start: 'event-start',
    bb_event_keypress: 'event-keypress',
    bb_sprite_move: 'sprite-move',
    bb_sprite_turn: 'sprite-turn',
    bb_sprite_turn_right: 'sprite-turn-right',
    bb_sprite_turn_left: 'sprite-turn-left',
    bb_sprite_goto: 'sprite-goto',
    bb_sprite_goto_sprite: 'sprite-goto-sprite',
    bb_sprite_glide: 'sprite-glide',
    bb_sprite_point_dir: 'sprite-point-dir',
    bb_sprite_point_towards: 'sprite-point-towards',
    bb_sprite_changex: 'sprite-changex',
    bb_sprite_changey: 'sprite-changey',
    bb_sprite_setx: 'sprite-setx',
    bb_sprite_sety: 'sprite-sety',
    bb_sprite_setsize: 'sprite-setsize',
    bb_sprite_show: 'sprite-show',
    bb_sprite_hide: 'sprite-hide',
    bb_sprite_if_bounce: 'sprite-if-bounce',
    bb_sprite_rotation_style: 'sprite-rotation-style',
    motion_movesteps: 'sprite-move',
    motion_turnright: 'sprite-turn-right',
    motion_turnleft: 'sprite-turn-left',
    motion_gotoxy: 'sprite-goto',
    motion_glideto: 'sprite-glide',
    motion_pointindirection: 'sprite-point-dir',
    motion_pointtowards: 'sprite-point-towards',
    motion_changex: 'sprite-changex',
    motion_setx: 'sprite-setx',
    motion_changey: 'sprite-changey',
    motion_sety: 'sprite-sety',
    motion_ifonedgebounce: 'sprite-if-bounce',
    motion_setrotationstyle: 'sprite-rotation-style',
    bb_motion_move: 'motion-move',
    bb_motion_turn: 'motion-turn',
    bb_motion_turn_right: 'motion-turn-right',
    bb_motion_turn_left: 'motion-turn-left',
    bb_motion_glide: 'motion-glide',
    bb_motion_glide_xy: 'motion-glide-to-xy',
    bb_motion_glide_sprite: 'motion-glide-to-sprite',
    bb_motion_glide_random: 'motion-glide-to-random-position',
    bb_motion_glide_mouse: 'motion-glide-to-mouse-pointer',
    bb_motion_jump: 'motion-jump',
    bb_motion_setx: 'motion-setx',
    bb_motion_sety: 'motion-sety',
    bb_motion_changex: 'motion-changex',
    bb_motion_changey: 'motion-changey',
    bb_motion_goto: 'motion-goto',
    bb_motion_goto_xy: 'motion-goto-xy',
    bb_motion_goto_sprite: 'motion-goto-sprite',
    bb_motion_goto_random: 'motion-goto-random-position',
    bb_motion_goto_mouse: 'motion-goto-mouse-pointer',
    bb_motion_rotation: 'motion-rotation',
    bb_motion_change_angle: 'motion-change-angle',
    bb_motion_speed: 'motion-speed',
    bb_motion_stop: 'motion-stop',
    bb_motion_wrap: 'motion-wrap',
    bb_motion_if_bounce: 'motion-if-on-edge-bounce',
    bb_motion_point: 'motion-point',
    bb_motion_point_dir: 'motion-point-dir',
    bb_motion_point_towards: 'motion-point-towards',
    bb_motion_set_rotation_style: 'motion-set-rotation-style',
    bb_control_wait: 'control-wait',
    bb_loop_repeat: 'loop-repeat',
    bb_loop_forever: 'loop-forever',
    bb_logic_if: 'logic-if',
    control_wait: 'control-wait',
    control_repeat: 'loop-repeat',
    control_forever: 'loop-forever',
    control_if: 'logic-if',
    control_if_else: 'logic-if',
    control_waituntil: 'control-wait-until',
    control_repeatuntil: 'control-repeat-until',
    control_stop: 'control-stop',
    control_start_as_clone: 'event-clone',
    control_create_clone: 'control-create-clone',
    control_delete_this_clone: 'control-delete-clone',
    bb_sound_play: 'sound-play',
    bb_sound_stop: 'sound-stop',
    bb_sound_volume: 'sound-set-volume',
    sound_play: 'sound-play',
    sound_playuntildone: 'sound-play-until-done',
    sound_stopallsounds: 'sound-stop',
    sound_changeeffectby: 'sound-change-effect',
    sound_seteffectto: 'sound-set-effect',
    sound_cleareffects: 'sound-clear-effects',
    sound_setvolumeto: 'sound-set-volume',
    sound_volume: 'sound-get-volume',
    bb_sense_timer: 'sense-timer',
    bb_math_add: 'math-add',
    bb_math_mult: 'math-mult',
    bb_math_random: 'math-random',
    bb_math_round: 'math-round',
    bb_sprite_say: 'sprite-say',
    bb_var_create: 'var-create',
    bb_var_set: 'var-set',
    bb_var_change: 'var-change',
    bb_list_create: 'list-create',
    bb_list_add: 'list-add',
    bb_list_get: 'list-get',
    bb_looks_grow: 'looks-grow',
    bb_looks_shrink: 'looks-shrink',
    bb_looks_costume: 'looks-costume',
    bb_looks_next_costume: 'looks-next-costume',
    bb_looks_backdrop: 'looks-backdrop',
    bb_looks_next_backdrop: 'looks-next-backdrop',
    bb_looks_forward_layers: 'looks-forward-layers',
    bb_looks_color_effect: 'looks-color-effect',
    bb_looks_ghost_effect: 'looks-ghost-effect',
    bb_looks_clear_effects: 'looks-clear-effects',
    bb_looks_front: 'looks-front',
    bb_looks_back: 'looks-back',
    bb_looks_think: 'looks-think',
    looks_sayforsecs: 'sprite-say',
    looks_say: 'looks-say',
    looks_thinkforsecs: 'sprite-think',
    looks_think: 'looks-think',
    looks_costumename: 'looks-costume',
    looks_nextcostume: 'looks-next-costume',
    looks_backdropname: 'looks-backdrop',
    looks_nextbackdrop: 'looks-next-backdrop',
    looks_changeSizeBy: 'looks-change-size',
    looks_setSizeTo: 'sprite-setsize',
    looks_changeEffectBy: 'looks-change-effect',
    looks_setEffectTo: 'looks-set-effect',
    looks_clearEffects: 'looks-clear-effects',
    looks_show: 'sprite-show',
    looks_hide: 'sprite-hide',
    looks_gotofrontback: 'looks-goto-layer',
    looks_goforwardbackwardlayers: 'looks-layer-step',
    looks_costumenumbername: 'looks-costume-reporter',
    looks_backdropnumbername: 'looks-backdrop-reporter',
    looks_size: 'sprite-size-reporter',
    bb_physics_velocity: 'physics-velocity',
    bb_physics_gravity: 'physics-gravity',
    bb_physics_jump: 'physics-jump',
    bb_physics_allow_double_jump: 'physics-allow-double-jump',
    bb_physics_friction: 'physics-friction',
    bb_physics_push: 'physics-push',
    bb_physics_bounce: 'physics-bounce',
    bb_game_score_add: 'game-score-add',
    bb_game_score_set: 'game-score-set',
    bb_game_set_lives: 'game-set-lives',
    bb_action_print: 'action-print',
    bb_action_alert: 'action-alert',
    bb_body_video_on: 'body-video-on',
  };
  let y = BLOCK_START_Y;
  const out = [];
  let stackOrder = 0;

  const pushNode = (node) => {
    const rawType = node?.type;
    const blocklyType = resolveBlocklyNodeType(node) || rawType;
    const f = node.fields || {};
    let type = blocklyTypeToGameType(blocklyType) || mapType[blocklyType] || blocklyType;
    if (
      rawType === 'motion_setrotationstyle'
      || blocklyType === 'motion_setrotationstyle'
      || blocklyType === 'bb_sprite_rotation_style'
      || blocklyType === 'bb_motion_set_rotation_style'
      || blocklyType === 'sprite-rotation-style'
      || blocklyType === 'motion-set-rotation-style'
    ) {
      type = 'sprite-rotation-style';
    }
    if (rawType === 'motion_goto' || blocklyType === 'motion_goto') {
      const target = String(f.TARGET || 'random').toLowerCase();
      if (target === 'random') type = 'sprite-goto-random-position';
      else if (target === 'mouse') type = 'sprite-goto-mouse-pointer';
      else type = 'sprite-goto-sprite';
    } else if (rawType === 'motion_glide' || blocklyType === 'motion_glide') {
      const target = String(f.TARGET || 'random').toLowerCase();
      if (target === 'random') type = 'motion-glide-to-random-position';
      else if (target === 'mouse') type = 'motion-glide-to-mouse-pointer';
      else type = 'motion-glide-to-sprite';
    } else if (rawType === 'looks_gotofrontback' || blocklyType === 'looks_gotofrontback') {
      type = String(f.LAYER || 'front').toLowerCase() === 'back' ? 'looks-back' : 'looks-front';
    } else if (rawType === 'looks_goforwardbackwardlayers' || blocklyType === 'looks_goforwardbackwardlayers') {
      type = 'looks-forward-layers';
    }
    if (blocklyType?.includes('body') || type?.includes('body')) {
      console.log('[pushNode] Body block detected! node.type:', node?.type, 'blocklyType:', blocklyType, 'final type:', type, 'BLOCK_DEFS has type:', !!BLOCK_DEFS[type]);
    }
    if (!type || !BLOCK_DEFS[type]) {
      const label = String(f.LABEL || f.BLOCK_NAME || '').trim().toLowerCase();
      const short = SIDEBAR_TO_TYPE[label];
      if (short) {
        const mapped = blocklyTypeToGameType(shortTypeToBlocklyType(short));
        if (mapped && BLOCK_DEFS[mapped]) type = mapped;
      }
    }
    if (OPERATOR_GAME_TYPES.has(type)) {
      return;
    }
    if (LOOKS_REPORTER_GAME_TYPES.has(type)) {
      return;
    }
    if (LIST_REPORTER_GAME_TYPES.has(type)) {
      return;
    }
    if (!type || !BLOCK_DEFS[type]) {
      const isLibStub =
        rawType === 'bb_generic_stack'
        || String(rawType || '').startsWith('bb_lib_');
      if (isLibStub) {
        (node?.statements?.DO || []).forEach(pushNode);
        (node?.statements?.ELSE || []).forEach(pushNode);
      }
      return;
    }
    const base = { ...BLOCK_DEFS[type], params: { ...BLOCK_DEFS[type].params } };
    if (blocklyType === 'motion_goto' && type === 'sprite-goto-sprite') {
      base.params.sprite = String(f.TARGET || 'Sprite1');
    }
    if (blocklyType === 'motion_glide' && type === 'motion-glide-to-sprite') {
      base.params.sprite = String(f.TARGET || 'Sprite1');
    }
    if (type === 'event-keypress') base.params.key = f.KEY || 'space';
    if (type === 'sprite-move') base.params.steps = String(f.STEPS || 10);
    if (type === 'sprite-turn') base.params.degrees = String(f.DEGREES || 90);
    if (type === 'sprite-turn-right') {
      base.params.degrees = String(readBlocklyFieldOrValue(node, f, 'DEGREES', 15));
    }
    if (type === 'sprite-turn-left') {
      base.params.degrees = String(readBlocklyFieldOrValue(node, f, 'DEGREES', 15));
    }
    if (type === 'sprite-goto') { base.params.x = String(f.X || 0); base.params.y = String(f.Y || 0); }
    if (type === 'sprite-goto-sprite' || type === 'motion-goto-sprite') base.params.sprite = String(f.SPRITE || f.TARGET || 'any');
    if (type === 'motion-glide-to-sprite') base.params.sprite = String(f.SPRITE || f.TARGET || 'any');
    if (blocklyType === 'motion_movesteps') base.params.steps = String(f.STEPS || 10);
    if (blocklyType === 'motion_turnright' || blocklyType === 'motion_turnleft') {
      base.params.degrees = String(readBlocklyFieldOrValue(node, f, 'DEGREES', 15));
    }
    if (blocklyType === 'motion_gotoxy') {
      base.params.x = String(f.X || 0);
      base.params.y = String(f.Y || 0);
    }
    if (blocklyType === 'motion_glideto') {
      base.params.secs = String(f.SECS || 1);
      base.params.x = String(f.X || 0);
      base.params.y = String(f.Y || 0);
    }
    if (blocklyType === 'motion_pointindirection') base.params.degrees = String(f.DIRECTION || 90);
    if (blocklyType === 'motion_pointtowards') base.params.target = String(f.TOWARDS || f.TARGET || 'mouse-pointer');
    if (blocklyType === 'motion_changex') base.params.amount = String(f.DX || 10);
    if (blocklyType === 'motion_changey') base.params.amount = String(f.DY || 10);
    if (blocklyType === 'motion_setx') base.params.x = String(f.X || 0);
    if (blocklyType === 'motion_sety') base.params.y = String(f.Y || 0);
    if (blocklyType === 'motion_setrotationstyle') {
      base.params.style = String(readBlocklyFieldOrValue(node, f, 'STYLE', 'allaround'));
    }
    if (type === 'sprite-glide') {
      base.params.secs = String(f.SECS || 1);
      base.params.x = String(f.X || 0);
      base.params.y = String(f.Y || 0);
    }
    if (type === 'sprite-point-dir') base.params.degrees = String(f.DEGREES || 90);
    if (type === 'sprite-point-towards') base.params.target = String(f.TARGET || 'mouse-pointer');
    if (type === 'sprite-setx') base.params.x = String(f.X || 0);
    if (type === 'sprite-sety') base.params.y = String(f.Y || 0);
    if (type === 'sprite-if-bounce') {} // No params needed
    if (type === 'sprite-rotation-style') {
      base.params.style = String(readBlocklyFieldOrValue(node, f, 'STYLE', 'allaround'));
    }
    if (type === 'motion-glide') {
      base.params.x = String(f.X || 0);
      base.params.y = String(f.Y || 0);
      base.params.secs = String(f.SECS || 1);
    }
    if (type === 'motion-jump') base.params.power = String(f.POWER || 15);
    if (type === 'motion-point') {} // No params needed
    if (type === 'motion-stop') {} // No params needed
    if (type === 'motion-wrap') {} // No params needed
    if (type === 'sprite-changex') {
      base.params.amount = String(f.DX ?? f.AMOUNT ?? f.amount ?? 10);
    }
    if (type === 'sprite-changey') {
      base.params.amount = String(f.DY ?? f.AMOUNT ?? f.amount ?? 10);
    }
    if (type === 'sprite-point-dir' || type === 'motion-point-dir') {
      base.params.degrees = String(
        f.DIRECTION ?? f.DEGREES ?? f.direction ?? f.degrees ?? base.params.degrees ?? 90,
      );
    }
    if (type === 'sprite-rotation-style' || type === 'motion-set-rotation-style') {
      const styleVal = f.STYLE ?? f.style ?? base.params.style ?? 'all around';
      base.params.style = String(styleVal);
    }
    if (type === 'control-wait') {
      base.params.secs = String(readBlocklyFieldOrValue(node, f, 'DURATION', f.SECONDS ?? 1));
    }
    if (type === 'loop-repeat') {
      base.params.times = String(readBlocklyFieldOrValue(node, f, 'TIMES', f.TIMES ?? 10));
    }
    if (type === 'control-stop') base.params.stopOption = String(f.STOP_OPTION ?? 'all');
    if (type === 'control-create-clone') {
      base.params.sprite = String(f.CLONE_OPTION ?? f.sprite ?? 'myself');
    }
    if (type === 'sound-play' || type === 'sound-play-until-done') {
      base.params.sound = String(f.SOUND ?? f.SOUND_MENU ?? 'pop');
    }
    if (type === 'sound-set-volume' || type === 'sound-volume') {
      base.params.volume = String(f.VOLUME ?? f.volume ?? 100);
    }
    if (type === 'sound-change-effect' || type === 'sound-set-effect') {
      base.params.effect = String(f.EFFECT ?? f.effect ?? 'pitch');
      base.params.value = String(
        readBlocklyFieldOrValue(node, f, 'VALUE', type === 'sound-change-effect' ? 10 : 0),
      );
    }
    if (type === 'math-add' || blocklyType === 'operator_add') {
      base.params.a = String(f.NUM1 ?? f.A ?? 1);
      base.params.b = String(f.NUM2 ?? f.B ?? 1);
      base.params.op = f.OP === 'subtract' ? '-' : '+';
    }
    if (type === 'math-mult' || blocklyType === 'operator_multiply') {
      base.params.a = String(f.NUM1 ?? f.A ?? 2);
      base.params.b = String(f.NUM2 ?? f.B ?? 3);
      base.params.op = f.OP === 'divide' || f.OP === '÷' ? '/' : '×';
    }
    if (type === 'math-random' || blocklyType === 'operator_random') {
      base.params.min = String(f.FROM ?? f.MIN ?? 1);
      base.params.max = String(f.TO ?? f.MAX ?? 100);
    }
    if (type === 'math-round' || blocklyType === 'operator_round' || blocklyType === 'operator_mathop') {
      base.params.op = String(f.OP || f.MOP || f.OPERATOR || 'round');
      base.params.value = String(f.NUM ?? f.VALUE ?? 0);
    }
    if (type === 'math-modulo' || blocklyType === 'operator_mod') {
      base.params.a = String(f.NUM1 ?? 0);
      base.params.b = String(f.NUM2 ?? 1);
    }
    if (type === 'logic-compare' || blocklyType === 'operator_gt' || blocklyType === 'operator_lt' || blocklyType === 'operator_equals' || blocklyType === 'operator_compare') {
      if (blocklyType === 'operator_gt') base.params.op = '>';
      else if (blocklyType === 'operator_lt') base.params.op = '<';
      else if (blocklyType === 'operator_equals') base.params.op = '=';
      else if (blocklyType === 'operator_compare') {
        const opMap = { gt: '>', lt: '<', eq: '=' };
        base.params.op = opMap[f.OPERATOR] || '>';
      }
      base.params.left = String(f.OPERAND1 ?? 0);
      base.params.right = String(f.OPERAND2 ?? 0);
    }
    if ((type === 'logic-and' || type === 'logic-or') && blocklyType?.startsWith('operator_')) {
      base.params.op = String(f.OPERATOR || (type === 'logic-or' ? 'or' : 'and'));
      const boolVal = (v) => (String(v || 'TRUE').toUpperCase() === 'FALSE' ? 'false' : 'true');
      base.params.left = boolVal(f.OPERAND1);
      base.params.right = boolVal(f.OPERAND2);
    }
    if (type === 'logic-not' && blocklyType === 'operator_not') {
      base.params.value = String(f.OPERAND || 'FALSE').toUpperCase() === 'TRUE' ? 'true' : 'false';
    }
    if (type === 'text-join' && blocklyType === 'operator_join') {
      base.params.a = String(f.STRING1 ?? '');
      base.params.b = String(f.STRING2 ?? '');
    }
    if (type === 'text-length' && blocklyType === 'operator_length') {
      base.params.text = String(f.STRING ?? '');
    }
    if (type === 'text-letter' && blocklyType === 'operator_letterof') {
      base.params.letter = String(f.LETTER ?? 1);
      base.params.text = String(f.STRING ?? '');
    }
    if (type === 'text-contains' && blocklyType === 'operator_contains') {
      base.params.text = String(f.STRING1 ?? '');
      base.params.search = String(f.STRING2 ?? '');
    }
    if (type === 'action-print') {
      if (blocklyType === 'bb_action_print') {
        base.params.message = String(f.MESSAGE ?? f.message ?? 'Hello!');
      }
    }
    if (type === 'action-alert') {
      base.params.message = String(f.MESSAGE ?? f.message ?? 'Notice');
    }
    if (type === 'motion-speed') base.params.speed = String(f.SPEED ?? f.speed ?? 5);
    if (type === 'list-create') base.params.name = String(f.NAME ?? f.name ?? 'myList');
    if (type === 'list-add') {
      base.params.list = String(f.LIST ?? f.list ?? 'myList');
      base.params.item = listBlocklyParam(node, f, 'ITEM', 'thing');
    }
    if (type === 'list-delete') {
      base.params.list = String(f.LIST ?? f.list ?? 'myList');
      base.params.index = listBlocklyParam(node, f, 'INDEX', 1);
    }
    if (type === 'list-delete-all' || type === 'list-show' || type === 'list-hide') {
      base.params.list = String(f.LIST ?? f.list ?? 'myList');
    }
    if (type === 'list-insert') {
      base.params.list = String(f.LIST ?? f.list ?? 'myList');
      base.params.index = listBlocklyParam(node, f, 'INDEX', 1);
      base.params.item = listBlocklyParam(node, f, 'ITEM', 'thing');
    }
    if (type === 'list-replace') {
      base.params.list = String(f.LIST ?? f.list ?? 'myList');
      base.params.index = listBlocklyParam(node, f, 'INDEX', 1);
      base.params.item = listBlocklyParam(node, f, 'ITEM', 'thing');
    }
    if (type === 'list-item' || type === 'list-get') {
      base.params.list = String(f.LIST ?? f.list ?? 'myList');
      base.params.index = listBlocklyParam(node, f, 'INDEX', 1);
    }
    if (type === 'list-index') {
      base.params.list = String(f.LIST ?? f.list ?? 'myList');
      base.params.item = listBlocklyParam(node, f, 'ITEM', 'thing');
    }
    if (type === 'list-length') {
      base.params.list = String(f.LIST ?? f.list ?? 'myList');
    }
    if (type === 'list-contains') {
      base.params.list = String(f.LIST ?? f.list ?? 'myList');
      base.params.item = listBlocklyParam(node, f, 'ITEM', 'thing');
    }
    if (type === 'var-create') { base.params.name = String(f.NAME || 'myVar'); base.params.value = String(f.VALUE ?? f.value ?? 0); }
    if (type === 'var-set') { base.params.name = String(f.NAME || f.name || 'myVar'); base.params.value = String(f.VALUE ?? f.value ?? 0); }
    if (type === 'var-change') { base.params.name = String(f.NAME || 'myVar'); base.params.amount = String(f.AMOUNT || 1); }
    if (type === 'sprite-setsize') base.params.size = String(f.SIZE ?? f.size ?? 100);
    if (blocklyType === 'looks_setSizeTo') base.params.size = String(f.SIZE ?? f.size ?? 100);
    if (type === 'looks-grow' || type === 'looks-shrink') base.params.amount = String(f.AMOUNT ?? f.amount ?? 10);
    if (type === 'looks-costume') base.params.costume = String(f.COSTUME ?? f.costume ?? '1');
    if (type === 'looks-backdrop') base.params.backdrop = String(f.BACKDROP ?? f.backdrop ?? '1');
    if (type === 'looks-forward-layers') {
      base.params.layers = String(f.NUM ?? f.LAYERS ?? f.layers ?? 1);
      base.params.direction = String(f.DIRECTION ?? f.direction ?? 'forward').toLowerCase();
    }
    if (type === 'looks-color-effect' || type === 'looks-ghost-effect') base.params.value = String(f.VALUE ?? f.value ?? 0);
    if (type === 'sprite-say' || type === 'looks-say') {
      base.params.text = String(
        readBlocklyFieldOrValue(node, f, 'MESSAGE', f.TEXT ?? f.text ?? f.message ?? 'Hello!'),
      );
      const secsVal = readBlocklyFieldOrValue(node, f, 'SECS', f.SECONDS ?? f.secs ?? '');
      base.params.secs = String(secsVal ?? '');
    }
    if (type === 'sprite-think' || type === 'looks-think') {
      base.params.text = String(
        readBlocklyFieldOrValue(node, f, 'MESSAGE', f.TEXT ?? f.text ?? f.message ?? 'Hmm...'),
      );
      const secsVal = readBlocklyFieldOrValue(node, f, 'SECS', f.SECONDS ?? f.secs ?? '');
      base.params.secs = String(secsVal ?? '');
    }
    if (type === 'looks-costume-reporter') {
      base.params.numberName = String(f.NUMBER_NAME ?? f.number_name ?? 'number');
    }
    if (type === 'looks-backdrop-reporter') {
      base.params.numberName = String(f.NUMBER_NAME ?? f.number_name ?? 'number');
    }
    if (type === 'looks-change-size') {
      base.params.amount = String(f.CHANGE ?? f.AMOUNT ?? f.amount ?? 10);
    }
    if (type === 'looks-change-effect' || type === 'looks-set-effect') {
      base.params.effect = String(f.EFFECT ?? f.effect ?? 'color');
      base.params.value = String(f.CHANGE ?? f.VALUE ?? f.value ?? (type === 'looks-change-effect' ? 25 : 0));
    }
    if (type === 'looks-goto-layer') {
      base.params.layer = String(f.LAYER ?? f.layer ?? 'front').toLowerCase();
    }
    if (type === 'looks-layer-step') {
      base.params.direction = String(f.DIRECTION ?? f.direction ?? 'forward').toLowerCase();
      base.params.layers = String(f.NUM ?? f.LAYERS ?? f.layers ?? 1);
    }
    if (type === 'motion-move') base.params.steps = String(f.STEPS ?? f.steps ?? 10);
    if (type === 'motion-turn' || type === 'motion-turn-right') {
      base.params.degrees = String(readBlocklyFieldOrValue(node, f, 'DEGREES', 15));
    }
    if (type === 'motion-turn-left') {
      base.params.degrees = String(readBlocklyFieldOrValue(node, f, 'DEGREES', 15));
    }
    if (type === 'motion-goto' || type === 'motion-goto-xy') { base.params.x = String(f.X ?? f.x ?? 0); base.params.y = String(f.Y ?? f.y ?? 0); }
    if (type === 'motion-goto-sprite') base.params.sprite = String(f.SPRITE ?? f.sprite ?? 'any');
    if (type === 'motion-glide' || type === 'motion-glide-to-xy') { base.params.secs = String(f.SECS ?? f.secs ?? 1); base.params.x = String(f.X ?? f.x ?? 0); base.params.y = String(f.Y ?? f.y ?? 0); }
    if (type === 'motion-glide-to-sprite') { base.params.secs = String(f.SECS ?? f.secs ?? 1); base.params.sprite = String(f.SPRITE ?? f.sprite ?? 'any'); }
    if (type === 'motion-glide-to-random-position') base.params.secs = String(f.SECS ?? f.secs ?? 1);
    if (type === 'motion-glide-to-mouse-pointer') base.params.secs = String(f.SECS ?? f.secs ?? 1);
    if (type === 'motion-setx') base.params.x = String(f.X ?? f.x ?? 0);
    if (type === 'motion-sety') base.params.y = String(f.Y ?? f.y ?? 0);
    if (type === 'motion-changex') base.params.amount = String(f.AMOUNT ?? f.amount ?? 10);
    if (type === 'motion-changey') base.params.amount = String(f.AMOUNT ?? f.amount ?? 10);
    if (type === 'motion-rotation') base.params.rotation = String(f.ROTATION ?? f.rotation ?? 0);
    if (type === 'motion-change-angle') base.params.angle = String(f.ANGLE ?? f.angle ?? 15);
    if (type === 'motion-point-dir') base.params.direction = String(f.DIRECTION ?? f.direction ?? 0);
    if (type === 'motion-point-towards') base.params.sprite = String(f.SPRITE ?? f.sprite ?? 'mouse-pointer');
    if (type === 'motion-if-on-edge-bounce') {} // No params needed
    if (type === 'motion-set-rotation-style') base.params.style = String(f.STYLE ?? f.style ?? 'all around');
    if (type === 'physics-velocity') {
      base.params.vx = String(f.VX ?? f.vx ?? 0);
      base.params.vy = String(f.VY ?? f.vy ?? 0);
    }
    if (type === 'physics-gravity') base.params.amount = String(f.AMOUNT ?? f.amount ?? 2400);
    if (type === 'physics-jump') base.params.power = String(f.POWER ?? f.power ?? 560);
    if (type === 'physics-allow-double-jump') base.params.enable = String(f.ENABLE ?? f.enable ?? 'true');
    if (type === 'physics-friction') base.params.amount = String(f.AMOUNT ?? f.amount ?? 0.9);
    if (type === 'physics-push') {
      base.params.direction = String(f.DIRECTION ?? f.direction ?? 0);
      base.params.force = String(f.FORCE ?? f.force ?? 5);
    }
    if (type === 'game-score-add') base.params.amount = String(f.AMOUNT ?? f.amount ?? 10);
    if (type === 'game-score-set') base.params.value = String(f.VALUE ?? f.value ?? 0);
    if (type === 'game-set-lives') base.params.value = String(f.VALUE ?? f.value ?? 3);
    if (type === 'sense-touching') {
      base.params.target = objectFieldToTarget(f.OBJECT || f.TOUCHINGOBJECTMENU || f.TARGET || 'mouse');
    }
    if (type === 'sense-touching-sprite') {
      base.params.sprite = String(f.SPRITE || f.OBJECT || f.TARGET || 'any');
    }
    if (type === 'sense-touching-color') {
      base.params.color = String(f.COLOR || f.COLOUR || '#ff0000');
    }
    if (type === 'sense-color-touching-color') {
      base.params.color1 = String(f.COLOR || '#ff0000');
      base.params.color2 = String(f.COLOR2 || '#0000ff');
    }
    if (type === 'sense-distance') {
      base.params.target = objectFieldToTarget(f.OBJECT || f.DISTANCEMENU || 'mouse');
    }
    if (type === 'sense-of') {
      base.params.property = String(f.PROPERTY || 'backdrop');
      base.params.object = String(f.OBJECT || 'Stage');
    }
    if (type === 'sense-current') {
      base.params.unit = String(f.CURRENTMENU || f.unit || 'year');
    }
    if (type === 'sense-key') {
      base.params.key = String(f.KEY || f.KEY_OPTION || 'space').toLowerCase();
    }
    if (type === 'action-ask') {
      base.params.prompt = String(
        readBlocklyFieldOrValue(node, f, 'QUESTION', f.QUESTION ?? f.prompt ?? 'What is your name?'),
      );
    }
    if (type === 'sense-set-drag-mode') {
      const mode = String(f.DRAG_MODE || f.mode || 'not draggable').toLowerCase();
      base.params.mode = mode.includes('not') ? 'not draggable' : 'draggable';
    }
    if (type === 'qr-video-on') {
      base.params.state = String(f.STATE ?? f.state ?? 'on');
      base.params.transparency = String(f.TRANSPARENCY ?? f.transparency ?? 0);
    }
    if (type === 'qr-bounding-box') {
      base.params.mode = String(f.MODE ?? f.mode ?? 'show');
    }
    if (type === 'qr-position') {
      base.params.axis = String(f.AXIS ?? f.axis ?? 'x');
      base.params.point = String(f.POINT ?? f.point ?? 'center');
    }
    if (type === 'body-video-on') {
      base.params.state = String(f.STATE ?? f.state ?? 'on');
      base.params.transparency = String(f.TRANSPARENCY ?? f.transparency ?? 0);
      console.log('[blocklyNodesToGameBlocks] Body-video-on block params:');
      console.log('  f.STATE=', f.STATE, 'f.state=', f.state);
      console.log('  Extracted state=', base.params.state);
      console.log('  f.TRANSPARENCY=', f.TRANSPARENCY, 'f.transparency=', f.transparency);
      console.log('  Extracted transparency=', base.params.transparency);
    }

    const pushSynthetic = (synType) => {
      out.push({
        id: Date.now() + Math.random() + out.length,
        type: synType,
        label: synType === 'logic-else' ? 'Else' : 'End if',
        icon: '🧠',
        color: '#5c6bc0',
        category: 'logic',
        params: {},
        x: BLOCK_LANE_X,
        y,
      });
      y += BLOCK_STACK_GAP;
    };

    if (type === 'control-wait-until') {
      base.params._cond = conditionBlocklyNodeToEvaluatorBlock(node?.values?.CONDITION);
      out.push({
        id: Date.now() + Math.random() + out.length,
        type,
        blocklyType: rawType || blocklyType,
        stackOrder: stackOrder++,
        ...base,
        x: BLOCK_LANE_X,
        y,
      });
      y += BLOCK_STACK_GAP;
      return;
    }

    if (type === 'control-repeat-until') {
      base.params._cond = conditionBlocklyNodeToEvaluatorBlock(node?.values?.CONDITION);
      out.push({
        id: Date.now() + Math.random() + out.length,
        type,
        blocklyType: rawType || blocklyType,
        stackOrder: stackOrder++,
        ...base,
        x: BLOCK_LANE_X,
        y,
      });
      y += BLOCK_STACK_GAP;
      (node?.statements?.SUBSTACK || node?.statements?.DO || []).forEach(pushNode);
      out.push({
        id: Date.now() + Math.random() + out.length,
        type: 'loop-end-loop',
        label: 'End loop',
        icon: '🔁',
        color: '#FF7043',
        category: 'control',
        params: {},
        stackOrder: stackOrder++,
        x: BLOCK_LANE_X,
        y,
      });
      y += BLOCK_STACK_GAP;
      return;
    }

    if (type === 'loop-repeat' || type === 'loop-forever') {
      out.push({
        id: Date.now() + Math.random() + out.length,
        type,
        blocklyType: rawType || blocklyType,
        stackOrder: stackOrder++,
        ...base,
        x: BLOCK_LANE_X,
        y,
      });
      y += BLOCK_STACK_GAP;
      (node?.statements?.SUBSTACK || node?.statements?.DO || []).forEach(pushNode);
      out.push({
        id: Date.now() + Math.random() + out.length,
        type: 'loop-end-loop',
        label: 'End loop',
        icon: '🔁',
        color: '#FF7043',
        category: 'control',
        params: {},
        stackOrder: stackOrder++,
        x: BLOCK_LANE_X,
        y,
      });
      y += BLOCK_STACK_GAP;
      return;
    }

    // If/else: runtime execBody expects logic-else / logic-end-if markers; condition lives in params._cond.
    if (type === 'logic-if') {
      base.params._cond = conditionBlocklyNodeToEvaluatorBlock(node?.values?.CONDITION);
      out.push({
        id: Date.now() + Math.random() + out.length,
        type,
        ...base,
        x: BLOCK_LANE_X,
        y,
      });
      y += BLOCK_STACK_GAP;
      const doNodesIf = node?.statements?.DO || node?.statements?.SUBSTACK || [];
      const elseNodesIf = node?.statements?.ELSE || node?.statements?.SUBSTACK2 || [];
      doNodesIf.forEach(pushNode);
      if (elseNodesIf.length) {
        pushSynthetic('logic-else');
        elseNodesIf.forEach(pushNode);
      }
      pushSynthetic('logic-end-if');
      return;
    }

    out.push({
      id: Date.now() + Math.random() + out.length,
      type,
      blocklyType: rawType || blocklyType,
      stackOrder: stackOrder++,
      ...base,
      x: BLOCK_LANE_X,
      y,
    });
    y += BLOCK_STACK_GAP;
    const doNodes = node?.statements?.DO || node?.statements?.SUBSTACK || [];
    doNodes.forEach(pushNode);
    const elseNodes = node?.statements?.ELSE || node?.statements?.SUBSTACK2 || [];
    elseNodes.forEach(pushNode);
  };
  nodes.forEach(pushNode);

  return normalizeSpriteBlocks(out);
}

/* ─── Sprite Library (SVG-based characters) ─── */
const SPRITE_LIBRARY = [
  {
    category: 'People',
    items: [
      { name: 'Adventurer', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="#2563eb"/></svg>`, color: '#2563eb', customImage: '/assets/characters/chibi/chibi_adventurer.png?v=20' },
      { name: 'Explorer', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="#16a34a"/></svg>`, color: '#16a34a', customImage: '/assets/characters/chibi/chibi_explorer.png?v=20' },
      { name: 'Sporty', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="#dc2626"/></svg>`, color: '#dc2626', customImage: '/assets/characters/chibi/chibi_sporty.png?v=20' },
      { name: 'Witch', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="#9333ea"/></svg>`, color: '#9333ea', customImage: '/assets/characters/chibi/chibi_witch.png?v=20' },
      { name: 'Ranger', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="#15803d"/></svg>`, color: '#15803d', customImage: '/assets/characters/chibi/chibi_ranger.png?v=20' },
      { name: 'Mechanic', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="#ca8a04"/></svg>`, color: '#ca8a04', customImage: '/assets/characters/chibi/chibi_mechanic.png?v=20' },
      { name: 'Robot', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="#64748b"/></svg>`, color: '#64748b', customImage: '/assets/characters/chibi/chibi_robot.png?v=20' },
      { name: 'Knight', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="#475569"/></svg>`, color: '#475569', customImage: '/assets/characters/chibi/chibi_knight.png?v=20' },
      { name: 'Archer', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="#b45309"/></svg>`, color: '#b45309', customImage: '/assets/characters/chibi/chibi_archer.png?v=20' },
      { name: 'Ninja', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="#1e293b"/></svg>`, color: '#1e293b', customImage: '/assets/characters/chibi/chibi_ninja.png?v=20' },
      { name: 'Pirate Captain', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="#1a3a52"/></svg>`, color: '#1a3a52', customImage: '/assets/characters/chibi/chibi_pirate_captain.png?v=20' },
      { name: 'Astronaut', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="#e2e8f0"/></svg>`, color: '#e2e8f0', customImage: '/assets/characters/chibi/chibi_astronaut.png?v=20' },
      { name: 'Fire Mage', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="#ea580c"/></svg>`, color: '#ea580c', customImage: '/assets/characters/chibi/chibi_fire_mage.png?v=20' },
      { name: 'Dino', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="#84cc16"/></svg>`, color: '#84cc16', customImage: '/assets/characters/chibi/chibi_dino.png?v=20' },
      { name: 'Ice Mage', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="#06b6d4"/></svg>`, color: '#06b6d4', customImage: '/assets/characters/chibi/chibi_ice_mage.png?v=20' },
    ]
  },
  {
    category: 'Animals',
    items: [
      { name: 'Fox', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="${c||'#ea580c'}"/></svg>`, color: '#ea580c', customImage: '/assets/characters/animals/animal_fox.png?v=8' },
      { name: 'Wolf', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="${c||'#64748b'}"/></svg>`, color: '#64748b', customImage: '/assets/characters/animals/animal_wolf.png?v=8' },
      { name: 'Bear', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="${c||'#92400e'}"/></svg>`, color: '#92400e', customImage: '/assets/characters/animals/animal_bear.png?v=8' },
      { name: 'Rabbit', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="${c||'#f8fafc'}"/></svg>`, color: '#f8fafc', customImage: '/assets/characters/animals/animal_rabbit.png?v=8' },
      { name: 'Deer', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="${c||'#b45309'}"/></svg>`, color: '#b45309', customImage: '/assets/characters/animals/animal_deer.png?v=8' },
      { name: 'Turtle', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="${c||'#22c55e'}"/></svg>`, color: '#22c55e', customImage: '/assets/characters/animals/animal_turtle.png?v=8' },
      { name: 'Owl', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="${c||'#78716c'}"/></svg>`, color: '#78716c', customImage: '/assets/characters/animals/animal_owl.png?v=8' },
      { name: 'Bird', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="${c||'#3b82f6'}"/></svg>`, color: '#3b82f6', customImage: '/assets/characters/animals/animal_bird.png?v=8' },
      { name: 'Penguin', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="${c||'#1e293b'}"/></svg>`, color: '#1e293b', customImage: '/assets/characters/animals/animal_penguin.png?v=8' },
      { name: 'Frog', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="${c||'#22c55e'}"/></svg>`, color: '#22c55e', customImage: '/assets/characters/animals/animal_frog.png?v=8' },
      { name: 'Cat', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="${c||'#1e293b'}"/></svg>`, color: '#1e293b', customImage: '/assets/characters/animals/animal_cat.png?v=8' },
      { name: 'Panda', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="${c||'#f8fafc'}"/></svg>`, color: '#f8fafc', customImage: '/assets/characters/animals/animal_panda.png?v=8' },
      { name: 'Cow', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="${c||'#f5f5f5'}"/></svg>`, color: '#f5f5f5', customImage: '/assets/characters/animals/animal_cow.png?v=8' },
      { name: 'Pig', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="${c||'#f472b6'}"/></svg>`, color: '#f472b6', customImage: '/assets/characters/animals/animal_pig.png?v=8' },
      { name: 'Sheep', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="${c||'#e2e8f0'}"/></svg>`, color: '#e2e8f0', customImage: '/assets/characters/animals/animal_sheep.png?v=8' },
      { name: 'Squirrel', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="${c||'#92400e'}"/></svg>`, color: '#92400e', customImage: '/assets/characters/animals/animal_squirrel.png?v=8' },
      { name: 'Raccoon', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="${c||'#6b7280'}"/></svg>`, color: '#6b7280', customImage: '/assets/characters/animals/animal_raccoon.png?v=8' },
      { name: 'Lion', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" fill="${c||'#eab308'}"/></svg>`, color: '#eab308', customImage: '/assets/characters/animals/animal_lion.png?v=8' },
    ]
  },
  ...RASTER_SPRITE_LIBRARY,
];

(() => {
  const objects = SPRITE_LIBRARY.find((c) => c.category === 'Objects');
  if (!objects) return;
  const starters = [
    { name: 'Star', svg: (c) => `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><polygon points="32,4 40,24 60,24 44,38 50,58 32,46 14,58 20,38 4,24 24,24" fill="${c || '#f59e0b'}"/></svg>`, color: '#f59e0b' },
    { name: 'Platform', svg: (c) => `<svg viewBox="0 0 128 32" xmlns="http://www.w3.org/2000/svg"><rect width="128" height="32" rx="4" fill="${c || '#78716c'}"/></svg>`, color: '#78716c', defaultW: 128, defaultH: 24 },
  ];
  const names = new Set(objects.items.map((i) => i.name));
  objects.items = [...starters.filter((s) => !names.has(s.name)), ...objects.items];
})();

/* ─── Background Library ─── */
const BACKGROUNDS = [
  { name: 'White', draw: (ctx, w, h) => { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h); }},
  { name: 'Sky', draw: (ctx, w, h) => { const g = ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'#87CEEB'); g.addColorStop(1,'#e0f2fe'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); ctx.fillStyle='#22c55e'; ctx.fillRect(0,h*0.75,w,h*0.25); for(let i=0;i<3;i++){ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(80+i*160,60+i*20,50,18,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(100+i*160,55+i*20,40,16,0,0,Math.PI*2);ctx.fill();}}},
  { name: 'Space', draw: (ctx, w, h) => { const g = ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'#0c0c2e'); g.addColorStop(1,'#1a1a4e'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); ctx.fillStyle='#fff'; for(let i=0;i<80;i++){const x=(i*73+17)%w;const y=(i*41+29)%h;const r=((i%3)+0.5);ctx.globalAlpha=0.3+Math.random()*0.7;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();} ctx.globalAlpha=1;}},
  { name: 'City', draw: (ctx, w, h) => { const g = ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'#1e293b'); g.addColorStop(0.6,'#334155'); g.addColorStop(1,'#475569'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); const bldgs=[[20,180],[60,240],[120,160],[170,280],[240,200],[300,260],[360,180],[400,220],[440,300]]; bldgs.forEach(([x,bh])=>{ctx.fillStyle='#1e293b';ctx.fillRect(x,h-bh,50,bh);for(let wy=h-bh+10;wy<h-10;wy+=25){for(let wx=x+8;wx<x+42;wx+=14){ctx.fillStyle=Math.random()>0.3?'#fde68a':'#334155';ctx.fillRect(wx,wy,8,12);}}});}},
  { name: 'Ocean', draw: (ctx, w, h) => { const g = ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'#bae6fd'); g.addColorStop(0.4,'#38bdf8'); g.addColorStop(1,'#0369a1'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); ctx.strokeStyle='rgba(255,255,255,0.2)'; ctx.lineWidth=2; for(let i=0;i<6;i++){ctx.beginPath();for(let x=0;x<w;x+=4){ctx.lineTo(x,120+i*45+Math.sin(x*0.02+i)*12);}ctx.stroke();}}},
  { name: 'Forest', draw: (ctx, w, h) => { ctx.fillStyle='#86efac'; ctx.fillRect(0,0,w,h); const g = ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'#bbf7d0'); g.addColorStop(1,'#4ade80'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); for(let i=0;i<12;i++){const tx=i*42+10;const th=80+Math.random()*60;ctx.fillStyle='#92400e';ctx.fillRect(tx+12,h-th,8,th);ctx.fillStyle='#16a34a';ctx.beginPath();ctx.moveTo(tx+16,h-th-40);ctx.lineTo(tx-6,h-th+20);ctx.lineTo(tx+38,h-th+20);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(tx+16,h-th-20);ctx.lineTo(tx-2,h-th+30);ctx.lineTo(tx+34,h-th+30);ctx.closePath();ctx.fill();}}},
  { name: 'Desert', draw: (ctx, w, h) => { const g = ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'#fed7aa'); g.addColorStop(0.5,'#fdba74'); g.addColorStop(1,'#c2410c'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); ctx.fillStyle='#ea580c'; for(let i=0;i<3;i++){const dx=80+i*170;ctx.beginPath();ctx.moveTo(dx,h*0.5);ctx.lineTo(dx+40,h*0.2);ctx.lineTo(dx+80,h*0.5);ctx.fill();} ctx.fillStyle='#fbbf24'; ctx.beginPath(); ctx.arc(w-60,50,30,0,Math.PI*2); ctx.fill();}},
  { name: 'Underwater', draw: (ctx, w, h) => { const g = ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'#0ea5e9'); g.addColorStop(1,'#0c4a6e'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); ctx.fillStyle='rgba(255,255,255,0.06)'; for(let i=0;i<20;i++){const bx=(i*47+13)%w;const by=(i*89+37)%h;const br=2+i%4;ctx.beginPath();ctx.arc(bx,by,br,0,Math.PI*2);ctx.fill();} ctx.fillStyle='#166534'; for(let i=0;i<8;i++){const sx=i*65+10;ctx.beginPath();for(let y=h;y>h-60-i*8;y-=2){ctx.lineTo(sx+Math.sin(y*0.08)*8,y);}ctx.lineTo(sx,h);ctx.fill();}}},
  { name: 'Sunset', draw: (ctx, w, h) => { const g = ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'#1e1b4b'); g.addColorStop(0.3,'#7c3aed'); g.addColorStop(0.5,'#f97316'); g.addColorStop(0.7,'#fbbf24'); g.addColorStop(1,'#fde68a'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); ctx.fillStyle='#fbbf24'; ctx.beginPath(); ctx.arc(w/2,h*0.55,40,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#0c0c2e'; ctx.fillRect(0,h*0.8,w,h*0.2);}},
  { name: 'Snow', draw: (ctx, w, h) => { const g = ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'#e0f2fe'); g.addColorStop(1,'#f0f9ff'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); ctx.fillStyle='#fff'; ctx.fillRect(0,h*0.7,w,h*0.3); ctx.fillStyle='rgba(255,255,255,0.8)'; for(let i=0;i<40;i++){ctx.beginPath();ctx.arc((i*67+11)%w,(i*43+7)%h,1.5+i%2,0,Math.PI*2);ctx.fill();}}},
  { name: 'Jungle', draw: (ctx, w, h) => { const g = ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'#064e3b'); g.addColorStop(0.5,'#065f46'); g.addColorStop(1,'#047857'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); ctx.fillStyle='#022c22'; for(let i=0;i<8;i++){const bx=i*65; ctx.beginPath();ctx.moveTo(bx,h);ctx.lineTo(bx+10,h-80-i*10);ctx.lineTo(bx+20,h);ctx.fill(); ctx.fillStyle='#065f46';ctx.beginPath();ctx.ellipse(bx+10,h-60-i*10,18,30,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#022c22';}}},
  { name: 'Cave', draw: (ctx, w, h) => { const g = ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'#1c1917'); g.addColorStop(0.5,'#292524'); g.addColorStop(1,'#1c1917'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); ctx.fillStyle='#44403c'; for(let i=0;i<6;i++){const sx=(i*83+20)%w; ctx.beginPath();ctx.moveTo(sx,0);ctx.lineTo(sx+15,30+i*8);ctx.lineTo(sx+30,0);ctx.fill();ctx.beginPath();ctx.moveTo(sx+40,h);ctx.lineTo(sx+55,h-25-i*6);ctx.lineTo(sx+70,h);ctx.fill();} ctx.fillStyle='#78716c'; for(let i=0;i<15;i++){ctx.beginPath();ctx.arc((i*53+7)%w,(i*71+13)%(h-20)+10,1+i%2,0,Math.PI*2);ctx.fill();}}},
  { name: 'Lava', draw: (ctx, w, h) => { const g = ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'#450a0a'); g.addColorStop(0.5,'#7f1d1d'); g.addColorStop(1,'#ef4444'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h); ctx.fillStyle='#f97316'; for(let i=0;i<4;i++){ctx.beginPath();for(let x=0;x<w;x+=4){ctx.lineTo(x,h*0.75+Math.sin(x*0.03+i*2)*12+i*8);}ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.fill();ctx.fillStyle='#fbbf24';}}},
  { name: 'Candy', draw: (ctx, w, h) => { ctx.fillStyle='#fce7f3'; ctx.fillRect(0,0,w,h); const colors=['#f9a8d4','#c084fc','#67e8f9','#86efac','#fde68a']; for(let i=0;i<10;i++){ctx.fillStyle=colors[i%colors.length]; ctx.beginPath();ctx.arc((i*97+30)%w,(i*61+20)%h,20+i%3*8,0,Math.PI*2);ctx.globalAlpha=0.2;ctx.fill();} ctx.globalAlpha=1; ctx.fillStyle='#22c55e'; ctx.fillRect(0,h*0.8,w,h*0.2);}},
  { name: 'Dungeon', draw: (ctx, w, h) => { ctx.fillStyle='#1c1917'; ctx.fillRect(0,0,w,h); for(let row=0;row<h;row+=24){const offset=row%48===0?0:24;for(let col=offset;col<w+48;col+=48){ctx.fillStyle='#44403c';ctx.fillRect(col,row,45,22);}} ctx.fillStyle='#f97316';ctx.globalAlpha=0.1;ctx.beginPath();ctx.arc(w/2,h/2,90,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}},
  { name: 'Kingdom', draw: (ctx, w, h) => { const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'#1e3a5f');g.addColorStop(1,'#1e293b');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);ctx.fillStyle='#fff';for(let i=0;i<50;i++){ctx.globalAlpha=0.15+i%3*0.1;ctx.beginPath();ctx.arc((i*71+13)%w,(i*47+9)%(h*0.65),1+i%2,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;[[10,130],[70,160],[160,120],[250,170],[340,130],[430,170]].forEach(([tx,th])=>{ctx.fillStyle='#1e293b';ctx.fillRect(tx,h-th,50,th);for(let c=tx;c<tx+50;c+=14){ctx.fillStyle='#334155';ctx.fillRect(c,h-th-14,10,14);}for(let wy=h-th+10;wy<h-6;wy+=20){for(let wx=tx+6;wx<tx+44;wx+=12){ctx.fillStyle=(wx+wy)%2===0?'#fde68a':'#1e293b';ctx.fillRect(wx,wy,8,10);}}}); ctx.fillStyle='#0f172a';ctx.fillRect(0,h*0.86,w,h*0.14);}},
  { name: 'Neon City', draw: (ctx, w, h) => { ctx.fillStyle='#030712';ctx.fillRect(0,0,w,h);const cols=['#f0abfc','#818cf8','#22d3ee','#34d399','#fb7185'];[[0,220],[50,180],[100,250],[150,160],[200,240],[250,200],[300,230],[350,170],[400,260],[430,190],[460,220]].forEach(([bx,bh],i)=>{const col=cols[i%cols.length];ctx.fillStyle='#0f172a';ctx.fillRect(bx,h-bh,50,bh);ctx.strokeStyle=col;ctx.lineWidth=1;ctx.globalAlpha=0.5;ctx.strokeRect(bx,h-bh,50,bh);ctx.globalAlpha=1;for(let wy=h-bh+6;wy<h-4;wy+=18){for(let wx=bx+6;wx<bx+44;wx+=12){if((wx+wy)%3!==0){ctx.fillStyle=col;ctx.globalAlpha=0.18;ctx.fillRect(wx,wy,8,10);ctx.globalAlpha=1;}}}ctx.fillStyle=col;ctx.globalAlpha=0.35;ctx.fillRect(bx,h-bh,50,3);ctx.globalAlpha=1;});}},
  { name: 'Mountain', draw: (ctx, w, h) => { const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'#bfdbfe');g.addColorStop(0.65,'#7dd3fc');g.addColorStop(1,'#38bdf8');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);ctx.fillStyle='#64748b';ctx.beginPath();ctx.moveTo(0,h);ctx.lineTo(80,h*0.35);ctx.lineTo(180,h*0.6);ctx.lineTo(260,h*0.22);ctx.lineTo(360,h*0.5);ctx.lineTo(440,h*0.14);ctx.lineTo(w,h*0.42);ctx.lineTo(w,h);ctx.closePath();ctx.fill();ctx.fillStyle='#e2e8f0';ctx.beginPath();ctx.moveTo(220,h*0.3);ctx.lineTo(260,h*0.22);ctx.lineTo(300,h*0.3);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(400,h*0.22);ctx.lineTo(440,h*0.14);ctx.lineTo(480,h*0.22);ctx.closePath();ctx.fill();ctx.fillStyle='#4ade80';ctx.fillRect(0,h*0.72,w,h*0.28);}},
  { name: 'Rainbow', draw: (ctx, w, h) => { const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'#bfdbfe');g.addColorStop(1,'#dbeafe');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);['#ef4444','#f97316','#fbbf24','#4ade80','#60a5fa','#818cf8','#c084fc'].forEach((col,i)=>{ctx.strokeStyle=col;ctx.lineWidth=7;ctx.beginPath();ctx.arc(w/2,h+30,(7-i)*42+20,Math.PI,Math.PI*2);ctx.stroke();});ctx.fillStyle='#22c55e';ctx.fillRect(0,h*0.8,w,h*0.2);for(let i=0;i<3;i++){ctx.fillStyle='#fff';ctx.globalAlpha=0.85;ctx.beginPath();ctx.ellipse(60+i*190,64,44,16,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(84+i*190,52,34,16,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;}}},
  { name: 'Graveyard', draw: (ctx, w, h) => { const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'#1a1a2e');g.addColorStop(1,'#0d1117');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);ctx.fillStyle='#fff';for(let i=0;i<60;i++){ctx.globalAlpha=0.05+i%3*0.06;ctx.beginPath();ctx.arc((i*73+17)%w,(i*41+29)%(h*0.7),0.8+i%2,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;ctx.fillStyle='#14532d';ctx.fillRect(0,h*0.72,w,h*0.28);for(let i=0;i<7;i++){const gx=30+i*72;ctx.fillStyle='#78716c';ctx.beginPath();ctx.rect(gx-10,h*0.52,20,34);ctx.fill();ctx.beginPath();ctx.arc(gx,h*0.52,10,Math.PI,Math.PI*2);ctx.fill();ctx.fillStyle='#57534e';ctx.fillRect(gx-2,h*0.57,4,10);ctx.fillRect(gx-7,h*0.61,14,4);}}},
];

function findSpriteTemplate(name) {
  for (const cat of SPRITE_LIBRARY) {
    const found = cat.items.find(i => i.name === name);
    if (found) return found;
  }
  return null;
}

function renderSvgToImage(svgString, w, h) {
  return new Promise((resolve) => {
    const img = new Image();
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}

/** Stage size for bitmap costumes — keeps aspect ratio (avoids squishing tall sprites). */
function fitSpriteDimensions(naturalW, naturalH, maxDim = 160) {
  if (!naturalW || !naturalH) return { w: 48, h: 48 };
  const scale = maxDim / Math.max(naturalW, naturalH);
  return {
    w: Math.max(16, Math.round(naturalW * scale)),
    h: Math.max(16, Math.round(naturalH * scale)),
  };
}

function loadImageDimensions(src, options = {}) {
  const maxDim = options.maxDim ?? (String(src).includes('/chibi/') ? 360 : 240);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(fitSpriteDimensions(img.naturalWidth, img.naturalHeight, maxDim));
    img.onerror = () => resolve({ w: 48, h: 48 });
    img.src = src;
  });
}

function SpriteThumb({ svgKey, color, customImage, size = 32 }) {
  const [imgFailed, setImgFailed] = useState(false);
  useEffect(() => {
    setImgFailed(false);
  }, [customImage, svgKey]);
  if (customImage && !imgFailed) {
    return (
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          overflow: 'visible',
        }}
      >
        <img
          src={customImage}
          alt=""
          style={{
            maxWidth: size,
            maxHeight: size,
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
            objectPosition: 'center bottom',
            imageRendering: 'high-quality',
            display: 'block',
            flexShrink: 0,
          }}
          onError={() => setImgFailed(true)}
        />
      </div>
    );
  }
  const tpl = findSpriteTemplate(svgKey);
  if (!tpl) return <span style={{ fontSize: size * 0.6 }}>❓</span>;
  const svgStr = tpl.svg(color || tpl.color);
  const encoded = btoa(unescape(encodeURIComponent(svgStr)));
  return <img src={`data:image/svg+xml;base64,${encoded}`} alt={svgKey} width={size} height={size} style={{ imageRendering: 'auto' }} />;
}

/* ─── Default stage: single Adventurer (blue chibi) on an empty canvas ─── */
const defaultSprites = [
  {
    id: 1,
    name: 'Adventurer',
    svgKey: 'Adventurer',
    category: 'People',
    customImage: '/assets/characters/chibi/chibi_adventurer.png?v=20',
    x: STAGE_W / 2 - 43,
    y: STAGE_H / 2 - 81,
    w: 86,
    h: 162,
    rotation: 90,
    direction: 90,
    visible: true,
    color: null,
    layer: 1,
    physicsRole: 'actor',
    blocks: [],
    blocklyXml: '',
    costumes: [],
    sounds: [],
    initialVars: {},
  },
];

/** Old bundled demo sprites — replace with Adventurer-only startup. */
const LEGACY_STARTUP_SPRITE_NAMES = new Set(['Star', 'Platform', 'Ninja', 'Adventurer']);

function shouldResetToAdventurerOnly(sprites) {
  if (!sprites?.length) return true;
  const names = sprites.map((s) => s.name);
  if (names.some((n) => n === 'Star' || n === 'Platform')) return true;
  if (names.length > 1 && names.every((n) => LEGACY_STARTUP_SPRITE_NAMES.has(n))) return true;
  return false;
}

/** Bump legacy 48×48 raster sprites so they use sharper on-stage size. */
function bumpTinyRasterSprites(sprites) {
  return (sprites || []).map((s) => {
    if (!s.customImage || s.w > 48 || s.h > 48) return s;
    const scale = 1.75;
    const nw = Math.max(16, Math.round(s.w * scale));
    const nh = Math.max(16, Math.round(s.h * scale));
    return {
      ...s,
      w: nw,
      h: nh,
      x: Math.round(s.x - (nw - s.w) / 2),
      y: Math.round(s.y - (nh - s.h) / 2),
    };
  });
}

function normalizeStartupSprites(sprites) {
  const cleaned = bumpTinyRasterSprites(stripStarterAutoScripts(sprites || []));
  if (shouldResetToAdventurerOnly(cleaned)) return defaultSprites;
  return cleaned;
}

const STARTER_BLOCK_TYPES = new Set([
  'event-start',
  'event_whenflagclicked',
  'sprite-move',
  'motion-move',
  'motion_movesteps',
  'bb_sprite_move',
  'bb_event_start',
]);

function isDefaultStarterScript(blocks = [], blocklyXml = '') {
  const list = Array.isArray(blocks) ? blocks : [];
  const xml = String(blocklyXml || '').toLowerCase();
  if (xml) {
    const blockTags = xml.match(/<block\b/g) || [];
    const hasFlag = xml.includes('event_whenflagclicked') || xml.includes('bb_event_start');
    const hasMove = xml.includes('motion_movesteps') || xml.includes('bb_sprite_move');
    if (hasFlag && hasMove && blockTags.length <= 2) return true;
    if (hasFlag && hasMove && blockTags.length <= 3 && xml.includes('next')) return true;
  }
  if (!list.length) return false;
  if (list.length > 2) return false;
  return list.every((b) => STARTER_BLOCK_TYPES.has(String(b?.type || '')));
}

function stripStarterAutoScripts(sprites = []) {
  // Remove old hardcoded starter scripts that could trigger movement/jump unexpectedly.
  const starterBlockIds = new Set([
    101, 102, 103, 104,
    201, 202, 203, 204, 205, 206,
    301, 302, 303, 304, 305, 306, 307, 308,
  ]);

  return (sprites || []).map((s) => {
    const blocks = (s.blocks || []).filter((b) => !starterBlockIds.has(Number(b?.id)));
    if (isDefaultStarterScript(blocks, s.blocklyXml)) {
      return { ...s, blocks: [], blocklyXml: '' };
    }
    return { ...s, blocks };
  });
}

/* ═══════════════════════════════════════════════════
   Game Builder — Scratch-like Layout
   Left: Block coding area (per sprite)
   Right: Stage + Sprite pane
   ═══════════════════════════════════════════════════ */
export default function GameBuilder() {
  const { user } = useUser();
  const canvasRef = useRef(null);
  const listStoreRef = useRef({});
  const listVisibleRef = useRef({});
  const [listMonitors, setListMonitors] = useState({});
  const pipelineRef = useRef(null);  // WebcamManager for camera system
  const cameraStateRef = useRef({ isOn: false, initialized: false, webcam: null, animFrameId: null });  // Track camera state
  const cameraCanvasRef = useRef(null);  // Canvas for rendering camera within stage
  const mouseRef = useRef({ x: STAGE_W / 2, y: STAGE_H / 2 });
  const mouseDownRef = useRef(false);
  const playDragSpriteRef = useRef(null);
  const loudnessMonitorRef = useRef(null);
  const [askDialog, setAskDialog] = useState(null);
  const spritesRef = useRef(null);
  const drawRef = useRef(null);
  const blocklyWorkspaceRef = useRef(null);
  const isPlayingRef = useRef(false);
  const blockAreaRef = useRef(null);
  const [sprites, setSprites] = useState(() => {
    try {
      const s = localStorage.getItem('cv_gamebuilder_sprites');
      const loaded = s ? normalizeStartupSprites(JSON.parse(s)) : defaultSprites;
      try {
        localStorage.setItem('cv_gamebuilder_sprites', JSON.stringify(loaded));
      } catch {
        /* ignore quota */
      }
      return loaded;
    } catch {
      return defaultSprites;
    }
  });

  useEffect(() => {
    spritesRef.current = sprites;
  }, [sprites]);

  useEffect(() => {
    cleanupQrSidebarOverlay();
  }, []);

  const [selected, setSelected] = useState(null);
  const selectedRef = useRef(null);
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);
  const [isPlaying, setIsPlaying] = useState(false);
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      listStoreRef.current = {};
      listVisibleRef.current = {};
      setListMonitors({});
    }
  }, [isPlaying]);
  const [extensionsOpen, setExtensionsOpen] = useState(false);
  const [enabledExtensions, setEnabledExtensions] = useState(() => readEnabledExtensionIds());

  const toggleExtension = useCallback((id) => {
    setEnabledExtensions(prev => {
      const set = new Set(prev);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      const next = Array.from(set);
      writeEnabledExtensionIds(next);
      return next;
    });
  }, []);

  // Mode scope guard: Warn if leaving Game Builder mode unexpectedly
  useEffect(() => {
    const unsubscribe = AppMode.onModeChange(({ oldMode, newMode, page }) => {
      if (oldMode === AppMode.MODES.GAME_BUILDER && newMode !== AppMode.MODES.GAME_BUILDER) {
        console.log('[GameBuilder] Mode changed from Game Builder to ' + newMode + ', blocks disabled');
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleExtensionsChanged = () => {
      setEnabledExtensions(readEnabledExtensionIds());
    };
    const openExt = () => setExtensionsOpen(true);
    window.addEventListener(BB_OPEN_EXTENSIONS, openExt);
    window.addEventListener('bb-extensions-changed', handleExtensionsChanged);
    return () => {
      window.removeEventListener(BB_OPEN_EXTENSIONS, openExt);
      window.removeEventListener('bb-extensions-changed', handleExtensionsChanged);
    };
  }, []);

  // Auto-select first sprite when component mounts or sprites change
  useEffect(() => {
    if (!selected && sprites.length > 0) {
      setSelected(sprites[0].id);
    }
  }, [sprites, selected]);

  const [background, setBackground] = useState(readInitialStageBackdrop);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cv_gamebuilder_bg');
      if (!saved || LEGACY_DEFAULT_BACKDROPS.has(saved)) {
        localStorage.setItem('cv_gamebuilder_bg', DEFAULT_STAGE_BACKDROP);
        setBackground(DEFAULT_STAGE_BACKDROP);
      }
    } catch {
      setBackground(DEFAULT_STAGE_BACKDROP);
    }
  }, []);
  const [savedFlash, setSavedFlash] = useState(false);
  const [submitFlash, setSubmitFlash] = useState(false);
  const [pendingAssignment] = useState(() => {
    try { const a = sessionStorage.getItem('bb-pending-assignment'); return a ? JSON.parse(a) : null; } catch { return null; }
  });
  const [viewingSubmission] = useState(() => {
    try { const v = sessionStorage.getItem('bb-viewing-submission'); return v ? JSON.parse(v) : null; } catch { return null; }
  });
  const [exporting, setExporting] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [libCategory, setLibCategory] = useState('People');
  const spriteCatScrollRef = useRef(null);

  const scrollSpriteCategories = useCallback((direction) => {
    const el = spriteCatScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * 140, behavior: 'smooth' });
  }, []);

  const onSpriteCategoryWheel = useCallback((event) => {
    const el = spriteCatScrollRef.current;
    if (!el || event.deltaY === 0) return;
    event.preventDefault();
    el.scrollLeft += event.deltaY;
  }, []);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [score, setScore] = useState(0);
  const [draggingSprite, setDraggingSprite] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizingSprite, setResizingSprite] = useState(null);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [resizeStart, setResizeStart] = useState(null);
  const animRef = useRef(null);
  const runtimeRef = useRef(null);  // GameRuntime instance
  const gameStateRef = useRef(null);  // Current game state
  const playSpritesRef = useRef([]);
  const imgCacheRef = useRef({});
  const playBackdropRef = useRef(null);
  const playBackdropNameRef = useRef(null);

  const invalidateSpriteImageCache = useCallback((sprite) => {
    const cache = imgCacheRef.current;
    if (!cache || !sprite?.id) return;
    const idStr = String(sprite.id);
    const tplPrefix = String(sprite.svgKey || '');
    Object.keys(cache).forEach((key) => {
      if (key.includes(idStr) || (tplPrefix && key.startsWith(tplPrefix))) {
        delete cache[key];
      }
    });
  }, []);

  const spriteVarsRef = useRef({});  // Per-sprite state
  const globalVarsRef = useRef({});  // Shared global state
  const [customBackgrounds, setCustomBackgrounds] = useState([]);

  const getBackdropNames = useCallback(() => [
    ...BACKGROUNDS.map((b) => b.name),
    ...(customBackgrounds || []).map((b) => b.name),
  ], [customBackgrounds]);

  const getPlayBackdropNames = useCallback(() => {
    const custom = (customBackgrounds || []).map((b) => b.name);
    const merged = [...STAGE_BACKDROP_NAMES];
    custom.forEach((name) => {
      if (name && !merged.includes(name)) merged.push(name);
    });
    return merged;
  }, [customBackgrounds]);

  const applyPlayBackdrop = useCallback((nameOrNumber) => {
    const names = getPlayBackdropNames();
    applyStageBackdrop(names, nameOrNumber, {
      playBackdropRef,
      playBackdropNameRef,
      setBackground,
    });
    requestAnimationFrame(() => {
      drawRef.current?.(playSpritesRef.current || [], { playing: true });
    });
  }, [getPlayBackdropNames, setBackground]);

  const applyPlayBackdropRef = useRef(applyPlayBackdrop);
  applyPlayBackdropRef.current = applyPlayBackdrop;

  /** Push Blockly edits into the live play snapshot and apply looks immediately. */
  const syncLivePlayFromBlockly = useCallback((spriteId, blocks, xmlText = '') => {
    if (!isPlayingRef.current || !playSpritesRef.current?.length) return;
    const playSprite = playSpritesRef.current.find((s) => s.id === spriteId);
    if (!playSprite) return;

    playSprite.blocks = (blocks || []).map((b) => ({ ...b, params: { ...(b.params || {}) } }));
    if (xmlText) playSprite.blocklyXml = xmlText;

    resyncSpriteThreadsOnBlockChange(playSprite, playSpritesRef.current);

    const looksChanged = runLooksBlocksOnSprite(playSprite, playSprite.blocks, {
      invalidateCache: invalidateSpriteImageCache,
      applyBackdrop: (name) => applyPlayBackdropRef.current?.(name),
      getBackdropNames: getPlayBackdropNames,
      playBackdropRef,
    });
    const soundChanged = runSoundBlocksOnSprite(playSprite, playSprite.blocks);

    if (looksChanged || soundChanged) {
      requestAnimationFrame(() => {
        drawRef.current?.(playSpritesRef.current || [], { playing: true });
      });
    }
  }, [getPlayBackdropNames, invalidateSpriteImageCache]);

  const pickBackdrop = useCallback((name) => {
    setBackground(name);
    imgCacheRef.current = {};
    if (isPlayingRef.current) {
      applyPlayBackdropRef.current?.(name);
    }
  }, [setBackground]);

  const spriteUploadRef = useRef(null);
  const bgUploadRef = useRef(null);
  const stageFsRef = useRef(null);
  const [stageFs, setStageFs] = useState(false);
  const [gameState, setGameState] = useState({ score: 0, lives: 3, level: 1 });
  const faceVideoStateRef = useRef({ enabled: false });

  useEffect(() => {
    const handler = () => setStageFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const toggleStageFs = () => {
    if (!stageFs) stageFsRef.current?.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  // Block editing state
  const [draggingBlock, setDraggingBlock] = useState(null);
  const [blockDragOffset, setBlockDragOffset] = useState({ x: 0, y: 0 });
  const [hoveredBlock, setHoveredBlock] = useState(null);

  const selectedSprite = sprites.find(s => s.id === selected);
  const selectedSpriteXml = selectedSprite?.blocklyXml || '';
  
  // Selected sprite owns its own block list; no name/owner cross-filtering needed.
  const selectedSpriteBlocks = useMemo(() => (selectedSprite?.blocks || []), [selectedSprite?.id, selectedSprite?.blocks]);

  const saveProject = () => {
    try {
      localStorage.setItem('cv_gamebuilder_sprites', JSON.stringify(sprites));
      localStorage.setItem('cv_gamebuilder_bg', background);
    } catch {}
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1800);
  };

  const exportGame = () => {
    setExporting(true);
    try {
      // Serialize sprite SVGs as base64 data URLs
      const spriteData = sprites.filter(s => s.visible !== false).map(s => {
        let dataUrl = '';
        if (s.customImage) {
          dataUrl = s.customImage;
        } else {
          const tpl = findSpriteTemplate(s.svgKey);
          if (tpl) {
            const svgStr = tpl.svg(s.color || tpl.color);
            const encoded = btoa(unescape(encodeURIComponent(svgStr)));
            dataUrl = `data:image/svg+xml;base64,${encoded}`;
          }
        }
        // Extract movement blocks
        const moveBlocks = (s.blocks || []).map(b => ({ type: b.type, params: b.params || {} }));
        return { id: s.id, name: s.name, x: s.x, y: s.y, w: s.w || 48, h: s.h || 48, rotation: s.rotation || 0, dataUrl, moveBlocks };
      });

      // Build background drawing code string for the exported HTML
      const bgMap = {
        Sky: `var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#87CEEB');g.addColorStop(1,'#e0f2fe');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.fillStyle='#22c55e';ctx.fillRect(0,H*.75,W,H*.25);for(var i=0;i<3;i++){ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(80+i*160,60+i*20,50,18,0,0,Math.PI*2);ctx.fill();}`,
        Space: `var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0c0c2e');g.addColorStop(1,'#1a1a4e');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';for(var i=0;i<80;i++){var x=(i*73+17)%W,y=(i*41+29)%H,r=((i%3)+0.5);ctx.globalAlpha=0.5;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;`,
        City: `var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1e293b');g.addColorStop(0.6,'#334155');g.addColorStop(1,'#475569');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);var bldgs=[[20,180],[60,240],[120,160],[170,280],[240,200],[300,260],[360,180],[400,220],[440,300]];bldgs.forEach(function(b){ctx.fillStyle='#1e293b';ctx.fillRect(b[0],H-b[1],50,b[1]);});`,
        Ocean: `var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#bae6fd');g.addColorStop(0.4,'#38bdf8');g.addColorStop(1,'#0369a1');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);`,
        Forest: `var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#bbf7d0');g.addColorStop(1,'#4ade80');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);`,
        Desert: `var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#fed7aa');g.addColorStop(0.5,'#fdba74');g.addColorStop(1,'#c2410c');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);`,
        Underwater: `var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0ea5e9');g.addColorStop(1,'#0c4a6e');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);`,
        White: `ctx.fillStyle='#ffffff';ctx.fillRect(0,0,W,H);`,
        Sunset: `var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1e1b4b');g.addColorStop(0.3,'#7c3aed');g.addColorStop(0.5,'#f97316');g.addColorStop(0.7,'#fbbf24');g.addColorStop(1,'#fde68a');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);`,
        Snow: `var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#e0f2fe');g.addColorStop(1,'#f0f9ff');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.fillRect(0,H*.7,W,H*.3);`,
        Jungle: `var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#064e3b');g.addColorStop(1,'#047857');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);`,
        Cave: `var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1c1917');g.addColorStop(1,'#1c1917');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);`,
        Lava: `var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#450a0a');g.addColorStop(0.5,'#7f1d1d');g.addColorStop(1,'#ef4444');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);`,
        Candy: `ctx.fillStyle='#fce7f3';ctx.fillRect(0,0,W,H);`,
        Dungeon: `ctx.fillStyle='#1c1917';ctx.fillRect(0,0,W,H);`,
        Kingdom: `var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1e3a5f');g.addColorStop(1,'#1e293b');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);`,
        'Neon City': `ctx.fillStyle='#030712';ctx.fillRect(0,0,W,H);`,
        Mountain: `var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#bfdbfe');g.addColorStop(1,'#38bdf8');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.fillStyle='#64748b';ctx.fillRect(0,H*.5,W,H*.5);`,
        Rainbow: `var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#bfdbfe');g.addColorStop(1,'#dbeafe');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);`,
        Graveyard: `var g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1a1a2e');g.addColorStop(1,'#0d1117');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);ctx.fillStyle='#14532d';ctx.fillRect(0,H*.72,W,H*.28);`,
      };
      const bgCode = bgMap[background] || bgMap.White;

      const htmlString = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>ByteBuddies Game</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0f172a; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: 'Segoe UI', Arial, sans-serif; color: #fff; }
  #title-bar { font-size: 22px; font-weight: 700; letter-spacing: 1px; margin-bottom: 10px; color: #a78bfa; text-shadow: 0 0 12px #7c3aed88; }
  #canvas-wrap { position: relative; border-radius: 10px; overflow: hidden; box-shadow: 0 0 40px #7c3aed55, 0 8px 32px #0008; border: 2px solid #7c3aed88; }
  canvas { display: block; }
  #hud { display: flex; align-items: center; justify-content: space-between; width: 480px; margin-top: 8px; }
  #score-display { font-size: 16px; font-weight: 600; color: #fbbf24; }
  #fs-btn { background: #7c3aed; color: #fff; border: none; border-radius: 6px; padding: 4px 14px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
  #fs-btn:hover { background: #6d28d9; }
  #overlay { position: absolute; inset: 0; background: rgba(15,23,42,0.88); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; z-index: 10; border-radius: 8px; }
  #overlay h2 { font-size: 28px; font-weight: 800; color: #a78bfa; text-shadow: 0 0 16px #7c3aed; }
  #overlay p { font-size: 15px; color: #cbd5e1; }
  #start-btn { background: linear-gradient(135deg,#7c3aed,#4f46e5); color: #fff; border: none; border-radius: 8px; padding: 10px 32px; font-size: 16px; font-weight: 700; cursor: pointer; box-shadow: 0 4px 16px #7c3aed55; transition: transform 0.1s; }
  #start-btn:hover { transform: scale(1.05); }
  #made-with { font-size: 11px; color: #475569; margin-top: 16px; }
</style>
</head>
<body>
<div id="title-bar">🎮 ByteBuddies Game</div>
<div id="canvas-wrap">
  <canvas id="c" width="480" height="360"></canvas>
  <div id="overlay">
    <h2>🎮 ByteBuddies Game</h2>
    <p>Use Arrow Keys or WASD to move</p>
    <button id="start-btn">▶ Play Game</button>
    <div id="made-with">Made with ByteBuddies</div>
  </div>
</div>
<div id="hud">
  <span id="score-display">Score: 0</span>
  <button id="fs-btn" onclick="toggleFs()">⛶ Fullscreen</button>
</div>
<script>
(function(){
var W=480,H=360;
var canvas=document.getElementById('c');
var ctx=canvas.getContext('2d');
var score=0;
var running=false;
var keys={};
var SPRITES=${JSON.stringify(spriteData)};
var imgs={};
var loaded=0;

// Track last transparency values for live updates
var lastBodyTransparencyFromBlock=null;
var lastBodyVideoStateFromBlock=null;

// Monitor body detection block parameters for real-time updates
function monitorBodyDetectionBlockParams(sprites){
  // IMPORTANT: This function receives SPRITES which is the game loop variable, NOT the React state!
  // We need to check the React state sprites instead to get updated block data
  console.log('[Body] monitorBodyDetectionBlockParams: SPRITES param =', sprites ? (Array.isArray(sprites) ? 'array of ' + sprites.length : 'object') : 'null');
  
  // Get blocks from React state instead
  const spritesState = sprites; // This is the game loop SPRITES, not React state
  if(!spritesState||!spritesState[0]||!spritesState[0].blocks){
    console.log('[Body] DEBUG: No blocks in SPRITES');
    return;
  }
  console.log('[Body] monitorBodyDetectionBlockParams: Found', spritesState[0].blocks.length, 'blocks in game state');
  var blocks=sprites[0].blocks;

  // Find body-video-on block
  for(var i=0;i<blocks.length;i++){
    var block=blocks[i];
    if((block.type==='body-video-on'||block.type==='bb_body_video_on')&&block.params){
      var currentTransparency=Math.max(0,Math.min(100,parseInt(block.params.transparency,10)||0));
      var currentState=(String(block.params.state||'on')).toLowerCase();

      if(currentTransparency!==lastBodyTransparencyFromBlock){
        console.log('[Body] Transparency changed to:',currentTransparency,'%');
        lastBodyTransparencyFromBlock=currentTransparency;
        if(typeof S!=='undefined'&&S.body){
          S.body.transparency=currentTransparency;
          var opacity=(100-currentTransparency)/100;
          if(typeof TRANSPARENCY_STATE!=='undefined'){
            TRANSPARENCY_STATE.body.currentOpacity=opacity;
            TRANSPARENCY_STATE.body.targetOpacity=opacity;
          }
          if(S.body.video){
            S.body.video.style.setProperty('opacity', String(opacity), 'important');
            S.body.video.style.setProperty('visibility', 'visible', 'important');
            S.body.video.style.setProperty('display', 'block', 'important');
          }
        }
      }
      if(currentState!==lastBodyVideoStateFromBlock){
        console.log('[Body] State changed to:',currentState);
        lastBodyVideoStateFromBlock=currentState;
        
        // Handle state changes in real-time
        console.log('[Body] Executing state change handler. cameraStateRef:', !!cameraStateRef);
        if(cameraStateRef){
          if(currentState==='on'){
            console.log('[Body] 🎥 Turning camera ON');
            cameraStateRef.current.isOn=true;
            if(cameraStateRef.current.webcam){
              console.log('[Body] Resuming webcam');
              cameraStateRef.current.webcam.resume();
            }
          }else{
            console.log('[Body] 📹 Turning camera OFF');
            cameraStateRef.current.isOn=false;
            if(cameraStateRef.current.webcam){
              console.log('[Body] Pausing webcam');
              cameraStateRef.current.webcam.pause();
            }
          }
        }
      }
      return;
    }
  }
  lastBodyTransparencyFromBlock=null;
  lastBodyVideoStateFromBlock=null;
}

function drawBg(){${bgCode}}

function drawSprites(){
  SPRITES.forEach(function(s){
    var img=imgs[s.id];
    if(!img||!img.complete)return;
    ctx.save();
    ctx.translate(s.x+s.w/2,s.y+s.h/2);
    if(s.rotation)ctx.rotate(s.rotation*Math.PI/180);
    ctx.drawImage(img,-s.w/2,-s.h/2,s.w,s.h);
    ctx.restore();
  });
}

function applyBlocks(){
  // DISABLED: Legacy function - all block execution now handled by new GameRuntime system
  // This function was causing duplicate execution of motion blocks every frame
  return;

  // Execute extension blocks (body detection, face detection, etc.) on stage sprite - ONCE per game start
  if(!window._bodyBlockExecuted){
    window._bodyBlockExecuted=true;
    if(SPRITES[0]&&SPRITES[0].blocks){
      console.log('[applyBlocks] Found',SPRITES[0].blocks.length,'blocks');
      for(var bi=0;bi<SPRITES[0].blocks.length;bi++){
        var block=SPRITES[0].blocks[bi];
        if(!block||!block.type){
          console.log('[applyBlocks] Block',bi,'is empty');
          continue;
        }
        console.log('[applyBlocks] Block',bi,'type:',block.type);

        // Body detection blocks - NOW ENABLED!
        if(block.type==='body-video-on'||block.type==='bb_body_video_on'){
          var p=block.params||{};
          var state=String(p.state||'on').toLowerCase();
          var transparency=Math.max(0,Math.min(100,parseInt(p.transparency,10)||0));
          console.log('[BODY BLOCK] Found! state='+state+' transparency='+transparency);
          console.log('[BODY BLOCK] cameraStateRef exists:', !!cameraStateRef);
          console.log('[BODY BLOCK] cameraStateRef.current:', cameraStateRef.current);
          // Activate camera
          if(state==='on'){
            console.log('[BODY BLOCK] ✅ Setting isOn = true');
            cameraStateRef.current.isOn=true;
            console.log('[BODY BLOCK] isOn is now:', cameraStateRef.current.isOn);
            console.log('[BODY BLOCK] webcam exists:', !!cameraStateRef.current.webcam);
            console.log('[BODY BLOCK] initialized:', cameraStateRef.current.initialized);
            if(cameraStateRef.current.webcam){
              console.log('[BODY BLOCK] Resuming webcam');
              cameraStateRef.current.webcam.resume();
            }
          }else{
            console.log('[BODY BLOCK] Turning camera OFF');
            cameraStateRef.current.isOn=false;
            // Properly pause the webcam stream
            if(cameraStateRef.current.webcam){
              console.log('[BODY BLOCK] Pausing webcam');
              cameraStateRef.current.webcam.pause();
            }
          }
        }
      }
    }else{
      console.log('[applyBlocks] No blocks found in SPRITES[0]');
    }
  }
}

function checkCollisions(){
  if(SPRITES.length<2)return;
  var hero=SPRITES[0];
  for(var i=1;i<SPRITES.length;i++){
    var other=SPRITES[i];
    if(!other.dataUrl)continue;
    var touching=(hero.x<other.x+other.w&&hero.x+hero.w>other.x&&hero.y<other.y+other.h&&hero.y+hero.h>other.y);
    if(touching&&!other._hit){
      other._hit=true;
      score++;
      document.getElementById('score-display').textContent='Score: '+score;
      // reset other sprite position
      other.x=Math.floor(Math.random()*(W-other.w));
      other.y=Math.floor(Math.random()*(H-other.h*2));
      setTimeout(function(o){o._hit=false;}(other),400);
    }
  }
}

function loop(){
  if(!running)return;
  applyBlocks();
  monitorBodyDetectionBlockParams(SPRITES);  // Monitor real-time parameter changes (transparency, state)
  // updateTransparencyOpacity();  // DISABLED - use stage-based rendering instead of extension engine
  checkCollisions();
  drawBg();
  drawSprites();
  requestAnimationFrame(loop);
}

function loadImages(cb){
  if(SPRITES.length===0){cb();return;}
  SPRITES.forEach(function(s){
    if(!s.dataUrl){loaded++;if(loaded===SPRITES.length)cb();return;}
    var img=new Image();
    img.onload=function(){loaded++;if(loaded===SPRITES.length)cb();};
    img.onerror=function(){loaded++;if(loaded===SPRITES.length)cb();};
    img.src=s.dataUrl;
    imgs[s.id]=img;
  });
}

document.addEventListener('keydown',function(e){keys[e.key]=true;keys[e.key.toLowerCase()]=true;});
document.addEventListener('keyup',function(e){keys[e.key]=false;keys[e.key.toLowerCase()]=false;});

document.getElementById('start-btn').addEventListener('click',function(){
  document.getElementById('overlay').style.display='none';
  running=true;
  loop();
});

window.toggleFs=function(){
  var wrap=document.getElementById('canvas-wrap');
  if(!document.fullscreenElement){wrap.requestFullscreen&&wrap.requestFullscreen();}
  else{document.exitFullscreen&&document.exitFullscreen();}
};

// Draw initial background on load
loadImages(function(){
  drawBg();
  drawSprites();
});
})();
</script>
</body>
</html>`;

      const blob = new Blob([htmlString], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bytebuddies-game.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    const handler = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveProject(); } };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [sprites, background]);

  // Resize canvas — retina backing store in editor; native pixels in fullscreen
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (stageFs) {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    } else {
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      canvas.width  = Math.round(STAGE_W * dpr);
      canvas.height = Math.round(STAGE_H * dpr);
    }
  }, [stageFs]);

  /* ─── Drawing ─── */
  const drawFrameRef = useRef(0);
  const draw = useCallback(async (spritesToDraw, drawOpts = {}) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const frameId = ++drawFrameRef.current;
    const playing = drawOpts.playing === true;
    ctx.imageSmoothingEnabled = true;
    if ('imageSmoothingQuality' in ctx) ctx.imageSmoothingQuality = 'high';

    // Scale to logical STAGE_W×STAGE_H space (native resolution in fullscreen)
    const sx = canvas.width / STAGE_W, sy = canvas.height / STAGE_H;
    ctx.save();
    ctx.scale(sx, sy);
    ctx.clearRect(0, 0, STAGE_W, STAGE_H);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, STAGE_W, STAGE_H);

    const backdropNames = getBackdropNames();
    const playBgIdx = playing && playBackdropRef.current != null ? playBackdropRef.current : null;
    const activeBgName = playing && playBackdropNameRef.current
      ? playBackdropNameRef.current
      : (playBgIdx != null && backdropNames[playBgIdx]
        ? backdropNames[playBgIdx]
        : background);

    // Check if face video is enabled — if so, draw video feed directly on canvas
    const faceVideoEnabled = globalVarsRef.current?._faceVideo?.enabled === true;
    const faceVideoTransparency = globalVarsRef.current?._faceVideo?.transparency ?? 0;

    if (faceVideoEnabled && webcamManager.isRunning()) {
      // Draw webcam video feed directly on canvas
      const videoElement = webcamManager.getVideoElement();
      if (videoElement && videoElement.readyState === videoElement.HAVE_ENOUGH_DATA) {
        // Draw video with transparency
        const alpha = (100 - faceVideoTransparency) / 100;
        ctx.globalAlpha = alpha;
        ctx.drawImage(videoElement, 0, 0, STAGE_W, STAGE_H);
        ctx.globalAlpha = 1.0;
      } else {
        // Video not ready yet — keep white stage
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, STAGE_W, STAGE_H);
      }
    } else if (activeBgName !== DEFAULT_STAGE_BACKDROP) {
      // Decorative or custom backdrop (White is already painted above)
      const customBg = customBackgrounds.find(b => b.name === activeBgName);
      if (customBg) {
        const bgKey = '__bg__' + customBg.name;
        if (!imgCacheRef.current[bgKey]) {
          const bgImg = new Image();
          await new Promise(r => { bgImg.onload = r; bgImg.onerror = r; bgImg.src = customBg.dataUrl; });
          imgCacheRef.current[bgKey] = bgImg;
        }
        const bgImg = imgCacheRef.current[bgKey];
        if (bgImg && bgImg.complete && bgImg.naturalWidth) {
          ctx.drawImage(bgImg, 0, 0, STAGE_W, STAGE_H);
        }
      } else {
        const bg = BACKGROUNDS.find(b => b.name === activeBgName);
        if (bg) bg.draw(ctx, STAGE_W, STAGE_H);
      }
    }

    // Draw webcam feed INSIDE stage (underneath sprites, clipped by stage boundaries)
    if (playing) {
      const cameraIsOn = cameraStateRef.current?.isOn;
      const webcamExists = cameraStateRef.current?.webcam;
      const cameraInitialized = cameraStateRef.current?.initialized;

      // Debug logging - only once per frame to avoid spam
      if (Date.now() % 1000 < 16) {
        console.log('[Draw] Camera state: isOn=', cameraIsOn, 'exists=', !!webcamExists, 'initialized=', cameraInitialized);
      }

      if (!cameraIsOn) {
        // Camera is turned off
      } else if (!webcamExists) {
        if (cameraInitialized) {
          console.log('[Draw] Camera is ON but no webcam object (initialized was true)');
        }
        // silently skip if not initialized yet
      } else {
        const frame = cameraStateRef.current.webcam.captureFrame();
        if (!frame) {
          console.log('[Draw] No frame captured from camera');
        } else if (!frame.canvas) {
          console.log('[Draw] Frame exists but no canvas property');
        } else {
          try {
            // Apply transparency from block parameter
            const transparency = globalVarsRef.current?._camera_transparency || 0;
            const opacity = (100 - transparency) / 100;
            
            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.drawImage(frame.canvas, 0, 0, STAGE_W, STAGE_H);
            ctx.restore();
            
            // Only log periodically to avoid spam
            if (Date.now() % 300 < 16) {
              console.log('[Draw] Camera rendered. transparency:', transparency, 'opacity:', opacity.toFixed(2));
            }
          } catch (err) {
            console.warn('[GameBuilder] Camera render error:', err);
          }
        }
      }

      const qrState = getQrState();
      if (qrState?.bboxShow && qrState.detected && qrState.lastBox) {
        const b = qrState.lastBox;
        ctx.save();
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 3;
        ctx.strokeRect(b.x * STAGE_W, b.y * STAGE_H, b.w * STAGE_W, b.h * STAGE_H);
        ctx.font = 'bold 14px system-ui,sans-serif';
        ctx.fillStyle = 'rgba(185,28,28,0.9)';
        const lab = 'QR';
        const tw = ctx.measureText(lab).width + 8;
        const bx = b.x * STAGE_W;
        const by = b.y * STAGE_H;
        ctx.fillRect(bx, Math.max(0, by - 18), tw, 18);
        ctx.fillStyle = '#fecaca';
        ctx.fillText(lab, bx + 4, Math.max(13, by - 5));
        ctx.restore();
      }
    }

    if (!playing && activeBgName !== DEFAULT_STAGE_BACKDROP) {
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      for (let x = 0; x < STAGE_W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, STAGE_H); ctx.stroke(); }
      for (let y = 0; y < STAGE_H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(STAGE_W, y); ctx.stroke(); }
    }

    const sorted = [...spritesToDraw].sort((a, b) => (a.layer || 0) - (b.layer || 0));
    for (const sprite of sorted) {
      if (frameId !== drawFrameRef.current) break;
      if (!sprite.visible) continue;

      let img;
      if (sprite.customImage) {
        const cacheKey = `__custom__${sprite.id}_${sprite.currentCostumeIndex ?? 0}_${sprite.color || ''}_${sprite.w}_${sprite.h}`;
        if (!imgCacheRef.current[cacheKey]) {
          const cImg = new Image();
          await new Promise(r => { cImg.onload = r; cImg.onerror = r; cImg.src = sprite.customImage; });
          imgCacheRef.current[cacheKey] = cImg;
        }
        img = imgCacheRef.current[cacheKey];
      } else {
        const tpl = findSpriteTemplate(sprite.svgKey);
        if (!tpl) continue;
        const svgStr = tpl.svg(sprite.color || tpl.color);
        const cacheKey = sprite.svgKey + (sprite.color || '') + sprite.w + sprite.h;
        if (!imgCacheRef.current[cacheKey]) {
          imgCacheRef.current[cacheKey] = await renderSvgToImage(svgStr, sprite.w, sprite.h);
        }
        img = imgCacheRef.current[cacheKey];
      }
      if (img) {
        const effects = sprite.effects || {};
        const ghost = Math.max(0, Math.min(100, effects.ghost || 0));
        ctx.save();
        ctx.translate(sprite.x + sprite.w / 2, sprite.y + sprite.h / 2);
        if (playing) applyCanvasRotationStyle(ctx, sprite);
        ctx.filter = buildEffectFilter(effects);
        const prevAlpha = ctx.globalAlpha;
        if (ghost > 0) ctx.globalAlpha = prevAlpha * (1 - ghost / 100);
        const iw = img.naturalWidth || sprite.w;
        const ih = img.naturalHeight || sprite.h;
        let dw = sprite.w;
        let dh = sprite.h;
        if (sprite.customImage && iw > 0 && ih > 0) {
          const fit = Math.min(sprite.w / iw, sprite.h / ih);
          dw = iw * fit;
          dh = ih * fit;
        }
        ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
        ctx.globalAlpha = prevAlpha;
        ctx.filter = 'none';
        ctx.restore();
      }

      // Selection box and resize handles
      if (selected === sprite.id && !isPlaying) {
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(sprite.x - 3, sprite.y - 3, sprite.w + 6, sprite.h + 6);
        ctx.setLineDash([]);

        // Resize handles
        const handleSize = 8;
        const handles = [
          { x: sprite.x - handleSize, y: sprite.y - handleSize },
          { x: sprite.x + sprite.w - handleSize, y: sprite.y - handleSize },
          { x: sprite.x - handleSize, y: sprite.y + sprite.h - handleSize },
          { x: sprite.x + sprite.w - handleSize, y: sprite.y + sprite.h - handleSize },
        ];
        ctx.fillStyle = '#6366f1';
        handles.forEach(h => ctx.fillRect(h.x, h.y, handleSize * 2, handleSize * 2));
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        handles.forEach(h => ctx.strokeRect(h.x, h.y, handleSize * 2, handleSize * 2));
      }

      const bubbleCx = sprite.x + sprite.w / 2;
      const bubbleTop = sprite.y;
      if (sprite._thinkText && bubbleActive(sprite._thinkUntil)) {
        drawThoughtBubble(ctx, bubbleCx, bubbleTop, sprite._thinkText);
      } else if (sprite._sayText && bubbleActive(sprite._sayUntil)) {
        drawSpeechBubble(ctx, bubbleCx, bubbleTop, sprite._sayText);
      }
    }

    if (playing) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, STAGE_W, 32);
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 13px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`Score: ${gameState.score} | Lives: ${gameState.lives} | Level: ${gameState.level}`, 10, 16);
    }
    ctx.restore(); // pop scale transform
  }, [selected, isPlaying, gameState, background, customBackgrounds, stageFs, getBackdropNames]);

  useEffect(() => {
    drawRef.current = draw;
  }, [draw]);

  // Editor only — during Play the game loop draws playSpritesRef (with rotation style applied)
  useEffect(() => {
    if (!isPlaying) draw(sprites);
  }, [sprites, draw, isPlaying]);

  // Initialize camera system for stage-based rendering (NOT fullscreen)
  useEffect(() => {
    if (!isPlaying) {
      console.log('[GameBuilder] Camera useEffect: not playing');
      return;
    }

    // Check if any camera blocks are present
    // IMPORTANT: Blocks are stored in sprite.blocks, NOT sprite.scripts[].blocks
    console.log('[GameBuilder] Camera detection: checking', sprites.length, 'sprites for blocks');
    const hasCameraBlocks = sprites.some(sprite => {
      console.log('[GameBuilder] Sprite:', sprite.name, 'has blocks:', sprite.blocks?.length || 0);
      return sprite.blocks?.some(block => {
        // Special handling for body-video-on: only initialize if state is "on"
        if (block.type === 'qr-video-on') {
          const state = (block.params?.state) ? String(block.params.state).toLowerCase() : 'on';
          return state === 'on';
        }
        if (block.type === 'body-video-on' || block.type === 'bb_body_video_on') {
          const state = (block.params?.state) ? String(block.params.state).toLowerCase() : 'on';
          console.log('[GameBuilder] ✅ BODY-VIDEO-ON BLOCK FOUND!');
          console.log('    block.type:', block.type);
          console.log('    block.params:', JSON.stringify(block.params));
          console.log('    block.params.state:', block.params?.state);
          console.log('    Extracted state:', state);
          console.log('    Will return:', state === 'on');
          // CRITICAL: Return here to prevent fallthrough to generic hasCamera check
          // If state='off', return false (don't initialize camera)
          // If state='on', return true (initialize camera)
          return state === 'on';
        }

        // Generic camera block detection (but NOT body-video-on, which is handled above)
        const hasCamera =
          block.type?.includes('video') ||
          block.type?.includes('camera') ||
          block.type?.includes('face') ||
          block.type?.includes('object') ||
          block.type?.includes('pose') ||
          block.type?.includes('hand');

        if (block.type) {
          console.log('[GameBuilder]   Block type:', block.type, '-> hasCamera:', hasCamera);
        }
        if (hasCamera && (block.type?.includes('face') || block.type?.includes('pose') || block.type?.includes('hand') || block.type?.includes('object'))) {
          console.log('[GameBuilder] ✅ Found camera block! type:', block.type);
        }
        return hasCamera;
      });
    });

    console.log('[GameBuilder] Camera useEffect: hasCameraBlocks=', hasCameraBlocks, 'initialized=', cameraStateRef.current.initialized, 'isPlaying=', isPlaying);

    if (hasCameraBlocks && !cameraStateRef.current.initialized) {
      console.log('[GameBuilder] Initializing camera system... hasCameraBlocks found');
      import('../systems/camera').then(({ WebcamManager }) => {
        const webcam = new WebcamManager({
          width: 1280,
          height: 720,
          mirrored: false,
          transparency: 0,
        });
        (async () => {
          try {
            const initialized = await webcam.initialize();
            console.log('[GameBuilder] WebcamManager.initialize() returned:', initialized);
            if (initialized) {
              await webcam.start();
              cameraStateRef.current.initialized = true;
              cameraStateRef.current.webcam = webcam;
              window.gameWebcam = webcam;
              console.log('[GameBuilder] 📹 Camera fully initialized and started');
            } else {
              console.log('[GameBuilder] WebcamManager initialization failed');
            }
          } catch (err) {
            console.error('[GameBuilder] Camera init error:', err);
          }
        })();
      });
    }
  }, [isPlaying, sprites]);

  /** Merge latest Blockly workspace into snapshot for the selected sprite before Play. */
  function snapshotSpritesForPlay(baseSprites) {
    let snapshot = (baseSprites || spritesRef.current || sprites).map((s) => {
      const next = { ...s };
      delete next.rotationStyle;
      delete next._rotationStyle;
      if (next.name === 'Star' || next.svgKey === 'Star') {
        if (!next.svgKey) next.svgKey = 'Star';
        if (next.costumeFacing == null) next.costumeFacing = 0;
      }
      return next;
    });

    const selId = selectedRef.current ?? selected;
    if (selId) {
      const selectedSpriteObj = snapshot.find((s) => s.id === selId);
      if (selectedSpriteObj) {
        let blocks = selectedSpriteObj.blocks || [];
        let blocklyXml = selectedSpriteObj.blocklyXml || '';
        const flushed = blocklyWorkspaceRef.current?.flush?.();
        if (flushed?.nodes?.length) {
          const converted = blocklyNodesToGameBlocks(flushed.nodes);
          if (converted.length) {
            blocks = converted.map((b) => ({
              ...b,
              owner: selectedSpriteObj.name,
            }));
            blocklyXml = flushed.xmlText || blocklyXml;
          } else {
            console.warn(
              '[GameBuilder] Blockly workspace has blocks but none mapped to runtime types — using saved sprite blocks',
            );
          }
        }
        snapshot = snapshot.map((s) => (
          s.id === selId ? { ...s, blocks, blocklyXml } : s
        ));
      }
    }

    spritesRef.current = snapshot;
    return snapshot;
  }

  /** Flush Blockly → sprite blocks, then start/stop (toolbar + green-flag must both use this). */
  function togglePlay() {
    if (isPlaying) {
      playBackdropRef.current = null;
      playBackdropNameRef.current = null;
      setIsPlaying(false);
      return;
    }
    blocklyWorkspaceRef.current?.flush?.();
    ensureBlockSoundAudio();
    const snap = snapshotSpritesForPlay(spritesRef.current || sprites);
    setSprites(snap);
    setScore(0);
    imgCacheRef.current = {};
    setIsPlaying(true);
  }

  /* ─── Runtime: game loop (only restart when Play/Stop toggles — NOT on block edits) ─── */
  useEffect(() => {
    if (!isPlaying) { if (animRef.current) cancelAnimationFrame(animRef.current); return; }

    const snapshot = snapshotSpritesForPlay(spritesRef.current || sprites);

    const runtime = new GameRuntime(snapshot, globalVarsRef.current);
    runtimeRef.current = runtime;
    gameStateRef.current = runtime.gameState;

    const backdropNames = [
      ...STAGE_BACKDROP_NAMES,
      ...(customBackgrounds || []).map((b) => b.name).filter((n) => n && !STAGE_BACKDROP_NAMES.includes(n)),
    ];
    const startBgIdx = backdropNames.findIndex((n) => n === background);
    playBackdropRef.current = startBgIdx >= 0 ? startBgIdx : 0;
    playBackdropNameRef.current = backdropNames[playBackdropRef.current] || background || DEFAULT_STAGE_BACKDROP;

    playSpritesRef.current = snapshot.map((s) => {
      const copy = {
        ...s,
        blocks: (s.blocks || []).map((b) => ({ ...b, params: { ...(b.params || {}) } })),
        _startX: s.x,
        _startY: s.y,
      };
      resetSpriteThreads(copy);
      syncPlayRotationStyle(copy);
      ensureSpriteMotionState(copy);
      initSpriteLooks(copy);
      getSpriteSoundState(copy);
      return copy;
    });

    // Initialize per-sprite state, then apply inspector “start values” (same ideas as Set gravity / velocity / variables blocks).
    spriteVarsRef.current = initializeSpriteState(playSpritesRef.current);
    const spriteVars = spriteVarsRef.current;
    playSpritesRef.current.forEach((s) => {
      const st = spriteVars[s.id];
      if (!st) return;
      if (s.initialGravityPps2 != null && String(s.initialGravityPps2).trim() !== '') {
        const g = Number(s.initialGravityPps2);
        if (Number.isFinite(g)) st.gravityPps2 = normalizeGravityPps2(g);
      }
      if (s.initialVx != null && String(s.initialVx).trim() !== '') {
        const v = Number(s.initialVx);
        if (Number.isFinite(v)) st.vx = v;
      }
      if (s.initialVy != null && String(s.initialVy).trim() !== '') {
        const v = Number(s.initialVy);
        if (Number.isFinite(v)) st.vy = v;
      }
      if (s.initialAllowDoubleJump === true) {
        st.allowDoubleJump = true;
        st.usedDoubleJump = false;
      }
      const iv = s.initialVars;
      if (iv && typeof iv === 'object' && !Array.isArray(iv)) {
        Object.entries(iv).forEach(([k, val]) => {
          const key = String(k || '').trim();
          if (!key) return;
          const raw = val == null ? '' : String(val).trim();
          if (raw === '') return;
          const n = Number(raw);
          st._vars[key] = Number.isFinite(n) ? n : raw;
        });
      }
    });
    const globalVars = globalVarsRef.current;
    const vars = globalVars;

    // Key tracking for edge detection - must be local to game loop
    const keysPressed = {}; // Current frame key state
    const keysPressedPrev = {}; // Previous frame key state for edge detection
    let localScore = 0;

    const gameKeys = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'w', 'a', 's', 'd']);

    // Map actual key codes to friendly names
    const keyMap = {
      ' ': 'space',
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
      Enter: 'enter',
      Shift: 'shift',
      Control: 'control',
      Alt: 'alt',
    };

    loudnessMonitorRef.current = new LoudnessMonitor();
    loudnessMonitorRef.current.start();

    globalVars._timerStart = Date.now();
    globalVars._lastAnswer = '';
    globalVars._askResolved = false;

    let stageImageData = null;
    const getStageImageData = () => {
      if (stageImageData) return stageImageData;
      try {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;
        stageImageData = ctx.getImageData(0, 0, STAGE_W, STAGE_H);
      } catch {
        stageImageData = null;
      }
      return stageImageData;
    };

    const senseCtx = () => ({
      allSprites: playSpritesRef.current || [],
      mouseX: mouseRef.current?.x ?? STAGE_W / 2,
      mouseY: mouseRef.current?.y ?? STAGE_H / 2,
      stageW: STAGE_W,
      stageH: STAGE_H,
    });

    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

      // Store both the actual key and the friendly name
      keysPressed[e.key] = true;
      const friendlyKey = keyMap[e.key] || e.key.toLowerCase();
      keysPressed[friendlyKey] = true;

      // Notify GameRuntime of key press
      if (runtime) {
        runtime.onKeyDown(e.key);
        runtime.onKeyDown(friendlyKey);
      }

      if (gameKeys.has(e.key)) e.preventDefault();
    };
    const handleKeyUp = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

      keysPressed[e.key] = false;
      const friendlyKey = keyMap[e.key] || e.key.toLowerCase();
      keysPressed[friendlyKey] = false;

      // Notify GameRuntime of key release
      if (runtime) {
        runtime.onKeyUp(e.key);
        runtime.onKeyUp(friendlyKey);
      }
    };
    const handleMouseMove = (e) => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (STAGE_W / rect.width);
        const y = (e.clientY - rect.top) * (STAGE_H / rect.height);
        mouseRef.current = { x, y };
        if (runtime) runtime.onMouseMove(x, y);
        const drag = playDragSpriteRef.current;
        if (drag) {
          const ps = playSpritesRef.current || [];
          const sp = ps.find((s) => s.id === drag.id);
          if (sp) {
            sp.x = Math.max(0, Math.min(STAGE_W - sp.w, x - drag.offsetX));
            sp.y = Math.max(0, Math.min(STAGE_H - sp.h, y - drag.offsetY));
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    document.addEventListener('mousemove', handleMouseMove);
    
    const getSpriteChains = () => (playSpritesRef.current || []).map((s) => ({
      sprite: s,
      chains: buildScriptChains(s.id, playSpritesRef.current),
    }));

    listStoreRef.current = {};
    listVisibleRef.current = {};
    setListMonitors({});

    const refreshListMonitors = () => {
      const visible = listVisibleRef.current;
      const store = listStoreRef.current;
      const next = {};
      Object.keys(visible).forEach((name) => {
        if (visible[name]?.visible) {
          next[name] = [...(store[name] || [])];
        }
      });
      setListMonitors(next);
    };

    let audioContext = null;
    let musicTempo = 120; // Default BPM
    let currentInstrument = 'sine'; // sine, square, sawtooth, triangle

    const getAudioContext = () => {
      if (!audioContext) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (Ctx) audioContext = new Ctx();
      }
      return audioContext;
    };

    // Convert MIDI note number to frequency
    const midiToFreq = (midi) => {
      return 440 * Math.pow(2, (midi - 69) / 12);
    };

    // Note name to MIDI number: C4=60, D4=62, etc.
    const noteToMidi = (noteName) => {
      const notes = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
      const match = String(noteName).match(/([A-G])#?(\d)/i);
      if (!match) return 60;
      const semitone = notes[match[1].toUpperCase()] + (noteName.includes('#') ? 1 : 0);
      const octave = parseInt(match[2]);
      return (octave + 1) * 12 + semitone;
    };

    const playNote = (noteOrFreq, beats = 0.5, instrument = currentInstrument) => {
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Determine frequency
        let freq;
        if (typeof noteOrFreq === 'number') {
          freq = noteOrFreq > 100 ? noteOrFreq : midiToFreq(noteOrFreq);
        } else {
          freq = midiToFreq(noteToMidi(noteOrFreq));
        }

        // Set instrument type
        try {
          osc.type = instrument; // sine, square, sawtooth, triangle
        } catch {
          osc.type = 'sine';
        }

        const duration = (beats / musicTempo) * 60; // Convert beats to seconds
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + duration);
      } catch (e) {
        // Ignore audio errors
      }
    };

    // Evaluate condition/reporter blocks
    function evaluateCondition(block, sprite) {
      const p = block.params || {};
      const num = (v, d = 0) => {
        const n = parseFloat(v);
        return Number.isFinite(n) ? n : d;
      };
      const txt = (v, d = '') => String(v ?? d);

      switch (block.type) {
        case 'logic-if': {
          const cond = p._cond;
          if (cond && cond.type) return evaluateCondition(cond, sprite);
          return false;
        }
        case 'logic-compare':
          return evaluateOperatorBlock(block, sprite, evaluateCondition);
        // Logic AND/OR/NOT
        case 'logic-and':
        case 'logic-or':
        case 'logic-not':
          return evaluateOperatorBlock(block, sprite, evaluateCondition);
        case 'logic-bool':
          return p.value === 'true' || p.value === true;
        // Sensing
        case 'sense-touching': {
          const target = p.target || p.OBJECT || 'edge';
          return isTouchingTarget(sprite, target, senseCtx());
        }
        case 'sense-touching-sprite': {
          return isTouchingSprite(sprite, playSpritesRef.current || [], p.sprite || 'any');
        }
        case 'sense-touching-color': {
          const data = getStageImageData();
          return isTouchingColor(sprite, p.color || '#ff0000', data, STAGE_W, STAGE_H);
        }
        case 'sense-color-touching-color': {
          const data = getStageImageData();
          return isColorTouchingColor(p.color1, p.color2, data, STAGE_W, STAGE_H);
        }
        case 'sense-key': {
          const key = normalizeSenseKeyName(p.key || 'space');
          if (key === 'any') return Object.values(keysPressed).some(Boolean);
          return isKeyHeld(keysPressed, key);
        }
        case 'sense-mouse-down':
          return !!mouseDownRef.current;
        case 'sense-mouse-x':
          return mouseRef.current?.x || 0;
        case 'sense-mouse-y':
          return mouseRef.current?.y || 0;
        case 'sense-distance':
          return distanceToTarget(sprite, p.target || 'mouse-pointer', senseCtx());
        case 'sense-timer':
          return getTimerSeconds(globalVars._timerStart);
        case 'sense-loudness':
          return loudnessMonitorRef.current?.getLevel() ?? 0;
        case 'sense-answer':
          return String(globalVars._lastAnswer ?? '');
        case 'sense-of':
          return evaluateSenseOf(p.property || p.PROPERTY, p.object || p.OBJECT, {
            allSprites: playSpritesRef.current || [],
            backdropIndex: playBackdropRef.current ?? 0,
            stageW: STAGE_W,
            stageH: STAGE_H,
          });
        case 'sense-current':
          return getCurrentDateTime(p.unit || p.CURRENTMENU || 'year');
        case 'sense-days-since-2000':
          return getDaysSince2000();
        case 'sense-username':
          return String(globalVars._username ?? '');
        // ═══ SPRITE MOTION REPORTERS ═══
        case 'sprite-x-reporter':
        case 'sprite-y-reporter':
        case 'sprite-direction-reporter':
        case 'motion_xposition':
        case 'motion_yposition':
        case 'motion_direction':
          return evaluateMotionReporter(block, sprite);
        // ═══ SPRITE LOOKS REPORTERS ═══
        case 'looks-costume-reporter':
        case 'looks_costumenumbername':
          return costumeNumberReporter(sprite, p.NUMBER_NAME ?? p.numberName ?? 'number');
        case 'looks-backdrop-reporter':
        case 'looks_backdropnumbername': {
          const names = [
            ...STAGE_BACKDROP_NAMES,
            ...(customBackgrounds || []).map((b) => b.name).filter((n) => n && !STAGE_BACKDROP_NAMES.includes(n)),
          ];
          return backdropNumberReporter(playBackdropRef.current ?? 0, names, p.NUMBER_NAME ?? p.numberName ?? 'number');
        }
        case 'sprite-size-reporter':
        case 'looks_size':
          return sizeReporter(sprite);
        case 'sound-get-volume':
        case 'sound_volume':
          return getSpriteVolumeReporter(sprite);
        // ═══ EXTENSION BLOCKS (reporters/boolean) ═══
        case 'pose-visible':
          ensureCameraOn('pose-visible', sprite);
          return false;
        case 'pose-count-people':
          ensureCameraOn('pose-count-people', sprite);
          return 0;
        case 'pose-position-x':
          ensureCameraOn('pose-position-x', sprite);
          return 0;
        case 'pose-position-y':
          ensureCameraOn('pose-position-y', sprite);
          return 0;
        case 'hand-detected':
          ensureCameraOn('hand-detected', sprite);
          return false;
        case 'hand-position-x':
          ensureCameraOn('hand-position-x', sprite);
          return 0;
        case 'hand-position-y':
          ensureCameraOn('hand-position-y', sprite);
          return 0;
        case 'qr-detected':
          return !!readExtensionGame('qr.detected');
        case 'qr-data':
          return String(readExtensionGame('qr.payload') || '');
        case 'qr-position': {
          const axis = String(p.axis || p.AXIS || 'x').toLowerCase();
          const point = String(p.point || p.POINT || 'center').toLowerCase();
          return readExtensionGame(`qr.pos|${axis}|${point}`);
        }
        case 'qr-angle':
          return Number(readExtensionGame('qr.angle')) || 0;
        case 'face-visible':
          ensureCameraOn('face-visible', sprite);
          return false;
        case 'face-count':
          ensureCameraOn('face-count', sprite);
          return 0;
        case 'object-count':
          ensureCameraOn('object-count', sprite);
          return 0;
        case 'control-loop-index':
          return sprite._loopIndex ?? 0;
        case 'list-item':
        case 'list-get':
          return listGetItem(
            listStoreRef.current,
            p.list,
            evalListIndex(p.index, evaluateCondition, sprite),
          );
        case 'list-index':
          return listIndexOfValue(
            listStoreRef.current,
            p.list,
            evalListParam(p.item, evaluateCondition, sprite),
          );
        case 'list-length':
          return listLength(listStoreRef.current, p.list);
        case 'list-contains':
          return listContains(
            listStoreRef.current,
            p.list,
            evalListParam(p.item, evaluateCondition, sprite),
          );
        default: {
          const opVal = evaluateOperatorBlock(block, sprite, evaluateCondition);
          if (opVal !== undefined) return opVal;
          return false;
        }
      }
    }

    /** Scratch-vm-style safety: cap block executions per animation frame (see scratchVmMapping.js). */
    let blockStepsRemaining;
    let blockBudgetWarned;
    /** Active script thread for wait/stop (per-hat cooperative execution). */
    let currentExecThread = null;

    // Helper: Ensure camera is available (useEffect already initializes it)
    function ensureCameraOn(blockType, sprite) {
      // Camera is initialized by the useEffect above
      // This just logs if called
      if (!cameraStateRef.current.initialized) {
        console.log(`[GameBuilder] Camera not yet initialized for ${blockType}, will be ready when it loads`);
      }
    }

  /** @returns {boolean} true if this block must yield until next frame (move/glide in progress) */
    function execBlock(block, sprite) {
      if (!block) {
        console.warn('[GameBuilder] execBlock: block is null or undefined');
        return false;
      }

      if (!sprite) {
        console.warn('[GameBuilder] execBlock: sprite is null or undefined for block type:', block.type);
        return false;
      }

      if (!sprite.id) {
        console.warn('[GameBuilder] execBlock: sprite has no ID for block type:', block.type);
        return false;
      }

      if (blockStepsRemaining <= 0) {
        if (!blockBudgetWarned) {
          console.warn('[GameBuilder] Block step budget exceeded (possible infinite loop).');
          blockBudgetWarned = true;
        }
        return false;
      }
      blockStepsRemaining -= 1;

      // Verify sprite has state entry
      if (!spriteVars[sprite.id]) {
        spriteVars[sprite.id] = createPhysicsState();
      }

      const p = block.params || {};
      const num = (v, d = 0) => {
        const n = parseFloat(v);
        return Number.isFinite(n) ? n : d;
      };
      const txt = (v, d = '') => String(v ?? d);
      const blockType = block.type || block.blocklyType || '';
      if (isMotionReporter(blockType)) {
        const val = evaluateMotionReporter(block, sprite);
        let label = 'x';
        if (blockType.includes('direction')) label = 'direction';
        else if (blockType.includes('yposition') || blockType.includes('y-reporter')) label = 'y';
        sprite._sayText = `${label}: ${Math.round(val * 10) / 10}`;
        sprite._sayUntil = Date.now() + 2000;
        return false;
      }
      if (LOOKS_REPORTER_GAME_TYPES.has(blockType)) {
        const val = evaluateCondition(block, sprite);
        let label = 'size';
        if (blockType === 'looks-costume-reporter') label = 'costume';
        else if (blockType === 'looks-backdrop-reporter') label = 'backdrop';
        sprite._sayText = `${label}: ${val}`;
        sprite._sayUntil = Date.now() + 2000;
        return false;
      }
      if (LIST_REPORTER_GAME_TYPES.has(blockType)) {
        const val = evaluateCondition(block, sprite);
        sprite._sayText = String(val);
        sprite._sayUntil = Date.now() + 2000;
        return false;
      }
      if (applyRotationStyleBlock(block, sprite)) {
        return false;
      }
      if (isMotionBlock(blockType) && !isMotionReporter(blockType)) {
        const motionResult = executeSpriteMotion(block, sprite, {
          sprites: playSpritesRef.current || [],
          mouseX: mouseRef.current?.x ?? STAGE_W / 2,
          mouseY: mouseRef.current?.y ?? STAGE_H / 2,
        });
        if (motionResult === true) return true;
        const st = spriteVars[sprite.id];
        if (st) {
          st.vx = 0;
          st.vy = 0;
        }
        sprite.vx = 0;
        sprite.vy = 0;
        return false;
      }
      switch (blockType) {
        case 'sprite-rotation-style':
        case 'motion-set-rotation-style':
        case 'motion_setrotationstyle':
        case 'bb_sprite_rotation_style':
        case 'bb_motion_set_rotation_style':
          applyRotationStyleBlock(block, sprite);
          break;
        case 'motion-speed': {
          setVelocityFromDirection(sprite, num(p.speed, 5));
          break;
        }
        case 'motion-stop': {
          sprite.vx = 0;
          sprite.vy = 0;
          break;
        }
        case 'motion-wrap': {
          const w = canvasRef.current?.width || STAGE_W || 800;
          const h = canvasRef.current?.height || STAGE_H || 600;
          if (sprite.x + sprite.w < 0) sprite.x = w;
          if (sprite.x > w) sprite.x = -sprite.w;
          if (sprite.y + sprite.h < 0) sprite.y = h;
          if (sprite.y > h) sprite.y = -sprite.h;
          break;
        }
        case 'sprite-setsize':
          setSizePercent(sprite, num(p.size, 100));
          break;
        case 'looks-change-size':
          changeSizeBy(sprite, num(p.amount, 10));
          break;
        case 'sprite-show':
        case 'looks-show':
          sprite.visible = true;
          break;
        case 'sprite-hide':
        case 'looks-hide':
          sprite.visible = false;
          break;
        case 'sprite-say': {
          const secs = parseFloat(p.secs);
          say(sprite, txt(p.text, ''), Number.isFinite(secs) && secs > 0 ? secs : 2);
          break;
        }
        case 'looks-say':
          say(sprite, txt(p.text, ''), null);
          break;
        case 'sprite-think': {
          const secs = parseFloat(p.secs);
          think(sprite, txt(p.text, ''), Number.isFinite(secs) && secs > 0 ? secs : 2);
          break;
        }
        case 'looks-think':
          think(sprite, txt(p.text, ''), null);
          break;
        case 'looks-grow':
          changeSizeBy(sprite, num(p.amount, 10));
          break;
        case 'looks-shrink':
          changeSizeBy(sprite, -num(p.amount, 10));
          break;
        case 'physics-velocity':
          spriteVars[sprite.id].vx = num(p.vx, spriteVars[sprite.id].vx || 0);
          spriteVars[sprite.id].vy = num(p.vy, spriteVars[sprite.id].vy || 0);
          break;
        case 'physics-gravity':
          spriteVars[sprite.id].gravityPps2 = normalizeGravityPps2(p.amount);
          break;
        case 'physics-allow-double-jump':
          spriteVars[sprite.id].allowDoubleJump = p.enable !== 'false' && p.enable !== false;
          if (!spriteVars[sprite.id].allowDoubleJump) spriteVars[sprite.id].usedDoubleJump = false;
          break;
        case 'physics-jump': {
          if ((spriteVars[sprite.id].gravityPps2 || 0) <= 0) {
            spriteVars[sprite.id].gravityPps2 = DEFAULT_GRAVITY_PPS2;
          }
          applyJumpImpulse(
            spriteVars[sprite.id],
            normalizeJumpImpulse(p.power),
            { force: true },
            {
              sprite,
              platformRects: getPlatformRects(playSpritesRef.current, sprite.id),
              stageW: STAGE_W,
              stageH: STAGE_H,
            },
          );
          break;
        }
        case 'motion-jump': {
          if ((spriteVars[sprite.id].gravityPps2 || 0) <= 0) {
            spriteVars[sprite.id].gravityPps2 = DEFAULT_GRAVITY_PPS2;
          }
          applyJumpImpulse(
            spriteVars[sprite.id],
            normalizeJumpImpulse(p.power),
            { force: true },
            {
              sprite,
              platformRects: getPlatformRects(playSpritesRef.current, sprite.id),
              stageW: STAGE_W,
              stageH: STAGE_H,
            },
          );
          break;
        }
        case 'physics-push': {
          const rad = (num(p.direction, 0) * Math.PI) / 180;
          const force = num(p.force, 5);
          spriteVars[sprite.id].vx = (spriteVars[sprite.id].vx || 0) + Math.cos(rad) * force;
          spriteVars[sprite.id].vy = (spriteVars[sprite.id].vy || 0) - Math.sin(rad) * force;  // Negate Y
          break;
        }
        case 'physics-friction':
          spriteVars[sprite.id].vx = (spriteVars[sprite.id].vx || 0) * num(p.amount, 0.9);
          spriteVars[sprite.id].vy = (spriteVars[sprite.id].vy || 0) * num(p.amount, 0.9);
          break;
        case 'physics-bounce': {
          const st = spriteVars[sprite.id];
          if (sprite.x <= 0 || sprite.x >= STAGE_W - sprite.w) st.vx = -(st.vx || 0);
          if (sprite.y <= 0) st.vy = -(st.vy || 0);
          break;
        }
        case 'var-create':
        case 'var-set': spriteVars[sprite.id]._vars[p.name] = parseFloat(p.value) || 0; break;
        case 'var-change': spriteVars[sprite.id]._vars[p.name] = (spriteVars[sprite.id]._vars[p.name] || 0) + (parseFloat(p.amount) || 0); break;
        case 'var-show':
          sprite._sayText = `${p.name || 'var'}=${spriteVars[sprite.id]._vars[p.name] ?? 0}`;
          sprite._sayUntil = Date.now() + 1500;
          break;
        case 'math-add': globalVars._math = num(p.a, 0) + num(p.b, 0); break;
        case 'math-subtract': globalVars._math = num(p.a, 0) - num(p.b, 0); break;
        case 'math-mult': globalVars._math = num(p.a, 0) * num(p.b, 0); break;
        case 'math-divide': {
          const b = num(p.b, 1);
          globalVars._math = b === 0 ? Infinity : num(p.a, 0) / b;
          break;
        }
        case 'math-modulo': vars._math = num(p.a, 0) % num(p.b, 1); break;
        case 'math-random': vars._math = Math.floor(Math.random() * (num(p.max, 100) - num(p.min, 1) + 1)) + num(p.min, 1); break;
        case 'math-round': {
          const op = p.op || 'round';
          const val = num(p.value, 0);
          switch (op) {
            case 'round': vars._math = Math.round(val); break;
            case 'abs': vars._math = Math.abs(val); break;
            case 'floor': vars._math = Math.floor(val); break;
            case 'ceil': vars._math = Math.ceil(val); break;
            case 'sqrt': vars._math = Math.sqrt(val); break;
            case 'sin': vars._math = Math.sin((val * Math.PI) / 180); break;
            case 'cos': vars._math = Math.cos((val * Math.PI) / 180); break;
            case 'tan': vars._math = Math.tan((val * Math.PI) / 180); break;
            default: vars._math = Math.round(val);
          }
          break;
        }
        case 'text-create': vars._text = txt(p.text, ''); break;
        case 'text-join': vars._text = `${txt(p.a, '')}${txt(p.b, '')}`; break;
        case 'text-length': vars._math = txt(p.text, '').length; break;
        case 'text-letter': {
          const idx = Math.floor(num(p.index, 0));
          vars._text = txt(p.text, '')[idx] || '';
          break;
        }
        case 'text-contains':
          vars._bool = txt(p.text, '').includes(txt(p.search, ''));
          break;
        case 'list-create':
          ensureList(listStoreRef.current, p.name || 'myList');
          refreshListMonitors();
          break;
        case 'list-add': {
          const name = p.list || 'myList';
          listAdd(
            listStoreRef.current,
            name,
            evalListParam(p.item, evaluateCondition, sprite),
          );
          refreshListMonitors();
          break;
        }
        case 'list-delete': {
          listDeleteAt(
            listStoreRef.current,
            p.list,
            evalListIndex(p.index, evaluateCondition, sprite),
          );
          refreshListMonitors();
          break;
        }
        case 'list-delete-all': {
          listDeleteAll(listStoreRef.current, p.list);
          refreshListMonitors();
          break;
        }
        case 'list-insert': {
          listInsertAt(
            listStoreRef.current,
            p.list,
            evalListIndex(p.index, evaluateCondition, sprite),
            evalListParam(p.item, evaluateCondition, sprite),
          );
          refreshListMonitors();
          break;
        }
        case 'list-replace': {
          listReplaceAt(
            listStoreRef.current,
            p.list,
            evalListIndex(p.index, evaluateCondition, sprite),
            evalListParam(p.item, evaluateCondition, sprite),
          );
          refreshListMonitors();
          break;
        }
        case 'list-show': {
          const name = normalizeListName(p.list);
          ensureList(listStoreRef.current, name);
          listVisibleRef.current[name] = { visible: true };
          refreshListMonitors();
          break;
        }
        case 'list-hide': {
          const name = normalizeListName(p.list);
          if (listVisibleRef.current[name]) {
            listVisibleRef.current[name].visible = false;
          }
          refreshListMonitors();
          break;
        }
        case 'list-get': {
          vars._item = listGetItem(
            listStoreRef.current,
            p.list,
            evalListIndex(p.index, evaluateCondition, sprite),
          );
          break;
        }
        case 'sound-play':
          playSpriteSound(sprite, p.sound || 'pop');
          break;
        case 'sound-play-until-done':
          playSpriteSound(sprite, p.sound || 'pop', { wait: true });
          break;
        case 'sound-stop':
          stopSpriteSounds();
          break;
        case 'sound-set-volume':
        case 'sound-volume': {
          const st = getSpriteSoundState(sprite);
          st.volume = Math.max(0, Math.min(100, num(p.volume, 100)));
          vars._volume = st.volume;
          break;
        }
        case 'sound-change-effect': {
          const st = getSpriteSoundState(sprite);
          const effect = String(p.effect || 'pitch').toLowerCase();
          st.effects[effect] = (st.effects[effect] || 0) + num(p.value, 10);
          break;
        }
        case 'sound-set-effect': {
          const st = getSpriteSoundState(sprite);
          const effect = String(p.effect || 'pitch').toLowerCase();
          st.effects[effect] = num(p.value, 0);
          break;
        }
        case 'sound-clear-effects':
          getSpriteSoundState(sprite).effects = { pitch: 0, pan: 0 };
          break;
        // Music blocks
        case 'music-note': {
          const note = p.note || '60'; // Default to C4
          const beats = num(p.beats, 0.5);
          playNote(note, beats, currentInstrument);
          break;
        }
        case 'music-drum': {
          const drums = ['kick', 'snare', 'hihat', 'tom'];
          const drum = drums[Math.min(Math.floor(num(p.drum, 0)), 3)];
          const beats = num(p.beats, 0.5);
          // Use drum sounds (frequency shortcuts)
          const freqs = { kick: 80, snare: 200, hihat: 8000, tom: 150 };
          playNote(freqs[drum] || 100, beats, 'sine');
          break;
        }
        case 'music-rest': {
          // Rest - just wait, no sound
          const beats = num(p.beats, 0.5);
          sprite._musicWait = Date.now() + ((beats / musicTempo) * 60 * 1000);
          break;
        }
        case 'music-instrument': {
          const instruments = ['sine', 'square', 'sawtooth', 'triangle'];
          const idx = Math.floor(num(p.instrument, 0)) % 4;
          currentInstrument = instruments[idx];
          break;
        }
        case 'music-tempo':
          musicTempo = Math.max(1, num(p.tempo, 120));
          break;
        case 'music-tempo-change':
          musicTempo = Math.max(1, musicTempo + num(p.change, 10));
          break;
        case 'music-get-tempo':
          vars._math = musicTempo;
          break;
        case 'action-print': {
          const msg = txt(p.message || p.MESSAGE, 'Hello!').replace(/^"|"$/g, '');
          console.log('[ByteBuddies print]', msg);
          if (msg) {
            sprite._sayText = msg;
            sprite._sayUntil = Date.now() + 2500;
          }
          break;
        }
        case 'action-alert': sprite._sayText = txt(p.message, 'Notice'); sprite._sayUntil = Date.now() + 2000; break;
        case 'action-ask': {
          const flow = getFlowContext(sprite, currentExecThread);
          if (flow.askWaiting) {
            if (globalVars._askResolved) {
              vars._lastAnswer = globalVars._lastAnswer ?? '';
              flow.askWaiting = false;
              setAskDialog(null);
              return false;
            }
            return true;
          }
          globalVars._askResolved = false;
          globalVars._lastAnswer = '';
          flow.askWaiting = true;
          const question = txt(p.prompt, 'What is your name?').replace(/^"|"$/g, '') || '...';
          setAskDialog({ question });
          return true;
        }
        case 'sense-set-drag-mode': {
          const mode = String(p.mode || 'not draggable').toLowerCase();
          sprite._dragMode = mode.includes('not') ? 'not draggable' : 'draggable';
          break;
        }
        case 'game-score-add': localScore += num(p.amount, 10); setScore(localScore); break;
        case 'game-score-set': localScore = num(p.value, 0); setScore(localScore); break;
        case 'game-lose-life': vars._lives = Math.max(0, num(vars._lives, 3) - 1); break;
        case 'game-set-lives': vars._lives = num(p.value, 3); break;
        case 'game-over': running = false; break;
        case 'game-win':
          sprite._sayText = 'You Win!';
          sprite._sayUntil = Date.now() + 2000;
          break;
        case 'game-next-level': vars._level = num(vars._level, 1) + 1; break;
        case 'control-delete-clone':
        case 'game-destroy': {
          if (sprite.isClone && playSpritesRef.current) {
            playSpritesRef.current = playSpritesRef.current.filter((s) => s.id !== sprite.id);
            delete spriteVars[sprite.id];
          } else {
            sprite.visible = false;
          }
          sprite._stopScript = true;
          break;
        }
        case 'control-stop': {
          const opt = String(p.stopOption || p.STOP_OPTION || 'all').toLowerCase();
          if (opt === 'all' || opt.includes('all')) {
            running = false;
            stopAllScriptThreads(playSpritesRef.current || []);
          } else if (opt.includes('other')) {
            stopOtherScriptsOnSprite(sprite, currentExecThread);
          } else {
            stopThisScript(currentExecThread, sprite);
          }
          break;
        }
        case 'game-pause': running = false; break;
        case 'event-broadcast': vars._broadcast = txt(p.message, 'go'); break;
        // Control flow blocks
        case 'control-wait': {
          const secs = num(p.secs ?? p.SECONDS, 1);
          const flow = getFlowContext(sprite, currentExecThread);
          if (flow.waitEndTime != null) {
            if (Date.now() < flow.waitEndTime) return true;
            flow.waitEndTime = null;
            return false;
          }
          setWaitSeconds(flow, secs);
          return true;
        }
        case 'sense-timer':
          vars._math = getTimerSeconds(globalVars._timerStart);
          break;
        case 'sense-reset-timer':
          globalVars._timerStart = Date.now();
          break;
        case 'logic-if': {
          const cond = evaluateCondition({ type: p.condition_type || 'logic-bool', params: p }, sprite);
          // If condition is true, the body will be executed by the parent execBody
          sprite._ifCondition = cond;
          break;
        }
        // Looks blocks
        case 'looks-costume': {
          const ok = switchCostume(sprite, p.costume ?? p.COSTUME ?? 1, invalidateSpriteImageCache);
          if (ok) {
            requestAnimationFrame(() => {
              drawRef.current?.(playSpritesRef.current || [], { playing: true });
            });
          }
          break;
        }
        case 'looks-next-costume': {
          const ok = nextCostume(sprite, invalidateSpriteImageCache);
          if (ok) {
            requestAnimationFrame(() => {
              drawRef.current?.(playSpritesRef.current || [], { playing: true });
            });
          }
          break;
        }
        case 'looks-change-effect':
          changeEffect(sprite, p.effect || 'color', num(p.value, 25));
          break;
        case 'looks-set-effect':
          setEffect(sprite, p.effect || 'color', num(p.value, 0));
          break;
        case 'looks-color-effect':
          setEffect(sprite, 'color', num(p.value, 0));
          break;
        case 'looks-ghost-effect':
          setEffect(sprite, 'ghost', Math.max(0, Math.min(100, num(p.value, 0))));
          break;
        case 'looks-clear-effects':
          clearGraphicEffects(sprite);
          break;
        case 'looks-front':
          goToFrontLayer(playSpritesRef.current, sprite);
          break;
        case 'looks-back':
          goToBackLayer(playSpritesRef.current, sprite);
          break;
        case 'looks-goto-layer':
          if (String(p.layer || 'front').toLowerCase() === 'back') {
            goToBackLayer(playSpritesRef.current, sprite);
          } else {
            goToFrontLayer(playSpritesRef.current, sprite);
          }
          break;
        case 'looks-forward-layers':
        case 'looks-layer-step': {
          const layerAmount = num(p.layers ?? p.NUM, 1);
          const forward = String(p.direction || 'forward').toLowerCase() !== 'backward';
          goLayers(sprite, layerAmount, forward);
          break;
        }
        case 'looks-backdrop':
          applyPlayBackdropRef.current?.(p.backdrop ?? p.BACKDROP ?? 'Sky');
          break;
        case 'looks-next-backdrop': {
          const names = [
            ...STAGE_BACKDROP_NAMES,
            ...(customBackgrounds || []).map((b) => b.name).filter((n) => n && !STAGE_BACKDROP_NAMES.includes(n)),
          ];
          const cur = playBackdropRef.current ?? 0;
          applyPlayBackdropRef.current?.(names[nextBackdropIndex(names, cur)] || names[0]);
          break;
        }
        case 'math-abs':
          vars._math = Math.abs(num(p.value, 0));
          break;
        case 'math-floor':
          vars._math = Math.floor(num(p.value, 0));
          break;
        case 'math-ceil':
          vars._math = Math.ceil(num(p.value, 0));
          break;
        case 'math-sqrt':
          vars._math = Math.sqrt(num(p.value, 0));
          break;
        // Game spawn/clone with proper initialization
        case 'control-create-clone':
        case 'game-spawn': {
          if (!playSpritesRef.current) break;
          const rawTarget = p.sprite ?? p.CLONE_OPTION ?? 'myself';
          const targetSprite = rawTarget === 'myself' || rawTarget === 'this'
            ? sprite
            : playSpritesRef.current.find((s) => s.name === String(rawTarget));
          if (targetSprite) {
            const templateVars = spriteVars[targetSprite.id];
            const clone = {
              ...JSON.parse(JSON.stringify(targetSprite)),
              id: Date.now() + Math.random(),
              isClone: true,
              _cloneOriginal: targetSprite.id,
              x: sprite.x,
              y: sprite.y,
              vx: 0,
              vy: 0,
              blocks: (targetSprite.blocks || []).map((b) => ({
                ...b,
                params: { ...(b.params || {}) },
              })),
            };
            playSpritesRef.current.push(clone);
            spriteVars[clone.id] = templateVars
              ? JSON.parse(JSON.stringify(templateVars))
              : createPhysicsState();
            resetSpriteThreads(clone);
            ensureSpriteMotionState(clone);
            initSpriteLooks(clone);
            getSpriteSoundState(clone);
            startCloneHatThreads(clone, playSpritesRef.current);
            sprite._justCloned = clone;
          }
          break;
        }
        // Function/custom block support
        case 'func-define': {
          if (!sprite._functionRegistry) {
            sprite._functionRegistry = new FunctionRegistry();
          }
          const funcName = p.name || 'myFunc';
          const params = p.params ? String(p.params).split(',').map(s => s.trim()) : [];
          sprite._functionRegistry.define(funcName, params, []);
          break;
        }
        case 'func-call': {
          if (!sprite._functionRegistry) {
            sprite._functionRegistry = new FunctionRegistry();
          }
          const funcName = p.name || 'myFunc';
          if (sprite._functionRegistry.exists(funcName)) {
            sprite._functionRegistry.call(funcName, p.args || {}, execBlock, sprite, vars);
          }
          break;
        }
        case 'func-return': {
          sprite._returnValue = evaluateCondition({ type: 'logic-bool', params: { value: p.value } }, sprite) || p.value;
          break;
        }
        // Custom block running
        case 'myblock-run': {
          if (!sprite._functionRegistry) {
            sprite._functionRegistry = new FunctionRegistry();
          }
          const blockName = p.name || 'my block';
          if (sprite._functionRegistry.exists(blockName)) {
            sprite._functionRegistry.call(blockName, {}, execBlock, sprite, vars);
          }
          break;
        }
        // ═══ POSE/HUMAN-BODY-DETECTION EXTENSION BLOCKS ═══
        case 'pose-video-on': {
          const state = (p && p.state) ? String(p.state).toLowerCase() : 'on';
          ensureCameraOn('pose-video-on', sprite);
          cameraStateRef.current.isOn = state === 'on';
          break;
        }
        case 'pose-video-off': {
          cameraStateRef.current.isOn = false;
          break;
        }
        case 'pose-show-detections':
          ensureCameraOn('pose-show-detections', sprite);
          // Skip extension engine to avoid fullscreen camera
          vars._pose_show = true;
          break;
        case 'pose-hide-detections':
          // Skip extension engine to avoid fullscreen camera
          vars._pose_show = false;
          break;
        case 'pose-analyze':
          ensureCameraOn('pose-analyze', sprite);
          // Skip extension engine to avoid fullscreen camera
          vars._pose_analyzed = true;
          break;
        case 'pose-count-people':
          ensureCameraOn('pose-count-people', sprite);
          // Return safe fallback without triggering fullscreen camera
          vars._pose_count = 0;
          break;
        case 'pose-position-x':
          ensureCameraOn('pose-position-x', sprite);
          // Return safe fallback without triggering fullscreen camera
          vars._pose_x = 0;
          break;
        case 'pose-position-y':
          ensureCameraOn('pose-position-y', sprite);
          // Return safe fallback without triggering fullscreen camera
          vars._pose_y = 0;
          break;
        case 'pose-visible':
          ensureCameraOn('pose-visible', sprite);
          // Return safe fallback without triggering fullscreen camera
          vars._pose_visible = false;
          break;
        case 'hand-analyze':
          ensureCameraOn('hand-analyze', sprite);
          // Skip extension engine to avoid fullscreen camera
          vars._hand_analyzed = true;
          break;
        case 'hand-detected':
          ensureCameraOn('hand-detected', sprite);
          // Return safe fallback without triggering fullscreen camera
          vars._hand_detected = false;
          break;
        case 'hand-position-x':
          ensureCameraOn('hand-position-x', sprite);
          // Return safe fallback without triggering fullscreen camera
          vars._hand_x = 0;
          break;
        case 'hand-position-y':
          ensureCameraOn('hand-position-y', sprite);
          // Return safe fallback without triggering fullscreen camera
          vars._hand_y = 0;
          break;
        // ═══ BODY DETECTION EXTENSION BLOCKS ═══
        case 'body-video-on': {
          const state = (p && p.state) ? String(p.state).toLowerCase() : 'on';
          const transparency = p && p.transparency ? Math.max(0, Math.min(100, parseInt(p.transparency, 10))) : 0;
          const wasOn = cameraStateRef.current?.isOn;

          console.log('[Body] body-video-on block executed! state:', state, 'transparency:', transparency);
          console.log('[Body] Previous state was ON:', wasOn);

          // Only initialize camera if state is 'on'
          if (state === 'on') {
            console.log('[Body] State is ON - initializing camera');
            ensureCameraOn('body-video-on', sprite);
            cameraStateRef.current.isOn = true;
            // If we were off and now turning on, resume the webcam
            if (!wasOn && cameraStateRef.current.webcam) {
              console.log('[Body] Resuming webcam (was off, now on)');
              cameraStateRef.current.webcam.resume();
            }
          } else {
            // Turn camera off - pause instead of stop to keep stream alive
            console.log('[Body] State is OFF - pausing camera');
            cameraStateRef.current.isOn = false;
            if (cameraStateRef.current.webcam) {
              console.log('[Body] Pausing webcam stream');
              cameraStateRef.current.webcam.pause();
            }
          }

          console.log('[Body] After state change: isOn=', cameraStateRef.current.isOn);

          // Always set transparency value
          if (transparency !== undefined) {
            vars._camera_transparency = transparency;
            console.log('[Body] Set transparency to:', transparency);
          }
          break;
        }
        case 'body-show-detections':
          ensureCameraOn('body-show-detections', sprite);
          // Skip extension engine - use stage-based rendering
          vars._body_show = true;
          break;
        case 'body-analyse': {
          ensureCameraOn('body-analyse', sprite);
          // Skip extension engine to avoid fullscreen camera
          vars._body_analyzed = true;
          break;
        }
        case 'body-get-count':
          ensureCameraOn('body-get-count', sprite);
          // Return safe fallback without triggering fullscreen camera
          vars._body_count = 0;
          break;
        case 'body-x-position':
          ensureCameraOn('body-x-position', sprite);
          // Return safe fallback without triggering fullscreen camera
          vars._body_x = 0;
          break;
        case 'body-y-position':
          ensureCameraOn('body-y-position', sprite);
          // Return safe fallback without triggering fullscreen camera
          vars._body_y = 0;
          break;
        case 'body-is-detected':
          ensureCameraOn('body-is-detected', sprite);
          // Return safe fallback without triggering fullscreen camera
          vars._body_detected = false;
          break;
        // ═══ FACE DETECTION EXTENSION BLOCKS ═══
        case 'face-video-on': {
          const state = (p && p.state) ? String(p.state).toLowerCase() : 'on';
          ensureCameraOn('face-video-on', sprite);
          cameraStateRef.current.isOn = state === 'on';
          break;
        }
        case 'face-video-off': {
          cameraStateRef.current.isOn = false;
          break;
        }
        case 'face-analyze':
          ensureCameraOn('face-analyze', sprite);
          // Skip extension engine to avoid fullscreen camera
          vars._face_analyzed = true;
          break;
        case 'face-count':
          ensureCameraOn('face-count', sprite);
          // Return safe fallback (0) without triggering fullscreen camera
          vars._face_count = 0;
          break;
        case 'face-visible':
          ensureCameraOn('face-visible', sprite);
          // Return safe fallback without triggering fullscreen camera
          vars._face_visible = false;
          break;
        // ═══ OBJECT DETECTION EXTENSION BLOCKS ═══
        case 'object-video-on': {
          const state = (p && p.state) ? String(p.state).toLowerCase() : 'on';
          ensureCameraOn('object-video-on', sprite);
          cameraStateRef.current.isOn = state === 'on';
          break;
        }
        case 'object-video-off': {
          cameraStateRef.current.isOn = false;
          break;
        }
        case 'object-analyze':
          ensureCameraOn('object-analyze', sprite);
          // Skip extension engine to avoid fullscreen camera
          vars._object_analyzed = true;
          break;
        case 'object-count':
          ensureCameraOn('object-count', sprite);
          // Return safe fallback without triggering fullscreen camera
          vars._object_count = 0;
          break;
        // ═══ QR CODE EXTENSION BLOCKS (stage camera — same as body/face) ═══
        case 'qr-video-on': {
          const state = String(p.state || p.STATE || 'on').toLowerCase();
          const trans = Math.max(0, Math.min(100, parseInt(p.transparency ?? p.TRANSPARENCY ?? 0, 10)));
          const wasOn = cameraStateRef.current?.isOn;
          globalVars._camera_transparency = trans;
          if (state === 'off') {
            cameraStateRef.current.isOn = false;
            if (cameraStateRef.current.webcam) cameraStateRef.current.webcam.pause();
            runExtensionGame('qr|video|off', sprite);
          } else {
            ensureCameraOn('qr-video-on', sprite);
            cameraStateRef.current.isOn = true;
            if (!wasOn && cameraStateRef.current.webcam) cameraStateRef.current.webcam.resume();
            runExtensionGame(`qr|video|on|${trans}`, sprite);
          }
          break;
        }
        case 'qr-bounding-box': {
          const mode = String(p.mode || p.MODE || 'show').toLowerCase();
          runExtensionGame(`qr|bbox|${mode === 'hide' ? 'hide' : 'show'}`, sprite);
          break;
        }
        case 'qr-analyse-camera':
          analyseQrFromGameStage(cameraStateRef).then((msg) => {
            if (msg && sprite) {
              sprite._sayText = String(msg).slice(0, 120);
              sprite._sayUntil = Date.now() + 2500;
            }
          });
          break;
        // ═══ AI TEXT/SPEECH BLOCKS ═══
        case 'chat-ask':
          runExtensionGame('chat|ask|' + txt(p.question || p.QUESTION, 'How do I move the sprite?'), sprite);
          break;
        case 'tts-speak':
          // Text-to-speech (simulated via say block)
          sprite._sayText = txt(p.text, '');
          sprite._sayUntil = Date.now() + 2000;
          break;
        // ═══ OTHER AI/ML BLOCKS ═══
        case 'ml-train':
          runExtensionGame('ml|train', sprite);
          break;
        case 'ml-training-open':
          runExtensionGame('ml|training_open', sprite);
          break;
        case 'ic-classify':
          runExtensionGame('ic|classify', sprite);
          break;
        case 'pc-capture':
          runExtensionGame('pc|capture', sprite);
          break;
        // ═══ CAMERA SYSTEM BLOCKS ═══
        // Catch-all for any video/camera blocks
        default:
          // Handle blocks with 'video' in the name (for any missed block types)
          if (block.type && (block.type.includes('video') || block.type.includes('camera'))) {
            const state = (p && p.state) ? String(p.state).toLowerCase() : 'on';
            console.log(`[GameBuilder] Catch-all video handler for block type: ${block.type}, state: ${state}`);
            ensureCameraOn(block.type, sprite);
            cameraStateRef.current.isOn = state === 'on';
            break;
          }
          // Route camera-* blocks to the new production camera system
          if (block.type && block.type.startsWith('camera-')) {
            // Initialize camera on first use of camera blocks
            if (!cameraStateRef.current.initialized && block.type === 'camera-turn-on') {
              import('../systems/camera').then(({ WebcamManager }) => {
                const webcam = new WebcamManager({
                  width: 1280,
                  height: 720,
                  mirrored: false,
                  transparency: 0,
                });
                (async () => {
                  const initialized = await webcam.initialize();
                  if (initialized) {
                    await webcam.start();
                    cameraStateRef.current.initialized = true;
                    cameraStateRef.current.webcam = webcam;
                    window.gameWebcam = webcam;
                    console.log('[GameBuilder] 📹 Camera initialized via camera block');
                  }
                })();
              }).catch(err => {
                console.error('[GameBuilder] Failed to import camera system:', err);
              });
            }

            // Track camera on/off state for rendering
            if (block.type === 'camera-turn-on') {
              const state = (block.params?.state || 'on').toLowerCase();
              cameraStateRef.current.isOn = state === 'on';
            }

            const params = block.params || {};
            executeCAMERABlock(block.type, params).catch(err => {
              console.error(`[GameBuilder] Camera block error (${block.type}):`, err);
            });
          }
          break;
      }
    }

    function updatePhysics(sprite, dtSec) {
      if (isSpriteMotionBusy(sprite)) return;
      if (!spriteVars[sprite.id]) spriteVars[sprite.id] = createPhysicsState();
      const role = sprite.physicsRole || 'actor';
      const platforms = getPlatformRects(playSpritesRef.current, sprite.id);
      integratePlatformerSprite(
        sprite,
        spriteVars[sprite.id],
        dtSec,
        STAGE_W,
        STAGE_H,
        platforms,
        role,
      );
    }

    /**
     * Run a stack of blocks. Yields on move/glide/wait (Scratch-style).
     * @returns {number|false} index to resume at, or false when stack finished
     */
    function execBody(body, sprite, startPc = 0, thread = null) {
      if (!body?.length) {
        currentExecThread = null;
        return false;
      }

      currentExecThread = thread;
      const flow = getFlowContext(sprite, thread);
      if (thread?.stopped || flow.stopped) {
        currentExecThread = null;
        return false;
      }

      const now = Date.now();
      if (flow.waitEndTime != null && now < flow.waitEndTime) {
        currentExecThread = null;
        return startPc;
      }
      if (flow.waitingUntil) {
        if (!shouldResumeWaitUntil(flow, evaluateCondition, sprite)) {
          currentExecThread = null;
          return startPc;
        }
        flow.waitingUntil = null;
      }

      for (let i = startPc; i < body.length; i++) {
        const blk = body[i];

        if (thread?.stopped || flow.stopped) {
          currentExecThread = null;
          return false;
        }

        // Handle if/else blocks
        if (blk.type === "logic-if") {
          const cond = blk.params?._cond
            ? evaluateCondition(blk.params._cond, sprite)
            : evaluateCondition(blk, sprite);
          const ifBody = [];
          const elseBody = [];
          let j = i + 1;
          let depth = 1;
          let inElse = false;

          while (j < body.length && depth > 0) {
            const b = body[j];
            if (b.type.startsWith('event-')) {
              break;
            }
            if (b.type === 'logic-else') {
              if (depth === 1) {
                inElse = true;
                j++;
                continue;
              }
              (inElse ? elseBody : ifBody).push(b);
              j++;
              continue;
            }
            if (b.type === 'logic-end-if') {
              depth--;
              j++;
              continue;
            }
            if (b.type === 'logic-if') {
              depth++;
              (inElse ? elseBody : ifBody).push(b);
              j++;
              continue;
            }
            (inElse ? elseBody : ifBody).push(b);
            j++;
          }

          if (cond) {
            if (execBody(ifBody, sprite, 0, thread) !== false) {
              currentExecThread = null;
              return i;
            }
          } else if (execBody(elseBody, sprite, 0, thread) !== false) {
            currentExecThread = null;
            return i;
          }
          i = j - 1;
          continue;
        }

        if (blk.type === 'logic-else' || blk.type === 'logic-end-if' || blk.type === 'loop-end-loop') {
          continue;
        }

        // Handle loops
        if (blk.type === "loop-repeat") {
          const times = Math.min(Math.max(0, parseInt(blk.params?.times, 10) || 0), 200);
          const { loopBody, endIndex } = collectLoopBody(body, i);
          const repeatHost = thread || sprite;
          if (!repeatHost.repeatState || repeatHost.repeatState.blockIndex !== i) {
            repeatHost.repeatState = { blockIndex: i, iteration: 0, innerPc: 0 };
          }
          const rs = repeatHost.repeatState;
          while (rs.iteration < times) {
            sprite._loopIndex = rs.iteration + 1;
            const pauseAt = execBody(loopBody, sprite, rs.innerPc, thread);
            if (pauseAt !== false) {
              rs.innerPc = pauseAt;
              currentExecThread = null;
              return i;
            }
            rs.innerPc = 0;
            rs.iteration += 1;
          }
          repeatHost.repeatState = null;
          i = endIndex;
          continue;
        }

        if (blk.type === 'loop-forever') {
          const { loopBody, endIndex } = collectLoopBody(body, i);
          registerForeverThread(sprite, loopBody);
          i = endIndex;
          continue;
        }

        // Handle while loops
        if (blk.type === "loop-while") {
          const loopBody = [];
          let j = i + 1;

          // Collect loop body until end marker
          while (j < body.length) {
            const b = body[j];
            if (b.type === 'loop-end-loop') {
              j++;
              break;
            }
            if (b.type.startsWith('event-') || b.type === 'loop-while') {
              break;
            }
            loopBody.push(b);
            j++;
          }

          // Execute while condition is true
          while (evaluateCondition(blk, sprite)) {
            if (execBody(loopBody, sprite, 0, thread) !== false) {
              currentExecThread = null;
              return i;
            }
            if (sprite._breakLoop) {
              sprite._breakLoop = false;
              break;
            }
            if (thread?.stopped) break;
          }

          i = j - 1;
          continue;
        }

        // Handle for-each loops
        if (blk.type === "loop-foreach") {
          const listName = blk.params?.list || 'myList';
          const list = listStoreRef.current[listName] || [];
          const loopBody = [];
          let j = i + 1;

          // Collect loop body until end marker
          while (j < body.length) {
            const b = body[j];
            if (b.type === 'loop-end-loop') {
              j++;
              break;
            }
            if (b.type.startsWith('event-') || b.type === 'loop-foreach') {
              break;
            }
            loopBody.push(b);
            j++;
          }

          // Execute for each item in list
          for (const item of list) {
            vars[blk.params?.item || 'item'] = item;
            if (execBody(loopBody, sprite, 0, thread) !== false) {
              currentExecThread = null;
              return i;
            }
            if (sprite._breakLoop) {
              sprite._breakLoop = false;
              break;
            }
          }

          i = j - 1;
          continue;
        }

        if (blk.type === 'loop-break') {
          sprite._breakLoop = true;
          currentExecThread = null;
          return false;
        }

        if (blk.type === 'control-wait-until') {
          const condBlk = blk.params?._cond;
          const ready = condBlk ? evaluateCondition(condBlk, sprite) : false;
          if (!ready) {
            setWaitUntilCondition(flow, condBlk);
            currentExecThread = null;
            return i;
          }
          flow.waitingUntil = null;
          continue;
        }

        if (blk.type === 'control-repeat-until') {
          const { loopBody, endIndex } = collectLoopBody(body, i);
          const done = blk.params?._cond
            ? () => evaluateCondition(blk.params._cond, sprite)
            : () => true;
          while (!done()) {
            if (execBody(loopBody, sprite, 0, thread) !== false) {
              currentExecThread = null;
              return i;
            }
            if (sprite._breakLoop) {
              sprite._breakLoop = false;
              break;
            }
            if (thread?.stopped) break;
          }
          i = endIndex;
          continue;
        }

        if (execBlock(blk, sprite)) {
          currentExecThread = null;
          return i;
        }
        if (thread?.stopped || sprite._stopScript) {
          sprite._stopScript = false;
          currentExecThread = null;
          return false;
        }
      }

      currentExecThread = null;
      return false;
    }

    // Initialize global function registry
    const functionRegistry = new FunctionRegistry();

    let spriteChains = getSpriteChains();

    spriteChains.forEach(({ sprite, chains }) => {
      applyMotionFlagsFromChains(sprite, chains);
      initGreenFlagThreads(sprite, chains);
    });

    // Run green-flag scripts before first paint so "set rotation style" applies immediately
    blockStepsRemaining = MAX_BLOCK_STEPS_PER_ANIMATION_FRAME;
    blockBudgetWarned = false;
    stepGreenFlagChains(spriteChains, execBody);
    (drawRef.current || draw)(playSpritesRef.current, { playing: true });

    let running = true;
    const messageQueue = [];

    // Track body video state for real-time changes during gameplay
    let lastBodyVideoState = null;
    let lastBodyVideoTransparency = null;

    // Initialize default physics for all sprites
    spriteChains.forEach(({ sprite }) => {
      sprite._syntheticEventStartExecuted = false;
      if (!sprite._dragMode) sprite._dragMode = 'not draggable';
    });

    let lastFrameTs = Date.now();
    let now = Date.now();

    const loop = (now) => {
      if (!running) return;

      stageImageData = null;

      // Get current sprites array
      const ps = playSpritesRef.current || [];

      const dtSec = Math.min(0.05, Math.max(0, (now - lastFrameTs) / 1000));

      // Green flag (when ▶ clicked): runs once per play, with yield/resume for move & glide
      spriteChains = getSpriteChains();
      blockStepsRemaining = MAX_BLOCK_STEPS_PER_ANIMATION_FRAME;
      blockBudgetWarned = false;
      stepGreenFlagChains(spriteChains, execBody);

      // One sequencer tick ≈ one Scratch-vm frame (~60 Hz): reset cooperative step budget
      blockStepsRemaining = MAX_BLOCK_STEPS_PER_ANIMATION_FRAME;
      blockBudgetWarned = false;

      // Phase 1 — clone hats (Scratch: when I start as a clone; cooperative threads)
      stepCloneHatThreads(ps, execBody);

      // Phase 2 — keyboard hats (Scratch: when key pressed — edge-triggered)
      spriteChains.forEach(({ sprite, chains }) => {
        chains.filter(c => c.trigger.type === 'event-keypress').forEach(chain => {
          const triggerKey = chain.trigger.params?.key || '';
          if (isKeyJustPressed(keysPressed, keysPressedPrev, triggerKey)) {
            execBody(chain.body, sprite);
          }
        });
      });

      // Update previous key state for next frame - track ALL keys
      Object.keys(keysPressed).forEach(key => {
        keysPressedPrev[key] = keysPressed[key];
      });
      // Also clear keys that were released
      Object.keys(keysPressedPrev).forEach(key => {
        if (!(key in keysPressed)) {
          keysPressedPrev[key] = false;
        }
      });

      // Phase 3 — click hats (Scratch: when this sprite clicked)
      spriteChains.forEach(({ sprite, chains }) => {
        if (sprite._justClicked) {
          chains.filter(c => c.trigger.type === 'event-click').forEach(chain => {
            execBody(chain.body, sprite);
          });
          sprite._justClicked = false; // Clear flag after processing
        }
      });

      // Phase 4 — message hats (Scratch: when I receive …)
      while (messageQueue.length > 0) {
        const msg = messageQueue.shift();
        spriteChains.forEach(({ sprite, chains }) => {
          chains.filter(c => c.trigger.type === 'event-message').forEach(chain => {
            const triggerMsg = (chain.trigger.params?.message || 'go').toLowerCase();
            if (msg.toLowerCase() === triggerMsg) {
              execBody(chain.body, sprite);
            }
          });
        });
      }

      // Phase 5 — collision hats (extension of Scratch touching; event-driven here)
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const a = ps[i], b = ps[j];
          if (!a.visible || !b.visible) continue;
          if (a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y) {
            [a, b].forEach(function(sprite) {
              var other = sprite === a ? b : a;
              var sc = spriteChains.find(function(s) { return s.sprite.id === sprite.id; });
              if (!sc) return;
              sc.chains.filter(function(c) { return c.trigger.type === 'event-collision'; }).forEach(function(chain) {
                var withName = ((chain.trigger.params && chain.trigger.params.with) || 'any').toLowerCase();
                if (withName === 'any' || other.name.toLowerCase() === withName) execBody(chain.body, sprite);
              });
            });
          }
        }
      }

      // Update broadcast messages from blocks that ran
      if (globalVars._broadcast) {
        messageQueue.push(globalVars._broadcast);
        globalVars._broadcast = null;
      }

      // Phase 6 — forever loops (one cooperative step per thread per frame)
      blockStepsRemaining = MAX_BLOCK_STEPS_PER_ANIMATION_FRAME;
      blockBudgetWarned = false;
      ps.forEach((sprite) => {
        stepForeverThreads(sprite, execBody);
      });

      // Advance move/glide + edge bounce after scripts (so green-flag enables drift same frame)
      ps.forEach((sprite) => {
        if (sprite.visible !== false) tickSpriteAnimations(sprite, dtSec);
      });

      // Phase 7 — platformer physics (skipped while scratch move/glide controls position)
      lastFrameTs = now;
      ps.forEach((sprite) => {
        if (sprite.visible !== false) updatePhysics(sprite, dtSec);
      });

      // Phase 7.5 — Handle face video on/off
      const faceVideoState = globalVars._faceVideo || { enabled: false };
      const wasPreviouslyEnabled = faceVideoStateRef.current.enabled;
      const isNowEnabled = faceVideoState.enabled === true;

      if (isNowEnabled && !wasPreviouslyEnabled) {
        // Face video just turned on — initialize webcam
        console.log('[Face Video] Turning on, requesting camera access...');
        webcamManager.initialize(canvasRef.current?.parentElement || document.body).then(success => {
          if (success) {
            console.log('[Face Video] Done');
            faceVideoStateRef.current.enabled = true;
            faceVideoStateRef.current.transparency = faceVideoState.transparency || 0;
          } else {
            console.error('[Face Video] Failed to initialize camera');
          }
        });
      } else if (!isNowEnabled && wasPreviouslyEnabled) {
        // Face video just turned off — shutdown webcam
        console.log('[Face Video] Turning off');
        webcamManager.shutdown();
        faceVideoStateRef.current.enabled = false;
      } else if (isNowEnabled && faceVideoState.transparency !== faceVideoStateRef.current.transparency) {
        // Update transparency if it changed
        webcamManager.setTransparency(faceVideoState.transparency || 0);
        faceVideoStateRef.current.transparency = faceVideoState.transparency || 0;
      }

      // Phase 7.7 — Handle body video on/off (real-time monitoring for Blockly changes)
      // Check current React state for body-video-on block parameters that may have changed
      if (sprites && sprites.length > 0 && sprites[0].blocks) {
        for (let bi = 0; bi < sprites[0].blocks.length; bi++) {
          const blk = sprites[0].blocks[bi];
          if ((blk.type === 'body-video-on' || blk.type === 'bb_body_video_on') && blk.params) {
            const currentState = (blk.params.state) ? String(blk.params.state).toLowerCase() : 'on';
            const currentTransparency = blk.params.transparency ? Math.max(0, Math.min(100, parseInt(blk.params.transparency, 10))) : 0;

            // Check if state changed
            if (currentState !== lastBodyVideoState) {
              console.log('[Body] State changed to:', currentState, '(was:', lastBodyVideoState, ')');
              lastBodyVideoState = currentState;

              if (currentState === 'on') {
                console.log('[Body] 🎥 Turning camera ON (real-time)');
                cameraStateRef.current.isOn = true;
                if (cameraStateRef.current.webcam) {
                  cameraStateRef.current.webcam.resume();
                }
              } else {
                console.log('[Body] 📹 Turning camera OFF (real-time)');
                cameraStateRef.current.isOn = false;
                if (cameraStateRef.current.webcam) {
                  cameraStateRef.current.webcam.pause();
                }
              }
            }

            // Check if transparency changed
            if (currentTransparency !== lastBodyVideoTransparency) {
              console.log('[Body] Transparency changed to:', currentTransparency + '%');
              lastBodyVideoTransparency = currentTransparency;
              globalVars._camera_transparency = currentTransparency;
            }
            break; // Only check first body-video-on block
          }
        }
      }

      // Phase 8 — render
      (drawRef.current || draw)(ps, { playing: true });
      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => {
      running = false;
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('mousemove', handleMouseMove);
      loudnessMonitorRef.current?.stop();
      loudnessMonitorRef.current = null;
      setAskDialog(null);
      playDragSpriteRef.current = null;
    };
  }, [isPlaying]);

  /* ─── GameRuntime Integration ─── */
  useEffect(() => {
    if (!isPlaying || !runtimeRef.current) return;

    const runtime = runtimeRef.current;
    const interval = setInterval(() => {
      // Update game state from display
      runtime.gameState.score = score;

      // Sync runtime state back to React for HUD display
      setGameState({
        score: runtime.gameState.score,
        lives: runtime.gameState.lives,
        level: runtime.gameState.level,
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, score]);

  /* ─── Canvas interaction ─── */
  const getCanvasPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: (e.clientX - rect.left) * (STAGE_W / rect.width), y: (e.clientY - rect.top) * (STAGE_H / rect.height) };
  };

  const getResizeHandle = (sprite, x, y) => {
    const handleSize = 8;
    const checks = [
      { name: 'tl', x: sprite.x - handleSize, y: sprite.y - handleSize, w: handleSize * 2, h: handleSize * 2 },
      { name: 'tr', x: sprite.x + sprite.w - handleSize, y: sprite.y - handleSize, w: handleSize * 2, h: handleSize * 2 },
      { name: 'bl', x: sprite.x - handleSize, y: sprite.y + sprite.h - handleSize, w: handleSize * 2, h: handleSize * 2 },
      { name: 'br', x: sprite.x + sprite.w - handleSize, y: sprite.y + sprite.h - handleSize, w: handleSize * 2, h: handleSize * 2 },
    ];
    return checks.find(h => x >= h.x && x <= h.x + h.w && y >= h.y && y <= h.y + h.h)?.name;
  };

  const submitAskAnswer = useCallback((answer) => {
    globalVarsRef.current._lastAnswer = String(answer ?? '');
    globalVarsRef.current._askResolved = true;
    setAskDialog(null);
  }, []);

  const handleCanvasMouseDown = (e) => {
    if (isPlaying) {
      const { x, y } = getCanvasPos(e);
      mouseDownRef.current = true;

      // Notify GameRuntime of click
      if (runtimeRef.current) {
        runtimeRef.current.onClick(x, y);
      }

      const ps = playSpritesRef.current;
      const clicked = [...ps].reverse().find(s => s.visible !== false && x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h);

      if (clicked && clicked._dragMode === 'draggable') {
        playDragSpriteRef.current = { id: clicked.id, offsetX: x - clicked.x, offsetY: y - clicked.y };
      }

      // Set flag to trigger event-click blocks in game loop
      if (clicked) {
        clicked._justClicked = true;
      }
      if (clicked) {
        const body = [];
        let capturing = false;
        for (const b of clicked.blocks) {
          if (b.type === 'event-click') { capturing = true; continue; }
          if (capturing) { if (b.type.startsWith('event-')) break; body.push(b); }
        }
        const vars = {};
        body.forEach(b => { const p = b.params || {};
          switch (b.type) {
            case 'sprite-show': clicked.visible = true; break;
            case 'sprite-hide': clicked.visible = false; break;
            case 'sprite-say': {
              const secs = parseFloat(p.secs);
              say(clicked, (p.text || '').replace(/"/g, ''), Number.isFinite(secs) && secs > 0 ? secs : 2);
              break;
            }
            case 'action-print': clicked._sayText = (p.message || '').replace(/"/g, ''); clicked._sayUntil = Date.now() + 2000; break;
            default: {
              const bt = b.type || b.blocklyType || '';
              if (applyRotationStyleBlock(b, clicked)) {
                /* applied */
              } else if (isMotionBlock(bt) && !isMotionReporter(bt)) {
                executeSpriteMotion(b, clicked, {
                  sprites: playSpritesRef.current || [],
                  mouseX: mouseRef.current?.x ?? 0,
                  mouseY: mouseRef.current?.y ?? 0,
                });
              }
              break;
            }
          }
          clicked.x = Math.max(0, Math.min(STAGE_W - clicked.w, clicked.x));
          clicked.y = Math.max(0, Math.min(STAGE_H - clicked.h, clicked.y));
        });
      }
      return;
    }
    const { x, y } = getCanvasPos(e);
    const selectedObj = selected ? sprites.find(s => s.id === selected) : null;
    const clicked = [...sprites].reverse().find(s => x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h);

    // Check selected sprite resize handles first (corners can be outside body bounds)
    if (selectedObj) {
      const handle = getResizeHandle(selectedObj, x, y);
      if (handle) {
        setResizingSprite(selected);
        setResizeHandle(handle);
        setResizeStart({ x, y, w: selectedObj.w, h: selectedObj.h, baseX: selectedObj.x, baseY: selectedObj.y });
        return;
      }
    }

    if (clicked) {
      setSelected(clicked.id);
      setDraggingSprite(clicked.id);
      setDragOffset({ x: x - clicked.x, y: y - clicked.y });
    } else {
      setSelected(null);
    }
  };

  const handleCanvasMouseMove = (e) => {
    const pos = getCanvasPos(e);
    mouseRef.current = pos;
    const { x, y } = pos;

    if (resizingSprite && resizeStart) {
      const dx = x - resizeStart.x;
      const dy = y - resizeStart.y;
      const minSize = 20;
      setSprites(prev => prev.map(s => {
        if (s.id !== resizingSprite) return s;
        let newW = resizeStart.w;
        let newH = resizeStart.h;
        let newX = resizeStart.baseX ?? s.x;
        let newY = resizeStart.baseY ?? s.y;

        if (resizeHandle.includes('r')) newW = Math.max(minSize, resizeStart.w + dx);
        if (resizeHandle.includes('l')) {
          newW = Math.max(minSize, resizeStart.w - dx);
          newX = s.x + (resizeStart.w - newW);
        }
        if (resizeHandle.includes('b')) newH = Math.max(minSize, resizeStart.h + dy);
        if (resizeHandle.includes('t')) {
          newH = Math.max(minSize, resizeStart.h - dy);
          newY = s.y + (resizeStart.h - newH);
        }

        newX = Math.max(0, Math.min(STAGE_W - minSize, newX));
        newY = Math.max(0, Math.min(STAGE_H - minSize, newY));
        newW = Math.max(minSize, Math.min(STAGE_W - newX, newW));
        newH = Math.max(minSize, Math.min(STAGE_H - newY, newH));
        return { ...s, x: newX, y: newY, w: newW, h: newH };
      }));
      return;
    }

    if (!draggingSprite || isPlaying) return;
    setSprites(prev => prev.map(s => s.id === draggingSprite ? {
      ...s,
      x: Math.max(0, Math.min(STAGE_W - s.w, x - dragOffset.x)),
      y: Math.max(0, Math.min(STAGE_H - s.h, y - dragOffset.y)),
    } : s));
  };

  const handleCanvasMouseUp = () => {
    mouseDownRef.current = false;
    playDragSpriteRef.current = null;
    setDraggingSprite(null);
    setResizingSprite(null);
    setResizeHandle(null);
    setResizeStart(null);
  };

  /* ─── Sprite management ─── */
  const addSprite = async (template, cat) => {
    const isPlatform = template.name === 'Platform';
    let w = template.defaultW || 48;
    let h = template.defaultH || 48;
    if (template.customImage) {
      const dims = await loadImageDimensions(template.customImage);
      w = dims.w;
      h = dims.h;
    }
    const newSprite = {
      id: Date.now(), name: template.name, svgKey: template.name, category: cat,
      x: STAGE_W / 2 - w / 2, y: STAGE_H / 2 - h / 2,
      w, h,
      direction: 90, rotation: 90, visible: true, color: null, layer: 1,
      blocks: [],
      customImage: template.customImage,
      physicsRole: isPlatform ? 'platform' : 'actor',
      costumes: [],
      sounds: [],
      initialVars: {},
    };
    imgCacheRef.current = {};
    setSprites(prev => [...prev, newSprite]);
    setSelected(newSprite.id);
    setShowLibrary(false);
  };

  const deleteSprite = (id) => {
    setSprites(prev => prev.filter(s => s.id !== id));
    if (selected === id) setSelected(sprites.length > 1 ? sprites.find(s => s.id !== id)?.id : null);
  };

  const duplicateSprite = (id) => {
    let createdId = null;
    setSprites((prev) => {
      const s = prev.find((x) => x.id === id);
      if (!s) return prev;
      const t = Date.now();
      createdId = t;
      const base = String(s.name || 'Sprite').replace(/\s+copy(?:\s+\d+)?$/i, '').trim() || 'Sprite';
      let n = 0;
      let newName = `${base} copy`;
      while (prev.some((x) => x.name === newName)) {
        n += 1;
        newName = `${base} copy ${n}`;
      }
      const copy = JSON.parse(JSON.stringify(s));
      copy.id = t;
      copy.name = newName;
      copy.x = Math.min(STAGE_W - (copy.w || 48), (s.x || 0) + 20);
      copy.y = Math.min(STAGE_H - (copy.h || 48), (s.y || 0) + 20);
      copy.blocks = (copy.blocks || []).map((b, idx) => ({
        ...b,
        id: t + idx + Math.random(),
        owner: newName,
      }));
      if (!copy.costumes) copy.costumes = [];
      if (!copy.sounds) copy.sounds = [];
      return [...prev, copy];
    });
    if (createdId != null) setSelected(createdId);
  };

  const handleSpriteUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result;
      const name = file.name.replace(/\.[^.]+$/, '').slice(0, 16) || 'Custom';
      const { w, h } = await loadImageDimensions(dataUrl);
      const newSprite = {
        id: Date.now(), name, svgKey: null, category: 'Custom',
        customImage: dataUrl,
        x: STAGE_W / 2 - w / 2, y: STAGE_H / 2 - h / 2,
        w, h, rotation: 0, visible: true, color: null, layer: 1,
        blocks: [],
        initialVars: {},
      };
      imgCacheRef.current = {};
      setSprites(prev => [...prev, newSprite]);
      setSelected(newSprite.id);
      setShowLibrary(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleBgUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const name = file.name.replace(/\.[^.]+$/, '').slice(0, 16) || 'Custom BG';
      setCustomBackgrounds(prev => [...prev, { name, dataUrl }]);
      setBackground(name);
      imgCacheRef.current = {};
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  /* ─── Block editing for selected sprite ─── */
  const handleBlockParamChange = useCallback((blockId, paramKey, value) => {
    setSprites(prev => prev.map(s => {
      if (s.id !== selected) return s;
      return { ...s, blocks: s.blocks.map(b => b.id === blockId ? { ...b, params: { ...b.params, [paramKey]: value } } : b) };
    }));
  }, [selected]);

  const deleteBlock = useCallback((blockId) => {
    setSprites(prev => prev.map(s => {
      if (s.id !== selected) return s;
      return { ...s, blocks: s.blocks.filter(b => b.id !== blockId) };
    }));
  }, [selected]);

  const handleBlockMouseDown = (e, block) => {
    if (e.target.tagName === 'INPUT') return;
    const rect = blockAreaRef.current.getBoundingClientRect();
    setDraggingBlock(block.id);
    setBlockDragOffset({ x: e.clientX - rect.left - block.x, y: e.clientY - rect.top - block.y });
  };

  const handleBlockMouseMove = useCallback((e) => {
    if (!draggingBlock || !blockAreaRef.current) return;
    const rect = blockAreaRef.current.getBoundingClientRect();
    const x = Math.max(0, e.clientX - rect.left - blockDragOffset.x);
    const y = Math.max(0, e.clientY - rect.top - blockDragOffset.y);
    setSprites(prev => prev.map(s => {
      if (s.id !== selected) return s;
      return { ...s, blocks: s.blocks.map(b => b.id === draggingBlock ? { ...b, x, y } : b) };
    }));
  }, [draggingBlock, blockDragOffset, selected]);

  const handleBlockMouseUp = useCallback(() => {
    if (!draggingBlock) return;
    setDraggingBlock(null);
  }, [draggingBlock, selected]);

  const handleBlockDrop = (e) => {
    e.preventDefault();
    const text = e.dataTransfer.getData('text/plain');
    if (!text || !blockAreaRef.current) return;
    const rect = blockAreaRef.current.getBoundingClientRect();
    const selectedSpriteObj = sprites.find(s => s.id === selected);
    if (!selectedSpriteObj) return;

    const newBlock = createBlockFromDrop(text, BLOCK_LANE_X, e.clientY - rect.top - 20);
    const sectionColor = getCategoryColorForBlockLabel(text);
    if (sectionColor) newBlock.color = sectionColor;

    // CRITICAL: Set owner field so block belongs to this sprite
    newBlock.owner = selectedSpriteObj.name;
    console.log(`[GameBuilder] Block dropped: type="${newBlock.type}" owner="${newBlock.owner}"`);

    setSprites(prev => prev.map(s => {
      if (s.id !== selected) return s;
      return { ...s, blocks: [...s.blocks, newBlock] };
    }));
  };

  useEffect(() => {
    const handleSidebarAdd = (event) => {
      // Blockly workspace syncs blocks via onModelChange; skip legacy canvas duplicates.
      if (blocklyWorkspaceRef.current) return;
      const directType = String(event?.detail?.type || '').trim();
      const name = String(event?.detail?.name || '').trim().toLowerCase();
      if (!selected) return;
      const selectedSpriteObj = sprites.find(s => s.id === selected);
      if (!selectedSpriteObj) {
        console.warn('[GameBuilder] handleSidebarAdd: selected sprite not found');
        return;
      }
      const type = directType || SIDEBAR_TO_TYPE[name];
      const def = type ? BLOCK_DEFS[type] : null;
      if (!def) return;
      const newBlock = {
        id: Date.now() + Math.random(),
        type,
        ...def,
        color: getCategoryColorForBlockLabel(name) || def.color,
        params: { ...(def.params || {}) },
        x: BLOCK_LANE_X,
        y: BLOCK_START_Y,
        owner: selectedSpriteObj.name, // CRITICAL: Set owner field immediately
      };
      console.log(`[GameBuilder] Sidebar block added: type="${newBlock.type}" owner="${newBlock.owner}"`);
      setSprites((prev) => prev.map((s) => (
        s.id === selected ? { ...s, blocks: normalizeSpriteBlocks([...(s.blocks || []), newBlock]) } : s
      )));
    };
    window.addEventListener(BB_ADD_SIDEBAR_BLOCK, handleSidebarAdd);
    return () => window.removeEventListener(BB_ADD_SIDEBAR_BLOCK, handleSidebarAdd);
  }, [selected, sprites]);

  /* ═══ Render ═══ */
  const submitToAssignment = async () => {
    if (!pendingAssignment) return;
    const ok = await saveSubmissionToFirestore(pendingAssignment.id, user?.email || user?.name || 'student', {
      sprites,
      background,
      studentId: user?.email || user?.name,
      studentName: user?.name,
      classId: pendingAssignment.classId,
      assignType: 'blocks',
    });
    if (ok) {
      sessionStorage.removeItem('bb-pending-assignment');
      setSubmitFlash(true);
      setTimeout(() => setSubmitFlash(false), 3000);
    } else {
      alert('Submission failed — please check your connection and try again.');
    }
  };

  return (
    <div className="workspace-page" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Assignment submit banner */}
      {pendingAssignment && (
        <div style={{ background: submitFlash ? '#16a34a' : '#4f46e5', color: '#fff', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>📋 Assignment: {pendingAssignment.title}</span>
          <button
            onClick={submitToAssignment}
            style={{ marginLeft: 'auto', background: submitFlash ? '#15803d' : '#ffffff33', border: '1px solid #ffffff55', color: '#fff', borderRadius: 6, padding: '5px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
          >
            {submitFlash ? '✅ Submitted!' : '📤 Submit Project'}
          </button>
          <button onClick={() => { sessionStorage.removeItem('bb-pending-assignment'); window.location.hash = 'classroom'; }}
            style={{ background: 'none', border: 'none', color: '#fff', opacity: 0.7, cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>✕</button>
        </div>
      )}
      {/* Teacher viewing student project banner */}
      {viewingSubmission && (
        <div style={{ background: '#0f766e', color: '#fff', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>👁️ Viewing: {viewingSubmission.studentName}'s project — {viewingSubmission.assignmentTitle}</span>
          <button onClick={() => { sessionStorage.removeItem('bb-viewing-submission'); window.location.hash = 'dashboard'; }}
            style={{ marginLeft: 'auto', background: '#ffffff33', border: '1px solid #ffffff55', color: '#fff', borderRadius: 6, padding: '5px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            ← Back to Dashboard
          </button>
        </div>
      )}
      {/* Toolbar */}
      <div className="workspace-toolbar" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
        <span style={{ fontWeight: 700, fontSize: 14 }}>🎮 Game Builder</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
          {isPlaying && <span className="tag tag-warning" style={{ fontSize: 12 }}>Score: {score}</span>}
          <button
            onClick={() => setExtensionsOpen(true)}
            style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            title="Add Extensions"
          >
            🧩 Extensions
          </button>
          <button
            onClick={saveProject}
            style={{ background: savedFlash ? '#22c55e' : '#334155', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'background 0.3s', minWidth: 80 }}
          >
            {savedFlash ? '✓ Saved!' : '💾 Save'}
          </button>
          <button onClick={exportGame} disabled={exporting} style={{ background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', minWidth: 90, opacity: exporting ? 0.7 : 1 }}>
            📤 Export
          </button>
          <button
            className={`btn btn-sm ${isPlaying ? 'btn-danger' : 'btn-success'}`}
            onClick={togglePlay}
          >
            {isPlaying ? '⏹ Stop' : '▶ Play'}
          </button>
        </div>
      </div>

      {/* Main content: Block workspace + Stage/Sprites */}
      <div className="panel-container" style={{ flex: 1, display: 'flex', minHeight: 0 }}>

        {/* ════════ Block Coding Area ════════ */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, borderRight: '1px solid var(--border-color)' }}>
          {/* Sprite name tab bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px',
            background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)',
            fontSize: 12, fontWeight: 600,
          }}>
            <span style={{ color: 'var(--text-muted)', marginRight: 4 }}>Coding for:</span>
            {selectedSprite ? (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                background: 'var(--accent-primary)22', padding: '3px 10px', borderRadius: 6,
                border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)',
              }}>
                <div style={{
                  width: 18, height: 18,
                  background: 'var(--accent-primary)',
                  borderRadius: 2,
                }} />
                {selectedSprite.name}
              </span>
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>Select a sprite</span>
            )}
            <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-muted)' }}>
              Drag blocks from sidebar
            </span>
          </div>

          <div className="bb-workspace-scratch-toolbox" style={{ flex: 1, minHeight: 0 }}>
            <UnifiedBlocklyWorkspace
              ref={blocklyWorkspaceRef}
              libraryPage="gamebuilder"
              extensionsKey={[...enabledExtensions].sort().join(',')}
              selectedSpriteId={selected}
              selectedSpriteName={selectedSprite?.name}
              selectedSpriteBlocks={selectedSpriteBlocks}
              selectedSpriteXml={selectedSpriteXml}
              onModelChange={(nodes, xmlText = '') => {
                if (!selected) return;
                const selectedSpriteObj = sprites.find(s => s.id === selected);
                if (!selectedSpriteObj) {
                  console.warn('[GameBuilder] Selected sprite not found when saving blocks, id:', selected);
                  return;
                }

                const nextBlocks = blocklyNodesToGameBlocks(nodes);

                // CRITICAL: Ensure ALL blocks have owner set to current sprite
                // This prevents blocks from executing on wrong sprites
                const blocksWithOwner = nextBlocks.map(b => {
                  const blockWithOwner = {
                    ...b,
                    owner: selectedSpriteObj.name
                  };

                  // Defensive check: warn if block type is invalid
                  if (!b.type) {
                    console.warn('[GameBuilder] Block has no type field:', b);
                  }

                  return blockWithOwner;
                });

                // Debug: Log block ownership for verification
                if (blocksWithOwner.length > 0) {
                  console.log(`[GameBuilder] Saving ${blocksWithOwner.length} blocks for sprite "${selectedSpriteObj.name}" (id: ${selected})`);
                  blocksWithOwner.forEach((b, i) => {
                    if (i < 3) { // Log first 3 blocks only
                      console.log(`  Block ${i}: type="${b.type}" owner="${b.owner}"`);
                    }
                  });
                }

                // Update ONLY the selected sprite's blocks
                setSprites((prev) => {
                  const updated = prev.map((s) => (
                    s.id === selected
                      ? { ...s, blocks: blocksWithOwner, blocklyXml: xmlText || s.blocklyXml || '' }
                      : s
                  ));

                  // Verify update
                  const updatedSprite = updated.find(s => s.id === selected);
                  console.log(`[GameBuilder] Sprite "${selectedSpriteObj.name}" now has ${updatedSprite?.blocks?.length || 0} blocks`);

                  return updated;
                });

                syncLivePlayFromBlockly(selected, blocksWithOwner, xmlText);
              }}
              style={{ height: '100%' }}
            />
          </div>
        </div>

        {/* ════════ RIGHT: Stage + Sprite Pane ════════ */}
        <div style={{ width: 380, display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary)', flexShrink: 0 }}>

          {/* Stage */}
          <div ref={stageFsRef} data-bb-game-stage style={{
            padding: stageFs ? 0 : 8,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
            background: '#ffffff',
            ...(stageFs ? { width: '100vw', height: '100vh' } : {}),
          }}>
            {/* Fullscreen toggle */}
            <button
              onClick={toggleStageFs}
              title={stageFs ? 'Exit fullscreen (Esc)' : 'Fullscreen'}
              style={{
                position: 'absolute', top: stageFs ? 16 : 8, right: stageFs ? 16 : 8, zIndex: 20,
                background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.25)',
                color: '#fff', borderRadius: 8, padding: '5px 10px', cursor: 'pointer',
                fontSize: 15, lineHeight: 1, backdropFilter: 'blur(4px)',
              }}
            >{stageFs ? '✕ Exit' : '⛶'}</button>

            {/* Fullscreen play/stop controls */}
            {stageFs && (
              <div style={{
                position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)',
                zIndex: 20, display: 'flex', gap: 12, alignItems: 'center',
                background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
                borderRadius: 40, padding: '8px 20px',
                border: '1px solid rgba(255,255,255,0.15)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
              }}>
                {/* Play / Stop */}
                <button
                  onClick={togglePlay}
                  title={isPlaying ? 'Stop' : 'Play'}
                  style={{
                    width: 52, height: 52, borderRadius: '50%', border: 'none',
                    background: isPlaying
                      ? 'linear-gradient(135deg,#ef4444,#b91c1c)'
                      : 'linear-gradient(135deg,#22c55e,#16a34a)',
                    color: '#fff', fontSize: 22, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: isPlaying
                      ? '0 0 20px rgba(239,68,68,0.5)'
                      : '0 0 20px rgba(34,197,94,0.5)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {isPlaying ? '⏹' : '▶'}
                </button>
                {/* Reset */}
                <button
                  onClick={() => { setIsPlaying(false); setScore(0); setSprites(prev => prev.map(s => ({ ...s, x: s._startX ?? s.x, y: s._startY ?? s.y }))); }}
                  title="Reset"
                  style={{
                    width: 40, height: 40, borderRadius: '50%', border: 'none',
                    background: 'rgba(255,255,255,0.12)', color: '#fff',
                    fontSize: 18, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s ease',
                  }}
                >↺</button>
                {/* Score display */}
                {isPlaying && (
                  <span style={{ color: '#fff', fontWeight: 700, fontSize: 15, minWidth: 70, textAlign: 'center' }}>
                    Score: {score}
                  </span>
                )}
              </div>
            )}
            <canvas
              ref={canvasRef}
              width={STAGE_W}
              height={STAGE_H}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              style={{
                borderRadius: stageFs ? 0 : 8,
                border: stageFs ? 'none' : '1px solid #e5e7eb',
                backgroundColor: '#ffffff',
                cursor: draggingSprite || playDragSpriteRef.current ? 'grabbing' : 'default',
                width: stageFs ? '100%' : '100%',
                height: stageFs ? '100%' : 'auto',
                maxWidth: stageFs ? '100%' : 360,
                display: 'block',
                boxShadow: stageFs ? 'none' : '0 1px 4px rgba(0,0,0,0.08)',
              }}
            />
            {askDialog && isPlaying && (
              <AskPromptBar question={askDialog.question} onSubmit={submitAskAnswer} />
            )}
            {isPlaying && <ListMonitorsOverlay monitors={listMonitors} />}
          </div>

          {/* ─── Sprite Pane (like Scratch's bottom-right) ─── */}
          <div style={{
            flex: 1, borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column',
            minHeight: 0,
          }}>
            {/* Pane header */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px',
              borderBottom: '1px solid var(--border-color)',
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Sprites
              </span>
              {selected && (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '3px 8px', fontSize: 11 }}
                  title="Duplicate selected sprite"
                  onClick={() => duplicateSprite(selected)}
                >
                  ⎘ Duplicate
                </button>
              )}
              <button
                className="btn btn-primary btn-sm"
                style={{ marginLeft: 'auto', padding: '3px 8px', fontSize: 11 }}
                onClick={() => {
                  const nextId = Math.max(...sprites.map((s) => Number(s.id) || 0), 0) + 1;
                  const newSprite = {
                    id: nextId,
                    name: `Sprite ${nextId}`,
                    svgKey: 'Cat',
                    category: 'People',
                    x: 200,
                    y: 200,
                    w: 48,
                    h: 48,
                    rotation: 0,
                    visible: true,
                    color: null,
                    layer: 1,
                    blocks: [],
                    physicsRole: 'actor',
                    costumes: [],
                    sounds: [],
                    initialVars: {},
                  };
                  setSprites((prev) => [...prev, newSprite]);
                  setSelected(newSprite.id);
                }}
              >
                ➕ New sprite
              </button>
              <button
                className="btn btn-primary btn-sm"
                style={{ padding: '3px 8px', fontSize: 11 }}
                onClick={() => setShowLibrary(true)}
              >
                Library
              </button>
              <button
                className="btn btn-secondary btn-sm"
                style={{ padding: '3px 8px', fontSize: 11 }}
                onClick={() => setShowBgPicker(!showBgPicker)}
              >
                🖼 Backdrop
              </button>
            </div>

            {/* Backdrop picker */}
            {showBgPicker && (
              <div style={{
                display: 'flex', gap: 4, padding: '6px 8px', flexWrap: 'wrap',
                borderBottom: '1px solid var(--border-color)', background: 'var(--bg-primary)',
              }}>
                {BACKGROUNDS.map(bg => (
                  <button key={bg.name} onClick={() => pickBackdrop(bg.name)}
                    style={{
                      padding: '3px 8px', borderRadius: 4, border: background === bg.name ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                      background: background === bg.name ? 'var(--accent-primary)22' : 'var(--bg-input)',
                      color: 'var(--text-primary)', fontSize: 10, fontWeight: 600, cursor: 'pointer',
                    }}
                  >{bg.name}</button>
                ))}
                {customBackgrounds.map(bg => (
                  <button key={bg.name} onClick={() => pickBackdrop(bg.name)}
                    style={{
                      padding: '3px 8px', borderRadius: 4, border: background === bg.name ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                      background: background === bg.name ? 'var(--accent-primary)22' : 'var(--bg-input)',
                      color: 'var(--text-primary)', fontSize: 10, fontWeight: 600, cursor: 'pointer',
                    }}
                  >📷 {bg.name}</button>
                ))}
                <button onClick={() => bgUploadRef.current?.click()}
                  style={{
                    padding: '3px 8px', borderRadius: 4, border: '1px dashed var(--accent-primary)',
                    background: 'transparent', color: 'var(--accent-primary)', fontSize: 10, fontWeight: 600, cursor: 'pointer',
                  }}
                >⬆ Upload</button>
                <input ref={bgUploadRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBgUpload} />
              </div>
            )}

            {/* Sprite thumbnails */}
            <div style={{ flex: 1, overflow: 'auto', padding: 6, display: 'flex', flexWrap: 'wrap', gap: 6, alignContent: 'flex-start' }}>
              {sprites.map(s => (
                <div
                  key={s.id}
                  onClick={() => setSelected(s.id)}
                  style={{
                    width: 62, height: 72, borderRadius: 8, cursor: 'pointer',
                    background: selected === s.id ? 'var(--accent-primary)15' : 'var(--bg-primary)',
                    border: selected === s.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 2, position: 'relative', transition: 'all 0.15s',
                  }}
                >
                  <SpriteThumb svgKey={s.svgKey} color={s.color} customImage={s.customImage} size={28} />
                  <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-primary)', maxWidth: 64, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>
                    {s.name}
                  </span>
                  <span style={{ fontSize: 8, color: 'var(--text-muted)' }}>
                    ({Math.round(s.x)}, {Math.round(s.y)})
                  </span>
                  {/* Delete */}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteSprite(s.id); }}
                    style={{
                      position: 'absolute', top: 2, right: 2,
                      width: 16, height: 16, borderRadius: '50%', border: 'none',
                      background: 'transparent', color: 'var(--text-muted)', fontSize: 11,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      lineHeight: 1,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                  >×</button>
                </div>
              ))}
            </div>

            {/* Selected sprite properties (compact) */}
            {selectedSprite && (
              <div style={{
                padding: '6px 10px', borderTop: '1px solid var(--border-color)',
                display: 'flex', gap: 8, alignItems: 'center', fontSize: 11, flexShrink: 0,
                background: 'var(--bg-primary)',
              }}>
                <SpriteThumb svgKey={selectedSprite.svgKey} color={selectedSprite.color} customImage={selectedSprite.customImage} size={22} />
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedSprite.name}</span>
                <label style={{ color: 'var(--text-muted)' }}>x</label>
                <input className="input" type="number" value={Math.round(selectedSprite.x)}
                  onChange={(e) => setSprites(prev => prev.map(s => s.id === selected ? { ...s, x: +e.target.value } : s))}
                  style={{ width: 50, fontSize: 11, padding: '2px 4px' }} />
                <label style={{ color: 'var(--text-muted)' }}>y</label>
                <input className="input" type="number" value={Math.round(selectedSprite.y)}
                  onChange={(e) => setSprites(prev => prev.map(s => s.id === selected ? { ...s, y: +e.target.value } : s))}
                  style={{ width: 50, fontSize: 11, padding: '2px 4px' }} />
                <label style={{ color: 'var(--text-muted)' }}>size</label>
                <input className="input" type="number" value={selectedSprite.w}
                  onChange={(e) => { const v = Math.max(8, +e.target.value); setSprites(prev => prev.map(s => s.id === selected ? { ...s, w: v, h: v } : s)); imgCacheRef.current = {}; }}
                  style={{ width: 40, fontSize: 11, padding: '2px 4px' }} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Sprite Library Modal ─── */}
      {showLibrary && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowLibrary(false); }}>
          <div className="sprite-library-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sprite-library-header">
              <span style={{ fontWeight: 700, fontSize: 15 }}>🎭 Choose a Sprite</span>
              <button onClick={() => setShowLibrary(false)} style={{
                width: 26, height: 26, borderRadius: '50%', border: 'none', background: 'var(--bg-primary)',
                color: 'var(--text-primary)', fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>×</button>
            </div>
            <div className="sprite-library-categories-wrap">
              <button
                type="button"
                className="sprite-library-scroll-btn"
                aria-label="Scroll categories left"
                onClick={() => scrollSpriteCategories(-1)}
              >
                ‹
              </button>
              <div
                ref={spriteCatScrollRef}
                className="sprite-library-categories"
                onWheel={onSpriteCategoryWheel}
              >
                {SPRITE_LIBRARY.map((cat) => (
                  <button
                    key={cat.category}
                    type="button"
                    onClick={() => setLibCategory(cat.category)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 16,
                      border: 'none',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: libCategory === cat.category ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                      color: libCategory === cat.category ? '#fff' : 'var(--text-primary)',
                    }}
                  >
                    {cat.category}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="sprite-library-scroll-btn"
                aria-label="Scroll categories right"
                onClick={() => scrollSpriteCategories(1)}
              >
                ›
              </button>
            </div>
            <div className="sprite-library-grid">
              {SPRITE_LIBRARY.find(c => c.category === libCategory)?.items.map(item => (
                <button key={item.name} onClick={() => addSprite(item, libCategory)}
                  style={{
                    padding: 10, borderRadius: 10, border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    transition: 'all 0.15s', overflow: 'visible',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.transform = 'scale(1.05)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'scale(1)'; }}
                >
                  <SpriteThumb svgKey={item.name} customImage={item.customImage} size={38} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</span>
                </button>
              ))}
            </div>
            <div className="sprite-library-footer">
              <button type="button" onClick={() => spriteUploadRef.current?.click()}
                className="btn btn-secondary"
                style={{ padding: '8px 16px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
              >⬆ Upload Your Own Sprite</button>
              <input ref={spriteUploadRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleSpriteUpload} />
            </div>
          </div>
        </div>
      )}
      
      {/* Extensions Modal */}
      <ExtensionsModal
        open={extensionsOpen}
        onClose={() => setExtensionsOpen(false)}
        enabledIds={enabledExtensions}
        onToggleExtension={toggleExtension}
      />
    </div>
  );
}
