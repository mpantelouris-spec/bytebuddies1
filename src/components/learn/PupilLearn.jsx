/**
 * PupilLearn — the "Learn" step a pupil reads before playing: the big idea,
 * a worked example, a mistake to avoid and a question to check themselves.
 */
import React, { useState } from 'react';
import TeachingVisual from './TeachingVisual.jsx';
import LabBuddy from './CodingLab/LabBuddy.jsx';
import { EmojiIcon } from '../ui/Icon.jsx';

const card = { background: '#fff', color: '#0f172a', borderRadius: 18, padding: '18px 20px', boxShadow: '0 8px 24px rgba(0,0,0,0.25)' };
const label = (color) => ({ fontSize: 12, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color, marginBottom: 8 });

function CheckYourself({ q, a, color }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ border: `2px solid ${color}55`, borderRadius: 14, padding: '14px 16px' }}>
      <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.45 }}>{q}</div>
      {open ? (
        <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 10, background: '#ebfbee', border: '2px solid #b2f2bb', fontSize: 17, whiteSpace: 'pre-wrap' }}>
          <b style={{ color: '#2b8a3e' }}>Answer: </b>{a}
        </div>
      ) : (
        <p style={{ margin: '8px 0 0', fontSize: 15, color: '#64748b' }}>Think of your answer first, then check.</p>
      )}
      <button type="button" onClick={() => setOpen((o) => !o)} style={{
        marginTop: 10, minHeight: 42, padding: '0 16px', borderRadius: 10, border: `2px solid ${color}`,
        background: open ? '#fff' : color, color: open ? color : '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer',
      }}>{open ? 'Hide answer' : 'Check my answer'}</button>
    </div>
  );
}

export default function PupilLearn({ teaching, color = '#14b8a6' }) {
  if (!teaching) return null;
  const T = teaching;
  const tryIts = Array.isArray(T.tryIt) ? T.tryIt : T.tryIt ? [T.tryIt] : [];
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {T.explain?.length > 0 && (
        <section style={card}>
          <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <LabBuddy size={56} />
            <div style={{ minWidth: 0 }}>
              <div style={label(color)}>Dot explains</div>
              {T.explain.map((p, i) => <p key={i} style={{ fontSize: 18, lineHeight: 1.6, margin: '0 0 10px' }}>{p}</p>)}
            </div>
          </div>
          {T.realWorld && (
            <div style={{ marginTop: 6, padding: '10px 12px', borderRadius: 12, background: '#eff6ff', border: '2px solid #bfdbfe', fontSize: 16 }}>
              <b><EmojiIcon e="🌍" style={{ marginRight: '0.35em' }} />In real life: </b>{T.realWorld}
            </div>
          )}
        </section>
      )}

      {T.example && (
        <section style={card}>
          <div style={label(color)}>{T.review ? 'Remember' : 'Example'}</div>
          <TeachingVisual example={T.example} accent={color} />
        </section>
      )}

      {T.mistake && (
        <section style={{ ...card, display: 'grid', gap: 10 }}>
          <div style={label('#e8590c')}>Watch out!</div>
          <div style={{ padding: '10px 12px', borderRadius: 12, background: '#fff5f5', border: '2px solid #ffc9c9', fontSize: 17 }}>
            <b style={{ color: '#c92a2a' }}><EmojiIcon e="❌" /> </b>{T.mistake.wrong}
          </div>
          <div style={{ padding: '10px 12px', borderRadius: 12, background: '#ebfbee', border: '2px solid #b2f2bb', fontSize: 17 }}>
            <b style={{ color: '#2b8a3e' }}><EmojiIcon e="✅" /> </b>{T.mistake.fix}
          </div>
        </section>
      )}

      {tryIts.length > 0 && (
        <section style={{ ...card, display: 'grid', gap: 12 }}>
          <div style={label(color)}>Check yourself</div>
          {tryIts.map((t, i) => <CheckYourself key={i} q={t.q} a={t.a} color={color} />)}
        </section>
      )}
    </div>
  );
}
