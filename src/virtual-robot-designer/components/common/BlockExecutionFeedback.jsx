/**
 * LIVE BLOCK EXECUTION FEEDBACK — Visual highlights and effects
 * Shows which block is executing in real-time
 */
import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────────────────────
// BLOCK EXECUTION HIGHLIGHTER
// ─────────────────────────────────────────────────────────────────────────────

export class BlockExecutionTracker {
  constructor() {
    this.currentBlock = null;
    this.executionStack = [];
    this.listeners = new Set();
  }

  onBlockStart(blockId) {
    this.currentBlock = blockId;
    this.executionStack.push(blockId);
    this.notifyListeners('blockStart', blockId);
    this.highlightBlock(blockId);
  }

  onBlockEnd(blockId) {
    this.executionStack = this.executionStack.filter(id => id !== blockId);
    this.notifyListeners('blockEnd', blockId);
    this.unhighlightBlock(blockId);
  }

  highlightBlock(blockId) {
    const block = Blockly.getMainWorkspace()?.getBlockById?.(blockId);
    if (!block) return;

    // Add glow effect
    block.svgPath_.style.filter = 'drop-shadow(0 0 8px rgba(0, 217, 255, 0.8))';
    block.svgPath_.style.strokeWidth = '3';

    // Pulse animation
    this.pulseBlock(block);
  }

  unhighlightBlock(blockId) {
    const block = Blockly.getMainWorkspace()?.getBlockById?.(blockId);
    if (!block) return;

    block.svgPath_.style.filter = 'none';
    block.svgPath_.style.strokeWidth = '1';
  }

  pulseBlock(block) {
    // Add pulse animation class
    if (block.svgPath_.style.animation) {
      block.svgPath_.style.animation = 'none';
    }
    setTimeout(() => {
      block.svgPath_.style.animation = 'blockPulse 0.6s ease-out';
    }, 10);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners(event, blockId) {
    this.listeners.forEach(listener => listener(event, blockId));
  }
}

// Global instance
export const blockExecutionTracker = new BlockExecutionTracker();

// ─────────────────────────────────────────────────────────────────────────────
// BLOCK EXECUTION STYLES
// ─────────────────────────────────────────────────────────────────────────────

export const blockExecutionStyles = `
@keyframes blockPulse {
  0% {
    stroke-width: 3;
    filter: drop-shadow(0 0 8px rgba(0, 217, 255, 0.8));
  }
  50% {
    stroke-width: 2;
    filter: drop-shadow(0 0 12px rgba(0, 217, 255, 1));
  }
  100% {
    stroke-width: 1;
    filter: drop-shadow(0 0 4px rgba(0, 217, 255, 0.4));
  }
}

@keyframes blockExecuting {
  0%, 100% {
    filter: drop-shadow(0 0 4px rgba(0, 217, 255, 0.4));
  }
  50% {
    filter: drop-shadow(0 0 12px rgba(0, 217, 255, 0.9));
  }
}

.blockly-block-executing {
  animation: blockExecuting 0.8s ease-in-out infinite !important;
}

.blockly-sensor-read {
  filter: drop-shadow(0 0 8px rgba(255, 200, 100, 0.7)) !important;
}

.blockly-loop-active {
  filter: drop-shadow(0 0 8px rgba(100, 200, 255, 0.7)) !important;
  stroke: #00d9ff !important;
  stroke-width: 2 !important;
}
`;

// ─────────────────────────────────────────────────────────────────────────────
// REAL-TIME BLOCK STATUS DISPLAY
// ─────────────────────────────────────────────────────────────────────────────

export function BlockStatusPanel({ executingBlock, loopCount = 0 }) {
  const [status, setStatus] = useState('Idle');

  useEffect(() => {
    if (executingBlock) {
      const blockName = executingBlock.replace(/_/g, ' ').toUpperCase();
      if (loopCount > 0) {
        setStatus(`🔁 Loop ${loopCount}: ${blockName}`);
      } else {
        setStatus(`▶ Executing: ${blockName}`);
      }
    } else {
      setStatus('⏹ Ready');
    }
  }, [executingBlock, loopCount]);

  return (
    <div className="bb-block-status">
      <div className="bb-block-status-label">Current Block:</div>
      <div className="bb-block-status-value">{status}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3D EXECUTION INDICATOR
// ─────────────────────────────────────────────────────────────────────────────

export function ExecutionIndicator3D({ active = false, position = [0, 2, 0] }) {
  const ref = useRef();
  const rotationRef = useRef(0);

  useFrame((state, delta) => {
    if (!ref.current || !active) return;

    rotationRef.current += delta * 4;
    ref.current.rotation.z = rotationRef.current;
    ref.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
  });

  if (!active) return null;

  return (
    <group ref={ref} position={position}>
      <mesh>
        <torusGeometry args={[0.6, 0.1, 16, 32]} />
        <meshBasicMaterial
          color="#00d9ff"
          emissive="#0099ff"
        />
      </mesh>
      <mesh scale={[0.7, 0.7, 0.7]}>
        <torusGeometry args={[0.6, 0.1, 16, 32]} />
        <meshBasicMaterial
          color="#00ff88"
          emissive="#00cc66"
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SENSOR READING FEEDBACK
// ─────────────────────────────────────────────────────────────────────────────

export function SensorReadingFeedback({ sensorType, value, position }) {
  const ref = useRef();
  const lifeRef = useRef(1);

  useFrame((state, delta) => {
    if (!ref.current) return;

    lifeRef.current -= delta;
    if (lifeRef.current <= 0) return;

    ref.current.position.y += delta * 0.5;
    ref.current.material.opacity = lifeRef.current;
  });

  const colors = {
    ultrasonic: '#ff6b6b',
    lidar: '#00d9ff',
    camera: '#ffff00',
    ir: '#ff00ff',
  };

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.2, 8, 8]} />
      <meshBasicMaterial
        color={colors[sensorType] || '#ffffff'}
        emissive={colors[sensorType] || '#ffffff'}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BLOCK EXECUTION FLOW VISUALIZATION
// ─────────────────────────────────────────────────────────────────────────────

export function ExecutionFlow({ steps = [] }) {
  return (
    <div className="bb-execution-flow">
      {steps.map((step, i) => (
        <div
          key={i}
          className={`bb-flow-step ${step.active ? 'active' : ''} ${step.completed ? 'completed' : ''}`}
        >
          <div className="bb-flow-step-number">{i + 1}</div>
          <div className="bb-flow-step-name">{step.name}</div>
          {i < steps.length - 1 && <div className="bb-flow-arrow">→</div>}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES FOR EXECUTION FEEDBACK
// ─────────────────────────────────────────────────────────────────────────────

export const executionFeedbackStyles = `
.bb-block-status {
  background: rgba(0, 217, 255, 0.1);
  border: 1px solid rgba(0, 217, 255, 0.3);
  border-radius: 8px;
  padding: 12px;
  margin: 8px 0;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
}

.bb-block-status-label {
  color: #888;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 4px;
}

.bb-block-status-value {
  color: #00ff88;
  font-weight: 700;
  font-size: 1.1rem;
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
}

.bb-execution-flow {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  overflow-x: auto;
  margin: 12px 0;
}

.bb-flow-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px;
  border-radius: 6px;
  background: rgba(100, 100, 100, 0.2);
  border: 1px solid rgba(100, 100, 100, 0.3);
  min-width: 70px;
  text-align: center;
  transition: all 0.3s ease;
  color: #999;
}

.bb-flow-step.active {
  background: rgba(0, 217, 255, 0.3);
  border-color: rgba(0, 217, 255, 0.8);
  box-shadow: 0 0 15px rgba(0, 217, 255, 0.5);
  animation: flowPulse 0.8s ease-in-out infinite;
  color: #00d9ff;
}

.bb-flow-step.completed {
  background: rgba(0, 255, 136, 0.2);
  border-color: rgba(0, 255, 136, 0.6);
  color: #00ff88;
}

.bb-flow-step-number {
  font-weight: 700;
  font-size: 1rem;
}

.bb-flow-step-name {
  font-size: 0.7rem;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.bb-flow-arrow {
  margin: 0 4px;
  color: #00d9ff;
  font-weight: 700;
  animation: arrowFlow 1s ease-in-out infinite;
}

@keyframes flowPulse {
  0%, 100% {
    box-shadow: 0 0 10px rgba(0, 217, 255, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(0, 217, 255, 0.9);
  }
}

@keyframes arrowFlow {
  0%, 100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(4px);
  }
}
`;

// Inject CSS
if (typeof window !== 'undefined' && !document.getElementById('bb-execution-feedback')) {
  const style = document.createElement('style');
  style.id = 'bb-execution-feedback';
  style.textContent = blockExecutionStyles + executionFeedbackStyles;
  document.head.appendChild(style);
}
