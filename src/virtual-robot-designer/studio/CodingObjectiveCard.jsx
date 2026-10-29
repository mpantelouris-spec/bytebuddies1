/**
 * "Coding objective" section at the top of the code panel: what this arena teaches,
 * an "I can…" statement, and a checklist that ticks as the pupil codes and runs.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { checkCodingObjective } from './codingObjective.js';
import { EmojiIcon } from '../../components/ui/Icon.jsx';

const OPEN_KEY = 'bb-coding-objective-open';

export default function CodingObjectiveCard({ objective, blocks, python = null, usePython = false, isRunning = false }) {
  const [open, setOpen] = useState(() => { try { return localStorage.getItem(OPEN_KEY) !== '0'; } catch { return true; } });
  const [runs, setRuns] = useState({ runs: 0, editedRuns: 0 });
  const lastRunSig = useRef(null);
  const wasRunning = useRef(false);
  const sig = useMemo(() => JSON.stringify((blocks || []).map((b) => [b.id, b.paramValues])) + (python || ''), [blocks, python]);

  // Runs count per arena
  useEffect(() => { setRuns({ runs: 0, editedRuns: 0 }); lastRunSig.current = null; }, [objective?.key]);
  useEffect(() => {
    if (isRunning && !wasRunning.current) {
      setRuns((r) => ({ runs: r.runs + 1, editedRuns: r.editedRuns + (lastRunSig.current !== null && lastRunSig.current !== sig ? 1 : 0) }));
      lastRunSig.current = sig;
    }
    wasRunning.current = isRunning;
  }, [isRunning, sig]);

  const ticks = useMemo(() => checkCodingObjective(objective, { blocks, python: usePython ? python : null, runs }), [objective, blocks, python, usePython, runs]);
  if (!objective) return null;
  const done = ticks.filter((t) => t.done).length;
  const all = done === ticks.length && ticks.length > 0;
  const toggle = () => setOpen((v) => { try { localStorage.setItem(OPEN_KEY, v ? '0' : '1'); } catch { /* ignore */ } return !v; });

  return (
    <section className={`coding-obj${open ? ' is-open' : ''}${all ? ' is-done' : ''}`} aria-label="Coding objective">
      <button type="button" className="coding-obj-head" onClick={toggle} aria-expanded={open}>
        <span className="coding-obj-icon"><EmojiIcon e={all ? '🏆' : '🎯'} /></span>
        <span className="coding-obj-title">Coding objective <b>· {objective.concept}</b></span>
        {objective.level && <span className={`coding-obj-level is-r${objective.rank}`} title={`${objective.level} arena — ${ticks.length} goals`}>{objective.level}</span>}
        <span className="coding-obj-count">{all ? 'Done!' : `${done}/${ticks.length}`}</span>
        <span className="coding-obj-caret" aria-hidden="true">{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div className="coding-obj-body">
          <p className="coding-obj-ican">{objective.ican}</p>
          <p className="coding-obj-how"><b>In this arena:</b> {objective.how}</p>
          {objective.detail && <p className="coding-obj-detail"><EmojiIcon e="📋" /> {objective.where}: {objective.detail}</p>}
          <ul className="coding-obj-checks">
            {ticks.map((t) => (
              <li key={t.id} className={t.done ? 'done' : ''}>
                <span className="coding-obj-tick" aria-hidden="true">{t.done ? '✓' : ''}</span>
                <span>{t.label}</span>
                <span className="coding-obj-sr">{t.done ? ' (done)' : ' (not yet)'}</span>
              </li>
            ))}
          </ul>
          {usePython && objective.python && (
            <div className="coding-obj-py"><span>In Python:</span><pre>{objective.python}</pre></div>
          )}
          {objective.think && <p className="coding-obj-think"><EmojiIcon e="💭" /> <i>Think: {objective.think}</i></p>}
        </div>
      )}
    </section>
  );
}
