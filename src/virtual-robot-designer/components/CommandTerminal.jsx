/**
 * CommandTerminal.jsx
 * Bottom-sliding command terminal — live robot log output.
 * Feels like a real robotics OS console.
 */

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LINE_TYPES = {
  sys:  'sys',
  ai:   'ai',
  warn: 'warn',
  err:  'err',
  info: 'info',
  ok:   null,   // default green
};

/** Generate ambient robot "thinking" logs */
function generateAmbientLog(design) {
  const slots      = design?.assembly?.slots  || {};
  const hasLidar   = slots.front?.partId === 'lidar' || slots.top?.partId === 'lidar';
  const hasCamera  = slots.head?.category === 'head';
  const movType    = slots.movement?.partId;
  const hasPower   = !!slots.back;
  const buildMode  = design?.assembly?.buildMode || 'advanced';

  const pool = [
    { text: '> ai core tick — nominal',                          type: 'ai'  },
    { text: '> neural pathfinding — calculating routes',         type: 'ai'  },
    { text: `> drive system: ${movType || 'unassigned'}`,        type: 'sys' },
    { text: '> gyroscope calibrating...',                        type: 'sys' },
    { text: '> environment scan — 0 threats detected',           type: null  },
    { text: '> motor encoders nominal',                          type: 'sys' },
    { text: '> system heartbeat — all processes nominal',              type: 'info'},
    { text: '> battery voltage stable',                          type: null  },
    ...(hasLidar  ? [
      { text: '> lidar array online — 360° sweep active',        type: null  },
      { text: '> obstacle detected at 2.3m — rerouting',        type: 'warn' },
      { text: '> lidar map updated — 47 nodes',                  type: 'ai'  },
    ] : []),
    ...(hasCamera ? [
      { text: '> camera stream active — 1080p@60fps',            type: 'sys' },
      { text: '> object recognition — 3 targets tracked',        type: 'ai'  },
      { text: '> visual AI confidence: 94.2%',                   type: 'ai'  },
    ] : []),
    ...(hasPower  ? [
      { text: '> power cell nominal — 88% capacity',             type: null  },
      { text: '> thermal regulator holding 42°C',                type: 'sys' },
    ] : []),
    ...(buildMode === 'blocks' ? [
      { text: '> modular block config loaded',                   type: 'sys' },
      { text: '> block connector integrity: 100%',               type: null  },
    ] : []),
    { text: '> ai pathfinding — optimal route calculated',       type: 'ai'  },
    { text: '> sensor fusion update — latency 4ms',              type: null  },
    { text: '> comms link established — 5G uplink',              type: 'sys' },
    { text: '> servo torque within spec',                        type: null  },
  ];

  return pool[Math.floor(Math.random() * pool.length)];
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════ */
export default function CommandTerminal({ lines, design }) {
  const [collapsed, setCollapsed] = useState(false);
  const [allLines, setAllLines]   = useState(() => [
    { text: '> bytebuddies robotics os v4.2.0 — boot sequence complete',     type: 'sys'  },
    { text: '> virtual assembly chamber initialised',                          type: 'sys'  },
    { text: '> loading robot configuration...',                                type: null   },
    { text: '> assembly platform calibrated — robot centred',                  type: null   },
    { text: '> ai core online — awaiting build instructions',                  type: 'ai'   },
    { text: '> select parts from the left panel to begin assembly',            type: 'info' },
  ]);
  const bodyRef = useRef();
  const tickRef = useRef(0);

  // Absorb external log lines
  useEffect(() => {
    if (!lines || lines.length === 0) return;
    const lastLine = lines[lines.length - 1];
    if (!lastLine) return;
    setAllLines(prev => [...prev.slice(-40), { text: lastLine, type: null }]);
  }, [lines]);

  // Ambient auto-logging
  useEffect(() => {
    const interval = setInterval(() => {
      tickRef.current += 1;
      if (tickRef.current % 4 === 0) {
        const entry = generateAmbientLog(design);
        setAllLines(prev => [...prev.slice(-40), entry]);
      }
    }, 1800);
    return () => clearInterval(interval);
  }, [design]);

  // Auto scroll to bottom
  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [allLines]);

  return (
    <div className={`hangar-terminal${collapsed ? ' collapsed' : ''}`}>
      {/* Handle bar */}
      <div className="terminal-handle" onClick={() => setCollapsed(c => !c)}>
        <div className="terminal-handle-label">
          <span className="terminal-blink" />
          ROBOT COMMAND TERMINAL
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 8, letterSpacing: '1.5px', color: 'rgba(0,255,130,0.55)' }}>
            {allLines.length} ENTRIES
          </span>
          <button className="terminal-toggle-btn">
            {collapsed ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {/* Terminal body */}
      <div className="terminal-body" ref={bodyRef}>
        {allLines.map((line, i) => (
          <span
            key={i}
            className={`terminal-line${line.type ? ` ${line.type}` : ''}`}
          >
            {line.text}
          </span>
        ))}
      </div>
    </div>
  );
}
