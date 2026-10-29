import React, { useEffect, useState } from 'react';
import './classroom.css';
import { EmojiIcon } from '../ui/Icon.jsx';
import ProfileAvatar from '../ui/ProfileAvatar.jsx';

export const CLASS_COLORS = ['#6366f1', '#10b981', '#f97316', '#ec4899', '#0ea5e9', '#8b5cf6', '#eab308', '#14b8a6'];
export const classGradient = (c = '#6366f1') => `linear-gradient(135deg, ${c} 0%, ${shade(c, -28)} 100%)`;

function shade(hex, pct) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v) => Math.max(0, Math.min(255, Math.round(v + (pct / 100) * 255)));
  return `#${[f(n >> 16), f((n >> 8) & 255), f(n & 255)].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

export function GoogleClassroomLogo({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <rect x="2" y="6" width="44" height="36" rx="4" fill="#0f9d58" />
      <rect x="6" y="10" width="36" height="28" rx="1.5" fill="#57bb8a" />
      <circle cx="24" cy="20" r="3.6" fill="#fff" />
      <path d="M17 31c.6-3.6 3.4-5.6 7-5.6s6.4 2 7 5.6z" fill="#fff" />
      <circle cx="14" cy="22" r="2.6" fill="#fff" opacity=".75" />
      <circle cx="34" cy="22" r="2.6" fill="#fff" opacity=".75" />
      <rect x="27" y="36" width="12" height="3" rx="1" fill="#fff" />
    </svg>
  );
}

export function GoogleG({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.1C12.5 13.6 17.8 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.8c4.3-4 6.9-9.9 6.9-17.2z" />
      <path fill="#FBBC05" d="M10.6 28.6c-.5-1.4-.8-2.9-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.8c-2.1 1.4-4.8 2.3-8.5 2.3-6.2 0-11.5-4.1-13.4-9.8l-7.9 6.1C6.6 42.6 14.6 48 24 48z" />
    </svg>
  );
}

export function Modal({ title, icon, onClose, children, footer, wide }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="cr-modal-bg" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className={`cr-modal${wide ? ' cr-modal--wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="cr-modal__head">
          {icon && <span style={{ fontSize: 22, display: 'inline-flex' }}><EmojiIcon e={icon} /></span>}
          <h3>{title}</h3>
          <button className="cr-btn cr-btn--ghost cr-btn--sm" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="cr-modal__body">{children}</div>
        {footer && <div className="cr-modal__foot">{footer}</div>}
      </div>
    </div>
  );
}

const AV_COLORS = ['#6366f1', '#10b981', '#f97316', '#ec4899', '#0ea5e9', '#8b5cf6', '#14b8a6', '#ef4444'];
export function Avatar({ name = '?', emoji, photo, size = 36 }) {
  const n = [...String(name)].reduce((a, ch) => a + ch.charCodeAt(0), 0);
  const bg = AV_COLORS[n % AV_COLORS.length];
  const initials = String(name).trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || '?';
  return (
    <span className="cr-av" style={{ width: size, height: size, background: photo ? bg : 'none', fontSize: size * 0.38 }}>
      {photo ? <img src={photo} alt="" referrerPolicy="no-referrer" /> : <ProfileAvatar value={emoji} name={name} size={size} />}
    </span>
  );
}

export function Chip({ color = '#6366f1', children }) {
  return <span className="cr-chip" style={{ background: `${color}22`, color }}>{children}</span>;
}

export function useToast() {
  const [msg, setMsg] = useState('');
  useEffect(() => {
    if (!msg) return undefined;
    const t = setTimeout(() => setMsg(''), Math.max(2600, msg.length * 70));
    return () => clearTimeout(t);
  }, [msg]);
  return [msg ? <div className="cr-toast" role="status">{msg}</div> : null, setMsg];
}

export function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text).then(() => true, () => fallbackCopy(text));
  } catch { /* fall through */ }
  return Promise.resolve(fallbackCopy(text));
}
function fallbackCopy(text) {
  const t = document.createElement('textarea');
  t.value = text;
  document.body.appendChild(t);
  t.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch { /* ignore */ }
  t.remove();
  return ok;
}

export function timeAgo(iso) {
  if (!iso) return '';
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)} d ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export const STICKERS = ['⭐', '🏆', '🚀', '💡', '🎉', '👏', '🧠', '💪'];
