import React, { useState } from 'react';
import { useProject } from '../contexts/ProjectContext';

export default function ExportModal({ onClose }) {
  const [format, setFormat] = useState('html');
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);
  const { activeProject } = useProject();

  const formats = [
    { id: 'html', icon: '🌐', name: 'HTML Website', desc: 'Export as a standalone HTML file' },
    { id: 'exe', icon: '🎮', name: 'Executable Game', desc: 'Package as a desktop application' },
    { id: 'mobile', icon: '📱', name: 'Mobile App', desc: 'Export for iOS/Android (PWA)' },
    { id: 'github', icon: '🐙', name: 'GitHub Repository', desc: 'Push to a new GitHub repository' },
    { id: 'zip', icon: '📦', name: 'ZIP Archive', desc: 'Download all project files as ZIP' },
    { id: 'embed', icon: '🔗', name: 'Embed Link', desc: 'Get an embeddable iframe link' },
  ];

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      setDone(true);
    }, 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📦 Export Project</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {done ? (
            <div style={{ textAlign: 'center', padding: 32 }}>
              <div style={{ fontSize: 64, marginBottom: 16 }} className="animate-bounce-in">✅</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Export Complete!</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
                Your project "{activeProject?.name}" has been exported as {formats.find(f => f.id === format)?.name}.
              </p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                <button className="btn btn-primary" onClick={onClose}>Done</button>
                <button className="btn btn-secondary" onClick={() => setDone(false)}>Export Again</button>
              </div>
            </div>
          ) : (
            <>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: 14 }}>
                Choose how you'd like to export <strong>{activeProject?.name || 'your project'}</strong>:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {formats.map(f => (
                  <div
                    key={f.id}
                    style={{
                      padding: 14,
                      borderRadius: 10,
                      border: `2px solid ${format === f.id ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                      background: format === f.id ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-tertiary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      transition: 'all 0.15s',
                    }}
                    onClick={() => setFormat(f.id)}
                  >
                    <span style={{ fontSize: 28 }}>{f.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{f.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{f.desc}</div>
                    </div>
                    {format === f.id && (
                      <span style={{ marginLeft: 'auto', color: 'var(--accent-primary)', fontWeight: 700 }}>✓</span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        {!done && (
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleExport} disabled={exporting}>
              {exporting ? '⏳ Exporting...' : `Export as ${formats.find(f => f.id === format)?.name}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
