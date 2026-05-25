import React, { useRef, useState, useEffect } from 'react';
import SimulatorArena3D from '../components/SimulatorArena3D.jsx';
import { VRD_ARENAS, migrateDesign } from '../config.js';
import { getRobotPhysics } from '../services/robot-runtime.js';
import { runVrdProgram } from '../services/vrd-program-runner.js';
import { exportRobotSpec } from '../services/robot-schema.js';
import vrdApi from '../apis/vrd-api.js';
import VirtualRobotDB from '../database/virtual-robot-db.js';
import { useRobotStore } from '../store/robotStore.js';
import { HoloTile, HoloStat } from '../components/HoloUI.jsx';
import { statBarColor } from '../services/design-service.js';
import SensorVizOverlay from '../components/SensorVizOverlay.jsx';
import LiveRobotTerminal from '../components/LiveRobotTerminal.jsx';
import RobotJourneyBar from '../components/RobotJourneyBar.jsx';
import { migrateAssembly } from '../services/assembly-service.js';

const SPEED_OPTS = [
  { id: 0.5, label: '0.5×' },
  { id: 1, label: '1.0×' },
  { id: 2, label: '2.0×' },
  { id: 3, label: 'Turbo' },
];

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
  const [status, setStatus] = useState('STANDBY');
  const [activeStep, setActiveStep] = useState('');
  const [consoleLines, setConsoleLines] = useState(() => {
    const spec = exportRobotSpec(d);
    return [
      '> simulation facility online',
      '> loading robot.json from engineering chamber',
      `> unit: ${spec.robot.name} | mode: ${spec.robot.mode}`,
      `> program mode: ${d.program?.mode || 'blocks'}`,
      '> identical 3D model synchronized',
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
    setStatus('SIMULATING');
    log('> mission start — deploying YOUR robot');
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
    setStatus(result.aborted ? 'ABORTED' : 'MISSION COMPLETE');
    log(result.aborted ? '> run aborted' : '> run complete — engineering validated');
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
    setStatus('ABORTED');
    log('> simulation aborted');
    robotRef.current?.execute({ id: 'stop', params: {} });
  };

  const stats = physics.stats;
  const batteryNow = Math.max(5, stats.battery - Math.floor(elapsed / 2));

  return (
    <div className="vrd-academy vrd-sim-academy vrd-sim-academy--3d">
      <RobotJourneyBar
        activeStep="test"
        buildMode={buildMode}
        onCreate={() => onGoDesign?.()}
        onProgram={() => onGoCode?.()}
      />
      <div className="vrd-sim-header">
        <h2 className="vrd-code-title">🚀 TEST YOUR ROBOT</h2>
        <p className="vrd-code-sub">Run your program in a live 3D arena — same robot you built</p>
        <div className="vrd-sim-header-actions">
          {onGoCode && <button type="button" className="vrd-quick-btn" onClick={onGoCode}>⌨ Code Studio</button>}
          {onGoDesign && <button type="button" className="vrd-quick-btn" onClick={onGoDesign}>◈ Engineering Chamber</button>}
        </div>
      </div>

      <div className="vrd-sim-grid">
        <aside className="vrd-sim-left">
          <div className="vrd-holo-panel open">
            <div className="vrd-holo-panel-head">
              <span className="vrd-holo-panel-icon">🗺️</span>
              <span className="vrd-holo-panel-title">Test Environment</span>
            </div>
            <div className="vrd-holo-panel-body">
              <div className="vrd-holo-tile-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                {arenaList.map((t) => (
                  <HoloTile
                    key={t.id}
                    icon={t.icon}
                    label={t.label}
                    active={simTrack === t.id}
                    onClick={() => { setSimTrack(t.id); robotRef.current?.reset(); log(`> arena loaded: ${t.label}`); }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="vrd-sim-controls">
            <button type="button" className="vrd-console-btn vrd-console-btn--sim vrd-sim-run" onClick={running ? stopSim : runSimulation}>
              {running ? '⏹ ABORT MISSION' : '▶ RUN MISSION'}
            </button>
            <button type="button" className="vrd-chamber-ctrl" onClick={() => setPaused((p) => !p)} disabled={!running}>⏸ {paused ? 'Resume' : 'Pause'}</button>
            <button type="button" className="vrd-chamber-ctrl" onClick={() => { stopSim(); robotRef.current?.reset(); setElapsed(0); setDistance(0); }}>↺ Reset</button>
          </div>

          <div className="vrd-sim-speed">
            {SPEED_OPTS.map((s) => (
              <button key={s.id} type="button" className={`vrd-holo-chip ${speedMult === s.id ? 'active' : ''}`} onClick={() => setSpeedMult(s.id)}>
                {s.label}
              </button>
            ))}
          </div>
        </aside>

        <section className="vrd-sim-center">
          <div className="vrd-sim-arena vrd-sim-arena--3d" ref={simFsRef}>
            <div className="vrd-chamber-hud">
              <span className="vrd-chamber-tag">LIVE ARENA · {arenaList.find((a) => a.id === simTrack)?.label}</span>
              <span className="vrd-chamber-status">{running ? (paused ? '⏸ PAUSED' : '● SIMULATING') : '○ IDLE'} · {d.name}</span>
            </div>
            <div className="vrd-sim-viewport vrd-sim-viewport--3d">
              <SensorVizOverlay design={d} running={running} activeStep={activeStep} sensorHits={sensorHits} />
              <SimulatorArena3D
                ref={robotRef}
                design={d}
                arenaId={simTrack}
                running={running}
                activeStep={activeStep}
                onMove={(p) => { posRef.current = p; }}
              />
            </div>
            <button
              type="button"
              className="vrd-sim-fs"
              onClick={() => (simFs ? document.exitFullscreen() : simFsRef.current?.requestFullscreen?.())}
            >
              {simFs ? '✕ Exit fullscreen' : '⛶ Fullscreen'}
            </button>
          </div>
        </section>

        <aside className="vrd-sim-right">
          <div className="vrd-telemetry">
            <div className="vrd-telemetry-header">
              <span className="vrd-telemetry-title">◈ MISSION HUD</span>
              <span className="vrd-telemetry-pulse">{running ? 'LIVE' : '—'}</span>
            </div>
            <HoloStat label="VELOCITY" value={Math.min(100, stats.speed)} color={statBarColor('speed', stats.speed)} />
            <HoloStat label="BATTERY" value={batteryNow} color={statBarColor('battery', batteryNow)} />
            <HoloStat label="AGILITY" value={stats.agility} color={statBarColor('agility', stats.agility)} />
            <div className="vrd-sim-hud-stats">
              <div><span>Time</span><strong>{elapsed.toFixed(1)}s</strong></div>
              <div><span>Distance</span><strong>{distance.toFixed(1)} m</strong></div>
              <div><span>Sensor hits</span><strong>{sensorHits}</strong></div>
              <div><span>Status</span><strong>{status}</strong></div>
              <div><span>Program</span><strong>{d.program?.mode || 'auto'}</strong></div>
            </div>
          </div>
        </aside>
      </div>

      <LiveRobotTerminal lines={consoleLines} activeStep={activeStep} running={running} designName={d.name} />
    </div>
  );
}
