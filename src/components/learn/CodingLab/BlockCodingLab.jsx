import React, { useState, useEffect, useCallback, useRef } from 'react';

const BLOCK_CATALOG = {
  forward:    { cat: 'Movement', label: 'Forward',  icon: '▲', color: '#6366f1', param: true,  min: 1, max: 10 },
  backward:   { cat: 'Movement', label: 'Backward', icon: '▼', color: '#6366f1', param: true,  min: 1, max: 10 },
  turn_left:  { cat: 'Movement', label: 'Turn Left', icon: '↺', color: '#818cf8', param: false },
  turn_right: { cat: 'Movement', label: 'Turn Right', icon: '↻', color: '#818cf8', param: false },
  paint:      { cat: 'Actions',  label: 'Paint',    icon: '🎨', color: '#ec4899', param: 'color', colors: ['red', 'blue', 'yellow', 'green'] },
  grab:       { cat: 'Actions',  label: 'Grab',     icon: '🤏', color: '#f472b6', param: false },
  release:    { cat: 'Actions',  label: 'Release',  icon: '✋', color: '#f472b6', param: false },
  repeat:     { cat: 'Control',  label: 'Repeat',   icon: '🔁', color: '#f59e0b', param: true,  min: 2, max: 8 },
  wait:       { cat: 'Control',  label: 'Wait',     icon: '⏱', color: '#fbbf24', param: true,  min: 1, max: 5 },
};

const CATEGORIES = ['Movement', 'Actions', 'Control'];

function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; }

function expandBlocks(blocks) {
  const out = [];
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.id === 'repeat') {
      const n = b.param || 3;
      const next = blocks[i + 1];
      if (next && next.id !== 'repeat') {
        for (let j = 0; j < n; j++) out.push({ ...next, uid: `${next.uid}-r${j}` });
        i++;
        continue;
      }
    }
    out.push(b);
  }
  return out;
}

function compileProgram(blocks, start, obstacles = []) {
  const expanded = expandBlocks(blocks);
  let cur = { col: start.col, row: start.row, dir: start.dir ?? 0, speech: null, painted: [] };
  const frames = [{ ...cur, painted: [...cur.painted] }];
  const logs = [];
  const obs = new Set(obstacles.map(o => `${o.col},${o.row}`));

  const move = (steps, sign = 1) => {
    for (let s = 0; s < steps; s++) {
      const nxt = { ...cur, speech: null, painted: [...cur.painted] };
      const d = ((cur.dir % 360) + 360) % 360;
      if (d === 0) nxt.col += sign;
      else if (d === 90) nxt.row -= sign;
      else if (d === 180) nxt.col -= sign;
      else nxt.row += sign;

      if (obs.has(`${nxt.col},${nxt.row}`)) {
        logs.push(`✗ Robot hit wall at step ${frames.length}`);
        return false;
      }
      cur = nxt;
      frames.push({ ...cur, painted: [...cur.painted] });
    }
    return true;
  };

  for (const b of expanded) {
    const def = BLOCK_CATALOG[b.id];
    if (!def) continue;
    if (b.id === 'forward') {
      logs.push(`Step ${frames.length}: [FORWARD ${b.param}] → move ${b.param} spaces`);
      if (!move(b.param || 1, 1)) break;
    } else if (b.id === 'backward') {
      logs.push(`Step ${frames.length}: [BACKWARD ${b.param}]`);
      if (!move(b.param || 1, -1)) break;
    } else if (b.id === 'turn_left') {
      cur = { ...cur, dir: cur.dir - 90, speech: null, painted: [...cur.painted] };
      logs.push(`Step ${frames.length}: [TURN_LEFT] → facing ${((cur.dir % 360) + 360) % 360}°`);
      frames.push({ ...cur, painted: [...cur.painted] });
    } else if (b.id === 'turn_right') {
      cur = { ...cur, dir: cur.dir + 90, speech: null, painted: [...cur.painted] };
      logs.push(`Step ${frames.length}: [TURN_RIGHT] → facing ${((cur.dir % 360) + 360) % 360}°`);
      frames.push({ ...cur, painted: [...cur.painted] });
    } else if (b.id === 'paint') {
      const color = b.param || 'red';
      cur.painted.push({ col: cur.col, row: cur.row, color });
      logs.push(`Step ${frames.length}: [PAINT ${color.toUpperCase()}] at (${cur.col},${cur.row})`);
      frames.push({ ...cur, painted: [...cur.painted] });
    } else if (b.id === 'wait') {
      logs.push(`Step ${frames.length}: [WAIT ${b.param}s]`);
    } else if (b.id === 'grab' || b.id === 'release') {
      logs.push(`Step ${frames.length}: [${b.id.toUpperCase()}]`);
    }
  }
  return { frames, logs, final: cur };
}

export default function BlockCodingLab({ config, color, storageKey, onComplete }) {
  const { mission, hints = [], starterBlocks = [], solutionBlocks = [] } = config;
  const COLS = mission.gridCols || 8;
  const ROWS = mission.gridRows || 6;
  const CELL = 42;
  const INITIAL = mission.start || { col: 0, row: Math.floor(ROWS / 2), dir: 0 };
  const target = mission.target;
  const obstacles = mission.obstacles || [];

  const [workspace, setWorkspace] = useState(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}_blocks`);
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return starterBlocks.map(b => ({ ...b, uid: uid() }));
  });
  const [frames, setFrames] = useState([]);
  const [frameIdx, setFrameIdx] = useState(-1);
  const [pos, setPos] = useState({ ...INITIAL, painted: [] });
  const [trail, setTrail] = useState([]);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [hintLevel, setHintLevel] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [speed, setSpeed] = useState('normal'); // slow | normal | fast
  const [activeBlock, setActiveBlock] = useState(null);
  const dragType = useRef(null);

  const speedMs = { slow: 700, normal: 400, fast: 150, instant: 0 }[speed];

  const save = useCallback(() => {
    localStorage.setItem(`${storageKey}_blocks`, JSON.stringify(workspace.map(({ uid, id, param }) => ({ uid, id, param }))));
  }, [workspace, storageKey]);

  useEffect(() => { save(); }, [workspace, save]);

  const addBlock = (id) => {
    if (running) return;
    const def = BLOCK_CATALOG[id];
    const param = def.param === 'color' ? 'red' : def.param ? (def.min || 1) : undefined;
    setWorkspace(w => [...w, { id, param, uid: uid() }]);
    setSuccess(false);
    setError(null);
  };

  const run = () => {
    if (workspace.length === 0 || running) return;
    const { frames: f, logs: l } = compileProgram(workspace, INITIAL, obstacles);
    setLogs(l);
    setFrames(f);
    setTrail([]);
    setSuccess(false);
    setError(null);
    setRunning(true);
    setPaused(false);
    if (speed === 'instant') {
      const last = f[f.length - 1];
      setPos(last);
      setTrail(f.map(p => ({ col: p.col, row: p.row })));
      setRunning(false);
      checkSuccess(last);
    } else {
      setFrameIdx(0);
    }
  };

  const checkSuccess = (frame) => {
    if (target && frame.col === target.col && frame.row === target.row) {
      setSuccess(true);
      onComplete?.();
    } else if (target) {
      setError(`Robot ended at (${frame.col}, ${frame.row}) — goal is (${target.col}, ${target.row})`);
    } else if (workspace.length >= 2) {
      setSuccess(true);
      onComplete?.();
    }
  };

  useEffect(() => {
    if (frameIdx < 0 || frameIdx >= frames.length || paused) return;
    const frame = frames[frameIdx];
    setPos(frame);
    setActiveBlock(Math.min(frameIdx, workspace.length - 1));
    setTrail(prev => {
      const key = `${frame.col},${frame.row}`;
      return prev.some(p => `${p.col},${p.row}` === key) ? prev : [...prev, { col: frame.col, row: frame.row }];
    });
    if (frameIdx >= frames.length - 1) {
      setRunning(false);
      setFrameIdx(-1);
      setActiveBlock(null);
      checkSuccess(frame);
      return;
    }
    const t = setTimeout(() => setFrameIdx(i => i + 1), speedMs);
    return () => clearTimeout(t);
  }, [frameIdx, frames, paused, speedMs]);

  const stepOnce = () => {
    if (!running && frames.length === 0) {
      const { frames: f, logs: l } = compileProgram(workspace, INITIAL, obstacles);
      setLogs(l);
      setFrames(f);
      setFrameIdx(0);
      setRunning(true);
      return;
    }
    if (frameIdx < frames.length - 1) setFrameIdx(i => i + 1);
  };

  const reset = () => {
    setWorkspace(starterBlocks.map(b => ({ ...b, uid: uid() })));
    setFrames([]);
    setFrameIdx(-1);
    setPos({ ...INITIAL, painted: [] });
    setTrail([]);
    setRunning(false);
    setSuccess(false);
    setError(null);
    setLogs([]);
    setShowSolution(false);
  };

  const loadSolution = () => {
    setShowSolution(true);
    setWorkspace(solutionBlocks.map(b => ({ ...b, uid: uid() })));
  };

  const cycleParam = (blockUid) => {
    setWorkspace(w => w.map(b => {
      if (b.uid !== blockUid) return b;
      const def = BLOCK_CATALOG[b.id];
      if (def.param === 'color') {
        const colors = def.colors;
        const i = colors.indexOf(b.param);
        return { ...b, param: colors[(i + 1) % colors.length] };
      }
      if (def.param) {
        const v = (b.param || def.min || 1) + 1;
        return { ...b, param: v > (def.max || 10) ? (def.min || 1) : v };
      }
      return b;
    }));
  };

  const onDragStart = (e, id) => {
    dragType.current = id;
    e.dataTransfer.setData('text/plain', id);
  };

  const onDropWorkspace = (e) => {
    e.preventDefault();
    const id = dragType.current || e.dataTransfer.getData('text/plain');
    if (BLOCK_CATALOG[id]) addBlock(id);
    dragType.current = null;
  };

  const gridW = COLS * CELL;
  const gridH = ROWS * CELL;
  const painted = pos.painted || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Header toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 12, fontWeight: 800, color, letterSpacing: '0.05em' }}>BYTEBUDDIES CODING LAB</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button type="button" onClick={save} style={toolBtn}>💾 Save</button>
          <button type="button" onClick={() => setHintLevel(h => Math.min(h + 1, hints.length))} disabled={hintLevel >= hints.length} style={toolBtn}>
            💡 Hint {hintLevel > 0 ? `(${hintLevel}/${hints.length})` : ''}
          </button>
          <button type="button" onClick={loadSolution} style={toolBtn}>📋 Solution</button>
        </div>
      </div>

      {hintLevel > 0 && hints[hintLevel - 1] && (
        <div style={{ padding: '10px 14px', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.35)', borderRadius: 10, fontSize: 13, color: '#fde68a' }}>
          💡 Hint {hintLevel}: {hints[hintLevel - 1]}
        </div>
      )}

      {showSolution && (
        <div style={{ padding: '10px 14px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.35)', borderRadius: 10, fontSize: 12, color: '#c7d2fe' }}>
          Solution loaded — study the blocks, then modify and run your own version!
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Toolbox */}
        <div style={{ width: 150, flexShrink: 0 }}>
          <div style={sectionLabel}>BLOCK TOOLBOX</div>
          {CATEGORIES.map(cat => (
            <div key={cat} style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>{cat}</div>
              {Object.entries(BLOCK_CATALOG).filter(([, d]) => d.cat === cat).map(([id, b]) => (
                <div key={id} draggable onDragStart={e => onDragStart(e, id)} onClick={() => addBlock(id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 9px', marginBottom: 3,
                    background: `${b.color}18`, border: `1.5px solid ${b.color}44`, borderRadius: 8,
                    cursor: 'grab', fontSize: 11, fontWeight: 700, color: b.color, userSelect: 'none' }}>
                  <span>{b.icon}</span>
                  <span>{b.label}{b.param === true ? ' _' : ''}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Workspace */}
        <div style={{ width: 180, flexShrink: 0 }}
          onDragOver={e => e.preventDefault()} onDrop={onDropWorkspace}>
          <div style={sectionLabel}>CODE WORKSPACE</div>
          <div style={{ minHeight: 220, maxHeight: 320, overflowY: 'auto', background: 'rgba(0,0,0,0.25)',
            border: '2px dashed rgba(255,255,255,0.12)', borderRadius: 10, padding: 6 }}>
            {workspace.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>
                Drag blocks here or click in the toolbox
              </div>
            ) : workspace.map((b, i) => {
              const def = BLOCK_CATALOG[b.id];
              const isActive = activeBlock === i && running;
              return (
                <div key={b.uid}
                  onClick={() => !running && def.param && cycleParam(b.uid)}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 8px', marginBottom: 3,
                    background: isActive ? `${def.color}44` : `${def.color}14`,
                    border: `1.5px solid ${isActive ? def.color : `${def.color}40`}`,
                    borderRadius: 7, fontSize: 11, fontWeight: 700, color: def.color, cursor: def.param ? 'pointer' : 'default' }}>
                  <span style={{ background: def.color, color: '#fff', borderRadius: '50%', width: 16, height: 16,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9 }}>{i + 1}</span>
                  <span>{def.icon}</span>
                  <span style={{ flex: 1 }}>{def.label}{def.param ? ` ${b.param}` : ''}</span>
                  {!running && (
                    <button type="button" onClick={e => { e.stopPropagation(); setWorkspace(w => w.filter(x => x.uid !== b.uid)); }}
                      style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 10 }}>✕</button>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 4, marginTop: 8, flexWrap: 'wrap' }}>
            <button type="button" onClick={run} disabled={running || workspace.length === 0} style={{ ...runBtn, background: success ? '#059669' : color }}>▶ Run</button>
            <button type="button" onClick={() => setPaused(p => !p)} disabled={!running} style={toolBtn}>{paused ? '▶' : '⏸'}</button>
            <button type="button" onClick={stepOnce} disabled={running && frameIdx < 0} style={toolBtn}>Step</button>
            <button type="button" onClick={reset} style={toolBtn}>Clear</button>
          </div>
          <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
            {['slow', 'normal', 'fast', 'instant'].map(s => (
              <button key={s} type="button" onClick={() => setSpeed(s)}
                style={{ ...toolBtn, fontSize: 10, background: speed === s ? color + '33' : 'rgba(255,255,255,0.06)',
                  borderColor: speed === s ? color : 'rgba(255,255,255,0.12)' }}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Simulator */}
        <div style={{ flex: 1, minWidth: 280 }}>
          <div style={sectionLabel}>SIMULATOR — {mission.char} {mission.goal?.slice(0, 40)}…</div>
          <div style={{ position: 'relative', width: gridW, height: gridH, margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, ${CELL}px)`, gridTemplateRows: `repeat(${ROWS}, ${CELL}px)`,
              border: '2px solid rgba(255,255,255,0.1)', borderRadius: 10, overflow: 'hidden', background: '#0f172a' }}>
              {Array.from({ length: ROWS * COLS }, (_, idx) => {
                const col = idx % COLS, row = Math.floor(idx / COLS);
                const isTarget = target && target.col === col && target.row === row;
                const isObs = obstacles.some(o => o.col === col && o.row === row);
                const isTrail = trail.some(p => p.col === col && p.row === row);
                const paint = painted.find(p => p.col === col && p.row === row);
                const paintColors = { red: '#ef4444', blue: '#3b82f6', yellow: '#eab308', green: '#22c55e' };
                return (
                  <div key={idx} style={{ width: CELL, height: CELL, boxSizing: 'border-box',
                    border: '1px solid rgba(255,255,255,0.04)',
                    background: paint ? paintColors[paint.color] + '88' : isObs ? '#374151' : isTarget && success ? 'rgba(34,197,94,0.35)'
                      : isTarget ? 'rgba(245,158,11,0.2)' : isTrail ? color + '22' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                    {isObs ? '🧱' : isTarget ? (success ? '✨' : mission.tEmoji) : ''}
                  </div>
                );
              })}
            </div>
            <div style={{ position: 'absolute', left: pos.col * CELL + CELL / 2, top: pos.row * CELL + CELL / 2,
              transform: `translate(-50%, -50%) rotate(${pos.dir || 0}deg)`,
              fontSize: 26, transition: speed === 'instant' ? 'none' : 'left 0.35s ease, top 0.35s ease', pointerEvents: 'none' }}>
              {mission.char}
            </div>
          </div>
          {success && (
            <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(16,185,129,0.12)', border: '1px solid #10b981',
              borderRadius: 10, color: '#6ee7b7', fontWeight: 700, fontSize: 13, textAlign: 'center' }}>
              ✓ Robot reached the goal! +{config.xp || 25} XP
            </div>
          )}
          {error && !success && (
            <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)',
              borderRadius: 10, color: '#fca5a5', fontSize: 12 }}>{error}</div>
          )}
        </div>
      </div>

      {/* Console log */}
      {logs.length > 0 && (
        <div style={{ background: 'rgba(0,0,0,0.35)', borderRadius: 10, padding: 12, fontFamily: 'monospace', fontSize: 11, maxHeight: 120, overflowY: 'auto' }}>
          <div style={{ color: 'rgba(255,255,255,0.35)', marginBottom: 6, fontWeight: 700 }}>EXECUTION LOG</div>
          {logs.map((l, i) => <div key={i} style={{ color: '#a5b4fc', padding: '2px 0' }}>{l}</div>)}
        </div>
      )}
    </div>
  );
}

const sectionLabel = { fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.07em', marginBottom: 6, textTransform: 'uppercase' };
const toolBtn = { padding: '5px 10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 7, color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' };
const runBtn = { padding: '8px 16px', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 800, fontSize: 12, cursor: 'pointer' };
