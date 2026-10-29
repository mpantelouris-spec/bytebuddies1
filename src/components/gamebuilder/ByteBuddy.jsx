import React, { useEffect, useMemo, useState } from 'react';
import { findTips, readScript, parseScripts, answerQuestion, QUICK_QUESTIONS } from './byteTutor';
import './byteBuddy.css';
import { EmojiIcon, IconText } from '../ui/Icon.jsx';

const HINTS_KEY = 'bb_byte_hints_used';
function logHint(where) {
  try {
    const all = JSON.parse(localStorage.getItem(HINTS_KEY) || '{}') || {};
    all[where] = (all[where] || 0) + 1;
    localStorage.setItem(HINTS_KEY, JSON.stringify(all));
  } catch { /* ignore */ }
}

/** Byte's face: the ByteBuddies robot, in CSS so it can blink and bob. */
export function ByteFace({ size = 34, mood = 'happy' }) {
  return (
    <span className={`byte-face byte-${mood}`} style={{ width: size, height: size }} aria-hidden>
      <span className="byte-antenna" />
      <span className="byte-visor"><i /><i /></span>
    </span>
  );
}

function TipCard({ tip, where }) {
  const [shown, setShown] = useState(1);
  const more = shown < tip.steps.length;
  return (
    <div className={`byte-tip byte-tip-${tip.kind}`}>
      <div className="byte-tip-title"><IconText>{tip.kind === 'idea' ? '💡 ' : '🔎 '}</IconText>{tip.title}</div>
      {tip.steps.slice(0, shown).map((s, i) => (
        <div key={i} className={`byte-step byte-step-${i}`}>
          <span className="byte-step-label">{['Think', 'Hint', 'Try'][i]}</span>{s}
        </div>
      ))}
      {more && (
        <button type="button" className="byte-more" onClick={() => { setShown(shown + 1); logHint(where); }}>
          {shown === 1 ? 'Give me a hint' : 'Show me where to look'}
        </button>
      )}
    </div>
  );
}

/**
 * Byte, the coding buddy panel. Re-reads the selected sprite's code every second while open,
 * so tips update as the child fixes things.
 */
export default function ByteBuddy({ open, onClose, getSprites, selectedId, challenge, status }) {
  const [tick, setTick] = useState(0);
  const [view, setView] = useState('check');
  const [chat, setChat] = useState([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    if (!open) return undefined;
    const id = setInterval(() => setTick((t) => t + 1), 1200);
    return () => clearInterval(id);
  }, [open]);

  const sprites = useMemo(() => (open ? getSprites() || [] : []), [open, tick, selectedId]); // eslint-disable-line react-hooks/exhaustive-deps
  const sprite = sprites.find((s) => s.id === selectedId) || null;
  const tips = useMemo(() => (sprite ? findTips({ sprite, sprites }) : []), [sprite?.blocklyXml, sprites.length]); // eslint-disable-line react-hooks/exhaustive-deps
  const scripts = useMemo(() => parseScripts(sprite?.blocklyXml), [sprite?.blocklyXml]);
  const where = challenge ? `challenge:${challenge.id}` : 'free-build';
  const bugs = tips.filter((t) => t.kind === 'bug');

  if (!open) return null;

  const ask = (text) => {
    const t = String(text || '').trim();
    if (!t) return;
    setChat((c) => [...c.slice(-6), { me: true, text: t }, { me: false, text: answerQuestion(t) }]);
    setQ('');
  };

  return (
    <aside className="byte-panel" role="dialog" aria-label="Byte, your coding buddy">
      <header className="byte-head">
        <ByteFace mood={bugs.length ? 'thinking' : 'happy'} />
        <div>
          <b>Byte</b>
          <small>Your coding buddy — I give clues, you write the code!</small>
        </div>
        <button type="button" className="byte-x" onClick={onClose} aria-label="Close Byte">✕</button>
      </header>

      <nav className="byte-tabs">
        {[['check', `Check my code${bugs.length ? ` (${bugs.length})` : ''}`], ['read', 'Explain my code'], ['ask', 'Ask Byte']].map(([id, label]) => (
          <button key={id} type="button" className={view === id ? 'on' : ''} onClick={() => setView(id)}>{label}</button>
        ))}
      </nav>

      <div className="byte-body">
        {!sprite && <p className="byte-empty">Click a sprite and I'll look at its code with you.</p>}

        {sprite && view === 'check' && (
          <>
            {challenge && (
              <div className="byte-goal">
                <span><EmojiIcon e="🎯" style={{ marginRight: '0.35em' }} />Your goal</span>
                {challenge.goal}
                {status?.note && !status.pass && <em>The game says: {status.note}</em>}
              </div>
            )}
            {tips.length === 0 ? (
              <div className="byte-ok">
                <ByteFace size={46} mood="happy" />
                <p>I can't spot any common mistakes in <b>{sprite.name}</b>'s code.<br />Press ▶ Play to test it. If it still doesn't do what you want, ask me below!</p>
              </div>
            ) : (
              tips.map((t) => <TipCard key={`${sprite.id}-${t.id}`} tip={t} where={where} />)
            )}
          </>
        )}

        {sprite && view === 'read' && (
          <div className="byte-read">
            {scripts.length === 0 && <p className="byte-empty">{sprite.name} has no code yet.</p>}
            {scripts.map((s, i) => (
              <div key={i} className="byte-script">
                {readScript(s).map((l, j) => (
                  <div key={j} className={l.hat ? 'byte-line byte-hat' : 'byte-line'} style={{ paddingLeft: 10 + l.depth * 16 }}>
                    {l.hat ? l.text : `→ ${l.text}`}
                  </div>
                ))}
              </div>
            ))}
            {scripts.length > 0 && <p className="byte-note">Read it out loud. Does it match what you wanted {sprite.name} to do?</p>}
          </div>
        )}

        {view === 'ask' && (
          <div className="byte-ask">
            <div className="byte-chat">
              {chat.length === 0 && <div className="byte-bubble">Ask me how to do something — like "how do I make it jump?" I'll explain the idea so you can build it.</div>}
              {chat.map((m, i) => <div key={i} className={m.me ? 'byte-bubble me' : 'byte-bubble'}>{m.text}</div>)}
            </div>
            <div className="byte-chips">
              {QUICK_QUESTIONS.map((x) => <button key={x} type="button" onClick={() => ask(x)}>{x}</button>)}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); ask(q); }} className="byte-form">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="How do I…" maxLength={140} />
              <button type="submit">Ask</button>
            </form>
          </div>
        )}
      </div>
    </aside>
  );
}
