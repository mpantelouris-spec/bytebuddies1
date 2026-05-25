import React from 'react';
import { migrateAssembly } from '../services/assembly-service.js';
import { countPlacedParts } from '../services/assembly-service.js';
import { countBlocks } from '../services/block-service.js';

const STEPS = {
  advanced: [
    { id: 'body', label: 'Pick your robot body' },
    { id: 'movement', label: 'Add wheels or tracks' },
    { id: 'modules', label: 'Add sensors & tools' },
    { id: 'program', label: 'Program your robot' },
    { id: 'test', label: 'Test in simulator' },
  ],
  blocks: [
    { id: 'base', label: 'Snap LEGO blocks on the grid' },
    { id: 'modules', label: 'Add wheels, motors & sensors' },
    { id: 'stack', label: 'Build upward in layers' },
    { id: 'program', label: 'Program your robot' },
    { id: 'test', label: 'Test in simulator' },
  ],
  hybrid: [
    { id: 'chassis', label: 'Build chassis' },
    { id: 'blocks', label: 'Add blocks' },
    { id: 'program', label: 'Program' },
    { id: 'test', label: 'Test' },
  ],
};

function getProgress(buildMode, asm) {
  const parts = countPlacedParts(asm).length;
  const blocks = countBlocks(asm);
  const hasMovement = !!asm.slots?.movement || blocks > 2;

  if (buildMode === 'blocks') {
    if (blocks === 0) return 1;
    if (blocks < 4) return 2;
    if (!hasMovement) return 2;
    return blocks >= 6 ? 4 : 3;
  }
  if (buildMode === 'hybrid') {
    if (parts === 0 && blocks === 0) return 1;
    if (parts < 2) return 2;
    if (blocks < 2) return 3;
    return 4;
  }
  if (parts === 0) return 1;
  if (!asm.slots?.movement && asm.base?.shape !== 'arm') return 2;
  if (parts < 3) return 3;
  return 4;
}

export default function BuildGuide({ design, buildMode }) {
  const asm = migrateAssembly(design);
  const steps = STEPS[buildMode] || STEPS.advanced;
  const progress = getProgress(buildMode, asm);

  return (
    <div className="vrd-build-guide">
      <div className="vrd-build-guide-head">
        <span>◈ BUILD PATH</span>
        <span className="vrd-build-guide-step">{progress + 1}/{steps.length}</span>
      </div>
      <ol className="vrd-build-guide-list">
        {steps.map((step, i) => (
          <li key={step.id} className={i < progress ? 'done' : i === progress ? 'active' : ''}>
            <span className="vrd-build-guide-num">{i + 1}</span>
            <span>{step.label}</span>
          </li>
        ))}
      </ol>
      {buildMode === 'blocks' && progress >= 1 && (
        <p className="vrd-build-guide-tip">Tip: click glowing cells in the 3D chamber OR use the grid on the left</p>
      )}
    </div>
  );
}
