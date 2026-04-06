import React, { useState, useRef, useEffect, useCallback } from 'react';

let _uid = 0;
const newId = () => String(++_uid);
const sleep = ms => new Promise(r => setTimeout(r, ms));

const CATS = [
  { id: 'events',  label: '⚡ Events',  color: '#f59e0b' },
  { id: 'motion',  label: '🔷 Motion',  color: '#4f72ff' },
  { id: 'looks',   label: '💬 Looks',   color: '#9333ea' },
  { id: 'control', label: '🔄 Control', color: '#059669' },
  { id: 'pen',     label: '✏️ Pen',     color: '#0ea5e9' },
];

// parts: text pieces, _ = input slot
const DEFS = {
  when_flag: { cat:'events',  color:'#f59e0b', label:'when 🚩 clicked',       parts:[] },
  move:      { cat:'motion',  color:'#4f72ff', label:'move _ steps',          parts:[{type:'num',key:'steps',val:10}] },
  turn_r:    { cat:'motion',  color:'#4f72ff', label:'turn ↻ _ degrees',      parts:[{type:'num',key:'deg',val:90}] },
  turn_l:    { cat:'motion',  color:'#4f72ff', label:'turn ↺ _ degrees',      parts:[{type:'num',key:'deg',val:90}] },
  go_xy:     { cat:'motion',  color:'#4f72ff', label:'go to x: _ y: _',       parts:[{type:'num',key:'x',val:0},{type:'num',key:'y',val:0}] },
  say:       { cat:'looks',   color:'#9333ea', label:'say _',                 parts:[{type:'str',key:'msg',val:'Hello!'}] },
  repeat:    { cat:'control', color:'#059669', label:'repeat _',              parts:[{type:'num',key:'n',val:4}], isC:true },
  wait:      { cat:'control', color:'#059669', label:'wait _ secs',           parts:[{type:'num',key:'s',val:0.5}] },
  pen_down:  { cat:'pen',     color:'#0ea5e9', label:'pen down',              parts:[] },
  pen_up:    { cat:'pen',     color:'#0ea5e9', label:'pen up',                parts:[] },
  pen_color: { cat:'pen',     color:'#0ea5e9', label:'set pen color _',       parts:[{type:'color',key:'color',val:'#ff0000'}] },
  pen_size:  { cat:'pen',     color:'#0ea5e9', label:'set pen size _',        parts:[{type:'num',key:'size',val:2}] },
};

function initBlocks(raw) {
  return (raw || []).map(b => ({
    ...b, id: b.id || newId(),
    children: b.children ? initBlocks(b.children) : undefined,
  }));
}

function newBlock(type) {
  const def = DEFS[type];
  const params = {};
  def.parts.forEach(p => { if (p.key) params[p.key] = p.val; });
  return { id: newId(), type, params, ...(def.isC ? { children: [] } : {}) };
}

function drawStage(canvas, state) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height, cx = W/2, cy = H/2;
  ctx.fillStyle = '#0f0f1a'; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(255,255,255,0.05)'; ctx.lineWidth=1;
  for(let x=0;x<=W;x+=30){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
  for(let y=0;y<=H;y+=30){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  ctx.strokeStyle='rgba(255,255,255,0.12)';
  ctx.beginPath();ctx.moveTo(cx,0);ctx.lineTo(cx,H);ctx.stroke();
  ctx.beginPath();ctx.moveTo(0,cy);ctx.lineTo(W,cy);ctx.stroke();
  for(const l of state.trail){
    ctx.strokeStyle=l.color;ctx.lineWidth=l.size;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(cx+l.x1,cy+l.y1);ctx.lineTo(cx+l.x2,cy+l.y2);ctx.stroke();
  }
  const sx=cx+state.x, sy=cy+state.y, r=state.dir*Math.PI/180;
  ctx.save();ctx.translate(sx,sy);ctx.rotate(r);
  ctx.fillStyle='#818cf8';ctx.strokeStyle='#c7d2fe';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(14,0);ctx.lineTo(-9,7);ctx.lineTo(-4,0);ctx.lineTo(-9,-7);ctx.closePath();
  ctx.fill();ctx.stroke();ctx.restore();
  if(state.saying){
    ctx.font='bold 11px system-ui';
    const tw=ctx.measureText(state.saying).width;
    const bw=tw+18,bh=26,bx=sx+16,by=sy-18;
    ctx.fillStyle='white';ctx.strokeStyle='#ccc';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(bx+5,by-bh/2);
    ctx.lineTo(bx+bw-5,by-bh/2);ctx.quadraticCurveTo(bx+bw,by-bh/2,bx+bw,by-bh/2+5);
    ctx.lineTo(bx+bw,by+bh/2-5);ctx.quadraticCurveTo(bx+bw,by+bh/2,bx+bw-5,by+bh/2);
    ctx.lineTo(bx+5,by+bh/2);ctx.quadraticCurveTo(bx,by+bh/2,bx,by+bh/2-5);
    ctx.lineTo(bx,by-bh/2+5);ctx.quadraticCurveTo(bx,by-bh/2,bx+5,by-bh/2);
    ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillStyle='#222';ctx.fillText(state.saying,bx+9,by+4);
  }
}

async function runBlocks(blocks, state, onFrame, isStopped) {
  for(const b of blocks){
    if(isStopped()) return;
    switch(b.type){
      case 'move':{
        const r=state.dir*Math.PI/180;
        const nx=state.x+b.params.steps*Math.cos(r);
        const ny=state.y-b.params.steps*Math.sin(r);
        if(state.penDown) state.trail.push({x1:state.x,y1:state.y,x2:nx,y2:ny,color:state.penColor,size:state.penSize});
        state.x=nx;state.y=ny;break;
      }
      case 'turn_r': state.dir+=b.params.deg; break;
      case 'turn_l': state.dir-=b.params.deg; break;
      case 'go_xy':  state.x=b.params.x;state.y=b.params.y; break;
      case 'say':
        state.saying=b.params.msg; onFrame(); await sleep(2000); state.saying=''; break;
      case 'wait': await sleep(Math.min(b.params.s*1000,3000)); break;
      case 'pen_down':  state.penDown=true; break;
      case 'pen_up':    state.penDown=false; break;
      case 'pen_color': state.penColor=b.params.color; break;
      case 'pen_size':  state.penSize=Number(b.params.size); break;
      case 'repeat':
        for(let i=0;i<b.params.n&&!isStopped();i++)
          await runBlocks(b.children||[],state,onFrame,isStopped);
        break;
    }
    onFrame(); await sleep(60);
  }
}

function BlockItem({ block, onParamChange, onDelete, onAddInside }) {
  const def = DEFS[block.type]; if(!def) return null;
  const cat = CATS.find(c=>c.id===def.cat);
  const color = cat?.color||'#888';
  const labelParts = def.label.split('_');
  return (
    <div style={{marginBottom:3}}>
      <div style={{display:'flex',alignItems:'center',gap:5,
        background:`${color}22`,border:`1.5px solid ${color}50`,
        borderLeft:`4px solid ${color}`,borderRadius:8,padding:'4px 8px 4px 10px',userSelect:'none'}}>
        {labelParts.map((part,i)=>{
          const p=def.parts[i];
          return (
            <React.Fragment key={i}>
              <span style={{fontSize:12,fontWeight:600,color:'#e2e8f0',whiteSpace:'nowrap'}}>{part}</span>
              {p?.type==='num'&&<input type="number" value={block.params[p.key]}
                onChange={e=>onParamChange(block.id,p.key,Number(e.target.value))}
                style={{width:44,fontSize:12,fontWeight:700,textAlign:'center',background:'rgba(255,255,255,0.18)',border:'none',borderRadius:4,color:'#fff',padding:'1px 2px'}}/>}
              {p?.type==='str'&&<input type="text" value={block.params[p.key]}
                onChange={e=>onParamChange(block.id,p.key,e.target.value)}
                style={{width:80,fontSize:12,background:'rgba(255,255,255,0.18)',border:'none',borderRadius:4,color:'#fff',padding:'1px 6px'}}/>}
              {p?.type==='color'&&<input type="color" value={block.params[p.key]}
                onChange={e=>onParamChange(block.id,p.key,e.target.value)}
                style={{width:28,height:22,border:'none',borderRadius:4,cursor:'pointer',padding:0}}/>}
            </React.Fragment>
          );
        })}
        <button onClick={()=>onDelete(block.id)} style={{marginLeft:'auto',flexShrink:0,
          background:'rgba(255,255,255,0.1)',border:'none',borderRadius:4,
          color:'#94a3b8',cursor:'pointer',fontSize:11,padding:'1px 6px'}}>✕</button>
      </div>
      {def.isC&&(
        <div style={{marginLeft:18,borderLeft:`3px solid ${color}50`,paddingLeft:8,marginTop:2,marginBottom:2}}>
          {(block.children||[]).map(child=>(
            <BlockItem key={child.id} block={child} onParamChange={onParamChange} onDelete={onDelete} onAddInside={onAddInside}/>
          ))}
          <button onClick={()=>onAddInside(block.id)} style={{fontSize:11,color,
            background:`${color}18`,border:`1px dashed ${color}70`,
            borderRadius:6,padding:'2px 10px',cursor:'pointer',marginTop:2,marginBottom:2}}>
            + add block inside
          </button>
        </div>
      )}
    </div>
  );
}

export default function BlockEditor({ starterBlocks, editorHeight=400 }) {
  const [activeCat,setActiveCat]=useState('events');
  const [workspace,setWorkspace]=useState(()=>initBlocks(starterBlocks||[newBlock('when_flag')]));
  const [running,setRunning]=useState(false);
  const [insertTarget,setInsertTarget]=useState(null);
  const canvasRef=useRef();
  const stoppedRef=useRef(false);
  const spriteRef=useRef({x:0,y:0,dir:0,saying:'',penDown:false,penColor:'#ff0000',penSize:2,trail:[]});

  const resetSprite=()=>{ spriteRef.current={x:0,y:0,dir:0,saying:'',penDown:false,penColor:'#ff0000',penSize:2,trail:[]}; };
  const redraw=useCallback(()=>{ if(canvasRef.current) drawStage(canvasRef.current,spriteRef.current); },[]);
  useEffect(()=>{ redraw(); },[]);

  const handleRun=async()=>{
    stoppedRef.current=false; resetSprite(); redraw(); setRunning(true);
    const fi=workspace.findIndex(b=>b.type==='when_flag');
    await runBlocks(fi>=0?workspace.slice(fi+1):workspace, spriteRef.current, redraw, ()=>stoppedRef.current);
    setRunning(false);
  };
  const handleStop=()=>{ stoppedRef.current=true; setRunning(false); };
  const handleReset=()=>{ handleStop(); resetSprite(); redraw(); };

  const onParamChange=(blockId,key,val)=>{
    const up=bs=>bs.map(b=>{
      if(b.id===blockId) return{...b,params:{...b.params,[key]:val}};
      if(b.children) return{...b,children:up(b.children)};
      return b;
    });
    setWorkspace(p=>up(p));
  };
  const onDelete=(blockId)=>{
    const rm=bs=>bs.filter(b=>b.id!==blockId).map(b=>b.children?{...b,children:rm(b.children)}:b);
    setWorkspace(p=>rm(p));
  };
  const handlePaletteClick=(type)=>{
    const block=newBlock(type);
    if(insertTarget){
      setWorkspace(p=>p.map(b=>b.id===insertTarget?{...b,children:[...(b.children||[]),block]}:b));
      setInsertTarget(null);
    } else {
      setWorkspace(p=>[...p,block]);
    }
  };

  const palBlocks=Object.entries(DEFS).filter(([,d])=>d.cat===activeCat);
  const STAGE_W=220;

  return (
    <div style={{display:'flex',height:editorHeight,borderRadius:12,overflow:'hidden',
      border:'1px solid var(--border-color)',background:'#0d0d1a',fontFamily:'system-ui'}}>

      {/* Palette */}
      <div style={{width:172,borderRight:'1px solid rgba(255,255,255,0.08)',display:'flex',flexDirection:'column',flexShrink:0}}>
        <div style={{padding:5,display:'flex',flexDirection:'column',gap:1,borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
          {CATS.map(cat=>(
            <button key={cat.id} onClick={()=>setActiveCat(cat.id)} style={{
              padding:'4px 8px',borderRadius:6,border:'none',cursor:'pointer',textAlign:'left',
              fontSize:11,fontWeight:600,
              background:activeCat===cat.id?`${cat.color}30`:'transparent',
              color:activeCat===cat.id?cat.color:'#64748b',
              borderLeft:activeCat===cat.id?`3px solid ${cat.color}`:'3px solid transparent',
            }}>{cat.label}</button>
          ))}
        </div>
        <div style={{flex:1,overflowY:'auto',padding:5,display:'flex',flexDirection:'column',gap:3}}>
          {insertTarget&&<div style={{fontSize:10,color:'#f59e0b',padding:'3px 6px',background:'#f59e0b20',borderRadius:5,marginBottom:2}}>Picking for inside ↓</div>}
          {palBlocks.map(([type,def])=>{
            const cat=CATS.find(c=>c.id===def.cat);
            return(
              <button key={type} onClick={()=>handlePaletteClick(type)} style={{
                padding:'5px 8px',borderRadius:8,border:`1.5px solid ${cat?.color}50`,
                background:`${cat?.color}18`,color:'#e2e8f0',cursor:'pointer',textAlign:'left',fontSize:11,fontWeight:600,
              }}
              onMouseEnter={e=>e.currentTarget.style.background=`${cat?.color}35`}
              onMouseLeave={e=>e.currentTarget.style.background=`${cat?.color}18`}
              >{def.label.replace(/_/g,'[ ]')}</button>
            );
          })}
        </div>
      </div>

      {/* Workspace */}
      <div style={{flex:1,display:'flex',flexDirection:'column',minWidth:0}}>
        <div style={{display:'flex',gap:6,padding:'6px 10px',borderBottom:'1px solid rgba(255,255,255,0.08)',alignItems:'center',flexShrink:0}}>
          <button onClick={handleRun} disabled={running} style={{padding:'4px 12px',borderRadius:8,border:'none',
            cursor:running?'default':'pointer',background:running?'#1f2937':'#16a34a',color:'#fff',fontWeight:700,fontSize:12}}>▶ Run</button>
          <button onClick={handleStop} disabled={!running} style={{padding:'4px 10px',borderRadius:8,border:'none',
            cursor:!running?'default':'pointer',background:'#dc2626',color:'#fff',fontWeight:700,fontSize:12,opacity:!running?0.4:1}}>■ Stop</button>
          <button onClick={handleReset} style={{padding:'4px 10px',borderRadius:8,
            border:'1px solid rgba(255,255,255,0.12)',cursor:'pointer',background:'transparent',color:'#64748b',fontSize:12}}>↺</button>
          {insertTarget&&<button onClick={()=>setInsertTarget(null)} style={{fontSize:11,color:'#f59e0b',background:'transparent',border:'none',cursor:'pointer'}}>✕ cancel</button>}
        </div>
        <div style={{flex:1,overflowY:'auto',padding:8}}>
          {workspace.length===0&&(
            <div style={{textAlign:'center',color:'#374151',fontSize:13,paddingTop:28}}>
              <div style={{fontSize:28,marginBottom:6}}>🧩</div>Click a block to add it
            </div>
          )}
          {workspace.map(block=>(
            <BlockItem key={block.id} block={block}
              onParamChange={onParamChange} onDelete={onDelete}
              onAddInside={id=>{setInsertTarget(id);setActiveCat('motion');}}/>
          ))}
        </div>
      </div>

      {/* Stage */}
      <div style={{width:STAGE_W,display:'flex',flexDirection:'column',flexShrink:0}}>
        <div style={{padding:'5px 10px',borderLeft:'1px solid rgba(255,255,255,0.08)',
          borderBottom:'1px solid rgba(255,255,255,0.08)',
          fontSize:10,fontWeight:700,color:'#374151',textTransform:'uppercase',letterSpacing:1}}>Stage</div>
        <canvas ref={canvasRef} width={STAGE_W} height={editorHeight-28}
          style={{display:'block',borderLeft:'1px solid rgba(255,255,255,0.08)'}}/>
      </div>
    </div>
  );
}
