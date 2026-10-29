/**
 * 💾 Save + 📂 My code — named snapshots of a robot program, kept per robot + mission.
 * Shared by the Live Lab and the arcade / Arena Quest code panels.
 */
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { EmojiIcon, IconText } from '../../components/ui/Icon.jsx';

const LS_KEY = 'bb-saved-code-v1';
const AUTO_KEY = 'bb-code-autosave-v1';
const MAX_PER_SCOPE = 12;

function readAll(key) {
  try { return JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch { return {}; }
}
function writeAll(key, all) {
  try { localStorage.setItem(key, JSON.stringify(all)); return true; } catch { return false; }
}
const strip = (blocks) => (blocks || []).map(({ _uid, ...b }) => b);

export function listSavedCode(scope) { return readAll(LS_KEY)[scope] || []; }

/** Autosave — the program a pupil was last working on for this robot + mission. */
export function readAutosave(scope) {
  const v = readAll(AUTO_KEY)[scope];
  return Array.isArray(v) ? v : null;
}
export function writeAutosave(scope, blocks) {
  const all = readAll(AUTO_KEY);
  all[scope] = strip(blocks);
  writeAll(AUTO_KEY, all);
}

export default function SavedCodeMenu({ scope, title = 'My program', blocks, onLoad, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [saves, setSaves] = useState(() => listSavedCode(scope));
  const [flash, setFlash] = useState('');
  const [pos, setPos] = useState(null);
  const btnRef = useRef(null);
  const popRef = useRef(null);

  useEffect(() => { setSaves(listSavedCode(scope)); }, [scope]);
  useEffect(() => {
    if (!flash) return undefined;
    const t = setTimeout(() => setFlash(''), 1800);
    return () => clearTimeout(t);
  }, [flash]);
  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (popRef.current?.contains(e.target) || btnRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('pointerdown', close);
    window.addEventListener('keydown', esc);
    return () => { window.removeEventListener('pointerdown', close); window.removeEventListener('keydown', esc); };
  }, [open]);

  const persist = (next) => {
    const all = readAll(LS_KEY);
    all[scope] = next;
    if (!writeAll(LS_KEY, all)) { setFlash('⚠️ Storage full'); return false; }
    setSaves(next);
    return true;
  };

  const save = () => {
    if (!blocks?.length) { setFlash('Add some blocks first'); return; }
    const n = saves.length ? Math.max(...saves.map((s) => s.n || 0)) + 1 : 1;
    const entry = { id: `s${Date.now()}`, n, name: `${title} #${n}`, savedAt: Date.now(), count: blocks.length, blocks: strip(blocks) };
    if (persist([entry, ...saves].slice(0, MAX_PER_SCOPE))) setFlash('✓ Saved');
  };

  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, left: Math.max(8, Math.min(r.left, window.innerWidth - 300)) });
    }
    setOpen((o) => !o);
  };

  const when = (t) => new Date(t).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  return (
    <>
      <button type="button" className="scratch-tool-btn scratch-save-btn" onClick={save} disabled={disabled} title="Save a copy of this program">
        <IconText>{flash || '💾 Save'}</IconText>
      </button>
      <button ref={btnRef} type="button" className="scratch-tool-btn" onClick={toggle} disabled={disabled} title="My saved programs" aria-expanded={open}>
        📂{saves.length ? ` ${saves.length}` : ''}
      </button>
      {open && pos && createPortal(
        <div ref={popRef} className="scratch-saves-pop" style={{ top: pos.top, left: pos.left }} role="dialog" aria-label="My saved programs">
          <div className="scratch-saves-head"><EmojiIcon e="📂" style={{ marginRight: '0.35em' }} />My saved programs</div>
          <div className="scratch-saves-sub">Your code also saves by itself as you work.</div>
          {saves.length === 0 ? (
            <div className="scratch-saves-empty">Nothing saved yet — press 💾 Save to keep a copy.</div>
          ) : saves.map((s) => (
            <div key={s.id} className="scratch-saves-row">
              <div className="scratch-saves-meta">
                <b>{s.name}</b>
                <small>{s.count} block{s.count === 1 ? '' : 's'} · {when(s.savedAt)}</small>
              </div>
              <button type="button" className="scratch-saves-load" onClick={() => { onLoad(s.blocks); setOpen(false); setFlash('✓ Loaded'); }}>Load</button>
              <button type="button" className="scratch-saves-del" aria-label={`Delete ${s.name}`} onClick={() => persist(saves.filter((x) => x.id !== s.id))}>✕</button>
            </div>
          ))}
        </div>,
        document.body,
      )}
    </>
  );
}
