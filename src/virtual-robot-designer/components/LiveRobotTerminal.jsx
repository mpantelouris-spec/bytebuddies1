import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export default function LiveRobotTerminal({ lines = [], activeStep = '', running = false, designName = 'Unit' }) {
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [lines]);

  return (
    <div className="vrd-live-terminal">
      <div className="vrd-live-terminal-head">
        <span className="vrd-live-terminal-pulse">{running ? '● LIVE' : '○ STANDBY'}</span>
        <span>ROBOT COMMAND TERMINAL · {designName}</span>
        {activeStep && <span className="vrd-live-terminal-step">exec: {activeStep}()</span>}
      </div>
      <div className="vrd-live-terminal-body" ref={bodyRef}>
        {lines.map((line, i) => (
          <motion.div
            key={`${line}-${i}`}
            className="vrd-live-terminal-line"
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15 }}
          >
            {line}
          </motion.div>
        ))}
        {running && <span className="vrd-live-terminal-cursor">▌</span>}
      </div>
    </div>
  );
}
