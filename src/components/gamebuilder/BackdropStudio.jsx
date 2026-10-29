import React, { useEffect, useRef, useState } from 'react';
import PaintEditor from './PaintEditor';
import { EmojiIcon } from '../ui/Icon.jsx';

/**
 * Backdrops tab (like PictoBlox / Scratch): the project's own list of backdrops on the
 * left — numbered, reorderable, renamable — and the selected one open in the paint
 * editor. "+" adds one from the library, paints a new one, or uploads a picture.
 */
export default function BackdropStudio({
  backdrops = [],          // [{ name, src, thumb, custom }]
  current,                 // name of the backdrop on stage
  library = [],            // built-in backdrops [{ name, image, thumb }]
  onSelect, onAddLibrary, onPaintNew, onUpload, onUpdate, onRename, onDelete, onDuplicate, onMove,
}) {
  const [addOpen, setAddOpen] = useState(false);
  const [picker, setPicker] = useState(false);
  const [query, setQuery] = useState('');
  const [menuFor, setMenuFor] = useState(null);
  const [dragFrom, setDragFrom] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const fileRef = useRef(null);
  // Rename once typing pauses, so the name isn't changed (or made unique) mid-word
  const [draft, setDraft] = useState(null);
  const renameTimer = useRef(null);
  useEffect(() => { setDraft(null); }, [current]);
  useEffect(() => () => clearTimeout(renameTimer.current), []);

  const idx = Math.max(0, backdrops.findIndex((b) => b.name === current));
  const sel = backdrops[idx];
  const q = query.trim().toLowerCase();
  const libItems = library.filter((b) => b.image && (!q || b.name.toLowerCase().includes(q)));

  return (
    <div className="gb-asset-studio">
      <div className="gb-scratch-layout">
        <aside className="gb-costume-rail">
          <div className="gb-rail-list">
            {backdrops.map((b, i) => (
              <div
                key={`${b.name}-${i}`}
                className={['gb-rail-item', i === idx ? 'on' : '', dragOver === i && dragFrom !== i ? 'drop' : '', dragFrom === i ? 'dragging' : ''].filter(Boolean).join(' ')}
                onClick={() => onSelect(b.name)}
                draggable
                onDragStart={(e) => { setDragFrom(i); e.dataTransfer.effectAllowed = 'move'; }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(i); }}
                onDragLeave={() => setDragOver((d) => (d === i ? null : d))}
                onDrop={(e) => { e.preventDefault(); onMove(dragFrom, i); setDragFrom(null); setDragOver(null); }}
                onDragEnd={() => { setDragFrom(null); setDragOver(null); }}
                onContextMenu={(e) => { e.preventDefault(); setMenuFor(i); }}
                title="Click to show on the stage · drag to reorder"
              >
                <span className="gb-rail-num">{i + 1}</span>
                <button type="button" className="gb-rail-more" title="More" onMouseDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); setMenuFor(menuFor === i ? null : i); }}>⋯</button>
                {menuFor === i && (
                  <div className="gb-rail-menu" onMouseDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
                    <button type="button" onClick={() => { onDuplicate(b.name); setMenuFor(null); }}>⧉ Duplicate</button>
                    <button type="button" className="danger" disabled={backdrops.length <= 1} onClick={() => { onDelete(b.name); setMenuFor(null); }}><EmojiIcon e="🗑" style={{ marginRight: '0.35em' }} />Delete</button>
                  </div>
                )}
                {b.thumb
                  ? <img src={b.thumb} alt="" loading="lazy" decoding="async" draggable={false} style={{ objectFit: 'cover', background: '#fff' }} />
                  : <div className="gb-asset-placeholder" style={{ background: '#fff' }} />}
                <div className="gb-rail-meta">
                  <strong>{b.name}</strong>
                  <span>480 × 360</span>
                </div>
              </div>
            ))}
          </div>
          <div className="gb-rail-fab-wrap">
            {addOpen && (
              <div className="gb-add-menu">
                <button type="button" onClick={() => { setAddOpen(false); setQuery(''); setPicker(true); }}>Choose</button>
                <button type="button" onClick={() => { setAddOpen(false); onPaintNew(); }}>Paint</button>
                <button type="button" onClick={() => { setAddOpen(false); fileRef.current?.click(); }}>Upload</button>
              </div>
            )}
            <button type="button" className="gb-add-fab" title="Add a backdrop" onClick={() => setAddOpen((v) => !v)}>+</button>
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { [...(e.target.files || [])].forEach((f) => onUpload(f)); e.target.value = ''; }} />
          </div>
        </aside>

        {sel ? (
          <PaintEditor
            key={`backdrop-${idx}`}
            sourceKey={`backdrop-${idx}`}
            name={draft ?? sel.name}
            nameLabel="Backdrop name"
            onRename={(name) => {
              setDraft(name);
              clearTimeout(renameTimer.current);
              const from = sel.name;
              renameTimer.current = setTimeout(() => { if (name.trim() && name.trim() !== from) onRename(from, name.trim()); setDraft(null); }, 700);
            }}
            sourceImage={sel.src}
            transparent={false}
            width={640}
            height={480}
            onChange={(dataUrl) => onUpdate(sel.name, dataUrl)}
          />
        ) : <div className="gb-asset-empty">Add a backdrop with the + button.</div>}
      </div>

      {picker && (
        <div className="gb-picker-overlay" onClick={() => setPicker(false)}>
          <div className="gb-picker" style={{ width: 'min(920px, 96vw)' }} onClick={(e) => e.stopPropagation()}>
            <div className="gb-paint-head">
              <strong>Choose a backdrop</strong>
              <input className="input" placeholder="Search backdrops…" value={query} onChange={(e) => setQuery(e.target.value)} style={{ maxWidth: 240, marginLeft: 'auto', fontSize: 13 }} />
              <button type="button" className="gb-asset-ghost" onClick={() => setPicker(false)}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, maxHeight: '62vh', overflowY: 'auto', padding: 4 }}>
              {libItems.map((b) => {
                const have = backdrops.some((x) => x.name === b.name);
                return (
                  <button key={b.name} type="button" onClick={() => { onAddLibrary(b.name); setPicker(false); }}
                    style={{ padding: 6, borderRadius: 10, border: have ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)', background: 'var(--bg-secondary)', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'stretch' }}>
                    <img src={b.thumb || b.image} alt="" loading="lazy" style={{ width: '100%', aspectRatio: '4 / 3', objectFit: 'cover', borderRadius: 6 }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{have ? '✓ ' : ''}{b.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
