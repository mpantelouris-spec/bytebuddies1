import React, { useState } from 'react';

export default function ShareDesignModal({ design, onShare, onClose }) {
  const link = design?.id ? `https://bytebuddies.technology/#vrd?design=${design.id}` : 'https://bytebuddies.technology/#vrd';
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard?.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="vrd-modal-overlay" onClick={onClose}>
      <div className="vrd-modal" onClick={(e) => e.stopPropagation()}>
        <h2 style={{ margin: '0 0 12px' }}>📱 Share Your Design</h2>
        <p style={{ fontSize: 13, color: 'rgba(240,230,255,0.6)' }}>Share with your class — classmates can view, like, and remix!</p>
        <button type="button" className="vrd-btn vrd-btn-primary" style={{ width: '100%', justifyContent: 'center', margin: '16px 0' }} onClick={() => onShare?.()}>
          🌍 Make Public & Share
        </button>
        <label className="vrd-field-label">Copy link</label>
        <div style={{ display: 'flex', gap: 8 }}>
          <input className="vrd-input" readOnly value={link} style={{ flex: 1, fontSize: 11 }} />
          <button type="button" className="vrd-btn vrd-btn-secondary" onClick={copyLink}>{copied ? '✓ Copied!' : 'Copy'}</button>
        </div>
        <button type="button" className="vrd-btn" style={{ marginTop: 16, width: '100%', justifyContent: 'center', background: 'rgba(255,255,255,0.08)', color: '#ccc' }} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
