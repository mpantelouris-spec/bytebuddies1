import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import LabBuddy from './LabBuddy.jsx';
import { runProgram, judgeRun, starsFor, blockCount } from './labEngine.js';
import { EmojiIcon, IconText } from '../../ui/Icon.jsx';

const BLOCKS = {
  forward:    { cat: 'Move',    label: 'Move forward', icon: '⬆️', color: '#4c6ef5', num: [1, 9] },
  backward:   { cat: 'Move',    label: 'Move back',    icon: '⬇️', color: '#4c6ef5', num: [1, 9] },
  turn_left:  { cat: 'Move',    label: 'Turn left',    icon: '↩️', color: '#7950f2' },
  turn_right: { cat: 'Move',    label: 'Turn right',   icon: '↪️', color: '#7950f2' },
  paint:      { cat: 'Actions', label: 'Paint',        icon: '🖌️', color: '#e64980', colors: ['red', 'yellow', 'blue', 'green'] },
  grab:       { cat: 'Actions', label: 'Grab',         icon: '🤏', color: '#d6336c' },
  release:    { cat: 'Actions', label: 'Release',      icon: '👐', color: '#d6336c' },
  repeat:     { cat: 'Loops',   label: 'Repeat',       icon: '🔁', color: '#f08c00', num: [2, 12] },
};
const PAINT = { red: '#fa5252', yellow: '#fcc419', blue: '#339af0', green: '#40c057' };
const CAT_COLOR = { Move: '#4c6ef5', Actions: '#e64980', Loops: '#f08c00' };
const SPEED = { slow: 650, normal: 360, fast: 140 };

let _uid = 0;
const uid = () => `b${Date.now().toString(36)}${(_uid++).toString(36)}`;
const withUids = (list) => list.map((b) => ({ id: b.id, param: b.param, uid: uid() }));

/** Nesting depth of each block (Repeat bodies are indented). */
function depths(blocks) {
  let d = 0;
  return blocks.map((b) => {
    if (b.id === 'end_repeat') { d = Math.max(0, d - 1); return d; }
    const here = d;
    if (b.id === 'repeat') d += 1;
    return here;
  });
}

function defaultParam(id) {
  const def = BLOCKS[id];
  if (def?.colors) return def.colors[0];
  if (def?.num) return id === 'repeat' ? 3 : 1;
  return undefined;
}

function useWidth(ref) {
  const [w, setW] = useState(900);
  useEffect(() => {
    if (!ref.current) return undefined;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, [ref]);
  return w;
}

// ── Script block ─────────────────────────────────────────────────────────────
function ScriptBlock({ b, depth, active, selected, disabled, onSelect, onParam, onDelete }) {
  if (b.id === 'end_repeat') {
    return (
      <div onClick={onSelect} style={{ marginLeft: depth * 20, display: 'flex' }}>
        <div style={{
          height: 16, width: 120, background: BLOCKS.repeat.color, borderRadius: '0 0 10px 10px',
          opacity: 0.95, fontSize: 10, color: '#fff', fontWeight: 800, paddingLeft: 10, lineHeight: '16px',
          outline: selected ? '3px solid #ffd43b' : 'none', cursor: 'pointer',
        }}>end repeat</div>
      </div>
    );
  }
  const def = BLOCKS[b.id] || { label: b.id, icon: '•', color: '#868e96' };
  const isRepeat = b.id === 'repeat';
  return (
    <div style={{ marginLeft: depth * 20, position: 'relative' }}>
      <div
        role="button"
        tabIndex={0}
        onClick={onSelect}
        onKeyDown={(e) => { if (e.key === 'Delete' || e.key === 'Backspace') onDelete(); }}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, minHeight: 40, padding: '6px 34px 6px 10px',
          background: def.color, color: '#fff', borderRadius: isRepeat ? '10px 10px 10px 0' : 10,
          boxShadow: active ? `0 0 0 3px #fff, 0 0 16px ${def.color}` : 'inset 0 -3px 0 rgba(0,0,0,0.18)',
          outline: selected && !active ? '3px solid #ffd43b' : 'none',
          transform: active ? 'scale(1.03)' : 'none', transition: 'transform 0.12s, box-shadow 0.12s',
          cursor: 'pointer', userSelect: 'none', fontWeight: 800, fontSize: 14,
        }}>
        <span aria-hidden style={{ fontSize: 16 }}><EmojiIcon e={def.icon} /></span>
        <span>{def.label}</span>
        {def.num && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, background: 'rgba(255,255,255,0.22)', borderRadius: 999, padding: 2 }}>
            <button type="button" aria-label="less" disabled={disabled} onClick={(e) => { e.stopPropagation(); onParam(-1); }} style={numBtn}>−</button>
            <span style={{ minWidth: 20, textAlign: 'center', fontSize: 15 }}>{b.param}</span>
            <button type="button" aria-label="more" disabled={disabled} onClick={(e) => { e.stopPropagation(); onParam(1); }} style={numBtn}>+</button>
          </span>
        )}
        {isRepeat && <span>times</span>}
        {def.colors && (
          <button type="button" aria-label={`colour ${b.param}`} disabled={disabled}
            onClick={(e) => { e.stopPropagation(); onParam(1); }}
            style={{ width: 34, height: 24, borderRadius: 999, border: '2px solid #fff', background: PAINT[b.param] || '#fff', cursor: 'pointer' }} />
        )}
      </div>
      {!disabled && (
        <button type="button" aria-label="delete block" onClick={(e) => { e.stopPropagation(); onDelete(); }}
          style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', width: 24, height: 24,
            borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.25)', color: '#fff', fontSize: 12, cursor: 'pointer' }}>✕</button>
      )}
    </div>
  );
}

const numBtn = { width: 24, height: 24, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,0.9)', color: '#1e293b', fontWeight: 900, fontSize: 15, cursor: 'pointer', lineHeight: 1, padding: 0 };

// ── Lab ──────────────────────────────────────────────────────────────────────
export default function BlockCodingLab({ config, color = '#14b8a6', storageKey = 'bb_lab', onComplete }) {
  const { mission = {}, hints = [], starterBlocks = [], solutionBlocks = [] } = config || {};
  const COLS = mission.gridCols || 8;
  const ROWS = mission.gridRows || 6;
  const START = mission.start || { col: 0, row: Math.floor(ROWS / 2), dir: 0 };
  const saveKey = `${storageKey}_v2`;

  const rootRef = useRef(null);
  const width = useWidth(rootRef);
  const wide = width >= 820;

  const [blocks, setBlocks] = useState(() => {
    try { const s = JSON.parse(localStorage.getItem(saveKey) || 'null'); if (Array.isArray(s)) return withUids(s); } catch { /* storage unavailable */ }
    return withUids(starterBlocks);
  });
  const [cursor, setCursor] = useState(() => blocks.length);
  const [frames, setFrames] = useState(null);
  const [fi, setFi] = useState(0);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState('normal');
  const [verdict, setVerdict] = useState(null);
  const [hintLevel, setHintLevel] = useState(0);
  const [sawSolution, setSawSolution] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [predictResult, setPredictResult] = useState(null);
  const [stars, setStars] = useState(() => Number(localStorage.getItem(`${saveKey}_stars`) || 0));
  const doneOnce = useRef(false);

  useEffect(() => {
    try { localStorage.setItem(saveKey, JSON.stringify(blocks.map(({ id, param }) => ({ id, param })))); } catch { /* ignore */ }
  }, [blocks, saveKey]);

  const toolbox = useMemo(() => {
    const ids = ['forward', 'turn_left', 'turn_right'];
    if (COLS >= 7) ids.splice(1, 0, 'backward');
    const used = new Set([...starterBlocks, ...solutionBlocks].map((b) => b.id));
    if (mission.paintTargets?.length || used.has('paint')) ids.push('paint');
    if (mission.parcel || used.has('grab')) ids.push('grab', 'release');
    ids.push('repeat');
    return ids;
  }, [COLS, mission.paintTargets, mission.parcel, starterBlocks, solutionBlocks]);

  const bestCount = useMemo(() => blockCount(solutionBlocks), [solutionBlocks]);
  const dep = useMemo(() => depths(blocks), [blocks]);
  const frame = frames ? frames[Math.min(fi, frames.length - 1)] : { col: START.col, row: START.row, dir: START.dir ?? 0, painted: {}, collected: [], cpNext: 0, carrying: false, delivered: false, blk: -1 };
  const busy = running;

  const edit = (fn) => {
    if (busy) return;
    setVerdict(null); setFrames(null); setFi(0); setPredictResult(null);
    fn();
  };

  const addBlock = (id) => edit(() => {
    const at = Math.min(cursor, blocks.length);
    const add = id === 'repeat'
      ? [{ id, param: defaultParam(id), uid: uid() }, { id: 'end_repeat', uid: uid() }]
      : [{ id, param: defaultParam(id), uid: uid() }];
    setBlocks((bs) => [...bs.slice(0, at), ...add, ...bs.slice(at)]);
    setCursor(at + 1);
  });

  const removeBlock = (i) => edit(() => {
    setBlocks((bs) => {
      const out = [...bs];
      if (out[i].id === 'repeat') {
        let d = 0;
        for (let j = i + 1; j < out.length; j++) {
          if (out[j].id === 'repeat') d++;
          if (out[j].id === 'end_repeat') { if (d === 0) { out.splice(j, 1); break; } d--; }
        }
      }
      out.splice(i, 1);
      return out;
    });
    setCursor((c) => Math.max(0, Math.min(c > i ? c - 1 : c, blocks.length - 1)));
  });

  const changeParam = (i, delta) => edit(() => {
    setBlocks((bs) => bs.map((b, j) => {
      if (j !== i) return b;
      const def = BLOCKS[b.id];
      if (def.colors) return { ...b, param: def.colors[(def.colors.indexOf(b.param) + 1) % def.colors.length] };
      const [lo, hi] = def.num;
      return { ...b, param: Math.max(lo, Math.min(hi, (b.param || lo) + delta)) };
    }));
  });

  const finish = useCallback((result) => {
    const v = judgeRun(result, blocks, mission);
    setVerdict(v);
    if (mission.predict && prediction) {
      const f = result.final;
      setPredictResult(f.col === prediction.col && f.row === prediction.row);
    }
    if (v.ok) {
      const s = starsFor({ blocks, mission, hintsUsed: hintLevel, sawSolution, bestCount });
      setStars((old) => {
        const best = Math.max(old, s);
        try { localStorage.setItem(`${saveKey}_stars`, String(best)); } catch { /* ignore */ }
        return best;
      });
      if (!doneOnce.current) { doneOnce.current = true; onComplete?.(); }
    }
  }, [blocks, mission, prediction, hintLevel, sawSolution, bestCount, saveKey, onComplete]);

  const resultRef = useRef(null);
  const run = () => {
    if (busy || !blocks.length) return;
    const result = runProgram(blocks, mission);
    resultRef.current = result;
    setVerdict(null); setPredictResult(null);
    setFrames(result.frames); setFi(0); setRunning(true);
  };

  useEffect(() => {
    if (!running || !frames) return undefined;
    if (fi >= frames.length - 1) {
      setRunning(false);
      finish(resultRef.current);
      return undefined;
    }
    const t = setTimeout(() => setFi((i) => i + 1), SPEED[speed]);
    return () => clearTimeout(t);
  }, [running, fi, frames, speed, finish]);

  const resetDot = () => { if (!busy) { setFrames(null); setFi(0); setVerdict(null); setPredictResult(null); } };
  const clearAll = () => edit(() => { setBlocks(withUids(starterBlocks)); setCursor(starterBlocks.length); setSawSolution(false); });
  const showSolution = () => edit(() => { setBlocks(withUids(solutionBlocks)); setCursor(solutionBlocks.length); setSawSolution(true); });

  // ── Stage ──
  const stageW = wide ? Math.max(260, width - 170 - 280 - 40) : width - 16;
  const cell = Math.max(34, Math.min(72, Math.floor(stageW / COLS)));
  const walls = new Set((mission.obstacles || []).map((o) => `${o.col},${o.row}`));
  const gemAt = new Map((mission.gems || []).map((g) => [`${g.col},${g.row}`, g]));
  const paintAt = new Map((mission.paintTargets || []).map((p) => [`${p.col},${p.row}`, p]));
  const cpAt = new Map((mission.checkpoints || []).map((c, i) => [`${c.col},${c.row}`, i]));
  const trail = new Set((frames || []).slice(0, fi + 1).map((f) => `${f.col},${f.row}`));
  const needPredict = mission.predict && !prediction && !frames;
  const dir = ((frame.dir % 360) + 360) % 360;
  const count = blockCount(blocks);

  const stage = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, minWidth: 0 }}>
      {mission.predict && (
        <div style={{ ...banner, background: '#fff9db', borderColor: '#fcc419', color: '#7a5b00' }}>
          <IconText>{predictResult === true && '🎯 Your prediction was spot on!'}</IconText>
          {predictResult === false && '🤔 Dot stopped somewhere else — that’s why we test our predictions!'}
          {predictResult == null && (prediction ? '🤔 Prediction saved. Now press ▶ Go to test it.' : '🤔 Predict first: tap the square where you think Dot will stop.')}
        </div>
      )}
      <div style={{
        position: 'relative', display: 'grid', gridTemplateColumns: `repeat(${COLS}, ${cell}px)`,
        gridTemplateRows: `repeat(${ROWS}, ${cell}px)`, borderRadius: 14, overflow: 'hidden',
        border: '4px solid #2b8a3e', boxShadow: '0 6px 0 #1f6f30, 0 12px 24px rgba(0,0,0,0.25)', background: '#8ce99a',
      }}>
        {Array.from({ length: ROWS * COLS }, (_, n) => {
          const c = n % COLS; const r = Math.floor(n / COLS); const key = `${c},${r}`;
          const paintTarget = paintAt.get(key);
          const painted = frame.painted[key];
          const isStar = mission.target && mission.target.col === c && mission.target.row === r;
          const isHouse = mission.house && mission.house.col === c && mission.house.row === r;
          const isParcel = mission.parcel && mission.parcel.col === c && mission.parcel.row === r && !frame.carrying && !frame.delivered;
          const gem = gemAt.has(key) && !frame.collected.includes(key);
          const cp = cpAt.get(key);
          const predicted = prediction && prediction.col === c && prediction.row === r;
          return (
            <div key={key}
              onClick={() => { if (mission.predict && !busy) { setPrediction({ col: c, row: r }); setPredictResult(null); } }}
              style={{
                width: cell, height: cell, boxSizing: 'border-box', position: 'relative',
                background: painted ? PAINT[painted] : walls.has(key) ? '#868e96' : (c + r) % 2 ? '#b2f2bb' : '#d3f9d8',
                boxShadow: paintTarget && !painted ? `inset 0 0 0 3px ${PAINT[paintTarget.color]}, inset 0 0 14px ${PAINT[paintTarget.color]}` : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: cell * 0.5,
                cursor: mission.predict ? 'pointer' : 'default',
              }}>
              {walls.has(key) && <span aria-label="wall"><EmojiIcon e="🧱" /></span>}
              {trail.has(key) && !walls.has(key) && <span style={{ position: 'absolute', width: 8, height: 8, borderRadius: 4, background: `${color}aa` }} />}
              {isStar && <span aria-label="star" style={{ filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))' }}>⭐</span>}
              {isHouse && <span aria-label="house"><EmojiIcon e="🏠" /></span>}
              {isParcel && <span aria-label="parcel"><EmojiIcon e="📦" /></span>}
              {gem && <span aria-label="gem"><EmojiIcon e="💎" /></span>}
              {cp != null && (
                <span aria-label={`flag ${cp + 1}`} style={{ position: 'relative' }}>
                  🚩<b style={{ position: 'absolute', right: -6, bottom: -4, fontSize: cell * 0.24, background: frame.cpNext > cp ? '#2f9e44' : '#fff', color: frame.cpNext > cp ? '#fff' : '#1e293b', borderRadius: 8, padding: '0 4px' }}>{cp + 1}</b>
                </span>
              )}
              {paintTarget && !painted && <span style={{ position: 'absolute', inset: 6, borderRadius: 6, border: `2px dashed ${PAINT[paintTarget.color]}` }} />}
              {predicted && <span aria-label="your prediction" style={{ position: 'absolute', top: 2, right: 4, fontSize: cell * 0.3 }}>🤔</span>}
            </div>
          );
        })}
        {/* Dot */}
        <div style={{
          position: 'absolute', left: frame.col * cell, top: frame.row * cell, width: cell, height: cell,
          display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
          transition: `left ${SPEED[speed] * 0.8}ms ease-in-out, top ${SPEED[speed] * 0.8}ms ease-in-out`,
          animation: frame.bump ? 'bb-lab-shake 0.4s' : undefined,
        }}>
          <LabBuddy size={cell * 1.08} mood={verdict?.ok ? 'happy' : undefined} />
          {frame.carrying && <span style={{ position: 'absolute', top: -2, right: 2, fontSize: cell * 0.3 }}><EmojiIcon e="📦" /></span>}
          <span aria-hidden style={{
            position: 'absolute', left: '50%', top: '50%', width: cell, height: cell, marginLeft: -cell / 2, marginTop: -cell / 2,
            transform: `rotate(${-dir}deg)`, transition: `transform ${SPEED[speed] * 0.6}ms`,
          }}>
            <span style={{ position: 'absolute', right: -2, top: '50%', transform: 'translateY(-50%)', width: 0, height: 0,
              borderTop: `${cell * 0.12}px solid transparent`, borderBottom: `${cell * 0.12}px solid transparent`, borderLeft: `${cell * 0.16}px solid #f59f00` }} />
          </span>
        </div>
      </div>
      {(mission.gems?.length > 0) && (
        <div style={{ fontWeight: 900, color: '#1e293b', background: '#fff', borderRadius: 999, padding: '4px 14px', boxShadow: '0 2px 0 #dee2e6' }}>
          score = {frame.collected.length} 💎
        </div>
      )}
      {verdict && (
        <div role="status" style={{ ...banner, ...(verdict.ok
          ? { background: '#ebfbee', borderColor: '#40c057', color: '#2b8a3e' }
          : { background: '#fff4e6', borderColor: '#ff922b', color: '#a63e00' }) }}>
          <div style={{ fontWeight: 900, fontSize: 16 }}>
            <IconText>{verdict.ok ? `🎉 ${verdict.message}` : verdict.message}</IconText>
          </div>
          {verdict.ok ? (
            <div style={{ marginTop: 4 }}>
              <span style={{ fontSize: 22, letterSpacing: 2 }}>{'⭐'.repeat(stars)}<span style={{ opacity: 0.25 }}>{'⭐'.repeat(3 - stars)}</span></span>
              {stars < 3 && <div style={{ fontSize: 13, marginTop: 2 }}>{sawSolution ? 'Now try building it yourself for more stars!' : 'Can you do it with fewer blocks or hints for 3 stars?'}</div>}
            </div>
          ) : <div style={{ fontSize: 13, marginTop: 2 }}><EmojiIcon e="💡" style={{ marginRight: '0.35em' }} />{verdict.tip}</div>}
        </div>
      )}
    </div>
  );

  const toolboxEl = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }} aria-label="Toolbox">
      <div style={colHead}>Blocks <span style={{ fontWeight: 600, textTransform: 'none', letterSpacing: 0 }}>· tap to add</span></div>
      {['Move', 'Actions', 'Loops'].map((cat) => {
        const ids = toolbox.filter((id) => BLOCKS[id].cat === cat);
        if (!ids.length) return null;
        return (
          <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 4 }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: CAT_COLOR[cat], textTransform: 'uppercase', letterSpacing: '0.08em' }}>{cat}</div>
            {ids.map((id) => (
              <button key={id} type="button" draggable disabled={busy}
                onDragStart={(e) => e.dataTransfer.setData('text/plain', id)}
                onClick={() => addBlock(id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, minHeight: 40, padding: '6px 10px', border: 'none',
                  borderRadius: BLOCKS[id].num && id === 'repeat' ? '10px 10px 10px 0' : 10,
                  background: BLOCKS[id].color, color: '#fff', fontWeight: 800, fontSize: 14, cursor: busy ? 'not-allowed' : 'pointer',
                  boxShadow: 'inset 0 -3px 0 rgba(0,0,0,0.18)', textAlign: 'left', fontFamily: 'inherit',
                }}>
                <span aria-hidden><EmojiIcon e={BLOCKS[id].icon} /></span>{BLOCKS[id].label}
              </button>
            ))}
          </div>
        );
      })}
    </div>
  );

  const scriptEl = (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); const id = e.dataTransfer.getData('text/plain'); if (BLOCKS[id]) addBlock(id); }}
      style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <div style={{ ...colHead, display: 'flex', justifyContent: 'space-between' }}>
        <span>Program</span>
        <span style={{ color: mission.maxBlocks && count > mission.maxBlocks ? '#e03131' : '#64748b', textTransform: 'none', letterSpacing: 0 }}>
          {count} block{count === 1 ? '' : 's'}{mission.maxBlocks ? ` / ${mission.maxBlocks} max` : ''}
        </span>
      </div>
      <div style={{ background: '#f8f9fa', border: '2px solid #e9ecef', borderRadius: 12, padding: 10, minHeight: 220, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div onClick={() => setCursor(0)} style={{
          alignSelf: 'flex-start', background: '#2f9e44', color: '#fff', fontWeight: 900, fontSize: 14, padding: '10px 14px',
          borderRadius: '18px 18px 10px 10px', boxShadow: 'inset 0 -3px 0 rgba(0,0,0,0.18)', cursor: 'pointer',
        }}><EmojiIcon e="🏁" style={{ marginRight: '0.35em' }} />When ▶ Go is pressed</div>
        {blocks.map((b, i) => (
          <React.Fragment key={b.uid}>
            {cursor === i && !busy && <Caret depth={b.id === 'end_repeat' ? dep[i] + 1 : dep[i]} />}
            <ScriptBlock b={b} depth={dep[i]} disabled={busy}
              active={busy && frame.blk === i}
              selected={false}
              onSelect={() => !busy && setCursor(i + 1)}
              onParam={(d) => changeParam(i, d)}
              onDelete={() => removeBlock(i)} />
          </React.Fragment>
        ))}
        {cursor >= blocks.length && !busy && <Caret depth={blocks.length ? dep[blocks.length - 1] + (blocks[blocks.length - 1].id === 'repeat' ? 1 : 0) : 0} empty={!blocks.length} />}
      </div>
      <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>
        New blocks go where the yellow line is. Tap a block to move the line after it.
      </div>
    </div>
  );

  return (
    <div ref={rootRef} style={{ background: '#ffffff', color: '#1e293b', borderRadius: 18, padding: 14, border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(15,23,42,0.18)' }}>
      <style>{`
        @keyframes bb-dot-hop { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-18%) } }
        @keyframes bb-lab-shake { 0%,100% { transform: translateX(0) } 25% { transform: translateX(-5px) } 75% { transform: translateX(5px) } }
      `}</style>

      {/* Mission + controls */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
        <LabBuddy size={48} />
        <div style={{ flex: '1 1 260px', minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.1em', color: '#0c8599', textTransform: 'uppercase' }}>Dot’s mission</div>
          <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.4 }}>{mission.goal}</div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button type="button" onClick={run} disabled={busy || !blocks.length || needPredict}
            title={needPredict ? 'Make a prediction first' : 'Run the program'}
            style={{ ...ctl, background: '#2f9e44', color: '#fff', fontSize: 16, padding: '0 22px', opacity: busy || !blocks.length || needPredict ? 0.55 : 1 }}>
            <EmojiIcon e="▶" style={{ marginRight: '0.35em' }} />Go
          </button>
          <button type="button" onClick={resetDot} disabled={busy} style={ctl}>↺ Reset Dot</button>
          <select aria-label="speed" value={speed} onChange={(e) => setSpeed(e.target.value)} style={{ ...ctl, paddingRight: 8 }}>
            <option value="slow">Slow</option>
            <option value="normal">Normal</option>
            <option value="fast">Fast</option>
          </select>
        </div>
      </div>

      {wide ? (
        <div style={{ display: 'grid', gridTemplateColumns: '170px 280px 1fr', gap: 14, alignItems: 'start' }}>
          {toolboxEl}{scriptEl}{stage}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {stage}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 190px) 1fr', gap: 12, alignItems: 'start' }}>
            {toolboxEl}{scriptEl}
          </div>
        </div>
      )}

      {/* Help row */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTop: '1px solid #e9ecef' }}>
        <button type="button" disabled={hintLevel >= hints.length} onClick={() => setHintLevel((h) => Math.min(hints.length, h + 1))}
          style={{ ...ctl, background: '#fff9db', borderColor: '#fcc419', color: '#7a5b00', opacity: hintLevel >= hints.length ? 0.5 : 1 }}>
          <EmojiIcon e="💡" style={{ marginRight: '0.35em' }} />Hint {hintLevel > 0 ? `${hintLevel}/${hints.length}` : ''}
        </button>
        <button type="button" onClick={clearAll} disabled={busy} style={ctl}><EmojiIcon e="🗑" style={{ marginRight: '0.35em' }} />Start again</button>
        <button type="button" onClick={showSolution} disabled={busy} style={{ ...ctl, color: '#5f3dc4' }}><EmojiIcon e="👀" style={{ marginRight: '0.35em' }} />Show a solution</button>
        {stars > 0 && <span style={{ marginLeft: 'auto', fontWeight: 800 }}>Best: {'⭐'.repeat(stars)}</span>}
      </div>
      {hintLevel > 0 && (
        <ol style={{ margin: '10px 0 0', paddingLeft: 22, color: '#5c4400', background: '#fff9db', borderRadius: 10, padding: '10px 10px 10px 30px' }}>
          {hints.slice(0, hintLevel).map((h, i) => <li key={i} style={{ margin: '2px 0' }}>{h}</li>)}
        </ol>
      )}
    </div>
  );
}

function Caret({ depth = 0, empty }) {
  return (
    <div style={{ marginLeft: depth * 20, display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ height: 4, flex: '0 0 120px', background: '#ffd43b', borderRadius: 2, boxShadow: '0 0 6px #ffd43b' }} />
      {empty && <span style={{ fontSize: 12, color: '#94a3b8' }}>tap a block to add it here</span>}
    </div>
  );
}

const banner = { width: '100%', boxSizing: 'border-box', border: '2px solid', borderRadius: 12, padding: '10px 14px', fontWeight: 700, fontSize: 14, textAlign: 'center' };
const ctl = { minHeight: 42, padding: '0 14px', borderRadius: 12, border: '2px solid #dee2e6', background: '#fff', color: '#1e293b', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' };
const colHead = { fontSize: 11, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#475569', marginBottom: 6 };
