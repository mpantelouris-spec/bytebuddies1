import React, { useState } from 'react';

/**
 * StarterBlocks — icon-only block canvas for ages 5-7 (Year 1-2 Starter Mode).
 * No text on blocks. Large touch targets. Simple 4-category palette.
 * Executes visually using emoji animations.
 */

const STARTER_PALETTE = [
  { id: 'move-right', icon: '➡️', label: 'Move Right', category: 'Sequence', color: '#6366f1', action: 'move-right' },
  { id: 'move-up',    icon: '⬆️', label: 'Move Up',    category: 'Sequence', color: '#6366f1', action: 'move-up' },
  { id: 'move-down',  icon: '⬇️', label: 'Move Down',  category: 'Sequence', color: '#6366f1', action: 'move-down' },
  { id: 'move-left',  icon: '⬅️', label: 'Move Left',  category: 'Sequence', color: '#6366f1', action: 'move-left' },
  { id: 'repeat',     icon: '🔁', label: 'Repeat',     category: 'Loop',     color: '#8b5cf6', action: 'repeat' },
  { id: 'show',       icon: '👁️', label: 'Show',       category: 'Look',     color: '#10b981', action: 'show' },
  { id: 'hide',       icon: '🙈', label: 'Hide',       category: 'Look',     color: '#10b981', action: 'hide' },
  { id: 'say',        icon: '💬', label: 'Say Hello',  category: 'Look',     color: '#10b981', action: 'say' },
  { id: 'sound',      icon: '🔊', label: 'Play Sound', category: 'Sound',    color: '#f59e0b', action: 'sound' },
  { id: 'celebrate',  icon: '🎉', label: 'Celebrate',  category: 'Sound',    color: '#f59e0b', action: 'celebrate' },
];

const CATEGORIES = ['Sequence', 'Loop', 'Look', 'Sound'];
const CAT_COLORS = { Sequence: '#6366f1', Loop: '#8b5cf6', Look: '#10b981', Sound: '#f59e0b' };

// Simple sprite that reacts to blocks
function StarterStage({ running, actions }) {
  const [spritePos, setSpritePos] = useState({ x: 120, y: 120 });
  const [visible, setVisible] = useState(true);
  const [speech, setSpeech] = useState('');
  const [celebrating, setCelebrating] = useState(false);

  React.useEffect(() => {
    if (!running || !actions.length) return;
    let pos = { x: 120, y: 120 };
    let delay = 0;
    let vis = true;

    actions.forEach((action, i) => {
      const step = 40;
      setTimeout(() => {
        if (action === 'move-right') pos = { ...pos, x: Math.min(pos.x + step, 220) };
        if (action === 'move-left')  pos = { ...pos, x: Math.max(pos.x - step, 20) };
        if (action === 'move-up')    pos = { ...pos, y: Math.max(pos.y - step, 20) };
        if (action === 'move-down')  pos = { ...pos, y: Math.min(pos.y + step, 220) };
        if (action === 'show')   { vis = true; setVisible(true); }
        if (action === 'hide')   { vis = false; setVisible(false); }
        if (action === 'say')    { setSpeech('Hello! 👋'); setTimeout(() => setSpeech(''), 1500); }
        if (action === 'sound')  { /* audio would go here */ }
        if (action === 'celebrate') { setCelebrating(true); setTimeout(() => setCelebrating(false), 1000); }
        setSpritePos({ ...pos });
      }, delay);
      delay += 500;
    });
  }, [running, actions]);

  return (
    <div style={{
      width: 260, height: 260, background: 'linear-gradient(135deg, #1e3a5f, #0f1a2e)',
      borderRadius: 16, position: 'relative', flexShrink: 0, overflow: 'hidden',
      border: '2px solid rgba(99,102,241,0.4)',
    }}>
      {/* Grid */}
      <svg style={{ position: 'absolute', inset: 0, opacity: 0.15 }} width="260" height="260">
        {[0,1,2,3,4,5].map(i => (
          <React.Fragment key={i}>
            <line x1={i*40+20} y1={0} x2={i*40+20} y2={260} stroke="#fff" strokeWidth="1" />
            <line x1={0} y1={i*40+20} x2={260} y2={i*40+20} stroke="#fff" strokeWidth="1" />
          </React.Fragment>
        ))}
      </svg>

      {/* Sprite */}
      <div style={{
        position: 'absolute',
        left: spritePos.x,
        top: spritePos.y,
        fontSize: 36,
        opacity: visible ? 1 : 0.2,
        transition: 'left 0.4s ease, top 0.4s ease, opacity 0.3s',
        transform: celebrating ? 'scale(1.4) rotate(10deg)' : 'scale(1)',
      }}>
        🐱
        {speech && (
          <div style={{
            position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
            background: 'white', color: '#1a1a2e', borderRadius: 8, padding: '4px 10px',
            fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap', boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            marginBottom: 4,
          }}>
            {speech}
          </div>
        )}
      </div>
    </div>
  );
}

export default function StarterBlocks() {
  const [program, setProgram] = useState([]);   // array of action strings
  const [running, setRunning] = useState(false);
  const [activeCategory, setActiveCategory] = useState('Sequence');

  const addBlock = (block) => {
    if (block.action === 'repeat') {
      // Repeat last block 3 times
      if (program.length > 0) {
        const last = program[program.length - 1];
        setProgram(prev => [...prev, last, last, last]);
      }
    } else {
      setProgram(prev => [...prev, block.action]);
    }
  };

  const removeBlock = (idx) => {
    setProgram(prev => prev.filter((_, i) => i !== idx));
  };

  const handleRun = () => {
    setRunning(false);
    setTimeout(() => setRunning(true), 50);
    setTimeout(() => setRunning(false), program.length * 500 + 200);
  };

  const handleClear = () => {
    setProgram([]);
    setRunning(false);
  };

  const filteredBlocks = STARTER_PALETTE.filter(b => b.category === activeCategory);
  const actionMap = Object.fromEntries(STARTER_PALETTE.map(b => [b.action, b]));

  return (
    <div style={{ flex: 1, display: 'flex', gap: 16, padding: 16, overflow: 'hidden', minHeight: 0 }}>
      {/* Palette */}
      <div style={{ width: 180, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
          Pick a Block
        </div>
        {/* Category tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                fontSize: 11, fontWeight: 700, padding: '4px 10px',
                background: activeCategory === cat ? CAT_COLORS[cat] : 'var(--bg-tertiary)',
                color: activeCategory === cat ? '#fff' : 'var(--text-muted)',
                border: `1px solid ${CAT_COLORS[cat]}44`,
                borderRadius: 20, cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
        {/* Blocks */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {filteredBlocks.map(block => (
            <button
              key={block.id}
              onClick={() => addBlock(block)}
              aria-label={block.label}
              title={block.label}
              style={{
                width: 72, height: 72, fontSize: 32,
                background: block.color + '22',
                border: `2px solid ${block.color}`,
                borderRadius: 14,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
                touchAction: 'manipulation',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = `0 4px 16px ${block.color}44`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              {block.icon}
            </button>
          ))}
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 8, fontStyle: 'italic' }}>
          Tap a block to add it to your program
        </div>
      </div>

      {/* Program (sequence of chosen blocks) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, alignSelf: 'center' }}>
            Your Program
          </div>
          <button className="btn btn-success btn-sm" onClick={handleRun} disabled={!program.length} style={{ marginLeft: 'auto' }}>
            ▶ Run
          </button>
          <button className="btn btn-ghost btn-sm" onClick={handleClear}>
            🗑 Clear
          </button>
        </div>

        {/* Block sequence */}
        <div style={{
          flex: 1, background: 'var(--bg-secondary)', borderRadius: 12, padding: 12,
          border: '2px dashed var(--border-color)', minHeight: 60,
          display: 'flex', flexWrap: 'wrap', gap: 8, alignContent: 'flex-start',
        }}>
          {program.length === 0 && (
            <div style={{ color: 'var(--text-muted)', fontSize: 14, width: '100%', textAlign: 'center', paddingTop: 20 }}>
              👆 Tap blocks on the left to build your program!
            </div>
          )}
          {program.map((action, idx) => {
            const block = actionMap[action];
            if (!block) return null;
            return (
              <button
                key={idx}
                onClick={() => removeBlock(idx)}
                aria-label={`Remove ${block.label}`}
                title={`${block.label} — tap to remove`}
                style={{
                  width: 60, height: 60, fontSize: 28,
                  background: block.color + '22',
                  border: `2px solid ${block.color}`,
                  borderRadius: 12,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  touchAction: 'manipulation',
                  position: 'relative',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.6'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
              >
                {block.icon}
                <div style={{ position: 'absolute', top: -6, right: -6, width: 16, height: 16, background: '#ef4444', borderRadius: '50%', fontSize: 10, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>×</div>
              </button>
            );
          })}
        </div>

        {program.length > 0 && (
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {program.length} step{program.length !== 1 ? 's' : ''} · Tap a block to remove it
          </div>
        )}
      </div>

      {/* Stage */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
          Stage
        </div>
        <StarterStage running={running} actions={program} />
        {running && (
          <div style={{ fontSize: 12, color: 'var(--accent-success)', fontWeight: 700, animation: 'pulse 1s infinite' }}>
            ▶ Running...
          </div>
        )}
      </div>
    </div>
  );
}
