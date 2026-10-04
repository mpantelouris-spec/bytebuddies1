/**
 * MissionScenes — the live picture each mission's program drives.
 *
 * `lines` are the program's printed lines revealed so far (they appear one by
 * one), `done` is true when every objective passed, `failed` when the run
 * ended without passing. Everything is SVG + CSS so it is light on iPads.
 */
import React from 'react';

const W = 400; const H = 260;
const num = (s) => { const m = String(s).match(/-?\d+(\.\d+)?/); return m ? Number(m[0]) : null; };
const pick = (lines, re) => lines.filter((l) => re.test(l));
const lastNum = (lines, re) => { for (let i = lines.length - 1; i >= 0; i--) { const m = lines[i].match(re); if (m) return Number(m[1]); } return null; };

const KEYFRAMES = `
.ms-c { transform-box: fill-box; transform-origin: center; }
@keyframes ms-twinkle { 0%,100% { opacity: .25 } 50% { opacity: 1 } }
@keyframes ms-flame { 0%,100% { transform: scaleY(1) } 50% { transform: scaleY(1.35) } }
@keyframes ms-liftoff { 0% { transform: translateY(0) } 15% { transform: translate(1px, 2px) } 100% { transform: translateY(-330px) } }
@keyframes ms-shake { 0%,100% { transform: translateX(0) } 25% { transform: translateX(-4px) } 75% { transform: translateX(4px) } }
@keyframes ms-pulse { 0%,100% { opacity: .5; transform: scale(1) } 50% { opacity: 1; transform: scale(1.15) } }
@keyframes ms-wave { 0% { r: 4; opacity: 1 } 100% { r: 70; opacity: 0 } }
@keyframes ms-bubble { 0% { transform: translateY(0); opacity: .8 } 100% { transform: translateY(-120px); opacity: 0 } }
@keyframes ms-swim { 0% { transform: translateX(-60px) } 100% { transform: translateX(460px) } }
@keyframes ms-pop { 0% { transform: scale(0) } 70% { transform: scale(1.15) } 100% { transform: scale(1) } }
@keyframes ms-firework { 0% { transform: scale(.1); opacity: 1 } 100% { transform: scale(1.4); opacity: 0 } }
@keyframes ms-dash { to { stroke-dashoffset: -40 } }
@keyframes ms-glow { 0%,100% { filter: drop-shadow(0 0 2px #22d3ee) } 50% { filter: drop-shadow(0 0 10px #22d3ee) } }
@keyframes ms-orbit { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
`;

// ── Backdrops ───────────────────────────────────────────────────────────────
function Stars({ n = 40, seed = 3 }) {
  const pts = Array.from({ length: n }, (_, i) => [((i * 97 + seed * 31) % W), ((i * 53 + seed * 17) % H), (i % 3) + 0.6]);
  return pts.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r * 0.7} fill="#fff" style={{ animation: `ms-twinkle ${2 + (i % 4)}s ${i * 0.13}s infinite` }} />);
}
function SpaceBg() {
  return (
    <>
      <defs>
        <radialGradient id="ms-neb" cx="0.75" cy="0.25" r="0.8"><stop offset="0" stopColor="#4c1d95" /><stop offset="0.55" stopColor="#1e1b4b" /><stop offset="1" stopColor="#020617" /></radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#ms-neb)" />
      <Stars />
    </>
  );
}
function OceanBg({ depth = 0 }) {
  const t = Math.min(1, depth);
  return (
    <>
      <defs>
        <linearGradient id="ms-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={t > 0.6 ? '#082f49' : '#0ea5e9'} /><stop offset="1" stopColor="#020617" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#ms-sea)" />
      {[60, 150, 300, 350].map((x, i) => <circle key={i} cx={x} cy={H} r="3" fill="#bae6fd" style={{ animation: `ms-bubble ${3 + i}s ${i * 0.7}s infinite linear` }} />)}
      <g style={{ animation: 'ms-swim 14s linear infinite' }}><text y="70" fontSize="18">🐟</text></g>
      <g style={{ animation: 'ms-swim 19s 4s linear infinite' }}><text y="190" fontSize="14">🐠</text></g>
      <path d={`M0 ${H - 14} Q 60 ${H - 30} 120 ${H - 14} T 240 ${H - 14} T 400 ${H - 16} V ${H} H 0 Z`} fill="#713f12" opacity="0.6" />
    </>
  );
}
function CityBg({ night }) {
  return (
    <>
      <defs>
        <linearGradient id="ms-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={night ? '#0f172a' : '#fde68a'} /><stop offset="1" stopColor={night ? '#312e81' : '#fb923c'} />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#ms-sky)" />
      {night && <Stars n={20} seed={7} />}
      <circle cx="330" cy="50" r="22" fill={night ? '#f8fafc' : '#fef08a'} opacity="0.9" />
      <rect y={H - 26} width={W} height="26" fill="#334155" />
    </>
  );
}
function CyberBg() {
  return (
    <>
      <rect width={W} height={H} fill="#020617" />
      {Array.from({ length: 11 }, (_, i) => <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2={H} stroke="#10b981" strokeOpacity="0.12" />)}
      {Array.from({ length: 7 }, (_, i) => <line key={`h${i}`} x1="0" y1={i * 40} x2={W} y2={i * 40} stroke="#10b981" strokeOpacity="0.12" />)}
      {Array.from({ length: 14 }, (_, i) => <text key={i} x={(i * 29) % W} y={(i * 47) % H} fontSize="10" fill="#10b981" opacity="0.25" fontFamily="monospace">{(i * 7919).toString(2).slice(0, 6)}</text>)}
    </>
  );
}

// ── Pieces ──────────────────────────────────────────────────────────────────
function Rocket({ x, y, flame, scale = 1, rot = 0 }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
      {flame && <path d="M-7 26 Q0 54 7 26 Z" fill="#f97316" style={{ transformOrigin: '0 26px', animation: 'ms-flame .15s infinite' }} />}
      {flame && <path d="M-4 26 Q0 42 4 26 Z" fill="#fde047" />}
      <path d="M-12 18 L-20 30 L-10 26 Z M12 18 L20 30 L10 26 Z" fill="#ef4444" />
      <path d="M0 -30 C 14 -14 14 10 10 26 H-10 C -14 10 -14 -14 0 -30 Z" fill="#f8fafc" stroke="#0f172a" strokeWidth="2" />
      <circle cy="-4" r="6" fill="#38bdf8" stroke="#0f172a" strokeWidth="2" />
      <path d="M0 -30 C 6 -24 9 -18 10 -12 H -10 C -9 -18 -6 -24 0 -30 Z" fill="#ef4444" />
    </g>
  );
}
function Sub({ x, y, lights }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {lights && <path d="M30 0 L90 -18 L90 18 Z" fill="#fde047" opacity="0.25" />}
      <ellipse rx="34" ry="15" fill="#facc15" stroke="#0f172a" strokeWidth="2" />
      <rect x="-8" y="-26" width="16" height="14" rx="4" fill="#facc15" stroke="#0f172a" strokeWidth="2" />
      {[-14, 0, 14].map((cx) => <circle key={cx} cx={cx} cy="0" r="5" fill="#38bdf8" stroke="#0f172a" strokeWidth="1.5" />)}
      <path d="M-34 0 L-44 -9 L-44 9 Z" fill="#eab308" stroke="#0f172a" strokeWidth="2" />
    </g>
  );
}
function Hud({ items, x = 10, y = 10, color = '#22d3ee' }) {
  return (
    <g>
      {items.filter((it) => it[1] != null).map(([k, v], i) => (
        <g key={k} transform={`translate(${x} ${y + i * 24})`}>
          <rect width={Math.max(84, 14 + (k.length + String(v).length) * 7.4)} height="20" rx="6" fill="#0f172a" opacity="0.75" stroke={color} strokeOpacity="0.6" />
          <text x="8" y="14" fontSize="11" fontFamily="ui-monospace, Menlo, monospace" fill={color} fontWeight="700">{k}: <tspan fill="#fff">{v}</tspan></text>
        </g>
      ))}
    </g>
  );
}
function Banner({ text, color = '#22c55e' }) {
  return (
    <g transform={`translate(${W / 2} ${H / 2})`}><g className="ms-c" style={{ animation: 'ms-pop .5s ease-out' }}>
      <rect x="-120" y="-24" width="240" height="48" rx="14" fill="#0f172a" opacity="0.85" stroke={color} strokeWidth="3" />
      <text y="8" textAnchor="middle" fontSize="20" fontWeight="900" fill={color} fontFamily="Nunito, sans-serif">{text}</text>
    </g></g>
  );
}
function Fireworks() {
  return [[90, 70, '#f472b6'], [210, 50, '#fde047'], [320, 80, '#22d3ee'], [150, 110, '#a3e635']].map(([x, y, c], i) => (
    <g key={i} transform={`translate(${x} ${y})`}>
      <g style={{ animation: `ms-firework 1.4s ${i * 0.35}s infinite ease-out`, transformOrigin: '0 0' }}>
        {Array.from({ length: 10 }, (_, k) => <line key={k} x1="0" y1="0" x2={Math.cos(k * 0.63) * 30} y2={Math.sin(k * 0.63) * 30} stroke={c} strokeWidth="3" strokeLinecap="round" />)}
      </g>
    </g>
  ));
}

// ── Scenes ─────────────────────────────────────────────────────────────────
function Launch({ lines, done, failed }) {
  const lit = Math.min(5, lines.length);
  return (
    <>
      <SpaceBg />
      <rect y={H - 30} width={W} height="30" fill="#334155" />
      <rect x="170" y={H - 120} width="12" height="90" fill="#64748b" />
      {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx="150" cy={H - 50 - i * 18} r="6" fill={i < lit ? '#22c55e' : '#1e293b'} stroke="#94a3b8" />)}
      <g style={done ? { animation: 'ms-liftoff 2.6s 0.3s ease-in forwards' } : failed ? { animation: 'ms-shake .4s 2' } : undefined}>
        <Rocket x={210} y={H - 64} flame={done || lines.length > 2} />
      </g>
      {lines.length > 0 && <text x="300" y="40" textAnchor="middle" fill="#fde047" fontSize="16" fontWeight="900" fontFamily="Nunito">T-{Math.max(0, 5 - lines.length)}</text>}
      {done && <Banner text="🚀 LIFT OFF!" />}
    </>
  );
}
function Orbit({ lines, done }) {
  const n = pick(lines, /orbit/i).length;
  return (
    <>
      <SpaceBg />
      <circle cx="200" cy="130" r="48" fill="#2563eb" />
      <path d="M160 120 q20 -20 40 -6 t40 -4" stroke="#22c55e" strokeWidth="10" fill="none" opacity="0.8" />
      <ellipse cx="200" cy="130" rx="110" ry="70" fill="none" stroke="#a5b4fc" strokeDasharray="4 6" opacity="0.6" />
      {n > 0 && (
        <g style={{ transformOrigin: '200px 130px', animation: `ms-orbit ${1.4}s linear ${Math.min(n, 6)} forwards` }}>
          <g transform="translate(310 130) rotate(0)"><Rocket x={0} y={0} scale={0.45} flame rot={180} /></g>
        </g>
      )}
      <Hud items={[['Orbits', n]]} />
      {done && <Banner text="🌍 Perfect orbit!" />}
    </>
  );
}
function Asteroids({ lines, done }) {
  const dodged = pick(lines, /dodg/i).length;
  const score = lastNum(lines, /score\D*(\d+)/i);
  return (
    <>
      <SpaceBg />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} transform={`translate(${70 + i * 60} ${60 + (i % 2) * 90})`} opacity={i < dodged ? 0.25 : 1}>
          <path d="M-14 -6 L-6 -14 L8 -12 L15 -2 L10 12 L-4 14 L-14 6 Z" fill="#78716c" stroke="#44403c" strokeWidth="2" />
          {i < dodged && <text x="-6" y="5" fontSize="14">✨</text>}
        </g>
      ))}
      <g style={{ transition: 'transform .4s', transform: `translate(${40 + dodged * 60}px, ${dodged % 2 ? 40 : 0}px)` }}>
        <Rocket x={0} y={130} scale={0.6} rot={90} flame />
      </g>
      <Hud items={[['Dodged', dodged], ['Score', score]]} />
      {done && <Banner text="☄️ Field cleared!" />}
    </>
  );
}
function Beacon({ lines, done }) {
  return (
    <>
      <SpaceBg />
      <g transform="translate(80 130)">
        <rect x="-16" y="-16" width="32" height="32" rx="6" fill="#94a3b8" stroke="#0f172a" strokeWidth="2" />
        <line x1="0" y1="-16" x2="0" y2="-40" stroke="#94a3b8" strokeWidth="3" />
        <circle cy="-42" r="5" fill="#ef4444" className="ms-c" style={{ animation: 'ms-pulse 1s infinite' }} />
      </g>
      {lines.map((l, i) => (
        <circle key={i} cx="80" cy="88" r="4" fill="none" stroke={/pong|sos/i.test(l) ? '#22d3ee' : '#f59e0b'} strokeWidth="3" style={{ animation: `ms-wave 1.6s ${i * 0.3}s infinite` }} />
      ))}
      <Rocket x={320} y={130} scale={0.7} rot={-90} />
      {lines.slice(-3).map((l, i) => <text key={i} x="200" y={40 + i * 18} textAnchor="middle" fontSize="11" fill="#e0e7ff" fontFamily="monospace">{l.slice(0, 40)}</text>)}
      {done && <Banner text="📡 Beacon answered!" />}
    </>
  );
}
function Landing({ lines, done }) {
  const alt = lastNum(lines, /altitude\D*(\d+)/i);
  const y = alt == null ? 40 : 40 + (1 - Math.min(5000, alt) / 5000) * 150;
  return (
    <>
      <SpaceBg />
      <path d={`M0 ${H - 28} Q 100 ${H - 46} 200 ${H - 30} T 400 ${H - 34} V ${H} H 0 Z`} fill="#a8a29e" />
      <rect x="170" y={H - 34} width="60" height="6" rx="3" fill="#facc15" />
      <g style={{ transition: 'transform .45s ease-out', transform: `translateY(${done ? H - 82 : y}px)` }}><Rocket x={200} y={0} flame={!done} /></g>
      <Hud items={[['Altitude', alt != null ? `${alt}m` : null]]} />
      {done && <Banner text="🏆 Touchdown!" />}
    </>
  );
}
function Dive({ lines, done }) {
  const depth = lastNum(lines, /(\d+)\s*m\b/i) ?? 0;
  const warn = lines.some((l) => /pressure/i.test(l));
  return (
    <>
      <OceanBg depth={depth / 200} />
      <g>{[0, 50, 100, 150, 200].map((d) => <g key={d}><line x1="360" x2="390" y1={30 + d} y2={30 + d} stroke="#bae6fd" opacity="0.5" /><text x="350" y={34 + d} textAnchor="end" fontSize="10" fill="#bae6fd">{d}m</text></g>)}</g>
      <g style={{ transition: 'transform .6s ease-in-out', transform: `translateY(${30 + Math.min(200, depth)}px)` }}><Sub x={200} y={0} lights={depth > 40} /></g>
      {warn && <g transform="translate(70 40)"><g className="ms-c" style={{ animation: 'ms-pulse .8s infinite' }}><rect x="-50" y="-14" width="100" height="26" rx="8" fill="#dc2626" /><text y="4" textAnchor="middle" fontSize="11" fontWeight="900" fill="#fff">⚠ PRESSURE</text></g></g>}
      <Hud items={[['Depth', `${depth}m`]]} x={10} y={H - 34} color="#7dd3fc" />
      {done && <Banner text="🤿 Dive complete!" />}
    </>
  );
}
function Maze({ lines, done }) {
  const steps = pick(lines, /step\s*\d/i).length;
  const pts = [[30, 200], [80, 200], [80, 140], [140, 140], [140, 70], [220, 70], [220, 160], [300, 160], [360, 100]];
  const p = pts[Math.min(steps, pts.length - 1)];
  return (
    <>
      <OceanBg depth={0.7} />
      <polyline points={pts.map((q) => q.join(',')).join(' ')} fill="none" stroke="#7dd3fc" strokeWidth="26" strokeLinejoin="round" opacity="0.18" />
      {[[110, 175], [175, 105], [250, 120], [330, 190], [60, 120], [270, 60]].map(([x, y], i) => <text key={i} x={x} y={y} fontSize="22">🪸</text>)}
      <text x="352" y="92" fontSize="20">🏁</text>
      <g style={{ transition: 'transform .45s', transform: `translate(${p[0]}px, ${p[1]}px) scale(.55)` }}><Sub x={0} y={0} lights /></g>
      <Hud items={[['Steps', steps]]} />
      {done && <Banner text="🪸 Maze cleared!" />}
    </>
  );
}
function Shark({ lines, done }) {
  const alarm = lines.some((l) => /alarm/i.test(l)); const lights = lines.some((l) => /light/i.test(l)); const radio = lines.some((l) => /radio/i.test(l));
  return (
    <>
      <OceanBg depth={0.5} />
      <g style={{ animation: 'ms-swim 6s linear infinite' }}><text y="80" fontSize="44">🦈</text></g>
      <Sub x={200} y={170} lights={lights} />
      {[['🚨 Alarm', alarm], ['💡 Lights', lights], ['📻 Radio', radio]].map(([t, on], i) => (
        <g key={t} transform={`translate(${30 + i * 120} 222)`}>
          <rect width="104" height="26" rx="8" fill={on ? '#16a34a' : '#1e293b'} stroke={on ? '#86efac' : '#475569'} />
          <text x="52" y="17" textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff">{t}</text>
        </g>
      ))}
      {alarm && <circle cx="200" cy="150" r="10" fill="none" stroke="#ef4444" strokeWidth="3" style={{ animation: 'ms-wave 1s infinite' }} />}
      {done && <Banner text="🦈 Crew safe!" />}
    </>
  );
}
function Grid({ lines, done }) {
  const found = new Set(lines.map((l) => l.match(/\((\d+)\s*,\s*(\d+)\)/)).filter(Boolean).map((m) => `${m[1]},${m[2]}`));
  const total = lastNum(lines, /total\D*(\d+)/i);
  return (
    <>
      <OceanBg depth={0.9} />
      <g transform="translate(110 22)">
        {Array.from({ length: 64 }, (_, n) => {
          const r = Math.floor(n / 8); const c = n % 8; const hit = found.has(`${r},${c}`);
          return (
            <g key={n}>
              <rect x={c * 24} y={r * 24} width="22" height="22" rx="4" fill={hit ? '#facc15' : '#0c4a6e'} opacity={hit ? 1 : 0.7} />
              {hit && <text x={c * 24 + 3} y={r * 24 + 17} fontSize="14" className="ms-c" style={{ animation: 'ms-pop .4s' }}>💎</text>}
            </g>
          );
        })}
      </g>
      <Hud items={[['Found', found.size], ['Total', total]]} color="#fde047" />
      {done && <Banner text="💎 Treasure found!" />}
    </>
  );
}
function Ascent({ lines, done }) {
  const depth = lastNum(lines, /depth\D*(\d+)/i) ?? 200;
  const oxy = lastNum(lines, /oxygen\D*(\d+)/i) ?? 60;
  return (
    <>
      <OceanBg depth={depth / 200} />
      <rect width={W} height="18" fill="#7dd3fc" opacity="0.5" />
      <g style={{ transition: 'transform .5s', transform: `translateY(${done ? 6 : 30 + (Math.min(200, depth) / 200) * 190}px)` }}><Sub x={200} y={0} lights /></g>
      <g transform="translate(360 40)">
        <rect width="18" height="160" rx="9" fill="#1e293b" />
        <rect y={160 - (oxy / 60) * 160} width="18" height={(oxy / 60) * 160} rx="9" fill={oxy < 20 ? '#ef4444' : '#22c55e'} style={{ transition: 'all .5s' }} />
        <text x="9" y="178" textAnchor="middle" fontSize="10" fill="#fff">O₂</text>
      </g>
      <Hud items={[['Depth', `${depth}m`], ['Oxygen', oxy]]} color="#7dd3fc" />
      {done && <Banner text="🌊 SURFACED!" />}
    </>
  );
}
function Blueprint({ lines, done }) {
  const get = (k) => lastNum(lines, new RegExp(`${k}\\D*(\\d+)`, 'i'));
  const pop = get('population'); const bud = get('budget'); const hap = get('happiness'); const day = get('day');
  return (
    <>
      <rect width={W} height={H} fill="#1e3a8a" />
      {Array.from({ length: 21 }, (_, i) => <line key={i} x1={i * 20} y1="0" x2={i * 20} y2={H} stroke="#93c5fd" strokeOpacity="0.15" />)}
      {Array.from({ length: 14 }, (_, i) => <line key={`h${i}`} x1="0" y1={i * 20} x2={W} y2={i * 20} stroke="#93c5fd" strokeOpacity="0.15" />)}
      {[[40, 150, 50, 80], [110, 120, 40, 110], [170, 170, 60, 60], [250, 100, 46, 130], [310, 140, 60, 90]].map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill="none" stroke="#e0f2fe" strokeWidth="2" strokeDasharray="5 4" opacity={i < lines.length ? 1 : 0.3} />
      ))}
      {[['👥 Population', pop], ['💷 Budget', bud], ['😊 Happiness', hap], ['📅 Days', day]].map(([k, v], i) => (
        <g key={k} transform={`translate(${12 + (i % 2) * 196} ${12 + Math.floor(i / 2) * 34})`}>
          <rect width="186" height="28" rx="8" fill="#0f172a" opacity="0.8" stroke={v != null ? '#22c55e' : '#475569'} />
          <text x="10" y="19" fontSize="12" fontWeight="800" fill="#e0f2fe">{k}: <tspan fill={v != null ? '#86efac' : '#64748b'}>{v ?? '?'}</tspan></text>
        </g>
      ))}
      {done && <Banner text="📐 Blueprint ready!" />}
    </>
  );
}
function Building({ x, w, h, lit, color = '#475569' }) {
  return (
    <g style={{ animation: 'ms-pop .5s', transformOrigin: `${x + w / 2}px ${H - 26}px` }}>
      <rect x={x} y={H - 26 - h} width={w} height={h} fill={color} />
      {Array.from({ length: Math.floor(h / 16) * Math.floor(w / 12) }, (_, k) => {
        const cols = Math.floor(w / 12);
        return <rect key={k} x={x + 4 + (k % cols) * 12} y={H - 26 - h + 6 + Math.floor(k / cols) * 16} width="6" height="8" fill={lit ? '#fde047' : '#1e293b'} />;
      })}
    </g>
  );
}
function Roads({ lines, done }) {
  const roads = pick(lines, /road/i).length;
  const bud = lastNum(lines, /budget\D*(\d+)/i); const hap = lastNum(lines, /happiness\D*(\d+)/i);
  return (
    <>
      <CityBg />
      {[0, 1, 2, 3, 4].map((i) => <Building key={i} x={20 + i * 76} w={40} h={50 + (i % 3) * 30} lit={i < roads} />)}
      {Array.from({ length: roads }, (_, i) => <g key={i}><rect x={i * 80} y={H - 22} width="80" height="12" fill="#1e293b" /><line x1={i * 80 + 6} x2={i * 80 + 74} y1={H - 16} y2={H - 16} stroke="#fde047" strokeWidth="2" strokeDasharray="8 6" /></g>)}
      <text x={Math.min(roads, 4) * 80 + 30} y={H - 30} fontSize="20">🚗</text>
      <Hud items={[['Roads', roads], ['Budget', bud], ['Happiness', hap]]} color="#fde68a" />
      {done && <Banner text="🛣️ City connected!" />}
    </>
  );
}
function Power({ lines, done }) {
  const up = new Set(lines.map((l) => /district\s*(\d+)\D*powered/i.exec(l)).filter(Boolean).map((m) => +m[1]));
  const seen = new Set(lines.map((l) => /district\s*(\d+)/i.exec(l)).filter(Boolean).map((m) => +m[1]));
  const cost = lastNum(lines, /total cost\D*(\d+)/i);
  return (
    <>
      <CityBg night />
      {[1, 2, 3, 4].map((d) => (
        <g key={d}>
          <Building x={20 + (d - 1) * 96} w={70} h={70 + (d % 2) * 40} lit={(seen.has(d) && [2, 4].includes(d)) || up.has(d)} />
          <text x={55 + (d - 1) * 96} y={H - 8} textAnchor="middle" fontSize="11" fontWeight="800" fill="#e2e8f0">District {d}</text>
          {up.has(d) && <text x={45 + (d - 1) * 96} y={H - 120 - (d % 2) * 40} fontSize="20" className="ms-c" style={{ animation: 'ms-pop .4s' }}>⚡</text>}
        </g>
      ))}
      <Hud items={[['Total cost', cost]]} color="#fde68a" />
      {done && <Banner text="⚡ Grid online!" />}
    </>
  );
}
function Growth({ lines, done }) {
  const pops = lines.map((l) => /population\D*(\d+)/i.exec(l)).filter(Boolean).map((m) => +m[1]);
  const max = Math.max(170, ...pops);
  return (
    <>
      <CityBg />
      {pops.map((p, i) => <Building key={i} x={14 + i * 38} w={30} h={(p / max) * 170} lit={i === pops.length - 1} color={['#6366f1', '#0ea5e9', '#14b8a6', '#f97316'][i % 4]} />)}
      <Hud items={[['Day', pops.length || null], ['Population', pops[pops.length - 1]]]} color="#fde68a" />
      {done && <Banner text="📈 Boom town!" />}
    </>
  );
}
function Opening({ lines, done }) {
  const score = lastNum(lines, /score\D*(\d+)/i);
  return (
    <>
      <CityBg night />
      {[[20, 40, 90], [70, 50, 130], [130, 40, 70], [180, 60, 150], [250, 46, 110], [306, 70, 90]].map(([x, w, h], i) => <Building key={i} x={x} w={w} h={h} lit={done || i < lines.length} />)}
      <g transform="translate(200 60)">
        <rect x="-90" y="-26" width="180" height="52" rx="10" fill="#0f172a" stroke="#fde047" strokeWidth="2" />
        <text y="-6" textAnchor="middle" fontSize="11" fill="#fde68a" fontWeight="800">CITY SCORE</text>
        <text y="18" textAnchor="middle" fontSize="22" fill="#fff" fontWeight="900" fontFamily="monospace">{score ?? '—'}</text>
      </g>
      {done && <Fireworks />}
    </>
  );
}
function Nodes({ lines, done }) {
  const fixed = pick(lines, /fixed/i).length;
  const pos = [[80, 70], [200, 50], [320, 70], [120, 180], [280, 180]];
  return (
    <>
      <CyberBg />
      {pos.map(([x, y], i) => pos.slice(i + 1).map(([x2, y2], j) => <line key={`${i}-${j}`} x1={x} y1={y} x2={x2} y2={y2} stroke="#10b981" strokeOpacity="0.35" strokeDasharray="4 6" style={{ animation: 'ms-dash 1.5s linear infinite' }} />))}
      {pos.map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <rect x="-24" y="-18" width="48" height="36" rx="6" fill={i < fixed ? '#064e3b' : '#450a0a'} stroke={i < fixed ? '#34d399' : '#f87171'} strokeWidth="2" />
          <text y="7" textAnchor="middle" fontSize="18">{i < fixed ? '✅' : '🐛'}</text>
        </g>
      ))}
      <Hud items={[['Patched', `${fixed}/5`]]} x={150} y={110} color="#34d399" />
      {done && <Banner text="🐛 Network patched!" color="#34d399" />}
    </>
  );
}
function Lock({ lines, done }) {
  const nums = lines.filter((l) => /^\d+$/.test(l)).map(Number);
  const target = [2, 4, 8, 16, 32];
  return (
    <>
      <CyberBg />
      <g transform="translate(200 120)">
        <path d="M-40 -30 V -60 a40 40 0 0 1 80 0 V -30" fill="none" stroke="#94a3b8" strokeWidth="12" style={done ? { transform: 'translateY(-18px)', transition: 'transform .6s' } : undefined} />
        <rect x="-120" y="-34" width="240" height="96" rx="14" fill="#0f172a" stroke={done ? '#34d399' : '#475569'} strokeWidth="3" />
        {target.map((t, i) => {
          const v = nums[i]; const ok = v === t;
          return (
            <g key={i} transform={`translate(${-96 + i * 48} 0)`}>
              <rect width="40" height="44" rx="8" fill={v == null ? '#1e293b' : ok ? '#065f46' : '#7f1d1d'} />
              <text x="20" y="29" textAnchor="middle" fontSize="18" fontWeight="900" fill="#fff" fontFamily="monospace">{v ?? '?'}</text>
            </g>
          );
        })}
      </g>
      {done && <Banner text="🔐 ACCESS GRANTED" color="#34d399" />}
    </>
  );
}
function Signals({ lines, done }) {
  const sig = lines.map((l) => /signal\s*(\d+)\D*(threat|safe)/i.exec(l)).filter(Boolean);
  const locks = pick(lines, /lockdown/i).length;
  return (
    <>
      <CyberBg />
      <g transform="translate(330 130)" style={{ animation: locks ? 'ms-glow 1s infinite' : undefined }}>
        <path d="M0 -50 L40 -34 V 4 C40 30 22 46 0 54 C -22 46 -40 30 -40 4 V -34 Z" fill={locks ? '#065f46' : '#1e293b'} stroke="#34d399" strokeWidth="3" />
        <text y="10" textAnchor="middle" fontSize="26">🤖</text>
      </g>
      {sig.map((m, i) => (
        <g key={i} transform={`translate(${40 + i * 52} ${60 + (i % 2) * 110})`}><g className="ms-c" style={{ animation: 'ms-pop .4s' }}>
          <circle r="20" fill={/threat/i.test(m[2]) ? '#7f1d1d' : '#064e3b'} stroke={/threat/i.test(m[2]) ? '#f87171' : '#34d399'} strokeWidth="2" />
          <text y="5" textAnchor="middle" fontSize="13" fontWeight="900" fill="#fff">{m[1]}</text>
        </g></g>
      ))}
      <Hud items={[['Threats', sig.filter((m) => /threat/i.test(m[2])).length], ['Lockdowns', locks]]} x={10} y={H - 56} color="#f87171" />
      {done && <Banner text="🛡️ Base secured!" color="#34d399" />}
    </>
  );
}
function Layers({ lines, done }) {
  const peeled = pick(lines, /layer/i).length;
  return (
    <>
      <CyberBg />
      {[5, 4, 3, 2, 1].map((n) => (
        <circle key={n} cx="200" cy="130" r={18 + n * 18} fill="none" stroke={n <= 5 - peeled ? '#a855f7' : '#334155'} strokeWidth="10" opacity={n <= 5 - peeled ? 0.9 : 0.25} style={{ transition: 'all .4s' }} />
      ))}
      <text x="200" y="140" textAnchor="middle" fontSize="28">{done ? '📂' : '💾'}</text>
      <Hud items={[['Layers peeled', `${peeled}/5`]]} color="#c084fc" />
      {done && <Banner text="💾 Data restored!" color="#c084fc" />}
    </>
  );
}
function Diagnostic({ lines, done }) {
  const checks = [['Bugs', /fixed/i], ['Lockdown', /lockdown/i], ['Score', /passed/i]];
  return (
    <>
      <CyberBg />
      <g transform="translate(70 50)">
        {checks.map(([k, re], i) => {
          const ok = lines.some((l) => re.test(l));
          return (
            <g key={k} transform={`translate(0 ${i * 44})`}>
              <rect width="260" height="34" rx="8" fill="#0f172a" stroke={ok ? '#34d399' : '#475569'} />
              <text x="14" y="22" fontSize="14" fontWeight="800" fill="#e2e8f0">{k}</text>
              <text x="236" y="23" textAnchor="end" fontSize="16">{ok ? '✅' : '⏳'}</text>
            </g>
          );
        })}
      </g>
      {done && <Banner text="🏆 ALL SYSTEMS GO!" color="#34d399" />}
    </>
  );
}

const SCENES = { launch: Launch, orbit: Orbit, asteroids: Asteroids, beacon: Beacon, landing: Landing, dive: Dive, maze: Maze, shark: Shark, grid: Grid, ascent: Ascent, blueprint: Blueprint, roads: Roads, power: Power, growth: Growth, opening: Opening, nodes: Nodes, lock: Lock, signals: Signals, layers: Layers, diagnostic: Diagnostic };

export default function MissionScene({ scene, lines = [], done = false, failed = false, runKey = 0 }) {
  const S = SCENES[scene] || Launch;
  return (
    <svg key={`${scene}-${runKey}`} viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', borderRadius: 16 }} role="img" aria-label="Mission viewer">
      <style>{KEYFRAMES}</style>
      <S lines={lines} done={done} failed={failed} />
      {failed && !done && <Banner text="Not quite — check the goals" color="#f59e0b" />}
    </svg>
  );
}

export const CAMPAIGN_BG = { space: SpaceBg, ocean: OceanBg, city: CityBg, cyber: CyberBg };
export { Rocket, Sub, Stars };
