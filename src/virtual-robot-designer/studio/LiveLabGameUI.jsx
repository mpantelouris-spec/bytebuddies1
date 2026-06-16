/**
 * LiveLabGameUI.jsx — ByteBuddies Custom Block Palette + Game UI
 */
import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { GameProgress } from '../services/game-progress.js';
import { FLAGSHIP_WORLD_SECTIONS } from '../data/flagship-courses.js';
import { MISSION_GENRE_SECTIONS } from '../data/game-missions.js';
import './LiveLabGame.css';

/* ─── ROBOT GROUP DETECTION ──────────────────────────────────────────────── */
export function getRobotGroup(robotType) {
  if (['drone','jet','hover','racedrone'].includes(robotType)) return 'aerial';
  if (['spider','humanoid'].includes(robotType))              return 'walker';
  if (['underwater'].includes(robotType))                     return 'underwater';
  if (['factory','factorybot'].includes(robotType))           return 'arm';
  return 'wheeled';
}

/* ─── BLOCK LIBRARY ──────────────────────────────────────────────────────── */
export const BLOCK_LIBRARY = {
  Events: {
    label: 'Events', color: '#ef4444', icon: '⚡',
    blocks: [
      { id:'when_start',    label:'When START clicked',      icon:'▶️' },
      { id:'when_zone',     label:'When zone reached',       icon:'📍' },
      { id:'when_collect',  label:'When item collected',     icon:'✨' },
      { id:'when_collision',label:'When collision detected', icon:'💥' },
      { id:'when_sensor',   label:'When sensor triggers',    icon:'📡' },
      { id:'when_timer',    label:'When timer reaches',      icon:'⏱️', params:[{key:'seconds',label:'s',def:5}] },
      { id:'when_battery',  label:'When battery below',      icon:'🔋', params:[{key:'percent',label:'%',def:20}] },
    ]
  },
  Movement: {
    label: 'Movement', color: '#3b82f6', icon: '🚀',
    blocks: [
      { id:'move_forward',  label:'Move forward',   icon:'⬆️', params:[{key:'steps',label:'steps',def:3}] },
      { id:'move_backward', label:'Move backward',  icon:'⬇️', params:[{key:'steps',label:'steps',def:3}] },
      { id:'turn_left',     label:'Turn left',      icon:'↺',  params:[{key:'degrees',label:'°',def:90}] },
      { id:'turn_right',    label:'Turn right',     icon:'↻',  params:[{key:'degrees',label:'°',def:90}] },
      { id:'set_speed',     label:'Set speed',      icon:'⚡', params:[{key:'speed',label:'%',def:50}] },
      { id:'boost',         label:'Boost for',      icon:'🚀', params:[{key:'seconds',label:'s',def:2}] },
      { id:'stop',          label:'Stop',           icon:'⏹️' },
      { id:'spin',          label:'Spin around',    icon:'🌀', params:[{key:'degrees',label:'°',def:360}] },
      { id:'orbit',         label:'Orbit target',   icon:'🔄', params:[{key:'times',label:'×',def:3}] },
      // AERIAL ONLY
      { id:'fly_up',    label:'Fly up',     icon:'🛫', params:[{key:'height',label:'m',def:5}],  robotGroups:['aerial'] },
      { id:'fly_down',  label:'Fly down',   icon:'🛬', params:[{key:'height',label:'m',def:5}],  robotGroups:['aerial'] },
      { id:'hover_hold',label:'Hover for',  icon:'🛸', params:[{key:'seconds',label:'s',def:3}], robotGroups:['aerial'] },
      { id:'bank_left', label:'Bank left',  icon:'↰',  params:[{key:'degrees',label:'°',def:30}],robotGroups:['aerial'] },
      { id:'bank_right',label:'Bank right', icon:'↱',  params:[{key:'degrees',label:'°',def:30}],robotGroups:['aerial'] },
      { id:'dive',      label:'Dive at angle', icon:'📉',params:[{key:'degrees',label:'°',def:45}],robotGroups:['aerial'] },
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
    ]
  },
  Loops: {
    label: 'Loops', color: '#f59e0b', icon: '🔁',
    blocks: [
      { id:'repeat',     label:'Repeat',      icon:'🔁', params:[{key:'times',label:'×',def:3}] },
      { id:'forever',    label:'Forever loop', icon:'∞' },
      { id:'wait',       label:'Wait',         icon:'⏸️', params:[{key:'seconds',label:'s',def:1}] },
      { id:'wait_until', label:'Wait until done', icon:'⌛' },
    ]
  },
  Sensors: {
    label: 'Sensors', color: '#10b981', icon: '👁',
    blocks: [
      { id:'obstacle_ahead', label:'If obstacle ahead',    icon:'🚧' },
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
      { id:'avoid_obstacle',label:'Avoid all obstacles',icon:'🛡️' },
      { id:'follow_line',   label:'Follow path line',   icon:'〰️', params:[{key:'steps',label:'steps',def:5}] },
    ]
  },
  Variables: {
    label: 'Variables', color: '#06b6d4', icon: '📦',
    blocks: [
      { id:'set_var',    label:'Set score to',    icon:'=', params:[{key:'value',label:'',def:0}] },
      { id:'change_var', label:'Change score by', icon:'+', params:[{key:'value',label:'',def:1}] },
    ]
  },
  AI: {
    label: 'AI', color: '#ec4899', icon: '🤖',
    blocks: [
      { id:'patrol_area',   label:'Patrol area',     icon:'🔄', params:[{key:'laps',label:'laps',def:2}] },
      { id:'return_home',   label:'Return home',     icon:'🏠' },
      { id:'search_area',   label:'Search area',     icon:'🔍', params:[{key:'radius',label:'m',def:3}] },
      { id:'follow_target', label:'Follow target',   icon:'🎯', params:[{key:'steps',label:'steps',def:4}] },
      { id:'navigate_goal', label:'Navigate to goal',icon:'🏁' },
      { id:'auto_collect',  label:'Auto-collect items',icon:'🧲' },
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
export function CustomCodePanel({ robotType, scriptRef, clearRef, onBlockCountChange, onOpenLevels, activeStepIndex = -1, isRunning = false }) {
  const robotGroup = getRobotGroup(robotType || 'rover');
  const [script, setScript]       = useState([]);
  const [activeCat, setActiveCat] = useState('Events');
  const [search, setSearch]       = useState('');
  const [history, setHistory]     = useState([[]]);
  const [histIdx, setHistIdx]     = useState(0);
  const [dragIdx, setDragIdx]     = useState(null);
  const [dragOver, setDragOver]   = useState(null);
  const workspaceRef              = useRef(null);

  // ── Expose to parent ────────────────────────────────────────────────────
  useEffect(() => {
    if (scriptRef) scriptRef.current = script;
    onBlockCountChange?.(script.length);
  }, [script, scriptRef, onBlockCountChange]);

  useEffect(() => {
    if (clearRef) clearRef.current = () => { setScript([]); setHistory([[]]); setHistIdx(0); };
  }, [clearRef]);

  // ── History ─────────────────────────────────────────────────────────────
  const commit = useCallback((next) => {
    setHistory(h => [...h.slice(0, histIdx + 1), next].slice(-60));
    setHistIdx(i => i + 1);
    setScript(next);
  }, [histIdx]);

  const undo = useCallback(() => {
    setHistIdx(i => { const n = Math.max(0, i - 1); setScript(history[n]); return n; });
  }, [history]);

  const redo = useCallback(() => {
    setHistIdx(i => { const n = Math.min(history.length - 1, i + 1); setScript(history[n]); return n; });
  }, [history]);

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
    const params = {};
    (block.params || []).forEach(p => { params[p.key] = p.def ?? 0; });
    const next = [...script, { ...block, catKey, _uid: uid(), paramValues: params }];
    commit(next);
    setTimeout(() => { if (workspaceRef.current) workspaceRef.current.scrollTop = workspaceRef.current.scrollHeight; }, 30);
  }, [script, commit]);

  const removeBlock = useCallback((id) => commit(script.filter(b => b._uid !== id)), [script, commit]);

  const updateParam = useCallback((id, key, val) => {
    setScript(s => s.map(b => b._uid === id ? { ...b, paramValues: { ...b.paramValues, [key]: +val } } : b));
  }, []);

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
  const filteredCats = useMemo(() => (
    Object.entries(BLOCK_LIBRARY).map(([key, cat]) => ({
      key, ...cat,
      blocks: cat.blocks.filter(b => {
        const groupOk = !b.robotGroups || b.robotGroups.includes(robotGroup);
        const searchOk = !search || b.label.toLowerCase().includes(search.toLowerCase());
        return groupOk && searchOk;
      }),
    })).filter(c => c.blocks.length > 0)
  ), [robotGroup, search]);

  const paletteBlocks = useMemo(() => {
    if (search) return filteredCats.flatMap(c => c.blocks.map(b => ({ ...b, catKey: c.key, catColor: c.color })));
    const cat = filteredCats.find(c => c.key === activeCat) || filteredCats[0];
    return (cat?.blocks || []).map(b => ({ ...b, catKey: cat?.key, catColor: cat?.color }));
  }, [filteredCats, activeCat, search]);

  const canUndo = histIdx > 0;
  const canRedo = histIdx < history.length - 1;

  return (
    <div className="scratch-panel">
      {/* ══ LEFT: CATEGORY RAIL ════════════════════════════════════════════ */}
      <nav className="scratch-cat-rail">
        {Object.entries(BLOCK_LIBRARY).map(([key, cat]) => {
          const visible = cat.blocks.filter(b => !b.robotGroups || b.robotGroups.includes(robotGroup));
          if (!visible.length) return null;
          const isActive = activeCat === key && !search;
          return (
            <button
              key={key}
              type="button"
              className={`scratch-cat-btn${isActive ? ' active' : ''}`}
              style={{ '--cat-c': cat.color }}
              onClick={() => { setActiveCat(key); setSearch(''); }}
              title={cat.label}
            >
              <span className="scratch-cat-icon">{cat.icon}</span>
              <span className="scratch-cat-label">{cat.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ══ CENTER: BLOCK PALETTE ══════════════════════════════════════════ */}
      <div className="scratch-palette">
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
          <div className="scratch-pal-header" style={{ '--cat-c': BLOCK_LIBRARY[activeCat]?.color || '#555' }}>
            <span>{BLOCK_LIBRARY[activeCat]?.icon}</span>
            <span>{BLOCK_LIBRARY[activeCat]?.label || activeCat}</span>
          </div>
        )}
        <div className="scratch-pal-blocks">
          {paletteBlocks.map(block => (
            <button
              key={block.id + (block.catKey || '')}
              type="button"
              className="scratch-pal-block"
              style={{ '--cat-c': block.catColor || '#555' }}
              onClick={() => addBlock(block.catKey, block)}
              title={block.robotGroups ? `${block.robotGroups[0]} only` : ''}
            >
              <span className="scratch-blk-icon">{block.icon}</span>
              <span className="scratch-blk-text">{block.label}</span>
              {block.params?.length > 0 && (
                <span className="scratch-blk-param">
                  {block.params.map(p => <span key={p.key} className="scratch-blk-val">{p.def}</span>)}
                </span>
              )}
              {block.robotGroups && <span className="scratch-blk-tag">{block.robotGroups[0]}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* ══ RIGHT: WORKSPACE ═══════════════════════════════════════════════ */}
      <div className="scratch-workspace">
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
              <div className="scratch-ws-empty-txt">Click a block on the left to add it here</div>
            </div>
          ) : (
            <div className="scratch-script-stack">
              {script.map((blk, i) => {
                const catColor = BLOCK_LIBRARY[blk.catKey]?.color || '#4c97ff';
                const isExecuting = isRunning && activeStepIndex === i;
                const isCompleted = isRunning && activeStepIndex > i;
                return (
                  <div
                    key={blk._uid}
                    className={`scratch-script-block${dragIdx === i ? ' dragging' : ''}${dragOver === i ? ' drag-over' : ''}${isExecuting ? ' executing' : ''}${isCompleted ? ' completed' : ''}`}
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
                        <label key={p.key} className="scratch-param-wrap">
                          <input
                            type="number"
                            className="scratch-param-input"
                            value={blk.paramValues?.[p.key] ?? p.def}
                            onClick={e => e.stopPropagation()}
                            onChange={e => updateParam(blk._uid, p.key, e.target.value)}
                          />
                          {p.label && <span className="scratch-param-unit">{p.label}</span>}
                        </label>
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
  return WORLD_ART[key] || WORLD_ART.default;
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
};

const ZONE_NAMES = [
  'Intro World',   'First Mechanic', 'First Trigger', 'Expand System',
  'Mini Challenge','New Concept',    'Complex Logic',  'Boss Puzzle',
  'Final Test',    'Create Your Game',
];

/* ─── MISSION OVERLAY ────────────────────────────────────────────────────── */
export function MissionControlPanel({ challenge, profile, robotConfig, stats, robotXp, zoneInfo, story, onEndMission }) {
  const [expanded, setExpanded] = useState(false);
  const done        = stats.progress >= 100;
  const totalZones  = challenge?.zones || (challenge?.isFoxChase ? 9 : Math.ceil((challenge?.totalDist || 30) / 5));
  const zonesCleared = zoneInfo?.num ? zoneInfo.num - 1 : Math.floor((stats.progress / 100) * totalZones);
  const currentZone  = zoneInfo?.num || 1;
  const genre        = GENRE_META[challenge?.genre] || GENRE_META.adventure;
  const systemsBuilt = challenge?.systemsBuilt || [];

  const objectives = story?.objectives?.length ? story.objectives
    : challenge?.gameObjectives?.length ? challenge.gameObjectives
    : challenge?.winCondition ? [challenge.winCondition]
    : ['Build your systems', 'Collect energy items', 'Reach the goal'];

  const designerXp = Math.round((stats.progress / 100) * (robotXp || 120));

  return (
    <aside className={`mcp-panel${expanded ? ' expanded' : ''}`}>
      {/* World identity strip */}
      <div className="mcp-world-strip" style={{ background: challenge?.color || genre.color }}>
        <span className="mcp-world-icon">{challenge?.icon || genre.icon}</span>
        <div className="mcp-world-info">
          <div className="mcp-genre-badge" style={{ background: genre.color }}>{genre.icon} {genre.label}</div>
          <div className="mcp-world-name">{challenge?.name || 'Adventure'}</div>
        </div>
        <button type="button" className="mcp-toggle" onClick={() => setExpanded(e => !e)}>
          {expanded ? '✕' : 'ⓘ'}
        </button>
      </div>

      {/* Zone journey bar */}
      <div className="mcp-zones">
        {Array.from({ length: Math.min(totalZones, 10) }, (_, i) => (
          <div
            key={i}
            className={`mcp-zone-pip${i < zonesCleared ? ' cleared' : i === zonesCleared ? ' active' : ''}`}
            title={ZONE_NAMES[i] || `Zone ${i + 1}`}
          >
            {i < zonesCleared ? '✓' : i + 1}
          </div>
        ))}
      </div>

      {/* Current zone label */}
      <div className="mcp-current-zone">
        <span className="mcp-zone-now">
          {zonesCleared < totalZones
            ? `Zone ${zonesCleared + 1}: ${ZONE_NAMES[zonesCleared] || 'Building…'}`
            : '🎉 All zones complete!'}
        </span>
        <span className="mcp-designer-xp">🎮 {designerXp} Designer XP</span>
      </div>

      {/* Progress bar */}
      <div className="mcp-progress-bar">
        <div className="mcp-progress-fill" style={{ width: `${stats.progress}%`, background: challenge?.color || '#4ade80' }} />
      </div>

      {/* Objectives */}
      <ul className="mcp-objectives">
        {objectives.slice(0, 3).map((o, i) => (
          <li key={i} className={`mcp-obj${i < zonesCleared ? ' done' : ''}`}>
            <span className="mcp-obj-check">{i < zonesCleared ? '✓' : '○'}</span>
            <span>{o}</span>
          </li>
        ))}
      </ul>

      {expanded && (
        <div className="mcp-expanded">
          {/* Story hook */}
          {(story?.story || challenge?.desc) && (
            <div className="mcp-story-block">
              <div className="mcp-story-label">THE STORY</div>
              <p className="mcp-story-text">{story?.story || challenge?.desc}</p>
            </div>
          )}

          {/* Systems being built */}
          {systemsBuilt.length > 0 && (
            <div className="mcp-systems-block">
              <div className="mcp-systems-label">SYSTEMS YOU'RE BUILDING</div>
              <div className="mcp-systems-tags">
                {systemsBuilt.map(s => (
                  <span key={s} className="mcp-sys-tag">{s.replace(/_/g, ' ')}</span>
                ))}
              </div>
            </div>
          )}

          {/* Live stats */}
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
              <span>{stats.dist.toFixed(1)}m</span>
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
export function StatsBar({ stats, zoneInfo, challenge, isRunning, fps }) {
  const coins      = stats.collectedValue || stats.collected || 0;
  const speed      = stats.time > 0.1 ? (stats.dist / stats.time).toFixed(1) : '0.0';
  const battColor  = stats.battery > 60 ? '#4ade80' : stats.battery > 30 ? '#fbbf24' : '#ef4444';
  const totalZones = challenge?.isFoxChase ? 9 : Math.ceil((challenge?.totalDist || 30) / 5);
  const currentZone = zoneInfo?.num || 0;
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
};

export function GameLevelSelect({ courses, currentId, robotName, onSelect, onClose }) {
  const [tab, setTab]         = useState('worlds');   // 'worlds' | 'all'
  const [filter, setFilter]   = useState('all');
  const [activeWorld, setActiveWorld] = useState(null);

  // Story world courses
  const storyCourses = courses.filter(c => STORY_WORLDS[c.cat]);
  const storyWorldKeys = [...new Set(storyCourses.map(c => c.cat))];

  // All other courses
  const sections = Object.entries(WORLD_SECTIONS)
    .map(([cat, meta]) => ({ cat, meta, items: courses.filter(c => c.cat === cat) }))
    .filter(s => s.items.length > 0);
  const uncategorized = courses.filter(c => !WORLD_SECTIONS[c.cat] && !STORY_WORLDS[c.cat]);
  if (uncategorized.length) sections.push({ cat: 'other', meta: { label: 'More Worlds', icon: '🎮', blurb: '', color: '#7c3aed' }, items: uncategorized });

  const filterCourse = (c) => {
    if (filter === 'all') return true;
    const d = c.totalDist > 40 ? 'Hard' : c.totalDist > 25 ? 'Medium' : 'Easy';
    return d === filter;
  };

  return (
    <div className="gls-overlay">
      <div className="gls-panel">

        {/* ── Header ── */}
        <header className="gls-header">
          <div className="gls-header-left">
            <div className="gls-title">🎮 Game Creator Hub</div>
            <div className="gls-sub">{robotName} · {courses.length} missions to build</div>
          </div>
          <div className="gls-header-right">
            <button className={`gls-tab${tab === 'worlds' ? ' active' : ''}`} onClick={() => setTab('worlds')}>✨ Story Worlds</button>
            <button className={`gls-tab${tab === 'all' ? ' active' : ''}`} onClick={() => setTab('all')}>📋 All Missions</button>
            {tab === 'all' && ['all','Easy','Medium','Hard'].map(d => (
              <button key={d} className={`bb-diff-filter${filter === d ? ' active' : ''}`} onClick={() => setFilter(d)}>{d}</button>
            ))}
            <button className="gls-close" onClick={onClose}>✕</button>
          </div>
        </header>

        <div className="gls-scroll">

          {/* ══ STORY WORLDS TAB ══════════════════════════════════════════════ */}
          {tab === 'worlds' && (
            <div className="gls-worlds">
              {/* Hero story world cards */}
              <div className="gls-worlds-grid">
                {storyWorldKeys.map(worldKey => {
                  const meta = STORY_WORLDS[worldKey];
                  const worldCourses = storyCourses.filter(c => c.cat === worldKey);
                  const isActive = activeWorld === worldKey;
                  return (
                    <div key={worldKey}>
                      <button
                        type="button"
                        className={`gls-world-card${isActive ? ' active' : ''}`}
                        style={{ '--wc': meta.color, background: meta.gradient }}
                        onClick={() => setActiveWorld(isActive ? null : worldKey)}
                      >
                        <div className="gls-wc-icon">{meta.icon}</div>
                        <div className="gls-wc-body">
                          <div className="gls-wc-name">{meta.label}</div>
                          <div className="gls-wc-tagline">{meta.tagline}</div>
                          <div className="gls-wc-palette">{meta.palette}</div>
                        </div>
                        <div className="gls-wc-count">{worldCourses.length} mission{worldCourses.length !== 1 ? 's' : ''}</div>
                        <div className="gls-wc-arrow">{isActive ? '▲' : '▼'}</div>
                      </button>

                      {isActive && (
                        <div className="gls-world-missions">
                          {worldCourses.map(course => {
                            const best = GameProgress.getBest(robotName || 'Robot', course.id);
                            const designerXp = best > 0 ? Math.round(best * 1.5) : 0;
                            const genre = GENRE_META[course.genre] || GENRE_META.adventure;
                            const isSel = course.id === currentId;
                            return (
                              <button
                                key={course.id}
                                type="button"
                                className={`gls-mission-card${isSel ? ' playing' : ''}`}
                                style={{ '--mc': course.color || meta.color }}
                                onClick={() => { onSelect(course); onClose(); }}
                              >
                                <div className="gls-mc-hero" style={{ background: meta.gradient }}>
                                  <span className="gls-mc-icon">{course.icon}</span>
                                  {isSel && <span className="gls-mc-playing">▶ PLAYING</span>}
                                  <span className="gls-genre-badge" style={{ background: genre.color }}>
                                    {genre.icon} {genre.label}
                                  </span>
                                </div>
                                <div className="gls-mc-body">
                                  <div className="gls-mc-name">{course.name}</div>
                                  <div className="gls-mc-story">{course.desc}</div>
                                  {course.systemsBuilt?.length > 0 && (
                                    <div className="gls-mc-systems">
                                      <span className="gls-sys-label">You'll build:</span>
                                      {course.systemsBuilt.map(s => (
                                        <span key={s} className="gls-sys-tag">{s.replace(/_/g, ' ')}</span>
                                      ))}
                                    </div>
                                  )}
                                  <div className="gls-mc-foot">
                                    <span className="gls-mc-zones">📍 {course.zones || 10} zones</span>
                                    {course.estMinutes && <span className="gls-mc-time">⏱ ~{course.estMinutes} min</span>}
                                    {designerXp > 0
                                      ? <span className="gls-mc-xp">🎮 {designerXp} Designer XP</span>
                                      : <span className="gls-mc-new">✨ NEW</span>}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Other courses teaser */}
              <div className="gls-more-section">
                <div className="gls-more-label">More missions →</div>
                <button className="gls-more-btn" onClick={() => setTab('all')}>Browse all {courses.length} missions</button>
              </div>
            </div>
          )}

          {/* ══ ALL MISSIONS TAB ══════════════════════════════════════════════ */}
          {tab === 'all' && (
            <div className="gls-all">
              {sections.map(({ cat, meta, items }) => {
                const shown = items.filter(filterCourse);
                if (!shown.length) return null;
                return (
                  <section key={cat} className="bb-world-section">
                    <div className="bb-world-head" style={{ '--world-col': meta.color }}>
                      <span className="bb-world-icon">{meta.icon}</span>
                      <div>
                        <h2>{meta.label}</h2>
                        <p>{meta.blurb} · {shown.length} mission{shown.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="bb-level-grid">
                      {shown.map(course => {
                        const best  = GameProgress.getBest(robotName || 'Robot', course.id);
                        const stars = best > 0 ? (best > 800 ? 3 : best > 400 ? 2 : 1) : 0;
                        const diff  = course.totalDist > 40 ? 'Hard' : course.totalDist > 25 ? 'Medium' : 'Easy';
                        const art   = worldArt(course);
                        const isSel = course.id === currentId;
                        const genre = GENRE_META[course.genre];
                        return (
                          <button
                            key={course.id}
                            type="button"
                            className={`bb-level-card${isSel ? ' selected' : ''}`}
                            style={{ '--card-col': course.color || meta.color }}
                            onClick={() => { onSelect(course); onClose(); }}
                          >
                            <div className="bb-level-card-art" style={{ background: art.bg }}>
                              <span className="bb-level-emoji">{course.icon || art.emoji}</span>
                              {course.isGameMission && <span className="bb-level-featured">🎮 GAME BUILD</span>}
                              {course.isFoxChase    && <span className="bb-level-featured">⭐ FEATURED</span>}
                              {course.isFlagship    && <span className="bb-level-featured">🎓 FLAGSHIP</span>}
                              {isSel                && <span className="bb-level-playing">▶ PLAYING</span>}
                              {genre && <span className="bb-level-genre" style={{ background: genre.color }}>{genre.icon}</span>}
                              <span className="bb-diff-sm" data-d={diff}>{diff}</span>
                            </div>
                            <div className="bb-level-card-body">
                              <h3>{course.name}</h3>
                              <p>{course.winCondition || course.desc}</p>
                              <div className="bb-level-card-foot">
                                <span className="bb-stars">{'★'.repeat(stars)}<span className="bb-stars-off">{'★'.repeat(3 - stars)}</span></span>
                                {course.estMinutes && <span className="bb-foot-meta">⏱ ~{course.estMinutes} min</span>}
                                {best > 0 ? <span className="bb-best">🏆 {best}</span> : <span className="bb-foot-new">NEW</span>}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
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
