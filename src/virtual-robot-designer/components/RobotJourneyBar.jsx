import React from 'react';
import { motion } from 'framer-motion';

const STEPS = [
  { id: 'create', num: 1, label: 'Create Your Robot', icon: '🎨' },
  { id: 'program', num: 2, label: 'Program It', icon: '⌨' },
  { id: 'test', num: 3, label: 'Test It', icon: '🚀' },
];

export default function RobotJourneyBar({ activeStep = 'create', buildMode, onCreate, onProgram, onTest }) {
  const styleLabel = buildMode === 'blocks' ? 'LEGO' : 'Real';

  const handlers = { create: onCreate, program: onProgram, test: onTest };

  return (
    <div className="vrd-journey">
      <div className="vrd-journey-style">
        <span className="vrd-journey-style-badge">{buildMode === 'blocks' ? '🧱' : '🤖'} {styleLabel} Robot</span>
      </div>
      <div className="vrd-journey-steps">
        {STEPS.map((step, i) => {
          const isActive = activeStep === step.id;
          const isDone = STEPS.findIndex((s) => s.id === activeStep) > i;
          return (
            <React.Fragment key={step.id}>
              {i > 0 && <div className={`vrd-journey-line ${isDone ? 'done' : ''}`} aria-hidden />}
              <motion.button
                type="button"
                className={`vrd-journey-step ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}
                onClick={() => handlers[step.id]?.()}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="vrd-journey-num">{isDone ? '✓' : step.num}</span>
                <span className="vrd-journey-icon">{step.icon}</span>
                <span className="vrd-journey-label">{step.label}</span>
              </motion.button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
