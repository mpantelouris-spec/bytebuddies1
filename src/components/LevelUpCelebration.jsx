import React, { useEffect } from 'react';
import { useUser } from '../contexts/UserContext';

const CONFETTI_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444', '#fbbf24'];

export default function LevelUpCelebration() {
  const { user, clearLevelUp } = useUser();

  useEffect(() => {
    const timer = setTimeout(clearLevelUp, 3500);
    return () => clearTimeout(timer);
  }, [clearLevelUp]);

  // Generate 40 confetti pieces with random positions/colours/delays
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: `${(Math.random() * 0.8).toFixed(2)}s`,
    duration: `${(2 + Math.random()).toFixed(1)}s`,
    size: `${6 + Math.floor(Math.random() * 8)}px`,
    rotate: `${Math.floor(Math.random() * 360)}deg`,
  }));

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      {/* Confetti */}
      {pieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.left,
            top: '-10px',
            width: p.size,
            height: p.size,
            background: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
            transform: `rotate(${p.rotate})`,
          }}
        />
      ))}

      {/* Central message */}
      <div style={{
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        color: '#fff',
        borderRadius: 24,
        padding: '28px 52px',
        fontSize: 28,
        fontWeight: 900,
        boxShadow: '0 0 60px rgba(99,102,241,0.7), 0 8px 40px rgba(0,0,0,0.4)',
        textAlign: 'center',
        animation: 'levelUpPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>⚡</div>
        <div>Level Up!</div>
        <div style={{ fontSize: 18, opacity: 0.85, marginTop: 6 }}>You're now Level {user.level}</div>
      </div>
    </div>
  );
}
