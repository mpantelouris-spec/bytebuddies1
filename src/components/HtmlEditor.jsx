import React, { useState, useRef, useCallback } from 'react';

const DEFAULT_HTML = `<!DOCTYPE html>
<html>
  <head>
    <title>My Page</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 20px; background: #fff; }
    </style>
  </head>
  <body>
    <h1>Hello World!</h1>
    <p>Start editing to see your page come to life.</p>
  </body>
</html>`;

export default function HtmlEditor({ starterCode = DEFAULT_HTML, editorHeight = 600 }) {
  const [code, setCode] = useState(starterCode);
  const [preview, setPreview] = useState(starterCode);
  const [activeTab, setActiveTab] = useState('html');
  const iframeRef = useRef(null);
  const textareaRef = useRef(null);

  const halfH = Math.floor(editorHeight / 2);

  const runPreview = useCallback(() => {
    setPreview(code);
  }, [code]);

  const handleKeyDown = (e) => {
    // Tab inserts 2 spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = textareaRef.current;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newCode = code.substring(0, start) + '  ' + code.substring(end);
      setCode(newCode);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
    // Ctrl+Enter / Cmd+Enter runs preview
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runPreview();
    }
  };

  const s = {
    container: {
      borderRadius: 12,
      overflow: 'hidden',
      border: '1px solid #06b6d430',
      background: '#0f172a',
      fontFamily: 'monospace',
    },
    toolbar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 14px',
      background: '#06b6d422',
      borderBottom: '1px solid #06b6d430',
      gap: 10,
    },
    tabs: { display: 'flex', gap: 6 },
    tab: (active) => ({
      padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer',
      border: active ? '1.5px solid #06b6d4' : '1.5px solid transparent',
      background: active ? '#06b6d422' : 'transparent',
      color: active ? '#06b6d4' : '#94a3b8',
      transition: 'all 0.15s',
    }),
    runBtn: {
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '5px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
      background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
      color: '#fff', fontSize: 12, fontWeight: 800,
    },
    textarea: {
      width: '100%', boxSizing: 'border-box',
      height: editorHeight,
      padding: '14px 16px',
      background: '#0f172a',
      color: '#e2e8f0',
      fontSize: 13,
      lineHeight: 1.65,
      fontFamily: '"Fira Code", "Cascadia Code", "Consolas", monospace',
      border: 'none', outline: 'none', resize: 'none',
      tabSize: 2,
    },
    previewWrap: {
      background: '#fff',
      height: editorHeight,
      borderTop: '1px solid #06b6d430',
    },
    iframe: {
      width: '100%', height: '100%', border: 'none', display: 'block',
    },
    hint: {
      fontSize: 10, color: '#475569', fontWeight: 600,
    },
  };

  return (
    <div style={s.container}>
      {/* Toolbar */}
      <div style={s.toolbar}>
        <div style={s.tabs}>
          <button style={s.tab(activeTab === 'html')} onClick={() => setActiveTab('html')}>
            📝 HTML Editor
          </button>
          <button style={s.tab(activeTab === 'preview')} onClick={() => { setActiveTab('preview'); runPreview(); }}>
            🌐 Preview
          </button>
          <button style={s.tab(activeTab === 'split')} onClick={() => { setActiveTab('split'); runPreview(); }}>
            ⬛ Split
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={s.hint}>Ctrl+Enter to preview</span>
          <button style={s.runBtn} onClick={() => { runPreview(); if (activeTab === 'html') setActiveTab('split'); }}>
            ▶ Run Preview
          </button>
        </div>
      </div>

      {/* Editor + Preview */}
      {activeTab === 'split' ? (
        <div style={{ display: 'flex', height: editorHeight }}>
          <div style={{ flex: 1, borderRight: '2px solid #06b6d430', overflow: 'hidden' }}>
            <textarea
              ref={textareaRef}
              style={{ ...s.textarea, height: '100%' }}
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
            />
          </div>
          <div style={{ flex: 1, background: '#fff' }}>
            <iframe
              ref={iframeRef}
              style={s.iframe}
              srcDoc={preview}
              sandbox="allow-scripts allow-same-origin"
              title="HTML Preview"
            />
          </div>
        </div>
      ) : activeTab === 'html' ? (
        <textarea
          ref={textareaRef}
          style={s.textarea}
          value={code}
          onChange={e => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
        />
      ) : (
        <div style={s.previewWrap}>
          <iframe
            ref={iframeRef}
            style={s.iframe}
            srcDoc={preview}
            sandbox="allow-scripts allow-same-origin"
            title="HTML Preview"
          />
        </div>
      )}
    </div>
  );
}
