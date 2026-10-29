import React from 'react';
import { jump } from './games/jump.js';

const THEMES = [
  { sky: '#77d7ff', far: '#b8efaa', hill: '#72c968', top: '#9ae35d', dirt: '#8a4c2d', accent: '#ffe66a', sun: '#fff3a6' },
  { sky: '#ffbf83', far: '#f4a66b', hill: '#d98454', top: '#f6cc76', dirt: '#8b4c38', accent: '#fff0a6', sun: '#fff0bd' },
  { sky: '#8ddfff', far: '#8fd77a', hill: '#3fa65b', top: '#a4e56a', dirt: '#8e5632', accent: '#ffb84d', sun: '#fff3a6' },
  { sky: '#8bcaff', far: '#e3f7ff', hill: '#c1eaff', top: '#f5fcff', dirt: '#79a9c8', accent: '#ffe16b', sun: '#ffffff' },
  { sky: '#9ce2ff', far: '#b0df89', hill: '#78c858', top: '#a5e460', dirt: '#8b5635', accent: '#ffc84d', sun: '#fff3a6' },
  { sky: '#7561c8', far: '#a995eb', hill: '#6451a8', top: '#9ba5e8', dirt: '#52406d', accent: '#ffdd66', sun: '#fff2a6' },
  { sky: '#19345c', far: '#27466a', hill: '#27624f', top: '#70c78b', dirt: '#4a382f', accent: '#9ffff0', sun: '#c9fff1' },
  { sky: '#f8a9c9', far: '#f7d0e2', hill: '#cc91c3', top: '#f2c7e2', dirt: '#69456b', accent: '#ffe477', sun: '#fff0a6' },
  { sky: '#301b3f', far: '#57243b', hill: '#7f302b', top: '#d65c35', dirt: '#543027', accent: '#ffcb55', sun: '#ff9b4a' },
  { sky: '#101a46', far: '#283a79', hill: '#343875', top: '#8e8be2', dirt: '#40304e', accent: '#ffe36a', sun: '#fff3b0' },
];

const px = (x, goal) => 26 + (x / goal) * 410;

function Flower({ x, y, color }) {
  return <g transform={`translate(${x} ${y})`}><path d="M0 1v10" stroke="#368c4b" strokeWidth="2"/><circle cy="-1" r="3.2" fill={color}/><circle cx="-3" r="2.5" fill="#fff4fa"/><circle cx="3" r="2.5" fill="#fff4fa"/></g>;
}

function Bug({ x, y }) {
  return <g transform={`translate(${x} ${y})`}><ellipse cy="1" rx="8" ry="5" fill="#ea4b55"/><path d="M-7 0Q0-9 7 0" fill="#f76b62"/><path d="M0-5v8" stroke="#8e2737" strokeWidth="1.3"/><circle cx="-2.5" cy="-1" r="1.2" fill="white"/><circle cx="2.5" cy="-1" r="1.2" fill="white"/><path d="M-4 5l-2 3m10-3 2 3" stroke="#4a3341" strokeWidth="1.3"/></g>;
}

function Robot({ x, y, accent }) {
  return <g transform={`translate(${x} ${y})`} stroke="#293858" strokeWidth="1.4" strokeLinejoin="round">
    <path d="M-5-17v-4m0 0 3-3 3 3" fill="none" stroke={accent} strokeWidth="2"/>
    <rect x="-9" y="-18" width="18" height="15" rx="5" fill="#8b5cf6"/>
    <rect x="-7" y="-14" width="14" height="7" rx="3" fill="#13364a" stroke="none"/>
    <circle cx="-3" cy="-11" r="1.5" fill="#6ffff0" stroke="none"/><circle cx="3" cy="-11" r="1.5" fill="#6ffff0" stroke="none"/>
    <rect x="-7" y="-3" width="14" height="11" rx="3" fill="#8b5cf6"/>
    <path d="M-10-1l-4 5m24-5 4 5M-4 8l-2 6h5l1-6m2 0 2 6h5l-2-6" fill="#f2bd59"/>
  </g>;
}

/** Compact, course-specific side view using the same platform and hazard data as play. */
export default function JumpBotLevelPreview({ mode = 1 }) {
  const gradientId = `jump-sky-${React.useId().replace(/:/g, '')}`;
  const lavaId = `jump-lava-${React.useId().replace(/:/g, '')}`;
  const level = jump.levels[Math.max(0, Math.min(jump.levels.length - 1, mode - 1))];
  const sceneTheme = Number.isFinite(level.previewThemeIndex) ? level.previewThemeIndex % THEMES.length : (mode - 1) % THEMES.length;
  const theme = THEMES[sceneTheme];
  const ground = 143;
  const step = 410 / Math.max(1, level.goalX);
  const platformY = (height) => ground - height * 17;
  const isDark = [5, 6, 8, 9].includes(sceneTheme);

  return (
    <svg className="bb-jump-level-preview" viewBox="0 0 480 190" role="img" aria-label={`${level.title} platform game preview`} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={gradientId} x2="0" y2="1"><stop stopColor={theme.sky}/><stop offset="1" stopColor={theme.far}/></linearGradient>
        <linearGradient id={lavaId} x2="0" y2="1"><stop stopColor="#ffd34e"/><stop offset="1" stopColor="#ed4a2e"/></linearGradient>
      </defs>
      <rect width="480" height="190" fill={`url(#${gradientId})`}/>
      <circle cx="410" cy="32" r="17" fill={theme.sun} opacity=".88"/>
      {Array.from({ length: isDark ? 24 : 10 }, (_, i) => <circle key={`star${i}`} cx={(i * 67 + 21) % 480} cy={(i * 31 + 16) % 96} r={i % 4 === 0 ? 1.8 : 1} fill="#fff8cc" opacity={isDark ? 0.85 : 0.45}/>)}
      <path d="M0 113Q62 53 123 112T250 111T380 102T480 110V190H0Z" fill={theme.hill} opacity=".58"/>
      <path d="M0 132Q62 88 134 127T285 125T415 120T480 126V190H0Z" fill={theme.far} opacity=".75"/>
      {sceneTheme === 3 && [60, 132, 250, 350].map((x) => <g key={x} fill="#fff" opacity=".88"><circle cx={x} cy="57" r="16"/><circle cx={x + 18} cy="59" r="12"/><circle cx={x - 15} cy="62" r="10"/></g>)}
      {[0, 2, 4, 7].includes(sceneTheme) && [42, 445].map((x) => <g key={x}><path d={`M${x} 126v-39`} stroke="#80532e" strokeWidth="5"/><circle cx={x} cy="81" r="20" fill="#247c47"/><circle cx={x - 12} cy="91" r="14" fill="#329c54"/></g>)}
      {sceneTheme === 5 && [0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={i * 88} y={61 + (i % 2) * 17} width="48" height="74" fill={i % 2 ? '#7e6694' : '#605578'} opacity=".8"/>)}
      {sceneTheme === 6 && [24, 440].map((x) => <g key={x}><path d={`M${x} 142v-54`} stroke="#3c3028" strokeWidth="7"/><circle cx={x} cy="83" r="23" fill="#182f39"/></g>)}
      {sceneTheme === 8 && <path d="M0 168Q52 144 106 168T212 167T320 169T480 165V190H0Z" fill={`url(#${lavaId})`} opacity=".95"/>}

      {/* Platforms exactly follow this mission's playable tile ranges/heights. */}
      {level.platforms.map(([from, to, height], index) => {
        const x = px(from, level.goalX) - step / 2;
        const width = Math.max(step * 0.72, (to - from + 1) * step - 2);
        const y = platformY(height);
        return <g key={`p${index}`}>
          <rect x={x} y={y} width={width} height="10" rx="3" fill={theme.dirt}/>
          <rect x={x} y={y} width={width} height="4" rx="2" fill={theme.top}/>
          {Array.from({ length: Math.max(1, Math.floor(width / 14)) }, (_, i) => <path key={i} d={`M${x + i * 14 + 4} ${y + 6}v3`} stroke="#f4d078" strokeWidth="1" opacity=".28"/>)}
        </g>;
      })}

      {/* Castle rooftops/towers and pipes use silhouettes tied to their level. */}
      {mode === 6 && (level.doors || []).map((x) => <g key={`door${x}`} transform={`translate(${px(x, level.goalX)} ${platformY(0)})`}><rect x="-8" y="-42" width="16" height="42" rx="7" fill="#75449a"/><path d="M-12-38v-12h24v12" fill="#9b63c1"/></g>)}
      {mode === 10 && [5, 10, 16].map((x, i) => <g key={x} transform={`translate(${px(x, level.goalX)} ${platformY(i + 1)})`}><rect x="-12" y="-43" width="24" height="43" fill="#534e9c"/><path d="M-15-42 0-58 15-42" fill="#e589b4"/></g>)}
      {mode === 3 && (level.hazards || []).map((x) => <g key={`pipe${x}`} transform={`translate(${px(x, level.goalX)} ${platformY(0)})`}><rect x="-8" y="-29" width="16" height="29" rx="3" fill="#e96942"/><rect x="-12" y="-31" width="24" height="7" rx="3" fill="#ff9e5c"/></g>)}

      {level.coins.map((x) => {
        const p = level.platforms.find(([a, b]) => x >= a && x <= b);
        const y = platformY(p?.[2] || 0) - 15 - (mode === 4 ? 8 : 0);
        return <g key={`coin${x}`} transform={`translate(${px(x, level.goalX)} ${y})`}><circle r="6.5" fill={theme.accent} stroke="#fff1a8" strokeWidth="1.5"/><path d="M0-3v6" stroke="#a66b20" strokeWidth="1.5"/></g>;
      })}
      {(level.keys || []).map((x) => <g key={`key${x}`} transform={`translate(${px(x, level.goalX)} ${platformY(0) - 23})`} stroke="#ffe36a" strokeWidth="3" fill="none"><circle r="5"/><path d="M5 0h11m-3 0v4m-4-4v3"/></g>)}
      {(level.enemies || []).map((x) => { const p = level.platforms.find(([a, b]) => x >= a && x <= b); return <Bug key={`bug${x}`} x={px(x, level.goalX)} y={platformY(p?.[2] || 0) - 7}/>; })}
      {(level.hazards || []).filter((x) => mode !== 3).map((x) => <g key={`hazard${x}`} transform={`translate(${px(x, level.goalX)} ${platformY(0)})`} fill="#ff7181"><path d="M-10 0 0-15 10 0Z"/><path d="M-2 0 8-13 18 0Z" opacity=".8"/></g>)}
      {(level.doors || []).map((x) => <g key={`gate${x}`} transform={`translate(${px(x, level.goalX)} ${platformY(0)})`} stroke="#f4c85a" strokeWidth="4" fill="none"><path d="M-9 0v-27q9-13 18 0v27M0-10v10"/></g>)}
      <path d={`M${px(level.goalX, level.goalX)} ${platformY(level.platforms.at(-1)?.[2] || 0)}v-40`} stroke="#fff" strokeWidth="3"/>
      <path d={`M${px(level.goalX, level.goalX)} ${platformY(level.platforms.at(-1)?.[2] || 0) - 39}h25l-7 8 7 8h-25Z`} fill="#ff6b9d"/>
      <text x={px(level.goalX, level.goalX) + 3} y={platformY(level.platforms.at(-1)?.[2] || 0) - 27} fontSize="9" fill="#fff">★</text>
      <Robot x={px(0, level.goalX) + 12} y={platformY(0)} accent={theme.accent}/>
      <rect x="0" y="0" width="480" height="190" fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="2"/>
    </svg>
  );
}
