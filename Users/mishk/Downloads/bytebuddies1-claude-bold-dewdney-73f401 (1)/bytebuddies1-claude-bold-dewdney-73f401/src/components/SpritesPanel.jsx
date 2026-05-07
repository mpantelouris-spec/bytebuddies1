import React from 'react';

const SPRITE_COLORS = {
  1: '#3b82f6',  // Blue for Cat/Player 1
  2: '#ef4444',  // Red for Star/Player 2
  3: '#10b981',  // Green for Platform
};

function SpriteThumb({ svgKey, color, size = 32 }) {
  // Simple colored square for now
  return (
    <div style={{
      width: size,
      height: size,
      background: color || '#4c97ff',
      borderRadius: 4,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      fontSize: size * 0.5,
      fontWeight: 700,
    }}>
      {svgKey ? svgKey.charAt(0) : '?'}
    </div>
  );
}

export default function SpritesPanel({ sprites, selected, onSelectSprite, onAddSprite }) {
  return (
    <div style={{
      width: 180,
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid var(--border-color)',
      background: 'var(--bg-secondary)',
      flexShrink: 0,
      minHeight: 0,
    }}>
      {/* Header */}
      <div style={{
        padding: '8px 10px',
        borderBottom: '1px solid var(--border-color)',
        fontSize: 11,
        fontWeight: 700,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span>Sprites</span>
        <button
          onClick={onAddSprite}
          title="Add sprite"
          style={{
            background: 'var(--accent-primary)',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            padding: '2px 6px',
            fontSize: 10,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          +
        </button>
      </div>

      {/* Sprites list */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        padding: 6,
      }}>
        {sprites.map((sprite) => {
          const isSelected = selected === sprite.id;
          const spriteColor = SPRITE_COLORS[sprite.id] || '#4c97ff';
          return (
            <button
              key={sprite.id}
              onClick={() => onSelectSprite(sprite.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 8px',
                borderRadius: 6,
                border: isSelected ? `2px solid ${spriteColor}` : '1px solid var(--border-color)',
                background: isSelected ? `${spriteColor}11` : 'var(--bg-primary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.target.style.background = 'var(--bg-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.target.style.background = 'var(--bg-primary)';
                }
              }}
            >
              <SpriteThumb svgKey={sprite.svgKey} color={spriteColor} size={24} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 12,
                  fontWeight: isSelected ? 600 : 500,
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {sprite.name}
                </div>
                <div style={{
                  fontSize: 10,
                  color: 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {sprite.blocks?.length || 0} blocks
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Sprite Inspector */}
      {selected && sprites.find(s => s.id === selected) && (
        <div style={{
          borderTop: '1px solid var(--border-color)',
          padding: '8px 10px',
          fontSize: 10,
          color: 'var(--text-muted)',
        }}>
          <div style={{ fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
            Inspector
          </div>
          {(() => {
            const sprite = sprites.find(s => s.id === selected);
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <div>X: {Math.round(sprite.x)}</div>
                <div>Y: {Math.round(sprite.y)}</div>
                <div>Size: {sprite.w}×{sprite.h}</div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
