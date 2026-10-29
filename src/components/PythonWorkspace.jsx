import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useProject } from '../contexts/ProjectContext';
import { useUser } from '../contexts/UserContext';
import CodeEditor from './CodeEditor';
import { loadSkulpt, runPython } from './learn/CodingLab/TextCodingLab.jsx';
import { Icon, IconText } from './ui/Icon.jsx';

const STARTER = `print("Hello, ByteBuddies!")

for n in range(1, 4):
    print("Python is fun!", n)
`;

const EXAMPLES = [
  {
    id: 'hello',
    name: 'Hello',
    hint: 'print + input',
    code: `print("Hello, ByteBuddies!")
name = input("What is your name? ")
print("Nice to meet you,", name)
`,
  },
  {
    id: 'loop',
    name: 'Loops',
    hint: 'for + range',
    code: `for n in range(1, 11):
    print(n, "× 2 =", n * 2)
print("Done!")
`,
  },
  {
    id: 'lists',
    name: 'Lists',
    hint: 'store many things',
    code: `pets = ["cat", "dog", "robot"]
pets.append("dragon")
for p in pets:
    print("I like my", p)
print("I have", len(pets), "pets")
`,
  },
  {
    id: 'functions',
    name: 'Functions',
    hint: 'def + return',
    code: `def greet(name):
    return "Hi " + name + "!"

print(greet("Maya"))
print(greet("Leo"))
`,
  },
  {
    id: 'guess',
    name: 'Guessing game',
    hint: 'if + random',
    code: `import random
secret = random.randint(1, 5)
guess = int(input("Guess a number 1 to 5: "))
if guess == secret:
    print("Yes! It was", secret)
else:
    print("Nope — it was", secret)
`,
  },
  {
    id: 'turtle',
    name: 'Turtle art',
    hint: 'draw with code',
    code: `import turtle
t = turtle.Turtle()
t.speed(0)
for i in range(36):
    t.forward(100)
    t.right(170)
print("Star drawn!")
`,
  },
];

export default function PythonWorkspace() {
  const { projects, activeProject, setActiveProject, updateProject, createProject, deleteProject } = useProject();
  const { addXP } = useUser();
  const pythonProjects = useMemo(
    () => (projects || []).filter((p) => (p.language || 'python') === 'python'),
    [projects],
  );
  const file = activeProject?.language === 'python' ? activeProject : pythonProjects[0] || null;
  const [code, setCode] = useState(() => file?.code || STARTER);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [running, setRunning] = useState(false);
  const [engine, setEngine] = useState('loading');
  const [savedFlash, setSavedFlash] = useState(false);
  const [exampleId, setExampleId] = useState(null);
  const turtleHostRef = useRef(null);
  const wantsTurtle = /\bimport\s+turtle\b|\bfrom\s+turtle\b/.test(code);

  useEffect(() => {
    loadSkulpt().then(() => setEngine('ready'), () => setEngine('error'));
  }, []);

  useEffect(() => {
    if (file?.code != null) setCode(file.code);
  }, [file?.id]);

  useEffect(() => {
    if (activeProject && activeProject.language !== 'python' && pythonProjects[0]) {
      setActiveProject(pythonProjects[0]);
    }
  }, [activeProject, pythonProjects, setActiveProject]);

  // With no file open (e.g. after deleting them all), typing or saving makes a new file
  const nextName = useCallback(() => {
    const taken = new Set(pythonProjects.map((p) => p.name));
    let n = 1;
    while (taken.has(`Python ${n}`)) n += 1;
    return `Python ${n}`;
  }, [pythonProjects]);
  const makeFile = useCallback((startCode) => createProject({
    name: nextName(), type: 'app', language: 'python', blocks: false, code: startCode,
  }), [createProject, nextName]);

  const persist = useCallback((nextCode) => {
    setCode(nextCode);
    if (file) updateProject(file.id, { code: nextCode, language: 'python' });
    else makeFile(nextCode);
  }, [file, updateProject, makeFile]);

  const save = useCallback(() => {
    if (file) updateProject(file.id, { code, language: 'python' });
    else makeFile(code);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1400);
  }, [file, code, updateProject, makeFile]);

  const run = useCallback(async () => {
    if (running) return;
    const turtle = /\bimport\s+turtle\b|\bfrom\s+turtle\b/.test(code);
    setRunning(true);
    setOutput('');
    setError('');
    if (turtleHostRef.current) turtleHostRef.current.innerHTML = '';
    let text = '';
    try {
      const r = await runPython(code, (t) => { text += t; setOutput(text); }, {
        turtleTarget: turtleHostRef.current,
        turtleWidth: 420,
        turtleHeight: 320,
        execLimit: 25000,
      });
      setEngine('ready');
      if (!r.ok) setError(r.error);
      else if (!r.text.trim() && !turtle) setOutput('(ran — nothing printed. Add a print( ) to see output.)');
      else addXP?.(5);
    } catch (e) {
      setEngine('error');
      setError(e.message || String(e));
    } finally {
      setRunning(false);
    }
  }, [running, code, addXP]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        save();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        run();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [save, run]);

  const removeFile = (p) => {
    if (!window.confirm(`Delete "${p.name}"? This can't be undone.`)) return;
    deleteProject(p.id);
    if (file?.id === p.id) {
      const next = pythonProjects.find((x) => x.id !== p.id);
      if (next) setActiveProject(next);
      else setCode(STARTER);
    }
    setOutput('');
    setError('');
  };

  const newFile = () => {
    const created = createProject({
      name: nextName(),
      type: 'app',
      language: 'python',
      blocks: false,
      code: STARTER,
    });
    setActiveProject(created);
    setCode(STARTER);
    setExampleId(null);
    setOutput('');
    setError('');
  };

  return (
    <div className="workspace-page py-workspace">
      <div className="workspace-toolbar">
        <strong className="py-kicker">Python</strong>
        <span className="py-sub">Write real Python in the browser — Run with Ctrl/⌘ + Enter</span>
        <span className="gb-chrome-gap" />
        <button type="button" className="btn btn-sm" onClick={newFile}>+ New file</button>
        <button
          type="button"
          className="btn btn-sm"
          onClick={save}
          style={{ background: savedFlash ? '#22c55e' : '#334155', color: '#fff', minWidth: 84 }}
        >
          {savedFlash ? 'Saved' : 'Save'}
        </button>
        <button
          type="button"
          className="btn btn-success btn-sm"
          onClick={run}
          disabled={running || engine === 'loading'}
        >
          <IconText>{engine === 'loading' ? 'Loading Python…' : running ? 'Running…' : '▶ Run'}</IconText>
        </button>
      </div>

      <div className="py-layout">
        <aside className="py-rail">
          <div className="py-rail-label">Examples</div>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.id}
              type="button"
              className={exampleId === ex.id ? 'py-ex on' : 'py-ex'}
              onClick={() => {
                setExampleId(ex.id);
                persist(ex.code);
                setOutput('');
                setError('');
              }}
            >
              <strong>{ex.name}</strong>
              <span>{ex.hint}</span>
            </button>
          ))}
          <div className="py-rail-label" style={{ marginTop: 14 }}>Your files</div>
          {pythonProjects.length === 0 && <div className="py-rail-empty">No files yet — press <b>+ New file</b>, or just start typing.</div>}
          {pythonProjects.map((p) => (
            <div key={p.id} className="py-file">
              <button
                type="button"
                className={file?.id === p.id ? 'py-ex on' : 'py-ex'}
                onClick={() => {
                  setActiveProject(p);
                  setExampleId(null);
                  setOutput('');
                  setError('');
                }}
              >
                <strong>{p.name}</strong>
                <span>python</span>
              </button>
              <button type="button" className="py-file-del" onClick={() => removeFile(p)} title={`Delete ${p.name}`} aria-label={`Delete ${p.name}`}>
                <Icon name="trash" />
              </button>
            </div>
          ))}
        </aside>

        <div className="py-editor">
          <div className="py-editor-head">
            <span>{file?.name || 'untitled.py'}</span>
            <span>{code.split('\n').length} lines</span>
          </div>
          <CodeEditor code={code} language="python" onChange={persist} />
        </div>

        <div className="py-out">
          <div className="py-editor-head">
            <span>Output</span>
            {wantsTurtle ? <span>turtle graphics</span> : <span>print( )</span>}
          </div>
          <pre className="py-console" aria-live="polite">
            {!output && !error && engine !== 'error' && (
              <span className="py-muted">Press Run. Use input( ) for questions.</span>
            )}
            {output}
            {engine === 'error' && !error && (
              <span className="py-err">Python engine could not load. Check the connection and press Run again.</span>
            )}
          </pre>
          {error && <div className="py-err-box"><b>Bug:</b> {error}</div>}
          <div ref={turtleHostRef} className={wantsTurtle ? 'py-turtle on' : 'py-turtle'} />
        </div>
      </div>
    </div>
  );
}
