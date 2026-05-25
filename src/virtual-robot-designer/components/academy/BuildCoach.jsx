import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBuildHint } from '../../utils/build-slots.js';
import { migrateAssembly } from '../../services/assembly-service.js';

export default function BuildCoach({ design, isArm }) {
  const asm = migrateAssembly(design);
  const hint = getBuildHint(asm, isArm);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={hint.step}
        className="bb-build-coach"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
      >
        <span className="bb-build-coach-step">{hint.step} / 3</span>
        <div>
          <p className="bb-build-coach-title">{hint.message}</p>
          <p className="bb-build-coach-detail">{hint.detail}</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
