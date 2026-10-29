/**
 * ByteBuddies profile avatars — glossy robot portraits in the style of the
 * ByteBuddies mascot (white shell, coloured trim, dark visor with glowing eyes), drawn in SVG.
 *
 * A user's avatar is stored in the existing `avatarEmoji` field as an id like
 * "bot-7". Older accounts still hold an emoji there; those are mapped to a robot
 * automatically, so everyone gets one without choosing again.
 */
import { useId } from 'react';

// Trim colour, background pair, glow colour for the visor
const TRIMS = {
  purple: { trim: '#a78bfa', deep: '#7c3aed', bg: ['#4c1d95', '#1e1b4b'] },
  cyan: { trim: '#22d3ee', deep: '#0891b2', bg: ['#155e75', '#0c1a3a'] },
  orange: { trim: '#fb923c', deep: '#ea580c', bg: ['#9a3412', '#2a1030'] },
  green: { trim: '#34d399', deep: '#059669', bg: ['#065f46', '#0b1f2e'] },
  pink: { trim: '#f472b6', deep: '#db2777', bg: ['#9d174d', '#2a0f3a'] },
  yellow: { trim: '#facc15', deep: '#ca8a04', bg: ['#854d0e', '#25163a'] },
  blue: { trim: '#60a5fa', deep: '#2563eb', bg: ['#1e3a8a', '#0f1030'] },
  red: { trim: '#f87171', deep: '#dc2626', bg: ['#991b1b', '#260d2e'] },
};
const GLOW = { cyan: '#5eead4', pink: '#f9a8d4', green: '#86efac', yellow: '#fde68a', blue: '#93c5fd', violet: '#c4b5fd' };

// 24 hand-picked combinations: [trim, glow, eyes, mouth, top, dark shell?]
const DESIGNS = [
  ['purple', 'cyan', 'big', 'open', 'star', false],
  ['cyan', 'cyan', 'arcs', 'smile', 'phones', false],
  ['orange', 'yellow', 'star', 'open', 'cap', false],
  ['green', 'green', 'wink', 'grin', 'ball', false],
  ['pink', 'pink', 'heart', 'open', 'bow', false],
  ['yellow', 'yellow', 'big', 'smile', 'crown', true],
  ['blue', 'blue', 'cool', 'grin', 'twin', false],
  ['red', 'cyan', 'big', 'o', 'propeller', false],
  ['purple', 'violet', 'arcs', 'open', 'cat', true],
  ['cyan', 'cyan', 'big', 'grin', 'ball', true],
  ['orange', 'cyan', 'wink', 'open', 'phones', false],
  ['green', 'yellow', 'star', 'smile', 'propeller', false],
  ['pink', 'violet', 'big', 'open', 'cat', false],
  ['yellow', 'cyan', 'cool', 'smile', 'cap', false],
  ['blue', 'cyan', 'heart', 'grin', 'star', true],
  ['red', 'pink', 'arcs', 'grin', 'crown', false],
  ['purple', 'pink', 'wink', 'smile', 'twin', false],
  ['cyan', 'green', 'big', 'open', 'bow', false],
  ['orange', 'yellow', 'big', 'grin', 'ball', true],
  ['green', 'cyan', 'cool', 'open', 'phones', true],
  ['pink', 'pink', 'star', 'o', 'star', false],
  ['yellow', 'yellow', 'arcs', 'open', 'propeller', false],
  ['blue', 'violet', 'big', 'smile', 'cat', false],
  ['red', 'yellow', 'wink', 'open', 'cap', true],
];

export const AVATAR_IDS = DESIGNS.map((_, i) => `bot-${i + 1}`);

function design(index) {
  const i = ((index % 24) + 24) % 24;
  const [trim, glow, eyes, mouth, top, dark] = DESIGNS[i];
  return { ...TRIMS[trim], glow: GLOW[glow], eyes, mouth, top, dark };
}

/** Which design to draw for a stored value (bot id, old emoji, or nothing). */
export function avatarIndex(value, fallbackName = '') {
  const v = String(value || '');
  const m = v.match(/^bot-(\d+)$/);
  if (m) return Number(m[1]) - 1;
  // Old emoji avatars (often the same default for everyone) + the name → a varied robot
  const seed = `${v}|${fallbackName}` || '?';
  let h = 7;
  for (const ch of seed) h = (h * 31 + ch.codePointAt(0)) >>> 0;
  return h % 24;
}

export function isBotAvatar(value) {
  return /^bot-\d+$/.test(String(value || ''));
}

const star = (cx, cy, r) => {
  const p = [];
  for (let k = 0; k < 10; k++) {
    const a = -Math.PI / 2 + (k * Math.PI) / 5;
    const rr = k % 2 ? r * 0.48 : r;
    p.push(`${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`);
  }
  return p.join(' ');
};
const heart = (cx, cy, s) => `M${cx} ${cy + s * 0.9} C${cx - s * 1.6} ${cy - s * 0.1} ${cx - s * 0.8} ${cy - s * 1.3} ${cx} ${cy - s * 0.45} C${cx + s * 0.8} ${cy - s * 1.3} ${cx + s * 1.6} ${cy - s * 0.1} ${cx} ${cy + s * 0.9} Z`;

function Eyes({ d, id }) {
  const g = d.glow;
  const big = (x) => (
    <g key={x}>
      <ellipse cx={x} cy="50" rx="5.4" ry="6.4" fill={g} />
      <ellipse cx={x} cy="50.6" rx="3.5" ry="4.3" fill="#0b3a4a" opacity="0.55" />
      <circle cx={x + 1.7} cy="47.6" r="1.7" fill="#fff" />
      <circle cx={x - 1.6} cy="52.4" r="0.8" fill="#fff" opacity="0.8" />
    </g>
  );
  const arc = (x) => <path key={x} d={`M${x - 5} 51.5 Q${x} 44.5 ${x + 5} 51.5`} fill="none" stroke={g} strokeWidth="2.8" strokeLinecap="round" />;
  const brows = <g fill="none" stroke={g} strokeWidth="1.6" strokeLinecap="round" opacity="0.85"><path d="M35.5 41.5 Q40 39.2 44.5 41.2" /><path d="M55.5 41.2 Q60 39.2 64.5 41.5" /></g>;
  let eyes;
  if (d.eyes === 'arcs') eyes = [arc(40), arc(60)];
  else if (d.eyes === 'wink') eyes = [big(40), arc(60)];
  else if (d.eyes === 'star') eyes = [40, 60].map((x) => <polygon key={x} points={star(x, 50, 6.4)} fill={g} strokeLinejoin="round" stroke={g} strokeWidth="0.8" />);
  else if (d.eyes === 'heart') eyes = [40, 60].map((x) => <path key={x} d={heart(x, 50.5, 4.6)} fill={g} />);
  else if (d.eyes === 'cool') eyes = (
    <g>
      <rect x="31.5" y="45" width="37" height="9" rx="4.5" fill={g} />
      <rect x="34" y="46.6" width="10" height="2.2" rx="1.1" fill="#fff" opacity="0.7" />
    </g>
  );
  else eyes = [big(40), big(60)];
  return <g filter={`url(#glow-${id})`}>{d.eyes === 'big' || d.eyes === 'wink' ? brows : null}{eyes}</g>;
}

function Mouth({ d, id }) {
  const g = d.glow;
  let m;
  if (d.mouth === 'open') m = (<g><path d="M44 58.5 Q50 59.6 56 58.5 Q55 65.5 50 65.5 Q45 65.5 44 58.5 Z" fill={g} /><path d="M46.5 62.8 Q50 61 53.5 62.8 Q52 64.6 50 64.6 Q48 64.6 46.5 62.8 Z" fill="#fff" opacity="0.55" /></g>);
  else if (d.mouth === 'grin') m = <path d="M42.5 58.5 Q50 61 57.5 58.5 Q56 64 50 64 Q44 64 42.5 58.5 Z" fill={g} />;
  else if (d.mouth === 'o') m = <ellipse cx="50" cy="61" rx="2.8" ry="3.3" fill={g} />;
  else m = <path d="M44.5 59 Q50 64 55.5 59" fill="none" stroke={g} strokeWidth="2.4" strokeLinecap="round" />;
  return (
    <g filter={`url(#glow-${id})`}>
      <rect x="31" y="55.5" width="6" height="3.2" rx="1.6" fill={g} opacity="0.45" />
      <rect x="63" y="55.5" width="6" height="3.2" rx="1.6" fill={g} opacity="0.45" />
      {m}
    </g>
  );
}

/** What sits on top of the head (drawn behind the shell unless noted). */
function TopBack({ d, id }) {
  const stem = '#9ca3af';
  if (d.top === 'star') return (<g><path d="M52 26 Q53 15 60 12.5" fill="none" stroke={stem} strokeWidth="2" strokeLinecap="round" /><polygon points={star(62, 11.5, 6)} fill="#fde047" filter={`url(#glow-${id})`} /></g>);
  if (d.top === 'ball') return (<g><rect x="49" y="13" width="2" height="14" rx="1" fill={stem} /><circle cx="50" cy="12" r="4.6" fill={d.trim} filter={`url(#glow-${id})`} /><circle cx="48.6" cy="10.6" r="1.4" fill="#fff" opacity="0.8" /></g>);
  if (d.top === 'twin') return (<g fill="none" stroke={stem} strokeWidth="1.8" strokeLinecap="round"><path d="M40 28 L34 15" /><path d="M60 28 L66 15" /><circle cx="33.5" cy="13.5" r="3.4" fill={d.glow} stroke="none" filter={`url(#glow-${id})`} /><circle cx="66.5" cy="13.5" r="3.4" fill={d.glow} stroke="none" filter={`url(#glow-${id})`} /></g>);
  if (d.top === 'cat') return (<g fill={d.trim} stroke={d.deep} strokeWidth="1"><path d="M24 36 L26 17 L41 27 Z" /><path d="M76 36 L74 17 L59 27 Z" /><path d="M27.5 31 L28.3 22 L35 27 Z" fill="#fbcfe8" stroke="none" /><path d="M72.5 31 L71.7 22 L65 27 Z" fill="#fbcfe8" stroke="none" /></g>);
  if (d.top === 'propeller') return (<g><rect x="49" y="14" width="2" height="10" fill={stem} /><ellipse cx="42.5" cy="13" rx="7.5" ry="2.4" fill={d.trim} /><ellipse cx="57.5" cy="13" rx="7.5" ry="2.4" fill="#fde047" /><circle cx="50" cy="13" r="2.2" fill="#e5e7eb" /></g>);
  return null;
}

function TopFront({ d }) {
  if (d.top === 'phones') return (
    <g>
      <path d="M17 50 Q17 18 50 18 Q83 18 83 50" fill="none" stroke={d.deep} strokeWidth="5" strokeLinecap="round" />
      <path d="M19 47 Q20 21 50 20.5" fill="none" stroke="#fff" strokeWidth="1.2" opacity="0.35" strokeLinecap="round" />
      <rect x="10" y="41" width="12" height="20" rx="6" fill={d.trim} stroke={d.deep} strokeWidth="1.2" />
      <rect x="78" y="41" width="12" height="20" rx="6" fill={d.trim} stroke={d.deep} strokeWidth="1.2" />
    </g>
  );
  if (d.top === 'cap') return (
    <g>
      <path d="M24 34 Q26 17 50 16.5 Q74 17 76 34 Z" fill={d.trim} />
      <path d="M30 26 Q38 19 50 18.6" fill="none" stroke="#fff" strokeWidth="1.6" opacity="0.4" strokeLinecap="round" />
      <path d="M48 33 Q66 30 86 36 Q76 41 56 37 Z" fill={d.deep} />
      <circle cx="50" cy="17" r="2" fill={d.deep} />
    </g>
  );
  if (d.top === 'crown') return (
    <g>
      <path d="M34 28 L33 13 L41.5 21 L50 10 L58.5 21 L67 13 L66 28 Z" fill="#fde047" stroke="#ca8a04" strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx="50" cy="22" r="2.3" fill={d.trim} /><circle cx="41" cy="24" r="1.5" fill="#fff" opacity="0.8" /><circle cx="59" cy="24" r="1.5" fill="#fff" opacity="0.8" />
    </g>
  );
  if (d.top === 'bow') return (
    <g transform="translate(66 25) rotate(18)">
      <path d="M0 0 L-10 -6 Q-12 0 -10 6 Z" fill={d.trim} stroke={d.deep} strokeWidth="1" />
      <path d="M0 0 L10 -6 Q12 0 10 6 Z" fill={d.trim} stroke={d.deep} strokeWidth="1" />
      <circle r="2.8" fill={d.deep} />
    </g>
  );
  return null;
}

export function BotAvatarArt({ index, size = 40, title }) {
  const uid = useId().replace(/:/g, '');
  const id = `${index}-${uid}`;
  const d = design(index);
  const shell = d.dark ? ['#6b7280', '#374151', '#1f2937'] : ['#ffffff', '#ece9f6', '#c9c4dc'];
  const ears = d.top !== 'phones';
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role={title ? 'img' : undefined} aria-hidden={title ? undefined : 'true'} style={{ display: 'block', flexShrink: 0 }}>
      {title && <title>{title}</title>}
      <defs>
        <radialGradient id={`bg-${id}`} cx="0.35" cy="0.25" r="0.9">
          <stop offset="0" stopColor={d.bg[0]} />
          <stop offset="1" stopColor={d.bg[1]} />
        </radialGradient>
        <radialGradient id={`shell-${id}`} cx="0.32" cy="0.22" r="0.95">
          <stop offset="0" stopColor={shell[0]} />
          <stop offset="0.55" stopColor={shell[1]} />
          <stop offset="1" stopColor={shell[2]} />
        </radialGradient>
        <linearGradient id={`visor-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1e2a4a" />
          <stop offset="1" stopColor="#080d1c" />
        </linearGradient>
        <radialGradient id={`pod-${id}`} cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor={d.trim} />
          <stop offset="1" stopColor={d.deep} />
        </radialGradient>
        <filter id={`glow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.1" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <clipPath id={`clip-${id}`}><circle cx="50" cy="50" r="50" /></clipPath>
      </defs>
      <g clipPath={`url(#clip-${id})`}>
        <circle cx="50" cy="50" r="50" fill={`url(#bg-${id})`} />
        <circle cx="30" cy="22" r="26" fill="#fff" opacity="0.07" />
        <circle cx="16" cy="70" r="1.2" fill="#fff" opacity="0.5" /><circle cx="84" cy="24" r="1" fill="#fff" opacity="0.5" /><circle cx="86" cy="76" r="1.4" fill="#fff" opacity="0.35" />

        <g transform="translate(50 53) scale(1.12) translate(-50 -50)">
        {/* shoulders */}
        <path d="M14 104 Q16 84 34 81 L66 81 Q84 84 86 104 Z" fill={`url(#shell-${id})`} />
        <path d="M36 81 Q50 87 64 81" fill="none" stroke={d.trim} strokeWidth="3" strokeLinecap="round" />
        <circle cx="50" cy="94" r="5.2" fill={d.trim} />
        <circle cx="50" cy="94" r="3.2" fill={d.glow} filter={`url(#glow-${id})`} />
        <rect x="43" y="73" width="14" height="9" rx="3" fill="#374151" />

        <TopBack d={d} id={id} />
        {/* ear pods */}
        {ears && <g>
          <circle cx="19" cy="51" r="8" fill={`url(#pod-${id})`} />
          <circle cx="19" cy="51" r="4.2" fill={d.glow} filter={`url(#glow-${id})`} opacity="0.9" />
          <circle cx="81" cy="51" r="8" fill={`url(#pod-${id})`} />
          <circle cx="81" cy="51" r="4.2" fill={d.glow} filter={`url(#glow-${id})`} opacity="0.9" />
        </g>}
        {/* head shell */}
        <rect x="20" y="25" width="60" height="52" rx="24" fill={`url(#shell-${id})`} />
        <path d="M30 31 Q40 26 52 26.5" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" opacity={d.dark ? 0.35 : 0.9} />
        <rect x="45" y="22.5" width="10" height="5" rx="2.5" fill={d.trim} />
        {/* visor */}
        <rect x="26.5" y="36" width="47" height="34" rx="14" fill={`url(#visor-${id})`} stroke={d.trim} strokeWidth="2.2" />
        <path d="M31 41 Q36 37.8 44 38" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" opacity="0.28" />
        <Eyes d={d} id={id} />
        <Mouth d={d} id={id} />
        <TopFront d={d} />
        </g>
      </g>
      <circle cx="50" cy="50" r="49" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="2" />
    </svg>
  );
}

/**
 * The avatar to show for a user. `value` is the stored avatar (bot id or old
 * emoji); `photo` (e.g. a Google profile picture) wins when present.
 */
export default function ProfileAvatar({ value, name = '', photo, size = 40, className = '', style }) {
  if (photo) {
    return <img src={photo} alt="" referrerPolicy="no-referrer" className={className} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', display: 'block', ...style }} />;
  }
  return (
    <span className={className} style={{ display: 'inline-flex', width: size, height: size, borderRadius: '50%', flexShrink: 0, ...style }}>
      <BotAvatarArt index={avatarIndex(value, name)} size={size} title={name ? `${name}'s avatar` : undefined} />
    </span>
  );
}
