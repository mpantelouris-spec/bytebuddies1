import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const BURSTS = 14;

/** CSS particle burst on successful part snap */
export default function SnapParticles({ active }) {
  const particles = useMemo(
    () => Array.from({ length: BURSTS }, (_, i) => ({
      id: i,
      angle: (i / BURSTS) * Math.PI * 2,
      dist: 40 + (i % 5) * 12,
      color: i % 3 === 0 ? '#00FF41' : i % 3 === 1 ? '#00D9FF' : '#1E90FF',
      size: 6 + (i % 4) * 2,
    })),
    [],
  );

  if (!active) return null;

  return (
    <div className="rd-snap-particles" aria-hidden>
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="rd-snap-particle"
          style={{
            width: p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 12px ${p.color}`,
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos(p.angle) * p.dist,
            y: Math.sin(p.angle) * p.dist,
            opacity: 0,
            scale: 0.2,
          }}
          transition={{ duration: 0.55, ease: [0.2, 0.8, 0.2, 1] }}
        />
      ))}
    </div>
  );
}
