import { useEffect } from 'react';
import { SplitScreenLayout } from '../components/layout/SplitScreenLayout';
import { useSimulationStore } from '../store/useSimulationStore';
import './RainbowSimulatorPage.css';

function formatTime(ms: number): string {
  const totalSec = ms / 1000;
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec - minutes * 60;
  return `${String(minutes).padStart(2, '0')}:${seconds.toFixed(1).padStart(4, '0')}`;
}

function Phase1EditorPanel() {
  const blocks = useSimulationStore((s) => s.blocks);
  const isRunning = useSimulationStore((s) => s.isRunning);
  const vehicleSpeed = useSimulationStore((s) => s.vehicleSpeed);
  const timeMs = useSimulationStore((s) => s.timeMs);
  const lap = useSimulationStore((s) => s.lap);
  const executeCode = useSimulationStore((s) => s.executeCode);
  const resetSimulation = useSimulationStore((s) => s.resetSimulation);

  return (
    <div className="rs-phase1-editor">
      <header className="rs-phase1-header">
        <div className="rs-phase1-logo">ByteBuddies</div>
        <p className="rs-phase1-subtitle">Rainbow Road · KS2 Block Coding</p>
      </header>

      <div className="rs-phase1-toolbar">
        <button
          type="button"
          className="rs-phase1-run"
          disabled={isRunning}
          onClick={() => executeCode()}
        >
          ▶ Simulate
        </button>
        <button type="button" className="rs-phase1-reset" onClick={() => resetSimulation()}>
          ↩ Reset
        </button>
        <div className="rs-phase1-stats">
          <span>LAP {lap}/3</span>
          <span>{formatTime(timeMs)}</span>
          <span>{Math.round(vehicleSpeed)} u/s</span>
        </div>
      </div>

      <div className="rs-phase1-stack" aria-label="Program block stack">
        {blocks.map((block) => (
          <div
            key={block.id}
            className="rs-phase1-block"
            style={{ backgroundColor: block.color }}
          >
            <span className="rs-phase1-block-label">{block.label}</span>
            {block.type === 'action' && block.value > 0 && (
              <span className="rs-phase1-block-value">{block.value}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Phase1SimulationPanel() {
  const isRunning = useSimulationStore((s) => s.isRunning);
  const tick = useSimulationStore((s) => s.tick);

  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const delta = now - last;
      last = now;
      if (isRunning) tick(delta);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [isRunning, tick]);

  return (
    <div className="rs-phase1-sim" aria-hidden={!isRunning}>
      <div className="rs-phase1-sim-stars" />
      <div className="rs-phase1-sim-glow" />
    </div>
  );
}

export function RainbowSimulatorPage() {
  return (
    <SplitScreenLayout
      editor={<Phase1EditorPanel />}
      simulation={<Phase1SimulationPanel />}
    />
  );
}

export default RainbowSimulatorPage;
