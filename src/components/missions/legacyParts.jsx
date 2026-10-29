import React, { useState, useEffect, useRef } from 'react';
import { MBLOCK_DEFS, MISSION_PALETTE, genPyFromBlocks } from './missionData.js';
import { EmojiIcon } from '../ui/Icon.jsx';
const MB_BTN = {
  background: 'rgba(var(--mm-ink),0.08)', border: '1px solid rgba(var(--mm-ink),0.15)',
  borderRadius: 4, color: 'rgba(var(--mm-ink),0.7)', cursor: 'pointer',
  fontSize: 11, padding: '2px 5px', lineHeight: 1.4,
};

export function MissionBlockEditor({ missionId, campColor, blocks, setBlocks }) {
  const [showCode, setShowCode] = useState(false);
  const available = MISSION_PALETTE[missionId] || Object.keys(MBLOCK_DEFS);

  const addBlock = (type) => {
    const def = MBLOCK_DEFS[type];
    const params = {};
    (def.params || []).forEach(p => { params[p.key] = p.default; });
    setBlocks(prev => [...prev, { id: Math.random().toString(36).slice(2), type, indent: 0, params }]);
  };

  const updateParam = (id, key, val) =>
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, params: { ...b.params, [key]: val } } : b));

  const moveBlock = (idx, dir) => setBlocks(prev => {
    const arr = [...prev];
    const nIdx = idx + dir;
    if (nIdx < 0 || nIdx >= arr.length) return arr;
    [arr[idx], arr[nIdx]] = [arr[nIdx], arr[idx]];
    return arr;
  });

  const changeIndent = (idx, delta) =>
    setBlocks(prev => prev.map((b, i) => i === idx ? { ...b, indent: Math.max(0, Math.min(4, (b.indent || 0) + delta)) } : b));

  const removeBlock = (id) => setBlocks(prev => prev.filter(b => b.id !== id));

  return (
    <div
      style={{
        background: `${campColor}12`,
        border: `1px solid ${campColor}3d`,
        borderRadius: 14,
        padding: 10,
      }}
    >
      <div style={{ display: 'flex', gap: 10, minHeight: 180 }}>
        {/* Palette */}
        <div
          style={{
            width: 148,
            flexShrink: 0,
            background: 'rgba(var(--mm-ink),0.06)',
            borderRadius: 12,
            padding: '10px 8px',
            border: '1px solid rgba(var(--mm-ink),0.14)',
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(var(--mm-ink),0.35)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, paddingLeft: 2 }}>Blocks</div>
          {available.map(type => {
            const def = MBLOCK_DEFS[type];
            if (!def) return null;
            return (
              <button key={type} onClick={() => addBlock(type)} style={{
                width: '100%', textAlign: 'left', padding: '6px 8px',
                background: def.color + '22', border: `1px solid ${def.color}44`,
                borderRadius: 7, color: 'var(--mm-text)', cursor: 'pointer',
                fontSize: 11, fontWeight: 600, marginBottom: 4,
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <span><EmojiIcon e={def.icon} /></span>{def.label}
              </button>
            );
          })}
        </div>

        {/* Workspace */}
        <div
          style={{
            flex: 1,
            background: 'rgba(var(--mm-ink),0.05)',
            borderRadius: 12,
            padding: 10,
            minHeight: 180,
            border: '1px solid rgba(var(--mm-ink),0.14)',
          }}
        >
          {blocks.length === 0 && (
            <div style={{ color: 'rgba(var(--mm-ink),0.2)', fontSize: 13, textAlign: 'center', marginTop: 60 }}>
              ← Click blocks on the left to add them!
            </div>
          )}
          {blocks.map((block, idx) => {
            const def = MBLOCK_DEFS[block.type];
            if (!def) return null;
            return (
              <div key={block.id} style={{
                marginLeft: (block.indent || 0) * 20,
                marginBottom: 3,
                background: def.color + '18',
                border: `1px solid ${def.color}45`,
                borderLeft: `3px solid ${def.color}`,
                borderRadius: 7,
                padding: '5px 8px',
                display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap',
              }}>
                <span style={{ fontSize: 12 }}><EmojiIcon e={def.icon} /></span>
                <span style={{ fontSize: 11, fontWeight: 700, color: def.color, minWidth: 72, flexShrink: 0 }}>{def.label}</span>
                {(def.params || []).map(param => (
                  <div key={param.key} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <span style={{ fontSize: 10, color: 'rgba(var(--mm-ink),0.35)', flexShrink: 0 }}>{param.label}:</span>
                    <input
                      value={block.params?.[param.key] ?? param.default}
                      onChange={e => updateParam(block.id, param.key, e.target.value)}
                      style={{
                        width: ['message', 'cond', 'value', 'text', 'code', 'list', 'amount'].includes(param.key) ? 150 : 56,
                        background: 'rgba(var(--mm-ink),0.08)', border: '1px solid rgba(var(--mm-ink),0.2)',
                        borderRadius: 4, color: 'var(--mm-text)', fontSize: 10, padding: '2px 5px',
                        fontFamily: 'monospace', outline: 'none',
                      }}
                    />
                  </div>
                ))}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 2, flexShrink: 0 }}>
                  <button onClick={() => changeIndent(idx, 1)} title="Indent right" style={MB_BTN}>→</button>
                  <button onClick={() => changeIndent(idx, -1)} title="Indent left" style={MB_BTN}>←</button>
                  <button onClick={() => moveBlock(idx, -1)} title="Move up" style={MB_BTN}>↑</button>
                  <button onClick={() => moveBlock(idx, 1)} title="Move down" style={MB_BTN}>↓</button>
                  <button onClick={() => removeBlock(block.id)} title="Delete" style={{ ...MB_BTN, color: '#f87171' }}>✕</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Code preview */}
      <details style={{ marginTop: 8 }} onToggle={e => setShowCode(e.target.open)}>
        <summary style={{ color: 'rgba(var(--mm-ink),0.4)', fontSize: 11, cursor: 'pointer', userSelect: 'none', padding: '4px 0' }}>
          <EmojiIcon e="🐍" style={{ marginRight: '0.35em' }} />See the Python code your blocks generate
        </summary>
        <pre style={{
          marginTop: 6, background: 'rgba(10,18,58,0.65)', border: '1px solid rgba(var(--mm-ink),0.16)',
          borderRadius: 8, padding: '10px 14px', color: '#86efac',
          fontFamily: 'monospace', fontSize: 11, lineHeight: 1.7, overflowX: 'auto', margin: '6px 0 0',
        }}>{genPyFromBlocks(blocks)}</pre>
      </details>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export function CertificateModal({ campaign, studentName, onClose }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 800, H = 560;
    canvas.width = W; canvas.height = H;
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#0f0f1a'); bg.addColorStop(1, '#1a1a3e');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = campaign.color; ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, W - 40, H - 40);
    ctx.strokeStyle = campaign.color + '40'; ctx.lineWidth = 1;
    ctx.strokeRect(28, 28, W - 56, H - 56);
    const corners = [[40,40],[W-40,40],[40,H-40],[W-40,H-40]];
    corners.forEach(([x,y]) => {
      const g = ctx.createRadialGradient(x,y,0,x,y,30);
      g.addColorStop(0, campaign.color + '60'); g.addColorStop(1, 'transparent');
      ctx.fillStyle = g; ctx.fillRect(x-30,y-30,60,60);
    });
    ctx.fillStyle = campaign.color; ctx.font = 'bold 14px Inter, Arial'; ctx.textAlign = 'center';
    ctx.fillText('BYTEBUDDIES', W / 2, 72);
    ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.font = '11px Inter, Arial';
    ctx.fillText('CERTIFICATE OF ACHIEVEMENT', W / 2, 92);
    ctx.strokeStyle = campaign.color + '60'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(180, 105); ctx.lineTo(W - 180, 105); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '15px Georgia, serif';
    ctx.fillText('This certifies that', W / 2, 145);
    const nameGrad = ctx.createLinearGradient(200, 0, W - 200, 0);
    nameGrad.addColorStop(0, '#818cf8'); nameGrad.addColorStop(1, '#c084fc');
    ctx.fillStyle = nameGrad; ctx.font = 'bold 44px Georgia, serif';
    ctx.fillText(studentName, W / 2, 205);
    const nameW = ctx.measureText(studentName).width;
    ctx.strokeStyle = campaign.color + '80'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W/2 - nameW/2, 215); ctx.lineTo(W/2 + nameW/2, 215); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.font = '15px Georgia, serif';
    ctx.fillText('has successfully completed the', W / 2, 255);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 28px Inter, Arial';
    ctx.fillText(`${campaign.emoji}  ${campaign.title} Campaign`, W / 2, 295);
    ctx.fillStyle = campaign.color + 'cc'; ctx.font = '13px Inter, Arial';
    ctx.fillText(`Mastering: ${campaign.concept}`, W / 2, 320);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(100, 345); ctx.lineTo(W - 100, 345); ctx.stroke();
    const stats = [
      ['5 Missions', 'Completed'],
      [campaign.xpTotal + ' XP', 'Earned'],
      [new Date().toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'}), 'Date'],
    ];
    stats.forEach(([val, label], i) => {
      const x = 200 + i * 200;
      ctx.fillStyle = '#fff'; ctx.font = 'bold 16px Inter, Arial'; ctx.fillText(val, x, 385);
      ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '11px Inter, Arial'; ctx.fillText(label, x, 402);
    });
    ctx.fillStyle = campaign.color + '20';
    ctx.beginPath(); ctx.arc(W/2, 470, 44, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = campaign.color; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(W/2, 470, 44, 0, Math.PI * 2); ctx.stroke();
    ctx.font = '30px Arial'; ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
    ctx.fillText('🏆', W/2, 482);
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = '10px Inter, Arial';
    ctx.fillText('bytebuddies.technology', W / 2, 530);
  }, []);

  const download = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `ByteBuddies_${CAMPAIGNS.find(c=>c.id===campaign.id)?.title?.replace(/ /g,'_')}_Certificate.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
      onClick={onClose}>
      <div style={{ background: 'var(--bg-secondary)', borderRadius: 20, padding: 28, maxWidth: 860, width: '100%', border: `1px solid ${campaign.color}40` }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0, color: '#fff', fontSize: 18, fontWeight: 700 }}><EmojiIcon e="🏆" style={{ marginRight: '0.35em' }} />Campaign Complete!</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>
        <canvas ref={canvasRef} style={{ width: '100%', borderRadius: 12, display: 'block' }} />
        <div style={{ display: 'flex', gap: 12, marginTop: 16, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 8, color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}>Close</button>
          <button onClick={download} style={{ padding: '10px 24px', background: campaign.color, border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
            <EmojiIcon e="⬇️" style={{ marginRight: '0.35em' }} />Download Certificate
          </button>
        </div>
      </div>
    </div>
  );
}

