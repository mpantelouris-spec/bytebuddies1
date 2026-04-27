import React, { useEffect, useRef } from 'react';
import Blockly from 'blockly';
import 'blockly/blocks';
import { defineBytebuddiesBlocks } from '../utils/blocklySetup';
import { SHARED_BLOCKLY_TOOLBOX } from '../data/sharedBlocklyToolbox';
import { BB_ADD_SIDEBAR_BLOCK } from '../utils/blockLibraryEvents';

function blockToNode(block) {
  const fields = {};
  block.inputList.forEach((input) => {
    input.fieldRow.forEach((field) => {
      if (field?.name) fields[field.name] = block.getFieldValue(field.name);
    });
  });

  const statements = {};
  block.inputList.forEach((input) => {
    if (input.type === Blockly.NEXT_STATEMENT && input.connection) {
      const target = input.connection.targetBlock();
      if (target) statements[input.name || 'DO'] = chainToNodes(target);
    }
  });

  return {
    type: block.type,
    fields,
    statements,
  };
}

function chainToNodes(startBlock) {
  const out = [];
  let cur = startBlock;
  while (cur) {
    out.push(blockToNode(cur));
    cur = cur.getNextBlock();
  }
  return out;
}

export default function UnifiedBlocklyWorkspace({ onModelChange, style }) {
  const mountRef = useRef(null);
  const workspaceRef = useRef(null);

  useEffect(() => {
    defineBytebuddiesBlocks();
    if (!mountRef.current || workspaceRef.current) return undefined;

    const ws = Blockly.inject(mountRef.current, {
      toolbox: SHARED_BLOCKLY_TOOLBOX,
      trashcan: true,
      media: '/blockly-media/',
      renderer: 'geras',
      zoom: { controls: true, wheel: true, startScale: 0.9, minScale: 0.5, maxScale: 1.8 },
      move: { scrollbars: true, drag: true, wheel: true },
      theme: Blockly.Themes.Classic,
    });
    workspaceRef.current = ws;

    const emitModel = () => {
      const top = ws.getTopBlocks(true);
      const model = top.flatMap((b) => chainToNodes(b));
      onModelChange?.(model);
    };
    const onChange = () => emitModel();
    ws.addChangeListener(onChange);
    emitModel();

    const sidebarNameToBlocklyType = {
      'on start': 'bb_event_start',
      'on key press': 'bb_event_keypress',
      'move steps': 'bb_sprite_move',
      'turn degrees': 'bb_sprite_turn',
      'go to x,y': 'bb_sprite_goto',
      'change x by': 'bb_sprite_changex',
      'change y by': 'bb_sprite_changey',
      wait: 'bb_control_wait',
      'repeat n times': 'bb_loop_repeat',
      forever: 'bb_loop_forever',
      'if / else': 'bb_logic_if',
      'play sound': 'bb_sound_play',
      say: 'bb_sprite_say',
      'create variable': 'bb_var_create',
      'change by': 'bb_var_change',
    };
    const handleSidebarAdd = (event) => {
      const raw = String(event?.detail?.name || '').trim();
      if (!raw) return;
      const mapped = sidebarNameToBlocklyType[raw.toLowerCase()] || 'bb_generic_stack';
      const block = ws.newBlock(mapped);
      block.initSvg();
      block.render();
      if (mapped === 'bb_generic_stack') block.setFieldValue(raw, 'LABEL');
      const top = ws.getTopBlocks(true);
      let y = 24;
      top.forEach((b) => { y = Math.max(y, b.getRelativeToSurfaceXY().y + 56); });
      block.moveBy(24, y);
      emitModel();
    };
    window.addEventListener(BB_ADD_SIDEBAR_BLOCK, handleSidebarAdd);

    const onResize = () => Blockly.svgResize(ws);
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener(BB_ADD_SIDEBAR_BLOCK, handleSidebarAdd);
      ws.removeChangeListener(onChange);
      ws.dispose();
      workspaceRef.current = null;
    };
  }, [onModelChange]);

  return (
    <div
      ref={mountRef}
      className="blockly-container"
      style={{ width: '100%', height: '100%', minHeight: 320, ...style }}
    />
  );
}
