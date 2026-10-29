/**
 * MissionMode — story missions where your code drives a live scene.
 *
 * Hub (worlds) → campaign map (5 missions on a route) → mission cockpit
 * (briefing + objectives · code · live scene + mission log) → success.
 */
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useUser } from '../contexts/UserContext';
import { CAMPAIGNS, genPyFromBlocks, pyToBlocks } from './missions/missionData.js';
import { PLANS, checkObjectives } from './missions/missionPlans.js';
import MissionScene, { CAMPAIGN_BG, Rocket, Sub, Dino } from './missions/MissionScenes.jsx';
import { MissionBlockEditor, CertificateModal } from './missions/legacyParts.jsx';
import { runPython as runSkulpt } from './learn/CodingLab/TextCodingLab.jsx';
import { runPython as runSubset } from '../utils/pythonRunner';
import DotBot from './learn/art/DotBot.jsx';
import { readWork, recordWork } from '../utils/workLog.js';
import { EmojiIcon, IconText } from './ui/Icon.jsx';
import { useTheme } from '../contexts/ThemeContext';

const PROGRESS_KEY = 'bb-mission-progress';
const MISSION_TOTAL = CAMPAIGNS.reduce((n, c) => n + c.missions.length, 0);

/** Pupils write the code themselves: Blocks start empty, except the Dino Park
 *  debugging missions, whose whole job is fixing the broken program they start with. */
const starterBlocks = (id, starter) => (id.startsWith('dino-') ? pyToBlocks(starter) : []);
const textHash = (t) => { let x = 5381; for (const ch of String(t).replace(/\s+/g, ' ').trim()) x = ((x * 33) ^ ch.codePointAt(0)) >>> 0; return x.toString(36); };
// The pre-written starters missions used to begin with (before pupils wrote everything themselves)
const OLD_STARTERS = new Set(['dvwizx', '17hdq5p', '15j74kx', '1cm3ufx', 'axz2h4', 'o9h5e', 'bqi0or', '121lki2', '1wuzync', '1ixf0t1', '1r8ui0o', '7vk5rf', '1kedcu0', '1nbcjfx', '1dh2sek', '10yz1k3', 'wwmd5p', '2va5vy', '1v4wnfk', '1uqujhf']);
const STARS_KEY = 'bb-mission-stars';
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k) || '') || d; } catch { return d; } };
const FONT = '"Nunito", "Inter", system-ui, sans-serif';

const WORLD = {
  space: { badge: '🚀', place: 'the Nova Galaxy', node: '🪐', action: 'Launch', pathBg: '#1e1b4b' },
  ocean: { badge: '🔱', place: 'the Coral Deep', node: '🫧', action: 'Dive', pathBg: '#082f49' },
  city: { badge: '🏙️', place: 'Byte City', node: '🏗️', action: 'Build', pathBg: '#431407' },
  cyber: { badge: '🛡️', place: 'the Grid', node: '🔒', action: 'Hack', pathBg: '#022c22' },
  jungle: { badge: '🌿', place: 'the Emerald Rainforest', node: '🌴', action: 'Explore', pathBg: '#052e16' },
  dino: { badge: '🦕', place: 'Dino Park', node: '🥚', action: 'Fix', pathBg: '#042f2e' },
};

function Starfield() {
  const stars = useMemo(() => Array.from({ length: 70 }, (_, i) => ({ x: (i * 137.5) % 100, y: (i * 61.8) % 100, s: (i % 3) + 1, d: (i % 5) + 2 })), []);
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {stars.map((st, i) => (
        <span key={i} style={{ position: 'absolute', left: `${st.x}%`, top: `${st.y}%`, width: st.s, height: st.s, borderRadius: '50%', background: '#fff', opacity: 0.6, animation: `mm-twinkle ${st.d}s ${i * 0.1}s infinite` }} />
      ))}
    </div>
  );
}

function Ring({ pct, color, size = 64, children }) {
  const r = size / 2 - 5; const c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(var(--mm-ink),0.15)" strokeWidth="6" fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} style={{ transition: 'stroke-dashoffset .8s' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 14, color: 'var(--mm-text)' }}>{children}</div>
    </div>
  );
}

function WorldArt({ id }) {
  const Bg = CAMPAIGN_BG[id];
  return (
    <svg viewBox="0 0 400 260" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{ display: 'block' }}>
      <style>{'@keyframes ms-twinkle{0%,100%{opacity:.25}50%{opacity:1}}@keyframes ms-bubble{0%{transform:translateY(0);opacity:.8}100%{transform:translateY(-120px);opacity:0}}@keyframes ms-swim{0%{transform:translateX(-60px)}100%{transform:translateX(460px)}}@keyframes ms-flame{0%,100%{transform:scaleY(1)}50%{transform:scaleY(1.35)}}@keyframes mm-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}'}</style>
      <Bg depth={0.4} night={id === 'city'} />
      {id === 'space' && (<>
        <circle cx="300" cy="90" r="46" fill="#f97316" /><ellipse cx="300" cy="90" rx="74" ry="14" fill="none" stroke="#fdba74" strokeWidth="5" />
        <g style={{ animation: 'mm-float 3s ease-in-out infinite' }}><Rocket x={120} y={150} flame rot={30} scale={1.3} /></g>
      </>)}
      {id === 'ocean' && (<g style={{ animation: 'mm-float 4s ease-in-out infinite' }}><Sub x={200} y={140} lights /></g>)}
      {id === 'city' && [[20, 50, 120], [80, 40, 170], [130, 56, 100], [196, 44, 200], [250, 60, 140], [320, 50, 110]].map(([x, w, h], i) => (
        <g key={i}><rect x={x} y={234 - h} width={w} height={h} fill={['#4338ca', '#0e7490', '#7c3aed', '#be185d', '#0369a1', '#4f46e5'][i]} />
          {Array.from({ length: Math.floor(h / 20) * 2 }, (_, k) => <rect key={k} x={x + 8 + (k % 2) * (w / 2)} y={240 - h + Math.floor(k / 2) * 20} width="8" height="9" fill="#fde047" opacity={(k + i) % 3 ? 0.9 : 0.25} />)}</g>
      ))}
      {id === 'jungle' && (<g style={{ animation: 'mm-float 3.5s ease-in-out infinite' }}>
        <path d="M150 230 q 10 -60 50 -90 q 40 30 50 90 Z" fill="#a16207" /><rect x="186" y="170" width="28" height="60" fill="#78350f" />
        <path d="M120 160 q 80 -70 160 0" fill="none" stroke="#facc15" strokeWidth="6" strokeLinecap="round" />
        <circle cx="290" cy="80" r="16" fill="#ef4444" /><path d="M300 78 l 18 -4 l -14 10 Z" fill="#facc15" /><circle cx="286" cy="76" r="3" fill="#0f172a" />
      </g>)}
      {id === 'dino' && (<g style={{ animation: 'mm-float 3s ease-in-out infinite' }}><Dino x={190} y={200} color="#2dd4bf" scale={2.2} /></g>)}
      {id === 'cyber' && (<g transform="translate(200 130)" style={{ animation: 'mm-float 3s ease-in-out infinite' }}>
        <path d="M-34 -10 V -36 a34 34 0 0 1 68 0 V -10" fill="none" stroke="#34d399" strokeWidth="10" />
        <rect x="-50" y="-12" width="100" height="74" rx="12" fill="#064e3b" stroke="#34d399" strokeWidth="3" />
        <circle cy="16" r="10" fill="#34d399" /><rect x="-4" y="18" width="8" height="22" rx="3" fill="#34d399" />
      </g>)}
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
/** #missions/<campaign>/<mission> deep links (used by classroom assignments). */
function routeFrom(subPath) {
  const [cid, mid] = String(subPath || '').split('/');
  const c = CAMPAIGNS.find((x) => x.id === cid);
  if (!c) return { campId: null, missionId: null };
  return { campId: c.id, missionId: c.missions.some((m) => m.id === mid) ? mid : null };
}

export default function MissionMode({ subPath = '' }) {
  const { user, addXP } = useUser();
  const [progress, setProgress] = useState(() => load(PROGRESS_KEY, {}));
  const [stars, setStars] = useState(() => load(STARS_KEY, {}));
  const [campId, setCampId] = useState(() => routeFrom(subPath).campId);
  const [missionId, setMissionId] = useState(() => routeFrom(subPath).missionId);

  useEffect(() => {
    const r = routeFrom(subPath);
    if (r.campId) { setCampId(r.campId); setMissionId(r.missionId); }
  }, [subPath]);
  const [showCert, setShowCert] = useState(null);

  useEffect(() => {
    document.documentElement.classList.add('whitepaper-open');
    return () => document.documentElement.classList.remove('whitepaper-open');
  }, []);
  useEffect(() => { window.scrollTo(0, 0); }, [campId, missionId]);

  const camp = CAMPAIGNS.find((c) => c.id === campId);
  const doneIn = (cid) => progress[cid]?.completed || [];
  const isDone = (cid, mid) => doneIn(cid).includes(mid);
  const unlocked = (c, i) => i === 0 || isDone(c.id, c.missions[i - 1].id);
  const totalDone = CAMPAIGNS.reduce((s, c) => s + doneIn(c.id).length, 0);
  const totalXP = CAMPAIGNS.reduce((s, c) => s + c.missions.filter((m) => isDone(c.id, m.id)).reduce((a, m) => a + m.xp, 0), 0);
  const totalStars = Object.values(stars).reduce((a, b) => a + b, 0);

  const complete = (c, m, earned) => {
    setStars((prev) => {
      const next = { ...prev, [m.id]: Math.max(prev[m.id] || 0, earned) };
      localStorage.setItem(STARS_KEY, JSON.stringify(next));
      return next;
    });
    if (isDone(c.id, m.id)) return;
    const completed = [...doneIn(c.id), m.id];
    const campaignComplete = completed.length >= c.missions.length;
    const next = { ...progress, [c.id]: { completed, campaignComplete } };
    setProgress(next);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
    addXP?.(m.xp);
    if (campaignComplete) setTimeout(() => setShowCert(c), 2600);
  };

  const light = useTheme()?.theme === 'light';
  const shell = (inner, bg = 'radial-gradient(ellipse at top, #1e1b4b 0%, #0b0f24 55%, #050712 100%)') => (
    <div style={{ position: 'relative', minHeight: '100%', width: '100%', background: light ? (camp ? `linear-gradient(165deg, ${camp.color}2e 0%, #f5f7fc 55%)` : 'var(--mm-bg)') : bg, color: 'var(--mm-text)', fontFamily: FONT, overflowX: 'hidden' }}>
      <style>{`
        @keyframes mm-twinkle { 0%,100% { opacity: .2 } 50% { opacity: .9 } }
        @keyframes mm-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }
        @keyframes mm-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(250,204,21,.6) } 70% { box-shadow: 0 0 0 16px rgba(250,204,21,0) } }
        @keyframes mm-in { from { opacity: 0; transform: translateY(14px) } to { opacity: 1; transform: none } }
        @keyframes mm-pop { 0% { transform: scale(.6); opacity: 0 } 70% { transform: scale(1.08) } 100% { transform: scale(1); opacity: 1 } }
        @keyframes mm-confetti { to { transform: translateY(110vh) rotate(720deg); } }
        .mm-card { transition: transform .2s, box-shadow .2s; }
        .mm-card:hover { transform: translateY(-6px); }
        .mm-btn { transition: transform .12s, filter .12s; }
        .mm-btn:hover { filter: brightness(1.1); } .mm-btn:active { transform: scale(.97); }
        .mm-cockpit { display: grid; grid-template-columns: minmax(260px, 330px) minmax(0, 1fr) minmax(320px, 440px); gap: 16px; }
        @media (max-width: 1180px) { .mm-cockpit { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); } .mm-cockpit > :first-child { grid-column: 1 / -1; } }
        @media (max-width: 760px) { .mm-cockpit { grid-template-columns: 1fr; } }
      `}</style>
      {!light && <Starfield />}
      <div style={{ position: 'relative' }}>{inner}</div>
      {showCert && <CertificateModal campaign={showCert} studentName={user?.name || user?.displayName || 'Coder'} onClose={() => setShowCert(null)} />}
    </div>
  );

  // ── Mission cockpit ──
  if (camp && missionId) {
    const idx = camp.missions.findIndex((m) => m.id === missionId);
    return shell(
      <MissionCockpit
        key={missionId}
        camp={camp}
        mission={camp.missions[idx]}
        index={idx}
        bestStars={stars[missionId] || 0}
        onBack={() => setMissionId(null)}
        onComplete={(earned) => complete(camp, camp.missions[idx], earned)}
        onNext={idx + 1 < camp.missions.length ? () => setMissionId(camp.missions[idx + 1].id) : null}
      />,
      camp.bg,
    );
  }

  // ── Campaign map ──
  if (camp) {
    return shell(<CampaignMap camp={camp} isDone={isDone} unlocked={unlocked} stars={stars} onBack={() => setCampId(null)} onOpen={setMissionId} />, camp.bg);
  }

  // ── Hub ──
  const next = CAMPAIGNS.map((c) => ({ c, i: c.missions.findIndex((m) => !isDone(c.id, m.id)) })).find((x) => x.i >= 0);
  return shell(
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '28px 20px 60px' }}>
      {/* Hero */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: 24, alignItems: 'center', marginBottom: 28 }}>
        <div style={{ animation: 'mm-in .5s' }}>
          <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center', padding: '6px 14px', borderRadius: 999, background: 'rgba(250,204,21,0.12)', border: '1px solid rgba(250,204,21,0.4)', color: 'var(--mm-yellow)', fontWeight: 800, fontSize: 13, letterSpacing: 1 }}><EmojiIcon e="🛰️" style={{ marginRight: '0.35em' }} />MISSION CONTROL</div>
          <h1 style={{ fontSize: 'clamp(34px, 5vw, 58px)', lineHeight: 1.05, margin: '14px 0 10px', fontWeight: 900 }}>
            Your code. <span style={{ background: 'linear-gradient(90deg,#fde047,#f472b6,#818cf8)', WebkitBackgroundClip: 'text', color: 'transparent' }}>Real missions.</span>
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(var(--mm-ink),0.75)', maxWidth: 620, margin: 0, lineHeight: 1.6 }}>
            Launch rockets, steer submarines, power up cities and crack cyber vaults. Every mission is a story — and the program you write makes it happen on screen.
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20 }}>
            {next && (
              <button type="button" className="mm-btn" onClick={() => { setCampId(next.c.id); setMissionId(next.c.missions[next.i].id); }}
                style={{ minHeight: 52, padding: '0 24px', borderRadius: 16, border: 'none', background: 'linear-gradient(90deg,#facc15,#f97316)', color: '#1c1917', fontWeight: 900, fontSize: 17, cursor: 'pointer', animation: 'mm-pulse 2.2s infinite' }}>
                <EmojiIcon e="▶" style={{ marginRight: '0.35em' }} />{totalDone ? 'Continue' : 'Start'}: {next.c.missions[next.i].title}
              </button>
            )}
          </div>
        </div>
        <svg viewBox="-20 -16 140 190" width="170" style={{ animation: 'mm-float 3.2s ease-in-out infinite', filter: 'drop-shadow(0 12px 24px rgba(0,0,0,.5))' }}><DotBot pose="wave" /></svg>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 30 }}>
        {[['🎯', 'Missions', `${totalDone} / ${MISSION_TOTAL}`], ['⭐', 'Stars', `${totalStars} / ${MISSION_TOTAL * 3}`], ['⚡', 'Mission XP', totalXP], ['🏅', 'Worlds saved', `${CAMPAIGNS.filter((c) => progress[c.id]?.campaignComplete).length} / ${CAMPAIGNS.length}`]].map(([i, k, v]) => (
          <div key={k} style={{ padding: '14px 16px', borderRadius: 18, background: 'rgba(var(--mm-ink),0.06)', border: '1px solid rgba(var(--mm-ink),0.12)', backdropFilter: 'blur(6px)' }}>
            <div style={{ fontSize: 13, color: 'rgba(var(--mm-ink),0.6)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}><EmojiIcon e={i} />{k}</div>
            <div style={{ fontSize: 26, fontWeight: 900 }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Worlds */}
      <h2 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 14px' }}>Choose your world</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
        {CAMPAIGNS.map((c, ci) => {
          const n = doneIn(c.id).length; const pct = n / c.missions.length;
          const campStars = c.missions.reduce((a, m) => a + (stars[m.id] || 0), 0);
          return (
            <button key={c.id} type="button" className="mm-card" onClick={() => setCampId(c.id)}
              style={{ textAlign: 'left', padding: 0, borderRadius: 24, overflow: 'hidden', cursor: 'pointer', border: `2px solid ${c.color}66`, background: 'var(--mm-card)', color: 'var(--mm-text)', boxShadow: `0 18px 40px ${c.glow}`, animation: `mm-in .5s ${ci * 0.08}s both`, fontFamily: FONT }}>
              <div style={{ height: 170, position: 'relative' }}>
                <WorldArt id={c.id} />
                <span style={{ position: 'absolute', top: 12, left: 12, padding: '4px 10px', borderRadius: 999, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 12, fontWeight: 800 }}>{c.difficulty}</span>
                {progress[c.id]?.campaignComplete && <span style={{ position: 'absolute', top: 12, right: 12, padding: '4px 10px', borderRadius: 999, background: '#16a34a', color: '#fff', fontSize: 12, fontWeight: 900 }}>✓ Saved!</span>}
              </div>
              <div style={{ padding: '16px 18px 18px', display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 22, fontWeight: 900 }}><EmojiIcon e={c.emoji} style={{ marginRight: '0.3em' }} />{c.title}</div>
                  <div style={{ fontSize: 14, color: 'rgba(var(--mm-ink),0.7)', margin: '2px 0 8px' }}>{c.tagline}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, fontWeight: 800, padding: '3px 9px', borderRadius: 999, background: `${c.color}33`, color: 'var(--mm-text)' }}>{c.concept}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, padding: '3px 9px', borderRadius: 999, background: 'rgba(250,204,21,0.15)', color: 'var(--mm-yellow)' }}>⭐ {campStars}/15</span>
                  </div>
                </div>
                <Ring pct={pct} color={c.color}>{n}/5</Ring>
              </div>
            </button>
          );
        })}
      </div>

      {/* Badges */}
      <h2 style={{ fontSize: 24, fontWeight: 900, margin: '34px 0 14px' }}>Badges</h2>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {[
          ['🌟', 'First mission', totalDone >= 1],
          ['🔟', '10 missions', totalDone >= 10],
          ...CAMPAIGNS.map((c) => [WORLD[c.id].badge, `${c.title} hero`, !!progress[c.id]?.campaignComplete]),
          ['💯', `All ${MISSION_TOTAL * 3} stars`, totalStars >= MISSION_TOTAL * 3],
        ].map(([i, k, on]) => (
          <div key={k} title={k} style={{ width: 104, padding: '12px 8px', borderRadius: 18, textAlign: 'center', background: on ? 'linear-gradient(160deg, rgba(250,204,21,.25), rgba(249,115,22,.15))' : 'rgba(var(--mm-ink),0.04)', border: `1px solid ${on ? '#facc15' : 'rgba(var(--mm-ink),0.1)'}`, opacity: on ? 1 : 0.5 }}>
            <div style={{ fontSize: 32, filter: on ? 'none' : 'grayscale(1)' }}>{i}</div>
            <div style={{ fontSize: 12, fontWeight: 800, marginTop: 4 }}>{k}</div>
          </div>
        ))}
      </div>
    </div>,
  );
}

// ── Campaign map ───────────────────────────────────────────────────────────
function CampaignMap({ camp, isDone, unlocked, stars, onBack, onOpen }) {
  const firstOpen = camp.missions.findIndex((m, i) => unlocked(camp, i) && !isDone(camp.id, m.id));
  const [sel, setSel] = useState(firstOpen >= 0 ? firstOpen : 0);
  const m = camp.missions[sel];
  const pts = [[90, 330], [270, 230], [470, 300], [650, 170], [830, 90]];
  const path = `M${pts.map((p) => p.join(' ')).join(' L ')}`;
  const w = WORLD[camp.id];
  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '22px 20px 60px' }}>
      <button type="button" className="mm-btn" onClick={onBack} style={backBtn}>← All worlds</button>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap', margin: '14px 0 16px' }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: camp.color, letterSpacing: 1 }}>{camp.concept.toUpperCase()} · {camp.difficulty.toUpperCase()}</div>
          <h1 style={{ fontSize: 'clamp(30px, 4vw, 46px)', fontWeight: 900, margin: '4px 0' }}><EmojiIcon e={camp.emoji} style={{ marginRight: '0.3em' }} />{camp.title}</h1>
          <p style={{ margin: 0, color: 'rgba(var(--mm-ink),0.75)', fontSize: 17 }}>Five missions across {w.place}. Finish them all to save the world and earn your certificate.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(280px, 360px)', gap: 18 }} className="mm-mapgrid">
        <style>{'@media (max-width: 900px) { .mm-mapgrid { grid-template-columns: 1fr !important; } }'}</style>
        <div style={{ borderRadius: 24, overflow: 'hidden', border: `2px solid ${camp.color}55`, background: 'rgba(0,0,0,0.25)' }}>
          <svg viewBox="0 0 920 420" width="100%" style={{ display: 'block' }}>
            <defs>
              <linearGradient id="mm-route" x1="0" x2="1"><stop offset="0" stopColor={camp.color} /><stop offset="1" stopColor="#facc15" /></linearGradient>
            </defs>
            <path d={path} fill="none" stroke="rgba(var(--mm-ink),0.12)" strokeWidth="26" strokeLinecap="round" strokeLinejoin="round" />
            <path d={path} fill="none" stroke="url(#mm-route)" strokeWidth="6" strokeDasharray="2 14" strokeLinecap="round" strokeLinejoin="round" />
            {pts.map(([x, y], i) => {
              const mi = camp.missions[i]; const done = isDone(camp.id, mi.id); const open = unlocked(camp, i); const cur = i === sel;
              return (
                <g key={mi.id} transform={`translate(${x} ${y})`} style={{ cursor: open ? 'pointer' : 'not-allowed' }} onClick={() => open && setSel(i)}>
                  {cur && <circle r="56" fill={camp.color} opacity="0.25"><animate attributeName="r" values="46;60;46" dur="2s" repeatCount="indefinite" /></circle>}
                  <circle r="42" fill={done ? '#16a34a' : open ? camp.color : '#1e293b'} stroke="#fff" strokeWidth={cur ? 5 : 2} strokeOpacity={open ? 0.9 : 0.3} />
                  <text y="12" textAnchor="middle" fontSize="34" style={{ filter: open ? 'none' : 'grayscale(1)', opacity: open ? 1 : 0.45 }}>{open ? mi.emoji : '🔒'}</text>
                  <text y="68" textAnchor="middle" fontSize="16" fontWeight="900" fill="#fff" fontFamily={FONT}>{i + 1}. {mi.title}</text>
                  {done && <text y="-50" textAnchor="middle" fontSize="18">{'⭐'.repeat(stars[mi.id] || 1)}</text>}
                </g>
              );
            })}
            <text x="880" y="40" textAnchor="end" fontSize="34">🏆</text>
          </svg>
        </div>

        <div key={sel} style={{ borderRadius: 24, padding: 20, background: 'rgba(var(--mm-ink),0.07)', border: '1px solid rgba(var(--mm-ink),0.14)', animation: 'mm-in .35s', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 900, color: camp.color }}>MISSION {sel + 1} OF 5 · +{m.xp} XP</div>
          <div style={{ fontSize: 26, fontWeight: 900 }}><EmojiIcon e={m.emoji} style={{ marginRight: '0.3em' }} />{m.title}</div>
          <p style={{ margin: 0, lineHeight: 1.6, color: 'rgba(var(--mm-ink),0.85)', fontSize: 16 }}>{m.story}</p>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--mm-yellow)' }}><EmojiIcon e="🎯" style={{ marginRight: '0.35em' }} />Goals</div>
          <ul style={{ margin: 0, paddingLeft: 20, color: 'rgba(var(--mm-ink),0.85)', lineHeight: 1.6 }}>
            {(PLANS[m.id]?.objectives || []).map((o) => <li key={o.label}>{o.label}</li>)}
          </ul>
          <button type="button" className="mm-btn" disabled={!unlocked(camp, sel)} onClick={() => onOpen(m.id)}
            style={{ marginTop: 'auto', minHeight: 52, borderRadius: 16, border: 'none', background: unlocked(camp, sel) ? `linear-gradient(90deg, ${camp.color}, #facc15)` : '#334155', color: '#0b1022', fontWeight: 900, fontSize: 18, cursor: unlocked(camp, sel) ? 'pointer' : 'not-allowed' }}>
            <IconText>{isDone(camp.id, m.id) ? '↻ Play again' : unlocked(camp, sel) ? `▶ Start mission` : '🔒 Finish the mission before'}</IconText>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Mission cockpit ───────────────────────────────────────────────────────
function MissionCockpit({ camp, mission, index, bestStars, onBack, onComplete, onNext }) {
  const plan = PLANS[mission.id];
  const saveKey = `bb-mission-code-${mission.id}`;
  const light = useTheme()?.theme === 'light';
  const [mode, setMode] = useState('python');
  const [code, setCode] = useState(() => {
    try {
      const saved = localStorage.getItem(saveKey);
      // An untouched copy of an old pre-written starter → show the task instead
      return saved && !OLD_STARTERS.has(textHash(saved)) ? saved : plan.starter;
    } catch { return plan.starter; }
  });
  const blockKey = `bb-mission-blocks-v2-${mission.id}`;
  // Blocks start as the same unfinished program as the Python starter (or the pupil's saved blocks)
  const [blocks, setBlocks] = useState(() => {
    try { const saved = JSON.parse(localStorage.getItem(blockKey) || 'null'); if (Array.isArray(saved) && saved.length) return saved; } catch { /* ignore */ }
    return starterBlocks(mission.id, plan.starter);
  });
  const [lines, setLines] = useState([]);
  const [shown, setShown] = useState(0);
  const [error, setError] = useState('');
  const [running, setRunning] = useState(false);
  const [goals, setGoals] = useState(() => plan.objectives.map((o) => ({ label: o.label, ok: false })));
  const [result, setResult] = useState(null); // 'win' | 'try'
  const [attempts, setAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const sawAnswer = false; // no worked answers are shown: pupils write it themselves
  const [earned, setEarned] = useState(0);
  const [runKey, setRunKey] = useState(0);
  const [briefOpen, setBriefOpen] = useState(true);
  const logRef = useRef(null);
  const timers = useRef([]);

  useEffect(() => { try { localStorage.setItem(saveKey, code); } catch { /* ignore */ } }, [code, saveKey]);
  useEffect(() => { try { localStorage.setItem(blockKey, JSON.stringify(blocks)); } catch { /* ignore */ } }, [blocks, blockKey]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => { logRef.current?.scrollTo(0, 99999); }, [shown]);

  const program = mode === 'blocks' ? genPyFromBlocks(blocks) : code;
  const hints = [mission.hint, ...plan.objectives.map((o) => `Goal check: ${o.label}.`)];

  const run = async () => {
    if (running) return;
    timers.current.forEach(clearTimeout); timers.current = [];
    setRunning(true); setError(''); setResult(null); setLines([]); setShown(0); setRunKey((k) => k + 1);
    let text = ''; let err = '';
    try {
      const r = await runSkulpt(program, () => {});
      text = r.text || ''; err = r.ok ? '' : r.error;
    } catch {
      const r = runSubset(program); // offline fallback
      text = r.output.join('\n'); err = r.errors.join(' ');
    }
    const out = text.split('\n').map((s) => s.trim()).filter(Boolean);
    setLines(out);
    setAttempts((a) => a + 1);
    const checks = checkObjectives(mission.id, program, text);
    const step = Math.max(160, Math.min(450, 2600 / Math.max(1, out.length)));
    out.forEach((_, i) => timers.current.push(setTimeout(() => setShown(i + 1), (i + 1) * step)));
    timers.current.push(setTimeout(() => {
      setRunning(false);
      setGoals(checks);
      const won = !err && checks.every((g) => g.ok);
      const s = won ? (sawAnswer ? 1 : hintsUsed > 1 || attempts >= 3 ? 2 : 3) : 0;
      const prev = readWork(`mission:${mission.id}`);
      recordWork(`mission:${mission.id}`, {
        type: 'mission', title: `${camp.title}: ${mission.title}`, mode, code: program.slice(0, 6000),
        output: out.slice(0, 40), error: err || '', goals: checks.map((g) => ({ label: g.label, ok: !!g.ok })),
        attempts: (prev?.attempts || 0) + 1, hintsUsed, sawAnswer,
        stars: Math.max(s, prev?.stars || 0), passed: won || !!prev?.passed,
        ...(won ? { completedAt: new Date().toISOString() } : {}),
      });
      if (err) { setError(err); setResult('try'); return; }
      if (won) {
        setEarned(s); setResult('win'); onComplete(s);
      } else setResult('try');
    }, (out.length + 1) * step + 200));
  };

  const visible = lines.slice(0, shown);
  const win = result === 'win';

  return (
    <div style={{ maxWidth: 1500, margin: '0 auto', padding: '18px 18px 50px' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <button type="button" className="mm-btn" onClick={onBack} style={backBtn}>← Map</button>
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontSize: 12, fontWeight: 900, color: camp.color, letterSpacing: 1 }}>{camp.title.toUpperCase()} · MISSION {index + 1} OF 5</div>
          <div style={{ fontSize: 26, fontWeight: 900 }}><EmojiIcon e={mission.emoji} style={{ marginRight: '0.3em' }} />{mission.title}</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>{[0, 1, 2, 3, 4].map((i) => <span key={i} style={{ width: 34, height: 8, borderRadius: 4, background: i < index ? '#22c55e' : i === index ? camp.color : 'rgba(var(--mm-ink),0.15)' }} />)}</div>
        <span style={{ padding: '6px 12px', borderRadius: 999, background: 'rgba(250,204,21,0.15)', color: 'var(--mm-yellow)', fontWeight: 900 }}>+{mission.xp} XP {bestStars ? `· ${'⭐'.repeat(bestStars)}` : ''}</span>
      </div>

      <div className="mm-cockpit">
        {/* Briefing + goals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={panel}>
            <button type="button" onClick={() => setBriefOpen((o) => !o)} style={{ all: 'unset', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start', width: '100%' }}>
              <svg viewBox="-10 -12 120 186" width="56" style={{ flexShrink: 0 }}><DotBot pose={win ? 'cheer' : running ? 'point' : 'wave'} /></svg>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: camp.color, letterSpacing: 1 }}>MISSION CONTROL · DOT</div>
                {briefOpen && <p style={{ margin: '6px 0 0', lineHeight: 1.6, fontSize: 15, color: 'rgba(var(--mm-ink),0.9)' }}>{mission.story}</p>}
              </div>
            </button>
          </div>
          <div style={panel}>
            <div style={{ fontSize: 13, fontWeight: 900, color: 'var(--mm-yellow)', marginBottom: 10 }}><EmojiIcon e="🎯" style={{ marginRight: '0.35em' }} />MISSION GOALS</div>
            {goals.map((g, i) => (
              <div key={g.label} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 10px', borderRadius: 12, marginBottom: 6, background: g.ok ? 'rgba(34,197,94,0.15)' : 'rgba(var(--mm-ink),0.04)', border: `1px solid ${g.ok ? 'rgba(34,197,94,0.5)' : 'rgba(var(--mm-ink),0.08)'}`, transition: 'all .3s', animation: g.ok ? `mm-pop .4s ${i * 0.12}s both` : undefined }}>
                <span style={{ width: 22, height: 22, borderRadius: 7, flexShrink: 0, display: 'grid', placeItems: 'center', background: g.ok ? '#22c55e' : 'rgba(var(--mm-ink),0.12)', fontSize: 13, fontWeight: 900 }}>{g.ok ? '✓' : i + 1}</span>
                <span style={{ fontSize: 15, lineHeight: 1.4, fontWeight: 700 }}>{g.label}</span>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
              <button type="button" className="mm-btn" disabled={hintsUsed >= hints.length} onClick={() => setHintsUsed((h) => h + 1)} style={smallBtn(light ? '#b45309' : '#fde047')}><EmojiIcon e="💡" style={{ marginRight: '0.35em' }} />Hint {hintsUsed ? `${hintsUsed}/${hints.length}` : ''}</button>
              <button type="button" className="mm-btn" onClick={() => { setCode(plan.starter); setBlocks(starterBlocks(mission.id, plan.starter)); setLines([]); setResult(null); }} style={smallBtn('#94a3b8')}>↺ Reset</button>
            </div>
            {hintsUsed > 0 && (
              <ol style={{ margin: '10px 0 0', paddingLeft: 20, color: '#fef3c7', fontSize: 14, lineHeight: 1.5 }}>
                {hints.slice(0, hintsUsed).map((h, i) => <li key={i}>{h}</li>)}
              </ol>
            )}
          </div>
        </div>

        {/* Code */}
        <div style={{ ...panel, display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 13, fontWeight: 900, letterSpacing: 1, flex: 1 }}><EmojiIcon e="💻" style={{ marginRight: '0.35em' }} />YOUR CODE</div>
            <div role="tablist" style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 3 }}>
              {[['python', '🐍 Python'], ['blocks', '🧩 Blocks']].map(([k, t]) => (
                <button key={k} type="button" role="tab" aria-selected={mode === k} onClick={() => setMode(k)}
                  style={{ border: 'none', borderRadius: 9, padding: '7px 14px', fontWeight: 800, cursor: 'pointer', background: mode === k ? camp.color : 'transparent', color: mode === k ? '#fff' : 'var(--mm-text)', fontFamily: FONT }}>{t}</button>
              ))}
            </div>
          </div>
          {mode === 'python' ? (
            <CodeBox code={code} setCode={setCode} onRun={run} />
          ) : (
            <MissionBlockEditor missionId={mission.id} campColor={camp.color} blocks={blocks} setBlocks={setBlocks} />
          )}
          <button type="button" className="mm-btn" onClick={run} disabled={running}
            style={{ minHeight: 56, borderRadius: 16, border: 'none', cursor: running ? 'wait' : 'pointer', fontWeight: 900, fontSize: 19, fontFamily: FONT, color: '#0b1022', background: `linear-gradient(90deg, ${camp.color}, #facc15)`, boxShadow: `0 8px 24px ${camp.glow}`, opacity: running ? 0.7 : 1 }}>
            <IconText>{running ? '⏳ Running…' : `▶ ${plan.action || WORLD[camp.id].action}!`}</IconText>
          </button>
          <div style={{ fontSize: 12, color: 'rgba(var(--mm-ink),0.5)' }}>Tip: Ctrl/⌘ + Enter runs · Tab adds 4 spaces</div>
        </div>

        {/* Viewer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minWidth: 0 }}>
          <div style={{ ...panel, padding: 8 }}>
            <MissionScene scene={plan.scene} lines={visible} done={win && !running} failed={result === 'try' && !running} runKey={runKey} />
          </div>
          <div style={{ ...panel, padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '8px 14px', fontSize: 12, fontWeight: 900, letterSpacing: 1, background: '#0b1022', color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
              <span><EmojiIcon e="📡" style={{ marginRight: '0.35em' }} />MISSION LOG</span><span style={{ color: running ? '#fde047' : '#22c55e' }}>{running ? '● LIVE' : lines.length ? '● DONE' : '○ READY'}</span>
            </div>
            <div ref={logRef} style={{ height: 170, overflowY: 'auto', padding: '10px 14px', fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 14, lineHeight: 1.6, background: 'var(--mm-log)' }}>
              {!lines.length && !error && <span style={{ color: 'rgba(255,255,255,0.45)' }}>Press ▶ to run your program. What it prints appears here — and in the scene above.</span>}
              {visible.map((l, i) => <div key={i} style={{ color: '#86efac', animation: 'mm-in .25s' }}><span style={{ color: 'rgba(255,255,255,0.35)' }}>&gt; </span>{l}</div>)}
              {error && !running && <div style={{ color: '#fca5a5', marginTop: 6 }}><EmojiIcon e="🐞" style={{ marginRight: '0.35em' }} />{error}</div>}
            </div>
          </div>
          {result === 'try' && !running && (
            <div role="status" style={{ ...panel, borderColor: 'rgba(245,158,11,0.6)', background: 'rgba(245,158,11,0.12)' }}>
              <b style={{ color: 'var(--mm-yellow)' }}>Nearly there!</b> {error ? 'Fix the bug above, then run again.' : `Still to do: ${goals.filter((g) => !g.ok).map((g) => g.label).join(' · ')}`}
            </div>
          )}
        </div>
      </div>

      {win && !running && <WinOverlay camp={camp} mission={mission} stars={earned} onNext={onNext} onMap={onBack} onStay={() => setResult(null)} />}
    </div>
  );
}

function CodeBox({ code, setCode, onRun }) {
  const lines = code.split('\n');
  return (
    <div style={{ display: 'flex', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(var(--mm-ink),0.15)', background: 'var(--mm-code-bg)', minHeight: 320 }}>
      <div aria-hidden style={{ padding: '12px 8px', fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 15, lineHeight: 1.6, color: '#475569', textAlign: 'right', userSelect: 'none', background: 'rgba(var(--mm-ink),0.03)' }}>
        {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
      </div>
      <textarea aria-label="Python code" value={code} spellCheck={false} autoCapitalize="off" autoCorrect="off"
        onChange={(e) => setCode(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Tab') {
            e.preventDefault();
            const el = e.target; const s = el.selectionStart;
            setCode(code.slice(0, s) + '    ' + code.slice(el.selectionEnd));
            requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = s + 4; });
          } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); onRun(); }
        }}
        style={{ flex: 1, background: 'transparent', color: 'var(--mm-code-text)', border: 'none', outline: 'none', resize: 'vertical', padding: 12, fontFamily: 'ui-monospace, Menlo, monospace', fontSize: 15, lineHeight: 1.6, whiteSpace: 'pre', tabSize: 4, minHeight: 320 }} />
    </div>
  );
}

function WinOverlay({ camp, mission, stars, onNext, onMap, onStay }) {
  const bits = useMemo(() => Array.from({ length: 50 }, (_, i) => ({ x: (i * 37) % 100, d: 1.8 + (i % 5) * 0.4, e: ['🎉', '⭐', '✨', '🟡', '🟣', '🔷'][i % 6], delay: (i % 10) * 0.12 })), []);
  return (
    <div role="dialog" aria-label="Mission complete" style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(2,6,23,0.72)', display: 'grid', placeItems: 'center', padding: 16, backdropFilter: 'blur(4px)' }}>
      {bits.map((b, i) => <span key={i} aria-hidden style={{ position: 'fixed', top: -30, left: `${b.x}%`, fontSize: 22, animation: `mm-confetti ${b.d}s ${b.delay}s linear forwards` }}>{b.e}</span>)}
      <div style={{ width: 'min(520px, 100%)', borderRadius: 28, padding: '28px 24px', textAlign: 'center', background: `linear-gradient(160deg, ${camp.color}, #0b1022 70%)`, border: '2px solid rgba(255,255,255,0.25)', boxShadow: `0 30px 80px ${camp.glow}`, animation: 'mm-pop .5s' }}>
        <svg viewBox="-20 -16 140 190" width="110" style={{ animation: 'mm-float 2s ease-in-out infinite' }}><DotBot pose="cheer" /></svg>
        <div style={{ fontSize: 14, fontWeight: 900, letterSpacing: 2, color: '#fde047' }}>MISSION COMPLETE</div>
        <div style={{ fontSize: 30, fontWeight: 900, margin: '4px 0 6px' }}><EmojiIcon e={mission.emoji} style={{ marginRight: '0.3em' }} />{mission.title}</div>
        <div style={{ fontSize: 46, letterSpacing: 6 }}>{[1, 2, 3].map((n) => <span key={n} style={{ opacity: n <= stars ? 1 : 0.2, display: 'inline-block', animation: n <= stars ? `mm-pop .4s ${0.3 + n * 0.25}s both` : undefined }}>⭐</span>)}</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#fde047', margin: '6px 0 4px' }}>+{mission.xp} XP</div>
        <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', marginBottom: 18 }}>
          {stars === 3 ? 'Flawless! Mission control is amazed.' : stars === 2 ? 'Great work! Try with fewer hints for 3 stars.' : 'Done! Try it again with fewer hints for more stars.'}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {onNext
            ? <button type="button" className="mm-btn" onClick={onNext} style={{ ...bigBtn, background: '#facc15', color: '#1c1917' }}>Next mission →</button>
            : <button type="button" className="mm-btn" onClick={onMap} style={{ ...bigBtn, background: '#facc15', color: '#1c1917' }}><EmojiIcon e="🏆" style={{ marginRight: '0.35em' }} />World saved!</button>}
          <button type="button" className="mm-btn" onClick={onMap} style={{ ...bigBtn, background: 'rgba(255,255,255,0.15)', color: '#fff' }}>Map</button>
          <button type="button" className="mm-btn" onClick={onStay} style={{ ...bigBtn, background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}>Keep coding</button>
        </div>
      </div>
    </div>
  );
}

const panel = { borderRadius: 20, padding: 16, background: 'var(--mm-panel)', border: '1px solid rgba(var(--mm-ink),0.12)', backdropFilter: 'blur(8px)' };
const backBtn = { minHeight: 42, padding: '0 16px', borderRadius: 12, border: '1px solid rgba(var(--mm-ink),0.25)', background: 'rgba(var(--mm-ink),0.08)', color: 'var(--mm-text)', fontWeight: 800, cursor: 'pointer', fontFamily: FONT };
const smallBtn = (c) => ({ minHeight: 38, padding: '0 12px', borderRadius: 10, border: `1px solid ${c}66`, background: `${c}1a`, color: c, fontWeight: 800, cursor: 'pointer', fontFamily: FONT, fontSize: 14 });
const bigBtn = { minHeight: 50, padding: '0 22px', borderRadius: 14, border: 'none', fontWeight: 900, fontSize: 17, cursor: 'pointer', fontFamily: FONT };
