/**
 * Test Arena — full redesign: immersive robotics testing facility.
 */
import React, { useRef, useState, useEffect } from 'react';
import { migrateDesign } from '../config.js';
import { getRobotPhysics } from '../services/robot-runtime.js';
import { runVrdProgram } from '../services/vrd-program-runner.js';
import { exportRobotSpec } from '../services/robot-schema.js';
import vrdApi from '../apis/vrd-api.js';
import VirtualRobotDB from '../database/virtual-robot-db.js';
import { useRobotStore } from '../store/robotStore.js';
import { migrateAssembly } from '../services/assembly-service.js';
import RobotJourneyBar from '../components/RobotJourneyBar.jsx';
import SensorVizOverlay from '../components/SensorVizOverlay.jsx';
import TestArenaViewport from '../components/test-arena/TestArenaViewport.jsx';
import TestArenaSystems from '../components/test-arena/TestArenaSystems.jsx';
import TestArenaMissionLog from '../components/test-arena/TestArenaMissionLog.jsx';
import TestArenaToolbar from '../components/test-arena/TestArenaToolbar.jsx';
import TestArenaOverlay from '../components/test-arena/TestArenaOverlay.jsx';
import { getCourseMeta, getDefaultCourseForDesign } from '../data/test-arena-courses.js';
import { analyzeRobot, getCourseMetaForProfile } from '../services/robot-profile.js';
import AdaptiveWorldsPanel from '../components/AdaptiveWorldsPanel.jsx';
import { getAdaptiveWorldForDesign } from '../services/world-selector.js';
import '../styles/test-arena.css';

export default function SimulatorPage({ onGoDesign, onGoCode }) {
  const design = useRobotStore((s) => s.design);
  const simAutoRun = useRobotStore((s) => s.simAutoRun);
  const clearSimAutoRun = () => useRobotStore.setState({ simAutoRun: false });

  const robotRef = useRef(null);
  const arenaFsRef = useRef(null);
  const timerRef = useRef(null);
  const posRef = useRef({ x: 0, z: 0, angle: -90 });
  const abortRef = useRef(false);
  const pausedRef = useRef(false);

  const d = migrateDesign(design);
  const buildMode = migrateAssembly(d).buildMode || 'advanced';
  const physics = getRobotPhysics(d);
  const robotProfile = analyzeRobot(d);

  const adaptiveWorld = getAdaptiveWorldForDesign(d);
  const [simTrack, setSimTrack] = useState(() => adaptiveWorld.defaultEnvironmentId || getDefaultCourseForDesign(d));
  const [activeMission, setActiveMission] = useState(() => adaptiveWorld.defaultMissionId || 'explore');
  const [simFs, setSimFs] = useState(false);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [speedMult, setSpeedMult] = useState(1);
  const [elapsed, setElapsed] = useState(0);
  const [distance, setDistance] = useState(0);
  const [sensorHits, setSensorHits] = useState(0);
  const [status, setStatus] = useState('Ready');
  const [activeStep, setActiveStep] = useState('');
  const [cinemaMode, setCinemaMode] = useState(false);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [consoleLines, setConsoleLines] = useState(() => {
    const spec = exportRobotSpec(d);
    return [
      '> test arena online',
      `> your robot: ${spec.robot.name}`,
      '> same invention from the lab — watch it go!',
    ];
  });

  pausedRef.current = paused;
  const log = (line) => setConsoleLines((prev) => [...prev.slice(-20), line]);
  const course = getCourseMetaForProfile(robotProfile, simTrack);

  useEffect(() => {
    const next = getAdaptiveWorldForDesign(useRobotStore.getState().design);
    setSimTrack((prev) => {
      const ids = next.unlockedEnvironmentIds;
      if (ids.includes(prev)) return prev;
      return next.defaultEnvironmentId;
    });
    setActiveMission(next.defaultMissionId);
  }, [robotProfile.profileId]);
  const batteryNow = Math.max(5, physics.stats.battery - Math.floor(elapsed / 2));

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

  const stopSim = () => {
    abortRef.current = true;
    setRunning(false);
    setPaused(false);
    setActiveStep('');
    setStatus('Stopped');
    log('> mission stopped');
    robotRef.current?.execute({ id: 'stop', params: {} });
  };

  const runSimulation = async () => {
    if (running) return;
    abortRef.current = false;
    setRunning(true);
    setPaused(false);
    setElapsed(0);
    setDistance(0);
    setSensorHits(0);
    setStatus('Running');
    log('> go! your robot is LIVE');
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

    await vrdApi.runSimulation({
      designId: d.id || 'draft',
      arenaType: simTrack,
      robotType: robotProfile.profileId,
      archetype: robotProfile.archetype.id,
    });
    VirtualRobotDB.recordMaxSpeed(physics.stats.speed);
    setRunning(false);
    setActiveStep('');
    setStatus(result.aborted ? 'Stopped' : 'Complete!');
    if (!result.aborted) {
      setShowCelebrate(true);
      setTimeout(() => setShowCelebrate(false), 3200);
    }
    log(result.aborted ? '> stopped' : '> mission complete — great job!');
  };

  useEffect(() => {
    if (simAutoRun && !running) {
      clearSimAutoRun();
      const t = setTimeout(() => runSimulation(), 400);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [simAutoRun]);

  const handleReset = () => {
    stopSim();
    robotRef.current?.reset();
    setElapsed(0);
    setDistance(0);
    setSensorHits(0);
    setStatus('Ready');
    log('> arena reset');
  };

  const handleCourseSelect = (id) => {
    setSimTrack(id);
    robotRef.current?.reset();
    log(`> world: ${getCourseMeta(id).label}`);
  };

  const handleMissionSelect = (id) => {
    setActiveMission(id);
    const mission = adaptiveWorld.missions.find((m) => m.id === id);
    if (mission) log(`> mission: ${mission.label}`);
  };

  return (
    <div className={`ta-app ${cinemaMode ? 'ta-app--cinema' : ''}`} ref={arenaFsRef}>
      {!cinemaMode && (
        <RobotJourneyBar
          activeStep="test"
          buildMode={buildMode}
          onCreate={() => onGoDesign?.()}
          onProgram={() => onGoCode?.()}
        />
      )}

      <TestArenaToolbar
        arenaId={simTrack}
        robotName={d.name}
        running={running}
        paused={paused}
        speedMult={speedMult}
        onPause={() => setPaused((p) => !p)}
        onSpeedChange={setSpeedMult}
        onReset={handleReset}
        onCameraReset={() => robotRef.current?.resetCamera?.()}
        onZoomIn={() => robotRef.current?.zoomIn?.()}
        onZoomOut={() => robotRef.current?.zoomOut?.()}
        onFullscreen={() => (simFs ? document.exitFullscreen() : arenaFsRef.current?.requestFullscreen?.())}
        isFullscreen={simFs}
        cinemaMode={cinemaMode}
        onCinemaToggle={() => setCinemaMode((c) => !c)}
        onGoDesign={onGoDesign}
        onGoCode={onGoCode}
      />

      {!cinemaMode && (
      <AdaptiveWorldsPanel
        design={d}
        activeEnvironmentId={simTrack}
        activeMissionId={activeMission}
        onSelectEnvironment={handleCourseSelect}
        onSelectMission={handleMissionSelect}
        onRunMission={() => runSimulation()}
        running={running}
        onStop={stopSim}
      />
      )}

      <main className="ta-arena">
        <div className="ta-arena-hud">
          <span className="ta-arena-pill" style={{ borderColor: course.color }}>
            {course.icon} {course.label}
          </span>
          <span className={`ta-arena-pill ${running && !paused ? 'ta-arena-pill--live' : ''}`}>
            {running ? (paused ? '⏸ Paused' : '● LIVE') : '○ Ready'}
          </span>
        </div>
        <TestArenaOverlay
          arenaId={simTrack}
          robotName={d.name}
          running={running}
          paused={paused}
          status={status}
          elapsed={elapsed}
          distance={distance}
          showCelebrate={showCelebrate}
        />
        <SensorVizOverlay design={d} running={running} activeStep={activeStep} sensorHits={sensorHits} />
        <TestArenaViewport
          ref={robotRef}
          design={d}
          arenaId={simTrack}
          arenaTheme={robotProfile.arenaTheme}
          running={running}
          activeStep={activeStep}
          onMove={(p) => {
            posRef.current = p;
          }}
          onSensorRead={(reading) => {
            if (reading.type === 'ultrasonic') {
              log(reading.hit ? '> obstacle detected ahead!' : '> path looks clear');
            } else if (reading.type === 'lidar') {
              log('> lidar sweep — scanning arena');
            } else if (reading.type === 'camera') {
              log('> camera spotted something!');
            }
          }}
        />
      </main>

      {!cinemaMode && (
      <TestArenaSystems
        design={d}
        running={running}
        paused={paused}
        battery={batteryNow}
        sensorHits={sensorHits}
        status={status}
        elapsed={elapsed}
        distance={distance}
        activeStep={activeStep}
      />
      )}

      {cinemaMode && (
        <div className="ta-cinema-dock">
          <button type="button" className="ta-run-btn" onClick={running ? stopSim : runSimulation}>
            {running ? '⏹ Stop' : '▶ Run!'}
          </button>
        </div>
      )}

      <TestArenaMissionLog lines={consoleLines} activeStep={activeStep} />
    </div>
  );
}
