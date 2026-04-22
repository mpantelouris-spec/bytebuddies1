import React, { useState, useRef, useEffect } from 'react';

const loadSkulpt = () => new Promise((resolve, reject) => {
  if (window.Sk) return resolve();
  const s1 = document.createElement('script');
  s1.src = 'https://skulpt.org/js/skulpt.min.js';
  s1.onerror = () => reject(new Error('Failed to load Python engine'));
  s1.onload = () => {
    const s2 = document.createElement('script');
    s2.src = 'https://skulpt.org/js/skulpt-stdlib.js';
    s2.onerror = () => reject(new Error('Failed to load Python stdlib'));
    s2.onload = resolve;
    document.head.appendChild(s2);
  };
  document.head.appendChild(s1);
});

export default function PythonRunner({ starterCode = 'print("Hello, World!")', editorHeight = 200 }) {
  const [code, setCode] = useState(starterCode);
  const [output, setOutput] = useState([]);
  const [error, setError] = useState('');
  const [running, setRunning] = useState(false);
  const [skulptReady, setSkulptReady] = useState(false);
  const outputRef = useRef();
  const linesRef = useRef([]);

  const run = async () => {
    setRunning(true); setOutput([]); setError(''); linesRef.current = [];
    try {
      await loadSkulpt();
      setSkulptReady(true);
      window.Sk.configure({
        output: text => { linesRef.current = [...linesRef.current, text]; setOutput([...linesRef.current]); },
        inputfun: prompt => window.prompt(prompt || 'Enter value:') ?? '',
        inputfunTakesPrompt: true,
        read: x => {
          if (window.Sk.builtinFiles?.files[x]) return window.Sk.builtinFiles.files[x];
          throw new Error(`File not found: '${x}'`);
        },
        execLimit: 15000,
      });
      await window.Sk.misceval.asyncToPromise(() =>
        window.Sk.importMainWithBody('<stdin>', false, code, true)
      );
    } catch(e) {
      const msg = String(e);
      setError(msg.replace(/^.*?(?:Error|Exception):\s*/,''));
    } finally { setRunning(false); }
  };

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [output]);

  return (
    <div style={{borderRadius:12,overflow:'hidden',border:'1px solid var(--border-color)',background:'#0d1117',fontFamily:'system-ui'}}>
      <div style={{display:'flex',alignItems:'center',gap:8,padding:'7px 12px',background:'#161b22',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
        <span style={{fontSize:11,fontWeight:800,color:'#a78bfa',textTransform:'uppercase',letterSpacing:1}}>🐍 Python</span>
        <span style={{fontSize:11,color:'#374151'}}>— edit and run</span>
        <button onClick={run} disabled={running} style={{marginLeft:'auto',padding:'4px 16px',borderRadius:8,
          border:'none',cursor:running?'default':'pointer',
          background:running?'#1f2937':'#16a34a',color:'#fff',fontWeight:700,fontSize:12}}>
          {running ? '⏳ Running...' : '▶ Run'}
        </button>
      </div>
      <textarea value={code} onChange={e=>setCode(e.target.value)} spellCheck={false}
        style={{width:'100%',height:editorHeight,display:'block',resize:'none',boxSizing:'border-box',
          background:'#0d1117',color:'#e6edf3',border:'none',outline:'none',
          fontFamily:"'JetBrains Mono','Fira Code','Consolas',monospace",
          fontSize:13,lineHeight:1.65,padding:'12px 16px',caretColor:'#a78bfa',tabSize:4}}
        onKeyDown={e=>{
          if(e.key==='Tab'){
            e.preventDefault();
            const s=e.target.selectionStart,end=e.target.selectionEnd;
            const v=code.substring(0,s)+'    '+code.substring(end);
            setCode(v);
            requestAnimationFrame(()=>{ e.target.selectionStart=e.target.selectionEnd=s+4; });
          }
        }}
      />
      <div style={{borderTop:'1px solid rgba(255,255,255,0.08)'}}>
        <div style={{padding:'4px 12px',background:'#161b22',borderBottom:'1px solid rgba(255,255,255,0.06)',
          fontSize:10,fontWeight:700,color:'#374151',textTransform:'uppercase',letterSpacing:1,
          display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          Output
          {(output.length>0||error)&&<button onClick={()=>{setOutput([]);setError('');}} style={{background:'none',border:'none',color:'#374151',cursor:'pointer',fontSize:11}}>Clear</button>}
        </div>
        <div ref={outputRef} style={{padding:'10px 16px',minHeight:60,maxHeight:130,overflowY:'auto',
          fontFamily:"'JetBrains Mono','Consolas',monospace",fontSize:13,lineHeight:1.6}}>
          {output.length===0&&!error&&<span style={{color:'#374151',fontSize:12}}>Run your code to see output here</span>}
          {output.map((line,i)=><div key={i} style={{color:'#7ee787',whiteSpace:'pre'}}>{line}</div>)}
          {error&&<div style={{color:'#f87171',fontSize:12,whiteSpace:'pre-wrap'}}>❌ {error}</div>}
        </div>
      </div>
    </div>
  );
}
