import React, { useState } from 'react';
import CodeEditor from '../CodeEditor';
import { runPython } from '../learn/CodingLab/TextCodingLab.jsx';
import { useUser } from '../../contexts/UserContext';
import { buildCheckProgram, checkResult, childOutput } from '../../data/pythonChallenges';
import { EmojiIcon, IconText } from '../ui/Icon.jsx';

const KEY = 'bb_py_challenge_progress';
const CODE_KEY = 'bb_py_challenge_code';

/** { [challengeId]: { stars, hints } } */
export function readPyProgress() {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch { return {}; }
}
function saveStars(id, stars, hints) {
  const all = readPyProgress();
  const prev = all[id]?.stars || 0;
  all[id] = { stars: Math.max(prev, stars), hints: Math.min(all[id]?.hints ?? hints, hints) };
  try { localStorage.setItem(KEY, JSON.stringify(all)); } catch { /* ignore */ }
  return prev;
}
function readCode(id) { try { return (JSON.parse(localStorage.getItem(CODE_KEY) || '{}') || {})[id]; } catch { return undefined; } }
function saveCode(id, code) {
  try { const all = JSON.parse(localStorage.getItem(CODE_KEY) || '{}') || {}; all[id] = code; localStorage.setItem(CODE_KEY, JSON.stringify(all)); } catch { /* ignore */ }
}

const LEVELS = { 1: 'Starter', 2: 'Explorer', 3: 'Expert' };

/** One Python challenge: write code, run it, the page checks it and awards stars. */
export default function PythonChallenge({ challenge: c, onBack, onSolved, onNext }) {
  const { addXP } = useUser() || {};
  const [code, setCode] = useState(() => readCode(c.id) ?? c.starter);
  const [output, setOutput] = useState('');
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [hints, setHints] = useState(0);

  // Reset when moving to the next challenge
  const [shownId, setShownId] = useState(c.id);
  if (shownId !== c.id) {
    setShownId(c.id); setCode(readCode(c.id) ?? c.starter); setOutput(''); setResult(null); setHints(0);
  }

  const onChange = (v) => { setCode(v); saveCode(c.id, v); };

  const run = async () => {
    if (running) return;
    setRunning(true); setResult(null); setOutput('');
    let text = '';
    try {
      const r = await runPython(buildCheckProgram(c, code), (t) => { text += t; }, { execLimit: 8000 });
      const shown = childOutput(r.text || text);
      setOutput(shown.trim() ? shown : '(nothing printed)');
      if (!r.ok && !String(r.text || text).includes('__BB_TESTS__')) {
        setResult({ pass: false, error: true, message: r.error });
        return;
      }
      const res = checkResult(c, r.text || text);
      if (res.pass) {
        const stars = 1 + (c.uses.test(code) ? 1 : 0) + (hints === 0 ? 1 : 0);
        const prev = saveStars(c.id, stars, hints);
        if (!prev) addXP?.(25 * c.level);
        onSolved?.(c.id);
        setResult({ pass: true, stars, firstTime: !prev });
      } else {
        setResult(res);
      }
    } catch (e) {
      setResult({ pass: false, error: true, message: e.message || String(e) });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="page ch-py">
      <button type="button" className="btn btn-ghost ch-back" onClick={onBack}>← All challenges</button>
      <div className="ch-py-grid">
        <section className="ch-py-brief">
          <div className="ch-py-title">
            <span><IconText>{c.emoji}</IconText></span>
            <div>
              <h2>{c.title}</h2>
              <small><EmojiIcon e="🐍" style={{ marginRight: '0.35em' }} />Python · {c.concept} · {LEVELS[c.level]}</small>
            </div>
          </div>
          <p className="ch-py-task">{c.task}</p>

          <div className="ch-py-hints">
            <div className="ch-py-hints-head">
              <b><EmojiIcon e="💡" style={{ marginRight: '0.35em' }} />Hints</b>
              <small>{hints === 0 ? 'Solve it with no hints for the 3rd star' : `${hints} of ${c.hints.length} used`}</small>
            </div>
            {c.hints.slice(0, hints).map((h, i) => (
              <div key={i} className={`ch-hint h${i}`}><span>{['Think', 'Clue', 'Fill the gaps'][i]}</span><pre>{h}</pre></div>
            ))}
            {hints < c.hints.length && (
              <button type="button" className="ch-hint-btn" onClick={() => setHints(hints + 1)}>
                {hints === 0 ? 'Give me a hint' : 'Another hint'}
              </button>
            )}
          </div>

          <div className="ch-py-stars">
            <b>Stars</b>
            <p>★ Pass the checks</p>
            <p>★ {c.usesLabel}</p>
            <p>★ No hints needed</p>
          </div>
        </section>

        <section className="ch-py-work">
          <div className="ch-py-editor">
            <div className="ch-py-bar">
              <span>main.py</span>
              <button type="button" className="ch-reset" onClick={() => onChange(c.starter)}>Start again</button>
              <button type="button" className="btn btn-success btn-sm" onClick={run} disabled={running}><IconText>{running ? 'Checking…' : '▶ Run & check'}</IconText></button>
            </div>
            <div className="ch-py-code"><CodeEditor code={code} language="python" onChange={onChange} /></div>
          </div>

          <div className="ch-py-out">
            <div className="ch-py-bar"><span>Output</span></div>
            <pre aria-live="polite">{output || 'Press ▶ Run & check to test your code.'}</pre>
          </div>

          {result && (
            result.pass ? (
              <div className="ch-result pass">
                <div className="ch-result-stars">{[0, 1, 2].map((i) => <span key={i} className={i < result.stars ? 'on' : ''}>★</span>)}</div>
                <b>Challenge complete!{result.firstTime ? ` +${25 * c.level} XP` : ''}</b>
                {result.stars < 3 && <small>{!c.uses.test(code) ? `For another star: ${c.usesLabel.toLowerCase()}.` : 'Try it again without hints for 3 stars!'}</small>}
                {onNext && <button type="button" className="btn btn-primary btn-sm" onClick={onNext}>Next challenge ▶</button>}
              </div>
            ) : (
              <div className="ch-result fail">
                <b><IconText>{result.error ? '🐞 Your code has an error' : 'Not quite yet'}</IconText></b>
                <p>{result.message}</p>
                <small>Read it carefully, change one thing, and run it again.</small>
              </div>
            )
          )}
        </section>
      </div>
    </div>
  );
}
