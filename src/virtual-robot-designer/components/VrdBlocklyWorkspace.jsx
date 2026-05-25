import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import Blockly from 'blockly';
import {
  defineVrdBlocks,
  buildVrdToolbox,
  workspaceToSteps,
  stepsToWorkspace,
} from '../utils/vrdBlocklySetup.js';

const VRD_BLOCKLY_THEME = Blockly.Theme.defineTheme('vrd_dark', {
  base: Blockly.Themes.Classic,
  componentStyles: {
    workspaceBackgroundColour: '#0A0A1A',
    toolboxBackgroundColour: '#0F0F1F',
    toolboxForegroundColour: '#F0F0F0',
    flyoutBackgroundColour: '#1A1A2E',
    flyoutForegroundColour: '#FFFFFF',
    scrollbarColour: '#5A2E8F',
    insertionMarkerColour: '#00D9FF',
    insertionMarkerOpacity: 0.4,
  },
  fontStyle: { family: 'system-ui, sans-serif', size: 12 },
});

const VrdBlocklyWorkspace = forwardRef(function VrdBlocklyWorkspace(
  { design, initialSteps, onStepsChange, height = 420 },
  ref,
) {
  const mountRef = useRef(null);
  const wsRef = useRef(null);
  const suppressRef = useRef(false);

  useImperativeHandle(ref, () => ({
    getSteps: () => workspaceToSteps(wsRef.current),
    loadSteps: (steps) => {
      suppressRef.current = true;
      stepsToWorkspace(wsRef.current, steps);
      suppressRef.current = false;
      onStepsChange?.(workspaceToSteps(wsRef.current));
    },
  }));

  useEffect(() => {
    if (!mountRef.current || wsRef.current) return;
    defineVrdBlocks();

    const ws = Blockly.inject(mountRef.current, {
      toolbox: buildVrdToolbox(design),
      theme: VRD_BLOCKLY_THEME,
      media: '/blockly-media/',
      grid: { spacing: 20, length: 3, colour: '#5A2E8F', snap: true },
      zoom: { controls: true, wheel: true, startScale: 0.95, maxScale: 1.4, minScale: 0.5 },
      trashcan: true,
      sounds: true,
      renderer: 'geras',
    });
    wsRef.current = ws;

    if (initialSteps?.length) {
      suppressRef.current = true;
      stepsToWorkspace(ws, initialSteps);
      suppressRef.current = false;
    }

    const onChange = () => {
      if (suppressRef.current) return;
      onStepsChange?.(workspaceToSteps(ws));
    };
    ws.addChangeListener(onChange);

    return () => {
      ws.dispose();
      wsRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!wsRef.current) return;
    wsRef.current.updateToolbox(buildVrdToolbox(design));
  }, [design]);

  return (
    <div className="vrd-blockly-wrap" style={{ height }}>
      <div ref={mountRef} className="vrd-blockly-mount" />
    </div>
  );
});

export default VrdBlocklyWorkspace;
