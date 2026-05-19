import React, { useRef, useEffect } from 'react';

export default function CodeEditor({ code, language, onChange }) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  useEffect(() => {
    // Dynamically load Monaco Editor
    let disposed = false;
    const loadMonaco = async () => {
      try {
        const monaco = await import('@monaco-editor/react');
        if (!disposed) {
          monacoRef.current = monaco;
        }
      } catch {
        // Monaco not available, use fallback
      }
    };
    loadMonaco();
    return () => { disposed = true; };
  }, []);

  const MonacoLazy = React.lazy(() =>
    import('@monaco-editor/react').then(mod => ({ default: mod.default }))
  );

  const languageMap = {
    python: 'python',
    javascript: 'javascript',
    html: 'html',
    css: 'css',
    'c++': 'cpp',
  };

  return (
    <div style={{ flex: 1, position: 'relative' }}>
      <React.Suspense
        fallback={
          <FallbackEditor code={code} language={language} onChange={onChange} />
        }
      >
        <MonacoLazy
          height="100%"
          language={languageMap[language] || 'python'}
          theme="vs-dark"
          value={code}
          onChange={(val) => onChange(val || '')}
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 12 },
            lineNumbers: 'on',
            roundedSelection: true,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            bracketPairColorization: { enabled: true },
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            renderLineHighlight: 'all',
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
          }}
        />
      </React.Suspense>
    </div>
  );
}

function FallbackEditor({ code, language, onChange }) {
  return (
    <textarea
      value={code}
      onChange={(e) => onChange(e.target.value)}
      spellCheck={false}
      style={{
        width: '100%',
        height: '100%',
        background: '#1e1e1e',
        color: '#d4d4d4',
        border: 'none',
        outline: 'none',
        resize: 'none',
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        fontSize: 14,
        lineHeight: 1.6,
        padding: 16,
        tabSize: 2,
      }}
    />
  );
}
