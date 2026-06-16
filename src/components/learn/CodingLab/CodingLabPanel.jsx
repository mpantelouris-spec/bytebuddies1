import React, { useState, useEffect } from 'react';
import { getCodingLabConfig, codingStorageKey, codingModeKey } from '../../../data/learnCodingConfig';
import BlockCodingLab from './BlockCodingLab';
import TextCodingLab from './TextCodingLab';

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
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>💻 Coding Lab</div>
          {config.allowModeSwitch && (
            <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 3 }}>
              <button type="button" onClick={() => switchMode('blocks')}
                style={{ padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12,
                  background: isBlocks ? color : 'transparent', color: isBlocks ? '#fff' : 'rgba(255,255,255,0.5)' }}>
                🧩 Blocks
              </button>
              <button type="button" onClick={() => switchMode('python')}
                style={{ padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 12,
                  background: !isBlocks ? color : 'transparent', color: !isBlocks ? '#fff' : 'rgba(255,255,255,0.5)' }}>
                🐍 Python
              </button>
            </div>
          )}
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 12 }}>
          {isBlocks
            ? 'Drag blocks from the toolbox, build your program, and run it in the simulator.'
            : 'Write Python in the editor, run it, and watch the console output.'}
          {config.allowModeSwitch && (
            <span style={{ color: 'rgba(255,255,255,0.3)' }}> — switch modes anytime with the tabs above.</span>
          )}
        </div>
        <div style={{ background: `linear-gradient(135deg, ${color}18, transparent)`,
          border: `1.5px solid ${color}44`, borderRadius: 14, padding: '16px 18px' }}>
          <div style={{ fontWeight: 800, fontSize: 12, color, marginBottom: 6 }}>⚡ CODING CHALLENGE</div>
          <div style={{ fontSize: 14, color: '#e2e8f0', lineHeight: 1.55 }}>{config.challenge}</div>
          {config.concept && (
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>
              CS concept: <strong style={{ color }}>{config.concept}</strong>
            </div>
          )}
        </div>
      </div>

      {isBlocks ? (
        <BlockCodingLab key={`blocks-${yr}-${idx}`} config={config} color={color} storageKey={storageKey} onComplete={handleComplete} />
      ) : (
        <TextCodingLab key={`python-${yr}-${idx}`} config={config} color={color} storageKey={storageKey} onComplete={handleComplete} />
      )}

      {done && (
        <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(16,185,129,0.1)',
          border: '1px solid rgba(16,185,129,0.35)', borderRadius: 10, color: '#6ee7b7', fontWeight: 600, fontSize: 13 }}>
          ✅ Coding challenge complete! +{config.xp || 25} XP earned
        </div>
      )}
    </div>
  );
}
