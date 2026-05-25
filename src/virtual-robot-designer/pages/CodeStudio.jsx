import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { migrateDesign } from '../config.js';
import { HoloPanel } from '../components/HoloUI.jsx';
import VrdBlocklyWorkspace from '../components/VrdBlocklyWorkspace.jsx';
import {
  generatePythonFromDesign,
  generateJavaScriptFromDesign,
  ensureProgramInitialized,
  getAvailableBlocks,
  blockLabel,
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
  const [consoleLines, setConsoleLines] = useState(['> code studio online', '> drag Blockly blocks or edit Python/JS']);
  const [executingLine, setExecutingLine] = useState(-1);
  const [previewing, setPreviewing] = useState(false);
  const [usePyodide, setUsePyodide] = useState(false);

  const persistProgram = useCallback((patch) => {
    setDesign((prev) => migrateDesign({
      ...prev,
      program: { mode, blocks, python, javascript, ...patch },
    }));
  }, [mode, blocks, python, javascript, setDesign]);

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
    log('> synced from robot design');
    playVrdSoundSync('click');
  };

  const runInSimulator = () => {
    persistProgram({ mode, blocks, python, javascript });
    log('> program saved — launching simulator…');
    playVrdSoundSync('success');
    requestSimRun();
    onGoSimulator?.();
  };

  const simulateRunPreview = async () => {
    if (previewing) return;
    abortRef.current = false;
    setPreviewing(true);
    log('> preview run started');

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
            log(`> ${blockLabel(step)}`);
            await new Promise((r) => setTimeout(r, 400));
          },
          posRef: { current: { x: 0, z: 0, angle: -90 } },
          design: d,
        };
        if (usePyodide) {
          log('> loading Pyodide runtime…');
          await runPythonWithPyodide(python, ctx);
        } else {
          await runPythonProgram(python, ctx, { shouldAbort: () => abortRef.current });
        }
        log('> python preview complete ✓');
      } else if (mode === 'javascript') {
        await runJavaScriptProgram(javascript, {
          emit: async (step) => {
            log(`> ${blockLabel(step)}`);
            await new Promise((r) => setTimeout(r, 400));
          },
          posRef: { current: { x: 0, z: 0, angle: -90 } },
          design: d,
        });
        log('> javascript preview complete ✓');
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
  const available = getAvailableBlocks(d);
  const componentAPI = getComponentAPI(d);
  const stepCount = resolveProgram({ ...d, program: { mode, blocks, python, javascript } }).length;

  return (
    <div className="vrd-academy vrd-code-studio">
      <RobotJourneyBar
        activeStep="program"
        buildMode={buildMode}
        onCreate={() => onGoDesign?.()}
        onTest={() => onGoSimulator?.()}
      />
      <div className="vrd-code-header">
        <h2 className="vrd-code-title">⌨ PROGRAM YOUR ROBOT</h2>
        <p className="vrd-code-sub">Drag Blockly blocks or write code — then test in the simulator</p>
        <div className="vrd-code-mode-tabs">
          {[
            { id: 'blocks', label: '🧩 Blockly' },
            { id: 'python', label: '🐍 Python' },
            { id: 'javascript', label: '⚡ JavaScript' },
          ].map((m) => (
            <button key={m.id} type="button" className={`vrd-code-mode-btn ${mode === m.id ? 'active' : ''}`} onClick={() => setMode(m.id)}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="vrd-code-grid vrd-code-grid--rocksi">
        <aside className="vrd-code-left">
          <HoloPanel title="Component API" icon="📡" defaultOpen={false}>
            <div className="vrd-api-ref">
              {componentAPI.length === 0 ? (
                <span className="vrd-hint">Add sensors/tools to unlock API</span>
              ) : (
                componentAPI.map((item) => (
                  <div key={item.fn} className="vrd-api-item">
                    <span className="vrd-api-group">{item.group}</span>
                    <code>{item.fn}</code>
                    <span className="vrd-api-desc">{item.desc}</span>
                  </div>
                ))
              )}
            </div>
          </HoloPanel>

          {mode === 'python' && (
            <label className="vrd-toggle">
              <input type="checkbox" checked={usePyodide} onChange={(e) => setUsePyodide(e.target.checked)} />
              Full Python (Pyodide CDN)
            </label>
          )}

          <button type="button" className="vrd-quick-btn" onClick={syncFromRobot}>🔄 Sync from robot design</button>
          <p className="vrd-hint">{stepCount} instructions · speed {stats.speed}% · {available.sensor.length} sensor blocks</p>
        </aside>

        <section className="vrd-code-center">
          {mode === 'blocks' && (
            <VrdBlocklyWorkspace
              ref={blocklyRef}
              design={d}
              initialSteps={blocks}
              onStepsChange={handleBlocksChange}
              height={480}
            />
          )}
          {mode === 'python' && (
            <div className="vrd-code-editor-wrap">
              <Suspense fallback={<textarea className="vrd-code-fallback" value={python} onChange={(e) => setPython(e.target.value)} />}>
                <CodeEditor code={python} language="python" onChange={setPython} />
              </Suspense>
            </div>
          )}
          {mode === 'javascript' && (
            <div className="vrd-code-editor-wrap">
              <Suspense fallback={<textarea className="vrd-code-fallback" value={javascript} onChange={(e) => setJavascript(e.target.value)} />}>
                <CodeEditor code={javascript} language="javascript" onChange={setJavascript} />
              </Suspense>
            </div>
          )}
        </section>

        <aside className="vrd-code-right vrd-code-right--viewport">
          <InteractiveBuildChamber design={d} compact buildMode={d.assembly?.buildMode || 'advanced'} />
          <div className="vrd-console vrd-code-console">
            <div className="vrd-console-header"><span>◈ EXECUTION LOG</span></div>
            <div className="vrd-console-body">
              {consoleLines.map((line, i) => (
                <div key={`${line}-${i}`} className={executingLine >= 0 ? 'active' : ''}>{line}</div>
              ))}
            </div>
          </div>
          <div className="vrd-code-actions">
            <button type="button" className="vrd-console-btn vrd-console-btn--sim" onClick={runInSimulator}>⚡ RUN IN SIMULATOR</button>
            <button type="button" className="vrd-console-btn vrd-console-btn--gen" disabled={previewing} onClick={simulateRunPreview}>
              {previewing ? '… Running' : '▶ Preview run'}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
