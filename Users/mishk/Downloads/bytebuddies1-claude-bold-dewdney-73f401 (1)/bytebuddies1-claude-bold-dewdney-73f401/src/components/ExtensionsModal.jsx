import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  EXTENSIONS,
  EXTENSION_FILTERS,
  EXTENSION_DOC_HUB,
} from '../data/extensionsCatalog';

/**
 * PictoBlox-style “Choose an extension” browser — row list (readable on all themes).
 */
export default function ExtensionsModal({ open, onClose, enabledIds, onToggleExtension }) {
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const [banner, setBanner] = useState(null);
  const bannerTimerRef = useRef(null);
  const safeEnabled = Array.isArray(enabledIds) ? enabledIds : [];

  useEffect(() => {
    return () => {
      if (bannerTimerRef.current) window.clearTimeout(bannerTimerRef.current);
    };
  }, []);

  const list = useMemo(() => {
    const src = Array.isArray(EXTENSIONS) ? EXTENSIONS : [];
    let rows = [...src];
    if (filter !== 'all') rows = rows.filter((e) => e.filter === filter);
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      rows = rows.filter(
        (e) =>
          (e.title && e.title.toLowerCase().includes(s)) ||
          (e.description && e.description.toLowerCase().includes(s)) ||
          (e.blocks || []).some((b) => String(b).toLowerCase().includes(s)),
      );
    }
    return rows;
  }, [filter, q]);

  const handleToggle = useCallback(
    (id) => {
      if (typeof onToggleExtension !== 'function') return;
      const wasOn = safeEnabled.includes(id);
      const ok = onToggleExtension(id);
      if (ok === false) {
        setBanner({
          type: 'muted',
          text: 'Could not update your extension library (storage may be blocked). Check browser settings and try again.',
        });
        if (bannerTimerRef.current) window.clearTimeout(bannerTimerRef.current);
        bannerTimerRef.current = window.setTimeout(() => setBanner(null), 8000);
        return;
      }
      const ex = (Array.isArray(EXTENSIONS) ? EXTENSIONS : []).find((e) => e.id === id);
      if (!ex) return;
      if (!wasOn) {
        setBanner({
          type: 'ok',
          text: `"${ex.title}" added to your library. Open the Block Library (left) and use that extension’s blocks on the canvas.`,
        });
      } else {
        setBanner({ type: 'muted', text: `"${ex.title}" removed from your library.` });
      }
      if (bannerTimerRef.current) window.clearTimeout(bannerTimerRef.current);
      bannerTimerRef.current = window.setTimeout(() => setBanner(null), 8000);
    },
    [safeEnabled, onToggleExtension],
  );

  if (!open) return null;

  const modal = (
    <div
      className="modal-overlay extensions-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ext-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div
        className="modal extensions-modal-wide"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxHeight: 'min(90vh, 900px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {banner && (
          <div
            role="status"
            aria-live="polite"
            style={{
              padding: '12px 20px',
              background: banner.type === 'ok' ? '#22c55e' : '#64748b',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 500,
              borderRadius: '12px 12px 0 0',
            }}
          >
            {banner.text}
          </div>
        )}

        <div
          className="modal-header"
          style={{
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <button type="button" onClick={onClose} className="btn btn-sm">
            ← Back
          </button>
          <h2 id="ext-modal-title" style={{ margin: 0, fontSize: 18, color: 'var(--text-primary)' }}>
            Choose an Extension
          </h2>
          <div style={{ width: 64 }} aria-hidden="true" />
        </div>

        <div
          className="modal-body"
          style={{
            paddingTop: 0,
            paddingBottom: 12,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            borderBottom: '1px solid var(--border-color)',
          }}
        >
          <input
            className="input"
            placeholder="Search extensions…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search extensions"
          />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {EXTENSION_FILTERS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`btn btn-sm ${filter === p.id ? 'btn-primary' : ''}`}
                onClick={() => setFilter(p.id)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <a
            className="extensions-doc-link"
            href={EXTENSION_DOC_HUB}
            target="_blank"
            rel="noopener noreferrer"
          >
            Read documentation
          </a>
        </div>

        {/* Scrollable list — minHeight:0 fixes flex child collapse */}
        <div
          className="extensions-modal-scroll"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            padding: '12px 20px 20px',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {list.length === 0 && (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', margin: '24px 0' }}>
              No extensions match your search. Try another filter or clear the search box.
            </p>
          )}
          {list.map((ex) => {
            const on = safeEnabled.includes(ex.id);
            const accent = ex.accent || '#6366f1';
            return (
              <div
                key={ex.id}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleToggle(ex.id);
                  }
                }}
                className={`extensions-extension-row${on ? ' extensions-extension-row--on' : ''}`}
                onClick={(e) => {
                  if (e.target.closest('a[href]')) return;
                  if (e.target.closest('button')) return;
                  handleToggle(ex.id);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 16px',
                  borderRadius: 10,
                  border: `1px solid ${on ? accent : 'var(--border-color)'}`,
                  background: 'var(--bg-primary)',
                  marginBottom: 10,
                  cursor: 'pointer',
                  boxShadow: on ? `0 0 0 1px ${accent}40` : 'none',
                }}
              >
                <div
                  aria-hidden
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 12,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    background: `linear-gradient(145deg, ${accent}44, var(--bg-tertiary))`,
                  }}
                >
                  {ex.icon || '🧩'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: 16,
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        lineHeight: 1.3,
                      }}
                    >
                      {ex.title}
                    </h3>
                    {ex.isNew && (
                      <span
                        style={{
                          background: '#22c55e',
                          color: '#fff',
                          fontSize: 10,
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: 4,
                        }}
                      >
                        NEW
                      </span>
                    )}
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: '#94a3b8',
                        background: 'rgba(148, 163, 184, 0.15)',
                        padding: '2px 6px',
                        borderRadius: 4,
                      }}
                    >
                      Web
                    </span>
                  </div>
                  <p
                    style={{
                      margin: '6px 0 0',
                      fontSize: 13,
                      lineHeight: 1.45,
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {ex.description}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                  <button
                    type="button"
                    className={on ? 'btn btn-sm btn-success' : 'btn btn-sm btn-primary'}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(ex.id);
                    }}
                  >
                    {on ? '✓ In library' : '+ Add'}
                  </button>
                  {ex.docsUrl && (
                    <a
                      href={ex.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{ fontSize: 12, color: accent, fontWeight: 600, textDecoration: 'none' }}
                    >
                      Docs ↗
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <footer className="extensions-modal-footer">
          <p>
            Extensions add extra block groups to your <strong>Block Library</strong> (left sidebar). Use{' '}
            <strong>+ Add</strong> here, then open that extension in the block library and add blocks to the canvas. Where
            ByteBuddies maps a block to real code, runs do real work; device steps may use the <strong>Robot</strong> area.
          </p>
          <p className="extensions-modal-footnote">
            Third-party product names are trademarks of their respective owners. Extension ideas are for education only.
          </p>
        </footer>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modal, document.body);
  }
  return modal;
}
