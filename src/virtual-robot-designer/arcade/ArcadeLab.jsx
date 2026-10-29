/**
 * Robot Arcade lab — Sumo, Line, Paint and Snake bots.
 * Laid out exactly like the Live Lab used by the other robots: Event Blocks
 * panel on the left, the 3D arena on the right with the mode card, Mission
 * panel, stats bar and the Game modes / Simulate controls.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  blockDef, makeBlock, starter, parse, execute, countBlocks, starsFor,
  loadProgress, saveStars, loadProgram, saveProgram, CONTROL_BLOCKS,
} from './engine.js';
import { arcadeBlocksToPython, arcadePythonToBlocks, arcadePythonHelp } from './arcadePython.js';
import { arcadeLevelFacts } from './arcadeObjective.js';
import PythonCodePane from '../studio/PythonCodePane.jsx';
import CodingObjectiveCard from '../studio/CodingObjectiveCard.jsx';
import { getCodingObjective } from '../studio/codingObjective.js';
import { ARCADE_GAMES } from './games/index.js';
import { createArcadeView } from './scene3d.js';
import { GameLevelSelect, GameVictoryScreen, GameFailureScreen } from '../studio/LiveLabGameUI.jsx';
import { GameProgress } from '../services/game-progress.js';
import SavedCodeMenu from '../studio/SavedCodeMenu.jsx';
import '../studio/LiveLabPage.css';
import '../studio/LiveLabGame.css';
import './arcade.css';
import { EmojiIcon, IconText } from '../../components/ui/Icon.jsx';

const SPEEDS = [1, 2, 4];
const DIFFICULTY = ['Tutorial', 'Easy', 'Easy', 'Medium', 'Medium', 'Medium', 'Hard', 'Hard', 'Hard', 'Expert'];
const WORLD = {
  snakebot: { name: 'Snake Garden', type: 'Snake', skills: ['Loops', 'Planning', 'Planning', 'Sensors', 'If / else', 'Avoiding', 'Avoiding', 'Algorithms', 'Algorithms', 'Capstone'] },
  pacbot: { name: 'Pac Maze', type: 'Maze chase', skills: ['Loops', 'Sequence', 'Sensors', 'If / else', 'Wall following', 'Avoiding', 'Avoiding', 'Nested ifs', 'Algorithms', 'Capstone'] },
  brickbot: { name: 'Brick Arcade', type: 'Breakout', skills: ['Events', 'Sequence', 'Sensors', 'If / else', 'Loops', 'Reacting', 'Priorities', 'Speed', 'Reacting', 'Capstone'] },
  arenaquest: { name: 'Arena Quest', type: 'Adventure', skills: ['Loops', 'Turns', 'Sensors', 'Wall following', 'Jumping', 'Keys & doors', 'Pushing', 'Waiting', 'Portals', 'Capstone'] },
  raiderbot: { name: 'Space Raiders', type: 'Space shooter', skills: ['Loops', 'Sensors', 'Tracking', 'If / else', 'Dodging', 'Priorities', 'Persistence', 'Speed', 'Priorities', 'Capstone'] },
  hopbot: { name: 'Hop Crossing', type: 'Crossing', skills: ['Loops', 'Waiting', 'Sensors', 'If / else', 'Timing', 'Timing', 'Danger', 'Edges', 'Escaping', 'Capstone'] },
  jumpbot: { name: 'Retro Robot Run', type: 'Platform adventure', skills: ['Sequence', 'Loops', 'Jumping', 'Sensors', 'If / else', 'Enemies', 'Keys & doors', 'Planning', 'Hazards', 'Capstone'] },
};
const CATS = [
  { key: 'All', label: 'All Blocks', icon: '🧩', color: '#64748b' },
  { key: 'Move', label: 'Movement', icon: '🚀', color: '#3b82f6' },
  { key: 'Pen', label: 'Pen', icon: '✏️', color: '#10b981' },
  { key: 'Control', label: 'Loops', icon: '🔁', color: '#f59e0b' },
  { key: 'Sensors', label: 'Sensors', icon: '👁', color: '#10b981' },
  { key: 'Logic', label: 'Logic', icon: '🧠', color: '#8b5cf6' },
];

/** The pupil's saved program for a level — empty to start with, so they write it themselves.
 *  A saved program that is just the starter blocks levels used to give (unchanged) also opens empty. */
function openProgram(game, idx) {
  const saved = loadProgram(game.id, idx);
  if (!saved?.length) return [];
  const L = game.levels[idx];
  const sig = (list) => JSON.stringify(list.map((b) => [b.type, b.indent || 0, b.params || {}]));
  if (L.starter && sig(saved) === sig(starter(game, L.starter))) return [];
  return saved;
}

function levelCourse(game, i, robotName) {
  const L = game.levels[i];
  const W = WORLD[game.id];
  return {
    id: L.arena?.id ? `${game.id}-${L.arena.id}` : `${game.id}-${i + 1}`,
    modeIndex: i + 1,
    name: L.title,
    shortName: L.title,
    environmentName: L.title,
    environmentEmoji: L.arena?.emoji || game.emoji,
    desc: L.goal,
    tryThis: L.modeIndex > 10 && L.hint ? `${L.hint}${L.fact ? ` Did you know? ${L.fact}` : ''}` : L.goal,
    skillLearned: L.skill || W.skills[i] || 'Problem solving',
    par: L.par,
    arcade: { palette: L.palette, need: L.need, conditions: game.conditions, ...arcadeLevelFacts(game, i) },
    difficulty: L.arena?.custom ? 'My arena' : (L.difficulty || DIFFICULTY[i] || 'Bonus'),
    modeSpec: L.modeSpec || null,
    color: game.color,
    genre: game.id === 'jumpbot' ? 'platformer' : 'action',
    thumbnailKind: game.id === 'jumpbot' ? 'jumpbot' : undefined,
    studioGradient: `linear-gradient(135deg, ${game.color}, #1e1b4b)`,
    displayRobotName: robotName,
  };
}

export default function ArcadeLab({ robotConfig, onBack, gameOverride = null, startLevelId = null }) {
  const game = gameOverride || ARCADE_GAMES[robotConfig?.chassisId] || ARCADE_GAMES.snakebot;
  const W = WORLD[game.id];
  const robotName = robotConfig?.name || game.title;
  const look = useMemo(() => ({
    primary: robotConfig?.primaryColor || game.color,
    accent: robotConfig?.accentColor || '#fde047',
    led: robotConfig?.ledColor || '#5eead4',
  }), [robotConfig?.primaryColor, robotConfig?.accentColor, robotConfig?.ledColor, game.color]);

  const [progress, setProgress] = useState(() => loadProgress(game.id));
  const firstOpen = useMemo(() => {
    if (startLevelId) {
      const s = game.levels.findIndex((lv) => lv.arena?.id === startLevelId);
      if (s >= 0) return s;
    }
    const i = game.levels.findIndex((_, k) => !progress[k]);
    return i < 0 ? 0 : i;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [level, setLevel] = useState(firstOpen);
  const [blocks, setBlocks] = useState(() => openProgram(game, firstOpen));
  const [mode, setMode] = useState('idle'); // idle | running | paused | step
  const [result, setResult] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [speed, setSpeed] = useState(1);
  const [cat, setCat] = useState('All');
  const [search, setSearch] = useState('');
  const [showModes, setShowModes] = useState(false);
  const [missionOpen, setMissionOpen] = useState(false);
  const [camMode, setCamMode] = useState('wide');
  const [hud, setHud] = useState({ stats: [], prog: { current: 0, target: 1, pct: 0, label: '' } });
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [no3d, setNo3d] = useState(false);
  // Blocks or Python — the Python program becomes the same indented blocks the arcade runs
  const modeKey = `bb-arcade-${game.id}:code-mode`;
  const [codeMode, setCodeModeState] = useState(() => { try { return localStorage.getItem(modeKey) === 'python' ? 'python' : 'blocks'; } catch { return 'blocks'; } });
  const usePython = codeMode === 'python';
  const setCodeMode = (m) => { setCodeModeState(m); try { localStorage.setItem(modeKey, m); } catch { /* ignore */ } };
  const [pyProgram, setPyProgram] = useState({ blocks: [], code: '' });

  const hostRef = useRef(null);
  const viewRef = useRef(null);
  const worldRef = useRef(null);
  const genRef = useRef(null);
  const endedRef = useRef(false);
  const modeRef = useRef('idle');
  const stepRef = useRef(false);
  const speedRef = useRef(speed);
  speedRef.current = speed;
  modeRef.current = mode;

  const L = game.levels[level];
  const course = useMemo(() => levelCourse(game, level, robotName), [game, level, robotName]);
  const courses = useMemo(() => game.levels.map((_, i) => levelCourse(game, i, robotName)), [game, robotName]);

  /* ─── 3D view ─── */
  const buildView = useCallback(() => {
    viewRef.current?.dispose();
    worldRef.current = game.init(level, look);
    genRef.current = null;
    endedRef.current = false;
    const v = hostRef.current ? createArcadeView(hostRef.current, game, worldRef.current, look, robotConfig) : null;
    viewRef.current = v;
    setNo3d(!v?.ok);
    v?.setCamera?.(camMode);
  }, [game, level, look, robotConfig]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    buildView();
    setMode('idle');
    setActiveId(null);
    setResult(null);
    return () => { viewRef.current?.dispose(); viewRef.current = null; };
  }, [buildView]);
  useEffect(() => { viewRef.current?.setCamera?.(camMode); }, [camMode]);
  useEffect(() => { saveProgram(game.id, level, blocks); }, [blocks, game.id, level]);
  const program = usePython ? pyProgram.blocks : blocks;

  const resetWorld = useCallback(() => {
    // Keep the same 3D scene; just put the game back to the start.
    const fresh = game.init(level, look);
    const w = worldRef.current;
    if (w) Object.keys(w).forEach((k) => delete w[k]);
    Object.assign(w || (worldRef.current = {}), fresh);
    genRef.current = null;
    endedRef.current = false;
    setMode('idle');
    setActiveId(null);
  }, [game, level, look]);

  const finish = useCallback((res) => {
    setMode('idle');
    setActiveId(null);
    if (res.win) {
      const stars = starsFor(program, L.par);
      setProgress(saveStars(game.id, level, stars));
      const xp = 40 + level * 15 + stars * 10;
      try {
        GameProgress.addXp(robotName, xp);
        GameProgress.setBest(robotName, course.id, xp);
      } catch { /* ignore */ }
      setResult({ ...res, stars, xp });
    } else setResult(res);
  }, [program, L.par, game.id, level, robotName, course.id]);

  /* ─── Main loop ─── */
  useEffect(() => {
    let raf;
    let last = performance.now();
    let hudTick = 0;
    const frame = (now) => {
      const dtReal = Math.min(0.05, (now - last) / 1000);
      last = now;
      const w = worldRef.current;
      const m = modeRef.current;
      if (w && genRef.current && !w.result && (m === 'running' || m === 'step')) {
        let budget = dtReal * speedRef.current;
        let guard = 0;
        while (budget > 1e-6 && !w.result && guard++ < 4000) {
          if (!endedRef.current && (!w.cmd || w.cmd.done)) {
            if (m === 'step' && stepRef.current) { stepRef.current = false; setMode('paused'); break; }
            const n = genRef.current.next();
            if (n.done) {
              endedRef.current = true;
              w.cmd = null;
              const res = game.end(w);
              if (res) { w.result = w.result || res; break; }
              continue;
            }
            const a = n.value;
            setActiveId(a.id);
            if (a.type === 'wait') w.cmd = { type: 'wait', t: 0, dur: Math.max(0.05, Number(a.params?.seconds) || 0.5) };
            else if (a.type === 'idle') w.cmd = { type: 'idle', t: 0, dur: a.soft ? 1 / 120 : 1 / 60 };
            else game.start(w, a);
            if (m === 'step' && a.type !== 'idle') stepRef.current = true;
            if (!w.cmd || w.cmd.dur === 0) { if (w.cmd) w.cmd.done = true; continue; }
          }
          const sub = Math.min(budget, 1 / 60);
          game.tick(w, sub);
          budget -= sub;
        }
        if (w.result) {
          const res = w.result;
          genRef.current = null;
          setTimeout(() => finish(res), 600);
        }
      } else if (w && game.id === 'snakebot') {
        game.tick(w, 0); // keep the slide animation settled
      }
      if (w) {
        viewRef.current?.update(w, now / 1000);
        if (hudTick++ % 6 === 0) setHud({ stats: game.hud(w), prog: game.progress(w) });
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [game, finish]);

  const start = (asStep = false) => {
    setResult(null);
    resetWorld();
    const sense = (cond) => game.sense(worldRef.current, cond);
    genRef.current = execute(parse(program), sense);
    stepRef.current = false;
    setMode(asStep ? 'step' : 'running');
  };
  const pause = () => setMode((m) => (m === 'running' ? 'paused' : m === 'paused' ? 'running' : m));
  const step = () => {
    if (mode === 'idle') { start(true); return; }
    stepRef.current = false;
    setMode('step');
  };
  const stop = () => resetWorld();

  const pickLevel = (i) => {
    setLevel(i);
    setBlocks(openProgram(game, i));
  };

  /* ─── Editing ─── */
  const add = (type, params) => {
    if (mode !== 'idle') return;
    setBlocks((prev) => {
      const last = prev[prev.length - 1];
      let indent = 0;
      if (last) indent = (last.indent || 0) + (blockDef(game, last.type)?.container ? 1 : 0);
      if (type === 'else') {
        for (let i = prev.length - 1; i >= 0; i--) if (prev[i].type === 'if') { indent = prev[i].indent || 0; break; }
      }
      return [...prev, makeBlock(game, type, indent, params)];
    });
  };
  const update = (i, key, val) => setBlocks((p) => p.map((b, k) => (k === i ? { ...b, params: { ...b.params, [key]: val } } : b)));
  const indent = (i, d) => setBlocks((p) => p.map((b, k) => (k === i ? { ...b, indent: Math.max(0, Math.min(6, (b.indent || 0) + d)) } : b)));
  const remove = (i) => setBlocks((p) => p.filter((_, k) => k !== i));
  const duplicate = (i) => setBlocks((p) => [...p.slice(0, i + 1), { ...p[i], id: makeBlock(game, p[i].type).id }, ...p.slice(i + 1)]);
  const dropAt = (to) => {
    if (dragIdx == null || dragIdx === to) return;
    setBlocks((p) => {
      const a = p.slice();
      const [b] = a.splice(dragIdx, 1);
      a.splice(to > dragIdx ? to - 1 : to, 0, b);
      return a;
    });
    setDragIdx(null);
    setDragOver(null);
  };

  /* ─── Palette ─── */
  const allowed = L.palette || Object.keys(game.blocks);
  const paletteItems = useMemo(() => {
    const items = [];
    allowed.forEach((t) => {
      const d = blockDef(game, t);
      if (!d) return;
      const c = d.cat === 'Move' ? 'Move' : d.cat === 'Pen' ? 'Pen' : d.cat === 'Logic' ? 'Logic' : 'Control';
      items.push({ key: t, type: t, label: d.label, icon: d.icon, cat: c, color: CATS.find((x) => x.key === c)?.color });
    });
    // Sensors: one ready-made "If …" per sensor, when If is allowed this level.
    if (allowed.includes('if')) {
      game.conditions.forEach((cnd) => items.push({ key: `if:${cnd.id}`, type: 'if', params: { cond: cnd.id }, label: `If ${cnd.label}`, icon: '👁', cat: 'Sensors', color: '#10b981' }));
    }
    return items;
  }, [game, allowed]);
  const q = search.trim().toLowerCase();
  const shown = paletteItems.filter((it) => (q ? it.label.toLowerCase().includes(q) : cat === 'All' || it.cat === cat));
  const railCats = CATS.filter((c) => c.key === 'All' || paletteItems.some((it) => it.cat === c.key));
  const catMeta = CATS.find((c) => c.key === cat) || CATS[0];

  const isRunning = mode === 'running' || mode === 'step';
  const isPaused = mode === 'paused';
  const n = countBlocks(program);
  const pyAllowed = L.palette || [...Object.keys(game.blocks), ...Object.keys(CONTROL_BLOCKS)];
  const pyEngine = useMemo(() => {
    const help = arcadePythonHelp(game, pyAllowed);
    return {
      toPython: (b) => arcadeBlocksToPython(b, game),
      toBlocks: (code) => arcadePythonToBlocks(code, game, pyAllowed),
      groups: [
        { label: 'Robot', icon: game.emoji, color: game.color, items: help.cmds.map((c) => ({ code: c.code, title: c.label })) },
        ...(help.checks.length ? [{ label: 'Checks (use in if / while not)', icon: '👁', color: '#10b981', items: help.checks.map((c) => ({ code: c.code, title: c.label })) }] : []),
      ],
      extras: help.extras,
    };
  }, [game, level]); // eslint-disable-line react-hooks/exhaustive-deps
  // Coding objective: the arcade's blocks read like the lab's (If → if_then)
  const objLibrary = useMemo(() => ({ Arcade: { blocks: pyAllowed.map((t) => ({ id: t === 'if' ? 'if_then' : t, label: blockDef(game, t)?.label || t })) } }), [game, level]); // eslint-disable-line react-hooks/exhaustive-deps
  const codingObjective = useMemo(() => getCodingObjective(course, { library: objLibrary, kind: 'arcade', pythonExtras: pyEngine.extras }), [course, objLibrary, pyEngine]);
  const objBlocks = useMemo(() => program.filter((b) => b.type !== 'else').map((b) => ({ id: b.type === 'if' ? 'if_then' : b.type, paramValues: b.params })), [program]);
  // Lay the script out as Scratch-style C-blocks: each Forever / Repeat / If wraps its
  // inside blocks with a coloured arm and closes with a foot.
  const rows = useMemo(() => {
    const out = [];
    const stack = [];
    const close = (until, next) => {
      while (stack.length && stack[stack.length - 1].indent >= until) {
        const c = stack.pop();
        // If → Else read as one block, so no foot between them
        if (c.type === 'if' && next && next.type === 'else' && (next.indent || 0) === c.indent) continue;
        out.push({ kind: 'foot', key: `f-${c.id}`, indent: c.indent, color: c.color, arms: stack.slice() });
      }
    };
    blocks.forEach((b, i) => {
      const def = blockDef(game, b.type);
      if (!def) return;
      const d = b.indent || 0;
      close(d, b);
      out.push({ kind: 'block', key: b.id, b, i, def, indent: d, arms: stack.filter((c) => c.indent < d) });
      if (def.container) stack.push({ id: b.id, type: b.type, indent: d, color: def.color });
    });
    close(0, null);
    return out;
  }, [blocks, game]);
  const totalStars = Object.values(progress).reduce((a, b) => a + b, 0);

  return (
    <div className="bb-game-root bb-new-layout bb-arcade-root" style={{ '--game': game.color }}>
      {/* ══ LEFT: code panel (same as the other robots) ══ */}
      <div className="scratch-panel">
        <div className="scratch-panel-banner">
          <span className="scratch-panel-banner-icon"><EmojiIcon e="⚡" /></span>
          <div>
            <div className="scratch-panel-banner-title">Event Blocks</div>
            <div className="scratch-panel-banner-sub">Click a block below to add code</div>
          </div>
          <div className="py-mode-toggle" role="tablist" aria-label="Code with blocks or Python">
            <button type="button" role="tab" aria-selected={!usePython} className={!usePython ? 'is-on' : ''} disabled={mode !== 'idle'} onClick={() => setCodeMode('blocks')}><EmojiIcon e="🧩" /> Blocks</button>
            <button type="button" role="tab" aria-selected={usePython} className={usePython ? 'is-on' : ''} disabled={mode !== 'idle'} onClick={() => setCodeMode('python')}><EmojiIcon e="🐍" /> Python</button>
          </div>
        </div>
        <CodingObjectiveCard objective={codingObjective} blocks={objBlocks} python={pyProgram.code} usePython={usePython} isRunning={isRunning} />
        {usePython ? (
          <PythonCodePane
            key={`${game.id}:${level}`}
            engine={pyEngine}
            blocksScript={blocks}
            saveKey={`bb-arcade-${game.id}:python:${level}`}
            activeBlockUid={activeId || ''}
            isRunning={mode !== 'idle'}
            onProgram={(b, code) => setPyProgram({ blocks: b || [], code: code || '' })}
          />
        ) : (
        <div className="scratch-panel-body">
          <nav className="scratch-cat-rail">
            {railCats.map((c) => (
              <button key={c.key} type="button" className={`scratch-cat-btn${cat === c.key && !search ? ' active' : ''}`} style={{ '--cat-c': c.color }}
                onClick={() => { setCat(c.key); setSearch(''); }} title={c.label}>
                <span className="scratch-cat-icon"><EmojiIcon e={c.icon} /></span>
                <span className="scratch-cat-label">{c.label}</span>
              </button>
            ))}
          </nav>

          <div className="scratch-palette">
            <div className="scratch-search-wrap">
              <span className="scratch-search-icon"><EmojiIcon e="🔍" /></span>
              <input type="text" className="scratch-search" placeholder="Search blocks…" value={search} onChange={(e) => setSearch(e.target.value)} />
              {search && <button type="button" className="scratch-search-clear" onClick={() => setSearch('')}>×</button>}
            </div>
            {!search && (
              <div className="scratch-pal-header" style={{ '--cat-c': catMeta.color }}>
                <span><EmojiIcon e={catMeta.icon} /></span><span>{catMeta.label}</span>
              </div>
            )}
            <div className="scratch-pal-blocks">
              {shown.map((it) => (
                <button key={it.key} type="button" className="scratch-pal-block" style={{ '--cat-c': it.color }} onClick={() => add(it.type, it.params)} disabled={mode !== 'idle'}>
                  <span className="scratch-pal-block-row">
                    <span className="scratch-blk-icon"><EmojiIcon e={it.icon} /></span>
                    <span className="scratch-blk-text">{it.label}</span>
                  </span>
                  <span className="scratch-blk-tag">{game.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="scratch-workspace">
            <div className="scratch-ws-toolbar">
              <button className="scratch-tool-btn" onClick={() => setBlocks([])} disabled={mode !== 'idle'} title="Start this level again">↺</button>
              {blocks.length > 0 && <button className="scratch-tool-btn scratch-clear-btn" onClick={() => setBlocks([])} disabled={mode !== 'idle'} title="Clear all"><EmojiIcon e="🗑️" /></button>}
              <SavedCodeMenu scope={`arcade:${game.id}:${L.arena?.id || level}`} title={L.title} blocks={blocks} disabled={mode !== 'idle'}
                onLoad={(saved) => setBlocks(saved.filter((b) => blockDef(game, b.type)).map((b) => ({ ...b, id: makeBlock(game, b.type).id })))} />
              <div className="scratch-ws-spacer" />
              <span className="scratch-block-count">{n} block{n !== 1 ? 's' : ''} · par {L.par}</span>
              <button className="scratch-mission-btn" onClick={() => mode === 'idle' && setShowModes(true)} title="Choose mission"><EmojiIcon e="🎮" style={{ marginRight: '0.35em' }} />Mission</button>
            </div>
            <div className="scratch-ws-canvas" onDragOver={(e) => e.preventDefault()} onDrop={() => dropAt(blocks.length)}>
              <div className="scratch-anchor-block">
                <span className="scratch-blk-icon"><EmojiIcon e="▶️" /></span>
                <span className="scratch-blk-text">When START clicked</span>
              </div>
              {blocks.length === 0 ? (
                <div className="scratch-ws-empty">
                  <div className="scratch-ws-empty-arrow"><EmojiIcon e="⬇" /></div>
                  <div className="scratch-ws-empty-txt">Click a block on the left to add it here</div>
                </div>
              ) : (
                <div className="scratch-script-stack">
                  {rows.map((row, r) => {
                    const arms = row.arms.map((c) => <i key={c.id} className="bb-arc-arm" style={{ left: c.indent * 14, '--arm': c.color }} />);
                    if (row.kind === 'foot') {
                      return (
                        <div key={row.key} className="bb-arc-row" style={{ paddingLeft: row.indent * 14, zIndex: rows.length - r }}>
                          {arms}
                          <div className="bb-arc-foot" style={{ '--arm': row.color }} />
                        </div>
                      );
                    }
                    const { b, i, def } = row;
                    const color = def.color;
                    const executing = activeId === b.id && mode !== 'idle';
                    return (
                      <div key={row.key} className="bb-arc-row" style={{ paddingLeft: row.indent * 14, zIndex: rows.length - r }}>
                      {arms}
                      <div
                        className={`scratch-script-block bb-arc-sblock${def.container ? ' is-container' : ''}${dragIdx === i ? ' dragging' : ''}${dragOver === i ? ' drag-over' : ''}${executing ? ' executing' : ''}`}
                        style={{ '--cat-c': color, '--exec-c': color }}
                        draggable={mode === 'idle'}
                        onDragStart={() => setDragIdx(i)}
                        onDragEnter={() => setDragOver(i)}
                        onDragLeave={() => setDragOver(null)}
                        onDrop={(e) => { e.stopPropagation(); dropAt(i); }}
                        onDragEnd={() => { setDragIdx(null); setDragOver(null); }}
                      >
                        <div className="scratch-script-grip">⠿</div>
                        <div className="scratch-script-body">
                          <span className="scratch-blk-icon"><EmojiIcon e={def.icon} /></span>
                          <span className="scratch-blk-text">{def.label}</span>
                          {(def.params || []).map((p) => {
                            const v = b.params?.[p.key];
                            if (p.type === 'cond' || p.type === 'select') {
                              const opts = p.type === 'cond' ? game.conditions.map((c) => [c.label, c.id]) : p.options.map((o) => [o.label, o.value]);
                              return (
                                <label key={p.key} className="scratch-param-wrap">
                                  <select className="scratch-param-select" value={v} onClick={(e) => e.stopPropagation()} onChange={(e) => update(i, p.key, e.target.value)}>
                                    {opts.map(([lbl, val]) => <option key={val} value={val}>{lbl}</option>)}
                                  </select>
                                </label>
                              );
                            }
                            return (
                              <label key={p.key} className="scratch-param-wrap">
                                <input type="number" className="scratch-param-input" step={p.step || 1} min={p.min} max={p.max} value={v}
                                  onClick={(e) => e.stopPropagation()} onChange={(e) => update(i, p.key, e.target.value === '' ? '' : Number(e.target.value))} />
                                {p.label && <span className="scratch-param-unit">{p.label}</span>}
                              </label>
                            );
                          })}
                        </div>
                        <div className="scratch-script-actions">
                          <button type="button" className="scratch-act-btn" onClick={() => indent(i, -1)} title="Move out">⇤</button>
                          <button type="button" className="scratch-act-btn" onClick={() => indent(i, 1)} title="Move inside the block above">⇥</button>
                          <button type="button" className="scratch-act-btn" onClick={() => duplicate(i)} title="Duplicate">⧉</button>
                          <button type="button" className="scratch-act-btn scratch-del-btn" onClick={() => remove(i)} title="Delete">✕</button>
                        </div>
                      </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {blocks.length > 0 && (
                <div className="scratch-trash-zone"
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('active'); }}
                  onDragLeave={(e) => e.currentTarget.classList.remove('active')}
                  onDrop={(e) => { e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.remove('active'); if (dragIdx !== null) remove(dragIdx); setDragIdx(null); }}>
                  <EmojiIcon e="🗑️" style={{ marginRight: '0.35em' }} />Drop here to delete
                </div>
              )}
            </div>
          </div>
        </div>
        )}
      </div>

      {/* ══ RIGHT: 3D arena ══ */}
      <div className="bb-center-viewport">
        {showModes && (
          <GameLevelSelect courses={courses} currentId={course.id} robotName={robotName} robotType={game.id} chassisId={game.id}
            currentArenaType={game.id} strictChassisModes
            onSelect={(c) => pickLevel((c.modeIndex || 1) - 1)} onClose={() => setShowModes(false)} />
        )}
        <div className="bb-viewport-frame" aria-hidden="true" />
        <div ref={hostRef} className="bb-arcade-host" />
        {no3d && <div className="bb-arcade-no3d">3D graphics are switched off in this browser. Open ByteBuddies in Chrome, Edge or Safari to play.</div>}

        {mode === 'idle' && (
          <div className="bb-chassis-mode-banner bb-arcade-banner" style={{ '--mc': game.color }}>
            <span className="bb-arcade-banner-emoji">{game.emoji}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="bb-arcade-banner-kicker">{W.name} · {L.arena?.custom ? 'My arena' : `Mode ${level + 1}/${game.levels.length}`}</div>
              <div className="bb-arcade-banner-title">{L.title}</div>
              <div className="bb-arcade-banner-sub">{W.type} · {L.arena?.custom ? 'Made by you' : (L.difficulty || DIFFICULTY[level] || 'Bonus')} · {'★'.repeat(progress[level] || 0)}{'☆'.repeat(3 - (progress[level] || 0))}</div>
            </div>
          </div>
        )}

        <aside className={`mcp-panel mcp-panel-v2${isRunning ? ' mcp-panel--compact' : ''}`}>
          <div className="mcp-v2-header">
            <span className="mcp-v2-title">Mission</span>
            <button type="button" className="mcp-toggle mcp-v2-info" onClick={() => setMissionOpen((e) => !e)} title="Details">{missionOpen ? '✕' : 'ⓘ'}</button>
          </div>
          <div className="mcp-v2-primary-obj">
            <div className="mcp-v2-obj-row">
              <span className="mcp-v2-obj-icon">⭐</span>
              <span className="mcp-v2-obj-text">{L.goal}</span>
            </div>
            <div className="mcp-v2-prog-track">
              <div className="mcp-v2-prog-fill" style={{ width: `${Math.max(0, Math.min(100, hud.prog.pct || 0))}%`, background: game.color }} />
            </div>
            <div className="mcp-v2-prog-label">
              <span style={{ color: game.color, filter: 'brightness(1.4)' }}>{hud.prog.current}</span>
              <span style={{ color: 'rgba(255,255,255,0.4)' }}> / {hud.prog.target}</span>
              <span style={{ color: 'rgba(255,255,255,0.45)', marginLeft: 6, fontSize: 10 }}>{hud.prog.label}</span>
            </div>
          </div>
          {!isRunning && (
            <>
              <ul className="mcp-v2-subobjectives">
                <li className="mcp-v2-subobj"><span className="mcp-v2-subobj-icon"><EmojiIcon e="🧠" /></span><span className="mcp-v2-subobj-text">Learn: {W.skills[level] || 'Problem solving'}</span></li>
                <li className={`mcp-v2-subobj${progress[level] >= 3 ? ' done' : ''}`}><span className="mcp-v2-subobj-icon"><IconText>{progress[level] >= 3 ? '✅' : '🏅'}</IconText></span><span className="mcp-v2-subobj-text">3 stars: {L.par} block{L.par === 1 ? '' : 's'} or fewer</span></li>
              </ul>
              <div className="mcp-v2-actions">
                <button type="button" className="mcp-v2-btn" onClick={stop}><span>↺</span> Restart</button>
              </div>
            </>
          )}
          {missionOpen && (
            <div className="mcp-expanded">
              <div className="mcp-story-block">
                <div className="mcp-story-label">HOW TO PLAY</div>
                <p className="mcp-story-text">{game.blurb}</p>
              </div>
              <div className="mcp-tip"><EmojiIcon e="💡" style={{ marginRight: '0.35em' }} />{L.hint}</div>
              <div className="mcp-stats-row">
                <div className="mcp-stat-chip"><span>⭐</span><span style={{ color: '#fbbf24' }}>{totalStars}/30</span></div>
                <div className="mcp-stat-chip"><span><EmojiIcon e="🧩" /></span><span>{n} blocks</span></div>
              </div>
            </div>
          )}
        </aside>

        <div className="bb-float-hud">
          {hud.stats.map((s, i) => (
            <React.Fragment key={s.lbl}>
              {i > 0 && <div className="bb-fhud-sep" />}
              <div className="bb-fhud-stat">
                <span className="bb-fhud-icon"><EmojiIcon e={s.icon} /></span>
                <span className="bb-fhud-val" style={{ color: s.color }}>{s.val}</span>
                <span className="bb-fhud-lbl">{s.lbl}</span>
              </div>
            </React.Fragment>
          ))}
        </div>

        <div className="bb-vp-run-controls" style={showModes ? { display: 'none' } : undefined}>
          <button type="button" className="bb-vp-modes-btn" onClick={() => mode === 'idle' && setShowModes(true)} disabled={mode !== 'idle'} title="Pick a game mode"><EmojiIcon e="🎮" style={{ marginRight: '0.35em' }} />Game modes</button>
          {mode === 'idle' && <button type="button" className="bb-vp-run-btn" onClick={() => start(false)} disabled={!program.length}><EmojiIcon e="▶" style={{ marginRight: '0.35em' }} />Simulate</button>}
          {isRunning && <button type="button" className="bb-vp-run-btn bb-vp-pause-btn" onClick={pause}><EmojiIcon e="⏸" /></button>}
          {isPaused && <button type="button" className="bb-vp-run-btn" onClick={pause}><EmojiIcon e="▶" /></button>}
          {(isRunning || isPaused) && <button type="button" className="bb-vp-stop-btn" onClick={stop}>■ Stop</button>}
          {(mode === 'idle' || isPaused) && <button type="button" className="bb-vp-step-btn" onClick={step} title="Step one block"><EmojiIcon e="⏭" /></button>}
          <button type="button" className="bb-vp-icon-btn" onClick={() => setSpeed((s) => SPEEDS[(SPEEDS.indexOf(s) + 1) % SPEEDS.length])} title="Speed">{speed}×</button>
          <button type="button" className="bb-vp-icon-btn" title="Camera" onClick={() => setCamMode((c) => (c === 'wide' ? 'follow' : c === 'follow' ? 'top' : 'wide'))}>
            <IconText>{camMode === 'wide' ? '🎥' : camMode === 'follow' ? '🤖' : '🗺️'}</IconText>
          </button>
          <button type="button" className="bb-vp-icon-btn" onClick={onBack} title="Back to Build"><EmojiIcon e="🔧" /></button>
        </div>

        {result?.win && (
          <GameVictoryScreen xp={result.xp} medal={'⭐'.repeat(result.stars)} coins={0}
            onDone={() => { setResult(null); if (level < game.levels.length - 1) pickLevel(level + 1); else resetWorld(); }} />
        )}
        {result && !result.win && (
          <GameFailureScreen message={result.msg} hint={L.hint} onRetry={() => { setResult(null); start(false); }} />
        )}
      </div>
    </div>
  );
}
