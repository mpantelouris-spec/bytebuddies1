/**
 * Dot — the ByteBuddies Learn robot.
 *
 * A friendly hover-bot: glossy rounded head with a glowing face screen,
 * little noodle arms and a soft hover glow. Drawn in a 100 × 168 box.
 *
 *   <DotBot x y scale pose="wave|point|think|cheer|idle" mood="happy|joy|think" />
 */
import React, { useId } from 'react';

const ARM = {
  idle: [24, -24],
  wave: [22, -150],
  point: [24, -96],
  cheer: [148, -148],
  think: [24, 152],
};

function Arm({ sx, sy, angle, len = 30, fill, edge }) {
  return (
    <g transform={`rotate(${angle} ${sx} ${sy})`}>
      <rect x={sx - 6} y={sy - 4} width="12" height={len} rx="6" fill={fill} stroke={edge} strokeWidth="1.6" />
      <circle cx={sx} cy={sy + len - 1} r="7.5" fill="#f8fafc" stroke={edge} strokeWidth="1.6" />
    </g>
  );
}

function Eyes({ mood, g }) {
  if (mood === 'joy') {
    return (
      <g stroke={`url(#${g}-eye)`} strokeWidth="4.6" fill="none" strokeLinecap="round" filter={`url(#${g}-glow)`}>
        <path d="M31 53 q7 -9 14 0" />
        <path d="M55 53 q7 -9 14 0" />
      </g>
    );
  }
  const dx = mood === 'think' ? -2.5 : 0;
  const dy = mood === 'think' ? -2.5 : 0;
  return (
    <g filter={`url(#${g}-glow)`}>
      <rect x={32 + dx} y={42 + dy} width="12" height="16" rx="6" fill={`url(#${g}-eye)`} />
      <rect x={56 + dx} y={42 + dy} width="12" height="16" rx="6" fill={`url(#${g}-eye)`} />
      <circle cx={35.5 + dx} cy={46 + dy} r="2.4" fill="#fff" />
      <circle cx={59.5 + dx} cy={46 + dy} r="2.4" fill="#fff" />
      {mood === 'think' && <path d="M54 37 q7 -4 14 0" stroke="#67e8f9" strokeWidth="2.4" fill="none" strokeLinecap="round" />}
    </g>
  );
}

export default function DotBot({ x = 0, y = 0, scale = 1, flip = false, color = '#14b8a6', pose = 'idle', mood }) {
  const g = `dot${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const m = mood || (pose === 'cheer' ? 'joy' : pose === 'think' ? 'think' : 'happy');
  const [la, ra] = ARM[pose] || ARM.idle;
  const edge = '#0f3b47';
  const tx = flip ? x + 100 * scale : x;
  return (
    <g transform={`translate(${tx} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
      <defs>
        <linearGradient id={`${g}-shell`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d6e4f0" />
        </linearGradient>
        <linearGradient id={`${g}-screen`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#14284a" />
          <stop offset="1" stopColor="#081428" />
        </linearGradient>
        <linearGradient id={`${g}-eye`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a5f3fc" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id={`${g}-accent`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.75" />
          <stop offset="1" stopColor={color} />
        </linearGradient>
        <radialGradient id={`${g}-hover`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#67e8f9" stopOpacity="0.85" />
          <stop offset="1" stopColor="#67e8f9" stopOpacity="0" />
        </radialGradient>
        <filter id={`${g}-glow`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.4" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* ground shadow + hover glow */}
      <ellipse cx="50" cy="163" rx="30" ry="5.5" fill="#0f172a" opacity="0.16" />
      <ellipse cx="50" cy="146" rx="24" ry="9" fill={`url(#${g}-hover)`} />

      {/* back arm (left) */}
      <Arm sx={25} sy={100} angle={la} fill={`url(#${g}-accent)`} edge={edge} />

      {/* body */}
      <rect x="23" y="86" width="54" height="54" rx="25" fill={`url(#${g}-shell)`} stroke={edge} strokeWidth="2" />
      <ellipse cx="38" cy="98" rx="9" ry="5" fill="#fff" opacity="0.9" />
      <rect x="37" y="104" width="26" height="20" rx="9" fill={`url(#${g}-accent)`} stroke={edge} strokeWidth="1.6" />
      <path d="M50 120 l-6.5 -6.2 a3.8 3.8 0 0 1 6.5 -4.6 a3.8 3.8 0 0 1 6.5 4.6 z" fill="#fff" opacity="0.95" />
      <ellipse cx="50" cy="141" rx="13" ry="3.4" fill={edge} opacity="0.35" />

      {/* neck */}
      <rect x="40" y="78" width="20" height="10" rx="5" fill="#9fb3c8" stroke={edge} strokeWidth="1.6" />

      {/* antenna */}
      <line x1="50" y1="22" x2="50" y2="9" stroke={edge} strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="50" cy="7" r="9" fill="#fde047" opacity="0.35" />
      <circle cx="50" cy="7" r="5.2" fill="#facc15" stroke={edge} strokeWidth="1.6" />
      <circle cx="48.4" cy="5.4" r="1.6" fill="#fff" />

      {/* ears */}
      <circle cx="9" cy="50" r="8.5" fill={`url(#${g}-accent)`} stroke={edge} strokeWidth="1.8" />
      <circle cx="91" cy="50" r="8.5" fill={`url(#${g}-accent)`} stroke={edge} strokeWidth="1.8" />

      {/* head */}
      <rect x="8" y="18" width="84" height="64" rx="30" fill={`url(#${g}-shell)`} stroke={edge} strokeWidth="2.2" />
      <ellipse cx="30" cy="27" rx="13" ry="5" fill="#fff" opacity="0.95" transform="rotate(-12 30 27)" />
      <rect x="17" y="30" width="66" height="43" rx="19" fill={`url(#${g}-screen)`} stroke={edge} strokeWidth="1.6" />
      <path d="M24 36 q16 -5 36 -4" stroke="#fff" strokeOpacity="0.14" strokeWidth="4" strokeLinecap="round" fill="none" />

      <Eyes mood={m} g={g} />
      <ellipse cx="27" cy="63" rx="5" ry="3" fill="#f472b6" opacity="0.55" />
      <ellipse cx="73" cy="63" rx="5" ry="3" fill="#f472b6" opacity="0.55" />
      {m === 'joy'
        ? <path d="M41 61 q9 10 18 0 z" fill="#67e8f9" filter={`url(#${g}-glow)`} />
        : m === 'think'
          ? <path d="M44 65 q6 -2 12 1" stroke="#67e8f9" strokeWidth="2.6" fill="none" strokeLinecap="round" />
          : <path d="M42 62 q8 7 16 0" stroke="#67e8f9" strokeWidth="2.8" fill="none" strokeLinecap="round" filter={`url(#${g}-glow)`} />}

      {/* front arm (right) */}
      <Arm sx={75} sy={100} angle={ra} len={pose === 'think' ? 24 : 30} fill={`url(#${g}-accent)`} edge={edge} />
    </g>
  );
}
