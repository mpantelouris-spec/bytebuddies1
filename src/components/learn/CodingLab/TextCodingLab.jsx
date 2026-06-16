import React, { useState, useEffect, useRef, useCallback } from 'react';

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

async function runPython(code, onLog, onError) {
  await loadSkulpt();
  const lines = [];
  window.Sk.configure({
    output: text => { lines.push(text); onLog(text); },
    inputfun: prompt => window.prompt(prompt || 'Enter value:') ?? '',
    inputfunTakesPrompt: true,
    read: x => {
      if (window.Sk.builtinFiles?.files[x]) return window.Sk.builtinFiles.files[x];
      throw new Error(`File not found: '${x}'`);
    },
    execLimit: 15000,
  });
  try {
    await window.Sk.misceval.asyncToPromise(() =>
      window.Sk.importMainWithBody('<stdin>', false, code, true)
    );
    return { ok: true, logs: lines };
  } catch (e) {
    const msg = String(e).replace(/^.*?(?:Error|Exception):\s*/, '');
    onError(msg);
    return { ok: false, logs: lines };
  }
}

export default function TextCodingLab({ config, color, storageKey, onComplete }) {
  const { hints = [], starterCode = '', solutionCode = '' } = config;

  const [code, setCode] = useState(() => {
    try {
      return localStorage.getItem(`${storageKey}_py_code`) || starterCode;
    } catch { return starterCode; }
  });
  const [output, setOutput] = useState([]);
  const [error, setError] = useState('');
  const [running, setRunning] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [success, setSuccess] = useState(false);
  const [highlightLine, setHighlightLine] = useState(-1);
  const outputRef = useRef(null);
  const lines = code.split('\n');

  useEffect(() => {
    localStorage.setItem(`${storageKey}_py_code`, code);
  }, [code, storageKey]);

  const appendLog = useCallback((line) => {
    setOutput(prev => [...prev, line]);
  }, []);

  const run = async () => {
    setRunning(true);
    setOutput([]);
    setError('');
    setSuccess(false);
    setHighlightLine(-1);

    const start = Date.now();
    const result = await runPython(code, appendLog, setError);

    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    if (result.ok) {
      appendLog(`\nProgram completed in ${elapsed}s`);
      const hasOutput = result.logs.some(l => String(l).trim());
      if (hasOutput) {
        setSuccess(true);
        onComplete?.();
      }
    }
    setRunning(false);
  };

  const stepThrough = async () => {
    const nonEmpty = lines.map((l, i) => ({ l: l.trim(), i })).filter(x => x.l && !x.l.startsWith('#'));
    setOutput([]);
    setError('');
    for (const { l, i } of nonEmpty.slice(0, 8)) {
      setHighlightLine(i);
      appendLog(`▶ Line ${i + 1}: ${l.slice(0, 60)}`);
      await new Promise(r => setTimeout(r, 500));
    }
    setHighlightLine(-1);
  };

  const loadSolution = () => {
    setShowSolution(true);
    setCode(solutionCode);
  };

  const toolBtn = { padding: '5px 10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 7, color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 12, fontWeight: 800, color, letterSpacing: '0.05em' }}>
          BYTEBUDDIES CODE EDITOR — 🐍 Python
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button type="button" style={toolBtn} onClick={() => localStorage.setItem(`${storageKey}_code`, code)}>💾 Save</button>
          <button type="button" style={toolBtn} onClick={() => setHintLevel(h => Math.min(h + 1, hints.length))} disabled={hintLevel >= hints.length}>
            💡 Hint {hintLevel > 0 ? `(${hintLevel})` : ''}
          </button>
          <button type="button" style={toolBtn} onClick={loadSolution}>📋 Solution</button>
          <button type="button" style={toolBtn} onClick={() => setShowCompare(c => !c)}>🔍 Compare</button>
        </div>
      </div>

      {hintLevel > 0 && hints[hintLevel - 1] && (
        <div style={{ padding: '10px 14px', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.35)', borderRadius: 10, fontSize: 13, color: '#fde68a' }}>
          💡 Hint {hintLevel}: {hints[hintLevel - 1]}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {/* Editor */}
        <div style={{ flex: '1 1 340px', minWidth: 0 }}>
          <div style={{ display: 'flex', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ background: '#161b22', padding: '12px 8px', fontFamily: 'monospace', fontSize: 12, lineHeight: 1.65, color: 'rgba(255,255,255,0.25)', userSelect: 'none', textAlign: 'right' }}>
              {lines.map((_, i) => (
                <div key={i} style={{ background: highlightLine === i ? 'rgba(99,102,241,0.3)' : 'transparent', padding: '0 4px' }}>{i + 1}</div>
              ))}
            </div>
            <textarea
              value={code}
              onChange={e => { setCode(e.target.value); setSuccess(false); }}
              spellCheck={false}
              style={{ flex: 1, minHeight: 280, background: '#0d1117', color: '#e6edf3', border: 'none', outline: 'none',
                fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace", fontSize: 13, lineHeight: 1.65,
                padding: '12px 14px', resize: 'vertical', tabSize: 4 }}
              onKeyDown={e => {
                if (e.key === 'Tab') {
                  e.preventDefault();
                  const s = e.target.selectionStart, end = e.target.selectionEnd;
                  setCode(code.substring(0, s) + '    ' + code.substring(end));
                }
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            <button type="button" onClick={run} disabled={running}
              style={{ padding: '9px 20px', background: success ? '#059669' : color, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
              {running ? '⏳ Running…' : '▶ Run'}
            </button>
            <button type="button" onClick={stepThrough} style={toolBtn}>Step Through</button>
            <button type="button" onClick={() => { setCode(starterCode); setOutput([]); setError(''); setSuccess(false); }} style={toolBtn}>Clear</button>
          </div>
        </div>

        {/* Output */}
        <div style={{ flex: '1 1 260px', minWidth: 0 }}>
          <div style={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '8px 12px', background: '#161b22', fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em' }}>
              CONSOLE OUTPUT
            </div>
            <div ref={outputRef} style={{ padding: '12px 14px', minHeight: 280, maxHeight: 360, overflowY: 'auto', fontFamily: 'monospace', fontSize: 12, lineHeight: 1.6 }}>
              {output.length === 0 && !error && (
                <span style={{ color: 'rgba(255,255,255,0.25)' }}>Run your code to see output here…</span>
              )}
              {output.map((line, i) => (
                <div key={i} style={{ color: '#7ee787', whiteSpace: 'pre-wrap' }}>{line}</div>
              ))}
              {error && (
                <div style={{ marginTop: 8, padding: '10px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: 8, color: '#fca5a5' }}>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>❌ Error</div>
                  {error}
                  <div style={{ marginTop: 6, fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>Tip: Check spelling, brackets, and indentation.</div>
                </div>
              )}
              {success && (
                <div style={{ marginTop: 8, padding: '10px 12px', background: 'rgba(16,185,129,0.12)', border: '1px solid #10b981', borderRadius: 8, color: '#6ee7b7', fontWeight: 700 }}>
                  ✓ Program successful! +{config.xp || 25} XP
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showCompare && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>YOUR CODE</div>
            <pre style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 8, fontSize: 11, overflow: 'auto', maxHeight: 200, color: '#e2e8f0' }}>{code}</pre>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#6ee7b7', marginBottom: 6 }}>SOLUTION</div>
            <pre style={{ background: 'rgba(16,185,129,0.08)', padding: 12, borderRadius: 8, fontSize: 11, overflow: 'auto', maxHeight: 200, color: '#a7f3d0', border: '1px solid rgba(16,185,129,0.25)' }}>{solutionCode}</pre>
          </div>
        </div>
      )}

      {showSolution && !showCompare && (
        <div style={{ padding: '10px 14px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.35)', borderRadius: 10, fontSize: 12, color: '#c7d2fe' }}>
          Solution loaded — run it to see how it works, then write your own version!
        </div>
      )}
    </div>
  );
}
