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

/**
 * Collect nested blocks after a loop header until loop-end-loop or sibling loop/hat.
 */
export function collectLoopBody(body, startIndex) {
  const loopBody = [];
  let j = startIndex + 1;
  while (j < body.length) {
    const b = body[j];
    if (b.type === 'loop-end-loop') {
      j++;
      break;
    }
    if (
      b.type.startsWith('event-')
      || b.type === 'loop-repeat'
      || b.type === 'loop-forever'
      || b.type === 'loop-while'
      || b.type === 'loop-foreach'
      || b.type === 'control-repeat-until'
    ) {
      break;
    }
    loopBody.push(b);
    j++;
  }
  return { loopBody, endIndex: j - 1, nextIndex: j };
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
