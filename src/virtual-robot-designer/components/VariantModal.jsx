import React from 'react';
import { SIM_ROBOTS } from '../simulator/virtualRobotEngine.jsx';

function StatDelta({ label, from, to }) {
  const up = to > from;
  const down = to < from;
  return (
    <div style={{ fontSize: 11, display: 'flex', justifyContent: 'space-between' }}>
      <span style={{ color: 'rgba(240,230,255,0.6)' }}>{label}</span>
      <span>
        {from}% → {to}% {up && '⬆️'}{down && '⬇️'}{!up && !down && '—'}
      </span>
    </div>
  );
}

export default function VariantModal({ variants, onClose, onLoad, onTest, onSave }) {
  if (!variants?.length) return null;

  return (
    <div className="vrd-modal-overlay" onClick={onClose} role="presentation">
      <div className="vrd-modal vrd-modal-wide" onClick={(e) => e.stopPropagation()}>
        <div className="vrd-modal-header">
          <h2>🤖 INSANE VARIANTS READY!</h2>
          <button type="button" className="vrd-modal-close" onClick={onClose}>✕</button>
        </div>
        <p style={{ margin: '0 0 16px', color: 'rgba(240,230,255,0.65)', fontSize: 13 }}>
          AI cooked up {variants.length} wild robots from your design. Load, test, or save any one!
        </p>
        <div className="vrd-variant-grid">
          {variants.map((v) => {
            const tmpl = v.robot_config?.template || 'rover';
            const meta = SIM_ROBOTS.find((r) => r.id === tmpl) || SIM_ROBOTS[0];
            const stars = '⭐'.repeat(v.coolness || 5);
            return (
              <div key={v.id} className="vrd-variant-card">
                <div className="vrd-variant-card-title">{v.variant_name}</div>
                <div style={{ fontSize: 40, textAlign: 'center', margin: '8px 0' }}>{meta.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#FF006E', marginBottom: 8 }}>COOLNESS: {stars}</div>
                <div style={{ fontSize: 11, marginBottom: 8 }}>
                  <strong>KEY CHANGES:</strong>
                  <ul style={{ margin: '4px 0 0', paddingLeft: 16 }}>
                    {(v.changes || []).map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
                {v.statComparison && (
                  <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: 8, marginBottom: 8 }}>
                    {Object.entries(v.statComparison).map(([k, val]) => (
                      <StatDelta key={k} label={k.charAt(0).toUpperCase() + k.slice(1)} from={val.from} to={val.to} />
                    ))}
                  </div>
                )}
                <p style={{ fontSize: 11, fontStyle: 'italic', color: 'rgba(240,230,255,0.7)', margin: '0 0 6px' }}>{v.personality}</p>
                <p style={{ fontSize: 10, color: 'rgba(240,230,255,0.5)', margin: '0 0 12px' }}>{v.useCase}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  <button type="button" className="vrd-btn vrd-btn-primary" style={{ fontSize: 11, padding: '6px 10px' }}
                    onClick={() => { onLoad({ ...v.robot_config, name: v.variant_name }); onClose(); }}>
                    Load
                  </button>
                  <button type="button" className="vrd-btn vrd-btn-secondary" style={{ fontSize: 11, padding: '6px 10px' }}
                    onClick={() => { onLoad({ ...v.robot_config, name: v.variant_name }); onTest(); onClose(); }}>
                    Test
                  </button>
                  <button type="button" className="vrd-btn" style={{ fontSize: 11, padding: '6px 10px', background: 'rgba(139,0,255,0.3)', color: '#e9d5ff' }}
                    onClick={() => onSave?.(v)}>
                    Save
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
