/**
 * Execute every flappy scratch block through compile + runtime.
 * Run: node scripts/test-flappy-block-runtime.mjs
 */
import { FLAPPY_BLOCK_ACTION_MAP } from '../src/virtual-robot-designer/data/flappy-bird-blocks.js';
import { compileFlappyScratchScript, FlappyBlockRuntime } from '../src/virtual-robot-designer/data/flappy-block-runtime.js';

const EVENT_HATS = new Set(['when_start', 'when_spacebar', 'when_collision', 'when_gap_passed', 'when_game_over']);
const STRUCTURAL = new Set(['if_then', 'if_else', 'if_gt', 'if_lt', 'if_eq', 'repeat', 'forever', 'repeat_until', 'break_loop']);

const calls = [];
const mockScene = {
  userData: {
    flappyMode: true,
    flap: (n) => calls.push(['flap', n]),
    setFlapStrength: (n) => calls.push(['setFlapStrength', n]),
    setGravityStrength: (n) => calls.push(['setGravityStrength', n]),
    setScrollSpeed: (n) => calls.push(['setScrollSpeed', n]),
    freezeBird: () => calls.push(['freezeBird']),
    moveBirdBy: (n) => calls.push(['moveBirdBy', n]),
    setBirdHeight: (n) => calls.push(['setBirdHeight', n]),
    setShowScoreHud: (v) => calls.push(['setShowScoreHud', v]),
    showFlappyMessage: (t) => calls.push(['showFlappyMessage', t]),
    playFlappySound: (s) => calls.push(['playFlappySound', s]),
    pauseFlappyGame: (s) => calls.push(['pauseFlappyGame', s]),
    restartFlappyGame: () => calls.push(['restartFlappyGame']),
    getFlappySensors: () => ({ score: 1, highScore: 2, birdHeight: 5, distanceToPipe: 3, gapCenterHeight: 6, isFalling: false }),
    getFlappyState: () => ({ crashed: false, awaitingRestart: false }),
  },
};

const defaults = {
  strength: 6, speed: 4, units: 2, height: 9, seconds: 0.5, text: 'Go!', sound: 'beep', name: 'score', value: 3,
};

let tested = 0;
for (const id of Object.keys(FLAPPY_BLOCK_ACTION_MAP)) {
  if (EVENT_HATS.has(id) || STRUCTURAL.has(id) || id === 'restart_game') continue;
  const script = [
    { id: 'when_start', _uid: 'hat', paramValues: {} },
    { id, _uid: 'blk', paramValues: { ...defaults } },
  ];
  const prog = compileFlappyScratchScript(script);
  const rt = new FlappyBlockRuntime(prog, mockScene, () => {});
  rt.runEvent('start');
  tested += 1;
}

if (tested < 10) throw new Error(`expected at least 10 flappy blocks tested, got ${tested}`);
console.log(`OK — compiled and ran ${tested} flappy blocks (${calls.length} scene calls)`);
