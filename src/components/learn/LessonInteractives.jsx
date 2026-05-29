/**
 * Fun interactive tasks for Learn lessons (Read & Practice levels).
 */
import React, { useState, useCallback, useMemo } from 'react';

function TaskHeader({ task, done }) {
  return (
    <div className="corg-task-head">
      <div>
        <h4>{task.title}</h4>
        <p>{task.subtitle}</p>
      </div>
      {done && <span className="corg-task-done">✓ Done</span>}
    </div>
  );
}

function FlipCardsTask({ task, color, onComplete }) {
  const [flipped, setFlipped] = useState(new Set());
  const allFlipped = task.cards.every((c) => flipped.has(c.id));

  const toggle = (id) => {
    setFlipped((prev) => {
      const next = new Set([...prev, id]);
      if (task.cards.every((c) => next.has(c.id))) onComplete();
      return next;
    });
  };

  return (
    <div className="corg-task">
      <TaskHeader task={task} done={allFlipped} />
      <div className="corg-flip-grid">
        {task.cards.map((card) => {
          const isFlipped = flipped.has(card.id);
          return (
            <button
              key={card.id}
              type="button"
              className={`corg-flip-card ${isFlipped ? 'flipped' : ''}`}
              style={{ '--task-color': color }}
              onClick={() => toggle(card.id)}
            >
              <div className="corg-flip-inner">
                <div className="corg-flip-front">
                  <span>{card.emoji}</span>
                  <p dangerouslySetInnerHTML={{ __html: card.front.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                  <span className="corg-flip-hint">Tap to reveal</span>
                </div>
                <div className="corg-flip-back">
                  <p dangerouslySetInnerHTML={{ __html: card.back.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MatchTask({ task, color, onComplete }) {
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [matched, setMatched] = useState(new Set());
  const [wrong, setWrong] = useState(null);

  const pairMap = useMemo(() => {
    const m = new Map();
    task.pairs.forEach((p) => m.set(p.term, p.def));
    return m;
  }, [task.pairs]);

  const tryMatch = (def) => {
    if (!selectedTerm || matched.has(selectedTerm)) return;
    if (pairMap.get(selectedTerm) === def) {
      const next = new Set([...matched, selectedTerm]);
      setMatched(next);
      setSelectedTerm(null);
      setWrong(null);
      if (next.size === task.pairs.length) onComplete();
    } else {
      setWrong(`${selectedTerm}-${def}`);
      setTimeout(() => setWrong(null), 600);
    }
  };

  return (
    <div className="corg-task">
      <TaskHeader task={task} done={matched.size === task.pairs.length} />
      <div className="corg-match-board">
        <div className="corg-match-col">
          {task.terms.map((term) => {
            const isMatched = matched.has(term);
            const isSel = selectedTerm === term;
            return (
              <button
                key={term}
                type="button"
                disabled={isMatched}
                className={`corg-match-item ${isMatched ? 'matched' : ''} ${isSel ? 'selected' : ''} ${wrong?.startsWith(term) ? 'shake' : ''}`}
                style={{ '--task-color': color }}
                onClick={() => !isMatched && setSelectedTerm(term)}
              >
                {term}
              </button>
            );
          })}
        </div>
        <div className="corg-match-col">
          {task.defs.map((def) => {
            const matchedDef = [...matched].find((t) => pairMap.get(t) === def);
            return (
              <button
                key={def}
                type="button"
                disabled={!!matchedDef}
                className={`corg-match-item def ${matchedDef ? 'matched' : ''} ${wrong?.endsWith(def) ? 'shake' : ''}`}
                style={{ '--task-color': color }}
                onClick={() => tryMatch(def)}
              >
                {def}
              </button>
            );
          })}
        </div>
      </div>
      <p className="corg-match-hint">{selectedTerm ? `Now tap the meaning for "${selectedTerm}"` : 'Tap a term, then its meaning'}</p>
    </div>
  );
}

function OrderTask({ task, color, onComplete }) {
  const [order, setOrder] = useState(() => task.steps.map((s) => s.id));
  const [checked, setChecked] = useState(false);
  const [dragId, setDragId] = useState(null);

  const stepById = useMemo(() => Object.fromEntries(task.steps.map((s) => [s.id, s])), [task.steps]);

  const moveItem = (fromIdx, toIdx) => {
    if (fromIdx === toIdx) return;
    setOrder((prev) => {
      const next = [...prev];
      const [item] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, item);
      return next;
    });
    setChecked(false);
  };

  const check = () => {
    const correct = order.every((id, i) => stepById[id].order === i);
    setChecked(true);
    if (correct) onComplete();
  };

  return (
    <div className="corg-task">
      <TaskHeader task={task} done={checked && order.every((id, i) => stepById[id].order === i)} />
      <div className="corg-order-list">
        {order.map((id, idx) => (
          <div
            key={id}
            draggable
            onDragStart={() => setDragId(id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => { if (dragId) { moveItem(order.indexOf(dragId), idx); setDragId(null); } }}
            className={`corg-order-item ${checked ? (stepById[id].order === idx ? 'ok' : 'bad') : ''}`}
            style={{ '--task-color': color }}
          >
            <span className="corg-order-grip">⋮⋮</span>
            <span className="corg-order-num">{idx + 1}</span>
            <span>{stepById[id].text}</span>
            <div className="corg-order-arrows">
              <button type="button" disabled={idx === 0} onClick={() => moveItem(idx, idx - 1)}>↑</button>
              <button type="button" disabled={idx === order.length - 1} onClick={() => moveItem(idx, idx + 1)}>↓</button>
            </div>
          </div>
        ))}
      </div>
      {checked && !order.every((id, i) => stepById[id].order === i) && (
        <p className="corg-task-feedback wrong">Not quite — use the arrows to reorder, then check again!</p>
      )}
      {checked && order.every((id, i) => stepById[id].order === i) && (
        <p className="corg-task-feedback ok">Perfect order! 🎉</p>
      )}
      <button type="button" className="corg-btn-task-check" style={{ background: color }} onClick={check}>
        Check Order
      </button>
    </div>
  );
}

function PredictTask({ task, color, onComplete }) {
  const [picked, setPicked] = useState(null);
  return (
    <div className="corg-task">
      <TaskHeader task={task} done={picked === task.answer} />
      <pre className="corg-task-code">{task.code}</pre>
      <div className="corg-quiz-opts">
        {task.options.map((opt, i) => (
          <button
            key={i}
            type="button"
            disabled={picked != null}
            className={`corg-quiz-opt ${picked === i ? (i === task.answer ? 'correct' : 'wrong') : ''} ${picked != null && i === task.answer ? 'correct' : ''}`}
            onClick={() => { setPicked(i); if (i === task.answer) onComplete(); }}
          >
            {String.fromCharCode(65 + i)}. {opt}
          </button>
        ))}
      </div>
      {picked != null && (
        <p className={`corg-task-feedback ${picked === task.answer ? 'ok' : 'wrong'}`}>
          {picked === task.answer ? '✓ Correct!' : `✗ Answer: ${task.options[task.answer]}`}
        </p>
      )}
    </div>
  );
}

function FillBlankTask({ task, color, onComplete }) {
  const [filled, setFilled] = useState(null);
  return (
    <div className="corg-task">
      <TaskHeader task={task} done={filled === task.correct} />
      <p className="corg-fill-sentence">
        {task.sentence.split('___').map((part, i, arr) => (
          <React.Fragment key={i}>
            {part}
            {i < arr.length - 1 && (
              <span className={`corg-fill-gap ${filled ? (filled === task.correct ? 'ok' : 'bad') : ''}`}>
                {filled || '?'}
              </span>
            )}
          </React.Fragment>
        ))}
      </p>
      <div className="corg-word-bank">
        {task.wordBank.map((word) => (
          <button
            key={word}
            type="button"
            disabled={filled != null}
            className={`corg-word-chip ${filled === word ? (word === task.correct ? 'ok' : 'bad') : ''}`}
            style={{ '--task-color': color }}
            onClick={() => { setFilled(word); if (word === task.correct) onComplete(); }}
          >
            {word}
          </button>
        ))}
      </div>
    </div>
  );
}

function TrueFalseTask({ task, color, onComplete }) {
  const [answers, setAnswers] = useState({});
  const allDone = task.questions.every((_, i) => answers[i] != null);
  const allCorrect = allDone && task.questions.every((q, i) => answers[i] === q.a);

  const pick = (qi, val) => {
    setAnswers((prev) => {
      const next = { ...prev, [qi]: val };
      const done = task.questions.every((q, i) => next[i] != null);
      const correct = task.questions.every((q, i) => next[i] === q.a);
      if (done && correct) onComplete();
      return next;
    });
  };

  return (
    <div className="corg-task">
      <TaskHeader task={task} done={allCorrect} />
      {task.questions.map((q, qi) => {
        const ans = answers[qi];
        return (
          <div key={qi} className="corg-tf-row">
            <p>{q.q}</p>
            <div className="corg-tf-btns">
              {[true, false].map((val) => (
                <button
                  key={String(val)}
                  type="button"
                  disabled={ans != null}
                  className={`corg-tf-btn ${ans === val ? (val === q.a ? 'ok' : 'bad') : ''} ${ans != null && val === q.a ? 'ok' : ''}`}
                  style={{ '--task-color': color }}
                  onClick={() => pick(qi, val)}
                >
                  {val ? '✓ True' : '✗ False'}
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SpotTask({ task, onComplete }) {
  const [found, setFound] = useState(false);
  return (
    <div className="corg-task">
      <TaskHeader task={task} done={found} />
      <div className="corg-spot-grid">
        {task.grid.map((emoji, i) => (
          <button
            key={i}
            type="button"
            className={`corg-spot-cell ${found && i === task.oddIndex ? 'win' : ''} ${found && i !== task.oddIndex ? 'dim' : ''}`}
            onClick={() => {
              if (i === task.oddIndex) { setFound(true); onComplete(); }
            }}
          >
            {emoji}
          </button>
        ))}
      </div>
      {found && <p className="corg-task-feedback ok">You found it! 🎯</p>}
    </div>
  );
}

function TaskRenderer({ task, color, onComplete }) {
  switch (task.type) {
    case 'flip_cards': return <FlipCardsTask task={task} color={color} onComplete={onComplete} />;
    case 'match': return <MatchTask task={task} color={color} onComplete={onComplete} />;
    case 'order': return <OrderTask task={task} color={color} onComplete={onComplete} />;
    case 'predict': return <PredictTask task={task} color={color} onComplete={onComplete} />;
    case 'fill_blank': return <FillBlankTask task={task} color={color} onComplete={onComplete} />;
    case 'true_false': return <TrueFalseTask task={task} color={color} onComplete={onComplete} />;
    case 'spot': return <SpotTask task={task} color={color} onComplete={onComplete} />;
    default: return null;
  }
}

/** Panel with progress through multiple tasks */
export function LessonInteractivePanel({ tasks, color, onAllComplete, compact }) {
  const [completed, setCompleted] = useState(new Set());
  const [activeIdx, setActiveIdx] = useState(0);

  const markDone = useCallback((taskId) => {
    setCompleted((prev) => {
      const next = new Set([...prev, taskId]);
      if (next.size === tasks.length) onAllComplete?.();
      else setActiveIdx((i) => Math.min(i + 1, tasks.length - 1));
      return next;
    });
  }, [tasks.length, onAllComplete]);

  if (!tasks?.length) return null;

  const pct = Math.round((completed.size / tasks.length) * 100);

  return (
    <div className={`corg-interactive-panel ${compact ? 'compact' : ''}`}>
      <div className="corg-interactive-progress">
        <span>🎮 Interactive Challenge</span>
        <span>{completed.size}/{tasks.length}</span>
        <div className="corg-interactive-bar"><div style={{ width: `${pct}%`, background: color }} /></div>
      </div>
      <div className="corg-interactive-tabs">
        {tasks.map((t, i) => (
          <button
            key={t.id}
            type="button"
            className={`corg-interactive-tab ${activeIdx === i ? 'active' : ''} ${completed.has(t.id) ? 'done' : ''}`}
            onClick={() => setActiveIdx(i)}
          >
            {completed.has(t.id) ? '✓' : i + 1}. {t.title}
          </button>
        ))}
      </div>
      <TaskRenderer
        task={tasks[activeIdx]}
        color={color}
        onComplete={() => markDone(tasks[activeIdx].id)}
      />
    </div>
  );
}

export default LessonInteractivePanel;
