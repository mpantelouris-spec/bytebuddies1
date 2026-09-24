import React, { useState, useEffect, useCallback, useRef } from 'react';

const BLOCK_CATALOG = {
  forward:    { cat: 'Movement', label: 'Move Forward', icon: '▲', color: '#4f46e5', param: true,  min: 1, max: 10 },
  backward:   { cat: 'Movement', label: 'Move Back',   icon: '▼', color: '#4f46e5', param: true,  min: 1, max: 10 },
  turn_left:  { cat: 'Movement', label: 'Turn Left',   icon: '↺', color: '#7c3aed', param: false },
  turn_right: { cat: 'Movement', label: 'Turn Right',  icon: '↻', color: '#7c3aed', param: false },
  paint:      { cat: 'Actions',  label: 'Paint',       icon: '🎨', color: '#db2777', param: 'color', colors: ['red','blue','yellow','green'] },
  grab:       { cat: 'Actions',  label: 'Grab',        icon: '🤏', color: '#be185d', param: false },
  release:    { cat: 'Actions',  label: 'Release',     icon: '✋', color: '#be185d', param: false },
  repeat:     { cat: 'Control',  label: 'Repeat',      icon: '🔁', color: '#d97706', param: true,  min: 2, max: 8 },
  wait:       { cat: 'Control',  label: 'Wait',        icon: '⏱',  color: '#b45309', param: true,  min: 1, max: 5 },
};

const CATEGORIES = [
  { name: 'Movement', color: '#818cf8' },
  { name: 'Actions',  color: '#f472b6' },
  { name: 'Control',  color: '#fbbf24' },
];

const PAINT_COLORS = { red: '#ef4444', blue: '#3b82f6', yellow: '#eab308', green: '#22c55e' };

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
        i++; continue;
      }
    }
    out.push(b);
  }
  return out;
}

function compileProgram(blocks, start, obstacles = []) {
  const expanded = expandBlocks(blocks);
  let cur = { col: start.col, row: start.row, dir: start.dir ?? 0, painted: [] };
  const frames = [{ ...cur, painted: [...cur.painted] }];
  const logs = [];
  const obs = new Set(obstacles.map(o => `${o.col},${o.row}`));

  const move = (steps, sign = 1) => {
    for (let s = 0; s < steps; s++) {
      const nxt = { ...cur, painted: [...cur.painted] };
      const d = ((cur.dir % 360) + 360) % 360;
      if (d === 0) nxt.col += sign;
      else if (d === 90) nxt.row -= sign;
      else if (d === 180) nxt.col -= sign;
      else nxt.row += sign;
      if (obs.has(`${nxt.col},${nxt.row}`)) { logs.push(`✗ Hit wall`); return false; }
      cur = nxt;
      frames.push({ ...cur, painted: [...cur.painted] });
    }
    return true;
  };

  for (const b of expanded) {
    if (!BLOCK_CATALOG[b.id]) continue;
    if (b.id === 'forward') { if (!move(b.param || 1, 1)) break; }
    else if (b.id === 'backward') { if (!move(b.param || 1, -1)) break; }
    else if (b.id === 'turn_left') {
      cur = { ...cur, dir: cur.dir - 90, painted: [...cur.painted] };
      frames.push({ ...cur });
    } else if (b.id === 'turn_right') {
      cur = { ...cur, dir: cur.dir + 90, painted: [...cur.painted] };
      frames.push({ ...cur });
    } else if (b.id === 'paint') {
      cur.painted.push({ col: cur.col, row: cur.row, color: b.param || 'red' });
      frames.push({ ...cur, painted: [...cur.painted] });
    }
    logs.push(`${b.id}${b.param ? ` ${b.param}` : ''} → (${cur.col},${cur.row})`);
  }
  return { frames, logs, final: cur };
}

/* ── Scratch-style block ── */
function ScratchBlock({ def, param, index, isActive, isWorkspace, onParamClick, onDelete }) {
  const bg = isActive ? def.color : def.color;
  const shadow = isActive ? `0 0 12px ${def.color}88` : 'none';

  return (
    <div style={{ position: 'relative', marginBottom: 3, userSelect: 'none' }}>
      <div onClick={onParamClick}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: isWorkspace ? '8px 10px' : '7px 10px',
          background: bg,
          borderRadius: isWorkspace ? '0 8px 8px 8px' : '8px',
          boxShadow: shadow,
          cursor: def.param ? 'pointer' : isWorkspace ? 'default' : 'grab',
          position: 'relative',
          border: isActive ? `2px solid #fff` : '2px solid transparent',
          transition: 'box-shadow 0.15s',
        }}>
        {/* Notch tab at top-left for workspace blocks */}
        {isWorkspace && (
          <div style={{
            position: 'absolute', top: -8, left: 12,
            width: 28, height: 8,
            background: bg,
            borderRadius: '4px 4px 0 0',
          }} />
        )}
        <span style={{ fontSize: isWorkspace ? 15 : 13, lineHeight: 1 }}>{def.icon}</span>
        <span style={{ flex: 1, fontSize: 12, fontWeight: 800, color: '#fff', letterSpacing: '0.01em' }}>{def.label}</span>
        {param !== undefined && (
          <span style={{
            background: 'rgba(0,0,0,0.25)', borderRadius: 20,
            padding: '2px 10px', fontSize: 12, fontWeight: 900, color: '#fff',
            minWidth: 24, textAlign: 'center',
            ...(def.param === 'color' ? { background: PAINT_COLORS[param] || '#fff', padding: '2px 14px' } : {}),
          }}>
            {def.param === 'color' ? '' : param}
          </span>
        )}
        {isWorkspace && index !== undefined && (
          <span style={{ fontSize: 10, fontWeight: 900, color: 'rgba(255,255,255,0.5)', minWidth: 16, textAlign: 'right' }}>
            {index + 1}
          </span>
        )}
      </div>
      {isWorkspace && onDelete && (
        <button type="button" onClick={e => { e.stopPropagation(); onDelete(); }}
          style={{
            position: 'absolute', top: 2, right: -22, width: 18, height: 18,
            background: 'rgba(239,68,68,0.85)', border: 'none', borderRadius: '50%',
            color: '#fff', fontSize: 10, cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 2,
          }}>✕</button>
      )}
    </div>
  );
}

export default function BlockCodingLab({ config, color, storageKey, onComplete }) {
  const { mission, hints = [], starterBlocks = [], solutionBlocks = [] } = config;
  const COLS = mission.gridCols || 8;
  const ROWS = mission.gridRows || 6;
  const INITIAL = mission.start || { col: 0, row: Math.floor(ROWS / 2), dir: 0 };
  const target = mission.target;
  const obstacles = mission.obstacles || [];

  /* Dynamic cell size from simulator container */
  const simRef = useRef(null);
  const [cell, setCell] = useState(40);
  useEffect(() => {
    if (!simRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const byW = Math.floor((width - 4) / COLS);
      const byH = Math.floor((height - 60) / ROWS); // leave room for status
      setCell(Math.max(24, Math.min(56, byW, byH)));
    });
    ro.observe(simRef.current);
    return () => ro.disconnect();
  }, [COLS, ROWS]);

  const [workspace, setWorkspace] = useState(() => {
    try { const s = localStorage.getItem(`${storageKey}_blocks`); if (s) return JSON.parse(s); } catch { /**/ }
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
  const [hintLevel, setHintLevel] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [speed, setSpeed] = useState('normal');
  const [activeBlock, setActiveBlock] = useState(null);
  const dragType = useRef(null);
  const wsRef = useRef(null);

  const speedMs = { slow: 700, normal: 380, fast: 120, instant: 0 }[speed];

  const save = useCallback(() => {
    localStorage.setItem(`${storageKey}_blocks`, JSON.stringify(workspace.map(({ uid, id, param }) => ({ uid, id, param }))));
  }, [workspace, storageKey]);
  useEffect(() => { save(); }, [workspace, save]);

  const addBlock = (id) => {
    if (running) return;
    const def = BLOCK_CATALOG[id];
    const param = def.param === 'color' ? 'red' : def.param ? (def.min || 1) : undefined;
    setWorkspace(w => [...w, { id, param, uid: uid() }]);
    setSuccess(false); setError(null);
    setTimeout(() => { if (wsRef.current) wsRef.current.scrollTop = 9999; }, 50);
  };

  const checkSuccess = useCallback((frame) => {
    if (target && frame.col === target.col && frame.row === target.row) {
      setSuccess(true); onComplete?.();
    } else if (target) {
      setError(`Robot at (${frame.col},${frame.row}) — goal is (${target.col},${target.row})`);
    } else if (workspace.length >= 2) {
      setSuccess(true); onComplete?.();
    }
  }, [target, workspace.length, onComplete]);

  const run = () => {
    if (workspace.length === 0 || running) return;
    const { frames: f, logs: l } = compileProgram(workspace, INITIAL, obstacles);
    setFrames(f); setTrail([]); setSuccess(false); setError(null);
    setRunning(true); setPaused(false);
    if (speed === 'instant') {
      const last = f[f.length - 1];
      setPos(last); setTrail(f.map(p => ({ col: p.col, row: p.row }))); setRunning(false);
      checkSuccess(last);
    } else { setFrameIdx(0); }
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
      setRunning(false); setFrameIdx(-1); setActiveBlock(null);
      checkSuccess(frame); return;
    }
    const t = setTimeout(() => setFrameIdx(i => i + 1), speedMs);
    return () => clearTimeout(t);
  }, [frameIdx, frames, paused, speedMs, checkSuccess, workspace.length]);

  const stepOnce = () => {
    if (!running && frames.length === 0) {
      const { frames: f } = compileProgram(workspace, INITIAL, obstacles);
      setFrames(f); setFrameIdx(0); setRunning(true); return;
    }
    if (frameIdx < frames.length - 1) setFrameIdx(i => i + 1);
  };

  const reset = () => {
    setWorkspace(starterBlocks.map(b => ({ ...b, uid: uid() })));
    setFrames([]); setFrameIdx(-1); setPos({ ...INITIAL, painted: [] }); setTrail([]);
    setRunning(false); setSuccess(false); setError(null); setShowSolution(false); setActiveBlock(null);
  };

  const cycleParam = (blockUid) => {
    setWorkspace(w => w.map(b => {
      if (b.uid !== blockUid) return b;
      const def = BLOCK_CATALOG[b.id];
      if (def.param === 'color') {
        const i = def.colors.indexOf(b.param);
        return { ...b, param: def.colors[(i + 1) % def.colors.length] };
      }
      if (def.param) {
        const v = (b.param || def.min || 1) + 1;
        return { ...b, param: v > (def.max || 10) ? (def.min || 1) : v };
      }
      return b;
    }));
  };

  const onDragStart = (e, id) => { dragType.current = id; e.dataTransfer.setData('text/plain', id); };
  const onDropWS = (e) => {
    e.preventDefault();
    const id = dragType.current || e.dataTransfer.getData('text/plain');
    if (BLOCK_CATALOG[id]) addBlock(id);
    dragType.current = null;
  };

  const painted = pos.painted || [];
  const gridW = COLS * cell;
  const gridH = ROWS * cell;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', width: '100%',
      background: '#0a0d1a', borderRadius: 12, overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.08)', fontFamily: 'inherit',
    }}>
      {/* ── Top bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', flexWrap: 'wrap',
        background: 'rgba(0,0,0,0.3)', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0,
      }}>
        <span style={{ fontSize: 11, fontWeight: 900, color, letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>⚡ CODING LAB</span>
        <span style={{ flex: 1, fontSize: 11, color: 'rgba(255,255,255,0.55)', minWidth: 0,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {mission.char} {mission.goal}
        </span>
        <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
          {hintLevel < hints.length && (
            <button type="button" onClick={() => setHintLevel(h => h + 1)} style={pill(color)}>
              💡 Hint {hintLevel > 0 ? `${hintLevel}/${hints.length}` : ''}
            </button>
          )}
          <button type="button" onClick={() => { setShowSolution(true); setWorkspace(solutionBlocks.map(b => ({ ...b, uid: uid() }))); }}
            style={pill('#6366f1')}>📋 Solution</button>
        </div>
      </div>

      {hintLevel > 0 && hints[hintLevel - 1] && (
        <div style={{ padding: '7px 12px', background: 'rgba(245,158,11,0.1)',
          borderBottom: '1px solid rgba(245,158,11,0.2)', fontSize: 11, color: '#fde68a', flexShrink: 0 }}>
          💡 {hints[hintLevel - 1]}
        </div>
      )}

      {/* ── 3-col body ── */}
      <div style={{ display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* Col 1 – Toolbox */}
        <div style={{
          width: '22%', minWidth: 140, maxWidth: 200, flexShrink: 0,
          overflowY: 'auto', overflowX: 'hidden',
          background: 'rgba(0,0,0,0.22)', borderRight: '1px solid rgba(255,255,255,0.07)',
          padding: '10px 8px',
        }}>
          <div style={catLabel}>TOOLBOX</div>
          {CATEGORIES.map(cat => (
            <div key={cat.name} style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 9, fontWeight: 900, color: cat.color, letterSpacing: '0.1em', marginBottom: 5 }}>
                {cat.name.toUpperCase()}
              </div>
              {Object.entries(BLOCK_CATALOG).filter(([, d]) => d.cat === cat.name).map(([id, def]) => (
                <div key={id} draggable onDragStart={e => onDragStart(e, id)} onClick={() => addBlock(id)}>
                  <ScratchBlock def={def} param={def.param === 'color' ? 'red' : def.param ? def.min : undefined} />
                </div>
              ))}
            </div>
          ))}
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: 4 }}>
            click or drag →
          </div>
        </div>

        {/* Col 2 – Script */}
        <div style={{
          width: '28%', minWidth: 160, maxWidth: 240, flexShrink: 0,
          display: 'flex', flexDirection: 'column',
          background: '#0c0f1e', borderRight: '1px solid rgba(255,255,255,0.07)',
        }}
          onDragOver={e => e.preventDefault()} onDrop={onDropWS}>

          <div style={{ padding: '6px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
            <span style={catLabel}>SCRIPT ({workspace.length})</span>
          </div>

          <div ref={wsRef} style={{
            flex: 1, overflowY: 'auto', padding: '10px 26px 10px 12px',
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '18px 18px',
          }}>
            {workspace.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 8px', color: 'rgba(255,255,255,0.2)', fontSize: 11, lineHeight: 1.9 }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>🧩</div>
                Click blocks in the<br />toolbox to add them
              </div>
            ) : workspace.map((b, i) => {
              const def = BLOCK_CATALOG[b.id];
              return (
                <ScratchBlock key={b.uid} def={def} param={b.param}
                  index={i} isActive={activeBlock === i && running} isWorkspace
                  onParamClick={() => !running && def.param && cycleParam(b.uid)}
                  onDelete={() => !running && setWorkspace(w => w.filter(x => x.uid !== b.uid))} />
              );
            })}
            {workspace.length > 0 && (
              <div style={{ height: 48, border: '2px dashed rgba(255,255,255,0.07)', borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, color: 'rgba(255,255,255,0.18)', marginTop: 6 }}>drop here</div>
            )}
          </div>

          {/* Controls */}
          <div style={{ padding: '8px 10px', borderTop: '1px solid rgba(255,255,255,0.07)',
            background: 'rgba(0,0,0,0.18)', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: 5, marginBottom: 6 }}>
              <button type="button" onClick={run} disabled={running || workspace.length === 0}
                style={{
                  flex: 1, padding: '8px 0', background: success ? '#059669' : running ? '#1e293b' : color,
                  border: 'none', borderRadius: 8, color: '#fff', fontWeight: 900, fontSize: 12,
                  cursor: running || workspace.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: workspace.length === 0 ? 0.5 : 1,
                  boxShadow: running || workspace.length === 0 ? 'none' : `0 2px 10px ${color}44`,
                }}>
                {running ? '⏳' : success ? '✓ Done!' : '▶ Run'}
              </button>
              <button type="button" onClick={() => setPaused(p => !p)} disabled={!running} style={iconBtn}>{paused ? '▶' : '⏸'}</button>
              <button type="button" onClick={stepOnce} style={iconBtn}>⏭</button>
              <button type="button" onClick={reset} style={{ ...iconBtn, color: '#f87171' }}>↺</button>
            </div>
            <div style={{ display: 'flex', gap: 3 }}>
              {[['slow','🐢'],['normal','🚶'],['fast','🏃'],['instant','⚡']].map(([s, ic]) => (
                <button key={s} type="button" onClick={() => setSpeed(s)}
                  style={{
                    flex: 1, padding: '3px 0', fontSize: 11,
                    background: speed === s ? color + '30' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${speed === s ? color : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 5, color: speed === s ? '#fff' : 'rgba(255,255,255,0.35)', cursor: 'pointer',
                  }}>{ic}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Col 3 – Simulator */}
        <div ref={simRef} style={{
          flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: 12, gap: 8, overflow: 'hidden',
        }}>
          <div style={{ fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', alignSelf: 'flex-start' }}>
            SIMULATOR
          </div>

          {/* Grid */}
          <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden',
            boxShadow: '0 4px 24px rgba(0,0,0,0.5)', border: '1.5px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${COLS}, ${cell}px)`,
              gridTemplateRows: `repeat(${ROWS}, ${cell}px)`, background: '#080b16' }}>
              {Array.from({ length: ROWS * COLS }, (_, idx) => {
                const col = idx % COLS, row = Math.floor(idx / COLS);
                const isTarget = target && target.col === col && target.row === row;
                const isObs = obstacles.some(o => o.col === col && o.row === row);
                const isTrail = trail.some(p => p.col === col && p.row === row);
                const paint = painted.find(p => p.col === col && p.row === row);
                return (
                  <div key={idx} style={{ width: cell, height: cell, boxSizing: 'border-box',
                    border: '1px solid rgba(255,255,255,0.04)',
                    background: paint ? PAINT_COLORS[paint.color] + '99'
                      : isObs ? '#1e293b'
                      : isTarget && success ? 'rgba(16,185,129,0.25)'
                      : isTarget ? 'rgba(245,158,11,0.12)'
                      : isTrail ? color + '15' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: cell * 0.42 }}>
                    {isObs ? '🧱' : isTarget ? (success ? '✨' : mission.tEmoji) : ''}
                  </div>
                );
              })}
            </div>
            {/* Robot */}
            <div style={{
              position: 'absolute', left: pos.col * cell + cell / 2, top: pos.row * cell + cell / 2,
              transform: `translate(-50%, -50%) rotate(${pos.dir || 0}deg)`,
              fontSize: cell * 0.55,
              transition: speed === 'instant' ? 'none' : `left ${speedMs * 0.85}ms ease, top ${speedMs * 0.85}ms ease`,
              pointerEvents: 'none', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.8))',
            }}>{mission.char}</div>
          </div>

          {/* Status */}
          {success && (
            <div style={{ padding: '8px 16px', background: 'rgba(16,185,129,0.12)',
              border: '1.5px solid #10b981', borderRadius: 10,
              color: '#6ee7b7', fontWeight: 800, fontSize: 12, textAlign: 'center' }}>
              🎉 Mission complete! +{config.xp || 25} XP
            </div>
          )}
          {error && !success && (
            <div style={{ padding: '6px 12px', background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#fca5a5', fontSize: 11 }}>
              {error}
            </div>
          )}
          {showSolution && !success && (
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
              Solution loaded — study it, then write your own!
            </div>
          )}
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>
            ({pos.col},{pos.row}) {['→','↑','←','↓'][Math.round((((pos.dir||0)%360)+360)/90)%4]}
          </div>
        </div>
      </div>
    </div>
  );
}

const catLabel = { fontSize: 9, fontWeight: 900, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', display: 'block', marginBottom: 6 };
const pill = c => ({ padding: '3px 10px', background: c + '20', border: `1px solid ${c}50`, borderRadius: 20, color: c, fontSize: 10, fontWeight: 700, cursor: 'pointer' });
const iconBtn = { width: 32, height: 32, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, color: '#fff', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
