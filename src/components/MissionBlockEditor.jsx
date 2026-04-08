import React from 'react';

let _uid = 0;
export const nextUid = () => String(++_uid);

function WorkspaceBlock({ block, color, onDelete }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: `${color}22`, border: `1.5px solid ${color}60`,
      borderLeft: `4px solid ${color}`, borderRadius: 10,
      padding: '10px 14px', marginBottom: 6, userSelect: 'none',
    }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', flex: 1 }}>
        {block.label}
      </span>
      <button
        onClick={() => onDelete(block.uid)}
        title="Remove block"
        style={{
          background: 'rgba(255,255,255,0.08)', border: 'none',
          borderRadius: 6, color: '#94a3b8', cursor: 'pointer',
          fontSize: 12, padding: '2px 8px', lineHeight: 1.4,
        }}
      >
        🗑
      </button>
    </div>
  );
}

export default function MissionBlockEditor({ availableBlocks = [], workspace = [], onWorkspaceChange, campaignColor = '#6366f1' }) {
  const addBlock = (block) => {
    onWorkspaceChange([...workspace, { ...block, uid: nextUid() }]);
  };

  const removeBlock = (uid) => {
    onWorkspaceChange(workspace.filter(b => b.uid !== uid));
  };

  return (
    <div style={{ display: 'flex', gap: 12, minHeight: 280 }}>
      {/* Palette */}
      <div style={{
        width: 200, flexShrink: 0, background: 'rgba(0,0,0,0.3)',
        borderRadius: 12, padding: 12,
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10,
        }}>
          🧩 Block Palette
        </div>
        {availableBlocks.map(block => (
          <button
            key={block.id}
            onClick={() => addBlock(block)}
            style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '9px 12px', marginBottom: 6, borderRadius: 10,
              border: `1.5px solid ${campaignColor}50`,
              background: `${campaignColor}18`, color: '#e2e8f0',
              cursor: 'pointer', fontSize: 13, fontWeight: 600,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = `${campaignColor}38`; }}
            onMouseLeave={e => { e.currentTarget.style.background = `${campaignColor}18`; }}
          >
            {block.label}
          </button>
        ))}
      </div>

      {/* Workspace */}
      <div style={{
        flex: 1, background: 'rgba(0,0,0,0.2)', borderRadius: 12,
        padding: 12, border: '1px solid rgba(255,255,255,0.08)',
        minHeight: 280,
      }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10,
        }}>
          ⚙️ Your Sequence ({workspace.length} block{workspace.length !== 1 ? 's' : ''})
        </div>
        {workspace.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '40px 20px',
            color: 'rgba(255,255,255,0.25)', fontSize: 14,
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🧩</div>
            Click blocks from the palette to add them here
          </div>
        ) : (
          workspace.map(block => (
            <WorkspaceBlock
              key={block.uid}
              block={block}
              color={campaignColor}
              onDelete={removeBlock}
            />
          ))
        )}
      </div>
    </div>
  );
}
