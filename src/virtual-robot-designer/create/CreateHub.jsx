/**
 * Create Studio — design your own robot or build your own game arena.
 */
import React, { useState } from 'react';
import RobotDesigner from './RobotDesigner.jsx';
import ArenaMaker, { blankArena } from './ArenaMaker.jsx';
import { BUILTIN_ARENAS, themeFor, GOALS, loadMyArenas, saveMyArenas, decodeArena, encodeArena, normaliseMap } from '../arcade/games/arena.js';
import { loadRobotLibrary } from '../services/studio-robot-store.js';
import './create.css';

export default function CreateHub({ robotConfig, onSaveRobot, onPlayRobot, onPlayArena }) {
  const [view, setView] = useState('home');
  const [editing, setEditing] = useState(null);
  const [arenas, setArenas] = useState(loadMyArenas);
  const [importCode, setImportCode] = useState('');
  const [importMsg, setImportMsg] = useState('');
  const designs = loadRobotLibrary().filter((r) => r.chassisBuildKey === 'designer' && r.design);

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

  if (view === 'robot') {
    return (
      <div className="cs-root">
        <RobotDesigner initial={editing} onBack={() => { setView('home'); setEditing(null); }}
          onSave={(cfg) => onSaveRobot(cfg)} onPlay={(cfg) => { onSaveRobot(cfg); onPlayRobot(cfg); }} />
      </div>
    );
  }
  if (view === 'arena') {
    return (
      <div className="cs-root">
        <ArenaMaker initial={editing} robotConfig={robotConfig} onBack={() => { setView('home'); setEditing(null); }}
          onSave={saveArena} onPlay={(a) => onPlayArena(a.id)} />
      </div>
    );
  }

  return (
    <div className="cs-root">
      <div className="cs-home">
        <header className="cs-hero">
          <div>
            <div className="cs-kicker">✨ CREATE STUDIO</div>
            <h1>Make it. Code it. Play it.</h1>
            <p>Design a one-of-a-kind robot, then build your own game arena for it — and share it with friends.</p>
          </div>
        </header>

        <div className="cs-bigcards">
          <button className="cs-bigcard cs-bigcard--robot" onClick={() => { setEditing(null); setView('robot'); }}>
            <span className="cs-bigcard-art">🤖</span>
            <span className="cs-bigcard-title">Design a Robot</span>
            <span className="cs-bigcard-text">Pick a body, head, eyes, arms, wheels or legs, a gadget and a pattern. Watch it come alive in 3D.</span>
            <span className="cs-bigcard-cta">Start designing →</span>
          </button>
          <button className="cs-bigcard cs-bigcard--arena" onClick={() => { setEditing(blankArena('M')); setView('arena'); }}>
            <span className="cs-bigcard-art">🏟️</span>
            <span className="cs-bigcard-title">Build an Arena</span>
            <span className="cs-bigcard-text">Paint walls, lava, gems, keys, doors, crates, bugs and portals. Choose a theme and a goal — then code your robot through it!</span>
            <span className="cs-bigcard-cta">Start building →</span>
          </button>
        </div>

        <section className="cs-section-block">
          <div className="cs-section-head">
            <h2>🏟️ My arenas</h2>
            <div className="cs-row">
              <input className="cs-input" style={{ width: 230 }} placeholder="Paste a share code…" value={importCode} onChange={(e) => { setImportCode(e.target.value); setImportMsg(''); }} />
              <button className="cs-btn" disabled={!importCode.trim()} onClick={doImport}>⬇ Import arena</button>
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
                  <div className="cs-row" style={{ marginTop: 8 }}>
                    <button className="cs-btn cs-btn--go cs-btn--sm" onClick={() => onPlayArena(a.id)}>▶ Play</button>
                    <button className="cs-btn cs-btn--sm" onClick={() => { setEditing(a); setView('arena'); }}>✏️ Edit</button>
                    <button className="cs-btn cs-btn--sm" onClick={() => { navigator.clipboard?.writeText(encodeArena(a)); setImportMsg(`Share code for "${a.name}" copied! 📋`); }}>🔗</button>
                    <button className="cs-btn cs-btn--sm cs-btn--ghost" onClick={() => deleteArena(a)} aria-label="Delete arena">🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="cs-section-block">
          <div className="cs-section-head"><h2>🤖 My designed robots</h2></div>
          {designs.length === 0 ? (
            <div className="cs-empty">Robots you design will show up here.</div>
          ) : (
            <div className="cs-cardgrid">
              {designs.map((r) => (
                <div key={r.id} className="cs-robot-card" style={{ '--c': r.primaryColor }}>
                  <div className="cs-robot-swatch"><span>🤖</span></div>
                  <div className="cs-arena-name">{r.name}</div>
                  <div className="cs-row" style={{ marginTop: 8 }}>
                    <button className="cs-btn cs-btn--go cs-btn--sm" onClick={() => onPlayRobot(r)}>▶ Play</button>
                    <button className="cs-btn cs-btn--sm" onClick={() => { setEditing(r); setView('robot'); }}>✏️ Edit</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="cs-section-block">
          <div className="cs-section-head"><h2>🎮 Arena Quest — 10 starter arenas</h2>
            <button className="cs-btn cs-btn--go" onClick={() => onPlayArena(BUILTIN_ARENAS[0].id)}>▶ Play Arena Quest</button>
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
