import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CHARACTERS } from '../../../data/learnWorldData';
import BlockCodingLab from '../CodingLab/BlockCodingLab';

// ─── SHARED STYLES ────────────────────────────────────────────────────────────
const successBox = { marginTop:12, padding:'12px 16px', background:'rgba(16,185,129,0.12)',
  border:'1px solid rgba(16,185,129,0.4)', borderRadius:10, color:'#6ee7b7', fontWeight:600, fontSize:14 };
const failBox = { marginTop:12, padding:'12px 16px', background:'rgba(239,68,68,0.09)',
  border:'1px solid rgba(239,68,68,0.3)', borderRadius:10, color:'#fca5a5', fontSize:13,
  display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' };
const tag = (color) => ({
  padding:'3px 7px', background:color+'33', border:`1px solid ${color}55`,
  color:'#fff', borderRadius:5, fontSize:12, cursor:'pointer', fontFamily:'monospace',
});

// ─── GRID ROBOT ───────────────────────────────────────────────────────────────
function GridRobot({ config, color, onComplete }) {
  const {
    size=5, startPos={x:0,y:0}, goalPos={x:4,y:4},
    obstacles=[], instructions='Guide the robot 🤖 to the star ⭐ by adding move commands!',
  } = config;

  const [seq, setSeq]     = useState([]);
  const [pos, setPos]     = useState({...startPos});
  const [trail, setTrail] = useState([]);
  const [running, setRunning] = useState(false);
  const [status, setStatus]   = useState('idle'); // idle|success|fail

  useEffect(() => {
    setSeq([]);
    setPos({ ...startPos });
    setTrail([]);
    setRunning(false);
    setStatus('idle');
  }, [size, startPos.x, startPos.y, goalPos.x, goalPos.y, JSON.stringify(obstacles)]);

  function addCmd(d) {
    if (!running && status !== 'success' && seq.length < 30) setSeq(s=>[...s,d]);
  }
  function removeCmd(i) {
    if (!running && status !== 'success') setSeq(s=>s.filter((_,j)=>j!==i));
  }
  function reset() { setSeq([]); setPos({...startPos}); setTrail([]); setStatus('idle'); }

  async function run() {
    if (running || status === 'success' || !seq.length) return;
    setRunning(true); setStatus('idle');
    let p = {...startPos}; setPos({...p}); setTrail([]);
    const tr=[];
    for (const cmd of seq) {
      await new Promise(r=>setTimeout(r,300));
      const np={...p};
      if (cmd==='U') np.y=Math.max(0,p.y-1);
      if (cmd==='D') np.y=Math.min(size-1,p.y+1);
      if (cmd==='L') np.x=Math.max(0,p.x-1);
      if (cmd==='R') np.x=Math.min(size-1,p.x+1);
      if (!obstacles.some(o=>o.x===np.x&&o.y===np.y)) p=np;
      tr.push({...p}); setTrail([...tr]); setPos({...p});
    }
    setRunning(false);
    if (p.x===goalPos.x && p.y===goalPos.y) { setStatus('success'); onComplete?.(); }
    else setStatus('fail');
  }

  return (
    <div>
      <p style={{color:'#e2e8f0',marginBottom:12,fontSize:14}}>{instructions}</p>
      <div style={{display:'flex',gap:20,flexWrap:'wrap',alignItems:'flex-start'}}>
        {/* Grid */}
        <div style={{display:'grid',gridTemplateColumns:`repeat(${size},46px)`,gap:2}}>
          {Array.from({length:size*size},(_,i)=>{
            const x=i%size, y=Math.floor(i/size);
            const isR=pos.x===x&&pos.y===y;
            const isG=goalPos.x===x&&goalPos.y===y&&!isR;
            const isO=obstacles.some(o=>o.x===x&&o.y===y);
            const inT=trail.some(t=>t.x===x&&t.y===y)&&!isR;
            return (
              <div key={i} style={{width:46,height:46,borderRadius:7,fontSize:isR||isG?22:16,
                display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.22s',
                background:isO?'#374151':isR?color:isG?'#059669':inT?color+'1a':'rgba(255,255,255,0.05)',
                border:`2px solid ${isR?color:isG?'#059669':isO?'#4b5563':'rgba(255,255,255,0.08)'}`,
                boxShadow:isR?`0 0 14px ${color}88`:isG?'0 0 14px #05966988':undefined}}>
                {isR?'🤖':isG?'⭐':isO?'🧱':''}
              </div>
            );
          })}
        </div>
        {/* Direction pad */}
        <div>
          <div style={{fontSize:11,color:'rgba(255,255,255,0.35)',marginBottom:6}}>ADD MOVE</div>
          <div style={{display:'grid',gridTemplateColumns:'44px 44px 44px',gap:4}}>
            {[null,'U',null,'L',null,'R',null,'D',null].map((d,i)=>d
              ? <button key={i} onClick={()=>addCmd(d)}
                  style={{width:44,height:44,borderRadius:8,background:color+'22',
                    border:`2px solid ${color}55`,color:'#fff',fontSize:18,cursor:'pointer',fontWeight:700}}>
                  {d==='U'?'▲':d==='D'?'▼':d==='L'?'◄':'►'}
                </button>
              : <div key={i} style={{width:44,height:44,display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:16,color:'rgba(255,255,255,0.2)'}}>{i===4?'🤖':''}</div>
            )}
          </div>
        </div>
      </div>

      {/* Sequence */}
      {seq.length > 0 && (
        <div style={{marginTop:12}}>
          <div style={{fontSize:11,color:'rgba(255,255,255,0.3)',marginBottom:4}}>
            SEQUENCE — {seq.length} steps (click any step to remove it)
          </div>
          <div style={{display:'flex',flexWrap:'wrap',gap:3,background:'rgba(0,0,0,0.2)',borderRadius:8,padding:6,minHeight:36}}>
            {seq.map((cmd,i)=>(
              <button key={i} onClick={()=>removeCmd(i)} title="Remove step" style={tag(color)}>
                {cmd==='U'?'▲':cmd==='D'?'▼':cmd==='L'?'◄':'►'}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{display:'flex',gap:8,marginTop:10,flexWrap:'wrap'}}>
        <button onClick={run} disabled={running||status==='success'||!seq.length}
          style={{padding:'9px 18px',background:status==='success'?'#059669':color,color:'#fff',
            border:'none',borderRadius:9,cursor:'pointer',fontWeight:700,fontSize:13,
            opacity:running||!seq.length?0.5:1}}>
          {running?'⏳ Running…':status==='success'?'✅ Goal reached!':'▶ Run Program'}
        </button>
        <button onClick={reset}
          style={{padding:'9px 14px',background:'rgba(255,255,255,0.06)',color:'#fff',
            border:'1px solid rgba(255,255,255,0.12)',borderRadius:9,cursor:'pointer',fontSize:13}}>
          🔄 Reset
        </button>
      </div>
      {status==='success'&&<div style={successBox}>🎉 Robot reached the goal in {seq.length} steps!</div>}
      {status==='fail'   &&<div style={failBox}><span>❌ Robot didn't reach the goal — check your sequence and try again!</span></div>}
    </div>
  );
}

function scrambleSteps(steps) {
  const arr = steps.map((s, i) => ({ text: s, origIdx: i }));
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (i * 7 + 11) % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  if (arr.length > 1 && arr.every((item, i) => item.origIdx === i)) {
    [arr[0], arr[1]] = [arr[1], arr[0]];
  }
  return arr;
}

// ─── SEQUENCE GAME ────────────────────────────────────────────────────────────
function SequenceGame({ config, color, onComplete }) {
  // Support both flat structure (config.steps) and nested structure (config.config.steps)
  const steps = config.steps || config.config?.steps || [];
  const instructions = config.instructions || config.config?.instructions || 'Arrange the steps in the correct order!';
  const context = config.context || config.config?.context;

  const stepsKey = (steps || []).join('|');
  const scrambled = useMemo(() => scrambleSteps(steps), [stepsKey]);
  const answerKey = useMemo(() => [...steps], [stepsKey]);

  const [order, setOrder]     = useState(scrambled);
  const [dragIdx, setDragIdx] = useState(null);
  const [overIdx, setOverIdx] = useState(null);
  const [selected, setSel]    = useState(null);
  const [checked, setChecked] = useState(false);
  const [correct, setCorrect] = useState(false);
  const didDrag = useRef(false);
  const dragIdxRef = useRef(null);

  useEffect(() => {
    setOrder(scrambleSteps(steps));
    setDragIdx(null);
    dragIdxRef.current = null;
    setOverIdx(null);
    setSel(null);
    setChecked(false);
    setCorrect(false);
  }, [stepsKey]);

  function isSlotCorrect(item, slot) {
    return item.text === answerKey[slot];
  }

  function moveItem(from, to) {
    if (correct) return;
    const f = Number(from);
    const t = Number(to);
    const n = steps.length;
    if (!Number.isInteger(f) || !Number.isInteger(t) || f < 0 || t < 0 || f >= n || t >= n || f === t) return;
    setChecked(false);
    setOrder(prev => {
      const arr = [...prev];
      const [item] = arr.splice(f, 1);
      arr.splice(t, 0, item);
      return arr;
    });
  }

  function handleClick(i) {
    if (correct || didDrag.current) { didDrag.current = false; return; }
    if (selected === null) { setSel(i); return; }
    if (selected === i) { setSel(null); return; }
    moveItem(selected, i);
    setSel(null);
  }

  function onDragStart(e, i) {
    if (correct) { e.preventDefault(); return; }
    didDrag.current = false;
    dragIdxRef.current = i;
    setDragIdx(i);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(i));
  }

  function onDragOver(e, i) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!correct && dragIdxRef.current !== i) setOverIdx(i);
  }

  function onDrop(e, i) {
    e.preventDefault();
    e.stopPropagation();
    const from = dragIdxRef.current ?? parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (Number.isInteger(from) && from !== i) didDrag.current = true;
    moveItem(from, i);
    dragIdxRef.current = null;
    setDragIdx(null);
    setOverIdx(null);
  }

  function onDragEnd() {
    dragIdxRef.current = null;
    setDragIdx(null);
    setOverIdx(null);
  }

  function onTouchStart(e, i) {
    if (correct) return;
    dragIdxRef.current = i;
    setDragIdx(i);
  }

  function onTouchMove(e) {
    if (correct || dragIdxRef.current == null) return;
    e.preventDefault();
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const row = el?.closest('[data-seq-idx]');
    if (row) {
      const idx = parseInt(row.getAttribute('data-seq-idx'), 10);
      if (!Number.isNaN(idx) && idx !== overIdx) setOverIdx(idx);
    }
  }

  function onTouchEnd() {
    const from = dragIdxRef.current;
    if (from != null && overIdx != null && from !== overIdx) {
      didDrag.current = true;
      moveItem(from, overIdx);
    }
    dragIdxRef.current = null;
    setDragIdx(null);
    setOverIdx(null);
  }

  function check() {
    const slotResults = order.map((item, i) => isSlotCorrect(item, i));
    const correctCount = slotResults.filter(Boolean).length;
    const ok = correctCount === order.length;
    setChecked(true);
    setCorrect(ok);
    if (ok) onComplete?.();
  }

  function retry() {
    setOrder(scrambleSteps(steps));
    dragIdxRef.current = null;
    setDragIdx(null);
    setOverIdx(null);
    setSel(null);
    setChecked(false);
    setCorrect(false);
  }

  const slotResults = checked ? order.map((item, i) => isSlotCorrect(item, i)) : [];
  const correctCount = slotResults.filter(Boolean).length;

  return (
    <div>
      <p style={{ color:'#e2e8f0', marginBottom:6, fontSize:14 }}>{instructions}</p>
      {context && <p style={{ fontSize:12, color:'rgba(255,255,255,0.45)', marginBottom:10 }}>{context}</p>}
      <p style={{ fontSize:12, color:'rgba(255,255,255,0.35)', marginBottom:10 }}>
        Drag steps into order from top (step 1) to bottom (step {steps.length}). Tap two steps to swap. Press Check Order when ready!
      </p>
      <div style={{ display:'flex', flexDirection:'column', gap:5, touchAction:'none' }}
        onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} onTouchCancel={onTouchEnd}>
        {order.map((item, i) => {
          const isSel = selected === i;
          const isDrag = dragIdx === i;
          const isOver = overIdx === i && dragIdx !== i;
          const ok = checked && slotResults[i];
          const bad = checked && !slotResults[i];
          return (
            <div key={item.origIdx}
              data-seq-idx={i}
              draggable={!correct}
              onDragStart={e => onDragStart(e, i)}
              onDragOver={e => onDragOver(e, i)}
              onDrop={e => onDrop(e, i)}
              onDragEnd={onDragEnd}
              onTouchStart={e => onTouchStart(e, i)}
              onClick={() => handleClick(i)}
              style={{
                display:'flex', alignItems:'center', gap:10, padding:'10px 14px',
                background: isOver ? color + '33' : isSel ? color + '2a'
                  : checked ? (ok ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.04)')
                  : 'rgba(255,255,255,0.04)',
                border: `1.5px solid ${isOver ? color : isSel ? color
                  : checked ? (ok ? '#10b981' : 'rgba(255,255,255,0.12)')
                  : 'rgba(255,255,255,0.1)'}`,
                borderRadius:10, cursor: correct ? 'default' : 'grab',
                textAlign:'left', color:'#e2e8f0', fontSize:13,
                opacity: isDrag ? 0.45 : 1,
                transform: isOver ? 'scale(1.01)' : 'none',
                transition:'transform 0.12s, opacity 0.12s, background 0.12s',
                userSelect:'none',
              }}>
              <span style={{ fontSize:16, color:'rgba(255,255,255,0.25)', flexShrink:0, cursor:'grab' }} aria-hidden>⠿</span>
              <span style={{ width:24, height:24, borderRadius:'50%', flexShrink:0, display:'flex',
                alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:12,
                background: ok ? '#10b981' : isSel ? color : 'rgba(255,255,255,0.1)',
                color: ok || isSel ? '#fff' : 'rgba(255,255,255,0.5)' }}>
                {ok ? '✓' : i + 1}
              </span>
              <span style={{ flex:1 }}>
                {bad && <span style={{ color:'rgba(255,255,255,0.35)', fontSize:11, marginRight:6 }}>→ belongs at step {answerKey.indexOf(item.text) + 1}</span>}
                {item.text}
              </span>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop:12, display:'flex', gap:8, flexWrap:'wrap' }}>
        {!correct && (
          <button onClick={check}
            style={{ padding:'9px 18px', background:color, color:'#fff', border:'none', borderRadius:9, cursor:'pointer', fontWeight:700, fontSize:13 }}>
            ✓ Check Order
          </button>
        )}
        {checked && !correct && (
          <button onClick={retry}
            style={{ padding:'9px 16px', background:'rgba(255,255,255,0.07)', color:'#fff', border:'1px solid rgba(255,255,255,0.14)', borderRadius:9, cursor:'pointer', fontSize:13 }}>
            🔄 Shuffle &amp; Restart
          </button>
        )}
      </div>
      {checked && correct && <div style={successBox}>🎉 Perfect order! You understand sequencing!</div>}
      {checked && !correct && (
        <div style={correctCount > 0 ? { ...successBox, background:'rgba(251,191,36,0.1)', border:'1px solid rgba(251,191,36,0.35)', color:'#fde68a' } : failBox}>
          {correctCount > 0
            ? `👍 ${correctCount} of ${order.length} steps are in the right place — keep dragging the others, then check again!`
            : `💡 Start with "${answerKey[0]}" at the top — drag steps into order from step 1 to step ${order.length}.`}
        </div>
      )}
    </div>
  );
}

// ─── DEBUG CHALLENGE ──────────────────────────────────────────────────────────
function DebugChallenge({ config, color, onComplete }) {
  const challenges = Array.isArray(config?.challenges) ? config.challenges : [];
  const blocks = Array.isArray(config?.blocks) ? config.blocks : [];
  const { bugIdx, correctFix, instructions='Find the bug in this code and fix it!', context } = config || {};
  const fixOptions = Array.isArray(config?.fixOptions) ? config.fixOptions : [];
  
  // State for challenges format - TRUE bug finding
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [selectedStep, setSelectedStep] = useState(null);
  const [phase, setPhase] = useState('find'); // 'find' | 'fix' | 'done'
  const [showHint, setShowHint] = useState(false);

  // State for blocks format (old style)
  const [selBlock, setSelBlock] = useState(null);
  const [selFix, setSelFix] = useState(null);
  const [confirmed, setConf] = useState(false);
  const [correct, setCorrect] = useState(false);

  // Reset when challenge changes
  useEffect(() => {
    setSelectedStep(null);
    setPhase('find');
    setShowHint(false);
  }, [challengeIdx]);

  // If we have challenges format, use the TRUE bug-finding UI
  if (challenges.length > 0) {
    const ch = challenges[challengeIdx];
    if (!ch) return <div style={{color:'#fff'}}>No challenge data</div>;
    
    const buggySteps = ch.buggySteps || [];
    const correctSteps = ch.correctSteps || [];
    
    // Find which step is in the wrong position (the bug)
    // The bug is the step that appears in a different position in buggy vs correct
    const findBugIndex = () => {
      for (let i = 0; i < buggySteps.length; i++) {
        if (buggySteps[i] !== correctSteps[i]) {
          // This position has the wrong step - but which step IS the bug?
          // The bug is typically a step that's out of sequence
          // Find the step that's most out of place
          const stepAtWrongPos = buggySteps[i];
          const correctPosForThisStep = correctSteps.indexOf(stepAtWrongPos);
          if (Math.abs(correctPosForThisStep - i) > 0) {
            return i;
          }
        }
      }
      return buggySteps.length - 1; // fallback to last step
    };
    
    const actualBugIdx = findBugIndex();
    const buggyStep = buggySteps[actualBugIdx];
    const correctPosition = correctSteps.indexOf(buggyStep) + 1;
    
    function handleStepClick(idx) {
      if (phase !== 'find') return;
      setSelectedStep(idx);
      
      // Check if they found the bug
      if (idx === actualBugIdx) {
        setPhase('fix');
      }
    }
    
    function handleNextChallenge() {
      if (challengeIdx < challenges.length - 1) {
        setChallengeIdx(i => i + 1);
      } else {
        onComplete?.();
      }
    }
    
    function handleRetry() {
      setSelectedStep(null);
      setPhase('find');
      setShowHint(false);
    }

    return (
      <div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <span style={{fontSize:15,fontWeight:700,color:'#fff'}}>🐛 {ch.title}</span>
          <span style={{fontSize:12,color:'rgba(255,255,255,0.4)'}}>Bug {challengeIdx+1}/{challenges.length}</span>
        </div>
        
        {phase === 'find' && (
          <>
            <p style={{color:'#e2e8f0',marginBottom:8,fontSize:14}}>
              🔍 This algorithm has a BUG! One step is in the wrong place. Click to find it!
            </p>
            {!showHint && ch.hint && (
              <button onClick={() => setShowHint(true)}
                style={{marginBottom:12,padding:'6px 12px',background:'rgba(251,191,36,0.15)',border:'1px solid rgba(251,191,36,0.3)',
                  color:'#fbbf24',borderRadius:8,cursor:'pointer',fontSize:12}}>
                💡 Need a hint?
              </button>
            )}
            {showHint && ch.hint && (
              <p style={{fontSize:12,color:'#fbbf24',marginBottom:12,padding:8,background:'rgba(251,191,36,0.1)',borderRadius:8}}>
                💡 Hint: {ch.hint}
              </p>
            )}
          </>
        )}
        
        {phase === 'fix' && (
          <div style={{marginBottom:12,padding:12,background:'rgba(16,185,129,0.12)',border:'1px solid rgba(16,185,129,0.3)',borderRadius:10}}>
            <p style={{color:'#6ee7b7',fontSize:14,fontWeight:600,marginBottom:4}}>🎯 You found the bug!</p>
            <p style={{color:'#a7f3d0',fontSize:13}}>
              "{buggyStep}" is in position {actualBugIdx + 1}, but it should be in position {correctPosition}!
            </p>
          </div>
        )}
        
        <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:16}}>
          {buggySteps.map((step, i) => {
            const isSelected = selectedStep === i;
            const isBug = phase === 'fix' && i === actualBugIdx;
            const isWrongGuess = phase === 'find' && isSelected && i !== actualBugIdx;
            
            return (
              <button key={i} onClick={() => handleStepClick(i)} disabled={phase !== 'find'}
                style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',textAlign:'left',
                  background: isBug ? 'rgba(239,68,68,0.2)' : isWrongGuess ? 'rgba(251,191,36,0.15)' : isSelected ? color+'22' : 'rgba(255,255,255,0.05)',
                  border: `2px solid ${isBug ? '#ef4444' : isWrongGuess ? '#fbbf24' : isSelected ? color : 'rgba(255,255,255,0.1)'}`,
                  borderRadius:10, cursor: phase === 'find' ? 'pointer' : 'default', color:'#e2e8f0', fontSize:14}}>
                <span style={{fontSize:13,color:'rgba(255,255,255,0.4)',width:28,fontWeight:600}}>{i+1}.</span>
                <span style={{flex:1}}>{step}</span>
                {isBug && <span style={{fontSize:18}}>🐛</span>}
                {isWrongGuess && <span style={{fontSize:13,color:'#fbbf24'}}>Not this one!</span>}
              </button>
            );
          })}
        </div>
        
        {phase === 'fix' && (
          <button onClick={handleNextChallenge}
            style={{padding:'10px 20px',background:color,color:'#fff',border:'none',borderRadius:10,cursor:'pointer',fontWeight:700,fontSize:14}}>
            {challengeIdx < challenges.length - 1 ? 'Next Bug →' : '✓ Complete!'}
          </button>
        )}
        
        {phase === 'find' && selectedStep !== null && selectedStep !== actualBugIdx && (
          <button onClick={handleRetry}
            style={{padding:'8px 16px',background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.2)',
              color:'#fff',borderRadius:8,cursor:'pointer',fontSize:13}}>
            🔄 Try Again
          </button>
        )}
      </div>
    );
  }

  // Fall back to old blocks format
  function confirm() {
    if (selBlock===null||selFix===null) return;
    const ok = selBlock===bugIdx && selFix===correctFix;
    setConf(true); setCorrect(ok); if (ok) onComplete?.();
  }
  function retry() { setSelBlock(null); setSelFix(null); setConf(false); setCorrect(false); }

  if (blocks.length === 0) {
    return <div style={{color:'rgba(255,255,255,0.5)',padding:20,textAlign:'center'}}>No debug challenge data available.</div>;
  }

  return (
    <div>
      <p style={{color:'#e2e8f0',marginBottom:6,fontSize:14}}>{instructions}</p>
      {context && <p style={{fontSize:12,color:'rgba(255,255,255,0.45)',marginBottom:10}}>{context}</p>}

      <p style={{fontSize:12,color:'rgba(255,255,255,0.35)',marginBottom:8}}>Step 1: Click the code block that contains the bug</p>
      <div style={{display:'flex',flexDirection:'column',gap:4,marginBottom:14}}>
        {blocks.map((blk,i)=>{
          const isSel = selBlock===i;
          const isActualBug = i===bugIdx;
          return (
            <button key={i} onClick={()=>!confirmed&&setSelBlock(i)}
              style={{display:'flex',alignItems:'center',gap:10,padding:'9px 14px',
                background:confirmed?(isActualBug?'rgba(239,68,68,0.15)':'rgba(16,185,129,0.05)'):isSel?color+'22':'rgba(255,255,255,0.04)',
                border:`1.5px solid ${confirmed?(isActualBug?'#ef4444':'rgba(255,255,255,0.07)'):isSel?color:'rgba(255,255,255,0.08)'}`,
                borderRadius:9,cursor:'pointer',textAlign:'left',color:'#e2e8f0',fontSize:13,fontFamily:'monospace'}}>
              <span style={{fontSize:11,color:'rgba(255,255,255,0.25)',width:20,flexShrink:0}}>{i+1}.</span>
              {confirmed&&isActualBug&&'🐛 '}{blk}
            </button>
          );
        })}
      </div>

      {selBlock!==null && !confirmed && (
        <>
          <p style={{fontSize:12,color:'rgba(255,255,255,0.35)',marginBottom:8}}>Step 2: What should replace it?</p>
          <div style={{display:'flex',flexDirection:'column',gap:4,marginBottom:12}}>
            {fixOptions.map((opt,i)=>(
              <button key={i} onClick={()=>setSelFix(i)}
                style={{padding:'9px 14px',background:selFix===i?color+'22':'rgba(255,255,255,0.04)',
                  border:`1.5px solid ${selFix===i?color:'rgba(255,255,255,0.08)'}`,
                  borderRadius:9,cursor:'pointer',textAlign:'left',color:'#e2e8f0',fontSize:13,fontFamily:'monospace'}}>
                {opt}
              </button>
            ))}
          </div>
          <button onClick={confirm} disabled={selFix===null}
            style={{padding:'9px 18px',background:color,color:'#fff',border:'none',borderRadius:9,
              cursor:'pointer',fontWeight:700,fontSize:13,opacity:selFix===null?0.5:1}}>
            ✓ Apply Fix
          </button>
        </>
      )}
      {confirmed&&correct  &&<div style={successBox}>🎉 Bug squashed! Excellent debugging!</div>}
      {confirmed&&!correct &&<div style={failBox}>
        <span>❌ Not quite the right fix. Think about which step causes the problem!</span>
        <button onClick={retry}
          style={{flexShrink:0,padding:'4px 10px',background:'rgba(255,255,255,0.09)',border:'1px solid rgba(255,255,255,0.18)',color:'#fff',borderRadius:6,cursor:'pointer',fontSize:12}}>
          Try Again
        </button>
      </div>}
    </div>
  );
}

// ─── CODE TRACE ───────────────────────────────────────────────────────────────
function CodeTrace({ config, color, onComplete }) {
  const { instructions='Trace through this code and answer the questions!' } = config || {};
  const lines = Array.isArray(config?.lines) ? config.lines : [];
  const questions = Array.isArray(config?.questions) ? config.questions : [];
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState({});

  function check() {
    const res={};
    questions.forEach((q,i)=>{ res[i]=answers[i]?.trim()===q?.answer?.trim(); });
    setChecked(true); setResults(res);
    if (Object.values(res).every(Boolean)) onComplete?.();
  }
  function retry() { setAnswers({}); setChecked(false); setResults({}); }

  const allAnswered = questions.length > 0 && questions.every((_,i)=>answers[i]?.trim());

  return (
    <div>
      <p style={{color:'#e2e8f0',marginBottom:12,fontSize:14}}>{instructions}</p>
      <div style={{background:'rgba(0,0,0,0.35)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:12,padding:16,marginBottom:18,fontFamily:'monospace'}}>
        <div style={{fontSize:11,color:'rgba(255,255,255,0.3)',marginBottom:8}}>CODE</div>
        {lines.map((line,i)=>(
          <div key={i} style={{fontSize:13,color:'#e2e8f0',padding:'3px 0',lineHeight:1.6}}>
            <span style={{color:'rgba(255,255,255,0.2)',marginRight:12,userSelect:'none'}}>{String(i+1).padStart(2,' ')}</span>
            {line}
          </div>
        ))}
      </div>
      {questions.map((q,i)=>(
        <div key={i} style={{marginBottom:14}}>
          <div style={{fontSize:13,fontWeight:600,color:'#e2e8f0',marginBottom:6}}>{i+1}. {q.q}</div>
          {q.hint && <div style={{fontSize:11,color:'rgba(255,255,255,0.35)',marginBottom:6}}>💡 Hint: {q.hint}</div>}
          <input value={answers[i]||''} onChange={e=>!checked&&setAnswers(a=>({...a,[i]:e.target.value}))}
            placeholder="Type your answer…"
            style={{padding:'8px 12px',background:'rgba(255,255,255,0.06)',border:`1.5px solid ${checked?(results[i]?'#10b981':'#ef4444'):'rgba(255,255,255,0.15)'}`,
              borderRadius:8,color:'#fff',fontSize:13,width:'100%',boxSizing:'border-box',fontFamily:'monospace'}} />
          {checked && <div style={{fontSize:12,marginTop:4,color:results[i]?'#6ee7b7':'#fca5a5'}}>
            {results[i]?'✓ Correct!':'✗ The answer is: '+q.answer}
          </div>}
        </div>
      ))}
      <div style={{display:'flex',gap:8,marginTop:8}}>
        {!checked && (
          <button onClick={check} disabled={!allAnswered}
            style={{padding:'9px 18px',background:color,color:'#fff',border:'none',borderRadius:9,cursor:'pointer',fontWeight:700,fontSize:13,opacity:allAnswered?1:0.4}}>
            ✓ Check Answers
          </button>
        )}
        {checked && !Object.values(results).every(Boolean) && (
          <button onClick={retry}
            style={{padding:'9px 16px',background:'rgba(255,255,255,0.07)',color:'#fff',border:'1px solid rgba(255,255,255,0.14)',borderRadius:9,cursor:'pointer',fontSize:13}}>
            🔄 Try Again
          </button>
        )}
      </div>
      {checked&&Object.values(results).every(Boolean)&&<div style={successBox}>🎉 Correct! You traced the code perfectly!</div>}
    </div>
  );
}

// ─── MULTI SEQUENCE (Algorithm Hunt) ─────────────────────────────────────────
function MultiSequenceGame({ tasks=[], color, onComplete }) {
  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const [taskIdx, setTaskIdx] = useState(0);
  const [done, setDone] = useState([]);

  // Handle empty tasks
  if (safeTasks.length === 0) {
    return <div style={{color:'rgba(255,255,255,0.5)',padding:16,textAlign:'center'}}>No tasks available.</div>;
  }

  const task = safeTasks[taskIdx] || { name: 'Task', steps: [] };
  function handleTaskComplete() {
    const next = [...done, taskIdx];
    setDone(next);
    if (taskIdx < safeTasks.length - 1) setTaskIdx(taskIdx + 1);
    else onComplete?.();
  }

  return (
    <div>
      <div style={{display:'flex',gap:6,marginBottom:14,flexWrap:'wrap'}}>
        {safeTasks.map((t,i)=>(
          <span key={i} style={{fontSize:11,padding:'4px 10px',borderRadius:20,fontWeight:700,
            background:done.includes(i)?'rgba(16,185,129,0.2)':i===taskIdx?color+'33':'rgba(255,255,255,0.06)',
            border:`1px solid ${done.includes(i)?'#10b981':i===taskIdx?color:'rgba(255,255,255,0.12)'}`,
            color:done.includes(i)?'#6ee7b7':i===taskIdx?'#fff':'rgba(255,255,255,0.4)'}}>
            {done.includes(i)?'✓ ':''}{t?.name || 'Task'}
          </span>
        ))}
      </div>
      <SequenceGame key={taskIdx}
        config={{ steps: task.steps || [], instructions: `Put the steps for "${task.name || 'this task'}" in order!`, context: task.name || '' }}
        color={color} onComplete={handleTaskComplete} />
      {done.length === safeTasks.length && <div style={successBox}>🎉 All {safeTasks.length} algorithms sorted! Algorithm Finder badge unlocked!</div>}
    </div>
  );
}

// ─── CHARACTER EXPLORER ───────────────────────────────────────────────────────
const CHAR_DIALOGUES = {
  professorByte: { q: 'What is a set of step-by-step instructions called?', a: 'An algorithm!' },
  bolt: { q: 'What must robot instructions be?', a: 'Clear and precise!' },
  glitch: { q: 'What do programmers call mistakes in code?', a: 'Bugs!' },
  vision: { q: 'What do sensors help robots do?', a: 'See and detect things!' },
  gearsmith: { q: 'What do builders use to plan before coding?', a: 'Algorithms and design!' },
};

function CharacterExplorer({ color, onComplete }) {
  const chars = Object.values(CHARACTERS);
  const [met, setMet] = useState(new Set());
  const [active, setActive] = useState(null);
  const [answered, setAnswered] = useState(new Set());

  function meet(id) { setActive(id); setMet(m => new Set([...m, id])); }
  function answer(id) {
    setAnswered(a => {
      const next = new Set([...a, id]);
      if (next.size >= chars.length) setTimeout(() => onComplete?.(), 400);
      return next;
    });
  }

  return (
    <div>
      <p style={{color:'rgba(255,255,255,0.5)',fontSize:13,marginBottom:14}}>Click each robot to meet them and answer their question!</p>
      <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:16}}>
        {chars.map(ch=>(
          <button key={ch.id} onClick={()=>meet(ch.id)}
            style={{padding:'12px 16px',borderRadius:14,cursor:'pointer',textAlign:'center',minWidth:90,
              background:met.has(ch.id)?ch.bg:'rgba(255,255,255,0.04)',
              border:`2px solid ${met.has(ch.id)?ch.color:'rgba(255,255,255,0.12)'}`,
              opacity:met.has(ch.id)?1:0.7}}>
            <div style={{fontSize:32}}>{ch.emoji}</div>
            <div style={{fontSize:11,fontWeight:700,color:ch.color,marginTop:4}}>{ch.name}</div>
            {answered.has(ch.id)&&<div style={{fontSize:10,color:'#6ee7b7',marginTop:2}}>✓ Met</div>}
          </button>
        ))}
      </div>
      {active && CHARACTERS[active] && (
        <div style={{background:CHARACTERS[active].bg,border:`1px solid ${CHARACTERS[active].color}44`,
          borderRadius:14,padding:16,display:'flex',alignItems:'flex-start',gap:12}}>
          {CHARACTERS[active].image ? (
            <img src={CHARACTERS[active].image} alt={CHARACTERS[active].name} style={{width:56,height:56,objectFit:'contain',flexShrink:0}} />
          ) : (
            <span style={{fontSize:32}}>{CHARACTERS[active].emoji}</span>
          )}
          <div style={{flex:1}}>
            <div style={{fontSize:14,color:'#e2e8f0',marginBottom:10,lineHeight:1.55}}>
              <strong style={{color:CHARACTERS[active].color}}>{CHARACTERS[active].name}</strong>: "{CHARACTERS[active].quote}"
            </div>
          {!answered.has(active) && CHAR_DIALOGUES[active] && (
            <>
              <div style={{fontSize:13,color:'rgba(255,255,255,0.7)',marginBottom:10}}>❓ {CHAR_DIALOGUES[active].q}</div>
              <button onClick={()=>answer(active)}
                style={{padding:'8px 16px',background:color,color:'#fff',border:'none',borderRadius:8,cursor:'pointer',fontWeight:700,fontSize:13}}>
                💡 {CHAR_DIALOGUES[active].a}
              </button>
            </>
          )}
          {answered.has(active) && <div style={{color:'#6ee7b7',fontSize:13,fontWeight:600}}>✓ Great answer! +5 XP</div>}
          </div>
        </div>
      )}
      {answered.size >= chars.length && <div style={successBox}>🎉 You met all {chars.length} Academy robots!</div>}
    </div>
  );
}

// ─── GLOSSARY EXPLORER ────────────────────────────────────────────────────────
function GlossaryExplorer({ terms=[], color, onComplete }) {
  const safeTerms = Array.isArray(terms) ? terms : [];
  const [learned, setLearned] = useState(new Set());
  const [quizIdx, setQuizIdx] = useState(null);
  const [quizAns, setQuizAns] = useState(null);

  if (safeTerms.length === 0) {
    return <div style={{color:'rgba(255,255,255,0.5)',padding:16,textAlign:'center'}}>No vocabulary terms available.</div>;
  }

  function learn(i) {
    setLearned(l => {
      const next = new Set([...l, i]);
      if (next.size >= safeTerms.length) setTimeout(() => onComplete?.(), 300);
      return next;
    });
    setQuizIdx(i);
    setQuizAns(null);
  }

  return (
    <div>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {safeTerms.map((t,i)=>(
          <button key={i} onClick={()=>!learned.has(i)&&learn(i)}
            style={{textAlign:'left',padding:'12px 16px',borderRadius:12,cursor:learned.has(i)?'default':'pointer',
              background:learned.has(i)?'rgba(16,185,129,0.08)':'rgba(255,255,255,0.04)',
              border:`1.5px solid ${learned.has(i)?'#10b98144':color+'33'}`}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontWeight:800,color:color,fontSize:14}}>{t?.term || 'Term'}</span>
              {learned.has(i)&&<span style={{fontSize:11,color:'#6ee7b7'}}>✓ Learned</span>}
            </div>
            {learned.has(i) && (
              <div style={{marginTop:8,fontSize:13,color:'rgba(255,255,255,0.65)',lineHeight:1.5}}>
                {t?.def || t?.definition || ''}<br/><em style={{color:'rgba(255,255,255,0.4)',fontSize:12}}>Example: {t?.example || ''}</em>
              </div>
            )}
          </button>
        ))}
      </div>
      {learned.size >= safeTerms.length && <div style={successBox}>📚 All {safeTerms.length} terms learned! +5 XP each</div>}
    </div>
  );
}

// ─── PREDICTION CHALLENGE ─────────────────────────────────────────────────────
function PredictionChallenge({ sequence=[], start={x:0,y:0}, size=5, options=[], answer=0, instructions, color, onComplete }) {
  const [picked, setPicked] = useState(null);
  const [revealed, setRevealed] = useState(false);
  
  // Handle both old format (start as object) and ensure arrays are valid
  const safeStart = typeof start === 'object' && start !== null ? start : { x: 0, y: 0 };
  const safeSequence = Array.isArray(sequence) ? sequence : [];
  const safeOptions = Array.isArray(options) ? options : [];
  const safeAnswer = typeof answer === 'number' ? answer : 0;

  const { endPos, correctIndex } = useMemo(() => {
    let x = safeStart.x || 0, y = safeStart.y || 0;
    for (const cmd of safeSequence) {
      if (cmd==='U'||cmd==='N') y = Math.max(0, y-1);
      if (cmd==='D'||cmd==='S') y = Math.min(size-1, y+1);
      if (cmd==='L'||cmd==='W') x = Math.max(0, x-1);
      if (cmd==='R'||cmd==='E') x = Math.min(size-1, x+1);
    }
    const idx = safeOptions.findIndex(opt => {
      const m = opt?.match?.(/\((\d+),\s*(\d+)\)/);
      return m && parseInt(m[1], 10) === x && parseInt(m[2], 10) === y;
    });
    return { endPos: { x, y }, correctIndex: idx >= 0 ? idx : safeAnswer };
  }, [safeSequence.join('|'), safeStart.x, safeStart.y, size, safeOptions.join('|'), safeAnswer]);

  function pick(i) {
    if (revealed) return;
    setPicked(i);
    setRevealed(true);
    if (i === correctIndex) setTimeout(() => onComplete?.(), 800);
  }
  function retry() { setPicked(null); setRevealed(false); }

  return (
    <div>
      <p style={{color:'#e2e8f0',fontSize:14,marginBottom:12}}>{instructions}</p>
      <div style={{display:'flex',gap:16,flexWrap:'wrap',alignItems:'flex-start',marginBottom:14}}>
        <div>
          <div style={{fontSize:11,color:'rgba(255,255,255,0.35)',marginBottom:6}}>START 🤖 at ({safeStart.x}, {safeStart.y})</div>
          <div style={{display:'grid',gridTemplateColumns:`repeat(${size},32px)`,gap:2}}>
            {Array.from({length:size*size},(_,i)=>{
              const gx=i%size, gy=Math.floor(i/size);
              const isStart=safeStart.x===gx&&safeStart.y===gy;
              const isEnd=endPos.x===gx&&endPos.y===gy;
              return (
                <div key={i} style={{width:32,height:32,borderRadius:5,fontSize:14,
                  display:'flex',alignItems:'center',justifyContent:'center',
                  background:isStart?color+'33':isEnd&&revealed?'rgba(16,185,129,0.2)':'rgba(255,255,255,0.05)',
                  border:`1px solid ${isStart?color:isEnd&&revealed?'#10b981':'rgba(255,255,255,0.08)'}`}}>
                  {isStart?'🤖':isEnd&&revealed?'⭐':''}
                </div>
              );
            })}
          </div>
        </div>
        <div style={{flex:1,minWidth:180,background:'rgba(0,0,0,0.3)',borderRadius:10,padding:12,fontFamily:'monospace',fontSize:13,color:'#a5b4fc'}}>
          Commands: {safeSequence.join(' → ')}
        </div>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:6}}>
        {safeOptions.map((opt,i)=>(
          <button key={i} onClick={()=>pick(i)} disabled={revealed}
            style={{padding:'10px 14px',borderRadius:10,cursor:revealed?'default':'pointer',textAlign:'left',fontSize:13,
              background:revealed?(i===correctIndex?'rgba(16,185,129,0.15)':picked===i?'rgba(239,68,68,0.1)':'rgba(255,255,255,0.03)'):picked===i?color+'22':'rgba(255,255,255,0.04)',
              border:`1.5px solid ${revealed?(i===correctIndex?'#10b981':picked===i?'#ef4444':'rgba(255,255,255,0.08)'):'rgba(255,255,255,0.12)'}`,
              color:'#e2e8f0'}}>
            {revealed&&i===correctIndex&&'✓ '}{revealed&&picked===i&&i!==correctIndex&&'✗ '}{opt}
          </button>
        ))}
      </div>
      {revealed && (
        <div style={picked===correctIndex?successBox:failBox}>
          <span>{picked===correctIndex ? '🎉 Correct prediction!' : `❌ Robot ended at (${endPos.x}, ${endPos.y}). Trace the path on the grid and try again!`}</span>
          {picked!==correctIndex && (
            <button onClick={retry}
              style={{flexShrink:0,padding:'4px 10px',background:'rgba(255,255,255,0.09)',border:'1px solid rgba(255,255,255,0.18)',color:'#fff',borderRadius:6,cursor:'pointer',fontSize:12}}>
              Try Again
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── PATTERN PAINTER ──────────────────────────────────────────────────────────
// Handles emoji pattern displays - shows pattern for memorization then lets user recreate
function PatternPainter({ target=[], showSeconds, creative, color, onComplete }) {
  const safeTarget = Array.isArray(target) ? target.filter(row => Array.isArray(row)) : [];
  const rows = safeTarget.length || 3;
  const cols = safeTarget[0]?.length || 6;
  
  // For emoji patterns, we just display them - no grid interaction needed
  const isEmojiPattern = safeTarget.length > 0 && typeof safeTarget[0]?.[0] === 'string';
  
  const [showTarget, setShowTarget] = useState(true);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (showSeconds && safeTarget.length > 0) {
      setShowTarget(true);
      const t = setTimeout(() => {
        setShowTarget(false);
        // For emoji patterns, just complete after showing
        if (isEmojiPattern) {
          setTimeout(() => {
            setCompleted(true);
            onComplete?.();
          }, 2000);
        }
      }, showSeconds * 1000);
      return () => clearTimeout(t);
    }
  }, [showSeconds, safeTarget.length, isEmojiPattern]);

  // Render emoji pattern grid
  function renderEmojiGrid(cells) {
    if (!cells || cells.length === 0) return null;
    return (
      <div style={{display:'flex',flexDirection:'column',gap:6}}>
        {cells.map((row, r) => (
          <div key={r} style={{display:'flex',gap:4,justifyContent:'center'}}>
            {(row || []).map((emoji, c) => (
              <div key={c} style={{
                width:40, height:40, borderRadius:8, 
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:24, background:'rgba(255,255,255,0.06)',
                border:`1px solid ${color}33`
              }}>
                {emoji}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (safeTarget.length === 0) {
    return <div style={{color:'rgba(255,255,255,0.5)',padding:16,textAlign:'center'}}>No pattern to display.</div>;
  }

  return (
    <div>
      <div style={{marginBottom:16}}>
        <div style={{fontSize:12,color:'rgba(255,255,255,0.4)',marginBottom:10}}>
          {showTarget ? '🎯 MEMORIZE THIS PATTERN!' : '🤔 Can you remember the pattern?'}
        </div>
        {showTarget && renderEmojiGrid(safeTarget)}
        {!showTarget && !completed && (
          <div style={{textAlign:'center',padding:20,color:'rgba(255,255,255,0.6)'}}>
            <div style={{fontSize:32,marginBottom:10}}>🧠</div>
            <div>What was the pattern?</div>
            <div style={{fontSize:12,marginTop:8,color:'rgba(255,255,255,0.4)'}}>
              Think about what you saw...
            </div>
          </div>
        )}
        {completed && (
          <div>
            {renderEmojiGrid(safeTarget)}
            <div style={{...successBox, marginTop:12}}>
              🎨 Great job spotting the pattern!
            </div>
          </div>
        )}
      </div>
      {!completed && !showTarget && (
        <button 
          onClick={() => { setCompleted(true); onComplete?.(); }}
          style={{marginTop:12,padding:'9px 18px',background:color,color:'#fff',border:'none',borderRadius:9,cursor:'pointer',fontWeight:700,fontSize:13}}>
          ✓ I Remember!
        </button>
      )}
    </div>
  );
}

// ─── COLLECTOR PUZZLE (Code.org Harvester style) ─────────────────────────────
function CollectorPuzzle({ config, color, onComplete }) {
  const { size = 5, startPos = { x: 0, y: 0 }, coins = [], instructions = 'Collect all items!' } = config;
  const [seq, setSeq] = useState([]);
  const [pos, setPos] = useState({ ...startPos });
  const [collected, setCollected] = useState([]);
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState('idle');

  const remaining = coins.filter(c => !collected.some(x => x.x === c.x && x.y === c.y));

  function addCmd(d) {
    if (!running && status !== 'success' && seq.length < 40) setSeq(s => [...s, d]);
  }
  function removeCmd(i) {
    if (!running && status !== 'success') setSeq(s => s.filter((_, j) => j !== i));
  }
  function reset() {
    setSeq([]); setPos({ ...startPos }); setCollected([]); setStatus('idle');
  }

  async function run() {
    if (running || status === 'success' || !seq.length) return;
    setRunning(true); setStatus('idle');
    let p = { ...startPos };
    const got = [];
    setPos({ ...p }); setCollected([]);
    for (const cmd of seq) {
      await new Promise(r => setTimeout(r, 280));
      const np = { ...p };
      if (cmd === 'U') np.y = Math.max(0, p.y - 1);
      if (cmd === 'D') np.y = Math.min(size - 1, p.y + 1);
      if (cmd === 'L') np.x = Math.max(0, p.x - 1);
      if (cmd === 'R') np.x = Math.min(size - 1, p.x + 1);
      p = np;
      setPos({ ...p });
      const hit = coins.find(c => c.x === p.x && c.y === p.y && !got.some(g => g.x === c.x && g.y === c.y));
      if (cmd === 'G' && hit) got.push({ ...hit });
      if (hit && cmd !== 'G') { /* pass through */ }
      setCollected([...got]);
    }
    setRunning(false);
    if (got.length === coins.length) { setStatus('success'); onComplete?.(); }
    else setStatus('fail');
  }

  return (
    <div>
      <p style={{ color: '#e2e8f0', marginBottom: 10, fontSize: 14 }}>{instructions}</p>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#fbbf24', marginBottom: 10 }}>
        📦 {collected.length}/{coins.length} collected
      </div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${size}, 42px)`, gap: 2 }}>
          {Array.from({ length: size * size }, (_, i) => {
            const x = i % size, y = Math.floor(i / size);
            const isR = pos.x === x && pos.y === y;
            const coin = coins.find(c => c.x === x && c.y === y);
            const got = coin && collected.some(g => g.x === coin.x && g.y === coin.y);
            return (
              <div key={i} style={{ width: 42, height: 42, borderRadius: 7, fontSize: isR ? 20 : 16,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isR ? color : 'rgba(255,255,255,0.05)',
                border: `2px solid ${isR ? color : 'rgba(255,255,255,0.08)'}` }}>
                {isR ? '🤖' : coin && !got ? '📦' : got ? '✓' : ''}
              </div>
            );
          })}
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>COMMANDS</div>
          <div style={{ display: 'grid', gridTemplateColumns: '44px 44px 44px', gap: 4 }}>
            {[null, 'U', null, 'L', 'G', 'R', null, 'D', null].map((d, i) => d
              ? <button key={i} onClick={() => addCmd(d)}
                  style={{ width: 44, height: 44, borderRadius: 8, background: d === 'G' ? '#be185d22' : color + '22',
                    border: `2px solid ${d === 'G' ? '#be185d55' : color + '55'}`, color: '#fff', fontSize: d === 'G' ? 14 : 18,
                    cursor: 'pointer', fontWeight: 700 }}>
                  {d === 'U' ? '▲' : d === 'D' ? '▼' : d === 'L' ? '◄' : d === 'R' ? '►' : '🤏'}
                </button>
              : <div key={i} style={{ width: 44, height: 44 }} />
            )}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 6 }}>🤏 = Grab at location</div>
        </div>
      </div>
      {seq.length > 0 && (
        <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {seq.map((cmd, i) => (
            <button key={i} onClick={() => removeCmd(i)} style={tag(color)}>
              {cmd === 'G' ? '🤏' : cmd === 'U' ? '▲' : cmd === 'D' ? '▼' : cmd === 'L' ? '◄' : '►'}
            </button>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <button onClick={run} disabled={running || status === 'success' || !seq.length}
          style={{ padding: '9px 18px', background: status === 'success' ? '#059669' : color, color: '#fff',
            border: 'none', borderRadius: 9, cursor: 'pointer', fontWeight: 700, fontSize: 13,
            opacity: running || !seq.length ? 0.5 : 1 }}>
          {status === 'success' ? '✅ All collected!' : '▶ Run'}
        </button>
        <button onClick={reset} style={{ padding: '9px 14px', background: 'rgba(255,255,255,0.06)', color: '#fff',
          border: '1px solid rgba(255,255,255,0.12)', borderRadius: 9, cursor: 'pointer', fontSize: 13 }}>🔄 Reset</button>
      </div>
      {status === 'success' && <div style={successBox}>🎉 All {coins.length} items collected!</div>}
      {status === 'fail' && <div style={failBox}><span>❌ Only {collected.length}/{coins.length} collected — add GRAB 🤏 at each item!</span></div>}
    </div>
  );
}

// ─── RESPONSE PUZZLE (Code.org Farmer style) ─────────────────────────────────
function ResponsePuzzle({ config, color, onComplete }) {
  const {
    story = 'Robot detects a situation — choose the correct response!',
    scenarios = [
      { event: 'Wall ahead!', detect: 'DETECT_WALL', responses: ['JUMP', 'RUN', 'WALK'], correct: 0 },
      { event: 'Enemy nearby!', detect: 'DETECT_ENEMY', responses: ['JUMP', 'RUN', 'WALK'], correct: 1 },
      { event: 'Path is clear', detect: 'DETECT_CLEAR', responses: ['JUMP', 'RUN', 'WALK'], correct: 2 },
    ],
  } = config;

  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const allAnswered = scenarios.every((_, i) => answers[i] !== undefined);
  const score = scenarios.filter((s, i) => answers[i] === s.correct).length;

  function check() {
    const s = scenarios.filter((sc, i) => answers[i] === sc.correct).length;
    setChecked(true);
    if (s === scenarios.length) onComplete?.();
  }

  return (
    <div>
      <p style={{ color: '#e2e8f0', marginBottom: 14, fontSize: 14 }}>{story}</p>
      {scenarios.map((sc, si) => (
        <div key={si} style={{ marginBottom: 16, background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 16,
          border: `1px solid ${checked ? (answers[si] === sc.correct ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.3)') : 'rgba(255,255,255,0.08)'}` }}>
          <div style={{ fontWeight: 800, marginBottom: 10, fontSize: 14 }}>
            Scenario {si + 1}: <span style={{ color }}>{sc.event}</span>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 8, fontFamily: 'monospace' }}>
            IF {sc.detect} THEN …
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {(sc.responses || []).map((r, ri) => {
              const chosen = answers[si] === ri;
              const correct = checked && ri === sc.correct;
              const wrong = checked && chosen && ri !== sc.correct;
              return (
                <button key={ri} disabled={checked} onClick={() => setAnswers(a => ({ ...a, [si]: ri }))}
                  style={{ padding: '10px 16px', borderRadius: 10, cursor: checked ? 'default' : 'pointer', fontWeight: 700,
                    fontSize: 13, fontFamily: 'monospace',
                    border: `2px solid ${correct ? '#10b981' : wrong ? '#ef4444' : chosen ? color : 'rgba(255,255,255,0.12)'}`,
                    background: correct ? 'rgba(16,185,129,0.15)' : wrong ? 'rgba(239,68,68,0.12)' : chosen ? color + '22' : 'rgba(255,255,255,0.04)',
                    color: correct ? '#6ee7b7' : wrong ? '#fca5a5' : '#e2e8f0' }}>
                  [{r}]
                </button>
              );
            })}
          </div>
        </div>
      ))}
      {!checked ? (
        <button onClick={check} disabled={!allAnswered}
          style={{ padding: '10px 20px', background: color, color: '#fff', border: 'none', borderRadius: 10,
            cursor: allAnswered ? 'pointer' : 'not-allowed', fontWeight: 800, opacity: allAnswered ? 1 : 0.5 }}>
          ✓ Test Responses
        </button>
      ) : (
        <div style={score === scenarios.length ? successBox : failBox}>
          {score === scenarios.length
            ? '🎉 Perfect responses! Your robot handles every situation!'
            : `❌ ${score}/${scenarios.length} correct — review the wrong scenarios and try again.`}
          {score < scenarios.length && (
            <button onClick={() => { setAnswers({}); setChecked(false); }}
              style={{ marginLeft: 10, padding: '4px 10px', background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.18)',
                color: '#fff', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>Try Again</button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── SORTING GAME (Drag items into categories) ──────────────────────────────
function SortingGame({ config, color, onComplete }) {
  const { categories = [], items = [], instructions = 'Sort these items into the correct categories!' } = config || {};
  const [placed, setPlaced] = useState({});
  const [checked, setChecked] = useState(false);
  const [dragItem, setDragItem] = useState(null);

  const unplaced = items.filter(item => !Object.values(placed).flat().includes(item.id));
  
  function handleDrop(catId) {
    if (!dragItem) return;
    setPlaced(prev => ({
      ...prev,
      [catId]: [...(prev[catId] || []), dragItem]
    }));
    setDragItem(null);
  }

  function removeItem(catId, itemId) {
    if (checked) return;
    setPlaced(prev => ({
      ...prev,
      [catId]: (prev[catId] || []).filter(id => id !== itemId)
    }));
  }

  function check() {
    setChecked(true);
    const allCorrect = items.every(item => {
      const placedIn = Object.entries(placed).find(([_, ids]) => ids.includes(item.id))?.[0];
      return placedIn === item.category;
    });
    if (allCorrect) onComplete?.();
  }

  const allPlaced = unplaced.length === 0;
  const score = checked ? items.filter(item => {
    const placedIn = Object.entries(placed).find(([_, ids]) => ids.includes(item.id))?.[0];
    return placedIn === item.category;
  }).length : 0;

  return (
    <div>
      <p style={{color:'#e2e8f0',marginBottom:12,fontSize:14}}>{instructions}</p>
      
      {/* Items to drag */}
      <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:16,minHeight:44,padding:12,background:'rgba(0,0,0,0.2)',borderRadius:12}}>
        {unplaced.length > 0 ? unplaced.map(item => (
          <div key={item.id} draggable onDragStart={() => setDragItem(item.id)}
            style={{padding:'8px 14px',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',
              borderRadius:8,cursor:'grab',color:'#fff',fontSize:13,fontWeight:500}}>
            {item.emoji && <span style={{marginRight:6}}>{item.emoji}</span>}{item.label}
          </div>
        )) : <span style={{color:'rgba(255,255,255,0.3)',fontSize:13}}>All items sorted!</span>}
      </div>

      {/* Category buckets */}
      <div style={{display:'grid',gridTemplateColumns:`repeat(${Math.min(categories.length, 3)}, 1fr)`,gap:12,marginBottom:16}}>
        {categories.map(cat => (
          <div key={cat.id} onDragOver={e => e.preventDefault()} onDrop={() => handleDrop(cat.id)}
            style={{padding:14,background:'rgba(255,255,255,0.03)',border:`2px dashed ${cat.color || color}44`,
              borderRadius:12,minHeight:100}}>
            <div style={{fontWeight:700,color:cat.color || color,marginBottom:10,fontSize:14}}>
              {cat.emoji && <span style={{marginRight:6}}>{cat.emoji}</span>}{cat.label}
            </div>
            <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
              {(placed[cat.id] || []).map(itemId => {
                const item = items.find(i => i.id === itemId);
                const isCorrect = checked && item?.category === cat.id;
                const isWrong = checked && item?.category !== cat.id;
                return (
                  <div key={itemId} onClick={() => removeItem(cat.id, itemId)}
                    style={{padding:'6px 10px',fontSize:12,borderRadius:6,cursor:checked?'default':'pointer',
                      background: isCorrect ? 'rgba(16,185,129,0.2)' : isWrong ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.1)',
                      border: `1px solid ${isCorrect ? '#10b981' : isWrong ? '#ef4444' : 'rgba(255,255,255,0.15)'}`,
                      color: isCorrect ? '#6ee7b7' : isWrong ? '#fca5a5' : '#fff'}}>
                    {item?.emoji && <span style={{marginRight:4}}>{item.emoji}</span>}{item?.label}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!checked ? (
        <button onClick={check} disabled={!allPlaced}
          style={{padding:'10px 20px',background:color,color:'#fff',border:'none',borderRadius:10,
            cursor:allPlaced?'pointer':'not-allowed',fontWeight:700,opacity:allPlaced?1:0.5}}>
          ✓ Check Sorting
        </button>
      ) : score === items.length ? (
        <div style={successBox}>🎉 Perfect sorting! You got them all right!</div>
      ) : (
        <div style={failBox}>
          <span>❌ {score}/{items.length} correct</span>
          <button onClick={() => { setPlaced({}); setChecked(false); }}
            style={{padding:'6px 12px',background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.2)',
              color:'#fff',borderRadius:8,cursor:'pointer',fontSize:13}}>Try Again</button>
        </div>
      )}
    </div>
  );
}

// ─── QUIZ (Multiple choice questions) ────────────────────────────────────────
function QuizGame({ config, color, onComplete }) {
  const { questions = [], instructions = 'Answer these questions!' } = config || {};
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);

  const allAnswered = questions.length > 0 && questions.every((_, i) => answers[i] !== undefined);
  const score = checked ? questions.filter((q, i) => answers[i] === q.correct).length : 0;

  function check() {
    setChecked(true);
    if (questions.every((q, i) => answers[i] === q.correct)) onComplete?.();
  }

  return (
    <div>
      <p style={{color:'#e2e8f0',marginBottom:14,fontSize:14}}>{instructions}</p>
      
      {questions.map((q, qi) => (
        <div key={qi} style={{marginBottom:18,padding:16,background:'rgba(255,255,255,0.03)',borderRadius:12,
          border:`1px solid ${checked ? (answers[qi] === q.correct ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.3)') : 'rgba(255,255,255,0.08)'}`}}>
          <div style={{fontWeight:700,color:'#fff',marginBottom:10,fontSize:14}}>
            {qi+1}. {q.question} {q.emoji || ''}
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {(q.options || []).map((opt, oi) => {
              const selected = answers[qi] === oi;
              const isCorrect = checked && oi === q.correct;
              const isWrong = checked && selected && oi !== q.correct;
              return (
                <button key={oi} disabled={checked} onClick={() => setAnswers(a => ({...a, [qi]: oi}))}
                  style={{padding:'10px 14px',textAlign:'left',borderRadius:8,cursor:checked?'default':'pointer',
                    background: isCorrect ? 'rgba(16,185,129,0.15)' : isWrong ? 'rgba(239,68,68,0.12)' : selected ? color+'22' : 'rgba(255,255,255,0.05)',
                    border: `1.5px solid ${isCorrect ? '#10b981' : isWrong ? '#ef4444' : selected ? color : 'rgba(255,255,255,0.1)'}`,
                    color: isCorrect ? '#6ee7b7' : isWrong ? '#fca5a5' : '#e2e8f0', fontSize:13}}>
                  {String.fromCharCode(65+oi)}. {opt}
                </button>
              );
            })}
          </div>
          {checked && q.explanation && (
            <div style={{marginTop:8,fontSize:12,color:'rgba(255,255,255,0.5)',fontStyle:'italic'}}>
              💡 {q.explanation}
            </div>
          )}
        </div>
      ))}

      {!checked ? (
        <button onClick={check} disabled={!allAnswered}
          style={{padding:'10px 20px',background:color,color:'#fff',border:'none',borderRadius:10,
            cursor:allAnswered?'pointer':'not-allowed',fontWeight:700,opacity:allAnswered?1:0.5}}>
          ✓ Check Answers
        </button>
      ) : score === questions.length ? (
        <div style={successBox}>🎉 Perfect score! You got all {score} questions right!</div>
      ) : (
        <div style={failBox}>
          <span>❌ {score}/{questions.length} correct</span>
          <button onClick={() => { setAnswers({}); setChecked(false); }}
            style={{padding:'6px 12px',background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.2)',
              color:'#fff',borderRadius:8,cursor:'pointer',fontSize:13}}>Try Again</button>
        </div>
      )}
    </div>
  );
}

// ─── MATCHING GAME (Connect pairs) ───────────────────────────────────────────
function MatchingGame({ config, color, onComplete }) {
  const { pairs = [], instructions = 'Match the items on the left with their partners on the right!' } = config || {};
  const [selected, setSelected] = useState({ left: null, right: null });
  const [matched, setMatched] = useState([]);
  const [wrong, setWrong] = useState(null);

  const shuffledRight = useMemo(() => {
    const arr = pairs.map((p, i) => ({ ...p, idx: i }));
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor((i * 7 + 3) % (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [pairs]);

  function selectLeft(idx) {
    if (matched.includes(idx)) return;
    setSelected(s => ({ ...s, left: idx }));
    setWrong(null);
  }

  function selectRight(idx) {
    if (matched.includes(idx)) return;
    setSelected(s => {
      if (s.left !== null) {
        if (s.left === idx) {
          setMatched(m => [...m, idx]);
          if (matched.length + 1 === pairs.length) onComplete?.();
          return { left: null, right: null };
        } else {
          setWrong({ left: s.left, right: idx });
          setTimeout(() => setWrong(null), 800);
          return { left: null, right: null };
        }
      }
      return { ...s, right: idx };
    });
  }

  return (
    <div>
      <p style={{color:'#e2e8f0',marginBottom:14,fontSize:14}}>{instructions}</p>
      
      <div style={{display:'grid',gridTemplateColumns:'1fr 40px 1fr',gap:8,alignItems:'start'}}>
        {/* Left column */}
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {pairs.map((pair, i) => {
            const isMatched = matched.includes(i);
            const isSelected = selected.left === i;
            const isWrongLeft = wrong?.left === i;
            return (
              <button key={i} onClick={() => selectLeft(i)} disabled={isMatched}
                style={{padding:'12px 16px',borderRadius:10,cursor:isMatched?'default':'pointer',textAlign:'left',
                  background: isMatched ? 'rgba(16,185,129,0.15)' : isWrongLeft ? 'rgba(239,68,68,0.15)' : isSelected ? color+'22' : 'rgba(255,255,255,0.05)',
                  border: `2px solid ${isMatched ? '#10b981' : isWrongLeft ? '#ef4444' : isSelected ? color : 'rgba(255,255,255,0.1)'}`,
                  color: isMatched ? '#6ee7b7' : '#e2e8f0', fontSize:14, fontWeight:isMatched?600:400,
                  opacity: isMatched ? 0.7 : 1}}>
                {pair.leftEmoji && <span style={{marginRight:8}}>{pair.leftEmoji}</span>}{pair.left}
              </button>
            );
          })}
        </div>

        {/* Connection indicator */}
        <div style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',height:'100%'}}>
          {pairs.map((_, i) => (
            <div key={i} style={{height:52,display:'flex',alignItems:'center'}}>
              <span style={{color:'rgba(255,255,255,0.2)'}}>→</span>
            </div>
          ))}
        </div>

        {/* Right column (shuffled) */}
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {shuffledRight.map((pair, i) => {
            const isMatched = matched.includes(pair.idx);
            const isSelected = selected.right === pair.idx;
            const isWrongRight = wrong?.right === pair.idx;
            return (
              <button key={i} onClick={() => selectRight(pair.idx)} disabled={isMatched}
                style={{padding:'12px 16px',borderRadius:10,cursor:isMatched?'default':'pointer',textAlign:'left',
                  background: isMatched ? 'rgba(16,185,129,0.15)' : isWrongRight ? 'rgba(239,68,68,0.15)' : isSelected ? color+'22' : 'rgba(255,255,255,0.05)',
                  border: `2px solid ${isMatched ? '#10b981' : isWrongRight ? '#ef4444' : isSelected ? color : 'rgba(255,255,255,0.1)'}`,
                  color: isMatched ? '#6ee7b7' : '#e2e8f0', fontSize:14, fontWeight:isMatched?600:400,
                  opacity: isMatched ? 0.7 : 1}}>
                {pair.rightEmoji && <span style={{marginRight:8}}>{pair.rightEmoji}</span>}{pair.right}
              </button>
            );
          })}
        </div>
      </div>

      {matched.length === pairs.length && (
        <div style={successBox}>🎉 All pairs matched! Great job!</div>
      )}
      
      <div style={{marginTop:12,fontSize:12,color:'rgba(255,255,255,0.4)'}}>
        Matched: {matched.length}/{pairs.length}
      </div>
    </div>
  );
}

// ─── LABELLING GAME (Label parts of something) ──────────────────────────────
function LabellingGame({ config, color, onComplete }) {
  const { image, labels = [], instructions = 'Drag the labels to the correct spots!' } = config || {};
  const [placed, setPlaced] = useState({});
  const [checked, setChecked] = useState(false);
  const [dragLabel, setDragLabel] = useState(null);

  const unplaced = labels.filter(l => !Object.values(placed).includes(l.id));
  const allPlaced = unplaced.length === 0;

  function handleDrop(spotId) {
    if (!dragLabel) return;
    setPlaced(prev => ({ ...prev, [spotId]: dragLabel }));
    setDragLabel(null);
  }

  function check() {
    setChecked(true);
    const allCorrect = labels.every(l => placed[l.spot] === l.id);
    if (allCorrect) onComplete?.();
  }

  const score = checked ? labels.filter(l => placed[l.spot] === l.id).length : 0;

  return (
    <div>
      <p style={{color:'#e2e8f0',marginBottom:12,fontSize:14}}>{instructions}</p>
      
      {/* Labels to drag */}
      <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:16,padding:12,background:'rgba(0,0,0,0.2)',borderRadius:12}}>
        {unplaced.length > 0 ? unplaced.map(label => (
          <div key={label.id} draggable onDragStart={() => setDragLabel(label.id)}
            style={{padding:'8px 14px',background:color+'22',border:`1px solid ${color}55`,
              borderRadius:8,cursor:'grab',color:'#fff',fontSize:13,fontWeight:500}}>
            {label.emoji && <span style={{marginRight:6}}>{label.emoji}</span>}{label.text}
          </div>
        )) : <span style={{color:'rgba(255,255,255,0.3)',fontSize:13}}>All labels placed!</span>}
      </div>

      {/* Labelling area - grid of spots */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(2, 1fr)',gap:10,marginBottom:16}}>
        {labels.map(label => {
          const placedLabel = placed[label.spot] ? labels.find(l => l.id === placed[label.spot]) : null;
          const isCorrect = checked && placed[label.spot] === label.id;
          const isWrong = checked && placed[label.spot] && placed[label.spot] !== label.id;
          
          return (
            <div key={label.spot} onDragOver={e => e.preventDefault()} onDrop={() => handleDrop(label.spot)}
              style={{padding:14,background:'rgba(255,255,255,0.03)',borderRadius:10,
                border: `2px dashed ${isCorrect ? '#10b981' : isWrong ? '#ef4444' : 'rgba(255,255,255,0.15)'}`,
                minHeight:60,display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',marginBottom:6}}>{label.description || `Spot ${label.spot}`}</div>
              {placedLabel ? (
                <div style={{padding:'6px 12px',borderRadius:6,fontWeight:600,fontSize:13,
                  background: isCorrect ? 'rgba(16,185,129,0.2)' : isWrong ? 'rgba(239,68,68,0.2)' : color+'22',
                  border: `1px solid ${isCorrect ? '#10b981' : isWrong ? '#ef4444' : color}`,
                  color: isCorrect ? '#6ee7b7' : isWrong ? '#fca5a5' : '#fff'}}>
                  {placedLabel.emoji && <span style={{marginRight:4}}>{placedLabel.emoji}</span>}{placedLabel.text}
                </div>
              ) : (
                <div style={{color:'rgba(255,255,255,0.2)',fontSize:12}}>Drop here</div>
              )}
            </div>
          );
        })}
      </div>

      {!checked ? (
        <button onClick={check} disabled={!allPlaced}
          style={{padding:'10px 20px',background:color,color:'#fff',border:'none',borderRadius:10,
            cursor:allPlaced?'pointer':'not-allowed',fontWeight:700,opacity:allPlaced?1:0.5}}>
          ✓ Check Labels
        </button>
      ) : score === labels.length ? (
        <div style={successBox}>🎉 All labels correct! You know your stuff!</div>
      ) : (
        <div style={failBox}>
          <span>❌ {score}/{labels.length} correct</span>
          <button onClick={() => { setPlaced({}); setChecked(false); }}
            style={{padding:'6px 12px',background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.2)',
              color:'#fff',borderRadius:8,cursor:'pointer',fontSize:13}}>Try Again</button>
        </div>
      )}
    </div>
  );
}

// ─── SIMULATION (Interactive scenario with choices) ──────────────────────────
function SimulationGame({ config, color, onComplete }) {
  const { scenario, steps = [], instructions } = config || {};
  const [stepIdx, setStepIdx] = useState(0);
  const [choices, setChoices] = useState([]);
  const [feedback, setFeedback] = useState(null);

  const currentStep = steps[stepIdx];
  const isComplete = stepIdx >= steps.length;

  function makeChoice(choiceIdx) {
    const step = steps[stepIdx];
    const choice = step.choices[choiceIdx];
    const isCorrect = choiceIdx === step.correct;
    
    setChoices([...choices, { step: stepIdx, choice: choiceIdx, correct: isCorrect }]);
    setFeedback({ correct: isCorrect, message: choice.feedback || (isCorrect ? 'Correct!' : 'Not quite...') });
    
    setTimeout(() => {
      setFeedback(null);
      if (isCorrect) {
        if (stepIdx + 1 >= steps.length) {
          onComplete?.();
        }
        setStepIdx(stepIdx + 1);
      }
    }, 1500);
  }

  if (isComplete) {
    const score = choices.filter(c => c.correct).length;
    return (
      <div>
        <div style={successBox}>
          🎉 Simulation complete! You made {score} correct choices.
        </div>
      </div>
    );
  }

  return (
    <div>
      {instructions && <p style={{color:'#e2e8f0',marginBottom:10,fontSize:14}}>{instructions}</p>}
      
      <div style={{padding:16,background:'rgba(255,255,255,0.03)',borderRadius:12,marginBottom:16}}>
        <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',marginBottom:8}}>
          Step {stepIdx + 1} of {steps.length}
        </div>
        <div style={{fontSize:15,fontWeight:600,color:'#fff',marginBottom:12}}>
          {currentStep?.situation}
        </div>
        
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {(currentStep?.choices || []).map((choice, i) => (
            <button key={i} onClick={() => makeChoice(i)} disabled={feedback !== null}
              style={{padding:'12px 16px',textAlign:'left',borderRadius:10,cursor:'pointer',
                background:'rgba(255,255,255,0.05)',border:'1.5px solid rgba(255,255,255,0.1)',
                color:'#e2e8f0',fontSize:14,opacity:feedback?0.5:1}}>
              {choice.emoji && <span style={{marginRight:8}}>{choice.emoji}</span>}
              {choice.text}
            </button>
          ))}
        </div>
      </div>

      {feedback && (
        <div style={{padding:'12px 16px',borderRadius:10,marginBottom:12,
          background: feedback.correct ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
          border: `1px solid ${feedback.correct ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.3)'}`,
          color: feedback.correct ? '#6ee7b7' : '#fca5a5', fontSize:14}}>
          {feedback.correct ? '✓' : '✗'} {feedback.message}
        </div>
      )}
    </div>
  );
}

// ─── DISPATCHER ───────────────────────────────────────────────────────────────
export default function ActivityRenderer({ activity, color='#6366f1', onComplete, completed=false }) {
  // Guard against undefined activity
  if (!activity) {
    return <div style={{color:'rgba(255,255,255,0.5)',padding:16,textAlign:'center'}}>Activity not found.</div>;
  }
  
  const { type, title, description, xp, duration } = activity;
  const finish = completed ? undefined : onComplete;

  return (
    <div>
      <div style={{marginBottom:16}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6,flexWrap:'wrap'}}>
          <div style={{fontWeight:800,fontSize:16,color:'#f0f0ff'}}>{title}</div>
          <span style={{fontSize:11,fontWeight:700,color:'#fbbf24',background:'rgba(251,191,36,0.12)',
            border:'1px solid rgba(251,191,36,0.3)',borderRadius:20,padding:'2px 8px'}}>+{xp} XP</span>
          {duration && <span style={{fontSize:10,color:'rgba(255,255,255,0.35)'}}>⏱ {duration}</span>}
        </div>
        {description && <div style={{fontSize:13,color:'rgba(255,255,255,0.5)',lineHeight:1.5}}>{description}</div>}
      </div>

      {type === 'blocks'     && (
        <BlockCodingLab
          config={activity.config}
          color={color}
          storageKey={`bb_puzzle_${activity.title?.replace(/\s/g, '_') || 'blocks'}`}
          onComplete={finish}
        />
      )}
      {type === 'grid'       && <GridRobot config={activity.config || activity} color={color} onComplete={finish} />}
      {type === 'seq'        && <SequenceGame config={activity} color={color} onComplete={finish} />}
      {type === 'debug'      && <DebugChallenge config={activity.config || activity} color={color} onComplete={finish} />}
      {type === 'trace'      && <CodeTrace config={activity.config || activity} color={color} onComplete={finish} />}
      {type === 'multiSeq'   && <MultiSequenceGame tasks={activity.tasks} color={color} onComplete={finish} />}
      {type === 'characters' && <CharacterExplorer color={color} onComplete={finish} />}
      {type === 'glossary'   && <GlossaryExplorer terms={activity.terms} color={color} onComplete={finish} />}
      {type === 'prediction' && <PredictionChallenge {...activity} color={color} onComplete={finish} />}
      {type === 'pattern'    && <PatternPainter target={activity.target} showSeconds={activity.showSeconds} creative={activity.creative} color={color} onComplete={finish} />}
      {type === 'collector'  && <CollectorPuzzle config={activity.config || activity} color={color} onComplete={finish} />}
      {type === 'response'   && <ResponsePuzzle config={activity.config || activity} color={color} onComplete={finish} />}
      {type === 'sorting'    && <SortingGame config={activity.config || activity} color={color} onComplete={finish} />}
      {type === 'quiz'       && <QuizGame config={activity.config || activity} color={color} onComplete={finish} />}
      {type === 'matching'   && <MatchingGame config={activity.config || activity} color={color} onComplete={finish} />}
      {type === 'labelling'  && <LabellingGame config={activity.config || activity} color={color} onComplete={finish} />}
      {type === 'simulation' && <SimulationGame config={activity.config || activity} color={color} onComplete={finish} />}
    </div>
  );
}
