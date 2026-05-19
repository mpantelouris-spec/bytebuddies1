import React, { useState } from 'react';

const BLOCK_LIBRARY = {
  space: [
    { id: 'countdown', label: 'countdown', icon: '⏱️', output: 'Countdown: 3... 2... 1...' },
    { id: 'systems', label: 'systems check', icon: '✓', output: 'Systems check complete' },
    { id: 'fuel', label: 'fuel loading', icon: '⛽', output: 'Fuel loading...' },
    { id: 'ignite', label: 'ignite engines', icon: '🔥', output: 'Engines ignited!' },
    { id: 'release', label: 'release clamps', icon: '🔓', output: 'Clamps released!' },
    { id: 'go', label: 'go!', icon: '🚀', output: 'Liftoff! 🚀' },
  ],
};

export default function MissionBlockEditor({ campaignId, blocks, onBlocksChange, campaignColor }) {
  const [showPalette, setShowPalette] = useState(false);
  const availableBlocks = BLOCK_LIBRARY[campaignId] || BLOCK_LIBRARY.space;

  const addBlock = (blockDef) => {
    const newBlock = { ...blockDef, uid: Date.now() + Math.random() };
    onBlocksChange([...blocks, newBlock]);
    setShowPalette(false);
  };

  const removeBlock = (uid) => {
    onBlocksChange(blocks.filter(b => b.uid !== uid));
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
        🧱 Build Your Sequence with Blocks
      </div>

      <div style={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: 16, minHeight: 220 }}>
        {blocks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
            Click "+ Add Block" below to start building
          </div>
        )}

        {blocks.map((block, index) => (
          <div key={block.uid} style={{
            background: campaignColor + '30',
            border: `2px solid ${campaignColor}`,
            borderRadius: 8,
            padding: '10px 14px',
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <span style={{ fontSize: 20 }}>{block.icon}</span>
            <span style={{ flex: 1, color: '#fff', fontWeight: 600, fontSize: 14 }}>{block.label}</span>
            <button onClick={() => removeBlock(block.uid)} style={{
              background: 'rgba(239,68,68,0.2)',
              border: '1px solid rgba(239,68,68,0.4)',
              borderRadius: 4,
              padding: '4px 8px',
              color: '#f87171',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
            }}>✕</button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 10, position: 'relative' }}>
        <button onClick={() => setShowPalette(!showPalette)} style={{
          background: campaignColor,
          border: 'none',
          borderRadius: 8,
          padding: '10px 20px',
          color: '#fff',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: 14,
        }}>+ Add Block</button>

        {showPalette && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 998 }} onClick={() => setShowPalette(false)} />
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: 8,
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              padding: 12,
              zIndex: 999,
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              minWidth: 250,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>
                Available Blocks
              </div>
              {availableBlocks.map(block => (
                <button key={block.id} onClick={() => addBlock(block)} style={{
                  width: '100%',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 8,
                  padding: '10px 12px',
                  marginBottom: 6,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'pointer',
                }}>
                  <span style={{ fontSize: 18 }}>{block.icon}</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 13 }}>{block.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}