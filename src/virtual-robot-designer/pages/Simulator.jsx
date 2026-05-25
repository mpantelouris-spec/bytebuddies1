import React, { useRef, useState, useEffect } from 'react';
import SimulatorArena3D from '../components/SimulatorArena3D.jsx';
import { VRD_ARENAS, migrateDesign } from '../config.js';
import { getRobotPhysics } from '../services/robot-runtime.js';
import { runVrdProgram } from '../services/vrd-program-runner.js';
import { exportRobotSpec } from '../services/robot-schema.js';
import vrdApi from '../apis/vrd-api.js';
import VirtualRobotDB from '../database/virtual-robot-db.js';
import { useRobotStore } from '../store/robotStore.js';
import { statBarColor } from '../services/design-service.js';
import SensorVizOverlay from '../components/SensorVizOverlay.jsx';
import RobotJourneyBar from '../components/RobotJourneyBar.jsx';
import { migrateAssembly } from '../services/assembly-service.js';
import '../styles/academy-lab.css';

const SPEED_OPTS = [
  { id: 0.5, label: '0.5×' },
  { id: 1, label: '1×' },
  { id: 2, label: '2×' },
  { id: 3, label: 'Turbo' },
];

function StatBar({ label, value, color }) {
  return (
    <div className="al-stat-card">
      <label>{label}</label>
      <div className="al-stat-value">{Math.round(value)}%</div>
      <div className="al-stat-bar">
        <span style={{ width: `${Math.min(100, value)}%`, background: color }} />
      </div>
    </div>
  );
}

export default function SimulatorPage({ onGoDesign, onGoCode }) {
  const design = useRobotStore((s) => s.design);
  const simAutoRun = useRobotStore((s) => s.simAutoRun);
  const clearSimAutoRun = () => useRobotStore.setState({ simAutoRun: false });

  const robotRef = useRef(null);
  const simFsRef = useRef(null);
  const timerRef = useRef(null);
  const posRef = useRef({ x: 0, z: 0, angle: -90 });
  const abortRef = useRef(false);
  const pausedRef = useRef(false);

  const d = migrateDesign(design);
  const buildMode = migrateAssembly(d).buildMode || 'advanced';
  const physics = getRobotPhysics(d);

  const [simTrack, setSimTrack] = useState('obstacles');
  const [simFs, setSimFs] = useState(false);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [speedMult, setSpeedMult] = useState(1);
  const [elapsed, setElapsed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [sensorHits, setSensorHits] = useState(0);
  const [status, setStatus] = useState('Ready');
  const [activeStep, setActiveStep] = useState('');
  const [consoleLines, setConsoleLines] = useState(() => {
    const spec = exportRobotSpec(d);
    return [
      '> test arena ready',
      `> your robot: ${spec.robot.name}`,
      '> same 3D model from the invention lab',
    ];
  });

  pausedRef.current = paused;
  const log = (line) => setConsoleLines((prev) => [...prev.slice(-16), line]);
  const arenaList = VRD_ARENAS;

  useEffect(() => {
    const handler = () => setSimFs(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  useEffect(() => {
    if (!running || paused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return undefined;
    }
    timerRef.current = setInterval(() => {
      setElapsed((e) => e + 0.1 * speedMult);
    }, 100);
    return () => clearInterval(timerRef.current);
  }, [running, paused, speedMult]);

  const runSimulation = async () => {
    if (running) return;
    abortRef.current = false;
    setRunning(true);
    setPaused(false);
    setElapsed(0);
    setDistance(0);
    setSensorHits(0);
    setStatus('Running');
    log('> go! running YOUR robot…');
    robotRef.current?.resetState();

    const result = await runVrdProgram({
      design: d,
      arenaId: simTrack,
      posRef,
      speedMult,
      execute: (sub) => robotRef.current?.execute(sub),
      log,
      shouldAbort: () => abortRef.current,
      shouldPause: () => pausedRef.current,
      onStepStart: (step) => setActiveStep(step.id),
      onSensorHit: () => setSensorHits((h) => h + 1),
      onDistance: (delta) => setDistance((x) => x + delta),
    });

    await vrdApi.runSimulation({ designId: d.id || 'draft', arenaType: simTrack, robotType: d.template });
    VirtualRobotDB.recordMaxSpeed(physics.stats.speed);
    setRunning(false);
    setActiveStep('');
    setStatus(result.aborted ? 'Stopped' : 'Done!');
    log(result.aborted ? '> stopped' : '> mission complete!');
  };

  useEffect(() => {
    if (simAutoRun && !running) {
      clearSimAutoRun();
      const t = setTimeout(() => runSimulation(), 400);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [simAutoRun]);

  const stopSim = () => {
    abortRef.current = true;
    setRunning(false);
    setPaused(false);
    setActiveStep('');
    setStatus('Stopped');
    log('> stopped');
    robotRef.current?.execute({ id: 'stop', params: {} });
  };

  const stats = physics.stats;
  const batteryNow = Math.max(5, stats.battery - Math.floor(elapsed / 2));
  const arenaLabel = arenaList.find((a) => a.id === simTrack)?.label;

  return (
    <div className="al-app al-simulator">
      <RobotJourneyBar
        activeStep="test"
        buildMode={buildMode}
        onCreate={() => onGoDesign?.()}
        onProgram={() => onGoCode?.()}
      />

      <header className="al-header">
        <div>
          <h1>🚀 Test Your Robot</h1>
          <p>Watch the same robot you built run your code</p>
        </div>
        <div className="al-header-actions">
          {onGoCode && (
            <button type="button" className="al-btn" onClick={onGoCode}>
              ⌨ Code
            </button>
          )}
          {onGoDesign && (
            <button type="button" className="al-btn al-btn--primary" onClick={onGoDesign}>
              ← Invention Lab
            </button>
          )}
        </div>
      </header>

      <div className="al-sim-body">
        <aside className="al-panel">
          <h2 className="al-panel-title">🗺️ Pick a course</h2>
          <div className="al-tile-grid">
            {arenaList.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`al-tile ${simTrack === t.id ? 'active' : ''}`}
                onClick={() => {
                  setSimTrack(t.id);
                  robotRef.current?.reset();
                  log(`> course: ${t.label}`);
                }}
              >
                <span className="al-tile-icon">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className={`al-btn ${running ? 'al-btn--danger' : 'al-btn--run'}`}
            onClick={running ? stopSim : runSimulation}
          >
            {running ? '⏹ Stop' : '▶ Run My Robot'}
          </button>

          <div className="al-chip-row">
            <button
              type="button"
              className="al-btn"
              disabled={!running}
              onClick={() => setPaused((p) => !p)}
            >
              {paused ? '▶ Resume' : '⏸ Pause'}
            </button>
            <button
              type="button"
              className="al-btn"
              onClick={() => {
                stopSim();
                robotRef.current?.reset();
                setElapsed(0);
                setDistance(0);
              }}
            >
              ↺ Reset
            </button>
          </div>

          <p className="al-panel-title" style={{ marginTop: 8 }}>Speed</p>
          <div className="al-chip-row">
            {SPEED_OPTS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`al-chip ${speedMult === s.id ? 'active' : ''}`}
                onClick={() => setSpeedMult(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </aside>

        <main className="al-arena-wrap" ref={simFsRef}>
          <div className="al-arena-hud">
            <span className="al-arena-tag">Live · {arenaLabel}</span>
            <span className="al-arena-tag">
              {running ? (paused ? '⏸ Paused' : '● Running') : '○ Ready'} · {d.name}
            </span>
          </div>
          <div className="al-arena-viewport">
            <SensorVizOverlay design={d} running={running} activeStep={activeStep} sensorHits={sensorHits} />
            <SimulatorArena3D
              ref={robotRef}
              design={d}
              arenaId={simTrack}
              running={running}
              activeStep={activeStep}
              onMove={(p) => {
                posRef.current = p;
              }}
            />
          </div>
          <button
            type="button"
            className="al-fs-btn"
            onClick={() => (simFs ? document.exitFullscreen() : simFsRef.current?.requestFullscreen?.())}
          >
            {simFs ? '✕ Exit fullscreen' : '⛶ Fullscreen'}
          </button>
        </main>

        <aside className="al-panel al-panel--right">
          <h2 className="al-panel-title">📊 Robot stats</h2>
          <StatBar label="Speed" value={stats.speed} color={statBarColor('speed', stats.speed)} />
          <StatBar label="Battery" value={batteryNow} color={statBarColor('battery', batteryNow)} />
          <StatBar label="Agility" value={stats.agility} color={statBarColor('agility', stats.agility)} />
          <div className="al-hud-grid">
            <div>
              <span>Time</span>
              <strong>{elapsed.toFixed(1)}s</strong>
            </div>
            <div>
              <span>Distance</span>
              <strong>{distance.toFixed(1)} m</strong>
            </div>
            <div>
              <span>Sensors</span>
              <strong>{sensorHits}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{status}</strong>
            </div>
          </div>
        </aside>
      </div>

      <footer className="al-console" aria-live="polite">
        {consoleLines.map((line, i) => (
          <div key={`${line}-${i}`} className={`al-console-line ${activeStep && i === consoleLines.length - 1 ? 'active' : ''}`}>
            {line}
          </div>
        ))}
      </footer>
    </div>
  );
}
