import React from 'react';
import { getArenaBlueprint } from '../data/primary-arena-layouts.js';

/** A lightweight map of the same route and landmarks used by the arena. */
export default function PrimaryArenaThumbnail({arena}) {
  const blueprint = getArenaBlueprint(arena);
  const color = n => `#${n.toString(16).padStart(6,'0')}`;
  const route = blueprint.route.map(([x,z]) => [160+x*70,145-z*115]);
  const silhouettes = {
    greenhouse:'⌂', cabin:'⌂', shop:'▥', hedge:'▰', flower:'✿', desk:'▤', shelf:'▥', books:'▤',
    umbrella:'☂', shell:'◔', bin:'♻', traffic:'▣', crossing:'≡', solar:'▦', bridge:'═',
    tunnel:'∩', pine:'▲', crystal:'◆', exhibit:'♧', frame:'▣', planet:'◎', dome:'◠', crater:'◯',
    satellite:'╬', arch:'∩', flag:'⚑', ramp:'◢', hoop:'◯', balloon:'◉', cloud:'☁', island:'▰',
    camera:'▣', fan:'✣', lantern:'◇', stage:'▰', bell:'♩', teddy:'♧', mat:'▱', stone:'⬟',
    coral:'♆', fish:'⋈', turtle:'◉', kelp:'♆', boat:'▱', chest:'▣', vent:'≋',
    tray:'▱', cube:'◇', tower:'▥', canvas:'▣', pencil:'╱', cake:'▤', marble:'●', car:'▰',
    goal:'Π', ball:'●', target:'◎', button:'◉', door:'Π', paint:'▣', tree:'♣',
  };
  return <svg viewBox="0 0 320 170" role="img" aria-label={`${arena.title}: route preview with ${blueprint.props.join(', ')}`} style={{width:'100%',height:'100%',display:'block'}}>
    <rect width="320" height="170" fill={color(arena.sky)}/>
    <path d="M0 45 Q160 10 320 45V170H0Z" fill={color(arena.ground)}/>
    <polyline points={route.map(p=>p.join(',')).join(' ')} fill="none" stroke="#193b53" strokeOpacity=".2" strokeWidth="18" strokeLinejoin="round"/>
    <polyline points={route.map(p=>p.join(',')).join(' ')} fill="none" stroke="#fff4c7" strokeWidth="9" strokeLinejoin="round"/>
    {blueprint.props.map((prop,i)=><g key={prop+i} transform={`translate(${i===1?265:48},${35+i*43})`}>
      <ellipse cy="16" rx="22" ry="7" fill="#173e52" opacity=".16"/>
      <text textAnchor="middle" fontSize="34" fill="#173e52" fontFamily="system-ui">{silhouettes[prop] || '◇'}</text>
    </g>)}
    {route.slice(1,-1).map(([x,y],i)=><g key={i}><circle cx={x} cy={y} r="7" fill="#ffcf4e" stroke="#173e52" strokeWidth="1.5"/><text x={x} y={y+3} textAnchor="middle" fontSize="8" fontWeight="700" fill="#173e52">{i+1}</text></g>)}
    <circle cx={route[0][0]} cy={route[0][1]} r="9" fill="#279ac5" stroke="white" strokeWidth="3"/>
    <path d={`M${route.at(-1)[0]} ${route.at(-1)[1]+6}v-18h16l-4 5 4 5h-16`} fill="#ffcf4e" stroke="#173e52" strokeWidth="2"/>
  </svg>;
}
