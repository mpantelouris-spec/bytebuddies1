/**
 * Python mode for the Robot Studio code panel: write Python that drives the robot.
 * The code is checked as you type; when it's fine it becomes the program ▶ Simulate runs,
 * and the line that is running lights up.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { robotCommands, pythonToBlocks, blocksToPython, exampleCall } from './robotPython.js';
import { gamePythonExtras } from './robotPythonGames.js';
import { EmojiIcon } from '../../components/ui/Icon.jsx';

const LINE_H = 21;
const EXTRAS = [
  ['for i in range(3):\n    robot.move_forward(1)', 'Repeat 3 times'],
  ['while True:\n    robot.move_forward(1)', 'Forever'],
  ['wait(1)', 'Wait 1 second'],
  ['steps = 3', 'Make a variable'],
  ['def zigzag():\n    robot.turn_left(45)\n    robot.move_forward(1)\n    robot.turn_right(45)\n\nzigzag()', 'Make your own command'],
  ['def on_space():\n    robot.turn_left(90)', 'When space is pressed'],
];
const SKIP_CATS = new Set(['Events', 'Loops', 'Logic', 'Variables', 'Functions', 'Sensors', 'All']);
const SKIP_IDS = new Set(['end', 'else', 'repeat', 'forever', 'repeat_until', 'repeat_while', 'repeat_until_goal', 'wait', 'wait_until', 'break_loop', 'set_var', 'change_var', 'create_var']);

/**
 * `engine` (optional) swaps in another compiler — the Robot Arcade uses its own:
 * { toPython(blocks), toBlocks(code), groups: [{ label, icon, color, items: [{ code, title }] }], extras: [[code, label]] }
 */
export default function PythonCodePane({ library, group, robotType, style = null, engine = null, blocksScript, saveKey, onProgram, activeBlockUid, isRunning }) {
  const toPython = (blocks) => (engine ? engine.toPython(blocks) : blocksToPython(blocks, library, { group, robotType, style }));
  const [code, setCode] = useState(() => {
    try { const saved = localStorage.getItem(saveKey); if (saved) return saved; } catch { /* ignore */ }
    return toPython(blocksScript);
  });
  const [fromBlocks, setFromBlocks] = useState(() => { try { return !localStorage.getItem(saveKey); } catch { return true; } });
  const taRef = useRef(null);
  const gutterRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [showHelp, setShowHelp] = useState(false);

  const result = useMemo(() => (engine ? engine.toBlocks(code) : pythonToBlocks(code, library, { group, robotType, style })), [code, library, group, robotType, style, engine]);
  // Saved once the pupil has written their own Python; until then it follows their blocks
  useEffect(() => {
    if (fromBlocks) { try { localStorage.removeItem(saveKey); } catch { /* ignore */ } return; }
    try { localStorage.setItem(saveKey, code); } catch { /* ignore */ }
  }, [code, saveKey, fromBlocks]);
  useEffect(() => {
    if (fromBlocks) setCode(toPython(blocksScript));
  }, [blocksScript]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { onProgram(result.errors.length ? null : result.blocks, code); }, [result]); // eslint-disable-line react-hooks/exhaustive-deps

  // The line the robot is running now (blocks made from Python remember their line)
  const runLine = useMemo(() => {
    if (!isRunning || !activeBlockUid) return null;
    const m = String(activeBlockUid).match(/^py(\d+)_/);
    return m ? Number(m[1]) : null;
  }, [activeBlockUid, isRunning]);
  const errLine = result.errors[0]?.line || null;
  const lineCount = code.split('\n').length;

  // Commands this robot can use, grouped like the block palette
  const groups = useMemo(() => {
    if (engine) return engine.groups;
    const defs = robotCommands(library, group, robotType);
    const byCat = new Map();
    defs.forEach((d) => {
      // Game robots keep some actions (Show score, Check distance) in Logic / Sensors, so only skip the structure there
      if ((style ? ['Events', 'All'].includes(d.catKey) : SKIP_CATS.has(d.catKey)) || d.id.startsWith('when_') || d.id.startsWith('if_') || SKIP_IDS.has(d.id)) return;
      const cat = library[d.catKey];
      if (!byCat.has(d.catKey)) byCat.set(d.catKey, { label: cat?.label || d.catKey, icon: cat?.icon || '•', color: cat?.color || '#64748b', items: [] });
      byCat.get(d.catKey).items.push({ code: exampleCall(d, style), title: d.label });
    });
    return [...byCat.values()];
  }, [library, group, robotType, style, engine]);

  // Loop examples use this robot's own "go forward" command
  const cmdIds = useMemo(() => (engine ? [] : [...robotCommands(library, group, robotType).keys()]), [library, group, robotType, engine]);
  const fwd = ['move_forward', 'fly_forward', 'step_forward', 'swim_forward'].find((c) => cmdIds.includes(c));
  const hasMove = !!fwd;
  const fixMove = (c) => (fwd ? c.replace(/move_forward/g, fwd) : c);
  const insert = (text) => {
    const ta = taRef.current;
    if (!ta) { setCode((c) => `${c.replace(/\n*$/, '\n')}${text}\n`); return; }
    const pos = ta.selectionStart;
    const lineStart = code.lastIndexOf('\n', pos - 1) + 1;
    const lineEnd = code.indexOf('\n', pos) === -1 ? code.length : code.indexOf('\n', pos);
    const line = code.slice(lineStart, lineEnd);
    const indent = (line.match(/^\s*/) || [''])[0] + (line.trim().endsWith(':') ? '    ' : '');
    const insertAt = line.trim() ? lineEnd : lineStart;
    const piece = line.trim() ? `\n${indent}${text}` : `${indent}${text}`;
    const next = code.slice(0, insertAt) + piece + code.slice(insertAt);
    setCode(next); setFromBlocks(false);
    requestAnimationFrame(() => { ta.focus(); const p = insertAt + piece.length; ta.setSelectionRange(p, p); });
  };

  const onKeyDown = (e) => {
    const ta = e.currentTarget;
    const { selectionStart: a, selectionEnd: b, value } = ta;
    if (e.key === 'Tab') {
      e.preventDefault();
      const next = `${value.slice(0, a)}    ${value.slice(b)}`;
      setCode(next); setFromBlocks(false);
      requestAnimationFrame(() => ta.setSelectionRange(a + 4, a + 4));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const lineStart = value.lastIndexOf('\n', a - 1) + 1;
      const line = value.slice(lineStart, a);
      const indent = (line.match(/^\s*/) || [''])[0] + (line.trim().endsWith(':') ? '    ' : '');
      const next = `${value.slice(0, a)}\n${indent}${value.slice(b)}`;
      setCode(next); setFromBlocks(false);
      requestAnimationFrame(() => ta.setSelectionRange(a + 1 + indent.length, a + 1 + indent.length));
    }
  };

  return (
    <div className="py-pane">
      <div className="py-pane-main">
        <div className="py-pane-bar">
          {fromBlocks
            ? <span className="py-pane-note"><EmojiIcon e="🧩" /> Your blocks, written in Python</span>
            : <span className="py-pane-note"><EmojiIcon e="🐍" /> Your Python program</span>}
          <button type="button" className="py-pane-btn" disabled={isRunning} onClick={() => { if (fromBlocks || window.confirm('Replace your Python with your blocks program?')) { setCode(toPython(blocksScript)); setFromBlocks(true); } }} title="Write my blocks as Python again">
            ↺ From my blocks
          </button>
        </div>
        <details className="py-pane-help" open={showHelp} onToggle={(e) => setShowHelp(e.currentTarget.open)}>
          <summary><EmojiIcon e="📖" /> Robot commands <span>— click one to add it</span></summary>
          <div className="py-pane-help-body">
            {groups.map((g) => (
              <div key={g.label} className="py-pane-group">
                <div className="py-pane-group-name" style={{ color: g.color }}><EmojiIcon e={g.icon} /> {g.label}</div>
                <div className="py-pane-chips">
                  {g.items.map((d) => (
                    <button key={d.code} type="button" className="py-pane-cmd" style={{ '--c': g.color }} onClick={() => insert(d.code)} title={d.title}>
                      <code>{d.code}</code>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div className="py-pane-group">
              <div className="py-pane-group-name" style={{ color: '#f59e0b' }}><EmojiIcon e="🔁" /> Loops & more</div>
              <div className="py-pane-chips">
                {(engine ? engine.extras : style ? gamePythonExtras(style) : EXTRAS.filter(([c]) => !/move_forward/.test(c) || hasMove)).map(([c, label]) => (
                  <button key={label} type="button" className="py-pane-cmd" style={{ '--c': '#f59e0b' }} onClick={() => insert(fixMove(c))} title={label}>
                    <span className="py-pane-cmd-label">{label}</span><code>{fixMove(c).split('\n')[0]}</code>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </details>
        <div className="py-pane-editor">
          <div className="py-pane-gutter" ref={gutterRef} aria-hidden="true" style={{ transform: `translateY(${-scrollTop}px)` }}>
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i} className={`${i + 1 === errLine ? 'is-err' : ''}${i + 1 === runLine ? ' is-run' : ''}`}>{i + 1}</div>
            ))}
          </div>
          <div className="py-pane-lines" aria-hidden="true" style={{ transform: `translateY(${-scrollTop}px)` }}>
            {errLine && <div className="py-pane-mark is-err" style={{ top: (errLine - 1) * LINE_H }} />}
            {runLine && <div className="py-pane-mark is-run" style={{ top: (runLine - 1) * LINE_H }} />}
          </div>
          <textarea
            ref={taRef}
            className="py-pane-text"
            value={code}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            aria-label="Python code"
            readOnly={isRunning}
            onChange={(e) => { setCode(e.target.value); setFromBlocks(false); }}
            onKeyDown={onKeyDown}
            onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
          />
        </div>
        <div className={`py-pane-status${result.errors.length ? ' is-err' : ' is-ok'}`} role="status">
          {result.errors.length
            ? <><b>Line {result.errors[0].line}:</b> {result.errors[0].message}</>
            : <><EmojiIcon e="✅" /> Ready — {result.steps} {style || engine ? 'block' : 'robot move'}{result.steps === 1 ? '' : 's'}. Press ▶ Simulate to run it.</>}
        </div>
      </div>
    </div>
  );
}
