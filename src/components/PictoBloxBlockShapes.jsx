import React from 'react';
import { PICTO_THEME } from './pictobloxTheme';

/** Scratch/PictoBlox-style puzzle proportions */
const NW = 20;
const ND = 4;
const NX = 20;
const JOIN = 3;
const R = 3;

/** Hat top: smooth hill arch, full width */
function hatTopPath(w, archH = 10) {
  const bodyTop = archH;
  return [
    `M ${R},${bodyTop}`,
    `Q ${w * 0.22},0 ${w * 0.42},0`,
    `Q ${w * 0.5},0 ${w * 0.58},0`,
    `Q ${w * 0.78},0 ${w - R},${bodyTop}`,
    `Q ${w},${bodyTop} ${w},${bodyTop + R}`,
  ].join(' ');
}

/** Stack body: from below top notch to above bottom tab */
function stackBodyPath(w, h, topNotch) {
  const topY = topNotch ? ND : 0;
  let d = '';
  if (topNotch) {
    d += `M ${R},${topY} L ${NX},${topY} L ${NX + JOIN},0 L ${NX + NW - JOIN},0 L ${NX + NW},${topY} L ${w - R},${topY} Q ${w},${topY} ${w},${topY + R} `;
  } else {
    d += `M ${R},${topY} L ${w - R},${topY} Q ${w},${topY} ${w},${topY + R} `;
  }
  d += `L ${w},${h - R} Q ${w},${h} ${w - R},${h} L ${NX + NW},${h} L ${NX + NW - JOIN},${h + ND} L ${NX + JOIN},${h + ND} L ${NX},${h} L ${R},${h} Q 0,${h} 0,${h - R} L 0,${topY + R} Q 0,${topY} ${R},${topY} Z`;
  return d;
}

function bottomTabRect(w) {
  return { left: NX, width: NW, height: ND + 2, top: '100%' };
}

export function PictoHatWhenClicked({ width = 220, bodyH = 34, archH = 11 }) {
  const h = bodyH + archH;
  const w = width;
  const bumpH = 7;
  const totalH = h + bumpH;
  const d = `${hatTopPath(w, archH)} L ${w},${h - R} Q ${w},${h} ${w - R},${h} L ${NX + NW},${h} L ${NX + NW - JOIN},${h + ND} L ${NX + JOIN},${h + ND} L ${NX},${h} L ${R},${h} Q 0,${h} 0,${h - R} L 0,${archH + R} Q 0,${archH} ${R},${archH} Z`;
  const gid = React.useId().replace(/:/g, '');
  return (
    <div style={{ width: w, height: totalH, position: 'relative', filter: 'drop-shadow(0 2px 0 rgba(0,0,0,0.25))' }}>
      <svg width={w} height={h + 0.5} style={{ display: 'block' }} viewBox={`0 0 ${w} ${h}`}>
        <defs>
          <linearGradient id={`ph-${gid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffcc5c" />
            <stop offset="55%" stopColor="#FFAB19" />
            <stop offset="100%" stopColor="#e8890a" />
          </linearGradient>
        </defs>
        <path d={d} fill={`url(#ph-${gid})`} stroke="rgba(0,0,0,0.22)" strokeWidth="1" />
      </svg>
      <div
        style={{
          position: 'absolute', left: 0, right: 0, top: archH + 2, height: bodyH - 4,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          color: '#fff', fontWeight: 600, fontSize: 13, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          textShadow: '0 1px 0 rgba(0,0,0,0.35)', pointerEvents: 'none', userSelect: 'none',
        }}
      >
        <span>when</span>
        <span style={{ fontSize: 15, lineHeight: 1 }} title="flag">🏁</span>
        <span>clicked</span>
      </div>
      <div
        style={{
          position: 'absolute',
          left: NX,
          width: NW,
          height: bumpH,
          bottom: 0,
          background: 'linear-gradient(180deg, #d99a12 0%, #a86a08 100%)',
          borderRadius: '0 0 3px 3px',
          boxShadow: '0 2px 0 rgba(0,0,0,0.35)',
        }}
      />
    </div>
  );
}

export function PictoStackMotionMove({ width = 220, bodyH = 36, value = 10, onChangeValue, children }) {
  const w = width;
  const h = bodyH;
  const totalH = h + ND + 2;
  const d = stackBodyPath(w, h, true);
  const gid = React.useId().replace(/:/g, '');
  return (
    <div style={{ width: w, height: totalH, position: 'relative', marginTop: -ND + 1, filter: 'drop-shadow(0 2px 0 rgba(0,0,0,0.2))' }}>
      <svg width={w} height={h + ND + 1} viewBox={`0 0 ${w} ${h + ND}`} style={{ display: 'block' }}>
        <defs>
          <linearGradient id={`pm-${gid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5ca8ff" />
            <stop offset="100%" stopColor="#4C97FF" />
          </linearGradient>
        </defs>
        <path d={d} fill={`url(#pm-${gid})`} stroke="rgba(0,0,0,0.18)" strokeWidth="1" />
        <path d={d} fill="rgba(255,255,255,0.1)" />
      </svg>
      <div
        style={{
          position: 'absolute', left: 10, right: 10, top: ND + 5, height: h - ND - 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap',
          color: '#fff', fontWeight: 600, fontSize: 13, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          textShadow: '0 1px 0 rgba(0,0,0,0.25)', pointerEvents: 'auto', userSelect: 'none',
        }}
      >
        {children ?? (
          <>
            <span>move</span>
            <input
              type="number"
              value={value}
              onChange={e => onChangeValue?.(Number(e.target.value))}
              onMouseDown={e => e.stopPropagation()}
              style={{
                width: 48, textAlign: 'center', borderRadius: 8, border: '1px solid #bcd7ff',
                background: '#fff', color: '#1e293b', fontWeight: 700, fontSize: 12, padding: '3px 4px', outline: 'none',
              }}
            />
            <span>steps</span>
          </>
        )}
      </div>
      <div
        style={{
          position: 'absolute',
          ...bottomTabRect(w),
          marginTop: -1,
          background: 'linear-gradient(180deg, #3570cc 0%, #2a5aa8 100%)',
          borderRadius: '0 0 3px 3px',
          boxShadow: '0 2px 0 rgba(0,0,0,0.28)',
        }}
      />
    </div>
  );
}

/** Stack broadcast — solid amber or outline (dark fill + event border) like PictoBlox palette */
export function PictoStackBroadcast({ width = 220, bodyH = 36, message = 'message1', outline = false, children }) {
  const w = width;
  const h = bodyH;
  const totalH = h + ND + 2;
  const d = stackBodyPath(w, h, true);
  const gid = React.useId().replace(/:/g, '');
  const ev = PICTO_THEME.event;
  return (
    <div style={{ width: w, height: totalH, position: 'relative', marginTop: -ND + 1, filter: outline ? 'none' : 'drop-shadow(0 2px 0 rgba(0,0,0,0.35))' }}>
      <svg width={w} height={h + ND + 1} viewBox={`0 0 ${w} ${h + ND}`} style={{ display: 'block' }}>
        <defs>
          <linearGradient id={`pb-${gid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e8a028" />
            <stop offset="100%" stopColor="#D4900A" />
          </linearGradient>
        </defs>
        <path
          d={d}
          fill={outline ? '#161822' : `url(#pb-${gid})`}
          stroke={outline ? ev : 'rgba(0,0,0,0.28)'}
          strokeWidth={outline ? 2.5 : 1}
        />
        {!outline && <path d={d} fill="rgba(255,255,255,0.08)" />}
      </svg>
      <div
        style={{
          position: 'absolute', left: 12, right: 12, top: ND + 5, height: h - ND - 8,
          display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 8, flexWrap: 'wrap',
          color: '#fff', fontWeight: 600, fontSize: 13, fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          textShadow: '0 1px 0 rgba(0,0,0,0.28)', pointerEvents: 'auto', userSelect: 'none',
        }}
      >
        {children ?? (
          <>
            <span>broadcast</span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: outline ? '#0f121c' : '#fff', color: outline ? '#e8eaef' : '#222',
              border: outline ? `1px solid ${ev}` : undefined,
              borderRadius: 9999, padding: '3px 12px 3px 14px', fontSize: 12, fontWeight: 600,
              boxShadow: outline ? 'none' : 'inset 0 -1px 0 rgba(0,0,0,0.08)',
            }}
            >
              {message}
              <span style={{ fontSize: 9, color: outline ? '#cbd5e1' : '#333', marginLeft: 2 }}>▼</span>
            </span>
          </>
        )}
      </div>
      <div
        style={{
          position: 'absolute',
          left: NX,
          width: NW,
          height: ND + 2,
          top: h,
          background: 'linear-gradient(180deg, #a86f08 0%, #7a4f06 100%)',
          borderRadius: '0 0 3px 3px',
          boxShadow: '0 2px 0 rgba(0,0,0,0.3)',
        }}
      />
    </div>
  );
}

/** Forever C-block: flat bottom, inner ↩ (mouth opens to the right; no bottom stack tab) */
export function PictoForeverCBlock({ width = 200, glow = false, children }) {
  const w = width;
  const mouth = 50;
  const topH = 38;
  const innerH = 56;
  const stemW = 18;
  const jawH = 16;
  const gid = React.useId().replace(/:/g, '');
  const fill = `url(#pfc-${gid})`;

  return (
    <div
      style={{
        position: 'relative',
        width: w,
        filter: glow ? 'drop-shadow(0 0 8px rgba(255, 171, 25, 0.55))' : undefined,
      }}
    >
      <svg width={w} height={topH + ND} style={{ display: 'block' }} viewBox={`0 0 ${w} ${topH + ND}`}>
        <defs>
          <linearGradient id={`pfc-${gid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffc14d" />
            <stop offset="100%" stopColor="#FFAB19" />
          </linearGradient>
        </defs>
        <path d={stackBodyPath(w, topH, true)} fill={fill} stroke="rgba(0,0,0,0.22)" strokeWidth="1" />
        <path d={stackBodyPath(w, topH, true)} fill="rgba(255,255,255,0.06)" pointerEvents="none" />
      </svg>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          width: w,
          height: innerH,
          marginTop: -ND - 1,
          position: 'relative',
        }}
      >
        <div
          style={{
            width: stemW,
            flexShrink: 0,
            height: '100%',
            background: 'linear-gradient(90deg, #e89412 0%, #FFAB19 55%, #d9870e 100%)',
            borderBottomLeftRadius: 10,
            boxShadow: 'inset -2px 0 3px rgba(0,0,0,0.12)',
          }}
        />
        <div style={{ flex: 1, position: 'relative', minWidth: mouth }}>
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: jawH,
              background: 'linear-gradient(180deg, #ffbd4a 0%, #FFAB19 45%, #d9870e 100%)',
              borderBottomRightRadius: 12,
              boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.12), 0 2px 0 rgba(0,0,0,0.2)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 4,
              top: 5,
              width: NW - 6,
              height: ND,
              background: 'rgba(0,0,0,0.2)',
              borderRadius: 2,
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              right: 10,
              bottom: 5,
              color: '#fff',
              fontSize: 17,
              fontWeight: 700,
              textShadow: '0 1px 2px rgba(0,0,0,0.45)',
              pointerEvents: 'none',
            }}
          >
            ↩
          </div>
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 36,
          top: ND + 8,
          maxWidth: w - mouth - 40,
          color: '#fff',
          fontWeight: 600,
          fontSize: 13,
          fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          textShadow: '0 1px 0 rgba(0,0,0,0.3)',
          pointerEvents: 'none',
        }}
      >
        {children ?? 'forever'}
      </div>
    </div>
  );
}

/** Green operator pill for palette */
export function PictoOperatorPill({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        minWidth: 36, padding: '8px 14px', borderRadius: 9999, border: '1px solid #2d4a30', cursor: 'pointer',
        background: 'linear-gradient(180deg, #4daf55 0%, #3d9c47 100%)',
        color: '#fff', fontWeight: 600, fontSize: 13,
        boxShadow: '0 2px 0 #256d2c, inset 0 1px 0 rgba(255,255,255,0.22)',
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      {label}
    </button>
  );
}
