import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  TILE_INFO, THEMES, THEME_CATEGORIES, themeFor, GOALS, BUILTIN_ARENAS,
  checkArena, encodeArena, makeArenaGame, normaliseMap,
} from '../arcade/games/arena.js';
import { createArcadeView } from '../arcade/scene3d.js';

const TILE_GROUPS = [
  { name: 'Build', tiles: ['#', '.', 'P'] },
  { name: 'Goals', tiles: ['S', 'F', 'G', 'C'] },
  { name: 'Danger', tiles: ['L', 'H', 'V'] },
  { name: 'Gadgets', tiles: ['K', 'D', 'B', 'O', 'J', 'I'] },
];
const TIPS = {
  '#': 'Walls block the way.',
  '.': 'Floor — also works as an eraser.',
  P: 'A decoration from your world (a sunflower, a rocket, a cupcake…). It blocks the way like a wall.',
  S: 'Where your robot starts (only one).',
  F: 'The finish flag.',
  G: 'Gems to collect.',
  C: 'Coins to collect — use the "Collect every coin" goal!',
  L: 'Lava! Jump over it — or push a crate in to make a bridge.',
  H: 'A bug that walks left and right.',
  V: 'A bug that walks up and down.',
  K: 'Pick up a key to open a door.',
  D: 'A locked door. Needs a key.',
  B: 'A crate you can push.',
  O: 'Portals beam you to the other portal. Place them in pairs.',
  J: 'Bounce pad — launches the robot two squares forward!',
  I: 'Slippery ice — the robot slides until something stops it.',
};
const SIZES = { S: [10, 8], M: [14, 10], L: [18, 12] };
const EMOJIS = ['🏟️', '🏰', '🌋', '🚀', '🍭', '❄️', '🌻', '👑', '💎', '🐞', '🌀', '🔥', '🏴‍☠️', '🎂', '🌙', '🎪'];
const TIMES = [[0, 'No limit'], [60, '60 s'], [90, '90 s'], [120, '2 min']];
const hex = (n) => `#${(n ?? 0).toString(16).padStart(6, '0')}`;

export function blankArena(size = 'M') {
  const [w, h] = SIZES[size];
  const map = Array.from({ length: h }, (_, y) => Array.from({ length: w }, (_, x) => (x === 0 || y === 0 || x === w - 1 || y === h - 1 ? '#' : '.')).join(''));
  const set = (x, y, c) => { map[y] = map[y].slice(0, x) + c + map[y].slice(x + 1); };
  set(1, 1, 'S');
  set(w - 2, h - 2, 'F');
  return { id: `arena-${Date.now()}`, name: 'My Arena', emoji: '🏟️', theme: 'garden', goal: 'flag', lives: 3, time: 0, map, hint: '', custom: true };
}

/** A random "perfect" maze with gems and coins tucked into dead ends. */
function magicMaze(w, h) {
  const g = Array.from({ length: h }, () => Array(w).fill('#'));
  const cw = Math.floor((w - 1) / 2), ch = Math.floor((h - 1) / 2);
  const seen = new Set(['0,0']);
  const stack = [[0, 0]];
  g[1][1] = '.';
  while (stack.length) {
    const [cx, cy] = stack[stack.length - 1];
    const n = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => [cx + dx, cy + dy, dx, dy]).filter(([x, y]) => x >= 0 && y >= 0 && x < cw && y < ch && !seen.has(`${x},${y}`));
    if (!n.length) { stack.pop(); continue; }
    const [nx, ny, dx, dy] = n[Math.floor(Math.random() * n.length)];
    seen.add(`${nx},${ny}`);
    g[1 + cy * 2 + dy][1 + cx * 2 + dx] = '.';
    g[1 + ny * 2][1 + nx * 2] = '.';
    stack.push([nx, ny]);
  }
  // A few extra holes make loops, which feel friendlier
  for (let i = 0; i < Math.floor((w * h) / 40); i++) {
    const x = 1 + Math.floor(Math.random() * (w - 2)), y = 1 + Math.floor(Math.random() * (h - 2));
    if (g[y][x] === '#' && ((g[y][x - 1] === '.' && g[y][x + 1] === '.') || (g[y - 1]?.[x] === '.' && g[y + 1]?.[x] === '.'))) g[y][x] = '.';
  }
  // Farthest square from the start gets the flag; dead ends get treasure
  const dist = new Map([['1,1', 0]]);
  const q = [[1, 1]];
  let far = [1, 1];
  while (q.length) {
    const [x, y] = q.shift();
    [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
      const nx = x + dx, ny = y + dy;
      if (g[ny]?.[nx] === '.' && !dist.has(`${nx},${ny}`)) { dist.set(`${nx},${ny}`, dist.get(`${x},${y}`) + 1); q.push([nx, ny]); if (dist.get(`${nx},${ny}`) > dist.get(`${far[0]},${far[1]}`)) far = [nx, ny]; }
    });
  }
  g[1][1] = 'S';
  g[far[1]][far[0]] = 'F';
  let k = 0;
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    if (g[y][x] !== '.') continue;
    const exits = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => g[y + dy][x + dx] !== '#').length;
    if (exits === 1) g[y][x] = k++ % 2 ? 'C' : 'G';
  }
  return g.map((r) => r.join(''));
}

function ArenaPreview({ arena, robotConfig, big }) {
  const hostRef = useRef(null);
  useEffect(() => {
    if (!hostRef.current) return undefined;
    let view = null;
    let raf;
    const timer = setTimeout(() => {
      const game = makeArenaGame([{ ...arena, map: normaliseMap(arena.map) }]);
      const world = game.init(0);
      const look = { primary: robotConfig?.primaryColor || '#6366f1', accent: robotConfig?.accentColor || '#facc15', led: robotConfig?.ledColor || '#5eead4' };
      view = createArcadeView(hostRef.current, game, world, look, robotConfig || { chassisId: 'rover' });
      const loop = (now) => { view?.update(world, now / 1000); raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop);
    }, 700);
    return () => { clearTimeout(timer); cancelAnimationFrame(raf); view?.dispose(); };
  }, [arena, robotConfig]);
  return <div ref={hostRef} className={`cs-arena3d${big ? ' is-big' : ''}`} aria-label="3D preview of your arena" />;
}

function WorldPicker({ value, onPick, onClose }) {
  const [cat, setCat] = useState(themeFor(value).cat);
  return (
    <div className="cs-modal-bg" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="cs-modal" role="dialog" aria-label="Choose a world">
        <div className="cs-modal-head">
          <b>🌍 Choose a world</b>
          <span className="cs-muted">Each world is a full 3D scene from Robot Studio.</span>
          <button className="cs-btn cs-btn--ghost cs-btn--sm" onClick={onClose}>✕</button>
        </div>
        <div className="cs-chips" style={{ padding: '0 16px' }}>
          {THEME_CATEGORIES.map((c) => <button key={c} className={`cs-chip${cat === c ? ' is-on' : ''}`} onClick={() => setCat(c)}>{c}</button>)}
        </div>
        <div className="cs-world-grid">
          {Object.entries(THEMES).filter(([, t]) => t.cat === cat).map(([id, t]) => (
            <button key={id} className={`cs-world${value === id ? ' is-on' : ''}`} onClick={() => { onPick(id); onClose(); }}
              style={{ '--a': hex(t.floorA), '--b': hex(t.wall), '--sky': hex(t.sky) }}>
              <span className="cs-world-art"><i>{t.emoji}</i></span>
              <b>{t.name}</b>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ArenaMaker({ initial, robotConfig, onSave, onPlay, onBack }) {
  const [arena, setArena] = useState(() => ({ time: 0, ...(initial || blankArena('M')) }));
  const [tile, setTile] = useState('#');
  const [tool, setTool] = useState('paint');
  const [painting, setPainting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [worldOpen, setWorldOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [bigPreview, setBigPreview] = useState(false);
  const [copied, setCopied] = useState(false);
  const history = useRef({ past: [], future: [] });
  const map = useMemo(() => normaliseMap(arena.map), [arena.map]);
  const check = useMemo(() => checkArena(arena), [arena]);
  const theme = themeFor(arena.theme);
  const H = map.length, W = map[0].length;

  const snapshot = () => { history.current.past.push(arena.map); if (history.current.past.length > 60) history.current.past.shift(); history.current.future = []; };
  const update = (patch, record = false) => { if (record) snapshot(); setArena((a) => ({ ...a, ...patch })); setSaved(false); };
  const undo = () => { const h = history.current; if (!h.past.length) return; h.future.push(arena.map); update({ map: h.past.pop() }); };
  const redo = () => { const h = history.current; if (!h.future.length) return; h.past.push(arena.map); update({ map: h.future.pop() }); };

  const setCell = (rows, x, y, c) => { rows[y] = rows[y].slice(0, x) + c + rows[y].slice(x + 1); };
  const paint = (x, y) => {
    setArena((a) => {
      const rows = normaliseMap(a.map).slice();
      if (rows[y][x] === tile) return a;
      if (tile === 'S') for (let j = 0; j < rows.length; j++) rows[j] = rows[j].replace(/S/g, '.');
      setCell(rows, x, y, tile);
      return { ...a, map: rows };
    });
    setSaved(false);
  };
  const fill = (x, y) => {
    snapshot();
    setArena((a) => {
      const rows = normaliseMap(a.map).slice();
      const from = rows[y][x];
      if (from === tile || tile === 'S') return a;
      const q = [[x, y]];
      const seen = new Set();
      while (q.length) {
        const [cx, cy] = q.pop();
        const k = `${cx},${cy}`;
        if (seen.has(k) || rows[cy]?.[cx] !== from) continue;
        seen.add(k);
        setCell(rows, cx, cy, tile);
        q.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
      }
      return { ...a, map: rows };
    });
    setSaved(false);
  };
  const sprinkle = () => {
    snapshot();
    const rows = map.slice();
    const free = [];
    rows.forEach((r, y) => [...r].forEach((c, x) => { if (c === '.') free.push([x, y]); }));
    for (let i = 0; i < Math.min(6, free.length); i++) {
      const [x, y] = free.splice(Math.floor(Math.random() * free.length), 1)[0];
      setCell(rows, x, y, i % 2 ? 'C' : 'G');
    }
    update({ map: rows });
  };
  const resize = (size) => { snapshot(); update({ map: blankArena(size).map }); };
  const clearAll = () => { if (window.confirm('Clear the whole arena?')) { snapshot(); update({ map: blankArena(W <= 10 ? 'S' : W <= 14 ? 'M' : 'L').map }); } };
  const save = () => { onSave(arena); setSaved(true); };
  const code = useMemo(() => encodeArena(arena), [arena]);

  useEffect(() => {
    const stop = () => setPainting(false);
    const keys = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); if (e.shiftKey) redo(); else undo(); }
    };
    window.addEventListener('pointerup', stop);
    window.addEventListener('keydown', keys);
    return () => { window.removeEventListener('pointerup', stop); window.removeEventListener('keydown', keys); };
  });

  const cellStyle = (c, x, y) => {
    if (c === '#') return { background: hex(theme.wall) };
    if (c === 'L') return { background: 'linear-gradient(135deg, #f97316, #ef4444)' };
    if (c === 'I') return { background: 'linear-gradient(135deg, #e0f2fe, #7dd3fc)' };
    return { background: hex((x + y) % 2 ? theme.floorA : theme.floorB) };
  };

  return (
    <div className="cs-maker">
      {worldOpen && <WorldPicker value={arena.theme} onPick={(id) => update({ theme: id })} onClose={() => setWorldOpen(false)} />}
      {templateOpen && (
        <div className="cs-modal-bg" onMouseDown={(e) => { if (e.target === e.currentTarget) setTemplateOpen(false); }}>
          <div className="cs-modal" role="dialog" aria-label="Start from a template">
            <div className="cs-modal-head"><b>📋 Start from a template</b><button className="cs-btn cs-btn--ghost cs-btn--sm" onClick={() => setTemplateOpen(false)}>✕</button></div>
            <div className="cs-world-grid">
              {BUILTIN_ARENAS.map((t) => (
                <button key={t.id} className="cs-world" style={{ '--a': hex(themeFor(t.theme).floorA), '--b': hex(themeFor(t.theme).wall), '--sky': hex(themeFor(t.theme).sky) }}
                  onClick={() => { snapshot(); update({ map: t.map.slice(), goal: t.goal, theme: themeFor(t.theme) === THEMES[t.theme] ? t.theme : arena.theme, hint: t.hint }); setTemplateOpen(false); }}>
                  <span className="cs-world-art"><i>{t.emoji}</i></span><b>{t.name}</b>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="cs-topbar">
        <button className="cs-btn cs-btn--ghost" onClick={onBack}>← Create Studio</button>
        <div className="cs-topbar-title">🏟️ Arena Maker</div>
        <div className="cs-row">
          <button className="cs-btn" onClick={() => setShareOpen((v) => !v)}>🔗 Share</button>
          <button className="cs-btn cs-btn--primary" onClick={save}>{saved ? '✅ Saved' : '💾 Save'}</button>
          <button className="cs-btn cs-btn--go" disabled={!check.ok} onClick={() => { onSave(arena); onPlay(arena); }} title={check.ok ? 'Play your arena' : 'Fix the problems first'}>▶ Play it!</button>
        </div>
      </div>

      {shareOpen && (
        <div className="cs-share">
          <div><b>Share code</b> — friends paste this into <i>Import arena</i> in their Create Studio.</div>
          <div className="cs-row" style={{ flexWrap: 'nowrap' }}>
            <input className="cs-input" readOnly value={code} onFocus={(e) => e.target.select()} />
            <button className="cs-btn" onClick={() => { navigator.clipboard?.writeText(code).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }); }}>{copied ? '✅ Copied' : 'Copy'}</button>
          </div>
        </div>
      )}

      <div className={`cs-maker-body${bigPreview ? ' is-bigpreview' : ''}`}>
        <aside className="cs-panel cs-maker-left">
          <div className="cs-label" style={{ marginTop: 0 }}>World</div>
          <button className="cs-world-current" onClick={() => setWorldOpen(true)} style={{ '--a': hex(theme.floorA), '--b': hex(theme.wall), '--sky': hex(theme.sky) }}>
            <span className="cs-world-art"><i>{theme.emoji}</i></span>
            <span><b>{theme.name}</b><small>{theme.cat} · tap to change</small></span>
          </button>
          <div className="cs-label">Name</div>
          <div className="cs-row" style={{ flexWrap: 'nowrap' }}>
            <select className="cs-input cs-emoji-select" value={arena.emoji} onChange={(e) => update({ emoji: e.target.value })} aria-label="Arena icon">
              {EMOJIS.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
            <input className="cs-input" value={arena.name} maxLength={24} onChange={(e) => update({ name: e.target.value })} aria-label="Arena name" />
          </div>
          <div className="cs-label">Goal</div>
          <div className="cs-chips">
            {Object.entries(GOALS).map(([id, label]) => (
              <button key={id} className={`cs-chip${arena.goal === id ? ' is-on' : ''}`} onClick={() => update({ goal: id })}>{({ flag: '🏁', gems: '💎', both: '💎🏁', coins: '🪙' })[id]} {label}</button>
            ))}
          </div>
          <div className="cs-row" style={{ gap: 14, alignItems: 'flex-start' }}>
            <div>
              <div className="cs-label">Lives</div>
              <div className="cs-chips">{[1, 2, 3].map((n) => <button key={n} className={`cs-chip${arena.lives === n ? ' is-on' : ''}`} onClick={() => update({ lives: n })}>{'❤️'.repeat(n)}</button>)}</div>
            </div>
            <div>
              <div className="cs-label">Size</div>
              <div className="cs-chips">{Object.keys(SIZES).map((sz) => <button key={sz} className={`cs-chip${W === SIZES[sz][0] ? ' is-on' : ''}`} onClick={() => { if (W === SIZES[sz][0] || window.confirm('Changing size starts a fresh arena (you can Undo). OK?')) resize(sz); }}>{sz}</button>)}</div>
            </div>
          </div>
          <div className="cs-label">Time limit</div>
          <div className="cs-chips">{TIMES.map(([v, l]) => <button key={v} className={`cs-chip${(arena.time || 0) === v ? ' is-on' : ''}`} onClick={() => update({ time: v })}>⏱ {l}</button>)}</div>
          <div className="cs-label">Hint for players (optional)</div>
          <input className="cs-input" value={arena.hint || ''} maxLength={90} placeholder="e.g. Grab the key first!" onChange={(e) => update({ hint: e.target.value })} />
        </aside>

        <section className="cs-panel cs-maker-center">
          {TILE_GROUPS.map((g) => (
            <div key={g.name} className="cs-tilegroup">
              <span className="cs-tilegroup-name">{g.name}</span>
              <div className="cs-tilebar">
                {g.tiles.map((t) => (
                  <button key={t} className={`cs-tilepick${tile === t ? ' is-on' : ''}`} onClick={() => setTile(t)} title={TIPS[t]}>
                    <span>{t === 'P' ? theme.emoji : TILE_INFO[t].emoji}</span><small>{TILE_INFO[t].name}</small>
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className="cs-toolbar">
            <button className={`cs-btn cs-btn--sm${tool === 'paint' ? ' cs-btn--on' : ''}`} onClick={() => setTool('paint')}>✏️ Paint</button>
            <button className={`cs-btn cs-btn--sm${tool === 'fill' ? ' cs-btn--on' : ''}`} onClick={() => setTool('fill')}>🪣 Fill</button>
            <button className="cs-btn cs-btn--sm" onClick={undo} disabled={!history.current.past.length} title="Undo (Ctrl/Cmd+Z)">↩️ Undo</button>
            <button className="cs-btn cs-btn--sm" onClick={redo} disabled={!history.current.future.length}>↪️ Redo</button>
            <span className="cs-toolbar-sep" />
            <button className="cs-btn cs-btn--sm" onClick={() => { snapshot(); update({ map: magicMaze(W, H) }); }}>🎲 Magic maze</button>
            <button className="cs-btn cs-btn--sm" onClick={sprinkle}>✨ Sprinkle treasure</button>
            <button className="cs-btn cs-btn--sm" onClick={() => setTemplateOpen(true)}>📋 Templates</button>
            <button className="cs-btn cs-btn--sm cs-btn--ghost" onClick={clearAll}>🧹 Clear</button>
          </div>
          <div className="cs-tiletip">{tile === 'P' ? theme.emoji : TILE_INFO[tile].emoji} {TIPS[tile]} {tool === 'fill' ? <b>(Fill mode: tap an area to fill it)</b> : null}</div>
          <div className="cs-grid" style={{ gridTemplateColumns: `repeat(${W}, 1fr)`, aspectRatio: `${W} / ${H}` }}
            onPointerLeave={() => setPainting(false)}>
            {map.map((row, y) => [...row].map((c, x) => (
              <button key={`${x},${y}`} className="cs-cell" style={cellStyle(c, x, y)}
                onPointerDown={(e) => { e.preventDefault(); if (tool === 'fill') { fill(x, y); return; } snapshot(); setPainting(true); paint(x, y); }}
                onPointerEnter={() => { if (painting && tool === 'paint') paint(x, y); }}
                aria-label={`${TILE_INFO[c]?.name || 'Floor'} at ${x + 1}, ${y + 1}`}>
                {c === 'P' ? theme.emoji : (c !== '#' && c !== '.' && c !== 'L' && c !== 'I' ? TILE_INFO[c]?.emoji : '')}
              </button>
            )))}
          </div>
          <div className="cs-row" style={{ marginTop: 10 }}>
            <span className={`cs-check ${check.ok ? 'is-ok' : 'is-bad'}`}>
              {check.ok ? '✅ Your arena can be finished!' : `⚠️ ${check.problems[0]}`}
            </span>
          </div>
        </section>

        <aside className="cs-panel cs-maker-right">
          <div className="cs-row" style={{ justifyContent: 'space-between' }}>
            <div className="cs-card-title">3D preview</div>
            <button className="cs-btn cs-btn--sm" onClick={() => setBigPreview((v) => !v)}>{bigPreview ? '↙ Smaller' : '↗ Bigger'}</button>
          </div>
          <ArenaPreview arena={arena} robotConfig={robotConfig} big={bigPreview} />
          <p className="cs-muted" style={{ marginTop: 8 }}>
            Your robot codes its way through with blocks like <b>Move</b>, <b>Jump</b> and <b>If lava ahead</b>.
          </p>
        </aside>
      </div>
    </div>
  );
}
