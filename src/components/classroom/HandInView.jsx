import React, { useEffect, useState } from 'react';
import { loadHandInFile } from '../../utils/classroomStore.js';
import { EmojiIcon, IconText } from '../ui/Icon.jsx';

const mono = { fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 12.5 };
const when = (iso) => (iso ? new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '');

function Stat({ label, value }) {
  return (
    <div style={{ padding: '6px 10px', borderRadius: 10, background: 'var(--bg-primary)', border: '1px solid var(--border-color)', fontSize: 12.5 }}>
      <div className="cr-muted" style={{ fontSize: 11, fontWeight: 700 }}>{label}</div>
      <b style={{ fontSize: 14 }}>{value}</b>
    </div>
  );
}

function Checklist({ items }) {
  if (!items?.length) return null;
  return (
    <div style={{ display: 'grid', gap: 4 }}>
      {items.map((g, i) => (
        <div key={i} style={{ fontSize: 13.5, display: 'flex', gap: 8 }}>
          <span aria-hidden="true"><IconText>{g.ok ? '✅' : '⬜'}</IconText></span>
          <span>{g.label}</span>
          <span className="cr-muted" style={{ fontSize: 11.5 }}>{g.ok ? 'met' : 'not yet'}</span>
        </div>
      ))}
    </div>
  );
}

function QuizAnswers({ quiz }) {
  if (!quiz?.length) return null;
  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {quiz.filter(Boolean).map((q, i) => (
        <div key={i} className="cr-sub" style={{ fontSize: 13.5, lineHeight: 1.45, borderLeft: `4px solid ${q.ok ? '#22c55e' : '#ef4444'}` }}>
          <div style={{ fontWeight: 800 }}>{i + 1}. {q.q}</div>
          <div><IconText>{q.ok ? '✅' : '❌'}</IconText> Answered: <b>{q.chosen || '—'}</b></div>
          {!q.ok && q.correct && <div className="cr-muted">Correct answer: {q.correct}</div>}
        </div>
      ))}
    </div>
  );
}

/** The real work recorded while the pupil used ByteBuddies (lesson quiz, mission code, Robot Studio program). */
function WorkRecord({ w }) {
  const heading = (t) => <div className="cr-label" style={{ marginTop: 4 }}>{t}</div>;
  return (
    <div className="cr-card" style={{ display: 'grid', gap: 10, padding: 14 }}>
      <div style={{ fontWeight: 900, fontSize: 15 }}>
        <IconText>{w.type === 'lesson' ? '📚' : w.type === 'mission' ? '🚀' : '🤖'}</IconText> {w.title || 'Their work'}
        {w.updatedAt && <span className="cr-muted" style={{ fontWeight: 600, fontSize: 12, marginLeft: 8 }}>last worked on {when(w.updatedAt)}</span>}
      </div>

      <div className="cr-row" style={{ gap: 8 }}>
        {w.total != null && <Stat label="Quiz score" value={`${w.score ?? 0}/${w.total}`} />}
        {w.stars != null && <Stat label="Stars" value={w.stars ? '⭐'.repeat(w.stars) : '—'} />}
        {w.attempts != null && <Stat label="Attempts" value={w.attempts} />}
        {w.type === 'mission' && <Stat label="Hints used" value={`${w.hintsUsed || 0}${w.sawAnswer ? ' + saw answer' : ''}`} />}
        {w.type === 'mission' && <Stat label="Result" value={w.passed ? 'Passed ✅' : 'Not yet'} />}
        {w.type === 'studio' && w.concept && <Stat label="Concept" value={w.concept} />}
        {w.type === 'studio' && <Stat label="Runs" value={w.runs || 0} />}
        {w.type === 'studio' && w.checkScore != null && <Stat label="Understanding check" value={`${w.checkScore}/${w.checkTotal}`} />}
        {w.type === 'studio' && w.won != null && <Stat label="Course" value={w.won ? 'Completed 🏁' : 'In progress'} />}
      </div>

      {w.goals?.length > 0 && <>{heading(w.type === 'studio' ? 'Coding goals' : 'Mission goals')}<Checklist items={w.goals} /></>}

      {w.code && (
        <>
          {heading(`Their code${w.mode ? ` (${w.mode === 'blocks' ? 'blocks → Python' : 'Python'})` : ''}`)}
          <pre className="cr-sub" style={{ ...mono, margin: 0, whiteSpace: 'pre-wrap', maxHeight: 280, overflow: 'auto' }}>{w.code}</pre>
        </>
      )}
      {w.output?.length > 0 && (
        <>
          {heading('What their code printed')}
          <pre className="cr-sub" style={{ ...mono, margin: 0, whiteSpace: 'pre-wrap', maxHeight: 160, overflow: 'auto' }}>{w.output.join('\n')}</pre>
        </>
      )}
      {w.error && <div className="cr-note cr-note--warn" style={mono}>Last error: {w.error}</div>}

      {w.blocks?.length > 0 && (
        <>
          {heading(`Their program (${w.blocks.length} block${w.blocks.length === 1 ? '' : 's'})`)}
          <div className="cr-sub" style={{ ...mono, display: 'grid', gap: 3, maxHeight: 280, overflow: 'auto' }}>
            {w.blocks.map((b, i) => (
              <div key={i} style={{ paddingLeft: (b.indent || 0) * 18 }}>
                <span className="cr-muted" style={{ display: 'inline-block', width: 26 }}>{i + 1}</span>{b.text}
              </div>
            ))}
          </div>
        </>
      )}

      {w.quiz?.length > 0 && <>{heading('Quiz answers')}<QuizAnswers quiz={w.quiz} /></>}
      {w.check?.length > 0 && <>{heading('Understanding check')}<QuizAnswers quiz={w.check} /></>}
      {w.explanation && (
        <>
          {heading('How they explained their code')}
          <div className="cr-sub" style={{ whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: 1.5 }}>“{w.explanation}”</div>
        </>
      )}
    </div>
  );
}

/** Shows what a pupil handed in — their recorded work, written answer, code, link, photo or a Game Builder project. */
export default function HandInView({ sub, classId, onOpenProject }) {
  const [file, setFile] = useState(null);
  useEffect(() => {
    let live = true;
    setFile(null);
    if (sub?.hasFile) loadHandInFile(classId, sub.id).then((f) => { if (live) setFile(f); });
    return () => { live = false; };
  }, [sub?.id, sub?.hasFile, classId]);

  if (!sub) return null;
  let legacy = null;
  if (typeof sub.code === 'string' && sub.code.startsWith('{')) {
    try { legacy = JSON.parse(sub.code); } catch { /* plain code */ }
  }
  const image = file?.image || legacy?.screenshot || sub.screenshot;
  const project = file?.sprites ? file : sub.sprites ? sub : null;
  const projectScripts = (project?.sprites || []).map((sprite) => ({
    ...sprite,
    codeLines: (sprite.blocks || []).map((block) => {
      const params = Object.entries(block.params || {}).filter(([, value]) => value !== '' && value != null);
      const description = block.label || block.type || 'Block';
      return `${'  '.repeat(Math.max(0, Number(block.indent) || 0))}${description}${params.length ? ` (${params.map(([key, value]) => `${key}: ${String(value)}`).join(', ')})` : ''}`;
    }),
  })).filter((sprite) => sprite.codeLines.length || sprite.blocklyXml);

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {sub.auto && <div className="cr-note cr-note--ok"><EmojiIcon e="✅" style={{ marginRight: '0.35em' }} />Finished in ByteBuddies — ticked off automatically.</div>}
      {sub.work && <WorkRecord w={sub.work} />}
      {sub.auto && !sub.work && (
        <div className="cr-muted" style={{ fontSize: 13 }}>Their answers will appear here the next time they open ByteBuddies.</div>
      )}
      {sub.answer && <div className="cr-sub" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.55, fontSize: 14 }}>{sub.answer}</div>}
      {legacy?.notes && <div className="cr-sub" style={{ whiteSpace: 'pre-wrap', fontSize: 14 }}>{legacy.notes}</div>}
      {sub.code && !legacy && (
        <pre className="cr-sub" style={{ margin: 0, ...mono, whiteSpace: 'pre-wrap', maxHeight: 260, overflow: 'auto' }}>{sub.code}</pre>
      )}
      {sub.link && (
        <a className="cr-btn cr-btn--sm" href={sub.link} target="_blank" rel="noopener noreferrer" style={{ justifySelf: 'start' }}><EmojiIcon e="🔗" style={{ marginRight: '0.35em' }} />Open their link</a>
      )}
      {sub.hasFile && !file && <div className="cr-muted" style={{ fontSize: 13 }}>Loading attachment…</div>}
      {image && <img src={image} alt="Pupil's work" style={{ maxWidth: '100%', maxHeight: 360, borderRadius: 12, border: '1px solid var(--border-color)', justifySelf: 'start' }} />}
      {project && (
        <>
          <div className="cr-note cr-note--ok"><EmojiIcon e="🎮" style={{ marginRight: '0.35em' }} />Game project attached · {project.sprites.length} sprite{project.sprites.length === 1 ? '' : 's'} · {project.levels?.length || 1} level{(project.levels?.length || 1) === 1 ? '' : 's'}</div>
          {projectScripts.length > 0 && (
            <details className="cr-sub" style={{ padding: 12 }}>
              <summary style={{ cursor: 'pointer', fontWeight: 800 }}><EmojiIcon e="🧩" style={{ marginRight: '0.35em' }} />View the code ({projectScripts.reduce((total, sprite) => total + sprite.codeLines.length, 0)} blocks)</summary>
              <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
                {projectScripts.map((sprite, index) => (
                  <section key={`${sprite.id || sprite.name}-${index}`}>
                    <div className="cr-label">{sprite.name || `Sprite ${index + 1}`}</div>
                    {sprite.codeLines.length > 0 ? (
                      <pre style={{ ...mono, margin: '6px 0 0', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{sprite.codeLines.join('\n')}</pre>
                    ) : (
                      <pre style={{ ...mono, margin: '6px 0 0', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{sprite.blocklyXml}</pre>
                    )}
                  </section>
                ))}
              </div>
            </details>
          )}
          <div className="cr-muted" style={{ fontSize: 12 }}>Open the project to play the game and inspect its scripts in the coding workspace.</div>
          <button className="cr-btn cr-btn--sm cr-btn--primary" style={{ justifySelf: 'start' }} onClick={() => onOpenProject?.(project)}><EmojiIcon e="🎮" style={{ marginRight: '0.35em' }} />Open game &amp; code</button>
        </>
      )}
      {!sub.auto && !sub.work && !sub.answer && !sub.code && !sub.link && !image && !project && !sub.hasFile && (
        <div className="cr-muted" style={{ fontSize: 13 }}>Handed in without an attachment.</div>
      )}
    </div>
  );
}
