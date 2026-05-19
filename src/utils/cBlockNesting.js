/**
 * Flat game-block lists use synthetic markers (loop-end-loop, logic-end-if)
 * between C-block headers and the rest of the stack. Helpers for hydrate + runtime.
 */

export const C_BLOCK_HEADER_TYPES = new Set([
  'loop-repeat',
  'loop-forever',
  'loop-while',
  'loop-foreach',
  'control-repeat-until',
  'logic-if',
]);

export const C_BLOCK_END_MARKERS = new Set([
  'loop-end-loop',
  'logic-end-if',
]);

export function isCBlockHeader(type) {
  return C_BLOCK_HEADER_TYPES.has(String(type || ''));
}

export function isCBlockEndMarker(type) {
  return C_BLOCK_END_MARKERS.has(String(type || ''));
}

/** Skip synthetic end markers when rebuilding Blockly workspace. */
export function shouldSkipWhenHydrating(type) {
  return isCBlockEndMarker(type);
}

/**
 * From flat sorted blocks, slice inner body for a C-block at headerIndex.
 * @returns {{ inner: object[], nextIndex: number }}
 */
export function sliceCBlockInner(flatBlocks, headerIndex) {
  const inner = [];
  let j = headerIndex + 1;

  while (j < flatBlocks.length) {
    const t = flatBlocks[j]?.type;
    if (isCBlockEndMarker(t)) {
      j += 1;
      break;
    }
    if (t?.startsWith?.('event-')) break;
    if (isCBlockHeader(t)) break;
    inner.push(flatBlocks[j]);
    j += 1;
  }
  return { inner, nextIndex: j };
}

/**
 * If / if-else sections from flat game-block list.
 * @returns {{ inner: object[], elseInner: object[], nextIndex: number }}
 */
export function sliceIfBlockSections(flatBlocks, headerIndex) {
  const inner = [];
  let j = headerIndex + 1;
  while (j < flatBlocks.length) {
    const t = flatBlocks[j]?.type;
    if (t === 'logic-else') {
      j += 1;
      const elseInner = [];
      while (j < flatBlocks.length && flatBlocks[j]?.type !== 'logic-end-if') {
        elseInner.push(flatBlocks[j]);
        j += 1;
      }
      if (flatBlocks[j]?.type === 'logic-end-if') j += 1;
      return { inner, elseInner, nextIndex: j };
    }
    if (t === 'logic-end-if') {
      j += 1;
      return { inner, elseInner: [], nextIndex: j };
    }
    inner.push(flatBlocks[j]);
    j += 1;
  }
  return { inner, elseInner: [], nextIndex: j };
}
