/**
 * MODERN UI POLISH — Glowing buttons, smooth animations, premium appearance
 */
export const uiPolishStyles = `
/* ─────────────────────────────────────────────────────────────────── */
/* GLOWING BUTTONS */
/* ─────────────────────────────────────────────────────────────────── */

.bb-btn {
  position: relative;
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  backdrop-filter: blur(10px);
  text-transform: uppercase;
  letter-spacing: 1px;
  overflow: hidden;
}

.bb-btn::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s;
}

.bb-btn:hover::before {
  opacity: 1;
}

.bb-btn-primary {
  background: linear-gradient(135deg, #00d9ff 0%, #0099ff 100%);
  color: #ffffff;
  box-shadow: 0 0 20px rgba(0, 217, 255, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(0, 217, 255, 0.6);
}

.bb-btn-primary:hover {
  box-shadow: 0 0 30px rgba(0, 217, 255, 0.8), inset 0 0 30px rgba(255, 255, 255, 0.2);
  transform: translateY(-3px);
  background: linear-gradient(135deg, #00ffff 0%, #00bbff 100%);
}

.bb-btn-primary:active {
  transform: translateY(-1px) scale(0.98);
}

.bb-btn-success {
  background: linear-gradient(135deg, #00ff88 0%, #00cc66 100%);
  color: #000000;
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.6);
}

.bb-btn-success:hover {
  box-shadow: 0 0 30px rgba(0, 255, 136, 0.8), inset 0 0 30px rgba(255, 255, 255, 0.2);
  transform: translateY(-3px);
}

.bb-btn-danger {
  background: linear-gradient(135deg, #ff3366 0%, #dd0000 100%);
  color: #ffffff;
  box-shadow: 0 0 20px rgba(255, 51, 102, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 51, 102, 0.6);
}

.bb-btn-danger:hover {
  box-shadow: 0 0 30px rgba(255, 51, 102, 0.8), inset 0 0 30px rgba(255, 255, 255, 0.2);
  transform: translateY(-3px);
}

.bb-btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.05);
}

.bb-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: inset 0 0 15px rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

/* ─────────────────────────────────────────────────────────────────── */
/* CARD STYLING */
/* ─────────────────────────────────────────────────────────────────── */

.bb-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.05);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.bb-card:hover {
  box-shadow: 0 12px 48px rgba(0, 217, 255, 0.3), inset 0 0 30px rgba(255, 255, 255, 0.1);
  transform: translateY(-8px);
  border-color: rgba(0, 217, 255, 0.4);
  background: linear-gradient(135deg, rgba(0, 217, 255, 0.08) 0%, rgba(0, 153, 255, 0.04) 100%);
}

/* ─────────────────────────────────────────────────────────────────── */
/* PROGRESS BAR ANIMATION */
/* ─────────────────────────────────────────────────────────────────── */

.bb-progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(0, 217, 255, 0.3);
  position: relative;
}

.bb-progress-bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, #00d9ff, #00ff88, #00d9ff);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

.bb-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00d9ff 0%, #00ff88 50%, #00d9ff 100%);
  background-size: 200% 100%;
  border-radius: 4px;
  box-shadow: 0 0 10px rgba(0, 217, 255, 0.8);
  transition: width 0.3s ease;
  animation: progessShimmer 2s infinite;
}

@keyframes shimmer {
  0%, 100% { background-position: 200% 0; }
  50% { background-position: -200% 0; }
}

@keyframes progessShimmer {
  0%, 100% { background-position: 200% 0; }
  50% { background-position: -200% 0; }
}

/* ─────────────────────────────────────────────────────────────────── */
/* STATS DISPLAYS */
/* ─────────────────────────────────────────────────────────────────── */

.bb-stat {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: rgba(0, 217, 255, 0.05);
  border: 1px solid rgba(0, 217, 255, 0.2);
  border-radius: 12px;
  animation: statGlow 2s ease-in-out infinite;
}

.bb-stat-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #aaa;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.bb-stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #00ff88;
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.6);
  font-family: 'Courier New', monospace;
}

@keyframes statGlow {
  0%, 100% {
    box-shadow: inset 0 0 10px rgba(0, 217, 255, 0.1);
  }
  50% {
    box-shadow: inset 0 0 20px rgba(0, 217, 255, 0.2);
  }
}

/* ─────────────────────────────────────────────────────────────────── */
/* CHALLENGE CARDS */
/* ─────────────────────────────────────────────────────────────────── */

.bb-challenge-card {
  position: relative;
  padding: 20px;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(0, 217, 255, 0.3);
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  background-image: linear-gradient(135deg, rgba(0, 217, 255, 0.1) 0%, rgba(0, 153, 255, 0.05) 100%);
}

.bb-challenge-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.bb-challenge-card:hover::before {
  left: 100%;
}

.bb-challenge-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 12px 40px rgba(0, 217, 255, 0.4), inset 0 0 30px rgba(0, 217, 255, 0.1);
  border-color: rgba(0, 217, 255, 0.8);
}

.bb-challenge-icon {
  font-size: 3rem;
  margin-bottom: 12px;
  display: inline-block;
  animation: iconFloat 3s ease-in-out infinite;
}

@keyframes iconFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

.bb-challenge-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
}

.bb-challenge-desc {
  font-size: 0.9rem;
  color: #aaa;
  margin-bottom: 12px;
}

.bb-challenge-difficulty {
  display: inline-block;
  padding: 6px 12px;
  background: rgba(0, 217, 255, 0.2);
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #00d9ff;
  border: 1px solid rgba(0, 217, 255, 0.4);
}

/* ─────────────────────────────────────────────────────────────────── */
/* BLOCKLY BLOCK STYLING */
/* ─────────────────────────────────────────────────────────────────── */

.blocklyBlock {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4) !important;
  border-radius: 8px !important;
  transition: all 0.2s ease !important;
}

.blocklyBlock:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6) !important;
  transform: scale(1.02);
}

.blocklyBlock:active {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3) !important;
}

/* Gradient backgrounds for block categories */
.blocklyBlockCanvas .blockly_block_execute {
  background: linear-gradient(135deg, #4C97FF 0%, #357AFF 100%) !important;
  box-shadow: 0 4px 15px rgba(76, 151, 255, 0.4) !important;
}

.blocklyBlockCanvas .blockly_block_logic {
  background: linear-gradient(135deg, #59C059 0%, #3d9d3d 100%) !important;
}

.blocklyBlockCanvas .blockly_block_control {
  background: linear-gradient(135deg, #CF8B17 0%, #a86d0f 100%) !important;
}

.blocklyBlockCanvas .blockly_block_event {
  background: linear-gradient(135deg, #E6A817 0%, #bf8d0f 100%) !important;
}

/* ─────────────────────────────────────────────────────────────────── */
/* PARTICLE EFFECT */
/* ─────────────────────────────────────────────────────────────────── */

.bb-particle {
  position: fixed;
  pointer-events: none;
  animation: particleFall 1.5s ease-out forwards;
}

@keyframes particleFall {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateY(100px) scale(0.5);
  }
}

/* ─────────────────────────────────────────────────────────────────── */
/* RESPONSIVE SCALE */
/* ─────────────────────────────────────────────────────────────────── */

@media (max-width: 768px) {
  .bb-btn {
    padding: 10px 16px;
    font-size: 0.9rem;
  }

  .bb-card {
    padding: 16px;
    border-radius: 12px;
  }

  .bb-challenge-card {
    padding: 12px;
  }
}
`;

// ─────────────────────────────────────────────────────────────────────────────
// REACT COMPONENTS FOR ENHANCED UI
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';

export function PremiumButton({
  children,
  variant = 'primary',
  onClick,
  className = '',
  ...props
}) {
  return (
    <button
      className={`bb-btn bb-btn-${variant} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

export function PremiumCard({
  children,
  className = '',
  onClick,
  ...props
}) {
  return (
    <div
      className={`bb-card ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

export function ChallengeCard({
  icon,
  title,
  description,
  difficulty = 'Easy',
  onClick,
}) {
  return (
    <div className="bb-challenge-card" onClick={onClick}>
      <div className="bb-challenge-icon">{icon}</div>
      <h3 className="bb-challenge-title">{title}</h3>
      <p className="bb-challenge-desc">{description}</p>
      <span className="bb-challenge-difficulty">{difficulty}</span>
    </div>
  );
}

export function StatDisplay({
  label,
  value,
  unit = '',
}) {
  return (
    <div className="bb-stat">
      <span className="bb-stat-label">{label}</span>
      <span className="bb-stat-value">{value}{unit}</span>
    </div>
  );
}

export function ProgressBar({
  progress = 0,
  max = 100,
}) {
  const percentage = (progress / max) * 100;
  return (
    <div className="bb-progress-bar">
      <div
        className="bb-progress-fill"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

// Inject CSS
if (typeof window !== 'undefined' && !document.getElementById('bb-ui-polish')) {
  const style = document.createElement('style');
  style.id = 'bb-ui-polish';
  style.textContent = uiPolishStyles;
  document.head.appendChild(style);
}
