/**
 * Integration test: script ref → flatten → block execution semantics
 */
import { parseEventScript, flattenHandlerBlocks } from '../src/virtual-robot-designer/data/flappy-starter-script.js';

const SAMPLE_SCRIPT = [
  { id: 'when_spacebar', _uid: 'f0', paramValues: {} },
  { id: 'flap', _uid: 'f2', paramValues: {} },
  { id: 'wait', _uid: 'f3', paramValues: { seconds: 0.4 } },
];

function extractBlocks(custom) {
  const handlers = parseEventScript(custom);
  return flattenHandlerBlocks(handlers.start, { foreverReps: 6 });
}

function extractSpacebarBlocks(custom) {
  const handlers = parseEventScript(custom);
  return flattenHandlerBlocks(handlers.spacebar, { foreverReps: 1 });
}

let customScriptRef = [];
function syncScriptRef(next) { customScriptRef = next; }
function commit(next) { syncScriptRef(next); }

commit([...SAMPLE_SCRIPT]);
const spaceActs = extractSpacebarBlocks(customScriptRef);
if (spaceActs.length < 1) throw new Error(`expected spacebar handler blocks, got ${spaceActs.length}`);
if (spaceActs[0].id !== 'flap') throw new Error(`first spacebar block should be flap, got ${spaceActs[0].id}`);

const acts = extractBlocks(customScriptRef);
if (acts.length !== 0) throw new Error('start handler should be empty');

const scene = { userData: { flappyMode: true, flap: () => { scene._flapCalls = (scene._flapCalls || 0) + 1; } } };
const rs = { step: 0, stepTime: 0, currentDur: 0.12, _blockFired: false };

function applyFlap(block, rs, scene) {
  if (!rs._blockFired && rs.stepTime < 0.1) {
    scene.userData.flap?.(1);
    rs._blockFired = true;
  }
}

applyFlap(spaceActs[0], rs, scene);
applyFlap(spaceActs[0], { ...rs, stepTime: 0.05 }, scene);
if (scene._flapCalls !== 1) throw new Error(`flap should fire once per block step, got ${scene._flapCalls}`);

commit([]);
if (extractBlocks(customScriptRef).length !== 0) throw new Error('empty script should yield no start blocks');
if (extractSpacebarBlocks(customScriptRef).length !== 0) throw new Error('empty script should yield no spacebar blocks');

console.log('OK live-lab block execution pipeline');
