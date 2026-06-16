import React, { useState, useEffect, useMemo, useRef } from 'react';
import { CHARACTERS } from '../../../data/learnWorldData';

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
  const { steps, instructions='Arrange the steps in the correct order!', context } = config;

  const scrambled = useMemo(() => scrambleSteps(steps), [steps.join('|')]);
  const answerKey = useMemo(() => [...steps], [steps.join('|')]);

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
  }, [steps.join('|')]);

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
  const { blocks, bugIdx, fixOptions, correctFix,
    instructions='Find the bug in this code and fix it!', context } = config;

  const [selBlock, setSelBlock] = useState(null);
  const [selFix,   setSelFix]   = useState(null);
  const [confirmed, setConf]    = useState(false);
  const [correct,   setCorrect] = useState(false);

  function confirm() {
    if (selBlock===null||selFix===null) return;
    const ok = selBlock===bugIdx && selFix===correctFix;
    setConf(true); setCorrect(ok); if (ok) onComplete?.();
  }
  function retry() { setSelBlock(null); setSelFix(null); setConf(false); setCorrect(false); }

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
  const { lines, questions, instructions='Trace through this code and answer the questions!' } = config;
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState({});

  function check() {
    const res={};
    questions.forEach((q,i)=>{ res[i]=answers[i]?.trim()===q.answer.trim(); });
    setChecked(true); setResults(res);
    if (Object.values(res).every(Boolean)) onComplete?.();
  }
  function retry() { setAnswers({}); setChecked(false); setResults({}); }

  const allAnswered = questions.every((_,i)=>answers[i]?.trim());

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
function MultiSequenceGame({ tasks, color, onComplete }) {
  const [taskIdx, setTaskIdx] = useState(0);
  const [done, setDone] = useState([]);

  const task = tasks[taskIdx];
  function handleTaskComplete() {
    const next = [...done, taskIdx];
    setDone(next);
    if (taskIdx < tasks.length - 1) setTaskIdx(taskIdx + 1);
    else onComplete?.();
  }

  return (
    <div>
      <div style={{display:'flex',gap:6,marginBottom:14,flexWrap:'wrap'}}>
        {tasks.map((t,i)=>(
          <span key={i} style={{fontSize:11,padding:'4px 10px',borderRadius:20,fontWeight:700,
            background:done.includes(i)?'rgba(16,185,129,0.2)':i===taskIdx?color+'33':'rgba(255,255,255,0.06)',
            border:`1px solid ${done.includes(i)?'#10b981':i===taskIdx?color:'rgba(255,255,255,0.12)'}`,
            color:done.includes(i)?'#6ee7b7':i===taskIdx?'#fff':'rgba(255,255,255,0.4)'}}>
            {done.includes(i)?'✓ ':''}{t.name}
          </span>
        ))}
      </div>
      <SequenceGame key={taskIdx}
        config={{ steps: task.steps, instructions: `Put the steps for "${task.name}" in order!`, context: task.name }}
        color={color} onComplete={handleTaskComplete} />
      {done.length === tasks.length && <div style={successBox}>🎉 All {tasks.length} algorithms sorted! Algorithm Finder badge unlocked!</div>}
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
          borderRadius:14,padding:16}}>
          <div style={{fontSize:14,color:'#e2e8f0',marginBottom:10,lineHeight:1.55}}>
            {CHARACTERS[active].emoji} <strong style={{color:CHARACTERS[active].color}}>{CHARACTERS[active].name}</strong>: "{CHARACTERS[active].quote}"
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
      )}
      {answered.size >= chars.length && <div style={successBox}>🎉 You met all {chars.length} Academy robots!</div>}
    </div>
  );
}

// ─── GLOSSARY EXPLORER ────────────────────────────────────────────────────────
function GlossaryExplorer({ terms, color, onComplete }) {
  const [learned, setLearned] = useState(new Set());
  const [quizIdx, setQuizIdx] = useState(null);
  const [quizAns, setQuizAns] = useState(null);

  function learn(i) {
    setLearned(l => {
      const next = new Set([...l, i]);
      if (next.size >= terms.length) setTimeout(() => onComplete?.(), 300);
      return next;
    });
    setQuizIdx(i);
    setQuizAns(null);
  }

  return (
    <div>
      <div style={{display:'flex',flexDirection:'column',gap:8}}>
        {terms.map((t,i)=>(
          <button key={i} onClick={()=>!learned.has(i)&&learn(i)}
            style={{textAlign:'left',padding:'12px 16px',borderRadius:12,cursor:learned.has(i)?'default':'pointer',
              background:learned.has(i)?'rgba(16,185,129,0.08)':'rgba(255,255,255,0.04)',
              border:`1.5px solid ${learned.has(i)?'#10b98144':color+'33'}`}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontWeight:800,color:color,fontSize:14}}>{t.term}</span>
              {learned.has(i)&&<span style={{fontSize:11,color:'#6ee7b7'}}>✓ Learned</span>}
            </div>
            {learned.has(i) && (
              <div style={{marginTop:8,fontSize:13,color:'rgba(255,255,255,0.65)',lineHeight:1.5}}>
                {t.def}<br/><em style={{color:'rgba(255,255,255,0.4)',fontSize:12}}>Example: {t.example}</em>
              </div>
            )}
          </button>
        ))}
      </div>
      {learned.size >= terms.length && <div style={successBox}>📚 All {terms.length} terms learned! +5 XP each</div>}
    </div>
  );
}

// ─── PREDICTION CHALLENGE ─────────────────────────────────────────────────────
function PredictionChallenge({ sequence, start, size=5, options, answer, instructions, color, onComplete }) {
  const [picked, setPicked] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const { endPos, correctIndex } = useMemo(() => {
    let x = start.x, y = start.y;
    for (const cmd of sequence) {
      if (cmd==='U'||cmd==='N') y = Math.max(0, y-1);
      if (cmd==='D'||cmd==='S') y = Math.min(size-1, y+1);
      if (cmd==='L'||cmd==='W') x = Math.max(0, x-1);
      if (cmd==='R'||cmd==='E') x = Math.min(size-1, x+1);
    }
    const idx = options.findIndex(opt => {
      const m = opt.match(/\((\d+),\s*(\d+)\)/);
      return m && parseInt(m[1], 10) === x && parseInt(m[2], 10) === y;
    });
    return { endPos: { x, y }, correctIndex: idx >= 0 ? idx : answer };
  }, [sequence.join('|'), start.x, start.y, size, options.join('|'), answer]);

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
          <div style={{fontSize:11,color:'rgba(255,255,255,0.35)',marginBottom:6}}>START 🤖 at ({start.x}, {start.y})</div>
          <div style={{display:'grid',gridTemplateColumns:`repeat(${size},32px)`,gap:2}}>
            {Array.from({length:size*size},(_,i)=>{
              const gx=i%size, gy=Math.floor(i/size);
              const isStart=start.x===gx&&start.y===gy;
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
          Commands: {sequence.join(' → ')}
        </div>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:6}}>
        {options.map((opt,i)=>(
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
function PatternPainter({ target, showSeconds, creative, color, onComplete }) {
  const rows = target?.length || 5;
  const cols = target?.[0]?.length || 5;
  const [grid, setGrid] = useState(() => Array.from({length:rows},()=>Array(cols).fill(0)));
  const [showTarget, setShowTarget] = useState(!showSeconds);
  const [checked, setChecked] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (showSeconds && target) {
      setShowTarget(true);
      const t = setTimeout(() => setShowTarget(false), showSeconds * 1000);
      return () => clearTimeout(t);
    }
  }, [showSeconds, target]);

  function toggle(r,c) {
    if (checked) return;
    setGrid(g => { const n = g.map(row=>[...row]); n[r][c] = n[r][c]?0:1; return n; });
  }

  function check() {
    if (creative) { setSaved(true); onComplete?.(); return; }
    const ok = target.every((row,r)=>row.every((v,c)=>v===(grid[r]?.[c]||0)));
    setChecked(true);
    if (ok) setTimeout(() => onComplete?.(), 500);
  }
  function retryPattern() {
    setGrid(Array.from({length:rows},()=>Array(cols).fill(0)));
    setChecked(false);
  }

  function renderGrid(cells, interactive) {
    return (
      <div style={{display:'grid',gridTemplateColumns:`repeat(${cols},36px)`,gap:3}}>
        {cells.flatMap((row,r)=>row.map((v,c)=>(
          <div key={`${r}-${c}`} onClick={()=>interactive&&toggle(r,c)}
            style={{width:36,height:36,borderRadius:6,cursor:interactive?'pointer':'default',
              background:v?color:'rgba(255,255,255,0.06)',border:`1px solid ${v?color:'rgba(255,255,255,0.1)'}`,
              transition:'background 0.15s'}} />
        )))}
      </div>
    );
  }

  return (
    <div>
      {target && showTarget && !creative && (
        <div style={{marginBottom:16}}>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.4)',marginBottom:6}}>TARGET PATTERN {showSeconds?'(memorise it!)':''}</div>
          {renderGrid(target, false)}
        </div>
      )}
      <div style={{fontSize:12,color:'rgba(255,255,255,0.4)',marginBottom:6}}>
        {creative ? 'Click squares to paint your masterpiece!' : 'Recreate the pattern:'}
      </div>
      {renderGrid(grid, true)}
      <button onClick={check} style={{marginTop:12,padding:'9px 18px',background:color,color:'#fff',border:'none',borderRadius:9,cursor:'pointer',fontWeight:700,fontSize:13}}>
        {creative ? '🎨 Save Masterpiece' : '✓ Check Pattern'}
      </button>
      {checked && !creative && (
        <div style={target?.every((row,r)=>row.every((v,c)=>v===(grid[r]?.[c]||0)))?successBox:failBox}>
          <span>{target?.every((row,r)=>row.every((v,c)=>v===(grid[r]?.[c]||0)))?'🎨 Pattern matched!':'❌ Not quite — compare with the target and try again!'}</span>
          {!target?.every((row,r)=>row.every((v,c)=>v===(grid[r]?.[c]||0))) && (
            <button onClick={retryPattern}
              style={{flexShrink:0,padding:'4px 10px',background:'rgba(255,255,255,0.09)',border:'1px solid rgba(255,255,255,0.18)',color:'#fff',borderRadius:6,cursor:'pointer',fontSize:12}}>
              Try Again
            </button>
          )}
        </div>
      )}
      {creative && saved && <div style={{...successBox,marginTop:12}}>🎨 Masterpiece saved to gallery!</div>}
    </div>
  );
}

// ─── DISPATCHER ───────────────────────────────────────────────────────────────
export default function ActivityRenderer({ activity, color='#6366f1', onComplete, completed=false }) {
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

      {type === 'grid'       && <GridRobot config={activity.config} color={color} onComplete={finish} />}
      {type === 'seq'        && <SequenceGame config={activity} color={color} onComplete={finish} />}
      {type === 'debug'      && <DebugChallenge config={activity} color={color} onComplete={finish} />}
      {type === 'trace'      && <CodeTrace config={activity} color={color} onComplete={finish} />}
      {type === 'multiSeq'   && <MultiSequenceGame tasks={activity.tasks} color={color} onComplete={finish} />}
      {type === 'characters' && <CharacterExplorer color={color} onComplete={finish} />}
      {type === 'glossary'   && <GlossaryExplorer terms={activity.terms} color={color} onComplete={finish} />}
      {type === 'prediction' && <PredictionChallenge {...activity} color={color} onComplete={finish} />}
      {type === 'pattern'    && <PatternPainter target={activity.target} showSeconds={activity.showSeconds} creative={activity.creative} color={color} onComplete={finish} />}
    </div>
  );
}
