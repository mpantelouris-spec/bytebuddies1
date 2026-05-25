import React, { forwardRef } from 'react';
import TestArenaViewport from './test-arena/TestArenaViewport.jsx';
import { migrateDesign } from '../config.js';

/** @deprecated Use TestArenaViewport — kept for imports */
const SimulatorArena3D = forwardRef(function SimulatorArena3D(props, ref) {
  const d = migrateDesign(props.design);
  return (
    <div className="vrd-sim-arena3d vrd-sim-arena3d--lab">
      <TestArenaViewport ref={ref} design={d} {...props} />
    </div>
  );
});

export default SimulatorArena3D;
