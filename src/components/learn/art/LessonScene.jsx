/**
 * LessonScene — the picture for a lesson slide, built from the lesson itself.
 *
 * Every picture = a topic backdrop + a hero object for the topic (or, on the
 * Learn slide, a mini version of the lesson's own worked example) + Dot in a
 * pose for the slide, saying a line from this lesson.
 */
import React, { useId } from 'react';
import DotBot from './DotBot.jsx';

const F = '"Nunito", "Trebuchet MS", system-ui, sans-serif';
const MONO = 'ui-monospace, Menlo, Consolas, monospace';
const INK = '#0f172a';

// ── Topic looks ──────────────────────────────────────────────────────────────
export const LOOKS = {
  safety:      { sky: ['#e0f2fe', '#ccfbf1'], blob: ['#99f6e4', '#bae6fd'], accent: '#0d9488', label: 'Stay safe', icon: '🛡️' },
  kindness:    { sky: ['#ffe4e6', '#fef3c7'], blob: ['#fecdd3', '#fde68a'], accent: '#e11d48', label: 'Be kind', icon: '💚' },
  search:      { sky: ['#e0e7ff', '#f1f5f9'], blob: ['#c7d2fe', '#e2e8f0'], accent: '#4f46e5', label: 'Search smart', icon: '🔎' },
  ai:          { sky: ['#ede9fe', '#e0f2fe'], blob: ['#ddd6fe', '#a5f3fc'], accent: '#7c3aed', label: 'AI', icon: '✨' },
  network:     { sky: ['#dbeafe', '#e0f2fe'], blob: ['#bfdbfe', '#a5f3fc'], accent: '#2563eb', label: 'Networks', icon: '🌐' },
  collab:      { sky: ['#fef9c3', '#dcfce7'], blob: ['#fde68a', '#bbf7d0'], accent: '#16a34a', label: 'Teamwork', icon: '🤝' },
  spreadsheet: { sky: ['#dcfce7', '#ecfeff'], blob: ['#bbf7d0', '#a5f3fc'], accent: '#15803d', label: 'Spreadsheets', icon: '🧮' },
  lists:       { sky: ['#fef3c7', '#ffedd5'], blob: ['#fde68a', '#fed7aa'], accent: '#d97706', label: 'Lists', icon: '📋' },
  variables:   { sky: ['#fef3c7', '#ffedd5'], blob: ['#fde68a', '#fdba74'], accent: '#ea580c', label: 'Variables', icon: '📦' },
  data:        { sky: ['#cffafe', '#e0f2fe'], blob: ['#a5f3fc', '#bae6fd'], accent: '#0891b2', label: 'Data', icon: '📊' },
  web:         { sky: ['#e0f2fe', '#fae8ff'], blob: ['#bae6fd', '#f5d0fe'], accent: '#0284c7', label: 'Web design', icon: '🖥️' },
  media:       { sky: ['#fae8ff', '#ffe4e6'], blob: ['#f5d0fe', '#fecdd3'], accent: '#c026d3', label: 'Create', icon: '🎨' },
  loops:       { sky: ['#f3e8ff', '#e0e7ff'], blob: ['#e9d5ff', '#c7d2fe'], accent: '#7c3aed', label: 'Loops', icon: '🔁' },
  events:      { sky: ['#dcfce7', '#fef9c3'], blob: ['#bbf7d0', '#fde68a'], accent: '#16a34a', label: 'Events', icon: '🏁' },
  conditions:  { sky: ['#fef3c7', '#fee2e2'], blob: ['#fde68a', '#fecaca'], accent: '#d97706', label: 'Decisions', icon: '🔀' },
  sensors:     { sky: ['#e0f2fe', '#dcfce7'], blob: ['#bae6fd', '#bbf7d0'], accent: '#0369a1', label: 'Robots & sensors', icon: '📡' },
  debug:       { sky: ['#dcfce7', '#ecfccb'], blob: ['#bbf7d0', '#d9f99d'], accent: '#15803d', label: 'Debugging', icon: '🐞' },
  predict:     { sky: ['#e0e7ff', '#f3e8ff'], blob: ['#c7d2fe', '#e9d5ff'], accent: '#4338ca', label: 'Predict & trace', icon: '🔮' },
  efficiency:  { sky: ['#fef9c3', '#e0f2fe'], blob: ['#fde68a', '#bae6fd'], accent: '#ca8a04', label: 'Efficiency', icon: '⚡' },
  'search-algo': { sky: ['#e0e7ff', '#ecfeff'], blob: ['#c7d2fe', '#a5f3fc'], accent: '#4f46e5', label: 'Algorithms', icon: '🎯' },
  python:      { sky: ['#dbeafe', '#fef9c3'], blob: ['#bfdbfe', '#fde68a'], accent: '#2563eb', label: 'Python', icon: '🐍' },
  project:     { sky: ['#ffedd5', '#fef3c7'], blob: ['#fed7aa', '#fde68a'], accent: '#ea580c', label: 'Project', icon: '🚀' },
  review:      { sky: ['#e0e7ff', '#fef3c7'], blob: ['#c7d2fe', '#fde68a'], accent: '#4338ca', label: 'Review', icon: '🧠' },
  algorithms:  { sky: ['#ffedd5', '#e0f2fe'], blob: ['#fed7aa', '#bae6fd'], accent: '#c2410c', label: 'Algorithms', icon: '🧩' },
};

// ── Helpers ─────────────────────────────────────────────────────────────────
function wrap(text, max) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = []; let cur = '';
  words.forEach((w) => {
    if ((cur + ' ' + w).trim().length > max) { if (cur) lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim();
  });
  if (cur) lines.push(cur);
  return lines;
}
const clip = (s, n) => (String(s).length > n ? `${String(s).slice(0, n - 1)}…` : String(s));

function Card({ x, y, w, h, children, r = 18, fill = '#fff' }) {
  return (
    <g>
      <rect x={x + 2} y={y + 6} width={w} height={h} rx={r} fill={INK} opacity="0.1" />
      <rect x={x} y={y} width={w} height={h} rx={r} fill={fill} stroke="#e2e8f0" strokeWidth="1.5" />
      {children}
    </g>
  );
}

function Bubble({ x, y, w, text, accent, tail = 'down', size = 15 }) {
  const lines = wrap(text, Math.floor(w / (size * 0.56))).slice(0, 3);
  const h = 18 + lines.length * (size + 4);
  const tx = tail === 'left' ? x : x + w * 0.3;
  return (
    <g>
      <rect x={x + 2} y={y + 4} width={w} height={h} rx="16" fill={INK} opacity="0.1" />
      <rect x={x} y={y} width={w} height={h} rx="16" fill="#fff" stroke={accent} strokeWidth="2.5" />
      {tail === 'down'
        ? <path d={`M${tx} ${y + h - 1} l12 0 l-10 14 z`} fill="#fff" stroke={accent} strokeWidth="2.5" strokeLinejoin="round" />
        : <path d={`M${x + 1} ${y + h * 0.55} l0 -12 l-14 8 z`} fill="#fff" stroke={accent} strokeWidth="2.5" strokeLinejoin="round" />}
      {tail === 'down'
        ? <rect x={tx + 1} y={y + h - 4} width="11" height="5" fill="#fff" />
        : <rect x={x - 1} y={y + h * 0.55 - 11} width="5" height="10" fill="#fff" />}
      {lines.map((ln, i) => (
        <text key={i} x={x + w / 2} y={y + 13 + size + i * (size + 4) - 2} textAnchor="middle" fontFamily={F} fontWeight="800" fontSize={size} fill={INK}>{ln}</text>
      ))}
    </g>
  );
}

function Sparkle({ x, y, s = 1, fill = '#fff', o = 0.9 }) {
  return <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 -9 C1 -2 2 -1 9 0 C2 1 1 2 0 9 C-1 2 -2 1 -9 0 C-2 -1 -1 -2 0 -9 Z" fill={fill} opacity={o} />;
}

// ── Backdrops ───────────────────────────────────────────────────────────────
function Backdrop({ look, W, H, g }) {
  return (
    <>
      <defs>
        <linearGradient id={`${g}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={look.sky[0]} />
          <stop offset="1" stopColor={look.sky[1]} />
        </linearGradient>
        <radialGradient id={`${g}-floor`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <pattern id={`${g}-dots`} width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.6" fill={look.accent} opacity="0.12" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill={`url(#${g}-sky)`} />
      <rect width={W} height={H} fill={`url(#${g}-dots)`} />
      <circle cx={W * 0.9} cy={H * 0.12} r={W * 0.32} fill={look.blob[0]} opacity="0.7" />
      <circle cx={W * 0.05} cy={H * 0.62} r={W * 0.28} fill={look.blob[1]} opacity="0.6" />
      <circle cx={W * 0.75} cy={H * 0.95} r={W * 0.3} fill={look.blob[0]} opacity="0.5" />
      <Sparkle x={W * 0.12} y={H * 0.1} s={1.1} />
      <Sparkle x={W * 0.86} y={H * 0.46} s={0.8} />
      <Sparkle x={W * 0.2} y={H * 0.4} s={0.6} fill={look.accent} o={0.35} />
    </>
  );
}

function Chip({ x, y, look }) {
  const w = 50 + look.label.length * 9.2;
  return (
    <g>
      <rect x={x} y={y} width={w} height="30" rx="15" fill="#fff" opacity="0.92" />
      <text x={x + 11} y={y + 21} fontSize="15">{look.icon}</text>
      <text x={x + 38} y={y + 20} fontFamily={F} fontWeight="900" fontSize="13" fill={look.accent} letterSpacing="0.6">{look.label.toUpperCase()}</text>
    </g>
  );
}

// ── Hero objects: one drawing per topic, in a 220 × 180 box ────────────────
function Hero({ topic, a, sub }) {
  switch (topic) {
    case 'safety':
      return (
        <g>
          <path d="M110 6 L182 32 V88 C182 132 150 162 110 176 C70 162 38 132 38 88 V32 Z" fill={a} />
          <path d="M110 20 L168 41 V88 C168 124 142 149 110 161 C78 149 52 124 52 88 V41 Z" fill="#fff" opacity="0.22" />
          <rect x="84" y="78" width="52" height="44" rx="10" fill="#fff" />
          <path d="M94 80 V66 a16 16 0 0 1 32 0 V80" fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" />
          <circle cx="110" cy="96" r="7" fill={a} /><rect x="107" y="98" width="6" height="14" rx="3" fill={a} />
        </g>
      );
    case 'kindness':
      return (
        <g>
          <Card x={10} y={20} w={130} h={70} r={22}><text x={75} y={64} textAnchor="middle" fontSize="34">💚</text></Card>
          <path d="M40 89 l-6 18 l22 -18 z" fill="#fff" />
          <Card x={80} y={100} w={130} h={70} r={22} fill={a}><text x={145} y={144} textAnchor="middle" fontFamily={F} fontWeight="900" fontSize="20" fill="#fff">Well done!</text></Card>
        </g>
      );
    case 'search':
      return (
        <g>
          <Card x={6} y={18} w={190} h={140}>
            <rect x="6" y="18" width="190" height="26" rx="18" fill="#e2e8f0" />
            {[0, 1, 2].map((i) => <circle key={i} cx={24 + i * 14} cy="31" r="4.5" fill={['#f87171', '#fbbf24', '#4ade80'][i]} />)}
            <rect x="24" y="58" width="150" height="20" rx="10" fill="#f1f5f9" stroke="#cbd5e1" />
            {[0, 1, 2].map((i) => <g key={i}><rect x="24" y={90 + i * 20} width={110 - i * 18} height="7" rx="3.5" fill={i ? '#cbd5e1' : a} /><rect x="24" y={100 + i * 20} width="140" height="5" rx="2.5" fill="#e2e8f0" /></g>)}
          </Card>
          <circle cx="168" cy="122" r="30" fill="#fff" stroke={INK} strokeWidth="9" opacity="0.95" />
          <circle cx="168" cy="122" r="22" fill={a} opacity="0.25" />
          <rect x="188" y="146" width="14" height="38" rx="7" fill={INK} transform="rotate(-42 195 165)" />
        </g>
      );
    case 'ai':
      return (
        <g>
          <rect x="50" y="30" width="120" height="120" rx="26" fill={a} />
          {[0, 1, 2, 3].map((i) => (
            <g key={i}>
              <rect x={66 + i * 24} y="14" width="8" height="18" rx="4" fill={a} opacity="0.7" />
              <rect x={66 + i * 24} y="148" width="8" height="18" rx="4" fill={a} opacity="0.7" />
              <rect x="34" y={46 + i * 24} width="18" height="8" rx="4" fill={a} opacity="0.7" />
              <rect x="168" y={46 + i * 24} width="18" height="8" rx="4" fill={a} opacity="0.7" />
            </g>
          ))}
          <rect x="70" y="50" width="80" height="80" rx="16" fill="#fff" opacity="0.2" />
          <text x="110" y="104" textAnchor="middle" fontFamily={F} fontWeight="900" fontSize="34" fill="#fff">AI</text>
          <Sparkle x={190} y={30} s={1.4} fill="#fbbf24" o={1} /><Sparkle x={30} y={150} s={1} fill="#fbbf24" o={1} />
        </g>
      );
    case 'network':
      return (
        <g>
          <circle cx="110" cy="92" r="58" fill={a} />
          <ellipse cx="110" cy="92" rx="58" ry="22" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="3" />
          <ellipse cx="110" cy="92" rx="24" ry="58" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="3" />
          <line x1="52" y1="92" x2="168" y2="92" stroke="#fff" strokeOpacity="0.5" strokeWidth="3" />
          {[[20, 20, '💻'], [190, 26, '📱'], [16, 160, '🖥️'], [196, 156, '🎮']].map(([x, y, e]) => (
            <g key={e}>
              <line x1={x} y1={y} x2="110" y2="92" stroke={a} strokeWidth="3" strokeDasharray="5 6" />
              <circle cx={x} cy={y} r="22" fill="#fff" stroke={a} strokeWidth="3" />
              <text x={x} y={y + 8} textAnchor="middle" fontSize="22">{e}</text>
            </g>
          ))}
        </g>
      );
    case 'collab':
      return (
        <g>
          {[[20, 60], [120, 60]].map(([x, y], i) => (
            <g key={i}>
              <rect x={x} y={y} width="84" height="58" rx="8" fill={INK} />
              <rect x={x + 6} y={y + 6} width="72" height="44" rx="4" fill={i ? '#bbf7d0' : '#bae6fd'} />
              <rect x={x - 8} y={y + 58} width="100" height="9" rx="4" fill="#94a3b8" />
              <text x={x + 42} y={y + 37} textAnchor="middle" fontSize="22">{i ? '🧭' : '🖱️'}</text>
            </g>
          ))}
          <path d="M104 70 C 108 40, 120 40, 122 70" fill="none" stroke={a} strokeWidth="4" strokeDasharray="4 6" />
          <Card x={60} y={2} w={100} h={38} r={19} fill={a}><text x={110} y={27} textAnchor="middle" fontFamily={F} fontWeight="900" fontSize="15" fill="#fff">Together!</text></Card>
          <Card x={40} y={140} w={140} h={36} r={18}><text x={110} y={164} textAnchor="middle" fontFamily={F} fontWeight="800" fontSize="13" fill={INK}>⭐ ⭐ + 1 wish</text></Card>
        </g>
      );
    case 'spreadsheet':
      return (
        <Card x={10} y={14} w={200} h={156}>
          <rect x="10" y="14" width="200" height="28" rx="18" fill={a} />
          <text x="26" y="33" fontFamily={MONO} fontWeight="700" fontSize="13" fill="#fff">=SUM(B2:B4)</text>
          {[0, 1, 2, 3, 4].map((r) => [0, 1, 2].map((c) => (
            <rect key={`${r}${c}`} x={22 + c * 62} y={52 + r * 22} width="58" height="18" rx="4" fill={r === 4 && c === 1 ? '#bbf7d0' : r === 0 ? '#f1f5f9' : '#fff'} stroke="#e2e8f0" />
          )))}
          {['🍕 6', '🧃 3', '🎈 2'].map((t, i) => <text key={t} x="30" y={86 + i * 22} fontFamily={F} fontSize="12" fontWeight="700">{t.split(' ')[0]}</text>)}
          {['6', '3', '2', '11'].map((t, i) => <text key={i} x="110" y={86 + i * 22} textAnchor="middle" fontFamily={MONO} fontWeight="800" fontSize="13">{t}</text>)}
        </Card>
      );
    case 'lists':
    case 'variables':
      return (
        <g>
          {(topic === 'lists' ? ['map', 'torch', 'key'] : ['score', 'lives', 'timer']).map((t, i) => (
            <g key={t} transform={`translate(${12 + i * 70} ${40 + (i % 2) * 18})`}>
              <path d="M0 30 L32 14 L64 30 L64 96 L32 112 L0 96 Z" fill={a} />
              <path d="M0 30 L32 46 L64 30 L32 14 Z" fill="#fff" opacity="0.35" />
              <path d="M32 46 L32 112" stroke="#fff" strokeOpacity="0.3" strokeWidth="2" />
              <rect x="6" y="56" width="52" height="24" rx="8" fill="#fff" />
              <text x="32" y="73" textAnchor="middle" fontFamily={F} fontWeight="900" fontSize="13" fill={INK}>{t}</text>
              <text x="32" y="10" textAnchor="middle" fontFamily={MONO} fontWeight="900" fontSize="18" fill={a}>{topic === 'lists' ? i + 1 : ['10', '3', '30'][i]}</text>
            </g>
          ))}
        </g>
      );
    case 'data':
      return (
        <Card x={14} y={14} w={192} h={156}>
          {[52, 88, 64, 110].map((h, i) => (
            <g key={i}>
              <rect x={36 + i * 42} y={150 - h} width="28" height={h} rx="6" fill={a} opacity={0.55 + i * 0.12} />
            </g>
          ))}
          <line x1="28" y1="152" x2="196" y2="152" stroke="#94a3b8" strokeWidth="2" />
          <polyline points="50,110 92,80 134,96 176,48" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          {[[50, 110], [92, 80], [134, 96], [176, 48]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="5" fill="#fff" stroke="#f59e0b" strokeWidth="3" />)}
        </Card>
      );
    case 'web':
      return (
        <Card x={8} y={14} w={204} h={156}>
          <rect x="8" y="14" width="204" height="24" rx="18" fill="#e2e8f0" />
          {[0, 1, 2].map((i) => <circle key={i} cx={24 + i * 13} cy="26" r="4" fill={['#f87171', '#fbbf24', '#4ade80'][i]} />)}
          <rect x="22" y="48" width="176" height="42" rx="8" fill={a} />
          <text x="110" y="75" textAnchor="middle" fontFamily={F} fontWeight="900" fontSize="16" fill="#fff">&lt;h1&gt; My Site</text>
          <rect x="22" y="98" width="82" height="58" rx="8" fill="#f1f5f9" /><text x="63" y="134" textAnchor="middle" fontSize="24">🖼️</text>
          {[0, 1, 2, 3].map((i) => <rect key={i} x="114" y={102 + i * 13} width={84 - (i % 2) * 20} height="7" rx="3.5" fill="#cbd5e1" />)}
        </Card>
      );
    case 'media':
      return (
        <g>
          <path d="M60 176 L84 40 M160 176 L136 40 M110 176 V150" stroke="#92400e" strokeWidth="7" strokeLinecap="round" />
          <Card x={40} y={14} w={140} h={120} r={10}>
            <circle cx="80" cy="66" r="24" fill="#f472b6" opacity="0.8" />
            <rect x="96" y="56" width="50" height="50" rx="8" fill={a} opacity="0.75" transform="rotate(12 121 81)" />
            <path d="M58 116 Q 90 86 160 112" stroke="#22c55e" strokeWidth="6" fill="none" strokeLinecap="round" />
          </Card>
          <ellipse cx="190" cy="150" rx="30" ry="22" fill="#fde68a" stroke="#d97706" strokeWidth="3" />
          {['#ef4444', '#3b82f6', '#22c55e', '#a855f7'].map((c, i) => <circle key={c} cx={176 + (i % 2) * 22} cy={142 + Math.floor(i / 2) * 14} r="5.5" fill={c} />)}
        </g>
      );
    case 'loops':
      return (
        <g>
          <circle cx="110" cy="92" r="64" fill="none" stroke={a} strokeWidth="16" strokeDasharray="300 102" strokeLinecap="round" transform="rotate(-60 110 92)" />
          <path d="M150 28 l30 4 l-18 24 z" fill={a} />
          {[0, 1, 2, 3].map((i) => {
            const ang = (i / 4) * Math.PI * 2 - Math.PI / 2;
            return <g key={i}><circle cx={110 + Math.cos(ang) * 64} cy={92 + Math.sin(ang) * 64} r="15" fill="#fff" stroke={a} strokeWidth="3" /><text x={110 + Math.cos(ang) * 64} y={97 + Math.sin(ang) * 64} textAnchor="middle" fontFamily={F} fontWeight="900" fontSize="14" fill={a}>{i + 1}</text></g>;
          })}
          <text x="110" y="100" textAnchor="middle" fontFamily={F} fontWeight="900" fontSize="22" fill={INK}>× {sub || 4}</text>
        </g>
      );
    case 'events':
      return (
        <g>
          <rect x="40" y="128" width="140" height="40" rx="12" fill={a} />
          <rect x="54" y="114" width="112" height="22" rx="10" fill={a} opacity="0.7" />
          <rect x="104" y="18" width="8" height="100" rx="4" fill={INK} />
          <path d="M112 22 C 140 12, 156 34, 186 22 V 74 C 156 86, 140 64, 112 74 Z" fill="#22c55e" stroke={INK} strokeWidth="3" />
          {[[0, 0], [1, 1], [2, 0], [0, 2], [1, 3], [2, 2]].map(([c, r]) => <rect key={`${c}${r}`} x={122 + c * 20} y={28 + r * 11} width="10" height="9" fill="#fff" opacity="0.7" />)}
          <Sparkle x={60} y={60} s={1.6} fill="#fbbf24" o={1} /><Sparkle x={196} y={104} s={1.1} fill="#fbbf24" o={1} />
        </g>
      );
    case 'conditions':
      return (
        <g>
          <rect x="104" y="40" width="12" height="136" rx="6" fill="#92400e" />
          <path d="M116 46 H190 L210 66 L190 86 H116 Z" fill="#22c55e" stroke={INK} strokeWidth="3" />
          <text x="160" y="72" textAnchor="middle" fontFamily={F} fontWeight="900" fontSize="18" fill="#fff">YES</text>
          <path d="M104 96 H30 L10 116 L30 136 H104 Z" fill="#ef4444" stroke={INK} strokeWidth="3" />
          <text x="60" y="122" textAnchor="middle" fontFamily={F} fontWeight="900" fontSize="18" fill="#fff">NO</text>
          <circle cx="110" cy="22" r="20" fill="#fff" stroke={a} strokeWidth="4" />
          <text x="110" y="31" textAnchor="middle" fontFamily={F} fontWeight="900" fontSize="24" fill={a}>if</text>
        </g>
      );
    case 'sensors':
      return (
        <g>
          {[70, 50, 30].map((r, i) => <path key={r} d={`M${110 - r} ${92 - r * 0.2} A ${r} ${r} 0 0 1 ${110 + r} ${92 - r * 0.2}`} fill="none" stroke={a} strokeWidth="6" strokeLinecap="round" opacity={0.35 + i * 0.25} />)}
          <rect x="70" y="94" width="80" height="60" rx="16" fill={a} />
          <circle cx="94" cy="122" r="12" fill="#fff" /><circle cx="126" cy="122" r="12" fill="#fff" />
          <circle cx="94" cy="122" r="6" fill={INK} /><circle cx="126" cy="122" r="6" fill={INK} />
          <rect x="64" y="154" width="92" height="14" rx="7" fill="#475569" />
          <text x="22" y="170" fontSize="28">💡</text><text x="172" y="170" fontSize="28">🌡️</text>
        </g>
      );
    case 'debug':
      return (
        <g>
          <ellipse cx="96" cy="100" rx="44" ry="54" fill="#ef4444" stroke={INK} strokeWidth="4" />
          <path d="M96 48 V152" stroke={INK} strokeWidth="4" />
          <circle cx="96" cy="44" r="22" fill={INK} />
          {[[-1, 70], [-1, 100], [-1, 130], [1, 70], [1, 100], [1, 130]].map(([s, y], i) => <path key={i} d={`M${96 + s * 42} ${y} l${s * 26} ${-8 + (i % 3) * 8}`} stroke={INK} strokeWidth="5" strokeLinecap="round" />)}
          {[[78, 86], [114, 92], [82, 124], [112, 128]].map(([x, y]) => <circle key={x + y} cx={x} cy={y} r="8" fill={INK} />)}
          <path d="M84 26 l-10 -16 M108 26 l10 -16" stroke={INK} strokeWidth="4" strokeLinecap="round" />
          <circle cx="160" cy="120" r="34" fill="#fff" fillOpacity="0.5" stroke={INK} strokeWidth="9" />
          <rect x="184" y="146" width="14" height="38" rx="7" fill={INK} transform="rotate(-42 191 165)" />
        </g>
      );
    case 'predict':
      return (
        <g>
          <Card x={30} y={10} w={160} h={160}>
            {Array.from({ length: 16 }, (_, n) => <rect key={n} x={44 + (n % 4) * 34} y={24 + Math.floor(n / 4) * 34} width="32" height="32" rx="6" fill={(n + Math.floor(n / 4)) % 2 ? '#c7f9cc' : '#e9fbe9'} />)}
            <polyline points="60,40 128,40 128,108 162,108" fill="none" stroke={a} strokeWidth="5" strokeDasharray="3 8" strokeLinecap="round" strokeLinejoin="round" />
            <text x="162" y="118" textAnchor="middle" fontSize="24">⭐</text>
            <circle cx="60" cy="40" r="10" fill={a} />
          </Card>
          <circle cx="196" cy="34" r="24" fill={a} /><text x="196" y="45" textAnchor="middle" fontFamily={F} fontWeight="900" fontSize="30" fill="#fff">?</text>
        </g>
      );
    case 'efficiency':
      return (
        <g>
          <circle cx="110" cy="100" r="68" fill="#fff" stroke={a} strokeWidth="10" />
          <rect x="98" y="14" width="24" height="20" rx="6" fill={a} />
          {Array.from({ length: 12 }, (_, i) => <line key={i} x1="110" y1="42" x2="110" y2="50" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" transform={`rotate(${i * 30} 110 100)`} />)}
          <path d="M118 52 L92 108 H112 L100 152 L134 88 H112 Z" fill="#facc15" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        </g>
      );
    case 'search-algo':
      return (
        <g>
          {Array.from({ length: 9 }, (_, i) => <rect key={i} x={14 + i * 22} y={60} width="18" height="60" rx="5" fill={i < 4 ? '#e2e8f0' : i === 6 ? '#22c55e' : a} opacity={i < 4 ? 1 : 0.85} />)}
          <path d="M100 30 V140" stroke="#ef4444" strokeWidth="4" strokeDasharray="6 6" />
          <text x="100" y="22" textAnchor="middle" fontFamily={F} fontWeight="900" fontSize="15" fill="#ef4444">middle</text>
          <circle cx="152" cy="150" r="24" fill="#fff" stroke={a} strokeWidth="4" /><circle cx="152" cy="150" r="14" fill="none" stroke={a} strokeWidth="4" /><circle cx="152" cy="150" r="5" fill="#ef4444" />
        </g>
      );
    case 'python':
      return (
        <Card x={8} y={12} w={204} h={160} fill="#0f172a">
          {[0, 1, 2].map((i) => <circle key={i} cx={26 + i * 14} cy="28" r="4.5" fill={['#f87171', '#fbbf24', '#4ade80'][i]} />)}
          {[
            [['#f0abfc', 'for '], ['#e2e8f0', 'i '], ['#f0abfc', 'in '], ['#7dd3fc', 'range'], ['#e2e8f0', '(3):']],
            [['#e2e8f0', '    '], ['#7dd3fc', 'print'], ['#e2e8f0', '('], ['#86efac', '"Hi!"'], ['#e2e8f0', ')']],
            [['#94a3b8', '# Hi! Hi! Hi!']],
          ].map((line, li) => (
            <text key={li} x="24" y={66 + li * 26} fontFamily={MONO} fontWeight="700" fontSize="15">
              {line.map(([c, t], k) => <tspan key={k} fill={c}>{t}</tspan>)}
            </text>
          ))}
          <path d="M150 150 c 10 -20 30 -20 40 0 s 0 -24 -20 -30" fill="none" stroke="#facc15" strokeWidth="9" strokeLinecap="round" />
          <circle cx="170" cy="120" r="3" fill={INK} />
        </Card>
      );
    case 'project':
      return (
        <g>
          <Card x={6} y={40} w={150} h={120} fill="#1d4ed8">
            {Array.from({ length: 6 }, (_, i) => <line key={i} x1="6" y1={60 + i * 18} x2="156" y2={60 + i * 18} stroke="#fff" strokeOpacity="0.15" />)}
            <rect x="26" y="70" width="50" height="34" rx="4" fill="none" stroke="#fff" strokeWidth="2.5" strokeDasharray="4 4" />
            <rect x="88" y="90" width="48" height="48" rx="4" fill="none" stroke="#fff" strokeWidth="2.5" />
            <path d="M76 87 H88" stroke="#fff" strokeWidth="2.5" />
          </Card>
          <path d="M176 18 C 196 40, 196 80, 186 104 H166 C 156 80, 156 40, 176 18 Z" fill="#fff" stroke={INK} strokeWidth="3" />
          <circle cx="176" cy="54" r="9" fill={a} stroke={INK} strokeWidth="2.5" />
          <path d="M166 92 l-14 18 h14 z M186 92 l14 18 h-14 z" fill="#ef4444" stroke={INK} strokeWidth="2.5" />
          <path d="M170 106 q6 22 12 0" fill="#f59e0b" />
        </g>
      );
    case 'review':
      return (
        <g>
          {[2, 1, 0].map((i) => (
            <Card key={i} x={30 + i * 14} y={30 + i * 14} w={140} h={100} r={16} fill={i ? ['#fde68a', '#c7d2fe'][i - 1] : '#fff'}>
              {i === 0 && <><text x={100} y={86} textAnchor="middle" fontFamily={F} fontWeight="900" fontSize="20" fill={a}>Remember?</text><text x={100} y={112} textAnchor="middle" fontSize="20">🧠</text></>}
            </Card>
          ))}
          <path d="M196 120 l7 15 16 2 -12 11 3 16 -14 -8 -14 8 3 -16 -12 -11 16 -2 z" fill="#facc15" stroke={INK} strokeWidth="2.5" />
        </g>
      );
    default:
      return (
        <g>
          <Card x={10} y={16} w={150} h={150}>
            <text x={30} y={50} fontFamily={F} fontWeight="900" fontSize="15" fill={a}>RECIPE</text>
            {['Get bread', 'Toast it', 'Add jam', 'Eat!'].map((t, i) => (
              <g key={t}>
                <circle cx="38" cy={74 + i * 24} r="10" fill={a} />
                <text x="38" y={79 + i * 24} textAnchor="middle" fontFamily={F} fontWeight="900" fontSize="12" fill="#fff">{i + 1}</text>
                <text x="56" y={79 + i * 24} fontFamily={F} fontWeight="800" fontSize="14" fill={INK}>{t}</text>
              </g>
            ))}
          </Card>
          {[[180, 50, 26], [196, 110, 18]].map(([x, y, r], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r={r} fill="#94a3b8" />
              {Array.from({ length: 8 }, (_, k) => <rect key={k} x={x - 5} y={y - r - 7} width="10" height="12" rx="3" fill="#94a3b8" transform={`rotate(${k * 45} ${x} ${y})`} />)}
              <circle cx={x} cy={y} r={r * 0.4} fill="#fff" />
            </g>
          ))}
        </g>
      );
  }
}

// ── Mini worked example from the lesson's teaching content (220 × 180) ──────
const BLOCK_FILL = [
  [/^(when|broadcast)/i, '#ffab19'], [/^(move|turn|go to|glide|change x|change y|set x)/i, '#4c97ff'],
  [/^(say|think|switch|next costume|show|hide)/i, '#9966ff'], [/^(play sound)/i, '#cf63cf'],
  [/^(repeat|forever|if|else|wait|end)/i, '#ffbf00'], [/^(set|change|add|delete)/i, '#ff8c1a'], [/^(pen)/i, '#0fbd8c'],
];
const fillFor = (t) => (BLOCK_FILL.find(([re]) => re.test(t)) || [0, '#59c059'])[1];

function MiniExample({ ex, a }) {
  if (!ex) return null;
  if (ex.type === 'blocks' || (ex.type === 'compare' && ex.right?.blocks) || ex.type === 'flow' && ex.blocks) {
    const blocks = (ex.blocks || ex.right.items).slice(0, 7);
    return (
      <Card x={0} y={0} w={220} h={24 + blocks.length * 22}>
        {blocks.map((b, i) => {
          const depth = (b.match(/^ */)[0].length / 2) | 0; const t = b.trim();
          return t === 'end'
            ? <rect key={i} x={14 + depth * 14} y={12 + i * 22} width="40" height="10" rx="4" fill="#ffbf00" />
            : (
              <g key={i}>
                <rect x={14 + depth * 14} y={12 + i * 22} width={Math.min(190 - depth * 14, 26 + t.length * 7.2)} height="19" rx={/^when/i.test(t) ? 9 : 5} fill={fillFor(t)} />
                <text x={22 + depth * 14} y={26 + i * 22} fontFamily={F} fontWeight="800" fontSize="12" fill="#fff">{clip(t.replace('▶', '🏁'), 24)}</text>
              </g>
            );
        })}
      </Card>
    );
  }
  if (ex.type === 'code') {
    const lines = ex.code.split('\n').slice(0, 7);
    return (
      <Card x={0} y={0} w={220} h={30 + lines.length * 19} fill="#0f172a">
        {lines.map((ln, i) => <text key={i} x="14" y={26 + i * 19} fontFamily={MONO} fontSize="11.5" fontWeight="700" fill={/^\s*#/.test(ln) ? '#94a3b8' : /print|def|for|if|while|IF|ELSE|REPEAT/.test(ln) ? '#f0abfc' : '#e2e8f0'}>{clip(ln.replace(/ {4}/g, '  '), 27)}</text>)}
      </Card>
    );
  }
  if (ex.type === 'bars') {
    const data = ex.data.slice(0, 5); const max = Math.max(...data.map((d) => d[1]));
    return (
      <Card x={0} y={0} w={220} h={170}>
        {data.map(([l, v], i) => (
          <g key={l}>
            <rect x={18 + i * 40} y={140 - (v / max) * 108} width="28" height={(v / max) * 108} rx="5" fill={a} opacity={0.6 + (v / max) * 0.4} />
            <text x={32 + i * 40} y={134 - (v / max) * 108} textAnchor="middle" fontFamily={F} fontWeight="900" fontSize="11">{v}</text>
            <text x={32 + i * 40} y={158} textAnchor="middle" fontFamily={F} fontWeight="800" fontSize="10" fill="#475569">{clip(l, 7)}</text>
          </g>
        ))}
        <line x1="12" y1="141" x2="208" y2="141" stroke="#94a3b8" strokeWidth="2" />
      </Card>
    );
  }
  if (ex.type === 'grid') {
    const cell = Math.min(34, Math.floor(196 / ex.cols));
    const pts = ex.path.map(([c, r]) => `${12 + c * cell + cell / 2},${12 + r * cell + cell / 2}`).join(' ');
    const end = ex.path[ex.path.length - 1];
    const wallSet = new Set((ex.walls || []).map(([c, r]) => `${c},${r}`));
    return (
      <Card x={0} y={0} w={24 + ex.cols * cell} h={24 + ex.rows * cell}>
        {Array.from({ length: ex.cols * ex.rows }, (_, n) => {
          const c = n % ex.cols; const r = Math.floor(n / ex.cols);
          return <rect key={n} x={12 + c * cell} y={12 + r * cell} width={cell - 2} height={cell - 2} rx="4" fill={wallSet.has(`${c},${r}`) ? '#94a3b8' : (c + r) % 2 ? '#c7f9cc' : '#e9fbe9'} />;
        })}
        <polyline points={pts} fill="none" stroke={a} strokeWidth="4" strokeDasharray="2 7" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={12 + ex.start[0] * cell + cell / 2} cy={12 + ex.start[1] * cell + cell / 2} r={cell * 0.3} fill={a} />
        <text x={12 + end[0] * cell + cell / 2} y={12 + end[1] * cell + cell * 0.72} textAnchor="middle" fontSize={cell * 0.6}>⭐</text>
      </Card>
    );
  }
  if (ex.type === 'flow') {
    return (
      <g>
        <path d="M110 4 L196 60 L110 116 L24 60 Z" fill="#fff9db" stroke={a} strokeWidth="3" />
        {wrap(ex.question, 16).slice(0, 3).map((ln, i, arr) => <text key={i} x="110" y={64 - (arr.length - 1) * 8 + i * 16} textAnchor="middle" fontFamily={F} fontWeight="900" fontSize="13">{ln}</text>)}
        <Card x={0} y={130} w={104} h={46} r={12} fill="#dcfce7"><text x="52" y="149" textAnchor="middle" fontFamily={F} fontWeight="900" fontSize="12" fill="#15803d">YES</text><text x="52" y="166" textAnchor="middle" fontFamily={F} fontSize="10.5" fontWeight="700">{clip(ex.yes, 18)}</text></Card>
        <Card x={116} y={130} w={104} h={46} r={12} fill="#fee2e2"><text x="168" y="149" textAnchor="middle" fontFamily={F} fontWeight="900" fontSize="12" fill="#b91c1c">NO</text><text x="168" y="166" textAnchor="middle" fontFamily={F} fontSize="10.5" fontWeight="700">{clip(ex.no, 18)}</text></Card>
      </g>
    );
  }
  if (ex.type === 'compare') {
    const col = (side, x, tone) => (
      <Card x={x} y={0} w={104} h={40 + Math.min(4, side.items.length) * 26} r={14} fill={tone}>
        {wrap(side.label.replace(/^[^\w“"]+/u, ''), 13).slice(0, 2).map((ln, i) => <text key={i} x={x + 52} y={18 + i * 13} textAnchor="middle" fontFamily={F} fontWeight="900" fontSize="11">{ln}</text>)}
        {side.items.slice(0, 4).map((t, i) => (
          <g key={i}><rect x={x + 8} y={38 + i * 26} width="88" height="20" rx="6" fill="#fff" /><text x={x + 52} y={52 + i * 26} textAnchor="middle" fontFamily={F} fontWeight="700" fontSize="9.5">{clip(t.trim(), 18)}</text></g>
        ))}
      </Card>
    );
    return <g>{col(ex.left, 0, '#fee2e2')}{col(ex.right, 116, '#dcfce7')}</g>;
  }
  const rows = ex.type === 'steps' ? ex.items.map((t) => [t]) : ex.type === 'table' ? ex.rows.map((r) => [r[0], r.length > 2 ? r[r.length - 1] : r[1]]) : [];
  if (!rows.length) return null;
  const list = rows.slice(0, 5);
  return (
    <Card x={0} y={0} w={220} h={22 + list.length * 30}>
      {list.map((r, i) => (
        <g key={i}>
          <circle cx="24" cy={26 + i * 30} r="10" fill={a} />
          <text x="24" y={30 + i * 30} textAnchor="middle" fontFamily={F} fontWeight="900" fontSize="11" fill="#fff">{i + 1}</text>
          <text x="42" y={30 + i * 30} fontFamily={F} fontWeight="800" fontSize="12" fill={INK}>{clip(r.filter(Boolean).join(' – ').replace(/^[^\w“"(<=]+/u, ''), 25)}</text>
        </g>
      ))}
    </Card>
  );
}

// ── Slide compositions ──────────────────────────────────────────────────────
const POSE = { title: 'wave', walt: 'point', starter: 'think', learn: 'point', practice: 'cheer', plenary: 'cheer', quiz: 'think', done: 'cheer' };

function Objectives({ a }) {
  return (
    <g>
      <circle cx="70" cy="80" r="62" fill="#fff" stroke={a} strokeWidth="10" />
      <circle cx="70" cy="80" r="38" fill="none" stroke={a} strokeWidth="10" />
      <circle cx="70" cy="80" r="14" fill="#ef4444" />
      <path d="M70 80 L150 10" stroke={INK} strokeWidth="5" strokeLinecap="round" /><path d="M150 10 l-4 18 m4 -18 l-18 4" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <Card x={120} y={70} w={100} h={100} r={16}>
        {[0, 1, 2].map((i) => <g key={i}><rect x="134" y={86 + i * 26} width="18" height="18" rx="5" fill={a} /><path d={`M138 ${95 + i * 26} l4 4 7 -8`} stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" /><rect x="160" y={91 + i * 26} width={46 - i * 8} height="8" rx="4" fill="#cbd5e1" /></g>)}
      </Card>
    </g>
  );
}

function Trophy({ a }) {
  return (
    <g>
      <path d="M70 20 H150 V70 C150 100 130 116 110 116 C90 116 70 100 70 70 Z" fill="#facc15" stroke={INK} strokeWidth="4" />
      <path d="M70 34 H46 C46 64 60 74 74 76 M150 34 H174 C174 64 160 74 146 76" fill="none" stroke={INK} strokeWidth="5" />
      <rect x="100" y="116" width="20" height="24" fill="#eab308" stroke={INK} strokeWidth="3" />
      <rect x="76" y="140" width="68" height="20" rx="6" fill={a} stroke={INK} strokeWidth="3" />
      <path d="M110 40 l6 12 13 2 -10 9 3 13 -12 -7 -12 7 3 -13 -10 -9 13 -2 z" fill="#fff" />
      <Sparkle x={36} y={20} s={1.4} fill="#facc15" o={1} /><Sparkle x={196} y={50} s={1.1} fill="#facc15" o={1} /><Sparkle x={190} y={130} s={0.8} fill={a} o={0.8} />
    </g>
  );
}

function Question({ a }) {
  return (
    <g>
      <circle cx="110" cy="84" r="74" fill="#fff" stroke={a} strokeWidth="6" />
      <text x="110" y="124" textAnchor="middle" fontFamily={F} fontWeight="900" fontSize="110" fill={a}>?</text>
      <circle cx="30" cy="150" r="10" fill="#fff" stroke={a} strokeWidth="4" /><circle cx="14" cy="172" r="6" fill="#fff" stroke={a} strokeWidth="3" />
    </g>
  );
}

function shortTitle(title = '') {
  const t = title.replace(/^(mini-project|capstone|studio)\s*:\s*/i, '').replace(/\s*\((part \d|intro|deep|simulated|child model)\)/i, '').trim();
  return t.length <= 34 ? t : t.split(/\s[—–-]\s|:\s|\(/)[0].trim();
}

export default function LessonScene({ topic = 'algorithms', lesson, teaching, slide = 'title', wide = false, accentSub }) {
  const g = `ls${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const look = LOOKS[topic] || LOOKS.algorithms;
  const a = look.accent;
  const T = teaching || {};
  const sum = T.summary || [];
  const kind = slide.startsWith('task') ? 'practice' : slide === 'walt' ? 'walt' : slide;
  const pose = POSE[kind] || 'idle';
  const say = {
    title: lesson ? `${clip(shortTitle(lesson.title), 38)}${/[!?]$/.test(shortTitle(lesson.title)) ? '' : '!'}` : look.label,
    walt: 'Today I can…',
    starter: 'Hmm… what do you think?',
    learn: sum[0] || 'Let’s learn!',
    practice: sum[1] || 'Your turn!',
    plenary: sum[2] || sum[0] || 'You did it!',
    quiz: 'Quiz time!',
    done: 'Brilliant work!',
  }[kind] || look.label;

  let centre;
  if (kind === 'walt') centre = <Objectives a={a} />;
  else if (kind === 'starter' || kind === 'quiz') centre = <Question a={a} />;
  else if (kind === 'plenary' || kind === 'done') centre = <Trophy a={a} />;
  else if (kind === 'learn' && T.example) centre = <MiniExample ex={T.example} a={a} />;
  else centre = <Hero topic={topic} a={a} sub={accentSub} />;

  if (wide) {
    const W = 640; const H = 220;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden>
        <Backdrop look={look} W={W} H={H} g={g} />
        <ellipse cx="120" cy="206" rx="80" ry="14" fill={`url(#${g}-floor)`} />
        <DotBot x={72} y={30} scale={1.08} pose={pose} />
        <Bubble x={190} y={24} w={190} text={say} accent={a} tail="left" size={15} />
        <g transform="translate(400 22) scale(0.98)">{centre}</g>
        <Chip x={190} y={170} look={look} />
      </svg>
    );
  }

  const W = 360; const H = 520;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden>
      <Backdrop look={look} W={W} H={H} g={g} />
      <Chip x={20} y={20} look={look} />
      <g transform={kind === 'learn' && T.example ? 'translate(52 76) scale(1.16)' : 'translate(70 70)'}>{centre}</g>
      <ellipse cx="128" cy="500" rx="110" ry="18" fill={`url(#${g}-floor)`} />
      <DotBot x={62} y={316} scale={1.18} pose={pose} />
      <Bubble x={190} y={300} w={158} text={say} accent={a} tail="left" size={14} />
    </svg>
  );
}
