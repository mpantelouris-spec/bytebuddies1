import React from 'react';
import { migrateDesign } from '../../config.js';

function SystemRow({ icon, label, status, active }) {
  return (
    <div className={`ta-system-row ${active ? 'ta-system-row--on' : ''}`}>
      <span className="ta-system-icon">{icon}</span>
      <div className="ta-system-text">
        <strong>{label}</strong>
        <span>{status}</span>
      </div>
      <span className={`ta-system-dot ${active ? 'ta-system-dot--pulse' : ''}`} aria-hidden />
    </div>
  );
}

export default function TestArenaSystems({
  design,
  running,
  paused,
  battery,
  sensorHits,
  status,
  elapsed,
  distance,
  activeStep,
}) {
  const d = migrateDesign(design);
  const s = d.sensors || {};
  const wheels = d.wheels?.type || 'wheels';

  const movementLabel =
    wheels === 'tracks' ? 'Tank tracks ready'
    : wheels === 'legs' ? 'Walking legs ready'
    : wheels === 'hover' ? 'Hover mode active'
    : d.template === 'drone' ? 'Flight systems on'
    : 'Wheels ready';

  return (
    <aside className="ta-systems">
      <h2 className="ta-panel-heading">Robot systems</h2>
      <p className="ta-panel-sub">{d.name || 'My Robot'}</p>

      <div className="ta-systems-list">
        <SystemRow
          icon="🔋"
          label="Battery"
          status={battery > 40 ? 'Healthy' : battery > 15 ? 'Getting low' : 'Charge soon!'}
          active={running && battery > 15}
        />
        <SystemRow
          icon="🧠"
          label="Mission AI"
          status={running ? (paused ? 'Paused' : 'Running code') : 'Standing by'}
          active={running && !paused}
        />
        <SystemRow
          icon="👁"
          label="Sensors"
          status={
            s.lidar ? 'LIDAR scanning'
            : s.ultrasonic ? 'Ultrasonic active'
            : s.camera ? 'Camera online'
            : 'Add sensors in lab'
          }
          active={running && (s.lidar || s.ultrasonic || s.camera)}
        />
        <SystemRow icon="⚙" label="Movement" status={movementLabel} active={running} />
        <SystemRow
          icon="📡"
          label="Detections"
          status={
            running && sensorHits > 0
              ? `Spotted ${sensorHits} obstacle${sensorHits > 1 ? 's' : ''}!`
              : running
                ? 'Scanning ahead…'
                : 'All clear'
          }
          active={running && sensorHits > 0}
        />
        {running && (
          <SystemRow
            icon="🏁"
            label="Challenge"
            status={paused ? 'Paused — tap Resume' : 'Your robot is LIVE!'}
            active={!paused}
          />
        )}
      </div>

      <div className="ta-mission-stats">
        <div><span>Time</span><strong>{elapsed.toFixed(1)}s</strong></div>
        <div><span>Distance</span><strong>{distance.toFixed(1)} m</strong></div>
        <div><span>Status</span><strong>{status}</strong></div>
        {activeStep && (
          <div className="ta-mission-step">
            <span>Now doing</span><strong>{activeStep}</strong>
          </div>
        )}
      </div>
    </aside>
  );
}
