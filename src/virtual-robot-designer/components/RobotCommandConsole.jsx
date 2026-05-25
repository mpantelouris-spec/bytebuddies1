import React, { useEffect, useState } from 'react';
import { migrateDesign } from '../config.js';

const BOOT = [
  'ByteBuddies Robotics OS v3.1',
  'Initializing virtual chassis…',
  'Loading sensor drivers…',
  'Awaiting engineer commands.',
];

export default function RobotCommandConsole({ design, onTest, onGenerate, generating, genMsg }) {
  const d = migrateDesign(design);
  const [lines, setLines] = useState(BOOT);

  useEffect(() => {
    const extras = [];
    if (d.template) extras.push(`> template: ${d.template.toUpperCase()}`);
    if (d.wheels?.type) extras.push(`> locomotion: ${d.wheels.type}`);
    if (d.name) extras.push(`> unit_id: "${d.name}"`);
    setLines([...BOOT, ...extras]);
  }, [d.template, d.wheels?.type, d.name]);

  useEffect(() => {
    if (generating && genMsg) {
      setLines((prev) => [...prev.slice(-12), `> AI: ${genMsg}`]);
    }
  }, [generating, genMsg]);

  return (
    <div className="vrd-console">
      <div className="vrd-console-header">
        <span>⌨ ROBOT COMMAND TERMINAL</span>
        <span className="vrd-console-blink">_</span>
      </div>
      <div className="vrd-console-body">
        {lines.map((line) => (
          <div key={line} className="vrd-console-line">{line}</div>
        ))}
      </div>
      <div className="vrd-console-actions">
        <button type="button" className="vrd-console-btn vrd-console-btn--gen" disabled={generating} onClick={onGenerate}>
          {generating ? '⏳ AI PROCESSING…' : '🤖 GENERATE VARIANTS'}
        </button>
        <button type="button" className="vrd-console-btn vrd-console-btn--sim" onClick={onTest}>
          ⚡ RUN SIMULATION
        </button>
      </div>
    </div>
  );
}
