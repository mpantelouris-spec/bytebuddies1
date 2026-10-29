/**
 * Scratch-style control flow helpers: per-script wait/stop state and loop body collection.
 */

/** @typedef {{ body: object[], pc: number, stopped: boolean, waitEndTime: number|null, waitingUntil: object|null, repeatState: object|null }} ScriptThread */

export function createScriptThread(body = []) {
  return {
    body: body || [],
    pc: 0,
    stopped: false,
    waitEndTime: null,
    waitingUntil: null,
    repeatState: null,
  };
}

/** Resolve wait/stop context (thread or legacy sprite bag). */
export function getFlowContext(sprite, thread) {
  if (thread) return thread;
  if (!sprite._flowLegacy) {
    sprite._flowLegacy = {
      waitEndTime: null,
      waitingUntil: null,
      stopped: false,
    };
  }
  return sprite._flowLegacy;
}

export function clearFlowWaits(ctx) {
  if (!ctx) return;
  ctx.waitEndTime = null;
  ctx.waitingUntil = null;
}

export function isFlowWaiting(ctx, now = Date.now()) {
  if (!ctx) return false;
  if (ctx.waitEndTime != null && now < ctx.waitEndTime) return true;
  return false;
}

export function setWaitSeconds(ctx, seconds, now = Date.now()) {
  const secs = Math.max(0, Number(seconds) || 0);
  if (!ctx.waitEndTime || ctx.waitEndTime <= now) {
    ctx.waitEndTime = now + secs * 1000;
  }
}

export function setWaitUntilCondition(ctx, conditionBlock) {
  ctx.waitingUntil = conditionBlock || null;
}

export function shouldResumeWaitUntil(ctx, evaluateCondition, sprite) {
  if (!ctx?.waitingUntil) return true;
  return evaluateCondition(ctx.waitingUntil, sprite);
}

const LOOP_HEADERS = new Set(['loop-repeat', 'loop-forever', 'loop-while', 'loop-foreach', 'control-repeat-until']);
/** Event blocks that are ordinary steps inside a script, not the start of a new one. */
const EVENT_STACK_BLOCKS = new Set(['event-broadcast', 'event-broadcast-wait']);
/** True for blocks that start a new script (when flag clicked, when key pressed…). */
export const isHat = (type) => String(type || '').startsWith('event-') && !EVENT_STACK_BLOCKS.has(type);

/**
 * Collect the blocks inside a loop: everything up to the loop's own end marker.
 * Loops inside loops keep their own headers and end markers, so nesting works
 * (a repeat inside a repeat keeps going after the inner loop finishes).
 */
export function collectLoopBody(body, startIndex) {
  const loopBody = [];
  let depth = 0;
  let j = startIndex + 1;
  while (j < body.length) {
    const b = body[j];
    if (b.type === 'loop-end-loop') {
      if (depth === 0) {
        j++;
        break;
      }
      depth -= 1;
    } else if (LOOP_HEADERS.has(b.type)) {
      depth += 1;
    } else if (depth === 0 && isHat(b.type)) {
      break;
    }
    loopBody.push(b);
    j++;
  }
  return { loopBody, endIndex: j - 1, nextIndex: j };
}

/**
 * Where a loop or if is up to (iteration and the block it paused on), per script/sprite
 * and per block — so an inner loop pausing for a glide never overwrites the outer loop's
 * place. Kept outside the sprite object: clones are made by copying their parent, and
 * must never share (or inherit a finished) loop state.
 */
const loopStatesByHost = new WeakMap();
export function loopStateFor(host, blk) {
  let states = loopStatesByHost.get(host);
  if (!states) {
    states = new Map();
    loopStatesByHost.set(host, states);
  }
  let st = states.get(blk);
  if (!st) {
    st = { iteration: 0, innerPc: 0 };
    states.set(blk, st);
  }
  return st;
}
export function clearLoopState(host, blk) {
  loopStatesByHost.get(host)?.delete(blk);
}

export function stopAllScriptThreads(playSprites) {
  (playSprites || []).forEach((sprite) => {
    (sprite._greenFlagThreads || []).forEach((entry) => {
      entry.thread.stopped = true;
      entry.done = true;
    });
    (sprite._cloneHatThreads || []).forEach((entry) => {
      entry.thread.stopped = true;
      entry.done = true;
    });
    (sprite._foreverThreads || []).forEach((thread) => {
      thread.stopped = true;
    });
    if (sprite._hatThread) sprite._hatThread.stopped = true;
    if (sprite._flowLegacy) sprite._flowLegacy.stopped = true;
  });
}

export function stopOtherScriptsOnSprite(sprite, currentThread) {
  (sprite._greenFlagThreads || []).forEach((entry) => {
    if (entry.thread !== currentThread) entry.thread.stopped = true;
  });
  (sprite._cloneHatThreads || []).forEach((entry) => {
    if (entry.thread !== currentThread) entry.thread.stopped = true;
  });
  (sprite._foreverThreads || []).forEach((thread) => {
    if (thread !== currentThread) thread.stopped = true;
  });
  if (sprite._hatThread && sprite._hatThread !== currentThread) {
    sprite._hatThread.stopped = true;
  }
}

export function stopThisScript(thread, sprite) {
  if (thread) {
    thread.stopped = true;
    return;
  }
  if (sprite._flowLegacy) sprite._flowLegacy.stopped = true;
  sprite._stopScript = true;
}
