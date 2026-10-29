/**
 * Create Studio — design your own robot or build your own game arena.
 */
import React, { useEffect, useState } from 'react';
import RobotWorkshop from './RobotWorkshop.jsx';
import RobotBuilder from './RobotBuilder.jsx';
import RobotPicker from './RobotPicker.jsx';
import TrackMaker from './TrackMaker.jsx';
import { blankTrack, loadMyTracks, saveMyTracks, trackLoop, TRACK_WORLDS, decodeTrack } from './raceTracks.js';
import { renderRobotThumb } from './robotThumbs.js';
import ArenaMaker, { blankArena } from './ArenaMaker.jsx';
import { BUILTIN_ARENAS, THEMES, themeFor, GOALS, loadMyArenas, saveMyArenas, decodeArena, encodeArena, normaliseMap } from '../arcade/games/arena.js';
import { loadRobotLibrary } from '../services/studio-robot-store.js';
import './create.css';
import { EmojiIcon } from '../../components/ui/Icon.jsx';
import { savedAgo } from './creationStore.js';

const WORLD_COUNT = Object.keys(THEMES).length;

function RobotThumb({ robot }) {
  const [src, setSrc] = useState(null);
  useEffect(() => {
    let live = true;
    renderRobotThumb(robot).then((u) => { if (live) setSrc(u); });
    return () => { live = false; };
  }, [robot]);
  return <div className="cs-robot-art">{src ? <img src={src} alt="" /> : <EmojiIcon e="🤖" />}</div>;
}

export default function CreateHub({ openRobot, robotConfig, onSaveRobot, onPlayRobot, onPlayArena, onPlayMyArena: playArenaNow, onPlayMyTrack: playTrackNow, onChooseRobot }) {
  // Play / Race first asks which robot should drive (pre-made Studio robots or your own)
  const [picking, setPicking] = useState(null);
  const onPlayMyArena = (a) => setPicking({ kind: 'arena', item: a });
  const onPlayMyTrack = (t) => setPicking({ kind: 'track', item: t });
  const pickerEl = picking && (
    <RobotPicker
      title={`${picking.kind === 'arena' ? 'Playing' : 'Racing'} ${picking.item.name || ''}`}
      current={robotConfig}
      onClose={() => setPicking(null)}
      onPick={(choice) => {
        const { kind, item } = picking;
        setPicking(null);
        if (!choice.keep) onChooseRobot?.(choice);
        if (kind === 'arena') playArenaNow(item); else playTrackNow?.(item);
      }}
    />
  );
  const [view, setView] = useState(openRobot ? 'robot' : 'home');
  const [editing, setEditing] = useState(openRobot && openRobot !== 'new' ? openRobot : null);
  const [arenas, setArenas] = useState(loadMyArenas);
  const [tracks, setTracks] = useState(loadMyTracks);
  const [importCode, setImportCode] = useState('');
  const [importMsg, setImportMsg] = useState('');
  const [trackCode, setTrackCode] = useState('');
  const [trackMsg, setTrackMsg] = useState('');
  const designs = loadRobotLibrary().filter((r) => r.workshop || (r.chassisBuildKey === 'designer' && r.design));

  const saveArena = (a) => {
    setArenas((list) => {
      const next = [{ ...a, custom: true, updated: Date.now() }, ...list.filter((x) => x.id !== a.id)];
      saveMyArenas(next);
      return next;
    });
  };
  const deleteArena = (a) => {
    if (!window.confirm(`Delete "${a.name}"?`)) return;
    setArenas((list) => { const next = list.filter((x) => x.id !== a.id); saveMyArenas(next); return next; });
  };
  const doImport = () => {
    const a = decodeArena(importCode);
    if (!a) { setImportMsg('That code did not work — check it was copied fully.'); return; }
    saveArena(a);
    setImportCode('');
    setImportMsg(`Imported "${a.name}"! 🎉`);
  };

  if (view === 'robot' && (!editing || editing.build)) {
    return (
      <div className="cs-root">
        {pickerEl}
        <RobotBuilder initial={editing} onBack={() => { setView('home'); setEditing(null); }}
          onSave={(cfg) => onSaveRobot(cfg)} onPlay={(cfg) => onPlayRobot(cfg)} />
      </div>
    );
  }
  if (view === 'robot') {
    return (
      <div className="cs-root">
        {pickerEl}
        <RobotWorkshop initial={editing} onBack={() => { setView('home'); setEditing(null); }}
          onSave={(cfg) => onSaveRobot(cfg)} onPlay={(cfg) => onPlayRobot(cfg)} />
      </div>
    );
  }
  const saveTrack = (t) => {
    setTracks((list) => { const next = [{ ...t, updated: Date.now() }, ...list.filter((x) => x.id !== t.id)]; saveMyTracks(next); return next; });
  };
  const deleteTrack = (t) => {
    if (!window.confirm(`Delete "${t.name}"?`)) return;
    setTracks((list) => { const next = list.filter((x) => x.id !== t.id); saveMyTracks(next); return next; });
  };
  const importTrack = () => {
    const t = decodeTrack(trackCode);
    if (!t) { setTrackMsg('That code did not work — check it was copied fully (it starts with BBT-).'); return; }
    saveTrack(t);
    setTrackCode('');
    setTrackMsg(`Imported "${t.name}"! 🎉`);
  };
  if (view === 'track') {
    return (
      <div className="cs-root">
        {pickerEl}
        <TrackMaker initial={editing} onBack={() => { setView('home'); setEditing(null); }} onSave={saveTrack} onPlay={(t) => onPlayMyTrack?.(t)} />
      </div>
    );
  }
  if (view === 'arena') {
    return (
      <div className="cs-root">
        {pickerEl}
        <ArenaMaker initial={editing} robotConfig={robotConfig} onBack={() => { setView('home'); setEditing(null); }}
          onSave={saveArena} onPlay={(a) => onPlayMyArena(a)} />
      </div>
    );
  }

  return (
    <div className="cs-root">
        {pickerEl}
      <div className="cs-home">
        <header className="cs-hero">
          <div>
            <div className="cs-kicker"><EmojiIcon e="✨" style={{ marginRight: '0.35em' }} />CREATE STUDIO</div>
            <h1>Make it. Code it. Play it.</h1>
            <p>Design a one-of-a-kind robot, then build your own arenas and race tracks for it — and share them with friends.</p>
          </div>
        </header>

        {/* Everything this pupil has made, right at the top */}
        <section className="cs-saved" aria-label="Your saved creations">
          <div className="cs-saved-head">
            <b><EmojiIcon e="💾" style={{ marginRight: '0.35em' }} />Your saved creations</b>
            <span className="cs-muted">Everything you build saves automatically — come back to it any time.</span>
          </div>
          <div className="cs-saved-links">
            {[['cs-my-arenas', '🏟️', 'My arenas', arenas.length], ['cs-my-tracks', '🏁', 'My race tracks', tracks.length], ['cs-my-robots', '🤖', 'My robots', designs.length]].map(([id, icon, label, n]) => (
              <button key={id} className="cs-saved-link" onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
                <span>{icon}</span><b>{label}</b><i>{n}</i>
              </button>
            ))}
          </div>
          {(() => {
            const recent = [
              ...arenas.map((a) => ({ kind: 'arena', item: a, at: a.updated || 0, icon: a.emoji || '🏟️', name: a.name, sub: `Arena · ${themeFor(a.theme).name}` })),
              ...tracks.map((t) => ({ kind: 'track', item: t, at: t.updated || 0, icon: t.emoji || '🏁', name: t.name, sub: `Race track · ${(TRACK_WORLDS.find((w) => w.id === t.world) || TRACK_WORLDS[0]).label}` })),
            ].sort((a, b) => b.at - a.at).slice(0, 4);
            if (!recent.length) return <div className="cs-muted" style={{ marginTop: 8 }}>Nothing saved yet — build an arena or a race track below and it will appear here.</div>;
            return (
              <>
                <div className="cs-saved-sub">Continue where you left off</div>
                <div className="cs-saved-recent">
                  {recent.map((r) => (
                    <div key={`${r.kind}-${r.item.id}`} className="cs-saved-card">
                      <span className="cs-saved-icon">{r.icon}</span>
                      <span className="cs-saved-text"><b>{r.name}</b><small>{r.sub}{r.at ? ` · saved ${savedAgo(r.at)}` : ''}</small></span>
                      <button className="cs-btn cs-btn--sm" onClick={() => { setEditing(r.item); setView(r.kind === 'arena' ? 'arena' : 'track'); }}><EmojiIcon e="✏️" style={{ marginRight: '0.3em' }} />Edit</button>
                      <button className="cs-btn cs-btn--go cs-btn--sm" onClick={() => (r.kind === 'arena' ? onPlayMyArena(r.item) : onPlayMyTrack?.(r.item))}><EmojiIcon e="▶" style={{ marginRight: '0.3em' }} />{r.kind === 'arena' ? 'Play' : 'Race'}</button>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </section>

        <div className="cs-bigcards">
          <button className="cs-bigcard cs-bigcard--robot" onClick={() => { setEditing(null); setView('robot'); }}>
            <span className="cs-bigcard-art"><EmojiIcon e="🤖" /></span>
            <span className="cs-bigcard-title">Build a Robot</span>
            <span className="cs-bigcard-text">Start with an empty build plate and build your robot piece by piece — blocks, balls, cylinders, wheels, legs, propellers, eyes, arms and lights. Drag, turn, stretch and paint every piece, then drive it in Robot Studio.</span>
            <span className="cs-bigcard-cta">Start building →</span>
          </button>
          <button className="cs-bigcard cs-bigcard--arena" onClick={() => { setEditing(blankArena('M')); setView('arena'); }}>
            <span className="cs-bigcard-art">🏟️</span>
            <span className="cs-bigcard-title">Build an Arena</span>
            <span className="cs-bigcard-text">Build walls, lava, gems, keys, doors, bugs and decorations right inside {WORLD_COUNT} 3D worlds — then drive it in Robot Studio with your own robot, just like the ready-made missions.</span>
            <span className="cs-bigcard-cta">Start building →</span>
          </button>
          <button className="cs-bigcard cs-bigcard--track" onClick={() => { setEditing(blankTrack()); setView('track'); }}>
            <span className="cs-bigcard-art">🏁</span>
            <span className="cs-bigcard-title">Build a Race Track</span>
            <span className="cs-bigcard-text">Snap together straights, curves, hairpins, S-bends and hills to make your own circuit in {TRACK_WORLDS.length} kart worlds — then race it against rival karts, with laps and checkpoint gates.</span>
            <span className="cs-bigcard-cta">Start building →</span>
          </button>
        </div>

        <section className="cs-section-block" id="cs-my-tracks">
          <div className="cs-section-head">
            <h2><EmojiIcon e="🏁" style={{ marginRight: '0.35em' }} />My race tracks ({tracks.length})</h2>
            <div className="cs-row">
              <input className="cs-input" style={{ width: 230 }} placeholder="Paste a track share code…" value={trackCode} onChange={(e) => { setTrackCode(e.target.value); setTrackMsg(''); }} />
              <button className="cs-btn" disabled={!trackCode.trim()} onClick={importTrack}><EmojiIcon e="⬇" style={{ marginRight: '0.35em' }} />Import track</button>
            </div>
          </div>
          {trackMsg && <div className="cs-note">{trackMsg}</div>}
          {tracks.length === 0 ? (
            <div className="cs-empty">No race tracks yet — build your first one above! 🏎️</div>
          ) : (
            <div className="cs-cardgrid">
              {tracks.map((t) => {
                const w = TRACK_WORLDS.find((x) => x.id === t.world) || TRACK_WORLDS[0];
                const { loop } = trackLoop(t);
                const xs = loop.map((p) => p.x), zs = loop.map((p) => p.z);
                const mn = Math.min(...xs, ...zs), span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs), 1);
                const k = 84 / span, ox = 50 - ((Math.max(...xs) + Math.min(...xs)) / 2) * k, oz = 50 - ((Math.max(...zs) + Math.min(...zs)) / 2) * k;
                void mn;
                const d = loop.map((p, i) => `${i ? 'L' : 'M'}${(ox + p.x * k).toFixed(1)},${(oz + p.z * k).toFixed(1)}`).join(' ') + 'Z';
                return (
                  <div key={t.id} className="cs-arena-card" style={{ '--t': w.color }}>
                    <svg className="cs-track-mini" viewBox="0 0 100 100" aria-hidden="true">
                      <path d={d} fill="none" stroke="#334155" strokeWidth="7" strokeLinejoin="round" />
                      <path d={d} fill="none" stroke="#fff" strokeWidth="1" strokeDasharray="3 3" />
                      <circle cx={ox + loop[0].x * k} cy={oz + loop[0].z * k} r="4" fill="#22c55e" stroke="#fff" strokeWidth="1.5" />
                    </svg>
                    <div className="cs-arena-name">{t.emoji} {t.name}</div>
                    <div className="cs-muted" style={{ fontSize: 12 }}>{w.emoji} {w.label} · {t.laps} lap{t.laps === 1 ? '' : 's'}{(t.items || []).length ? ` · ${t.items.length} item${t.items.length === 1 ? '' : 's'}` : ''} · {t.rivals ?? 3} rival{(t.rivals ?? 3) === 1 ? '' : 's'}</div>
                    {t.updated && <div className="cs-muted" style={{ fontSize: 11 }}>Saved {savedAgo(t.updated)}</div>}
                    <div className="cs-row" style={{ marginTop: 8 }}>
                      <button className="cs-btn cs-btn--go cs-btn--sm" onClick={() => onPlayMyTrack?.(t)}><EmojiIcon e="▶" style={{ marginRight: '0.35em' }} />Race</button>
                      <button className="cs-btn cs-btn--sm" onClick={() => { setEditing(t); setView('track'); }}><EmojiIcon e="✏️" style={{ marginRight: '0.35em' }} />Edit</button>
                      <button className="cs-btn cs-btn--sm cs-btn--ghost" onClick={() => deleteTrack(t)} aria-label="Delete track"><EmojiIcon e="🗑️" /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="cs-section-block" id="cs-my-arenas">
          <div className="cs-section-head">
            <h2>🏟️ My arenas ({arenas.length})</h2>
            <div className="cs-row">
              <input className="cs-input" style={{ width: 230 }} placeholder="Paste a share code…" value={importCode} onChange={(e) => { setImportCode(e.target.value); setImportMsg(''); }} />
              <button className="cs-btn" disabled={!importCode.trim()} onClick={doImport}><EmojiIcon e="⬇" style={{ marginRight: '0.35em' }} />Import arena</button>
            </div>
          </div>
          {importMsg && <div className="cs-note">{importMsg}</div>}
          {arenas.length === 0 ? (
            <div className="cs-empty">No arenas yet — build your first one above! 🧱</div>
          ) : (
            <div className="cs-cardgrid">
              {arenas.map((a) => (
                <div key={a.id} className="cs-arena-card" style={{ '--t': `#${(themeFor(a.theme).floorA).toString(16).padStart(6, '0')}` }}>
                  <div className="cs-arena-mini" style={{ gridTemplateColumns: `repeat(${normaliseMap(a.map)[0].length}, 1fr)` }}>
                    {normaliseMap(a.map).join('').split('').map((c, i) => <i key={i} className={`m-${c === '#' ? 'w' : c === 'L' ? 'l' : 'f'}`}>{['G', 'F', 'S'].includes(c) ? '•' : ''}</i>)}
                  </div>
                  <div className="cs-arena-name">{a.emoji} {a.name}</div>
                  <div className="cs-muted" style={{ fontSize: 12 }}>{themeFor(a.theme).emoji} {themeFor(a.theme).name} · {GOALS[a.goal]}</div>
                  {a.updated && <div className="cs-muted" style={{ fontSize: 11 }}>Saved {savedAgo(a.updated)}</div>}
                  <div className="cs-row" style={{ marginTop: 8 }}>
                    <button className="cs-btn cs-btn--go cs-btn--sm" onClick={() => onPlayMyArena(a)}><EmojiIcon e="▶" style={{ marginRight: '0.35em' }} />Play</button>
                    <button className="cs-btn cs-btn--sm" onClick={() => { setEditing(a); setView('arena'); }}><EmojiIcon e="✏️" style={{ marginRight: '0.35em' }} />Edit</button>
                    <button className="cs-btn cs-btn--sm" onClick={() => { navigator.clipboard?.writeText(encodeArena(a)); setImportMsg(`Share code for "${a.name}" copied! 📋`); }}><EmojiIcon e="🔗" /></button>
                    <button className="cs-btn cs-btn--sm cs-btn--ghost" onClick={() => deleteArena(a)} aria-label="Delete arena"><EmojiIcon e="🗑️" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="cs-section-block" id="cs-my-robots">
          <div className="cs-section-head"><h2><EmojiIcon e="🤖" style={{ marginRight: '0.35em' }} />My robots ({designs.length})</h2></div>
          {designs.length === 0 ? (
            <div className="cs-empty">Robots you build will show up here.</div>
          ) : (
            <div className="cs-cardgrid">
              {designs.map((r) => (
                <div key={r.id} className="cs-robot-card" style={{ '--c': r.primaryColor }}>
                  <RobotThumb robot={r} />
                  <div className="cs-arena-name">{r.name}</div>
                  <div className="cs-row" style={{ marginTop: 8 }}>
                    <button className="cs-btn cs-btn--go cs-btn--sm" onClick={() => onPlayRobot(r)}><EmojiIcon e="▶" style={{ marginRight: '0.35em' }} />Play</button>
                    <button className="cs-btn cs-btn--sm" onClick={() => { setEditing(r); setView('robot'); }}><EmojiIcon e="✏️" style={{ marginRight: '0.35em' }} />Edit</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="cs-section-block">
          <div className="cs-section-head"><h2><EmojiIcon e="🎮" style={{ marginRight: '0.35em' }} />Arena Quest — 10 starter arenas</h2>
            <button className="cs-btn cs-btn--go" onClick={() => onPlayArena(BUILTIN_ARENAS[0].id)}><EmojiIcon e="▶" style={{ marginRight: '0.35em' }} />Play Arena Quest</button>
          </div>
          <div className="cs-starters">
            {BUILTIN_ARENAS.map((a, i) => (
              <button key={a.id} className="cs-starter" onClick={() => onPlayArena(a.id)}>
                <b>{i + 1}</b><span>{a.emoji}</span><small>{a.name}</small>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
