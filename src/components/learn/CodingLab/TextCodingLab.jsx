import React, { useState, useEffect, useRef } from 'react';
import LabBuddy from './LabBuddy.jsx';
import { EmojiIcon, IconText } from '../../ui/Icon.jsx';

// Skulpt is served from our own site first (school filters often block skulpt.org).
const SOURCES = [
  ['/vendor/skulpt/skulpt.min.js', '/vendor/skulpt/skulpt-stdlib.js'],
  ['https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt.min.js', 'https://cdn.jsdelivr.net/npm/skulpt@1.2.0/dist/skulpt-stdlib.js'],
];

function addScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = () => { s.remove(); reject(new Error(src)); };
    document.head.appendChild(s);
  });
}

let skulptReady = null;
export function loadSkulpt() {
  if (window.Sk?.builtinFiles) return Promise.resolve();
  if (!skulptReady) {
    skulptReady = (async () => {
      for (const [core, lib] of SOURCES) {
        try { if (!window.Sk) await addScript(core); await addScript(lib); return; } catch { /* try the next source */ }
      }
      skulptReady = null;
      throw new Error('The Python engine could not load. Check your internet connection and try again.');
    })();
  }
  return skulptReady;
}

/** Turn Python errors into something a 10-year-old can act on. */
export function friendlyError(raw) {
  const msg = String(raw);
  const line = (msg.match(/on line (\d+)/) || [])[1];
  const where = line ? ` (line ${line})` : '';
  const name = (msg.match(/name '([^']+)' is not defined/) || [])[1];
  if (name) return `Python doesn’t know the word “${name}”${where}. Check the spelling, or make that variable before you use it.`;
  if (/EOL|unterminated string|EOF while scanning/i.test(msg)) return `A piece of text is missing its closing quote mark "${where}.`;
  if (/IndentationError|expected an indented block|unindent/i.test(msg)) return `The spaces at the start of a line are wrong${where}. Lines inside if, for and def need 4 spaces.`;
  if (/can only concatenate str|unsupported operand type\(s\) for \+: 'int' and 'str'|cannot concatenate/i.test(msg)) return `You tried to join text and a number with +${where}. Wrap the number in str( ) first.`;
  if (/SyntaxError/i.test(msg)) return `Python couldn’t read this line${where}. Look for a missing colon :, bracket ( ) or quote mark.`;
  if (/TimeLimitError|execution limit/i.test(msg)) return 'Your program ran for too long — is there a loop that never stops?';
  return msg.replace(/^.*?(?:Error|Exception):\s*/, '') + where;
}

export async function runPython(code, onLine, opts = {}) {
  await loadSkulpt();
  const out = [];
  if (opts.turtleTarget) {
    window.Sk.TurtleGraphics = window.Sk.TurtleGraphics || {};
    window.Sk.TurtleGraphics.target = opts.turtleTarget;
    window.Sk.TurtleGraphics.width = opts.turtleWidth || 420;
    window.Sk.TurtleGraphics.height = opts.turtleHeight || 320;
  }
  window.Sk.configure({
    output: (t) => { out.push(t); onLine?.(t); },
    read: (x) => {
      if (window.Sk.builtinFiles?.files[x]) return window.Sk.builtinFiles.files[x];
      throw new Error(`File not found: '${x}'`);
    },
    inputfun: (p) => window.prompt(p || 'Type a value:') ?? '',
    inputfunTakesPrompt: true,
    execLimit: opts.execLimit || 8000,
    __future__: window.Sk.python3,
  });
  try {
    await window.Sk.misceval.asyncToPromise(() => window.Sk.importMainWithBody('<stdin>', false, code, true));
    return { ok: true, text: out.join('') };
  } catch (e) {
    return { ok: false, text: out.join(''), error: friendlyError(e) };
  }
}

/** Does the program meet the lesson's goal? Returns null when it does, or a tip. */
export function checkGoal(rule = {}, code, starter, text) {
  if (rule.mustChange && code.trim() === starter.trim()) return 'Now change ONE thing in the code and run it again.';
  for (const m of rule.mustContain || []) if (!code.includes(m)) return `Your code needs ${m.trim()} — look at the goal again.`;
  for (const m of rule.outputIncludes || []) if (!text.includes(m)) return `The output should include “${m.trim()}”.`;
  for (const m of rule.outputExcludes || []) if (text.includes(m)) return `The output shouldn’t include “${m.trim()}”.`;
  if (rule.minLines && text.trim().split('\n').length < rule.minLines) return `Print at least ${rule.minLines} lines.`;
  if (!text.trim()) return 'Your program ran but didn’t print anything. Add a print( ).';
  return null;
}

export default function TextCodingLab({ config, color = '#14b8a6', storageKey = 'bb_lab', onComplete }) {
  const { pythonHints, hints: blockHints = [], starterCode = '', solutionCode = '', validate = {}, pythonPredict, pythonGoal, challenge } = config;
  const hints = pythonHints || blockHints;
  const saveKey = `${storageKey}_py_v2`;

  const [code, setCode] = useState(() => {
    try { return localStorage.getItem(saveKey) || starterCode; } catch { return starterCode; }
  });
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [tip, setTip] = useState('');
  const [running, setRunning] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);
  const [success, setSuccess] = useState(false);
  const [sawSolution, setSawSolution] = useState(false);
  const [prediction, setPrediction] = useState('');
  const [engine, setEngine] = useState('loading');
  const doneOnce = useRef(false);
  const lines = code.split('\n');

  useEffect(() => { try { localStorage.setItem(saveKey, code); } catch { /* ignore */ } }, [code, saveKey]);
  useEffect(() => { loadSkulpt().then(() => setEngine('ready'), () => setEngine('error')); }, []);

  const run = async () => {
    if (running) return;
    setRunning(true); setOutput(''); setError(''); setTip(''); setSuccess(false);
    let text = '';
    try {
      const r = await runPython(code, (t) => { text += t; setOutput(text); });
      setEngine('ready');
      if (!r.ok) { setError(r.error); return; }
      const miss = checkGoal(validate, code, starterCode, r.text);
      if (miss) { setTip(miss); return; }
      setSuccess(true);
      if (!doneOnce.current) { doneOnce.current = true; onComplete?.(); }
    } catch (e) {
      setEngine('error');
      setError(e.message);
    } finally {
      setRunning(false);
    }
  };

  const onKey = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const el = e.target; const s = el.selectionStart; const end = el.selectionEnd;
      const next = `${code.slice(0, s)}    ${code.slice(end)}`;
      setCode(next);
      requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = s + 4; });
    } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault(); run();
    }
  };

  const ctl = { minHeight: 42, padding: '0 14px', borderRadius: 12, border: '2px solid #dee2e6', background: '#fff', color: '#1e293b', fontWeight: 800, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' };

  return (
    <div style={{ background: '#fff', color: '#1e293b', borderRadius: 18, padding: 14, border: '1px solid #e2e8f0', boxShadow: '0 10px 30px rgba(15,23,42,0.18)' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
        <LabBuddy size={48} />
        <div style={{ flex: '1 1 260px', minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.1em', color: '#1971c2', textTransform: 'uppercase' }}>Python challenge</div>
          <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.4 }}>{pythonGoal || challenge}</div>
        </div>
        <button type="button" onClick={run} disabled={running || engine === 'loading'}
          style={{ ...ctl, background: '#2f9e44', borderColor: '#2f9e44', color: '#fff', fontSize: 16, padding: '0 22px', opacity: running || engine === 'loading' ? 0.6 : 1 }}>
          <IconText>{engine === 'loading' ? 'Loading Python…' : running ? 'Running…' : '▶ Run'}</IconText>
        </button>
      </div>

      {pythonPredict && (
        <label style={{ display: 'block', background: '#fff9db', border: '2px solid #fcc419', borderRadius: 12, padding: '10px 12px', marginBottom: 12 }}>
          <span style={{ fontWeight: 800, color: '#7a5b00' }}>🤔 Before you run it — what do you predict it will print?</span>
          <input value={prediction} onChange={(e) => setPrediction(e.target.value)} placeholder="Type your prediction here…"
            style={{ display: 'block', width: '100%', boxSizing: 'border-box', marginTop: 6, minHeight: 40, borderRadius: 10, border: '2px solid #ffe066', padding: '0 10px', fontSize: 15, fontFamily: 'inherit' }} />
        </label>
      )}

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 360px', minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.08em', color: '#475569', marginBottom: 6 }}>YOUR CODE</div>
          <div style={{ display: 'flex', borderRadius: 12, overflow: 'hidden', border: '2px solid #1e293b', background: '#0f172a' }}>
            <div aria-hidden style={{ padding: '12px 8px', fontFamily: 'ui-monospace, Menlo, Consolas, monospace', fontSize: 15, lineHeight: 1.6, color: '#64748b', textAlign: 'right', userSelect: 'none', background: '#1e293b' }}>
              {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
            </div>
            <textarea
              aria-label="Python code"
              value={code}
              onChange={(e) => { setCode(e.target.value); setSuccess(false); }}
              onKeyDown={onKey}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              style={{ flex: 1, minHeight: 260, background: 'transparent', color: '#e2e8f0', border: 'none', outline: 'none',
                fontFamily: 'ui-monospace, Menlo, Consolas, monospace', fontSize: 15, lineHeight: 1.6, padding: 12, resize: 'vertical', tabSize: 4, whiteSpace: 'pre' }}
            />
          </div>
        </div>
        <div style={{ flex: '1 1 260px', minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.08em', color: '#475569', marginBottom: 6 }}>OUTPUT</div>
          <div aria-live="polite" style={{ minHeight: 260, borderRadius: 12, background: '#f8f9fa', border: '2px solid #e9ecef', padding: 12, fontFamily: 'ui-monospace, Menlo, Consolas, monospace', fontSize: 15, lineHeight: 1.6, whiteSpace: 'pre-wrap', boxSizing: 'border-box' }}>
            {!output && !error && <span style={{ color: '#94a3b8', fontFamily: 'inherit' }}>Press ▶ Run to see what your program prints.</span>}
            {output}
            {engine === 'error' && !error && <div style={{ color: '#c92a2a' }}>The Python engine couldn’t load. Check your connection and press Run again.</div>}
          </div>
        </div>
      </div>

      {error && (
        <div role="alert" style={{ marginTop: 12, background: '#fff5f5', border: '2px solid #ff8787', borderRadius: 12, padding: '10px 14px', color: '#a61e1e' }}>
          <b><EmojiIcon e="🐞" style={{ marginRight: '0.35em' }} />Bug found:</b> {error}
        </div>
      )}
      {tip && !error && (
        <div role="status" style={{ marginTop: 12, background: '#fff4e6', border: '2px solid #ff922b', borderRadius: 12, padding: '10px 14px', color: '#a63e00' }}>
          <b>Nearly!</b> It runs — {tip}
        </div>
      )}
      {success && (
        <div role="status" style={{ marginTop: 12, background: '#ebfbee', border: '2px solid #40c057', borderRadius: 12, padding: '10px 14px', color: '#2b8a3e', fontWeight: 800 }}>
          <EmojiIcon e="🎉" style={{ marginRight: '0.35em' }} />Challenge complete! {sawSolution ? 'Now try changing it to make it your own.' : 'Great coding.'}
          {pythonPredict && prediction && <div style={{ fontWeight: 600, marginTop: 4 }}>You predicted: “{prediction}”. Was it right? Why or why not?</div>}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTop: '1px solid #e9ecef' }}>
        <button type="button" disabled={hintLevel >= hints.length} onClick={() => setHintLevel((h) => Math.min(hints.length, h + 1))}
          style={{ ...ctl, background: '#fff9db', borderColor: '#fcc419', color: '#7a5b00', opacity: hintLevel >= hints.length ? 0.5 : 1 }}>
          <EmojiIcon e="💡" style={{ marginRight: '0.35em' }} />Hint {hintLevel > 0 ? `${hintLevel}/${hints.length}` : ''}
        </button>
        <button type="button" onClick={() => { setCode(starterCode); setOutput(''); setError(''); setTip(''); setSuccess(false); }} style={ctl}><EmojiIcon e="🗑" style={{ marginRight: '0.35em' }} />Start again</button>
        <button type="button" onClick={() => { setCode(solutionCode); setSawSolution(true); setSuccess(false); setTip(''); setError(''); }} style={{ ...ctl, color: '#5f3dc4' }}><EmojiIcon e="👀" style={{ marginRight: '0.35em' }} />Show a solution</button>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: '#64748b' }}>Tip: Tab adds 4 spaces · Ctrl/⌘ + Enter runs</span>
      </div>
      {hintLevel > 0 && (
        <ol style={{ margin: '10px 0 0', color: '#5c4400', background: '#fff9db', borderRadius: 10, padding: '10px 10px 10px 30px' }}>
          {hints.slice(0, hintLevel).map((h, i) => <li key={i} style={{ margin: '2px 0' }}>{h}</li>)}
        </ol>
      )}
      <div style={{ height: 0, overflow: 'hidden' }} aria-hidden>{color}</div>
    </div>
  );
}
