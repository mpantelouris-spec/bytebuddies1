import React, { useState, useEffect } from 'react';
import { getCodingLabConfig, codingStorageKey, codingModeKey } from '../../../data/learnCodingConfig';
import BlockCodingLab from './BlockCodingLab';
import TextCodingLab from './TextCodingLab';
import { EmojiIcon } from '../../ui/Icon.jsx';

export default function CodingLabPanel({ yr, idx, lesson, color, onComplete, onXP }) {
  const config = getCodingLabConfig(yr, idx);
  const storageKey = codingStorageKey(yr, idx);
  const modeKey = codingModeKey(yr, idx);

  const [mode, setMode] = useState(() => {
    if (!config) return 'blocks';
    if (config.allowModeSwitch) {
      return localStorage.getItem(modeKey) || config.defaultEditor || 'blocks';
    }
    return config.editor;
  });
  const [done, setDone] = useState(() => localStorage.getItem(storageKey) === '1');

  useEffect(() => {
    if (!config) return;
    if (config.allowModeSwitch) {
      const saved = localStorage.getItem(modeKey);
      setMode(saved || config.defaultEditor || 'blocks');
    } else {
      setMode(config.editor);
    }
    setDone(localStorage.getItem(storageKey) === '1');
  }, [yr, idx, storageKey, modeKey, config?.allowModeSwitch, config?.defaultEditor, config?.editor]);

  if (!config) {
    return <div style={{ color: 'rgba(255,255,255,0.5)' }}>Coding lab loading…</div>;
  }

  function switchMode(next) {
    if (next === mode) return;
    setMode(next);
    if (config.allowModeSwitch) localStorage.setItem(modeKey, next);
  }

  function handleComplete() {
    if (localStorage.getItem(storageKey) === '1') return;
    localStorage.setItem(storageKey, '1');
    setDone(true);
    onXP?.(config.xp || 25);
    onComplete?.();
  }

  const isBlocks = mode === 'blocks';

  return (
    <div>
      {config.allowModeSwitch && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 700 }}>Code with:</span>
          <div role="tablist" style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: 4 }}>
            {[['blocks', '🧩 Blocks'], ['python', '🐍 Python']].map(([m, label]) => (
              <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => switchMode(m)}
                style={{ minHeight: 38, padding: '0 16px', borderRadius: 9, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 14,
                  background: mode === m ? color : 'transparent', color: mode === m ? '#fff' : 'rgba(255,255,255,0.65)' }}>
                {label}
              </button>
            ))}
          </div>
          {config.concept && <span style={{ marginLeft: 'auto', fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>Big idea: <b style={{ color }}>{config.concept}</b></span>}
        </div>
      )}

      {isBlocks ? (
        <BlockCodingLab key={`blocks-${yr}-${idx}`} config={config} color={color} storageKey={storageKey} onComplete={handleComplete} />
      ) : (
        <TextCodingLab key={`python-${yr}-${idx}`} config={config} color={color} storageKey={storageKey} onComplete={handleComplete} />
      )}

      {done && (
        <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(16,185,129,0.1)',
          border: '1px solid rgba(16,185,129,0.35)', borderRadius: 10, color: '#6ee7b7', fontWeight: 600, fontSize: 13 }}>
          <EmojiIcon e="✅" style={{ marginRight: '0.35em' }} />Coding challenge complete · +{config.xp || 25} XP
        </div>
      )}
    </div>
  );
}
