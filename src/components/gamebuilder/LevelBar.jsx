import React, { useState } from 'react';
import { MAX_LEVELS } from './levels';
import './levelBar.css';
import { EmojiIcon } from '../ui/Icon.jsx';

/**
 * Level tabs under the stage: pick a level to edit (its backdrop and where sprites start),
 * add, rename, reorder and delete levels.
 */
export default function LevelBar({ levels, current, onSelect, onAdd, onRename, onDelete, onMove, thumbFor, disabled }) {
  const [menu, setMenu] = useState(null);
  const [renaming, setRenaming] = useState(null);

  return (
    <div className={`lvl-bar${disabled ? ' off' : ''}`} onMouseLeave={() => setMenu(null)}>
      <span className="lvl-label" title="Each level has its own backdrop and its own sprite positions">Levels</span>
      <div className="lvl-list">
        {levels.map((l, i) => (
          <div key={l.id} className={`lvl-chip${i === current ? ' on' : ''}`}>
            <button type="button" className="lvl-main" onClick={() => onSelect(i)} title={`Edit ${l.name} — ${l.backdrop}`} disabled={disabled}>
              <span className="lvl-thumb" style={thumbFor(l.backdrop)} />
              {renaming === i ? (
                <input
                  autoFocus
                  defaultValue={l.name}
                  maxLength={24}
                  onClick={(e) => e.stopPropagation()}
                  onBlur={(e) => { onRename(i, e.target.value.trim() || l.name); setRenaming(null); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); if (e.key === 'Escape') setRenaming(null); }}
                />
              ) : <b>{l.name}</b>}
            </button>
            {i === current && !disabled && (
              <button type="button" className="lvl-more" onClick={() => setMenu(menu === i ? null : i)} aria-label={`${l.name} options`}>⋯</button>
            )}
            {menu === i && (
              <div className="lvl-menu" onMouseDown={(e) => e.stopPropagation()}>
                <button type="button" onClick={() => { setRenaming(i); setMenu(null); }}><EmojiIcon e="✏️" style={{ marginRight: '0.35em' }} />Rename</button>
                <button type="button" disabled={i === 0} onClick={() => { onMove(i, i - 1); setMenu(null); }}>◀ Move earlier</button>
                <button type="button" disabled={i === levels.length - 1} onClick={() => { onMove(i, i + 1); setMenu(null); }}>Move later ▶</button>
                <button type="button" className="danger" disabled={levels.length <= 1} onClick={() => { onDelete(i); setMenu(null); }}><EmojiIcon e="🗑" style={{ marginRight: '0.35em' }} />Delete level</button>
              </div>
            )}
          </div>
        ))}
        {levels.length < MAX_LEVELS && (
          <button type="button" className="lvl-add" onClick={onAdd} disabled={disabled} title="Add a level with its own backdrop and layout">+ Add level</button>
        )}
      </div>
    </div>
  );
}
