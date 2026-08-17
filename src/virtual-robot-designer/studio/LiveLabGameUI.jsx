/**
 * LiveLabGameUI.jsx — ByteBuddies Custom Block Palette + Game UI
 */
import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
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
import { isEventHatBlock } from '../data/flappy-starter-script.js';
import { FLAPPY_BLOCK_LIBRARY, isFlappyBirdCourse } from '../data/flappy-bird-blocks.js';
import { FIGHTING_BLOCK_LIBRARY, isFightingCourse, FIGHTING_STARTER_SCRIPT } from '../data/fighting-blocks.js';
import { FOOTBALL_BLOCK_LIBRARY, isFootballCourse, FOOTBALL_STARTER_SCRIPT, FOOTBALL_ROLE_STARTERS, FOOTBALL_TEAM_ROLES } from '../data/football-blocks.js';
import { buildRaceBlockLibrary, isRaceCourse } from '../data/racing-blocks.js';
import { isCarChassis } from '../data/car-racing-tracks.js';
import { CodeRacerTrackCup } from '../racing/CodeRacerTrackCup.jsx';
import { UNIVERSAL_EVENTS_CATEGORY, withUniversalEvents } from '../data/universal-event-blocks.js';
import './LiveLabGame.css';

/** Pick block library — course-scoped palettes; Events always universal */
export function getBlockLibraryForCourse(courseKey, arenaType) {
  if (isFlappyBirdCourse(courseKey, arenaType)) return withUniversalEvents(FLAPPY_BLOCK_LIBRARY);
  if (isFightingCourse(courseKey, arenaType)) return withUniversalEvents(FIGHTING_BLOCK_LIBRARY);
  if (isFootballCourse(courseKey, arenaType)) return withUniversalEvents(FOOTBALL_BLOCK_LIBRARY);
  if (isRaceCourse(courseKey, arenaType)) return buildRaceBlockLibrary(BLOCK_LIBRARY, arenaType);
  return withUniversalEvents(BLOCK_LIBRARY);
}

export { FIGHTING_STARTER_SCRIPT, FOOTBALL_STARTER_SCRIPT };

/* ─── ROBOT GROUP DETECTION ──────────────────────────────────────────────── */
export function getRobotGroup(robotType) {
  if (['drone', 'jet', 'hover', 'racedrone'].includes(robotType)) return 'aerial';
  if (['spider', 'humanoid'].includes(robotType)) return 'walker';
  if (robotType === 'underwater') return 'underwater';
  if (['factory', 'factorybot'].includes(robotType)) return 'arm';
  if (robotType === 'birdbot') return 'birdbot';
  if (['striker', 'blaster', 'ninja', 'berserker'].includes(robotType)) return 'fighter';
  if (['footballbot', 'football'].includes(robotType)) return 'footballbot';
  return 'wheeled';
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
      // UNDERWATER ONLY
      { id:'dive_deep',label:'Dive to depth',icon:'🤿',params:[{key:'depth',label:'m',def:10}],robotGroups:['underwater'] },
      { id:'surface',  label:'Surface to top',icon:'⬆️', robotGroups:['underwater'] },
      { id:'sonar_ping',label:'Sonar ping',  icon:'📡', robotGroups:['underwater'] },
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
function loadStarterBlocks(starterScript) {
  if (!starterScript?.length) return [];
  return starterScript
    .filter((b) => b.id !== 'when_start')
    .map((b) => ({ ...b, _uid: uid(), paramValues: { ...(b.paramValues || {}) } }));
}

export function CustomCodePanel({ robotType, scriptRef, clearRef, onBlockCountChange, onOpenLevels, activeStepIndex = -1, activeBlockUid = '', isRunning = false, starterScript = null, courseKey = '', arenaType = '', eventsFocusKey = 0, teamSize = 1, footballScriptsRef = null, footballActiveRoleRef = null }) {
  const blockLibrary = useMemo(
    () => getBlockLibraryForCourse(courseKey, arenaType),
    [courseKey, arenaType],
  );
  const isFlappy = isFlappyBirdCourse(courseKey, arenaType);
  const isFighting = isFightingCourse(courseKey, arenaType);
  const isFootball = isFootballCourse(courseKey, arenaType);
  const isRacing = isRaceCourse(courseKey, arenaType);
  const multiRobotFootball = isFootball && teamSize >= 3;
  const paletteRobotType = isFootball ? 'footballbot' : (isRacing ? 'rover' : robotType);
  const paletteRobotGroup = getRobotGroup(paletteRobotType || 'rover');
  const [activeRole, setActiveRole] = useState('striker');
  const [script, setScript]       = useState(() => loadStarterBlocks(starterScript));
  const [activeCat, setActiveCat] = useState(
    isFighting ? 'Striker' : isFootball ? 'Football' : isRacing ? 'Track' : 'Events',
  );
  const [search, setSearch]       = useState('');
  const [history, setHistory]     = useState(() => [loadStarterBlocks(starterScript)]);
  const [histIdx, setHistIdx]     = useState(0);
  const [dragIdx, setDragIdx]     = useState(null);
  const [dragOver, setDragOver]   = useState(null);
  const workspaceRef              = useRef(null);
  const paletteRef                = useRef(null);

  const focusEventsCategory = useCallback(() => {
    setActiveCat('Events');
    setSearch('');
    requestAnimationFrame(() => {
      paletteRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }, []);

  const syncScriptRef = useCallback((next) => {
    if (scriptRef) scriptRef.current = next;
    if (multiRobotFootball && footballScriptsRef?.current) {
      footballScriptsRef.current[activeRole] = next;
    }
    onBlockCountChange?.(next.length);
  }, [scriptRef, onBlockCountChange, multiRobotFootball, footballScriptsRef, activeRole]);

  const switchFootballRole = useCallback((roleId) => {
    if (!multiRobotFootball || roleId === activeRole) return;
    if (footballScriptsRef?.current) {
      footballScriptsRef.current[activeRole] = script;
    }
    const next = footballScriptsRef?.current?.[roleId] || loadStarterBlocks(FOOTBALL_ROLE_STARTERS[roleId]);
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
    lastStarterSigRef.current = '';
    setActiveCat(isFight ? 'Striker' : isFootballMode ? 'Football' : isRacingMode ? 'Track' : 'Events');
    setSearch('');
    requestAnimationFrame(() => {
      paletteRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }, [robotType, courseKey, arenaType, eventsFocusKey]);

  useEffect(() => {
    if (!multiRobotFootball) return;
    const loaded = {};
    for (const role of FOOTBALL_TEAM_ROLES) {
      loaded[role.id] = loadStarterBlocks(FOOTBALL_ROLE_STARTERS[role.id]);
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

    const loaded = starterScript
      .filter((b) => b.id !== 'when_start')
      .map((b) => ({ ...b, _uid: uid(), paramValues: { ...(b.paramValues || {}) } }));
    lastCourseKeyRef.current = courseKey;
    syncScriptRef(loaded);
    setScript(loaded);
    setHistory([loaded]);
    setHistIdx(0);
  }, [starterScript, courseKey, arenaType, syncScriptRef, multiRobotFootball]);

  // ── History ─────────────────────────────────────────────────────────────
  const commit = useCallback((next) => {
    syncScriptRef(next);
    setHistory(h => [...h.slice(0, histIdx + 1), next].slice(-60));
    setHistIdx(i => i + 1);
    setScript(next);
  }, [histIdx, syncScriptRef]);

  const undo = useCallback(() => {
    setHistIdx(i => {
      const n = Math.max(0, i - 1);
      const next = history[n] || [];
      syncScriptRef(next);
      setScript(next);
      return n;
    });
  }, [history, syncScriptRef]);

  const redo = useCallback(() => {
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
  const filteredCats = useMemo(() => {
    const cats = Object.entries(blockLibrary).map(([key, cat]) => ({
      key,
      ...cat,
      blocks: (cat.blocks || []).filter((b) => {
        const groupOk = key === 'Events' || !b.robotGroups
          || b.robotGroups.includes(paletteRobotGroup)
          || b.robotGroups.includes(paletteRobotType);
        const searchOk = !search || b.label.toLowerCase().includes(search.toLowerCase());
        return groupOk && searchOk;
      }),
    })).filter((c) => c.blocks.length > 0);

    // Events must always be present for every robot
    const eventsCat = cats.find((c) => c.key === 'Events');
    if (!eventsCat || eventsCat.blocks.length !== UNIVERSAL_EVENTS_CATEGORY.blocks.length) {
      const merged = cats.filter((c) => c.key !== 'Events');
      merged.unshift({ key: 'Events', ...UNIVERSAL_EVENTS_CATEGORY });
      return merged;
    }
    return cats;
  }, [blockLibrary, paletteRobotGroup, paletteRobotType, search]);

  const paletteBlocks = useMemo(() => {
    if (search) return filteredCats.flatMap(c => c.blocks.map(b => ({ ...b, catKey: c.key, catColor: c.color })));
    if (activeCat === 'Events' && !search) {
      return UNIVERSAL_EVENTS_CATEGORY.blocks.map((b) => ({
        ...b,
        catKey: 'Events',
        catColor: UNIVERSAL_EVENTS_CATEGORY.color,
      }));
    }
    const cat = filteredCats.find(c => c.key === activeCat) || filteredCats[0];
    return (cat?.blocks || []).map(b => ({ ...b, catKey: cat?.key, catColor: cat?.color }));
  }, [filteredCats, activeCat, search]);

  const categoryRail = useMemo(() => {
    const entries = Object.entries(blockLibrary);
    entries.sort((a, b) => {
      if (a[0] === 'Events') return -1;
      if (b[0] === 'Events') return 1;
      if (a[0] === 'Track') return -1;
      if (b[0] === 'Track') return 1;
      return 0;
    });
    return entries;
  }, [blockLibrary]);

  const canUndo = histIdx > 0;
  const canRedo = histIdx < history.length - 1;

  return (
    <div className="scratch-panel">
      <div className="scratch-panel-banner">
        <span className="scratch-panel-banner-icon">⚡</span>
        <div>
          <div className="scratch-panel-banner-title">
            {multiRobotFootball ? 'Code Your Team' : isRacing ? 'Racing Blocks' : 'Event Blocks'}
          </div>
          <div className="scratch-panel-banner-sub">
            {multiRobotFootball
              ? 'Switch tabs to program each robot on your green team'
              : isRacing
                ? 'Track tab has named turns for this circuit — Racing tab has all driving blocks'
                : 'Click a block below to add code'}
          </div>
        </div>
      </div>
      <div className="scratch-panel-body">
      {/* ══ LEFT: CATEGORY RAIL ════════════════════════════════════════════ */}
      <nav className="scratch-cat-rail">
        {categoryRail.map(([key, cat]) => {
          const visible = key === 'Events'
            ? UNIVERSAL_EVENTS_CATEGORY.blocks
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
              <span className="scratch-cat-icon">{cat.icon}</span>
              <span className="scratch-cat-label">{cat.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ══ CENTER: BLOCK PALETTE ══════════════════════════════════════════ */}
      <div className="scratch-palette" ref={paletteRef}>
        <div className="scratch-search-wrap">
          <span className="scratch-search-icon">🔍</span>
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
            <span>{blockLibrary[activeCat]?.icon}</span>
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
              className="scratch-pal-block"
              style={{ '--cat-c': block.catColor || '#555' }}
              onClick={() => addBlock(block.catKey, block)}
              title={block.robotGroups ? `${block.robotGroups[0]} only` : ''}
            >
              <span className="scratch-pal-block-row">
                <span className="scratch-blk-icon">{block.icon}</span>
                <span className="scratch-blk-text">{block.label}</span>
                {block.params?.length > 0 && (
                  <span className="scratch-blk-param">
                    {block.params.map(p => (
                      <span key={p.key} className="scratch-blk-val">{block.paramValues?.[p.key] ?? p.def}</span>
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
        {multiRobotFootball && (
          <div className="football-role-tabs">
            {FOOTBALL_TEAM_ROLES.map((role) => (
              <button
                key={role.id}
                type="button"
                className={`football-role-tab${activeRole === role.id ? ' active' : ''}`}
                style={{ '--role-c': role.color }}
                onClick={() => switchFootballRole(role.id)}
                title={`Program ${role.label} #${role.number}`}
              >
                <span className="football-role-tab-icon">{role.icon}</span>
                <span className="football-role-tab-label">{role.label}</span>
                <span className="football-role-tab-num">#{role.number}</span>
              </button>
            ))}
          </div>
        )}
        <div className="scratch-ws-toolbar">
          <button className="scratch-tool-btn" onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">↩</button>
          <button className="scratch-tool-btn" onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)">↪</button>
          {script.length > 0 && (
            <button className="scratch-tool-btn scratch-clear-btn" onClick={() => commit([])} title="Clear all">🗑️</button>
          )}
          <div className="scratch-ws-spacer" />
          <span className="scratch-block-count">{script.length} block{script.length !== 1 ? 's' : ''}</span>
          <button className="scratch-mission-btn" onClick={onOpenLevels} title="Choose mission">🎮 Mission</button>
        </div>

        <div className="scratch-ws-canvas" ref={workspaceRef} onDragOver={e => e.preventDefault()}>
          <div className="scratch-anchor-block">
            <span className="scratch-blk-icon">▶️</span>
            <span className="scratch-blk-text">When START clicked</span>
          </div>

          {script.length === 0 ? (
            <div className="scratch-ws-empty">
              <div className="scratch-ws-empty-arrow">⬇</div>
              <div className="scratch-ws-empty-txt">
                {courseKey === 'flappy_bird'
                  ? 'Add When spacebar clicked, then put Flap! underneath — press Simulate, then hit spacebar!'
                  : isFootball
                    ? multiRobotFootball
                      ? `Program your ${FOOTBALL_TEAM_ROLES.find((r) => r.id === activeRole)?.label || 'robot'} — starter blocks load automatically`
                      : 'Starter blocks load automatically — add Football blocks below When START clicked'
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
                const isExecuting = isRunning && (uidMatch || (activeStepIndex === i && !activeBlockUid));
                const isCompleted = isRunning && activeStepIndex > i && !uidMatch;
                const isHat = isEventHatBlock(blk.id);
                return (
                  <div
                    key={blk._uid}
                    className={`scratch-script-block${isHat ? ' event-hat' : ''}${dragIdx === i ? ' dragging' : ''}${dragOver === i ? ' drag-over' : ''}${isExecuting ? ' executing' : ''}${isCompleted ? ' completed' : ''}`}
                    style={{ '--cat-c': catColor, '--exec-c': catColor }}
                    draggable
                    onDragStart={e => onDragStart(e, i)}
                    onDragEnter={() => onDragEnter(i)}
                    onDragLeave={() => setDragOver(null)}
                    onDrop={e => onDrop(e, i)}
                    onDragEnd={() => { setDragIdx(null); setDragOver(null); }}
                  >
                    <div className="scratch-script-grip">⠿</div>
                    <div className="scratch-script-body">
                      <span className="scratch-blk-icon">{blk.icon}</span>
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
              🗑️ Drop here to delete
            </div>
          )}
        </div>
      </div>
      </div>
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
          <button type="button" className="bb-sidebar-level-btn" onClick={onOpenLevels}>🎮</button>
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
  simulation:  { icon: '⚙️', label: 'Simulation',        color: '#06b6d4' },
  exploration: { icon: '🔭', label: 'Exploration',       color: '#0ea5e9' },
  football:    { icon: '⚽', label: 'Robot Football',    color: '#16A34A' },
  combat:      { icon: '🥊', label: 'Combat Academy',  color: '#ef4444' },
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
    if (story?.objectives?.length) return story.objectives;
    return resolveCourseObjectives(challenge, story || {});
  }, [story, challenge]);

  const progress = useMemo(
    () => deriveMissionProgress(challenge, stats, zoneInfo),
    [challenge, stats, zoneInfo],
  );

  const primaryObj = objectives[0] || challenge?.winCondition || 'Reach the goal zone';
  const subObjs = objectives.slice(1);

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

      {!compact && (
      <>
      {/* Sub-objectives */}
      <ul className="mcp-v2-subobjectives">
        {subObjs.slice(0, 4).map((o, i) => {
          const done = isSubObjectiveMet(o, { stats, zoneInfo, challenge, totalZones, zonesDone });
          return (
          <li key={i} className={`mcp-v2-subobj${done ? ' done' : ''}`}>
            <span className="mcp-v2-subobj-icon">{done ? '✅' : subObjIcons[i] || '○'}</span>
            <span className="mcp-v2-subobj-text">{o}</span>
          </li>
          );
        })}
      </ul>

      {/* Action buttons */}
      <div className="mcp-v2-actions">
        {onRestart && (
          <button type="button" className="mcp-v2-btn" onClick={onRestart}>
            <span>↺</span> Restart
          </button>
        )}
        <button type="button" className="mcp-v2-btn" disabled>
          <span>📷</span> Camera
        </button>
        <button type="button" className="mcp-v2-btn" disabled>
          <span>&lt;/&gt;</span> Show Code
        </button>
        <button type="button" className="mcp-v2-btn" disabled>
          <span>⚙</span> Settings
        </button>
      </div>
      </>
      )}

      {/* Expanded detail section */}
      {!compact && expanded && (
        <div className="mcp-expanded">
          {(story?.story || challenge?.desc) && (
            <div className="mcp-story-block">
              <div className="mcp-story-label">STORY</div>
              <p className="mcp-story-text">{story?.story || challenge?.desc}</p>
            </div>
          )}
          <div className="mcp-stats-row">
            <div className="mcp-stat-chip">
              <span>🔋</span>
              <span style={{ color: stats.battery > 40 ? '#4ade80' : '#fbbf24' }}>{Math.round(stats.battery)}%</span>
            </div>
            <div className="mcp-stat-chip">
              <span>💎</span>
              <span style={{ color: '#fbbf24' }}>{stats.collected || 0}</span>
            </div>
            <div className="mcp-stat-chip">
              <span>📏</span>
              <span>{(stats.dist || 0).toFixed(1)}m</span>
            </div>
          </div>
          {(story?.tip || challenge?.codeHint) && (
            <div className="mcp-tip">💡 {story?.tip || challenge?.codeHint}</div>
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
  const isRace = stats.raceMode || isRaceCourse(challenge?.id, challenge?.arenaType) || challenge?.arenaType === 'time_trial_gauntlet';
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
          <span className="bb-fhud-icon">🏆</span>
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
      />
    );
  }
  if (challenge?.isRobotMission) {
    return <MissionCampaignHUD stats={stats} challenge={challenge} />;
  }
  return (
    <div className="bb-float-hud">
      <div className="bb-fhud-stat">
        <span className="bb-fhud-icon">🔋</span>
        <span className="bb-fhud-val" style={{ color: battColor }}>{Math.round(stats.battery)}%</span>
        <span className="bb-fhud-lbl">Battery</span>
      </div>
      <div className="bb-fhud-sep" />
      <div className="bb-fhud-stat">
        <span className="bb-fhud-icon">💎</span>
        <span className="bb-fhud-val" style={{ color: '#fbbf24' }}>{coins}</span>
        <span className="bb-fhud-lbl">Coins</span>
      </div>
      <div className="bb-fhud-sep" />
      <div className="bb-fhud-stat">
        <span className="bb-fhud-icon">🔄</span>
        <span className="bb-fhud-val">{speed}</span>
        <span className="bb-fhud-lbl">m/s</span>
      </div>
      <div className="bb-fhud-sep" />
      <div className="bb-fhud-stat">
        <span className="bb-fhud-icon">🗺️</span>
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
        🏆 {earnedCount}/{entries.length}
      </button>
    );
  }

  return (
    <div className="cmb-bar">
      <span className="cmb-label">🏆 Challenge Mode</span>
      {entries.map(([tier, meta]) => {
        const m = medals[tier];
        const earned = !!m.check?.(stats);
        return (
          <div key={tier} className={`cmb-card${earned ? ' cmb-earned' : ''}`} style={earned ? { borderColor: meta.color } : undefined}>
            <span className="cmb-icon">{meta.icon}</span>
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
  combat:         { label: 'Combat Arena',         icon: '🥊', blurb: 'Training, sparring, tournaments & boss fights', color: '#ef4444' },
  football:       { label: 'Robot Football',       icon: '⚽', blurb: '1v1 skills matches & championship football', color: '#16A34A' },
};

/** Rich hero card — same layout as Story World missions (racing-parity) */
function MissionHeroCard({ course, robotName, gradient, metaColor, isSel, onSelect, onClose }) {
  const best = course.isRobotMission
    ? (RobotMissionProgress.getMission(robotName || 'Robot', course.robotMissionId || course.id).xpEarned || 0)
    : GameProgress.getBest(robotName || 'Robot', course.id);
  const designerXp = best > 0 ? Math.round(best * 1.5) : 0;
  const genre = GENRE_META[course.genre] || GENRE_META.adventure;
  const heroBg = gradient || worldArt(course).bg;
  const zoneCount = course.zones || course.zoneCount || (course.isRobotMission ? 1 : 10);
  return (
    <button
      type="button"
      className={`gls-mission-card${isSel ? ' playing' : ''}`}
      style={{ '--mc': course.color || metaColor }}
      onClick={() => { onSelect(course); onClose(); }}
    >
      <div className="gls-mc-hero" style={{ background: heroBg }}>
        <span className="gls-mc-icon">{course.icon}</span>
        {isSel && <span className="gls-mc-playing">▶ PLAYING</span>}
        {course.isGameMission && <span className="bb-level-featured gls-mc-badge">🎮 GAME BUILD</span>}
        {course.isRobotMission && <span className="bb-level-featured gls-mc-badge">📋 CAMPAIGN</span>}
        {course.isFlagship && <span className="bb-level-featured gls-mc-badge">🎓 FLAGSHIP</span>}
        <span className="gls-genre-badge" style={{ background: genre.color }}>
          {genre.icon} {genre.label}
        </span>
      </div>
      <div className="gls-mc-body">
        <div className="gls-mc-name">{course.name}</div>
        <div className="gls-mc-story">{course.tagline || course.desc}</div>
        {course.systemsBuilt?.length > 0 && (
          <div className="gls-mc-systems">
            <span className="gls-sys-label">You'll build:</span>
            {course.systemsBuilt.slice(0, 5).map((s) => (
              <span key={s} className="gls-sys-tag">{s.replace(/_/g, ' ')}</span>
            ))}
          </div>
        )}
        <div className="gls-mc-foot">
          <span className="gls-mc-zones">📍 {zoneCount} zone{zoneCount !== 1 ? 's' : ''}</span>
          {course.laps && <span className="gls-mc-time">🏁 {course.laps} lap{course.laps !== 1 ? 's' : ''}</span>}
          {course.checkpoints && <span className="gls-mc-time">🚩 {course.checkpoints} CP</span>}
          {course.estMinutes && <span className="gls-mc-time">⏱ ~{course.estMinutes} min</span>}
          {designerXp > 0
            ? <span className="gls-mc-xp">🎮 {designerXp} Designer XP</span>
            : <span className="gls-mc-new">✨ NEW</span>}
        </div>
      </div>
    </button>
  );
}

export function GameLevelSelect({ courses, currentId, robotName, robotType, chassisId, currentArenaType, strictChassisModes, onSelect, onSelectBiomeTrack, onClose }) {
  const [search, setSearch] = useState('');
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
      const bucket = catalogDiff.includes('Tutorial') || catalogDiff === 'Easy' ? 'Easy'
        : catalogDiff === 'Medium' ? 'Medium'
        : catalogDiff === 'Hard' || catalogDiff === 'Expert' ? 'Hard'
        : (c.totalDist > 40 ? 'Hard' : c.totalDist > 25 ? 'Medium' : 'Easy');
      if (bucket !== filter) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      return (c.name || '').toLowerCase().includes(q) || (c.desc || '').toLowerCase().includes(q) || (c.tagline || '').toLowerCase().includes(q);
    }
    return true;
  };

  const isFiltering = search.length > 0 || filter !== 'all';

  // Build all-courses flat list for search mode
  const allFlat = useMemo(() => courses.filter(matchesCourse), [courses, search, filter]);

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
      gradient={gradient || worldArt(course).bg}
      metaColor={metaColor || course.color}
      isSel={course.id === currentId}
      onSelect={onSelect}
      onClose={onClose}
    />
  );

  const SectionHead = ({ icon, title, subtitle, color }) => (
    <div className="gls-sec-head" style={{ '--sh': color || '#7c3aed' }}>
      <span className="gls-sec-icon">{icon}</span>
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
            <span className="gls-title">🎮 Choose Mission</span>
            <span className="gls-sub">
              {robotName} · {courses.length} game mode{courses.length !== 1 ? 's' : ''}
              {strictChassisModes ? ' · chassis-exclusive' : ' · ⚡ Event blocks stay on the left'}
            </span>
          </div>
          <div className="gls-header-right">
            <div className="gls-search-wrap">
              <span className="gls-search-icon">🔍</span>
              <input
                className="gls-search"
                type="text"
                placeholder="Search missions…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && <button type="button" className="gls-search-clear" onClick={() => setSearch('')}>×</button>}
            </div>
            {['all','Easy','Medium','Hard'].map(d => (
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
                    <span className="gls-sec-icon">🔍</span>
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
              {isCarChassis(chassisId) && onSelectBiomeTrack && (
                <section className="gls-section gls-cup-section">
                  <SectionHead
                    icon="🏎️"
                    title="CodeRacer Cup"
                    subtitle="10 Mario Kart circuits — tap any track to jump straight in"
                    color="#6366f1"
                  />
                  <CodeRacerTrackCup
                    variant="inline"
                    arenaType={currentArenaType || courses.find((c) => c.id === currentId)?.arenaType}
                    onSelect={(course) => {
                      onSelectBiomeTrack(course);
                      onClose();
                    }}
                  />
                </section>
              )}
              <section className="gls-section">
                <SectionHead
                  icon="🤖"
                  title="Game Modes"
                  subtitle={`10 rover modes — each mode maps to a cup track above`}
                  color="#7c3aed"
                />
                <div className="gls-card-grid">
                  {courses.map((c, i) => renderCard({
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
                  }))}
                </div>
              </section>
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
                            <span>{meta.icon}</span>
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
                            <span>{meta.icon}</span>
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
        <div className="victory-burst">🎮</div>
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
          {coins > 0 && <div className="victory-stat"><span>🪙</span><span>+{coins} collected</span></div>}
          {xp > 0 && <div className="victory-stat"><span>⚡</span><span>+{xp} XP</span></div>}
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
        <div className="failure-robot">🤖</div>
        <div className="failure-emotion">💫</div>
        <h2>Almost there!</h2>
        <p>{message || "Your robot ran into something. That's how we learn — try a different approach!"}</p>
        {hint && <div className="bb-failure-hint">💡 {hint}</div>}
        <div className="bb-failure-actions">
          <button type="button" className="bb-btn bb-btn-go" onClick={onRetry}>🔄 Try Again</button>
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
