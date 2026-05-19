import React, { useLayoutEffect, useRef } from 'react';
import Blockly from 'blockly';
import 'blockly/blocks';
import { defineBytebuddiesBlocks } from '../utils/blocklySetup';
import { createBlockFromLibraryLabel, attachDefaultValueShadows } from '../utils/blocklyLibraryFactory';
import { lookupSidebarType } from '../utils/blocks';

const previewTheme = Blockly.Theme.defineTheme('bb_sidebar_preview', {
  base: Blockly.Themes.Zelos,
  componentStyles: {
    workspaceBackgroundColour: '#00000000',
    toolboxBackgroundColour: '#00000000',
    flyoutBackgroundColour: '#00000000',
  },
});

function stripWorkspaceChrome(host) {
  if (!host) return;
  host.style.background = 'transparent';
  host.querySelectorAll('.blocklyMainBackground').forEach((el) => {
    el.setAttribute('fill', 'transparent');
    el.setAttribute('stroke', 'none');
    el.style.display = 'none';
  });
  const svg = host.querySelector('.blocklySvg');
  if (svg) {
    svg.style.background = 'transparent';
    svg.style.overflow = 'visible';
  }
}

/**
 * Single Blockly block preview — same Zelos renderer as the main canvas, inside the accordion list.
 */
export default function SidebarBlockPreview({ blockName, categoryColor }) {
  const hostRef = useRef(null);
  const workspaceRef = useRef(null);

  useLayoutEffect(() => {
    defineBytebuddiesBlocks();
    const host = hostRef.current;
    if (!host) return undefined;

    if (workspaceRef.current) {
      try {
        workspaceRef.current.dispose();
      } catch (e) {
        /* ignore */
      }
      workspaceRef.current = null;
    }

    const ws = Blockly.inject(host, {
      readOnly: true,
      scrollbars: false,
      trashcan: false,
      sounds: false,
      media: '/blockly-media/',
      renderer: 'zelos',
      theme: previewTheme,
      zoom: {
        controls: false,
        wheel: false,
        startScale: 0.72,
        minScale: 0.72,
        maxScale: 0.72,
      },
      move: { scrollbars: false, drag: false, wheel: false },
    });
    workspaceRef.current = ws;
    host.__bbPreviewWorkspace = ws;

    const block = createBlockFromLibraryLabel(ws, blockName, {
      x: 0,
      y: 0,
      color: categoryColor || null,
    });
    if (block) {
      if (categoryColor && typeof block.setColour === 'function') {
        block.setColour(categoryColor);
      }
      attachDefaultValueShadows(ws, block);
      block.render();
      try {
        const hw = block.getHeightWidth();
        const pad = 2;
        host.style.height = `${Math.ceil(hw.height) + pad * 2}px`;
        host.style.width = `${Math.min(Math.ceil(hw.width) + pad * 2, 220)}px`;
      } catch (e) {
        host.style.minHeight = '36px';
      }
    }

    stripWorkspaceChrome(host);
    try {
      Blockly.svgResize(ws);
    } catch (e) {
      /* ignore */
    }
    requestAnimationFrame(() => stripWorkspaceChrome(host));

    return () => {
      try {
        ws.dispose();
      } catch (e) {
        /* ignore */
      }
      workspaceRef.current = null;
      delete host.__bbPreviewWorkspace;
    };
  }, [blockName, categoryColor]);

  return <div ref={hostRef} className="sidebar-blockly-preview" />;
}

export function isPaletteBlockEntry(blockName) {
  return Boolean(lookupSidebarType(blockName));
}
