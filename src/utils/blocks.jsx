import React from 'react';

/* ─── Block type definitions ─── */
export const BLOCK_DEFS = {
  'event-start':      { label: 'When ▶ clicked', icon: '🚩', color: '#f59e0b', category: 'event', params: {} },
  'event-keypress':   { label: 'On key press', icon: '🎯', color: '#f59e0b', category: 'event', params: { key: 'space' } },
  'event-click':      { label: 'On click', icon: '🖱️', color: '#f59e0b', category: 'event', params: {} },
  'event-collision':  { label: 'On collision', icon: '💥', color: '#f59e0b', category: 'event', params: { with: 'any' } },
  'event-message':    { label: 'On message', icon: '🎯', color: '#f59e0b', category: 'event', params: { message: 'go' } },
  'event-broadcast':  { label: 'Broadcast', icon: '🎯', color: '#f59e0b', category: 'event', params: { message: 'go' } },
  'var-create':       { label: 'Create variable', icon: '📦', color: '#f59e0b', category: 'variable', params: { name: 'myVar', value: '0' } },
  'var-set':          { label: 'Set', icon: '📦', color: '#f59e0b', category: 'variable', params: { name: 'myVar', value: '0' } },
  'var-change':       { label: 'Change', icon: '📦', color: '#f59e0b', category: 'variable', params: { name: 'myVar', amount: '1' } },
  'var-show':         { label: 'Show variable', icon: '📦', color: '#f59e0b', category: 'variable', params: { name: 'myVar' } },
  'logic-if':         { label: 'If', icon: '🧠', color: '#f59e0b', category: 'logic', params: { condition: 'x > 5' } },
  'logic-and':        { label: 'And / Or', icon: '🧠', color: '#f59e0b', category: 'logic', params: { left: 'a', op: 'and', right: 'b' } },
  'logic-compare':    { label: 'Compare', icon: '🧠', color: '#f59e0b', category: 'logic', params: { left: 'a', op: '=', right: 'b' } },
  'logic-bool':       { label: 'Boolean', icon: '🧠', color: '#f59e0b', category: 'logic', params: { value: 'true' } },
  'loop-repeat':      { label: 'Repeat', icon: '🔁', color: '#f59e0b', category: 'loop', params: { times: '10' } },
  'loop-forever':     { label: 'Forever', icon: '🔁', color: '#f59e0b', category: 'loop', params: {} },
  'loop-while':       { label: 'While', icon: '🔁', color: '#f59e0b', category: 'loop', params: { condition: 'true' } },
  'loop-foreach':     { label: 'For each', icon: '🔁', color: '#f59e0b', category: 'loop', params: { item: 'item', list: 'myList' } },
  'loop-break':       { label: 'Break', icon: '🔁', color: '#f59e0b', category: 'loop', params: {} },
  'func-define':      { label: 'Define function', icon: '⚡', color: '#f59e0b', category: 'function', params: { name: 'myFunc' } },
  'func-call':        { label: 'Call', icon: '⚡', color: '#f59e0b', category: 'function', params: { name: 'myFunc' } },
  'func-return':      { label: 'Return', icon: '⚡', color: '#f59e0b', category: 'function', params: { value: '0' } },
  'func-params':      { label: 'With parameters', icon: '⚡', color: '#f59e0b', category: 'function', params: { params: 'a, b' } },
  'action-print':     { label: 'Print', icon: '💬', color: '#f59e0b', category: 'action', params: { message: '"Hello!"' } },
  'action-ask':       { label: 'Ask and wait', icon: '💬', color: '#f59e0b', category: 'action', params: { prompt: '"What is your name?"' } },
  'action-alert':     { label: 'Alert', icon: '💬', color: '#f59e0b', category: 'action', params: { message: '"Notice"' } },
  'math-add':         { label: 'Add / Subtract', icon: '🔢', color: '#f59e0b', category: 'math', params: { a: '1', op: '+', b: '1' } },
  'math-mult':        { label: 'Multiply / Divide', icon: '🔢', color: '#f59e0b', category: 'math', params: { a: '2', op: '×', b: '3' } },
  'math-random':      { label: 'Random number', icon: '🔢', color: '#f59e0b', category: 'math', params: { min: '1', max: '100' } },
  'math-round':       { label: 'Round / Abs', icon: '🔢', color: '#f59e0b', category: 'math', params: { op: 'round', value: '3.7' } },
  'text-create':      { label: 'Create text', icon: '📝', color: '#f59e0b', category: 'text', params: { text: '"hello"' } },
  'text-join':        { label: 'Join text', icon: '📝', color: '#f59e0b', category: 'text', params: { a: '"hello"', b: '" world"' } },
  'text-length':      { label: 'Length of', icon: '📝', color: '#f59e0b', category: 'text', params: { text: '"hello"' } },
  'list-create':      { label: 'Create list', icon: '📋', color: '#f59e0b', category: 'list', params: { name: 'myList' } },
  'list-add':         { label: 'Add to list', icon: '📋', color: '#f59e0b', category: 'list', params: { list: 'myList', item: '"item"' } },
  'list-get':         { label: 'Get item #', icon: '📋', color: '#f59e0b', category: 'list', params: { list: 'myList', index: '0' } },
  'sprite-move':      { label: 'Move', icon: '🎭', color: '#f59e0b', category: 'sprite', params: { steps: '10' } },
  'sprite-turn':      { label: 'Turn', icon: '🎭', color: '#f59e0b', category: 'sprite', params: { degrees: '90' } },
  'sprite-goto':      { label: 'Go to', icon: '🎭', color: '#f59e0b', category: 'sprite', params: { x: '0', y: '0' } },
  'sprite-changex':   { label: 'Change X by', icon: '🎭', color: '#f59e0b', category: 'sprite', params: { amount: '10' } },
  'sprite-changey':   { label: 'Change Y by', icon: '🎭', color: '#f59e0b', category: 'sprite', params: { amount: '10' } },
  'sprite-setsize':   { label: 'Set size to', icon: '🎭', color: '#f59e0b', category: 'sprite', params: { size: '100' } },
  'sprite-show':      { label: 'Show', icon: '🎭', color: '#f59e0b', category: 'sprite', params: {} },
  'sprite-hide':      { label: 'Hide', icon: '🎭', color: '#f59e0b', category: 'sprite', params: {} },
  'sprite-say':       { label: 'Say', icon: '🎭', color: '#f59e0b', category: 'sprite', params: { text: '"Hi!"', secs: '2' } },
  'control-wait':     { label: 'Wait', icon: '⏱', color: '#f59e0b', category: 'control', params: { secs: '1' } },
  'control-stop':     { label: 'Stop all', icon: '⏹', color: '#f59e0b', category: 'control', params: {} },
  'sound-play':       { label: 'Play sound', icon: '🔊', color: '#f59e0b', category: 'sound', params: { sound: 'pop' } },
  'sound-stop':       { label: 'Stop sounds', icon: '🔇', color: '#f59e0b', category: 'sound', params: {} },
  'sound-volume':     { label: 'Set volume', icon: '🔊', color: '#f59e0b', category: 'sound', params: { volume: '100' } },
  'ai-classify':      { label: 'AI classify', icon: '🤖', color: '#f59e0b', category: 'ai', params: { input: '"text"' } },
  'ai-generate':      { label: 'AI generate text', icon: '🤖', color: '#f59e0b', category: 'ai', params: { prompt: '"Write a poem"' } },
  // Sensing
  'sense-touching':     { label: 'Touching edge?', icon: '🔍', color: '#f59e0b', category: 'sensing', params: {} },
  'sense-touching-sprite': { label: 'Touching sprite?', icon: '🔍', color: '#f59e0b', category: 'sensing', params: { sprite: 'any' } },
  'sense-key':          { label: 'Key pressed?', icon: '⌨️', color: '#f59e0b', category: 'sensing', params: { key: 'space' } },
  'sense-mouse-x':      { label: 'Mouse X', icon: '🖱️', color: '#f59e0b', category: 'sensing', params: {} },
  'sense-mouse-y':      { label: 'Mouse Y', icon: '🖱️', color: '#f59e0b', category: 'sensing', params: {} },
  'sense-distance':     { label: 'Distance to mouse', icon: '📏', color: '#f59e0b', category: 'sensing', params: {} },
  'sense-timer':        { label: 'Timer', icon: '⏱️', color: '#f59e0b', category: 'sensing', params: {} },
  'sense-reset-timer':  { label: 'Reset timer', icon: '⏱️', color: '#f59e0b', category: 'sensing', params: {} },
  // Looks
  'looks-say':          { label: 'Say', icon: '💬', color: '#f59e0b', category: 'looks', params: { text: 'Hello!', secs: '2' } },
  'looks-think':        { label: 'Think', icon: '💭', color: '#f59e0b', category: 'looks', params: { text: 'Hmm...', secs: '2' } },
  'looks-costume':      { label: 'Switch costume to', icon: '👗', color: '#f59e0b', category: 'looks', params: { costume: '1' } },
  'looks-next-costume': { label: 'Next costume', icon: '👗', color: '#f59e0b', category: 'looks', params: {} },
  'looks-color-effect': { label: 'Set color effect', icon: '🎨', color: '#f59e0b', category: 'looks', params: { value: '0' } },
  'looks-ghost-effect': { label: 'Set ghost effect', icon: '👻', color: '#f59e0b', category: 'looks', params: { value: '0' } },
  'looks-clear-effects':{ label: 'Clear all effects', icon: '✨', color: '#f59e0b', category: 'looks', params: {} },
  'looks-grow':         { label: 'Grow by', icon: '🔼', color: '#f59e0b', category: 'looks', params: { amount: '10' } },
  'looks-shrink':       { label: 'Shrink by', icon: '🔽', color: '#f59e0b', category: 'looks', params: { amount: '10' } },
  'looks-front':        { label: 'Go to front layer', icon: '🎨', color: '#f59e0b', category: 'looks', params: {} },
  'looks-back':         { label: 'Go to back layer', icon: '🎨', color: '#f59e0b', category: 'looks', params: {} },
  // Physics
  'physics-velocity':   { label: 'Set velocity', icon: '💨', color: '#f59e0b', category: 'physics', params: { vx: '5', vy: '0' } },
  'physics-gravity':    { label: 'Set gravity', icon: '⬇️', color: '#f59e0b', category: 'physics', params: { amount: '0.5' } },
  'physics-bounce':     { label: 'Bounce off edges', icon: '↩️', color: '#f59e0b', category: 'physics', params: {} },
  'physics-friction':   { label: 'Set friction', icon: '🔄', color: '#f59e0b', category: 'physics', params: { amount: '0.9' } },
  'physics-jump':       { label: 'Jump with power', icon: '⬆️', color: '#f59e0b', category: 'physics', params: { power: '10' } },
  'physics-push':       { label: 'Push in direction', icon: '➡️', color: '#f59e0b', category: 'physics', params: { direction: '0', force: '5' } },
  // Game
  'game-score-add':     { label: 'Add to score', icon: '🏆', color: '#f59e0b', category: 'game', params: { amount: '10' } },
  'game-score-set':     { label: 'Set score to', icon: '🏆', color: '#f59e0b', category: 'game', params: { value: '0' } },
  'game-lose-life':     { label: 'Lose a life', icon: '❤️', color: '#f59e0b', category: 'game', params: {} },
  'game-set-lives':     { label: 'Set lives to', icon: '❤️', color: '#f59e0b', category: 'game', params: { value: '3' } },
  'game-over':          { label: 'Game Over', icon: '💀', color: '#f59e0b', category: 'game', params: {} },
  'game-win':           { label: 'You Win!', icon: '🎉', color: '#f59e0b', category: 'game', params: {} },
  'game-next-level':    { label: 'Next Level', icon: '⬆️', color: '#f59e0b', category: 'game', params: {} },
  'game-spawn':         { label: 'Spawn clone of', icon: '✨', color: '#f59e0b', category: 'game', params: { sprite: 'this' } },
  'game-destroy':       { label: 'Destroy this', icon: '💥', color: '#f59e0b', category: 'game', params: {} },
  'game-pause':         { label: 'Pause game', icon: '⏸️', color: '#f59e0b', category: 'game', params: {} },
  // Motion extras
  'motion-glide':       { label: 'Glide to', icon: '🕊️', color: '#f59e0b', category: 'motion', params: { x: '0', y: '0', secs: '1' } },
  'motion-point':       { label: 'Point toward mouse', icon: '🎯', color: '#f59e0b', category: 'motion', params: {} },
  'motion-point-dir':   { label: 'Point in direction', icon: '🎯', color: '#f59e0b', category: 'motion', params: { direction: '90' } },
  'motion-setx':        { label: 'Set X to', icon: '🎭', color: '#f59e0b', category: 'motion', params: { x: '0' } },
  'motion-sety':        { label: 'Set Y to', icon: '🎭', color: '#f59e0b', category: 'motion', params: { y: '0' } },
  'motion-speed':       { label: 'Set speed to', icon: '⚡', color: '#f59e0b', category: 'motion', params: { speed: '5' } },
  // My Blocks
  'myblock-define':     { label: 'Define my block', icon: '🧩', color: '#f59e0b', category: 'myblocks', params: { name: 'my block' } },
  'myblock-run':        { label: 'Run my block', icon: '🧩', color: '#f59e0b', category: 'myblocks', params: { name: 'my block' } },
  'tts-speak':          { label: 'TTS Speak', icon: '🔊', color: '#f59e0b', category: 'ai', params: { voice: 'auto', text: 'Hello from ByteBuddies' } },
};

/* Map sidebar block names to block type keys */
export const SIDEBAR_TO_TYPE = {
  'create variable': 'var-create', 'set variable': 'var-set', 'change by': 'var-change', 'show variable': 'var-show',
  'wait': 'control-wait',
  'if / else': 'logic-if', 'and / or / not': 'logic-and', 'compare (=, <, >)': 'logic-compare', 'true / false': 'logic-bool',
  'repeat n times': 'loop-repeat', 'forever': 'loop-forever', 'while condition': 'loop-while', 'for each in list': 'loop-foreach', 'break / continue': 'loop-break',
  'define function': 'func-define', 'call function': 'func-call', 'return value': 'func-return', 'with parameters': 'func-params',
  'on start': 'event-start', 'on key press': 'event-keypress', 'on click': 'event-click', 'on collision': 'event-collision', 'on message': 'event-message', 'broadcast': 'event-broadcast',
  'add / subtract': 'math-add', 'multiply / divide': 'math-mult', 'random number': 'math-random', 'round / abs': 'math-round', 'modulo': 'math-round',
  'create text': 'text-create', 'join text': 'text-join', 'length of': 'text-length', 'letter # of': 'text-length', 'contains': 'text-length',
  'create list': 'list-create', 'add to list': 'list-add', 'get item #': 'list-get', 'length of list': 'list-get', 'sort list': 'list-get',
  'print': 'action-print', 'ask and wait': 'action-ask', 'alert': 'action-alert', 'prompt': 'action-ask',
  'move steps': 'sprite-move', 'turn degrees': 'sprite-turn', 'go to x,y': 'sprite-goto',
  'change x by': 'sprite-changex', 'change y by': 'sprite-changey',
  'set size': 'sprite-setsize', 'show / hide': 'sprite-show', 'say text': 'sprite-say',
  'play sound': 'sound-play', 'stop sounds': 'sound-stop', 'set volume': 'sound-volume', 'play note': 'sound-play',
  'ai classify': 'ai-classify', 'ai generate text': 'ai-generate', 'ai detect object': 'ai-classify', 'ai translate': 'ai-generate', 'train model': 'ai-classify',
  'touching edge?': 'sense-touching', 'touching sprite?': 'sense-touching-sprite',
  'key pressed?': 'sense-key', 'mouse x': 'sense-mouse-x', 'mouse y': 'sense-mouse-y',
  'distance to mouse': 'sense-distance', 'timer': 'sense-timer', 'reset timer': 'sense-reset-timer',
  'say': 'sprite-say', 'think': 'looks-think', 'switch costume': 'looks-costume',
  'next costume': 'looks-next-costume', 'color effect': 'looks-color-effect',
  'ghost effect': 'looks-ghost-effect', 'clear effects': 'looks-clear-effects',
  'grow by': 'looks-grow', 'shrink by': 'looks-shrink',
  'go to front': 'looks-front', 'go to back': 'looks-back',
  'set velocity': 'physics-velocity', 'set gravity': 'physics-gravity',
  'bounce off edges': 'physics-bounce', 'set friction': 'physics-friction',
  'jump': 'physics-jump', 'push': 'physics-push',
  'add to score': 'game-score-add', 'set score': 'game-score-set',
  'lose a life': 'game-lose-life', 'set lives': 'game-set-lives',
  'game over': 'game-over', 'you win': 'game-win', 'next level': 'game-next-level',
  'spawn clone': 'game-spawn', 'destroy': 'game-destroy', 'pause game': 'game-pause',
  'glide to': 'motion-glide', 'point toward mouse': 'motion-point',
  'point in direction': 'motion-point-dir', 'set x to': 'motion-setx',
  'set y to': 'motion-sety', 'set speed': 'motion-speed',
  'define my block': 'myblock-define', 'run my block': 'myblock-run',
  '[tts] speak': 'tts-speak',
};

/** e.g. event-start → bb_event_start (Blockly block type id). */
export function shortTypeToBlocklyType(short) {
  if (!short || typeof short !== 'string') return null;
  return `bb_${short.replace(/-/g, '_')}`;
}

/** Library flyout nodes (bb_sidebar_item / bb_lib_*) carry BLOCK_NAME; map to real bb_* when possible. */
export function resolveBlocklyNodeType(node) {
  if (!node?.type) return null;
  const t = node.type;
  if (t !== 'bb_sidebar_item' && !(typeof t === 'string' && t.startsWith('bb_lib_'))) return t;
  const label = String(node.fields?.BLOCK_NAME || '').trim().toLowerCase();
  const short = SIDEBAR_TO_TYPE[label];
  return short ? shortTypeToBlocklyType(short) : null;
}

export function createBlockFromDrop(text, x, y) {
  const key = SIDEBAR_TO_TYPE[text.toLowerCase()] || null;
  const def = key ? BLOCK_DEFS[key] : null;
  if (def) {
    return { id: Date.now() + Math.random(), type: key, ...def, params: { ...def.params }, x, y };
  }
  return { id: Date.now() + Math.random(), type: 'custom', label: text, icon: '⚡', color: '#f59e0b', category: 'custom', x, y, params: {} };
}

/* ─── SVG chrome for embedded inputs (pill / hex), Blockly-style ─── */
function pathInputPill(pw, ph) {
  const r = Math.min(ph / 2, 9);
  return `M ${r},0 H ${pw - r} A ${r},${r} 0 0 1 ${pw},${r} V ${ph - r} A ${r},${r} 0 0 1 ${pw - r},${ph} H ${r} A ${r},${r} 0 0 1 0,${ph - r} V ${r} A ${r},${r} 0 0 1 ${r},0 Z`;
}
function pathInputHex(pw, ph) {
  const inset = ph * 0.28;
  return `M ${inset},0 L ${pw - inset},0 L ${pw},${ph / 2} L ${pw - inset},${ph} L ${inset},${ph} L 0,${ph / 2} Z`;
}

/* ─── Inline editable param field ─── */
export function ParamInput({ value, onChange, width, color, fieldShape = 'pill' }) {
  const iw = Math.max(24, Number(width) || 50);
  const ph = 22;
  const pw = iw + 12;
  const d = fieldShape === 'hex' ? pathInputHex(pw, ph) : pathInputPill(pw, ph);
  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-flex',
        verticalAlign: 'middle',
        width: pw,
        height: ph,
        margin: '0 2px',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width={pw} height={ph} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }} aria-hidden>
        <path d={d} fill="#ffffff" fillOpacity="0.96" stroke="rgba(0,0,0,0.14)" strokeWidth="1" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          zIndex: 1,
          background: 'transparent',
          border: 'none',
          padding: '2px 6px',
          color: '#575E75',
          fontSize: '12px',
          fontWeight: '600',
          fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
          width: iw,
          outline: 'none',
          textAlign: 'center',
          minHeight: '18px',
        }}
      />
    </span>
  );
}

export function ParamSelect({ value, onChange, options, width, fieldShape = 'pill' }) {
  const iw = Math.max(36, Number(width) || 64);
  const ph = 22;
  const pw = iw + 12;
  const d = fieldShape === 'hex' ? pathInputHex(pw, ph) : pathInputPill(pw, ph);
  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-flex',
        verticalAlign: 'middle',
        width: pw,
        height: ph,
        margin: '0 2px',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width={pw} height={ph} style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none' }} aria-hidden>
        <path d={d} fill="#ffffff" fillOpacity="0.96" stroke="rgba(0,0,0,0.14)" strokeWidth="1" />
      </svg>
      <select
        value={String(value ?? options?.[0] ?? '')}
        onChange={(e) => onChange(e.target.value)}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          zIndex: 1,
          background: 'transparent',
          border: 'none',
          padding: '2px 6px',
          color: '#575E75',
          fontSize: '12px',
          fontWeight: '600',
          fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
          width: iw,
          outline: 'none',
          textAlign: 'center',
          minHeight: '18px',
          appearance: 'none',
          cursor: 'pointer',
        }}
      >
        {(options || []).map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </span>
  );
}

/* ─── Render block content with inline inputs ─── */
export function BlockContent({ block, onParamChange, context = {} }) {
  const p = block.params || {};
  const keyOptions = ['space', 'up', 'down', 'left', 'right', 'a', 'b'];
  const messageOptions = context.messageNames?.length ? context.messageNames : ['go', 'message1', 'start'];
  const variableOptions = context.variableNames?.length ? context.variableNames : ['myVar', 'score'];
  const PI = (paramKey, w) => (
    (paramKey === 'key' || paramKey === 'message' || paramKey === 'name' || paramKey === 'list')
      ? (
        <ParamSelect
          value={p[paramKey] || ''}
          onChange={(v) => onParamChange(block.id, paramKey, v)}
          width={w}
          options={
            paramKey === 'key'
              ? keyOptions
              : (paramKey === 'message'
                ? messageOptions
                : variableOptions)
          }
        />
      )
      : (
        <ParamInput
          value={p[paramKey] || ''}
          onChange={(v) => onParamChange(block.id, paramKey, v)}
          width={w}
          color={block.color}
        />
      )
  );

  switch (block.type) {
    case 'var-create':  return <>{block.icon} Create{PI('name', 70)}={PI('value', 50)}</>;
    case 'var-set':     return <>{block.icon} Set{PI('name', 70)}={PI('value', 50)}</>;
    case 'var-change':  return <>{block.icon} Change{PI('name', 70)}by{PI('amount', 40)}</>;
    case 'var-show':    return <>{block.icon} Show{PI('name', 80)}</>;
    case 'logic-if':    return <>{block.icon} If{PI('condition', 120)}</>;
    case 'logic-and':   return <>{block.icon}{PI('left', 50)}{PI('op', 35)}{PI('right', 50)}</>;
    case 'logic-compare': return <>{block.icon}{PI('left', 50)}{PI('op', 30)}{PI('right', 50)}</>;
    case 'logic-bool': return (
      <>
        {block.icon}
        <ParamSelect
          value={p.value || 'true'}
          onChange={(v) => onParamChange(block.id, 'value', v)}
          width={56}
          fieldShape="hex"
          options={['true', 'false']}
        />
      </>
    );
    case 'loop-repeat': return <>{block.icon} Repeat{PI('times', 40)}times</>;
    case 'loop-forever': return <>{block.icon} Forever</>;
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
    case 'sprite-changex': return <>{block.icon} Change X by{PI('amount', 40)}</>;
    case 'sprite-changey': return <>{block.icon} Change Y by{PI('amount', 40)}</>;
    case 'sprite-setsize': return <>{block.icon} Set size to{PI('size', 40)}%</>;
    case 'sprite-show': return <>{block.icon} Show</>;
    case 'sprite-hide': return <>{block.icon} Hide</>;
    case 'sprite-say':  return <>{block.icon} Say{PI('text', 80)}for{PI('secs', 25)}s</>;
    case 'control-wait': return <><span>⏱</span> Wait{PI('secs', 35)}seconds</>;
    case 'control-stop': return <><span>⏹</span> Stop all</>;
    case 'sound-play':  return <>{block.icon} Play{PI('sound', 70)}</>;
    case 'sound-stop': return <>{block.icon} Stop sounds</>;
    case 'sound-volume': return <>{block.icon} Volume{PI('volume', 40)}%</>;
    case 'ai-classify': return <>{block.icon} Classify{PI('input', 100)}</>;
    case 'ai-generate': return <>{block.icon} Generate{PI('prompt', 120)}</>;
    case 'event-start': return <>{block.icon} When ▶ clicked</>;
    case 'event-keypress': return <>{block.icon} On key{PI('key', 55)}press</>;
    case 'event-click': return <>{block.icon} On this sprite clicked</>;
    case 'event-collision': return <>{block.icon} On collision with {PI('with', 70)}</>;
    case 'event-message': return <>{block.icon} On message{PI('message', 60)}</>;
    case 'event-broadcast': return <>{block.icon} Broadcast{PI('message', 60)}</>;
    case 'sense-touching': return <>{block.icon} Touching edge?</>;
    case 'sense-touching-sprite': return <>{block.icon} Touching{PI('sprite', 70)}?</>;
    case 'sense-key': return <>{block.icon} Key{PI('key', 60)}pressed?</>;
    case 'sense-mouse-x': return <>{block.icon} Mouse X</>;
    case 'sense-mouse-y': return <>{block.icon} Mouse Y</>;
    case 'sense-distance': return <>{block.icon} Distance to mouse</>;
    case 'sense-timer': return <>{block.icon} Timer</>;
    case 'sense-reset-timer': return <>{block.icon} Reset timer</>;
    case 'looks-say': return <>{block.icon} Say{PI('text', 80)}for{PI('secs', 25)}s</>;
    case 'looks-think': return <>{block.icon} Think{PI('text', 80)}for{PI('secs', 25)}s</>;
    case 'looks-costume': return <>{block.icon} Costume{PI('costume', 50)}</>;
    case 'looks-next-costume': return <>{block.icon} Next costume</>;
    case 'looks-color-effect': return <>{block.icon} Color effect{PI('value', 40)}</>;
    case 'looks-ghost-effect': return <>{block.icon} Ghost effect{PI('value', 40)}</>;
    case 'looks-clear-effects': return <>{block.icon} Clear effects</>;
    case 'looks-grow': return <>{block.icon} Grow by{PI('amount', 40)}</>;
    case 'looks-shrink': return <>{block.icon} Shrink by{PI('amount', 40)}</>;
    case 'looks-front': return <>{block.icon} Go to front</>;
    case 'looks-back': return <>{block.icon} Go to back</>;
    case 'physics-velocity': return <>{block.icon} Velocity X{PI('vx', 35)}Y{PI('vy', 35)}</>;
    case 'physics-gravity': return <>{block.icon} Gravity{PI('amount', 40)}</>;
    case 'physics-bounce': return <>{block.icon} Bounce off edges</>;
    case 'physics-friction': return <>{block.icon} Friction{PI('amount', 40)}</>;
    case 'physics-jump': return <>{block.icon} Jump power{PI('power', 40)}</>;
    case 'physics-push': return <>{block.icon} Push dir{PI('direction', 35)}force{PI('force', 35)}</>;
    case 'game-score-add': return <>{block.icon} Add{PI('amount', 40)}to score</>;
    case 'game-score-set': return <>{block.icon} Set score to{PI('value', 40)}</>;
    case 'game-lose-life': return <>{block.icon} Lose a life</>;
    case 'game-set-lives': return <>{block.icon} Set lives to{PI('value', 35)}</>;
    case 'game-over': return <>{block.icon} Game Over</>;
    case 'game-win': return <>{block.icon} You Win!</>;
    case 'game-next-level': return <>{block.icon} Next Level</>;
    case 'game-spawn': return <>{block.icon} Spawn clone of{PI('sprite', 60)}</>;
    case 'game-destroy': return <>{block.icon} Destroy this</>;
    case 'game-pause': return <>{block.icon} Pause game</>;
    case 'motion-glide': return <>{block.icon} Glide{PI('secs', 30)}s to x{PI('x', 35)}y{PI('y', 35)}</>;
    case 'motion-point': return <>{block.icon} Point toward mouse</>;
    case 'motion-point-dir': return <>{block.icon} Point dir{PI('direction', 40)}</>;
    case 'motion-setx': return <>{block.icon} Set X to{PI('x', 40)}</>;
    case 'motion-sety': return <>{block.icon} Set Y to{PI('y', 40)}</>;
    case 'motion-speed': return <>{block.icon} Speed{PI('speed', 40)}</>;
    case 'myblock-define': return <>{block.icon} Define{PI('name', 100)}</>;
    case 'myblock-run': return <>{block.icon} Run{PI('name', 100)}</>;
    default:            return <>{block.icon} {block.label}</>;
  }
}
