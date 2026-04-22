import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useProject } from '../contexts/ProjectContext';
import { useUser } from '../contexts/UserContext';
import CodeEditor from './CodeEditor';
import AIAssistant from './AIAssistant';
import StarterBlocks from './StarterBlocks';
import { runPython } from '../utils/pythonRunner';

/* ─── Block type definitions ─── */
const BLOCK_DEFS = {
  'event-start':      { label: 'When program starts', icon: '🚩', color: '#f59e0b', category: 'event', params: {} },
  'event-keypress':   { label: 'On key press', icon: '🎯', color: '#f59e0b', category: 'event', params: { key: 'space' } },
  'event-click':      { label: 'On click', icon: '🎯', color: '#f59e0b', category: 'event', params: {} },
  'event-message':    { label: 'On message', icon: '🎯', color: '#f59e0b', category: 'event', params: { message: 'go' } },
  'event-broadcast':  { label: 'Broadcast', icon: '🎯', color: '#f59e0b', category: 'event', params: { message: 'go' } },
  'var-create':       { label: 'Create variable', icon: '📦', color: '#f97316', category: 'variable', params: { name: 'myVar', value: '0' } },
  'var-set':          { label: 'Set', icon: '📦', color: '#f97316', category: 'variable', params: { name: 'myVar', value: '0' } },
  'var-change':       { label: 'Change', icon: '📦', color: '#f97316', category: 'variable', params: { name: 'myVar', amount: '1' } },
  'var-show':         { label: 'Show variable', icon: '📦', color: '#f97316', category: 'variable', params: { name: 'myVar' } },
  'logic-if':         { label: 'If', icon: '🧠', color: '#3b82f6', category: 'logic', params: { condition: 'x > 5' } },
  'logic-and':        { label: 'And / Or', icon: '🧠', color: '#3b82f6', category: 'logic', params: { left: 'a', op: 'and', right: 'b' } },
  'logic-compare':    { label: 'Compare', icon: '🧠', color: '#3b82f6', category: 'logic', params: { left: 'a', op: '=', right: 'b' } },
  'logic-bool':       { label: 'Boolean', icon: '🧠', color: '#3b82f6', category: 'logic', params: { value: 'true' } },
  'loop-repeat':      { label: 'Repeat', icon: '🔁', color: '#059669', category: 'loop', params: { times: '10' } },
  'loop-while':       { label: 'While', icon: '🔁', color: '#059669', category: 'loop', params: { condition: 'true' } },
  'loop-foreach':     { label: 'For each', icon: '🔁', color: '#059669', category: 'loop', params: { item: 'item', list: 'myList' } },
  'loop-break':       { label: 'Break', icon: '🔁', color: '#059669', category: 'loop', params: {} },
  'func-define':      { label: 'Define function', icon: '⚡', color: '#3b82f6', category: 'function', params: { name: 'myFunc' } },
  'func-call':        { label: 'Call', icon: '⚡', color: '#3b82f6', category: 'function', params: { name: 'myFunc' } },
  'func-return':      { label: 'Return', icon: '⚡', color: '#3b82f6', category: 'function', params: { value: '0' } },
  'func-params':      { label: 'With parameters', icon: '⚡', color: '#3b82f6', category: 'function', params: { params: 'a, b' } },
  'action-print':     { label: 'Print', icon: '💬', color: '#a855f7', category: 'action', params: { message: '"Hello!"' } },
  'action-ask':       { label: 'Ask and wait', icon: '💬', color: '#a855f7', category: 'action', params: { prompt: '"What is your name?"' } },
  'action-alert':     { label: 'Alert', icon: '💬', color: '#a855f7', category: 'action', params: { message: '"Notice"' } },
  'math-add':         { label: 'Add / Subtract', icon: '🔢', color: '#ef4444', category: 'math', params: { a: '1', op: '+', b: '1' } },
  'math-mult':        { label: 'Multiply / Divide', icon: '🔢', color: '#ef4444', category: 'math', params: { a: '2', op: '×', b: '3' } },
  'math-random':      { label: 'Random number', icon: '🔢', color: '#ef4444', category: 'math', params: { min: '1', max: '100' } },
  'math-round':       { label: 'Round / Abs', icon: '🔢', color: '#ef4444', category: 'math', params: { op: 'round', value: '3.7' } },
  'text-create':      { label: 'Create text', icon: '📝', color: '#ef4444', category: 'text', params: { text: '"hello"' } },
  'text-join':        { label: 'Join text', icon: '📝', color: '#ef4444', category: 'text', params: { a: '"hello"', b: '" world"' } },
  'text-length':      { label: 'Length of', icon: '📝', color: '#ef4444', category: 'text', params: { text: '"hello"' } },
  'list-create':      { label: 'Create list', icon: '📋', color: '#ef4444', category: 'list', params: { name: 'myList' } },
  'list-add':         { label: 'Add to list', icon: '📋', color: '#ef4444', category: 'list', params: { list: 'myList', item: '"item"' } },
  'list-get':         { label: 'Get item #', icon: '📋', color: '#ef4444', category: 'list', params: { list: 'myList', index: '0' } },
  'sprite-move':      { label: 'Move', icon: '🎭', color: '#3b82f6', category: 'sprite', params: { steps: '10' } },
  'sprite-turn':      { label: 'Turn', icon: '🎭', color: '#3b82f6', category: 'sprite', params: { degrees: '90' } },
  'sprite-goto':      { label: 'Go to', icon: '🎭', color: '#3b82f6', category: 'sprite', params: { x: '0', y: '0' } },
  'sprite-say':       { label: 'Say', icon: '🎭', color: '#3b82f6', category: 'sprite', params: { text: '"Hi!"' } },
  'sound-play':       { label: 'Play sound', icon: '🔊', color: '#84cc16', category: 'sound', params: { sound: 'pop' } },
  'sound-volume':     { label: 'Set volume', icon: '🔊', color: '#84cc16', category: 'sound', params: { volume: '100' } },
  'ai-classify':      { label: 'AI classify', icon: '🤖', color: '#a855f7', category: 'ai', params: { input: '"text"' } },
  'ai-generate':      { label: 'AI generate text', icon: '🤖', color: '#a855f7', category: 'ai', params: { prompt: '"Write a poem"' } },
};

const SIDEBAR_TO_TYPE = {
  'create variable': 'var-create', 'set variable': 'var-set', 'change by': 'var-change', 'show variable': 'var-show',
  'if / else': 'logic-if', 'and / or / not': 'logic-and', 'compare (=, <, >)': 'logic-compare', 'true / false': 'logic-bool',
  'repeat n times': 'loop-repeat', 'while condition': 'loop-while', 'for each in list': 'loop-foreach', 'break / continue': 'loop-break',
  'define function': 'func-define', 'call function': 'func-call', 'return value': 'func-return', 'with parameters': 'func-params',
  'on start': 'event-start', 'on key press': 'event-keypress', 'on click': 'event-click', 'on message': 'event-message', 'broadcast': 'event-broadcast',
  'add / subtract': 'math-add', 'multiply / divide': 'math-mult', 'random number': 'math-random', 'round / abs': 'math-round', 'modulo': 'math-round',
  'create text': 'text-create', 'join text': 'text-join', 'length of': 'text-length', 'letter # of': 'text-length', 'contains': 'text-length',
  'create list': 'list-create', 'add to list': 'list-add', 'get item #': 'list-get', 'length of list': 'list-get', 'sort list': 'list-get',
  'print': 'action-print', 'ask and wait': 'action-ask', 'alert': 'action-alert', 'prompt': 'action-ask',
  'move steps': 'sprite-move', 'turn degrees': 'sprite-turn', 'go to x,y': 'sprite-goto', 'set size': 'sprite-move', 'show / hide': 'sprite-move', 'say text': 'sprite-say',
  'play sound': 'sound-play', 'stop sounds': 'sound-play', 'set volume': 'sound-volume', 'play note': 'sound-play',
  'ai classify': 'ai-classify', 'ai generate text': 'ai-generate', 'ai detect object': 'ai-classify', 'ai translate': 'ai-generate', 'train model': 'ai-classify',
};

function createBlockFromDrop(text, x, y) {
  const key = SIDEBAR_TO_TYPE[text.toLowerCase()] || null;
  const def = key ? BLOCK_DEFS[key] : null;
  if (def) {
    return { id: Date.now(), type: key, ...def, params: { ...def.params }, x, y, connected: [] };
  }
  return { id: Date.now(), type: 'custom', label: text, icon: '⚡', color: '#f59e0b', category: 'custom', x, y, connected: [], params: {} };
}

function ParamInput({ value, onChange, width, color }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={{
        background: 'rgba(0,0,0,0.3)',
        border: `1px solid ${color}88`,
        borderRadius: 4,
        padding: '1px 5px',
        color: '#fff',
        fontSize: 12,
        fontWeight: 700,
        fontFamily: 'var(--font-mono)',
        width: width || 60,
        outline: 'none',
        margin: '0 3px',
        verticalAlign: 'middle',
      }}
    />
  );
}

function BlockContent({ block, onParamChange }) {
  const p = block.params || {};
  const PI = (paramKey, w) => (
    <ParamInput
      value={p[paramKey] || ''}
      onChange={(v) => onParamChange(block.id, paramKey, v)}
      width={w}
      color={block.color}
    />
  );

  switch (block.type) {
    case 'var-create':  return <>{block.icon} Create{PI('name', 70)}={PI('value', 50)}</>;
    case 'var-set':     return <>{block.icon} Set{PI('name', 70)}={PI('value', 50)}</>;
    case 'var-change':  return <>{block.icon} Change{PI('name', 70)}by{PI('amount', 40)}</>;
    case 'var-show':    return <>{block.icon} Show{PI('name', 80)}</>;
    case 'logic-if':    return <>{block.icon} If{PI('condition', 120)}</>;
    case 'logic-and':   return <>{block.icon}{PI('left', 50)}{PI('op', 35)}{PI('right', 50)}</>;
    case 'logic-compare': return <>{block.icon}{PI('left', 50)}{PI('op', 30)}{PI('right', 50)}</>;
    case 'logic-bool':  return <>{block.icon}{PI('value', 50)}</>;
    case 'loop-repeat': return <>{block.icon} Repeat{PI('times', 40)}times</>;
    case 'loop-while':  return <>{block.icon} While{PI('condition', 120)}</>;
    case 'loop-foreach': return <>{block.icon} For{PI('item', 50)}in{PI('list', 60)}</>;
    case 'loop-break':  return <>{block.icon} Break</>;
    case 'func-define': return <>{block.icon} Define{PI('name', 80)}</>;
    case 'func-call':   return <>{block.icon} Call{PI('name', 80)}</>;
    case 'func-return': return <>{block.icon} Return{PI('value', 60)}</>;
    case 'func-params': return <>{block.icon} Params{PI('params', 100)}</>;
    case 'action-print': return <>{block.icon} Print{PI('message', 120)}</>;
    case 'action-ask':  return <>{block.icon} Ask{PI('prompt', 130)}</>;
    case 'action-alert': return <>{block.icon} Alert{PI('message', 120)}</>;
    case 'math-add':    return <>{block.icon}{PI('a', 40)}{PI('op', 25)}{PI('b', 40)}</>;
    case 'math-mult':   return <>{block.icon}{PI('a', 40)}{PI('op', 25)}{PI('b', 40)}</>;
    case 'math-random': return <>{block.icon} Random{PI('min', 35)}to{PI('max', 35)}</>;
    case 'math-round':  return <>{block.icon}{PI('op', 50)}{PI('value', 50)}</>;
    case 'text-create': return <>{block.icon} Text{PI('text', 100)}</>;
    case 'text-join':   return <>{block.icon} Join{PI('a', 60)}+{PI('b', 60)}</>;
    case 'text-length': return <>{block.icon} Length of{PI('text', 80)}</>;
    case 'list-create': return <>{block.icon} Create list{PI('name', 70)}</>;
    case 'list-add':    return <>{block.icon} Add{PI('item', 60)}to{PI('list', 60)}</>;
    case 'list-get':    return <>{block.icon} Get #{PI('index', 30)}from{PI('list', 60)}</>;
    case 'sprite-move': return <>{block.icon} Move{PI('steps', 40)}steps</>;
    case 'sprite-turn': return <>{block.icon} Turn{PI('degrees', 40)}°</>;
    case 'sprite-goto': return <>{block.icon} Go to x{PI('x', 35)}y{PI('y', 35)}</>;
    case 'sprite-say':  return <>{block.icon} Say{PI('text', 100)}</>;
    case 'sound-play':  return <>{block.icon} Play{PI('sound', 70)}</>;
    case 'sound-volume': return <>{block.icon} Volume{PI('volume', 40)}%</>;
    case 'ai-classify': return <>{block.icon} Classify{PI('input', 100)}</>;
    case 'ai-generate': return <>{block.icon} Generate{PI('prompt', 120)}</>;
    case 'event-start': return <>{block.icon} When program starts</>;
    case 'event-keypress': return <>{block.icon} On key{PI('key', 55)}press</>;
    case 'event-click': return <>{block.icon} On click</>;
    case 'event-message': return <>{block.icon} On message{PI('message', 60)}</>;
    case 'event-broadcast': return <>{block.icon} Broadcast{PI('message', 60)}</>;
    default:            return <>{block.icon} {block.label}</>;
  }
}

/* ─── Block Visual Editor ─── */
const PALETTE_CATS = [
  { id: 'event',    label: '⚡ Events',    color: '#f59e0b' },
  { id: 'variable', label: '📦 Variables', color: '#06b6d4' },
  { id: 'logic',    label: '🧠 Logic',     color: '#6366f1' },
  { id: 'loop',     label: '🔁 Loops',     color: '#8b5cf6' },
  { id: 'function', label: '⚙️ Functions', color: '#10b981' },
  { id: 'action',   label: '💬 Actions',   color: '#a855f7' },
  { id: 'math',     label: '🔢 Math',      color: '#ef4444' },
  { id: 'text',     label: '📝 Text',      color: '#ec4899' },
  { id: 'list',     label: '📋 Lists',     color: '#14b8a6' },
  { id: 'sprite',   label: '🎭 Sprite',    color: '#06b6d4' },
  { id: 'sound',    label: '🔊 Sound',     color: '#84cc16' },
  { id: 'ai',       label: '🤖 AI',        color: '#f97316' },
];

function BlockPalette({ onAdd }) {
  const [activeCat, setActiveCat] = useState('event');
  const cat = PALETTE_CATS.find(c => c.id === activeCat);
  const blocks = Object.entries(BLOCK_DEFS).filter(([, d]) => d.category === activeCat);
  return (
    <div style={{ width: 180, flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border-color)', background: 'var(--bg-secondary)', overflow: 'hidden' }}>
      {/* Category list */}
      <div style={{ overflowY: 'auto', borderBottom: '1px solid var(--border-color)', padding: '4px 4px' }}>
        {PALETTE_CATS.map(c => (
          <button key={c.id} onClick={() => setActiveCat(c.id)} style={{
            display: 'block', width: '100%', textAlign: 'left', padding: '5px 8px',
            borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600,
            background: activeCat === c.id ? `${c.color}25` : 'transparent',
            color: activeCat === c.id ? c.color : 'var(--text-muted)',
            borderLeft: activeCat === c.id ? `3px solid ${c.color}` : '3px solid transparent',
            marginBottom: 1,
          }}>{c.label}</button>
        ))}
      </div>
      {/* Blocks in selected category */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 6px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {blocks.map(([type, def]) => (
          <button key={type} onClick={() => onAdd(type)} style={{
            padding: '6px 8px', borderRadius: 8, border: `1.5px solid ${cat.color}50`,
            background: `${cat.color}18`, color: 'var(--text-primary)', cursor: 'pointer',
            textAlign: 'left', fontSize: 11, fontWeight: 600, lineHeight: 1.4,
          }}
          onMouseEnter={e => e.currentTarget.style.background = `${cat.color}35`}
          onMouseLeave={e => e.currentTarget.style.background = `${cat.color}18`}
          >{def.icon} {def.label}</button>
        ))}
      </div>
    </div>
  );
}

function BlockCanvas({ code, onCodeChange, onBlockLineMap, activeCodeLine, onNavigate }) {
  const canvasRef = useRef(null);
  const { user } = useUser();
  const defaultBlocks = [
    { id: 1, type: 'event-start', ...BLOCK_DEFS['event-start'], params: {}, x: 40, y: 30, connected: [2] },
    { id: 2, type: 'var-create', ...BLOCK_DEFS['var-create'], params: { name: 'score', value: '0' }, x: 40, y: 95, connected: [3] },
    { id: 3, type: 'loop-repeat', ...BLOCK_DEFS['loop-repeat'], params: { times: '10' }, x: 40, y: 160, connected: [4] },
    { id: 4, type: 'logic-if', ...BLOCK_DEFS['logic-if'], params: { condition: 'score > 5' }, x: 60, y: 225, connected: [5] },
    { id: 5, type: 'action-print', ...BLOCK_DEFS['action-print'], params: { message: '"You win!"' }, x: 80, y: 290, connected: [] },
    { id: 6, type: 'var-change', ...BLOCK_DEFS['var-change'], params: { name: 'score', amount: '1' }, x: 60, y: 355, connected: [] },
  ];
  const [blocks, setBlocks] = useState(() => {
    try { const s = localStorage.getItem('cv_workspace_blocks'); return s ? JSON.parse(s) : defaultBlocks; } catch { return defaultBlocks; }
  });
  const [dragging, setDragging] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hoveredBlock, setHoveredBlock] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);

  /* Generate code from blocks + build blockLineMap */
  useEffect(() => {
    if (!onCodeChange) return;
    const lines = [];
    const lineMap = {}; // blockId → lineNumber (1-based)

    for (const b of blocks) {
      const p = b.params || {};
      let line = '';
      switch (b.type) {
        case 'event-start': line = '# When program starts'; break;
        case 'event-keypress': line = `# On key "${p.key}" press`; break;
        case 'var-create': line = `${p.name} = ${p.value}`; break;
        case 'var-set': line = `${p.name} = ${p.value}`; break;
        case 'var-change': line = `${p.name} += ${p.amount}`; break;
        case 'var-show': line = `print(${p.name})`; break;
        case 'logic-if': line = `if ${p.condition}:`; break;
        case 'loop-repeat': line = `for i in range(${p.times}):`; break;
        case 'loop-while': line = `while ${p.condition}:`; break;
        case 'loop-foreach': line = `for ${p.item} in ${p.list}:`; break;
        case 'loop-break': line = '    break'; break;
        case 'func-define': line = `def ${p.name}():`; break;
        case 'func-call': line = `${p.name}()`; break;
        case 'func-return': line = `    return ${p.value}`; break;
        case 'action-print': line = `print(${p.message})`; break;
        case 'action-ask': line = `answer = input(${p.prompt})`; break;
        case 'action-alert': line = `print(${p.message})`; break;
        case 'math-random': line = `import random; random.randint(${p.min}, ${p.max})`; break;
        case 'text-create': line = `text = ${p.text}`; break;
        case 'text-join': line = `text = ${p.a} + ${p.b}`; break;
        case 'list-create': line = `${p.name} = []`; break;
        case 'list-add': line = `${p.list}.append(${p.item})`; break;
        case 'list-get': line = `${p.list}[${p.index}]`; break;
        default: if (b.label) line = `# ${b.label}`; break;
      }
      if (line) {
        lineMap[b.id] = lines.length + 1; // 1-based line number
        lines.push(line);
      }
    }
    onCodeChange(lines.join('\n') + '\n');
    if (onBlockLineMap) onBlockLineMap(lineMap);
  }, [blocks, onCodeChange, onBlockLineMap]);

  const handleParamChange = useCallback((blockId, paramKey, value) => {
    setBlocks(prev => prev.map(b =>
      b.id === blockId ? { ...b, params: { ...b.params, [paramKey]: value } } : b
    ));
  }, []);

  const addBlockFromPalette = useCallback((type) => {
    const def = BLOCK_DEFS[type];
    if (!def) return;
    const id = Date.now();
    const newBlock = { id, type, ...def, params: { ...def.params }, x: 40 + Math.random() * 60, y: 40 + (blocks.length * 65) % 400, connected: [] };
    setBlocks(prev => [...prev, newBlock]);
  }, [blocks.length]);

  const deleteBlock = useCallback((blockId) => {
    setBlocks(prev => {
      const filtered = prev.filter(b => b.id !== blockId);
      return filtered.map(b => ({
        ...b,
        connected: b.connected.filter(cid => cid !== blockId),
      }));
    });
    setSelectedBlock(null);
  }, []);

  const handleMouseDown = (e, block) => {
    if (e.target.tagName === 'INPUT') return;
    const rect = canvasRef.current.getBoundingClientRect();
    setDragging(block.id);
    setSelectedBlock(block.id);
    setDragOffset({
      x: e.clientX - rect.left - block.x,
      y: e.clientY - rect.top - block.y,
    });
  };

  const handleMouseMove = useCallback((e) => {
    if (!dragging || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, e.clientX - rect.left - dragOffset.x);
    const y = Math.max(0, e.clientY - rect.top - dragOffset.y);
    setBlocks(prev => prev.map(b => b.id === dragging ? { ...b, x, y } : b));
  }, [dragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    const text = e.dataTransfer.getData('text/plain');
    if (!text || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const newBlock = createBlockFromDrop(text, e.clientX - rect.left - 80, e.clientY - rect.top - 20);
    setBlocks(prev => [...prev, newBlock]);
  };

  // Keyboard navigation for blocks
  const handleBlockKeyDown = (e, block) => {
    const STEP = 8;
    if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      deleteBlock(block.id);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, x: Math.max(0, b.x - STEP) } : b));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, x: b.x + STEP } : b));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, y: Math.max(0, b.y - STEP) } : b));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, y: b.y + STEP } : b));
    } else if (e.key === 'Escape') {
      setSelectedBlock(null);
    }
  };

  // Find which block corresponds to activeCodeLine
  const syncedBlockId = activeCodeLine
    ? Object.entries(blocks.reduce((acc, b, idx) => { acc[b.id] = idx + 1; return acc; }, {}))
        .find(([, line]) => line === activeCodeLine)?.[0]
    : null;

  return (
    <div style={{ display: 'flex', flex: 1, minWidth: 0, minHeight: 0 }}>
      <BlockPalette onAdd={addBlockFromPalette} />
    <div
      ref={canvasRef}
      className="block-canvas"
      style={{
        flex: 1,
        position: 'relative',
        overflow: 'auto',
        background: 'var(--bg-primary)',
        backgroundImage: 'radial-gradient(circle, var(--border-color) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        cursor: dragging ? 'grabbing' : 'default',
        minHeight: 0,
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {/* Connection lines */}
      <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none', width: '100%', height: '100%' }}>
        {blocks.map(block =>
          block.connected.map(targetId => {
            const target = blocks.find(b => b.id === targetId);
            if (!target) return null;
            return (
              <line
                key={`${block.id}-${targetId}`}
                x1={block.x + 100} y1={block.y + 50}
                x2={target.x + 100} y2={target.y}
                stroke={block.color} strokeWidth="2" strokeDasharray="4" opacity="0.5"
              />
            );
          })
        )}
      </svg>

      {blocks.map(block => {
        const isSynced = syncedBlockId && String(block.id) === String(syncedBlockId);
        const isSelected = selectedBlock === block.id;
        return (
          <div
            key={block.id}
            className={`workspace-block${isSynced ? ' block-synced' : ''}`}
            tabIndex={0}
            role="button"
            aria-label={`${block.label || block.type} block`}
            onMouseDown={(e) => handleMouseDown(e, block)}
            onMouseEnter={() => setHoveredBlock(block.id)}
            onMouseLeave={() => setHoveredBlock(null)}
            onKeyDown={(e) => handleBlockKeyDown(e, block)}
            onFocus={() => setSelectedBlock(block.id)}
            style={{
              position: 'absolute',
              left: block.x,
              top: block.y,
              background: block.color + '22',
              border: `2px solid ${isSelected ? block.color : block.color}`,
              borderRadius: 10,
              padding: '8px 30px 8px 12px',
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--text-primary)',
              cursor: dragging === block.id ? 'grabbing' : 'grab',
              userSelect: 'none',
              minWidth: 160,
              boxShadow: isSelected
                ? `0 0 0 3px ${block.color}88, 0 4px 20px ${block.color}44`
                : dragging === block.id ? `0 4px 20px ${block.color}44` : 'none',
              transform: dragging === block.id ? 'scale(1.05)' : 'scale(1)',
              transition: dragging === block.id ? 'none' : 'transform 0.15s, box-shadow 0.15s',
              zIndex: dragging === block.id ? 100 : isSelected ? 50 : 1,
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              lineHeight: '26px',
              outline: 'none',
            }}
          >
            <BlockContent block={block} onParamChange={handleParamChange} />

            <button
              onMouseDown={(e) => { e.stopPropagation(); deleteBlock(block.id); }}
              style={{
                position: 'absolute', top: 3, right: 3,
                width: 20, height: 20, borderRadius: '50%', border: 'none',
                background: hoveredBlock === block.id ? '#ef4444' : 'transparent',
                color: hoveredBlock === block.id ? '#fff' : 'transparent',
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s', lineHeight: 1, padding: 0,
              }}
              title="Delete block"
            >×</button>

            <div style={{ position: 'absolute', bottom: -2, left: 12, fontSize: 9, color: 'var(--text-muted)' }}>
              {block.category}
            </div>
          </div>
        );
      })}

      {blocks.length === 0 && (
        <div className="empty-state" style={{ height: '100%' }}>
          <div className="empty-state-icon">🧩</div>
          <h3>Click a block to add it</h3>
          <p>Pick blocks from the palette on the left</p>
        </div>
      )}
    </div>
    </div>
  );
}

/* ─── JS Runner Template ─── */
const buildJsRunner = (code) => `<!DOCTYPE html><html><body><script>
const __out = [];
const __log = (t, a) => window.parent.postMessage({ type: t, text: a.map(v => typeof v === 'object' ? JSON.stringify(v) : String(v)).join(' ') }, '*');
console.log = (...a) => __log('output', a);
console.error = (...a) => __log('error', a);
console.warn = (...a) => __log('warn', a);
window.onerror = (msg) => { __log('error', [msg]); };
try {
${code}
} catch(e) { __log('error', [e.message]); }
window.parent.postMessage({ type: 'done' }, '*');
<\/script></body></html>`;

/* ─── Live Preview ─── */
function Preview({ code, language }) {
  const [output, setOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const { addXP, incrementQuestProgress } = useUser();
  const iframeRef = useRef(null);
  const listenerRef = useRef(null);

  // Cleanup message listener
  useEffect(() => {
    return () => {
      if (listenerRef.current) window.removeEventListener('message', listenerRef.current);
    };
  }, []);

  const runCode = () => {
    setIsRunning(true);
    setOutput([{ type: 'info', text: `▶ Running ${language}...` }]);

    if (language === 'html') {
      setOutput([{ type: 'info', text: '🌐 Rendering HTML preview...' }]);
      setIsRunning(false);
      return;
    }

    if (language === 'python') {
      // Real Python subset interpreter
      setTimeout(() => {
        try {
          const { output: pyOut, errors } = runPython(code);
          const lines = pyOut.map(t => ({ type: 'output', text: t }));
          if (errors.length) lines.push(...errors.map(t => ({ type: 'error', text: t })));
          if (lines.length === 0) lines.push({ type: 'info', text: '✅ Program ran (no output)' });
          lines.push({ type: 'success', text: `✨ Done` });
          setOutput(lines);
          addXP(10);
          incrementQuestProgress('q-run');
        } catch (err) {
          setOutput([{ type: 'error', text: `Runtime error: ${err.message}` }]);
        }
        setIsRunning(false);
      }, 50);
      return;
    }

    if (language === 'javascript') {
      // Real JS execution via sandboxed iframe + postMessage
      if (listenerRef.current) window.removeEventListener('message', listenerRef.current);
      const newOutput = [];

      const handler = (e) => {
        if (!e.data || typeof e.data !== 'object') return;
        if (e.data.type === 'done') {
          window.removeEventListener('message', handler);
          listenerRef.current = null;
          if (newOutput.filter(l => l.type !== 'info').length === 0) {
            newOutput.push({ type: 'info', text: '✅ Program ran (no output)' });
          }
          newOutput.push({ type: 'success', text: '✨ Done' });
          setOutput([...newOutput]);
          setIsRunning(false);
          addXP(10);
          incrementQuestProgress('q-run');
        } else if (['output', 'error', 'warn'].includes(e.data.type)) {
          newOutput.push({ type: e.data.type, text: e.data.text });
          setOutput([...newOutput]);
        }
      };

      listenerRef.current = handler;
      window.addEventListener('message', handler);

      if (iframeRef.current) {
        iframeRef.current.srcdoc = buildJsRunner(code);
      }

      // Timeout safety
      setTimeout(() => {
        if (isRunning) {
          window.removeEventListener('message', handler);
          listenerRef.current = null;
          setOutput(prev => [...prev, { type: 'warn', text: '⚠️ Execution timed out (5s)' }]);
          setIsRunning(false);
        }
      }, 5000);
    }
  };

  const isHtml = language === 'html' && code;

  return (
    <div className="panel" style={{ flex: 1, minWidth: 280 }}>
      <div className="panel-header">
        <span>▶ Output / Preview</span>
        <div style={{ marginLeft: 'auto' }}>
          <button className="btn btn-success btn-sm" onClick={runCode} disabled={isRunning}>
            {isRunning ? '⏳ Running...' : '▶ Run'}
          </button>
        </div>
      </div>
      <div className="panel-body" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 4, background: 'var(--bg-primary)', position: 'relative' }}>
        {/* Hidden JS runner iframe */}
        <iframe
          ref={iframeRef}
          title="js-runner"
          sandbox="allow-scripts"
          style={{ display: isHtml ? 'block' : 'none', width: '100%', flex: 1, border: 'none', background: 'white', borderRadius: 4, minHeight: 200 }}
        />

        {/* HTML preview using srcDoc */}
        {isHtml && (
          <iframe
            key={code}
            srcDoc={code}
            title="html-preview"
            sandbox="allow-scripts"
            style={{ width: '100%', flex: 1, border: 'none', background: 'white', borderRadius: 4, minHeight: 200 }}
          />
        )}

        {!isHtml && (
          <>
            {output.length === 0 && !isRunning && (
              <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: 20, textAlign: 'center' }}>
                Click <strong>Run</strong> to execute your code
              </div>
            )}
            {output.map((line, i) => (
              <div
                key={i}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 13,
                  color: line.type === 'output' ? 'var(--text-primary)' :
                         line.type === 'error' ? 'var(--accent-danger)' :
                         line.type === 'success' ? 'var(--accent-success)' :
                         line.type === 'warn' ? '#f59e0b' :
                         'var(--text-muted)',
                  padding: '2px 0',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {line.text}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Main Workspace Editor ─── */
export default function WorkspaceEditor() {
  const { activeProject, viewMode, setViewMode, updateProject } = useProject();
  const { user, addXP } = useUser();
  const [showAI, setShowAI] = useState(true);
  const [savedFlash, setSavedFlash] = useState(false);
  const [language, setLanguage] = useState(activeProject?.language || 'python');

  const saveBlocks = useCallback(() => {
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1800);
  }, []);

  useEffect(() => {
    const handler = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveBlocks(); } };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [saveBlocks]);
  const [blockLineMap, setBlockLineMap] = useState({});
  const [activeCodeLine, setActiveCodeLine] = useState(null);
  const [hoveredBlockId, setHoveredBlockId] = useState(null);
  const code = activeProject?.code || '';

  // Derive which code line the hovered block maps to
  const hoveredBlockLine = hoveredBlockId ? blockLineMap[hoveredBlockId] : null;

  useEffect(() => {
    if (activeProject) setLanguage(activeProject.language);
  }, [activeProject]);

  const handleCodeChange = useCallback((newCode) => {
    if (activeProject) updateProject(activeProject.id, { code: newCode });
  }, [activeProject, updateProject]);

  const handleBlockLineMap = useCallback((map) => {
    setBlockLineMap(map);
  }, []);

  if (!activeProject) {
    return (
      <div className="empty-state" style={{ height: '100%' }}>
        <div className="empty-state-icon">💻</div>
        <h3>No project selected</h3>
        <p>Select a project from the sidebar or create a new one</p>
      </div>
    );
  }

  return (
    <div className="workspace-page">
      <div className="workspace-toolbar">
        <div className="tab-nav">
          <button className={`tab-nav-item ${viewMode === 'blocks' ? 'active' : ''}`} onClick={() => setViewMode('blocks')}>
            🧩 Blocks
          </button>
          <button className={`tab-nav-item ${viewMode === 'code' ? 'active' : ''}`} onClick={() => setViewMode('code')}>
            📝 Code
          </button>
          <button className={`tab-nav-item ${viewMode === 'split' ? 'active' : ''}`} onClick={() => setViewMode('split')}>
            ⚡ Split View
          </button>
        </div>

        <div style={{ marginLeft: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <select
            className="select"
            value={language}
            onChange={(e) => {
              setLanguage(e.target.value);
              updateProject(activeProject.id, { language: e.target.value });
            }}
            style={{ fontSize: 12, padding: '4px 28px 4px 8px' }}
          >
            <option value="python">🐍 Python</option>
            <option value="javascript">⚡ JavaScript</option>
            <option value="html">🌐 HTML/CSS</option>
          </select>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <button
            className="btn btn-sm"
            onClick={saveBlocks}
            style={{ background: savedFlash ? '#22c55e' : '#334155', color: '#fff', transition: 'background 0.3s', minWidth: 80 }}
          >
            {savedFlash ? '✓ Saved!' : '💾 Save'}
          </button>
          <button
            className={`btn btn-ghost btn-sm ${showAI ? '' : 'opacity-50'}`}
            onClick={() => setShowAI(!showAI)}
          >
            🤖 AI Assistant
          </button>
          <span className="tag tag-primary" style={{ alignSelf: 'center' }}>
            {activeProject.name}
          </span>
        </div>
      </div>

      <div className="panel-container">
        {/* Starter Mode (ages 5-7) overrides normal blocks view */}
        {user.ageMode === 'starter' ? (
          <StarterBlocks />
        ) : (
        <>
        {/* Blocks View */}
        {(viewMode === 'blocks' || viewMode === 'split') && (
          <BlockCanvas
            code={code}
            onCodeChange={handleCodeChange}
            onBlockLineMap={handleBlockLineMap}
            activeCodeLine={activeCodeLine}
          />
        )}

        {viewMode === 'split' && <div className="panel-resizer" />}

        {/* Code View */}
        {(viewMode === 'code' || viewMode === 'split') && (
          <div className="panel" style={{ flex: 1, minWidth: 300 }}>
            <div className="panel-header">
              <span style={{ fontSize: 12 }}>📝 {language === 'python' ? 'Python' : language === 'javascript' ? 'JavaScript' : 'HTML/CSS'}</span>
              <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-muted)' }}>
                {code.split('\n').length} lines
              </span>
            </div>
            <div className="panel-body" style={{ display: 'flex', flexDirection: 'column' }}>
              <CodeEditor
                code={code}
                language={language}
                onChange={handleCodeChange}
                onCursorLine={setActiveCodeLine}
                highlightLine={hoveredBlockLine}
              />
            </div>
          </div>
        )}

        <div className="panel-resizer" />

        {/* Preview */}
        <Preview code={code} language={language} />

        {/* AI Assistant */}
        {showAI && (
          <>
            <div className="panel-resizer" />
            <AIAssistant code={code} language={language} />
          </>
        )}
        </>
        )}
      </div>
    </div>
  );
}
