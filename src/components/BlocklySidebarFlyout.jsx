import React, { useEffect, useRef } from 'react';
import Blockly from 'blockly';
import 'blockly/blocks';
import { defineBytebuddiesBlocks } from '../utils/blocklySetup';
import { emitAddSidebarBlock } from '../utils/blockLibraryEvents';

function ensureSidebarItemBlock() {
  if (Blockly.Blocks.bb_sidebar_item) return;
  Blockly.Blocks.bb_sidebar_item = {
    init: function init() {
      this.appendDummyInput().appendField(new Blockly.FieldLabelSerializable('block'), 'BLOCK_NAME');
      this.setPreviousStatement(true, null);
      this.setNextStatement(true, null);
      this.setColour('#4C97FF');
      this.setTooltip('Sidebar block');
    },
  };
}

function categoriesToToolbox(categories = []) {
  return {
    kind: 'categoryToolbox',
    contents: categories.map((cat) => ({
      kind: 'category',
      name: cat.name,
      colour: cat.color || '#4C97FF',
      contents: (cat.blocks || []).map((name) => ({
        kind: 'block',
        type: 'bb_sidebar_item',
        fields: { BLOCK_NAME: String(name) },
      })),
    })),
  };
}

export default function BlocklySidebarFlyout({ categories = [] }) {
  const hostRef = useRef(null);
  const workspaceRef = useRef(null);

  useEffect(() => {
    defineBytebuddiesBlocks();
    ensureSidebarItemBlock();
    if (!hostRef.current || workspaceRef.current) return undefined;

    const ws = Blockly.inject(hostRef.current, {
      toolbox: categoriesToToolbox(categories),
      trashcan: false,
      toolboxPosition: 'start',
      move: { scrollbars: true, drag: false, wheel: true },
      zoom: { controls: false, wheel: false, startScale: 0.9, minScale: 0.7, maxScale: 1.2 },
      sounds: false,
      media: '/blockly-media/',
      renderer: 'geras',
      theme: Blockly.Themes.Classic,
    });
    workspaceRef.current = ws;

    const onChange = (evt) => {
      if (evt.type !== Blockly.Events.BLOCK_CREATE) return;
      const blockId = evt.blockId || (Array.isArray(evt.ids) ? evt.ids[0] : null);
      if (!blockId) return;
      const block = ws.getBlockById(blockId);
      if (!block) return;
      const name = block.getFieldValue('BLOCK_NAME');
      if (name) emitAddSidebarBlock(name);
      block.dispose(false);
    };
    ws.addChangeListener(onChange);

    return () => {
      ws.removeChangeListener(onChange);
      ws.dispose();
      workspaceRef.current = null;
    };
  }, [categories]);

  return <div ref={hostRef} className="blockly-container" style={{ height: '100%', width: '100%' }} />;
}
