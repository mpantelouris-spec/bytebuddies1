/**
 * RoundGame — the shared frame for every Learn mini-game.
 *
 * A game is a list of rounds. The round's UI calls answer(ok, why) once; the
 * frame shows Dot's reaction, keeps score and streak, and ends with stars.
 */
import React, { useState, useRef, useEffect } from 'react';
import LabBuddy from '../CodingLab/LabBuddy.jsx';
import { EmojiIcon, IconText } from '../../ui/Icon.jsx';

const PASS = 0.5;

let ctx = null;
function beep(ok) {
  try {
    if (localStorage.getItem('bb_game_sound') === 'off') return;
    ctx ||= new (window.AudioContext || window.webkitAudioContext)();
    const notes = ok ? [660, 880] : [220, 180];
    notes.forEach((f, i) => {
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = ok ? 'triangle' : 'sawtooth'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.09);
      g.gain.exponentialRampToValueAtTime(ok ? 0.12 : 0.05, ctx.currentTime + i * 0.09 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.09 + 0.16);
      o.connect(g).connect(ctx.destination); o.start(ctx.currentTime + i * 0.09); o.stop(ctx.currentTime + i * 0.09 + 0.18);
    });
  } catch { /* no audio */ }
}

const CHEERS = ['Brilliant!', 'Spot on!', 'Yes!', 'Nailed it!', 'Superstar!', 'Correct!'];
const OOPS = ['Not quite!', 'Good try!', 'Nearly!', 'Oops!'];

function Confetti() {
  const bits = Array.from({ length: 28 }, (_, i) => i);
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {bits.map((i) => (
        <span key={i} style={{
          position: 'absolute', left: `${(i * 37) % 100}%`, top: -20, fontSize: 18 + (i % 3) * 6,
          animation: `bb-confetti ${1.6 + (i % 5) * 0.25}s ease-in ${(i % 7) * 0.08}s forwards`,
        }}><IconText>{['🎉', '⭐', '✨', '🟡', '🟣', '🔷'][i % 6]}</IconText></span>
      ))}
    </div>
  );
}

export default function RoundGame({ title, how, rounds, renderRound, color = '#14b8a6', onComplete, makeRounds }) {
  const [list, setList] = useState(rounds);
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [fb, setFb] = useState(null);
  const [done, setDone] = useState(false);
  const [sound, setSound] = useState(() => { try { return localStorage.getItem('bb_game_sound') !== 'off'; } catch { return true; } });
  const reported = useRef(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const total = list.length;
  const round = list[i];

  const next = () => {
    clearTimeout(timer.current);
    setFb(null);
    if (i + 1 >= total) {
      setDone(true);
      if (!reported.current && score / total >= PASS) { reported.current = true; onComplete?.(); }
    } else setI(i + 1);
  };

  const answer = (ok, why) => {
    if (fb) return;
    beep(ok);
    if (ok) {
      setScore((s) => s + 1);
      setStreak((s) => { const n = s + 1; setBest((b) => Math.max(b, n)); return n; });
    } else setStreak(0);
    const word = ok ? CHEERS[(i + score) % CHEERS.length] : OOPS[i % OOPS.length];
    setFb({ ok, why, word });
    if (ok && !why) timer.current = setTimeout(() => { setFb(null); if (i + 1 >= total) { setDone(true); } else setI((x) => x + 1); }, 900);
  };

  // report completion when finishing via the auto-advance path
  useEffect(() => {
    if (done && !reported.current && score / total >= PASS) { reported.current = true; onComplete?.(); }
  }, [done, score, total, onComplete]);

  const restart = () => {
    setList(makeRounds ? makeRounds() : [...rounds].sort(() => Math.random() - 0.5));
    setI(0); setScore(0); setStreak(0); setFb(null); setDone(false);
  };

  const toggleSound = () => {
    const n = !sound; setSound(n);
    try { localStorage.setItem('bb_game_sound', n ? 'on' : 'off'); } catch { /* ignore */ }
  };

  const pct = total ? score / total : 0;
  const stars = pct >= 0.9 ? 3 : pct >= 0.6 ? 2 : pct >= PASS ? 1 : 0;

  return (
    <div style={{ position: 'relative', background: '#fff', color: '#0f172a', borderRadius: 20, padding: 16, boxShadow: '0 10px 30px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
      <style>{`
        @keyframes bb-confetti { to { transform: translateY(520px) rotate(540deg); opacity: 0; } }
        @keyframes bb-pop { 0% { transform: scale(0.6); opacity: 0 } 70% { transform: scale(1.08) } 100% { transform: scale(1); opacity: 1 } }
        @keyframes bb-dot-hop { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-14px) } }
        @keyframes bb-wobble { 0%,100% { transform: rotate(0) } 25% { transform: rotate(-6deg) } 75% { transform: rotate(6deg) } }
        .bb-tap { transition: transform .12s, box-shadow .12s; }
        .bb-tap:active { transform: scale(0.96); }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
        <div style={{ animation: fb ? (fb.ok ? 'bb-dot-hop .5s' : 'bb-wobble .4s') : undefined }}><LabBuddy size={44} /></div>
        <div style={{ flex: '1 1 200px', minWidth: 0 }}>
          <div style={{ fontWeight: 900, fontSize: 18 }}>{title}</div>
          {how && <div style={{ fontSize: 14, color: '#475569' }}>{how}</div>}
        </div>
        {!done && (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={chip('#eef2ff', '#4338ca')}>{Math.min(i + 1, total)} / {total}</span>
            <span style={chip('#ecfdf5', '#047857')}>⭐ {score}</span>
            {streak >= 2 && <span style={{ ...chip('#fff7ed', '#c2410c'), animation: 'bb-pop .3s' }}><EmojiIcon e="🔥" style={{ marginRight: '0.35em' }} />{streak} in a row</span>}
          </div>
        )}
        <button type="button" onClick={toggleSound} aria-label={sound ? 'Turn sound off' : 'Turn sound on'}
          style={{ border: 'none', background: '#f1f5f9', borderRadius: 10, width: 36, height: 36, cursor: 'pointer', fontSize: 16 }}><IconText>{sound ? '🔊' : '🔇'}</IconText></button>
      </div>

      {/* Progress bar */}
      {!done && (
        <div style={{ height: 8, background: '#f1f5f9', borderRadius: 99, marginBottom: 14, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(i / total) * 100}%`, background: color, transition: 'width .3s' }} />
        </div>
      )}

      {!done && round && (
        <div key={i} style={{ animation: 'bb-pop .3s ease' }}>
          {renderRound(round, answer, !!fb)}
        </div>
      )}

      {fb && (
        <div role="status" style={{
          marginTop: 14, borderRadius: 14, padding: '12px 14px', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap',
          background: fb.ok ? '#ebfbee' : '#fff4e6', border: `2px solid ${fb.ok ? '#40c057' : '#ff922b'}`, animation: 'bb-pop .25s',
        }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontWeight: 900, fontSize: 18, color: fb.ok ? '#2b8a3e' : '#c2410c' }}><IconText>{fb.ok ? '✅' : '💡'}</IconText> {fb.word}</div>
            {fb.why && <div style={{ fontSize: 16, marginTop: 2 }}>{fb.why}</div>}
          </div>
          {(!fb.ok || fb.why) && (
            <button type="button" className="bb-tap" onClick={next} style={{ ...bigBtn(color), minWidth: 120 }}>
              {i + 1 >= total ? 'See results' : 'Next →'}
            </button>
          )}
        </div>
      )}

      {done && (
        <div style={{ textAlign: 'center', padding: '18px 8px 8px', position: 'relative' }}>
          {stars >= 2 && <Confetti />}
          <div style={{ fontSize: 46, letterSpacing: 6, animation: 'bb-pop .5s' }}>
            {'⭐'.repeat(stars)}<span style={{ opacity: 0.2 }}>{'⭐'.repeat(3 - stars)}</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, marginTop: 6 }}>
            {stars === 3 ? 'Perfect!' : stars === 2 ? 'Great work!' : stars === 1 ? 'You did it!' : 'Keep practising!'}
          </div>
          <div style={{ fontSize: 17, color: '#475569', margin: '4px 0 14px' }}>
            {score} out of {total} correct{best >= 3 ? ` · best streak 🔥 ${best}` : ''}
          </div>
          {stars === 0 && <div style={{ fontSize: 16, color: '#c2410c', marginBottom: 12 }}>Get at least {Math.ceil(total * PASS)} right to unlock the next level.</div>}
          <button type="button" className="bb-tap" onClick={restart} style={bigBtn(stars === 0 ? color : '#64748b')}><EmojiIcon e="🔁" style={{ marginRight: '0.35em' }} />Play again</button>
        </div>
      )}
    </div>
  );
}

const chip = (bg, fg) => ({ background: bg, color: fg, borderRadius: 999, padding: '5px 10px', fontWeight: 800, fontSize: 14 });
export const bigBtn = (color) => ({
  minHeight: 46, padding: '0 20px', borderRadius: 14, border: 'none', background: color, color: '#fff',
  fontWeight: 900, fontSize: 16, cursor: 'pointer', boxShadow: 'inset 0 -3px 0 rgba(0,0,0,0.18)', fontFamily: 'inherit',
});
export const choiceBtn = (state, color) => ({
  minHeight: 54, padding: '10px 14px', borderRadius: 14, cursor: 'pointer', fontFamily: 'inherit',
  fontSize: 17, fontWeight: 800, textAlign: 'center', color: '#0f172a',
  border: `3px solid ${state === 'right' ? '#40c057' : state === 'wrong' ? '#fa5252' : '#e2e8f0'}`,
  background: state === 'right' ? '#ebfbee' : state === 'wrong' ? '#fff5f5' : '#f8fafc',
  boxShadow: state ? 'none' : `inset 0 -3px 0 #e2e8f0`,
});
