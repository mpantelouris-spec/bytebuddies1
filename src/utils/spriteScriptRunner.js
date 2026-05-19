/**
 * Scratch-style script threads: cooperative execution with yield on move/glide/wait.
 */

import {
  applyRotationStyleBlock,
  executeSpriteMotion,
  isEdgeBounceBlockType,
  isRotationStyleBlockType,
  isSpriteMotionBusy,
  spriteUsesMotionBlocks,
  tickSpriteMotions,
} from './spriteMotion';
import { collectLoopBody, createScriptThread } from './controlFlowRuntime';

/** @typedef {{ body: object[], pc: number, stopped?: boolean }} ScriptThread */

export function createThread(body = []) {
  return createScriptThread(body);
}

export function resetSpriteThreads(sprite) {
  sprite._hatThread = null;
  sprite._foreverThreads = [];
  sprite._greenFlagThreads = null;
  sprite._cloneHatThreads = null;
  sprite._greenFlagDone = false;
  sprite._syntheticEventStartExecuted = false;
  sprite._syntheticPc = 0;
  sprite._flowLegacy = null;
  sprite._loopIndex = 0;
  sprite._moveAnim = null;
  sprite._glideStartLX = null;
  sprite._glideEndLX = null;
  sprite._moveJustFinished = false;
  sprite._glideJustFinished = false;
  sprite._edgeBounceEnabled = false;
  sprite._autoDrift = false;
}

/**
 * Register a forever loop body (called once when a stack hits "forever").
 */
export function registerForeverThread(sprite, body) {
  if (!sprite._foreverThreads) sprite._foreverThreads = [];
  const exists = sprite._foreverThreads.some(
    (t) => t.body === body || (t.body.length === body.length && t.body[0]?.id === body[0]?.id),
  );
  if (!exists) sprite._foreverThreads.push(createThread(body));
}

/**
 * Advance glide / move animations — call once per frame before stepping scripts.
 */
export function tickSpriteAnimations(sprite, dtSec) {
  tickSpriteMotions(sprite, dtSec);
}

/** Apply rotation style / bounce flags from this sprite's scripts only (not other sprites). */
export function applyMotionFlagsFromChains(sprite, chains = []) {
  if (!sprite || !chains?.length) return;
  for (const chain of chains) {
    for (const block of chain.body || []) {
      const t = block?.type || block?.blocklyType;
      if (isEdgeBounceBlockType(t)) {
        sprite._edgeBounceEnabled = true;
        if (!spriteUsesMotionBlocks(sprite)) sprite._autoDrift = true;
      }
    }
  }
}

/**
 * Step a script stack; returns whether it is still paused mid-stack.
 * @param {Function} execBodyImpl - (body, sprite, startPc, thread) => number|false
 */
export function stepThread(thread, sprite, execBodyImpl) {
  if (!thread?.body?.length || thread.stopped) {
    if (thread) thread.pc = 0;
    return false;
  }
  const pauseAt = execBodyImpl(thread.body, sprite, thread.pc, thread);
  if (thread.stopped) {
    thread.pc = 0;
    return false;
  }
  if (pauseAt !== false) {
    thread.pc = pauseAt;
    return true;
  }
  thread.pc = 0;
  return false;
}

/**
 * Run hat script (green flag) until done or yield.
 */
export function stepHatScript(sprite, chainBody, execBodyImpl) {
  if (!sprite._hatThread) sprite._hatThread = createThread(chainBody);
  return stepThread(sprite._hatThread, sprite, execBodyImpl);
}

/**
 * Step all forever threads once per frame.
 */
export function stepForeverThreads(sprite, execBodyImpl) {
  const threads = sprite._foreverThreads || [];
  for (const thread of threads) {
    if (thread.stopped) continue;
    stepThread(thread, sprite, execBodyImpl);
  }
}

/**
 * One green-flag thread per hat stack (Scratch: multiple scripts per sprite).
 */
export function initGreenFlagThreads(sprite, chains) {
  if (sprite.isClone) {
    sprite._greenFlagThreads = [];
    return;
  }
  const greenChains = (chains || []).filter(
    (c) => c.trigger?.type === 'event-start' && !c.isSynthetic,
  );
  sprite._greenFlagThreads = greenChains.map((chain) => ({
    chain,
    thread: createThread(chain.body),
    done: false,
    _syncedBodyLen: chain.body.length,
  }));
}

function chainTriggerKey(chain) {
  const t = chain?.trigger;
  if (!t) return '';
  if (t.id != null) return `id:${t.id}`;
  return `type:${t.type}:${t.stackOrder ?? t.y ?? ''}`;
}

function registerForeverLoopsInChain(sprite, body) {
  if (!body?.length) return;
  for (let i = 0; i < body.length; i++) {
    const blk = body[i];
    if (blk?.type === 'loop-forever') {
      const { loopBody } = collectLoopBody(body, i);
      if (loopBody.length) registerForeverThread(sprite, loopBody);
    }
  }
}

/**
 * After Blockly edits during Play: pick up new hats, append blocks to finished stacks, new forever loops.
 */
export function resyncSpriteThreadsOnBlockChange(sprite, liveSprites) {
  if (!sprite || sprite.isClone) return buildScriptChains(sprite?.id, liveSprites);

  const chains = buildScriptChains(sprite.id, liveSprites);
  registerForeverLoopsInChain(sprite, chains.flatMap((c) => c.body || []));

  const greenChains = chains.filter((c) => c.trigger?.type === 'event-start' && !c.isSynthetic);

  if (!sprite._greenFlagThreads) {
    initGreenFlagThreads(sprite, chains);
    return chains;
  }

  const entries = sprite._greenFlagThreads;
  const seenKeys = new Set();

  for (const chain of greenChains) {
    const key = chainTriggerKey(chain);
    seenKeys.add(key);
    let entry = entries.find((e) => chainTriggerKey(e.chain) === key);

    if (!entry) {
      entries.push({
        chain,
        thread: createThread(chain.body),
        done: false,
        _syncedBodyLen: chain.body.length,
      });
      continue;
    }

    const prevLen = entry._syncedBodyLen ?? entry.thread?.body?.length ?? 0;
    entry.chain = chain;
    entry.thread.body = chain.body;

    if (chain.body.length > prevLen) {
      if (entry.done) {
        entry.thread.pc = prevLen;
        entry.done = false;
        entry.thread.stopped = false;
      }
    } else if (entry.thread.pc > chain.body.length) {
      entry.thread.pc = 0;
    }

    entry._syncedBodyLen = chain.body.length;
  }

  sprite._greenFlagThreads = entries.filter((e) => seenKeys.has(chainTriggerKey(e.chain)));

  chains
    .filter((c) => c.isSynthetic && c.trigger?.type === 'event-start')
    .forEach((chain) => {
      const prevLen = sprite._syntheticBodyLen ?? 0;
      if (chain.body.length > prevLen) {
        if (sprite._syntheticEventStartExecuted) {
          sprite._syntheticPc = prevLen;
          sprite._syntheticEventStartExecuted = false;
        }
      }
      sprite._syntheticBodyLen = chain.body.length;
    });

  return chains;
}

/**
 * Start "when I start as a clone" scripts (clones only).
 */
export function startCloneHatThreads(clone, liveSprites) {
  if (!clone?.isClone) return;
  const chains = buildScriptChains(clone.id, liveSprites);
  clone._cloneHatThreads = chains
    .filter((c) => c.trigger?.type === 'event-clone')
    .map((chain) => ({
      chain,
      thread: createThread(chain.body),
      done: false,
    }));
}

export function stepCloneHatThreads(playSprites, execBodyImpl) {
  (playSprites || []).forEach((sprite) => {
    if (!sprite.isClone || !sprite._cloneHatThreads?.length) return;
    for (const entry of sprite._cloneHatThreads) {
      if (entry.done || entry.thread.stopped) continue;
      const paused = stepThread(entry.thread, sprite, execBodyImpl);
      if (!paused) entry.done = true;
    }
  });
}

export function createMotionContext(playSprites, mouseX, mouseY) {
  return {
    sprites: playSprites || [],
    mouseX,
    mouseY,
  };
}

export function runMotionBlock(block, sprite, ctx) {
  return executeSpriteMotion(block, sprite, ctx) === true;
}

/**
 * Build Scratch-style script chains (hat + body) from a sprite's block list.
 * @param {string} spriteId
 * @param {object[]} liveSprites
 */
export function buildScriptChains(spriteId, liveSprites) {
  const sprite = (liveSprites || []).find((s) => s.id === spriteId);
  if (!sprite) return [];

  const spriteBlocks = [...(sprite.blocks || [])].map((b) => ({
    ...b,
    owner: b.owner || sprite.name,
  }));
  if (!spriteBlocks.length) return [];

  const isHat = (b) => {
    const t = String(b.type || b.blocklyType || '');
    return (
      t.startsWith('event-')
      || t.startsWith('bb_event_')
      || t === 'event_whenflagclicked'
      || t === 'event_whenkeypressed'
      || t === 'event_whenthisspriteclicked'
      || t === 'control_start_as_clone'
    );
  };

  const blockKey = (b) => {
    if (b.id != null) return String(b.id);
    return `${b.type || b.blocklyType}-${b.stackOrder ?? b.y ?? ''}`;
  };

  const sorted = [...spriteBlocks].sort((a, b) => {
    const oa = a.stackOrder ?? a.y ?? 0;
    const ob = b.stackOrder ?? b.y ?? 0;
    return oa - ob;
  });

  const chains = [];
  let current = null;

  for (const block of sorted) {
    const blockType = block.type || block.blocklyType;
    if (isHat(block)) {
      if (current) chains.push(current);
      const internalType = blockType === 'bb_event_start' || blockType === 'event_whenflagclicked'
        ? 'event-start'
        : blockType === 'bb_event_keypress' || blockType === 'event_whenkeypressed'
          ? 'event-keypress'
          : blockType === 'bb_event_click' || blockType === 'event_whenthisspriteclicked'
            ? 'event-click'
            : blockType === 'control_start_as_clone'
              ? 'event-clone'
              : blockType;
      current = { trigger: { ...block, type: internalType }, body: [] };
    } else if (current) {
      current.body.push(block);
    }
  }
  if (current) chains.push(current);

  const stackBlocks = sorted.filter((b) => !isHat(b));

  if (chains.length === 0 && stackBlocks.length > 0) {
    chains.push({ trigger: { type: 'event-start', params: {} }, body: stackBlocks, isSynthetic: true });
  }

  const firstEventIdx = sorted.findIndex(isHat);
  const orphanPrefix = firstEventIdx > 0 ? sorted.slice(0, firstEventIdx).filter((b) => !isHat(b)) : [];
  if (orphanPrefix.length && chains.length) {
    const seen = new Set();
    const merge = [...orphanPrefix, ...chains[0].body].filter((b) => {
      const key = blockKey(b);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    chains[0].body = merge;
    chains[0].isSynthetic = true;
  }

  const usedIds = new Set();
  chains.forEach((c) => {
    c.body.forEach((b) => usedIds.add(blockKey(b)));
  });
  const loose = sorted.filter((b) => !isHat(b) && !usedIds.has(blockKey(b)));
  if (loose.length) {
    const target = chains.find((c) => c.trigger?.type === 'event-start') || chains[0];
    if (target) {
      loose.forEach((b) => target.body.push(b));
      target.isSynthetic = true;
    }
  }

  return chains;
}

/**
 * Step green-flag (event-start) scripts — cooperative yield; one thread per hat stack.
 */
export function stepGreenFlagChains(spriteChains, execBodyImpl) {
  if (!spriteChains?.length) return;
  spriteChains.forEach(({ sprite, chains }) => {
    if (sprite.isClone) return;

    if (!sprite._greenFlagThreads) {
      initGreenFlagThreads(sprite, chains);
    }

    for (const entry of sprite._greenFlagThreads || []) {
      if (entry.done || entry.thread.stopped) continue;
      const paused = stepThread(entry.thread, sprite, execBodyImpl);
      if (!paused) entry.done = true;
    }

    chains.filter((c) => c.isSynthetic && c.trigger?.type === 'event-start').forEach((chain) => {
      if (!sprite._syntheticEventStartExecuted) {
        const pauseAt = execBodyImpl(chain.body, sprite, sprite._syntheticPc || 0, null);
        if (pauseAt !== false) {
          sprite._syntheticPc = pauseAt;
        } else {
          sprite._syntheticEventStartExecuted = true;
          sprite._syntheticPc = 0;
        }
      }
    });
  });
}

export { isSpriteMotionBusy, executeSpriteMotion, isRotationStyleBlockType, applyRotationStyleBlock };
