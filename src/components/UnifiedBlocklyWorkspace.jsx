import React, {
  useLayoutEffect,
  useRef,
  useMemo,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import Blockly from 'blockly';
import 'blockly/blocks';
import { defineBytebuddiesBlocks } from '../utils/blocklySetup';
import { buildBlocklyToolboxForPage } from '../data/sharedBlocklyToolbox';
import { BB_ADD_SIDEBAR_BLOCK } from '../utils/blockLibraryEvents';
import {
  SCRATCH_BLOCK_DEFAULT_FIELDS,
  gameTypeToBlocklyType,
  toolboxBlockJsonForLibraryEntry,
  resolveBlocklyTypeForLibraryLabel,
  isLibraryStubBlocklyType,
} from '../utils/blocklyToolboxEntries';
import {
  createBlockFromLibraryLabel,
  attachDefaultValueShadows,
} from '../utils/blocklyLibraryFactory';
import {
  isCBlockHeader,
  shouldSkipWhenHydrating,
  sliceCBlockInner,
  sliceIfBlockSections,
} from '../utils/cBlockNesting';
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

  const values = {};
  block.inputList.forEach((input) => {
    if (input.type !== Blockly.INPUT_VALUE) return;
    const conn = input.connection;
    const target = conn && conn.targetBlock();
    if (!target) return;
    const name = input.name || 'VALUE';
    values[name] = blockToNode(target);
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
    values,
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

/** Clear workspace without corrupting Blockly's connectionDB (manual disconnect + clear can throw). */
function safeClearWorkspace(ws) {
  if (!ws) return;
  try {
    ws.clear();
    return;
  } catch (e) {
    console.warn('[UnifiedBlocklyWorkspace] ws.clear failed, disposing top blocks individually', e);
  }
  const tops = [...(ws.getTopBlocks(false) || [])];
  tops.forEach((block) => {
    try {
      if (block.workspace) block.dispose(false);
    } catch (err) {
      /* ignore stale connection errors during recovery */
    }
  });
}

function workspaceModelFromWs(ws) {
  if (!ws) return { nodes: [], xmlText: '' };
  const top = ws.getTopBlocks(true);
  const nodes = top.flatMap((b) => chainToNodes(b));
  let xmlText = '';
  try {
    const dom = Blockly.Xml.workspaceToDom(ws);
    xmlText = Blockly.Xml.domToText(dom);
  } catch (e) {
    xmlText = '';
  }
  return { nodes, xmlText };
}

const UnifiedBlocklyWorkspace = forwardRef(function UnifiedBlocklyWorkspace({
  onModelChange,
  style,
  libraryPage = 'workspace',
  extensionsKey = '',
  scrollbarSide = 'default',
  selectedSpriteBlocks = [],
  selectedSpriteXml = '',
  selectedSpriteId = null,
  selectedSpriteName = null,
}, ref) {
  const mountRef = useRef(null);
  const workspaceRef = useRef(null);
  const [hasBlocks, setHasBlocks] = useState(false);
  const onModelChangeRef = useRef(onModelChange);
  onModelChangeRef.current = onModelChange;
  /** Prevents duplicate hydrate after inject + sprite effect on same tick; tracks last loaded sprite id. */
  const lastHydratedSpriteIdRef = useRef(undefined);
  const onChangeRef = useRef(null);

  useImperativeHandle(ref, () => ({
    /** Push current workspace blocks to onModelChange and return raw nodes (for Play). */
    flush() {
      const ws = workspaceRef.current;
      const { nodes, xmlText } = workspaceModelFromWs(ws);
      onModelChangeRef.current?.(nodes, xmlText);
      return { nodes, xmlText };
    },
  }), []);

  const spritePropsRef = useRef({
    id: selectedSpriteId,
    xml: selectedSpriteXml,
    blocks: selectedSpriteBlocks,
    name: selectedSpriteName,
  });
  spritePropsRef.current = {
    id: selectedSpriteId,
    xml: selectedSpriteXml,
    blocks: selectedSpriteBlocks,
    name: selectedSpriteName,
  };

  const upgradeLibraryStubBlocks = useCallback((ws) => {
    if (!ws) return;
    const stubs = ws.getAllBlocks(false).filter((b) => isLibraryStubBlocklyType(b.type));
    stubs.forEach((block) => {
      const label = String(
        block.getFieldValue?.('BLOCK_NAME')
        || block.getFieldValue?.('LABEL')
        || '',
      ).trim();
      if (!label) return;
      const resolved = resolveBlocklyTypeForLibraryLabel(label, block.type);
      if (!resolved || isLibraryStubBlocklyType(resolved) || !Blockly.Blocks[resolved]) {
        const nameField = block.getField('BLOCK_NAME') || block.getField('LABEL');
        if (nameField) nameField.setValue(label);
        return;
      }
      try {
        const xy = block.getRelativeToSurfaceXY();
        const colour = typeof block.getColour === 'function' ? block.getColour() : null;
        const parentConn = block.outputConnection?.targetConnection
          || block.previousConnection?.targetConnection;
        const nextBlock = block.getNextBlock();
        const replacement = createBlockFromLibraryLabel(ws, label, {
          x: xy.x,
          y: xy.y,
          color: colour,
        });
        if (!replacement) return;
        attachDefaultValueShadows(ws, replacement);
        replacement.render();
        if (parentConn && replacement.outputConnection) {
          parentConn.connect(replacement.outputConnection);
        } else if (parentConn && replacement.previousConnection) {
          parentConn.connect(replacement.previousConnection);
        }
        if (nextBlock && replacement.nextConnection) {
          replacement.nextConnection.connect(nextBlock.previousConnection);
        }
        block.dispose(false);
      } catch (e) {
        /* keep stub if upgrade fails */
      }
    });
  }, []);

  const hydrateWorkspace = useCallback((ws) => {
    if (!ws) return;
    const props = spritePropsRef.current;
    const { xml: selectedSpriteXmlLocal, blocks: selectedSpriteBlocksLocal, name: selectedSpriteNameLocal } = props;

    const changeListener = onChangeRef.current;
    if (changeListener) ws.removeChangeListener(changeListener);

    const eventsWereEnabled = Blockly.Events.isEnabled();
    Blockly.Events.disable();
    let restoredFromXml = false;
    try {
    safeClearWorkspace(ws);
    if (selectedSpriteXmlLocal && String(selectedSpriteXmlLocal).trim()) {
      try {
        const xml = Blockly.Xml.textToDom(String(selectedSpriteXmlLocal));
        Blockly.Xml.domToWorkspace(xml, ws);
        upgradeLibraryStubBlocks(ws);
        restoredFromXml = (ws.getTopBlocks(false).length > 0);
      } catch (e) {
        restoredFromXml = false;
      }
    }

    if (!restoredFromXml && Array.isArray(selectedSpriteBlocksLocal) && selectedSpriteBlocksLocal.length > 0) {
      let recreateCount = 0;
      let errorCount = 0;
      let lastY = -Infinity;
      let lastStack = null;

      const fallbackBlocks = [...selectedSpriteBlocksLocal].sort((a, b) => {
        const oa = a.stackOrder ?? a.y ?? 0;
        const ob = b.stackOrder ?? b.y ?? 0;
        return oa - ob;
      });

      const isBlocklyHat = (mappedType) => (
        String(mappedType).startsWith('bb_event_')
        || mappedType === 'event_whenflagclicked'
        || mappedType === 'event_whenkeypressed'
        || mappedType === 'event_whenthisspriteclicked'
        || mappedType === 'control_start_as_clone'
      );

      const applyFields = (block, gameBlock, mappedType) => {
        const defaults = { ...(SCRATCH_BLOCK_DEFAULT_FIELDS[mappedType] || {}) };
        const params = { ...defaults, ...(gameBlock.params || {}) };
        Object.entries(params).forEach(([key, value]) => {
          const candidates = [key, String(key).toUpperCase()];
          for (const k of candidates) {
            try {
              if (block.getField(k)) {
                block.setFieldValue(String(value), k);
                break;
              }
            } catch (e) {
              /* field id mismatch */
            }
          }
        });
      };

      const connectStack = (parent, child) => {
        const next = parent?.nextConnection;
        const prev = child?.previousConnection;
        if (!next || !prev) return false;
        try {
          if (next.isConnected() && next.targetConnection === prev) return true;
          next.connect(prev);
          return true;
        } catch (e) {
          return false;
        }
      };

      const connectStatementChain = (parentBlock, innerGameBlocks, inputName = null) => {
        if (!innerGameBlocks?.length) return;
        const stmtInput = (inputName && parentBlock.getInput(inputName))
          || parentBlock.getInput('SUBSTACK')
          || parentBlock.getInput('DO')
          || parentBlock.getInput('STACK');
        if (!stmtInput?.connection) return;
        let prev = null;
        for (const gb of innerGameBlocks) {
          if (shouldSkipWhenHydrating(gb.type) || isCBlockHeader(gb.type)) continue;
          const mapped = gameTypeToBlocklyType(gb.type);
          if (!Blockly.Blocks[mapped]) continue;
          const child = ws.newBlock(mapped);
          child.initSvg();
          applyFields(child, gb, mapped);
          if (!prev) {
            try {
              stmtInput.connection.connect(child.previousConnection);
            } catch (e) {
              /* ignore */
            }
          } else {
            connectStack(prev, child);
          }
          prev = child;
          recreateCount += 1;
        }
      };

      const createBlocklyFromGame = (gameBlock, idx) => {
        const mappedType = gameTypeToBlocklyType(gameBlock.type);
        if (!Blockly.Blocks[mappedType]) {
          console.warn(`[UnifiedBlocklyWorkspace] Block type not found: "${mappedType}" (from "${gameBlock.type}")`);
          errorCount += 1;
          return null;
        }
        const block = ws.newBlock(mappedType);
        block.initSvg();
        applyFields(block, gameBlock, mappedType);
        const x = Number.isFinite(Number(gameBlock.x)) ? Number(gameBlock.x) : 30;
        let y = Number.isFinite(Number(gameBlock.y)) ? Number(gameBlock.y) : (30 + idx * 60);
        if (y - lastY < 26) y = lastY + 56;
        lastY = y;
        recreateCount += 1;
        return block;
      };

      let i = 0;
      while (i < fallbackBlocks.length) {
        const gameBlock = fallbackBlocks[i];
        try {
          if (!gameBlock?.type || shouldSkipWhenHydrating(gameBlock.type)) {
            i += 1;
            continue;
          }

          const mappedType = gameTypeToBlocklyType(gameBlock.type);
          const hat = isBlocklyHat(mappedType);

          if (gameBlock.type === 'logic-if') {
            const { inner, elseInner, nextIndex } = sliceIfBlockSections(fallbackBlocks, i);
            const ifBlocklyType = elseInner.length ? 'control_if_else' : 'control_if';
            const block = ws.newBlock(ifBlocklyType);
            block.initSvg();
            applyFields(block, gameBlock, ifBlocklyType);
            recreateCount += 1;
            if (lastStack && !hat) connectStack(lastStack, block);
            else block.moveTo(30, lastY);
            connectStatementChain(block, inner);
            if (elseInner.length) connectStatementChain(block, elseInner, 'SUBSTACK2');
            lastStack = block;
            i = nextIndex;
            continue;
          }

          if (isCBlockHeader(gameBlock.type)) {
            const { inner, nextIndex } = sliceCBlockInner(fallbackBlocks, i);
            const block = createBlocklyFromGame(gameBlock, i);
            if (!block) {
              i += 1;
              continue;
            }
            if (lastStack && !hat) connectStack(lastStack, block);
            else block.moveTo(30, lastY);
            connectStatementChain(block, inner);
            lastStack = block;
            i = nextIndex;
            continue;
          }

          const block = createBlocklyFromGame(gameBlock, i);
          if (!block) {
            i += 1;
            continue;
          }
          if (hat) {
            block.moveTo(30, lastY);
            lastStack = block;
          } else if (lastStack) {
            if (!connectStack(lastStack, block)) block.moveTo(30, lastY);
            lastStack = block;
          } else {
            block.moveTo(30, lastY);
            lastStack = block;
          }
          i += 1;
        } catch (e) {
          console.error(`[UnifiedBlocklyWorkspace] Error recreating block at index ${i}:`, gameBlock?.type, e);
          errorCount += 1;
          i += 1;
        }
      }

      if (recreateCount === 0 && selectedSpriteBlocksLocal.length > 0) {
        console.warn(`[UnifiedBlocklyWorkspace] No blocks recreated for sprite "${selectedSpriteNameLocal}"`);
      }
    }

    if (typeof ws.render === 'function') {
      try {
        ws.render();
      } catch (e) {
        console.warn('[UnifiedBlocklyWorkspace] workspace render after hydrate', e);
      }
    }
    } catch (hydrateErr) {
      console.error('[UnifiedBlocklyWorkspace] hydrateWorkspace failed', hydrateErr);
      safeClearWorkspace(ws);
    } finally {
      if (eventsWereEnabled) Blockly.Events.enable();
      if (changeListener) ws.addChangeListener(changeListener);
    }

    lastHydratedSpriteIdRef.current = props.id;
    const topBlocks = ws.getTopBlocks(true);
    setHasBlocks(topBlocks.length > 0);
  }, []);

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
      const { nodes: model, xmlText } = workspaceModelFromWs(ws);
      setHasBlocks((workspaceRef.current?.getTopBlocks(true) || []).length > 0);
      onModelChangeRef.current?.(model, xmlText);
    };

    const addSidebarBlockToWorkspace = ({ name, type, color, meta, clientX, clientY }) => {
      const raw = String(name || '').trim();
      if (!raw) return;
      const directType = String(type || '').trim();
      const explicitColor = String(color || '').trim();
      const details = meta && typeof meta === 'object' ? meta : null;

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

      const sectionColor = explicitColor || getCategoryColorForBlockLabel(raw);
      let block = null;

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
        const typeToCreate = robotToBlockly[robotId] || 'bb_robot_generic';
        if (Blockly.Blocks[typeToCreate]) {
          block = ws.newBlock(typeToCreate);
          block.initSvg();
          if (sectionColor) block.setColour(sectionColor);
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
          block.moveBy(targetX, targetY);
          if (directType) {
            block.data = JSON.stringify(
              typeToCreate === 'bb_robot_generic'
                ? {
                    directType,
                    robotId: String(details?.robotId || directType.replace(/^robot:/, '')),
                    params: Array.isArray(details?.params) ? details.params.map((p) => ({
                      key: String(p?.key || ''),
                      default: p?.default ?? '',
                      type: String(p?.type || 'text'),
                    })) : [],
                  }
                : { directType },
            );
          }
        }
      } else {
        try {
          Blockly.Events.setGroup(true);
          block = createBlockFromLibraryLabel(ws, raw, {
            preferredType: directType || null,
            color: sectionColor,
            x: targetX,
            y: targetY,
          });
        } catch (e) {
          console.warn('[UnifiedBlocklyWorkspace] add block failed', raw, e);
        } finally {
          Blockly.Events.setGroup(false);
        }
      }

      if (!block) {
        console.warn('[UnifiedBlocklyWorkspace] Could not add block for', raw);
        return;
      }
      try {
        Blockly.svgResize(ws);
      } catch (e) {
        /* ignore */
      }
      emitModel();
    };
    const onChange = () => emitModel();
    onChangeRef.current = onChange;
    ws.addChangeListener(onChange);
    // Load saved sprite/blocks before syncing to parent — an empty emit here wipes Game Builder code + XML.
    hydrateWorkspace(ws);
    if (libraryPage === 'gamebuilder') {
      requestAnimationFrame(() => emitModel());
    } else {
      emitModel();
    }

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
      if (onChangeRef.current) ws.removeChangeListener(onChangeRef.current);
      ws.dispose();
      workspaceRef.current = null;
    };
  }, [toolbox, libraryPage, hydrateWorkspace]);

  // Game Builder: reload workspace only when the selected sprite id changes (not when blocks/xml update from save).
  useLayoutEffect(() => {
    if (libraryPage !== 'gamebuilder') return;
    const ws = workspaceRef.current;
    if (!ws) return;
    if (selectedSpriteId === lastHydratedSpriteIdRef.current) return;
    hydrateWorkspace(ws);
    requestAnimationFrame(() => {
      const { nodes, xmlText } = workspaceModelFromWs(ws);
      setHasBlocks((ws.getTopBlocks(true) || []).length > 0);
      onModelChangeRef.current?.(nodes, xmlText);
    });
  }, [selectedSpriteId, libraryPage, hydrateWorkspace]);

  return (
    <div
      ref={mountRef}
      className={`blockly-container${hasBlocks ? '' : ' bb-hide-empty-scrollbars'}`}
      style={{ width: '100%', height: '100%', minHeight: 320, ...style }}
    />
  );
});

export default UnifiedBlocklyWorkspace;
