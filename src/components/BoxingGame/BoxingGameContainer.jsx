/**
 * BoxingGameContainer — integrates scene, UI, state, and round flow.
 */
import React, { useState, useCallback } from 'react';
import BoxingGameScene from './BoxingGameScene.jsx';
import { BoxingGameUI } from './BoxingGameUI.jsx';
import { useBoxingGameStore } from './BoxingGameState.js';
import './BoxingGame.css';

export default function BoxingGameContainer({ robotName = 'STRIKER' }) {
  const [running, setRunning] = useState(false);
  const reset = useBoxingGameStore((s) => s.reset);

  const handleStart = useCallback(() => {
    setRunning(true);
  }, []);

  const handleReset = useCallback(() => {
    reset();
    setRunning(true);
  }, [reset]);

  return (
    <div className="boxing-game-page">
      <BoxingGameScene robotName={robotName} running={running} onStart={handleStart} onReset={handleReset} />
    </div>
  );
}

export { BoxingGameContainer };
