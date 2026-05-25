import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HoloPanel } from './HoloUI.jsx';
import { migrateDesign } from '../config.js';
import { placePartOnSlot } from '../services/assembly-service.js';
import { motorPowerFromSlider, motorPowerToSlider } from '../utils/statColors.js';
import { playVrdSoundSync } from '../utils/vrdSound.js';

const MOVEMENT_OPTS = [
  { id: 'standard', icon: '🚗', label: 'Wheels', partId: 'standard', wheels: { type: 'standard', count: 4 } },
  { id: 'tracks', icon: '🐛', label: 'Tracks', partId: 'tracks', wheels: { type: 'tracks', count: 2 } },
  { id: 'legs', icon: '🦗', label: 'Legs', partId: 'legs', wheels: { type: 'legs', count: 4 } },
  { id: 'hover', icon: '✈️', label: 'Flying', partId: 'hover', wheels: { type: 'hover', count: 4 } },
  { id: 'omni', icon: '🔘', label: 'Omni', partId: 'omni', wheels: { type: 'mecanum', count: 4 } },
];

const SENSOR_OPTS = [
  { key: 'camera', label: 'Camera', desc: 'Front optical sensor · unlocks vision code' },
  { key: 'ultrasonic', label: 'Ultrasonic', desc: 'Proximity array · obstacle avoidance' },
  { key: 'lidar', label: 'LIDAR', desc: '360° laser sweep · mapping' },
  { key: 'thermal', label: 'Thermal', desc: 'Heat vision · environment scan' },
  { key: 'gyroscope', label: 'Gyroscope', desc: 'Balance & orientation' },
  { key: 'accelerometer', label: 'Accelerometer', desc: 'Motion detection' },
  { key: 'proximity', label: 'Proximity', desc: 'Near-field array' },
  { key: 'collision', label: 'Collision', desc: 'Bumper strip sensors' },
];

const TOOL_OPTS = [
  { key: 'pincer', label: 'Grabber Arm', tools: { pincer: true, grabber: 'pincer' } },
  { key: 'gripper', label: 'Gripper', tools: { gripper: true, grabber: 'gripper' } },
  { key: 'bulldozer', label: 'Pusher Blade', tools: { bulldozer: true, pusher: 'bulldozer' } },
];

export default function RobotQuickControls({ design, setDesign, onLog, showAdvanced = true }) {
  const [showMoreSensors, setShowMoreSensors] = useState(false);
  const d = migrateDesign(design);
  const motorVal = motorPowerToSlider(d.wheels?.motor);
  const wheelCount = d.wheels?.count ?? 4;
  const activeSensors = SENSOR_OPTS.filter((s) => d.sensors?.[s.key]).length;
  const visibleSensors = showMoreSensors ? SENSOR_OPTS : SENSOR_OPTS.slice(0, 5);

  const setMovement = (opt) => {
    let next = placePartOnSlot(d, 'movement', 'movement', opt.partId);
    next = migrateDesign({ ...next, wheels: { ...next.wheels, ...opt.wheels } });
    setDesign(next);
    playVrdSoundSync('snap');
    onLog?.(`> movement: ${opt.label}`);
  };

  const toggleSensor = (key) => {
    const label = SENSOR_OPTS.find((s) => s.key === key)?.label || key;
    setDesign((prev) => {
      const m = migrateDesign(prev);
      return migrateDesign({ ...m, sensors: { ...m.sensors, [key]: !m.sensors?.[key] } });
    });
    playVrdSoundSync('click');
    onLog?.(`> sensor toggled: ${label}`);
  };

  const toggleTool = (opt) => {
    const active = opt.key === 'pincer' ? d.tools?.pincer : opt.key === 'gripper' ? d.tools?.gripper : d.tools?.bulldozer;
    setDesign((prev) => {
      const m = migrateDesign(prev);
      const patch = {};
      Object.entries(opt.tools).forEach(([k, v]) => {
        patch[k] = active ? (k === 'grabber' ? 'none' : false) : v;
      });
      return migrateDesign({ ...m, tools: { ...m.tools, ...patch } });
    });
    onLog?.(`> tool ${active ? 'removed' : 'mounted'}: ${opt.label}`);
  };

  const setMotorPower = (val) => {
    const motor = motorPowerFromSlider(val);
    setDesign((prev) => {
      const m = migrateDesign(prev);
      return migrateDesign({ ...m, wheels: { ...m.wheels, motor } });
    });
  };

  const setWheelCount = (count) => {
    setDesign((prev) => {
      const m = migrateDesign(prev);
      return migrateDesign({ ...m, wheels: { ...m.wheels, count } });
    });
    onLog?.(`> wheels: ${count} configured`);
  };

  if (!showAdvanced) return null;

  return (
    <>
      <HoloPanel title="Movement System" icon="⚙" defaultOpen>
        <motion.div className="vrd-movement-toggle">
          {MOVEMENT_OPTS.map((opt) => (
            <motion.button
              key={opt.id}
              type="button"
              className={`vrd-movement-btn ${d.wheels?.type === opt.wheels.type ? 'active' : ''}`}
              onClick={() => setMovement(opt)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={opt.label}
            >
              <span>{opt.icon}</span>
              <span>{opt.label}</span>
            </motion.button>
          ))}
        </motion.div>
        <label className="vrd-slider-field">
          <span>Wheel count · {wheelCount}</span>
          <input type="range" min={2} max={8} step={2} value={wheelCount} onChange={(e) => setWheelCount(Number(e.target.value))} />
        </label>
        <label className="vrd-slider-field">
          <span>
            Motor power · {motorVal}%
            {motorVal >= 85 ? ' · Turbo' : motorVal >= 60 ? ' · Strong' : motorVal >= 35 ? ' · Balanced' : ' · Weak'}
          </span>
          <input type="range" min={10} max={100} value={motorVal} onChange={(e) => setMotorPower(Number(e.target.value))} />
        </label>
      </HoloPanel>

      <HoloPanel title="Sensors" icon="📡" defaultOpen>
        <motion.div className="vrd-sensor-list">
          {visibleSensors.map((s) => (
            <motion.label
              key={s.key}
              className={`vrd-sensor-check ${d.sensors?.[s.key] ? 'active' : ''}`}
              whileTap={{ scale: 0.98 }}
              title={s.desc}
            >
              <input type="checkbox" checked={!!d.sensors?.[s.key]} onChange={() => toggleSensor(s.key)} />
              <span className="vrd-sensor-check-box">{d.sensors?.[s.key] ? '☑' : '☐'}</span>
              <span>{s.label}</span>
            </motion.label>
          ))}
        </motion.div>
        <button type="button" className="vrd-show-more" onClick={() => setShowMoreSensors((s) => !s)}>
          {showMoreSensors ? 'Show fewer' : `Show ${SENSOR_OPTS.length - 5} more ▼`}
        </button>
        <p className="vrd-hint">Sensors: {activeSensors} active</p>
      </HoloPanel>

      <HoloPanel title="Tools" icon="🦾" defaultOpen={false}>
        <motion.div className="vrd-movement-toggle">
          {TOOL_OPTS.map((opt) => {
            const on = opt.key === 'pincer' ? d.tools?.pincer : opt.key === 'gripper' ? d.tools?.gripper : d.tools?.bulldozer;
            return (
              <motion.button
                key={opt.key}
                type="button"
                className={`vrd-movement-btn ${on ? 'active' : ''}`}
                onClick={() => toggleTool(opt)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {opt.label}
              </motion.button>
            );
          })}
        </motion.div>
      </HoloPanel>
    </>
  );
}
