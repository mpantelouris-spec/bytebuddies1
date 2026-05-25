import { useState, useEffect } from 'react';

export function detectWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext
      && (canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

export function useWebGL() {
  const [supported, setSupported] = useState(true);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setSupported(detectWebGL());
    setChecked(true);
  }, []);

  return { supported, checked };
}
