/**
 * LiveLabGameUI.jsx — ByteBuddies Custom Block Palette + Game UI
 */
import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { ACTION_BLOCKS, getMissionAction } from '../data/mission-actions.js';
import PrimaryArenaThumbnail from './PrimaryArenaThumbnail.jsx';
import CraftArenaThumbnail from './craft/CraftArenaThumbnail.jsx';
import ArenaPreviewImage from './ArenaPreviewImage.jsx';
import { cancelArenaPreviews } from './arena-preview.js';
import JumpBotLevelPreview from '../arcade/JumpBotLevelPreview.jsx';
import { RacingHUD } from '../racing/RacingHUD.jsx';
import { CodeRacerHUD } from '../racing/CodeRacerHUD.jsx';
import { isCodeRacerArena } from '../racing/CodeRacerWorldKit.js';
import { MissionCampaignHUD } from './MissionCampaignHUD.jsx';
import { GameProgress } from '../services/game-progress.js';
import { RobotMissionProgress } from '../services/robot-mission-progress.js';
import { FLAGSHIP_WORLD_SECTIONS } from '../data/flagship-courses.js';
import { MISSION_GENRE_SECTIONS } from '../data/game-missions.js';
import { CAMPAIGN_WORLD_SECTIONS, getCampaignZoneWorlds } from '../data/robot-mission-campaign.js';
import { pickFeaturedCourses, resolveCourseObjectives, deriveMissionProgress, isSubObjectiveMet, getCourseZoneCount } from '../data/course-game-logic.js';
import { resolveCourseCodeHints, isCupManualTrack, BLOCK_CODE_EXPLAIN } from '../data/course-code-hints.js';
import { isEventHatBlock } from '../data/flappy-starter-script.js';
import { FLAPPY_BLOCK_LIBRARY, isFlappyBirdCourse } from '../data/flappy-bird-blocks.js';
import { CRAFT_BLOCK_LIBRARY, isCraftCourse } from '../data/craft-blocks.js';
import { FIGHTING_BLOCK_LIBRARY, isFightingCourse, FIGHTING_STARTER_SCRIPT } from '../data/fighting-blocks.js';
import { FOOTBALL_BLOCK_LIBRARY, isFootballCourse, FOOTBALL_STARTER_SCRIPT, FOOTBALL_ROLE_STARTERS, FOOTBALL_TEAM_ROLES } from '../data/football-blocks.js';
import { buildRaceBlockLibrary, isRaceCourse } from '../data/racing-blocks.js';
import { isCarChassis, CAR_KID_TRACK_TILES } from '../data/car-racing-tracks.js';
import { CarRobotTrackGrid } from '../racing/CarRobotTrackGrid.jsx';
import { COSMIC_SKYWAY_UI_TRACKS } from '../racing/mk-tracks/CosmicSkywayRegistry.js';
import { getSecurityBotArena } from '../data/securitybot-arenas.js';
import { getPrimaryRobotDisplay, getPrimaryStudioArena, getStudioRobotGroup, getRobotLearningFrame, kidSafeText } from '../data/primary-robot-studio.js';
import { UNIVERSAL_EVENTS_CATEGORY, withUniversalEvents } from '../data/universal-event-blocks.js';
import SavedCodeMenu, { readAutosave, writeAutosave } from './SavedCodeMenu.jsx';
import './LiveLabGame.css';
import PythonCodePane from './PythonCodePane.jsx';
import CodingObjectiveCard from './CodingObjectiveCard.jsx';
import { buildWorldBlockLibrary } from '../data/fight-worlds.js';
import { getCodingObjective } from './codingObjective.js';
import { blocksToPython, withScriptBlocks } from './robotPython.js';
import { Icon, EmojiIcon, IconText } from '../../components/ui/Icon.jsx';

/** Pick block library — course-scoped palettes; Events always universal */
/** Pick block library — course-scoped palettes; Events always universal */
export function getBlockLibraryForCourse(courseKey, arenaType, chassisId = '', fightWorld = '') {
  // Flappy has its own Events tab: only events that can happen in this game
  if (isFlappyBirdCourse(courseKey, arenaType)) return FLAPPY_BLOCK_LIBRARY;
  // Block Crafter: Minecraft-style mining, building and crafting blocks
  if (isCraftCourse(courseKey, arenaType, chassisId)) return CRAFT_BLOCK_LIBRARY;
  if (isFootballCourse(courseKey, arenaType)) return withUniversalEvents(FOOTBALL_BLOCK_LIBRARY);
  if (isFightingCourse(courseKey, arenaType) && arenaType === 'robot_fight') {
    // Fighting worlds (castle, dojo, ship…) swap the punches for their own moves
    const lib = withUniversalEvents(FIGHTING_BLOCK_LIBRARY);
    return fightWorld ? buildWorldBlockLibrary(lib, fightWorld) : lib;
  }
  if (isRaceCourse(courseKey, arenaType) && arenaType !== 'sandbox') return buildRaceBlockLibrary(BLOCK_LIBRARY, arenaType);
  return withUniversalEvents(BLOCK_LIBRARY);
}

export { FIGHTING_STARTER_SCRIPT, FOOTBALL_STARTER_SCRIPT };

/* ─── ROBOT GROUP DETECTION ──────────────────────────────────────────────── */
export function getRobotGroup(robotType) {
  if (!robotType) return 'wheeled';
  const mapped = getStudioRobotGroup(robotType);
  if (mapped && mapped !== 'wheeled') return mapped;
  if (['drone', 'jet', 'hover', 'racedrone', 'jetplane', 'helicopter', 'hoverbot', 'hoverracer', 'rescuedrone', 'steathjet', 'aerobat'].includes(robotType)) return 'aerial';
  if (['spider', 'humanoid', 'droid', 'mech', 'battlebot', 'striker', 'blaster', 'ninja', 'berserker'].includes(robotType)) return 'walker';
  if (['underwater', 'submarine', 'deepseabot'].includes(robotType)) return 'underwater';
  if (['factory', 'factorybot', 'robotarm', 'arm'].includes(robotType)) return 'arm';
  if (robotType === 'birdbot') return 'birdbot';
  if (['footballbot', 'football'].includes(robotType)) return 'footballbot';
  return 'wheeled';
}

function sortBlocksForGroup(blocks, group) {
  const preferred = {
    aerial: ['fly_forward', 'fly_up', 'fly_down', 'hover_hold', 'bank_left', 'bank_right', 'roll', 'dive'],
    walker: ['step_forward', 'turn_left', 'turn_right', 'climb', 'crouch', 'jump', 'balance', 'pose', 'recover'],
    underwater: ['swim_forward', 'dive_deep', 'surface', 'sonar_ping', 'turn_left', 'turn_right'],
    arm: ['rotate_joint', 'grip', 'release', 'move_to_marker', 'turn_left', 'turn_right'],
    footballbot: ['chase_ball', 'short_pass', 'shoot', 'dribble', 'guard_goal'],
    birdbot: ['flap', 'float_up', 'dive', 'hover_hold'],
    wheeled: ['move_forward', 'turn_left', 'turn_right', 'set_speed', 'follow_track_on'],
  }[group] || ['move_forward', 'turn_left', 'turn_right'];
  return [...blocks].sort((a, b) => {
    const ai = preferred.indexOf(a.id);
    const bi = preferred.indexOf(b.id);
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

/* ─── BLOCK LIBRARY ──────────────────────────────────────────────────────── */
export const BLOCK_LIBRARY = {
  Events: UNIVERSAL_EVENTS_CATEGORY,
  Movement: {
    label: 'Movement', color: '#3b82f6', icon: '🚀',
    blocks: [
      { id:'move_forward',  label:'Move forward',   icon:'⬆️', params:[{key:'steps',label:'steps',def:3}], robotGroups:['wheeled','aerial','walker','underwater','arm'] },
      { id:'move_backward', label:'Move backward',  icon:'⬇️', params:[{key:'steps',label:'steps',def:3}], robotGroups:['wheeled','aerial','walker','underwater','arm'] },
      { id:'turn_left',     label:'Turn left',      icon:'↺',  params:[{key:'degrees',label:'°',def:90}], robotGroups:['wheeled','aerial','walker','underwater','arm'] },
      { id:'turn_right',    label:'Turn right',     icon:'↻',  params:[{key:'degrees',label:'°',def:90}], robotGroups:['wheeled','aerial','walker','underwater','arm'] },
      { id:'set_speed',     label:'Set speed',      icon:'⚡', params:[{key:'speed',label:'%',def:50}] },
      { id:'boost',         label:'Boost for',      icon:'🚀', params:[{key:'seconds',label:'s',def:2}] },
      { id:'stop',          label:'Stop',           icon:'⏹️' },
      { id:'spin',          label:'Spin around',    icon:'🌀', params:[{key:'degrees',label:'°',def:360}], robotGroups:['wheeled','aerial','walker'] },
      { id:'orbit',         label:'Orbit target',   icon:'🔄', params:[{key:'times',label:'×',def:3}], robotGroups:['wheeled','aerial'] },
      { id:'follow_track_on',  label:'Follow track automatically', icon:'🎯', robotGroups:['wheeled'] },
      { id:'follow_track_off', label:'Stop following track',       icon:'⏹️', robotGroups:['wheeled'] },
      // ── CORNER & CURVE (wheeled) ──
      { id:'turn_corner_left',  label:'Turn corner left',  icon:'↰', robotGroups:['wheeled'] },
      { id:'turn_corner_right', label:'Turn corner right', icon:'↱', robotGroups:['wheeled'] },
      { id:'curve_left',  label:'Curve left',  icon:'〰', params:[{key:'degrees',label:'°',def:45},{key:'steps',label:'steps',def:3}], robotGroups:['wheeled'] },
      { id:'curve_right', label:'Curve right', icon:'〰', params:[{key:'degrees',label:'°',def:45},{key:'steps',label:'steps',def:3}], robotGroups:['wheeled'] },
      // ── PATTERNS (wheeled) ──
      { id:'zigzag', label:'Zigzag', icon:'〽', params:[{key:'times',label:'×',def:4},{key:'width',label:'steps',def:2}], robotGroups:['wheeled'] },
      { id:'circle', label:'Circle', icon:'⭕', params:[{key:'radius',label:'steps',def:3},{key:'direction',type:'dropdown',label:'',def:'left',options:[['left','left'],['right','right']]}], robotGroups:['wheeled'] },
      { id:'u_turn', label:'U-turn', icon:'↩', robotGroups:['wheeled'] },
      // ── CONDITIONAL (wheeled) ──
      { id:'move_forward_continuous', label:'Move forward continuously', icon:'▶', robotGroups:['wheeled'] },
      { id:'move_forward_until', label:'Move forward until', icon:'⏭', params:[{key:'condition',type:'dropdown',label:'',def:'wall',options:[['wall detected','wall'],['item nearby','item'],['goal reached','goal'],['collision','collision'],['checkpoint reached','checkpoint'],['battery below 25%','battery']]}], robotGroups:['wheeled'] },
      { id:'turn_until_facing', label:'Turn until facing', icon:'🔄', params:[{key:'direction',type:'dropdown',label:'',def:'goal',options:[['toward goal','goal'],['toward nearest item','item'],['north','north'],['south','south'],['east','east'],['west','west'],['away from goal','away']]}], robotGroups:['wheeled'] },
      // ── PRECISION (wheeled) ──
      { id:'brake', label:'Brake', icon:'🛑', robotGroups:['wheeled'] },
      { id:'rotate_to_heading', label:'Rotate to heading', icon:'📐', params:[{key:'degrees',label:'°',def:0}], robotGroups:['wheeled'] },
      { id:'move_forward_units', label:'Move forward units', icon:'📏', params:[{key:'units',label:'units',def:6,precision:0.1}], robotGroups:['wheeled'] },
      // AERIAL ONLY
      { id:'fly_forward', label:'Fly forward', icon:'↑', params:[{key:'steps',label:'m',def:3}], robotGroups:['aerial'] },
      { id:'fly_up',    label:'Fly up',     icon:'🛫', params:[{key:'height',label:'m',def:5}],  robotGroups:['aerial'] },
      { id:'fly_down',  label:'Fly down',   icon:'🛬', params:[{key:'height',label:'m',def:5}],  robotGroups:['aerial'] },
      { id:'hover_hold',label:'Hover for',  icon:'🛸', params:[{key:'seconds',label:'s',def:3}], robotGroups:['aerial'] },
      { id:'bank_left', label:'Bank left',  icon:'↰',  params:[{key:'degrees',label:'°',def:30}],robotGroups:['aerial'] },
      { id:'bank_right',label:'Bank right', icon:'↱',  params:[{key:'degrees',label:'°',def:30}],robotGroups:['aerial'] },
      { id:'dive',      label:'Dive',       icon:'📉', params:[{key:'degrees',label:'°',def:45}], robotGroups:['aerial'] },
      { id:'roll',      label:'Roll',       icon:'🔃', params:[{key:'degrees',label:'°',def:360}],robotGroups:['aerial'] },
      // WALKER ONLY
      { id:'step_forward',label:'Step forward',icon:'👣',params:[{key:'steps',label:'paces',def:5}],robotGroups:['walker'] },
      { id:'climb',    label:'Climb obstacle',icon:'🧗',  robotGroups:['walker'] },
      { id:'crouch',   label:'Crouch down',  icon:'🦆',  robotGroups:['walker'] },
      { id:'jump',     label:'Jump',         icon:'🦘',  params:[{key:'height',label:'m',def:1}],robotGroups:['walker'] },
      { id:'balance',  label:'Balance',      icon:'🧘',  robotGroups:['walker'] },
      { id:'pose',     label:'Hold a pose',  icon:'🕺',  robotGroups:['walker'] },
      { id:'recover',  label:'Recover',      icon:'💫',  robotGroups:['walker'] },
      // UNDERWATER ONLY
      { id:'swim_forward', label:'Swim forward', icon:'↑', params:[{key:'steps',label:'m',def:3}], robotGroups:['underwater'] },
      { id:'dive_deep',label:'Dive to depth',icon:'🤿',params:[{key:'depth',label:'m',def:10}],robotGroups:['underwater'] },
      { id:'surface',  label:'Surface to top',icon:'⬆️', robotGroups:['underwater'] },
      { id:'sonar_ping',label:'Sonar ping',  icon:'📡', robotGroups:['underwater'] },
      // ARM ONLY
      { id:'rotate_joint', label:'Rotate joint', icon:'🔄', params:[{key:'degrees',label:'°',def:45}], robotGroups:['arm'] },
      { id:'grip', label:'Grip', icon:'✊', robotGroups:['arm'] },
      { id:'release', label:'Release', icon:'🖐️', robotGroups:['arm'] },
      { id:'move_to_marker', label:'Move to marker', icon:'🎯', robotGroups:['arm'] },
      // BIRDBOT ONLY
      { id:'flap',      label:'Flap!',       icon:'🐦', robotGroups:['birdbot'] },
      { id:'float_up',  label:'Float up',    icon:'⬆️', robotGroups:['birdbot'] },
      { id:'dive',      label:'Dive down',   icon:'📉', robotGroups:['birdbot'] },
      { id:'hover_hold',label:'Glide (hold)',icon:'🛸', params:[{key:'seconds',label:'s',def:1}], robotGroups:['birdbot'] },
      { id:'bank_left', label:'Tilt left',   icon:'↰',  params:[{key:'degrees',label:'°',def:20}], robotGroups:['birdbot'] },
      { id:'bank_right',label:'Tilt right',  icon:'↱',  params:[{key:'degrees',label:'°',def:20}], robotGroups:['birdbot'] },
    ]
  },
  Loops: {
    label: 'Loops', color: '#f59e0b', icon: '🔁',
    blocks: [
      { id:'repeat',     label:'Repeat',          icon:'🔁', params:[{key:'times',label:'×',def:5}] },
      { id:'forever',    label:'Forever loop',    icon:'∞' },
      { id:'wait',       label:'Wait',             icon:'⏸️', params:[{key:'seconds',label:'s',def:1}] },
      { id:'wait_until', label:'Wait until done',  icon:'⌛' },
    ]
  },
  Sensors: {
    label: 'Sensors', color: '#10b981', icon: '👁',
    blocks: [
      { id:'obstacle_ahead', label:'If obstacle ahead',    icon:'🚧', robotGroups:['wheeled','aerial','walker','birdbot','arm'] },
      { id:'line_below',     label:'If on track line',     icon:'〰️' },
      { id:'if_color',       label:'If color detected',    icon:'🎨' },
      { id:'if_distance',    label:'If distance <',        icon:'📏', params:[{key:'cm',label:'cm',def:30}] },
      { id:'scan',           label:'Scan area 360°',       icon:'📡' },
      { id:'detect_item',    label:'Detect nearby item',   icon:'🔍' },
      { id:'battery_low',    label:'If battery low',       icon:'🔋' },
      { id:'see_object',     label:'See object ahead',     icon:'👁' },
      // AERIAL
      { id:'read_altitude',  label:'Read altitude',        icon:'📊', robotGroups:['aerial'] },
      { id:'wind_speed',     label:'If wind speed high',   icon:'💨', robotGroups:['aerial'] },
      // UNDERWATER
      { id:'depth_sensor',   label:'Read depth sensor',    icon:'🌊', robotGroups:['underwater'] },
      { id:'pressure',       label:'If pressure high',     icon:'⚖️', robotGroups:['underwater'] },
    ]
  },
  Logic: {
    label: 'Logic', color: '#8b5cf6', icon: '🧠',
    blocks: [
      { id:'if_then',       label:'If condition then',  icon:'❓' },
      { id:'if_else',       label:'If / else',          icon:'↔️' },
    ]
  },
  Variables: {
    label: 'Variables', color: '#06b6d4', icon: '📦',
    blocks: [
      { id:'set_var',    label:'Set score to',    icon:'=', params:[{key:'value',label:'',def:0}] },
      { id:'change_var', label:'Change score by', icon:'+', params:[{key:'value',label:'',def:1}] },
    ]
  },
  Functions: {
    label: 'Functions', color: '#f97316', icon: '⚙️',
    blocks: [
      { id:'define_func', label:'Define myFunction', icon:'📝' },
      { id:'call_func',   label:'Call myFunction',   icon:'▶️' },
    ]
  },
  Actions: {
    label: 'Actions', color: '#ec4899', icon: '🧰',
    blocks: ACTION_BLOCKS,
  },
  Lights: {
    label: 'Lights', color: '#eab308', icon: '💡',
    blocks: [
      { id:'led_on',    label:'Set LED to blue',  icon:'💙' },
      { id:'led_off',   label:'Turn LED off',     icon:'⚫' },
      { id:'led_blink', label:'Blink LED',        icon:'✨', params:[{key:'times',label:'×',def:3}] },
    ]
  },
  Sound: {
    label: 'Sound', color: '#a78bfa', icon: '🔊',
    blocks: [
      { id:'play_sound',  label:'Play beep',  icon:'🔔' },
      { id:'alarm_sound', label:'Play alarm', icon:'🚨' },
    ]
  },
};

/* ─── UID helper ─────────────────────────────────────────────────────────── */
let _uidCounter = 0;
const uid = () => `b${++_uidCounter}_${Date.now()}`;

/* ════════════════════════════════════════════════════════════════════════════
   SCRATCH-STYLE CODING WORKSPACE
   ════════════════════════════════════════════════════════════════════════════ */
/**
 * Starter / hint / saved blocks often carry only id + values. Give them the
 * palette definition's settings (dropdowns, numbers) so the pupil can see and
 * change them — e.g. the condition inside an "If" block.
 */
function withBlockDefs(blocks, library) {
  if (!library) return blocks;
  const cats = Object.entries(library).filter(([, c]) => c?.blocks);
  return blocks.map((b) => {
    if (b.params?.length) return b;
    const own = b.catKey && library[b.catKey]?.blocks?.find((d) => d.id === b.id);
    const def = own || cats.map(([, c]) => c.blocks.find((d) => d.id === b.id)).find(Boolean);
    if (!def?.params?.length) return b;
    const catKey = b.catKey || cats.find(([, c]) => c.blocks.includes(def))?.[0];
    return { ...b, params: def.params, icon: b.icon || def.icon, ...(catKey ? { catKey } : {}) };
  });
}

/** True when a saved program is just the starter blocks pupils used to be given, unchanged. */
function isUntouchedStarter(saved, starterScript) {
  const sig = (list) => JSON.stringify((list || []).filter((b) => b?.id && b.id !== 'when_start').map((b) => [b.id, b.paramValues || {}]));
  return !!starterScript?.length && sig(saved) === sig(starterScript);
}

const FB_TEAM_SCRIPT_LS = 'bb-football-team-scripts-v2';

function readStoredFootballScripts() {
  try {
    const raw = JSON.parse(localStorage.getItem(FB_TEAM_SCRIPT_LS) || 'null');
    if (!raw || typeof raw !== 'object') return null;
    return raw;
  } catch {
    return null;
  }
}

function writeStoredFootballScripts(scripts) {
  try {
    localStorage.setItem(FB_TEAM_SCRIPT_LS, JSON.stringify(scripts));
  } catch { /* ignore */ }
}

function isFootballTeamMatch(teamSize, matchMode) {
  return (Number(teamSize) || 0) >= 3 || matchMode === 'fifa3v3' || matchMode === 'team3v3';
}

/** Collapsible hints — easy → pro → expert tiers (read-only, students add blocks from palette) */
export function CourseCodeHintsPanel({ hints, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const [proOpen, setProOpen] = useState(false);
  const [expertOpen, setExpertOpen] = useState(false);
  if (!hints) return null;

  const renderSteps = (steps, showNumbers = false) => (
    <ol className="course-code-hints-steps">
      <li className="step-event">
        {showNumbers && <span className="step-num">1</span>}
        <span className="step-label">{hints.eventLabel || 'When START clicked'}</span>
        <span className="step-explain">{BLOCK_CODE_EXPLAIN[hints.eventBlock || 'when_start']}</span>
      </li>
      {steps.map((step, i) => (
        <li
          key={`${step.label}-${i}`}
          className={[
            step.indent ? `indent-${Math.min(step.indent, 3)}` : '',
            step.kind === 'condition' ? 'step-condition' : '',
            step.kind === 'loop' ? 'step-loop' : '',
          ].filter(Boolean).join(' ')}
        >
          {showNumbers && <span className="step-num">{i + 2}</span>}
          <span className="step-label">{step.label}</span>
          <span className="step-explain">{step.explain}</span>
        </li>
      ))}
    </ol>
  );

  return (
    <div className={`course-code-hints${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="course-code-hints-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="course-code-hints-toggle-icon"><EmojiIcon e="💡" /></span>
        <span className="course-code-hints-toggle-title">
          {open ? `Code hints — ${hints.courseName}` : 'Need help? Tap for code hints'}
        </span>
        <span className="course-code-hints-toggle-caret">{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div className="course-code-hints-body">
          {hints.winCondition && (
            <p className="course-code-hints-goal">
              <strong>Goal:</strong> {hints.winCondition}
            </p>
          )}
          {hints.codeHint && (
            <p className="course-code-hints-tip">{hints.codeHint}</p>
          )}
          {hints.robotTip && (
            <p className="course-code-hints-robot"><EmojiIcon e="🤖" style={{ marginRight: '0.35em' }} />{hints.robotTip}</p>
          )}

          {hints.simpleSteps?.length > 0 && (
            <div className="course-code-hints-tier course-code-hints-tier--easy">
              <div className="course-code-hints-tier-head">⭐ Easy — start here</div>
              {hints.simpleNote && <p className="course-code-hints-tier-note">{hints.simpleNote}</p>}
              {renderSteps(hints.simpleSteps)}
            </div>
          )}

          {hints.hasAdvanced && hints.advancedSteps?.length > 0 && (
            <>
              <button
                type="button"
                className="course-code-hints-tier-toggle course-code-hints-tier-toggle--pro"
                onClick={() => setProOpen((v) => !v)}
                aria-expanded={proOpen}
              >
                <span><EmojiIcon e="🚀" style={{ marginRight: '0.35em' }} />{hints.tierLabels?.advanced || 'Pro code'} ({hints.advancedSteps.length + 1} blocks)</span>
                <span>{proOpen ? '▾' : '▸'}</span>
              </button>
              {proOpen && (
                <div className="course-code-hints-tier course-code-hints-tier--pro">
                  {hints.advancedNote && <p className="course-code-hints-tier-note">{hints.advancedNote}</p>}
                  {renderSteps(hints.advancedSteps)}
                </div>
              )}
            </>
          )}

          {hints.hasExpert && hints.expertSteps?.length > 0 && (
            <>
              <button
                type="button"
                className="course-code-hints-tier-toggle course-code-hints-tier-toggle--expert"
                onClick={() => setExpertOpen((v) => !v)}
                aria-expanded={expertOpen}
              >
                <span><EmojiIcon e="🏆" style={{ marginRight: '0.35em' }} />{hints.tierLabels?.expert || 'Expert code'} ({hints.expertBlockCount || hints.expertSteps.length + 1} blocks)</span>
                <span>{expertOpen ? '▾' : '▸'}</span>
              </button>
              {expertOpen && (
                <div className="course-code-hints-tier course-code-hints-tier--expert">
                  {hints.expertNote && <p className="course-code-hints-tier-note">{hints.expertNote}</p>}
                  {renderSteps(hints.expertSteps, true)}
                </div>
              )}
            </>
          )}

          {hints.racingSections?.length > 0 && (
            <div className="course-code-hints-section course-code-hints-racing">
              <div className="course-code-hints-label">
                <IconText>{hints.racingManual ? '🏎️ Each minimap bend' : '🏎️ Track section guide'}</IconText>
              </div>
              {hints.racingManual && (
                <p className="course-code-hints-tier-note">
                  Match each minimap section to a block — Move forward on straights, Curve left/right at bends. Slow to ~45% before hairpins.
                </p>
              )}
              {hints.racingSections.map((sec) => (
                <details key={`${sec.blockId}-${sec.num}`} className="course-code-hints-zone">
                  <summary>
                    {sec.num}. {sec.name}
                    <span className="course-code-hints-racing-block">{sec.blockId?.replace(/_/g, ' ')}</span>
                  </summary>
                  <p className="course-code-hints-zone-mechanic">{sec.instruction}</p>
                  {sec.explain && <p className="course-code-hints-zone-tip">{sec.explain}</p>}
                </details>
              ))}
            </div>
          )}

          {hints.zoneHints?.length > 0 && (
            <div className="course-code-hints-section course-code-hints-zones">
              <div className="course-code-hints-label">Zone-by-zone build guide</div>
              {hints.zoneHints.map((zone) => (
                <details key={zone.num} className="course-code-hints-zone">
                  <summary>Zone {zone.num}: {zone.name}</summary>
                  {zone.mechanic && <p className="course-code-hints-zone-mechanic">{zone.mechanic}</p>}
                  {zone.tip && <p className="course-code-hints-zone-tip">Blocks: {zone.tip}</p>}
                  {zone.steps?.length > 0 && renderSteps(zone.steps)}
                </details>
              ))}
            </div>
          )}

          {hints.keyBlocks?.length > 0 && (
            <div className="course-code-hints-section">
              <div className="course-code-hints-label">Key blocks to try</div>
              <ul className="course-code-hints-blocks">
                {hints.keyBlocks.map((b) => (
                  <li key={b.id}>
                    <strong>{b.label}</strong> — {b.explain}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {hints.objectives?.length > 0 && (
            <div className="course-code-hints-section">
              <div className="course-code-hints-label">Mission checklist</div>
              <ul className="course-code-hints-objectives">
                {hints.objectives.map((obj, i) => (
                  <li key={i}>{obj}</li>
                ))}
              </ul>
            </div>
          )}

          {hints.programmingConcepts?.length > 0 && (
            <div className="course-code-hints-concepts">
              Learn: {hints.programmingConcepts.join(' · ')}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Show a dropdown setting by its readable label (e.g. "≥ (at least)"), not its internal value. */
function paramDisplay(param, value) {
  const opt = param.type === 'dropdown' ? (param.options || []).find(([, v]) => v === value) : null;
  return opt ? opt[0] : value;
}

export function CustomCodePanel({ robotType, scriptRef, clearRef, onBlockCountChange, onOpenLevels, activeStepIndex = -1, activeBlockUid = '', isRunning = false, starterScript = null, courseKey = '', arenaType = '', eventsFocusKey = 0, teamSize = 1, matchMode = '', footballScriptsRef = null, footballActiveRoleRef = null, footballExecBotId = null, footballSwitchRoleRef = null, challenge = null }) {
  const blockLibrary = useMemo(
    () => getBlockLibraryForCourse(courseKey, arenaType, challenge?.chassisId, challenge?.fightWorld),
    [courseKey, arenaType, challenge?.chassisId, challenge?.fightWorld],
  );
  const isFlappy = isFlappyBirdCourse(courseKey, arenaType);
  const isFighting = isFightingCourse(courseKey, arenaType);
  const isFootball = isFootballCourse(courseKey, arenaType);
  const isRacing = isRaceCourse(courseKey, arenaType);
  const multiRobotFootball = isFootball && isFootballTeamMatch(teamSize, matchMode);
  const paletteRobotType = isFootball ? 'footballbot' : (isRacing ? 'rover' : robotType);
  const paletteRobotGroup = getRobotGroup(paletteRobotType || 'rover');
  const [activeRole, setActiveRole] = useState('striker');
  // Pupils write their own code, so every mission opens with an empty program
  const [script, setScript]       = useState([]);
  const [activeCat, setActiveCat] = useState('Movement');
  const [search, setSearch]       = useState('');
  const [history, setHistory]     = useState([[]]);
  const [histIdx, setHistIdx]     = useState(0);
  const [dragIdx, setDragIdx]     = useState(null);
  const [dragOver, setDragOver]   = useState(null);
  const workspaceRef              = useRef(null);
  const paletteRef                = useRef(null);
  // Code is kept per robot + mission, so pupils come back to exactly what they built.
  const saveScope = `lab:${robotType || 'robot'}:${(courseKey || '').split(':')[0] || arenaType || 'lab'}`;
  const defaultEventKey = `${saveScope}:default-event-hidden`;
  const [showDefaultEvent, setShowDefaultEvent] = useState(() => {
    try { return localStorage.getItem(defaultEventKey) !== '1'; } catch { return true; }
  });
  const dirtyRef = useRef(false);
  // Blocks or Python (Python works for the robots that use the main block set)
  // Every robot can code in Python; the game robots use Python that fits how their game runs
  const pythonOk = true;
  const pythonStyle = isFlappy ? 'flappy' : isFighting ? 'fighting' : isFootball ? 'football' : blockLibrary === CRAFT_BLOCK_LIBRARY ? 'craft' : null;
  const modeKey = `${saveScope}:code-mode`;
  const [codeMode, setCodeModeState] = useState(() => { try { return localStorage.getItem(modeKey) === 'python' ? 'python' : 'blocks'; } catch { return 'blocks'; } });
  const usePython = pythonOk && codeMode === 'python';
  const usePythonRef = useRef(usePython);
  usePythonRef.current = usePython;
  const [pyProgram, setPyProgram] = useState({ blocks: [], code: '' });

  useEffect(() => {
    try { setShowDefaultEvent(localStorage.getItem(defaultEventKey) !== '1'); }
    catch { setShowDefaultEvent(true); }
  }, [defaultEventKey]);

  const focusEventsCategory = useCallback(() => {
    setActiveCat('Events');
    setSearch('');
    requestAnimationFrame(() => {
      paletteRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }, []);

  const setCodeMode = (m) => {
    setCodeModeState(m);
    try { localStorage.setItem(modeKey, m); } catch { /* ignore */ }
    if (m === 'blocks') { usePythonRef.current = false; syncScriptRef(script); }
  };
  const syncScriptRef = useCallback((next) => {
    // In Python mode the Python program is what runs; block changes don't replace it
    if (usePythonRef.current) return;
    if (scriptRef) scriptRef.current = next;
    if (multiRobotFootball && footballScriptsRef?.current) {
      footballScriptsRef.current[activeRole] = next;
      writeStoredFootballScripts(footballScriptsRef.current);
    }
    onBlockCountChange?.(next.length);
  }, [scriptRef, onBlockCountChange, multiRobotFootball, footballScriptsRef, activeRole]);

  const switchFootballRole = useCallback((roleId) => {
    if (!multiRobotFootball || roleId === activeRole) return;
    // In Python mode the role's program is its Python, already saved — don't overwrite it with the blocks
    if (footballScriptsRef?.current && !usePythonRef.current) {
      footballScriptsRef.current[activeRole] = script;
      writeStoredFootballScripts(footballScriptsRef.current);
    }
    const next = footballScriptsRef?.current?.[roleId] || [];
    setActiveRole(roleId);
    syncScriptRef(next);
    setScript(next);
    setHistory([next]);
    setHistIdx(0);
  }, [multiRobotFootball, activeRole, script, footballScriptsRef, syncScriptRef]);

  // Keep parent ref in sync when script state changes (e.g. undo/redo)
  useEffect(() => {
    syncScriptRef(script);
  }, [script, syncScriptRef]);

  useEffect(() => {
    if (footballActiveRoleRef) footballActiveRoleRef.current = activeRole;
  }, [activeRole, footballActiveRoleRef]);

  useEffect(() => {
    if (footballSwitchRoleRef) footballSwitchRoleRef.current = switchFootballRole;
  }, [footballSwitchRoleRef, switchFootballRole]);

  const lastCourseKeyRef = useRef('');
  const lastStarterSigRef = useRef('');

  useEffect(() => {
    if (clearRef) clearRef.current = () => {
      lastStarterSigRef.current = '';
      syncScriptRef([]);
      setScript([]);
      setHistory([[]]);
      setHistIdx(0);
    };
  }, [clearRef, syncScriptRef]);

  useEffect(() => {
    const isFight = isFightingCourse(courseKey, arenaType);
    const isFootballMode = isFootballCourse(courseKey, arenaType);
    const isRacingMode = isRaceCourse(courseKey, arenaType);
    const cupManual = isRacingMode && isCupManualTrack(arenaType, courseKey?.split(':')[0] || courseKey);
    lastStarterSigRef.current = '';
    setActiveCat(cupManual ? 'Track' : isFootball ? 'Football' : 'Movement');
    setSearch('');
    requestAnimationFrame(() => {
      paletteRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }, [robotType, courseKey, arenaType, eventsFocusKey]);

  useEffect(() => {
    if (!multiRobotFootball) return;
    const stored = readStoredFootballScripts();
    const loaded = {};
    for (const role of FOOTBALL_TEAM_ROLES) {
      const saved = stored?.[role.id];
      loaded[role.id] = Array.isArray(saved) && saved.length
        ? saved
        : [];
    }
    if (footballScriptsRef) footballScriptsRef.current = loaded;
    const strikerScript = loaded.striker;
    setActiveRole('striker');
    syncScriptRef(strikerScript);
    setScript(strikerScript);
    setHistory([strikerScript]);
    setHistIdx(0);
  }, [courseKey, arenaType, multiRobotFootball, footballScriptsRef, syncScriptRef]);

  useEffect(() => {
    if (multiRobotFootball) return;
    if (!starterScript?.length) return;
    const starterSig = starterScript.map((b) => `${b.id}:${b.label}`).join(',');
    const loadKey = `${courseKey}::${arenaType}::${starterSig}`;
    if (loadKey === lastStarterSigRef.current) return;
    lastStarterSigRef.current = loadKey;

    // Bring back the pupil's own program — but not an untouched copy of the old starter blocks
    const saved = readAutosave(saveScope);
    const loaded = withBlockDefs((saved && !isUntouchedStarter(saved, starterScript) ? saved : [])
      .map((b) => ({ ...b, _uid: uid(), paramValues: { ...(b.paramValues || {}) } })), blockLibrary);
    lastCourseKeyRef.current = courseKey;
    syncScriptRef(loaded);
    setScript(loaded);
    setHistory([loaded]);
    setHistIdx(0);
  }, [starterScript, courseKey, arenaType, syncScriptRef, multiRobotFootball, saveScope]);

  // Missions without starter blocks: bring back the pupil's last program.
  useEffect(() => {
    if (multiRobotFootball || starterScript?.length) return;
    const saved = readAutosave(saveScope);
    if (!saved?.length) return;
    const loaded = withBlockDefs(saved.map((b) => ({ ...b, _uid: uid(), paramValues: { ...(b.paramValues || {}) } })), blockLibrary);
    syncScriptRef(loaded);
    setScript(loaded);
    setHistory([loaded]);
    setHistIdx(0);
  }, [saveScope, multiRobotFootball]); // eslint-disable-line react-hooks/exhaustive-deps

  // Autosave after every edit the pupil makes (not when the lab resets the panel).
  useEffect(() => {
    if (!dirtyRef.current || multiRobotFootball) return;
    dirtyRef.current = false;
    writeAutosave(saveScope, script);
  }, [script, saveScope, multiRobotFootball]);

  // ── History ─────────────────────────────────────────────────────────────
  const commit = useCallback((raw) => {
    const next = withBlockDefs(raw, blockLibrary);
    dirtyRef.current = true;
    syncScriptRef(next);
    setHistory(h => [...h.slice(0, histIdx + 1), next].slice(-60));
    setHistIdx(i => i + 1);
    setScript(next);
  }, [histIdx, syncScriptRef, blockLibrary]);

  const undo = useCallback(() => {
    dirtyRef.current = true;
    setHistIdx(i => {
      const n = Math.max(0, i - 1);
      const next = history[n] || [];
      syncScriptRef(next);
      setScript(next);
      return n;
    });
  }, [history, syncScriptRef]);

  const redo = useCallback(() => {
    dirtyRef.current = true;
    setHistIdx(i => {
      const n = Math.min(history.length - 1, i + 1);
      const next = history[n] || [];
      syncScriptRef(next);
      setScript(next);
      return n;
    });
  }, [history, syncScriptRef]);

  useEffect(() => {
    const fn = (e) => {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === 'z') { e.preventDefault(); undo(); }
      if ((e.metaKey || e.ctrlKey) && (e.shiftKey ? e.key === 'z' : e.key === 'y')) { e.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [undo, redo]);

  // ── Block operations ────────────────────────────────────────────────────
  const addBlock = useCallback((catKey, block) => {
    const params = { ...(block.paramValues || {}) };
    (block.params || []).forEach(p => {
      if (params[p.key] !== undefined) return;
      params[p.key] = p.type === 'dropdown' ? (p.def ?? p.options?.[0]?.[1] ?? '') : (p.def ?? 0);
    });
    const next = [...script, { ...block, catKey, _uid: uid(), paramValues: params }];
    commit(next);
    setTimeout(() => { if (workspaceRef.current) workspaceRef.current.scrollTop = workspaceRef.current.scrollHeight; }, 30);
  }, [script, commit]);

  const removeBlock = useCallback((id) => commit(script.filter(b => b._uid !== id)), [script, commit]);

  const updateParam = useCallback((id, key, val, isDropdown = false) => {
    dirtyRef.current = true;
    setScript(s => {
      const next = s.map(b => b._uid === id ? {
        ...b,
        paramValues: { ...b.paramValues, [key]: isDropdown ? val : +val },
      } : b);
      syncScriptRef(next);
      return next;
    });
  }, [syncScriptRef]);

  const duplicateBlock = useCallback((idx) => {
    const copy = { ...script[idx], _uid: uid(), paramValues: { ...script[idx].paramValues } };
    const next = [...script.slice(0, idx + 1), copy, ...script.slice(idx + 1)];
    commit(next);
  }, [script, commit]);

  // ── Drag reorder ────────────────────────────────────────────────────────
  const onDragStart = useCallback((e, idx) => { setDragIdx(idx); e.dataTransfer.effectAllowed = 'move'; }, []);
  const onDragEnter = useCallback((idx) => setDragOver(idx), []);
  const onDrop = useCallback((e, toIdx) => {
    e.preventDefault();
    if (dragIdx === null || dragIdx === toIdx) { setDragIdx(null); setDragOver(null); return; }
    const next = [...script];
    const [moved] = next.splice(dragIdx, 1);
    next.splice(toIdx, 0, moved);
    commit(next);
    setDragIdx(null); setDragOver(null);
  }, [dragIdx, script, commit]);

  // ── Filtered palette ────────────────────────────────────────────────────
  // Every robot gets the universal events, except a game that lists its own
  // (Flappy Bird and Block Crafter only offer events that can happen in them)
  const ownEvents = isFlappy || isRacing || isCraftCourse(courseKey, arenaType, challenge?.chassisId);
  const eventsCategory = ownEvents && blockLibrary.Events ? blockLibrary.Events : UNIVERSAL_EVENTS_CATEGORY;
  const filteredCats = useMemo(() => {
    const cats = Object.entries(blockLibrary).filter(([, cat]) => cat && Array.isArray(cat.blocks)).map(([key, cat]) => ({
      key,
      ...cat,
      blocks: sortBlocksForGroup((cat.blocks || []).filter((b) => {
        const groupOk = key === 'Events' || !b.robotGroups
          || b.robotGroups.includes(paletteRobotGroup)
          || b.robotGroups.includes(paletteRobotType);
        const searchOk = !search || b.label.toLowerCase().includes(search.toLowerCase());
        return groupOk && searchOk;
      }), paletteRobotGroup),
    })).filter((c) => c.blocks.length > 0);

    // Events must always be present for every robot
    const eventsCat = cats.find((c) => c.key === 'Events');
    let result = cats;
    if (!eventsCat || eventsCat.blocks.length !== eventsCategory.blocks.length) {
      result = cats.filter((c) => c.key !== 'Events');
      result.unshift({ key: 'Events', ...eventsCategory });
    }

    if (!search) {
      const allBlocks = result
        .filter((c) => c.key !== 'Events')
        .flatMap((c) => c.blocks.map((b) => ({ ...b, catKey: c.key, catColor: c.color })));
      if (allBlocks.length > 0) {
        return [
          { key: 'All', label: 'All Blocks', icon: '🧩', color: '#64748b', blocks: allBlocks },
          ...result,
        ];
      }
    }

    return result;
  }, [blockLibrary, paletteRobotGroup, paletteRobotType, search, eventsCategory]);

  const paletteBlocks = useMemo(() => {
    if (search) return filteredCats.flatMap(c => c.blocks.map(b => ({ ...b, catKey: c.key, catColor: c.color })));
    if (activeCat === 'Events' && !search) {
      return eventsCategory.blocks.map((b) => ({
        ...b,
        catKey: 'Events',
        catColor: eventsCategory.color,
      }));
    }
    const cat = filteredCats.find(c => c.key === activeCat) || filteredCats[0];
    return (cat?.blocks || []).map(b => ({
      ...b,
      catKey: b.catKey || cat?.key,
      catColor: b.catColor || cat?.color,
    }));
  }, [filteredCats, activeCat, search, eventsCategory]);

  const categoryRail = useMemo(() => {
    const entries = Object.entries(blockLibrary);
    entries.sort((a, b) => {
      if (a[0] === 'Events') return -1;
      if (b[0] === 'Events') return 1;
      if (a[0] === 'All') return -1;
      if (b[0] === 'All') return 1;
      if (a[0] === 'Track') return -1;
      if (b[0] === 'Track') return 1;
      return 0;
    });
    const allVisible = entries
      .filter(([key, cat]) => key !== 'Events' && cat)
      .flatMap(([key, cat]) => (cat.blocks || []).filter((b) => !b.robotGroups
        || b.robotGroups.includes(paletteRobotGroup)
        || b.robotGroups.includes(paletteRobotType)));
    const withAll = allVisible.length > 0
      ? [['All', { label: 'All Blocks', icon: '🧩', color: '#64748b', blocks: allVisible }], ...entries]
      : entries;
    return withAll;
  }, [blockLibrary, paletteRobotGroup, paletteRobotType]);

  const canUndo = histIdx > 0;
  const canRedo = histIdx < history.length - 1;

  const codeHints = useMemo(() => {
    const course = challenge || { id: courseKey?.split(':')[0] || courseKey, arenaType };
    return resolveCourseCodeHints(course, {
      robotType,
      arenaType,
      multiRobotFootball,
      activeFootballRole: activeRole,
      isFlappy,
      isFighting,
      isFootball,
      isRacing,
      starterScript,
    });
  }, [challenge, courseKey, arenaType, robotType, multiRobotFootball, activeRole, isFlappy, isFighting, isFootball, isRacing, starterScript]);

  const isCupManual = isRacing && isCupManualTrack(arenaType, courseKey?.split(':')[0] || courseKey);

  const pythonLibrary = useMemo(() => withScriptBlocks(blockLibrary, starterScript, script), [blockLibrary, starterScript, script]);

  const codingObjective = useMemo(() => getCodingObjective(challenge || { id: courseKey?.split(':')[0] || courseKey, arenaType }, {
    library: blockLibrary,
    group: paletteRobotGroup,
    robotType: paletteRobotType,
    kind: isFlappy ? 'flappy' : isFighting ? 'fighting' : isFootball ? 'football' : blockLibrary === CRAFT_BLOCK_LIBRARY ? 'craft' : isRacing ? 'racing' : '',
  }), [challenge, courseKey, arenaType, blockLibrary, paletteRobotGroup, paletteRobotType, isFlappy, isFighting, isFootball, isRacing]);

  return (
    <div className="scratch-panel">
      <div className="scratch-panel-banner">
        <span className="scratch-panel-banner-icon"><EmojiIcon e="⚡" /></span>
        <div>
          <div className="scratch-panel-banner-title">
            {multiRobotFootball ? 'Code Your Team' : isRacing ? 'Racing Blocks' : 'Event Blocks'}
          </div>
          <div className="scratch-panel-banner-sub">
            {multiRobotFootball
              ? 'Tap Defender, Striker or Midfielder — each tab is a different robot. Simulate runs all three.'
              : isRacing
                ? (isCupManual
                  ? 'Plan your lap, then add blocks from the Track & Racing tabs'
                  : 'Track tab has named turns for this circuit — Racing tab has all driving blocks')
                : 'Click a block below to add code'}
          </div>
        </div>
        {pythonOk && (
          <div className="py-mode-toggle" role="tablist" aria-label="Code with blocks or Python">
            <button type="button" role="tab" aria-selected={!usePython} className={!usePython ? 'is-on' : ''} disabled={isRunning} onClick={() => setCodeMode('blocks')}><EmojiIcon e="🧩" /> Blocks</button>
            <button type="button" role="tab" aria-selected={usePython} className={usePython ? 'is-on' : ''} disabled={isRunning} onClick={() => setCodeMode('python')}><EmojiIcon e="🐍" /> Python</button>
          </div>
        )}
      </div>
      {multiRobotFootball && (
        <div className="football-role-tabs football-role-tabs--full">
          {FOOTBALL_TEAM_ROLES.map((role) => (
            <button
              key={role.id}
              type="button"
              className={`football-role-tab${activeRole === role.id ? ' active' : ''}${footballExecBotId === role.botId ? ' executing-role' : ''}`}
              style={{ '--role-c': role.color }}
              onClick={() => switchFootballRole(role.id)}
              title={`Program ${role.label} #${role.number}`}
            >
              <span className="football-role-tab-icon"><EmojiIcon e={role.icon} /></span>
              <span className="football-role-tab-label">{role.label}</span>
              <span className="football-role-tab-num">#{role.number}</span>
            </button>
          ))}
        </div>
      )}
      {multiRobotFootball && (
        <div className="football-coding-chip football-coding-chip--full">
          Coding {FOOTBALL_TEAM_ROLES.find((r) => r.id === activeRole)?.label || 'Striker'} #{FOOTBALL_TEAM_ROLES.find((r) => r.id === activeRole)?.number || 9}
          {activeRole === 'striker' ? ' — your robot. Simulate runs all 3.' : ' — Simulate runs the whole team'}
        </div>
      )}
      <CodingObjectiveCard
        objective={codingObjective}
        blocks={usePython ? pyProgram.blocks : script}
        python={pyProgram.code}
        usePython={usePython}
        isRunning={isRunning}
      />
      {usePython ? (
        <PythonCodePane
          library={pythonLibrary}
          group={paletteRobotGroup}
          robotType={paletteRobotType}
          key={multiRobotFootball ? activeRole : 'one'}
          style={pythonStyle}
          blocksScript={script}
          saveKey={`${saveScope}:python${multiRobotFootball ? `:${activeRole}` : ''}`}
          activeBlockUid={activeBlockUid}
          isRunning={isRunning}
          onProgram={(blocks, code) => {
            setPyProgram({ blocks: blocks || [], code: code || '' });
            if (!blocks) return;
            if (scriptRef) scriptRef.current = blocks;
            if (multiRobotFootball && footballScriptsRef?.current) {
              footballScriptsRef.current[activeRole] = blocks;
              writeStoredFootballScripts(footballScriptsRef.current);
            }
            onBlockCountChange?.(blocks.length);
          }}
        />
      ) : (
      <div className="scratch-panel-body">
      {/* ══ LEFT: CATEGORY RAIL ════════════════════════════════════════════ */}
      <nav className="scratch-cat-rail">
        {categoryRail.map(([key, cat]) => {
          if (!cat) return null;
          const visible = key === 'Events'
            ? eventsCategory.blocks
            : key === 'All'
              ? cat.blocks || []
              : (cat.blocks || []).filter(b => !b.robotGroups || b.robotGroups.includes(paletteRobotGroup) || b.robotGroups.includes(paletteRobotType));
          if (!visible.length) return null;
          const isActive = activeCat === key && !search;
          return (
            <button
              key={key}
              type="button"
              className={`scratch-cat-btn${isActive ? ' active' : ''}${key === 'Events' ? ' events-default' : ''}`}
              style={{ '--cat-c': cat.color }}
              onClick={() => { setActiveCat(key); setSearch(''); if (key === 'Events') focusEventsCategory(); }}
              title={cat.label}
            >
              <span className="scratch-cat-icon"><EmojiIcon e={cat.icon} /></span>
              <span className="scratch-cat-label">{cat.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ══ CENTER: BLOCK PALETTE ══════════════════════════════════════════ */}
      <div className="scratch-palette" ref={paletteRef}>
        <div className="scratch-search-wrap">
          <span className="scratch-search-icon"><Icon name="magnifying-glass" /></span>
          <input
            type="text"
            className="scratch-search"
            placeholder="Search blocks…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button type="button" className="scratch-search-clear" onClick={() => setSearch('')}>×</button>}
        </div>
        {!search && (
          <div className="scratch-pal-header" style={{ '--cat-c': blockLibrary[activeCat]?.color || '#555' }}>
            <EmojiIcon e={blockLibrary[activeCat]?.icon} />
            <span>{blockLibrary[activeCat]?.label || activeCat}</span>
          </div>
        )}
        {!search && activeCat === 'Events' && (
          <div className="scratch-events-hint">
            Pick an event block below, then click it to add code for your robot.
          </div>
        )}
        <div className="scratch-pal-blocks">
          {paletteBlocks.map(block => (
            <button
              key={block.presetKey || `${block.id}-${block.catKey || ''}-${block.label}`}
              type="button"
              className={`scratch-pal-block${isEventHatBlock(block.id) ? ' event-hat' : ''}`}
              style={{ '--cat-c': block.catColor || '#555' }}
              onClick={() => addBlock(block.catKey, block)}
              title={block.robotGroups ? `${block.robotGroups[0]} only` : ''}
            >
              <span className="scratch-pal-block-row">
                <span className="scratch-blk-icon"><EmojiIcon e={block.icon} /></span>
                <span className="scratch-blk-text">{block.label}</span>
                {block.params?.length > 0 && (
                  <span className="scratch-blk-param">
                    {block.params.map(p => (
                      <span key={p.key} className="scratch-blk-val">{paramDisplay(p, block.paramValues?.[p.key] ?? p.def)}</span>
                    ))}
                  </span>
                )}
              </span>
              {block.robotGroups && <span className="scratch-blk-tag">{block.robotGroups[0]}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* ══ RIGHT: WORKSPACE ═══════════════════════════════════════════════ */}
      <div className="scratch-workspace">
        {isFootball && !multiRobotFootball && (
          <div className="football-solo-hint">Your code controls your footballer</div>
        )}
        <div className="scratch-ws-toolbar">
          <button className="scratch-tool-btn" onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)"><Icon name="arrow-u-up-left" /></button>
          <button className="scratch-tool-btn" onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)"><Icon name="arrow-u-up-right" /></button>
          {script.length > 0 && (
            <button className="scratch-tool-btn scratch-clear-btn" onClick={() => commit([])} title="Clear all"><Icon name="trash" /></button>
          )}
          {!multiRobotFootball && (
            <SavedCodeMenu
              scope={saveScope}
              title={kidSafeText(challenge?.name || challenge?.title || 'My program')}
              blocks={script}
              disabled={isRunning}
              onLoad={(blocks) => commit(blocks.map((b) => ({ ...b, _uid: uid(), paramValues: { ...(b.paramValues || {}) } })))}
            />
          )}
          <div className="scratch-ws-spacer" />
          <span className="scratch-block-count">{script.length} block{script.length !== 1 ? 's' : ''}</span>
          <button className="scratch-mission-btn" onClick={onOpenLevels} title="Choose mission"><Icon name="game-controller" style={{ marginRight: 6 }} />Mission</button>
        </div>

        <div className="scratch-ws-canvas" ref={workspaceRef} onDragOver={e => e.preventDefault()}>
          {/* The script's first event. Any Events block can start a program: pick one here,
              or put an event block at the top yourself (then this fixed START block steps aside). */}
          {showDefaultEvent && !(script.length && isEventHatBlock(script[0].id)) && (
            <div className="scratch-anchor-block">
              <span className="scratch-blk-icon"><Icon name={codeHints?.eventBlock === 'when_spacebar' ? 'keyboard' : 'play'} /></span>
              {!isFlappy && !isFootball && blockLibrary.Events?.blocks?.length ? (
                // The label is ordinary text (so it can wrap in a narrow panel); the event list sits invisibly on top
                <label className="scratch-anchor-picker">
                <span className="scratch-blk-text">When START clicked</span>
                <span className="scratch-anchor-caret" aria-hidden="true">▾</span>
                <select
                  className="scratch-anchor-select"
                  value="when_start"
                  title="Choose which event starts this script"
                  aria-label="Choose which event starts this script"
                  disabled={isRunning}
                  onChange={(e) => {
                    const ev = blockLibrary.Events.blocks.find((x) => x.id === e.target.value);
                    if (!ev || ev.id === 'when_start') return;
                    const params = {};
                    (ev.params || []).forEach((pp) => { params[pp.key] = pp.type === 'dropdown' ? (pp.def ?? pp.options?.[0]?.[1] ?? '') : (pp.def ?? 0); });
                    commit([{ ...ev, catKey: 'Events', _uid: uid(), paramValues: params }, ...script]);
                  }}
                >
                  {blockLibrary.Events.blocks.map((ev) => (
                    <option key={ev.id} value={ev.id}>{ev.label}</option>
                  ))}
                </select>
                </label>
              ) : (
                <span className="scratch-blk-text">
                  {codeHints?.eventLabel || (isFlappy ? 'When spacebar clicked' : 'When START clicked')}
                </span>
              )}
              <button
                type="button"
                className="scratch-anchor-delete"
                title="Delete start event"
                aria-label="Delete start event"
                disabled={isRunning}
                onClick={() => {
                  setShowDefaultEvent(false);
                  try { localStorage.setItem(defaultEventKey, '1'); } catch { /* ignore */ }
                }}
              >
                ✕
              </button>
            </div>
          )}

          {script.length === 0 ? (
            <div className="scratch-ws-empty">
              <div className="scratch-ws-empty-arrow"><EmojiIcon e="⬇" /></div>
              <div className="scratch-ws-empty-txt">
                {courseKey === 'flappy_bird'
                  ? 'Add When spacebar clicked, then put Flap! underneath — press Simulate, then hit spacebar!'
                  : isFootball
                    ? multiRobotFootball
                      ? `Program your ${FOOTBALL_TEAM_ROLES.find((r) => r.id === activeRole)?.label || 'robot'} — click Football blocks on the left to build its plan`
                      : 'Click Football blocks on the left to add them under When START clicked'
                    : 'Click a block on the left to add it here'}
              </div>
            </div>
          ) : (
            <div className="scratch-script-stack">
              {script.map((blk, i) => {
                const catColor = isEventHatBlock(blk.id)
                  ? blockLibrary.Events?.color || '#ef4444'
                  : (blockLibrary[blk.catKey]?.color || '#4c97ff');
                const uidMatch = activeBlockUid && (activeBlockUid === blk._uid || activeBlockUid.startsWith(`${blk._uid}_r`));
                const roleForHighlight = FOOTBALL_TEAM_ROLES.find((r) => r.id === activeRole);
                const highlightThisRole = !multiRobotFootball || !footballExecBotId || footballExecBotId === roleForHighlight?.botId;
                const isExecuting = isRunning && highlightThisRole && (uidMatch || (activeStepIndex === i && !activeBlockUid));
                const isCompleted = isRunning && activeStepIndex > i && !uidMatch;
                const isHat = isEventHatBlock(blk.id);
                return (
                  <div
                    key={blk._uid}
                    className={`scratch-script-block${isHat ? ' event-hat' : ''}${dragIdx === i ? ' dragging' : ''}${dragOver === i ? ' drag-over' : ''}${isExecuting ? ' executing' : ''}${isCompleted ? ' completed' : ''}`}
                    style={{ '--cat-c': catColor, '--exec-c': catColor, zIndex: script.length - i }}
                    draggable
                    onDragStart={e => onDragStart(e, i)}
                    onDragEnter={() => onDragEnter(i)}
                    onDragLeave={() => setDragOver(null)}
                    onDrop={e => onDrop(e, i)}
                    onDragEnd={() => { setDragIdx(null); setDragOver(null); }}
                  >
                    <div className="scratch-script-grip">⠿</div>
                    <div className="scratch-script-body">
                      <span className="scratch-blk-icon"><EmojiIcon e={blk.icon} /></span>
                      <span className="scratch-blk-text">{blk.label}</span>
                      {(blk.params || []).map(p => (
                        p.type === 'dropdown' ? (
                          <label key={p.key} className="scratch-param-wrap">
                            <select
                              className="scratch-param-select"
                              value={blk.paramValues?.[p.key] ?? p.def}
                              onClick={e => e.stopPropagation()}
                              onChange={e => updateParam(blk._uid, p.key, e.target.value, true)}
                            >
                              {(p.options || []).map(([lbl, val]) => (
                                <option key={val} value={val}>{lbl}</option>
                              ))}
                            </select>
                          </label>
                        ) : (
                          <label key={p.key} className="scratch-param-wrap">
                            <input
                              type="number"
                              step={p.precision ? p.precision : 1}
                              className="scratch-param-input"
                              value={blk.paramValues?.[p.key] ?? p.def}
                              onClick={e => e.stopPropagation()}
                              onChange={e => updateParam(blk._uid, p.key, e.target.value)}
                            />
                            {p.label && <span className="scratch-param-unit">{p.label}</span>}
                          </label>
                        )
                      ))}
                    </div>
                    <div className="scratch-script-actions">
                      <button type="button" className="scratch-act-btn" onClick={() => duplicateBlock(i)} title="Duplicate">⧉</button>
                      <button type="button" className="scratch-act-btn scratch-del-btn" onClick={() => removeBlock(blk._uid)} title="Delete">✕</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {script.length > 0 && (
            <div
              className="scratch-trash-zone"
              onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('active'); }}
              onDragLeave={e => e.currentTarget.classList.remove('active')}
              onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('active'); if (dragIdx !== null) removeBlock(script[dragIdx]._uid); setDragIdx(null); }}
            >
              <EmojiIcon e="🗑️" style={{ marginRight: '0.35em' }} />Drop here to delete
            </div>
          )}
          {pythonOk && script.length > 0 && (
            <details className="py-preview">
              <summary><EmojiIcon e="🐍" /> See my blocks as Python</summary>
              <pre>{blocksToPython(script, pythonLibrary, { group: paletteRobotGroup, robotType: paletteRobotType, style: pythonStyle })}</pre>
              <button type="button" className="py-pane-btn" onClick={() => setCodeMode('python')}>Switch to Python →</button>
            </details>
          )}
        </div>
      </div>
      </div>
      )}
    </div>
  );
}

/* keep legacy CodePanel export so old imports don't break */
export function CodePanel({ children, onOpenLevels, blockCount, onClear }) {
  return (
    <aside className="bb-sidebar">
      <div className="bb-sidebar-head">
        <span className="bb-sidebar-title">
          <span className="bb-sidebar-title-text">My Script</span>
          {blockCount > 0 && <span className="bb-sidebar-count">{blockCount}</span>}
        </span>
        <div className="bb-sidebar-head-actions">
          {blockCount > 0 && <button type="button" className="bb-sidebar-clear-btn" onClick={onClear}>✕</button>}
          <button type="button" className="bb-sidebar-level-btn" onClick={onOpenLevels}><EmojiIcon e="🎮" /></button>
        </div>
      </div>
      <div className="bb-sidebar-workspace">{children}</div>
    </aside>
  );
}

export const CODE_CATEGORIES = Object.entries(BLOCK_LIBRARY).map(([id, cat]) => ({
  id, icon: cat.icon, label: cat.label, color: cat.color,
}));

const WORLD_ART = {
  ground:            { bg: 'linear-gradient(135deg,#14532d,#22c55e)', emoji: '🌲', tag: 'Fantasy Forest' },
  fox_battery_chase: { bg: 'linear-gradient(135deg,#14532d,#4ade80)', emoji: '🦊', tag: 'Fox Chase'      },
  street_grand_prix: { bg: 'linear-gradient(135deg,#0a0a12,#ef4444)', emoji: '🏎️', tag: 'Rainbow Road'   },
  sunny_circuit:     { bg: 'linear-gradient(135deg,#ff88cc,#ffdd99)', emoji: '🍭', tag: 'Candy Kingdom'  },
  dragon_skyway:     { bg: 'linear-gradient(135deg,#1a2040,#ff8866)', emoji: '🐉', tag: 'Dragon Skyway'  },
  volcano_drift:     { bg: 'linear-gradient(135deg,#1a0800,#ff4400)', emoji: '🌋', tag: 'Volcano Drift'  },
  rainbow_road:      { bg: 'linear-gradient(135deg,#1a0a30,#ff44cc)', emoji: '🌈', tag: 'Rainbow Road'   },
  circuit_sprint:    { bg: 'linear-gradient(135deg,#0a0a12,#ef4444)', emoji: '🏁', tag: 'Circuit Sprint' },
  desert_rally:      { bg: 'linear-gradient(135deg,#7a3500,#f59e0b)', emoji: '🏜️', tag: 'Desert Ruins'   },
  robot_reef:        { bg: 'linear-gradient(135deg,#003060,#00c8a0)', emoji: '🐠', tag: 'Robot Reef'     },
  power_garden:      { bg: 'linear-gradient(135deg,#1a5a08,#88cc44)', emoji: '🌻', tag: 'Power Garden'   },
  crystal_caverns:   { bg: 'linear-gradient(135deg,#04011a,#8040ff)', emoji: '💎', tag: 'Crystal Caves'  },
  sky_island:        { bg: 'linear-gradient(135deg,#ff6b1a,#38bdf8)', emoji: '🏝️', tag: 'Sky Island'     },
  flappy_bird:       { bg: 'linear-gradient(135deg,#87ceeb,#4ade80)', emoji: '🐦', tag: 'Flappy Bird'    },
  neon_race:         { bg: 'linear-gradient(135deg,#1e1b4b,#ec4899)', emoji: '🌃', tag: 'Cyber City'     },
  neon_city:         { bg: 'linear-gradient(135deg,#0f172a,#3b82f6)', emoji: '💠', tag: 'Neon City'      },
  jungle:            { bg: 'linear-gradient(135deg,#14532d,#84cc16)', emoji: '🌴', tag: 'Jungle'         },
  space:             { bg: 'linear-gradient(135deg,#020617,#6366f1)', emoji: '🚀', tag: 'Space Station'  },
  underwater:        { bg: 'linear-gradient(135deg,#0369a1,#06b6d4)', emoji: '🌊', tag: 'Deep Ocean'     },
  cavern:            { bg: 'linear-gradient(135deg,#1e1b4b,#a855f7)', emoji: '💎', tag: 'Crystal Caverns'},
  temple:            { bg: 'linear-gradient(135deg,#78350f,#fbbf24)', emoji: '🏛️', tag: 'Ancient Ruins'  },
  sky:               { bg: 'linear-gradient(135deg,#0ea5e9,#38bdf8)', emoji: '☁️', tag: 'Sky Arena'      },
  lava:              { bg: 'linear-gradient(135deg,#7c0000,#ff4400)', emoji: '🌋', tag: 'Volcano'        },
  arctic:            { bg: 'linear-gradient(135deg,#0369a1,#e0f2fe)', emoji: '❄️', tag: 'Arctic'         },
  city:              { bg: 'linear-gradient(135deg,#0f172a,#475569)', emoji: '🌆', tag: 'City'           },
  forest_trail:      { bg: 'linear-gradient(135deg,#14532d,#fbbf24)', emoji: '🌲', tag: 'Forest Trail'   },
  city_delivery:     { bg: 'linear-gradient(135deg,#0f172a,#ec4899)', emoji: '🏙️', tag: 'City Night'     },
  lava_canyon:       { bg: 'linear-gradient(135deg,#7c0000,#f97316)', emoji: '🌋', tag: 'Lava Canyon'    },
  arctic_station:    { bg: 'linear-gradient(135deg,#0369a1,#e0f2fe)', emoji: '❄️', tag: 'Arctic Base'    },
  temple_maze:       { bg: 'linear-gradient(135deg,#78350f,#a855f7)', emoji: '🏛️', tag: 'Temple Maze'    },
  canyon_flight:     { bg: 'linear-gradient(135deg,#c84b18,#f59e0b)', emoji: '🏔️', tag: 'Canyon Flight'  },
  storm_cloud:       { bg: 'linear-gradient(135deg,#1a0a2a,#6366f1)', emoji: '⚡', tag: 'Storm Chase'    },
  volcano_fly:       { bg: 'linear-gradient(135deg,#1a0800,#ff4400)', emoji: '🌋', tag: 'Volcano Flythrough'},
  city_skyline:      { bg: 'linear-gradient(135deg,#0f172a,#38bdf8)', emoji: '🌃', tag: 'City Skyline'   },
  pipeline_crawl:    { bg: 'linear-gradient(135deg,#2a1a1a,#8b4513)', emoji: '🔧', tag: 'Pipeline'       },
  temple_climb:      { bg: 'linear-gradient(135deg,#1a1808,#fbbf24)', emoji: '🏛️', tag: 'Temple Climb'   },
  coral_reef_course: { bg: 'linear-gradient(135deg,#0369a1,#22c55e)', emoji: '🐠', tag: 'Coral Reef'     },
  shipwreck:         { bg: 'linear-gradient(135deg,#020c14,#8b4513)', emoji: '⚓', tag: 'Shipwreck'      },
  default:           { bg: 'linear-gradient(135deg,#312e81,#7c3aed)', emoji: '🎮', tag: 'Adventure World'},
};

export function worldArt(course) {
  const key = course?.arenaType || course?.id || 'default';
  const art = WORLD_ART[key] || WORLD_ART[course?.cat?.replace(/^campaign_/, '')];
  if (art) return art;
  const col = course?.color || '#7c3aed';
  return {
    bg: `linear-gradient(135deg, ${col}22, ${col})`,
    emoji: course?.icon || '🎮',
    tag: course?.zoneName || course?.shortName || 'Adventure',
  };
}

export function robotMood(stats, isRunning) {
  if (stats.progress >= 100)        return { emoji: '🎉', label: 'Ecstatic!' };
  if ((stats.collisions || 0) > 2) return { emoji: '😅', label: 'Ouch!'    };
  if (isRunning)                    return { emoji: '😄', label: 'Focused'  };
  if (stats.battery < 25)          return { emoji: '😴', label: 'Tired'    };
  return { emoji: '🙂', label: 'Ready' };
}

/* ─── GENRE LABELS ───────────────────────────────────────────────────────── */
const GENRE_META = {
  racing:      { icon: '🏎️', label: 'Racing Game',      color: '#ff4444' },
  adventure:   { icon: '🗺️', label: 'Adventure Game',   color: '#22c55e' },
  puzzle:      { icon: '🧩', label: 'Puzzle Game',       color: '#a855f7' },
  defense:     { icon: '🛡️', label: 'Defense Game',      color: '#f97316' },
  platformer:  { icon: '🦘', label: 'Platformer',        color: '#3b82f6' },
  stealth:     { icon: '👻', label: 'Stealth Game',      color: '#374151' },
  simulation:  { icon: '⚙️', label: 'Robot Lab',         color: '#06b6d4' },
  aerial:      { icon: '✈️', label: 'Sky Mission',       color: '#38bdf8' },
  exploration: { icon: '🔭', label: 'Exploration',       color: '#0ea5e9' },
  football:    { icon: '⚽', label: 'Robot Football',    color: '#16A34A' },
  combat:      { icon: '🏅', label: 'Robot Games',  color: '#22c55e' },
};

const ZONE_NAMES = [
  'Intro World',   'First Mechanic', 'First Trigger', 'Expand System',
  'Mini Challenge','New Concept',    'Complex Logic',  'Boss Puzzle',
  'Final Test',    'Create Your Game',
];

/* ─── MISSION OVERLAY ────────────────────────────────────────────────────── */
export function MissionControlPanel({ challenge, profile, robotConfig, stats, robotXp, zoneInfo, story, onEndMission, onRestart, compact = false, immersiveHidden = false }) {
  const [expanded, setExpanded] = useState(false);
  const totalZones  = getCourseZoneCount(challenge);
  const zonesDone = zoneInfo?.num ? Math.max(0, zoneInfo.num - 1) : Math.floor(((stats.progress || 0) / 100) * totalZones);
  const genre        = GENRE_META[challenge?.genre] || GENRE_META.adventure;
  const accentColor  = challenge?.color || genre.color || '#a78bfa';

  const objectives = useMemo(() => {
    if (challenge?.arenaBible && challenge.objectives?.length) return challenge.objectives;
    if (story?.objectives?.length) return story.objectives;
    return resolveCourseObjectives(challenge, story || {});
  }, [story, challenge]);

  const progress = useMemo(
    () => deriveMissionProgress(challenge, stats, zoneInfo),
    [challenge, stats, zoneInfo],
  );
  const missionAction = useMemo(() => getMissionAction(challenge), [challenge]);
  const learningRobotId = challenge?.chassisId || challenge?.robotType || robotConfig?.chassisId || robotConfig?.type;
  const learningFrame = challenge?.learningGoal || (learningRobotId ? getRobotLearningFrame(learningRobotId) : null);

  const toObjText = (o) => (typeof o === 'string' ? o : (o?.label || o?.text || ''));
  const primaryObj = toObjText(objectives[0]) || challenge?.winCondition || 'Reach the goal zone';
  const subObjs = objectives.slice(1).map(toObjText).filter(Boolean);

  const subObjIcons = ['🪨', '⚡', '🎯', '🏁', '💫'];

  return (
    <aside className={`mcp-panel mcp-panel-v2${compact ? ' mcp-panel--compact' : ''}${immersiveHidden ? ' mcp-panel--immersive-hidden' : ''}`}>
      {/* Header */}
      <div className="mcp-v2-header">
        <span className="mcp-v2-title">Mission</span>
        {!compact && (
          <button type="button" className="mcp-toggle mcp-v2-info" onClick={() => setExpanded(e => !e)} title="Details">
            {expanded ? '✕' : 'ⓘ'}
          </button>
        )}
      </div>

      {/* Primary objective with progress bar */}
      <div className="mcp-v2-primary-obj">
        <div className="mcp-v2-obj-row">
          <span className="mcp-v2-obj-icon">⭐</span>
          <span className="mcp-v2-obj-text">{primaryObj}</span>
        </div>
        <div className="mcp-v2-prog-track">
          <div className="mcp-v2-prog-fill"
            style={{ width: `${progress.pct}%`, background: accentColor }} />
        </div>
        <div className="mcp-v2-prog-label">
          <span style={{ color: accentColor }}>{progress.current}</span>
          <span style={{ color: 'rgba(255,255,255,0.4)' }}> / {progress.target}</span>
          {progress.label !== 'complete' && (
            <span style={{ color: 'rgba(255,255,255,0.35)', marginLeft: 6, fontSize: 10 }}>{progress.label}</span>
          )}
        </div>
      </div>

      {missionAction && (
        <div className="mcp-v2-action-hint">
          <span className="mcp-v2-action-ico"><EmojiIcon e={missionAction.icon} /></span>
          <span>Use <b>{missionAction.label}</b> at each glowing marker</span>
        </div>
      )}

      {learningFrame && (
        <button type="button" className="mcp-v2-learning-summary" onClick={() => setExpanded(e => !e)} aria-expanded={expanded}>
          <span aria-hidden="true"><EmojiIcon e="🎓" /></span>
          <span>Learn · {learningFrame.concept}</span>
          <span className="mcp-v2-learning-chevron" aria-hidden="true">{expanded ? '⌃' : '⌄'}</span>
        </button>
      )}

      {!compact && (
      <>
      {/* Sub-objectives */}
      <ul className="mcp-v2-subobjectives">
        {subObjs.slice(0, 4).map((o, i) => {
          const done = isSubObjectiveMet(o, { stats, zoneInfo, challenge, totalZones, zonesDone });
          return (
          <li key={i} className={`mcp-v2-subobj${done ? ' done' : ''}`}>
            <span className="mcp-v2-subobj-icon"><IconText>{done ? '✅' : subObjIcons[i] || '○'}</IconText></span>
            <span className="mcp-v2-subobj-text">{o}</span>
          </li>
          );
        })}
      </ul>

      {/* Action buttons — only real actions, no dummy Camera/Code/Settings */}
      <div className="mcp-v2-actions">
        {onRestart && (
          <button type="button" className="mcp-v2-btn" onClick={onRestart}>
            <span>↺</span> Restart
          </button>
        )}
      </div>
      </>
      )}

      {/* Expanded detail section */}
      {!compact && expanded && (
        <div className="mcp-expanded">
          {learningFrame && (
            <div className="mcp-v2-learning mcp-v2-learning--detail">
              <span className="mcp-v2-learning-icon" aria-hidden="true"><EmojiIcon e="🎓" /></span>
              <span><b>What you’re learning · {learningFrame.concept}</b><br />{learningFrame.goal}{learningFrame.question && <><br /><i>Think: {learningFrame.question}</i></>}</span>
            </div>
          )}
          {(story?.story || challenge?.desc) && (
            <div className="mcp-story-block">
              <div className="mcp-story-label">STORY</div>
              <p className="mcp-story-text">{story?.story || challenge?.desc}</p>
            </div>
          )}
          <div className="mcp-stats-row">
            <div className="mcp-stat-chip">
              <span><EmojiIcon e="🔋" /></span>
              <span style={{ color: stats.battery > 40 ? '#4ade80' : '#fbbf24' }}>{Math.round(stats.battery)}%</span>
            </div>
            <div className="mcp-stat-chip">
              <span><EmojiIcon e="💎" /></span>
              <span style={{ color: '#fbbf24' }}>{stats.collected || 0}</span>
            </div>
            <div className="mcp-stat-chip">
              <span><EmojiIcon e="📏" /></span>
              <span>{(stats.dist || 0).toFixed(1)}m</span>
            </div>
          </div>
          {(story?.tip || challenge?.codeHint) && (
            <div className="mcp-tip"><EmojiIcon e="💡" style={{ marginRight: '0.35em' }} />{story?.tip || challenge?.codeHint}</div>
          )}
          {onEndMission && (
            <button type="button" className="mcp-end-btn" onClick={onEndMission}>End Mission</button>
          )}
        </div>
      )}
    </aside>
  );
}

/* ─── FLOATING HUD ─────────────────────────────────────────────────────────── */
export function StatsBar({ stats, zoneInfo, challenge, arenaType, isRunning, fps, onRestart }) {
  const isFlappy = isFlappyBirdCourse(challenge?.id, challenge?.arenaType);
  const isFight = isFightingCourse(challenge?.id, challenge?.arenaType);
  const isPrimaryRally = challenge?.isPrimaryMission && challenge?.modeIndex === 10;
  const isRace = isPrimaryRally || (
    (stats.raceMode || isRaceCourse(challenge?.id, challenge?.arenaType) || challenge?.arenaType === 'time_trial_gauntlet')
      && challenge?.arenaType !== 'sandbox'
      && challenge?.genre !== 'simulation'
  );
  if (isFight && isRunning) return null;
  if (isFlappy) {
    const score = stats.flappyScore ?? stats.collected ?? 0;
    const best = stats.flappyBest ?? stats.flappyHighScore ?? 0;
    return (
      <div className="bb-float-hud bb-flappy-hud">
        <div className="bb-fhud-stat bb-flappy-score-stat">
          <span className="bb-fhud-icon">⭐</span>
          <span className="bb-fhud-val bb-flappy-score-val">{score}</span>
          <span className="bb-fhud-lbl">Score</span>
        </div>
        <div className="bb-fhud-sep" />
        <div className="bb-fhud-stat">
          <span className="bb-fhud-icon"><EmojiIcon e="🏆" /></span>
          <span className="bb-fhud-val" style={{ color: '#ffd700' }}>{best}</span>
          <span className="bb-fhud-lbl">Best</span>
        </div>
        {stats.flappyCrashed && (
          <>
            <div className="bb-fhud-sep" />
            <div className="bb-fhud-stat">
              <span className="bb-fhud-icon">💥</span>
              <span className="bb-fhud-val" style={{ color: '#ff6b6b' }}>GAME OVER</span>
            </div>
          </>
        )}
      </div>
    );
  }
  const coins      = stats.collectedValue || stats.collected || 0;
  const speed      = isRace
    ? (stats.raceSpeedKmh != null ? Math.round(stats.raceSpeedKmh) : '0')
    : (stats.time > 0.1 ? (stats.dist / stats.time).toFixed(1) : '0.0');
  const battColor  = stats.battery > 60 ? '#4ade80' : stats.battery > 30 ? '#fbbf24' : '#ef4444';
  const totalZones = challenge?.isFoxChase ? 9 : Math.ceil((challenge?.totalDist || 30) / 5);
  const currentZone = zoneInfo?.num || 0;
  if (isRace) {
    const resolvedArena = arenaType || challenge?.arenaType;
    const codeRacer = isCodeRacerArena(resolvedArena)
      || stats.codeRacerMode
      || challenge?.physics === 'racing_spline';
    if (codeRacer) {
      return (
        <CodeRacerHUD
          stats={stats}
          challenge={challenge}
          arenaType={challenge?.arenaType}
          theme={stats.raceHudTheme || challenge?.arenaType}
          onRestart={onRestart}
        />
      );
    }
    return (
      <RacingHUD
        stats={stats}
        challenge={challenge}
        theme={stats.raceHudTheme || (challenge?.arenaType === 'sunny_circuit' ? 'sunny_circuit' : challenge?.arenaType === 'volcano_drift' ? 'volcano_drift' : challenge?.arenaType === 'dragon_skyway' ? 'dragon_skyway' : 'rainbow_road')}
        onRestart={onRestart}
        minimal
      />
    );
  }
  if (challenge?.isRobotMission) {
    return <MissionCampaignHUD stats={stats} challenge={challenge} />;
  }
  return (
    <div className="bb-float-hud">
      <div className="bb-fhud-stat">
        <span className="bb-fhud-icon"><EmojiIcon e="🔋" /></span>
        <span className="bb-fhud-val" style={{ color: battColor }}>{Math.round(stats.battery)}%</span>
        <span className="bb-fhud-lbl">Battery</span>
      </div>
      <div className="bb-fhud-sep" />
      <div className="bb-fhud-stat">
        <span className="bb-fhud-icon"><EmojiIcon e="💎" /></span>
        <span className="bb-fhud-val" style={{ color: '#fbbf24' }}>{coins}</span>
        <span className="bb-fhud-lbl">Coins</span>
      </div>
      <div className="bb-fhud-sep" />
      <div className="bb-fhud-stat">
        <span className="bb-fhud-icon"><EmojiIcon e="🔄" /></span>
        <span className="bb-fhud-val">{speed}</span>
        <span className="bb-fhud-lbl">m/s</span>
      </div>
      <div className="bb-fhud-sep" />
      <div className="bb-fhud-stat">
        <span className="bb-fhud-icon"><EmojiIcon e="🗺️" /></span>
        <span className="bb-fhud-val">{currentZone > 0 ? currentZone : '—'}</span>
        <span className="bb-fhud-lbl">/ {totalZones}</span>
      </div>
    </div>
  );
}

/* ─── CHALLENGE / MEDAL BAR ────────────────────────────────────────────────── */
const MEDAL_META = {
  bronze: { icon: '🥉', color: '#cd7f32' },
  silver: { icon: '🥈', color: '#c0c0c0' },
  gold:   { icon: '🥇', color: '#ffd700' },
};

export function ChallengeMedalBar({ challenge, stats }) {
  const [open, setOpen] = useState(false);
  const medals = challenge?.medals;
  if (!medals) return null;
  const entries = Object.entries(MEDAL_META).filter(([tier]) => medals[tier]);
  const earnedCount = entries.filter(([tier]) => !!medals[tier]?.check?.(stats)).length;

  if (!open) {
    return (
      <button type="button" className="cmb-badge" onClick={() => setOpen(true)} title="Challenge Mode">
        <EmojiIcon e="🏆" style={{ marginRight: '0.35em' }} />{earnedCount}/{entries.length}
      </button>
    );
  }

  return (
    <div className="cmb-bar">
      <span className="cmb-label"><EmojiIcon e="🏆" style={{ marginRight: '0.35em' }} />Challenge Mode</span>
      {entries.map(([tier, meta]) => {
        const m = medals[tier];
        const earned = !!m.check?.(stats);
        return (
          <div key={tier} className={`cmb-card${earned ? ' cmb-earned' : ''}`} style={earned ? { borderColor: meta.color } : undefined}>
            <span className="cmb-icon"><EmojiIcon e={meta.icon} /></span>
            <div className="cmb-text">
              <span className="cmb-tier" style={{ color: meta.color }}>{tier[0].toUpperCase() + tier.slice(1)}</span>
              <span className="cmb-goal">{m.label}</span>
            </div>
            <span className="cmb-check">{earned ? '✓' : ''}</span>
          </div>
        );
      })}
      <button type="button" className="cmb-close" onClick={() => setOpen(false)}>✕</button>
    </div>
  );
}

/* ─── WORLD CATALOG ───────────────────────────────────────────────────────── */
const STORY_WORLDS = {
  story_garden: {
    label: 'The Power Garden',
    icon: '🌻',
    color: '#ffcc00',
    gradient: 'linear-gradient(135deg, #1a5a08 0%, #2d8a18 50%, #88cc44 100%)',
    tagline: 'The energy flowers are wilting…',
    palette: 'Yellow · Lime · Gold',
  },
  story_cave: {
    label: 'Crystal Caverns',
    icon: '💎',
    color: '#8040ff',
    gradient: 'linear-gradient(135deg, #04011a 0%, #180828 50%, #4008a0 100%)',
    tagline: 'The underground city is going dark…',
    palette: 'Purple · Cyan · Black',
  },
  story_reef: {
    label: 'Robot Reef',
    icon: '🐠',
    color: '#00c8a0',
    gradient: 'linear-gradient(135deg, #003060 0%, #0044aa 50%, #00c8a0 100%)',
    tagline: 'The reef is losing its colours…',
    palette: 'Turquoise · Coral · Deep Blue',
  },
  story_sky: {
    label: 'Sky Island Delivery',
    icon: '🏝️',
    color: '#ff8c20',
    gradient: 'linear-gradient(135deg, #ff6b1a 0%, #ff9a3c 50%, #ffcc55 100%)',
    tagline: 'A storm cut the delivery routes…',
    palette: 'Orange · Sky Blue · Cream',
  },
};

const WORLD_SECTIONS = {
  ...MISSION_GENRE_SECTIONS,
  ...CAMPAIGN_WORLD_SECTIONS,
  ...FLAGSHIP_WORLD_SECTIONS,
  ground:         { label: 'Ground Adventure',    icon: '🌲', blurb: 'Forest trails, city grids & lava canyons', color: '#22c55e' },
  city:           { label: 'Urban Missions',       icon: '🏙️', blurb: 'Deliver, navigate & hack the city',       color: '#60a5fa' },
  lava:           { label: 'Volcanic Zone',        icon: '🌋', blurb: 'Survive the lava canyon run',             color: '#f97316' },
  arctic:         { label: 'Arctic Expedition',    icon: '❄️', blurb: 'Blizzard survival & ice station missions', color: '#38bdf8' },
  race:           { label: 'Racing Circuit',       icon: '🏎️', blurb: 'High-speed night circuits',              color: '#ff6b35' },
  temple:         { label: 'Ancient Temple',       icon: '🏛️', blurb: 'Traps, mazes & treasure',                color: '#d97706' },
  sky:            { label: 'Sky Missions',         icon: '☁️', blurb: 'Canyon flights & storm chases',           color: '#0ea5e9' },
  storm:          { label: 'Storm & Chaos',        icon: '⚡', blurb: 'Thunder, volcanoes & extreme flying',     color: '#7c3aed' },
  space:          { label: 'Space & Stars',        icon: '🚀', blurb: 'Orbit the station & beyond',             color: '#6366f1' },
  industrial:     { label: 'Industrial Zone',      icon: '🏭', blurb: 'Pipelines, factories & bases',           color: '#78716c' },
  ruins:          { label: 'Ruins & Temples',      icon: '🏛️', blurb: 'Climb, crawl & explore ancient ruins',   color: '#b45309' },
  urban:          { label: 'Urban Rescue',         icon: '🚑', blurb: 'Collapsed buildings & hospital runs',    color: '#ef4444' },
  ocean:          { label: 'Ocean Exploration',    icon: '🌊', blurb: 'Coral reefs, shipwrecks & deep trenches',color: '#0284c7' },
  deep:           { label: 'Deep Sea',             icon: '🦑', blurb: 'Pitch-black abyss & hydrothermal vents', color: '#1d4ed8' },
  ai:             { label: 'AI Laboratory',        icon: '🧠', blurb: 'Sensor missions & smart routing',         color: '#a855f7' },
  cavern:         { label: 'Crystal Cavern',       icon: '💎', blurb: 'Glowing underground chambers',           color: '#8b5cf6' },
  combat:         { label: 'Robot Games',         icon: '🏅', blurb: 'Balance, sport, rescue drills and teamwork', color: '#22c55e' },
  football:       { label: 'Robot Football',       icon: '⚽', blurb: '1v1 skills matches & championship football', color: '#16A34A' },
};

/** Rich hero card — same layout as Story World missions (racing-parity) */
function MissionHeroCard({ course, robotName, robotType, chassisId, gradient, metaColor, isSel, onSelect, onClose }) {
  const best = course.isRobotMission
    ? (RobotMissionProgress.getMission(robotName || 'Robot', course.robotMissionId || course.id).xpEarned || 0)
    : GameProgress.getBest(robotName || 'Robot', course.id);
  const designerXp = best > 0 ? Math.round(best * 1.5) : 0;
  const genre = GENRE_META[course.genre] || GENRE_META.adventure;
  const heroBg = course.studioGradient || gradient || worldArt(course).bg;
  const zoneCount = course.zones || course.zoneCount || (course.isRobotMission ? 1 : 10);
  const isSecurityBot = !course.arenaBible && (course.chassisId === 'securitybot' || course.exclusive === 'securitybot');
  const securityArena = isSecurityBot ? getSecurityBotArena(course.modeIndex || course.modeSpec?.modeNumber) : null;
  const studioArena = course.chassisId ? getPrimaryStudioArena(course.chassisId, course.modeIndex || 1) : null;
  const learningRobotId = course.chassisId || course.exclusive || course.robotType || robotType || chassisId;
  const learningFrame = course.learningGoal || (learningRobotId ? getRobotLearningFrame(learningRobotId) : null);
  const learningGoal = learningFrame && (studioArena && course.arenaBible
    ? `${learningFrame.goal} ${studioArena.objective}`
    : learningFrame.goal);
  const displayTitle = kidSafeText(securityArena?.title || course.environmentName || course.name);
  const codingObjective = getCodingObjective(course);
  const isCraftCard = isCraftCourse(course.id, course.arenaType) || course.chassisId === 'blockbot';
  const displayStory = kidSafeText([
    course.difficulty,
    course.skillLearned ? `Learn ${course.skillLearned}` : null,
    course.tryThis || course.desc || course.tagline,
  ].filter(Boolean).join(' · '));
  return (
    <button
      type="button"
      className={`gls-mission-card${isSel ? ' playing' : ''}`}
      style={{ '--mc': course.color || metaColor }}
      onClick={() => { onSelect(course); onClose(); }}
    >
      <div className="gls-mc-hero gls-mc-hero--preview" style={{ background: heroBg }}>
        {course.thumbnailKind === 'jumpbot'
          ? <JumpBotLevelPreview mode={course.modeIndex || 1} />
          : isCraftCard
          ? <CraftArenaThumbnail mode={course.modeIndex || 1} title={displayTitle} />
          : (
            <ArenaPreviewImage
              course={course}
              title={displayTitle}
              fallback={course.arenaBible && studioArena
                ? <PrimaryArenaThumbnail arena={studioArena} />
                : <span className="gls-mc-icon">{securityArena?.emoji || course.environmentEmoji || studioArena?.emoji || course.icon}</span>}
            />
          )}
        {isSel && <span className="gls-mc-playing"><EmojiIcon e="▶" style={{ marginRight: '0.35em' }} />PLAYING</span>}
        {course.isGameMission && <span className="bb-level-featured gls-mc-badge"><EmojiIcon e="🎮" style={{ marginRight: '0.35em' }} />GAME BUILD</span>}
        {course.isRobotMission && <span className="bb-level-featured gls-mc-badge"><EmojiIcon e="📋" style={{ marginRight: '0.35em' }} />CAMPAIGN</span>}
        {course.isFlagship && <span className="bb-level-featured gls-mc-badge"><EmojiIcon e="🎓" style={{ marginRight: '0.35em' }} />FLAGSHIP</span>}
        <span className="gls-genre-badge" style={{ background: genre.color }}>
          <EmojiIcon e={genre.icon} style={{ marginRight: '0.35em' }} />{kidSafeText(genre.label)}
        </span>
      </div>
      <div className="gls-mc-body">
        <div className="gls-mc-env" style={{ fontSize: 11, fontWeight: 800, color: metaColor || course.color, letterSpacing: '0.04em' }}>
          {course.cardLabel || `${course.displayRobotName || robotName} · Mode ${course.modeIndex || 1}`}
        </div>
        <div className="gls-mc-name">{displayTitle}</div>
        <div className="gls-mc-story">{kidSafeText(course.desc)}</div>
        <div className="gls-mc-story">{displayStory}</div>
        {learningFrame && (
          <div className="gls-mc-learning">
            <span aria-hidden="true"><EmojiIcon e="🎓" /></span>
            <span>
              <b>Learn · {learningFrame.concept}</b>
              {codingObjective ? (
                <>
                  <span className="gls-mc-objective" style={{ display: 'block' }}>
                    <EmojiIcon e="🎯" /> <b>Coding objective · {codingObjective.concept} · {codingObjective.level}</b> ({codingObjective.checks.length} goals)
                  </span>
                  <span style={{ display: 'block' }}>{kidSafeText(codingObjective.headline || codingObjective.ican)}</span>
                  <i>{codingObjective.ican}</i>
                </>
              ) : <><br />{kidSafeText(learningGoal)}</>}
            </span>
          </div>
        )}
        {course.recommendedBlocks && (
          <div className="gls-mc-systems">
            <span className="gls-sys-label">Try:</span>
            <span className="gls-sys-tag">{Array.isArray(course.recommendedBlocks) ? course.recommendedBlocks.join(' · ') : course.tryThis || 'Starter movement blocks'}</span>
          </div>
        )}
        <div className="gls-mc-foot">
          <span className="gls-mc-zones"><EmojiIcon e="🎯" style={{ marginRight: '0.35em' }} />{course.difficulty || 'Easy'}</span>
          {course.estMinutes && <span className="gls-mc-time">⏱ ~{course.estMinutes} min</span>}
          {designerXp > 0
            ? <span className="gls-mc-xp"><EmojiIcon e="🎮" style={{ marginRight: '0.35em' }} />{designerXp} Designer XP</span>
            : <span className="gls-mc-new"><EmojiIcon e="✨" style={{ marginRight: '0.35em' }} />NEW</span>}
        </div>
      </div>
    </button>
  );
}

export function GameLevelSelect({ courses, currentId, robotName, robotType, chassisId, currentArenaType, strictChassisModes, onSelect, onSelectBiomeTrack, onClose }) {
  const [search, setSearch] = useState('');
  // Stop drawing card snapshots once the picker closes, so the chosen level loads at full speed
  useEffect(() => () => cancelArenaPreviews(), []);
  const [filter, setFilter] = useState('all');

  const campaignZoneWorlds = useMemo(() => (strictChassisModes ? [] : getCampaignZoneWorlds(robotType || 'rover')), [robotType, strictChassisModes]);
  const featuredCourses = useMemo(
    () => (strictChassisModes ? courses : pickFeaturedCourses(courses, robotType || 'rover', 10)),
    [courses, robotType, strictChassisModes],
  );

  // IDs already displayed — prevents any course appearing twice
  const shown = useMemo(() => new Set(), [courses, search, filter]);

  const matchesCourse = (c) => {
    if (filter !== 'all') {
      const catalogDiff = c.difficulty || '';
      const bucket = catalogDiff === 'Advanced' ? 'Advanced'
        : catalogDiff.includes('Tutorial') || catalogDiff === 'Easy' ? 'Easy'
        : catalogDiff === 'Medium' ? 'Medium'
        : catalogDiff === 'Hard' || catalogDiff === 'Expert' ? 'Hard'
        : (c.totalDist > 40 ? 'Hard' : c.totalDist > 25 ? 'Medium' : 'Easy');
      if (bucket !== filter) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return (c.name || '').toLowerCase().includes(q)
        || (c.desc || '').toLowerCase().includes(q)
        || (c.tagline || '').toLowerCase().includes(q)
        || (c.environmentName || '').toLowerCase().includes(q);
    }
    return true;
  };

  const isFiltering = search.length > 0 || filter !== 'all';

  // Build all-courses flat list for search mode
  const allFlat = useMemo(() => courses.filter(matchesCourse), [courses, search, filter]);
  // Labels of the car track tiles, so bonus races don't repeat a track that is already a mode
  const carTrackLabels = useMemo(() => new Set(CAR_KID_TRACK_TILES.map((t) => t.label)), []);

  // Non-campaign, non-story-world courses grouped by WORLD_SECTIONS category
  const catalogSections = useMemo(() => {
    if (strictChassisModes) return [];
    const seenIds = new Set([
      ...featuredCourses.map(c => c.id),
      ...courses.filter(c => c.isRobotMission).map(c => c.id),
      ...courses.filter(c => STORY_WORLDS[c.cat]).map(c => c.id),
    ]);
    return Object.entries(WORLD_SECTIONS)
      .map(([cat, meta]) => ({
        cat, meta,
        items: courses.filter(c => c.cat === cat && !seenIds.has(c.id)),
      }))
      .filter(s => s.items.length > 0);
  }, [courses, featuredCourses, strictChassisModes]);

  const renderCard = (course, gradient, metaColor) => (
    <MissionHeroCard
      key={course.id}
      course={course}
      robotName={robotName}
      robotType={robotType}
      chassisId={chassisId}
      gradient={gradient || worldArt(course).bg}
      metaColor={metaColor || course.color}
      isSel={course.id === currentId}
      onSelect={onSelect}
      onClose={onClose}
    />
  );

  const SectionHead = ({ icon, title, subtitle, color }) => (
    <div className="gls-sec-head" style={{ '--sh': color || '#7c3aed' }}>
      <span className="gls-sec-icon"><EmojiIcon e={icon} /></span>
      <div>
        <h2 className="gls-sec-title">{title}</h2>
        {subtitle && <p className="gls-sec-sub">{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <div className="gls-overlay">
      <div className="gls-panel">

        {/* ── Header ── */}
        <header className="gls-header">
          <div className="gls-header-left">
            <span className="gls-title"><EmojiIcon e="🎮" style={{ marginRight: '0.35em' }} />Choose Mission</span>
            <span className="gls-sub">
              {getPrimaryRobotDisplay(chassisId).emoji} {getPrimaryRobotDisplay(chassisId).name} · {courses.length} arenas for {getPrimaryRobotDisplay(chassisId).name}
            </span>
          </div>
          <div className="gls-header-right">
            <div className="gls-search-wrap">
              <span className="gls-search-icon"><EmojiIcon e="🔍" /></span>
              <input
                className="gls-search"
                type="text"
                placeholder="Search missions…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && <button type="button" className="gls-search-clear" onClick={() => setSearch('')}>×</button>}
            </div>
            {['all','Easy','Medium','Hard','Advanced'].map(d => (
              <button key={d} type="button" className={`gls-filter-btn${filter === d ? ' active' : ''}`} onClick={() => setFilter(d)}>{d}</button>
            ))}
            <button type="button" className="gls-close" onClick={onClose}>✕ Back to Code</button>
          </div>
        </header>

        <div className="gls-scroll">

          {/* ── SEARCH / FILTER RESULTS ── */}
          {isFiltering ? (
            <div className="gls-search-results">
              {allFlat.length === 0 ? (
                <div className="gls-empty">No missions match "{search || filter}" — try a different search or filter.</div>
              ) : (
                <>
                  <div className="gls-sec-head" style={{ '--sh': '#7c3aed' }}>
                    <span className="gls-sec-icon"><EmojiIcon e="🔍" /></span>
                    <div>
                      <h2 className="gls-sec-title">Search Results</h2>
                      <p className="gls-sec-sub">{allFlat.length} mission{allFlat.length !== 1 ? 's' : ''} found</p>
                    </div>
                  </div>
                  <div className="gls-card-grid">{allFlat.map(c => renderCard(c))}</div>
                </>
              )}
            </div>
          ) : strictChassisModes ? (
            <>
              {isCarChassis(chassisId) && !courses.some(c => c.arenaBible) ? (
                <section className="gls-section gls-car-tracks-section">
                  <CarRobotTrackGrid
                    courses={courses}
                    currentId={currentId}
                    currentArenaType={currentArenaType}
                    onSelectCourse={(course) => { onSelect(course); onClose(); }}
                  />
                  {/* Modes 11–50: new races, grouped by difficulty */}
                  {['Easy', 'Medium', 'Hard', 'Advanced'].map((tier) => {
                    const races = courses.filter((c) => (c.modeIndex || 0) > 10 && c.difficulty === tier);
                    if (!races.length) return null;
                    return (
                      <React.Fragment key={tier}>
                        <SectionHead
                          icon={{ Easy: '🟢', Medium: '🟡', Hard: '🟠', Advanced: '🔴' }[tier]}
                          title={`${tier} races`}
                          subtitle={tier === 'Advanced' ? 'Classic circuits at full speed, with less driving help' : `New tracks · ${{ Easy: 'gentle loops, 1 lap', Medium: 'S-bends, 2 laps', Hard: 'hairpins, 3 laps' }[tier]}`}
                          color={{ Easy: '#22c55e', Medium: '#eab308', Hard: '#f97316', Advanced: '#ef4444' }[tier]}
                        />
                        <div className="gls-card-grid gls-card-grid--compact" style={{ marginBottom: 12 }}>
                          {races.map((c) => renderCard({ ...c, name: c.name, tagline: `Mode ${c.modeIndex} · ${c.desc}` }))}
                        </div>
                      </React.Fragment>
                    );
                  })}
                  {onSelectBiomeTrack && (
                    <SectionHead
                      icon="🛸"
                      title="Bonus races"
                      subtitle="Extra space circuits to race once you've tried the main tracks"
                      color="#7c3aed"
                    />
                  )}
                  {onSelectBiomeTrack && (
                    <div className="gls-card-grid gls-card-grid--compact" style={{ marginBottom: 12 }}>
                      {/* The track grid above already lists every mode — skip bonus tracks it shows */}
                      {COSMIC_SKYWAY_UI_TRACKS.filter((t) => !carTrackLabels.has(t.label)).map((t) => (
                        <button
                          key={t.arenaType}
                          type="button"
                          className={`gls-mission-card${currentArenaType === t.arenaType ? ' playing' : ''}`}
                          style={{ '--mc': t.color }}
                          onClick={() => { onSelectBiomeTrack({ arenaType: t.arenaType }); onClose(); }}
                        >
                          <div className="gls-mc-hero gls-mc-hero--preview" style={{ background: t.cardGradient }}>
                            <ArenaPreviewImage
                              course={{ id: t.arenaType, arenaType: t.arenaType, name: t.label }}
                              title={t.label}
                              fallback={<span className="gls-mc-icon">{t.emoji}</span>}
                            />
                            {currentArenaType === t.arenaType && <span className="gls-mc-playing"><EmojiIcon e="▶" style={{ marginRight: '0.35em' }} />PLAYING</span>}
                          </div>
                          <div className="gls-mc-body">
                            <div className="gls-mc-name">{t.label}</div>
                            <div className="gls-mc-story">Bonus race · {t.story}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </section>
              ) : (
                <section className="gls-section">
                  <SectionHead
                    icon="🤖"
                    title={`${courses.length} arenas for ${getPrimaryRobotDisplay(chassisId).name}`}
                    subtitle="Each arena looks different and teaches one coding idea"
                    color="#7c3aed"
                  />
                  <div className="gls-card-grid">
                    <IconText>{courses.map((c, i) => renderCard(
                      c.chassisId === 'securitybot' || c.exclusive === 'securitybot'
                        ? { ...c, icon: c.environmentEmoji || c.icon || '👮' }
                        : {
                          ...c,
                          icon: c.icon || c.environmentEmoji || '🎮',
                          name: c.raceTrackLabel || c.name,
                          tagline: [
                            `Mode ${c.modeIndex || i + 1}`,
                            c.difficulty ? `${c.difficulty}` : null,
                            c.raceTrackLabel && c.raceTrackLabel !== c.name ? `🏁 ${c.raceTrackLabel}` : null,
                            c.desc || c.tagline,
                          ].filter(Boolean).join(' · '),
                          shortName: c.raceTrackLabel || c.shortName || `Mode ${i + 1}`,
                        },
                    ))}</IconText>
                  </div>
                  {isCarChassis(chassisId) && onSelectBiomeTrack && (
                    <>
                      <SectionHead
                        icon="🛸"
                        title="Cosmic race tracks"
                        subtitle="11 space race tracks — scroll down to find them all"
                        color="#aa44ff"
                      />
                      <div className="gls-card-grid gls-card-grid--compact">
                        {COSMIC_SKYWAY_UI_TRACKS.map((t, i) => (
                          <MissionHeroCard
                            key={t.arenaType}
                            robotName={robotName}
                            robotType={robotType}
                            chassisId={chassisId}
                            gradient={t.cardGradient}
                            metaColor={t.color}
                            isSel={currentArenaType === t.arenaType}
                            onSelect={() => onSelectBiomeTrack({ arenaType: t.arenaType })}
                            onClose={onClose}
                            course={{
                              id: t.arenaType,
                              arenaType: t.arenaType,
                              icon: t.emoji,
                              name: t.label,
                              environmentName: t.label,
                              shortName: t.label,
                              color: t.color,
                              tagline: t.story,
                              cardLabel: `${robotName} · Space track ${i + 1} of ${COSMIC_SKYWAY_UI_TRACKS.length}`,
                              difficulty: t.arenaType === 'cosmic_event_horizon_11' ? 'Expert' : 'Hard',
                            }}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </section>
              )}
            </>
          ) : (
            <>
              {/* ── FEATURED ── */}
              {featuredCourses.length > 0 && (
                <section className="gls-section">
                  <SectionHead icon="🏆" title="Featured" subtitle={`Best missions for ${robotName} — start here`} color="#fbbf24" />
                  <div className="gls-card-grid">
                    {featuredCourses.map(c => renderCard(c))}
                  </div>
                </section>
              )}

              {/* ── CAMPAIGN ZONES ── */}
              {campaignZoneWorlds.length > 0 && (() => {
                const campaignCourses = courses.filter(c => c.isRobotMission);
                return (
                  <section className="gls-section">
                    <SectionHead icon="📋" title="Mission Campaign" subtitle={`${campaignCourses.length} story missions across ${campaignZoneWorlds.length} zones`} color="#22c55e" />
                    {campaignZoneWorlds.map(({ zoneId, meta }) => {
                      const zoneCourses = campaignCourses.filter(c => c.zoneId === zoneId);
                      if (!zoneCourses.length) return null;
                      return (
                        <div key={zoneId} className="gls-zone-block">
                          <div className="gls-zone-label" style={{ '--wc': meta.color }}>
                            <span><EmojiIcon e={meta.icon} /></span>
                            <span className="gls-zone-name">{meta.label}</span>
                            <span className="gls-zone-tag">{meta.tagline}</span>
                            <span className="gls-zone-count">{zoneCourses.length} missions</span>
                          </div>
                          <div className="gls-card-grid gls-card-grid--indented">
                            {zoneCourses.map(c => renderCard(c, meta.gradient, meta.color))}
                          </div>
                        </div>
                      );
                    })}
                  </section>
                );
              })()}

              {/* ── STORY WORLDS ── */}
              {(() => {
                const storyCourses = courses.filter(c => STORY_WORLDS[c.cat]);
                const storyWorldKeys = [...new Set(storyCourses.map(c => c.cat))];
                if (!storyWorldKeys.length) return null;
                return (
                  <section className="gls-section">
                    <SectionHead icon="✨" title="Story Worlds" subtitle="Narrative adventures — 10 zones each" color="#a855f7" />
                    {storyWorldKeys.map(key => {
                      const meta = STORY_WORLDS[key];
                      const wCourses = storyCourses.filter(c => c.cat === key);
                      return (
                        <div key={key} className="gls-zone-block">
                          <div className="gls-zone-label" style={{ '--wc': meta.color }}>
                            <span><EmojiIcon e={meta.icon} /></span>
                            <span className="gls-zone-name">{meta.label}</span>
                            <span className="gls-zone-tag">{meta.tagline}</span>
                            <span className="gls-zone-count">{wCourses.length} missions</span>
                          </div>
                          <div className="gls-card-grid gls-card-grid--indented">
                            {wCourses.map(c => renderCard(c, meta.gradient, meta.color))}
                          </div>
                        </div>
                      );
                    })}
                  </section>
                );
              })()}

              {/* ── CATALOG SECTIONS ── */}
              {catalogSections.map(({ cat, meta, items }) => (
                <section key={cat} className="gls-section">
                  <SectionHead icon={meta.icon} title={meta.label} subtitle={`${meta.blurb} · ${items.length} missions`} color={meta.color} />
                  <div className="gls-card-grid">
                    {items.map(c => renderCard(c))}
                  </div>
                </section>
              ))}
            </>
          )}

        </div>
      </div>
    </div>
  );
}

/* ─── VICTORY / FAILURE ──────────────────────────────────────────────────── */
export function GameVictoryScreen({ xp, medal, coins, designerXp, systemsBuilt, onDone, slowMo }) {
  const pieces = useMemo(() => Array.from({ length: 80 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 1.0}s`,
    size: `${6 + Math.random() * 10}px`,
    color: ['#fbbf24','#22c55e','#3b82f6','#ec4899','#a78bfa','#ff6b35','#00d9ff'][i % 7],
  })), []);

  const dxp = designerXp || Math.round((xp || 100) * 1.5);
  const built = systemsBuilt || [];

  return (
    <div className={`victory-screen${slowMo ? ' slowmo' : ''}`}>
      <div className="victory-card">
        {/* Celebration header */}
        <div className="victory-burst"><EmojiIcon e="🎮" /></div>
        <h1 className="victory-title">You built it!</h1>
        <p className="victory-sub">Your robot completed the mission.</p>

        {/* Designer XP — the hero stat */}
        <div className="victory-dxp">
          <div className="victory-dxp-number">+{dxp}</div>
          <div className="victory-dxp-label">Game Designer XP</div>
        </div>

        {/* What they built */}
        {built.length > 0 && (
          <div className="victory-systems">
            <div className="victory-sys-label">Systems you built today:</div>
            <div className="victory-sys-tags">
              {built.map(s => <span key={s} className="victory-sys-tag">✓ {s.replace(/_/g,' ')}</span>)}
            </div>
          </div>
        )}

        {/* Secondary stats */}
        <div className="victory-stats">
          {coins > 0 && <div className="victory-stat"><span><EmojiIcon e="🪙" /></span><span>+{coins} collected</span></div>}
          {xp > 0 && <div className="victory-stat"><span><EmojiIcon e="⚡" /></span><span>+{xp} XP</span></div>}
          {medal && <div className="victory-stat"><span>{medal}</span><span>Medal</span></div>}
        </div>

        <button type="button" className="victory-continue" onClick={onDone}>
          Keep building →
        </button>
      </div>

      {/* Confetti */}
      {pieces.map(p => (
        <span key={p.id} className="victory-confetti"
          style={{ left: p.left, animationDelay: p.delay, width: p.size, height: p.size, background: p.color }} />
      ))}
    </div>
  );
}

export function GameFailureScreen({ message, hint, onRetry, onHint }) {
  return (
    <div className="bb-failure-screen">
      <div className="bb-failure-card">
        <div className="failure-robot"><EmojiIcon e="🤖" /></div>
        <div className="failure-emotion"><EmojiIcon e="💫" /></div>
        <h2>Almost there!</h2>
        <p>{message || "Your robot ran into something. That's how we learn — try a different approach!"}</p>
        {hint && <div className="bb-failure-hint"><EmojiIcon e="💡" style={{ marginRight: '0.35em' }} />{hint}</div>}
        <div className="bb-failure-actions">
          <button type="button" className="bb-btn bb-btn-go" onClick={onRetry}><EmojiIcon e="🔄" style={{ marginRight: '0.35em' }} />Try Again</button>
          {onHint && <button type="button" className="bb-btn bb-btn-ghost" onClick={onHint}>Show Hint</button>}
        </div>
      </div>
    </div>
  );
}

/* legacy exports */
export function GameTopBar() { return null; }
export function CodingDrawer({ children }) { return <>{children}</>; }
export function GameBottomHUD() { return null; }
