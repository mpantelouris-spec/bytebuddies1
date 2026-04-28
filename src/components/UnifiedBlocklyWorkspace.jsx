import React, { useLayoutEffect, useRef, useMemo, useState } from 'react';
import Blockly from 'blockly';
import 'blockly/blocks';
import { defineBytebuddiesBlocks } from '../utils/blocklySetup';
import { buildBlocklyToolboxForPage } from '../data/sharedBlocklyToolbox';
import { BB_ADD_SIDEBAR_BLOCK } from '../utils/blockLibraryEvents';
import { SIDEBAR_TO_TYPE, shortTypeToBlocklyType } from '../utils/blocks';
import { getCategoryColorForBlockLabel } from '../data/blockLibraryCategories';

function blockToNode(block) {
  const fields = {};
  block.inputList.forEach((input) => {
    input.fieldRow.forEach((field) => {
      if (field?.name && field.name !== 'CAT_HEX') {
        fields[field.name] = block.getFieldValue(field.name);
      }
    });
  });

  const statements = {};
  block.inputList.forEach((input) => {
    if (!input.connection) return;
    const target = input.connection.targetBlock();
    if (!target) return;
    // Capture statement inputs (e.g. DO/ELSE) so loops/ifs keep their nested bodies.
    if (input.type === Blockly.INPUT_STATEMENT || input.type === Blockly.NEXT_STATEMENT) {
      statements[input.name || 'DO'] = chainToNodes(target);
    }
  });

  return {
    type: block.type,
    fields,
    data: block.data || '',
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

export default function UnifiedBlocklyWorkspace({
  onModelChange,
  style,
  libraryPage = 'workspace',
  extensionsKey = '',
  scrollbarSide = 'default',
}) {
  const mountRef = useRef(null);
  const workspaceRef = useRef(null);
  const [hasBlocks, setHasBlocks] = useState(false);
  const onModelChangeRef = useRef(onModelChange);
  onModelChangeRef.current = onModelChange;

  const toolbox = useMemo(
    () => buildBlocklyToolboxForPage(libraryPage),
    [libraryPage, extensionsKey],
  );

  useLayoutEffect(() => {
    defineBytebuddiesBlocks();
    if (!mountRef.current) return undefined;

    if (workspaceRef.current) {
      try {
        workspaceRef.current.dispose();
      } catch (e) {
        /* ignore */
      }
      workspaceRef.current = null;
    }

    const ws = Blockly.inject(mountRef.current, {
      toolbox,
      toolboxPosition: 'start',
      trashcan: true,
      media: '/blockly-media/',
      renderer: 'zelos',
      zoom: { controls: true, wheel: true, startScale: 0.9, minScale: 0.5, maxScale: 1.8 },
      move: { scrollbars: true, drag: true, wheel: true },
      theme: Blockly.Themes.Zelos,
    });
    workspaceRef.current = ws;

    if (scrollbarSide === 'top-left') {
      // Force Blockly's internal scrollbar placement to top/left in this workspace.
      const sb = ws?.scrollbar;
      const hSet = sb?.hScroll?.setPosition?.bind(sb.hScroll);
      const vSet = sb?.vScroll?.setPosition?.bind(sb.vScroll);
      if (hSet) sb.hScroll.setPosition = (x, _y) => hSet(x, 2);
      if (vSet) sb.vScroll.setPosition = (_x, y) => vSet(2, y);
    }

    const bump = () => {
      try {
        Blockly.svgResize(ws);
        if (scrollbarSide === 'top-left') {
          const svg = mountRef.current?.querySelector?.('svg.blocklySvg');
          const h = svg?.querySelector?.('.blocklyScrollbarHorizontal');
          const v = svg?.querySelector?.('.blocklyScrollbarVertical');
          const parseTranslate = (value) => {
            const m = /translate\(([-\d.]+)[,\s]+([-\d.]+)\)/.exec(String(value || ''));
            return m ? [Number(m[1]), Number(m[2])] : null;
          };
          if (h) {
            const t = parseTranslate(h.getAttribute('transform'));
            if (t) h.setAttribute('transform', `translate(${t[0]}, 2)`);
          }
          if (v) {
            const t = parseTranslate(v.getAttribute('transform'));
            if (t) v.setAttribute('transform', `translate(2, ${t[1]})`);
          }
        }
      } catch (e) {
        /* ignore */
      }
    };
    requestAnimationFrame(() => {
      bump();
      requestAnimationFrame(bump);
    });
    setTimeout(bump, 80);
    setTimeout(bump, 400);

    const emitModel = () => {
      const top = ws.getTopBlocks(true);
      const model = top.flatMap((b) => chainToNodes(b));
      setHasBlocks(top.length > 0);
      onModelChangeRef.current?.(model);
    };

    const addSidebarBlockToWorkspace = ({ name, type, color, meta, clientX, clientY }) => {
      const raw = String(name || '').trim();
      if (!raw) return;
      const directType = String(type || '').trim();
      const explicitColor = String(color || '').trim();
      const details = meta && typeof meta === 'object' ? meta : null;
      const label = raw.toLowerCase();
      const short = SIDEBAR_TO_TYPE[label];
      let typeToCreate = short ? shortTypeToBlocklyType(short) : 'bb_generic_stack';
      if (directType.startsWith('robot:')) {
        const robotId = directType.slice('robot:'.length);
        const robotToBlockly = {
          if_dist: 'bb_robot_if_dist',
          led: 'bb_robot_led_color',
          led_bright: 'bb_robot_led_brightness',
          led_rgb: 'bb_robot_led_rgb',
          buzz: 'bb_robot_buzz',
          play_note: 'bb_robot_play_note',
          play_melody: 'bb_robot_play_melody',
          display: 'bb_robot_show_text',
          show_num: 'bb_robot_show_number',
          show_icon: 'bb_robot_show_icon',
        };
        typeToCreate = robotToBlockly[robotId] || 'bb_robot_generic';
      }
      if (!Blockly.Blocks[typeToCreate]) typeToCreate = 'bb_generic_stack';
      const block = ws.newBlock(typeToCreate);
      block.initSvg();
      // Keep block color aligned with the sidebar section it came from.
      const sectionColor = explicitColor || getCategoryColorForBlockLabel(raw);
      if (sectionColor) block.setColour(sectionColor);
      if (typeToCreate === 'bb_generic_stack') block.setFieldValue(raw, 'LABEL');
      if (typeToCreate === 'bb_robot_generic') {
        const params = Array.isArray(details?.params) ? details.params : [];
        block.setFieldValue(String(details?.label || raw), 'CMD');
        for (let i = 1; i <= 6; i += 1) {
          const def = params[i - 1] || null;
          const input = block.getInput(`P${i}`);
          if (input) input.setVisible(Boolean(def));
          if (def) {
            block.setFieldValue(String(def.key || `p${i}`), `K${i}`);
            block.setFieldValue(String(def.default ?? ''), `V${i}`);
          }
        }
      }
      block.render();
      if (directType) {
        const dataPayload = (typeToCreate === 'bb_robot_generic')
          ? {
              directType,
              robotId: String(details?.robotId || directType.replace(/^robot:/, '')),
              params: Array.isArray(details?.params) ? details.params.map((p) => ({
                key: String(p?.key || ''),
                default: p?.default ?? '',
                type: String(p?.type || 'text'),
              })) : [],
            }
          : { directType };
        block.data = JSON.stringify(dataPayload);
      }

      let targetX = 24;
      let targetY = 24;
      if (Number.isFinite(clientX) && Number.isFinite(clientY) && mountRef.current) {
        try {
          const rect = mountRef.current.getBoundingClientRect();
          const metrics = ws.getMetrics?.();
          const scale = ws.scale || 1;
          const left = Number(metrics?.viewLeft || 0);
          const top = Number(metrics?.viewTop || 0);
          targetX = Math.max(16, (clientX - rect.left + left) / scale);
          targetY = Math.max(16, (clientY - rect.top + top) / scale);
        } catch (e) {
          /* ignore */
        }
      } else {
        const topBlocks = ws.getTopBlocks(true);
        let y = 24;
        topBlocks.forEach((b) => { y = Math.max(y, b.getRelativeToSurfaceXY().y + 56); });
        targetY = y;
      }
      block.moveBy(targetX, targetY);
      emitModel();
    };
    const onChange = () => emitModel();
    ws.addChangeListener(onChange);
    emitModel();

    const handleSidebarAdd = (event) => {
      addSidebarBlockToWorkspace({
        name: event?.detail?.name,
        type: event?.detail?.type,
        color: event?.detail?.color,
        meta: event?.detail?.meta,
      });
    };
    window.addEventListener(BB_ADD_SIDEBAR_BLOCK, handleSidebarAdd);

    const handleDrop = (event) => {
      event.preventDefault();
      let payload = null;
      const rawPayload = event.dataTransfer?.getData?.('application/x-bb-sidebar-block');
      if (rawPayload) {
        try {
          payload = JSON.parse(rawPayload);
        } catch (e) {
          payload = null;
        }
      }
      if (!payload) {
        const text = String(event.dataTransfer?.getData?.('text/plain') || '').trim();
        if (!text) return;
        payload = { name: text };
      }
      addSidebarBlockToWorkspace({
        ...payload,
        clientX: event.clientX,
        clientY: event.clientY,
      });
    };
    const handleDragOver = (event) => {
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
    };
    const mountEl = mountRef.current;
    mountEl?.addEventListener('dragover', handleDragOver);
    mountEl?.addEventListener('drop', handleDrop);

    const onResize = () => {
      try {
        Blockly.svgResize(ws);
      } catch (e) {
        /* ignore */
      }
    };
    window.addEventListener('resize', onResize);
    const ro =
      typeof ResizeObserver !== 'undefined' && mountRef.current
        ? new ResizeObserver(() => onResize())
        : null;
    if (ro && mountRef.current) ro.observe(mountRef.current);

    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', onResize);
      window.removeEventListener(BB_ADD_SIDEBAR_BLOCK, handleSidebarAdd);
      mountEl?.removeEventListener('dragover', handleDragOver);
      mountEl?.removeEventListener('drop', handleDrop);
      ws.removeChangeListener(onChange);
      ws.dispose();
      workspaceRef.current = null;
    };
  }, [toolbox]);

  return (
    <div
      ref={mountRef}
      className={`blockly-container${hasBlocks ? '' : ' bb-hide-empty-scrollbars'}`}
      style={{ width: '100%', height: '100%', minHeight: 320, ...style }}
    />
  );
}
