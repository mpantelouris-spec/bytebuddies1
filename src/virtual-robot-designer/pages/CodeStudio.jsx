import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { migrateDesign } from '../config.js';
import VrdBlocklyWorkspace from '../components/VrdBlocklyWorkspace.jsx';
import BlocklyUnlockPanel from '../components/workshop/BlocklyUnlockPanel.jsx';
import {
  generatePythonFromDesign,
  generateJavaScriptFromDesign,
  ensureProgramInitialized,
  getComponentAPI,
  resolveProgram,
} from '../services/program-service.js';
import { stepsToPython, stepsToJavaScript } from '../utils/vrdBlocklySetup.js';
import { computeDesignStats } from '../services/design-service.js';
import { previewProgramSteps, runPythonProgram, runPythonWithPyodide } from '../services/vrd-program-runner.js';
import { runJavaScriptProgram } from '../services/vrd-bytebuddy.js';
import { useRobotStore } from '../store/robotStore.js';
import { playVrdSoundSync } from '../utils/vrdSound.js';
import InteractiveBuildChamber from '../components/InteractiveBuildChamber.jsx';
import RobotJourneyBar from '../components/RobotJourneyBar.jsx';
import { migrateAssembly } from '../services/assembly-service.js';
import { getBlocklyUnlockReport } from '../services/block-unlocks.js';
import '../styles/academy-lab.css';

const CodeEditor = React.lazy(() => import('../../components/CodeEditor.jsx'));

export default function CodeStudioPage({ onGoSimulator, onGoDesign }) {
  const design = useRobotStore((s) => s.design);
  const setDesign = useRobotStore((s) => s.setDesign);
  const requestSimRun = useRobotStore((s) => s.requestSimRun);

  const d = migrateDesign(design);
  const buildMode = migrateAssembly(d).buildMode || 'advanced';
  const blocklyRef = useRef(null);
  const abortRef = useRef(false);

  const [mode, setMode] = useState(d.program?.mode || 'blocks');
  const [blocks, setBlocks] = useState(() => ensureProgramInitialized(d).blocks || []);
  const [python, setPython] = useState(() => d.program?.python || generatePythonFromDesign(d));
  const [javascript, setJavascript] = useState(() => d.program?.javascript || generateJavaScriptFromDesign(d));
  const [consoleLines, setConsoleLines] = useState(['> code studio ready', '> blocks unlock when you add parts']);
  const [executingLine, setExecutingLine] = useState(-1);
  const [previewing, setPreviewing] = useState(false);
  const [usePyodide, setUsePyodide] = useState(false);

  const unlockReport = getBlocklyUnlockReport(d);

  const persistProgram = useCallback(
    (patch) => {
      setDesign((prev) =>
        migrateDesign({
          ...prev,
          program: { mode, blocks, python, javascript, ...patch },
        }),
      );
    },
    [mode, blocks, python, javascript, setDesign],
  );

  useEffect(() => {
    const t = setTimeout(() => persistProgram({}), 600);
    return () => clearTimeout(t);
  }, [mode, blocks, python, javascript, persistProgram]);

  const log = (line) => setConsoleLines((prev) => [...prev.slice(-16), line]);

  const handleBlocksChange = (steps) => {
    setBlocks(steps);
    setPython(stepsToPython(steps));
    setJavascript(stepsToJavaScript(steps));
  };

  const syncFromRobot = () => {
    const bl = ensureProgramInitialized(d).blocks;
    setPython(generatePythonFromDesign(d));
    setJavascript(generateJavaScriptFromDesign(d));
    setBlocks(bl);
    blocklyRef.current?.loadSteps(bl);
    log('> synced from your robot');
    playVrdSoundSync('click');
  };

  const runInSimulator = () => {
    persistProgram({ mode, blocks, python, javascript });
    log('> saved — opening test arena…');
    playVrdSoundSync('success');
    requestSimRun();
    onGoSimulator?.();
  };

  const simulateRunPreview = async () => {
    if (previewing) return;
    abortRef.current = false;
    setPreviewing(true);
    log('> preview started');

    try {
      if (mode === 'blocks') {
        const steps = blocklyRef.current?.getSteps() || blocks;
        await previewProgramSteps({
          design: d,
          steps,
          log,
          shouldAbort: () => abortRef.current,
          onHighlight: (i) => setExecutingLine(i),
        });
      } else if (mode === 'python') {
        const ctx = {
          emit: async (step) => {
            log(`> ${step.id || step}`);
            await new Promise((r) => setTimeout(r, 400));
          },
          posRef: { current: { x: 0, z: 0, angle: -90 } },
          design: d,
        };
        if (usePyodide) {
          log('> loading Python…');
          await runPythonWithPyodide(python, ctx);
        } else {
          await runPythonProgram(python, ctx, { shouldAbort: () => abortRef.current });
        }
        log('> preview done ✓');
      } else if (mode === 'javascript') {
        await runJavaScriptProgram(javascript, {
          emit: async (step) => {
            log(`> ${step.id || step}`);
            await new Promise((r) => setTimeout(r, 400));
          },
          posRef: { current: { x: 0, z: 0, angle: -90 } },
          design: d,
        });
        log('> preview done ✓');
      }
      playVrdSoundSync('success');
    } catch (err) {
      log(`> error: ${err.message || err}`);
      playVrdSoundSync('error');
    } finally {
      setExecutingLine(-1);
      setPreviewing(false);
    }
  };

  const stats = computeDesignStats(d);
  const componentAPI = getComponentAPI(d);
  const stepCount = resolveProgram({ ...d, program: { mode, blocks, python, javascript } }).length;

  return (
    <div className="al-app al-code-studio">
      <RobotJourneyBar
        activeStep="program"
        buildMode={buildMode}
        onCreate={() => onGoDesign?.()}
        onTest={() => onGoSimulator?.()}
      />

      <header className="al-header">
        <div>
          <h1>⌨ Code Your Robot</h1>
          <p>
            {unlockReport.unlockedCount} blocks ready · add parts to unlock more
          </p>
        </div>
        <div className="al-header-actions">
          <button type="button" className="al-btn al-btn--run" onClick={runInSimulator}>
            ▶ Test in Arena
          </button>
          {onGoDesign && (
            <button type="button" className="al-btn" onClick={onGoDesign}>
              ← Invention Lab
            </button>
          )}
        </div>
      </header>

      <div className="al-chip-row" style={{ padding: '8px 20px', flexShrink: 0, background: 'var(--al-glass)', borderBottom: '1px solid var(--al-border)' }}>
        {[
          { id: 'blocks', label: '🧩 Blockly' },
          { id: 'python', label: '🐍 Python' },
          { id: 'javascript', label: '⚡ JavaScript' },
        ].map((m) => (
          <button
            key={m.id}
            type="button"
            className={`al-chip ${mode === m.id ? 'active' : ''}`}
            onClick={() => setMode(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="al-code-body">
        <aside className="al-panel">
          <h2 className="al-panel-title">🔓 Block unlocks</h2>
          <BlocklyUnlockPanel design={d} onGoDesign={onGoDesign} />

          {mode === 'python' && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.8rem', marginTop: 12 }}>
              <input type="checkbox" checked={usePyodide} onChange={(e) => setUsePyodide(e.target.checked)} />
              Full Python (Pyodide)
            </label>
          )}

          <button type="button" className="al-btn" style={{ marginTop: 12, width: '100%' }} onClick={syncFromRobot}>
            🔄 Sync from robot
          </button>

          {componentAPI.length > 0 && (
            <div className="al-unlock-group" style={{ marginTop: 12 }}>
              <h3>📡 Your robot can…</h3>
              {componentAPI.slice(0, 4).map((item) => (
                <div key={item.fn} className="al-unlock-item unlocked">
                  <span className="al-unlock-icon">✓</span>
                  <div>
                    <code style={{ fontSize: '0.72rem' }}>{item.fn}</code>
                    <div className="al-unlock-hint">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="al-unlock-hint" style={{ marginTop: 12 }}>
            {stepCount} steps · speed {stats.speed}%
          </p>
        </aside>

        <section style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {mode === 'blocks' && (
            <div className="al-blockly-wrap">
              <VrdBlocklyWorkspace
                ref={blocklyRef}
                design={d}
                initialSteps={blocks}
                onStepsChange={handleBlocksChange}
                height={520}
              />
            </div>
          )}
          {mode === 'python' && (
            <div className="al-code-editor">
              <Suspense
                fallback={
                  <textarea
                    className="vrd-code-fallback"
                    style={{ width: '100%', height: '100%', border: 'none', padding: 12 }}
                    value={python}
                    onChange={(e) => setPython(e.target.value)}
                  />
                }
              >
                <CodeEditor code={python} language="python" onChange={setPython} />
              </Suspense>
            </div>
          )}
          {mode === 'javascript' && (
            <div className="al-code-editor">
              <Suspense
                fallback={
                  <textarea
                    className="vrd-code-fallback"
                    style={{ width: '100%', height: '100%', border: 'none', padding: 12 }}
                    value={javascript}
                    onChange={(e) => setJavascript(e.target.value)}
                  />
                }
              >
                <CodeEditor code={javascript} language="javascript" onChange={setJavascript} />
              </Suspense>
            </div>
          )}
        </section>

        <aside className="al-panel al-panel--right">
          <h2 className="al-panel-title">🤖 Your robot</h2>
          <div className="al-preview-mini">
            <InteractiveBuildChamber design={d} compact buildMode={d.assembly?.buildMode || 'advanced'} />
          </div>

          <h2 className="al-panel-title" style={{ marginTop: 12 }}>
            📋 Log
          </h2>
          <div className="al-log">
            {consoleLines.map((line, i) => (
              <div key={`${line}-${i}`} className={executingLine >= 0 && i === consoleLines.length - 1 ? 'active' : ''}>
                {line}
              </div>
            ))}
          </div>

          <button
            type="button"
            className="al-btn al-btn--run"
            style={{ marginTop: 12, width: '100%' }}
            disabled={previewing}
            onClick={simulateRunPreview}
          >
            {previewing ? '… Running' : '▶ Quick preview'}
          </button>
        </aside>
      </div>
    </div>
  );
}
