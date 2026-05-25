import React, { useEffect, useRef } from 'react';

export default function TestArenaMissionLog({ lines, activeStep }) {
  const endRef = useRef(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines.length]);

  return (
    <footer className="ta-log" aria-live="polite">
      <span className="ta-log-label">Mission log</span>
      <div className="ta-log-scroll">
        {lines.map((line, i) => {
          const isActive = i === lines.length - 1 && activeStep;
          const kind = line.includes('obstacle') || line.includes('⚠')
            ? 'warn'
            : line.includes('complete') || line.includes('✓')
              ? 'ok'
              : line.includes('go!') || line.includes('started')
                ? 'go'
                : 'info';
          return (
            <div
              key={`${line}-${i}`}
              className={`ta-log-line ta-log-line--${kind} ${isActive ? 'ta-log-line--active' : ''}`}
            >
              {line.replace(/^>\s*/, '')}
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
    </footer>
  );
}
