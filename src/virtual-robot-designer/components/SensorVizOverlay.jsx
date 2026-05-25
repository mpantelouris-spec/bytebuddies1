import React from 'react';
import { migrateDesign } from '../config.js';

/** Visual sensor cones / lidar sweep over simulator viewport */
export default function SensorVizOverlay({ design, running, activeStep, sensorHits }) {
  const d = migrateDesign(design);
  if (!running) return null;

  const showUltrasonic = d.sensors?.ultrasonic || d.sensors?.proximity;
  const showLidar = d.sensors?.lidar;
  const showCamera = d.sensors?.camera || d.sensors?.camera360;

  return (
    <div className="vrd-sensor-viz" aria-hidden>
      {showUltrasonic && (
        <div className={`vrd-sensor-ray vrd-sensor-ray--sonic ${activeStep === 'forward' ? 'pulse' : ''}`}>
          <span className="vrd-sensor-label">ULTRASONIC 4.0m</span>
        </div>
      )}
      {showLidar && (
        <div className="vrd-sensor-lidar">
          <div className="vrd-lidar-sweep" />
          <span className="vrd-sensor-label">LIDAR SWEEP</span>
        </div>
      )}
      {showCamera && (
        <div className="vrd-sensor-camera">
          <span className="vrd-sensor-label">VISION LOCK</span>
        </div>
      )}
      {sensorHits > 0 && (
        <div className="vrd-sensor-hit">⚠ OBSTACLE {sensorHits}</div>
      )}
      {activeStep && (
        <div className="vrd-sensor-step">EXEC: {activeStep.toUpperCase()}</div>
      )}
    </div>
  );
}
