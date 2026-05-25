import React from 'react';

export default function WebGLFallback({ onRetry }) {
  return (
    <div className="vrd-webgl-fallback">
      <div className="vrd-webgl-fallback-card">
        <span className="vrd-webgl-fallback-icon" aria-hidden>🤖</span>
        <h1>3D graphics not available</h1>
        <p>
          Your browser could not start WebGL, which powers the robot build studio.
          Try updating your browser, enabling hardware acceleration, or use another device.
        </p>
        <button type="button" className="vrd-webgl-fallback-btn" onClick={onRetry}>
          Try again
        </button>
        <p className="vrd-webgl-fallback-link">
          You can still use ByteBuddies lessons and coding at{' '}
          <a href="https://bytebuddies.technology/">bytebuddies.technology</a>
        </p>
      </div>
    </div>
  );
}
