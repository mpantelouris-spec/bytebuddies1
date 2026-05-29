import React, { useState, useCallback } from 'react';
import AcademyExperience from './components/AcademyExperience.jsx';
import WebGLFallback from './components/common/WebGLFallback.jsx';
import { useWebGL, detectWebGL } from './hooks/useWebGL.js';
import './styles/vrd-theme.css';
import './styles/theme.css';

/**
 * Virtual Robot Designer — Robotics Academy product UI.
 */
export default function VirtualRobotDesignerApp() {
  const { supported, checked } = useWebGL();
  const [retry, setRetry] = useState(0);

  const handleRetry = useCallback(() => {
    setRetry((n) => n + 1);
    if (detectWebGL()) window.location.reload();
  }, []);

  if (checked && !supported) {
    return (
      <div className="vrd-app vrd-app--product">
        <WebGLFallback onRetry={handleRetry} key={retry} />
      </div>
    );
  }

  return (
    <div className="vrd-app vrd-app--product vrd-app--academy">
      <AcademyExperience />
    </div>
  );
}
