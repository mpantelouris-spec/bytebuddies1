import {
  collectLoopBody,
  loopStateFor,
  clearLoopState,
  createScriptThread,
  getFlowContext,
  setWaitSeconds,
  stopAllScriptThreads,
  stopOtherScriptsOnSprite,
} from '../src/utils/controlFlowRuntime.js';
import {
  buildScriptChains,
  createThread,
  initGreenFlagThreads,
  resetSpriteThreads,
  startCloneHatThreads,
  stepThread,
} from '../src/utils/spriteScriptRunner.js';

describe('controlFlowRuntime', () => {
  test('collectLoopBody stops at loop-end-loop', () => {
    const body = [
      { type: 'loop-repeat', params: { times: 3 } },
      { type: 'control-wait', params: { secs: 1 } },
      { type: 'sprite-move', params: { steps: 5 } },
      { type: 'loop-end-loop' },
      { type: 'sprite-move', params: { steps: 1 } },
    ];
    const { loopBody, endIndex } = collectLoopBody(body, 0);
    expect(loopBody.map((b) => b.type)).toEqual(['control-wait', 'sprite-move']);
    expect(endIndex).toBe(3);
  });

  test('wait uses per-thread waitEndTime', () => {
    const thread = createScriptThread([]);
    const now = 1000;
    setWaitSeconds(thread, 0.5, now);
    expect(thread.waitEndTime).toBe(1500);
  });

  test('stop other scripts leaves current thread running', () => {
    const sprite = { id: 's1', name: 'Cat' };
    resetSpriteThreads(sprite);
    const a = createThread([{ type: 'control-wait' }]);
    const b = createThread([{ type: 'control-wait' }]);
    sprite._greenFlagThreads = [
      { thread: a, done: false },
      { thread: b, done: false },
    ];
    stopOtherScriptsOnSprite(sprite, a);
    expect(a.stopped).toBeFalsy();
    expect(b.stopped).toBe(true);
  });

  test('stop all marks every thread stopped', () => {
    const sprite = {
      id: 's1',
      _greenFlagThreads: [{ thread: createThread([]), done: false }],
      _foreverThreads: [createThread([])],
    };
    stopAllScriptThreads([sprite]);
    expect(sprite._greenFlagThreads[0].thread.stopped).toBe(true);
    expect(sprite._foreverThreads[0].stopped).toBe(true);
  });
});

describe('clone hat threads', () => {
  test('original does not get clone hat threads; clone does', () => {
    const original = {
      id: 'orig',
      name: 'Cat',
      isClone: false,
      blocks: [
        { id: 1, type: 'event-start', stackOrder: 0 },
        { id: 2, type: 'event-clone', stackOrder: 1 },
        { id: 3, type: 'sprite-move', stackOrder: 2, params: { steps: '1' } },
      ],
    };
    const clone = {
      id: 'clone1',
      name: 'Cat',
      isClone: true,
      blocks: original.blocks.map((b) => ({ ...b })),
    };
    const chains = buildScriptChains('clone1', [clone]);
    expect(chains.some((c) => c.trigger.type === 'event-clone')).toBe(true);
    resetSpriteThreads(clone);
    startCloneHatThreads(clone, [clone]);
    expect(clone._cloneHatThreads).toHaveLength(1);
    expect(clone._cloneHatThreads[0].thread.body[0].type).toBe('sprite-move');

    resetSpriteThreads(original);
    initGreenFlagThreads(original, buildScriptChains('orig', [original]));
    expect(original._greenFlagThreads).toHaveLength(1);
    expect(original._greenFlagThreads[0].chain.trigger.type).toBe('event-start');
  });

  test('cooperative wait pauses and resumes thread', () => {
    const sprite = { id: 's1', name: 'Cat' };
    resetSpriteThreads(sprite);
    const thread = createThread([
      { type: 'control-wait', params: { secs: 1 } },
      { type: 'sprite-move', params: { steps: '10' } },
    ]);
    let moved = false;
    const execBody = (body, sp, pc, th) => {
      const flow = getFlowContext(sp, th);
      if (flow.waitEndTime != null && Date.now() < flow.waitEndTime) return pc;
      for (let i = pc; i < body.length; i++) {
        const blk = body[i];
        if (blk.type === 'control-wait') {
          if (flow.waitEndTime != null) {
            flow.waitEndTime = null;
            continue;
          }
          setWaitSeconds(flow, blk.params.secs, Date.now());
          return i;
        }
        if (blk.type === 'sprite-move') moved = true;
      }
      return false;
    };
    const paused = stepThread(thread, sprite, execBody);
    expect(paused).toBe(true);
    expect(moved).toBe(false);
    thread.waitEndTime = Date.now() - 1;
    stepThread(thread, sprite, execBody);
    expect(moved).toBe(true);
  });
});

describe('collectLoopBody — nesting', () => {
  const B = (type) => ({ type });
  it('keeps an inner loop and the blocks after it inside the outer loop', () => {
    // repeat { repeat { move } end; turn } end; say
    const body = [B('loop-repeat'), B('loop-repeat'), B('sprite-move'), B('loop-end-loop'), B('sprite-turn-right'), B('loop-end-loop'), B('sprite-say')];
    const { loopBody, endIndex } = collectLoopBody(body, 0);
    expect(loopBody.map((b) => b.type)).toEqual(['loop-repeat', 'sprite-move', 'loop-end-loop', 'sprite-turn-right']);
    expect(endIndex).toBe(5);
  });
  it('treats broadcast as a normal step, not a new script', () => {
    const body = [B('loop-forever'), B('event-broadcast'), B('sprite-move'), B('loop-end-loop')];
    expect(collectLoopBody(body, 0).loopBody.map((b) => b.type)).toEqual(['event-broadcast', 'sprite-move']);
  });
  it('still stops at a hat block that starts another script', () => {
    const body = [B('loop-repeat'), B('sprite-move'), B('event-keypress'), B('sprite-turn-right')];
    expect(collectLoopBody(body, 0).loopBody.map((b) => b.type)).toEqual(['sprite-move']);
  });
});

describe('loopStateFor — one state per loop block', () => {
  it('keeps outer and inner loop progress apart', () => {
    const host = {};
    const outer = { type: 'loop-repeat' };
    const inner = { type: 'loop-repeat' };
    loopStateFor(host, outer).iteration = 2;
    loopStateFor(host, inner).iteration = 5;
    expect(loopStateFor(host, outer).iteration).toBe(2);
    clearLoopState(host, inner);
    expect(loopStateFor(host, inner).iteration).toBe(0);
    expect(loopStateFor(host, outer).iteration).toBe(2);
  });
});

describe('loopStateFor — clones', () => {
  it('a copied sprite (clone) never shares its parent\'s loop state', () => {
    const parent = {};
    const loop = { type: 'loop-repeat' };
    loopStateFor(parent, loop).iteration = 60;
    const clone = { ...parent };
    expect(loopStateFor(clone, loop).iteration).toBe(0);
  });
});
