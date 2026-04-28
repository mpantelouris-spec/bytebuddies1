import React, { useLayoutEffect, useRef } from 'react';
import Blockly from 'blockly';
import 'blockly/blocks';
import { defineBytebuddiesBlocks } from '../utils/blocklySetup';
import { emitAddSidebarBlock } from '../utils/blockLibraryEvents';
import { toolboxBlockJsonForLibraryEntry } from '../utils/blocklyToolboxEntries';
import { BLOCKLY_TYPE_TO_SIDEBAR_NAME } from '../data/sharedBlocklyToolbox';

function categoriesToToolbox(categories = []) {
  return {
    kind: 'categoryToolbox',
    contents: categories.map((cat) => ({
      kind: 'category',
      name: cat.name,
      colour: cat.color || '#4C97FF',
      contents: (cat.blocks || []).map((name) => toolboxBlockJsonForLibraryEntry(name)),
    })),
  };
}

export default function BlocklySidebarFlyout({ categories = [] }) {
  const hostRef = useRef(null);
  const workspaceRef = useRef(null);

  useLayoutEffect(() => {
    defineBytebuddiesBlocks();
    if (!hostRef.current) return undefined;

    if (workspaceRef.current) {
      try {
        workspaceRef.current.dispose();
      } catch (e) {
        /* ignore */
      }
      workspaceRef.current = null;
    }

    const ws = Blockly.inject(hostRef.current, {
      toolbox: categoriesToToolbox(categories),
      trashcan: false,
      toolboxPosition: 'start',
      move: { scrollbars: true, drag: false, wheel: true },
      zoom: { controls: false, wheel: false, startScale: 0.9, minScale: 0.7, maxScale: 1.2 },
      sounds: false,
      media: '/blockly-media/',
      renderer: 'zelos',
      theme: Blockly.Themes.Zelos,
    });
    workspaceRef.current = ws;

    const bumpSize = () => {
      try {
        Blockly.svgResize(ws);
      } catch (e) {
        /* ignore */
      }
    };
    requestAnimationFrame(() => {
      bumpSize();
      requestAnimationFrame(bumpSize);
    });
    setTimeout(bumpSize, 80);
    setTimeout(bumpSize, 400);
    const ro = typeof ResizeObserver !== 'undefined' && hostRef.current
      ? new ResizeObserver(() => bumpSize())
      : null;
    if (ro && hostRef.current) ro.observe(hostRef.current);
    window.addEventListener('resize', bumpSize);

    const onChange = (evt) => {
      if (evt.type !== Blockly.Events.BLOCK_CREATE) return;
      const blockId = evt.blockId || (Array.isArray(evt.ids) ? evt.ids[0] : null);
      if (!blockId) return;
      const block = ws.getBlockById(blockId);
      if (!block) return;
      let name = block.getFieldValue('BLOCK_NAME');
      if (!name && BLOCKLY_TYPE_TO_SIDEBAR_NAME[block.type]) {
        name = BLOCKLY_TYPE_TO_SIDEBAR_NAME[block.type];
      }
      if (name) emitAddSidebarBlock(String(name));
      block.dispose(false);
    };
    ws.addChangeListener(onChange);

    return () => {
      window.removeEventListener('resize', bumpSize);
      if (ro) ro.disconnect();
      ws.removeChangeListener(onChange);
      ws.dispose();
      workspaceRef.current = null;
    };
  }, [categories]);

  return (
    <div
      ref={hostRef}
      className="blockly-container"
      style={{ height: '100%', width: '100%', minHeight: 280, flex: 1, minWidth: 0 }}
    />
  );
}
