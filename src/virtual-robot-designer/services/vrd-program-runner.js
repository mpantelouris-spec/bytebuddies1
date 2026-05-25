import { migrateDesign } from '../config.js';
import {
  resolveProgram,
  expandProgramForExecution,
  applyObstacleAvoidance,
  blockLabel,
} from './program-service.js';
import { terminalMessagesForStep, getRobotPhysics } from './robot-runtime.js';
import { parsePythonToSteps } from './program-service.js';

const delay = (ms, speedMult = 1) => new Promise((r) => setTimeout(r, ms / speedMult));

/**
 * Shared mission runner — used by Simulator and Code Studio preview.
 */
export async function runVrdProgram({
  design,
  arenaId = 'obstacles',
  posRef,
  execute,
  log,
  speedMult = 1,
  shouldAbort,
  shouldPause,
  onStepStart,
  onStepComplete,
  onSensorHit,
  onDistance,
}) {
  const d = migrateDesign(design);
  const physics = getRobotPhysics(d);
  const rawProgram = resolveProgram(d);
  const program = expandProgramForExecution(rawProgram, d, posRef.current, arenaId);

  log?.(`> program loaded (${program.length} instructions)`);

  for (const step of program) {
    while (shouldPause?.()) {
      await delay(100, 1);
      if (shouldAbort?.()) return { aborted: true, completed: false };
    }
    if (shouldAbort?.()) return { aborted: true, completed: false };

    onStepStart?.(step);
    terminalMessagesForStep(step, d, physics).forEach((l) => log?.(l));
    log?.(`> ${blockLabel(step)}`);

    const stepsToRun = applyObstacleAvoidance(step, posRef.current, d, arenaId);
    for (const sub of stepsToRun) {
      if (shouldAbort?.()) return { aborted: true, completed: false };
      if (sub.meta === 'avoid') {
        onSensorHit?.();
        log?.('> ultrasonic: obstacle — rerouting');
      }
      await execute?.(sub);
      await delay(sub.id === 'scan' ? 200 : sub.id === 'wait' ? (sub.params?.secs || 1) * 1000 : 60, speedMult);
      if (sub.id === 'forward') onDistance?.((sub.params?.amount || 40) * 0.08);
    }
    onStepComplete?.(step);
  }

  return { aborted: false, completed: true };
}

/** Code Studio preview — dry run with timing, no 3D execute */
export async function previewProgramSteps({
  design,
  steps,
  log,
  onHighlight,
  speedMult = 1,
  shouldAbort,
}) {
  for (let i = 0; i < steps.length; i += 1) {
    if (shouldAbort?.()) break;
    const step = steps[i];
    onHighlight?.(i, step);
    log?.(`> executing: ${blockLabel(step)}`);
    const ms = step.id === 'wait' ? (step.params?.secs || 1) * 1000 : step.id === 'scan' ? 600 : 350;
    await delay(ms, speedMult);
  }
  onHighlight?.(-1, null);
  log?.('> preview complete ✓');
}

/** Execute Python via step parser */
export async function runPythonProgram(code, ctx, { shouldAbort } = {}) {
  const parsed = parsePythonToSteps(code);
  if (parsed?.length) {
    for (const step of parsed) {
      if (shouldAbort?.()) break;
      await ctx.emit(step);
    }
    return { mode: 'steps', count: parsed.length };
  }
  throw new Error('Could not parse Python — use bot.forward(), bot.turn_left(), bot.stop()');
}

/** Lazy Pyodide loader for full Python subset (CDN) */
let pyodidePromise = null;

export function loadPyodideRuntime() {
  if (pyodidePromise) return pyodidePromise;
  pyodidePromise = (async () => {
    if (window.loadPyodide) return window.loadPyodide();
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
    return window.loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/' });
  })();
  return pyodidePromise;
}

export async function runPythonWithPyodide(code, ctx) {
  const pyodide = await loadPyodideRuntime();
  pyodide.globals.set('__emit_step', async (jsonStr) => {
    try {
      const step = JSON.parse(jsonStr);
      await ctx.emit(step);
    } catch {
      /* ignore */
    }
  });
  await pyodide.runPythonAsync(`
class ByteBuddy:
    def forward(self, cm=50):
        import js
        js.__emit_step('{"id":"forward","params":{"amount":%d}}' % int(cm))
    def turn_left(self, deg=45):
        import js
        js.__emit_step('{"id":"left","params":{"degrees":%d}}' % int(deg))
    def turn_right(self, deg=45):
        import js
        js.__emit_step('{"id":"right","params":{"degrees":%d}}' % int(deg))
    def stop(self):
        import js
        js.__emit_step('{"id":"stop","params":{}}')
    def wait(self, secs=1):
        import js
        js.__emit_step('{"id":"wait","params":{"secs":%s}}' % float(secs))
`);
  await pyodide.runPythonAsync(code);
  return { mode: 'pyodide' };
}
