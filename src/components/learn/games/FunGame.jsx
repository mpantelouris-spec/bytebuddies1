/**
 * FunGame — the pupil mini-games. Each game's content comes from
 * src/data/funActivities.js; this file only draws and plays them.
 */
import React, { useMemo, useState } from 'react';
import RoundGame, { bigBtn, choiceBtn } from './RoundGame.jsx';
import { BlockStack } from '../TeachingVisual.jsx';
import TeachingVisual from '../TeachingVisual.jsx';
import LabBuddy from '../CodingLab/LabBuddy.jsx';
import { EmojiIcon, IconText } from '../../ui/Icon.jsx';

const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);
const big = { fontSize: 22, fontWeight: 900, lineHeight: 1.35, margin: '0 0 14px' };

// ── True or false ────────────────────────────────────────────────────────────
function TrueFalse({ game, color, onComplete }) {
  const [picked, setPicked] = useState(null);
  return (
    <RoundGame title={game.title} how={game.how || 'Is it true or false? Tap your answer.'} color={color} onComplete={onComplete}
      rounds={game.rounds} makeRounds={() => shuffle(game.rounds)}
      renderRound={(r, answer, locked) => (
        <div>
          <p style={big}>{r.s}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[true, false].map((v) => {
              const state = locked ? (v === r.t ? 'right' : picked === v ? 'wrong' : null) : null;
              return (
                <button key={String(v)} type="button" className="bb-tap" disabled={locked}
                  onClick={() => { setPicked(v); answer(v === r.t, r.why); }}
                  style={{ ...choiceBtn(state, color), minHeight: 72, fontSize: 22 }}>
                  <IconText>{v ? '✅ True' : '❌ False'}</IconText>
                </button>
              );
            })}
          </div>
        </div>
      )} />
  );
}

// ── Tap to sort into bins ────────────────────────────────────────────────────
function SortIt({ game, color, onComplete }) {
  const [piles, setPiles] = useState({});
  const [wrongBin, setWrongBin] = useState(null);
  return (
    <RoundGame title={game.title} how={game.how || 'Tap the box where this belongs.'} color={color} onComplete={onComplete}
      rounds={game.items} makeRounds={() => { setPiles({}); return shuffle(game.items); }}
      renderRound={(item, answer, locked) => (
        <div>
          <div style={{ textAlign: 'center', margin: '4px 0 16px' }}>
            <span style={{ display: 'inline-block', padding: '14px 20px', borderRadius: 16, background: '#fff9db', border: '3px dashed #fcc419', fontSize: 21, fontWeight: 900, maxWidth: '100%' }}>
              {item.text}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${game.bins.length}, 1fr)`, gap: 10 }}>
            {game.bins.map((bin) => {
              const state = locked ? (bin.id === item.bin ? 'right' : wrongBin === bin.id ? 'wrong' : null) : null;
              return (
                <button key={bin.id} type="button" className="bb-tap" disabled={locked}
                  onClick={() => {
                    const ok = bin.id === item.bin;
                    setWrongBin(ok ? null : bin.id);
                    setPiles((p) => ({ ...p, [item.bin]: [...(p[item.bin] || []), item.text] }));
                    answer(ok, ok ? item.why : item.why || `That one goes in “${game.bins.find((b) => b.id === item.bin)?.label}”.`);
                  }}
                  style={{ ...choiceBtn(state, color), minHeight: 110, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <span style={{ fontSize: 34 }}><EmojiIcon e={bin.icon} /></span>
                  <span>{bin.label}</span>
                  <span style={{ fontSize: 12, color: '#64748b', fontWeight: 700 }}>{(piles[bin.id] || []).length} sorted</span>
                </button>
              );
            })}
          </div>
        </div>
      )} />
  );
}

// ── Multiple choice with an optional picture (blocks, code, chart…) ──────────
function Choice({ game, color, onComplete }) {
  const [picked, setPicked] = useState(null);
  return (
    <RoundGame title={game.title} how={game.how} color={color} onComplete={onComplete}
      rounds={game.rounds} makeRounds={game.regen || (() => shuffle(game.rounds))}
      renderRound={(r, answer, locked) => {
        const opts = r._opts || (r._opts = shuffle(r.options.map((o, k) => ({ o, k }))));
        return (
          <div>
            <p style={big}>{r.q}</p>
            {r.blocks && <div style={{ marginBottom: 14 }}><BlockStack blocks={r.blocks} size={17} /></div>}
            {r.visual && <div style={{ marginBottom: 14 }}><TeachingVisual example={r.visual} accent={color} /></div>}
            {r.big && <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: 4, textAlign: 'center', fontFamily: 'ui-monospace, Menlo, monospace', margin: '6px 0 16px', color: '#4338ca' }}>{r.big}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
              {opts.map(({ o, k }) => {
                const state = locked ? (k === r.answer ? 'right' : picked === k ? 'wrong' : null) : null;
                return (
                  <button key={k} type="button" className="bb-tap" disabled={locked} data-correct={import.meta.env.DEV && k === r.answer ? '1' : undefined}
                    onClick={() => { setPicked(k); answer(k === r.answer, r.why); }}
                    style={choiceBtn(state, color)}>{o}</button>
                );
              })}
            </div>
          </div>
        );
      }} />
  );
}

// ── Grid helpers ────────────────────────────────────────────────────────────
const ARROW = { 0: '➡️', 90: '⬆️', 180: '⬅️', 270: '⬇️' };
function GridBoard({ cols, rows, start, walls = [], star, onTap, marks = {}, cellMax = 62 }) {
  const cell = Math.max(38, Math.min(cellMax, Math.floor(520 / cols)));
  const wallSet = new Set(walls.map(([c, r]) => `${c},${r}`));
  return (
    <div style={{ display: 'inline-grid', gridTemplateColumns: `repeat(${cols}, ${cell}px)`, borderRadius: 12, overflow: 'hidden', border: '4px solid #2b8a3e', boxShadow: '0 5px 0 #1f6f30' }}>
      {Array.from({ length: cols * rows }, (_, n) => {
        const c = n % cols; const r = Math.floor(n / cols); const k = `${c},${r}`;
        const isStart = start && start[0] === c && start[1] === r;
        const mark = marks[k];
        return (
          <button key={k} type="button" onClick={() => onTap?.(c, r)} disabled={!onTap || wallSet.has(k)}
            style={{ width: cell, height: cell, border: 'none', padding: 0, cursor: onTap ? 'pointer' : 'default', position: 'relative',
              background: mark?.bg || (wallSet.has(k) ? '#868e96' : (c + r) % 2 ? '#b2f2bb' : '#d3f9d8'),
              display: 'grid', placeItems: 'center', fontSize: cell * 0.48 }}>
            <IconText>{wallSet.has(k) && '🧱'}</IconText>
            {star && star[0] === c && star[1] === r && !mark?.icon && '⭐'}
            {isStart && <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}><LabBuddy size={cell * 1.0} /></span>}
            {mark?.icon && <span style={{ position: 'relative', zIndex: 2 }}><EmojiIcon e={mark.icon} /></span>}
          </button>
        );
      })}
    </div>
  );
}

// ── Predict where Dot stops ─────────────────────────────────────────────────
function PredictDot({ game, color, onComplete }) {
  const [tapAt, setTap] = useState(null);
  return (
    <RoundGame title={game.title} how={game.how || 'Read the code, then tap the square where Dot will stop.'} color={color} onComplete={onComplete}
      rounds={game.rounds} makeRounds={game.regen}
      renderRound={(r, answer, locked) => {
        const tap = tapAt && tapAt.id === r.id ? tapAt.at : null;
        return (
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Dot starts facing {ARROW[r.dir]}</div>
            <BlockStack blocks={r.blocks} size={17} />
          </div>
          <GridBoard cols={r.cols} rows={r.rows} start={[r.start[0], r.start[1]]} walls={r.walls}
            marks={locked ? {
              [`${r.end[0]},${r.end[1]}`]: { bg: '#8ce99a', icon: '🏁' },
              ...(tap && (tap[0] !== r.end[0] || tap[1] !== r.end[1]) ? { [`${tap[0]},${tap[1]}`]: { bg: '#ffa8a8', icon: '❌' } } : {}),
            } : tap ? { [`${tap[0]},${tap[1]}`]: { bg: '#ffe066', icon: '📍' } } : {}}
            onTap={locked ? null : (c, rr) => {
              setTap({ id: r.id, at: [c, rr] });
              answer(c === r.end[0] && rr === r.end[1], c === r.end[0] && rr === r.end[1] ? null : 'The 🏁 shows where Dot really stops. Trace it one block at a time!');
            }} />
        </div>
        );
      }} />
  );
}

// ── Bug squash: tap the buggy block, then choose the fix ────────────────────
function BugSquash({ game, color, onComplete }) {
  const [stage, setStage] = useState({ round: -1, found: false, picked: null });
  return (
    <RoundGame title={game.title} how={game.how || 'One block is wrong. Tap the bug 🐞, then pick the fix.'} color={color} onComplete={onComplete}
      rounds={game.rounds} makeRounds={game.regen}
      renderRound={(r, answer, locked) => {
        const st = stage.round === r.id ? stage : { round: r.id, found: false, picked: null };
        return (
          <div>
            <p style={{ ...big, fontSize: 20 }}><EmojiIcon e="🎯" style={{ marginRight: '0.35em' }} />{r.goal}</p>
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {r.blocks.map((b, k) => (
                  <button key={k} type="button" disabled={locked || st.found}
                    onClick={() => {
                      if (k === r.bug) setStage({ round: r.id, found: true, picked: k });
                      else { setStage({ round: r.id, found: false, picked: k }); answer(false, `The bug was block ${r.bug + 1}: “${r.blocks[r.bug].trim()}”. ${r.why}`); }
                    }}
                    style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', textAlign: 'left',
                      outline: (st.found || locked) && k === r.bug ? '4px solid #fa5252' : st.picked === k ? '4px solid #ffa94d' : 'none', borderRadius: 8 }}>
                    <BlockStack blocks={[b]} size={17} />
                  </button>
                ))}
              </div>
              {r.grid && <GridBoard {...r.grid} cellMax={48} />}
            </div>
            {st.found && !locked && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 8 }}><EmojiIcon e="🐞" style={{ marginRight: '0.35em' }} />Squashed! What should block {r.bug + 1} be?</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
                  {r.fixes.map((f, k) => (
                    <button key={k} type="button" className="bb-tap" style={choiceBtn(null, color)}
                      onClick={() => answer(k === r.fix, k === r.fix ? null : `The fix is “${r.fixes[r.fix]}”. ${r.why}`)}>{f}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }} />
  );
}

// ── Code painter: tap the squares the program paints ────────────────────────
function CodePainter({ game, color, onComplete }) {
  const [sel, setSel] = useState({});
  return (
    <RoundGame title={game.title} how={game.how || 'Follow the code. Tap every square Dot paints, then press Check.'} color={color} onComplete={onComplete}
      rounds={game.rounds} makeRounds={() => { setSel({}); return game.regen(); }}
      renderRound={(r, answer, locked) => {
        const mine = sel[r.id] || new Set();
        const want = new Set(r.paint.map(([c, rr]) => `${c},${rr}`));
        const marks = {};
        if (locked) {
          want.forEach((k) => { marks[k] = { bg: mine.has(k) ? '#74c0fc' : '#ffd8a8', icon: mine.has(k) ? '' : '❗' }; });
          mine.forEach((k) => { if (!want.has(k)) marks[k] = { bg: '#ffa8a8', icon: '✖' }; });
        } else mine.forEach((k) => { marks[k] = { bg: '#74c0fc' }; });
        return (
          <div>
            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 800, marginBottom: 8 }}>Dot starts facing {ARROW[r.dir]}</div>
                <BlockStack blocks={r.blocks} size={17} />
              </div>
              <GridBoard cols={r.cols} rows={r.rows} start={r.start} marks={marks}
                onTap={locked ? null : (c, rr) => {
                  const k = `${c},${rr}`; const n = new Set(mine);
                  if (n.has(k)) n.delete(k); else n.add(k);
                  setSel((s) => ({ ...s, [r.id]: n }));
                }} />
            </div>
            {!locked && (
              <button type="button" className="bb-tap" style={{ ...bigBtn(color), marginTop: 14 }}
                onClick={() => {
                  const ok = mine.size === want.size && [...want].every((k) => mine.has(k));
                  answer(ok, ok ? null : `Dot paints ${want.size} squares. Orange ❗ = missed, red ✖ = not painted. Trace each repeat carefully!`);
                }}><EmojiIcon e="✔" style={{ marginRight: '0.35em' }} />Check my picture</button>
            )}
          </div>
        );
      }} />
  );
}

// ── Order up: tap the steps in the right order ──────────────────────────────
function OrderUp({ game, color, onComplete }) {
  const [state, setState] = useState({});
  return (
    <RoundGame title={game.title} how={game.how || 'Tap the steps in the right order.'} color={color} onComplete={onComplete}
      rounds={game.rounds} makeRounds={() => { setState({}); return shuffle(game.rounds).map((r) => ({ ...r, pool: shuffle(r.steps) })); }}
      renderRound={(r, answer, locked) => {
        const id = r.title;
        const st = state[id] || { pool: r.pool || r.steps, chosen: [] };
        const choose = (step) => {
          const chosen = [...st.chosen, step];
          const pool = st.pool.filter((x) => x !== step);
          setState((s) => ({ ...s, [id]: { pool, chosen } }));
          if (!pool.length) {
            const ok = chosen.every((x, k) => x === r.steps[k]);
            answer(ok, ok ? null : `The right order: ${r.steps.map((x, k) => `${k + 1}. ${x}`).join('  ')}`);
          }
        };
        return (
          <div>
            <p style={big}>{r.title}</p>
            <div style={{ display: 'grid', gap: 8, marginBottom: 12, minHeight: 40 }}>
              {st.chosen.map((x, k) => (
                <div key={x} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 12px', borderRadius: 12,
                  background: locked ? (x === r.steps[k] ? '#ebfbee' : '#fff5f5') : '#eef2ff', border: `2px solid ${locked ? (x === r.steps[k] ? '#40c057' : '#fa5252') : '#c5d0fa'}`, fontSize: 17, fontWeight: 700 }}>
                  <b style={{ width: 28, height: 28, borderRadius: '50%', background: color, color: '#fff', display: 'grid', placeItems: 'center', flexShrink: 0 }}>{k + 1}</b>{x}
                </div>
              ))}
            </div>
            {!locked && (
              <>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#64748b', marginBottom: 6 }}>TAP THE NEXT STEP</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8 }}>
                  {st.pool.map((x) => <button key={x} type="button" className="bb-tap" style={{ ...choiceBtn(null, color), fontSize: 16 }} onClick={() => choose(x)}>{x}</button>)}
                </div>
                {st.chosen.length > 0 && (
                  <button type="button" onClick={() => setState((s) => ({ ...s, [id]: { pool: shuffle(r.steps), chosen: [] } }))}
                    style={{ marginTop: 10, border: 'none', background: 'none', color: '#64748b', fontWeight: 800, cursor: 'pointer', fontSize: 15 }}>↺ Start this one again</button>
                )}
              </>
            )}
          </div>
        );
      }} />
  );
}

// ── Guess my number (binary search) ─────────────────────────────────────────
function GuessNumber({ game, color, onComplete }) {
  const [g, setG] = useState({});
  return (
    <RoundGame title={game.title} how={game.how} color={color} onComplete={onComplete}
      rounds={game.rounds} makeRounds={game.regen}
      renderRound={(r, answer, locked) => {
        const st = g[r.id] || { lo: 1, hi: r.max, tries: [], value: Math.ceil(r.max / 2) };
        const guess = () => {
          const v = st.value;
          const tries = [...st.tries, v];
          if (v === r.target) {
            setG((s) => ({ ...s, [r.id]: { ...st, tries } }));
            answer(tries.length <= r.limit, tries.length <= r.limit ? null : `Found in ${tries.length} guesses — a binary search (always guess the middle) needs at most ${r.limit}.`);
            return;
          }
          const lo = v < r.target ? Math.max(st.lo, v + 1) : st.lo;
          const hi = v > r.target ? Math.min(st.hi, v - 1) : st.hi;
          setG((s) => ({ ...s, [r.id]: { lo, hi, tries, value: Math.floor((lo + hi) / 2) } }));
        };
        const last = st.tries[st.tries.length - 1];
        return (
          <div>
            <p style={big}>I’m thinking of a number from 1 to {r.max}. Find it in {r.limit} guesses or fewer!</p>
            <div style={{ position: 'relative', height: 26, borderRadius: 99, background: '#f1f5f9', marginBottom: 6 }}>
              <div style={{ position: 'absolute', top: 0, bottom: 0, borderRadius: 99, background: `${color}55`,
                left: `${((st.lo - 1) / r.max) * 100}%`, width: `${((st.hi - st.lo + 1) / r.max) * 100}%`, transition: 'all .3s' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#64748b', marginBottom: 12 }}>
              <span>Still possible: {st.lo} – {st.hi}</span><span>Guesses: {st.tries.length} / {r.limit}</span>
            </div>
            {last != null && last !== r.target && (
              <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 10, color: '#c2410c' }}>{last} is too {last < r.target ? 'LOW ⬆️' : 'HIGH ⬇️'}</div>
            )}
            {!locked && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <button type="button" className="bb-tap" style={{ ...bigBtn('#94a3b8'), width: 46, padding: 0 }} onClick={() => setG((s) => ({ ...s, [r.id]: { ...st, value: Math.max(1, st.value - 1) } }))}>−</button>
                <input type="range" min={1} max={r.max} value={st.value} aria-label="your guess"
                  onChange={(e) => setG((s) => ({ ...s, [r.id]: { ...st, value: Number(e.target.value) } }))} style={{ flex: '1 1 160px', height: 32 }} />
                <button type="button" className="bb-tap" style={{ ...bigBtn('#94a3b8'), width: 46, padding: 0 }} onClick={() => setG((s) => ({ ...s, [r.id]: { ...st, value: Math.min(r.max, st.value + 1) } }))}>+</button>
                <span style={{ fontSize: 30, fontWeight: 900, minWidth: 60, textAlign: 'center' }}>{st.value}</span>
                <button type="button" className="bb-tap" style={bigBtn(color)} onClick={guess}>Guess!</button>
              </div>
            )}
            <div style={{ fontSize: 14, color: '#64748b', marginTop: 10 }}>Tip: the slider starts in the middle of what’s still possible.</div>
          </div>
        );
      }} />
  );
}

// ── Network route: tap computers to send the message ────────────────────────
function NetworkRoute({ game, color, onComplete }) {
  const [paths, setPaths] = useState({});
  return (
    <RoundGame title={game.title} how={game.how || 'A cable is broken ✂️. Tap the devices to send the message from 📤 to 📥.'} color={color} onComplete={onComplete}
      rounds={game.rounds} makeRounds={() => { setPaths({}); return shuffle(game.rounds); }}
      renderRound={(r, answer, locked) => {
        const path = paths[r.id] || [r.from];
        const key = (a, b) => [a, b].sort().join('-');
        const broken = new Set(r.broken.map(([a, b]) => key(a, b)));
        const linked = (a, b) => r.links.some(([x, y]) => key(x, y) === key(a, b)) && !broken.has(key(a, b));
        const node = (id) => r.nodes.find((n) => n.id === id);
        const tapNode = (id) => {
          const cur = path[path.length - 1];
          if (path.includes(id)) return;
          if (!linked(cur, id)) { answer(false, r.links.some(([x, y]) => key(x, y) === key(cur, id)) ? 'That cable is broken ✂️ — find another route!' : 'Messages can only travel along a cable to a device that is connected.'); return; }
          const next = [...path, id];
          setPaths((p) => ({ ...p, [r.id]: next }));
          if (id === r.to) answer(true, `Delivered in ${next.length - 1} hops! When a link breaks, routers find another way.`);
        };
        return (
          <div>
            <svg viewBox="0 0 100 62" style={{ width: '100%', maxWidth: 620, display: 'block', margin: '0 auto', background: '#f8fafc', borderRadius: 16 }}>
              {r.links.map(([a, b]) => {
                const A = node(a); const B = node(b); const br = broken.has(key(a, b));
                const used = path.some((p, k) => k > 0 && key(path[k - 1], p) === key(a, b));
                return (
                  <g key={key(a, b)}>
                    <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={br ? '#fa5252' : used ? color : '#adb5bd'} strokeWidth={used ? 1.6 : 0.9} strokeDasharray={br ? '2 1.5' : undefined} />
                    {br && <text x={(A.x + B.x) / 2} y={(A.y + B.y) / 2 + 1.5} fontSize="5" textAnchor="middle">✂️</text>}
                  </g>
                );
              })}
              {r.nodes.map((n) => {
                const on = path.includes(n.id);
                return (
                  <g key={n.id} onClick={() => !locked && tapNode(n.id)} style={{ cursor: 'pointer' }}>
                    <circle cx={n.x} cy={n.y} r="6.2" fill={on ? color : '#fff'} stroke={on ? color : '#94a3b8'} strokeWidth="0.8" />
                    <text x={n.x} y={n.y + 2.2} fontSize="6" textAnchor="middle">{n.id === r.from ? '📤' : n.id === r.to ? '📥' : n.icon || '🖥️'}</text>
                    <text x={n.x} y={n.y + 10.5} fontSize="3.2" textAnchor="middle" fill="#334155" fontWeight="700">{n.label}</text>
                  </g>
                );
              })}
            </svg>
            {!locked && path.length > 1 && (
              <button type="button" onClick={() => setPaths((p) => ({ ...p, [r.id]: [r.from] }))}
                style={{ marginTop: 10, border: 'none', background: 'none', color: '#64748b', fontWeight: 800, cursor: 'pointer', fontSize: 15 }}>↺ Start the route again</button>
            )}
          </div>
        );
      }} />
  );
}

// ── Logic lamp: flip switches so the lamp lights ────────────────────────────
function LogicLamp({ game, color, onComplete }) {
  const [sw, setSw] = useState({});
  return (
    <RoundGame title={game.title} how={game.how || 'Flip the switches so the condition is TRUE and the lamp lights up.'} color={color} onComplete={onComplete}
      rounds={game.rounds} makeRounds={() => { setSw({}); return shuffle(game.rounds); }}
      renderRound={(r, answer, locked) => {
        const vals = sw[r.id] || Object.fromEntries(r.inputs.map((x) => [x.id, false]));
        const on = r.test(vals);
        return (
          <div>
            <p style={{ ...big, fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 20, background: '#f1f5f9', padding: '10px 12px', borderRadius: 12 }}>if {r.expr} then 💡</p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'grid', gap: 10, flex: '1 1 260px' }}>
                {r.inputs.map((x) => (
                  <button key={x.id} type="button" className="bb-tap" disabled={locked}
                    onClick={() => setSw((s) => ({ ...s, [r.id]: { ...vals, [x.id]: !vals[x.id] } }))}
                    style={{ ...choiceBtn(null, color), display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}>
                    <span>{x.label}</span>
                    <span style={{ width: 64, height: 34, borderRadius: 99, background: vals[x.id] ? '#40c057' : '#ced4da', position: 'relative', flexShrink: 0, transition: 'background .2s' }}>
                      <span style={{ position: 'absolute', top: 3, left: vals[x.id] ? 33 : 3, width: 28, height: 28, borderRadius: '50%', background: '#fff', transition: 'left .2s' }} />
                    </span>
                  </button>
                ))}
              </div>
              <div style={{ textAlign: 'center', flex: '0 0 140px' }}>
                <div style={{ fontSize: 72, filter: on ? 'drop-shadow(0 0 18px #ffd43b)' : 'grayscale(1) opacity(.4)', transition: 'filter .2s' }}><EmojiIcon e="💡" /></div>
                <div style={{ fontWeight: 900, color: on ? '#2b8a3e' : '#868e96' }}>{on ? 'TRUE' : 'FALSE'}</div>
              </div>
            </div>
            {!locked && <button type="button" className="bb-tap" style={{ ...bigBtn(color), marginTop: 14 }} onClick={() => answer(on, on ? r.why : `The lamp is off — the condition is false. ${r.why}`)}><EmojiIcon e="✔" style={{ marginRight: '0.35em' }} />Lamp check</button>}
          </div>
        );
      }} />
  );
}

const ENGINES = {
  truefalse: TrueFalse, sort: SortIt, choice: Choice, predict: PredictDot, bugs: BugSquash,
  painter: CodePainter, order: OrderUp, guess: GuessNumber, network: NetworkRoute, logic: LogicLamp,
};

export default function FunGame({ activity, color, onComplete }) {
  const game = useMemo(() => (activity.build ? activity.build() : activity.game), [activity]);
  const Engine = ENGINES[game?.engine];
  if (!Engine) return null;
  return <Engine game={game} color={color} onComplete={onComplete} />;
}
