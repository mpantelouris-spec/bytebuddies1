import React from 'react';

/** Original ByteBuddies marks — drawn as SVG, never emoji. */
export function HeaderMark({ kind = 'garden', color = '#fff', size = 36 }) {
  const k = String(kind || 'garden');
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      {k === 'city' && (
        <>
          <rect x="6" y="16" width="10" height="18" rx="1.5" fill={color} />
          <rect x="18" y="8" width="12" height="26" rx="1.5" fill={color} />
          <rect x="28" y="20" width="8" height="14" rx="1.5" fill={color} opacity="0.75" />
          <rect x="9" y="20" width="3" height="3" fill="#0f172a" opacity="0.35" />
          <rect x="9" y="26" width="3" height="3" fill="#0f172a" opacity="0.35" />
          <rect x="21" y="13" width="3" height="3" fill="#0f172a" opacity="0.35" />
          <rect x="21" y="19" width="3" height="3" fill="#0f172a" opacity="0.35" />
          <rect x="26" y="13" width="3" height="3" fill="#0f172a" opacity="0.35" />
        </>
      )}
      {k === 'storm' && (
        <>
          <path d="M8 18c0-6 6-10 12-10 5 0 9 3 10 7 4 0 8 4 8 8H8c0-2 0-4 0-5z" fill={color} />
          <path d="M20 24l-4 7h5l-2 7 9-10h-5l3-4z" fill={color} />
        </>
      )}
      {k === 'cup' && (
        <>
          <path d="M12 10h16v8c0 6-4 10-8 10s-8-4-8-10V10z" fill={color} />
          <path d="M28 12h4c2 0 4 2 4 5s-2 5-4 5h-2" stroke={color} strokeWidth="2.4" fill="none" />
          <rect x="16" y="28" width="8" height="3" rx="1" fill={color} />
          <rect x="13" y="31" width="14" height="3" rx="1.5" fill={color} />
        </>
      )}
      {k === 'mission' && (
        <>
          <circle cx="10" cy="30" r="3.2" fill={color} />
          <path d="M12 28c6-10 10-4 18-16" stroke={color} strokeWidth="2.6" fill="none" strokeDasharray="3 3" strokeLinecap="round" />
          <path d="M26 6h10l-3 5 3 5H26V6z" fill={color} />
        </>
      )}
      {k === 'talk' && (
        <>
          <path d="M7 8h26c2 0 3 1.4 3 3.2v12c0 1.8-1 3.2-3 3.2H18l-7 7v-7H7c-2 0-3-1.4-3-3.2v-12C4 9.4 5 8 7 8z" fill={color} />
          <rect x="12" y="14" width="16" height="3.2" rx="1.4" fill="#0f172a" opacity="0.28" />
          <rect x="12" y="20" width="10" height="3.2" rx="1.4" fill="#0f172a" opacity="0.28" />
        </>
      )}
      {k === 'learn' && (
        <>
          <rect x="6" y="22" width="28" height="10" rx="2" fill={color} />
          <rect x="10" y="14" width="20" height="9" rx="2" fill={color} opacity="0.78" />
          <rect x="14" y="6" width="12" height="9" rx="2" fill={color} opacity="0.55" />
        </>
      )}
      {k === 'paper' && (
        <>
          <path d="M10 6h14l8 8v20H10V6z" fill={color} />
          <path d="M24 6v8h8" fill="none" stroke="#0f172a" strokeOpacity="0.25" strokeWidth="2" />
          <path d="M16 20h12M16 25h8" stroke="#0f172a" strokeOpacity="0.28" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      {k === 'hands' && (
        <>
          <circle cx="14" cy="20" r="9" fill={color} />
          <circle cx="26" cy="20" r="9" fill={color} opacity="0.72" />
          <circle cx="20" cy="20" r="4" fill="#0f172a" opacity="0.22" />
        </>
      )}
      {k === 'blocks' && (
        <>
          <rect x="5" y="18" width="14" height="14" rx="2" fill={color} />
          <rect x="21" y="18" width="14" height="14" rx="2" fill={color} opacity="0.7" />
          <rect x="13" y="6" width="14" height="14" rx="2" fill={color} opacity="0.88" />
        </>
      )}
      {k === 'check' && (
        <>
          <rect x="9" y="5" width="22" height="30" rx="3" fill={color} />
          <rect x="14" y="9" width="12" height="4" rx="1.2" fill="#0f172a" opacity="0.22" />
          <path d="M15 22l4 4 8-9" stroke="#0f172a" strokeOpacity="0.35" strokeWidth="2.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {k === 'play' && (
        <>
          <rect x="5" y="8" width="30" height="22" rx="4" fill={color} />
          <rect x="9" y="12" width="16" height="14" rx="2" fill="#0f172a" opacity="0.28" />
          <circle cx="29" cy="16" r="2.2" fill="#0f172a" opacity="0.28" />
          <circle cx="29" cy="22" r="2.2" fill="#0f172a" opacity="0.28" />
          <rect x="12" y="30" width="16" height="4" rx="1.5" fill={color} />
        </>
      )}
      {k === 'done' && (
        <>
          <path d="M20 4l3 9h9l-7 6 3 9-8-5-8 5 3-9-7-6h9z" fill={color} />
        </>
      )}
      {(k === 'garden' || !['city', 'storm', 'cup', 'mission', 'talk', 'learn', 'paper', 'hands', 'blocks', 'check', 'play', 'done'].includes(k)) && (
        <>
          <path d="M20 34V16" stroke={color} strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="13" cy="16" rx="8" ry="7" fill={color} transform="rotate(-18 13 16)" />
          <ellipse cx="27" cy="14" rx="8" ry="7" fill={color} transform="rotate(22 27 14)" opacity="0.85" />
          <circle cx="20" cy="10" r="5" fill={color} />
        </>
      )}
    </svg>
  );
}

export function worldMarkKind(yr) {
  return { y3: 'garden', y4: 'city', y5: 'storm', y6: 'cup' }[yr] || 'garden';
}

export function activityMarkKind(type) {
  if (type === 'unplugged') return 'paper';
  if (type === 'digital') return 'blocks';
  return 'hands';
}

/**
 * Presentation header: tilted mark tile + scribble underline.
 * Unique per slide kind; no emoji, no pill chips.
 */
export function themeMarkKind(theme = 'default') {
  return ({
    safety: 'check', privacy: 'check', charter: 'paper',
    algorithm: 'paper', sequence: 'blocks', debug: 'check',
    loop: 'blocks', event: 'play', data: 'paper', search: 'learn',
    kindness: 'hands', network: 'city', selection: 'mission',
    robot: 'garden', art: 'garden', variable: 'blocks', python: 'blocks',
    project: 'mission', review: 'cup', default: 'learn',
  }[theme] || 'learn');
}

export function UniqueHeader({ color = '#0f766e', ink = '#134e4a', kind = 'garden', label, title, tone = 'day' }) {
  const night = tone === 'night';
  const titleColor = night ? '#f8fafc' : ink;
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '56px 1fr',
      gap: 14,
      alignItems: 'start',
      margin: '0 0 16px',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 18,
        background: color,
        display: 'grid', placeItems: 'center',
        transform: 'rotate(-6deg)',
        boxShadow: night ? `0 10px 24px ${color}55` : `6px 6px 0 ${ink}22`,
      }}>
        <HeaderMark kind={kind} color="#fff" size={34} />
      </div>
      <div>
        <div style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: night ? color : color,
          marginBottom: 4,
        }}>{label}</div>
        <h1 style={{
          margin: 0,
          fontSize: 'clamp(22px, 3.6vw, 34px)',
          lineHeight: 1.12,
          fontWeight: 900,
          color: titleColor,
          fontFamily: '"Trebuchet MS", Nunito, sans-serif',
        }}>{title}</h1>
        <svg width="120" height="10" viewBox="0 0 120 10" aria-hidden="true" style={{ display: 'block', marginTop: 6 }}>
          <path d="M2 6 C 22 1, 40 9, 62 5 S 100 2, 118 7" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

export function headerShape() {
  return 'mark';
}
